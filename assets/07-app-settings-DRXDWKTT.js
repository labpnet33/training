var e={id:`app-settings`,h:{en:`GlobalProtect app settings and connect methods`,hi:`GlobalProtect app settings aur connect methods`},body:{en:`
<p>The GlobalProtect app is configured from the portal. You decide when it connects, how long a login lasts, and what happens when the user is idle. These settings change the daily experience of every employee, so they matter as much as the tunnel itself.</p>

<h3>Analogy: a door that opens automatically, or only on request</h3>
<p>Some office doors open as soon as you arrive (always on). Others open only if you press the bell (on demand). A few open for night staff before they even sign in (pre-logon). Connect methods decide how that door behaves for your laptop users.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Connect methods">
<rect x="20" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="12">User-logon</text><text x="90" y="74" text-anchor="middle" class="svg-muted" font-size="11">(Always On)</text>
<rect x="180" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="12">Pre-logon</text><text x="250" y="74" text-anchor="middle" class="svg-muted" font-size="11">before sign-in</text>
<rect x="340" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="410" y="56" text-anchor="middle" class="svg-ink" font-size="12">On-demand</text><text x="410" y="74" text-anchor="middle" class="svg-muted" font-size="11">user clicks Connect</text>
<rect x="500" y="30" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="12">Pre-logon then</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">On-demand</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Four connect methods</text>
<text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">User-logon (Always On) is the default method</text>
</svg><p class="cap">The four connect methods named in the documentation.</p></div>

<h3>Connect methods</h3>
<table class="cmp"><tr><th>Method</th><th>Behaviour</th><th>Typical use</th></tr>
<tr><td>User-logon (Always On)</td><td>Connects after the user signs in to the device</td><td>Most laptops; default</td></tr>
<tr><td>Pre-logon</td><td>Connects before the user signs in</td><td>Devices managed even at the sign-in screen</td></tr>
<tr><td>On-demand</td><td>User starts it manually</td><td>Occasional use, contractors</td></tr>
<tr><td>Pre-logon then On-demand</td><td>Pre-logon first, then on demand</td><td>Mixed usage</td></tr>
</table>

<h3>Lifetimes and timers</h3>
<p>The documentation names these app settings and defaults:</p>
<ul>
<li><b>Authentication Override</b> (cookie): off by default. When used, the cookie lifetime default is <b>24 hours</b>, so users do not re-authenticate each time.</li>
<li><b>Login Lifetime:</b> 30 days.</li>
<li><b>Inactivity Logout:</b> 180 minutes (range 5 to 43,200).</li>
<li><b>Session Expiry Advance Notice:</b> 30 minutes before the session ends.</li>
</ul>
<p>The app also has a Troubleshooting settings group. The lab does not model the client log files.</p>

<h3>Where to configure</h3>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; GlobalProtect App</td></tr>
<tr><td>Panorama</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
</table>
<pre class="out">GlobalProtect App settings (lab console view)
Connect Method           <span class="hl">User-logon (Always On)</span>
Authentication Override  Off
Login Lifetime           30 days
Inactivity Logout        180 minutes
Session Expiry Notice    30 minutes
</pre>

<h3>Security thinking</h3>
<p>Short lifetimes reduce the risk of a stolen laptop. Long lifetimes reduce user annoyance. Authentication Override reduces prompts but stores a cookie, so use it with care and combine it with strong device controls. A defender chooses values based on risk, not on habit.</p>

<div class="eg"><p><b>Worked example.</b> A bank sets Inactivity Logout to 30 minutes and Login Lifetime to 7 days for staff handling payments, accepting more sign-ins. A design agency leaves the defaults (180 minutes and 30 days). Both use User-logon (Always On), because the staff need access every day. Contractors use On-demand to avoid a permanent tunnel on personal devices.</p></div>

<h3>A rollout plan for app settings</h3>
<p>Do not change timers for everyone at once. Pick a pilot group of ten users, apply the new values, and watch the help desk for a week. Compare the number of re-authentication calls before and after. If the numbers are acceptable, extend to the next group. Keep a written record of the old and new values so that you can revert quickly.</p>
<p>Also decide who owns each setting. The security team usually owns lifetimes and inactivity, while the network team owns the connect method. A clear owner prevents surprise changes.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Choosing On-demand for staff and then wondering why users are unprotected. (2) Enabling Authentication Override without understanding the cookie lifetime. (3) Setting a very short inactivity timer and flooding the help desk. (4) Editing the wrong template on Panorama.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default connect method is User-logon (Always On), not On-demand. Remember the numbers 24 hours, 30 days, 180 minutes and 30 minutes.</p></div>

<div class="scn"><h4>Everybody logs in every hour</h4><p>After a settings change, staff complained that they were asked to sign in repeatedly. The Inactivity Logout had been set to 5 minutes, the lowest allowed value, during a test and never restored. Restoring 180 minutes and pushing ended the complaints.</p><p><b>Lesson:</b> note original values before testing, and revert test settings.</p></div>

<div class="iv"><p class="q">"Which connect method would you pick for company laptops?"</p><p>Strong answer: User-logon (Always On) as the default, so protection is automatic. Pre-logon if devices need connectivity before sign-in. On-demand for occasional or personal devices. Set lifetimes and inactivity to match risk.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four connect methods; User-logon (Always On) is the default.</li>
<li>Defaults: cookie 24 hours (override off), login lifetime 30 days, inactivity 180 minutes, notice 30 minutes.</li>
<li>Inactivity range is 5 to 43,200 minutes.</li>
<li>Paths: GlobalProtect App in SCM; Default App under the Mobile_User_Template on Panorama.</li>
<li>Choose values by risk and user experience.</li>
</ul></div>
`,hi:`
<p>GlobalProtect app portal se configure hota hai. Aap decide karte ho ki woh kab connect hoga, login kitni der chalega, aur user idle ho to kya hoga. Yeh settings har employee ka daily experience badalti hain, isliye tunnel jitni hi matter karti hain.</p>

<h3>Analogy: darwaza jo apne aap khulta hai, ya sirf request par</h3>
<p>Kuch office doors aapke aate hi khul jaate hain (always on). Kuch tabhi khulte hain jab aap bell dabate ho (on demand). Kuch night staff ke liye sign in karne se pehle hi khul jaate hain (pre-logon). Connect methods decide karte hain ki aapke laptop users ke liye woh darwaza kaise behave karega.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Connect methods">
<rect x="20" y="30" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="90" y="56" text-anchor="middle" class="svg-ink" font-size="12">User-logon</text><text x="90" y="74" text-anchor="middle" class="svg-muted" font-size="11">(Always On)</text>
<rect x="180" y="30" width="140" height="60" rx="8" fill="#bae6fd"/><text x="250" y="56" text-anchor="middle" class="svg-ink" font-size="12">Pre-logon</text><text x="250" y="74" text-anchor="middle" class="svg-muted" font-size="11">sign-in se pehle</text>
<rect x="340" y="30" width="140" height="60" rx="8" fill="#fde68a"/><text x="410" y="56" text-anchor="middle" class="svg-ink" font-size="12">On-demand</text><text x="410" y="74" text-anchor="middle" class="svg-muted" font-size="11">user Connect dabata hai</text>
<rect x="500" y="30" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="560" y="56" text-anchor="middle" class="svg-ink" font-size="12">Pre-logon phir</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="11">On-demand</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Chaar connect methods</text>
<text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">User-logon (Always On) default method hai</text>
</svg><p class="cap">Documentation mein named chaar connect methods.</p></div>

<h3>Connect methods</h3>
<table class="cmp"><tr><th>Method</th><th>Behaviour</th><th>Typical use</th></tr>
<tr><td>User-logon (Always On)</td><td>User device mein sign in kare tab connect hota hai</td><td>Zyadatar laptops; default</td></tr>
<tr><td>Pre-logon</td><td>User sign in karne se pehle connect hota hai</td><td>Sign-in screen par bhi managed devices</td></tr>
<tr><td>On-demand</td><td>User manually start karta hai</td><td>Kabhi kabhi use, contractors</td></tr>
<tr><td>Pre-logon then On-demand</td><td>Pehle pre-logon, phir on demand</td><td>Mixed usage</td></tr>
</table>

<h3>Lifetimes aur timers</h3>
<p>Documentation yeh app settings aur defaults batati hai:</p>
<ul>
<li><b>Authentication Override</b> (cookie): default off. Use ho to cookie lifetime default <b>24 hours</b> hota hai, taaki users har baar re-authenticate na karein.</li>
<li><b>Login Lifetime:</b> 30 days.</li>
<li><b>Inactivity Logout:</b> 180 minutes (range 5 se 43,200).</li>
<li><b>Session Expiry Advance Notice:</b> session khatam hone se 30 minutes pehle.</li>
</ul>
<p>App mein ek Troubleshooting settings group bhi hai. Lab client log files ko model nahi karta.</p>

<h3>Kahan configure karein</h3>
<table class="cmp"><tr><th>Tool</th><th>Path</th></tr>
<tr><td>SCM</td><td>Mobile Users &gt; GlobalProtect &gt; GlobalProtect App</td></tr>
<tr><td>Panorama</td><td>Mobile_User_Template &gt; Network &gt; GlobalProtect &gt; Portals &gt; GlobalProtect_Portal &gt; Agent &gt; Default App</td></tr>
</table>
<pre class="out">GlobalProtect App settings (lab console view)
Connect Method           <span class="hl">User-logon (Always On)</span>
Authentication Override  Off
Login Lifetime           30 days
Inactivity Logout        180 minutes
Session Expiry Notice    30 minutes
</pre>

<h3>Security soch</h3>
<p>Chhoti lifetimes chori hue laptop ka risk kam karti hain. Lambi lifetimes user ki pareshani kam karti hain. Authentication Override prompts kam karta hai lekin ek cookie store karta hai, isliye dhyan se use karo aur strong device controls ke saath jodo. Defender values risk ke hisaab se chunta hai, aadat se nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ek bank payments sambhalne wale staff ke liye Inactivity Logout 30 minutes aur Login Lifetime 7 days rakhti hai, zyada sign-ins accept karke. Ek design agency defaults (180 minutes aur 30 days) rakhti hai. Dono User-logon (Always On) use karte hain, kyunki staff ko roz access chahiye. Contractors personal devices par permanent tunnel se bachne ke liye On-demand use karte hain.</p></div>

<h3>App settings ka rollout plan</h3>
<p>Timers sabke liye ek saath mat badlo. Das users ka pilot group chuno, naye values lagao, aur ek hafte help desk par nazar rakho. Pehle aur baad ki re-authentication calls ki sankhya compare karo. Numbers acceptable hon to agle group tak badhao. Purane aur naye values ka likhit record rakho taaki jaldi revert kar sako.</p>
<p>Yeh bhi decide karo ki har setting kiski hai. Security team aam taur par lifetimes aur inactivity ki owner hoti hai, jabki network team connect method ki. Clear owner se achanak changes nahi hote.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Staff ke liye On-demand chunna aur phir sochna ki users unprotected kyun hain. (2) Cookie lifetime samjhe bina Authentication Override enable karna. (3) Bahut chhota inactivity timer set karke help desk ko flood karna. (4) Panorama par galat template edit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default connect method User-logon (Always On) hai, On-demand nahi. Numbers yaad rakho: 24 hours, 30 days, 180 minutes aur 30 minutes.</p></div>

<div class="scn"><h4>Sab log har ghante login kar rahe hain</h4><p>Settings change ke baad staff ne shikayat ki ki unse baar baar sign in karne ko kaha ja raha hai. Test ke dauraan Inactivity Logout 5 minutes par set kiya gaya tha, jo sabse chhoti allowed value hai, aur kabhi restore nahi hua. 180 minutes restore karke push karne se shikayatein band ho gayi.</p><p><b>Seekh:</b> test se pehle original values note karo, aur test settings revert karo.</p></div>

<div class="iv"><p class="q">"Company laptops ke liye kaunsa connect method chunoge?"</p><p>Strong answer: default ke roop mein User-logon (Always On), taaki protection automatic ho. Devices ko sign-in se pehle connectivity chahiye to Pre-logon. Kabhi kabhi ya personal devices ke liye On-demand. Lifetimes aur inactivity risk ke hisaab se set karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar connect methods; User-logon (Always On) default hai.</li>
<li>Defaults: cookie 24 hours (override off), login lifetime 30 days, inactivity 180 minutes, notice 30 minutes.</li>
<li>Inactivity range 5 se 43,200 minutes hai.</li>
<li>Paths: SCM mein GlobalProtect App; Panorama par Mobile_User_Template ke neeche Default App.</li>
<li>Values risk aur user experience ke hisaab se chuno.</li>
</ul></div>
`}};export{e as default};