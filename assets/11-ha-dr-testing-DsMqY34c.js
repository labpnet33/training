var e={id:`ha-testing`,h:{en:`High availability and DR testing`,hi:`High availability aur DR testing`},body:{en:`
<p>A two-pilot aircraft is a good picture of high availability. In one style, both pilots fly together and share the workload; if one becomes ill, the other can fly alone. In another style, the captain flies and the co-pilot watches, ready to take the controls the moment something goes wrong. Airlines also run simulator sessions and cockpit walk-throughs so the crew knows exactly what to do before a real emergency. Networks use the same two styles, <b>active-active</b> and <b>active-passive</b>, and the same two kinds of practice, <b>tabletop exercises</b> and <b>validation tests</b>.</p>

<h3>High availability versus disaster recovery</h3>
<p><b>High availability (HA)</b> keeps a service running through the failure of a component, usually automatically and within seconds, by removing single points of failure: two power supplies, two uplinks, two routers, two firewalls. <b>Disaster recovery (DR)</b> brings the service back after a larger event that HA cannot absorb, such as losing a whole site. HA reduces downtime from everyday failures; DR plans for the rare catastrophe. You need both.</p>

<h3>Active-active and active-passive</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Active-active versus active-passive">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#e2e8f0"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Active-active</text>
<rect x="40" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-A 50%</text>
<rect x="180" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="230" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-B 50%</text>
<text x="160" y="135" text-anchor="middle" class="svg-muted" font-size="12">Both carry traffic</text>
<text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">Each must fit 100% alone</text>
<text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">Keep each under 50%</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#fde68a"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">Active-passive</text>
<rect x="360" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="410" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-A 100%</text>
<rect x="500" y="60" width="100" height="40" rx="6" fill="#bae6fd"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-B standby</text>
<text x="480" y="135" text-anchor="middle" class="svg-muted" font-size="12">One carries traffic</text>
<text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">Standby takes over on failure</text>
<text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="12">Simpler, idle capacity</text>
</svg><p class="cap">Active-active uses both devices all the time; active-passive keeps one ready but idle.</p></div>
<table class="cmp"><tr><th></th><th>Active-active</th><th>Active-passive</th></tr>
<tr><td>Traffic</td><td>All members forward traffic at the same time (load balancing)</td><td>One active member; the standby only takes over on failure</td></tr>
<tr><td>Capacity</td><td>Uses all hardware, but each member must be able to carry the full load alone after a failure</td><td>Standby capacity sits idle</td></tr>
<tr><td>Complexity</td><td>Higher: state sharing, asymmetric flows, load balancing</td><td>Lower: clear primary and backup</td></tr>
<tr><td>Examples</td><td>Link aggregation, ECMP routing, load-balanced server farms, clustered firewalls</td><td>First-hop redundancy (VRRP, HSRP), firewall failover pairs, standby WAN link</td></tr>
</table>
<p>A first-hop redundancy protocol is the classic active-passive example. Two routers share a virtual gateway address; hosts use the virtual address, and the backup router takes over if the active one stops sending hellos:</p>
<pre class="code"><span class="c">! R1 becomes the active gateway for the LAN (VRRP, a standards-based FHRP)</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# vrrp 10 ip 192.168.50.254
R1(config-if)# vrrp 10 priority 110</pre>

<div class="eg"><p><b>Worked example: the 50% rule.</b> Two firewalls run active-active, each with a 10 Gbps inspection limit. Monitoring shows FW-A at 6 Gbps and FW-B at 5 Gbps: 11 Gbps total. It looks healthy, but if either fails, the survivor receives 11 Gbps and drops traffic. In active-active designs each member should stay below about 50% of its capacity (baseline and alert on it, as in chapter 8), otherwise the redundancy is an illusion.</p></div>

<p>Also watch for <b>split brain</b>: if the link between an HA pair fails, both members may believe the other is dead and both become active, causing duplicate addresses or asymmetric drops. Dedicated redundant heartbeat links and careful monitoring prevent it.</p>

<h3>DR testing</h3>
<p>A DR plan that has never been tested is a hope, not a plan. N10-009 names two kinds of test:</p>
<dl class="terms">
<dt>Tabletop exercise</dt><dd>A discussion-based walk-through. The team sits around a table (or a call), a facilitator describes a scenario ("the primary data center has flooded at 02:00"), and each person explains what they would do, in order, using the written plan. No systems are touched. It finds gaps in roles, contact lists, decision authority and communication, cheaply and without risk.</dd>
<dt>Validation test</dt><dd>A hands-on test that proves the technical recovery works: actually failing over to the standby firewall, restoring a backup to a test server and checking the data, bringing up the DR site and measuring how long it takes against the RTO, confirming DNS and routing changes work.</dd>
</dl>
<p>Run tabletop exercises regularly (for example twice a year) and validation tests on a schedule and after major changes. Record the results, the time taken compared with RTO, the data recovered compared with RPO, and every problem found; then update the plan and the documentation.</p>

<div class="warn"><p><b>Common mistakes.</b> Believing a pair of devices is redundant without ever failing one over. Running active-active members above 50% load. Testing backups by checking that the job "succeeded" instead of restoring the data. Keeping the DR plan only on a server that is lost in the disaster. Never updating contact lists.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Active-active</b> = all members forward traffic; <b>active-passive</b> = standby waits. A <b>tabletop exercise</b> is discussion only, no systems changed; a <b>validation test</b> actually exercises the failover or restore. HA handles component failure automatically; DR handles site-level disasters.</p></div>

<div class="scn"><h4>The failover that never was</h4><p>An insurance company had an active-passive firewall pair for three years and never tested it. When the active firewall's power supply died, the standby did not take over: its licence had expired and its configuration was eight months out of date because configuration synchronisation had been disabled during an upgrade. The outage lasted five hours. Afterwards the team added configuration monitoring to compare both members nightly, alerts on licence expiry, and a quarterly validation test that fails over during a maintenance window. A tabletop exercise also revealed that nobody knew who could approve an emergency change at night.</p><p><b>Lesson:</b> HA must be validated regularly, and tabletop exercises find the people and process gaps technology cannot.</p></div>

<div class="iv"><p class="q">"Compare active-active and active-passive, and tell me how you would prove your DR plan works."</p><p>Strong answer: active-active shares load across members and uses all capacity, but each member must handle the full load alone, so keep utilisation under about 50%; it is more complex. Active-passive has an idle standby that takes over on failure, simpler but wasting capacity, like VRRP or a firewall failover pair. To prove DR: tabletop exercises to walk the plan and roles, validation tests that actually fail over and restore data, measured against RTO and RPO, and update the plan after each test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA survives component failures automatically; DR recovers from site-level disasters.</li>
<li>Active-active: all members forward; each must carry the full load alone, so stay under about 50%.</li>
<li>Active-passive: a standby takes over on failure (FHRP such as VRRP, firewall failover).</li>
<li>Tabletop exercises are discussion-based; validation tests actually fail over and restore.</li>
<li>Record test results against RTO and RPO, then update the plan and documentation.</li>
</ul></div>
`,hi:`
<p>Do pilots wala aircraft high availability ki achhi picture hai. Ek style mein dono pilots saath udaate hain aur kaam baant lete hain; agar ek beemar ho jaaye, to doosra akela uda sakta hai. Doosre style mein captain udaata hai aur co-pilot dekhta rehta hai, kuch galat hote hi controls lene ko tayyar. Airlines simulator sessions aur cockpit walk-throughs bhi karati hain taaki asli emergency se pehle crew ko exactly pata ho ki kya karna hai. Networks bhi yahi do styles use karte hain, <b>active-active</b> aur <b>active-passive</b>, aur yahi do tarah ki practice, <b>tabletop exercises</b> aur <b>validation tests</b>.</p>

<h3>High availability vs disaster recovery</h3>
<p><b>High availability (HA)</b> kisi component ke fail hone par bhi service chalti rakhti hai, aam taur par automatically aur seconds mein, single points of failure hata kar: do power supplies, do uplinks, do routers, do firewalls. <b>Disaster recovery (DR)</b> ek bade event ke baad service wapas laati hai jise HA jhel nahi sakti, jaise poori site kho dena. HA roz ke failures se downtime kam karti hai; DR kabhi kabhi hone wali tabahi ke liye plan karti hai. Dono chahiye.</p>

<h3>Active-active aur active-passive</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Active-active vs active-passive">
<rect x="10" y="10" width="300" height="200" rx="10" fill="#e2e8f0"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="14">Active-active</text>
<rect x="40" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-A 50%</text>
<rect x="180" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="230" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-B 50%</text>
<text x="160" y="135" text-anchor="middle" class="svg-muted" font-size="12">Dono traffic le jaate hain</text>
<text x="160" y="155" text-anchor="middle" class="svg-muted" font-size="12">Har ek akela 100% le sake</text>
<text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="12">Har ek 50% se neeche rakho</text>
<rect x="330" y="10" width="300" height="200" rx="10" fill="#fde68a"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="14">Active-passive</text>
<rect x="360" y="60" width="100" height="40" rx="6" fill="#bbf7d0"/><text x="410" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-A 100%</text>
<rect x="500" y="60" width="100" height="40" rx="6" fill="#bae6fd"/><text x="550" y="85" text-anchor="middle" class="svg-ink" font-size="12">FW-B standby</text>
<text x="480" y="135" text-anchor="middle" class="svg-muted" font-size="12">Ek traffic le jaata hai</text>
<text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">Failure par standby take over</text>
<text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="12">Simple, idle capacity</text>
</svg><p class="cap">Active-active dono devices hamesha use karta hai; active-passive ek ko tayyar lekin idle rakhta hai.</p></div>
<table class="cmp"><tr><th></th><th>Active-active</th><th>Active-passive</th></tr>
<tr><td>Traffic</td><td>Saare members ek saath traffic forward karte hain (load balancing)</td><td>Ek active member; standby sirf failure par take over karta hai</td></tr>
<tr><td>Capacity</td><td>Saara hardware use hota hai, lekin failure ke baad har member akela poora load le sake</td><td>Standby capacity idle baithi rehti hai</td></tr>
<tr><td>Complexity</td><td>Zyada: state sharing, asymmetric flows, load balancing</td><td>Kam: clear primary aur backup</td></tr>
<tr><td>Examples</td><td>Link aggregation, ECMP routing, load-balanced server farms, clustered firewalls</td><td>First-hop redundancy (VRRP, HSRP), firewall failover pairs, standby WAN link</td></tr>
</table>
<p>First-hop redundancy protocol classic active-passive example hai. Do routers ek virtual gateway address share karte hain; hosts virtual address use karte hain, aur agar active router hellos bhejna band kar de to backup router take over karta hai:</p>
<pre class="code"><span class="c">! R1 LAN ka active gateway banta hai (VRRP, ek standards-based FHRP)</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# vrrp 10 ip 192.168.50.254
R1(config-if)# vrrp 10 priority 110</pre>

<div class="eg"><p><b>Worked example: 50% rule.</b> Do firewalls active-active chal rahe hain, har ek ki 10 Gbps inspection limit hai. Monitoring FW-A par 6 Gbps aur FW-B par 5 Gbps dikhati hai: total 11 Gbps. Healthy lagta hai, lekin agar koi ek fail ho, to bache hue ko 11 Gbps milta hai aur woh traffic drop karta hai. Active-active designs mein har member apni capacity ke lagbhag 50% se neeche rehna chahiye (chapter 8 ki tarah iska baseline aur alert banao), warna redundancy sirf bhram hai.</p></div>

<p><b>Split brain</b> par bhi nazar rakho: agar HA pair ke beech ka link fail ho, to dono members maan sakte hain ki doosra mar gaya aur dono active ho jaate hain, jisse duplicate addresses ya asymmetric drops hote hain. Dedicated redundant heartbeat links aur careful monitoring ise rokte hain.</p>

<h3>DR testing</h3>
<p>Jo DR plan kabhi test nahi hua woh ek ummeed hai, plan nahi. N10-009 do tarah ke tests batata hai:</p>
<dl class="terms">
<dt>Tabletop exercise</dt><dd>Discussion-based walk-through. Team ek table ke around (ya call par) baithti hai, ek facilitator scenario batata hai ("primary data center mein raat 02:00 baje baadh aa gayi"), aur har vyakti likhe hue plan ke hisaab se order mein batata hai ki woh kya karega. Koi system touch nahi hota. Yeh roles, contact lists, decision authority aur communication mein gaps sasta aur bina risk ke dhoondhta hai.</dd>
<dt>Validation test</dt><dd>Hands-on test jo sabit karta hai ki technical recovery kaam karti hai: sach mein standby firewall par fail over karna, test server par backup restore karke data check karna, DR site up karke RTO ke against time naapna, DNS aur routing changes kaam karte hain yeh confirm karna.</dd>
</dl>
<p>Tabletop exercises regularly chalao (jaise saal mein do baar) aur validation tests schedule par aur bade changes ke baad. Results record karo, RTO ke comparison mein laga time, RPO ke comparison mein recover hua data, aur mili har problem; phir plan aur documentation update karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Kabhi ek ko fail over kiye bina maan lena ki devices ka pair redundant hai. Active-active members ko 50% load se upar chalana. Backups ko data restore karke nahi, sirf job "succeeded" dekh kar test karna. DR plan sirf aise server par rakhna jo disaster mein kho jaata hai. Contact lists kabhi update na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Active-active</b> = saare members traffic forward karte hain; <b>active-passive</b> = standby intezaar karta hai. <b>Tabletop exercise</b> sirf discussion hai, koi system nahi badalta; <b>validation test</b> sach mein failover ya restore chalata hai. HA component failure automatically handle karti hai; DR site-level disasters handle karti hai.</p></div>

<div class="scn"><h4>Failover jo kabhi hua hi nahi</h4><p>Ek insurance company ke paas teen saal se active-passive firewall pair tha aur use kabhi test nahi kiya gaya. Jab active firewall ka power supply mara, standby ne take over nahi kiya: uska licence expire ho chuka tha aur uski configuration aath mahine purani thi kyunki upgrade ke dauraan configuration synchronisation disable kar diya gaya tha. Outage paanch ghante chala. Baad mein team ne dono members ko har raat compare karne ke liye configuration monitoring, licence expiry par alerts, aur ek quarterly validation test joda jo maintenance window mein fail over karta hai. Ek tabletop exercise ne yeh bhi dikhaya ki kisi ko nahi pata tha ki raat mein emergency change kaun approve kar sakta hai.</p><p><b>Seekh:</b> HA ko regularly validate karna padta hai, aur tabletop exercises woh people aur process gaps dhoondhti hain jo technology nahi dhoondh sakti.</p></div>

<div class="iv"><p class="q">"Active-active aur active-passive compare karo, aur batao aap kaise sabit karoge ki aapka DR plan kaam karta hai."</p><p>Strong answer: active-active members ke beech load share karta hai aur saari capacity use karta hai, lekin har member akela poora load sambhaal sake, isliye utilisation lagbhag 50% se neeche rakho; yeh zyada complex hai. Active-passive mein ek idle standby hota hai jo failure par take over karta hai, simple lekin capacity waste, jaise VRRP ya firewall failover pair. DR sabit karne ke liye: plan aur roles walk karne ke liye tabletop exercises, validation tests jo sach mein fail over aur data restore karein, RTO aur RPO ke against naape hue, aur har test ke baad plan update karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA component failures automatically jhelti hai; DR site-level disasters se recover karti hai.</li>
<li>Active-active: saare members forward karte hain; har ek akela poora load le sake, isliye lagbhag 50% se neeche raho.</li>
<li>Active-passive: failure par standby take over karta hai (VRRP jaisa FHRP, firewall failover).</li>
<li>Tabletop exercises discussion-based hain; validation tests sach mein fail over aur restore karte hain.</li>
<li>Test results RTO aur RPO ke against record karo, phir plan aur documentation update karo.</li>
</ul></div>
`}};export{e as default};