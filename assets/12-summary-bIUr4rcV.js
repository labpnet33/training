var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a vague ticket, "the portal is down", and a box with two engines and a manager. You finish it with a checklist, a toolkit on both the device and the Management Center, and the habit that separates good engineers from lucky ones: evidence first, one change, then proof. Use this chapter as your revision sheet before the SNCF 300-710 exam and before your next on-call shift.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the FTD packet flow: ingress, connection lookup, prefilter, UN-NAT, route lookup, the L3/L4 ACL in LINA, NAT and connection creation, Snort (SI, decryption, AppID and rule match, intrusion, file), verdict, egress.</li>
<li>I can say what Fastpath, Trust, Allow and Block mean for Snort inspection.</li>
<li>I can run and read <code>packet-tracer</code>, including the UN-NAT phase, the CSM_FW_ACL_ rule-id and remark, and the SNORT phase.</li>
<li>I can capture on both sides of NAT, add <code>trace detail</code>, read <code>show capture NAME packet-number 1 trace</code>, use asp-drop captures and <code>capture-traffic</code>, and clean up.</li>
<li>I can read <code>show conn</code> (flags including N), <code>show xlate</code>, <code>show nat</code> hit counters, <code>show access-control-config</code> Rule Hits, <code>show asp drop</code> and <code>show snort statistics</code>.</li>
<li>I can find connection, SI and intrusion events in Unified Events and interpret Action, rule and Reason.</li>
<li>I can run <code>system support firewall-engine-debug</code> and <code>system support trace</code> with filters and read the verdicts.</li>
<li>I can troubleshoot registration (<code>configure manager add</code>, TCP 8305, key and NAT ID), deployment failures (Deployment History transcript, rollback), health alerts, and generate troubleshoot files.</li>
<li>I can diagnose NAT and routing faults and fix SI and intrusion blocks narrowly and safely.</li>
<li>I can walk INC-8177 end to end and explain both faults.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Symptom to tool map">
<rect x="10" y="20" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="12">Does it arrive?</text>
<rect x="330" y="20" width="300" height="36" rx="8" fill="#bae6fd"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="12">capture on ingress</text>
<rect x="10" y="64" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="87" text-anchor="middle" class="svg-ink" font-size="12">Which phase / rule drops it?</text>
<rect x="330" y="64" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer, capture trace</text>
<rect x="10" y="108" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="131" text-anchor="middle" class="svg-ink" font-size="12">What did Snort decide?</text>
<rect x="330" y="108" width="300" height="36" rx="8" fill="#ddd6fe"/><text x="480" y="131" text-anchor="middle" class="svg-ink" font-size="12">Unified Events, system support trace</text>
<rect x="10" y="152" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Is the device in sync?</text>
<rect x="330" y="152" width="300" height="36" rx="8" fill="#fde68a"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Deployment History, Health Monitor</text>
</svg><p class="cap">The four questions of chapter 1 and the tool that answers each.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LINA</dt><dd>The ASA-based data plane in FTD: interfaces, routing, NAT, connections, L3/L4 policy, VPN.</dd>
<dt>Snort 3</dt><dd>The inspection engine: SI, application identification, access control L7 matching, intrusion, file and malware.</dd>
<dt>CSM_FW_ACL_</dt><dd>The LINA access list compiled from the access control policy; entries carry rule-ids and remarks.</dd>
<dt>rule-id 268434432</dt><dd>The default action of the access control policy.</dd>
<dt>Prefilter / Fastpath</dt><dd>LINA policy evaluated before access control; Fastpath bypasses Snort.</dd>
<dt>Trust</dt><dd>Access control action decided in Snort; the rest of the flow is fast-forwarded without inspection.</dd>
<dt>ASP drop</dt><dd>Counters of packets dropped by LINA's accelerated security path, with a reason code.</dd>
<dt>Unified Events</dt><dd>Management Center view combining connection, SI, intrusion, file and malware events.</dd>
<dt>sftunnel</dt><dd>The encrypted management tunnel between FTD and the Management Center, TCP 8305.</dd>
<dt>Troubleshoot file</dt><dd>Diagnostic bundle for TAC, from Health Monitor or <code>system generate-troubleshoot</code>.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Fix location</td><td>Diagnose on device, fix in Management Center, Deploy</td></tr>
<tr><td>No UN-NAT phase</td><td>No static NAT matches the destination</td></tr>
<tr><td>Access rules and NAT</td><td>Rules use the real address</td></tr>
<tr><td>Default action</td><td>rule-id 268434432</td></tr>
<tr><td>N flag in show conn</td><td>Inspected by Snort</td></tr>
<tr><td>snort-drop in asp drop</td><td>Snort verdict, not a LINA rule</td></tr>
<tr><td>Reason IP / URL / DNS Block</td><td>Security Intelligence</td></tr>
<tr><td>Inline Result</td><td>Dropped = blocked; Would have dropped = passed</td></tr>
<tr><td>Block rule logging</td><td>Beginning of connection only</td></tr>
<tr><td>Management tunnel</td><td>TCP 8305; key and NAT ID must match</td></tr>
<tr><td>tcp-not-syn</td><td>Usually asymmetric routing</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 [detailed]
&gt; capture CAP interface outside trace detail match tcp any host 203.0.113.3
&gt; show capture CAP packet-number 1 trace
&gt; capture ASP type asp-drop all
&gt; capture-traffic
&gt; no capture CAP
&gt; show conn address 10.0.2.10
&gt; show xlate
&gt; show nat detail
&gt; show access-control-config
&gt; clear asp drop
&gt; show asp drop
&gt; show snort statistics
&gt; show route
&gt; system support firewall-engine-debug
&gt; system support trace
&gt; show managers
&gt; configure manager add 192.0.2.50 Nk-RegKey-01
&gt; sftunnel-status-brief
&gt; system generate-troubleshoot all</pre>

<div class="warn"><p><b>Last reminders.</b> Simulate the packet the client really sends. Clear counters before reproducing. Check sync and health before deep debugging. Fix narrowly, deploy, verify, remove captures, document.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Prefilter runs before access control; SI runs before access control rules in Snort; UN-NAT runs before the ACL; Block rules log at the beginning only; Fastpath is not Trust; "Out of date" means Deploy.</p></div>

<div class="scn"><h4>The interview that became a whiteboard</h4><p>A candidate for a security operations role was given INC-8177 as a whiteboard question. She drew LINA and Snort as two boxes, wrote the flow at the top, and walked the nine steps aloud: capture, packet-tracer with no UN-NAT, show nat showing .5, Portal-In with the mapped address, two fixes in the Management Center, deploy, events. The panel stopped her after six minutes and moved on to salary.</p><p><b>Lesson:</b> a structured method, spoken clearly, is the most convincing proof of experience.</p></div>

<div class="iv"><p class="q">"What is the difference between troubleshooting an ASA and an FTD?"</p><p>The LINA tools are the same (packet-tracer, capture, show conn, asp drop), but FTD adds Snort, so you also check SNORT phases, Snort verdicts, Unified Events with Reason, and the Snort debugs. Policy is not configured on the CLI: you fix in the Management Center and deploy, and you must check deployment status, health and registration. Rules use CSM_FW_ACL_ rule-ids mapped to rule names.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four questions: arrival, LINA decision, Snort decision, device in sync.</li>
<li>Device CLI for evidence, Management Center for fixes, Deploy to apply.</li>
<li>Know the key rule-ids, flags, asp drop reasons and event Reasons by heart.</li>
<li>Management-plane health (registration, deployment, health alerts) comes before data-plane debugging.</li>
<li>Fix security blocks narrowly and document every exception.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek vague ticket, "portal down hai", aur do engines aur ek manager wale box ke saath shuru kiya tha. Aap ise ek checklist, device aur Management Center dono par ek toolkit, aur us habit ke saath khatam karte ho jo acche engineers ko lucky engineers se alag karti hai: pehle evidence, ek change, phir proof. SNCF 300-710 exam aur apni agli on-call shift se pehle is chapter ko revision sheet ki tarah use karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main FTD packet flow samjha sakta hoon: ingress, connection lookup, prefilter, UN-NAT, route lookup, LINA mein L3/L4 ACL, NAT aur connection creation, Snort (SI, decryption, AppID aur rule match, intrusion, file), verdict, egress.</li>
<li>Main bata sakta hoon ki Snort inspection ke liye Fastpath, Trust, Allow aur Block ka kya matlab hai.</li>
<li>Main <code>packet-tracer</code> chala aur padh sakta hoon, UN-NAT phase, CSM_FW_ACL_ rule-id aur remark, aur SNORT phase samet.</li>
<li>Main NAT ke dono taraf capture kar sakta hoon, <code>trace detail</code> jod sakta hoon, <code>show capture NAME packet-number 1 trace</code> padh sakta hoon, asp-drop captures aur <code>capture-traffic</code> use kar sakta hoon, aur saaf-safai kar sakta hoon.</li>
<li>Main <code>show conn</code> (N samet flags), <code>show xlate</code>, <code>show nat</code> hit counters, <code>show access-control-config</code> Rule Hits, <code>show asp drop</code> aur <code>show snort statistics</code> padh sakta hoon.</li>
<li>Main Unified Events mein connection, SI aur intrusion events dhoondh sakta hoon aur Action, rule aur Reason interpret kar sakta hoon.</li>
<li>Main filters ke saath <code>system support firewall-engine-debug</code> aur <code>system support trace</code> chala sakta hoon aur verdicts padh sakta hoon.</li>
<li>Main registration (<code>configure manager add</code>, TCP 8305, key aur NAT ID), deployment failures (Deployment History transcript, rollback), health alerts troubleshoot kar sakta hoon, aur troubleshoot files generate kar sakta hoon.</li>
<li>Main NAT aur routing faults diagnose kar sakta hoon aur SI aur intrusion blocks narrowly aur safely theek kar sakta hoon.</li>
<li>Main INC-8177 end to end chala sakta hoon aur dono faults samjha sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Symptom se tool map">
<rect x="10" y="20" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="12">Kya aata hai?</text>
<rect x="330" y="20" width="300" height="36" rx="8" fill="#bae6fd"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="12">ingress par capture</text>
<rect x="10" y="64" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="87" text-anchor="middle" class="svg-ink" font-size="12">Kaunsa phase / rule drop karta hai?</text>
<rect x="330" y="64" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="87" text-anchor="middle" class="svg-ink" font-size="12">packet-tracer, capture trace</text>
<rect x="10" y="108" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="131" text-anchor="middle" class="svg-ink" font-size="12">Snort ne kya decide kiya?</text>
<rect x="330" y="108" width="300" height="36" rx="8" fill="#ddd6fe"/><text x="480" y="131" text-anchor="middle" class="svg-ink" font-size="12">Unified Events, system support trace</text>
<rect x="10" y="152" width="300" height="36" rx="8" fill="#e2e8f0"/><text x="160" y="175" text-anchor="middle" class="svg-ink" font-size="12">Kya device sync mein hai?</text>
<rect x="330" y="152" width="300" height="36" rx="8" fill="#fde68a"/><text x="480" y="175" text-anchor="middle" class="svg-ink" font-size="12">Deployment History, Health Monitor</text>
</svg><p class="cap">Chapter 1 ke chaar sawaal aur har ek ka jawab dene wala tool.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LINA</dt><dd>FTD mein ASA-based data plane: interfaces, routing, NAT, connections, L3/L4 policy, VPN.</dd>
<dt>Snort 3</dt><dd>Inspection engine: SI, application identification, access control L7 matching, intrusion, file aur malware.</dd>
<dt>CSM_FW_ACL_</dt><dd>Access control policy se compile hui LINA access list; entries rule-ids aur remarks rakhti hain.</dd>
<dt>rule-id 268434432</dt><dd>Access control policy ka default action.</dd>
<dt>Prefilter / Fastpath</dt><dd>Access control se pehle evaluate hone wali LINA policy; Fastpath Snort bypass karta hai.</dd>
<dt>Trust</dt><dd>Snort mein decide hone wala access control action; flow ka baaki hissa bina inspection fast-forward hota hai.</dd>
<dt>ASP drop</dt><dd>LINA ke accelerated security path se drop hue packets ke counters, reason code ke saath.</dd>
<dt>Unified Events</dt><dd>Management Center view jo connection, SI, intrusion, file aur malware events jodta hai.</dd>
<dt>sftunnel</dt><dd>FTD aur Management Center ke beech encrypted management tunnel, TCP 8305.</dd>
<dt>Troubleshoot file</dt><dd>TAC ke liye diagnostic bundle, Health Monitor ya <code>system generate-troubleshoot</code> se.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Fix location</td><td>Device par diagnose, Management Center mein fix, Deploy</td></tr>
<tr><td>UN-NAT phase nahi</td><td>Koi static NAT destination se match nahi karta</td></tr>
<tr><td>Access rules aur NAT</td><td>Rules real address use karti hain</td></tr>
<tr><td>Default action</td><td>rule-id 268434432</td></tr>
<tr><td>show conn mein N flag</td><td>Snort ne inspect kiya</td></tr>
<tr><td>asp drop mein snort-drop</td><td>Snort verdict, LINA rule nahi</td></tr>
<tr><td>Reason IP / URL / DNS Block</td><td>Security Intelligence</td></tr>
<tr><td>Inline Result</td><td>Dropped = blocked; Would have dropped = pass hua</td></tr>
<tr><td>Block rule logging</td><td>Sirf connection ke beginning par</td></tr>
<tr><td>Management tunnel</td><td>TCP 8305; key aur NAT ID match hone chahiye</td></tr>
<tr><td>tcp-not-syn</td><td>Aam taur par asymmetric routing</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code">&gt; packet-tracer input outside tcp 198.51.100.10 40000 203.0.113.3 443 [detailed]
&gt; capture CAP interface outside trace detail match tcp any host 203.0.113.3
&gt; show capture CAP packet-number 1 trace
&gt; capture ASP type asp-drop all
&gt; capture-traffic
&gt; no capture CAP
&gt; show conn address 10.0.2.10
&gt; show xlate
&gt; show nat detail
&gt; show access-control-config
&gt; clear asp drop
&gt; show asp drop
&gt; show snort statistics
&gt; show route
&gt; system support firewall-engine-debug
&gt; system support trace
&gt; show managers
&gt; configure manager add 192.0.2.50 Nk-RegKey-01
&gt; sftunnel-status-brief
&gt; system generate-troubleshoot all</pre>

<div class="warn"><p><b>Aakhri reminders.</b> Wahi packet simulate karo jo client sach mein bhejta hai. Reproduce karne se pehle counters clear karo. Deep debugging se pehle sync aur health check karo. Narrowly fix karo, deploy karo, verify karo, captures hatao, document karo.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Prefilter access control se pehle chalta hai; Snort mein SI access control rules se pehle chalta hai; UN-NAT ACL se pehle chalta hai; Block rules sirf beginning par log karti hain; Fastpath Trust nahi hai; "Out of date" matlab Deploy.</p></div>

<div class="scn"><h4>Woh interview jo whiteboard ban gaya</h4><p>Security operations role ki ek candidate ko INC-8177 whiteboard question ke roop mein diya gaya. Usne LINA aur Snort ko do boxes ki tarah draw kiya, upar flow likha, aur nau steps zor se bolkar chalaye: capture, bina UN-NAT ka packet-tracer, .5 dikhata show nat, mapped address wali Portal-In, Management Center mein do fixes, deploy, events. Panel ne chhe minute baad use roka aur salary ki baat par aa gaya.</p><p><b>Seekh:</b> saaf bola gaya structured method experience ka sabse convincing saboot hai.</p></div>

<div class="iv"><p class="q">"ASA aur FTD troubleshoot karne mein kya farak hai?"</p><p>LINA tools same hain (packet-tracer, capture, show conn, asp drop), lekin FTD Snort jodta hai, isliye aap SNORT phases, Snort verdicts, Reason ke saath Unified Events, aur Snort debugs bhi check karte ho. Policy CLI par configure nahi hoti: aap Management Center mein fix karte ho aur deploy karte ho, aur aapko deployment status, health aur registration check karna padta hai. Rules CSM_FW_ACL_ rule-ids use karti hain jo rule names se map hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar sawaal: arrival, LINA decision, Snort decision, device sync mein.</li>
<li>Evidence ke liye device CLI, fixes ke liye Management Center, apply karne ke liye Deploy.</li>
<li>Key rule-ids, flags, asp drop reasons aur event Reasons zubaani yaad rakho.</li>
<li>Management-plane health (registration, deployment, health alerts) data-plane debugging se pehle aati hai.</li>
<li>Security blocks narrowly theek karo aur har exception document karo.</li>
</ul></div>
`}};export{e as default};