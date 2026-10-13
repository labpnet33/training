var e={id:`group-mapping`,h:{en:`Group mapping: reading users and groups from the directory`,hi:`Group mapping: directory se users aur groups padhna`},body:{en:`

<p><b>Knowing who is not enough; the firewall also needs to know where they belong.</b> A rule that says "engineers may use SSH" needs the list of engineers. Group mapping is how the firewall reads that list from the directory.</p>

<h3>Analogy: the staff list at the front desk</h3>
<p>The badge says "Priya". The guard needs a staff list to know that Priya is in Engineering. If HR moves her to Finance, the list changes and the guard follows the list, not the badge. Group mapping is the firewall's staff list, refreshed from the directory every so often.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Group mapping chain"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Directory</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">Active Directory / LDAP</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">LDAP server profile</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">connection and base DN</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Group mapping</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">which groups, how often</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">rules name the groups</text></svg><p class="cap">The group mapping chain: directory to firewall to policy.</p></div>

<h3>Two tables, two jobs</h3>
<ul>
<li>The <b>IP-user mapping table</b> (previous chapters): which user is on which IP.</li>
<li>The <b>user-group mapping</b> (this chapter): which groups each user belongs to.</li>
</ul>
<p>The firewall joins them at policy time: IP gives user, user gives groups, a rule that names a group matches. The two come from different places and are refreshed separately.</p>

<h3>Step 1: the LDAP server profile</h3>
<p>Reference configuration (not run in the simulator). Under <b>Device &gt; Server Profiles &gt; LDAP</b> you tell the firewall how to talk to the directory. Values here use fictional names:</p>
<table class="cmp"><tr><th>Field</th><th>Example</th><th>Notes</th></tr>
<tr><td>Server</td><td>dc1.acme.example, dc2.acme.example</td><td>Add at least two for resilience</td></tr>
<tr><td>Port</td><td>636</td><td>389 plain LDAP, 636 LDAP over TLS (LDAPS)</td></tr>
<tr><td>Type</td><td>active-directory</td><td>Selects the AD attribute defaults</td></tr>
<tr><td>Base DN</td><td>DC=acme,DC=example</td><td>Where to start searching</td></tr>
<tr><td>Bind DN</td><td>CN=svc-userid,OU=Service,DC=acme,DC=example</td><td>The read-only service account</td></tr>
<tr><td>Password</td><td>a placeholder in this course, a vaulted secret in real life</td><td>Never write real passwords in lessons or tickets</td></tr>
<tr><td>Require SSL/TLS</td><td>yes</td><td>Protects the bind password and the data; use a trusted CA for the directory certificate</td></tr>
</table>

<h3>Step 2: the group mapping settings</h3>
<p>Under <b>Device &gt; User Identification &gt; Group Mapping Settings</b> you add a group mapping that uses the LDAP profile.</p>
<ul>
<li><b>User Domain</b>: the NetBIOS-style domain name that prefixes user names (for example <code>ACME</code>). Rules use names such as <code>ACME\\priya.s</code> or the UPN form <code>priya.s@acme.example</code>. Be consistent, because the name in the rule must match the name the mappings use.</li>
<li><b>Update Interval</b>: how often to re-read the directory. The default is 60 seconds.</li>
<li><b>Group Include List</b>: the groups you will use in policy. Include only those, because reading the whole directory is slow and exposes more data than needed.</li>
<li><b>Custom groups</b>: an LDAP filter that creates a group the directory does not have, for example all users whose department attribute equals Engineering.</li>
</ul>

<h3>Naming: domain, user and group</h3>
<p>Groups are identified by their distinguished name, for example <code>cn=engineers,ou=groups,dc=acme,dc=example</code>. In the GUI you pick them from the included list, so you rarely type this. If the user appears as <code>ACME\\priya.s</code> in mappings but the rule uses <code>priya.s@acme.example</code>, matching fails even though both are the same person. Use the domain map or the same format everywhere.</p>

<div class="eg"><p><b>Worked example.</b> The company has groups Engineers, Finance and Contractors in AD. In the group mapping the team includes only these three. They create no firewall copy of the whole directory. When a contractor leaves, HR removes them from Contractors; within about a minute the firewall sees the change and the contractor-specific rules stop matching.</p></div>

<h3>Verifying group mapping</h3>
<p>Reference commands (not run in the simulator, so no output is shown): <code>show user group-mapping state all</code> shows whether the firewall can read each configured group mapping and when it last updated; <code>show user group list</code> lists the groups the firewall has learned; <code>show user group name "cn=engineers,ou=groups,dc=acme,dc=example"</code> lists the members of one group. If a group is missing from the list, it was not in the include list or the bind account cannot read it.</p>

<h3>Common data problems</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Group list is empty</td><td>Bind DN, password or base DN wrong; port 636 blocked; certificate not trusted</td></tr>
<tr><td>Group exists in the directory but not on the firewall</td><td>Not in the include list, or beyond the search base</td></tr>
<tr><td>Some users missing from a group</td><td>Nested groups: the member is in a child group; check nested group handling in the directory</td></tr>
<tr><td>Rule never matches though user is in group</td><td>Domain name format differs between rule and mapping; or the group update has not run yet</td></tr>
</table>

<div class="note"><p><b>Note.</b> Role-based design: prefer a few clear groups that map to roles (Engineers, Finance) over hundreds of per-person groups. Policy stays readable and the include list stays short. The authentication and directory side of this is the territory of the sec-aaa-mgmt module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a service account with write rights, or sending the bind password over plain LDAP. Use read-only rights and LDAPS with a trusted certificate. The password in this course is always a placeholder.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference between IP-user mapping (who is on this IP) and group mapping (which groups a user belongs to). Know that the group mapping update interval defaults to 60 seconds and that you include only needed groups.</p></div>

<div class="scn"><h4>Right group, wrong spelling</h4><p>A rule for the Finance group did not match although the finance staff were mapped. The mappings used the form ACME-domain-name-then-user while the group used the UPN form. After the team set one User Domain and one name format in the group mapping, the rule matched on the next update.</p><p><b>Lesson:</b> Identity needs one consistent naming format across mapping, group mapping and rules.</p></div>

<div class="iv"><p class="q">"How does the firewall learn group membership, and how does it use it?"</p><p>It reads group membership from the directory with an LDAP server profile and group mapping settings, refreshing on an update interval and limited by an include list. At policy time the IP gives the user via the IP-user mapping, the user gives groups via group mapping, and a rule naming a group matches. I would use LDAPS and a read-only account.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group mapping reads user-to-group membership from the directory through an LDAP server profile.</li>
<li>Include only the groups used in policy; default update interval is 60 seconds.</li>
<li>Use LDAPS (port 636) and a read-only service account; never real passwords in notes.</li>
<li>Use one consistent user name format (domain and user) across mappings and rules.</li>
<li>Verify with show user group-mapping state all and show user group list on a real firewall.</li>
</ul></div>

`,hi:`

<p><b>Kaun hai yeh jaanna kaafi nahi; firewall ko yeh bhi jaanna hai ki woh kahan belong karta hai.</b> "Engineers SSH use kar sakte hain" rule ko engineers ki list chahiye. Group mapping woh tareeka hai jisse firewall directory se woh list padhta hai.</p>

<h3>Analogy: front desk ki staff list</h3>
<p>Badge par "Priya" likha hai. Guard ko staff list chahiye yeh jaanne ke liye ki Priya Engineering mein hai. HR use Finance mein bhej de to list badalti hai aur guard badge nahi, list ko follow karta hai. Group mapping firewall ki staff list hai, jo directory se samay samay par refresh hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Group mapping chain"><rect x="20" y="25" width="129" height="80" rx="10" fill="#bae6fd"/><text x="84.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Directory</text><text x="84.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">Active Directory / LDAP</text><line x1="149" y1="65" x2="177" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="177,65 170,61 170,69" fill="#64748b"/><rect x="177" y="25" width="129" height="80" rx="10" fill="#bbf7d0"/><text x="241.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">LDAP server profile</text><text x="241.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">connection aur base DN</text><line x1="306" y1="65" x2="334" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="334,65 327,61 327,69" fill="#64748b"/><rect x="334" y="25" width="129" height="80" rx="10" fill="#ddd6fe"/><text x="398.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Group mapping</text><text x="398.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">kaunse groups, kitni baar</text><line x1="463" y1="65" x2="491" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="491,65 484,61 484,69" fill="#64748b"/><rect x="491" y="25" width="129" height="80" rx="10" fill="#fde68a"/><text x="555.5" y="60" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="555.5" y="82" text-anchor="middle" class="svg-muted" font-size="11">rules mein groups ke naam</text></svg><p class="cap">Group mapping chain: directory se firewall se policy tak.</p></div>

<h3>Do tables, do kaam</h3>
<ul>
<li><b>IP-user mapping table</b> (pichhle chapters): kaunsa user kaunse IP par hai.</li>
<li><b>User-group mapping</b> (yeh chapter): har user kin groups mein hai.</li>
</ul>
<p>Firewall inhe policy time par jodta hai: IP se user, user se groups, aur group ka naam leti rule match karti hai. Dono alag jagah se aate hain aur alag refresh hote hain.</p>

<h3>Step 1: LDAP server profile</h3>
<p>Reference configuration (not run in the simulator). <b>Device &gt; Server Profiles &gt; LDAP</b> mein aap firewall ko batate ho directory se kaise baat karni hai. Yahan fictional names hain:</p>
<table class="cmp"><tr><th>Field</th><th>Example</th><th>Notes</th></tr>
<tr><td>Server</td><td>dc1.acme.example, dc2.acme.example</td><td>Resilience ke liye kam se kam do jodo</td></tr>
<tr><td>Port</td><td>636</td><td>389 plain LDAP, 636 LDAP over TLS (LDAPS)</td></tr>
<tr><td>Type</td><td>active-directory</td><td>AD attribute defaults chunta hai</td></tr>
<tr><td>Base DN</td><td>DC=acme,DC=example</td><td>Search kahan se shuru ho</td></tr>
<tr><td>Bind DN</td><td>CN=svc-userid,OU=Service,DC=acme,DC=example</td><td>Read-only service account</td></tr>
<tr><td>Password</td><td>Is course mein placeholder, asli zindagi mein vaulted secret</td><td>Lessons ya tickets mein asli password kabhi nahi</td></tr>
<tr><td>Require SSL/TLS</td><td>yes</td><td>Bind password aur data ko protect karta hai; directory certificate ke liye trusted CA use karo</td></tr>
</table>

<h3>Step 2: group mapping settings</h3>
<p><b>Device &gt; User Identification &gt; Group Mapping Settings</b> mein aap LDAP profile use karne waala group mapping jodte ho.</p>
<ul>
<li><b>User Domain</b>: NetBIOS-style domain naam jo user names ke aage lagta hai (jaise <code>ACME</code>). Rules mein <code>ACME\\priya.s</code> jaise naam ya UPN form <code>priya.s@acme.example</code> aate hain. Consistent raho, kyunki rule ka naam mappings ke naam se match karna chahiye.</li>
<li><b>Update Interval</b>: directory kitni baar dobara padhni hai. Default 60 seconds hai.</li>
<li><b>Group Include List</b>: jo groups policy mein use karoge. Sirf wahi include karo, kyunki poori directory padhna slow hai aur zaroorat se zyada data kholta hai.</li>
<li><b>Custom groups</b>: LDAP filter jo aisa group banata hai jo directory mein nahi hai, jaise department attribute Engineering waale sab users.</li>
</ul>

<h3>Naming: domain, user aur group</h3>
<p>Groups ko distinguished name se pehchana jaata hai, jaise <code>cn=engineers,ou=groups,dc=acme,dc=example</code>. GUI mein aap included list se chunte ho, isliye ise kam type karna padta hai. User mappings mein <code>ACME\\priya.s</code> ho lekin rule <code>priya.s@acme.example</code> use kare to match fail hota hai, bhale dono ek hi insaan ho. Domain map ya har jagah ek hi format use karo.</p>

<div class="eg"><p><b>Worked example.</b> Company ke AD mein Engineers, Finance aur Contractors groups hain. Group mapping mein team sirf yeh teen include karti hai. Poori directory ki firewall copy nahi banti. Contractor chala jaye to HR use Contractors se hata deta hai; lagbhag ek minute mein firewall badlav dekh leta hai aur contractor-specific rules match hona band ho jaati hain.</p></div>

<h3>Group mapping verify karna</h3>
<p>Reference commands (not run in the simulator, isliye output nahi dikhaya): <code>show user group-mapping state all</code> dikhata hai ki firewall har configured group mapping padh pa raha hai ya nahi aur last update kab hua; <code>show user group list</code> woh groups list karta hai jo firewall ne seekhe hain; <code>show user group name "cn=engineers,ou=groups,dc=acme,dc=example"</code> ek group ke members dikhata hai. Group list mein na ho to woh include list mein nahi tha ya bind account use padh nahi sakta.</p>

<h3>Data ki aam problems</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th></tr>
<tr><td>Group list khaali</td><td>Bind DN, password ya base DN galat; port 636 blocked; certificate trusted nahi</td></tr>
<tr><td>Group directory mein hai lekin firewall par nahi</td><td>Include list mein nahi, ya search base ke bahar</td></tr>
<tr><td>Group mein kuch users missing</td><td>Nested groups: member child group mein hai; directory mein nested group handling check karo</td></tr>
<tr><td>User group mein hai phir bhi rule match nahi</td><td>Rule aur mapping mein domain name format alag; ya group update abhi chala nahi</td></tr>
</table>

<div class="note"><p><b>Note.</b> Role-based design: har insaan ke liye sau groups ke bajaye kuch saaf groups (Engineers, Finance) jo roles se map hon. Policy padhne layak rehti hai aur include list chhoti. Iska authentication aur directory wala hissa sec-aaa-mgmt module ka kshetra hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Write rights waala service account use karna, ya bind password plain LDAP par bhejna. Read-only rights aur trusted certificate ke saath LDAPS use karo. Is course mein password hamesha placeholder hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> IP-user mapping (is IP par kaun hai) aur group mapping (user kin groups mein hai) ka fark yaad rakho. Yeh bhi ki group mapping update interval default 60 seconds hai aur sirf zaroori groups include karte hain.</p></div>

<div class="scn"><h4>Sahi group, galat spelling</h4><p>Finance group ki rule match nahi hui jabki finance staff mapped tha. Mappings ACME-domain-naam-phir-user form use kar rahe the jabki group UPN form. Team ne group mapping mein ek User Domain aur ek name format set kiya, aur agle update par rule match hone lagi.</p><p><b>Lesson:</b> Identity ko mapping, group mapping aur rules mein ek consistent naming format chahiye.</p></div>

<div class="iv"><p class="q">"Firewall group membership kaise seekhta hai, aur use kaise use karta hai?"</p><p>LDAP server profile aur group mapping settings se directory se group membership padhta hai, update interval par refresh hota hai aur include list se limited. Policy time par IP-user mapping se IP user deta hai, group mapping se user groups deta hai, aur group naam leti rule match karti hai. LDAPS aur read-only account use karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group mapping LDAP server profile ke zariye directory se user-to-group membership padhta hai.</li>
<li>Sirf policy mein use hone waale groups include karo; default update interval 60 seconds hai.</li>
<li>LDAPS (port 636) aur read-only service account use karo; notes mein asli password kabhi nahi.</li>
<li>Mappings aur rules mein ek consistent user name format (domain aur user) use karo.</li>
<li>Real firewall par show user group-mapping state all aur show user group list se verify karo.</li>
</ul></div>

`}};export{e as default};