var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and classic FHRP mistakes`,hi:`Troubleshooting workflow aur classic FHRP galtiyan`},body:{en:`
<p>A doctor does not start with surgery. She asks what the symptom is, checks the pulse and temperature, and only then orders a specific test. FHRP problems deserve the same discipline. Almost every HSRP fault falls into one of four symptom groups, and each group points to a short list of causes. This chapter gives you the workflow and then walks through the module's troubleshooting lab, the failed failover test at the Pune sales floor.</p>

<h3>The four symptoms</h3>
<table class="cmp"><tr><th>Symptom</th><th>What it usually means</th><th>Typical causes</th></tr>
<tr><td><b>Two Active routers</b>, duplicate address messages</td><td>The routers do not hear or accept each other's hellos</td><td>Group number, version or authentication mismatch; hellos blocked at Layer 2 (wrong VLAN, trunk not allowing the VLAN, ACL)</td></tr>
<tr><td><b>Wrong router Active</b></td><td>The election result is not what the design says</td><td>Priority not set, missing preempt, tie decided by the higher IP</td></tr>
<tr><td><b>No failover</b> when an uplink dies</td><td>HSRP cannot see beyond the LAN</td><td>No tracking, decrement too small, no preempt on the peer</td></tr>
<tr><td><b>Users still fail</b> although HSRP looks healthy</td><td>The problem is on the host side</td><td>Hosts or DHCP point at a real router IP, VIP in the wrong subnet, VIP different on the routers</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="FHRP troubleshooting flow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Host gateway = VIP? ARP = VMAC?</text>
<rect x="200" y="62" width="240" height="36" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. show standby brief on ALL routers</text>
<rect x="20" y="130" width="190" height="50" rx="8" fill="#fed7aa"/><text x="115" y="152" text-anchor="middle" class="svg-ink" font-size="13">Two Active?</text><text x="115" y="170" text-anchor="middle" class="svg-muted" font-size="12">group, version, auth, L2</text>
<rect x="225" y="130" width="190" height="50" rx="8" fill="#fde68a"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Wrong Active?</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">priority, preempt</text>
<rect x="430" y="130" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="152" text-anchor="middle" class="svg-ink" font-size="13">No failover?</text><text x="525" y="170" text-anchor="middle" class="svg-muted" font-size="12">track, decrement, preempt</text>
<line x1="320" y1="46" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="98" x2="115" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="525" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="210" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="13">3. Read logs: STATECHANGE, DUPADDR</text>
<rect x="200" y="258" width="240" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="281" text-anchor="middle" class="svg-ink" font-size="13">4. Fix, then repeat the failover test</text>
<line x1="320" y1="180" x2="320" y2="210" stroke="#64748b" stroke-width="2"/><line x1="320" y1="246" x2="320" y2="258" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Start at the host, compare every router, classify the symptom, confirm in the logs, and always retest.</p></div>

<h3>The workflow in commands</h3>
<ol>
<li><b>Host side.</b> Check the client's gateway (<code>ipconfig</code> on Windows, the PC's IP settings in the lab) and its ARP entry: the gateway must be the VIP and must map to the virtual MAC.</li>
<li><b>Every router.</b> <code>show standby brief</code> on all members. You want exactly one Active, one Standby, the same group number and VIP everywhere, and each router naming the other correctly.</li>
<li><b>Detail.</b> <code>show standby</code> for version (the "(version 2)" tag), virtual MAC, timers, authentication, preemption, and <b>Priority X (configured Y)</b> for tracking.</li>
<li><b>Logs.</b> <code>show logging | include HSRP|DUPADDR|TRACK</code>. Useful messages: <code>%HSRP-5-STATECHANGE</code>, <code>%IP-4-DUPADDR</code> (two routers answering for the VIP), <code>%HSRP-4-BADAUTH</code> (authentication mismatch), <code>%TRACK-6-STATE</code>.</li>
<li><b>Layer 2.</b> If hellos are missing, check that both routers' interfaces are in the same VLAN and that the trunk between the switches allows it (<code>show interfaces trunk</code>).</li>
<li><b>Fix and retest.</b> A fix is not finished until a failover test passes in both directions.</li>
</ol>
<p><code>debug standby</code> shows every hello and state change but is noisy on a router with many groups; use it only briefly on a lab or a quiet box.</p>

<h3>Walkthrough: the module's troubleshoot lab</h3>
<p>The ticket: last night's change window was supposed to prove redundancy, but the NOC saw duplicate-address messages, and after R1 rebooted it never became the gateway again. The design: one group 10, R1 preferred (priority 110) and must take the role back, R2 backup.</p>
<pre class="out">R1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   90    Active  local           unknown         192.168.10.1</span>

R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       20   100   Active  local           unknown         192.168.10.1</span>

R1# show logging | include DUPADDR
<span class="hl">%IP-4-DUPADDR: Duplicate address 192.168.10.1 on GigabitEthernet0/0, sourced by 0000.0c07.ac14</span></pre>
<p>Read it like a detective. Both routers are <b>Active</b> and both see the Standby as <b>unknown</b>: they are alone. R1 is in group <b>10</b>, R2 in group <b>20</b>. The duplicate-address message confirms it: 0000.0c07.ac14 is the version 1 VMAC of group 20 (0x14 = 20) answering for the same VIP. That is the answer to the lab's first question: R2 uses group 20.</p>
<p>Three faults, three fixes:</p>
<pre class="code"><span class="c">! fault 1: wrong group on R2</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no standby 20
R2(config-if)# standby 10 ip 192.168.10.1
<span class="c">! faults 2 and 3: R1 priority 90 instead of 110, and no preempt</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 priority 110
R1(config-if)# standby 10 preempt</pre>
<p>After fix 1, R2 hears R1 (still Active) and becomes Standby; the duplicate messages stop. Fixes 2 and 3 make R1 the preferred router that will reclaim the role. Then repeat the failover test: shut R1 Gi0/0, ping 203.0.113.10 from PC1 through R2 (R2 logs <code>Standby -&gt; Active</code>), <code>no shutdown</code>, and confirm R1 is Active again and R2 returns to Standby.</p>

<div class="eg"><p><b>Worked example.</b> Why did R1 "never become the gateway again" in the original ticket? Even with the correct group, R1 had priority 90 and no preempt. After its reboot it would have found R2 Active and stayed Standby forever. With 110 and preempt it sends a Coup when it returns. Three independent mistakes produced one confusing story; the workflow separates them.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing only the first thing you see. In the lab, correcting the group removes the duplicate addresses and the ticket looks solved, but the reboot problem remains until priority and preempt are fixed. Always compare the result against the full design and repeat the failover test.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Both routers show Active for the same VIP" almost always means they cannot exchange hellos: mismatched group, version or authentication, or a Layer 2 break. Different priorities or timers do <b>not</b> produce two Active routers.</p></div>

<div class="scn"><h4>Hellos lost on a trunk</h4><p>After a switch replacement at a Hyderabad call centre, both distribution switches went Active for VLAN 30 and phones reported one-way audio. Groups, versions and keys all matched. <code>show interfaces trunk</code> on the new switch showed the inter-switch trunk allowing VLANs 10, 20 and 40, but not 30: the template had been copied from another site. HSRP hellos for VLAN 30 never crossed. Adding the VLAN to the allowed list restored one Active and one Standby.</p><p><b>Lesson:</b> HSRP rides on Layer 2; when configuration looks perfect, check the VLAN path between the peers.</p></div>

<div class="iv"><p class="q">"Both of your HSRP routers show Active. How do you troubleshoot?"</p><p>Strong answer: that means they are not processing each other's hellos. Compare <code>show standby</code> on both: group number, HSRP version, VIP and authentication must match. Check the logs for DUPADDR or BADAUTH. If configuration matches, check Layer 2: same VLAN, trunk allowed lists, any ACL blocking 224.0.0.2 or 224.0.0.102 on UDP 1985. After fixing, confirm one Active and one Standby and run a failover test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classify first: two Active, wrong Active, no failover, or host-side problem.</li>
<li>Start at the host: gateway must be the VIP, ARP must show the virtual MAC.</li>
<li>Run <code>show standby brief</code> on every router and compare group, VIP, roles.</li>
<li>DUPADDR plus two Active means the peers cannot hear each other: group, version, auth or Layer 2.</li>
<li>Fix all faults against the design, then repeat the failover test.</li>
</ul></div>
`,hi:`
<p>Doctor surgery se shuru nahi karti. Woh poochti hai symptom kya hai, nabz aur temperature check karti hai, aur tab jaakar koi specific test likhti hai. FHRP problems ko bhi yahi discipline chahiye. Lagbhag har HSRP fault chaar symptom groups mein se kisi ek mein aata hai, aur har group causes ki ek chhoti list ki taraf ishaara karta hai. Yeh chapter aapko workflow deta hai aur phir module ke troubleshooting lab, Pune sales floor ke fail hue failover test, ko step by step dikhata hai.</p>

<h3>Chaar symptoms</h3>
<table class="cmp"><tr><th>Symptom</th><th>Aam taur par matlab</th><th>Typical causes</th></tr>
<tr><td><b>Do Active routers</b>, duplicate address messages</td><td>Routers ek dusre ke hellos sun ya accept nahi kar rahe</td><td>Group number, version ya authentication mismatch; Layer 2 par hellos blocked (galat VLAN, trunk VLAN allow nahi karta, ACL)</td></tr>
<tr><td><b>Galat router Active</b></td><td>Election ka result design ke hisaab se nahi</td><td>Priority set nahi, preempt missing, tie bade IP ne decide kiya</td></tr>
<tr><td>Uplink marne par <b>failover nahi</b></td><td>HSRP LAN ke aage nahi dekh sakta</td><td>Tracking nahi, decrement bahut chhota, peer par preempt nahi</td></tr>
<tr><td>HSRP healthy dikhta hai phir bhi <b>users fail</b></td><td>Problem host side par hai</td><td>Hosts ya DHCP asli router IP ki taraf point karte hain, VIP galat subnet mein, routers par VIP alag</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="FHRP troubleshooting flow">
<rect x="200" y="10" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">1. Host gateway = VIP? ARP = VMAC?</text>
<rect x="200" y="62" width="240" height="36" rx="8" fill="#bae6fd"/><text x="320" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. SAARE routers par show standby brief</text>
<rect x="20" y="130" width="190" height="50" rx="8" fill="#fed7aa"/><text x="115" y="152" text-anchor="middle" class="svg-ink" font-size="13">Do Active?</text><text x="115" y="170" text-anchor="middle" class="svg-muted" font-size="12">group, version, auth, L2</text>
<rect x="225" y="130" width="190" height="50" rx="8" fill="#fde68a"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Galat Active?</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">priority, preempt</text>
<rect x="430" y="130" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="525" y="152" text-anchor="middle" class="svg-ink" font-size="13">Failover nahi?</text><text x="525" y="170" text-anchor="middle" class="svg-muted" font-size="12">track, decrement, preempt</text>
<line x1="320" y1="46" x2="320" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="98" x2="115" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="320" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="98" x2="525" y2="130" stroke="#64748b" stroke-width="2"/>
<rect x="200" y="210" width="240" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="233" text-anchor="middle" class="svg-ink" font-size="13">3. Logs padho: STATECHANGE, DUPADDR</text>
<rect x="200" y="258" width="240" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="281" text-anchor="middle" class="svg-ink" font-size="13">4. Fix karo, phir failover test dohrao</text>
<line x1="320" y1="180" x2="320" y2="210" stroke="#64748b" stroke-width="2"/><line x1="320" y1="246" x2="320" y2="258" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Host se shuru karo, har router compare karo, symptom classify karo, logs mein confirm karo, aur hamesha retest karo.</p></div>

<h3>Commands mein workflow</h3>
<ol>
<li><b>Host side.</b> Client ka gateway check karo (Windows par <code>ipconfig</code>, lab mein PC ki IP settings) aur uski ARP entry: gateway VIP hona chahiye aur virtual MAC par map hona chahiye.</li>
<li><b>Har router.</b> Saare members par <code>show standby brief</code>. Aapko bilkul ek Active, ek Standby, har jagah same group number aur VIP, aur har router doosre ka sahi naam leta hua chahiye.</li>
<li><b>Detail.</b> <code>show standby</code> se version ("(version 2)" tag), virtual MAC, timers, authentication, preemption, aur tracking ke liye <b>Priority X (configured Y)</b>.</li>
<li><b>Logs.</b> <code>show logging | include HSRP|DUPADDR|TRACK</code>. Kaam ke messages: <code>%HSRP-5-STATECHANGE</code>, <code>%IP-4-DUPADDR</code> (do routers VIP ka jawab de rahe hain), <code>%HSRP-4-BADAUTH</code> (authentication mismatch), <code>%TRACK-6-STATE</code>.</li>
<li><b>Layer 2.</b> Agar hellos missing hain, check karo ki dono routers ke interfaces same VLAN mein hain aur switches ke beech ka trunk use allow karta hai (<code>show interfaces trunk</code>).</li>
<li><b>Fix aur retest.</b> Fix tab tak poora nahi jab tak failover test dono directions mein pass na ho.</li>
</ol>
<p><code>debug standby</code> har hello aur state change dikhata hai lekin kai groups wale router par bahut shor karta hai; ise sirf lab ya shaant box par thodi der ke liye use karo.</p>

<h3>Walkthrough: module ka troubleshoot lab</h3>
<p>Ticket: kal raat ke change window mein redundancy sabit karni thi, lekin NOC ko duplicate-address messages dikhe, aur R1 ke reboot ke baad woh dobara gateway bana hi nahi. Design: ek group 10, R1 preferred (priority 110) aur role wapas lena chahiye, R2 backup.</p>
<pre class="out">R1# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       10   90    Active  local           unknown         192.168.10.1</span>

R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Gi0/0       20   100   Active  local           unknown         192.168.10.1</span>

R1# show logging | include DUPADDR
<span class="hl">%IP-4-DUPADDR: Duplicate address 192.168.10.1 on GigabitEthernet0/0, sourced by 0000.0c07.ac14</span></pre>
<p>Ise detective ki tarah padho. Dono routers <b>Active</b> hain aur dono ko Standby <b>unknown</b> dikhta hai: woh akele hain. R1 group <b>10</b> mein hai, R2 group <b>20</b> mein. Duplicate-address message ise confirm karta hai: 0000.0c07.ac14 group 20 (0x14 = 20) ka version 1 VMAC hai jo same VIP ka jawab de raha hai. Yahi lab ke pehle sawaal ka jawab hai: R2 group 20 use kar raha hai.</p>
<p>Teen faults, teen fixes:</p>
<pre class="code"><span class="c">! fault 1: R2 par galat group</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# no standby 20
R2(config-if)# standby 10 ip 192.168.10.1
<span class="c">! faults 2 aur 3: R1 ki priority 110 ki jagah 90, aur preempt nahi</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# standby 10 priority 110
R1(config-if)# standby 10 preempt</pre>
<p>Fix 1 ke baad R2 R1 ko sunta hai (jo abhi bhi Active hai) aur Standby ban jaata hai; duplicate messages ruk jaate hain. Fixes 2 aur 3 R1 ko woh preferred router banate hain jo role wapas le lega. Phir failover test dohrao: R1 Gi0/0 shut karo, PC1 se R2 ke through 203.0.113.10 ping karo (R2 <code>Standby -&gt; Active</code> log karta hai), <code>no shutdown</code>, aur confirm karo ki R1 phir Active hai aur R2 wapas Standby.</p>

<div class="eg"><p><b>Worked example.</b> Original ticket mein R1 "dobara gateway kyun nahi bana"? Sahi group ke saath bhi, R1 ki priority 90 thi aur preempt nahi tha. Reboot ke baad use R2 Active milta aur woh hamesha ke liye Standby rehta. 110 aur preempt ke saath woh wapas aane par Coup bhejta hai. Teen alag galtiyon ne ek uljhi hui kahaani banayi; workflow unhe alag karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf pehli dikhne wali cheez fix karna. Lab mein group theek karne se duplicate addresses hat jaate hain aur ticket solve dikhta hai, lekin reboot wali problem tab tak rehti hai jab tak priority aur preempt theek na hon. Result ko hamesha poore design se compare karo aur failover test dohrao.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Dono routers same VIP ke liye Active dikhate hain" ka matlab lagbhag hamesha hai ki woh hellos exchange nahi kar paa rahe: group, version ya authentication mismatch, ya Layer 2 break. Alag priorities ya timers do Active routers <b>nahi</b> banate.</p></div>

<div class="scn"><h4>Trunk par khoye hellos</h4><p>Hyderabad ke ek call centre mein switch replacement ke baad dono distribution switches VLAN 30 ke liye Active ho gaye aur phones ne one-way audio report kiya. Groups, versions aur keys sab match karte the. Naye switch par <code>show interfaces trunk</code> ne dikhaya ki inter-switch trunk VLANs 10, 20 aur 40 allow kar raha tha, lekin 30 nahi: template doosri site se copy hua tha. VLAN 30 ke HSRP hellos kabhi cross hi nahi hue. Allowed list mein VLAN jodne se ek Active aur ek Standby wapas aa gaye.</p><p><b>Seekh:</b> HSRP Layer 2 par chalta hai; jab configuration perfect dikhe, to peers ke beech VLAN path check karo.</p></div>

<div class="iv"><p class="q">"Aapke dono HSRP routers Active dikha rahe hain. Aap kaise troubleshoot karoge?"</p><p>Strong answer: iska matlab hai woh ek dusre ke hellos process nahi kar rahe. Dono par <code>show standby</code> compare karo: group number, HSRP version, VIP aur authentication match hone chahiye. Logs mein DUPADDR ya BADAUTH dekho. Agar configuration match karti hai, to Layer 2 check karo: same VLAN, trunk allowed lists, koi ACL jo UDP 1985 par 224.0.0.2 ya 224.0.0.102 block kare. Fix ke baad ek Active aur ek Standby confirm karo aur failover test chalao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle classify karo: do Active, galat Active, failover nahi, ya host-side problem.</li>
<li>Host se shuru karo: gateway VIP hona chahiye, ARP mein virtual MAC dikhna chahiye.</li>
<li>Har router par <code>show standby brief</code> chalao aur group, VIP, roles compare karo.</li>
<li>DUPADDR plus do Active ka matlab peers ek dusre ko nahi sun sakte: group, version, auth ya Layer 2.</li>
<li>Saare faults design ke against fix karo, phir failover test dohrao.</li>
</ul></div>
`}};export{e as default};