var e={id:`snmpv3-users-auth-privacy`,h:{en:`SNMPv3: users, authentication and privacy`,hi:`SNMPv3: users, authentication aur privacy`},body:{en:`
<h3>An analogy: the sealed, signed courier envelope</h3>
<p>Version 2c is a postcard: anyone handling it can read the community and the answer. Version 3 is a courier envelope with two protections. It carries a <b>signature</b> that proves who sent it and that nobody changed the contents (authentication). It can also be <b>sealed</b> so nobody can read what is inside (privacy). The courier also checks a guest list before handing anything over (access control). SNMPv3 is exactly these three ideas.</p>

<h3>The two models inside v3</h3>
<dl class="terms">
<dt>USM (User-based Security Model)</dt><dd>Answers "who are you and is this message genuine?" Each request names a <b>user</b>. The user has an authentication protocol and password (SHA or MD5) and optionally a privacy protocol and password (AES or DES). The agent checks the signature; if privacy is on, it decrypts.</dd>
<dt>VACM (View-based Access Control Model)</dt><dd>Answers "what may this user see or change?" Users belong to a <b>group</b>. The group has a minimum <b>security level</b> and a <b>view</b> (the part of the OID tree it may read or write).</dd>
</dl>
<p>So the chain is: user, in a group, with a view and a security level. Break any link and access fails.</p>

<h3>The three security levels</h3>
<table class="cmp"><tr><th>Level</th><th>Authentication</th><th>Encryption</th><th>Use</th></tr>
<tr><td>noAuthNoPriv</td><td>no (user name only)</td><td>no</td><td>avoid</td></tr>
<tr><td>authNoPriv</td><td>yes (HMAC)</td><td>no</td><td>acceptable on a trusted management network</td></tr>
<tr><td>authPriv</td><td>yes</td><td>yes</td><td>recommended</td></tr></table>
<p>The group sets the <b>minimum</b>. A user in an authPriv group must be created with both auth and priv, and the manager must ask at level authPriv. Ask for less and the agent refuses; the error is an authorization error.</p>
<p>Prefer SHA over MD5 for authentication and AES-128 over DES for privacy. Passwords must be at least 8 characters on most platforms. The user's keys are derived from the password and the agent's <b>engine ID</b>, which is why the user line does not appear in the running configuration of a real device.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNMPv3 request path">
<rect x="15" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="93" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="11">user nmsadmin</text>
<rect x="165" y="30" width="130" height="40" rx="8" fill="#bae6fd"/><text x="230" y="55" text-anchor="middle" class="svg-ink" font-size="12">USM: who? genuine?</text>
<rect x="165" y="125" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="230" y="150" text-anchor="middle" class="svg-ink" font-size="12">decrypt if priv</text>
<rect x="335" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="395" y="93" text-anchor="middle" class="svg-ink" font-size="12">VACM</text><text x="395" y="110" text-anchor="middle" class="svg-muted" font-size="11">group GF-MON</text>
<rect x="495" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="560" y="93" text-anchor="middle" class="svg-ink" font-size="12">MIB view</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">GF-VIEW (iso)</text>
<line x1="125" y1="95" x2="165" y2="52" stroke="#64748b" stroke-width="2"/><line x1="125" y1="98" x2="165" y2="143" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="52" x2="335" y2="90" stroke="#64748b" stroke-width="2"/><line x1="295" y1="143" x2="335" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="455" y1="95" x2="495" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The agent checks the user and keys first (USM), then what the user's group may see (VACM).</p></div>

<h3>Configuration walkthrough (lab obs-snmp-2)</h3>
<p>Godavari's standard is: group <b>GF-MON</b> at authPriv, user <b>nmsadmin</b> with SHA authentication password <code>Auth#Key26</code> and AES-128 privacy password <code>Priv#Key26</code>. These are lab values; real passwords must be unique and secret.</p>
<pre class="code"><span class="c">! 1. what the group may read (the whole standard tree)</span>
HYD-CORE-R1(config)# snmp-server view GF-VIEW iso included
<span class="c">! 2. the group: v3, authPriv, read view, only from the NMS (ACL 20)</span>
HYD-CORE-R1(config)# snmp-server group GF-MON v3 priv read GF-VIEW access 20
<span class="c">! 3. the user: member of GF-MON, SHA auth, AES-128 privacy</span>
HYD-CORE-R1(config)# snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26
<span class="c">! 4. optional: v3 traps to the NMS</span>
HYD-CORE-R1(config)# snmp-server host 10.1.50.100 version 3 priv nmsadmin</pre>
<p>Order matters in the sense that the group must exist before the user is useful. Remember ACL 20 already permits host 10.1.50.100 from chapter 2. Now verify both parts:</p>
<pre class="out">HYD-CORE-R1# show snmp group
groupname: GF-MON                          security model:v3 priv
contextname: &lt;no context specified&gt;           storage-type: nonvolatile
readview : GF-VIEW                         writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active    access-list: 20

HYD-CORE-R1# show snmp user
User name: nmsadmin
Engine ID: 800000090300AABBCC001100
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: GF-MON</pre>
<p>Note the group has no writeview: v3 here is read-only by design. Now poll from the NMS with all three options matching the user:</p>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span></pre>
<p>The options: <code>-v3</code> version, <code>-u</code> user name, <code>-l</code> level, <code>-a</code> and <code>-A</code> authentication protocol and password, <code>-x</code> and <code>-X</code> privacy protocol and password. A packet capture of this exchange shows only the user name; the OIDs and values are encrypted, which is the benefit of authPriv over v2c.</p>

<div class="eg"><p><b>Worked example.</b> Suppose the group were created as authNoPriv but the NMS asks with <code>-l authPriv</code>. Levels must match what the group requires, so the agent refuses. Now suppose the group is authPriv and the NMS asks with <code>-l authNoPriv</code>. That is less than the minimum, refused too. Only an exact fit passes: group priv, user with auth and priv, request at authPriv.</p></div>

<h3>Rolling out v3 without a gap</h3>
<p>Do not remove v2c first. Add the v3 group and user, point the test poll at v3, and confirm data is flowing. Then switch the NMS target to v3, watch for a day, and only then remove the v2c community. Keeping both for a short overlap means no monitoring blind spot.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Creating the user with a group that does not exist. (2) Group level and user keys that do not match (group priv, user with auth only). (3) Typing passwords with the wrong case: Auth#Key26 is not auth#key26. (4) Using the same password for auth and priv. (5) Assuming the engine ID is the same on every device; it is not, and keys are tied to it.</p></div>
<div class="exam"><p><b>Exam trap.</b> authNoPriv authenticates but does not encrypt. noAuthNoPriv is only a user name check. In v3 a "community" does not exist; the user takes its place. USM is security (user, keys); VACM is access (group, view). SNMPv3 still uses UDP 161.</p></div>

<div class="scn"><h4>The password in the clear</h4><p>An auditor captured traffic on the Kochi management VLAN and read every interface name and counter from v2c polls. Godavari moved the three routers to v3 authPriv. The auditor repeated the capture: only the user name nmsadmin and unreadable payload appeared. Priya kept v2c enabled for four days during the overlap, confirmed the graphs matched, then removed it.</p><p><b>Lesson:</b> authPriv protects the data in transit, and a staged cutover keeps the graphs unbroken.</p></div>

<div class="iv"><p class="q">"Explain USM and VACM in SNMPv3."</p><p>Strong answer: USM is the security layer, handling the user, authentication with SHA or MD5 and optional privacy with AES or DES. VACM is the access layer, mapping users into groups with a minimum security level and read, write and notify views. Authenticate first, then authorise. Give the three levels and recommend authPriv with SHA and AES.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v3 replaces communities with users: USM proves identity and protects data, VACM controls access.</li>
<li>Levels: noAuthNoPriv, authNoPriv, authPriv; the group sets the minimum, and the request must match.</li>
<li>Godavari config: view GF-VIEW, group GF-MON v3 priv, user nmsadmin SHA Auth#Key26 and AES 128 Priv#Key26.</li>
<li>Verify with show snmp group, show snmp user and snmpget -v3 -l authPriv from the NMS.</li>
<li>Roll out v3 alongside v2c, test, then retire v2c.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: sealed aur signed courier envelope</h3>
<p>Version 2c ek postcard hai: jo bhi handle kare community aur jawab padh sakta hai. Version 3 ek courier envelope hai jisme do protections hain. Usme ek <b>signature</b> hota hai jo prove karta hai ki kisne bheja aur kisi ne contents nahi badle (authentication). Use <b>seal</b> bhi kiya ja sakta hai taaki andar kya hai koi padh na sake (privacy). Courier kuch dene se pehle guest list bhi check karta hai (access control). SNMPv3 bilkul yahi teen ideas hai.</p>

<h3>v3 ke andar do models</h3>
<dl class="terms">
<dt>USM (User-based Security Model)</dt><dd>Jawab deta hai "aap kaun ho aur kya yeh message asli hai?" Har request ek <b>user</b> ka naam deti hai. User ke paas authentication protocol aur password (SHA ya MD5) hota hai aur optionally privacy protocol aur password (AES ya DES). Agent signature check karta hai; privacy on ho to decrypt karta hai.</dd>
<dt>VACM (View-based Access Control Model)</dt><dd>Jawab deta hai "yeh user kya dekh ya badal sakta hai?" Users ek <b>group</b> mein hote hain. Group ka ek minimum <b>security level</b> aur ek <b>view</b> (OID tree ka woh hissa jo woh padh ya likh sakta hai) hota hai.</dd>
</dl>
<p>To chain hai: user, group mein, view aur security level ke saath. Koi bhi kadi tooti to access fail.</p>

<h3>Teen security levels</h3>
<table class="cmp"><tr><th>Level</th><th>Authentication</th><th>Encryption</th><th>Use</th></tr>
<tr><td>noAuthNoPriv</td><td>nahi (sirf user name)</td><td>nahi</td><td>avoid karo</td></tr>
<tr><td>authNoPriv</td><td>haan (HMAC)</td><td>nahi</td><td>trusted management network par acceptable</td></tr>
<tr><td>authPriv</td><td>haan</td><td>haan</td><td>recommended</td></tr></table>
<p>Group <b>minimum</b> set karta hai. authPriv group ke user ko auth aur priv dono ke saath banana padta hai, aur manager ko authPriv level par poochna padta hai. Kam par poochoge to agent mana kar deta hai; error authorization error hota hai.</p>
<p>Authentication ke liye MD5 se SHA aur privacy ke liye DES se AES-128 prefer karo. Zyadatar platforms par passwords kam se kam 8 characters ke hone chahiye. User ki keys password aur agent ke <b>engine ID</b> se bani hoti hain, isiliye real device ke running configuration mein user line nahi dikhti.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNMPv3 request path">
<rect x="15" y="70" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="70" y="93" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="70" y="110" text-anchor="middle" class="svg-muted" font-size="11">user nmsadmin</text>
<rect x="165" y="30" width="130" height="40" rx="8" fill="#bae6fd"/><text x="230" y="55" text-anchor="middle" class="svg-ink" font-size="12">USM: kaun? asli?</text>
<rect x="165" y="125" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="230" y="150" text-anchor="middle" class="svg-ink" font-size="12">priv ho to decrypt</text>
<rect x="335" y="70" width="120" height="50" rx="8" fill="#fde68a"/><text x="395" y="93" text-anchor="middle" class="svg-ink" font-size="12">VACM</text><text x="395" y="110" text-anchor="middle" class="svg-muted" font-size="11">group GF-MON</text>
<rect x="495" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="560" y="93" text-anchor="middle" class="svg-ink" font-size="12">MIB view</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">GF-VIEW (iso)</text>
<line x1="125" y1="95" x2="165" y2="52" stroke="#64748b" stroke-width="2"/><line x1="125" y1="98" x2="165" y2="143" stroke="#64748b" stroke-width="2"/>
<line x1="295" y1="52" x2="335" y2="90" stroke="#64748b" stroke-width="2"/><line x1="295" y1="143" x2="335" y2="102" stroke="#64748b" stroke-width="2"/>
<line x1="455" y1="95" x2="495" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Agent pehle user aur keys check karta hai (USM), phir user ka group kya dekh sakta hai (VACM).</p></div>

<h3>Configuration walkthrough (lab obs-snmp-2)</h3>
<p>Godavari ka standard hai: group <b>GF-MON</b> authPriv par, user <b>nmsadmin</b> SHA authentication password <code>Auth#Key26</code> aur AES-128 privacy password <code>Priv#Key26</code> ke saath. Yeh lab values hain; real passwords unique aur secret hone chahiye.</p>
<pre class="code"><span class="c">! 1. what the group may read (the whole standard tree)</span>
HYD-CORE-R1(config)# snmp-server view GF-VIEW iso included
<span class="c">! 2. the group: v3, authPriv, read view, only from the NMS (ACL 20)</span>
HYD-CORE-R1(config)# snmp-server group GF-MON v3 priv read GF-VIEW access 20
<span class="c">! 3. the user: member of GF-MON, SHA auth, AES-128 privacy</span>
HYD-CORE-R1(config)# snmp-server user nmsadmin GF-MON v3 auth sha Auth#Key26 priv aes 128 Priv#Key26
<span class="c">! 4. optional: v3 traps to the NMS</span>
HYD-CORE-R1(config)# snmp-server host 10.1.50.100 version 3 priv nmsadmin</pre>
<p>Order isliye matter karta hai ki user kaam ka tab hota hai jab group exist kare. Yaad rakho ACL 20 chapter 2 se host 10.1.50.100 ko pehle se permit karti hai. Ab dono hisse verify karo:</p>
<pre class="out">HYD-CORE-R1# show snmp group
groupname: GF-MON                          security model:v3 priv
contextname: &lt;no context specified&gt;           storage-type: nonvolatile
readview : GF-VIEW                         writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active    access-list: 20

HYD-CORE-R1# show snmp user
User name: nmsadmin
Engine ID: 800000090300AABBCC001100
storage-type: nonvolatile        active
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: GF-MON</pre>
<p>Dhyaan do ki group ka koi writeview nahi hai: yahan v3 design se read-only hai. Ab NMS se poll karo, teeno options user se match karte hue:</p>
<pre class="out">NMS&gt; snmpget -v3 -u nmsadmin -l authPriv -a SHA -A Auth#Key26 -x AES -X Priv#Key26 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span></pre>
<p>Options: <code>-v3</code> version, <code>-u</code> user name, <code>-l</code> level, <code>-a</code> aur <code>-A</code> authentication protocol aur password, <code>-x</code> aur <code>-X</code> privacy protocol aur password. Is exchange ka packet capture sirf user name dikhata hai; OIDs aur values encrypted hain, yahi authPriv ka v2c par fayda hai.</p>

<div class="eg"><p><b>Worked example.</b> Maano group authNoPriv bana tha lekin NMS <code>-l authPriv</code> ke saath poochta hai. Levels us cheez se match hone chahiye jo group maangta hai, isliye agent mana karta hai. Ab maano group authPriv hai aur NMS <code>-l authNoPriv</code> se poochta hai. Yeh minimum se kam hai, yeh bhi refuse. Sirf exact fit pass hota hai: group priv, user auth aur priv ke saath, request authPriv par.</p></div>

<h3>Bina gap ke v3 rollout</h3>
<p>Pehle v2c mat hatao. v3 group aur user jodo, test poll v3 par point karo, aur confirm karo ki data aa raha hai. Phir NMS target ko v3 par switch karo, ek din dekho, aur tab hi v2c community hatao. Thode overlap ke liye dono rakhne se monitoring blind spot nahi banta.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Aise group ke saath user banana jo exist hi nahi karta. (2) Group level aur user keys match na karna (group priv, user sirf auth ke saath). (3) Passwords galat case mein type karna: Auth#Key26 aur auth#key26 alag hain. (4) Auth aur priv ke liye same password. (5) Yeh maanna ki engine ID har device par same hota hai; nahi hota, aur keys usse bandhi hoti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> authNoPriv authenticate karta hai lekin encrypt nahi karta. noAuthNoPriv sirf user name check hai. v3 mein "community" nahi hoti; user uski jagah leta hai. USM security hai (user, keys); VACM access hai (group, view). SNMPv3 phir bhi UDP 161 use karta hai.</p></div>

<div class="scn"><h4>Clear mein password</h4><p>Ek auditor ne Kochi management VLAN par traffic capture kiya aur v2c polls se har interface naam aur counter padh liya. Godavari ne teeno routers ko v3 authPriv par move kiya. Auditor ne capture dobara kiya: sirf user name nmsadmin aur unreadable payload dikha. Priya ne overlap ke chaar din v2c enabled rakha, confirm kiya ki graphs match karte hain, phir use hata diya.</p><p><b>Seekh:</b> authPriv transit mein data protect karta hai, aur staged cutover graphs ko tootne nahi deta.</p></div>

<div class="iv"><p class="q">"SNMPv3 mein USM aur VACM explain karo."</p><p>Strong answer: USM security layer hai, jo user, SHA ya MD5 se authentication aur AES ya DES se optional privacy handle karta hai. VACM access layer hai, jo users ko minimum security level aur read, write aur notify views ke saath groups mein map karta hai. Pehle authenticate, phir authorise. Teen levels batao aur SHA aur AES ke saath authPriv recommend karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v3 communities ko users se replace karta hai: USM identity prove karta hai aur data protect karta hai, VACM access control karta hai.</li>
<li>Levels: noAuthNoPriv, authNoPriv, authPriv; group minimum set karta hai, aur request match karni chahiye.</li>
<li>Godavari config: view GF-VIEW, group GF-MON v3 priv, user nmsadmin SHA Auth#Key26 aur AES 128 Priv#Key26.</li>
<li>show snmp group, show snmp user aur NMS se snmpget -v3 -l authPriv se verify karo.</li>
<li>v3 ko v2c ke saath roll out karo, test karo, phir v2c retire karo.</li>
</ul></div>
`}};export{e as default};