var e={id:`ha-intro`,h:{en:`High availability on FortiGate: the big picture`,hi:`FortiGate par High availability: bada picture`},body:{en:`
<h3>What you will learn</h3>
<p>This module takes you from "I know what a cluster is" to "I can build, break, read and repair a FortiGate FGCP cluster and explain every election decision". By the end you will be able to:</p>
<ul>
<li>choose between FGCP, FGSP, virtual clusters and VRRP for a given design;</li>
<li>build an active-passive cluster with the right heartbeat, group and monitoring settings;</li>
<li>predict which unit becomes primary, and prove it from <code>diagnose sys ha history read</code>;</li>
<li>explain what is synchronised, what is not, and how sessions survive a failover;</li>
<li>reach the secondary unit through the reserved management interface;</li>
<li>troubleshoot split brain, missed failovers, out-of-sync units and flip-flops.</li>
</ul>
<p><b>Prerequisites:</b> the NSE 4 HA module (FGCP basics: <code>a-p</code>, <code>hbdev</code>, <code>monitor</code>, <code>priority</code>), basic firewall policy and NAT, and the earlier modules of this track (hardware acceleration, BGP, web proxy and UTM). We build on those and do not repeat them at beginner depth.</p>

<h3>The analogy: two pilots, one cockpit</h3>
<p>An airliner has a captain and a first officer. Both are fully trained, both see the same instruments, and they talk constantly. Only one holds the controls. If the captain becomes unwell, the first officer takes over within moments and the passengers hardly notice. But the cockpit needs rules: who is captain today, how do they know the other is alive, and what if they disagree? A FortiGate cluster is exactly this. The <b>primary</b> flies, the <b>secondary</b> watches, and the rules of this module decide who flies next.</p>

<h3>Why high availability</h3>
<p>A single firewall is a single point of failure: one power supply, one software bug, one reboot for an upgrade, and the whole site is offline. <b>High availability (HA)</b> removes that point by running two (or more) units that look like one device to the network. You get three benefits: <b>redundancy</b> (a unit can die), <b>maintainability</b> (upgrade one unit at a time) and, in some designs, extra <b>capacity</b>. HA does not protect against a mistake you configure on both units, and it is not a backup: a bad policy is synchronised to the spare within seconds.</p>

<h3>The four ways to be redundant</h3>
<table class="cmp"><tr><th>Technology</th><th>What it is</th><th>Typical use</th></tr>
<tr><td><b>FGCP</b> (FortiGate Clustering Protocol)</td><td>Units share one identity, one configuration and, optionally, sessions. Heartbeat links join them.</td><td>The standard HA cluster, and the focus of this module</td></tr>
<tr><td><b>FGSP</b> (FortiGate Session Life Support Protocol)</td><td>Units keep their own configuration and addresses; only sessions are synchronised. Traffic is steered by routing or a load balancer.</td><td>Asymmetric routing, very large active-active sites</td></tr>
<tr><td><b>Virtual clusters</b></td><td>FGCP with two virtual domains groups, each with its own primary, so each unit is primary for some VDOMs.</td><td>Spreading VDOM load over both units</td></tr>
<tr><td><b>VRRP</b></td><td>A standard first-hop redundancy protocol on an interface. No configuration or session sync.</td><td>Interoperating with other vendors</td></tr></table>
<div class="note"><p>Honest scope: in the lab simulator FGCP active-passive is fully modelled. Active-active, virtual clusters and FGSP are theory only, and you will meet them in chapter 2.</p></div>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">ISP router</text><text x="85" y="56" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<rect x="20" y="100" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="123" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN</text>
<rect x="190" y="150" width="140" height="60" rx="8" fill="#bae6fd"/><text x="260" y="172" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text><text x="260" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text><text x="260" y="204" text-anchor="middle" class="svg-muted" font-size="11">NU41WS000</text>
<rect x="400" y="150" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="470" y="172" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 100</text><text x="470" y="204" text-anchor="middle" class="svg-muted" font-size="11">OO2UZP000</text>
<line x1="330" y1="168" x2="400" y2="168" stroke="#64748b" stroke-width="4"/><line x1="330" y1="192" x2="400" y2="192" stroke="#64748b" stroke-width="2"/>
<text x="365" y="145" text-anchor="middle" class="svg-accent" font-size="12">port3 + port4</text><text x="365" y="228" text-anchor="middle" class="svg-muted" font-size="12">heartbeat</text>
<line x1="150" y1="118" x2="230" y2="150" stroke="#64748b" stroke-width="2"/><line x1="150" y1="118" x2="440" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="64" x2="85" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="130" y="85" class="svg-muted" font-size="12">port1 WAN 198.51.100.2/29</text>
<rect x="190" y="260" width="140" height="32" rx="8" fill="#fde68a"/><text x="260" y="281" text-anchor="middle" class="svg-ink" font-size="12">SW-LAN 10.10.1.0/24</text>
<line x1="260" y1="210" x2="260" y2="260" stroke="#64748b" stroke-width="2"/><line x1="470" y1="210" x2="330" y2="268" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="40" width="160" height="44" rx="8" fill="#fed7aa"/><text x="520" y="60" text-anchor="middle" class="svg-ink" font-size="13">SW-MGMT / PC-NOC</text><text x="520" y="76" text-anchor="middle" class="svg-muted" font-size="12">port8, 10.99.0.0/24</text>
<line x1="520" y1="84" x2="480" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Nilgiri Telecom, Coimbatore: FGT-A and FGT-B share WAN, LAN and two heartbeat cables, each with its own management port.</p></div>

<h3>The lab network you will use</h3>
<p>All four labs use a part of one network. Remember it: <b>FGT-A</b> (serial <code>FGVMEV1NU41WS000</code>, priority 200) and <b>FGT-B</b> (serial <code>FGVMEV1OO2UZP000</code>, priority 100). port1 is the WAN, <code>198.51.100.2/29</code>, toward the ISP router <code>198.51.100.1</code>. port2 is the LAN, <code>10.10.1.1/24</code>, with PC-LAN <code>10.10.1.10</code> behind it. port3 and port4 are the heartbeat, cabled back to back. port8 is the management interface, with unit addresses <code>10.99.0.11</code> and <code>10.99.0.12</code>. The cluster uses group-id 20, group-name <code>NILGIRI-HA</code> and mode <code>a-p</code>.</p>
<pre class="out">FGT-A # get system status
Version: FortiGate-VM64 v7.6
<span class="hl">Serial-Number: FGVMEV1NU41WS000</span>
<span class="hl">Hostname: FGT-A</span>
<span class="hl">Current HA mode: a-p, primary</span></pre>

<h3>The four labs ahead</h3>
<ol>
<li><b>n7-ha-build</b>: build the cluster, let FGT-B join, and set up the reserved management interface.</li>
<li><b>n7-ha-election</b> (ticket NT-4471): find out why a dead uplink caused no failover, and control who is primary.</li>
<li><b>n7-ha-sync</b> (ticket NT-4502): two units that disagree on policies, found with checksums.</li>
<li><b>n7-ha-session</b>: make established sessions survive a failover.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Treating HA as a performance feature. In active-passive mode the second unit adds no capacity, and a cluster is only as good as its monitoring: a unit that cannot see its own failure will not hand over.</p></div>
<div class="exam"><p><b>Exam trap.</b> FGCP clusters share <b>one configuration</b>; FGSP units keep <b>separate configurations</b> and synchronise only sessions. Do not mix them up.</p></div>

<div class="scn"><h4>The upgrade that nobody noticed</h4><p>A telecom data centre had a single firewall and scheduled a Sunday 2 am maintenance window for every firmware upgrade, with an outage notice to customers. After moving to an FGCP pair, the engineer upgraded the secondary first, forced a controlled failover, then upgraded the old primary. Customers saw one lost ping. The window shrank from 40 minutes of downtime to a few seconds.</p><p><b>Lesson:</b> HA's main daily value is maintainability, not only protection from hardware failure.</p></div>

<div class="iv"><p class="q">"What is the difference between FGCP and VRRP on a FortiGate?"</p><p>FGCP clusters whole devices: shared configuration, optional session synchronisation, one virtual MAC and heartbeat links. VRRP only gives a redundant gateway address on one interface and synchronises nothing. A strong answer also mentions FGSP as the session-only option for asymmetric designs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA removes the firewall as a single point of failure and makes upgrades painless; it is not a backup.</li>
<li>FGCP = one identity, synced configuration. FGSP = separate configurations, synced sessions. VRRP = gateway address only.</li>
<li>The lab cluster: FGT-A (priority 200) and FGT-B (priority 100), group-id 20, <code>NILGIRI-HA</code>, mode a-p.</li>
<li>Heartbeat on port3 and port4, management on port8, data on port1 and port2.</li>
<li>The simulator models FGCP active-passive fully; other modes are theory.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<p>Yeh module aapko "mujhe pata hai cluster kya hota hai" se "main FortiGate FGCP cluster build, break, read aur repair kar sakta hoon aur har election decision explain kar sakta hoon" tak le jayega. Ant tak aap yeh kar paoge:</p>
<ul>
<li>kisi design ke liye FGCP, FGSP, virtual clusters aur VRRP mein se sahi choice karna;</li>
<li>sahi heartbeat, group aur monitoring settings ke saath active-passive cluster build karna;</li>
<li>predict karna ki kaun sa unit primary banega, aur <code>diagnose sys ha history read</code> se prove karna;</li>
<li>explain karna ki kya synchronise hota hai, kya nahi, aur failover mein sessions kaise bachte hain;</li>
<li>reserved management interface se secondary unit tak pahunchna;</li>
<li>split brain, missed failover, out-of-sync units aur flip-flop troubleshoot karna.</li>
</ul>
<p><b>Prerequisites:</b> NSE 4 HA module (FGCP basics: <code>a-p</code>, <code>hbdev</code>, <code>monitor</code>, <code>priority</code>), basic firewall policy aur NAT, aur is track ke pichhle modules (hardware acceleration, BGP, web proxy aur UTM). Hum inhi par build karte hain, beginner depth par dobara nahi padhate.</p>

<h3>Analogy: do pilots, ek cockpit</h3>
<p>Airliner mein captain aur first officer hote hain. Dono fully trained hain, dono ko same instruments dikhte hain, aur dono lagatar baat karte hain. Controls sirf ek ke paas hote hain. Captain ki tabiyat bigde to first officer kuch hi pal mein control le leta hai aur passengers ko lagbhag pata nahi chalta. Lekin cockpit ko rules chahiye: aaj captain kaun hai, doosra zinda hai yeh kaise pata chalega, aur agar dono mein disagreement ho to? FortiGate cluster bilkul aisa hi hai. <b>Primary</b> udata hai, <b>secondary</b> dekhta hai, aur is module ke rules decide karte hain ki agla kaun udayega.</p>

<h3>High availability kyun</h3>
<p>Ek akela firewall single point of failure hai: ek power supply, ek software bug, upgrade ke liye ek reboot, aur poori site offline. <b>High availability (HA)</b> do (ya zyada) units chalakar yeh point hata deta hai, jo network ko ek device jaise dikhte hain. Teen faayde milte hain: <b>redundancy</b> (ek unit mar sakta hai), <b>maintainability</b> (ek ek karke upgrade) aur kuch designs mein extra <b>capacity</b>. HA us galti se nahi bachata jo aap dono units par configure karte ho, aur yeh backup nahi hai: kharab policy kuch seconds mein spare par sync ho jaati hai.</p>

<h3>Redundant hone ke chaar tareeke</h3>
<table class="cmp"><tr><th>Technology</th><th>Kya hai</th><th>Typical use</th></tr>
<tr><td><b>FGCP</b> (FortiGate Clustering Protocol)</td><td>Units ki ek identity, ek configuration aur optionally sessions share hote hain. Heartbeat links unhe jodte hain.</td><td>Standard HA cluster, is module ka focus</td></tr>
<tr><td><b>FGSP</b> (FortiGate Session Life Support Protocol)</td><td>Units apni khud ki configuration aur addresses rakhte hain; sirf sessions synchronise hote hain. Traffic routing ya load balancer se steer hota hai.</td><td>Asymmetric routing, bahut bade active-active sites</td></tr>
<tr><td><b>Virtual clusters</b></td><td>FGCP jisme do virtual domain groups hote hain, har ek ka apna primary; yaani har unit kuch VDOMs ka primary hota hai.</td><td>VDOM load dono units par baantna</td></tr>
<tr><td><b>VRRP</b></td><td>Interface par standard first-hop redundancy protocol. Configuration ya session sync nahi.</td><td>Doosre vendors ke saath interoperability</td></tr></table>
<div class="note"><p>Honest scope: lab simulator mein FGCP active-passive poori tarah model hai. Active-active, virtual clusters aur FGSP sirf theory hain, aur chapter 2 mein milenge.</p></div>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="40" text-anchor="middle" class="svg-ink" font-size="13">ISP router</text><text x="85" y="56" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.1</text>
<rect x="20" y="100" width="130" height="36" rx="8" fill="#e2e8f0"/><text x="85" y="123" text-anchor="middle" class="svg-ink" font-size="13">SW-WAN</text>
<rect x="190" y="150" width="140" height="60" rx="8" fill="#bae6fd"/><text x="260" y="172" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text><text x="260" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 200</text><text x="260" y="204" text-anchor="middle" class="svg-muted" font-size="11">NU41WS000</text>
<rect x="400" y="150" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="470" y="172" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">priority 100</text><text x="470" y="204" text-anchor="middle" class="svg-muted" font-size="11">OO2UZP000</text>
<line x1="330" y1="168" x2="400" y2="168" stroke="#64748b" stroke-width="4"/><line x1="330" y1="192" x2="400" y2="192" stroke="#64748b" stroke-width="2"/>
<text x="365" y="145" text-anchor="middle" class="svg-accent" font-size="12">port3 + port4</text><text x="365" y="228" text-anchor="middle" class="svg-muted" font-size="12">heartbeat</text>
<line x1="150" y1="118" x2="230" y2="150" stroke="#64748b" stroke-width="2"/><line x1="150" y1="118" x2="440" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="85" y1="64" x2="85" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="130" y="85" class="svg-muted" font-size="12">port1 WAN 198.51.100.2/29</text>
<rect x="190" y="260" width="140" height="32" rx="8" fill="#fde68a"/><text x="260" y="281" text-anchor="middle" class="svg-ink" font-size="12">SW-LAN 10.10.1.0/24</text>
<line x1="260" y1="210" x2="260" y2="260" stroke="#64748b" stroke-width="2"/><line x1="470" y1="210" x2="330" y2="268" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="40" width="160" height="44" rx="8" fill="#fed7aa"/><text x="520" y="60" text-anchor="middle" class="svg-ink" font-size="13">SW-MGMT / PC-NOC</text><text x="520" y="76" text-anchor="middle" class="svg-muted" font-size="12">port8, 10.99.0.0/24</text>
<line x1="520" y1="84" x2="480" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Nilgiri Telecom, Coimbatore: FGT-A aur FGT-B WAN, LAN aur do heartbeat cables share karte hain, aur har ek ka apna management port hai.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Chaaron labs ek hi network ka hissa use karte hain. Isse yaad rakho: <b>FGT-A</b> (serial <code>FGVMEV1NU41WS000</code>, priority 200) aur <b>FGT-B</b> (serial <code>FGVMEV1OO2UZP000</code>, priority 100). port1 WAN hai, <code>198.51.100.2/29</code>, ISP router <code>198.51.100.1</code> ki taraf. port2 LAN hai, <code>10.10.1.1/24</code>, jiske peeche PC-LAN <code>10.10.1.10</code> hai. port3 aur port4 heartbeat hain, back to back cabled. port8 management hai, unit addresses <code>10.99.0.11</code> aur <code>10.99.0.12</code>. Cluster group-id 20, group-name <code>NILGIRI-HA</code> aur mode <code>a-p</code> use karta hai.</p>
<pre class="out">FGT-A # get system status
Version: FortiGate-VM64 v7.6
<span class="hl">Serial-Number: FGVMEV1NU41WS000</span>
<span class="hl">Hostname: FGT-A</span>
<span class="hl">Current HA mode: a-p, primary</span></pre>

<h3>Aage ke chaar labs</h3>
<ol>
<li><b>n7-ha-build</b>: cluster build karo, FGT-B ko join karne do, aur reserved management interface set karo.</li>
<li><b>n7-ha-election</b> (ticket NT-4471): pata karo ki dead uplink par failover kyun nahi hua, aur primary kaun ho yeh control karo.</li>
<li><b>n7-ha-sync</b> (ticket NT-4502): do units jo policies par disagree karte hain, checksums se dhoondho.</li>
<li><b>n7-ha-session</b>: established sessions ko failover mein zinda rakho.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> HA ko performance feature samajhna. Active-passive mode mein doosra unit capacity nahi badhata, aur cluster utna hi achha hai jitni achhi uski monitoring: jo unit apni failure dekh hi nahi sakta woh handover nahi karega.</p></div>
<div class="exam"><p><b>Exam trap.</b> FGCP clusters <b>ek configuration</b> share karte hain; FGSP units <b>alag configurations</b> rakhte hain aur sirf sessions synchronise karte hain. Inhe mix mat karo.</p></div>

<div class="scn"><h4>Woh upgrade jo kisi ne notice nahi kiya</h4><p>Ek telecom data centre mein single firewall tha aur har firmware upgrade ke liye Sunday 2 am ki maintenance window aur customers ko outage notice dena padta tha. FGCP pair par move karne ke baad engineer ne pehle secondary upgrade kiya, controlled failover force kiya, phir purana primary upgrade kiya. Customers ko ek ping lost dikha. Window 40 minute ke downtime se kuch seconds par aa gayi.</p><p><b>Lesson:</b> HA ki roz ki sabse badi value maintainability hai, sirf hardware failure se bachav nahi.</p></div>

<div class="iv"><p class="q">"FortiGate par FGCP aur VRRP mein kya difference hai?"</p><p>FGCP poore devices ko cluster karta hai: shared configuration, optional session synchronisation, ek virtual MAC aur heartbeat links. VRRP sirf ek interface par redundant gateway address deta hai aur kuch synchronise nahi karta. Strong answer mein FGSP bhi aata hai, jo asymmetric designs ke liye sirf-session option hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA firewall ko single point of failure se hata deta hai aur upgrades aasaan banata hai; yeh backup nahi hai.</li>
<li>FGCP = ek identity, synced configuration. FGSP = alag configurations, synced sessions. VRRP = sirf gateway address.</li>
<li>Lab cluster: FGT-A (priority 200) aur FGT-B (priority 100), group-id 20, <code>NILGIRI-HA</code>, mode a-p.</li>
<li>Heartbeat port3 aur port4 par, management port8 par, data port1 aur port2 par.</li>
<li>Simulator FGCP active-passive poora model karta hai; doosre modes theory hain.</li>
</ul></div>
`}};export{e as default};