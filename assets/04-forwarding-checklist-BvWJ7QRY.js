var e={id:`forwarding-checklist`,h:{en:`The packet-forwarding checklist`,hi:`Packet-forwarding checklist`},body:{en:`
<p>A courier carrying a parcel across the city does the same few things at every depot. Can I physically get to the next depot (is the road open)? Do I know exactly which door to knock on (the local address)? Which depot is next on the map? Is there a pre-printed route card that already says so? Will a checkpoint stop me, send me on a detour or relabel the parcel? And when the receiver sends a reply, can that reply find its way back? A router forwarding a packet asks exactly these questions. This chapter turns them into a checklist you run on every hop of the path.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packet forwarding checklist">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Layer 2 reachability</text>
<rect x="230" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 ARP / ND</text>
<rect x="440" y="20" width="180" height="40" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Routing table (RIB)</text>
<rect x="440" y="100" width="180" height="40" rx="8" fill="#fde68a"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">4 CEF: FIB + adjacency</text>
<rect x="230" y="100" width="180" height="40" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">5 ACL / NAT / PBR</text>
<rect x="20" y="100" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="12">6 Return path</text>
<line x1="200" y1="40" x2="230" y2="40" stroke="#64748b" stroke-width="2"/><line x1="410" y1="40" x2="440" y2="40" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="530" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="410" y2="120" stroke="#64748b" stroke-width="2"/><line x1="230" y1="120" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Run it on every hop: R1, then R2, then R3</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">then again from SRV1 back toward 10.1.10.0/24</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">Stop at the first check that fails</text>
</svg><p class="cap">Six questions per hop, in the order a router actually uses the information.</p></div>

<h3>1. Layer 2 reachability</h3>
<p>Before a router can route anything it needs working interfaces. <code>show ip interface brief</code> must show the ingress and egress interfaces as <b>up/up</b>. "administratively down" means someone typed <code>shutdown</code>; "down/down" is usually physical; "up/down" often means a keepalive, encapsulation or Layer 2 problem. Check <code>show interfaces</code> for input errors, CRC and drops, and on switches the VLAN and trunk state.</p>

<h3>2. ARP (or IPv6 neighbour discovery)</h3>
<p>To send a frame to the next hop or to the final host on a connected subnet, the router needs the MAC address. <b>ARP</b> resolves IPv4 addresses to MACs; <b>ND</b> does the same for IPv6.</p>
<pre class="out">R3# show ip arp 10.3.30.10
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
<span class="hl">Internet  10.3.30.10              0   Incomplete      ARPA</span></pre>
<p>"Incomplete" means R3 sent ARP requests and got no reply. The host is off, in the wrong VLAN, has the wrong subnet, or something between R3 and SRV1 is dropping the frames. No routing command will fix that; the fault is on the local segment.</p>

<h3>3. The routing table</h3>
<p>The routing table (the <b>RIB</b>, routing information base) holds the best route for each prefix, chosen from all routing sources. The fastest check is to ask the router about the exact destination:</p>
<pre class="out">R1# show ip route 10.3.30.10
Routing entry for 10.3.30.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 1</span>
  Last update from 10.0.12.2 on GigabitEthernet0/0, 00:12:41 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 10.255.0.2, 00:12:41 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1</pre>
<p>If the answer is <code>% Subnet not in table</code> or <code>% Network not in table</code>, there is no specific route for it (a default route is not shown by this command, so check for one separately with <code>show ip route 0.0.0.0</code>). A missing route sends you to the routing-protocol checklist in chapter 5.</p>

<h3>4. CEF: the FIB and the adjacency table</h3>
<p>Routers do not forward by reading the RIB. <b>CEF</b> (Cisco Express Forwarding) builds the <b>FIB</b> (forwarding information base) from the RIB, with recursion already resolved, and an <b>adjacency table</b> holding the pre-built Layer 2 header for each next hop. The data plane uses these. Normally they agree with the RIB, but checking them proves what the router will <b>really</b> do, including which link it picks when there are equal-cost paths.</p>
<pre class="out">R1# show ip cef 10.3.30.10
10.3.30.0/24
  nexthop 10.0.12.2 GigabitEthernet0/0
R1# show ip cef exact-route 10.1.10.10 10.3.30.10
<span class="hl">10.1.10.10 -&gt; 10.3.30.10 =&gt;IP adj out of GigabitEthernet0/0, addr 10.0.12.2</span></pre>
<p>A FIB entry pointing to <b>drop</b>, <b>Null0</b> or an incomplete (glean) adjacency explains a failure even when the routing table looks fine.</p>

<h3>5. Policy: ACLs, NAT and PBR</h3>
<p>A router with a perfect route can still refuse to forward. Check three kinds of policy on the ingress and egress interfaces:</p>
<ul>
<li><b>ACLs</b>: <code>show ip interface GigabitEthernet0/2 | include access list</code> shows what is applied and in which direction; <code>show access-lists</code> shows the hit counters.</li>
<li><b>NAT</b>: <code>show ip nat translations</code> and <code>show ip nat statistics</code>. A wrong inside/outside interface or a missing translation breaks flows silently.</li>
<li><b>PBR</b> (policy-based routing): <code>show ip policy</code> lists interfaces with a route map. PBR is checked <b>before</b> the routing table, so it can send traffic somewhere the RIB never would.</li>
</ul>
<pre class="out">R1# show ip policy
Interface      Route map
<span class="hl">Gi0/1          PBR-WEB</span></pre>

<h3>6. The return path</h3>
<p>Every successful conversation needs two working paths. Repeat checks 1 to 5 from the destination back toward the source: does R3 have a route to 10.1.10.0/24? Does R2? Is there an ACL on the return interfaces? Asymmetric paths are fine for routers, but stateful devices (firewalls, zone-based firewall, NAT) along the way may drop the returning half.</p>

<div class="eg"><p><b>Worked example.</b> From R2, <code>ping 10.3.30.10</code> succeeds. From PC1, it fails. Why the difference? R2 sources its ping from 10.0.23.1, a subnet that is <b>connected</b> on R3, so SRV1's replies always find their way back. PC1's packets come from 10.1.10.10. On R3, <code>show ip route 10.1.10.10</code> returns <code>% Subnet not in table</code>. The forward path works; the return path is missing. The fix belongs in the routing protocol on R3 (in this topology, redistribution of OSPF into EIGRP on R2). Testing with <code>ping 10.3.30.10 source 10.1.10.1</code> from R1 would have exposed it immediately.</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing with a plain ping from the router instead of an extended ping sourced from the user's subnet. The router uses its egress interface address as the source, which is often reachable from everywhere, and hides return-path problems.</p></div>

<div class="exam"><p><b>Exam trap.</b> PBR is evaluated before the routing table for packets arriving on the interface where it is applied, but not for traffic the router generates itself unless <code>ip local policy route-map</code> is configured. A question showing a correct RIB but traffic taking another path usually wants PBR as the answer.</p></div>

<div class="scn"><h4>The route that existed, the traffic that did not flow</h4><p>After a WAN migration, one branch could not reach the data centre, although <code>show ip route</code> on the branch router showed the correct route through the new MPLS link. The engineer ran <code>show ip cef exact-route</code> and saw traffic still leaving the old DSL interface. <code>show ip policy</code> revealed a forgotten PBR route map on the LAN interface that set the old DSL next hop for all traffic to the data centre. Removing the stale route map fixed it.</p><p><b>Lesson:</b> the RIB shows what the router believes; CEF and policy show what it actually does.</p></div>

<div class="iv"><p class="q">"A route is in the routing table, but traffic still fails. What do you check next?"</p><p>Walk the rest of the checklist: CEF (<code>show ip cef</code>, <code>exact-route</code>, adjacency and ARP for the next hop), ACLs on ingress and egress, NAT, and PBR, which overrides the RIB. Then the return path from the destination, including stateful devices. Mention using an extended ping with the user's source address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Per hop: Layer 2, ARP/ND, routing table, CEF (FIB and adjacency), ACL/NAT/PBR, then the return path.</li>
<li><code>show ip route x.x.x.x</code> answers "which route will be used for this address" directly.</li>
<li><code>show ip cef exact-route src dst</code> shows the real forwarding decision, including ECMP choices.</li>
<li>PBR is applied before the routing table; always check <code>show ip policy</code>.</li>
<li>Test with an extended ping sourced from the user subnet to expose return-path faults.</li>
</ul></div>
`,hi:`
<p>Shehar bhar mein parcel le jaane wala courier har depot par wahi kuch kaam karta hai. Kya main agle depot tak physically pahunch sakta hoon (raasta khula hai)? Kya mujhe pata hai exactly kaunsa darwaza khatkhatana hai (local address)? Map par agla depot kaunsa hai? Kya pehle se chhapa hua route card hai jo yeh bata deta hai? Kya koi checkpoint mujhe rokega, detour par bhejega ya parcel ka label badal dega? Aur jab receiver reply bhejta hai, kya woh reply wapas ka raasta dhoondh sakta hai? Packet forward karta router bilkul yahi sawaal poochta hai. Yeh chapter unhe ek checklist mein badalta hai jo aap path ke har hop par chalate ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Packet forwarding checklist">
<rect x="20" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="12">1 Layer 2 reachability</text>
<rect x="230" y="20" width="180" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">2 ARP / ND</text>
<rect x="440" y="20" width="180" height="40" rx="8" fill="#fde68a"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="12">3 Routing table (RIB)</text>
<rect x="440" y="100" width="180" height="40" rx="8" fill="#fde68a"/><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">4 CEF: FIB + adjacency</text>
<rect x="230" y="100" width="180" height="40" rx="8" fill="#fed7aa"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">5 ACL / NAT / PBR</text>
<rect x="20" y="100" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="12">6 Return path</text>
<line x1="200" y1="40" x2="230" y2="40" stroke="#64748b" stroke-width="2"/><line x1="410" y1="40" x2="440" y2="40" stroke="#64748b" stroke-width="2"/><line x1="530" y1="60" x2="530" y2="100" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="410" y2="120" stroke="#64748b" stroke-width="2"/><line x1="230" y1="120" x2="200" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Har hop par chalao: R1, phir R2, phir R3</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">phir SRV1 se wapas 10.1.10.0/24 ki taraf</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">Pehle fail hone wale check par ruko</text>
</svg><p class="cap">Har hop par chhe sawaal, usi order mein jismein router asal mein information use karta hai.</p></div>

<h3>1. Layer 2 reachability</h3>
<p>Router kuch bhi route kar sake, usse pehle use working interfaces chahiye. <code>show ip interface brief</code> mein ingress aur egress interfaces <b>up/up</b> dikhne chahiye. "administratively down" ka matlab kisi ne <code>shutdown</code> type kiya; "down/down" aam taur par physical hai; "up/down" aksar keepalive, encapsulation ya Layer 2 problem hota hai. <code>show interfaces</code> mein input errors, CRC aur drops check karo, aur switches par VLAN aur trunk state.</p>

<h3>2. ARP (ya IPv6 neighbour discovery)</h3>
<p>Next hop ya connected subnet par final host ko frame bhejne ke liye router ko MAC address chahiye. <b>ARP</b> IPv4 addresses ko MACs mein resolve karta hai; <b>ND</b> IPv6 ke liye yahi karta hai.</p>
<pre class="out">R3# show ip arp 10.3.30.10
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
<span class="hl">Internet  10.3.30.10              0   Incomplete      ARPA</span></pre>
<p>"Incomplete" ka matlab R3 ne ARP requests bheje aur koi reply nahi mila. Host band hai, galat VLAN mein hai, galat subnet hai, ya R3 aur SRV1 ke beech kuch frames drop kar raha hai. Koi routing command ise theek nahi karegi; fault local segment par hai.</p>

<h3>3. Routing table</h3>
<p>Routing table (<b>RIB</b>, routing information base) har prefix ke liye best route rakhti hai, jo saare routing sources mein se chuna gaya. Sabse tez check hai router se exact destination ke baare mein poochhna:</p>
<pre class="out">R1# show ip route 10.3.30.10
Routing entry for 10.3.30.0/24
<span class="hl">  Known via "ospf 1", distance 110, metric 20, type extern 2, forward metric 1</span>
  Last update from 10.0.12.2 on GigabitEthernet0/0, 00:12:41 ago
  Routing Descriptor Blocks:
  * 10.0.12.2, from 10.255.0.2, 00:12:41 ago, via GigabitEthernet0/0
      Route metric is 20, traffic share count is 1</pre>
<p>Agar jawab <code>% Subnet not in table</code> ya <code>% Network not in table</code> hai, to iske liye koi specific route nahi hai (yeh command default route nahi dikhata, isliye use alag se <code>show ip route 0.0.0.0</code> se check karo). Missing route aapko chapter 5 ki routing-protocol checklist par bhejta hai.</p>

<h3>4. CEF: FIB aur adjacency table</h3>
<p>Routers RIB padhkar forward nahi karte. <b>CEF</b> (Cisco Express Forwarding) RIB se <b>FIB</b> (forwarding information base) banata hai, jismein recursion pehle se resolve hota hai, aur ek <b>adjacency table</b> jismein har next hop ka pehle se bana Layer 2 header hota hai. Data plane inhe use karta hai. Normally yeh RIB se match karte hain, par inhe check karna sabit karta hai ki router <b>asal mein</b> kya karega, jismein equal-cost paths hone par kaunsa link chunega, woh bhi shaamil hai.</p>
<pre class="out">R1# show ip cef 10.3.30.10
10.3.30.0/24
  nexthop 10.0.12.2 GigabitEthernet0/0
R1# show ip cef exact-route 10.1.10.10 10.3.30.10
<span class="hl">10.1.10.10 -&gt; 10.3.30.10 =&gt;IP adj out of GigabitEthernet0/0, addr 10.0.12.2</span></pre>
<p><b>drop</b>, <b>Null0</b> ya incomplete (glean) adjacency ki taraf point karti FIB entry failure samjha deti hai, chahe routing table theek dikhe.</p>

<h3>5. Policy: ACLs, NAT aur PBR</h3>
<p>Perfect route wala router bhi forward karne se mana kar sakta hai. Ingress aur egress interfaces par teen tarah ki policy check karo:</p>
<ul>
<li><b>ACLs</b>: <code>show ip interface GigabitEthernet0/2 | include access list</code> dikhata hai kya laga hai aur kis direction mein; <code>show access-lists</code> hit counters dikhata hai.</li>
<li><b>NAT</b>: <code>show ip nat translations</code> aur <code>show ip nat statistics</code>. Galat inside/outside interface ya missing translation flows ko chupchaap tod deti hai.</li>
<li><b>PBR</b> (policy-based routing): <code>show ip policy</code> route map wale interfaces list karta hai. PBR routing table se <b>pehle</b> check hota hai, isliye yeh traffic ko aisi jagah bhej sakta hai jahan RIB kabhi na bheje.</li>
</ul>
<pre class="out">R1# show ip policy
Interface      Route map
<span class="hl">Gi0/1          PBR-WEB</span></pre>

<h3>6. Return path</h3>
<p>Har successful baatcheet ko do working paths chahiye. Checks 1 se 5 destination se wapas source ki taraf dohrao: kya R3 ke paas 10.1.10.0/24 ka route hai? R2 ke paas? Kya return interfaces par ACL hai? Routers ke liye asymmetric paths theek hain, par raaste ke stateful devices (firewalls, zone-based firewall, NAT) wapas aane wala hissa drop kar sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> R2 se <code>ping 10.3.30.10</code> succeed hota hai. PC1 se fail hota hai. Fark kyun? R2 apna ping 10.0.23.1 se source karta hai, jo R3 par <b>connected</b> subnet hai, isliye SRV1 ke replies hamesha wapas pahunch jaate hain. PC1 ke packets 10.1.10.10 se aate hain. R3 par <code>show ip route 10.1.10.10</code> <code>% Subnet not in table</code> deta hai. Forward path chal raha hai; return path missing hai. Fix R3 ke routing protocol mein hai (is topology mein, R2 par OSPF ka EIGRP mein redistribution). R1 se <code>ping 10.3.30.10 source 10.1.10.1</code> se test karte to yeh turant pakda jaata.</p></div>

<div class="warn"><p><b>Common galti.</b> User ke subnet se sourced extended ping ki jagah router se plain ping se test karna. Router source ki tarah apna egress interface address use karta hai, jo aksar har jagah se reachable hota hai, aur return-path problems chhupa deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> PBR us interface par aane wale packets ke liye routing table se pehle evaluate hota hai jahan woh laga hai, par router ke khud banaye traffic ke liye nahi, jab tak <code>ip local policy route-map</code> configure na ho. Jo question sahi RIB dikhaye par traffic doosra path le raha ho, woh aam taur par jawab mein PBR chahta hai.</p></div>

<div class="scn"><h4>Route maujood tha, traffic nahi chala</h4><p>WAN migration ke baad ek branch data centre tak nahi pahunch pa rahi thi, jabki branch router par <code>show ip route</code> naye MPLS link se sahi route dikha raha tha. Engineer ne <code>show ip cef exact-route</code> chalaya aur dekha ki traffic abhi bhi purane DSL interface se nikal raha tha. <code>show ip policy</code> ne LAN interface par ek bhula hua PBR route map dikhaya jo data centre ke saare traffic ke liye purana DSL next hop set karta tha. Purana route map hatane se theek ho gaya.</p><p><b>Seekh:</b> RIB dikhata hai router kya maanta hai; CEF aur policy dikhate hain woh asal mein kya karta hai.</p></div>

<div class="iv"><p class="q">"Route routing table mein hai, phir bhi traffic fail ho raha hai. Aage kya check karoge?"</p><p>Baaki checklist chalo: CEF (<code>show ip cef</code>, <code>exact-route</code>, next hop ki adjacency aur ARP), ingress aur egress par ACLs, NAT, aur PBR, jo RIB ko override karta hai. Phir destination se return path, stateful devices samet. User ke source address ke saath extended ping use karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har hop par: Layer 2, ARP/ND, routing table, CEF (FIB aur adjacency), ACL/NAT/PBR, phir return path.</li>
<li><code>show ip route x.x.x.x</code> seedha jawab deta hai "is address ke liye kaunsa route use hoga".</li>
<li><code>show ip cef exact-route src dst</code> asli forwarding decision dikhata hai, ECMP choices samet.</li>
<li>PBR routing table se pehle lagta hai; hamesha <code>show ip policy</code> check karo.</li>
<li>Return-path faults pakadne ke liye user subnet se sourced extended ping se test karo.</li>
</ul></div>
`}};export{e as default};