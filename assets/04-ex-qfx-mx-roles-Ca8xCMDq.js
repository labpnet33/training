var e={id:`ex-qfx-mx-roles`,h:{en:`EX, QFX, MX and SRX: which box does which job`,hi:`EX, QFX, MX aur SRX: kaunsa box kaunsa kaam karta hai`},body:{en:`
<p>A construction site has different tools for different jobs: a drill for holes, a crane for heavy lifting, a security gate for the entrance. Juniper does the same with its product families. All run the same operating system, <b>Junos</b>, so the commands you learn once apply everywhere, but each family is built for a role. Knowing the roles helps you answer exam questions and design sensible networks.</p>

<h3>The families and their usual roles</h3>
<table class="cmp"><tr><th>Family</th><th>Type</th><th>Typical role in an enterprise</th></tr>
<tr><td><b>EX Series</b></td><td>Ethernet switches</td><td>Campus access, aggregation and core. Layer 2 and Layer 3, PoE for phones and access points, stacking with Virtual Chassis. This is the focus of JNCIS-ENT.</td></tr>
<tr><td><b>QFX Series</b></td><td>Data center switches</td><td>High-density 10, 25, 40, 100 Gbit/s leaf and spine switches. Same Layer 2 and Layer 3 ideas, tuned for the data center.</td></tr>
<tr><td><b>MX Series</b></td><td>Universal routers</td><td>WAN and internet edge, service provider and large enterprise routing, many routing features and large routing tables.</td></tr>
<tr><td><b>SRX Series</b></td><td>Firewalls and security gateways</td><td>Edge security, VPN, zones and policies. Often also route at branch sites.</td></tr>
<tr><td><b>ACX Series</b></td><td>Access and aggregation routers</td><td>Compact routers for metro and mobile backhaul.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where Juniper families sit in a campus">
<rect x="230" y="12" width="180" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="230" y="72" width="180" height="40" rx="10" fill="#fed7aa"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">SRX firewall</text>
<rect x="230" y="132" width="180" height="40" rx="10" fill="#fde68a"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">MX router (WAN edge)</text>
<rect x="60" y="192" width="170" height="40" rx="10" fill="#bae6fd"/><text x="145" y="217" text-anchor="middle" class="svg-ink" font-size="13">EX core / distribution</text>
<rect x="410" y="192" width="170" height="40" rx="10" fill="#bae6fd"/><text x="495" y="217" text-anchor="middle" class="svg-ink" font-size="13">EX core / distribution</text>
<line x1="320" y1="52" x2="320" y2="72" stroke="#64748b" stroke-width="2"/><line x1="320" y1="112" x2="320" y2="132" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="172" x2="170" y2="192" stroke="#64748b" stroke-width="2"/><line x1="350" y1="172" x2="470" y2="192" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">QFX leaf/spine</text><text x="545" y="58" text-anchor="middle" class="svg-muted" font-size="11">data center</text>
</svg><p class="cap">EX switches form the campus; MX routes to the WAN; SRX protects the edge; QFX lives in the data center.</p></div>

<h3>EX switches in more detail</h3>
<ul>
<li><b>Fixed access models</b> (for example EX2300 and EX3400) give 24 or 48 copper ports, often with PoE and 1 Gbit/s or multigigabit speeds.</li>
<li><b>Aggregation and core models</b> (for example EX4300, EX4400 and EX4650 depending on design) provide 10, 25, 40 or 100 Gbit/s uplinks and a larger routing and MAC table.</li>
<li><b>Virtual Chassis</b> lets several EX switches act as one logical switch with one management IP. It appears in the high availability module.</li>
<li><b>Enhanced Layer 2 Software (ELS)</b> is the configuration style used throughout this course.</li>
</ul>
<p>Model names change as products are refreshed. The lab devices use the model <code>ex4300-24t</code> in the simulator. For the exam, focus on roles and features rather than part numbers.</p>

<h3>One Junos, many roles</h3>
<p>Because Junos is the same everywhere, a command like <code>show route</code> or <code>show interfaces terse</code> works on an EX, an MX or an SRX. The differences are in the <i>configuration hierarchy</i> a platform supports: switches have <code>family ethernet-switching</code> and <code>vlans</code>; routers have <code>family inet</code> on routed interfaces; firewalls add <code>security</code> zones and policies. In the labs a device is a switch (EX), a Layer 3 switch that routes between VLANs (the <b>l3switch</b> type), a router, or a simple PC or server to generate traffic.</p>

<div class="eg"><p><b>Worked example.</b> A school has 40 classrooms, a server room, and a link to the education network. The classrooms get EX access switches with PoE for the Wi-Fi access points. A pair of EX switches act as distribution and core, with IRB gateways and RSTP root. A single SRX protects the internet edge and a router connects to the education network over BGP. Four product families, one operating system, one CLI.</p></div>

<h3>Layer 2 only, Layer 3 only, or both?</h3>
<p>Modern campus switches are <b>Layer 3 switches</b>: they bridge inside VLANs in hardware and route between them in hardware, using IRB. A dedicated router is chosen when you need richer routing features, large tables, many WAN interfaces or advanced services. This is why the same course covers switching and routing: the distribution switch does both.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking that EX can only switch. It also routes, with static routes, OSPF and more, subject to platform licences. The opposite error: expecting every EX model to support every feature. Always check the platform feature list before you design.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks which family fits a role. EX for campus switching, QFX for data center, MX for WAN and service provider routing, SRX for security. It also tests that all of them run Junos and share the CLI.</p></div>

<div class="scn"><h4>The router bought for a switch's job</h4><p>A company bought two MX routers to act as campus cores because "routers are more serious". The routers had few ports, so the team added a pile of small switches behind them and lost the simple distribution design. A review replaced them with EX core switches with 10 and 40 Gbit/s ports and kept one MX at the WAN edge.</p><p><b>Lesson:</b> match the box to the role.</p></div>

<div class="iv"><p class="q">"Where would you use EX, QFX, MX and SRX in an enterprise?"</p><p>EX for campus access, distribution and core; QFX for the data center fabric; MX for the WAN or internet edge when you need large routing capacity; SRX for firewalling and VPN at the edge. All share Junos, so the CLI and the candidate configuration model are identical.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EX: campus switching (JNCIS-ENT focus). QFX: data center. MX: WAN routing. SRX: security.</li>
<li>All use the same Junos CLI and candidate configuration.</li>
<li>Campus switches route as well as bridge, using IRB.</li>
<li>ELS is the current EX configuration style.</li>
<li>Virtual Chassis lets several EX switches behave as one.</li>
</ul></div>
`,hi:`
<p>Construction site par alag kaam ke liye alag tools hote hain: ched ke liye drill, bhaari uthane ke liye crane, entrance ke liye security gate. Juniper apne product families ke saath yahi karta hai. Sab ek hi operating system, <b>Junos</b>, chalate hain, isliye jo commands aap ek baar seekhte ho woh har jagah lagte hain, lekin har family ek role ke liye bani hai. Roles jaanne se exam ke sawaal aur samajhdaar network design aasaan ho jaate hain.</p>

<h3>Families aur unke aam roles</h3>
<table class="cmp"><tr><th>Family</th><th>Type</th><th>Enterprise mein aam role</th></tr>
<tr><td><b>EX Series</b></td><td>Ethernet switches</td><td>Campus access, aggregation aur core. Layer 2 aur Layer 3, phones aur access points ke liye PoE, Virtual Chassis se stacking. JNCIS-ENT ka focus yahi hai.</td></tr>
<tr><td><b>QFX Series</b></td><td>Data center switches</td><td>High-density 10, 25, 40, 100 Gbit/s leaf aur spine switches. Wahi Layer 2 aur Layer 3 ideas, data center ke liye tune.</td></tr>
<tr><td><b>MX Series</b></td><td>Universal routers</td><td>WAN aur internet edge, service provider aur bade enterprise routing, bahut routing features aur bade routing tables.</td></tr>
<tr><td><b>SRX Series</b></td><td>Firewalls aur security gateways</td><td>Edge security, VPN, zones aur policies. Branch sites par aksar route bhi karte hain.</td></tr>
<tr><td><b>ACX Series</b></td><td>Access aur aggregation routers</td><td>Metro aur mobile backhaul ke liye compact routers.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Campus mein Juniper families kahan baithte hain">
<rect x="230" y="12" width="180" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Internet / WAN</text>
<rect x="230" y="72" width="180" height="40" rx="10" fill="#fed7aa"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">SRX firewall</text>
<rect x="230" y="132" width="180" height="40" rx="10" fill="#fde68a"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">MX router (WAN edge)</text>
<rect x="60" y="192" width="170" height="40" rx="10" fill="#bae6fd"/><text x="145" y="217" text-anchor="middle" class="svg-ink" font-size="13">EX core / distribution</text>
<rect x="410" y="192" width="170" height="40" rx="10" fill="#bae6fd"/><text x="495" y="217" text-anchor="middle" class="svg-ink" font-size="13">EX core / distribution</text>
<line x1="320" y1="52" x2="320" y2="72" stroke="#64748b" stroke-width="2"/><line x1="320" y1="112" x2="320" y2="132" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="172" x2="170" y2="192" stroke="#64748b" stroke-width="2"/><line x1="350" y1="172" x2="470" y2="192" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="545" y="42" text-anchor="middle" class="svg-ink" font-size="12">QFX leaf/spine</text><text x="545" y="58" text-anchor="middle" class="svg-muted" font-size="11">data center</text>
</svg><p class="cap">EX campus banata hai; MX WAN tak route karta hai; SRX edge ko protect karta hai; QFX data center mein rehta hai.</p></div>

<h3>EX switches thoda detail mein</h3>
<ul>
<li><b>Fixed access models</b> (jaise EX2300 aur EX3400) 24 ya 48 copper ports dete hain, aksar PoE aur 1 Gbit/s ya multigigabit speeds ke saath.</li>
<li><b>Aggregation aur core models</b> (jaise EX4300, EX4400 aur design ke hisaab se EX4650) 10, 25, 40 ya 100 Gbit/s uplinks aur bada routing aur MAC table dete hain.</li>
<li><b>Virtual Chassis</b> kai EX switches ko ek logical switch ki tarah ek management IP ke saath chalne deta hai. Yeh high availability module mein aata hai.</li>
<li><b>Enhanced Layer 2 Software (ELS)</b> is course mein use hone wali configuration style hai.</li>
</ul>
<p>Model names product refresh ke saath badalte hain. Simulator mein lab devices model <code>ex4300-24t</code> use karte hain. Exam ke liye part numbers ki jagah roles aur features par focus karo.</p>

<h3>Ek Junos, kai roles</h3>
<p>Junos har jagah same hai, isliye <code>show route</code> ya <code>show interfaces terse</code> jaisa command EX, MX aur SRX par chalta hai. Fark us <i>configuration hierarchy</i> mein hai jo platform support karta hai: switches ke paas <code>family ethernet-switching</code> aur <code>vlans</code> hote hain; routers ke paas routed interfaces par <code>family inet</code>; firewalls <code>security</code> zones aur policies jodte hain. Labs mein device switch (EX) hai, ya Layer 3 switch jo VLANs ke beech route karta hai (<b>l3switch</b> type), ya router, ya traffic banane ke liye simple PC ya server.</p>

<div class="eg"><p><b>Worked example.</b> Ek school mein 40 classrooms, ek server room aur education network tak link hai. Classrooms ko Wi-Fi access points ke liye PoE wale EX access switches milte hain. EX switches ka pair distribution aur core ka kaam karta hai, IRB gateways aur RSTP root ke saath. Ek SRX internet edge ko protect karta hai aur ek router education network se BGP par judta hai. Chaar product families, ek operating system, ek CLI.</p></div>

<h3>Sirf Layer 2, sirf Layer 3, ya dono?</h3>
<p>Modern campus switches <b>Layer 3 switches</b> hain: woh VLANs ke andar hardware mein bridge karte hain aur unke beech hardware mein route karte hain, IRB se. Dedicated router tab chuna jaata hai jab richer routing features, bade tables, kai WAN interfaces ya advanced services chahiye. Isi liye ek hi course switching aur routing dono cover karta hai: distribution switch dono karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Sochna ki EX sirf switch kar sakta hai. Woh static routes, OSPF aur bahut kuch se route bhi karta hai, platform licences ke adheen. Ulti galti: har EX model se har feature support ki ummeed. Design se pehle hamesha platform feature list dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai ki kaunsi family kis role mein fit hoti hai. Campus switching ke liye EX, data center ke liye QFX, WAN aur service provider routing ke liye MX, security ke liye SRX. Yeh bhi test karta hai ki sab Junos chalate hain aur CLI share karte hain.</p></div>

<div class="scn"><h4>Switch ke kaam ke liye khareeda gaya router</h4><p>Ek company ne "routers zyada serious hote hain" soch kar do MX routers campus core ke roop mein khareede. Routers mein ports kam the, isliye team ne unke peeche chhote switches ka dher laga diya aur simple distribution design kho diya. Review ne unhe 10 aur 40 Gbit/s ports wale EX core switches se badla aur ek MX WAN edge par rakha.</p><p><b>Lesson:</b> box ko role se match karo.</p></div>

<div class="iv"><p class="q">"Enterprise mein EX, QFX, MX aur SRX kahan use karoge?"</p><p>EX campus access, distribution aur core ke liye; QFX data center fabric ke liye; MX WAN ya internet edge ke liye jab bada routing capacity chahiye; SRX edge par firewalling aur VPN ke liye. Sab Junos share karte hain, isliye CLI aur candidate configuration model identical hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EX: campus switching (JNCIS-ENT focus). QFX: data center. MX: WAN routing. SRX: security.</li>
<li>Sab ek hi Junos CLI aur candidate configuration use karte hain.</li>
<li>Campus switches bridge ke saath route bhi karte hain, IRB se.</li>
<li>ELS EX ki current configuration style hai.</li>
<li>Virtual Chassis kai EX switches ko ek ki tarah behave karne deta hai.</li>
</ul></div>
`}};export{e as default};