var e={id:`troubleshooting`,h:{en:`Troubleshooting transition mechanisms: a layered workflow`,hi:`Transition mechanisms troubleshoot karna: layered workflow`},body:{en:`
<p>Transition problems feel confusing because two address families, a translator and DNS all take part. The cure is a fixed order of questions. Work from the client outward, and prove each step before moving on. This chapter gives a workflow that applies to NAT64, 464XLAT, DS-Lite, MAP and CGNAT. Since the simulator has no labs for these features, use it as a method, and rehearse the generic steps (ping, traceroute, route lookups) in np-ipv6, ccna-nat and spcor-mpls-ldp.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting order">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="12">1 Client address</text>
<rect x="135" y="20" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="190" y="48" text-anchor="middle" class="svg-ink" font-size="12">2 DNS answer</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="12">3 Route to GW</text>
<rect x="385" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="48" text-anchor="middle" class="svg-ink" font-size="12">4 Translator</text>
<rect x="510" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">5 Return path</text>
<rect x="135" y="100" width="170" height="46" rx="8" fill="#e2e8f0"/><text x="220" y="128" text-anchor="middle" class="svg-ink" font-size="12">6 MTU and fragments</text>
<rect x="335" y="100" width="170" height="46" rx="8" fill="#e2e8f0"/><text x="420" y="128" text-anchor="middle" class="svg-ink" font-size="12">7 Capacity and logs</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Prove each step before moving on</text>
</svg><p class="cap">Client outward: address, DNS, route, translator, return path, MTU, capacity.</p></div>
<ol>
<li><b>Client addressing.</b> Does the client have the expected IPv6 address, prefix and default route? For 464XLAT, does it have the delegated /64 and a CLAT address? For DS-Lite, did the CPE receive the AFTR-Name (DHCPv6 option 64) and bring the tunnel up?</li>
<li><b>DNS.</b> Does the name return a real AAAA, a synthetic AAAA or only an A? A client that gets only an A record on an IPv6-only network will fail; DNS64 is missing or not used. Check that the DNS64 prefix equals the gateway prefix.</li>
<li><b>Route to the gateway.</b> From the first-hop router, does the route to 64:ff9b::/96 (or the DS-Lite AFTR address, or the MAP rule prefix) exist, and does it point at the right gateway? Look in the IPv6 table with <code>show ipv6 route</code>.</li>
<li><b>Translator state.</b> Does the gateway have a binding for the flow (<code>show nat64 translations</code> style checks), a free pool address and free ports? Are drop counters rising in the statistics for no mapping, pool exhausted or unsupported protocol?</li>
<li><b>Return path.</b> The IPv4 Internet must route the pool prefix (198.51.100.0/24) back to the translator. If the upstream does not learn the pool, replies disappear.</li>
<li><b>MTU and fragmentation.</b> Small requests work while large pages hang: a classic MTU symptom. Check that ICMPv6 packet-too-big is permitted, and that MSS clamping or MTU values account for encapsulation (40 bytes for DS-Lite and MAP-E).</li>
<li><b>Capacity and logs.</b> High session counts, port exhaustion for heavy users, and logging pipeline failures.</li>
</ol>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Name resolves but nothing connects, IPv6-only</td><td>Prefix route to NAT64 missing, or ACL excludes client prefix</td></tr>
<tr><td>Only apps with typed IPv4 addresses fail</td><td>No CLAT, so DNS64 not involved</td></tr>
<tr><td>Browsing works, large downloads stall</td><td>MTU or blocked ICMPv6 packet-too-big</td></tr>
<tr><td>Some users cannot open new connections at busy hours</td><td>Port block exhausted at CGNAT or MAP set too small</td></tr>
<tr><td>Replies never arrive</td><td>Pool prefix not advertised upstream, or asymmetric path bypasses the translator</td></tr>
<tr><td>Game or camera inbound fails</td><td>CGNAT behaviour: no inbound mapping</td></tr>
<tr><td>Validation failure for a signed domain</td><td>DNS64 synthesis versus DNSSEC-validating client</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "IPv6-only users cannot open app.example." The engineer applies the order. 1: the user has an address in 2001:db8:100::/64. 2: DNS returns 64:ff9b::c000:250, so DNS64 works. 3: a route lookup on the aggregation router for 64:ff9b::c000:250 finds no match, a default route to the Internet edge exists but the edge has no route to the gateway. The gateway announces the prefix only on its own VRF. The fix is to export the prefix to the global IPv6 table. At step 3 the problem was found; later steps were never needed.</p></div>

<h3>Tools you can use anywhere</h3>
<ul>
<li><code>ping</code> and <code>traceroute</code> to the synthetic address and the real IPv4 destination from the gateway.</li>
<li>Packet capture on the gateway interfaces, on both the IPv6 and the IPv4 side, to see exactly where a flow stops.</li>
<li>Counters on interfaces and on the translator, compared at two moments to see what changes.</li>
<li>Configuration review: both interfaces enabled, prefix, pool, ACL, route announcement.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Debugging the translator before proving the client's DNS answer. Blaming NAT for what is an MTU problem. Testing only with ping, which is small and hides MSS problems.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a question describes small packets working and large ones failing across an IPv4-in-IPv6 tunnel, the answer is MTU or MSS, not routing.</p></div>

<div class="scn"><h4>Heavy users lose connections each evening</h4><p>At 21:00 a few subscribers complained that apps fail to connect for a minute, then recover. The CGNAT logs showed the same households hitting their port-block limit during streaming plus torrents. The operator raised the per-subscriber block size for that tier and enforced a cap on new connections per second to protect others.</p><p><b>Lesson:</b> port-block exhaustion is a capacity problem that looks like a connectivity problem.</p></div>

<div class="iv"><p class="q">"An IPv6-only user cannot reach an IPv4 site through NAT64. How do you troubleshoot?"</p><p>Work outward: the client address and default route, the DNS answer (is it synthetic?), the route to the NAT64 prefix, the translator bindings and drop counters, the return route for the pool, then MTU. Describe what you expect to see at each step and stop at the first step that fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a fixed order: client, DNS, route, translator, return path, MTU, capacity.</li>
<li>DNS64 prefix and gateway prefix must match.</li>
<li>Small works and large fails means MTU or MSS.</li>
<li>Upstream must route the IPv4 pool back to the translator.</li>
<li>Port-block exhaustion looks like intermittent connectivity loss.</li>
</ul></div>
`,hi:`
<p>Transition problems confusing lagte hain kyunki do address families, translator aur DNS sab hissa lete hain. Ilaaj sawalon ka fixed order hai. Client se bahar ki taraf kaam karo, aur aage badhne se pehle har step prove karo. Yeh chapter aisa workflow deta hai jo NAT64, 464XLAT, DS-Lite, MAP aur CGNAT par lagu hota hai. Kyunki simulator mein in features ke labs nahi hain, ise method ki tarah use karo, aur generic steps (ping, traceroute, route lookups) np-ipv6, ccna-nat aur spcor-mpls-ldp mein rehearse karo.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Troubleshooting order">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="12">1 Client address</text>
<rect x="135" y="20" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="190" y="48" text-anchor="middle" class="svg-ink" font-size="12">2 DNS answer</text>
<rect x="260" y="20" width="110" height="46" rx="8" fill="#fde68a"/><text x="315" y="48" text-anchor="middle" class="svg-ink" font-size="12">3 GW ka route</text>
<rect x="385" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="440" y="48" text-anchor="middle" class="svg-ink" font-size="12">4 Translator</text>
<rect x="510" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="565" y="48" text-anchor="middle" class="svg-ink" font-size="12">5 Return path</text>
<rect x="135" y="100" width="170" height="46" rx="8" fill="#e2e8f0"/><text x="220" y="128" text-anchor="middle" class="svg-ink" font-size="12">6 MTU aur fragments</text>
<rect x="335" y="100" width="170" height="46" rx="8" fill="#e2e8f0"/><text x="420" y="128" text-anchor="middle" class="svg-ink" font-size="12">7 Capacity aur logs</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Aage badhne se pehle har step prove karo</text>
</svg><p class="cap">Client se bahar: address, DNS, route, translator, return path, MTU, capacity.</p></div>
<ol>
<li><b>Client addressing.</b> Client ke paas expected IPv6 address, prefix aur default route hai? 464XLAT ke liye delegated /64 aur CLAT address hai? DS-Lite ke liye CPE ko AFTR-Name (DHCPv6 option 64) mila aur tunnel up hua?</li>
<li><b>DNS.</b> Name real AAAA, synthetic AAAA ya sirf A lautata hai? IPv6-only network par sirf A record paane wala client fail hoga; DNS64 missing hai ya use nahi ho raha. Check karo ki DNS64 prefix gateway prefix ke barabar hai.</li>
<li><b>Gateway ka route.</b> First-hop router se 64:ff9b::/96 (ya DS-Lite AFTR address, ya MAP rule prefix) ka route hai, aur sahi gateway ki taraf point karta hai? <code>show ipv6 route</code> se IPv6 table dekho.</li>
<li><b>Translator state.</b> Gateway ke paas flow ki binding hai (<code>show nat64 translations</code> jaise checks), free pool address aur free ports hain? Statistics mein no mapping, pool exhausted ya unsupported protocol ke drop counters badh rahe hain?</li>
<li><b>Return path.</b> IPv4 Internet ko pool prefix (198.51.100.0/24) translator ki taraf route karna chahiye. Agar upstream pool nahi seekhta to replies gayab ho jaate hain.</li>
<li><b>MTU aur fragmentation.</b> Chhote requests chalte hain jabki badi pages hang hoti hain: classic MTU symptom. Check karo ki ICMPv6 packet-too-big permitted hai, aur MSS clamping ya MTU values encapsulation (DS-Lite aur MAP-E ke liye 40 bytes) ko account karti hain.</li>
<li><b>Capacity aur logs.</b> Zyaada session counts, heavy users ke liye port exhaustion, aur logging pipeline failures.</li>
</ol>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Name resolve hota hai lekin kuch connect nahi hota, IPv6-only</td><td>NAT64 ka prefix route missing, ya ACL client prefix ko exclude karti hai</td></tr>
<tr><td>Sirf typed IPv4 address wale apps fail</td><td>CLAT nahi, isliye DNS64 involve nahi</td></tr>
<tr><td>Browsing chalti hai, badi downloads atakti hain</td><td>MTU ya blocked ICMPv6 packet-too-big</td></tr>
<tr><td>Busy hours mein kuch users naye connections nahi khol paate</td><td>CGNAT par port block exhausted ya MAP set bahut chhota</td></tr>
<tr><td>Replies kabhi nahi aate</td><td>Pool prefix upstream advertise nahi hua, ya asymmetric path translator ko bypass karta hai</td></tr>
<tr><td>Game ya camera inbound fail</td><td>CGNAT behaviour: inbound mapping nahi</td></tr>
<tr><td>Signed domain ke liye validation failure</td><td>DNS64 synthesis versus DNSSEC-validating client</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "IPv6-only users app.example nahi khol paate." Engineer order lagata hai. 1: user ke paas 2001:db8:100::/64 mein address hai. 2: DNS 64:ff9b::c000:250 lautata hai, to DNS64 kaam karta hai. 3: aggregation router par 64:ff9b::c000:250 ka route lookup koi match nahi dikhata, Internet edge ki taraf default route hai lekin edge ke paas gateway ka route nahi. Gateway prefix sirf apne VRF par announce karta hai. Fix: prefix ko global IPv6 table mein export karo. Step 3 par problem mili; aage ke steps ki zaroorat nahi padi.</p></div>

<h3>Tools jo kahin bhi use ho sakte hain</h3>
<ul>
<li>Gateway se synthetic address aur real IPv4 destination tak <code>ping</code> aur <code>traceroute</code>.</li>
<li>Gateway interfaces par IPv6 aur IPv4 dono side packet capture, taaki dikhe flow exactly kahan rukta hai.</li>
<li>Interfaces aur translator par counters, do moments par compare karke dekho kya badla.</li>
<li>Configuration review: dono interfaces enabled, prefix, pool, ACL, route announcement.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Client ka DNS answer prove karne se pehle translator debug karna. MTU problem ka ilzaam NAT par lagana. Sirf ping se test karna, jo chhota hai aur MSS problems chhupata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar question batata hai ki IPv4-in-IPv6 tunnel ke across chhote packets chalte hain aur bade fail hote hain, to jawab MTU ya MSS hai, routing nahi.</p></div>

<div class="scn"><h4>Heavy users ke connections har shaam toot te hain</h4><p>Raat 21:00 baje kuch subscribers ne shikayat ki ki apps ek minute ke liye connect nahi hote, phir recover ho jaate hain. CGNAT logs mein wahi households streaming plus torrents ke dauran apni port-block limit par pahunchte dikhe. Operator ne us tier ke liye per-subscriber block size badhaya aur doosron ko bachane ke liye new connections per second par cap lagaya.</p><p><b>Lesson:</b> port-block exhaustion capacity problem hai jo connectivity problem jaisi dikhti hai.</p></div>

<div class="iv"><p class="q">"IPv6-only user NAT64 ke zariye IPv4 site tak nahi pahunch raha. Kaise troubleshoot karoge?"</p><p>Bahar ki taraf kaam karo: client address aur default route, DNS answer (kya woh synthetic hai?), NAT64 prefix ka route, translator bindings aur drop counters, pool ka return route, phir MTU. Har step par kya dikhna chahiye batao aur pehle fail hone wale step par ruk jao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order use karo: client, DNS, route, translator, return path, MTU, capacity.</li>
<li>DNS64 prefix aur gateway prefix match hone chahiye.</li>
<li>Chhota chalta hai aur bada fail hota hai matlab MTU ya MSS.</li>
<li>Upstream ko IPv4 pool translator ki taraf route karna chahiye.</li>
<li>Port-block exhaustion intermittent connectivity loss jaisa dikhta hai.</li>
</ul></div>
`}};export{e as default};