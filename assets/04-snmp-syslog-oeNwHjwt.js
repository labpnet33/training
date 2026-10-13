var e={id:`snmp-syslog`,h:{en:`SNMP v2c vs v3 and syslog at CCNP depth`,hi:`CCNP depth par SNMP v2c vs v3 aur syslog`},body:{en:`
<p>SNMP and syslog are the two oldest reporting channels in a network. Think of SNMP as a <b>form</b> that the monitoring server asks every device to fill in every five minutes (and that devices can also send on their own when something urgent happens), and syslog as a <b>diary</b> where each device writes down events as they happen. The CCNA module taught the basics; here we add the CCNP detail: SNMPv3 security models and the exact meaning of syslog levels and facilities.</p>

<h3>SNMP building blocks (quick recap)</h3>
<dl class="terms">
<dt>Manager (NMS)</dt><dd>The monitoring server that polls devices and receives notifications.</dd>
<dt>Agent</dt><dd>Software on the router or switch that answers requests. Listens on <b>UDP 161</b>.</dd>
<dt>MIB and OID</dt><dd>The MIB is the tree of everything the agent can report; each variable has an <b>OID</b> (object identifier) such as the interface input-octets counter.</dd>
<dt>Get / GetNext / GetBulk / Set</dt><dd>Read one value, walk the tree, read many values in one request (added in v2c), and change a value.</dd>
<dt>Trap and Inform</dt><dd>Unsolicited notifications from the agent to the manager on <b>UDP 162</b>. A trap is fire-and-forget; an <b>inform</b> (v2c and v3) must be acknowledged and is retransmitted if it is not.</dd>
</dl>

<h3>v2c versus v3</h3>
<table class="cmp">
<tr><th></th><th>SNMPv2c</th><th>SNMPv3</th></tr>
<tr><td>Identity</td><td>Community string (a shared password)</td><td>Username inside a group</td></tr>
<tr><td>Authentication</td><td>None; community sent in clear text</td><td>HMAC with SHA (or MD5, legacy)</td></tr>
<tr><td>Encryption</td><td>None</td><td>AES (or DES/3DES, legacy)</td></tr>
<tr><td>Access control</td><td>RO / RW plus an ACL</td><td>Groups, views, security level plus an ACL</td></tr>
</table>
<p>SNMPv3 defines three <b>security levels</b>:</p>
<ul>
<li><b>noAuthNoPriv</b> (keyword <code>noauth</code>): username only. No better than v2c.</li>
<li><b>authNoPriv</b> (<code>auth</code>): messages are authenticated and protected from tampering, but readable.</li>
<li><b>authPriv</b> (<code>priv</code>): authenticated and encrypted. This is what you deploy.</li>
</ul>
<pre class="code"><span class="c">! v2c, read-only, limited to the NMS by ACL 99</span>
EDGE(config)# access-list 99 permit 192.0.2.25
EDGE(config)# snmp-server community NK-RO-7f3 ro 99

<span class="c">! v3 with authPriv</span>
EDGE(config)# snmp-server view NK-VIEW iso included
EDGE(config)# snmp-server group NMS-GRP v3 priv read NK-VIEW access 99
EDGE(config)# snmp-server user nmsuser NMS-GRP v3 auth sha Auth-Pass-9 priv aes 128 Priv-Pass-9
EDGE(config)# snmp-server host 192.0.2.25 informs version 3 priv nmsuser
EDGE(config)# snmp-server enable traps
EDGE(config)# snmp-server source-interface informs Loopback0</pre>
<pre class="out">EDGE# show snmp user
<span class="hl">User name: nmsuser</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: SHA
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NMS-GRP</pre>
<p>Note that SNMPv3 users are <b>not</b> shown in the running configuration; use <code>show snmp user</code>. The keys are derived from the passwords and the local <b>engine ID</b>, so if you change the engine ID you must re-create the users.</p>

<h3>Syslog levels and facilities</h3>
<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Immediate action needed (temperature)</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition (hardware)</td></tr>
<tr><td>3</td><td>errors</td><td>Interface down errors</td></tr>
<tr><td>4</td><td>warnings</td><td>Configuration warnings</td></tr>
<tr><td>5</td><td>notifications</td><td>Line protocol up/down, config changes</td></tr>
<tr><td>6</td><td>informational</td><td>ACL hits, track state changes</td></tr>
<tr><td>7</td><td>debugging</td><td>Debug output</td></tr>
</table>
<p>A mnemonic: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily. Configuring a level includes that level and everything <b>more severe</b> (lower number). <code>logging trap warnings</code> sends levels 0 to 4.</p>
<pre class="code">EDGE(config)# logging host 192.0.2.30
EDGE(config)# logging trap informational       <span class="c">! levels 0-6 to the server (default)</span>
EDGE(config)# logging facility local5          <span class="c">! default is local7</span>
EDGE(config)# logging source-interface Loopback0
EDGE(config)# service timestamps log datetime msec localtime</pre>
<pre class="out">*Sep 30 14:19:45.211: <span class="hl">%TRACK-6-STATE</span>: 1 ip sla 1 reachability Up -&gt; Down</pre>
<p>Read the message as <b>%FACILITY-SEVERITY-MNEMONIC</b>. Careful: the "facility" inside the message (TRACK, LINEPROTO, OSPF) is the IOS <b>feature</b> that produced it. The <b>syslog facility</b> (local0 to local7) is a separate field in the syslog packet that the server uses to sort messages into files.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SNMP and syslog flows">
<rect x="250" y="55" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.25</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.30</text>
<line x1="170" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><text x="210" y="67" text-anchor="middle" class="svg-accent" font-size="12">UDP 161</text>
<line x1="170" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="12">UDP 162</text>
<line x1="390" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><text x="430" y="77" text-anchor="middle" class="svg-accent" font-size="12">UDP 514</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Polls in on 161, traps/informs out to 162, syslog out to 514</text>
</svg><p class="cap">The ports that every firewall between the device and the monitoring servers must allow.</p></div>

<div class="eg"><p><b>Worked example.</b> An interface fails. The device logs <code>%LINK-3-UPDOWN</code> (level 3) and <code>%LINEPROTO-5-UPDOWN</code> (level 5). With <code>logging trap errors</code> the server receives only the first. With <code>logging trap notifications</code> it receives both. With the default <code>informational</code> it also receives the level 6 track messages from IP SLA.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring SNMPv3 with <code>auth</code> on the group but <code>priv</code> on the host line (or the other way round). The security levels must match, or the manager's requests are rejected as "unknown user" or "unsupported security level".</p></div>

<div class="exam"><p><b>Exam trap.</b> Informs are acknowledged; traps are not. GetBulk and informs arrived with v2; only v3 adds authentication and encryption. And a lower syslog number means <b>more</b> severe.</p></div>

<div class="scn"><h4>The monitoring dashboard that went quiet</h4><p>After a security hardening project, the NMS stopped graphing a branch router. Ping from the NMS worked. The engineer found that the router now had an SNMPv3 group configured with <code>priv</code>, but the NMS profile still used <code>authNoPriv</code>. <code>show snmp group</code> confirmed "security model: v3 priv". Updating the NMS credentials to authPriv with AES-128 restored polling.</p><p><b>Lesson:</b> SNMPv3 is a contract between both sides: user, group, auth and priv algorithms and security level must all match.</p></div>

<div class="iv"><p class="q">"Why should an enterprise move from SNMPv2c to SNMPv3?"</p><p>Because v2c sends the community string in clear text and offers no integrity or encryption, so anyone who captures a packet can read, and with an RW community change, the device. SNMPv3 adds per-user authentication (SHA) and encryption (AES) with the authPriv level, plus views and groups for fine-grained access. Mention that ACLs should still limit which hosts may poll, and that informs give reliable notification.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP agent on UDP 161, notifications on UDP 162; informs are acknowledged, traps are not.</li>
<li>SNMPv3 levels: noAuthNoPriv, authNoPriv, authPriv; deploy authPriv with SHA and AES.</li>
<li>v3 users do not appear in the running-config; verify with <code>show snmp user</code> and <code>show snmp group</code>.</li>
<li>Syslog levels 0 to 7; a configured level includes all more severe levels.</li>
<li>Message format %FACILITY-SEVERITY-MNEMONIC; the syslog facility (default local7) is a different thing.</li>
</ul></div>
`,hi:`
<p>SNMP aur syslog network ke do sabse purane reporting channels hain. SNMP ko ek <b>form</b> samjho jo monitoring server har device se har paanch minute mein bharwata hai (aur jo devices kuch urgent hone par khud bhi bhej sakte hain), aur syslog ko ek <b>diary</b> jismein har device events hote hi likhta jaata hai. CCNA module ne basics sikhaye; yahan hum CCNP detail jodte hain: SNMPv3 security models aur syslog levels aur facilities ka exact matlab.</p>

<h3>SNMP building blocks (quick recap)</h3>
<dl class="terms">
<dt>Manager (NMS)</dt><dd>Monitoring server jo devices ko poll karta hai aur notifications receive karta hai.</dd>
<dt>Agent</dt><dd>Router ya switch par software jo requests ka jawab deta hai. <b>UDP 161</b> par sunta hai.</dd>
<dt>MIB aur OID</dt><dd>MIB un sab cheezon ka tree hai jo agent report kar sakta hai; har variable ka ek <b>OID</b> (object identifier) hota hai, jaise interface input-octets counter.</dd>
<dt>Get / GetNext / GetBulk / Set</dt><dd>Ek value padhna, tree walk karna, ek request mein kai values padhna (v2c mein aaya), aur value badalna.</dd>
<dt>Trap aur Inform</dt><dd>Agent se manager ko <b>UDP 162</b> par bina maange notifications. Trap fire-and-forget hai; <b>inform</b> (v2c aur v3) ko acknowledge hona zaroori hai aur na ho to dobara bheja jaata hai.</dd>
</dl>

<h3>v2c versus v3</h3>
<table class="cmp">
<tr><th></th><th>SNMPv2c</th><th>SNMPv3</th></tr>
<tr><td>Identity</td><td>Community string (ek shared password)</td><td>Group ke andar username</td></tr>
<tr><td>Authentication</td><td>Kuch nahi; community clear text mein jaati hai</td><td>SHA (ya MD5, legacy) ke saath HMAC</td></tr>
<tr><td>Encryption</td><td>Kuch nahi</td><td>AES (ya DES/3DES, legacy)</td></tr>
<tr><td>Access control</td><td>RO / RW plus ek ACL</td><td>Groups, views, security level plus ek ACL</td></tr>
</table>
<p>SNMPv3 teen <b>security levels</b> define karta hai:</p>
<ul>
<li><b>noAuthNoPriv</b> (keyword <code>noauth</code>): sirf username. v2c se behtar nahi.</li>
<li><b>authNoPriv</b> (<code>auth</code>): messages authenticated aur tampering se protected hain, par padhe ja sakte hain.</li>
<li><b>authPriv</b> (<code>priv</code>): authenticated aur encrypted. Yahi deploy karte ho.</li>
</ul>
<pre class="code"><span class="c">! v2c, read-only, ACL 99 se sirf NMS tak simit</span>
EDGE(config)# access-list 99 permit 192.0.2.25
EDGE(config)# snmp-server community NK-RO-7f3 ro 99

<span class="c">! authPriv ke saath v3</span>
EDGE(config)# snmp-server view NK-VIEW iso included
EDGE(config)# snmp-server group NMS-GRP v3 priv read NK-VIEW access 99
EDGE(config)# snmp-server user nmsuser NMS-GRP v3 auth sha Auth-Pass-9 priv aes 128 Priv-Pass-9
EDGE(config)# snmp-server host 192.0.2.25 informs version 3 priv nmsuser
EDGE(config)# snmp-server enable traps
EDGE(config)# snmp-server source-interface informs Loopback0</pre>
<pre class="out">EDGE# show snmp user
<span class="hl">User name: nmsuser</span>
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
Authentication Protocol: SHA
<span class="hl">Privacy Protocol: AES128</span>
Group-name: NMS-GRP</pre>
<p>Dhyan do ki SNMPv3 users running configuration mein <b>nahi</b> dikhte; <code>show snmp user</code> use karo. Keys passwords aur local <b>engine ID</b> se banti hain, isliye agar aap engine ID badlo to users dobara banane padenge.</p>

<h3>Syslog levels aur facilities</h3>
<table class="cmp">
<tr><th>Level</th><th>Keyword</th><th>Example</th></tr>
<tr><td>0</td><td>emergencies</td><td>System unusable</td></tr>
<tr><td>1</td><td>alerts</td><td>Turant action chahiye (temperature)</td></tr>
<tr><td>2</td><td>critical</td><td>Critical condition (hardware)</td></tr>
<tr><td>3</td><td>errors</td><td>Interface down errors</td></tr>
<tr><td>4</td><td>warnings</td><td>Configuration warnings</td></tr>
<tr><td>5</td><td>notifications</td><td>Line protocol up/down, config changes</td></tr>
<tr><td>6</td><td>informational</td><td>ACL hits, track state changes</td></tr>
<tr><td>7</td><td>debugging</td><td>Debug output</td></tr>
</table>
<p>Ek mnemonic: <b>E</b>very <b>A</b>wesome <b>C</b>isco <b>E</b>ngineer <b>W</b>ill <b>N</b>eed <b>I</b>ce-cream <b>D</b>aily. Ek level configure karne par woh level aur usse <b>zyada severe</b> (chhota number) sab shaamil hote hain. <code>logging trap warnings</code> levels 0 se 4 bhejta hai.</p>
<pre class="code">EDGE(config)# logging host 192.0.2.30
EDGE(config)# logging trap informational       <span class="c">! levels 0-6 server ko (default)</span>
EDGE(config)# logging facility local5          <span class="c">! default local7 hai</span>
EDGE(config)# logging source-interface Loopback0
EDGE(config)# service timestamps log datetime msec localtime</pre>
<pre class="out">*Sep 30 14:19:45.211: <span class="hl">%TRACK-6-STATE</span>: 1 ip sla 1 reachability Up -&gt; Down</pre>
<p>Message ko <b>%FACILITY-SEVERITY-MNEMONIC</b> ki tarah padho. Dhyan do: message ke andar ki "facility" (TRACK, LINEPROTO, OSPF) woh IOS <b>feature</b> hai jisne use banaya. <b>Syslog facility</b> (local0 se local7) syslog packet ka alag field hai jise server messages ko files mein sort karne ke liye use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="SNMP and syslog flows">
<rect x="250" y="55" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text>
<rect x="20" y="55" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.25</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="13">Syslog server</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.30</text>
<line x1="170" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><text x="210" y="67" text-anchor="middle" class="svg-accent" font-size="12">UDP 161</text>
<line x1="170" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="210" y="130" text-anchor="middle" class="svg-accent" font-size="12">UDP 162</text>
<line x1="390" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/><text x="430" y="77" text-anchor="middle" class="svg-accent" font-size="12">UDP 514</text>
<text x="320" y="155" text-anchor="middle" class="svg-muted" font-size="12">Polls 161 par andar, traps/informs 162 par bahar, syslog 514 par bahar</text>
</svg><p class="cap">Woh ports jo device aur monitoring servers ke beech har firewall ko allow karne honge.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek interface fail hota hai. Device <code>%LINK-3-UPDOWN</code> (level 3) aur <code>%LINEPROTO-5-UPDOWN</code> (level 5) log karta hai. <code>logging trap errors</code> ke saath server ko sirf pehla milta hai. <code>logging trap notifications</code> ke saath dono milte hain. Default <code>informational</code> ke saath use IP SLA ke level 6 track messages bhi milte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> SNMPv3 mein group par <code>auth</code> aur host line par <code>priv</code> configure karna (ya ulta). Security levels match hone chahiye, warna manager ki requests "unknown user" ya "unsupported security level" kehkar reject hoti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Informs acknowledge hote hain; traps nahi. GetBulk aur informs v2 ke saath aaye; sirf v3 authentication aur encryption jodta hai. Aur syslog ka chhota number matlab <b>zyada</b> severe.</p></div>

<div class="scn"><h4>Monitoring dashboard jo chup ho gaya</h4><p>Ek security hardening project ke baad NMS ne ek branch router ka graph banana band kar diya. NMS se ping chal raha tha. Engineer ne paaya ki router par ab <code>priv</code> ke saath SNMPv3 group configured tha, par NMS profile abhi bhi <code>authNoPriv</code> use kar raha tha. <code>show snmp group</code> ne "security model: v3 priv" confirm kiya. NMS credentials ko AES-128 ke saath authPriv par update karne se polling wapas aa gayi.</p><p><b>Seekh:</b> SNMPv3 dono sides ke beech ek contract hai: user, group, auth aur priv algorithms aur security level sab match hone chahiye.</p></div>

<div class="iv"><p class="q">"Enterprise ko SNMPv2c se SNMPv3 par kyun jaana chahiye?"</p><p>Kyunki v2c community string clear text mein bhejta hai aur koi integrity ya encryption nahi deta, isliye koi bhi jo packet capture kare device ko padh sakta hai, aur RW community ho to badal bhi sakta hai. SNMPv3 per-user authentication (SHA) aur encryption (AES) authPriv level ke saath jodta hai, plus fine-grained access ke liye views aur groups. Batao ki ACLs ab bhi limit karein ki kaunse hosts poll kar sakte hain, aur informs reliable notification dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP agent UDP 161 par, notifications UDP 162 par; informs acknowledge hote hain, traps nahi.</li>
<li>SNMPv3 levels: noAuthNoPriv, authNoPriv, authPriv; SHA aur AES ke saath authPriv deploy karo.</li>
<li>v3 users running-config mein nahi dikhte; <code>show snmp user</code> aur <code>show snmp group</code> se verify karo.</li>
<li>Syslog levels 0 se 7; configured level mein saare zyada severe levels shaamil hote hain.</li>
<li>Message format %FACILITY-SEVERITY-MNEMONIC; syslog facility (default local7) alag cheez hai.</li>
</ul></div>
`}};export{e as default};