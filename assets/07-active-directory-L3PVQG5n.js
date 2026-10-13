var e={id:`active-directory`,h:{en:`Active Directory and LDAP as an identity source (concept)`,hi:`Active Directory aur LDAP identity source ke roop mein (concept)`},body:{en:`
<div class="note"><p><b>Not simulated in the lab.</b> The lab authenticates users from the <b>Local User Repository</b> (alice and bob with a Department attribute). Joining the domain and querying Active Directory are real production steps that the lab does not model. The ClearPass logic that follows the identity source (role mapping, enforcement) is exactly the same, and that part you practise in the lab.</p></div>

<p>A company already has a staff directory: every employee has one account and one password, kept in <b>Active Directory (AD)</b>. If ClearPass kept its own list of users, HR would have to create every joiner twice and remove every leaver twice. So ClearPass asks the directory instead. The directory is the <b>identity source</b>; ClearPass is the <b>decision maker</b>.</p>

<h3>Where the identity source sits in the decision chain</h3>
<p>You learned the order: NAD check, service match, authentication, authorization and role mapping, enforcement. The identity source belongs to the <b>authentication and authorization</b> steps. A service lists <b>authentication sources</b> in order. In the lab the source is [Local User Repository]. In a production service you add an Active Directory source, and ClearPass fetches attributes such as department, group membership (memberOf) and account status, which feed the role mapping.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AD as authentication source">
<rect x="20" y="85" width="120" height="55" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="80" y="128" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<rect x="210" y="75" width="150" height="75" rx="8" fill="#bbf7d0"/><text x="285" y="100" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">service: PEAP</text><text x="285" y="135" text-anchor="middle" class="svg-muted" font-size="12">source: AD</text>
<rect x="450" y="75" width="170" height="75" rx="8" fill="#ddd6fe"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="13">Active Directory</text><text x="535" y="118" text-anchor="middle" class="svg-muted" font-size="12">user, groups,</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="12">department</text>
<line x1="140" y1="112" x2="210" y2="112" stroke="#64748b" stroke-width="3"/><line x1="360" y1="112" x2="450" y2="112" stroke="#64748b" stroke-width="3"/>
<text x="175" y="104" text-anchor="middle" class="svg-muted" font-size="12">1812</text><text x="405" y="104" text-anchor="middle" class="svg-muted" font-size="12">LDAP / NTLM</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">AD returns the verdict and attributes; ClearPass applies role mapping and enforcement</text>
</svg><p class="cap">The switch never talks to AD. ClearPass queries AD and then turns the result into a role.</p></div>

<h3>Two ways ClearPass can use AD</h3>
<dl class="terms">
<dt>Domain join</dt><dd>The ClearPass node becomes a computer account in the domain. This is what lets it validate <b>MSCHAPv2 inside PEAP</b>, the common wired and wireless password method, because verifying MSCHAPv2 needs the domain controller to check the password hash. In the real GUI you join each node under Administration &gt; Server Manager &gt; Server Configuration (Join AD Domain), using an account with the right to create the computer object. Every node of a cluster is joined separately.</dd>
<dt>LDAP bind and search source</dt><dd>An authentication source configured under Configuration &gt; Authentication &gt; Sources of type Active Directory (or generic LDAP). ClearPass connects to the directory with a bind account and searches for the user. An LDAP simple bind can verify a clear password (for example PAP or a tunnelled method that exposes it), but it cannot verify MSCHAPv2. That is why PEAP-MSCHAPv2 needs the domain join.</dd>
</dl>

<h3>What must be ready before it works</h3>
<ol>
<li><b>DNS.</b> ClearPass must resolve the domain and find domain controllers. A wrong DNS server is the number one reason joins fail.</li>
<li><b>Time.</b> Kerberos tolerates only a small clock difference (five minutes by default). Use NTP on ClearPass and on the domain controllers.</li>
<li><b>Reachability.</b> The nodes must reach the domain controllers on the directory ports (LDAP and its secure variant, Kerberos, SMB for the join). Firewalls often block these between the NAC and server networks.</li>
<li><b>Accounts.</b> A service account to bind and search (least privilege, read only) and, for the join, an account allowed to add the computer. Do not use a domain admin account for the permanent bind.</li>
<li><b>Secure LDAP.</b> Use LDAPS or StartTLS so the bind password does not cross the network in clear text, and make sure ClearPass trusts the directory certificate (chapter 8).</li>
</ol>

<h3>Authorization attributes and role mapping</h3>
<p>The directory returns attributes. In the lab, the role mapping RM-WIRED turns <code>Local:Department EQUALS Contractor</code> into the role CONTRACTOR. With AD the same idea uses AD attributes, for example a group membership or the department field:</p>
<pre class="code"><span class="c">! Lab shell: same logic, local attribute</span>
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
<span class="c">! Real GUI idea for AD (not simulated): Configuration &gt; Identity &gt; Role Mappings</span>
<span class="c">! rule: Authorization:[Company AD]:memberOf CONTAINS VPN-Contractors  then  CONTRACTOR</span></pre>
<p>The second line is a conceptual example; attribute namespaces in the real product depend on the name you give the AD source.</p>

<h3>Failure patterns you will meet in production</h3>
<pre class="out">Access Tracker - alerts (representative AD wording, not lab output)
<span class="hl">AD user not found / account disabled / password expired</span>
Authentication source [Company AD]: connection timeout</pre>
<ul>
<li><b>User not found, wrong password, disabled or locked account:</b> the same family as the lab alerts 215, 216 and 217. The user's identity problem, not the network.</li>
<li><b>Source timeout:</b> DNS, firewall, or a domain controller down. Real products let you list several controllers for resilience.</li>
<li><b>Everyone fails after a weekend:</b> the join was lost (computer account password change, deleted object, time drift). Rejoin.</li>
<li><b>MSCHAPv2 fails but a bind test works:</b> the node is not joined, or the join is broken on that node.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Priya in Finance connects. The service uses PEAP with the source Company AD. AD returns department Finance and the group Finance-Staff. A role mapping rule on memberOf Finance-Staff gives the ClearPass role FINANCE, and the policy returns the switch role FINANCE (VLAN 60). When Priya leaves the company, HR disables her AD account; at the next authentication ClearPass reports the account disabled and she is rejected. No change was needed in ClearPass.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using a human administrator password for the bind account. (2) Joining only one node of a cluster. (3) Pointing ClearPass DNS at a public resolver that cannot see the internal domain. (4) Expecting an LDAP bind source to validate MSCHAPv2. (5) Forgetting that changes to AD group names break role-mapping rules silently: users then fall to the default role.</p></div>

<div class="exam"><p><b>Exam trap.</b> The identity source returns <b>who the user is and attributes</b>; it does not decide the VLAN. The VLAN or role comes from the role mapping plus the enforcement policy. Also, domain join and the authentication source are two separate configurations.</p></div>

<div class="scn"><h4>Everyone rejected at 08:00</h4><p>At the start of the work day all wired logins failed. The switches were healthy and the Event Viewer was clean. The Access Tracker showed an error reaching the directory. The cause was a clock drift on the ClearPass node after an NTP server was retired; Kerberos refused the node. After pointing NTP to a valid server the join worked again and logins resumed.</p><p><b>Lesson:</b> time and DNS are part of the identity chain. Check them before changing policy.</p></div>

<div class="iv"><p class="q">"Why must ClearPass join the domain for PEAP-MSCHAPv2?"</p><p>Strong answer: MSCHAPv2 is a challenge-response that must be verified against the NT password hash, which only the domain controller can do. The join gives ClearPass a computer account for that secure channel. A plain LDAP bind source cannot verify MSCHAPv2. I would add that each cluster node is joined, and that DNS and time must be correct.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The identity source (AD or LDAP) proves who the user is and returns attributes; ClearPass decides role and enforcement.</li>
<li>Domain join is needed for MSCHAPv2 validation; an LDAP source is used for bind, search and attributes.</li>
<li>DNS, time, reachability and least-privilege accounts must be ready first.</li>
<li>Role mapping turns AD attributes (group, department) into ClearPass roles, same logic as the lab Local:Department rule.</li>
<li>AD is concept only in the lab; the lab uses the Local User Repository.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab users ko <b>Local User Repository</b> se authenticate karta hai (alice aur bob, Department attribute ke saath). Domain join karna aur Active Directory query karna real production steps hain jo lab model nahi karta. Identity source ke baad ka ClearPass logic (role mapping, enforcement) bilkul same hai, aur woh hissa aap lab mein practise karte ho.</p></div>

<p>Ek company ke paas pehle se staff directory hai: har employee ka ek account aur ek password <b>Active Directory (AD)</b> mein rakha hota hai. Agar ClearPass apni users ki list rakhta, to HR ko har joiner do baar banana aur har leaver do baar hatana padta. Isliye ClearPass directory se poochta hai. Directory <b>identity source</b> hai; ClearPass <b>decision maker</b> hai.</p>

<h3>Identity source decision chain mein kahan baithta hai</h3>
<p>Aapne order seekha: NAD check, service match, authentication, authorization aur role mapping, enforcement. Identity source <b>authentication aur authorization</b> steps ka hissa hai. Service <b>authentication sources</b> ko order mein list karti hai. Lab mein source [Local User Repository] hai. Production service mein aap Active Directory source add karte ho, aur ClearPass department, group membership (memberOf) aur account status jaise attributes laata hai, jo role mapping mein jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AD authentication source ke roop mein">
<rect x="20" y="85" width="120" height="55" rx="8" fill="#bae6fd"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="80" y="128" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<rect x="210" y="75" width="150" height="75" rx="8" fill="#bbf7d0"/><text x="285" y="100" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">service: PEAP</text><text x="285" y="135" text-anchor="middle" class="svg-muted" font-size="12">source: AD</text>
<rect x="450" y="75" width="170" height="75" rx="8" fill="#ddd6fe"/><text x="535" y="100" text-anchor="middle" class="svg-ink" font-size="13">Active Directory</text><text x="535" y="118" text-anchor="middle" class="svg-muted" font-size="12">user, groups,</text><text x="535" y="135" text-anchor="middle" class="svg-muted" font-size="12">department</text>
<line x1="140" y1="112" x2="210" y2="112" stroke="#64748b" stroke-width="3"/><line x1="360" y1="112" x2="450" y2="112" stroke="#64748b" stroke-width="3"/>
<text x="175" y="104" text-anchor="middle" class="svg-muted" font-size="12">1812</text><text x="405" y="104" text-anchor="middle" class="svg-muted" font-size="12">LDAP / NTLM</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">AD verdict aur attributes deta hai; ClearPass role mapping aur enforcement lagata hai</text>
</svg><p class="cap">Switch kabhi AD se baat nahi karta. ClearPass AD ko query karta hai aur result ko role mein badalta hai.</p></div>

<h3>ClearPass AD ko do tarah use kar sakta hai</h3>
<dl class="terms">
<dt>Domain join</dt><dd>ClearPass node domain mein ek computer account ban jaata hai. Yahi use <b>PEAP ke andar MSCHAPv2</b> validate karne deta hai, jo common wired aur wireless password method hai, kyunki MSCHAPv2 verify karne ke liye domain controller ko password hash check karna padta hai. Real GUI mein har node ko Administration &gt; Server Manager &gt; Server Configuration (Join AD Domain) mein join karte ho, aise account se jise computer object banane ka haq ho. Cluster ka har node alag se join hota hai.</dd>
<dt>LDAP bind aur search source</dt><dd>Configuration &gt; Authentication &gt; Sources ke neeche Active Directory (ya generic LDAP) type ka authentication source. ClearPass bind account se directory se connect hota hai aur user ko search karta hai. LDAP simple bind clear password verify kar sakta hai (jaise PAP ya koi tunnelled method jo use expose kare), par MSCHAPv2 verify nahi kar sakta. Isiliye PEAP-MSCHAPv2 ko domain join chahiye.</dd>
</dl>

<h3>Kaam karne se pehle kya taiyaar hona chahiye</h3>
<ol>
<li><b>DNS.</b> ClearPass ko domain resolve karna aur domain controllers dhoondhna aana chahiye. Galat DNS server join fail hone ki number one wajah hai.</li>
<li><b>Time.</b> Kerberos sirf chhota clock difference sahta hai (default mein paanch minute). ClearPass aur domain controllers par NTP use karo.</li>
<li><b>Reachability.</b> Nodes ko domain controllers tak directory ports par pahunchna chahiye (LDAP aur uska secure variant, Kerberos, join ke liye SMB). Firewalls aksar NAC aur server networks ke beech inhe block karte hain.</li>
<li><b>Accounts.</b> Bind aur search ke liye service account (least privilege, read only) aur join ke liye aisa account jise computer add karne ki permission ho. Permanent bind ke liye domain admin account use mat karo.</li>
<li><b>Secure LDAP.</b> LDAPS ya StartTLS use karo taaki bind password network par clear text mein na jaye, aur dhyan rakho ki ClearPass directory certificate par trust kare (chapter 8).</li>
</ol>

<h3>Authorization attributes aur role mapping</h3>
<p>Directory attributes return karti hai. Lab mein role mapping RM-WIRED <code>Local:Department EQUALS Contractor</code> ko role CONTRACTOR mein badalti hai. AD ke saath wahi idea AD attributes use karta hai, jaise group membership ya department field:</p>
<pre class="code"><span class="c">! Lab shell: same logic, local attribute</span>
configuration identity role-mapping RM-WIRED rule add if Local:Department EQUALS Contractor then CONTRACTOR
<span class="c">! AD ke liye real GUI idea (simulate nahi): Configuration &gt; Identity &gt; Role Mappings</span>
<span class="c">! rule: Authorization:[Company AD]:memberOf CONTAINS VPN-Contractors  then  CONTRACTOR</span></pre>
<p>Doosri line conceptual example hai; real product mein attribute namespaces us naam par depend karte hain jo aap AD source ko dete ho.</p>

<h3>Production mein milne wale failure patterns</h3>
<pre class="out">Access Tracker - alerts (representative AD wording, lab output nahi)
<span class="hl">AD user not found / account disabled / password expired</span>
Authentication source [Company AD]: connection timeout</pre>
<ul>
<li><b>User not found, wrong password, disabled ya locked account:</b> lab alerts 215, 216 aur 217 wali family. User ki identity problem, network nahi.</li>
<li><b>Source timeout:</b> DNS, firewall, ya domain controller down. Real products resilience ke liye kai controllers list karne dete hain.</li>
<li><b>Weekend ke baad sab fail:</b> join toot gaya (computer account password change, deleted object, time drift). Dobara join karo.</li>
<li><b>MSCHAPv2 fail par bind test chalta hai:</b> node join nahi hai, ya us node par join toota hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Finance ki Priya connect hoti hai. Service PEAP aur source Company AD use karti hai. AD department Finance aur group Finance-Staff return karta hai. memberOf Finance-Staff par role mapping rule ClearPass role FINANCE deta hai, aur policy switch role FINANCE (VLAN 60) return karti hai. Jab Priya company chhodti hai, HR uska AD account disable kar deta hai; agli authentication par ClearPass account disabled report karta hai aur woh reject hoti hai. ClearPass mein koi change nahi chahiye tha.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Bind account ke liye insaani administrator password use karna. (2) Cluster ka sirf ek node join karna. (3) ClearPass DNS ko public resolver par point karna jo internal domain nahi dekh sakta. (4) LDAP bind source se MSCHAPv2 validate hone ki ummeed. (5) Bhool jaana ki AD group names badalne se role-mapping rules chupchaap tootte hain: users default role par aa jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Identity source <b>user kaun hai aur attributes</b> return karta hai; woh VLAN decide nahi karta. VLAN ya role role mapping plus enforcement policy se aata hai. Aur domain join aur authentication source do alag configurations hain.</p></div>

<div class="scn"><h4>Subah 08:00 par sab reject</h4><p>Work day shuru hote hi saare wired logins fail ho gaye. Switches healthy the aur Event Viewer clean tha. Access Tracker ne directory tak pahunchne mein error dikhaya. Wajah ek NTP server retire hone ke baad ClearPass node par clock drift thi; Kerberos ne node ko refuse kar diya. NTP ko valid server par point karne ke baad join dobara kaam karne laga aur logins resume ho gaye.</p><p><b>Seekh:</b> time aur DNS identity chain ka hissa hain. Policy badalne se pehle inhe check karo.</p></div>

<div class="iv"><p class="q">"PEAP-MSCHAPv2 ke liye ClearPass ko domain join kyun karna padta hai?"</p><p>Strong answer: MSCHAPv2 challenge-response hai jise NT password hash ke against verify karna padta hai, jo sirf domain controller kar sakta hai. Join ClearPass ko us secure channel ke liye computer account deta hai. Plain LDAP bind source MSCHAPv2 verify nahi kar sakta. Main yeh jodunga ki cluster ka har node join hota hai, aur DNS aur time sahi hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity source (AD ya LDAP) prove karta hai ki user kaun hai aur attributes return karta hai; role aur enforcement ClearPass decide karta hai.</li>
<li>MSCHAPv2 validation ke liye domain join chahiye; LDAP source bind, search aur attributes ke liye hai.</li>
<li>DNS, time, reachability aur least-privilege accounts pehle taiyaar hone chahiye.</li>
<li>Role mapping AD attributes (group, department) ko ClearPass roles mein badalti hai, lab ke Local:Department rule ke same logic se.</li>
<li>AD lab mein sirf concept hai; lab Local User Repository use karta hai.</li>
</ul></div>
`}};export{e as default};