var e={id:`summary`,h:{en:`Summary, design checklist and where to practise`,hi:`Summary, design checklist aur practise kahan karein`},body:{en:`
<p>You have moved from "which address may talk" to "which person may talk". This last chapter pulls the module together: a map of the methods, a decision guide, a design checklist and honest advice on how to practise.</p>
<div class="note"><p><b>Honest scope note.</b> This module has <b>no labs</b> and the simulator does not run user, LDAP, RADIUS, FSSO or portal features. Everything configured here is a <b>Reference configuration (not run in the simulator)</b>. For hands-on practice of the policy ideas this module builds on (order, objects, logging, lookup, sessions, VIPs, pools), use <b>nse4-policy</b> and <b>nse4-nat</b>. For the AAA concepts around network devices, use <b>sec-aaa-mgmt</b> and <b>sec-ise</b>.</p></div>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Authentication summary map">
<rect x="10" y="20" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Local users</text>
<rect x="10" y="80" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="13">LDAP / RADIUS</text>
<rect x="10" y="140" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="165" text-anchor="middle" class="svg-ink" font-size="13">FSSO (Windows)</text>
<rect x="240" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">User groups</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">identity</text>
<rect x="450" y="60" width="180" height="80" rx="10" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text><text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">authorization, logs</text>
<line x1="180" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="180" y1="160" x2="240" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Many sources, one result: a group that a policy can name.</p></div>

<h3>Which method for which situation</h3>
<table class="cmp"><tr><th>Situation</th><th>Good fit</th><th>Why</th></tr>
<tr><td>8 staff, one site</td><td>Local users</td><td>No extra server needed</td></tr>
<tr><td>300 staff, Active Directory</td><td>LDAP or FSSO</td><td>Accounts managed once</td></tr>
<tr><td>Staff PCs, no prompts wanted</td><td>FSSO</td><td>Reuses the Windows login</td></tr>
<tr><td>Codes from a phone app</td><td>RADIUS with MFA</td><td>The server handles the second factor</td></tr>
<tr><td>Visitors, unmanaged phones</td><td>Captive portal</td><td>Browser-based, isolated policy</td></tr></table>

<h3>Design checklist</h3>
<ul>
<li>Write down who needs what, then create groups that match those needs, not people one by one.</li>
<li>Put narrow group policies above broad ones.</li>
<li>Use LDAPS where possible, a read-only bind account and a different RADIUS secret per device.</li>
<li>Give guests their own network, DNS, a narrow policy and a short timeout.</li>
<li>Keep placeholders out of production and passwords out of tickets and screenshots.</li>
<li>Log with <code>logtraffic all</code> on identity policies so evidence carries a user name.</li>
<li>Review local accounts regularly; disable rather than delete.</li>
<li>Test with a member, a non-member and an unauthenticated user.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Bind account</dt><dd>The read-only directory account the FortiGate uses to search LDAP.</dd>
<dt>cnid</dt><dd>The attribute that holds the login name in LDAP.</dd>
<dt>Shared secret</dt><dd>The key shared between the FortiGate and a RADIUS server.</dd>
<dt>Collector agent</dt><dd>The FSSO software that sends user-to-IP mappings to the FortiGate.</dd>
<dt>Captive portal</dt><dd>A login page that appears when an unauthenticated user opens a web page.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> A clinic grows from 8 to 80 staff. It starts with local users, moves staff accounts to LDAP when manual work becomes a burden, adds FSSO so doctors are not prompted on each ward PC, and keeps a captive portal for visitors. The policies never change shape: they always list groups. Only the way the group is filled changes.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Treating authentication as a replacement for network segmentation; using one method for every device type; forgetting the negative tests; leaving old accounts and test groups in policies; expecting the simulator to run these features.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the method to the situation: portal for guests, FSSO for domain PCs, RADIUS for MFA, LDAP for directory logins. And remember that identity is only half the story; the policy supplies authorization.</p></div>

<div class="scn"><h4>The audit that asked for names</h4><p>An auditor asked who accessed the payroll server last quarter. Because the policy was identity-based and logged traffic, the answer was a list of user names with times, not a list of addresses nobody could map to people. The team passed the audit without an extra investigation.</p><p><b>Lesson:</b> identity turns firewall logs into evidence of who did what.</p></div>

<div class="iv"><p class="q">"Design user authentication for a company with staff, contractors and guests."</p><p>Staff on domain PCs: FSSO with AD groups for silent login. Contractors: LDAP or RADIUS with MFA through a portal or VPN, with narrow groups and expiry. Guests: captive portal on an isolated network with DNS and internet only. Narrow group policies on top, logging on, and regular review of accounts and groups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity can come from local, LDAP, RADIUS, a portal or FSSO; the policy names the group.</li>
<li>Choose the method for the situation; layer narrow policies above broad ones.</li>
<li>Troubleshoot by layers: reach the source, prove the login, match the policy.</li>
<li>Practise the policy mechanics in nse4-policy and nse4-nat; this module is reference-only.</li>
</ul></div>
`,hi:`
<p>Aap "kaunsa address baat kar sakta hai" se "kaunsa insaan baat kar sakta hai" tak aaye hain. Yeh aakhri chapter module ko jodta hai: methods ka map, decision guide, design checklist aur practise kaise karein uski imandaar salaah.</p>
<div class="note"><p><b>Honest scope note.</b> Is module mein <b>koi lab nahi hai</b> aur simulator user, LDAP, RADIUS, FSSO ya portal features nahi chalata. Yahan jo bhi configure hua hai woh <b>Reference configuration (not run in the simulator)</b> hai. Jin policy ideas par yeh module khada hai (order, objects, logging, lookup, sessions, VIPs, pools) unki hands-on practice ke liye <b>nse4-policy</b> aur <b>nse4-nat</b> use karo. Network devices ke AAA concepts ke liye <b>sec-aaa-mgmt</b> aur <b>sec-ise</b> use karo.</p></div>

<h3>Module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Authentication summary map">
<rect x="10" y="20" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Local users</text>
<rect x="10" y="80" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="105" text-anchor="middle" class="svg-ink" font-size="13">LDAP / RADIUS</text>
<rect x="10" y="140" width="170" height="40" rx="10" fill="#bae6fd"/><text x="95" y="165" text-anchor="middle" class="svg-ink" font-size="13">FSSO (Windows)</text>
<rect x="240" y="60" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="13">User groups</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">identity</text>
<rect x="450" y="60" width="180" height="80" rx="10" fill="#bbf7d0"/><text x="540" y="95" text-anchor="middle" class="svg-ink" font-size="13">Firewall policy</text><text x="540" y="115" text-anchor="middle" class="svg-muted" font-size="12">authorization, logs</text>
<line x1="180" y1="40" x2="240" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="180" y1="160" x2="240" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="100" x2="450" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Kai sources, ek result: aisa group jise policy naam le sake.</p></div>

<h3>Kaunsi situation ke liye kaunsa method</h3>
<table class="cmp"><tr><th>Situation</th><th>Achha fit</th><th>Kyun</th></tr>
<tr><td>8 staff, ek site</td><td>Local users</td><td>Extra server nahi chahiye</td></tr>
<tr><td>300 staff, Active Directory</td><td>LDAP ya FSSO</td><td>Accounts ek baar manage hote hain</td></tr>
<tr><td>Staff PCs, prompts nahi chahiye</td><td>FSSO</td><td>Windows login reuse hota hai</td></tr>
<tr><td>Phone app ke codes</td><td>RADIUS with MFA</td><td>Server doosra factor handle karta hai</td></tr>
<tr><td>Visitors, unmanaged phones</td><td>Captive portal</td><td>Browser-based, alag policy</td></tr></table>

<h3>Design checklist</h3>
<ul>
<li>Likho ki kisko kya chahiye, phir un zaruraton ke hisaab se groups banao, logon ko ek-ek karke nahi.</li>
<li>Narrow group policies broad ke upar rakho.</li>
<li>Jahan ho sake LDAPS, read-only bind account aur har device ke liye alag RADIUS secret use karo.</li>
<li>Guests ko apna network, DNS, narrow policy aur chhota timeout do.</li>
<li>Placeholders production mein mat rakho aur passwords tickets aur screenshots se door rakho.</li>
<li>Identity policies par <code>logtraffic all</code> rakho taaki evidence mein user name ho.</li>
<li>Local accounts ka regular review karo; delete ki jagah disable karo.</li>
<li>Member, non-member aur unauthenticated user se test karo.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Bind account</dt><dd>Read-only directory account jo FortiGate LDAP search ke liye use karta hai.</dd>
<dt>cnid</dt><dd>LDAP mein woh attribute jisme login name hota hai.</dd>
<dt>Shared secret</dt><dd>FortiGate aur RADIUS server ke beech shared key.</dd>
<dt>Collector agent</dt><dd>FSSO software jo user-to-IP mappings FortiGate ko bhejta hai.</dd>
<dt>Captive portal</dt><dd>Login page jo unauthenticated user ke web page kholne par aata hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek clinic 8 se 80 staff tak badhti hai. Woh local users se shuru karti hai, haath ka kaam bojh banne par staff accounts LDAP par le jaati hai, FSSO jodti hai taaki doctors ko har ward PC par prompt na mile, aur visitors ke liye captive portal rakhti hai. Policies ka shape kabhi nahi badalta: woh hamesha groups list karti hain. Sirf group bharne ka tareeka badalta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Authentication ko network segmentation ka replacement samajhna; har device type ke liye ek hi method use karna; negative tests bhool jaana; policies mein purane accounts aur test groups chhod dena; simulator se in features ke chalne ki ummeed rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Method ko situation se milao: guests ke liye portal, domain PCs ke liye FSSO, MFA ke liye RADIUS, directory logins ke liye LDAP. Aur yaad rakho ki identity sirf aadhi kahani hai; policy authorization deti hai.</p></div>

<div class="scn"><h4>Audit jisne naam maange</h4><p>Auditor ne poochha ki pichle quarter mein payroll server tak kaun pahuncha. Policy identity-based thi aur traffic log hota tha, isliye jawab times ke saath user names ki list thi, aise addresses ki nahi jinhe koi logon se map nahi kar sakta tha. Team ne bina extra investigation ke audit pass kiya.</p><p><b>Lesson:</b> identity firewall logs ko saboot banati hai ki kisne kya kiya.</p></div>

<div class="iv"><p class="q">"Staff, contractors aur guests wali company ke liye user authentication design karo."</p><p>Domain PCs par staff: silent login ke liye AD groups ke saath FSSO. Contractors: LDAP ya RADIUS with MFA, portal ya VPN ke through, narrow groups aur expiry ke saath. Guests: isolated network par captive portal, sirf DNS aur internet ke saath. Upar narrow group policies, logging on, aur accounts aur groups ka regular review.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity local, LDAP, RADIUS, portal ya FSSO se aa sakti hai; policy group ka naam leti hai.</li>
<li>Situation ke hisaab se method chuno; narrow policies broad ke upar rakho.</li>
<li>Layers mein troubleshoot karo: source tak pahuncho, login saabit karo, policy match karo.</li>
<li>Policy mechanics nse4-policy aur nse4-nat mein practise karo; yeh module reference-only hai.</li>
</ul></div>
`}};export{e as default};