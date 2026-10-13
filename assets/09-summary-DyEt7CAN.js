var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You began this module with a hospital that has a spare of everything. You can now bundle links, share a gateway, protect the Routing Engine, detect failures quickly and describe how a Virtual Chassis is upgraded without an outage. This chapter is the revision sheet for JN0-351 / JN0-352 high availability and for interviews: a can-do checklist, the most tested facts, a command cheat-sheet and a mini glossary.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Build an ae interface: chassis device-count, member 802.3ad statements, ae0 configuration (chapter 2).</li>
<li>Choose LACP active, explain passive, timers and minimum-links, and read <code>show lacp interfaces</code> (chapter 3).</li>
<li>Configure a VRRP group with virtual address, priority and accept-data and read <code>show vrrp</code> (chapter 4).</li>
<li>Add tracking, do the priority arithmetic, test a failover and explain preemption (chapter 5).</li>
<li>Explain GRES, graceful restart, NSR and NSB, and the commit rules between them (chapter 6).</li>
<li>Configure BFD timers, describe a Virtual Chassis and its roles, and compare ISSU with NSSU (chapter 7).</li>
<li>Run the HA checklist and fix three stacked LAG faults (chapter 8).</li>
</ul>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>LAG</td><td>Needs chassis device-count; members use 802.3ad aeN; logical config goes on aeN</td></tr>
<tr><td>LACP</td><td>Active speaks, passive answers; passive + passive never forms; default slow = 30 s, fast = 1 s</td></tr>
<tr><td>minimum-links</td><td>Whole ae goes down if fewer members are active</td></tr>
<tr><td>Healthy LACP member</td><td>Receive Current, Mux Collecting distributing</td></tr>
<tr><td>VRRP defaults</td><td>Priority 100, preempt on, advertise 1 s, accept-data off; 255 = owner</td></tr>
<tr><td>VRRP virtual MAC</td><td>00:00:5e:00:01:XX (XX = group in hex)</td></tr>
<tr><td>VRRP tracking</td><td>Current priority = configured minus incurred priority-cost</td></tr>
<tr><td>VRRP transport</td><td>IP protocol 112 to 224.0.0.18</td></tr>
<tr><td>GRES</td><td>Kernel and PFE survive; routing process restarts</td></tr>
<tr><td>NSR</td><td>Needs GRES and commit synchronize; excludes graceful restart</td></tr>
<tr><td>NSB</td><td>Needs GRES; for Layer 2 protocols</td></tr>
<tr><td>BFD</td><td>Detection time = interval times multiplier; a detector, not a routing protocol</td></tr>
<tr><td>Preprovisioned VC</td><td>Serial and role; routing-engine priority 129, line-card 0; no mastership-priority</td></tr>
<tr><td>ISSU / NSSU</td><td>Dual-RE routers / Virtual Chassis; need GRES and NSR</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Which feature for which failure">
<rect x="20" y="20" width="190" height="55" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Cable / port fails</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">LAG + LACP</text>
<rect x="225" y="20" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Gateway fails</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">VRRP + tracking</text>
<rect x="430" y="20" width="190" height="55" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine fails</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">GRES + NSR / NSB</text>
<rect x="20" y="95" width="190" height="55" rx="8" fill="#fde68a"/><text x="115" y="119" text-anchor="middle" class="svg-ink" font-size="13">Need faster detection</text><text x="115" y="137" text-anchor="middle" class="svg-muted" font-size="12">BFD</text>
<rect x="225" y="95" width="190" height="55" rx="8" fill="#fed7aa"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">Whole switch fails</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">Virtual Chassis + cross-member LAG</text>
<rect x="430" y="95" width="190" height="55" rx="8" fill="#e2e8f0"/><text x="525" y="119" text-anchor="middle" class="svg-ink" font-size="13">Software upgrade</text><text x="525" y="137" text-anchor="middle" class="svg-muted" font-size="12">ISSU / NSSU</text>
</svg><p class="cap">Match each failure to its protection. This table is the heart of the exam.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LAG</span>
set chassis aggregated-devices ethernet device-count 1
set interfaces ge-0/0/10 ether-options 802.3ad ae0
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options minimum-links 2
<span class="c">! VRRP</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 priority 200
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 accept-data
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 track interface ge-0/0/0 priority-cost 150
<span class="c">! RE redundancy</span>
set chassis redundancy graceful-switchover
set routing-options nonstop-routing
set system commit synchronize
<span class="c">! BFD</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300

<span class="c">! Verify</span>
show interfaces ae0 terse
show lacp interfaces
show lacp statistics interfaces ae0
show vrrp
show vrrp detail
show vrrp track
show system switchover
show task replication</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LAG / ae</dt><dd>Link aggregation group; the logical aggregated Ethernet interface.</dd>
<dt>LACP</dt><dd>Protocol that negotiates which links belong to a LAG (802.3ad / 802.1AX).</dd>
<dt>VRRP</dt><dd>Virtual Router Redundancy Protocol; routers share a virtual gateway.</dd>
<dt>Priority-cost</dt><dd>Amount subtracted from VRRP priority when a tracked object fails.</dd>
<dt>RE / PFE</dt><dd>Routing Engine (control plane) and Packet Forwarding Engine (forwarding plane).</dd>
<dt>GRES</dt><dd>Graceful Routing Engine switchover: backup RE takes over with kernel state.</dd>
<dt>NSR / NSB</dt><dd>Nonstop routing / nonstop bridging: protocol state replicated to the backup RE.</dd>
<dt>BFD</dt><dd>Bidirectional Forwarding Detection: sub-second failure detection.</dd>
<dt>VC / VCP</dt><dd>Virtual Chassis / Virtual Chassis port: several EX switches as one device.</dd>
<dt>ISSU / NSSU</dt><dd>In-service software upgrade / nonstop software upgrade.</dd>
</dl>

<div class="eg"><p><b>Worked example for revision.</b> "R1 priority 150, track cost 40, R2 priority 100. Uplink on R1 fails." R1 falls to 110, still above 100, so R1 stays master and sends traffic into a dead uplink. The fix is a cost above 50. Do this subtraction on every VRRP question.</p></div>

<div class="warn"><p><b>Last-minute mistake list.</b> Forgetting device-count; lacp passive on both ends; VLAN config on member ports; VRRP without accept-data when monitoring pings the VIP; tracking cost too small; enabling NSR with graceful restart; setting mastership-priority in a preprovisioned VC.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> NSR needs GRES plus commit synchronize and excludes GR. LACP passive + passive fails. Tracking arithmetic decides the master. Preprovisioned VC rejects mastership-priority. BFD detects but does not route.</p></div>

<div class="scn"><h4>Putting it all together</h4><p>A new campus building gets two access switches in a Virtual Chassis, each server connected with a LACP bundle across both members, two gateways with VRRP and an uplink tracking cost that drops the active gateway below the backup, GRES with NSR on the core chassis, and BFD on the core links. The upgrade night uses NSSU; no user notices. Every piece in this list is one chapter of the module.</p><p><b>Lesson:</b> HA is layers working together, each tested and monitored.</p></div>

<div class="iv"><p class="q">"Design high availability for a branch with two routers, one access switch and one WAN link each."</p><p>I would give the switch a LACP bundle if it has two uplinks, run VRRP between the routers with priority 200 and 100, track each router's WAN interface (or a default route) with a cost large enough to flip mastership, consider BFD on the routing adjacency for fast detection, and test by pulling each cable. If the routers have two REs, I would add GRES and NSR. I would monitor LACP and VRRP state so a silent failure shows up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match failure to protection: LAG links, VRRP gateway, GRES/NSR RE, VC switch, BFD detection.</li>
<li>Know the defaults: VRRP priority 100 and preempt on, accept-data off, LACP slow, BFD multiplier 3.</li>
<li>Do the tracking subtraction on every VRRP question.</li>
<li>Remember the commit rules: NSR needs GRES and commit synchronize, excludes graceful restart.</li>
<li>Verify with show lacp interfaces, show vrrp detail, show task replication, and test failovers.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat aapne har cheez ke spare wale hospital se ki thi. Ab aap links bundle kar sakte ho, gateway share kar sakte ho, Routing Engine ko protect kar sakte ho, failures jaldi detect kar sakte ho aur samjha sakte ho ki Virtual Chassis bina outage ke kaise upgrade hota hai. Yeh chapter JN0-351 / JN0-352 high availability aur interviews ki revision sheet hai: can-do checklist, sabse zyada pooche jaane wale facts, command cheat-sheet aur mini glossary.</p>

<h3>Can-do checklist</h3>
<ul>
<li>ae interface banao: chassis device-count, member 802.3ad statements, ae0 configuration (chapter 2).</li>
<li>LACP active chuno, passive, timers aur minimum-links samjhao, aur <code>show lacp interfaces</code> padho (chapter 3).</li>
<li>Virtual address, priority aur accept-data ke saath VRRP group configure karo aur <code>show vrrp</code> padho (chapter 4).</li>
<li>Tracking jodo, priority ka hisaab karo, failover test karo aur preemption samjhao (chapter 5).</li>
<li>GRES, graceful restart, NSR aur NSB samjhao, aur unke beech ke commit rules (chapter 6).</li>
<li>BFD timers configure karo, Virtual Chassis aur uske roles batao, aur ISSU ko NSSU se compare karo (chapter 7).</li>
<li>HA checklist chalao aur teen stacked LAG faults theek karo (chapter 8).</li>
</ul>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>LAG</td><td>chassis device-count chahiye; members 802.3ad aeN use karte hain; logical config aeN par jaati hai</td></tr>
<tr><td>LACP</td><td>Active bolta hai, passive jawab deta hai; passive + passive kabhi nahi banta; default slow = 30 s, fast = 1 s</td></tr>
<tr><td>minimum-links</td><td>Kam members active hon to poora ae down</td></tr>
<tr><td>Healthy LACP member</td><td>Receive Current, Mux Collecting distributing</td></tr>
<tr><td>VRRP defaults</td><td>Priority 100, preempt on, advertise 1 s, accept-data off; 255 = owner</td></tr>
<tr><td>VRRP virtual MAC</td><td>00:00:5e:00:01:XX (XX = hex mein group)</td></tr>
<tr><td>VRRP tracking</td><td>Current priority = configured minus incurred priority-cost</td></tr>
<tr><td>VRRP transport</td><td>IP protocol 112, 224.0.0.18 par</td></tr>
<tr><td>GRES</td><td>Kernel aur PFE bachte hain; routing process restart hota hai</td></tr>
<tr><td>NSR</td><td>GRES aur commit synchronize chahiye; graceful restart exclude</td></tr>
<tr><td>NSB</td><td>GRES chahiye; Layer 2 protocols ke liye</td></tr>
<tr><td>BFD</td><td>Detection time = interval guna multiplier; detector hai, routing protocol nahi</td></tr>
<tr><td>Preprovisioned VC</td><td>Serial aur role; routing-engine priority 129, line-card 0; mastership-priority nahi</td></tr>
<tr><td>ISSU / NSSU</td><td>Dual-RE routers / Virtual Chassis; GRES aur NSR chahiye</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kaunsa feature kaunse failure ke liye">
<rect x="20" y="20" width="190" height="55" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Cable / port fail</text><text x="115" y="62" text-anchor="middle" class="svg-muted" font-size="12">LAG + LACP</text>
<rect x="225" y="20" width="190" height="55" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Gateway fail</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">VRRP + tracking</text>
<rect x="430" y="20" width="190" height="55" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine fail</text><text x="525" y="62" text-anchor="middle" class="svg-muted" font-size="12">GRES + NSR / NSB</text>
<rect x="20" y="95" width="190" height="55" rx="8" fill="#fde68a"/><text x="115" y="119" text-anchor="middle" class="svg-ink" font-size="13">Tez detection chahiye</text><text x="115" y="137" text-anchor="middle" class="svg-muted" font-size="12">BFD</text>
<rect x="225" y="95" width="190" height="55" rx="8" fill="#fed7aa"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="13">Poora switch fail</text><text x="320" y="137" text-anchor="middle" class="svg-muted" font-size="12">Virtual Chassis + cross-member LAG</text>
<rect x="430" y="95" width="190" height="55" rx="8" fill="#e2e8f0"/><text x="525" y="119" text-anchor="middle" class="svg-ink" font-size="13">Software upgrade</text><text x="525" y="137" text-anchor="middle" class="svg-muted" font-size="12">ISSU / NSSU</text>
</svg><p class="cap">Har failure ko uski protection se milao. Yeh table exam ka dil hai.</p></div>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! LAG</span>
set chassis aggregated-devices ethernet device-count 1
set interfaces ge-0/0/10 ether-options 802.3ad ae0
set interfaces ae0 aggregated-ether-options lacp active
set interfaces ae0 aggregated-ether-options minimum-links 2
<span class="c">! VRRP</span>
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 virtual-address 172.16.10.1
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 priority 200
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 accept-data
set interfaces ge-0/0/1 unit 0 family inet address 172.16.10.2/24 vrrp-group 10 track interface ge-0/0/0 priority-cost 150
<span class="c">! RE redundancy</span>
set chassis redundancy graceful-switchover
set routing-options nonstop-routing
set system commit synchronize
<span class="c">! BFD</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 bfd-liveness-detection minimum-interval 300

<span class="c">! Verify</span>
show interfaces ae0 terse
show lacp interfaces
show lacp statistics interfaces ae0
show vrrp
show vrrp detail
show vrrp track
show system switchover
show task replication</pre>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>LAG / ae</dt><dd>Link aggregation group; logical aggregated Ethernet interface.</dd>
<dt>LACP</dt><dd>Protocol jo tay karta hai kaunse links LAG ke hain (802.3ad / 802.1AX).</dd>
<dt>VRRP</dt><dd>Virtual Router Redundancy Protocol; routers virtual gateway share karte hain.</dd>
<dt>Priority-cost</dt><dd>Tracked object fail hone par VRRP priority se ghatayi jaane wali matra.</dd>
<dt>RE / PFE</dt><dd>Routing Engine (control plane) aur Packet Forwarding Engine (forwarding plane).</dd>
<dt>GRES</dt><dd>Graceful Routing Engine switchover: backup RE kernel state ke saath takeover karta hai.</dd>
<dt>NSR / NSB</dt><dd>Nonstop routing / nonstop bridging: protocol state backup RE par replicate hoti hai.</dd>
<dt>BFD</dt><dd>Bidirectional Forwarding Detection: second se kam mein failure detection.</dd>
<dt>VC / VCP</dt><dd>Virtual Chassis / Virtual Chassis port: kai EX switches ek device ki tarah.</dd>
<dt>ISSU / NSSU</dt><dd>In-service software upgrade / nonstop software upgrade.</dd>
</dl>

<div class="eg"><p><b>Revision ka worked example.</b> "R1 priority 150, track cost 40, R2 priority 100. R1 ka uplink fail hota hai." R1 110 par aata hai, 100 se upar, isliye R1 master rehta hai aur mare hue uplink mein traffic bhejta hai. Fix: 50 se upar cost. Har VRRP sawal par yeh ghatana karo.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyon ki list.</b> device-count bhoolna; dono ends par lacp passive; member ports par VLAN config; monitoring VIP ping kare to accept-data ke bina VRRP; tracking cost bahut chhoti; graceful restart ke saath NSR enable karna; preprovisioned VC mein mastership-priority set karna.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> NSR ko GRES plus commit synchronize chahiye aur GR exclude hota hai. LACP passive + passive fail. Tracking ka hisaab master tay karta hai. Preprovisioned VC mastership-priority reject karta hai. BFD detect karta hai, route nahi karta.</p></div>

<div class="scn"><h4>Sab kuch ek saath</h4><p>Nayi campus building ko Virtual Chassis mein do access switches milte hain, har server dono members ke across LACP bundle se juda hai, VRRP ke saath do gateways aur aisi uplink tracking cost jo active gateway ko backup se neeche le jaaye, core chassis par GRES ke saath NSR, aur core links par BFD. Upgrade ki raat NSSU use hota hai; kisi user ko pata nahi chalta. Is list ka har hissa module ka ek chapter hai.</p><p><b>Lesson:</b> HA layers ka milkar kaam karna hai, har ek tested aur monitored.</p></div>

<div class="iv"><p class="q">"Do routers, ek access switch aur har ek ke liye ek WAN link wale branch ke liye high availability design karo."</p><p>Agar switch ke do uplinks hon to main LACP bundle deta, routers ke beech priority 200 aur 100 ke saath VRRP chalata, har router ke WAN interface (ya default route) ko aisi cost se track karta jo mastership flip kar de, tez detection ke liye routing adjacency par BFD consider karta, aur har cable kheench kar test karta. Routers mein do REs hon to GRES aur NSR jodta. Main LACP aur VRRP state monitor karta taaki silent failure dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failure ko protection se milao: LAG links, VRRP gateway, GRES/NSR RE, VC switch, BFD detection.</li>
<li>Defaults jaano: VRRP priority 100 aur preempt on, accept-data off, LACP slow, BFD multiplier 3.</li>
<li>Har VRRP sawal par tracking ka ghatana karo.</li>
<li>Commit rules yaad rakho: NSR ko GRES aur commit synchronize chahiye, graceful restart exclude.</li>
<li>show lacp interfaces, show vrrp detail, show task replication se verify karo, aur failovers test karo.</li>
</ul></div>
`}};export{e as default};