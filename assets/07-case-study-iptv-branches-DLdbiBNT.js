var e={id:`case-iptv`,h:{en:`Case study: IPTV for branches, from design to a failing branch`,hi:`Case study: branches ke liye IPTV, design se failing branch tak`},body:{en:`
<p>This chapter follows one project from the whiteboard to the first complaint. The customer is <b>Deccan Broadcast</b>, a regional news company that wants its channel to appear on screens in every branch office. The design below is the one used in the labs <code>mq-mroute-iptv-branch</code> and <code>mq-mroute-capstone</code>.</p>

<h3>The requirement</h3>
<p>One encoder in Mumbai produces one stream (about 8 Mbps). Pune, Delhi and later Chennai must show it. With unicast, three branches would need three copies, 24 Mbps leaving Mumbai; with multicast it is one copy per circuit, and the provider copies it again where needed. The branches have 50 to 100 Mbps circuits, so unicast would not scale to dozens of branches.</p>

<h3>The design in five decisions</h3>
<ol>
<li><b>Group address:</b> 239.77.1.1 for the first channel, 239.88.1.1 for the news channel. Both come from 239.0.0.0/8, the private range, so they never collide with public groups.</li>
<li><b>PIM sparse mode on every router interface</b> in the path, including the receiver LAN of each branch and the encoder LAN in Mumbai.</li>
<li><b>One static RP</b> on a loopback of the Mumbai router, 10.1.255.1. A loopback never goes down with a cable, and every router gets the same <code>ip pim rp-address 10.1.255.1</code>.</li>
<li><b>OSPF</b> for unicast reachability, including the RP loopback and all LANs. PIM will borrow it.</li>
<li><b>A server room per city</b> (switch and server), so the branch has its own local services.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IPTV design for Deccan Broadcast">
<rect x="10" y="20" width="170" height="86" rx="10" fill="#bbf7d0"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="13">Mumbai</text><text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="11">PC-ENC 10.1.0.20</text><text x="95" y="82" text-anchor="middle" class="svg-muted" font-size="11">RP loopback 10.1.255.1</text>
<rect x="450" y="10" width="170" height="64" rx="10" fill="#bae6fd"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="13">Delhi branch</text><text x="535" y="56" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.3.0.0/24</text>
<rect x="10" y="150" width="170" height="64" rx="10" fill="#bae6fd"/><text x="95" y="176" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text><text x="95" y="196" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.2.0.0/24</text>
<line x1="180" y1="50" x2="450" y2="40" stroke="#64748b" stroke-width="2"/><text x="315" y="36" text-anchor="middle" class="svg-accent" font-size="11">MPLS Mumbai-Delhi</text>
<line x1="95" y1="106" x2="95" y2="150" stroke="#64748b" stroke-width="2"/><text x="150" y="132" class="svg-accent" font-size="11">MPLS Mumbai-Pune</text>
<line x1="180" y1="182" x2="500" y2="74" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="360" y="150" text-anchor="middle" class="svg-muted" font-size="11">Internet VPN Pune-Delhi, unicast only</text>
</svg><p class="cap">Two MPLS circuits carry the stream. The Internet VPN is a unicast-only backup between the branches.</p></div>

<h3>Day one: the launch</h3>
<p>The team enables PIM, sets the RP, joins a test PC in each branch and starts the encoder. Pune shows a clear picture in minutes. Delhi shows nothing. Everything about Delhi looks right: its receiver joined, its router lists the group, the PIM neighbour towards Mumbai is up. The cost of that confusion is a branch office with a black screen during a live bulletin.</p>

<h3>Applying the method to Delhi</h3>
<p>Using the layered method from chapter 4, the engineer collects evidence in order:</p>
<ol>
<li><b>Layer 1, IGMP.</b> The Delhi router lists the group on its LAN. Healthy.</li>
<li><b>Layer 2, PIM.</b> A neighbour exists on the MPLS circuit. Healthy.</li>
<li><b>Layer 3, RP.</b> The mapping shows 10.1.255.1, the same as Mumbai. Healthy.</li>
<li><b>Layer 4, (*,G).</b> <code>show ip mroute</code> shows the group but <code>Incoming interface: Null</code>. Here is the first failing layer.</li>
<li><b>RPF.</b> <code>show ip rpf 10.1.255.1</code> names the <b>Internet VPN</b> interface with the note that PIM is not enabled on it.</li>
</ol>
<p>That is the clue: the router's best unicast path toward the head end does not go where the design says. Why unicast chose it is for you to find in the lab. The rules of the repair are fixed by the customer: no PIM on the VPN and no change to the OSPF design. Chapter 8 shows how to work inside those rules.</p>

<h3>Day two: three more cities</h3>
<p>When Chennai joins, the same company hits a different failure. Its new Internet circuit has a lower metric, so RPF moves to it. Then someone mis-types the RP in Delhi during a clean-up, and someone forgets <code>ip pim sparse-mode</code> on the LAN of the new Pune receiver switch. This is the capstone: three independent faults, found by three independent checks.</p>

<h3>What the case teaches</h3>
<table class="cmp"><tr><th>Design choice</th><th>Why it helps troubleshooting</th></tr>
<tr><td>Same group plan everywhere (239.x)</td><td>One address to type into every <code>show ip mroute</code></td></tr>
<tr><td>RP on a loopback</td><td>One address to check with <code>show ip rpf</code> in every city</td></tr>
<tr><td>Unicast-only circuits clearly labelled</td><td>You know at once which interfaces must never be an RPF path</td></tr>
<tr><td>Test PC per branch</td><td>Proves the tree before the customer finds the fault</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Testing only the first branch and declaring success. (2) Not recording which circuits carry PIM. (3) Leaving a temporary OSPF cost after a circuit test.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Multicast over two circuits uses both for load sharing." By default each source and group uses exactly one RPF interface, the other circuit is idle for that stream.</p></div>

<div class="scn"><h4>The pre-launch checklist that was skipped</h4><p>Deccan Broadcast launched the news channel on a Friday evening without the test PC in Delhi. The first complaint arrived from the Delhi manager during the 9 pm bulletin. A checklist item, "join a test receiver in every branch and read <code>show ip rpf</code> toward the RP", would have found the stale OSPF cost on Thursday.</p><p><b>Lesson:</b> prove the tree for every branch before the audience does.</p></div>

<div class="iv"><p class="q">"Design multicast for IPTV to 20 branches. What do you decide first?"</p><p>The group plan from 239.0.0.0/8, the RP location (a loopback on a stable head-end router, with a plan for redundancy), PIM sparse mode everywhere, and which circuits carry PIM. Then the verification: a test receiver per branch and a documented RPF check toward the RP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast turns N copies into one per circuit: the reason IPTV uses it.</li>
<li>A clean design is one group plan, one RP on a loopback, PIM on every interface in the path.</li>
<li>When one branch fails and another works, compare their RPF interfaces first.</li>
<li>Stale OSPF costs after tests are a top cause of branch-only failures.</li>
<li>Add a test receiver and an RPF check to every branch launch checklist.</li>
</ul></div>
`,hi:`
<p>Yeh chapter ek project ko whiteboard se pehli shikayat tak follow karta hai. Customer hai <b>Deccan Broadcast</b>, ek regional news company jo chahti hai ki uska channel har branch office ki screens par dikhe. Neeche ka design labs <code>mq-mroute-iptv-branch</code> aur <code>mq-mroute-capstone</code> mein use hua hai.</p>

<h3>Requirement</h3>
<p>Mumbai mein ek encoder ek stream (kareeb 8 Mbps) banata hai. Pune, Delhi aur baad mein Chennai ko use dikhana hai. Unicast se teen branches ko teen copies chahiye, Mumbai se 24 Mbps nikalti; multicast se har circuit par ek copy, aur provider zaroorat par use dobara copy karta hai. Branches ke circuits 50 se 100 Mbps ke hain, isliye unicast darjano branches tak scale nahi karta.</p>

<h3>Design paanch faislon mein</h3>
<ol>
<li><b>Group address:</b> pehle channel ke liye 239.77.1.1, news channel ke liye 239.88.1.1. Dono 239.0.0.0/8 se hain, private range, isliye public groups se kabhi nahi takraate.</li>
<li><b>Path ke har router interface par PIM sparse mode</b>, har branch ke receiver LAN aur Mumbai ke encoder LAN samet.</li>
<li><b>Ek static RP</b> Mumbai router ke loopback par, 10.1.255.1. Loopback cable ke saath kabhi down nahi hota, aur har router ko wahi <code>ip pim rp-address 10.1.255.1</code> milta hai.</li>
<li><b>OSPF</b> unicast reachability ke liye, RP loopback aur saare LANs samet. PIM ise udhaar lega.</li>
<li><b>Har city mein server room</b> (switch aur server), taaki branch ke paas apni local services hon.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Deccan Broadcast ke liye IPTV design">
<rect x="10" y="20" width="170" height="86" rx="10" fill="#bbf7d0"/><text x="95" y="44" text-anchor="middle" class="svg-ink" font-size="13">Mumbai</text><text x="95" y="64" text-anchor="middle" class="svg-muted" font-size="11">PC-ENC 10.1.0.20</text><text x="95" y="82" text-anchor="middle" class="svg-muted" font-size="11">RP loopback 10.1.255.1</text>
<rect x="450" y="10" width="170" height="64" rx="10" fill="#bae6fd"/><text x="535" y="36" text-anchor="middle" class="svg-ink" font-size="13">Delhi branch</text><text x="535" y="56" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.3.0.0/24</text>
<rect x="10" y="150" width="170" height="64" rx="10" fill="#bae6fd"/><text x="95" y="176" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text><text x="95" y="196" text-anchor="middle" class="svg-muted" font-size="11">LAN 10.2.0.0/24</text>
<line x1="180" y1="50" x2="450" y2="40" stroke="#64748b" stroke-width="2"/><text x="315" y="36" text-anchor="middle" class="svg-accent" font-size="11">MPLS Mumbai-Delhi</text>
<line x1="95" y1="106" x2="95" y2="150" stroke="#64748b" stroke-width="2"/><text x="150" y="132" class="svg-accent" font-size="11">MPLS Mumbai-Pune</text>
<line x1="180" y1="182" x2="500" y2="74" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="360" y="150" text-anchor="middle" class="svg-muted" font-size="11">Internet VPN Pune-Delhi, sirf unicast</text>
</svg><p class="cap">Do MPLS circuits stream le jaate hain. Internet VPN branches ke beech unicast-only backup hai.</p></div>

<h3>Pehla din: launch</h3>
<p>Team PIM on karti hai, RP set karti hai, har branch mein test PC join karwati hai aur encoder start karti hai. Pune mein kuch hi minute mein saaf picture dikhti hai. Delhi mein kuch nahi. Delhi ki har cheez theek lagti hai: receiver ne join kiya, router group list karta hai, Mumbai ki taraf PIM neighbour up hai. Is confusion ki keemat hai live bulletin ke dauran black screen wala branch office.</p>

<h3>Delhi par method lagana</h3>
<p>Chapter 4 ke layered method se engineer kram se evidence ikattha karta hai:</p>
<ol>
<li><b>Layer 1, IGMP.</b> Delhi router apne LAN par group list karta hai. Theek.</li>
<li><b>Layer 2, PIM.</b> MPLS circuit par neighbour hai. Theek.</li>
<li><b>Layer 3, RP.</b> Mapping 10.1.255.1 dikhati hai, Mumbai jaisi. Theek.</li>
<li><b>Layer 4, (*,G).</b> <code>show ip mroute</code> group dikhata hai par <code>Incoming interface: Null</code>. Yahan pehli failing layer hai.</li>
<li><b>RPF.</b> <code>show ip rpf 10.1.255.1</code> <b>Internet VPN</b> interface ka naam leta hai aur note ke saath ki us par PIM enabled nahi.</li>
</ol>
<p>Yahi clue hai: head end ki taraf router ka best unicast path wahan se nahi jaata jahan design kehta hai. Unicast ne use kyun chuna yeh lab mein aapko dhoondhna hai. Repair ke niyam customer ne tay kiye hain: VPN par PIM nahi aur OSPF design mein badlav nahi. Chapter 8 dikhata hai in niyamon ke andar kaam kaise karein.</p>

<h3>Doosra din: teen aur cities</h3>
<p>Chennai judta hai to wahi company ek alag failure se milti hai. Uske naye Internet circuit ka metric kam hai, isliye RPF uspar chala jaata hai. Phir clean-up ke dauran koi Delhi mein RP galat likh deta hai, aur koi naye Pune receiver switch ke LAN par <code>ip pim sparse-mode</code> bhool jaata hai. Yahi capstone hai: teen independent faults, teen independent checks se mile.</p>

<h3>Case se kya seekhte hain</h3>
<table class="cmp"><tr><th>Design choice</th><th>Troubleshooting mein kaise madad</th></tr>
<tr><td>Har jagah same group plan (239.x)</td><td>Har <code>show ip mroute</code> mein type karne ke liye ek address</td></tr>
<tr><td>Loopback par RP</td><td>Har city mein <code>show ip rpf</code> se check karne ke liye ek address</td></tr>
<tr><td>Unicast-only circuits saaf labelled</td><td>Turant pata chalta hai kaunse interface kabhi RPF path nahi hone chahiye</td></tr>
<tr><td>Har branch mein test PC</td><td>Customer ko fault milne se pehle tree prove karta hai</td></tr></table>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Sirf pehla branch test karke success ghoshit karna. (2) Yeh record na karna ki kaunse circuits PIM le jaate hain. (3) Circuit test ke baad temporary OSPF cost chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Do circuits par multicast load sharing ke liye dono use karta hai." Default mein har source aur group ek hi RPF interface use karta hai, doosra circuit us stream ke liye idle rehta hai.</p></div>

<div class="scn"><h4>Pre-launch checklist jo chhoot gayi</h4><p>Deccan Broadcast ne news channel Friday shaam ko Delhi mein test PC ke bina launch kiya. Pehli shikayat Delhi manager se 9 baje ke bulletin ke dauran aayi. Checklist ki ek item, "har branch mein test receiver join karo aur RP ki taraf <code>show ip rpf</code> padho", Thursday ko hi bacha hua OSPF cost pakad leti.</p><p><b>Lesson:</b> audience se pehle har branch ke liye tree prove karo.</p></div>

<div class="iv"><p class="q">"20 branches ko IPTV ke liye multicast design karo. Pehle kya decide karoge?"</p><p>239.0.0.0/8 se group plan, RP ki location (stable head-end router ka loopback, redundancy ke plan ke saath), har jagah PIM sparse mode, aur kaunse circuits PIM le jaate hain. Phir verification: har branch mein test receiver aur RP ki taraf documented RPF check.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast N copies ko har circuit par ek bana deta hai: IPTV isi liye ise use karta hai.</li>
<li>Saaf design: ek group plan, loopback par ek RP, path ke har interface par PIM.</li>
<li>Ek branch fail aur doosra chale to pehle unke RPF interfaces compare karo.</li>
<li>Test ke baad bache stale OSPF costs branch-only failures ka top karan hain.</li>
<li>Har branch launch checklist mein test receiver aur RPF check jodo.</li>
</ul></div>
`}};export{e as default};