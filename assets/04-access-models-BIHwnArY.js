var e={id:`access-models`,h:{en:`Where Layer 2 ends: L2 access, routed access and virtual switching`,hi:`Layer 2 kahan khatam hoti hai: L2 access, routed access aur virtual switching`},body:{en:`
<p>Every campus design must answer one question early: <b>where does Layer 2 stop and Layer 3 begin?</b> Think of a housing society. Inside the gate, neighbours walk freely between houses (Layer 2, same VLAN). At the gate, a guard checks where you are going and sends you on the right road (Layer 3, routing). You can put the gate at the society entrance, or at each building's door. Both work, but they change how far a problem spreads and how far a resident can wander. This chapter compares the three common answers.</p>

<h3>Option 1: Layer 2 access (the looped triangle)</h3>
<p>Access switches are pure Layer 2. Every access switch has an uplink trunk to each distribution switch, and the two distribution switches are linked by a Layer 2 trunk (usually an EtherChannel). The VLAN's gateway lives on distribution SVIs protected by an FHRP. Each access switch plus the distribution pair forms a <b>triangle</b>, which is a physical loop, so spanning tree blocks one uplink per VLAN.</p>
<ul>
<li><b>Pros:</b> a VLAN can span several access switches; simple access configuration; works with any access switch.</li>
<li><b>Cons:</b> STP blocks half the uplinks (unless you load-share per VLAN); failover depends on STP and FHRP timers; the VLAN is a larger failure domain; the STP root and FHRP active must be aligned (next chapter).</li>
</ul>
<p>This is the design used in the lab: AS1 has Gi0/0 to DS1 and Gi0/1 to DS2, and DS1 and DS2 are linked by Gi0/6 and Gi0/7.</p>
<p>Two variants avoid the loop. In a <b>loop-free U</b>, the two access switches of a pair are joined by a Layer 2 link and the distribution link is routed, so VLANs span only that access pair and nothing blocks. In a <b>loop-free inverted U</b>, the distribution link is Layer 2 and each access switch has only one uplink, so nothing blocks but a single uplink failure isolates that switch. Both are niche; the looped triangle and routed access are what you will meet most.</p>

<h3>Option 2: Routed access</h3>
<p>The Layer 3 boundary moves down to the <b>access switch</b>. Each uplink is a routed point-to-point link, the access switch is the default gateway for its own VLANs, and it runs OSPF or EIGRP towards the distribution pair.</p>
<ul>
<li><b>Pros:</b> no STP blocking on uplinks, both uplinks forward with equal-cost multipath (ECMP); no FHRP needed because the access switch is the gateway; routing convergence is fast and deterministic; broadcasts and loops stay on one switch, so failure domains are tiny.</li>
<li><b>Cons:</b> a VLAN cannot span access switches; more IP planning (a /30 or /31 per uplink, subnets per access switch); the access switches need Layer 3 features and licensing.</li>
</ul>
<pre class="code"><span class="c">! Routed access switch ACC-R1 (example)</span>
ip routing
interface GigabitEthernet1/0/49
 description UPLINK-DIST1
 no switchport
 ip address 10.0.101.1 255.255.255.252
 ip ospf network point-to-point
interface GigabitEthernet1/0/50
 description UPLINK-DIST2
 no switchport
 ip address 10.0.102.1 255.255.255.252
 ip ospf network point-to-point
interface Vlan110
 ip address 10.1.110.1 255.255.255.0
router ospf 1
 router-id 10.255.0.21
 passive-interface default
 no passive-interface GigabitEthernet1/0/49
 no passive-interface GigabitEthernet1/0/50
 network 10.0.101.0 0.0.0.3 area 1
 network 10.0.102.0 0.0.0.3 area 1
 network 10.1.110.0 0.0.0.255 area 1</pre>
<pre class="out">ACC-R1# show ip route ospf
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.0.101.2, 00:02:10, GigabitEthernet1/0/49</span>
<span class="hl">                [110/2] via 10.0.102.2, 00:02:10, GigabitEthernet1/0/50</span></pre>
<p>Two equal-cost default routes: both uplinks carry traffic. Making the access area totally stubby (or the access switch an EIGRP stub) keeps its routing table tiny and stops it from ever being used as a transit path.</p>

<h3>Option 3: Virtual switching (StackWise Virtual)</h3>
<p>The two distribution switches are combined into <b>one logical switch</b> with one control plane (StackWise Virtual on Catalyst 9000, covered in the high-availability chapter). The access switch bundles its two uplinks into a single <b>multichassis EtherChannel (MEC)</b> with LACP. To spanning tree that is one port, so nothing blocks. The gateway is a single SVI on the logical switch, so no FHRP is needed, and VLANs can still span access switches.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Three access models">
<text x="105" y="20" text-anchor="middle" class="svg-ink" font-size="13">L2 access</text>
<rect x="35" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="120" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="147" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<rect x="77" y="140" width="55" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="90" y1="50" x2="120" y2="50" stroke="#64748b" stroke-width="3"/><line x1="62" y1="65" x2="95" y2="140" stroke="#64748b" stroke-width="2"/><line x1="147" y1="65" x2="115" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="150" y="110" class="svg-accent" font-size="12">BLK</text>
<text x="105" y="200" text-anchor="middle" class="svg-muted" font-size="12">STP + FHRP</text>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Routed access</text>
<rect x="250" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="277" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="335" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="362" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<rect x="292" y="140" width="55" height="30" rx="6" fill="#fde68a"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="277" y1="65" x2="310" y2="140" stroke="#64748b" stroke-width="2"/><line x1="362" y1="65" x2="330" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">L3 uplinks, ECMP</text>
<text x="535" y="20" text-anchor="middle" class="svg-ink" font-size="13">Virtual switch</text>
<rect x="460" y="30" width="150" height="45" rx="10" fill="#ddd6fe"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="12">one logical switch</text>
<rect x="507" y="140" width="55" height="30" rx="6" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">AS</text>
<line x1="495" y1="75" x2="525" y2="140" stroke="#64748b" stroke-width="2"/><line x1="575" y1="75" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<ellipse cx="535" cy="118" rx="30" ry="8" fill="none" stroke="#64748b"/>
<text x="535" y="200" text-anchor="middle" class="svg-muted" font-size="12">MEC, no blocking</text>
</svg><p class="cap">L2 access blocks one uplink; routed access and virtual switching use both.</p></div>

<table class="cmp"><tr><th>Question</th><th>L2 access</th><th>Routed access</th><th>Virtual switching</th></tr>
<tr><td>Uplinks forwarding</td><td>One per VLAN</td><td>Both (ECMP)</td><td>Both (MEC)</td></tr>
<tr><td>STP role</td><td>Active, blocking</td><td>Only on edge ports</td><td>Loop protection only</td></tr>
<tr><td>FHRP needed</td><td>Yes</td><td>No</td><td>No</td></tr>
<tr><td>VLAN spans access switches</td><td>Yes</td><td>No</td><td>Yes</td></tr>
<tr><td>Failure domain</td><td>Whole VLAN</td><td>One access switch</td><td>Whole VLAN</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A floor has four access switches with two 10 Gbps uplinks each. With L2 access and no per-VLAN load sharing, each switch really has 10 Gbps upward (80 Gbps of uplinks installed, 40 Gbps used). With routed access or MEC, all 80 Gbps forward. Same cables, twice the usable bandwidth.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Choosing routed access and then discovering a legacy application that needs one subnet on several floors. Mixing models inside one block without a plan. Forgetting that routed access still needs STP on edge ports with BPDU guard, because users can still plug in switches.</p></div>

<div class="exam"><p><b>Exam trap.</b> In routed access there is <b>no FHRP</b> and <b>no STP blocking on uplinks</b>; the trade-off is that VLANs cannot span access switches. A question asking how to use both uplinks without spanning VLANs across switches points to routed access; one that must keep VLANs spanning points to virtual switching with MEC.</p></div>

<div class="scn"><h4>The lab that needed one subnet</h4><p>A university converted its science block to routed access. Convergence after an uplink failure dropped from several seconds to well under one second and the uplink utilisation doubled. Two weeks later the physics lab complained: an old instrument-control application discovered its devices with broadcasts and needed all benches on one subnet, but the benches were on two floors with different access switches. The engineer kept routed access for the building, placed the instrument benches on one dedicated access switch per lab, and documented the constraint for future moves.</p><p><b>Lesson:</b> check application Layer 2 requirements before moving the L3 boundary to the access layer.</p></div>

<div class="iv"><p class="q">"Compare Layer 2 access with routed access. Which would you choose?"</p><p>Explain that L2 access keeps VLANs spanning access switches but relies on STP (one uplink blocked) and an FHRP aligned with the STP root. Routed access moves the gateway to the access switch, uses both uplinks with ECMP, converges quickly and keeps failure domains tiny, but a VLAN cannot leave its access switch. Choose routed access for new builds without VLAN-spanning needs; choose L2 access or virtual switching with MEC when VLANs must span. Mentioning SD-Access, which gives routed access plus stretched subnets through an overlay, is a strong finish.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 access: VLANs can span, but STP blocks an uplink and an FHRP is required.</li>
<li>Routed access: the access switch is the gateway, both uplinks forward with ECMP, no FHRP, tiny failure domains.</li>
<li>Virtual switching (StackWise Virtual + MEC): no blocking, no FHRP, VLANs can still span.</li>
<li>Loop-free U and inverted U remove the loop but have scaling or isolation limits.</li>
<li>The lab uses L2 access in a looped triangle, so STP and HSRP must be aligned.</li>
</ul></div>
`,hi:`
<p>Har campus design ko ek sawaal ka jawab jaldi dena padta hai: <b>Layer 2 kahan rukti hai aur Layer 3 kahan shuru hoti hai?</b> Ek housing society ke baare mein socho. Gate ke andar padosi gharon ke beech aazaadi se ghoomte hain (Layer 2, same VLAN). Gate par guard check karta hai ki aap kahan ja rahe ho aur sahi road par bhejta hai (Layer 3, routing). Gate society ke entrance par bhi laga sakte ho, ya har building ke darwaaze par. Dono kaam karte hain, lekin isse badalta hai ki problem kitni failti hai aur resident kitni door ghoom sakta hai. Yeh chapter teen common answers compare karta hai.</p>

<h3>Option 1: Layer 2 access (looped triangle)</h3>
<p>Access switches pure Layer 2 hote hain. Har access switch ka har distribution switch tak ek uplink trunk hota hai, aur dono distribution switches ek Layer 2 trunk (aam taur par EtherChannel) se jude hote hain. VLAN ka gateway distribution SVIs par FHRP ke saath rehta hai. Har access switch aur distribution pair milkar ek <b>triangle</b> banate hain, jo physical loop hai, isliye spanning tree har VLAN mein ek uplink block karta hai.</p>
<ul>
<li><b>Pros:</b> VLAN kai access switches par fail sakta hai; access configuration simple; kisi bhi access switch ke saath chalta hai.</li>
<li><b>Cons:</b> STP aadhe uplinks block karta hai (jab tak aap per-VLAN load-share na karo); failover STP aur FHRP timers par depend karta hai; VLAN bada failure domain hai; STP root aur FHRP active align karne padte hain (agla chapter).</li>
</ul>
<p>Lab mein yahi design hai: AS1 ka Gi0/0 DS1 ki taraf aur Gi0/1 DS2 ki taraf, aur DS1 aur DS2 Gi0/6 aur Gi0/7 se jude hain.</p>
<p>Do variants loop se bachte hain. <b>Loop-free U</b> mein pair ke dono access switches Layer 2 link se jude hote hain aur distribution link routed hota hai, isliye VLANs sirf us access pair tak failte hain aur kuch block nahi hota. <b>Loop-free inverted U</b> mein distribution link Layer 2 hota hai aur har access switch ka sirf ek uplink, isliye kuch block nahi hota lekin ek uplink fail hone par woh switch isolate ho jaata hai. Dono niche hain; aapko zyada tar looped triangle aur routed access milenge.</p>

<h3>Option 2: Routed access</h3>
<p>Layer 3 boundary neeche <b>access switch</b> tak aa jaati hai. Har uplink routed point-to-point link hai, access switch apne VLANs ka default gateway hai, aur woh distribution pair ki taraf OSPF ya EIGRP chalata hai.</p>
<ul>
<li><b>Pros:</b> uplinks par STP blocking nahi, dono uplinks equal-cost multipath (ECMP) se forward karte hain; FHRP ki zaroorat nahi kyunki access switch hi gateway hai; routing convergence tez aur deterministic; broadcasts aur loops ek switch par rehte hain, isliye failure domains bahut chhote.</li>
<li><b>Cons:</b> VLAN access switches ke paar nahi fail sakta; zyada IP planning (har uplink ke liye /30 ya /31, har access switch ke subnets); access switches ko Layer 3 features aur licensing chahiye.</li>
</ul>
<pre class="code"><span class="c">! Routed access switch ACC-R1 (example)</span>
ip routing
interface GigabitEthernet1/0/49
 description UPLINK-DIST1
 no switchport
 ip address 10.0.101.1 255.255.255.252
 ip ospf network point-to-point
interface GigabitEthernet1/0/50
 description UPLINK-DIST2
 no switchport
 ip address 10.0.102.1 255.255.255.252
 ip ospf network point-to-point
interface Vlan110
 ip address 10.1.110.1 255.255.255.0
router ospf 1
 router-id 10.255.0.21
 passive-interface default
 no passive-interface GigabitEthernet1/0/49
 no passive-interface GigabitEthernet1/0/50
 network 10.0.101.0 0.0.0.3 area 1
 network 10.0.102.0 0.0.0.3 area 1
 network 10.1.110.0 0.0.0.255 area 1</pre>
<pre class="out">ACC-R1# show ip route ospf
<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.0.101.2, 00:02:10, GigabitEthernet1/0/49</span>
<span class="hl">                [110/2] via 10.0.102.2, 00:02:10, GigabitEthernet1/0/50</span></pre>
<p>Do equal-cost default routes: dono uplinks traffic uthate hain. Access area ko totally stubby banana (ya access switch ko EIGRP stub) uski routing table ko bahut chhota rakhta hai aur use kabhi transit path banne nahi deta.</p>

<h3>Option 3: Virtual switching (StackWise Virtual)</h3>
<p>Dono distribution switches ek control plane ke saath <b>ek logical switch</b> mein jod diye jaate hain (Catalyst 9000 par StackWise Virtual, high-availability chapter mein cover). Access switch apne dono uplinks ko LACP ke saath ek <b>multichassis EtherChannel (MEC)</b> mein bundle karta hai. Spanning tree ke liye yeh ek port hai, isliye kuch block nahi hota. Gateway logical switch par ek SVI hai, isliye FHRP ki zaroorat nahi, aur VLANs phir bhi access switches ke paar fail sakte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen access models">
<text x="105" y="20" text-anchor="middle" class="svg-ink" font-size="13">L2 access</text>
<rect x="35" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="120" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="147" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<rect x="77" y="140" width="55" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="90" y1="50" x2="120" y2="50" stroke="#64748b" stroke-width="3"/><line x1="62" y1="65" x2="95" y2="140" stroke="#64748b" stroke-width="2"/><line x1="147" y1="65" x2="115" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="150" y="110" class="svg-accent" font-size="12">BLK</text>
<text x="105" y="200" text-anchor="middle" class="svg-muted" font-size="12">STP + FHRP</text>
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Routed access</text>
<rect x="250" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="277" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS1</text>
<rect x="335" y="35" width="55" height="30" rx="6" fill="#bae6fd"/><text x="362" y="55" text-anchor="middle" class="svg-ink" font-size="12">DS2</text>
<rect x="292" y="140" width="55" height="30" rx="6" fill="#fde68a"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="277" y1="65" x2="310" y2="140" stroke="#64748b" stroke-width="2"/><line x1="362" y1="65" x2="330" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">L3 uplinks, ECMP</text>
<text x="535" y="20" text-anchor="middle" class="svg-ink" font-size="13">Virtual switch</text>
<rect x="460" y="30" width="150" height="45" rx="10" fill="#ddd6fe"/><text x="535" y="57" text-anchor="middle" class="svg-ink" font-size="12">ek logical switch</text>
<rect x="507" y="140" width="55" height="30" rx="6" fill="#bbf7d0"/><text x="535" y="160" text-anchor="middle" class="svg-ink" font-size="12">AS</text>
<line x1="495" y1="75" x2="525" y2="140" stroke="#64748b" stroke-width="2"/><line x1="575" y1="75" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<ellipse cx="535" cy="118" rx="30" ry="8" fill="none" stroke="#64748b"/>
<text x="535" y="200" text-anchor="middle" class="svg-muted" font-size="12">MEC, koi blocking nahi</text>
</svg><p class="cap">L2 access ek uplink block karta hai; routed access aur virtual switching dono use karte hain.</p></div>

<table class="cmp"><tr><th>Sawaal</th><th>L2 access</th><th>Routed access</th><th>Virtual switching</th></tr>
<tr><td>Forward karne wale uplinks</td><td>Har VLAN mein ek</td><td>Dono (ECMP)</td><td>Dono (MEC)</td></tr>
<tr><td>STP ka role</td><td>Active, blocking</td><td>Sirf edge ports par</td><td>Sirf loop protection</td></tr>
<tr><td>FHRP chahiye</td><td>Haan</td><td>Nahi</td><td>Nahi</td></tr>
<tr><td>VLAN access switches ke paar</td><td>Haan</td><td>Nahi</td><td>Haan</td></tr>
<tr><td>Failure domain</td><td>Poora VLAN</td><td>Ek access switch</td><td>Poora VLAN</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek floor par chaar access switches hain, har ek ke do 10 Gbps uplinks. L2 access aur bina per-VLAN load sharing ke, har switch ke paas asal mein 10 Gbps upar hai (80 Gbps uplinks lage, 40 Gbps use). Routed access ya MEC ke saath poore 80 Gbps forward karte hain. Wahi cables, double usable bandwidth.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Routed access chunna aur phir pata chalna ki ek legacy application ko kai floors par ek subnet chahiye. Ek block ke andar bina plan ke models mix karna. Bhool jaana ki routed access mein bhi edge ports par BPDU guard ke saath STP chahiye, kyunki users ab bhi switches laga sakte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Routed access mein <b>koi FHRP nahi</b> aur <b>uplinks par STP blocking nahi</b>; trade-off yeh hai ki VLANs access switches ke paar nahi fail sakte. Jo question poochhe ki VLANs ko switches ke paar failaye bina dono uplinks kaise use karein, woh routed access ki taraf ishara hai; jismein VLANs failane zaroori hon, woh MEC ke saath virtual switching ki taraf.</p></div>

<div class="scn"><h4>Woh lab jise ek subnet chahiye tha</h4><p>Ek university ne apna science block routed access mein convert kiya. Uplink failure ke baad convergence kai seconds se ghat kar ek second se kaafi kam ho gaya aur uplink utilisation double ho gaya. Do hafte baad physics lab ne complain kiya: ek purani instrument-control application broadcasts se apne devices dhoondhti thi aur use saari benches ek subnet par chahiye thi, lekin benches do floors par alag access switches par thi. Engineer ne building ke liye routed access rakha, har lab ki instrument benches ko ek dedicated access switch par rakha, aur future moves ke liye constraint document kiya.</p><p><b>Seekh:</b> L3 boundary ko access layer tak laane se pehle application ki Layer 2 requirements check karo.</p></div>

<div class="iv"><p class="q">"Layer 2 access aur routed access compare karo. Aap kaunsa chunoge?"</p><p>Samjhao ki L2 access VLANs ko access switches ke paar failne deta hai lekin STP (ek uplink blocked) aur STP root ke saath aligned FHRP par depend karta hai. Routed access gateway ko access switch par le aata hai, ECMP se dono uplinks use karta hai, jaldi converge karta hai aur failure domains ko bahut chhota rakhta hai, lekin VLAN apne access switch se bahar nahi ja sakta. Bina VLAN-spanning zarooraton wale naye builds ke liye routed access chuno; jab VLANs failane zaroori hon to L2 access ya MEC ke saath virtual switching. SD-Access ka zikr, jo overlay se routed access plus stretched subnets deta hai, strong finish hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>L2 access: VLANs fail sakte hain, lekin STP ek uplink block karta hai aur FHRP chahiye.</li>
<li>Routed access: access switch gateway hai, dono uplinks ECMP se forward, koi FHRP nahi, bahut chhote failure domains.</li>
<li>Virtual switching (StackWise Virtual + MEC): koi blocking nahi, koi FHRP nahi, VLANs phir bhi fail sakte hain.</li>
<li>Loop-free U aur inverted U loop hatate hain lekin scaling ya isolation ki limits hain.</li>
<li>Lab looped triangle mein L2 access use karti hai, isliye STP aur HSRP align karne padte hain.</li>
</ul></div>
`}};export{e as default};