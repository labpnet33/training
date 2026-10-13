var e={id:`troubleshooting`,h:{en:`Troubleshooting IPv6: a repeatable workflow`,hi:`IPv6 troubleshooting: ek repeatable workflow`},body:{en:`
<p>A good doctor does not guess. She checks pulse, temperature and blood pressure in the same order every time, and the pattern of results points to the cause. IPv6 troubleshooting works the same way. Follow one fixed order, from the interface up to the routing table, and most tickets solve themselves in a few commands.</p>

<h3>The workflow</h3>
<ol>
<li><b>Interface and addresses.</b> <code>show ipv6 interface brief</code>: is the interface <code>[up/up]</code>? Is there a link-local and the expected global address? Any <code>[DUP]</code> or <code>[TEN]</code> flag?</li>
<li><b>Prefix and length.</b> Is the prefix correct, and is the LAN a <b>/64</b>? One wrong hextet puts a device in another subnet.</li>
<li><b>Router role.</b> <code>show running-config | include ipv6 unicast-routing</code> and <code>show ipv6 interface g0/0</code>: are RAs being sent (<code>ND router advertisements are sent every 200 seconds</code>) or suppressed? Does the interface join <code>FF02::2</code>? What do the "Hosts use..." lines say about M and O?</li>
<li><b>Host view.</b> <code>show ipv6</code> on the lab PC, <code>ipconfig /all</code> on Windows: only a link-local means no usable RA; check the gateway is the router's link-local.</li>
<li><b>Neighbours.</b> <code>show ipv6 neighbors</code>: an <code>INCMP</code> entry means NS sent, no NA back (wrong VLAN, cable, filter).</li>
<li><b>Routing, both directions.</b> <code>show ipv6 route</code> on every hop, for the destination <b>and</b> the return prefix.</li>
<li><b>Filters.</b> <code>show ipv6 access-list</code> and <code>show running-config | include traffic-filter</code>.</li>
<li><b>Prove it.</b> <code>ping</code> and <code>traceroute</code> with the right <code>source</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting order">
<rect x="10" y="40" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1-2 Interface</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">up, prefix, DUP</text>
<rect x="170" y="40" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="13">3-4 RA / host</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">routing on, M/O, /64</text>
<rect x="330" y="40" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">5 Neighbours</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">NS/NA, INCMP</text>
<rect x="490" y="40" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">6-8 Path</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">routes, ACLs, ping</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">Stop at the first step that fails; fix it; re-test from step 1</text>
</svg><p class="cap">Bottom-up: link, then addressing and RAs, then neighbours, then routing and filters.</p></div>

<h3>Symptom to cause</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th><th>Fix</th></tr>
<tr><td>Host has only an fe80 address; PC says <code>No router answered ICMPv6 Router Solicitation</code></td><td>No RA: <code>ipv6 unicast-routing</code> missing, <code>ipv6 nd ra suppress all</code>, router port down, RA Guard</td><td><code>show ipv6 interface g0/0</code> on the router</td><td>Enable routing, remove the suppress, fix the port</td></tr>
<tr><td>PC says <code>No usable /64 prefix in the Router Advertisement</code></td><td>LAN prefix not /64, or prefix sent with <code>no-autoconfig</code></td><td><code>show ipv6 routers</code>, running config</td><td>Use /64; remove <code>no-autoconfig</code> if SLAAC is wanted</td></tr>
<tr><td>PC says the router <code>asks hosts to use DHCPv6 (M flag set)</code></td><td><code>ipv6 nd managed-config-flag</code> with no SLAAC prefix</td><td><code>show ipv6 dhcp pool</code></td><td>Provide a DHCPv6 pool or relay, or clear the M flag</td></tr>
<tr><td>Address shows <code>[DUP]</code></td><td>Same address on two devices</td><td>Log <code>%IPV6_ND-4-DUPLICATE</code></td><td>Readdress one device</td></tr>
<tr><td>Gateway pings, remote networks do not</td><td>Missing route on some hop, often the return path</td><td><code>show ipv6 route</code> on every hop, <code>traceroute</code></td><td>Add the missing static or default route</td></tr>
<tr><td>Static route rejected</td><td>Link-local next hop without interface</td><td>The error message</td><td>Use the fully specified form</td></tr>
<tr><td>Neighbour stuck in <code>INCMP</code></td><td>ACL dropping NS/NA, wrong VLAN</td><td><code>show ipv6 access-list</code></td><td>Permit ND before any explicit deny</td></tr></table>

<h3>IPv6 ACLs and Neighbor Discovery</h3>
<p>Every IPv6 ACL ends with three implicit lines: <code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code>. So ND keeps working by default. But if you add your own <code>deny ipv6 any any</code> (for logging, say), your line comes first and the implicit permits are never reached: NS and NA die and neighbours go <code>INCMP</code>. RS and RA are <b>not</b> implicitly permitted, so an inbound ACL on a host-facing router port must permit them if you want SLAAC.</p>

<h3>Ticket walkthrough: "Host gets no IPv6 address"</h3>
<p><b>Ticket:</b> "Training room PCs show no IPv6 address since this morning's change." This is the lab 2 room: R1 G0/0 should advertise <code>2001:db8:cafe:1::/64</code>.</p>
<pre class="out">PC1&gt; ip auto
<span class="hl">No router answered ICMPv6 Router Solicitation</span>

R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  Global unicast address(es):
    2001:DB8:CAFE:1:5054:CFF:FE04:4B01, subnet is 2001:DB8:CAFE:1::/64 [EUI]
  Joined group address(es):
    FF02::1
    FF02::1:FF04:4B01
  MTU is 1500 bytes
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)</pre>
<div class="eg"><p><b>Diagnosis.</b> Steps 1 and 2 pass: the interface is up and the /64 EUI-64 address is there. Step 3 fails: there is <b>no FF02::2</b> in the joined groups and <b>no RA lines</b> at all (no "ND router advertisements are sent...", no "Hosts use..."). Both mean the router is not acting as an IPv6 router. <code>show running-config | include ipv6 unicast</code> returns nothing: the change had removed <code>ipv6 unicast-routing</code>. Fix: <code>R1(config)# ipv6 unicast-routing</code>. <code>show ipv6 interface g0/0</code> now shows <code>FF02::2</code> and <code>ND router advertisements are sent every 200 seconds</code>, and <code>ip auto</code> on PC1 returns a <code>2001:db8:cafe:1:</code> address with R1's link-local as gateway.</p></div>
<p>The same ticket can have other causes, and the checks above separate them: if the RA lines say <code>ND RAs are suppressed (all)</code>, remove <code>ipv6 nd ra suppress all</code>; if the address shows <code>subnet is 2001:DB8:CAFE:1::/63</code>, correct the prefix length to /64.</p>

<div class="warn"><p><b>Common mistakes.</b> Troubleshooting the host first when the router sends no RA; pinging without <code>source</code> and declaring the network fine; adding an explicit <code>deny ipv6 any any</code> without ND permits; and fixing only the forward route.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A host has only a link-local address" nearly always means "no usable RA". "The host can ping its gateway but not a remote network" points at routing, often the return path. Know the three implicit lines at the end of an IPv6 ACL.</p></div>

<div class="scn"><h4>The logging ACL that broke a server VLAN</h4><p>To see dropped traffic, an engineer added <code>deny ipv6 any any log</code> to the end of the IPv6 ACL applied inbound on a server VLAN gateway. Minutes later all servers in the VLAN lost IPv6. <code>show ipv6 neighbors</code> on the gateway showed the servers as <code>INCMP</code>, and the ACL hit counter on the new deny line was climbing fast. The explicit deny matched the servers' Neighbor Solicitations and Advertisements before the implicit ND permits could. The engineer inserted <code>permit icmp any any nd-ns</code> and <code>permit icmp any any nd-na</code> above the deny, and the neighbours returned to <code>REACH</code>.</p><p><b>Lesson:</b> if you write your own final deny in an IPv6 ACL, write the ND permits yourself too.</p></div>

<div class="iv"><p class="q">"A user says their laptop has no IPv6 address. How do you troubleshoot it?"</p><p>Strong answer: check what the laptop has; a link-local only means it got no usable RA. On the gateway, confirm the interface is up with a /64, that ipv6 unicast-routing is on, RAs are not suppressed and the interface joined FF02::2, and read the M/O flags. If M is set, check the DHCPv6 pool or relay. Look for RA Guard or ACLs blocking RS/RA on the path, and for [DUP] addresses. Finish with ping and traceroute from the host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom-up: interface, prefix, RA and flags, host view, neighbours, routes both ways, ACLs, then test.</li>
<li>Link-local only on a host means no usable RA: check ipv6 unicast-routing, RA suppression, /64 and M flag.</li>
<li>Missing FF02::2 and missing RA lines in show ipv6 interface mean the router is not routing IPv6.</li>
<li>IPv6 ACLs implicitly permit nd-ns and nd-na before the implicit deny; an explicit deny ipv6 any any breaks ND.</li>
<li>Always test with source addresses that match real users, and check the return path.</li>
</ul></div>
`,hi:`
<p>Achhi doctor andaaza nahi lagati. Woh har baar same order mein pulse, temperature aur blood pressure check karti hai, aur results ka pattern wajah ki taraf ishaara karta hai. IPv6 troubleshooting bhi aise hi chalti hai. Interface se routing table tak ek fixed order follow karo, aur zyada tar tickets kuch hi commands mein khud solve ho jaate hain.</p>

<h3>Workflow</h3>
<ol>
<li><b>Interface aur addresses.</b> <code>show ipv6 interface brief</code>: kya interface <code>[up/up]</code> hai? Link-local aur expected global address hai? Koi <code>[DUP]</code> ya <code>[TEN]</code> flag?</li>
<li><b>Prefix aur length.</b> Prefix sahi hai, aur LAN <b>/64</b> hai? Ek galat hextet device ko doosre subnet mein daal deta hai.</li>
<li><b>Router role.</b> <code>show running-config | include ipv6 unicast-routing</code> aur <code>show ipv6 interface g0/0</code>: RAs bhej rahe hain (<code>ND router advertisements are sent every 200 seconds</code>) ya suppressed hain? Interface <code>FF02::2</code> join karta hai? "Hosts use..." lines M aur O ke baare mein kya kehti hain?</li>
<li><b>Host ka view.</b> Lab PC par <code>show ipv6</code>, Windows par <code>ipconfig /all</code>: sirf link-local ka matlab koi usable RA nahi; check karo ki gateway router ka link-local hai.</li>
<li><b>Neighbours.</b> <code>show ipv6 neighbors</code>: <code>INCMP</code> entry ka matlab NS gaya, NA wapas nahi aaya (galat VLAN, cable, filter).</li>
<li><b>Routing, dono direction.</b> Har hop par <code>show ipv6 route</code>, destination <b>aur</b> return prefix dono ke liye.</li>
<li><b>Filters.</b> <code>show ipv6 access-list</code> aur <code>show running-config | include traffic-filter</code>.</li>
<li><b>Saabit karo.</b> Sahi <code>source</code> ke saath <code>ping</code> aur <code>traceroute</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting order">
<rect x="10" y="40" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">1-2 Interface</text><text x="80" y="80" text-anchor="middle" class="svg-muted" font-size="12">up, prefix, DUP</text>
<rect x="170" y="40" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="13">3-4 RA / host</text><text x="240" y="80" text-anchor="middle" class="svg-muted" font-size="12">routing on, M/O, /64</text>
<rect x="330" y="40" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="13">5 Neighbours</text><text x="400" y="80" text-anchor="middle" class="svg-muted" font-size="12">NS/NA, INCMP</text>
<rect x="490" y="40" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">6-8 Path</text><text x="560" y="80" text-anchor="middle" class="svg-muted" font-size="12">routes, ACLs, ping</text>
<line x1="150" y1="65" x2="170" y2="65" stroke="#64748b" stroke-width="2"/><line x1="310" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><line x1="470" y1="65" x2="490" y2="65" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">Pehle fail hone wale step par ruko; theek karo; step 1 se dobara test karo</text>
</svg><p class="cap">Neeche se upar: link, phir addressing aur RAs, phir neighbours, phir routing aur filters.</p></div>

<h3>Symptom se wajah</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit wajah</th><th>Check</th><th>Fix</th></tr>
<tr><td>Host ke paas sirf fe80 address; PC kehta hai <code>No router answered ICMPv6 Router Solicitation</code></td><td>RA nahi: <code>ipv6 unicast-routing</code> missing, <code>ipv6 nd ra suppress all</code>, router port down, RA Guard</td><td>Router par <code>show ipv6 interface g0/0</code></td><td>Routing enable karo, suppress hatao, port theek karo</td></tr>
<tr><td>PC kehta hai <code>No usable /64 prefix in the Router Advertisement</code></td><td>LAN prefix /64 nahi, ya prefix <code>no-autoconfig</code> ke saath gaya</td><td><code>show ipv6 routers</code>, running config</td><td>/64 use karo; SLAAC chahiye to <code>no-autoconfig</code> hatao</td></tr>
<tr><td>PC kehta hai router <code>asks hosts to use DHCPv6 (M flag set)</code></td><td>Bina SLAAC prefix ke <code>ipv6 nd managed-config-flag</code></td><td><code>show ipv6 dhcp pool</code></td><td>DHCPv6 pool ya relay do, ya M flag clear karo</td></tr>
<tr><td>Address <code>[DUP]</code> dikhata hai</td><td>Do devices par same address</td><td>Log <code>%IPV6_ND-4-DUPLICATE</code></td><td>Ek device ko readdress karo</td></tr>
<tr><td>Gateway ping hota hai, remote networks nahi</td><td>Kisi hop par route missing, aksar return path</td><td>Har hop par <code>show ipv6 route</code>, <code>traceroute</code></td><td>Missing static ya default route jodo</td></tr>
<tr><td>Static route reject hua</td><td>Bina interface ke link-local next hop</td><td>Error message</td><td>Fully specified form use karo</td></tr>
<tr><td>Neighbour <code>INCMP</code> mein atka</td><td>ACL NS/NA drop kar raha, galat VLAN</td><td><code>show ipv6 access-list</code></td><td>Kisi bhi explicit deny se pehle ND permit karo</td></tr></table>

<h3>IPv6 ACLs aur Neighbor Discovery</h3>
<p>Har IPv6 ACL teen implicit lines ke saath khatam hota hai: <code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code>. Isliye default mein ND chalta rehta hai. Par agar aap apni <code>deny ipv6 any any</code> jodte ho (jaise logging ke liye), aapki line pehle aati hai aur implicit permits tak kabhi pahuncha hi nahi jaata: NS aur NA mar jaate hain aur neighbours <code>INCMP</code> ho jaate hain. RS aur RA implicitly permitted <b>nahi</b> hain, isliye host-facing router port par inbound ACL ko SLAAC chahiye to unhe permit karna padega.</p>

<h3>Ticket walkthrough: "Host ko IPv6 address nahi milta"</h3>
<p><b>Ticket:</b> "Aaj subah ke change ke baad se training room PCs koi IPv6 address nahi dikhate." Yeh lab 2 ka room hai: R1 G0/0 ko <code>2001:db8:cafe:1::/64</code> advertise karna chahiye.</p>
<pre class="out">PC1&gt; ip auto
<span class="hl">No router answered ICMPv6 Router Solicitation</span>

R1# show ipv6 interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  IPv6 is enabled, link-local address is FE80::5054:CFF:FE04:4B01
  Global unicast address(es):
    2001:DB8:CAFE:1:5054:CFF:FE04:4B01, subnet is 2001:DB8:CAFE:1::/64 [EUI]
  Joined group address(es):
    FF02::1
    FF02::1:FF04:4B01
  MTU is 1500 bytes
  ND DAD is enabled, number of DAD attempts: 1
  ND reachable time is 30000 milliseconds (using 30000)</pre>
<div class="eg"><p><b>Diagnosis.</b> Step 1 aur 2 pass: interface up hai aur /64 EUI-64 address maujood hai. Step 3 fail: joined groups mein <b>FF02::2 nahi</b> hai aur <b>RA lines bilkul nahi</b> hain (na "ND router advertisements are sent...", na "Hosts use..."). Dono ka matlab router IPv6 router ki tarah kaam nahi kar raha. <code>show running-config | include ipv6 unicast</code> kuch nahi deta: change ne <code>ipv6 unicast-routing</code> hata diya tha. Fix: <code>R1(config)# ipv6 unicast-routing</code>. Ab <code>show ipv6 interface g0/0</code> <code>FF02::2</code> aur <code>ND router advertisements are sent every 200 seconds</code> dikhata hai, aur PC1 par <code>ip auto</code> R1 ke link-local ko gateway banakar <code>2001:db8:cafe:1:</code> wala address deta hai.</p></div>
<p>Isi ticket ki doosri wajahein bhi ho sakti hain, aur upar ke checks unhe alag karte hain: agar RA lines <code>ND RAs are suppressed (all)</code> kehti hain, to <code>ipv6 nd ra suppress all</code> hatao; agar address <code>subnet is 2001:DB8:CAFE:1::/63</code> dikhata hai, to prefix length /64 karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Jab router RA hi nahi bhej raha tab pehle host ko troubleshoot karna; bina <code>source</code> ke ping karke network ko theek ghoshit karna; bina ND permits ke explicit <code>deny ipv6 any any</code> jodna; aur sirf forward route theek karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Host ke paas sirf link-local address hai" ka matlab lagbhag hamesha "koi usable RA nahi". "Host gateway ping kar leta hai par remote network nahi" routing ki taraf ishaara karta hai, aksar return path. IPv6 ACL ke end ki teen implicit lines yaad rakho.</p></div>

<div class="scn"><h4>Logging ACL jisne server VLAN tod diya</h4><p>Dropped traffic dekhne ke liye ek engineer ne server VLAN gateway par inbound lage IPv6 ACL ke end mein <code>deny ipv6 any any log</code> jod diya. Kuch minute baad VLAN ke saare servers ka IPv6 chala gaya. Gateway par <code>show ipv6 neighbors</code> ne servers ko <code>INCMP</code> dikhaya, aur nayi deny line ka ACL hit counter tezi se badh raha tha. Explicit deny ne servers ke Neighbor Solicitations aur Advertisements ko implicit ND permits se pehle hi match kar liya. Engineer ne deny ke upar <code>permit icmp any any nd-ns</code> aur <code>permit icmp any any nd-na</code> daale, aur neighbours wapas <code>REACH</code> par aa gaye.</p><p><b>Seekh:</b> agar IPv6 ACL mein apni final deny likhte ho, to ND permits bhi khud likho.</p></div>

<div class="iv"><p class="q">"User kehta hai uske laptop ke paas IPv6 address nahi hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: dekho laptop ke paas kya hai; sirf link-local ka matlab use koi usable RA nahi mila. Gateway par confirm karo ki interface /64 ke saath up hai, ipv6 unicast-routing on hai, RAs suppressed nahi hain aur interface ne FF02::2 join kiya hai, aur M/O flags padho. M set hai to DHCPv6 pool ya relay check karo. Path par RS/RA block karne wale RA Guard ya ACLs dhoondho, aur [DUP] addresses bhi. Host se ping aur traceroute ke saath khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar kaam karo: interface, prefix, RA aur flags, host view, neighbours, dono taraf routes, ACLs, phir test.</li>
<li>Host par sirf link-local ka matlab koi usable RA nahi: ipv6 unicast-routing, RA suppression, /64 aur M flag check karo.</li>
<li>show ipv6 interface mein FF02::2 aur RA lines ka na hona matlab router IPv6 route nahi kar raha.</li>
<li>IPv6 ACLs implicit deny se pehle nd-ns aur nd-na ko implicitly permit karte hain; explicit deny ipv6 any any ND tod deta hai.</li>
<li>Hamesha asli users se match karne wale source addresses se test karo, aur return path check karo.</li>
</ul></div>
`}};export{e as default};