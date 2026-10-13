var e={id:`troubleshooting`,h:{en:`Verification and troubleshooting workflow (with ticket INC-3104)`,hi:`Verification aur troubleshooting workflow (ticket INC-3104 ke saath)`},body:{en:`
<p>A good doctor does not guess. She asks where it hurts, takes the temperature, checks the pulse, then orders one specific test. Routing faults deserve the same discipline. Almost every static routing ticket is one of five things: a route that is missing, a route that is configured but not installed, a route with the wrong mask or next hop, a missing return route, or a loop. This chapter gives you a workflow that finds each one, then uses it on the module's NOC ticket.</p>

<h3>The toolkit</h3>
<table class="cmp">
<tr><th>Command</th><th>Answers the question</th></tr>
<tr><td><code>ping x.x.x.x [source intf]</code></td><td>Does a round trip work? <code>!</code> reply, <code>.</code> timeout, <code>U</code> unreachable received.</td></tr>
<tr><td><code>traceroute x.x.x.x</code> / PC <code>trace</code></td><td>Where does the path stop or loop?</td></tr>
<tr><td><code>show ip route x.x.x.x</code></td><td>Which entry wins for this destination, and is there one at all?</td></tr>
<tr><td><code>show ip route static</code></td><td>Which statics are installed?</td></tr>
<tr><td><code>show ip static route</code></td><td>Which statics are configured, and are they [A] active or [N] not installed?</td></tr>
<tr><td><code>show ip interface brief</code></td><td>Is the exit interface up/up?</td></tr>
<tr><td><code>show ip arp</code></td><td>Is the next hop's MAC resolved, or Incomplete?</td></tr>
<tr><td><code>show running-config | include ip route</code></td><td>What exactly was typed?</td></tr>
</table>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Static routing troubleshooting workflow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. Scope</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">exact src and dst</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2. Trace</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">last good hop</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3. Forward route</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">show ip route dst</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4. Why missing?</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">[N], mask, next hop</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="140" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="165" text-anchor="middle" class="svg-ink" font-size="12">5. Return route</text><text x="400" y="184" text-anchor="middle" class="svg-muted" font-size="12">show ip route src</text>
<rect x="170" y="140" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="165" text-anchor="middle" class="svg-ink" font-size="12">6. Loop?</text><text x="240" y="184" text-anchor="middle" class="svg-muted" font-size="12">hops repeat</text>
<rect x="10" y="140" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="12">7. Fix and prove</text><text x="80" y="184" text-anchor="middle" class="svg-muted" font-size="12">ping + trace</text>
<line x1="560" y1="80" x2="470" y2="160" stroke="#64748b" stroke-width="2"/><line x1="330" y1="170" x2="310" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="170" x2="150" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Always test from the real source address, not from the router</text>
</svg><p class="cap">Seven steps, in order. Most tickets are solved by step 5.</p></div>
<ol>
<li><b>Scope.</b> Get the exact source IP, destination IP and what does work. "Jaipur cannot reach HQ" becomes "172.20.8.200 cannot reach 10.10.20.50".</li>
<li><b>Trace from the real source.</b> The last hop that answers is where you start.</li>
<li><b>Forward route.</b> On that router, <code>show ip route &lt;destination&gt;</code>. No entry? Wrong next hop? Too-short mask?</li>
<li><b>Why is it missing?</b> <code>show ip static route</code>: [N] means configured but not installed. Check the next hop with <code>show ip route &lt;next hop&gt;</code> and the interface with <code>show ip interface brief</code>.</li>
<li><b>Return route.</b> On each router on the way back, <code>show ip route &lt;source&gt;</code>. A trace that shows stars after a router often means the <b>next</b> router cannot route back to you.</li>
<li><b>Loop.</b> If trace hops alternate between two addresses, compare the two routers' routes for that destination.</li>
<li><b>Fix and prove</b> with ping and trace from the real source, then document.</li>
</ol>

<h3>Walkthrough: INC-3104</h3>
<p>Ticket (P2): "Since last night's change window the Jaipur branch cannot open the HQ file server 10.10.20.50." Branch user PC: 172.20.8.200. The change added static routes on both BR-JAIPUR and HQ-CORE.</p>
<p><b>Step 2 and 3, on BR-JAIPUR:</b></p>
<pre class="out">BR-JAIPUR#show ip route 10.10.20.50
% Subnet not in table

BR-JAIPUR#show ip static route
Codes: M - Manual static, A - AAA download, N - IP NAT, D - DHCP,
       (legend trimmed)
Static local RIB for default

<span class="hl">M  10.10.0.0/16 [1/0] via 10.99.0.6 [N]</span>

BR-JAIPUR#show ip route 10.99.0.6
% Subnet not in table</pre>
<p>The HQ-CAMPUS route exists but is <b>[N]</b>. Its next hop 10.99.0.6 is not on the WAN /30 (10.99.0.0/30 holds only .1 and .2), so recursion fails. The real HQ address is 10.99.0.2.</p>
<pre class="code">BR-JAIPUR(config)# no ip route 10.10.0.0 255.255.0.0 10.99.0.6
BR-JAIPUR(config)# ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS</pre>
<p><b>Retest.</b> Still failing, but differently. That is progress, not failure:</p>
<pre class="out">PCB&gt; trace 10.10.20.50
trace to 10.10.20.50, 8 hops max, press Ctrl+C to stop
 1   172.20.8.1   0.611 ms  0.402 ms  0.388 ms
<span class="hl"> 2   *  *  *</span></pre>
<p><b>Step 5, return route on HQ-CORE:</b> the second hop is HQ, and it did not answer. Why? Its TTL-exceeded reply must be routed back to 172.20.8.200.</p>
<pre class="out">HQ-CORE#show ip route 172.20.8.200
% Subnet not in table

HQ-CORE#show ip route static
<span class="hl">S        172.20.8.0/25 [1/0] via 10.99.0.1</span></pre>
<p>The mask is /25 (255.255.255.128), which covers only .0 to .127. The user at .200 is outside it. Users with low addresses would have worked, which is why such faults produce confusing "only some people" reports.</p>
<pre class="code">HQ-CORE(config)# no ip route 172.20.8.0 255.255.255.128 10.99.0.1
HQ-CORE(config)# ip route 172.20.8.0 255.255.255.0 10.99.0.1 name JAIPUR-LAN</pre>
<p><b>Step 7, prove it:</b></p>
<pre class="out">PCB&gt; ping 10.10.20.50
84 bytes from 10.10.20.50 icmp_seq=1 ttl=62 time=1.214 ms
84 bytes from 10.10.20.50 icmp_seq=2 ttl=62 time=0.987 ms

PCB&gt; trace 10.10.20.50
trace to 10.10.20.50, 8 hops max, press Ctrl+C to stop
 1   172.20.8.1   0.514 ms  0.402 ms  0.377 ms
 2   10.99.0.2   0.981 ms  0.866 ms  0.851 ms
<span class="hl"> 3   *10.10.20.50   1.302 ms (ICMP type:3, code:3, Destination port unreachable)</span></pre>
<p>Close the ticket with root cause: "Two typos in the change: wrong next hop on BR (10.99.0.6, route inactive) and wrong mask on HQ (/25 instead of /24). Both corrected, reachability verified from 172.20.8.200."</p>

<div class="eg"><p><b>Worked example: a loop between two statics.</b> R1 has a default to R2. R2 has an old static <code>ip route 192.168.99.0 255.255.255.0 10.12.12.1</code> left over from a decommissioned site, pointing back to R1. A trace from R1 to 192.168.99.10:</p>
<pre class="out">R1#traceroute 192.168.99.10
Type escape sequence to abort.
Tracing the route to 192.168.99.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.12.12.2 1 msec 1 msec 0 msec
<span class="hl">  2 10.12.12.1 1 msec 1 msec 1 msec
  3 10.12.12.2 1 msec 1 msec 1 msec
  4 10.12.12.1 2 msec 1 msec 1 msec</span></pre>
<p>Alternating addresses mean each router points at the other. The packet bounces until TTL expires. Remove the stale static on R2 (or point it to the correct next hop).</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing only from the router with a plain <code>ping</code>. The router sources from its exit interface, a transit subnet the far end may not route back to, so you get false failures, or a transit subnet that is routed while the user LAN is not, so you get false successes. Use <code>ping x.x.x.x source &lt;LAN interface&gt;</code> or test from the user PC.</p></div>

<div class="exam"><p><b>Exam trap.</b> In IOS ping output, <code>U</code> means a router sent back ICMP unreachable (a missing route somewhere in front of you), while <code>.</code> means no reply at all (often a missing <b>return</b> route or a filter). And a static that appears in the running configuration is not proof it is in the routing table.</p></div>

<div class="scn"><h4>The ticket that was two tickets</h4><p>This is INC-3104 in real life. The first engineer fixed the branch next hop, saw the ping still failing and rolled the change back, assuming the fix was wrong. The second engineer used the trace output: after the fix, the failure moved from hop 1 to hop 2. That movement proved the first fix was right and pointed to a second fault on the return path.</p><p><b>Lesson:</b> when a fix changes the symptom, keep it and follow the new symptom; layered faults are common after change windows.</p></div>

<div class="iv"><p class="q">"Users at a branch cannot reach a server at HQ after a change. How do you troubleshoot static routing?"</p><p>Strong answer: get exact source and destination, trace from the real source, and on the last responding router check <code>show ip route &lt;dest&gt;</code>. If the route is missing, use <code>show ip static route</code> to find inactive [N] statics and check their next hop and interface. Then check the return route on every router back toward the source. Look for alternating trace hops (loop) and wrong masks. Prove the fix with ping and trace from the user subnet and record the root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: scope, trace, forward route, why missing, return route, loop check, fix and prove.</li>
<li><code>show ip static route</code> exposes configured-but-inactive [N] routes.</li>
<li>Stars after a hop often mean the next router cannot route back to the source.</li>
<li>Alternating trace hops indicate a routing loop between two routers.</li>
<li>Test from the real source, and keep a fix that moves the symptom forward.</li>
</ul></div>
`,hi:`
<p>Achhi doctor guess nahi karti. Woh poochti hai kahan dard hai, temperature leti hai, pulse check karti hai, phir ek specific test likhti hai. Routing faults ko bhi wahi discipline chahiye. Lagbhag har static routing ticket paanch cheezon mein se ek hota hai: route missing hai, route configured hai par installed nahi, route ka mask ya next hop galat hai, return route missing hai, ya loop hai. Yeh chapter aapko ek workflow deta hai jo har ek ko dhoondhta hai, phir use module ke NOC ticket par use karta hai.</p>

<h3>Toolkit</h3>
<table class="cmp">
<tr><th>Command</th><th>Kis sawaal ka jawab</th></tr>
<tr><td><code>ping x.x.x.x [source intf]</code></td><td>Round trip kaam karta hai? <code>!</code> reply, <code>.</code> timeout, <code>U</code> unreachable mila.</td></tr>
<tr><td><code>traceroute x.x.x.x</code> / PC <code>trace</code></td><td>Path kahan rukta ya loop karta hai?</td></tr>
<tr><td><code>show ip route x.x.x.x</code></td><td>Is destination ke liye kaunsi entry jeetti hai, aur koi hai bhi?</td></tr>
<tr><td><code>show ip route static</code></td><td>Kaunse statics installed hain?</td></tr>
<tr><td><code>show ip static route</code></td><td>Kaunse statics configured hain, aur woh [A] active hain ya [N] not installed?</td></tr>
<tr><td><code>show ip interface brief</code></td><td>Exit interface up/up hai?</td></tr>
<tr><td><code>show ip arp</code></td><td>Next hop ka MAC resolve hua, ya Incomplete?</td></tr>
<tr><td><code>show running-config | include ip route</code></td><td>Exactly kya type kiya gaya tha?</td></tr>
</table>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Static routing troubleshooting workflow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. Scope</text><text x="80" y="64" text-anchor="middle" class="svg-muted" font-size="12">exact src aur dst</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2. Trace</text><text x="240" y="64" text-anchor="middle" class="svg-muted" font-size="12">aakhri achha hop</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3. Forward route</text><text x="400" y="64" text-anchor="middle" class="svg-muted" font-size="12">show ip route dst</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4. Missing kyun?</text><text x="560" y="64" text-anchor="middle" class="svg-muted" font-size="12">[N], mask, next hop</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="140" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="165" text-anchor="middle" class="svg-ink" font-size="12">5. Return route</text><text x="400" y="184" text-anchor="middle" class="svg-muted" font-size="12">show ip route src</text>
<rect x="170" y="140" width="140" height="60" rx="8" fill="#fed7aa"/><text x="240" y="165" text-anchor="middle" class="svg-ink" font-size="12">6. Loop?</text><text x="240" y="184" text-anchor="middle" class="svg-muted" font-size="12">hops repeat</text>
<rect x="10" y="140" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="80" y="165" text-anchor="middle" class="svg-ink" font-size="12">7. Fix aur prove</text><text x="80" y="184" text-anchor="middle" class="svg-muted" font-size="12">ping + trace</text>
<line x1="560" y1="80" x2="470" y2="160" stroke="#64748b" stroke-width="2"/><line x1="330" y1="170" x2="310" y2="170" stroke="#64748b" stroke-width="2"/><line x1="170" y1="170" x2="150" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Hamesha asli source address se test karo, router se nahi</text>
</svg><p class="cap">Saat steps, order mein. Zyada tar tickets step 5 tak solve ho jaate hain.</p></div>
<ol>
<li><b>Scope.</b> Exact source IP, destination IP aur kya kaam karta hai, yeh lo. "Jaipur HQ tak nahi pahunch raha" ban jaata hai "172.20.8.200 10.10.20.50 tak nahi pahunch raha".</li>
<li><b>Asli source se trace.</b> Jo aakhri hop jawab deta hai, wahin se shuru karo.</li>
<li><b>Forward route.</b> Us router par <code>show ip route &lt;destination&gt;</code>. Entry nahi? Galat next hop? Bahut chhota mask?</li>
<li><b>Missing kyun hai?</b> <code>show ip static route</code>: [N] matlab configured par installed nahi. Next hop <code>show ip route &lt;next hop&gt;</code> se aur interface <code>show ip interface brief</code> se check karo.</li>
<li><b>Return route.</b> Wapas ke raaste ke har router par <code>show ip route &lt;source&gt;</code>. Kisi router ke baad stars wala trace aksar matlab hai ki <b>agla</b> router aap tak wapas route nahi kar sakta.</li>
<li><b>Loop.</b> Agar trace hops do addresses ke beech badalte rahein, us destination ke liye dono routers ke routes compare karo.</li>
<li>Asli source se ping aur trace ke saath <b>fix aur prove</b> karo, phir document karo.</li>
</ol>

<h3>Walkthrough: INC-3104</h3>
<p>Ticket (P2): "Kal raat ke change window ke baad se Jaipur branch HQ file server 10.10.20.50 nahi khol pa rahi." Branch user PC: 172.20.8.200. Change ne BR-JAIPUR aur HQ-CORE dono par static routes add kiye.</p>
<p><b>Step 2 aur 3, BR-JAIPUR par:</b></p>
<pre class="out">BR-JAIPUR#show ip route 10.10.20.50
% Subnet not in table

BR-JAIPUR#show ip static route
Codes: M - Manual static, A - AAA download, N - IP NAT, D - DHCP,
       (legend trimmed)
Static local RIB for default

<span class="hl">M  10.10.0.0/16 [1/0] via 10.99.0.6 [N]</span>

BR-JAIPUR#show ip route 10.99.0.6
% Subnet not in table</pre>
<p>HQ-CAMPUS route exist karta hai lekin <b>[N]</b> hai. Uska next hop 10.99.0.6 WAN /30 par nahi hai (10.99.0.0/30 mein sirf .1 aur .2 hain), isliye recursion fail hoti hai. Asli HQ address 10.99.0.2 hai.</p>
<pre class="code">BR-JAIPUR(config)# no ip route 10.10.0.0 255.255.0.0 10.99.0.6
BR-JAIPUR(config)# ip route 10.10.0.0 255.255.0.0 10.99.0.2 name HQ-CAMPUS</pre>
<p><b>Retest.</b> Ab bhi fail, lekin alag tarah se. Yeh progress hai, failure nahi:</p>
<pre class="out">PCB&gt; trace 10.10.20.50
trace to 10.10.20.50, 8 hops max, press Ctrl+C to stop
 1   172.20.8.1   0.611 ms  0.402 ms  0.388 ms
<span class="hl"> 2   *  *  *</span></pre>
<p><b>Step 5, HQ-CORE par return route:</b> doosra hop HQ hai, aur usne jawab nahi diya. Kyun? Uska TTL-exceeded reply 172.20.8.200 tak wapas route hona chahiye.</p>
<pre class="out">HQ-CORE#show ip route 172.20.8.200
% Subnet not in table

HQ-CORE#show ip route static
<span class="hl">S        172.20.8.0/25 [1/0] via 10.99.0.1</span></pre>
<p>Mask /25 (255.255.255.128) hai, jo sirf .0 se .127 cover karta hai. .200 wala user uske bahar hai. Kam addresses wale users chal jaate, isliye aise faults confusing "sirf kuch logon ko" wali reports dete hain.</p>
<pre class="code">HQ-CORE(config)# no ip route 172.20.8.0 255.255.255.128 10.99.0.1
HQ-CORE(config)# ip route 172.20.8.0 255.255.255.0 10.99.0.1 name JAIPUR-LAN</pre>
<p><b>Step 7, prove karo:</b></p>
<pre class="out">PCB&gt; ping 10.10.20.50
84 bytes from 10.10.20.50 icmp_seq=1 ttl=62 time=1.214 ms
84 bytes from 10.10.20.50 icmp_seq=2 ttl=62 time=0.987 ms

PCB&gt; trace 10.10.20.50
trace to 10.10.20.50, 8 hops max, press Ctrl+C to stop
 1   172.20.8.1   0.514 ms  0.402 ms  0.377 ms
 2   10.99.0.2   0.981 ms  0.866 ms  0.851 ms
<span class="hl"> 3   *10.10.20.50   1.302 ms (ICMP type:3, code:3, Destination port unreachable)</span></pre>
<p>Ticket root cause ke saath close karo: "Change mein do typos: BR par galat next hop (10.99.0.6, route inactive) aur HQ par galat mask (/24 ki jagah /25). Dono theek kiye, 172.20.8.200 se reachability verify ki."</p>

<div class="eg"><p><b>Worked example: do statics ke beech loop.</b> R1 ka default R2 ki taraf hai. R2 par ek band ho chuki site ka purana static <code>ip route 192.168.99.0 255.255.255.0 10.12.12.1</code> bacha hai, jo wapas R1 ki taraf point karta hai. R1 se 192.168.99.10 tak trace:</p>
<pre class="out">R1#traceroute 192.168.99.10
Type escape sequence to abort.
Tracing the route to 192.168.99.10
VRF info: (vrf in name/id, vrf out name/id)
  1 10.12.12.2 1 msec 1 msec 0 msec
<span class="hl">  2 10.12.12.1 1 msec 1 msec 1 msec
  3 10.12.12.2 1 msec 1 msec 1 msec
  4 10.12.12.1 2 msec 1 msec 1 msec</span></pre>
<p>Badalte addresses ka matlab har router doosre ki taraf point karta hai. Packet TTL khatam hone tak uchhalta rehta hai. R2 par stale static hatao (ya use sahi next hop par point karo).</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf router se plain <code>ping</code> karke test karna. Router apne exit interface se source karta hai, ek transit subnet jise door wala end shayad wapas route na kare, to aapko jhoothe failures milte hain; ya transit subnet route hota hai jabki user LAN nahi, to jhoothi successes. <code>ping x.x.x.x source &lt;LAN interface&gt;</code> use karo ya user PC se test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> IOS ping output mein <code>U</code> matlab kisi router ne ICMP unreachable wapas bheja (aapke aage kahin route missing), jabki <code>.</code> matlab koi reply hi nahi (aksar missing <b>return</b> route ya filter). Aur running configuration mein dikhne wala static is baat ka proof nahi ki woh routing table mein hai.</p></div>

<div class="scn"><h4>Woh ticket jo do tickets tha</h4><p>Yeh real life mein INC-3104 hai. Pehle engineer ne branch ka next hop fix kiya, ping ab bhi fail dekha aur change rollback kar diya, yeh maan kar ki fix galat tha. Doosre engineer ne trace output use kiya: fix ke baad failure hop 1 se hop 2 par chala gaya. Is movement ne prove kiya ki pehla fix sahi tha aur return path par doosre fault ki taraf ishara kiya.</p><p><b>Seekh:</b> jab fix symptom badal de, use rakho aur naye symptom ko follow karo; change windows ke baad layered faults common hain.</p></div>

<div class="iv"><p class="q">"Change ke baad branch ke users HQ ke server tak nahi pahunch paa rahe. Static routing kaise troubleshoot karoge?"</p><p>Strong answer: exact source aur destination lo, asli source se trace karo, aur aakhri jawab dene wale router par <code>show ip route &lt;dest&gt;</code> check karo. Route missing ho to <code>show ip static route</code> se inactive [N] statics dhoondho aur unka next hop aur interface check karo. Phir source ki taraf wapas ke har router par return route check karo. Badalte trace hops (loop) aur galat masks dekho. User subnet se ping aur trace ke saath fix prove karo aur root cause record karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: scope, trace, forward route, missing kyun, return route, loop check, fix aur prove.</li>
<li><code>show ip static route</code> configured-par-inactive [N] routes dikhata hai.</li>
<li>Kisi hop ke baad stars aksar matlab agla router source tak wapas route nahi kar sakta.</li>
<li>Badalte trace hops do routers ke beech routing loop dikhate hain.</li>
<li>Asli source se test karo, aur jo fix symptom ko aage le jaaye use rakho.</li>
</ul></div>
`}};export{e as default};