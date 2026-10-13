var e={id:`issues-pathtrace`,h:{en:`Issues, Path Trace, sensors and AI analytics`,hi:`Issues, Path Trace, sensors aur AI analytics`},body:{en:`
<p>A good car dashboard does not just show a red light; it says "tyre pressure low, front left" and the manual says what to do. And if you are lost, the satnav replays the route you drove. Catalyst Center gives you both: <b>issues</b> that name the fault and suggest the fix, and <b>Path Trace</b> that replays the exact route a packet takes through the network.</p>

<h3>Issues and suggested actions</h3>
<p>When telemetry shows a problem, Assurance raises an <b>issue</b>. Each issue has:</p>
<ul><li>A <b>priority</b>: <b>P1</b> critical (outage or major impact, act now), <b>P2</b> major, <b>P3</b> minor, <b>P4</b> low or informational.</li>
<li>A <b>category</b> (availability, connectivity, routing, device, client onboarding...), a title and a description with the likely cause.</li>
<li>The <b>impacted</b> devices and clients, and when it was first seen.</li>
<li><b>Suggested actions</b>: an ordered runbook. In the real product many steps have a <b>Run</b> button that executes the show commands on the device and displays the output right in the issue.</li></ul>
<p>Issues open and resolve automatically as conditions change; you can also resolve or ignore them manually, and tune which issue types are enabled and their priorities. The <b>event timeline</b> (built from device syslog plus the controller's own events) shows what happened in order.</p>

<pre class="code">CTRL&gt; center issues</pre>
<pre class="out">#  ID     Pri  Category      Device  Issue                                                Age
-  -----  ---  ------------  ------  ---------------------------------------------------  ---
1  #2B80  P1   Routing       DSW1    OSPF adjacency down on Gi0/3 toward R1               6s
2  #3F3D  P1   Client        PC1     PC1 cannot reach its gateway 10.10.10.1              44s
<span class="hl">3  #E462  P2   Connectivity  ASW1    Interface Gi0/3 is err-disabled (psecure-violation)  6s</span>
4  #6A67  P3   Client        PC2     PC2 cannot reach DNS server 172.16.50.10             44s
5  #05F0  P4   Device        ASW1    No NTP source on ASW1                                6s</pre>
<pre class="code">CTRL&gt; center issues #2B80</pre>
<pre class="out">Issue #2B80  [P1]  Routing
  OSPF adjacency down on Gi0/3 toward R1
Description:
  OSPF is enabled on DSW1 GigabitEthernet0/3 and a neighbour (R1 10.0.0.1) is on the segment, but no FULL
  adjacency exists. <span class="hl">Likely cause: area mismatch: DSW1 uses area 0, hellos from R1 carry area 1.</span>
Impacted: DSW1, R1
Suggested actions:
  1. Run "show ip ospf neighbor" and "show ip ospf interface GigabitEthernet0/3" on both routers.
  2. Compare area ID, subnet/mask, hello/dead timers, authentication and network type.
  3. Correct the mismatched setting on the wrong side (router ospf → network … area …).</pre>
<p>In the lab GUI click any issue on the <b>Issues</b> page (filter chips All, P1–P4) to open a drawer with <b>Description</b>, <b>Impacted</b>, and numbered <b>Suggested actions</b>; client issues also offer <b>Path Trace from this client</b>. Resolved issues move to <b>Recently resolved</b>.</p>

<h3>Path Trace</h3>
<p>Path Trace takes a <b>source</b> and <b>destination</b> (IP or device), optionally a <b>protocol and port</b>, and shows every hop in both directions, including Layer-2 switches, with ingress and egress interfaces. Catalyst Center computes the path from the forwarding state it has collected (routing tables, ARP/MAC tables, ACLs), so it does not depend on a user reproducing the fault. Options add <b>interface, QoS, device and performance statistics</b> and an <b>ACL trace</b> that marks which ACL permits or denies the flow on each hop.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Path Trace with a drop at R1">
<rect x="10" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="55" y="88" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="135" y="60" width="100" height="46" rx="8" fill="#bae6fd"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">ASW2</text><text x="185" y="97" text-anchor="middle" class="svg-muted" font-size="12">L2 switch</text>
<rect x="270" y="60" width="100" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">in Vl20</text>
<rect x="405" y="60" width="100" height="46" rx="8" fill="#fed7aa"/><text x="455" y="80" text-anchor="middle" class="svg-ink" font-size="13">R1  X</text><text x="455" y="97" text-anchor="middle" class="svg-muted" font-size="12">WAN-IN in</text>
<rect x="540" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="585" y="88" text-anchor="middle" class="svg-muted" font-size="13">SRV</text>
<line x1="100" y1="83" x2="135" y2="83" stroke="#64748b" stroke-width="2"/><line x1="235" y1="83" x2="270" y2="83" stroke="#64748b" stroke-width="2"/><line x1="370" y1="83" x2="405" y2="83" stroke="#64748b" stroke-width="2"/><line x1="505" y1="83" x2="540" y2="83" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">TCP 80: dropped at R1 Gi0/0 inbound. ICMP: completes.</text>
</svg><p class="cap">The same pair of hosts can pass with ICMP and fail with TCP 80. Always trace the real application port.</p></div>

<p>In the lab, <b>Path Trace</b> has <b>Source</b> and <b>Destination</b> drop-downs, a <b>Protocol</b> switch (ICMP, TCP, UDP), a <b>Port</b> box and <b>Start trace</b>. Results show a COMPLETED or FAILED banner, the <b>Forward path</b> and <b>Return path</b> chains, and a <b>History</b> of earlier traces.</p>
<pre class="code">CTRL&gt; center pathtrace PC2 SRV tcp 80</pre>
<pre class="out">Path trace 2: PC2 (10.20.20.22) -&gt; SRV (172.16.50.10)  protocol TCP port 80
Forward path:
   1  PC2       pc         out eth0
   2  ASW2      L2 switch  in Gi0/3, out Gi0/0
   3  DSW1      l3switch   in Vl20 (Gi0/2), out Gi0/3
   4  R1        router     in Gi0/0   X DROPPED: Denied by access list WAN-IN (in on Gi0/0)
Result: FAILED
<span class="hl">Break point: R1 - Denied by access list WAN-IN (in on Gi0/0)</span></pre>
<p>Drop reasons the lab reports include: denied by an ACL (name and direction), no route to the destination, Layer-2 path broken (err-disabled or down port), and TTL expiry. A trace to a closed port can complete at the network layer but report the service as refused: the network is fine, the server is not listening.</p>

<h3>Sensors, capture and AI (concept level)</h3>
<ul><li><b>Sensor tests</b> — dedicated wireless sensors, or APs switched to sensor mode, behave like clients on a schedule: associate to an SSID, authenticate, get DHCP, resolve DNS, reach a web or file server, run a speed test. You find problems before users do.</li>
<li><b>Intelligent Capture</b> — on-demand packet and RF capture for a specific wireless client, taken by the AP, viewable in the controller.</li>
<li><b>AI Network Analytics</b> — an optional cloud service that learns <b>dynamic baselines</b> for your network (normal onboarding times, throughput per AP), raises <b>AI-driven issues</b> when behaviour leaves the baseline, and offers peer comparison and trend insights. Only anonymised telemetry leaves the site.</li>
<li><b>Machine reasoning</b> — built-in workflows that run a sequence of checks automatically to find a root cause (for example, why a port is not forwarding).</li></ul>

<div class="eg"><p><b>Worked example: layering the evidence.</b> Ticket: "PC1 offline". Issue #3F3D (P1 Client) says PC1 cannot reach 10.10.10.1 behind ASW1 Gi0/3. Issue #E462 (P2) says ASW1 Gi0/3 is err-disabled for psecure-violation. A Path Trace PC1 → SRV stops at ASW1 with "Layer-2 path broken: port Gi0/3 is err-disabled". Three views, one root cause, and you have not typed a single command on ASW1 yet.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing P4 issues first because they are easy; always go P1 → P2 downwards and look for one root cause behind several issues. Tracing with ICMP only. Trusting a trace for a device that is not in the inventory: the controller cannot see forwarding state it does not collect.</p></div>
<div class="exam"><p><b>Exam traps.</b> P1 is the highest priority. Path Trace shows L2 and L3 hops, both directions, and can include ACL trace and statistics. Sensor tests are proactive synthetic tests; AI Network Analytics builds baselines in the cloud.</p></div>

<div class="scn"><h4>Three issues, one cable</h4><p>A branch showed a P1 "device unreachable" for an access switch, a P1 client issue for twelve phones and a P2 "interface down" on the distribution switch. A junior engineer opened three tickets. The senior looked at timestamps: all three started within the same second, and the distribution port was the uplink. One patch cable had been pulled during a clean-up. Reconnecting it resolved all three issues automatically.</p><p><b>Lesson:</b> correlate by time and topology; many issues often share one root cause.</p></div>

<div class="iv"><p class="q">"Users say an application is slow or failing but the network looks healthy. How do you use Catalyst Center?"</p><p>Check client health and Client 360 for the affected users (onboarding, gateway, DNS). Check application health for that app. Run Path Trace from the client to the server with the real protocol and port, with ACL trace and statistics enabled, to see drops, a wrong path or congested interfaces. Then look at issues and the event timeline around the reported time. Mention that ICMP success proves little for a TCP application.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Issues carry priority P1–P4, category, impact, likely cause and suggested actions.</li>
<li>Work from P1 down and correlate issues by time and topology to one root cause.</li>
<li>Path Trace shows every L2/L3 hop both ways and names the drop point and reason.</li>
<li>Trace with the application's real protocol and port, not only ICMP.</li>
<li>Sensor tests, Intelligent Capture and AI baselines find problems before users call.</li>
</ul></div>
`,hi:`
<p>Accha car dashboard sirf laal light nahi dikhata; batata hai "tyre pressure kam, aage left" aur manual batata hai kya karna hai. Aur agar aap raasta bhatak jao, satnav aapka chala hua route replay karta hai. Catalyst Center dono deta hai: <b>issues</b> jo fault ka naam lete hain aur fix suggest karte hain, aur <b>Path Trace</b> jo exactly replay karta hai ki packet network mein kaunse route se jaata hai.</p>

<h3>Issues aur suggested actions</h3>
<p>Jab telemetry problem dikhati hai, Assurance ek <b>issue</b> raise karta hai. Har issue mein hota hai:</p>
<ul><li>Ek <b>priority</b>: <b>P1</b> critical (outage ya bada impact, abhi action lo), <b>P2</b> major, <b>P3</b> minor, <b>P4</b> low ya informational.</li>
<li>Ek <b>category</b> (availability, connectivity, routing, device, client onboarding...), title aur likely cause ke saath description.</li>
<li><b>Impacted</b> devices aur clients, aur pehli baar kab dikha.</li>
<li><b>Suggested actions</b>: ek ordered runbook. Real product mein kai steps par <b>Run</b> button hota hai jo device par show commands chala kar output issue ke andar hi dikhata hai.</li></ul>
<p>Conditions badalne par issues automatically open aur resolve hote hain; aap unhe manually resolve ya ignore bhi kar sakte ho, aur tune kar sakte ho ki kaunse issue types enabled hain aur unki priorities kya hain. <b>Event timeline</b> (device syslog plus controller ke apne events se bani) dikhati hai ki kya kis order mein hua.</p>

<pre class="code">CTRL&gt; center issues</pre>
<pre class="out">#  ID     Pri  Category      Device  Issue                                                Age
-  -----  ---  ------------  ------  ---------------------------------------------------  ---
1  #2B80  P1   Routing       DSW1    OSPF adjacency down on Gi0/3 toward R1               6s
2  #3F3D  P1   Client        PC1     PC1 cannot reach its gateway 10.10.10.1              44s
<span class="hl">3  #E462  P2   Connectivity  ASW1    Interface Gi0/3 is err-disabled (psecure-violation)  6s</span>
4  #6A67  P3   Client        PC2     PC2 cannot reach DNS server 172.16.50.10             44s
5  #05F0  P4   Device        ASW1    No NTP source on ASW1                                6s</pre>
<pre class="code">CTRL&gt; center issues #2B80</pre>
<pre class="out">Issue #2B80  [P1]  Routing
  OSPF adjacency down on Gi0/3 toward R1
Description:
  OSPF is enabled on DSW1 GigabitEthernet0/3 and a neighbour (R1 10.0.0.1) is on the segment, but no FULL
  adjacency exists. <span class="hl">Likely cause: area mismatch: DSW1 uses area 0, hellos from R1 carry area 1.</span>
Impacted: DSW1, R1
Suggested actions:
  1. Run "show ip ospf neighbor" and "show ip ospf interface GigabitEthernet0/3" on both routers.
  2. Compare area ID, subnet/mask, hello/dead timers, authentication and network type.
  3. Correct the mismatched setting on the wrong side (router ospf → network … area …).</pre>
<p>Lab GUI mein <b>Issues</b> page par (filter chips All, P1–P4) kisi bhi issue par click karo to ek drawer khulta hai jismein <b>Description</b>, <b>Impacted</b>, aur numbered <b>Suggested actions</b> hote hain; client issues <b>Path Trace from this client</b> bhi dete hain. Resolve hue issues <b>Recently resolved</b> mein chale jaate hain.</p>

<h3>Path Trace</h3>
<p>Path Trace ek <b>source</b> aur <b>destination</b> (IP ya device), optionally <b>protocol aur port</b>, leta hai aur dono directions mein har hop dikhata hai, Layer-2 switches samet, ingress aur egress interfaces ke saath. Catalyst Center path apne collect kiye forwarding state (routing tables, ARP/MAC tables, ACLs) se compute karta hai, isliye yeh user ke fault reproduce karne par depend nahi karta. Options <b>interface, QoS, device aur performance statistics</b> aur ek <b>ACL trace</b> jodte hain jo har hop par mark karta hai ki kaunsa ACL flow ko permit ya deny karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="R1 par drop wala Path Trace">
<rect x="10" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="55" y="88" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="135" y="60" width="100" height="46" rx="8" fill="#bae6fd"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">ASW2</text><text x="185" y="97" text-anchor="middle" class="svg-muted" font-size="12">L2 switch</text>
<rect x="270" y="60" width="100" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="12">in Vl20</text>
<rect x="405" y="60" width="100" height="46" rx="8" fill="#fed7aa"/><text x="455" y="80" text-anchor="middle" class="svg-ink" font-size="13">R1  X</text><text x="455" y="97" text-anchor="middle" class="svg-muted" font-size="12">WAN-IN in</text>
<rect x="540" y="60" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="585" y="88" text-anchor="middle" class="svg-muted" font-size="13">SRV</text>
<line x1="100" y1="83" x2="135" y2="83" stroke="#64748b" stroke-width="2"/><line x1="235" y1="83" x2="270" y2="83" stroke="#64748b" stroke-width="2"/><line x1="370" y1="83" x2="405" y2="83" stroke="#64748b" stroke-width="2"/><line x1="505" y1="83" x2="540" y2="83" stroke="#64748b" stroke-dasharray="4 3"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">TCP 80: R1 Gi0/0 inbound par drop. ICMP: complete.</text>
</svg><p class="cap">Wahi do hosts ICMP ke saath pass aur TCP 80 ke saath fail ho sakte hain. Hamesha asli application port trace karo.</p></div>

<p>Lab mein <b>Path Trace</b> mein <b>Source</b> aur <b>Destination</b> drop-downs, ek <b>Protocol</b> switch (ICMP, TCP, UDP), ek <b>Port</b> box aur <b>Start trace</b> hai. Results COMPLETED ya FAILED banner, <b>Forward path</b> aur <b>Return path</b> chains, aur pichhle traces ki <b>History</b> dikhate hain.</p>
<pre class="code">CTRL&gt; center pathtrace PC2 SRV tcp 80</pre>
<pre class="out">Path trace 2: PC2 (10.20.20.22) -&gt; SRV (172.16.50.10)  protocol TCP port 80
Forward path:
   1  PC2       pc         out eth0
   2  ASW2      L2 switch  in Gi0/3, out Gi0/0
   3  DSW1      l3switch   in Vl20 (Gi0/2), out Gi0/3
   4  R1        router     in Gi0/0   X DROPPED: Denied by access list WAN-IN (in on Gi0/0)
Result: FAILED
<span class="hl">Break point: R1 - Denied by access list WAN-IN (in on Gi0/0)</span></pre>
<p>Lab jo drop reasons report karta hai unmein hain: ACL se denied (naam aur direction), destination ka route nahi, Layer-2 path broken (err-disabled ya down port), aur TTL expiry. Band port ka trace network layer par complete ho sakta hai lekin service ko refused report karta hai: network theek hai, server sun hi nahi raha.</p>

<h3>Sensors, capture aur AI (concept level)</h3>
<ul><li><b>Sensor tests</b> — dedicated wireless sensors, ya sensor mode mein switch kiye APs, schedule par clients jaisa behave karte hain: SSID se associate, authenticate, DHCP lena, DNS resolve, web ya file server tak pahunchna, speed test. Aap users se pehle problems pakad lete ho.</li>
<li><b>Intelligent Capture</b> — kisi specific wireless client ke liye on-demand packet aur RF capture, AP leta hai, controller mein dekh sakte ho.</li>
<li><b>AI Network Analytics</b> — ek optional cloud service jo aapke network ke <b>dynamic baselines</b> seekhti hai (normal onboarding times, har AP ka throughput), behaviour baseline se bahar jaaye to <b>AI-driven issues</b> raise karti hai, aur peer comparison aur trend insights deti hai. Site se sirf anonymised telemetry bahar jaati hai.</li>
<li><b>Machine reasoning</b> — built-in workflows jo root cause dhoondhne ke liye checks ka sequence automatically chalate hain (jaise port forward kyun nahi kar raha).</li></ul>

<div class="eg"><p><b>Worked example: saboot ki parten.</b> Ticket: "PC1 offline". Issue #3F3D (P1 Client) kehta hai PC1 ASW1 Gi0/3 ke peeche 10.10.10.1 tak nahi pahunch pa raha. Issue #E462 (P2) kehta hai ASW1 Gi0/3 psecure-violation ki wajah se err-disabled hai. PC1 → SRV Path Trace ASW1 par "Layer-2 path broken: port Gi0/3 is err-disabled" ke saath rukta hai. Teen views, ek root cause, aur aapne abhi tak ASW1 par ek bhi command type nahi ki.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> P4 issues pehle fix karna kyunki woh aasaan hain; hamesha P1 → P2 neeche ki taraf jao aur kai issues ke peeche ek root cause dhoondho. Sirf ICMP se trace karna. Aise device ke trace par bharosa karna jo inventory mein nahi hai: controller woh forwarding state nahi dekh sakta jo woh collect hi nahi karta.</p></div>
<div class="exam"><p><b>Exam traps.</b> P1 sabse oonchi priority hai. Path Trace L2 aur L3 hops, dono directions dikhata hai, aur ACL trace aur statistics include kar sakta hai. Sensor tests proactive synthetic tests hain; AI Network Analytics cloud mein baselines banata hai.</p></div>

<div class="scn"><h4>Teen issues, ek cable</h4><p>Ek branch mein access switch ke liye P1 "device unreachable", baarah phones ke liye P1 client issue aur distribution switch par P2 "interface down" dikha. Ek junior engineer ne teen tickets khole. Senior ne timestamps dekhe: teeno ek hi second mein shuru hue the, aur distribution port uplink tha. Safai ke dauraan ek patch cable nikal gaya tha. Use wapas lagane se teeno issues automatically resolve ho gaye.</p><p><b>Lesson:</b> time aur topology se correlate karo; aksar kai issues ka ek hi root cause hota hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain application slow hai ya fail ho rahi hai lekin network healthy dikhta hai. Catalyst Center kaise use karoge?"</p><p>Affected users ke liye client health aur Client 360 check karo (onboarding, gateway, DNS). Us app ki application health check karo. Client se server tak asli protocol aur port ke saath Path Trace chalao, ACL trace aur statistics enable karke, taaki drops, galat path ya congested interfaces dikhein. Phir reported time ke aas-paas issues aur event timeline dekho. Batao ki TCP application ke liye ICMP success bahut kam prove karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Issues mein priority P1–P4, category, impact, likely cause aur suggested actions hote hain.</li>
<li>P1 se neeche kaam karo aur issues ko time aur topology se ek root cause tak correlate karo.</li>
<li>Path Trace har L2/L3 hop dono taraf dikhata hai aur drop point aur reason batata hai.</li>
<li>Application ke asli protocol aur port se trace karo, sirf ICMP se nahi.</li>
<li>Sensor tests, Intelligent Capture aur AI baselines users ke call karne se pehle problems dhoondhte hain.</li>
</ul></div>
`}};export{e as default};