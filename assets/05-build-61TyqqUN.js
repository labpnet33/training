var e={id:`build`,h:{en:`Building a vPC domain, in order`,hi:`vPC domain banana, sahi kram mein`},body:{en:`
<p>Building a vPC pair is like building a house: foundation, then walls, then the roof. If you put the roof (the vPC member ports) on before the walls (peer-link) and the foundation (keepalive), nothing stands up, and NX-OS will keep your member ports down until the lower layers are healthy. This chapter follows the exact order used in the first two labs.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="vPC build order">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="82" text-anchor="middle" class="svg-ink" font-size="13">1 Features</text><text x="65" y="99" text-anchor="middle" class="svg-muted" font-size="12">lacp, vpc</text>
<rect x="135" y="60" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">2 Domain</text><text x="190" y="99" text-anchor="middle" class="svg-muted" font-size="12">id, priority</text>
<rect x="260" y="60" width="110" height="50" rx="8" fill="#fde68a"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">3 Keepalive</text><text x="315" y="99" text-anchor="middle" class="svg-muted" font-size="12">peer is alive</text>
<rect x="385" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="440" y="82" text-anchor="middle" class="svg-ink" font-size="13">4 Peer-link</text><text x="440" y="99" text-anchor="middle" class="svg-muted" font-size="12">adjacency ok</text>
<rect x="510" y="60" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="13">5 vPC ports</text><text x="570" y="99" text-anchor="middle" class="svg-muted" font-size="12">vpc 20 up</text>
<line x1="120" y1="85" x2="135" y2="85" stroke="#64748b" stroke-width="2"/><line x1="245" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="85" x2="385" y2="85" stroke="#64748b" stroke-width="2"/><line x1="495" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Verify each step before moving to the next</text>
</svg><p class="cap">The five-step build. Each step has a show command that proves it worked.</p></div>

<h3>Step 1: enable the features</h3>
<p>NX-OS is modular: a protocol's commands do not even exist until its feature is enabled. If you type <code>vpc domain 10</code> and get <code>% Invalid command</code> with a caret marker, the feature is missing.</p>
<pre class="code">NX1(config)# feature lacp
NX1(config)# feature vpc</pre>

<h3>Step 2: create the domain and set the role priority</h3>
<pre class="code">vpc domain 10
  role priority 100      <span class="c">! on NX2: role priority 200</span></pre>
<p>Decide the primary now, before the pair forms, because the election is non-preemptive. Lower priority wins; in the lab NX1 must be primary.</p>

<h3>Step 3: the peer-keepalive</h3>
<p>The keepalive must work before the adjacency can form for the first time: without it, a switch cannot rule out that its peer is alive but unreachable. In production the keepalive usually runs over <b>mgmt0</b> in the <b>management VRF</b>, which is the default when you omit the VRF:</p>
<pre class="code"><span class="c">! Typical production design, out-of-band management network</span>
vpc domain 10
  peer-keepalive destination 192.0.2.12 source 192.0.2.11 vrf management</pre>
<p>In the lab, Ethernet1/8 is a routed back-to-back link (NX1 10.0.0.1/30, NX2 10.0.0.2/30) in the default VRF:</p>
<pre class="code"><span class="c">! NX1</span>
vpc domain 10
  peer-keepalive destination 10.0.0.2 source 10.0.0.1 vrf default
<span class="c">! NX2</span>
vpc domain 10
  peer-keepalive destination 10.0.0.1 source 10.0.0.2 vrf default</pre>
<pre class="out">NX1# show vpc peer-keepalive
<span class="hl">vPC keep-alive status           : peer is alive</span>
--Send status                   : Success
--Receive status                : Success
vPC Keep-alive parameters
--Destination                   : 10.0.0.2
--Keepalive interval            : 1000 msec
--Keepalive timeout             : 5 seconds
--Keepalive hold timeout        : 3 seconds
--Keepalive vrf                 : default
--Keepalive udp port            : 3200</pre>
<p>If you see <code>Suspended (Destination IP not reachable)</code>, check the addresses, the VRF (a keepalive sourced in the wrong VRF is the classic mistake) and plain reachability with <code>ping 10.0.0.2 vrf default</code>.</p>

<h3>Step 4: the peer-link</h3>
<pre class="code">interface ethernet1/1-2
  description vPC peer-link
  switchport mode trunk
  channel-group 1 mode active
interface port-channel1
  switchport mode trunk
  vpc peer-link</pre>
<p>The peer-link should be a trunk that carries every VLAN used on vPC ports (the default trunk allows all). Use at least two links, ideally on different modules or ASICs. Once the peer-link is up and the keepalive is alive, the pair forms:</p>
<pre class="out">NX1# show vpc brief
Legend:
                (*) - local vPC is down, forwarding via vPC peer-link

vPC domain id                     : 10
<span class="hl">Peer status                       : peer adjacency formed ok</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
Configuration consistency status  : success
Per-vlan consistency status       : success
Type-2 consistency status         : success
<span class="hl">vPC role                          : primary</span>
Number of vPCs configured         : 0
Peer Gateway                      : Disabled
Dual-active excluded VLANs        : -
Graceful Consistency Check        : Enabled
Auto-recovery status              : Disabled

vPC Peer-link status
---------------------------------------------------------------------
id    Port   Status Active vlans
--    ----   ------ -------------------------------------------------
1     Po1    up     1,10</pre>

<h3>Step 5: the vPC member ports</h3>
<p>Now build the port-channel toward the server on <b>both</b> peers and tie the halves together with the same <code>vpc</code> number. The port-channel numbers may differ between peers, but keeping them equal (Po20 with vpc 20) avoids confusion at 3 a.m.</p>
<pre class="code"><span class="c">! Same on NX1 and NX2</span>
interface port-channel20
  switchport access vlan 10
  vpc 20
interface ethernet1/3
  switchport access vlan 10
  channel-group 20 mode active</pre>
<p>On the Linux server, build an LACP bond. These are the exact commands from lab 2:</p>
<pre class="code">ip link add bond0 type bond mode 802.3ad lacp_rate fast miimon 100
ip link set eth0 master bond0
ip link set eth1 master bond0
ip addr add 10.10.10.100/24 dev bond0
ip route add default via 10.10.10.2</pre>

<h3>Verification of the finished build</h3>
<pre class="out">NX2# show vpc brief
...
vPC status
----------------------------------------------------------------------------
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          up     success     success               10</span>

NX2# show port-channel summary
Group Port-       Type     Protocol  Member Ports
      Channel
1     Po1(SU)     Eth      LACP      Eth1/1(P)    Eth1/2(P)
<span class="hl">20    Po20(SU)    Eth      LACP      Eth1/3(P)</span></pre>
<p>On SRV1, <code>cat /proc/net/bonding/bond0</code> shows <b>Number of ports: 2</b>, and both slaves report the same <b>Partner Mac Address: 00:23:04:ee:be:0a</b>. Two different switches, one partner: that line is the proof that vPC works. Finish with <code>copy running-config startup-config</code> on both switches.</p>

<div class="eg"><p><b>Worked example: failover test from lab 2.</b> Shut Ethernet1/3 on NX1. The bond drops to <b>Number of ports: 1</b>. A ping from SRV1 to NX1's SVI 10.10.10.2 still works: it now leaves SRV1 on eth1, enters NX2, and crosses the peer-link to NX1. This is one of the legitimate uses of the peer-link. Bring Ethernet1/3 back with <code>no shutdown</code> and the bond returns to two ports within a few seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Keepalive over the peer-link or over an SVI carried by the peer-link: when the peer-link dies, the keepalive dies with it. (2) Forgetting that VLAN 10 must exist on both switches. (3) Different <code>vpc</code> numbers on the two peers for the same server. (4) Configuring the member port in access mode on one peer and trunk on the other; that is a type-1 mismatch, covered next chapter.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default keepalive VRF is <b>management</b>. If an exam config shows <code>peer-keepalive destination x.x.x.x</code> with no VRF, it uses mgmt0's VRF.</p></div>

<div class="scn"><h4>The pair that never formed</h4><p>On a day-one build, the peer-link came up with both members bundled but <code>show vpc brief</code> said "peer adjacency not formed yet" and the keepalive said "Suspended (Destination IP not reachable)". The engineer had configured the keepalive with <code>vrf default</code>, but the addresses were on mgmt0, which lives in VRF management. <code>ping 192.0.2.12 vrf management</code> worked; the same ping in the default VRF failed. Removing <code>vrf default</code> from the command fixed it in seconds.</p><p><b>Lesson:</b> when the adjacency does not form, check the keepalive first, and always check which VRF its source address lives in.</p></div>

<div class="iv"><p class="q">"Walk me through configuring vPC from scratch."</p><p>Strong answer, in order: enable <code>feature lacp</code> and <code>feature vpc</code>; create <code>vpc domain</code> with the same ID on both and a lower <code>role priority</code> on the intended primary; configure the <code>peer-keepalive</code> over mgmt0 or a dedicated link and verify "peer is alive"; build the peer-link port-channel as a trunk with <code>vpc peer-link</code> and verify "peer adjacency formed ok"; then create each downstream port-channel with the same <code>vpc</code> number on both peers and verify with <code>show vpc brief</code> and <code>show port-channel summary</code>. Mention peer-gateway and auto-recovery as best practice.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: features, domain and role priority, keepalive, peer-link, vPC member ports.</li>
<li>The keepalive must be alive for the first adjacency; production default is mgmt0 in VRF management.</li>
<li>The peer-link is an LACP trunk port-channel with <code>vpc peer-link</code>, carrying all vPC VLANs.</li>
<li>Member port-channels use the same <code>vpc</code> number on both peers.</li>
<li>Proof of success: "peer adjacency formed ok", vPC status up and success, and one partner MAC on both server NICs.</li>
</ul></div>
`,hi:`
<p>vPC pair banana ghar banane jaisa hai: pehle neenv, phir deewarein, phir chhat. Agar aap chhat (vPC member ports) deewaron (peer-link) aur neenv (keepalive) se pehle rakh do, to kuch khada nahi hota, aur NX-OS aapke member ports ko tab tak down rakhega jab tak neeche ki layers healthy na hon. Yeh chapter wahi exact kram follow karta hai jo pehle do labs mein use hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="vPC build ka kram">
<rect x="10" y="60" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="82" text-anchor="middle" class="svg-ink" font-size="13">1 Features</text><text x="65" y="99" text-anchor="middle" class="svg-muted" font-size="12">lacp, vpc</text>
<rect x="135" y="60" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="190" y="82" text-anchor="middle" class="svg-ink" font-size="13">2 Domain</text><text x="190" y="99" text-anchor="middle" class="svg-muted" font-size="12">id, priority</text>
<rect x="260" y="60" width="110" height="50" rx="8" fill="#fde68a"/><text x="315" y="82" text-anchor="middle" class="svg-ink" font-size="13">3 Keepalive</text><text x="315" y="99" text-anchor="middle" class="svg-muted" font-size="12">peer is alive</text>
<rect x="385" y="60" width="110" height="50" rx="8" fill="#bae6fd"/><text x="440" y="82" text-anchor="middle" class="svg-ink" font-size="13">4 Peer-link</text><text x="440" y="99" text-anchor="middle" class="svg-muted" font-size="12">adjacency ok</text>
<rect x="510" y="60" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="82" text-anchor="middle" class="svg-ink" font-size="13">5 vPC ports</text><text x="570" y="99" text-anchor="middle" class="svg-muted" font-size="12">vpc 20 up</text>
<line x1="120" y1="85" x2="135" y2="85" stroke="#64748b" stroke-width="2"/><line x1="245" y1="85" x2="260" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="85" x2="385" y2="85" stroke="#64748b" stroke-width="2"/><line x1="495" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Agle step se pehle har step verify karo</text>
</svg><p class="cap">Paanch step ka build. Har step ka ek show command hai jo saabit karta hai ki woh chala.</p></div>

<h3>Step 1: features enable karo</h3>
<p>NX-OS modular hai: kisi protocol ke commands tab tak exist hi nahi karte jab tak uska feature enable na ho. Agar aap <code>vpc domain 10</code> type karo aur caret marker ke saath <code>% Invalid command</code> mile, to feature missing hai.</p>
<pre class="code">NX1(config)# feature lacp
NX1(config)# feature vpc</pre>

<h3>Step 2: domain banao aur role priority set karo</h3>
<pre class="code">vpc domain 10
  role priority 100      <span class="c">! NX2 par: role priority 200</span></pre>
<p>Primary abhi decide karo, pair banne se pehle, kyunki election non-preemptive hai. Kam priority jeetti hai; lab mein NX1 primary hona chahiye.</p>

<h3>Step 3: peer-keepalive</h3>
<p>Adjacency pehli baar banne se pehle keepalive ka chalna zaroori hai: iske bina switch yeh rule out nahi kar sakta ki uska peer zinda hai par pahunch se bahar hai. Production mein keepalive aam taur par <b>management VRF</b> mein <b>mgmt0</b> par chalta hai, jo VRF na likhne par default hai:</p>
<pre class="code"><span class="c">! Typical production design, out-of-band management network</span>
vpc domain 10
  peer-keepalive destination 192.0.2.12 source 192.0.2.11 vrf management</pre>
<p>Lab mein Ethernet1/8 default VRF mein routed back-to-back link hai (NX1 10.0.0.1/30, NX2 10.0.0.2/30):</p>
<pre class="code"><span class="c">! NX1</span>
vpc domain 10
  peer-keepalive destination 10.0.0.2 source 10.0.0.1 vrf default
<span class="c">! NX2</span>
vpc domain 10
  peer-keepalive destination 10.0.0.1 source 10.0.0.2 vrf default</pre>
<pre class="out">NX1# show vpc peer-keepalive
<span class="hl">vPC keep-alive status           : peer is alive</span>
--Send status                   : Success
--Receive status                : Success
vPC Keep-alive parameters
--Destination                   : 10.0.0.2
--Keepalive interval            : 1000 msec
--Keepalive timeout             : 5 seconds
--Keepalive hold timeout        : 3 seconds
--Keepalive vrf                 : default
--Keepalive udp port            : 3200</pre>
<p>Agar <code>Suspended (Destination IP not reachable)</code> dikhe, to addresses, VRF (galat VRF mein source kiya keepalive classic galti hai) aur <code>ping 10.0.0.2 vrf default</code> se seedhi reachability check karo.</p>

<h3>Step 4: peer-link</h3>
<pre class="code">interface ethernet1/1-2
  description vPC peer-link
  switchport mode trunk
  channel-group 1 mode active
interface port-channel1
  switchport mode trunk
  vpc peer-link</pre>
<p>Peer-link aisa trunk hona chahiye jo vPC ports par use hone wala har VLAN le jaaye (default trunk sab allow karta hai). Kam se kam do links use karo, behtar ho ki alag modules ya ASICs par. Jaise hi peer-link up aur keepalive alive hota hai, pair ban jaata hai:</p>
<pre class="out">NX1# show vpc brief
Legend:
                (*) - local vPC is down, forwarding via vPC peer-link

vPC domain id                     : 10
<span class="hl">Peer status                       : peer adjacency formed ok</span>
<span class="hl">vPC keep-alive status             : peer is alive</span>
Configuration consistency status  : success
Per-vlan consistency status       : success
Type-2 consistency status         : success
<span class="hl">vPC role                          : primary</span>
Number of vPCs configured         : 0
Peer Gateway                      : Disabled
Dual-active excluded VLANs        : -
Graceful Consistency Check        : Enabled
Auto-recovery status              : Disabled

vPC Peer-link status
---------------------------------------------------------------------
id    Port   Status Active vlans
--    ----   ------ -------------------------------------------------
1     Po1    up     1,10</pre>

<h3>Step 5: vPC member ports</h3>
<p>Ab server ki taraf port-channel <b>dono</b> peers par banao aur same <code>vpc</code> number se dono hisson ko jodo. Port-channel numbers peers mein alag ho sakte hain, par unhe same rakhna (Po20 ke saath vpc 20) raat 3 baje confusion se bachata hai.</p>
<pre class="code"><span class="c">! NX1 aur NX2 par same</span>
interface port-channel20
  switchport access vlan 10
  vpc 20
interface ethernet1/3
  switchport access vlan 10
  channel-group 20 mode active</pre>
<p>Linux server par LACP bond banao. Yeh lab 2 ke exact commands hain:</p>
<pre class="code">ip link add bond0 type bond mode 802.3ad lacp_rate fast miimon 100
ip link set eth0 master bond0
ip link set eth1 master bond0
ip addr add 10.10.10.100/24 dev bond0
ip route add default via 10.10.10.2</pre>

<h3>Poore build ka verification</h3>
<pre class="out">NX2# show vpc brief
...
vPC status
----------------------------------------------------------------------------
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          up     success     success               10</span>

NX2# show port-channel summary
Group Port-       Type     Protocol  Member Ports
      Channel
1     Po1(SU)     Eth      LACP      Eth1/1(P)    Eth1/2(P)
<span class="hl">20    Po20(SU)    Eth      LACP      Eth1/3(P)</span></pre>
<p>SRV1 par <code>cat /proc/net/bonding/bond0</code> <b>Number of ports: 2</b> dikhata hai, aur dono slaves same <b>Partner Mac Address: 00:23:04:ee:be:0a</b> batate hain. Do alag switches, ek partner: yahi line saboot hai ki vPC chal raha hai. Dono switches par <code>copy running-config startup-config</code> se khatam karo.</p>

<div class="eg"><p><b>Worked example: lab 2 ka failover test.</b> NX1 par Ethernet1/3 shut karo. Bond <b>Number of ports: 1</b> par aa jaata hai. SRV1 se NX1 ke SVI 10.10.10.2 tak ping phir bhi chalta hai: ab woh SRV1 se eth1 par nikalta hai, NX2 mein aata hai, aur peer-link cross karke NX1 tak jaata hai. Yeh peer-link ke jaayaz uses mein se ek hai. <code>no shutdown</code> se Ethernet1/3 wapas laao aur bond kuch seconds mein do ports par wapas aa jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Keepalive peer-link ke upar ya peer-link par chalne wale SVI ke upar: jab peer-link marta hai, keepalive bhi saath marta hai. (2) Bhool jaana ki VLAN 10 dono switches par exist karna chahiye. (3) Same server ke liye dono peers par alag <code>vpc</code> numbers. (4) Member port ek peer par access mode aur doosre par trunk; yeh type-1 mismatch hai, agle chapter mein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default keepalive VRF <b>management</b> hai. Agar exam config bina VRF ke <code>peer-keepalive destination x.x.x.x</code> dikhaye, to woh mgmt0 ka VRF use karta hai.</p></div>

<div class="scn"><h4>Woh pair jo kabhi bana hi nahi</h4><p>Day-one build par peer-link dono members bundled ke saath up aa gaya par <code>show vpc brief</code> keh raha tha "peer adjacency not formed yet" aur keepalive keh raha tha "Suspended (Destination IP not reachable)". Engineer ne keepalive <code>vrf default</code> ke saath configure kiya tha, par addresses mgmt0 par the, jo VRF management mein rehta hai. <code>ping 192.0.2.12 vrf management</code> chala; wahi ping default VRF mein fail hua. Command se <code>vrf default</code> hatate hi seconds mein theek ho gaya.</p><p><b>Seekh:</b> jab adjacency na bane, pehle keepalive check karo, aur hamesha check karo ki uska source address kis VRF mein rehta hai.</p></div>

<div class="iv"><p class="q">"Mujhe scratch se vPC configure karna samjhao."</p><p>Strong answer, kram mein: <code>feature lacp</code> aur <code>feature vpc</code> enable karo; dono par same ID ke saath <code>vpc domain</code> banao aur intended primary par kam <code>role priority</code> do; mgmt0 ya dedicated link par <code>peer-keepalive</code> configure karo aur "peer is alive" verify karo; peer-link port-channel ko trunk bana kar <code>vpc peer-link</code> do aur "peer adjacency formed ok" verify karo; phir har downstream port-channel dono peers par same <code>vpc</code> number ke saath banao aur <code>show vpc brief</code> aur <code>show port-channel summary</code> se verify karo. Best practice ke roop mein peer-gateway aur auto-recovery ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kram: features, domain aur role priority, keepalive, peer-link, vPC member ports.</li>
<li>Pehli adjacency ke liye keepalive alive hona chahiye; production default VRF management mein mgmt0 hai.</li>
<li>Peer-link <code>vpc peer-link</code> wala LACP trunk port-channel hai, jo saare vPC VLANs le jaata hai.</li>
<li>Member port-channels dono peers par same <code>vpc</code> number use karte hain.</li>
<li>Success ka saboot: "peer adjacency formed ok", vPC status up aur success, aur dono server NICs par ek hi partner MAC.</li>
</ul></div>
`}};export{e as default};