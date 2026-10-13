var e={id:`ravpn-zt`,h:{en:`Remote-access VPNs and an introduction to zero trust`,hi:`Remote-access VPNs aur zero trust ka introduction`},body:{en:`
<p>The site-to-site VPN was the armoured van between branches. Now think of one employee working from a hotel in Goa. She does not bring a van; she carries a <b>personal pass</b> that lets her through a staff entrance at head office from anywhere. That is a <b>remote-access VPN</b>: one user device, on demand, to the company network. At the end of the chapter we ask a harder question: once she is inside, should she be trusted everywhere? That question is <b>zero trust</b>.</p>

<h3>Site-to-site versus remote access</h3>
<table class="cmp"><tr><th></th><th>Site-to-site</th><th>Remote access</th></tr>
<tr><td>Connects</td><td>Two networks (branch and HQ)</td><td>One user device to the company</td></tr>
<tr><td>Built by</td><td>Routers or firewalls at both ends</td><td>VPN client software on the laptop or phone, to a VPN headend</td></tr>
<tr><td>When</td><td>Always on</td><td>On demand, when the user connects</td></tr>
<tr><td>End hosts</td><td>Unaware of the VPN</td><td>The device gets a VPN-assigned inside address</td></tr>
<tr><td>Typical technology</td><td>IPsec (crypto map, VTI), GRE over IPsec, DMVPN</td><td>TLS/SSL VPN client, IPsec IKEv2 client, clientless browser portal</td></tr></table>

<h3>How a remote-access VPN works</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Remote-access VPN">
<rect x="10" y="80" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="13">Laptop + client</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="12">hotel Wi-Fi</text>
<ellipse cx="250" cy="108" rx="70" ry="36" fill="#e2e8f0"/><text x="250" y="113" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="360" y="80" width="130" height="56" rx="8" fill="#fed7aa"/><text x="425" y="104" text-anchor="middle" class="svg-ink" font-size="13">VPN headend</text><text x="425" y="122" text-anchor="middle" class="svg-muted" font-size="12">firewall / router</text>
<rect x="520" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="575" y="122" text-anchor="middle" class="svg-muted" font-size="12">apps</text>
<line x1="140" y1="108" x2="180" y2="108" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="360" y2="108" stroke="#64748b" stroke-width="2"/><line x1="490" y1="108" x2="520" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="160" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="520" y="185" text-anchor="middle" class="svg-ink" font-size="12">AAA: RADIUS + MFA</text>
<line x1="425" y1="136" x2="470" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="250" y="40" text-anchor="middle" class="svg-accent" font-size="12">Encrypted tunnel: TLS (TCP/UDP 443) or IPsec IKEv2</text>
</svg><p class="cap">The client builds an encrypted tunnel to the headend, which authenticates the user through AAA and hands out an inside address.</p></div>
<ol>
<li>The user starts the VPN client (for example Cisco Secure Client, formerly AnyConnect) and connects to the headend's public name, such as vpn.corp.example.</li>
<li>The client checks the headend's <b>certificate</b> to make sure it talks to the real gateway, not an impostor.</li>
<li>The user authenticates: username and password checked through <b>AAA</b> (usually RADIUS), plus <b>MFA</b>, and often a device certificate.</li>
<li>Optional <b>posture</b> check: is the OS patched, is endpoint protection running?</li>
<li>The headend assigns an inside address from a VPN pool (for example 10.99.10.0/24), pushes DNS servers and routes, and applies a per-group access policy.</li>
<li>Traffic to the company flows encrypted inside the tunnel.</li>
</ol>

<h3>TLS/SSL versus IPsec clients</h3>
<p><b>TLS (SSL) VPNs</b> use TLS over TCP 443, often with DTLS over UDP 443 for better performance. Because 443 is open almost everywhere (hotels, airports), TLS VPNs connect reliably. A <b>clientless</b> variant gives browser access to selected web apps through a portal without installing software. <b>IPsec remote access</b> uses IKEv2 with ESP and a client that supports it (many operating systems have one built in). Both give strong encryption; the choice depends on the headend, the clients and the firewalls in between.</p>

<h3>Full tunnel versus split tunnel</h3>
<p>In a <b>full tunnel</b>, all the user's traffic, including internet browsing, goes through the VPN, so company security controls inspect it. In a <b>split tunnel</b>, only company subnets go through the VPN and internet traffic goes directly out of the hotel connection. Split tunnel saves headend bandwidth, but internet traffic then bypasses company inspection. Many companies use split tunnel together with a cloud security service that protects the direct internet traffic.</p>

<div class="eg"><p><b>Worked example.</b> Priya connects from a hotel. Her laptop has public address 198.51.100.44 from the hotel; the headend at 203.0.113.5 assigns her 10.99.10.23. Split tunnel routes 10.0.0.0/8 into the tunnel; everything else goes directly out. In the headend session table you see her username, public IP, assigned IP, the TLS protocol and bytes in each direction.</p></div>

<h3>Zero trust: the introduction</h3>
<p>The classic model is <b>castle and moat</b>: strong walls (firewall, VPN) and full trust once you are inside. The weakness is obvious: one phished laptop inside the walls can reach everything. <b>Zero trust</b> replaces location-based trust with a simple principle: <b>never trust, always verify</b>.</p>
<ul>
<li><b>Verify explicitly</b>: every access request is authenticated and authorised using identity, device health, location and behaviour, not just "is it on the internal network".</li>
<li><b>Least privilege</b>: give access to the specific application, not to a whole network.</li>
<li><b>Assume breach</b>: segment the network (microsegmentation) so an attacker who gets in cannot move sideways; log and monitor everything.</li>
<li><b>Continuous evaluation</b>: trust is checked again during the session, not only at login.</li>
</ul>
<p><b>ZTNA</b> (zero trust network access) is the remote-access form of this idea: instead of putting the laptop "on the network", a broker connects the user only to the specific applications they are allowed to use. 802.1X with dynamic VLANs or security group tags on campus is the same idea applied to the office. At CCNA level you only need to explain the principle and how it differs from perimeter-only security.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Remote-access VPN with password only and no MFA: the most common entry point in real breaches. (2) One VPN group with full access for everyone, including contractors. (3) Not patching the VPN headend itself, which faces the internet. (4) Treating "connected to VPN" as "trusted": that is the castle-and-moat thinking zero trust replaces.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remote access = one device, client software, on demand; site-to-site = networks, routers, always on, hosts unaware. TLS VPN uses TCP 443; clientless = browser only. Remote access can also be IPsec (IKEv2). Zero trust = never trust, always verify; least privilege; assume breach.</p></div>

<div class="scn"><h4>The contractor who could see everything</h4><p>A payments company gave an external support contractor a VPN account in the same group as staff. When the contractor's laptop was infected, the malware scanned the whole 10.0.0.0/8 range through the VPN and reached a test database with real card data. The fix: a separate VPN group for contractors with an ACL allowing only the two systems they support, MFA for every account, posture checks, and a project to move contractor access to ZTNA, where the contractor sees only those two applications and never the network.</p><p><b>Lesson:</b> a VPN protects the path, not what the user can reach at the end of it. Combine VPN with least privilege and zero trust thinking.</p></div>

<div class="iv"><p class="q">"Compare site-to-site and remote-access VPNs, and explain split tunnelling."</p><p>Strong answer: site-to-site connects two networks with always-on tunnels between routers or firewalls, transparent to hosts, usually IPsec or GRE over IPsec. Remote access connects individual devices on demand using a client, over TLS on 443 or IPsec IKEv2, with AAA and MFA and an address from a VPN pool. Split tunnel sends only corporate subnets through the tunnel and the rest directly to the internet; it saves bandwidth but bypasses central inspection. Bonus: mention that zero trust and ZTNA give application-level access instead of network access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote-access VPN: one device, client software, on demand, AAA plus MFA, address from a VPN pool.</li>
<li>TLS VPNs use TCP 443 (and DTLS UDP 443); IPsec clients use IKEv2 and ESP; clientless uses a browser portal.</li>
<li>Full tunnel inspects everything centrally; split tunnel sends only corporate traffic through the VPN.</li>
<li>Zero trust: never trust, always verify; least privilege; assume breach; continuous evaluation.</li>
<li>ZTNA gives access to applications, not to the whole network.</li>
</ul></div>
`,hi:`
<p>Site-to-site VPN branches ke beech armoured van tha. Ab Goa ke ek hotel se kaam kar rahi ek employee ko socho. Woh van nahi laati; uske paas ek <b>personal pass</b> hai jo use kahin se bhi head office ke staff entrance se andar aane deta hai. Yahi <b>remote-access VPN</b> hai: ek user device, zaroorat par, company network tak. Chapter ke end mein hum ek mushkil sawaal poochte hain: jab woh andar aa gayi, to kya us par har jagah bharosa karna chahiye? Yahi sawaal <b>zero trust</b> hai.</p>

<h3>Site-to-site vs remote access</h3>
<table class="cmp"><tr><th></th><th>Site-to-site</th><th>Remote access</th></tr>
<tr><td>Kya jodta hai</td><td>Do networks (branch aur HQ)</td><td>Ek user device ko company se</td></tr>
<tr><td>Kaun banata hai</td><td>Dono taraf ke routers ya firewalls</td><td>Laptop ya phone par VPN client software, VPN headend tak</td></tr>
<tr><td>Kab</td><td>Hamesha on</td><td>Zaroorat par, jab user connect kare</td></tr>
<tr><td>End hosts</td><td>VPN se anjaan</td><td>Device ko VPN-assigned inside address milta hai</td></tr>
<tr><td>Typical technology</td><td>IPsec (crypto map, VTI), GRE over IPsec, DMVPN</td><td>TLS/SSL VPN client, IPsec IKEv2 client, clientless browser portal</td></tr></table>

<h3>Remote-access VPN kaise kaam karta hai</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Remote-access VPN">
<rect x="10" y="80" width="130" height="56" rx="8" fill="#bbf7d0"/><text x="75" y="104" text-anchor="middle" class="svg-ink" font-size="13">Laptop + client</text><text x="75" y="122" text-anchor="middle" class="svg-muted" font-size="12">hotel Wi-Fi</text>
<ellipse cx="250" cy="108" rx="70" ry="36" fill="#e2e8f0"/><text x="250" y="113" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="360" y="80" width="130" height="56" rx="8" fill="#fed7aa"/><text x="425" y="104" text-anchor="middle" class="svg-ink" font-size="13">VPN headend</text><text x="425" y="122" text-anchor="middle" class="svg-muted" font-size="12">firewall / router</text>
<rect x="520" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="13">Corporate</text><text x="575" y="122" text-anchor="middle" class="svg-muted" font-size="12">apps</text>
<line x1="140" y1="108" x2="180" y2="108" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="360" y2="108" stroke="#64748b" stroke-width="2"/><line x1="490" y1="108" x2="520" y2="108" stroke="#64748b" stroke-width="2"/>
<rect x="420" y="160" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="520" y="185" text-anchor="middle" class="svg-ink" font-size="12">AAA: RADIUS + MFA</text>
<line x1="425" y1="136" x2="470" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="250" y="40" text-anchor="middle" class="svg-accent" font-size="12">Encrypted tunnel: TLS (TCP/UDP 443) ya IPsec IKEv2</text>
</svg><p class="cap">Client headend tak encrypted tunnel banata hai, jo AAA ke through user ko authenticate karta hai aur inside address deta hai.</p></div>
<ol>
<li>User VPN client shuru karta hai (jaise Cisco Secure Client, pehle AnyConnect) aur headend ke public naam, jaise vpn.corp.example, se connect karta hai.</li>
<li>Client headend ka <b>certificate</b> check karta hai taaki pakka ho ki woh asli gateway se baat kar raha hai, kisi nakli se nahi.</li>
<li>User authenticate karta hai: username aur password <b>AAA</b> (aam taur par RADIUS) se check hota hai, plus <b>MFA</b>, aur aksar device certificate.</li>
<li>Optional <b>posture</b> check: kya OS patched hai, kya endpoint protection chal raha hai?</li>
<li>Headend VPN pool (jaise 10.99.10.0/24) se inside address deta hai, DNS servers aur routes push karta hai, aur per-group access policy lagata hai.</li>
<li>Company ka traffic tunnel ke andar encrypted chalta hai.</li>
</ol>

<h3>TLS/SSL vs IPsec clients</h3>
<p><b>TLS (SSL) VPNs</b> TCP 443 par TLS use karte hain, aksar behtar performance ke liye UDP 443 par DTLS ke saath. Kyunki 443 lagbhag har jagah khula hota hai (hotels, airports), TLS VPNs bharose se connect hote hain. <b>Clientless</b> variant bina software install kiye portal ke through chune hue web apps tak browser access deta hai. <b>IPsec remote access</b> ESP ke saath IKEv2 aur use support karne wala client use karta hai (kai operating systems mein built-in hota hai). Dono strong encryption dete hain; choice headend, clients aur beech ke firewalls par depend karti hai.</p>

<h3>Full tunnel vs split tunnel</h3>
<p><b>Full tunnel</b> mein user ka saara traffic, internet browsing samet, VPN se jaata hai, isliye company ke security controls use inspect karte hain. <b>Split tunnel</b> mein sirf company subnets VPN se jaate hain aur internet traffic seedha hotel connection se bahar jaata hai. Split tunnel headend bandwidth bachata hai, lekin tab internet traffic company inspection ko bypass kar deta hai. Kai companies split tunnel ke saath ek cloud security service use karti hain jo direct internet traffic ko protect karti hai.</p>

<div class="eg"><p><b>Worked example.</b> Priya hotel se connect karti hai. Uske laptop ka hotel se public address 198.51.100.44 hai; 203.0.113.5 wala headend use 10.99.10.23 deta hai. Split tunnel 10.0.0.0/8 ko tunnel mein route karta hai; baaki sab seedha bahar jaata hai. Headend session table mein aapko uska username, public IP, assigned IP, TLS protocol aur har direction ke bytes dikhte hain.</p></div>

<h3>Zero trust: introduction</h3>
<p>Classic model <b>castle and moat</b> hai: mazboot deewarein (firewall, VPN) aur andar aane ke baad poora bharosa. Kamzori saaf hai: deewaron ke andar ek phish hua laptop har cheez tak pahunch sakta hai. <b>Zero trust</b> location-based trust ki jagah ek simple principle laata hai: <b>never trust, always verify</b>.</p>
<ul>
<li><b>Verify explicitly</b>: har access request identity, device health, location aur behaviour se authenticate aur authorise hoti hai, sirf "kya yeh internal network par hai" se nahi.</li>
<li><b>Least privilege</b>: specific application ka access do, poore network ka nahi.</li>
<li><b>Assume breach</b>: network ko segment karo (microsegmentation) taaki andar aaya attacker side mein na badh sake; sab kuch log aur monitor karo.</li>
<li><b>Continuous evaluation</b>: trust session ke dauraan dobara check hota hai, sirf login par nahi.</li>
</ul>
<p><b>ZTNA</b> (zero trust network access) is idea ka remote-access roop hai: laptop ko "network par" rakhne ki jagah, ek broker user ko sirf un specific applications se jodta hai jinka use allowed hai. Campus par dynamic VLANs ya security group tags ke saath 802.1X wahi idea office par lagu karna hai. CCNA level par aapko bas principle samjhana hai aur batana hai ki yeh sirf perimeter wali security se kaise alag hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sirf password wala, bina MFA ka remote-access VPN: real breaches mein sabse common entry point. (2) Sabke liye, contractors samet, full access wala ek hi VPN group. (3) VPN headend ko hi patch na karna, jo internet ke saamne hai. (4) "VPN se connected" ko "trusted" samajhna: yahi castle-and-moat soch hai jise zero trust badalta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Remote access = ek device, client software, zaroorat par; site-to-site = networks, routers, hamesha on, hosts anjaan. TLS VPN TCP 443 use karta hai; clientless = sirf browser. Remote access IPsec (IKEv2) bhi ho sakta hai. Zero trust = never trust, always verify; least privilege; assume breach.</p></div>

<div class="scn"><h4>Contractor jo sab kuch dekh sakta tha</h4><p>Ek payments company ne external support contractor ko staff wale group mein hi VPN account de diya. Jab contractor ka laptop infect hua, malware ne VPN ke through poora 10.0.0.0/8 range scan kiya aur asli card data wale test database tak pahunch gaya. Fix: contractors ke liye alag VPN group jiski ACL sirf un do systems ko allow kare jinhe woh support karte hain, har account ke liye MFA, posture checks, aur contractor access ko ZTNA par le jaane ka project, jahan contractor sirf woh do applications dekhe aur network kabhi nahi.</p><p><b>Seekh:</b> VPN raasta protect karta hai, yeh nahi ki user uske end par kya reach kar sakta hai. VPN ko least privilege aur zero trust soch ke saath jodo.</p></div>

<div class="iv"><p class="q">"Site-to-site aur remote-access VPNs compare karo, aur split tunnelling samjhao."</p><p>Strong answer: site-to-site do networks ko routers ya firewalls ke beech hamesha-on tunnels se jodta hai, hosts ke liye transparent, aam taur par IPsec ya GRE over IPsec. Remote access individual devices ko zaroorat par client se jodta hai, 443 par TLS ya IPsec IKEv2 ke upar, AAA aur MFA ke saath aur VPN pool se address ke saath. Split tunnel sirf corporate subnets ko tunnel se bhejta hai aur baaki seedha internet par; bandwidth bachata hai lekin central inspection bypass karta hai. Bonus: batao ki zero trust aur ZTNA network access ki jagah application-level access dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote-access VPN: ek device, client software, zaroorat par, AAA plus MFA, VPN pool se address.</li>
<li>TLS VPNs TCP 443 (aur DTLS UDP 443) use karte hain; IPsec clients IKEv2 aur ESP; clientless browser portal use karta hai.</li>
<li>Full tunnel sab kuch centrally inspect karta hai; split tunnel sirf corporate traffic VPN se bhejta hai.</li>
<li>Zero trust: never trust, always verify; least privilege; assume breach; continuous evaluation.</li>
<li>ZTNA applications ka access deta hai, poore network ka nahi.</li>
</ul></div>
`}};export{e as default};