var e={id:`consistency`,h:{en:`Consistency checks: type-1, type-2 and graceful`,hi:`Consistency checks: type-1, type-2 aur graceful`},body:{en:`
<p>Think of twins pretending to be one person at a job interview, taking turns to answer. It works only if they wear the same clothes and give the same answers. If one says "I live in Pune" and the other says "I live in Delhi", the interviewer notices at once. The two vPC peers are those twins: they must look identical to the server, so they constantly compare their configuration. That comparison is the <b>consistency check</b>.</p>

<h3>How the check works</h3>
<p>Once the adjacency is formed, each peer sends its relevant configuration to the other over <b>CFS</b> on the peer-link. Each parameter is classified by how dangerous a mismatch would be:</p>
<table class="cmp"><tr><th>Type</th><th>Scope</th><th>Examples</th><th>Action on mismatch</th></tr>
<tr><td><b>Type-1 global</b></td><td>Whole switch</td><td>STP mode (Rapid PVST+ vs MST), MST region name, revision and VLAN mapping, global STP defaults such as bridge assurance, loop guard, BPDU guard and BPDU filter on edge ports</td><td>vPC member ports suspended (on the secondary only, with graceful check)</td></tr>
<tr><td><b>Type-1 per-VLAN</b></td><td>One VLAN</td><td>STP enabled on a VLAN on one peer and disabled on the other</td><td>That VLAN is suspended on the vPCs and peer-link</td></tr>
<tr><td><b>Type-1 interface</b></td><td>One vPC</td><td>LACP mode (on vs active), switchport mode (access vs trunk), native VLAN, speed, duplex, MTU, STP port type and guards on the port-channel, a different LACP partner</td><td>That vPC suspended (on the secondary only, with graceful check)</td></tr>
<tr><td><b>Type-2</b></td><td>Varies</td><td>Allowed VLAN list, SVI admin state, ACLs, QoS, port security, HSRP settings</td><td>Warning and syslog; traffic keeps flowing, but only VLANs allowed on both sides forward on that vPC</td></tr>
</table>
<p>The logic: type-1 parameters could cause a loop or a black hole if they differed, so vPC refuses to forward. Type-2 parameters could cause odd behaviour but not a loop, so vPC keeps forwarding and warns you.</p>

<h3>Graceful consistency check</h3>
<p>In early releases a type-1 mismatch suspended the vPC on <b>both</b> peers, so a single typo took servers completely offline. <b>Graceful consistency check</b>, enabled by default (<code>graceful consistency-check</code> under the vPC domain), changes that: only the <b>secondary</b> (operational secondary) suspends its member ports. The primary keeps forwarding, so a dual-homed server stays up on one link while you fix the mistake. You can see it in <code>show vpc brief</code> as <code>Graceful Consistency Check : Enabled</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Graceful consistency check suspends only the secondary">
<rect x="70" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX1 primary</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">Po20 access vlan 10</text>
<rect x="390" y="20" width="180" height="50" rx="8" fill="#fed7aa"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX2 secondary</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">Po20 trunk (typo)</text>
<line x1="250" y1="45" x2="390" y2="45" stroke="#64748b" stroke-width="4"/>
<rect x="240" y="150" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">SRV1 bond0</text>
<line x1="160" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="3"/><text x="170" y="120" class="svg-muted" font-size="12">forwarding</text>
<line x1="480" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="120" class="svg-accent" font-size="12">suspended</text>
</svg><p class="cap">Lab 4: NX2's port-channel20 was changed to a trunk. Only the secondary suspends; SRV1 keeps running on eth0.</p></div>

<h3>Reading the evidence: the type-1 ticket lab</h3>
<p>In the lab ticket INC-4471, SRV1 suddenly runs on eth0 only. Start on NX2 with <code>show vpc brief</code>:</p>
<pre class="out">NX2# show vpc brief
...
vPC status
----------------------------------------------------------------------------
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          down*  failed      Compatibility check   -
                                       failed for port mode</span></pre>
<p><b>down*</b> means the local vPC is down but the peer's half is up, so traffic still reaches the server through the peer. The reason names the parameter. Now compare both sides:</p>
<pre class="out">NX2# show vpc consistency-parameters interface port-channel 20

    Legend:
        Type 1 : vPC will be suspended in case of mismatch

Name                        Type  Local Value            Peer Value
-------------               ----  ---------------------- -----------------------
mode                        1     active                 active
Speed                       1     10 Gb/s                10 Gb/s
Duplex                      1     full                   full
<span class="hl">Port Mode                   1     trunk                  access</span>
Native Vlan                 1     1                      1
MTU                         1     1500                   1500
Allowed VLANs               -     1-4094                 10</pre>
<p><b>Local Value</b> is the switch you are logged in to (NX2), <b>Peer Value</b> is the other one (NX1). The fix goes on NX2 only, because NX1 was not part of the change:</p>
<pre class="code">NX2(config)# interface port-channel20
NX2(config-if)# switchport mode access
NX2(config-if)# switchport access vlan 10</pre>
<p>Within seconds vPC 20 shows <code>up  success  success  10</code> on both peers, and <code>cat /proc/net/bonding/bond0</code> on SRV1 shows <b>Number of ports: 2</b> again. Save NX2 with <code>copy running-config startup-config</code>.</p>

<h3>Global checks</h3>
<p>For switch-wide parameters use <code>show vpc consistency-parameters global</code>. A global type-1 mismatch shows up in <code>show vpc brief</code> as <code>Configuration consistency status : failed</code> with a reason such as <code>vPC type-1 configuration incompatible - STP Mode inconsistent</code>, and every vPC on the secondary goes down. That is a big outage for single-attached devices on the secondary, so treat global STP changes on a vPC pair as a planned change.</p>

<div class="eg"><p><b>Worked example: type-2 allowed VLANs.</b> Po30 is a trunk on both peers. NX1 allows VLANs 10,20,30; NX2 allows 10,20. This is type-2, so vPC 30 stays up on both, but only the <b>common</b> VLANs 10 and 20 forward on vPC 30; VLAN 30 is locally suspended on that vPC. A VM in VLAN 30 behind Po30 works only when its traffic hashes to NX1, which is the worst kind of intermittent problem. Always check the Allowed VLANs line even when the vPC is up.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing a type-1 parameter on a live vPC one peer at a time and being surprised that the secondary suspends between the two changes; plan it, and expect one link to drop briefly. (2) Reading Local and Peer values the wrong way round. (3) Ignoring type-2 warnings because "the vPC is up".</p></div>

<div class="exam"><p><b>Exam trap.</b> With graceful consistency check, a type-1 mismatch suspends the vPC on the <b>secondary</b> only. Without it (<code>no graceful consistency-check</code>), both peers suspend. Type-2 never suspends the whole vPC.</p></div>

<div class="scn"><h4>The MTU change at midnight</h4><p>A storage team asked for jumbo frames on a hypervisor bundle. The engineer set <code>mtu 9216</code> on port-channel40 on NX1, then got distracted by another call. For twenty minutes vPC 40 was <code>down*</code> on NX2 with "Compatibility check failed for MTU"; every host in the cluster ran on one link and a backup job saturated it, triggering latency alerts. Setting the same MTU on NX2 cleared it. The team now uses a change template that configures both peers back to back and checks <code>show vpc consistency-parameters vpc 40</code> before closing.</p><p><b>Lesson:</b> a vPC change is only complete when both peers match; verify consistency before you walk away.</p></div>

<div class="iv"><p class="q">"What is the difference between type-1 and type-2 vPC consistency parameters?"</p><p>Strong answer: type-1 parameters could cause loops or black holes if they differ, such as STP mode, port mode, native VLAN, speed, MTU or LACP mode, so a mismatch suspends the vPC (globally or per interface). Type-2 parameters such as allowed VLANs, SVI state or ACLs only raise a warning. With graceful consistency check, the default, only the secondary suspends on a type-1 mismatch so the server stays up on the primary. Name the command: <code>show vpc consistency-parameters</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vPC peers compare configuration over CFS on the peer-link once the adjacency is formed.</li>
<li>Type-1 mismatch (global, per-VLAN or interface) suspends; type-2 only warns.</li>
<li>Graceful consistency check (default) suspends only the secondary, keeping the server up on the primary.</li>
<li><code>down*</code> means local vPC down, still forwarding through the peer.</li>
<li>Diagnose with <code>show vpc brief</code>, then <code>show vpc consistency-parameters interface port-channel N</code> or <code>global</code>; Local = this switch.</li>
</ul></div>
`,hi:`
<p>Do judwa bhaiyon ki kalpana karo jo job interview mein ek insaan hone ka naatak karte hain, baari baari jawab dete hue. Yeh tabhi chalta hai jab dono same kapde pehnein aur same jawab dein. Agar ek kahe "main Pune mein rehta hoon" aur doosra kahe "main Delhi mein rehta hoon", to interviewer turant pakad leta hai. Do vPC peers wahi judwa hain: unhe server ko bilkul ek jaisa dikhna hai, isliye woh lagatar apni configuration compare karte hain. Yahi comparison <b>consistency check</b> hai.</p>

<h3>Check kaise kaam karta hai</h3>
<p>Adjacency banne ke baad har peer apni relevant configuration peer-link par <b>CFS</b> ke through doosre ko bhejta hai. Har parameter ko is hisaab se classify kiya jaata hai ki mismatch kitna khatarnak hoga:</p>
<table class="cmp"><tr><th>Type</th><th>Scope</th><th>Examples</th><th>Mismatch par action</th></tr>
<tr><td><b>Type-1 global</b></td><td>Poora switch</td><td>STP mode (Rapid PVST+ vs MST), MST region name, revision aur VLAN mapping, global STP defaults jaise bridge assurance, loop guard, edge ports par BPDU guard aur BPDU filter</td><td>vPC member ports suspend (graceful check ke saath sirf secondary par)</td></tr>
<tr><td><b>Type-1 per-VLAN</b></td><td>Ek VLAN</td><td>Ek peer par VLAN par STP enabled aur doosre par disabled</td><td>Woh VLAN vPCs aur peer-link par suspend</td></tr>
<tr><td><b>Type-1 interface</b></td><td>Ek vPC</td><td>LACP mode (on vs active), switchport mode (access vs trunk), native VLAN, speed, duplex, MTU, port-channel par STP port type aur guards, alag LACP partner</td><td>Woh vPC suspend (graceful check ke saath sirf secondary par)</td></tr>
<tr><td><b>Type-2</b></td><td>Alag alag</td><td>Allowed VLAN list, SVI admin state, ACLs, QoS, port security, HSRP settings</td><td>Warning aur syslog; traffic chalta rehta hai, par us vPC par sirf dono sides par allowed VLANs forward hote hain</td></tr>
</table>
<p>Logic: type-1 parameters alag hon to loop ya black hole bana sakte hain, isliye vPC forward karne se mana kar deta hai. Type-2 parameters ajeeb behaviour paida kar sakte hain par loop nahi, isliye vPC forward karta rehta hai aur aapko warn karta hai.</p>

<h3>Graceful consistency check</h3>
<p>Purane releases mein type-1 mismatch vPC ko <b>dono</b> peers par suspend kar deta tha, isliye ek typo servers ko poori tarah offline kar deta tha. <b>Graceful consistency check</b>, jo default mein enabled hai (vPC domain ke neeche <code>graceful consistency-check</code>), ise badalta hai: sirf <b>secondary</b> (operational secondary) apne member ports suspend karta hai. Primary forward karta rehta hai, isliye dual-homed server ek link par up rehta hai jab tak aap galti theek karte ho. Aap ise <code>show vpc brief</code> mein <code>Graceful Consistency Check : Enabled</code> ki tarah dekh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Graceful consistency check sirf secondary ko suspend karta hai">
<rect x="70" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX1 primary</text><text x="160" y="60" text-anchor="middle" class="svg-muted" font-size="12">Po20 access vlan 10</text>
<rect x="390" y="20" width="180" height="50" rx="8" fill="#fed7aa"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX2 secondary</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">Po20 trunk (typo)</text>
<line x1="250" y1="45" x2="390" y2="45" stroke="#64748b" stroke-width="4"/>
<rect x="240" y="150" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">SRV1 bond0</text>
<line x1="160" y1="70" x2="290" y2="150" stroke="#64748b" stroke-width="3"/><text x="170" y="120" class="svg-muted" font-size="12">forwarding</text>
<line x1="480" y1="70" x2="350" y2="150" stroke="#64748b" stroke-width="3" stroke-dasharray="7 5"/><text x="420" y="120" class="svg-accent" font-size="12">suspended</text>
</svg><p class="cap">Lab 4: NX2 ka port-channel20 trunk kar diya gaya. Sirf secondary suspend hota hai; SRV1 eth0 par chalta rehta hai.</p></div>

<h3>Saboot padhna: type-1 ticket lab</h3>
<p>Lab ticket INC-4471 mein SRV1 achanak sirf eth0 par chal raha hai. NX2 par <code>show vpc brief</code> se shuru karo:</p>
<pre class="out">NX2# show vpc brief
...
vPC status
----------------------------------------------------------------------------
Id    Port          Status Consistency Reason                Active vlans
--    ------------  ------ ----------- ------                ---------------
<span class="hl">20    Po20          down*  failed      Compatibility check   -
                                       failed for port mode</span></pre>
<p><b>down*</b> ka matlab hai local vPC down hai par peer ka hissa up hai, isliye traffic peer ke through server tak pahunch raha hai. Reason parameter ka naam batata hai. Ab dono sides compare karo:</p>
<pre class="out">NX2# show vpc consistency-parameters interface port-channel 20

    Legend:
        Type 1 : vPC will be suspended in case of mismatch

Name                        Type  Local Value            Peer Value
-------------               ----  ---------------------- -----------------------
mode                        1     active                 active
Speed                       1     10 Gb/s                10 Gb/s
Duplex                      1     full                   full
<span class="hl">Port Mode                   1     trunk                  access</span>
Native Vlan                 1     1                      1
MTU                         1     1500                   1500
Allowed VLANs               -     1-4094                 10</pre>
<p><b>Local Value</b> woh switch hai jismein aap logged in ho (NX2), <b>Peer Value</b> doosra (NX1). Fix sirf NX2 par jaata hai, kyunki NX1 change ka hissa nahi tha:</p>
<pre class="code">NX2(config)# interface port-channel20
NX2(config-if)# switchport mode access
NX2(config-if)# switchport access vlan 10</pre>
<p>Kuch seconds mein vPC 20 dono peers par <code>up  success  success  10</code> dikhata hai, aur SRV1 par <code>cat /proc/net/bonding/bond0</code> phir se <b>Number of ports: 2</b> dikhata hai. NX2 ko <code>copy running-config startup-config</code> se save karo.</p>

<h3>Global checks</h3>
<p>Switch-wide parameters ke liye <code>show vpc consistency-parameters global</code> use karo. Global type-1 mismatch <code>show vpc brief</code> mein <code>Configuration consistency status : failed</code> ki tarah dikhta hai, reason jaise <code>vPC type-1 configuration incompatible - STP Mode inconsistent</code>, aur secondary par har vPC down ho jaata hai. Secondary par single-attached devices ke liye yeh bada outage hai, isliye vPC pair par global STP changes ko planned change ki tarah treat karo.</p>

<div class="eg"><p><b>Worked example: type-2 allowed VLANs.</b> Po30 dono peers par trunk hai. NX1 VLANs 10,20,30 allow karta hai; NX2 10,20. Yeh type-2 hai, isliye vPC 30 dono par up rehta hai, par vPC 30 par sirf <b>common</b> VLANs 10 aur 20 forward hote hain; VLAN 30 us vPC par locally suspend hai. Po30 ke peeche VLAN 30 ki VM tabhi chalti hai jab uska traffic NX1 par hash ho, jo sabse bura intermittent problem hai. vPC up ho tab bhi Allowed VLANs line hamesha check karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Live vPC par type-1 parameter ek ek peer karke badalna aur hairaan hona ki do changes ke beech secondary suspend ho gaya; ise plan karo, aur thodi der ek link girne ki umeed rakho. (2) Local aur Peer values ulti padhna. (3) "vPC up hai" soch kar type-2 warnings ko ignore karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Graceful consistency check ke saath type-1 mismatch vPC ko sirf <b>secondary</b> par suspend karta hai. Iske bina (<code>no graceful consistency-check</code>), dono peers suspend karte hain. Type-2 kabhi poora vPC suspend nahi karta.</p></div>

<div class="scn"><h4>Aadhi raat ka MTU change</h4><p>Storage team ne hypervisor bundle par jumbo frames maange. Engineer ne NX1 par port-channel40 par <code>mtu 9216</code> set kiya, phir ek aur call mein uljh gaya. Bees minute tak vPC 40 NX2 par "Compatibility check failed for MTU" ke saath <code>down*</code> raha; cluster ka har host ek link par chala aur ek backup job ne use saturate kar diya, jisse latency alerts aaye. NX2 par same MTU set karte hi theek ho gaya. Team ab ek change template use karti hai jo dono peers ko lagataar configure karta hai aur band karne se pehle <code>show vpc consistency-parameters vpc 40</code> check karta hai.</p><p><b>Seekh:</b> vPC change tabhi poora hai jab dono peers match karein; jaane se pehle consistency verify karo.</p></div>

<div class="iv"><p class="q">"Type-1 aur type-2 vPC consistency parameters mein kya fark hai?"</p><p>Strong answer: type-1 parameters alag hon to loops ya black holes bana sakte hain, jaise STP mode, port mode, native VLAN, speed, MTU ya LACP mode, isliye mismatch vPC ko suspend karta hai (globally ya per interface). Type-2 parameters jaise allowed VLANs, SVI state ya ACLs sirf warning dete hain. Graceful consistency check ke saath, jo default hai, type-1 mismatch par sirf secondary suspend karta hai taaki server primary par up rahe. Command ka naam lo: <code>show vpc consistency-parameters</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adjacency banne ke baad vPC peers peer-link par CFS se configuration compare karte hain.</li>
<li>Type-1 mismatch (global, per-VLAN ya interface) suspend karta hai; type-2 sirf warn karta hai.</li>
<li>Graceful consistency check (default) sirf secondary ko suspend karta hai, server ko primary par up rakhta hai.</li>
<li><code>down*</code> ka matlab local vPC down, peer ke through ab bhi forwarding.</li>
<li><code>show vpc brief</code> se diagnose karo, phir <code>show vpc consistency-parameters interface port-channel N</code> ya <code>global</code>; Local = yeh switch.</li>
</ul></div>
`}};export{e as default};