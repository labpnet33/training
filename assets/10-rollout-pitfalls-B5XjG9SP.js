var e={id:`rollout-pitfalls`,h:{en:`Rollout strategy and pitfalls: trusted ports, uplinks, EtherChannel`,hi:`Rollout strategy aur pitfalls: trusted ports, uplinks, EtherChannel`},body:{en:`
<p>When a housing society installs new gate security, a sensible committee does not lock every gate on day one. First the guard just watches and writes down who comes and goes. Then the residents' cars get stickers. Only after a week of clean records do the gates start refusing strangers. FHS deserves the same patience. Every feature in this module can cause an outage if it is applied to the wrong port, and the outage usually hits a whole VLAN at once.</p>

<h3>Step 0: know your ports</h3>
<p>Before typing a single policy, classify every port in the VLANs you will protect:</p>
<table class="cmp"><tr><th>Port type</th><th>RA guard</th><th>DHCPv6 guard</th><th>Device-tracking</th><th>Source guard</th></tr>
<tr><td>User / printer / phone</td><td>host</td><td>client</td><td>node, guard, address limit</td><td>yes, after the table is stable</td></tr>
<tr><td>Server with static address</td><td>host</td><td>client</td><td>node, guard; static binding if silent</td><td>only with static bindings or data-glean</td></tr>
<tr><td>Hypervisor / AP / many clients</td><td>host</td><td>client</td><td>node, higher address limit</td><td>careful pilot</td></tr>
<tr><td>Real router or FHRP member</td><td>router (with checks)</td><td>server</td><td>trusted-port or no policy</td><td>no</td></tr>
<tr><td>Uplink trunk to another switch</td><td>switch, router or none</td><td>server or none</td><td>device-role switch or trusted-port</td><td>no</td></tr>
</table>

<h3>Phased rollout</h3>
<ol>
<li><b>Visibility.</b> Attach device-tracking at <code>security-level glean</code> to user ports. Check <code>show device-tracking database</code>: are all hosts there, how many addresses per host, any surprises?</li>
<li><b>Stop rogue infrastructure.</b> RA guard host policies and DHCPv6 guard client policies on user ports; router/server roles on the real router and uplink ports. These two features have the best benefit-to-risk ratio.</li>
<li><b>Enforce ownership.</b> Move device-tracking to <code>guard</code>, add <code>tracking enable</code> and <code>limit address-count</code>.</li>
<li><b>Data plane.</b> Pilot IPv6 source guard on one VLAN, watch drop counters and syslog, add static bindings for silent devices, then expand.</li>
<li><b>Operate.</b> Send <code>%SISF</code> logs to your syslog server and alert on IP_THEFT and repeated PAK_DROP.</li>
</ol>

<h3>A complete edge template (IOS XE)</h3>
<pre class="code">device-tracking policy USER-DT
 security-level guard
 tracking enable
 limit address-count 10
!
ipv6 nd raguard policy HOST-EDGE
 device-role host
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
ipv6 source-guard policy EDGE-SG
!
interface range GigabitEthernet1/0/1 - 46
 device-tracking attach-policy USER-DT
 ipv6 nd raguard attach-policy HOST-EDGE
 ipv6 dhcp guard attach-policy DHCP-CLIENTS
 ipv6 source-guard attach-policy EDGE-SG
!
<span class="c">! Uplink port-channel to distribution: never host/client roles here</span>
device-tracking policy UPLINK-DT
 device-role switch
 trusted-port
ipv6 nd raguard policy UPLINK-RA
 device-role router
ipv6 dhcp guard policy UPLINK-DHCP
 device-role server
interface Port-channel1
 device-tracking attach-policy UPLINK-DT
 ipv6 nd raguard attach-policy UPLINK-RA
 ipv6 dhcp guard attach-policy UPLINK-DHCP</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Where each role goes">
<rect x="210" y="16" width="220" height="44" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">DIST1 + DIST2 (HSRP)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">send RAs, relay DHCPv6</text>
<rect x="220" y="110" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">ACCESS switch</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Po1 = Gi1/1/1 + Gi1/1/2</text>
<line x1="290" y1="60" x2="290" y2="110" stroke="#64748b" stroke-width="3"/><line x1="350" y1="60" x2="350" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="440" y="90" class="svg-accent" font-size="12">Po1: router / server / switch</text>
<rect x="20" y="200" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="223" text-anchor="middle" class="svg-ink" font-size="12">Users: host / client</text>
<rect x="240" y="200" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">AP: host, high limit</text>
<rect x="460" y="200" width="160" height="36" rx="8" fill="#fde68a"/><text x="540" y="223" text-anchor="middle" class="svg-ink" font-size="12">Silent server: static</text>
<line x1="270" y1="154" x2="100" y2="200" stroke="#64748b" stroke-width="2"/><line x1="320" y1="154" x2="320" y2="200" stroke="#64748b" stroke-width="2"/><line x1="370" y1="154" x2="540" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Roles follow the device behind the port: infrastructure roles on the uplink bundle, protective roles on the edge.</p></div>

<h3>Pitfalls that cause real outages</h3>
<dl class="terms">
<dt>Host role on the uplink</dt><dd>The most common outage: the real gateway's RAs or DHCPv6 replies are dropped on the trunk. Symptom: every host in the VLAN loses IPv6 at the same moment, and the policy's drop counter on the uplink climbs.</dd>
<dt>EtherChannel</dt><dd>Attach FHS policies to the <b>Port-channel</b> interface, not to its member ports. Policies on members are not supported or behave unpredictably, and a member moving in or out of the bundle can change which policy applies.</dd>
<dt>FHRP pairs</dt><dd>With HSRP for IPv6, the active router sends RAs from the virtual link-local (for group 1, <code>FE80::5:73FF:FEA0:1</code>, virtual MAC 0005.73a0.0001); with VRRPv3 the virtual link-local is configured. Both routers' ports need router/server roles, and any <code>match ipv6 access-list</code> in RA guard must permit the virtual address as well as the physical ones.</dd>
<dt>Address limits too low</dt><dd>Modern hosts use a link-local, a stable global and one or more temporary privacy addresses; virtual machines and containers add many more. A limit of 2 or 3 drops legitimate addresses.</dd>
<dt>Silent hosts and source guard</dt><dd>Printers, cameras and servers that rarely speak may be missing from the table. Add static bindings or enable data-glean first.</dd>
<dt>Wireless</dt><dd>Wireless controllers often run their own RA guard and IPv6 snooping for clients; the switch port to the AP or controller needs a policy that tolerates many client addresses.</dd>
<dt>Existing state</dt><dd>Attaching a policy does not clean hosts that already accepted a rogue RA or lease. Plan a client refresh (re-solicit, renew, or wait for lifetimes).</dd>
<dt>Hardware scale</dt><dd>Source guard entries are programmed in hardware; check the platform's supported binding and TCAM scale before enabling it on large VLANs.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> An access switch has 46 users. Glean phase shows 138 entries: 46 link-locals, 46 stable globals and 46 temporary addresses, so 3 per host. A limit of 10 gives headroom for a daily rotation of temporary addresses. The AP port shows 212 entries for 70 clients, so its policy gets a limit of 400.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>interface range</code> commands copied from another switch where the uplink was a different port number. Always check <code>show device-tracking policies</code> (or <code>show ipv6 snooping policies</code>) after applying a template and confirm the uplink carries only infrastructure roles.</p></div>

<div class="exam"><p><b>Exam trap.</b> On EtherChannel, the policy goes on the logical Port-channel. On FHRP, the router role is needed on both routers' ports, and the RA source is the virtual link-local.</p></div>

<div class="scn"><h4>Friday evening, whole floor down</h4><p>A change pushed RA guard to 60 access switches. On one model the uplink was Gi1/0/48 instead of Gi1/1/1, and the template's range included it. Within two minutes, 300 users lost IPv6 connectivity to the Internet; IPv4 kept working, so many apps slowed down while falling back. <code>show ipv6 nd raguard policy HOST-EDGE</code> showed hundreds of drops on Gi1/0/48. The engineer removed the policy from the uplink, attached a router-role policy, and asked users to reconnect. The post-mortem added a pre-check script that compares CDP/LLDP neighbours with the planned host ports.</p><p><b>Lesson:</b> verify port roles with neighbour discovery before attaching host policies at scale.</p></div>

<div class="iv"><p class="q">"How would you roll out IPv6 first-hop security in an existing campus without causing outages?"</p><p>Classify ports first (hosts, servers, APs, routers, uplinks). Start with device-tracking in glean mode to see the table. Then add RA guard host and DHCPv6 guard client on edge ports, with router and server roles on uplinks and FHRP ports. Move device-tracking to guard with tracking and address limits. Pilot source guard last, with static bindings for silent hosts. Attach to Port-channels, monitor SISF syslog, and verify each phase with the show commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify every port before applying policies; roles follow the device behind the port.</li>
<li>Phase it: glean, then RA/DHCPv6 guard, then guard level, then source guard.</li>
<li>Never host or client roles on uplinks; use router, server, switch or trusted-port.</li>
<li>Attach to Port-channel, not members; include both FHRP routers and the virtual link-local.</li>
<li>Size address limits for privacy addresses and VMs; add static bindings for silent hosts.</li>
</ul></div>
`,hi:`
<p>Jab housing society naya gate security lagati hai, to samajhdaar committee pehle din har gate lock nahi karti. Pehle guard bas dekhta hai aur likhta hai ki kaun aata-jaata hai. Phir residents ki gaadiyon par stickers lagte hain. Ek hafte ke saaf records ke baad hi gates ajnabiyon ko mana karna shuru karte hain. FHS ko bhi yahi sabr chahiye. Is module ka har feature galat port par lagne se outage kar sakta hai, aur outage aam taur par ek saath poore VLAN ko maarta hai.</p>

<h3>Step 0: apne ports jaano</h3>
<p>Ek bhi policy type karne se pehle, jin VLANs ko protect karoge unke har port ko classify karo:</p>
<table class="cmp"><tr><th>Port type</th><th>RA guard</th><th>DHCPv6 guard</th><th>Device-tracking</th><th>Source guard</th></tr>
<tr><td>User / printer / phone</td><td>host</td><td>client</td><td>node, guard, address limit</td><td>haan, table stable hone ke baad</td></tr>
<tr><td>Static address wala server</td><td>host</td><td>client</td><td>node, guard; silent ho to static binding</td><td>sirf static bindings ya data-glean ke saath</td></tr>
<tr><td>Hypervisor / AP / bahut clients</td><td>host</td><td>client</td><td>node, zyada address limit</td><td>dhyan se pilot</td></tr>
<tr><td>Asli router ya FHRP member</td><td>router (checks ke saath)</td><td>server</td><td>trusted-port ya koi policy nahi</td><td>nahi</td></tr>
<tr><td>Doosre switch ka uplink trunk</td><td>switch, router ya kuch nahi</td><td>server ya kuch nahi</td><td>device-role switch ya trusted-port</td><td>nahi</td></tr>
</table>

<h3>Phased rollout</h3>
<ol>
<li><b>Visibility.</b> User ports par <code>security-level glean</code> ke saath device-tracking attach karo. <code>show device-tracking database</code> check karo: kya saare hosts hain, har host ke kitne addresses, koi surprise?</li>
<li><b>Rogue infrastructure roko.</b> User ports par RA guard host policies aur DHCPv6 guard client policies; asli router aur uplink ports par router/server roles. In do features ka benefit-to-risk ratio sabse achha hai.</li>
<li><b>Ownership enforce karo.</b> Device-tracking ko <code>guard</code> par le jao, <code>tracking enable</code> aur <code>limit address-count</code> jodo.</li>
<li><b>Data plane.</b> Ek VLAN par IPv6 source guard pilot karo, drop counters aur syslog dekho, silent devices ke liye static bindings jodo, phir phailao.</li>
<li><b>Operate.</b> <code>%SISF</code> logs apne syslog server par bhejo aur IP_THEFT aur baar baar aane wale PAK_DROP par alert lagao.</li>
</ol>

<h3>Poora edge template (IOS XE)</h3>
<pre class="code">device-tracking policy USER-DT
 security-level guard
 tracking enable
 limit address-count 10
!
ipv6 nd raguard policy HOST-EDGE
 device-role host
ipv6 dhcp guard policy DHCP-CLIENTS
 device-role client
ipv6 source-guard policy EDGE-SG
!
interface range GigabitEthernet1/0/1 - 46
 device-tracking attach-policy USER-DT
 ipv6 nd raguard attach-policy HOST-EDGE
 ipv6 dhcp guard attach-policy DHCP-CLIENTS
 ipv6 source-guard attach-policy EDGE-SG
!
<span class="c">! Distribution ki taraf uplink port-channel: yahan kabhi host/client roles nahi</span>
device-tracking policy UPLINK-DT
 device-role switch
 trusted-port
ipv6 nd raguard policy UPLINK-RA
 device-role router
ipv6 dhcp guard policy UPLINK-DHCP
 device-role server
interface Port-channel1
 device-tracking attach-policy UPLINK-DT
 ipv6 nd raguard attach-policy UPLINK-RA
 ipv6 dhcp guard attach-policy UPLINK-DHCP</pre>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Har role kahan jaata hai">
<rect x="210" y="16" width="220" height="44" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">DIST1 + DIST2 (HSRP)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">RAs bhejte, DHCPv6 relay</text>
<rect x="220" y="110" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">ACCESS switch</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">Po1 = Gi1/1/1 + Gi1/1/2</text>
<line x1="290" y1="60" x2="290" y2="110" stroke="#64748b" stroke-width="3"/><line x1="350" y1="60" x2="350" y2="110" stroke="#64748b" stroke-width="3"/>
<text x="440" y="90" class="svg-accent" font-size="12">Po1: router / server / switch</text>
<rect x="20" y="200" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="100" y="223" text-anchor="middle" class="svg-ink" font-size="12">Users: host / client</text>
<rect x="240" y="200" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">AP: host, oonchi limit</text>
<rect x="460" y="200" width="160" height="36" rx="8" fill="#fde68a"/><text x="540" y="223" text-anchor="middle" class="svg-ink" font-size="12">Silent server: static</text>
<line x1="270" y1="154" x2="100" y2="200" stroke="#64748b" stroke-width="2"/><line x1="320" y1="154" x2="320" y2="200" stroke="#64748b" stroke-width="2"/><line x1="370" y1="154" x2="540" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Roles port ke peeche wale device ke hisaab se: uplink bundle par infrastructure roles, edge par protective roles.</p></div>

<h3>Pitfalls jo asli outages karte hain</h3>
<dl class="terms">
<dt>Uplink par host role</dt><dd>Sabse common outage: asli gateway ke RAs ya DHCPv6 replies trunk par drop ho jaate hain. Symptom: VLAN ka har host ek hi pal mein IPv6 kho deta hai, aur uplink par policy ka drop counter badhta hai.</dd>
<dt>EtherChannel</dt><dd>FHS policies <b>Port-channel</b> interface par attach karo, uske member ports par nahi. Members par policies supported nahi hain ya unpredictable behave karti hain, aur member ke bundle mein aane-jaane se laagu policy badal sakti hai.</dd>
<dt>FHRP pairs</dt><dd>IPv6 ke HSRP mein active router virtual link-local se RAs bhejta hai (group 1 ke liye <code>FE80::5:73FF:FEA0:1</code>, virtual MAC 0005.73a0.0001); VRRPv3 mein virtual link-local configure hota hai. Dono routers ke ports ko router/server roles chahiye, aur RA guard ka koi bhi <code>match ipv6 access-list</code> physical addresses ke saath virtual address bhi permit kare.</dd>
<dt>Address limits bahut kam</dt><dd>Modern hosts ek link-local, ek stable global aur ek ya zyada temporary privacy addresses use karte hain; virtual machines aur containers aur bahut jodte hain. 2 ya 3 ki limit jaayaz addresses drop karti hai.</dd>
<dt>Silent hosts aur source guard</dt><dd>Printers, cameras aur servers jo kam bolte hain table se missing ho sakte hain. Pehle static bindings jodo ya data-glean enable karo.</dd>
<dt>Wireless</dt><dd>Wireless controllers aksar clients ke liye apna RA guard aur IPv6 snooping chalate hain; AP ya controller ki taraf wale switch port ko aisi policy chahiye jo bahut client addresses bardasht kare.</dd>
<dt>Purani state</dt><dd>Policy attach karne se woh hosts saaf nahi hote jo pehle hi rogue RA ya lease accept kar chuke hain. Client refresh plan karo (re-solicit, renew, ya lifetimes ka intezaar).</dd>
<dt>Hardware scale</dt><dd>Source guard entries hardware mein program hoti hain; bade VLANs par enable karne se pehle platform ka supported binding aur TCAM scale check karo.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Ek access switch par 46 users hain. Glean phase 138 entries dikhata hai: 46 link-locals, 46 stable globals aur 46 temporary addresses, yaani har host ke 3. 10 ki limit temporary addresses ke daily rotation ke liye jagah deti hai. AP port 70 clients ke liye 212 entries dikhata hai, isliye uski policy ko 400 ki limit milti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Doosre switch se copy kiye <code>interface range</code> commands use karna jahan uplink ka port number alag tha. Template lagane ke baad hamesha <code>show device-tracking policies</code> (ya <code>show ipv6 snooping policies</code>) check karo aur confirm karo ki uplink par sirf infrastructure roles hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> EtherChannel par policy logical Port-channel par jaati hai. FHRP par dono routers ke ports ko router role chahiye, aur RA ka source virtual link-local hota hai.</p></div>

<div class="scn"><h4>Shukravaar shaam, poora floor down</h4><p>Ek change ne 60 access switches par RA guard push kiya. Ek model par uplink Gi1/1/1 ki jagah Gi1/0/48 tha, aur template ki range mein woh shaamil tha. Do minute mein 300 users ki IPv6 Internet connectivity chali gayi; IPv4 chalta raha, isliye kai apps fallback karte hue dheeme ho gaye. <code>show ipv6 nd raguard policy HOST-EDGE</code> ne Gi1/0/48 par sainkdon drops dikhaye. Engineer ne uplink se policy hatayi, router-role policy attach ki, aur users se reconnect karne ko kaha. Post-mortem mein ek pre-check script joda gaya jo CDP/LLDP neighbours ko planned host ports se compare karta hai.</p><p><b>Seekh:</b> bade paimane par host policies attach karne se pehle neighbour discovery se port roles verify karo.</p></div>

<div class="iv"><p class="q">"Existing campus mein bina outage ke IPv6 first-hop security kaise roll out karoge?"</p><p>Pehle ports classify karo (hosts, servers, APs, routers, uplinks). Table dekhne ke liye glean mode mein device-tracking se shuru karo. Phir edge ports par RA guard host aur DHCPv6 guard client jodo, uplinks aur FHRP ports par router aur server roles ke saath. Device-tracking ko tracking aur address limits ke saath guard par le jao. Source guard aakhir mein pilot karo, silent hosts ke liye static bindings ke saath. Port-channels par attach karo, SISF syslog monitor karo, aur har phase show commands se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies lagane se pehle har port classify karo; roles port ke peeche wale device ke hisaab se.</li>
<li>Phases mein: glean, phir RA/DHCPv6 guard, phir guard level, phir source guard.</li>
<li>Uplinks par kabhi host ya client roles nahi; router, server, switch ya trusted-port use karo.</li>
<li>Port-channel par attach karo, members par nahi; dono FHRP routers aur virtual link-local shaamil karo.</li>
<li>Privacy addresses aur VMs ke hisaab se address limits rakho; silent hosts ke liye static bindings jodo.</li>
</ul></div>
`}};export{e as default};