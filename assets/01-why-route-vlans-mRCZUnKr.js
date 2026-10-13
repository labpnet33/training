var e={id:`why`,h:{en:`Why VLANs need a router`,hi:`VLANs ko router kyun chahiye`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why two VLANs cannot talk without a Layer 3 device, follow a packet from a PC in one VLAN to a PC in another, and build inter-VLAN routing three ways: one router interface per VLAN, <b>router-on-a-stick</b> with 802.1Q subinterfaces, and a <b>Layer 3 switch</b> with SVIs and routed ports. You will also relay DHCP across VLANs, verify every piece with show commands, and fix the faults that appear in real tickets and in the CCNA 200-301 exam (topic 2.1.c, inter-VLAN connectivity).</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 subnets and masks (module <i>IPv4 addressing and subnetting</i>) and with VLANs, access ports, 802.1Q trunks and the native VLAN (module <i>VLANs, 802.1Q trunking, native VLAN and DTP</i>). We will not re-teach trunking here; we will use it.</p>

<h3>An analogy: floors in an office tower</h3>
<p>Picture an office tower where every department has its own floor, and the stairs between floors are locked. People on the fourth floor can walk to any desk on the fourth floor, shout an announcement and be heard by everyone there, but nobody on the fifth floor hears it. To reach another floor you must go to <b>reception</b>, which checks where you are going and sends you up in the lift. Each floor is a VLAN. The shout is a broadcast. Reception is the router, and the lift door on your own floor is your <b>default gateway</b>.</p>

<h3>The rule that creates the problem</h3>
<p>A <b>VLAN</b> (virtual LAN) is a separate <b>broadcast domain</b> created inside a switch. A switch forwards a frame only to ports in the same VLAN; it never copies a frame from VLAN 10 into VLAN 20. By design, each VLAN is also given its own <b>IP subnet</b>. In our first lab, HR is VLAN 10 with 192.168.10.0/24 and engineering is VLAN 20 with 192.168.20.0/24, both on the same switch SW1.</p>
<p>So PC1 (192.168.10.10) and PC2 (192.168.20.10) can be plugged into neighbouring ports and still never exchange a single frame. That separation is exactly what we wanted from VLANs: smaller broadcast domains, security boundaries and tidy addressing. But users still need to print, reach servers and browse the internet, so some traffic must cross between VLANs. Moving a packet from one subnet to another is <b>routing</b>, which is a Layer 3 job. Inter-VLAN routing simply means "routing between the subnets that live in different VLANs".</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two VLANs on one switch cannot talk until a Layer 3 device joins them">
<rect x="20" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/>
<text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="14">Without a router</text>
<rect x="110" y="60" width="100" height="36" rx="6" fill="#bae6fd"/><text x="160" y="83" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="130" y1="96" x2="80" y2="150" stroke="#64748b" stroke-width="2"/><line x1="190" y1="96" x2="240" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="150" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1 VLAN 10</text><text x="80" y="186" text-anchor="middle" class="svg-muted" font-size="12">.10.10/24</text>
<rect x="190" y="150" width="100" height="44" rx="6" fill="#fde68a"/><text x="240" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2 VLAN 20</text><text x="240" y="186" text-anchor="middle" class="svg-muted" font-size="12">.20.10/24</text>
<text x="160" y="140" text-anchor="middle" class="svg-accent" font-size="13">no path</text>
<rect x="340" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/>
<text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">With a Layer 3 device</text>
<rect x="430" y="52" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="72" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text>
<line x1="480" y1="82" x2="480" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="430" y="100" width="100" height="30" rx="6" fill="#bae6fd"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="450" y1="130" x2="400" y2="150" stroke="#64748b" stroke-width="2"/><line x1="510" y1="130" x2="560" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="350" y="150" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="400" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1 gw .10.1</text><text x="400" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="510" y="150" width="100" height="44" rx="6" fill="#fde68a"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2 gw .20.1</text><text x="560" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
</svg><p class="cap">Same switch, different VLANs, different subnets: no path until a router (or Layer 3 switch) gives each VLAN a gateway.</p></div>

<h3>What the Layer 3 device must provide</h3>
<p>Whatever design you choose, the router or Layer 3 switch must have <b>one IP interface in every VLAN</b> it routes for, and that interface's address is the <b>default gateway</b> configured on the hosts of that VLAN. In the lab, R1 owns 192.168.10.1 in VLAN 10 and 192.168.20.1 in VLAN 20. When PC1 sends to PC2, the packet goes PC1 to R1 inside VLAN 10, R1 routes it, and R1 delivers it to PC2 inside VLAN 20. The router is present in both VLANs at the same time; that is the whole trick.</p>

<h3>Three ways to build it</h3>
<table class="cmp"><tr><th>Design</th><th>Gateway for each VLAN is</th><th>Where you meet it</th></tr>
<tr><td><b>Legacy</b> (one interface per VLAN)</td><td>A separate physical router port, cabled to an access port in that VLAN</td><td>Very small sites, old designs, exam questions</td></tr>
<tr><td><b>Router-on-a-stick</b> (ROAS)</td><td>An 802.1Q subinterface such as Gi0/0.10 on one router port, over a trunk</td><td>Branch offices, small businesses, labs</td></tr>
<tr><td><b>Layer 3 switch</b></td><td>An SVI, <code>interface Vlan10</code>, inside the switch</td><td>Campus distribution and core; most enterprises</td></tr>
</table>
<p>Chapters 3 to 7 build each one on real Cisco IOS, using the same devices you will configure in the labs: R1 and SW1 for router-on-a-stick, and DSW1, ASW1 and EDGE for the Layer 3 switch design.</p>

<div class="eg"><p><b>Worked example.</b> A school has 60 staff PCs in VLAN 10 (10.20.10.0/24), 300 student PCs in VLAN 20 (10.20.20.0/24) and 8 printers in VLAN 30 (10.20.30.0/24). A student printing a document needs VLAN 20 to reach VLAN 30. The Layer 3 device needs three interfaces or SVIs: 10.20.10.1, 10.20.20.1 and 10.20.30.1. Each student PC is configured with gateway 10.20.20.1, never with the printer VLAN's gateway.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking "they are on the same switch, so they can talk". Physical location means nothing once VLANs exist. Two hosts in different VLANs need a Layer 3 hop even if they sit on ports 1 and 2 of the same switch.</p></div>

<div class="exam"><p><b>Exam trap.</b> A trunk alone does not give inter-VLAN connectivity. A trunk only carries several VLANs over one link, still separated by their tags. Something must <b>route</b> between them.</p></div>

<div class="scn"><h4>VLANs went live, printing died</h4><p>A logistics office split its flat network into VLAN 10 (staff) and VLAN 30 (printers) on a Friday evening to reduce broadcasts. On Monday nobody could print. The switch config was correct and every PC could still ping the other PCs on its floor. The engineer ran <code>ipconfig</code> on a staff PC and saw it was in 10.5.10.0/24, while the printers were in 10.5.30.0/24, and there was no router interface or SVI in either VLAN. He added SVIs 10.5.10.1 and 10.5.30.1 on the core Layer 3 switch, enabled <code>ip routing</code>, set those gateways through DHCP, and printing returned.</p><p><b>Lesson:</b> the day you create VLANs is the day you must design routing between them.</p></div>

<div class="iv"><p class="q">"Two PCs are on the same switch but in different VLANs. Why can't they ping each other, and what do you need?"</p><p>Strong answer: each VLAN is a separate broadcast domain and a separate IP subnet, and a switch never forwards frames between VLANs. The sender sees the destination is off-subnet and sends to its default gateway, so you need a Layer 3 device with an interface in each VLAN: router-on-a-stick subinterfaces, an SVI per VLAN on a Layer 3 switch, or legacy one port per VLAN. Mention that the hosts' gateway must be the address in their own VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each VLAN is its own broadcast domain and, by design, its own IP subnet.</li>
<li>A switch never forwards frames between VLANs; crossing VLANs is routing, a Layer 3 job.</li>
<li>The Layer 3 device needs one interface in every VLAN; that address is the hosts' default gateway.</li>
<li>Three designs: legacy one port per VLAN, router-on-a-stick, Layer 3 switch SVIs.</li>
<li>A trunk carries VLANs; it does not route between them.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki do VLANs Layer 3 device ke bina baat kyun nahi kar sakte, ek VLAN ke PC se dusre VLAN ke PC tak packet ko follow kar paoge, aur inter-VLAN routing teen tareeke se bana paoge: har VLAN ke liye ek router interface, 802.1Q subinterfaces ke saath <b>router-on-a-stick</b>, aur SVIs aur routed ports wala <b>Layer 3 switch</b>. Aap VLANs ke across DHCP relay bhi karoge, har cheez ko show commands se verify karoge, aur woh faults fix karoge jo real tickets aur CCNA 200-301 exam (topic 2.1.c, inter-VLAN connectivity) mein aate hain.</p>
<p><b>Prerequisites.</b> Aapko IPv4 subnets aur masks (module <i>IPv4 addressing and subnetting</i>) aur VLANs, access ports, 802.1Q trunks aur native VLAN (module <i>VLANs, 802.1Q trunking, native VLAN and DTP</i>) mein comfortable hona chahiye. Hum yahan trunking dobara nahi padhayenge; hum use use karenge.</p>

<h3>Ek analogy: office tower ki floors</h3>
<p>Ek office tower socho jahan har department ki apni floor hai, aur floors ke beech ki seedhiyan locked hain. Chauthi floor ke log chauthi floor ki kisi bhi desk tak jaa sakte hain, announcement chilla sakte hain aur wahan sab sun lete hain, lekin paanchvi floor par koi nahi sunta. Dusri floor tak jaane ke liye aapko <b>reception</b> jaana padta hai, jo check karta hai ki aap kahan jaa rahe ho aur aapko lift se upar bhejta hai. Har floor ek VLAN hai. Chillana broadcast hai. Reception router hai, aur aapki apni floor ka lift door aapka <b>default gateway</b> hai.</p>

<h3>Woh rule jo problem paida karta hai</h3>
<p><b>VLAN</b> (virtual LAN) switch ke andar bana ek alag <b>broadcast domain</b> hai. Switch frame ko sirf same VLAN ke ports par forward karta hai; woh kabhi VLAN 10 ka frame VLAN 20 mein copy nahi karta. Design ke hisaab se har VLAN ko apna <b>IP subnet</b> bhi diya jaata hai. Hamari pehli lab mein HR VLAN 10 hai 192.168.10.0/24 ke saath aur engineering VLAN 20 hai 192.168.20.0/24 ke saath, dono same switch SW1 par.</p>
<p>Isliye PC1 (192.168.10.10) aur PC2 (192.168.20.10) padosi ports mein lage ho sakte hain aur phir bhi ek bhi frame exchange nahi karte. Yahi separation hum VLANs se chahte the: chhote broadcast domains, security boundaries aur saaf addressing. Lekin users ko phir bhi print karna hai, servers tak pahunchna hai aur internet browse karna hai, isliye kuch traffic ko VLANs ke beech cross karna hi padega. Packet ko ek subnet se dusre subnet mein le jaana <b>routing</b> hai, jo Layer 3 ka kaam hai. Inter-VLAN routing ka simple matlab hai "alag VLANs mein rehne wale subnets ke beech routing".</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Ek switch par do VLANs tab tak baat nahi karte jab tak Layer 3 device unhe na jode">
<rect x="20" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/>
<text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="14">Router ke bina</text>
<rect x="110" y="60" width="100" height="36" rx="6" fill="#bae6fd"/><text x="160" y="83" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="130" y1="96" x2="80" y2="150" stroke="#64748b" stroke-width="2"/><line x1="190" y1="96" x2="240" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="150" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="80" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1 VLAN 10</text><text x="80" y="186" text-anchor="middle" class="svg-muted" font-size="12">.10.10/24</text>
<rect x="190" y="150" width="100" height="44" rx="6" fill="#fde68a"/><text x="240" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2 VLAN 20</text><text x="240" y="186" text-anchor="middle" class="svg-muted" font-size="12">.20.10/24</text>
<text x="160" y="140" text-anchor="middle" class="svg-accent" font-size="13">koi raasta nahi</text>
<rect x="340" y="20" width="280" height="190" rx="10" fill="#e2e8f0"/>
<text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="14">Layer 3 device ke saath</text>
<rect x="430" y="52" width="100" height="30" rx="6" fill="#ddd6fe"/><text x="480" y="72" text-anchor="middle" class="svg-ink" font-size="13">Router R1</text>
<line x1="480" y1="82" x2="480" y2="100" stroke="#64748b" stroke-width="3"/>
<rect x="430" y="100" width="100" height="30" rx="6" fill="#bae6fd"/><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="450" y1="130" x2="400" y2="150" stroke="#64748b" stroke-width="2"/><line x1="510" y1="130" x2="560" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="350" y="150" width="100" height="44" rx="6" fill="#bbf7d0"/><text x="400" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1 gw .10.1</text><text x="400" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<rect x="510" y="150" width="100" height="44" rx="6" fill="#fde68a"/><text x="560" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2 gw .20.1</text><text x="560" y="186" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20</text>
</svg><p class="cap">Same switch, alag VLANs, alag subnets: jab tak router (ya Layer 3 switch) har VLAN ko gateway nahi deta, koi raasta nahi.</p></div>

<h3>Layer 3 device ko kya dena hota hai</h3>
<p>Aap koi bhi design chuno, router ya Layer 3 switch ke paas <b>har us VLAN mein ek IP interface</b> hona chahiye jiske liye woh route karta hai, aur us interface ka address hi us VLAN ke hosts par configured <b>default gateway</b> hai. Lab mein R1 ke paas VLAN 10 mein 192.168.10.1 aur VLAN 20 mein 192.168.20.1 hai. Jab PC1 PC2 ko bhejta hai, packet VLAN 10 ke andar PC1 se R1 tak jaata hai, R1 use route karta hai, aur R1 use VLAN 20 ke andar PC2 tak deliver karta hai. Router ek hi samay mein dono VLANs mein maujood hai; poora trick yahi hai.</p>

<h3>Ise banane ke teen tareeke</h3>
<table class="cmp"><tr><th>Design</th><th>Har VLAN ka gateway kya hai</th><th>Kahan milta hai</th></tr>
<tr><td><b>Legacy</b> (har VLAN ke liye ek interface)</td><td>Alag physical router port, us VLAN ke access port se cabled</td><td>Bahut chhoti sites, purane designs, exam questions</td></tr>
<tr><td><b>Router-on-a-stick</b> (ROAS)</td><td>Ek router port par Gi0/0.10 jaisa 802.1Q subinterface, trunk ke upar</td><td>Branch offices, chhote businesses, labs</td></tr>
<tr><td><b>Layer 3 switch</b></td><td>Switch ke andar ek SVI, <code>interface Vlan10</code></td><td>Campus distribution aur core; zyada tar enterprises</td></tr>
</table>
<p>Chapters 3 se 7 har design ko real Cisco IOS par banate hain, unhi devices ke saath jo aap labs mein configure karoge: router-on-a-stick ke liye R1 aur SW1, aur Layer 3 switch design ke liye DSW1, ASW1 aur EDGE.</p>

<div class="eg"><p><b>Worked example.</b> Ek school mein VLAN 10 (10.20.10.0/24) mein 60 staff PCs, VLAN 20 (10.20.20.0/24) mein 300 student PCs aur VLAN 30 (10.20.30.0/24) mein 8 printers hain. Student jab document print karta hai to VLAN 20 ko VLAN 30 tak pahunchna padta hai. Layer 3 device ko teen interfaces ya SVIs chahiye: 10.20.10.1, 10.20.20.1 aur 10.20.30.1. Har student PC par gateway 10.20.20.1 configure hota hai, kabhi printer VLAN ka gateway nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki "same switch par hain, to baat kar lenge". VLANs aane ke baad physical location ka koi matlab nahi. Alag VLANs ke do hosts ko Layer 3 hop chahiye, chahe woh same switch ke port 1 aur 2 par baithe hon.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sirf trunk se inter-VLAN connectivity nahi milti. Trunk sirf kai VLANs ko ek link par le jaata hai, tags se phir bhi alag. Unke beech kisi ko <b>route</b> karna hi padega.</p></div>

<div class="scn"><h4>VLANs live hue, printing mar gayi</h4><p>Ek logistics office ne broadcasts kam karne ke liye Friday shaam apne flat network ko VLAN 10 (staff) aur VLAN 30 (printers) mein baant diya. Monday ko koi print nahi kar paaya. Switch config sahi thi aur har PC apni floor ke dusre PCs ko ab bhi ping kar raha tha. Engineer ne ek staff PC par <code>ipconfig</code> chalaya aur dekha ki woh 10.5.10.0/24 mein tha, jabki printers 10.5.30.0/24 mein the, aur kisi bhi VLAN mein koi router interface ya SVI nahi tha. Usne core Layer 3 switch par SVIs 10.5.10.1 aur 10.5.30.1 add kiye, <code>ip routing</code> enable kiya, DHCP se woh gateways set kiye, aur printing wapas aa gayi.</p><p><b>Seekh:</b> jis din aap VLANs banate ho, usi din aapko unke beech routing design karni hoti hai.</p></div>

<div class="iv"><p class="q">"Do PCs same switch par hain lekin alag VLANs mein. Woh ek dusre ko ping kyun nahi kar sakte, aur aapko kya chahiye?"</p><p>Strong answer: har VLAN alag broadcast domain aur alag IP subnet hai, aur switch kabhi VLANs ke beech frames forward nahi karta. Sender dekhta hai ki destination off-subnet hai aur apne default gateway ko bhejta hai, isliye aapko ek Layer 3 device chahiye jiska har VLAN mein interface ho: router-on-a-stick subinterfaces, Layer 3 switch par har VLAN ka SVI, ya legacy har VLAN ke liye ek port. Batao ki hosts ka gateway unke apne VLAN ka address hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har VLAN apna broadcast domain hai aur design ke hisaab se apna IP subnet bhi.</li>
<li>Switch kabhi VLANs ke beech frames forward nahi karta; VLANs cross karna routing hai, Layer 3 ka kaam.</li>
<li>Layer 3 device ko har VLAN mein ek interface chahiye; wahi address hosts ka default gateway hai.</li>
<li>Teen designs: legacy har VLAN ke liye ek port, router-on-a-stick, Layer 3 switch SVIs.</li>
<li>Trunk VLANs ko carry karta hai; unke beech route nahi karta.</li>
</ul></div>
`}};export{e as default};