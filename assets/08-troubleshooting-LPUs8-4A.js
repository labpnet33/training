var e={id:`troubleshooting`,h:{en:`Troubleshooting an EVPN-VXLAN fabric from the bottom up`,hi:`EVPN-VXLAN fabric ko neeche se upar troubleshoot karna`},body:{en:`
<p>An EVPN fabric fails in layers, and the fastest engineers test the layers in order. A host that cannot reach its partner on another leaf is only a symptom. The cause can be the underlay, the BGP session, the route import, the VNI list or the data plane. This chapter gives a fixed order and then walks a real ticket from the simulator. Every output below was captured from the troubleshooting lab (pod 50, AS 65050), and long outputs are marked as trimmed.</p>

<h3>The five-step workflow</h3>
<table class="cmp"><tr><th>Step</th><th>Question</th><th>Command</th></tr>
<tr><td>1. Underlay</td><td>Can loopbacks reach each other?</td><td><code>show ospf neighbor</code>, <code>ping 10.50.255.12 source 10.50.255.11</code></td></tr>
<tr><td>2. Session</td><td>Is IBGP established with family evpn?</td><td><code>show bgp summary</code></td></tr>
<tr><td>3. Routes</td><td>Are routes received <i>and accepted</i>?</td><td><code>show bgp summary</code>, <code>show route table bgp.evpn.0</code></td></tr>
<tr><td>4. VNIs and tunnels</td><td>Is every VNI advertised and is the remote VTEP known?</td><td><code>show evpn instance extensive</code>, <code>show ethernet-switching vxlan-tunnel-end-point remote</code></td></tr>
<tr><td>5. Data plane</td><td>Is the MAC learned and is UDP 4789 allowed?</td><td><code>show ethernet-switching table</code>, <code>show evpn database</code>, ping</td></tr></table>
<p>Never skip down the list. A missing type-2 route is useless to investigate if the BGP session is down.</p>

<h3>The ticket</h3>
<div class="scn"><h4>Hyderabad: sessions up, nothing reachable</h4><p>The SALES VLAN (VNI 1010, PC1 and PC2) and the OPS VLAN (VNI 1020, PC3 and PC4) must stretch between LEAF1 and LEAF2. The BGP sessions are up, yet no host reaches its partner. A colleague changed LEAF2 last night and LEAF1 was built from an old template.</p></div>

<h3>Step 1 and 2: underlay and session look fine</h3>
<pre class="code">LEAF1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.50.0.0        ge-0/0/0.0             Full            10.50.255.1      128    34</pre>
<p>OSPF is Full, so the underlay is not the problem. Now the overlay session.</p>
<pre class="code">LEAF1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.1           65050          2          2       0       0        0:08 Establ
  bgp.evpn.0: 0/6/0/0
  default-switch.evpn.0: 0/0/0/0
<span class="c">(output trimmed)</span></pre>

<h3>Step 3: received, but not accepted</h3>
<p>Read the counters as <code>active / received / accepted / damped</code>. LEAF1 received <b>6</b> EVPN routes but accepted <b>0</b>. The session is fine, the routes arrive, and something throws them away on import. In EVPN the import policy is the route target, so the first suspect is a mismatch of <code>vrf-target</code>.</p>
<pre class="code">LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
Logical System Name       Id  SVTEP-IP         IFL   L3-Idx    SVTEP-Mode
&lt;default&gt;                 0   10.50.255.11     lo0.0 0
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags</pre>
<p>The remote VTEP list is empty: no accepted type-3 route, so no tunnel to LEAF2. Compare the two leaves, and use the commit history for the "what changed" question.</p>
<pre class="code">LEAF2&gt; show system commit
0   (timestamp removed) by root via other
    align targets with DC2
1   (timestamp removed) by root via other

LEAF1&gt; show configuration switch-options
vtep-source-interface lo0.0;
route-distinguisher 10.50.255.11:1;
vrf-target target:65050:1;

LEAF2&gt; show configuration switch-options
vtep-source-interface lo0.0;
route-distinguisher 10.50.255.12:1;
vrf-target target:65050:10;

LEAF2&gt; show configuration | compare rollback 1
[edit switch-options]
-   vrf-target target:65050:1;
+   vrf-target target:65050:10;</pre>
<p>LEAF2 now exports <code>target:65050:10</code>, while LEAF1 imports only <code>target:65050:1</code>. The commit message "align targets with DC2" explains the human story. The fix is to restore the original value, then check that the routes are accepted.</p>
<pre class="code">LEAF2# set switch-options vrf-target target:65050:1
LEAF2# commit and-quit
commit complete

LEAF1&gt; show bgp summary
  bgp.evpn.0: 6/6/6/0
  default-switch.evpn.0: 6/6/6/0
<span class="c">(output trimmed)</span>

PC1&gt; ping 10.50.10.22
84 bytes from 10.50.10.22 icmp_seq=1 ttl=64 time=0.500 ms
<span class="c">(5 replies, output trimmed)</span></pre>
<p>Now accepted equals received (6/6/6) and the SALES hosts talk. But the ticket said <b>both</b> VLANs. PC3 still fails, so look deeper.</p>

<h3>Step 4: one VNI is not advertised</h3>
<pre class="code">LEAF1&gt; show evpn instance extensive
  Number of bridge domains: 1
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010
  VNIs not in extended-vni-list (not advertised): 1020
<span class="c">(output trimmed)</span>

PC3&gt; ping 10.50.20.32
host (10.50.20.32) not reachable</pre>
<p>Only one bridge domain is active, and the output itself names the problem: VNI 1020 is configured on the VLAN but missing from <code>extended-vni-list</code>, so LEAF1 neither advertises nor accepts it. This is the "old template" fault.</p>
<pre class="code">LEAF1# set protocols evpn extended-vni-list 1020
LEAF1# commit and-quit
commit complete

PC3&gt; ping 10.50.20.32
84 bytes from 10.50.20.32 icmp_seq=1 ttl=64 time=0.500 ms
<span class="c">(5 replies, output trimmed)</span>

LEAF1&gt; show evpn database
VLAN  DomainId  MAC address        Active source                  IP address
      1010      00:50:7f:06:6d:01  ge-0/0/2.0                     10.50.10.21
      1010      00:50:80:06:6e:01  10.50.255.12                   10.50.10.22
      1020      00:50:7a:06:65:01  10.50.255.12                   10.50.20.32
      1020      00:50:81:06:70:01  ge-0/0/3.0                     10.50.20.31
<span class="c">(timestamp column removed)</span></pre>
<p>Both VNIs now have a local MAC (a port) and a remote MAC (the address of LEAF2's loopback). The fabric is healthy.</p>

<h3>Step 5: the data plane when the control plane is clean</h3>
<p>If all routes are accepted and the VTEP is known but traffic still fails, VXLAN itself is the suspect. The simulator does not model MTU, so treat these as concepts: VXLAN adds about 50 bytes of overhead, so the underlay MTU must exceed the host MTU by that much or large packets drop while pings still work. Filters on loopbacks or fabric links must permit <b>UDP port 4789</b>. Underlay loops or asymmetric ECMP can produce intermittent loss that no EVPN command explains.</p>

<div class="eg"><p><b>Worked example.</b> Match the symptom to the layer. (a) OSPF neighbor missing: underlay. (b) BGP state Active: reachability from lo0 or a missing local-address. (c) Established but 0 accepted of N received: route target mismatch. (d) Accepted, but one VNI has no tunnel or routes: that VNI is missing from the extended-vni-list. (e) Ping of 64 bytes works but large transfers hang: underlay MTU.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Judging health from the session state alone. (2) Reading only the <i>received</i> counter and missing that accepted is zero. (3) Fixing the data plane before the control plane. (4) Changing both ends at once, which hides which change fixed the fault. Use <code>show configuration | compare rollback 1</code> to prove what you changed.</p></div>
<div class="exam"><p><b>Exam trap.</b> "BGP is Established, so the control plane is fine" is wrong. Established with accepted zero means an import problem, usually the route target. Another trap: the one-sided extended-vni-list. Each leaf needs the VNI in its own list.</p></div>

<div class="iv"><p class="q">"Your EVPN session is up but hosts on two leaves cannot talk. How do you proceed?"</p><p>I go bottom-up. I check OSPF and loopback pings, then the session and the accepted counter in <code>show bgp summary</code>. If routes are received but not accepted I compare the vrf-target on both leaves. If the remote VTEP is missing I look at the tunnel list, and if only one VNI fails I check <code>show evpn instance extensive</code> for VNIs not in the extended-vni-list. Last I check MTU, UDP 4789 and the MAC tables.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Test in order: underlay, session, accepted routes, VNIs and tunnels, data plane.</li>
<li>The counter format is active/received/accepted/damped; received without accepted means a policy or target mismatch.</li>
<li>An empty remote VTEP list means no accepted type-3 route.</li>
<li>"VNIs not in extended-vni-list (not advertised)" names a missing VNI exactly.</li>
<li>Prove changes with show system commit and compare rollback 1.</li>
</ul></div>
`,hi:`
<p>EVPN fabric layers mein fail hota hai, aur tez engineers layers ko order mein test karte hain. Jo host doosre leaf par apne partner tak nahi pahunch pa raha woh sirf symptom hai. Karan underlay, BGP session, route import, VNI list ya data plane ho sakta hai. Yeh chapter ek fixed order deta hai aur phir simulator ka ek real ticket chalata hai. Neeche ka har output troubleshooting lab (pod 50, AS 65050) se capture kiya gaya hai, aur lambe outputs ko trimmed mark kiya hai.</p>

<h3>Paanch-step workflow</h3>
<table class="cmp"><tr><th>Step</th><th>Sawaal</th><th>Command</th></tr>
<tr><td>1. Underlay</td><td>Kya loopbacks ek doosre tak pahunchte hain?</td><td><code>show ospf neighbor</code>, <code>ping 10.50.255.12 source 10.50.255.11</code></td></tr>
<tr><td>2. Session</td><td>Kya family evpn ke saath IBGP established hai?</td><td><code>show bgp summary</code></td></tr>
<tr><td>3. Routes</td><td>Kya routes received <i>aur accepted</i> hain?</td><td><code>show bgp summary</code>, <code>show route table bgp.evpn.0</code></td></tr>
<tr><td>4. VNIs aur tunnels</td><td>Kya har VNI advertise ho raha hai aur remote VTEP pata hai?</td><td><code>show evpn instance extensive</code>, <code>show ethernet-switching vxlan-tunnel-end-point remote</code></td></tr>
<tr><td>5. Data plane</td><td>Kya MAC seekha gaya aur UDP 4789 allowed hai?</td><td><code>show ethernet-switching table</code>, <code>show evpn database</code>, ping</td></tr></table>
<p>List mein kabhi skip mat karo. Agar BGP session down hai to missing type-2 route investigate karna bekaar hai.</p>

<h3>Ticket</h3>
<div class="scn"><h4>Hyderabad: sessions up, kuch reachable nahi</h4><p>SALES VLAN (VNI 1010, PC1 aur PC2) aur OPS VLAN (VNI 1020, PC3 aur PC4) ko LEAF1 aur LEAF2 ke beech stretch hona chahiye. BGP sessions up hain, phir bhi koi host apne partner tak nahi pahunchta. Kal raat ek colleague ne LEAF2 badla aur LEAF1 ek purane template se bana tha.</p></div>

<h3>Step 1 aur 2: underlay aur session theek dikhte hain</h3>
<pre class="code">LEAF1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.50.0.0        ge-0/0/0.0             Full            10.50.255.1      128    34</pre>
<p>OSPF Full hai, isliye underlay samasya nahi hai. Ab overlay session.</p>
<pre class="code">LEAF1&gt; show bgp summary
Peer                     AS      InPkt     OutPkt    OutQ   Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
10.50.255.1           65050          2          2       0       0        0:08 Establ
  bgp.evpn.0: 0/6/0/0
  default-switch.evpn.0: 0/0/0/0
<span class="c">(output trimmed)</span></pre>

<h3>Step 3: received, par accepted nahi</h3>
<p>Counters ko <code>active / received / accepted / damped</code> ki tarah padho. LEAF1 ne <b>6</b> EVPN routes receive kiye par <b>0</b> accept kiye. Session theek hai, routes aa rahe hain, aur import par koi unhe fenk raha hai. EVPN mein import policy route target hota hai, isliye pehla shak <code>vrf-target</code> mismatch par jaata hai.</p>
<pre class="code">LEAF1&gt; show ethernet-switching vxlan-tunnel-end-point remote
Logical System Name       Id  SVTEP-IP         IFL   L3-Idx    SVTEP-Mode
&lt;default&gt;                 0   10.50.255.11     lo0.0 0
 RVTEP-IP         IFL-Idx   Interface    NH-Id   RVTEP-Mode  Flags</pre>
<p>Remote VTEP list khali hai: koi accepted type-3 route nahi, isliye LEAF2 tak tunnel nahi. Dono leaves ko compare karo, aur "kya badla" ke liye commit history use karo.</p>
<pre class="code">LEAF2&gt; show system commit
0   (timestamp removed) by root via other
    align targets with DC2
1   (timestamp removed) by root via other

LEAF1&gt; show configuration switch-options
vtep-source-interface lo0.0;
route-distinguisher 10.50.255.11:1;
vrf-target target:65050:1;

LEAF2&gt; show configuration switch-options
vtep-source-interface lo0.0;
route-distinguisher 10.50.255.12:1;
vrf-target target:65050:10;

LEAF2&gt; show configuration | compare rollback 1
[edit switch-options]
-   vrf-target target:65050:1;
+   vrf-target target:65050:10;</pre>
<p>LEAF2 ab <code>target:65050:10</code> export karta hai, jabki LEAF1 sirf <code>target:65050:1</code> import karta hai. Commit message "align targets with DC2" insaani kahani batata hai. Fix: original value wapas karo, phir check karo ki routes accept hue.</p>
<pre class="code">LEAF2# set switch-options vrf-target target:65050:1
LEAF2# commit and-quit
commit complete

LEAF1&gt; show bgp summary
  bgp.evpn.0: 6/6/6/0
  default-switch.evpn.0: 6/6/6/0
<span class="c">(output trimmed)</span>

PC1&gt; ping 10.50.10.22
84 bytes from 10.50.10.22 icmp_seq=1 ttl=64 time=0.500 ms
<span class="c">(5 replies, output trimmed)</span></pre>
<p>Ab accepted received ke barabar (6/6/6) hai aur SALES hosts baat karte hain. Par ticket mein <b>dono</b> VLANs the. PC3 abhi bhi fail hai, isliye aur gehra dekho.</p>

<h3>Step 4: ek VNI advertise nahi ho raha</h3>
<pre class="code">LEAF1&gt; show evpn instance extensive
  Number of bridge domains: 1
    VLAN  Domain-ID Intfs/up    IRB-intf  Mode             MAC-sync  IM-label  MAC-label
    10    1010      1  1                  Extended         Enabled   1010
  VNIs not in extended-vni-list (not advertised): 1020
<span class="c">(output trimmed)</span>

PC3&gt; ping 10.50.20.32
host (10.50.20.32) not reachable</pre>
<p>Sirf ek bridge domain active hai, aur output khud samasya batata hai: VNI 1020 VLAN par configured hai par <code>extended-vni-list</code> mein nahi, isliye LEAF1 usey na advertise karta hai na accept. Yeh "purane template" ka fault hai.</p>
<pre class="code">LEAF1# set protocols evpn extended-vni-list 1020
LEAF1# commit and-quit
commit complete

PC3&gt; ping 10.50.20.32
84 bytes from 10.50.20.32 icmp_seq=1 ttl=64 time=0.500 ms
<span class="c">(5 replies, output trimmed)</span>

LEAF1&gt; show evpn database
VLAN  DomainId  MAC address        Active source                  IP address
      1010      00:50:7f:06:6d:01  ge-0/0/2.0                     10.50.10.21
      1010      00:50:80:06:6e:01  10.50.255.12                   10.50.10.22
      1020      00:50:7a:06:65:01  10.50.255.12                   10.50.20.32
      1020      00:50:81:06:70:01  ge-0/0/3.0                     10.50.20.31
<span class="c">(timestamp column removed)</span></pre>
<p>Ab dono VNIs ka local MAC (port) aur remote MAC (LEAF2 ke loopback ka address) hai. Fabric healthy hai.</p>

<h3>Step 5: control plane saaf ho to data plane</h3>
<p>Agar saare routes accepted hain aur VTEP pata hai par traffic phir bhi fail hota hai, to VXLAN khud shak mein hai. Simulator MTU model nahi karta, isliye ise concept ki tarah lo: VXLAN lagbhag 50 byte overhead jodta hai, isliye underlay MTU host MTU se utna zyada hona chahiye warna bade packets drop ho jaate hain jabki ping chalta rehta hai. Loopbacks ya fabric links par filters ko <b>UDP port 4789</b> permit karna chahiye. Underlay loops ya asymmetric ECMP intermittent loss de sakte hain jise koi EVPN command samjha nahi paata.</p>

<div class="eg"><p><b>Worked example.</b> Symptom ko layer se milao. (a) OSPF neighbor missing: underlay. (b) BGP state Active: lo0 se reachability ya local-address missing. (c) Established par N received mein se 0 accepted: route target mismatch. (d) Accepted, par ek VNI ka tunnel ya routes nahi: woh VNI extended-vni-list mein nahi hai. (e) 64 byte ping chalta hai par bade transfer atak jaate hain: underlay MTU.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Sirf session state se health judge karna. (2) Sirf <i>received</i> counter padhna aur yeh miss karna ki accepted zero hai. (3) Control plane se pehle data plane theek karna. (4) Dono ends ek saath badalna, jisse chhup jaata hai ki kaunse change ne fault theek kiya. Apna change prove karne ke liye <code>show configuration | compare rollback 1</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "BGP Established hai, isliye control plane theek hai" galat hai. Established ke saath accepted zero ka matlab import problem hai, aksar route target. Ek aur trap: one-sided extended-vni-list. Har leaf ko VNI apni list mein chahiye.</p></div>

<div class="iv"><p class="q">"EVPN session up hai par do leaves ke hosts baat nahi kar paate. Aap kaise aage badhoge?"</p><p>Main neeche se upar jaata hoon. OSPF aur loopback ping check karta hoon, phir <code>show bgp summary</code> mein session aur accepted counter. Agar routes received par accepted nahi hain to dono leaves ka vrf-target compare karta hoon. Remote VTEP missing ho to tunnel list dekhta hoon, aur sirf ek VNI fail ho to <code>show evpn instance extensive</code> mein extended-vni-list mein na hone wale VNIs dekhta hoon. Aakhir mein MTU, UDP 4789 aur MAC tables.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein test karo: underlay, session, accepted routes, VNIs aur tunnels, data plane.</li>
<li>Counter format active/received/accepted/damped hai; received bina accepted ka matlab policy ya target mismatch.</li>
<li>Khali remote VTEP list ka matlab koi accepted type-3 route nahi.</li>
<li>"VNIs not in extended-vni-list (not advertised)" missing VNI ka naam bilkul batata hai.</li>
<li>Changes ko show system commit aur compare rollback 1 se prove karo.</li>
</ul></div>
`}};export{e as default};