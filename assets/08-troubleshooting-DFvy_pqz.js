var e={id:`troubleshooting`,h:{en:`Troubleshooting decryption: certificate errors, broken apps and failed handshakes`,hi:`Decryption troubleshooting: certificate errors, toote apps aur failed handshakes`},body:{en:`

<p><b>Decryption tickets have a pattern.</b> Almost every ticket is one of four things: users see a certificate error, an application stops working, a site is blocked or reset, or performance suffers. This chapter gives a method that separates trust, exclusion, profile and policy problems, and shows which of the tools you already know apply.</p>

<h3>Analogy: the interpreter who cannot do the job</h3>
<p>When the interpreter (the firewall) fails, either the letter-writer does not trust the interpreter (trust problem), the recipient refuses interpreters (pinning), the interpreter does not know the language (unsupported cipher), or the rules forbid the letter altogether (policy). Ask in that order.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Decryption troubleshooting"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Is the session being decrypted?</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">decryption log, traffic log decrypted flag, application shown</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. If yes: does the client trust the CA?</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">certificate error in the browser means distribution problem</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Does the real server pass the profile checks?</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">expired, untrusted issuer, unsupported cipher: failure reason in the log</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Is the application pinned or mutual TLS?</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">breaks after decryption only: exclude</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Does the security policy allow the decrypted application?</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">test command and counters</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Is the firewall coping?</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">CPU, sessions, resource-unavailable counters</text></svg><p class="cap">Six checks for a decryption ticket, in order.</p></div>

<h3>Symptom: certificate error in the browser</h3>
<p>The browser says the certificate is not trusted, and the issuer name is your decryption CA. This is a <b>distribution</b> problem: that device does not trust the Forward Trust CA. Check whether the device is managed, whether the policy pushed the CA, and whether the browser or tool uses its own trust store (some do). If the issuer is the <b>untrust</b> certificate, the warning is correct: the real server's certificate is bad (expired, self-signed or unknown issuer). Do not suppress it. Fix the server or add a deliberate exception.</p>

<h3>Symptom: an application stops working after decryption started</h3>
<p>Typical causes: certificate pinning, mutual TLS, a tool that does not trust the CA. Check the decryption log for handshake failures to that server and the failure reason. If it is pinning or mutual TLS, add a narrow no-decrypt exclusion above the decrypt rule (chapter 7) and record it.</p>

<h3>Symptom: a site is reset or blocked</h3>
<ul>
<li><b>Profile blocks it.</b> The log reason is something like expired certificate, untrusted issuer or unsupported cipher. The blocking is working as designed. Decide whether to fix the server, exclude it or accept the risk.</li>
<li><b>Security policy blocks it.</b> After decryption the firewall may identify the inner application, and your security rule might not allow it. Use the lab-style checks below.</li>
</ul>

<h3>Which checks the simulator can show</h3>
<p>The simulator has no decryption engine, but the policy part of the problem is real simulator territory. A decrypted session is identified by its inner application. A rule that allows ssl on 443 may not allow web-browsing seen on 443, because the application-default port of web-browsing is 80. The test command shows it:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application ssl
"Allow-Out; index: 1" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
}

PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application web-browsing
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>On a real firewall the combination of the decrypted application and its default ports must be allowed deliberately, for example by letting the rule use service ports you choose for this traffic. Test before and after enabling the decryption rule so you know whether a new drop comes from decryption or from policy. The delta counters tell you the stage:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</pre>
<p>(That is the lab's real counter format. Rise of <code>flow_policy_deny</code> after decryption started points to security policy, not to the certificate.) Then confirm the session and the log, as in pan-diag:</p>
<pre class="out">PA1&gt; show session all filter application ssl
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
9361         ssl            ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[443]/untrust  (8.8.8.8[443])</pre>
<p>A session that still shows <code>ssl</code> as the application was not decrypted (or the app is not identifiable): look at your decryption rule match and the exclusions. A decrypted session would show the inner application next to it.</p>

<h3>Reference commands for a real firewall (not run in the simulator)</h3>
<pre class="code">show system setting ssl-decrypt exclude-cache
show system setting ssl-decrypt setting
show session id N</pre>
<p>Also use the <b>Decryption log</b> in the GUI (Monitor &gt; Logs &gt; Decryption), which lists the rule, TLS version, cipher, server name and the error. Filter by server name or by error to find patterns across users.</p>

<h3>Symptom: performance</h3>
<p>Decryption is CPU intensive. Signs: higher dataplane CPU, resource-unavailable failures, new sessions slow. Remedies: narrow the scope (exclude high-volume trusted services such as large software updates where policy allows), review certificate key sizes, size the platform or enable hardware options where available, and check the profile's behaviour when resources run out.</p>

<table class="cmp"><tr><th>Symptom</th><th>First suspect</th><th>Tool</th></tr>
<tr><td>Browser warns, issuer is your CA</td><td>CA not distributed to the device</td><td>Device trust store</td></tr>
<tr><td>Browser warns, issuer is the untrust CA</td><td>Real server certificate is bad</td><td>Decryption log reason</td></tr>
<tr><td>One app broken after rollout</td><td>Pinning or mutual TLS</td><td>Decryption log, exclusion</td></tr>
<tr><td>Site reset</td><td>Profile block or policy denial</td><td>Decryption log, delta counters</td></tr>
<tr><td>New drops after decryption</td><td>Inner application not allowed</td><td>test security-policy-match with the inner application</td></tr>
<tr><td>Slow network</td><td>CPU and session load</td><td>Resource counters, scope</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> After a pilot starts, an engineer reports that git over HTTPS fails with a trust error while browsers work. The decryption log shows the handshake succeeded on the firewall side, but the git tool uses its own certificate store that does not contain the decryption CA. The team installs the CA in that store through configuration management, and git works.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning off decryption globally as the first reaction to a complaint. Follow the six checks and fix the narrowest cause; disabling everything also removes protection for everyone.</p></div>
<div class="exam"><p><b>Exam trap.</b> Browser error with your CA as issuer means the client does not trust it; error with the untrust CA means the server certificate is bad. Pinned and mutual-TLS applications are excluded. A session still showing ssl was not decrypted.</p></div>

<div class="scn"><h4>The tool that did not know the CA</h4><p>A build pipeline began failing with "unable to verify the certificate" the day decryption was enabled. Browsers worked. The pipeline agents used a container image with its own trust store. The platform team rebuilt the image with the decryption CA added, and the pipelines recovered. Nobody had to add an exclusion.</p><p><b>Lesson:</b> Not every client uses the operating system trust store. Check the tool before excluding.</p></div>

<div class="iv"><p class="q">"A user says a site shows a certificate error since decryption was enabled. How do you troubleshoot?"</p><p>I look at who issued the certificate shown. If it is our decryption CA, the device does not trust it, so I check CA distribution and the client trust store. If it is the untrust certificate, the real server certificate is bad and the warning is correct. I confirm in the decryption log with the server name and failure reason, and I only add an exclusion for pinning or mutual TLS, narrowly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check in order: decrypted?, CA trusted?, profile checks, pinning or mutual TLS, policy for the inner application, performance.</li>
<li>Your CA as issuer means distribution; untrust CA means a bad server certificate.</li>
<li>A session that still shows ssl was not decrypted.</li>
<li>Use test security-policy-match and delta counters to separate policy from decryption.</li>
<li>Prefer narrow exclusions with owner and review date.</li>
</ul></div>

`,hi:`

<p><b>Decryption tickets ka ek pattern hota hai.</b> Lagbhag har ticket chaar mein se ek hota hai: users ko certificate error dikhta hai, application band ho jaati hai, site reset ya block hoti hai, ya performance giri hai. Yeh chapter aisa tareeka deta hai jo trust, exclusion, profile aur policy problems alag karta hai, aur batata hai aapke jaane-pehchane tools mein se kaunse lagte hain.</p>

<h3>Analogy: interpreter jo kaam nahi kar pa raha</h3>
<p>Interpreter (firewall) fail ho to ya letter-writer interpreter par trust nahi karta (trust problem), ya recipient interpreters refuse karta hai (pinning), ya interpreter ko bhasha nahi aati (unsupported cipher), ya rules letter hi mana karti hain (policy). Isi order mein poocho.</p>

<div class="dia"><svg viewBox="0 0 640 380" role="img" aria-label="Decryption troubleshooting"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. Session decrypt ho raha hai?</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">decryption log, traffic log ka decrypted flag, dikhti application</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. Haan to: client CA par trust karta hai?</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">browser mein certificate error matlab distribution problem</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Asli server profile checks pass karta hai?</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">expired, untrusted issuer, unsupported cipher: log mein failure reason</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Application pinned ya mutual TLS hai?</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">sirf decryption ke baad toote: exclude</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">5. Security policy decrypted application allow karti hai?</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">test command aur counters</text><line x1="320" y1="294" x2="320" y2="310" stroke="#64748b" stroke-width="2"/><rect x="60" y="310" width="520" height="44" rx="9" fill="#e2e8f0"/><text x="320" y="329" text-anchor="middle" class="svg-ink" font-size="13">6. Firewall sambhal raha hai?</text><text x="320" y="345" text-anchor="middle" class="svg-muted" font-size="11">CPU, sessions, resource-unavailable counters</text></svg><p class="cap">Decryption ticket ke liye chhe checks, order mein.</p></div>

<h3>Symptom: browser mein certificate error</h3>
<p>Browser kehta hai certificate trusted nahi hai, aur issuer ka naam aapki decryption CA hai. Yeh <b>distribution</b> problem hai: us device ko Forward Trust CA par trust nahi. Check karo device managed hai, policy ne CA push ki, aur browser ya tool apna trust store use karta hai (kuch karte hain). Issuer <b>untrust</b> certificate ho to warning sahi hai: asli server ka certificate kharab hai (expired, self-signed ya unknown issuer). Use suppress mat karo. Server fix karo ya jaanbujhkar exception jodo.</p>

<h3>Symptom: decryption shuru hone ke baad application band</h3>
<p>Aam kaaran: certificate pinning, mutual TLS, ya aisa tool jo CA par trust nahi karta. Us server ke handshake failures aur failure reason ke liye decryption log dekho. Pinning ya mutual TLS ho to decrypt rule ke upar narrow no-decrypt exclusion jodo (chapter 7) aur record karo.</p>

<h3>Symptom: site reset ya block</h3>
<ul>
<li><b>Profile block karta hai.</b> Log reason kuch aisa hota hai: expired certificate, untrusted issuer ya unsupported cipher. Blocking design ke hisaab se kaam kar rahi hai. Tay karo server fix karna hai, exclude karna hai ya risk accept karna hai.</li>
<li><b>Security policy block karti hai.</b> Decryption ke baad firewall andar ki application pehchan sakta hai, aur aapki security rule use allow nahi karti ho sakti. Neeche ke lab-style checks use karo.</li>
</ul>

<h3>Simulator kaunse checks dikha sakta hai</h3>
<p>Simulator mein decryption engine nahi hai, lekin problem ka policy hissa asli simulator territory hai. Decrypted session apni andar ki application se pehchana jaata hai. Jo rule 443 par ssl allow karti hai woh 443 par dikhi web-browsing allow na kare, kyunki web-browsing ka application-default port 80 hai. Test command yeh dikhata hai:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application ssl
"Allow-Out; index: 1" {
        application/service [ ping dns web-browsing ssl ]/application-default;
        <span class="hl">action allow;</span>
}

PA1&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443 application web-browsing
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Real firewall par decrypted application aur uske default ports ko jaanbujhkar allow karna padta hai, jaise rule ko is traffic ke liye aapke chune service ports use karne dekar. Decryption rule enable karne se pehle aur baad test karo taaki pata chale ki naya drop decryption se hai ya policy se. Delta counters stage batate hain:</p>
<pre class="out">PA1&gt; show counter global filter delta yes severity drop
name                                   value     rate  severity  category  aspect    description
flow_policy_deny                       1         0     drop      flow      session   Session setup: denied by policy</pre>
<p>(Yeh lab ka asli counter format hai. Decryption shuru hone ke baad <code>flow_policy_deny</code> badhna security policy ki taraf ishara karta hai, certificate ki taraf nahi.) Phir pan-diag ki tarah session aur log confirm karo:</p>
<pre class="out">PA1&gt; show session all filter application ssl
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
9361         ssl            ACTIVE  FLOW NS    10.0.1.10[64251]/trust/6  (203.0.113.2[60001])
vsys1                                          8.8.8.8[443]/untrust  (8.8.8.8[443])</pre>
<p>Jo session abhi bhi application ke roop mein <code>ssl</code> dikhata hai woh decrypt nahi hua (ya app pehchani nahi ja sakti): apni decryption rule match aur exclusions dekho. Decrypted session ke saath andar ki application dikhti.</p>

<h3>Real firewall ke reference commands (not run in the simulator)</h3>
<pre class="code">show system setting ssl-decrypt exclude-cache
show system setting ssl-decrypt setting
show session id N</pre>
<p>GUI mein <b>Decryption log</b> (Monitor &gt; Logs &gt; Decryption) bhi use karo, jo rule, TLS version, cipher, server name aur error list karta hai. Users ke beech patterns dhoondhne ke liye server name ya error se filter karo.</p>

<h3>Symptom: performance</h3>
<p>Decryption CPU-intensive hai. Signs: dataplane CPU zyada, resource-unavailable failures, naye sessions slow. Ilaaj: scope narrow karo (jahan policy allow kare wahan large software updates jaisi high-volume trusted services exclude karo), certificate key sizes review karo, platform size karo ya jahan available ho hardware options enable karo, aur profile ka behaviour check karo jab resources khatam hon.</p>

<table class="cmp"><tr><th>Symptom</th><th>Pehla shak</th><th>Tool</th></tr>
<tr><td>Browser warn karta hai, issuer aapki CA</td><td>CA device par distribute nahi hui</td><td>Device trust store</td></tr>
<tr><td>Browser warn karta hai, issuer untrust CA</td><td>Asli server certificate kharab</td><td>Decryption log reason</td></tr>
<tr><td>Rollout ke baad ek app toot gayi</td><td>Pinning ya mutual TLS</td><td>Decryption log, exclusion</td></tr>
<tr><td>Site reset</td><td>Profile block ya policy denial</td><td>Decryption log, delta counters</td></tr>
<tr><td>Decryption ke baad naye drops</td><td>Andar ki application allow nahi</td><td>Andar ki application ke saath test security-policy-match</td></tr>
<tr><td>Slow network</td><td>CPU aur session load</td><td>Resource counters, scope</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Pilot shuru hone ke baad engineer batata hai ki HTTPS par git trust error se fail hota hai jabki browsers chalte hain. Decryption log dikhata hai ki firewall side par handshake safal tha, lekin git tool apna certificate store use karta hai jisme decryption CA nahi hai. Team configuration management se us store mein CA install karti hai, aur git chalta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Shikayat ki pehli pratikriya mein decryption globally band kar dena. Chhe checks follow karo aur sabse narrow kaaran theek karo; sab kuch disable karna sabki protection bhi hata deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Browser error mein issuer aapki CA ho to client trust nahi karta; untrust CA ho to server certificate kharab. Pinned aur mutual-TLS applications exclude hoti hain. Jo session abhi bhi ssl dikhata hai woh decrypt nahi hua.</p></div>

<div class="scn"><h4>Tool jise CA ka pata nahi tha</h4><p>Jis din decryption enable hui build pipeline "unable to verify the certificate" se fail hone lagi. Browsers chal rahe the. Pipeline agents ek container image use karte the jiska apna trust store tha. Platform team ne image decryption CA ke saath dobara banayi, aur pipelines theek ho gayi. Kisi ko exclusion jodna nahi pada.</p><p><b>Lesson:</b> Har client operating system trust store use nahi karta. Exclude karne se pehle tool check karo.</p></div>

<div class="iv"><p class="q">"User kehta hai decryption enable hone ke baad site certificate error dikha rahi hai. Troubleshoot kaise karoge?"</p><p>Main dekhta hoon dikhaye gaye certificate ka issuer kaun hai. Hamari decryption CA ho to device use trust nahi karta, isliye CA distribution aur client trust store check karta hoon. Untrust certificate ho to asli server certificate kharab hai aur warning sahi hai. Decryption log mein server name aur failure reason se confirm karta hoon, aur exclusion sirf pinning ya mutual TLS ke liye, narrow, jodta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein check karo: decrypted?, CA trusted?, profile checks, pinning ya mutual TLS, andar ki application ki policy, performance.</li>
<li>Aapki CA issuer ho to distribution; untrust CA ho to kharab server certificate.</li>
<li>Jo session abhi bhi ssl dikhata hai woh decrypt nahi hua.</li>
<li>Policy aur decryption alag karne ke liye test security-policy-match aur delta counters use karo.</li>
<li>Owner aur review date ke saath narrow exclusions pasand karo.</li>
</ul></div>

`}};export{e as default};