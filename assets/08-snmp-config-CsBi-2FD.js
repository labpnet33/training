var e={id:`snmp-config`,h:{en:`Configuring SNMPv2c and SNMPv3 securely`,hi:`SNMPv2c aur SNMPv3 securely configure karna`},body:{en:`
<p>Giving SNMP access is like giving someone a key to your office. A <b>v2c read-only community</b> is a key that only opens the glass window: they can look but not touch, and the key is printed on a sticky note anyone can photograph. A <b>read-write community</b> opens the door. An <b>SNMPv3 user with authPriv</b> is a personal, signed ID card and a sealed envelope for every message. And an <b>ACL</b> on any of them is the security guard who checks which building the visitor came from. In this chapter you configure all of these.</p>

<h3>SNMPv2c: lab 1 configuration</h3>
<p>The task: let the NMS (10.1.1.100) read R1 with community <code>NKRO</code>, from that address only, and set the location to Pune-HQ.</p>
<pre class="code"><span class="c">! 1. who may use the community</span>
R1(config)# access-list 10 permit host 10.1.1.100
<span class="c">! 2. read-only community, filtered by ACL 10</span>
R1(config)# snmp-server community NKRO RO 10
<span class="c">! 3. descriptive data the NMS will display</span>
R1(config)# snmp-server location Pune-HQ
R1(config)# snmp-server contact noc@nk.example</pre>
<p>Configuring the first community enables the SNMP agent. <code>RO</code> allows Get/GetNext/GetBulk; <code>RW</code> would also allow Set. The number at the end is a standard ACL: requests from any other source are silently ignored and counted as bad community.</p>

<h3>Testing from the lab NMS and from PC1</h3>
<pre class="out">NMS&gt; snmpget -c NKRO 10.1.1.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span>

PC1&gt; snmpget -c NKRO 10.1.1.1 sysName.0
<span class="hl">Timeout: No Response from 10.1.1.1.</span></pre>
<p>The NMS gets an answer. PC1, using exactly the same community, gets a timeout, because its address 10.1.1.10 is not permitted by ACL 10. That is the proof the lab asks for. <code>snmpwalk -c NKRO 10.1.1.1 interfaces</code> walks the interface table with repeated GetNext requests.</p>

<h3>Sending traps and informs (v2c)</h3>
<pre class="code"><span class="c">! which events generate notifications</span>
R1(config)# snmp-server enable traps snmp linkdown linkup
R1(config)# snmp-server enable traps config
<span class="c">! where to send them; the string is the community carried in the trap</span>
R1(config)# snmp-server host 10.1.1.100 version 2c NKTRAP
<span class="c">! or, reliable: informs are acknowledged</span>
R1(config)# snmp-server host 10.1.1.100 informs version 2c NKTRAP
<span class="c">! send notifications from a stable address</span>
R1(config)# snmp-server trap-source Loopback0</pre>
<p>On the lab NMS, <code>show traps</code> lists received notifications; shut and re-enable an interface to create a linkDown and a linkUp.</p>

<h3>SNMPv3: users, groups and security levels</h3>
<p>SNMPv3 is configured in layers: an optional <b>view</b> (which OIDs), a <b>group</b> (security level and which views it may read or write), and <b>users</b> that belong to a group and carry the passwords.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMPv3 layers">
<rect x="20" y="60" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="13">View NKVIEW</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="12">which OIDs</text>
<rect x="235" y="60" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Group NKGRP</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, ACL 10</text>
<rect x="450" y="60" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="85" text-anchor="middle" class="svg-ink" font-size="13">User nkmon</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">SHA + AES-128</text>
<line x1="190" y1="90" x2="235" y2="90" stroke="#64748b" stroke-width="2"/><line x1="405" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="12">what may be read   +   how secure   +   who</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">the NMS must use the same user, SHA and AES passwords</text>
</svg><p class="cap">A user inherits the security level, views and ACL of its group.</p></div>
<pre class="code"><span class="c">! which part of the MIB tree is visible (iso = everything)</span>
R1(config)# snmp-server view NKVIEW iso included
<span class="c">! group requires authPriv, read view NKVIEW, sources from ACL 10</span>
R1(config)# snmp-server group NKGRP v3 priv read NKVIEW access 10
<span class="c">! user with SHA authentication and AES-128 encryption</span>
R1(config)# snmp-server user nkmon NKGRP v3 auth sha NkAuth#2026 priv aes 128 NkPriv#2026
<span class="c">! v3 notifications</span>
R1(config)# snmp-server host 10.1.1.100 version 3 priv nkmon</pre>
<table class="cmp"><tr><th>Group keyword</th><th>Security level</th><th>User needs</th></tr>
<tr><td><code>noauth</code></td><td>noAuthNoPriv</td><td>Just a username</td></tr>
<tr><td><code>auth</code></td><td>authNoPriv</td><td><code>auth md5|sha</code> password</td></tr>
<tr><td><code>priv</code></td><td>authPriv</td><td><code>auth</code> and <code>priv des|3des|aes</code> passwords</td></tr></table>
<p>For security reasons IOS does <b>not</b> show SNMPv3 users in the running configuration. Use <code>show snmp user</code>.</p>
<pre class="out">NMS&gt; snmpget -v3 -u nkmon -l authPriv -a SHA -A NkAuth#2026 -x AES -X NkPriv#2026 10.1.1.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span></pre>

<h3>Verification on the router</h3>
<pre class="out">R1# show snmp community

Community name: NKRO
Community Index: NKRO
Community SecurityName: NKRO
<span class="hl">storage-type: nonvolatile        active access-list: 10</span>

R1# show snmp
Chassis: FTX1840A1B2
Contact: noc@nk.example
<span class="hl">Location: Pune-HQ</span>
14 SNMP packets input
    0 Bad SNMP version errors
<span class="hl">    3 Unknown community name</span>
    0 Illegal operation for community name supplied
    0 Encoding errors
    11 Number of requested variables

R1# show snmp user

User name: nkmon
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
<span class="hl">Authentication Protocol: SHA</span>
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NKGRP</pre>
<p>"Unknown community name" rising is the first clue for "the NMS cannot poll": wrong string, or a source blocked by the ACL.</p>

<div class="eg"><p><b>Worked example.</b> The security team scans R2 and reports "SNMP community public accepted from any source". <code>show running-config | include snmp</code> shows <code>snmp-server community public RW</code>, left over from a lab. Anyone on the network could have changed the hostname or copied the configuration. Fix: <code>no snmp-server community public</code>, then either a strong RO community with an ACL, or better, an SNMPv3 authPriv user and group limited to the NMS.</p></div>

<h3>Security best practice</h3>
<ul>
<li>Prefer <b>SNMPv3 authPriv</b> (SHA + AES). Use v2c only where the NMS cannot do v3.</li>
<li>Never use <code>public</code> or <code>private</code>; use long, random strings.</li>
<li>Read-only unless a tool truly needs write; restrict with a <b>view</b> if possible.</li>
<li>Always attach an <b>ACL</b> so only the NMS addresses may query.</li>
<li>Block UDP 161/162 at the network edge; SNMP should never be reachable from the internet.</li>
<li>Use <code>snmp-server trap-source</code> and send notifications only to known collectors.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Writing the ACL after the community with a typo in the number. <code>snmp-server community NKRO RO 11</code> with only ACL 10 existing leaves the community open to everyone on many IOS versions, because a non-existent ACL permits all. Always verify with a test from a host that should fail.</p></div>

<div class="exam"><p><b>Exam trap.</b> v2c communities are clear text: RO vs RW decides read or read-write. SNMPv3 levels: noAuthNoPriv, authNoPriv, authPriv; "priv" means encryption. v3 users do not appear in <code>show running-config</code>.</p></div>

<div class="scn"><h4>The monitoring gap after a password change</h4><p>Security rotated the SNMP community on all switches from one script. That night the NMS showed half the switches as unreachable. The script had changed the community string but the new ACL number did not exist on older switches, so the engineer tightened it the next day, and then a typo in the NMS profile broke polling again. <code>show snmp</code> on a switch showed "Unknown community name" rising every five minutes: the switch was fine, the NMS profile was wrong.</p><p><b>Lesson:</b> the SNMP counters on the device tell you which side is wrong. Rising unknown-community counts mean requests arrive with the wrong string or from a blocked source.</p></div>

<div class="iv"><p class="q">"How would you secure SNMP on a router?"</p><p>Strong answer: move to SNMPv3 with authPriv (SHA and AES) using a group and user, restrict access with an ACL on the group and a view limiting the OIDs, remove default or RW communities, and if v2c is unavoidable, use a long random RO community with an ACL. Send traps or informs only to the NMS from a loopback source, block UDP 161/162 at the edge, and verify with <code>show snmp</code>, <code>show snmp user</code> and a negative test from an unauthorised host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>snmp-server community NAME RO|RW acl</code> enables v2c access; the ACL limits which sources may query.</li>
<li><code>snmp-server enable traps</code> + <code>snmp-server host X [informs] version 2c|3 ...</code> send notifications.</li>
<li>SNMPv3: view → group (noauth/auth/priv) → user with auth sha and priv aes.</li>
<li>v3 users are not in running-config; check <code>show snmp user</code>.</li>
<li><code>show snmp</code> counters (unknown community) reveal polling problems.</li>
</ul></div>
`,hi:`
<p>SNMP access dena kisi ko apne office ki chaabi dene jaisa hai. <b>v2c read-only community</b> aisi chaabi hai jo sirf kaanch ki khidki kholti hai: woh dekh sakte hain par chhoo nahi sakte, aur chaabi ek sticky note par chhapi hai jiski photo koi bhi le sakta hai. <b>Read-write community</b> darwaza khol deti hai. <b>authPriv wala SNMPv3 user</b> ek personal, signed ID card hai aur har message ke liye ek sealed envelope. Aur inmein se kisi par bhi <b>ACL</b> woh security guard hai jo check karta hai ki visitor kis building se aaya. Is chapter mein aap yeh sab configure karoge.</p>

<h3>SNMPv2c: lab 1 configuration</h3>
<p>Task: NMS (10.1.1.100) ko community <code>NKRO</code> se R1 padhne do, sirf usi address se, aur location Pune-HQ set karo.</p>
<pre class="code"><span class="c">! 1. community kaun use kar sakta hai</span>
R1(config)# access-list 10 permit host 10.1.1.100
<span class="c">! 2. read-only community, ACL 10 se filtered</span>
R1(config)# snmp-server community NKRO RO 10
<span class="c">! 3. descriptive data jo NMS dikhayega</span>
R1(config)# snmp-server location Pune-HQ
R1(config)# snmp-server contact noc@nk.example</pre>
<p>Pehli community configure karne se SNMP agent enable ho jaata hai. <code>RO</code> Get/GetNext/GetBulk allow karta hai; <code>RW</code> Set bhi allow karega. Aakhir ka number ek standard ACL hai: kisi aur source ki requests chup chaap ignore hoti hain aur bad community ke roop mein gini jaati hain.</p>

<h3>Lab NMS aur PC1 se testing</h3>
<pre class="out">NMS&gt; snmpget -c NKRO 10.1.1.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span>

PC1&gt; snmpget -c NKRO 10.1.1.1 sysName.0
<span class="hl">Timeout: No Response from 10.1.1.1.</span></pre>
<p>NMS ko jawab milta hai. PC1 ko, bilkul same community use karke, timeout milta hai, kyunki uska address 10.1.1.10 ACL 10 mein permitted nahi hai. Lab yahi proof maangta hai. <code>snmpwalk -c NKRO 10.1.1.1 interfaces</code> baar baar GetNext requests se interface table walk karta hai.</p>

<h3>Traps aur informs bhejna (v2c)</h3>
<pre class="code"><span class="c">! kaunse events notifications banate hain</span>
R1(config)# snmp-server enable traps snmp linkdown linkup
R1(config)# snmp-server enable traps config
<span class="c">! kahan bhejna hai; string trap mein jaane wali community hai</span>
R1(config)# snmp-server host 10.1.1.100 version 2c NKTRAP
<span class="c">! ya reliable: informs acknowledge hote hain</span>
R1(config)# snmp-server host 10.1.1.100 informs version 2c NKTRAP
<span class="c">! notifications ek stable address se bhejo</span>
R1(config)# snmp-server trap-source Loopback0</pre>
<p>Lab NMS par <code>show traps</code> mili hui notifications list karta hai; ek interface shut aur phir enable karo taaki linkDown aur linkUp banein.</p>

<h3>SNMPv3: users, groups aur security levels</h3>
<p>SNMPv3 layers mein configure hota hai: ek optional <b>view</b> (kaunse OIDs), ek <b>group</b> (security level aur kaunse views padh ya likh sakta hai), aur <b>users</b> jo group ke member hote hain aur passwords rakhte hain.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="SNMPv3 layers">
<rect x="20" y="60" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="85" text-anchor="middle" class="svg-ink" font-size="13">View NKVIEW</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="12">kaunse OIDs</text>
<rect x="235" y="60" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Group NKGRP</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, ACL 10</text>
<rect x="450" y="60" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="85" text-anchor="middle" class="svg-ink" font-size="13">User nkmon</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="12">SHA + AES-128</text>
<line x1="190" y1="90" x2="235" y2="90" stroke="#64748b" stroke-width="2"/><line x1="405" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="35" text-anchor="middle" class="svg-accent" font-size="12">kya padh sakte   +   kitna secure   +   kaun</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">NMS ko same user, SHA aur AES passwords use karne honge</text>
</svg><p class="cap">User apne group ka security level, views aur ACL inherit karta hai.</p></div>
<pre class="code"><span class="c">! MIB tree ka kaunsa hissa dikhega (iso = sab kuch)</span>
R1(config)# snmp-server view NKVIEW iso included
<span class="c">! group ko authPriv chahiye, read view NKVIEW, sources ACL 10 se</span>
R1(config)# snmp-server group NKGRP v3 priv read NKVIEW access 10
<span class="c">! SHA authentication aur AES-128 encryption wala user</span>
R1(config)# snmp-server user nkmon NKGRP v3 auth sha NkAuth#2026 priv aes 128 NkPriv#2026
<span class="c">! v3 notifications</span>
R1(config)# snmp-server host 10.1.1.100 version 3 priv nkmon</pre>
<table class="cmp"><tr><th>Group keyword</th><th>Security level</th><th>User ko chahiye</th></tr>
<tr><td><code>noauth</code></td><td>noAuthNoPriv</td><td>Bas ek username</td></tr>
<tr><td><code>auth</code></td><td>authNoPriv</td><td><code>auth md5|sha</code> password</td></tr>
<tr><td><code>priv</code></td><td>authPriv</td><td><code>auth</code> aur <code>priv des|3des|aes</code> passwords</td></tr></table>
<p>Security ki wajah se IOS SNMPv3 users ko running configuration mein <b>nahi</b> dikhata. <code>show snmp user</code> use karo.</p>
<pre class="out">NMS&gt; snmpget -v3 -u nkmon -l authPriv -a SHA -A NkAuth#2026 -x AES -X NkPriv#2026 10.1.1.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: R1</span></pre>

<h3>Router par verification</h3>
<pre class="out">R1# show snmp community

Community name: NKRO
Community Index: NKRO
Community SecurityName: NKRO
<span class="hl">storage-type: nonvolatile        active access-list: 10</span>

R1# show snmp
Chassis: FTX1840A1B2
Contact: noc@nk.example
<span class="hl">Location: Pune-HQ</span>
14 SNMP packets input
    0 Bad SNMP version errors
<span class="hl">    3 Unknown community name</span>
    0 Illegal operation for community name supplied
    0 Encoding errors
    11 Number of requested variables

R1# show snmp user

User name: nkmon
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
<span class="hl">Authentication Protocol: SHA</span>
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NKGRP</pre>
<p>"Unknown community name" ka badhna "NMS poll nahi kar pa raha" ka pehla clue hai: galat string, ya ACL se blocked source.</p>

<div class="eg"><p><b>Worked example.</b> Security team R2 scan karke report karti hai "SNMP community public kisi bhi source se accept ho rahi hai". <code>show running-config | include snmp</code> <code>snmp-server community public RW</code> dikhata hai, ek lab se bacha hua. Network par koi bhi hostname badal sakta tha ya configuration copy kar sakta tha. Fix: <code>no snmp-server community public</code>, phir ya to ACL ke saath strong RO community, ya behtar, NMS tak limited SNMPv3 authPriv user aur group.</p></div>

<h3>Security best practice</h3>
<ul>
<li><b>SNMPv3 authPriv</b> (SHA + AES) prefer karo. v2c sirf wahan jahan NMS v3 nahi kar sakta.</li>
<li>Kabhi <code>public</code> ya <code>private</code> use mat karo; lambi, random strings use karo.</li>
<li>Read-only rakho jab tak kisi tool ko sach mein write na chahiye; ho sake to <b>view</b> se restrict karo.</li>
<li>Hamesha <b>ACL</b> lagao taaki sirf NMS addresses query kar sakein.</li>
<li>Network edge par UDP 161/162 block karo; SNMP kabhi internet se reachable nahi hona chahiye.</li>
<li><code>snmp-server trap-source</code> use karo aur notifications sirf known collectors ko bhejo.</li>
</ul>

<div class="warn"><p><b>Common galti.</b> Community ke baad ACL likhna aur number mein typo. Sirf ACL 10 exist karta ho aur aap <code>snmp-server community NKRO RO 11</code> likho, to kai IOS versions par community sabke liye khuli reh jaati hai, kyunki non-existent ACL sab permit karti hai. Hamesha us host se test karke verify karo jise fail hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> v2c communities clear text hain: RO vs RW read ya read-write decide karta hai. SNMPv3 levels: noAuthNoPriv, authNoPriv, authPriv; "priv" matlab encryption. v3 users <code>show running-config</code> mein nahi dikhte.</p></div>

<div class="scn"><h4>Password change ke baad monitoring gap</h4><p>Security ne ek script se saare switches par SNMP community rotate ki. Us raat NMS ne aadhe switches unreachable dikhaye. Script ne community string badal di thi lekin naya ACL number purane switches par exist nahi karta tha, isliye engineer ne agle din use tight kiya, aur phir NMS profile mein ek typo ne polling phir tod di. Switch par <code>show snmp</code> har paanch minute "Unknown community name" badhta dikha raha tha: switch theek tha, NMS profile galat tha.</p><p><b>Seekh:</b> device ke SNMP counters batate hain ki kaunsi side galat hai. Badhte unknown-community counts matlab requests galat string ke saath ya blocked source se aa rahi hain.</p></div>

<div class="iv"><p class="q">"Router par SNMP ko kaise secure karoge?"</p><p>Strong answer: group aur user ke saath authPriv (SHA aur AES) wale SNMPv3 par jao, group par ACL aur OIDs limit karne wale view se access restrict karo, default ya RW communities hatao, aur agar v2c zaroori ho to ACL ke saath lambi random RO community use karo. Traps ya informs sirf NMS ko loopback source se bhejo, edge par UDP 161/162 block karo, aur <code>show snmp</code>, <code>show snmp user</code> aur unauthorised host se negative test ke saath verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>snmp-server community NAME RO|RW acl</code> v2c access enable karta hai; ACL batati hai kaunse sources query kar sakte hain.</li>
<li><code>snmp-server enable traps</code> + <code>snmp-server host X [informs] version 2c|3 ...</code> notifications bhejte hain.</li>
<li>SNMPv3: view → group (noauth/auth/priv) → auth sha aur priv aes wala user.</li>
<li>v3 users running-config mein nahi hote; <code>show snmp user</code> check karo.</li>
<li><code>show snmp</code> counters (unknown community) polling problems dikhate hain.</li>
</ul></div>
`}};export{e as default};