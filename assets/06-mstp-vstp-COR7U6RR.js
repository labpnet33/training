var e={id:`mstp-vstp`,h:{en:`MSTP and VSTP: more than one tree`,hi:`MSTP aur VSTP: ek se zyada tree`},body:{en:`
<p>With RSTP the whole campus shares one tree. Every VLAN uses the same active links, so the blocked uplink carries nothing, ever. That is safe but wasteful. Picture two highways between two cities, with one permanently closed for repairs that never happen. The smarter plan: use one highway for trucks and the other for cars, and let each act as the backup for the other. In spanning tree terms, you run <b>several trees</b> and give each VLAN group a different root. That is what MSTP and VSTP do.</p>

<h3>Why one tree is not always enough</h3>
<ul>
<li><b>Wasted bandwidth:</b> in a two-distribution design the alternate uplink on every access switch is idle.</li>
<li><b>Suboptimal paths:</b> a single root may be far from a given VLAN's gateway.</li>
</ul>
<p>The fix is to run one tree per group of VLANs, with a different root for each, so that half of the VLANs use the left uplink and half use the right.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two trees load sharing">
<rect x="60" y="20" width="190" height="50" rx="10" fill="#fde68a"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="155" y="60" text-anchor="middle" class="svg-muted" font-size="11">root for VLANs 10, 20</text>
<rect x="390" y="20" width="190" height="50" rx="10" fill="#bae6fd"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW2</text><text x="485" y="60" text-anchor="middle" class="svg-muted" font-size="11">root for VLANs 30, 40</text>
<rect x="225" y="160" width="190" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">both uplinks in use</text>
<line x1="250" y1="45" x2="390" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="70" x2="280" y2="160" stroke="#64748b" stroke-width="3"/><line x1="470" y1="70" x2="360" y2="160" stroke="#64748b" stroke-width="3"/>
<text x="175" y="125" class="svg-accent" font-size="12">VLANs 10, 20 forward</text><text x="375" y="125" class="svg-accent" font-size="12">VLANs 30, 40 forward</text>
</svg><p class="cap">Each uplink forwards for one VLAN group and blocks for the other: a load-shared design.</p></div>

<h3>MSTP (802.1s): instances for groups of VLANs</h3>
<p><b>Multiple Spanning Tree Protocol</b> maps VLANs to <b>MSTIs</b> (multiple spanning tree instances) and runs one RSTP-style tree per instance. Instance 0 is the <b>CIST</b>, which carries any VLAN not mapped elsewhere and interconnects regions. Switches that must agree on the same VLAN-to-instance mapping form a <b>region</b>. Three values define a region and must be identical on every member switch: the <b>configuration name</b>, the <b>revision level</b> and the <b>VLAN-to-MSTI mapping</b>. If they differ, the switch lands in another region and the trees do not combine as intended.</p>
<pre class="code">set protocols mstp configuration-name NOIDA-CAMPUS
set protocols mstp revision-level 1
set protocols mstp msti 1 vlan [ 10 20 ]
set protocols mstp msti 2 vlan [ 30 40 ]
set protocols mstp msti 1 bridge-priority 4k      <span class="c"># on DSW1</span>
set protocols mstp msti 2 bridge-priority 8k</pre>
<p>The configuration above, on DSW1, makes DSW1 the root for instance 1 (VLANs 10 and 20). On DSW2 the priorities would be reversed. Verify with <code>show spanning-tree mstp configuration</code> and <code>show spanning-tree interface</code>. This statement set is shown for understanding: the simulator labs use RSTP, but the exam expects you to recognise MSTP configuration.</p>

<h3>VSTP: one tree per VLAN</h3>
<p><b>VLAN Spanning Tree Protocol</b> is Juniper's per-VLAN spanning tree. It is interoperable with Cisco PVST+ and Rapid-PVST+, which makes it the choice when a Junos switch joins a Cisco campus. Each VLAN has its own tree, root and BPDUs.</p>
<pre class="code">set protocols vstp vlan 10 bridge-priority 4k
set protocols vstp vlan 20 bridge-priority 8k</pre>
<p>Fine control comes at a price: many trees means many BPDUs and CPU work. The number of VLANs a switch can run in VSTP is limited by the platform.</p>

<h3>Which one should I choose?</h3>
<table class="cmp"><tr><th>Protocol</th><th>Trees</th><th>Use when</th><th>Watch out for</th></tr>
<tr><td>RSTP</td><td>1 for all VLANs</td><td>Small and medium campus, simplest operations</td><td>Idle alternate uplinks</td></tr>
<tr><td>MSTP</td><td>1 per instance (group of VLANs)</td><td>Large campus, multi-vendor standard, load sharing</td><td>Region name, revision, mapping must match</td></tr>
<tr><td>VSTP</td><td>1 per VLAN</td><td>Interworking with Cisco PVST+</td><td>BPDU and CPU load with many VLANs</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A campus has VLANs 10 and 20 (staff) and 30 and 40 (labs). With RSTP the root is DSW1 and the DSW2 uplinks idle. With MSTP, instance 1 (VLANs 10 and 20) has root DSW1 and instance 2 (30 and 40) has root DSW2. Each access switch forwards VLANs 10 and 20 over the DSW1 link and VLANs 30 and 40 over the DSW2 link, and if one distribution switch fails the other takes over both groups.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mapping a VLAN on one switch but not on its neighbour, which quietly puts that VLAN in the wrong instance. A different revision level on one switch creating a second region. Forgetting that VLANs not mapped to any MSTI default to instance 0. Running MSTP on one side of a link and RSTP on the other: they interoperate but only as a compatibility mode, so plan it deliberately.</p></div>
<div class="exam"><p><b>Exam trap.</b> The three parameters of an MSTP region are name, revision level and VLAN-to-instance mapping. Instance 0 is the CIST. VSTP matches PVST+, not 802.1s.</p></div>

<div class="scn"><h4>Idle uplinks and a surprise region</h4><p>A university moved to MSTP to use both distribution switches. Half the access switches ignored the new design: the engineer had typed the region name as "NOIDA-CAMPUS" on most switches and "NOIDA_CAMPUS" on a few. Those switches formed their own region and sent traffic towards the wrong root. A single <code>show spanning-tree mstp configuration</code> comparison found the typo.</p><p><b>Lesson:</b> region parameters must match exactly, character by character.</p></div>

<div class="iv"><p class="q">"When would you choose MSTP over RSTP?"</p><p>When a large campus has several VLAN groups and two distribution switches, and the idle alternate uplinks are wasted bandwidth. MSTP maps VLANs to instances with different roots so both uplinks forward. Warn that the region name, revision level and VLAN mapping must match on every switch, and mention VSTP for interworking with Cisco PVST+.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP uses one tree for all VLANs, so alternate uplinks stay idle.</li>
<li>MSTP maps VLAN groups to instances with separate roots; the region name, revision and mapping must match.</li>
<li>Instance 0 (CIST) carries unmapped VLANs.</li>
<li>VSTP runs a tree per VLAN and interoperates with Cisco PVST+.</li>
<li>All variants follow the same election, role and state rules as RSTP.</li>
</ul></div>
`,hi:`
<p>RSTP ke saath poora campus ek hi tree share karta hai. Har VLAN wahi active links use karta hai, isliye blocked uplink kabhi kuch carry nahi karta. Yeh safe hai lekin wasteful. Socho do shehron ke beech do highways, jisme ek hamesha repair ke liye band hai jo kabhi hoti hi nahi. Smart plan: ek highway trucks ke liye, doosri cars ke liye, aur dono ek doosre ka backup. Spanning tree ki bhasha mein aap <b>kai trees</b> chalate ho aur har VLAN group ko alag root dete ho. MSTP aur VSTP yahi karte hain.</p>

<h3>Ek tree hamesha kaafi kyun nahi</h3>
<ul>
<li><b>Bandwidth ki barbaadi:</b> two-distribution design mein har access switch ka alternate uplink idle rehta hai.</li>
<li><b>Suboptimal paths:</b> ek hi root kisi VLAN ke gateway se door ho sakta hai.</li>
</ul>
<p>Fix hai VLANs ke group ke liye ek tree chalana, har ek ka alag root, taaki aadhe VLANs left uplink aur aadhe right uplink use karein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Do trees load sharing">
<rect x="60" y="20" width="190" height="50" rx="10" fill="#fde68a"/><text x="155" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW1</text><text x="155" y="60" text-anchor="middle" class="svg-muted" font-size="11">VLANs 10, 20 ka root</text>
<rect x="390" y="20" width="190" height="50" rx="10" fill="#bae6fd"/><text x="485" y="42" text-anchor="middle" class="svg-ink" font-size="13">DSW2</text><text x="485" y="60" text-anchor="middle" class="svg-muted" font-size="11">VLANs 30, 40 ka root</text>
<rect x="225" y="160" width="190" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">dono uplinks use mein</text>
<line x1="250" y1="45" x2="390" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="70" x2="280" y2="160" stroke="#64748b" stroke-width="3"/><line x1="470" y1="70" x2="360" y2="160" stroke="#64748b" stroke-width="3"/>
<text x="175" y="125" class="svg-accent" font-size="12">VLANs 10, 20 forward</text><text x="375" y="125" class="svg-accent" font-size="12">VLANs 30, 40 forward</text>
</svg><p class="cap">Har uplink ek VLAN group ke liye forward aur doosre ke liye block karta hai: load-shared design.</p></div>

<h3>MSTP (802.1s): VLAN groups ke liye instances</h3>
<p><b>Multiple Spanning Tree Protocol</b> VLANs ko <b>MSTIs</b> (multiple spanning tree instances) mein map karta hai aur har instance ke liye ek RSTP-style tree chalata hai. Instance 0 <b>CIST</b> hai, jo kisi aur mein map na hue VLANs carry karta hai aur regions ko jodta hai. Jin switches ko same VLAN-to-instance mapping par sehmat hona hai woh ek <b>region</b> banate hain. Teen values region define karti hain aur har member switch par identical honi chahiye: <b>configuration name</b>, <b>revision level</b> aur <b>VLAN-to-MSTI mapping</b>. Alag hon to switch doosre region mein chala jaata hai aur trees plan ke hisaab se nahi judte.</p>
<pre class="code">set protocols mstp configuration-name NOIDA-CAMPUS
set protocols mstp revision-level 1
set protocols mstp msti 1 vlan [ 10 20 ]
set protocols mstp msti 2 vlan [ 30 40 ]
set protocols mstp msti 1 bridge-priority 4k      <span class="c"># DSW1 par</span>
set protocols mstp msti 2 bridge-priority 8k</pre>
<p>Upar ki configuration, DSW1 par, DSW1 ko instance 1 (VLANs 10 aur 20) ka root banati hai. DSW2 par priorities ulti hongi. <code>show spanning-tree mstp configuration</code> aur <code>show spanning-tree interface</code> se verify karo. Yeh statements samajhne ke liye hain: simulator labs RSTP use karte hain, lekin exam MSTP configuration pehchanne ki ummeed rakhta hai.</p>

<h3>VSTP: har VLAN ke liye ek tree</h3>
<p><b>VLAN Spanning Tree Protocol</b> Juniper ka per-VLAN spanning tree hai. Yeh Cisco PVST+ aur Rapid-PVST+ ke saath interoperable hai, isliye Junos switch Cisco campus mein judta hai to yehi chunte hain. Har VLAN ka apna tree, root aur BPDUs hota hai.</p>
<pre class="code">set protocols vstp vlan 10 bridge-priority 4k
set protocols vstp vlan 20 bridge-priority 8k</pre>
<p>Fine control ki keemat hai: kai trees matlab kai BPDUs aur CPU kaam. Switch VSTP mein kitne VLANs chala sakta hai yeh platform se limit hota hai.</p>

<h3>Kaunsa chunu?</h3>
<table class="cmp"><tr><th>Protocol</th><th>Trees</th><th>Kab use karein</th><th>Dhyan rakhein</th></tr>
<tr><td>RSTP</td><td>Saare VLANs ke liye 1</td><td>Chhota aur medium campus, sabse simple operations</td><td>Idle alternate uplinks</td></tr>
<tr><td>MSTP</td><td>Har instance (VLAN group) ke liye 1</td><td>Bada campus, multi-vendor standard, load sharing</td><td>Region name, revision, mapping match hone chahiye</td></tr>
<tr><td>VSTP</td><td>Har VLAN ke liye 1</td><td>Cisco PVST+ ke saath interworking</td><td>Bahut VLANs par BPDU aur CPU load</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Campus mein VLANs 10 aur 20 (staff) aur 30 aur 40 (labs) hain. RSTP ke saath root DSW1 hai aur DSW2 uplinks idle. MSTP ke saath instance 1 (VLANs 10, 20) ka root DSW1 aur instance 2 (30, 40) ka root DSW2 hai. Har access switch VLANs 10 aur 20 ko DSW1 link par aur VLANs 30 aur 40 ko DSW2 link par forward karta hai, aur ek distribution switch fail ho to doosra dono groups sambhal leta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> VLAN ko ek switch par map karna lekin padosi par nahi, jisse woh VLAN chupchaap galat instance mein chala jaata hai. Ek switch par alag revision level se doosra region ban jaana. Yeh bhoolna ki kisi MSTI mein map na hue VLANs instance 0 mein jaate hain. Link ki ek taraf MSTP aur doosri taraf RSTP chalana: woh interoperate karte hain lekin sirf compatibility mode mein, isliye soch samajhkar plan karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> MSTP region ke teen parameters: name, revision level aur VLAN-to-instance mapping. Instance 0 CIST hai. VSTP PVST+ se match karta hai, 802.1s se nahi.</p></div>

<div class="scn"><h4>Idle uplinks aur surprise region</h4><p>Ek university ne dono distribution switches use karne ke liye MSTP apnaya. Aadhe access switches ne naye design ko ignore kiya: engineer ne region name zyadatar switches par "NOIDA-CAMPUS" aur kuch par "NOIDA_CAMPUS" type kiya tha. Un switches ne apna region bana liya aur traffic galat root ki taraf bheja. Ek <code>show spanning-tree mstp configuration</code> comparison ne typo pakad liya.</p><p><b>Lesson:</b> region parameters akshar-ba-akshar match hone chahiye.</p></div>

<div class="iv"><p class="q">"RSTP ki jagah MSTP kab chunoge?"</p><p>Jab bade campus mein kai VLAN groups aur do distribution switches hon, aur idle alternate uplinks bandwidth ki barbaadi hon. MSTP VLANs ko alag roots wale instances mein map karta hai taaki dono uplinks forward karein. Chetavani do ki region name, revision level aur VLAN mapping har switch par match hone chahiye, aur Cisco PVST+ ke saath interworking ke liye VSTP batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP saare VLANs ke liye ek tree use karta hai, isliye alternate uplinks idle rehte hain.</li>
<li>MSTP VLAN groups ko alag roots wale instances mein map karta hai; region name, revision aur mapping match hone chahiye.</li>
<li>Instance 0 (CIST) unmapped VLANs carry karta hai.</li>
<li>VSTP har VLAN ke liye tree chalata hai aur Cisco PVST+ ke saath interoperate karta hai.</li>
<li>Saare variants RSTP ke same election, role aur state niyam follow karte hain.</li>
</ul></div>
`}};export{e as default};