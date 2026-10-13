var e={id:`troubleshooting-rp`,h:{en:`Troubleshooting workflow: wrong RP, unreachable RP, missing agent or BSR`,hi:`Troubleshooting workflow: galat RP, unreachable RP, missing agent ya BSR`},body:{en:`
<p>RP faults have a nasty habit: every link is up, every PIM neighbour is up, OSPF is full, and yet the stream does not arrive. The fault lives in <i>what routers believe</i> about the RP. A fixed method turns a vague "IPTV is down" into a short list of checks. Follow the same order every time.</p>

<h3>The six-step method</h3>
<ol>
<li><b>Does the router nearest to the receiver have an RP for the group?</b> <code>show ip pim rp mapping</code> and look at the <code>(*,G)</code> in <code>show ip mroute &lt;group&gt;</code>. <code>RP 0.0.0.0</code> or an empty mapping means no RP.</li>
<li><b>Is it the <i>same</i> RP on every router?</b> Run the same command on the first-hop router, the RP, and two routers between them. A difference points to a static line on one router, an <code>override</code>, a learned mapping that stopped, or a different ACL.</li>
<li><b>Where did the learning stop?</b> For Auto-RP and BSR, go along the path from the agent (or the BSR) towards the failing router and find the <i>first</i> router that does not know the mapping. The fault is on that router or on the link before it.</li>
<li><b>Can every router reach the RP address?</b> <code>show ip route &lt;rp&gt;</code> must show a route, and <code>ping &lt;rp&gt;</code> must work. If the RP loopback is not in the IGP, nothing else matters: joins, registers and, for BSR, the C-RP advertisements cannot reach it.</li>
<li><b>Does the tree point the right way?</b> In <code>show ip mroute</code>, check that the <code>(*,G)</code> has the right RP, an incoming interface that matches the unicast path to the RP, and a non-empty outgoing list. If the incoming interface is <code>Null</code> on a router that is not the RP, check RPF and PIM on the link.</li>
<li><b>Anycast only: is MSDP up and is the SA cached?</b> <code>show ip msdp summary</code> must say Up and <code>show ip msdp sa-cache</code> must list the source on the RP that has the receivers.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="RP troubleshooting flow">
<rect x="20" y="15" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="39" text-anchor="middle" class="svg-ink" font-size="13">1 RP known at the receiver router?</text>
<rect x="20" y="68" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="92" text-anchor="middle" class="svg-ink" font-size="13">2 Same RP on every router?</text>
<rect x="20" y="121" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="145" text-anchor="middle" class="svg-ink" font-size="13">3 Where did the mapping stop?</text>
<rect x="20" y="174" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="198" text-anchor="middle" class="svg-ink" font-size="13">4 Is the RP address reachable?</text>
<rect x="20" y="227" width="260" height="28" rx="8" fill="#bae6fd"/><text x="150" y="246" text-anchor="middle" class="svg-ink" font-size="13">5 mroute: RP, iif, OIL   6 MSDP</text>
<text x="310" y="38" class="svg-muted" font-size="12">no: static line, listener, BSR / agent missing, scope</text>
<text x="310" y="91" class="svg-muted" font-size="12">no: override, different ACL, two agents, two BSRs</text>
<text x="310" y="144" class="svg-muted" font-size="12">first router that lacks it: listener, PIM link, RPF</text>
<text x="310" y="197" class="svg-muted" font-size="12">no: RP loopback not in the IGP, link down</text>
<text x="310" y="246" class="svg-muted" font-size="12">Null iif, empty OIL, SA missing</text>
</svg><p class="cap">Six checks, always in this order; each one has a typical cause on the right.</p></div>

<h3>Typical faults and their fingerprints</h3>
<table class="cmp"><tr><th>Symptom</th><th>Fingerprint</th><th>Cause family</th></tr>
<tr><td>Agent has the mapping, far routers have an empty one</td><td>Auto-RP learns up to one router and stops</td><td>Missing listener, scope too small, link without PIM</td></tr>
<tr><td>No router has a mapping</td><td>Even the agent is empty</td><td>Announce did not reach the agent: scope, listener on the candidate RP side, candidate interface down</td></tr>
<tr><td>Routers disagree on the BSR</td><td><code>show ip pim bsr-router</code> shows different addresses</td><td>Link without PIM or RPF break splitting the flood</td></tr>
<tr><td>BSR is fine, one RP is missing from the set</td><td>RP-set lacks a candidate</td><td>C-RP loopback not reachable from the BSR</td></tr>
<tr><td>Mapping is there but the stream is not</td><td>RP shows in the mapping but <code>show ip route</code> has no route to it</td><td>RP address not in the IGP</td></tr>
<tr><td>One city only</td><td>Different RP on that router</td><td>Override or an old static line</td></tr>
<tr><td>Anycast: receivers in one site get nothing</td><td>MSDP down or empty SA cache</td><td>MSDP peer on anycast address, no route between unique addresses</td></tr>
</table>

<h3>A worked diagnosis: the Bengaluru branch (lab mq-rp-failure)</h3>
<p>Bharat Retail's training channel does not reach Bengaluru. The design uses Auto-RP with the candidate RP on R2 (Pune) and the mapping agent on R3 (Nagpur). There are two independent faults. Do not fix anything yet, only <i>observe</i>.</p>
<p><b>Step 1 and 3.</b> On R4 (Hyderabad), the router before Bengaluru:</p>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

R4#</pre>
<p>Empty. On the agent R3, the same command prints the mapping and says <code>This system is an RP-mapping agent</code>. So the mapping exists at the source of the information and is missing on R4, the first router after R3 on the way to Bengaluru. R5 will be empty as well, but R5 is not where the loss happens. You compare what R3 and R4 differ in. A <code>show running-config | include pim</code> on both shows one extra global line on R3 that R4 does not have. Think about chapter 3: which dense groups must a router be told to carry, and what does a router that was not told do with them?</p>
<p>That is fault number one. You apply your fix and re-check R4 and R5: now the mapping appears on both. The task is not finished.</p>
<p><b>Step 4.</b> The mapping on R5 now names the RP, 2.2.2.2, but the receiver still gets nothing:</p>
<pre class="out">R5#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP

R5#show ip route 2.2.2.2
% Network not in table

R5#show ip mroute 239.10.1.1
Group 239.10.1.1 not found</pre>
<p>Now the message is different. R5 <i>knows</i> the RP but has <b>no route</b> to it. The question moves from "who tells the routers" to "who advertises the RP address". Which router owns 2.2.2.2, and what does its OSPF configuration cover? Compare the <code>network</code> statements with the addresses on that router. Again you fix one thing, re-check <code>show ip route 2.2.2.2</code> on every router, and only then test delivery. If you had tested delivery after the first fix, you would have concluded that the first fix did not work, which is wrong: it worked, and the second fault was hiding behind it.</p>
<div class="note"><p>This is why you re-run the <i>whole</i> method after every fix. A multicast path has many dependencies; clearing one can reveal the next.</p></div>

<h3>Useful extra tools</h3>
<ul>
<li><code>ping &lt;group&gt;</code> from a router that joined with <code>ip igmp join-group</code> tests the tree without a real application.</li>
<li><code>show ip pim neighbor</code> and <code>show ip pim interface</code> prove the PIM links; <code>show ip rpf &lt;rp&gt;</code> proves the direction of the shared tree.</li>
<li>In the lab host shell: <code>join G</code> on the receiver, <code>mcast G 5</code> on the source, <code>show mcast</code> to read the counters.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the RP with a quick static line and calling it done: the stream works, but the dynamic design is still broken and nobody knows. (2) Testing only the source side. (3) Checking only the RP router: it always looks fine from the inside.</p></div>
<div class="exam"><p><b>Exam trap.</b> "RP shown in the mapping" does not mean "RP reachable". Always follow a mapping with a unicast route check.</p></div>

<div class="scn"><h4>Two sites, two BSRs</h4><p>After a change window at Zenith Logistics the Chennai site could not receive a channel that Mumbai received fine. <code>show ip pim bsr-router</code> showed BSR 1.1.1.1 in Mumbai and BSR 2.2.2.2 in Chennai. A new link between two core routers had been brought up with an IP address but without <code>ip pim sparse-mode</code>, so the Bootstrap flood no longer crossed it and the Chennai routers had elected their own BSR. With PIM enabled on the link both sites elected 1.1.1.1 again.</p><p><b>Lesson:</b> disagreeing BSR addresses mean a broken flood path, not a broken RP.</p></div>

<div class="iv"><p class="q">"The receiver does not get the stream and all PIM neighbours are up. What do you check?"</p><p>Strong answer: the RP, step by step. Is there an RP for the group on the last-hop router? Is it the same RP everywhere? Is the RP address reachable in the routing table? Then the mroute entry (RP, incoming interface, outgoing list) and, for anycast, MSDP and the SA cache. Mention that you re-check everything after each fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Six checks: RP known, same RP, where the learning stopped, RP reachable, mroute state, MSDP.</li>
<li>The first router that lacks the mapping is where the fault is, or the link before it.</li>
<li>A mapping with no route to the RP is a unicast fault, not a multicast fault.</li>
<li>Different BSR addresses on different routers mean a broken Bootstrap flood.</li>
<li>Re-run the method after every fix; one fault can hide another.</li>
</ul></div>
`,hi:`
<p>RP faults ki ek buri aadat hai: har link up hai, har PIM neighbour up hai, OSPF full hai, aur phir bhi stream nahi aati. Fault is baat mein hota hai ki <i>routers RP ke baare mein kya maante hain</i>. Fixed method "IPTV down hai" jaise vague statement ko checks ki chhoti list bana deta hai. Har baar wahi order follow karo.</p>

<h3>Chhe-step method</h3>
<ol>
<li><b>Receiver ke sabse nazdeeki router ke paas group ka RP hai?</b> <code>show ip pim rp mapping</code> aur <code>show ip mroute &lt;group&gt;</code> mein <code>(*,G)</code> dekho. <code>RP 0.0.0.0</code> ya khaali mapping ka matlab RP nahi.</li>
<li><b>Kya har router par <i>same</i> RP hai?</b> Wahi command first-hop router, RP, aur beech ke do routers par chalao. Farak static line, <code>override</code>, ruki hui learned mapping, ya alag ACL ki taraf ishara karta hai.</li>
<li><b>Learning kahan ruki?</b> Auto-RP aur BSR ke liye agent (ya BSR) se failing router ki taraf path par chalo aur <i>pehla</i> router dhoondho jo mapping nahi jaanta. Fault us router par hai ya usse pehle wale link par.</li>
<li><b>Kya har router RP address tak pahunch sakta hai?</b> <code>show ip route &lt;rp&gt;</code> mein route dikhna chahiye, aur <code>ping &lt;rp&gt;</code> kaam karna chahiye. Agar RP loopback IGP mein nahi hai, to baaki kuch matter nahi karta: joins, registers aur BSR ke liye C-RP advertisements uske paas pahunch nahi sakte.</li>
<li><b>Kya tree sahi taraf point karta hai?</b> <code>show ip mroute</code> mein dekho ki <code>(*,G)</code> mein sahi RP ho, incoming interface RP tak ke unicast path se match kare, aur outgoing list khaali na ho. Agar RP na hone wale router par incoming interface <code>Null</code> hai, to RPF aur link par PIM check karo.</li>
<li><b>Sirf anycast: MSDP up hai aur SA cached hai?</b> <code>show ip msdp summary</code> mein Up hona chahiye aur <code>show ip msdp sa-cache</code> mein source us RP par list hona chahiye jiske paas receivers hain.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="RP troubleshooting flow">
<rect x="20" y="15" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="39" text-anchor="middle" class="svg-ink" font-size="13">1 Receiver router par RP pata hai?</text>
<rect x="20" y="68" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="92" text-anchor="middle" class="svg-ink" font-size="13">2 Har router par same RP?</text>
<rect x="20" y="121" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="145" text-anchor="middle" class="svg-ink" font-size="13">3 Mapping kahan ruki?</text>
<rect x="20" y="174" width="260" height="38" rx="8" fill="#bae6fd"/><text x="150" y="198" text-anchor="middle" class="svg-ink" font-size="13">4 RP address reachable hai?</text>
<rect x="20" y="227" width="260" height="28" rx="8" fill="#bae6fd"/><text x="150" y="246" text-anchor="middle" class="svg-ink" font-size="13">5 mroute: RP, iif, OIL   6 MSDP</text>
<text x="310" y="38" class="svg-muted" font-size="12">nahi: static line, listener, BSR / agent missing, scope</text>
<text x="310" y="91" class="svg-muted" font-size="12">nahi: override, alag ACL, do agents, do BSRs</text>
<text x="310" y="144" class="svg-muted" font-size="12">pehla router jisme nahi: listener, PIM link, RPF</text>
<text x="310" y="197" class="svg-muted" font-size="12">nahi: RP loopback IGP mein nahi, link down</text>
<text x="310" y="246" class="svg-muted" font-size="12">Null iif, khaali OIL, SA missing</text>
</svg><p class="cap">Chhe checks, hamesha isi order mein; har ek ka typical kaaran daayi taraf hai.</p></div>

<h3>Typical faults aur unki fingerprints</h3>
<table class="cmp"><tr><th>Symptom</th><th>Fingerprint</th><th>Kaaran ka family</th></tr>
<tr><td>Agent ke paas mapping hai, door ke routers khaali</td><td>Auto-RP ek router tak seekhta hai aur ruk jaata hai</td><td>Listener missing, scope bahut chhota, PIM-rahit link</td></tr>
<tr><td>Kisi router ke paas mapping nahi</td><td>Agent bhi khaali</td><td>Announce agent tak nahi pahunchi: scope, candidate RP side par listener, candidate interface down</td></tr>
<tr><td>Routers BSR par disagree karte hain</td><td><code>show ip pim bsr-router</code> alag addresses dikhata hai</td><td>PIM-rahit link ya RPF break flood ko split kar raha hai</td></tr>
<tr><td>BSR theek, ek RP set se gayab</td><td>RP-set mein ek candidate nahi</td><td>C-RP loopback BSR se reachable nahi</td></tr>
<tr><td>Mapping hai par stream nahi</td><td>RP mapping mein dikhta hai par <code>show ip route</code> mein uska route nahi</td><td>RP address IGP mein nahi</td></tr>
<tr><td>Sirf ek city</td><td>Us router par alag RP</td><td>Override ya purani static line</td></tr>
<tr><td>Anycast: ek site ke receivers ko kuch nahi</td><td>MSDP down ya khaali SA cache</td><td>MSDP peer anycast address par, unique addresses ke beech route nahi</td></tr>
</table>

<h3>Ek worked diagnosis: Bengaluru branch (lab mq-rp-failure)</h3>
<p>Bharat Retail ka training channel Bengaluru nahi pahunchta. Design Auto-RP use karta hai, candidate RP R2 (Pune) par aur mapping agent R3 (Nagpur) par. Do independent faults hain. Abhi kuch fix mat karo, sirf <i>observe</i> karo.</p>
<p><b>Step 1 aur 3.</b> R4 (Hyderabad) par, jo Bengaluru se pehla router hai:</p>
<pre class="out">R4#show ip pim rp mapping
PIM Group-to-RP Mappings

R4#</pre>
<p>Khaali. Agent R3 par wahi command mapping print karta hai aur <code>This system is an RP-mapping agent</code> kehta hai. Matlab mapping information ke source par maujood hai aur R4 par missing hai, jo Bengaluru ke raaste mein R3 ke baad pehla router hai. R5 bhi khaali hoga, par loss R5 par nahi hota. Aap dekhte ho ki R3 aur R4 mein kya alag hai. Dono par <code>show running-config | include pim</code> R3 par ek extra global line dikhata hai jo R4 par nahi hai. Chapter 3 ke baare mein socho: router ko kaunse dense groups carry karne ke liye batana padta hai, aur jise nahi bataya gaya woh unka kya karta hai?</p>
<p>Yeh fault number ek hai. Aap apna fix lagate ho aur R4 aur R5 dobara check karte ho: ab mapping dono par aa jaati hai. Task poora nahi hua.</p>
<p><b>Step 4.</b> R5 par mapping ab RP, 2.2.2.2, ka naam leti hai, lekin receiver ko abhi bhi kuch nahi milta:</p>
<pre class="out">R5#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 224.0.0.0/4
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP

R5#show ip route 2.2.2.2
% Network not in table

R5#show ip mroute 239.10.1.1
Group 239.10.1.1 not found</pre>
<p>Ab message alag hai. R5 RP ko <i>jaanta</i> hai par uska <b>route nahi</b> hai. Sawal "routers ko kaun batata hai" se badal kar "RP address kaun advertise karta hai" ho jaata hai. 2.2.2.2 kaunsa router rakhta hai, aur uski OSPF configuration kya cover karti hai? <code>network</code> statements ko us router ke addresses se compare karo. Phir ek cheez fix karo, har router par <code>show ip route 2.2.2.2</code> dobara check karo, aur tabhi delivery test karo. Agar aap pehle fix ke baad delivery test karte, to aap yeh nateeja nikaalte ki pehla fix kaam nahi kiya, jo galat hai: kaam kiya tha, aur doosra fault uske peeche chhupa tha.</p>
<div class="note"><p>Isiliye har fix ke baad aap <i>poora</i> method dobara chalate ho. Multicast path ki bahut dependencies hoti hain; ek saaf karne se agli saamne aa sakti hai.</p></div>

<h3>Kaam ke extra tools</h3>
<ul>
<li><code>ip igmp join-group</code> se join kiye hue router se <code>ping &lt;group&gt;</code> bina real application ke tree test karta hai.</li>
<li><code>show ip pim neighbor</code> aur <code>show ip pim interface</code> PIM links prove karte hain; <code>show ip rpf &lt;rp&gt;</code> shared tree ki direction prove karta hai.</li>
<li>Lab host shell mein: receiver par <code>join G</code>, source par <code>mcast G 5</code>, counters padhne ke liye <code>show mcast</code>.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> (1) RP ko jaldi ek static line se fix karke kaam khatam maan lena: stream chalti hai, par dynamic design toota hua hai aur kisi ko pata nahi. (2) Sirf source side test karna. (3) Sirf RP router check karna: woh andar se hamesha theek dikhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "RP mapping mein dikha" ka matlab "RP reachable" nahi. Mapping ke baad hamesha unicast route check karo.</p></div>

<div class="scn"><h4>Do sites, do BSRs</h4><p>Zenith Logistics mein change window ke baad Chennai site woh channel receive nahi kar pa rahi thi jo Mumbai theek receive kar raha tha. <code>show ip pim bsr-router</code> ne Mumbai mein BSR 1.1.1.1 aur Chennai mein BSR 2.2.2.2 dikhaya. Do core routers ke beech naya link IP address ke saath up kiya gaya tha lekin <code>ip pim sparse-mode</code> ke bina, isliye Bootstrap flood ab use cross nahi karta tha aur Chennai ke routers ne apna BSR elect kar liya tha. Link par PIM enable karne ke baad dono sites ne phir 1.1.1.1 elect kiya.</p><p><b>Seekh:</b> alag BSR addresses ka matlab toota hua flood path hai, toota hua RP nahi.</p></div>

<div class="iv"><p class="q">"Receiver ko stream nahi milti aur saare PIM neighbours up hain. Kya check karoge?"</p><p>Strong answer: RP, step by step. Last-hop router par group ka RP hai? Har jagah same RP hai? RP address routing table mein reachable hai? Phir mroute entry (RP, incoming interface, outgoing list) aur anycast ke liye MSDP aur SA cache. Batao ki har fix ke baad aap sab dobara check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chhe checks: RP pata hai, same RP, learning kahan ruki, RP reachable, mroute state, MSDP.</li>
<li>Jo pehla router mapping se khaali hai wahi fault ki jagah hai, ya usse pehla link.</li>
<li>RP tak route na hone par mapping hona unicast fault hai, multicast fault nahi.</li>
<li>Alag routers par alag BSR addresses ka matlab Bootstrap flood toota hai.</li>
<li>Har fix ke baad method dobara chalao; ek fault dusre ko chhupa sakta hai.</li>
</ul></div>
`}};export{e as default};