var e={id:`why-nat`,h:{en:`Why NAT exists: IPv4 exhaustion and private addresses`,hi:`NAT kyun hai: IPv4 exhaustion aur private addresses`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain why Network Address Translation exists, name the four NAT address terms without hesitation, mark router interfaces as inside or outside, and configure and verify the three flavours of inside source NAT on a Cisco IOS router: <b>static NAT</b> (including port forwarding), <b>dynamic NAT</b> with a pool and an ACL, and <b>PAT</b> (overload) on an interface or a pool. You will read <code>show ip nat translations</code> and <code>show ip nat statistics</code> like a senior engineer, recognise the four classic faults (inside/outside swapped, ACL does not match, no route back, pool too small), and explain what NAT breaks, what carrier-grade NAT is and why IPv6 was designed without it. This maps to CCNA 200-301 exam topic 4.1: <i>configure and verify inside source NAT using static and pools</i>.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing and subnetting (ccna-ipv4 module), the routing table and default routes (ccna-static module), and the idea of TCP and UDP port numbers (ccna-models module). You will meet a small standard ACL in this module; the full ACL story, including extended and named ACLs used for filtering, comes later in the ccna-acl module.</p>

<h3>Start with an analogy: the office switchboard</h3>
<p>Picture an office with 200 staff and only a handful of outside phone lines. Inside the building every desk has a short extension number, 201, 202, 203 and so on. Those extensions work perfectly inside, but nobody in the outside world can dial "extension 201", and every other company in town also has an extension 201. When a staff member calls a customer, the call goes out through the receptionist, and the customer sees the company's <b>main public number</b>. The receptionist writes in a notebook "extension 201 is talking to the customer on line 3", so when the customer answers or calls back on that line, the call is connected to the right desk.</p>
<p>That receptionist is <b>NAT</b>. The extensions are <b>private IPv4 addresses</b>, the main number is a <b>public address</b>, and the notebook is the <b>NAT translation table</b>.</p>

<h3>The problem: there are not enough IPv4 addresses</h3>
<p>An IPv4 address is 32 bits long, which gives about 4.3 billion combinations. That sounded enormous in 1981. Today there are many more phones, laptops, cameras and servers than people on earth, and large blocks are reserved for multicast, experiments and special uses. The central pool held by IANA ran out in 2011, and the regional registries, including APNIC for India and Asia-Pacific, ran out of normal allocations soon after. New companies today often receive a tiny public block, or a single address, from their ISP.</p>
<p>Two ideas saved IPv4 while IPv6 was being deployed:</p>
<ul>
<li><b>Private addressing (RFC 1918)</b>: three ranges that anyone may use inside their own network without asking anyone.</li>
<li><b>NAT</b>: at the edge of the network, a router replaces the private address with a public one and remembers the mapping, so replies can find their way back.</li>
</ul>

<table class="cmp"><tr><th>RFC 1918 range</th><th>Prefix</th><th>Covers</th></tr>
<tr><td>10.0.0.0</td><td>/8</td><td>10.0.0.0 – 10.255.255.255</td></tr>
<tr><td>172.16.0.0</td><td>/12</td><td>172.16.0.0 – 172.31.255.255</td></tr>
<tr><td>192.168.0.0</td><td>/16</td><td>192.168.0.0 – 192.168.255.255</td></tr></table>

<p>Why can private addresses not simply be routed on the internet? Because they are <b>not unique</b>. Thousands of companies use 10.1.1.0/24 at the same time. If an internet router carried a route for it, which company would it point to? So ISPs filter these ranges and never advertise them. A packet with a private source address may leave your network, but the reply, addressed to 10.1.1.10, has nowhere to go.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="NAT at the network edge">
<rect x="10" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.10</text>
<rect x="220" y="70" width="140" height="50" rx="8" fill="#bae6fd"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text><text x="290" y="110" text-anchor="middle" class="svg-accent" font-size="12">NAT table</text>
<rect x="440" y="70" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="92" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="140" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="95" x2="440" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="180" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 192.168.1.10</text>
<text x="400" y="150" text-anchor="middle" class="svg-accent" font-size="12">src 203.0.113.18</text>
<text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">Private (inside)</text>
<text x="520" y="40" text-anchor="middle" class="svg-ink" font-size="13">Public (outside)</text>
<line x1="290" y1="20" x2="290" y2="60" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Reply to 203.0.113.18 is translated back to 192.168.1.10</text>
</svg><p class="cap">NAT rewrites the source address on the way out and the destination address on the way back.</p></div>

<h3>What NAT actually does</h3>
<p>When a packet from an inside host leaves through the edge router, NAT rewrites the <b>source IP address</b> (and, with PAT, the source port) and recalculates the IP and TCP/UDP checksums. It stores the mapping in the translation table. When the reply arrives, NAT looks up the <b>destination</b> address (and port) in that table, rewrites it back to the private address and forwards the packet inside. The inside host never knows it was translated.</p>
<p>There are three flavours you must know for the CCNA:</p>
<table class="cmp"><tr><th>Type</th><th>Mapping</th><th>Typical use</th></tr>
<tr><td>Static NAT</td><td>One private to one public, permanent</td><td>Publishing a server to the internet</td></tr>
<tr><td>Dynamic NAT</td><td>One private to one public, taken from a pool on demand</td><td>Rare today; users with a small public block</td></tr>
<tr><td>PAT (overload)</td><td>Many private to one public, kept apart by port numbers</td><td>Every home router and almost every office</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Your home Wi-Fi router received one public address from the ISP, 203.0.113.18. Your laptop is 192.168.1.23 and your phone is 192.168.1.24. Both open a web page on 198.51.100.80 port 443 at the same moment. The router sends the laptop's packet as 203.0.113.18 source port 50001 and the phone's as 203.0.113.18 source port 50002. When replies arrive for port 50001 and 50002, the table tells the router which device each belongs to. One public address, two devices, no confusion. That is PAT, and you will configure it in chapter 6.</p></div>

<div class="warn"><p><b>Common mistake.</b> Calling NAT a security feature. NAT hides inside addresses and blocks unsolicited inbound connections only as a side effect of having no table entry. It inspects nothing and enforces no policy. Security comes from ACLs and firewalls.</p></div>

<div class="exam"><p><b>Exam trap.</b> 172.16.0.0/12 ends at 172.31.255.255. An address such as 172.32.5.1 or 172.15.0.1 is <b>public</b>, not private. Also, 100.64.0.0/10 is not RFC 1918; it is shared address space for carrier-grade NAT (chapter 9).</p></div>

<div class="scn"><h4>The "private" range that was not private</h4><p>A training startup in Pune numbered its new office 172.32.0.0/16, believing everything starting with 172 was private. Everything worked until staff tried to reach a partner's portal, which lived in a real public block inside 172.32.0.0/16. The edge router saw a connected route for that range and kept the traffic inside. The engineer checked the routing table, spotted the connected 172.32.0.0/16, and renumbered the office into 172.16.0.0/16.</p><p><b>Lesson:</b> learn the exact RFC 1918 boundaries; using someone else's public space inside breaks reachability to them.</p></div>

<div class="iv"><p class="q">"Why do we need NAT at all?"</p><p>Strong answer: IPv4 has about 4.3 billion addresses and the free pools are exhausted, so organisations use RFC 1918 private ranges inside. Those ranges are not unique, so internet routers do not route them. NAT at the edge replaces the private source with a public address and keeps a translation table so replies return to the right host. Mention PAT lets thousands of hosts share one address, and that IPv6 is the long-term fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 free address pools are exhausted; NAT and private addressing extended IPv4's life.</li>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; they are not routed on the internet.</li>
<li>NAT rewrites the source on the way out, the destination on the way back, and remembers the mapping in a translation table.</li>
<li>Three flavours: static (1:1 permanent), dynamic (1:1 from a pool), PAT (many:1 using ports).</li>
<li>NAT is not a firewall; the CCNA blueprint item is 4.1, inside source NAT with static entries and pools.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki Network Address Translation kyun hai, NAT ke chaar address terms bina atke bata paoge, router interfaces ko inside ya outside mark kar paoge, aur Cisco IOS router par inside source NAT ke teeno flavours configure aur verify kar paoge: <b>static NAT</b> (port forwarding ke saath), pool aur ACL wala <b>dynamic NAT</b>, aur interface ya pool par <b>PAT</b> (overload). Aap <code>show ip nat translations</code> aur <code>show ip nat statistics</code> ek senior engineer ki tarah padhoge, chaar classic faults pehchanoge (inside/outside ulta, ACL match nahi karta, return route nahi, pool chhota), aur samjha paoge ki NAT kya todta hai, carrier-grade NAT kya hai aur IPv6 bina NAT ke kyun design hua. Yeh CCNA 200-301 exam topic 4.1 se map hota hai: <i>configure and verify inside source NAT using static and pools</i>.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnetting (ccna-ipv4 module), routing table aur default routes (ccna-static module), aur TCP aur UDP port numbers ka idea (ccna-models module) aana chahiye. Is module mein aap ek chhota standard ACL dekhoge; poori ACL kahani, filtering ke liye extended aur named ACLs ke saath, baad mein ccna-acl module mein aati hai.</p>

<h3>Ek analogy se shuru karo: office ka switchboard</h3>
<p>Ek office socho jismein 200 staff hain aur bahar ki sirf kuch phone lines. Building ke andar har desk ka chhota extension number hai, 201, 202, 203 wagairah. Yeh extensions andar perfect chalte hain, par bahar ki duniya mein koi "extension 201" dial nahi kar sakta, aur shehar ki har doosri company ka bhi extension 201 hai. Jab koi staff member customer ko call karta hai, call receptionist ke through bahar jaati hai, aur customer ko company ka <b>main public number</b> dikhta hai. Receptionist ek notebook mein likhti hai "extension 201 line 3 par customer se baat kar raha hai", taaki jab customer jawab de ya us line par wapas call kare, call sahi desk tak jude.</p>
<p>Woh receptionist hai <b>NAT</b>. Extensions hain <b>private IPv4 addresses</b>, main number hai <b>public address</b>, aur notebook hai <b>NAT translation table</b>.</p>

<h3>Problem: IPv4 addresses kaafi nahi hain</h3>
<p>IPv4 address 32 bits ka hota hai, jisse lagbhag 4.3 billion combinations bante hain. 1981 mein yeh bahut bada lagta tha. Aaj duniya mein logon se kahin zyada phones, laptops, cameras aur servers hain, aur bade blocks multicast, experiments aur special uses ke liye reserved hain. IANA ka central pool 2011 mein khatam ho gaya, aur regional registries, jismein India aur Asia-Pacific ke liye APNIC bhi hai, ki normal allocations uske thodi der baad khatam ho gayin. Aaj nayi companies ko aksar ISP se ek chhota public block, ya sirf ek address milta hai.</p>
<p>IPv6 deploy hone tak do ideas ne IPv4 ko bachaya:</p>
<ul>
<li><b>Private addressing (RFC 1918)</b>: teen ranges jo koi bhi apne network ke andar bina kisi se pooche use kar sakta hai.</li>
<li><b>NAT</b>: network ke edge par router private address ko public address se replace karta hai aur mapping yaad rakhta hai, taaki replies wapas apna raasta dhoondh sakein.</li>
</ul>

<table class="cmp"><tr><th>RFC 1918 range</th><th>Prefix</th><th>Cover karta hai</th></tr>
<tr><td>10.0.0.0</td><td>/8</td><td>10.0.0.0 – 10.255.255.255</td></tr>
<tr><td>172.16.0.0</td><td>/12</td><td>172.16.0.0 – 172.31.255.255</td></tr>
<tr><td>192.168.0.0</td><td>/16</td><td>192.168.0.0 – 192.168.255.255</td></tr></table>

<p>Private addresses ko seedha internet par route kyun nahi kar sakte? Kyunki yeh <b>unique nahi hain</b>. Hazaron companies ek hi samay par 10.1.1.0/24 use karti hain. Agar internet router iska route rakhta, to woh kis company ki taraf point karta? Isliye ISPs in ranges ko filter karte hain aur kabhi advertise nahi karte. Private source address wala packet aapke network se nikal to sakta hai, par 10.1.1.10 ko addressed reply ke paas jaane ki koi jagah nahi hoti.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Network edge par NAT">
<rect x="10" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.10</text>
<rect x="220" y="70" width="140" height="50" rx="8" fill="#bae6fd"/><text x="290" y="92" text-anchor="middle" class="svg-ink" font-size="13">Edge router</text><text x="290" y="110" text-anchor="middle" class="svg-accent" font-size="12">NAT table</text>
<rect x="440" y="70" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="92" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><text x="530" y="110" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.80</text>
<line x1="140" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="360" y1="95" x2="440" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="180" y="150" text-anchor="middle" class="svg-muted" font-size="12">src 192.168.1.10</text>
<text x="400" y="150" text-anchor="middle" class="svg-accent" font-size="12">src 203.0.113.18</text>
<text x="100" y="40" text-anchor="middle" class="svg-ink" font-size="13">Private (inside)</text>
<text x="520" y="40" text-anchor="middle" class="svg-ink" font-size="13">Public (outside)</text>
<line x1="290" y1="20" x2="290" y2="60" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">203.0.113.18 ka reply wapas 192.168.1.10 banta hai</text>
</svg><p class="cap">NAT jaate waqt source address aur wapas aate waqt destination address rewrite karta hai.</p></div>

<h3>NAT asal mein kya karta hai</h3>
<p>Jab inside host ka packet edge router se bahar nikalta hai, NAT <b>source IP address</b> (aur PAT mein source port bhi) rewrite karta hai aur IP aur TCP/UDP checksums dobara calculate karta hai. Mapping translation table mein store hoti hai. Jab reply aata hai, NAT us table mein <b>destination</b> address (aur port) dhoondhta hai, use wapas private address mein rewrite karta hai aur packet andar forward karta hai. Inside host ko kabhi pata nahi chalta ki uska translation hua.</p>
<p>CCNA ke liye teen flavours aane chahiye:</p>
<table class="cmp"><tr><th>Type</th><th>Mapping</th><th>Typical use</th></tr>
<tr><td>Static NAT</td><td>Ek private se ek public, permanent</td><td>Server ko internet par publish karna</td></tr>
<tr><td>Dynamic NAT</td><td>Ek private se ek public, zaroorat par pool se</td><td>Aaj kal kam; chhote public block wale users</td></tr>
<tr><td>PAT (overload)</td><td>Bahut saare private se ek public, port numbers se alag</td><td>Har home router aur lagbhag har office</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Aapke home Wi-Fi router ko ISP se ek public address mila, 203.0.113.18. Aapka laptop 192.168.1.23 hai aur phone 192.168.1.24. Dono ek hi pal mein 198.51.100.80 port 443 par web page kholte hain. Router laptop ka packet 203.0.113.18 source port 50001 se bhejta hai aur phone ka 203.0.113.18 source port 50002 se. Jab port 50001 aur 50002 ke replies aate hain, table router ko batati hai ki kaunsa kis device ka hai. Ek public address, do devices, koi confusion nahi. Yahi PAT hai, aur aap ise chapter 6 mein configure karoge.</p></div>

<div class="warn"><p><b>Common galti.</b> NAT ko security feature kehna. NAT inside addresses chhupata hai aur unsolicited inbound connections sirf isliye rokta hai kyunki unki table entry nahi hoti, yeh ek side effect hai. Yeh kuch inspect nahi karta aur koi policy enforce nahi karta. Security ACLs aur firewalls se aati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 172.16.0.0/12 172.31.255.255 par khatam hota hai. 172.32.5.1 ya 172.15.0.1 jaisa address <b>public</b> hai, private nahi. Aur 100.64.0.0/10 RFC 1918 nahi hai; yeh carrier-grade NAT ke liye shared address space hai (chapter 9).</p></div>

<div class="scn"><h4>"Private" range jo private nahi thi</h4><p>Pune ki ek training startup ne apne naye office ko 172.32.0.0/16 se number kiya, yeh maan kar ki 172 se shuru hone wala sab kuch private hai. Sab theek chala jab tak staff ne ek partner ka portal kholne ki koshish nahi ki, jo 172.32.0.0/16 ke andar ek asli public block mein tha. Edge router ko us range ka connected route dikha aur usne traffic andar hi rakha. Engineer ne routing table check ki, connected 172.32.0.0/16 dekha, aur office ko 172.16.0.0/16 mein renumber kiya.</p><p><b>Seekh:</b> RFC 1918 ki exact boundaries yaad rakho; kisi aur ka public space andar use karne se unki reachability toot jaati hai.</p></div>

<div class="iv"><p class="q">"Humein NAT ki zaroorat hi kyun hai?"</p><p>Strong answer: IPv4 mein lagbhag 4.3 billion addresses hain aur free pools khatam ho chuke hain, isliye organisations andar RFC 1918 private ranges use karti hain. Yeh ranges unique nahi hain, isliye internet routers inhe route nahi karte. Edge par NAT private source ko public address se replace karta hai aur translation table rakhta hai taaki replies sahi host tak wapas aayein. Batao ki PAT hazaron hosts ko ek address share karne deta hai, aur long-term fix IPv6 hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 free address pools khatam ho chuke hain; NAT aur private addressing ne IPv4 ki umar badhai.</li>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; yeh internet par route nahi hote.</li>
<li>NAT jaate waqt source, wapas aate waqt destination rewrite karta hai, aur mapping translation table mein yaad rakhta hai.</li>
<li>Teen flavours: static (1:1 permanent), dynamic (pool se 1:1), PAT (ports se many:1).</li>
<li>NAT firewall nahi hai; CCNA blueprint item 4.1 hai, static entries aur pools ke saath inside source NAT.</li>
</ul></div>
`}};export{e as default};