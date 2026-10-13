var e={id:`mstp-concepts`,h:{en:`MSTP concepts: regions, instances, IST and CIST`,hi:`MSTP concepts: regions, instances, IST aur CIST`},body:{en:`
<p>MSTP (802.1s) solves the "tree per VLAN" scaling problem by <b>grouping VLANs into instances</b>. Before configuring it you must be fluent in five words: region, MSTI, IST, CIST and digest.</p>

<h3>The five words</h3>
<dl class="terms">
<dt>MST region</dt><dd>A set of switches that share the same <b>configuration name</b>, the same <b>revision level</b> and the same <b>VLAN-to-instance mapping</b>. Think of it as a company: everyone in it follows the same org chart.</dd>
<dt>MSTI</dt><dd>Multiple Spanning Tree Instance. A numbered tree (1 to 64 on EX) that carries a chosen group of VLANs. Each MSTI has its own regional root, its own priorities and its own port roles <i>inside the region</i>.</dd>
<dt>IST</dt><dd>Internal Spanning Tree, instance 0 inside a region. It carries every VLAN that is not mapped to an MSTI, and it is the tree whose BPDUs also leave the region.</dd>
<dt>CIST</dt><dd>Common and Internal Spanning Tree: the single tree that connects all regions and any plain RSTP/STP switches. Inside a region the CIST is the IST. The CIST root is the one bridge that everyone agrees is "the" root of the whole network.</dd>
<dt>Digest</dt><dd>A 16-byte hash of the VLAN-to-instance table. The table itself is not sent; every BPDU carries the digest, together with name and revision. Two switches are in the same region only if all three match.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Regions and the CIST">
<rect x="20" y="30" width="340" height="170" rx="14" fill="#e2e8f0"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">Region NK-SURAT (rev 3)</text>
<rect x="50" y="75" width="80" height="34" rx="8" fill="#bae6fd"/><text x="90" y="97" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="250" y="75" width="80" height="34" rx="8" fill="#bae6fd"/><text x="290" y="97" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="150" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="190" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC7</text>
<line x1="130" y1="92" x2="250" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="90" y1="109" x2="170" y2="150" stroke="#64748b" stroke-width="2"/><line x1="290" y1="109" x2="210" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="128" text-anchor="middle" class="svg-muted" font-size="11">MSTI 1, MSTI 2, IST (0)</text>
<line x1="330" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><text x="385" y="82" text-anchor="middle" class="svg-accent" font-size="12">CIST only</text>
<rect x="440" y="30" width="180" height="170" rx="14" fill="#fde68a"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">Region NK-PUNE</text>
<rect x="490" y="75" width="80" height="34" rx="8" fill="#ddd6fe"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="12">PUNE-C</text>
</svg><p class="cap">Between regions only the CIST exists. Inside a region every MSTI lives next to the IST.</p></div>

<h3>Bridge ID, priority and extended system ID</h3>
<p>Each instance has its own bridge ID: <code>priority + instance number</code> in the first 16 bits, then the MAC. A 32k default priority shows as 32768 in instance 0, 32769 in MSTI 1 and 32770 in MSTI 2. A priority of 4k in MSTI 2 appears as 4098. That is the <b>extended system ID</b>: the instance number is added to the priority. You will recognise these numbers in the output below.</p>

<h3>Why a region at all?</h3>
<p>Inside a region, switches exchange only <b>one BPDU</b> per port. It carries the CIST data plus a small record for every MSTI, so 64 instances do not mean 64 BPDUs. Across a region boundary the neighbour does not understand those records (or does not trust the digest) and so only the CIST view is exchanged. A region therefore behaves, from the outside, like <b>one big virtual bridge</b>. That is also how MSTP stays compatible with RSTP and STP switches: they just see a bridge.</p>

<table class="cmp"><tr><th>Question</th><th>Inside a region</th><th>Across a boundary</th></tr>
<tr><td>Which trees exist?</td><td>IST + every MSTI</td><td>CIST only</td></tr>
<tr><td>Who is root?</td><td>per MSTI: regional root; CIST: regional root toward the CIST root</td><td>CIST root of the whole network</td></tr>
<tr><td>Cost counted</td><td>internal path cost</td><td>external path cost</td></tr>
<tr><td>Hop limit</td><td>max-hops (default 20), decremented in each BPDU</td><td>region counts as one hop</td></tr></table>

<div class="eg"><p><b>Worked example.</b> ACC7 maps VLAN 10 to MSTI 1 and VLAN 20 to MSTI 2. VLAN 30 is not mapped. A frame in VLAN 30 follows the IST (instance 0). The digest on ACC7 is computed from the table "VLANs 1-9, 11-19, 21-4094 to MSTI 0; 10 to MSTI 1; 20 to MSTI 2". If AGG1 had mapped VLAN 30 to MSTI 1, the table would differ, so the digest would differ, and ACC7 and AGG1 would no longer be in the same region even though name and revision match.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting that a VLAN you did not map still needs a tree. It runs on the IST. If the IST root is a poor choice (an old access switch with default priority), all unmapped VLANs, including the management VLAN, use a bad topology. Always set the IST (instance 0) priority too.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Same name and revision means same region." No. The VLAN-to-instance mapping (the digest) must also match. And MSTP supports 64 instances on EX; instance numbers are <b>local labels only inside a region</b>: they are not carried across a boundary.</p></div>

<div class="scn"><h4>Four hundred VLANs, two trees</h4><p>A school campus had 400 VLANs, one per classroom block. VSTP was impossible: the access switches ran out of CPU. The team mapped VLANs 100-299 to MSTI 1 and VLANs 300-499 to MSTI 2, and left management on the IST. Two trees replaced 400. Convergence stayed under a second because RSTP-style handshakes still apply inside every instance.</p><p><b>Lesson:</b> MSTP scales by grouping, and grouping is only safe if every switch holds the same mapping.</p></div>

<div class="iv"><p class="q">"What is the difference between the IST and the CIST?"</p><p>The IST is instance 0 inside one region; it carries unmapped VLANs and is the only instance whose information leaves the region. The CIST is the single tree spanning the whole network: it joins regions to each other and to RSTP/STP switches. Inside a region the CIST is represented by the IST. Add that the region appears as one bridge to the outside.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A region = same name + same revision + same VLAN-to-instance mapping (compared by digest).</li>
<li>MSTI 1 to 64 carry mapped VLANs; instance 0 (IST) carries everything else.</li>
<li>The CIST joins regions and RSTP switches; a region looks like one bridge from outside.</li>
<li>Instance number is added to the priority: 4k in MSTI 2 shows as 4098.</li>
<li>One BPDU per port carries all instance records.</li>
</ul></div>
`,hi:`
<p>MSTP (802.1s) "har VLAN ka tree" wali scaling problem ko <b>VLANs ko instances mein group karke</b> solve karta hai. Configure karne se pehle paanch shabd aane chahiye: region, MSTI, IST, CIST aur digest.</p>

<h3>Paanch shabd</h3>
<dl class="terms">
<dt>MST region</dt><dd>Aise switches ka set jinka <b>configuration name</b>, <b>revision level</b> aur <b>VLAN-to-instance mapping</b> teeno same hon. Ise company samjho: sab ek hi org chart follow karte hain.</dd>
<dt>MSTI</dt><dd>Multiple Spanning Tree Instance. Ek numbered tree (EX par 1 se 64) jo chune hue VLANs ka group le jaata hai. Har MSTI ka apna regional root, apni priorities aur apne port roles hote hain <i>region ke andar</i>.</dd>
<dt>IST</dt><dd>Internal Spanning Tree, region ke andar instance 0. Yeh har us VLAN ko le jaata hai jo kisi MSTI mein map nahi hai, aur isi tree ke BPDUs region se bahar bhi jaate hain.</dd>
<dt>CIST</dt><dd>Common and Internal Spanning Tree: woh ek tree jo saare regions aur plain RSTP/STP switches ko jodta hai. Region ke andar CIST hi IST hai. CIST root woh ek bridge hai jise sab poore network ka root maante hain.</dd>
<dt>Digest</dt><dd>VLAN-to-instance table ka 16-byte hash. Table khud nahi bheji jaati; har BPDU digest, name aur revision ke saath jaata hai. Do switches same region mein tabhi hain jab teeno match karein.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Regions aur CIST">
<rect x="20" y="30" width="340" height="170" rx="14" fill="#e2e8f0"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="13">Region NK-SURAT (rev 3)</text>
<rect x="50" y="75" width="80" height="34" rx="8" fill="#bae6fd"/><text x="90" y="97" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="250" y="75" width="80" height="34" rx="8" fill="#bae6fd"/><text x="290" y="97" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="150" y="150" width="80" height="34" rx="8" fill="#bbf7d0"/><text x="190" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC7</text>
<line x1="130" y1="92" x2="250" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="90" y1="109" x2="170" y2="150" stroke="#64748b" stroke-width="2"/><line x1="290" y1="109" x2="210" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="190" y="128" text-anchor="middle" class="svg-muted" font-size="11">MSTI 1, MSTI 2, IST (0)</text>
<line x1="330" y1="92" x2="440" y2="92" stroke="#64748b" stroke-width="2"/><text x="385" y="82" text-anchor="middle" class="svg-accent" font-size="12">sirf CIST</text>
<rect x="440" y="30" width="180" height="170" rx="14" fill="#fde68a"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="13">Region NK-PUNE</text>
<rect x="490" y="75" width="80" height="34" rx="8" fill="#ddd6fe"/><text x="530" y="97" text-anchor="middle" class="svg-ink" font-size="12">PUNE-C</text>
</svg><p class="cap">Regions ke beech sirf CIST hota hai. Region ke andar har MSTI IST ke saath rehta hai.</p></div>

<h3>Bridge ID, priority aur extended system ID</h3>
<p>Har instance ka apna bridge ID hota hai: pehle 16 bits mein <code>priority + instance number</code>, phir MAC. Default 32k priority instance 0 mein 32768, MSTI 1 mein 32769 aur MSTI 2 mein 32770 dikhti hai. MSTI 2 mein 4k priority 4098 dikhti hai. Yahi <b>extended system ID</b> hai: instance number priority mein jud jaata hai. Neeche ke output mein aap yeh numbers pehchaan loge.</p>

<h3>Region ki zaroorat kyun?</h3>
<p>Region ke andar switches har port par sirf <b>ek BPDU</b> bhejte hain. Usme CIST ka data aur har MSTI ka chhota record hota hai, isliye 64 instances ka matlab 64 BPDUs nahi. Region boundary ke paar padosi un records ko nahi samajhta (ya digest par bharosa nahi karta), isliye sirf CIST ka view exchange hota hai. Bahar se dekho to region <b>ek bada virtual bridge</b> lagta hai. Isi tarah MSTP RSTP aur STP switches ke saath compatible rehta hai: unhe bas ek bridge dikhta hai.</p>

<table class="cmp"><tr><th>Sawaal</th><th>Region ke andar</th><th>Boundary ke paar</th></tr>
<tr><td>Kaunse trees hain?</td><td>IST + har MSTI</td><td>sirf CIST</td></tr>
<tr><td>Root kaun?</td><td>har MSTI ka regional root; CIST: CIST root ki taraf regional root</td><td>poore network ka CIST root</td></tr>
<tr><td>Kaunsa cost gina jaata hai</td><td>internal path cost</td><td>external path cost</td></tr>
<tr><td>Hop limit</td><td>max-hops (default 20), har BPDU mein ghatta hai</td><td>region ek hop gina jaata hai</td></tr></table>

<div class="eg"><p><b>Worked example.</b> ACC7 VLAN 10 ko MSTI 1 aur VLAN 20 ko MSTI 2 mein map karta hai. VLAN 30 map nahi hai. VLAN 30 ka frame IST (instance 0) follow karta hai. ACC7 par digest is table se banta hai: "VLANs 1-9, 11-19, 21-4094 MSTI 0 ko; 10 MSTI 1 ko; 20 MSTI 2 ko". Agar AGG1 ne VLAN 30 ko MSTI 1 mein map kiya hota to table alag hoti, digest alag hota, aur name aur revision match hone par bhi ACC7 aur AGG1 same region mein nahi rehte.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh bhoolna ki jo VLAN aapne map nahi kiya use bhi tree chahiye. Woh IST par chalta hai. Agar IST root galat chuna gaya (default priority wala purana access switch), to saare unmapped VLANs, management VLAN samet, kharab topology use karte hain. IST (instance 0) ki priority bhi hamesha set karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Name aur revision same matlab region same." Nahi. VLAN-to-instance mapping (digest) bhi match honi chahiye. Aur EX par MSTP 64 instances support karta hai; instance numbers <b>sirf region ke andar ke local labels</b> hain: boundary ke paar nahi jaate.</p></div>

<div class="scn"><h4>Chaar sau VLANs, do trees</h4><p>Ek school campus mein 400 VLANs the, har classroom block ka ek. VSTP namumkin tha: access switches ki CPU kam padi. Team ne VLANs 100-299 ko MSTI 1 aur 300-499 ko MSTI 2 mein map kiya aur management ko IST par chhoda. 400 ki jagah do trees. Convergence ek second se kam raha kyunki har instance mein RSTP-style handshakes lagu rehte hain.</p><p><b>Lesson:</b> MSTP grouping se scale karta hai, aur grouping tabhi safe hai jab har switch ke paas wahi mapping ho.</p></div>

<div class="iv"><p class="q">"IST aur CIST mein kya difference hai?"</p><p>IST ek region ke andar instance 0 hai; yeh unmapped VLANs ko le jaata hai aur sirf yahi instance hai jiski information region se bahar jaati hai. CIST woh ek tree hai jo poore network mein phaila hai: regions ko aapas mein aur RSTP/STP switches se jodta hai. Region ke andar CIST ko IST represent karta hai. Yeh bhi bolo ki region bahar se ek bridge dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Region = same name + same revision + same VLAN-to-instance mapping (digest se compare).</li>
<li>MSTI 1 se 64 mapped VLANs le jaate hain; instance 0 (IST) baaki sab.</li>
<li>CIST regions aur RSTP switches ko jodta hai; region bahar se ek bridge dikhta hai.</li>
<li>Instance number priority mein judta hai: MSTI 2 mein 4k = 4098.</li>
<li>Har port par ek BPDU saare instance records leta hai.</li>
</ul></div>
`}};export{e as default};