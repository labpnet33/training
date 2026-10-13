var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Connection Monitor tests from vm-app and an on-premises agent to vm-db and a hub endpoint, feeding Log Analytics and alert rules">
<rect x="15" y="30" width="130" height="50" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="12">vm-app 10.1.1.4</text><text x="80" y="68" text-anchor="middle" class="svg-muted" font-size="10">source (agent)</text>
<rect x="15" y="100" width="130" height="50" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">Office server</text><text x="80" y="138" text-anchor="middle" class="svg-muted" font-size="10">192.168.1.20 (AMA agent)</text>
<rect x="250" y="55" width="150" height="70" rx="10" fill="#fde68a" stroke="#64748b"/><text x="325" y="80" text-anchor="middle" class="svg-ink" font-size="12">Connection Monitor</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="10">test: TCP 1433 every 30 s</text><text x="325" y="112" text-anchor="middle" class="svg-muted" font-size="10">threshold: 5% failed, 100 ms</text>
<rect x="495" y="30" width="130" height="50" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="12">vm-db 10.2.1.4</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="10">destination</text>
<rect x="495" y="100" width="130" height="50" rx="10" fill="#ddd6fe" stroke="#64748b"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="12">Hub DNS 10.0.3.4</text><text x="560" y="138" text-anchor="middle" class="svg-muted" font-size="10">destination</text>
<g stroke="#64748b" stroke-width="2"><line x1="145" y1="55" x2="250" y2="80"/><line x1="145" y1="125" x2="250" y2="105"/><line x1="400" y1="80" x2="495" y2="55"/><line x1="400" y1="105" x2="495" y2="125"/></g>
<rect x="15" y="180" width="300" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="165" y="205" text-anchor="middle" class="svg-ink" font-size="12">Log Analytics workspace</text><text x="165" y="225" text-anchor="middle" class="svg-muted" font-size="10">ChecksFailedPercent, RoundTripTimeMs</text>
<rect x="340" y="180" width="285" height="70" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="482" y="205" text-anchor="middle" class="svg-ink" font-size="12">Alert rule + action group</text><text x="482" y="225" text-anchor="middle" class="svg-muted" font-size="10">email, SMS, ticket, webhook</text>
<line x1="325" y1="125" x2="165" y2="180" stroke="#64748b" stroke-width="2"/><line x1="325" y1="125" x2="482" y2="180" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`monitor-connection-monitor`,h:{en:`Azure Monitor and Connection Monitor: seeing problems early`,hi:`Azure Monitor aur Connection Monitor: problems jaldi dekhna`},body:{en:`
<h3>From firefighting to smoke detectors</h3>
<p>Everything so far starts after a user complains. A NOC wants to know before the user does. <b>Azure Monitor</b> collects <b>metrics</b> (numbers over time) and <b>logs</b> (events) from Azure resources, and fires <b>alerts</b>. <b>Connection Monitor</b> is the network part: it keeps running small tests between endpoints, so you see a path degrade or break, including across a VPN or ExpressRoute.</p>
<div class="dia">`+e+`<p class="cap">Connection Monitor tests from Azure and on-premises sources to destinations, records results in Log Analytics, and alerts through an action group.</p></div>

<h3>Metrics and logs: what to watch for each hub component</h3>
<table class="cmp"><tr><th>Resource</th><th>Useful signals (verify exact metric names)</th></tr>
<tr><td>VPN Gateway</td><td>Tunnel ingress and egress bytes, tunnel average bandwidth, tunnel connection state, BGP peer status, gateway diagnostic logs (IKE, tunnel, route)</td></tr>
<tr><td>ExpressRoute circuit</td><td>BGP availability, ARP availability (both links), bits in and out, dropped packets</td></tr>
<tr><td>Azure Firewall</td><td>Throughput, SNAT port utilisation, firewall health state, rule hit counts, application and network rule logs</td></tr>
<tr><td>Load balancer</td><td>Health probe status, data path availability, SNAT connection counts</td></tr>
<tr><td>VM NIC and VM</td><td>Network in and out, CPU, disk (the app may be slow rather than the network)</td></tr></table>
<p><b>Metrics</b> are cheap, near real time and good for alerts (for example "tunnel egress bytes dropped to zero", "BGP availability below 100 percent"). <b>Logs</b> need a <b>diagnostic setting</b> that sends them to a Log Analytics workspace (or storage or Event Hubs) and are better for searching and root cause.</p>
<pre class="code">az monitor diagnostic-settings create -n ds-vpn --resource <span class="c">&lt;vpn-gateway-resource-id&gt;</span> --workspace law-nk --logs '[{"category":"TunnelDiagnosticLog","enabled":true},{"category":"IKEDiagnosticLog","enabled":true},{"category":"RouteDiagnosticLog","enabled":true}]'
az monitor metrics alert create -g rg-hub -n alert-er-bgp --scopes <span class="c">&lt;circuit-resource-id&gt;</span> --condition "avg BgpAvailability &lt; 100" --window-size 5m --evaluation-frequency 1m --action <span class="c">&lt;action-group-id&gt;</span></pre>
<p>Parameter names and the exact metric spelling can differ; confirm in the portal or with <code>--help</code> (verify before publishing).</p>

<h3>Alerts and action groups</h3>
<p>An <b>alert rule</b> has a scope (which resource), a condition (metric threshold or log query), a window, and an <b>action group</b> (who to notify: email, SMS, push, webhook, ITSM ticket). Good alerts are specific and actionable: "ExpressRoute BGP availability below 100 percent for 5 minutes" is useful; "network traffic is high" is noise. Route severity: page someone for a lost link, email for a trend.</p>

<h3>Connection Monitor</h3>
<p>Connection Monitor tests connectivity and latency between <b>sources</b> and <b>destinations</b>. Core parts:</p>
<dl class="terms">
<dt>Endpoints</dt><dd>Sources can be Azure VMs (with the monitoring agent extension) or on-premises machines running the Azure Monitor Agent through Azure Arc. Destinations can be Azure VMs, URLs, domain names or IP addresses.</dd>
<dt>Test configuration</dt><dd>Protocol (TCP, ICMP or HTTP), port, frequency (for example every 30 seconds) and success thresholds (maximum percent of checks failed, maximum round-trip time).</dd>
<dt>Test group</dt><dd>A set of sources, destinations and test configurations that are tested together.</dd>
<dt>Metrics and topology</dt><dd>Results are metrics such as <code>ChecksFailedPercent</code> and <code>RoundTripTimeMs</code> in Log Analytics, and a topology view that shows the hops and where along the path the checks started to fail (verify names).</dd>
</dl>
<pre class="code"><span class="c"># concept; parameters differ by CLI version (confirm with --help)</span>
az network watcher connection-monitor create -l centralindia -n cm-hub --endpoint-source-name src-app --endpoint-source-resource-id <span class="c">&lt;vm-app-id&gt;</span> --endpoint-dest-name dst-db --endpoint-dest-address 10.2.1.4 --test-config-name tcp1433 --protocol Tcp --tcp-port 1433 --test-group-name tg-app-db --workspace-ids <span class="c">&lt;law-id&gt;</span></pre>
<pre class="out"><span class="c">Illustrative output (portal summary)</span>
Test group   Source     Destination    Checks failed   RTT (avg)   State
tg-app-db    vm-app     10.2.1.4:1433  <span class="hl">100 percent</span>      -           Fail
tg-office    srv-off    10.0.3.4:53    0 percent       38 ms       Pass</pre>
<p>The pair of results is informative: the Azure-internal path fails but the office-to-hub path works, which points at the spoke2 side (NSG or route), not the VPN.</p>

<h3>A practical monitoring set for the hub-and-spoke</h3>
<ol>
<li>Connection Monitor: vm-app to vm-db on the real port; an office server to hub DNS; a spoke VM to the internet endpoint it needs.</li>
<li>Alerts: VPN tunnel state or egress dropping to zero; ExpressRoute BGP availability; firewall health and SNAT utilisation above a threshold; Connection Monitor failures.</li>
<li>Diagnostic logs: firewall, VPN gateway to Log Analytics, with retention you can afford.</li>
<li>Flow logs and Traffic Analytics on the key VNets.</li>
<li>A dashboard or workbook for the NOC, plus a runbook per alert.</li>
</ol>

<h3>Cost and noise control</h3>
<p>Connection Monitor, Log Analytics ingestion, metrics alerts and logs all bill in different ways (verify the pricing structure). Monitor the paths and components that matter, set sensible frequencies and retention, and review alerts monthly so that the team keeps trusting them.</p>

<div class="warn"><p><b>Common mistakes:</b> alerting on everything, no action group owner, tests against paths that nobody cares about, monitoring only the Azure side of a hybrid link, and forgetting to turn on diagnostic settings before an incident.</p></div>
<div class="exam"><p><b>Exam trap:</b> metrics are near real time and good for alerts; logs need diagnostic settings and a destination such as Log Analytics. Connection Monitor tests on a schedule between endpoints; it is not packet capture.</p></div>

<div class="scn"><h4>The Monday alert that saved Tuesday</h4><p>A Connection Monitor test from an office server to hub DNS began to fail on Monday at 16:00 and the NOC was paged. The Azure-only tests stayed green, so the team went straight to the VPN: the gateway diagnostic log showed repeated IKE negotiation failures after the office firewall was upgraded. They rolled back a proposal setting before users noticed on Tuesday morning.</p><p><b>Lesson:</b> test the hybrid path continuously; the comparison between tests locates the fault.</p></div>

<div class="iv"><p class="q">"How do you monitor hybrid connectivity proactively?"</p><p>Connection Monitor with sources on both sides, tests on the real ports with thresholds, results in Log Analytics with alerts through action groups; metric alerts on VPN tunnel state and ExpressRoute BGP availability; gateway and firewall logs in Log Analytics; a runbook for each alert.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Metrics for fast alerts; logs (via diagnostic settings) for root cause.</li>
<li>Watch tunnel state, BGP availability, firewall health and SNAT utilisation.</li>
<li>Connection Monitor runs scheduled TCP, ICMP or HTTP tests with thresholds, including from on-premises.</li>
<li>Compare test results to locate which segment failed.</li>
<li>Keep alerts few, specific and owned.</li>
</ul></div>
`,hi:`
<h3>Aag bujhane se smoke detector tak</h3>
<p>Ab tak sab kuch user ke complain karne ke baad shuru hota hai. NOC user se pehle jaanna chahta hai. <b>Azure Monitor</b> Azure resources se <b>metrics</b> (samay ke saath numbers) aur <b>logs</b> (events) collect karta hai, aur <b>alerts</b> chalata hai. <b>Connection Monitor</b> network wala hissa hai: yeh endpoints ke beech chhote tests chalata rehta hai, taaki aap dekh sako ki path kab degrade ya toota, VPN ya ExpressRoute ke paar bhi.</p>
<div class="dia">`+e+`<p class="cap">Connection Monitor Azure aur on-premises sources se destinations tak tests karta hai, results Log Analytics mein record karta hai, aur action group se alert karta hai.</p></div>

<h3>Metrics aur logs: hub ke har component ke liye kya dekhein</h3>
<table class="cmp"><tr><th>Resource</th><th>Kaam ke signals (exact metric names verify karo)</th></tr>
<tr><td>VPN Gateway</td><td>Tunnel ingress aur egress bytes, tunnel average bandwidth, tunnel connection state, BGP peer status, gateway diagnostic logs (IKE, tunnel, route)</td></tr>
<tr><td>ExpressRoute circuit</td><td>BGP availability, ARP availability (dono links), bits in aur out, dropped packets</td></tr>
<tr><td>Azure Firewall</td><td>Throughput, SNAT port utilisation, firewall health state, rule hit counts, application aur network rule logs</td></tr>
<tr><td>Load balancer</td><td>Health probe status, data path availability, SNAT connection counts</td></tr>
<tr><td>VM NIC aur VM</td><td>Network in aur out, CPU, disk (app slow ho sakti hai, network nahi)</td></tr></table>
<p><b>Metrics</b> sasti, near real time aur alerts ke liye achhi hain (jaise "tunnel egress bytes zero ho gaye", "BGP availability 100 percent se neeche"). <b>Logs</b> ko <b>diagnostic setting</b> chahiye jo unhe Log Analytics workspace (ya storage ya Event Hubs) mein bheje, aur woh searching aur root cause ke liye behtar hain.</p>
<pre class="code">az monitor diagnostic-settings create -n ds-vpn --resource <span class="c">&lt;vpn-gateway-resource-id&gt;</span> --workspace law-nk --logs '[{"category":"TunnelDiagnosticLog","enabled":true},{"category":"IKEDiagnosticLog","enabled":true},{"category":"RouteDiagnosticLog","enabled":true}]'
az monitor metrics alert create -g rg-hub -n alert-er-bgp --scopes <span class="c">&lt;circuit-resource-id&gt;</span> --condition "avg BgpAvailability &lt; 100" --window-size 5m --evaluation-frequency 1m --action <span class="c">&lt;action-group-id&gt;</span></pre>
<p>Parameter names aur exact metric spelling alag ho sakte hain; portal ya <code>--help</code> se confirm karo (publish se pehle verify karo).</p>

<h3>Alerts aur action groups</h3>
<p><b>Alert rule</b> ka ek scope (kaunsa resource), ek condition (metric threshold ya log query), ek window, aur ek <b>action group</b> (kise notify karna hai: email, SMS, push, webhook, ITSM ticket) hota hai. Achhe alerts specific aur actionable hote hain: "ExpressRoute BGP availability 5 minute ke liye 100 percent se neeche" kaam ka hai; "network traffic high hai" shor hai. Severity route karo: toota link par kisi ko page karo, trend par email.</p>

<h3>Connection Monitor</h3>
<p>Connection Monitor <b>sources</b> aur <b>destinations</b> ke beech connectivity aur latency test karta hai. Mukhya parts:</p>
<dl class="terms">
<dt>Endpoints</dt><dd>Sources Azure VMs (monitoring agent extension ke saath) ya Azure Arc ke through Azure Monitor Agent chalane wali on-premises machines ho sakti hain. Destinations Azure VMs, URLs, domain names ya IP addresses ho sakte hain.</dd>
<dt>Test configuration</dt><dd>Protocol (TCP, ICMP ya HTTP), port, frequency (jaise har 30 second) aur success thresholds (maximum failed checks percent, maximum round-trip time).</dd>
<dt>Test group</dt><dd>Sources, destinations aur test configurations ka set jo saath test hota hai.</dd>
<dt>Metrics aur topology</dt><dd>Results Log Analytics mein <code>ChecksFailedPercent</code> aur <code>RoundTripTimeMs</code> jaise metrics hain, aur ek topology view jo hops dikhata hai aur ki path par kahan se checks fail hone lage (names verify karo).</dd>
</dl>
<pre class="code"><span class="c"># concept; parameters CLI version ke hisaab se alag (--help se confirm karo)</span>
az network watcher connection-monitor create -l centralindia -n cm-hub --endpoint-source-name src-app --endpoint-source-resource-id <span class="c">&lt;vm-app-id&gt;</span> --endpoint-dest-name dst-db --endpoint-dest-address 10.2.1.4 --test-config-name tcp1433 --protocol Tcp --tcp-port 1433 --test-group-name tg-app-db --workspace-ids <span class="c">&lt;law-id&gt;</span></pre>
<pre class="out"><span class="c">Illustrative output (portal summary)</span>
Test group   Source     Destination    Checks failed   RTT (avg)   State
tg-app-db    vm-app     10.2.1.4:1433  <span class="hl">100 percent</span>      -           Fail
tg-office    srv-off    10.0.3.4:53    0 percent       38 ms       Pass</pre>
<p>Dono results ka jodi informative hai: Azure-internal path fail hai par office-to-hub path chal raha hai, jo spoke2 side (NSG ya route) ki taraf ishara karta hai, VPN ki taraf nahi.</p>

<h3>Hub-and-spoke ke liye practical monitoring set</h3>
<ol>
<li>Connection Monitor: vm-app se vm-db asli port par; office server se hub DNS; spoke VM se jis internet endpoint ki zaroorat hai.</li>
<li>Alerts: VPN tunnel state ya egress zero hona; ExpressRoute BGP availability; firewall health aur SNAT utilisation threshold se upar; Connection Monitor failures.</li>
<li>Diagnostic logs: firewall, VPN gateway Log Analytics mein, retention jo aap afford kar sako.</li>
<li>Mukhya VNets par flow logs aur Traffic Analytics.</li>
<li>NOC ke liye dashboard ya workbook, aur har alert ke liye runbook.</li>
</ol>

<h3>Cost aur noise control</h3>
<p>Connection Monitor, Log Analytics ingestion, metrics alerts aur logs sab alag tareeke se bill hote hain (pricing structure verify karo). Jo paths aur components matter karte hain unhe monitor karo, sahi frequencies aur retention rakho, aur mahine mein alerts review karo taaki team un par bharosa karti rahe.</p>

<div class="warn"><p><b>Common mistakes:</b> har cheez par alert, action group ka owner nahi, aise paths ke tests jinki kisi ko parwah nahi, hybrid link ki sirf Azure side monitor karna, aur incident se pehle diagnostic settings on karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap:</b> metrics near real time aur alerts ke liye achhe hain; logs ko diagnostic settings aur Log Analytics jaisi destination chahiye. Connection Monitor endpoints ke beech schedule par test karta hai; yeh packet capture nahi hai.</p></div>

<div class="scn"><h4>Monday ka alert jisne Tuesday bacha liya</h4><p>Office server se hub DNS tak ka Connection Monitor test Monday 16:00 par fail hone laga aur NOC ko page hua. Azure-only tests green rahe, isliye team seedha VPN par gayi: gateway diagnostic log mein office firewall upgrade ke baad repeated IKE negotiation failures dikhe. Unhone Tuesday subah users ke notice karne se pehle ek proposal setting rollback kar di.</p><p><b>Lesson:</b> hybrid path ko continuously test karo; tests ki tulna fault locate karti hai.</p></div>

<div class="iv"><p class="q">"Hybrid connectivity ko proactively kaise monitor karte ho?"</p><p>Dono sides ke sources ke saath Connection Monitor, asli ports par thresholds wale tests, results Log Analytics mein alerts ke saath action groups se; VPN tunnel state aur ExpressRoute BGP availability par metric alerts; gateway aur firewall logs Log Analytics mein; aur har alert ke liye runbook.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tez alerts ke liye metrics; root cause ke liye logs (diagnostic settings se).</li>
<li>Tunnel state, BGP availability, firewall health aur SNAT utilisation dekho.</li>
<li>Connection Monitor thresholds ke saath scheduled TCP, ICMP ya HTTP tests chalata hai, on-premises se bhi.</li>
<li>Kaunsa segment fail hua yeh dhundne ke liye test results ki tulna karo.</li>
<li>Alerts kam, specific aur owned rakho.</li>
</ul></div>
`}};export{t as default};