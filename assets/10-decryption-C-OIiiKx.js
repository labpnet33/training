var e={id:`decryption`,h:{en:`Decryption policy: resign, known key, do-not-decrypt and privacy`,hi:`Decryption policy: resign, known key, do-not-decrypt aur privacy`},body:{en:`
<p>A company mailroom receives sealed envelopes. If every letter stays sealed, a letter bomb walks straight to someone's desk. So the company tells employees: "business post addressed to the office is opened by the mailroom, checked, and resealed with the company seal". Employees accept that seal because they know and trust it. Some letters are never opened: a doctor's letter, a bank statement, a lawyer's mail. TLS is the sealed envelope of the internet. Without decryption, Snort sees only the address on the envelope. The <b>decryption policy</b> decides which envelopes are opened, how they are resealed, and which ones must stay private.</p>

<h3>What you can and cannot see without decryption</h3>
<table class="cmp"><tr><th>Visible in TLS</th><th>Hidden inside TLS</th></tr>
<tr><td>IP addresses, ports, timing, volume</td><td>URL path and query string</td></tr>
<tr><td>Server name (SNI) in the ClientHello</td><td>HTTP headers, cookies, user agent</td></tr>
<tr><td>Server certificate (TLS 1.2 only)</td><td>The request body: an injection, a beacon</td></tr>
<tr><td>Application from SNI and certificate</td><td>Downloaded and uploaded files</td></tr></table>
<p>So Security Intelligence, AppID and URL category keep working, while intrusion rules that look inside requests and file policies are blind.</p>

<h3>Decryption rule actions</h3>
<dl class="terms">
<dt>Decrypt - Resign</dt><dd>For <b>outbound</b> traffic to servers you do not own. Threat Defense becomes a proxy: it completes TLS with the real server, then presents the client a copy of the server certificate re-signed by an <b>internal CA</b> on the firewall. Clients must trust that CA certificate, usually pushed by group policy or mobile device management; otherwise browsers show certificate errors.</dd>
<dt>Decrypt - Known Key</dt><dd>For <b>inbound</b> traffic to your own servers. You import the server's certificate and private key as an internal certificate object, so the firewall can decrypt without presenting a different certificate.</dd>
<dt>Do not decrypt</dt><dd>Pass the session encrypted; Snort still sees the TLS metadata.</dd>
<dt>Block / Block with reset</dt><dd>Stop the TLS session, for example for revoked or self-signed certificates or weak protocol versions.</dd>
<dt>Monitor</dt><dd>Log a match and continue with the next decryption rule.</dd>
</dl>
<p>Rules match zones, networks, ports, applications, <b>URL categories</b>, certificate details (distinguished names, status such as expired, self-signed or revoked), cipher suites and TLS versions. The policy also has a <b>default action</b> and <b>undecryptable actions</b> for sessions it cannot handle (compressed sessions, SSLv2, unknown or unsupported cipher suites, handshake or decryption errors). From 7.4 the Management Center calls it the <b>Decryption policy</b>; older releases called it the SSL policy. It is selected in the access control policy.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Decrypt resign proxy">
<rect x="20" y="90" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="116" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="134" text-anchor="middle" class="svg-muted" font-size="12">trusts NK CA</text>
<rect x="250" y="70" width="140" height="100" rx="10" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">decrypt, inspect,</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">re-encrypt</text>
<rect x="510" y="90" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="116" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><text x="565" y="134" text-anchor="middle" class="svg-muted" font-size="12">real cert</text>
<line x1="130" y1="120" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><text x="190" y="110" text-anchor="middle" class="svg-accent" font-size="12">TLS 1</text><text x="190" y="142" text-anchor="middle" class="svg-muted" font-size="12">resigned cert</text>
<line x1="390" y1="120" x2="510" y2="120" stroke="#64748b" stroke-width="2"/><text x="450" y="110" text-anchor="middle" class="svg-accent" font-size="12">TLS 2</text><text x="450" y="142" text-anchor="middle" class="svg-muted" font-size="12">real cert</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Between the two sessions Snort sees cleartext: intrusion and file policies work</text>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Known Key (inbound): one session, firewall holds your server's key</text>
</svg><p class="cap">Decrypt - Resign splits one TLS connection into two, with inspection in the middle.</p></div>

<h3>Privacy, law and what never to decrypt</h3>
<p>Decryption exposes personal data: passwords, medical questions, bank details. Before enabling it, get HR and legal approval, tell users (login banner, policy), and decide what stays private. Typical <b>do-not-decrypt</b> categories are <b>Financial Services</b> and <b>Health and Medicine</b>. Also exempt applications that use <b>certificate pinning</b> (many mobile apps and software updaters) because they reject any resigned certificate, and traffic for which the law in your country forbids inspection. Decryption is also expensive: it can cut the device's throughput substantially, so decrypt what is risky rather than everything.</p>

<h3>Lab walkthrough: the beacon nobody saw</h3>
<pre class="code"><span class="c">! The red team beacon over HTTPS passes today</span>
PC1&gt; curl h&#116;tps://cdn-stats.example/nk-sim/beacon
<span class="c">! Policies &gt; Decryption &gt; enable &gt; Add Rule</span>
Name:      Decrypt-Uncategorized
Category:  Uncategorized
Action:    Decrypt - Resign   (CA: NK internal CA, trusted by PC1)
Default action: Do not decrypt
Deploy</pre>
<pre class="out"><span class="c">! before</span>
Connection Event: Allow  Rule: Inside-Out  URL: cdn-stats.example  <span class="hl">SSL Status: Do not decrypt</span>

<span class="c">! after</span>
PC1&gt; curl h&#116;tps://cdn-stats.example/nk-sim/beacon
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>

Connection Event: Block  Reason: Intrusion Block  <span class="hl">SSL Status: Decrypt (Resign)</span>
Intrusion Event: Dropped  1:58003  MALWARE-CNC outbound beacon from infected host (nk-sim)

&gt; system support firewall-engine-debug
10.0.1.10-40220 &gt; 8.8.8.8-443 6 AS 1-1 I 0 <span class="hl">SSL policy: Decrypt - Resign</span>
10.0.1.10-40220 &gt; 8.8.8.8-443 6 AS 1-1 I 0 match rule order 1, 'Inside-Out', action Allow</pre>
<p>Before decryption the connection event shows only the host name: there was nothing for SID 58003 to match. After the Decrypt-Uncategorized rule, Snort sees the path <code>/nk-sim/beacon</code> and drops it. A normal HTTPS site such as news.example is in category News and Media, falls to the default action and is not decrypted.</p>

<div class="eg"><p><b>Worked example: a selective policy.</b> NK's decryption policy has four rules. 1: Financial Services, Health and Medicine: Do not decrypt. 2: Certificate status revoked or self-signed: Block with reset. 3: Uncategorized, Questionable reputation and file-sharing categories: Decrypt - Resign. 4: Destination WEB (10.0.2.10) inbound: Decrypt - Known Key with the portal's certificate and key. Default action: Do not decrypt. Roughly 15 percent of web traffic is decrypted, covering most of the risk.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling Decrypt - Resign before the internal CA is trusted by clients. Every decrypted site breaks with certificate warnings, users learn to click through warnings, and the project is rolled back. Push the CA first, test on a pilot group, then widen.</p></div>

<div class="exam"><p><b>Exam trap.</b> Resign is for outbound traffic to servers you do not control; Known Key is for inbound traffic to servers whose private key you hold. Without decryption, URL category and AppID still work from the SNI and certificate, but intrusion rules on the payload and file policies do not.</p></div>

<div class="scn"><h4>The banking app that stopped working</h4><p>An insurer enabled Decrypt - Resign for all categories on a Friday. On Monday, the mobile banking app on corporate phones failed, and so did the antivirus updater. Both pinned their certificates and rejected the resigned ones. Connection events showed the sessions with SSL status Decrypt (Resign) followed by resets from the client. The team added Financial Services to a do-not-decrypt rule, added the updater's server names to another, and limited decryption to risky categories.</p><p><b>Lesson:</b> decrypt selectively and exempt pinned applications and privacy categories.</p></div>

<div class="iv"><p class="q">"Why does an intrusion policy miss attacks over HTTPS, and how do you fix it safely?"</p><p>Without decryption Snort only sees the TLS metadata: SNI, certificate and sizes. The request path, body and files are encrypted, so payload rules and file policies cannot match. Fix it with a decryption policy: Decrypt - Resign for chosen outbound categories with an internal CA the clients trust, Decrypt - Known Key for your own inbound servers, and do-not-decrypt rules for finance, health and pinned applications. Mention undecryptable actions, the CPU cost, and legal and HR approval.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Without decryption: SNI, certificate and metadata only; payload and files are invisible.</li>
<li>Decrypt - Resign (outbound, internal CA trusted by clients); Decrypt - Known Key (inbound, your server's key).</li>
<li>Do not decrypt finance, health, pinned apps and anything the law protects.</li>
<li>The policy has a default action and undecryptable actions; it is selected in the access control policy.</li>
<li>Decrypt selectively: it costs CPU and touches privacy.</li>
</ul></div>
`,hi:`
<p>Company ka mailroom sealed envelopes leta hai. Agar har letter sealed rahe, to letter bomb seedha kisi ki desk tak pahunch jaata hai. Isliye company employees ko batati hai: "office ke address wali business post mailroom kholta hai, check karta hai, aur company seal se dobara seal karta hai". Employees woh seal accept karte hain kyunki woh use jaante aur bharosa karte hain. Kuch letters kabhi nahi khulte: doctor ka letter, bank statement, wakeel ki mail. TLS internet ka sealed envelope hai. Decryption ke bina Snort sirf envelope par likha address dekhta hai. <b>Decryption policy</b> decide karti hai kaunse envelopes khulenge, kaise dobara seal honge, aur kaunse private rehne chahiye.</p>

<h3>Decryption ke bina aap kya dekh sakte ho aur kya nahi</h3>
<table class="cmp"><tr><th>TLS mein dikhta hai</th><th>TLS ke andar chhupa</th></tr>
<tr><td>IP addresses, ports, timing, volume</td><td>URL path aur query string</td></tr>
<tr><td>ClientHello mein server name (SNI)</td><td>HTTP headers, cookies, user agent</td></tr>
<tr><td>Server certificate (sirf TLS 1.2)</td><td>Request body: injection, beacon</td></tr>
<tr><td>SNI aur certificate se application</td><td>Download aur upload hui files</td></tr></table>
<p>Isliye Security Intelligence, AppID aur URL category kaam karte rehte hain, jabki requests ke andar dekhne wali intrusion rules aur file policies andhi ho jaati hain.</p>

<h3>Decryption rule actions</h3>
<dl class="terms">
<dt>Decrypt - Resign</dt><dd>Un servers ke liye <b>outbound</b> traffic jo aapke nahi hain. Threat Defense proxy ban jaata hai: asli server ke saath TLS poora karta hai, phir client ko server certificate ki copy dikhata hai jo firewall par ek <b>internal CA</b> ne dobara sign ki hai. Clients ko woh CA certificate trust karna hota hai, aam taur par group policy ya mobile device management se push kiya jaata hai; warna browsers certificate errors dikhate hain.</dd>
<dt>Decrypt - Known Key</dt><dd>Aapke apne servers ke liye <b>inbound</b> traffic. Aap server ka certificate aur private key internal certificate object ki tarah import karte ho, taaki firewall alag certificate dikhaye bina decrypt kar sake.</dd>
<dt>Do not decrypt</dt><dd>Session encrypted hi jaane do; Snort phir bhi TLS metadata dekhta hai.</dd>
<dt>Block / Block with reset</dt><dd>TLS session roko, jaise revoked ya self-signed certificates ya kamzor protocol versions ke liye.</dd>
<dt>Monitor</dt><dd>Match log karo aur agli decryption rule par jaao.</dd>
</dl>
<p>Rules zones, networks, ports, applications, <b>URL categories</b>, certificate details (distinguished names, status jaise expired, self-signed ya revoked), cipher suites aur TLS versions match karti hain. Policy ka ek <b>default action</b> aur un sessions ke liye <b>undecryptable actions</b> bhi hote hain jinhe woh handle nahi kar sakti (compressed sessions, SSLv2, unknown ya unsupported cipher suites, handshake ya decryption errors). 7.4 se Management Center ise <b>Decryption policy</b> kehta hai; purane releases ise SSL policy kehte the. Yeh access control policy mein select hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Decrypt resign proxy">
<rect x="20" y="90" width="110" height="60" rx="8" fill="#bae6fd"/><text x="75" y="116" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="75" y="134" text-anchor="middle" class="svg-muted" font-size="12">NK CA trust karta</text>
<rect x="250" y="70" width="140" height="100" rx="10" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">FTD1</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">decrypt, inspect,</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">re-encrypt</text>
<rect x="510" y="90" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="565" y="116" text-anchor="middle" class="svg-ink" font-size="13">Web server</text><text x="565" y="134" text-anchor="middle" class="svg-muted" font-size="12">asli cert</text>
<line x1="130" y1="120" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><text x="190" y="110" text-anchor="middle" class="svg-accent" font-size="12">TLS 1</text><text x="190" y="142" text-anchor="middle" class="svg-muted" font-size="12">resigned cert</text>
<line x1="390" y1="120" x2="510" y2="120" stroke="#64748b" stroke-width="2"/><text x="450" y="110" text-anchor="middle" class="svg-accent" font-size="12">TLS 2</text><text x="450" y="142" text-anchor="middle" class="svg-muted" font-size="12">asli cert</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Do sessions ke beech Snort cleartext dekhta hai: intrusion aur file policies kaam karti hain</text>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Known Key (inbound): ek session, firewall ke paas aapke server ki key</text>
</svg><p class="cap">Decrypt - Resign ek TLS connection ko do mein baant deta hai, beech mein inspection ke saath.</p></div>

<h3>Privacy, kanoon aur kya kabhi decrypt nahi karna</h3>
<p>Decryption personal data khol deta hai: passwords, medical sawaal, bank details. Ise enable karne se pehle HR aur legal approval lo, users ko batao (login banner, policy), aur decide karo kya private rahega. Aam <b>do-not-decrypt</b> categories <b>Financial Services</b> aur <b>Health and Medicine</b> hain. <b>Certificate pinning</b> use karne wale applications (bahut se mobile apps aur software updaters) ko bhi exempt karo kyunki woh har resigned certificate reject karte hain, aur woh traffic bhi jiska inspection aapke desh ka kanoon mana karta hai. Decryption mehenga bhi hai: yeh device ka throughput kaafi ghata sakta hai, isliye sab kuch nahi, jo risky hai woh decrypt karo.</p>

<h3>Lab walkthrough: woh beacon jo kisi ne nahi dekha</h3>
<pre class="code"><span class="c">! Red team ka HTTPS beacon aaj pass hota hai</span>
PC1&gt; curl h&#116;tps://cdn-stats.example/nk-sim/beacon
<span class="c">! Policies &gt; Decryption &gt; enable &gt; Add Rule</span>
Name:      Decrypt-Uncategorized
Category:  Uncategorized
Action:    Decrypt - Resign   (CA: NK internal CA, PC1 trust karta hai)
Default action: Do not decrypt
Deploy</pre>
<pre class="out"><span class="c">! pehle</span>
Connection Event: Allow  Rule: Inside-Out  URL: cdn-stats.example  <span class="hl">SSL Status: Do not decrypt</span>

<span class="c">! baad mein</span>
PC1&gt; curl h&#116;tps://cdn-stats.example/nk-sim/beacon
<span class="hl">curl: (28) Operation timed out after 5001 milliseconds with 0 bytes received</span>

Connection Event: Block  Reason: Intrusion Block  <span class="hl">SSL Status: Decrypt (Resign)</span>
Intrusion Event: Dropped  1:58003  MALWARE-CNC outbound beacon from infected host (nk-sim)

&gt; system support firewall-engine-debug
10.0.1.10-40220 &gt; 8.8.8.8-443 6 AS 1-1 I 0 <span class="hl">SSL policy: Decrypt - Resign</span>
10.0.1.10-40220 &gt; 8.8.8.8-443 6 AS 1-1 I 0 match rule order 1, 'Inside-Out', action Allow</pre>
<p>Decryption se pehle connection event sirf host name dikhata hai: SID 58003 ke match karne ke liye kuch tha hi nahi. Decrypt-Uncategorized rule ke baad Snort path <code>/nk-sim/beacon</code> dekhta hai aur use drop karta hai. news.example jaisi normal HTTPS site category News and Media mein hai, default action par girti hai aur decrypt nahi hoti.</p>

<div class="eg"><p><b>Worked example: selective policy.</b> NK ki decryption policy mein chaar rules hain. 1: Financial Services, Health and Medicine: Do not decrypt. 2: Certificate status revoked ya self-signed: Block with reset. 3: Uncategorized, Questionable reputation aur file-sharing categories: Decrypt - Resign. 4: Destination WEB (10.0.2.10) inbound: portal ke certificate aur key ke saath Decrypt - Known Key. Default action: Do not decrypt. Lagbhag 15 percent web traffic decrypt hota hai, jo zyada tar risk cover karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Clients ke internal CA trust karne se pehle Decrypt - Resign enable karna. Har decrypted site certificate warnings ke saath tootti hai, users warnings ko click karke aage badhna seekh jaate hain, aur project roll back hota hai. Pehle CA push karo, pilot group par test karo, phir badhao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Resign un servers ke outbound traffic ke liye hai jo aapke control mein nahi; Known Key un servers ke inbound traffic ke liye hai jinki private key aapke paas hai. Decryption ke bina URL category aur AppID SNI aur certificate se kaam karte hain, lekin payload par intrusion rules aur file policies nahi.</p></div>

<div class="scn"><h4>Banking app jo chalna band ho gaya</h4><p>Ek insurer ne shukravaar ko saari categories ke liye Decrypt - Resign enable kiya. Somvaar ko corporate phones par mobile banking app fail hua, aur antivirus updater bhi. Dono apne certificates pin karte the aur resigned wale reject kar dete the. Connection events mein sessions SSL status Decrypt (Resign) ke saath the aur phir client se resets. Team ne Financial Services ko do-not-decrypt rule mein joda, updater ke server names doosre mein jode, aur decryption ko risky categories tak seemit kiya.</p><p><b>Lesson:</b> selectively decrypt karo aur pinned applications aur privacy categories exempt karo.</p></div>

<div class="iv"><p class="q">"Intrusion policy HTTPS par attacks kyun miss karti hai, aur aap ise safely kaise theek karoge?"</p><p>Decryption ke bina Snort sirf TLS metadata dekhta hai: SNI, certificate aur sizes. Request path, body aur files encrypted hain, isliye payload rules aur file policies match nahi kar saktin. Decryption policy se theek karo: chuni hui outbound categories ke liye Decrypt - Resign un clients ke trusted internal CA ke saath, apne inbound servers ke liye Decrypt - Known Key, aur finance, health aur pinned applications ke liye do-not-decrypt rules. Undecryptable actions, CPU cost, aur legal aur HR approval batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decryption ke bina: sirf SNI, certificate aur metadata; payload aur files dikhte nahi.</li>
<li>Decrypt - Resign (outbound, clients ka trusted internal CA); Decrypt - Known Key (inbound, aapke server ki key).</li>
<li>Finance, health, pinned apps aur kanoon se protected cheezein decrypt mat karo.</li>
<li>Policy ka default action aur undecryptable actions hote hain; yeh access control policy mein select hoti hai.</li>
<li>Selectively decrypt karo: yeh CPU leta hai aur privacy ko chhoota hai.</li>
</ul></div>
`}};export{e as default};