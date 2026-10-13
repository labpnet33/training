var e={id:`decryption-policy`,h:{en:`Decryption policy and profiles: deciding what to decrypt and how strict to be`,hi:`Decryption policy aur profiles: kya decrypt karna hai aur kitna strict rehna hai`},body:{en:`

<p><b>Policy makes decryption safe.</b> The decryption rulebase decides which sessions are decrypted, which are left alone, and how the firewall treats sessions it cannot decrypt. A good policy is selective, ordered carefully and logged. This chapter teaches how to build one.</p>

<h3>Analogy: the airport customs lanes</h3>
<p>Some travellers go to the "open your bag" lane. Diplomats and medical staff with sealed cases take the "do not open" lane. Signs and officers decide the lane using the traveller's category, not at random. The decryption rulebase is that set of signs: <b>no-decrypt</b> lanes for protected categories, <b>decrypt</b> lanes for general traffic.</p>

<h3>The decryption rulebase</h3>
<p>Like the security rulebase, decryption rules are evaluated <b>top to bottom, first match wins</b>. A rule has match fields and an action.</p>
<table class="cmp"><tr><th>Part</th><th>Options</th></tr>
<tr><td>Match</td><td>Source zone, address, user; destination zone, address; service (ports); URL category</td></tr>
<tr><td>Action</td><td>decrypt or no-decrypt</td></tr>
<tr><td>Type (when decrypting)</td><td>SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy</td></tr>
<tr><td>Decryption profile</td><td>Strictness for certificate checks and unsupported traffic</td></tr>
<tr><td>Logging</td><td>Log successful handshakes, log failed handshakes</td></tr>
</table>
<p>Two important differences from security policy: decryption rules match on <b>URL category</b> and <b>service</b>, which is how you carve out exclusions, and there is <b>no default decrypt</b>. If no rule matches, the session is not decrypted.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Decryption rule order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. No-decrypt: sensitive categories</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">financial-services, health-and-medicine, and others your policy names</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. No-decrypt: technical exceptions</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">pinned applications, mutual TLS endpoints, partner sites</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Decrypt: staff to internet</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">type ssl-forward-proxy, strict profile</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Decrypt: inbound to your servers</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">type ssl-inbound-inspection per server</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">Default</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">no rule matches: not decrypted</text></svg><p class="cap">A typical ordering: protect first, then decrypt.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Verify the exact syntax with the question mark on your release. Names are fictional:</p>
<pre class="code"><span class="c">! 1. Never decrypt sensitive categories</span>
set rulebase decryption rules NO-DEC-Sensitive from trust to untrust source any destination any service any category [ financial-services health-and-medicine ] action no-decrypt type ssl-forward-proxy log-success yes
<span class="c">! 2. Never decrypt a pinned application by destination list</span>
set rulebase decryption rules NO-DEC-Pinned from trust to untrust source any destination PINNED-APP-SERVERS service any category any action no-decrypt type ssl-forward-proxy
<span class="c">! 3. Decrypt everything else from staff</span>
set rulebase decryption rules DEC-Staff-Out from trust to untrust source any destination any service any category any action decrypt type ssl-forward-proxy profile DP-Forward log-fail yes</pre>
<p>Rules 1 and 2 use <b>no-decrypt</b>, but still need a type so the firewall knows which flow they apply to. They are placed first so that their sessions are never decrypted.</p>

<h3>Decryption profiles</h3>
<p>A decryption profile is attached to a decrypt rule. It has tabs for each decryption type. The important choices for forward proxy:</p>
<table class="cmp"><tr><th>Setting</th><th>Recommended stance</th><th>Why</th></tr>
<tr><td>Block sessions with expired certificates</td><td>On</td><td>An expired certificate is a quality and security signal</td></tr>
<tr><td>Block sessions with untrusted issuers</td><td>On</td><td>The issuer is not on the firewall trusted list; do not proxy such servers silently</td></tr>
<tr><td>Block sessions with unknown certificate status</td><td>Consider; depends on revocation checking</td><td>OCSP and CRL may be unreachable</td></tr>
<tr><td>Block sessions on certificate status check timeout</td><td>Consider</td><td>Avoids failing open when checks do not complete</td></tr>
<tr><td>Restrict certificate extensions</td><td>As policy requires</td><td>Controls what properties the generated certificate has</td></tr>
<tr><td>Unsupported versions and cipher suites</td><td>Block, or bypass by exception</td><td>The firewall cannot inspect what it cannot proxy; decide the risk</td></tr>
<tr><td>Client authentication (mutual TLS)</td><td>Handle by exclusion</td><td>The firewall cannot present the client certificate</td></tr>
<tr><td>Resources unavailable</td><td>Block or bypass, deliberately</td><td>If CPU or sessions are exhausted, choose whether to fail closed or open</td></tr>
<tr><td>Minimum TLS version</td><td>TLS 1.2 or higher</td><td>Do not allow weak SSL and old TLS versions</td></tr>
</table>
<p>A separate <b>no-decrypt profile</b> lets you check the server certificate (expired, untrusted) even for traffic you do not decrypt, so you still block bad certificates without reading the content.</p>

<h3>Logging decryption</h3>
<p>Enable <b>Log Successful TLS Handshake</b> during a pilot to see what is decrypted, and <b>Log Unsuccessful TLS Handshake</b> always, since failures are your troubleshooting source. Decryption logs record the policy, the TLS version and cipher, the server name and the error reason. The traffic log also marks decrypted sessions. Pair this with the session and counter commands in pan-diag when you need to follow a flow.</p>
<p>The rule engine itself behaves like the security rulebase you can practise on. For instance, the lab's test command shows how top-down first-match evaluation and categories play out in the security rulebase:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to dmz source 10.0.1.10 destination 10.0.2.10 protocol 6 destination-port 22
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>On a real firewall, a similar test for decryption exists (<code>test decryption-policy-match</code>, reference only, not available in the simulator).</p>

<div class="eg"><p><b>Worked example.</b> A company wants to decrypt staff web browsing but keep health and banking private. They create three rules: no-decrypt for health and financial categories; no-decrypt for a list of partner servers that use client certificates; decrypt for everything else, with a profile that blocks expired and untrusted certificates. A pilot group of 50 users runs for two weeks while the decryption log is reviewed.</p></div>

<h3>Design tips</h3>
<ul>
<li>Start small: one user group, a few categories, monitor, then expand.</li>
<li>Keep decrypt rules specific enough to explain; avoid unexplained any-any.</li>
<li>Treat the exclusion list as a living document with owners, because it changes whenever a new pinned application is found.</li>
<li>Remember that decryption happens before App-ID and threat profiles, so the security rules afterwards must be reviewed again.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Putting the broad decrypt rule above the no-decrypt exceptions. First match wins, so the exceptions never apply and sensitive traffic is decrypted. Always put no-decrypt rules first.</p></div>
<div class="exam"><p><b>Exam trap.</b> No default decrypt: no match means not decrypted. No-decrypt rules go first. Decryption rules can match URL categories and services. A decrypt rule has a type: ssl-forward-proxy, ssl-inbound-inspection or ssh-proxy.</p></div>

<div class="scn"><h4>The rule order that decrypted the bank</h4><p>After a policy change, a privacy complaint arrived: the banking sessions appeared in the decryption log. The engineer had added a new decrypt rule above the no-decrypt rules. Moving the exclusions to the top and keeping a monthly review of rule order fixed the exposure, and the logs were handled under the incident process.</p><p><b>Lesson:</b> Order is protection. Review decryption rule order whenever a rule is added.</p></div>

<div class="iv"><p class="q">"How do you structure a decryption policy?"</p><p>No-decrypt rules first for sensitive categories such as financial services and health, then technical exceptions for pinned applications and mutual TLS endpoints, then decrypt rules for staff outbound with forward proxy and for servers with inbound inspection. A decryption profile blocks expired and untrusted certificates and handles unsupported traffic by a deliberate decision. I log failures always and successes during the pilot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decryption rules are top-down first-match; no match means no decryption.</li>
<li>Put no-decrypt rules for sensitive categories and technical exceptions first.</li>
<li>Rules match zones, addresses, users, service and URL category; types are forward proxy, inbound and SSH.</li>
<li>Profiles control certificate checks, versions, ciphers and failure behaviour.</li>
<li>Log failures always; pilot before expanding.</li>
</ul></div>

`,hi:`

<p><b>Policy decryption ko safe banati hai.</b> Decryption rulebase tay karta hai ki kaunse sessions decrypt hon, kaunse chhode jaayein, aur jo sessions firewall decrypt nahi kar sakta unke saath kaisa vyavhar ho. Achhi policy selective, dhyan se ordered aur logged hoti hai. Yeh chapter sikhata hai kaise banayein.</p>

<h3>Analogy: airport customs ki lanes</h3>
<p>Kuch travellers "bag kholo" lane mein jaate hain. Diplomats aur medical staff jinke sealed cases hain "mat kholo" lane lete hain. Signs aur officers lane traveller ki category se tay karte hain, random nahi. Decryption rulebase un signs ka set hai: protected categories ke liye <b>no-decrypt</b> lanes, general traffic ke liye <b>decrypt</b> lanes.</p>

<h3>Decryption rulebase</h3>
<p>Security rulebase ki tarah decryption rules <b>upar se neeche, pehli match jeetti hai</b> order mein evaluate hoti hain. Rule mein match fields aur ek action hota hai.</p>
<table class="cmp"><tr><th>Hissa</th><th>Options</th></tr>
<tr><td>Match</td><td>Source zone, address, user; destination zone, address; service (ports); URL category</td></tr>
<tr><td>Action</td><td>decrypt ya no-decrypt</td></tr>
<tr><td>Type (decrypt karte waqt)</td><td>SSL Forward Proxy, SSL Inbound Inspection, SSH Proxy</td></tr>
<tr><td>Decryption profile</td><td>Certificate checks aur unsupported traffic ke liye strictness</td></tr>
<tr><td>Logging</td><td>Successful handshakes log karo, failed handshakes log karo</td></tr>
</table>
<p>Security policy se do zaroori farq: decryption rules <b>URL category</b> aur <b>service</b> par match karti hain, jisse aap exclusions nikalte ho, aur <b>default decrypt nahi</b> hota. Koi rule match na ho to session decrypt nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Decryption rule order"><rect x="60" y="10" width="520" height="44" rx="9" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">1. No-decrypt: sensitive categories</text><text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="11">financial-services, health-and-medicine, aur jo aapki policy naam le</text><line x1="320" y1="54" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><rect x="60" y="70" width="520" height="44" rx="9" fill="#bbf7d0"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">2. No-decrypt: technical exceptions</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="11">pinned applications, mutual TLS endpoints, partner sites</text><line x1="320" y1="114" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><rect x="60" y="130" width="520" height="44" rx="9" fill="#ddd6fe"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">3. Decrypt: staff se internet</text><text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="11">type ssl-forward-proxy, strict profile</text><line x1="320" y1="174" x2="320" y2="190" stroke="#64748b" stroke-width="2"/><rect x="60" y="190" width="520" height="44" rx="9" fill="#fde68a"/><text x="320" y="209" text-anchor="middle" class="svg-ink" font-size="13">4. Decrypt: aapke servers tak inbound</text><text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="11">har server ke liye type ssl-inbound-inspection</text><line x1="320" y1="234" x2="320" y2="250" stroke="#64748b" stroke-width="2"/><rect x="60" y="250" width="520" height="44" rx="9" fill="#fed7aa"/><text x="320" y="269" text-anchor="middle" class="svg-ink" font-size="13">Default</text><text x="320" y="285" text-anchor="middle" class="svg-muted" font-size="11">koi rule match nahi: decrypt nahi hota</text></svg><p class="cap">Aam ordering: pehle protect, phir decrypt.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Apne release par exact syntax question mark se verify karo. Naam fictional hain:</p>
<pre class="code"><span class="c">! 1. Sensitive categories kabhi decrypt mat karo</span>
set rulebase decryption rules NO-DEC-Sensitive from trust to untrust source any destination any service any category [ financial-services health-and-medicine ] action no-decrypt type ssl-forward-proxy log-success yes
<span class="c">! 2. Pinned application ko destination list se kabhi decrypt mat karo</span>
set rulebase decryption rules NO-DEC-Pinned from trust to untrust source any destination PINNED-APP-SERVERS service any category any action no-decrypt type ssl-forward-proxy
<span class="c">! 3. Staff ka baaki sab decrypt karo</span>
set rulebase decryption rules DEC-Staff-Out from trust to untrust source any destination any service any category any action decrypt type ssl-forward-proxy profile DP-Forward log-fail yes</pre>
<p>Rule 1 aur 2 <b>no-decrypt</b> use karti hain, phir bhi type chahiye taaki firewall ko pata chale kaunse flow par lagti hain. Inhe pehle rakha jaata hai taaki inke sessions kabhi decrypt na hon.</p>

<h3>Decryption profiles</h3>
<p>Decryption profile decrypt rule ke saath attach hota hai. Har decryption type ke liye tab hote hain. Forward proxy ke liye zaroori choices:</p>
<table class="cmp"><tr><th>Setting</th><th>Recommended stance</th><th>Kyun</th></tr>
<tr><td>Expired certificates waale sessions block karo</td><td>On</td><td>Expired certificate quality aur security ka signal hai</td></tr>
<tr><td>Untrusted issuers waale sessions block karo</td><td>On</td><td>Issuer firewall ki trusted list mein nahi; aise servers ko chupchaap proxy mat karo</td></tr>
<tr><td>Unknown certificate status waale sessions block karo</td><td>Sochkar; revocation checking par depend</td><td>OCSP aur CRL unreachable ho sakte hain</td></tr>
<tr><td>Certificate status check timeout par sessions block karo</td><td>Sochkar</td><td>Checks poore na hon to fail open hone se bachata hai</td></tr>
<tr><td>Certificate extensions restrict karo</td><td>Policy ke hisaab se</td><td>Generated certificate ki properties control karta hai</td></tr>
<tr><td>Unsupported versions aur cipher suites</td><td>Block, ya exception se bypass</td><td>Jo firewall proxy nahi kar sakta use inspect nahi kar sakta; risk decide karo</td></tr>
<tr><td>Client authentication (mutual TLS)</td><td>Exclusion se handle karo</td><td>Firewall client certificate present nahi kar sakta</td></tr>
<tr><td>Resources unavailable</td><td>Jaanbujhkar block ya bypass</td><td>CPU ya sessions khatam hon to fail closed ya open chuno</td></tr>
<tr><td>Minimum TLS version</td><td>TLS 1.2 ya upar</td><td>Kamzor SSL aur purane TLS versions allow mat karo</td></tr>
</table>
<p>Alag <b>no-decrypt profile</b> aapko un traffic ke liye bhi server certificate check (expired, untrusted) karne deta hai jise aap decrypt nahi karte, taaki content padhe bina bhi kharab certificates block ho jaayein.</p>

<h3>Decryption ko log karna</h3>
<p>Pilot ke dauran <b>Log Successful TLS Handshake</b> enable karo taaki dekho kya decrypt ho raha hai, aur <b>Log Unsuccessful TLS Handshake</b> hamesha, kyunki failures aapka troubleshooting source hain. Decryption logs policy, TLS version aur cipher, server name aur error reason record karte hain. Traffic log bhi decrypted sessions ko mark karta hai. Flow follow karna ho to ise pan-diag ke session aur counter commands ke saath jodo.</p>
<p>Rule engine khud us security rulebase jaisa kaam karta hai jise aap practise kar sakte ho. Jaise lab ka test command dikhata hai ki security rulebase mein top-down first-match evaluation kaise chalta hai:</p>
<pre class="out">PA1&gt; test security-policy-match from trust to dmz source 10.0.1.10 destination 10.0.2.10 protocol 6 destination-port 22
<span class="hl">No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).</span></pre>
<p>Real firewall par decryption ke liye aisa hi test hota hai (<code>test decryption-policy-match</code>, sirf reference, simulator mein nahi).</p>

<div class="eg"><p><b>Worked example.</b> Ek company staff web browsing decrypt karna chahti hai lekin health aur banking private rakhna chahti hai. Woh teen rules banati hai: health aur financial categories ke liye no-decrypt; client certificates use karne waale partner servers ki list ke liye no-decrypt; baaki sab ke liye decrypt, aise profile ke saath jo expired aur untrusted certificates block kare. 50 users ka pilot group do hafte chalta hai jabki decryption log review hota hai.</p></div>

<h3>Design tips</h3>
<ul>
<li>Chhota shuru karo: ek user group, kuch categories, monitor, phir expand.</li>
<li>Decrypt rules itni specific rakho ki samjha sako; bina wajah any-any se bacho.</li>
<li>Exclusion list ko living document maano jiske owners hon, kyunki naya pinned application milne par badalti hai.</li>
<li>Yaad rakho decryption App-ID aur threat profiles se pehle hoti hai, isliye baad ki security rules dobara review karo.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Broad decrypt rule ko no-decrypt exceptions ke upar rakhna. Pehli match jeetti hai, isliye exceptions kabhi lagti hi nahi aur sensitive traffic decrypt ho jaata hai. No-decrypt rules hamesha pehle rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default decrypt nahi: match na ho to decrypt nahi. No-decrypt rules pehle. Decryption rules URL categories aur services match kar sakti hain. Decrypt rule ka type: ssl-forward-proxy, ssl-inbound-inspection ya ssh-proxy.</p></div>

<div class="scn"><h4>Rule order jisne bank decrypt kar diya</h4><p>Policy change ke baad privacy complaint aayi: employees ke banking sessions decryption log mein dikhe. Engineer ne no-decrypt rules ke upar nayi decrypt rule jodi thi. Exclusions ko upar le jaane aur rule order ka monthly review rakhne se exposure theek hua, aur logs ko incident process ke under handle kiya gaya.</p><p><b>Lesson:</b> Order hi protection hai. Rule jodne par decryption rule order review karo.</p></div>

<div class="iv"><p class="q">"Decryption policy kaise structure karte ho?"</p><p>Pehle sensitive categories jaise financial services aur health ke liye no-decrypt rules, phir pinned applications aur mutual TLS endpoints ke liye technical exceptions, phir staff outbound ke liye forward proxy ke saath aur servers ke liye inbound inspection ke saath decrypt rules. Decryption profile expired aur untrusted certificates block karta hai aur unsupported traffic ko deliberate decision se handle karta hai. Failures hamesha log karta hoon aur successes pilot ke dauran.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decryption rules top-down first-match hain; match na ho to decrypt nahi.</li>
<li>Sensitive categories aur technical exceptions ke no-decrypt rules pehle rakho.</li>
<li>Rules zones, addresses, users, service aur URL category match karti hain; types forward proxy, inbound aur SSH.</li>
<li>Profiles certificate checks, versions, ciphers aur failure behaviour control karte hain.</li>
<li>Failures hamesha log karo; expand karne se pehle pilot.</li>
</ul></div>

`}};export{e as default};