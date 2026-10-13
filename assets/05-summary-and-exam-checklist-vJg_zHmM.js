var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one minute</h3>
<p>SNMP lets a manager (the NMS, 10.1.50.100) read values from agents on devices over UDP 161, and lets agents push traps and informs to UDP 162. Objects live in a tree; an OID is the numeric address and a MIB explains the names. Version 2c protects access with a clear-text community, which you must make read-only, non-default and restricted by an ACL such as ACL 20. Version 3 replaces communities with users: USM provides identity, authentication and privacy; VACM provides groups, views and access. The recommended level is authPriv with SHA and AES-128. When SNMP fails, read the exact error and fix the layer it names.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SNMP summary map">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">NMS manager</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">10.1.50.100</text>
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Router agent</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">loopback 10.255.0.x</text>
<line x1="150" y1="35" x2="250" y2="35" stroke="#64748b" stroke-width="2"/><text x="200" y="28" text-anchor="middle" class="svg-muted" font-size="11">get UDP 161</text>
<line x1="250" y1="58" x2="150" y2="58" stroke="#64748b" stroke-width="2"/><text x="200" y="76" text-anchor="middle" class="svg-muted" font-size="11">trap UDP 162</text>
<rect x="450" y="10" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="535" y="30" text-anchor="middle" class="svg-ink" font-size="12">v2c: GF-RO + ACL 20</text>
<rect x="450" y="50" width="170" height="30" rx="6" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="12">v3: GF-MON / nmsadmin</text>
<rect x="20" y="110" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">timeout / unknown user / authentication / decryption / authorization: read the error</text>
</svg><p class="cap">Manager, agent, the two credential styles and the error ladder.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain manager, agent, MIB, OID, instance and the operations get, getnext, walk, set, trap and inform (chapter 1).</li>
<li>Write the OIDs of sysName, ifOperStatus and ifInOctets and read an snmpwalk (chapter 1).</li>
<li>Configure a v2c read-only community with ACL 20 and prove it with show snmp community (chapter 2).</li>
<li>Explain why public and private are unsafe and why an ACL does not encrypt (chapter 2).</li>
<li>Configure traps: enable traps, snmp-server host with version 2c GF-TRAP, trap-source Loopback0, and check show traps (chapter 2).</li>
<li>Describe USM, VACM and the three security levels (chapter 3).</li>
<li>Configure view, group GF-MON and user nmsadmin with SHA Auth#Key26 and AES-128 Priv#Key26, and poll with snmpget -v3 (chapter 3).</li>
<li>Match each error message to its cause and fix a v3 authentication failure without lowering security (chapter 4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACL 20</dt><dd>Standard access list permitting host 10.1.50.100, bound to the community or group.</dd>
<dt>Agent</dt><dd>The SNMP software on the device, listening on UDP 161.</dd>
<dt>authPriv</dt><dd>Authentication plus encryption; the recommended v3 level.</dd>
<dt>Community</dt><dd>The clear-text shared secret of v1 and v2c.</dd>
<dt>Engine ID</dt><dd>The unique identity of an SNMP agent, used to derive v3 keys.</dd>
<dt>GetBulk</dt><dd>A v2c and v3 request for many rows at once.</dd>
<dt>Inform</dt><dd>An acknowledged trap.</dd>
<dt>MIB</dt><dd>The file that names and describes objects.</dd>
<dt>OID</dt><dd>The dotted numeric address of an object.</dd>
<dt>USM</dt><dd>User-based Security Model: users, authentication, privacy.</dd>
<dt>VACM</dt><dd>View-based Access Control Model: groups, views, access.</dd>
<dt>View</dt><dd>The part of the OID tree a group may read or write.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Poll port / trap port</td><td>UDP 161 / UDP 162</td></tr>
<tr><td>sysName</td><td>1.3.6.1.2.1.1.5.0</td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td></tr>
<tr><td>v1 and v2c security</td><td>clear-text community</td></tr>
<tr><td>v3 recommended level</td><td>authPriv, SHA, AES-128</td></tr>
<tr><td>Trap versus inform</td><td>unacknowledged versus acknowledged</td></tr>
<tr><td>Godavari v2c</td><td>GF-RO read-only with ACL 20; GF-TRAP for traps</td></tr>
<tr><td>Godavari v3</td><td>group GF-MON, user nmsadmin, SHA Auth#Key26, AES-128 Priv#Key26</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! v2c read-only</span>
access-list 20 permit host 10.1.50.100
snmp-server community GF-RO RO 20
<span class="c">! traps</span>
snmp-server enable traps snmp linkdown linkup
snmp-server enable traps config
snmp-server host 10.1.50.100 version 2c GF-TRAP
snmp-server trap-source Loopback0
<span class="c">! v3 authPriv</span>
snmp-server view GF-VIEW iso included
snmp-server group GF-MON v3 priv read GF-VIEW access 20
snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26
<span class="c">! verify</span>
show snmp community | show snmp user | show snmp group | show snmp host | show snmp
<span class="c">! on the NMS</span>
snmpget -c GF-RO 10.255.0.1 sysName.0
snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
show traps</pre>

<h3>Security rules to remember</h3>
<ul>
<li>Never use public or private; choose long, unique names.</li>
<li>Restrict every community and group by ACL to the NMS address.</li>
<li>Use read-only access for monitoring; avoid RW.</li>
<li>Prefer SNMPv3 authPriv with SHA and AES; keep passwords secret and unique.</li>
<li>Move to v3 with an overlap period so monitoring never goes blind.</li>
</ul>
<p>Scope note: this track simulates SNMP v2c and v3 polling and traps for a handful of objects. It does not simulate full MIB trees or real cryptography, and vendor-specific details come from the vendor documentation.</p>

<div class="warn"><p><b>Last common mistakes.</b> Typing a community with a zero for the letter O; leaving the ACL out; asking at a lower level than the group requires; testing from the router instead of the NMS; changing several things at once.</p></div>
<div class="exam"><p><b>Exam traps to remember.</b> 161 asks, 162 tells. Informs are acknowledged, traps are not. authNoPriv does not encrypt. Authentication failure means the user exists; unknown user means it does not. An ACL limits use of a community but does not hide it.</p></div>

<div class="scn"><h4>Onboarding a new branch router</h4><p>Godavari opened a small office and Priya had to bring its router into monitoring on day one. She created ACL 20 for the NMS, a v3 group and user with the company standard, set the trap host with a loopback source, polled with snmpget -v3 from the NMS, shut and re-opened a port to see the trap, and saved the evidence in the ticket. The whole change took twenty minutes and nobody had to ask what "monitored" meant.</p><p><b>Lesson:</b> a repeatable checklist and evidence make onboarding boring, which is the goal.</p></div>

<div class="iv"><p class="q">"How would you design SNMP monitoring for a company with three sites?"</p><p>Strong answer: a central NMS polling every 5 minutes over SNMPv3 authPriv with SHA and AES, a group and user per purpose, an ACL limiting sources to the NMS, loopback addresses as agent and trap sources, informs or traps for instant events, and polling that alerts on missing answers. Add a staged cutover from v2c and a documented troubleshooting ladder.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager polls UDP 161; agent notifies UDP 162; OIDs name objects and MIBs explain them.</li>
<li>v2c: clear-text community, read-only, ACL 20, never public or private.</li>
<li>v3: user in a group with a view; authPriv with SHA and AES is the target.</li>
<li>Traps are unacknowledged, informs acknowledged; set trap-source Loopback0.</li>
<li>Read the exact error, work the ladder, fix one thing and verify.</li>
</ul></div>
`,hi:`
<h3>Module ek minute mein</h3>
<p>SNMP manager (NMS, 10.1.50.100) ko UDP 161 par devices ke agents se values padhne deta hai, aur agents ko UDP 162 par traps aur informs push karne deta hai. Objects ek tree mein rehte hain; OID numeric address hai aur MIB naamon ko samjhata hai. Version 2c access ko clear-text community se protect karta hai, jise aapko read-only, non-default aur ACL 20 jaisi ACL se restrict banana hai. Version 3 communities ki jagah users laata hai: USM identity, authentication aur privacy deta hai; VACM groups, views aur access deta hai. Recommended level SHA aur AES-128 ke saath authPriv hai. SNMP fail ho to exact error padho aur jis layer ka naam woh leta hai use fix karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SNMP summary map">
<rect x="20" y="20" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="85" y="42" text-anchor="middle" class="svg-ink" font-size="13">NMS manager</text><text x="85" y="59" text-anchor="middle" class="svg-muted" font-size="11">10.1.50.100</text>
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Router agent</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">loopback 10.255.0.x</text>
<line x1="150" y1="35" x2="250" y2="35" stroke="#64748b" stroke-width="2"/><text x="200" y="28" text-anchor="middle" class="svg-muted" font-size="11">get UDP 161</text>
<line x1="250" y1="58" x2="150" y2="58" stroke="#64748b" stroke-width="2"/><text x="200" y="76" text-anchor="middle" class="svg-muted" font-size="11">trap UDP 162</text>
<rect x="450" y="10" width="170" height="30" rx="6" fill="#bbf7d0"/><text x="535" y="30" text-anchor="middle" class="svg-ink" font-size="12">v2c: GF-RO + ACL 20</text>
<rect x="450" y="50" width="170" height="30" rx="6" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="12">v3: GF-MON / nmsadmin</text>
<rect x="20" y="110" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">timeout / unknown user / authentication / decryption / authorization: error padho</text>
</svg><p class="cap">Manager, agent, do tarah ke credentials aur error ladder.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Manager, agent, MIB, OID, instance aur operations get, getnext, walk, set, trap aur inform explain karna (chapter 1).</li>
<li>sysName, ifOperStatus aur ifInOctets ke OIDs likhna aur snmpwalk padhna (chapter 1).</li>
<li>ACL 20 ke saath v2c read-only community configure karna aur show snmp community se prove karna (chapter 2).</li>
<li>Explain karna ki public aur private unsafe kyun hain aur ACL encrypt kyun nahi karti (chapter 2).</li>
<li>Traps configure karna: enable traps, version 2c GF-TRAP ke saath snmp-server host, trap-source Loopback0, aur show traps check karna (chapter 2).</li>
<li>USM, VACM aur teen security levels describe karna (chapter 3).</li>
<li>View, group GF-MON aur user nmsadmin ko SHA Auth#Key26 aur AES-128 Priv#Key26 ke saath configure karna, aur snmpget -v3 se poll karna (chapter 3).</li>
<li>Har error message ko uske cause se match karna aur security kam kiye bina v3 authentication failure fix karna (chapter 4).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACL 20</dt><dd>Standard access list jo host 10.1.50.100 ko permit karti hai, community ya group se bandhi.</dd>
<dt>Agent</dt><dd>Device par SNMP software, UDP 161 par listen karta hai.</dd>
<dt>authPriv</dt><dd>Authentication plus encryption; recommended v3 level.</dd>
<dt>Community</dt><dd>v1 aur v2c ka clear-text shared secret.</dd>
<dt>Engine ID</dt><dd>SNMP agent ki unique pehchan, v3 keys banane mein use hoti hai.</dd>
<dt>GetBulk</dt><dd>v2c aur v3 ki ek saath kai rows maangne wali request.</dd>
<dt>Inform</dt><dd>Acknowledged trap.</dd>
<dt>MIB</dt><dd>Woh file jo objects ko naam aur description deti hai.</dd>
<dt>OID</dt><dd>Object ka dotted numeric address.</dd>
<dt>USM</dt><dd>User-based Security Model: users, authentication, privacy.</dd>
<dt>VACM</dt><dd>View-based Access Control Model: groups, views, access.</dd>
<dt>View</dt><dd>OID tree ka woh hissa jo group padh ya likh sakta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Poll port / trap port</td><td>UDP 161 / UDP 162</td></tr>
<tr><td>sysName</td><td>1.3.6.1.2.1.1.5.0</td></tr>
<tr><td>ifOperStatus.N</td><td>1.3.6.1.2.1.2.2.1.8.N</td></tr>
<tr><td>v1 aur v2c security</td><td>clear-text community</td></tr>
<tr><td>v3 recommended level</td><td>authPriv, SHA, AES-128</td></tr>
<tr><td>Trap versus inform</td><td>unacknowledged versus acknowledged</td></tr>
<tr><td>Godavari v2c</td><td>ACL 20 ke saath GF-RO read-only; traps ke liye GF-TRAP</td></tr>
<tr><td>Godavari v3</td><td>group GF-MON, user nmsadmin, SHA Auth#Key26, AES-128 Priv#Key26</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! v2c read-only</span>
access-list 20 permit host 10.1.50.100
snmp-server community GF-RO RO 20
<span class="c">! traps</span>
snmp-server enable traps snmp linkdown linkup
snmp-server enable traps config
snmp-server host 10.1.50.100 version 2c GF-TRAP
snmp-server trap-source Loopback0
<span class="c">! v3 authPriv</span>
snmp-server view GF-VIEW iso included
snmp-server group GF-MON v3 priv read GF-VIEW access 20
snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26
<span class="c">! verify</span>
show snmp community | show snmp user | show snmp group | show snmp host | show snmp
<span class="c">! on the NMS</span>
snmpget -c GF-RO 10.255.0.1 sysName.0
snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
show traps</pre>

<h3>Yaad rakhne wale security rules</h3>
<ul>
<li>public ya private kabhi nahi; lambe, unique naam chuno.</li>
<li>Har community aur group ko ACL se sirf NMS address tak restrict karo.</li>
<li>Monitoring ke liye read-only access; RW avoid karo.</li>
<li>SHA aur AES ke saath SNMPv3 authPriv prefer karo; passwords secret aur unique rakho.</li>
<li>v3 par overlap period ke saath move karo taaki monitoring kabhi blind na ho.</li>
</ul>
<p>Scope note: yeh track kuch objects ke liye SNMP v2c aur v3 polling aur traps simulate karta hai. Yeh full MIB trees ya real cryptography simulate nahi karta, aur vendor-specific details vendor documentation se aate hain.</p>

<div class="warn"><p><b>Aakhri common galtiyan.</b> Letter O ki jagah zero wali community type karna; ACL chhod dena; group ki zaroorat se kam level par poochna; NMS ki jagah router se test karna; kai cheezein ek saath badalna.</p></div>
<div class="exam"><p><b>Yaad rakhne wale exam traps.</b> 161 poochta hai, 162 batata hai. Informs acknowledged hote hain, traps nahi. authNoPriv encrypt nahi karta. Authentication failure matlab user exist karta hai; unknown user matlab nahi karta. ACL community ke use ko limit karti hai lekin use chhupati nahi.</p></div>

<div class="scn"><h4>Naye branch router ko onboard karna</h4><p>Godavari ne ek chhota office kholi aur Priya ko pehle din hi uske router ko monitoring mein laana tha. Usne NMS ke liye ACL 20 banayi, company standard ke saath v3 group aur user banaya, loopback source ke saath trap host set kiya, NMS se snmpget -v3 se poll kiya, trap dekhne ke liye ek port shut karke dobara khola, aur evidence ticket mein save kiya. Poora change bees minute mein ho gaya aur kisi ko poochna nahi pada ki "monitored" ka matlab kya hai.</p><p><b>Seekh:</b> repeatable checklist aur evidence onboarding ko boring bana dete hain, aur yahi goal hai.</p></div>

<div class="iv"><p class="q">"Teen sites wali company ke liye SNMP monitoring kaise design karoge?"</p><p>Strong answer: ek central NMS jo har 5 minute SNMPv3 authPriv par SHA aur AES ke saath poll kare, har purpose ke liye group aur user, sources ko NMS tak limit karne wali ACL, agent aur trap sources ke roop mein loopback addresses, instant events ke liye informs ya traps, aur polling jo missing answers par alert kare. Jodo v2c se staged cutover aur documented troubleshooting ladder.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Manager UDP 161 par poll karta hai; agent UDP 162 par notify karta hai; OIDs objects ko naam dete hain aur MIBs unhe samjhate hain.</li>
<li>v2c: clear-text community, read-only, ACL 20, kabhi public ya private nahi.</li>
<li>v3: view ke saath group mein user; SHA aur AES ke saath authPriv target hai.</li>
<li>Traps unacknowledged, informs acknowledged; trap-source Loopback0 set karo.</li>
<li>Exact error padho, ladder par kaam karo, ek cheez fix karo aur verify karo.</li>
</ul></div>
`}};export{e as default};