var e={id:`verify-troubleshoot`,h:{en:`Verification and a troubleshooting workflow`,hi:`Verification aur troubleshooting workflow`},body:{en:`
<p>A good doctor does not start with surgery. She asks where it hurts, checks the vital signs in a fixed order, and only then decides. Spanning tree problems deserve the same discipline. Almost every STP ticket is one of four things: the <b>wrong root</b>, a <b>blocked or unexpected path</b>, an <b>unstable tree</b> (topology changes), or a <b>protection feature that fired</b>. A fixed workflow finds each of them in minutes.</p>

<h3>The verification toolbox</h3>
<table class="cmp"><tr><th>Command</th><th>What it answers</th></tr>
<tr><td><code>show spanning-tree vlan N</code></td><td>Root ID, own Bridge ID, root port and cost, every port's role, state, cost, port ID and type</td></tr>
<tr><td><code>show spanning-tree root</code></td><td>One line per VLAN: root BID, root cost, root port. Fastest way to compare switches</td></tr>
<tr><td><code>show spanning-tree summary</code></td><td>Mode, which VLANs this switch is root for, global PortFast/guard defaults, path cost method, port counts per state</td></tr>
<tr><td><code>show spanning-tree blockedports</code></td><td>Every discarding port per VLAN</td></tr>
<tr><td><code>show spanning-tree interface Gi0/5 [detail]</code></td><td>The port's role in every VLAN; detail adds PortFast and guard status</td></tr>
<tr><td><code>show spanning-tree vlan N detail</code></td><td>Number of topology changes, time since the last one, and the port it came from</td></tr>
<tr><td><code>show spanning-tree inconsistentports</code></td><td>Ports blocked by Root Guard or Loop Guard</td></tr>
<tr><td><code>show interfaces status err-disabled</code></td><td>Ports shut by BPDU Guard (reason bpduguard)</td></tr>
<tr><td><code>show cdp neighbors</code></td><td>Which switch is behind a root port or an unknown root MAC</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="STP troubleshooting workflow">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="56" text-anchor="middle" class="svg-ink" font-size="13">1. Scope</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="12">VLAN, users</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="13">2. Root?</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="12">per VLAN</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">3. Path</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="12">RP, cost, BLK</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="440" y="56" text-anchor="middle" class="svg-ink" font-size="13">4. Guards</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="12">err-dis, Inc</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="13">5. Stability</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="12">TC count</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">compare every finding with the design, then fix and re-verify</text>
</svg><p class="cap">Five checks, always in the same order.</p></div>

<h3>The workflow</h3>
<ol>
<li><b>Scope.</b> Which VLANs and users are affected, since when, and what changed? STP is per VLAN, so "only VLAN 10 is slow" already narrows the search.</li>
<li><b>Who is root?</b> Run <code>show spanning-tree root</code> on two or three switches. Every switch must show the same root per VLAN, and it must be the switch in your design.</li>
<li><b>Walk the path.</b> On each switch from the users toward the root, check the root port and root cost with <code>show spanning-tree vlan N</code>. List blocked ports with <code>show spanning-tree blockedports</code> and compare them with the design. An unexpected alternate port usually means a changed cost, priority or cabling.</li>
<li><b>Check the guards.</b> <code>show interfaces status err-disabled</code> for BPDU Guard, <code>show spanning-tree inconsistentports</code> for Root Guard and Loop Guard, and the log for SPANTREE messages.</li>
<li><b>Check stability.</b> <code>show spanning-tree vlan N detail</code>: if the topology change count keeps rising, follow the "from" port to its neighbour and repeat until you reach the source.</li>
</ol>

<h3>Case 1: wrong root</h3>
<pre class="out">DSW1# show spanning-tree vlan 10 | include Root ID|Address|Cost|Port
  Root ID    Priority    32778
<span class="hl">             Address     0019.e84a.1100</span>
             Cost        8
             Port        3 (GigabitEthernet1/0/3)</pre>
<p>DSW1 should be root but reports a root two hops away with default priority. Follow the root port with <code>show cdp neighbors Gi1/0/3</code>, then repeat on the next switch until you find the box whose Bridge ID equals the Root ID. Fix: explicit low priority on the intended root (and secondary), then Root Guard on downlinks.</p>

<h3>Case 2: the blocked uplink (lab ticket)</h3>
<p>Ticket: "VLAN 10 users on SW3 are slow; the SW1 uplink shows no traffic." In the lab's intended design SW3 Gi0/1 should be the VLAN 10 root port.</p>
<pre class="out">SW3# show spanning-tree vlan 10 | begin Root ID
  Root ID    Priority    24586
             Address     5254.0023.a200
<span class="hl">             Cost        8</span>
<span class="hl">             Port        3 (GigabitEthernet0/2)</span>
...
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1               Altn BLK 19        128.2    P2p</span>
Gi0/2               Root FWD 4         128.3    P2p
Gi0/5               Desg FWD 4         128.6    P2p Edge</pre>
<div class="eg"><p><b>Diagnosis.</b> The root is correct (SW1, 24586). But Gi0/1 has cost <b>19</b>, the FastEthernet value, although it is a gigabit port. Via Gi0/1 the cost is 19; via Gi0/2 it is SW2's 4 + 4 = 8, so Gi0/2 wins and VLAN 10 detours through SW2. <code>show running-config interface Gi0/1</code> reveals <code>spanning-tree vlan 10 cost 19</code> left by an old template. Remove it with <code>no spanning-tree vlan 10 cost</code>; Gi0/1 returns to cost 4, becomes root port, and Gi0/2 goes back to alternate.</p></div>

<h3>Case 3: an unstable tree</h3>
<pre class="out">SW3# show spanning-tree vlan 10 detail | include occurr|from
<span class="hl">  Number of topology changes 236 last change occurred 00:00:41 ago</span>
<span class="hl">          from GigabitEthernet0/5</span></pre>
<p>Hundreds of topology changes from Gi0/5, a desk port. It is not configured as PortFast, so each time the PC sleeps, wakes or reboots, a non-edge port goes to forwarding and a TC floods through the VLAN, flushing MAC tables and causing bursts of flooding. Fix: <code>spanning-tree portfast</code> (and BPDU Guard) on the port. If the "from" port is an uplink, go to that neighbour and repeat.</p>

<h3>Case 4: a guard fired</h3>
<ul>
<li><b>err-disabled, reason bpduguard</b>: find and remove the device sending BPDUs (the ROGUE switch in the lab), then <code>shutdown</code> and <code>no shutdown</code>, or wait for errdisable recovery if configured.</li>
<li><b>Root Inconsistent</b>: the downstream switch is advertising a better Bridge ID. Correct its priority; the port unblocks by itself.</li>
<li><b>Loop Inconsistent</b>: BPDUs stopped on a root or alternate port. Suspect a unidirectional link or a neighbour that stopped running STP; check the fibre and the neighbour's configuration.</li>
</ul>
<pre class="out">DSW1# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
<span class="hl">VLAN0010             GigabitEthernet0/10      Root Inconsistent</span>

Number of inconsistent ports (segments) in the system : 1</pre>

<div class="warn"><p><b>Common mistake.</b> "Fixing" a guard by removing it. BPDU Guard, Root Guard and Loop Guard are symptoms of a real problem elsewhere. Remove the cause, not the alarm.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>show spanning-tree</code>, the <b>Root ID</b> block describes the root and the <b>Bridge ID</b> block describes the local switch. The <b>Cost</b> in the Root ID block is the total root path cost; the Cost column in the interface table is the individual port cost. Questions love to mix the two.</p></div>

<div class="scn"><h4>Monday morning slowness</h4><p>A bank branch reported slow applications every Monday from 9:00 to 9:15. The engineer found no errors or wrong root, but <code>show spanning-tree detail</code> on the distribution switch showed over a thousand topology changes, most recent "from" an access uplink. Following the chain led to an access switch where forty desk ports had no PortFast; every Monday the PCs woke from sleep together, each causing a TC. Enabling <code>spanning-tree portfast default</code> and <code>spanning-tree portfast bpduguard default</code> on the access switches ended the Monday flooding.</p><p><b>Lesson:</b> a climbing topology change counter is a symptom; follow the "from" port to the source.</p></div>

<div class="iv"><p class="q">"Users in one VLAN say the network is slow and you suspect spanning tree. What do you check?"</p><p>Strong answer: a structured order. Confirm the root for that VLAN on several switches with show spanning-tree root and compare to the design. Walk the path from the access switch to the root checking root ports, costs and blocked ports. Check err-disabled ports and inconsistent ports. Check topology change counters with show spanning-tree detail and trace the "from" port. Mention concrete causes: wrong root, a manual cost, a missing PortFast, a unidirectional link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: scope, root per VLAN, path and blocked ports, guards, stability.</li>
<li><code>show spanning-tree root</code> must show the same designed root on every switch.</li>
<li>An unexpected alternate port usually means a changed cost, priority or cabling; check the Cost column and running config.</li>
<li>Rising topology changes: trace the "from" port; usually a host port without PortFast.</li>
<li>err-disabled = BPDU Guard (manual recovery); Root/Loop Inconsistent = Root/Loop Guard (automatic recovery).</li>
</ul></div>
`,hi:`
<p>Accha doctor surgery se shuru nahi karta. Woh poochti hai dard kahan hai, vital signs ek fixed order mein check karti hai, aur tabhi decide karti hai. Spanning tree problems ko bhi yahi discipline chahiye. Lagbhag har STP ticket chaar mein se ek cheez hota hai: <b>galat root</b>, <b>blocked ya unexpected path</b>, <b>unstable tree</b> (topology changes), ya <b>protection feature jo fire ho gaya</b>. Ek fixed workflow inmein se har ek ko minutes mein dhoondh leta hai.</p>

<h3>Verification toolbox</h3>
<table class="cmp"><tr><th>Command</th><th>Kya batata hai</th></tr>
<tr><td><code>show spanning-tree vlan N</code></td><td>Root ID, apna Bridge ID, root port aur cost, har port ka role, state, cost, port ID aur type</td></tr>
<tr><td><code>show spanning-tree root</code></td><td>Har VLAN ki ek line: root BID, root cost, root port. Switches compare karne ka sabse tez tareeka</td></tr>
<tr><td><code>show spanning-tree summary</code></td><td>Mode, yeh switch kin VLANs ka root hai, global PortFast/guard defaults, path cost method, har state mein ports ki ginti</td></tr>
<tr><td><code>show spanning-tree blockedports</code></td><td>Har VLAN ka har discarding port</td></tr>
<tr><td><code>show spanning-tree interface Gi0/5 [detail]</code></td><td>Har VLAN mein port ka role; detail PortFast aur guard status jodta hai</td></tr>
<tr><td><code>show spanning-tree vlan N detail</code></td><td>Topology changes ki ginti, aakhri change ke baad ka time, aur woh kis port se aaya</td></tr>
<tr><td><code>show spanning-tree inconsistentports</code></td><td>Root Guard ya Loop Guard se blocked ports</td></tr>
<tr><td><code>show interfaces status err-disabled</code></td><td>BPDU Guard se band ports (reason bpduguard)</td></tr>
<tr><td><code>show cdp neighbors</code></td><td>Root port ya unknown root MAC ke peeche kaunsa switch hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="STP troubleshooting workflow">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="56" text-anchor="middle" class="svg-ink" font-size="13">1. Scope</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="12">VLAN, users</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="13">2. Root?</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="12">har VLAN</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">3. Path</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="12">RP, cost, BLK</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fed7aa"/><text x="440" y="56" text-anchor="middle" class="svg-ink" font-size="13">4. Guards</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="12">err-dis, Inc</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="13">5. Stability</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="12">TC count</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="13">har finding ko design se compare karo, phir fix aur re-verify</text>
</svg><p class="cap">Paanch checks, hamesha same order mein.</p></div>

<h3>Workflow</h3>
<ol>
<li><b>Scope.</b> Kaunse VLANs aur users affected hain, kab se, aur kya badla? STP per VLAN hai, isliye "sirf VLAN 10 slow hai" search ko pehle hi chhota kar deta hai.</li>
<li><b>Root kaun hai?</b> Do teen switches par <code>show spanning-tree root</code> chalao. Har switch ko har VLAN ka same root dikhna chahiye, aur woh aapke design wala switch hona chahiye.</li>
<li><b>Path par chalo.</b> Users se root ki taraf har switch par <code>show spanning-tree vlan N</code> se root port aur root cost check karo. <code>show spanning-tree blockedports</code> se blocked ports list karo aur design se compare karo. Unexpected alternate port ka matlab aam taur par badli hui cost, priority ya cabling hai.</li>
<li><b>Guards check karo.</b> BPDU Guard ke liye <code>show interfaces status err-disabled</code>, Root Guard aur Loop Guard ke liye <code>show spanning-tree inconsistentports</code>, aur SPANTREE messages ke liye log.</li>
<li><b>Stability check karo.</b> <code>show spanning-tree vlan N detail</code>: agar topology change count badhta ja raha hai, "from" port ke neighbour tak jao aur source milne tak repeat karo.</li>
</ol>

<h3>Case 1: galat root</h3>
<pre class="out">DSW1# show spanning-tree vlan 10 | include Root ID|Address|Cost|Port
  Root ID    Priority    32778
<span class="hl">             Address     0019.e84a.1100</span>
             Cost        8
             Port        3 (GigabitEthernet1/0/3)</pre>
<p>DSW1 ko root hona chahiye lekin woh default priority wala root do hops door report karta hai. <code>show cdp neighbors Gi1/0/3</code> se root port follow karo, phir agle switch par repeat karo jab tak woh box na mile jiska Bridge ID Root ID ke barabar hai. Fix: intended root (aur secondary) par explicit low priority, phir downlinks par Root Guard.</p>

<h3>Case 2: blocked uplink (lab ticket)</h3>
<p>Ticket: "SW3 par VLAN 10 users slow hain; SW1 uplink par koi traffic nahi dikhta." Lab ke intended design mein SW3 Gi0/1 VLAN 10 ka root port hona chahiye.</p>
<pre class="out">SW3# show spanning-tree vlan 10 | begin Root ID
  Root ID    Priority    24586
             Address     5254.0023.a200
<span class="hl">             Cost        8</span>
<span class="hl">             Port        3 (GigabitEthernet0/2)</span>
...
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1               Altn BLK 19        128.2    P2p</span>
Gi0/2               Root FWD 4         128.3    P2p
Gi0/5               Desg FWD 4         128.6    P2p Edge</pre>
<div class="eg"><p><b>Diagnosis.</b> Root sahi hai (SW1, 24586). Lekin Gi0/1 ki cost <b>19</b> hai, FastEthernet wali value, jabki yeh gigabit port hai. Gi0/1 se cost 19 hai; Gi0/2 se SW2 ka 4 + 4 = 8, isliye Gi0/2 jeetta hai aur VLAN 10 SW2 se ghoom kar jaata hai. <code>show running-config interface Gi0/1</code> purane template ki chhodi hui <code>spanning-tree vlan 10 cost 19</code> dikhata hai. Ise <code>no spanning-tree vlan 10 cost</code> se hatao; Gi0/1 cost 4 par wapas aata hai, root port banta hai, aur Gi0/2 wapas alternate ho jaata hai.</p></div>

<h3>Case 3: unstable tree</h3>
<pre class="out">SW3# show spanning-tree vlan 10 detail | include occurr|from
<span class="hl">  Number of topology changes 236 last change occurred 00:00:41 ago</span>
<span class="hl">          from GigabitEthernet0/5</span></pre>
<p>Gi0/5 se sainkdon topology changes, jo ek desk port hai. Yeh PortFast configured nahi hai, isliye har baar jab PC sleep, wake ya reboot karta hai, ek non-edge port forwarding mein jaata hai aur ek TC VLAN mein flood hota hai, MAC tables flush karta hai aur flooding ke bursts laata hai. Fix: port par <code>spanning-tree portfast</code> (aur BPDU Guard). Agar "from" port uplink hai, to us neighbour par jao aur repeat karo.</p>

<h3>Case 4: guard fire ho gaya</h3>
<ul>
<li><b>err-disabled, reason bpduguard</b>: BPDUs bhejne wala device dhoondho aur hatao (lab mein ROGUE switch), phir <code>shutdown</code> aur <code>no shutdown</code>, ya agar configured hai to errdisable recovery ka wait karo.</li>
<li><b>Root Inconsistent</b>: downstream switch better Bridge ID advertise kar raha hai. Uski priority theek karo; port khud unblock ho jaata hai.</li>
<li><b>Loop Inconsistent</b>: root ya alternate port par BPDUs ruk gaye. Unidirectional link ya aise neighbour par shak karo jisne STP chalana band kar diya; fibre aur neighbour ka configuration check karo.</li>
</ul>
<pre class="out">DSW1# show spanning-tree inconsistentports

Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
<span class="hl">VLAN0010             GigabitEthernet0/10      Root Inconsistent</span>

Number of inconsistent ports (segments) in the system : 1</pre>

<div class="warn"><p><b>Common galti.</b> Guard ko hata kar "fix" karna. BPDU Guard, Root Guard aur Loop Guard kahin aur ki asli problem ke symptoms hain. Alarm nahi, cause hatao.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>show spanning-tree</code> mein <b>Root ID</b> block root ko describe karta hai aur <b>Bridge ID</b> block local switch ko. Root ID block ka <b>Cost</b> total root path cost hai; interface table ka Cost column individual port cost hai. Questions dono ko mix karna pasand karte hain.</p></div>

<div class="scn"><h4>Monday subah ki slowness</h4><p>Ek bank branch ne report kiya ki har Monday 9:00 se 9:15 tak applications slow hoti hain. Engineer ko na errors mile na galat root, lekin distribution switch par <code>show spanning-tree detail</code> ne hazaar se zyada topology changes dikhaye, sabse haal ka "from" ek access uplink tha. Chain follow karne par ek access switch mila jahan chaalis desk ports par PortFast nahi tha; har Monday PCs ek saath sleep se jaagte the, aur har ek TC karta tha. Access switches par <code>spanning-tree portfast default</code> aur <code>spanning-tree portfast bpduguard default</code> enable karne se Monday ki flooding khatam hui.</p><p><b>Seekh:</b> badhta topology change counter symptom hai; source tak "from" port follow karo.</p></div>

<div class="iv"><p class="q">"Ek VLAN ke users kehte hain network slow hai aur aapko spanning tree par shak hai. Aap kya check karoge?"</p><p>Strong answer: ek structured order. show spanning-tree root se kai switches par us VLAN ka root confirm karo aur design se compare karo. Access switch se root tak path par root ports, costs aur blocked ports check karte hue chalo. Err-disabled ports aur inconsistent ports check karo. show spanning-tree detail se topology change counters check karo aur "from" port trace karo. Concrete causes batao: galat root, manual cost, missing PortFast, unidirectional link.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: scope, har VLAN ka root, path aur blocked ports, guards, stability.</li>
<li><code>show spanning-tree root</code> har switch par same designed root dikhana chahiye.</li>
<li>Unexpected alternate port ka matlab aam taur par badli cost, priority ya cabling; Cost column aur running config check karo.</li>
<li>Badhte topology changes: "from" port trace karo; aksar bina PortFast wala host port.</li>
<li>err-disabled = BPDU Guard (manual recovery); Root/Loop Inconsistent = Root/Loop Guard (automatic recovery).</li>
</ul></div>
`}};export{e as default};