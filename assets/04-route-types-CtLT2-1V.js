var e={id:`rtypes`,h:{en:`EVPN route types 1 to 5`,hi:`EVPN route types 1 se 5`},body:{en:`
<p>A hospital reception keeps different registers: one for "which ward has which beds", one for "which patient is in which bed", one for "which department handles which specialty". Each register answers a different question. EVPN does the same with <b>route types</b>. Every EVPN route begins with a number in square brackets, like <code>[2]</code> or <code>[3]</code>, and that number tells you which question the route answers. Once you can read the route type, every EVPN show command becomes readable.</p>

<h3>The five route types at a glance</h3>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Question it answers</th><th>Used for</th></tr>
<tr><td><b>1</b></td><td>Ethernet Auto-Discovery (A-D)</td><td>Which VTEPs share this multihomed Ethernet segment?</td><td>fast convergence (mass withdraw), aliasing, load balancing</td></tr>
<tr><td><b>2</b></td><td>MAC/IP advertisement</td><td>Behind which VTEP is this MAC (and IP)?</td><td>unicast forwarding, ARP suppression, host routes</td></tr>
<tr><td><b>3</b></td><td>Inclusive Multicast Ethernet Tag (IMET)</td><td>Which VTEPs have this VNI?</td><td>building the BUM flood list (ingress replication)</td></tr>
<tr><td><b>4</b></td><td>Ethernet Segment</td><td>Who else is attached to this segment, and who forwards BUM?</td><td>designated forwarder (DF) election</td></tr>
<tr><td><b>5</b></td><td>IP Prefix</td><td>Which VTEP reaches this subnet in this VRF?</td><td>subnets, silent hosts, external routes</td></tr>
</table>
<p>In an everyday Nexus fabric with vPC you will mostly see types <b>2, 3 and 5</b>. Types 1 and 4 appear only when you use standards-based EVPN multihoming with Ethernet Segment Identifiers (chapter 11).</p>

<h3>Type 3: "I have VNI 10010"</h3>
<p>As soon as a VNI is configured with <code>ingress-replication protocol bgp</code>, the leaf originates one type-3 route for it. The route carries the leaf's VTEP address and a <b>PMSI tunnel attribute</b> (provider multicast service interface) that says "send BUM traffic for this VNI to me using ingress replication". Every other leaf that imports this route adds the VTEP to its flood list for that VNI. On NX-OS the route looks like <code>[3]:[0]:[32]:[10.254.0.2]/88</code>: Ethernet tag 0, a 32-bit IP length, and the originating VTEP.</p>
<pre class="out">LEAF1# show bgp l2vpn evpn route-type 3
Route Distinguisher: 10.255.0.2:32777
BGP routing table entry for [3]:[0]:[32]:[10.254.0.2]/88, version 20
Paths: (2 available, best #1)
  Path type: internal, path is valid, is best path
             Imported to 1 destination(s)
  AS-Path: NONE, path sourced internal to AS
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin IGP, MED not set, localpref 100, weight 0
<span class="hl">      Extcommunity: RT:65001:10010 ENCAP:8</span>
      Originator: 10.255.0.2 Cluster list: 10.255.0.11
      PMSI Tunnel Attribute:
        flags: 0x00, Tunnel type: Ingress Replication
<span class="hl">        Label: 10010, Tunnel Id: 10.254.0.2</span></pre>
<p>Read it top to bottom: LEAF2's RD, two paths (one per spine), imported into one local VNI, next hop 10.254.0.2 (LEAF2's loopback1), RT 65001:10010, reflected by SPINE1, and the PMSI attribute naming VNI 10010 and tunnel endpoint 10.254.0.2.</p>

<h3>Type 2: "MAC X (and IP Y) is behind me"</h3>
<p>A type-2 route advertises one host. There are two flavours, and a leaf usually sends both for each host:</p>
<ul>
<li><b>MAC only</b>: <code>[2]:[0]:[0]:[48]:[0050.7966.6802]:[0]:[0.0.0.0]/216</code>. Used to program the remote MAC table. Label = the L2VNI.</li>
<li><b>MAC + IP</b>: <code>[2]:[0]:[0]:[48]:[0050.7966.6802]:[32]:[172.16.10.12]/272</code>. Used for ARP suppression and, when the VNI belongs to a tenant VRF, for /32 host routes. Labels = L2VNI and L3VNI.</li>
</ul>
<p>The leaf learns the IP by snooping the host's ARP (or from the SVI when it routes for the host).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Fields of a type 2 route">
<rect x="10" y="20" width="60" height="40" rx="6" fill="#fde68a"/><text x="40" y="45" text-anchor="middle" class="svg-ink" font-size="12">[2]</text>
<rect x="75" y="20" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="130" y="45" text-anchor="middle" class="svg-ink" font-size="12">RD</text>
<rect x="190" y="20" width="60" height="40" rx="6" fill="#e2e8f0"/><text x="220" y="45" text-anchor="middle" class="svg-ink" font-size="12">ESI</text>
<rect x="255" y="20" width="60" height="40" rx="6" fill="#e2e8f0"/><text x="285" y="45" text-anchor="middle" class="svg-ink" font-size="12">Tag</text>
<rect x="320" y="20" width="140" height="40" rx="6" fill="#bae6fd"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="12">MAC</text>
<rect x="465" y="20" width="165" height="40" rx="6" fill="#bbf7d0"/><text x="547" y="45" text-anchor="middle" class="svg-ink" font-size="12">IP (optional)</text>
<rect x="10" y="90" width="300" height="40" rx="6" fill="#ddd6fe"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">Labels: L2VNI 10020, L3VNI 50001</text>
<rect x="330" y="90" width="300" height="40" rx="6" fill="#fed7aa"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="12">RT, ENCAP:8, Router MAC, next hop</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">NLRI on top, labels and attributes below</text>
</svg><p class="cap">A type-2 route: the NLRI identifies the host; labels and extended communities tell the receiver how to reach it.</p></div>

<pre class="out">LEAF1# show bgp l2vpn evpn route-type 2
Route Distinguisher: 10.255.0.2:32787
BGP routing table entry for [2]:[0]:[0]:[48]:[0050.7966.6802]:[32]:[172.16.20.12]/272, version 57
Paths: (2 available, best #1)
  Path type: internal, path is valid, is best path
             Imported to 3 destination(s)
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin IGP, MED not set, localpref 100, weight 0
<span class="hl">      Received label 10020 50001</span>
<span class="hl">      Extcommunity: RT:65001:10020 RT:65001:50001 ENCAP:8 Router MAC:5254.0012.3402</span>
      Originator: 10.255.0.2 Cluster list: 10.255.0.11</pre>
<p>This is SRV2 in the lab 3 topology (VLAN 20, VNI 10020). Two labels: 10020 is the L2VNI, 50001 is the L3VNI of VRF TENANT-A. Two RTs: one for the MAC-VRF, one for the IP-VRF. The Router MAC tells LEAF1 which inner destination MAC to use when it routes to SRV2 (chapter 7).</p>

<h3>Type 5: "subnet 172.16.20.0/24 of VRF TENANT-A is behind me"</h3>
<p>Type-2 routes only exist for hosts that have spoken. A <b>type-5</b> route advertises a whole prefix in a tenant VRF, with the L3VNI as label and the Router MAC as an extended community. It is used for the subnets themselves (so a leaf can reach a <b>silent host</b> that has never sent a packet), and for external routes learned on a border leaf, such as a default route from a firewall. NX-OS format: <code>[5]:[0]:[0]:[24]:[172.16.20.0]/224</code>.</p>

<h3>Types 1 and 4: multihoming only</h3>
<p>When a server is dual-attached to two leaves using an <b>Ethernet Segment Identifier</b> (ESI) instead of vPC, the two leaves advertise type-4 routes to find each other and elect a <b>designated forwarder</b> (the one leaf that sends BUM traffic to the segment, so the server does not receive duplicates). They also advertise type-1 routes so that remote leaves can load-balance to both (<b>aliasing</b>) and withdraw everything with one message if the segment fails (<b>mass withdraw</b>).</p>

<div class="eg"><p><b>Worked example.</b> Fabric with 2 leaves, one VNI, one host per leaf. Each leaf originates: 1 type-3 route, 1 MAC-only type-2 and 1 MAC/IP type-2 route. So LEAF1 receives 3 routes from LEAF2, reflected by each spine: PfxRcd shows 3 from 10.255.0.11 and 3 from 10.255.0.12, although only 3 unique routes exist.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting a type-2 route for a host that has not sent any traffic yet (EVPN learns from the local port first, then advertises); confusing type 3 (VNI membership) with multicast groups in the underlay; thinking type-5 routes carry MAC addresses.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the pairs: type 2 = MAC/IP, type 3 = IMET (flood list), type 5 = IP prefix, types 1 and 4 = Ethernet segment multihoming. A question about "ingress replication peer discovery" is about type 3; "ARP suppression" is about type 2 with an IP.</p></div>

<div class="scn"><h4>The printer nobody could reach</h4><p>A new network printer in tenant A was reachable from hosts on the same leaf but not from other racks. <code>show bgp l2vpn evpn route-type 2</code> showed no entry for its IP anywhere. The printer never initiated traffic; it only answered. The fabric advertised only host routes (type 2), so remote leaves had nothing to route toward. The fix was to advertise the tenant subnets as type-5 routes from every leaf hosting them, so remote leaves could route to the subnet and the local leaf could ARP for the printer. After that the printer was learned and a type-2 host route appeared.</p><p><b>Lesson:</b> type 2 needs the host to speak; type 5 covers silent hosts and whole subnets.</p></div>

<div class="iv"><p class="q">"Explain EVPN route types 2, 3 and 5 and when each is generated."</p><p>Strong answer: type 3 (IMET) is sent per VNI when ingress replication is BGP, carrying the VTEP and a PMSI attribute, and builds the flood list. Type 2 is sent per host once the leaf learns its MAC (and IP via ARP), labels L2VNI and optionally L3VNI, used for MAC tables, ARP suppression and host routes. Type 5 is sent per prefix in a tenant VRF, label L3VNI, used for subnets, silent hosts and external routes. Mention that types 1 and 4 are for ESI multihoming.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The number in brackets is the route type; learn to read it first.</li>
<li>Type 3 = VNI membership and flood list, with a PMSI tunnel attribute.</li>
<li>Type 2 = one host: MAC-only (/216) and MAC+IP (/272), labels L2VNI and L3VNI.</li>
<li>Type 5 = a prefix in a VRF with the L3VNI and Router MAC; solves silent hosts and external routes.</li>
<li>Types 1 and 4 support ESI multihoming: aliasing, mass withdraw and DF election.</li>
</ul></div>
`,hi:`
<p>Hospital reception alag alag registers rakhta hai: ek "kis ward mein kaunse beds hain", ek "kaunsa patient kis bed par hai", ek "kaunsa department kaunsi specialty dekhta hai". Har register alag sawaal ka jawab deta hai. EVPN <b>route types</b> ke saath yahi karta hai. Har EVPN route square brackets mein ek number se shuru hota hai, jaise <code>[2]</code> ya <code>[3]</code>, aur woh number batata hai ki route kis sawaal ka jawab deta hai. Jab aap route type padh lete ho, to har EVPN show command padhne layak ban jaata hai.</p>

<h3>Paanch route types ek nazar mein</h3>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kis sawaal ka jawab</th><th>Kis kaam</th></tr>
<tr><td><b>1</b></td><td>Ethernet Auto-Discovery (A-D)</td><td>Kaunse VTEPs yeh multihomed Ethernet segment share karte hain?</td><td>fast convergence (mass withdraw), aliasing, load balancing</td></tr>
<tr><td><b>2</b></td><td>MAC/IP advertisement</td><td>Yeh MAC (aur IP) kis VTEP ke peeche hai?</td><td>unicast forwarding, ARP suppression, host routes</td></tr>
<tr><td><b>3</b></td><td>Inclusive Multicast Ethernet Tag (IMET)</td><td>Kin VTEPs ke paas yeh VNI hai?</td><td>BUM flood list banana (ingress replication)</td></tr>
<tr><td><b>4</b></td><td>Ethernet Segment</td><td>Is segment se aur kaun juda hai, aur BUM kaun forward karega?</td><td>designated forwarder (DF) election</td></tr>
<tr><td><b>5</b></td><td>IP Prefix</td><td>Is VRF mein yeh subnet kaunsa VTEP reach karta hai?</td><td>subnets, silent hosts, external routes</td></tr>
</table>
<p>vPC wale roz ke Nexus fabric mein aap zyada tar types <b>2, 3 aur 5</b> dekhoge. Types 1 aur 4 tabhi aate hain jab aap Ethernet Segment Identifiers ke saath standards-based EVPN multihoming use karte ho (chapter 11).</p>

<h3>Type 3: "Mere paas VNI 10010 hai"</h3>
<p>Jaise hi ek VNI <code>ingress-replication protocol bgp</code> ke saath configure hota hai, leaf uske liye ek type-3 route originate karta hai. Route leaf ka VTEP address aur ek <b>PMSI tunnel attribute</b> (provider multicast service interface) le jaata hai jo kehta hai "is VNI ka BUM traffic mujhe ingress replication se bhejo". Har doosra leaf jo yeh route import karta hai, us VTEP ko us VNI ki flood list mein jod leta hai. NX-OS par route aisa dikhta hai <code>[3]:[0]:[32]:[10.254.0.2]/88</code>: Ethernet tag 0, 32-bit IP length, aur originating VTEP.</p>
<pre class="out">LEAF1# show bgp l2vpn evpn route-type 3
Route Distinguisher: 10.255.0.2:32777
BGP routing table entry for [3]:[0]:[32]:[10.254.0.2]/88, version 20
Paths: (2 available, best #1)
  Path type: internal, path is valid, is best path
             Imported to 1 destination(s)
  AS-Path: NONE, path sourced internal to AS
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin IGP, MED not set, localpref 100, weight 0
<span class="hl">      Extcommunity: RT:65001:10010 ENCAP:8</span>
      Originator: 10.255.0.2 Cluster list: 10.255.0.11
      PMSI Tunnel Attribute:
        flags: 0x00, Tunnel type: Ingress Replication
<span class="hl">        Label: 10010, Tunnel Id: 10.254.0.2</span></pre>
<p>Upar se neeche padho: LEAF2 ka RD, do paths (har spine ka ek), ek local VNI mein import hua, next hop 10.254.0.2 (LEAF2 ka loopback1), RT 65001:10010, SPINE1 ne reflect kiya, aur PMSI attribute jo VNI 10010 aur tunnel endpoint 10.254.0.2 batata hai.</p>

<h3>Type 2: "MAC X (aur IP Y) mere peeche hai"</h3>
<p>Type-2 route ek host advertise karta hai. Iske do flavours hain, aur leaf aam taur par har host ke liye dono bhejta hai:</p>
<ul>
<li><b>Sirf MAC</b>: <code>[2]:[0]:[0]:[48]:[0050.7966.6802]:[0]:[0.0.0.0]/216</code>. Remote MAC table program karne ke liye. Label = L2VNI.</li>
<li><b>MAC + IP</b>: <code>[2]:[0]:[0]:[48]:[0050.7966.6802]:[32]:[172.16.10.12]/272</code>. ARP suppression ke liye aur, jab VNI kisi tenant VRF ka ho, /32 host routes ke liye. Labels = L2VNI aur L3VNI.</li>
</ul>
<p>Leaf IP host ka ARP snoop karke seekhta hai (ya SVI se, jab woh host ke liye route karta hai).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Type 2 route ke fields">
<rect x="10" y="20" width="60" height="40" rx="6" fill="#fde68a"/><text x="40" y="45" text-anchor="middle" class="svg-ink" font-size="12">[2]</text>
<rect x="75" y="20" width="110" height="40" rx="6" fill="#e2e8f0"/><text x="130" y="45" text-anchor="middle" class="svg-ink" font-size="12">RD</text>
<rect x="190" y="20" width="60" height="40" rx="6" fill="#e2e8f0"/><text x="220" y="45" text-anchor="middle" class="svg-ink" font-size="12">ESI</text>
<rect x="255" y="20" width="60" height="40" rx="6" fill="#e2e8f0"/><text x="285" y="45" text-anchor="middle" class="svg-ink" font-size="12">Tag</text>
<rect x="320" y="20" width="140" height="40" rx="6" fill="#bae6fd"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="12">MAC</text>
<rect x="465" y="20" width="165" height="40" rx="6" fill="#bbf7d0"/><text x="547" y="45" text-anchor="middle" class="svg-ink" font-size="12">IP (optional)</text>
<rect x="10" y="90" width="300" height="40" rx="6" fill="#ddd6fe"/><text x="160" y="115" text-anchor="middle" class="svg-ink" font-size="12">Labels: L2VNI 10020, L3VNI 50001</text>
<rect x="330" y="90" width="300" height="40" rx="6" fill="#fed7aa"/><text x="480" y="115" text-anchor="middle" class="svg-ink" font-size="12">RT, ENCAP:8, Router MAC, next hop</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Upar NLRI, neeche labels aur attributes</text>
</svg><p class="cap">Type-2 route: NLRI host ko identify karta hai; labels aur extended communities receiver ko batate hain ki us tak kaise pahunchna hai.</p></div>

<pre class="out">LEAF1# show bgp l2vpn evpn route-type 2
Route Distinguisher: 10.255.0.2:32787
BGP routing table entry for [2]:[0]:[0]:[48]:[0050.7966.6802]:[32]:[172.16.20.12]/272, version 57
Paths: (2 available, best #1)
  Path type: internal, path is valid, is best path
             Imported to 3 destination(s)
    10.254.0.2 (metric 81) from 10.255.0.11 (10.255.0.11)
      Origin IGP, MED not set, localpref 100, weight 0
<span class="hl">      Received label 10020 50001</span>
<span class="hl">      Extcommunity: RT:65001:10020 RT:65001:50001 ENCAP:8 Router MAC:5254.0012.3402</span>
      Originator: 10.255.0.2 Cluster list: 10.255.0.11</pre>
<p>Yeh lab 3 topology ka SRV2 hai (VLAN 20, VNI 10020). Do labels: 10020 L2VNI hai, 50001 VRF TENANT-A ka L3VNI hai. Do RTs: ek MAC-VRF ke liye, ek IP-VRF ke liye. Router MAC LEAF1 ko batata hai ki SRV2 tak route karte waqt kaunsa inner destination MAC use kare (chapter 7).</p>

<h3>Type 5: "VRF TENANT-A ka subnet 172.16.20.0/24 mere peeche hai"</h3>
<p>Type-2 routes sirf un hosts ke liye hote hain jo bol chuke hain. <b>Type-5</b> route tenant VRF mein poora prefix advertise karta hai, L3VNI label ke saath aur Router MAC extended community ke saath. Yeh khud subnets ke liye use hota hai (taaki leaf ek <b>silent host</b> tak pahunch sake jisne kabhi packet nahi bheja), aur border leaf par seekhe external routes ke liye, jaise firewall se aaya default route. NX-OS format: <code>[5]:[0]:[0]:[24]:[172.16.20.0]/224</code>.</p>

<h3>Types 1 aur 4: sirf multihoming</h3>
<p>Jab ek server vPC ki jagah <b>Ethernet Segment Identifier</b> (ESI) use karke do leaves se dual-attached hota hai, to do leaves ek doosre ko dhoondhne aur <b>designated forwarder</b> chunne ke liye type-4 routes advertise karte hain (woh ek leaf jo segment ko BUM traffic bhejta hai, taaki server ko duplicates na milein). Woh type-1 routes bhi advertise karte hain taaki remote leaves dono par load-balance kar sakein (<b>aliasing</b>) aur segment fail hone par ek message se sab withdraw ho jaaye (<b>mass withdraw</b>).</p>

<div class="eg"><p><b>Worked example.</b> 2 leaves, ek VNI, har leaf par ek host wala fabric. Har leaf originate karta hai: 1 type-3 route, 1 MAC-only type-2 aur 1 MAC/IP type-2 route. To LEAF1 ko LEAF2 se 3 routes milte hain, har spine se reflect hue: PfxRcd 10.255.0.11 se 3 aur 10.255.0.12 se 3 dikhata hai, jabki unique routes sirf 3 hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Us host ke liye type-2 route ki ummeed karna jisne abhi tak koi traffic nahi bheja (EVPN pehle local port se seekhta hai, phir advertise karta hai); type 3 (VNI membership) ko underlay ke multicast groups se confuse karna; yeh sochna ki type-5 routes MAC addresses le jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jode yaad rakho: type 2 = MAC/IP, type 3 = IMET (flood list), type 5 = IP prefix, types 1 aur 4 = Ethernet segment multihoming. "Ingress replication peer discovery" wala sawaal type 3 ke baare mein hai; "ARP suppression" IP wale type 2 ke baare mein hai.</p></div>

<div class="scn"><h4>Woh printer jis tak koi nahi pahunch paaya</h4><p>Tenant A ka ek naya network printer same leaf ke hosts se reachable tha par doosre racks se nahi. <code>show bgp l2vpn evpn route-type 2</code> mein uske IP ki koi entry kahin nahi thi. Printer kabhi traffic shuru nahi karta tha; sirf jawab deta tha. Fabric sirf host routes (type 2) advertise karta tha, isliye remote leaves ke paas route karne ke liye kuch nahi tha. Fix tha tenant subnets ko har us leaf se type-5 routes ki tarah advertise karna jo unhe host karta hai, taaki remote leaves subnet tak route kar sakein aur local leaf printer ke liye ARP kar sake. Uske baad printer seekha gaya aur type-2 host route dikhne laga.</p><p><b>Seekh:</b> type 2 ke liye host ka bolna zaroori hai; type 5 silent hosts aur poore subnets cover karta hai.</p></div>

<div class="iv"><p class="q">"EVPN route types 2, 3 aur 5 explain karo aur batao har ek kab generate hota hai."</p><p>Strong answer: type 3 (IMET) har VNI ke liye bheja jaata hai jab ingress replication BGP ho, VTEP aur PMSI attribute le jaata hai, aur flood list banata hai. Type 2 har host ke liye bheja jaata hai jab leaf uska MAC (aur ARP se IP) seekh leta hai, labels L2VNI aur optionally L3VNI, MAC tables, ARP suppression aur host routes ke liye. Type 5 tenant VRF mein har prefix ke liye, label L3VNI, subnets, silent hosts aur external routes ke liye. Batao ki types 1 aur 4 ESI multihoming ke liye hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Brackets wala number route type hai; pehle use padhna seekho.</li>
<li>Type 3 = VNI membership aur flood list, PMSI tunnel attribute ke saath.</li>
<li>Type 2 = ek host: MAC-only (/216) aur MAC+IP (/272), labels L2VNI aur L3VNI.</li>
<li>Type 5 = VRF mein prefix, L3VNI aur Router MAC ke saath; silent hosts aur external routes solve karta hai.</li>
<li>Types 1 aur 4 ESI multihoming support karte hain: aliasing, mass withdraw aur DF election.</li>
</ul></div>
`}};export{e as default};