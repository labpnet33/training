var e={id:`enhancements`,h:{en:`vPC enhancements: peer-gateway, peer-switch, auto-recovery and friends`,hi:`vPC enhancements: peer-gateway, peer-switch, auto-recovery aur saathi`},body:{en:`
<p>A new car comes with the engine, wheels and brakes. Then there is the option list: parking sensors, automatic headlights, hill-start assist. You can drive without them, but on a real road every experienced driver ticks most of those boxes. The vPC domain has a similar option list. Each option fixes one specific corner case, and an interviewer will expect you to explain <b>which problem each one solves</b>, not just recite the command.</p>

<h3>peer-gateway: route frames sent to the peer's MAC</h3>
<p><b>Problem.</b> With HSRP, hosts should send to the virtual MAC, which both peers route. But some devices (certain NAS appliances, load balancers, storage arrays) do not ARP for the gateway; they reply to the <b>source MAC</b> of the frame they received, which may be NX1's own interface MAC. If that reply hashes to NX2, NX2 must bridge it over the peer-link to NX1. NX1 routes it, and if the destination is behind a vPC, the loop-avoidance rule drops it because it arrived on the peer-link. Result: a black hole for some flows only.</p>
<p><b>Fix.</b> <code>peer-gateway</code> lets each peer route frames addressed to the <b>peer's router MAC</b> locally, as if they were its own. Nothing crosses the peer-link. Configure it on both peers; it is standard in almost every vPC design and is part of the HSRP lab.</p>
<pre class="code">vpc domain 10
  peer-gateway</pre>
<p>ICMP redirects should be disabled on the vPC SVIs (<code>no ip redirects</code>), because a redirect sent by one peer for traffic it is routing on behalf of the other would confuse hosts. Current NX-OS releases handle this for you when peer-gateway is enabled, but it is worth checking in the running configuration.</p>

<h3>peer-switch: one STP root for the pair</h3>
<p><b>Problem.</b> Without it, only the vPC primary sends BPDUs on vPC member ports, with its own bridge ID. If the primary fails, the secondary starts sending BPDUs with a <b>different</b> bridge ID; downstream switches see a new root and reconverge, flushing MAC tables.</p>
<p><b>Fix.</b> <code>peer-switch</code> makes both peers send BPDUs with the <b>same bridge ID</b>, derived from the vPC system MAC. The pair appears as one root bridge, and a peer failure causes no root change. Configure the same, low STP priority on both peers so the pair really is root:</p>
<pre class="code">vpc domain 10
  peer-switch
spanning-tree vlan 10,20,30 priority 4096   <span class="c">! identical on NX1 and NX2</span></pre>
<p>In a hybrid topology, where some non-vPC switches also hang off the pair with STP, use <code>spanning-tree pseudo-information</code> to give each peer a different priority for those ports while keeping the shared ID for vPC ports.</p>

<h3>auto-recovery: coming up alone</h3>
<p><b>Problem.</b> After a reload, a vPC switch keeps its vPCs down until it sees its peer, to avoid dual-active. If a power failure takes out both switches and only one comes back, every server stays down even though a perfectly good switch is sitting there.</p>
<p><b>Fix.</b> <code>auto-recovery</code> waits for a reload delay (default <b>240 seconds</b>, configurable with <code>auto-recovery reload-delay</code>) and, if the peer is still missing, the switch takes the primary role and brings its vPCs up. It also covers a second case: the peer-link fails first (so the secondary suspends), and then the primary dies; when the keepalive then goes silent, the secondary restores its vPCs as operational primary instead of staying suspended.</p>
<pre class="code">vpc domain 10
  auto-recovery reload-delay 240</pre>

<h3>delay restore: wait for routing before forwarding</h3>
<p><b>Problem.</b> When a peer reloads or the peer-link returns, vPC member ports can come up in seconds, but the switch's Layer 3 uplinks and routing table may still be converging. Servers start sending to a switch that cannot yet route their traffic north: a short black hole.</p>
<p><b>Fix.</b> <code>delay restore</code> holds vPC member ports down for a number of seconds (default 30) after the peer adjacency is restored; <code>delay restore interface-vlan</code> does the same for SVIs (default 10). Tune them to your routing convergence time.</p>
<pre class="code">vpc domain 10
  delay restore 150
  delay restore interface-vlan 45</pre>

<h3>ip arp synchronize: warm ARP tables</h3>
<p><b>Problem.</b> After the peer-link recovers or a peer reloads, the returning switch has an empty ARP table and must re-ARP for every host before it can route to them. In a large VLAN that is thousands of ARPs and a slow start.</p>
<p><b>Fix.</b> <code>ip arp synchronize</code> (and <code>ipv6 nd synchronize</code>) copies ARP entries between the peers over CFS, so the returning switch has them immediately. It is off by default.</p>

<h3>layer3 peer-router: routing adjacencies over a vPC</h3>
<p><b>Problem.</b> Connecting an external router or firewall to a vPC and forming OSPF or BGP adjacencies with both Nexus peers over that vPC used to be unsupported: routed control packets could arrive at the "wrong" peer, and forwarding them via peer-gateway would decrement the TTL, breaking TTL-1 protocols such as eBGP.</p>
<p><b>Fix.</b> <code>layer3 peer-router</code> (which requires peer-gateway) lets the pair forward such packets for each other without breaking the adjacency. The simpler, still preferred design is dedicated routed links from each Nexus to the router.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Which enhancement solves which problem">
<rect x="10" y="10" width="200" height="54" rx="8" fill="#bae6fd"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">peer-gateway</text><text x="110" y="52" text-anchor="middle" class="svg-muted" font-size="12">replies to peer MAC</text>
<rect x="220" y="10" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">peer-switch</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">one STP root</text>
<rect x="430" y="10" width="200" height="54" rx="8" fill="#fde68a"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">auto-recovery</text><text x="530" y="52" text-anchor="middle" class="svg-muted" font-size="12">up alone after reload</text>
<rect x="10" y="80" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="110" y="104" text-anchor="middle" class="svg-ink" font-size="13">delay restore</text><text x="110" y="122" text-anchor="middle" class="svg-muted" font-size="12">wait for routing</text>
<rect x="220" y="80" width="200" height="54" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">ip arp synchronize</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">warm ARP table</text>
<rect x="430" y="80" width="200" height="54" rx="8" fill="#e2e8f0"/><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">layer3 peer-router</text><text x="530" y="122" text-anchor="middle" class="svg-muted" font-size="12">routing over vPC</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">One option, one corner case: learn the problem first</text>
</svg><p class="cap">The six enhancements and the problem each one solves.</p></div>

<h3>Verification</h3>
<pre class="out">NX1# show vpc brief
...
<span class="hl">Peer Gateway                      : Enabled</span>
Dual-active excluded VLANs        : -
Graceful Consistency Check        : Enabled
<span class="hl">Auto-recovery status              : Enabled, timer is off.(timeout = 240s)</span>
<span class="hl">Delay-restore status              : Timer is off.(timeout = 150s)</span>
Delay-restore SVI status          : Timer is off.(timeout = 45s)
<span class="hl">Operational Layer3 Peer-router    : Enabled</span></pre>

<div class="eg"><p><b>Worked example: a typical production domain.</b></p>
<pre class="code">vpc domain 10
  role priority 100
  peer-keepalive destination 192.0.2.12 source 192.0.2.11 vrf management
  peer-switch
  peer-gateway
  layer3 peer-router
  auto-recovery reload-delay 240
  delay restore 150
  ip arp synchronize</pre>
<p>Every line answers a question: who is primary, how do we detect a dead peer, who is STP root, who routes replies to the wrong MAC, can routers peer over the vPC, what if only one switch returns, how long to wait for routing, and how to avoid an ARP storm.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling peer-switch without setting identical STP priorities; enabling layer3 peer-router without peer-gateway; and leaving delay restore at its default when the uplinks run BGP that takes a minute to converge.</p></div>

<div class="exam"><p><b>Exam trap.</b> peer-gateway is about <b>routing</b> frames sent to the peer's router MAC; peer-switch is about <b>STP</b> bridge ID. Questions like to swap their descriptions. auto-recovery's default reload delay is 240 seconds.</p></div>

<div class="scn"><h4>The NAS that only worked half the time</h4><p>After a migration to a vPC pair, users reported that a NAS share opened "sometimes". Pings to the NAS worked. A packet capture showed the NAS replying to the physical MAC of NX1's SVI instead of the HSRP virtual MAC; replies that the NAS's bond hashed toward NX2 were bridged over the peer-link and then dropped by the loop-avoidance rule on the way back out a vPC. Adding <code>peer-gateway</code> on both peers fixed it instantly.</p><p><b>Lesson:</b> peer-gateway is not optional in a vPC design with real-world appliances.</p></div>

<div class="iv"><p class="q">"What do peer-gateway and peer-switch do, and when would you use them?"</p><p>Strong answer: peer-gateway lets each vPC peer route packets addressed to the other peer's router MAC, which fixes devices that reply to the source MAC instead of the HSRP virtual MAC and keeps that traffic off the peer-link. peer-switch makes both peers send BPDUs with one shared bridge ID so the pair is a single STP root and a peer failure does not trigger an STP root change; configure identical STP priorities with it. Then mention auto-recovery and delay restore as the other two you set on every domain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>peer-gateway: route frames sent to the peer's router MAC locally; needed for many appliances.</li>
<li>peer-switch: one STP bridge ID for the pair; set identical STP priority on both peers.</li>
<li>auto-recovery (default reload delay 240 s): bring vPCs up when the peer never returns.</li>
<li>delay restore (30 s) and delay restore interface-vlan (10 s): wait for routing before forwarding.</li>
<li>ip arp synchronize warms ARP tables; layer3 peer-router (needs peer-gateway) supports routing adjacencies over a vPC.</li>
</ul></div>
`,hi:`
<p>Nayi car engine, wheels aur brakes ke saath aati hai. Phir option list hoti hai: parking sensors, automatic headlights, hill-start assist. Aap inke bina bhi chala sakte ho, par asli sadak par har experienced driver inmein se zyada tar boxes tick karta hai. vPC domain ki bhi aisi hi option list hai. Har option ek khaas corner case theek karta hai, aur interviewer umeed karega ki aap samjhao <b>har option kaunsi problem solve karta hai</b>, sirf command ratna nahi.</p>

<h3>peer-gateway: peer ke MAC par bheje frames route karo</h3>
<p><b>Problem.</b> HSRP ke saath hosts ko virtual MAC par bhejna chahiye, jise dono peers route karte hain. Par kuch devices (kuch NAS appliances, load balancers, storage arrays) gateway ke liye ARP nahi karte; woh mile hue frame ke <b>source MAC</b> par reply karte hain, jo NX1 ka apna interface MAC ho sakta hai. Agar woh reply NX2 par hash ho, to NX2 ko use peer-link se NX1 tak bridge karna padta hai. NX1 use route karta hai, aur agar destination vPC ke peeche hai, to loop-avoidance rule use drop kar deta hai kyunki woh peer-link par aaya. Result: sirf kuch flows ke liye black hole.</p>
<p><b>Fix.</b> <code>peer-gateway</code> har peer ko <b>peer ke router MAC</b> par aaye frames locally route karne deta hai, jaise woh uske apne hon. Kuch bhi peer-link cross nahi karta. Ise dono peers par configure karo; yeh lagbhag har vPC design mein standard hai aur HSRP lab ka hissa hai.</p>
<pre class="code">vpc domain 10
  peer-gateway</pre>
<p>vPC SVIs par ICMP redirects disable hone chahiye (<code>no ip redirects</code>), kyunki doosre ki taraf se route kiye traffic ke liye ek peer ka bheja redirect hosts ko confuse karega. Current NX-OS releases peer-gateway enable hone par yeh aapke liye sambhal lete hain, par running configuration mein check karna achha hai.</p>

<h3>peer-switch: pair ke liye ek STP root</h3>
<p><b>Problem.</b> Iske bina sirf vPC primary vPC member ports par apne bridge ID ke saath BPDUs bhejta hai. Agar primary fail ho, to secondary <b>alag</b> bridge ID ke saath BPDUs bhejna shuru karta hai; downstream switches naya root dekhte hain aur reconverge karte hain, MAC tables flush karte hue.</p>
<p><b>Fix.</b> <code>peer-switch</code> dono peers se vPC system MAC se bane <b>same bridge ID</b> ke saath BPDUs bhejwata hai. Pair ek root bridge dikhta hai, aur peer failure se root change nahi hota. Dono peers par same, kam STP priority configure karo taaki pair sach mein root ho:</p>
<pre class="code">vpc domain 10
  peer-switch
spanning-tree vlan 10,20,30 priority 4096   <span class="c">! NX1 aur NX2 par identical</span></pre>
<p>Hybrid topology mein, jahan kuch non-vPC switches bhi STP ke saath pair se latke hain, <code>spanning-tree pseudo-information</code> use karo taaki un ports ke liye har peer ki priority alag ho jabki vPC ports ke liye shared ID bana rahe.</p>

<h3>auto-recovery: akele up aana</h3>
<p><b>Problem.</b> Reload ke baad vPC switch apne vPCs tab tak down rakhta hai jab tak peer na dikhe, dual-active se bachne ke liye. Agar power failure dono switches ko gira de aur sirf ek wapas aaye, to har server down rehta hai jabki ek bilkul theek switch wahan baitha hai.</p>
<p><b>Fix.</b> <code>auto-recovery</code> ek reload delay tak intezaar karta hai (default <b>240 second</b>, <code>auto-recovery reload-delay</code> se configurable) aur agar peer ab bhi gayab hai, to switch primary role leta hai aur apne vPCs up karta hai. Yeh ek doosra case bhi cover karta hai: pehle peer-link fail hota hai (isliye secondary suspend karta hai), phir primary mar jaata hai; jab keepalive bhi chup ho jaata hai, secondary suspended rehne ki jagah operational primary ban kar apne vPCs wapas laata hai.</p>
<pre class="code">vpc domain 10
  auto-recovery reload-delay 240</pre>

<h3>delay restore: forward karne se pehle routing ka intezaar</h3>
<p><b>Problem.</b> Jab peer reload hota hai ya peer-link wapas aata hai, vPC member ports seconds mein up aa sakte hain, par switch ke Layer 3 uplinks aur routing table abhi converge ho rahe ho sakte hain. Servers aise switch ko bhejna shuru karte hain jo abhi unka traffic north route nahi kar sakta: chhota black hole.</p>
<p><b>Fix.</b> <code>delay restore</code> peer adjacency wapas aane ke baad vPC member ports ko kuch seconds (default 30) tak down rakhta hai; <code>delay restore interface-vlan</code> SVIs ke liye yahi karta hai (default 10). Inhe apne routing convergence time ke hisaab se tune karo.</p>
<pre class="code">vpc domain 10
  delay restore 150
  delay restore interface-vlan 45</pre>

<h3>ip arp synchronize: garam ARP tables</h3>
<p><b>Problem.</b> Peer-link recover hone ya peer reload hone ke baad, wapas aane wale switch ki ARP table khaali hoti hai aur use route karne se pehle har host ke liye dobara ARP karna padta hai. Bade VLAN mein yeh hazaaron ARPs aur dheemi shuruaat hai.</p>
<p><b>Fix.</b> <code>ip arp synchronize</code> (aur <code>ipv6 nd synchronize</code>) CFS ke through peers ke beech ARP entries copy karta hai, isliye wapas aane wale switch ke paas woh turant hoti hain. Yeh default mein off hai.</p>

<h3>layer3 peer-router: vPC ke upar routing adjacencies</h3>
<p><b>Problem.</b> External router ya firewall ko vPC se jodna aur us vPC ke upar dono Nexus peers ke saath OSPF ya BGP adjacencies banana pehle unsupported tha: routed control packets "galat" peer par pahunch sakte the, aur unhe peer-gateway se forward karne par TTL kam hota tha, jo eBGP jaise TTL-1 protocols ko tod deta tha.</p>
<p><b>Fix.</b> <code>layer3 peer-router</code> (jise peer-gateway chahiye) pair ko aise packets ek doosre ke liye bina adjacency tode forward karne deta hai. Zyada simple aur ab bhi preferred design hai har Nexus se router tak dedicated routed links.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Kaunsa enhancement kaunsi problem solve karta hai">
<rect x="10" y="10" width="200" height="54" rx="8" fill="#bae6fd"/><text x="110" y="34" text-anchor="middle" class="svg-ink" font-size="13">peer-gateway</text><text x="110" y="52" text-anchor="middle" class="svg-muted" font-size="12">peer MAC par replies</text>
<rect x="220" y="10" width="200" height="54" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">peer-switch</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">ek STP root</text>
<rect x="430" y="10" width="200" height="54" rx="8" fill="#fde68a"/><text x="530" y="34" text-anchor="middle" class="svg-ink" font-size="13">auto-recovery</text><text x="530" y="52" text-anchor="middle" class="svg-muted" font-size="12">reload ke baad akele up</text>
<rect x="10" y="80" width="200" height="54" rx="8" fill="#bbf7d0"/><text x="110" y="104" text-anchor="middle" class="svg-ink" font-size="13">delay restore</text><text x="110" y="122" text-anchor="middle" class="svg-muted" font-size="12">routing ka intezaar</text>
<rect x="220" y="80" width="200" height="54" rx="8" fill="#fed7aa"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">ip arp synchronize</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">garam ARP table</text>
<rect x="430" y="80" width="200" height="54" rx="8" fill="#e2e8f0"/><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">layer3 peer-router</text><text x="530" y="122" text-anchor="middle" class="svg-muted" font-size="12">vPC par routing</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Ek option, ek corner case: pehle problem seekho</text>
</svg><p class="cap">Chhe enhancements aur har ek jo problem solve karta hai.</p></div>

<h3>Verification</h3>
<pre class="out">NX1# show vpc brief
...
<span class="hl">Peer Gateway                      : Enabled</span>
Dual-active excluded VLANs        : -
Graceful Consistency Check        : Enabled
<span class="hl">Auto-recovery status              : Enabled, timer is off.(timeout = 240s)</span>
<span class="hl">Delay-restore status              : Timer is off.(timeout = 150s)</span>
Delay-restore SVI status          : Timer is off.(timeout = 45s)
<span class="hl">Operational Layer3 Peer-router    : Enabled</span></pre>

<div class="eg"><p><b>Worked example: ek typical production domain.</b></p>
<pre class="code">vpc domain 10
  role priority 100
  peer-keepalive destination 192.0.2.12 source 192.0.2.11 vrf management
  peer-switch
  peer-gateway
  layer3 peer-router
  auto-recovery reload-delay 240
  delay restore 150
  ip arp synchronize</pre>
<p>Har line ek sawaal ka jawab hai: primary kaun hai, mare peer ko kaise pakdein, STP root kaun hai, galat MAC par aaye replies kaun route kare, kya routers vPC ke upar peer kar sakte hain, agar sirf ek switch wapas aaye to kya, routing ke liye kitna intezaar, aur ARP storm se kaise bachein.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Identical STP priorities set kiye bina peer-switch enable karna; peer-gateway ke bina layer3 peer-router enable karna; aur delay restore ko default par chhod dena jab uplinks par BGP chalta hai jise converge hone mein ek minute lagta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> peer-gateway peer ke router MAC par aaye frames ki <b>routing</b> ke baare mein hai; peer-switch <b>STP</b> bridge ID ke baare mein hai. Questions inke descriptions ulatna pasand karte hain. auto-recovery ka default reload delay 240 second hai.</p></div>

<div class="scn"><h4>NAS jo aadha time hi chalta tha</h4><p>vPC pair par migration ke baad users ne bataya ki NAS share "kabhi kabhi" khulta hai. NAS ko ping chal raha tha. Packet capture ne dikhaya ki NAS HSRP virtual MAC ki jagah NX1 ke SVI ke physical MAC par reply kar raha tha; jo replies NAS ka bond NX2 ki taraf hash karta tha woh peer-link se bridge hote the aur phir vPC se bahar jaate waqt loop-avoidance rule se drop ho jaate the. Dono peers par <code>peer-gateway</code> jodte hi turant theek ho gaya.</p><p><b>Seekh:</b> asli duniya ke appliances wale vPC design mein peer-gateway optional nahi hai.</p></div>

<div class="iv"><p class="q">"peer-gateway aur peer-switch kya karte hain, aur aap inhe kab use karoge?"</p><p>Strong answer: peer-gateway har vPC peer ko doosre peer ke router MAC par aaye packets route karne deta hai, jo un devices ko theek karta hai jo HSRP virtual MAC ki jagah source MAC par reply karte hain aur us traffic ko peer-link se door rakhta hai. peer-switch dono peers se ek shared bridge ID ke saath BPDUs bhejwata hai taaki pair ek STP root ho aur peer failure se STP root change na ho; iske saath identical STP priorities configure karo. Phir auto-recovery aur delay restore ka zikr karo, jo baaki do hain jo aap har domain par set karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>peer-gateway: peer ke router MAC par bheje frames locally route karo; kai appliances ke liye zaroori.</li>
<li>peer-switch: pair ke liye ek STP bridge ID; dono peers par identical STP priority set karo.</li>
<li>auto-recovery (default reload delay 240 s): jab peer kabhi wapas na aaye to vPCs up karo.</li>
<li>delay restore (30 s) aur delay restore interface-vlan (10 s): forward karne se pehle routing ka intezaar.</li>
<li>ip arp synchronize ARP tables garam rakhta hai; layer3 peer-router (peer-gateway chahiye) vPC ke upar routing adjacencies support karta hai.</li>
</ul></div>
`}};export{e as default};