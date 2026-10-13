var e={id:`mpbgp`,h:{en:`MP-BGP L2VPN EVPN: building the control plane`,hi:`MP-BGP L2VPN EVPN: control plane banana`},body:{en:`
<p>A courier company can send letters, parcels and legal documents through the same van. The van is the same; only the envelope type changes, and each envelope type has its own rules. MP-BGP works the same way. One BGP session between LEAF1 and SPINE1 is the van; the <b>L2VPN EVPN address family</b> is a special envelope type that carries MAC addresses, VNIs and tenant prefixes instead of plain IPv4 routes. In this chapter you will switch on that envelope type, understand what goes inside it, and build exactly what lab 1 asks for.</p>

<h3>AFI, SAFI and NLRI in plain words</h3>
<p>Every MP-BGP route is labelled with two numbers. The <b>AFI</b> (address family identifier) says what kind of address it is; the <b>SAFI</b> (subsequent AFI) says what it is used for. EVPN is <b>AFI 25 (L2VPN), SAFI 70 (EVPN)</b>. Routers announce during the OPEN exchange which AFI/SAFI pairs they support; this is the "capability" you see in <code>show bgp l2vpn evpn summary</code> as <b>capable peers</b>.</p>
<p>The route itself is called <b>NLRI</b> (network layer reachability information): the thing being advertised. For IPv4 the NLRI is simply a prefix like 172.16.10.0/24. For EVPN the NLRI is a structured record: a <b>route type</b> (1 to 5), a <b>route distinguisher</b>, and fields such as Ethernet tag, MAC address, IP address or originating router IP. Attributes travel alongside the NLRI: next hop, origin, local preference, and the very important <b>extended communities</b> (route targets, encapsulation type, Router MAC).</p>

<h3>The NX-OS feature gates</h3>
<ul>
<li><code>feature bgp</code> enables the BGP process.</li>
<li><code>feature nv overlay</code> enables VXLAN (the NVE interface). The spines in the lab also have it, which keeps the configuration uniform.</li>
<li><code>nv overlay evpn</code> enables the EVPN control plane. Without it, NX-OS rejects <code>address-family l2vpn evpn</code> and the global <code>evpn</code> section does not exist. It is required on the leaves and on the route reflector spines.</li>
</ul>

<h3>Why send-community extended matters</h3>
<p>BGP communities are tags attached to routes. NX-OS does <b>not</b> send any community to a neighbor unless told to. <code>send-community</code> sends standard communities; <code>send-community extended</code> sends extended communities. EVPN depends completely on extended communities:</p>
<ul>
<li><b>Route target (RT)</b>, which decides which VNI or VRF imports the route.</li>
<li><b>Encapsulation</b> (ENCAP:8 means VXLAN).</li>
<li><b>Router MAC</b>, used by symmetric IRB.</li>
<li><b>MAC mobility</b> sequence numbers, used when hosts move.</li>
</ul>
<p>If extended communities are not sent, the session is Established and routes do arrive, but they carry no route target. The receiving leaf imports nothing, and nothing works. This is the most common EVPN misconfiguration in labs and in production. Configure it on both directions: leaves toward spines and spines toward leaves (the spines must pass the RTs on when reflecting).</p>

<h3>How a MAC address becomes a BGP route</h3>
<p>When SRV1 sends its first frame into Ethernet1/5 on LEAF1, several NX-OS components cooperate. The MAC is learned in hardware and in the MAC table; the <b>L2RIB</b> (Layer-2 routing information base, NX-OS's central database of MAC and MAC/IP entries) records it as local; <b>BGP</b> reads the local L2RIB entry, builds a type-2 NLRI, attaches the RD and RT of VNI 10010 and the next hop 10.254.0.1, and sends it to both spines. The spines reflect it to LEAF2, whose BGP imports it (because the RT matches) and hands it to LEAF2's L2RIB, which programs the MAC as remote behind VTEP 10.254.0.1.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="MAC learning pipeline through BGP">
<rect x="10" y="30" width="90" height="36" rx="6" fill="#fde68a"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="12">SRV1 frame</text>
<rect x="120" y="30" width="100" height="36" rx="6" fill="#bae6fd"/><text x="170" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 L2RIB</text>
<rect x="240" y="30" width="100" height="36" rx="6" fill="#bae6fd"/><text x="290" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 BGP</text>
<rect x="360" y="30" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="53" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="480" y="30" width="150" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 BGP, L2RIB</text>
<line x1="100" y1="48" x2="120" y2="48" stroke="#64748b" stroke-width="2"/><line x1="220" y1="48" x2="240" y2="48" stroke="#64748b" stroke-width="2"/><line x1="340" y1="48" x2="360" y2="48" stroke="#64748b" stroke-width="2"/><line x1="460" y1="48" x2="480" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="170" y="95" text-anchor="middle" class="svg-muted" font-size="12">local MAC</text>
<text x="290" y="95" text-anchor="middle" class="svg-muted" font-size="12">type-2 + RT</text>
<text x="410" y="95" text-anchor="middle" class="svg-muted" font-size="12">reflect</text>
<text x="555" y="95" text-anchor="middle" class="svg-muted" font-size="12">import, remote MAC</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Next hop stays 10.254.0.1 (LEAF1 loopback1)</text>
</svg><p class="cap">The MAC travels from the wire into L2RIB, into BGP, through the reflector, and into the remote leaf's L2RIB and hardware.</p></div>

<h3>Configuration: spines (route reflectors)</h3>
<pre class="code"><span class="c">! SPINE1 (SPINE2 identical with router-id 10.255.0.12)</span>
feature bgp
feature nv overlay
nv overlay evpn
router bgp 65001
  router-id 10.255.0.11
  neighbor 10.255.0.1
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
      route-reflector-client
  neighbor 10.255.0.2
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
      route-reflector-client</pre>

<h3>Configuration: leaves (lab 1)</h3>
<pre class="code"><span class="c">! LEAF1 (LEAF2 identical with router-id 10.255.0.2)</span>
feature bgp
feature nv overlay
nv overlay evpn
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
<span class="c">! save when both sessions are Established</span>
copy running-config startup-config</pre>
<p>In large fabrics you would use a <code>template peer</code> on the spines to avoid repeating the block for every leaf; the result is identical.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP summary information for VRF default, address family L2VPN EVPN
BGP router identifier 10.255.0.1, local AS number 65001
<span class="hl">BGP table version is 8, L2VPN EVPN config peers 2, capable peers 2</span>
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.11     4 65001      14      12        8    0    0 00:05:10 0
10.255.0.12     4 65001      14      12        8    0    0 00:05:07 0</pre>
<p>"config peers 2, capable peers 2" means two neighbors are configured and both negotiated the EVPN capability. PfxRcd 0 is normal at this stage: no VNI exists yet, so there is nothing to advertise. Lab 1's final task asks exactly for that capable-peers number.</p>
<pre class="out">SPINE2# show running-config bgp | include route-reflector
<span class="hl">      route-reflector-client
      route-reflector-client</span></pre>

<div class="eg"><p><b>Worked example.</b> After VNI 10010 is added on both leaves (chapter 6), each leaf originates one type-3 route. LEAF1 receives LEAF2's type-3 route twice (once reflected by each spine), so PfxRcd becomes 1 from each spine. When SRV2 is learned, LEAF2 adds a MAC-only and a MAC/IP type-2 route, and PfxRcd rises to 3 per spine.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>nv overlay evpn</code> (the l2vpn evpn family is rejected); configuring <code>send-community</code> but not <code>send-community extended</code>; making the leaves route-reflector clients on only one spine, so routes from one leaf reach the other via one spine only (no redundancy), or on neither spine (nothing is reflected at all).</p></div>
<div class="exam"><p><b>Exam trap.</b> EVPN is AFI 25 / SAFI 70. Route targets are <b>extended</b> communities, so the required knob is <code>send-community extended</code>, not <code>send-community</code> alone.</p></div>

<div class="scn"><h4>The half-built spine</h4><p>During a spine replacement, SPINE2 was configured from an old template. Both leaves showed Established sessions to SPINE2 and routes were received from SPINE1, but when SPINE1 was taken down for its own upgrade, LEAF1 lost every route from LEAF2. The engineer ran <code>show running-config bgp</code> on SPINE2 and found no <code>route-reflector-client</code> under the leaf neighbors. SPINE2 was learning every leaf's routes but obeying iBGP split horizon, so it never passed them on. Adding the command under <code>address-family l2vpn evpn</code> for each leaf fixed it, which is exactly the third task of lab 1.</p><p><b>Lesson:</b> test redundancy by checking what each spine reflects, not only that sessions are Established.</p></div>

<div class="iv"><p class="q">"Your EVPN sessions are Established but a leaf has no remote MACs. What do you check first?"</p><p>Strong answer: first check the received prefix count, then look at a route on the spine or leaf with <code>show bgp l2vpn evpn route-type 3</code> or <code>route-type 2</code> and see whether an Extcommunity line with RT and ENCAP:8 exists. If not, <code>send-community extended</code> is missing somewhere on the path. If RTs are present, compare them to the local import RT of the VNI. Also confirm the spines are route-reflector clients for each leaf.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN is an MP-BGP address family: L2VPN EVPN, AFI 25 / SAFI 70.</li>
<li>NX-OS needs feature bgp, feature nv overlay and nv overlay evpn.</li>
<li>send-community extended is mandatory; without it routes arrive with no route target.</li>
<li>MACs flow wire → L2RIB → BGP → RR → remote BGP → remote L2RIB and hardware.</li>
<li>"config peers 2, capable peers 2" confirms both spines negotiated EVPN.</li>
</ul></div>
`,hi:`
<p>Ek courier company chitthiyan, parcels aur legal documents ek hi van se bhej sakti hai. Van wahi hai; sirf envelope ka type badalta hai, aur har envelope type ke apne rules hote hain. MP-BGP bhi aise hi kaam karta hai. LEAF1 aur SPINE1 ke beech ek BGP session van hai; <b>L2VPN EVPN address family</b> ek special envelope type hai jo plain IPv4 routes ki jagah MAC addresses, VNIs aur tenant prefixes le jaata hai. Is chapter mein aap woh envelope type on karoge, samjhoge ki uske andar kya jaata hai, aur bilkul wahi banaoge jo lab 1 maangta hai.</p>

<h3>AFI, SAFI aur NLRI aasaan shabdon mein</h3>
<p>Har MP-BGP route par do numbers ka label hota hai. <b>AFI</b> (address family identifier) batata hai ki address kis tarah ka hai; <b>SAFI</b> (subsequent AFI) batata hai ki woh kis kaam ke liye hai. EVPN <b>AFI 25 (L2VPN), SAFI 70 (EVPN)</b> hai. Routers OPEN exchange ke dauraan batate hain ki woh kaunse AFI/SAFI pairs support karte hain; yahi "capability" aap <code>show bgp l2vpn evpn summary</code> mein <b>capable peers</b> ki tarah dekhte ho.</p>
<p>Route ko khud <b>NLRI</b> (network layer reachability information) kehte hain: jo cheez advertise ho rahi hai. IPv4 ke liye NLRI bas ek prefix hai jaise 172.16.10.0/24. EVPN ke liye NLRI ek structured record hai: ek <b>route type</b> (1 se 5), ek <b>route distinguisher</b>, aur Ethernet tag, MAC address, IP address ya originating router IP jaise fields. NLRI ke saath attributes chalte hain: next hop, origin, local preference, aur bahut important <b>extended communities</b> (route targets, encapsulation type, Router MAC).</p>

<h3>NX-OS feature gates</h3>
<ul>
<li><code>feature bgp</code> BGP process enable karta hai.</li>
<li><code>feature nv overlay</code> VXLAN (NVE interface) enable karta hai. Lab ke spines par bhi yeh hai, jisse configuration uniform rehta hai.</li>
<li><code>nv overlay evpn</code> EVPN control plane enable karta hai. Iske bina NX-OS <code>address-family l2vpn evpn</code> reject karta hai aur global <code>evpn</code> section exist nahi karta. Yeh leaves aur route reflector spines dono par zaroori hai.</li>
</ul>

<h3>send-community extended kyun zaroori hai</h3>
<p>BGP communities routes par lage tags hain. NX-OS neighbor ko koi community <b>nahi</b> bhejta jab tak use bataya na jaaye. <code>send-community</code> standard communities bhejta hai; <code>send-community extended</code> extended communities bhejta hai. EVPN poori tarah extended communities par tika hai:</p>
<ul>
<li><b>Route target (RT)</b>, jo tay karta hai kaunsa VNI ya VRF route import karega.</li>
<li><b>Encapsulation</b> (ENCAP:8 matlab VXLAN).</li>
<li><b>Router MAC</b>, jo symmetric IRB use karta hai.</li>
<li><b>MAC mobility</b> sequence numbers, jo hosts move hone par use hote hain.</li>
</ul>
<p>Agar extended communities nahi bheji gayi, to session Established rehta hai aur routes aate bhi hain, lekin unpar koi route target nahi hota. Receive karne wala leaf kuch import nahi karta, aur kuch kaam nahi karta. Yeh labs aur production dono mein sabse common EVPN misconfiguration hai. Ise dono directions mein configure karo: leaves se spines ki taraf aur spines se leaves ki taraf (reflect karte waqt spines ko RTs aage dene chahiye).</p>

<h3>MAC address BGP route kaise banta hai</h3>
<p>Jab SRV1 LEAF1 ke Ethernet1/5 mein apna pehla frame bhejta hai, to kai NX-OS components milkar kaam karte hain. MAC hardware aur MAC table mein seekha jaata hai; <b>L2RIB</b> (Layer-2 routing information base, MAC aur MAC/IP entries ka NX-OS ka central database) use local record karta hai; <b>BGP</b> local L2RIB entry padhta hai, type-2 NLRI banata hai, VNI 10010 ka RD aur RT aur next hop 10.254.0.1 jodta hai, aur use dono spines ko bhejta hai. Spines use LEAF2 ko reflect karte hain, jiska BGP use import karta hai (kyunki RT match karta hai) aur LEAF2 ke L2RIB ko deta hai, jo MAC ko VTEP 10.254.0.1 ke peeche remote ki tarah program karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="BGP ke through MAC learning pipeline">
<rect x="10" y="30" width="90" height="36" rx="6" fill="#fde68a"/><text x="55" y="53" text-anchor="middle" class="svg-ink" font-size="12">SRV1 frame</text>
<rect x="120" y="30" width="100" height="36" rx="6" fill="#bae6fd"/><text x="170" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 L2RIB</text>
<rect x="240" y="30" width="100" height="36" rx="6" fill="#bae6fd"/><text x="290" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 BGP</text>
<rect x="360" y="30" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="53" text-anchor="middle" class="svg-ink" font-size="12">Spine RR</text>
<rect x="480" y="30" width="150" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="53" text-anchor="middle" class="svg-ink" font-size="12">LEAF2 BGP, L2RIB</text>
<line x1="100" y1="48" x2="120" y2="48" stroke="#64748b" stroke-width="2"/><line x1="220" y1="48" x2="240" y2="48" stroke="#64748b" stroke-width="2"/><line x1="340" y1="48" x2="360" y2="48" stroke="#64748b" stroke-width="2"/><line x1="460" y1="48" x2="480" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="170" y="95" text-anchor="middle" class="svg-muted" font-size="12">local MAC</text>
<text x="290" y="95" text-anchor="middle" class="svg-muted" font-size="12">type-2 + RT</text>
<text x="410" y="95" text-anchor="middle" class="svg-muted" font-size="12">reflect</text>
<text x="555" y="95" text-anchor="middle" class="svg-muted" font-size="12">import, remote MAC</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Next hop 10.254.0.1 hi rehta hai (LEAF1 loopback1)</text>
</svg><p class="cap">MAC wire se L2RIB mein, BGP mein, reflector se hote hue remote leaf ke L2RIB aur hardware tak jaata hai.</p></div>

<h3>Configuration: spines (route reflectors)</h3>
<pre class="code"><span class="c">! SPINE1 (SPINE2 same, router-id 10.255.0.12 ke saath)</span>
feature bgp
feature nv overlay
nv overlay evpn
router bgp 65001
  router-id 10.255.0.11
  neighbor 10.255.0.1
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
      route-reflector-client
  neighbor 10.255.0.2
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
      route-reflector-client</pre>

<h3>Configuration: leaves (lab 1)</h3>
<pre class="code"><span class="c">! LEAF1 (LEAF2 same, router-id 10.255.0.2 ke saath)</span>
feature bgp
feature nv overlay
nv overlay evpn
router bgp 65001
  router-id 10.255.0.1
  neighbor 10.255.0.11
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
  neighbor 10.255.0.12
    remote-as 65001
    update-source loopback0
    address-family l2vpn evpn
      send-community
      send-community extended
<span class="c">! dono sessions Established hone par save karo</span>
copy running-config startup-config</pre>
<p>Bade fabrics mein aap spines par <code>template peer</code> use karoge taaki har leaf ke liye block repeat na ho; result same rehta hai.</p>

<h3>Verification</h3>
<pre class="out">LEAF1# show bgp l2vpn evpn summary
BGP summary information for VRF default, address family L2VPN EVPN
BGP router identifier 10.255.0.1, local AS number 65001
<span class="hl">BGP table version is 8, L2VPN EVPN config peers 2, capable peers 2</span>
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.11     4 65001      14      12        8    0    0 00:05:10 0
10.255.0.12     4 65001      14      12        8    0    0 00:05:07 0</pre>
<p>"config peers 2, capable peers 2" matlab do neighbors configured hain aur dono ne EVPN capability negotiate ki. Is stage par PfxRcd 0 normal hai: abhi koi VNI nahi hai, to advertise karne ko kuch nahi. Lab 1 ka aakhri task bilkul yahi capable-peers number poochta hai.</p>
<pre class="out">SPINE2# show running-config bgp | include route-reflector
<span class="hl">      route-reflector-client
      route-reflector-client</span></pre>

<div class="eg"><p><b>Worked example.</b> Jab dono leaves par VNI 10010 jud jaata hai (chapter 6), to har leaf ek type-3 route originate karta hai. LEAF1 ko LEAF2 ka type-3 route do baar milta hai (har spine se reflect hua ek), isliye har spine se PfxRcd 1 ho jaata hai. Jab SRV2 seekha jaata hai, LEAF2 ek MAC-only aur ek MAC/IP type-2 route jodta hai, aur har spine se PfxRcd 3 ho jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>nv overlay evpn</code> bhoolna (l2vpn evpn family reject hoti hai); <code>send-community</code> configure karna par <code>send-community extended</code> nahi; leaves ko sirf ek spine par route-reflector clients banana, jisse ek leaf ke routes doosre tak sirf ek spine se pahunchte hain (redundancy nahi), ya kisi spine par nahi (kuch reflect hi nahi hota).</p></div>
<div class="exam"><p><b>Exam trap.</b> EVPN AFI 25 / SAFI 70 hai. Route targets <b>extended</b> communities hain, isliye zaroori knob <code>send-community extended</code> hai, sirf <code>send-community</code> nahi.</p></div>

<div class="scn"><h4>Aadha bana hua spine</h4><p>Spine replacement ke dauraan SPINE2 ek purane template se configure hua. Dono leaves SPINE2 ke saath Established sessions dikha rahe the aur routes SPINE1 se aa rahe the, lekin jab SPINE1 ko uske apne upgrade ke liye neeche liya gaya, LEAF1 ne LEAF2 ka har route kho diya. Engineer ne SPINE2 par <code>show running-config bgp</code> chalaya aur leaf neighbors ke neeche koi <code>route-reflector-client</code> nahi mila. SPINE2 har leaf ke routes seekh raha tha lekin iBGP split horizon maan raha tha, isliye unhe kabhi aage nahi deta tha. Har leaf ke liye <code>address-family l2vpn evpn</code> ke neeche command jodne se theek ho gaya, jo bilkul lab 1 ka teesra task hai.</p><p><b>Seekh:</b> redundancy test karo yeh check karke ki har spine kya reflect karta hai, sirf yeh nahi ki sessions Established hain.</p></div>

<div class="iv"><p class="q">"Aapke EVPN sessions Established hain par ek leaf par koi remote MAC nahi hai. Pehle kya check karoge?"</p><p>Strong answer: pehle received prefix count check karo, phir spine ya leaf par <code>show bgp l2vpn evpn route-type 3</code> ya <code>route-type 2</code> se ek route dekho ki RT aur ENCAP:8 wali Extcommunity line hai ya nahi. Nahi hai to path mein kahin <code>send-community extended</code> missing hai. RTs hain to unhe VNI ke local import RT se milao. Yeh bhi confirm karo ki spines par har leaf route-reflector client hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>EVPN ek MP-BGP address family hai: L2VPN EVPN, AFI 25 / SAFI 70.</li>
<li>NX-OS ko feature bgp, feature nv overlay aur nv overlay evpn chahiye.</li>
<li>send-community extended zaroori hai; iske bina routes bina route target ke aate hain.</li>
<li>MACs wire → L2RIB → BGP → RR → remote BGP → remote L2RIB aur hardware tak jaate hain.</li>
<li>"config peers 2, capable peers 2" confirm karta hai ki dono spines ne EVPN negotiate kiya.</li>
</ul></div>
`}};export{e as default};