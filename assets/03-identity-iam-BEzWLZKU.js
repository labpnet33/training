var e={id:`identity-iam`,h:{en:`Identity and IAM: the new perimeter`,hi:`Identity aur IAM: naya perimeter`},body:{en:`
<p>In an office building, the front desk checks your badge once and then you can walk into many rooms. In the cloud, there is no front desk you can stand behind. The control plane (the web console and the APIs) is reachable from any internet connection in the world. The only thing standing between an attacker and your entire account is <b>identity</b>: a password plus MFA, an access key, or a role. That is why people say "identity is the new perimeter".</p>

<h3>The IAM vocabulary</h3>
<dl class="terms">
<dt>Root / owner account</dt><dd>The identity that created the cloud account. It can do everything, including closing the account. Protect it with hardware MFA, never use it for daily work, and never create access keys for it.</dd>
<dt>User</dt><dd>A long-lived identity for a person (or, badly, for a program) with a password and optionally access keys.</dd>
<dt>Group</dt><dd>A set of users that share permissions, such as "network-admins".</dd>
<dt>Role / service account</dt><dd>An identity that is <b>assumed</b> temporarily and gives short-lived credentials. Used by VMs, functions, pipelines and federated users.</dd>
<dt>Policy</dt><dd>A JSON document that allows or denies actions on resources, optionally with conditions (source IP, MFA present, time).</dd>
<dt>Federation / SSO</dt><dd>People sign in through the company identity provider (SAML or OIDC), so leavers lose cloud access when HR disables them.</dd>
<dt>CIEM</dt><dd>Cloud Infrastructure Entitlement Management: tools that compare granted permissions with used permissions and highlight excess privilege.</dd>
</dl>

<h3>How a policy decision works</h3>
<p>Most providers follow the same logic: everything is <b>implicitly denied</b>; an explicit <b>allow</b> grants access; an explicit <b>deny</b> anywhere always wins. Organisation-level guardrails (service control policies or organisation policies) sit above the account and cap what any identity can do, even an administrator.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IAM evaluation order">
<rect x="10" y="60" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">API request</text>
<rect x="170" y="60" width="130" height="50" rx="8" fill="#fed7aa"/><text x="235" y="82" text-anchor="middle" class="svg-ink" font-size="12">Explicit deny?</text><text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">yes: DENY</text>
<rect x="330" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="82" text-anchor="middle" class="svg-ink" font-size="12">Org guardrail</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">allows?</text>
<rect x="490" y="60" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="12">Explicit allow?</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">no: implicit deny</text>
<line x1="140" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="300" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="460" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Deny wins. No allow means deny.</text>
</svg><p class="cap">Simplified evaluation order used by the major providers.</p></div>

<h3>A least-privilege policy</h3>
<p>The reporting application only needs to read objects from one bucket, and only through the company network. Compare that with the lazy "*:*" policy many teams start with.</p>
<pre class="code"><span class="c">! AWS-style JSON policy: read-only on one bucket, only from the corporate range</span>
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::nk-payroll-exports/*",
    "Condition": { "IpAddress": { "aws:SourceIp": "198.51.100.0/24" } }
  }]
}
<span class="c">! Anti-pattern: "Action": "*", "Resource": "*" on a CI user with a 2-year-old key</span></pre>

<h3>The classic IAM misconfigurations</h3>
<ul>
<li><b>No MFA</b> on console users, especially privileged ones.</li>
<li><b>Long-lived access keys</b> on users and bots, never rotated, often committed to Git or stored in CI variables.</li>
<li><b>Wildcard permissions</b> ("*") given "temporarily" and never removed.</li>
<li><b>Service identities with console passwords</b>. A bot should never log in to the web console.</li>
<li><b>Unused identities</b> of people who left, and roles nobody has assumed in 90 days.</li>
<li><b>Permission to change logging</b> (delete the audit trail) granted to everyday identities.</li>
</ul>

<div class="eg"><p><b>Worked example from Lab 2.</b> The audit trail you ingest into Splunk shows identity <code>dev-ci-bot</code>, a pipeline bot, doing a <code>ConsoleLogin</code> from 185.220.101.7 with <code>mfaUsed: No</code>: one Failure at 03:42:19, then a Success at 03:42:55. Within three minutes the same identity runs <code>PutBucketAcl</code> to make <code>nk-payroll-exports</code> public-read and <code>DeleteTrail</code> on <code>org-audit-trail</code>. Four IAM failures in one story: a bot with a console password, no MFA, permission to change bucket ACLs, and permission to delete the audit trail.</p></div>

<pre class="out">eventName      userIdentity.userName  sourceIPAddress  mfaUsed  result
ConsoleLogin   priya.ops              49.36.112.10     Yes      Success
ConsoleLogin   dev-ci-bot             185.220.101.7    No       Failure
<span class="hl">ConsoleLogin   dev-ci-bot             185.220.101.7    No       Success</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Fixing the symptom only (making the bucket private again) without disabling or rotating the compromised identity. Until the bot's password and keys are revoked and its permissions trimmed, the attacker can simply repeat the change.</p></div>
<div class="exam"><p><b>Exam traps.</b> Roles give <b>temporary</b> credentials and are preferred over long-lived user keys for workloads. An explicit deny overrides any allow. Federation means identities live in the corporate IdP, not as separate cloud users.</p></div>

<div class="scn"><h4>The key in the public repository</h4><p>A developer pushed a test script to a public repository with an access key in a config file. Automated scanners run by attackers harvest such keys within minutes. The key belonged to a user with wide compute permissions, and by morning dozens of large instances were mining cryptocurrency in an unused region. The team saw it from the billing alert, not from security monitoring. The fix: deactivate the key, delete the instances, review the audit log for every API call made with that key, enable secret scanning in the repository, move CI to short-lived OIDC tokens and add a guardrail that blocks unused regions.</p><p><b>Lesson:</b> long-lived keys are the cloud equivalent of a password written on a sticky note. Replace them with roles and short-lived tokens.</p></div>

<div class="iv"><p class="q">"How do you secure identities in a public cloud account?"</p><p>Structure the answer: protect root (hardware MFA, no keys, break-glass only); federate people through the corporate IdP with MFA; use roles with short-lived credentials for workloads and pipelines; enforce least privilege and review it with CIEM; block risky actions (deleting audit logs, public buckets) with organisation guardrails; and alert on console logins without MFA or from unusual locations.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The control plane is reachable from anywhere, so identity is the perimeter.</li>
<li>Implicit deny, explicit allow, explicit deny always wins; org guardrails cap everything.</li>
<li>Prefer federated users and short-lived roles over long-lived users and access keys.</li>
<li>Bots must never have console passwords; nobody routine should be able to delete the audit trail.</li>
<li>After a compromise, revoke the identity first, then fix the resources it changed.</li>
</ul></div>
`,hi:`
<p>Office building mein front desk ek baar aapka badge check karta hai aur phir aap kai rooms mein ja sakte ho. Cloud mein koi front desk nahi hai jiske peeche aap khade ho sako. Control plane (web console aur APIs) duniya ke kisi bhi internet connection se reachable hai. Attacker aur aapke poore account ke beech sirf ek cheez khadi hai: <b>identity</b>, yaani password plus MFA, ek access key, ya ek role. Isiliye log kehte hain "identity naya perimeter hai".</p>

<h3>IAM ki vocabulary</h3>
<dl class="terms">
<dt>Root / owner account</dt><dd>Woh identity jisne cloud account banaya. Yeh sab kuch kar sakti hai, account band karna bhi. Ise hardware MFA se protect karo, daily kaam ke liye kabhi use mat karo, aur iske liye kabhi access keys mat banao.</dd>
<dt>User</dt><dd>Kisi insaan (ya, galat tareeke se, kisi program) ke liye long-lived identity, password aur optionally access keys ke saath.</dd>
<dt>Group</dt><dd>Users ka set jo permissions share karte hain, jaise "network-admins".</dd>
<dt>Role / service account</dt><dd>Aisi identity jise temporarily <b>assume</b> kiya jaata hai aur jo short-lived credentials deti hai. VMs, functions, pipelines aur federated users isse use karte hain.</dd>
<dt>Policy</dt><dd>JSON document jo resources par actions allow ya deny karta hai, optionally conditions ke saath (source IP, MFA present, time).</dd>
<dt>Federation / SSO</dt><dd>Log company ke identity provider (SAML ya OIDC) se sign in karte hain, isliye jab HR kisi leaver ko disable karta hai to uska cloud access bhi chala jaata hai.</dd>
<dt>CIEM</dt><dd>Cloud Infrastructure Entitlement Management: tools jo di gayi permissions ko use hui permissions se compare karte hain aur extra privilege highlight karte hain.</dd>
</dl>

<h3>Policy decision kaise hota hai</h3>
<p>Zyada tar providers same logic follow karte hain: sab kuch <b>implicitly denied</b> hai; explicit <b>allow</b> access deta hai; kahin bhi explicit <b>deny</b> hamesha jeet-ta hai. Organisation-level guardrails (service control policies ya organisation policies) account ke upar baithte hain aur limit karte hain ki koi bhi identity kya kar sakti hai, administrator bhi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="IAM evaluation order">
<rect x="10" y="60" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="13">API request</text>
<rect x="170" y="60" width="130" height="50" rx="8" fill="#fed7aa"/><text x="235" y="82" text-anchor="middle" class="svg-ink" font-size="12">Explicit deny?</text><text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">haan: DENY</text>
<rect x="330" y="60" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="395" y="82" text-anchor="middle" class="svg-ink" font-size="12">Org guardrail</text><text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">allow karta hai?</text>
<rect x="490" y="60" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="82" text-anchor="middle" class="svg-ink" font-size="12">Explicit allow?</text><text x="560" y="100" text-anchor="middle" class="svg-muted" font-size="12">nahi: implicit deny</text>
<line x1="140" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="300" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="460" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Deny jeet-ta hai. Allow nahi to deny.</text>
</svg><p class="cap">Bade providers ka simplified evaluation order.</p></div>

<h3>Ek least-privilege policy</h3>
<p>Reporting application ko sirf ek bucket se objects padhne hain, aur sirf company network ke through. Ise us lazy "*:*" policy se compare karo jisse bahut saari teams shuru karti hain.</p>
<pre class="code"><span class="c">! AWS-style JSON policy: ek bucket par read-only, sirf corporate range se</span>
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::nk-payroll-exports/*",
    "Condition": { "IpAddress": { "aws:SourceIp": "198.51.100.0/24" } }
  }]
}
<span class="c">! Anti-pattern: CI user par "Action": "*", "Resource": "*" aur 2 saal purani key</span></pre>

<h3>Classic IAM misconfigurations</h3>
<ul>
<li>Console users par <b>MFA nahi</b>, khaas kar privileged users par.</li>
<li>Users aur bots par <b>long-lived access keys</b>, kabhi rotate nahi hoti, aksar Git mein commit ya CI variables mein store.</li>
<li><b>Wildcard permissions</b> ("*") jo "temporarily" di gayi aur kabhi hatayi nahi gayi.</li>
<li><b>Service identities ke console passwords</b>. Bot ko kabhi web console mein login nahi karna chahiye.</li>
<li>Chhod kar gaye logon ki <b>unused identities</b>, aur roles jo 90 din se kisi ne assume nahi kiye.</li>
<li>Everyday identities ko <b>logging badalne ki permission</b> (audit trail delete karna).</li>
</ul>

<div class="eg"><p><b>Lab 2 se worked example.</b> Jo audit trail aap Splunk mein ingest karte ho usmein identity <code>dev-ci-bot</code>, ek pipeline bot, 185.220.101.7 se <code>mfaUsed: No</code> ke saath <code>ConsoleLogin</code> karta dikhta hai: 03:42:19 par ek Failure, phir 03:42:55 par Success. Teen minute ke andar wahi identity <code>nk-payroll-exports</code> ko public-read banane ke liye <code>PutBucketAcl</code> aur <code>org-audit-trail</code> par <code>DeleteTrail</code> chalati hai. Ek kahani mein chaar IAM failures: console password wala bot, MFA nahi, bucket ACLs badalne ki permission, aur audit trail delete karne ki permission.</p></div>

<pre class="out">eventName      userIdentity.userName  sourceIPAddress  mfaUsed  result
ConsoleLogin   priya.ops              49.36.112.10     Yes      Success
ConsoleLogin   dev-ci-bot             185.220.101.7    No       Failure
<span class="hl">ConsoleLogin   dev-ci-bot             185.220.101.7    No       Success</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Sirf symptom theek karna (bucket ko dobara private karna) bina compromised identity ko disable ya rotate kiye. Jab tak bot ka password aur keys revoke nahi hote aur permissions kam nahi hoti, attacker wahi change dobara kar sakta hai.</p></div>
<div class="exam"><p><b>Exam traps.</b> Roles <b>temporary</b> credentials dete hain aur workloads ke liye long-lived user keys se behtar hain. Explicit deny kisi bhi allow ko override karta hai. Federation ka matlab identities corporate IdP mein rehti hain, alag cloud users ke roop mein nahi.</p></div>

<div class="scn"><h4>Public repository mein key</h4><p>Ek developer ne ek test script public repository mein push kar di jiske config file mein access key thi. Attackers ke automated scanners aisi keys minutes mein utha lete hain. Key ek aise user ki thi jiske paas wide compute permissions thi, aur subah tak ek unused region mein darjanon bade instances cryptocurrency mine kar rahe the. Team ne yeh billing alert se dekha, security monitoring se nahi. Fix: key deactivate karo, instances delete karo, us key se hui har API call ke liye audit log review karo, repository mein secret scanning on karo, CI ko short-lived OIDC tokens par le jao aur unused regions block karne wala guardrail lagao.</p><p><b>Seekh:</b> long-lived keys cloud ka woh password hain jo sticky note par likha ho. Inhe roles aur short-lived tokens se replace karo.</p></div>

<div class="iv"><p class="q">"Public cloud account mein identities kaise secure karoge?"</p><p>Answer ko structure karo: root ko protect karo (hardware MFA, koi keys nahi, sirf break-glass); logon ko corporate IdP se MFA ke saath federate karo; workloads aur pipelines ke liye short-lived credentials wale roles use karo; least privilege enforce karo aur CIEM se review karo; risky actions (audit logs delete karna, public buckets) ko organisation guardrails se block karo; aur bina MFA ya unusual locations se console logins par alert karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control plane kahin se bhi reachable hai, isliye identity perimeter hai.</li>
<li>Implicit deny, explicit allow, explicit deny hamesha jeet-ta hai; org guardrails sab kuch cap karte hain.</li>
<li>Long-lived users aur access keys ki jagah federated users aur short-lived roles use karo.</li>
<li>Bots ke console passwords kabhi nahi hone chahiye; koi routine identity audit trail delete na kar sake.</li>
<li>Compromise ke baad pehle identity revoke karo, phir uske badle hue resources theek karo.</li>
</ul></div>
`}};export{e as default};