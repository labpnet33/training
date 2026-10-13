var e={id:`multicast`,h:{en:`Multicast design: PIM modes, RP, MSDP and snooping`,hi:`Multicast design: PIM modes, RP, MSDP aur snooping`},body:{en:`
<h3>Customer case: Meridian Securities</h3>
<div class="eg"><p><b>Company:</b> Meridian Securities, a brokerage with 900 staff. <b>Sites:</b> two data centers (East and West, 12 km apart on dark fibre), a trading floor of 300 desks in East, and 6 regional offices. <b>Traffic:</b> a market-data provider delivers 1,800 feed groups (about 600 Mb/s total) as multicast, and an internal pricing engine publishes quotes to the trading desks. A training team also streams all-hands video to offices. <b>Problems:</b> the old design used one rendezvous point (RP) in East, so when East lost power during a test, market data stopped for West-based algorithmic servers. The trading floor VLANs also flood multicast to every port. <b>Constraints:</b> failover under 5 seconds, no new hardware, and the provider's feeds are sourced from known addresses.</p></div>

<h3>Why multicast, and the problem it solves</h3>
<p>Analogy: a radio station broadcasts once, and everyone tuned in hears it. Unicast is a phone call to each listener. If 300 traders need the same feed, unicast would send 300 copies. <b>Multicast</b> sends one copy per link, and routers replicate it only where receivers exist. Receivers tell the last-hop router with <b>IGMP</b> (IPv4) or MLD (IPv6) that they want a group. Routers build trees with <b>PIM (Protocol Independent Multicast)</b>, which uses the unicast routing table for its reverse-path check (RPF).</p>

<h3>PIM modes: choosing the right one</h3>
<table class="cmp"><tr><th>Mode</th><th>How it works</th><th>Best for</th><th>Watch out</th></tr>
<tr><td><b>PIM-SM</b> (sparse mode)</td><td>Receivers join a shared tree rooted at an RP; after traffic arrives, last-hop routers can switch to a source tree (SPT)</td><td>General enterprise, many groups, sources not known in advance</td><td>RP design and RP failure</td></tr>
<tr><td><b>PIM-SSM</b></td><td>Receivers join a specific (source, group) using IGMPv3; default range 232.0.0.0/8; no RP</td><td>Known sources: market data, IPTV, one-to-many</td><td>Needs IGMPv3 on hosts and switches; host must know the source</td></tr>
<tr><td><b>PIM BiDir</b></td><td>One shared bidirectional tree through the RP; no source state, no registration</td><td>Many-to-many, many sources and receivers in the same group</td><td>All traffic via the RP path; careful RP placement</td></tr>
<tr><td>Dense mode</td><td>Flood and prune</td><td>Avoid in new designs</td><td>Scales poorly</td></tr></table>

<h3>RP design and discovery</h3>
<p>In PIM-SM every router must know the RP for each group. There are three ways to learn it:</p>
<ul>
<li><b>Static RP:</b> simplest and most predictable; configured on each router.</li>
<li><b>Auto-RP:</b> Cisco proprietary; candidate RPs announce, a mapping agent distributes. It needs a way to carry the discovery groups in sparse mode.</li>
<li><b>BSR (bootstrap router):</b> open standard; candidate RPs advertise to the elected BSR, which floods the RP-set.</li>
</ul>
<p>For redundancy use <b>anycast RP</b>: two RPs share the same loopback address. Routing sends each router to the nearest. Because sources and receivers may register with different RPs, the RPs must share source information. Two ways: <b>MSDP</b> (Multicast Source Discovery Protocol) peering between them, or PIM-based anycast RP (RFC 4610), which needs no MSDP. MSDP is also how separate PIM domains (for example two companies or two ASes) exchange active sources.</p>

<h3>Options and the chosen design for Meridian</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Single RP with static address</td><td>Simple</td><td>Single point of failure (what happened)</td></tr>
<tr><td>Auto-RP / BSR with candidate RPs</td><td>Dynamic failover</td><td>Convergence in tens of seconds by default; more moving parts</td></tr>
<tr><td>Anycast RP East/West with MSDP</td><td>Failover at IGP speed; load sharing</td><td>MSDP configuration and loopback hygiene</td></tr>
<tr><td>SSM for market data</td><td>No RP dependency; secure by design</td><td>Requires IGMPv3 on servers and desks</td></tr></table>
<p><b>Chosen:</b> use <b>PIM-SSM</b> for the 1,800 provider feeds because the sources are known, so market data no longer depends on any RP. Use <b>anycast RP with MSDP</b> (East and West, address 198.51.100.100) with PIM-SM for the internal pricing engine and training video, whose sources are not fixed. On the trading floor use <b>IGMP snooping</b> with an IGMP querier so each switch sends a group only to subscribed ports. Tune the IGP for sub-5-second reconvergence (BFD and fast hellos) as the RP failover depends on it.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Anycast RP with MSDP between two data centers">
<rect x="20" y="30" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">RP East</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.100</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="13">RP West</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.100</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="56" text-anchor="middle" class="svg-accent" font-size="12">MSDP peering</text>
<rect x="20" y="150" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="180" text-anchor="middle" class="svg-ink" font-size="13">Pricing source</text>
<rect x="500" y="150" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="13">West servers</text>
<rect x="260" y="150" width="120" height="50" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Trading floor</text>
<line x1="80" y1="150" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="560" y1="150" x2="535" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="150" x2="150" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="222" width="14" height="14" fill="#ddd6fe"/><text x="40" y="234" class="svg-ink" font-size="12">RP (same IP)</text>
<rect x="150" y="222" width="14" height="14" fill="#bae6fd"/><text x="170" y="234" class="svg-ink" font-size="12">source</text>
<rect x="240" y="222" width="14" height="14" fill="#bbf7d0"/><text x="260" y="234" class="svg-ink" font-size="12">receivers</text>
<rect x="350" y="222" width="14" height="14" fill="#fed7aa"/><text x="370" y="234" class="svg-ink" font-size="12">IGMP snooping</text>
</svg><p class="cap">Both RPs answer for the same address; MSDP lets each learn the sources registered at the other.</p></div>

<pre class="code">ip multicast-routing
ip pim ssm default
ip pim rp-address 198.51.100.100
<span class="c">! RP East: anycast loopback plus a unique MSDP loopback</span>
interface Loopback100
 ip address 198.51.100.100 255.255.255.255
 ip pim sparse-mode
interface Loopback1
 ip address 192.0.2.1 255.255.255.255
 ip pim sparse-mode
ip msdp peer 192.0.2.2 connect-source Loopback1
ip msdp originator-id Loopback1
<span class="c">! Receiver-facing interface on a trading VLAN SVI</span>
interface Vlan310
 ip pim sparse-mode
 ip igmp version 3</pre>
<pre class="out">RP-East# show ip msdp peer 192.0.2.2
MSDP peer 192.0.2.2 (?), AS ?
  Connection status:
    <span class="hl">State: Up</span>, Resets: 0, Connection source: Loopback1 (192.0.2.1)
RP-East# show ip mroute 232.1.1.1
(203.0.113.10, 232.1.1.1), 00:12:08/00:03:21, flags: sT</pre>

<h3>Multicast over the WAN and the fabric</h3>
<ul>
<li><b>MPLS WAN:</b> if the provider does not support multicast, tunnel it (GRE with PIM) or buy a multicast VPN (mVPN) service. DMVPN supports multicast with the hub replicating to spokes, which is bandwidth-intensive on the hub.</li>
<li><b>SD-WAN:</b> supports multicast by running PIM on the service side with a replicator device; plan replicators at hubs.</li>
<li><b>SD-Access:</b> overlay multicast uses either head-end replication (unicast copies by the border/edge) or native multicast using PIM-SSM in the underlay. Native is more efficient with many receivers; head-end needs no underlay change.</li>
<li><b>Layer 2:</b> IGMP snooping stops flooding; one querier per VLAN is required if there is no PIM router in the VLAN.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ip pim sparse-mode</code> on one hop (RPF and join fail); using IGMPv2 hosts with SSM without a mapping; using the same address for anycast and the MSDP source; relying on Auto-RP or BSR timers when failover must be fast.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM needs IGMPv3 and has no RP. BiDir has no source registration and no SPT switchover. Anycast RP needs MSDP (or RFC 4610 PIM anycast).</p></div>

<div class="scn"><h4>Post-mortem: two RPs, same group, silence</h4><p>During the first failover test, West servers stopped receiving internal quotes. Both RPs were up, but the MSDP session was down because the MSDP peer was sourced from the anycast loopback, which routed to the local RP instead of the neighbour. West RP never learned the East source. They sourced MSDP from the unique loopback and set the originator ID.</p><p><b>Lesson:</b> anycast address for PIM, unique address for MSDP.</p></div>

<div class="iv"><p class="q">"How would you make the RP highly available and why not simply Auto-RP?"</p><p>Anycast RP with MSDP: both RPs use the same address, the IGP picks the nearest, failover is at routing speed, and load is shared. Auto-RP and BSR also fail over but depend on timers. For known sources, avoid the RP entirely with SSM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose SM for general use, SSM for known sources, BiDir for many-to-many.</li>
<li>RP discovery: static, Auto-RP (Cisco), BSR (standard); redundancy via anycast RP with MSDP.</li>
<li>IGMP snooping and a querier keep multicast off ports without receivers.</li>
<li>WAN multicast needs provider mVPN, GRE or DMVPN replication; SD-Access offers head-end or native replication.</li>
<li>RPF and unicast routing underpin everything; verify with show ip mroute.</li>
</ul></div>
`,hi:`
<h3>Customer case: Meridian Securities</h3>
<div class="eg"><p><b>Company:</b> Meridian Securities, 900 staff wali brokerage. <b>Sites:</b> do data centers (East aur West, dark fibre par 12 km door), East mein 300 desks ka trading floor, aur 6 regional offices. <b>Traffic:</b> market-data provider 1,800 feed groups (kul lagbhag 600 Mb/s) multicast mein deta hai, aur ek internal pricing engine trading desks ko quotes publish karta hai. Training team offices ko all-hands video bhi stream karti hai. <b>Problems:</b> purane design mein East mein ek hi rendezvous point (RP) tha, isliye test ke dauraan East ki power jaane par West ke algorithmic servers ka market data ruk gaya. Trading floor VLANs multicast ko har port par flood bhi karte hain. <b>Constraints:</b> failover 5 second se kam, naya hardware nahi, aur provider ke feeds known addresses se aate hain.</p></div>

<h3>Multicast kyun, aur kaunsi problem solve karta hai</h3>
<p>Analogy: radio station ek baar broadcast karta hai aur jo bhi tuned hai sab sunta hai. Unicast har listener ko alag phone call hai. Agar 300 traders ko same feed chahiye, to unicast 300 copies bhejta. <b>Multicast</b> har link par ek copy bhejta hai, aur routers use sirf wahin replicate karte hain jahan receivers hain. Receivers last-hop router ko <b>IGMP</b> (IPv4) ya MLD (IPv6) se batate hain ki unhe group chahiye. Routers <b>PIM (Protocol Independent Multicast)</b> se trees banate hain, jo apne reverse-path check (RPF) ke liye unicast routing table use karta hai.</p>

<h3>PIM modes: sahi mode chunna</h3>
<table class="cmp"><tr><th>Mode</th><th>Kaise kaam karta hai</th><th>Best for</th><th>Dhyan rakho</th></tr>
<tr><td><b>PIM-SM</b> (sparse mode)</td><td>Receivers RP par rooted shared tree join karte hain; traffic aane ke baad last-hop routers source tree (SPT) par switch kar sakte hain</td><td>General enterprise, bahut groups, sources pehle se unknown</td><td>RP design aur RP failure</td></tr>
<tr><td><b>PIM-SSM</b></td><td>Receivers IGMPv3 se specific (source, group) join karte hain; default range 232.0.0.0/8; RP nahi</td><td>Known sources: market data, IPTV, one-to-many</td><td>Hosts aur switches par IGMPv3 chahiye; host ko source pata hona chahiye</td></tr>
<tr><td><b>PIM BiDir</b></td><td>RP ke through ek shared bidirectional tree; source state nahi, registration nahi</td><td>Many-to-many, ek hi group mein bahut sources aur receivers</td><td>Saara traffic RP path se; RP placement dhyan se</td></tr>
<tr><td>Dense mode</td><td>Flood aur prune</td><td>Naye designs mein avoid karo</td><td>Scale kharab</td></tr></table>

<h3>RP design aur discovery</h3>
<p>PIM-SM mein har router ko har group ka RP pata hona chahiye. Seekhne ke teen tareeke:</p>
<ul>
<li><b>Static RP:</b> sabse simple aur predictable; har router par configure.</li>
<li><b>Auto-RP:</b> Cisco proprietary; candidate RPs announce karte hain, mapping agent distribute karta hai. Sparse mode mein discovery groups carry karne ka tareeka chahiye.</li>
<li><b>BSR (bootstrap router):</b> open standard; candidate RPs elected BSR ko advertise karte hain, jo RP-set flood karta hai.</li>
</ul>
<p>Redundancy ke liye <b>anycast RP</b> use karo: do RPs ek hi loopback address share karte hain. Routing har router ko nearest wale tak bhejti hai. Kyunki sources aur receivers alag RPs ke saath register ho sakte hain, RPs ko source information share karni padti hai. Do tareeke: unke beech <b>MSDP</b> (Multicast Source Discovery Protocol) peering, ya PIM-based anycast RP (RFC 4610) jisme MSDP nahi chahiye. MSDP se alag PIM domains (jaise do companies ya do ASes) bhi active sources exchange karte hain.</p>

<h3>Options aur Meridian ka chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Static address wala single RP</td><td>Simple</td><td>Single point of failure (jo hua)</td></tr>
<tr><td>Candidate RPs ke saath Auto-RP / BSR</td><td>Dynamic failover</td><td>Default mein convergence kai second; zyada moving parts</td></tr>
<tr><td>MSDP ke saath East/West anycast RP</td><td>IGP speed par failover; load sharing</td><td>MSDP configuration aur loopback hygiene</td></tr>
<tr><td>Market data ke liye SSM</td><td>RP dependency nahi; design se secure</td><td>Servers aur desks par IGMPv3 chahiye</td></tr></table>
<p><b>Chosen:</b> 1,800 provider feeds ke liye <b>PIM-SSM</b> use karo kyunki sources known hain, isliye market data ab kisi RP par depend nahi karta. Internal pricing engine aur training video ke liye, jinke sources fixed nahi, PIM-SM ke saath <b>MSDP wala anycast RP</b> (East aur West, address 198.51.100.100). Trading floor par IGMP querier ke saath <b>IGMP snooping</b> lagao taaki har switch group sirf subscribed ports ko bheje. IGP ko 5 second se kam reconvergence ke liye tune karo (BFD aur fast hellos) kyunki RP failover usi par depend karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do data centers ke beech MSDP ke saath anycast RP">
<rect x="20" y="30" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">RP East</text><text x="105" y="78" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.100</text>
<rect x="450" y="30" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="13">RP West</text><text x="535" y="78" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.100</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="320" y="56" text-anchor="middle" class="svg-accent" font-size="12">MSDP peering</text>
<rect x="20" y="150" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="180" text-anchor="middle" class="svg-ink" font-size="13">Pricing source</text>
<rect x="500" y="150" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="180" text-anchor="middle" class="svg-ink" font-size="13">West servers</text>
<rect x="260" y="150" width="120" height="50" rx="8" fill="#fed7aa"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Trading floor</text>
<line x1="80" y1="150" x2="105" y2="100" stroke="#64748b" stroke-width="2"/><line x1="560" y1="150" x2="535" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="150" x2="150" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="222" width="14" height="14" fill="#ddd6fe"/><text x="40" y="234" class="svg-ink" font-size="12">RP (same IP)</text>
<rect x="150" y="222" width="14" height="14" fill="#bae6fd"/><text x="170" y="234" class="svg-ink" font-size="12">source</text>
<rect x="240" y="222" width="14" height="14" fill="#bbf7d0"/><text x="260" y="234" class="svg-ink" font-size="12">receivers</text>
<rect x="350" y="222" width="14" height="14" fill="#fed7aa"/><text x="370" y="234" class="svg-ink" font-size="12">IGMP snooping</text>
</svg><p class="cap">Dono RPs same address ka jawab dete hain; MSDP se har ek doosre ke paas register hue sources seekh leta hai.</p></div>

<pre class="code">ip multicast-routing
ip pim ssm default
ip pim rp-address 198.51.100.100
<span class="c">! RP East: anycast loopback plus a unique MSDP loopback</span>
interface Loopback100
 ip address 198.51.100.100 255.255.255.255
 ip pim sparse-mode
interface Loopback1
 ip address 192.0.2.1 255.255.255.255
 ip pim sparse-mode
ip msdp peer 192.0.2.2 connect-source Loopback1
ip msdp originator-id Loopback1
<span class="c">! Receiver-facing interface on a trading VLAN SVI</span>
interface Vlan310
 ip pim sparse-mode
 ip igmp version 3</pre>
<pre class="out">RP-East# show ip msdp peer 192.0.2.2
MSDP peer 192.0.2.2 (?), AS ?
  Connection status:
    <span class="hl">State: Up</span>, Resets: 0, Connection source: Loopback1 (192.0.2.1)
RP-East# show ip mroute 232.1.1.1
(203.0.113.10, 232.1.1.1), 00:12:08/00:03:21, flags: sT</pre>

<h3>WAN aur fabric par multicast</h3>
<ul>
<li><b>MPLS WAN:</b> agar provider multicast support nahi karta, to use tunnel karo (GRE ke saath PIM) ya multicast VPN (mVPN) service kharido. DMVPN multicast support karta hai jisme hub spokes ko replicate karta hai, jo hub par bandwidth-intensive hai.</li>
<li><b>SD-WAN:</b> service side par PIM chalakar replicator device ke saath multicast support karta hai; hubs par replicators plan karo.</li>
<li><b>SD-Access:</b> overlay multicast ya to head-end replication (border/edge unicast copies banate hain) ya underlay mein PIM-SSM wale native multicast use karta hai. Bahut receivers ho to native zyada efficient hai; head-end ko underlay change nahi chahiye.</li>
<li><b>Layer 2:</b> IGMP snooping flooding rokta hai; VLAN mein PIM router na ho to har VLAN ke liye ek querier chahiye.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Ek hop par <code>ip pim sparse-mode</code> bhool jana (RPF aur join fail); mapping ke bina SSM ke saath IGMPv2 hosts use karna; anycast aur MSDP source ke liye same address use karna; jahan failover fast chahiye wahan Auto-RP ya BSR timers par rely karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSM ko IGMPv3 chahiye aur RP nahi hota. BiDir mein source registration aur SPT switchover nahi hota. Anycast RP ko MSDP (ya RFC 4610 PIM anycast) chahiye.</p></div>

<div class="scn"><h4>Post-mortem: do RPs, same group, khamoshi</h4><p>Pehle failover test ke dauraan West servers ne internal quotes lena band kar diya. Dono RPs up the, lekin MSDP session down tha kyunki MSDP peer anycast loopback se source hua tha, jo neighbour ke bajay local RP tak route hota tha. West RP ne East source kabhi seekha hi nahi. Unhone MSDP ko unique loopback se source kiya aur originator ID set kiya.</p><p><b>Seekh:</b> PIM ke liye anycast address, MSDP ke liye unique address.</p></div>

<div class="iv"><p class="q">"RP ko highly available kaise banaoge aur sirf Auto-RP kyun nahi?"</p><p>MSDP ke saath anycast RP: dono RPs same address use karte hain, IGP nearest chunta hai, failover routing speed par hota hai, aur load share hota hai. Auto-RP aur BSR bhi fail over karte hain lekin timers par depend karte hain. Known sources ke liye SSM se RP ko hi avoid karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>General use ke liye SM, known sources ke liye SSM, many-to-many ke liye BiDir chuno.</li>
<li>RP discovery: static, Auto-RP (Cisco), BSR (standard); redundancy MSDP ke saath anycast RP se.</li>
<li>IGMP snooping aur querier multicast ko bina receivers wale ports se door rakhte hain.</li>
<li>WAN multicast ko provider mVPN, GRE ya DMVPN replication chahiye; SD-Access head-end ya native replication deta hai.</li>
<li>RPF aur unicast routing sab kuch ka base hain; show ip mroute se verify karo.</li>
</ul></div>
`}};export{e as default};