var e={id:`troubleshooting`,h:{en:`Troubleshooting cloud and hybrid networks`,hi:`Cloud aur hybrid networks ka troubleshooting`},body:{en:`
<p>When water stops coming out of a tap in a tall building, a good plumber does not start by replacing the tap. She walks the pipe: is the main valve open, is the tank full, is the pump running, is the floor valve open, is the tap itself blocked? One check at a time, in the order the water flows. Cloud troubleshooting is the same: <b>follow the packet</b> hop by hop, and check each control it meets, in both directions.</p>

<h3>The workflow</h3>
<p>Use the standard CompTIA method (identify the problem, theorise, test, plan, implement, verify, document) and, for the testing part, walk the path in this order:</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Cloud troubleshooting flow">
<rect x="20" y="10" width="290" height="36" rx="6" fill="#fde68a"/><text x="165" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Scope: who, what, since when, what changed?</text>
<rect x="20" y="56" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="79" text-anchor="middle" class="svg-ink" font-size="13">2. Target up and listening on the port?</text>
<rect x="20" y="102" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="125" text-anchor="middle" class="svg-ink" font-size="13">3. Security group allows the source?</text>
<rect x="20" y="148" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="171" text-anchor="middle" class="svg-ink" font-size="13">4. Network ACL, both directions?</text>
<rect x="20" y="194" width="290" height="36" rx="6" fill="#bae6fd"/><text x="165" y="217" text-anchor="middle" class="svg-ink" font-size="13">5. Route tables: subnet, IGW, NAT?</text>
<rect x="20" y="240" width="290" height="36" rx="6" fill="#bae6fd"/><text x="165" y="263" text-anchor="middle" class="svg-ink" font-size="13">6. Hybrid path: tunnel, BGP, overlap?</text>
<rect x="20" y="286" width="290" height="36" rx="6" fill="#ddd6fe"/><text x="165" y="309" text-anchor="middle" class="svg-ink" font-size="13">7. MTU, DNS, SD-WAN policy, drift</text>
<line x1="165" y1="46" x2="165" y2="56" stroke="#64748b" stroke-width="2"/><line x1="165" y1="92" x2="165" y2="102" stroke="#64748b" stroke-width="2"/><line x1="165" y1="138" x2="165" y2="148" stroke="#64748b" stroke-width="2"/><line x1="165" y1="184" x2="165" y2="194" stroke="#64748b" stroke-width="2"/><line x1="165" y1="230" x2="165" y2="240" stroke="#64748b" stroke-width="2"/><line x1="165" y1="276" x2="165" y2="286" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="56" width="280" height="220" rx="8" fill="#e2e8f0"/>
<text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="13">Evidence to collect</text>
<text x="355" y="108" class="svg-muted" font-size="12">flow logs: ACCEPT or REJECT</text>
<text x="355" y="134" class="svg-muted" font-size="12">route table of the subnet</text>
<text x="355" y="160" class="svg-muted" font-size="12">show crypto ikev2 sa</text>
<text x="355" y="186" class="svg-muted" font-size="12">show ip route / BGP prefixes</text>
<text x="355" y="212" class="svg-muted" font-size="12">ping with DF set, traceroute</text>
<text x="355" y="238" class="svg-muted" font-size="12">git log, terraform plan</text>
<text x="355" y="264" class="svg-muted" font-size="12">SD-WAN path SLA report</text>
</svg><p class="cap">Follow the packet from the target outward. Steps 3 to 5 are where most cloud tickets end.</p></div>

<h3>Symptom to likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check first</th></tr>
<tr><td>Connection times out</td><td>Security group, network ACL, route table (a silent drop)</td></tr>
<tr><td>Connection refused immediately</td><td>Service not listening on the target (the packet arrived)</td></tr>
<tr><td>Private VM cannot get updates</td><td>Subnet route to NAT gateway; NAT gateway in a public subnet</td></tr>
<tr><td>Public VM unreachable from internet</td><td>Public IP, IGW route, security group</td></tr>
<tr><td>On-premises cannot reach VPC</td><td>Tunnel status, BGP prefixes both ways, route propagation, overlapping ranges</td></tr>
<tr><td>Ping works, large transfers hang</td><td>MTU through VPN or VXLAN; MSS adjustment</td></tr>
<tr><td>Works by IP, not by name</td><td>DNS: private zone, resolver forwarding between cloud and on-premises</td></tr>
<tr><td>Fixed yesterday, broken again today</td><td>IaC drift correction; check the code and recent commits</td></tr>
</table>

<h3>Walkthrough: "HQ reporting cannot reach the tracking API"</h3>
<p>Ticket: since this morning, the reporting server at HQ (10.10.5.20) cannot connect to the tracking API on 10.20.11.15 port 8080. Web customers are fine.</p>
<p><b>Scope.</b> Only HQ to the app tier fails; the internet path works. Yesterday a change "tidied" the app security groups.</p>
<p><b>Hybrid path.</b> Check the tunnel and routes on HQ-R1:</p>
<pre class="out">HQ-R1# show crypto ikev2 sa | include READY
1         203.0.113.10/500      198.51.100.20/500     none/none            <span class="hl">READY</span>
HQ-R1# show ip route 10.20.11.15
Routing entry for 10.20.0.0/16
  Known via "bgp 65010", distance 20, metric 0
  Tag 64512, type external
  Last update from 169.254.10.1 01:12:40 ago
  Routing Descriptor Blocks:
  <span class="hl">* 169.254.10.1, from 169.254.10.1, 01:12:40 ago</span></pre>
<p>Tunnel up and the route is learned, so the packet leaves HQ toward the VPC. Next, look at what the VPC did with it using <b>flow logs</b>, which record accepted and rejected traffic per network interface:</p>
<pre class="out">2 123456789012 eni-0b7c6d5e4f3a21098 10.10.5.20 10.20.11.15 51514 8080 6 3 180 1759137600 1759137660 <span class="hl">REJECT</span> OK
2 123456789012 eni-0b7c6d5e4f3a21098 10.20.1.40 10.20.11.15 40112 8080 6 12 4210 1759137600 1759137660 ACCEPT OK</pre>
<p>The fields are version, account, interface, source, destination, source port, destination port, protocol (6 = TCP), packets, bytes, start, end, action, log status. Traffic from the load balancer (10.20.1.40) is accepted; traffic from HQ is <b>rejected</b> at the app VM's interface. The network ACL on the app subnet allows 10.10.0.0/16, so the remaining suspect is the security group. Yesterday's change left sg-app with only "8080 from sg-web". <b>Fix:</b> add "TCP 8080 from 10.10.5.0/24" (the reporting subnet only, least privilege) in the Terraform code, merge, and let the pipeline apply it. <b>Verify:</b> new flow log lines show ACCEPT and the report runs. <b>Document</b> the rule's purpose in the code comment and the ticket.</p>

<div class="eg"><p><b>Worked example: finding an MTU problem.</b> After the fix, one large report still hangs. Test the path with the "do not fragment" bit from a Linux host at HQ:</p></div>
<pre class="code">ping -M do -s 1472 -c 3 10.20.11.15
ping -M do -s 1300 -c 3 10.20.11.15</pre>
<pre class="out">PING 10.20.11.15 (10.20.11.15) 1472(1500) bytes of data.

--- 10.20.11.15 ping statistics ---
<span class="hl">3 packets transmitted, 0 received, 100% packet loss, time 2041ms</span>

PING 10.20.11.15 (10.20.11.15) 1300(1328) bytes of data.
1308 bytes from 10.20.11.15: icmp_seq=1 ttl=62 time=21.4 ms
1308 bytes from 10.20.11.15: icmp_seq=2 ttl=62 time=21.1 ms
1308 bytes from 10.20.11.15: icmp_seq=3 ttl=62 time=21.3 ms

--- 10.20.11.15 ping statistics ---
<span class="hl">3 packets transmitted, 3 received, 0% packet loss</span>, time 2003ms</pre>
<p>1500-byte packets cannot pass the IPsec tunnel, 1328-byte packets can. The tunnel interface on HQ-R1 was missing <code>ip tcp adjust-mss 1379</code> after a router replacement. Adding it back lets TCP sessions negotiate smaller segments.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing several things at once, so you never learn which one fixed it. Checking only the inbound direction of a stateless ACL. Fixing a cloud rule in the console while the IaC pipeline will undo it tonight. Opening 0.0.0.0/0 "to test" and forgetting it.</p></div>

<div class="exam"><p><b>Exam trap.</b> A timeout means something silently dropped the packet (filter or route); a "connection refused" means the packet arrived but nothing listens. Security groups are stateful, so if inbound is allowed the reply is too; network ACLs are stateless, so check the outbound ephemeral ports.</p></div>

<div class="scn"><h4>The new branch that could reach everything except the cloud</h4><p>Branch 13 was added through SD-WAN zero-touch provisioning with subnet 10.30.13.0/24. It reached HQ and the internet, but not the VPC. The cloud VPN gateway learned routes by BGP only from HQ-R1, and HQ-R1 advertised a list of specific branch prefixes that did not include the new one. Advertising the summary 10.30.0.0/16 from HQ fixed Branch 13 and every future branch.</p><p><b>Lesson:</b> in hybrid networks, check that routes exist in both directions; a route to the cloud is useless if the cloud has no route back.</p></div>

<div class="iv"><p class="q">"A user cannot reach an application in a cloud VPC. How do you troubleshoot?"</p><p>Strong answer: scope the problem and ask what changed. Then follow the packet: is the instance running and listening; does its security group allow the source and port; does the subnet's network ACL allow both directions including ephemeral ports; does the route table have the right routes (IGW, NAT, VPN); for hybrid users, is the tunnel up and are prefixes exchanged both ways without overlap. Use flow logs to see ACCEPT or REJECT, and ping with DF set for MTU. Fix in the IaC code, verify, and document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the packet: target, security group, network ACL, route table, hybrid path, then MTU, DNS and policy.</li>
<li>Flow logs show ACCEPT or REJECT per interface and quickly separate filtering from routing problems.</li>
<li>Timeout = silent drop; refused = arrived but no listener.</li>
<li>Hybrid issues: tunnel state, BGP prefixes in both directions, overlapping ranges, MSS/MTU.</li>
<li>Make the fix in code, verify, and document, or drift correction will undo it.</li>
</ul></div>
`,hi:`
<p>Jab ek oonchi building mein tap se paani aana band ho jaata hai, achhi plumber tap badalne se shuru nahi karti. Woh pipe ke saath chalti hai: main valve khula hai, tank bhara hai, pump chal raha hai, floor valve khula hai, kya tap khud block hai? Ek check ek samay mein, us order mein jismein paani behta hai. Cloud troubleshooting bhi aisa hi hai: <b>packet ko follow karo</b> hop by hop, aur jo bhi control use milta hai use check karo, dono directions mein.</p>

<h3>Workflow</h3>
<p>Standard CompTIA method use karo (problem identify karo, theory banao, test karo, plan karo, implement karo, verify karo, document karo) aur testing wale hisse ke liye path ko is order mein chalo:</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Cloud troubleshooting flow">
<rect x="20" y="10" width="290" height="36" rx="6" fill="#fde68a"/><text x="165" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Scope: kaun, kya, kab se, kya badla?</text>
<rect x="20" y="56" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="79" text-anchor="middle" class="svg-ink" font-size="13">2. Target up hai aur port par sun raha hai?</text>
<rect x="20" y="102" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="125" text-anchor="middle" class="svg-ink" font-size="13">3. Security group source allow karta hai?</text>
<rect x="20" y="148" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="165" y="171" text-anchor="middle" class="svg-ink" font-size="13">4. Network ACL, dono directions?</text>
<rect x="20" y="194" width="290" height="36" rx="6" fill="#bae6fd"/><text x="165" y="217" text-anchor="middle" class="svg-ink" font-size="13">5. Route tables: subnet, IGW, NAT?</text>
<rect x="20" y="240" width="290" height="36" rx="6" fill="#bae6fd"/><text x="165" y="263" text-anchor="middle" class="svg-ink" font-size="13">6. Hybrid path: tunnel, BGP, overlap?</text>
<rect x="20" y="286" width="290" height="36" rx="6" fill="#ddd6fe"/><text x="165" y="309" text-anchor="middle" class="svg-ink" font-size="13">7. MTU, DNS, SD-WAN policy, drift</text>
<line x1="165" y1="46" x2="165" y2="56" stroke="#64748b" stroke-width="2"/><line x1="165" y1="92" x2="165" y2="102" stroke="#64748b" stroke-width="2"/><line x1="165" y1="138" x2="165" y2="148" stroke="#64748b" stroke-width="2"/><line x1="165" y1="184" x2="165" y2="194" stroke="#64748b" stroke-width="2"/><line x1="165" y1="230" x2="165" y2="240" stroke="#64748b" stroke-width="2"/><line x1="165" y1="276" x2="165" y2="286" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="56" width="280" height="220" rx="8" fill="#e2e8f0"/>
<text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="13">Collect karne wale saboot</text>
<text x="355" y="108" class="svg-muted" font-size="12">flow logs: ACCEPT ya REJECT</text>
<text x="355" y="134" class="svg-muted" font-size="12">subnet ka route table</text>
<text x="355" y="160" class="svg-muted" font-size="12">show crypto ikev2 sa</text>
<text x="355" y="186" class="svg-muted" font-size="12">show ip route / BGP prefixes</text>
<text x="355" y="212" class="svg-muted" font-size="12">DF set ke saath ping, traceroute</text>
<text x="355" y="238" class="svg-muted" font-size="12">git log, terraform plan</text>
<text x="355" y="264" class="svg-muted" font-size="12">SD-WAN path SLA report</text>
</svg><p class="cap">Target se bahar ki taraf packet follow karo. Zyada tar cloud tickets steps 3 se 5 par khatam hote hain.</p></div>

<h3>Symptom se likely cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Pehle check karo</th></tr>
<tr><td>Connection timeout hota hai</td><td>Security group, network ACL, route table (silent drop)</td></tr>
<tr><td>Connection turant refused</td><td>Target par service sun nahi rahi (packet pahunch gaya)</td></tr>
<tr><td>Private VM ko updates nahi milte</td><td>NAT gateway ki taraf subnet route; NAT gateway public subnet mein</td></tr>
<tr><td>Public VM internet se unreachable</td><td>Public IP, IGW route, security group</td></tr>
<tr><td>On-premises VPC tak nahi pahunchta</td><td>Tunnel status, dono taraf BGP prefixes, route propagation, overlapping ranges</td></tr>
<tr><td>Ping chalta hai, bade transfers atak jaate hain</td><td>VPN ya VXLAN ke through MTU; MSS adjustment</td></tr>
<tr><td>IP se chalta hai, naam se nahi</td><td>DNS: private zone, cloud aur on-premises ke beech resolver forwarding</td></tr>
<tr><td>Kal theek kiya, aaj phir toota</td><td>IaC drift correction; code aur recent commits check karo</td></tr>
</table>

<h3>Walkthrough: "HQ reporting tracking API tak nahi pahunch pa raha"</h3>
<p>Ticket: aaj subah se, HQ ka reporting server (10.10.5.20) 10.20.11.15 port 8080 par tracking API se connect nahi kar pa raha. Web customers theek hain.</p>
<p><b>Scope.</b> Sirf HQ se app tier fail hai; internet path kaam karta hai. Kal ek change ne app security groups ko "saaf" kiya tha.</p>
<p><b>Hybrid path.</b> HQ-R1 par tunnel aur routes check karo:</p>
<pre class="out">HQ-R1# show crypto ikev2 sa | include READY
1         203.0.113.10/500      198.51.100.20/500     none/none            <span class="hl">READY</span>
HQ-R1# show ip route 10.20.11.15
Routing entry for 10.20.0.0/16
  Known via "bgp 65010", distance 20, metric 0
  Tag 64512, type external
  Last update from 169.254.10.1 01:12:40 ago
  Routing Descriptor Blocks:
  <span class="hl">* 169.254.10.1, from 169.254.10.1, 01:12:40 ago</span></pre>
<p>Tunnel up hai aur route seekha hua hai, isliye packet HQ se VPC ki taraf nikalta hai. Aage, <b>flow logs</b> se dekho ki VPC ne uske saath kya kiya; flow logs har network interface ke accepted aur rejected traffic ko record karte hain:</p>
<pre class="out">2 123456789012 eni-0b7c6d5e4f3a21098 10.10.5.20 10.20.11.15 51514 8080 6 3 180 1759137600 1759137660 <span class="hl">REJECT</span> OK
2 123456789012 eni-0b7c6d5e4f3a21098 10.20.1.40 10.20.11.15 40112 8080 6 12 4210 1759137600 1759137660 ACCEPT OK</pre>
<p>Fields hain version, account, interface, source, destination, source port, destination port, protocol (6 = TCP), packets, bytes, start, end, action, log status. Load balancer (10.20.1.40) ka traffic accept hota hai; HQ ka traffic app VM ke interface par <b>reject</b> hota hai. App subnet ka network ACL 10.10.0.0/16 allow karta hai, isliye bacha hua suspect security group hai. Kal ke change ne sg-app mein sirf "8080 from sg-web" chhoda tha. <b>Fix:</b> Terraform code mein "TCP 8080 from 10.10.5.0/24" jodo (sirf reporting subnet, least privilege), merge karo, aur pipeline ko apply karne do. <b>Verify:</b> naye flow log lines ACCEPT dikhati hain aur report chalti hai. Rule ka purpose code comment aur ticket mein <b>document</b> karo.</p>

<div class="eg"><p><b>Worked example: MTU problem dhoondhna.</b> Fix ke baad, ek badi report ab bhi atak jaati hai. HQ ke ek Linux host se "do not fragment" bit ke saath path test karo:</p></div>
<pre class="code">ping -M do -s 1472 -c 3 10.20.11.15
ping -M do -s 1300 -c 3 10.20.11.15</pre>
<pre class="out">PING 10.20.11.15 (10.20.11.15) 1472(1500) bytes of data.

--- 10.20.11.15 ping statistics ---
<span class="hl">3 packets transmitted, 0 received, 100% packet loss, time 2041ms</span>

PING 10.20.11.15 (10.20.11.15) 1300(1328) bytes of data.
1308 bytes from 10.20.11.15: icmp_seq=1 ttl=62 time=21.4 ms
1308 bytes from 10.20.11.15: icmp_seq=2 ttl=62 time=21.1 ms
1308 bytes from 10.20.11.15: icmp_seq=3 ttl=62 time=21.3 ms

--- 10.20.11.15 ping statistics ---
<span class="hl">3 packets transmitted, 3 received, 0% packet loss</span>, time 2003ms</pre>
<p>1500-byte packets IPsec tunnel paar nahi kar paate, 1328-byte packets kar lete hain. Router replacement ke baad HQ-R1 ke tunnel interface par <code>ip tcp adjust-mss 1379</code> missing tha. Use wapas jodne se TCP sessions chhote segments negotiate kar paate hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Ek saath kai cheezein badalna, jisse kabhi pata nahi chalta ki kisne theek kiya. Stateless ACL ki sirf inbound direction check karna. Console mein cloud rule theek karna jabki IaC pipeline aaj raat use undo kar degi. "Test karne ke liye" 0.0.0.0/0 kholna aur bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Timeout ka matlab kisi cheez ne packet chupchaap drop kiya (filter ya route); "connection refused" ka matlab packet pahuncha par koi sun nahi raha. Security groups stateful hain, isliye inbound allow hai to reply bhi; network ACLs stateless hain, isliye outbound ephemeral ports check karo.</p></div>

<div class="scn"><h4>Nayi branch jo cloud ke alawa sab tak pahunchti thi</h4><p>Branch 13 SD-WAN zero-touch provisioning se subnet 10.30.13.0/24 ke saath jodi gayi. Yeh HQ aur internet tak pahunchti thi, par VPC tak nahi. Cloud VPN gateway sirf HQ-R1 se BGP ke through routes seekhta tha, aur HQ-R1 specific branch prefixes ki ek list advertise karta tha jismein naya prefix shamil nahi tha. HQ se summary 10.30.0.0/16 advertise karne se Branch 13 aur har aane wali branch theek ho gayi.</p><p><b>Seekh:</b> hybrid networks mein check karo ki routes dono directions mein hain; cloud tak route bekaar hai agar cloud ke paas wapas aane ka route nahi.</p></div>

<div class="iv"><p class="q">"User cloud VPC ki ek application tak nahi pahunch pa raha. Kaise troubleshoot karoge?"</p><p>Strong answer: problem ka scope nikalo aur poochho kya badla. Phir packet follow karo: kya instance chal raha hai aur sun raha hai; kya uska security group source aur port allow karta hai; kya subnet ka network ACL ephemeral ports samet dono directions allow karta hai; kya route table mein sahi routes hain (IGW, NAT, VPN); hybrid users ke liye, kya tunnel up hai aur prefixes bina overlap ke dono taraf exchange ho rahe hain. ACCEPT ya REJECT dekhne ke liye flow logs, aur MTU ke liye DF set ke saath ping use karo. Fix IaC code mein karo, verify karo, aur document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet follow karo: target, security group, network ACL, route table, hybrid path, phir MTU, DNS aur policy.</li>
<li>Flow logs har interface ke liye ACCEPT ya REJECT dikhate hain aur filtering ko routing problems se jaldi alag karte hain.</li>
<li>Timeout = silent drop; refused = pahuncha par koi listener nahi.</li>
<li>Hybrid issues: tunnel state, dono directions mein BGP prefixes, overlapping ranges, MSS/MTU.</li>
<li>Fix code mein karo, verify karo, aur document karo, warna drift correction use undo kar dega.</li>
</ul></div>
`}};export{e as default};