var e={id:`appid`,h:{en:`Application control with AppID: protocols, clients, web applications`,hi:`AppID ke saath application control: protocols, clients, web applications`},body:{en:`
<p>A shopping mall has one main door. A guard who only checks "which door did you use?" cannot tell a delivery driver from a pickpocket, because everyone uses the same door. A good guard looks at the person: the uniform, the trolley, the way they behave. Ports are the doors of the network, and today nearly everything walks through door 443. <b>Application Visibility and Control (AVC)</b>, powered by the Snort <b>AppID</b> inspector, looks at the traffic itself and says "this is YouTube", "this is SSH on port 8022", "this is a BitTorrent client hiding on port 80". Then your rules can talk in applications instead of guessing ports.</p>

<h3>The three things AppID identifies</h3>
<dl class="terms">
<dt>Application protocol</dt><dd>The protocol between hosts: HTTP, HTTPS (TLS), SSH, DNS, SMB, RDP, SMTP and so on, regardless of the port number.</dd>
<dt>Client</dt><dd>The software on the initiating host: a browser, <code>curl</code>, an email client, a messaging app.</dd>
<dt>Web application</dt><dd>The service inside HTTP or HTTPS: Facebook, YouTube, Gmail, a file-sharing site.</dd>
</dl>
<p>Each application carries <b>attributes</b> you can match without naming apps one by one: <b>risk</b> (Very Low to Very High), <b>business relevance</b> (Very Low to Very High), <b>type</b>, <b>categories</b> (social networking, streaming, file sharing) and <b>tags</b> (for example "bandwidth intensive" or "encrypts communications"). An <b>application filter</b> object saves such a combination, for instance "risk High or Very High AND business relevance Low or Very Low".</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="How AppID identifies an application">
<rect x="20" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="105" y="54" text-anchor="middle" class="svg-ink" font-size="13">Packets 1-3</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="12">TCP handshake</text>
<rect x="235" y="30" width="170" height="54" rx="8" fill="#fde68a"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">Packets 4-6</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">TLS hello / HTTP GET</text>
<rect x="450" y="30" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="13">App known</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="12">rule decides</text>
<line x1="190" y1="57" x2="235" y2="57" stroke="#64748b" stroke-width="2"/><line x1="405" y1="57" x2="450" y2="57" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="110" y="156" text-anchor="middle" class="svg-ink" font-size="13">Application protocol</text><text x="110" y="178" text-anchor="middle" class="svg-muted" font-size="12">HTTPS</text>
<rect x="230" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Chrome</text>
<rect x="440" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="530" y="156" text-anchor="middle" class="svg-ink" font-size="13">Web application</text><text x="530" y="178" text-anchor="middle" class="svg-muted" font-size="12">YouTube (SNI, cert)</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">Until the app is known, the first packets pass and the rule match is pending</text>
</svg><p class="cap">AppID needs a few packets; then the protocol, client and web application are known and the rule can match.</p></div>

<h3>Why it matters</h3>
<p>Port rules leak. Allowing TCP 443 allows every cloud app, every tunnel tool and every piece of malware that speaks TLS. Blocking a port also blocks good traffic that shares it. Application rules let you write the real business policy: "allow the ERP portal, block personal file sharing, allow SSH only from ADMIN". They also give visibility: the Application Statistics dashboard shows which high-risk apps your users run before you block anything.</p>

<h3>How AppID decides on encrypted traffic</h3>
<p>Without decryption, AppID still sees the TLS <b>ClientHello</b>, including the <b>Server Name Indication (SNI)</b>, and the server certificate in TLS 1.2. That is enough to recognise most big web applications. With TLS 1.3 the certificate is encrypted, so Threat Defense can use <b>TLS server identity discovery</b> (Advanced settings of the access control policy) to learn the server identity before the rule is decided. What AppID cannot see without decryption is what happens inside: the page path, the upload, the file.</p>

<h3>Lab walkthrough: application control for the office</h3>
<pre class="code"><span class="c">! Policies &gt; Access Control &gt; NK-ACP &gt; Add Rule</span>
Name:          Block-Social
Action:        Block with reset
Zones:         Source INSIDE  -&gt;  Destination OUTSIDE
Applications:  Facebook, YouTube
Logging:       Log at Beginning of Connection
<span class="c">! Move the rule ABOVE Inside-Out (first match wins)</span>
Deploy</pre>

<pre class="out">PC1&gt; curl www.facebook.com
<span class="hl">curl: (56) Recv failure: Connection reset by peer</span>
PC1&gt; curl erp.partner.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;Partner ERP portal&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

&gt; system support trace
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 Packet: TCP, SYN
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 URL: www.facebook.com category Social Networking, reputation Trusted
<span class="hl">10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 AppID: service Facebook</span>
<span class="hl">10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 Firewall: block rule, 'Block-Social', block</span>
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 ===&gt; Blocked by Firewall</pre>

<p>Block with reset makes the browser fail immediately instead of hanging until a timeout, which users experience as "the site is blocked" rather than "the internet is slow".</p>

<div class="eg"><p><b>Worked example: SSH on a strange port.</b> A developer runs SSH to a cloud host on TCP 8022 to dodge the port-22 rule. A port rule for 22 never sees it. An access control rule "Applications: SSH, Source Networks: not ADMIN, action Block" stops it on any port, because AppID identifies the SSH banner. ADMIN (10.0.1.50) keeps SSH through an Allow rule placed above.</p></div>

<div class="warn"><p><b>Common mistake.</b> Placing an application rule <b>below</b> a broad Allow such as Inside-Out. The broad rule matches first on zones and ports, so the application rule is never reached. Also, writing a Block rule with an application <i>and</i> a port the app does not use: all conditions must match.</p></div>

<div class="exam"><p><b>Exam trap.</b> Because AppID needs several packets, the first packets of a flow are allowed while the rule match is pending, and the verdict applies once the application is known. A connection event can therefore show a few bytes transferred even for a blocked app. AppID itself needs no extra license; new detectors arrive with the <b>VDB</b> (vulnerability database) updates.</p></div>

<div class="scn"><h4>The video meeting that was "social media"</h4><p>A school blocked the application category "social networking" for students. Next morning teachers could not join video classes: the meeting platform's chat component was tagged social. The engineer opened the connection events, filtered on the block rule, saw the exact web application name, and added an Allow rule for that application above the category block for the TEACHERS user group. Students stayed blocked from social apps.</p><p><b>Lesson:</b> category blocks are broad; check the events and carve narrow exceptions above them.</p></div>

<div class="iv"><p class="q">"How does Threat Defense identify an application, and how is that different from a port?"</p><p>The AppID inspector uses detectors on the traffic content to identify the application protocol, the client and the web application, independent of the port. It needs a few packets, so the rule match is pending until then. For HTTPS without decryption it uses the SNI and, in TLS 1.2, the certificate; TLS 1.3 needs server identity discovery. Mention risk and business relevance attributes, application filters, VDB updates and custom detectors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AppID identifies application protocol, client and web application regardless of port.</li>
<li>Match by name, or by risk, business relevance, category and tags with application filters.</li>
<li>A few packets pass before the app is known; then the rule decides.</li>
<li>HTTPS: SNI and certificate identify apps without decryption; contents stay hidden.</li>
<li>Put specific application rules above broad allow rules; use Block with reset for fast failure.</li>
</ul></div>
`,hi:`
<p>Ek shopping mall ka ek main darwaaza hai. Jo guard sirf check karta hai "aap kis darwaaze se aaye?", woh delivery driver aur jebkatre mein fark nahi kar sakta, kyunki sab ek hi darwaaza use karte hain. Achha guard insaan ko dekhta hai: uniform, trolley, uska behaviour. Ports network ke darwaaze hain, aur aaj lagbhag sab kuch darwaaza 443 se guzarta hai. <b>Application Visibility and Control (AVC)</b>, jo Snort ke <b>AppID</b> inspector se chalta hai, khud traffic ko dekhta hai aur kehta hai "yeh YouTube hai", "yeh port 8022 par SSH hai", "yeh port 80 par chhupa BitTorrent client hai". Phir aapki rules ports ka andaza lagane ki jagah applications ki bhasha mein baat kar sakti hain.</p>

<h3>AppID teen cheezein pehchanta hai</h3>
<dl class="terms">
<dt>Application protocol</dt><dd>Hosts ke beech ka protocol: HTTP, HTTPS (TLS), SSH, DNS, SMB, RDP, SMTP waghera, port number chahe jo ho.</dd>
<dt>Client</dt><dd>Connection shuru karne wale host par software: browser, <code>curl</code>, email client, messaging app.</dd>
<dt>Web application</dt><dd>HTTP ya HTTPS ke andar ki service: Facebook, YouTube, Gmail, file-sharing site.</dd>
</dl>
<p>Har application ke <b>attributes</b> hote hain jinhe aap apps ka naam ek-ek karke liye bina match kar sakte ho: <b>risk</b> (Very Low se Very High), <b>business relevance</b> (Very Low se Very High), <b>type</b>, <b>categories</b> (social networking, streaming, file sharing) aur <b>tags</b> (jaise "bandwidth intensive" ya "encrypts communications"). <b>Application filter</b> object aisa combination save karta hai, jaise "risk High ya Very High AND business relevance Low ya Very Low".</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="AppID application kaise pehchanta hai">
<rect x="20" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="105" y="54" text-anchor="middle" class="svg-ink" font-size="13">Packets 1-3</text><text x="105" y="72" text-anchor="middle" class="svg-muted" font-size="12">TCP handshake</text>
<rect x="235" y="30" width="170" height="54" rx="8" fill="#fde68a"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">Packets 4-6</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">TLS hello / HTTP GET</text>
<rect x="450" y="30" width="170" height="54" rx="8" fill="#bbf7d0"/><text x="535" y="54" text-anchor="middle" class="svg-ink" font-size="13">App pata chala</text><text x="535" y="72" text-anchor="middle" class="svg-muted" font-size="12">rule decide karti hai</text>
<line x1="190" y1="57" x2="235" y2="57" stroke="#64748b" stroke-width="2"/><line x1="405" y1="57" x2="450" y2="57" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="110" y="156" text-anchor="middle" class="svg-ink" font-size="13">Application protocol</text><text x="110" y="178" text-anchor="middle" class="svg-muted" font-size="12">HTTPS</text>
<rect x="230" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="320" y="178" text-anchor="middle" class="svg-muted" font-size="12">Chrome</text>
<rect x="440" y="130" width="180" height="80" rx="10" fill="#ddd6fe"/><text x="530" y="156" text-anchor="middle" class="svg-ink" font-size="13">Web application</text><text x="530" y="178" text-anchor="middle" class="svg-muted" font-size="12">YouTube (SNI, cert)</text>
<text x="320" y="238" text-anchor="middle" class="svg-muted" font-size="12">App pata chalne tak pehle packets jaate hain aur rule match pending rehta hai</text>
</svg><p class="cap">AppID ko kuch packets chahiye; phir protocol, client aur web application pata hote hain aur rule match kar sakti hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Port rules leak karti hain. TCP 443 allow karna har cloud app, har tunnel tool aur TLS bolne wale har malware ko allow karta hai. Port block karna us port ko share karne wala achha traffic bhi block karta hai. Application rules aapko asli business policy likhne deti hain: "ERP portal allow karo, personal file sharing block karo, SSH sirf ADMIN se allow karo". Yeh visibility bhi deti hain: Application Statistics dashboard dikhata hai ki aapke users kaunse high-risk apps chalate hain, kuch bhi block karne se pehle.</p>

<h3>Encrypted traffic par AppID kaise decide karta hai</h3>
<p>Decryption ke bina bhi AppID TLS <b>ClientHello</b> dekhta hai, jisme <b>Server Name Indication (SNI)</b> hota hai, aur TLS 1.2 mein server certificate. Zyada tar badi web applications pehchanne ke liye itna kaafi hai. TLS 1.3 mein certificate encrypted hota hai, isliye Threat Defense rule decide hone se pehle server identity jaanne ke liye <b>TLS server identity discovery</b> (access control policy ki Advanced settings) use kar sakta hai. Decryption ke bina AppID andar kya ho raha hai woh nahi dekh sakta: page path, upload, file.</p>

<h3>Lab walkthrough: office ke liye application control</h3>
<pre class="code"><span class="c">! Policies &gt; Access Control &gt; NK-ACP &gt; Add Rule</span>
Name:          Block-Social
Action:        Block with reset
Zones:         Source INSIDE  -&gt;  Destination OUTSIDE
Applications:  Facebook, YouTube
Logging:       Log at Beginning of Connection
<span class="c">! Rule ko Inside-Out ke UPAR le jao (pehli match jeetti hai)</span>
Deploy</pre>

<pre class="out">PC1&gt; curl www.facebook.com
<span class="hl">curl: (56) Recv failure: Connection reset by peer</span>
PC1&gt; curl erp.partner.example
&lt;html&gt;&lt;body&gt;&lt;h1&gt;Partner ERP portal&lt;/h1&gt;&lt;p&gt;NK web service is running.&lt;/p&gt;&lt;/body&gt;&lt;/html&gt;

&gt; system support trace
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 Packet: TCP, SYN
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 URL: www.facebook.com category Social Networking, reputation Trusted
<span class="hl">10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 AppID: service Facebook</span>
<span class="hl">10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 Firewall: block rule, 'Block-Social', block</span>
10.0.1.10-40112 &gt; 8.8.8.8-80 6 AS 1-1 I 0 ===&gt; Blocked by Firewall</pre>

<p>Block with reset browser ko timeout tak latakne ki jagah turant fail karta hai, jise users "site blocked hai" ki tarah mehsoos karte hain, "internet slow hai" ki tarah nahi.</p>

<div class="eg"><p><b>Worked example: ajeeb port par SSH.</b> Ek developer port-22 rule se bachne ke liye TCP 8022 par cloud host tak SSH chalata hai. Port 22 ki rule ise kabhi nahi dekhti. Access control rule "Applications: SSH, Source Networks: ADMIN nahi, action Block" ise kisi bhi port par rok deti hai, kyunki AppID SSH banner pehchanta hai. ADMIN (10.0.1.50) upar rakhi Allow rule se SSH rakhta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Application rule ko Inside-Out jaisi broad Allow ke <b>neeche</b> rakhna. Broad rule zones aur ports par pehle match ho jaati hai, isliye application rule tak kabhi pahuncha hi nahi jaata. Aur aisi Block rule likhna jisme application <i>aur</i> ek aisa port ho jo app use hi nahi karta: saari conditions match honi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kyunki AppID ko kai packets chahiye, rule match pending rehte hue flow ke pehle packets allow hote hain, aur application pata chalne par verdict lagta hai. Isliye blocked app ke liye bhi connection event mein kuch bytes transfer dikh sakte hain. AppID ko khud extra license nahi chahiye; naye detectors <b>VDB</b> (vulnerability database) updates ke saath aate hain.</p></div>

<div class="scn"><h4>Video meeting jo "social media" nikli</h4><p>Ek school ne students ke liye application category "social networking" block ki. Agli subah teachers video classes join nahi kar paaye: meeting platform ka chat component social tagged tha. Engineer ne connection events khole, block rule par filter kiya, exact web application ka naam dekha, aur category block ke upar TEACHERS user group ke liye us application ki Allow rule jodi. Students social apps se blocked rahe.</p><p><b>Lesson:</b> category blocks broad hote hain; events check karo aur unke upar narrow exceptions banao.</p></div>

<div class="iv"><p class="q">"Threat Defense application ko kaise pehchanta hai, aur yeh port se kaise alag hai?"</p><p>AppID inspector traffic content par detectors use karke application protocol, client aur web application pehchanta hai, port se independent. Use kuch packets chahiye, isliye tab tak rule match pending rehta hai. Decryption ke bina HTTPS ke liye yeh SNI aur TLS 1.2 mein certificate use karta hai; TLS 1.3 ko server identity discovery chahiye. Risk aur business relevance attributes, application filters, VDB updates aur custom detectors batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AppID port se independent application protocol, client aur web application pehchanta hai.</li>
<li>Naam se match karo, ya application filters se risk, business relevance, category aur tags se.</li>
<li>App pata chalne se pehle kuch packets jaate hain; phir rule decide karti hai.</li>
<li>HTTPS: SNI aur certificate bina decryption apps pehchante hain; contents chhupe rehte hain.</li>
<li>Specific application rules ko broad allow rules ke upar rakho; jaldi failure ke liye Block with reset use karo.</li>
</ul></div>
`}};export{e as default};