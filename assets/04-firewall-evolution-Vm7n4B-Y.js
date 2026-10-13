var e={id:`fw-evolution`,h:{en:`Firewall evolution: packet filter to NGFW`,hi:`Firewall evolution: packet filter se NGFW tak`},body:{en:`
<p>Think of how building security grew up. First there was a fence with a gate that checked only the number plate of each car. Then came a guard with a visitor register. Then a reception desk that escorted visitors personally. Today there is a full security team with ID badges, bag scanners and cameras. Firewalls followed exactly the same path. Each generation fixed a weakness of the one before it, and every generation is still in use somewhere.</p>

<h3>Generation 1: the stateless packet filter</h3>
<p>A <b>packet filter</b> judges <b>each packet on its own</b>, using only header fields: source and destination IP, protocol, and source and destination port. A router ACL is the everyday example. It is fast and cheap, but it has <b>no memory</b>. When PC1 sends a request to a web server, the reply comes back from source port 80 to a random high port on PC1. The filter has no idea this reply belongs to a request, so you must write a rule for the return direction too, and that rule is always wide.</p>
<pre class="code"><span class="c">! Stateless router ACL on the internet interface (inbound)</span>
ip access-list extended INET-IN
 permit tcp any 10.0.1.0 0.0.0.255 established
 deny   ip any any log
interface GigabitEthernet0/0
 ip access-group INET-IN in</pre>
<p>The <code>established</code> keyword helps a little: it permits TCP packets that have the ACK or RST bit set, which true session-opening SYNs do not. But it only looks at flag bits, not at a real session, so a crafted packet with ACK set still passes, and it does nothing at all for UDP or ICMP. Older IOS add-ons such as reflexive ACLs and CBAC tried to add state to routers; the modern IOS answer is the <b>zone-based firewall</b>.</p>

<h3>Generation 2: the stateful firewall</h3>
<p>A <b>stateful firewall</b> remembers every allowed conversation in a <b>connection table</b> (also called a state table or session table). The first packet of a flow is checked against the policy; if it is allowed, an entry is created, and every later packet in either direction is matched against that entry instead of the rule base. Replies pass automatically; unsolicited packets do not. It also checks that TCP packets arrive in a sensible order (a SYN-ACK must follow a SYN), which defeats the crafted-ACK trick above. The Cisco ASA is the classic example. Its limit: it trusts the port number. Anything on TCP 443 looks like "HTTPS", whether it is a banking site, a game, or malware talking to its controller.</p>

<h3>Generation 3: the proxy or application gateway</h3>
<p>An <b>application proxy</b> terminates the client's connection itself and opens a second, separate connection to the server. Because it speaks the application protocol, it can inspect commands and content in full. That is powerful but slow, and each application needs its own proxy. Explicit web proxies and many cloud security gateways work this way today.</p>

<h3>Generation 4: the next-generation firewall (NGFW)</h3>
<p>An <b>NGFW</b> keeps stateful inspection and adds context and content:</p>
<ul>
<li><b>Application visibility and control (AVC):</b> identifies the application (for Cisco, the OpenAppID detectors) whatever the port.</li>
<li><b>User identity:</b> rules by user or group from ISE, Active Directory or a captive portal, not only by IP.</li>
<li><b>Intrusion prevention (IPS):</b> Snort 3 signatures in Cisco Secure Firewall Threat Defense.</li>
<li><b>URL filtering and reputation:</b> category and risk of each site, Security Intelligence feeds from Talos.</li>
<li><b>File and malware inspection:</b> file-type control and cloud malware lookups.</li>
<li><b>TLS decryption:</b> optional, to see inside encrypted traffic.</li>
</ul>
<p>A <b>web application firewall (WAF)</b> is a specialist: it sits in front of one web application and understands HTTP deeply to stop SQL injection, XSS and similar attacks. It complements, not replaces, the network firewall.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="What each firewall type can see">
<text x="10" y="20" class="svg-muted" font-size="12">What the device can see</text>
<rect x="10" y="30" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="80" y="53" text-anchor="middle" class="svg-ink" font-size="12">L3/L4 headers</text>
<rect x="10" y="74" width="140" height="36" rx="6" fill="#bae6fd"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="12">+ session state</text>
<rect x="10" y="118" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="80" y="141" text-anchor="middle" class="svg-ink" font-size="12">+ app protocol</text>
<rect x="10" y="162" width="140" height="36" rx="6" fill="#fde68a"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">+ app, user, threat</text>
<text x="170" y="53" class="svg-ink" font-size="13">Packet filter: router ACL</text>
<text x="170" y="97" class="svg-ink" font-size="13">Stateful firewall: ASA, IOS zone-based firewall</text>
<text x="170" y="141" class="svg-ink" font-size="13">Proxy / application gateway, WAF (web only)</text>
<text x="170" y="185" class="svg-ink" font-size="13">NGFW: Secure Firewall Threat Defense</text>
<line x1="600" y1="40" x2="600" y2="190" stroke="#64748b"/><polygon points="594,186 606,186 600,198" fill="#64748b"/>
<text x="590" y="215" text-anchor="end" class="svg-accent" font-size="12">more context, more CPU</text>
</svg><p class="cap">Each generation sees more, and pays for it with processing power, licensing and tuning.</p></div>

<div class="eg"><p><b>Worked example: the same packet, four decisions.</b> A laptop sends TCP to 203.0.113.80 port 443. The <b>packet filter</b> sees "TCP to 443" and permits. The <b>stateful firewall</b> sees a new outbound connection from a high-security interface and permits it, then tracks the session. A <b>proxy</b> terminates the TLS session (if configured) and inspects the request. The <b>NGFW</b> identifies the application as a file-sharing service, sees the user belongs to Finance, finds the destination in a "newly seen domain" feed, and blocks the upload under the data-protection rule.</p></div>

<table class="cmp"><tr><th>Type</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>Packet filter</td><td>Very fast, on every router</td><td>No state; return traffic must be opened by hand</td></tr>
<tr><td>Stateful</td><td>Replies automatic, unsolicited traffic dropped</td><td>Blind to the application inside a port</td></tr>
<tr><td>Proxy</td><td>Full protocol inspection</td><td>Slow, per-application</td></tr>
<tr><td>NGFW</td><td>Policy by app, user, content and threat</td><td>Needs licences, tuning and more CPU</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Assuming an NGFW is "on" just because you bought one. Application control, IPS, URL and malware inspection are policies and licences you must enable and tune. An NGFW with only an allow-any access rule is a stateful firewall with a bigger price tag.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <code>established</code> keyword does not make an ACL stateful; it only checks the ACK and RST flags. And "which device can allow a social network but block its games on the same port" is always the <b>NGFW</b>, because only it identifies applications.</p></div>

<div class="scn"><h4>Port 443 carried more than web pages</h4><p>An enterprise with a stateful firewall allowed outbound TCP 80 and 443 for everyone. Bandwidth to the internet doubled over a month. The firewall's connection table showed only "TCP 443", which told the team nothing. After migrating to an NGFW with application visibility, the dashboard showed a peer-to-peer file-sharing tool and a remote-access application running over 443. The team blocked both by application, not by port, and bandwidth dropped back.</p><p><b>Lesson:</b> ports describe a doorway, not who is walking through it.</p></div>

<div class="iv"><p class="q">"What makes a firewall next-generation?"</p><p>An NGFW is still stateful, but it adds application identification independent of port, user identity, integrated IPS, URL and reputation filtering, file and malware inspection, and optional TLS decryption, with policy that can use all of these together. Name a Cisco example (Secure Firewall Threat Defense managed by Management Center) and one reason it matters: controlling applications that share port 443.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet filters judge each packet alone; they have no memory of sessions.</li>
<li><code>established</code> checks flags only and does nothing for UDP or ICMP.</li>
<li>Stateful firewalls track sessions in a connection table but trust the port number.</li>
<li>Proxies terminate and inspect; WAFs specialise in protecting web applications.</li>
<li>NGFWs add application, user, IPS, URL, file and decryption to stateful inspection.</li>
</ul></div>
`,hi:`
<p>Socho building security kaise badi hui. Pehle ek fence tha jiske gate par sirf har car ki number plate check hoti thi. Phir visitor register wala guard aaya. Phir reception desk jo visitors ko khud le kar jaata tha. Aaj ID badges, bag scanners aur cameras ke saath poori security team hai. Firewalls ne bilkul yahi raasta liya. Har generation ne pichhli wali ki ek kamzori theek ki, aur har generation aaj bhi kahin na kahin use hoti hai.</p>

<h3>Generation 1: stateless packet filter</h3>
<p><b>Packet filter</b> <b>har packet ko akele</b> judge karta hai, sirf header fields use karke: source aur destination IP, protocol, aur source aur destination port. Router ACL roz ka example hai. Yeh tez aur sasta hai, lekin iski <b>koi memory nahi</b>. Jab PC1 web server ko request bhejta hai, reply source port 80 se PC1 ke kisi random high port par wapas aata hai. Filter ko pata hi nahi ki yeh reply ek request ka hai, isliye aapko return direction ke liye bhi rule likhna padta hai, aur woh rule hamesha bahut khula hota hai.</p>
<pre class="code"><span class="c">! Internet interface par stateless router ACL (inbound)</span>
ip access-list extended INET-IN
 permit tcp any 10.0.1.0 0.0.0.255 established
 deny   ip any any log
interface GigabitEthernet0/0
 ip access-group INET-IN in</pre>
<p><code>established</code> keyword thodi madad karta hai: yeh un TCP packets ko permit karta hai jinmein ACK ya RST bit set hai, jo asli session kholne wale SYNs mein nahi hota. Lekin yeh sirf flag bits dekhta hai, asli session nahi, isliye ACK set wala banaya hua packet phir bhi nikal jaata hai, aur UDP ya ICMP ke liye yeh kuch nahi karta. Purane IOS add-ons jaise reflexive ACLs aur CBAC ne routers mein state jodne ki koshish ki; modern IOS jawab hai <b>zone-based firewall</b>.</p>

<h3>Generation 2: stateful firewall</h3>
<p><b>Stateful firewall</b> har allowed baatcheet ko ek <b>connection table</b> mein yaad rakhta hai (ise state table ya session table bhi kehte hain). Flow ka pehla packet policy se check hota hai; allowed hai to entry banti hai, aur dono direction ka har agla packet rule base ki jagah us entry se match hota hai. Replies apne aap jaate hain; bina bulaye packets nahi. Yeh yeh bhi check karta hai ki TCP packets sahi order mein aayein (SYN ke baad hi SYN-ACK aana chahiye), jo upar wali crafted-ACK trick ko hara deta hai. Cisco ASA classic example hai. Iski seema: yeh port number par bharosa karta hai. TCP 443 par kuch bhi "HTTPS" dikhta hai, chahe woh banking site ho, game ho, ya apne controller se baat karta malware.</p>

<h3>Generation 3: proxy ya application gateway</h3>
<p><b>Application proxy</b> client ka connection khud terminate karta hai aur server ke liye doosra, alag connection kholta hai. Kyunki woh application protocol bolta hai, woh commands aur content poori tarah inspect kar sakta hai. Yeh powerful hai lekin slow, aur har application ko apna proxy chahiye. Explicit web proxies aur kai cloud security gateways aaj isi tarah kaam karte hain.</p>

<h3>Generation 4: next-generation firewall (NGFW)</h3>
<p><b>NGFW</b> stateful inspection rakhta hai aur context aur content jodta hai:</p>
<ul>
<li><b>Application visibility and control (AVC):</b> application pehchaanta hai (Cisco ke liye, OpenAppID detectors), port chahe jo ho.</li>
<li><b>User identity:</b> ISE, Active Directory ya captive portal se user ya group ke hisaab se rules, sirf IP se nahi.</li>
<li><b>Intrusion prevention (IPS):</b> Cisco Secure Firewall Threat Defense mein Snort 3 signatures.</li>
<li><b>URL filtering aur reputation:</b> har site ki category aur risk, Talos ki Security Intelligence feeds.</li>
<li><b>File aur malware inspection:</b> file-type control aur cloud malware lookups.</li>
<li><b>TLS decryption:</b> optional, encrypted traffic ke andar dekhne ke liye.</li>
</ul>
<p><b>Web application firewall (WAF)</b> specialist hai: yeh ek web application ke saamne baithta hai aur HTTP ko gehrai se samajhta hai taaki SQL injection, XSS aur aise attacks ruk sakein. Yeh network firewall ka saathi hai, uski jagah nahi leta.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Har firewall type kya dekh sakta hai">
<text x="10" y="20" class="svg-muted" font-size="12">Device kya dekh sakta hai</text>
<rect x="10" y="30" width="140" height="36" rx="6" fill="#e2e8f0"/><text x="80" y="53" text-anchor="middle" class="svg-ink" font-size="12">L3/L4 headers</text>
<rect x="10" y="74" width="140" height="36" rx="6" fill="#bae6fd"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="12">+ session state</text>
<rect x="10" y="118" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="80" y="141" text-anchor="middle" class="svg-ink" font-size="12">+ app protocol</text>
<rect x="10" y="162" width="140" height="36" rx="6" fill="#fde68a"/><text x="80" y="185" text-anchor="middle" class="svg-ink" font-size="12">+ app, user, threat</text>
<text x="170" y="53" class="svg-ink" font-size="13">Packet filter: router ACL</text>
<text x="170" y="97" class="svg-ink" font-size="13">Stateful firewall: ASA, IOS zone-based firewall</text>
<text x="170" y="141" class="svg-ink" font-size="13">Proxy / application gateway, WAF (sirf web)</text>
<text x="170" y="185" class="svg-ink" font-size="13">NGFW: Secure Firewall Threat Defense</text>
<line x1="600" y1="40" x2="600" y2="190" stroke="#64748b"/><polygon points="594,186 606,186 600,198" fill="#64748b"/>
<text x="590" y="215" text-anchor="end" class="svg-accent" font-size="12">zyada context, zyada CPU</text>
</svg><p class="cap">Har generation zyada dekhti hai, aur iski keemat processing power, licensing aur tuning se chukati hai.</p></div>

<div class="eg"><p><b>Worked example: ek hi packet, chaar faisle.</b> Ek laptop 203.0.113.80 ko port 443 par TCP bhejta hai. <b>Packet filter</b> dekhta hai "TCP to 443" aur permit karta hai. <b>Stateful firewall</b> high-security interface se naya outbound connection dekhta hai aur permit karta hai, phir session track karta hai. <b>Proxy</b> TLS session terminate karta hai (agar configured ho) aur request inspect karta hai. <b>NGFW</b> application ko file-sharing service pehchaanta hai, dekhta hai ki user Finance ka hai, destination ko "newly seen domain" feed mein paata hai, aur data-protection rule ke under upload block kar deta hai.</p></div>

<table class="cmp"><tr><th>Type</th><th>Taakat</th><th>Kamzori</th></tr>
<tr><td>Packet filter</td><td>Bahut tez, har router par</td><td>State nahi; return traffic haath se kholna padta hai</td></tr>
<tr><td>Stateful</td><td>Replies automatic, bina bulaya traffic drop</td><td>Port ke andar ki application nahi dikhti</td></tr>
<tr><td>Proxy</td><td>Poora protocol inspection</td><td>Slow, har application ke liye alag</td></tr>
<tr><td>NGFW</td><td>App, user, content aur threat ke hisaab se policy</td><td>Licences, tuning aur zyada CPU chahiye</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki NGFW khareed liya to woh "on" hai. Application control, IPS, URL aur malware inspection policies aur licences hain jo aapko enable aur tune karne padte hain. Sirf allow-any access rule wala NGFW bade price tag wala stateful firewall hi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>established</code> keyword ACL ko stateful nahi banata; yeh sirf ACK aur RST flags check karta hai. Aur "kaunsa device ek social network allow karke usi port par uske games block kar sakta hai" ka jawab hamesha <b>NGFW</b> hai, kyunki sirf wahi applications pehchaanta hai.</p></div>

<div class="scn"><h4>Port 443 web pages se zyada le ja raha tha</h4><p>Stateful firewall wali ek enterprise ne sabke liye outbound TCP 80 aur 443 allow kar rakha tha. Ek mahine mein internet bandwidth double ho gayi. Firewall ki connection table sirf "TCP 443" dikhati thi, jisse team ko kuch pata nahi chala. Application visibility wale NGFW par migrate karne ke baad, dashboard ne 443 par chalta ek peer-to-peer file-sharing tool aur ek remote-access application dikhaya. Team ne dono ko port se nahi, application se block kiya, aur bandwidth wapas gir gayi.</p><p><b>Seekh:</b> ports ek darwaze ka varnan karte hain, usmein se kaun guzar raha hai uska nahi.</p></div>

<div class="iv"><p class="q">"Firewall ko next-generation kya banata hai?"</p><p>NGFW ab bhi stateful hai, lekin woh port se independent application identification, user identity, integrated IPS, URL aur reputation filtering, file aur malware inspection, aur optional TLS decryption jodta hai, aur policy in sabko ek saath use kar sakti hai. Ek Cisco example ka naam lo (Management Center se managed Secure Firewall Threat Defense) aur ek wajah ki yeh kyun matter karta hai: port 443 share karne wali applications ko control karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet filters har packet ko akele judge karte hain; unhe sessions yaad nahi rehte.</li>
<li><code>established</code> sirf flags check karta hai aur UDP ya ICMP ke liye kuch nahi karta.</li>
<li>Stateful firewalls sessions ko connection table mein track karte hain lekin port number par bharosa karte hain.</li>
<li>Proxies terminate karke inspect karte hain; WAFs web applications bachane mein specialist hain.</li>
<li>NGFWs stateful inspection mein application, user, IPS, URL, file aur decryption jodte hain.</li>
</ul></div>
`}};export{e as default};