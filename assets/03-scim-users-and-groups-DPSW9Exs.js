var e={id:`scim-groups`,h:{en:`SCIM provisioning: users, groups and what happens when they are missing`,hi:`SCIM provisioning: users, groups aur jab woh missing hon`},body:{en:`
<h3>Signing in is not enough</h3>
<p>SAML tells the service who just signed in. But the service must also know the user's <b>groups</b> and whether the account still exists. Where do those come from? Either from the assertion, or, more reliably, from <b>SCIM provisioning</b>. SCIM is a standard way for the directory to push user and group records to the service automatically: create a user when HR adds one, change groups when someone moves, disable the user when they leave. Think of SAML as the gate guard checking a badge, and SCIM as the HR department keeping the guard's list up to date.</p>

<h3>What SCIM carries</h3>
<ul>
<li><b>Users</b>: user name, display name, enabled or disabled.</li>
<li><b>Groups</b>: Finance, Engineering, Sales, HR, Contractors, and which user belongs to which.</li>
<li><b>Changes over time</b>: joins, moves and leavers, pushed as they happen.</li>
</ul>
<p>The portal page <b>Identity (SAML, SCIM, users)</b> shows the SCIM switch, whether the token is valid (<code>tokenOk</code>), whether the last sync ran (<code>synced</code>) and a table of users with columns enabled, provisioned and groups.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SCIM sync">
<rect x="20" y="60" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="95" text-anchor="middle" class="svg-ink" font-size="14">Directory</text><text x="95" y="117" text-anchor="middle" class="svg-muted" font-size="12">users and groups</text>
<rect x="470" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="14">Cloud service</text><text x="545" y="117" text-anchor="middle" class="svg-muted" font-size="12">user table</text>
<line x1="170" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">SCIM push, with a token</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">create, change groups, disable</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">no valid token or sync off: the table goes stale</text>
</svg><p class="cap">SCIM keeps the service's user table in step with the directory.</p></div>

<h3>Three states you must recognise</h3>
<table class="cmp"><tr><th>State</th><th>User table shows</th><th>What the user experiences</th></tr>
<tr><td>Healthy</td><td>enabled yes, provisioned yes, groups listed</td><td>Signs in; group rules match</td></tr>
<tr><td>Not provisioned</td><td>provisioned no, groups empty</td><td>Signs in (SAML works) but every group rule misses, for example the HR rule for private access</td></tr>
<tr><td>Disabled</td><td>enabled no</td><td>Sign-in fails with 401, both web and private access stop</td></tr>
<tr><td>Missing</td><td>user not in the table</td><td>401 on sign-in</td></tr>
</table>
<p>A user with <code>provisioned: false</code> has <b>no groups</b>. They are a valid person with no membership, so the implicit deny at the end of an access policy applies. Always separate "cannot sign in" (identity failure) from "signed in, but blocked" (group or policy failure).</p>

<div class="eg"><p><b>Worked example.</b> A new HR hire joins on Monday. The directory team created the account, but SCIM sync stopped last week because the token expired. The portal shows:</p></div>
<pre class="out">Identity &gt; SCIM
Enabled ............ yes
Token .............. <span class="hl">invalid</span>
Last sync .......... failed (3 days ago)

Users        enabled  provisioned  groups
ravi         yes      yes          Finance
meena        yes      yes          Engineering
newhire      yes      <span class="hl">no</span>           (none)</pre>
<p>Fix in order: renew the token on the directory side and enter it in the portal, run sync, confirm the user shows provisioned with group HR, then ask the user to sign out and in again so a fresh session carries the groups.</p>

<h3>Offboarding is a SCIM job too</h3>
<p>When a contractor leaves, the safest action is to disable the account in the directory so SCIM pushes <code>enabled: no</code>. Then verify both paths: a web request returns 401 and a private application is unreachable. Removing a group alone is weaker, since the user could still sign in.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> SCIM changes no packets. It changes the user table the policy engine reads: which groups a user has and whether the user may sign in at all. Because rules match groups, one group change can open or close dozens of rules at once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing a missing group by writing a rule for the single user instead of repairing sync. (2) Forgetting that existing sessions keep old groups until the user signs in again. (3) Disabling the user only in the portal while the directory still re-enables it at next sync.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Why can the new hire sign in but not open the HR portal?" SAML works (identity proved), SCIM did not provision groups (authorisation has nothing to match).</p></div>

<div class="scn"><h4>The leaver who could still browse</h4><p>A contractor's contract ended on Friday. Her name was removed from a group but the account stayed active; she could still sign in and browse. The engineer disabled the account, checked that the web test returned 401 and that the file server was unreachable.</p><p><b>Lesson:</b> disable first, then prove it with evidence.</p></div>

<div class="iv"><p class="q">"What is SCIM and why do you need it if you already have SAML?"</p><p>SAML proves identity at sign-in; SCIM keeps users, groups and enabled state synchronised in advance. Without SCIM, group rules have nothing reliable to match and leavers can linger.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCIM pushes users and groups from the directory to the service.</li>
<li>Not provisioned means no groups; the user signs in but group rules miss.</li>
<li>Disabled or missing users fail sign-in with 401.</li>
<li>Offboard by disabling, then verify web and private access stop.</li>
<li>After a group change, the user signs in again for a fresh session.</li>
</ul></div>
`,hi:`
<h3>Sirf sign in kaafi nahi hai</h3>
<p>SAML service ko batata hai ki abhi kisne sign in kiya. Lekin service ko user ke <b>groups</b> aur yeh bhi jaanna hota hai ki account abhi exist karta hai ya nahi. Yeh kahan se aata hai? Ya to assertion se, ya, zyada reliable tareeke se, <b>SCIM provisioning</b> se. SCIM ek standard tareeka hai jisse directory user aur group records service ko automatically push karta hai: HR user add kare to create, koi move kare to groups badlo, koi chhode to user disable. SAML ko gate guard ka badge check karna samjho, aur SCIM ko HR department jo guard ki list update rakhta hai.</p>

<h3>SCIM kya carry karta hai</h3>
<ul>
<li><b>Users</b>: user name, display name, enabled ya disabled.</li>
<li><b>Groups</b>: Finance, Engineering, Sales, HR, Contractors, aur kaun sa user kis group mein hai.</li>
<li><b>Waqt ke saath changes</b>: joins, moves aur leavers, jaise hote hain waise push hote hain.</li>
</ul>
<p>Portal page <b>Identity (SAML, SCIM, users)</b> SCIM switch dikhata hai, token valid hai ya nahi (<code>tokenOk</code>), last sync chala ya nahi (<code>synced</code>) aur users ki table jisme enabled, provisioned aur groups columns hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="SCIM sync">
<rect x="20" y="60" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="95" text-anchor="middle" class="svg-ink" font-size="14">Directory</text><text x="95" y="117" text-anchor="middle" class="svg-muted" font-size="12">users aur groups</text>
<rect x="470" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="14">Cloud service</text><text x="545" y="117" text-anchor="middle" class="svg-muted" font-size="12">user table</text>
<line x1="170" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="12">SCIM push, token ke saath</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">create, groups change, disable</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">valid token nahi ya sync off: table purani ho jaati hai</text>
</svg><p class="cap">SCIM service ki user table ko directory ke saath step mein rakhta hai.</p></div>

<h3>Teen states jo pehchaanne hain</h3>
<table class="cmp"><tr><th>State</th><th>User table dikhati hai</th><th>User ka experience</th></tr>
<tr><td>Healthy</td><td>enabled yes, provisioned yes, groups listed</td><td>Sign in hota hai; group rules match</td></tr>
<tr><td>Not provisioned</td><td>provisioned no, groups empty</td><td>Sign in hota hai (SAML chalta hai) lekin har group rule miss, jaise private access ka HR rule</td></tr>
<tr><td>Disabled</td><td>enabled no</td><td>Sign-in 401 ke saath fail, web aur private access dono band</td></tr>
<tr><td>Missing</td><td>user table mein nahi</td><td>Sign-in par 401</td></tr>
</table>
<p><code>provisioned: false</code> wale user ke <b>koi groups nahi</b> hote. Woh valid person hai lekin membership zero, to access policy ke end ka implicit deny lagta hai. Hamesha "sign in nahi ho raha" (identity failure) aur "sign in hua, par blocked" (group ya policy failure) ko alag rakho.</p>

<div class="eg"><p><b>Worked example.</b> Monday ko naya HR hire join karta hai. Directory team ne account bana diya, lekin SCIM sync pichhle hafte token expire hone se ruk gaya. Portal dikhata hai:</p></div>
<pre class="out">Identity &gt; SCIM
Enabled ............ yes
Token .............. <span class="hl">invalid</span>
Last sync .......... failed (3 days ago)

Users        enabled  provisioned  groups
ravi         yes      yes          Finance
meena        yes      yes          Engineering
newhire      yes      <span class="hl">no</span>           (none)</pre>
<p>Order mein fix: directory side par token renew karo aur portal mein daalo, sync chalao, confirm karo ki user provisioned hai aur group HR dikhta hai, phir user se sign out aur in karwao taaki nayi session groups ke saath aaye.</p>

<h3>Offboarding bhi SCIM ka kaam hai</h3>
<p>Contractor jaaye to sabse safe action hai directory mein account disable karna taaki SCIM <code>enabled: no</code> push kare. Phir dono paths verify karo: web request 401 de aur private application unreachable ho. Sirf group hatana kamzor hai, kyunki user phir bhi sign in kar sakta hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> SCIM koi packet nahi badalta. Woh user table badalta hai jo policy engine padhta hai: user ke kaun se groups hain aur user sign in kar sakta hai ya nahi. Kyunki rules groups match karte hain, ek group change ek saath kai rules khol ya band kar sakta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Missing group ko sync repair karne ki jagah akele user ka rule likh kar theek karna. (2) Bhool jaana ki existing sessions purane groups rakhti hain jab tak user dobara sign in na kare. (3) User ko sirf portal mein disable karna jabki directory agle sync mein re-enable kar deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Naya hire sign in kar leta hai lekin HR portal kyun nahi khol pa raha?" SAML chal raha hai (identity prove), SCIM ne groups provision nahi kiye (authorisation ke paas match karne ko kuch nahi).</p></div>

<div class="scn"><h4>Leaver jo abhi bhi browse kar sakti thi</h4><p>Ek contractor ka contract Friday ko khatam hua. Uska naam ek group se hata diya gaya lekin account active raha; woh sign in karke browse kar sakti thi. Engineer ne account disable kiya, check kiya ki web test 401 deta hai aur file server unreachable hai.</p><p><b>Seekh:</b> pehle disable karo, phir evidence se prove karo.</p></div>

<div class="iv"><p class="q">"SCIM kya hai aur SAML ke hote hue iski zaroorat kyun?"</p><p>SAML sign-in par identity prove karta hai; SCIM users, groups aur enabled state ko pehle se synchronised rakhta hai. SCIM ke bina group rules ke paas match karne ko reliable cheez nahi hoti aur leavers bane rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SCIM directory se service ko users aur groups push karta hai.</li>
<li>Not provisioned matlab no groups; user sign in karta hai lekin group rules miss hote hain.</li>
<li>Disabled ya missing users 401 ke saath sign-in fail karte hain.</li>
<li>Offboard karne ke liye disable karo, phir verify karo ki web aur private access band hain.</li>
<li>Group change ke baad user dobara sign in kare taaki fresh session mile.</li>
</ul></div>
`}};export{e as default};