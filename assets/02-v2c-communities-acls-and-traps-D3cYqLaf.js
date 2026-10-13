var e={id:`v2c-communities-acls-traps`,h:{en:`SNMP v2c: communities, ACLs and traps`,hi:`SNMP v2c: communities, ACLs aur traps`},body:{en:`
<h3>An analogy: the guest wifi password on a sticky note</h3>
<p>SNMP version 1 and version 2c protect access with a <b>community string</b>. A community string is a shared password, and it travels in clear text in every packet. It is like a wifi password written on a sticky note at the front desk: anyone who sees it can use it. That does not make v2c useless; it makes it something you must fence in. The fence is an access list, and the best fix is version 3 (next chapter).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="v2c polls and traps">
<rect x="20" y="40" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.1.50.100</text>
<rect x="250" y="20" width="130" height="30" rx="6" fill="#fde68a"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="12">ACL 20: permit host 10.1.50.100</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">Router agent</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">GF-RO, GF-TRAP</text>
<line x1="140" y1="55" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><text x="400" y="48" text-anchor="middle" class="svg-muted" font-size="11">get / walk to UDP 161</text>
<line x1="480" y1="85" x2="140" y2="85" stroke="#ea5d0c" stroke-width="2"/><text x="310" y="104" text-anchor="middle" class="svg-accent" font-size="11">trap to UDP 162 from Loopback0</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12"></text>
</svg><p class="cap">Polls pass the ACL; traps come from a fixed loopback.</p></div>

<h3>Versions at a glance</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th><th>Notes</th></tr>
<tr><td>v1</td><td>community string, clear text</td><td>oldest, 32-bit counters only</td></tr>
<tr><td>v2c</td><td>community string, clear text</td><td>adds GetBulk, 64-bit counters, informs</td></tr>
<tr><td>v3</td><td>users, authentication, encryption</td><td>the secure choice</td></tr></table>
<p>The "c" in v2c means community-based. There was a v2 with real security that never became popular, so the "c" version won.</p>

<h3>Communities: read-only and read-write</h3>
<p>A community has an access level. <b>RO</b> (read-only) allows get, getnext and walk. <b>RW</b> (read-write) also allows set, which can change the hostname, location or even more on a real device. For monitoring you only ever need RO. Never create an RW community unless a documented task needs it.</p>
<p>Choose the name carefully. The names <b>public</b> and <b>private</b> are the first ones any scanner or attacker tries. Godavari Foods uses <b>GF-RO</b> for reading and <b>GF-TRAP</b> for traps. In real life, make them longer and random.</p>

<h3>Restricting by ACL</h3>
<p>You attach a standard access list to the community so that only the NMS may use it:</p>
<pre class="code">HYD-CORE-R1(config)# access-list 20 permit host 10.1.50.100
HYD-CORE-R1(config)# snmp-server community GF-RO RO 20
HYD-CORE-R1(config)# snmp-server location Hyderabad-Rack-A1
HYD-CORE-R1(config)# snmp-server contact noc@godavari.example</pre>
<p>Read it: ACL 20 has one permit line, for the NMS; an implicit deny follows. The community GF-RO is read-only and bound to ACL 20. A request with the right string from any other address is dropped. Verify it:</p>
<pre class="out">HYD-CORE-R1# show snmp community

Community name: GF-RO
Community Index: GF-RO
Community SecurityName: GF-RO
storage-type: nonvolatile        active    <span class="hl">access-list: 20</span>
<span class="hl">access: read-only</span>

HYD-CORE-R1# show access-lists 20
Standard IP access list 20
    10 permit 10.1.50.100 (6 matches)</pre>
<p>The match counter on the ACL line is a quick test: after an snmpget from the NMS it rises. If a poll from another host fails and the counter stays the same, the host never reached the list, so look at routing or a firewall.</p>

<h3>What happens when you try to write with a read-only community</h3>
<pre class="out">NMS&gt; snmpset -c GF-RO 10.255.0.1 sysLocation.0 s "Rack-B2"
Error in packet.
Reason: noAccess
Failed object: SNMPv2-MIB::sysLocation.0</pre>
<p>That refusal is correct. A real net-snmp client may name the error differently (for example notWritable); the point is that RO cannot change anything.</p>

<h3>Traps and informs: the device speaks first</h3>
<p>Polling asks questions on a schedule. A <b>trap</b> is the device volunteering news: a link went down, the configuration changed, the router restarted. It is sent to UDP 162 on the manager. An <b>inform</b> is a trap that needs an acknowledgement; the sender retries until the manager replies. Informs cost slightly more but do not get lost silently.</p>
<pre class="code"><span class="c">! which events to send</span>
HYD-CORE-R1(config)# snmp-server enable traps snmp linkdown linkup
HYD-CORE-R1(config)# snmp-server enable traps config
<span class="c">! where to send them, using the trap community</span>
HYD-CORE-R1(config)# snmp-server host 10.1.50.100 version 2c GF-TRAP
<span class="c">! always the same source address</span>
HYD-CORE-R1(config)# snmp-server trap-source Loopback0</pre>
<p>Why <code>trap-source Loopback0</code>? A router has many interface addresses. Without it, the trap leaves with the address of the exit interface, which can change after a topology change. A fixed loopback gives the NMS one stable identity per router (10.255.0.1) and lets the NMS or firewall allow exactly that address. Now cause an event and look at the receiver:</p>
<pre class="out">HYD-CORE-R1(config)# interface GigabitEthernet0/2
HYD-CORE-R1(config-if)# shutdown

NMS&gt; show traps
SNMP trap receiver (UDP 162): 2 traps received
Oct  7 09:31:08  from 10.255.0.1   v2c  GF-TRAP  linkDown   ifIndex.3=down(2)
Oct  7 09:31:08  from 10.255.0.1   v2c  GF-TRAP  configChange

HYD-CORE-R1# show snmp host
Notification host: 10.1.50.100  udp-port: 162  type: trap
user: GF-TRAP  security model: v2c</pre>
<p>Two traps arrived: the link-down and the configuration change. If you wanted informs, add the keyword: <code>snmp-server host 10.1.50.100 informs version 2c GF-TRAP</code>.</p>

<div class="eg"><p><b>Worked example.</b> Count the cost. 50 devices polled every 5 minutes for 20 objects each is 50 x 20 / 300 s, about 3.3 requests a second. That is trivial. A link flapping 20 times a minute sends 40 traps a minute from one port; that is why you filter which traps you enable and why the next module (syslog) and alert tuning matter.</p></div>

<h3>Polling versus traps in practice</h3>
<p>Use both. Polling every 5 minutes gives graphs and detects a silent router. Traps give a link-down alert within a second. If a trap is lost (UDP, no acknowledgement) the next poll still shows the interface down. If a poll is missed, the trap fills the gap.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using public or private. (2) No ACL on the community, so anyone on the network can read the device. (3) Creating an RW community "just in case". (4) Typing the trap host without a community, or with a community the NMS does not expect. (5) Forgetting that the ACL checks the <i>source</i> address of the poll: if the NMS is behind NAT or a different address, it is denied.</p></div>
<div class="exam"><p><b>Exam trap.</b> Community strings are not encrypted. An ACL on the community limits who may use it but does not hide it. Also: the standard ACL on a community matches the source of the incoming SNMP request, not the destination. Traps go to the host you list, from the trap-source address.</p></div>

<div class="scn"><h4>The community that anyone could read</h4><p>An audit found Kochi's switch using the community "public" with no ACL. From a laptop on the guest VLAN, a tester walked the switch and listed every VLAN and neighbour. Ravi Menon replaced it with GF-RO bound to ACL 20, removed the RW community nobody remembered creating, and verified that the same walk from the laptop now timed out while the NMS still worked.</p><p><b>Lesson:</b> a default community with no ACL is an open door to your network map.</p></div>

<div class="iv"><p class="q">"How do you secure SNMP v2c if you cannot use v3?"</p><p>Strong answer: use a long non-default community, read-only, bound to a standard ACL that permits only the NMS; keep SNMP on the management network or behind a firewall; send traps from a fixed loopback; remove unused RW communities; and plan the move to v3 as soon as the devices support it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v2c uses a clear-text community string; RO reads, RW can also write.</li>
<li>Never use public or private; bind the community to an ACL such as ACL 20 (permit host 10.1.50.100).</li>
<li>Verify with show snmp community and the ACL match counters.</li>
<li>Traps are unacknowledged events; informs are acknowledged. Both go to UDP 162.</li>
<li>Configure enable traps, snmp-server host with version 2c GF-TRAP, and trap-source Loopback0, then check show traps on the NMS.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: sticky note par likha guest wifi password</h3>
<p>SNMP version 1 aur version 2c access ko <b>community string</b> se protect karte hain. Community string ek shared password hai, aur yeh har packet mein clear text mein jaati hai. Yeh front desk par sticky note par likhe wifi password jaisi hai: jo bhi dekhe use use kar sakta hai. Isse v2c bekaar nahi ho jaata; matlab hai ki aapko use baad ke andar rakhna hoga. Fence ek access list hai, aur best fix version 3 hai (agla chapter).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="v2c polls and traps">
<rect x="20" y="40" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="80" y="66" text-anchor="middle" class="svg-ink" font-size="13">NMS</text><text x="80" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.1.50.100</text>
<rect x="250" y="20" width="130" height="30" rx="6" fill="#fde68a"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="12">ACL 20: permit host 10.1.50.100</text>
<rect x="480" y="40" width="140" height="60" rx="8" fill="#bae6fd"/><text x="550" y="66" text-anchor="middle" class="svg-ink" font-size="13">Router agent</text><text x="550" y="84" text-anchor="middle" class="svg-muted" font-size="11">GF-RO, GF-TRAP</text>
<line x1="140" y1="55" x2="480" y2="55" stroke="#64748b" stroke-width="2"/><text x="400" y="48" text-anchor="middle" class="svg-muted" font-size="11">get / walk to UDP 161</text>
<line x1="480" y1="85" x2="140" y2="85" stroke="#ea5d0c" stroke-width="2"/><text x="310" y="104" text-anchor="middle" class="svg-accent" font-size="11">trap to UDP 162 from Loopback0</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12"></text>
</svg><p class="cap">Polls ACL se guzarte hain; traps fixed loopback se aate hain.</p></div>

<h3>Versions ek nazar mein</h3>
<table class="cmp"><tr><th>Version</th><th>Security</th><th>Notes</th></tr>
<tr><td>v1</td><td>community string, clear text</td><td>sabse purana, sirf 32-bit counters</td></tr>
<tr><td>v2c</td><td>community string, clear text</td><td>GetBulk, 64-bit counters, informs jodta hai</td></tr>
<tr><td>v3</td><td>users, authentication, encryption</td><td>secure choice</td></tr></table>
<p>v2c ka "c" community-based ka matlab hai. Ek v2 tha jisme real security thi lekin woh popular nahi hua, isliye "c" wala version jeeta.</p>

<h3>Communities: read-only aur read-write</h3>
<p>Community ka ek access level hota hai. <b>RO</b> (read-only) get, getnext aur walk allow karta hai. <b>RW</b> (read-write) set bhi allow karta hai, jo real device par hostname, location ya usse bhi zyada badal sakta hai. Monitoring ke liye aapko sirf RO chahiye. RW community tab tak mat banao jab tak koi documented task use na maange.</p>
<p>Naam dhyaan se chuno. <b>public</b> aur <b>private</b> naam har scanner ya attacker sabse pehle try karta hai. Godavari Foods padhne ke liye <b>GF-RO</b> aur traps ke liye <b>GF-TRAP</b> use karta hai. Real life mein inhe lamba aur random banao.</p>

<h3>ACL se restrict karna</h3>
<p>Aap community par standard access list lagate ho taaki sirf NMS use kar sake:</p>
<pre class="code">HYD-CORE-R1(config)# access-list 20 permit host 10.1.50.100
HYD-CORE-R1(config)# snmp-server community GF-RO RO 20
HYD-CORE-R1(config)# snmp-server location Hyderabad-Rack-A1
HYD-CORE-R1(config)# snmp-server contact noc@godavari.example</pre>
<p>Padho: ACL 20 mein ek permit line hai, NMS ke liye; uske baad implicit deny. Community GF-RO read-only hai aur ACL 20 se bandhi hai. Kisi aur address se sahi string wali request drop ho jaati hai. Verify karo:</p>
<pre class="out">HYD-CORE-R1# show snmp community

Community name: GF-RO
Community Index: GF-RO
Community SecurityName: GF-RO
storage-type: nonvolatile        active    <span class="hl">access-list: 20</span>
<span class="hl">access: read-only</span>

HYD-CORE-R1# show access-lists 20
Standard IP access list 20
    10 permit 10.1.50.100 (6 matches)</pre>
<p>ACL line ka match counter ek quick test hai: NMS se snmpget ke baad woh badhta hai. Agar kisi aur host ka poll fail ho aur counter wahi rahe, to host list tak pahuncha hi nahi, isliye routing ya firewall dekho.</p>

<h3>Read-only community se write karoge to kya hoga</h3>
<pre class="out">NMS&gt; snmpset -c GF-RO 10.255.0.1 sysLocation.0 s "Rack-B2"
Error in packet.
Reason: noAccess
Failed object: SNMPv2-MIB::sysLocation.0</pre>
<p>Yeh inkaar sahi hai. Real net-snmp client error ka naam alag de sakta hai (jaise notWritable); matlab yeh hai ki RO kuch badal nahi sakta.</p>

<h3>Traps aur informs: device pehle bolta hai</h3>
<p>Polling schedule par sawaal poochti hai. <b>Trap</b> device ka khud khabar dena hai: link down hua, configuration badli, router restart hua. Yeh manager ke UDP 162 par jaata hai. <b>Inform</b> woh trap hai jise acknowledgement chahiye; sender manager ke reply karne tak retry karta hai. Informs thoda zyada cost karte hain par chupchaap kho nahi jaate.</p>
<pre class="code"><span class="c">! which events to send</span>
HYD-CORE-R1(config)# snmp-server enable traps snmp linkdown linkup
HYD-CORE-R1(config)# snmp-server enable traps config
<span class="c">! where to send them, using the trap community</span>
HYD-CORE-R1(config)# snmp-server host 10.1.50.100 version 2c GF-TRAP
<span class="c">! always the same source address</span>
HYD-CORE-R1(config)# snmp-server trap-source Loopback0</pre>
<p><code>trap-source Loopback0</code> kyun? Router ke kai interface addresses hote hain. Iske bina trap exit interface ke address ke saath nikalta hai, jo topology badalne par badal sakta hai. Fixed loopback NMS ko har router ki ek stable pehchan (10.255.0.1) deta hai aur NMS ya firewall ko exactly wahi address allow karne deta hai. Ab ek event karo aur receiver dekho:</p>
<pre class="out">HYD-CORE-R1(config)# interface GigabitEthernet0/2
HYD-CORE-R1(config-if)# shutdown

NMS&gt; show traps
SNMP trap receiver (UDP 162): 2 traps received
Oct  7 09:31:08  from 10.255.0.1   v2c  GF-TRAP  linkDown   ifIndex.3=down(2)
Oct  7 09:31:08  from 10.255.0.1   v2c  GF-TRAP  configChange

HYD-CORE-R1# show snmp host
Notification host: 10.1.50.100  udp-port: 162  type: trap
user: GF-TRAP  security model: v2c</pre>
<p>Do traps aaye: link-down aur configuration change. Agar informs chahiye the to keyword jodo: <code>snmp-server host 10.1.50.100 informs version 2c GF-TRAP</code>.</p>

<div class="eg"><p><b>Worked example.</b> Cost gino. 50 devices har 5 minute mein 20 objects ke saath poll hon to 50 x 20 / 300 s, lagbhag 3.3 requests per second. Yeh kuch nahi hai. Ek link jo ek minute mein 20 baar flap kare woh ek port se ek minute mein 40 traps bhejta hai; isiliye aap kaunse traps enable karte ho woh filter karte ho, aur isiliye agla module (syslog) aur alert tuning matter karte hain.</p></div>

<h3>Practice mein polling versus traps</h3>
<p>Dono use karo. Har 5 minute ki polling graphs deti hai aur khamosh router pakadti hai. Traps ek second ke andar link-down alert dete hain. Agar trap kho jaye (UDP, acknowledgement nahi) to agla poll bhi interface ko down dikhata hai. Agar poll miss ho jaye to trap gap bhar deta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) public ya private use karna. (2) Community par ACL nahi, to network par koi bhi device padh sakta hai. (3) "Kabhi kaam aayegi" soch kar RW community banana. (4) Trap host bina community ke type karna, ya aisi community ke saath jo NMS expect nahi karta. (5) Yeh bhoolna ki ACL poll ka <i>source</i> address check karti hai: agar NMS NAT ke peeche ya kisi alag address par hai, to woh deny ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Community strings encrypted nahi hoti. Community par ACL sirf limit karti hai kaun use kar sakta hai, chhupati nahi. Saath hi: community par standard ACL incoming SNMP request ke source ko match karti hai, destination ko nahi. Traps aapke list kiye host ko jaate hain, trap-source address se.</p></div>

<div class="scn"><h4>Woh community jise koi bhi padh sakta tha</h4><p>Ek audit mein Kochi ke switch par community "public" bina ACL ke mili. Guest VLAN ke ek laptop se tester ne switch ko walk kiya aur har VLAN aur neighbour list kar diya. Ravi Menon ne use ACL 20 se bandhi GF-RO se badla, woh RW community hata di jo kisi ko yaad nahi thi ki kisne banayi, aur verify kiya ki laptop se wahi walk ab time out hota hai jabki NMS abhi bhi kaam karta hai.</p><p><b>Seekh:</b> bina ACL ki default community aapke network map ka khula darwaza hai.</p></div>

<div class="iv"><p class="q">"Agar v3 use nahi kar sakte to SNMP v2c ko kaise secure karoge?"</p><p>Strong answer: lambi non-default community use karo, read-only, ek standard ACL se bandhi jo sirf NMS ko permit kare; SNMP ko management network par ya firewall ke peeche rakho; traps fixed loopback se bhejo; unused RW communities hatao; aur devices support karein to jaldi se jaldi v3 par move karne ka plan banao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v2c clear-text community string use karta hai; RO padhta hai, RW likh bhi sakta hai.</li>
<li>public ya private kabhi nahi; community ko ACL 20 (permit host 10.1.50.100) jaisi ACL se bandho.</li>
<li>show snmp community aur ACL match counters se verify karo.</li>
<li>Traps unacknowledged events hain; informs acknowledged. Dono UDP 162 par jaate hain.</li>
<li>enable traps, version 2c GF-TRAP ke saath snmp-server host, aur trap-source Loopback0 configure karo, phir NMS par show traps check karo.</li>
</ul></div>
`}};export{e as default};