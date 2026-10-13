var e={id:`multihoming-gateways`,h:{en:`Multihoming with ESI, designated forwarder, and Layer 3 gateway designs`,hi:`ESI se multihoming, designated forwarder aur Layer 3 gateway designs`},body:{en:`
<p>So far every host sat behind one leaf. In production a server connects to <b>two leaves</b>, so that a leaf failure or a maintenance window does not take the server offline. The old answer was MC-LAG, a proprietary pair of switches with a private link. EVPN makes it a standard: both leaves present the same bundle and tell the fabric about it in BGP. This chapter explains the concepts that the JN0-650 exam tests. <b>Important:</b> the simulator labs do not build multihoming or IRB gateways, so everything in this chapter is shown as configuration or explained, and no show output is invented.</p>

<h3>Ethernet segment and ESI</h3>
<p>An <b>Ethernet segment (ES)</b> is the set of links that connect one server or access switch to the fabric. It is named by a 10-byte <b>Ethernet Segment Identifier (ESI)</b> that you configure identically on both leaves. A multihomed LAG is called an <b>ESI-LAG</b>.</p>
<pre class="code"><span class="c"># configuration on LEAF1 and LEAF2 (concept, not simulated)</span>
set chassis aggregated-devices ethernet device-count 1
set interfaces xe-0/0/10 ether-options 802.3ad ae0
set interfaces ae0 esi 00:11:22:33:44:55:66:77:88:99
set interfaces ae0 esi all-active
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options lacp system-id 00:00:00:11:22:33
set interfaces ae0 unit 0 family ethernet-switching vlan members V10</pre>
<p>The same ESI and the same LACP <b>system-id</b> on both leaves make the server believe it talks to one switch. It runs an ordinary LACP bundle and needs no EVPN knowledge.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Multihomed server">
<rect x="40" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="490" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<rect x="265" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="95" y1="66" x2="300" y2="130" stroke="#64748b" stroke-width="2"/><line x1="545" y1="66" x2="340" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">same ESI on both leaves</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">one LACP bundle, two leaves</text>
</svg><p class="cap">An ESI-LAG: one logical bundle terminating on two leaves.</p></div>

<h3>What the multihoming routes do</h3>
<table class="cmp"><tr><th>Route</th><th>Purpose</th></tr>
<tr><td>Type 4 (Ethernet segment)</td><td>Imported only by leaves with the same ESI. They discover each other and elect the designated forwarder</td></tr>
<tr><td>Type 1 per ES (auto-discovery)</td><td>"I am attached to this ESI". Withdrawing it tells everyone to stop using the leaf for all MACs at once: <b>fast mass withdrawal</b></td></tr>
<tr><td>Type 1 per EVI (auto-discovery)</td><td>Enables <b>aliasing</b>: remote leaves load-balance to every leaf on the ESI, even if only one learned the MAC</td></tr>
<tr><td>Type 2 with ESI</td><td>A MAC behind an ESI carries the ESI instead of being tied to one leaf</td></tr></table>

<h3>The designated forwarder</h3>
<p>BUM traffic arrives at both leaves, because both are in the flood list. Without a rule the server would receive two copies of each broadcast. The <b>designated forwarder (DF)</b> is the one leaf, per VLAN, that is allowed to forward BUM traffic <i>towards</i> the segment. The default election sorts the leaves by IP address and takes the VLAN number modulo the number of leaves, so different VLANs spread across the leaves. To prevent a loop, BUM from the server received on leaf 1 is flooded to leaf 2 with an ESI label, so leaf 2 does not send it back down the same segment: <b>split horizon</b>.</p>
<p>Unicast is different: in all-active mode both leaves forward known unicast, which is why aliasing matters. With <code>single-active</code> only one leaf at a time carries traffic for a VLAN and the other is a standby; this fits servers that cannot run LACP.</p>

<h3>Layer 3 in the fabric: CRB and ERB</h3>
<p>A bridged overlay, like the labs, only extends Layer 2. Hosts in different VNIs need a router. There are two classic placements.</p>
<table class="cmp"><tr><th>Design</th><th>Where the gateway lives</th><th>Trade-off</th></tr>
<tr><td>Centrally routed bridging (CRB)</td><td>On the spines (IRB interfaces); leaves only bridge</td><td>Simple leaves; traffic between VLANs must go to the spine and back</td></tr>
<tr><td>Edge routed bridging (ERB)</td><td>On every leaf, with the same anycast IP and MAC</td><td>Routing happens at the first hop; type 2 MAC+IP and type 5 prefixes carry reachability</td></tr></table>
<pre class="code"><span class="c"># concept: ERB gateway for VLAN V10 (not simulated; it uses an IRB with a virtual gateway)</span>
set vlans V10 l3-interface irb.10
set interfaces irb unit 10 family inet address 10.40.10.2/24 virtual-gateway-address 10.40.10.254
<span class="c"># concept: tenant VRF that advertises prefixes as EVPN type 5</span>
set routing-instances TENANT1 instance-type vrf
set routing-instances TENANT1 interface irb.10
set routing-instances TENANT1 protocols evpn ip-prefix-routes advertise direct-nexthop
set routing-instances TENANT1 protocols evpn ip-prefix-routes encapsulation vxlan
set routing-instances TENANT1 protocols evpn ip-prefix-routes vni 9000</pre>
<p>Hosts use the anycast address 10.40.10.254 as their default gateway on every leaf, so a VM that moves between racks keeps the same gateway. Between VNIs the router uses a Layer 3 VNI per tenant (here 9000), and a type-5 route advertises each tenant prefix. The Cisco side of the same ideas appears in the data centre EVPN chapters; here we focus on the Junos statements. This lab module does not configure IRB, so the commands above are for exam preparation only.</p>

<div class="eg"><p><b>Worked example.</b> A server is dual-homed to LEAF1 and LEAF2 with ESI X. VLAN 10 and VLAN 11 exist on the segment. With two leaves sorted by IP, 10 mod 2 = 0 so leaf at index 0 is DF for VLAN 10, and 11 mod 2 = 1 so leaf at index 1 is DF for VLAN 11. If LEAF1 fails, its type-1 per-ES route is withdrawn, remote leaves remove it from all MAC next-hop lists at once, and traffic flows via LEAF2 without waiting for individual MAC withdrawals. A new DF election runs for the VLANs LEAF1 owned.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Different ESI values on the two leaves, so they are treated as separate segments and a loop forms through the server. (2) Different LACP system-id values, so the server brings up only one link. (3) Using <code>all-active</code> with a server that cannot do LACP. (4) Expecting BUM duplicates to be filtered without a DF election.</p></div>
<div class="exam"><p><b>Exam trap.</b> Memorise the jobs: type 4 elects the DF, type 1 per ES gives mass withdrawal, type 1 per EVI gives aliasing. Another favourite: <b>all-active</b> means every leaf forwards; <b>single-active</b> means one at a time.</p></div>

<div class="scn"><h4>The server that received every ARP twice</h4><p>A new dual-homed database server logged duplicate broadcast frames. The two leaves had been given ESI values that differed in one byte, so they did not import each other's type-4 routes and each believed it was the only leaf on the segment. Both forwarded BUM towards the server. Correcting the ESI on one leaf let them elect a single DF per VLAN, and the duplicates stopped.</p><p><b>Lesson:</b> ESI and LACP system-id must match exactly on both leaves.</p></div>

<div class="iv"><p class="q">"What problems does EVPN multihoming solve compared with MC-LAG?"</p><p>It uses a standards-based BGP control plane instead of a proprietary inter-chassis link, scales beyond two peers, supports all-active forwarding, gives fast convergence with type-1 mass withdrawal, load balancing to all leaves with aliasing, and loop-free BUM delivery through DF election and split horizon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An ESI-LAG uses the same ESI and LACP system-id on both leaves.</li>
<li>Type 4 finds peers and elects the DF; type 1 gives mass withdrawal and aliasing.</li>
<li>The DF is per VLAN and only it forwards BUM towards the segment.</li>
<li>CRB puts gateways on the spines; ERB puts anycast gateways on every leaf with type 5 between VRFs.</li>
<li>These topics are not built in the simulator labs, so learn them as concepts and configuration.</li>
</ul></div>
`,hi:`
<p>Ab tak har host ek leaf ke peeche tha. Production mein server <b>do leaves</b> se judta hai, taaki leaf failure ya maintenance window server ko offline na kare. Purana jawab MC-LAG tha, switches ka proprietary jodi jiska private link hota hai. EVPN ise standard bana deta hai: dono leaves same bundle present karte hain aur BGP mein fabric ko batate hain. Yeh chapter woh concepts samjhata hai jo JN0-650 exam poochta hai. <b>Zaroori:</b> simulator labs multihoming ya IRB gateways nahi banate, isliye is chapter mein sab kuch configuration ya explanation ke roop mein hai, koi show output gadha nahi gaya.</p>

<h3>Ethernet segment aur ESI</h3>
<p><b>Ethernet segment (ES)</b> un links ka set hai jo ek server ya access switch ko fabric se jodte hain. Iska naam 10-byte <b>Ethernet Segment Identifier (ESI)</b> hota hai jo aap dono leaves par ek jaisa configure karte ho. Multihomed LAG ko <b>ESI-LAG</b> kehte hain.</p>
<pre class="code"><span class="c"># LEAF1 aur LEAF2 par configuration (concept, simulated nahi)</span>
set chassis aggregated-devices ethernet device-count 1
set interfaces xe-0/0/10 ether-options 802.3ad ae0
set interfaces ae0 esi 00:11:22:33:44:55:66:77:88:99
set interfaces ae0 esi all-active
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options lacp system-id 00:00:00:11:22:33
set interfaces ae0 unit 0 family ethernet-switching vlan members V10</pre>
<p>Dono leaves par same ESI aur same LACP <b>system-id</b> server ko yakin dilate hain ki woh ek switch se baat kar raha hai. Woh normal LACP bundle chalata hai aur use EVPN ka kuch jaanne ki zaroorat nahi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Multihomed server">
<rect x="40" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="48" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text>
<rect x="490" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="545" y="48" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text>
<rect x="265" y="130" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">Server</text>
<line x1="95" y1="66" x2="300" y2="130" stroke="#64748b" stroke-width="2"/><line x1="545" y1="66" x2="340" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">dono leaves par same ESI</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">ek LACP bundle, do leaves</text>
</svg><p class="cap">ESI-LAG: ek logical bundle jo do leaves par khatam hota hai.</p></div>

<h3>Multihoming routes kya karte hain</h3>
<table class="cmp"><tr><th>Route</th><th>Kaam</th></tr>
<tr><td>Type 4 (Ethernet segment)</td><td>Sirf same ESI wale leaves import karte hain. Woh ek doosre ko dhoondte hain aur designated forwarder chunte hain</td></tr>
<tr><td>Type 1 per ES (auto-discovery)</td><td>"Main is ESI se juda hoon". Ise withdraw karne se sabko ek saath bata diya jaata hai ki us leaf ko saare MACs ke liye use karna band karo: <b>fast mass withdrawal</b></td></tr>
<tr><td>Type 1 per EVI (auto-discovery)</td><td><b>Aliasing</b> enable karta hai: remote leaves ESI ke har leaf par load-balance karte hain, chahe MAC sirf ek ne seekha ho</td></tr>
<tr><td>ESI wala Type 2</td><td>ESI ke peeche ka MAC ek leaf se bandhne ke bajaye ESI le jaata hai</td></tr></table>

<h3>Designated forwarder</h3>
<p>BUM traffic dono leaves par aata hai, kyunki dono flood list mein hain. Rule ke bina server ko har broadcast ki do copies milti. <b>Designated forwarder (DF)</b> woh ek leaf hai, per VLAN, jise segment ki <i>taraf</i> BUM traffic bhejne ki ijazat hai. Default election leaves ko IP address se sort karti hai aur VLAN number ko leaves ki ginti se modulo leti hai, isliye alag VLANs leaves mein bant jaate hain. Loop rokne ke liye, leaf 1 par server se aaya BUM leaf 2 ko ESI label ke saath flood hota hai, taaki leaf 2 use usi segment par wapas na bheje: <b>split horizon</b>.</p>
<p>Unicast alag hai: all-active mode mein dono leaves known unicast forward karte hain, isi liye aliasing matter karta hai. <code>single-active</code> mein ek time par sirf ek leaf VLAN ka traffic le jaata hai aur doosra standby hota hai; yeh un servers ke liye theek hai jo LACP nahi chala sakte.</p>

<h3>Fabric mein Layer 3: CRB aur ERB</h3>
<p>Bridged overlay, jaise labs, sirf Layer 2 extend karta hai. Alag VNIs ke hosts ko router chahiye. Do classic placements hain.</p>
<table class="cmp"><tr><th>Design</th><th>Gateway kahan</th><th>Trade-off</th></tr>
<tr><td>Centrally routed bridging (CRB)</td><td>Spines par (IRB interfaces); leaves sirf bridge karte hain</td><td>Simple leaves; VLANs ke beech traffic spine tak jaakar wapas aata hai</td></tr>
<tr><td>Edge routed bridging (ERB)</td><td>Har leaf par, same anycast IP aur MAC ke saath</td><td>Routing first hop par hoti hai; type 2 MAC+IP aur type 5 prefixes reachability le jaate hain</td></tr></table>
<pre class="code"><span class="c"># concept: VLAN V10 ke liye ERB gateway (simulated nahi; IRB with virtual gateway use hota hai)</span>
set vlans V10 l3-interface irb.10
set interfaces irb unit 10 family inet address 10.40.10.2/24 virtual-gateway-address 10.40.10.254
<span class="c"># concept: tenant VRF jo prefixes ko EVPN type 5 ki tarah advertise karta hai</span>
set routing-instances TENANT1 instance-type vrf
set routing-instances TENANT1 interface irb.10
set routing-instances TENANT1 protocols evpn ip-prefix-routes advertise direct-nexthop
set routing-instances TENANT1 protocols evpn ip-prefix-routes encapsulation vxlan
set routing-instances TENANT1 protocols evpn ip-prefix-routes vni 9000</pre>
<p>Hosts har leaf par anycast address 10.40.10.254 ko default gateway ki tarah use karte hain, isliye racks ke beech move hone wali VM wahi gateway rakhti hai. VNIs ke beech router har tenant ke liye ek Layer 3 VNI (yahan 9000) use karta hai, aur type-5 route har tenant prefix advertise karta hai. Wahi idea Cisco side ke data centre EVPN chapters mein aate hain; yahan hum Junos statements par focus karte hain. Is lab module mein IRB configure nahi hota, isliye upar ke commands sirf exam ki taiyari ke liye hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek server ESI X ke saath LEAF1 aur LEAF2 se dual-homed hai. Segment par VLAN 10 aur VLAN 11 hain. Do leaves IP se sorted hon to 10 mod 2 = 0, isliye index 0 wala leaf VLAN 10 ka DF hai, aur 11 mod 2 = 1 to index 1 wala leaf VLAN 11 ka DF. LEAF1 fail ho to uska type-1 per-ES route withdraw hota hai, remote leaves use saare MAC next-hop lists se ek saath hata dete hain, aur traffic individual MAC withdrawals ka intezaar kiye bina LEAF2 se chalta hai. Jin VLANs ka LEAF1 owner tha unke liye nayi DF election chalti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Dono leaves par alag ESI values, isliye woh alag segments maane jaate hain aur server ke through loop ban jaata hai. (2) Alag LACP system-id values, isliye server sirf ek link up karta hai. (3) Aise server ke saath <code>all-active</code> jo LACP nahi kar sakta. (4) DF election ke bina BUM duplicates filter hone ki umeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaam yaad rakho: type 4 DF chunta hai, type 1 per ES mass withdrawal deta hai, type 1 per EVI aliasing deta hai. Ek aur pasandida: <b>all-active</b> ka matlab har leaf forward karta hai; <b>single-active</b> ka matlab ek time par ek.</p></div>

<div class="scn"><h4>Server jisne har ARP do baar paya</h4><p>Naye dual-homed database server ne duplicate broadcast frames log kiye. Dono leaves ko aise ESI values diye gaye the jo ek byte mein alag the, isliye unhone ek doosre ke type-4 routes import nahi kiye aur har ek ne maana ki woh segment par akela leaf hai. Dono ne server ki taraf BUM forward kiya. Ek leaf par ESI theek karne se unhone har VLAN ke liye ek DF chuna, aur duplicates ruk gaye.</p><p><b>Lesson:</b> ESI aur LACP system-id dono leaves par bilkul match hone chahiye.</p></div>

<div class="iv"><p class="q">"EVPN multihoming MC-LAG ke muqable kaunsi samasyayein hal karta hai?"</p><p>Yeh proprietary inter-chassis link ki jagah standards-based BGP control plane use karta hai, do se zyada peers tak scale karta hai, all-active forwarding support karta hai, type-1 mass withdrawal se fast convergence deta hai, aliasing se saare leaves par load balancing deta hai, aur DF election tatha split horizon se loop-free BUM delivery deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ESI-LAG mein dono leaves par same ESI aur LACP system-id hota hai.</li>
<li>Type 4 peers dhoondta hai aur DF chunta hai; type 1 mass withdrawal aur aliasing deta hai.</li>
<li>DF per VLAN hota hai aur sirf wahi segment ki taraf BUM forward karta hai.</li>
<li>CRB gateways spines par rakhta hai; ERB har leaf par anycast gateways aur VRFs ke beech type 5 rakhta hai.</li>
<li>Yeh topics simulator labs mein nahi banaye jaate, isliye inhe concepts aur configuration ki tarah seekho.</li>
</ul></div>
`}};export{e as default};