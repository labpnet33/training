var e={id:`troubleshooting`,h:{en:`Troubleshooting VXLAN: the five classic faults`,hi:`VXLAN troubleshooting: paanch classic faults`},body:{en:`
<p>A good mechanic listens to the symptom first. "The car will not start at all" points to the battery; "it starts but dies on the highway" points to fuel or cooling. VXLAN faults also have signatures. "Nothing works" is usually the underlay or a mismatch; "small packets work, big ones do not" is almost always MTU; "it works in one direction" is almost always a one-sided peer list. This chapter gives you the signature, the proof and the fix for each classic fault, then walks through the module's ticket lab.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="VXLAN troubleshooting flow">
<rect x="210" y="10" width="220" height="34" rx="6" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Hosts in one VNI cannot talk</text>
<rect x="210" y="62" width="220" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Loopback1 to loopback1 ping?</text>
<text x="450" y="84" class="svg-accent" font-size="12">fails: underlay</text>
<rect x="210" y="114" width="220" height="34" rx="6" fill="#bae6fd"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">nve1 Up, right source?</text>
<text x="450" y="136" class="svg-accent" font-size="12">no: nve / source-interface</text>
<rect x="210" y="166" width="220" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">Same VNI both sides?</text>
<text x="450" y="188" class="svg-accent" font-size="12">no: VNI mismatch</text>
<rect x="210" y="218" width="220" height="34" rx="6" fill="#fde68a"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Peer lists symmetric?</text>
<text x="450" y="240" class="svg-accent" font-size="12">no: missing/wrong peer</text>
<text x="20" y="240" class="svg-muted" font-size="12">then: large DF ping (MTU)</text>
<line x1="320" y1="44" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="96" x2="320" y2="114" stroke="#64748b" stroke-width="2"/><line x1="320" y1="148" x2="320" y2="166" stroke="#64748b" stroke-width="2"/><line x1="320" y1="200" x2="320" y2="218" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Follow the same order every time; each question rules out a whole class of faults.</p></div>

<h3>Fault 1: the remote loopback is not reachable</h3>
<p><b>Signature:</b> nothing works in either direction; <code>show nve peers</code> is empty or shows the peer Down. <b>Proof:</b></p>
<pre class="out">LEAF1# show ip route 10.254.0.2
<span class="hl">Route not found</span>
LEAF2# show running-config interface loopback1
interface loopback1
  ip address 10.254.0.2/32</pre>
<p>LEAF2's loopback1 has an address but no <code>ip router ospf UNDERLAY area 0.0.0.0</code>, so it is never advertised. <b>Fix:</b> add the OSPF line under loopback1 on LEAF2. Other causes of the same signature: a route filter on a spine, a wrong mask, or an OSPF adjacency down.</p>

<h3>Fault 2: VNI mismatch</h3>
<p><b>Signature:</b> both nve1 interfaces are Up, both VNIs are Up, but no remote MACs are learned and hosts cannot ARP each other. <b>Proof:</b> compare <code>show nve vni</code> on both leaves. LEAF1 shows 10010, LEAF2 shows 10020 for the same bridge domain [10]. Packets arrive at LEAF2 carrying VNI 10010, which LEAF2 does not host, so they are dropped. <b>Fix:</b> make the VNI identical: <code>vlan 10</code> / <code>vn-segment 10010</code>, and under nve1 <code>no member vni 10020</code>, <code>member vni 10010</code> with its replication settings.</p>

<h3>Fault 3: MTU too small</h3>
<p><b>Signature:</b> ping works, ARP works, SSH logins work, but file copies, web pages with images or database queries hang. <b>Proof:</b></p>
<pre class="out">LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 1400 df-bit count 2
2 packets transmitted, 2 packets received, 0.00% packet loss
LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 1600 df-bit count 2
<span class="hl">2 packets transmitted, 0 packets received, 100.00% packet loss</span>
SPINE2# show interface ethernet1/1 | include MTU
<span class="hl">  MTU 1500 bytes, BW 100000000 Kbit, DLY 10 usec</span></pre>
<p>A 1500-byte server packet becomes a 1550-byte outer packet, which does not fit a 1500 MTU link, and VTEPs do not fragment. <b>Fix:</b> set <code>mtu 9216</code> on both ends of every fabric link (here SPINE2 Eth1/1 was replaced and reset to default).</p>

<h3>Fault 4: wrong or broken source-interface</h3>
<p><b>Signature A:</b> <code>show nve interface nve1 detail</code> shows <code>primary: 0.0.0.0</code> or the source interface Down: the loopback has no address or was deleted. <b>Signature B:</b> the source is loopback0 instead of loopback1, so the outer source IP is 10.255.0.1. The remote leaf learns MACs behind an unexpected peer, and its floods (sent to 10.254.0.1, which LEAF1 no longer uses as its VTEP address) are not decapsulated:</p>
<pre class="out">LEAF2# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.255.0.1       Up    DP        00:01:10 n/a</span></pre>
<p><b>Fix:</b> <code>interface nve1</code> / <code>source-interface loopback1</code> (NX-OS requires <code>shutdown</code> on nve1 before changing the source, then <code>no shutdown</code>).</p>

<h3>Fault 5: missing or wrong peer</h3>
<p><b>Signature:</b> works in one direction only, or works only after the far side starts the conversation. <b>Proof:</b></p>
<pre class="out">LEAF2# show nve vni ingress-replication
Interface VNI      Replication List  Source  Up Time
--------- -------- ----------------- ------- -------
<span class="hl">nve1      10010    10.254.0.9        CLI     00:20:33</span></pre>
<p>LEAF2 replicates BUM to 10.254.0.9, a VTEP that does not exist. <b>Fix:</b> under <code>member vni 10010</code>, <code>ingress-replication protocol static</code>, remove the bad peer with <code>no peer-ip 10.254.0.9</code> and add <code>peer-ip 10.254.0.1</code>.</p>

<div class="eg"><p><b>Worked example: the module ticket INC-6702.</b> "SRV1 and SRV2 stopped talking after LEAF2 was re-provisioned from a template." LEAF1 is correct. Step 1, <code>show nve vni</code> on LEAF2: VNI <b>10020</b> for VLAN 10 (LEAF1 uses 10010), so fault 2. Step 2, the template also carried a wrong peer, 10.254.0.9, so fault 5. Fix on LEAF2: <code>vlan 10</code>, <code>vn-segment 10010</code>; <code>interface nve1</code>, <code>no member vni 10020</code>, <code>member vni 10010</code>, <code>ingress-replication protocol static</code>, <code>peer-ip 10.254.0.1</code>. Verify: SRV2 pings 172.16.10.11, both leaves list each other in <code>show nve peers</code>, then <code>copy running-config startup-config</code> on LEAF2. Two faults, both visible in two show commands.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the first fault you find and closing the ticket. Template-driven errors usually come in groups: a wrong VNI and a wrong peer, or a wrong MTU on several links. After every fix, run the whole ladder again until the host test passes in both directions.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Small pings succeed, large transfers fail across VXLAN" → MTU. "Both VNIs Up but no remote MACs" → VNI mismatch or missing peer. "Peer shows an unexpected IP" → wrong source-interface on the remote leaf. Match the signature before you read the answers.</p></div>

<div class="scn"><h4>The storage backup that only failed at night</h4><p>Daytime traffic between two racks worked perfectly. Every night the backup job between a server on LEAF4 and a backup appliance on LEAF11 failed after a few seconds. The engineer compared <code>show interface nve1</code> counters: LEAF4's out counter grew during the backup, LEAF11's in counter barely moved. A DF ping between the loopbacks with packet-size 1600 failed only via one spine. That spine had been replaced a week earlier, and its new line card ports were at the default MTU. Daytime traffic was mostly small API calls; the backup used full-size frames and was hashed onto the bad spine. Setting mtu 9216 on the replacement ports fixed it.</p><p><b>Lesson:</b> MTU faults can hide on one ECMP path. Test large DF pings and check every fabric link, not just one.</p></div>

<div class="iv"><p class="q">"Users say VXLAN works for ping but file transfers hang. How do you troubleshoot?"</p><p>Strong answer: that signature points to MTU. VXLAN adds 50 bytes and VTEPs do not fragment, so a 1500-byte server packet needs a 1550-byte underlay path. I would ping between the VTEP loopbacks with df-bit and increasing packet sizes, check the MTU on every leaf and spine fabric interface (remembering ECMP may hide one bad path), and set mtu 9216 on both ends. Then retest with a large DF ping between the servers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unreachable loopback: nothing works; check show ip route and loopback1 in OSPF.</li>
<li>VNI mismatch: all Up, no remote MACs; compare show nve vni on both leaves.</li>
<li>MTU: small works, large fails; large DF ping between loopbacks, set mtu 9216.</li>
<li>Wrong source-interface: primary 0.0.0.0 or unexpected peer IP on the far side.</li>
<li>Missing or wrong peer: one-way failures; check show nve vni ingress-replication.</li>
</ul></div>
`,hi:`
<p>Achha mechanic pehle symptom sunta hai. "Gaadi bilkul start nahi hoti" battery ki taraf ishara karta hai; "start hoti hai lekin highway par band ho jaati hai" fuel ya cooling ki taraf. VXLAN faults ke bhi signatures hote hain. "Kuch kaam nahi karta" aam taur par underlay ya mismatch hai; "chhote packets chalte hain, bade nahi" lagbhag hamesha MTU hai; "ek direction mein chalta hai" lagbhag hamesha ek-taraf peer list hai. Yeh chapter har classic fault ka signature, saboot aur fix deta hai, phir module ka ticket lab walk karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="VXLAN troubleshooting flow">
<rect x="210" y="10" width="220" height="34" rx="6" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">Ek VNI ke hosts baat nahi karte</text>
<rect x="210" y="62" width="220" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="12">Loopback1 se loopback1 ping?</text>
<text x="450" y="84" class="svg-accent" font-size="12">fail: underlay</text>
<rect x="210" y="114" width="220" height="34" rx="6" fill="#bae6fd"/><text x="320" y="136" text-anchor="middle" class="svg-ink" font-size="12">nve1 Up, sahi source?</text>
<text x="450" y="136" class="svg-accent" font-size="12">nahi: nve / source-interface</text>
<rect x="210" y="166" width="220" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="188" text-anchor="middle" class="svg-ink" font-size="12">Dono taraf same VNI?</text>
<text x="450" y="188" class="svg-accent" font-size="12">nahi: VNI mismatch</text>
<rect x="210" y="218" width="220" height="34" rx="6" fill="#fde68a"/><text x="320" y="240" text-anchor="middle" class="svg-ink" font-size="12">Peer lists symmetric?</text>
<text x="450" y="240" class="svg-accent" font-size="12">nahi: missing/galat peer</text>
<text x="20" y="240" class="svg-muted" font-size="12">phir: bada DF ping (MTU)</text>
<line x1="320" y1="44" x2="320" y2="62" stroke="#64748b" stroke-width="2"/><line x1="320" y1="96" x2="320" y2="114" stroke="#64748b" stroke-width="2"/><line x1="320" y1="148" x2="320" y2="166" stroke="#64748b" stroke-width="2"/><line x1="320" y1="200" x2="320" y2="218" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har baar same order follow karo; har sawaal faults ki ek poori class ko rule out karta hai.</p></div>

<h3>Fault 1: remote loopback reachable nahi hai</h3>
<p><b>Signature:</b> kisi bhi direction mein kuch kaam nahi karta; <code>show nve peers</code> khaali hai ya peer Down dikhata hai. <b>Saboot:</b></p>
<pre class="out">LEAF1# show ip route 10.254.0.2
<span class="hl">Route not found</span>
LEAF2# show running-config interface loopback1
interface loopback1
  ip address 10.254.0.2/32</pre>
<p>LEAF2 ke loopback1 par address hai lekin <code>ip router ospf UNDERLAY area 0.0.0.0</code> nahi, isliye woh kabhi advertise nahi hota. <b>Fix:</b> LEAF2 par loopback1 ke neeche OSPF line jodo. Isi signature ke doosre causes: spine par route filter, galat mask, ya OSPF adjacency down.</p>

<h3>Fault 2: VNI mismatch</h3>
<p><b>Signature:</b> dono nve1 interfaces Up, dono VNIs Up, lekin koi remote MAC learn nahi hota aur hosts ek doosre ko ARP nahi kar paate. <b>Saboot:</b> dono leaves par <code>show nve vni</code> compare karo. Same bridge domain [10] ke liye LEAF1 10010 dikhata hai, LEAF2 10020. LEAF2 par VNI 10010 wale packets aate hain, jo LEAF2 host nahi karta, isliye drop ho jaate hain. <b>Fix:</b> VNI identical banao: <code>vlan 10</code> / <code>vn-segment 10010</code>, aur nve1 ke neeche <code>no member vni 10020</code>, apni replication settings ke saath <code>member vni 10010</code>.</p>

<h3>Fault 3: MTU bahut chhota</h3>
<p><b>Signature:</b> ping chalti hai, ARP chalta hai, SSH logins chalte hain, lekin file copies, images wale web pages ya database queries hang ho jaati hain. <b>Saboot:</b></p>
<pre class="out">LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 1400 df-bit count 2
2 packets transmitted, 2 packets received, 0.00% packet loss
LEAF1# ping 10.254.0.2 source 10.254.0.1 packet-size 1600 df-bit count 2
<span class="hl">2 packets transmitted, 0 packets received, 100.00% packet loss</span>
SPINE2# show interface ethernet1/1 | include MTU
<span class="hl">  MTU 1500 bytes, BW 100000000 Kbit, DLY 10 usec</span></pre>
<p>1500-byte server packet 1550-byte outer packet ban jaata hai, jo 1500 MTU link mein fit nahi hota, aur VTEPs fragment nahi karte. <b>Fix:</b> har fabric link ke dono ends par <code>mtu 9216</code> set karo (yahan SPINE2 Eth1/1 replace hua tha aur default par reset ho gaya tha).</p>

<h3>Fault 4: galat ya toota source-interface</h3>
<p><b>Signature A:</b> <code>show nve interface nve1 detail</code> <code>primary: 0.0.0.0</code> ya source interface Down dikhata hai: loopback par address nahi hai ya woh delete ho gaya. <b>Signature B:</b> source loopback1 ki jagah loopback0 hai, isliye outer source IP 10.255.0.1 hai. Remote leaf MACs ko ek unexpected peer ke peeche learn karta hai, aur uske floods (10.254.0.1 ko bheje gaye, jise LEAF1 ab VTEP address ki tarah use nahi karta) decapsulate nahi hote:</p>
<pre class="out">LEAF2# show nve peers
Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.255.0.1       Up    DP        00:01:10 n/a</span></pre>
<p><b>Fix:</b> <code>interface nve1</code> / <code>source-interface loopback1</code> (NX-OS source badalne se pehle nve1 par <code>shutdown</code> maangta hai, phir <code>no shutdown</code>).</p>

<h3>Fault 5: missing ya galat peer</h3>
<p><b>Signature:</b> sirf ek direction mein chalta hai, ya tabhi chalta hai jab door wali side baatcheet shuru kare. <b>Saboot:</b></p>
<pre class="out">LEAF2# show nve vni ingress-replication
Interface VNI      Replication List  Source  Up Time
--------- -------- ----------------- ------- -------
<span class="hl">nve1      10010    10.254.0.9        CLI     00:20:33</span></pre>
<p>LEAF2 BUM ko 10.254.0.9 par replicate karta hai, ek aisa VTEP jo exist hi nahi karta. <b>Fix:</b> <code>member vni 10010</code>, <code>ingress-replication protocol static</code> ke neeche <code>no peer-ip 10.254.0.9</code> se galat peer hatao aur <code>peer-ip 10.254.0.1</code> jodo.</p>

<div class="eg"><p><b>Worked example: module ticket INC-6702.</b> "LEAF2 ko template se dobara provision karne ke baad SRV1 aur SRV2 ki baat band ho gayi." LEAF1 sahi hai. Step 1, LEAF2 par <code>show nve vni</code>: VLAN 10 ke liye VNI <b>10020</b> (LEAF1 10010 use karta hai), yaani fault 2. Step 2, template mein galat peer 10.254.0.9 bhi tha, yaani fault 5. LEAF2 par fix: <code>vlan 10</code>, <code>vn-segment 10010</code>; <code>interface nve1</code>, <code>no member vni 10020</code>, <code>member vni 10010</code>, <code>ingress-replication protocol static</code>, <code>peer-ip 10.254.0.1</code>. Verify: SRV2, 172.16.10.11 ko ping kare, dono leaves <code>show nve peers</code> mein ek doosre ko list karein, phir LEAF2 par <code>copy running-config startup-config</code>. Do faults, dono do show commands mein dikhte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehla fault milte hi use theek karke ticket close kar dena. Template se aane wali galtiyan aksar groups mein aati hain: galat VNI aur galat peer, ya kai links par galat MTU. Har fix ke baad poori ladder dobara chalao jab tak host test dono directions mein pass na ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "VXLAN ke paar chhote pings succeed, bade transfers fail" → MTU. "Dono VNIs Up lekin remote MACs nahi" → VNI mismatch ya missing peer. "Peer unexpected IP dikhata hai" → remote leaf par galat source-interface. Answers padhne se pehle signature match karo.</p></div>

<div class="scn"><h4>Storage backup jo sirf raat ko fail hota tha</h4><p>Do racks ke beech din ka traffic perfectly chalta tha. Har raat LEAF4 ke server aur LEAF11 ke backup appliance ke beech backup job kuch seconds baad fail ho jaata tha. Engineer ne <code>show interface nve1</code> counters compare kiye: backup ke dauraan LEAF4 ka out counter badha, LEAF11 ka in counter mushkil se hila. Loopbacks ke beech packet-size 1600 wala DF ping sirf ek spine ke raaste fail hua. Woh spine ek hafte pehle replace hua tha, aur uske naye line card ports default MTU par the. Din ka traffic zyada tar chhote API calls the; backup full-size frames use karta tha aur kharab spine par hash hota tha. Replacement ports par mtu 9216 set karne se theek ho gaya.</p><p><b>Seekh:</b> MTU faults ek ECMP path par chhup sakte hain. Bade DF pings test karo aur har fabric link check karo, sirf ek nahi.</p></div>

<div class="iv"><p class="q">"Users kehte hain VXLAN ping ke liye chalta hai lekin file transfers hang ho jaate hain. Kaise troubleshoot karoge?"</p><p>Strong answer: yeh signature MTU ki taraf ishara karta hai. VXLAN 50 bytes jodta hai aur VTEPs fragment nahi karte, isliye 1500-byte server packet ko 1550-byte underlay path chahiye. Main VTEP loopbacks ke beech df-bit aur badhte packet sizes ke saath ping karunga, har leaf aur spine fabric interface ka MTU check karunga (yaad rakhte hue ki ECMP ek kharab path chhupa sakta hai), aur dono ends par mtu 9216 set karunga. Phir servers ke beech bade DF ping se retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Unreachable loopback: kuch nahi chalta; show ip route aur OSPF mein loopback1 check karo.</li>
<li>VNI mismatch: sab Up, remote MACs nahi; dono leaves par show nve vni compare karo.</li>
<li>MTU: chhota chalta hai, bada fail; loopbacks ke beech bada DF ping, mtu 9216 set karo.</li>
<li>Galat source-interface: primary 0.0.0.0 ya door wali side par unexpected peer IP.</li>
<li>Missing ya galat peer: one-way failures; show nve vni ingress-replication check karo.</li>
</ul></div>
`}};export{e as default};