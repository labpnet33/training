var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p><b>Module complete.</b> You can now explain why and how a Palo Alto Networks firewall decrypts traffic, design a safe policy with exclusions, and troubleshoot the common failures. Use this chapter as your last review before an interview or exam.</p>

<h3>Analogy: the customs office, one more time</h3>
<p>Sealed boxes arrive. For most boxes, the officer asks for them to be opened in front of him (forward proxy for your users, inbound inspection for your own building). Certain boxes are never opened (financial, health, pinned). The officer's stamp is guarded (CA key). Everyone knows the rules (policy, notice, logs).</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the encrypted-traffic blind spot and what the firewall sees with and without decryption.</li>
<li>I can describe the TLS handshake, SNI, certificate chains and why forward secrecy requires an inline proxy.</li>
<li>I can explain SSL Forward Proxy, including the two TLS sessions and the Forward Trust and Forward Untrust certificates.</li>
<li>I can plan the decryption CA: subordinate or self-signed, distribution to clients, HA, key protection and expiry.</li>
<li>I can explain SSL Inbound Inspection and SSH Proxy and when to use each.</li>
<li>I can structure a decryption rulebase with no-decrypt rules first, profiles and logging.</li>
<li>I can name privacy, legal and technical exclusions, and run the exclusion process.</li>
<li>I can troubleshoot certificate errors, broken applications, resets and performance in order.</li>
</ul>

<h3>Command reference</h3>
<p>Commands you can run in the simulator (verified there), useful for the policy side of decryption:</p>
<pre class="code">test security-policy-match from Z to Z source S destination D protocol 6 destination-port 443 application ssl
show session all filter application ssl
show counter global filter delta yes severity drop
show log traffic</pre>
<p>Reference configuration and commands for a real firewall (not run in the simulator; confirm the syntax with the question mark on your release):</p>
<pre class="code">set rulebase decryption rules NAME from Z to Z source any destination any service any category any action decrypt type ssl-forward-proxy profile PROFILE
set rulebase decryption rules NAME ... action no-decrypt type ssl-forward-proxy
set rulebase decryption rules NAME ... action decrypt type ssl-inbound-inspection CERT
set rulebase decryption rules NAME ... action decrypt type ssh-proxy
show system setting ssl-decrypt exclude-cache</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TLS / SSL</dt><dd>Protocols that encrypt traffic between client and server</dd>
<dt>SNI</dt><dd>Server Name Indication: the site name in the ClientHello</dd>
<dt>PFS</dt><dd>Perfect forward secrecy: session keys not derived from the server key</dd>
<dt>Forward Trust certificate</dt><dd>CA certificate the firewall signs site certificates with for good servers; clients must trust it</dd>
<dt>Forward Untrust certificate</dt><dd>CA certificate used for bad servers; clients must not trust it</dd>
<dt>SSL Inbound Inspection</dt><dd>Decrypting traffic to your own server with its certificate and key</dd>
<dt>SSH Proxy</dt><dd>Decrypting SSH to see tunnelling</dd>
<dt>Decryption profile</dt><dd>Certificate checks and failure behaviour attached to a decrypt rule</dd>
<dt>No-decrypt</dt><dd>Rule action that leaves the session encrypted</dd>
<dt>Certificate pinning</dt><dd>An application accepts only a specific certificate or key</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Decryption types</td><td>SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy</td></tr>
<tr><td>Forward proxy sessions</td><td>Two separate TLS sessions with the firewall in the middle</td></tr>
<tr><td>Which CA clients must trust</td><td>Forward Trust; never Forward Untrust</td></tr>
<tr><td>Inbound inspection needs</td><td>The real server certificate and private key on the firewall</td></tr>
<tr><td>SSH Proxy needs</td><td>No certificates</td></tr>
<tr><td>Default when no rule matches</td><td>Not decrypted</td></tr>
<tr><td>Rule order</td><td>No-decrypt first, first match wins</td></tr>
<tr><td>Break proxy decryption</td><td>Certificate pinning and mutual TLS</td></tr>
<tr><td>Sensitive exclusions</td><td>Financial services, health and medicine, and per policy</td></tr>
<tr><td>Application without decryption</td><td>ssl</td></tr>
</table>

<h3>Where to practise next</h3>
<p>This module has no labs because the simulator has no TLS engine or certificates. Practise the surrounding skills in <b>pan-policy</b> (rule design and App-ID), <b>pan-diag</b> (sessions, test commands, counters and logs), <b>sec-crypto</b> (TLS and PKI theory), <b>nse4-ssl</b> (the same idea on another vendor) and <b>sec-aaa-mgmt</b> (roles that protect keys).</p>

<div class="warn"><p><b>Common mistake.</b> Learning the commands and skipping the governance. Interviewers and auditors ask about consent, exclusions, key protection and who can see the data.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question asks which certificate must not be trusted by clients, the answer is Forward Untrust. If it asks which decryption type needs the server key, the answer is SSL Inbound Inspection.</p></div>

<div class="scn"><h4>The checklist that saved a rollout</h4><p>A team used this checklist before a decryption pilot: legal approval, user notice, CA distribution, no-decrypt rules, a pilot group, and a rollback plan. The pilot hit two pinned applications and one tool with its own trust store, all fixed in days. The company-wide rollout a month later produced almost no complaints.</p><p><b>Lesson:</b> Preparation, not speed, is what makes decryption succeed.</p></div>

<div class="iv"><p class="q">"Summarise how you would roll out SSL decryption in a company."</p><p>I get legal, HR and user-notice approval, design the CA as a subordinate of the enterprise CA and distribute trust, build the rulebase with no-decrypt for sensitive categories and technical exceptions first, then decrypt with a strict profile, protect the CA key, pilot with logging, fix pinned and mutual-TLS cases with narrow exclusions, then expand. For servers I use inbound inspection, and I monitor performance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decryption turns a blind spot into inspectable traffic, with privacy and legal duties.</li>
<li>Forward Trust CA must be trusted by clients; Forward Untrust must not.</li>
<li>No-decrypt rules first; sensitive categories excluded; pinning and mutual TLS excluded.</li>
<li>Inbound inspection uses the server key; SSH Proxy needs no certificates.</li>
<li>Troubleshoot in order and pilot before rollout.</li>
</ul></div>

`,hi:`

<p><b>Module poora.</b> Ab aap samjha sakte ho ki Palo Alto Networks firewall traffic kyun aur kaise decrypt karta hai, exclusions ke saath safe policy design kar sakte ho, aur aam failures troubleshoot kar sakte ho. Is chapter ko interview ya exam se pehle last review ki tarah use karo.</p>

<h3>Analogy: customs office, ek baar aur</h3>
<p>Sealed boxes aate hain. Zyadatar boxes ke liye officer unhe apne saamne kholne ko kehta hai (aapke users ke liye forward proxy, aapki apni building ke liye inbound inspection). Kuch boxes kabhi nahi khulte (financial, health, pinned). Officer ke stamp ki hifazat hoti hai (CA key). Sab ko niyam pata hain (policy, notice, logs).</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main encrypted-traffic blind spot aur decryption ke saath aur bina firewall kya dekhta hai samjha sakta hoon.</li>
<li>Main TLS handshake, SNI, certificate chains aur yeh describe kar sakta hoon ki forward secrecy ko inline proxy kyun chahiye.</li>
<li>Main SSL Forward Proxy samjha sakta hoon, do TLS sessions aur Forward Trust aur Forward Untrust certificates samet.</li>
<li>Main decryption CA plan kar sakta hoon: subordinate ya self-signed, clients ko distribution, HA, key protection aur expiry.</li>
<li>Main SSL Inbound Inspection aur SSH Proxy samjha sakta hoon aur kab kaunsa use karna hai.</li>
<li>Main decryption rulebase structure kar sakta hoon: pehle no-decrypt rules, profiles aur logging.</li>
<li>Main privacy, legal aur technical exclusions ke naam bata sakta hoon aur exclusion process chala sakta hoon.</li>
<li>Main certificate errors, toote applications, resets aur performance order mein troubleshoot kar sakta hoon.</li>
</ul>

<h3>Command reference</h3>
<p>Jo commands simulator mein chal sakte hain (wahan verify kiye gaye), decryption ke policy side ke liye kaam ke:</p>
<pre class="code">test security-policy-match from Z to Z source S destination D protocol 6 destination-port 443 application ssl
show session all filter application ssl
show counter global filter delta yes severity drop
show log traffic</pre>
<p>Real firewall ke liye reference configuration aur commands (not run in the simulator; syntax apne release par question mark se confirm karo):</p>
<pre class="code">set rulebase decryption rules NAME from Z to Z source any destination any service any category any action decrypt type ssl-forward-proxy profile PROFILE
set rulebase decryption rules NAME ... action no-decrypt type ssl-forward-proxy
set rulebase decryption rules NAME ... action decrypt type ssl-inbound-inspection CERT
set rulebase decryption rules NAME ... action decrypt type ssh-proxy
show system setting ssl-decrypt exclude-cache</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>TLS / SSL</dt><dd>Protocols jo client aur server ke beech traffic encrypt karte hain</dd>
<dt>SNI</dt><dd>Server Name Indication: ClientHello mein site ka naam</dd>
<dt>PFS</dt><dd>Perfect forward secrecy: session keys server key se nahi nikalti</dd>
<dt>Forward Trust certificate</dt><dd>CA certificate jisse firewall acche servers ke liye site certificates sign karta hai; clients ko trust karna hai</dd>
<dt>Forward Untrust certificate</dt><dd>Bure servers ke liye use hone waala CA certificate; clients ko trust nahi karna</dd>
<dt>SSL Inbound Inspection</dt><dd>Apne server ke certificate aur key se uske traffic ko decrypt karna</dd>
<dt>SSH Proxy</dt><dd>Tunnelling dekhne ke liye SSH decrypt karna</dd>
<dt>Decryption profile</dt><dd>Decrypt rule se jude certificate checks aur failure behaviour</dd>
<dt>No-decrypt</dt><dd>Rule action jo session ko encrypted chhodta hai</dd>
<dt>Certificate pinning</dt><dd>Application sirf ek specific certificate ya key accept karti hai</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Decryption types</td><td>SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy</td></tr>
<tr><td>Forward proxy sessions</td><td>Firewall beech mein, do alag TLS sessions</td></tr>
<tr><td>Clients kaunsi CA par trust karein</td><td>Forward Trust; Forward Untrust kabhi nahi</td></tr>
<tr><td>Inbound inspection ko chahiye</td><td>Firewall par asli server certificate aur private key</td></tr>
<tr><td>SSH Proxy ko chahiye</td><td>Certificates nahi</td></tr>
<tr><td>Koi rule match na ho to default</td><td>Decrypt nahi hota</td></tr>
<tr><td>Rule order</td><td>Pehle no-decrypt, pehli match jeetti hai</td></tr>
<tr><td>Proxy decryption todte hain</td><td>Certificate pinning aur mutual TLS</td></tr>
<tr><td>Sensitive exclusions</td><td>Financial services, health and medicine, aur policy ke hisaab se</td></tr>
<tr><td>Decryption ke bina application</td><td>ssl</td></tr>
</table>

<h3>Aage kahan practise karein</h3>
<p>Is module mein labs nahi hain kyunki simulator mein TLS engine ya certificates nahi hain. Aas-paas ki skills <b>pan-policy</b> (rule design aur App-ID), <b>pan-diag</b> (sessions, test commands, counters aur logs), <b>sec-crypto</b> (TLS aur PKI theory), <b>nse4-ssl</b> (doosre vendor par wahi idea) aur <b>sec-aaa-mgmt</b> (keys protect karne waale roles) mein practise karo.</p>

<div class="warn"><p><b>Common mistake.</b> Commands seekhna aur governance chhod dena. Interviewers aur auditors consent, exclusions, key protection aur data kaun dekh sakta hai, yeh poochte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal poochhe ki clients ko kaunsa certificate trust nahi karna chahiye to jawab Forward Untrust hai. Poochhe ki kaunsa decryption type server key maangta hai to jawab SSL Inbound Inspection hai.</p></div>

<div class="scn"><h4>Checklist jisne rollout bacha liya</h4><p>Ek team ne decryption pilot se pehle yeh checklist use ki: legal approval, user notice, CA distribution, no-decrypt rules, pilot group aur rollback plan. Pilot mein do pinned applications aur apne trust store waala ek tool mila, sab kuch dino mein theek hua. Mahine baad company-wide rollout mein lagbhag koi shikayat nahi aayi.</p><p><b>Lesson:</b> Decryption ki safalta tezi se nahi, taiyari se aati hai.</p></div>

<div class="iv"><p class="q">"Company mein SSL decryption rollout kaise karoge, summarise karo."</p><p>Legal, HR aur user-notice approval leta hoon, CA ko enterprise CA ke subordinate ke roop mein design karta hoon aur trust distribute karta hoon, rulebase mein sensitive categories aur technical exceptions ke no-decrypt pehle rakhta hoon, phir strict profile ke saath decrypt, CA key protect karta hoon, logging ke saath pilot karta hoon, pinned aur mutual-TLS cases narrow exclusions se theek karta hoon, phir expand karta hoon. Servers ke liye inbound inspection use karta hoon, aur performance monitor karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decryption blind spot ko inspectable traffic banati hai, privacy aur legal duties ke saath.</li>
<li>Forward Trust CA clients ko trust karni hai; Forward Untrust nahi.</li>
<li>Pehle no-decrypt rules; sensitive categories exclude; pinning aur mutual TLS exclude.</li>
<li>Inbound inspection server key use karti hai; SSH Proxy ko certificates nahi chahiye.</li>
<li>Order mein troubleshoot karo aur rollout se pehle pilot karo.</li>
</ul></div>

`}};export{e as default};