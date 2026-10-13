var e={id:`owasp-rest`,h:{en:`OWASP Top 10 continued: access control, CSRF, SSRF, components, misconfiguration, logging`,hi:`OWASP Top 10 aage: access control, CSRF, SSRF, components, misconfiguration, logging`},body:{en:`
<p>Chapter 5 covered the risks that come from trusting input. This chapter covers the rest of the list: the application does the right thing with data but fails at <i>who may do what</i>, at <i>what it is built from</i>, at <i>how it is set up</i> or at <i>noticing trouble</i>. For each one you need three things for the exam and for the job: what it looks like, how you would detect it, and how you stop it.</p>

<h3>Broken access control</h3>
<p>This is the failure of authorization: a user can reach data or actions outside their rights. It is consistently at or near the top of the list because it is easy to forget one check. The commonest shape is an <b>insecure direct object reference (IDOR)</b>: the URL contains an identifier, <code>/api/invoices/1042</code>, and the server returns it without asking whether this user owns invoice 1042. Related shapes: a normal user opening an admin URL because only the menu link was hidden; changing a role field in a request that the server accepts; and a service account that can do far more than it should.</p>
<p><b>Detect:</b> one account requesting many sequential identifiers, 403 and 404 bursts, access to admin paths by non-admin accounts. <b>Prevent:</b> deny by default; check authorization on the <b>server</b> for every request and every object, not just in the user interface; derive the user from the session or token, never from a form field; use unpredictable identifiers as a bonus, not as the control; log access-control failures.</p>

<h3>Cross-site request forgery (CSRF)</h3>
<p>The browser automatically attaches cookies to requests to a site. If a logged-in user visits a malicious page, that page can make the browser send a state-changing request (a transfer, a password change) to your site, and your site sees a valid cookie. <b>Defence:</b> an <b>anti-CSRF token</b> (a random per-session value that must be sent in the form or a header and that a foreign page cannot know), <code>SameSite</code> cookies, checking the <code>Origin</code> header, and requiring re-authentication for sensitive actions. APIs that use a bearer token in a header (not a cookie) are not exposed to CSRF in the same way, because the browser does not add that header by itself.</p>

<h3>Server-side request forgery (SSRF)</h3>
<p>Some features make the <i>server</i> fetch a URL on behalf of the user: "import from link", a webhook tester, an image preview. If the address is taken from input without limits, the server can be steered to reach places the user cannot reach directly: internal admin pages, the management network or a cloud metadata service. The server becomes a proxy into the trusted zone. <b>Prevent:</b> an allow-list of permitted hosts and schemes, refuse private and link-local address ranges after DNS resolution, do not follow redirects blindly, give the fetching service its own network segment with <b>egress rules</b> that block internal destinations, and never return raw responses to the user. <b>Detect:</b> outbound requests from the app server to internal addresses it should never contact.</p>

<h3>Security misconfiguration</h3>
<p>The software is fine; the setup is not: default passwords, sample pages left in place, directory listings on, debug mode in production, unnecessary services and open ports, cloud storage set to public, detailed error pages that reveal paths and versions, missing security headers. <b>Prevent:</b> a hardened, minimal build; the same configuration in every environment from code; remove defaults; automated checks that compare actual settings with the baseline; regular scans. A firewall rule that is too wide is also a misconfiguration, which is exactly what Lab 1 fixes.</p>

<h3>Vulnerable and outdated components</h3>
<p>Your application is mostly other people's code: libraries, frameworks, base images. When a flaw is published for one of them, every application that uses it is exposed until patched. <b>Prevent:</b> keep an inventory (a <b>software bill of materials, SBOM</b>), pin versions, run a dependency scanner in the pipeline, subscribe to advisories, patch quickly, remove what you do not use. More in chapter 10.</p>

<h3>Logging and monitoring failures</h3>
<p>Many breaches last months because nobody noticed. Without logs you cannot detect an attack, scope a breach or prove what happened. <b>Do:</b> log logins (success and failure), access-control failures, input-validation failures, admin actions and changes to configuration; include time, user, source address and outcome; send logs to a central place the application cannot alter; alert on patterns such as many failed logins; test the alerts. <b>Do not:</b> log passwords, tokens, full card numbers or other secrets, and do not let user input forge log lines (strip newlines).</p>

<h3>Authentication and data-protection failures, briefly</h3>
<p>Broken authentication (weak passwords allowed, no lockout, session IDs in URLs, no MFA) was covered in chapter 4. <b>Sensitive data exposure</b>, now often called cryptographic failures, means data sent without TLS, stored unencrypted, hashed with a fast algorithm, or protected with an old cipher; chapter 3 gave the controls. The newer parts of the list also include insecure design (no threat thinking at design time), software and data integrity failures (updates and pipelines that are not verified) and, in the recent edition, mishandling of exceptional conditions.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where each risk hits the request path">
<rect x="20" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="170" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="230" y="120" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<rect x="360" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="415" y="120" text-anchor="middle" class="svg-ink" font-size="13">Database</text>
<rect x="520" y="90" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="12">Internal</text><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="12">services</text>
<line x1="110" y1="115" x2="168" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="115" x2="358" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="130" x2="518" y2="168" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="140" y="75" text-anchor="middle" class="svg-accent" font-size="11">AuthN, CSRF</text>
<text x="230" y="60" text-anchor="middle" class="svg-accent" font-size="11">Access control, config, components</text>
<text x="415" y="75" text-anchor="middle" class="svg-accent" font-size="11">Injection, crypto</text>
<text x="500" y="190" text-anchor="middle" class="svg-accent" font-size="11">SSRF (server fetches)</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Logging and monitoring watch the whole path.</text>
</svg><p class="cap">The same request path, with the risk that threatens each hop.</p></div>

<h3>Recognise and prevent: the quick table</h3>
<table class="cmp"><tr><th>Symptom you see</th><th>Likely category</th><th>First control</th></tr>
<tr><td>User A reads user B's invoice by changing a number in the URL</td><td>Broken access control (IDOR)</td><td>Per-object authorization on the server</td></tr>
<tr><td>A bank-style form submits when a user only visited another site</td><td>CSRF</td><td>Anti-CSRF token, SameSite</td></tr>
<tr><td>The web server requests an internal management address on a user's behalf</td><td>SSRF</td><td>Allow-list, egress filtering</td></tr>
<tr><td>Default admin page reachable from the internet</td><td>Security misconfiguration</td><td>Harden, remove defaults</td></tr>
<tr><td>A scanner flags a library with a published flaw</td><td>Vulnerable components</td><td>Update, pin, scan in CI</td></tr>
<tr><td>Breach discovered by a customer, logs missing</td><td>Logging and monitoring failure</td><td>Central logs and alerts</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Hiding a button and calling it access control; trusting a user ID from a hidden form field; assuming an internal URL fetch is harmless; leaving debug on "temporarily"; logging full request bodies that include passwords.</p></div>
<div class="exam"><p><b>Exam traps.</b> IDOR is an access-control (authorization) problem, not an authentication problem. CSRF abuses the browser's automatic cookies; SSRF abuses the server's network position. "Outdated library with a known flaw" is a component problem even if the flaw is injection.</p></div>

<div class="scn"><h4>Invoice 1042 and the neighbour's invoice</h4><p>A customer of a small ISP changed the number at the end of her invoice link from 1042 to 1043 and saw a stranger's bill. The portal checked that she was logged in but never checked who owned the invoice. The developers added an ownership check on every invoice route, wrote a test that logs in as user A and asserts a 403 for user B's objects, and added an alert for any account that requests more than fifty different invoice numbers in a minute.</p><p><b>Lesson:</b> authentication is not authorization; check the object, on the server, every time.</p></div>

<div class="iv"><p class="q">"What is the difference between CSRF and SSRF?"</p><p>CSRF tricks a user's browser into sending a request the user did not intend, using the cookies the browser attaches automatically; the defence is anti-CSRF tokens and SameSite cookies. SSRF tricks the server into making a request to a place the attacker cannot reach, often an internal address; the defence is allow-lists and egress filtering. The victim in CSRF is the user, in SSRF it is the internal network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Broken access control (including IDOR) is fixed by server-side, per-object authorization, deny by default.</li>
<li>CSRF: anti-CSRF tokens and SameSite cookies. SSRF: allow-list destinations and filter outbound traffic.</li>
<li>Misconfiguration and outdated components are prevented by hardening, baselines, SBOMs and pipeline scanning.</li>
<li>Log security events centrally, alert on patterns, and never log secrets.</li>
<li>Match symptom to category first, then choose the control.</li>
</ul></div>
`,hi:`
<p>Chapter 5 mein woh risks the jo input par bharose se aate hain. Yeh chapter list ka baaki hissa cover karta hai: application data ke saath sahi karti hai par <i>kaun kya kare</i> mein, <i>woh kis se bani hai</i> mein, <i>kaise set up hui hai</i> mein ya <i>musibat notice karne</i> mein fail hoti hai. Har ek ke liye exam aur kaam ke liye teen cheezein chahiye: woh kaisa dikhta hai, aap use kaise detect karoge, aur kaise rokoge.</p>

<h3>Broken access control</h3>
<p>Yeh authorization ki failure hai: user aise data ya actions tak pahunch jata hai jo uske rights se bahar hain. Yeh list mein lagatar top ke aas-paas rehta hai kyunki ek check bhool jana aasan hai. Sabse common shape hai <b>insecure direct object reference (IDOR)</b>: URL mein identifier hota hai, <code>/api/invoices/1042</code>, aur server bina poochhe ki kya yeh user invoice 1042 ka owner hai use return kar deta hai. Milte-julte shapes: normal user admin URL khol leta hai kyunki sirf menu link chhupaya gaya tha; request mein role field badalna jise server accept kar leta hai; aur service account jo zaroorat se kahin zyada kar sakta hai.</p>
<p><b>Detect:</b> ek account kai sequential identifiers maang raha hai, 403 aur 404 ke bursts, non-admin accounts dwara admin paths ka access. <b>Prevent:</b> default se deny; authorization <b>server</b> par har request aur har object ke liye check karo, sirf user interface mein nahi; user ko session ya token se nikalo, form field se kabhi nahi; unpredictable identifiers bonus ki tarah use karo, control ki tarah nahi; access-control failures log karo.</p>

<h3>Cross-site request forgery (CSRF)</h3>
<p>Browser kisi site ki requests ke saath cookies khud lagata hai. Agar logged-in user malicious page visit kare, to woh page browser se aapki site ko state-changing request (transfer, password change) bhijwa sakta hai, aur aapki site valid cookie dekhti hai. <b>Defence:</b> <b>anti-CSRF token</b> (random per-session value jo form ya header mein bhejni padti hai aur jise doosra page nahi jaan sakta), <code>SameSite</code> cookies, <code>Origin</code> header check, aur sensitive actions ke liye re-authentication. Jo APIs header mein bearer token use karti hain (cookie nahi) woh CSRF se usi tarah exposed nahi hoti, kyunki browser woh header khud nahi lagata.</p>

<h3>Server-side request forgery (SSRF)</h3>
<p>Kuch features <i>server</i> se user ki taraf se URL fetch karwate hain: "link se import", webhook tester, image preview. Agar address bina limits ke input se liya jaye, to server ko aisi jagah pahunchane ke liye steer kiya ja sakta hai jahan user seedha nahi pahunch sakta: internal admin pages, management network ya cloud metadata service. Server trusted zone mein proxy ban jata hai. <b>Prevent:</b> permitted hosts aur schemes ki allow-list, DNS resolution ke baad private aur link-local address ranges refuse karo, redirects andhe ho kar follow mat karo, fetching service ko apna network segment do jisme <b>egress rules</b> internal destinations block karein, aur raw responses user ko kabhi wapas mat do. <b>Detect:</b> app server se internal addresses ko outbound requests jinhe use kabhi contact nahi karna chahiye.</p>

<h3>Security misconfiguration</h3>
<p>Software theek hai; setup nahi: default passwords, sample pages chhodi hui, directory listings on, production mein debug mode, unnecessary services aur khule ports, cloud storage public, aise detailed error pages jo paths aur versions batate hain, missing security headers. <b>Prevent:</b> hardened, minimal build; har environment mein code se wahi configuration; defaults hatao; automated checks jo actual settings ko baseline se compare karein; regular scans. Bahut chaudi firewall rule bhi misconfiguration hai, jo Lab 1 theek karta hai.</p>

<h3>Vulnerable aur outdated components</h3>
<p>Aapki application zyadatar doosron ka code hai: libraries, frameworks, base images. Jab inme se kisi ka flaw publish ho, to use use karne wali har application patch hone tak exposed hai. <b>Prevent:</b> inventory rakho (<b>software bill of materials, SBOM</b>), versions pin karo, pipeline mein dependency scanner chalao, advisories subscribe karo, jaldi patch karo, jo use nahi hota use hatao. Chapter 10 mein aur.</p>

<h3>Logging aur monitoring failures</h3>
<p>Bahut se breaches mahino chalte hain kyunki kisi ne notice nahi kiya. Logs ke bina aap attack detect nahi kar sakte, breach ka scope nahi nikal sakte aur sabit nahi kar sakte ki kya hua. <b>Karo:</b> logins (success aur failure), access-control failures, input-validation failures, admin actions aur configuration changes log karo; time, user, source address aur outcome shamil karo; logs ek central jagah bhejo jise application badal na sake; failed logins ke bahut hone jaise patterns par alert lagao; alerts test karo. <b>Mat karo:</b> passwords, tokens, poore card numbers ya doosre secrets log mat karo, aur user input ko log lines forge mat karne do (newlines hatao).</p>

<h3>Authentication aur data-protection failures, sankshep mein</h3>
<p>Broken authentication (kamzor passwords allowed, lockout nahi, URLs mein session IDs, MFA nahi) chapter 4 mein tha. <b>Sensitive data exposure</b>, jise ab aksar cryptographic failures kehte hain, ka matlab hai TLS ke bina bheja data, unencrypted stored, fast algorithm se hashed, ya purane cipher se protected; chapter 3 ne controls diye. List ke naye hisson mein insecure design (design ke waqt threat sochna nahi), software aur data integrity failures (updates aur pipelines jo verify nahi hote) aur recent edition mein exceptional conditions ka galat handling bhi shamil hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Har risk request path par kahan lagta hai">
<rect x="20" y="90" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="120" text-anchor="middle" class="svg-ink" font-size="13">User</text>
<rect x="170" y="90" width="120" height="50" rx="8" fill="#bae6fd"/><text x="230" y="120" text-anchor="middle" class="svg-ink" font-size="13">Application</text>
<rect x="360" y="90" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="415" y="120" text-anchor="middle" class="svg-ink" font-size="13">Database</text>
<rect x="520" y="90" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="115" text-anchor="middle" class="svg-ink" font-size="12">Internal</text><text x="570" y="130" text-anchor="middle" class="svg-ink" font-size="12">services</text>
<line x1="110" y1="115" x2="168" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="115" x2="358" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="130" x2="518" y2="168" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="140" y="75" text-anchor="middle" class="svg-accent" font-size="11">AuthN, CSRF</text>
<text x="230" y="60" text-anchor="middle" class="svg-accent" font-size="11">Access control, config, components</text>
<text x="415" y="75" text-anchor="middle" class="svg-accent" font-size="11">Injection, crypto</text>
<text x="500" y="190" text-anchor="middle" class="svg-accent" font-size="11">SSRF (server fetch karta hai)</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Logging aur monitoring poore path ko dekhte hain.</text>
</svg><p class="cap">Wahi request path, har hop ko threaten karne wale risk ke saath.</p></div>

<h3>Recognise aur prevent: quick table</h3>
<table class="cmp"><tr><th>Jo symptom dikhe</th><th>Likely category</th><th>Pehla control</th></tr>
<tr><td>User A URL ka number badal kar user B ka invoice padhta hai</td><td>Broken access control (IDOR)</td><td>Server par per-object authorization</td></tr>
<tr><td>Bank-style form submit ho jata hai jabki user ne sirf doosri site dekhi</td><td>CSRF</td><td>Anti-CSRF token, SameSite</td></tr>
<tr><td>Web server user ki taraf se internal management address ko request karta hai</td><td>SSRF</td><td>Allow-list, egress filtering</td></tr>
<tr><td>Default admin page internet se reachable</td><td>Security misconfiguration</td><td>Harden, defaults hatao</td></tr>
<tr><td>Scanner aisi library flag karta hai jiska flaw published hai</td><td>Vulnerable components</td><td>Update, pin, CI mein scan</td></tr>
<tr><td>Breach customer ne dhoondha, logs missing</td><td>Logging aur monitoring failure</td><td>Central logs aur alerts</td></tr>
</table>
<div class="warn"><p><b>Common mistakes.</b> Button chhupakar use access control kehna; hidden form field se user ID par bharosa; internal URL fetch ko harmless maanna; debug ko "temporarily" on chhodna; poori request bodies log karna jisme passwords hain.</p></div>
<div class="exam"><p><b>Exam traps.</b> IDOR access-control (authorization) problem hai, authentication problem nahi. CSRF browser ki automatic cookies ka misuse hai; SSRF server ki network position ka. "Known flaw wali outdated library" component problem hai chahe flaw injection ho.</p></div>

<div class="scn"><h4>Invoice 1042 aur padosi ka invoice</h4><p>Ek chhote ISP ki customer ne apne invoice link ke end ka number 1042 se 1043 kiya aur kisi ajnabi ka bill dekh liya. Portal ne check kiya ki woh logged in hai par yeh nahi ki invoice kiska hai. Developers ne har invoice route par ownership check lagaya, ek test likha jo user A se login karke user B ke objects par 403 assert karta hai, aur aisa alert jodha jo koi account ek minute mein pachaas se zyada alag invoice numbers maange.</p><p><b>Lesson:</b> authentication authorization nahi hai; object ko, server par, har baar check karo.</p></div>

<div class="iv"><p class="q">"CSRF aur SSRF mein kya farak hai?"</p><p>CSRF user ke browser ko aisi request bhejne par majboor karta hai jo user ne nahi chahi, un cookies se jo browser khud lagata hai; defence anti-CSRF tokens aur SameSite cookies hai. SSRF server ko aisi jagah request karne par majboor karta hai jahan attacker nahi pahunch sakta, aksar internal address; defence allow-lists aur egress filtering hai. CSRF mein victim user hai, SSRF mein internal network.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Broken access control (IDOR samet) ka fix server-side, per-object authorization, default deny hai.</li>
<li>CSRF: anti-CSRF tokens aur SameSite cookies. SSRF: destinations ki allow-list aur outbound traffic filter.</li>
<li>Misconfiguration aur outdated components hardening, baselines, SBOMs aur pipeline scanning se rukte hain.</li>
<li>Security events central log karo, patterns par alert lagao, aur secrets kabhi log mat karo.</li>
<li>Pehle symptom ko category se match karo, phir control chuno.</li>
</ul></div>
`}};export{e as default};