var e={id:`summary`,h:{en:`Summary: the NSE 4 diagnostics cheat sheet`,hi:`Summary: NSE 4 diagnostics cheat sheet`},body:{en:`
<p>This chapter pulls the module together: a command table, the verdict dictionary, and a checklist you can use in the exam and on shift. Every command and output line below appeared earlier in this module from the simulator labs <i>fgt-debug-flow</i> and <i>fgt-sniffer-sessions</i>.</p>

<h3>Command table</h3>
<table class="cmp"><tr><th>Question</th><th>Command</th></tr>
<tr><td>Does the packet arrive or leave?</td><td><code>diagnose sniffer packet port2 'icmp' 4 5</code> style: interface, filter, verbose level, count</td></tr>
<tr><td>Why was it dropped?</td><td>filter, <code>trace start N</code>, <code>diagnose debug enable</code>, then disable and reset</td></tr>
<tr><td>Which policy and NAT?</td><td><code>diagnose sys session filter ...</code> then <code>diagnose sys session list</code></td></tr>
<tr><td>Quick session view</td><td><code>get system session list</code></td></tr>
<tr><td>Is there a route?</td><td><code>get router info routing-table details &lt;ip&gt;</code></td></tr>
<tr><td>Is the interface up?</td><td><code>get system interface physical</code></td></tr>
<tr><td>Which policy would match?</td><td><code>diagnose firewall iprope lookup src sport dst dport proto iface</code></td></tr>
<tr><td>Can the box reach it?</td><td><code>execute ping</code>, <code>execute traceroute</code></td></tr></table>

<h3>Verdict dictionary</h3>
<table class="cmp"><tr><th>You see</th><th>It means</th></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>Implicit deny: fix the policy</td></tr>
<tr><td><code>no route to host, drop</code> with <code>via none</code></td><td>Routing gap: fix the route</td></tr>
<tr><td><code>Allowed by Policy-N: SNAT</code></td><td>Policy N allowed it, with source NAT</td></tr>
<tr><td><code>Find an existing session ... reply direction</code></td><td>Return traffic, healthy</td></tr>
<tr><td><code>policy_id=N</code> in the session</td><td>Policy that created the flow</td></tr>
<tr><td><code>act=snat ... (203.0.113.2:40001)</code></td><td>Translated source seen by the server</td></tr>
<tr><td><code>org=.../.../... reply=...</code></td><td>Bytes, packets in each direction</td></tr></table>

<h3>Habits</h3>
<ul>
<li>Filter before you sniff, trace or list sessions.</li>
<li>Finish debug with <code>diagnose debug disable</code> and <code>diagnose debug reset</code>.</li>
<li>In the lab, the sniffer filter is a single quoted expression.</li>
<li>Capture evidence, change one thing, verify with the same tool.</li>
<li>Existing sessions keep the old policy until cleared.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Diagnostics families">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Sniffer</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">on the wire</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Flow</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">why dropped</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Session</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy, NAT</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Toolbox</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">route, lookup</text>
</svg><p class="cap">Four tool families, one order: wire, decision, state, basics.</p></div>

<div class="eg"><p><b>Worked example.</b> Exam prompt: "A user can ping but not browse; the debug flow ends with policy 0. What is wrong?" Answer: no policy allows the web service for that source and destination; routing is fine. Add the service to the right policy and verify with Allowed by Policy-N.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using diagnostics as a substitute for a ticket note. Always record the command, the key line and the outcome.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference between the three views: sniffer sees packets on an interface, debug flow shows kernel decisions, session list shows state after the decision.</p></div>

<div class="scn"><h4>Handover at shift change</h4><p>A night engineer left a note: "debug flow: no route, restored default route, session list shows policy_id=1 and SNAT 203.0.113.2." The day engineer verified with one session list and closed the ticket in minutes.</p><p><b>Lesson:</b> evidence-based notes make handovers fast.</p></div>

<div class="iv"><p class="q">"Summarise your FortiGate diagnostic toolkit in one minute."</p><p>Sniffer to see packets on an interface, debug flow to see the route, policy and NAT decisions, the session table to see state, policy id and counters, and basics like the routing table, interface status, iprope lookup and ping. I filter, capture evidence, change one thing, and verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sniffer, flow, session, toolbox: four families.</li>
<li>Policy 0 is the implicit deny; no route is a routing gap.</li>
<li>Session shows policy_id, NAT and counters in both directions.</li>
<li>Filter first; disable and reset after debug.</li>
<li>Practice the labs INC-40211 and the sniffer-sessions lab until you can do them without notes.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko jodta hai: command table, verdict dictionary, aur ek checklist jo exam aur shift dono mein kaam aaye. Neeche har command aur output line is module mein pehle simulator labs <i>fgt-debug-flow</i> aur <i>fgt-sniffer-sessions</i> se aayi hai.</p>

<h3>Command table</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Command</th></tr>
<tr><td>Packet aata ya nikalta hai?</td><td><code>diagnose sniffer packet port2 'icmp' 4 5</code> style: interface, filter, verbose level, count</td></tr>
<tr><td>Drop kyun hua?</td><td>filter, <code>trace start N</code>, <code>diagnose debug enable</code>, phir disable aur reset</td></tr>
<tr><td>Kaunsi policy aur NAT?</td><td><code>diagnose sys session filter ...</code> phir <code>diagnose sys session list</code></td></tr>
<tr><td>Quick session view</td><td><code>get system session list</code></td></tr>
<tr><td>Route hai?</td><td><code>get router info routing-table details &lt;ip&gt;</code></td></tr>
<tr><td>Interface up hai?</td><td><code>get system interface physical</code></td></tr>
<tr><td>Kaunsi policy match hogi?</td><td><code>diagnose firewall iprope lookup src sport dst dport proto iface</code></td></tr>
<tr><td>Box tak pahunch sakta hai?</td><td><code>execute ping</code>, <code>execute traceroute</code></td></tr></table>

<h3>Verdict dictionary</h3>
<table class="cmp"><tr><th>Aap dekhte ho</th><th>Matlab</th></tr>
<tr><td><code>Denied by forward policy check (policy 0)</code></td><td>Implicit deny: policy theek karo</td></tr>
<tr><td><code>no route to host, drop</code> aur <code>via none</code></td><td>Routing gap: route theek karo</td></tr>
<tr><td><code>Allowed by Policy-N: SNAT</code></td><td>Policy N ne source NAT ke saath allow kiya</td></tr>
<tr><td><code>Find an existing session ... reply direction</code></td><td>Return traffic, healthy</td></tr>
<tr><td>Session mein <code>policy_id=N</code></td><td>Flow banane wali policy</td></tr>
<tr><td><code>act=snat ... (203.0.113.2:40001)</code></td><td>Server ko dikhne wala translated source</td></tr>
<tr><td><code>org=.../.../... reply=...</code></td><td>Har direction mein bytes, packets</td></tr></table>

<h3>Aadatein</h3>
<ul>
<li>Sniff, trace ya session list se pehle filter karo.</li>
<li>Debug ko <code>diagnose debug disable</code> aur <code>diagnose debug reset</code> par khatam karo.</li>
<li>Lab mein sniffer filter ek single quoted expression hai.</li>
<li>Evidence capture karo, ek cheez badlo, usi tool se verify karo.</li>
<li>Existing sessions clear hone tak purani policy rakhte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Diagnostics families">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Sniffer</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">wire par</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Flow</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">drop kyun</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Session</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">policy, NAT</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="13.0">Toolbox</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="12.0">route, lookup</text>
</svg><p class="cap">Chaar tool families, ek order: wire, decision, state, basics.</p></div>

<div class="eg"><p><b>Worked example.</b> Exam prompt: "User ping kar sakta hai lekin browse nahi; debug flow policy 0 par khatam hota hai. Kya galat hai?" Jawab: us source aur destination ke liye koi policy web service allow nahi karti; routing theek hai. Sahi policy mein service jodo aur Allowed by Policy-N se verify karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Diagnostics ko ticket note ki jagah use karna. Hamesha command, key line aur outcome record karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen views ka fark jaano: sniffer interface par packets dekhta hai, debug flow kernel decisions, session list decision ke baad ki state.</p></div>

<div class="scn"><h4>Shift change par handover</h4><p>Raat ke engineer ne note chhoda: "debug flow: no route, default route restore kiya, session list policy_id=1 aur SNAT 203.0.113.2 dikhati hai." Din ke engineer ne ek session list se verify kiya aur minutes mein ticket band kiya.</p><p><b>Lesson:</b> evidence-based notes handover tez karte hain.</p></div>

<div class="iv"><p class="q">"Apna FortiGate diagnostic toolkit ek minute mein batao."</p><p>Interface par packets dekhne ke liye sniffer, route, policy aur NAT decisions ke liye debug flow, state, policy id aur counters ke liye session table, aur routing table, interface status, iprope lookup aur ping jaise basics. Main filter karta hoon, evidence capture karta hoon, ek cheez badalta hoon aur verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sniffer, flow, session, toolbox: chaar families.</li>
<li>Policy 0 implicit deny hai; no route routing gap hai.</li>
<li>Session policy_id, NAT aur dono directions ke counters dikhata hai.</li>
<li>Pehle filter; debug ke baad disable aur reset.</li>
<li>INC-40211 aur sniffer-sessions lab tab tak practice karo jab tak bina notes ke na kar sako.</li>
</ul></div>
`}};export{e as default};