var e={id:`verify`,h:{en:`The verification ladder: from underlay to MAC table`,hi:`Verification ladder: underlay se MAC table tak`},body:{en:`
<p>A doctor does not start with surgery; she checks pulse, temperature and blood pressure in a fixed order, and the first abnormal reading tells her where to look. Network engineers need the same habit. For VXLAN the "vital signs" form a ladder with five rungs. You climb from the bottom, and the first rung that fails is where the fault lives.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Verification ladder">
<g font-size="12" class="svg-ink">
<rect x="150" y="10" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle">5  show mac address-table : remote MACs behind Nv1(peer)</text>
<rect x="130" y="52" width="380" height="34" rx="6" fill="#fde68a"/><text x="320" y="74" text-anchor="middle">4  show nve peers : peer UP, type data-plane</text>
<rect x="110" y="94" width="420" height="34" rx="6" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle">3  show nve vni : VNI Up, correct VLAN</text>
<rect x="90" y="136" width="460" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle">2  show nve interface nve1 : Oper Up, right source address</text>
<rect x="70" y="178" width="500" height="34" rx="6" fill="#bae6fd"/><text x="320" y="200" text-anchor="middle">1  underlay : OSPF FULL, remote Lo1 route, big DF-bit ping</text>
</g></svg><p class="cap">Climb from rung 1 up. Stop at the first failure.</p></div>

<h3>Rung by rung, in a healthy fabric</h3>
<pre class="out">LEAF1# show nve interface nve1
Interface: nve1, State: Admin Up, Oper Up, Encapsulation: Vxlan,
 BGP host reachability: Disabled, VxLAN dport: 4789
 VNI number: L2CP 0 L3CP 0 L2DP 1 L3DP 0
 source-interface: Loopback1 (primary: 10.255.1.11 vrf: 0)

LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              Up         L2DP  10    CLI   N/A

LEAF1# show nve peers
Interface  VNI      Type Peer-IP          RMAC/Num_RTs   eVNI     state flags UP time
nve1       10010    L2DP 10.255.1.12      0              10010    UP    N/A   00:21:07

LEAF1# show mac address-table vlan 10
  10    0050.56aa.0001    DYNAMIC     Gi1/0/5
  10    0050.56aa.0002    DYNAMIC     Nv1(10.255.1.12)</pre>

<h3>What each rung tells you</h3>
<table class="cmp"><tr><th>Rung</th><th>If it fails</th><th>Likely cause</th></tr>
<tr><td>1 Underlay</td><td>no route to remote Lo1, or large ping fails</td><td>Lo1 not in OSPF, link down, MTU</td></tr>
<tr><td>2 nve1</td><td>Oper Down, no or wrong source address</td><td>source-interface down, wrong interface, shutdown</td></tr>
<tr><td>3 VNI</td><td>VNI state Down or VNI missing</td><td>no VLAN bound, VNI typo, VLAN does not exist</td></tr>
<tr><td>4 Peers</td><td>peer missing</td><td>peer list incomplete, remote has no such VNI</td></tr>
<tr><td>5 MACs</td><td>remote MAC missing</td><td>no traffic yet, ARP did not cross, one-way list</td></tr>
</table>

<div class="eg"><p><b>Worked example: reading one wrong line.</b> LEAF2 shows <code>show nve vni</code> with VNI 10001 in state Down on VLAN 10, while LEAF1 shows 10010 Up. The ladder stops at rung 3 on LEAF2: the VNI typed on LEAF2 is 10001. No point examining MAC tables yet. Fix the VNI under <code>vlan configuration 10</code> and <code>nve1</code>, then continue up.</p></div>

<h3>Counters tell whether traffic really flows</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
 ...
 Pkts In   Bytes In   Pkts Out  Bytes Out
 <span class="hl">412</span>       51200      <span class="hl">398</span>      49100</pre>
<p>If "Pkts Out" climbs while "Pkts In" stays at zero, you encapsulate but nothing returns: the remote leaf drops or never receives the packets. If both are zero while pings run, traffic never enters the tunnel, which points back to the VLAN, VNI binding or MAC table.</p>

<div class="warn"><p><b>Common mistake.</b> Starting at rung 5. Engineers see "no remote MAC" and clear tables, restart ARP and reboot hosts, when rung 1 would have shown a missing loopback route in ten seconds.</p></div>

<div class="exam"><p><b>Exam trap.</b> A peer being UP does not prove a specific VNI works. Peers are per VNI in the output: check that the peer line lists the VNI you care about.</p></div>

<div class="scn"><h4>Everything green except one row</h4><p>A weekend change window ended with all dashboards green, but the monitoring VLAN 20 on LEAF3 was unreachable. The ladder showed VNI 10020 Up on LEAF3 and peer 10.255.1.12 UP, yet LEAF2 had no peer entry for LEAF3 on VNI 10020. LEAF2's peer list for VNI 10020 had been left empty during the change. After adding 10.255.1.13, the peer appeared and the MACs followed.</p><p><b>Lesson:</b> check peers in both directions and per VNI.</p></div>

<div class="iv"><p class="q">"How do you verify a VXLAN deployment in order?"</p><p>Strong answer: underlay first (OSPF neighbors, route and large DF-bit ping between VTEP loopbacks), then nve1 state and source address, then VNI state and VLAN mapping, then peers per VNI, then the MAC table and counters. Say that you stop at the first failing rung.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five rungs: underlay, nve1, VNI, peers, MACs.</li>
<li>First failure = location of the fault.</li>
<li>Peers are per VNI and must be seen from both ends.</li>
<li>Counters (Pkts In and Out) show whether the tunnel carries traffic.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti; woh pulse, temperature aur blood pressure fixed order mein check karti hai, aur pehla abnormal reading batata hai ki kahan dekhna hai. Network engineers ko bhi wahi aadat chahiye. VXLAN ke "vital signs" paanch rungs ki ladder banate hain. Aap neeche se chadhte ho, aur jo pehla rung fail ho wahin fault hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Verification ladder">
<g font-size="12" class="svg-ink">
<rect x="150" y="10" width="340" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle">5  show mac address-table : Nv1(peer) ke peeche remote MACs</text>
<rect x="130" y="52" width="380" height="34" rx="6" fill="#fde68a"/><text x="320" y="74" text-anchor="middle">4  show nve peers : peer UP, type data-plane</text>
<rect x="110" y="94" width="420" height="34" rx="6" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle">3  show nve vni : VNI Up, sahi VLAN</text>
<rect x="90" y="136" width="460" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle">2  show nve interface nve1 : Oper Up, sahi source address</text>
<rect x="70" y="178" width="500" height="34" rx="6" fill="#bae6fd"/><text x="320" y="200" text-anchor="middle">1  underlay : OSPF FULL, remote Lo1 route, bada DF-bit ping</text>
</g></svg><p class="cap">Rung 1 se upar chadho. Pehli failure par ruk jao.</p></div>

<h3>Healthy fabric mein rung by rung</h3>
<pre class="out">LEAF1# show nve interface nve1
Interface: nve1, State: Admin Up, Oper Up, Encapsulation: Vxlan,
 BGP host reachability: Disabled, VxLAN dport: 4789
 VNI number: L2CP 0 L3CP 0 L2DP 1 L3DP 0
 source-interface: Loopback1 (primary: 10.255.1.11 vrf: 0)

LEAF1# show nve vni
Interface  VNI        Multicast-group  VNI state  Mode  VLAN  cfg vrf
nve1       10010      N/A              Up         L2DP  10    CLI   N/A

LEAF1# show nve peers
Interface  VNI      Type Peer-IP          RMAC/Num_RTs   eVNI     state flags UP time
nve1       10010    L2DP 10.255.1.12      0              10010    UP    N/A   00:21:07

LEAF1# show mac address-table vlan 10
  10    0050.56aa.0001    DYNAMIC     Gi1/0/5
  10    0050.56aa.0002    DYNAMIC     Nv1(10.255.1.12)</pre>

<h3>Har rung kya batata hai</h3>
<table class="cmp"><tr><th>Rung</th><th>Fail ho to</th><th>Likely cause</th></tr>
<tr><td>1 Underlay</td><td>remote Lo1 ka route nahi, ya bada ping fail</td><td>Lo1 OSPF mein nahi, link down, MTU</td></tr>
<tr><td>2 nve1</td><td>Oper Down, source address nahi ya galat</td><td>source-interface down, galat interface, shutdown</td></tr>
<tr><td>3 VNI</td><td>VNI state Down ya VNI missing</td><td>VLAN bound nahi, VNI typo, VLAN exist nahi karta</td></tr>
<tr><td>4 Peers</td><td>peer missing</td><td>peer list adhoori, remote ke paas woh VNI nahi</td></tr>
<tr><td>5 MACs</td><td>remote MAC missing</td><td>abhi traffic nahi, ARP cross nahi hua, one-way list</td></tr>
</table>

<div class="eg"><p><b>Worked example: ek galat line padhna.</b> LEAF2 par <code>show nve vni</code> mein VNI 10001 VLAN 10 par Down dikhta hai, jabki LEAF1 par 10010 Up hai. Ladder LEAF2 par rung 3 par rukti hai: LEAF2 par type kiya VNI 10001 hai. Abhi MAC tables dekhne ka koi fayda nahi. <code>vlan configuration 10</code> aur <code>nve1</code> ke neeche VNI theek karo, phir upar badho.</p></div>

<h3>Counters batate hain ki traffic sach mein flow ho raha hai</h3>
<pre class="out">LEAF1# show nve interface nve1 detail
 ...
 Pkts In   Bytes In   Pkts Out  Bytes Out
 <span class="hl">412</span>       51200      <span class="hl">398</span>      49100</pre>
<p>Agar "Pkts Out" badhta hai aur "Pkts In" zero rehta hai, to aap encapsulate kar rahe ho lekin kuch wapas nahi aa raha: remote leaf drop karta hai ya packets receive hi nahi karta. Agar pings chalte waqt dono zero hain, to traffic tunnel mein enter hi nahi hota, jo VLAN, VNI binding ya MAC table ki taraf point karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Rung 5 se shuru karna. Engineers "no remote MAC" dekh kar tables clear karte hain, ARP restart karte hain aur hosts reboot karte hain, jabki rung 1 das second mein missing loopback route dikha deta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Peer ka UP hona yeh prove nahi karta ki koi specific VNI kaam karta hai. Output mein peers per VNI hote hain: check karo ki peer line mein woh VNI hai jo aapko chahiye.</p></div>

<div class="scn"><h4>Sab green sirf ek row ko chhodkar</h4><p>Weekend change window ke baad saare dashboards green the, lekin LEAF3 ka monitoring VLAN 20 unreachable tha. Ladder ne LEAF3 par VNI 10020 Up aur peer 10.255.1.12 UP dikhaya, phir bhi LEAF2 ke paas VNI 10020 par LEAF3 ki peer entry nahi thi. Change ke dauraan LEAF2 ki VNI 10020 peer list khaali chhod di gayi thi. 10.255.1.13 jodne ke baad peer aaya aur MACs peeche-peeche aaye.</p><p><b>Seekh:</b> peers dono directions mein aur per VNI check karo.</p></div>

<div class="iv"><p class="q">"VXLAN deployment ko order mein verify kaise karte ho?"</p><p>Strong answer: pehle underlay (OSPF neighbors, VTEP loopbacks ke beech route aur bada DF-bit ping), phir nve1 state aur source address, phir VNI state aur VLAN mapping, phir per VNI peers, phir MAC table aur counters. Kaho ki aap pehle failing rung par ruk jaate ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch rungs: underlay, nve1, VNI, peers, MACs.</li>
<li>Pehli failure = fault ki location.</li>
<li>Peers per VNI hote hain aur dono ends se dikhne chahiye.</li>
<li>Counters (Pkts In aur Out) batate hain ki tunnel traffic carry kar raha hai ya nahi.</li>
</ul></div>
`}};export{e as default};