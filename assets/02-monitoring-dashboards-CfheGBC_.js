var e={id:`monitoring-dashboards`,h:{en:`Monitoring in the Manager: overview, devices, tunnels, applications, security and VPN`,hi:`Manager mein monitoring: overview, devices, tunnels, applications, security aur VPN`},body:{en:`
<p>A hospital ward has a central monitor showing every patient's pulse. A green line means all is well, an amber line means a nurse should look, a red line means rush. The nurse does not memorise every patient; she reads the board and walks to the bed that needs her. The Manager's <b>Monitor</b> menu is that board for your fabric, from the whole network down to a single tunnel.</p>

<h3>Top-down monitoring: from fabric to device to tunnel</h3>
<p>The best way to use the dashboards is <b>top-down</b>. Start with the whole network and drill into whatever is not green:</p>
<ol>
<li><b>Monitor &gt; Overview</b>: the fabric on one screen. It shows the control-plane status of devices (are controllers and edges connected?), site health, and <b>Site BFD Connectivity</b> in three buckets: <i>Full WAN connectivity</i> (all expected tunnels up), <i>Partial WAN connectivity</i> (some tunnels up, some down) and <i>No WAN connectivity</i> (a site is isolated). It also lists WAN edge inventory, transport health and top applications. A site in <i>Partial</i> is the typical early warning that one circuit is down but the branch still works.</li>
<li><b>Monitor &gt; Devices</b>: the list of every device with its status, reachability, system IP, site ID, software version and health. Select one device to open its own dashboard: interface utilisation, CPU and memory, control connections and BFD summary.</li>
<li><b>Monitor &gt; Tunnels</b>: all data-plane tunnels in a table, up to 10,000 tunnels. Each has measured <b>latency, loss and jitter</b> and a <b>Quality of Experience (QoE)</b> score on a scale of 1 to 10. The tunnel health is classified <i>Good</i>, <i>Fair</i> or <i>Poor</i> from the QoE and the status. This page answers "which transports are bad right now?" before users complain.</li>
<li><b>Monitor &gt; Applications</b>: application usage and performance across the network, from the DPI engine, so you can see which applications use the bandwidth and which sites suffer.</li>
<li><b>Monitor &gt; Security</b>: firewall, IPS, URL filtering and other security activity (see the sdw-sec module).</li>
<li><b>Monitor &gt; VPN</b>: segment-wise view (per service VPN) of traffic and performance.</li>
<li><b>Monitor &gt; Logs</b>: alarms, events and audit logs (chapter 3).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Top-down monitoring">
<rect x="20" y="20" width="600" height="46" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Overview: 72 sites, control status, Site BFD Connectivity</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">Full 71 · Partial 1 · No WAN connectivity 0</text>
<rect x="70" y="86" width="500" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Devices: E-BLR-1, status, reachability, health</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">interfaces, CPU, memory, control connections</text>
<rect x="120" y="152" width="400" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">Tunnels: mpls to E-DEL-1, QoE 3 (Poor)</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">latency 180 ms, loss 4 percent, jitter 35 ms</text>
<rect x="170" y="214" width="300" height="30" rx="8" fill="#fde68a"/><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="13">Real Time: BFD sessions, app-route stats</text>
<line x1="320" y1="66" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><line x1="320" y1="132" x2="320" y2="152" stroke="#64748b" stroke-width="2"/><line x1="320" y1="198" x2="320" y2="214" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Drill down from the whole fabric to one site, one tunnel and then the live data.</p></div>

<h3>Real Time: the CLI inside the GUI</h3>
<p>On a device's page, the <b>Real Time</b> pane (under the device options) runs the same operational queries as the command line, but shows the results as tables you can filter, without logging in to the router: control connections, OMP peers and routes, BFD sessions, app-route statistics, policy information, interface statistics and more. This is the answer to "can engineers troubleshoot without SSH?" and it keeps a record of who looked at what. Because Real Time asks the device for fresh data it is slower than a cached chart, so use it for live checks, not for trending.</p>

<h3>The matching CLI commands</h3>
<p>Every dashboard tile is backed by something you can read on the edge. Learn the pairs so you can cross-check the GUI:</p>
<table class="cmp"><tr><th>GUI view</th><th>CLI on a WAN edge</th></tr>
<tr><td>Control status</td><td><code>show sdwan control connections</code></td></tr>
<tr><td>BFD sessions, site connectivity</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td></tr>
<tr><td>OMP peers, routes, TLOCs</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td></tr>
<tr><td>Tunnel loss, latency, jitter</td><td><code>show sdwan app-route stats</code>, <code>show sdwan tunnel statistics</code></td></tr>
<tr><td>Device health</td><td><code>show sdwan system status</code></td></tr>
<tr><td>Interfaces</td><td><code>show interfaces</code>, <code>show ip interface brief</code></td></tr></table>
<pre class="out">E-BLR-1# show sdwan bfd summary
sessions-total                   3
sessions-up                      2
sessions-max                     6
sessions-flap                    5
poll-interval                    600000
<span class="hl">E-BLR-1# show sdwan bfd sessions</span>
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC   DST PUBLIC
SYSTEM IP    SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT   ENCAP
10.255.0.11  100     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.14 203.0.113.6  12346  ipsec
10.255.0.11  100     <span class="hl">down</span>  mpls         mpls         172.16.3.2    172.16.1.2    12366  ipsec
10.255.0.12  200     up    biz-internet biz-internet 203.0.113.14 203.0.113.10 12346  ipsec</pre>
<p>This is what produces a <i>Partial WAN connectivity</i> tile: 2 of 3 sessions are up and one colour pair is down.</p>

<h3>How to read the numbers</h3>
<ul>
<li><b>Look for change, not just level.</b> A tunnel at 70 ms latency is fine if it has always been 70 ms. A jump from 25 to 70 ms means something changed (a reroute at the provider).</li>
<li><b>Control down is bigger than data down.</b> A device with no control connection cannot receive policy and shows as unreachable; a missing BFD session only affects the paths through it.</li>
<li><b>Check both ends of a tunnel.</b> The Tunnels page lists tunnels per device; a problem is usually visible on both sites.</li>
<li><b>Time ranges matter.</b> Use a 24-hour or 7-day range for trends, and the real-time view for incidents.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> The Overview shows Site 300 (E-BLR-1) as <i>Partial WAN connectivity</i>. The engineer opens Monitor &gt; Devices &gt; E-BLR-1: the mpls colour has no BFD session to the hub, while biz-internet is fine. The Tunnels page shows QoE 10 for biz-internet and no entry for mpls. Real Time shows the MPLS interface in an up/down state. Cause: the provider's circuit is down. Because AAR and the second colour keep traffic flowing, users noticed nothing; the ticket goes to the MPLS provider, not to the user.</p></div>

<div class="warn"><p><b>Common mistake.</b> Judging health by the GUI colour alone. A dashboard tile can be stale if statistics collection is delayed. When a tile and a user disagree, confirm with a Real Time or CLI check.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the three <b>Site BFD Connectivity</b> buckets (full, partial, none) and that the <b>Tunnels</b> page uses a QoE score from 1 to 10 and Good, Fair or Poor classes. The <b>Real Time</b> pane gives CLI-equivalent live data.</p></div>

<div class="scn"><h4>A quiet degradation</h4><p>At Bharat Retail, nobody had complained, but the Tunnels page showed the Hyderabad biz-internet tunnels moving from QoE 9 to QoE 4 over a week. The Applications page showed video conferencing slowing at the same site. The engineer opened a case with the ISP with the loss and jitter graphs as evidence. The ISP found a congested aggregation link and fixed it. Users never filed a ticket.</p><p><b>Lesson:</b> trends in the Tunnels page find problems before users do.</p></div>

<div class="iv"><p class="q">"How do you check the health of an SD-WAN network in the Manager?"</p><p>I go top-down: Monitor &gt; Overview for control status and Site BFD Connectivity (full, partial, none), then Monitor &gt; Devices for the device in question, then Monitor &gt; Tunnels for latency, loss, jitter and QoE, and the Real Time pane for live BFD, OMP and app-route data. I confirm suspicious tiles with the equivalent CLI such as show sdwan control connections and show sdwan bfd sessions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitor top-down: Overview, Devices, Tunnels, then Real Time.</li>
<li>Site BFD Connectivity: full, partial or no WAN connectivity.</li>
<li>Tunnels page: latency, loss, jitter, QoE 1 to 10, Good, Fair, Poor.</li>
<li>Real Time is the CLI-equivalent view in the GUI.</li>
<li>Cross-check the GUI with <code>show sdwan control connections</code> and <code>show sdwan bfd sessions</code>.</li>
</ul></div>
`,hi:`
<p>Hospital ward mein ek central monitor har patient ki pulse dikhata hai. Hari line matlab sab theek, peeli line matlab nurse ko dekhna chahiye, laal line matlab daudo. Nurse har patient ko yaad nahi rakhti; woh board padhti hai aur us bed par jaati hai jisko uski zaroorat hai. Manager ka <b>Monitor</b> menu aapke fabric ke liye wahi board hai, poore network se ek akele tunnel tak.</p>

<h3>Top-down monitoring: fabric se device se tunnel tak</h3>
<p>Dashboards use karne ka sabse achha tareeka <b>top-down</b> hai. Poore network se shuru karo aur jo green nahi hai usmein drill karo:</p>
<ol>
<li><b>Monitor &gt; Overview</b>: ek screen par fabric. Yeh devices ka control-plane status dikhata hai (kya controllers aur edges connected hain?), site health, aur <b>Site BFD Connectivity</b> teen buckets mein: <i>Full WAN connectivity</i> (saare expected tunnels up), <i>Partial WAN connectivity</i> (kuch tunnels up, kuch down) aur <i>No WAN connectivity</i> (site isolated). Yeh WAN edge inventory, transport health aur top applications bhi list karta hai. <i>Partial</i> mein site typical early warning hai ki ek circuit down hai lekin branch phir bhi kaam kar rahi hai.</li>
<li><b>Monitor &gt; Devices</b>: har device ki list status, reachability, system IP, site ID, software version aur health ke saath. Ek device chuno to uska apna dashboard khulta hai: interface utilisation, CPU aur memory, control connections aur BFD summary.</li>
<li><b>Monitor &gt; Tunnels</b>: saare data-plane tunnels ek table mein, 10,000 tunnels tak. Har ek ka naapa hua <b>latency, loss aur jitter</b> aur 1 se 10 ke scale par <b>Quality of Experience (QoE)</b> score hota hai. Tunnel health QoE aur status se <i>Good</i>, <i>Fair</i> ya <i>Poor</i> classify hoti hai. Yeh page users ke shikayat karne se pehle jawab deta hai "abhi kaunse transports kharab hain?"</li>
<li><b>Monitor &gt; Applications</b>: poore network mein application usage aur performance, DPI engine se, taaki dikhe kaunsi applications bandwidth leti hain aur kaunsi sites takleef mein hain.</li>
<li><b>Monitor &gt; Security</b>: firewall, IPS, URL filtering aur doosri security activity (sdw-sec module dekho).</li>
<li><b>Monitor &gt; VPN</b>: segment-wise (har service VPN) traffic aur performance ka view.</li>
<li><b>Monitor &gt; Logs</b>: alarms, events aur audit logs (chapter 3).</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Top-down monitoring">
<rect x="20" y="20" width="600" height="46" rx="8" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">Overview: 72 sites, control status, Site BFD Connectivity</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="12">Full 71 · Partial 1 · No WAN connectivity 0</text>
<rect x="70" y="86" width="500" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="14">Devices: E-BLR-1, status, reachability, health</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">interfaces, CPU, memory, control connections</text>
<rect x="120" y="152" width="400" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="14">Tunnels: mpls se E-DEL-1, QoE 3 (Poor)</text><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">latency 180 ms, loss 4 percent, jitter 35 ms</text>
<rect x="170" y="214" width="300" height="30" rx="8" fill="#fde68a"/><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="13">Real Time: BFD sessions, app-route stats</text>
<line x1="320" y1="66" x2="320" y2="86" stroke="#64748b" stroke-width="2"/><line x1="320" y1="132" x2="320" y2="152" stroke="#64748b" stroke-width="2"/><line x1="320" y1="198" x2="320" y2="214" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poore fabric se ek site, ek tunnel aur phir live data tak drill down karo.</p></div>

<h3>Real Time: GUI ke andar CLI</h3>
<p>Device page par <b>Real Time</b> pane (device options ke neeche) wahi operational queries chalata hai jo command line chalati hai, lekin results ko filter hone wali tables mein dikhata hai, router mein login kiye bina: control connections, OMP peers aur routes, BFD sessions, app-route statistics, policy information, interface statistics aur bahut kuch. Yeh jawab hai "kya engineers SSH ke bina troubleshoot kar sakte hain?" ka, aur yeh record bhi rakhta hai ki kisne kya dekha. Real Time device se taaza data maangta hai isliye cached chart se dheema hai; ise live checks ke liye use karo, trending ke liye nahi.</p>

<h3>Matching CLI commands</h3>
<p>Dashboard ka har tile aisi cheez se backed hai jo edge par padh sakte ho. Jodiyan seekho taaki GUI ko cross-check kar sako:</p>
<table class="cmp"><tr><th>GUI view</th><th>WAN edge par CLI</th></tr>
<tr><td>Control status</td><td><code>show sdwan control connections</code></td></tr>
<tr><td>BFD sessions, site connectivity</td><td><code>show sdwan bfd sessions</code>, <code>show sdwan bfd summary</code></td></tr>
<tr><td>OMP peers, routes, TLOCs</td><td><code>show sdwan omp summary</code>, <code>show sdwan omp routes</code>, <code>show sdwan omp tlocs</code></td></tr>
<tr><td>Tunnel loss, latency, jitter</td><td><code>show sdwan app-route stats</code>, <code>show sdwan tunnel statistics</code></td></tr>
<tr><td>Device health</td><td><code>show sdwan system status</code></td></tr>
<tr><td>Interfaces</td><td><code>show interfaces</code>, <code>show ip interface brief</code></td></tr></table>
<pre class="out">E-BLR-1# show sdwan bfd summary
sessions-total                   3
sessions-up                      2
sessions-max                     6
sessions-flap                    5
poll-interval                    600000
<span class="hl">E-BLR-1# show sdwan bfd sessions</span>
                          SOURCE TLOC  REMOTE TLOC              DST PUBLIC   DST PUBLIC
SYSTEM IP    SITE ID STATE COLOR        COLOR        SOURCE IP   IP           PORT   ENCAP
10.255.0.11  100     <span class="hl">up</span>    biz-internet biz-internet 203.0.113.14 203.0.113.6  12346  ipsec
10.255.0.11  100     <span class="hl">down</span>  mpls         mpls         172.16.3.2    172.16.1.2    12366  ipsec
10.255.0.12  200     up    biz-internet biz-internet 203.0.113.14 203.0.113.10 12346  ipsec</pre>
<p>Yahi cheez <i>Partial WAN connectivity</i> tile banati hai: 3 mein se 2 sessions up hain aur ek colour pair down hai.</p>

<h3>Numbers kaise padhein</h3>
<ul>
<li><b>Level nahi, badlav dekho.</b> 70 ms latency wala tunnel theek hai agar hamesha 70 ms raha ho. 25 se 70 ms ka jump matlab kuch badla (provider par reroute).</li>
<li><b>Control down data down se bada hai.</b> Jis device mein control connection nahi woh policy receive nahi kar sakta aur unreachable dikhta hai; ek BFD session gayab hone se sirf us se guzarne wale paths prabhavit hote hain.</li>
<li><b>Tunnel ke dono ends dekho.</b> Tunnels page tunnels ko device ke hisaab se list karta hai; problem aksar dono sites par dikhti hai.</li>
<li><b>Time range matter karta hai.</b> Trends ke liye 24-hour ya 7-day range, aur incidents ke liye real-time view.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Overview Site 300 (E-BLR-1) ko <i>Partial WAN connectivity</i> dikhata hai. Engineer Monitor &gt; Devices &gt; E-BLR-1 kholta hai: mpls colour ka hub se koi BFD session nahi, jabki biz-internet theek hai. Tunnels page biz-internet ke liye QoE 10 aur mpls ke liye koi entry nahi dikhata. Real Time MPLS interface ko up/down state mein dikhata hai. Wajah: provider ka circuit down hai. AAR aur doosre colour se traffic chalta rehta hai, isliye users ko pata nahi chala; ticket MPLS provider ko jaata hai, user ko nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sirf GUI ke rang se health judge karna. Statistics collection mein delay ho to dashboard tile stale ho sakta hai. Tile aur user mein asehmati ho to Real Time ya CLI check se confirm karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen <b>Site BFD Connectivity</b> buckets (full, partial, none) aur yeh ki <b>Tunnels</b> page 1 se 10 ka QoE score aur Good, Fair, Poor classes use karta hai, yaad rakho. <b>Real Time</b> pane CLI-equivalent live data deta hai.</p></div>

<div class="scn"><h4>Chupchaap degradation</h4><p>Bharat Retail mein kisi ne shikayat nahi ki thi, lekin Tunnels page ne ek hafte mein Hyderabad ke biz-internet tunnels ko QoE 9 se QoE 4 par jaate dikhaya. Applications page ne usi site par video conferencing ko slow hote dikhaya. Engineer ne loss aur jitter graphs ko saboot banakar ISP ke saath case kholaa. ISP ko congested aggregation link mila aur usne theek kiya. Users ne kabhi ticket nahi banaya.</p><p><b>Lesson:</b> Tunnels page ke trends users se pehle problems dhundh lete hain.</p></div>

<div class="iv"><p class="q">"Manager mein SD-WAN network ki health kaise check karte ho?"</p><p>Main top-down jaata hoon: control status aur Site BFD Connectivity (full, partial, none) ke liye Monitor &gt; Overview, phir sawal wale device ke liye Monitor &gt; Devices, phir latency, loss, jitter aur QoE ke liye Monitor &gt; Tunnels, aur live BFD, OMP aur app-route data ke liye Real Time pane. Shak wale tiles ko main equivalent CLI jaise show sdwan control connections aur show sdwan bfd sessions se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Top-down monitor karo: Overview, Devices, Tunnels, phir Real Time.</li>
<li>Site BFD Connectivity: full, partial ya no WAN connectivity.</li>
<li>Tunnels page: latency, loss, jitter, QoE 1 se 10, Good, Fair, Poor.</li>
<li>Real Time GUI mein CLI-equivalent view hai.</li>
<li>GUI ko <code>show sdwan control connections</code> aur <code>show sdwan bfd sessions</code> se cross-check karo.</li>
</ul></div>
`}};export{e as default};