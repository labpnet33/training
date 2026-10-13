var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a courier company whose branches phone head office with their address every morning and then drive straight to each other. You now know the real names: spokes <b>register</b> with the NHS, <b>resolve</b> each other through it, build <b>mGRE</b> tunnels on demand, protect them with one <b>IPsec profile</b>, and run a routing protocol whose behaviour depends on the <b>phase</b>. Use this chapter as your revision sheet before the lab, the written exam and the interview.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Choosing the DMVPN phase and routing settings">
<rect x="210" y="10" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Need spoke-to-spoke?</text>
<rect x="20" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="124" text-anchor="middle" class="svg-ink" font-size="13">No: Phase 1</text><text x="110" y="144" text-anchor="middle" class="svg-muted" font-size="12">summary or default</text>
<rect x="230" y="100" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Yes, full tables: Phase 2</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">keep next hop, no summary</text>
<rect x="440" y="100" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="124" text-anchor="middle" class="svg-ink" font-size="13">Yes, small tables: Phase 3</text><text x="530" y="144" text-anchor="middle" class="svg-muted" font-size="12">redirect + shortcut</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="110" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF p2mp</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF broadcast, hub DR</text>
<text x="530" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF p2mp or stub area</text>
<text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP summary</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP no SH, no NHS</text>
<text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP summary</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">All phases: mGRE hub, NHRP, IPsec profile, ip mtu 1400, adjust-mss 1360</text>
</svg><p class="cap">One question picks the phase; the phase picks the routing settings. (SH = split horizon, NHS = next-hop-self.)</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why point-to-point tunnels do not scale and what mGRE, NHRP and IPsec each contribute.</li>
<li>Configure a hub (mGRE, network-id, authentication, <code>map multicast dynamic</code>, holdtime) and spokes (static map, multicast map, NHS) and verify registration.</li>
<li>Read <code>show dmvpn</code>: Type, peers, State (UP / NHRP / IKE / IPSEC) and attributes S, D, T1, T2, L, X.</li>
<li>Describe NHRP registration, resolution, purge and Traffic Indication, and which router sends each.</li>
<li>Compare phases 1, 2 and 3 and state the routing requirement of each.</li>
<li>Configure OSPF broadcast with the hub as DR and spokes at priority 0; explain point-to-multipoint and the network-type mismatch symptom.</li>
<li>Configure EIGRP for each phase (split horizon, next-hop-self, summaries, stub spokes) and BGP dynamic neighbours.</li>
<li>Enable phase 3 and recognise H routes, % next-hop overrides, nho and DT1/DT2.</li>
<li>Protect the cloud with an IPsec profile (IKEv1 or IKEv2, transport mode) and verify SAs per peer.</li>
<li>Apply <code>ip mtu 1400</code> / <code>ip tcp adjust-mss 1360</code> and explain a front-door VRF.</li>
<li>Troubleshoot bottom up through all four labs.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DMVPN</dt><dd>Dynamic Multipoint VPN: mGRE + NHRP + IPsec + a routing protocol.</dd>
<dt>mGRE</dt><dd>Multipoint GRE tunnel: source only, no destination; NBMA behaviour.</dd>
<dt>NBMA address</dt><dd>The public/underlay address a tunnel is sourced from (100.64.x.2 in the lab).</dd>
<dt>NHRP</dt><dd>Next Hop Resolution Protocol (RFC 2332); maps tunnel addresses to NBMA addresses; carried in GRE type 0x2001.</dd>
<dt>NHS / NHC</dt><dd>Next hop server (hub) / next hop client (spoke).</dd>
<dt>Traffic Indication</dt><dd>Phase 3 NHRP redirect sent by the hub to the source spoke.</dd>
<dt>Shortcut</dt><dd>Phase 3 spoke action: resolve the destination prefix and install an H route or next-hop override.</dd>
<dt>FVRF</dt><dd>Front-door VRF: the WAN interface in its own VRF, used for NBMA lookups via <code>tunnel vrf</code>.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Hub: no tunnel destination, no NHS, <code>ip nhrp map multicast dynamic</code>. Spoke: <code>ip nhrp map</code> + <code>map multicast</code> + <code>nhs</code> (or <code>ip nhrp nhs X nbma Y multicast</code>).</li>
<li>Network-id is locally significant; authentication (max 8 characters, clear text) and tunnel key must match.</li>
<li>Holdtime default 7200 s, recommended 300 to 600; registration every holdtime/3.</li>
<li>Phase 2: next hop must be the far spoke; no summarisation. Phase 3: <code>ip nhrp redirect</code> (hub) + <code>ip nhrp shortcut</code> (spokes); summaries allowed.</li>
<li>OSPF: tunnel default point-to-point; phase 2 = broadcast, hub DR, spokes priority 0; p2mp = next hop hub.</li>
<li>EIGRP phase 2: <code>no ip split-horizon eigrp</code> + <code>no ip next-hop-self eigrp</code> on the hub.</li>
<li>NHRP route: code H, AD 250. Next-hop override: %. <code>show dmvpn detail</code>: DT1 route installed, DT2 next-hop override.</li>
<li>IPsec: profile + <code>tunnel protection</code>; transport mode; flow = GRE 47 between NBMA addresses; one SA pair per peer.</li>
<li><code>ip mtu 1400</code>, <code>ip tcp adjust-mss 1360</code>.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>Multipoint tunnel</td><td><code>tunnel mode gre multipoint</code></td></tr>
<tr><td>Enable NHRP / match auth</td><td><code>ip nhrp network-id 100</code>, <code>ip nhrp authentication NKdmvpn</code></td></tr>
<tr><td>Hub multicast</td><td><code>ip nhrp map multicast dynamic</code></td></tr>
<tr><td>Spoke to hub</td><td><code>ip nhrp map 172.16.100.1 100.64.10.2</code>, <code>ip nhrp map multicast 100.64.10.2</code>, <code>ip nhrp nhs 172.16.100.1</code></td></tr>
<tr><td>Phase 3</td><td><code>ip nhrp redirect</code> (hub), <code>ip nhrp shortcut</code> (spokes)</td></tr>
<tr><td>Encryption</td><td><code>crypto ipsec profile DMVPN-PROF</code>, <code>tunnel protection ipsec profile DMVPN-PROF</code></td></tr>
<tr><td>MTU</td><td><code>ip mtu 1400</code>, <code>ip tcp adjust-mss 1360</code></td></tr>
<tr><td>Verify</td><td><code>show dmvpn [detail]</code>, <code>show ip nhrp [nhs detail]</code>, <code>show crypto session</code>, <code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code></td></tr></table>

<div class="eg"><p><b>Worked example: one-minute health check.</b> On the hub: <code>show dmvpn</code> shows "NHRP Peers:2" with two D lines UP; <code>show ip ospf neighbor</code> shows 2.2.2.2 and 3.3.3.3 FULL/DROTHER; <code>show crypto isakmp sa</code> shows two QM_IDLE. On SPOKE1 after a ping to PC2: <code>show dmvpn</code> shows S for 100.64.10.2 and D for 100.64.30.2. Four commands, whole cloud verified.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> NHS pointed at a public address; missing <code>map multicast dynamic</code>; tunnel left at OSPF point-to-point; spoke DR; phase 2 with a summary; redirect and shortcut on the wrong routers; crypto on only some routers; forgetting MSS clamping.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> "Tunnel up/up" is not "registered". "FULL" is not "has routes". "Pings work" is not "spoke-to-spoke works". Always go one layer deeper with <code>show ip nhrp nhs</code>, <code>show ip route</code> and <code>traceroute</code>.</p></div>

<div class="scn"><h4>The migration weekend</h4><p>A retailer moved 120 stores from point-to-point GRE to DMVPN phase 3 with OSPF in a totally stubby area, IKEv2 and a front-door VRF. The engineer staged the hub first with no spokes, then migrated stores in batches using one template. Each batch was verified with the same four commands. Store-to-store video calls, which used to hairpin through the DC, now built direct tunnels, while each store's routing table shrank to a default route plus a few H routes.</p><p><b>Lesson:</b> a DMVPN rollout is template-driven: get the template right once, verify with a fixed checklist, and scale.</p></div>

<div class="iv"><p class="q">"Give me a two-minute overview of DMVPN."</p><p>Strong answer: DMVPN scales hub-and-spoke VPNs with one mGRE interface per router. NHRP lets spokes register their NBMA address with the hub (NHS) and resolve each other, so the hub needs no per-spoke configuration and spokes can build direct tunnels on demand. Phase 1 is hub-only, phase 2 triggers spoke-to-spoke from the routing next hop (requires next-hop preservation and no summaries), phase 3 uses hub redirects and spoke shortcuts so summaries are allowed. An IPsec profile with tunnel protection encrypts everything in transport mode, and templates set MTU 1400 and MSS 1360.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN = mGRE + NHRP + IPsec + IGP; one template scales to hundreds of spokes.</li>
<li>Registration builds the hub's table; resolution (phase 2) or redirect + shortcut (phase 3) builds spoke-to-spoke tunnels.</li>
<li>Routing must match the phase: preserve next hops in phase 2, summarise freely in phase 3.</li>
<li>One IPsec profile, transport mode, one SA pair per peer.</li>
<li>Troubleshoot bottom up; <code>show dmvpn</code> tells you which layer to look at.</li>
</ul></div>
`,hi:`
<p>Aapne ek courier company se shuru kiya tha jiski branches har subah head office ko apna address phone karti hain aur phir seedhe ek doosre tak jaati hain. Ab aap asli naam jaante ho: spokes NHS ke saath <b>register</b> karte hain, uske through ek doosre ko <b>resolve</b> karte hain, zaroorat par <b>mGRE</b> tunnels banate hain, unhe ek <b>IPsec profile</b> se protect karte hain, aur ek routing protocol chalate hain jiska behaviour <b>phase</b> par depend karta hai. Lab, written exam aur interview se pehle is chapter ko revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="DMVPN phase aur routing settings chunna">
<rect x="210" y="10" width="220" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Spoke-to-spoke chahiye?</text>
<rect x="20" y="100" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="124" text-anchor="middle" class="svg-ink" font-size="13">Nahi: Phase 1</text><text x="110" y="144" text-anchor="middle" class="svg-muted" font-size="12">summary ya default</text>
<rect x="230" y="100" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="13">Haan, full tables: Phase 2</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">next hop rakho, summary nahi</text>
<rect x="440" y="100" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="530" y="124" text-anchor="middle" class="svg-ink" font-size="13">Haan, chhoti tables: Phase 3</text><text x="530" y="144" text-anchor="middle" class="svg-muted" font-size="12">redirect + shortcut</text>
<line x1="280" y1="50" x2="110" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="50" x2="320" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="50" x2="530" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="110" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF p2mp</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF broadcast, hub DR</text>
<text x="530" y="190" text-anchor="middle" class="svg-ink" font-size="12">OSPF p2mp ya stub area</text>
<text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP summary</text>
<text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP no SH, no NHS</text>
<text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">EIGRP summary</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Har phase: mGRE hub, NHRP, IPsec profile, ip mtu 1400, adjust-mss 1360</text>
</svg><p class="cap">Ek sawaal phase chunta hai; phase routing settings chunta hai. (SH = split horizon, NHS = next-hop-self.)</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjha pao ki point-to-point tunnels scale kyun nahi karte aur mGRE, NHRP aur IPsec har ek kya contribute karta hai.</li>
<li>Hub (mGRE, network-id, authentication, <code>map multicast dynamic</code>, holdtime) aur spokes (static map, multicast map, NHS) configure karo aur registration verify karo.</li>
<li><code>show dmvpn</code> padho: Type, peers, State (UP / NHRP / IKE / IPSEC) aur attributes S, D, T1, T2, L, X.</li>
<li>NHRP registration, resolution, purge aur Traffic Indication describe karo, aur kaunsa router kya bhejta hai.</li>
<li>Phases 1, 2 aur 3 compare karo aur har ek ki routing requirement batao.</li>
<li>Hub DR aur spokes priority 0 ke saath OSPF broadcast configure karo; point-to-multipoint aur network-type mismatch symptom samjhao.</li>
<li>Har phase ke liye EIGRP configure karo (split horizon, next-hop-self, summaries, stub spokes) aur BGP dynamic neighbours.</li>
<li>Phase 3 enable karo aur H routes, % next-hop overrides, nho aur DT1/DT2 pehchano.</li>
<li>Cloud ko IPsec profile se protect karo (IKEv1 ya IKEv2, transport mode) aur har peer ke SAs verify karo.</li>
<li><code>ip mtu 1400</code> / <code>ip tcp adjust-mss 1360</code> lagao aur front-door VRF samjhao.</li>
<li>Chaaron labs mein bottom up troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>DMVPN</dt><dd>Dynamic Multipoint VPN: mGRE + NHRP + IPsec + ek routing protocol.</dd>
<dt>mGRE</dt><dd>Multipoint GRE tunnel: sirf source, destination nahi; NBMA behaviour.</dd>
<dt>NBMA address</dt><dd>Public/underlay address jisse tunnel source hota hai (lab mein 100.64.x.2).</dd>
<dt>NHRP</dt><dd>Next Hop Resolution Protocol (RFC 2332); tunnel addresses ko NBMA addresses se map karta hai; GRE type 0x2001 mein jaata hai.</dd>
<dt>NHS / NHC</dt><dd>Next hop server (hub) / next hop client (spoke).</dd>
<dt>Traffic Indication</dt><dd>Phase 3 NHRP redirect jo hub source spoke ko bhejta hai.</dd>
<dt>Shortcut</dt><dd>Phase 3 spoke action: destination prefix resolve karke H route ya next-hop override install karna.</dd>
<dt>FVRF</dt><dd>Front-door VRF: WAN interface apne VRF mein, <code>tunnel vrf</code> se NBMA lookups ke liye use hota hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Hub: na tunnel destination, na NHS, <code>ip nhrp map multicast dynamic</code>. Spoke: <code>ip nhrp map</code> + <code>map multicast</code> + <code>nhs</code> (ya <code>ip nhrp nhs X nbma Y multicast</code>).</li>
<li>Network-id locally significant hai; authentication (max 8 characters, clear text) aur tunnel key match honi chahiye.</li>
<li>Holdtime default 7200 s, recommended 300 se 600; registration har holdtime/3.</li>
<li>Phase 2: next hop door wala spoke hona chahiye; summarisation nahi. Phase 3: <code>ip nhrp redirect</code> (hub) + <code>ip nhrp shortcut</code> (spokes); summaries allowed.</li>
<li>OSPF: tunnel default point-to-point; phase 2 = broadcast, hub DR, spokes priority 0; p2mp = next hop hub.</li>
<li>EIGRP phase 2: hub par <code>no ip split-horizon eigrp</code> + <code>no ip next-hop-self eigrp</code>.</li>
<li>NHRP route: code H, AD 250. Next-hop override: %. <code>show dmvpn detail</code>: DT1 route installed, DT2 next-hop override.</li>
<li>IPsec: profile + <code>tunnel protection</code>; transport mode; flow = NBMA addresses ke beech GRE 47; har peer ka ek SA pair.</li>
<li><code>ip mtu 1400</code>, <code>ip tcp adjust-mss 1360</code>.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Purpose</th><th>Command</th></tr>
<tr><td>Multipoint tunnel</td><td><code>tunnel mode gre multipoint</code></td></tr>
<tr><td>NHRP enable / auth match</td><td><code>ip nhrp network-id 100</code>, <code>ip nhrp authentication NKdmvpn</code></td></tr>
<tr><td>Hub multicast</td><td><code>ip nhrp map multicast dynamic</code></td></tr>
<tr><td>Spoke se hub</td><td><code>ip nhrp map 172.16.100.1 100.64.10.2</code>, <code>ip nhrp map multicast 100.64.10.2</code>, <code>ip nhrp nhs 172.16.100.1</code></td></tr>
<tr><td>Phase 3</td><td><code>ip nhrp redirect</code> (hub), <code>ip nhrp shortcut</code> (spokes)</td></tr>
<tr><td>Encryption</td><td><code>crypto ipsec profile DMVPN-PROF</code>, <code>tunnel protection ipsec profile DMVPN-PROF</code></td></tr>
<tr><td>MTU</td><td><code>ip mtu 1400</code>, <code>ip tcp adjust-mss 1360</code></td></tr>
<tr><td>Verify</td><td><code>show dmvpn [detail]</code>, <code>show ip nhrp [nhs detail]</code>, <code>show crypto session</code>, <code>show crypto isakmp sa</code>, <code>show crypto ipsec sa</code></td></tr></table>

<div class="eg"><p><b>Worked example: ek minute ka health check.</b> Hub par: <code>show dmvpn</code> "NHRP Peers:2" aur do D lines UP dikhata hai; <code>show ip ospf neighbor</code> 2.2.2.2 aur 3.3.3.3 FULL/DROTHER dikhata hai; <code>show crypto isakmp sa</code> do QM_IDLE dikhata hai. PC2 ko ping ke baad SPOKE1 par: <code>show dmvpn</code> 100.64.10.2 ke liye S aur 100.64.30.2 ke liye D dikhata hai. Chaar commands, poora cloud verified.</p></div>

<div class="warn"><p><b>Exam day par bachne wali common galtiyan.</b> NHS public address par point; <code>map multicast dynamic</code> missing; tunnel OSPF point-to-point par chhoda; spoke DR; summary ke saath phase 2; redirect aur shortcut galat routers par; crypto sirf kuch routers par; MSS clamping bhoolna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> "Tunnel up/up" ka matlab "registered" nahi. "FULL" ka matlab "routes hain" nahi. "Pings chal rahe" ka matlab "spoke-to-spoke chal raha" nahi. Hamesha <code>show ip nhrp nhs</code>, <code>show ip route</code> aur <code>traceroute</code> se ek layer aur gehre jao.</p></div>

<div class="scn"><h4>Migration weekend</h4><p>Ek retailer ne 120 stores ko point-to-point GRE se DMVPN phase 3 par shift kiya, totally stubby area mein OSPF, IKEv2 aur front-door VRF ke saath. Engineer ne pehle bina spokes ke hub stage kiya, phir ek template se batches mein stores migrate kiye. Har batch same chaar commands se verify hua. Store-to-store video calls, jo pehle DC se hairpin hoti thin, ab direct tunnels banane lagin, jabki har store ki routing table default route plus kuch H routes tak simat gayi.</p><p><b>Seekh:</b> DMVPN rollout template-driven hota hai: template ek baar sahi karo, fixed checklist se verify karo, aur scale karo.</p></div>

<div class="iv"><p class="q">"Mujhe DMVPN ka do minute ka overview do."</p><p>Strong answer: DMVPN har router par ek mGRE interface se hub-and-spoke VPNs scale karta hai. NHRP spokes ko apna NBMA address hub (NHS) ke saath register karne aur ek doosre ko resolve karne deta hai, isliye hub ko har spoke ki configuration nahi chahiye aur spokes zaroorat par direct tunnels bana sakte hain. Phase 1 sirf hub hai, phase 2 routing next hop se spoke-to-spoke trigger karta hai (next-hop preservation chahiye aur summaries nahi), phase 3 hub redirects aur spoke shortcuts use karta hai isliye summaries allowed hain. Tunnel protection wala IPsec profile transport mode mein sab encrypt karta hai, aur templates MTU 1400 aur MSS 1360 set karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DMVPN = mGRE + NHRP + IPsec + IGP; ek template saikdon spokes tak scale karta hai.</li>
<li>Registration hub ki table banata hai; resolution (phase 2) ya redirect + shortcut (phase 3) spoke-to-spoke tunnels banate hain.</li>
<li>Routing phase se match honi chahiye: phase 2 mein next hops preserve karo, phase 3 mein khul kar summarise karo.</li>
<li>Ek IPsec profile, transport mode, har peer ka ek SA pair.</li>
<li>Bottom up troubleshoot karo; <code>show dmvpn</code> batata hai kis layer ko dekhna hai.</li>
</ul></div>
`}};export{e as default};