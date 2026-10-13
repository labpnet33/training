var e={id:`troubleshooting-workflow`,h:{en:`Verification and the reachability troubleshooting workflow`,hi:`Verification aur reachability troubleshooting workflow`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes the temperature, checks the pulse, then orders tests in a sensible order. Network troubleshooting is the same: a fixed order of questions saves hours. This chapter gives you the order for SD-WAN reachability tickets and replays the two troubleshooting labs with it.</p>

<h3>The verification toolkit</h3>
<table class="cmp"><tr><th>Command</th><th>Where</th><th>What it answers</th></tr>
<tr><td><code>show interfaces brief</code></td><td>branch</td><td>Is each port up with the right address?</td></tr>
<tr><td><code>show route</code> (optionally with a routing instance)</td><td>any VOS</td><td>Is there a route, and what is the next hop?</td></tr>
<tr><td><code>ping &lt;ip&gt;</code></td><td>any VOS, PC</td><td>Can this device reach that address? (From the PC it tests the whole path.)</td></tr>
<tr><td><code>show orgs org Acme sd-wan brief</code></td><td>branch</td><td>Overlay state, per-tunnel state and the failure reason</td></tr>
<tr><td><code>show orgs org Acme sd-wan wan-interfaces</code></td><td>branch</td><td>Transport mapping, address and circuit quality</td></tr>
<tr><td><code>show orgs org Acme sd-wan sla-monitor status</code></td><td>branch</td><td>Measured latency, jitter and loss per transport</td></tr>
<tr><td><code>show orgs org Acme sd-wan sites</code></td><td>branch or Controller</td><td>Which sites and LAN prefixes are known</td></tr>
<tr><td><code>show bgp neighbor brief</code></td><td>branch or Controller</td><td>MP-BGP session state</td></tr></table>
<div class="note"><p>These commands follow the public Versa documentation style, but the course model is simplified: real VOS has many more views, filters and a monitoring GUI in the Director and Analytics. Learn the logic; on real equipment you will adapt the syntax.</p></div>

<h3>The workflow: from the bottom up</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Troubleshooting workflow">
<rect x="150" y="10" width="340" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up, correct address (LAN and WAN)</text>
<rect x="150" y="62" width="340" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">2. Underlay route and ping to Controller</text>
<rect x="150" y="114" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="13">3. Identity: organization, site-id, Controller</text>
<rect x="150" y="166" width="340" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">4. Tunnels and MP-BGP state</text>
<rect x="150" y="218" width="340" height="40" rx="8" fill="#fed7aa"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="13">5. Prefix known? Policy, return path, host test</text>
<text x="320" y="280" text-anchor="middle" class="svg-muted" font-size="12">Do not jump a step; each layer depends on the one below</text>
</svg><p class="cap">Five questions, bottom to top.</p></div>
<ol>
<li><b>Interfaces.</b> A down port or missing address kills everything above (vs-lan-advertise lived here).</li>
<li><b>Underlay.</b> Route in the transport VR, next hop in the connected subnet, ping the Controller address of that transport (vs-mpls-route lived here).</li>
<li><b>Identity.</b> Organization, site-id, Controller address and WAN mappings (vs-tenant-mismatch lived here).</li>
<li><b>Overlay state.</b> Tunnel table and BGP: which tunnels are up, why not.</li>
<li><b>Prefix and path.</b> Is the destination LAN listed on the source branch? Then policy, return path and host settings.</li>
</ol>
<div class="eg"><p><b>Quick symptom map.</b> Interface down: layer 1 or admin state. Tunnel down with reason "unreachable": underlay route. Overlay Idle with an organization message: identity. Overlay Established but site shows no LAN prefix: origin LAN interface. Prefix present but ping fails: policy, return route, host gateway.</p></div>

<h3>Replay 1: vs-mpls-route</h3>
<p>Step 1 passes (vni-0/1 up, 172.31.1.2/30). Step 2: <code>show orgs org Acme sd-wan brief</code> shows MPLS down with "Controller MPLS address 172.31.100.2 is unreachable". Inspect the MPLS transport VR: next hop 172.31.1.5 is outside 172.31.1.0/30. Correct it to 172.31.1.1, commit, and the SLA monitor lists MPLS up with values. Total time under five minutes, no carrier ticket needed.</p>

<h3>Replay 2: vs-tenant-mismatch</h3>
<p>Steps 1 and 2 pass (all interfaces up, underlay pings work). Step 3: <code>show orgs org Guest sd-wan brief</code> says "Controller organization is Acme, branch uses Guest". Delete the Guest statements, recreate site-id 103, Controller 198.51.100.20 and the three WAN mappings under Acme, commit, then <code>ping 10.1.1.10</code> from PC3.</p>

<h3>A worked decision example</h3>
<pre class="out">admin@Branch1-cli&gt; ping 10.1.2.10
From 10.1.2.10 icmp_seq=1 Destination Host Unreachable
4 packets transmitted, 0 received, 100% packet loss
admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
<span class="hl">Branch2      102      -</span>
Branch3      103      10.1.3.0/24</pre>
<p>The source branch lists Branch2 with no prefix. Do not touch policy or MPLS. Go to Bengaluru and inspect its LAN interface. One look at the symptom map saved a long investigation.</p>

<h3>Habits of good engineers</h3>
<ul>
<li>Change one thing, commit, test, then decide.</li>
<li>Use <code>show | compare</code> before commit and <code>rollback</code> when unsure.</li>
<li>Test from the user side at the end.</li>
<li>Write down the evidence line that proved the cause; it becomes the ticket note.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Starting at policy when the interface is down; fixing without verifying that the symptom is gone; testing with a router ping and declaring victory; changing several things at once so the cause is never known.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overlay "Established" with one tunnel down is a <b>partial</b> failure. The overlay needs just one tunnel up, so users may not notice a dead transport until the last one fails.</p></div>

<div class="scn"><h4>Three tickets, one afternoon</h4><p>On the same afternoon a NOC received three tickets: a store with no LAN reachability, a branch with a dead MPLS tunnel and a pilot site that would not join. Using the bottom-up order, the engineer fixed an unconfigured LAN port, a wrong next hop and a wrong organization name, in that order, each in under ten minutes, without opening a carrier case.</p><p><b>Lesson:</b> a fixed order beats intuition.</p></div>
<div class="iv"><p class="q">"Users at branch A cannot reach branch B. Walk me through your approach."</p><p>I verify interfaces and addresses at both ends, underlay routes and Controller reachability, SD-WAN identity, tunnel and BGP state, then whether each LAN prefix is listed on the opposite branch. After that I check policy, return path and host gateway. I finish with a ping from a PC and note the evidence.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom up: interface, underlay, identity, overlay, prefix and path.</li>
<li>The tunnel Reason column and BGP state usually point to the failing layer.</li>
<li>sites table shows which LAN prefixes each branch has learned.</li>
<li>One change at a time; verify with a user-side ping.</li>
<li>Established with one tunnel down is a partial failure.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh puchhti hai dard kahan hai, temperature leti hai, pulse check karti hai, phir sensible order mein tests likhti hai. Network troubleshooting bhi waise hi hai: sawaalon ka fixed order ghante bachata hai. Yeh chapter SD-WAN reachability tickets ka order deta hai aur do troubleshooting labs ko usi order se replay karta hai.</p>

<h3>Verification toolkit</h3>
<table class="cmp"><tr><th>Command</th><th>Kahan</th><th>Kya jawab deta hai</th></tr>
<tr><td><code>show interfaces brief</code></td><td>branch</td><td>Kya har port sahi address ke saath up hai?</td></tr>
<tr><td><code>show route</code> (optionally routing instance ke saath)</td><td>koi bhi VOS</td><td>Route hai, aur next hop kya hai?</td></tr>
<tr><td><code>ping &lt;ip&gt;</code></td><td>koi bhi VOS, PC</td><td>Kya yeh device us address tak pahunch sakta hai? (PC se poora path test hota hai.)</td></tr>
<tr><td><code>show orgs org Acme sd-wan brief</code></td><td>branch</td><td>Overlay state, per-tunnel state aur failure reason</td></tr>
<tr><td><code>show orgs org Acme sd-wan wan-interfaces</code></td><td>branch</td><td>Transport mapping, address aur circuit quality</td></tr>
<tr><td><code>show orgs org Acme sd-wan sla-monitor status</code></td><td>branch</td><td>Har transport ka measured latency, jitter aur loss</td></tr>
<tr><td><code>show orgs org Acme sd-wan sites</code></td><td>branch ya Controller</td><td>Kaunsi sites aur LAN prefixes known hain</td></tr>
<tr><td><code>show bgp neighbor brief</code></td><td>branch ya Controller</td><td>MP-BGP session state</td></tr></table>
<div class="note"><p>Yeh commands public Versa documentation style follow karte hain, par course model simplified hai: real VOS mein bahut zyada views, filters aur Director aur Analytics mein monitoring GUI hota hai. Logic seekho; real equipment par syntax adapt kar loge.</p></div>

<h3>Workflow: neeche se upar</h3>
<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="Troubleshooting workflow">
<rect x="150" y="10" width="340" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">1. Interface up, sahi address (LAN aur WAN)</text>
<rect x="150" y="62" width="340" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="13">2. Underlay route aur Controller tak ping</text>
<rect x="150" y="114" width="340" height="40" rx="8" fill="#fde68a"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="13">3. Identity: organization, site-id, Controller</text>
<rect x="150" y="166" width="340" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="191" text-anchor="middle" class="svg-ink" font-size="13">4. Tunnels aur MP-BGP state</text>
<rect x="150" y="218" width="340" height="40" rx="8" fill="#fed7aa"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="13">5. Prefix known? Policy, return path, host test</text>
<text x="320" y="280" text-anchor="middle" class="svg-muted" font-size="12">Koi step skip mat karo; har layer neeche wali par depend karti hai</text>
</svg><p class="cap">Paanch sawaal, neeche se upar.</p></div>
<ol>
<li><b>Interfaces.</b> Down port ya missing address uske upar sab kuch maar deta hai (vs-lan-advertise yahin tha).</li>
<li><b>Underlay.</b> Transport VR mein route, next hop connected subnet mein, us transport ke Controller address ko ping (vs-mpls-route yahin tha).</li>
<li><b>Identity.</b> Organization, site-id, Controller address aur WAN mappings (vs-tenant-mismatch yahin tha).</li>
<li><b>Overlay state.</b> Tunnel table aur BGP: kaunse tunnels up hain, nahi to kyun.</li>
<li><b>Prefix aur path.</b> Kya destination LAN source branch par listed hai? Phir policy, return path aur host settings.</li>
</ol>
<div class="eg"><p><b>Quick symptom map.</b> Interface down: layer 1 ya admin state. Tunnel down aur reason "unreachable": underlay route. Overlay Idle aur organization message: identity. Overlay Established par site ka LAN prefix nahi: origin LAN interface. Prefix present par ping fail: policy, return route, host gateway.</p></div>

<h3>Replay 1: vs-mpls-route</h3>
<p>Step 1 pass (vni-0/1 up, 172.31.1.2/30). Step 2: <code>show orgs org Acme sd-wan brief</code> MPLS down dikhata hai "Controller MPLS address 172.31.100.2 is unreachable" ke saath. MPLS transport VR dekho: next hop 172.31.1.5 172.31.1.0/30 ke bahar hai. Ise 172.31.1.1 karo, commit karo, aur SLA monitor MPLS ko values ke saath up list karta hai. Total time paanch minute se kam, carrier ticket ki zaroorat nahi.</p>

<h3>Replay 2: vs-tenant-mismatch</h3>
<p>Step 1 aur 2 pass (saare interfaces up, underlay pings chalte hain). Step 3: <code>show orgs org Guest sd-wan brief</code> kehta hai "Controller organization is Acme, branch uses Guest". Guest statements delete karo, site-id 103, Controller 198.51.100.20 aur teen WAN mappings Acme ke under dobara banao, commit karo, phir PC3 se <code>ping 10.1.1.10</code>.</p>

<h3>Ek worked decision example</h3>
<pre class="out">admin@Branch1-cli&gt; ping 10.1.2.10
From 10.1.2.10 icmp_seq=1 Destination Host Unreachable
4 packets transmitted, 0 received, 100% packet loss
admin@Branch1-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
<span class="hl">Branch2      102      -</span>
Branch3      103      10.1.3.0/24</pre>
<p>Source branch Branch2 ko bina prefix ke list karti hai. Policy ya MPLS ko mat chhuo. Bengaluru jaakar uska LAN interface dekho. Symptom map ki ek nazar ne lambi investigation bacha li.</p>

<h3>Achhe engineers ki aadatein</h3>
<ul>
<li>Ek cheez badlo, commit karo, test karo, phir faisla lo.</li>
<li>Commit se pehle <code>show | compare</code> aur shaq ho to <code>rollback</code> use karo.</li>
<li>End mein user-side se test karo.</li>
<li>Jis evidence line ne cause prove kiya use likh lo; woh ticket note ban jaati hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Interface down hone par policy se shuru karna; fix karke yeh verify na karna ki symptom gaya; router ping se test karke jeet declare karna; kai cheezein ek saath badalna taaki cause kabhi pata na chale.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek tunnel down ke saath overlay "Established" <b>partial</b> failure hai. Overlay ko sirf ek tunnel up chahiye, isliye users ko dead transport tab tak nahi dikhta jab tak aakhri nahi girta.</p></div>

<div class="scn"><h4>Ek dopahar, teen tickets</h4><p>Ek hi dopahar NOC ko teen tickets mile: ek store jisme LAN reachability nahi, ek branch jisme MPLS tunnel dead, aur ek pilot site jo join nahi ho rahi. Bottom-up order se engineer ne unconfigured LAN port, galat next hop aur galat organization naam, isi order mein, har ek das minute se kam mein fix kiya, bina carrier case khole.</p><p><b>Seekh:</b> fixed order intuition se behtar hai.</p></div>
<div class="iv"><p class="q">"Branch A ke users branch B tak nahi pahunch pa rahe. Apna approach batao."</p><p>Pehle dono ends par interfaces aur addresses verify karta hoon, underlay routes aur Controller reachability, SD-WAN identity, tunnel aur BGP state, phir yeh ki har LAN prefix opposite branch par listed hai ya nahi. Uske baad policy, return path aur host gateway. Aakhir mein PC se ping karta hoon aur evidence note karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom up troubleshoot karo: interface, underlay, identity, overlay, prefix aur path.</li>
<li>Tunnel Reason column aur BGP state aam taur par failing layer ki taraf ishara karte hain.</li>
<li>sites table dikhati hai ki har branch ne kaunse LAN prefixes seekhe.</li>
<li>Ek samay mein ek change; user-side ping se verify karo.</li>
<li>Ek tunnel down ke saath Established partial failure hai.</li>
</ul></div>
`}};export{e as default};