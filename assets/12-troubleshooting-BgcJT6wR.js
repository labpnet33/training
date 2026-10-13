var e={id:`trouble`,h:{en:`Troubleshooting VXLAN BGP EVPN, layer by layer`,hi:`VXLAN BGP EVPN troubleshooting, layer by layer`},body:{en:`
<p>When a car will not start, a good mechanic does not replace the gearbox first. He checks fuel, then battery, then starter, then ignition, in order, because each depends on the one before. EVPN is the same: overlay routing depends on the L3VNI, which depends on imported routes, which depend on route targets, which depend on BGP sessions, which depend on the underlay. Work <b>bottom-up</b>, one layer at a time, and each command either clears a layer or points at the fault. This chapter gives you that order, the command for each step, and the faults the ticket labs (labs 4 and 5) contain.</p>

<h3>The seven-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="220" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay: loopbacks reachable, MTU 9216</text>
<rect x="50" y="185" width="540" height="30" rx="6" fill="#fde68a"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">2 BGP sessions Established (l2vpn evpn)</text>
<rect x="80" y="150" width="480" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">3 Routes received with RT and ENCAP:8</text>
<rect x="110" y="115" width="420" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">4 Routes imported (RT match)</text>
<rect x="140" y="80" width="360" height="30" rx="6" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">5 NVE: VNIs Up, peers CP</text>
<rect x="170" y="45" width="300" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="12">6 MAC/IP in L2RIB and ARP cache</text>
<rect x="200" y="10" width="240" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">7 L3: VRF, L3VNI, gateway</text>
</svg><p class="cap">Start at the bottom. A higher step can never work if a lower one is broken.</p></div>

<h4>Step 1: underlay</h4>
<pre class="code">LEAF1# ping 10.255.0.11 source 10.255.0.1
LEAF1# ping 10.254.0.2 source 10.254.0.1
LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 8972 df-bit</pre>
<p>Loopback0 must reach the spines' loopback0 (BGP) and loopback1 must reach the other VTEPs' loopback1 (VXLAN). The large ping with DF set proves the underlay carries jumbo frames: VXLAN adds 50 bytes, so a 1,500-byte host packet needs at least 1,550 bytes in the underlay; fabrics use 9216.</p>

<h4>Step 2: BGP sessions</h4>
<pre class="out">LEAF2# show bgp l2vpn evpn summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.11     4 65001      96      91       12    0    0 00:40:02 0
<span class="hl">10.255.0.12     4 65001       0       0        0    0    0 00:40:05 Active</span></pre>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>Typical causes</th></tr>
<tr><td>Idle</td><td>not trying</td><td>neighbor shut, no address family, feature missing, AS mismatch detected</td></tr>
<tr><td>Active / Connect</td><td>trying, TCP fails</td><td>missing update-source, wrong neighbor IP, peer not configured for us, no route to the loopback</td></tr>
<tr><td>A number</td><td>Established</td><td>that many prefixes accepted; 0 can still mean trouble (step 3)</td></tr>
</table>

<h4>Step 3: routes arrive with the right communities</h4>
<pre class="out">SPINE1# show bgp l2vpn evpn route-type 3
BGP routing table entry for [3]:[0]:[32]:[10.254.0.2]/88, version 31
    10.254.0.2 (metric 81) from 10.255.0.2 (10.255.0.2)
<span class="hl">      Origin IGP, MED not set, localpref 100, weight 0</span>
      PMSI Tunnel Attribute:
        flags: 0x00, Tunnel type: Ingress Replication
        Label: 10010, Tunnel Id: 10.254.0.2</pre>
<p>Right after the highlighted Origin line there should be an <code>Extcommunity: RT:... ENCAP:8</code> line. Its absence means the sender is missing <code>send-community extended</code>. Nobody can import such a route. Check it on every hop: leaf to spine and spine to leaf.</p>

<h4>Step 4: routes are imported</h4>
<p>In <code>show bgp l2vpn evpn</code>, a remote route that is imported appears a second time under your own RD tagged <code>(L2VNI 10010)</code> or <code>(L3VNI 50001)</code>. If it appears only under the remote RD, compare its RT with your import list: <code>show running-config | section evpn</code> for L2VNIs and <code>show running-config vrf TENANT-A</code> for the VRF (look for <code>route-target both auto evpn</code>).</p>

<h4>Step 5: NVE state</h4>
<pre class="code">show nve interface nve1 detail
show nve vni
show nve peers</pre>
<p>Expect the NVE Up with the right source-interface, every L2VNI <b>Up / CP / UnicastBGP</b>, every L3VNI <b>Up / L3 [VRF]</b>, and each remote VTEP listed with LearnType <b>CP</b>. A VNI in DP mode means <code>host-reachability protocol bgp</code> is missing; no peers despite imported type-3 routes points at the replication setting.</p>

<h4>Step 6: MAC and IP learning</h4>
<pre class="code">show mac address-table vlan 10
show l2route evpn mac all
show l2route evpn mac-ip all
show ip arp suppression-cache detail</pre>
<p>A local MAC should show producer <b>Local</b>; a remote one producer <b>BGP</b> with the remote VTEP as next hop. If a local MAC is missing, the problem is on the access side (VLAN, port, server). If a remote one is missing while its type-2 route exists, go back to step 4.</p>

<h4>Step 7: Layer 3</h4>
<pre class="code">show vrf
show ip route vrf TENANT-A
show running-config | include anycast-gateway-mac
show interface Vlan10</pre>
<p>Remote host routes should appear as <code>bgp-65001, internal ... segid: 50001 encap: VXLAN</code>. Check that the SVI is in the VRF, has <code>fabric forwarding mode anycast-gateway</code>, and that the anycast MAC is identical on every leaf.</p>

<h3>Fault library (the labs and real life)</h3>
<table class="cmp"><tr><th>Symptom</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>Session stuck in Active</td><td>neighbor block lacks update-source</td><td><code>update-source loopback0</code></td></tr>
<tr><td>Established, PfxRcd 0, no imports</td><td>no Extcommunity on routes</td><td><code>send-community extended</code> both ways</td></tr>
<tr><td>Routes visible, VNI empty</td><td>RT on route differs from import RT</td><td>correct RT or <code>route-target import auto</code></td></tr>
<tr><td>Leaf-to-leaf routes lost when one spine fails</td><td>other spine has no route-reflector-client</td><td>add RR client on that spine</td></tr>
<tr><td>Peers show DP</td><td>NVE lacks host-reachability</td><td><code>host-reachability protocol bgp</code></td></tr>
<tr><td>Same subnet works, routing fails</td><td>no L3 VNI in show nve vni</td><td><code>member vni 50001 associate-vrf</code></td></tr>
<tr><td>No BGP routes in VRF</td><td>VRF lacks evpn RT</td><td><code>route-target both auto evpn</code></td></tr>
<tr><td>Routing breaks after VM move</td><td>anycast MAC differs</td><td>same <code>anycast-gateway-mac</code> everywhere</td></tr>
<tr><td>Small pings OK, big transfers hang</td><td>large DF ping fails</td><td>underlay MTU 9216</td></tr>
</table>

<div class="eg"><p><b>Worked example: lab 4 in four commands.</b> On LEAF2, <code>show bgp l2vpn evpn summary</code> shows 10.255.0.12 <b>Active</b>: add update-source. Routes from LEAF1 arrive but nothing is imported: <code>show running-config | section evpn</code> shows <code>route-target import 65001:10099</code>: fix to auto. LEAF1 still learns nothing from LEAF2: <code>show bgp l2vpn evpn route-type 3</code> on SPINE1 shows LEAF2's route without Extcommunity: add <code>send-community extended</code> to both neighbors on LEAF2. Finally <code>show nve peers</code> on both leaves and a ping from SRV2 to SRV1 confirm the fix. Save.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Starting at the top ("the gateway is broken") and changing Layer-3 config while the real fault is a BGP session; clearing BGP sessions repeatedly hoping it helps; fixing only one of two leaves; forgetting to save after the fix.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Established with 0 prefixes" is not a session problem: think communities, RTs or a missing EVPN instance. "Active" is a session problem: think update-source, neighbor address, reachability.</p></div>

<div class="scn"><h4>NK-8820: tenant A cannot route between racks</h4><p>After a night change "LEAF1 VRF template cleanup, LEAF2 NVE re-applied, anycast MAC standardised", web in rack 1 could not reach db in rack 2, although both reached their own gateways. The on-call engineer followed the ladder: underlay and BGP fine; <code>show nve vni</code> on LEAF2 had no L3 VNI (associate-vrf lost when NVE was re-applied); LEAF1's VRF lacked <code>route-target both auto evpn</code>; and <code>show running-config | include anycast-gateway-mac</code> showed LEAF2 with 0000.2222.3334. Three separate faults, each found by one command. After fixing all three and letting each server ping its gateway, both leaves held the other rack's /32 via BGP and web reached db.</p><p><b>Lesson:</b> change windows often introduce several small faults. Keep going up the ladder after the first fix.</p></div>

<div class="iv"><p class="q">"Two hosts in the same VNI on different leaves cannot ping. Walk me through your troubleshooting."</p><p>Strong answer: bottom-up. Underlay: ping loopback1 to loopback1, including a jumbo DF ping. BGP: show bgp l2vpn evpn summary, interpret Idle/Active/number. Routes: check type-3 and type-2 routes exist with RT and ENCAP:8. Import: see the copy under the local L2VNI RD; compare RTs. NVE: show nve vni (CP, UnicastBGP) and show nve peers (CP). Learning: show l2route evpn mac all and the ARP suppression cache. Mention the typical faults for each layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot bottom-up: underlay, BGP, communities, import, NVE, MAC/IP, Layer 3.</li>
<li>Active = session cannot form; a number with 0 prefixes = routes or policy problem.</li>
<li>No Extcommunity = missing send-community extended; route only under remote RD = RT mismatch.</li>
<li>show nve vni and show nve peers must show CP; L3VNI must be Up as L3 [VRF].</li>
<li>After a change window, expect more than one fault and verify every layer.</li>
</ul></div>
`,hi:`
<p>Jab car start nahi hoti, achha mechanic pehle gearbox nahi badalta. Woh fuel, phir battery, phir starter, phir ignition check karta hai, order mein, kyunki har ek pichhle par depend karta hai. EVPN bhi aisa hi hai: overlay routing L3VNI par depend karti hai, jo imported routes par, jo route targets par, jo BGP sessions par, jo underlay par depend karte hain. <b>Neeche se upar</b> kaam karo, ek time par ek layer, aur har command ya to ek layer clear karta hai ya fault ki taraf ishaara karta hai. Yeh chapter aapko woh order, har step ka command, aur ticket labs (labs 4 aur 5) ke faults deta hai.</p>

<h3>Saat-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="220" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">1 Underlay: loopbacks reachable, MTU 9216</text>
<rect x="50" y="185" width="540" height="30" rx="6" fill="#fde68a"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">2 BGP sessions Established (l2vpn evpn)</text>
<rect x="80" y="150" width="480" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">3 Routes RT aur ENCAP:8 ke saath aaye</text>
<rect x="110" y="115" width="420" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">4 Routes import hue (RT match)</text>
<rect x="140" y="80" width="360" height="30" rx="6" fill="#bae6fd"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">5 NVE: VNIs Up, peers CP</text>
<rect x="170" y="45" width="300" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="12">6 L2RIB aur ARP cache mein MAC/IP</text>
<rect x="200" y="10" width="240" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">7 L3: VRF, L3VNI, gateway</text>
</svg><p class="cap">Neeche se shuru karo. Agar neeche wala step toota hai to upar wala kabhi kaam nahi karega.</p></div>

<h4>Step 1: underlay</h4>
<pre class="code">LEAF1# ping 10.255.0.11 source 10.255.0.1
LEAF1# ping 10.254.0.2 source 10.254.0.1
LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 8972 df-bit</pre>
<p>Loopback0 ko spines ke loopback0 tak pahunchna chahiye (BGP) aur loopback1 ko doosre VTEPs ke loopback1 tak (VXLAN). DF set wali badi ping saabit karti hai ki underlay jumbo frames le jaata hai: VXLAN 50 bytes jodta hai, isliye 1,500-byte host packet ko underlay mein kam se kam 1,550 bytes chahiye; fabrics 9216 use karte hain.</p>

<h4>Step 2: BGP sessions</h4>
<pre class="out">LEAF2# show bgp l2vpn evpn summary
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.255.0.11     4 65001      96      91       12    0    0 00:40:02 0
<span class="hl">10.255.0.12     4 65001       0       0        0    0    0 00:40:05 Active</span></pre>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Typical wajah</th></tr>
<tr><td>Idle</td><td>try nahi kar raha</td><td>neighbor shut, address family nahi, feature missing, AS mismatch detect hua</td></tr>
<tr><td>Active / Connect</td><td>try kar raha, TCP fail</td><td>update-source missing, galat neighbor IP, peer par hum configured nahi, loopback tak route nahi</td></tr>
<tr><td>Ek number</td><td>Established</td><td>itne prefixes accept hue; 0 ka matlab bhi problem ho sakta hai (step 3)</td></tr>
</table>

<h4>Step 3: routes sahi communities ke saath aate hain</h4>
<pre class="out">SPINE1# show bgp l2vpn evpn route-type 3
BGP routing table entry for [3]:[0]:[32]:[10.254.0.2]/88, version 31
    10.254.0.2 (metric 81) from 10.255.0.2 (10.255.0.2)
<span class="hl">      Origin IGP, MED not set, localpref 100, weight 0</span>
      PMSI Tunnel Attribute:
        flags: 0x00, Tunnel type: Ingress Replication
        Label: 10010, Tunnel Id: 10.254.0.2</pre>
<p>Highlighted Origin line ke theek baad <code>Extcommunity: RT:... ENCAP:8</code> line honi chahiye. Uska na hona matlab bhejne wale par <code>send-community extended</code> missing hai. Aisa route koi import nahi kar sakta. Har hop par check karo: leaf se spine aur spine se leaf.</p>

<h4>Step 4: routes import hote hain</h4>
<p><code>show bgp l2vpn evpn</code> mein import hua remote route aapke apne RD ke neeche doosri baar dikhta hai, <code>(L2VNI 10010)</code> ya <code>(L3VNI 50001)</code> tag ke saath. Agar sirf remote RD ke neeche dikhta hai, to uska RT apni import list se milao: L2VNIs ke liye <code>show running-config | section evpn</code> aur VRF ke liye <code>show running-config vrf TENANT-A</code> (<code>route-target both auto evpn</code> dhoondho).</p>

<h4>Step 5: NVE state</h4>
<pre class="code">show nve interface nve1 detail
show nve vni
show nve peers</pre>
<p>Expect karo: NVE Up sahi source-interface ke saath, har L2VNI <b>Up / CP / UnicastBGP</b>, har L3VNI <b>Up / L3 [VRF]</b>, aur har remote VTEP LearnType <b>CP</b> ke saath listed. DP mode wala VNI matlab <code>host-reachability protocol bgp</code> missing hai; imported type-3 routes ke bawajood peers nahi hain to replication setting ki taraf dekho.</p>

<h4>Step 6: MAC aur IP learning</h4>
<pre class="code">show mac address-table vlan 10
show l2route evpn mac all
show l2route evpn mac-ip all
show ip arp suppression-cache detail</pre>
<p>Local MAC ka producer <b>Local</b> dikhna chahiye; remote ka producer <b>BGP</b> aur next hop remote VTEP. Agar local MAC missing hai to problem access side par hai (VLAN, port, server). Agar remote missing hai jabki uska type-2 route hai, to step 4 par wapas jao.</p>

<h4>Step 7: Layer 3</h4>
<pre class="code">show vrf
show ip route vrf TENANT-A
show running-config | include anycast-gateway-mac
show interface Vlan10</pre>
<p>Remote host routes <code>bgp-65001, internal ... segid: 50001 encap: VXLAN</code> ki tarah dikhne chahiye. Check karo ki SVI VRF mein hai, uspar <code>fabric forwarding mode anycast-gateway</code> hai, aur anycast MAC har leaf par same hai.</p>

<h3>Fault library (labs aur real life)</h3>
<table class="cmp"><tr><th>Symptom</th><th>Saboot</th><th>Fix</th></tr>
<tr><td>Session Active mein atka</td><td>neighbor block mein update-source nahi</td><td><code>update-source loopback0</code></td></tr>
<tr><td>Established, PfxRcd 0, koi import nahi</td><td>routes par Extcommunity nahi</td><td>dono taraf <code>send-community extended</code></td></tr>
<tr><td>Routes dikhte hain, VNI khaali</td><td>route ka RT import RT se alag</td><td>sahi RT ya <code>route-target import auto</code></td></tr>
<tr><td>Ek spine fail hone par leaf-to-leaf routes gayab</td><td>doosre spine par route-reflector-client nahi</td><td>us spine par RR client jodo</td></tr>
<tr><td>Peers DP dikhate hain</td><td>NVE mein host-reachability nahi</td><td><code>host-reachability protocol bgp</code></td></tr>
<tr><td>Same subnet chalta hai, routing fail</td><td>show nve vni mein L3 VNI nahi</td><td><code>member vni 50001 associate-vrf</code></td></tr>
<tr><td>VRF mein BGP routes nahi</td><td>VRF mein evpn RT nahi</td><td><code>route-target both auto evpn</code></td></tr>
<tr><td>VM move ke baad routing toot-ti hai</td><td>anycast MAC alag</td><td>har jagah same <code>anycast-gateway-mac</code></td></tr>
<tr><td>Chhoti pings OK, bade transfers atakte hain</td><td>badi DF ping fail</td><td>underlay MTU 9216</td></tr>
</table>

<div class="eg"><p><b>Worked example: lab 4 chaar commands mein.</b> LEAF2 par <code>show bgp l2vpn evpn summary</code> 10.255.0.12 ko <b>Active</b> dikhata hai: update-source jodo. LEAF1 ke routes aate hain par kuch import nahi hota: <code>show running-config | section evpn</code> mein <code>route-target import 65001:10099</code> hai: auto par theek karo. LEAF1 abhi bhi LEAF2 se kuch nahi seekhta: SPINE1 par <code>show bgp l2vpn evpn route-type 3</code> LEAF2 ka route bina Extcommunity ke dikhata hai: LEAF2 par dono neighbors mein <code>send-community extended</code> jodo. Aakhir mein dono leaves par <code>show nve peers</code> aur SRV2 se SRV1 tak ping fix confirm karte hain. Save karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Upar se shuru karna ("gateway toota hai") aur Layer-3 config badalna jabki asli fault BGP session mein hai; is ummeed mein baar baar BGP sessions clear karna ki kuch ho jaayega; do mein se sirf ek leaf theek karna; fix ke baad save karna bhoolna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Established with 0 prefixes" session problem nahi hai: communities, RTs ya missing EVPN instance socho. "Active" session problem hai: update-source, neighbor address, reachability socho.</p></div>

<div class="scn"><h4>NK-8820: tenant A racks ke beech route nahi kar pata</h4><p>Raat ke change "LEAF1 VRF template cleanup, LEAF2 NVE re-applied, anycast MAC standardised" ke baad rack 1 ka web rack 2 ke db tak nahi pahunch paa raha tha, jabki dono apne gateways tak pahunch rahe the. On-call engineer ne ladder follow kiya: underlay aur BGP theek; LEAF2 par <code>show nve vni</code> mein koi L3 VNI nahi tha (NVE re-apply hone par associate-vrf kho gaya); LEAF1 ke VRF mein <code>route-target both auto evpn</code> nahi tha; aur <code>show running-config | include anycast-gateway-mac</code> ne LEAF2 par 0000.2222.3334 dikhaya. Teen alag faults, har ek ek command se mila. Teeno theek karne aur har server ko apna gateway ping karne dene ke baad, dono leaves ke paas BGP se doosre rack ka /32 tha aur web db tak pahunch gaya.</p><p><b>Seekh:</b> change windows aksar kai chhote faults laati hain. Pehle fix ke baad bhi ladder par upar chadhte raho.</p></div>

<div class="iv"><p class="q">"Alag leaves par same VNI ke do hosts ping nahi kar paa rahe. Apna troubleshooting batao."</p><p>Strong answer: neeche se upar. Underlay: loopback1 se loopback1 ping, jumbo DF ping ke saath. BGP: show bgp l2vpn evpn summary, Idle/Active/number samjho. Routes: check karo type-3 aur type-2 routes RT aur ENCAP:8 ke saath hain. Import: local L2VNI RD ke neeche copy dekho; RTs milao. NVE: show nve vni (CP, UnicastBGP) aur show nve peers (CP). Learning: show l2route evpn mac all aur ARP suppression cache. Har layer ke typical faults batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar troubleshoot karo: underlay, BGP, communities, import, NVE, MAC/IP, Layer 3.</li>
<li>Active = session ban nahi raha; 0 prefixes wala number = routes ya policy problem.</li>
<li>Extcommunity nahi = send-community extended missing; route sirf remote RD ke neeche = RT mismatch.</li>
<li>show nve vni aur show nve peers mein CP dikhna chahiye; L3VNI L3 [VRF] ki tarah Up ho.</li>
<li>Change window ke baad ek se zyada fault expect karo aur har layer verify karo.</li>
</ul></div>
`}};export{e as default};