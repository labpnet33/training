var e={id:`administrators-roles-access`,h:{en:`Administrators, roles and access domains`,hi:`Administrators, roles aur access domains`},body:{en:`
<p>In an office building, not everyone has the same key. The security guard can open the main gate, the cleaner can open only the floors they clean, and the finance team can open the accounts room. Giving everyone a master key is convenient until something goes missing and nobody can tell who was inside. Administrator accounts on Panorama follow the same principle: give each person the least access that lets them do their job, and make sure each person has their own account.</p>

<h3>Why this matters more on Panorama</h3>
<p>One administrator on Panorama can change configuration for many firewalls at once. That is the benefit, and also the risk. A mistake or a stolen password on Panorama can spread much faster than one on a single firewall. So administrator design is part of a safe Panorama deployment, not an afterthought.</p>

<h3>The building blocks</h3>
<table class="tbl"><tr><th>Concept</th><th>Plain meaning</th><th>Example</th></tr>
<tr><td>Administrator account</td><td>A named login for one person (or one automation)</td><td>One account per engineer, no shared "admin"</td></tr>
<tr><td>Role</td><td>What an administrator may do: for example read-only, or change policy but not network settings</td><td>Auditor: view only</td></tr>
<tr><td>Access domain</td><td>Which device groups and templates an administrator may see and change</td><td>The Chennai team sees only the Chennai device group</td></tr>
<tr><td>Authentication method</td><td>Local password, or an external server and multi-factor authentication</td><td>Prefer a central identity system where your policy requires it</td></tr>
</table>
<p>The exact role types, the list of permissions and the way access domains are applied differ between PAN-OS versions. Check the documentation for your PAN-OS version, and design from the principle rather than from a memorised list.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Roles and domains">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Administrator</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Role (what)</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Access domain (where)</text>
<rect x="235" y="120" width="170" height="50" rx="8" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Allowed actions</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="405" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">What a person can do (role) combined with where they can do it (access domain).</p></div>

<h3>Good practice in a small team</h3>
<ul>
<li>One named account per person. Shared accounts destroy the audit trail.</li>
<li>Read-only roles for people who only look: auditors, managers, trainees.</li>
<li>Separate who may change policy from who may change network settings if your team is large enough to benefit.</li>
<li>Limit the number of full administrators and review the list regularly.</li>
<li>Keep an emergency local account stored safely, in case the external login system is down.</li>
</ul>
<p>The simulator has a single lab administrator and does not model roles or access domains; this chapter is conceptual. The Panorama-only configuration area <code>mgt-config</code> that you use in the labs to register firewalls is where Panorama keeps management settings.</p>

<div class="warn"><p><b>Common mistakes.</b> Sharing the admin password in a team chat; giving everyone full rights "for now"; forgetting to remove an engineer's account when they leave; not recording who made a change.</p></div>

<div class="scn"><h4>The intern who could push to everyone</h4><p>A new intern was given the same full-rights account as senior engineers so that they could "learn quickly". A well-meant experiment on a test rule was published to the production device group. Nothing broke, but the review showed there was no technical barrier at all. The team created a read-only role for learners and an access domain limited to the lab device group.</p><p><b>Lesson:</b> the safest accident is the one the system will not allow.</p></div>

<div class="iv"><p class="q">"How would you control who can change firewall policy through Panorama?"</p><p>Named accounts per person, roles with least privilege, access domains to limit which device groups and templates each person can see, strong or multi-factor authentication, and an audit trail. Mention that the exact features depend on the PAN-OS version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama access reaches many firewalls, so administrator design is a safety control.</li>
<li>Role = what you may do; access domain = where you may do it.</li>
<li>Use one named account per person; avoid shared logins.</li>
<li>Prefer least privilege and read-only roles for viewers.</li>
<li>Check the documentation for your PAN-OS version; the simulator does not model roles.</li>
</ul></div>
`,hi:`
<p>Office building mein sab ke paas same key nahi hoti. Security guard main gate khol sakta hai, cleaner sirf wahi floors jahan wo safai karta hai, aur finance team accounts room. Sab ko master key dena tab tak convenient hai jab tak kuch gum na ho jaye aur koi bata na sake andar kaun tha. Panorama ke administrator accounts bhi yahi principle follow karte hain: har insaan ko utna hi access do jitna uske kaam ke liye zaroori hai, aur har insaan ka apna account ho.</p>

<h3>Panorama par ye zyada kyun matter karta hai</h3>
<p>Panorama par ek administrator kai firewalls ki configuration ek saath badal sakta hai. Yahi benefit hai, aur yahi risk bhi. Panorama par ek galti ya chori hua password ek single firewall ke mukable bahut tezi se phail sakta hai. Isliye administrator design safe Panorama deployment ka hissa hai, baad ki soch nahi.</p>

<h3>Building blocks</h3>
<table class="tbl"><tr><th>Concept</th><th>Simple matlab</th><th>Example</th></tr>
<tr><td>Administrator account</td><td>Ek insaan (ya ek automation) ka named login</td><td>Har engineer ka ek account, shared "admin" nahi</td></tr>
<tr><td>Role</td><td>Administrator kya kar sakta hai: jaise read-only, ya policy badle par network settings nahi</td><td>Auditor: sirf view</td></tr>
<tr><td>Access domain</td><td>Administrator kaun se device groups aur templates dekh aur badal sakta hai</td><td>Chennai team sirf Chennai device group dekhti hai</td></tr>
<tr><td>Authentication method</td><td>Local password, ya external server aur multi-factor authentication</td><td>Jahan aapki policy maange wahan central identity system prefer karo</td></tr>
</table>
<p>Exact role types, permissions ki list aur access domains kaise lagte hain ye PAN-OS versions mein alag hota hai. Apne PAN-OS version ki documentation check karo, aur yaad ki hui list ke bajay principle se design karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Roles aur domains">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Administrator</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#fde68a"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">Role (kya)</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Access domain (kahan)</text>
<rect x="235" y="120" width="170" height="50" rx="8" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Allowed actions</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><line x1="535" y1="70" x2="405" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Insaan kya kar sakta hai (role) aur kahan kar sakta hai (access domain), dono saath.</p></div>

<h3>Chhoti team mein achhi practice</h3>
<ul>
<li>Har insaan ka ek named account. Shared accounts audit trail khatam kar dete hain.</li>
<li>Jo sirf dekhte hain unke liye read-only roles: auditors, managers, trainees.</li>
<li>Team badi ho to policy badalne wale aur network settings badalne wale alag karo.</li>
<li>Full administrators ki sankhya limit karo aur list regularly review karo.</li>
<li>Emergency local account safe jagah rakho, agar external login system down ho.</li>
</ul>
<p>Simulator mein ek hi lab administrator hai aur roles ya access domains model nahi hote; ye chapter conceptual hai. Panorama-only configuration area <code>mgt-config</code> jo labs mein firewalls register karne ke liye use karte ho, wahi hai jahan Panorama management settings rakhta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Admin password team chat mein share karna; "abhi ke liye" sab ko full rights dena; engineer ke jaane par uska account na hatana; change kisne kiya ye record na karna.</p></div>

<div class="scn"><h4>Intern jo sab ko push kar sakta tha</h4><p>Naye intern ko senior engineers wala hi full-rights account diya gaya taaki wo "jaldi seekhe". Test rule par ek achhi niyat ka experiment production device group mein publish ho gaya. Kuch toota nahi, par review mein dikha ki koi technical barrier tha hi nahi. Team ne learners ke liye read-only role aur lab device group tak limited access domain banaya.</p><p><b>Lesson:</b> sabse safe accident wo hai jo system hone hi na de.</p></div>

<div class="iv"><p class="q">"Panorama ke through firewall policy kaun badal sakta hai ye aap kaise control karoge?"</p><p>Har insaan ka named account, least privilege wale roles, access domains jo limit karein har insaan kaun se device groups aur templates dekh sakta hai, strong ya multi-factor authentication, aur audit trail. Ye jodo ki exact features PAN-OS version par depend karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama access kai firewalls tak pahunchta hai, isliye administrator design ek safety control hai.</li>
<li>Role = aap kya kar sakte ho; access domain = aap kahan kar sakte ho.</li>
<li>Har insaan ka ek named account; shared logins se bacho.</li>
<li>Least privilege aur viewers ke liye read-only roles prefer karo.</li>
<li>Apne PAN-OS version ki documentation check karo; simulator roles model nahi karta.</li>
</ul></div>
`}};export{e as default};