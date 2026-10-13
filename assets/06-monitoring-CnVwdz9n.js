var e={id:`monitoring`,h:{en:`Link monitoring, path monitoring and the failover triggers`,hi:`Link monitoring, path monitoring aur failover triggers`},body:{en:`
<p>A pair that only fails over when a whole firewall dies is like a smoke alarm that only rings when the building has already burned down. Real failures are partial: one uplink is cut, one switch dies, the ISP router stops answering. <b>Monitoring</b> lets the pair detect those and fail over to the unit that still has a healthy path. PAN-OS gives you four triggers.</p>

<h3>The four failover triggers</h3>
<table class="cmp"><tr><th>Trigger</th><th>What it watches</th></tr>
<tr><td>Heartbeat or hello loss</td><td>The peer stops answering on HA1 (and the heartbeat backup). The peer is treated as dead.</td></tr>
<tr><td>Link monitoring</td><td>The physical state of chosen interfaces. A link-down event counts as a failure.</td></tr>
<tr><td>Path monitoring</td><td>Whether chosen remote IP addresses answer ICMP pings sent by the firewall.</td></tr>
<tr><td>Internal health and HA2 or hardware failure</td><td>Dataplane, chassis or critical process faults that make the unit non-functional.</td></tr>
</table>

<h3>Link monitoring</h3>
<p>You create <b>link groups</b>: sets of interfaces plus a <b>failure condition</b> of any or all. With "any", losing one interface in the group fails the group. With "all", every interface must be down. Link monitoring is quick and cheap but blind: a cable can be fine while the switch beyond it is dead.</p>

<h3>Path monitoring</h3>
<p>You create <b>path groups</b> of type virtual wire, VLAN or virtual router. Each group lists destination IP addresses, for example the ISP gateway or a core router. The firewall pings them regularly. Key settings:</p>
<ul>
<li><b>Ping interval</b>: how often to ping (default 200 ms).</li>
<li><b>Ping count</b>: how many consecutive failures mark the destination as down (default 10).</li>
<li><b>Failure condition</b> inside a group: any or all destinations unreachable.</li>
<li><b>Failure condition</b> for all path groups together: any or all groups failing.</li>
</ul>
<p>Choose destinations that matter and that answer pings reliably: the next-hop router, not a far-away internet host. Allow the ICMP in policy where required, and pick two destinations in a group with "all" so one slow device does not cause a needless failover.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Monitoring">
<rect x="20" y="70" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">link + path monitors</text>
<rect x="270" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISP router 192.0.2.1</text>
<rect x="270" y="165" width="150" height="40" rx="8" fill="#fde68a"/><text x="345" y="190" text-anchor="middle" class="svg-ink" font-size="13">Core switch 10.10.0.1</text>
<line x1="170" y1="90" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><text x="215" y="58" text-anchor="middle" class="svg-accent" font-size="12">ping</text>
<line x1="170" y1="130" x2="270" y2="182" stroke="#64748b" stroke-width="2"/><text x="215" y="170" text-anchor="middle" class="svg-accent" font-size="12">ping</text>
<rect x="470" y="70" width="150" height="80" rx="10" fill="#e2e8f0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="545" y="127" text-anchor="middle" class="svg-muted" font-size="12">monitors too</text>
</svg><p class="cap">Each firewall pings the destinations that represent a working path.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># Link monitoring on the LAN and WAN interfaces</span>
set deviceconfig high-availability group monitoring link-monitoring enabled yes
set deviceconfig high-availability group monitoring link-monitoring failure-condition any
set deviceconfig high-availability group monitoring link-monitoring link-group LG1 interface [ ethernet1/1 ethernet1/2 ]
set deviceconfig high-availability group monitoring link-monitoring link-group LG1 failure-condition any
<span class="c"># Path monitoring toward the ISP router</span>
set deviceconfig high-availability group monitoring path-monitoring enabled yes
set deviceconfig high-availability group monitoring path-monitoring failure-condition any
set deviceconfig high-availability group monitoring path-monitoring path-group virtual-router default destination-ip 192.0.2.1
set deviceconfig high-availability group monitoring path-monitoring path-group virtual-router default failure-condition any</pre>
<p>These commands follow the general PAN-OS structure; confirm names and order with <code>?</code>. On a real firewall you can check live status with <code>show high-availability link-monitoring</code> and <code>show high-availability path-monitoring</code>.</p>

<h3>The failover decision</h3>
<p>When a monitor trips, the unit logs it, lowers its own suitability and moves to a non-functional or passive state, and the peer becomes active if it is healthy. If both units fail the same monitor (for example the ISP really is down), neither has a better path. Failing over then achieves nothing and can flap. This is why you should monitor <b>both firewalls' paths</b> and avoid over-sensitive settings.</p>

<div class="eg"><p><b>Worked example.</b> FW-A and FW-B each connect to a different ISP switch. The ISP uplink on FW-A stays linked at the physical level but the ISP router behind it stops answering. Link monitoring sees nothing. Path monitoring pings 192.0.2.1 every 200 ms. After 10 consecutive misses (about two seconds) FW-A marks the path down and gives up the active role. FW-B, whose path is fine, becomes active.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Monitoring a destination across the Internet or one that does not answer ICMP. The group is then permanently down, and the pair flaps or never becomes active. Monitor a local next-hop that you control.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link monitoring checks interface state; path monitoring checks reachability with ICMP pings. Both have failure conditions of any or all, and path groups come in virtual wire, VLAN and virtual router types.</p></div>

<div class="scn"><h4>Failover loop at 2 a.m.</h4><p>An ISP outage made both firewalls fail path monitoring to the same router. Each time one unit gave up the active role, the other tried and also failed, so the pair flapped and generated alerts. The team added a second, internal destination with the failure condition set to all, and enabled the preemption hold time so a recovering unit waited before reclaiming the role.</p><p><b>Lesson:</b> monitoring must distinguish "my path is bad" from "everyone's path is bad".</p></div>

<div class="iv"><p class="q">"What is the difference between link monitoring and path monitoring?"</p><p>Link monitoring watches interface link state and is instant but only local. Path monitoring pings remote destinations through a virtual router, VLAN or virtual wire and detects failures beyond the cable. Both use failure conditions any or all, and you tune ping interval and count to balance speed against false positives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: heartbeat loss, link monitoring, path monitoring, internal health.</li>
<li>Link monitoring is quick but local; path monitoring finds failures beyond the link.</li>
<li>Default path settings: ping interval 200 ms, count 10.</li>
<li>Monitor local next hops that answer ICMP, not remote Internet hosts.</li>
<li>Guard against flapping with sensible conditions and hold times.</li>
</ul></div>
`,hi:`
<p>Jo pair sirf tab failover kare jab poora firewall mar jaaye, woh us smoke alarm jaisa hai jo tabhi bajta hai jab building pehle hi jal chuki ho. Asli failures partial hoti hain: ek uplink kat gaya, ek switch mar gaya, ISP router jawab dena band kar gaya. <b>Monitoring</b> pair ko yeh detect karne deti hai aur us unit par failover karti hai jiska path abhi healthy hai. PAN-OS aapko chaar triggers deta hai.</p>

<h3>Chaar failover triggers</h3>
<table class="cmp"><tr><th>Trigger</th><th>Kya dekhta hai</th></tr>
<tr><td>Heartbeat ya hello loss</td><td>Peer HA1 (aur heartbeat backup) par jawab dena band kar deta hai. Peer ko dead maana jaata hai.</td></tr>
<tr><td>Link monitoring</td><td>Chune hue interfaces ki physical state. Link-down event failure maana jaata hai.</td></tr>
<tr><td>Path monitoring</td><td>Chune hue remote IP addresses firewall ke bheje ICMP pings ka jawab dete hain ya nahi.</td></tr>
<tr><td>Internal health aur HA2 ya hardware failure</td><td>Dataplane, chassis ya critical process ke faults jo unit ko non-functional bana dein.</td></tr>
</table>

<h3>Link monitoring</h3>
<p>Aap <b>link groups</b> banate ho: interfaces ke sets aur ek <b>failure condition</b> any ya all. "any" ke saath group ka ek interface jaane par group fail ho jaata hai. "all" ke saath har interface down hona chahiye. Link monitoring tez aur sasti hai lekin andhi: cable theek ho sakti hai jabki uske aage ka switch mara hua ho.</p>

<h3>Path monitoring</h3>
<p>Aap virtual wire, VLAN ya virtual router type ke <b>path groups</b> banate ho. Har group mein destination IP addresses hote hain, jaise ISP gateway ya core router. Firewall unhe regularly ping karta hai. Key settings:</p>
<ul>
<li><b>Ping interval</b>: kitni baar ping karna hai (default 200 ms).</li>
<li><b>Ping count</b>: kitni lagataar failures destination ko down mark karti hain (default 10).</li>
<li>Group ke andar <b>failure condition</b>: koi bhi ya saare destinations unreachable.</li>
<li>Saare path groups ke liye milkar <b>failure condition</b>: koi bhi ya saare groups fail.</li>
</ul>
<p>Aise destinations chuno jo matter karte hain aur pings ka bharosemand jawab dete hain: next-hop router, koi door ka internet host nahi. Zaroorat ho to policy mein ICMP allow karo, aur ek group mein do destinations "all" ke saath rakho taaki ek slow device se bekaar failover na ho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Monitoring">
<rect x="20" y="70" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">FW-A (active)</text><text x="95" y="122" text-anchor="middle" class="svg-muted" font-size="12">link + path monitors</text>
<rect x="270" y="20" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="345" y="45" text-anchor="middle" class="svg-ink" font-size="13">ISP router 192.0.2.1</text>
<rect x="270" y="165" width="150" height="40" rx="8" fill="#fde68a"/><text x="345" y="190" text-anchor="middle" class="svg-ink" font-size="13">Core switch 10.10.0.1</text>
<line x1="170" y1="90" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><text x="215" y="58" text-anchor="middle" class="svg-accent" font-size="12">ping</text>
<line x1="170" y1="130" x2="270" y2="182" stroke="#64748b" stroke-width="2"/><text x="215" y="170" text-anchor="middle" class="svg-accent" font-size="12">ping</text>
<rect x="470" y="70" width="150" height="80" rx="10" fill="#e2e8f0"/><text x="545" y="105" text-anchor="middle" class="svg-ink" font-size="14">FW-B (passive)</text><text x="545" y="127" text-anchor="middle" class="svg-muted" font-size="12">yeh bhi monitor karta hai</text>
</svg><p class="cap">Har firewall un destinations ko ping karta hai jo working path represent karte hain.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># LAN aur WAN interfaces par link monitoring</span>
set deviceconfig high-availability group monitoring link-monitoring enabled yes
set deviceconfig high-availability group monitoring link-monitoring failure-condition any
set deviceconfig high-availability group monitoring link-monitoring link-group LG1 interface [ ethernet1/1 ethernet1/2 ]
set deviceconfig high-availability group monitoring link-monitoring link-group LG1 failure-condition any
<span class="c"># ISP router ki taraf path monitoring</span>
set deviceconfig high-availability group monitoring path-monitoring enabled yes
set deviceconfig high-availability group monitoring path-monitoring failure-condition any
set deviceconfig high-availability group monitoring path-monitoring path-group virtual-router default destination-ip 192.0.2.1
set deviceconfig high-availability group monitoring path-monitoring path-group virtual-router default failure-condition any</pre>
<p>Yeh commands PAN-OS ke general structure ko follow karte hain; naam aur order <code>?</code> se confirm karo. Asli firewall par live status <code>show high-availability link-monitoring</code> aur <code>show high-availability path-monitoring</code> se dekh sakte ho.</p>

<h3>Failover ka decision</h3>
<p>Jab koi monitor trip hota hai, unit use log karta hai, apni suitability kam karta hai aur non-functional ya passive state mein chala jaata hai, aur agar peer healthy hai to woh active ban jaata hai. Agar dono units ek hi monitor fail kar dein (jaise ISP sach mein down ho), to kisi ke paas behtar path nahi. Tab failover kuch nahi karta aur flap kar sakta hai. Isiliye <b>dono firewalls ke paths</b> monitor karo aur over-sensitive settings se bacho.</p>

<div class="eg"><p><b>Worked example.</b> FW-A aur FW-B har ek alag ISP switch se jude hain. FW-A ka ISP uplink physical level par linked rehta hai lekin uske peeche ISP router jawab dena band kar deta hai. Link monitoring kuch nahi dekhta. Path monitoring har 200 ms par 192.0.2.1 ko ping karta hai. 10 lagataar miss ke baad (lagbhag do second) FW-A path ko down mark karta hai aur active role chhod deta hai. FW-B, jiska path theek hai, active ban jaata hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Aisi destination monitor karna jo Internet ke par ho ya ICMP ka jawab na de. Tab group permanently down rehta hai, aur pair flap karta hai ya kabhi active nahi banta. Aisa local next-hop monitor karo jo aapke control mein ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link monitoring interface state check karti hai; path monitoring ICMP pings se reachability check karti hai. Dono ki failure conditions any ya all hoti hain, aur path groups virtual wire, VLAN aur virtual router types mein aate hain.</p></div>

<div class="scn"><h4>Raat 2 baje failover loop</h4><p>ISP outage se dono firewalls same router tak path monitoring mein fail ho gaye. Jab bhi ek unit ne active role chhoda, doosre ne koshish ki aur woh bhi fail hua, isliye pair flap karta raha aur alerts aate rahe. Team ne ek doosri, internal destination jodi jiska failure condition all tha, aur preemption hold time enable kiya taaki recover hone wala unit role wapas lene se pehle ruke.</p><p><b>Lesson:</b> monitoring ko "mera path kharab hai" aur "sabka path kharab hai" mein farak karna aana chahiye.</p></div>

<div class="iv"><p class="q">"Link monitoring aur path monitoring mein kya difference hai?"</p><p>Link monitoring interface link state dekhti hai, turant hoti hai lekin sirf local. Path monitoring virtual router, VLAN ya virtual wire ke through remote destinations ko ping karti hai aur cable ke aage ki failures detect karti hai. Dono any ya all failure conditions use karti hain, aur aap speed aur false positives ke beech balance ke liye ping interval aur count tune karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triggers: heartbeat loss, link monitoring, path monitoring, internal health.</li>
<li>Link monitoring tez lekin local; path monitoring link ke aage ki failures dhoondhti hai.</li>
<li>Default path settings: ping interval 200 ms, count 10.</li>
<li>Local next hops monitor karo jo ICMP ka jawab dein, remote Internet hosts nahi.</li>
<li>Flapping se bachne ke liye sahi conditions aur hold times lagao.</li>
</ul></div>
`}};export{e as default};