var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module on one page</h3>
<p>Identity answers one question for the policy engine: who is this, and which groups are they in? It is the first step of the cloud policy order. If identity is unknown or failed, every group-based rule behaves differently from what you wrote. Two feeds supply identity: <b>SAML single sign-on</b> proves who signed in, and <b>SCIM provisioning</b> keeps users, groups and enabled state in step with the directory. Both are resume keywords for this track.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Identity summary">
<rect x="20" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="14">Directory</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">passwords, groups</text>
<rect x="235" y="10" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">SAML: who signed in</text>
<rect x="235" y="80" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">SCIM: who exists</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="14">Policy engine</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">user + groups</text>
<line x1="190" y1="55" x2="235" y2="35" stroke="#64748b" stroke-width="2"/><line x1="190" y1="75" x2="235" y2="105" stroke="#64748b" stroke-width="2"/><line x1="405" y1="35" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="105" x2="450" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">authentication off at a location: user unknown, group rules miss</text>
</svg><p class="cap">Two feeds, one decision input.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain authentication versus authorisation with an example.</li>
<li>Name the IdP and the service provider in our setup and who holds the password.</li>
<li>Describe the four SAML steps and what the assertion contains.</li>
<li>Compare entity IDs and ACS URLs on both sides and correct a mismatch (lab zs-id-1).</li>
<li>Read certificate days left and the clock status; know the 30-day alert.</li>
<li>Explain why authentication-off locations make group rules fail.</li>
<li>Read the user table: enabled, provisioned, groups.</li>
<li>Repair a user with no groups (lab zs-id-2) and offboard a leaver, with proof.</li>
<li>Apply symptom, evidence, root cause, fix, verify to tickets 320030, 320080, 321030 and 321040.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Authentication / authorisation</dt><dd>Proving identity / deciding what the identity may do.</dd>
<dt>IdP / SP</dt><dd>The system that owns sign-in / the service that trusts it.</dd>
<dt>Assertion</dt><dd>Signed statement of who signed in, valid for a short window.</dd>
<dt>Entity ID</dt><dd>Unique name of a party in the trust, must match on both sides.</dd>
<dt>ACS URL</dt><dd>The service address that receives the assertion.</dd>
<dt>Signing certificate</dt><dd>Holds the public key that verifies the signature; it expires.</dd>
<dt>Clock skew</dt><dd>Time difference that makes assertions look expired or not yet valid.</dd>
<dt>SCIM</dt><dd>Automatic push of users and groups from the directory.</dd>
<dt>Provisioned</dt><dd>The user record and groups exist in the service.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Symptom</th><th>First suspect</th><th>Proof</th></tr>
<tr><td>Everyone gets 401</td><td>Expired certificate, entity ID or ACS mismatch, clock</td><td>SAML page health</td></tr>
<tr><td>Group rule never fires at one site</td><td>Authentication off</td><td>Tester shows user unknown</td></tr>
<tr><td>Signs in, no access to group app</td><td>Not provisioned</td><td>User row has no groups</td></tr>
<tr><td>Leaver still works</td><td>User still enabled</td><td>Disable, then 401 and private test fails</td></tr>
</table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Identity settings change the inputs to rules, not the tunnels. A good habit for every change: say which test will prove it before you press Activate changes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating 401 and 403 as the same, patching one user instead of the sync, and forgetting that exact values (formats, validity limits) come from the directory vendor's documentation.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often hide the cause in one line of output: "0 days left", "authentication off" or "provisioned no". Read every line.</p></div>

<div class="scn"><h4>Handover note</h4><p>A shift engineer handed over three identity tickets with only "fixed" written. The next shift could not tell what changed. Since then every ticket note carries the evidence line, the change and the verification result.</p><p><b>Lesson:</b> a fix without evidence and verification is not finished.</p></div>

<div class="iv"><p class="q">"Walk me through what happens from a user clicking a link to a group rule matching."</p><p>Redirect to the directory, sign-in, signed assertion to the ACS URL, signature and time checks, session with user and groups from SCIM, then the rule order runs with that identity. Mention that authentication must be on for site traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity is step one of the policy order.</li>
<li>SAML proves sign-in; SCIM supplies users and groups.</li>
<li>Match entity IDs and ACS URLs, watch certificate days and clock.</li>
<li>Authentication off means unknown user.</li>
<li>401 is identity, 403 is policy; always verify with a test.</li>
</ul></div>
`,hi:`
<h3>Module ek page par</h3>
<p>Identity policy engine ke ek sawaal ka jawab deti hai: yeh kaun hai aur kin groups mein hai? Yeh cloud policy order ka pehla step hai. Identity unknown ya fail ho to har group-based rule aapke likhe se alag behave karta hai. Do feeds identity dete hain: <b>SAML single sign-on</b> prove karta hai ki kisne sign in kiya, aur <b>SCIM provisioning</b> users, groups aur enabled state ko directory ke saath step mein rakhta hai. Dono is track ke resume keywords hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Identity summary">
<rect x="20" y="30" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="105" y="60" text-anchor="middle" class="svg-ink" font-size="14">Directory</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">passwords, groups</text>
<rect x="235" y="10" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">SAML: kisne sign in kiya</text>
<rect x="235" y="80" width="170" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">SCIM: kaun exist karta hai</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#bae6fd"/><text x="535" y="60" text-anchor="middle" class="svg-ink" font-size="14">Policy engine</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">user + groups</text>
<line x1="190" y1="55" x2="235" y2="35" stroke="#64748b" stroke-width="2"/><line x1="190" y1="75" x2="235" y2="105" stroke="#64748b" stroke-width="2"/><line x1="405" y1="35" x2="450" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="105" x2="450" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">location par authentication off: user unknown, group rules miss</text>
</svg><p class="cap">Do feeds, ek decision input.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Example ke saath authentication aur authorisation ka farak samjhao.</li>
<li>Hamare setup mein IdP aur service provider batao aur password kiske paas hai.</li>
<li>SAML ke chaar steps aur assertion mein kya hota hai describe karo.</li>
<li>Dono sides ke entity IDs aur ACS URLs compare karo aur mismatch sahi karo (lab zs-id-1).</li>
<li>Certificate days left aur clock status padho; 30-day alert jaano.</li>
<li>Samjhao ki authentication-off locations par group rules kyun fail hote hain.</li>
<li>User table padho: enabled, provisioned, groups.</li>
<li>No groups wale user ko repair karo (lab zs-id-2) aur leaver ko proof ke saath offboard karo.</li>
<li>Tickets 320030, 320080, 321030 aur 321040 par symptom, evidence, root cause, fix, verify lagao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Authentication / authorisation</dt><dd>Identity prove karna / decide karna ki identity kya kar sakti hai.</dd>
<dt>IdP / SP</dt><dd>Jo system sign-in rakhta hai / jo service us par trust karti hai.</dd>
<dt>Assertion</dt><dd>Signed statement ki kisne sign in kiya, chhoti window ke liye valid.</dd>
<dt>Entity ID</dt><dd>Trust mein ek party ka unique naam, dono sides par match hona chahiye.</dd>
<dt>ACS URL</dt><dd>Service ka address jo assertion receive karta hai.</dd>
<dt>Signing certificate</dt><dd>Public key rakhta hai jo signature verify karti hai; yeh expire hota hai.</dd>
<dt>Clock skew</dt><dd>Time ka farak jo assertions ko expired ya not yet valid dikhata hai.</dd>
<dt>SCIM</dt><dd>Directory se users aur groups ka automatic push.</dd>
<dt>Provisioned</dt><dd>User record aur groups service mein maujood hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehla suspect</th><th>Proof</th></tr>
<tr><td>Sabko 401</td><td>Expired certificate, entity ID ya ACS mismatch, clock</td><td>SAML page health</td></tr>
<tr><td>Ek site par group rule kabhi fire nahi hota</td><td>Authentication off</td><td>Tester user unknown dikhata hai</td></tr>
<tr><td>Sign in hota hai, group app nahi khulti</td><td>Not provisioned</td><td>User row mein groups nahi</td></tr>
<tr><td>Leaver ka kaam chal raha hai</td><td>User abhi enabled</td><td>Disable karo, phir 401 aur private test fail</td></tr>
</table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Identity settings rules ke inputs badalti hain, tunnels nahi. Har change ke liye achhi aadat: Activate changes dabane se pehle bolo ki kaun sa test ise prove karega.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> 401 aur 403 ko ek samajhna, sync ki jagah ek user ko patch karna, aur bhool jaana ki exact values (formats, validity limits) directory vendor ke documentation se aati hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar cause ko output ki ek line mein chhupate hain: "0 days left", "authentication off" ya "provisioned no". Har line padho.</p></div>

<div class="scn"><h4>Handover note</h4><p>Ek shift engineer ne teen identity tickets sirf "fixed" likh kar handover kiye. Agli shift ko samajh nahi aaya kya badla. Tab se har ticket note mein evidence line, change aur verification result hota hai.</p><p><b>Seekh:</b> evidence aur verification ke bina fix poora nahi hai.</p></div>

<div class="iv"><p class="q">"User ke link click karne se group rule match hone tak kya hota hai, batao."</p><p>Directory par redirect, sign-in, ACS URL par signed assertion, signature aur time checks, SCIM se aaye user aur groups ke saath session, phir us identity ke saath rule order chalta hai. Mention karo ki site traffic ke liye authentication on honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity policy order ka step one hai.</li>
<li>SAML sign-in prove karta hai; SCIM users aur groups deta hai.</li>
<li>Entity IDs aur ACS URLs match karo, certificate days aur clock dekho.</li>
<li>Authentication off matlab unknown user.</li>
<li>401 identity hai, 403 policy; hamesha test se verify karo.</li>
</ul></div>
`}};export{e as default};