var e={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: from link to CAM, walking the three labs`,hi:`Troubleshooting workflow: link se CAM tak, teeno labs ke saath`},body:{en:`
<p>A good doctor does not order a brain scan for a sprained ankle. She asks where it hurts, checks the simple things first and moves up only when the simple things are healthy. Layer 2 troubleshooting works the same way: one fixed order, one or two commands per layer, and a clear question at every step.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layer 2 troubleshooting order">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="80" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text>
<rect x="115" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="12">2 Link/bundle</text>
<rect x="220" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="265" y="80" text-anchor="middle" class="svg-ink" font-size="12">3 Trunk/VLAN</text>
<rect x="325" y="50" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="370" y="80" text-anchor="middle" class="svg-ink" font-size="12">4 STP/MST</text>
<rect x="430" y="50" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="80" text-anchor="middle" class="svg-ink" font-size="12">5 CAM path</text>
<rect x="535" y="50" width="95" height="50" rx="8" fill="#fde68a"/><text x="582" y="80" text-anchor="middle" class="svg-ink" font-size="12">6 Fix, prove</text>
<line x1="100" y1="75" x2="115" y2="75" stroke="#64748b" stroke-width="2"/><line x1="205" y1="75" x2="220" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="325" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="535" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">bottom-up: only move right when the current layer is proven healthy</text>
</svg><p class="cap">Six steps, always in this order.</p></div>
<table class="cmp"><tr><th>Step</th><th>Question</th><th>Commands</th></tr>
<tr><td>1 Symptom</td><td>No connectivity, or a wrong/slow path? Which VLANs, which hosts?</td><td>ping, the ticket, interface counters</td></tr>
<tr><td>2 Link and bundle</td><td>Are ports up, bundled, not err-disabled?</td><td><code>show interfaces status</code>, <code>show etherchannel summary</code>, <code>show interfaces status err-disabled</code></td></tr>
<tr><td>3 Trunk and VLAN</td><td>Trunking? Native matches? VLAN allowed, existing, forwarding?</td><td><code>show interfaces trunk</code>, <code>show interfaces switchport</code>, <code>show vlan brief</code></td></tr>
<tr><td>4 STP / MST</td><td>Which instance? Right root? Any Bound, inconsistent or blocked port?</td><td><code>show spanning-tree vlan X</code>, <code>show spanning-tree mst configuration digest</code>, <code>show spanning-tree inconsistentports</code></td></tr>
<tr><td>5 CAM path</td><td>Where do the hosts' MACs really appear?</td><td><code>show mac address-table address M</code> switch by switch</td></tr>
<tr><td>6 Fix and prove</td><td>Did the path change to the design?</td><td>repeat steps 3-5, ping</td></tr></table>

<h3>Lab 1 in checklist form</h3>
<p>Build: identical <code>spanning-tree mst configuration</code> on all three switches, <code>show pending</code>, <code>exit</code>. Roots: <code>mst 0-1 root primary</code> on SW1, <code>mst 2 root primary</code> on SW2, secondaries mirrored. Prove: on SW3 <code>show spanning-tree mst 1</code> and <code>mst 2</code> (Gi0/1 FWD in MST1, BLK in MST2 and the reverse for Gi0/2), ping PC10 to SRV10 and PC30 to SRV30, then follow the MACs: on SW1 PC30's MAC appears on Gi0/1 (from SW2), proving VLAN 30 crossed SW2. Finally compare the digest on SW1 and SW3.</p>

<h3>Lab 2 in checklist form</h3>
<p>Step 2 first: <code>show etherchannel summary</code> shows Po1(SU) with both members (P), so the bundle is healthy and the problem is distribution, not failure. <code>show etherchannel load-balance</code> on SW2 answers "src-mac". Change both switches to <code>port-channel load-balance src-dst-ip</code>, then <code>test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.11</code> (Gi0/2) and the same with .12 (Gi0/1). Ping from both PCs.</p>

<h3>Lab 3 walk-through: Three switches, three regions</h3>
<p><b>Symptom.</b> VLAN 40 traffic takes the wrong uplink and every inter-switch port shows Bound. Nothing is down: this is a wrong-path ticket, so jump quickly through steps 2-3 (all trunks up, VLAN 40 allowed and active) to step 4.</p>
<p><b>Step 4, identity first.</b> Compare the region on SW1 and SW3:</p>
<pre class="out">SW1# show spanning-tree mst configuration
Name      [NK-CAMPUS]
Revision  1     Instances configured 3

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
0         1-9,11-19,21-29,31-39,41-4094
1         10,20
2         30,40
-------------------------------------------------------------------------------

SW3# show spanning-tree mst configuration
Name      [NK-CAMPUS]
<span class="hl">Revision  2     Instances configured 3</span>
...</pre>
<p>Same name, same mapping, <b>revision 2</b>. One number makes SW3 a separate region. You must not touch SW1, so fix SW3:</p>
<pre class="code">SW3(config)# spanning-tree mst configuration
SW3(config-mst)# revision 1
SW3(config-mst)# show pending
SW3(config-mst)# exit</pre>
<p><b>SW2 next.</b> Its name and revision look right, so compare the table:</p>
<pre class="out">SW2# show spanning-tree mst configuration
Name      [NK-CAMPUS]
Revision  1     Instances configured 3

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
<span class="hl">0         1-9,11-19,21-29,31-4094</span>
1         10,20
<span class="hl">2         30</span></pre>
<p>VLAN 40 was never mapped, so it sits in instance 0 and the digest differs. Because <code>instance</code> adds to the existing list:</p>
<pre class="code">SW2(config)# spanning-tree mst configuration
SW2(config-mst)# instance 2 vlan 40
SW2(config-mst)# show pending
SW2(config-mst)# exit</pre>
<p><b>Why VLAN 40 took the wrong path.</b> With three regions, MSTIs could not cross any link, so every VLAN followed the CIST. The CIST root is SW1 (MST0 priority 24576), so SW3 sent VLAN 40 straight up Gi0/1 to SW1, ignoring the design where instance 2 (root SW2) carries VLANs 30 and 40.</p>
<p><b>Verify.</b> No boundaries left, VLAN 40 in MST0002 with root SW2, and the data path through SW2:</p>
<pre class="out">SW1# show spanning-tree mst interface GigabitEthernet0/1
GigabitEthernet0/1 of MST0 is designated forwarding
Edge port: no             (default)        port guard : none        (default)
Link type: point-to-point (auto)           bpdu filter: disable     (default)
<span class="hl">Boundary : internal</span>                        bpdu guard : disable     (default)

SW3# show spanning-tree vlan 40

<span class="hl">MST0002</span>
  Spanning tree enabled protocol mstp
  Root ID    Priority    24578
             Address     5254.0002.0000
             Cost        20000
             Port        2 (GigabitEthernet0/2)</pre>
<p>Ping PC40 to SRV40; on SW1, PC40's MAC is now learned on Gi0/1 (from SW2), not on Gi0/2 (from SW3).</p>

<div class="eg"><p><b>Worked example: symptom to first command.</b> "VLAN 20 dead on one access switch only": <code>show interfaces trunk</code> on that switch (allowed, active, forwarding). "Uplink at 50 percent capacity": <code>show etherchannel summary</code> (a suspended member). "Links show Bound": <code>show spanning-tree mst configuration digest</code> on both ends. "Port keeps going err-disabled": <code>show interfaces status err-disabled</code> and the reason column (bpduguard, channel-misconfig, udld). "Short outages every few minutes": <code>show spanning-tree detail | include executing|occur|from</code> to chase TCs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the first difference you find and closing the ticket. In Lab 3 there are two independent mistakes. Re-check every switch's digest after each fix until all are identical and no port shows Bound.</p></div>

<div class="exam"><p><b>Exam trap.</b> Show-output questions often hide the fault in one field: a revision number, a case difference in the name, one missing VLAN in the mapping, an (s) flag, or an "allowed and active" list missing one VLAN. Read every line of the output before choosing.</p></div>

<div class="scn"><h4>Two faults, one symptom</h4><p>A manufacturing plant reported that the SCADA VLAN took a congested uplink. The engineer found SW-A with revision 3 while the rest had 2, fixed it, and saw the SCADA path still wrong. Continuing the workflow, the digest on SW-B still differed: during the same change someone had mapped VLAN 300 to instance 3 on SW-B only. After the second fix every digest matched, Bound flags vanished and the MAC table showed SCADA traffic on the intended uplink.</p><p><b>Lesson:</b> keep checking until the evidence (digest, Bound, CAM) matches the design everywhere.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot 'users in VLAN 30 cannot reach the server' on a switched campus."</p><p>Strong answer: confirm scope with ping and the ticket; check the host port and uplinks are up and bundles healthy; check trunks carry VLAN 30 in all three sections of show interfaces trunk and native VLANs match; check VLAN 30 exists; find its STP instance and confirm the root, roles and any Bound or inconsistent ports; follow the server and client MACs through the CAM to prove the path; fix and re-verify. Emphasise bottom-up order and proving the path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order: symptom, link/bundle, trunk/VLAN, STP/MST, CAM path, fix and prove.</li>
<li>For MST, compare name, revision and mapping (digest) before looking at roles.</li>
<li>Lab 3: SW3 revision 2 and SW2 missing VLAN 40 in instance 2; fix both, never SW1.</li>
<li>In a split region every VLAN follows the CIST, which explains "wrong uplink" symptoms.</li>
<li>Prove the fix with Boundary : internal, the right instance root and MACs on the expected ports.</li>
</ul></div>
`,hi:`
<p>Ek achhi doctor moch aaye takhne ke liye brain scan nahi likhti. Woh poochti hai kahan dard hai, pehle simple cheezein check karti hai aur tabhi upar jaati hai jab simple cheezein theek hon. Layer 2 troubleshooting bhi aise hi kaam karti hai: ek fixed order, har layer ke liye ek do commands, aur har step par ek saaf sawaal.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layer 2 troubleshooting order">
<rect x="10" y="50" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="80" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text>
<rect x="115" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="160" y="80" text-anchor="middle" class="svg-ink" font-size="12">2 Link/bundle</text>
<rect x="220" y="50" width="90" height="50" rx="8" fill="#bae6fd"/><text x="265" y="80" text-anchor="middle" class="svg-ink" font-size="12">3 Trunk/VLAN</text>
<rect x="325" y="50" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="370" y="80" text-anchor="middle" class="svg-ink" font-size="12">4 STP/MST</text>
<rect x="430" y="50" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="80" text-anchor="middle" class="svg-ink" font-size="12">5 CAM path</text>
<rect x="535" y="50" width="95" height="50" rx="8" fill="#fde68a"/><text x="582" y="80" text-anchor="middle" class="svg-ink" font-size="12">6 Fix, prove</text>
<line x1="100" y1="75" x2="115" y2="75" stroke="#64748b" stroke-width="2"/><line x1="205" y1="75" x2="220" y2="75" stroke="#64748b" stroke-width="2"/><line x1="310" y1="75" x2="325" y2="75" stroke="#64748b" stroke-width="2"/><line x1="415" y1="75" x2="430" y2="75" stroke="#64748b" stroke-width="2"/><line x1="520" y1="75" x2="535" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">neeche se upar: current layer healthy prove hone par hi aage badho</text>
</svg><p class="cap">Chhe steps, hamesha isi order mein.</p></div>
<table class="cmp"><tr><th>Step</th><th>Sawaal</th><th>Commands</th></tr>
<tr><td>1 Symptom</td><td>Connectivity nahi, ya galat/slow path? Kaunse VLANs, kaunse hosts?</td><td>ping, ticket, interface counters</td></tr>
<tr><td>2 Link aur bundle</td><td>Ports up, bundled, err-disabled nahi?</td><td><code>show interfaces status</code>, <code>show etherchannel summary</code>, <code>show interfaces status err-disabled</code></td></tr>
<tr><td>3 Trunk aur VLAN</td><td>Trunking? Native match? VLAN allowed, existing, forwarding?</td><td><code>show interfaces trunk</code>, <code>show interfaces switchport</code>, <code>show vlan brief</code></td></tr>
<tr><td>4 STP / MST</td><td>Kaunsa instance? Sahi root? Koi Bound, inconsistent ya blocked port?</td><td><code>show spanning-tree vlan X</code>, <code>show spanning-tree mst configuration digest</code>, <code>show spanning-tree inconsistentports</code></td></tr>
<tr><td>5 CAM path</td><td>Hosts ke MACs asal mein kahan dikhte hain?</td><td>switch dar switch <code>show mac address-table address M</code></td></tr>
<tr><td>6 Fix aur prove</td><td>Kya path design ke hisaab se badla?</td><td>steps 3-5 dohrao, ping</td></tr></table>

<h3>Lab 1 checklist form mein</h3>
<p>Build: teeno switches par same <code>spanning-tree mst configuration</code>, <code>show pending</code>, <code>exit</code>. Roots: SW1 par <code>mst 0-1 root primary</code>, SW2 par <code>mst 2 root primary</code>, secondaries ulte. Prove: SW3 par <code>show spanning-tree mst 1</code> aur <code>mst 2</code> (Gi0/1 MST1 mein FWD, MST2 mein BLK aur Gi0/2 ke liye ulta), PC10 se SRV10 aur PC30 se SRV30 ping, phir MACs follow karo: SW1 par PC30 ka MAC Gi0/1 par (SW2 se) dikhta hai, jo prove karta hai ki VLAN 30 SW2 se hokar gaya. Aakhir mein SW1 aur SW3 par digest compare karo.</p>

<h3>Lab 2 checklist form mein</h3>
<p>Pehle step 2: <code>show etherchannel summary</code> Po1(SU) dono members (P) ke saath dikhata hai, yaani bundle healthy hai aur problem distribution ki hai, failure ki nahi. SW2 par <code>show etherchannel load-balance</code> "src-mac" batata hai. Dono switches ko <code>port-channel load-balance src-dst-ip</code> par badlo, phir <code>test etherchannel load-balance interface port-channel 1 ip 10.10.10.100 10.10.10.11</code> (Gi0/2) aur .12 ke saath wahi (Gi0/1). Dono PCs se ping karo.</p>

<h3>Lab 3 walk-through: Teen switches, teen regions</h3>
<p><b>Symptom.</b> VLAN 40 ka traffic galat uplink le raha hai aur har inter-switch port Bound dikhata hai. Kuch down nahi hai: yeh wrong-path ticket hai, isliye steps 2-3 (saare trunks up, VLAN 40 allowed aur active) jaldi se nikal kar step 4 par jao.</p>
<p><b>Step 4, pehle identity.</b> SW1 aur SW3 par region compare karo:</p>
<pre class="out">SW1# show spanning-tree mst configuration
Name      [NK-CAMPUS]
Revision  1     Instances configured 3

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
0         1-9,11-19,21-29,31-39,41-4094
1         10,20
2         30,40
-------------------------------------------------------------------------------

SW3# show spanning-tree mst configuration
Name      [NK-CAMPUS]
<span class="hl">Revision  2     Instances configured 3</span>
...</pre>
<p>Same name, same mapping, <b>revision 2</b>. Ek number SW3 ko alag region bana deta hai. SW1 ko chhoona mana hai, isliye SW3 fix karo:</p>
<pre class="code">SW3(config)# spanning-tree mst configuration
SW3(config-mst)# revision 1
SW3(config-mst)# show pending
SW3(config-mst)# exit</pre>
<p><b>Ab SW2.</b> Iska name aur revision sahi lagte hain, to table compare karo:</p>
<pre class="out">SW2# show spanning-tree mst configuration
Name      [NK-CAMPUS]
Revision  1     Instances configured 3

Instance  Vlans mapped
--------  ---------------------------------------------------------------------
<span class="hl">0         1-9,11-19,21-29,31-4094</span>
1         10,20
<span class="hl">2         30</span></pre>
<p>VLAN 40 kabhi map hi nahi hua, isliye woh instance 0 mein baitha hai aur digest alag hai. Kyunki <code>instance</code> existing list mein jodta hai:</p>
<pre class="code">SW2(config)# spanning-tree mst configuration
SW2(config-mst)# instance 2 vlan 40
SW2(config-mst)# show pending
SW2(config-mst)# exit</pre>
<p><b>VLAN 40 ne galat path kyun liya.</b> Teen regions ke saath MSTIs koi link cross nahi kar sakte the, isliye har VLAN CIST follow kar raha tha. CIST root SW1 hai (MST0 priority 24576), isliye SW3 ne VLAN 40 ko seedha Gi0/1 se SW1 bhej diya, us design ko ignore karke jahan instance 2 (root SW2) VLANs 30 aur 40 le jaata hai.</p>
<p><b>Verify.</b> Koi boundary nahi bachi, VLAN 40 MST0002 mein root SW2 ke saath, aur data path SW2 se:</p>
<pre class="out">SW1# show spanning-tree mst interface GigabitEthernet0/1
GigabitEthernet0/1 of MST0 is designated forwarding
Edge port: no             (default)        port guard : none        (default)
Link type: point-to-point (auto)           bpdu filter: disable     (default)
<span class="hl">Boundary : internal</span>                        bpdu guard : disable     (default)

SW3# show spanning-tree vlan 40

<span class="hl">MST0002</span>
  Spanning tree enabled protocol mstp
  Root ID    Priority    24578
             Address     5254.0002.0000
             Cost        20000
             Port        2 (GigabitEthernet0/2)</pre>
<p>PC40 se SRV40 ping karo; SW1 par PC40 ka MAC ab Gi0/1 par (SW2 se) seekha gaya hai, Gi0/2 par (SW3 se) nahi.</p>

<div class="eg"><p><b>Worked example: symptom se pehli command.</b> "VLAN 20 sirf ek access switch par dead": us switch par <code>show interfaces trunk</code> (allowed, active, forwarding). "Uplink 50 percent capacity par": <code>show etherchannel summary</code> (suspended member). "Links Bound dikhate hain": dono ends par <code>show spanning-tree mst configuration digest</code>. "Port baar baar err-disabled": <code>show interfaces status err-disabled</code> aur reason column (bpduguard, channel-misconfig, udld). "Har kuch minute chhote outages": TCs ka peecha karne ke liye <code>show spanning-tree detail | include executing|occur|from</code>.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehla fark milte hi fix karke ticket band kar dena. Lab 3 mein do alag galtiyan hain. Har fix ke baad har switch ka digest dobara check karo jab tak sab same na hon aur koi port Bound na dikhe.</p></div>

<div class="exam"><p><b>Exam trap.</b> Show-output questions aksar fault ek field mein chhupate hain: revision number, name mein case ka fark, mapping mein ek missing VLAN, (s) flag, ya "allowed and active" list se ek VLAN gayab. Answer chunne se pehle output ki har line padho.</p></div>

<div class="scn"><h4>Do faults, ek symptom</h4><p>Ek manufacturing plant ne report kiya ki SCADA VLAN congested uplink le raha tha. Engineer ko SW-A revision 3 par mila jabki baaki 2 par the, usne fix kiya, aur dekha ki SCADA path abhi bhi galat tha. Workflow jaari rakhne par SW-B ka digest abhi bhi alag tha: usi change mein kisi ne sirf SW-B par VLAN 300 ko instance 3 mein map kiya tha. Doosre fix ke baad har digest match hua, Bound flags gayab hue aur MAC table ne SCADA traffic intended uplink par dikhaya.</p><p><b>Seekh:</b> tab tak check karte raho jab tak saboot (digest, Bound, CAM) har jagah design se match na kare.</p></div>

<div class="iv"><p class="q">"Switched campus par 'VLAN 30 ke users server tak nahi pahunch pa rahe' kaise troubleshoot karoge, step by step batao."</p><p>Strong answer: ping aur ticket se scope confirm karo; host port aur uplinks up aur bundles healthy check karo; check karo ki trunks show interfaces trunk ke teeno sections mein VLAN 30 le jaate hain aur native VLANs match karte hain; VLAN 30 exist karta hai check karo; uska STP instance dhoondo aur root, roles aur koi Bound ya inconsistent ports confirm karo; path prove karne ke liye server aur client MACs ko CAM mein follow karo; fix karke dobara verify karo. Neeche se upar order aur path prove karne par zor do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fixed order: symptom, link/bundle, trunk/VLAN, STP/MST, CAM path, fix aur prove.</li>
<li>MST ke liye roles dekhne se pehle name, revision aur mapping (digest) compare karo.</li>
<li>Lab 3: SW3 revision 2 aur SW2 ke instance 2 mein VLAN 40 missing; dono fix karo, SW1 kabhi nahi.</li>
<li>Toote hue (split) region mein har VLAN CIST follow karta hai, isse "galat uplink" symptoms samajh aate hain.</li>
<li>Fix ko Boundary : internal, sahi instance root aur expected ports par MACs se prove karo.</li>
</ul></div>
`}};export{e as default};