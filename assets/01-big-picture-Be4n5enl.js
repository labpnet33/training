var e={id:`big-picture`,h:{en:`The big picture: Layer 2 at CCNP depth`,hi:`Big picture: CCNP depth par Layer 2`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>How a switch really builds and uses its <b>CAM table</b>, and why every Layer 2 problem ends up as a CAM problem.</li>
<li>How to troubleshoot <b>static and dynamic 802.1Q trunks</b>: DTP modes, VTP side effects, allowed lists and the native VLAN.</li>
<li>How <b>LACP and PAgP</b> build an EtherChannel, what the <b>misconfig guard</b> protects you from, and how the <b>load-balancing hash</b> decides which member carries a flow (and why it sometimes polarises).</li>
<li>The <b>STP deep dive</b>: 802.1D recap, RSTP proposal/agreement, link types and topology-change handling.</li>
<li><b>MST</b>: regions, IST, MSTI, CIST, boundary ports, interaction with PVST+ and a different root per instance.</li>
<li>The <b>STP enhancements</b>: PortFast, BPDU Guard, BPDU Filter, Root Guard, Loop Guard and UDLD.</li>
<li>A <b>troubleshooting workflow</b> that walks all three labs of this module.</li>
</ul>
<p>This module covers ENCOR 350-401 v1.2 exam topic <b>3.1 Layer 2</b> completely: troubleshoot static and dynamic 802.1Q trunking protocols, troubleshoot static and dynamic EtherChannels, and configure and verify common Spanning Tree Protocols (RSTP, MST) and STP enhancements (root guard, loop guard, BPDU guard).</p>

<h3>Prerequisites</h3>
<p>You should already be comfortable with the CCNA material: creating VLANs and access ports, a basic trunk, a basic LACP bundle, and how classic STP elects a root and blocks a port. If any of that feels shaky, revisit the CCNA modules on VLANs, EtherChannel and STP first. Here we do not re-teach them from zero; we go one level deeper, to the point where you can explain <b>why</b> the switch behaves as it does and fix it under pressure. The next ENCOR modules (EIGRP, OSPF, BGP) move up to Layer 3; the FHRP module later builds on the root placement you learn here.</p>

<h3>The big picture: a city road network</h3>
<p>Think of a campus as a city. The <b>switches</b> are junctions. A <b>trunk</b> is a highway that carries buses of many colours (VLANs) at once; each bus carries a coloured sticker (the 802.1Q tag) so the next junction knows which route it belongs to. One colour, the <b>native VLAN</b>, travels without a sticker, and if the two ends of the highway disagree about that colour, passengers quietly end up on the wrong route.</p>
<p>An <b>EtherChannel</b> is a four-lane bridge built from four single-lane bridges. The toll booth (the <b>hash</b>) sends every car of the same family down the same lane so the family arrives in order. If all cars come from one family (one server MAC), three lanes stay empty.</p>
<p><b>Spanning Tree</b> is the traffic police. Roads in a city form circles, and a car that drives in a circle forever (a frame in a Layer 2 loop has no TTL) jams everything. The police close just enough roads to break every circle, and reopen one instantly when an open road fails. <b>Rapid PVST+</b> writes a separate traffic plan for every bus colour. <b>MST</b> says: we only have two useful plans anyway, so let us group the colours into a few plans (instances) and share them among all junctions that agreed on the same rule book (the <b>region</b>).</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="80" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="150" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="150" y="70" text-anchor="middle" class="svg-muted" font-size="12">root MST0, MST1</text>
<rect x="420" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="490" y="70" text-anchor="middle" class="svg-muted" font-size="12">root MST2</text>
<rect x="250" y="180" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 - Gi0/1 trunk</text>
<line x1="170" y1="80" x2="280" y2="180" stroke="#64748b" stroke-width="3"/><text x="170" y="140" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2 - Gi0/1</text>
<line x1="470" y1="80" x2="360" y2="180" stroke="#64748b" stroke-width="3"/><text x="480" y="140" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2 - Gi0/2</text>
<text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 USERS, 20 VOICE, 30 SERVERS, 40 MGMT</text>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">region NK-CAMPUS rev 1: MST1 = 10,20   MST2 = 30,40</text>
</svg><p class="cap">The triangle used in the MST labs. Every link is an 802.1Q trunk with DTP turned off.</p></div>

<h3>Why this matters in a real network</h3>
<p>Layer 2 failures are the most dangerous kind. A routing mistake usually drops traffic for one prefix; a Layer 2 loop can melt an entire building in seconds, because broadcasts multiply, CAM tables flap and switch CPUs peg at 100 percent. At the same time, Layer 2 mistakes are often <b>silent</b>: a native VLAN mismatch leaks traffic between VLANs, a hash sends everything down one link, an MST region typo quietly removes your load sharing. CCNP-level engineers are expected to find these problems from the show output alone.</p>

<div class="eg"><p><b>Worked example: why MST saves work.</b> A campus has 300 VLANs and two distribution switches. With Rapid PVST+, every switch runs 300 spanning-tree instances and every trunk sends 300 BPDUs every 2 seconds, that is 150 BPDUs per second per trunk. But there are only two sensible topologies: "left uplink forwards" or "right uplink forwards". With MST you map VLANs 1-150 to instance 1 and 151-300 to instance 2. Now each trunk sends one BPDU every 2 seconds carrying the information for both instances. Same load sharing, a fraction of the CPU and far simpler troubleshooting.</p></div>

<h3>How the module is organised</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab link</th></tr>
<tr><td>2</td><td>CAM table and switching recap</td><td>Used in every lab to prove the path</td></tr>
<tr><td>3-4</td><td>Trunks, DTP, VTP, native VLAN</td><td>All labs use <code>switchport nonegotiate</code> trunks</td></tr>
<tr><td>5-6</td><td>EtherChannel negotiation and load balancing</td><td>Lab 2: Spread traffic across an EtherChannel</td></tr>
<tr><td>7</td><td>802.1D recap and RSTP</td><td>Foundation for MST</td></tr>
<tr><td>8-9</td><td>MST concepts, configuration, boundaries</td><td>Lab 1: Build an MST region with two instances</td></tr>
<tr><td>10</td><td>STP enhancements</td><td>PortFast on host ports in every lab</td></tr>
<tr><td>11</td><td>Troubleshooting workflow</td><td>Lab 3: Three switches, three regions</td></tr>
<tr><td>12</td><td>Summary and exam checklist</td><td>-</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Jumping straight to spanning tree when "VLAN 30 does not work". Most Layer 2 tickets are solved lower down: a member port suspended from a bundle, a VLAN missing from an allowed list, or a VLAN that does not exist on one switch. Work bottom-up: link, bundle, trunk, VLAN, STP, CAM.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint 3.1 says <b>troubleshoot</b> trunking and EtherChannel but <b>configure and verify</b> STP. Expect show-output questions where you must spot the broken parameter, and configuration questions for RSTP, MST and the guards. Know the exact command names: <code>spanning-tree guard root</code>, <code>spanning-tree guard loop</code>, <code>spanning-tree bpduguard enable</code>.</p></div>

<div class="scn"><h4>The quiet upgrade</h4><p>A retail head office moved from Rapid PVST+ to MST over a weekend. On Monday nothing was down, but the uplink graphs showed one distribution uplink at 90 percent and the other at 2 percent. The engineer ran <code>show spanning-tree mst configuration</code> on each access switch and found one switch with the region name typed as "Nk-Campus" instead of "NK-CAMPUS". That switch was a region of its own, so all its VLANs followed the CIST and one uplink. Fixing the name restored the instance-based load sharing.</p><p><b>Lesson:</b> Layer 2 mistakes rarely cause a clean outage; they cause wrong paths. Always prove the path, not just reachability.</p></div>

<div class="iv"><p class="q">"What is the difference between Rapid PVST+ and MST, and when would you choose MST?"</p><p>Strong answer: Rapid PVST+ runs one RSTP instance per VLAN, which gives per-VLAN load sharing but scales poorly with hundreds of VLANs. MST (802.1s) maps many VLANs to a few instances inside a region and sends one BPDU carrying all instances. Choose MST for large VLAN counts, multi-vendor networks (it is an IEEE standard) or when CPU and BPDU load matter. Mention that it adds a design task: every switch must share the same region name, revision and VLAN mapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR 3.1 = troubleshoot trunks and EtherChannels, configure and verify RSTP, MST and the STP guards.</li>
<li>Trunks carry many VLANs using 802.1Q tags; the native VLAN is untagged and must match.</li>
<li>An EtherChannel hashes each flow onto one member; the hash inputs decide how even the spread is.</li>
<li>MST groups VLANs into a few instances inside a region defined by name, revision and mapping.</li>
<li>Troubleshoot bottom-up and always prove the actual path, not just ping success.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Switch apni <b>CAM table</b> asal mein kaise banata aur use karta hai, aur kyun har Layer 2 problem aakhir mein CAM problem ban jaati hai.</li>
<li><b>Static aur dynamic 802.1Q trunks</b> ko troubleshoot kaise karein: DTP modes, VTP ke side effects, allowed lists aur native VLAN.</li>
<li><b>LACP aur PAgP</b> EtherChannel kaise banate hain, <b>misconfig guard</b> aapko kis cheez se bachata hai, aur <b>load-balancing hash</b> kaise decide karta hai ki kaunsa member kaunsa flow le jaayega (aur kabhi kabhi polarise kyun hota hai).</li>
<li><b>STP deep dive</b>: 802.1D recap, RSTP proposal/agreement, link types aur topology-change handling.</li>
<li><b>MST</b>: regions, IST, MSTI, CIST, boundary ports, PVST+ ke saath interaction aur har instance ka alag root.</li>
<li><b>STP enhancements</b>: PortFast, BPDU Guard, BPDU Filter, Root Guard, Loop Guard aur UDLD.</li>
<li>Ek <b>troubleshooting workflow</b> jo is module ki teeno labs ko step by step chalata hai.</li>
</ul>
<p>Yeh module ENCOR 350-401 v1.2 ka exam topic <b>3.1 Layer 2</b> poora cover karta hai: static aur dynamic 802.1Q trunking protocols troubleshoot karna, static aur dynamic EtherChannels troubleshoot karna, aur common Spanning Tree Protocols (RSTP, MST) aur STP enhancements (root guard, loop guard, BPDU guard) configure aur verify karna.</p>

<h3>Prerequisites</h3>
<p>Aapko CCNA material par pehle se comfortable hona chahiye: VLANs aur access ports banana, basic trunk, basic LACP bundle, aur classic STP kaise root elect karta hai aur port block karta hai. Agar inme se kuch bhi kamzor lagta hai, to pehle VLANs, EtherChannel aur STP ke CCNA modules dobara dekho. Yahan hum inhe zero se nahi padhayenge; hum ek level aur neeche jaayenge, jahan aap samjha sako ki switch <b>kyun</b> aisa behave karta hai aur pressure mein use fix kar sako. Agle ENCOR modules (EIGRP, OSPF, BGP) Layer 3 par jaate hain; baad ka FHRP module yahan seekhe gaye root placement par build karta hai.</p>

<h3>Big picture: ek shehar ka road network</h3>
<p>Campus ko ek shehar socho. <b>Switches</b> chauraahe hain. <b>Trunk</b> ek highway hai jo ek saath kai rangon ki buses (VLANs) le jaata hai; har bus par ek rangeen sticker (802.1Q tag) laga hota hai taaki agle chauraahe ko pata chale ki woh kis route ki hai. Ek rang, <b>native VLAN</b>, bina sticker ke chalta hai, aur agar highway ke dono ends us rang par agree nahi karte, to passengers chupchaap galat route par pahunch jaate hain.</p>
<p><b>EtherChannel</b> ek chaar-lane pul hai jo chaar single-lane pulon se bana hai. Toll booth (<b>hash</b>) ek hi family ki har car ko same lane mein bhejta hai taaki family order mein pahunche. Agar saari cars ek hi family se aati hain (ek server MAC), to teen lanes khaali rehti hain.</p>
<p><b>Spanning Tree</b> traffic police hai. Shehar ki sadkein gol chakkar banati hain, aur jo car hamesha chakkar mein ghoomti rahe (Layer 2 loop mein frame ka koi TTL nahi hota) woh sab jam kar deti hai. Police utni hi sadkein band karti hai jitni har chakkar todne ke liye chahiye, aur khuli sadak fail ho to band wali turant khol deti hai. <b>Rapid PVST+</b> har bus rang ke liye alag traffic plan likhta hai. <b>MST</b> kehta hai: waise bhi kaam ke sirf do plans hain, to rangon ko kuch plans (instances) mein group karo aur un saare chauraahon mein share karo jo same rule book (<b>region</b>) par agree karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="80" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="150" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="150" y="70" text-anchor="middle" class="svg-muted" font-size="12">root MST0, MST1</text>
<rect x="420" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="490" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="490" y="70" text-anchor="middle" class="svg-muted" font-size="12">root MST2</text>
<rect x="250" y="180" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="202" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="220" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/><text x="320" y="46" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 - Gi0/1 trunk</text>
<line x1="170" y1="80" x2="280" y2="180" stroke="#64748b" stroke-width="3"/><text x="170" y="140" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2 - Gi0/1</text>
<line x1="470" y1="80" x2="360" y2="180" stroke="#64748b" stroke-width="3"/><text x="480" y="140" text-anchor="middle" class="svg-accent" font-size="12">Gi0/2 - Gi0/2</text>
<text x="320" y="265" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 USERS, 20 VOICE, 30 SERVERS, 40 MGMT</text>
<text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="12">region NK-CAMPUS rev 1: MST1 = 10,20   MST2 = 30,40</text>
</svg><p class="cap">MST labs mein use hone wala triangle. Har link 802.1Q trunk hai jisme DTP band hai.</p></div>

<h3>Real network mein yeh kyun matter karta hai</h3>
<p>Layer 2 failures sabse khatarnaak hote hain. Routing ki galti aam taur par ek prefix ka traffic girati hai; Layer 2 loop kuch hi second mein poori building ko pighla sakta hai, kyunki broadcasts badhte jaate hain, CAM tables flap karti hain aur switch CPUs 100 percent par atak jaate hain. Saath hi, Layer 2 galtiyan aksar <b>khamosh</b> hoti hain: native VLAN mismatch VLANs ke beech traffic leak karta hai, hash sab kuch ek link par bhej deta hai, MST region ka typo chupchaap aapka load sharing hata deta hai. CCNP-level engineers se ummeed hoti hai ki woh sirf show output se yeh problems dhoondh lein.</p>

<div class="eg"><p><b>Worked example: MST kaam kyun bachata hai.</b> Ek campus mein 300 VLANs aur do distribution switches hain. Rapid PVST+ ke saath har switch 300 spanning-tree instances chalata hai aur har trunk har 2 second mein 300 BPDUs bhejta hai, yaani har trunk par 150 BPDUs per second. Lekin sensible topologies sirf do hain: "left uplink forward kare" ya "right uplink forward kare". MST ke saath aap VLANs 1-150 ko instance 1 aur 151-300 ko instance 2 mein map karte ho. Ab har trunk har 2 second mein ek BPDU bhejta hai jisme dono instances ki info hoti hai. Same load sharing, CPU ka ek chhota hissa aur bahut aasaan troubleshooting.</p></div>

<h3>Module kaise organised hai</h3>
<table class="cmp"><tr><th>Chapters</th><th>Topic</th><th>Lab link</th></tr>
<tr><td>2</td><td>CAM table aur switching recap</td><td>Har lab mein path prove karne ke liye</td></tr>
<tr><td>3-4</td><td>Trunks, DTP, VTP, native VLAN</td><td>Saari labs <code>switchport nonegotiate</code> trunks use karti hain</td></tr>
<tr><td>5-6</td><td>EtherChannel negotiation aur load balancing</td><td>Lab 2: EtherChannel par traffic failao</td></tr>
<tr><td>7</td><td>802.1D recap aur RSTP</td><td>MST ki neev</td></tr>
<tr><td>8-9</td><td>MST concepts, configuration, boundaries</td><td>Lab 1: Do instances wala MST region banao</td></tr>
<tr><td>10</td><td>STP enhancements</td><td>Har lab mein host ports par PortFast</td></tr>
<tr><td>11</td><td>Troubleshooting workflow</td><td>Lab 3: Teen switches, teen regions</td></tr>
<tr><td>12</td><td>Summary aur exam checklist</td><td>-</td></tr></table>

<div class="warn"><p><b>Common galti.</b> "VLAN 30 kaam nahi kar raha" sunte hi seedha spanning tree par koodna. Zyada tar Layer 2 tickets neeche hi solve ho jaate hain: bundle se suspend hua member port, allowed list se gayab VLAN, ya aisa VLAN jo ek switch par exist hi nahi karta. Neeche se upar kaam karo: link, bundle, trunk, VLAN, STP, CAM.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint 3.1 trunking aur EtherChannel ke liye <b>troubleshoot</b> kehta hai lekin STP ke liye <b>configure aur verify</b>. Show-output questions expect karo jahan aapko toota hua parameter pakadna hai, aur RSTP, MST aur guards ke configuration questions. Exact command names yaad rakho: <code>spanning-tree guard root</code>, <code>spanning-tree guard loop</code>, <code>spanning-tree bpduguard enable</code>.</p></div>

<div class="scn"><h4>Khamosh upgrade</h4><p>Ek retail head office ne ek weekend mein Rapid PVST+ se MST par move kiya. Monday ko kuch down nahi tha, lekin uplink graphs mein ek distribution uplink 90 percent par tha aur doosra 2 percent par. Engineer ne har access switch par <code>show spanning-tree mst configuration</code> chalaya aur ek switch mila jahan region name "NK-CAMPUS" ki jagah "Nk-Campus" type hua tha. Woh switch apna alag region tha, isliye uske saare VLANs CIST aur ek hi uplink follow kar rahe the. Name theek karne se instance-based load sharing wapas aa gaya.</p><p><b>Seekh:</b> Layer 2 galtiyan shayad hi kabhi saaf outage banati hain; woh galat paths banati hain. Hamesha path prove karo, sirf reachability nahi.</p></div>

<div class="iv"><p class="q">"Rapid PVST+ aur MST mein kya fark hai, aur aap MST kab choose karoge?"</p><p>Strong answer: Rapid PVST+ har VLAN ke liye ek RSTP instance chalata hai, jo per-VLAN load sharing deta hai lekin sainkdon VLANs ke saath achhe se scale nahi karta. MST (802.1s) region ke andar kai VLANs ko kuch instances mein map karta hai aur ek hi BPDU bhejta hai jisme saare instances hote hain. Zyada VLANs, multi-vendor networks (yeh IEEE standard hai) ya jab CPU aur BPDU load matter kare tab MST choose karo. Yeh bhi bolo ki isse ek design task judta hai: har switch par same region name, revision aur VLAN mapping honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR 3.1 = trunks aur EtherChannels troubleshoot karna, RSTP, MST aur STP guards configure aur verify karna.</li>
<li>Trunks 802.1Q tags se kai VLANs le jaate hain; native VLAN untagged hota hai aur match hona chahiye.</li>
<li>EtherChannel har flow ko ek member par hash karta hai; hash inputs decide karte hain ki spread kitna barabar hai.</li>
<li>MST VLANs ko ek region ke andar kuch instances mein group karta hai; region name, revision aur mapping se define hota hai.</li>
<li>Neeche se upar troubleshoot karo aur hamesha actual path prove karo, sirf ping success nahi.</li>
</ul></div>
`}};export{e as default};