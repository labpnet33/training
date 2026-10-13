var e={id:`intro`,h:{en:`What the ASA is, and where it still runs`,hi:`ASA kya hai, aur yeh aaj bhi kahan chalta hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will take a Cisco ASA that has never been configured and turn it into a working internet edge: named interfaces with security levels, secure management access, a default route, dynamic PAT for the users, ICMP inspection, logging, and a first look at <code>packet-tracer</code>. You will also know how to read the connection and translation tables, and you will walk through a real ticket where a DMZ server cannot reach the internet. This is written for someone who has never touched an ASA.</p>
<p><b>Prerequisites.</b> You should know IPv4 addressing and subnet masks, what a default route is, and what NAT does in general (CCNA level). From the earlier modules in this track you already know what a <b>stateful firewall</b> is (Security foundations) and how SSH, AAA and syslog protect the management plane (AAA and secure device management). We refer back to those ideas instead of re-teaching them.</p>

<h3>An analogy: the security desk of a gated campus</h3>
<p>Picture an office campus with three zones. The <b>office building</b> where employees work is the most trusted. The <b>visitor lobby</b>, where the public can walk in to see a showroom, is partly trusted. The <b>street outside</b> is not trusted at all. One security desk sits where all three zones meet.</p>
<ul>
<li>Employees walking out to the street are let through without paperwork, and the guard writes their name in a logbook so that when they come back with a parcel they are recognised.</li>
<li>A stranger from the street who tries to walk into the office is stopped, unless there is a written rule that allows it.</li>
<li>The guard also hands every employee a campus visitor badge with the campus address, so the outside world never learns the internal desk numbers.</li>
</ul>
<p>That desk is the <b>ASA</b>. The zones are <b>interfaces</b> with a <b>trust level</b> (the security level). The logbook is the <b>connection table</b>. The badge swap is <b>NAT/PAT</b>. You will meet each of these in its own chapter.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Standard lab topology">
<rect x="10" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="63" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="120" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="143" text-anchor="middle" class="svg-ink" font-size="13">ADMIN .50</text>
<rect x="140" y="80" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="180" y="103" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="100" y1="58" x2="140" y2="98" stroke="#64748b"/><line x1="100" y1="138" x2="140" y2="98" stroke="#64748b"/>
<rect x="270" y="72" width="110" height="52" rx="8" fill="#fed7aa"/><text x="325" y="96" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<line x1="220" y1="98" x2="270" y2="98" stroke="#64748b"/>
<text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1</text>
<rect x="440" y="80" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="103" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="380" y1="98" x2="440" y2="98" stroke="#64748b"/>
<text x="410" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0</text>
<rect x="545" y="40" width="85" height="36" rx="8" fill="#fde68a"/><text x="587" y="63" text-anchor="middle" class="svg-ink" font-size="12">INET 8.8.8.8</text>
<rect x="545" y="120" width="85" height="36" rx="8" fill="#fde68a"/><text x="587" y="143" text-anchor="middle" class="svg-ink" font-size="12">PARTNER</text>
<line x1="520" y1="98" x2="545" y2="58" stroke="#64748b"/><line x1="520" y1="98" x2="545" y2="138" stroke="#64748b"/>
<rect x="270" y="190" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="325" y="213" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="325" y1="124" x2="325" y2="190" stroke="#64748b"/><text x="345" y="160" class="svg-muted" font-size="11">Gi0/2</text>
<text x="120" y="190" text-anchor="middle" class="svg-accent" font-size="12">inside 10.0.1.0/24 (100)</text>
<text x="325" y="248" text-anchor="middle" class="svg-accent" font-size="12">dmz 10.0.2.0/24 (50)</text>
<text x="480" y="30" text-anchor="middle" class="svg-accent" font-size="12">outside 203.0.113.0/29 (0)</text>
</svg><p class="cap">The topology used in both labs: inside users, a DMZ web server and the ISP on the outside.</p></div>

<h3>What exactly is the ASA?</h3>
<p>The <b>Adaptive Security Appliance (ASA)</b> is Cisco's classic <b>stateful firewall</b> and VPN head-end. It inspects traffic between zones, remembers every allowed connection so that replies come back automatically, translates addresses, and terminates site-to-site and remote-access VPNs. It runs its own operating system, simply called <b>ASA software</b>, with a CLI that looks like IOS but behaves differently in many small ways (chapter 2).</p>
<p>The ASA is not a next-generation firewall (NGFW) by itself. Application control, URL filtering and intrusion prevention live in <b>Secure Firewall Threat Defense (FTD)</b>, the newer software image that you will study later in this track. The same hardware can usually run <b>either</b> the ASA image or the FTD image.</p>

<h3>Where the ASA still runs today</h3>
<table class="cmp"><tr><th>Platform</th><th>What you will find</th></tr>
<tr><td><b>ASA 5500-X</b> (5506-X to 5555-X)</td><td>The classic boxes. End of sale and capped at older software releases, but still very common in production and in interviews.</td></tr>
<tr><td><b>Secure Firewall hardware</b> (1000, 2100, 3100, 4100, 4200, 9300 series)</td><td>Current appliances that can be installed with the ASA image or the FTD image.</td></tr>
<tr><td><b>ASAv</b> (virtual ASA)</td><td>Runs on VMware, KVM and the main public clouds. This is what your labs use.</td></tr>
</table>
<p>Many banks, service providers and enterprises keep ASAs because their VPN and NAT designs are stable and well understood. Even teams moving to FTD need ASA knowledge, because migrations start by reading the ASA configuration line by line.</p>

<h3>The words you will use all module</h3>
<dl class="terms">
<dt>nameif</dt><dd>The logical name of an interface (inside, outside, dmz). Every policy refers to the name, not the port.</dd>
<dt>Security level</dt><dd>A trust number from 0 (untrusted) to 100 (trusted) that decides default traffic flow.</dd>
<dt>Connection table</dt><dd>The ASA's list of live flows, so replies are allowed back automatically.</dd>
<dt>Xlate table</dt><dd>The list of active NAT/PAT translations.</dd>
<dt>PAT</dt><dd>Port Address Translation: many private hosts share one public address, separated by port numbers.</dd>
<dt>Inspection</dt><dd>Protocol-aware processing (DNS, FTP, ICMP and more) in the Modular Policy Framework.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) opens a web page on 8.8.8.8. The ASA sees a packet arrive on <b>inside</b> (level 100) going to <b>outside</b> (level 0): higher to lower, allowed. It rewrites the source to 203.0.113.2 with a port (PAT), writes a connection entry and forwards it to the ISP at 203.0.113.1. The reply comes back to 203.0.113.2, matches the entry, is translated back to 10.0.1.10 and delivered. One packet in, two tables updated, zero ACLs written.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating the ASA like a router with extra features. A router forwards everything it has a route for; an ASA forwards nothing until an interface has a name, a security level allows the flow (or an ACL does), and, for internet traffic, NAT makes the return path possible.</p></div>

<div class="exam"><p><b>Exam trap.</b> Do not confuse ASA and FTD. ASA = stateful firewall + VPN with its own CLI and ASDM. FTD = NGFW features (Snort-based IPS, application and URL control), usually managed by the Management Center. The same Secure Firewall hardware can run either image, but not both at once.</p></div>

<div class="scn"><h4>The "temporary" router that became the firewall</h4><p>A 40-person office used a small router as its internet edge, with NAT and no firewall policy. A penetration test found that a printer management page on the router's outside interface was reachable from the internet. The company installed an ASAv in front of the network with inside, dmz and outside interfaces. With no inbound rules, all unsolicited traffic from the internet was dropped by default, and the retest found nothing open.</p><p><b>Lesson:</b> the value of the ASA starts before you write a single ACL: lower-to-higher traffic is denied by default.</p></div>

<div class="iv"><p class="q">"What is a Cisco ASA, and how is it different from Firepower Threat Defense?"</p><p>Strong answer: the ASA is a stateful firewall and VPN concentrator with its own OS and CLI; it uses named interfaces, security levels, ACLs, NAT and inspection. FTD is the NGFW image that adds Snort-based intrusion prevention, application and URL control and is managed by the Management Center or Device Manager. Mention that the same Secure Firewall hardware and virtual platforms can run either image, and that ASA still runs widely, so migrations start from ASA configs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The ASA is a stateful firewall and VPN head-end with its own operating system.</li>
<li>It runs on legacy 5500-X boxes, current Secure Firewall hardware and as ASAv in labs and clouds.</li>
<li>NGFW features belong to FTD; the same hardware can run the ASA image or the FTD image.</li>
<li>Core ideas: nameif, security levels, connection table, xlate table, PAT, inspection.</li>
<li>By default the ASA lets inside users out and blocks unsolicited traffic in.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap ek bilkul unconfigured Cisco ASA ko working internet edge bana doge: security levels wale named interfaces, secure management access, default route, users ke liye dynamic PAT, ICMP inspection, logging, aur <code>packet-tracer</code> ki pehli jhalak. Aap connection aur translation tables padhna bhi seekhoge, aur ek real ticket walk karoge jismein DMZ server internet tak nahi pahunch pa raha. Yeh unke liye likha gaya hai jinhone kabhi ASA chhua bhi nahi.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnet masks, default route kya hota hai, aur general mein NAT kya karta hai (CCNA level) pata hona chahiye. Is track ke pehle modules se aap jaante ho ki <b>stateful firewall</b> kya hai (Security foundations) aur SSH, AAA aur syslog management plane ko kaise protect karte hain (AAA aur secure device management). Hum un ideas ko dobara padhane ki jagah unka reference denge.</p>

<h3>Ek analogy: gated campus ka security desk</h3>
<p>Ek office campus socho jismein teen zones hain. <b>Office building</b> jahan employees kaam karte hain, sabse trusted hai. <b>Visitor lobby</b>, jahan public showroom dekhne aa sakti hai, thoda trusted hai. <b>Bahar ki sadak</b> bilkul trusted nahi hai. Ek security desk wahan baitha hai jahan teeno zones milte hain.</p>
<ul>
<li>Employees jo bahar sadak par jaate hain, bina paperwork ke jaane diye jaate hain, aur guard logbook mein unka naam likh leta hai taaki jab woh parcel le kar wapas aayein to pehchaane jaayein.</li>
<li>Sadak se koi anjaan aadmi office mein ghusne ki koshish kare to roka jaata hai, jab tak koi likha hua rule use allow na kare.</li>
<li>Guard har employee ko campus address wala visitor badge bhi deta hai, taaki bahar ki duniya ko andar ke desk numbers kabhi pata na chalein.</li>
</ul>
<p>Woh desk hi <b>ASA</b> hai. Zones <b>interfaces</b> hain jinka ek <b>trust level</b> (security level) hota hai. Logbook <b>connection table</b> hai. Badge badalna <b>NAT/PAT</b> hai. In sab se aap alag alag chapter mein miloge.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Standard lab topology">
<rect x="10" y="40" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="63" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="10" y="120" width="90" height="36" rx="8" fill="#bbf7d0"/><text x="55" y="143" text-anchor="middle" class="svg-ink" font-size="13">ADMIN .50</text>
<rect x="140" y="80" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="180" y="103" text-anchor="middle" class="svg-ink" font-size="13">SW-IN</text>
<line x1="100" y1="58" x2="140" y2="98" stroke="#64748b"/><line x1="100" y1="138" x2="140" y2="98" stroke="#64748b"/>
<rect x="270" y="72" width="110" height="52" rx="8" fill="#fed7aa"/><text x="325" y="96" text-anchor="middle" class="svg-ink" font-size="14">ASA1</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">NK-ASA</text>
<line x1="220" y1="98" x2="270" y2="98" stroke="#64748b"/>
<text x="245" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/1</text>
<rect x="440" y="80" width="80" height="36" rx="8" fill="#e2e8f0"/><text x="480" y="103" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="380" y1="98" x2="440" y2="98" stroke="#64748b"/>
<text x="410" y="90" text-anchor="middle" class="svg-muted" font-size="11">Gi0/0</text>
<rect x="545" y="40" width="85" height="36" rx="8" fill="#fde68a"/><text x="587" y="63" text-anchor="middle" class="svg-ink" font-size="12">INET 8.8.8.8</text>
<rect x="545" y="120" width="85" height="36" rx="8" fill="#fde68a"/><text x="587" y="143" text-anchor="middle" class="svg-ink" font-size="12">PARTNER</text>
<line x1="520" y1="98" x2="545" y2="58" stroke="#64748b"/><line x1="520" y1="98" x2="545" y2="138" stroke="#64748b"/>
<rect x="270" y="190" width="110" height="36" rx="8" fill="#ddd6fe"/><text x="325" y="213" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="325" y1="124" x2="325" y2="190" stroke="#64748b"/><text x="345" y="160" class="svg-muted" font-size="11">Gi0/2</text>
<text x="120" y="190" text-anchor="middle" class="svg-accent" font-size="12">inside 10.0.1.0/24 (100)</text>
<text x="325" y="248" text-anchor="middle" class="svg-accent" font-size="12">dmz 10.0.2.0/24 (50)</text>
<text x="480" y="30" text-anchor="middle" class="svg-accent" font-size="12">outside 203.0.113.0/29 (0)</text>
</svg><p class="cap">Dono labs mein yahi topology hai: inside users, ek DMZ web server aur outside par ISP.</p></div>

<h3>ASA asal mein hai kya?</h3>
<p><b>Adaptive Security Appliance (ASA)</b> Cisco ka classic <b>stateful firewall</b> aur VPN head-end hai. Yeh zones ke beech traffic inspect karta hai, har allowed connection yaad rakhta hai taaki replies apne aap wapas aa jaayein, addresses translate karta hai, aur site-to-site aur remote-access VPNs terminate karta hai. Yeh apna alag operating system chalata hai, jise simply <b>ASA software</b> kehte hain, aur iska CLI IOS jaisa dikhta hai lekin bahut saari chhoti cheezon mein alag behave karta hai (chapter 2).</p>
<p>ASA akele next-generation firewall (NGFW) nahi hai. Application control, URL filtering aur intrusion prevention <b>Secure Firewall Threat Defense (FTD)</b> mein hote hain, jo naya software image hai aur jise aap is track mein aage padhoge. Same hardware aam taur par ASA image <b>ya</b> FTD image, dono mein se koi bhi chala sakta hai.</p>

<h3>ASA aaj bhi kahan chalta hai</h3>
<table class="cmp"><tr><th>Platform</th><th>Aapko kya milega</th></tr>
<tr><td><b>ASA 5500-X</b> (5506-X se 5555-X)</td><td>Classic boxes. End of sale hain aur purane software releases tak limited hain, lekin production aur interviews mein abhi bhi bahut common hain.</td></tr>
<tr><td><b>Secure Firewall hardware</b> (1000, 2100, 3100, 4100, 4200, 9300 series)</td><td>Current appliances jin par ASA image ya FTD image install kiya ja sakta hai.</td></tr>
<tr><td><b>ASAv</b> (virtual ASA)</td><td>VMware, KVM aur main public clouds par chalta hai. Aapke labs yahi use karte hain.</td></tr>
</table>
<p>Bahut saare banks, service providers aur enterprises ASA rakhte hain kyunki unke VPN aur NAT designs stable aur achhi tarah samjhe hue hain. Jo teams FTD par shift ho rahi hain unhe bhi ASA knowledge chahiye, kyunki migration ASA configuration ko line by line padhne se shuru hoti hai.</p>

<h3>Woh words jo aap poore module mein use karoge</h3>
<dl class="terms">
<dt>nameif</dt><dd>Interface ka logical naam (inside, outside, dmz). Har policy naam ko refer karti hai, port ko nahi.</dd>
<dt>Security level</dt><dd>0 (untrusted) se 100 (trusted) tak ka trust number jo default traffic flow decide karta hai.</dd>
<dt>Connection table</dt><dd>ASA ki live flows ki list, taaki replies apne aap wapas allow ho jaayein.</dd>
<dt>Xlate table</dt><dd>Active NAT/PAT translations ki list.</dd>
<dt>PAT</dt><dd>Port Address Translation: bahut saare private hosts ek public address share karte hain, port numbers se alag kiye hue.</dd>
<dt>Inspection</dt><dd>Modular Policy Framework mein protocol-aware processing (DNS, FTP, ICMP aur aur bhi).</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.1.10) 8.8.8.8 par web page kholta hai. ASA dekhta hai ki packet <b>inside</b> (level 100) par aaya aur <b>outside</b> (level 0) ki taraf ja raha hai: ooncha se neecha, allowed. Woh source ko ek port ke saath 203.0.113.2 mein badal deta hai (PAT), connection entry likhta hai aur use ISP 203.0.113.1 ko forward karta hai. Reply 203.0.113.2 par wapas aata hai, entry se match hota hai, wapas 10.0.1.10 mein translate hota hai aur deliver ho jaata hai. Ek packet andar, do tables update, zero ACLs likhe.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> ASA ko extra features wala router samajhna. Router har woh cheez forward karta hai jiska route ho; ASA tab tak kuch forward nahi karta jab tak interface ka naam na ho, security level (ya ACL) flow allow na kare, aur internet traffic ke liye NAT return path possible na banaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> ASA aur FTD ko confuse mat karo. ASA = stateful firewall + VPN, apne CLI aur ASDM ke saath. FTD = NGFW features (Snort-based IPS, application aur URL control), aam taur par Management Center se manage hota hai. Same Secure Firewall hardware dono mein se koi bhi image chala sakta hai, lekin ek saath dono nahi.</p></div>

<div class="scn"><h4>"Temporary" router jo firewall ban gaya</h4><p>Ek 40 logon ka office internet edge ke roop mein ek chhota router use karta tha, NAT ke saath aur bina firewall policy ke. Penetration test mein pata chala ki router ke outside interface par printer management page internet se reachable tha. Company ne network ke aage inside, dmz aur outside interfaces wala ASAv lagaya. Koi inbound rule na hone se, internet ka saara unsolicited traffic default se drop hua, aur retest mein kuch bhi khula nahi mila.</p><p><b>Seekh:</b> ASA ki value ek bhi ACL likhne se pehle shuru ho jaati hai: neeche se oonche level ka traffic default se denied hai.</p></div>

<div class="iv"><p class="q">"Cisco ASA kya hai, aur yeh Firepower Threat Defense se kaise alag hai?"</p><p>Strong answer: ASA ek stateful firewall aur VPN concentrator hai jiska apna OS aur CLI hai; yeh named interfaces, security levels, ACLs, NAT aur inspection use karta hai. FTD NGFW image hai jo Snort-based intrusion prevention, application aur URL control jodta hai aur Management Center ya Device Manager se manage hota hai. Batao ki same Secure Firewall hardware aur virtual platforms dono mein se koi bhi image chala sakte hain, aur ASA abhi bhi bahut chalta hai, isliye migrations ASA configs se shuru hoti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA ek stateful firewall aur VPN head-end hai jiska apna operating system hai.</li>
<li>Yeh purane 5500-X boxes, current Secure Firewall hardware aur labs aur clouds mein ASAv ke roop mein chalta hai.</li>
<li>NGFW features FTD ke hain; same hardware ASA image ya FTD image chala sakta hai.</li>
<li>Core ideas: nameif, security levels, connection table, xlate table, PAT, inspection.</li>
<li>Default se ASA inside users ko bahar jaane deta hai aur unsolicited traffic ko andar aane se rokta hai.</li>
</ul></div>
`}};export{e as default};