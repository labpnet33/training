var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now have the mental model that the whole NSE 4 track builds on. This chapter pulls it together: a can-do checklist, a mini glossary, the most tested facts and a first command cheat-sheet. Read it again before you start nse4-setup, and once more before the exam.</p>
<h3>Can-do checklist</h3>
<p>You are ready for the next module when you can, without notes:</p>
<ul>
<li>Explain what a firewall does in one minute: filter, translate, inspect, record.</li>
<li>Tell packet filter, stateful firewall and NGFW apart by the questions each can ask.</li>
<li>Describe how a new packet is processed: session check, route lookup, policy lookup top-down, accept or implicit deny.</li>
<li>Read a session entry: 5-tuple, policy_id, source NAT lines, timeout.</li>
<li>Name the three nouns (interface, zone, policy) and say what a zone adds.</li>
<li>Explain source NAT with overload versus a virtual IP, and why a VIP needs a policy.</li>
<li>Edit a table with config, edit, set, next and end, and say why there is no commit.</li>
<li>Explain how the FortiOS Administrator exam fits the track and what to check on the official page.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Firewall</dt><dd>device that allows or drops conversations between networks</dd><dt>Session</dt><dd>record of one conversation, keyed by the 5-tuple</dd><dt>5-tuple</dt><dd>source IP, source port, destination IP, destination port, protocol</dd><dt>Implicit deny</dt><dd>the invisible last rule that drops unmatched traffic</dd><dt>Zone</dt><dd>a group of interfaces used as one in policies</dd><dt>SNAT</dt><dd>source NAT; hides private sources behind an egress address</dd><dt>VIP</dt><dd>virtual IP; destination NAT object for publishing a server</dd><dt>NGFW</dt><dd>firewall with user, application and content awareness</dd><dt>allowaccess</dt><dd>which management services an interface answers</dd></dl>
<h3>Most tested facts</h3>
<ul>
<li>Policies are evaluated top to bottom; the first match wins; the implicit deny is last.</li>
<li>Existing sessions bypass the policy lookup; policy changes affect new sessions.</li>
<li>Policies are directional (ingress to egress); replies follow the session.</li>
<li>FortiOS has no commit: a change is live when the entry is saved.</li>
<li><code>show</code> hides defaults; <code>show full-configuration</code> reveals them.</li>
<li>The default distance of a static route is 10.</li>
<li>Zone intrazone defaults to deny.</li>
<li>Role and allowaccess do not change forwarding.</li>
</ul>
<h3>First command cheat-sheet (verified in the simulator)</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr><tr><td>system status</td><td><code>get system status</code></td></tr><tr><td>interfaces</td><td><code>show system interface</code>, <code>get system interface physical</code></td></tr><tr><td>routing table</td><td><code>get router info routing-table all</code></td></tr><tr><td>policies</td><td><code>show firewall policy</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr><tr><td>ARP</td><td><code>get system arp</code></td></tr><tr><td>test reachability</td><td><code>execute ping 8.8.8.8</code>, <code>execute traceroute 8.8.8.8</code></td></tr></table>
<p>This is the real <code>get system status</code> from the simulator, trimmed to the lines you will use most:</p>
<pre class="out">Version: FortiGate-VM64 v7.4.4,build2662,240514 (GA.F) - NK-OS educational simulator
Hostname: NK-PUNE-FGT
Operation Mode: NAT
Current virtual domain: root
Current HA mode: standalone</pre>
<p>The simulator banner names its own FortiOS release, 7.4.4; it is a teaching tool and the track's exam target remains FortiOS 7.6.</p>
<div class="warn"><p><b>Common mistake.</b> Memorising this chapter without doing the labs. The facts only stick when you have seen the session list and the routing table change as you type.</p></div>
<div class="exam"><p><b>Exam trap.</b> When two answers both look right, test them against the order of operations: session, route, policy, NAT. The wrong answer usually puts a step in the wrong place.</p></div>
<div class="scn"><h4>From zero to first ticket</h4><p>A learner finished this module on Monday, did the nse4-setup labs on Tuesday and, on Wednesday, was handed a real ticket: users could browse but nobody could open the firewall GUI. Because she knew allowaccess is separate from policy, she checked the LAN interface first, found HTTPS missing and fixed it in two minutes.</p><p><b>Lesson:</b> the mental model turns a puzzling symptom into a short checklist.</p></div>
<div class="iv"><p class="q">"Walk me through what a FortiGate does with a packet from a LAN PC to the internet."</p><p>The packet arrives on the LAN interface. If it belongs to an existing session it is forwarded. If not, the FortiGate looks up the route to find the egress interface, then searches the policies top to bottom for the first match on interfaces, addresses, service and schedule. An accept policy creates the session and applies source NAT if enabled; otherwise the implicit deny drops it. Replies follow the session back and are un-NATed.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Model: interfaces, zones, policies, sessions, NAT.</li>
<li>Order: session, route, policy top-down, NAT, forward or drop.</li>
<li>FortiOS edits are live on save; show hides defaults.</li>
<li>Next: nse4-setup for hands-on configuration and tickets.</li>
</ul></div>
`,hi:`
<p>Ab aapke paas woh mental model hai jis par poora NSE 4 track bana hai. Yeh chapter sab jodta hai: can-do checklist, mini glossary, sabse zyada tested facts aur pehli command cheat-sheet. nse4-setup shuru karne se pehle ise phir padho, aur exam se pehle ek baar aur.</p>
<h3>Can-do checklist</h3>
<p>Agle module ke liye aap tab ready ho jab bina notes ke yeh kar sako:</p>
<ul>
<li>Ek minute mein firewall kya karta hai samjhao: filter, translate, inspect, record.</li>
<li>Packet filter, stateful firewall aur NGFW ko unke pooch sakne wale sawaalon se alag karo.</li>
<li>Batao naya packet kaise process hota hai: session check, route lookup, policy lookup upar se neeche, accept ya implicit deny.</li>
<li>Session entry padho: 5-tuple, policy_id, source NAT lines, timeout.</li>
<li>Teen nouns (interface, zone, policy) batao aur kaho ki zone kya jodta hai.</li>
<li>Overload wala source NAT aur virtual IP samjhao, aur yeh ki VIP ko policy kyun chahiye.</li>
<li>Table ko config, edit, set, next aur end se edit karo, aur batao commit kyun nahi hota.</li>
<li>Samjhao FortiOS Administrator exam track mein kaise fit hota hai aur official page par kya check karna hai.</li>
</ul>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Firewall</dt><dd>device jo networks ke beech conversations allow ya drop karta hai</dd><dt>Session</dt><dd>ek conversation ka record, 5-tuple se keyed</dd><dt>5-tuple</dt><dd>source IP, source port, destination IP, destination port, protocol</dd><dt>Implicit deny</dt><dd>aakhri invisible rule jo unmatched traffic drop karta hai</dd><dt>Zone</dt><dd>interfaces ka group jo policies mein ek ki tarah use hota hai</dd><dt>SNAT</dt><dd>source NAT; private sources ko egress address ke peeche chhupata hai</dd><dt>VIP</dt><dd>virtual IP; server publish karne ka destination NAT object</dd><dt>NGFW</dt><dd>user, application aur content awareness wala firewall</dd><dt>allowaccess</dt><dd>interface kaunsi management services ka jawab deta hai</dd></dl>
<h3>Sabse zyada tested facts</h3>
<ul>
<li>Policies upar se neeche evaluate hoti hain; pehli match jeetti hai; implicit deny aakhir mein hai.</li>
<li>Existing sessions policy lookup bypass karte hain; policy changes naye sessions par asar karte hain.</li>
<li>Policies directional hoti hain (ingress se egress); replies session ko follow karte hain.</li>
<li>FortiOS mein commit nahi hota: entry save hote hi change live hota hai.</li>
<li><code>show</code> defaults chhupata hai; <code>show full-configuration</code> dikhata hai.</li>
<li>Static route ka default distance 10 hai.</li>
<li>Zone ka intrazone default deny hota hai.</li>
<li>Role aur allowaccess forwarding nahi badalte.</li>
</ul>
<h3>Pehli command cheat-sheet (simulator mein verified)</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr><tr><td>system status</td><td><code>get system status</code></td></tr><tr><td>interfaces</td><td><code>show system interface</code>, <code>get system interface physical</code></td></tr><tr><td>routing table</td><td><code>get router info routing-table all</code></td></tr><tr><td>policies</td><td><code>show firewall policy</code></td></tr><tr><td>sessions</td><td><code>diagnose sys session list</code></td></tr><tr><td>ARP</td><td><code>get system arp</code></td></tr><tr><td>reachability test</td><td><code>execute ping 8.8.8.8</code>, <code>execute traceroute 8.8.8.8</code></td></tr></table>
<p>Yeh simulator ka asli <code>get system status</code> hai, un lines tak trimmed jo aap sabse zyada use karoge:</p>
<pre class="out">Version: FortiGate-VM64 v7.4.4,build2662,240514 (GA.F) - NK-OS educational simulator
Hostname: NK-PUNE-FGT
Operation Mode: NAT
Current virtual domain: root
Current HA mode: standalone</pre>
<p>Simulator ka banner apna FortiOS release 7.4.4 batata hai; yeh teaching tool hai aur track ka exam target FortiOS 7.6 hi hai.</p>
<div class="warn"><p><b>Common mistake.</b> Labs kiye bina is chapter ko ratna. Facts tab chipakte hain jab aap type karte hue session list aur routing table ko badalte dekhte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jab do jawab dono sahi lagein to unhe order of operations se test karo: session, route, policy, NAT. Galat jawab aksar kisi step ko galat jagah rakhta hai.</p></div>
<div class="scn"><h4>Zero se pehle ticket tak</h4><p>Ek learner ne Monday ko yeh module khatam kiya, Tuesday ko nse4-setup labs kiye aur Wednesday ko use real ticket mila: users browse kar pa rahe the par firewall GUI koi nahi khol pa raha tha. Kyunki use pata tha ki allowaccess policy se alag hai, usne pehle LAN interface check kiya, HTTPS missing mila aur do minute mein theek kar diya.</p><p><b>Lesson:</b> mental model uljhe hue symptom ko chhoti checklist mein badal deta hai.</p></div>
<div class="iv"><p class="q">"Mujhe batao FortiGate LAN PC se internet jaane wale packet ke saath kya karta hai."</p><p>Packet LAN interface par aata hai. Existing session ka ho to forward hota hai. Nahi to FortiGate egress interface ke liye route dhoondhta hai, phir interfaces, addresses, service aur schedule par pehli match ke liye policies ko upar se neeche search karta hai. Accept policy session banati hai aur enabled ho to source NAT lagati hai; warna implicit deny drop kar deta hai. Replies session ke saath wapas aate hain aur un-NAT hote hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Model: interfaces, zones, policies, sessions, NAT.</li>
<li>Order: session, route, policy upar se neeche, NAT, forward ya drop.</li>
<li>FortiOS edits save par live hote hain; show defaults chhupata hai.</li>
<li>Aage: hands-on configuration aur tickets ke liye nse4-setup.</li>
</ul></div>
`}};export{e as default};