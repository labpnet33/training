var e={id:`tshoot`,h:{en:`packet-tracer and a troubleshooting workflow: walking both labs`,hi:`packet-tracer aur troubleshooting workflow: dono labs walk karna`},body:{en:`
<p>A good mechanic does not guess; he puts the car on the diagnostic machine, which tests each system in order and prints where it failed. The ASA has that machine built in: <code>packet-tracer</code>. It injects a <b>simulated</b> packet into an interface and shows every processing step from chapter 8 as a numbered <b>phase</b>, each with ALLOW or DROP, the exact configuration line involved and a final verdict. The deep troubleshooting module comes later; this chapter gives you the basic tool and a workflow, then walks both labs of this module.</p>

<h3>packet-tracer syntax</h3>
<pre class="code"><span class="c">! packet-tracer input &lt;ingress nameif&gt; &lt;protocol&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt; [detailed]</span>
packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80
<span class="c">! for ICMP give type and code instead of ports (8 0 = echo request)</span>
packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8</pre>
<p>Always use the <b>real</b> source address and the interface where the packet <b>enters</b> the ASA. The source port can be any high number. packet-tracer simulates one direction only, the first packet of a flow; it does not show what happens to replies.</p>

<h3>A five-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Troubleshooting workflow">
<rect x="5" y="30" width="116" height="50" rx="8" fill="#e2e8f0"/><text x="63" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Interface</text><text x="63" y="70" text-anchor="middle" class="svg-muted" font-size="11">show nameif</text>
<rect x="131" y="30" width="116" height="50" rx="8" fill="#bae6fd"/><text x="189" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Route</text><text x="189" y="70" text-anchor="middle" class="svg-muted" font-size="11">show route</text>
<rect x="257" y="30" width="116" height="50" rx="8" fill="#fde68a"/><text x="315" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="315" y="70" text-anchor="middle" class="svg-muted" font-size="11">levels / ACL</text>
<rect x="383" y="30" width="116" height="50" rx="8" fill="#bbf7d0"/><text x="441" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 NAT</text><text x="441" y="70" text-anchor="middle" class="svg-muted" font-size="11">show nat</text>
<rect x="509" y="30" width="126" height="50" rx="8" fill="#ddd6fe"/><text x="572" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Inspect, state</text><text x="572" y="70" text-anchor="middle" class="svg-muted" font-size="11">conn, logging</text>
</svg><p class="cap">Work in the same order the ASA processes a packet; packet-tracer covers steps 2 to 5 in one command.</p></div>
<ol>
<li><b>Interface</b>: is it named, with the right level, address and up/up? (<code>show nameif</code>, <code>show interface ip brief</code>)</li>
<li><b>Route</b>: does the ASA know the way to the destination and back? (<code>show route</code>)</li>
<li><b>Policy</b>: do security levels or an ACL permit the first packet?</li>
<li><b>NAT</b>: will the reply find its way back? (<code>show nat</code>, <code>show xlate</code>)</li>
<li><b>Inspection and state</b>: is the protocol inspected where needed, and does the flow appear in <code>show conn</code> and <code>show logging</code>?</li>
</ol>

<h3>Walkthrough 1: from factory default to a working internet edge</h3>
<table class="cmp"><tr><th>Task</th><th>What you configure</th><th>Proof</th></tr>
<tr><td>1 Interfaces</td><td>Gi0/0 <code>nameif outside</code> 203.0.113.2/29, Gi0/1 <code>nameif inside</code> 10.0.1.1/24, both <code>no shutdown</code></td><td><code>show nameif</code>: 0 and 100; PC1 pings 10.0.1.1</td></tr>
<tr><td>2 Default route</td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td><td><code>show route</code> S*; the ASA pings 8.8.8.8</td></tr>
<tr><td>3 PAT</td><td><code>object network INSIDE-NET</code>, <code>subnet 10.0.1.0 255.255.255.0</code>, <code>nat (inside,outside) dynamic interface</code></td><td>PC1 <code>curl 8.8.8.8</code> works; <code>show xlate</code> flags ri</td></tr>
<tr><td>4 Diagnose ping</td><td>nothing yet: run <code>packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8</code></td><td>request allowed, but no INSPECT phase for ICMP; syslog 106014 for the replies</td></tr>
<tr><td>5 Fix and save</td><td><code>inspect icmp</code> in <code>global_policy</code>, then <code>write memory</code></td><td>PC1 pings 8.8.8.8; <code>[OK]</code></td></tr>
</table>
<p>In task 4 the tracer says the echo request is allowed end to end, which proves routing, policy and NAT. Read the phases carefully: none of them is an INSPECT phase for ICMP. After the fix, a new phase appears:</p>
<pre class="out">Phase: 5
<span class="hl">Type: INSPECT</span>
Subtype: np-inspect
Result: ALLOW
Config:
class-map inspection_default
 match default-inspection-traffic
policy-map global_policy
 class inspection_default
<span class="hl">  inspect icmp</span>
service-policy global_policy global</pre>
<p>So the answer to "which feature is missing for the echo replies?" is <b>ICMP inspection</b>.</p>

<h3>Walkthrough 2: ticket INC-7702, the DMZ server cannot download updates</h3>
<p>WEB (10.0.2.10) in the DMZ cannot reach 8.8.8.8; inside users are fine. Start with the tracer from the DMZ side:</p>
<pre class="out">NK-ASA# packet-tracer input dmz tcp 10.0.2.10 40000 8.8.8.8 80
Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
found next-hop 203.0.113.1 using egress ifc  outside

Phase: 2
<span class="hl">Type: ACCESS-LIST</span>
Subtype:
<span class="hl">Result: DROP</span>
Config:
<span class="hl">Implicit Rule</span>

Result:
input-interface: dmz
output-interface: outside
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p>Dropped at the <b>ACCESS-LIST</b> phase by the <b>implicit rule</b>, and there is no ACL on the DMZ. So the security levels decided. <code>show nameif</code> shows dmz at level <b>0</b>, the same as outside: equal levels are denied. <b>Fault 1.</b> Fix: <code>interface GigabitEthernet0/2</code>, <code>security-level 50</code>. Do not use <code>same-security-traffic permit inter-interface</code>; it would also let the internet start connections into the DMZ. Re-run the tracer: Action allow.</p>
<p>But WEB still gets no answer. The tracer now allows the flow, yet it shows <b>no NAT phase</b>, and <code>show nat</code> lists only INSIDE-NET. WEB's packets leave with source 10.0.2.10, and the ISP cannot route replies to a private address. <b>Fault 2.</b> Fix: <code>object network DMZ-NET</code>, <code>subnet 10.0.2.0 255.255.255.0</code>, <code>nat (dmz,outside) dynamic interface</code>. Now WEB downloads from 8.8.8.8, and 8.8.8.8 sees the source 203.0.113.2.</p>
<p>Finally, prove you did not open the inside: WEB pings 10.0.1.10 and fails (dmz 50 to inside 100 is lower to higher), while PC1 still reaches WEB (100 to 50).</p>

<div class="eg"><p><b>Worked example.</b> Why two faults? Fixing only the level produced a clear change in the tracer (DROP became ALLOW), but the user symptom stayed the same. That is the moment to remember that packet-tracer checks the ASA's decision, not the internet's return path. Each fix must be confirmed with a real test from the host.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using the <b>mapped</b> address or the wrong ingress interface in packet-tracer. Stopping at the first ALLOW without testing from the host. Fixing a DMZ ticket with <code>same-security-traffic</code> or a <code>permit ip any any</code> ACL. Forgetting <code>write memory</code> after a ticket.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Implicit Rule" in an ACCESS-LIST phase with no ACL configured means the security-level logic denied the flow. "Implicit Rule" with an ACL configured means no line in your ACL matched, so the implicit deny at its end did.</p></div>

<div class="scn"><h4>The ten-minute answer to a two-day ticket</h4><p>A partner's integration server in a DMZ had failed to reach an update service for two days while three teams blamed each other. A newly hired engineer ran one packet-tracer from the DMZ interface with the server's real address. Phase ACCESS-LIST, Implicit Rule, DROP. <code>show nameif</code> revealed the DMZ subinterface had been created with the default level 0. One command fixed the level, a second added the missing PAT rule, and the server updated.</p><p><b>Lesson:</b> packet-tracer turns opinions into evidence. Run it before the meeting.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot 'a host behind the ASA cannot reach the internet'."</p><p>Strong answer: check the interface (nameif, level, up/up), the route both ways, then run <code>packet-tracer input &lt;ingress&gt; tcp &lt;real src&gt; &lt;port&gt; &lt;dst&gt; &lt;port&gt;</code> and read the phases: ROUTE-LOOKUP, ACCESS-LIST, NAT, INSPECT, and the drop reason. Confirm NAT with <code>show nat</code> and <code>show xlate</code>, check <code>show conn</code> and syslog, then test from the host. Mention that packet-tracer simulates only the first packet in one direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>packet-tracer input &lt;nameif&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt;</code> simulates the first packet.</li>
<li>Workflow: interface, route, policy, NAT, inspection and state.</li>
<li>ICMP ping issue: tracer allows the request, but no INSPECT phase for ICMP; add <code>inspect icmp</code>.</li>
<li>DMZ ticket: level 0 equals outside (implicit rule drop), and no DMZ PAT rule.</li>
<li>Always confirm with a real test, and prove you did not open more than intended.</li>
</ul></div>
`,hi:`
<p>Achha mechanic guess nahi karta; woh car ko diagnostic machine par lagata hai, jo har system ko order mein test karti hai aur print karti hai ki kahan fail hua. ASA mein woh machine built-in hai: <code>packet-tracer</code>. Yeh ek interface mein <b>simulated</b> packet daalta hai aur chapter 8 ka har processing step ek numbered <b>phase</b> ki tarah dikhata hai, har ek ALLOW ya DROP ke saath, involved exact configuration line aur aakhri verdict ke saath. Deep troubleshooting module baad mein aata hai; yeh chapter aapko basic tool aur ek workflow deta hai, phir is module ke dono labs walk karta hai.</p>

<h3>packet-tracer syntax</h3>
<pre class="code"><span class="c">! packet-tracer input &lt;ingress nameif&gt; &lt;protocol&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt; [detailed]</span>
packet-tracer input inside tcp 10.0.1.10 40000 8.8.8.8 80
<span class="c">! ICMP ke liye ports ki jagah type aur code do (8 0 = echo request)</span>
packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8</pre>
<p>Hamesha <b>real</b> source address aur woh interface use karo jahan packet ASA mein <b>enter</b> karta hai. Source port koi bhi high number ho sakta hai. packet-tracer sirf ek direction simulate karta hai, flow ka pehla packet; yeh nahi dikhata ki replies ke saath kya hota hai.</p>

<h3>Paanch-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Troubleshooting workflow">
<rect x="5" y="30" width="116" height="50" rx="8" fill="#e2e8f0"/><text x="63" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Interface</text><text x="63" y="70" text-anchor="middle" class="svg-muted" font-size="11">show nameif</text>
<rect x="131" y="30" width="116" height="50" rx="8" fill="#bae6fd"/><text x="189" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 Route</text><text x="189" y="70" text-anchor="middle" class="svg-muted" font-size="11">show route</text>
<rect x="257" y="30" width="116" height="50" rx="8" fill="#fde68a"/><text x="315" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Policy</text><text x="315" y="70" text-anchor="middle" class="svg-muted" font-size="11">levels / ACL</text>
<rect x="383" y="30" width="116" height="50" rx="8" fill="#bbf7d0"/><text x="441" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 NAT</text><text x="441" y="70" text-anchor="middle" class="svg-muted" font-size="11">show nat</text>
<rect x="509" y="30" width="126" height="50" rx="8" fill="#ddd6fe"/><text x="572" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Inspect, state</text><text x="572" y="70" text-anchor="middle" class="svg-muted" font-size="11">conn, logging</text>
</svg><p class="cap">Usi order mein kaam karo jismein ASA packet process karta hai; packet-tracer steps 2 se 5 ek command mein cover karta hai.</p></div>
<ol>
<li><b>Interface</b>: kya iska naam hai, sahi level, address aur up/up? (<code>show nameif</code>, <code>show interface ip brief</code>)</li>
<li><b>Route</b>: kya ASA ko destination tak jaane aur wapas aane ka raasta pata hai? (<code>show route</code>)</li>
<li><b>Policy</b>: kya security levels ya ACL pehla packet permit karte hain?</li>
<li><b>NAT</b>: kya reply apna raasta wapas dhoondh paayega? (<code>show nat</code>, <code>show xlate</code>)</li>
<li><b>Inspection aur state</b>: kya zaroorat ke hisaab se protocol inspect ho raha hai, aur kya flow <code>show conn</code> aur <code>show logging</code> mein dikhta hai?</li>
</ol>

<h3>Walkthrough 1: factory default se working internet edge tak</h3>
<table class="cmp"><tr><th>Task</th><th>Aap kya configure karte ho</th><th>Saboot</th></tr>
<tr><td>1 Interfaces</td><td>Gi0/0 <code>nameif outside</code> 203.0.113.2/29, Gi0/1 <code>nameif inside</code> 10.0.1.1/24, dono <code>no shutdown</code></td><td><code>show nameif</code>: 0 aur 100; PC1 10.0.1.1 ping karta hai</td></tr>
<tr><td>2 Default route</td><td><code>route outside 0.0.0.0 0.0.0.0 203.0.113.1</code></td><td><code>show route</code> S*; ASA 8.8.8.8 ping karta hai</td></tr>
<tr><td>3 PAT</td><td><code>object network INSIDE-NET</code>, <code>subnet 10.0.1.0 255.255.255.0</code>, <code>nat (inside,outside) dynamic interface</code></td><td>PC1 <code>curl 8.8.8.8</code> chalta hai; <code>show xlate</code> flags ri</td></tr>
<tr><td>4 Ping diagnose karo</td><td>abhi kuch nahi: <code>packet-tracer input inside icmp 10.0.1.10 8 0 8.8.8.8</code> chalao</td><td>request allowed, lekin ICMP ke liye koi INSPECT phase nahi; replies ke liye syslog 106014</td></tr>
<tr><td>5 Fix aur save</td><td><code>global_policy</code> mein <code>inspect icmp</code>, phir <code>write memory</code></td><td>PC1 8.8.8.8 ping karta hai; <code>[OK]</code></td></tr>
</table>
<p>Task 4 mein tracer kehta hai ki echo request end to end allowed hai, jo routing, policy aur NAT saabit karta hai. Phases dhyan se padho: unmein se koi bhi ICMP ke liye INSPECT phase nahi hai. Fix ke baad ek naya phase dikhta hai:</p>
<pre class="out">Phase: 5
<span class="hl">Type: INSPECT</span>
Subtype: np-inspect
Result: ALLOW
Config:
class-map inspection_default
 match default-inspection-traffic
policy-map global_policy
 class inspection_default
<span class="hl">  inspect icmp</span>
service-policy global_policy global</pre>
<p>To "echo replies ke liye kaunsa feature missing hai?" ka jawab hai <b>ICMP inspection</b>.</p>

<h3>Walkthrough 2: ticket INC-7702, DMZ server updates download nahi kar pa raha</h3>
<p>DMZ ka WEB (10.0.2.10) 8.8.8.8 tak nahi pahunch pa raha; inside users theek hain. DMZ side se tracer se shuru karo:</p>
<pre class="out">NK-ASA# packet-tracer input dmz tcp 10.0.2.10 40000 8.8.8.8 80
Phase: 1
Type: ROUTE-LOOKUP
Subtype: Resolve Egress Interface
Result: ALLOW
Additional Information:
found next-hop 203.0.113.1 using egress ifc  outside

Phase: 2
<span class="hl">Type: ACCESS-LIST</span>
Subtype:
<span class="hl">Result: DROP</span>
Config:
<span class="hl">Implicit Rule</span>

Result:
input-interface: dmz
output-interface: outside
Action: drop
Drop-reason: (acl-drop) Flow is denied by configured rule</pre>
<p><b>ACCESS-LIST</b> phase par <b>implicit rule</b> se drop hua, aur DMZ par koi ACL nahi hai. Matlab security levels ne decide kiya. <code>show nameif</code> dmz ko level <b>0</b> par dikhata hai, outside ke barabar: barabar levels denied hain. <b>Fault 1.</b> Fix: <code>interface GigabitEthernet0/2</code>, <code>security-level 50</code>. <code>same-security-traffic permit inter-interface</code> use mat karo; yeh internet ko bhi DMZ mein connection shuru karne dega. Tracer dobara chalao: Action allow.</p>
<p>Lekin WEB ko ab bhi jawab nahi milta. Tracer ab flow allow karta hai, phir bhi <b>koi NAT phase nahi</b> dikhata, aur <code>show nat</code> mein sirf INSIDE-NET hai. WEB ke packets source 10.0.2.10 ke saath nikalte hain, aur ISP private address ko replies route nahi kar sakta. <b>Fault 2.</b> Fix: <code>object network DMZ-NET</code>, <code>subnet 10.0.2.0 255.255.255.0</code>, <code>nat (dmz,outside) dynamic interface</code>. Ab WEB 8.8.8.8 se download karta hai, aur 8.8.8.8 ko source 203.0.113.2 dikhta hai.</p>
<p>Aakhir mein saabit karo ki aapne inside nahi khola: WEB 10.0.1.10 ping karta hai aur fail hota hai (dmz 50 se inside 100 neeche se ooncha hai), jabki PC1 ab bhi WEB tak pahunchta hai (100 se 50).</p>

<div class="eg"><p><b>Worked example.</b> Do faults kyun? Sirf level theek karne se tracer mein saaf badlaav aaya (DROP ALLOW ban gaya), lekin user ka symptom wahi raha. Yahi woh pal hai jab yaad rakhna hai ki packet-tracer ASA ka decision check karta hai, internet ka return path nahi. Har fix ko host se real test karke confirm karna chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> packet-tracer mein <b>mapped</b> address ya galat ingress interface use karna. Host se test kiye bina pehle ALLOW par ruk jaana. DMZ ticket ko <code>same-security-traffic</code> ya <code>permit ip any any</code> ACL se fix karna. Ticket ke baad <code>write memory</code> bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Bina ACL configure kiye ACCESS-LIST phase mein "Implicit Rule" ka matlab hai security-level logic ne flow deny kiya. ACL configured hone par "Implicit Rule" ka matlab hai aapke ACL ki koi line match nahi hui, isliye uske end ke implicit deny ne kiya.</p></div>

<div class="scn"><h4>Do din ke ticket ka das minute ka jawab</h4><p>DMZ mein ek partner ka integration server do din se ek update service tak nahi pahunch pa raha tha, jabki teen teams ek doosre ko blame kar rahi thi. Ek naye hire hue engineer ne server ke real address ke saath DMZ interface se ek packet-tracer chalaya. Phase ACCESS-LIST, Implicit Rule, DROP. <code>show nameif</code> ne dikhaya ki DMZ subinterface default level 0 ke saath bana tha. Ek command ne level theek kiya, doosri ne missing PAT rule joda, aur server update ho gaya.</p><p><b>Seekh:</b> packet-tracer opinions ko evidence mein badal deta hai. Meeting se pehle chalao.</p></div>

<div class="iv"><p class="q">"Mujhe batao aap 'ASA ke peeche ka host internet tak nahi pahunch pa raha' kaise troubleshoot karoge."</p><p>Strong answer: interface check karo (nameif, level, up/up), dono taraf ka route, phir <code>packet-tracer input &lt;ingress&gt; tcp &lt;real src&gt; &lt;port&gt; &lt;dst&gt; &lt;port&gt;</code> chalao aur phases padho: ROUTE-LOOKUP, ACCESS-LIST, NAT, INSPECT, aur drop reason. <code>show nat</code> aur <code>show xlate</code> se NAT confirm karo, <code>show conn</code> aur syslog check karo, phir host se test karo. Batao ki packet-tracer sirf ek direction mein pehla packet simulate karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>packet-tracer input &lt;nameif&gt; &lt;proto&gt; &lt;src&gt; &lt;sport&gt; &lt;dst&gt; &lt;dport&gt;</code> pehla packet simulate karta hai.</li>
<li>Workflow: interface, route, policy, NAT, inspection aur state.</li>
<li>ICMP ping issue: tracer request allow karta hai, lekin ICMP ke liye koi INSPECT phase nahi; <code>inspect icmp</code> jodo.</li>
<li>DMZ ticket: level 0 outside ke barabar (implicit rule drop), aur koi DMZ PAT rule nahi.</li>
<li>Hamesha real test se confirm karo, aur saabit karo ki aapne zaroorat se zyada nahi khola.</li>
</ul></div>
`}};export{e as default};