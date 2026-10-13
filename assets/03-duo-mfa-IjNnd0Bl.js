var e={id:`duo-mfa`,h:{en:`Duo architecture and MFA: factors, push fatigue and enrollment`,hi:`Duo architecture aur MFA: factors, push fatigue aur enrollment`},body:{en:`
<p>A bank locker needs two keys: yours and the bank's. A thief who copies your key still cannot open the locker without the bank manager, and the manager will not turn the second key for a stranger. <b>Multi-factor authentication</b> (MFA) is the same idea for logins: something you <b>know</b> (a password) plus something you <b>have</b> (a phone, a security key) or something you <b>are</b> (a fingerprint unlocking that key). Duo is the second key, and it also checks who is standing at the locker and what they are holding.</p>

<h3>The pieces of Duo</h3>
<dl class="terms">
<dt>Duo cloud service and Admin Panel</dt><dd>Where users, applications, policies and logs live. Administrators work here; in the lab this is the Duo section of the SEC-CLOUD console with its Users, Applications, Policies, Device Insight, Trust Monitor and Authentication Log pages.</dd>
<dt>Application (integration)</dt><dd>Each protected system, for example a VPN, a web portal or a SaaS app, is added as an application. It receives an integration key, a secret key and an API hostname that the system uses to talk to Duo. Each application has a policy attached.</dd>
<dt>Duo Mobile</dt><dd>The authenticator app on the user's phone. It receives pushes, shows passcodes and reports basic phone health.</dd>
<dt>Universal Prompt</dt><dd>The browser-based Duo screen shown after the password step, where the user picks or completes the second factor and where first-time users self-enroll.</dd>
<dt>Duo Authentication Proxy</dt><dd>A small on-premises service that speaks RADIUS or LDAP to network devices (ASA, Threat Defense, routers) and talks to the Duo cloud over TLS on TCP 443. It is how a VPN headend gets Duo MFA.</dd>
<dt>Duo Desktop</dt><dd>An app on laptops that reports device health (firewall, encryption, OS version, security agents) for device-health policies, covered in chapter 4.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Duo authentication flow">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="11">browser / client</text>
<rect x="170" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="230" y="102" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="230" y="120" text-anchor="middle" class="svg-muted" font-size="11">checks password</text>
<rect x="340" y="80" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="102" text-anchor="middle" class="svg-ink" font-size="13">Duo cloud</text><text x="405" y="120" text-anchor="middle" class="svg-muted" font-size="11">policy + factor</text>
<rect x="520" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="102" text-anchor="middle" class="svg-ink" font-size="13">Duo Mobile</text><text x="575" y="120" text-anchor="middle" class="svg-muted" font-size="11">approve / code</text>
<line x1="120" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="290" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="145" y="70" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="315" y="70" text-anchor="middle" class="svg-accent" font-size="12">2</text><text x="495" y="70" text-anchor="middle" class="svg-accent" font-size="12">3</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">1 primary login   2 redirect to Duo   3 second factor</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">4 Duo returns allow or deny to the application</text>
</svg><p class="cap">The basic Duo flow: the application checks the password, Duo applies policy and the second factor, then returns a verdict.</p></div>

<h3>Factors, strongest first</h3>
<table class="cmp"><tr><th>Factor</th><th>How it works</th><th>Strength</th></tr>
<tr><td><b>Passkeys / WebAuthn</b> (security keys, Touch ID, Windows Hello)</td><td>A cryptographic key pair bound to the real site; nothing to type or relay</td><td>Phishing-resistant</td></tr>
<tr><td><b>Verified Duo Push</b></td><td>The login screen shows a short code (3 to 6 digits); the user types it into Duo Mobile</td><td>Strong; defeats blind approval</td></tr>
<tr><td><b>Duo Push</b></td><td>Tap Approve on the phone</td><td>Good, but open to push fatigue</td></tr>
<tr><td><b>Passcodes</b> (Duo Mobile, hardware tokens)</td><td>A one-time code typed at the prompt</td><td>Moderate; can be phished in real time</td></tr>
<tr><td><b>SMS and phone call</b></td><td>Code by text, or press a key on a call</td><td>Weakest; SIM swap and interception</td></tr></table>
<p>Administrators decide which factors a policy allows. Bypass codes exist for emergencies, should be single-use and short-lived, and must be logged.</p>

<h3>Push fatigue, explained for defenders</h3>
<p>If an attacker already has a password, they can trigger login after login hoping the tired user eventually taps Approve. This is called <b>push fatigue</b> or MFA bombing. The indicators are easy to see once you look: many push requests for one user in a few minutes, mostly denied or timed out, often from an unusual location or device. The controls: require <b>Verified Push</b> (blind tapping no longer works), let Duo's risk-based authentication step up to Verified Push when it sees a push spray, teach users to press <i>report</i> instead of <i>deny</i>, and alert on the pattern in Trust Monitor and the SIEM. Then reset the password, because the password is clearly known.</p>

<h3>Enrollment and the new-user policy</h3>
<p>A user must be <b>enrolled</b> (have at least one registered factor) before Duo can challenge them. Users arrive through directory sync from Active Directory or a cloud directory, by administrator creation, or by self-enrollment in the Universal Prompt. What happens to a user who is not yet enrolled is decided by the policy's <b>new-user policy</b>: <i>require enrollment</i> (show the enrollment screen), <i>allow access without 2FA</i> (risky, for migrations only) or <i>deny access</i>. Chapter 12 walks a ticket where the deny setting locked out a legitimate new hire.</p>

<h3>Duo in front of a VPN</h3>
<p>Network devices speak RADIUS, not Duo's API, so the Authentication Proxy sits between them. A minimal setup in which the proxy checks the password against Active Directory and then adds Duo:</p>
<pre class="code"><span class="c">! authproxy.cfg on the proxy server 10.10.0.20</span>
[ad_client]
host=10.10.0.30
service_account_username=svc-duo
service_account_password=********
search_dn=DC=corp,DC=example

[radius_server_auto]
ikey=DIXXXXXXXXXXXXXXXXXX
skey=********
api_host=api-xxxxxxxx.duosecurity.com
radius_ip_1=10.10.0.1
radius_secret_1=********
client=ad_client
port=1812
failmode=secure

<span class="c">! ASA: point the VPN at the proxy, allow time for the push</span>
aaa-server DUO-RADIUS protocol radius
aaa-server DUO-RADIUS (inside) host 10.10.0.20
 key ********
 timeout 60
tunnel-group RA-VPN general-attributes
 authentication-server-group DUO-RADIUS</pre>
<p><code>failmode=secure</code> denies logins if the proxy cannot reach the Duo cloud (fail closed); <code>failmode=safe</code> lets primary authentication alone succeed (fail open). The 60-second RADIUS timeout matters: the default of a few seconds expires before a human can approve a push.</p>

<p>In the lab, the PC command <code>login &lt;app&gt; &lt;user&gt;</code> plays the part of the application, and <code>duo-push approve &lt;user&gt;</code> plays the phone:</p>
<pre class="out">PC1&gt; login app.nwk.lab alice
<span class="hl">Duo: Pushed a login request to alice. Approve it on the device (duo-push approve).</span>
PC1&gt; duo-push approve alice
<span class="hl">Duo: login to app.nwk.lab APPROVED for alice.</span></pre>

<div class="eg"><p><b>Worked example.</b> Verified Push with a 3-digit code means a user who blindly approves has a 1 in 1,000 chance of typing the right number by luck; with 6 digits it is 1 in 1,000,000. Combined with a lockout after repeated failures, guessing is not practical. Compare SMS: an attacker who controls the SIM receives the code directly, with no guessing at all.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving the RADIUS timeout at its default on the VPN headend. Users see "authentication failed" a few seconds after the push arrives, approve it anyway, and nothing happens. Raise the timeout (60 seconds is common) and keep retries low so one login does not send several pushes.</p></div>

<div class="exam"><p><b>Exam trap.</b> The Authentication Proxy is <b>on-premises</b> and speaks RADIUS or LDAP to devices; the Duo service is in the cloud. Fail mode <b>safe</b> means fail open, <b>secure</b> means fail closed. Passkeys/WebAuthn are the phishing-resistant option; SMS is the weakest.</p></div>

<div class="scn"><h4>Eleven pushes at midnight</h4><p>A finance clerk received eleven Duo pushes between 23:50 and 00:05 and finally approved one to make them stop. The attacker reached web mail and set a forwarding rule. The SOC found the pattern in the Duo authentication log: ten denied or timed-out pushes, one approval, all from a hosting-provider address abroad. They removed the rule, reset the password, and changed the mail policy to Verified Push with a location block.</p><p><b>Lesson:</b> a burst of denied pushes is an incident, not a nuisance, and Verified Push removes the "tap to make it stop" weakness.</p></div>

<div class="iv"><p class="q">"What is push fatigue and how do you defend against it?"</p><p>Strong answer: an attacker who already knows the password repeatedly triggers MFA pushes until the user approves one. Defences: Verified Push or number matching, phishing-resistant passkeys for high-value users, risk-based step-up, user training to report unexpected pushes, alerting on bursts of denied pushes, and an immediate password reset because the first factor is compromised.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Duo adds a second factor after the application checks the password, and applies a per-application policy.</li>
<li>Factor strength: passkeys, then Verified Push, then Push, then passcodes, then SMS and phone call.</li>
<li>Push fatigue shows as many denied pushes in a short time; Verified Push and alerting stop it.</li>
<li>The new-user policy decides what happens to users who are not enrolled: require enrollment, allow, or deny.</li>
<li>VPNs reach Duo through the on-premises Authentication Proxy over RADIUS; raise the RADIUS timeout and choose the fail mode deliberately.</li>
</ul></div>
`,hi:`
<p>Bank locker ko do chaabiyan chahiye: aapki aur bank ki. Jo chor aapki chaabi copy kar le, woh bhi bank manager ke bina locker nahi khol sakta, aur manager kisi ajnabi ke liye doosri chaabi nahi ghumayega. <b>Multi-factor authentication</b> (MFA) logins ke liye yahi idea hai: kuch jo aap <b>jaante</b> ho (password) plus kuch jo aapke <b>paas</b> hai (phone, security key) ya kuch jo aap <b>ho</b> (fingerprint jo us key ko unlock kare). Duo doosri chaabi hai, aur yeh bhi check karta hai ki locker ke saamne kaun khada hai aur uske haath mein kya hai.</p>

<h3>Duo ke hisse</h3>
<dl class="terms">
<dt>Duo cloud service aur Admin Panel</dt><dd>Jahan users, applications, policies aur logs rehte hain. Administrators yahan kaam karte hain; lab mein yeh SEC-CLOUD console ka Duo section hai jismein Users, Applications, Policies, Device Insight, Trust Monitor aur Authentication Log pages hain.</dd>
<dt>Application (integration)</dt><dd>Har protected system, jaise VPN, web portal ya SaaS app, application ki tarah add hota hai. Use ek integration key, secret key aur API hostname milta hai jisse system Duo se baat karta hai. Har application ke saath ek policy judi hoti hai.</dd>
<dt>Duo Mobile</dt><dd>User ke phone par authenticator app. Yeh pushes receive karta hai, passcodes dikhata hai aur basic phone health report karta hai.</dd>
<dt>Universal Prompt</dt><dd>Password step ke baad dikhne wali browser-based Duo screen, jahan user second factor chunta ya poora karta hai aur jahan pehli baar wale users self-enroll karte hain.</dd>
<dt>Duo Authentication Proxy</dt><dd>Ek chhoti on-premises service jo network devices (ASA, Threat Defense, routers) se RADIUS ya LDAP bolti hai aur Duo cloud se TCP 443 par TLS ke upar baat karti hai. VPN headend ko Duo MFA isi se milta hai.</dd>
<dt>Duo Desktop</dt><dd>Laptops par ek app jo device-health policies ke liye device health (firewall, encryption, OS version, security agents) report karta hai, chapter 4 mein cover hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Duo authentication flow">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">User</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="11">browser / client</text>
<rect x="170" y="80" width="120" height="50" rx="8" fill="#bae6fd"/><text x="230" y="102" text-anchor="middle" class="svg-ink" font-size="13">Application</text><text x="230" y="120" text-anchor="middle" class="svg-muted" font-size="11">password check</text>
<rect x="340" y="80" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="102" text-anchor="middle" class="svg-ink" font-size="13">Duo cloud</text><text x="405" y="120" text-anchor="middle" class="svg-muted" font-size="11">policy + factor</text>
<rect x="520" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="102" text-anchor="middle" class="svg-ink" font-size="13">Duo Mobile</text><text x="575" y="120" text-anchor="middle" class="svg-muted" font-size="11">approve / code</text>
<line x1="120" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="290" y1="105" x2="340" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="145" y="70" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="315" y="70" text-anchor="middle" class="svg-accent" font-size="12">2</text><text x="495" y="70" text-anchor="middle" class="svg-accent" font-size="12">3</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">1 primary login   2 Duo par redirect   3 second factor</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">4 Duo application ko allow ya deny lautata hai</text>
</svg><p class="cap">Basic Duo flow: application password check karti hai, Duo policy aur second factor lagata hai, phir verdict lautata hai.</p></div>

<h3>Factors, strongest pehle</h3>
<table class="cmp"><tr><th>Factor</th><th>Kaise kaam karta hai</th><th>Strength</th></tr>
<tr><td><b>Passkeys / WebAuthn</b> (security keys, Touch ID, Windows Hello)</td><td>Asli site se bandha cryptographic key pair; type ya relay karne ko kuch nahi</td><td>Phishing-resistant</td></tr>
<tr><td><b>Verified Duo Push</b></td><td>Login screen ek chhota code (3 se 6 digits) dikhati hai; user use Duo Mobile mein type karta hai</td><td>Strong; blind approval ko haraata hai</td></tr>
<tr><td><b>Duo Push</b></td><td>Phone par Approve tap karo</td><td>Achha, par push fatigue ke liye khula</td></tr>
<tr><td><b>Passcodes</b> (Duo Mobile, hardware tokens)</td><td>Prompt par type kiya one-time code</td><td>Moderate; real time mein phish ho sakta hai</td></tr>
<tr><td><b>SMS aur phone call</b></td><td>Text se code, ya call par key dabao</td><td>Sabse weak; SIM swap aur interception</td></tr></table>
<p>Administrators tay karte hain ki policy kaunse factors allow kare. Bypass codes emergencies ke liye hote hain, single-use aur short-lived hone chahiye, aur log hone chahiye.</p>

<h3>Push fatigue, defenders ke liye samjhaya</h3>
<p>Agar attacker ke paas pehle se password hai, to woh baar baar login trigger kar sakta hai is ummeed mein ki thaka hua user aakhir mein Approve tap kar dega. Ise <b>push fatigue</b> ya MFA bombing kehte hain. Dekhne par indicators aasaan hain: kuch minutes mein ek user ke liye kai push requests, zyada tar denied ya timed out, aksar unusual location ya device se. Controls: <b>Verified Push</b> require karo (blind tapping ab kaam nahi karta), Duo ke risk-based authentication ko push spray dikhne par Verified Push par step up karne do, users ko <i>deny</i> ki jagah <i>report</i> dabana sikhao, aur Trust Monitor aur SIEM mein is pattern par alert karo. Phir password reset karo, kyunki password saaf taur par leak ho chuka hai.</p>

<h3>Enrollment aur new-user policy</h3>
<p>Duo challenge kar sake isse pehle user <b>enrolled</b> hona chahiye (kam se kam ek registered factor). Users Active Directory ya cloud directory se directory sync se, administrator ke banane se, ya Universal Prompt mein self-enrollment se aate hain. Jo user abhi enrolled nahi hai uske saath kya hoga yeh policy ki <b>new-user policy</b> tay karti hai: <i>require enrollment</i> (enrollment screen dikhao), <i>allow access without 2FA</i> (risky, sirf migrations ke liye) ya <i>deny access</i>. Chapter 12 ek ticket walk karta hai jahan deny setting ne ek legitimate naye hire ko lock out kar diya.</p>

<h3>VPN ke aage Duo</h3>
<p>Network devices RADIUS bolte hain, Duo ka API nahi, isliye Authentication Proxy beech mein baithta hai. Ek minimal setup jismein proxy password Active Directory se check karta hai aur phir Duo jodta hai:</p>
<pre class="code"><span class="c">! proxy server 10.10.0.20 par authproxy.cfg</span>
[ad_client]
host=10.10.0.30
service_account_username=svc-duo
service_account_password=********
search_dn=DC=corp,DC=example

[radius_server_auto]
ikey=DIXXXXXXXXXXXXXXXXXX
skey=********
api_host=api-xxxxxxxx.duosecurity.com
radius_ip_1=10.10.0.1
radius_secret_1=********
client=ad_client
port=1812
failmode=secure

<span class="c">! ASA: VPN ko proxy par point karo, push ke liye samay do</span>
aaa-server DUO-RADIUS protocol radius
aaa-server DUO-RADIUS (inside) host 10.10.0.20
 key ********
 timeout 60
tunnel-group RA-VPN general-attributes
 authentication-server-group DUO-RADIUS</pre>
<p><code>failmode=secure</code> logins deny karta hai agar proxy Duo cloud tak na pahunch sake (fail closed); <code>failmode=safe</code> sirf primary authentication se success hone deta hai (fail open). 60-second RADIUS timeout matter karta hai: kuch seconds ka default insaan ke push approve karne se pehle hi expire ho jaata hai.</p>

<p>Lab mein PC command <code>login &lt;app&gt; &lt;user&gt;</code> application ka role nibhata hai, aur <code>duo-push approve &lt;user&gt;</code> phone ka:</p>
<pre class="out">PC1&gt; login app.nwk.lab alice
<span class="hl">Duo: Pushed a login request to alice. Approve it on the device (duo-push approve).</span>
PC1&gt; duo-push approve alice
<span class="hl">Duo: login to app.nwk.lab APPROVED for alice.</span></pre>

<div class="eg"><p><b>Worked example.</b> 3-digit code wale Verified Push ka matlab hai ki aankh band karke approve karne wale user ke paas luck se sahi number type karne ka 1,000 mein 1 chance hai; 6 digits ke saath 1,000,000 mein 1. Baar baar failure par lockout ke saath, guessing practical nahi hai. SMS se compare karo: SIM control karne wala attacker code seedha receive karta hai, koi guessing nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> VPN headend par RADIUS timeout default par chhod dena. Push aane ke kuch seconds baad users ko "authentication failed" dikhta hai, woh phir bhi approve karte hain, aur kuch nahi hota. Timeout badhao (60 seconds common hai) aur retries kam rakho taaki ek login kai pushes na bheje.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication Proxy <b>on-premises</b> hai aur devices se RADIUS ya LDAP bolta hai; Duo service cloud mein hai. Fail mode <b>safe</b> matlab fail open, <b>secure</b> matlab fail closed. Passkeys/WebAuthn phishing-resistant option hain; SMS sabse weak.</p></div>

<div class="scn"><h4>Aadhi raat ko gyaarah pushes</h4><p>Ek finance clerk ko 23:50 se 00:05 ke beech gyaarah Duo pushes aaye aur aakhir mein usne unhe band karwane ke liye ek approve kar diya. Attacker web mail tak pahuncha aur ek forwarding rule set kiya. SOC ko Duo authentication log mein pattern mila: das denied ya timed-out pushes, ek approval, sab videsh ke ek hosting-provider address se. Unhone rule hataya, password reset kiya, aur mail policy ko location block ke saath Verified Push par badla.</p><p><b>Seekh:</b> denied pushes ka burst ek incident hai, pareshani nahi, aur Verified Push "band karwane ke liye tap" wali kamzori hata deta hai.</p></div>

<div class="iv"><p class="q">"Push fatigue kya hai aur aap usse kaise bachoge?"</p><p>Strong answer: jo attacker pehle se password jaanta hai woh baar baar MFA pushes trigger karta hai jab tak user ek approve na kar de. Defences: Verified Push ya number matching, high-value users ke liye phishing-resistant passkeys, risk-based step-up, unexpected pushes report karne ki user training, denied pushes ke bursts par alerting, aur turant password reset kyunki first factor compromise ho chuka hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Application password check karne ke baad Duo second factor jodta hai, aur per-application policy lagata hai.</li>
<li>Factor strength: passkeys, phir Verified Push, phir Push, phir passcodes, phir SMS aur phone call.</li>
<li>Push fatigue kam samay mein kai denied pushes ki tarah dikhta hai; Verified Push aur alerting ise rokte hain.</li>
<li>New-user policy tay karti hai ki un-enrolled users ke saath kya ho: require enrollment, allow, ya deny.</li>
<li>VPNs on-premises Authentication Proxy ke through RADIUS par Duo tak pahunchte hain; RADIUS timeout badhao aur fail mode soch samajhkar chuno.</li>
</ul></div>
`}};export{e as default};