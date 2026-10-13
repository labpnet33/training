var e={id:`big-picture`,h:{en:`OSPFv3 at ENARSI depth: the big picture`,hi:`ENARSI depth par OSPFv3: poori picture`},body:{en:`
<p>Think of a city with two separate books. The first book is a <b>road map</b>: it shows every junction and every road between junctions, but no house numbers. The second book is an <b>address directory</b>: it says which house numbers sit on which road. If a street gets new house numbers, you reprint the directory, not the road map. OSPFv3 works exactly like this. The topology (routers and links) lives in one set of LSAs, and the IPv6 prefixes live in another. Once you understand that split, almost every OSPFv3 show command and trouble ticket makes sense.</p>

<h3>What you will learn</h3>
<ul>
<li>How OSPFv3 really runs: per link, over link-local addresses, with instance IDs and interface IDs.</li>
<li>Every OSPFv3 LSA type, with the new <b>link LSA (type 8)</b> and <b>intra-area prefix LSA (type 9)</b> in depth.</li>
<li>Both configuration styles: traditional <code>ipv6 router ospf</code> and address-family <code>router ospfv3</code>, including IPv4 carried over OSPFv3.</li>
<li>Router ID rules, neighbour requirements and network types (broadcast, point-to-point, point-to-multipoint).</li>
<li>Passive interfaces, stub and NSSA areas, and summarisation with <code>area range</code> and <code>summary-prefix</code>.</li>
<li>Authentication with IPsec and the newer key-chain method.</li>
<li>A troubleshooting workflow for IPv6 routing, and a full walkthrough of the lab.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already know OSPFv3 basics from the CCNA module (enabling it on an interface, the router ID, <code>show ipv6 ospf neighbor</code>) and multi-area OSPF from ENCOR (ABRs, LSA types 1 to 5, <code>area range</code> for IPv4). We will refer back to those modules and not re-teach them. You also need IPv6 addressing: global unicast, link-local (FE80::/10) and prefix lengths. If a /62 sounds strange, revisit the CCNA IPv6 module first. The OSPFv2 stub, NSSA and virtual-link details are taught in the ENARSI OSPF module; here we only show what changes for IPv6.</p>

<h3>Where this sits in the ENARSI blueprint</h3>
<p>The ENARSI 300-410 v1.1 blueprint item <b>1.9 Troubleshoot OSPF (v2/v3)</b> lists address families, neighbour relationships, network types, area types, router types, path preference, summarisation and passive interfaces. It is a <b>troubleshoot</b> objective. That word matters: the exam shows you output and asks what is wrong. So in every chapter we look at the show commands first and at the symptom a mistake produces, not just the configuration.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="360" height="200" rx="10" fill="#e2e8f0"/><text x="40" y="42" class="svg-muted" font-size="12">Area 0</text>
<rect x="390" y="20" width="230" height="200" rx="10" fill="#ddd6fe"/><text x="410" y="42" class="svg-muted" font-size="12">Area 1</text>
<rect x="50" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="290" y="70" width="140" height="50" rx="8" fill="#fde68a"/><text x="360" y="92" text-anchor="middle" class="svg-ink" font-size="14">R2 (ABR)</text><text x="360" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="500" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 3.3.3.3</text>
<line x1="160" y1="95" x2="290" y2="95" stroke="#64748b" stroke-width="2"/><text x="225" y="86" text-anchor="middle" class="svg-accent" font-size="12">F12::/64</text>
<line x1="430" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="465" y="86" text-anchor="middle" class="svg-accent" font-size="12">F23::/64</text>
<rect x="50" y="165" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="190" text-anchor="middle" class="svg-ink" font-size="13">SW-USERS</text>
<line x1="105" y1="120" x2="105" y2="165" stroke="#64748b" stroke-width="2"/><text x="115" y="148" class="svg-accent" font-size="12">Gi0/2 100::/64</text>
<rect x="490" y="150" width="125" height="58" rx="8" fill="#fed7aa"/><text x="552" y="170" text-anchor="middle" class="svg-ink" font-size="12">Lo10-Lo13</text><text x="552" y="188" text-anchor="middle" class="svg-muted" font-size="12">10:: to 13::</text>
<line x1="555" y1="120" x2="555" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="12">All prefixes are inside 2001:DB8:ACAD::/48, OSPFv3 process 1</text>
</svg><p class="cap">The Bengaluru R&amp;D lab: R1 and the user LAN in area 0, R2 as the ABR, R3 and four lab loopbacks in area 1.</p></div>

<h3>The lab you will build</h3>
<p>The module lab is called <b>OSPFv3 passive, point-to-point and summarisation</b>. The Bengaluru R&amp;D network already runs OSPFv3 process 1 with default settings, using the traditional configuration style:</p>
<ul>
<li><b>R1</b> (router ID 1.1.1.1): Gi0/0 <code>2001:DB8:ACAD:F12::1/64</code> toward R2 and Gi0/2 <code>2001:DB8:ACAD:100::1/64</code> toward the user switch SW-USERS, both in area 0.</li>
<li><b>R2</b> (2.2.2.2), the ABR: Gi0/0 <code>2001:DB8:ACAD:F12::2/64</code> in area 0 and Gi0/1 <code>2001:DB8:ACAD:F23::2/64</code> in area 1.</li>
<li><b>R3</b> (3.3.3.3): Gi0/0 <code>2001:DB8:ACAD:F23::3/64</code> plus Loopback10 to Loopback13 with <code>2001:DB8:ACAD:10::1/64</code> to <code>2001:DB8:ACAD:13::1/64</code>, all in area 1.</li>
</ul>
<p>Three things are wrong with the defaults. Hellos leak onto the user LAN, where any laptop running routing software could become a neighbour. Both transit links elect a DR and BDR, which is pointless on a link with two routers. And the ABR leaks four separate lab routes into the backbone. Your job is to apply the design standard: a passive user LAN, point-to-point transit links, and a single /62 summary for the lab, then prove reachability with a ping from R1 to <code>2001:DB8:ACAD:12::1</code>.</p>

<div class="eg"><p><b>Worked example: why one /62.</b> The lab prefixes are 2001:DB8:ACAD:<b>10</b>::, <b>11</b>::, <b>12</b>:: and <b>13</b>::. In the fourth hextet, 0x10 is 0001 0000 and 0x13 is 0001 0011. Only the last two bits change, so the common part is 64 minus 2 = 62 bits. One route, <code>2001:DB8:ACAD:10::/62</code>, covers all four. Chapter 8 walks through this math in detail.</p></div>

<h3>How the chapters flow</h3>
<p>Chapters 2 and 3 explain the architecture and the LSAs, because you cannot troubleshoot a database you cannot read. Chapter 4 covers both configuration styles and the router ID. Chapter 5 covers neighbour requirements and network types (lab task 2). Chapter 6 is passive interfaces (lab task 1). Chapter 7 covers stub and NSSA areas. Chapter 8 is summarisation (lab tasks 3 and 4). Chapter 9 is authentication. Chapter 10 is the troubleshooting workflow with a full lab walk and text tickets, and chapter 11 is the exam checklist.</p>

<div class="warn"><p><b>Common mistake.</b> Assuming OSPFv3 is "OSPFv2 with longer addresses". Commands look similar, but the packets, the LSAs, the next hops and the authentication are all different. Engineers who carry v2 assumptions look for a <code>network</code> command, expect global next hops and search for prefixes inside router LSAs. None of those exist in v3.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint says "OSPF (v2/v3)". Expect questions that mix both: a dual-stack router where OSPFv2 is fine and OSPFv3 is broken, or the reverse. OSPFv2 and OSPFv3 are separate processes with separate databases, separate neighbours and separate interface settings. A fix in one never repairs the other.</p></div>

<div class="scn"><h4>The IPv6 rollout that stopped at the ABR</h4><p>An enterprise enabled OSPFv3 across its campus as part of an IPv6 pilot. Users in one building could reach servers in their own area but nothing beyond the ABR. IPv4 worked everywhere. The engineer compared <code>show ip ospf neighbor</code> (all FULL) with <code>show ipv6 ospf neighbor</code> on the ABR, which showed only area 0 neighbours. The building-facing interface had never been given <code>ipv6 ospf 1 area 1</code>; the IPv4 side of the same interface was fine, which had hidden the gap.</p><p><b>Lesson:</b> treat OSPFv2 and OSPFv3 as two separate protocols and verify each one on its own.</p></div>

<div class="iv"><p class="q">"What is the single biggest architectural difference between OSPFv2 and OSPFv3?"</p><p>Strong answer: OSPFv3 separates topology from addressing. Router and network LSAs describe only the graph of routers and links, and prefixes travel in separate LSAs: the link LSA (type 8) and the intra-area prefix LSA (type 9). Then add the practical consequences: OSPFv3 runs per link over link-local addresses, next hops are link-local, and a prefix change does not force a full SPF run.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 keeps topology and prefixes in separate LSAs, like a road map and an address directory.</li>
<li>ENARSI 1.9 is a troubleshoot objective: learn the show output and the symptoms, not only the config.</li>
<li>The lab: passive user LAN on R1, point-to-point transit links, and a /62 summary on the ABR R2.</li>
<li>OSPFv2 and OSPFv3 are independent processes; always verify both on a dual-stack network.</li>
</ul></div>
`,hi:`
<p>Ek shehar socho jiske paas do alag kitaabein hain. Pehli kitaab <b>road map</b> hai: isme har junction aur junctions ke beech ki har sadak dikhti hai, lekin house numbers nahi. Doosri kitaab <b>address directory</b> hai: yeh batati hai ki kaunse house numbers kis sadak par hain. Agar kisi street ko naye house numbers mil jaayein, to aap directory dobara chhapte ho, road map nahi. OSPFv3 bilkul aise hi kaam karta hai. Topology (routers aur links) LSAs ke ek set mein rehti hai, aur IPv6 prefixes doosre set mein. Ek baar yeh split samajh aa gaya, to lagbhag har OSPFv3 show command aur trouble ticket samajh mein aane lagta hai.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>OSPFv3 asal mein kaise chalta hai: per link, link-local addresses par, instance IDs aur interface IDs ke saath.</li>
<li>Har OSPFv3 LSA type, naye <b>link LSA (type 8)</b> aur <b>intra-area prefix LSA (type 9)</b> ke saath gehraai se.</li>
<li>Dono configuration styles: traditional <code>ipv6 router ospf</code> aur address-family <code>router ospfv3</code>, OSPFv3 par IPv4 le jaana bhi.</li>
<li>Router ID rules, neighbour requirements aur network types (broadcast, point-to-point, point-to-multipoint).</li>
<li>Passive interfaces, stub aur NSSA areas, aur <code>area range</code> aur <code>summary-prefix</code> se summarisation.</li>
<li>IPsec se authentication aur naya key-chain method.</li>
<li>IPv6 routing ke liye troubleshooting workflow, aur lab ka poora walkthrough.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko CCNA module se OSPFv3 basics pehle se aane chahiye (interface par enable karna, router ID, <code>show ipv6 ospf neighbor</code>) aur ENCOR se multi-area OSPF (ABRs, LSA types 1 se 5, IPv4 ke liye <code>area range</code>). Hum un modules ko refer karenge, dobara nahi padhayenge. IPv6 addressing bhi chahiye: global unicast, link-local (FE80::/10) aur prefix lengths. Agar /62 ajeeb lagta hai, to pehle CCNA IPv6 module dobara dekho. OSPFv2 ke stub, NSSA aur virtual-link details ENARSI OSPF module mein padhaaye jaate hain; yahan hum sirf dikhayenge ki IPv6 ke liye kya badalta hai.</p>

<h3>ENARSI blueprint mein yeh kahan hai</h3>
<p>ENARSI 300-410 v1.1 blueprint ka item <b>1.9 Troubleshoot OSPF (v2/v3)</b> address families, neighbour relationships, network types, area types, router types, path preference, summarisation aur passive interfaces list karta hai. Yeh ek <b>troubleshoot</b> objective hai. Yeh shabd matter karta hai: exam aapko output dikhata hai aur poochta hai kya galat hai. Isliye har chapter mein hum pehle show commands dekhte hain aur yeh ki galti kaunsa symptom deti hai, sirf configuration nahi.</p>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="360" height="200" rx="10" fill="#e2e8f0"/><text x="40" y="42" class="svg-muted" font-size="12">Area 0</text>
<rect x="390" y="20" width="230" height="200" rx="10" fill="#ddd6fe"/><text x="410" y="42" class="svg-muted" font-size="12">Area 1</text>
<rect x="50" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="105" y="92" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="105" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 1.1.1.1</text>
<rect x="290" y="70" width="140" height="50" rx="8" fill="#fde68a"/><text x="360" y="92" text-anchor="middle" class="svg-ink" font-size="14">R2 (ABR)</text><text x="360" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 2.2.2.2</text>
<rect x="500" y="70" width="110" height="50" rx="8" fill="#bae6fd"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="14">R3</text><text x="555" y="110" text-anchor="middle" class="svg-muted" font-size="12">RID 3.3.3.3</text>
<line x1="160" y1="95" x2="290" y2="95" stroke="#64748b" stroke-width="2"/><text x="225" y="86" text-anchor="middle" class="svg-accent" font-size="12">F12::/64</text>
<line x1="430" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/><text x="465" y="86" text-anchor="middle" class="svg-accent" font-size="12">F23::/64</text>
<rect x="50" y="165" width="110" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="190" text-anchor="middle" class="svg-ink" font-size="13">SW-USERS</text>
<line x1="105" y1="120" x2="105" y2="165" stroke="#64748b" stroke-width="2"/><text x="115" y="148" class="svg-accent" font-size="12">Gi0/2 100::/64</text>
<rect x="490" y="150" width="125" height="58" rx="8" fill="#fed7aa"/><text x="552" y="170" text-anchor="middle" class="svg-ink" font-size="12">Lo10-Lo13</text><text x="552" y="188" text-anchor="middle" class="svg-muted" font-size="12">10:: se 13::</text>
<line x1="555" y1="120" x2="555" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="12">Saare prefixes 2001:DB8:ACAD::/48 ke andar, OSPFv3 process 1</text>
</svg><p class="cap">Bengaluru R&amp;D lab: R1 aur user LAN area 0 mein, R2 ABR, R3 aur chaar lab loopbacks area 1 mein.</p></div>

<h3>Jo lab aap banaoge</h3>
<p>Module lab ka naam hai <b>OSPFv3 passive, point-to-point and summarisation</b>. Bengaluru R&amp;D network pehle se default settings ke saath OSPFv3 process 1 chala raha hai, traditional configuration style mein:</p>
<ul>
<li><b>R1</b> (router ID 1.1.1.1): Gi0/0 <code>2001:DB8:ACAD:F12::1/64</code> R2 ki taraf aur Gi0/2 <code>2001:DB8:ACAD:100::1/64</code> user switch SW-USERS ki taraf, dono area 0 mein.</li>
<li><b>R2</b> (2.2.2.2), ABR: Gi0/0 <code>2001:DB8:ACAD:F12::2/64</code> area 0 mein aur Gi0/1 <code>2001:DB8:ACAD:F23::2/64</code> area 1 mein.</li>
<li><b>R3</b> (3.3.3.3): Gi0/0 <code>2001:DB8:ACAD:F23::3/64</code> plus Loopback10 se Loopback13 tak <code>2001:DB8:ACAD:10::1/64</code> se <code>2001:DB8:ACAD:13::1/64</code>, sab area 1 mein.</li>
</ul>
<p>Defaults mein teen cheezein galat hain. Hellos user LAN par leak ho rahe hain, jahan routing software chalane wala koi bhi laptop neighbour ban sakta hai. Dono transit links DR aur BDR elect karte hain, jo do routers wale link par bekaar hai. Aur ABR chaar alag lab routes backbone mein leak karta hai. Aapka kaam design standard lagana hai: passive user LAN, point-to-point transit links, aur lab ke liye ek /62 summary, phir R1 se <code>2001:DB8:ACAD:12::1</code> ping karke reachability prove karna.</p>

<div class="eg"><p><b>Worked example: ek /62 kyun.</b> Lab prefixes hain 2001:DB8:ACAD:<b>10</b>::, <b>11</b>::, <b>12</b>:: aur <b>13</b>::. Chauthe hextet mein 0x10 hai 0001 0000 aur 0x13 hai 0001 0011. Sirf aakhri do bits badalte hain, isliye common hissa 64 minus 2 = 62 bits hai. Ek route, <code>2001:DB8:ACAD:10::/62</code>, chaaron ko cover karta hai. Chapter 8 yeh math detail mein dikhata hai.</p></div>

<h3>Chapters ka flow</h3>
<p>Chapter 2 aur 3 architecture aur LSAs samjhaate hain, kyunki jo database aap padh nahi sakte use troubleshoot bhi nahi kar sakte. Chapter 4 dono configuration styles aur router ID cover karta hai. Chapter 5 neighbour requirements aur network types (lab task 2). Chapter 6 passive interfaces (lab task 1). Chapter 7 stub aur NSSA areas. Chapter 8 summarisation (lab tasks 3 aur 4). Chapter 9 authentication. Chapter 10 troubleshooting workflow hai, poore lab walk aur text tickets ke saath, aur chapter 11 exam checklist hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki OSPFv3 "lambe addresses wala OSPFv2" hai. Commands milti-julti dikhti hain, lekin packets, LSAs, next hops aur authentication sab alag hain. Jo engineers v2 ke assumptions saath laate hain woh <code>network</code> command dhoondhte hain, global next hops expect karte hain aur router LSAs ke andar prefixes khojte hain. v3 mein inme se kuch bhi exist nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint kehta hai "OSPF (v2/v3)". Aise questions expect karo jo dono ko mix karein: ek dual-stack router jahan OSPFv2 theek hai aur OSPFv3 toota hai, ya ulta. OSPFv2 aur OSPFv3 alag processes hain, alag databases, alag neighbours aur alag interface settings ke saath. Ek mein kiya fix doosre ko kabhi repair nahi karta.</p></div>

<div class="scn"><h4>IPv6 rollout jo ABR par ruk gaya</h4><p>Ek enterprise ne IPv6 pilot ke hisse ke roop mein poore campus par OSPFv3 enable kiya. Ek building ke users apne area ke servers tak pahunch paate the lekin ABR ke aage kuch nahi. IPv4 har jagah chal raha tha. Engineer ne <code>show ip ospf neighbor</code> (sab FULL) ko ABR par <code>show ipv6 ospf neighbor</code> se compare kiya, jisme sirf area 0 neighbours dikhe. Building wale interface ko kabhi <code>ipv6 ospf 1 area 1</code> diya hi nahi gaya tha; usi interface ka IPv4 side theek tha, jisne is gap ko chhupa diya tha.</p><p><b>Seekh:</b> OSPFv2 aur OSPFv3 ko do alag protocols maano aur har ek ko alag se verify karo.</p></div>

<div class="iv"><p class="q">"OSPFv2 aur OSPFv3 ke beech sabse bada architectural fark kya hai?"</p><p>Strong answer: OSPFv3 topology ko addressing se alag karta hai. Router aur network LSAs sirf routers aur links ka graph describe karte hain, aur prefixes alag LSAs mein jaate hain: link LSA (type 8) aur intra-area prefix LSA (type 9). Phir practical consequences jodo: OSPFv3 per link link-local addresses par chalta hai, next hops link-local hote hain, aur prefix change hone par poora SPF run nahi karna padta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSPFv3 topology aur prefixes ko alag LSAs mein rakhta hai, road map aur address directory ki tarah.</li>
<li>ENARSI 1.9 troubleshoot objective hai: sirf config nahi, show output aur symptoms seekho.</li>
<li>Lab: R1 par passive user LAN, point-to-point transit links, aur ABR R2 par /62 summary.</li>
<li>OSPFv2 aur OSPFv3 independent processes hain; dual-stack network par hamesha dono verify karo.</li>
</ul></div>
`}};export{e as default};