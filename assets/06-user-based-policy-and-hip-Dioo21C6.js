var e={id:`user-based-policy-and-hip`,h:{en:`User-based policy: User-ID, Cloud Identity Engine and HIP`,hi:`User-based policy: User-ID, Cloud Identity Engine aur HIP`},body:{en:`
<p>An office building can have two kinds of door signs. One says "Room 12". The other says "Finance team only". The second is far more useful, because rooms get renamed and people move desks, but the team stays the same. A firewall sees IP addresses, which are like room numbers. <b>User-based policy</b> lets you write "Finance team only" and have the firewall work out which IP belongs to which person right now.</p>

<h3>The three pieces of identity</h3>
<table class="cmp">
<tr><th>Piece</th><th>What it does</th><th>Where it comes from</th></tr>
<tr><td>IP-to-user mapping</td><td>Tells the firewall "10.200.0.7 is currently lab-user1".</td><td>Created when the user signs in through GlobalProtect.</td></tr>
<tr><td>User-to-group mapping</td><td>Tells the firewall "lab-user1 is in the finance group".</td><td>Directory data via Cloud Identity Engine or a User-ID master device.</td></tr>
<tr><td>Device state (HIP)</td><td>Tells the firewall "this laptop has disk encryption and an up-to-date patch level".</td><td>Reported by the GlobalProtect app.</td></tr>
</table>

<h3>Cloud Identity Engine and User-ID</h3>
<p>User-ID is the Palo Alto Networks feature that maps traffic to users and groups. In Prisma Access, the user and group data can come from the <b>Cloud Identity Engine</b> (a cloud service that reads your directory and shares user and group information) or from a <b>User-ID master device</b> (a firewall or Panorama-style device that collects the mappings). Either way, two mappings are required: IP to user, and user to group. If one is missing, rules that name a user or group will not match, and the traffic will fall to a later rule.</p>
<p>The documentation also notes that in the migration of Panorama to SCM, the Cloud Identity Engine Directory Sync must be integrated first. Identity is a prerequisite, not an add-on.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Identity flow">
<rect x="15" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Directory</text>
<rect x="195" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="270" y="50" text-anchor="middle" class="svg-ink" font-size="13">Cloud Identity Engine</text>
<rect x="395" y="20" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access: user to group</text>
<rect x="15" y="130" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="160" text-anchor="middle" class="svg-ink" font-size="13">GlobalProtect app</text>
<rect x="195" y="130" width="150" height="50" rx="8" fill="#fde68a"/><text x="270" y="160" text-anchor="middle" class="svg-ink" font-size="13">Login + HIP report</text>
<rect x="395" y="130" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="160" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access: IP to user, HIP</text>
<line x1="145" y1="45" x2="195" y2="45" stroke="#64748b" stroke-width="2"/><line x1="345" y1="45" x2="395" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="145" y1="155" x2="195" y2="155" stroke="#64748b" stroke-width="2"/><line x1="345" y1="155" x2="395" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">Both mappings must exist for user and group rules to match</text>
</svg><p class="cap">Top row: user-to-group data from the directory. Bottom row: IP-to-user and device state from the client.</p></div>

<h3>Writing a user-based rule</h3>
<p>In the rule, the Source user field takes a user or group instead of "any". Combine it with the zone and the application.</p>
<div class="eg"><p><b>Worked example.</b> The finance application server sits at 10.10.0.50. Only the group <code>finance-users</code> should reach it. Rule A allows source user group finance-users to destination address 10.10.0.50, application ssl, profile group corp-standard. Rule B, below it, denies all other mobile users to that address and logs. A finance user on the laptop 203.0.113.50 (address from pool 10.200.0.0/23) matches Rule A. A support user with the same pool and the same tunnel matches Rule B. The network path is identical; only the identity differs.</p></div>
<pre class="code"><span class="c"># Teaching format</span>
Rule A  allow-finance-to-app
  Source user:      group finance-users
  Destination addr: 10.10.0.50
  Application:      ssl
  Action:           allow    Profile group: corp-standard

Rule B  deny-others-to-app
  Source user:      any
  Destination addr: 10.10.0.50
  Action:           deny     Log at session end</pre>

<h3>HIP in rules</h3>
<p>The GlobalProtect app sends a <b>host information profile (HIP)</b> report: facts about the device, such as encryption state, patch level and security software. In the device group you create <b>HIP objects</b> (one test, for example "disk encrypted") and <b>HIP profiles</b> (combinations of objects). A rule can then require a HIP profile in addition to user and application, so a managed, healthy laptop gets access and an unhealthy one does not. A <b>HIP Match</b> log type records the matches, and HIP information can be redistributed to other devices (a concept covered in the mobile users module).</p>
<pre class="out">HIP Match log
Time      User        Source IP     HIP profile       Match
13:20:09  lab-user1   10.200.0.7    <span class="hl">managed-healthy</span>   yes
13:24:51  lab-user2   10.200.0.9    managed-healthy   <span class="hl">no</span></pre>

<h3>Identity troubleshooting rhythm</h3>
<ol>
<li>Open the traffic log. Is the source user filled in? If it shows only an IP, identity is missing.</li>
<li>If the user shows but the group rule does not match, check group membership data (Cloud Identity Engine or the master device).</li>
<li>If a HIP rule does not match, look at the HIP Match log for that user.</li>
<li>Confirm the user signed in recently; mappings refresh with sign-in.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Writing a group rule without making sure group data reaches Prisma Access; testing from a user who is not in the group and concluding the rule is broken; putting a user-based deny above the allow for the same destination; relying on HIP checks without testing a failing device.</p></div>
<div class="exam"><p><b>Exam trap.</b> User-based rules need both IP-to-user and user-to-group mappings. The sources named for them are Cloud Identity Engine and a User-ID master device. HIP objects and profiles belong in the device group; HIP Match is a separate log type.</p></div>

<div class="scn"><h4>The finance rule that matched nobody</h4><p>A new finance-only rule showed zero hits for a week. The traffic log showed finance users coming in with their user name filled, but the rule used the group name from the old directory structure. The Cloud Identity Engine had synchronised the renamed group, so the old name matched no one. After updating the rule to the current group, hits appeared.</p><p><b>Lesson:</b> a rule that never hits is a finding. Compare the group name in the rule with the group name in the directory data.</p></div>

<div class="iv"><p class="q">"How does Prisma Access apply policy per user?"</p><p>Through User-ID: IP-to-user mapping from the sign-in and user-to-group mapping from the Cloud Identity Engine or a User-ID master device. The rule's Source user field then uses users or groups. Add HIP profiles for device posture and mention that the traffic log shows the resolved user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User-based rules need IP-to-user and user-to-group mappings.</li>
<li>Cloud Identity Engine or a User-ID master device supplies the data.</li>
<li>HIP objects and profiles in the device group can be required in rules.</li>
<li>The HIP Match log records posture decisions.</li>
<li>No user in the traffic log means identity is missing, not that the rule is wrong.</li>
</ul></div>
`,hi:`
<p>Office building mein do tarah ke door signs ho sakte hain. Ek kehta hai "Room 12". Doosra kehta hai "Sirf Finance team". Doosra kaafi zyada kaam ka hai, kyunki rooms ke naam badal jaate hain aur log desk badalte hain, lekin team wahi rehti hai. Firewall IP addresses dekhta hai, jo room numbers jaise hain. <b>User-based policy</b> aapko "Sirf Finance team" likhne deti hai aur firewall khud nikaalta hai ki abhi kaunsa IP kis insaan ka hai.</p>

<h3>Identity ke teen hisse</h3>
<table class="cmp">
<tr><th>Hissa</th><th>Kya karta hai</th><th>Kahan se aata hai</th></tr>
<tr><td>IP-to-user mapping</td><td>Firewall ko batata hai "10.200.0.7 abhi lab-user1 hai".</td><td>User GlobalProtect se sign in kare tab banta hai.</td></tr>
<tr><td>User-to-group mapping</td><td>Firewall ko batata hai "lab-user1 finance group mein hai".</td><td>Directory data, Cloud Identity Engine ya User-ID master device se.</td></tr>
<tr><td>Device state (HIP)</td><td>Firewall ko batata hai "is laptop mein disk encryption aur up-to-date patch level hai".</td><td>GlobalProtect app report karta hai.</td></tr>
</table>

<h3>Cloud Identity Engine aur User-ID</h3>
<p>User-ID Palo Alto Networks ka feature hai jo traffic ko users aur groups se map karta hai. Prisma Access mein user aur group data <b>Cloud Identity Engine</b> se aa sakta hai (cloud service jo aapki directory padhti hai aur user aur group information share karti hai) ya <b>User-ID master device</b> se (firewall ya Panorama jaisa device jo mappings collect karta hai). Dono mein se kuch bhi ho, do mappings chahiye: IP se user, aur user se group. Ek bhi missing ho to user ya group naam wale rules match nahi honge, aur traffic baad ke rule par chala jayega.</p>
<p>Documentation ye bhi batati hai ki Panorama se SCM migration mein Cloud Identity Engine Directory Sync pehle integrate hona chahiye. Identity prerequisite hai, add-on nahi.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Identity flow">
<rect x="15" y="20" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Directory</text>
<rect x="195" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="270" y="50" text-anchor="middle" class="svg-ink" font-size="13">Cloud Identity Engine</text>
<rect x="395" y="20" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="50" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access: user to group</text>
<rect x="15" y="130" width="130" height="50" rx="8" fill="#bae6fd"/><text x="80" y="160" text-anchor="middle" class="svg-ink" font-size="13">GlobalProtect app</text>
<rect x="195" y="130" width="150" height="50" rx="8" fill="#fde68a"/><text x="270" y="160" text-anchor="middle" class="svg-ink" font-size="13">Login + HIP report</text>
<rect x="395" y="130" width="230" height="50" rx="8" fill="#bbf7d0"/><text x="510" y="160" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access: IP to user, HIP</text>
<line x1="145" y1="45" x2="195" y2="45" stroke="#64748b" stroke-width="2"/><line x1="345" y1="45" x2="395" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="145" y1="155" x2="195" y2="155" stroke="#64748b" stroke-width="2"/><line x1="345" y1="155" x2="395" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">User aur group rules ke liye dono mappings hone chahiye</text>
</svg><p class="cap">Upar ki row: directory se user-to-group data. Neeche ki row: client se IP-to-user aur device state.</p></div>

<h3>User-based rule likhna</h3>
<p>Rule mein Source user field "any" ki jagah user ya group leta hai. Ise zone aur application ke saath combine karo.</p>
<div class="eg"><p><b>Worked example.</b> Finance application server 10.10.0.50 par hai. Sirf group <code>finance-users</code> use khol sake. Rule A source user group finance-users ko destination address 10.10.0.50, application ssl, profile group corp-standard ke saath allow karta hai. Rule B, uske neeche, us address tak baaki sab mobile users ko deny karta hai aur log karta hai. Laptop 203.0.113.50 par finance user (pool 10.200.0.0/23 se address) Rule A match karta hai. Same pool aur same tunnel wala support user Rule B match karta hai. Network path same hai; sirf identity alag hai.</p></div>
<pre class="code"><span class="c"># Teaching format</span>
Rule A  allow-finance-to-app
  Source user:      group finance-users
  Destination addr: 10.10.0.50
  Application:      ssl
  Action:           allow    Profile group: corp-standard

Rule B  deny-others-to-app
  Source user:      any
  Destination addr: 10.10.0.50
  Action:           deny     Log at session end</pre>

<h3>Rules mein HIP</h3>
<p>GlobalProtect app <b>host information profile (HIP)</b> report bhejta hai: device ke facts, jaise encryption state, patch level aur security software. Device group mein aap <b>HIP objects</b> (ek test, jaise "disk encrypted") aur <b>HIP profiles</b> (objects ke combinations) banate ho. Rule user aur application ke saath HIP profile bhi maang sakta hai, taaki managed, healthy laptop ko access mile aur unhealthy ko nahi. <b>HIP Match</b> log type matches record karta hai, aur HIP information doosre devices ko redistribute ho sakti hai (mobile users module ka concept).</p>
<pre class="out">HIP Match log
Time      User        Source IP     HIP profile       Match
13:20:09  lab-user1   10.200.0.7    <span class="hl">managed-healthy</span>   yes
13:24:51  lab-user2   10.200.0.9    managed-healthy   <span class="hl">no</span></pre>

<h3>Identity troubleshooting ka rhythm</h3>
<ol>
<li>Traffic log kholo. Source user bhara hai? Sirf IP dikhe to identity missing hai.</li>
<li>User dikhe lekin group rule match na ho to group membership data check karo (Cloud Identity Engine ya master device).</li>
<li>HIP rule match na ho to us user ka HIP Match log dekho.</li>
<li>Confirm karo ki user ne recent sign in kiya hai; mappings sign-in ke saath refresh hote hain.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Group rule likhna bina ye sunishchit kiye ki group data Prisma Access tak pahunchta hai; group mein na hone wale user se test karke rule ko broken maan lena; same destination ke allow ke upar user-based deny rakhna; failing device test kiye bina HIP checks par depend karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> User-based rules ko IP-to-user aur user-to-group dono mappings chahiye. Inke sources Cloud Identity Engine aur User-ID master device hain. HIP objects aur profiles device group mein hote hain; HIP Match alag log type hai.</p></div>

<div class="scn"><h4>Finance rule jo kisi se match nahi hua</h4><p>Naya finance-only rule ek hafte tak zero hits dikhata raha. Traffic log mein finance users ka user name bhara aa raha tha, lekin rule purani directory structure ka group name use kar raha tha. Cloud Identity Engine ne renamed group sync kar diya tha, isliye purana naam kisi se match nahi hua. Rule ko current group mein update karne ke baad hits aane lage.</p><p><b>Lesson:</b> jis rule ko kabhi hit na mile wo ek finding hai. Rule ka group name directory data ke group name se compare karo.</p></div>

<div class="iv"><p class="q">"Prisma Access per user policy kaise lagata hai?"</p><p>User-ID se: sign-in se IP-to-user mapping aur Cloud Identity Engine ya User-ID master device se user-to-group mapping. Rule ka Source user field phir users ya groups use karta hai. Device posture ke liye HIP profiles jodo aur batao ki traffic log resolved user dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>User-based rules ko IP-to-user aur user-to-group mappings chahiye.</li>
<li>Cloud Identity Engine ya User-ID master device data deta hai.</li>
<li>Device group ke HIP objects aur profiles rules mein maange ja sakte hain.</li>
<li>HIP Match log posture decisions record karta hai.</li>
<li>Traffic log mein user nahi hai to identity missing hai, rule galat nahi.</li>
</ul></div>
`}};export{e as default};