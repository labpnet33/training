var e={id:`ise-architecture`,h:{en:`Inside ISE: personas, nodes, network devices and RADIUS`,hi:`ISE ke andar: personas, nodes, network devices aur RADIUS`},body:{en:`
<p>Think of a bank. Head office writes the rules (the policy), the branches serve customers at the counter (the decisions), and an audit department keeps every receipt (the logs). One small town bank can do all three in one building; a national bank spreads them across many buildings. Cisco ISE works the same way: its jobs are split into <b>personas</b>, and you choose how many <b>nodes</b> (ISE servers or VMs) run each persona.</p>

<h3>The four personas</h3>
<dl class="terms">
<dt>PAN, Policy Administration Node</dt><dd>The admin GUI and the master copy of the configuration: policy sets, identity sources, network devices, certificates. Changes are made on the primary PAN and replicated to every other node. A deployment has at most two PANs: primary and secondary.</dd>
<dt>MnT, Monitoring and Troubleshooting Node</dt><dd>Collects logs from all nodes and produces <b>Live Logs</b>, <b>Live Sessions</b> and reports. At most two MnT nodes (primary and secondary). If MnT is down, authentication still works, but you are flying blind.</dd>
<dt>PSN, Policy Service Node</dt><dd>The workhorse: answers RADIUS and TACACS+ requests, runs the guest and BYOD portals, profiling probes and posture. Network devices point their RADIUS servers at PSNs. Large deployments scale out with many PSNs (up to 50 in the largest supported designs), often behind a load balancer.</dd>
<dt>pxGrid</dt><dd>Platform Exchange Grid: a publish/subscribe service that shares session context (user, IP, SGT, posture) with other products such as firewalls and SIEMs, and accepts quarantine requests back. It is the basis of Rapid Threat Containment, covered in sec-ftd-integration.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="ISE distributed deployment">
<rect x="30" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">PAN + MnT</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">primary</text>
<rect x="30" y="90" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="13">PAN + MnT</text><text x="105" y="130" text-anchor="middle" class="svg-muted" font-size="12">secondary</text>
<line x1="180" y1="45" x2="260" y2="80" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="180" y1="115" x2="260" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="220" y="40" class="svg-muted" font-size="12">config sync</text>
<rect x="260" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="13">PSN 1</text><text x="325" y="100" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, portals</text>
<rect x="260" y="130" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">PSN 2</text><text x="325" y="170" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, profiling</text>
<rect x="470" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="540" y="117" text-anchor="middle" class="svg-ink" font-size="13">Switches, WLCs</text><text x="540" y="135" text-anchor="middle" class="svg-muted" font-size="12">network devices</text>
<line x1="390" y1="85" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="155" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="430" y="80" class="svg-accent" font-size="12">1812/1813</text>
<rect x="260" y="200" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="225" text-anchor="middle" class="svg-ink" font-size="13">pxGrid</text>
<text x="470" y="225" class="svg-muted" font-size="12">context to firewalls, SIEM</text>
</svg><p class="cap">A small distributed deployment: two admin/monitoring nodes, two PSNs that the network devices talk to, and pxGrid for sharing context.</p></div>

<h3>Deployment sizes</h3>
<ul>
<li><b>Standalone</b>: one node runs every persona. Fine for a lab (our ISE at 10.99.99.10 is standalone) but no redundancy.</li>
<li><b>Small, two nodes</b>: both nodes run PAN, MnT and PSN; one is primary admin and monitoring, the other secondary. Switches list both as RADIUS servers.</li>
<li><b>Medium and large distributed</b>: dedicated PAN/MnT nodes and a pool of PSNs, often per region or per data center.</li>
</ul>

<h3>Network devices: ISE only answers known clients</h3>
<p>ISE ignores RADIUS from any device it does not know. Every switch, WLC or VPN headend must be added under <b>Administration &gt; Network Resources &gt; Network Devices</b> with its IP address (or a subnet), a <b>RADIUS shared secret</b> that matches the device, and optionally a TACACS+ secret. You can group devices into <b>Network Device Groups (NDGs)</b> such as Location (Mumbai, Pune) and Device Type (Access-Switch, WLC), and later use those groups as policy conditions. In the labs the shared secret between ACC-SW1 or NAS-SW and ISE is <code>NKise26</code>.</p>
<p>If a request comes from an unknown IP, Live Logs shows failure reason <b>11007 Could not locate Network Device or AAA Client</b>. If the IP is known but the secret is wrong, the message authenticator fails to validate and you see <b>11036 The Message-Authenticator RADIUS attribute is invalid</b>.</p>

<h3>RADIUS in five minutes</h3>
<p>RADIUS is the protocol between the network device (the <b>NAS</b>, network access server) and ISE.</p>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Transport</td><td>UDP 1812 authentication and authorization, UDP 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>Change of Authorization</td><td>UDP 3799 (RFC 5176); Cisco devices and ISE default to UDP 1700</td></tr>
<tr><td>Messages</td><td>Access-Request, Access-Challenge, Access-Accept, Access-Reject, Accounting-Request/Response</td></tr>
<tr><td>Security</td><td>Only the password attribute is obfuscated with the shared secret; the rest travels in clear</td></tr>
<tr><td>Key attributes</td><td>User-Name, Calling-Station-Id (endpoint MAC), NAS-IP-Address, NAS-Port-Type, Service-Type, EAP-Message, Tunnel-Private-Group-ID (VLAN), cisco-av-pair (vendor-specific)</td></tr>
</table>
<p>RADIUS combines authentication and authorization: the Access-Accept itself carries the result. Accounting tells ISE when a session starts, updates and stops, which is how Live Sessions knows who is online and which IP address they got.</p>

<h3>Identity sources</h3>
<p>ISE can check credentials against its <b>internal users</b> and <b>internal endpoints</b> databases, <b>Active Directory</b> (joined as a computer account), <b>LDAP</b>, other RADIUS servers, or <b>certificate authentication profiles</b> for EAP-TLS. An <b>identity source sequence</b> tries several in order, for example AD first, then internal users. In the lab, user <code>priya</code> lives in the ISE internal user store.</p>

<pre class="code"><span class="c">! On the network device: point RADIUS at the PSN(s)</span>
aaa new-model
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
<span class="c">! with two PSNs, define ISE-2 too and group them</span>
aaa group server radius ISE-GROUP
 server name ISE</pre>

<pre class="out">ACC-SW1# test aaa group radius priya Pr!ya2026 new-code
<span class="hl">User successfully authenticated</span>

USER ATTRIBUTES

username             0   "priya"
tunnel-private-group 0   "20"</pre>
<p><code>test aaa</code> sends a RADIUS PAP request from the switch itself. It proves the switch-to-ISE path, the shared secret and the user, before any endpoint is involved.</p>

<div class="eg"><p><b>Worked example.</b> A company has 600 access switches in two cities. Mumbai switches point to PSN-MUM-1 then PSN-MUM-2; Pune switches point to PSN-PUN-1 then PSN-PUN-2. In ISE, one network device entry covers the Mumbai management subnet 10.99.0.0/16 with NDG Location#All Locations#Mumbai. One policy condition, DEVICE:Location CONTAINS Mumbai, can then give Mumbai staff their local VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pointing switches at the PAN or MnT IP instead of a PSN, or adding the switch in ISE with its loopback address while RADIUS is sourced from the management SVI. ISE matches the source IP of the packet. Use <code>ip radius source-interface</code> to make the source predictable.</p></div>

<div class="exam"><p><b>Exam trap.</b> The persona that <b>answers RADIUS</b> is the PSN. The PAN is where you configure; the MnT is where you look at logs. pxGrid shares context. Also remember: RADIUS encrypts only the password; TACACS+ encrypts the entire payload.</p></div>

<div class="scn"><h4>The new switch that nobody added</h4><p>A new access switch was racked and configured exactly like its neighbours, but every laptop on it failed. The switch logged RADIUS timeouts. Live Logs on ISE showed nothing for the endpoints, but the RADIUS drop report showed 11007 for the switch's management IP. The engineer had copied the config but never created the network device in ISE. Adding the device with the right secret fixed every port at once.</p><p><b>Lesson:</b> ISE talks only to network devices it knows; check the device entry and the shared secret before you look at endpoints.</p></div>

<div class="iv"><p class="q">"What are the ISE personas and where does a switch send its RADIUS requests?"</p><p>Strong answer: PAN for administration and configuration replication, MnT for logging and reports, PSN for RADIUS/TACACS+ decisions, portals, profiling and posture, and pxGrid for sharing context. Switches send RADIUS to PSNs, normally two for redundancy. Mention the limits of two PANs and two MnTs and that PSNs scale out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAN configures, MnT logs, PSN decides, pxGrid shares context.</li>
<li>Standalone runs every persona on one node; distributed designs scale PSNs.</li>
<li>Every NAS must exist in ISE as a network device with a matching shared secret.</li>
<li>RADIUS: UDP 1812/1813; CoA UDP 3799 standard, 1700 Cisco default.</li>
<li><code>test aaa group radius</code> proves the switch-to-ISE path before endpoints are involved.</li>
</ul></div>
`,hi:`
<p>Ek bank socho. Head office rules likhta hai (policy), branches counter par customers ko serve karti hain (decisions), aur audit department har receipt rakhta hai (logs). Ek chhote shehar ka bank teeno kaam ek building mein kar sakta hai; national bank unhe kai buildings mein baant deta hai. Cisco ISE bhi aise hi kaam karta hai: uske kaam <b>personas</b> mein bante hain, aur aap chunte ho ki kitne <b>nodes</b> (ISE servers ya VMs) har persona chalayenge.</p>

<h3>Chaar personas</h3>
<dl class="terms">
<dt>PAN, Policy Administration Node</dt><dd>Admin GUI aur configuration ki master copy: policy sets, identity sources, network devices, certificates. Changes primary PAN par kiye jaate hain aur har doosre node par replicate hote hain. Ek deployment mein zyada se zyada do PANs hote hain: primary aur secondary.</dd>
<dt>MnT, Monitoring and Troubleshooting Node</dt><dd>Saare nodes se logs collect karta hai aur <b>Live Logs</b>, <b>Live Sessions</b> aur reports banata hai. Zyada se zyada do MnT nodes (primary aur secondary). Agar MnT down hai, authentication phir bhi chalta hai, par aap andhere mein ho.</dd>
<dt>PSN, Policy Service Node</dt><dd>Asli mehnat wala: RADIUS aur TACACS+ requests ka jawab deta hai, guest aur BYOD portals, profiling probes aur posture chalata hai. Network devices apne RADIUS servers PSNs par point karte hain. Bade deployments kai PSNs se scale out karte hain (sabse bade supported designs mein 50 tak), aksar load balancer ke peeche.</dd>
<dt>pxGrid</dt><dd>Platform Exchange Grid: ek publish/subscribe service jo session context (user, IP, SGT, posture) firewalls aur SIEMs jaise doosre products ke saath share karti hai, aur wapas quarantine requests leti hai. Yeh Rapid Threat Containment ka aadhaar hai, jo sec-ftd-integration mein cover hota hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="ISE distributed deployment">
<rect x="30" y="20" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">PAN + MnT</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">primary</text>
<rect x="30" y="90" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="13">PAN + MnT</text><text x="105" y="130" text-anchor="middle" class="svg-muted" font-size="12">secondary</text>
<line x1="180" y1="45" x2="260" y2="80" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="180" y1="115" x2="260" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="220" y="40" class="svg-muted" font-size="12">config sync</text>
<rect x="260" y="60" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="82" text-anchor="middle" class="svg-ink" font-size="13">PSN 1</text><text x="325" y="100" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, portals</text>
<rect x="260" y="130" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="325" y="152" text-anchor="middle" class="svg-ink" font-size="13">PSN 2</text><text x="325" y="170" text-anchor="middle" class="svg-muted" font-size="12">RADIUS, profiling</text>
<rect x="470" y="95" width="140" height="50" rx="8" fill="#bae6fd"/><text x="540" y="117" text-anchor="middle" class="svg-ink" font-size="13">Switches, WLCs</text><text x="540" y="135" text-anchor="middle" class="svg-muted" font-size="12">network devices</text>
<line x1="390" y1="85" x2="470" y2="115" stroke="#64748b" stroke-width="2"/><line x1="390" y1="155" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="430" y="80" class="svg-accent" font-size="12">1812/1813</text>
<rect x="260" y="200" width="130" height="40" rx="8" fill="#fde68a"/><text x="325" y="225" text-anchor="middle" class="svg-ink" font-size="13">pxGrid</text>
<text x="470" y="225" class="svg-muted" font-size="12">firewalls, SIEM ko context</text>
</svg><p class="cap">Ek chhota distributed deployment: do admin/monitoring nodes, do PSNs jinse network devices baat karte hain, aur context share karne ke liye pxGrid.</p></div>

<h3>Deployment sizes</h3>
<ul>
<li><b>Standalone</b>: ek node har persona chalata hai. Lab ke liye theek hai (hamara ISE 10.99.99.10 standalone hai) par koi redundancy nahi.</li>
<li><b>Small, do nodes</b>: dono nodes PAN, MnT aur PSN chalate hain; ek primary admin aur monitoring hai, doosra secondary. Switches dono ko RADIUS servers ki tarah list karte hain.</li>
<li><b>Medium aur large distributed</b>: dedicated PAN/MnT nodes aur PSNs ka pool, aksar har region ya har data center ke liye.</li>
</ul>

<h3>Network devices: ISE sirf known clients ko jawab deta hai</h3>
<p>ISE kisi bhi aise device ka RADIUS ignore karta hai jise woh nahi jaanta. Har switch, WLC ya VPN headend ko <b>Administration &gt; Network Resources &gt; Network Devices</b> mein uske IP address (ya subnet), device se match karne wale <b>RADIUS shared secret</b>, aur optionally TACACS+ secret ke saath add karna padta hai. Aap devices ko <b>Network Device Groups (NDGs)</b> mein group kar sakte ho jaise Location (Mumbai, Pune) aur Device Type (Access-Switch, WLC), aur baad mein un groups ko policy conditions ki tarah use kar sakte ho. Labs mein ACC-SW1 ya NAS-SW aur ISE ke beech shared secret <code>NKise26</code> hai.</p>
<p>Agar request anjaan IP se aaye, to Live Logs failure reason <b>11007 Could not locate Network Device or AAA Client</b> dikhata hai. Agar IP known hai par secret galat, to message authenticator validate nahi hota aur aapko <b>11036 The Message-Authenticator RADIUS attribute is invalid</b> dikhta hai.</p>

<h3>Paanch minute mein RADIUS</h3>
<p>RADIUS network device (<b>NAS</b>, network access server) aur ISE ke beech ka protocol hai.</p>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>Transport</td><td>UDP 1812 authentication aur authorization, UDP 1813 accounting (legacy 1645/1646)</td></tr>
<tr><td>Change of Authorization</td><td>UDP 3799 (RFC 5176); Cisco devices aur ISE ka default UDP 1700</td></tr>
<tr><td>Messages</td><td>Access-Request, Access-Challenge, Access-Accept, Access-Reject, Accounting-Request/Response</td></tr>
<tr><td>Security</td><td>Sirf password attribute shared secret se obfuscate hota hai; baaki sab clear mein jaata hai</td></tr>
<tr><td>Key attributes</td><td>User-Name, Calling-Station-Id (endpoint MAC), NAS-IP-Address, NAS-Port-Type, Service-Type, EAP-Message, Tunnel-Private-Group-ID (VLAN), cisco-av-pair (vendor-specific)</td></tr>
</table>
<p>RADIUS authentication aur authorization ko jodta hai: Access-Accept khud result le kar aata hai. Accounting ISE ko batata hai ki session kab start, update aur stop hota hai, isi se Live Sessions jaanta hai ki kaun online hai aur use kaunsa IP address mila.</p>

<h3>Identity sources</h3>
<p>ISE credentials ko apne <b>internal users</b> aur <b>internal endpoints</b> databases, <b>Active Directory</b> (computer account ki tarah joined), <b>LDAP</b>, doosre RADIUS servers, ya EAP-TLS ke liye <b>certificate authentication profiles</b> ke against check kar sakta hai. Ek <b>identity source sequence</b> kai sources ko order mein try karti hai, jaise pehle AD, phir internal users. Lab mein user <code>priya</code> ISE ke internal user store mein hai.</p>

<pre class="code"><span class="c">! Network device par: RADIUS ko PSN(s) par point karo</span>
aaa new-model
radius server ISE
 address ipv4 10.99.99.10 auth-port 1812 acct-port 1813
 key NKise26
<span class="c">! do PSNs ho to ISE-2 bhi define karo aur group karo</span>
aaa group server radius ISE-GROUP
 server name ISE</pre>

<pre class="out">ACC-SW1# test aaa group radius priya Pr!ya2026 new-code
<span class="hl">User successfully authenticated</span>

USER ATTRIBUTES

username             0   "priya"
tunnel-private-group 0   "20"</pre>
<p><code>test aaa</code> switch se khud ek RADIUS PAP request bhejta hai. Yeh kisi endpoint ke involve hone se pehle switch-to-ISE path, shared secret aur user ko prove karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke do shehron mein 600 access switches hain. Mumbai ke switches PSN-MUM-1 phir PSN-MUM-2 ko point karte hain; Pune ke switches PSN-PUN-1 phir PSN-PUN-2 ko. ISE mein ek network device entry Mumbai management subnet 10.99.0.0/16 ko NDG Location#All Locations#Mumbai ke saath cover karti hai. Phir ek policy condition, DEVICE:Location CONTAINS Mumbai, Mumbai staff ko unka local VLAN de sakti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Switches ko PSN ki jagah PAN ya MnT IP par point karna, ya switch ko ISE mein uske loopback address se add karna jabki RADIUS management SVI se source ho raha hai. ISE packet ke source IP ko match karta hai. Source predictable banane ke liye <code>ip radius source-interface</code> use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jo persona <b>RADIUS ka jawab deta hai</b> woh PSN hai. PAN par aap configure karte ho; MnT par logs dekhte ho. pxGrid context share karta hai. Yeh bhi yaad rakho: RADIUS sirf password encrypt karta hai; TACACS+ poora payload encrypt karta hai.</p></div>

<div class="scn"><h4>Naya switch jise kisi ne add nahi kiya</h4><p>Ek naya access switch rack hua aur bilkul padosiyon ki tarah configure hua, par us par har laptop fail hua. Switch ne RADIUS timeouts log kiye. ISE ke Live Logs mein endpoints ke liye kuch nahi tha, par RADIUS drop report mein switch ke management IP ke liye 11007 dikha. Engineer ne config copy kiya tha par ISE mein network device kabhi banaya hi nahi. Sahi secret ke saath device add karte hi har port ek saath theek ho gaya.</p><p><b>Seekh:</b> ISE sirf un network devices se baat karta hai jinhe woh jaanta hai; endpoints dekhne se pehle device entry aur shared secret check karo.</p></div>

<div class="iv"><p class="q">"ISE personas kya hain aur switch apni RADIUS requests kahan bhejta hai?"</p><p>Strong answer: PAN administration aur configuration replication ke liye, MnT logging aur reports ke liye, PSN RADIUS/TACACS+ decisions, portals, profiling aur posture ke liye, aur pxGrid context share karne ke liye. Switches RADIUS PSNs ko bhejte hain, normally redundancy ke liye do. Do PANs aur do MnTs ki limit batao aur yeh ki PSNs scale out hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PAN configure karta hai, MnT log karta hai, PSN decide karta hai, pxGrid context share karta hai.</li>
<li>Standalone har persona ek node par chalata hai; distributed designs PSNs scale karte hain.</li>
<li>Har NAS ISE mein matching shared secret ke saath network device ki tarah hona chahiye.</li>
<li>RADIUS: UDP 1812/1813; CoA standard UDP 3799, Cisco default 1700.</li>
<li><code>test aaa group radius</code> endpoints ke involve hone se pehle switch-to-ISE path prove karta hai.</li>
</ul></div>
`}};export{e as default};