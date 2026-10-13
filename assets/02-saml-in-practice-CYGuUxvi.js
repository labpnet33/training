var e={id:`saml-practice`,h:{en:`SAML in practice: assertion, entity ID, ACS URL, certificate and clock`,hi:`SAML practice mein: assertion, entity ID, ACS URL, certificate aur clock`},body:{en:`
<h3>SAML as a signed letter</h3>
<p>SAML is a standard way for a directory to tell a service "this person is ravi and he signed in at 10:02". Imagine a letter written by the directory, stamped with its seal, and carried by the user's browser to the service. The letter is the <b>assertion</b>. It carries the user name, perhaps group names, and a validity time window. The seal is a <b>digital signature</b> made with the directory's private key; the service checks it with the matching public key stored in a <b>signing certificate</b>.</p>

<h3>The sign-in flow in four steps</h3>
<ol>
<li>The user opens a web page; the cloud service sees no session and redirects the browser to the directory.</li>
<li>The user signs in at the directory (password, maybe a second factor).</li>
<li>The directory builds the signed assertion and sends the browser back to the service's <b>ACS URL</b>.</li>
<li>The service verifies the signature, the addressee, the time window and then creates a session. Now rules can see "ravi, Finance".</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SAML flow">
<rect x="20" y="90" width="120" height="60" rx="10" fill="#bae6fd"/><text x="80" y="125" text-anchor="middle" class="svg-ink" font-size="14">Browser</text>
<rect x="260" y="10" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">Service (SP)</text>
<rect x="500" y="90" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="14">Directory</text>
<line x1="140" y1="105" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="500" y1="105" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="140" y1="135" x2="500" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="150" y="70" class="svg-muted" font-size="12">1 redirect</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">2 sign in, 3 signed assertion built</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">4 browser posts assertion to the ACS URL; service checks it</text>
</svg><p class="cap">The browser is only the courier; the trust is between service and directory.</p></div>

<h3>The settings you must get right</h3>
<table class="cmp"><tr><th>Setting</th><th>Meaning</th><th>If wrong</th></tr>
<tr><td>Entity ID (service side)</td><td>The unique name of the service, as the directory knows it</td><td>Directory rejects the request: unknown application</td></tr>
<tr><td>IdP entity ID</td><td>The unique name of the directory, as the service knows it</td><td>Service refuses the assertion: unexpected issuer</td></tr>
<tr><td>ACS URL (service side)</td><td>Where the service wants the assertion delivered</td><td>Directory sends it somewhere the service never reads</td></tr>
<tr><td>IdP sign-in address</td><td>Where the service redirects users to sign in</td><td>Users land on an error page</td></tr>
<tr><td>Signing certificate</td><td>Public key that verifies the seal</td><td>Expired or replaced: signature check fails, users get 401</td></tr>
</table>
<p>The pairs must <b>match on both sides, character for character</b>. A trailing slash or a different case is a different name. In the portal the paths are <code>idp.saml.entityId</code> and <code>idpEntityId</code>, <code>acsUrl</code> and <code>idpAcsUrl</code>. Exact values and formats come from your directory vendor's documentation; never invent them.</p>

<h3>Certificate expiry</h3>
<p>The signing certificate has an end date. The portal shows <b>days left</b> (<code>certDays</code>). At zero the signature check fails for everyone at once, a classic Monday-morning outage. The Alerts page warns when fewer than 30 days remain, which is your time to rotate: import the new certificate before the old one dies.</p>

<h3>Clock skew</h3>
<p>An assertion says "valid from 10:02:00 to 10:07:00". If the service clock is eight minutes wrong, it thinks the letter is not yet valid or already expired. This is <b>clock skew</b>. The portal field <code>clockOk</code> reports whether the two clocks agree. Fix the time source (NTP) on the side that drifted; do not widen validity windows to hide it.</p>

<pre class="out">Identity &gt; SAML
Enabled ............ yes
Entity ID .......... sahyadri-sp           IdP side: sahyadri-sp     match
IdP entity ID ...... sahyadri-idp          match
ACS URL ............ acs-sahyadri         IdP side: acs-sahyadri-v2  <span class="hl">MISMATCH</span>
Certificate ........ 212 days left
Clock .............. in sync
Health ............. <span class="hl">PROBLEM: ACS URL differs</span></pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Saving SAML settings changes what the service accepts in step 4: which issuer, which delivery address, which signing key and how strictly time is judged. A wrong value does not slow sign-in; it stops it, with a 401 for every user of every location that requires authentication.</p></div>

<div class="eg"><p><b>Worked example, lab zs-id-1.</b> Compare both sides. Entity IDs equal, ACS URLs different. Edit the portal ACS URL to equal the directory value, activate changes, then rerun the test. The health line becomes "healthy" only when entity IDs, ACS URLs, certificate days and clock all pass.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing only one side. (2) Copying a value with a hidden trailing space. (3) Uploading a new certificate to the directory but not to the service. (4) Fixing clock skew by loosening validity.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expired certificate and clock skew look alike (everyone gets 401), but the expiry shows "0 days left" and skew shows "clock not in sync". Read the SAML page before guessing.</p></div>

<div class="scn"><h4>Monday 401s</h4><p>Pune staff all got sign-in errors at nine. Network and tunnel were fine, web worked for users with authentication off. The SAML page showed 0 days left on the signing certificate. The directory team issued a new certificate and the engineer loaded it; sign-in returned within minutes.</p><p><b>Lesson:</b> put certificate expiry in the calendar and watch the 30-day alert.</p></div>

<div class="iv"><p class="q">"Users report sign-in failures after a SAML change. What do you check?"</p><p>Entity IDs on both sides, ACS URLs, certificate expiry and the clock. Say you compare both sides, change one thing, and verify with a test user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The assertion is a signed statement of who signed in.</li>
<li>Entity IDs and ACS URLs must match on both sides exactly.</li>
<li>An expired signing certificate breaks all sign-ins at once.</li>
<li>Clock skew makes valid assertions look invalid.</li>
<li>Alerts warn at 30 days; rotate early.</li>
</ul></div>
`,hi:`
<h3>SAML ek signed letter ki tarah</h3>
<p>SAML ek standard tareeka hai jisse directory service ko batata hai "yeh person ravi hai aur usne 10:02 par sign in kiya". Socho directory ne ek letter likha, apni seal lagayi, aur user ka browser use service tak le gaya. Woh letter <b>assertion</b> hai. Usme user name, kabhi group names, aur validity time window hota hai. Seal ek <b>digital signature</b> hai jo directory ki private key se bani hai; service use <b>signing certificate</b> mein rakhi matching public key se check karti hai.</p>

<h3>Sign-in flow chaar steps mein</h3>
<ol>
<li>User web page kholta hai; cloud service ko session nahi dikhta to woh browser ko directory par redirect karti hai.</li>
<li>User directory par sign in karta hai (password, shayad second factor).</li>
<li>Directory signed assertion banata hai aur browser ko service ke <b>ACS URL</b> par wapas bhejta hai.</li>
<li>Service signature, addressee aur time window verify karti hai, phir session banati hai. Ab rules "ravi, Finance" dekh sakte hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="SAML flow">
<rect x="20" y="90" width="120" height="60" rx="10" fill="#bae6fd"/><text x="80" y="125" text-anchor="middle" class="svg-ink" font-size="14">Browser</text>
<rect x="260" y="10" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="14">Service (SP)</text>
<rect x="500" y="90" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="14">Directory</text>
<line x1="140" y1="105" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="500" y1="105" x2="400" y2="55" stroke="#64748b" stroke-width="2"/><line x1="140" y1="135" x2="500" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="150" y="70" class="svg-muted" font-size="12">1 redirect</text><text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">2 sign in, 3 signed assertion banta hai</text>
<text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">4 browser assertion ACS URL par post karta hai; service check karti hai</text>
</svg><p class="cap">Browser sirf courier hai; trust service aur directory ke beech hai.</p></div>

<h3>Woh settings jo sahi honi chahiye</h3>
<table class="cmp"><tr><th>Setting</th><th>Matlab</th><th>Galat ho to</th></tr>
<tr><td>Entity ID (service side)</td><td>Service ka unique naam, jaise directory use jaanta hai</td><td>Directory reject karta hai: unknown application</td></tr>
<tr><td>IdP entity ID</td><td>Directory ka unique naam, jaise service use jaanti hai</td><td>Service assertion refuse karti hai: unexpected issuer</td></tr>
<tr><td>ACS URL (service side)</td><td>Jahan service assertion delivery chahti hai</td><td>Directory use aisi jagah bhejta hai jo service padhti hi nahi</td></tr>
<tr><td>IdP sign-in address</td><td>Jahan service users ko sign in ke liye redirect karti hai</td><td>Users error page par pahunchte hain</td></tr>
<tr><td>Signing certificate</td><td>Public key jo seal verify karti hai</td><td>Expire ya replace ho gaya: signature check fail, users ko 401</td></tr>
</table>
<p>Jodiyan <b>dono taraf character-by-character match</b> honi chahiye. Trailing slash ya alag case alag naam hai. Portal mein paths <code>idp.saml.entityId</code> aur <code>idpEntityId</code>, <code>acsUrl</code> aur <code>idpAcsUrl</code> hain. Exact values aur formats aapke directory vendor ke documentation se aate hain; kabhi khud mat banao.</p>

<h3>Certificate expiry</h3>
<p>Signing certificate ki end date hoti hai. Portal <b>days left</b> (<code>certDays</code>) dikhata hai. Zero par signature check sabke liye ek saath fail hota hai, classic Monday-morning outage. Alerts page 30 din se kam bachne par warn karta hai, yeh rotate karne ka time hai: purana marne se pehle naya certificate import karo.</p>

<h3>Clock skew</h3>
<p>Assertion kehta hai "valid 10:02:00 se 10:07:00 tak". Agar service ki clock aath minute galat hai to woh sochti hai letter abhi valid nahi hua ya expire ho gaya. Yeh <b>clock skew</b> hai. Portal field <code>clockOk</code> batata hai ki dono clocks agree karti hain ya nahi. Jis taraf drift hua uski time source (NTP) theek karo; skew chhupane ke liye validity windows mat badhao.</p>

<pre class="out">Identity &gt; SAML
Enabled ............ yes
Entity ID .......... sahyadri-sp           IdP side: sahyadri-sp     match
IdP entity ID ...... sahyadri-idp          match
ACS URL ............ acs-sahyadri         IdP side: acs-sahyadri-v2  <span class="hl">MISMATCH</span>
Certificate ........ 212 days left
Clock .............. in sync
Health ............. <span class="hl">PROBLEM: ACS URL differs</span></pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> SAML settings save karne se step 4 mein service kya accept karti hai badalta hai: kaun sa issuer, kaun sa delivery address, kaun si signing key aur time kitni sakhti se judge hota hai. Galat value sign-in ko slow nahi karti; rok deti hai, un sab locations ke har user ko 401 ke saath jo authentication require karte hain.</p></div>

<div class="eg"><p><b>Worked example, lab zs-id-1.</b> Dono sides compare karo. Entity IDs barabar, ACS URLs alag. Portal ka ACS URL directory value ke barabar edit karo, activate changes karo, phir test dobara chalao. Health line tabhi "healthy" hoti hai jab entity IDs, ACS URLs, certificate days aur clock sab pass hon.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Sirf ek side edit karna. (2) Hidden trailing space ke saath value copy karna. (3) Naya certificate directory mein upload karna lekin service mein nahi. (4) Clock skew ko validity loose karke theek karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expired certificate aur clock skew ek jaise dikhte hain (sabko 401), lekin expiry "0 days left" dikhati hai aur skew "clock not in sync". Guess karne se pehle SAML page padho.</p></div>

<div class="scn"><h4>Monday ke 401</h4><p>Pune ke staff ko nau baje sab ko sign-in errors aaye. Network aur tunnel theek the, authentication off wale users ke liye web chal raha tha. SAML page ne signing certificate par 0 days left dikhaya. Directory team ne naya certificate banaya aur engineer ne load kiya; sign-in kuch minutes mein wapas aa gaya.</p><p><b>Seekh:</b> certificate expiry calendar mein daalo aur 30-day alert dekho.</p></div>

<div class="iv"><p class="q">"SAML change ke baad users sign-in fail report karte hain. Kya check karoge?"</p><p>Dono sides ke entity IDs, ACS URLs, certificate expiry aur clock. Bolo ki dono sides compare karte ho, ek cheez badalte ho, aur test user se verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assertion ek signed statement hai ki kisne sign in kiya.</li>
<li>Entity IDs aur ACS URLs dono sides par exactly match hone chahiye.</li>
<li>Expired signing certificate sabke sign-ins ek saath tod deta hai.</li>
<li>Clock skew valid assertions ko invalid dikhata hai.</li>
<li>Alerts 30 din par warn karte hain; jaldi rotate karo.</li>
</ul></div>
`}};export{e as default};