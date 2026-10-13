var e=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Session protection"><rect x="30" y="70" width="90" height="44" rx="8" fill="#bae6fd"/><text x="75" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><rect x="260" y="70" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="305" y="97" text-anchor="middle" class="svg-ink" font-size="14">R2</text><rect x="260" y="140" width="90" height="36" rx="8" fill="#fde68a"/><text x="305" y="163" text-anchor="middle" class="svg-ink" font-size="13">R3</text><line x1="120" y1="92" x2="260" y2="92" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4"/><text x="190" y="84" text-anchor="middle" class="svg-muted" font-size="12">`+t+`</text><path d="M95 114 Q95 158 260 158" fill="none" stroke="#0ea5e9" stroke-width="2"/><path d="M350 158 Q480 158 480 114 Q480 92 350 92" fill="none" stroke="#0ea5e9" stroke-width="2"/><text x="500" y="100" class="svg-accent" font-size="12">`+n+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`protection-and-hardening`,h:{en:`LDP session protection, graceful restart, MTU and label filtering`,hi:`LDP session protection, graceful restart, MTU aur label filtering`},body:{en:`
<p>A production MPLS core needs more than the basic LDP session. This chapter covers the features around LDP that keep labels alive during failures and keep the label table small and safe. The simulator does not implement them, so everything below is <b>conceptual teaching with reference configuration</b>. The only real output is the timer table, which was captured earlier.</p>

<h3>LDP session protection</h3>
<p>When a link between two routers fails, the directly connected LDP session goes down, and all labels learned over it are removed. When the link returns, the session and labels must be rebuilt from scratch, which can take many seconds on a big router. During that time labelled traffic is lost or rerouted.</p>
<p><b>Session protection</b> keeps the session up over another path. The router also sends <b>targeted hellos</b> (unicast, to the neighbour's LDP ID) and forms a second adjacency. When the direct link fails, the targeted adjacency keeps the TCP session and the labels alive, as long as any IP path to the neighbour exists. When the link comes back, labels are already there. The <code>show mpls ldp parameters</code> output lists the targeted hello timers:</p>
<pre class="out">PE1# show mpls ldp parameters
Discovery hello: holdtime: 15 sec; interval: 5 sec
Discovery targeted hello: holdtime: 90 sec; interval: 10 sec</pre>
<pre class="code"><span class="c">! Reference configuration</span>
mpls ldp session protection
<span class="c">! optionally limit it with an ACL and a duration</span>
mpls ldp session protection for LDP-PEERS duration 300</pre>
@@D@@

<h3>Graceful restart and NSF</h3>
<p>With <b>LDP graceful restart</b> a neighbour keeps forwarding with the old labels for a configured time while a router restarts its LDP process or switches its route processor. Together with IS-IS NSF/graceful restart, the control plane can restart while the data plane keeps moving packets. Reference configuration:</p>
<pre class="code"><span class="c">! Reference configuration</span>
mpls ldp graceful-restart</pre>

<h3>Faster failure detection</h3>
<p>The LDP keepalive is 60 seconds and the hold time 180 seconds (see the parameters output). Link failures are detected earlier through the interface, IS-IS (BFD for IS-IS) and the sync mechanism. With <b>BFD for IS-IS</b> the IGP converges in tens of milliseconds, and LDP follows the new best path using the labels it already learned (liberal retention), which makes the LFIB update quick.</p>

<h3>MTU and TTL</h3>
<ul>
<li><b>MPLS MTU.</b> Each label adds 4 bytes. A VPN packet carries two labels (8 bytes). If the link MTU is 1500 and the customer sends 1500 bytes, the labelled packet is 1508 and the router must fragment or drop. SP cores raise the interface MTU (or <code>mpls mtu</code>) to fit the largest stack, typically 1600 or more. A path-MTU black hole appears as pings that work for small sizes and fail for big ones.</li>
<li><b>TTL propagation.</b> By default the IP TTL is copied into the label TTL at ingress, so traceroute shows every core hop (as in the lab). Providers often hide the core from customers with <code>no mpls ip propagate-ttl</code> (forwarded traffic only), which makes the core appear as one hop.</li>
</ul>

<h3>Controlling which labels are created</h3>
<p>By default LDP allocates a label for <b>every</b> IGP prefix, including connected networks. In a BGP-free core only the PE loopbacks (/32) matter. Filtering reduces label memory and speeds convergence. You can see in the lab that even customer LAN prefixes receive labels:</p>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
18         21         192.168.2.0/24   0             Gi0/1      10.0.12.2
21         18         10.0.255.4/32    0             Gi0/1      10.0.12.2</pre>
<pre class="code"><span class="c">! Reference configuration: allocate labels only for loopbacks</span>
ip prefix-list LOOPBACKS seq 5 permit 10.0.255.0/24 ge 32
mpls ldp label
 allocate global prefix-list LOOPBACKS</pre>
<p>Combined with a good addressing plan (all PE loopbacks in one block), this is a typical SP optimization. In a VPN design only the PE loopbacks need LSPs, because those are the BGP next hops.</p>

<div class="eg"><p><b>Worked example: MTU.</b> Customer sends 1500-byte IP packets through an L3VPN with two labels. Needed MTU on core links = 1500 + 8 (labels) = 1508, plus Layer 2 headers if the platform counts them. A core MTU of 1600 leaves headroom for a third label (fast reroute) or a pseudowire control word.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Turning on session protection and assuming it also protects the IGP: it only protects LDP state. Forgetting to raise MTU, so small pings pass and large transfers hang. Filtering label allocation but forgetting that a VPN needs an LSP to every PE loopback.</p></div>
<div class="exam"><p><b>Exam trap.</b> Session protection uses <i>targeted</i> hellos; basic discovery uses link hellos to 224.0.0.2. It protects the LDP session, not the data path. The label stack adds 4 bytes per label.</p></div>

<div class="scn"><h4>Pings pass, downloads hang</h4><p>After moving a customer to MPLS VPN, small pings worked but file transfers stalled. The core links were left at 1500 MTU and the two-label stack pushed full-size packets over the limit. Raising the core MTU to 1600 fixed it at once.</p><p><b>Lesson:</b> when "small works, big fails" appears after enabling MPLS, check MTU first.</p></div>

<div class="iv"><p class="q">"How can an LDP session survive a link failure?"</p><p>With LDP session protection. Targeted hellos form a second adjacency to the neighbour over any IP path, so when the direct link fails the TCP session and labels stay. When the link returns, forwarding resumes with the labels already present. LDP graceful restart and BFD for fast detection complete the picture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Session protection uses targeted hellos to keep the session alive over another path.</li>
<li>Graceful restart keeps forwarding while LDP restarts.</li>
<li>Each label adds 4 bytes; raise the core MTU.</li>
<li>no mpls ip propagate-ttl hides core hops from customers.</li>
<li>Filter label allocation to loopbacks to keep the LFIB small.</li>
</ul></div>
`.replace(`@@D@@`,e(`When the direct link fails, the targeted session over R3 keeps labels alive.`,`direct link down`,`targeted session over R3`)),hi:`
<p>Production MPLS core ko basic LDP session se zyada chahiye. Is chapter mein LDP ke aas-paas ke features hain jo failures ke dauraan labels ko zinda rakhte hain aur label table ko chhoti aur safe rakhte hain. Simulator inhe implement nahi karta, isliye neeche sab kuch <b>conceptual teaching aur reference configuration</b> hai. Ek hi real output timer table hai, jo pehle capture kiya gaya tha.</p>

<h3>LDP session protection</h3>
<p>Jab do routers ke beech link fail hota hai, directly connected LDP session gir jaata hai, aur uspar seekhe saare labels hat jaate hain. Link wapas aane par session aur labels zero se banane padte hain, jo bade router par kai seconds le sakta hai. Us dauraan labelled traffic kho jaata hai ya reroute hota hai.</p>
<p><b>Session protection</b> session ko doosre path par zinda rakhta hai. Router <b>targeted hellos</b> (unicast, neighbour ke LDP ID ko) bhi bhejta hai aur doosri adjacency banata hai. Direct link fail ho to targeted adjacency TCP session aur labels ko zinda rakhti hai, jab tak neighbour tak koi bhi IP path ho. Link wapas aane par labels pehle se maujood hote hain. <code>show mpls ldp parameters</code> output targeted hello timers dikhata hai:</p>
<pre class="out">PE1# show mpls ldp parameters
Discovery hello: holdtime: 15 sec; interval: 5 sec
Discovery targeted hello: holdtime: 90 sec; interval: 10 sec</pre>
<pre class="code"><span class="c">! Reference configuration</span>
mpls ldp session protection
<span class="c">! ACL aur duration se limit kar sakte ho</span>
mpls ldp session protection for LDP-PEERS duration 300</pre>
@@D@@

<h3>Graceful restart aur NSF</h3>
<p><b>LDP graceful restart</b> ke saath neighbour configured time tak purane labels se forward karta rehta hai jab router LDP process restart karta hai ya route processor switch karta hai. IS-IS NSF/graceful restart ke saath control plane restart ho sakta hai jabki data plane packets chalata rehta hai. Reference configuration:</p>
<pre class="code"><span class="c">! Reference configuration</span>
mpls ldp graceful-restart</pre>

<h3>Failure detection tez karna</h3>
<p>LDP keepalive 60 seconds aur hold time 180 seconds hai (parameters output dekho). Link failures pehle interface, IS-IS (BFD for IS-IS) aur sync mechanism se detect hote hain. <b>BFD for IS-IS</b> ke saath IGP kuch tens of milliseconds mein converge karta hai, aur LDP naye best path ko un labels se follow karta hai jo woh pehle seekh chuka hai (liberal retention), jisse LFIB update jaldi hota hai.</p>

<h3>MTU aur TTL</h3>
<ul>
<li><b>MPLS MTU.</b> Har label 4 bytes jodta hai. VPN packet do labels (8 bytes) le jaata hai. Link MTU 1500 ho aur customer 1500 bytes bheje to labelled packet 1508 hota hai aur router fragment ya drop karega. SP cores interface MTU (ya <code>mpls mtu</code>) badhate hain taaki sabse bada stack fit ho, aam taur par 1600 ya zyada. Path-MTU black hole aise dikhta hai: chhote sizes ke pings chalte hain aur bade fail.</li>
<li><b>TTL propagation.</b> Default mein IP TTL ingress par label TTL mein copy hota hai, isliye traceroute har core hop dikhata hai (jaise lab mein). Providers aksar core ko customers se chhupane ke liye <code>no mpls ip propagate-ttl</code> (sirf forwarded traffic) lagate hain, jisse core ek hop dikhta hai.</li>
</ul>

<h3>Kaunse labels bante hain, yeh control karna</h3>
<p>Default mein LDP <b>har</b> IGP prefix ke liye label allocate karta hai, connected networks bhi. BGP-free core mein sirf PE loopbacks (/32) matter karte hain. Filtering label memory kam karti hai aur convergence tez. Lab mein dekh sakte ho ki customer LAN prefixes ko bhi labels milte hain:</p>
<pre class="out">PE1# show mpls forwarding-table
Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
18         21         192.168.2.0/24   0             Gi0/1      10.0.12.2
21         18         10.0.255.4/32    0             Gi0/1      10.0.12.2</pre>
<pre class="code"><span class="c">! Reference configuration: sirf loopbacks ke liye labels allocate karo</span>
ip prefix-list LOOPBACKS seq 5 permit 10.0.255.0/24 ge 32
mpls ldp label
 allocate global prefix-list LOOPBACKS</pre>
<p>Achhe addressing plan (saare PE loopbacks ek block mein) ke saath yeh typical SP optimization hai. VPN design mein sirf PE loopbacks ko LSPs chahiye, kyunki wahi BGP next hops hain.</p>

<div class="eg"><p><b>Worked example: MTU.</b> Customer 1500-byte IP packets L3VPN se do labels ke saath bhejta hai. Core links par chahiye MTU = 1500 + 8 (labels) = 1508, plus Layer 2 headers agar platform ginta hai. Core MTU 1600 teesre label (fast reroute) ya pseudowire control word ke liye headroom deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Session protection on karke maanna ki woh IGP ko bhi protect karta hai: woh sirf LDP state protect karta hai. MTU badhana bhoolna, isliye chhote pings chalte hain aur bade transfers atakte hain. Label allocation filter karna par bhoolna ki VPN ko har PE loopback tak LSP chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Session protection <i>targeted</i> hellos use karta hai; basic discovery 224.0.0.2 ko link hellos use karti hai. Yeh LDP session protect karta hai, data path nahi. Label stack har label par 4 bytes jodta hai.</p></div>

<div class="scn"><h4>Ping pass, download hang</h4><p>Customer ko MPLS VPN par le jaane ke baad chhote pings chale par file transfers atak gaye. Core links 1500 MTU par chhode gaye the aur do-label stack ne full-size packets ko limit ke paar kar diya. Core MTU 1600 karne se turant fix ho gaya.</p><p><b>Lesson:</b> MPLS enable karne ke baad "chhota chalta hai, bada fail" dikhe to pehle MTU check karo.</p></div>

<div class="iv"><p class="q">"LDP session link failure se kaise bach sakta hai?"</p><p>LDP session protection se. Targeted hellos kisi bhi IP path par neighbour ke saath doosri adjacency banate hain, isliye direct link fail hone par TCP session aur labels bane rehte hain. Link wapas aane par forwarding pehle se maujood labels se resume hoti hai. LDP graceful restart aur fast detection ke liye BFD picture poori karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Session protection targeted hellos se session ko doosre path par zinda rakhta hai.</li>
<li>Graceful restart LDP restart ke dauraan forwarding chalu rakhta hai.</li>
<li>Har label 4 bytes jodta hai; core MTU badhao.</li>
<li>no mpls ip propagate-ttl customers se core hops chhupata hai.</li>
<li>LFIB chhota rakhne ke liye label allocation loopbacks tak filter karo.</li>
</ul></div>
`.replace(`@@D@@`,e(`Direct link fail hone par R3 ke raaste targeted session labels zinda rakhta hai.`,`direct link down`,`R3 ke raaste targeted session`))}};export{t as default};