var e={id:`l3vpn-control-plane`,h:{en:`L3VPN control plane: MP-BGP VPNv4 and CE-PE routing`,hi:`L3VPN control plane: MP-BGP VPNv4 aur CE-PE routing`},body:{en:`
<p>Back in the shared office building, each reception desk (VRF) learns its company's room directory from that company's own staff (the CE). The desks in different buildings then need to share those directories with each other, but only with the right company's desk. They do it through a central <b>courier dispatch office</b> that stamps every directory entry with the company code (RT) and a unique reference (RD), plus a <b>desk number</b> saying "deliver mail for this room to my desk 28". In MPLS L3VPN, that dispatch office is <b>MP-BGP</b>, and desk 28 is the <b>VPN label</b>.</p>

<h3>Three routing relationships</h3>
<ol>
<li><b>CE to PE</b>: ordinary routing inside the customer's VRF. Options: static routes, OSPF, EIGRP, RIP or eBGP. The CE has no idea it is talking to a VRF.</li>
<li><b>PE to PE</b>: <b>MP-BGP</b> with the <b>VPNv4 address family</b>, usually iBGP between PE loopbacks (often through route reflectors in large networks). It carries VPNv4 prefixes, RTs and VPN labels.</li>
<li><b>Core</b>: the IGP and LDP from the earlier chapters. They give every PE a labelled path (LSP) to every other PE's loopback.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="L3VPN control plane flow">
<rect x="10" y="110" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="135" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<rect x="150" y="110" width="110" height="40" rx="8" fill="#bae6fd"/><text x="205" y="135" text-anchor="middle" class="svg-ink" font-size="12">PE2 4.4.4.4</text>
<rect x="400" y="110" width="110" height="40" rx="8" fill="#bae6fd"/><text x="455" y="135" text-anchor="middle" class="svg-ink" font-size="12">PE1 1.1.1.1</text>
<rect x="550" y="110" width="80" height="40" rx="8" fill="#fde68a"/><text x="590" y="135" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<line x1="100" y1="130" x2="150" y2="130" stroke="#64748b" marker-end="url(#a10)"/><text x="125" y="100" text-anchor="middle" class="svg-muted" font-size="12">1</text>
<line x1="260" y1="130" x2="400" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#a10)"/><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="12">2</text>
<line x1="510" y1="130" x2="550" y2="130" stroke="#64748b" marker-end="url(#a10)"/><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">eBGP 10.10.2.0/24</text>
<text x="330" y="175" text-anchor="middle" class="svg-accent" font-size="12">VPNv4 65000:1:10.10.2.0/24</text>
<text x="330" y="193" text-anchor="middle" class="svg-accent" font-size="12">RT 65000:100, label 28, NH 4.4.4.4</text>
<text x="570" y="185" text-anchor="middle" class="svg-ink" font-size="12">eBGP in VRF</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">Routes flow right to left in this picture: PE2 → PE1</text>
<defs><marker id="a10" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">1: CE-A2 advertises its LAN to PE2 in VRF CUST-A. 2: PE2 exports it as a VPNv4 route with RT and VPN label. 3: PE1 imports it into VRF CUST-A and advertises it to CE-A1.</p></div>

<h3>What a VPNv4 update carries</h3>
<ul>
<li><b>NLRI</b>: RD + prefix, for example 65000:1:10.10.2.0/24.</li>
<li><b>VPN label</b>: chosen by the advertising PE (PE2), for example <b>28</b>. It tells PE2, when a packet later arrives with label 28, which VRF and which next hop to use. IOS allocates one label per prefix by default.</li>
<li><b>Next hop</b>: the advertising PE's loopback, 4.4.4.4 (because of <code>update-source Loopback0</code>; iBGP VPNv4 sets next hop to self when exporting from a VRF).</li>
<li><b>Extended communities</b>: the export RT(s), 65000:100.</li>
</ul>
<p>The next hop is the glue between the VPN and the core: PE1 will push the VPN label 28 and, on top of it, the <b>LDP label for 4.4.4.4/32</b>. That is why every PE loopback must be a /32 in the IGP with a working LSP.</p>

<h3>Configuration on PE1 (PE2 is the mirror image)</h3>
<pre class="code"><span class="c">! VRF definition as in chapter 9, Gi0/2 in VRF CUST-A (172.31.11.1/30)</span>
router bgp 65000
 bgp router-id 1.1.1.1
 no bgp default ipv4-unicast
 neighbor 4.4.4.4 remote-as 65000
 neighbor 4.4.4.4 update-source Loopback0
 !
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended   <span class="c">! RTs are extended communities</span>
 exit-address-family
 !
 address-family ipv4 vrf CUST-A
  neighbor 172.31.11.2 remote-as 65101       <span class="c">! eBGP to CE-A1</span>
  neighbor 172.31.11.2 activate
 exit-address-family</pre>
<pre class="code"><span class="c">! CE-A1: plain BGP, no VRF, no MPLS</span>
router bgp 65101
 neighbor 172.31.11.1 remote-as 65000
 network 10.10.1.0 mask 255.255.255.0</pre>
<p>IOS normally adds <code>send-community extended</code> automatically when you activate a VPNv4 neighbour, but always confirm it is present; without it the RTs are stripped and no VRF imports anything.</p>

<h3>Other CE-PE protocols need redistribution</h3>
<pre class="code"><span class="c">! Static CE-PE</span>
ip route vrf CUST-A 10.10.1.0 255.255.255.0 172.31.11.2
router bgp 65000
 address-family ipv4 vrf CUST-A
  redistribute static
  redistribute connected
<span class="c">! OSPF CE-PE: one OSPF process per VRF, mutual redistribution with BGP</span>
router ospf 10 vrf CUST-A
 network 172.31.11.0 0.0.0.3 area 0
 redistribute bgp 65000 subnets
router bgp 65000
 address-family ipv4 vrf CUST-A
  redistribute ospf 10</pre>
<p>With eBGP there is nothing to redistribute: VRF BGP routes become VPNv4 routes directly. That simplicity is why eBGP is the most common CE-PE protocol for large providers. If both customer sites use the <b>same</b> private AS, the remote CE would reject routes containing its own AS; providers fix that with <code>neighbor x as-override</code> on the PE or <code>allowas-in</code> on the CE.</p>

<h3>Verification</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">4.4.4.4         4        65000      32      30        9    0    0 00:12:40        1</span>
172.31.11.2     4        65101      25      27        9    0    0 00:15:02        1

PE1# show bgp vpnv4 unicast all labels
   Network          Next Hop      In label/Out label
Route Distinguisher: 65000:1 (CUST-A)
   10.10.1.0/24     172.31.11.2     25/nolabel
<span class="hl">   10.10.2.0/24     4.4.4.4         nolabel/28</span>

PE1# show ip route vrf CUST-A bgp
<span class="hl">B        10.10.2.0/24 [200/0] via 4.4.4.4, 00:12:31</span></pre>
<p>Read the labels line: for its own customer route 10.10.1.0/24, PE1 allocated in-label 25 and advertised it to PE2. For the remote route 10.10.2.0/24, PE1 learned out-label 28 from PE2. The VRF route points to next hop 4.4.4.4, a global-table address; CEF resolves it through the LSP.</p>

<div class="eg"><p><b>Worked example.</b> Count the state. A provider has 50 PEs, 3,000 customer VRFs and 200,000 customer routes. Each PE holds only the VRFs for customers attached to it, and imports only routes with matching RTs. The 30 P routers hold about 100 IGP routes and 100 LDP bindings each, and <b>zero</b> customer routes. Adding a new customer touches only the PEs where it has sites.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>address-family vpnv4</code> activation (the session is up for IPv4 but carries no VPN routes); missing <code>send-community extended</code>; peering from a physical interface instead of the loopback; and forgetting the redistribution in the VRF address family for static or OSPF CE-PE.</p></div>

<div class="exam"><p><b>Exam trap.</b> MP-BGP (RFC 4760) carries VPNv4 between PEs; P routers do not run BGP. The VPN label is allocated by the <b>egress</b> PE and carried in BGP, not in LDP. The BGP next hop must be reachable through an LSP.</p></div>

<div class="scn"><h4>Session up, zero prefixes</h4><p>A new PE was added to an L3VPN network. The iBGP session to the route reflector showed Established, but <code>show bgp vpnv4 unicast all summary</code> did not list the neighbour at all, and no VRF learned any remote route. The engineer had configured the neighbour only under the default IPv4 address family. Activating it under <code>address-family vpnv4</code> with <code>send-community extended</code> brought 4,000 VPNv4 prefixes in within seconds.</p><p><b>Lesson:</b> a BGP session is per address family; check the VPNv4 summary, not just the IPv4 one.</p></div>

<div class="iv"><p class="q">"How are customer routes exchanged between PEs in an MPLS L3VPN?"</p><p>The PE learns routes from the CE in the customer VRF, by static, IGP or eBGP. It converts them into VPNv4 routes by adding the VRF's RD, attaches the export RTs as extended communities, allocates a VPN label, and sends them over MP-BGP to the other PEs with its loopback as next hop. The receiving PE imports routes whose RTs match its VRF import list and advertises them to its CE. P routers carry none of this.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three relationships: CE-PE routing in the VRF, MP-BGP VPNv4 between PEs, IGP + LDP in the core.</li>
<li>A VPNv4 update carries RD+prefix, the VPN label, the PE loopback as next hop and the RTs.</li>
<li>Activate the neighbour under address-family vpnv4 and make sure send-community extended is set.</li>
<li>Static, OSPF and EIGRP CE-PE need redistribution into BGP in the VRF; eBGP does not.</li>
<li>Verify with show bgp vpnv4 unicast all summary / labels and show ip route vrf.</li>
</ul></div>
`,hi:`
<p>Shared office building par wapas chalo, har reception desk (VRF) apni company ki room directory us company ke apne staff (CE) se seekhta hai. Phir alag buildings ke desks ko yeh directories ek doosre ke saath share karni hoti hain, par sirf sahi company ke desk ke saath. Yeh woh ek central <b>courier dispatch office</b> ke through karte hain jo har directory entry par company code (RT) aur ek unique reference (RD) ka thappa lagata hai, plus ek <b>desk number</b> jo kehta hai "is room ki daak mere desk 28 par deliver karo". MPLS L3VPN mein woh dispatch office <b>MP-BGP</b> hai, aur desk 28 <b>VPN label</b> hai.</p>

<h3>Teen routing relationships</h3>
<ol>
<li><b>CE se PE</b>: customer ke VRF ke andar normal routing. Options: static routes, OSPF, EIGRP, RIP ya eBGP. CE ko pata hi nahi ki woh VRF se baat kar raha hai.</li>
<li><b>PE se PE</b>: <b>VPNv4 address family</b> ke saath <b>MP-BGP</b>, aam taur par PE loopbacks ke beech iBGP (bade networks mein aksar route reflectors ke through). Yeh VPNv4 prefixes, RTs aur VPN labels le jaata hai.</li>
<li><b>Core</b>: pichhle chapters ka IGP aur LDP. Yeh har PE ko har doosre PE ke loopback tak labelled path (LSP) dete hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="L3VPN control plane flow">
<rect x="10" y="110" width="90" height="40" rx="8" fill="#fde68a"/><text x="55" y="135" text-anchor="middle" class="svg-ink" font-size="12">CE-A2</text>
<rect x="150" y="110" width="110" height="40" rx="8" fill="#bae6fd"/><text x="205" y="135" text-anchor="middle" class="svg-ink" font-size="12">PE2 4.4.4.4</text>
<rect x="400" y="110" width="110" height="40" rx="8" fill="#bae6fd"/><text x="455" y="135" text-anchor="middle" class="svg-ink" font-size="12">PE1 1.1.1.1</text>
<rect x="550" y="110" width="80" height="40" rx="8" fill="#fde68a"/><text x="590" y="135" text-anchor="middle" class="svg-ink" font-size="12">CE-A1</text>
<line x1="100" y1="130" x2="150" y2="130" stroke="#64748b" marker-end="url(#b10)"/><text x="125" y="100" text-anchor="middle" class="svg-muted" font-size="12">1</text>
<line x1="260" y1="130" x2="400" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#b10)"/><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="12">2</text>
<line x1="510" y1="130" x2="550" y2="130" stroke="#64748b" marker-end="url(#b10)"/><text x="530" y="100" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">eBGP 10.10.2.0/24</text>
<text x="330" y="175" text-anchor="middle" class="svg-accent" font-size="12">VPNv4 65000:1:10.10.2.0/24</text>
<text x="330" y="193" text-anchor="middle" class="svg-accent" font-size="12">RT 65000:100, label 28, NH 4.4.4.4</text>
<text x="570" y="185" text-anchor="middle" class="svg-ink" font-size="12">VRF mein eBGP</text>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">Is tasveer mein routes right se left jaate hain: PE2 → PE1</text>
<defs><marker id="b10" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
</svg><p class="cap">1: CE-A2 apna LAN VRF CUST-A mein PE2 ko advertise karta hai. 2: PE2 use RT aur VPN label ke saath VPNv4 route ki tarah export karta hai. 3: PE1 use VRF CUST-A mein import karke CE-A1 ko advertise karta hai.</p></div>

<h3>VPNv4 update kya le jaata hai</h3>
<ul>
<li><b>NLRI</b>: RD + prefix, jaise 65000:1:10.10.2.0/24.</li>
<li><b>VPN label</b>: advertise karne wala PE (PE2) chunta hai, jaise <b>28</b>. Yeh PE2 ko batata hai ki baad mein label 28 wala packet aaye to kaunsa VRF aur kaunsa next hop use karna hai. IOS default mein har prefix ke liye ek label allocate karta hai.</li>
<li><b>Next hop</b>: advertise karne wale PE ka loopback, 4.4.4.4 (<code>update-source Loopback0</code> ki wajah se; VRF se export karte waqt iBGP VPNv4 next hop khud ko set karta hai).</li>
<li><b>Extended communities</b>: export RT(s), 65000:100.</li>
</ul>
<p>Next hop VPN aur core ke beech ka gond hai: PE1 VPN label 28 push karega aur uske upar <b>4.4.4.4/32 ka LDP label</b>. Isi wajah se har PE loopback IGP mein ek /32 hona chahiye jiska LSP kaam kar raha ho.</p>

<h3>PE1 par configuration (PE2 uska mirror image hai)</h3>
<pre class="code"><span class="c">! VRF definition chapter 9 jaisa, Gi0/2 VRF CUST-A mein (172.31.11.1/30)</span>
router bgp 65000
 bgp router-id 1.1.1.1
 no bgp default ipv4-unicast
 neighbor 4.4.4.4 remote-as 65000
 neighbor 4.4.4.4 update-source Loopback0
 !
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended   <span class="c">! RTs extended communities hain</span>
 exit-address-family
 !
 address-family ipv4 vrf CUST-A
  neighbor 172.31.11.2 remote-as 65101       <span class="c">! CE-A1 se eBGP</span>
  neighbor 172.31.11.2 activate
 exit-address-family</pre>
<pre class="code"><span class="c">! CE-A1: plain BGP, na VRF, na MPLS</span>
router bgp 65101
 neighbor 172.31.11.1 remote-as 65000
 network 10.10.1.0 mask 255.255.255.0</pre>
<p>VPNv4 neighbour activate karne par IOS normally <code>send-community extended</code> apne aap jod deta hai, par hamesha confirm karo ki woh hai; iske bina RTs hat jaate hain aur koi VRF kuch import nahi karta.</p>

<h3>Doosre CE-PE protocols ko redistribution chahiye</h3>
<pre class="code"><span class="c">! Static CE-PE</span>
ip route vrf CUST-A 10.10.1.0 255.255.255.0 172.31.11.2
router bgp 65000
 address-family ipv4 vrf CUST-A
  redistribute static
  redistribute connected
<span class="c">! OSPF CE-PE: har VRF ke liye ek OSPF process, BGP ke saath mutual redistribution</span>
router ospf 10 vrf CUST-A
 network 172.31.11.0 0.0.0.3 area 0
 redistribute bgp 65000 subnets
router bgp 65000
 address-family ipv4 vrf CUST-A
  redistribute ospf 10</pre>
<p>eBGP ke saath kuch redistribute nahi karna padta: VRF BGP routes seedhe VPNv4 routes ban jaate hain. Isi simplicity ki wajah se bade providers ke liye eBGP sabse common CE-PE protocol hai. Agar customer ki dono sites <b>same</b> private AS use karti hain, to remote CE apne AS wale routes reject kar dega; providers ise PE par <code>neighbor x as-override</code> ya CE par <code>allowas-in</code> se theek karte hain.</p>

<h3>Verification</h3>
<pre class="out">PE1# show bgp vpnv4 unicast all summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">4.4.4.4         4        65000      32      30        9    0    0 00:12:40        1</span>
172.31.11.2     4        65101      25      27        9    0    0 00:15:02        1

PE1# show bgp vpnv4 unicast all labels
   Network          Next Hop      In label/Out label
Route Distinguisher: 65000:1 (CUST-A)
   10.10.1.0/24     172.31.11.2     25/nolabel
<span class="hl">   10.10.2.0/24     4.4.4.4         nolabel/28</span>

PE1# show ip route vrf CUST-A bgp
<span class="hl">B        10.10.2.0/24 [200/0] via 4.4.4.4, 00:12:31</span></pre>
<p>Labels wali line padho: apne customer route 10.10.1.0/24 ke liye PE1 ne in-label 25 allocate karke PE2 ko advertise kiya. Remote route 10.10.2.0/24 ke liye PE1 ne PE2 se out-label 28 seekha. VRF route next hop 4.4.4.4 ki taraf point karta hai, jo global-table address hai; CEF use LSP ke through resolve karta hai.</p>

<div class="eg"><p><b>Worked example.</b> State gino. Ek provider ke paas 50 PEs, 3,000 customer VRFs aur 200,000 customer routes hain. Har PE sirf apne se jude customers ke VRFs rakhta hai, aur sirf matching RTs wale routes import karta hai. 30 P routers mein se har ek lagbhag 100 IGP routes aur 100 LDP bindings rakhta hai, aur customer routes <b>zero</b>. Naya customer jodne par sirf wahi PEs chhue jaate hain jahan uski sites hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>address-family vpnv4</code> mein activation bhoolna (session IPv4 ke liye up hai par koi VPN routes nahi le jaata); <code>send-community extended</code> missing; loopback ki jagah physical interface se peering; aur static ya OSPF CE-PE ke liye VRF address family mein redistribution bhoolna.</p></div>

<div class="exam"><p><b>Exam trap.</b> MP-BGP (RFC 4760) PEs ke beech VPNv4 le jaata hai; P routers BGP nahi chalate. VPN label <b>egress</b> PE allocate karta hai aur woh BGP mein jaata hai, LDP mein nahi. BGP next hop LSP ke through reachable hona chahiye.</p></div>

<div class="scn"><h4>Session up, zero prefixes</h4><p>Ek L3VPN network mein naya PE joda gaya. Route reflector ke saath iBGP session Established dikha raha tha, par <code>show bgp vpnv4 unicast all summary</code> mein neighbour dikha hi nahi, aur kisi VRF ne koi remote route nahi seekha. Engineer ne neighbour sirf default IPv4 address family mein configure kiya tha. <code>address-family vpnv4</code> ke andar <code>send-community extended</code> ke saath activate karte hi seconds mein 4,000 VPNv4 prefixes aa gaye.</p><p><b>Seekh:</b> BGP session har address family ke hisaab se hota hai; sirf IPv4 nahi, VPNv4 summary check karo.</p></div>

<div class="iv"><p class="q">"MPLS L3VPN mein PEs ke beech customer routes kaise exchange hote hain?"</p><p>PE customer VRF mein CE se routes seekhta hai, static, IGP ya eBGP se. Woh VRF ka RD jodkar unhe VPNv4 routes banata hai, export RTs extended communities ki tarah lagata hai, ek VPN label allocate karta hai, aur apne loopback ko next hop banakar MP-BGP se doosre PEs ko bhejta hai. Receiving PE woh routes import karta hai jinke RTs uske VRF import list se match karte hain aur unhe apne CE ko advertise karta hai. P routers inmein se kuch nahi le jaate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen relationships: VRF mein CE-PE routing, PEs ke beech MP-BGP VPNv4, core mein IGP + LDP.</li>
<li>VPNv4 update RD+prefix, VPN label, next hop ke roop mein PE loopback aur RTs le jaata hai.</li>
<li>Neighbour ko address-family vpnv4 ke andar activate karo aur pakka karo ki send-community extended set hai.</li>
<li>Static, OSPF aur EIGRP CE-PE ko VRF mein BGP ke andar redistribution chahiye; eBGP ko nahi.</li>
<li>show bgp vpnv4 unicast all summary / labels aur show ip route vrf se verify karo.</li>
</ul></div>
`}};export{e as default};