var e={id:`bfd-virtual-chassis`,h:{en:`BFD, Virtual Chassis and upgrades without an outage`,hi:`BFD, Virtual Chassis aur bina outage ke upgrades`},body:{en:`
<p>This chapter closes the HA toolbox with three pieces: <b>BFD</b> to detect failures in under a second, <b>Virtual Chassis</b> to make several EX switches behave like one resilient device, and <b>ISSU / NSSU</b> to upgrade software without taking the network down. They are mostly conceptual in the simulator, so we show the configuration and the logic, and we are careful to call out what you cannot see in the lab.</p>

<h3>BFD: a very fast "are you there?"</h3>
<p>Routing protocols detect a dead neighbour slowly: OSPF waits for its dead interval (40 seconds by default on Ethernet) and BGP for its hold time. <b>BFD</b> (Bidirectional Forwarding Detection) is a tiny, lightweight protocol that two routers run between themselves, sending packets every few hundred milliseconds. When a number of packets in a row are missed, BFD tells the routing protocol "the neighbour is gone" immediately, and the protocol tears down the adjacency at once.</p>
<p>BFD does not replace OSPF or BGP. It is a <b>failure detector</b> that clients such as OSPF, BGP, IS-IS and static routes attach to.</p>
<dl class="terms">
<dt>minimum-interval</dt><dd>How often BFD packets are sent and expected, in milliseconds.</dd>
<dt>multiplier</dt><dd>How many consecutive packets may be missed before the session is declared down (the default is 3).</dd>
<dt>Detection time</dt><dd>Roughly interval times multiplier. 300 ms with multiplier 3 gives about 900 ms.</dd>
</dl>
<pre class="code"><span class="c">! BFD for the OSPF adjacency on ge-0/0/0.0: probe every 300 ms, down after 3 misses</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection multiplier 3</pre>
<p>The simulator accepts this configuration. Checking it with <code>show | compare</code> gives real output:</p>
<pre class="out">lab@R1# show | compare
[edit]
+   protocols {
+       ospf {
+           area 0.0.0.0 {
+               interface ge-0/0/0.0 {
+                   <span class="hl">bfd-liveness-detection {</span>
+                       minimum-interval 300;
+                       multiplier 3;
+                   }
+               }
+           }
+       }
+   }</pre>
<p>On real hardware you would verify with <code>show bfd session</code>. The simulator labs do not run a BFD session, so that command is not available in the lab; know it for the exam. Both ends must run BFD. Very aggressive timers (below about 100 ms) can cause false failures on busy control planes or paths with jitter. BFD is also useful over a tunnel (chapter on tunnels) because IP-IP has no keepalives of its own.</p>

<h3>Virtual Chassis: several switches, one device</h3>
<p>Imagine four floors, each with a switch. Managing four devices, four configurations and four spanning-tree participants is work. An EX <b>Virtual Chassis (VC)</b> connects up to several switches through <b>Virtual Chassis ports (VCPs)</b> and presents them as <b>one</b> logical switch with one management IP and one configuration.</p>
<ul>
<li>Each physical switch is a <b>member</b> (a FPC). Ports are numbered with the member ID: member 1's first port is <code>ge-1/0/0</code>.</li>
<li><b>Master</b> (the active RE): runs the control plane and holds the configuration. <b>Backup</b>: ready to take over. <b>Line cards</b>: all other members, only forwarding.</li>
<li>Master election looks at the highest <code>mastership-priority</code> (default 128), then other tie-breakers. To avoid flapping, give the intended master and backup the same high priority, so the backup does not lose its role to a returning ex-master.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Virtual Chassis with three members">
<rect x="20" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 0</text><text x="95" y="105" text-anchor="middle" class="svg-muted" font-size="12">MASTER (RE)</text>
<rect x="245" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 1</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">BACKUP (RE)</text>
<rect x="470" y="60" width="150" height="60" rx="10" fill="#e2e8f0"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 2</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">LINE CARD</text>
<line x1="170" y1="90" x2="245" y2="90" stroke="#7c3aed" stroke-width="3"/><line x1="395" y1="90" x2="470" y2="90" stroke="#7c3aed" stroke-width="3"/>
<text x="207" y="82" text-anchor="middle" class="svg-accent" font-size="12">VCP</text><text x="432" y="82" text-anchor="middle" class="svg-accent" font-size="12">VCP</text>
<rect x="60" y="160" width="520" height="40" rx="8" fill="#fde68a"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Seen by the network as ONE switch: one IP, one config, ge-0/0/x, ge-1/0/x, ge-2/0/x</text>
</svg><p class="cap">The members are cabled through VCPs. The network sees a single device with ports numbered by member.</p></div>

<p><b>Preprovisioned mode</b> is the controlled way to build a VC: you list each member's serial number and role, and only those switches may join. A switch whose serial is not listed never becomes a member. In this mode, the role decides the mastership priority (routing-engine 129, line-card 0), so you do not configure <code>mastership-priority</code> at all. The simulator enforces exactly that:</p>
<pre class="code">set virtual-chassis preprovisioned
set virtual-chassis member 0 role routing-engine serial-number NK4300A0101
set virtual-chassis member 1 role routing-engine serial-number NK4300A0102</pre>
<pre class="out">lab@DS1# set virtual-chassis member 1 mastership-priority 200
lab@DS1# commit check
[edit virtual-chassis member 1]
  'mastership-priority'
    <span class="hl">mastership-priority cannot be set in a preprovisioned Virtual Chassis (the role decides it)</span>
error: configuration check-out failed</pre>
<p>On real hardware you verify with <code>show virtual-chassis status</code> (member roles and states) and <code>show virtual-chassis vc-port</code> (VCP state). The simulator's standalone routers answer "virtual chassis is not supported on this platform in standalone mode", so treat these two commands as exam knowledge.</p>

<h3>LAGs across members</h3>
<p>A VC's best trick is a LAG whose members sit on <b>different</b> VC members, for example <code>ge-0/0/5</code> and <code>ge-1/0/5</code>. A downstream switch or server then connects with one bundle to two physical switches. If one whole VC member fails, the bundle loses one link but stays up. Combine this with GRES, NSR and NSB so that when the master fails, protocols and LACP continue without reconvergence.</p>

<h3>ISSU and NSSU: upgrades without downtime</h3>
<table class="cmp"><tr><th></th><th>ISSU</th><th>NSSU</th></tr>
<tr><td>Platform</td><td>Dual-RE chassis (for example MX)</td><td>EX Virtual Chassis (and some other multi-member systems)</td></tr>
<tr><td>Command</td><td><code>request system software in-service-upgrade &lt;package&gt;</code></td><td><code>request system software nonstop-upgrade &lt;package&gt;</code></td></tr>
<tr><td>Method</td><td>Upgrade backup RE, switch over, upgrade old master</td><td>Upgrade line cards, then backup, switch over, then old master</td></tr>
<tr><td>Prerequisites</td><td>GRES and NSR, backup RE synchronised</td><td>GRES, NSR and NSB; LAGs spanning members</td></tr></table>
<p>Both rely on everything in chapter 6. Without GRES and NSR the switchover in the middle would reset protocols, so the system refuses to start. Hosts attached by a LAG across members keep forwarding through the remaining members while each one is rebooted.</p>

<div class="eg"><p><b>Worked example.</b> An access VC of three EX switches serves a campus building. Servers connect with LACP across member 0 and member 1. The upgrade window is 11 pm. NSSU upgrades member 2 (line card) first, then the backup member 1, switches mastership, and finally upgrades member 0. The servers never lose their bundle completely; each reboot removes only one of the two LAG links.</p></div>

<div class="warn"><p><b>Common mistakes.</b> BFD timers so aggressive that a busy router creates false failures; BFD on one side only; building a VC with all LAG members on the same switch (a member failure kills the bundle); trying to run ISSU or NSSU without GRES/NSR/NSB synchronised.</p></div>
<div class="exam"><p><b>Exam trap.</b> BFD detects, it does not route. Preprovisioned VC: role sets priority (routing-engine 129), serials are mandatory, and mastership-priority is rejected. ISSU is for dual-RE routers, NSSU for Virtual Chassis. Both need GRES and NSR.</p></div>

<div class="scn"><h4>Ten-second OSPF failure</h4><p>A hospital core link flapped optically in a way that left the port "up" while no traffic crossed it. OSPF needed 40 seconds to notice, and a critical application lost its sessions. After the incident the network team enabled BFD on the core OSPF interfaces with a 300 ms interval and multiplier 3. In the next test, the adjacency fell in about a second and traffic moved to the alternate path.</p><p><b>Lesson:</b> a port that stays up is not proof that the link works.</p></div>

<div class="iv"><p class="q">"What is BFD and what are the risks of tuning it aggressively?"</p><p>BFD is a lightweight hello protocol between two routers that detects forwarding-path failure in milliseconds; routing protocols register with it and tear down their adjacency as soon as BFD declares the session down. Detection time is interval times multiplier. Very small timers can cause false positives during CPU spikes or on jittery paths, so I pick values the path can reliably sustain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD is a fast failure detector used by OSPF, BGP, IS-IS and static routes: interval times multiplier.</li>
<li>Virtual Chassis joins EX switches into one logical device with master, backup and line-card roles.</li>
<li>Preprovisioned VC uses serial numbers and roles; mastership-priority is not allowed.</li>
<li>Span LAG members across VC members for switch-level redundancy.</li>
<li>ISSU (dual-RE) and NSSU (Virtual Chassis) upgrade without outage and need GRES and NSR.</li>
</ul></div>
`,hi:`
<p>Yeh chapter HA toolbox ko teen cheezon se poora karta hai: <b>BFD</b> jo failures ko second se kam mein detect karta hai, <b>Virtual Chassis</b> jo kai EX switches ko ek resilient device ki tarah behave karwata hai, aur <b>ISSU / NSSU</b> jo software ko network band kiye bina upgrade karte hain. Simulator mein yeh zyadatar conceptual hain, isliye hum configuration aur logic dikhate hain, aur saaf batate hain ki lab mein kya nahi dikhta.</p>

<h3>BFD: bahut tez "kya tum ho?"</h3>
<p>Routing protocols dead neighbour dheere detect karte hain: OSPF apne dead interval (Ethernet par default 40 second) ka intezaar karta hai aur BGP apne hold time ka. <b>BFD</b> (Bidirectional Forwarding Detection) ek chhota, halka protocol hai jo do routers aapas mein chalate hain, har kuch sau milliseconds mein packets bhejte hain. Lagatar kai packets miss hon to BFD routing protocol ko turant batata hai "neighbour gaya", aur protocol adjacency ko usi waqt gira deta hai.</p>
<p>BFD OSPF ya BGP ki jagah nahi leta. Yeh ek <b>failure detector</b> hai jisse OSPF, BGP, IS-IS aur static routes jaise clients jude hote hain.</p>
<dl class="terms">
<dt>minimum-interval</dt><dd>BFD packets kitni der mein bheje aur expect kiye jaate hain, milliseconds mein.</dd>
<dt>multiplier</dt><dd>Session down declare hone se pehle lagatar kitne packets miss ho sakte hain (default 3).</dd>
<dt>Detection time</dt><dd>Lagbhag interval guna multiplier. 300 ms aur multiplier 3 se lagbhag 900 ms.</dd>
</dl>
<pre class="code"><span class="c">! ge-0/0/0.0 par OSPF adjacency ke liye BFD: har 300 ms probe, 3 miss par down</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection multiplier 3</pre>
<p>Simulator yeh configuration accept karta hai. <code>show | compare</code> se check karne par real output milta hai:</p>
<pre class="out">lab@R1# show | compare
[edit]
+   protocols {
+       ospf {
+           area 0.0.0.0 {
+               interface ge-0/0/0.0 {
+                   <span class="hl">bfd-liveness-detection {</span>
+                       minimum-interval 300;
+                       multiplier 3;
+                   }
+               }
+           }
+       }
+   }</pre>
<p>Real hardware par aap <code>show bfd session</code> se verify karoge. Simulator labs BFD session nahi chalate, isliye woh command lab mein available nahi; exam ke liye jaano. Dono ends par BFD chalna chahiye. Bahut aggressive timers (lagbhag 100 ms se neeche) busy control planes ya jitter wale paths par false failures la sakte hain. BFD tunnel par bhi kaam ka hai (tunnels module) kyunki IP-IP ke paas apne keepalives nahi hain.</p>

<h3>Virtual Chassis: kai switches, ek device</h3>
<p>Socho chaar floors, har ek mein ek switch. Chaar devices, chaar configurations aur chaar spanning-tree participants manage karna mehnat hai. EX <b>Virtual Chassis (VC)</b> kai switches ko <b>Virtual Chassis ports (VCPs)</b> se jodta hai aur unhe ek management IP aur ek configuration wale <b>ek</b> logical switch ki tarah dikhata hai.</p>
<ul>
<li>Har physical switch ek <b>member</b> (ek FPC) hai. Ports member ID ke saath number hote hain: member 1 ka pehla port <code>ge-1/0/0</code>.</li>
<li><b>Master</b> (active RE): control plane chalata hai aur configuration rakhta hai. <b>Backup</b>: takeover ke liye tayyar. <b>Line cards</b>: baaki sab members, sirf forwarding.</li>
<li>Master election sabse zyada <code>mastership-priority</code> (default 128) dekhta hai, phir doosre tie-breakers. Flapping se bachne ke liye intended master aur backup ko same high priority do, taaki backup lautte hue ex-master ko role na kho de.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen members wala Virtual Chassis">
<rect x="20" y="60" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 0</text><text x="95" y="105" text-anchor="middle" class="svg-muted" font-size="12">MASTER (RE)</text>
<rect x="245" y="60" width="150" height="60" rx="10" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 1</text><text x="320" y="105" text-anchor="middle" class="svg-muted" font-size="12">BACKUP (RE)</text>
<rect x="470" y="60" width="150" height="60" rx="10" fill="#e2e8f0"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="13">Member 2</text><text x="545" y="105" text-anchor="middle" class="svg-muted" font-size="12">LINE CARD</text>
<line x1="170" y1="90" x2="245" y2="90" stroke="#7c3aed" stroke-width="3"/><line x1="395" y1="90" x2="470" y2="90" stroke="#7c3aed" stroke-width="3"/>
<text x="207" y="82" text-anchor="middle" class="svg-accent" font-size="12">VCP</text><text x="432" y="82" text-anchor="middle" class="svg-accent" font-size="12">VCP</text>
<rect x="60" y="160" width="520" height="40" rx="8" fill="#fde68a"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Network ko EK switch dikhta hai: ek IP, ek config, ge-0/0/x, ge-1/0/x, ge-2/0/x</text>
</svg><p class="cap">Members VCPs se cable hote hain. Network ko member ke hisaab se number wale ports ke saath ek device dikhta hai.</p></div>

<p><b>Preprovisioned mode</b> VC banane ka controlled tareeka hai: aap har member ka serial number aur role list karte ho, aur sirf wahi switches join kar sakte hain. Jis switch ka serial list mein nahi woh kabhi member nahi banta. Is mode mein role mastership priority tay karta hai (routing-engine 129, line-card 0), isliye <code>mastership-priority</code> configure hi nahi karte. Simulator yahi enforce karta hai:</p>
<pre class="code">set virtual-chassis preprovisioned
set virtual-chassis member 0 role routing-engine serial-number NK4300A0101
set virtual-chassis member 1 role routing-engine serial-number NK4300A0102</pre>
<pre class="out">lab@DS1# set virtual-chassis member 1 mastership-priority 200
lab@DS1# commit check
[edit virtual-chassis member 1]
  'mastership-priority'
    <span class="hl">mastership-priority cannot be set in a preprovisioned Virtual Chassis (the role decides it)</span>
error: configuration check-out failed</pre>
<p>Real hardware par <code>show virtual-chassis status</code> (member roles aur states) aur <code>show virtual-chassis vc-port</code> (VCP state) se verify karte hain. Simulator ke standalone routers "virtual chassis is not supported on this platform in standalone mode" jawab dete hain, isliye in do commands ko exam knowledge maano.</p>

<h3>Members ke across LAG</h3>
<p>VC ki sabse achhi chaal ek aisa LAG hai jiske members <b>alag</b> VC members par hon, jaise <code>ge-0/0/5</code> aur <code>ge-1/0/5</code>. Downstream switch ya server tab ek bundle se do physical switches se jurta hai. Poora VC member fail ho jaaye to bundle ek link kho deta hai lekin up rehta hai. Ise GRES, NSR aur NSB ke saath jodo taaki master fail hone par protocols aur LACP bina reconvergence ke chalte rahein.</p>

<h3>ISSU aur NSSU: bina downtime ke upgrades</h3>
<table class="cmp"><tr><th></th><th>ISSU</th><th>NSSU</th></tr>
<tr><td>Platform</td><td>Dual-RE chassis (jaise MX)</td><td>EX Virtual Chassis (aur kuch aur multi-member systems)</td></tr>
<tr><td>Command</td><td><code>request system software in-service-upgrade &lt;package&gt;</code></td><td><code>request system software nonstop-upgrade &lt;package&gt;</code></td></tr>
<tr><td>Method</td><td>Backup RE upgrade, switchover, purana master upgrade</td><td>Line cards upgrade, phir backup, switchover, phir purana master</td></tr>
<tr><td>Prerequisites</td><td>GRES aur NSR, backup RE synchronised</td><td>GRES, NSR aur NSB; members ke across LAGs</td></tr></table>
<p>Dono chapter 6 ki har cheez par depend karte hain. GRES aur NSR ke bina beech ka switchover protocols reset kar deta, isliye system shuru hone se inkaar karta hai. Members ke across LAG se jude hosts har member ke reboot ke dauran bache hue members se forward karte rehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Teen EX switches ka access VC ek campus building ko serve karta hai. Servers member 0 aur member 1 ke across LACP se jude hain. Upgrade window raat 11 baje hai. NSSU pehle member 2 (line card) upgrade karta hai, phir backup member 1, mastership switch karta hai, aur aakhir mein member 0. Servers apna bundle poori tarah kabhi nahi khote; har reboot do LAG links mein se sirf ek hatata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> BFD timers itne aggressive ki busy router false failures banaye; BFD sirf ek side par; saare LAG members ek hi switch par rakhkar VC banana (member fail hone par bundle mar jaata hai); GRES/NSR/NSB synchronised hue bina ISSU ya NSSU chalane ki koshish.</p></div>
<div class="exam"><p><b>Exam trap.</b> BFD detect karta hai, route nahi karta. Preprovisioned VC: role priority tay karta hai (routing-engine 129), serials zaroori, mastership-priority reject. ISSU dual-RE routers ke liye, NSSU Virtual Chassis ke liye. Dono ko GRES aur NSR chahiye.</p></div>

<div class="scn"><h4>Das-second ka OSPF failure</h4><p>Ek hospital ke core link ne optically aise flap kiya ki port "up" raha lekin koi traffic paar nahi hua. OSPF ko notice karne mein 40 second lage, aur ek critical application ke sessions gir gaye. Incident ke baad network team ne core OSPF interfaces par 300 ms interval aur multiplier 3 ke saath BFD enable kiya. Agle test mein adjacency lagbhag ek second mein giri aur traffic alternate path par chala gaya.</p><p><b>Lesson:</b> port ka up rehna saboot nahi ki link kaam karta hai.</p></div>

<div class="iv"><p class="q">"BFD kya hai aur use aggressively tune karne ke risks kya hain?"</p><p>BFD do routers ke beech halka hello protocol hai jo forwarding-path failure milliseconds mein detect karta hai; routing protocols uske saath register karte hain aur BFD session down declare karte hi adjacency gira dete hain. Detection time interval guna multiplier hai. Bahut chhote timers CPU spikes ya jittery paths par false positives la sakte hain, isliye main aise values chunta hoon jo path bharosemand tareeke se sambhal sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD tez failure detector hai jo OSPF, BGP, IS-IS aur static routes use karte hain: interval guna multiplier.</li>
<li>Virtual Chassis EX switches ko master, backup aur line-card roles ke saath ek logical device banata hai.</li>
<li>Preprovisioned VC serial numbers aur roles use karta hai; mastership-priority allowed nahi.</li>
<li>Switch-level redundancy ke liye LAG members ko VC members ke across rakho.</li>
<li>ISSU (dual-RE) aur NSSU (Virtual Chassis) bina outage upgrade karte hain aur GRES aur NSR chahiye.</li>
</ul></div>
`}};export{e as default};