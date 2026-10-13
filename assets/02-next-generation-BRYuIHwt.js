var e={id:`next-generation`,h:{en:`What makes a firewall next-generation`,hi:`Firewall ko next-generation kya banata hai`},body:{en:`
<p><b>Start from what you know.</b> In CCNA you met the ACL: permit or deny by source, destination, protocol and port. A <b>stateful firewall</b> improves on a plain ACL by remembering connections. When an inside host opens a connection, the firewall records it in a <b>session table</b> and automatically allows the reply, so you do not write a rule for the return traffic. That was a big step in the 1990s. Today it is the minimum.</p>

<h3>The gap stateful firewalls left</h3>
<p>Modern applications do not stay on their own ports. Web mail, video calls, file sharing, remote-access tools and software updates all run over TCP 443 or 80. A stateful firewall that sees "TCP 443" cannot tell a payroll web application from a tool that copies files to a personal account. Applications also change ports on purpose, which is why "block port X" no longer blocks a thing. Meanwhile attackers hide malware inside allowed web traffic, and IP addresses stopped identifying people because users roam between Wi-Fi, VPN and mobile.</p>

<h3>The three "-ID" technologies</h3>
<p>Palo Alto Networks defines a next-generation firewall by what it can identify and control. These are the names you must know for the exam:</p>
<dl class="terms">
<dt>App-ID</dt><dd>Identifies the <b>application</b> from the traffic itself using signatures, protocol decoders and heuristics, on any port, even when the application is wrapped in TLS (with decryption, deeper). Policy then says "allow ssh" or "block file-sharing", not "allow TCP 22".</dd>
<dt>User-ID</dt><dd>Maps an IP address to a <b>user name and group</b>, for example from directory login events. Policy can say "the finance group may use this application".</dd>
<dt>Content-ID</dt><dd>Inspects the <b>content</b> of allowed traffic: threat prevention (vulnerability exploits, malware, command-and-control), URL filtering, file blocking, data filtering and WildFire cloud analysis of unknown files.</dd>
</dl>
<p>Newer material also talks about <b>Device-ID</b>, which adds the type of device (laptop, printer, camera) as a policy match. Treat it as an extension of the same idea: more context, better decisions.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Single-pass processing">
<rect x="10" y="60" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text>
<rect x="125" y="40" width="130" height="100" rx="8" fill="#bae6fd"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">Session and</text><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">zone lookup</text><text x="190" y="110" text-anchor="middle" class="svg-muted" font-size="12">route, NAT, policy</text>
<rect x="280" y="40" width="240" height="100" rx="8" fill="#bbf7d0"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">One pass: identify and scan</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">App-ID  |  User-ID  |  Content-ID</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">decrypt if policy says so</text>
<rect x="545" y="60" width="85" height="60" rx="8" fill="#e2e8f0"/><text x="587" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packet out</text>
<line x1="100" y1="90" x2="125" y2="90" stroke="#64748b" stroke-width="2"/><line x1="255" y1="90" x2="280" y2="90" stroke="#64748b" stroke-width="2"/><line x1="520" y1="90" x2="545" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">The packet is examined once, not once per feature</text>
</svg><p class="cap">Single-pass parallel processing: networking, policy and all content checks happen in one pass over the stream.</p></div>

<h3>Single-pass architecture</h3>
<p>Older "UTM" products bolted features on one after another: firewall, then IPS, then antivirus, each with its own engine and its own scan of the packet. Palo Alto Networks describes a <b>single-pass parallel processing</b> design. The firewall does the networking and policy work once and the content engines scan the same stream together. The practical result for you: turning on more security profiles costs less performance than stacking separate boxes, and you manage everything in one policy.</p>

<div class="eg"><p><b>Worked example.</b> Priya in Finance opens a cloud storage site. The firewall sees TCP 443 to a public address. App-ID names the application. User-ID says the source IP belongs to priya in the Finance group. The rule "Finance may use approved-storage" matches, and a file-blocking profile stops executables from being downloaded. Four facts (zone, application, user, content) decided one session. A port-based rule could only use two of them.</p></div>

<h3>Where it sits in your network</h3>
<p>Most often the firewall is routed between the LAN, an internet link and a DMZ (a Layer 3 deployment, which you will configure in pan-setup). It can also run as a transparent <b>virtual wire</b> or a Layer 2 switch-like device, or as a passive <b>tap</b> that only watches. The deployment modes are the subject of the <b>pan-vlans</b> module.</p>

<div class="warn"><p><b>Common mistake.</b> Believing "next-generation" means "turn everything on". Features such as URL filtering, threat prevention and decryption are separate profiles that you attach to rules. A rule with no profile is just a smarter stateful rule. You will meet profiles in the pan-profiles module.</p></div>
<div class="exam"><p><b>Exam trap.</b> App-ID identifies the application, User-ID the user, Content-ID the threats and content. Candidates mix them up under pressure. Also remember that the <b>port</b> in a rule is only a check that the application is on its expected port when you use <code>application-default</code>.</p></div>

<div class="scn"><h4>Port 8080 is not a web server</h4><p>An engineer wrote "allow TCP 8080 outbound" for a developer tool. Weeks later the log showed a remote-access application using the same port to reach the internet. With an application-based rule ("allow the specific developer tool, application-default"), the remote-access application would have been denied even on the allowed port.</p><p><b>Lesson:</b> name the application you want, then let the port follow.</p></div>

<div class="iv"><p class="q">"How is App-ID different from just matching a port number?"</p><p>App-ID classifies traffic by what it is, using signatures, decoders and heuristics, regardless of port or evasive tunnelling, so policy can allow or block the application itself. A port number says only where traffic goes, not what it carries. Add that App-ID can re-classify a session as more data arrives, and that decryption improves visibility into TLS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A stateful firewall tracks sessions; a NGFW also knows application, user and content.</li>
<li>App-ID = application, User-ID = user and group, Content-ID = threats, URLs, files.</li>
<li>Single-pass processing examines traffic once for networking and content together.</li>
<li>Security profiles are attached to rules; they are not automatic.</li>
<li>Deployment modes (Layer 3, virtual wire, Layer 2, tap) come later in pan-vlans.</li>
</ul></div>
`,hi:`
<p><b>Jo aap jaante ho wahan se shuru karo.</b> CCNA mein aap ACL se mile: source, destination, protocol aur port ke hisaab se permit ya deny. <b>Stateful firewall</b> plain ACL se behtar hai kyunki woh connections yaad rakhta hai. Jab inside host connection kholta hai to firewall use <b>session table</b> mein record karta hai aur reply apne-aap allow kar deta hai, isliye return traffic ka rule nahi likhna padta. 1990s mein yeh bada kadam tha. Aaj yeh minimum hai.</p>

<h3>Stateful firewalls ne jo gap chhoda</h3>
<p>Modern applications apne port par nahi rehti. Web mail, video calls, file sharing, remote-access tools aur software updates sab TCP 443 ya 80 par chalte hain. Stateful firewall "TCP 443" dekhkar payroll web application aur personal account mein files copy karne wale tool mein fark nahi kar sakta. Applications jaanbujhkar port badalti bhi hain, isliye "port X block karo" ab kuch block nahi karta. Udhar attackers malware ko allowed web traffic ke andar chhupate hain, aur IP address ab logon ko identify nahi karte kyunki users Wi-Fi, VPN aur mobile ke beech ghoomte hain.</p>

<h3>Teen "-ID" technologies</h3>
<p>Palo Alto Networks next-generation firewall ko is baat se define karta hai ki woh kya identify aur control kar sakta hai. Exam ke liye yeh naam yaad rakhne hain:</p>
<dl class="terms">
<dt>App-ID</dt><dd>Traffic se hi <b>application</b> pehchanta hai: signatures, protocol decoders aur heuristics se, kisi bhi port par, TLS mein lipti application ko bhi (decryption ke saath aur gehra). Phir policy kehti hai "ssh allow karo" ya "file-sharing block karo", "TCP 22 allow karo" nahi.</dd>
<dt>User-ID</dt><dd>IP address ko <b>user name aur group</b> se map karta hai, jaise directory login events se. Policy kah sakti hai "finance group yeh application use kar sakta hai".</dd>
<dt>Content-ID</dt><dd>Allowed traffic ka <b>content</b> inspect karta hai: threat prevention (vulnerability exploits, malware, command-and-control), URL filtering, file blocking, data filtering aur unknown files ka WildFire cloud analysis.</dd>
</dl>
<p>Naye material mein <b>Device-ID</b> ka bhi zikr hota hai, jo device ka type (laptop, printer, camera) policy match mein jodta hai. Ise usi idea ka extension samjho: zyada context, behtar decisions.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Single-pass processing">
<rect x="10" y="60" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packet in</text>
<rect x="125" y="40" width="130" height="100" rx="8" fill="#bae6fd"/><text x="190" y="68" text-anchor="middle" class="svg-ink" font-size="13">Session aur</text><text x="190" y="86" text-anchor="middle" class="svg-ink" font-size="13">zone lookup</text><text x="190" y="110" text-anchor="middle" class="svg-muted" font-size="12">route, NAT, policy</text>
<rect x="280" y="40" width="240" height="100" rx="8" fill="#bbf7d0"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">Ek pass: pehchano aur scan karo</text><text x="400" y="86" text-anchor="middle" class="svg-muted" font-size="12">App-ID  |  User-ID  |  Content-ID</text><text x="400" y="110" text-anchor="middle" class="svg-muted" font-size="12">policy kahe to decrypt</text>
<rect x="545" y="60" width="85" height="60" rx="8" fill="#e2e8f0"/><text x="587" y="95" text-anchor="middle" class="svg-ink" font-size="13">Packet out</text>
<line x1="100" y1="90" x2="125" y2="90" stroke="#64748b" stroke-width="2"/><line x1="255" y1="90" x2="280" y2="90" stroke="#64748b" stroke-width="2"/><line x1="520" y1="90" x2="545" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Packet ek hi baar examine hota hai, har feature ke liye alag nahi</text>
</svg><p class="cap">Single-pass parallel processing: networking, policy aur saare content checks stream par ek hi pass mein hote hain.</p></div>

<h3>Single-pass architecture</h3>
<p>Purane "UTM" products features ko ek ke baad ek jodte the: firewall, phir IPS, phir antivirus, har ek ka apna engine aur packet ka apna scan. Palo Alto Networks <b>single-pass parallel processing</b> design batata hai. Firewall networking aur policy ka kaam ek baar karta hai aur content engines usi stream ko saath mein scan karte hain. Aapke liye practical matlab: zyada security profiles on karne par performance cost alag-alag boxes stack karne se kam aata hai, aur aap sab kuch ek hi policy mein manage karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Finance mein Priya cloud storage site kholti hai. Firewall ko public address ke liye TCP 443 dikhta hai. App-ID application ka naam batata hai. User-ID kehta hai source IP finance group ki priya ka hai. Rule "Finance approved-storage use kar sakta hai" match hota hai, aur file-blocking profile executables download hone se rokta hai. Chaar facts (zone, application, user, content) ne ek session ka decision liya. Port-based rule sirf do use kar sakta tha.</p></div>

<h3>Aapke network mein yeh kahan baithta hai</h3>
<p>Sabse aam taur par firewall LAN, internet link aur DMZ ke beech routed hota hai (Layer 3 deployment, jise aap pan-setup mein configure karoge). Yeh transparent <b>virtual wire</b> ya Layer 2 switch jaise device ki tarah bhi chal sakta hai, ya passive <b>tap</b> ki tarah jo sirf dekhta hai. Deployment modes <b>pan-vlans</b> module ka vishay hain.</p>

<div class="warn"><p><b>Common mistake.</b> Maan lena ki "next-generation" ka matlab "sab kuch on karo". URL filtering, threat prevention aur decryption alag profiles hain jo aap rules se attach karte ho. Bina profile ka rule bas ek smarter stateful rule hai. Profiles se aap pan-profiles module mein milenge.</p></div>
<div class="exam"><p><b>Exam trap.</b> App-ID application pehchanta hai, User-ID user, Content-ID threats aur content. Pressure mein candidates inhe mix kar dete hain. Yeh bhi yaad rakho ki rule mein <b>port</b> sirf ek check hai ki application apne expected port par hai, jab aap <code>application-default</code> use karte ho.</p></div>

<div class="scn"><h4>Port 8080 web server nahi hai</h4><p>Ek engineer ne developer tool ke liye "allow TCP 8080 outbound" likha. Hafton baad log mein dikha ki ek remote-access application usi port se internet pahunch rahi thi. Application-based rule ("specific developer tool allow karo, application-default") hota to remote-access application allowed port par bhi deny ho jaati.</p><p><b>Lesson:</b> jo application chahiye uska naam likho, port apne-aap follow karega.</p></div>

<div class="iv"><p class="q">"App-ID sirf port number match karne se kaise alag hai?"</p><p>App-ID traffic ko uske asli roop se classify karta hai, signatures, decoders aur heuristics se, port ya evasive tunnelling se independent, taaki policy application ko hi allow ya block kar sake. Port number sirf batata hai traffic kahan ja raha hai, kya le jaa raha hai nahi. Yeh bhi jodo ki jaise-jaise zyada data aata hai App-ID session ko re-classify kar sakta hai, aur decryption se TLS ki visibility badhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stateful firewall sessions track karta hai; NGFW application, user aur content bhi jaanta hai.</li>
<li>App-ID = application, User-ID = user aur group, Content-ID = threats, URLs, files.</li>
<li>Single-pass processing traffic ko networking aur content ke liye ek hi baar examine karta hai.</li>
<li>Security profiles rules se attach hote hain; yeh automatic nahi hain.</li>
<li>Deployment modes (Layer 3, virtual wire, Layer 2, tap) pan-vlans mein aate hain.</li>
</ul></div>
`}};export{e as default};