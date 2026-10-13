var e={id:`fhrp-ha`,h:{en:`First-hop redundancy and high availability: HSRP, VRRP, GLBP, SSO, NSF, ISSU`,hi:`First-hop redundancy aur high availability: HSRP, VRRP, GLBP, SSO, NSF, ISSU`},body:{en:`
<p>Imagine a shop with one front door. If it jams, nobody gets in or out. A shop with two doors needs a rule that says "if door 1 jams, everyone uses door 2, and nobody needs to be told". A PC's default gateway is that front door. <b>First-hop redundancy protocols (FHRPs)</b> give two routers one shared virtual IP and virtual MAC, so the PC never changes its gateway setting when a router dies.</p>

<h3>The case: Tallgrass Credit Union</h3>
<div class="eg"><p><b>Customer.</b> Tallgrass Credit Union has a head office campus with 1,500 staff, a 300-seat contact centre and a 24-hour fraud desk. Budget is USD 1.1 million. Requirements: gateway failover under 1 second for voice VLAN 20, no dropped calls during software upgrades, and loan-system traffic must use both distribution switches. Constraints: the contact centre softphone VLANs must be Layer 2 across two floors; the whole network is Cisco; monthly upgrade windows are only 30 minutes long and executives want zero planned downtime.</p></div>

<h3>FHRP options compared</h3>
<table class="cmp"><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard (RFC 5798 for version 3)</td><td>Cisco proprietary</td></tr>
<tr><td>Roles</td><td>Active, standby, others listen</td><td>Master, backups</td><td>AVG (one) and up to four AVFs</td></tr>
<tr><td>Load sharing</td><td>Per group: use several groups with different actives</td><td>Per group, same idea</td><td>Built in: AVG hands out different virtual MACs to clients</td></tr>
<tr><td>Preempt default</td><td>Off, must enable</td><td>On</td><td>Off for gateway, on for forwarders</td></tr>
<tr><td>Best fit</td><td>All-Cisco campus</td><td>Multi-vendor</td><td>Simple load sharing without per-VLAN planning</td></tr></table>
<p>Design rules the exam loves: the <b>root bridge, HSRP active and any inter-VLAN routing path should sit on the same distribution switch</b> for each VLAN, otherwise traffic crosses the inter-switch link twice; set <b>preempt</b> so the best switch returns to active after recovery; add <b>interface or object tracking</b> so a switch that loses its uplink gives up active; and use <b>BFD</b> or sub-second timers for fast detection. GLBP is rare in modern campus because routed access and SVL remove the need.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="HSRP gateway design">
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="86" x2="215" y2="30"/><line x1="425" y1="86" x2="425" y2="30"/>
<line x1="260" y1="108" x2="380" y2="108"/>
<line x1="215" y1="130" x2="320" y2="200"/><line x1="425" y1="130" x2="320" y2="200"/>
<line x1="320" y1="234" x2="320" y2="252"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<ellipse cx="320" cy="18" rx="120" ry="14" fill="#e2e8f0" stroke="#475569"/><text x="320" y="23">Core and WAN</text>
<rect x="170" y="86" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="215" y="106">Dist 1</text><text x="215" y="122" font-size="11">HSRP Active</text>
<rect x="380" y="86" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="425" y="106">Dist 2</text><text x="425" y="122" font-size="11">HSRP Standby</text>
<text x="320" y="102" class="svg-muted" font-size="11">VLAN 20</text>
<rect x="265" y="200" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="320" y="222">Access switch</text>
<rect x="270" y="252" width="100" height="32" rx="6" fill="#fde68a" stroke="#475569"/><text x="320" y="272">Softphone PC</text>
</g>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">Virtual IP</text>
<text x="560" y="166" text-anchor="middle" class="svg-accent" font-size="12">10.20.20.1</text>
<text x="80" y="150" text-anchor="middle" class="svg-muted" font-size="12">Root bridge</text>
<text x="80" y="166" text-anchor="middle" class="svg-muted" font-size="12">= HSRP active</text>
<rect x="450" y="276" width="14" height="14" fill="#ddd6fe"/><text x="470" y="288" class="svg-ink" font-size="12">Distribution</text>
<rect x="545" y="276" width="14" height="14" fill="#fde68a"/><text x="565" y="288" class="svg-ink" font-size="12">Endpoint</text>
</svg><p class="cap">The endpoint uses one virtual IP; the active router, the STP root and the traffic path are kept aligned.</p></div>

<pre class="code"><span class="c">! Dist 1 (Dist 2 uses priority 100, same group and VIP)</span>
track 1 interface TenGigabitEthernet1/0/24 line-protocol
!
interface Vlan20
 ip address 10.20.20.2 255.255.255.0
 standby version 2
 standby 20 ip 10.20.20.1
 standby 20 priority 110
 standby 20 preempt
 standby 20 timers msec 250 msec 750
 standby 20 track 1 decrement 20
</pre>
<pre class="out">DIST1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vl20        20   110 P <span class="hl">Active</span>  local           10.20.20.3      10.20.20.1
</pre>

<h3>Platform high availability: SSO, NSF, ISSU</h3>
<p>FHRPs protect the <i>gateway</i>. Inside one chassis, other tools protect the <i>control plane</i>.</p>
<ul>
<li><b>SSO (Stateful Switchover):</b> a standby supervisor (or standby switch in StackWise Virtual) keeps a synchronised copy of configuration and protocol state, so it can take over without a full reboot. Enabled with redundancy and mode sso.</li>
<li><b>NSF (Non-Stop Forwarding):</b> while the new active supervisor rebuilds routing adjacencies, the line cards keep forwarding using the existing CEF tables. Neighbours must be <b>NSF-aware</b> (graceful restart helpers) so they do not drop the route. Supported with OSPF, EIGRP, IS-IS and BGP.</li>
<li><b>ISSU (In-Service Software Upgrade):</b> upgrade software on a redundant system in steps, switching over between supervisors or SVL members so traffic keeps flowing. Platform and software support matters: on Catalyst 9000 it applies to supported dual-supervisor chassis and StackWise Virtual pairs in install mode, and not every release pair is ISSU-compatible.</li>
</ul>
<pre class="out">DIST1# show redundancy states
       my state = 13 -ACTIVE
     peer state = <span class="hl">8  -STANDBY HOT</span>
           Mode = Duplex
</pre>
<p>Combined with <b>BFD</b> for fast neighbour-down detection, <b>route summarisation</b> at distribution to hide failures from the core, and <b>ECMP</b> for load sharing, you get convergence budgets the business can measure: detection (BFD, tens to hundreds of ms), reroute (milliseconds with equal-cost paths), versus a supervisor switchover (SSO and NSF, typically sub-second to a few seconds of control-plane recovery with forwarding preserved).</p>

<h3>Chosen design for Tallgrass</h3>
<p>Contact-centre floors use HSRPv2 on a dual-chassis SVL-less pair with 250 ms hellos and BFD; office floors use routed access with no FHRP. The distribution switches are dual-supervisor chassis with SSO and NSF, ISSU is the standard upgrade method, and loan-system VLANs are split into two HSRP groups so each distribution switch is active for half the VLANs and traffic uses both. Justification: all Cisco, so HSRP is acceptable; VRRP would add nothing; GLBP would complicate troubleshooting.</p>

<div class="warn"><p><b>Common mistakes.</b> No preempt, so after a repair the weaker switch stays active forever; HSRP active on one switch and STP root on the other; forgetting that HSRP version 1 and 2 do not interoperate; and promising "zero downtime ISSU" without checking the image upgrade matrix.</p></div>
<div class="exam"><p><b>Exam trap.</b> SSO alone does not keep forwarding: you need NSF/graceful restart on both the restarting device and its neighbours. FHRP does not replace routing redundancy upstream.</p></div>

<div class="scn"><h4>Post-mortem: the gateway that stayed on the wrong switch</h4><p>After a power-supply swap, Dist 1 rebooted, Dist 2 became HSRP active and stayed so. Preempt was missing on Dist 1. Two weeks later Dist 2 lost its uplink to core, but HSRP active remained on it because no tracking existed, and the contact centre was black-holed for 6 minutes. The fix: preempt, a tracked uplink with decrement 20, and BFD.</p><p><b>Lesson:</b> an FHRP failover must be driven by the health of the path to the rest of the network, not by whether the router is merely alive.</p></div>
<div class="iv"><p class="q">"Difference between SSO and NSF?"</p><p>SSO makes the standby supervisor ready with synchronised state. NSF keeps forwarding while routing protocols re-establish, using graceful restart so neighbours do not tear down routes. You need both to avoid packet loss on a supervisor switchover. Add ISSU for software upgrades.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FHRPs give hosts one virtual gateway; HSRP and GLBP are Cisco, VRRP is standard.</li>
<li>Align STP root, FHRP active and traffic path; enable preempt and tracking.</li>
<li>Use BFD or tuned timers for sub-second detection.</li>
<li>SSO syncs state, NSF keeps forwarding, ISSU upgrades without outage on supported platforms.</li>
<li>Routed access removes the need for an FHRP in that closet.</li>
</ul></div>
`,hi:`
<p>Ek dukaan ke baare mein socho jiska sirf ek front door hai. Agar woh jam ho jaye to koi andar bahar nahi ja sakta. Do doors wali dukaan ko ek rule chahiye: "agar door 1 jam ho to sab door 2 use karein, aur kisi ko batane ki zaroorat nahi". PC ka default gateway wahi front door hai. <b>First-hop redundancy protocols (FHRPs)</b> do routers ko ek shared virtual IP aur virtual MAC dete hain, taaki router mar jaye to bhi PC ko apni gateway setting badalni na pade.</p>

<h3>Case: Tallgrass Credit Union</h3>
<div class="eg"><p><b>Customer.</b> Tallgrass Credit Union ka head office campus hai jisme 1,500 staff, 300-seat contact centre aur 24-ghante ka fraud desk hai. Budget USD 1.1 million. Requirements: voice VLAN 20 ke liye gateway failover 1 second se kam, software upgrades ke dauraan koi call drop nahi, aur loan-system traffic dono distribution switches use kare. Constraints: contact centre softphone VLANs do floors mein Layer 2 rehne chahiye; poora network Cisco hai; monthly upgrade windows sirf 30 minute ke hain aur executives planned downtime zero chahte hain.</p></div>

<h3>FHRP options ka comparison</h3>
<table class="cmp"><tr><th></th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco proprietary</td><td>Open standard (version 3 ke liye RFC 5798)</td><td>Cisco proprietary</td></tr>
<tr><td>Roles</td><td>Active, standby, baaki listen</td><td>Master, backups</td><td>AVG (ek) aur zyada se zyada chaar AVFs</td></tr>
<tr><td>Load sharing</td><td>Per group: alag actives ke saath kai groups</td><td>Per group, wahi idea</td><td>Built in: AVG clients ko alag virtual MACs deta hai</td></tr>
<tr><td>Preempt default</td><td>Off, enable karna padta hai</td><td>On</td><td>Gateway ke liye off, forwarders ke liye on</td></tr>
<tr><td>Best fit</td><td>All-Cisco campus</td><td>Multi-vendor</td><td>Per-VLAN planning ke bina simple load sharing</td></tr></table>
<p>Design rules jo exam ko pasand hain: har VLAN ke liye <b>root bridge, HSRP active aur inter-VLAN routing path ek hi distribution switch par hone chahiye</b>, warna traffic inter-switch link ko do baar cross karta hai; <b>preempt</b> set karo taaki best switch recovery ke baad wapas active ho; <b>interface ya object tracking</b> lagao taaki jo switch uplink kho de woh active chhod de; aur fast detection ke liye <b>BFD</b> ya sub-second timers use karo. Modern campus mein GLBP kam dikhta hai kyunki routed access aur SVL iski zaroorat hata dete hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="HSRP gateway design">
<g stroke="#64748b" stroke-width="1.5">
<line x1="215" y1="86" x2="215" y2="30"/><line x1="425" y1="86" x2="425" y2="30"/>
<line x1="260" y1="108" x2="380" y2="108"/>
<line x1="215" y1="130" x2="320" y2="200"/><line x1="425" y1="130" x2="320" y2="200"/>
<line x1="320" y1="234" x2="320" y2="252"/>
</g>
<g class="svg-ink" font-size="13" text-anchor="middle">
<ellipse cx="320" cy="18" rx="120" ry="14" fill="#e2e8f0" stroke="#475569"/><text x="320" y="23">Core aur WAN</text>
<rect x="170" y="86" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="215" y="106">Dist 1</text><text x="215" y="122" font-size="11">HSRP Active</text>
<rect x="380" y="86" width="90" height="44" rx="8" fill="#ddd6fe" stroke="#475569"/><text x="425" y="106">Dist 2</text><text x="425" y="122" font-size="11">HSRP Standby</text>
<text x="320" y="102" class="svg-muted" font-size="11">VLAN 20</text>
<rect x="265" y="200" width="110" height="34" rx="6" fill="#bbf7d0" stroke="#475569"/><text x="320" y="222">Access switch</text>
<rect x="270" y="252" width="100" height="32" rx="6" fill="#fde68a" stroke="#475569"/><text x="320" y="272">Softphone PC</text>
</g>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">Virtual IP</text>
<text x="560" y="166" text-anchor="middle" class="svg-accent" font-size="12">10.20.20.1</text>
<text x="80" y="150" text-anchor="middle" class="svg-muted" font-size="12">Root bridge</text>
<text x="80" y="166" text-anchor="middle" class="svg-muted" font-size="12">= HSRP active</text>
<rect x="450" y="276" width="14" height="14" fill="#ddd6fe"/><text x="470" y="288" class="svg-ink" font-size="12">Distribution</text>
<rect x="545" y="276" width="14" height="14" fill="#fde68a"/><text x="565" y="288" class="svg-ink" font-size="12">Endpoint</text>
</svg><p class="cap">Endpoint ek virtual IP use karta hai; active router, STP root aur traffic path aligned rakhe jaate hain.</p></div>

<pre class="code"><span class="c">! Dist 1 (Dist 2 uses priority 100, same group and VIP)</span>
track 1 interface TenGigabitEthernet1/0/24 line-protocol
!
interface Vlan20
 ip address 10.20.20.2 255.255.255.0
 standby version 2
 standby 20 ip 10.20.20.1
 standby 20 priority 110
 standby 20 preempt
 standby 20 timers msec 250 msec 750
 standby 20 track 1 decrement 20
</pre>
<pre class="out">DIST1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Vl20        20   110 P <span class="hl">Active</span>  local           10.20.20.3      10.20.20.1
</pre>

<h3>Platform high availability: SSO, NSF, ISSU</h3>
<p>FHRPs <i>gateway</i> ko protect karte hain. Ek chassis ke andar doosre tools <i>control plane</i> ko protect karte hain.</p>
<ul>
<li><b>SSO (Stateful Switchover):</b> standby supervisor (ya StackWise Virtual mein standby switch) configuration aur protocol state ki synchronised copy rakhta hai, taaki full reboot ke bina takeover kar sake. Redundancy aur mode sso se enable hota hai.</li>
<li><b>NSF (Non-Stop Forwarding):</b> jab naya active supervisor routing adjacencies rebuild karta hai, line cards existing CEF tables se forwarding karte rehte hain. Neighbours <b>NSF-aware</b> (graceful restart helpers) hone chahiye taaki woh route na girayein. OSPF, EIGRP, IS-IS aur BGP ke saath supported.</li>
<li><b>ISSU (In-Service Software Upgrade):</b> redundant system par software upgrade steps mein hota hai, supervisors ya SVL members ke beech switchover karke, taaki traffic chalta rahe. Platform aur software support matter karta hai: Catalyst 9000 par yeh supported dual-supervisor chassis aur install mode mein StackWise Virtual pairs par lagu hota hai, aur har release pair ISSU-compatible nahi hota.</li>
</ul>
<pre class="out">DIST1# show redundancy states
       my state = 13 -ACTIVE
     peer state = <span class="hl">8  -STANDBY HOT</span>
           Mode = Duplex
</pre>
<p><b>BFD</b> (fast neighbour-down detection), distribution par <b>route summarisation</b> (failures ko core se chhupane ke liye), aur load sharing ke liye <b>ECMP</b> ke saath aapko aise convergence budgets milte hain jo business naap sakta hai: detection (BFD, tens se hundreds of ms), reroute (equal-cost paths ke saath milliseconds), versus supervisor switchover (SSO aur NSF, aam taur par sub-second se kuch seconds control-plane recovery, forwarding preserved).</p>

<h3>Tallgrass ke liye chosen design</h3>
<p>Contact-centre floors HSRPv2 use karte hain, 250 ms hellos aur BFD ke saath; office floors routed access use karte hain bina FHRP ke. Distribution switches dual-supervisor chassis hain jisme SSO aur NSF hai, ISSU standard upgrade method hai, aur loan-system VLANs ko do HSRP groups mein baanta gaya hai taaki har distribution switch aadhe VLANs ke liye active ho aur traffic dono use kare. Justification: sab Cisco hai, isliye HSRP theek hai; VRRP kuch add nahi karta; GLBP troubleshooting complicate karta.</p>

<div class="warn"><p><b>Common mistakes.</b> Preempt nahi, to repair ke baad kamzor switch hamesha active rehta hai; HSRP active ek switch par aur STP root doosre par; yeh bhoolna ki HSRP version 1 aur 2 interoperate nahi karte; aur image upgrade matrix check kiye bina "zero downtime ISSU" ka promise karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf SSO forwarding nahi rakhta: restarting device aur uske neighbours dono par NSF/graceful restart chahiye. FHRP upstream routing redundancy ki jagah nahi leta.</p></div>

<div class="scn"><h4>Post-mortem: gateway jo galat switch par atka raha</h4><p>Power-supply swap ke baad Dist 1 reboot hua, Dist 2 HSRP active ban gaya aur wahi raha. Dist 1 par preempt nahi tha. Do hafte baad Dist 2 ne core ka uplink kho diya, lekin tracking na hone se HSRP active usi par raha, aur contact centre 6 minute black-hole mein raha. Fix: preempt, decrement 20 wala tracked uplink, aur BFD.</p><p><b>Seekh:</b> FHRP failover is baat se chalna chahiye ki baaki network tak path healthy hai, is baat se nahi ki router sirf zinda hai.</p></div>
<div class="iv"><p class="q">"SSO aur NSF mein kya farak hai?"</p><p>SSO standby supervisor ko synchronised state ke saath ready rakhta hai. NSF routing protocols re-establish hone ke dauraan forwarding jaari rakhta hai, graceful restart se, taaki neighbours routes na girayein. Supervisor switchover par packet loss se bachne ke liye dono chahiye. Software upgrades ke liye ISSU add karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FHRPs hosts ko ek virtual gateway dete hain; HSRP aur GLBP Cisco hain, VRRP standard hai.</li>
<li>STP root, FHRP active aur traffic path align karo; preempt aur tracking enable karo.</li>
<li>Sub-second detection ke liye BFD ya tuned timers use karo.</li>
<li>SSO state sync karta hai, NSF forwarding rakhta hai, ISSU supported platforms par bina outage upgrade karta hai.</li>
<li>Routed access us closet mein FHRP ki zaroorat hata deta hai.</li>
</ul></div>
`}};export{e as default};