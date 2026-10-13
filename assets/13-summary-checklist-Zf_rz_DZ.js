var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have reached the end of the operations module. Think of this chapter as the pilot's pre-flight checklist: short, ordered, and used every time. Read it before the labs, before an interview and before a real maintenance window.</p>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="14" width="620" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Loop: monitor, detect, triage, fix, verify, document</text>
<rect x="10" y="58" width="300" height="34" rx="6" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="12">Watch: tunnels, SLA, load, state, headend, logs</text>
<rect x="330" y="58" width="300" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Read: Analytics with scope, freshness, baseline</text>
<rect x="10" y="102" width="300" height="34" rx="6" fill="#fde68a"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot: 7 layers, bottom-up</text>
<rect x="330" y="102" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">Protect: HA, changes, RBAC, certificates</text>
<rect x="10" y="146" width="620" height="34" rx="6" fill="#fed7aa"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="12">Labs: circuit outage, silent logs, capstone with three faults</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">Evidence first, smallest change, proof, written record</text>
</svg><p class="cap">Everything in this module hangs off the operations loop.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready when you can do all of these without notes:</p>
<ul>
<li>Describe the six steps of the operations loop and scope a complaint with three questions.</li>
<li>List seven things to monitor and give a baseline and threshold for path quality.</li>
<li>Read an Analytics chart with scope, time zone, freshness, baseline and aggregation in mind.</li>
<li>Run the course kit in order and say which device owns which view.</li>
<li>Walk the seven layers bottom-up and say what each failing layer looks like in the tunnel table.</li>
<li>Handle vs-circuit-outage: gather evidence, open a carrier ticket, prove continuity, confirm voice path, verify failback.</li>
<li>Handle vs-log-silence: compare exporter and Analytics source list, repair destination, verify both ends.</li>
<li>Handle vs-capstone-incident: fix the underlay route, the MPLS binding and the voice match, one commit each, with proof.</li>
<li>Explain what stops when a circuit, CPE, Controller, Director or Analytics fails.</li>
<li>Make a change safely: backup, candidate, show | compare, commit, verify, pilot, exit plan.</li>
<li>Write an incident report and a handover note.</li>
</ul>

<h3>Command cheat-sheet (course CLI)</h3>
<pre class="code"><span class="c">! operational mode, run in this order on a branch</span>
show orgs org Acme sd-wan brief
show interfaces brief
show route
ping 198.51.100.20
show orgs org Acme sd-wan wan-interfaces
show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan sites
show orgs org Acme sd-wan path-selection application voice
show orgs org-services Acme sd-wan policies
show orgs org-services Acme log-exporter
show bgp neighbor brief
<span class="c">! Analytics</span>
show analytics log-collector status
show analytics sources
<span class="c">! configuration pattern</span>
configure
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme log-exporter destination 198.51.100.30
show | compare
commit
exit</pre>

<h3>Key facts of the lab topology</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Director DIR / Controller CTL / Analytics ANA</td><td>198.51.100.10 / 198.51.100.20 / 198.51.100.30</td></tr>
<tr><td>Delhi Branch1 (site-id 101)</td><td>Internet 203.0.113.6/30 (carrier .5), MPLS 172.31.1.2/30, LTE 100.64.1.2/30, LAN 10.1.1.0/24</td></tr>
<tr><td>Bengaluru Branch2 (site-id 102)</td><td>Internet 203.0.113.10/30 (carrier .9), MPLS 172.31.2.2/30, LAN 10.1.2.0/24</td></tr>
<tr><td>Default circuit quality (latency/jitter/loss)</td><td>Internet 30/6/0.3, MPLS 20/2/0.05, LTE 60/15/1</td></tr>
<tr><td>VOICE SLA / VOICE-FP</td><td>150 ms, 30 ms, 1 percent / MPLS then Internet, fallback allow</td></tr>
<tr><td>Tunnel up requires</td><td>interface up and addressed, circuit not down, Controller has the transport and domain, Controller reachable</td></tr>
<tr><td>MP-BGP Established requires</td><td>at least one tunnel up and consistent organization, site-id and Controller</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>The carrier transport networks that carry the tunnels (Internet, MPLS, LTE).</dd>
<dt>Overlay</dt><dd>Tunnels and MP-BGP session built across the underlay by the SD-WAN.</dd>
<dt>SLA profile</dt><dd>Limits for latency, jitter and loss that a path must meet.</dd>
<dt>Forwarding profile</dt><dd>Transport priority list, SLA profile and fallback behaviour used by a policy rule.</dd>
<dt>Exporter / collector</dt><dd>Branch side that sends logs, and Analytics side that receives them.</dd>
<dt>Blast radius</dt><dd>The number of sites or users a change can affect.</dd>
<dt>RBAC</dt><dd>Role-based access control with least privilege.</dd>
<dt>Candidate configuration</dt><dd>Uncommitted draft that can be compared and discarded.</dd>
<dt>Failback</dt><dd>Returning to normal paths after a failure is repaired.</dd>
<dt>Blameless report</dt><dd>An incident report that focuses on controls and facts, not on people.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Interface up with tunnel down and reason circuit down means a provider fault.</li>
<li>No row in the tunnel table means the interface is not bound to a transport.</li>
<li>Overlay Established means at least one tunnel is up, not all.</li>
<li>Path selection: first matching rule, first transport that is up and meets the SLA; no match means load balancing.</li>
<li>One site silent in Analytics means its exporter or path; all silent means the collector.</li>
<li>Analytics and Director outages do not stop user traffic.</li>
<li>Rollback before commit discards the draft; it does not undo a commit.</li>
<li>Always verify what must stay blocked, not only what must work.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Memorising commands without the layers they test; stopping at the first fix; no negative test; no report.</p></div>
<div class="exam"><p><b>Exam trap.</b> The course CLI is simplified. On real VOS and in vendor exams use the real syntax for your release; the method and the questions stay the same.</p></div>

<div class="scn"><h4>Putting it together on a Monday</h4><p>The week begins with three tickets. Delhi Internet is down (circuit outage): evidence, carrier ticket, continuity proof. The security team cannot find Delhi logs (silent telemetry): compare ends, fix destination. And Bengaluru is isolated after a weekend change (capstone): three layers, three commits. The engineer who has practised the loop closes all three by lunch, with notes, because each ticket follows the same boring routine.</p><p><b>Lesson:</b> a routine turns different incidents into the same job.</p></div>

<div class="iv"><p class="q">"What are the most important habits of a good SD-WAN operator?"</p><p>Scope first, evidence before opinion, walk the layers bottom-up, change one thing at a time with compare and verify, prove both positive and negative requirements, keep redundancy tested, and write things down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The operations loop is the backbone of the module.</li>
<li>Seven layers and a fixed command order make troubleshooting repeatable.</li>
<li>Telemetry, redundancy, change control and access control are part of operations, not extras.</li>
<li>Verify with positive and negative tests and finish with a written record.</li>
<li>Practise the three labs until the routine feels boring.</li>
</ul></div>
`,hi:`
<p>Aap operations module ke end tak pahunch gaye. Is chapter ko pilot ki pre-flight checklist ki tarah socho: chhoti, ordered, aur har baar use hone wali. Ise labs se pehle, interview se pehle aur real maintenance window se pehle padho.</p>

<h3>Module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Module summary">
<rect x="10" y="14" width="620" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Loop: monitor, detect, triage, fix, verify, document</text>
<rect x="10" y="58" width="300" height="34" rx="6" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="12">Dekho: tunnels, SLA, load, state, headend, logs</text>
<rect x="330" y="58" width="300" height="34" rx="6" fill="#ddd6fe"/><text x="480" y="80" text-anchor="middle" class="svg-ink" font-size="12">Padho: Analytics scope, freshness, baseline ke saath</text>
<rect x="10" y="102" width="300" height="34" rx="6" fill="#fde68a"/><text x="160" y="124" text-anchor="middle" class="svg-ink" font-size="12">Troubleshoot: 7 layers, bottom-up</text>
<rect x="330" y="102" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">Protect: HA, changes, RBAC, certificates</text>
<rect x="10" y="146" width="620" height="34" rx="6" fill="#fed7aa"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="12">Labs: circuit outage, silent logs, teen faults wala capstone</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="13">Pehle evidence, smallest change, proof, written record</text>
</svg><p class="cap">Is module ki har cheez operations loop se judi hai.</p></div>

<h3>Can-do checklist</h3>
<p>Aap tab ready ho jab ye sab bina notes ke kar sako:</p>
<ul>
<li>Operations loop ke chhe steps batao aur teen sawalon se complaint scope karo.</li>
<li>Saat cheezein monitor karne ki list do aur path quality ke liye baseline aur threshold batao.</li>
<li>Analytics chart ko scope, time zone, freshness, baseline aur aggregation dhyan mein rakhkar padho.</li>
<li>Course kit order mein chalao aur batao kaunsa device kaunsa view own karta hai.</li>
<li>Saat layers bottom-up walk karo aur batao har failing layer tunnel table mein kaisi dikhti hai.</li>
<li>vs-circuit-outage handle karo: evidence, carrier ticket, continuity proof, voice path confirm, failback verify.</li>
<li>vs-log-silence handle karo: exporter aur Analytics source list compare, destination repair, dono ends verify.</li>
<li>vs-capstone-incident handle karo: underlay route, MPLS binding aur voice match fix, har ek ek commit mein, proof ke saath.</li>
<li>Samjhao circuit, CPE, Controller, Director ya Analytics fail hone par kya rukta hai.</li>
<li>Safely change karo: backup, candidate, show | compare, commit, verify, pilot, exit plan.</li>
<li>Incident report aur handover note likho.</li>
</ul>

<h3>Command cheat-sheet (course CLI)</h3>
<pre class="code"><span class="c">! operational mode, branch par isi order mein chalao</span>
show orgs org Acme sd-wan brief
show interfaces brief
show route
ping 198.51.100.20
show orgs org Acme sd-wan wan-interfaces
show orgs org Acme sd-wan sla-monitor status
show orgs org Acme sd-wan sites
show orgs org Acme sd-wan path-selection application voice
show orgs org-services Acme sd-wan policies
show orgs org-services Acme log-exporter
show bgp neighbor brief
<span class="c">! Analytics</span>
show analytics log-collector status
show analytics sources
<span class="c">! configuration pattern</span>
configure
set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
set orgs org-services Acme log-exporter destination 198.51.100.30
show | compare
commit
exit</pre>

<h3>Lab topology ke key facts</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Director DIR / Controller CTL / Analytics ANA</td><td>198.51.100.10 / 198.51.100.20 / 198.51.100.30</td></tr>
<tr><td>Delhi Branch1 (site-id 101)</td><td>Internet 203.0.113.6/30 (carrier .5), MPLS 172.31.1.2/30, LTE 100.64.1.2/30, LAN 10.1.1.0/24</td></tr>
<tr><td>Bengaluru Branch2 (site-id 102)</td><td>Internet 203.0.113.10/30 (carrier .9), MPLS 172.31.2.2/30, LAN 10.1.2.0/24</td></tr>
<tr><td>Default circuit quality (latency/jitter/loss)</td><td>Internet 30/6/0.3, MPLS 20/2/0.05, LTE 60/15/1</td></tr>
<tr><td>VOICE SLA / VOICE-FP</td><td>150 ms, 30 ms, 1 percent / MPLS phir Internet, fallback allow</td></tr>
<tr><td>Tunnel up ke liye</td><td>interface up aur addressed, circuit down nahi, Controller ke paas transport aur domain, Controller reachable</td></tr>
<tr><td>MP-BGP Established ke liye</td><td>kam se kam ek tunnel up aur consistent organization, site-id aur Controller</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Underlay</dt><dd>Carrier transport networks jo tunnels carry karte hain (Internet, MPLS, LTE).</dd>
<dt>Overlay</dt><dd>SD-WAN dwara underlay ke upar bane tunnels aur MP-BGP session.</dd>
<dt>SLA profile</dt><dd>Latency, jitter aur loss ki limits jo path ko meet karni hain.</dd>
<dt>Forwarding profile</dt><dd>Policy rule dwara use hone wali transport priority list, SLA profile aur fallback behaviour.</dd>
<dt>Exporter / collector</dt><dd>Branch side jo logs bhejta hai, aur Analytics side jo receive karta hai.</dd>
<dt>Blast radius</dt><dd>Kitni sites ya users ko change affect kar sakta hai.</dd>
<dt>RBAC</dt><dd>Least privilege ke saath role-based access control.</dd>
<dt>Candidate configuration</dt><dd>Uncommitted draft jise compare aur discard kiya ja sakta hai.</dd>
<dt>Failback</dt><dd>Failure repair hone ke baad normal paths par wapas aana.</dd>
<dt>Blameless report</dt><dd>Incident report jo controls aur facts par focus karti hai, logon par nahi.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>Interface up aur tunnel down reason circuit down ke saath matlab provider fault.</li>
<li>Tunnel table mein row nahi matlab interface kisi transport se bound nahi.</li>
<li>Overlay Established matlab kam se kam ek tunnel up, sab nahi.</li>
<li>Path selection: pehla matching rule, pehla transport jo up ho aur SLA meet kare; match nahi to load balancing.</li>
<li>Analytics mein ek site silent matlab uska exporter ya path; sab silent matlab collector.</li>
<li>Analytics aur Director outages user traffic nahi rokte.</li>
<li>Commit se pehle rollback draft discard karta hai; commit undo nahi karta.</li>
<li>Hamesha verify karo ki kya blocked rehna chahiye, sirf ye nahi ki kya chalna chahiye.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Commands ratna bina ye jaane ki wo kaunsi layer test karte hain; pehli fix par ruk jana; negative test na karna; report na likhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Course CLI simplified hai. Real VOS aur vendor exams mein apni release ka real syntax use karo; method aur sawal wahi rehte hain.</p></div>

<div class="scn"><h4>Monday ko sab saath</h4><p>Hafta teen tickets se shuru hota hai. Delhi Internet down hai (circuit outage): evidence, carrier ticket, continuity proof. Security team ko Delhi ke logs nahi mil rahe (silent telemetry): ends compare, destination fix. Aur weekend ke change ke baad Bengaluru isolate hai (capstone): teen layers, teen commits. Jis engineer ne loop practise kiya hai wo teeno lunch tak notes ke saath close kar deta hai, kyunki har ticket wahi boring routine follow karta hai.</p><p><b>Lesson:</b> routine alag alag incidents ko ek hi kaam bana deti hai.</p></div>

<div class="iv"><p class="q">"Achhe SD-WAN operator ki sabse zaroori habits kya hain?"</p><p>Pehle scope, opinion se pehle evidence, layers bottom-up, ek time par ek change compare aur verify ke saath, positive aur negative dono requirements prove karna, redundancy tested rakhna, aur sab likhna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations loop module ki backbone hai.</li>
<li>Saat layers aur fixed command order troubleshooting ko repeatable banate hain.</li>
<li>Telemetry, redundancy, change control aur access control operations ka hissa hain, extras nahi.</li>
<li>Positive aur negative tests se verify karo aur written record se khatam karo.</li>
<li>Teeno labs tab tak practise karo jab tak routine boring na lage.</li>
</ul></div>
`}};export{e as default};