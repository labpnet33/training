var e={id:`verification-ladder`,h:{en:`The verification ladder: show commands in order`,hi:`Verification ladder: show commands sahi order mein`},body:{en:`
<p>When a doctor examines you, she does not start with an MRI. She checks pulse, temperature and blood pressure, in that order, because each reading tells her whether the next test is worth doing. A network engineer needs the same discipline. The <b>verification ladder</b> is a fixed sequence of show commands that you climb one rung at a time. You stop at the first rung that looks wrong, because everything above it depends on it.</p>

<h3>The ladder</h3>
<div class="tbl"><table>
<tr><th>Rung</th><th>Command</th><th>Healthy looks like</th></tr>
<tr><td>1. Ports</td><td><code>show ip interface brief</code></td><td>Every used port up/up, correct IP, no "administratively down"</td></tr>
<tr><td>2. VLANs</td><td><code>show vlan brief</code></td><td>Each access port in its planned VLAN, VLAN active</td></tr>
<tr><td>3. Trunks</td><td><code>show interfaces trunk</code></td><td>Status trunking, native VLAN agreed, needed VLANs allowed and active</td></tr>
<tr><td>4. Addresses</td><td><code>show ip interface brief</code> and <code>show running-config | section interface</code></td><td>Mask and subnet match the plan table</td></tr>
<tr><td>5. Routes</td><td><code>show ip route</code></td><td>Connected (C), local (L), expected S or O routes, gateway of last resort set where planned</td></tr>
<tr><td>6. Neighbours</td><td><code>show ip ospf neighbor</code></td><td>State FULL (or 2WAY with a DROTHER on broadcast links)</td></tr>
<tr><td>7. Reachability</td><td><code>ping</code> then <code>traceroute</code></td><td>Neighbour first, then far side, then the Internet</td></tr>
<tr><td>8. Services</td><td><code>show ip nat translations</code>, <code>show standby brief</code>, <code>show ip dhcp binding</code></td><td>Translations appear, one Active and one Standby, leases handed out</td></tr>
<tr><td>9. Security</td><td><code>show access-lists</code>, <code>show ip interface</code></td><td>ACL applied on the right interface and direction, match counters rise for the intended rule</td></tr>
<tr><td>10. Persistence</td><td><code>show running-config</code>, <code>copy running-config startup-config</code></td><td>Config saved, matches the design</td></tr>
</table></div>

<h3>Rung by rung, with real output</h3>
<p>Rungs 1 to 4 prove the foundation. The interface table is the fastest health check in IOS: status is the physical layer, protocol is the data link layer.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up
<span class="hl">GigabitEthernet0/1     198.51.100.2    YES manual up                    up</span></pre>
<p>Rung 5 proves the routing table. Read the <b>code</b> in the first column, the <b>prefix</b>, the <b>administrative distance and metric</b> in brackets and the <b>next hop</b>.</p>
<pre class="out">R1# show ip route ospf
      192.0.2.0/32 is subnetted, 1 subnets
<span class="hl">O        192.0.2.1 [110/2] via 198.51.100.1, 00:00:35, GigabitEthernet0/1</span></pre>
<p>Rung 6 proves the neighbour relationship. In this output the neighbour is FULL on the uplink, with a dead timer counting down from 40 seconds (it refreshes with every Hello).</p>
<pre class="out">R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">192.0.2.1         1   FULL/BDR        00:00:32    198.51.100.1    GigabitEthernet0/1</span>

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0.10     1     0               10.10.10.1/24      1     DR    0/0
Gi0/0.20     1     0               10.10.20.1/24      1     DR    0/0
<span class="hl">Gi0/1        1     0               198.51.100.2/30    1     DR    1/1</span></pre>
<p>Rung 7 uses ping from the inside out. Ping the neighbour, then the far end, and then use traceroute to see where the path stops. A <code>.</code> is a timeout, <code>!</code> is a reply, <code>U</code> is "unreachable" from a router in the path.</p>
<pre class="out">R1# ping 192.0.2.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.0.2.1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms</pre>
<p>Rung 9 proves the security layer by counters and placement, not by hope. Check which interface carries the list and in which direction, then check the list.</p>
<pre class="out">R1# show ip interface GigabitEthernet0/0.20 | include access list
  Outgoing access list is not set
  <span class="hl">Inbound  access list is BLOCK</span></pre>

<div class="eg"><p><b>Worked example.</b> A user in VLAN 20 cannot reach the Internet. You climb. Rung 1: <code>show ip interface brief</code> shows Gi0/0.20 up/up with 10.10.20.1. Rung 2: <code>show vlan brief</code> on the switch shows the user's port in VLAN 20. Rung 3: <code>show interfaces trunk</code> lists VLANs 1,10,20 as active, good. Rung 5: <code>show ip route</code> has the default route. Rung 7: ping from the router to the ISP works, ping from the user to the gateway works. Rung 8: <code>show ip nat statistics</code> lists only Gi0/0.10 as an inside interface. The missing <code>ip nat inside</code> on Gi0/0.20 is the fault. Because you climbed in order, you know the fault is not VLANs, trunks or routing, and you fixed one line.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jumping straight to the routing protocol when the port is down. Trusting a ping from the router when the user's problem is the host gateway. Stopping at "ping works" without reading the output. Forgetting that ping has a source: a router pings with the exit interface's address unless you set <code>source</code>. Reading only the Status column of <code>show ip interface brief</code> and ignoring Protocol.</p></div>

<div class="exam"><p><b>Exam traps.</b> up/down means a Layer 2 problem (encapsulation, keepalive, clocking), down/down is Layer 1 (cable, remote end shut), "administratively down" means someone typed shutdown. A neighbour stuck in INIT or EXSTART/EXCHANGE points to different problems from one that never appears. A route learned by OSPF shows AD 110, a static shows 1, connected 0. A default route is <code>S*</code>.</p></div>

<div class="scn"><h4>Twelve minutes with a ladder, four hours without</h4><p>A senior NOC engineer at a retail chain received "store 214 offline". He logged in and climbed: interface up/up, VLAN correct, route present, OSPF neighbour FULL, ping to the data centre fine, but PAT stopped translating. The statistics showed zero hits. The ISP link had flapped, and the NAT outside interface had lost its <code>ip nat outside</code> line during a bad paste earlier that week. Twelve minutes. A junior colleague on the same ticket had spent four hours rebuilding OSPF.</p><p><b>Lesson:</b> a fixed ladder is faster than intuition, because it removes whole layers from the search.</p></div>

<div class="iv"><p class="q">"Walk me through how you verify a freshly built site."</p><p>Strong answer: interfaces first, then VLANs and trunks, then addressing against the plan, routing table, neighbours, ping from inside out, services with their own show commands, security with counters and negative tests, and finally saving the configuration. I stop at the first failing rung.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Climb the same ladder every time: ports, VLANs, trunks, addresses, routes, neighbours, ping, services, security, save.</li>
<li>Stop at the first wrong rung; everything above depends on it.</li>
<li>Learn what healthy looks like so a wrong output jumps out.</li>
<li>Ping inside out, and use traceroute to find where the path stops.</li>
<li>Prove security with counters and a negative test, not by assumption.</li>
</ul></div>
`,hi:`
<p>Doctor jab aapko check karta hai to MRI se shuru nahi karta. Woh pulse, temperature aur blood pressure dekhta hai, usi order mein, kyunki har reading batati hai ki agla test karna worth hai ya nahi. Network engineer ko bhi yahi discipline chahiye. <b>Verification ladder</b> show commands ka fixed sequence hai jise aap ek-ek rung chadhte hain. Pehli galat dikhne wali rung par ruk jaate ho, kyunki uske upar ki har cheez usi par depend karti hai.</p>

<h3>Ladder</h3>
<div class="tbl"><table>
<tr><th>Rung</th><th>Command</th><th>Healthy aisa dikhta hai</th></tr>
<tr><td>1. Ports</td><td><code>show ip interface brief</code></td><td>Har used port up/up, sahi IP, koi "administratively down" nahi</td></tr>
<tr><td>2. VLANs</td><td><code>show vlan brief</code></td><td>Har access port planned VLAN mein, VLAN active</td></tr>
<tr><td>3. Trunks</td><td><code>show interfaces trunk</code></td><td>Status trunking, native VLAN agreed, zaroori VLANs allowed aur active</td></tr>
<tr><td>4. Addresses</td><td><code>show ip interface brief</code> aur <code>show running-config | section interface</code></td><td>Mask aur subnet plan table se match karte hain</td></tr>
<tr><td>5. Routes</td><td><code>show ip route</code></td><td>Connected (C), local (L), expected S ya O routes, jahan planned ho wahan gateway of last resort set</td></tr>
<tr><td>6. Neighbours</td><td><code>show ip ospf neighbor</code></td><td>State FULL (broadcast links par DROTHER ke saath 2WAY)</td></tr>
<tr><td>7. Reachability</td><td><code>ping</code> phir <code>traceroute</code></td><td>Pehle neighbour, phir far side, phir Internet</td></tr>
<tr><td>8. Services</td><td><code>show ip nat translations</code>, <code>show standby brief</code>, <code>show ip dhcp binding</code></td><td>Translations dikhte hain, ek Active ek Standby, leases mile hue</td></tr>
<tr><td>9. Security</td><td><code>show access-lists</code>, <code>show ip interface</code></td><td>ACL sahi interface aur direction par, intended rule ke match counters badhte hain</td></tr>
<tr><td>10. Persistence</td><td><code>show running-config</code>, <code>copy running-config startup-config</code></td><td>Config saved, design se match</td></tr>
</table></div>

<h3>Rung by rung, real output ke saath</h3>
<p>Rungs 1 se 4 foundation prove karti hain. Interface table IOS ka sabse tez health check hai: status physical layer hai, protocol data link layer.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     unassigned      YES unset  up                    up
GigabitEthernet0/0.10  10.10.10.1      YES manual up                    up
GigabitEthernet0/0.20  10.10.20.1      YES manual up                    up
<span class="hl">GigabitEthernet0/1     198.51.100.2    YES manual up                    up</span></pre>
<p>Rung 5 routing table prove karti hai. Pehle column ka <b>code</b>, <b>prefix</b>, brackets mein <b>administrative distance aur metric</b> aur <b>next hop</b> padho.</p>
<pre class="out">R1# show ip route ospf
      192.0.2.0/32 is subnetted, 1 subnets
<span class="hl">O        192.0.2.1 [110/2] via 198.51.100.1, 00:00:35, GigabitEthernet0/1</span></pre>
<p>Rung 6 neighbour relationship prove karti hai. Is output mein neighbour uplink par FULL hai, aur dead timer 40 second se ghat raha hai (har Hello par refresh hota hai).</p>
<pre class="out">R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">192.0.2.1         1   FULL/BDR        00:00:32    198.51.100.1    GigabitEthernet0/1</span>

R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0.10     1     0               10.10.10.1/24      1     DR    0/0
Gi0/0.20     1     0               10.10.20.1/24      1     DR    0/0
<span class="hl">Gi0/1        1     0               198.51.100.2/30    1     DR    1/1</span></pre>
<p>Rung 7 mein ping andar se bahar ki taraf chalta hai. Neighbour ko ping karo, phir far end ko, aur traceroute se dekho ki path kahan ruk raha hai. <code>.</code> timeout hai, <code>!</code> reply hai, <code>U</code> path ke kisi router se "unreachable" hai.</p>
<pre class="out">R1# ping 192.0.2.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 192.0.2.1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms</pre>
<p>Rung 9 security ko counters aur placement se prove karti hai, ummeed se nahi. Dekho list kis interface par aur kis direction mein hai, phir list check karo.</p>
<pre class="out">R1# show ip interface GigabitEthernet0/0.20 | include access list
  Outgoing access list is not set
  <span class="hl">Inbound  access list is BLOCK</span></pre>

<div class="eg"><p><b>Worked example.</b> VLAN 20 ka user Internet tak nahi pahunch raha. Aap ladder chadhte ho. Rung 1: <code>show ip interface brief</code> mein Gi0/0.20 up/up, 10.10.20.1. Rung 2: switch par <code>show vlan brief</code> mein user ka port VLAN 20 mein. Rung 3: <code>show interfaces trunk</code> VLANs 1,10,20 active dikhata hai, theek. Rung 5: <code>show ip route</code> mein default route hai. Rung 7: router se ISP ping chalta hai, user se gateway ping chalta hai. Rung 8: <code>show ip nat statistics</code> sirf Gi0/0.10 ko inside interface dikhata hai. Gi0/0.20 par <code>ip nat inside</code> missing hai, yahi fault hai. Order mein chadhne se pata hai ki fault VLANs, trunks ya routing mein nahi, aur ek line se fix ho gaya.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Port down hone par seedha routing protocol par kood jana. Jab problem user ke host gateway mein ho tab router ke ping par bharosa karna. Output padhe bina "ping chal raha hai" par ruk jana. Yeh bhoolna ki ping ka ek source hota hai: router exit interface ka address use karta hai jab tak aap <code>source</code> set na karo. <code>show ip interface brief</code> mein sirf Status column padhna aur Protocol ignore karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> up/down matlab Layer 2 problem (encapsulation, keepalive, clocking), down/down Layer 1 (cable, remote end shut), "administratively down" matlab kisi ne shutdown type kiya. INIT ya EXSTART/EXCHANGE mein atka neighbour us neighbour se alag problem batata hai jo kabhi dikhta hi nahi. OSPF route ka AD 110, static ka 1, connected ka 0. Default route <code>S*</code> hota hai.</p></div>

<div class="scn"><h4>Ladder ke saath barah minute, bina ladder ke chaar ghante</h4><p>Ek retail chain ke senior NOC engineer ko "store 214 offline" ka ticket mila. Usne login karke ladder chadhi: interface up/up, VLAN sahi, route maujood, OSPF neighbour FULL, data centre ka ping theek, lekin PAT translate karna band tha. Statistics mein zero hits. ISP link flap hua tha, aur us hafte ek galat paste mein NAT outside interface ki <code>ip nat outside</code> line chali gayi thi. Barah minute. Usi ticket par junior colleague ne chaar ghante OSPF rebuild karne mein lagaye the.</p><p><b>Lesson:</b> fixed ladder intuition se tez hai, kyunki woh poori layers ko search se hata deti hai.</p></div>

<div class="iv"><p class="q">"Naye bane site ko kaise verify karte ho, samjhao."</p><p>Strong answer: pehle interfaces, phir VLANs aur trunks, phir plan ke against addressing, routing table, neighbours, andar se bahar ping, services unke apne show commands se, security counters aur negative tests se, aur aakhir mein configuration save. Main pehli failing rung par ruk jaata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har baar wahi ladder chadho: ports, VLANs, trunks, addresses, routes, neighbours, ping, services, security, save.</li>
<li>Pehli galat rung par ruko; uske upar ki har cheez usi par depend karti hai.</li>
<li>Healthy kaisa dikhta hai seekho taaki galat output turant chubhe.</li>
<li>Andar se bahar ping karo, aur traceroute se dekho path kahan ruka.</li>
<li>Security ko counters aur negative test se prove karo, assumption se nahi.</li>
</ul></div>
`}};export{e as default};