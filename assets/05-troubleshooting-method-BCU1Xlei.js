var e={id:`troubleshooting-method`,h:{en:`Troubleshooting method and the top 20 CCNA faults`,hi:`Troubleshooting method aur top 20 CCNA faults`},body:{en:`
<p>When the lights go out in your flat, you do not rewire the building. You check whether the neighbour's lights are on (is it the whole street or just me?), you check the main switch, then the fuse, then the bulb. You move from big to small and you touch one thing at a time. Network troubleshooting is the same craft. Earlier modules gave you the commands (see the IOS troubleshooting chapter and the capture workflow chapter). This chapter gives you the <b>method</b> and a map of the faults you will meet again and again.</p>

<h3>Five habits of a good troubleshooter</h3>
<dl class="terms">
<dt>1. Define the symptom</dt><dd>Who, to where, since when, what exactly fails? "PC2 cannot ping 192.0.2.1, PC1 can" is a symptom. "Internet is down" is a complaint.</dd>
<dt>2. Divide and conquer</dt><dd>Pick a point in the middle of the path and test there. If the middle works, the fault is in the second half; if not, in the first. Each test halves the search.</dd>
<dt>3. Follow the packet</dt><dd>Walk the real path: host sends to its gateway (ARP, mask, gateway), the router looks up the route, forwards, NAT or ACL may act, and the <b>return path</b> must work too. Most "one way" failures are a missing return route.</dd>
<dt>4. Compare working against broken</dt><dd>If PC1 works and PC2 does not, diff their configuration: VLAN, mask, gateway, port, ACL. The difference is the fault.</dd>
<dt>5. Change one thing at a time</dt><dd>One change, then retest, then note the result. If it did not help, undo it. Two changes at once destroy your evidence.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Divide and conquer on a path">
<rect x="20" y="40" width="70" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="55" y="65" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="140" y="40" width="70" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="175" y="65" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="260" y="40" width="70" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="295" y="65" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="380" y="40" width="70" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="500" y="40" width="110" height="40" rx="8" fill="#fde68a" stroke="#64748b"/><text x="555" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet host</text>
<line x1="90" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="210" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="330" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="2"/><line x1="450" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="295" y="105" text-anchor="middle" class="svg-accent" font-size="12">test here first: ping the gateway</text>
<text x="55" y="25" text-anchor="middle" class="svg-muted" font-size="11">1. test</text><text x="415" y="25" text-anchor="middle" class="svg-muted" font-size="11">2. next test</text>
</svg><p class="cap">Test the middle of the path first. A working gateway ping clears the host, cable, VLAN and trunk in one step.</p></div>

<h3>The top 20 faults: symptom to command to fix</h3>
<div class="tbl"><table>
<tr><th>#</th><th>Symptom</th><th>Command that shows it</th><th>Fix</th></tr>
<tr><td>1</td><td>Port or link dead</td><td><code>show ip interface brief</code> (administratively down)</td><td><code>no shutdown</code></td></tr>
<tr><td>2</td><td>One host cannot reach its gateway</td><td><code>show vlan brief</code></td><td><code>switchport access vlan N</code></td></tr>
<tr><td>3</td><td>One VLAN dead across the trunk</td><td><code>show interfaces trunk</code> (allowed list)</td><td><code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>4</td><td>Native VLAN mismatch messages</td><td><code>show interfaces trunk</code>, logs</td><td>Make native VLAN equal on both ends</td></tr>
<tr><td>5</td><td>Trunk not forming</td><td><code>show interfaces Gi0/1 switchport</code></td><td>Set both ends <code>switchport mode trunk</code></td></tr>
<tr><td>6</td><td>Router-on-a-stick subinterface silent</td><td><code>show running-config | section interface</code></td><td>Correct <code>encapsulation dot1Q N</code></td></tr>
<tr><td>7</td><td>Wrong mask or IP</td><td><code>show ip interface brief</code>, <code>show ip route</code></td><td>Re-enter address from the plan</td></tr>
<tr><td>8</td><td>Host reaches own subnet only</td><td>PC <code>show ip</code> (gateway)</td><td>Set correct default gateway</td></tr>
<tr><td>9</td><td>"Gateway of last resort is not set"</td><td><code>show ip route</code></td><td><code>ip route 0.0.0.0 0.0.0.0 next-hop</code></td></tr>
<tr><td>10</td><td>Static route with wrong next hop</td><td><code>show ip route</code>, <code>traceroute</code></td><td>Remove and re-add with the right next hop</td></tr>
<tr><td>11</td><td>OSPF neighbour absent, area mismatch</td><td><code>show ip ospf interface brief</code></td><td>Correct the area in the network statement</td></tr>
<tr><td>12</td><td>OSPF neighbour absent, timers differ</td><td><code>show ip ospf interface</code> (Timer line)</td><td>Make hello and dead equal on both ends</td></tr>
<tr><td>13</td><td>OSPF neighbour absent, passive uplink</td><td><code>show ip protocols</code> (Passive Interface list)</td><td><code>no passive-interface Gi0/1</code></td></tr>
<tr><td>14</td><td>IPv6 never routes</td><td><code>show ipv6 interface brief</code>, running-config</td><td><code>ipv6 unicast-routing</code></td></tr>
<tr><td>15</td><td>Only some VLANs reach the Internet</td><td><code>show ip nat statistics</code> (Inside list)</td><td>Add <code>ip nat inside</code> to the missing interface</td></tr>
<tr><td>16</td><td>NAT never translates</td><td><code>show ip nat translations</code>, <code>show access-lists</code></td><td>Make the NAT ACL match the inside subnets</td></tr>
<tr><td>17</td><td>ACL blocks everything</td><td><code>show ip interface</code> (access list), <code>show access-lists</code></td><td>Add the missing permit, fix interface or direction</td></tr>
<tr><td>18</td><td>DHCP clients get 169.254</td><td><code>show ip dhcp binding</code>, interface helper line</td><td><code>ip helper-address</code>, fix pool or exclusions</td></tr>
<tr><td>19</td><td>Both HSRP routers Active</td><td><code>show standby brief</code></td><td>Same group, same virtual IP, set preempt</td></tr>
<tr><td>20</td><td>Port err-disabled after plug-in</td><td><code>show interfaces status</code>, <code>show port-security interface</code></td><td>Fix cause, then <code>shutdown</code> and <code>no shutdown</code></td></tr>
</table></div>

<h3>Two faults, read in the output</h3>
<p>Fault 3: PC2 in VLAN 20 cannot ping its gateway, while PC1 in VLAN 10 is fine. The VLAN list on the trunk gives it away.</p>
<pre class="out">SW1# show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       10</span>

Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       10</span></pre>
<p>Fault 12: the link is up and the IPs are right, but there is no neighbour. Compare the timers on both ends.</p>
<pre class="out">R1# show ip ospf interface GigabitEthernet0/1 | include Timer
  Timer intervals configured, <span class="hl">Hello 5, Dead 20</span>, Wait 20, Retransmit 5

ISP# show ip ospf interface GigabitEthernet0/0 | include Timer
  Timer intervals configured, <span class="hl">Hello 10, Dead 40</span>, Wait 40, Retransmit 5</pre>

<div class="eg"><p><b>Worked example.</b> Symptom: PC2 (10.10.20.11) cannot reach 192.0.2.1, but PC1 (10.10.10.11) can. Compare: both use the same router, so routing and the ISP are fine. Follow the packet: PC2 pings its gateway 10.10.20.1 and fails. Divide: the failure is before the router, so check the switch. <code>show vlan brief</code> shows Gi0/3 in VLAN 20, correct. <code>show interfaces trunk</code> shows only VLAN 10 allowed. One change: <code>switchport trunk allowed vlan add 20</code>. Retest: gateway ping works, Internet ping works. Total: four commands and one change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reloading a device as the first step, which destroys evidence. Fixing three things at once and not knowing which mattered. Testing only one direction. Trusting a ping that is blocked by an ACL as proof the path is broken. Believing the topology diagram instead of reading <code>show cdp neighbors</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> In troubleshooting questions, a fault is usually on the path closest to the failing host first. Look at both ends of a link: mismatches (area, timers, native VLAN, mask) need two devices to compare. The exam may have more than one fault; after fixing one, retest the original symptom. Do not fix things that are not broken, you may lose points.</p></div>

<div class="scn"><h4>Three people, one VLAN, one afternoon</h4><p>A call-centre floor lost phones in VLAN 20 after a switch swap. One engineer rebooted the router, another re-created the SVI, a third changed the DHCP scope. Everything still failed. A fourth engineer read <code>show interfaces trunk</code> on the new switch, saw VLAN 20 missing from the allowed list, and added it. It took thirty seconds. The three earlier changes were then reverted one by one because nobody could say whether they had helped or hurt.</p><p><b>Lesson:</b> one person, one change, one retest. Evidence first.</p></div>

<div class="iv"><p class="q">"A user says they cannot reach the Internet. What is your approach?"</p><p>Strong answer: confirm the symptom and its scope, check whether others are affected, test the gateway first (divide and conquer), follow the packet through ARP, routing, NAT and the return path, compare with a working host, change one thing at a time, retest, and document the cause and the fix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five habits: define the symptom, divide and conquer, follow the packet, compare working against broken, change one thing.</li>
<li>Test the gateway first: it clears the host, cable, VLAN and trunk in one step.</li>
<li>Most CCNA faults are mismatches between two ends, so look at both.</li>
<li>Know the top 20 faults as symptom, command and fix triples.</li>
<li>After each fix, retest the original symptom.</li>
</ul></div>
`,hi:`
<p>Jab aapke flat ki lights chali jaati hain, aap poori building ki wiring nahi badalte. Aap dekhte ho padosi ki lights on hain ya nahi (poori gali ki hai ya sirf meri?), phir main switch, phir fuse, phir bulb. Aap bade se chhote ki taraf jaate ho aur ek samay mein ek hi cheez chhute ho. Network troubleshooting bhi yahi craft hai. Pehle ke modules ne aapko commands diye (IOS troubleshooting chapter aur capture workflow chapter dekho). Yeh chapter aapko <b>method</b> deta hai aur un faults ka map jo baar-baar milenge.</p>

<h3>Achhe troubleshooter ki paanch aadatein</h3>
<dl class="terms">
<dt>1. Symptom define karo</dt><dd>Kaun, kahan tak, kab se, exactly kya fail hota hai? "PC2 192.0.2.1 ko ping nahi kar sakta, PC1 kar sakta hai" symptom hai. "Internet down hai" complaint hai.</dd>
<dt>2. Divide and conquer</dt><dd>Path ke beech ka ek point chuno aur wahan test karo. Beech chal raha hai to fault doosre half mein, nahi to pehle mein. Har test search ko aadha kar deta hai.</dd>
<dt>3. Packet ko follow karo</dt><dd>Asli path chalo: host apne gateway ko bhejta hai (ARP, mask, gateway), router route lookup karta hai, forward karta hai, NAT ya ACL kaam kar sakte hain, aur <b>return path</b> bhi chalna chahiye. Zyadatar "ek taraf" ke failures mein return route missing hota hai.</dd>
<dt>4. Working aur broken ko compare karo</dt><dd>PC1 chal raha hai aur PC2 nahi, to unki configuration ka diff nikalo: VLAN, mask, gateway, port, ACL. Jo difference mile, wahi fault hai.</dd>
<dt>5. Ek samay mein ek cheez badlo</dt><dd>Ek change, phir retest, phir result note karo. Madad nahi hui to undo karo. Ek saath do changes aapka evidence barbaad kar dete hain.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Divide and conquer on a path">
<rect x="20" y="40" width="70" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="55" y="65" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="140" y="40" width="70" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="175" y="65" text-anchor="middle" class="svg-ink" font-size="12">SW1</text>
<rect x="260" y="40" width="70" height="40" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="295" y="65" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<rect x="380" y="40" width="70" height="40" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="415" y="65" text-anchor="middle" class="svg-ink" font-size="12">ISP</text>
<rect x="500" y="40" width="110" height="40" rx="8" fill="#fde68a" stroke="#64748b"/><text x="555" y="65" text-anchor="middle" class="svg-ink" font-size="12">Internet host</text>
<line x1="90" y1="60" x2="140" y2="60" stroke="#64748b" stroke-width="2"/><line x1="210" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="330" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="2"/><line x1="450" y1="60" x2="500" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="295" y="105" text-anchor="middle" class="svg-accent" font-size="12">pehle yahan test: gateway ping</text>
<text x="55" y="25" text-anchor="middle" class="svg-muted" font-size="11">1. test</text><text x="415" y="25" text-anchor="middle" class="svg-muted" font-size="11">2. agla test</text>
</svg><p class="cap">Path ke beech ka test pehle karo. Gateway ping chal gaya to host, cable, VLAN aur trunk ek step mein clear.</p></div>

<h3>Top 20 faults: symptom se command se fix</h3>
<div class="tbl"><table>
<tr><th>#</th><th>Symptom</th><th>Kaunsa command dikhata hai</th><th>Fix</th></tr>
<tr><td>1</td><td>Port ya link dead</td><td><code>show ip interface brief</code> (administratively down)</td><td><code>no shutdown</code></td></tr>
<tr><td>2</td><td>Ek host apne gateway tak nahi pahunchta</td><td><code>show vlan brief</code></td><td><code>switchport access vlan N</code></td></tr>
<tr><td>3</td><td>Trunk par ek VLAN dead</td><td><code>show interfaces trunk</code> (allowed list)</td><td><code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>4</td><td>Native VLAN mismatch messages</td><td><code>show interfaces trunk</code>, logs</td><td>Dono ends par native VLAN barabar karo</td></tr>
<tr><td>5</td><td>Trunk nahi ban raha</td><td><code>show interfaces Gi0/1 switchport</code></td><td>Dono ends <code>switchport mode trunk</code></td></tr>
<tr><td>6</td><td>Router-on-a-stick subinterface chup</td><td><code>show running-config | section interface</code></td><td>Sahi <code>encapsulation dot1Q N</code></td></tr>
<tr><td>7</td><td>Galat mask ya IP</td><td><code>show ip interface brief</code>, <code>show ip route</code></td><td>Plan se address dobara daalo</td></tr>
<tr><td>8</td><td>Host sirf apna subnet reach karta hai</td><td>PC <code>show ip</code> (gateway)</td><td>Sahi default gateway set karo</td></tr>
<tr><td>9</td><td>"Gateway of last resort is not set"</td><td><code>show ip route</code></td><td><code>ip route 0.0.0.0 0.0.0.0 next-hop</code></td></tr>
<tr><td>10</td><td>Static route ka next hop galat</td><td><code>show ip route</code>, <code>traceroute</code></td><td>Hatao aur sahi next hop se dobara lagao</td></tr>
<tr><td>11</td><td>OSPF neighbour nahi, area mismatch</td><td><code>show ip ospf interface brief</code></td><td>Network statement mein area theek karo</td></tr>
<tr><td>12</td><td>OSPF neighbour nahi, timers alag</td><td><code>show ip ospf interface</code> (Timer line)</td><td>Dono ends par hello aur dead barabar karo</td></tr>
<tr><td>13</td><td>OSPF neighbour nahi, uplink passive</td><td><code>show ip protocols</code> (Passive Interface list)</td><td><code>no passive-interface Gi0/1</code></td></tr>
<tr><td>14</td><td>IPv6 kabhi route nahi hota</td><td><code>show ipv6 interface brief</code>, running-config</td><td><code>ipv6 unicast-routing</code></td></tr>
<tr><td>15</td><td>Sirf kuch VLANs Internet tak jaate hain</td><td><code>show ip nat statistics</code> (Inside list)</td><td>Missing interface par <code>ip nat inside</code> lagao</td></tr>
<tr><td>16</td><td>NAT kabhi translate nahi karta</td><td><code>show ip nat translations</code>, <code>show access-lists</code></td><td>NAT ACL ko inside subnets se match karao</td></tr>
<tr><td>17</td><td>ACL sab block kar rahi hai</td><td><code>show ip interface</code> (access list), <code>show access-lists</code></td><td>Missing permit lagao, interface ya direction theek karo</td></tr>
<tr><td>18</td><td>DHCP clients ko 169.254 mil raha hai</td><td><code>show ip dhcp binding</code>, interface helper line</td><td><code>ip helper-address</code>, pool ya exclusions theek karo</td></tr>
<tr><td>19</td><td>Dono HSRP routers Active</td><td><code>show standby brief</code></td><td>Same group, same virtual IP, preempt set karo</td></tr>
<tr><td>20</td><td>Plug-in ke baad port err-disabled</td><td><code>show interfaces status</code>, <code>show port-security interface</code></td><td>Cause fix karo, phir <code>shutdown</code> aur <code>no shutdown</code></td></tr>
</table></div>

<h3>Do faults, output mein padho</h3>
<p>Fault 3: VLAN 20 ka PC2 apne gateway ko ping nahi kar sakta, jabki VLAN 10 ka PC1 theek hai. Trunk ki VLAN list raaz khol deti hai.</p>
<pre class="out">SW1# show interfaces trunk
Port        Mode             Encapsulation Status        Native vlan
Gi0/1       on               802.1q        trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       10</span>

Port        Vlans allowed and active in management domain
<span class="hl">Gi0/1       10</span></pre>
<p>Fault 12: link up hai aur IPs sahi hain, lekin neighbour nahi hai. Dono ends ke timers compare karo.</p>
<pre class="out">R1# show ip ospf interface GigabitEthernet0/1 | include Timer
  Timer intervals configured, <span class="hl">Hello 5, Dead 20</span>, Wait 20, Retransmit 5

ISP# show ip ospf interface GigabitEthernet0/0 | include Timer
  Timer intervals configured, <span class="hl">Hello 10, Dead 40</span>, Wait 40, Retransmit 5</pre>

<div class="eg"><p><b>Worked example.</b> Symptom: PC2 (10.10.20.11) 192.0.2.1 tak nahi pahunchta, lekin PC1 (10.10.10.11) pahunchta hai. Compare: dono same router use karte hain, to routing aur ISP theek hain. Packet follow karo: PC2 apne gateway 10.10.20.1 ko ping karta hai aur fail hota hai. Divide: failure router se pehle hai, to switch check karo. <code>show vlan brief</code> mein Gi0/3 VLAN 20 mein hai, sahi. <code>show interfaces trunk</code> sirf VLAN 10 allowed dikhata hai. Ek change: <code>switchport trunk allowed vlan add 20</code>. Retest: gateway ping chala, Internet ping chala. Total: chaar commands aur ek change.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pehle step mein device reload karna, jisse evidence khatam ho jata hai. Teen cheezein ek saath fix karna aur pata na hona ki kaunsi kaam aayi. Sirf ek direction test karna. ACL se block hue ping ko path broken hone ka proof maan lena. Topology diagram par bharosa karna aur <code>show cdp neighbors</code> na padhna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Troubleshooting questions mein fault aksar failing host ke sabse paas ke path par hota hai. Link ke dono ends dekho: mismatches (area, timers, native VLAN, mask) ko compare karne ke liye do devices chahiye. Exam mein ek se zyada faults ho sakte hain; ek fix ke baad original symptom dobara test karo. Jo toota nahi use mat theek karo, marks kat sakte hain.</p></div>

<div class="scn"><h4>Teen log, ek VLAN, ek dopahar</h4><p>Ek call-centre floor ke VLAN 20 ke phones switch swap ke baad band ho gaye. Ek engineer ne router reboot kiya, doosre ne SVI dobara banayi, teesre ne DHCP scope badla. Phir bhi sab fail. Chauthe engineer ne naye switch par <code>show interfaces trunk</code> padha, allowed list mein VLAN 20 missing dekha, aur add kar diya. Tees second lage. Pehle ke teeno changes ek-ek karke revert kiye gaye kyunki koi nahi bata sakta tha ki unhone madad ki ya nuksan.</p><p><b>Lesson:</b> ek insaan, ek change, ek retest. Pehle evidence.</p></div>

<div class="iv"><p class="q">"Ek user kehta hai Internet nahi chal raha. Aapka approach kya hai?"</p><p>Strong answer: symptom aur uska scope confirm karunga, dekhunga aur log affected hain ya nahi, pehle gateway test karunga (divide and conquer), packet ko ARP, routing, NAT aur return path se follow karunga, working host se compare karunga, ek samay mein ek change karunga, retest karunga, aur cause aur fix document karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch aadatein: symptom define, divide and conquer, packet follow, working vs broken compare, ek change.</li>
<li>Pehle gateway test karo: host, cable, VLAN aur trunk ek step mein clear.</li>
<li>Zyadatar CCNA faults do ends ke beech mismatch hain, isliye dono dekho.</li>
<li>Top 20 faults ko symptom, command aur fix ke triples ki tarah yaad rakho.</li>
<li>Har fix ke baad original symptom dobara test karo.</li>
</ul></div>
`}};export{e as default};