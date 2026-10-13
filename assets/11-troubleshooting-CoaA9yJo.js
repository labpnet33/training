var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow for the assurance tools`,hi:`Assurance tools ke liye troubleshooting workflow`},body:{en:`
<p>A fire alarm that never rings is worse than no alarm at all, because everyone trusts it. The same is true for assurance tools: a SPAN session that sends nothing, a NetFlow exporter nobody receives, or an IP SLA that is never scheduled gives a false sense of safety. This chapter is a checklist for when the monitoring itself is broken, walking through the failure points of each lab.</p>

<h3>The universal workflow</h3>
<ol>
<li><b>Is it configured?</b> <code>show running-config | section monitor|ip sla|track|flow</code>.</li>
<li><b>Is it active?</b> Scheduled, <code>no shutdown</code>, attached to an interface, in the right direction.</li>
<li><b>Is there input?</b> Is traffic actually crossing the source port or interface right now?</li>
<li><b>Is the transport working?</b> Trunks allow the VLAN; IP reachability exists; ports are not filtered.</li>
<li><b>Does the far end agree?</b> Matching IDs, community strings, SNMP users, collector device lists.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Assurance troubleshooting flow">
<rect x="10" y="45" width="110" height="56" rx="10" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">Configured?</text><text x="65" y="88" text-anchor="middle" class="svg-muted" font-size="12">show run</text>
<rect x="135" y="45" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">Active?</text><text x="190" y="88" text-anchor="middle" class="svg-muted" font-size="12">schedule, no shut</text>
<rect x="260" y="45" width="110" height="56" rx="10" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="13">Input?</text><text x="315" y="88" text-anchor="middle" class="svg-muted" font-size="12">traffic present</text>
<rect x="385" y="45" width="110" height="56" rx="10" fill="#fed7aa"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">Transport?</text><text x="440" y="88" text-anchor="middle" class="svg-muted" font-size="12">trunk, route, ACL</text>
<rect x="510" y="45" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="13">Far end?</text><text x="570" y="88" text-anchor="middle" class="svg-muted" font-size="12">IDs, users match</text>
<line x1="120" y1="73" x2="135" y2="73" stroke="#64748b" stroke-width="2"/><line x1="245" y1="73" x2="260" y2="73" stroke="#64748b" stroke-width="2"/><line x1="370" y1="73" x2="385" y2="73" stroke="#64748b" stroke-width="2"/><line x1="495" y1="73" x2="510" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Five questions that fix almost every broken monitoring setup</text>
</svg><p class="cap">Work left to right; stop at the first "no".</p></div>

<h3>Local SPAN lab: the sniffer sees nothing</h3>
<ul>
<li><code>show monitor session 1</code>: are Gi0/3 (Both) and Gi0/1 (RX Only) listed, and is Gi0/7 the destination? A typo such as <code>g0/8</code> sends copies to an empty port.</li>
<li>Is there traffic? SRV1 may be idle; ping it from PC1 to generate frames.</li>
<li>Is the capture tool on the right NIC and in promiscuous mode?</li>
<li>Seeing only half of a conversation: check the direction (rx versus both).</li>
</ul>

<h3>RSPAN lab: copies stop at a transit switch</h3>
<pre class="out">SW2# show interfaces trunk
Port        Vlans allowed on trunk
Gi0/0       10,999
<span class="hl">Gi0/1       10</span>

SW2# show vlan remote-span
Remote SPAN VLANs
------------------------------------------------------
<span class="hl">999</span></pre>
<p>Here SW2 knows VLAN 999 as remote-span, but Gi0/1 towards SW3 does not allow it. Fix: <code>switchport trunk allowed vlan add 999</code> on SW2 Gi0/1. Also check that the VLAN exists and is marked remote-span on SW2 itself; a transit switch without the VLAN drops the frames.</p>

<h3>ERSPAN lab: the IDS receives nothing</h3>
<ol>
<li>Transport: <code>ping 192.0.2.50 source 172.16.1.1</code> from SW1. No reachability, no ERSPAN.</li>
<li>State: <code>show monitor session 10</code> on SW1 and <code>show monitor session 20</code> on R2. "Admin Disabled" means <code>no shutdown</code> is missing.</li>
<li>Match: ERSPAN ID 77 on both; R2's session IP 192.0.2.50 equals SW1's destination IP.</li>
<li>Path: a capture on the R1 to R2 link should show GRE (protocol 47) from 172.16.1.1 to 192.0.2.50. If it does, the problem is on R2.</li>
<li>Filters: an ACL or firewall on the path that blocks IP protocol 47 kills ERSPAN silently.</li>
</ol>

<h3>IP SLA lab: failover does not happen, or flaps</h3>
<pre class="out">EDGE# show ip sla statistics 1
IPSLA operation id: 1
Latest operation start time: <span class="hl">Unknown</span>
Latest operation return code: <span class="hl">Unknown</span>
Number of successes: Unknown
Number of failures: Unknown</pre>
<p>"Unknown" everywhere means the operation was never scheduled. Other checks:</p>
<ul>
<li><code>show track 1</code>: is it following <code>ip sla 1</code>, and does "Tracked by" list <b>Static IP Routing</b>? If not, the route is not linked to the track.</li>
<li><code>show running-config | include ip route 0.0.0.0</code>: an untracked duplicate of the primary route prevents failover.</li>
<li>The backup route's distance must be higher than 1 (10 in the lab).</li>
<li>Flapping: missing /32 route for 203.0.113.53 via 10.0.1.1, or delays too short.</li>
<li>Track never goes Down although ISP1 upstream is dead: the probe target is reachable some other way, or the probe is testing the wrong address.</li>
</ul>

<h3>NetFlow and SNMP/syslog: the collector is empty</h3>
<ul>
<li><code>show flow interface</code>: monitor applied in the right direction? <code>show flow monitor NAME cache</code>: flows present?</li>
<li><code>show flow exporter statistics</code>: packets sent? If yes, the problem is the path, a firewall on UDP 2055, or the collector's device list (source address).</li>
<li>Syslog: <code>show logging</code> shows the trap level and whether messages were sent to the host. SNMP: <code>show snmp</code> counters for bad community names or unknown users.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "IDS has shown no alerts since Tuesday." Step 1, configured: the ERSPAN source exists on SW1. Step 2, active: yes. Step 3, input: PC1 is sending. Step 4, transport: ping to 192.0.2.50 fails. <code>show ip route 192.0.2.50</code> on R1 is empty: a change on Tuesday removed R1's static route to R2's loopback. Re-adding it restores the mirror. Total time: four commands.</p></div>

<div class="warn"><p><b>Common mistake.</b> Troubleshooting the analyser, the IDS or the collector first. Nine times out of ten the problem is in the switch or router configuration: a missing schedule, a missing <code>no shutdown</code>, a trunk list or a source address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect show outputs with one wrong detail: an RSPAN VLAN missing from one trunk, ERSPAN IDs 77 and 78, a track object following the wrong SLA number, or an FNF monitor applied output instead of input. Read every line.</p></div>

<div class="scn"><h4>The collector that ignored a whole region</h4><p>After a WAN migration, NetFlow data from 14 routers in one region disappeared. Every router showed a full cache and rising exporter counters. A capture at the collector showed the exports arriving, but from new WAN addresses because the exporters had no <code>source</code> command. The collector silently discarded packets from unknown devices. Adding <code>source Loopback0</code> to the exporter template and pushing it to all 14 routers fixed it in one change window.</p><p><b>Lesson:</b> when the sender says "sent" and the receiver says "nothing", check identity (source address, IDs, users) before anything else.</p></div>

<div class="iv"><p class="q">"Your SPAN or ERSPAN session is configured but the analyser receives nothing. Walk me through your troubleshooting."</p><p>Verify the session with <code>show monitor session</code> (sources, direction, destination, state); confirm traffic is flowing on the source; for RSPAN check the remote-span VLAN exists on every switch and is allowed on every trunk; for ERSPAN check IP reachability from the origin address, <code>no shutdown</code> on both sessions, matching ERSPAN IDs and destination IP, and that GRE is not filtered. Finally check the analyser NIC. Mention oversubscription as a cause of partial captures.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five questions: configured, active, input, transport, far end.</li>
<li>SPAN: check session output and direction; RSPAN: VLAN and trunks on every hop.</li>
<li>ERSPAN: reachability, <code>no shutdown</code>, matching IDs and IP, GRE allowed.</li>
<li>IP SLA: "Unknown" statistics mean not scheduled; check "Tracked by", duplicate routes, AD and the /32.</li>
<li>NetFlow: cache, exporter statistics, then source address and firewall.</li>
</ul></div>
`,hi:`
<p>Fire alarm jo kabhi bajta hi nahi, bina alarm se bhi bura hai, kyunki sab us par bharosa karte hain. Assurance tools ke saath bhi yahi hai: SPAN session jo kuch nahi bhejta, NetFlow exporter jise koi receive nahi karta, ya IP SLA jo kabhi schedule hi nahi hua, suraksha ka jhootha ehsaas deta hai. Yeh chapter tab ke liye checklist hai jab monitoring khud toot jaaye, har lab ke failure points se guzarte hue.</p>

<h3>Universal workflow</h3>
<ol>
<li><b>Configured hai?</b> <code>show running-config | section monitor|ip sla|track|flow</code>.</li>
<li><b>Active hai?</b> Scheduled, <code>no shutdown</code>, interface par attached, sahi direction mein.</li>
<li><b>Input hai?</b> Kya abhi sach mein source port ya interface se traffic guzar raha hai?</li>
<li><b>Transport chal raha hai?</b> Trunks VLAN allow karte hain; IP reachability hai; ports filter nahi ho rahe.</li>
<li><b>Far end sehmat hai?</b> Matching IDs, community strings, SNMP users, collector device lists.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Assurance troubleshooting flow">
<rect x="10" y="45" width="110" height="56" rx="10" fill="#bae6fd"/><text x="65" y="70" text-anchor="middle" class="svg-ink" font-size="13">Configured?</text><text x="65" y="88" text-anchor="middle" class="svg-muted" font-size="12">show run</text>
<rect x="135" y="45" width="110" height="56" rx="10" fill="#bbf7d0"/><text x="190" y="70" text-anchor="middle" class="svg-ink" font-size="13">Active?</text><text x="190" y="88" text-anchor="middle" class="svg-muted" font-size="12">schedule, no shut</text>
<rect x="260" y="45" width="110" height="56" rx="10" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="13">Input?</text><text x="315" y="88" text-anchor="middle" class="svg-muted" font-size="12">traffic maujood</text>
<rect x="385" y="45" width="110" height="56" rx="10" fill="#fed7aa"/><text x="440" y="70" text-anchor="middle" class="svg-ink" font-size="13">Transport?</text><text x="440" y="88" text-anchor="middle" class="svg-muted" font-size="12">trunk, route, ACL</text>
<rect x="510" y="45" width="120" height="56" rx="10" fill="#ddd6fe"/><text x="570" y="70" text-anchor="middle" class="svg-ink" font-size="13">Far end?</text><text x="570" y="88" text-anchor="middle" class="svg-muted" font-size="12">IDs, users match</text>
<line x1="120" y1="73" x2="135" y2="73" stroke="#64748b" stroke-width="2"/><line x1="245" y1="73" x2="260" y2="73" stroke="#64748b" stroke-width="2"/><line x1="370" y1="73" x2="385" y2="73" stroke="#64748b" stroke-width="2"/><line x1="495" y1="73" x2="510" y2="73" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Paanch sawaal jo lagbhag har tooti monitoring setup theek karte hain</text>
</svg><p class="cap">Left se right kaam karo; pehle "nahi" par ruko.</p></div>

<h3>Local SPAN lab: sniffer ko kuch nahi dikhta</h3>
<ul>
<li><code>show monitor session 1</code>: kya Gi0/3 (Both) aur Gi0/1 (RX Only) listed hain, aur kya Gi0/7 destination hai? <code>g0/8</code> jaisa typo copies ko khaali port par bhej deta hai.</li>
<li>Traffic hai? SRV1 idle ho sakta hai; frames banane ke liye PC1 se use ping karo.</li>
<li>Kya capture tool sahi NIC par aur promiscuous mode mein hai?</li>
<li>Conversation ka sirf aadha hissa dikhna: direction check karo (rx versus both).</li>
</ul>

<h3>RSPAN lab: copies transit switch par ruk jaati hain</h3>
<pre class="out">SW2# show interfaces trunk
Port        Vlans allowed on trunk
Gi0/0       10,999
<span class="hl">Gi0/1       10</span>

SW2# show vlan remote-span
Remote SPAN VLANs
------------------------------------------------------
<span class="hl">999</span></pre>
<p>Yahan SW2 VLAN 999 ko remote-span ke roop mein jaanta hai, par SW3 ki taraf Gi0/1 use allow nahi karta. Fix: SW2 Gi0/1 par <code>switchport trunk allowed vlan add 999</code>. Yeh bhi check karo ki VLAN SW2 par khud exist karta hai aur remote-span marked hai; bina VLAN ka transit switch frames drop kar deta hai.</p>

<h3>ERSPAN lab: IDS ko kuch nahi milta</h3>
<ol>
<li>Transport: SW1 se <code>ping 192.0.2.50 source 172.16.1.1</code>. Reachability nahi, to ERSPAN nahi.</li>
<li>State: SW1 par <code>show monitor session 10</code> aur R2 par <code>show monitor session 20</code>. "Admin Disabled" ka matlab <code>no shutdown</code> gayab hai.</li>
<li>Match: dono par ERSPAN ID 77; R2 ke session ka IP 192.0.2.50 SW1 ke destination IP ke barabar hai.</li>
<li>Path: R1 se R2 link par capture mein 172.16.1.1 se 192.0.2.50 tak GRE (protocol 47) dikhna chahiye. Agar dikhta hai, to problem R2 par hai.</li>
<li>Filters: path par koi ACL ya firewall jo IP protocol 47 block kare, ERSPAN ko chupchaap maar deta hai.</li>
</ol>

<h3>IP SLA lab: failover nahi hota, ya flap karta hai</h3>
<pre class="out">EDGE# show ip sla statistics 1
IPSLA operation id: 1
Latest operation start time: <span class="hl">Unknown</span>
Latest operation return code: <span class="hl">Unknown</span>
Number of successes: Unknown
Number of failures: Unknown</pre>
<p>Har jagah "Unknown" ka matlab operation kabhi schedule hi nahi hua. Doosre checks:</p>
<ul>
<li><code>show track 1</code>: kya yeh <code>ip sla 1</code> follow kar raha hai, aur kya "Tracked by" mein <b>Static IP Routing</b> listed hai? Agar nahi, to route track se juda nahi hai.</li>
<li><code>show running-config | include ip route 0.0.0.0</code>: primary route ka untracked duplicate failover rok deta hai.</li>
<li>Backup route ki distance 1 se zyada honi chahiye (lab mein 10).</li>
<li>Flapping: 10.0.1.1 ke through 203.0.113.53 ka /32 route gayab hai, ya delays bahut chhote hain.</li>
<li>ISP1 upstream dead hone par bhi track kabhi Down nahi hota: probe target kisi aur raaste se reachable hai, ya probe galat address test kar raha hai.</li>
</ul>

<h3>NetFlow aur SNMP/syslog: collector khaali hai</h3>
<ul>
<li><code>show flow interface</code>: monitor sahi direction mein applied hai? <code>show flow monitor NAME cache</code>: flows maujood hain?</li>
<li><code>show flow exporter statistics</code>: packets gaye? Agar haan, to problem path, UDP 2055 par firewall, ya collector ki device list (source address) mein hai.</li>
<li>Syslog: <code>show logging</code> trap level dikhata hai aur yeh ki host ko messages gaye ya nahi. SNMP: bad community names ya unknown users ke liye <code>show snmp</code> counters.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Mangalvaar se IDS ne koi alert nahi dikhaya." Step 1, configured: SW1 par ERSPAN source maujood hai. Step 2, active: haan. Step 3, input: PC1 bhej raha hai. Step 4, transport: 192.0.2.50 ka ping fail hota hai. R1 par <code>show ip route 192.0.2.50</code> khaali hai: Mangalvaar ke ek change ne R1 ka R2 ke loopback wala static route hata diya. Use dobara jodne se mirror wapas aa jaata hai. Kul time: chaar commands.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle analyser, IDS ya collector ko troubleshoot karna. Dus mein se nau baar problem switch ya router configuration mein hoti hai: gayab schedule, gayab <code>no shutdown</code>, trunk list ya source address.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek galat detail wale show outputs expect karo: ek trunk se gayab RSPAN VLAN, ERSPAN IDs 77 aur 78, galat SLA number follow karta track object, ya input ki jagah output applied FNF monitor. Har line padho.</p></div>

<div class="scn"><h4>Collector jisne poore region ko ignore kiya</h4><p>WAN migration ke baad ek region ke 14 routers ka NetFlow data gayab ho gaya. Har router mein full cache aur badhte exporter counters the. Collector par capture mein exports aate dikhe, par naye WAN addresses se, kyunki exporters mein <code>source</code> command nahi tha. Collector unknown devices ke packets chupchaap discard kar raha tha. Exporter template mein <code>source Loopback0</code> jodkar saare 14 routers par push karne se ek change window mein fix ho gaya.</p><p><b>Seekh:</b> jab sender kahe "bheja" aur receiver kahe "kuch nahi", to sabse pehle identity (source address, IDs, users) check karo.</p></div>

<div class="iv"><p class="q">"Aapka SPAN ya ERSPAN session configured hai par analyser ko kuch nahi milta. Apni troubleshooting samjhao."</p><p><code>show monitor session</code> se session verify karo (sources, direction, destination, state); confirm karo ki source par traffic chal raha hai; RSPAN ke liye check karo ki remote-span VLAN har switch par hai aur har trunk par allowed hai; ERSPAN ke liye origin address se IP reachability, dono sessions par <code>no shutdown</code>, matching ERSPAN IDs aur destination IP, aur yeh ki GRE filter nahi ho raha. Aakhir mein analyser NIC check karo. Partial captures ki wajah ke roop mein oversubscription batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawaal: configured, active, input, transport, far end.</li>
<li>SPAN: session output aur direction check karo; RSPAN: har hop par VLAN aur trunks.</li>
<li>ERSPAN: reachability, <code>no shutdown</code>, matching IDs aur IP, GRE allowed.</li>
<li>IP SLA: "Unknown" statistics matlab schedule nahi hua; "Tracked by", duplicate routes, AD aur /32 check karo.</li>
<li>NetFlow: cache, exporter statistics, phir source address aur firewall.</li>
</ul></div>
`}};export{e as default};