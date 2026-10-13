var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: which component owns the fault (lab 3)`,hi:`Troubleshooting workflow: fault kaunsa component own karta hai (lab 3)`},body:{en:`
<p>A hospital emergency desk first asks <b>where does it hurt</b>, then sends the patient to the right department. A good SD-WAN engineer does the same: before typing any fix, decide which component owns the symptom. Fixing the wrong box is the most common and most expensive mistake.</p>

<h3>The method: symptom, plane, component, evidence, fix, proof</h3>
<ol>
<li><b>Symptom.</b> Write it in one sentence with the site and the time.</li>
<li><b>Plane.</b> Is it management (cannot configure, no logs), control (overlay Idle, routes missing) or data (traffic path, SLA, loss)?</li>
<li><b>Component.</b> Pick the likely owner from the table below.</li>
<li><b>Evidence.</b> Read the show commands on that component and its neighbour. Quote the exact reason text.</li>
<li><b>Fix.</b> Change only the faulty statement, at the owner.</li>
<li><b>Proof.</b> Re-run the same show commands and show the symptom gone.</li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Owner</th><th>First command</th></tr>
<tr><td>New branch never leaves staging</td><td>Controller or Director link, serial</td><td><code>show system staging status</code> on the branch</td></tr>
<tr><td>Overlay Idle on one branch</td><td>Branch config (tenant, site-id, controller address) or underlay</td><td><code>show orgs org Acme sd-wan brief</code></td></tr>
<tr><td>Same transport down on many branches</td><td>Controller (interface, domain) or provider</td><td><code>show orgs org Acme sd-wan transport-domains</code> on the Controller</td></tr>
<tr><td>One circuit down, provider says OK</td><td>Per-transport tunnel reason decides</td><td>tunnel table, then <code>ping</code></td></tr>
<tr><td>No logs or dashboards</td><td>Branch exporter, Analytics collector, Director registration</td><td><code>show analytics sources</code></td></tr>
<tr><td>Cannot push config</td><td>Director, device group/template, bind data</td><td><code>show devices device Branch3</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting decision flow">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Tunnel table: which transport?</text>
<rect x="20" y="95" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">interface down / no IP</text><text x="105" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: branch</text>
<rect x="235" y="95" width="170" height="50" rx="8" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">circuit down</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: provider</text>
<rect x="450" y="95" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">domain / interface missing</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: Controller</text>
<rect x="235" y="185" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">address unreachable</text><text x="320" y="223" text-anchor="middle" class="svg-muted" font-size="12">owner: underlay path</text>
<line x1="270" y1="50" x2="130" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="510" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="145" x2="320" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">The reason text in the tunnel table points to the owner.</p></div>

<h3>Lab 3: vs-transport-domain, walked through</h3>
<p><b>Ticket.</b> Delhi has Internet, MPLS and LTE. The overlay is up but the MPLS tunnel is down, and the MPLS provider shows healthy. Decide which component owns the fault, fix it there, and prove three tunnels.</p>
<p><b>Step 1: read the evidence on Branch1.</b></p>
<pre class="code">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief</pre>
<pre class="out">Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    down    <span class="hl">transport domain MPLS is missing on the Controller</span>
LTE        vni-0/2    up      -</pre>
<p><b>Step 2: decide the owner.</b> The reason is not "interface down" (branch), not "circuit down (provider fault)" (provider), and not "unreachable" (underlay). It names the <b>Controller</b>. Confirm there:</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
LTE</pre>
<p>MPLS is absent. Do not touch the branch: its configuration has no <code>transport-domains</code> statement at all, and the lab checks that you did not add one there.</p>
<p><b>Step 3: fix at the owner.</b></p>
<pre class="code">admin@Controller-1-cli&gt; configure
admin@Controller-1-cli% set orgs org Acme sd-wan transport-domains MPLS
admin@Controller-1-cli% commit
admin@Controller-1-cli% exit</pre>
<p><b>Step 4: prove it.</b></p>
<pre class="code">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status</pre>
<pre class="out">Transport  State  Latency  Jitter  Loss    Meets SLA profile
Internet   up     30 ms    6 ms    0.3 %   VOICE=NO
MPLS       <span class="hl">up</span>     20 ms    2 ms    0.05 %  VOICE=yes
LTE        up     60 ms    15 ms   1 %     VOICE=yes</pre>
<p>Three tunnels are up, and the SLA monitor reports the quality of each. The next module, versa-policy, uses exactly this table.</p>

<div class="eg"><p><b>Worked example: other reason texts, other owners.</b> If the reason were <code>Controller MPLS address 172.31.100.2 is unreachable</code>, you would test <code>ping 172.31.100.2</code> from Branch1, look at <code>MPLS-Transport-VR</code> routes and ask the MPLS provider. If it were <code>Controller has no MPLS WAN interface</code>, the Controller needs <code>wan-interfaces vni-0/1 transport MPLS</code> first.</p></div>

<div class="note"><p><b>Course model.</b> The reason strings are written for learning; real VOS shows state through many commands (IKE and IPsec state, BGP neighbours, service nodes, alarms). The method is identical: use the closest evidence to the symptom and quote it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Rebooting or "re-doing the branch" because the overlay is Idle. A reboot hides the evidence and fixes nothing. Collect evidence first.</p></div>

<div class="exam"><p><b>Exam trap.</b> A statement saying "provider shows healthy" does not mean the SD-WAN tunnel is healthy. Provider health proves only the circuit layer.</p></div>

<div class="scn"><h4>Fifty branches lost MPLS after a Controller upgrade</h4><p>After a planned Controller upgrade, MPLS tunnels went down on all branches while Internet tunnels stayed up. The network team suspected the MPLS provider. The tunnel reason on every branch was the same: the transport domain was missing. A configuration restore step had skipped one statement. Re-adding the domain on the Controller restored all 50 branches in a single commit, and the provider was never involved.</p><p><b>Lesson:</b> identical symptoms on many branches point to the shared component.</p></div>

<div class="iv"><p class="q">"One tunnel is down but the provider is fine. What next?"</p><p>Read the tunnel reason, classify it by owner (branch, provider, Controller, underlay), confirm on the owner with a show command, fix only that statement and prove with the tunnel and SLA tables. Mention comparing with a healthy branch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: symptom, plane, component, evidence, fix, proof.</li>
<li>Reason text names the owner; same symptom on many branches means a central cause.</li>
<li>For vs-transport-domain the fix is <code>set orgs org Acme sd-wan transport-domains MPLS</code> on the Controller.</li>
<li>Prove with the tunnel table and <code>sla-monitor status</code>.</li>
</ul></div>
`,hi:`
<p>Hospital ka emergency desk pehle poochta hai <b>dard kahan hai</b>, phir patient ko sahi department bhejta hai. Achha SD-WAN engineer bhi yahi karta hai: fix type karne se pehle tay karo ki symptom kaunsa component own karta hai. Galat box fix karna sabse common aur sabse mehnga mistake hai.</p>

<h3>Method: symptom, plane, component, evidence, fix, proof</h3>
<ol>
<li><b>Symptom.</b> Ek line mein likho, site aur time ke saath.</li>
<li><b>Plane.</b> Management (configure nahi hota, logs nahi), control (overlay Idle, routes missing) ya data (traffic path, SLA, loss)?</li>
<li><b>Component.</b> Neeche ki table se likely owner chuno.</li>
<li><b>Evidence.</b> Us component aur uske neighbour par show commands padho. Exact reason text quote karo.</li>
<li><b>Fix.</b> Sirf faulty statement badlo, owner par.</li>
<li><b>Proof.</b> Wahi show commands dobara chalao aur symptom gaya hua dikhao.</li>
</ol>

<table class="cmp"><tr><th>Symptom</th><th>Owner</th><th>Pehla command</th></tr>
<tr><td>Naya branch staging se aage nahi badhta</td><td>Controller ya Director link, serial</td><td>Branch par <code>show system staging status</code></td></tr>
<tr><td>Ek branch par overlay Idle</td><td>Branch config (tenant, site-id, controller address) ya underlay</td><td><code>show orgs org Acme sd-wan brief</code></td></tr>
<tr><td>Kai branches par same transport down</td><td>Controller (interface, domain) ya provider</td><td>Controller par <code>show orgs org Acme sd-wan transport-domains</code></td></tr>
<tr><td>Ek circuit down, provider kehta hai OK</td><td>Per-transport tunnel reason tay karta hai</td><td>tunnel table, phir <code>ping</code></td></tr>
<tr><td>Logs ya dashboards nahi</td><td>Branch exporter, Analytics collector, Director registration</td><td><code>show analytics sources</code></td></tr>
<tr><td>Config push nahi hoti</td><td>Director, device group/template, bind data</td><td><code>show devices device Branch3</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting decision flow">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Tunnel table: kaunsa transport?</text>
<rect x="20" y="95" width="170" height="50" rx="8" fill="#bae6fd"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">interface down / no IP</text><text x="105" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: branch</text>
<rect x="235" y="95" width="170" height="50" rx="8" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">circuit down</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: provider</text>
<rect x="450" y="95" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">domain / interface missing</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">owner: Controller</text>
<rect x="235" y="185" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">address unreachable</text><text x="320" y="223" text-anchor="middle" class="svg-muted" font-size="12">owner: underlay path</text>
<line x1="270" y1="50" x2="130" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="95" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="510" y2="95" stroke="#64748b" stroke-width="2"/><line x1="320" y1="145" x2="320" y2="185" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
</svg><p class="cap">Tunnel table ka reason text owner ki taraf ishara karta hai.</p></div>

<h3>Lab 3: vs-transport-domain, step by step</h3>
<p><b>Ticket.</b> Delhi ke paas Internet, MPLS aur LTE hain. Overlay up hai lekin MPLS tunnel down hai, aur MPLS provider healthy dikhata hai. Tay karo ki fault kaunsa component own karta hai, wahin fix karo, aur teen tunnels prove karo.</p>
<p><b>Step 1: Branch1 par evidence padho.</b></p>
<pre class="code">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief</pre>
<pre class="out">Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (Controller-1)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    down    <span class="hl">transport domain MPLS is missing on the Controller</span>
LTE        vni-0/2    up      -</pre>
<p><b>Step 2: owner tay karo.</b> Reason "interface down" (branch) nahi hai, "circuit down (provider fault)" (provider) nahi hai, aur "unreachable" (underlay) nahi hai. Yeh <b>Controller</b> ka naam leta hai. Wahan confirm karo:</p>
<pre class="out">admin@Controller-1-cli&gt; show orgs org Acme sd-wan transport-domains
Transport domain
Internet
LTE</pre>
<p>MPLS gayab hai. Branch ko mat chhuo: uski configuration mein <code>transport-domains</code> statement hai hi nahi, aur lab check karta hai ki aapne wahan koi add nahi kiya.</p>
<p><b>Step 3: owner par fix karo.</b></p>
<pre class="code">admin@Controller-1-cli&gt; configure
admin@Controller-1-cli% set orgs org Acme sd-wan transport-domains MPLS
admin@Controller-1-cli% commit
admin@Controller-1-cli% exit</pre>
<p><b>Step 4: prove karo.</b></p>
<pre class="code">admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status</pre>
<pre class="out">Transport  State  Latency  Jitter  Loss    Meets SLA profile
Internet   up     30 ms    6 ms    0.3 %   VOICE=NO
MPLS       <span class="hl">up</span>     20 ms    2 ms    0.05 %  VOICE=yes
LTE        up     60 ms    15 ms   1 %     VOICE=yes</pre>
<p>Teen tunnels up hain, aur SLA monitor har ek ki quality batata hai. Agla module, versa-policy, isi table ko use karta hai.</p>

<div class="eg"><p><b>Worked example: doosre reason texts, doosre owners.</b> Agar reason <code>Controller MPLS address 172.31.100.2 is unreachable</code> hota, to aap Branch1 se <code>ping 172.31.100.2</code> test karte, <code>MPLS-Transport-VR</code> routes dekhte aur MPLS provider se poochte. Agar <code>Controller has no MPLS WAN interface</code> hota, to Controller ko pehle <code>wan-interfaces vni-0/1 transport MPLS</code> chahiye.</p></div>

<div class="note"><p><b>Course model.</b> Reason strings seekhne ke liye likhi gayi hain; real VOS state kai commands se dikhata hai (IKE aur IPsec state, BGP neighbours, service nodes, alarms). Method wahi hai: symptom ke sabse kareeb ka evidence use karo aur use quote karo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Overlay Idle hone par reboot karna ya "branch dobara banana". Reboot evidence chhupa deta hai aur kuch fix nahi karta. Pehle evidence collect karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Provider healthy dikhata hai" ka matlab yeh nahi ki SD-WAN tunnel healthy hai. Provider health sirf circuit layer prove karta hai.</p></div>

<div class="scn"><h4>Controller upgrade ke baad pachas branches ne MPLS khoya</h4><p>Planned Controller upgrade ke baad saari branches par MPLS tunnels down ho gaye jabki Internet tunnels up rahe. Network team ko MPLS provider par shak hua. Har branch par tunnel reason same tha: transport domain missing. Configuration restore step ek statement skip kar gaya tha. Controller par domain dobara add karne se ek commit mein saari 50 branches wapas aa gayi, aur provider kabhi involve nahi hua.</p><p><b>Lesson:</b> kai branches par identical symptoms shared component ki taraf ishara karte hain.</p></div>

<div class="iv"><p class="q">"Ek tunnel down hai lekin provider theek hai. Aage kya?"</p><p>Tunnel reason padho, owner ke hisaab se classify karo (branch, provider, Controller, underlay), owner par show command se confirm karo, sirf wahi statement fix karo aur tunnel aur SLA tables se prove karo. Healthy branch se comparison ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Method: symptom, plane, component, evidence, fix, proof.</li>
<li>Reason text owner batata hai; kai branches par same symptom matlab central cause.</li>
<li>vs-transport-domain ke liye fix Controller par <code>set orgs org Acme sd-wan transport-domains MPLS</code> hai.</li>
<li>Tunnel table aur <code>sla-monitor status</code> se prove karo.</li>
</ul></div>
`}};export{e as default};