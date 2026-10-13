var e={id:`align-build`,h:{en:`Aligning STP, HSRP and EtherChannel: build the redundant block`,hi:`STP, HSRP aur EtherChannel align karna: redundant block banao`},body:{en:`
<p>Imagine an office with two reception desks, one at each end of a long corridor. Visitors always enter through the east door, but the only receptionist on duty sits at the west desk. Every visitor walks the whole corridor, then walks back. Nothing is broken, yet everything is slower and the corridor is crowded. That is what happens in an L2 access design when <b>spanning tree</b> sends frames up one uplink while the <b>HSRP active gateway</b> sits on the other distribution switch. This chapter shows how to align them and then walks through the first lab, <b>Build a redundant collapsed-core block</b>.</p>

<h3>Why alignment matters</h3>
<p>In the looped triangle, spanning tree picks one root bridge per VLAN and blocks the access uplink that leads away from it. HSRP independently picks one active router per VLAN. If DS2 is the STP root for VLAN 10 but DS1 is HSRP active, PC1's frames go AS1 → DS2 (the forwarding uplink), cross the DS1–DS2 link and only then reach the gateway on DS1. The inter-switch link carries all of VLAN 10's routed traffic and every packet takes an extra hop.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Misaligned versus aligned root and gateway">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Misaligned (VLAN 10)</text>
<rect x="40" y="35" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS1</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="11">HSRP active</text>
<rect x="190" y="35" width="90" height="36" rx="6" fill="#fde68a"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS2</text><text x="235" y="66" text-anchor="middle" class="svg-muted" font-size="11">STP root</text>
<rect x="115" y="160" width="90" height="34" rx="6" fill="#bae6fd"/><text x="160" y="182" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="130" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="85" y1="71" x2="140" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="80" y="120" class="svg-accent" font-size="12">BLK</text>
<line x1="235" y1="71" x2="180" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="160" y="220" text-anchor="middle" class="svg-accent" font-size="12">AS1 to DS2 to DS1: extra hop</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Aligned (VLAN 10)</text>
<rect x="360" y="35" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS1</text><text x="405" y="66" text-anchor="middle" class="svg-muted" font-size="11">root + active</text>
<rect x="510" y="35" width="90" height="36" rx="6" fill="#e2e8f0"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS2</text><text x="555" y="66" text-anchor="middle" class="svg-muted" font-size="11">standby</text>
<rect x="435" y="160" width="90" height="34" rx="6" fill="#bae6fd"/><text x="480" y="182" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="450" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="405" y1="71" x2="460" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="555" y1="71" x2="500" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="540" y="120" class="svg-accent" font-size="12">BLK</text>
<text x="480" y="220" text-anchor="middle" class="svg-accent" font-size="12">AS1 straight to the gateway</text>
</svg><p class="cap">Make the same switch STP root and HSRP active for each VLAN.</p></div>

<h3>The design rules</h3>
<ol>
<li><b>Per VLAN, one owner.</b> The same distribution switch is STP root and HSRP active; the other is secondary root and HSRP standby.</li>
<li><b>Load-share by VLAN.</b> DS1 owns VLAN 10, DS2 owns VLAN 20, so both uplinks carry traffic.</li>
<li><b>Preempt on both switches.</b> Without <code>standby preempt</code>, a recovered owner stays standby and alignment is lost after the first failure. In production add <code>standby 10 preempt delay minimum 60</code> so the switch waits for routing to converge before taking over.</li>
<li><b>Bundle the inter-switch link with LACP.</b> Two links in one Port-channel look like one link to STP, so a member failure causes no topology change, and LACP detects mis-cabling that <code>mode on</code> would hide.</li>
<li><b>Both distribution switches in the routing protocol</b>, so the WAN router has two equal-cost paths back to every user subnet.</li>
</ol>

<h3>Lab walkthrough: build a redundant collapsed-core block</h3>
<p>Start state: addressing, SVIs and HSRP virtual IPs (10.1.10.1 and 10.1.20.1) exist; nothing is aligned, the DS1–DS2 links are separate, and DS2 is missing from OSPF.</p>

<h4>Task 1: LACP bundle between DS1 and DS2</h4>
<pre class="code"><span class="c">! On DS1 and on DS2</span>
interface range g0/6 - 7
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
 switchport trunk allowed vlan 10,20</pre>
<pre class="out">DS1# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi0/6(P)    Gi0/7(P)</span></pre>
<p>SU means Layer 2 and in use; P means bundled. Anything else (I stand-alone, s suspended, D down) means the bundle is not healthy.</p>

<h4>Task 2: STP roots per VLAN</h4>
<pre class="code">DS1(config)# spanning-tree vlan 10 root primary
DS1(config)# spanning-tree vlan 20 root secondary
DS2(config)# spanning-tree vlan 20 root primary
DS2(config)# spanning-tree vlan 10 root secondary</pre>
<p>The <code>root primary</code> macro writes priority 24576, or 4096 less than the current root if that is already lower; <code>root secondary</code> writes 28672. It is a one-time calculation saved as a number in the configuration.</p>
<pre class="out">AS1# show spanning-tree vlan 10
<span class="hl">  Root ID    Priority    24586</span>
             Cost        4
<span class="hl">             Port        1 (GigabitEthernet0/0)</span>
Interface           Role Sts Cost      Prio.Nbr Type
Gi0/0               Root FWD 4         128.1    P2p
<span class="hl">Gi0/1               Altn BLK 4         128.2    P2p</span></pre>
<p>24586 is 24576 plus the VLAN number (extended system ID). Gi0/0 towards DS1 is the root port; for VLAN 20 the roles reverse.</p>

<h4>Task 3: HSRP owners with preempt</h4>
<pre class="code">DS1(config)# interface vlan 10
DS1(config-if)# standby 10 priority 110
DS1(config-if)# standby 10 preempt
DS1(config)# interface vlan 20
DS1(config-if)# standby 20 preempt
<span class="c">! DS2 mirrors it: priority 110 + preempt for group 20, preempt for group 10</span></pre>
<pre class="out">DS1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span>
Vl20        20   100 P Standby 10.1.20.3       local           10.1.20.1</pre>

<h4>Task 4: DS2 into OSPF</h4>
<pre class="code">DS2(config)# router ospf 1
DS2(config-router)# router-id 1.1.1.3
DS2(config-router)# network 10.0.2.0 0.0.0.3 area 0
DS2(config-router)# network 10.1.0.0 0.0.255.255 area 0</pre>
<pre class="out">R1# show ip route ospf
<span class="hl">O        10.1.20.0/24 [110/2] via 10.0.2.2, 00:00:21, GigabitEthernet0/1</span>
<span class="hl">                      [110/2] via 10.0.1.2, 00:00:21, GigabitEthernet0/0</span></pre>
<p>Two equal-cost paths: return traffic can reach the users through either distribution switch.</p>

<h4>Tasks 5 and 6: failover test and the virtual MAC</h4>
<p>Shut <code>interface vlan 10</code> on DS1. DS2 logs <code>%HSRP-5-STATECHANGE: Vlan10 Grp 10 state Standby -&gt; Active</code> and PC1 still pings 172.16.0.10. Bring the SVI back with <code>no shutdown</code>; after the hold and preempt timers DS1 logs <code>Speak -&gt; Active</code> or <code>Standby -&gt; Active</code> and owns VLAN 10 again. Finally, <code>show standby vlan 10</code> shows the virtual MAC.</p>
<pre class="out">DS1# show standby vlan 10
Vlan10 - Group 10
  State is Active
  Virtual IP address is 10.1.10.1
<span class="hl">  Active virtual MAC address is 0000.0c07.ac0a (MAC In Use)</span>
  Preemption enabled
  Priority 110 (configured 110)</pre>

<div class="eg"><p><b>Worked example.</b> HSRP version 1 builds its virtual MAC as 0000.0c07.acXX, where XX is the group number in hex. Group 10 is 0x0a, so the answer is <b>0000.0c07.ac0a</b>. Group 20 would be 0000.0c07.ac14. Because the MAC moves with the active role, PC1's ARP entry for 10.1.10.1 never changes during failover.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring priority 110 but forgetting preempt, so alignment breaks after the first reboot. Using <code>channel-group 1 mode on</code> on one side and <code>active</code> on the other. Setting STP roots with the macro, then later adding a switch with a lower priority that silently steals the root.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP root and FHRP active are chosen by <b>different, independent protocols</b>. Nothing aligns them automatically. If a question shows traffic crossing the inter-switch link to reach the gateway, the answer is to align root and active for that VLAN, not to change HSRP timers.</p></div>

<div class="scn"><h4>The inter-switch link that was always at 90 percent</h4><p>A retail head office saw its 2 x 1 Gbps distribution interconnect run near 90 percent every afternoon, while one access uplink per switch sat idle. <code>show spanning-tree root</code> showed DS-B as root for every VLAN (default priorities, lowest MAC), while HSRP was active on DS-A for all VLANs. Every routed packet crossed the interconnect. The engineer set root primary/secondary per VLAN to match the HSRP design, split odd VLANs to DS-A and even VLANs to DS-B with matching HSRP priorities and preempt, and interconnect load fell below 20 percent.</p><p><b>Lesson:</b> default STP elects the switch with the lowest MAC, which is almost never the switch you intended.</p></div>

<div class="iv"><p class="q">"Why should the STP root bridge and the HSRP active router be on the same switch?"</p><p>Explain that STP decides which uplink forwards and HSRP decides where the gateway is. If they differ, traffic climbs to the root, crosses the inter-switch link to the gateway, and the link becomes a bottleneck with an extra hop. Align them per VLAN, load-share VLANs across the pair, use preempt so alignment survives failures, and bundle the interconnect with LACP. Mention that routed access or StackWise Virtual removes the problem entirely.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Per VLAN, make one switch both STP root and HSRP active; load-share VLANs across the pair.</li>
<li>Use preempt on both switches; add a preempt delay in production.</li>
<li>Bundle the inter-switch link with LACP active on both sides; verify Po1(SU) and members (P).</li>
<li>Put both distribution switches in OSPF so R1 has two equal-cost return paths.</li>
<li>HSRPv1 virtual MAC = 0000.0c07.acXX; group 10 = 0000.0c07.ac0a.</li>
</ul></div>
`,hi:`
<p>Ek office socho jismein do reception desks hain, ek lambe corridor ke har end par. Visitors hamesha east door se aate hain, lekin duty par akela receptionist west desk par baitha hai. Har visitor poora corridor chalta hai, phir wapas aata hai. Kuch toota nahi hai, phir bhi sab slow hai aur corridor mein bheed hai. L2 access design mein yahi hota hai jab <b>spanning tree</b> frames ko ek uplink se upar bhejta hai jabki <b>HSRP active gateway</b> doosre distribution switch par baitha hai. Yeh chapter dikhata hai ki unhe kaise align karein aur phir pehli lab, <b>Redundant collapsed-core block banao</b>, walk through karta hai.</p>

<h3>Alignment kyun zaroori hai</h3>
<p>Looped triangle mein spanning tree har VLAN ka ek root bridge chunta hai aur us access uplink ko block karta hai jo usse door le jaata hai. HSRP alag se har VLAN ka ek active router chunta hai. Agar VLAN 10 ka STP root DS2 hai lekin HSRP active DS1 hai, to PC1 ke frames AS1 → DS2 (forwarding uplink) jaate hain, DS1–DS2 link cross karte hain aur tab DS1 par gateway tak pahunchte hain. Inter-switch link VLAN 10 ka saara routed traffic uthata hai aur har packet ek extra hop leta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Misaligned vs aligned root aur gateway">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Misaligned (VLAN 10)</text>
<rect x="40" y="35" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="85" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS1</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="11">HSRP active</text>
<rect x="190" y="35" width="90" height="36" rx="6" fill="#fde68a"/><text x="235" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS2</text><text x="235" y="66" text-anchor="middle" class="svg-muted" font-size="11">STP root</text>
<rect x="115" y="160" width="90" height="34" rx="6" fill="#bae6fd"/><text x="160" y="182" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="130" y1="53" x2="190" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="85" y1="71" x2="140" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="80" y="120" class="svg-accent" font-size="12">BLK</text>
<line x1="235" y1="71" x2="180" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="160" y="220" text-anchor="middle" class="svg-accent" font-size="12">AS1 se DS2 se DS1: extra hop</text>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Aligned (VLAN 10)</text>
<rect x="360" y="35" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="405" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS1</text><text x="405" y="66" text-anchor="middle" class="svg-muted" font-size="11">root + active</text>
<rect x="510" y="35" width="90" height="36" rx="6" fill="#e2e8f0"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="12">DS2</text><text x="555" y="66" text-anchor="middle" class="svg-muted" font-size="11">standby</text>
<rect x="435" y="160" width="90" height="34" rx="6" fill="#bae6fd"/><text x="480" y="182" text-anchor="middle" class="svg-ink" font-size="12">AS1</text>
<line x1="450" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="3"/>
<line x1="405" y1="71" x2="460" y2="160" stroke="#64748b" stroke-width="2"/>
<line x1="555" y1="71" x2="500" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="540" y="120" class="svg-accent" font-size="12">BLK</text>
<text x="480" y="220" text-anchor="middle" class="svg-accent" font-size="12">AS1 seedha gateway tak</text>
</svg><p class="cap">Har VLAN ke liye ek hi switch ko STP root aur HSRP active banao.</p></div>

<h3>Design rules</h3>
<ol>
<li><b>Har VLAN ka ek owner.</b> Same distribution switch STP root aur HSRP active ho; doosra secondary root aur HSRP standby.</li>
<li><b>VLAN ke hisaab se load-share.</b> VLAN 10 DS1 ka, VLAN 20 DS2 ka, taaki dono uplinks traffic uthayein.</li>
<li><b>Dono switches par preempt.</b> <code>standby preempt</code> ke bina recover hua owner standby hi rehta hai aur pehle failure ke baad alignment kho jaata hai. Production mein <code>standby 10 preempt delay minimum 60</code> jodo taaki switch takeover se pehle routing converge hone ka wait kare.</li>
<li><b>Inter-switch link ko LACP se bundle karo.</b> Ek Port-channel ke do links STP ko ek link dikhte hain, isliye member failure se topology change nahi hota, aur LACP woh mis-cabling pakadta hai jo <code>mode on</code> chupa deta.</li>
<li><b>Dono distribution switches routing protocol mein</b>, taaki WAN router ke paas har user subnet tak do equal-cost paths hon.</li>
</ol>

<h3>Lab walkthrough: redundant collapsed-core block banao</h3>
<p>Start state: addressing, SVIs aur HSRP virtual IPs (10.1.10.1 aur 10.1.20.1) maujood hain; kuch align nahi hai, DS1–DS2 links alag alag hain, aur DS2 OSPF se gayab hai.</p>

<h4>Task 1: DS1 aur DS2 ke beech LACP bundle</h4>
<pre class="code"><span class="c">! DS1 aur DS2 dono par</span>
interface range g0/6 - 7
 channel-group 1 mode active
interface port-channel 1
 switchport mode trunk
 switchport trunk allowed vlan 10,20</pre>
<pre class="out">DS1# show etherchannel summary
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
<span class="hl">1      Po1(SU)         LACP      Gi0/6(P)    Gi0/7(P)</span></pre>
<p>SU ka matlab Layer 2 aur in use; P ka matlab bundled. Kuch aur (I stand-alone, s suspended, D down) ka matlab bundle healthy nahi hai.</p>

<h4>Task 2: har VLAN ke STP roots</h4>
<pre class="code">DS1(config)# spanning-tree vlan 10 root primary
DS1(config)# spanning-tree vlan 20 root secondary
DS2(config)# spanning-tree vlan 20 root primary
DS2(config)# spanning-tree vlan 10 root secondary</pre>
<p><code>root primary</code> macro priority 24576 likhta hai, ya agar current root pehle se kam hai to usse 4096 kam; <code>root secondary</code> 28672 likhta hai. Yeh ek baar ki calculation hai jo configuration mein number ki tarah save hoti hai.</p>
<pre class="out">AS1# show spanning-tree vlan 10
<span class="hl">  Root ID    Priority    24586</span>
             Cost        4
<span class="hl">             Port        1 (GigabitEthernet0/0)</span>
Interface           Role Sts Cost      Prio.Nbr Type
Gi0/0               Root FWD 4         128.1    P2p
<span class="hl">Gi0/1               Altn BLK 4         128.2    P2p</span></pre>
<p>24586 = 24576 plus VLAN number (extended system ID). DS1 ki taraf Gi0/0 root port hai; VLAN 20 ke liye roles ulat jaate hain.</p>

<h4>Task 3: preempt ke saath HSRP owners</h4>
<pre class="code">DS1(config)# interface vlan 10
DS1(config-if)# standby 10 priority 110
DS1(config-if)# standby 10 preempt
DS1(config)# interface vlan 20
DS1(config-if)# standby 20 preempt
<span class="c">! DS2 ulta karta hai: group 20 ke liye priority 110 + preempt, group 10 ke liye preempt</span></pre>
<pre class="out">DS1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           10.1.10.3       10.1.10.1</span>
Vl20        20   100 P Standby 10.1.20.3       local           10.1.20.1</pre>

<h4>Task 4: DS2 ko OSPF mein laao</h4>
<pre class="code">DS2(config)# router ospf 1
DS2(config-router)# router-id 1.1.1.3
DS2(config-router)# network 10.0.2.0 0.0.0.3 area 0
DS2(config-router)# network 10.1.0.0 0.0.255.255 area 0</pre>
<pre class="out">R1# show ip route ospf
<span class="hl">O        10.1.20.0/24 [110/2] via 10.0.2.2, 00:00:21, GigabitEthernet0/1</span>
<span class="hl">                      [110/2] via 10.0.1.2, 00:00:21, GigabitEthernet0/0</span></pre>
<p>Do equal-cost paths: return traffic kisi bhi distribution switch se users tak pahunch sakta hai.</p>

<h4>Tasks 5 aur 6: failover test aur virtual MAC</h4>
<p>DS1 par <code>interface vlan 10</code> shut karo. DS2 <code>%HSRP-5-STATECHANGE: Vlan10 Grp 10 state Standby -&gt; Active</code> log karta hai aur PC1 abhi bhi 172.16.0.10 ping karta hai. <code>no shutdown</code> se SVI wapas laao; hold aur preempt timers ke baad DS1 <code>Speak -&gt; Active</code> ya <code>Standby -&gt; Active</code> log karta hai aur phir se VLAN 10 ka owner banta hai. Aakhir mein <code>show standby vlan 10</code> virtual MAC dikhata hai.</p>
<pre class="out">DS1# show standby vlan 10
Vlan10 - Group 10
  State is Active
  Virtual IP address is 10.1.10.1
<span class="hl">  Active virtual MAC address is 0000.0c07.ac0a (MAC In Use)</span>
  Preemption enabled
  Priority 110 (configured 110)</pre>

<div class="eg"><p><b>Worked example.</b> HSRP version 1 apna virtual MAC 0000.0c07.acXX banata hai, jahan XX group number hex mein hai. Group 10 = 0x0a, isliye answer <b>0000.0c07.ac0a</b> hai. Group 20 hota 0000.0c07.ac14. Kyunki MAC active role ke saath move karta hai, failover ke dauraan PC1 ki 10.1.10.1 wali ARP entry kabhi nahi badalti.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Priority 110 configure karna lekin preempt bhool jaana, jisse pehle reboot ke baad alignment toot jaata hai. Ek side <code>channel-group 1 mode on</code> aur doosri side <code>active</code> use karna. Macro se STP roots set karna, phir baad mein kam priority wala switch jodna jo chupchaap root chheen leta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> STP root aur FHRP active <b>alag, independent protocols</b> chunte hain. Unhe automatically koi align nahi karta. Agar question dikhaye ki gateway tak pahunchne ke liye traffic inter-switch link cross kar raha hai, to answer hai us VLAN ke liye root aur active align karna, HSRP timers badalna nahi.</p></div>

<div class="scn"><h4>Woh inter-switch link jo hamesha 90 percent par tha</h4><p>Ek retail head office ka 2 x 1 Gbps distribution interconnect har dopahar 90 percent ke paas chalta tha, jabki har switch ka ek access uplink khaali baitha tha. <code>show spanning-tree root</code> ne dikhaya ki DS-B har VLAN ka root tha (default priorities, lowest MAC), jabki HSRP saare VLANs ke liye DS-A par active tha. Har routed packet interconnect cross karta tha. Engineer ne HSRP design se match karne ke liye har VLAN ka root primary/secondary set kiya, odd VLANs DS-A ko aur even VLANs DS-B ko diye matching HSRP priorities aur preempt ke saath, aur interconnect load 20 percent se neeche aa gaya.</p><p><b>Seekh:</b> default STP lowest MAC wale switch ko elect karta hai, jo lagbhag kabhi woh switch nahi hota jo aapne socha tha.</p></div>

<div class="iv"><p class="q">"STP root bridge aur HSRP active router same switch par kyun hone chahiye?"</p><p>Samjhao ki STP decide karta hai kaunsa uplink forward kare aur HSRP decide karta hai gateway kahan hai. Agar dono alag hon, traffic root tak chadhta hai, gateway tak inter-switch link cross karta hai, aur link extra hop ke saath bottleneck ban jaata hai. Har VLAN ke liye unhe align karo, pair par VLANs load-share karo, preempt use karo taaki alignment failures ke baad bhi bana rahe, aur interconnect ko LACP se bundle karo. Batao ki routed access ya StackWise Virtual yeh problem poori tarah hata dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har VLAN ke liye ek switch ko STP root aur HSRP active dono banao; pair par VLANs load-share karo.</li>
<li>Dono switches par preempt use karo; production mein preempt delay jodo.</li>
<li>Inter-switch link ko dono sides LACP active se bundle karo; Po1(SU) aur members (P) verify karo.</li>
<li>Dono distribution switches ko OSPF mein daalo taaki R1 ke paas do equal-cost return paths hon.</li>
<li>HSRPv1 virtual MAC = 0000.0c07.acXX; group 10 = 0000.0c07.ac0a.</li>
</ul></div>
`}};export{e as default};