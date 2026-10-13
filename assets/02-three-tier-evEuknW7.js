var e={id:`three-tier`,h:{en:`The three-tier design and why it breaks`,hi:`Three-tier design aur yeh kyun toot-ta hai`},body:{en:`
<p>Imagine an old city where every trip between two neighbourhoods must pass through the central bus station, and half the roads are closed with barriers "just in case" the open road fails. It works when most people travel from home to the city centre. It fails badly when everybody starts travelling between neighbourhoods. The classic three-tier data center network is that city. In this chapter you will see how it was built, why it made sense, and exactly where it breaks for modern east-west traffic.</p>

<h3>The three layers</h3>
<p>The three-tier model came from campus network design in the late 1990s and 2000s and was copied into data centers:</p>
<ul>
<li><b>Access layer.</b> Top-of-rack (ToR) or end-of-row switches where servers plug in. Pure Layer 2: VLANs and trunks.</li>
<li><b>Aggregation (distribution) layer.</b> A pair of large switches per group of racks. This is where the <b>Layer-2/Layer-3 boundary</b> lives: the default gateways for server VLANs (SVIs with HSRP or VRRP), plus service modules such as firewalls and load balancers.</li>
<li><b>Core layer.</b> A pair of fast Layer-3 switches that connect aggregation blocks to each other and to the WAN and internet edge.</li>
</ul>
<p>A pair of aggregation switches plus the access switches below them is often called a <b>pod</b> or <b>aggregation block</b>. Server VLANs are usually trunked to every access switch in the pod, so the pod is one big Layer-2 domain.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three-tier data center">
<rect x="200" y="10" width="110" height="34" rx="6" fill="#fed7aa"/><text x="255" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core 1</text>
<rect x="330" y="10" width="110" height="34" rx="6" fill="#fed7aa"/><text x="385" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core 2</text>
<rect x="60" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="115" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 1</text>
<rect x="190" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="245" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 2</text>
<rect x="340" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="395" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 3</text>
<rect x="470" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 4</text>
<line x1="255" y1="44" x2="115" y2="100" stroke="#64748b" stroke-width="2"/><line x1="255" y1="44" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="385" y1="44" x2="395" y2="100" stroke="#64748b" stroke-width="2"/><line x1="385" y1="44" x2="525" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="44" x2="395" y2="100" stroke="#64748b" stroke-width="1"/><line x1="385" y1="44" x2="245" y2="100" stroke="#64748b" stroke-width="1"/>
<rect x="40" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="85" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access A</text>
<rect x="200" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="245" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access B</text>
<rect x="360" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="405" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access C</text>
<rect x="510" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="555" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access D</text>
<line x1="115" y1="134" x2="85" y2="195" stroke="#64748b" stroke-width="2"/><line x1="245" y1="134" x2="95" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="115" y1="134" x2="235" y2="195" stroke="#64748b" stroke-width="2"/><line x1="245" y1="134" x2="255" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="395" y1="134" x2="400" y2="195" stroke="#64748b" stroke-width="2"/><line x1="525" y1="134" x2="415" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="395" y1="134" x2="545" y2="195" stroke="#64748b" stroke-width="2"/><line x1="525" y1="134" x2="560" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="170" y="245" text-anchor="middle" class="svg-muted" font-size="12">Pod 1 (L2 domain)</text><text x="480" y="245" text-anchor="middle" class="svg-muted" font-size="12">Pod 2 (L2 domain)</text>
</svg><p class="cap">Dashed uplinks are blocked by spanning tree. Each pod is one Layer-2 domain; pods meet at the routed core.</p></div>

<h3>Spanning tree blocks half your uplinks</h3>
<p>Each access switch has two uplinks, one to each aggregation switch, so a single failure does not isolate the rack. But two uplinks into the same VLAN create a Layer-2 loop. Ethernet frames have no TTL, so a loop would circulate broadcasts forever. <b>Spanning Tree Protocol</b> (on Nexus usually Rapid PVST+ or MST) prevents that by electing a root bridge and putting redundant ports into the <b>blocking</b> (alternate) state.</p>
<pre class="out">ACCESS-A# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0023.04ee.be01
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>
<p>You paid for two 40G uplinks, but only one carries traffic. The second is an expensive spare. Recovery is fast with RSTP (typically sub-second to a couple of seconds on point-to-point links), but the bandwidth waste is permanent.</p>

<h3>One active gateway per VLAN</h3>
<p>The default gateway sits on the aggregation pair with <b>HSRP</b> or <b>VRRP</b>. Only one switch is the active gateway for a VLAN at a time. If spanning tree forwards the access uplink to Agg 2 while HSRP is active on Agg 1, every routed packet crosses the link between the two aggregation switches. Engineers had to align the STP root and the HSRP active router per VLAN by hand.</p>

<h3>Large Layer-2 domains are large failure domains</h3>
<p>A <b>failure domain</b> is the part of the network affected when one thing goes wrong. In a Layer-2 domain, broadcast, unknown-unicast and multicast (<b>BUM</b>) traffic floods to every port in the VLAN. A single loop, a bad NIC or a misconfigured port can create a broadcast storm that reaches every rack in the pod, fills links and pins switch CPUs. The bigger the VLAN, the bigger the blast radius. MAC and ARP tables at the aggregation layer also grow with every VM in the domain, and 802.1Q gives only 4,094 usable VLAN IDs.</p>

<h3>Why it breaks for east-west traffic</h3>
<p>The path between two servers depends on where they sit:</p>
<table class="cmp"><tr><th>Server locations</th><th>Path</th><th>Switches crossed</th></tr>
<tr><td>Same access switch</td><td>access</td><td>1</td></tr>
<tr><td>Same pod, different racks</td><td>access, agg, access</td><td>3</td></tr>
<tr><td>Different pods</td><td>access, agg, core, agg, access</td><td>5</td></tr></table>
<p>Latency and available bandwidth now depend on where the scheduler happened to place a VM. Worse, oversubscription multiplies at every layer.</p>
<div class="eg"><p><b>Worked example: stacked oversubscription.</b> An access switch has 48 × 10G server ports and 4 × 40G uplinks, but STP blocks half, so 2 × 40G = 80G forwards. Access ratio = 480 ÷ 80 = 6:1. The aggregation switch receives 20 access switches (20 × 80G = 1,600G) and has 4 × 100G active towards the core: 1,600 ÷ 400 = 4:1. Traffic between pods sees roughly 6 × 4 = <b>24:1</b>. Two racks in different pods fight over a tiny slice of bandwidth.</p></div>

<h3>VM mobility makes it worse</h3>
<p>Live migration (for example vMotion) keeps a VM's IP and MAC address while moving it to another host, so the source and destination hosts must share the same VLAN. To allow migration between pods, teams stretched VLANs across the core. That joins the pods into one giant Layer-2 domain, exactly the failure domain the routed core was meant to prevent.</p>
<p>Growth is also <b>scale-up</b>: when the aggregation pair runs out of ports or bandwidth, you replace it with bigger chassis. You cannot simply add a third aggregation switch, because STP and HSRP think in pairs.</p>

<h3>The patch: vPC and MLAG</h3>
<p><b>Virtual Port Channel (vPC)</b> on Nexus lets two switches present themselves as one logical switch to the device below. The access switch bundles its two uplinks into one port-channel (LACP), spanning tree sees a single logical link, and <b>both links forward</b>. The two vPC peers sync state over a <b>peer-link</b> and check each other's health over a <b>peer-keepalive</b> link. With vPC, HSRP forwards on both peers in the data plane, so the gateway trombone disappears too. The generic industry name is <b>MLAG</b> (multi-chassis link aggregation).</p>
<pre class="out">AGG-1# show vpc brief
vPC domain id                     : 10
Peer status                       : peer adjacency formed ok
vPC keep-alive status             : peer is alive
<span class="hl">20    Po20          up     success     success               10,20</span></pre>
<p>vPC doubled usable bandwidth and is still widely used today, especially to dual-home servers to a pair of leaves. But it did not fix the architecture: the top of each pod is still exactly two boxes, the Layer-2 domain is still large, and paths between pods are still unequal. The industry needed a design that scales out. That is the spine-leaf fabric in the next chapter.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting the STP root on one aggregation switch and the HSRP active gateway on the other. Stretching VLANs across pods "just for one migration" and never removing them. Believing vPC removes Layer-2 risk: a loop below the vPC pair still floods the whole VLAN.</p></div>
<div class="exam"><p><b>Exam tip.</b> Know the three layers and where the L2/L3 boundary sits (aggregation). STP blocks redundant links; vPC lets both forward by making two switches look like one to the downstream device. vPC has two control planes (unlike Catalyst VSS, which merges into one).</p></div>

<div class="scn"><h4>The inter-aggregation link that kept saturating</h4><p>A hospital data center saw the 40G link between AGG-1 and AGG-2 hit 100% every morning, while server uplinks were half empty. Monitoring showed the traffic was ordinary routed traffic from VLAN 30. The engineer ran <code>show spanning-tree vlan 30</code> and <code>show hsrp brief</code>: the STP root for VLAN 30 was AGG-2, so every access switch forwarded towards AGG-2, but the HSRP active gateway was AGG-1. Every packet leaving VLAN 30 went access, AGG-2, across the inter-agg link to AGG-1, then back. The fix was to set the STP root priority and HSRP priority on the same switch for every VLAN, and later to convert the pair to vPC so both could forward.</p><p><b>Lesson:</b> in three-tier designs the Layer-2 and Layer-3 control planes must be aligned by hand; spine-leaf removes this whole class of problem.</p></div>

<div class="iv"><p class="q">"vPC already lets both uplinks forward. Why not keep three-tier with vPC instead of moving to spine-leaf?"</p><p>Strong answer: vPC fixes STP blocking inside a pod, but the design still scales up rather than out (the top is always a pair), Layer-2 domains stay large failure domains, east-west paths between pods are longer and more oversubscribed, and VM mobility still pushes VLAN stretching across the core. Spine-leaf gives equal paths, scale-out by adding spines and leaves, routed links with small failure domains, and delivers Layer-2 through an overlay. Add that vPC still has a place at the leaf layer for dual-homed servers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three-tier = access (L2), aggregation (L2/L3 boundary, gateways, services), core (routed transport between pods).</li>
<li>STP blocks redundant uplinks, so half the bandwidth sits idle; only one HSRP gateway is active per VLAN.</li>
<li>Large Layer-2 domains are large failure domains, with flooding, big MAC tables and a 4,094 VLAN limit.</li>
<li>East-west paths are unequal (1, 3 or 5 switches) and oversubscription multiplies across layers.</li>
<li>vPC/MLAG lets both links forward and is still used at the leaf edge, but it does not make the design scale out.</li>
</ul></div>
`,hi:`
<p>Ek purana shehar imagine karo jahan do mohallon ke beech har trip ko central bus station se guzarna padta hai, aur aadhi sadkein "just in case" barriers se band hain agar khuli sadak fail ho jaaye. Jab zyada tar log ghar se city centre jaate hain to yeh chal jaata hai. Jab sab log mohallon ke beech travel karne lagte hain to yeh buri tarah fail hota hai. Classic three-tier data center network wahi shehar hai. Is chapter mein aap dekhoge ki yeh kaise bana, kyun sensible tha, aur modern east-west traffic ke liye yeh bilkul kahan toot-ta hai.</p>

<h3>Teen layers</h3>
<p>Three-tier model 1990s ke end aur 2000s mein campus network design se aaya aur data centers mein copy ho gaya:</p>
<ul>
<li><b>Access layer.</b> Top-of-rack (ToR) ya end-of-row switches jahan servers plug hote hain. Pura Layer 2: VLANs aur trunks.</li>
<li><b>Aggregation (distribution) layer.</b> Racks ke har group ke liye bade switches ka ek pair. Yahin <b>Layer-2/Layer-3 boundary</b> rehti hai: server VLANs ke default gateways (HSRP ya VRRP ke saath SVIs), plus firewalls aur load balancers jaise service modules.</li>
<li><b>Core layer.</b> Fast Layer-3 switches ka ek pair jo aggregation blocks ko aapas mein aur WAN aur internet edge se jodta hai.</li>
</ul>
<p>Aggregation switches ka ek pair aur unke neeche ke access switches ko aksar <b>pod</b> ya <b>aggregation block</b> kehte hain. Server VLANs aam taur par pod ke har access switch tak trunk kiye jaate hain, isliye pod ek bada Layer-2 domain hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three-tier data center">
<rect x="200" y="10" width="110" height="34" rx="6" fill="#fed7aa"/><text x="255" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core 1</text>
<rect x="330" y="10" width="110" height="34" rx="6" fill="#fed7aa"/><text x="385" y="32" text-anchor="middle" class="svg-ink" font-size="13">Core 2</text>
<rect x="60" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="115" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 1</text>
<rect x="190" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="245" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 2</text>
<rect x="340" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="395" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 3</text>
<rect x="470" y="100" width="110" height="34" rx="6" fill="#ddd6fe"/><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="13">Agg 4</text>
<line x1="255" y1="44" x2="115" y2="100" stroke="#64748b" stroke-width="2"/><line x1="255" y1="44" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><line x1="385" y1="44" x2="395" y2="100" stroke="#64748b" stroke-width="2"/><line x1="385" y1="44" x2="525" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="255" y1="44" x2="395" y2="100" stroke="#64748b" stroke-width="1"/><line x1="385" y1="44" x2="245" y2="100" stroke="#64748b" stroke-width="1"/>
<rect x="40" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="85" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access A</text>
<rect x="200" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="245" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access B</text>
<rect x="360" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="405" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access C</text>
<rect x="510" y="195" width="90" height="32" rx="6" fill="#bae6fd"/><text x="555" y="216" text-anchor="middle" class="svg-ink" font-size="12">Access D</text>
<line x1="115" y1="134" x2="85" y2="195" stroke="#64748b" stroke-width="2"/><line x1="245" y1="134" x2="95" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="115" y1="134" x2="235" y2="195" stroke="#64748b" stroke-width="2"/><line x1="245" y1="134" x2="255" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="395" y1="134" x2="400" y2="195" stroke="#64748b" stroke-width="2"/><line x1="525" y1="134" x2="415" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<line x1="395" y1="134" x2="545" y2="195" stroke="#64748b" stroke-width="2"/><line x1="525" y1="134" x2="560" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/>
<text x="170" y="245" text-anchor="middle" class="svg-muted" font-size="12">Pod 1 (L2 domain)</text><text x="480" y="245" text-anchor="middle" class="svg-muted" font-size="12">Pod 2 (L2 domain)</text>
</svg><p class="cap">Dashed uplinks spanning tree ne block kiye hain. Har pod ek Layer-2 domain hai; pods routed core par milte hain.</p></div>

<h3>Spanning tree aapke aadhe uplinks block karta hai</h3>
<p>Har access switch ke do uplinks hote hain, har aggregation switch ke liye ek, taaki ek failure se rack isolate na ho. Lekin ek hi VLAN mein do uplinks Layer-2 loop banate hain. Ethernet frames mein TTL nahi hota, isliye loop broadcasts ko hamesha ghumata rahega. <b>Spanning Tree Protocol</b> (Nexus par aam taur par Rapid PVST+ ya MST) ek root bridge elect karke aur redundant ports ko <b>blocking</b> (alternate) state mein daal kar ise rokta hai.</p>
<pre class="out">ACCESS-A# show spanning-tree vlan 10
VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0023.04ee.be01
Interface        Role Sts Cost      Prio.Nbr Type
---------------- ---- --- --------- -------- --------------------------------
Eth1/49          Root FWD 2         128.49   P2p
<span class="hl">Eth1/50          Altn BLK 2         128.50   P2p</span></pre>
<p>Aapne do 40G uplinks ke paise diye, lekin sirf ek traffic le jaata hai. Dusra ek mehenga spare hai. RSTP ke saath recovery fast hai (point-to-point links par aam taur par ek second se kam se lekar do second tak), lekin bandwidth ka waste permanent hai.</p>

<h3>Har VLAN ka ek hi active gateway</h3>
<p>Default gateway aggregation pair par <b>HSRP</b> ya <b>VRRP</b> ke saath hota hai. Ek VLAN ke liye ek samay par sirf ek switch active gateway hota hai. Agar spanning tree access uplink ko Agg 2 ki taraf forward karta hai jabki HSRP Agg 1 par active hai, to har routed packet dono aggregation switches ke beech ke link ko cross karta hai. Engineers ko har VLAN ke liye STP root aur HSRP active router haath se align karne padte the.</p>

<h3>Bade Layer-2 domains bade failure domains hain</h3>
<p><b>Failure domain</b> network ka woh hissa hai jo ek cheez kharab hone par affect hota hai. Layer-2 domain mein broadcast, unknown-unicast aur multicast (<b>BUM</b>) traffic VLAN ke har port par flood hota hai. Ek loop, ek kharab NIC ya ek galat configured port broadcast storm bana sakta hai jo pod ke har rack tak pahunche, links bhar de aur switch CPUs ko 100% par atka de. VLAN jitna bada, blast radius utna bada. Aggregation layer par MAC aur ARP tables bhi domain ke har VM ke saath badhti hain, aur 802.1Q sirf 4,094 usable VLAN IDs deta hai.</p>

<h3>East-west traffic ke liye yeh kyun toot-ta hai</h3>
<p>Do servers ke beech ka path is baat par depend karta hai ki woh kahan baithe hain:</p>
<table class="cmp"><tr><th>Server locations</th><th>Path</th><th>Kitne switches cross hote hain</th></tr>
<tr><td>Same access switch</td><td>access</td><td>1</td></tr>
<tr><td>Same pod, alag racks</td><td>access, agg, access</td><td>3</td></tr>
<tr><td>Alag pods</td><td>access, agg, core, agg, access</td><td>5</td></tr></table>
<p>Ab latency aur available bandwidth is par depend karti hai ki scheduler ne VM ko kahan rakh diya. Isse bhi bura, oversubscription har layer par multiply hota hai.</p>
<div class="eg"><p><b>Worked example: stacked oversubscription.</b> Ek access switch ke 48 × 10G server ports aur 4 × 40G uplinks hain, lekin STP aadhe block karta hai, isliye 2 × 40G = 80G forward karta hai. Access ratio = 480 ÷ 80 = 6:1. Aggregation switch 20 access switches receive karta hai (20 × 80G = 1,600G) aur core ki taraf 4 × 100G active hain: 1,600 ÷ 400 = 4:1. Pods ke beech ka traffic lagbhag 6 × 4 = <b>24:1</b> dekhta hai. Alag pods ke do racks bandwidth ke ek chhote se tukde ke liye ladte hain.</p></div>

<h3>VM mobility ise aur bura banati hai</h3>
<p>Live migration (jaise vMotion) VM ko dusre host par move karte hue uska IP aur MAC address same rakhta hai, isliye source aur destination hosts ek hi VLAN share karne chahiye. Pods ke beech migration allow karne ke liye teams ne VLANs ko core ke paar stretch kar diya. Isse saare pods ek giant Layer-2 domain ban jaate hain, bilkul wahi failure domain jise routed core rokne ke liye tha.</p>
<p>Growth bhi <b>scale-up</b> hai: jab aggregation pair ke ports ya bandwidth khatam hoti hai, aap use bade chassis se replace karte ho. Aap bas teesra aggregation switch nahi jod sakte, kyunki STP aur HSRP pairs mein sochte hain.</p>

<h3>Patch: vPC aur MLAG</h3>
<p>Nexus par <b>Virtual Port Channel (vPC)</b> do switches ko neeche wale device ke saamne ek logical switch ki tarah dikhne deta hai. Access switch apne do uplinks ko ek port-channel (LACP) mein bundle karta hai, spanning tree ko ek hi logical link dikhta hai, aur <b>dono links forward karte hain</b>. Dono vPC peers <b>peer-link</b> par state sync karte hain aur <b>peer-keepalive</b> link par ek dusre ki health check karte hain. vPC ke saath HSRP data plane mein dono peers par forward karta hai, isliye gateway ka trombone bhi khatam ho jaata hai. Industry ka generic naam <b>MLAG</b> (multi-chassis link aggregation) hai.</p>
<pre class="out">AGG-1# show vpc brief
vPC domain id                     : 10
Peer status                       : peer adjacency formed ok
vPC keep-alive status             : peer is alive
<span class="hl">20    Po20          up     success     success               10,20</span></pre>
<p>vPC ne usable bandwidth double kar di aur aaj bhi khoob use hota hai, khaas kar servers ko leaves ke pair par dual-home karne ke liye. Lekin isne architecture theek nahi kiya: har pod ke top par abhi bhi bilkul do boxes hain, Layer-2 domain abhi bhi bada hai, aur pods ke beech paths abhi bhi unequal hain. Industry ko aisa design chahiye tha jo scale out kare. Woh agle chapter ka spine-leaf fabric hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> STP root ek aggregation switch par aur HSRP active gateway dusre par rakhna. VLANs ko "sirf ek migration ke liye" pods ke paar stretch karna aur kabhi na hatana. Yeh maanna ki vPC Layer-2 risk hata deta hai: vPC pair ke neeche ka loop abhi bhi poore VLAN ko flood karta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Teen layers aur L2/L3 boundary kahan hai (aggregation) yeh yaad rakho. STP redundant links block karta hai; vPC do switches ko downstream device ke liye ek jaisa dikha kar dono ko forward karne deta hai. vPC mein do control planes hote hain (Catalyst VSS ke ulat, jo ek mein merge ho jaata hai).</p></div>

<div class="scn"><h4>Inter-aggregation link jo baar baar saturate hota tha</h4><p>Ek hospital data center mein AGG-1 aur AGG-2 ke beech ka 40G link har subah 100% hit karta tha, jabki server uplinks aadhe khaali the. Monitoring ne dikhaya ki traffic VLAN 30 ka normal routed traffic tha. Engineer ne <code>show spanning-tree vlan 30</code> aur <code>show hsrp brief</code> chalaya: VLAN 30 ka STP root AGG-2 tha, isliye har access switch AGG-2 ki taraf forward karta tha, lekin HSRP active gateway AGG-1 tha. VLAN 30 se nikalne wala har packet access, AGG-2, inter-agg link ke paar AGG-1, aur phir wapas jaata tha. Fix tha har VLAN ke liye STP root priority aur HSRP priority ek hi switch par set karna, aur baad mein pair ko vPC mein convert karna taaki dono forward kar sakein.</p><p><b>Seekh:</b> three-tier designs mein Layer-2 aur Layer-3 control planes ko haath se align karna padta hai; spine-leaf is poori class ki problem ko hata deta hai.</p></div>

<div class="iv"><p class="q">"vPC pehle se dono uplinks ko forward karne deta hai. Spine-leaf par jaane ki jagah vPC ke saath three-tier kyun na rakhein?"</p><p>Strong answer: vPC pod ke andar STP blocking theek karta hai, lekin design abhi bhi scale out ki jagah scale up karta hai (top hamesha ek pair hai), Layer-2 domains bade failure domains rehte hain, pods ke beech east-west paths lambe aur zyada oversubscribed hote hain, aur VM mobility abhi bhi core ke paar VLAN stretching ki taraf dhakelti hai. Spine-leaf barabar paths deta hai, spines aur leaves jod kar scale out, chhote failure domains wale routed links, aur Layer-2 ek overlay se deta hai. Yeh bhi jodo ki dual-homed servers ke liye leaf layer par vPC ki jagah aaj bhi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three-tier = access (L2), aggregation (L2/L3 boundary, gateways, services), core (pods ke beech routed transport).</li>
<li>STP redundant uplinks block karta hai, isliye aadhi bandwidth khaali rehti hai; har VLAN ka sirf ek HSRP gateway active hota hai.</li>
<li>Bade Layer-2 domains bade failure domains hain, flooding, badi MAC tables aur 4,094 VLAN limit ke saath.</li>
<li>East-west paths unequal hain (1, 3 ya 5 switches) aur oversubscription layers ke paar multiply hota hai.</li>
<li>vPC/MLAG dono links ko forward karne deta hai aur leaf edge par aaj bhi use hota hai, lekin yeh design ko scale out nahi karta.</li>
</ul></div>
`}};export{e as default};