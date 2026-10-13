var e={id:`security-dns`,h:{en:`Keeping the branch safe with DIA, and getting DNS right`,hi:`DIA ke saath branch ko safe rakhna, aur DNS sahi karna`},body:{en:`
<p>Backhaul hid the branch behind the data center firewall. With DIA the branch itself faces the internet, so the controls that used to sit in Mumbai must move to Pune, or to the cloud. This chapter lists those controls from a defender's point of view, then deals with DNS, which quietly decides whether DIA actually improves the user experience. The security module that follows goes deep into each control; here you learn which one answers which risk.</p>

<h3>Analogy: moving the shop from a mall to a street corner</h3>
<p>A shop inside a mall relies on the mall's guards, cameras and locked gates. If the same shop opens on a street corner, the owner must install shutters, a CCTV, an alarm, and possibly hire a guard. The shop did not become less valuable; the protection simply has to be provided locally. DIA is the street corner.</p>

<h3>Which control answers which risk</h3>
<table class="cmp"><tr><th>Risk at a DIA branch</th><th>Control</th><th>Where it runs</th></tr>
<tr><td>Unsolicited connections from the internet to branch hosts</td><td><b>Stateful firewall</b>: Enterprise Firewall with Application Awareness (zone-based; inside zone for the service VPN, outside zone for VPN 0)</td><td>On the WAN Edge</td></tr>
<tr><td>Exploits, malware downloads, malicious sites</td><td><b>IPS, URL filtering, Advanced Malware Protection</b> (the UTD security container)</td><td>On the WAN Edge, on supported platforms</td></tr>
<tr><td>Users reaching malicious domains (phishing, command-and-control)</td><td><b>DNS-layer security</b> (Umbrella DNS redirection)</td><td>Cloud, steered by the WAN Edge</td></tr>
<tr><td>Need for central inspection without a security stack at every branch</td><td><b>Secure Internet Gateway (SIG)</b>: IPsec or GRE tunnels to a cloud security provider</td><td>Cloud</td></tr>
<tr><td>Exposure of the router itself on the transport</td><td><b>allow-service list</b> and ACLs on the tunnel interface</td><td>On the WAN Edge</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Zones on a DIA branch edge">
<rect x="10" y="50" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="13">Inside zone</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">service VPN 10</text>
<rect x="250" y="40" width="140" height="100" rx="10" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">E-BR1</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">firewall, UTD,</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">DNS redirect, NAT</text>
<rect x="490" y="50" width="140" height="80" rx="10" fill="#fed7aa"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Outside zone</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">VPN 0 transport</text>
<line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="3"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Inside may start sessions to outside; replies are allowed back; the rest is dropped.</text>
</svg><p class="cap">The zone-based firewall puts the service VPN in an inside zone and the transport in an outside zone.</p></div>

<h3>Two important distinctions</h3>
<ul>
<li><b>NAT is not a firewall.</b> PAT does hide inside addresses and, with no static mappings, unsolicited inbound traffic has no translation entry. But it does not inspect, log or restrict what inside users do. A real stateful firewall policy is needed for the branch.</li>
<li><b>allow-service is not user security.</b> The <code>allow-service</code> list on the tunnel interface (dhcp, dns, icmp, sshd, netconf, ntp, ospf, stun and others) protects the <b>router itself</b> on the transport. Only enable what is needed, and never expose management services to the whole internet. It says nothing about what branch users may reach.</li>
</ul>

<h3>Compliance: only what must break out</h3>
<p>Many organisations allow DIA only for guest Wi-Fi and an approved list of SaaS, and keep payment or regulated traffic on backhaul so it passes the central inspection point. The selective data policies of the previous chapters make that possible. Write down which traffic is allowed to break out, and review the list when applications change.</p>

<h3>DNS: the quiet half of DIA</h3>
<p>SaaS providers and CDNs answer DNS queries with the server closest to the <b>resolver</b>, not closest to the user. So the resolver you use decides which server your DIA traffic reaches.</p>
<ul>
<li><b>Resolve locally what breaks out locally.</b> If Pune breaks out locally but its PCs still use a DNS server in Mumbai, SaaS names resolve to servers near Mumbai. The traffic leaves Pune locally, then travels across the country to a Mumbai-region server anyway. Use a local or cloud resolver for internet names.</li>
<li><b>Split DNS.</b> Internal names (for example <code>erp.bharat.example</code>) must still be resolved by the internal DNS over the overlay. A public resolver cannot answer them and would also leak the query outside.</li>
<li><b>Redirect DNS by policy.</b> A data policy can match DNS (UDP 53) and use <code>redirect-dns</code> to send queries to a chosen resolver. For DNS-layer security, the Umbrella integration redirects queries to the cloud resolver, with a <b>local domain bypass list</b> (regular expressions for internal domains such as <code>.*\\.bharat\\.example</code>) so internal names still go to the internal server.</li>
<li><b>Learn applications from DNS.</b> A data policy with <code>dns-app-list</code> lets the edge map the DNS answer to an application, so the flow that follows is recognised from its first packet.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune users resolve <code>files.saas-vendor.example</code> through the Mumbai resolver and get a Mumbai-region address, 1,000 km away. After the team points the Pune LAN DHCP to a local resolver for internet names, and keeps a conditional forwarder for <code>bharat.example</code> to the internal DNS, the same name returns a server near Pune. Download time for a 200 MB file falls from 90 seconds to 35 seconds with no change to the policy or NAT.</p></div>

<div class="note"><p><b>Limits to remember for DNS security.</b> DNS-layer redirection only sees traffic that uses DNS through the edge: direct-to-IP connections, clients using their own encrypted DNS in the browser, and web proxy clients bypass it. Only some record types are redirected, and the redirection is UDP-based. Data-policy NAT and the Umbrella DNS redirection can also be incompatible on the same flow, so test the combination before roll-out.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling DIA without any firewall on the branch. (2) Opening sshd or netconf in allow-service on an internet transport for convenience. (3) Leaving all clients on the data center DNS and wondering why SaaS is still far away. (4) Sending internal domains to a public resolver. (5) Assuming DNS security protects traffic that does not use DNS.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which feature protects the router's own control and management services on the transport?" The <b>allow-service</b> list (and ACLs). "Which feature inspects user traffic going to the internet at the branch?" The <b>Enterprise Firewall</b> (and UTD for IPS, URL filtering and AMP). The two are often swapped in distractors.</p></div>

<div class="scn"><h4>The branch that exposed SSH to the internet</h4><p>When Pune went to DIA, an engineer enabled <code>allow-service sshd</code> on the biz-internet tunnel interface to be able to log in from home. A routine scan the following week showed SSH answering on the public address and thousands of failed login attempts in the logs. The service was removed immediately, access was restricted to a management VPN and a source-restricted ACL, and the team added a review step for every allow-service change.</p><p><b>Lesson:</b> DIA exposes the transport. Treat allow-service as a firewall rule for the router.</p></div>

<div class="iv"><p class="q">"You are moving a branch from backhaul to DIA. What security do you put in place?"</p><p>An enterprise (zone-based) firewall at the branch with the service VPN as the inside zone and the transport as the outside zone; IPS, URL filtering and AMP through the UTD container where the platform supports it, or DNS-layer security and a SIG tunnel to a cloud provider for a thin branch; a restricted allow-service list on the transport; and selective DIA so regulated traffic stays on backhaul. Add correct DNS: local resolver for internet names, split DNS for internal names.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA moves the security burden to the branch (firewall, UTD) or to the cloud (DNS security, SIG).</li>
<li>NAT is not a firewall; allow-service protects the router, not the users.</li>
<li>Keep regulated traffic on backhaul and break out only what is approved.</li>
<li>Resolve internet names locally, keep internal names on internal DNS (split DNS), and use redirect-dns or Umbrella with a bypass list.</li>
<li>DNS-layer security does not see traffic that bypasses DNS.</li>
</ul></div>
`,hi:`
<p>Backhaul branch ko data center firewall ke peeche chhupa deta tha. DIA ke saath branch khud internet ke saamne hoti hai, isliye jo controls Mumbai mein the woh Pune ya cloud mein jaane chahiye. Yeh chapter defender ke point of view se un controls ki list deta hai, phir DNS ki baat karta hai, jo chupchaap decide karta hai ki DIA sach mein user experience behtar karta hai ya nahi. Aage ka security module har control mein gehra jaata hai; yahan aap seekhte ho ki kaunsa control kaunse risk ka jawab hai.</p>

<h3>Analogy: dukaan mall se street corner par le jaana</h3>
<p>Mall ke andar ki dukaan mall ke guards, cameras aur locked gates par depend karti hai. Wahi dukaan street corner par khule to maalik ko shutters, CCTV, alarm lagane padte hain, aur shayad guard rakhna padta hai. Dukaan ki value kam nahi hui; bas protection locally deni padti hai. DIA street corner hai.</p>

<h3>Kaunsa control kaunse risk ka jawab hai</h3>
<table class="cmp"><tr><th>DIA branch par risk</th><th>Control</th><th>Kahan chalta hai</th></tr>
<tr><td>Internet se branch hosts par unsolicited connections</td><td><b>Stateful firewall</b>: Enterprise Firewall with Application Awareness (zone-based; service VPN ke liye inside zone, VPN 0 ke liye outside zone)</td><td>WAN Edge par</td></tr>
<tr><td>Exploits, malware downloads, malicious sites</td><td><b>IPS, URL filtering, Advanced Malware Protection</b> (UTD security container)</td><td>Supported platforms par WAN Edge par</td></tr>
<tr><td>Users ka malicious domains tak pahunchna (phishing, command-and-control)</td><td><b>DNS-layer security</b> (Umbrella DNS redirection)</td><td>Cloud, WAN Edge se steer</td></tr>
<tr><td>Har branch par security stack ke bina central inspection ki zaroorat</td><td><b>Secure Internet Gateway (SIG)</b>: cloud security provider tak IPsec ya GRE tunnels</td><td>Cloud</td></tr>
<tr><td>Transport par router khud expose hona</td><td>Tunnel interface par <b>allow-service list</b> aur ACLs</td><td>WAN Edge par</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="DIA branch edge par zones">
<rect x="10" y="50" width="140" height="80" rx="10" fill="#bbf7d0"/><text x="80" y="82" text-anchor="middle" class="svg-ink" font-size="13">Inside zone</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">service VPN 10</text>
<rect x="250" y="40" width="140" height="100" rx="10" fill="#bae6fd"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">E-BR1</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">firewall, UTD,</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">DNS redirect, NAT</text>
<rect x="490" y="50" width="140" height="80" rx="10" fill="#fed7aa"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="13">Outside zone</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">VPN 0 transport</text>
<line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="3"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Inside sessions start kar sakta hai; replies allowed; baaki drop.</text>
</svg><p class="cap">Zone-based firewall service VPN ko inside zone mein aur transport ko outside zone mein rakhta hai.</p></div>

<h3>Do zaroori fark</h3>
<ul>
<li><b>NAT firewall nahi hai.</b> PAT inside addresses chhupata hai aur, static mappings ke bina, unsolicited inbound traffic ke liye translation entry nahi hoti. Lekin woh inside users kya karte hain yeh inspect, log ya restrict nahi karta. Branch ke liye asli stateful firewall policy chahiye.</li>
<li><b>allow-service user security nahi hai.</b> Tunnel interface ki <code>allow-service</code> list (dhcp, dns, icmp, sshd, netconf, ntp, ospf, stun and others) transport par <b>router khud</b> ko protect karti hai. Sirf wahi enable karo jo chahiye, aur management services ko poore internet par expose mat karo. Woh yeh nahi batati ki branch users kya reach kar sakte hain.</li>
</ul>

<h3>Compliance: sirf wahi jo break out karna zaroori hai</h3>
<p>Kai organisations DIA sirf guest Wi-Fi aur approved SaaS ki list ke liye allow karte hain, aur payment ya regulated traffic backhaul par rakhte hain taaki woh central inspection point se guzre. Pichhle chapters ki selective data policies yeh possible banati hain. Likh lo ki kaunsa traffic break out kar sakta hai, aur applications badalne par list review karo.</p>

<h3>DNS: DIA ka chupa hua aadha hissa</h3>
<p>SaaS providers aur CDNs DNS queries ka jawab <b>resolver</b> ke sabse paas wale server se dete hain, user ke sabse paas wale se nahi. Isliye aap jo resolver use karte ho woh decide karta hai ki aapka DIA traffic kaunse server tak pahunchta hai.</p>
<ul>
<li><b>Jo locally break out ho use locally resolve karo.</b> Agar Pune locally break out karta hai lekin uske PCs abhi bhi Mumbai ka DNS server use karte hain, to SaaS names Mumbai ke paas ke servers par resolve hote hain. Traffic Pune se locally nikalta hai, phir bhi poore desh mein Mumbai-region server tak jaata hai. Internet names ke liye local ya cloud resolver use karo.</li>
<li><b>Split DNS.</b> Internal names (jaise <code>erp.bharat.example</code>) ko phir bhi internal DNS se overlay par resolve hona chahiye. Public resolver unhe answer nahi kar sakta aur query bahar leak bhi karega.</li>
<li><b>Policy se DNS redirect.</b> Data policy DNS (UDP 53) match karke <code>redirect-dns</code> se queries chune hue resolver ko bhej sakti hai. DNS-layer security ke liye Umbrella integration queries cloud resolver ko redirect karta hai, <b>local domain bypass list</b> ke saath (internal domains ke liye regular expressions jaise <code>.*\\.bharat\\.example</code>) taaki internal names internal server ko jaayein.</li>
<li><b>DNS se applications seekho.</b> <code>dns-app-list</code> wali data policy edge ko DNS answer ko application se map karne deti hai, isliye uske baad ka flow pehle packet se pehchana jaata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune users <code>files.saas-vendor.example</code> Mumbai resolver se resolve karte hain aur 1,000 km door Mumbai-region address paate hain. Team Pune LAN DHCP ko internet names ke liye local resolver par point karti hai, aur <code>bharat.example</code> ke liye internal DNS ko conditional forwarder rakhti hai, to wahi naam Pune ke paas ka server deta hai. 200 MB file ka download time 90 seconds se 35 seconds ho jaata hai, policy ya NAT mein koi badlav kiye bina.</p></div>

<div class="note"><p><b>DNS security ke liye limits yaad rakho.</b> DNS-layer redirection sirf wahi traffic dekhti hai jo edge ke through DNS use karta hai: direct-to-IP connections, browser mein apna encrypted DNS use karne wale clients, aur web proxy clients ise bypass karte hain. Sirf kuch record types redirect hote hain, aur redirection UDP-based hai. Data-policy NAT aur Umbrella DNS redirection ek hi flow par incompatible bhi ho sakte hain, isliye roll-out se pehle combination test karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Branch par bina kisi firewall ke DIA enable karna. (2) Convenience ke liye internet transport par allow-service mein sshd ya netconf kholna. (3) Saare clients ko data center DNS par chhod dena aur sochna ki SaaS abhi bhi door kyun hai. (4) Internal domains ko public resolver bhejna. (5) Yeh maan lena ki DNS security woh traffic protect karti hai jo DNS use hi nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Transport par router ki apni control aur management services ko kaunsa feature protect karta hai?" <b>allow-service</b> list (aur ACLs). "Branch par internet jaate user traffic ko kaunsa feature inspect karta hai?" <b>Enterprise Firewall</b> (aur IPS, URL filtering, AMP ke liye UTD). Distractors mein yeh dono aksar swap kiye jaate hain.</p></div>

<div class="scn"><h4>Branch jisne SSH internet par expose kar diya</h4><p>Pune jab DIA par gaya, ek engineer ne ghar se login karne ke liye biz-internet tunnel interface par <code>allow-service sshd</code> enable kar diya. Agle hafte ek routine scan ne public address par SSH jawab deta dikhaya aur logs mein hazaaron failed login attempts. Service turant hata di gayi, access management VPN aur source-restricted ACL tak restrict kiya gaya, aur team ne har allow-service change ke liye review step jod diya.</p><p><b>Lesson:</b> DIA transport ko expose karta hai. allow-service ko router ke liye firewall rule samjho.</p></div>

<div class="iv"><p class="q">"Aap ek branch ko backhaul se DIA par le ja rahe ho. Kaunsi security lagaoge?"</p><p>Branch par enterprise (zone-based) firewall, service VPN inside zone aur transport outside zone; jahan platform support kare wahan UTD container se IPS, URL filtering aur AMP, ya thin branch ke liye DNS-layer security aur cloud provider tak SIG tunnel; transport par restricted allow-service list; aur selective DIA taaki regulated traffic backhaul par rahe. Sahi DNS jodo: internet names ke liye local resolver, internal names ke liye split DNS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA security ka bojh branch (firewall, UTD) ya cloud (DNS security, SIG) par daalta hai.</li>
<li>NAT firewall nahi hai; allow-service router ko protect karta hai, users ko nahi.</li>
<li>Regulated traffic backhaul par rakho aur sirf approved traffic break out karo.</li>
<li>Internet names locally resolve karo, internal names internal DNS par rakho (split DNS), aur bypass list ke saath redirect-dns ya Umbrella use karo.</li>
<li>DNS-layer security woh traffic nahi dekhti jo DNS bypass karta hai.</li>
</ul></div>
`}};export{e as default};