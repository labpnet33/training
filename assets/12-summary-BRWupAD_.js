var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Think of this chapter as the laminated card a firewall engineer keeps next to the keyboard during a night shift. It does not teach anything new; it puts every tool, flag and message ID from this module on one page, so that at 3 a.m. with a P1 open you reach for the right command first time. Read it before the exam, and again before your first on-call week.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tools mapped to packet flow">
<rect x="10" y="70" width="90" height="44" rx="8" fill="#bae6fd"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text>
<rect x="115" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="160" y="97" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text>
<rect x="220" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="265" y="97" text-anchor="middle" class="svg-ink" font-size="13">Route</text>
<rect x="325" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="370" y="97" text-anchor="middle" class="svg-ink" font-size="13">ACL</text>
<rect x="430" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="13">Inspect, NAT</text>
<rect x="535" y="70" width="95" height="44" rx="8" fill="#bae6fd"/><text x="582" y="97" text-anchor="middle" class="svg-ink" font-size="13">Egress</text>
<line x1="100" y1="92" x2="115" y2="92" stroke="#64748b" stroke-width="2"/><line x1="205" y1="92" x2="220" y2="92" stroke="#64748b" stroke-width="2"/><line x1="310" y1="92" x2="325" y2="92" stroke="#64748b" stroke-width="2"/><line x1="415" y1="92" x2="430" y2="92" stroke="#64748b" stroke-width="2"/><line x1="520" y1="92" x2="535" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="55" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture in</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">packet-tracer shows every phase in between</text>
<line x1="115" y1="40" x2="520" y2="40" stroke="#64748b" stroke-width="1"/>
<text x="582" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture out</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">drops: show asp drop, capture type asp-drop, syslog 106023</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">state: show conn, show xlate, show nat, show access-list</text>
</svg><p class="cap">Each tool looks at a different part of the same packet flow.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Draw the ASA packet flow for a new connection: ingress, existing-connection check, UN-NAT, route lookup, ACL, inspection, NAT, egress.</li>
<li>Run packet-tracer for inbound and outbound flows, name the phase that drops, and read the drop reason.</li>
<li>Create a capture with <code>match</code> or an access list, read TCP handshakes in it, use <code>type asp-drop</code>, and remove it.</li>
<li>Prove NAT with captures on the inside and outside interfaces, and explain how to export a pcap for Wireshark.</li>
<li>Decode <code>show conn</code> flags (UIO, saA, U, B, f/r) and read <code>show xlate</code> entries and timeouts.</li>
<li>Scope <code>clear conn</code> and <code>clear xlate</code> to one host.</li>
<li>Read <code>show asp drop</code> with the delta method and match reasons to phases.</li>
<li>Recognise the key syslog IDs and configure buffered, trap and host logging with timestamps.</li>
<li>Check inspection with <code>show service-policy</code> and box health with CPU, memory, conn count and interface counters.</li>
<li>Work a ticket with the eight-step workflow and verify with the exact ticket flow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASP</dt><dd>Accelerated Security Path; the data path that processes packets and counts drops by reason.</dd>
<dt>Embryonic connection</dt><dd>A TCP connection whose three-way handshake has not completed.</dd>
<dt>xlate</dt><dd>An entry in the translation table that maps a real address (and port) to a mapped one.</dd>
<dt>UN-NAT</dt><dd>The early phase that translates a mapped destination back to the real address before the ACL check.</dd>
<dt>Implicit Rule</dt><dd>The invisible deny at the end of every interface ACL.</dd>
<dt>Circular buffer</dt><dd>A capture option that overwrites the oldest packets when the buffer is full.</dd>
<dt>MPF</dt><dd>Modular Policy Framework; class-map, policy-map and service-policy used for inspection.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Need</th><th>Command</th></tr>
<tr><td>Simulate a flow</td><td><code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 detailed</code></td></tr>
<tr><td>Capture real packets</td><td><code>capture CAP interface outside match tcp any host 203.0.113.3</code></td></tr>
<tr><td>Capture dropped packets</td><td><code>capture DROPS type asp-drop acl-drop</code></td></tr>
<tr><td>Keep the latest packets</td><td><code>capture CAP ... buffer 1048576 circular-buffer</code></td></tr>
<tr><td>Live connections</td><td><code>show conn address 10.0.2.10 detail</code></td></tr>
<tr><td>Translations</td><td><code>show xlate</code> · <code>show nat detail</code></td></tr>
<tr><td>Drop counters</td><td><code>show asp drop</code> · <code>clear asp drop</code></td></tr>
<tr><td>Logs</td><td><code>show logging</code> · <code>logging buffered informational</code> · <code>logging trap informational</code> · <code>logging host inside 10.0.1.50</code></td></tr>
<tr><td>Health</td><td><code>show cpu usage</code> · <code>show memory</code> · <code>show conn count</code> · <code>show service-policy</code></td></tr>
</table>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>ID</th><th>Meaning</th></tr>
<tr><td>106023</td><td>Denied by an access-group; names the ACL</td></tr>
<tr><td>106001 / 106006 / 106014</td><td>Inbound TCP / UDP / ICMP denied with no permitting rule</td></tr>
<tr><td>302013 / 302014</td><td>TCP connection built / torn down (teardown includes duration, bytes and reason)</td></tr>
<tr><td>302015 / 302016</td><td>UDP connection built / torn down</td></tr>
<tr><td>305011</td><td>Dynamic translation built</td></tr>
<tr><td>710003</td><td>Access to the ASA itself (SSH, ASDM) denied by the management allow list</td></tr>
<tr><td>313004</td><td>ICMP reply denied: no matching session</td></tr>
</table>
<ul>
<li>Captures see packets before the ACL; packet-tracer simulates and sends nothing.</li>
<li>ACLs match real addresses because UN-NAT runs first.</li>
<li>An existing connection skips the ACL; a new rule does not affect old flows until you clear them.</li>
<li>UIO = healthy TCP; saA without U = handshake never completed.</li>
<li>Severity: 0 emergencies to 7 debugging; 6 informational includes build and teardown messages.</li>
<li>ICMP is not inspected by default.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A quick self-test with the lab numbers: PARTNER 198.51.100.10 to 203.0.113.3 on TCP 443. You should now predict each tool's answer. Capture on outside: SYNs to 203.0.113.3. packet-tracer: UN-NAT to 10.0.2.10, then ACL. Syslog if denied: 106023 with dst dmz:10.0.2.10/443. <code>show conn</code> when working: flags UIO with the real address 10.0.2.10. If you can say all four before typing, you are ready.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on the job.</b> Changing config before collecting evidence; unscoped <code>clear conn</code>; captures left running; logging at debugging to the console; trusting one tool alone.</p></div>

<div class="exam"><p><b>Exam traps.</b> Questions swap packet-tracer and capture, ask which address an ACL must use after NAT, test 106023 against 106001, and expect you to know that <code>type asp-drop</code> captures what the ASA discarded.</p></div>

<div class="scn"><h4>The on-call card</h4><p>A new engineer on her first night shift received a P1: branch users could not reach an internal application through the head-office ASA. She followed the card: defined the flow, captured on ingress (packets arrived), ran packet-tracer (ALLOW), captured on egress (SYNs left, no SYN-ACK), and checked <code>show conn</code> (flags saA, bytes 0). In twelve minutes she handed the server team hard evidence that their server was not answering, and they found a stopped service.</p><p><b>Lesson:</b> a repeatable method makes a junior engineer as fast as a senior one on most tickets.</p></div>

<div class="iv"><p class="q">"If you could only use three ASA troubleshooting commands, which would you choose and why?"</p><p>A strong answer picks tools that cover different questions: <code>capture</code> for real packets and arrival, <code>packet-tracer</code> for the configured decision and drop phase, and <code>show logging</code> (or <code>show conn</code>) for what actually happened. Explain the gap each one fills, and add that <code>show asp drop</code> is the fourth you would miss most.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four instruments, one loop: capture, packet-tracer, live state, logs.</li>
<li>Know the packet flow order; it explains ACLs on real addresses and missing UN-NAT phases.</li>
<li>Memorise 106023, 302013/302014, 305011, 710003 and the conn flags UIO and saA.</li>
<li>Check inspection and box health when rules look right.</li>
<li>Clean up captures and scope every clear command.</li>
</ul></div>
`,hi:`
<p>Is chapter ko woh laminated card samjho jo firewall engineer night shift mein keyboard ke paas rakhta hai. Yeh kuch naya nahi sikhata; yeh is module ka har tool, flag aur message ID ek page par rakh deta hai, taaki raat 3 baje P1 khula ho to aap pehli baar mein sahi command uthao. Exam se pehle padho, aur apne pehle on-call week se pehle dobara.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Tools aur packet flow">
<rect x="10" y="70" width="90" height="44" rx="8" fill="#bae6fd"/><text x="55" y="97" text-anchor="middle" class="svg-ink" font-size="13">Ingress</text>
<rect x="115" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="160" y="97" text-anchor="middle" class="svg-ink" font-size="13">UN-NAT</text>
<rect x="220" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="265" y="97" text-anchor="middle" class="svg-ink" font-size="13">Route</text>
<rect x="325" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="370" y="97" text-anchor="middle" class="svg-ink" font-size="13">ACL</text>
<rect x="430" y="70" width="90" height="44" rx="8" fill="#e2e8f0"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="13">Inspect, NAT</text>
<rect x="535" y="70" width="95" height="44" rx="8" fill="#bae6fd"/><text x="582" y="97" text-anchor="middle" class="svg-ink" font-size="13">Egress</text>
<line x1="100" y1="92" x2="115" y2="92" stroke="#64748b" stroke-width="2"/><line x1="205" y1="92" x2="220" y2="92" stroke="#64748b" stroke-width="2"/><line x1="310" y1="92" x2="325" y2="92" stroke="#64748b" stroke-width="2"/><line x1="415" y1="92" x2="430" y2="92" stroke="#64748b" stroke-width="2"/><line x1="520" y1="92" x2="535" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="55" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture in</text>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">packet-tracer beech ka har phase dikhata hai</text>
<line x1="115" y1="40" x2="520" y2="40" stroke="#64748b" stroke-width="1"/>
<text x="582" y="50" text-anchor="middle" class="svg-accent" font-size="12">capture out</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">drops: show asp drop, capture type asp-drop, syslog 106023</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">state: show conn, show xlate, show nat, show access-list</text>
</svg><p class="cap">Har tool usi packet flow ke alag hisse ko dekhta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Naye connection ke liye ASA packet flow draw karo: ingress, existing-connection check, UN-NAT, route lookup, ACL, inspection, NAT, egress.</li>
<li>Inbound aur outbound flows ke liye packet-tracer chalao, drop karne wale phase ka naam batao, aur drop reason padho.</li>
<li><code>match</code> ya access list ke saath capture banao, usmein TCP handshakes padho, <code>type asp-drop</code> use karo, aur use hatao.</li>
<li>Inside aur outside interfaces par captures se NAT saabit karo, aur batao ki Wireshark ke liye pcap kaise export karte hain.</li>
<li><code>show conn</code> flags (UIO, saA, U, B, f/r) decode karo aur <code>show xlate</code> entries aur timeouts padho.</li>
<li><code>clear conn</code> aur <code>clear xlate</code> ko ek host tak scope karo.</li>
<li>Delta method se <code>show asp drop</code> padho aur reasons ko phases se match karo.</li>
<li>Key syslog IDs pehchano aur timestamps ke saath buffered, trap aur host logging configure karo.</li>
<li><code>show service-policy</code> se inspection aur CPU, memory, conn count aur interface counters se box health check karo.</li>
<li>Aath-step workflow se ticket solve karo aur exact ticket flow se verify karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASP</dt><dd>Accelerated Security Path; woh data path jo packets process karta hai aur reason ke hisaab se drops ginta hai.</dd>
<dt>Embryonic connection</dt><dd>Aisa TCP connection jiska three-way handshake poora nahi hua.</dd>
<dt>xlate</dt><dd>Translation table ki entry jo real address (aur port) ko mapped address se jodti hai.</dd>
<dt>UN-NAT</dt><dd>Shuruaati phase jo ACL check se pehle mapped destination ko wapas real address mein badalta hai.</dd>
<dt>Implicit Rule</dt><dd>Har interface ACL ke aakhir mein chhupa hua deny.</dd>
<dt>Circular buffer</dt><dd>Capture option jo buffer bharne par sabse purane packets overwrite karta hai.</dd>
<dt>MPF</dt><dd>Modular Policy Framework; inspection ke liye use hone wale class-map, policy-map aur service-policy.</dd>
</dl>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Command</th></tr>
<tr><td>Flow simulate karna</td><td><code>packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 detailed</code></td></tr>
<tr><td>Real packets capture karna</td><td><code>capture CAP interface outside match tcp any host 203.0.113.3</code></td></tr>
<tr><td>Dropped packets capture karna</td><td><code>capture DROPS type asp-drop acl-drop</code></td></tr>
<tr><td>Sabse naye packets rakhna</td><td><code>capture CAP ... buffer 1048576 circular-buffer</code></td></tr>
<tr><td>Live connections</td><td><code>show conn address 10.0.2.10 detail</code></td></tr>
<tr><td>Translations</td><td><code>show xlate</code> · <code>show nat detail</code></td></tr>
<tr><td>Drop counters</td><td><code>show asp drop</code> · <code>clear asp drop</code></td></tr>
<tr><td>Logs</td><td><code>show logging</code> · <code>logging buffered informational</code> · <code>logging trap informational</code> · <code>logging host inside 10.0.1.50</code></td></tr>
<tr><td>Health</td><td><code>show cpu usage</code> · <code>show memory</code> · <code>show conn count</code> · <code>show service-policy</code></td></tr>
</table>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>ID</th><th>Matlab</th></tr>
<tr><td>106023</td><td>Access-group se denied; ACL ka naam batata hai</td></tr>
<tr><td>106001 / 106006 / 106014</td><td>Inbound TCP / UDP / ICMP bina permit karne wali rule ke denied</td></tr>
<tr><td>302013 / 302014</td><td>TCP connection bana / toota (teardown mein duration, bytes aur reason hota hai)</td></tr>
<tr><td>302015 / 302016</td><td>UDP connection bana / toota</td></tr>
<tr><td>305011</td><td>Dynamic translation bana</td></tr>
<tr><td>710003</td><td>ASA khud tak access (SSH, ASDM) management allow list ne deny kiya</td></tr>
<tr><td>313004</td><td>ICMP reply denied: koi matching session nahi</td></tr>
</table>
<ul>
<li>Captures ACL se pehle packets dekhte hain; packet-tracer simulate karta hai aur kuch nahi bhejta.</li>
<li>ACLs real addresses match karti hain kyunki UN-NAT pehle chalta hai.</li>
<li>Existing connection ACL skip karta hai; nayi rule purane flows par tab tak asar nahi karti jab tak aap unhe clear na karo.</li>
<li>UIO = healthy TCP; U ke bina saA = handshake kabhi poora nahi hua.</li>
<li>Severity: 0 emergencies se 7 debugging tak; 6 informational mein build aur teardown messages aate hain.</li>
<li>ICMP default mein inspect nahi hota.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab numbers ke saath ek chhota self-test: PARTNER 198.51.100.10 se 203.0.113.3 tak TCP 443. Ab aapko har tool ka jawab pehle se predict karna aana chahiye. Outside par capture: 203.0.113.3 ki taraf SYNs. packet-tracer: 10.0.2.10 tak UN-NAT, phir ACL. Deny hone par syslog: dst dmz:10.0.2.10/443 ke saath 106023. Chalne par <code>show conn</code>: real address 10.0.2.10 ke saath flags UIO. Agar type karne se pehle aap chaaron bata sakte ho, to aap ready ho.</p></div>

<div class="warn"><p><b>Job par bachne wali common galtiyan.</b> Evidence collect karne se pehle config badalna; unscoped <code>clear conn</code>; captures chalte chhodna; console par debugging level logging; sirf ek tool par bharosa karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawaal packet-tracer aur capture ko ulat dete hain, poochte hain ki NAT ke baad ACL ko kaunsa address use karna chahiye, 106023 ko 106001 ke against test karte hain, aur expect karte hain ki aap jaano ki <code>type asp-drop</code> woh capture karta hai jo ASA ne discard kiya.</p></div>

<div class="scn"><h4>On-call card</h4><p>Ek nayi engineer ko apni pehli night shift mein P1 mila: branch users head-office ASA ke through ek internal application tak nahi pahunch pa rahe the. Usne card follow kiya: flow define kiya, ingress par capture kiya (packets aaye), packet-tracer chalaya (ALLOW), egress par capture kiya (SYNs nikle, koi SYN-ACK nahi), aur <code>show conn</code> check kiya (flags saA, bytes 0). Baarah minute mein usne server team ko pakka saboot de diya ki unka server jawab nahi de raha, aur unhe ek ruki hui service mili.</p><p><b>Seekh:</b> repeatable method zyaadatar tickets par ek junior engineer ko senior jitna tez bana deta hai.</p></div>

<div class="iv"><p class="q">"Agar aap sirf teen ASA troubleshooting commands use kar sakte, to kaunse chunoge aur kyun?"</p><p>Strong answer aise tools chunta hai jo alag sawaal cover karein: real packets aur arrival ke liye <code>capture</code>, configured decision aur drop phase ke liye <code>packet-tracer</code>, aur asal mein kya hua uske liye <code>show logging</code> (ya <code>show conn</code>). Har ek kaunsa gap bharta hai woh samjhao, aur jodo ki chautha jo sabse zyada miss karoge woh <code>show asp drop</code> hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar instruments, ek loop: capture, packet-tracer, live state, logs.</li>
<li>Packet flow ka order jaano; yahi real addresses par ACLs aur gayab UN-NAT phases samjhata hai.</li>
<li>106023, 302013/302014, 305011, 710003 aur conn flags UIO aur saA yaad karo.</li>
<li>Jab rules sahi dikhein to inspection aur box health check karo.</li>
<li>Captures saaf karo aur har clear command scope karo.</li>
</ul></div>
`}};export{e as default};