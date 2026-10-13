var e={id:`lag-lacp`,h:{en:`Link aggregation and LACP in a service provider core`,hi:`SP core mein link aggregation aur LACP`},body:{en:`
<p>A motorway with four lanes carries more cars than one lane, and if one lane is closed for repairs the other three still work. Link aggregation does this for network links: several physical links are bundled into one <b>logical link</b> (a bundle, also called a LAG, port-channel or Bundle-Ether). Routing protocols and MPLS see one interface with the combined bandwidth, and the loss of one member reduces capacity but does not break the adjacency.</p>
<p>You met EtherChannel in <code>encor-l2</code> and LAG with LACP on Junos in <code>jncis-ha</code>. This chapter keeps the same ideas and focuses on how an SP core uses them: Layer 3 bundles between P and PE routers, IOS XR syntax, and the interaction with the IGP.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Four 10G member links appear to IS-IS and MPLS as one 40G interface."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">Bundle-Ether1</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 x 10G members</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">LACP active</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">Bundle-Ether1</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">One IS-IS adjacency, one LDP session, four physical paths</text></svg><p class="cap">Four 10G member links appear to IS-IS and MPLS as one 40G interface.</p></div>
<h3>LACP in short</h3>
<p>The <b>Link Aggregation Control Protocol</b>, IEEE 802.1AX (formerly 802.3ad), lets two systems negotiate which links join the bundle and detect miscabling. It sends LACPDUs to the multicast address 01-80-C2-00-00-02. Each end has a <b>system ID</b> (system priority plus MAC) and each port has a <b>port ID</b> (port priority plus number). The device with the lower system priority decides which ports are active when there are more members than the maximum allowed.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr><tr><td>Active</td><td>Sends LACPDUs and starts negotiation</td></tr><tr><td>Passive</td><td>Answers only; two passive ends never form a bundle</td></tr><tr><td>On (static)</td><td>No LACP at all; no negotiation or miscabling detection</td></tr></table>
<p>LACP timers: <b>slow</b> (30 second LACPDU interval, 90 second timeout) and <b>fast</b> (1 second interval, 3 second timeout). Use fast timers in SP networks when you rely on LACP to detect a failure that the physical layer does not signal. When the optics report loss of signal the member leaves at once; LACP timers matter for failures that hide, for example a path through a transport network.</p>
<h3>Bundle parameters that matter in SP cores</h3>
<ul>
<li><b>Minimum-links.</b> The smallest number of active members for the bundle to stay up. If four members carry the traffic and only one remains, the remaining link is overloaded. Setting minimum-links 2 takes the bundle down so the IGP chooses another path.</li>
<li><b>Maximum-links.</b> Limits active members; extra links stay in standby and take over on a failure (hot standby). Useful for dual-homed designs.</li>
<li><b>Minimum-bandwidth.</b> On IOS XR, a bundle goes down when the aggregate active bandwidth falls below a value.</li>
<li><b>Bundle bandwidth and IGP metric.</b> The bundle bandwidth changes when a member fails; the IS-IS metric is usually configured by hand, so it does not follow. See the next chapter for the consequence.</li>
<li><b>Load balancing hash.</b> Traffic is spread per flow, not per packet, using a hash of header fields (source and destination MAC or IP, ports, and for MPLS the label stack or the entropy label). A single big flow uses one member only.</li>
</ul>
<h3>Layer 2 versus Layer 3 bundles</h3>
<p>In a campus switch the bundle is normally a Layer 2 trunk. In an SP core, links between routers are commonly <b>Layer 3 bundles</b>: the logical interface carries the IP address and the IGP adjacency, and the member ports have no addresses. On IOS XR a Layer 3 bundle is <code>interface Bundle-Ether1</code>, a member port gets <code>bundle id 1 mode active</code>. On IOS XE routers with port-channel the logical interface is <code>interface Port-channel1</code> with <code>no switchport</code> or a routed port-channel.</p>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XR: Layer 3 bundle between P1 and P2</span>
interface Bundle-Ether1
 description to P2
 ipv4 address 198.51.100.1 255.255.255.252
 bundle minimum-links 2
 lacp system priority 100
<span class="c">!</span>
interface TenGigE0/0/0/0
 bundle id 1 mode active
 lacp period short
<span class="c">!</span>
interface TenGigE0/0/0/1
 bundle id 1 mode active
 lacp period short
<span class="c">!</span>
<span class="c">! IOS XE: routed port-channel</span>
interface Port-channel1
 no switchport
 ip address 198.51.100.2 255.255.255.252
 port-channel min-links 2
<span class="c">!</span>
interface TenGigabitEthernet1/0/1
 channel-group 1 mode active
 lacp rate fast</pre>
<div class="eg"><p><b>Worked example.</b> P1 and P2 are joined by four 10G members. Traffic between the two routers is 22 Gbps on average. If two members fail, the remaining 20G cannot carry 22G and drops packets. With <code>bundle minimum-links 3</code> the bundle goes down as soon as only two members remain, and IS-IS shifts the traffic to a different path before the congestion starts. Choose minimum-links from the traffic: required capacity divided by member speed, rounded up.</p></div>
<div class="warn"><p><b>Common mistake.</b> Configuring both ends as passive, or one end on and the other active. The first never forms; the second brings the members up on one side only and creates a loop or a one-way bundle. Always use active on both ends in SP cores, and keep matching speed, duplex and MTU on every member.</p></div>
<div class="exam"><p><b>Exam trap.</b> LACP uses fast (1 second) and slow (30 second) PDU rates. The member with the lower port priority wins when the maximum link count is exceeded, and the system with the lower system priority decides. Max 16 links per bundle, with 8 active in the classic standard; modern IOS XR allows up to 64 on some platforms.</p></div>
<div class="scn"><h4>A 22 Gbps flow on a 20 Gbps bundle</h4><p>A four-member 10G bundle lost two members during a fibre cut in the same duct. IS-IS still advertised the same metric, the bundle stayed up with 20G and the evening video peak of 22G caused heavy drops. After the incident the team configured minimum-links 3, so the loss of a second member now takes the bundle down and moves traffic to the alternate path.</p><p><b>Lesson:</b> a bundle that stays up with too little capacity is worse than a bundle that goes down. Set minimum-links or minimum-bandwidth from the traffic.</p></div>
<div class="iv"><p class="q">"How do you make sure a degraded bundle does not carry traffic it cannot handle?"</p><p>Use minimum-links (or minimum-bandwidth on IOS XR) so the logical interface goes down when too few members remain, and let the IGP and FRR move traffic. Also mention changing or adjusting the IGP metric with the bundle bandwidth, using fast LACP timers or BFD, and monitoring per-member utilisation because hashing is per flow.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A bundle is one logical link; routing sees one adjacency and the combined bandwidth.</li>
<li>LACP (802.1AX) negotiates members; active on both ends, fast timers for hidden failures.</li>
<li>minimum-links stops a degraded bundle from staying up with too little capacity.</li>
<li>Hashing is per flow; one large flow uses one member only.</li>
<li>SP cores use Layer 3 bundles: Bundle-Ether on IOS XR, routed Port-channel on IOS XE.</li>
</ul></div>
`,hi:`
<p>Chaar lane wali motorway ek lane se zyada cars le jaati hai, aur ek lane repair ke liye band ho to baaki teen chalti rehti hain. Link aggregation network links ke liye yahi karta hai: kai physical links ek <b>logical link</b> (bundle, jise LAG, port-channel ya Bundle-Ether bhi kehte hain) mein bundle hote hain. Routing protocols aur MPLS ko combined bandwidth wala ek interface dikhta hai, aur ek member jaane se capacity kam hoti hai lekin adjacency nahi tootti.</p>
<p>Aap EtherChannel <code>encor-l2</code> mein aur Junos par LACP ke saath LAG <code>jncis-ha</code> mein mil chuke ho. Yeh chapter wahi ideas rakhta hai aur dhyan deta hai ki SP core inhe kaise use karta hai: P aur PE routers ke beech Layer 3 bundles, IOS XR syntax, aur IGP ke saath interaction.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Chaar 10G member links IS-IS aur MPLS ko ek 40G interface ki tarah dikhte hain."><rect x="20" y="30" width="185" height="70" rx="10" fill="#bae6fd"/><text x="112.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="112.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">Bundle-Ether1</text><line x1="205" y1="65" x2="227" y2="65" stroke="#64748b" stroke-width="2"/><rect x="227" y="30" width="185" height="70" rx="10" fill="#bbf7d0"/><text x="319.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">4 x 10G members</text><text x="319.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">LACP active</text><line x1="412" y1="65" x2="434" y2="65" stroke="#64748b" stroke-width="2"/><rect x="434" y="30" width="185" height="70" rx="10" fill="#ddd6fe"/><text x="526.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="526.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">Bundle-Ether1</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Ek IS-IS adjacency, ek LDP session, chaar physical paths</text></svg><p class="cap">Chaar 10G member links IS-IS aur MPLS ko ek 40G interface ki tarah dikhte hain.</p></div>
<h3>LACP chhote mein</h3>
<p><b>Link Aggregation Control Protocol</b>, IEEE 802.1AX (pehle 802.3ad), do systems ko negotiate karne deta hai ki kaunse links bundle mein jaayein aur miscabling detect karta hai. Yeh LACPDUs multicast address 01-80-C2-00-00-02 par bhejta hai. Har end ka ek <b>system ID</b> (system priority plus MAC) aur har port ka <b>port ID</b> (port priority plus number) hota hai. Jab members maximum se zyada hon to lower system priority wala device tay karta hai ki kaunse ports active honge.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr><tr><td>Active</td><td>LACPDUs bhejta hai aur negotiation shuru karta hai</td></tr><tr><td>Passive</td><td>Sirf jawab deta hai; do passive ends kabhi bundle nahi banate</td></tr><tr><td>On (static)</td><td>Koi LACP nahi; negotiation ya miscabling detection nahi</td></tr></table>
<p>LACP timers: <b>slow</b> (30 second LACPDU interval, 90 second timeout) aur <b>fast</b> (1 second interval, 3 second timeout). SP networks mein fast timers tab use karo jab aap LACP par us failure ko detect karne ke liye depend karte ho jo physical layer signal nahi karta. Optics loss of signal batayein to member turant nikal jaata hai; LACP timers un failures ke liye matter karte hain jo chhup jaate hain, jaise transport network se guzarta path.</p>
<h3>SP cores mein zaroori bundle parameters</h3>
<ul>
<li><b>Minimum-links.</b> Bundle up rehne ke liye active members ki minimum sankhya. Chaar members traffic le jaate hon aur sirf ek bache to bacha link overload ho jaata hai. Minimum-links 2 bundle ko down kar deta hai taaki IGP doosra path chune.</li>
<li><b>Maximum-links.</b> Active members ki limit; extra links standby mein rehte hain aur failure par takeover karte hain (hot standby). Dual-homed designs mein kaam aata hai.</li>
<li><b>Minimum-bandwidth.</b> IOS XR par, aggregate active bandwidth ek value se neeche jaaye to bundle down ho jaata hai.</li>
<li><b>Bundle bandwidth aur IGP metric.</b> Member fail hone par bundle bandwidth badalti hai; IS-IS metric aksar haath se configure hota hai, isliye woh follow nahi karta. Iska nateeja agle chapter mein dekhoge.</li>
<li><b>Load balancing hash.</b> Traffic per flow baanta jaata hai, per packet nahi, header fields ke hash se (source aur destination MAC ya IP, ports, aur MPLS ke liye label stack ya entropy label). Ek bada flow sirf ek member use karta hai.</li>
</ul>
<h3>Layer 2 versus Layer 3 bundles</h3>
<p>Campus switch mein bundle aam taur par Layer 2 trunk hota hai. SP core mein routers ke beech links aksar <b>Layer 3 bundles</b> hote hain: logical interface IP address aur IGP adjacency carry karta hai, aur member ports par address nahi hota. IOS XR par Layer 3 bundle <code>interface Bundle-Ether1</code> hai, member port ko <code>bundle id 1 mode active</code> milta hai. Port-channel wale IOS XE routers par logical interface <code>interface Port-channel1</code> hai, <code>no switchport</code> ya routed port-channel ke saath.</p>
<h3>Configuration (reference)</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XR: P1 aur P2 ke beech Layer 3 bundle</span>
interface Bundle-Ether1
 description to P2
 ipv4 address 198.51.100.1 255.255.255.252
 bundle minimum-links 2
 lacp system priority 100
<span class="c">!</span>
interface TenGigE0/0/0/0
 bundle id 1 mode active
 lacp period short
<span class="c">!</span>
interface TenGigE0/0/0/1
 bundle id 1 mode active
 lacp period short
<span class="c">!</span>
<span class="c">! IOS XE: routed port-channel</span>
interface Port-channel1
 no switchport
 ip address 198.51.100.2 255.255.255.252
 port-channel min-links 2
<span class="c">!</span>
interface TenGigabitEthernet1/0/1
 channel-group 1 mode active
 lacp rate fast</pre>
<div class="eg"><p><b>Worked example.</b> P1 aur P2 chaar 10G members se jude hain. Dono routers ke beech average traffic 22 Gbps hai. Do members fail ho jaayein to bacha 20G 22G nahi utha sakta aur packets drop hote hain. <code>bundle minimum-links 3</code> ke saath jaise hi sirf do members bachte hain bundle down ho jaata hai, aur IS-IS congestion shuru hone se pehle traffic doosre path par bhej deta hai. Minimum-links traffic se chuno: required capacity ko member speed se bhaag do, upar round karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Dono ends passive configure karna, ya ek end on aur doosra active. Pehla kabhi form nahi hota; doosra sirf ek side par members up karta hai aur loop ya one-way bundle banata hai. SP cores mein dono ends par active use karo, aur har member par speed, duplex aur MTU match rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> LACP fast (1 second) aur slow (30 second) PDU rates use karta hai. Maximum link count se zyada hone par lower port priority wala member jeetta hai, aur lower system priority wala system decide karta hai. Classic standard mein bundle mein max 16 links, 8 active; modern IOS XR kuch platforms par 64 tak allow karta hai.</p></div>
<div class="scn"><h4>20 Gbps bundle par 22 Gbps ka traffic</h4><p>Chaar-member 10G bundle ne ek hi duct mein fibre cut ke dauran do members kho diye. IS-IS ne wahi metric advertise kiya, bundle 20G ke saath up raha aur shaam ke video peak ke 22G se heavy drops hue. Incident ke baad team ne minimum-links 3 configure kiya, ab doosra member jaane par bundle down ho jaata hai aur traffic alternate path par chala jaata hai.</p><p><b>Lesson:</b> kam capacity ke saath up rehne wala bundle, down hone wale bundle se bura hai. Minimum-links ya minimum-bandwidth traffic se set karo.</p></div>
<div class="iv"><p class="q">"Kaise sunishchit karoge ki degraded bundle woh traffic na le jo woh handle nahi kar sakta?"</p><p>Minimum-links (ya IOS XR par minimum-bandwidth) use karo taaki bahut kam members bachne par logical interface down ho jaaye aur IGP aur FRR traffic move karein. Yeh bhi batao ki bundle bandwidth ke saath IGP metric adjust karte hain, fast LACP timers ya BFD use karte hain, aur per-member utilisation monitor karte hain kyunki hashing per flow hoti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bundle ek logical link hai; routing ko ek adjacency aur combined bandwidth dikhti hai.</li>
<li>LACP (802.1AX) members negotiate karta hai; dono ends active, chhupe failures ke liye fast timers.</li>
<li>minimum-links degraded bundle ko kam capacity ke saath up rehne se rokta hai.</li>
<li>Hashing per flow hoti hai; ek bada flow ek hi member use karta hai.</li>
<li>SP cores Layer 3 bundles use karte hain: IOS XR par Bundle-Ether, IOS XE par routed Port-channel.</li>
</ul></div>
`}};export{e as default};