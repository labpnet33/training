var e={id:`duo-policy-device-trust`,h:{en:`Duo Adaptive Access: policies, device health and trusted endpoints (lab walk-through)`,hi:`Duo Adaptive Access: policies, device health aur trusted endpoints (lab walk-through)`},body:{en:`
<p>A good nightclub bouncer works through a short list in a fixed order. Are you on tonight's guest list? Is your ID real and are you old enough? Are you dressed for the place? Only if every answer is yes do you get the wristband. A different door, say the VIP room, has a stricter list. Duo <b>Adaptive Access policies</b> are that list, written once and attached to each application, so the finance system can be stricter than the canteen menu.</p>

<h3>Where policies live: the hierarchy</h3>
<ul>
<li><b>Global Policy</b>: applies to every application by default. It is the baseline: for example, everyone must use MFA and new users must enroll.</li>
<li><b>Custom (application) policy</b>: attached to one or more applications and overrides the global settings it defines. Anything it leaves untouched is inherited from the global policy.</li>
<li><b>Group policy</b>: applied inside an application to specific user groups, for example a stricter rule for administrators or a looser one for a pilot group.</li>
</ul>
<p>The most specific policy wins. When a login looks wrong, always ask first: which policy actually applied to this user on this application?</p>

<h3>What a policy can check</h3>
<table class="cmp"><tr><th>Section</th><th>What it controls</th></tr>
<tr><td>New user policy</td><td>Require enrollment, allow without 2FA, or deny unenrolled users</td></tr>
<tr><td>Authentication policy</td><td>Enforce MFA, bypass 2FA, or deny access entirely</td></tr>
<tr><td>User location and authorized networks</td><td>Allow, require MFA, or deny by country; skip or require MFA from known networks</td></tr>
<tr><td>Authentication methods</td><td>Which factors are allowed (for example passkeys and Verified Push only)</td></tr>
<tr><td>Operating systems and browsers</td><td>Warn or block when below a minimum version or out of support</td></tr>
<tr><td>Device health (Duo Desktop)</td><td>Require host firewall, disk encryption, a screen lock password, a security agent</td></tr>
<tr><td>Trusted endpoints</td><td>Allow only devices proven to be managed, by certificate or MDM / EDR integration</td></tr>
<tr><td>Remembered devices</td><td>How long a successful MFA is remembered on that browser or device</td></tr></table>

<h3>Device health versus trusted endpoints</h3>
<p>These two are often confused. <b>Device health</b> asks <i>is this device in good shape?</i> The Duo Desktop app reports facts such as OS version, firewall state and encryption, and the policy blocks or warns. <b>Trusted endpoints</b> asks <i>does this device belong to us?</i> Duo checks for a company-issued certificate or asks an integrated management tool (an MDM such as Intune or Jamf, or an EDR such as Secure Endpoint) whether the device is registered. A personal laptop can be perfectly healthy and still not trusted; a corporate laptop can be trusted and still unhealthy because it missed updates. Strict applications usually require both.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Duo policy evaluation order">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">Enrolled?</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">Location OK?</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">Device healthy?</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">Ask for factor</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="150" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">DENY with a reason</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">logged + shown in Trust Monitor</text>
<line x1="80" y1="64" x2="200" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="240" y1="64" x2="290" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="400" y1="64" x2="380" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="110" y="115" class="svg-accent" font-size="12">no</text><text x="270" y="115" class="svg-accent" font-size="12">no</text><text x="395" y="115" class="svg-accent" font-size="12">no</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">The first failed check ends the evaluation; the factor is only asked for at the end.</text>
</svg><p class="cap">Deny checks run before the second factor is offered, so an unhealthy device never even sees a push.</p></div>

<h3>Lab walk-through: Duo MFA plus a device-health policy</h3>
<p>The lab protects <code>app.nwk.lab</code>. Two users are already enrolled with Duo Push: <b>alice</b> on macOS 13.4 with disk encryption, and <b>bob</b> on Windows 10.1 without encryption. First look at <b>Duo → Device Insight</b> so you know what the policy will see:</p>
<pre class="out">User   OS version  Encrypted  Firewall  Country
alice  13.4        Yes        Yes       IN
<span class="hl">bob    10.1        No         Yes       IN</span></pre>
<ol>
<li><b>Duo → Policies → New policy.</b> Name it <code>Zero-Trust</code>, keep New user on <i>Require enrollment</i>, set MFA to <i>Duo Push</i>. On the new policy card set <b>Min OS version</b> to <code>13</code> and tick <b>Require disk encryption</b>.</li>
<li><b>Duo → Applications.</b> In the row for <code>app.nwk.lab</code>, set the Policy drop-down to <code>Zero-Trust</code>. Until you do this, the policy exists but protects nothing.</li>
<li>On PC1, log in as alice and approve the push (the output is shown in chapter 3): <code>login app.nwk.lab alice</code>, then <code>duo-push approve alice</code>.</li>
<li>Now try bob:</li>
</ol>
<pre class="out">PC1&gt; login app.nwk.lab bob
<span class="hl">Duo: access to app.nwk.lab DENIED for bob — Device health: disk encryption is off.</span></pre>
<p>Bob fails <b>two</b> checks, the old OS and the missing encryption, but the log line gives one reason: the evaluation stops at the first failure. That is why you should read Device Insight as well as the log, and why the lab accepts either <i>os</i> or <i>encryption</i> as the answer. The same denial appears in <b>Duo → Authentication Log</b> with result <code>deny</code>, and in <b>Duo → Trust Monitor</b> as a surfaced denied attempt. The correct fix for bob is remediation (update the OS, turn on encryption), never weakening the policy.</p>

<div class="eg"><p><b>Worked example: comparing versions.</b> The minimum is 13. Alice reports 13.4: 13 equals 13, then .4 is above nothing, so she passes. Bob reports 10.1: 10 is below 13, so he fails. Versions are compared number by number, not as text; as text "9.6" would sort after "13" because "9" is greater than "1". Duo policies use OS release levels and support status, so you choose the minimum from a list instead of typing strings.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating a perfect policy and never attaching it to the application, or attaching it to the wrong application. The policy page looks right, logins still behave the old way, and the administrator blames Duo. Always check the Applications page for the policy column.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device health checks the <b>state</b> of a device; trusted endpoints check <b>ownership or management</b>. Custom policies override the global policy only for the settings they define. A denied device never receives an MFA prompt because deny conditions are evaluated first.</p></div>

<div class="scn"><h4>The policy that blocked the CEO on a Monday</h4><p>An administrator set the global policy to block every OS below the newest release on a Friday afternoon. On Monday, a third of laptops, including the CEO's, were denied at every application. The fix was to move the strict OS rule into a custom policy for the finance and HR applications, set the global policy to <i>warn</i> for out-of-date systems with a two-week grace period, and announce the date.</p><p><b>Lesson:</b> roll out device-health rules with warn first, then block, and keep the strictest rules for the most sensitive applications.</p></div>

<div class="iv"><p class="q">"A user says Duo denies them but their colleague on the same app is fine. How do you investigate?"</p><p>Strong answer: open the authentication log for that user and read the deny reason; check which policy applies (global, application or group policy); compare Device Insight for both users (OS version, encryption, firewall, trusted endpoint status); check location and enrollment. Fix the device or enrollment rather than weakening the policy, and confirm with a fresh login.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies: global baseline, custom policy per application, group policy per user group; the most specific wins.</li>
<li>A policy can check new-user handling, factors, location, OS and browser versions, device health and trusted endpoints.</li>
<li>Device health is about state; trusted endpoints are about ownership. Strict apps require both.</li>
<li>Deny checks run before the factor; the log shows the first failed check, Device Insight shows all facts.</li>
<li>A policy only works after it is attached to the application.</li>
</ul></div>
`,hi:`
<p>Achha nightclub bouncer ek chhoti list fixed order mein check karta hai. Kya aap aaj raat ki guest list mein ho? Kya aapka ID asli hai aur aapki umar kaafi hai? Kya aapke kapde jagah ke hisaab se hain? Sirf sab jawab haan hon tabhi wristband milta hai. Alag darwaza, maan lo VIP room, ki list aur strict hoti hai. Duo <b>Adaptive Access policies</b> wahi list hain, ek baar likhi aur har application se judi, taaki finance system canteen menu se zyada strict ho sake.</p>

<h3>Policies kahan rehti hain: hierarchy</h3>
<ul>
<li><b>Global Policy</b>: default mein har application par lagti hai. Yeh baseline hai: jaise sabko MFA use karna hai aur naye users ko enroll karna hai.</li>
<li><b>Custom (application) policy</b>: ek ya zyada applications se judi hoti hai aur jo global settings define karti hai unhe override karti hai. Jo chhod deti hai woh global policy se inherit hota hai.</li>
<li><b>Group policy</b>: application ke andar specific user groups par lagti hai, jaise administrators ke liye stricter rule ya pilot group ke liye looser.</li>
</ul>
<p>Sabse specific policy jeetti hai. Jab login galat lage, pehle hamesha poochho: is application par is user par asal mein kaunsi policy lagi?</p>

<h3>Policy kya check kar sakti hai</h3>
<table class="cmp"><tr><th>Section</th><th>Kya control karta hai</th></tr>
<tr><td>New user policy</td><td>Require enrollment, bina 2FA allow, ya un-enrolled users deny</td></tr>
<tr><td>Authentication policy</td><td>MFA enforce, 2FA bypass, ya access poori tarah deny</td></tr>
<tr><td>User location aur authorized networks</td><td>Country ke hisaab se allow, MFA require, ya deny; known networks se MFA skip ya require</td></tr>
<tr><td>Authentication methods</td><td>Kaunse factors allowed hain (jaise sirf passkeys aur Verified Push)</td></tr>
<tr><td>Operating systems aur browsers</td><td>Minimum version se neeche ya support se bahar hone par warn ya block</td></tr>
<tr><td>Device health (Duo Desktop)</td><td>Host firewall, disk encryption, screen lock password, security agent require</td></tr>
<tr><td>Trusted endpoints</td><td>Sirf woh devices allow jo managed saabit hon, certificate ya MDM / EDR integration se</td></tr>
<tr><td>Remembered devices</td><td>Us browser ya device par successful MFA kitni der yaad rahe</td></tr></table>

<h3>Device health banaam trusted endpoints</h3>
<p>Yeh dono aksar confuse hote hain. <b>Device health</b> poochhta hai <i>kya yeh device achhi haalat mein hai?</i> Duo Desktop app OS version, firewall state aur encryption jaise facts report karta hai, aur policy block ya warn karti hai. <b>Trusted endpoints</b> poochhta hai <i>kya yeh device hamara hai?</i> Duo company-issued certificate check karta hai ya integrated management tool (Intune ya Jamf jaisa MDM, ya Secure Endpoint jaisa EDR) se poochhta hai ki device registered hai ya nahi. Personal laptop bilkul healthy hokar bhi trusted nahi ho sakta; corporate laptop trusted hokar bhi unhealthy ho sakta hai kyunki usne updates miss kiye. Strict applications aam taur par dono maangti hain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Duo policy evaluation order">
<rect x="10" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">Enrolled?</text>
<rect x="170" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="240" y="47" text-anchor="middle" class="svg-ink" font-size="12">Location OK?</text>
<rect x="330" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="400" y="47" text-anchor="middle" class="svg-ink" font-size="12">Device healthy?</text>
<rect x="490" y="20" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="12">Factor maango</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="310" y1="42" x2="330" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<rect x="170" y="150" width="300" height="50" rx="8" fill="#fed7aa"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">Reason ke saath DENY</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">log + Trust Monitor mein dikhe</text>
<line x1="80" y1="64" x2="200" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="240" y1="64" x2="290" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="400" y1="64" x2="380" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="110" y="115" class="svg-accent" font-size="12">nahi</text><text x="270" y="115" class="svg-accent" font-size="12">nahi</text><text x="395" y="115" class="svg-accent" font-size="12">nahi</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Pehla failed check evaluation khatam karta hai; factor sirf aakhir mein maanga jaata hai.</text>
</svg><p class="cap">Deny checks second factor offer hone se pehle chalte hain, isliye unhealthy device ko push dikhta hi nahi.</p></div>

<h3>Lab walk-through: Duo MFA plus device-health policy</h3>
<p>Lab <code>app.nwk.lab</code> ko protect karta hai. Do users pehle se Duo Push ke saath enrolled hain: <b>alice</b> macOS 13.4 par disk encryption ke saath, aur <b>bob</b> Windows 10.1 par bina encryption. Pehle <b>Duo → Device Insight</b> dekho taaki pata ho ki policy kya dekhegi:</p>
<pre class="out">User   OS version  Encrypted  Firewall  Country
alice  13.4        Yes        Yes       IN
<span class="hl">bob    10.1        No         Yes       IN</span></pre>
<ol>
<li><b>Duo → Policies → New policy.</b> Naam <code>Zero-Trust</code> rakho, New user ko <i>Require enrollment</i> par rehne do, MFA ko <i>Duo Push</i> set karo. Nayi policy card par <b>Min OS version</b> ko <code>13</code> set karo aur <b>Require disk encryption</b> tick karo.</li>
<li><b>Duo → Applications.</b> <code>app.nwk.lab</code> ki row mein Policy drop-down ko <code>Zero-Trust</code> karo. Jab tak yeh nahi karte, policy exist karti hai par kuch protect nahi karti.</li>
<li>PC1 par alice ki tarah login karo aur push approve karo (output chapter 3 mein dikhaya hai): <code>login app.nwk.lab alice</code>, phir <code>duo-push approve alice</code>.</li>
<li>Ab bob try karo:</li>
</ol>
<pre class="out">PC1&gt; login app.nwk.lab bob
<span class="hl">Duo: access to app.nwk.lab DENIED for bob — Device health: disk encryption is off.</span></pre>
<p>Bob <b>do</b> checks fail karta hai, purana OS aur missing encryption, par log line ek hi reason deti hai: evaluation pehle failure par ruk jaata hai. Isiliye aapko log ke saath Device Insight bhi padhna chahiye, aur isiliye lab answer mein <i>os</i> ya <i>encryption</i> dono accept karta hai. Wahi denial <b>Duo → Authentication Log</b> mein result <code>deny</code> ke saath, aur <b>Duo → Trust Monitor</b> mein surfaced denied attempt ki tarah dikhta hai. Bob ka sahi fix remediation hai (OS update, encryption on), policy kamzor karna kabhi nahi.</p>

<div class="eg"><p><b>Worked example: versions compare karna.</b> Minimum 13 hai. Alice 13.4 report karti hai: 13 barabar 13, phir .4 kuch nahi se upar, isliye woh pass. Bob 10.1 report karta hai: 10 13 se neeche, isliye fail. Versions number by number compare hote hain, text ki tarah nahi; text ki tarah "9.6" "13" ke baad sort hoga kyunki "9" "1" se bada hai. Duo policies OS release levels aur support status use karti hain, isliye aap strings type karne ki jagah list se minimum chunte ho.</p></div>

<div class="warn"><p><b>Common galti.</b> Perfect policy banana aur use kabhi application se na jodna, ya galat application se jodna. Policy page sahi dikhta hai, logins purane tarike se chalte rehte hain, aur administrator Duo ko blame karta hai. Hamesha Applications page par policy column check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Device health device ki <b>state</b> check karta hai; trusted endpoints <b>ownership ya management</b> check karte hain. Custom policies global policy ko sirf unhi settings ke liye override karti hain jo woh define karti hain. Denied device ko kabhi MFA prompt nahi milta kyunki deny conditions pehle evaluate hoti hain.</p></div>

<div class="scn"><h4>Woh policy jisne Monday ko CEO ko block kiya</h4><p>Ek administrator ne Friday dopahar global policy ko newest release se neeche har OS block karne par set kar diya. Monday ko ek-tihaai laptops, CEO ka bhi, har application par deny hue. Fix tha strict OS rule ko finance aur HR applications ki custom policy mein le jaana, global policy ko out-of-date systems ke liye do hafte ke grace period ke saath <i>warn</i> par set karna, aur date announce karna.</p><p><b>Seekh:</b> device-health rules pehle warn ke saath roll out karo, phir block, aur sabse strict rules sabse sensitive applications ke liye rakho.</p></div>

<div class="iv"><p class="q">"User kehta hai Duo use deny karta hai par same app par uska colleague theek hai. Aap kaise investigate karoge?"</p><p>Strong answer: us user ka authentication log kholo aur deny reason padho; check karo kaunsi policy lagti hai (global, application ya group policy); dono users ka Device Insight compare karo (OS version, encryption, firewall, trusted endpoint status); location aur enrollment check karo. Policy kamzor karne ki jagah device ya enrollment fix karo, aur fresh login se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies: global baseline, har application ki custom policy, har user group ki group policy; sabse specific jeetti hai.</li>
<li>Policy new-user handling, factors, location, OS aur browser versions, device health aur trusted endpoints check kar sakti hai.</li>
<li>Device health state ke baare mein hai; trusted endpoints ownership ke baare mein. Strict apps dono maangti hain.</li>
<li>Deny checks factor se pehle chalte hain; log pehla failed check dikhata hai, Device Insight saare facts.</li>
<li>Policy tabhi kaam karti hai jab woh application se judi ho.</li>
</ul></div>
`}};export{e as default};