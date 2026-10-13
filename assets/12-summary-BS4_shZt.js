var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you walk around the car once: tyres, lights, fuel, mirrors. This chapter is that walk-around for ENCOR topic 3.1. If you can tick every box below without looking back, you are ready for the exam questions and for the interview whiteboard.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="245" y="95" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">ENCOR 3.1 Layer 2</text>
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">CAM, trunks, DTP, VTP</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">LACP, PAgP, hash</text>
<rect x="20" y="175" width="170" height="44" rx="8" fill="#fde68a"/><text x="105" y="202" text-anchor="middle" class="svg-ink" font-size="13">RSTP and MST</text>
<rect x="450" y="175" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="202" text-anchor="middle" class="svg-ink" font-size="13">Guards and UDLD</text>
<line x1="190" y1="50" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="50" x2="395" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="245" y2="140" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="395" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The four pillars of the module, all joined by one troubleshooting workflow.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain learn, forward, filter and flood per VLAN, and find unknown-unicast flooding caused by CAM/ARP timer mismatch.</li>
<li>Predict any DTP mode combination, spot a VTP domain mismatch that blocks dynamic trunking, and prevent a VTP revision overwrite.</li>
<li>Read all four sections of <code>show interfaces trunk</code> and say why a VLAN is missing from each.</li>
<li>Detect a native VLAN mismatch with CDP and PVST+ PVID inconsistency, and explain why MST does not block it.</li>
<li>Build LACP and PAgP bundles, decode every flag in <code>show etherchannel summary</code>, and explain the misconfig guard.</li>
<li>Choose a load-balancing method for the traffic direction, predict the member with the test command, and recognise polarisation.</li>
<li>Describe RSTP roles, states, link types, proposal/agreement and topology-change handling.</li>
<li>Build an MST region, give each instance its own root and verify the load sharing (Lab 1).</li>
<li>Explain IST, MSTI, CIST, regional root, boundary ports, and PVST simulation rules.</li>
<li>Place PortFast, BPDU Guard, BPDU Filter, Root Guard, Loop Guard and UDLD correctly.</li>
<li>Troubleshoot a region mismatch from show output alone (Lab 3).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM</dt><dd>Exact-match MAC table keyed by (VLAN, MAC); dynamic entries age after 300 s.</dd>
<dt>DTP</dt><dd>Cisco trunk negotiation; desirable initiates, auto answers; carries the VTP domain.</dd>
<dt>Native VLAN</dt><dd>The VLAN sent untagged on an 802.1Q trunk; must match on both ends.</dd>
<dt>LACP system ID</dt><dd>System priority + MAC; the lower one chooses active ports.</dd>
<dt>Polarisation</dt><dd>Consecutive tiers hashing the same fields the same way, leaving members idle.</dd>
<dt>Proposal/agreement</dt><dd>RSTP handshake on point-to-point links that replaces forward-delay timers.</dd>
<dt>MST region</dt><dd>Switches with identical name, revision and VLAN-to-instance mapping (digest).</dd>
<dt>IST / MSTI / CIST</dt><dd>Instance 0 / extra instances inside a region / the single tree across all regions.</dd>
<dt>Boundary port</dt><dd>Port facing another region or a non-MST switch; takes its CIST role for all instances.</dd>
<dt>PVST simulation</dt><dd>Consistency check on MST-to-PVST+ boundaries; every VLAN's root must sit on one side.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>DTP</td><td>auto + auto = access; nonegotiate only with access or trunk mode</td></tr>
<tr><td>VTP</td><td>Highest revision in the domain wins; v3 primary server prevents accidents; VLAN 1 never pruned</td></tr>
<tr><td>EtherChannel</td><td>passive+passive and auto+auto fail; on only with on; LACP 16 configured / 8 active</td></tr>
<tr><td>Hash</td><td>8 buckets; use 2, 4 or 8 members; method is global and local; one flow = one link</td></tr>
<tr><td>RSTP</td><td>TC only when a non-edge port goes forwarding; neighbour lost after 3 hellos</td></tr>
<tr><td>MST</td><td>Region = name + revision + digest; unmapped VLANs in MST0; bridge ID = priority + instance</td></tr>
<tr><td>MST costs</td><td>Long method: 1G = 20000, 10G = 2000; default max-hops 20</td></tr>
<tr><td>Guards</td><td>BPDU Guard err-disables; Root Guard root-inconsistent; Loop Guard loop-inconsistent; not Root and Loop on one port</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Trunks</span>
switchport mode trunk
switchport nonegotiate
switchport trunk native vlan 999
switchport trunk allowed vlan add 30
<span class="c">! EtherChannel</span>
channel-group 1 mode active
port-channel load-balance src-dst-ip
<span class="c">! MST</span>
spanning-tree mode mst
spanning-tree mst configuration
 name NK-CAMPUS
 revision 1
 instance 1 vlan 10,20
 instance 2 vlan 30,40
spanning-tree mst 0-1 root primary
<span class="c">! Guards</span>
spanning-tree portfast
spanning-tree bpduguard enable
spanning-tree guard root
spanning-tree guard loop
udld port aggressive</pre>
<pre class="out">show interfaces trunk                     show interfaces switchport
show etherchannel summary                 show lacp neighbor
show etherchannel load-balance            test etherchannel load-balance interface po1 ip A B
show spanning-tree mst configuration      show spanning-tree mst configuration digest
show spanning-tree mst 1                  show spanning-tree mst interface Gi0/1
show spanning-tree vlan 40                show spanning-tree inconsistentports
show spanning-tree detail                 show mac address-table dynamic</pre>

<div class="eg"><p><b>Worked example: a one-minute exam drill.</b> Output: <code>Gi0/2 Altn BLK 20000 128.2 P2p Bound(RSTP)</code> in MST1 on a switch whose neighbour is in the same building design. Read it: cost 20000 = 1G on long costs; Altn = alternate; Bound(RSTP) = the neighbour is in another region. Conclusion: a region mismatch, check name, revision and digest on both ends. Ten seconds per line, every line.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without the order of verification. The exam and real tickets reward the engineer who checks identity (digest, system ID, native VLAN) before roles and paths.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the verb: "troubleshoot" questions show output and ask for the fault; "configure and verify" questions ask for exact syntax. <code>spanning-tree guard root</code>, not "rootguard"; <code>spanning-tree bpduguard enable</code>, not "guard bpdu".</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate for a campus role was asked to draw three switches, make one MST region with two instances and explain what happens if one switch's revision differs. She drew the triangle, marked roots per instance, showed which SW3 port blocked in each instance, then explained that the mismatched switch becomes its own region, its links turn into boundaries, and all VLANs follow the CIST. She finished with the fix and the verification commands. She got the offer.</p><p><b>Lesson:</b> the labs of this module are exactly the stories interviewers want to hear.</p></div>

<div class="iv"><p class="q">"If you had to secure and stabilise a campus Layer 2 design in one change window, what would you configure?"</p><p>Strong answer: hard-coded trunks with DTP off, unused native VLAN tagged, explicit allowed lists; LACP active bundles with an IP-based hash; MST with a pre-mapped region and roots per instance on the distribution pair; PortFast plus BPDU Guard on every host port; Root Guard on distribution downlinks; Loop Guard and UDLD aggressive on inter-switch fibre; VTP transparent or v3. Then verify with the workflow and prove paths through the CAM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks: static, DTP off, matching native VLAN, edit allowed lists with add/remove.</li>
<li>EtherChannel: LACP active, configure on the Port-channel, hash on the field that varies.</li>
<li>STP: RSTP handshake for speed, MST regions for scale, roots per instance for load sharing.</li>
<li>Guards protect the design: PortFast + BPDU Guard at the edge, Root Guard down, Loop Guard up.</li>
<li>Troubleshoot bottom-up and prove every fix with the CAM table.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap ek baar car ke chaaron taraf ghoomte ho: tyres, lights, fuel, mirrors. Yeh chapter ENCOR topic 3.1 ke liye wahi chakkar hai. Agar aap neeche ka har box bina peeche dekhe tick kar sakte ho, to aap exam questions aur interview whiteboard dono ke liye ready ho.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="245" y="95" width="150" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="14">ENCOR 3.1 Layer 2</text>
<rect x="20" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="47" text-anchor="middle" class="svg-ink" font-size="13">CAM, trunks, DTP, VTP</text>
<rect x="450" y="20" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">LACP, PAgP, hash</text>
<rect x="20" y="175" width="170" height="44" rx="8" fill="#fde68a"/><text x="105" y="202" text-anchor="middle" class="svg-ink" font-size="13">RSTP aur MST</text>
<rect x="450" y="175" width="170" height="44" rx="8" fill="#fed7aa"/><text x="535" y="202" text-anchor="middle" class="svg-ink" font-size="13">Guards aur UDLD</text>
<line x1="190" y1="50" x2="245" y2="105" stroke="#64748b" stroke-width="2"/><line x1="450" y1="50" x2="395" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="190" x2="245" y2="140" stroke="#64748b" stroke-width="2"/><line x1="450" y1="190" x2="395" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Module ke chaar khambe, sab ek troubleshooting workflow se jude.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Per VLAN learn, forward, filter aur flood samjhao, aur CAM/ARP timer mismatch se hone wali unknown-unicast flooding dhoondo.</li>
<li>Koi bhi DTP mode combination predict karo, dynamic trunking rokne wala VTP domain mismatch pakdo, aur VTP revision overwrite roko.</li>
<li><code>show interfaces trunk</code> ke chaaron sections padho aur batao ki har ek se VLAN kyun gayab hai.</li>
<li>CDP aur PVST+ PVID inconsistency se native VLAN mismatch pakdo, aur samjhao ki MST ise block kyun nahi karta.</li>
<li>LACP aur PAgP bundles banao, <code>show etherchannel summary</code> ka har flag decode karo, aur misconfig guard samjhao.</li>
<li>Traffic direction ke hisaab se load-balancing method chuno, test command se member predict karo, aur polarisation pehchano.</li>
<li>RSTP roles, states, link types, proposal/agreement aur topology-change handling describe karo.</li>
<li>MST region banao, har instance ko apna root do aur load sharing verify karo (Lab 1).</li>
<li>IST, MSTI, CIST, regional root, boundary ports, aur PVST simulation rules samjhao.</li>
<li>PortFast, BPDU Guard, BPDU Filter, Root Guard, Loop Guard aur UDLD sahi jagah lagao.</li>
<li>Sirf show output se region mismatch troubleshoot karo (Lab 3).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CAM</dt><dd>(VLAN, MAC) key wali exact-match MAC table; dynamic entries 300 s baad age hoti hain.</dd>
<dt>DTP</dt><dd>Cisco trunk negotiation; desirable shuru karta hai, auto jawab deta hai; VTP domain le jaata hai.</dd>
<dt>Native VLAN</dt><dd>802.1Q trunk par untagged jaane wala VLAN; dono ends par match hona chahiye.</dd>
<dt>LACP system ID</dt><dd>System priority + MAC; kam wala active ports chunta hai.</dd>
<dt>Polarisation</dt><dd>Lagataar tiers same fields ko same tareeke se hash karte hain, members idle reh jaate hain.</dd>
<dt>Proposal/agreement</dt><dd>Point-to-point links par RSTP handshake jo forward-delay timers ki jagah leta hai.</dd>
<dt>MST region</dt><dd>Same name, revision aur VLAN-to-instance mapping (digest) wale switches.</dd>
<dt>IST / MSTI / CIST</dt><dd>Instance 0 / region ke andar extra instances / saare regions par faila ek tree.</dd>
<dt>Boundary port</dt><dd>Doosre region ya non-MST switch ki taraf port; saare instances ke liye apna CIST role leta hai.</dd>
<dt>PVST simulation</dt><dd>MST-to-PVST+ boundaries par consistency check; har VLAN ka root ek hi taraf hona chahiye.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>DTP</td><td>auto + auto = access; nonegotiate sirf access ya trunk mode ke saath</td></tr>
<tr><td>VTP</td><td>Domain mein sabse zyada revision jeetta hai; v3 primary server galtiyan rokta hai; VLAN 1 kabhi prune nahi</td></tr>
<tr><td>EtherChannel</td><td>passive+passive aur auto+auto fail; on sirf on ke saath; LACP 16 configured / 8 active</td></tr>
<tr><td>Hash</td><td>8 buckets; 2, 4 ya 8 members use karo; method global aur local; ek flow = ek link</td></tr>
<tr><td>RSTP</td><td>TC sirf tab jab non-edge port forwarding mein jaaye; 3 hellos ke baad neighbour lost</td></tr>
<tr><td>MST</td><td>Region = name + revision + digest; unmapped VLANs MST0 mein; bridge ID = priority + instance</td></tr>
<tr><td>MST costs</td><td>Long method: 1G = 20000, 10G = 2000; default max-hops 20</td></tr>
<tr><td>Guards</td><td>BPDU Guard err-disable karta hai; Root Guard root-inconsistent; Loop Guard loop-inconsistent; Root aur Loop ek port par nahi</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Trunks</span>
switchport mode trunk
switchport nonegotiate
switchport trunk native vlan 999
switchport trunk allowed vlan add 30
<span class="c">! EtherChannel</span>
channel-group 1 mode active
port-channel load-balance src-dst-ip
<span class="c">! MST</span>
spanning-tree mode mst
spanning-tree mst configuration
 name NK-CAMPUS
 revision 1
 instance 1 vlan 10,20
 instance 2 vlan 30,40
spanning-tree mst 0-1 root primary
<span class="c">! Guards</span>
spanning-tree portfast
spanning-tree bpduguard enable
spanning-tree guard root
spanning-tree guard loop
udld port aggressive</pre>
<pre class="out">show interfaces trunk                     show interfaces switchport
show etherchannel summary                 show lacp neighbor
show etherchannel load-balance            test etherchannel load-balance interface po1 ip A B
show spanning-tree mst configuration      show spanning-tree mst configuration digest
show spanning-tree mst 1                  show spanning-tree mst interface Gi0/1
show spanning-tree vlan 40                show spanning-tree inconsistentports
show spanning-tree detail                 show mac address-table dynamic</pre>

<div class="eg"><p><b>Worked example: ek minute ki exam drill.</b> Output: ek switch par MST1 mein <code>Gi0/2 Altn BLK 20000 128.2 P2p Bound(RSTP)</code>, jiska neighbour same building design mein hai. Padho: cost 20000 = long costs par 1G; Altn = alternate; Bound(RSTP) = neighbour doosre region mein hai. Nateeja: region mismatch, dono ends par name, revision aur digest check karo. Har line par das second, har line.</p></div>

<div class="warn"><p><b>Common galti.</b> Verification ka order samjhe bina commands ratna. Exam aur real tickets us engineer ko reward karte hain jo roles aur paths se pehle identity (digest, system ID, native VLAN) check karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Verb dhyan se dekho: "troubleshoot" questions output dikhate hain aur fault poochte hain; "configure and verify" questions exact syntax poochte hain. <code>spanning-tree guard root</code>, "rootguard" nahi; <code>spanning-tree bpduguard enable</code>, "guard bpdu" nahi.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Campus role ke ek candidate ko teen switches draw karne, do instances wala ek MST region banane aur yeh samjhane ko kaha gaya ki agar ek switch ka revision alag ho to kya hoga. Usne triangle banaya, har instance ke roots mark kiye, dikhaya ki har instance mein SW3 ka kaunsa port block hota hai, phir samjhaya ki mismatched switch apna region ban jaata hai, uske links boundaries ban jaate hain, aur saare VLANs CIST follow karte hain. Usne fix aur verification commands ke saath khatam kiya. Use offer mil gaya.</p><p><b>Seekh:</b> is module ki labs bilkul wahi kahaniyan hain jo interviewers sunna chahte hain.</p></div>

<div class="iv"><p class="q">"Agar aapko ek change window mein campus Layer 2 design secure aur stable karna ho, to aap kya configure karoge?"</p><p>Strong answer: DTP off ke saath hard-coded trunks, tagged unused native VLAN, explicit allowed lists; IP-based hash ke saath LACP active bundles; pre-mapped region aur distribution pair par har instance ke roots ke saath MST; har host port par PortFast plus BPDU Guard; distribution downlinks par Root Guard; inter-switch fibre par Loop Guard aur UDLD aggressive; VTP transparent ya v3. Phir workflow se verify karo aur CAM se paths prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trunks: static, DTP off, matching native VLAN, allowed lists add/remove se edit karo.</li>
<li>EtherChannel: LACP active, Port-channel par configure karo, badalne wale field par hash karo.</li>
<li>STP: speed ke liye RSTP handshake, scale ke liye MST regions, load sharing ke liye har instance ka root.</li>
<li>Guards design ki hifazat karte hain: edge par PortFast + BPDU Guard, neeche Root Guard, upar Loop Guard.</li>
<li>Neeche se upar troubleshoot karo aur har fix CAM table se prove karo.</li>
</ul></div>
`}};export{e as default};