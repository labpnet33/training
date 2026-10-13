var e={id:`what-appliance`,h:{en:`What the security appliance does: one box at the branch edge`,hi:`Security appliance kya karta hai: branch edge par ek box`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn what the security appliance (the MX at each site) does, how to plan its VLANs and addressing, how it hands out IP addresses with DHCP, how its firewall rules are evaluated, how it translates addresses to reach the internet (NAT and port forwarding), how content filtering works, and a workflow to troubleshoot "a client cannot get an address". <b>Prerequisites:</b> the previous module (organization, networks, templates) plus basic IP, subnet and VLAN knowledge. Every other term is explained when it first appears. The examples use Bharat Retail Co: Mumbai HQ (<code>mum</code>), Bengaluru Branch (<code>blr</code>) and Delhi Branch (<code>del</code>).</p>

<h3>Analogy: the reception desk, security guard and post room of a building</h3>
<p>Picture the ground floor of an office building. One front desk takes calls and sends visitors to the right floor (routing). A guard checks who may enter which floor (firewall). A post room puts the building's single street address on every outgoing letter (NAT). A clerk gives each new visitor a temporary badge number (DHCP). In a small branch it is cheaper and simpler if one person does all four jobs. The security appliance is that one person in a box.</p>

<h3>The jobs of an MX-style appliance</h3>
<dl class="terms">
<dt>Router</dt><dd>Moves traffic between networks: between VLAN 10 Staff and VLAN 20 Servers, and between the LAN and the internet. It is the default gateway for the clients (10.2.10.1 at Bengaluru VLAN 10).</dd>
<dt>Firewall</dt><dd>Permits or blocks traffic using rules, for example guests may not reach servers.</dd>
<dt>DHCP server</dt><dd>Gives clients an IP address, mask, gateway and DNS automatically.</dd>
<dt>NAT device</dt><dd>Translates private addresses to the address of the internet circuit.</dd>
<dt>Content filter</dt><dd>Blocks or allows websites by category or by list.</dd>
<dt>VPN and SD-WAN edge</dt><dd>Builds secure tunnels between sites and chooses between internet circuits. Both are covered in the VPN module; here you only need to know that this same box does it.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Branch design with the appliance">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Internet (ISP-A)</text>
<line x1="320" y1="50" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="332" y="72" class="svg-muted" font-size="12">wan1</text>
<rect x="200" y="85" width="240" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">route, firewall, DHCP, NAT, content filter</text>
<line x1="320" y1="155" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><text x="332" y="177" class="svg-muted" font-size="12">LAN trunk</text>
<rect x="240" y="190" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text>
<line x1="240" y1="210" x2="110" y2="245" stroke="#64748b" stroke-width="2"/><line x1="400" y1="210" x2="530" y2="245" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="245" width="170" height="22" rx="6" fill="#fde68a"/><text x="115" y="261" text-anchor="middle" class="svg-ink" font-size="12">PC-BLR, LAPTOP-BLR</text>
<rect x="450" y="245" width="170" height="22" rx="6" fill="#fed7aa"/><text x="535" y="261" text-anchor="middle" class="svg-ink" font-size="12">AP-BLR, SRV-BLR</text>
</svg><p class="cap">At Bengaluru one appliance connects the LAN to the internet and enforces policy in between.</p></div>

<h3>Branch design: why one box is enough</h3>
<p>A branch has a few dozen users, a handful of devices and one or two internet circuits. Buying a router, a firewall, a DHCP server and a VPN gateway separately is expensive and needs four things to configure and patch. One appliance managed from the dashboard means one device per site, one place to look, and policy written once. For Bharat Retail Co the plan is simple: Mumbai (HQ, hub) has two circuits, wan1 ILL-MUM-01 and wan2 BB-MUM-02; Bengaluru and Delhi have one circuit each.</p>

<table class="cmp"><tr><th>Site</th><th>Appliance</th><th>LAN plan</th><th>Internet circuits</th></tr>
<tr><td>Mumbai HQ</td><td>MX-MUM</td><td>10.1.&lt;vlan&gt;.0/24</td><td>wan1 198.51.100.10, wan2 203.0.113.10</td></tr>
<tr><td>Bengaluru</td><td>MX-BLR</td><td>10.2.&lt;vlan&gt;.0/24</td><td>wan1 198.51.100.20</td></tr>
<tr><td>Delhi</td><td>MX-DEL</td><td>10.3.&lt;vlan&gt;.0/24</td><td>wan1 203.0.113.30</td></tr>
</table>

<h3>The GUI pages for this module</h3>
<p>You will use four pages: <b>Addressing and VLANs</b>, <b>Firewall</b>, <b>Content filtering</b> and <b>Alerts and events</b>. Changes on these pages are saved to a candidate and go live when you click <b>Save changes</b>. Each change page has a callout "What does this change on the wire/policy?" and we repeat that habit in every chapter: click-ops, but you understand what each click does.</p>

<pre class="out">Overview  (network: Bengaluru Branch)
Appliance   MX-BLR   online
Uplink      wan1  BB-BLR-01  198.51.100.20/24  gw 198.51.100.1   <span class="hl">up</span>
VLANs       10 Staff, 20 Servers, 30 Guest, 99 Management
Clients     14 active</pre>

<div class="warn"><p><b>Common mistake.</b> Thinking the appliance is "just a firewall". It is also the gateway and the DHCP server for the whole site. If it is misconfigured, clients lose addresses and routing at the same time.</p></div>
<div class="exam"><p><b>Exam trap.</b> The appliance's LAN address (.1 in each subnet) is the clients' default gateway. If a client's gateway is anything else, inter-VLAN and internet traffic will not leave the subnet correctly.</p></div>

<div class="scn"><h4>One box, one phone call</h4><p>When Delhi opened, the old plan was a router from one vendor, a firewall from another and a Windows DHCP server. During the first outage nobody knew which box to check, and three teams were called. For the next branch Bharat Retail Co used one appliance. When a client could not browse, the engineer opened one dashboard page, saw the DHCP pool and the firewall hits in the same place, and fixed it in ten minutes.</p><p><b>Lesson:</b> consolidating roles reduces the number of places a fault can hide.</p></div>

<div class="iv"><p class="q">"What roles does a branch security appliance play, and why combine them?"</p><p>Strong answer: gateway and inter-VLAN router, stateful firewall, DHCP server, NAT to the internet circuit, content filter, and VPN or SD-WAN edge. Combining them lowers cost and complexity for branches and gives one policy and one place to troubleshoot. Mention the trade-off: it is one box, so give the hub site two circuits and monitor it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The appliance is router, firewall, DHCP server, NAT device, content filter and VPN edge in one box.</li>
<li>It is the clients' default gateway (.1 in each subnet).</li>
<li>Each site has its own LAN plan: 10.1.x, 10.2.x, 10.3.x for Mumbai, Bengaluru, Delhi.</li>
<li>Pages: Addressing and VLANs, Firewall, Content filtering, Alerts and events.</li>
<li>Changes go live on Save changes; always ask what each click changes.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki security appliance (har site ka MX) kya karta hai, uske VLANs aur addressing kaise plan karte hain, woh DHCP se IP addresses kaise deta hai, uske firewall rules kaise evaluate hote hain, internet tak pahunchne ke liye woh addresses ko kaise translate karta hai (NAT aur port forwarding), content filtering kaise kaam karti hai, aur "client ko address nahi mil raha" troubleshoot karne ka workflow. <b>Prerequisites:</b> pichla module (organization, networks, templates) aur basic IP, subnet aur VLAN ki knowledge. Baaki har term pehli baar aane par explain hota hai. Examples Bharat Retail Co ke hain: Mumbai HQ (<code>mum</code>), Bengaluru Branch (<code>blr</code>) aur Delhi Branch (<code>del</code>).</p>

<h3>Analogy: office building ka reception, guard aur post room</h3>
<p>Office building ki ground floor socho. Ek front desk calls leta hai aur visitors ko sahi floor par bhejta hai (routing). Ek guard check karta hai ki kaun kis floor par ja sakta hai (firewall). Ek post room har bahar jaane wale letter par building ka ek street address lagata hai (NAT). Ek clerk har naye visitor ko temporary badge number deta hai (DHCP). Chhoti branch mein yeh sasta aur aasaan hai agar ek hi insaan chaaron kaam kare. Security appliance wahi ek insaan hai, ek box mein.</p>

<h3>MX-style appliance ke kaam</h3>
<dl class="terms">
<dt>Router</dt><dd>Networks ke beech traffic move karta hai: VLAN 10 Staff aur VLAN 20 Servers ke beech, aur LAN aur internet ke beech. Yeh clients ka default gateway hai (Bengaluru VLAN 10 mein 10.2.10.1).</dd>
<dt>Firewall</dt><dd>Rules se traffic allow ya block karta hai, jaise guests servers tak nahi pahunch sakte.</dd>
<dt>DHCP server</dt><dd>Clients ko automatically IP address, mask, gateway aur DNS deta hai.</dd>
<dt>NAT device</dt><dd>Private addresses ko internet circuit ke address mein translate karta hai.</dd>
<dt>Content filter</dt><dd>Websites ko category ya list se block ya allow karta hai.</dd>
<dt>VPN aur SD-WAN edge</dt><dd>Sites ke beech secure tunnels banata hai aur internet circuits ke beech chunta hai. Dono VPN module mein aayenge; yahan bas yeh jaanna kaafi hai ki yahi box yeh bhi karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Appliance ke saath branch design">
<rect x="250" y="10" width="140" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Internet (ISP-A)</text>
<line x1="320" y1="50" x2="320" y2="85" stroke="#64748b" stroke-width="2"/><text x="332" y="72" class="svg-muted" font-size="12">wan1</text>
<rect x="200" y="85" width="240" height="70" rx="10" fill="#bae6fd"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="14">MX-BLR</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">route, firewall, DHCP, NAT, content filter</text>
<line x1="320" y1="155" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><text x="332" y="177" class="svg-muted" font-size="12">LAN trunk</text>
<rect x="240" y="190" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">SW-BLR</text>
<line x1="240" y1="210" x2="110" y2="245" stroke="#64748b" stroke-width="2"/><line x1="400" y1="210" x2="530" y2="245" stroke="#64748b" stroke-width="2"/>
<rect x="30" y="245" width="170" height="22" rx="6" fill="#fde68a"/><text x="115" y="261" text-anchor="middle" class="svg-ink" font-size="12">PC-BLR, LAPTOP-BLR</text>
<rect x="450" y="245" width="170" height="22" rx="6" fill="#fed7aa"/><text x="535" y="261" text-anchor="middle" class="svg-ink" font-size="12">AP-BLR, SRV-BLR</text>
</svg><p class="cap">Bengaluru mein ek appliance LAN ko internet se jodta hai aur beech mein policy lagata hai.</p></div>

<h3>Branch design: ek box kaafi kyun hai</h3>
<p>Branch mein kuch dozen users, kuch devices aur ek ya do internet circuits hote hain. Router, firewall, DHCP server aur VPN gateway alag alag kharidna mehnga hai aur chaar cheezein configure aur patch karni padti hain. Dashboard se manage hone wala ek appliance matlab har site par ek device, dekhne ki ek jagah, aur policy ek baar likhi hui. Bharat Retail Co ka plan saaf hai: Mumbai (HQ, hub) ke paas do circuits hain, wan1 ILL-MUM-01 aur wan2 BB-MUM-02; Bengaluru aur Delhi ke paas ek ek circuit.</p>

<table class="cmp"><tr><th>Site</th><th>Appliance</th><th>LAN plan</th><th>Internet circuits</th></tr>
<tr><td>Mumbai HQ</td><td>MX-MUM</td><td>10.1.&lt;vlan&gt;.0/24</td><td>wan1 198.51.100.10, wan2 203.0.113.10</td></tr>
<tr><td>Bengaluru</td><td>MX-BLR</td><td>10.2.&lt;vlan&gt;.0/24</td><td>wan1 198.51.100.20</td></tr>
<tr><td>Delhi</td><td>MX-DEL</td><td>10.3.&lt;vlan&gt;.0/24</td><td>wan1 203.0.113.30</td></tr>
</table>

<h3>Is module ke GUI pages</h3>
<p>Aap chaar pages use karoge: <b>Addressing and VLANs</b>, <b>Firewall</b>, <b>Content filtering</b> aur <b>Alerts and events</b>. In pages par changes candidate mein save hote hain aur <b>Save changes</b> click karne par live hote hain. Har change page par ek callout "What does this change on the wire/policy?" hota hai aur hum har chapter mein yahi aadat repeat karte hain: click-ops, but you understand what each click does.</p>

<pre class="out">Overview  (network: Bengaluru Branch)
Appliance   MX-BLR   online
Uplink      wan1  BB-BLR-01  198.51.100.20/24  gw 198.51.100.1   <span class="hl">up</span>
VLANs       10 Staff, 20 Servers, 30 Guest, 99 Management
Clients     14 active</pre>

<div class="warn"><p><b>Common galti.</b> Appliance ko "bas firewall" samajhna. Woh poori site ka gateway aur DHCP server bhi hai. Misconfigure ho to clients ek saath addresses aur routing dono kho dete hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Appliance ka LAN address (har subnet mein .1) clients ka default gateway hai. Agar client ka gateway kuch aur hai, to inter-VLAN aur internet traffic subnet se sahi nahi nikalega.</p></div>

<div class="scn"><h4>Ek box, ek phone call</h4><p>Delhi khulte waqt purana plan ek vendor ka router, doosre vendor ka firewall aur ek Windows DHCP server tha. Pehle outage mein kisi ko nahi pata tha kaunsa box check karna hai, aur teen teams ko bulana pada. Agli branch ke liye Bharat Retail Co ne ek appliance use kiya. Jab client browse nahi kar paya, engineer ne ek dashboard page kholi, DHCP pool aur firewall hits ek hi jagah dekhe, aur dus minute mein fix kar diya.</p><p><b>Seekh:</b> roles ko consolidate karne se woh jagahein kam ho jaati hain jahan fault chhup sakta hai.</p></div>

<div class="iv"><p class="q">"Branch security appliance kaunse roles nibhata hai, aur unhe combine kyun karte hain?"</p><p>Strong answer: gateway aur inter-VLAN router, stateful firewall, DHCP server, internet circuit ke liye NAT, content filter, aur VPN ya SD-WAN edge. Combine karne se branches ke liye cost aur complexity kam hoti hai aur ek policy aur ek troubleshooting ki jagah milti hai. Trade-off bhi bolo: yeh ek hi box hai, isliye hub site ko do circuits do aur monitor karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Appliance router, firewall, DHCP server, NAT device, content filter aur VPN edge hai, ek box mein.</li>
<li>Yeh clients ka default gateway hai (har subnet mein .1).</li>
<li>Har site ka apna LAN plan hai: Mumbai, Bengaluru, Delhi ke liye 10.1.x, 10.2.x, 10.3.x.</li>
<li>Pages: Addressing and VLANs, Firewall, Content filtering, Alerts and events.</li>
<li>Changes Save changes par live hote hain; hamesha poochho har click kya badalta hai.</li>
</ul></div>
`}};export{e as default};