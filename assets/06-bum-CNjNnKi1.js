var e={id:`bum`,h:{en:`BUM traffic: multicast underlay vs ingress replication`,hi:`BUM traffic: multicast underlay vs ingress replication`},body:{en:`
<p>A school principal needs to send a circular to every classroom. She has two options. She can photocopy it once per class and hand a copy to a runner for each room (that is <b>ingress replication</b>: the sender makes all the copies). Or she can post one copy on the notice board of each floor, and every class that has subscribed to that board reads it there (that is <b>multicast</b>: the network makes copies only where branches split). Both deliver the circular. They differ in who does the work and how much paper moves through the corridors.</p>

<h3>What BUM traffic is</h3>
<p><b>BUM</b> = <b>Broadcast</b> (ARP requests, DHCP discover), <b>Unknown unicast</b> (a destination MAC not yet in the table) and <b>Multicast</b> (inner multicast such as some cluster heartbeats). A classic switch floods these out of every port in the VLAN. A VTEP must "flood" them to every <b>remote VTEP</b> that has the same VNI. Because the underlay is routed, there is no Layer 2 flooding to rely on, so VXLAN needs an explicit replication method per VNI.</p>

<h3>Method 1: multicast underlay</h3>
<p>Each VNI is mapped to an underlay <b>multicast group</b>, for example <code>mcast-group 239.1.1.10</code>. Every VTEP that hosts the VNI joins that group through PIM. When LEAF1 must flood an ARP in VNI 10010, it sends <b>one</b> VXLAN packet with outer destination 239.1.1.10. The spines replicate it along the multicast tree only towards leaves that joined.</p>
<pre class="code"><span class="c">! Underlay multicast (all leaves and spines), RP on the spines</span>
feature pim
ip pim rp-address 10.255.0.100 group-list 239.1.1.0/24
interface Ethernet1/1
  ip pim sparse-mode
interface loopback1
  ip pim sparse-mode
<span class="c">! On the leaf VTEP</span>
interface nve1
  source-interface loopback1
  member vni 10010
    mcast-group 239.1.1.10</pre>
<p>Designs normally use PIM sparse mode with an anycast RP shared by the spines, or PIM BiDir, which scales better with many sources. Several VNIs may share one group to save multicast state, at the cost of some leaves receiving floods for VNIs they do not host (they simply discard them).</p>

<h3>Method 2: ingress replication (head-end replication)</h3>
<p>No multicast in the underlay at all. The ingress VTEP keeps a <b>list of peer VTEPs</b> for each VNI and sends a separate <b>unicast</b> copy of every BUM frame to each one. With flood-and-learn the list is <b>static</b>: you type every peer.</p>
<pre class="code">interface nve1
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.2
      peer-ip 10.254.0.3</pre>
<p>With BGP EVPN the list is built automatically (<code>ingress-replication protocol bgp</code>), which you will use next module. <b>The lab in this module uses static ingress replication</b>: two leaves, one peer each.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Multicast versus ingress replication">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast underlay</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Ingress replication</text>
<rect x="110" y="35" width="100" height="32" rx="6" fill="#bae6fd"/><text x="160" y="56" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="110" y="105" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<line x1="160" y1="67" x2="160" y2="105" stroke="#64748b" stroke-width="3"/><text x="215" y="90" class="svg-accent" font-size="12">1 copy</text>
<rect x="20" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="60" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="120" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="160" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<rect x="220" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="260" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF4</text>
<line x1="160" y1="137" x2="60" y2="185" stroke="#64748b" stroke-width="2"/><line x1="160" y1="137" x2="160" y2="185" stroke="#64748b" stroke-width="2"/><line x1="160" y1="137" x2="260" y2="185" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="35" width="100" height="32" rx="6" fill="#bae6fd"/><text x="480" y="56" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="430" y="105" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<line x1="470" y1="67" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><line x1="480" y1="67" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="67" x2="490" y2="105" stroke="#64748b" stroke-width="2"/><text x="535" y="90" class="svg-accent" font-size="12">3 copies</text>
<rect x="340" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="380" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="440" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="480" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<rect x="540" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="580" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF4</text>
<line x1="480" y1="137" x2="380" y2="185" stroke="#64748b" stroke-width="2"/><line x1="480" y1="137" x2="480" y2="185" stroke="#64748b" stroke-width="2"/><line x1="480" y1="137" x2="580" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="160" y="240" text-anchor="middle" class="svg-muted" font-size="12">network replicates</text><text x="480" y="240" text-anchor="middle" class="svg-muted" font-size="12">source VTEP replicates</text>
</svg><p class="cap">Multicast sends one copy up and lets the spine branch it. Ingress replication sends one unicast copy per peer up the uplink.</p></div>

<h3>Trade-offs</h3>
<table class="cmp"><tr><th></th><th>Multicast underlay</th><th>Static ingress replication</th></tr>
<tr><td>Underlay requirement</td><td>PIM, RP design, multicast troubleshooting skills</td><td>Only unicast routing</td></tr>
<tr><td>Copies on the source uplink</td><td>1 per BUM frame</td><td>N−1 per BUM frame (N = VTEPs in the VNI)</td></tr>
<tr><td>Configuration effort</td><td>One group per VNI (or shared), same on every leaf</td><td>Every leaf lists every other leaf; grows as N×(N−1)</td></tr>
<tr><td>Adding a leaf</td><td>New leaf joins the group; others unchanged</td><td>Touch every existing leaf to add the new peer</td></tr>
<tr><td>Best for</td><td>Large flood-and-learn fabrics</td><td>Labs, small fabrics, or with EVPN (automatic list)</td></tr>
</table>

<div class="eg"><p><b>Worked example: sizing ingress replication.</b> A fabric has 32 leaves, all hosting VNI 10010. A misbehaving host sends 20,000 broadcast frames per second of 500 bytes, which is 80 Mbit/s. With multicast, LEAF1 sends 80 Mbit/s into the fabric. With ingress replication it sends 31 copies: 31 × 80 = <b>2.48 Gbit/s</b> on its uplinks, and every remote leaf receives 80 Mbit/s. Static configuration effort: 32 leaves × 31 peers = <b>992 peer-ip lines</b> for one VNI. That is why static lists are for small fabrics only.</p></div>

<h3>What the outputs look like</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
       SU - Suppress Unknown Unicast
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span>

LEAF1# show nve vni ingress-replication
Interface VNI      Replication List  Source  Up Time
--------- -------- ----------------- ------- -------
<span class="hl">nve1      10010    10.254.0.2        CLI     00:12:41</span></pre>
<p>"UnicastStatic" in the multicast-group column means static ingress replication; in multicast mode you would see the group address (for example 239.1.1.10). The replication list source "CLI" confirms it was typed statically; with EVPN it shows "BGP-IMET".</p>

<div class="warn"><p><b>Common mistake.</b> Configuring multicast on one leaf and ingress replication on another for the same VNI. Each leaf floods only in its own mode, so floods from one never reach the other, and ARP fails in one or both directions. All VTEPs of a VNI must use the same BUM method (and the same group, for multicast).</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which BUM method needs no multicast in the underlay?" Ingress (head-end) replication. "Which one sends a single copy from the source VTEP?" Multicast. And static ingress replication lists are configured under <b>member vni</b> inside nve1, not globally.</p></div>

<div class="scn"><h4>The new leaf that could hear but not speak</h4><p>A company with static ingress replication added LEAF5 to a four-leaf fabric. The engineer configured LEAF5 with all four peers, and LEAF5's servers could reach everyone once conversations started. But new ARP requests from servers on LEAF1–LEAF4 never reached LEAF5's hosts, so connections initiated towards LEAF5 failed. The old leaves' peer lists did not include 10.254.0.5, so they never replicated BUM to it. Adding <code>peer-ip 10.254.0.5</code> on the four existing leaves fixed it. Six months later the team migrated to EVPN so that peer lists would build themselves.</p><p><b>Lesson:</b> static replication is symmetric only if you make it symmetric. Every leaf must list every other leaf.</p></div>

<div class="iv"><p class="q">"Compare multicast underlay and ingress replication for BUM traffic."</p><p>Strong answer: multicast maps each VNI to a group; the source VTEP sends one copy and PIM replicates along the tree, so it is bandwidth-efficient but needs PIM and RP design. Ingress replication sends one unicast copy per peer VTEP from the source, so it needs only unicast routing but costs N−1 copies on the uplink. Static peer lists grow as N×(N−1) and must be edited on every leaf when one is added, which is why production uses ingress replication with BGP EVPN, or multicast. Give a sizing number to show you understand the cost.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BUM = broadcast, unknown unicast, multicast; it must reach every VTEP that has the VNI.</li>
<li>Multicast underlay: mcast-group per VNI, one copy from the source, needs PIM.</li>
<li>Ingress replication: one unicast copy per peer, unicast-only underlay; static lists or EVPN.</li>
<li>Static lists scale as N×(N−1) and must be symmetric on all leaves.</li>
<li>The module lab uses ingress-replication protocol static with one peer-ip per leaf.</li>
</ul></div>
`,hi:`
<p>Ek school principal ko har classroom mein circular bhejna hai. Uske paas do options hain. Woh har class ke liye ek photocopy kara kar har room ke liye ek runner ko de sakti hai (yeh <b>ingress replication</b> hai: bhejne wala saari copies banata hai). Ya woh har floor ke notice board par ek copy laga sakti hai, aur us board ko subscribe karne wali har class wahan padh leti hai (yeh <b>multicast</b> hai: network copies sirf wahan banata hai jahan branches alag hoti hain). Dono circular pahuncha dete hain. Farak yeh hai ki kaam kaun karta hai aur corridors mein kitna kaagaz ghoomta hai.</p>

<h3>BUM traffic kya hai</h3>
<p><b>BUM</b> = <b>Broadcast</b> (ARP requests, DHCP discover), <b>Unknown unicast</b> (aisa destination MAC jo abhi table mein nahi) aur <b>Multicast</b> (inner multicast jaise kuch cluster heartbeats). Classic switch inhe VLAN ke har port par flood karta hai. VTEP ko inhe har us <b>remote VTEP</b> tak "flood" karna hota hai jiske paas same VNI hai. Underlay routed hai, isliye bharosa karne ke liye koi Layer 2 flooding nahi hai, aur VXLAN ko har VNI ke liye ek explicit replication method chahiye.</p>

<h3>Method 1: multicast underlay</h3>
<p>Har VNI ek underlay <b>multicast group</b> par map hota hai, jaise <code>mcast-group 239.1.1.10</code>. Jo bhi VTEP VNI host karta hai woh PIM ke through us group ko join karta hai. Jab LEAF1 ko VNI 10010 mein ARP flood karna hota hai, woh outer destination 239.1.1.10 ke saath <b>ek</b> VXLAN packet bhejta hai. Spines use multicast tree ke saath sirf un leaves ki taraf replicate karte hain jinhone join kiya hai.</p>
<pre class="code"><span class="c">! Underlay multicast (saare leaves aur spines), RP spines par</span>
feature pim
ip pim rp-address 10.255.0.100 group-list 239.1.1.0/24
interface Ethernet1/1
  ip pim sparse-mode
interface loopback1
  ip pim sparse-mode
<span class="c">! Leaf VTEP par</span>
interface nve1
  source-interface loopback1
  member vni 10010
    mcast-group 239.1.1.10</pre>
<p>Designs normally spines ke beech shared anycast RP ke saath PIM sparse mode use karte hain, ya PIM BiDir, jo bahut saare sources ke saath behtar scale karta hai. Multicast state bachane ke liye kai VNIs ek group share kar sakte hain, is keemat par ki kuch leaves ko un VNIs ke floods milte hain jo woh host nahi karte (woh bas unhe discard kar dete hain).</p>

<h3>Method 2: ingress replication (head-end replication)</h3>
<p>Underlay mein multicast bilkul nahi. Ingress VTEP har VNI ke liye <b>peer VTEPs ki list</b> rakhta hai aur har BUM frame ki ek alag <b>unicast</b> copy har ek ko bhejta hai. Flood-and-learn mein list <b>static</b> hoti hai: aap har peer type karte ho.</p>
<pre class="code">interface nve1
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.2
      peer-ip 10.254.0.3</pre>
<p>BGP EVPN ke saath list automatically banti hai (<code>ingress-replication protocol bgp</code>), jo aap agle module mein use karoge. <b>Is module ka lab static ingress replication use karta hai</b>: do leaves, har ek ka ek peer.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Multicast versus ingress replication">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Multicast underlay</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Ingress replication</text>
<rect x="110" y="35" width="100" height="32" rx="6" fill="#bae6fd"/><text x="160" y="56" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="110" y="105" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<line x1="160" y1="67" x2="160" y2="105" stroke="#64748b" stroke-width="3"/><text x="215" y="90" class="svg-accent" font-size="12">1 copy</text>
<rect x="20" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="60" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="120" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="160" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<rect x="220" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="260" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF4</text>
<line x1="160" y1="137" x2="60" y2="185" stroke="#64748b" stroke-width="2"/><line x1="160" y1="137" x2="160" y2="185" stroke="#64748b" stroke-width="2"/><line x1="160" y1="137" x2="260" y2="185" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="35" width="100" height="32" rx="6" fill="#bae6fd"/><text x="480" y="56" text-anchor="middle" class="svg-ink" font-size="12">LEAF1</text>
<rect x="430" y="105" width="100" height="32" rx="6" fill="#ddd6fe"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="12">SPINE</text>
<line x1="470" y1="67" x2="470" y2="105" stroke="#64748b" stroke-width="2"/><line x1="480" y1="67" x2="480" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="67" x2="490" y2="105" stroke="#64748b" stroke-width="2"/><text x="535" y="90" class="svg-accent" font-size="12">3 copies</text>
<rect x="340" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="380" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF2</text>
<rect x="440" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="480" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF3</text>
<rect x="540" y="185" width="80" height="32" rx="6" fill="#bae6fd"/><text x="580" y="206" text-anchor="middle" class="svg-ink" font-size="12">LEAF4</text>
<line x1="480" y1="137" x2="380" y2="185" stroke="#64748b" stroke-width="2"/><line x1="480" y1="137" x2="480" y2="185" stroke="#64748b" stroke-width="2"/><line x1="480" y1="137" x2="580" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="160" y="240" text-anchor="middle" class="svg-muted" font-size="12">network replicate karta hai</text><text x="480" y="240" text-anchor="middle" class="svg-muted" font-size="12">source VTEP replicate karta hai</text>
</svg><p class="cap">Multicast ek copy upar bhejta hai aur spine ko branch karne deta hai. Ingress replication uplink par har peer ki ek unicast copy bhejta hai.</p></div>

<h3>Trade-offs</h3>
<table class="cmp"><tr><th></th><th>Multicast underlay</th><th>Static ingress replication</th></tr>
<tr><td>Underlay requirement</td><td>PIM, RP design, multicast troubleshooting skills</td><td>Sirf unicast routing</td></tr>
<tr><td>Source uplink par copies</td><td>Har BUM frame ki 1</td><td>Har BUM frame ki N−1 (N = VNI ke VTEPs)</td></tr>
<tr><td>Configuration effort</td><td>Har VNI ka ek group (ya shared), har leaf par same</td><td>Har leaf har doosre leaf ko list karta hai; N×(N−1) ki tarah badhta hai</td></tr>
<tr><td>Naya leaf jodna</td><td>Naya leaf group join karta hai; baaki unchanged</td><td>Naya peer jodne ke liye har existing leaf chhoona padta hai</td></tr>
<tr><td>Kiske liye best</td><td>Bade flood-and-learn fabrics</td><td>Labs, chhote fabrics, ya EVPN ke saath (automatic list)</td></tr>
</table>

<div class="eg"><p><b>Worked example: ingress replication ki sizing.</b> Ek fabric mein 32 leaves hain, sab VNI 10010 host karte hain. Ek bigda hua host 500 bytes ke 20,000 broadcast frames per second bhejta hai, yaani 80 Mbit/s. Multicast mein LEAF1 fabric mein 80 Mbit/s bhejta hai. Ingress replication mein woh 31 copies bhejta hai: apne uplinks par 31 × 80 = <b>2.48 Gbit/s</b>, aur har remote leaf 80 Mbit/s receive karta hai. Static configuration effort: ek VNI ke liye 32 leaves × 31 peers = <b>992 peer-ip lines</b>. Isiliye static lists sirf chhote fabrics ke liye hain.</p></div>

<h3>Outputs kaise dikhte hain</h3>
<pre class="out">LEAF1# show nve vni
Codes: CP - Control Plane        DP - Data Plane
       UC - Unconfigured         SA - Suppress ARP
       SU - Suppress Unknown Unicast
Interface VNI      Multicast-group   State Mode Type [BD/VRF]      Flags
--------- -------- ----------------- ----- ---- ------------------ -----
<span class="hl">nve1      10010    UnicastStatic     Up    DP   L2 [10]</span>

LEAF1# show nve vni ingress-replication
Interface VNI      Replication List  Source  Up Time
--------- -------- ----------------- ------- -------
<span class="hl">nve1      10010    10.254.0.2        CLI     00:12:41</span></pre>
<p>Multicast-group column mein "UnicastStatic" ka matlab static ingress replication hai; multicast mode mein aapko group address dikhega (jaise 239.1.1.10). Replication list ka source "CLI" confirm karta hai ki use statically type kiya gaya; EVPN ke saath yeh "BGP-IMET" dikhata hai.</p>

<div class="warn"><p><b>Common galti.</b> Same VNI ke liye ek leaf par multicast aur doosre par ingress replication configure karna. Har leaf sirf apne mode mein flood karta hai, isliye ek ke floods doosre tak kabhi nahi pahunchte, aur ARP ek ya dono directions mein fail hota hai. Ek VNI ke saare VTEPs ko same BUM method (aur multicast ke liye same group) use karna chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kis BUM method ko underlay mein multicast nahi chahiye?" Ingress (head-end) replication. "Kaunsa source VTEP se single copy bhejta hai?" Multicast. Aur static ingress replication lists nve1 ke andar <b>member vni</b> ke neeche configure hoti hain, globally nahi.</p></div>

<div class="scn"><h4>Naya leaf jo sun sakta tha par bol nahi</h4><p>Static ingress replication wali ek company ne chaar-leaf fabric mein LEAF5 joda. Engineer ne LEAF5 par chaaron peers configure kiye, aur baatcheet shuru hone ke baad LEAF5 ke servers sabse baat kar paaye. Lekin LEAF1–LEAF4 ke servers ki nayi ARP requests LEAF5 ke hosts tak kabhi nahi pahunchi, isliye LEAF5 ki taraf shuru hone wale connections fail hue. Purane leaves ki peer lists mein 10.254.0.5 nahi tha, isliye woh use BUM replicate hi nahi karte the. Chaar existing leaves par <code>peer-ip 10.254.0.5</code> jodne se theek ho gaya. Chhe mahine baad team EVPN par migrate hui taaki peer lists khud ban jaayein.</p><p><b>Seekh:</b> static replication tabhi symmetric hai jab aap use symmetric banao. Har leaf ko har doosre leaf ko list karna chahiye.</p></div>

<div class="iv"><p class="q">"BUM traffic ke liye multicast underlay aur ingress replication compare karo."</p><p>Strong answer: multicast har VNI ko ek group par map karta hai; source VTEP ek copy bhejta hai aur PIM tree ke saath replicate karta hai, isliye bandwidth-efficient hai lekin PIM aur RP design chahiye. Ingress replication source se har peer VTEP ko ek unicast copy bhejta hai, isliye sirf unicast routing chahiye lekin uplink par N−1 copies ki keemat hai. Static peer lists N×(N−1) ki tarah badhti hain aur ek leaf jodne par har leaf par edit karni padti hain, isliye production mein BGP EVPN ke saath ingress replication, ya multicast use hota hai. Cost samajhne ka saboot dene ke liye ek sizing number do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BUM = broadcast, unknown unicast, multicast; ise VNI wale har VTEP tak pahunchna chahiye.</li>
<li>Multicast underlay: har VNI ka mcast-group, source se ek copy, PIM chahiye.</li>
<li>Ingress replication: har peer ki ek unicast copy, sirf unicast underlay; static lists ya EVPN.</li>
<li>Static lists N×(N−1) ki tarah scale hoti hain aur saare leaves par symmetric honi chahiye.</li>
<li>Module lab har leaf par ek peer-ip ke saath ingress-replication protocol static use karta hai.</li>
</ul></div>
`}};export{e as default};