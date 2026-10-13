var e={id:`big-picture`,h:{en:`The big picture: security features that fail closed`,hi:`Big picture: security features jo band hokar fail hote hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to troubleshoot every item of ENARSI 300-410 v1.1 domain 3.0, Infrastructure Security: device access with IOS AAA (TACACS+, RADIUS and the local database), IPv4 ACLs (standard, extended and time-based), IPv6 traffic filters, unicast reverse path forwarding (uRPF), and control plane policing (CoPP) for Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF and BGP. You will read real output, find the broken line and fix it without switching the protection off.</p>

<p><b>Prerequisites.</b> You should already know how to configure these features at ENCOR level: <code>aaa new-model</code>, method lists, TACACS+ versus RADIUS, named ACLs and a first CoPP policy were all built in the ENCOR device security module. You also need routing basics (the routing table, CEF, static routes, OSPF adjacencies) and the structured troubleshooting method from the ENARSI start module. We will not re-teach syntax from zero; we will ask "why does it not work?" at every step.</p>

<h3>An analogy: a corporate office tower</h3>
<p>Picture an office tower with a strict security team:</p>
<ul>
<li>The <b>reception desk</b> checks every visitor's badge against the register at head office. If head office does not answer the phone, reception opens a sealed local visitor book. That is <b>AAA</b> with a server group and local fallback.</li>
<li>Every floor has a <b>door list</b> that says who may enter, top to bottom, and a final unwritten rule: "everyone else, no". Some doors only open on weekdays between 9 and 6. Those are <b>ACLs</b>, the implicit deny and <b>time-based ACLs</b>.</li>
<li>The mailroom checks the <b>return address</b> on each incoming parcel: "if I had to send a reply, would it go back the way this came?" Parcels with fake return addresses are shredded. That is <b>uRPF</b>.</li>
<li>The CEO's assistant decides how many visitors per minute may reach the CEO, and which kind: board members first, salespeople last. That is <b>CoPP</b>, protecting the router's CPU.</li>
</ul>
<p>Now notice the common danger: every one of these guards <b>fails closed</b>. A wrong line on a door list does not produce an error message; it silently keeps people out. That is why security problems so often look like "the network is down" tickets.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where each feature sits in the packet path">
<rect x="10" y="95" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="118" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text><text x="55" y="135" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<rect x="115" y="95" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="162" y="118" text-anchor="middle" class="svg-ink" font-size="13">Input ACL</text><text x="162" y="135" text-anchor="middle" class="svg-muted" font-size="12">filter</text>
<rect x="225" y="95" width="95" height="50" rx="8" fill="#fde68a"/><text x="272" y="118" text-anchor="middle" class="svg-ink" font-size="13">uRPF</text><text x="272" y="135" text-anchor="middle" class="svg-muted" font-size="12">source check</text>
<rect x="335" y="95" width="95" height="50" rx="8" fill="#bae6fd"/><text x="382" y="118" text-anchor="middle" class="svg-ink" font-size="13">FIB lookup</text><text x="382" y="135" text-anchor="middle" class="svg-muted" font-size="12">for me?</text>
<rect x="455" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="13">Transit: output ACL</text><text x="540" y="69" text-anchor="middle" class="svg-muted" font-size="12">then out Gi0/0</text>
<rect x="455" y="160" width="170" height="50" rx="8" fill="#fed7aa"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="13">To CPU: CoPP</text><text x="540" y="199" text-anchor="middle" class="svg-muted" font-size="12">then VTY, AAA</text>
<line x1="100" y1="120" x2="115" y2="120" stroke="#64748b" stroke-width="2"/><line x1="210" y1="120" x2="225" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="335" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="430" y1="110" x2="455" y2="60" stroke="#64748b" stroke-width="2"/><line x1="430" y1="130" x2="455" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Data plane: ACL + uRPF. Control plane: CoPP. Management: AAA.</text>
</svg><p class="cap">The order an IOS router applies the features in this module to an arriving packet.</p></div>

<h3>Three planes, three kinds of protection</h3>
<table class="cmp"><tr><th>Plane</th><th>What it is</th><th>Features in this module</th></tr>
<tr><td><b>Data plane</b></td><td>User packets passing through the router</td><td>Interface ACLs (IPv4 and IPv6), uRPF</td></tr>
<tr><td><b>Control plane</b></td><td>Packets the router must process itself: OSPF hellos, BGP updates, ARP</td><td>CoPP, and inbound ACLs that accidentally hit routing protocols</td></tr>
<tr><td><b>Management plane</b></td><td>How humans and tools reach the router: SSH, Telnet, HTTPS, SNMP</td><td>AAA, VTY access-class, management classes in CoPP</td></tr></table>

<h3>How the blueprint maps to the chapters</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>Chapters</th></tr>
<tr><td>3.1 Device security using IOS AAA (TACACS+, RADIUS, local database)</td><td>2 and 3</td></tr>
<tr><td>3.2.a IPv4 ACLs (standard, extended, time-based)</td><td>4 and 5</td></tr>
<tr><td>3.2.b IPv6 traffic filter</td><td>6</td></tr>
<tr><td>3.2.c Unicast reverse path forwarding</td><td>7 and 8</td></tr>
<tr><td>3.3 CoPP (Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF, BGP)</td><td>9 and 10</td></tr>
<tr><td>Troubleshooting workflow and the three labs</td><td>11, then the summary in 12</td></tr></table>

<div class="eg"><p><b>Worked example: one SSH packet, five guards.</b> The NOC station 10.99.0.10 opens SSH to R1 at 10.99.0.1. The packet enters Gi0/2. First the <b>input ACL</b> on Gi0/2 (if any) must permit TCP 22. Next <b>uRPF</b> asks whether the route back to 10.99.0.10 leaves through Gi0/2; it does, because 10.99.0.0/24 is connected there. The FIB says the destination is the router itself, so the packet is punted to the CPU and meets <b>CoPP</b>: it must match the management class, not class-default. Then the VTY <b>access-class</b> must permit the source, and finally <b>AAA</b> must authenticate the user. Five places to fail, and each one fails silently. A good engineer checks them in this same order.</p></div>

<h3>The labs you will solve</h3>
<ul>
<li><b>Stop spoofed sources with unicast RPF</b>: EDGE has a customer LAN 10.30.0.0/24 on Gi0/1 and two providers, ISP-A on Gi0/0 and ISP-B on Gi0/2. Strict uRPF on the customer side, loose uRPF on the asymmetric ISP-B side.</li>
<li><b>Keep guests away from the servers with an IPv6 ACL</b>: R1 routes STAFF 2001:db8:10::/64, GUEST 2001:db8:20::/64 and SERVERS 2001:db8:99::/64; the ACL GUEST-IN goes inbound on Gi0/1.</li>
<li><b>Troubleshoot: CoPP went live and the router went dark</b>: after a CoPP push, the OSPF adjacency to R2 is gone and the NOC cannot SSH to R1. You fix the classification without removing CoPP.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Removing the security feature to "test" and then forgetting to put it back, or putting it back with the same bug. Use counters and debugs to prove which line is dropping traffic instead. Every feature here has a counter: ACL matches, uRPF verification drops, CoPP class statistics, AAA server statistics.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions often show you output from one feature while the fault is in another. If <code>show ip access-lists</code> shows zero matches on the deny, the ACL is not your problem; look at uRPF drops or CoPP class-default next.</p></div>

<div class="scn"><h4>The Monday morning outage that was a Friday change</h4><p>A retail company lost all branch-to-DC traffic on Monday at 9:00. Nothing had changed over the weekend. The engineer checked routing (fine), then interface counters (fine), then <code>show ip access-lists</code> on the WAN router and saw a time-based entry that had become active at 9:00. A contractor had added a Friday change to block guest Wi-Fi "during business hours" but used the wrong source range, which covered the branch servers.</p><p><b>Lesson:</b> security features fail closed and can activate later than the change itself. Always ask what was changed, even days ago, and read the counters.</p></div>

<div class="iv"><p class="q">"A router suddenly stopped forwarding some traffic. How do you decide whether a security feature is the cause?"</p><p>Strong answer: follow the packet path. Check the input ACL counters, then uRPF verification drops on the ingress interface and in <code>show ip traffic</code>, then the routing decision, then the output ACL. For traffic to the router itself, check CoPP class counters, the VTY access-class and AAA server statistics. Mention that each feature has its own drop counter, so you prove the cause instead of guessing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3.0 covers AAA, IPv4 and IPv6 ACLs, uRPF and CoPP, all at troubleshooting depth.</li>
<li>Security features fail closed and silently, so their failures look like connectivity outages.</li>
<li>On IOS an arriving packet meets the input ACL, then uRPF, then the FIB; router-bound packets then meet CoPP, the VTY access-class and AAA.</li>
<li>Data plane: ACLs and uRPF. Control plane: CoPP. Management plane: AAA and VTY filters.</li>
<li>Every feature has a counter; troubleshoot with evidence, not by removing protection.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In baarah chapters ke end tak aap ENARSI 300-410 v1.1 domain 3.0, Infrastructure Security ka har item troubleshoot kar paoge: IOS AAA se device access (TACACS+, RADIUS aur local database), IPv4 ACLs (standard, extended aur time-based), IPv6 traffic filters, unicast reverse path forwarding (uRPF), aur Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF aur BGP ke liye control plane policing (CoPP). Aap real output padhoge, tooti hui line dhoondhoge aur protection band kiye bina use theek karoge.</p>

<p><b>Prerequisites.</b> Aapko yeh features ENCOR level par configure karna pehle se aana chahiye: <code>aaa new-model</code>, method lists, TACACS+ vs RADIUS, named ACLs aur pehli CoPP policy, yeh sab ENCOR device security module mein bane the. Aapko routing basics (routing table, CEF, static routes, OSPF adjacencies) aur ENARSI start module ka structured troubleshooting method bhi chahiye. Hum syntax zero se dobara nahi padhayenge; har step par hum poochhenge "yeh kaam kyun nahi kar raha?"</p>

<h3>Ek analogy: corporate office tower</h3>
<p>Ek office tower socho jiski security team bahut strict hai:</p>
<ul>
<li><b>Reception desk</b> har visitor ka badge head office ke register se check karta hai. Agar head office phone nahi uthata, to reception ek sealed local visitor book kholta hai. Yahi <b>AAA</b> hai, server group aur local fallback ke saath.</li>
<li>Har floor par ek <b>door list</b> hai jo upar se neeche batati hai ki kaun andar aa sakta hai, aur ek aakhri anlikha niyam: "baaki sab, nahi". Kuch darwaze sirf weekdays mein 9 se 6 ke beech khulte hain. Yeh hain <b>ACLs</b>, implicit deny aur <b>time-based ACLs</b>.</li>
<li>Mailroom har aane wale parcel ka <b>return address</b> check karta hai: "agar mujhe jawab bhejna ho, kya woh usi raaste wapas jayega jisse yeh aaya?" Nakli return address wale parcels shred ho jaate hain. Yahi <b>uRPF</b> hai.</li>
<li>CEO ki assistant tay karti hai ki ek minute mein kitne visitors CEO tak pahunchen, aur kaun se: board members pehle, salespeople aakhir mein. Yahi <b>CoPP</b> hai, jo router ke CPU ko bachata hai.</li>
</ul>
<p>Ab common khatra dekho: in sab guards mein se har ek <b>fail closed</b> hota hai. Door list ki galat line error message nahi deti; woh chupchaap logon ko bahar rakhti hai. Isiliye security problems aksar "network down hai" jaise tickets dikhte hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packet path mein har feature kahan hai">
<rect x="10" y="95" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="118" text-anchor="middle" class="svg-ink" font-size="13">Packet andar</text><text x="55" y="135" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<rect x="115" y="95" width="95" height="50" rx="8" fill="#ddd6fe"/><text x="162" y="118" text-anchor="middle" class="svg-ink" font-size="13">Input ACL</text><text x="162" y="135" text-anchor="middle" class="svg-muted" font-size="12">filter</text>
<rect x="225" y="95" width="95" height="50" rx="8" fill="#fde68a"/><text x="272" y="118" text-anchor="middle" class="svg-ink" font-size="13">uRPF</text><text x="272" y="135" text-anchor="middle" class="svg-muted" font-size="12">source check</text>
<rect x="335" y="95" width="95" height="50" rx="8" fill="#bae6fd"/><text x="382" y="118" text-anchor="middle" class="svg-ink" font-size="13">FIB lookup</text><text x="382" y="135" text-anchor="middle" class="svg-muted" font-size="12">mere liye?</text>
<rect x="455" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="540" y="52" text-anchor="middle" class="svg-ink" font-size="13">Transit: output ACL</text><text x="540" y="69" text-anchor="middle" class="svg-muted" font-size="12">phir Gi0/0 se bahar</text>
<rect x="455" y="160" width="170" height="50" rx="8" fill="#fed7aa"/><text x="540" y="182" text-anchor="middle" class="svg-ink" font-size="13">CPU ko: CoPP</text><text x="540" y="199" text-anchor="middle" class="svg-muted" font-size="12">phir VTY, AAA</text>
<line x1="100" y1="120" x2="115" y2="120" stroke="#64748b" stroke-width="2"/><line x1="210" y1="120" x2="225" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="120" x2="335" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="430" y1="110" x2="455" y2="60" stroke="#64748b" stroke-width="2"/><line x1="430" y1="130" x2="455" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Data plane: ACL + uRPF. Control plane: CoPP. Management: AAA.</text>
</svg><p class="cap">IOS router aane wale packet par is module ke features kis kram mein lagata hai.</p></div>

<h3>Teen planes, teen tarah ki protection</h3>
<table class="cmp"><tr><th>Plane</th><th>Yeh kya hai</th><th>Is module ke features</th></tr>
<tr><td><b>Data plane</b></td><td>Router se guzarne wale user packets</td><td>Interface ACLs (IPv4 aur IPv6), uRPF</td></tr>
<tr><td><b>Control plane</b></td><td>Woh packets jo router ko khud process karne hain: OSPF hellos, BGP updates, ARP</td><td>CoPP, aur woh inbound ACLs jo galti se routing protocols ko maar dete hain</td></tr>
<tr><td><b>Management plane</b></td><td>Insaan aur tools router tak kaise pahunchte hain: SSH, Telnet, HTTPS, SNMP</td><td>AAA, VTY access-class, CoPP ki management classes</td></tr></table>

<h3>Blueprint chapters se kaise judta hai</h3>
<table class="cmp"><tr><th>Blueprint item</th><th>Chapters</th></tr>
<tr><td>3.1 IOS AAA se device security (TACACS+, RADIUS, local database)</td><td>2 aur 3</td></tr>
<tr><td>3.2.a IPv4 ACLs (standard, extended, time-based)</td><td>4 aur 5</td></tr>
<tr><td>3.2.b IPv6 traffic filter</td><td>6</td></tr>
<tr><td>3.2.c Unicast reverse path forwarding</td><td>7 aur 8</td></tr>
<tr><td>3.3 CoPP (Telnet, SSH, HTTP(S), SNMP, EIGRP, OSPF, BGP)</td><td>9 aur 10</td></tr>
<tr><td>Troubleshooting workflow aur teeno labs</td><td>11, phir summary 12 mein</td></tr></table>

<div class="eg"><p><b>Worked example: ek SSH packet, paanch guards.</b> NOC station 10.99.0.10 R1 ke 10.99.0.1 par SSH kholta hai. Packet Gi0/2 mein aata hai. Pehle Gi0/2 ka <b>input ACL</b> (agar hai) TCP 22 permit kare. Phir <b>uRPF</b> poochhta hai ki 10.99.0.10 ka wapas ka route Gi0/2 se jaata hai ya nahi; jaata hai, kyunki 10.99.0.0/24 wahan connected hai. FIB kehta hai destination router khud hai, isliye packet CPU ko punt hota hai aur <b>CoPP</b> se milta hai: use management class se match karna chahiye, class-default se nahi. Phir VTY <b>access-class</b> source ko permit kare, aur aakhir mein <b>AAA</b> user ko authenticate kare. Fail hone ki paanch jagah, aur har ek chupchaap fail hoti hai. Achha engineer inhe isi kram mein check karta hai.</p></div>

<h3>Jo labs aap solve karoge</h3>
<ul>
<li><b>Unicast RPF se spoofed sources roko</b>: EDGE par Gi0/1 par customer LAN 10.30.0.0/24 hai aur do providers, Gi0/0 par ISP-A aur Gi0/2 par ISP-B. Customer side par strict uRPF, asymmetric ISP-B side par loose uRPF.</li>
<li><b>IPv6 ACL se guests ko servers se door rakho</b>: R1 STAFF 2001:db8:10::/64, GUEST 2001:db8:20::/64 aur SERVERS 2001:db8:99::/64 route karta hai; ACL GUEST-IN Gi0/1 par inbound lagti hai.</li>
<li><b>Troubleshoot: CoPP live hua aur router andhera ho gaya</b>: CoPP push ke baad R2 ke saath OSPF adjacency gayab hai aur NOC R1 par SSH nahi kar pa raha. Aap CoPP hataye bina classification theek karte ho.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> "Test" karne ke liye security feature hata dena aur phir wapas lagana bhool jaana, ya usi bug ke saath wapas laga dena. Iski jagah counters aur debugs se sabit karo ki kaunsi line traffic drop kar rahi hai. Yahan har feature ka counter hai: ACL matches, uRPF verification drops, CoPP class statistics, AAA server statistics.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENARSI questions aksar ek feature ka output dikhate hain jabki fault doosre mein hota hai. Agar <code>show ip access-lists</code> deny par zero matches dikhata hai, to ACL aapki problem nahi hai; aage uRPF drops ya CoPP class-default dekho.</p></div>

<div class="scn"><h4>Monday subah ka outage jo Friday ka change tha</h4><p>Ek retail company ka saara branch-to-DC traffic Monday ko 9:00 baje ruk gaya. Weekend par kuch nahi badla tha. Engineer ne routing check ki (theek), phir interface counters (theek), phir WAN router par <code>show ip access-lists</code> dekha aur ek time-based entry mili jo 9:00 baje active hui thi. Ek contractor ne Friday ko guest Wi-Fi ko "business hours mein" block karne ka change daala tha, lekin galat source range use ki thi jo branch servers ko bhi cover karti thi.</p><p><b>Seekh:</b> security features fail closed hote hain aur change ke kaafi baad active ho sakte hain. Hamesha poochho kya badla tha, chahe din pehle, aur counters padho.</p></div>

<div class="iv"><p class="q">"Ek router ne achanak kuch traffic forward karna band kar diya. Aap kaise tay karoge ki cause koi security feature hai ya nahi?"</p><p>Strong answer: packet ka path follow karo. Input ACL counters check karo, phir ingress interface par aur <code>show ip traffic</code> mein uRPF verification drops, phir routing decision, phir output ACL. Router ki taraf ke traffic ke liye CoPP class counters, VTY access-class aur AAA server statistics check karo. Batao ki har feature ka apna drop counter hai, isliye aap guess karne ki jagah cause sabit karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 3.0 AAA, IPv4 aur IPv6 ACLs, uRPF aur CoPP cover karta hai, sab troubleshooting depth par.</li>
<li>Security features fail closed aur chupchaap hote hain, isliye unke failures connectivity outage jaise dikhte hain.</li>
<li>IOS par aane wala packet pehle input ACL, phir uRPF, phir FIB se milta hai; router-bound packets phir CoPP, VTY access-class aur AAA se milte hain.</li>
<li>Data plane: ACLs aur uRPF. Control plane: CoPP. Management plane: AAA aur VTY filters.</li>
<li>Har feature ka counter hai; protection hata kar nahi, saboot se troubleshoot karo.</li>
</ul></div>
`}};export{e as default};