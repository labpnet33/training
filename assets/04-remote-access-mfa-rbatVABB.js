var e={id:`remote-access-mfa`,h:{en:`Remote access and the second factor (2FA/MFA)`,hi:`Remote access aur second factor (2FA/MFA)`},body:{en:`
<p>A site-to-site VPN joins two offices. A <b>remote access VPN</b> lets one person, working from home or a hotel, join the office network. The difference is the question the gateway must answer: not "which site are you?" but "<b>who are you?</b>".</p>

<h3>Analogy: the staff entrance with a badge and a PIN</h3>
<p>The head office has a side entrance for staff who work outside. A guard checks two things: your badge (something you have) and your PIN (something you know). A stolen badge alone fails. A guessed PIN alone fails. Needing both is the idea of multi-factor authentication.</p>

<h3>The three factor families</h3>
<table class="cmp"><tr><th>Family</th><th>Examples</th></tr>
<tr><td>Something you know</td><td>Password, PIN</td></tr>
<tr><td>Something you have</td><td>Phone app code, hardware token, smart card</td></tr>
<tr><td>Something you are</td><td>Fingerprint, face</td></tr>
</table>
<p><b>2FA</b> means two factors; <b>MFA</b> means two or more. A password plus a code from a phone app is the common pair. Passwords leak through phishing and reuse, so a second factor limits the damage of one stolen secret. This is a defensive control that every internet-facing login should have.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Remote login steps">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">Remote user</text>
<rect x="160" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="215" y="62" text-anchor="middle" class="svg-ink" font-size="13">Group check</text><text x="215" y="79" text-anchor="middle" class="svg-muted" font-size="12">remote-staff</text>
<rect x="310" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="365" y="70" text-anchor="middle" class="svg-ink" font-size="13">Password</text>
<rect x="460" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="70" text-anchor="middle" class="svg-ink" font-size="13">Code</text>
<rect x="570" y="40" width="60" height="50" rx="8" fill="#fed7aa"/><text x="600" y="70" text-anchor="middle" class="svg-ink" font-size="13">Pool</text>
<line x1="120" y1="65" x2="160" y2="65" stroke="#64748b"/><line x1="270" y1="65" x2="310" y2="65" stroke="#64748b"/><line x1="420" y1="65" x2="460" y2="65" stroke="#64748b"/><line x1="540" y1="65" x2="570" y2="65" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">A failure at any step ends the login</text>
</svg><p class="cap">The login test walks through these steps in order.</p></div>

<h3>What the model contains</h3>
<p>In the SMC database of the lab, a <b>user</b> element has a group, a password and an MFA flag. The remote access settings of the VPN name the engine that accepts logins, whether the service is enabled, whether MFA is required, which user group may connect, and an address pool for connecting users. In words:</p>
<ul>
<li><b>Engine:</b> the gateway users connect to, for example NK-HQ-FW.</li>
<li><b>Group:</b> only users in this group may log in, for example remote-staff.</li>
<li><b>Password:</b> the first factor.</li>
<li><b>MFA:</b> when required, the user must be enrolled and supply the second factor.</li>
<li><b>Pool:</b> addresses handed to connected users; it must not overlap any real network.</li>
</ul>

<div class="note"><p><b>What the simulator does.</b> No VPN client is simulated. The lab tests a login in a console tool on the Tools page: you give a user name, password and, if needed, a code. For users enrolled in MFA the lab accepts the practice code 123456. This is only a training value; real systems use changing codes from an authenticator and never a fixed value.</p></div>

<h3>Working through the test</h3>
<pre class="out">CONFIG Tools - remote access login test (illustrative layout)
engine : NK-HQ-FW        service: enabled   MFA required: yes
user   : asha            group : remote-staff
step 1 password ........ accepted
step 2 second factor ... <span class="hl">missing</span>
result : <span class="hl">login failed (second factor required)</span>

user   : asha            code  : 123456
step 1 password ........ accepted
step 2 second factor ... accepted
result : login accepted, pool address assigned</pre>
<p>Read the steps in order. A failure at step 1 is a password or user problem. A failure at step 2 means the user is not enrolled or sent no valid code. A failure before step 1 usually means the user is outside the permitted group, or the service is disabled on the engine.</p>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-4. The remote access service for NK-HQ-FW is enabled for group remote-staff with MFA required. User asha is in the group but her MFA flag is off, so she is not enrolled. Her login fails at the second factor. The fix has two parts: enrol her for MFA in the user element, and Install Policy on NK-HQ-FW so the engine holds the current settings. Run the login test again with the practice code and read the new result. Turning MFA off for everyone to make the test pass would be the wrong fix, because it removes the protection that the requirement exists to give.</p></div>

<h3>Rules for remote users</h3>
<p>After a successful login the user sits in the pool. Access rules still apply. A rule whose auth field names a user group matches only a source that has authenticated as a member of that group. Write rules for the minimum: the group reaches the file server and the ticketing site, not the whole HQ LAN. Log them at a useful level so you can audit who connected.</p>

<div class="note"><p><b>Reference configuration (not run in the simulator).</b> A real deployment uses a VPN client on the user's laptop (IPsec or SSL VPN), a user directory or RADIUS server for accounts, and an authenticator app or token for the second factor. Client features, supported directories and factor types depend on the release, so check the documentation for your NGFW version. The ideas you practise here (group, password, second factor, pool, least access) are the same.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sharing one account between several people. Using the same password as for email. Putting the pool in a range that overlaps a real LAN. Allowing the remote group to reach everything. Disabling MFA to make a login work.</p></div>
<div class="exam"><p><b>Exam trap.</b> MFA is about the user login, not the tunnel between sites. A site-to-site VPN has no user factor; it uses gateway authentication with the pre-shared key.</p></div>

<div class="scn"><h4>The contractor who could not log in</h4><p>A contractor started on Monday and called the help desk: "Password is right, still rejected." The login test showed password accepted and second factor missing, because MFA was required but she had never enrolled a device. The help desk enrolled her, an engineer installed the policy on the HQ engine, and the test passed. Nobody suggested switching MFA off, which kept the control intact.</p><p><b>Lesson:</b> read the step that failed. The message tells you which factor is missing.</p></div>

<div class="iv"><p class="q">"Why add MFA to a remote access VPN, and how would you troubleshoot a user who fails?"</p><p>Strong answer: a password alone is easily phished or reused, so a second factor from a different family blocks most account takeover. Troubleshoot in order: service enabled on the engine, user in the permitted group, password step, then enrolment and code for the second factor, and finally the policy was installed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote access answers "who are you?" with group, password and optionally a second factor.</li>
<li>The three factor families are know, have and are; MFA uses at least two.</li>
<li>The lab tests logins in a console tool; no client is simulated and 123456 is a practice code only.</li>
<li>Enrol users and install the policy; never disable MFA to fix a login.</li>
<li>Give the remote group least access with auth-based rules and logging.</li>
</ul></div>
`,hi:`
<p>Site-to-site VPN do offices ko jodta hai. <b>Remote access VPN</b> ek insaan ko, jo ghar ya hotel se kaam kar raha hai, office network se jodta hai. Fark woh sawaal hai jiska jawab gateway ko dena hai: "aap kaun si site ho?" nahi balki "<b>aap kaun ho?</b>".</p>

<h3>Analogy: badge aur PIN wala staff entrance</h3>
<p>Head office ka ek side entrance hai un staff ke liye jo bahar kaam karte hain. Guard do cheezein check karta hai: aapka badge (jo aapke paas hai) aur aapka PIN (jo aap jaante ho). Sirf chori hua badge fail hota hai. Sirf guess kiya PIN fail hota hai. Dono ki zaroorat hona hi multi-factor authentication ka idea hai.</p>

<h3>Teen factor families</h3>
<table class="cmp"><tr><th>Family</th><th>Examples</th></tr>
<tr><td>Jo aap jaante ho</td><td>Password, PIN</td></tr>
<tr><td>Jo aapke paas hai</td><td>Phone app code, hardware token, smart card</td></tr>
<tr><td>Jo aap ho</td><td>Fingerprint, face</td></tr>
</table>
<p><b>2FA</b> matlab do factors; <b>MFA</b> matlab do ya zyada. Password ke saath phone app ka code common pair hai. Passwords phishing aur reuse se leak hote hain, isliye second factor ek chori hui secret ka nuksaan limit karta hai. Yeh ek defensive control hai jo har internet-facing login mein hona chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Remote login ke steps">
<rect x="10" y="40" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">Remote user</text>
<rect x="160" y="40" width="110" height="50" rx="8" fill="#fde68a"/><text x="215" y="62" text-anchor="middle" class="svg-ink" font-size="13">Group check</text><text x="215" y="79" text-anchor="middle" class="svg-muted" font-size="12">remote-staff</text>
<rect x="310" y="40" width="110" height="50" rx="8" fill="#bae6fd"/><text x="365" y="70" text-anchor="middle" class="svg-ink" font-size="13">Password</text>
<rect x="460" y="40" width="80" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="70" text-anchor="middle" class="svg-ink" font-size="13">Code</text>
<rect x="570" y="40" width="60" height="50" rx="8" fill="#fed7aa"/><text x="600" y="70" text-anchor="middle" class="svg-ink" font-size="13">Pool</text>
<line x1="120" y1="65" x2="160" y2="65" stroke="#64748b"/><line x1="270" y1="65" x2="310" y2="65" stroke="#64748b"/><line x1="420" y1="65" x2="460" y2="65" stroke="#64748b"/><line x1="540" y1="65" x2="570" y2="65" stroke="#64748b"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="13">Kisi bhi step par failure se login ruk jaata hai</text>
</svg><p class="cap">Login test in steps ko order mein chalata hai.</p></div>

<h3>Model mein kya hai</h3>
<p>Lab ke SMC database mein ek <b>user</b> element ka group, password aur MFA flag hota hai. VPN ki remote access settings batati hain kaun sa engine login accept karta hai, service enabled hai ya nahi, MFA required hai ya nahi, kaun sa user group connect kar sakta hai, aur connect hone wale users ke liye address pool. Shabdon mein:</p>
<ul>
<li><b>Engine:</b> woh gateway jis par users connect karte hain, jaise NK-HQ-FW.</li>
<li><b>Group:</b> sirf is group ke users login kar sakte hain, jaise remote-staff.</li>
<li><b>Password:</b> pehla factor.</li>
<li><b>MFA:</b> required ho to user enrolled hona chahiye aur second factor dena hoga.</li>
<li><b>Pool:</b> connected users ko diye jaane wale addresses; yeh kisi real network se overlap nahi hona chahiye.</li>
</ul>

<div class="note"><p><b>Simulator kya karta hai.</b> Koi VPN client simulate nahi hota. Lab Tools page ke console tool mein login test karta hai: aap user name, password aur zaroorat ho to code dete ho. MFA mein enrolled users ke liye lab practice code 123456 accept karta hai. Yeh sirf training value hai; real systems authenticator se badalne wale codes use karte hain, kabhi fixed value nahi.</p></div>

<h3>Test ko step by step dekhna</h3>
<pre class="out">CONFIG Tools - remote access login test (illustrative layout)
engine : NK-HQ-FW        service: enabled   MFA required: yes
user   : asha            group : remote-staff
step 1 password ........ accepted
step 2 second factor ... <span class="hl">missing</span>
result : <span class="hl">login failed (second factor required)</span>

user   : asha            code  : 123456
step 1 password ........ accepted
step 2 second factor ... accepted
result : login accepted, pool address assigned</pre>
<p>Steps order mein padho. Step 1 par failure matlab password ya user ki problem. Step 2 par failure matlab user enrolled nahi hai ya valid code nahi bheja. Step 1 se pehle failure aam taur par yeh batata hai ki user permitted group ke bahar hai, ya engine par service disabled hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab fp-vpn-4. NK-HQ-FW ki remote access service group remote-staff ke liye enabled hai aur MFA required hai. User asha group mein hai lekin uska MFA flag off hai, yaani woh enrolled nahi hai. Uska login second factor par fail hota hai. Fix ke do hisse hain: user element mein use MFA ke liye enrol karo, aur NK-HQ-FW par Install Policy karo taaki engine ke paas current settings hon. Practice code ke saath login test dobara chalao aur naya result padho. Test pass karne ke liye sab ka MFA band kar dena galat fix hoga, kyunki requirement jo protection deti hai woh hat jaati hai.</p></div>

<h3>Remote users ke rules</h3>
<p>Successful login ke baad user pool mein baithta hai. Access rules phir bhi lagte hain. Jis rule ke auth field mein user group ka naam hai woh sirf us source se match karta hai jisne us group ke member ke roop mein authenticate kiya ho. Minimum ke liye rules likho: group file server aur ticketing site tak pahunche, poore HQ LAN tak nahi. Unhe useful level par log karo taaki audit kar sako kaun connect hua.</p>

<div class="note"><p><b>Reference configuration (not run in the simulator).</b> Real deployment mein user ke laptop par VPN client (IPsec ya SSL VPN), accounts ke liye user directory ya RADIUS server, aur second factor ke liye authenticator app ya token hota hai. Client features, supported directories aur factor types release par depend karte hain, isliye check the documentation for your NGFW version. Yahan jo ideas practice karte ho (group, password, second factor, pool, least access) wahi rehte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek account kai logon mein share karna. Email wala hi password use karna. Pool ko real LAN se overlap karne wali range mein rakhna. Remote group ko sab kuch tak pahunchne dena. Login chalane ke liye MFA disable kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> MFA user login ke liye hai, sites ke beech tunnel ke liye nahi. Site-to-site VPN mein user factor nahi hota; woh pre-shared key se gateway authentication use karta hai.</p></div>

<div class="scn"><h4>Contractor jo login nahi kar paayi</h4><p>Ek contractor ne Somvar ko join kiya aur help desk ko call kiya: "Password sahi hai, phir bhi reject ho raha hai." Login test mein password accepted aur second factor missing tha, kyunki MFA required tha lekin usne koi device enrol nahi kiya tha. Help desk ne use enrol kiya, engineer ne HQ engine par policy install ki, aur test pass ho gaya. Kisi ne MFA band karne ka suggestion nahi diya, isse control bacha raha.</p><p><b>Lesson:</b> jo step fail hua use padho. Message batata hai kaun sa factor missing hai.</p></div>

<div class="iv"><p class="q">"Remote access VPN mein MFA kyun add karte ho, aur jo user fail ho use kaise troubleshoot karoge?"</p><p>Strong answer: sirf password phish ya reuse ho sakta hai, isliye alag family ka second factor zyada tar account takeover rokta hai. Order mein troubleshoot karo: engine par service enabled, user permitted group mein, password step, phir enrolment aur second factor ka code, aur aakhir mein policy install hui ya nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote access "aap kaun ho?" ka jawab group, password aur optional second factor se deta hai.</li>
<li>Teen factor families hain: know, have, are; MFA kam se kam do use karta hai.</li>
<li>Lab console tool mein logins test karta hai; koi client simulate nahi hota aur 123456 sirf practice code hai.</li>
<li>Users ko enrol karo aur policy install karo; login fix karne ke liye MFA kabhi disable mat karo.</li>
<li>Remote group ko auth-based rules aur logging ke saath least access do.</li>
</ul></div>
`}};export{e as default};