var e={id:`snmp`,h:{en:`SNMP: polling, traps, MIBs and security`,hi:`SNMP: polling, traps, MIBs aur security`},body:{en:`
<p>Picture a school principal checking on classrooms. She can walk into any room and ask the teacher "how many students are present?" That is <b>polling</b>. Or a teacher can run to her office when something goes wrong: "the projector just died!" That is a <b>trap</b>. The <b>Simple Network Management Protocol (SNMP)</b> works exactly like this between a monitoring station and network devices.</p>

<h3>The three parts: manager, agent and MIB</h3>
<dl class="terms">
<dt>Manager (NMS)</dt><dd>The monitoring software that asks questions and receives notifications. In the lab it is the NMS at 192.168.50.100.</dd>
<dt>Agent</dt><dd>Software on each managed device (router, switch, server, printer) that answers the manager and sends notifications. It listens on <b>UDP 161</b>.</dd>
<dt>MIB (Management Information Base)</dt><dd>The structured catalogue of everything an agent can report, organised as a tree. Each value has an <b>OID</b> (object identifier), a dotted number such as 1.3.6.1.2.1.1.5.0 (sysName). Standard MIBs cover interfaces and system data; vendors add private MIBs for their own features.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SNMP manager polling agents and receiving traps">
<rect x="20" y="80" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="106" text-anchor="middle" class="svg-ink" font-size="14">NMS (manager)</text><text x="105" y="126" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.100</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">R1 agent</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">UDP 161, MIB</text>
<rect x="450" y="140" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="166" text-anchor="middle" class="svg-ink" font-size="14">R2 agent</text><text x="535" y="186" text-anchor="middle" class="svg-muted" font-size="12">sends traps</text>
<line x1="190" y1="95" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="12">Get / GetNext / GetBulk / Set to UDP 161</text>
<line x1="450" y1="170" x2="190" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform to UDP 162</text>
</svg><p class="cap">Polling goes from the manager to UDP 161 on the agent; traps and informs go from the agent to UDP 162 on the manager.</p></div>

<h3>SNMP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Direction</th><th>Purpose</th></tr>
<tr><td>Get, GetNext</td><td>Manager to agent</td><td>Read one value, or the next value in the tree (walking a table)</td></tr>
<tr><td>GetBulk (v2c and v3)</td><td>Manager to agent</td><td>Read many values in one request</td></tr>
<tr><td>Set</td><td>Manager to agent</td><td>Change a value; needs read-write access</td></tr>
<tr><td>Response</td><td>Agent to manager</td><td>The answer to a Get or Set</td></tr>
<tr><td><b>Trap</b></td><td>Agent to manager</td><td>Unsolicited event notification, not acknowledged</td></tr>
<tr><td><b>Inform</b> (v2c and v3)</td><td>Agent to manager</td><td>Like a trap but acknowledged, so it is resent if lost</td></tr>
</table>

<h3>Versions, community strings and authentication</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th><th>Notes</th></tr>
<tr><td><b>SNMPv1</b></td><td>Community string, clear text</td><td>Original; 32-bit counters only</td></tr>
<tr><td><b>SNMPv2c</b></td><td>Community string, clear text</td><td>Adds GetBulk, informs and 64-bit counters; the most widely deployed</td></tr>
<tr><td><b>SNMPv3</b></td><td>Users with <b>authentication</b> (HMAC with SHA) and <b>privacy</b> (encryption with AES)</td><td>Security levels noAuthNoPriv, authNoPriv, authPriv; the secure choice</td></tr>
</table>
<p>A <b>community string</b> is effectively a shared password. Anyone who captures one v1/v2c packet can read it. Treat read-write communities as highly sensitive, restrict every community with an ACL to the NMS addresses, and prefer SNMPv3 authPriv wherever the tools support it.</p>

<h3>Configuring the agent in the lab</h3>
<pre class="code"><span class="c">! R1: read-only community, usable only from the NMS</span>
R1(config)# access-list 20 permit host 192.168.50.100
R1(config)# snmp-server community NP-RO RO 20
R1(config)# snmp-server location Rack-A3
<span class="c">! R2: send link and configuration traps to the NMS from Loopback0</span>
R2(config)# snmp-server enable traps snmp linkdown linkup
R2(config)# snmp-server enable traps config
R2(config)# snmp-server host 192.168.50.100 version 2c NP-TRAP
R2(config)# snmp-server trap-source Loopback0</pre>
<p>An SNMPv3 equivalent for polling would be a group with the priv level and a user with SHA authentication and AES encryption:</p>
<pre class="code">R1(config)# snmp-server group NMS-GRP v3 priv
R1(config)# snmp-server user nms1 NMS-GRP v3 auth sha Auth-Pa55 priv aes 128 Priv-Pa55</pre>

<h3>Verification</h3>
<pre class="out">NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
<span class="hl">SNMPv2-MIB::sysLocation.0 = STRING: Rack-A3</span>
PC1&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
Timeout: No Response from 192.168.50.1.
R2# show snmp host
Notification host: 192.168.50.100	udp-port: 162	type: trap
user: NP-TRAP	security model: v2c</pre>
<p>The NMS gets an answer; PC1, which is not in ACL 20, gets a timeout. The agent simply ignores requests it does not accept, so the symptom of a wrong community or a blocked source is always a <b>timeout</b>, never an error message.</p>

<div class="eg"><p><b>Worked example: why 64-bit counters.</b> A 32-bit octet counter wraps after 2<sup>32</sup> = 4,294,967,296 bytes. At a full 1 Gbps (125,000,000 bytes per second) that takes about 34 seconds. If you poll every 5 minutes the counter may wrap several times between polls and the graph is nonsense. The 64-bit high-capacity counters (ifHCInOctets, available from SNMPv2c) will not wrap for years.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving default communities such as "public" and "private". Configuring a community without an ACL. Enabling traps (<code>snmp-server enable traps</code>) but forgetting <code>snmp-server host</code>, or the reverse. Blocking UDP 161 or 162 on a firewall between the NMS and the devices.</p></div>

<div class="exam"><p><b>Exam trap.</b> Polling uses <b>UDP 161</b> on the agent; traps and informs use <b>UDP 162</b> on the manager. Only <b>SNMPv3</b> provides authentication and encryption. An <b>inform</b> is acknowledged; a <b>trap</b> is not. The <b>MIB</b> is the database definition; an <b>OID</b> is one entry in it.</p></div>

<div class="scn"><h4>The graphs that lied</h4><p>A hosting company upgraded its core links to 10 Gbps. The next day the utilisation graphs showed strange drops to near zero every few minutes, and the capacity planning team nearly ordered more links. An engineer noticed that the monitoring tool was still polling the 32-bit ifInOctets counter with SNMPv1. At 10 Gbps the counter wrapped every few seconds. Switching the tool to SNMPv2c and the 64-bit ifHCInOctets counter fixed the graphs, and the team later moved to SNMPv3 authPriv.</p><p><b>Lesson:</b> use 64-bit counters for fast links, and question data that looks physically impossible.</p></div>

<div class="iv"><p class="q">"Explain SNMP polling versus traps, and how you would secure SNMP."</p><p>Strong answer: polling is the manager asking the agent on UDP 161 at intervals; traps are the agent telling the manager about an event on UDP 162, and informs are acknowledged traps. Secure it by using SNMPv3 with authPriv (SHA and AES), removing default communities, using read-only access, restricting sources with ACLs, and filtering SNMP at the firewall so only the NMS can reach the agents.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP has managers, agents and MIBs; each value has an OID.</li>
<li>Get, GetNext, GetBulk and Set go to UDP 161; traps and informs go to UDP 162.</li>
<li>v1 and v2c use clear-text community strings; v3 adds users, authentication and encryption.</li>
<li>Restrict communities with ACLs; a rejected request shows up as a timeout.</li>
<li>Use 64-bit counters (v2c or v3) on fast links.</li>
</ul></div>
`,hi:`
<p>Ek school principal ko classrooms check karte hue socho. Woh kisi bhi room mein jaa kar teacher se pooch sakti hai "kitne students present hain?" Yeh <b>polling</b> hai. Ya koi teacher kuch galat hone par unke office daudta hai: "projector abhi band ho gaya!" Yeh <b>trap</b> hai. <b>Simple Network Management Protocol (SNMP)</b> monitoring station aur network devices ke beech bilkul aise hi kaam karta hai.</p>

<h3>Teen hisse: manager, agent aur MIB</h3>
<dl class="terms">
<dt>Manager (NMS)</dt><dd>Monitoring software jo sawaal poochta hai aur notifications receive karta hai. Lab mein yeh 192.168.50.100 par NMS hai.</dd>
<dt>Agent</dt><dd>Har managed device (router, switch, server, printer) par software jo manager ko jawab deta hai aur notifications bhejta hai. Yeh <b>UDP 161</b> par sunta hai.</dd>
<dt>MIB (Management Information Base)</dt><dd>Agent jo kuch report kar sakta hai uska structured catalogue, ek tree ke roop mein. Har value ka ek <b>OID</b> (object identifier) hota hai, ek dotted number jaise 1.3.6.1.2.1.1.5.0 (sysName). Standard MIBs interfaces aur system data cover karte hain; vendors apne features ke liye private MIBs jodte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="SNMP manager agents ko poll karta hai aur traps receive karta hai">
<rect x="20" y="80" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="106" text-anchor="middle" class="svg-ink" font-size="14">NMS (manager)</text><text x="105" y="126" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.100</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="46" text-anchor="middle" class="svg-ink" font-size="14">R1 agent</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">UDP 161, MIB</text>
<rect x="450" y="140" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="166" text-anchor="middle" class="svg-ink" font-size="14">R2 agent</text><text x="535" y="186" text-anchor="middle" class="svg-muted" font-size="12">traps bhejta hai</text>
<line x1="190" y1="95" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><text x="320" y="58" text-anchor="middle" class="svg-accent" font-size="12">Get / GetNext / GetBulk / Set UDP 161 par</text>
<line x1="450" y1="170" x2="190" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">Trap / Inform UDP 162 par</text>
</svg><p class="cap">Polling manager se agent ke UDP 161 par jaati hai; traps aur informs agent se manager ke UDP 162 par jaate hain.</p></div>

<h3>SNMP messages</h3>
<table class="cmp"><tr><th>Message</th><th>Direction</th><th>Kaam</th></tr>
<tr><td>Get, GetNext</td><td>Manager se agent</td><td>Ek value padhna, ya tree mein agli value (table walk karna)</td></tr>
<tr><td>GetBulk (v2c aur v3)</td><td>Manager se agent</td><td>Ek request mein bahut saari values padhna</td></tr>
<tr><td>Set</td><td>Manager se agent</td><td>Value badalna; read-write access chahiye</td></tr>
<tr><td>Response</td><td>Agent se manager</td><td>Get ya Set ka jawab</td></tr>
<tr><td><b>Trap</b></td><td>Agent se manager</td><td>Bina maange event notification, acknowledge nahi hota</td></tr>
<tr><td><b>Inform</b> (v2c aur v3)</td><td>Agent se manager</td><td>Trap jaisa lekin acknowledge hota hai, isliye kho jaaye to dobara bheja jaata hai</td></tr>
</table>

<h3>Versions, community strings aur authentication</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th><th>Notes</th></tr>
<tr><td><b>SNMPv1</b></td><td>Community string, clear text</td><td>Original; sirf 32-bit counters</td></tr>
<tr><td><b>SNMPv2c</b></td><td>Community string, clear text</td><td>GetBulk, informs aur 64-bit counters jodta hai; sabse zyada deployed</td></tr>
<tr><td><b>SNMPv3</b></td><td>Users ke saath <b>authentication</b> (SHA ke saath HMAC) aur <b>privacy</b> (AES se encryption)</td><td>Security levels noAuthNoPriv, authNoPriv, authPriv; secure choice</td></tr>
</table>
<p><b>Community string</b> asal mein ek shared password hai. Jo bhi ek v1/v2c packet capture kare, use padh sakta hai. Read-write communities ko bahut sensitive maano, har community ko ACL se NMS addresses tak restrict karo, aur jahan tools support karein wahan SNMPv3 authPriv prefer karo.</p>

<h3>Lab mein agent configure karna</h3>
<pre class="code"><span class="c">! R1: read-only community, sirf NMS se use ho sakti hai</span>
R1(config)# access-list 20 permit host 192.168.50.100
R1(config)# snmp-server community NP-RO RO 20
R1(config)# snmp-server location Rack-A3
<span class="c">! R2: link aur configuration traps NMS ko Loopback0 se bhejo</span>
R2(config)# snmp-server enable traps snmp linkdown linkup
R2(config)# snmp-server enable traps config
R2(config)# snmp-server host 192.168.50.100 version 2c NP-TRAP
R2(config)# snmp-server trap-source Loopback0</pre>
<p>Polling ke liye SNMPv3 equivalent ek priv level wala group aur SHA authentication aur AES encryption wala user hoga:</p>
<pre class="code">R1(config)# snmp-server group NMS-GRP v3 priv
R1(config)# snmp-server user nms1 NMS-GRP v3 auth sha Auth-Pa55 priv aes 128 Priv-Pa55</pre>

<h3>Verification</h3>
<pre class="out">NMS&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
<span class="hl">SNMPv2-MIB::sysLocation.0 = STRING: Rack-A3</span>
PC1&gt; snmpget -c NP-RO 192.168.50.1 sysLocation.0
Timeout: No Response from 192.168.50.1.
R2# show snmp host
Notification host: 192.168.50.100	udp-port: 162	type: trap
user: NP-TRAP	security model: v2c</pre>
<p>NMS ko jawab milta hai; PC1, jo ACL 20 mein nahi hai, ko timeout milta hai. Agent jo requests accept nahi karta unhe bas ignore kar deta hai, isliye galat community ya blocked source ka symptom hamesha <b>timeout</b> hota hai, kabhi error message nahi.</p>

<div class="eg"><p><b>Worked example: 64-bit counters kyun.</b> 32-bit octet counter 2<sup>32</sup> = 4,294,967,296 bytes ke baad wrap ho jaata hai. Poore 1 Gbps (125,000,000 bytes per second) par isme lagbhag 34 seconds lagte hain. Agar aap har 5 minute mein poll karte ho to polls ke beech counter kai baar wrap ho sakta hai aur graph bekaar ho jaata hai. 64-bit high-capacity counters (ifHCInOctets, SNMPv2c se available) saalon tak wrap nahi honge.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "public" aur "private" jaise default communities chhod dena. Bina ACL ke community configure karna. Traps enable karna (<code>snmp-server enable traps</code>) lekin <code>snmp-server host</code> bhool jaana, ya ulta. NMS aur devices ke beech firewall par UDP 161 ya 162 block karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Polling agent par <b>UDP 161</b> use karti hai; traps aur informs manager par <b>UDP 162</b>. Sirf <b>SNMPv3</b> authentication aur encryption deta hai. <b>Inform</b> acknowledge hota hai; <b>trap</b> nahi. <b>MIB</b> database definition hai; <b>OID</b> usmein ek entry hai.</p></div>

<div class="scn"><h4>Jhooth bolne wale graphs</h4><p>Ek hosting company ne apne core links 10 Gbps par upgrade kiye. Agle din utilisation graphs mein har kuch minute mein ajeeb se lagbhag zero tak drops dikhe, aur capacity planning team ne lagbhag aur links order kar diye the. Ek engineer ne notice kiya ki monitoring tool abhi bhi SNMPv1 ke saath 32-bit ifInOctets counter poll kar raha tha. 10 Gbps par counter har kuch seconds mein wrap ho raha tha. Tool ko SNMPv2c aur 64-bit ifHCInOctets counter par switch karne se graphs theek ho gaye, aur baad mein team SNMPv3 authPriv par chali gayi.</p><p><b>Seekh:</b> fast links par 64-bit counters use karo, aur jo data physically namumkin lage us par sawaal uthao.</p></div>

<div class="iv"><p class="q">"SNMP polling vs traps samjhao, aur aap SNMP ko secure kaise karoge."</p><p>Strong answer: polling mein manager intervals par agent se UDP 161 par poochta hai; traps mein agent manager ko UDP 162 par event ke baare mein batata hai, aur informs acknowledged traps hain. Secure karne ke liye SNMPv3 authPriv (SHA aur AES) use karo, default communities hatao, read-only access use karo, ACLs se sources restrict karo, aur firewall par SNMP filter karo taaki sirf NMS agents tak pahunch sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP mein managers, agents aur MIBs hote hain; har value ka ek OID hota hai.</li>
<li>Get, GetNext, GetBulk aur Set UDP 161 par jaate hain; traps aur informs UDP 162 par.</li>
<li>v1 aur v2c clear-text community strings use karte hain; v3 users, authentication aur encryption jodta hai.</li>
<li>Communities ko ACLs se restrict karo; rejected request timeout ke roop mein dikhti hai.</li>
<li>Fast links par 64-bit counters (v2c ya v3) use karo.</li>
</ul></div>
`}};export{e as default};