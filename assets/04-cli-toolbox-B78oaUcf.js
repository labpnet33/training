var e={id:`cli-toolbox`,h:{en:`The CLI toolbox: course commands and real VOS tools`,hi:`CLI toolbox: course commands aur real VOS tools`},body:{en:`
<p>A mechanic does not carry every tool in the workshop to every job. He carries a small kit he knows by heart: a torch, a multimeter, a few spanners. Your troubleshooting kit is the same: a short list of show commands that you run in a fixed order and read fluently. This chapter lists the course kit, says what each command proves, and shows how it corresponds to the real Versa tools.</p>

<div class="note"><p><b>Important.</b> The course CLI is a <b>simplified learning model</b>. Prompts are <code>admin@Branch1-cli&gt;</code> for operational mode and <code>admin@Branch1-cli%</code> for configuration mode. The real VOS CLI, the Director GUI and Analytics have many more commands and views, and exact syntax varies by release. <code>path-selection</code> and the <code>request ...</code> forms are course helpers. Learn the <b>purpose</b> of each command; on real equipment look up the equivalent in the documentation for your release.</p></div>

<h3>Which device, which question</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where to run commands">
<rect x="10" y="20" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Branch (VOS CPE)</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">local truth: tunnels,</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">paths, routes, exporter</text>
<rect x="175" y="20" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Controller CTL</text><text x="250" y="64" text-anchor="middle" class="svg-muted" font-size="12">which sites, which BGP</text><text x="250" y="78" text-anchor="middle" class="svg-muted" font-size="12">neighbours are up</text>
<rect x="340" y="20" width="150" height="70" rx="8" fill="#fde68a"/><text x="415" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director DIR</text><text x="415" y="64" text-anchor="middle" class="svg-muted" font-size="12">devices, templates,</text><text x="415" y="78" text-anchor="middle" class="svg-muted" font-size="12">deployment state</text>
<rect x="505" y="20" width="125" height="70" rx="8" fill="#bbf7d0"/><text x="567" y="46" text-anchor="middle" class="svg-ink" font-size="13">Analytics ANA</text><text x="567" y="64" text-anchor="middle" class="svg-muted" font-size="12">collector, sources</text>
<rect x="10" y="120" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">PCs (PC1, PC2, PC3): the user's view. ping from a PC proves service end to end.</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">Always finish with a test from where the user sits.</text>
</svg><p class="cap">Ask the device that owns the truth. The branch knows its tunnels; the Controller knows who is connected; Analytics knows who is logging.</p></div>

<h3>The kit, in the order you use it</h3>
<table class="cmp"><tr><th>Command (course CLI)</th><th>Where</th><th>What it proves</th></tr>
<tr><td><code>show interfaces brief</code></td><td>any VOS device</td><td>Admin and oper state and address of every interface (layer 1 and 2 plus IP).</td></tr>
<tr><td><code>show route</code></td><td>any VOS device</td><td>The routing table: default routes in the transport VRs, LAN routes, overlay-learned prefixes.</td></tr>
<tr><td><code>ping &lt;ip&gt;</code></td><td>any VOS device, PCs</td><td>Basic reachability. From a branch it tests the underlay or the overlay depending on the target.</td></tr>
<tr><td><code>show orgs org Acme sd-wan brief</code></td><td>branch</td><td>Site-id, Controller, MP-BGP state and a tunnel table with a reason for each down tunnel.</td></tr>
<tr><td><code>show orgs org Acme sd-wan wan-interfaces</code></td><td>branch</td><td>Which interface maps to which transport, oper state, address, and circuit latency/jitter/loss.</td></tr>
<tr><td><code>show orgs org Acme sd-wan sla-monitor status</code></td><td>branch</td><td>Measured quality per transport and whether it meets each SLA profile.</td></tr>
<tr><td><code>show orgs org Acme sd-wan sites</code></td><td>branch</td><td>Remote sites and the LAN prefixes learned over MP-BGP.</td></tr>
<tr><td><code>show orgs org Acme sd-wan path-selection application voice</code></td><td>branch</td><td>(Course helper.) What the policy would choose now for an application, and why.</td></tr>
<tr><td><code>show orgs org-services Acme sd-wan sla-profiles | forwarding-profiles | policies</code></td><td>branch</td><td>The intent: thresholds, transport priorities, rules.</td></tr>
<tr><td><code>show orgs org-services Acme log-exporter</code></td><td>branch</td><td>Log destination and status of the export.</td></tr>
<tr><td><code>show bgp neighbor brief</code></td><td>branch, Controller</td><td>Overlay MP-BGP state. On the Controller it lists every branch neighbour.</td></tr>
<tr><td><code>show system staging status</code></td><td>branch</td><td>Onboarding state and its detail.</td></tr>
<tr><td><code>show system director status</code></td><td>Controller</td><td>Director address and link state.</td></tr>
<tr><td><code>show devices brief</code></td><td>Director</td><td>Each device, group, deployed revision, onboarding and overlay state.</td></tr>
<tr><td><code>show analytics log-collector status</code></td><td>Analytics</td><td>Collector enabled or disabled, port, active sources.</td></tr>
<tr><td><code>show analytics sources</code></td><td>Analytics</td><td>Which branches are exporting.</td></tr>
<tr><td><code>show configuration</code>, <code>show | compare</code></td><td>branch</td><td>Running config; difference from the candidate before commit.</td></tr>
</table>

<h3>How this maps to real Versa</h3>
<p>Real VOS gives you the same families of tools: interface and routing show commands, BGP neighbour views, SD-WAN site and path views, SLA monitor results, ping and traceroute from a chosen routing instance, packet capture style monitoring, and configuration commands with commit, compare and rollback. The Director GUI shows device status, template deployment and alarms, and the Analytics GUI gives the dashboards from chapter 3. The names and exact outputs differ; the <b>questions</b> are identical: is the interface up, is there a route, is the tunnel up, is BGP established, does the path meet SLA, is the policy choosing what I expect.</p>

<h3>Reading the output with intent</h3>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24

admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=<span class="hl">1.5</span> ms
64 bytes from 198.51.100.20: icmp_seq=2 ttl=63 time=1.6 ms
64 bytes from 198.51.100.20: icmp_seq=3 ttl=63 time=1.7 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=63 time=1.8 ms
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Train your eyes on three things: state words (<b>up, down, Idle, Established</b>), the <b>reason</b> column, and addresses. Most faults in this course are visible as a wrong address, a missing row or a reason text.</p>

<div class="eg"><p><b>Worked example.</b> A fixed order for any branch complaint takes under two minutes: (1) <code>show orgs org Acme sd-wan brief</code> for tunnels and BGP, (2) <code>show interfaces brief</code> if a tunnel is down, (3) <code>show orgs org Acme sd-wan sla-monitor status</code> if tunnels are up but users complain, (4) <code>show orgs org Acme sd-wan path-selection application voice</code> for policy, (5) a ping from the affected PC. Write the order in your runbook; under stress you will follow it without thinking.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running commands on the wrong device (a branch cannot show Controller views); forgetting you are in configuration mode when you type a show command; changing config before collecting evidence; pasting output into a ticket without the command and the time.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember which device owns which view. <code>show analytics sources</code> exists only on Analytics; <code>show devices brief</code> only on the Director. A question that asks "where do you check which branches are exporting logs" has Analytics as the answer, not the branch.</p></div>

<div class="scn"><h4>Fifteen minutes saved by an order</h4><p>Two engineers answered the same complaint. The first logged into the Director GUI and clicked through configuration screens for twenty minutes. The second ran the five-command order from the runbook and saw in the first command that the Internet tunnel was down with reason circuit down, so he opened the carrier ticket in three minutes and moved on to continuity checks.</p><p><b>Lesson:</b> a fixed order beats browsing.</p></div>

<div class="iv"><p class="q">"Which commands do you run first on a branch with a complaint?"</p><p>Tunnel and BGP summary, then interfaces and routes if something is down, SLA monitor if tunnels are up, policy path result for the application, and a ping from the user's side. Add that you note the time and keep output as evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a short, fixed kit of commands in a fixed order.</li>
<li>Ask the device that owns the truth: branch, Controller, Director or Analytics.</li>
<li>The course CLI is simplified; real VOS has equivalents with different syntax per release.</li>
<li>Read state words, reason columns and addresses first.</li>
<li>Finish every check with a test from the user's side.</li>
</ul></div>
`,hi:`
<p>Mechanic har kaam par workshop ke saare tools nahi le jata. Wo chhoti si kit rakhta hai jise aap ratte hue jaante ho: torch, multimeter, kuch spanners. Aapki troubleshooting kit bhi aisi hi hai: show commands ki chhoti list jo aap fixed order mein chalate ho aur fluently padhte ho. Ye chapter course kit batata hai, har command kya prove karta hai ye batata hai, aur dikhata hai ki wo real Versa tools se kaise match hota hai.</p>

<div class="note"><p><b>Important.</b> Course CLI ek <b>simplified learning model</b> hai. Operational mode ka prompt <code>admin@Branch1-cli&gt;</code> aur configuration mode ka <code>admin@Branch1-cli%</code> hai. Real VOS CLI, Director GUI aur Analytics mein bahut zyada commands aur views hain, aur exact syntax release ke hisaab se badalta hai. <code>path-selection</code> aur <code>request ...</code> forms course helpers hain. Har command ka <b>purpose</b> seekho; real equipment par apni release ki documentation mein equivalent dekho.</p></div>

<h3>Kaunsa device, kaunsa sawal</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where to run commands">
<rect x="10" y="20" width="150" height="70" rx="8" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="13">Branch (VOS CPE)</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">local truth: tunnels,</text><text x="85" y="78" text-anchor="middle" class="svg-muted" font-size="12">paths, routes, exporter</text>
<rect x="175" y="20" width="150" height="70" rx="8" fill="#ddd6fe"/><text x="250" y="46" text-anchor="middle" class="svg-ink" font-size="13">Controller CTL</text><text x="250" y="64" text-anchor="middle" class="svg-muted" font-size="12">kaunsi sites, kaunse BGP</text><text x="250" y="78" text-anchor="middle" class="svg-muted" font-size="12">neighbours up hain</text>
<rect x="340" y="20" width="150" height="70" rx="8" fill="#fde68a"/><text x="415" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director DIR</text><text x="415" y="64" text-anchor="middle" class="svg-muted" font-size="12">devices, templates,</text><text x="415" y="78" text-anchor="middle" class="svg-muted" font-size="12">deployment state</text>
<rect x="505" y="20" width="125" height="70" rx="8" fill="#bbf7d0"/><text x="567" y="46" text-anchor="middle" class="svg-ink" font-size="13">Analytics ANA</text><text x="567" y="64" text-anchor="middle" class="svg-muted" font-size="12">collector, sources</text>
<rect x="10" y="120" width="620" height="60" rx="8" fill="#e2e8f0"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">PCs (PC1, PC2, PC3): user ka view. PC se ping end to end service prove karta hai.</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">Hamesha wahan se test karke khatam karo jahan user baitha hai.</text>
</svg><p class="cap">Us device se pucho jo truth rakhta hai. Branch apne tunnels jaanta hai; Controller jaanta hai kaun connected hai; Analytics jaanta hai kaun log bhej raha hai.</p></div>

<h3>Kit, usi order mein jisme use hoti hai</h3>
<table class="cmp"><tr><th>Command (course CLI)</th><th>Kahan</th><th>Kya prove karta hai</th></tr>
<tr><td><code>show interfaces brief</code></td><td>koi bhi VOS device</td><td>Har interface ki admin aur oper state aur address (layer 1, 2 aur IP).</td></tr>
<tr><td><code>show route</code></td><td>koi bhi VOS device</td><td>Routing table: transport VRs ki default routes, LAN routes, overlay se seekhe prefixes.</td></tr>
<tr><td><code>ping &lt;ip&gt;</code></td><td>koi bhi VOS device, PCs</td><td>Basic reachability. Branch se target ke hisaab se underlay ya overlay test hota hai.</td></tr>
<tr><td><code>show orgs org Acme sd-wan brief</code></td><td>branch</td><td>Site-id, Controller, MP-BGP state aur har down tunnel ke reason ke saath tunnel table.</td></tr>
<tr><td><code>show orgs org Acme sd-wan wan-interfaces</code></td><td>branch</td><td>Kaunsa interface kaunse transport se mapped hai, oper state, address, aur circuit latency/jitter/loss.</td></tr>
<tr><td><code>show orgs org Acme sd-wan sla-monitor status</code></td><td>branch</td><td>Har transport ki measured quality aur kya wo har SLA profile meet karti hai.</td></tr>
<tr><td><code>show orgs org Acme sd-wan sites</code></td><td>branch</td><td>Remote sites aur MP-BGP se seekhe LAN prefixes.</td></tr>
<tr><td><code>show orgs org Acme sd-wan path-selection application voice</code></td><td>branch</td><td>(Course helper.) Policy abhi application ke liye kya chunegi aur kyun.</td></tr>
<tr><td><code>show orgs org-services Acme sd-wan sla-profiles | forwarding-profiles | policies</code></td><td>branch</td><td>Intent: thresholds, transport priorities, rules.</td></tr>
<tr><td><code>show orgs org-services Acme log-exporter</code></td><td>branch</td><td>Log destination aur export ka status.</td></tr>
<tr><td><code>show bgp neighbor brief</code></td><td>branch, Controller</td><td>Overlay MP-BGP state. Controller par har branch neighbour list hota hai.</td></tr>
<tr><td><code>show system staging status</code></td><td>branch</td><td>Onboarding state aur uska detail.</td></tr>
<tr><td><code>show system director status</code></td><td>Controller</td><td>Director address aur link state.</td></tr>
<tr><td><code>show devices brief</code></td><td>Director</td><td>Har device, group, deployed revision, onboarding aur overlay state.</td></tr>
<tr><td><code>show analytics log-collector status</code></td><td>Analytics</td><td>Collector enabled ya disabled, port, active sources.</td></tr>
<tr><td><code>show analytics sources</code></td><td>Analytics</td><td>Kaunse branches export kar rahe hain.</td></tr>
<tr><td><code>show configuration</code>, <code>show | compare</code></td><td>branch</td><td>Running config; commit se pehle candidate ka difference.</td></tr>
</table>

<h3>Real Versa se mapping</h3>
<p>Real VOS wahi tool families deta hai: interface aur routing show commands, BGP neighbour views, SD-WAN site aur path views, SLA monitor results, chune hue routing instance se ping aur traceroute, packet capture style monitoring, aur commit, compare aur rollback wale configuration commands. Director GUI device status, template deployment aur alarms dikhata hai, aur Analytics GUI chapter 3 ke dashboards deta hai. Naam aur exact outputs alag hote hain; <b>sawal</b> wahi hain: interface up hai, route hai, tunnel up hai, BGP established hai, path SLA meet karta hai, policy wahi chun rahi hai jo main expect karta hoon.</p>

<h3>Output ko intent ke saath padho</h3>
<pre class="out">admin@Branch1-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.6/30
vni-0/1     up      up      172.31.1.2/30
vni-0/2     up      up      100.64.1.2/30
vni-0/3     up      up      10.1.1.1/24

admin@Branch1-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
64 bytes from 198.51.100.20: icmp_seq=1 ttl=63 time=<span class="hl">1.5</span> ms
64 bytes from 198.51.100.20: icmp_seq=2 ttl=63 time=1.6 ms
64 bytes from 198.51.100.20: icmp_seq=3 ttl=63 time=1.7 ms
64 bytes from 198.51.100.20: icmp_seq=4 ttl=63 time=1.8 ms
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Apni aankhein teen cheezon par train karo: state words (<b>up, down, Idle, Established</b>), <b>reason</b> column, aur addresses. Is course ke zyadatar faults galat address, missing row ya reason text ke roop mein dikhte hain.</p>

<div class="eg"><p><b>Worked example.</b> Kisi bhi branch complaint ke liye fixed order do minute se kam leta hai: (1) tunnels aur BGP ke liye <code>show orgs org Acme sd-wan brief</code>, (2) tunnel down ho to <code>show interfaces brief</code>, (3) tunnels up hain par users complain karein to <code>show orgs org Acme sd-wan sla-monitor status</code>, (4) policy ke liye <code>show orgs org Acme sd-wan path-selection application voice</code>, (5) affected PC se ping. Order apni runbook mein likho; stress mein aap bina soche follow karoge.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Galat device par commands chalana (branch Controller views nahi dikha sakta); ye bhoolna ki aap configuration mode mein ho jab show command type karte ho; evidence collect karne se pehle config badalna; command aur time ke bina output ticket mein paste karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaunsa device kaunsa view own karta hai. <code>show analytics sources</code> sirf Analytics par hai; <code>show devices brief</code> sirf Director par. "Kaun se branches logs export kar rahe hain ye kahan check karoge" ka jawab Analytics hai, branch nahi.</p></div>

<div class="scn"><h4>Order ne bachaye pandrah minute</h4><p>Do engineers ne same complaint li. Pehle ne Director GUI mein login karke bees minute configuration screens click kiye. Doosre ne runbook ka paanch-command order chalaya aur pehle command mein dekha ki Internet tunnel down hai reason circuit down ke saath, to usne teen minute mein carrier ticket khol diya aur continuity checks par aage badh gaya.</p><p><b>Lesson:</b> fixed order browsing se behtar hai.</p></div>

<div class="iv"><p class="q">"Complaint wali branch par sabse pehle kaunse commands chalate ho?"</p><p>Tunnel aur BGP summary, phir kuch down ho to interfaces aur routes, tunnels up hon to SLA monitor, application ka policy path result, aur user ki taraf se ping. Ye bhi kaho ki aap time note karte ho aur output ko evidence ki tarah rakhte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Commands ki chhoti, fixed kit fixed order mein use karo.</li>
<li>Us device se pucho jo truth rakhta hai: branch, Controller, Director ya Analytics.</li>
<li>Course CLI simplified hai; real VOS mein release ke hisaab se alag syntax ke equivalents hain.</li>
<li>Pehle state words, reason columns aur addresses padho.</li>
<li>Har check user ki taraf ke test se khatam karo.</li>
</ul></div>
`}};export{e as default};