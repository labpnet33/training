var e={id:`snmp-v3`,h:{en:`SNMPv3: users, groups, views and security levels`,hi:`SNMPv3: users, groups, views aur security levels`},body:{en:`
<p>SNMPv2c is like a club where everyone shouts the same password at the door. SNMPv3 replaces that with <b>named membership cards</b> (users), <b>membership tiers</b> (groups), a list of <b>rooms each tier may enter</b> (views), and a rule about how securely the card must be shown (the security level). It adds authentication, integrity and optional encryption, which is why modern NOCs and the exam expect v3 wherever possible.</p>

<h3>The four objects</h3>
<dl class="terms">
<dt>View</dt><dd>A named part of the MIB tree: <code>snmp-server view NOCVIEW iso included</code> means everything; you can exclude subtrees.</dd>
<dt>Group</dt><dd>Defines the <b>security level</b> and which views apply to read, write and notify, plus an optional ACL: <code>snmp-server group NOC v3 priv read NOCVIEW access 20</code>.</dd>
<dt>User</dt><dd>Belongs to one group and carries the authentication and privacy algorithms and keys: <code>snmp-server user nocuser NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123</code>.</dd>
<dt>Engine ID</dt><dd>A unique identifier of the SNMP engine. User keys are "localised" with the local engine ID, so if the engine ID changes, users must be re-created.</dd>
</dl>

<h3>Security levels</h3>
<table class="cmp"><tr><th>Level (group keyword)</th><th>Authentication</th><th>Encryption</th><th>net-snmp -l</th></tr>
<tr><td>noAuthNoPriv (<code>noauth</code>)</td><td>Username only</td><td>No</td><td>noAuthNoPriv</td></tr>
<tr><td>authNoPriv (<code>auth</code>)</td><td>HMAC with MD5 or SHA</td><td>No</td><td>authNoPriv</td></tr>
<tr><td>authPriv (<code>priv</code>)</td><td>HMAC with MD5 or SHA</td><td>DES, 3DES or AES</td><td>authPriv</td></tr></table>
<p>The request must meet <b>at least</b> the group's level. A group defined as <code>priv</code> refuses authNoPriv requests, even with a correct password.</p>

<pre class="code">snmp-server view NOCVIEW iso included
snmp-server group NOC v3 priv read NOCVIEW access 20
snmp-server user nocuser NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123
snmp-server host 10.99.0.50 version 3 priv nocuser
snmp-server enable traps snmp linkdown linkup
<span class="c">! NMS side (net-snmp)</span>
snmpget -v3 -u nocuser -l authPriv -a SHA -A AuthPass123 -x AES -X PrivPass123 10.99.0.1 sysName.0</pre>

<h3>Verification</h3>
<p>SNMPv3 users are <b>not shown in the running-config</b>, because the keys are stored localised. Use the show commands:</p>
<pre class="out">EDGE# show snmp user
User name: <span class="hl">nocuser</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: <span class="hl">SHA</span>
Privacy Protocol: <span class="hl">AES128</span>
Group-name: <span class="hl">NOC</span>

EDGE# show snmp group
groupname: NOC                              security model:<span class="hl">v3 priv</span>
contextname: &lt;no context specified&gt;         storage-type: nonvolatile
readview : NOCVIEW                          writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active      access-list: 20</pre>
<p>Other useful commands: <code>show snmp engineID</code>, <code>show snmp view</code>, <code>show snmp host</code> and <code>debug snmp packets</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNMPv3 object model">
<rect x="20" y="75" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="97" text-anchor="middle" class="svg-ink" font-size="13">user nocuser</text><text x="90" y="114" text-anchor="middle" class="svg-muted" font-size="12">sha + aes 128</text>
<rect x="230" y="75" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="97" text-anchor="middle" class="svg-ink" font-size="13">group NOC</text><text x="310" y="114" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, access 20</text>
<rect x="460" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="540" y="47" text-anchor="middle" class="svg-ink" font-size="12">read view NOCVIEW</text>
<rect x="460" y="136" width="160" height="44" rx="8" fill="#fde68a"/><text x="540" y="163" text-anchor="middle" class="svg-ink" font-size="12">ACL 20: 10.99.0.50</text>
<line x1="160" y1="100" x2="230" y2="100" stroke="#64748b"/><line x1="390" y1="92" x2="460" y2="44" stroke="#64748b"/><line x1="390" y1="110" x2="460" y2="158" stroke="#64748b"/>
</svg><p class="cap">A user inherits everything from its group: level, views and ACL.</p></div>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>What the NMS reports</th><th>Likely cause</th></tr>
<tr><td>Unknown user name</td><td>User missing, typo, or created before an engine ID change</td></tr>
<tr><td>Authentication failure</td><td>Wrong auth password or algorithm (MD5 vs SHA)</td></tr>
<tr><td>Timeout with correct auth</td><td>Wrong privacy password or algorithm: the agent cannot decrypt and does not answer; or the group ACL denies the source</td></tr>
<tr><td>authorizationError / no access</td><td>Request level lower than the group level, or the OID is outside the read view</td></tr>
<tr><td>Traps missing</td><td><code>snmp-server host</code> uses a user or level that does not match, or enable traps is missing</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The NMS team moves EDGE monitoring to v3. Test 1: <code>-l authNoPriv -a SHA -A AuthPass123</code> returns an authorization error, because group NOC is <code>priv</code>. Test 2: <code>-l authPriv -a SHA -A AuthPass123 -x AES -X WrongPass</code> times out; the agent cannot decrypt the PDU. Test 3: the correct authPriv command returns <code>sysName.0 = STRING: EDGE</code>. Three tests, three different symptoms, one user.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking for the user in <code>show run</code> and concluding it was never created; changing the engine ID (or copying a config to a new chassis) and forgetting to re-create users; using the same group name with different levels by accident (each level is a separate group row); forgetting the <code>read</code> view so polls return no data.</p></div>

<div class="exam"><p><b>Exam trap.</b> The security level is a property of the <b>group</b>, and the request must match or exceed it. Also, only authPriv encrypts; authNoPriv only proves identity and integrity.</p></div>

<div class="scn"><h4>Monitoring died after an RMA</h4><p>A failed router was replaced under RMA and the saved configuration was pasted onto the new chassis. SNMPv2c devices came back in the NMS, but this one stayed UNKNOWN. The config contained the groups and hosts, but <code>show snmp user</code> was empty: the v3 users had never been in the running-config, and the new chassis had a new engine ID anyway. The engineer re-created the user with the same passwords and polling returned immediately.</p><p><b>Lesson:</b> keep SNMPv3 user creation in your build scripts, because the running-config does not carry it.</p></div>

<div class="iv"><p class="q">"What does SNMPv3 add over v2c, and how do you troubleshoot it?"</p><p>User-based security: authentication with HMAC, integrity, optional encryption with AES, and view-based access control through groups. For troubleshooting, map the error to the layer: unknown user, authentication failure, silent timeout for a privacy mismatch or ACL, authorization error for a level or view problem. Mention that users are shown with <code>show snmp user</code>, not in the running-config, and depend on the engine ID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMPv3 objects: view, group (level, views, ACL), user (auth and priv), engine ID.</li>
<li>Levels: noAuthNoPriv, authNoPriv, authPriv; only authPriv encrypts.</li>
<li>A request below the group's level is refused even with correct passwords.</li>
<li>Users are not in the running-config; use <code>show snmp user</code> and re-create them after an engine ID change.</li>
<li>Different error messages point to different layers: user, authentication, privacy, authorization.</li>
</ul></div>
`,hi:`
<p>SNMPv2c ek club jaisa hai jahan har koi darwaze par ek hi password chillata hai. SNMPv3 iski jagah <b>naam wale membership cards</b> (users), <b>membership tiers</b> (groups), <b>har tier kaunse kamron mein ja sakta hai</b> ki list (views), aur card kitne surakshit tareeke se dikhana hai ka niyam (security level) laata hai. Yeh authentication, integrity aur optional encryption jodta hai, isliye modern NOCs aur exam jahan tak ho sake v3 expect karte hain.</p>

<h3>Chaar objects</h3>
<dl class="terms">
<dt>View</dt><dd>MIB tree ka naam wala hissa: <code>snmp-server view NOCVIEW iso included</code> ka matlab sab kuch; aap subtrees exclude kar sakte ho.</dd>
<dt>Group</dt><dd><b>Security level</b> aur read, write aur notify ke liye kaunse views lagenge define karta hai, plus optional ACL: <code>snmp-server group NOC v3 priv read NOCVIEW access 20</code>.</dd>
<dt>User</dt><dd>Ek group ka hota hai aur authentication aur privacy algorithms aur keys rakhta hai: <code>snmp-server user nocuser NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123</code>.</dd>
<dt>Engine ID</dt><dd>SNMP engine ka unique identifier. User keys local engine ID ke saath "localise" hoti hain, isliye engine ID badle to users dobara banane padte hain.</dd>
</dl>

<h3>Security levels</h3>
<table class="cmp"><tr><th>Level (group keyword)</th><th>Authentication</th><th>Encryption</th><th>net-snmp -l</th></tr>
<tr><td>noAuthNoPriv (<code>noauth</code>)</td><td>Sirf username</td><td>Nahi</td><td>noAuthNoPriv</td></tr>
<tr><td>authNoPriv (<code>auth</code>)</td><td>MD5 ya SHA ke saath HMAC</td><td>Nahi</td><td>authNoPriv</td></tr>
<tr><td>authPriv (<code>priv</code>)</td><td>MD5 ya SHA ke saath HMAC</td><td>DES, 3DES ya AES</td><td>authPriv</td></tr></table>
<p>Request ko group ke level ke <b>kam se kam barabar</b> hona chahiye. <code>priv</code> wala group authNoPriv requests refuse karta hai, sahi password ke saath bhi.</p>

<pre class="code">snmp-server view NOCVIEW iso included
snmp-server group NOC v3 priv read NOCVIEW access 20
snmp-server user nocuser NOC v3 auth sha AuthPass123 priv aes 128 PrivPass123
snmp-server host 10.99.0.50 version 3 priv nocuser
snmp-server enable traps snmp linkdown linkup
<span class="c">! NMS side (net-snmp)</span>
snmpget -v3 -u nocuser -l authPriv -a SHA -A AuthPass123 -x AES -X PrivPass123 10.99.0.1 sysName.0</pre>

<h3>Verification</h3>
<p>SNMPv3 users <b>running-config mein nahi dikhte</b>, kyunki keys localised form mein store hoti hain. Show commands use karo:</p>
<pre class="out">EDGE# show snmp user
User name: <span class="hl">nocuser</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: <span class="hl">SHA</span>
Privacy Protocol: <span class="hl">AES128</span>
Group-name: <span class="hl">NOC</span>

EDGE# show snmp group
groupname: NOC                              security model:<span class="hl">v3 priv</span>
contextname: &lt;no context specified&gt;         storage-type: nonvolatile
readview : NOCVIEW                          writeview: &lt;no writeview specified&gt;
notifyview: &lt;no notifyview specified&gt;
row status: active      access-list: 20</pre>
<p>Doosre useful commands: <code>show snmp engineID</code>, <code>show snmp view</code>, <code>show snmp host</code> aur <code>debug snmp packets</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNMPv3 object model">
<rect x="20" y="75" width="140" height="50" rx="8" fill="#bae6fd"/><text x="90" y="97" text-anchor="middle" class="svg-ink" font-size="13">user nocuser</text><text x="90" y="114" text-anchor="middle" class="svg-muted" font-size="12">sha + aes 128</text>
<rect x="230" y="75" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="310" y="97" text-anchor="middle" class="svg-ink" font-size="13">group NOC</text><text x="310" y="114" text-anchor="middle" class="svg-muted" font-size="12">v3 priv, access 20</text>
<rect x="460" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="540" y="47" text-anchor="middle" class="svg-ink" font-size="12">read view NOCVIEW</text>
<rect x="460" y="136" width="160" height="44" rx="8" fill="#fde68a"/><text x="540" y="163" text-anchor="middle" class="svg-ink" font-size="12">ACL 20: 10.99.0.50</text>
<line x1="160" y1="100" x2="230" y2="100" stroke="#64748b"/><line x1="390" y1="92" x2="460" y2="44" stroke="#64748b"/><line x1="390" y1="110" x2="460" y2="158" stroke="#64748b"/>
</svg><p class="cap">User sab kuch apne group se leta hai: level, views aur ACL.</p></div>

<h3>Symptom se cause tak</h3>
<table class="cmp"><tr><th>NMS kya report karta hai</th><th>Sambhav cause</th></tr>
<tr><td>Unknown user name</td><td>User missing, typo, ya engine ID badalne se pehle bana tha</td></tr>
<tr><td>Authentication failure</td><td>Galat auth password ya algorithm (MD5 vs SHA)</td></tr>
<tr><td>Sahi auth ke saath timeout</td><td>Galat privacy password ya algorithm: agent decrypt nahi kar paata aur jawab nahi deta; ya group ACL source ko deny karta hai</td></tr>
<tr><td>authorizationError / no access</td><td>Request level group level se kam hai, ya OID read view ke bahar hai</td></tr>
<tr><td>Traps missing</td><td><code>snmp-server host</code> aisa user ya level use karta hai jo match nahi karta, ya enable traps missing hai</td></tr></table>

<div class="eg"><p><b>Worked example.</b> NMS team EDGE monitoring ko v3 par le jaati hai. Test 1: <code>-l authNoPriv -a SHA -A AuthPass123</code> authorization error lautata hai, kyunki group NOC <code>priv</code> hai. Test 2: <code>-l authPriv -a SHA -A AuthPass123 -x AES -X WrongPass</code> timeout hota hai; agent PDU decrypt nahi kar paata. Test 3: sahi authPriv command <code>sysName.0 = STRING: EDGE</code> lautata hai. Teen tests, teen alag symptoms, ek user.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> User ko <code>show run</code> mein dhoondhna aur maan lena ki bana hi nahi; engine ID badalna (ya config naye chassis par copy karna) aur users dobara banana bhoolna; galti se same group name alag levels ke saath use karna (har level alag group row hai); <code>read</code> view bhoolna jisse polls koi data nahi lautate.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security level <b>group</b> ki property hai, aur request ko use match ya exceed karna chahiye. Aur sirf authPriv encrypt karta hai; authNoPriv sirf identity aur integrity sabit karta hai.</p></div>

<div class="scn"><h4>RMA ke baad monitoring mar gayi</h4><p>Ek fail router RMA mein badla gaya aur saved configuration naye chassis par paste ki gayi. SNMPv2c devices NMS mein wapas aa gaye, par yeh UNKNOWN hi raha. Config mein groups aur hosts the, par <code>show snmp user</code> khaali tha: v3 users kabhi running-config mein the hi nahi, aur naye chassis ka engine ID bhi naya tha. Engineer ne same passwords ke saath user dobara banaya aur polling turant wapas aa gayi.</p><p><b>Seekh:</b> SNMPv3 user banana apne build scripts mein rakho, kyunki running-config use nahi le jaati.</p></div>

<div class="iv"><p class="q">"SNMPv3 v2c par kya jodta hai, aur aap iska troubleshooting kaise karte ho?"</p><p>User-based security: HMAC se authentication, integrity, AES se optional encryption, aur groups ke through view-based access control. Troubleshooting ke liye error ko layer se milao: unknown user, authentication failure, privacy mismatch ya ACL ke liye chupchaap timeout, level ya view problem ke liye authorization error. Batao ki users <code>show snmp user</code> se dikhte hain, running-config mein nahi, aur engine ID par depend karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMPv3 objects: view, group (level, views, ACL), user (auth aur priv), engine ID.</li>
<li>Levels: noAuthNoPriv, authNoPriv, authPriv; sirf authPriv encrypt karta hai.</li>
<li>Group ke level se kam request sahi passwords ke saath bhi refuse hoti hai.</li>
<li>Users running-config mein nahi hote; <code>show snmp user</code> use karo aur engine ID badalne ke baad unhe dobara banao.</li>
<li>Alag error messages alag layers ki taraf ishara karte hain: user, authentication, privacy, authorization.</li>
</ul></div>
`}};export{e as default};