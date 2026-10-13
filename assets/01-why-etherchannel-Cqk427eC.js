var e={id:`why-etherchannel`,h:{en:`Why bundle links: the big picture`,hi:`Links bundle kyun karein: big picture`},body:{en:`
<p>Imagine two cities joined by four parallel roads. The traffic police are terrified of cars driving in circles, so they close three roads and leave only one open. You paid for four roads and you use one. Now imagine the city engineers paint the four roads as <b>one highway with four lanes</b>, give it one name and one entry gate. The police now see a single road, nothing circular, and every lane carries cars. That is exactly what <b>EtherChannel</b> does for switches: spanning tree is the nervous traffic police, the cables are the roads, and the port-channel is the four-lane highway.</p>

<h3>What you will learn</h3>
<ul>
<li>Why parallel links between switches waste bandwidth, and how a bundle fixes it.</li>
<li>The three ways to build a bundle: static <code>on</code>, <b>LACP</b> (active/passive) and <b>PAgP</b> (desirable/auto), and which mode combinations form a channel.</li>
<li>What must match on every member, and a safe configuration order.</li>
<li>Layer 2 and Layer 3 port-channels, and a preview of multi-chassis bundles (StackWise, vPC).</li>
<li>How traffic is shared (hashing) and why links are never perfectly balanced.</li>
<li>How to verify with <code>show etherchannel summary</code>, <code>show etherchannel port-channel</code> and <code>show lacp neighbor</code>, and how to troubleshoot suspended, stand-alone and err-disabled members.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already be comfortable with interfaces, speed and duplex (module <b>ccna-interfaces</b>), VLANs and 802.1Q trunks including the native VLAN and allowed list (<b>ccna-vlans</b>), and the basic idea of spanning tree: it finds redundant paths and blocks some ports so no loop exists (<b>ccna-stp</b>). We will not re-teach those; we build on them.</p>

<h3>The problem: STP blocks your extra links</h3>
<p>Connect SW1 and SW2 with two cables and you have created a Layer 2 loop. Spanning tree does its job: it puts one of the two ports into the blocking (discarding) state. The second cable is now only a spare. If the forwarding link fails, STP unblocks the spare, but that takes time (seconds with Rapid PVST+, up to 50 seconds with classic 802.1D), and during normal operation you get only one link's bandwidth.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two parallel links versus one EtherChannel">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Without EtherChannel</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">With EtherChannel (Po1)</text>
<line x1="320" y1="10" x2="320" y2="220" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="100" y="40" width="120" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="100" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="140" y1="80" x2="140" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="180" y1="80" x2="180" y2="160" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="194" y="125" class="svg-accent" font-size="12">blocked by STP</text>
<text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">usable: 1 Gbps</text>
<rect x="420" y="40" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="420" y="160" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="460" y1="80" x2="460" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="500" y1="80" x2="500" y2="160" stroke="#64748b" stroke-width="3"/>
<ellipse cx="480" cy="120" rx="36" ry="16" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="524" y="125" class="svg-accent" font-size="12">one STP port</text>
<text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">usable: 2 Gbps, both forward</text>
</svg><p class="cap">STP sees two ports and a loop on the left; on the right it sees one logical port, Po1, and blocks nothing.</p></div>

<h3>The fix: one logical link</h3>
<p><b>EtherChannel</b> bundles 2 to 8 physical Ethernet ports into one logical interface called a <b>port-channel</b> (<code>interface Port-channel1</code>, shortened to <code>Po1</code>). The physical ports are called <b>members</b>. The IEEE name for the same idea is <b>link aggregation</b> or a <b>LAG</b>, standardised as 802.3ad and now 802.1AX. On servers the same thing is called <b>NIC teaming</b> or <b>bonding</b>. Different names, one concept.</p>
<p>A bundle gives you three benefits:</p>
<ul>
<li><b>STP sees one logical link.</b> Spanning tree runs on Po1, not on the members, so there is no loop to block. All members forward.</li>
<li><b>More bandwidth.</b> Up to 8 active members, so eight 1 Gbps links give up to 8 Gbps of aggregate capacity.</li>
<li><b>Redundancy with fast failover.</b> If one member fails, its traffic moves to the surviving members in well under a second. Po1 stays up, so STP does not reconverge and routing protocols see no change.</li>
</ul>
<p>There is a fourth, practical benefit: <b>one place to configure</b>. Trunk mode, allowed VLANs, native VLAN, STP settings or an IP address go on the port-channel interface, and the switch applies them to every member.</p>

<div class="eg"><p><b>Worked example.</b> An access switch has 48 users on 1 Gbps ports and two 1 Gbps uplinks to the distribution switch. Without a bundle, STP blocks one uplink: 48 Gbps of possible demand shares 1 Gbps, an oversubscription of 48:1. Bundle the two uplinks into Po1 and the ratio drops to 24:1, and losing one cable no longer triggers an STP event. But note one limit: traffic is shared <b>per flow</b>, not per frame. A single 3 Gbps backup transfer between two hosts still uses only one member, so it is capped at 1 Gbps. Chapter 8 explains why.</p></div>

<h3>Three ways to build a bundle</h3>
<table class="cmp"><tr><th>Method</th><th>Modes</th><th>Standard</th><th>Checks the far end?</th></tr>
<tr><td>Static</td><td><code>on</code></td><td>None</td><td>No</td></tr>
<tr><td>LACP</td><td><code>active</code>, <code>passive</code></td><td>IEEE 802.3ad / 802.1AX</td><td>Yes</td></tr>
<tr><td>PAgP</td><td><code>desirable</code>, <code>auto</code></td><td>Cisco proprietary</td><td>Yes</td></tr></table>
<p>The CCNA blueprint asks you to configure and verify Layer 2 and Layer 3 EtherChannel with LACP, and you must also recognise static and PAgP modes. In this module you will do all three in the labs: a static bundle between SW1 and SW2 (Po1), an LACP bundle of three uplinks between DSW1 and ASW1 (Po10), and a troubleshooting lab where a PAgP bundle (Po5) never came up.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking a bundle of two 1 Gbps links makes every transfer twice as fast. It doubles total capacity for many flows; one flow is still limited to one member.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP runs on the port-channel, not on the member ports. In <code>show spanning-tree</code> you see <code>Po1</code>, never the individual members. An answer that says "STP blocks one member of the bundle" is wrong.</p></div>

<div class="scn"><h4>The uplink that was half asleep</h4><p>A school's access switch had two uplinks to the core, but users complained about slow file transfers every morning when classes started. The engineer ran <code>show spanning-tree vlan 10</code> and saw Gi1/0/50 in BLK state: STP was blocking the second uplink, as designed. Interface counters showed the forwarding uplink at 95% utilisation. The fix was to bundle both uplinks into an LACP port-channel on both switches in a maintenance window.</p><p><b>Lesson:</b> parallel links without a bundle are just spares. If you want the bandwidth, bundle them.</p></div>

<div class="iv"><p class="q">"What is EtherChannel and why would you use it?"</p><p>Strong answer: EtherChannel bundles up to 8 physical links into one logical port-channel. STP treats it as one link so nothing is blocked, you get aggregate bandwidth, and a member failure is handled inside the bundle without STP reconvergence. Mention that load sharing is per flow by hashing, so one flow is limited to one member, and that LACP is the standard protocol to negotiate it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parallel links form a loop, so STP blocks all but one; EtherChannel makes them one logical link.</li>
<li>Port-channel = the logical interface (PoN); members = the physical ports; LAG, bond and team are other names.</li>
<li>Benefits: no STP blocking, aggregate bandwidth, sub-second member failover, one place to configure.</li>
<li>Three methods: static on, LACP (active/passive, open standard), PAgP (desirable/auto, Cisco only).</li>
<li>Traffic is shared per flow, so one flow never exceeds one member's speed.</li>
</ul></div>
`,hi:`
<p>Socho do shehar chaar parallel sadakon se jude hain. Traffic police ko darr hai ki gaadiyan gol gol ghoomti rahengi, isliye woh teen sadakein band kar deti hai aur sirf ek khuli chhodti hai. Paise diye chaar sadakon ke, use ho rahi hai ek. Ab socho city engineers chaar sadakon ko <b>chaar lanes wala ek highway</b> paint kar dete hain, use ek naam aur ek entry gate dete hain. Police ko ab ek hi sadak dikhti hai, kuch gol nahi, aur har lane mein gaadiyan chalti hain. Switches ke liye <b>EtherChannel</b> bilkul yahi karta hai: spanning tree ghabrayi hui traffic police hai, cables sadakein hain, aur port-channel chaar lanes wala highway hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>Switches ke beech parallel links bandwidth kyun waste karte hain, aur bundle ise kaise theek karta hai.</li>
<li>Bundle banane ke teen tarike: static <code>on</code>, <b>LACP</b> (active/passive) aur <b>PAgP</b> (desirable/auto), aur kaunse mode combinations channel banate hain.</li>
<li>Har member par kya match hona chahiye, aur configuration ka safe order.</li>
<li>Layer 2 aur Layer 3 port-channels, aur multi-chassis bundles (StackWise, vPC) ka preview.</li>
<li>Traffic kaise baanta jaata hai (hashing) aur links kabhi perfectly balanced kyun nahi hote.</li>
<li><code>show etherchannel summary</code>, <code>show etherchannel port-channel</code> aur <code>show lacp neighbor</code> se verify kaise karein, aur suspended, stand-alone aur err-disabled members ko troubleshoot kaise karein.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pehle se interfaces, speed aur duplex (module <b>ccna-interfaces</b>), VLANs aur 802.1Q trunks native VLAN aur allowed list ke saath (<b>ccna-vlans</b>), aur spanning tree ka basic idea aana chahiye: woh redundant paths dhoondhta hai aur kuch ports block karta hai taaki koi loop na rahe (<b>ccna-stp</b>). Hum inhe dobara nahi padhayenge; hum inke upar build karenge.</p>

<h3>Problem: STP aapke extra links block karta hai</h3>
<p>SW1 aur SW2 ko do cables se jodo aur aapne ek Layer 2 loop bana diya. Spanning tree apna kaam karta hai: do mein se ek port ko blocking (discarding) state mein daal deta hai. Doosra cable ab sirf spare hai. Agar forwarding link fail ho, to STP spare ko unblock karta hai, lekin isme time lagta hai (Rapid PVST+ ke saath kuch seconds, classic 802.1D ke saath 50 seconds tak), aur normal operation mein aapko sirf ek link ki bandwidth milti hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do parallel links vs ek EtherChannel">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">EtherChannel ke bina</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">EtherChannel ke saath (Po1)</text>
<line x1="320" y1="10" x2="320" y2="220" stroke="#64748b" stroke-dasharray="4 4"/>
<rect x="100" y="40" width="120" height="40" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="100" y="160" width="120" height="40" rx="8" fill="#bae6fd"/><text x="160" y="185" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="140" y1="80" x2="140" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="180" y1="80" x2="180" y2="160" stroke="#64748b" stroke-width="3" stroke-dasharray="6 4"/>
<text x="194" y="125" class="svg-accent" font-size="12">STP ne block kiya</text>
<text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">usable: 1 Gbps</text>
<rect x="420" y="40" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="65" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="420" y="160" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="185" text-anchor="middle" class="svg-ink" font-size="13">SW2</text>
<line x1="460" y1="80" x2="460" y2="160" stroke="#64748b" stroke-width="3"/>
<line x1="500" y1="80" x2="500" y2="160" stroke="#64748b" stroke-width="3"/>
<ellipse cx="480" cy="120" rx="36" ry="16" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="524" y="125" class="svg-accent" font-size="12">ek STP port</text>
<text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">usable: 2 Gbps, dono forward</text>
</svg><p class="cap">Left side par STP ko do ports aur ek loop dikhta hai; right side par use ek logical port, Po1, dikhta hai aur woh kuch block nahi karta.</p></div>

<h3>Fix: ek logical link</h3>
<p><b>EtherChannel</b> 2 se 8 physical Ethernet ports ko ek logical interface mein bundle karta hai jise <b>port-channel</b> kehte hain (<code>interface Port-channel1</code>, short mein <code>Po1</code>). Physical ports ko <b>members</b> kehte hain. Isi idea ka IEEE naam <b>link aggregation</b> ya <b>LAG</b> hai, jo 802.3ad aur ab 802.1AX mein standardised hai. Servers par isi cheez ko <b>NIC teaming</b> ya <b>bonding</b> kehte hain. Naam alag, concept ek.</p>
<p>Bundle aapko teen faayde deta hai:</p>
<ul>
<li><b>STP ko ek logical link dikhta hai.</b> Spanning tree Po1 par chalta hai, members par nahi, isliye block karne ke liye koi loop nahi. Saare members forward karte hain.</li>
<li><b>Zyada bandwidth.</b> 8 tak active members, to aath 1 Gbps links 8 Gbps tak ki aggregate capacity dete hain.</li>
<li><b>Fast failover ke saath redundancy.</b> Ek member fail ho to uska traffic ek second se bhi kam mein bache hue members par chala jaata hai. Po1 up rehta hai, isliye STP reconverge nahi karta aur routing protocols ko koi change nahi dikhta.</li>
</ul>
<p>Ek chautha, practical faayda bhi hai: <b>configure karne ki ek jagah</b>. Trunk mode, allowed VLANs, native VLAN, STP settings ya IP address port-channel interface par jaate hain, aur switch unhe har member par laga deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek access switch par 1 Gbps ports par 48 users hain aur distribution switch tak do 1 Gbps uplinks. Bundle ke bina STP ek uplink block karta hai: 48 Gbps ki possible demand 1 Gbps share karti hai, yaani 48:1 oversubscription. Dono uplinks ko Po1 mein bundle karo to ratio 24:1 ho jaata hai, aur ek cable jaane par STP event nahi hota. Lekin ek limit note karo: traffic <b>per flow</b> baanta jaata hai, per frame nahi. Do hosts ke beech ek 3 Gbps backup transfer phir bhi sirf ek member use karta hai, isliye woh 1 Gbps par capped hai. Chapter 8 batata hai kyun.</p></div>

<h3>Bundle banane ke teen tarike</h3>
<table class="cmp"><tr><th>Tarika</th><th>Modes</th><th>Standard</th><th>Doosra end check karta hai?</th></tr>
<tr><td>Static</td><td><code>on</code></td><td>Koi nahi</td><td>Nahi</td></tr>
<tr><td>LACP</td><td><code>active</code>, <code>passive</code></td><td>IEEE 802.3ad / 802.1AX</td><td>Haan</td></tr>
<tr><td>PAgP</td><td><code>desirable</code>, <code>auto</code></td><td>Cisco proprietary</td><td>Haan</td></tr></table>
<p>CCNA blueprint aapse Layer 2 aur Layer 3 EtherChannel LACP ke saath configure aur verify karwata hai, aur aapko static aur PAgP modes bhi pehchanne aane chahiye. Is module ke labs mein aap teeno karoge: SW1 aur SW2 ke beech static bundle (Po1), DSW1 aur ASW1 ke beech teen uplinks ka LACP bundle (Po10), aur ek troubleshooting lab jahan PAgP bundle (Po5) kabhi up hi nahi hua.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki do 1 Gbps links ka bundle har transfer ko double fast bana deta hai. Yeh kai flows ke liye total capacity double karta hai; ek flow phir bhi ek member tak limited hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP port-channel par chalta hai, member ports par nahi. <code>show spanning-tree</code> mein aapko <code>Po1</code> dikhta hai, individual members kabhi nahi. Jo answer kahe "STP bundle ka ek member block karta hai" woh galat hai.</p></div>

<div class="scn"><h4>Aadha soya hua uplink</h4><p>Ek school ke access switch ke core tak do uplinks the, lekin har subah classes shuru hone par users slow file transfers ki shikayat karte the. Engineer ne <code>show spanning-tree vlan 10</code> chalaya aur Gi1/0/50 ko BLK state mein dekha: STP design ke hisaab se doosra uplink block kar raha tha. Interface counters mein forwarding uplink 95% utilisation par tha. Fix tha maintenance window mein dono switches par dono uplinks ko LACP port-channel mein bundle karna.</p><p><b>Seekh:</b> bundle ke bina parallel links sirf spares hain. Bandwidth chahiye to unhe bundle karo.</p></div>

<div class="iv"><p class="q">"EtherChannel kya hai aur aap ise kyun use karoge?"</p><p>Strong answer: EtherChannel 8 tak physical links ko ek logical port-channel mein bundle karta hai. STP use ek link maanta hai isliye kuch block nahi hota, aggregate bandwidth milti hai, aur member failure bundle ke andar hi handle hota hai bina STP reconvergence ke. Batao ki load sharing hashing se per flow hoti hai, isliye ek flow ek member tak limited hai, aur ise negotiate karne ka standard protocol LACP hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Parallel links loop banate hain, isliye STP ek ke alawa sab block karta hai; EtherChannel unhe ek logical link bana deta hai.</li>
<li>Port-channel = logical interface (PoN); members = physical ports; LAG, bond aur team iske doosre naam hain.</li>
<li>Faayde: STP blocking nahi, aggregate bandwidth, sub-second member failover, configure karne ki ek jagah.</li>
<li>Teen tarike: static on, LACP (active/passive, open standard), PAgP (desirable/auto, sirf Cisco).</li>
<li>Traffic per flow baanta jaata hai, isliye ek flow kabhi ek member ki speed se aage nahi jaata.</li>
</ul></div>
`}};export{e as default};