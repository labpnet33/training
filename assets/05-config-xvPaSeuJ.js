var e={id:`config`,h:{en:`Building a VXLAN leaf step by step (IOS XE style)`,hi:`VXLAN leaf step by step banana (IOS XE style)`},body:{en:`
<p>Configuring a leaf is like assembling flat-pack furniture: the parts are few, but the order matters, and a missing screw shows up only when you sit down. We build LEAF1 in six steps and then show what changes on the other leaves. Every step has its own check, so a fault is found at the step that caused it.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Six build steps">
<g font-size="12" class="svg-ink">
<rect x="10" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="57" y="52" text-anchor="middle">1 Underlay</text><text x="57" y="68" text-anchor="middle" class="svg-muted">OSPF + Lo1</text>
<rect x="115" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="162" y="52" text-anchor="middle">2 VLAN</text><text x="162" y="68" text-anchor="middle" class="svg-muted">+ SVI/host port</text>
<rect x="220" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="267" y="52" text-anchor="middle">3 EVI</text><text x="267" y="68" text-anchor="middle" class="svg-muted">l2vpn evpn inst</text>
<rect x="325" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="372" y="52" text-anchor="middle">4 VLAN-VNI</text><text x="372" y="68" text-anchor="middle" class="svg-muted">vlan configuration</text>
<rect x="430" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="477" y="52" text-anchor="middle">5 nve1</text><text x="477" y="68" text-anchor="middle" class="svg-muted">source + member</text>
<rect x="535" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="582" y="52" text-anchor="middle">6 Verify</text><text x="582" y="68" text-anchor="middle" class="svg-muted">ladder</text>
</g></svg><p class="cap">Do the steps in this order and verify after each.</p></div>

<h3>Steps 2 to 5 on LEAF1</h3>
<pre class="code"><span class="c">! Step 2: VLAN and host-facing port (H1)</span>
vlan 10
 name TENANT-A-WEB
interface GigabitEthernet1/0/5
 description H1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
<span class="c">! Step 3: global VXLAN replication and the EVPN instance used as the L2 segment</span>
l2vpn evpn
 replication-type static
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
<span class="c">! Step 4: map the VLAN to the VNI</span>
vlan configuration 10
 member evpn-instance 10 vni 10010
<span class="c">! Step 5: the VTEP</span>
interface nve1
 no ip address
 source-interface Loopback1
 member vni 10010 ingress-replication</pre>
<p>The peer addresses of the static list are 10.255.1.12 and 10.255.1.13 for LEAF1. The lab brief tells you how the platform wants the list entered; the principle is always the same: <b>each leaf lists every other leaf that has the VNI</b>.</p>

<h3>What is different on LEAF2 and LEAF3</h3>
<table class="cmp"><tr><th>Item</th><th>LEAF1</th><th>LEAF2</th><th>LEAF3</th></tr>
<tr><td>VTEP Lo1</td><td>10.255.1.11</td><td>10.255.1.12</td><td>10.255.1.13</td></tr>
<tr><td>VNIs</td><td>10010</td><td>10010, 10020</td><td>10020</td></tr>
<tr><td>Peers for VNI 10010</td><td>.12</td><td>.11</td><td>none</td></tr>
<tr><td>Peers for VNI 10020</td><td>none</td><td>.13</td><td>.12</td></tr>
</table>
<p>Notice that a leaf only lists peers that own the same VNI. LEAF3 has no VNI 10010, so LEAF1 and LEAF2 do not send VNI 10010 BUM to it.</p>

<div class="eg"><p><b>Worked example: adding H3 and H4's VLAN 20.</b> On LEAF2 add <code>vlan 20</code>, a host port for H3 in VLAN 20, <code>l2vpn evpn instance 20 vlan-based</code> with <code>encapsulation vxlan</code>, <code>vlan configuration 20</code> with <code>member evpn-instance 20 vni 10020</code>, and <code>member vni 10020 ingress-replication</code> under nve1. LEAF3 gets the same VNI 10020 with its own peer (10.255.1.12). Then H3 (10.10.20.13) and H4 (10.10.20.14) are neighbours in one L2 segment.</p></div>

<h3>Checking each step</h3>
<pre class="out">LEAF1# show vlan id 10
VLAN Name                             Status    Ports
10   TENANT-A-WEB                     active    Gi1/0/5
LEAF1# show l2vpn evpn evi
EVI   VLAN  Ether Tag  L2 VNI   Multicast   Pseudowire
10    10    0          <span class="hl">10010</span>      N/A         N/A
LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              <span class="hl">Up</span>         L2DP  10    CLI   N/A</pre>
<p>VNI state Up means the VNI is bound to an existing VLAN and nve1 is up. The mode L2DP says "Layer 2, learned from the data plane".</p>

<div class="warn"><p><b>Common mistake.</b> Creating the EVPN instance but forgetting <code>vlan configuration 10</code> / <code>member evpn-instance</code>. The EVI exists, but no VLAN is attached, so the VNI never comes up. Another one: <code>no shutdown</code> missing on nve1 after a template paste.</p></div>

<div class="exam"><p><b>Exam trap.</b> The VNI is configured in two places: the VLAN binding (what VLAN maps to what VNI) and nve1 (which VNIs this VTEP participates in, and how BUM is replicated). Both must exist.</p></div>

<div class="scn"><h4>Five minutes of copy-paste, two hours of search</h4><p>An engineer pasted LEAF1's config to LEAF2 and only changed the Lo1 address. H1 could not reach H2 afterwards. The pasted peer list contained LEAF2's own address (10.255.1.12) instead of LEAF1's. LEAF2 was replicating BUM to itself, and the VTEP count in the show output looked fine, so the fault hid for two hours.</p><p><b>Lesson:</b> after copy-paste, re-read every address line that identifies "me" versus "them".</p></div>

<div class="iv"><p class="q">"Walk me through the minimum configuration of a VXLAN leaf."</p><p>Strong answer: routed underlay with the VTEP loopback in OSPF, the VLAN on the access port, an EVPN instance with vxlan encapsulation, the VLAN-to-VNI binding in vlan configuration, and nve1 with the loopback as source plus the member VNI and replication list. Then verify with show nve vni and show nve peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, VLAN and port, EVI, VLAN-VNI binding, nve1, verify.</li>
<li>VNI is configured under vlan configuration and under nve1.</li>
<li>Peer lists only include leaves that have the same VNI.</li>
<li>Copy-paste errors usually hide in the "me versus them" address lines.</li>
</ul></div>
`,hi:`
<p>Leaf configure karna flat-pack furniture jodne jaisa hai: parts kam hote hain, lekin order matter karta hai, aur ek missing screw tab pata chalta hai jab aap baithte ho. Hum LEAF1 ko six steps mein banate hain aur phir dikhate hain ki baaki leaves par kya badalta hai. Har step ka apna check hai, isliye fault wahin pakda jaata hai jis step ne use banaya.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Six build steps">
<g font-size="12" class="svg-ink">
<rect x="10" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="57" y="52" text-anchor="middle">1 Underlay</text><text x="57" y="68" text-anchor="middle" class="svg-muted">OSPF + Lo1</text>
<rect x="115" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="162" y="52" text-anchor="middle">2 VLAN</text><text x="162" y="68" text-anchor="middle" class="svg-muted">+ host port</text>
<rect x="220" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="267" y="52" text-anchor="middle">3 EVI</text><text x="267" y="68" text-anchor="middle" class="svg-muted">l2vpn evpn inst</text>
<rect x="325" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="372" y="52" text-anchor="middle">4 VLAN-VNI</text><text x="372" y="68" text-anchor="middle" class="svg-muted">vlan configuration</text>
<rect x="430" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="477" y="52" text-anchor="middle">5 nve1</text><text x="477" y="68" text-anchor="middle" class="svg-muted">source + member</text>
<rect x="535" y="30" width="95" height="50" rx="6" fill="#bae6fd"/><text x="582" y="52" text-anchor="middle">6 Verify</text><text x="582" y="68" text-anchor="middle" class="svg-muted">ladder</text>
</g></svg><p class="cap">Steps isi order mein karo aur har ke baad verify karo.</p></div>

<h3>LEAF1 par steps 2 se 5</h3>
<pre class="code"><span class="c">! Step 2: VLAN aur host-facing port (H1)</span>
vlan 10
 name TENANT-A-WEB
interface GigabitEthernet1/0/5
 description H1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
<span class="c">! Step 3: global VXLAN replication aur L2 segment ke liye EVPN instance</span>
l2vpn evpn
 replication-type static
l2vpn evpn instance 10 vlan-based
 encapsulation vxlan
<span class="c">! Step 4: VLAN ko VNI se map karo</span>
vlan configuration 10
 member evpn-instance 10 vni 10010
<span class="c">! Step 5: VTEP</span>
interface nve1
 no ip address
 source-interface Loopback1
 member vni 10010 ingress-replication</pre>
<p>LEAF1 ke liye static list ke peer addresses 10.255.1.12 aur 10.255.1.13 hain. Lab brief batata hai ki platform list ko kis form mein enter karwana chahta hai; principle hamesha wahi hai: <b>har leaf un sab doosre leaves ko list karta hai jinke paas woh VNI hai</b>.</p>

<h3>LEAF2 aur LEAF3 par kya alag hai</h3>
<table class="cmp"><tr><th>Item</th><th>LEAF1</th><th>LEAF2</th><th>LEAF3</th></tr>
<tr><td>VTEP Lo1</td><td>10.255.1.11</td><td>10.255.1.12</td><td>10.255.1.13</td></tr>
<tr><td>VNIs</td><td>10010</td><td>10010, 10020</td><td>10020</td></tr>
<tr><td>VNI 10010 ke peers</td><td>.12</td><td>.11</td><td>none</td></tr>
<tr><td>VNI 10020 ke peers</td><td>none</td><td>.13</td><td>.12</td></tr>
</table>
<p>Dhyan do ki leaf sirf unhi peers ko list karta hai jinke paas same VNI hai. LEAF3 ke paas VNI 10010 nahi hai, isliye LEAF1 aur LEAF2 VNI 10010 ka BUM use nahi bhejte.</p>

<div class="eg"><p><b>Worked example: H3 aur H4 ka VLAN 20 jodna.</b> LEAF2 par <code>vlan 20</code>, H3 ke liye VLAN 20 mein host port, <code>encapsulation vxlan</code> ke saath <code>l2vpn evpn instance 20 vlan-based</code>, <code>member evpn-instance 20 vni 10020</code> ke saath <code>vlan configuration 20</code>, aur nve1 ke neeche <code>member vni 10020 ingress-replication</code> jodo. LEAF3 ko wahi VNI 10020 apne peer (10.255.1.12) ke saath milta hai. Phir H3 (10.10.20.13) aur H4 (10.10.20.14) ek hi L2 segment mein padosi hain.</p></div>

<h3>Har step ko check karna</h3>
<pre class="out">LEAF1# show vlan id 10
VLAN Name                             Status    Ports
10   TENANT-A-WEB                     active    Gi1/0/5
LEAF1# show l2vpn evpn evi
EVI   VLAN  Ether Tag  L2 VNI   Multicast   Pseudowire
10    10    0          <span class="hl">10010</span>      N/A         N/A
LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              <span class="hl">Up</span>         L2DP  10    CLI   N/A</pre>
<p>VNI state Up ka matlab hai VNI ek existing VLAN se bound hai aur nve1 up hai. Mode L2DP kehta hai "Layer 2, data plane se learned".</p>

<div class="warn"><p><b>Common galti.</b> EVPN instance bana dena lekin <code>vlan configuration 10</code> / <code>member evpn-instance</code> bhool jaana. EVI exist karta hai, lekin koi VLAN attach nahi hai, isliye VNI kabhi up nahi hota. Ek aur: template paste ke baad nve1 par <code>no shutdown</code> missing.</p></div>

<div class="exam"><p><b>Exam trap.</b> VNI do jagah configure hota hai: VLAN binding (kaunsa VLAN kaunse VNI se map hai) aur nve1 (yeh VTEP kin VNIs mein hai, aur BUM kaise replicate hota hai). Dono hone chahiye.</p></div>

<div class="scn"><h4>Paanch minute ka copy-paste, do ghante ki khoj</h4><p>Ek engineer ne LEAF1 ka config LEAF2 par paste kiya aur sirf Lo1 address badla. Uske baad H1 H2 tak nahi pahunch paya. Pasted peer list mein LEAF1 ki jagah LEAF2 ka apna address (10.255.1.12) tha. LEAF2 BUM ko khud ko replicate kar raha tha, aur show output mein VTEP count theek dikh raha tha, isliye fault do ghante chhipa raha.</p><p><b>Seekh:</b> copy-paste ke baad har address line dobara padho jo "main" aur "woh" ko identify karti hai.</p></div>

<div class="iv"><p class="q">"VXLAN leaf ka minimum configuration samjhao."</p><p>Strong answer: VTEP loopback OSPF mein ke saath routed underlay, access port par VLAN, vxlan encapsulation wala EVPN instance, vlan configuration mein VLAN-to-VNI binding, aur loopback source ke saath nve1 plus member VNI aur replication list. Phir show nve vni aur show nve peers se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: underlay, VLAN aur port, EVI, VLAN-VNI binding, nve1, verify.</li>
<li>VNI vlan configuration aur nve1 dono ke neeche configure hota hai.</li>
<li>Peer lists mein sirf wahi leaves jinke paas same VNI hai.</li>
<li>Copy-paste errors aksar "main versus woh" address lines mein chhupti hain.</li>
</ul></div>
`}};export{e as default};