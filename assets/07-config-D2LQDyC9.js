var e={id:`config`,h:{en:`Configuring VXLAN flood-and-learn on NX-OS, step by step`,hi:`NX-OS par VXLAN flood-and-learn configure karna, step by step`},body:{en:`
<p>A good electrician never starts wiring a new room before checking that the main supply reaches the distribution board. VXLAN configuration follows the same habit: first prove the underlay delivers packets between the VTEP loopbacks, then build the overlay in a fixed order. In this chapter you will configure exactly what the lab asks for, on both leaves, and understand every line.</p>

<h3>The lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="170" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="350" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="60" y="110" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="160" y="150" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1  lo1 10.254.0.1</text>
<rect x="380" y="110" width="200" height="50" rx="8" fill="#bae6fd"/><text x="480" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="480" y="150" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.2  lo1 10.254.0.2</text>
<line x1="130" y1="110" x2="230" y2="51" stroke="#64748b" stroke-width="2"/><line x1="190" y1="110" x2="410" y2="51" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="110" x2="230" y2="51" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="410" y2="51" stroke="#64748b" stroke-width="2"/>
<text x="95" y="90" class="svg-muted" font-size="12">Eth1/1</text><text x="200" y="90" class="svg-muted" font-size="12">Eth1/2</text>
<rect x="80" y="200" width="160" height="36" rx="6" fill="#fed7aa"/><text x="160" y="223" text-anchor="middle" class="svg-ink" font-size="12">SRV1 172.16.10.11</text>
<rect x="400" y="200" width="160" height="36" rx="6" fill="#fed7aa"/><text x="480" y="223" text-anchor="middle" class="svg-ink" font-size="12">SRV2 172.16.10.12</text>
<line x1="160" y1="160" x2="160" y2="200" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="170" y="185" class="svg-muted" font-size="12">Eth1/5 VLAN 10</text><text x="490" y="185" class="svg-muted" font-size="12">Eth1/5 VLAN 10</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">VNI 10010</text>
</svg><p class="cap">Two leaves, two spines, one VLAN stretched as VNI 10010 between LEAF1 and LEAF2.</p></div>

<h3>Step 0: prove the underlay</h3>
<pre class="code">LEAF1# show ip route 10.254.0.2
LEAF1# ping 10.254.0.2 source 10.254.0.1</pre>
<pre class="out">10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 00:41:07, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:41:07, ospf-UNDERLAY, intra</span></pre>
<p>Two equal-cost paths to the remote VTEP loopback, one through each spine: the underlay is ready. If this route is missing, stop here and fix OSPF; no VXLAN command will help.</p>

<h3>Step 1: enable the features</h3>
<pre class="code"><span class="c">! On LEAF1 and LEAF2</span>
configure terminal
feature nv overlay
feature vn-segment-vlan-based</pre>
<p><code>feature nv overlay</code> unlocks <code>interface nve1</code>. <code>feature vn-segment-vlan-based</code> unlocks the <code>vn-segment</code> command under a VLAN. Without them the later commands are rejected.</p>

<h3>Step 2: map the VLAN to the VNI</h3>
<pre class="code">vlan 10
  name WEB
  vn-segment 10010</pre>
<p>VLAN 10 already exists with Eth1/5 as an access port for the server. Adding <code>vn-segment 10010</code> ties it to VNI 10010. Use the <b>same VNI on both leaves</b>.</p>

<h3>Step 3: build the NVE interface</h3>
<pre class="code"><span class="c">! LEAF1</span>
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.2

<span class="c">! LEAF2 (mirror image)</span>
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.1</pre>
<p>Line by line: <code>no shutdown</code> enables the interface; <code>source-interface loopback1</code> makes 10.254.0.x the VTEP address; <code>member vni 10010</code> puts VNI 10010 on this VTEP; <code>ingress-replication protocol static</code> chooses head-end replication with a hand-typed list; <code>peer-ip</code> adds the other leaf's VTEP address (not its loopback0, and not an uplink address). Notice the prompts change as you go deeper: <code>(config-if-nve)</code>, then <code>(config-if-nve-vni)</code>, then <code>(config-if-nve-vni-ingr-rep)</code>.</p>

<div class="note"><p><b>Multicast alternative.</b> If the fabric runs PIM, replace the two ingress-replication lines with <code>mcast-group 239.1.1.10</code> under <code>member vni 10010</code>, identical on both leaves. The lab uses static ingress replication, so keep that for the lab.</p></div>

<h3>Step 4: test and save</h3>
<pre class="code">SRV1&gt; ping 172.16.10.12
LEAF1# show nve peers
LEAF1# copy running-config startup-config</pre>
<pre class="out">Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    DP        00:00:14 n/a</span></pre>
<p>The peer is Up and learned through the <b>data plane</b> (DP). The lab's last task asks exactly this question: which peer address is Up on LEAF1? Answer: 10.254.0.2.</p>

<h3>The finished configuration</h3>
<pre class="out">LEAF1# show running-config interface nve1
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      <span class="hl">peer-ip 10.254.0.2</span></pre>

<div class="eg"><p><b>Worked example: adding a third leaf.</b> LEAF3 (loopback1 10.254.0.3) must join VNI 10010. On LEAF3: features, <code>vlan 10</code> / <code>vn-segment 10010</code>, nve1 with peer-ip 10.254.0.1 and 10.254.0.2. On LEAF1 and LEAF2: add <code>peer-ip 10.254.0.3</code> under member vni 10010. That is 2 + 2 = 4 new peer lines across the fabric for one VNI and one new leaf. With ten VNIs it would be 40 lines.</p></div>

<div class="warn"><p><b>Common mistakes in this lab.</b> (1) Typing the peer as LEAF2's loopback0 (10.255.0.2) instead of its VTEP address (10.254.0.2). (2) Using different VNIs on the two leaves. (3) Mapping the VLAN but forgetting <code>member vni</code>. (4) Forgetting <code>no shutdown</code> on nve1. (5) Configuring LEAF1 only; static replication must be configured on both ends.</p></div>

<div class="exam"><p><b>Exam trap.</b> Order of dependencies: feature → VLAN-to-VNI → nve1 source → member VNI → replication. A question that shows <code>vn-segment</code> rejected usually means <code>feature vn-segment-vlan-based</code> is missing; a missing <code>interface nve1</code> command means <code>feature nv overlay</code> is missing.</p></div>

<div class="scn"><h4>The change that worked in one direction</h4><p>During a night change, an engineer configured VXLAN on LEAF7 and verified that its server could ping a server on LEAF8. The change was closed. The next morning the application team reported that sessions initiated from LEAF8's side failed randomly. The engineer had pasted the config on LEAF7 only; LEAF8 had nve1 from an older change with a peer list that did not include LEAF7. Known unicast worked once MACs were learned, but LEAF8's ARP floods never reached LEAF7. Adding the peer on LEAF8 fixed it, and the team added "verify show nve peers on both ends" to the change template.</p><p><b>Lesson:</b> VXLAN with static replication is configured and verified on both ends, every time.</p></div>

<div class="iv"><p class="q">"Configure a flood-and-learn VXLAN segment between two Nexus leaves. What do you check first?"</p><p>Strong answer: first check the underlay: the remote VTEP loopback is in the routing table with ECMP and pings from my loopback with a large DF packet. Then feature nv overlay and feature vn-segment-vlan-based, vlan 10 / vn-segment 10010, interface nve1 with no shutdown, source-interface loopback1, member vni 10010 with ingress-replication protocol static and the peer's VTEP IP, mirrored on the other leaf. Verify with show nve peers, show nve vni and the MAC table, then save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prove loopback-to-loopback reachability before any VXLAN command.</li>
<li>Enable feature nv overlay and feature vn-segment-vlan-based first.</li>
<li>vlan 10 / vn-segment 10010 on both leaves; the VNI must match.</li>
<li>nve1: no shutdown, source-interface loopback1, member vni, ingress-replication protocol static, peer-ip = remote VTEP.</li>
<li>Configure and verify both ends, then copy running-config startup-config.</li>
</ul></div>
`,hi:`
<p>Achha electrician naye kamre ki wiring tab tak shuru nahi karta jab tak check na kar le ki main supply distribution board tak pahunch rahi hai. VXLAN configuration bhi isi aadat ko follow karta hai: pehle prove karo ki underlay VTEP loopbacks ke beech packets deliver karta hai, phir overlay ko ek fixed order mein banao. Is chapter mein aap exactly wahi configure karoge jo lab maangta hai, dono leaves par, aur har line samjhoge.</p>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab topology">
<rect x="170" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="230" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE1</text>
<rect x="350" y="15" width="120" height="36" rx="6" fill="#ddd6fe"/><text x="410" y="38" text-anchor="middle" class="svg-ink" font-size="13">SPINE2</text>
<rect x="60" y="110" width="200" height="50" rx="8" fill="#bae6fd"/><text x="160" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF1</text><text x="160" y="150" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.1  lo1 10.254.0.1</text>
<rect x="380" y="110" width="200" height="50" rx="8" fill="#bae6fd"/><text x="480" y="132" text-anchor="middle" class="svg-ink" font-size="13">LEAF2</text><text x="480" y="150" text-anchor="middle" class="svg-muted" font-size="12">lo0 10.255.0.2  lo1 10.254.0.2</text>
<line x1="130" y1="110" x2="230" y2="51" stroke="#64748b" stroke-width="2"/><line x1="190" y1="110" x2="410" y2="51" stroke="#64748b" stroke-width="2"/>
<line x1="450" y1="110" x2="230" y2="51" stroke="#64748b" stroke-width="2"/><line x1="510" y1="110" x2="410" y2="51" stroke="#64748b" stroke-width="2"/>
<text x="95" y="90" class="svg-muted" font-size="12">Eth1/1</text><text x="200" y="90" class="svg-muted" font-size="12">Eth1/2</text>
<rect x="80" y="200" width="160" height="36" rx="6" fill="#fed7aa"/><text x="160" y="223" text-anchor="middle" class="svg-ink" font-size="12">SRV1 172.16.10.11</text>
<rect x="400" y="200" width="160" height="36" rx="6" fill="#fed7aa"/><text x="480" y="223" text-anchor="middle" class="svg-ink" font-size="12">SRV2 172.16.10.12</text>
<line x1="160" y1="160" x2="160" y2="200" stroke="#64748b" stroke-width="2"/><line x1="480" y1="160" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
<text x="170" y="185" class="svg-muted" font-size="12">Eth1/5 VLAN 10</text><text x="490" y="185" class="svg-muted" font-size="12">Eth1/5 VLAN 10</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">VNI 10010</text>
</svg><p class="cap">Do leaves, do spines, ek VLAN jo LEAF1 aur LEAF2 ke beech VNI 10010 ban kar stretch hua.</p></div>

<h3>Step 0: underlay prove karo</h3>
<pre class="code">LEAF1# show ip route 10.254.0.2
LEAF1# ping 10.254.0.2 source 10.254.0.1</pre>
<pre class="out">10.254.0.2/32, ubest/mbest: 2/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/81], 00:41:07, ospf-UNDERLAY, intra
    *via 10.1.2.0, Eth1/2, [110/81], 00:41:07, ospf-UNDERLAY, intra</span></pre>
<p>Remote VTEP loopback tak do equal-cost paths, har spine se ek: underlay ready hai. Agar yeh route missing hai, to yahin ruko aur OSPF theek karo; koi VXLAN command help nahi karega.</p>

<h3>Step 1: features enable karo</h3>
<pre class="code"><span class="c">! LEAF1 aur LEAF2 par</span>
configure terminal
feature nv overlay
feature vn-segment-vlan-based</pre>
<p><code>feature nv overlay</code> <code>interface nve1</code> ko unlock karta hai. <code>feature vn-segment-vlan-based</code> VLAN ke neeche <code>vn-segment</code> command ko unlock karta hai. Inke bina baad ke commands reject ho jaate hain.</p>

<h3>Step 2: VLAN ko VNI se map karo</h3>
<pre class="code">vlan 10
  name WEB
  vn-segment 10010</pre>
<p>VLAN 10 pehle se exist karta hai aur Eth1/5 server ke liye access port hai. <code>vn-segment 10010</code> jodne se woh VNI 10010 se bandh jaata hai. <b>Dono leaves par same VNI</b> use karo.</p>

<h3>Step 3: NVE interface banao</h3>
<pre class="code"><span class="c">! LEAF1</span>
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.2

<span class="c">! LEAF2 (mirror image)</span>
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      peer-ip 10.254.0.1</pre>
<p>Line by line: <code>no shutdown</code> interface enable karta hai; <code>source-interface loopback1</code> 10.254.0.x ko VTEP address banata hai; <code>member vni 10010</code> VNI 10010 ko is VTEP par daalta hai; <code>ingress-replication protocol static</code> haath se type ki list ke saath head-end replication choose karta hai; <code>peer-ip</code> doosre leaf ka VTEP address jodta hai (uska loopback0 nahi, aur uplink address bhi nahi). Dhyaan do ki andar jaate hue prompts badalte hain: <code>(config-if-nve)</code>, phir <code>(config-if-nve-vni)</code>, phir <code>(config-if-nve-vni-ingr-rep)</code>.</p>

<div class="note"><p><b>Multicast alternative.</b> Agar fabric PIM chalata hai, to <code>member vni 10010</code> ke neeche do ingress-replication lines ki jagah <code>mcast-group 239.1.1.10</code> likho, dono leaves par identical. Lab static ingress replication use karta hai, isliye lab ke liye wahi rakho.</p></div>

<h3>Step 4: test aur save</h3>
<pre class="code">SRV1&gt; ping 172.16.10.12
LEAF1# show nve peers
LEAF1# copy running-config startup-config</pre>
<pre class="out">Interface Peer-IP          State LearnType Uptime   Router-Mac
--------- ---------------  ----- --------- -------- -----------------
<span class="hl">nve1      10.254.0.2       Up    DP        00:00:14 n/a</span></pre>
<p>Peer Up hai aur <b>data plane</b> (DP) se learn hua hai. Lab ka aakhri task exactly yahi poochta hai: LEAF1 par kaunsa peer address Up hai? Answer: 10.254.0.2.</p>

<h3>Finished configuration</h3>
<pre class="out">LEAF1# show running-config interface nve1
interface nve1
  no shutdown
  source-interface loopback1
  member vni 10010
    ingress-replication protocol static
      <span class="hl">peer-ip 10.254.0.2</span></pre>

<div class="eg"><p><b>Worked example: teesra leaf jodna.</b> LEAF3 (loopback1 10.254.0.3) ko VNI 10010 join karna hai. LEAF3 par: features, <code>vlan 10</code> / <code>vn-segment 10010</code>, peer-ip 10.254.0.1 aur 10.254.0.2 ke saath nve1. LEAF1 aur LEAF2 par: member vni 10010 ke neeche <code>peer-ip 10.254.0.3</code> jodo. Yaani ek VNI aur ek naye leaf ke liye fabric mein 2 + 2 = 4 nayi peer lines. Das VNIs ke saath yeh 40 lines hoti.</p></div>

<div class="warn"><p><b>Is lab ki common galtiyan.</b> (1) Peer ko LEAF2 ke VTEP address (10.254.0.2) ki jagah uske loopback0 (10.255.0.2) ki tarah type karna. (2) Dono leaves par alag VNIs use karna. (3) VLAN map karna lekin <code>member vni</code> bhool jaana. (4) nve1 par <code>no shutdown</code> bhool jaana. (5) Sirf LEAF1 configure karna; static replication dono ends par configure honi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dependencies ka order: feature → VLAN-to-VNI → nve1 source → member VNI → replication. Agar question mein <code>vn-segment</code> reject hota dikhe, to aam taur par <code>feature vn-segment-vlan-based</code> missing hai; <code>interface nve1</code> command missing ho to <code>feature nv overlay</code> missing hai.</p></div>

<div class="scn"><h4>Woh change jo ek hi direction mein chala</h4><p>Raat ke change mein ek engineer ne LEAF7 par VXLAN configure kiya aur verify kiya ki uska server LEAF8 ke server ko ping kar sakta hai. Change close ho gaya. Agli subah application team ne report kiya ki LEAF8 ki taraf se shuru hone wale sessions randomly fail ho rahe hain. Engineer ne config sirf LEAF7 par paste kiya tha; LEAF8 par ek purane change ka nve1 tha jiski peer list mein LEAF7 nahi tha. MACs learn hone ke baad known unicast chal gaya, lekin LEAF8 ke ARP floods kabhi LEAF7 tak nahi pahunche. LEAF8 par peer jodne se theek hua, aur team ne change template mein "dono ends par show nve peers verify karo" jod diya.</p><p><b>Seekh:</b> static replication wala VXLAN har baar dono ends par configure aur verify hota hai.</p></div>

<div class="iv"><p class="q">"Do Nexus leaves ke beech flood-and-learn VXLAN segment configure karo. Sabse pehle kya check karoge?"</p><p>Strong answer: pehle underlay check karunga: remote VTEP loopback ECMP ke saath routing table mein hai aur mere loopback se bade DF packet ke saath ping hota hai. Phir feature nv overlay aur feature vn-segment-vlan-based, vlan 10 / vn-segment 10010, no shutdown ke saath interface nve1, source-interface loopback1, ingress-replication protocol static aur peer ke VTEP IP ke saath member vni 10010, doosre leaf par mirror. show nve peers, show nve vni aur MAC table se verify karo, phir save.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kisi bhi VXLAN command se pehle loopback-to-loopback reachability prove karo.</li>
<li>Pehle feature nv overlay aur feature vn-segment-vlan-based enable karo.</li>
<li>Dono leaves par vlan 10 / vn-segment 10010; VNI match hona chahiye.</li>
<li>nve1: no shutdown, source-interface loopback1, member vni, ingress-replication protocol static, peer-ip = remote VTEP.</li>
<li>Dono ends configure aur verify karo, phir copy running-config startup-config.</li>
</ul></div>
`}};export{e as default};