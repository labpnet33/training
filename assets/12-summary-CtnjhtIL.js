var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with four boxes and one question: who does what. You can now describe the headend, link it, send logs to it and find which component owns a fault. This chapter is your revision sheet.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="90" y="64" text-anchor="middle" class="svg-muted" font-size="12">templates, API</text>
<rect x="180" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="250" y="64" text-anchor="middle" class="svg-muted" font-size="12">IKE, MP-BGP</text>
<rect x="340" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="410" y="46" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="410" y="64" text-anchor="middle" class="svg-muted" font-size="12">logs, reports</text>
<rect x="500" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">VOS</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<text x="90" y="110" text-anchor="middle" class="svg-muted" font-size="12">set director ...</text><text x="250" y="110" text-anchor="middle" class="svg-muted" font-size="12">transport-domains</text><text x="410" y="110" text-anchor="middle" class="svg-muted" font-size="12">log-collector</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">log-exporter</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Management, control, data: change at the owner, prove with show</text>
</svg><p class="cap">The module on one slide.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the three planes and place Director, Controller, Analytics, Concerto and VOS in them.</li>
<li>Explain templates, device groups, bind data, workflows, RBAC and the northbound API.</li>
<li>Explain what the Controller does: IKE trust, MP-BGP, transport domains, redundancy.</li>
<li>Trace the log pipeline from branch exporter to dashboards and state retention trade-offs.</li>
<li>Explain single-pass, organizations, VRs and vni interfaces.</li>
<li>Describe headend interfaces, DMZ, the ports to open and why the Controller has Internet and MPLS addresses.</li>
<li>Walk through the onboarding sequence and the states.</li>
<li>Complete <code>vs-headend-link</code>, <code>vs-analytics-logs</code> and <code>vs-transport-domain</code>.</li>
<li>Use the method: symptom, plane, component, evidence, fix, proof.</li>
</ul>

<h3>Command cheat-sheet (course CLI)</h3>
<table class="cmp"><tr><th>On</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Controller</td><td><code>set system director 198.51.100.10</code><br><code>set orgs org Acme sd-wan wan-interfaces vni-0/N transport T</code><br><code>set orgs org Acme sd-wan transport-domains T</code></td><td><code>show system director status</code><br><code>show orgs org Acme sd-wan transport-domains</code><br><code>show orgs org Acme sd-wan sites</code><br><code>show bgp neighbor brief</code></td></tr>
<tr><td>Director</td><td><code>set director controllers Controller-1 address 198.51.100.20</code><br><code>set director analytics address 198.51.100.30</code></td><td><code>show controllers</code><br><code>show analytics</code><br><code>show devices brief</code></td></tr>
<tr><td>Analytics</td><td><code>set analytics log-collector enable true</code><br><code>set analytics log-collector port 1234</code></td><td><code>show analytics log-collector status</code><br><code>show analytics sources</code></td></tr>
<tr><td>Branch</td><td><code>set orgs org-services Acme log-exporter destination 198.51.100.30</code></td><td><code>show orgs org Acme sd-wan brief</code><br><code>show orgs org Acme sd-wan sla-monitor status</code><br><code>show orgs org-services Acme log-exporter</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VOS / FlexVNF</dt><dd>Versa Operating System and its network function software; single-pass, multi-tenant.</dd>
<dt>Organization</dt><dd>A tenant. Acme is the lab organization.</dd>
<dt>Transport domain</dt><dd>Group of circuits that can reach each other; tunnels form inside a domain.</dd>
<dt>Bind data</dt><dd>Per-device values (site-id, addresses) combined with a template.</dd>
<dt>Staging / ZTP</dt><dd>First contact of a new device using its serial and a Controller address.</dd>
<dt>MP-BGP</dt><dd>Multiprotocol BGP used between branch and Controller to carry SD-WAN routes.</dd>
<dt>Log exporter / collector</dt><dd>Branch-side sender and Analytics-side receiver of logs.</dd>
<dt>Concerto</dt><dd>Optional orchestrator above the Director.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Director = management and configuration, not in the data path; Controller = control; VOS = data.</li>
<li>The Controller needs a WAN interface and a transport domain for each transport.</li>
<li>Overlay Established when at least one tunnel is up.</li>
<li>Serial not in the Director means Rejected.</li>
<li>Analytics outage costs visibility, not connectivity.</li>
</ul>

<div class="exam"><p><b>Exam trap.</b> Check the <i>owner</i>. Many questions give a correct fix on the wrong device.</p></div>

<div class="warn"><p><b>Common mistake.</b> Remembering only commands. Interviews ask why: why separation, why Controller addresses per transport, why Director is not in the data path.</p></div>

<div class="note"><p><b>Course model reminder.</b> The CLI is a simplified learning model. Practise the real Director GUI workflows, certificates, HA and security features on a real Versa lab when you can.</p></div>

<div class="scn"><h4>The first week on a new SD-WAN job</h4><p>A new engineer receives three tickets: no logs from Delhi, Kolkata stuck in staging, MPLS down only on Delhi. Using the method she assigns the owners (Analytics chain, Director link or serial, Controller domain), fixes each at the owner and attaches the show output as proof. Her manager notes that it was fast because she did not touch unrelated boxes.</p><p><b>Lesson:</b> ownership thinking is a senior skill you can start using today.</p></div>

<div class="iv"><p class="q">"Walk me through a Versa headend and what you would check first when a branch has no overlay."</p><p>Describe the planes and boxes, then say: branch overlay summary and tunnel reasons first, then Controller sites and BGP, then Director registration and serial, then underlay reachability. Quote the evidence and change only at the owner.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the planes and the owner of every symptom.</li>
<li>Know the three lab fixes by heart.</li>
<li>Always verify on the receiving side and read per-transport reasons.</li>
<li>Next: versa-onboard (templates and zero-touch) and versa-policy (SLA and path selection).</li>
</ul></div>
`,hi:`
<p>Aapne yeh module chaar boxes aur ek sawaal se shuru kiya: kaun kya karta hai. Ab aap headend describe kar sakte ho, use link kar sakte ho, usko logs bhej sakte ho aur dhundh sakte ho ki fault kaunsa component own karta hai. Yeh chapter aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="90" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="90" y="64" text-anchor="middle" class="svg-muted" font-size="12">templates, API</text>
<rect x="180" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="250" y="64" text-anchor="middle" class="svg-muted" font-size="12">IKE, MP-BGP</text>
<rect x="340" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="410" y="46" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text><text x="410" y="64" text-anchor="middle" class="svg-muted" font-size="12">logs, reports</text>
<rect x="500" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="560" y="46" text-anchor="middle" class="svg-ink" font-size="13">VOS</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">data plane</text>
<text x="90" y="110" text-anchor="middle" class="svg-muted" font-size="12">set director ...</text><text x="250" y="110" text-anchor="middle" class="svg-muted" font-size="12">transport-domains</text><text x="410" y="110" text-anchor="middle" class="svg-muted" font-size="12">log-collector</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="12">log-exporter</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Management, control, data: owner par change, show se proof</text>
</svg><p class="cap">Poora module ek slide par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Teen planes ke naam batao aur Director, Controller, Analytics, Concerto aur VOS ko unmein rakho.</li>
<li>Templates, device groups, bind data, workflows, RBAC aur northbound API explain karo.</li>
<li>Explain karo Controller kya karta hai: IKE trust, MP-BGP, transport domains, redundancy.</li>
<li>Branch exporter se dashboards tak log pipeline trace karo aur retention trade-offs batao.</li>
<li>Single-pass, organizations, VRs aur vni interfaces explain karo.</li>
<li>Headend interfaces, DMZ, kholne wale ports aur Controller ke Internet aur MPLS addresses ka reason batao.</li>
<li>Onboarding sequence aur states walk through karo.</li>
<li><code>vs-headend-link</code>, <code>vs-analytics-logs</code> aur <code>vs-transport-domain</code> complete karo.</li>
<li>Method use karo: symptom, plane, component, evidence, fix, proof.</li>
</ul>

<h3>Command cheat-sheet (course CLI)</h3>
<table class="cmp"><tr><th>Kahan</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Controller</td><td><code>set system director 198.51.100.10</code><br><code>set orgs org Acme sd-wan wan-interfaces vni-0/N transport T</code><br><code>set orgs org Acme sd-wan transport-domains T</code></td><td><code>show system director status</code><br><code>show orgs org Acme sd-wan transport-domains</code><br><code>show orgs org Acme sd-wan sites</code><br><code>show bgp neighbor brief</code></td></tr>
<tr><td>Director</td><td><code>set director controllers Controller-1 address 198.51.100.20</code><br><code>set director analytics address 198.51.100.30</code></td><td><code>show controllers</code><br><code>show analytics</code><br><code>show devices brief</code></td></tr>
<tr><td>Analytics</td><td><code>set analytics log-collector enable true</code><br><code>set analytics log-collector port 1234</code></td><td><code>show analytics log-collector status</code><br><code>show analytics sources</code></td></tr>
<tr><td>Branch</td><td><code>set orgs org-services Acme log-exporter destination 198.51.100.30</code></td><td><code>show orgs org Acme sd-wan brief</code><br><code>show orgs org Acme sd-wan sla-monitor status</code><br><code>show orgs org-services Acme log-exporter</code></td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VOS / FlexVNF</dt><dd>Versa Operating System aur uska network function software; single-pass, multi-tenant.</dd>
<dt>Organization</dt><dd>Ek tenant. Acme lab organization hai.</dd>
<dt>Transport domain</dt><dd>Un circuits ka group jo ek doosre tak pahunch sakte hain; tunnels domain ke andar bante hain.</dd>
<dt>Bind data</dt><dd>Per-device values (site-id, addresses) jo template ke saath milti hain.</dd>
<dt>Staging / ZTP</dt><dd>Naye device ka pehla contact, uske serial aur Controller address se.</dd>
<dt>MP-BGP</dt><dd>Multiprotocol BGP jo branch aur Controller ke beech SD-WAN routes carry karta hai.</dd>
<dt>Log exporter / collector</dt><dd>Logs ka branch-side bhejne wala aur Analytics-side lene wala.</dd>
<dt>Concerto</dt><dd>Director ke upar optional orchestrator.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Director = management aur configuration, data path mein nahi; Controller = control; VOS = data.</li>
<li>Controller ko har transport ke liye WAN interface aur transport domain chahiye.</li>
<li>Overlay Established tab jab kam se kam ek tunnel up ho.</li>
<li>Serial Director mein nahi ho to Rejected.</li>
<li>Analytics outage visibility ghatata hai, connectivity nahi.</li>
</ul>

<div class="exam"><p><b>Exam trap.</b> <i>Owner</i> check karo. Kai sawaal galat device par sahi fix dete hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf commands yaad rakhna. Interviews "kyun" poochte hain: separation kyun, har transport par Controller addresses kyun, Director data path mein kyun nahi.</p></div>

<div class="note"><p><b>Course model reminder.</b> CLI simplified learning model hai. Jab mauka mile real Versa lab par real Director GUI workflows, certificates, HA aur security features practise karo.</p></div>

<div class="scn"><h4>Nayi SD-WAN job ka pehla hafta</h4><p>Nayi engineer ko teen tickets milte hain: Delhi se logs nahi, Kolkata staging mein atka, MPLS sirf Delhi par down. Method se woh owners assign karti hai (Analytics chain, Director link ya serial, Controller domain), har ek ko owner par fix karti hai aur show output proof ke roop mein attach karti hai. Manager dekhta hai ki kaam tez hua kyunki usne unrelated boxes ko nahi chhua.</p><p><b>Lesson:</b> ownership thinking senior skill hai jo aap aaj se use kar sakte ho.</p></div>

<div class="iv"><p class="q">"Versa headend samjhao aur batao ki branch ka overlay na ho to pehle kya check karoge."</p><p>Planes aur boxes describe karo, phir bolo: pehle branch overlay summary aur tunnel reasons, phir Controller sites aur BGP, phir Director registration aur serial, phir underlay reachability. Evidence quote karo aur sirf owner par change karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Planes aur har symptom ka owner jaano.</li>
<li>Teeno lab fixes zubani yaad rakho.</li>
<li>Hamesha receiving side par verify karo aur per-transport reasons padho.</li>
<li>Aage: versa-onboard (templates aur zero-touch) aur versa-policy (SLA aur path selection).</li>
</ul></div>
`}};export{e as default};