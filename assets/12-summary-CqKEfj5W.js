var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an ASA that had no names, no addresses and no routes. You now know how to bring it to a working internet edge and how to explain every step. Think back to the security desk: the zones are named interfaces with trust levels, the guard's logbook is the connection table, the badge register is the xlate table, and packet-tracer is the CCTV replay that shows exactly where a visitor was stopped. Use this chapter as your revision sheet before labs, exams and interviews.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order of an internet edge">
<rect x="5" y="40" width="98" height="56" rx="8" fill="#e2e8f0"/><text x="54" y="65" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="54" y="83" text-anchor="middle" class="svg-muted" font-size="11">hostname, users</text>
<rect x="111" y="40" width="98" height="56" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Interfaces</text><text x="160" y="83" text-anchor="middle" class="svg-muted" font-size="11">nameif, level</text>
<rect x="217" y="40" width="98" height="56" rx="8" fill="#fde68a"/><text x="266" y="65" text-anchor="middle" class="svg-ink" font-size="12">3 Mgmt</text><text x="266" y="83" text-anchor="middle" class="svg-muted" font-size="11">ssh allow-list</text>
<rect x="323" y="40" width="98" height="56" rx="8" fill="#bbf7d0"/><text x="372" y="65" text-anchor="middle" class="svg-ink" font-size="12">4 Route</text><text x="372" y="83" text-anchor="middle" class="svg-muted" font-size="11">route outside</text>
<rect x="429" y="40" width="98" height="56" rx="8" fill="#ddd6fe"/><text x="478" y="65" text-anchor="middle" class="svg-ink" font-size="12">5 PAT</text><text x="478" y="83" text-anchor="middle" class="svg-muted" font-size="11">object NAT</text>
<rect x="535" y="40" width="100" height="56" rx="8" fill="#fed7aa"/><text x="585" y="65" text-anchor="middle" class="svg-ink" font-size="12">6 Inspect, log</text><text x="585" y="83" text-anchor="middle" class="svg-muted" font-size="11">then save</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Verify each step before the next: show nameif, show route, show nat, show xlate, packet-tracer</text>
</svg><p class="cap">The order that works on every new ASA internet edge.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what an ASA is, how it differs from FTD, and where it runs (5500-X, Secure Firewall hardware, ASAv).</li>
<li>Use the ASA CLI: show in config mode, <code>show route</code>, <code>show interface ip brief</code>, <code>write memory</code>, <code>terminal pager 0</code>.</li>
<li>Describe the boot order and check modes with <code>show version</code>, <code>show firewall</code> and <code>show mode</code>.</li>
<li>Explain routed vs transparent and single vs multiple context, and when to use each.</li>
<li>Set hostname, enable password, local user, RSA key, <code>aaa authentication ssh console LOCAL</code> and SSH/ASDM allow-lists.</li>
<li>Configure physical interfaces and VLAN subinterfaces with nameif, security level and address.</li>
<li>Predict default traffic flow from security levels, and use <code>same-security-traffic</code> correctly.</li>
<li>Write static and default routes with the interface name; recognise ASA OSPF and BGP syntax.</li>
<li>Read <code>show conn</code> and <code>show xlate</code>, and clear them after changes.</li>
<li>Configure dynamic PAT with object NAT for inside and DMZ networks.</li>
<li>Enable ICMP inspection and basic logging; read 106014, 302013, 305011 and 106015.</li>
<li>Run packet-tracer, read its phases, and troubleshoot with the five-step workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASA / ASAv</dt><dd>Cisco's stateful firewall and VPN head-end; ASAv is the virtual form.</dd>
<dt>ROMMON</dt><dd>The bootloader used for recovery and image loading.</dd>
<dt>Routed / transparent mode</dt><dd>Layer 3 hop vs layer 2 bridge (bridge groups, BVI).</dd>
<dt>Security context</dt><dd>A virtual firewall inside one ASA in multiple context mode.</dd>
<dt>nameif</dt><dd>The logical interface name used by every feature.</dd>
<dt>Security level</dt><dd>0 to 100 trust value; higher to lower allowed by default.</dd>
<dt>Connection table</dt><dd>Live flows; lets replies back in (<code>show conn</code>).</dd>
<dt>Xlate</dt><dd>A NAT/PAT translation (<code>show xlate</code>).</dd>
<dt>Object NAT</dt><dd>NAT written inside a network object (section 2).</dd>
<dt>MPF</dt><dd>class-map, policy-map and service-policy for inspection.</dd>
<dt>packet-tracer</dt><dd>Built-in simulator showing each processing phase.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Default level of "inside"</td><td>100; any other name 0</td></tr>
<tr><td>Default traffic</td><td>higher to lower allowed; lower to higher and equal denied</td></tr>
<tr><td>Equal levels</td><td><code>same-security-traffic permit inter-interface</code> (intra-interface for hairpin)</td></tr>
<tr><td>Default route</td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td></tr>
<tr><td>PAT</td><td><code>nat (inside,outside) dynamic interface</code> inside an object; real interface first</td></tr>
<tr><td>Ping fails, web works</td><td>ICMP not inspected by default; add <code>inspect icmp</code></td></tr>
<tr><td>SSH to the ASA</td><td>RSA key + <code>aaa authentication ssh console LOCAL</code> + <code>ssh host mask nameif</code></td></tr>
<tr><td>Changing firewall mode</td><td>clears the running config</td></tr>
<tr><td>Timeouts</td><td>conn 1:00:00, UDP 0:02:00, PAT xlate 0:00:30</td></tr>
<tr><td>DNS / NTP for the box</td><td><code>dns domain-lookup outside</code> + name-server; <code>ntp server ... source outside</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! identity and management</span>
hostname NK-ASA
enable password &lt;password&gt;
username admin password &lt;password&gt; privilege 15
crypto key generate rsa modulus 2048
aaa authentication ssh console LOCAL
ssh 10.0.1.50 255.255.255.255 inside
h&#116;tp server enable
h&#116;tp 10.0.1.50 255.255.255.255 inside
dns domain-lookup outside
dns server-group DefaultDNS
 name-server 198.51.100.53
ntp server 198.51.100.123 source outside
<span class="c">! interfaces</span>
interface GigabitEthernet0/0
 nameif outside
 ip address 203.0.113.2 255.255.255.248
 no shutdown
interface GigabitEthernet0/1
 nameif inside
 ip address 10.0.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.0.2.1 255.255.255.0
 no shutdown
<span class="c">! routing, PAT, inspection, logging</span>
route outside 0.0.0.0 0.0.0.0 203.0.113.1
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface
policy-map global_policy
 class inspection_default
  inspect icmp
logging enable
logging buffered informational
write memory</pre>
<pre class="out">show nameif | show interface ip brief | show route | show nat | show xlate
show conn | show logging | show service-policy inspect icmp
packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</pre>

<h3>What comes next</h3>
<p>The next module adds <b>interface ACLs, objects and object-groups</b>, and the real-IP rule. After that come static NAT and port forwarding, deeper troubleshooting with captures, failover, and transparent mode with route tracking.</p>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Forgetting nameif; naming the inside something other than <code>inside</code> and leaving it at 0; using <code>ip route</code> or wildcard masks; swapping the interfaces in <code>nat (real,mapped)</code>; "fixing" ICMP with <code>permit icmp any any</code>; not saving.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Replies pass because of the connection table, not the level. An outside ACL does not control SSH to the box. packet-tracer simulates one packet in one direction. Routed vs transparent and single vs multiple are independent choices.</p></div>

<div class="scn"><h4>Go-live checklist that saved a weekend</h4><p>A team migrating 30 branch offices to ASAv printed the cheat-sheet above as a go-live checklist. At each branch the engineer ticked: <code>show nameif</code> levels correct, <code>show route</code> has S*, packet-tracer from inside and dmz allowed with a NAT phase, ping and curl from a user PC, <code>write memory</code>. Two branches failed a check (a DMZ at level 0, a missing DMZ PAT rule) and were fixed before users arrived on Monday.</p><p><b>Lesson:</b> the same verification sequence, every time, catches the classic mistakes before users do.</p></div>

<div class="iv"><p class="q">"Configure a new ASA as an internet edge from scratch. What do you do, in order?"</p><p>Strong answer: check the software and modes; set identity and management security; configure interfaces with nameif, levels and addresses; add the default route; configure object NAT PAT for each internal zone; enable ICMP inspection if ping is needed; enable logging to a buffer and a syslog server; verify with show nameif, show route, show nat, show xlate and packet-tracer; test from a host; and save with write memory. Finish by stating what is still denied by default: everything inbound from the internet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: identity, interfaces, management, route, PAT, inspection and logging, then save.</li>
<li>Names and levels decide default behaviour; state lets replies back in.</li>
<li>Object NAT with <code>dynamic interface</code> gives every zone a way back from the internet.</li>
<li><code>inspect icmp</code> fixes the classic "web works, ping does not" ticket.</li>
<li>packet-tracer plus a real host test is how you prove a fix.</li>
</ul></div>
`,hi:`
<p>Aapne ek aise ASA se shuru kiya tha jiske paas koi naam, koi address aur koi route nahi tha. Ab aap jaante ho ki use working internet edge tak kaise laana hai aur har step kaise samjhana hai. Security desk yaad karo: zones trust levels wale named interfaces hain, guard ki logbook connection table hai, badge register xlate table hai, aur packet-tracer CCTV replay hai jo exactly dikhata hai ki visitor kahan roka gaya. Labs, exams aur interviews se pehle is chapter ko apni revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Internet edge banane ka order">
<rect x="5" y="40" width="98" height="56" rx="8" fill="#e2e8f0"/><text x="54" y="65" text-anchor="middle" class="svg-ink" font-size="12">1 Identity</text><text x="54" y="83" text-anchor="middle" class="svg-muted" font-size="11">hostname, users</text>
<rect x="111" y="40" width="98" height="56" rx="8" fill="#bae6fd"/><text x="160" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Interfaces</text><text x="160" y="83" text-anchor="middle" class="svg-muted" font-size="11">nameif, level</text>
<rect x="217" y="40" width="98" height="56" rx="8" fill="#fde68a"/><text x="266" y="65" text-anchor="middle" class="svg-ink" font-size="12">3 Mgmt</text><text x="266" y="83" text-anchor="middle" class="svg-muted" font-size="11">ssh allow-list</text>
<rect x="323" y="40" width="98" height="56" rx="8" fill="#bbf7d0"/><text x="372" y="65" text-anchor="middle" class="svg-ink" font-size="12">4 Route</text><text x="372" y="83" text-anchor="middle" class="svg-muted" font-size="11">route outside</text>
<rect x="429" y="40" width="98" height="56" rx="8" fill="#ddd6fe"/><text x="478" y="65" text-anchor="middle" class="svg-ink" font-size="12">5 PAT</text><text x="478" y="83" text-anchor="middle" class="svg-muted" font-size="11">object NAT</text>
<rect x="535" y="40" width="100" height="56" rx="8" fill="#fed7aa"/><text x="585" y="65" text-anchor="middle" class="svg-ink" font-size="12">6 Inspect, log</text><text x="585" y="83" text-anchor="middle" class="svg-muted" font-size="11">phir save</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Agle se pehle har step verify karo: show nameif, show route, show nat, show xlate, packet-tracer</text>
</svg><p class="cap">Woh order jo har naye ASA internet edge par kaam karta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki ASA kya hai, yeh FTD se kaise alag hai, aur kahan chalta hai (5500-X, Secure Firewall hardware, ASAv).</li>
<li>ASA CLI use karo: config mode mein show, <code>show route</code>, <code>show interface ip brief</code>, <code>write memory</code>, <code>terminal pager 0</code>.</li>
<li>Boot order batao aur <code>show version</code>, <code>show firewall</code> aur <code>show mode</code> se modes check karo.</li>
<li>Routed vs transparent aur single vs multiple context samjhao, aur har ek kab use karna hai.</li>
<li>Hostname, enable password, local user, RSA key, <code>aaa authentication ssh console LOCAL</code> aur SSH/ASDM allow-lists set karo.</li>
<li>Physical interfaces aur VLAN subinterfaces ko nameif, security level aur address ke saath configure karo.</li>
<li>Security levels se default traffic flow predict karo, aur <code>same-security-traffic</code> sahi use karo.</li>
<li>Interface naam ke saath static aur default routes likho; ASA OSPF aur BGP syntax pehchaano.</li>
<li><code>show conn</code> aur <code>show xlate</code> padho, aur changes ke baad unhe clear karo.</li>
<li>Inside aur DMZ networks ke liye object NAT se dynamic PAT configure karo.</li>
<li>ICMP inspection aur basic logging enable karo; 106014, 302013, 305011 aur 106015 padho.</li>
<li>packet-tracer chalao, uske phases padho, aur paanch-step workflow se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASA / ASAv</dt><dd>Cisco ka stateful firewall aur VPN head-end; ASAv virtual roop hai.</dd>
<dt>ROMMON</dt><dd>Recovery aur image loading ke liye use hone wala bootloader.</dd>
<dt>Routed / transparent mode</dt><dd>Layer 3 hop vs layer 2 bridge (bridge groups, BVI).</dd>
<dt>Security context</dt><dd>Multiple context mode mein ek ASA ke andar ek virtual firewall.</dd>
<dt>nameif</dt><dd>Logical interface naam jo har feature use karta hai.</dd>
<dt>Security level</dt><dd>0 se 100 trust value; default se ooncha se neecha allowed.</dd>
<dt>Connection table</dt><dd>Live flows; replies ko andar aane deta hai (<code>show conn</code>).</dd>
<dt>Xlate</dt><dd>Ek NAT/PAT translation (<code>show xlate</code>).</dd>
<dt>Object NAT</dt><dd>Network object ke andar likha NAT (section 2).</dd>
<dt>MPF</dt><dd>Inspection ke liye class-map, policy-map aur service-policy.</dd>
<dt>packet-tracer</dt><dd>Built-in simulator jo har processing phase dikhata hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>"inside" ka default level</td><td>100; koi aur naam 0</td></tr>
<tr><td>Default traffic</td><td>ooncha se neecha allowed; neecha se ooncha aur barabar denied</td></tr>
<tr><td>Barabar levels</td><td><code>same-security-traffic permit inter-interface</code> (hairpin ke liye intra-interface)</td></tr>
<tr><td>Default route</td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td></tr>
<tr><td>PAT</td><td>object ke andar <code>nat (inside,outside) dynamic interface</code>; real interface pehle</td></tr>
<tr><td>Ping fail, web chalta hai</td><td>ICMP default se inspect nahi hota; <code>inspect icmp</code> jodo</td></tr>
<tr><td>ASA ko SSH</td><td>RSA key + <code>aaa authentication ssh console LOCAL</code> + <code>ssh host mask nameif</code></td></tr>
<tr><td>Firewall mode badalna</td><td>running config clear kar deta hai</td></tr>
<tr><td>Timeouts</td><td>conn 1:00:00, UDP 0:02:00, PAT xlate 0:00:30</td></tr>
<tr><td>Box ke liye DNS / NTP</td><td><code>dns domain-lookup outside</code> + name-server; <code>ntp server ... source outside</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! identity aur management</span>
hostname NK-ASA
enable password &lt;password&gt;
username admin password &lt;password&gt; privilege 15
crypto key generate rsa modulus 2048
aaa authentication ssh console LOCAL
ssh 10.0.1.50 255.255.255.255 inside
h&#116;tp server enable
h&#116;tp 10.0.1.50 255.255.255.255 inside
dns domain-lookup outside
dns server-group DefaultDNS
 name-server 198.51.100.53
ntp server 198.51.100.123 source outside
<span class="c">! interfaces</span>
interface GigabitEthernet0/0
 nameif outside
 ip address 203.0.113.2 255.255.255.248
 no shutdown
interface GigabitEthernet0/1
 nameif inside
 ip address 10.0.1.1 255.255.255.0
 no shutdown
interface GigabitEthernet0/2
 nameif dmz
 security-level 50
 ip address 10.0.2.1 255.255.255.0
 no shutdown
<span class="c">! routing, PAT, inspection, logging</span>
route outside 0.0.0.0 0.0.0.0 203.0.113.1
object network INSIDE-NET
 subnet 10.0.1.0 255.255.255.0
 nat (inside,outside) dynamic interface
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
 nat (dmz,outside) dynamic interface
policy-map global_policy
 class inspection_default
  inspect icmp
logging enable
logging buffered informational
write memory</pre>
<pre class="out">show nameif | show interface ip brief | show route | show nat | show xlate
show conn | show logging | show service-policy inspect icmp
packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80</pre>

<h3>Aage kya aata hai</h3>
<p>Agla module <b>interface ACLs, objects aur object-groups</b>, aur real-IP rule jodta hai. Uske baad static NAT aur port forwarding, captures ke saath deeper troubleshooting, failover, aur route tracking ke saath transparent mode aate hain.</p>

<div class="warn"><p><b>Last-minute galtiyan jinse bachna hai.</b> nameif bhoolna; inside ka naam <code>inside</code> ke alawa kuch rakhna aur use 0 par chhod dena; <code>ip route</code> ya wildcard masks use karna; <code>nat (real,mapped)</code> mein interfaces ulat dena; ICMP ko <code>permit icmp any any</code> se "fix" karna; save na karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Replies connection table ki wajah se pass hote hain, level ki wajah se nahi. Outside ACL box ko SSH control nahi karta. packet-tracer ek direction mein ek packet simulate karta hai. Routed vs transparent aur single vs multiple independent choices hain.</p></div>

<div class="scn"><h4>Go-live checklist jisne weekend bachaya</h4><p>30 branch offices ko ASAv par migrate kar rahi ek team ne upar wali cheat-sheet go-live checklist ki tarah print ki. Har branch par engineer ne tick kiya: <code>show nameif</code> levels sahi, <code>show route</code> mein S*, inside aur dmz se packet-tracer NAT phase ke saath allowed, user PC se ping aur curl, <code>write memory</code>. Do branches ek check mein fail hui (level 0 par DMZ, missing DMZ PAT rule) aur Monday ko users ke aane se pehle theek ho gayi.</p><p><b>Seekh:</b> har baar wahi verification sequence classic galtiyan users se pehle pakad leta hai.</p></div>

<div class="iv"><p class="q">"Naye ASA ko scratch se internet edge ki tarah configure karo. Order mein kya karoge?"</p><p>Strong answer: software aur modes check karo; identity aur management security set karo; nameif, levels aur addresses ke saath interfaces configure karo; default route jodo; har internal zone ke liye object NAT PAT configure karo; ping chahiye to ICMP inspection enable karo; buffer aur syslog server par logging enable karo; show nameif, show route, show nat, show xlate aur packet-tracer se verify karo; host se test karo; aur write memory se save karo. Yeh batate hue khatam karo ki default se abhi bhi kya denied hai: internet se aane wala sab kuch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: identity, interfaces, management, route, PAT, inspection aur logging, phir save.</li>
<li>Names aur levels default behaviour decide karte hain; state replies ko andar aane deta hai.</li>
<li><code>dynamic interface</code> wala object NAT har zone ko internet se wapas aane ka raasta deta hai.</li>
<li><code>inspect icmp</code> classic "web chalta hai, ping nahi" ticket fix karta hai.</li>
<li>packet-tracer plus real host test se aap fix saabit karte ho.</li>
</ul></div>
`}};export{e as default};