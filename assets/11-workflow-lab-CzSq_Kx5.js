var e={id:`workflow-lab`,h:{en:`A structured troubleshooting workflow, walked through the NOC lab`,hi:`Ek structured troubleshooting workflow, NOC lab ke saath`},body:{en:`
<p>A pilot facing a warning light does not improvise; she opens the checklist and works it line by line, because under pressure memory fails and checklists do not. This chapter turns everything in the module into one checklist for Threat Defense tickets, and then flies it through the lab: <b>INC-8177 (P1)</b>, "The partner portal on 203.0.113.3 (WEB, 10.0.2.10) has not worked since the firewall migration."</p>

<h3>The nine-step Threat Defense workflow</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Nine-step workflow">
<rect x="10" y="20" width="115" height="50" rx="8" fill="#e2e8f0"/><text x="67" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 Define flow</text><text x="67" y="60" text-anchor="middle" class="svg-muted" font-size="12">src dst port</text>
<rect x="135" y="20" width="115" height="50" rx="8" fill="#fde68a"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 In sync?</text><text x="192" y="60" text-anchor="middle" class="svg-muted" font-size="12">deploy, health</text>
<rect x="260" y="20" width="115" height="50" rx="8" fill="#bae6fd"/><text x="317" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Capture in</text><text x="317" y="60" text-anchor="middle" class="svg-muted" font-size="12">arrives?</text>
<rect x="385" y="20" width="115" height="50" rx="8" fill="#bbf7d0"/><text x="442" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 packet-tracer</text><text x="442" y="60" text-anchor="middle" class="svg-muted" font-size="12">phase, rule-id</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="570" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 Live state</text><text x="570" y="60" text-anchor="middle" class="svg-muted" font-size="12">nat, conn, asp</text>
<rect x="510" y="120" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="142" text-anchor="middle" class="svg-ink" font-size="12">6 Snort view</text><text x="570" y="160" text-anchor="middle" class="svg-muted" font-size="12">events, trace</text>
<rect x="385" y="120" width="115" height="50" rx="8" fill="#fed7aa"/><text x="442" y="142" text-anchor="middle" class="svg-ink" font-size="12">7 Fix in FMC</text><text x="442" y="160" text-anchor="middle" class="svg-muted" font-size="12">smallest change</text>
<rect x="260" y="120" width="115" height="50" rx="8" fill="#fde68a"/><text x="317" y="142" text-anchor="middle" class="svg-ink" font-size="12">8 Deploy</text><text x="317" y="160" text-anchor="middle" class="svg-muted" font-size="12">check status</text>
<rect x="135" y="120" width="115" height="50" rx="8" fill="#bbf7d0"/><text x="192" y="142" text-anchor="middle" class="svg-ink" font-size="12">9 Verify, clean</text><text x="192" y="160" text-anchor="middle" class="svg-muted" font-size="12">events, no capture</text>
<line x1="125" y1="45" x2="135" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="375" y1="45" x2="385" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="70" x2="570" y2="120" stroke="#64748b" stroke-width="2"/><line x1="510" y1="145" x2="500" y2="145" stroke="#64748b" stroke-width="2"/><line x1="385" y1="145" x2="375" y2="145" stroke="#64748b" stroke-width="2"/><line x1="260" y1="145" x2="250" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Steps 1 to 6 collect evidence on the device; steps 7 to 9 change and prove in the manager</text>
</svg><p class="cap">Evidence first, one change, then proof. Skip a step only when you know what it would have told you.</p></div>

<ol>
<li><b>Define the flow:</b> 198.51.100.10 → 203.0.113.3 TCP 443, ingress outside. When did it last work? (Before the migration.)</li>
<li><b>Is the device in sync and healthy?</b> Device status Up to date, last deployment succeeded, no critical health alerts. Here: yes, so the running policy is the one in the Management Center, and the fault is in that policy.</li>
<li><b>Capture on ingress</b> (lab task 1).</li>
<li><b>packet-tracer</b> for the exact flow (lab task 2).</li>
<li><b>Live state:</b> <code>show nat</code>, <code>show xlate</code>, <code>show access-control-config</code>, <code>show asp drop</code>.</li>
<li><b>Snort view:</b> Unified Events, Reason column; trace or firewall-engine-debug if LINA permits but the flow still fails.</li>
<li><b>Fix in the Management Center,</b> the smallest change that explains all the evidence (lab task 3).</li>
<li><b>Deploy</b> and confirm the device returns to Up to date.</li>
<li><b>Verify and clean up:</b> the user's test, events, counters; remove captures; write the ticket note (lab task 4).</li>
</ol>

<h3>Lab task 1: does the traffic arrive?</h3>
<pre class="code">&gt; capture CAP interface outside match tcp any host 203.0.113.3
<span class="c">! On PARTNER: open the portal over HTTPS (to 203.0.113.3)</span>
&gt; show capture CAP</pre>
<pre class="out"><span class="hl">3 packets captured</span>
   1: 09:14:02.118227  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...
   2: 09:14:03.120113  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...
   3: 09:14:05.122540  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...</pre>
<p>Yes: SYNs arrive and are retransmitted with no reply. In this lab the upstream path delivers them; in a real network, if the firewall no longer answers ARP for 203.0.113.3 (no NAT rule owns it), the same fault can show as zero packets instead. Either way, the next step is the firewall's decision.</p>

<h3>Lab task 2: what does the firewall decide, and which address is WEB mapped to?</h3>
<pre class="code">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
&gt; show nat</pre>
<pre class="out">Phase: 2  Type: ROUTE-LOOKUP  ... egress ifc outside
Phase: 3  Type: ACCESS-LIST   Result: DROP
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE</span>

Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
    translate_hits = 0, untranslate_hits = 0</pre>
<p>No UN-NAT phase, default action drop, and WEB is mapped to <b>203.0.113.5</b>. That is the answer the lab asks for. Then <code>show access-control-config</code> reveals the second fault: Portal-In has destination 203.0.113.3 (mapped) and 0 Rule Hits. If you fixed only the NAT, UN-NAT would divert the packet to dmz with destination 10.0.2.10, and Portal-In would still not match; the flow would still hit the default action.</p>

<h3>Lab task 3: fix both faults in the Management Center and deploy</h3>
<pre class="code"><span class="c">! Management Center, not the device CLI</span>
<span class="c">! 1. Devices → NAT (lab tab: Policies → NAT) → edit the static rule for WEB</span>
<span class="c">!    Translated Source: 203.0.113.5  →  203.0.113.3</span>
<span class="c">! 2. Policies → Access Control → NK-ACP → edit Portal-In</span>
<span class="c">!    Destination Networks: 203.0.113.3  →  object WEB (10.0.2.10)</span>
<span class="c">! 3. Deploy → select NK-FTD → Deploy; wait for Up to date</span></pre>
<pre class="out">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
Phase: 2  Type: UN-NAT  Subtype: static
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>
Phase: 3  Type: ACCESS-LIST  Result: ALLOW
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Portal-In</span>
...
Action: allow</pre>

<h3>Lab task 4: verify with events and clean up</h3>
<p>Ask PARTNER to open the portal again. In Analysis → Unified Events (or Connection Events), filter on initiator 198.51.100.10: the newest event shows <b>Action Allow, rule Portal-In</b>, responder 10.0.2.10, bytes in both directions. Then remove the capture:</p>
<pre class="code">&gt; no capture CAP
&gt; show capture
<span class="c">! (no output: nothing left running)</span></pre>

<div class="eg"><p><b>Worked example: the ticket note.</b> "INC-8177 resolved. Cause: two migration errors. (1) Static NAT for WEB mapped to 203.0.113.5 instead of 203.0.113.3 (packet-tracer showed no UN-NAT; show nat untranslate_hits 0). (2) Access rule Portal-In used the mapped address instead of the real server object WEB (0 hits). Fix: corrected NAT and rule in the Management Center, deployed 09:41. Verified: packet-tracer allow via Portal-In, partner test OK, connection events Allow. Capture removed."</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the first fault. Fixing on the wrong layer (adding a route, or a second rule to 203.0.113.5). Forgetting to deploy, or not checking that deployment succeeded. Leaving the capture running, which the lab checks.</p></div>

<div class="exam"><p><b>Exam trap.</b> A scenario that lists "no UN-NAT phase" plus "rule uses the public IP" has two answers, and the question may ask for the one that alone would still leave it broken. Always reason through the packet flow after each proposed fix.</p></div>

<div class="scn"><h4>Following the checklist at 3 a.m.</h4><p>An on-call engineer woke to a P1: the VPN concentrator behind Threat Defense was unreachable for all remote users. Step 2 found the answer before any packet command: the device showed a failed deployment from 01:50 and a rollback had not been done; health showed Snort restarting repeatedly. Rolling back to the previous successful deployment from Deployment History restored service in five minutes, and the faulty change was analysed in the morning.</p><p><b>Lesson:</b> checking sync and health first can save an hour of packet debugging.</p></div>

<div class="iv"><p class="q">"Describe how you solved a firewall ticket end to end."</p><p>Use this lab as your story: defined the flow, confirmed the device was in sync, proved arrival with a capture, used packet-tracer to see no UN-NAT and the default action, used show nat and show access-control-config to find two faults, fixed both in the Management Center, deployed, verified with packet-tracer, the user's test and connection events, removed the capture and documented the root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nine steps: define, sync and health, capture, packet-tracer, live state, Snort view, fix, deploy, verify and clean.</li>
<li>The lab had two faults: NAT mapped to .5, and the rule using the mapped address.</li>
<li>Fixing only one would leave the portal broken; re-run the packet flow after each fix.</li>
<li>Prove the fix with packet-tracer, the user's test and connection events showing Portal-In.</li>
<li>Remove captures and write a clear root-cause note.</li>
</ul></div>
`,hi:`
<p>Warning light dekhkar pilot improvise nahi karti; woh checklist kholti hai aur line by line chalti hai, kyunki pressure mein memory fail hoti hai aur checklists nahi. Yeh chapter is module ki har cheez ko Threat Defense tickets ke liye ek checklist mein badalta hai, aur phir use lab par chalata hai: <b>INC-8177 (P1)</b>, "Firewall migration ke baad se 203.0.113.3 (WEB, 10.0.2.10) par partner portal nahi chala."</p>

<h3>Nau-step Threat Defense workflow</h3>
<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Nau-step workflow">
<rect x="10" y="20" width="115" height="50" rx="8" fill="#e2e8f0"/><text x="67" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 Flow define</text><text x="67" y="60" text-anchor="middle" class="svg-muted" font-size="12">src dst port</text>
<rect x="135" y="20" width="115" height="50" rx="8" fill="#fde68a"/><text x="192" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 Sync mein?</text><text x="192" y="60" text-anchor="middle" class="svg-muted" font-size="12">deploy, health</text>
<rect x="260" y="20" width="115" height="50" rx="8" fill="#bae6fd"/><text x="317" y="42" text-anchor="middle" class="svg-ink" font-size="12">3 Capture in</text><text x="317" y="60" text-anchor="middle" class="svg-muted" font-size="12">aata hai?</text>
<rect x="385" y="20" width="115" height="50" rx="8" fill="#bbf7d0"/><text x="442" y="42" text-anchor="middle" class="svg-ink" font-size="12">4 packet-tracer</text><text x="442" y="60" text-anchor="middle" class="svg-muted" font-size="12">phase, rule-id</text>
<rect x="510" y="20" width="120" height="50" rx="8" fill="#bae6fd"/><text x="570" y="42" text-anchor="middle" class="svg-ink" font-size="12">5 Live state</text><text x="570" y="60" text-anchor="middle" class="svg-muted" font-size="12">nat, conn, asp</text>
<rect x="510" y="120" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="142" text-anchor="middle" class="svg-ink" font-size="12">6 Snort view</text><text x="570" y="160" text-anchor="middle" class="svg-muted" font-size="12">events, trace</text>
<rect x="385" y="120" width="115" height="50" rx="8" fill="#fed7aa"/><text x="442" y="142" text-anchor="middle" class="svg-ink" font-size="12">7 FMC mein fix</text><text x="442" y="160" text-anchor="middle" class="svg-muted" font-size="12">sabse chhota change</text>
<rect x="260" y="120" width="115" height="50" rx="8" fill="#fde68a"/><text x="317" y="142" text-anchor="middle" class="svg-ink" font-size="12">8 Deploy</text><text x="317" y="160" text-anchor="middle" class="svg-muted" font-size="12">status check</text>
<rect x="135" y="120" width="115" height="50" rx="8" fill="#bbf7d0"/><text x="192" y="142" text-anchor="middle" class="svg-ink" font-size="12">9 Verify, saaf</text><text x="192" y="160" text-anchor="middle" class="svg-muted" font-size="12">events, no capture</text>
<line x1="125" y1="45" x2="135" y2="45" stroke="#64748b" stroke-width="2"/><line x1="250" y1="45" x2="260" y2="45" stroke="#64748b" stroke-width="2"/><line x1="375" y1="45" x2="385" y2="45" stroke="#64748b" stroke-width="2"/><line x1="500" y1="45" x2="510" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="570" y1="70" x2="570" y2="120" stroke="#64748b" stroke-width="2"/><line x1="510" y1="145" x2="500" y2="145" stroke="#64748b" stroke-width="2"/><line x1="385" y1="145" x2="375" y2="145" stroke="#64748b" stroke-width="2"/><line x1="260" y1="145" x2="250" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">Steps 1 se 6 device par evidence jodte hain; steps 7 se 9 manager mein change aur proof</text>
</svg><p class="cap">Pehle evidence, ek change, phir proof. Koi step tabhi chhodo jab aapko pata ho ki woh kya batata.</p></div>

<ol>
<li><b>Flow define karo:</b> 198.51.100.10 → 203.0.113.3 TCP 443, ingress outside. Aakhri baar kab chala tha? (Migration se pehle.)</li>
<li><b>Kya device sync mein aur healthy hai?</b> Device status Up to date, pichla deployment successful, koi critical health alert nahi. Yahan: haan, to running policy wahi hai jo Management Center mein hai, aur fault usi policy mein hai.</li>
<li><b>Ingress par capture</b> (lab task 1).</li>
<li>Exact flow ke liye <b>packet-tracer</b> (lab task 2).</li>
<li><b>Live state:</b> <code>show nat</code>, <code>show xlate</code>, <code>show access-control-config</code>, <code>show asp drop</code>.</li>
<li><b>Snort view:</b> Unified Events, Reason column; agar LINA permit kare par flow phir bhi fail ho to trace ya firewall-engine-debug.</li>
<li><b>Management Center mein fix karo,</b> sabse chhota change jo saare evidence ko explain kare (lab task 3).</li>
<li><b>Deploy</b> karo aur confirm karo ki device wapas Up to date hai.</li>
<li><b>Verify aur saaf-safai:</b> user ka test, events, counters; captures hatao; ticket note likho (lab task 4).</li>
</ol>

<h3>Lab task 1: kya traffic aa raha hai?</h3>
<pre class="code">&gt; capture CAP interface outside match tcp any host 203.0.113.3
<span class="c">! PARTNER par: portal HTTPS par kholo (203.0.113.3 ki taraf)</span>
&gt; show capture CAP</pre>
<pre class="out"><span class="hl">3 packets captured</span>
   1: 09:14:02.118227  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...
   2: 09:14:03.120113  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...
   3: 09:14:05.122540  198.51.100.10.40000 &gt; 203.0.113.3.443: S ...</pre>
<p>Haan: SYN aate hain aur bina reply ke retransmit hote hain. Is lab mein upstream path unhe deliver karta hai; real network mein, agar firewall 203.0.113.3 ke liye ARP ka jawab dena band kar de (koi NAT rule uski maalik nahi), to yahi fault zero packets ke roop mein bhi dikh sakta hai. Dono tarah, agla step firewall ka decision hai.</p>

<h3>Lab task 2: firewall kya decide karta hai, aur WEB kis address par mapped hai?</h3>
<pre class="code">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
&gt; show nat</pre>
<pre class="out">Phase: 2  Type: ROUTE-LOOKUP  ... egress ifc outside
Phase: 3  Type: ACCESS-LIST   Result: DROP
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268434432: L4 RULE: DEFAULT ACTION RULE</span>

Auto NAT Policies (Section 2)
<span class="hl">1 (dmz) to (outside) source static WEB 203.0.113.5</span>
    translate_hits = 0, untranslate_hits = 0</pre>
<p>UN-NAT phase nahi, default action drop, aur WEB <b>203.0.113.5</b> par mapped hai. Lab yahi jawab maangti hai. Phir <code>show access-control-config</code> doosra fault dikhata hai: Portal-In ka destination 203.0.113.3 (mapped) hai aur 0 Rule Hits. Agar aap sirf NAT theek karte, to UN-NAT packet ko destination 10.0.2.10 ke saath dmz par divert karta, aur Portal-In phir bhi match nahi hoti; flow ab bhi default action par girta.</p>

<h3>Lab task 3: Management Center mein dono faults theek karo aur deploy karo</h3>
<pre class="code"><span class="c">! Management Center, device CLI nahi</span>
<span class="c">! 1. Devices → NAT (lab tab: Policies → NAT) → WEB ki static rule edit karo</span>
<span class="c">!    Translated Source: 203.0.113.5  →  203.0.113.3</span>
<span class="c">! 2. Policies → Access Control → NK-ACP → Portal-In edit karo</span>
<span class="c">!    Destination Networks: 203.0.113.3  →  object WEB (10.0.2.10)</span>
<span class="c">! 3. Deploy → NK-FTD select karo → Deploy; Up to date ka intezaar karo</span></pre>
<pre class="out">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443
Phase: 2  Type: UN-NAT  Subtype: static
<span class="hl">Untranslate 203.0.113.3/443 to 10.0.2.10/443</span>
Phase: 3  Type: ACCESS-LIST  Result: ALLOW
<span class="hl">access-list CSM_FW_ACL_ remark rule-id 268435458: L7 RULE: Portal-In</span>
...
Action: allow</pre>

<h3>Lab task 4: events se verify karo aur saaf-safai karo</h3>
<p>PARTNER se portal dobara khulwao. Analysis → Unified Events (ya Connection Events) mein initiator 198.51.100.10 par filter karo: sabse naya event <b>Action Allow, rule Portal-In</b>, responder 10.0.2.10, dono direction mein bytes dikhata hai. Phir capture hatao:</p>
<pre class="code">&gt; no capture CAP
&gt; show capture
<span class="c">! (koi output nahi: kuch bhi chalta nahi bacha)</span></pre>

<div class="eg"><p><b>Worked example: ticket note.</b> "INC-8177 resolved. Cause: do migration errors. (1) WEB ka static NAT 203.0.113.3 ki jagah 203.0.113.5 par mapped tha (packet-tracer mein UN-NAT nahi; show nat untranslate_hits 0). (2) Access rule Portal-In real server object WEB ki jagah mapped address use kar rahi thi (0 hits). Fix: Management Center mein NAT aur rule theek ki, 09:41 par deploy. Verified: Portal-In ke through packet-tracer allow, partner test OK, connection events Allow. Capture hataya."</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Pehle fault ke baad ruk jaana. Galat layer par fix karna (route jodna, ya 203.0.113.5 ke liye doosri rule). Deploy karna bhoolna, ya check na karna ki deployment successful hua. Capture chalta chhod dena, jise lab check karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jo scenario "UN-NAT phase nahi" plus "rule public IP use karti hai" list kare, uske do jawab hain, aur question woh poochh sakta hai jo akele lagaane par bhi cheez tooti chhod de. Har proposed fix ke baad packet flow ko sochkar dekho.</p></div>

<div class="scn"><h4>Raat 3 baje checklist follow karna</h4><p>Ek on-call engineer P1 par jaaga: Threat Defense ke peeche VPN concentrator saare remote users ke liye unreachable tha. Step 2 ne kisi packet command se pehle jawab de diya: device 01:50 ka failed deployment dikha raha tha aur rollback nahi hua tha; health Snort ko baar baar restart hote dikha raha tha. Deployment History se pichle successful deployment par rollback karne se paanch minute mein service wapas aa gayi, aur kharaab change ka analysis subah hua.</p><p><b>Seekh:</b> pehle sync aur health check karna ghante bhar ki packet debugging bacha sakta hai.</p></div>

<div class="iv"><p class="q">"Batao aapne ek firewall ticket end to end kaise solve kiya."</p><p>Is lab ko apni kahani banao: flow define kiya, confirm kiya ki device sync mein hai, capture se arrival prove kiya, packet-tracer se UN-NAT nahi aur default action dekha, show nat aur show access-control-config se do faults dhoondhe, dono Management Center mein theek kiye, deploy kiya, packet-tracer, user ke test aur connection events se verify kiya, capture hataya aur root cause document kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nau steps: define, sync aur health, capture, packet-tracer, live state, Snort view, fix, deploy, verify aur saaf-safai.</li>
<li>Lab mein do faults the: NAT .5 par mapped, aur rule mapped address use kar rahi thi.</li>
<li>Sirf ek theek karne se portal toota rehta; har fix ke baad packet flow dobara chalao.</li>
<li>Fix ko packet-tracer, user ke test aur Portal-In dikhate connection events se prove karo.</li>
<li>Captures hatao aur saaf root-cause note likho.</li>
</ul></div>
`}};export{e as default};