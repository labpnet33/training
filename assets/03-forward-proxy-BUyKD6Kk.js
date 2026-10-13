var e={id:`forward-proxy`,h:{en:`SSL Forward Proxy: decrypting traffic from your users to the internet`,hi:`SSL Forward Proxy: aapke users se internet tak ka traffic decrypt karna`},body:{en:`

<p><b>The most common decryption type.</b> SSL Forward Proxy protects your users when they go out to the internet. It is the first thing most teams deploy, and the one with the most operational surprises, so understand how it works before you configure it.</p>

<h3>Analogy: the interpreter who reads the letters</h3>
<p>You write a letter to a foreign company. Your office has an interpreter who takes your letter, reads it, checks it for problems, writes a fresh letter to the company in the company's own sealed envelope, and does the same for the reply. You trust the interpreter (your company chose them). The foreign company sees the interpreter's envelope but the interpreter checks that company's identity for you.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Forward proxy two TLS sessions">
<rect x="15" y="60" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">trusts your CA</text>
<rect x="255" y="45" width="130" height="90" rx="10" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">decrypt, inspect</text>
<rect x="515" y="60" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">real certificate</text>
<line x1="125" y1="90" x2="255" y2="90" stroke="#64748b" stroke-width="3"/><text x="190" y="80" text-anchor="middle" class="svg-accent" font-size="11">TLS session 1</text>
<line x1="385" y1="90" x2="515" y2="90" stroke="#64748b" stroke-width="3"/><text x="450" y="80" text-anchor="middle" class="svg-accent" font-size="11">TLS session 2</text>
<text x="190" y="150" text-anchor="middle" class="svg-muted" font-size="11">forged certificate</text><text x="450" y="150" text-anchor="middle" class="svg-muted" font-size="11">real certificate checked</text>
</svg><p class="cap">Two separate TLS sessions. The client sees a certificate made by the firewall; the firewall checks the real one.</p></div>

<h3>Step by step</h3>
<ol>
<li>The client starts a TLS connection to <code>site.example</code>. The firewall sees the ClientHello and the decryption policy says decrypt.</li>
<li>The firewall opens its own TLS connection to the real server and receives the <b>real server certificate</b>.</li>
<li>The firewall checks the real certificate: signed by a CA on the firewall's trusted list? Name and dates correct? It applies the decryption profile checks (block expired, block untrusted issuer, and so on).</li>
<li>The firewall <b>creates a new certificate</b> for <code>site.example</code> on the fly, copying the name, and signs it with its own key. Which key it uses depends on step 3 (see below).</li>
<li>The firewall presents that certificate to the client and finishes the handshake with the client.</li>
<li>Data now flows through the firewall in clear text inside it: the firewall decrypts from the client, inspects (App-ID, threats, URL, files), and encrypts again towards the server, and the same for replies.</li>
</ol>

<h3>The two signing certificates</h3>
<table class="cmp"><tr><th>Certificate</th><th>Used when</th><th>Client sees</th></tr>
<tr><td>Forward Trust certificate</td><td>The real server certificate is signed by a CA the firewall trusts</td><td>A valid certificate, if the client trusts the firewall CA</td></tr>
<tr><td>Forward Untrust certificate</td><td>The real server certificate is NOT trustworthy (unknown CA, self-signed, expired)</td><td>A deliberate certificate error, because clients must not trust this one</td></tr>
</table>
<p>This design is the heart of the safety of forward proxy. If the firewall always signed with the trusted CA, a bad server's certificate would be "blessed" and the user would never know. The untrusted certificate makes the browser show a warning, so the user's own judgement still protects them. <b>Never</b> install the Forward Untrust CA on clients as trusted.</p>

<h3>What the client must have</h3>
<p>Clients must trust the <b>Forward Trust CA</b> (the root or the issuing CA that signed it). Without that, every decrypted site shows a certificate error. Distribute the CA to managed devices with your normal tools (group policy, MDM). Chapter 4 covers this.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>A decryption rule has the same match fields as a security rule (zones, addresses, users, services, URL categories) plus an action and a type. Verify exact syntax on your PAN-OS release with the question mark in configuration mode. Names are fictional:</p>
<pre class="code"><span class="c">! Decrypt general web traffic from staff, outbound</span>
set rulebase decryption rules DEC-Staff-Out from trust to untrust source any destination any service any category any action decrypt type ssl-forward-proxy profile DP-Forward log-success yes log-fail yes</pre>
<p>The rule needs the certificates (chapter 4) and a decryption profile (chapter 6). Rules are evaluated top to bottom like security rules, so the exceptions (no-decrypt) go above this rule.</p>

<h3>What changes for security policy</h3>
<p>Once a session is decrypted, App-ID can identify the real application inside TLS, and security profiles can scan it. You will see the inner application (for example web-browsing) next to ssl in sessions and logs, and your security rules must allow what you intend. Test with the test command, as in the first chapter, before and after the change. The traffic log marks decrypted sessions so you can filter them.</p>

<div class="eg"><p><b>Worked example.</b> A bank-style phishing page is hosted on a clean-looking hosting site. Without decryption the firewall sees ssl to a trusted category. With forward proxy, the firewall inspects the URL path and the page content, identifies the phishing page through the URL filtering profile, and blocks it. The user sees a block page, which works because the firewall can send the page to the client inside its own TLS session.</p></div>

<h3>Limits to remember</h3>
<ul>
<li><b>Pinned applications</b> and <b>mutual TLS</b> clients fail. Exclude them (chapter 7).</li>
<li>Decryption costs CPU and session capacity. Size the firewall for it.</li>
<li>Some sites use unusual ciphers or versions. The profile can block or bypass unsupported sessions, and the choice is a risk decision.</li>
<li>Non-browser tools (command line, development tools) may not trust the firewall CA and need it installed too.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using the same certificate for trust and untrust, or marking the untrust certificate as trusted on endpoints. That turns off the protection against bad server certificates.</p></div>
<div class="exam"><p><b>Exam trap.</b> Two certificates: Forward Trust (signs for trusted server certificates, must be trusted by clients) and Forward Untrust (signs for untrusted ones, must NOT be trusted by clients). Forward proxy creates two TLS sessions.</p></div>

<div class="scn"><h4>The padlock that turned red for everyone</h4><p>On the first day of a pilot, every user in the pilot group saw certificate errors on every site. The firewall was decrypting correctly, but the Forward Trust CA had not yet been pushed to their laptops. The team distributed the CA through the device management system, and the warnings stopped within the hour. They also learned to roll out the CA before turning on the rule.</p><p><b>Lesson:</b> Distribute the CA first, enable decryption second.</p></div>

<div class="iv"><p class="q">"Explain how SSL Forward Proxy works and why there are two certificates."</p><p>The firewall terminates the client TLS session and opens a second TLS session to the real server. It validates the real certificate, then generates a certificate for the same name signed by its own CA. If the real certificate is trustworthy it signs with the Forward Trust certificate, which clients trust. If not, it signs with the Forward Untrust certificate, which clients do not trust, so the user gets a warning. Then it inspects the clear text and re-encrypts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forward proxy uses two TLS sessions with the firewall in the middle.</li>
<li>Forward Trust certificate signs for good servers and must be trusted by clients.</li>
<li>Forward Untrust certificate signs for bad servers and must not be trusted.</li>
<li>Distribute the CA before enabling the rule; exclude pinned and mutual TLS applications.</li>
<li>Decryption costs CPU; size and pilot first.</li>
</ul></div>

`,hi:`

<p><b>Sabse common decryption type.</b> SSL Forward Proxy aapke users ko tab protect karta hai jab woh internet ki taraf jaate hain. Zyadatar teams yehi pehle deploy karti hain, aur ismein sabse zyada operational surprises hote hain, isliye configure karne se pehle samjho yeh kaise kaam karta hai.</p>

<h3>Analogy: interpreter jo letters padhta hai</h3>
<p>Aap kisi videshi company ko letter likhte ho. Aapke office mein ek interpreter hai jo aapka letter leta hai, padhta hai, problems ke liye check karta hai, company ke liye taaza letter company ke apne sealed envelope mein likhta hai, aur reply ke saath bhi yahi karta hai. Aap interpreter par bharosa karte ho (aapki company ne use chuna). Videshi company ko interpreter ka envelope dikhta hai lekin interpreter aapke liye us company ki pehchaan check karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Forward proxy do TLS sessions">
<rect x="15" y="60" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="70" y="88" text-anchor="middle" class="svg-ink" font-size="13">Client</text><text x="70" y="106" text-anchor="middle" class="svg-muted" font-size="11">aapki CA par trust</text>
<rect x="255" y="45" width="130" height="90" rx="10" fill="#bae6fd"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="11">decrypt, inspect</text>
<rect x="515" y="60" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="88" text-anchor="middle" class="svg-ink" font-size="13">Server</text><text x="570" y="106" text-anchor="middle" class="svg-muted" font-size="11">asli certificate</text>
<line x1="125" y1="90" x2="255" y2="90" stroke="#64748b" stroke-width="3"/><text x="190" y="80" text-anchor="middle" class="svg-accent" font-size="11">TLS session 1</text>
<line x1="385" y1="90" x2="515" y2="90" stroke="#64748b" stroke-width="3"/><text x="450" y="80" text-anchor="middle" class="svg-accent" font-size="11">TLS session 2</text>
<text x="190" y="150" text-anchor="middle" class="svg-muted" font-size="11">forged certificate</text><text x="450" y="150" text-anchor="middle" class="svg-muted" font-size="11">asli certificate check</text>
</svg><p class="cap">Do alag TLS sessions. Client ko firewall ka banaya certificate dikhta hai; firewall asli wala check karta hai.</p></div>

<h3>Step by step</h3>
<ol>
<li>Client <code>site.example</code> se TLS connection shuru karta hai. Firewall ClientHello dekhta hai aur decryption policy kehti hai decrypt karo.</li>
<li>Firewall asli server se apna TLS connection kholta hai aur <b>asli server certificate</b> leta hai.</li>
<li>Firewall asli certificate check karta hai: firewall ki trusted list ki kisi CA ne sign kiya? Naam aur dates sahi? Woh decryption profile ke checks lagata hai (expired block karo, untrusted issuer block karo, aadi).</li>
<li>Firewall same naam ke liye <b>naya certificate on the fly banata hai</b> aur apni key se sign karta hai. Kaunsi key use hogi yeh step 3 par depend karta hai (neeche dekho).</li>
<li>Firewall woh certificate client ko dikhata hai aur client ke saath handshake poora karta hai.</li>
<li>Ab data firewall ke andar clear text mein guzarta hai: firewall client se decrypt karta hai, inspect karta hai (App-ID, threats, URL, files), aur server ki taraf dobara encrypt karta hai, aur replies ke saath bhi yahi.</li>
</ol>

<h3>Do signing certificates</h3>
<table class="cmp"><tr><th>Certificate</th><th>Kab use hota hai</th><th>Client ko kya dikhta hai</th></tr>
<tr><td>Forward Trust certificate</td><td>Asli server certificate aisi CA ne sign kiya jis par firewall trust karta hai</td><td>Valid certificate, agar client firewall CA par trust karta hai</td></tr>
<tr><td>Forward Untrust certificate</td><td>Asli server certificate bharose ke layak NAHI hai (unknown CA, self-signed, expired)</td><td>Jaanbujhkar certificate error, kyunki clients ko isse trust nahi karna chahiye</td></tr>
</table>
<p>Yeh design forward proxy ki safety ka dil hai. Firewall hamesha trusted CA se sign kare to kharab server ka certificate "bless" ho jaata aur user ko pata hi nahi chalta. Untrusted certificate browser mein warning dikhata hai, isliye user ka apna judgement bhi bachata hai. Forward Untrust CA ko clients par trusted ke roop mein <b>kabhi</b> install mat karo.</p>

<h3>Client ke paas kya hona chahiye</h3>
<p>Clients ko <b>Forward Trust CA</b> (root ya issuing CA jisne use sign kiya) par trust karna chahiye. Iske bina har decrypted site certificate error dikhati hai. CA ko managed devices par apne normal tools (group policy, MDM) se distribute karo. Chapter 4 isse cover karta hai.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Decryption rule ke match fields security rule jaise hote hain (zones, addresses, users, services, URL categories) plus ek action aur type. Apne PAN-OS release par exact syntax configuration mode mein question mark se verify karo. Naam fictional hain:</p>
<pre class="code"><span class="c">! Staff ka general web traffic outbound decrypt karo</span>
set rulebase decryption rules DEC-Staff-Out from trust to untrust source any destination any service any category any action decrypt type ssl-forward-proxy profile DP-Forward log-success yes log-fail yes</pre>
<p>Rule ko certificates (chapter 4) aur decryption profile (chapter 6) chahiye. Rules security rules ki tarah upar se neeche evaluate hoti hain, isliye exceptions (no-decrypt) is rule ke upar jaate hain.</p>

<h3>Security policy mein kya badalta hai</h3>
<p>Session decrypt hone ke baad App-ID TLS ke andar ki asli application pehchan sakta hai, aur security profiles use scan kar sakte hain. Sessions aur logs mein ssl ke saath andar ki application (jaise web-browsing) dikhegi, aur aapki security rules ko woh allow karna chahiye jo aap chahte ho. Pehle chapter ki tarah badlav se pehle aur baad test command se test karo. Traffic log decrypted sessions ko mark karta hai taaki aap filter kar sako.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank-style phishing page clean dikhne waali hosting site par hai. Decryption ke bina firewall ko trusted category ka ssl dikhta hai. Forward proxy ke saath firewall URL path aur page content inspect karta hai, URL filtering profile se phishing page pehchanta hai, aur block karta hai. User ko block page dikhta hai, jo isliye chalta hai kyunki firewall page ko client ko apne TLS session ke andar bhej sakta hai.</p></div>

<h3>Yaad rakhne waali limits</h3>
<ul>
<li><b>Pinned applications</b> aur <b>mutual TLS</b> clients fail hote hain. Inhe exclude karo (chapter 7).</li>
<li>Decryption CPU aur session capacity leti hai. Firewall ko uske hisaab se size karo.</li>
<li>Kuch sites unusual ciphers ya versions use karti hain. Profile unsupported sessions ko block ya bypass kar sakta hai, aur yeh risk decision hai.</li>
<li>Non-browser tools (command line, development tools) firewall CA par trust nahi kar sakte aur unmein bhi install karna padta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Trust aur untrust ke liye same certificate use karna, ya untrust certificate ko endpoints par trusted mark karna. Isse kharab server certificates se bachaav band ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do certificates: Forward Trust (trusted server certificates ke liye sign karta hai, clients ko trust karna hai) aur Forward Untrust (untrusted ke liye sign karta hai, clients ko trust NAHI karna). Forward proxy do TLS sessions banata hai.</p></div>

<div class="scn"><h4>Padlock jo sabke liye laal ho gaya</h4><p>Pilot ke pehle din pilot group ke har user ko har site par certificate errors dikhe. Firewall sahi decrypt kar raha tha, lekin Forward Trust CA unke laptops par abhi push nahi hui thi. Team ne CA device management system se distribute ki, aur ek ghante mein warnings band ho gayi. Unhone yeh bhi seekha ki rule on karne se pehle CA roll out karni chahiye.</p><p><b>Lesson:</b> Pehle CA distribute karo, phir decryption enable karo.</p></div>

<div class="iv"><p class="q">"SSL Forward Proxy kaise kaam karta hai aur do certificates kyun hote hain?"</p><p>Firewall client ka TLS session terminate karta hai aur asli server ke saath doosra TLS session kholta hai. Woh asli certificate validate karta hai, phir same naam ke liye apni CA se sign kiya certificate banata hai. Asli certificate bharose ka ho to Forward Trust certificate se sign karta hai, jise clients trust karte hain. Nahi to Forward Untrust certificate se, jise clients trust nahi karte, isliye user ko warning milti hai. Phir clear text inspect karta hai aur dobara encrypt karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Forward proxy mein firewall beech mein hota hai aur do TLS sessions bante hain.</li>
<li>Forward Trust certificate acche servers ke liye sign karta hai aur clients ko trust karna hai.</li>
<li>Forward Untrust certificate bure servers ke liye sign karta hai aur trust nahi hona chahiye.</li>
<li>Rule enable karne se pehle CA distribute karo; pinned aur mutual TLS applications exclude karo.</li>
<li>Decryption CPU leti hai; pehle size aur pilot karo.</li>
</ul></div>

`}};export{e as default};