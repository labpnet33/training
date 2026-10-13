var e={id:`authn-authz`,h:{en:`Authentication, authorization, MFA, tokens and sessions`,hi:`Authentication, authorization, MFA, tokens aur sessions`},body:{en:`
<p>Two words are confused more often than any others in security: <b>authentication</b> and <b>authorization</b>. They are two separate questions, asked in order, and the exam loves to test whether you can tell them apart.</p>

<h3>Analogy: the office building</h3>
<p>At the reception desk a guard checks your ID card and decides you really are Priya from the NOC: that is <b>authentication</b> (who are you?). Your card then opens the NOC floor but not the finance floor: that is <b>authorization</b> (what may you do?). A strong ID check with sloppy floor permissions still lets Priya wander into finance; strict floor permissions with a forged ID let a stranger in as Priya. You need both.</p>
<table class="cmp"><tr><th></th><th>Authentication (AuthN)</th><th>Authorization (AuthZ)</th></tr>
<tr><td>Question</td><td>Who are you?</td><td>What are you allowed to do?</td></tr>
<tr><td>Happens</td><td>First, at login or on each token check</td><td>After authentication, on every request</td></tr>
<tr><td>Proof or rule</td><td>Password, key, certificate, one-time code, biometric</td><td>Roles, permissions, policies, access lists</td></tr>
<tr><td>HTTP failure</td><td>401 Unauthorized (really "unauthenticated")</td><td>403 Forbidden</td></tr>
<tr><td>Typical bug</td><td>Weak or stolen credentials, no lockout</td><td>User can read another user's data</td></tr>
</table>

<h3>Factors and MFA</h3>
<p>Proof of identity comes in three kinds of <b>factor</b>: something you <b>know</b> (password, PIN), something you <b>have</b> (phone app, hardware key, smart card) and something you <b>are</b> (fingerprint, face). <b>Multi-factor authentication (MFA)</b> requires two or more <i>different</i> kinds. A password plus a security question is not MFA (both are knowledge). A password plus a time-based one-time code from an authenticator app is. MFA matters because a stolen or guessed password alone is no longer enough; the attacker also needs the second factor. Phishing-resistant factors such as hardware security keys are the strongest.</p>
<div class="warn"><p><b>Common mistakes.</b> Calling two passwords "two-factor"; accepting unlimited login attempts; sending the same error for "wrong user" and "wrong password" differently so an outsider can list valid usernames; and exempting service accounts from every control because "it is only a script".</p></div>

<h3>Sessions and cookies</h3>
<p>HTTP is stateless: each request stands alone. After a successful login the server creates a <b>session</b>: a random, unguessable identifier stored on the server (or encoded in a signed token) and handed to the browser as a <b>cookie</b>. The browser sends it back with every request, so the server knows "this is Priya's session". Whoever holds the identifier <i>is</i> Priya until the session ends, which is why it must be protected. Good cookie flags:</p>
<ul>
<li><code>Secure</code>: sent only over HTTPS.</li>
<li><code>HttpOnly</code>: page scripts cannot read it, which limits the damage of an XSS bug.</li>
<li><code>SameSite=Lax</code> or <code>Strict</code>: not sent on most cross-site requests, which blunts CSRF.</li>
</ul>
<p>Also give sessions an idle timeout and an absolute lifetime, issue a <b>new</b> identifier at login (so an old one planted beforehand is useless) and destroy it server-side at logout.</p>

<h3>Tokens for APIs</h3>
<p>APIs and scripts usually authenticate with a <b>token</b> instead of a cookie. The client puts it in a header and the server checks it on every call:</p>
<pre class="code">GET /api/v1/devices
Authorization: Bearer &lt;token&gt;</pre>
<p>"Bearer" means whoever <i>bears</i> (carries) the token is trusted, so a token is a password with a shorter life and must be kept secret and sent only over TLS. Common kinds:</p>
<dl class="terms">
<dt>Opaque token</dt><dd>A random string the server looks up in its store. Easy to revoke by deleting the entry.</dd>
<dt>JWT (JSON Web Token)</dt><dd>A signed token with three dot-separated parts (header, claims, signature). The server verifies the signature and reads claims such as the user, the roles and the expiry time without a database lookup. It is signed, <b>not encrypted</b>: anyone can read the claims, so never put secrets inside. Always check the signature, the expiry and the intended audience.</dd>
<dt>API key</dt><dd>A long-lived static secret for a program. Simple, but it has no expiry unless you add one, so scope it narrowly and rotate it.</dd>
<dt>OAuth 2.0 access token</dt><dd>OAuth is a framework in which a user lets an application act on their behalf with limited <b>scopes</b> (for example "read devices") without giving it the password. The application receives a short-lived access token and often a longer-lived refresh token.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Login then token then API call">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Auth server</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="10">AuthN</text>
<rect x="510" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="565" y="52" text-anchor="middle" class="svg-ink" font-size="12">API server</text><text x="565" y="68" text-anchor="middle" class="svg-muted" font-size="10">AuthZ</text>
<line x1="130" y1="100" x2="263" y2="100" stroke="#64748b" stroke-width="2"/><text x="196" y="94" text-anchor="middle" class="svg-ink" font-size="11">1 user + MFA</text>
<line x1="263" y1="135" x2="132" y2="135" stroke="#64748b" stroke-width="2"/><text x="196" y="129" text-anchor="middle" class="svg-ink" font-size="11">2 token</text>
<line x1="130" y1="180" x2="508" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="11">3 request + Bearer token</text>
<line x1="508" y1="212" x2="132" y2="212" stroke="#64748b" stroke-width="2"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="11">4 200 OK, or 401 / 403</text>
</svg><p class="cap">Authentication produces the token; authorization decides, per request, what the token may do.</p></div>

<h3>Least privilege and service accounts</h3>
<p><b>Least privilege</b> means every user, service and script gets only the permissions its job needs, and no more. A backup script that only reads device configs should use an account (or token scope) that can read configs, not one that can change them. If that credential leaks, the damage is limited to reading. Prefer <b>role-based access control (RBAC)</b>: define roles such as read-only, operator and admin, and assign people and services to roles instead of handing out individual permissions. Review accounts regularly and remove those nobody uses.</p>
<div class="eg"><p><b>Worked example.</b> The NOC backup job calls <code>GET /api/v1/config/sw-core1</code> with a token whose scope is <code>config:read</code>. A colleague's request to <code>PUT /api/v1/banner</code> with the same token returns <code>403 Forbidden</code>: authentication succeeded (the server knows who you are), authorization failed (the role lacks write). If the token were missing or expired, the answer would be <code>401</code>.</p></div>
<div class="exam"><p><b>Exam traps.</b> 401 means "I do not know who you are", 403 means "I know who you are and the answer is no". A JWT is signed, not encrypted. MFA needs factors of different <i>types</i>.</p></div>

<div class="scn"><h4>The admin token in the cron job</h4><p>A team ran a nightly job that only needed to read interface counters, but the engineer who set it up reused his personal admin token "to save time". When the job's server was compromised, the intruder used the token to change VLANs on three switches. After the incident the team created a read-only role, issued a separate token for the job with a 90-day expiry, enabled MFA for human administrators, and logged every token use.</p><p><b>Lesson:</b> a credential should match its task. Least privilege turns "total loss" into "a read of counters".</p></div>

<div class="iv"><p class="q">"What is the difference between authentication and authorization, and what status codes show each failure?"</p><p>Authentication proves identity, authorization decides permitted actions. A failed authentication is normally 401, a failed authorization is 403. Add MFA, tokens and least privilege as the controls, and mention that a valid login must still be authorised on every single request.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AuthN = who you are; AuthZ = what you may do; check both, on every request.</li>
<li>MFA combines different factor types: know, have, are.</li>
<li>Sessions use an unguessable ID in a cookie with Secure, HttpOnly and SameSite; renew it at login and expire it.</li>
<li>Bearer tokens are passwords with a short life: send them only over TLS and keep them out of logs.</li>
<li>Least privilege and RBAC limit what a leaked credential can do.</li>
</ul></div>
`,hi:`
<p>Security mein do shabd sabse zyada confuse hote hain: <b>authentication</b> aur <b>authorization</b>. Yeh do alag sawal hain, order mein poochhe jaate hain, aur exam yeh test karna pasand karta hai ki aap inhe alag kar sakte ho ya nahi.</p>

<h3>Analogy: office building</h3>
<p>Reception desk par guard aapka ID card check karke decide karta hai ki aap sach mein NOC wali Priya ho: yeh <b>authentication</b> hai (aap kaun ho?). Phir aapka card NOC floor kholta hai par finance floor nahi: yeh <b>authorization</b> hai (aap kya kar sakte ho?). Mazboot ID check ke saath dheeli floor permissions Priya ko finance mein ghoomne deti hain; sakht floor permissions ke saath nakli ID ajnabi ko Priya bana kar andar le jati hai. Dono chahiye.</p>
<table class="cmp"><tr><th></th><th>Authentication (AuthN)</th><th>Authorization (AuthZ)</th></tr>
<tr><td>Sawal</td><td>Aap kaun ho?</td><td>Aapko kya karne ki ijazat hai?</td></tr>
<tr><td>Kab hota hai</td><td>Pehle, login par ya har token check par</td><td>Authentication ke baad, har request par</td></tr>
<tr><td>Proof ya rule</td><td>Password, key, certificate, one-time code, biometric</td><td>Roles, permissions, policies, access lists</td></tr>
<tr><td>HTTP failure</td><td>401 Unauthorized (asal mein "unauthenticated")</td><td>403 Forbidden</td></tr>
<tr><td>Typical bug</td><td>Kamzor ya chori hue credentials, lockout nahi</td><td>User doosre user ka data padh sakta hai</td></tr>
</table>

<h3>Factors aur MFA</h3>
<p>Identity ka proof teen tarah ke <b>factor</b> mein aata hai: kuch jo aap <b>jaante</b> ho (password, PIN), kuch jo aapke <b>paas</b> hai (phone app, hardware key, smart card) aur kuch jo aap <b>ho</b> (fingerprint, face). <b>Multi-factor authentication (MFA)</b> do ya zyada <i>alag</i> tarah ke factors maangta hai. Password plus security question MFA nahi hai (dono knowledge hain). Password plus authenticator app ka time-based one-time code MFA hai. MFA isliye zaroori hai kyunki chori ya guess hua akela password ab kaafi nahi; attacker ko doosra factor bhi chahiye. Hardware security keys jaise phishing-resistant factors sabse mazboot hain.</p>
<div class="warn"><p><b>Common mistakes.</b> Do passwords ko "two-factor" kehna; unlimited login attempts accept karna; "wrong user" aur "wrong password" ke liye alag error dena jisse bahari insaan valid usernames ki list bana le; aur service accounts ko har control se chhoot dena kyunki "yeh sirf script hai".</p></div>

<h3>Sessions aur cookies</h3>
<p>HTTP stateless hai: har request akeli khadi hoti hai. Successful login ke baad server ek <b>session</b> banata hai: random, anjaana identifier jo server par stored hota hai (ya signed token mein encoded) aur browser ko <b>cookie</b> ke roop mein diya jata hai. Browser use har request ke saath wapas bhejta hai, isliye server jaanta hai "yeh Priya ka session hai". Jiske paas identifier hai woh session khatam hone tak <i>Priya hai</i>, isliye use protect karna zaroori hai. Achhe cookie flags:</p>
<ul>
<li><code>Secure</code>: sirf HTTPS par bheji jati hai.</li>
<li><code>HttpOnly</code>: page scripts use padh nahi sakti, jisse XSS bug ka nuksaan kam hota hai.</li>
<li><code>SameSite=Lax</code> ya <code>Strict</code>: zyadatar cross-site requests par nahi bheji jati, jisse CSRF kamzor padta hai.</li>
</ul>
<p>Sessions ko idle timeout aur absolute lifetime bhi do, login par <b>naya</b> identifier issue karo (taaki pehle se lagaya purana bekaar ho) aur logout par server-side destroy karo.</p>

<h3>APIs ke liye tokens</h3>
<p>APIs aur scripts aam taur par cookie ki jagah <b>token</b> se authenticate karte hain. Client use header mein daalta hai aur server har call par check karta hai:</p>
<pre class="code">GET /api/v1/devices
Authorization: Bearer &lt;token&gt;</pre>
<p>"Bearer" matlab jo token <i>bear</i> (carry) kare us par bharosa, isliye token chhoti life wala password hai aur use secret rakhna aur sirf TLS par bhejna zaroori hai. Common kinds:</p>
<dl class="terms">
<dt>Opaque token</dt><dd>Random string jise server apne store mein dhoondhta hai. Entry delete karke revoke karna aasan.</dd>
<dt>JWT (JSON Web Token)</dt><dd>Signed token jisme teen dot-separated parts hote hain (header, claims, signature). Server signature verify karta hai aur user, roles, expiry jaise claims bina database lookup ke padhta hai. Yeh signed hai, <b>encrypted nahi</b>: koi bhi claims padh sakta hai, isliye andar secrets kabhi mat daalo. Hamesha signature, expiry aur intended audience check karo.</dd>
<dt>API key</dt><dd>Program ke liye lambi life ka static secret. Simple hai, par expiry nahi hoti jab tak aap na daalo, isliye narrow scope do aur rotate karo.</dd>
<dt>OAuth 2.0 access token</dt><dd>OAuth ek framework hai jisme user application ko password diye bina limited <b>scopes</b> (jaise "read devices") ke saath apni taraf se kaam karne deta hai. Application ko short-lived access token aur aksar lamba refresh token milta hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Login phir token phir API call">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">Client</text>
<rect x="265" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Auth server</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="10">AuthN</text>
<rect x="510" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="565" y="52" text-anchor="middle" class="svg-ink" font-size="12">API server</text><text x="565" y="68" text-anchor="middle" class="svg-muted" font-size="10">AuthZ</text>
<line x1="130" y1="100" x2="263" y2="100" stroke="#64748b" stroke-width="2"/><text x="196" y="94" text-anchor="middle" class="svg-ink" font-size="11">1 user + MFA</text>
<line x1="263" y1="135" x2="132" y2="135" stroke="#64748b" stroke-width="2"/><text x="196" y="129" text-anchor="middle" class="svg-ink" font-size="11">2 token</text>
<line x1="130" y1="180" x2="508" y2="180" stroke="#64748b" stroke-width="2"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="11">3 request + Bearer token</text>
<line x1="508" y1="212" x2="132" y2="212" stroke="#64748b" stroke-width="2"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="11">4 200 OK, ya 401 / 403</text>
</svg><p class="cap">Authentication token banata hai; authorization har request par decide karti hai ki token kya kar sakta hai.</p></div>

<h3>Least privilege aur service accounts</h3>
<p><b>Least privilege</b> matlab har user, service aur script ko sirf utni permissions jitni uske kaam ko chahiye, usse zyada nahi. Jo backup script sirf device configs padhti hai woh aise account (ya token scope) se chale jo configs padh sake, badal na sake. Credential leak ho jaye to nuksaan sirf padhne tak simit rehta hai. <b>Role-based access control (RBAC)</b> prefer karo: read-only, operator aur admin jaise roles define karo aur logon aur services ko individual permissions dene ki jagah roles mein daalo. Accounts ka regular review karo aur jo koi use nahi karta use hatao.</p>
<div class="eg"><p><b>Worked example.</b> NOC backup job <code>GET /api/v1/config/sw-core1</code> ko aise token ke saath call karta hai jiska scope <code>config:read</code> hai. Colleague ki wahi token se <code>PUT /api/v1/banner</code> request <code>403 Forbidden</code> deti hai: authentication successful (server jaanta hai aap kaun ho), authorization fail (role mein write nahi). Token missing ya expired hota to jawab <code>401</code> hota.</p></div>
<div class="exam"><p><b>Exam traps.</b> 401 matlab "mujhe nahi pata aap kaun ho", 403 matlab "main jaanta hoon aap kaun ho aur jawab na hai". JWT signed hai, encrypted nahi. MFA ko <i>alag types</i> ke factors chahiye.</p></div>

<div class="scn"><h4>Cron job mein admin token</h4><p>Ek team ka nightly job sirf interface counters padhta tha, par setup karne wale engineer ne "time bachane ke liye" apna personal admin token reuse kar diya. Job ka server compromise hua to intruder ne us token se teen switches par VLANs badal diye. Incident ke baad team ne read-only role banaya, job ke liye alag token 90-din expiry ke saath issue kiya, human administrators ke liye MFA on kiya, aur har token use ko log kiya.</p><p><b>Lesson:</b> credential apne kaam ke barabar hona chahiye. Least privilege "total loss" ko "counters ka read" bana deta hai.</p></div>

<div class="iv"><p class="q">"Authentication aur authorization mein kya farak hai, aur kaunse status codes har failure dikhate hain?"</p><p>Authentication identity prove karta hai, authorization allowed actions decide karta hai. Failed authentication aam taur par 401 hai, failed authorization 403. Controls mein MFA, tokens aur least privilege batao, aur kaho ki valid login ko bhi har ek request par authorise karna zaroori hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AuthN = aap kaun ho; AuthZ = aap kya kar sakte ho; dono check karo, har request par.</li>
<li>MFA alag factor types milata hai: know, have, are.</li>
<li>Sessions cookie mein anjaana ID use karte hain, Secure, HttpOnly aur SameSite ke saath; login par renew karo aur expire karo.</li>
<li>Bearer tokens chhoti life ke passwords hain: sirf TLS par bhejo aur logs se door rakho.</li>
<li>Least privilege aur RBAC limit karte hain ki leaked credential kya kar sakta hai.</li>
</ul></div>
`}};export{e as default};