var e={id:`overview`,h:{en:`Why one tree is not enough: what you will learn and the big picture`,hi:`Ek tree kaafi kyun nahi: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Juniper enterprise campus uses <b>several spanning trees at once</b>: MSTP (IEEE 802.1s) with regions and instances, and VSTP, a tree per VLAN. You will configure region name, revision and VLAN-to-instance mapping, place a different root for each instance so both uplinks carry traffic, recognise region boundaries, steer a single VLAN with port cost, protect the tree, and troubleshoot it with real <code>show spanning-tree</code> output. These are the Spanning Tree objectives of the JNCIP-ENT exam (JN0-650).</p>
<p><b>Prerequisites.</b> You should already know single-tree RSTP: bridge ID, root election, root path cost, port roles and states, edge ports. That is the JNCIS-ENT module <i>Spanning Tree</i> (jncis-stp). We only recap it briefly here. You also need VLANs and trunks (jncis-switching).</p>

<h3>Analogy: one road, two roads</h3>
<p>Imagine a factory with two gates, North and South, and a car park behind. The security rule says: <i>only one gate may be open, otherwise cars circle in a loop</i>. With RSTP this is exactly what happens: the access switch has two uplinks, one is blocked, and the second lane sits empty for years. MSTP and VSTP change the rule to: <i>trucks use the North gate, cars use the South gate</i>. Each vehicle type has its own one-gate map, so there is still no loop, but both gates are busy.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="One tree versus two trees">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">RSTP: one tree</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">MSTP: two trees</text>
<rect x="60" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="95" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="190" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="225" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="125" y="150" width="70" height="34" rx="8" fill="#bbf7d0"/><text x="160" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="95" y1="74" x2="160" y2="150" stroke="#16a34a" stroke-width="3"/>
<line x1="225" y1="74" x2="160" y2="150" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="12">second uplink blocked for all VLANs</text>
<rect x="380" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="415" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="510" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="545" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="445" y="150" width="70" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="410" y1="74" x2="470" y2="150" stroke="#16a34a" stroke-width="3"/>
<line x1="550" y1="74" x2="490" y2="150" stroke="#2563eb" stroke-width="3"/>
<text x="415" y="120" class="svg-accent" font-size="12">VLAN 10</text><text x="520" y="120" class="svg-accent" font-size="12">VLAN 20</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">each uplink forwards one VLAN group</text>
</svg><p class="cap">Same cables, same loop protection, twice the usable bandwidth.</p></div>

<h3>The two tools on EX switches</h3>
<table class="cmp"><tr><th></th><th>MSTP (802.1s)</th><th>VSTP</th></tr>
<tr><td>Trees</td><td>one per <b>instance</b> (MSTI); many VLANs map to one instance</td><td>one per <b>VLAN</b></td></tr>
<tr><td>Standard</td><td>IEEE, multi-vendor</td><td>Juniper; talks to Cisco-style per-VLAN rapid spanning tree</td></tr>
<tr><td>Cost of scale</td><td>few instances for thousands of VLANs</td><td>every VLAN is a separate tree and uses CPU</td></tr>
<tr><td>Configured with</td><td><code>protocols mstp</code></td><td><code>protocols vstp</code></td></tr></table>

<h3>RSTP in sixty seconds</h3>
<p>Both reuse what you know: the <b>bridge ID</b> is priority plus MAC, the lowest ID becomes root, every other switch picks one <b>root port</b> by lowest root path cost, each segment gets one <b>designated port</b>, the rest are <b>alternate</b> or <b>backup</b> and discard. A 1 Gbps link costs 20000, 10 Gbps costs 2000. Priorities are multiples of 4096 (4k, 8k, 32k...). Edge ports go straight to forwarding. Now we do all of that more than once.</p>

<div class="eg"><p><b>Worked example.</b> Surat warehouse. AGG1 and AGG2 serve ACC7. VLAN 10 (SALES) and VLAN 20 (STORES) both flow through ACC7. With RSTP, AGG1 is root and ACC7 blocks its link to AGG2: STORES traffic also goes to AGG1 and the AGG2 uplink idles. With MSTP, instance 1 (VLAN 10) is rooted on AGG1 and instance 2 (VLAN 20) on AGG2. ACC7 forwards instance 1 on ge-0/0/0 and instance 2 on ge-0/0/1. You will build exactly this in the lab.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing that "more trees" means "less loop protection". Every instance is still loop-free. The real risk is the opposite: a switch with a different region configuration silently collapses all instances into one tree (chapter 5).</p></div>
<div class="exam"><p><b>Exam trap.</b> MSTP does not run one tree per VLAN; it runs one per instance. Unmapped VLANs belong to instance 0, the CIST.</p></div>

<div class="scn"><h4>The idle link nobody noticed</h4><p>A distribution pair was upgraded to 10G uplinks, yet the monitoring graph showed one uplink at 0 percent for a year. The access switches ran RSTP, so the second link was blocked by design. After mapping the busy VLANs into two MSTP instances with different roots, both uplinks carried about half of the load and the failover time stayed the same.</p><p><b>Lesson:</b> a blocked port in single-tree STP is wasted money; multiple trees reclaim it without removing loop protection.</p></div>

<div class="iv"><p class="q">"Why would you use MSTP instead of RSTP in a campus?"</p><p>RSTP builds one tree for all VLANs, so one uplink per access switch is always blocked. MSTP maps groups of VLANs to a few instances, each with its own root, so uplinks can be load shared while still being loop-free, and the number of trees stays small whatever the VLAN count. Mention region parameters and that unmapped VLANs ride the CIST.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP has one tree; one uplink per access switch is blocked for every VLAN.</li>
<li>MSTP: VLANs map to instances (MSTI); each instance has its own root and port roles.</li>
<li>VSTP: one rapid tree per VLAN, interoperable with per-VLAN trees of other vendors.</li>
<li>Both keep the RSTP rules: lowest bridge ID wins, 1G costs 20000, priorities in steps of 4096.</li>
<li>Load sharing = a different root for each tree.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Juniper enterprise campus <b>ek saath kai spanning trees</b> kaise chalata hai: MSTP (IEEE 802.1s) regions aur instances ke saath, aur VSTP, yaani har VLAN ka ek tree. Aap region name, revision aur VLAN-to-instance mapping configure karoge, har instance ka alag root rakhoge taaki dono uplinks traffic le, region boundaries pehchanoge, port cost se ek VLAN ko steer karoge, tree ko protect karoge, aur asli <code>show spanning-tree</code> output se troubleshoot karoge. Yeh JNCIP-ENT exam (JN0-650) ke Spanning Tree objectives hain.</p>
<p><b>Prerequisites.</b> Aapko single-tree RSTP aana chahiye: bridge ID, root election, root path cost, port roles aur states, edge ports. Yeh JNCIS-ENT ka module <i>Spanning Tree</i> (jncis-stp) hai. Yahan sirf chhota recap hai. VLANs aur trunks (jncis-switching) bhi aane chahiye.</p>

<h3>Analogy: ek sadak, do sadak</h3>
<p>Socho ek factory ke do gate hain, North aur South, aur peeche car park. Security rule hai: <i>sirf ek gate khula rahega, warna gaadiyan chakkar kaatengi</i>. RSTP mein bilkul yahi hota hai: access switch ke do uplinks hain, ek block hai, aur doosri lane saalon tak khaali rehti hai. MSTP aur VSTP rule badal dete hain: <i>trucks North gate se, cars South gate se</i>. Har vehicle type ka apna one-gate map hai, isliye loop phir bhi nahi banta, par dono gate busy rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Ek tree aur do trees">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">RSTP: ek tree</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">MSTP: do trees</text>
<rect x="60" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="95" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="190" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="225" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="125" y="150" width="70" height="34" rx="8" fill="#bbf7d0"/><text x="160" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="95" y1="74" x2="160" y2="150" stroke="#16a34a" stroke-width="3"/>
<line x1="225" y1="74" x2="160" y2="150" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="160" y="205" text-anchor="middle" class="svg-muted" font-size="12">doosra uplink saare VLANs ke liye block</text>
<rect x="380" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="415" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG1</text>
<rect x="510" y="40" width="70" height="34" rx="8" fill="#bae6fd"/><text x="545" y="62" text-anchor="middle" class="svg-ink" font-size="12">AGG2</text>
<rect x="445" y="150" width="70" height="34" rx="8" fill="#bbf7d0"/><text x="480" y="172" text-anchor="middle" class="svg-ink" font-size="12">ACC</text>
<line x1="410" y1="74" x2="470" y2="150" stroke="#16a34a" stroke-width="3"/>
<line x1="550" y1="74" x2="490" y2="150" stroke="#2563eb" stroke-width="3"/>
<text x="415" y="120" class="svg-accent" font-size="12">VLAN 10</text><text x="520" y="120" class="svg-accent" font-size="12">VLAN 20</text>
<text x="480" y="205" text-anchor="middle" class="svg-muted" font-size="12">har uplink ek VLAN group forward karta hai</text>
</svg><p class="cap">Wahi cables, wahi loop protection, usable bandwidth double.</p></div>

<h3>EX switches par do tools</h3>
<table class="cmp"><tr><th></th><th>MSTP (802.1s)</th><th>VSTP</th></tr>
<tr><td>Trees</td><td>har <b>instance</b> (MSTI) ka ek; kai VLANs ek instance mein map hote hain</td><td>har <b>VLAN</b> ka ek</td></tr>
<tr><td>Standard</td><td>IEEE, multi-vendor</td><td>Juniper; Cisco-style per-VLAN rapid spanning tree se baat karta hai</td></tr>
<tr><td>Scale ki keemat</td><td>hazaaron VLANs ke liye kuch hi instances</td><td>har VLAN alag tree hai aur CPU leta hai</td></tr>
<tr><td>Configure kahan</td><td><code>protocols mstp</code></td><td><code>protocols vstp</code></td></tr></table>

<h3>RSTP sirf ek minute mein</h3>
<p>Dono wahi purane niyam use karte hain: <b>bridge ID</b> = priority + MAC, sabse chhota ID root banta hai, har doosra switch lowest root path cost se ek <b>root port</b> chunta hai, har segment ka ek <b>designated port</b> hota hai, baaki <b>alternate</b> ya <b>backup</b> hote hain aur discard karte hain. 1 Gbps link ka cost 20000, 10 Gbps ka 2000. Priorities 4096 ke multiples hoti hain (4k, 8k, 32k...). Edge ports seedha forwarding mein jaate hain. Ab yahi sab hum ek se zyada baar karenge.</p>

<div class="eg"><p><b>Worked example.</b> Surat warehouse. AGG1 aur AGG2 ACC7 ko serve karte hain. VLAN 10 (SALES) aur VLAN 20 (STORES) dono ACC7 se guzarte hain. RSTP mein AGG1 root hai aur ACC7 AGG2 wala link block karta hai: STORES ka traffic bhi AGG1 jaata hai aur AGG2 uplink khaali padta hai. MSTP mein instance 1 (VLAN 10) ka root AGG1 aur instance 2 (VLAN 20) ka root AGG2. ACC7 instance 1 ko ge-0/0/0 par aur instance 2 ko ge-0/0/1 par forward karta hai. Lab mein aap yahi banaoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki "zyada trees" ka matlab "kam loop protection". Har instance phir bhi loop-free hai. Asli risk ulta hai: alag region configuration wala switch chupchaap saare instances ko ek tree mein collapse kar deta hai (chapter 5).</p></div>
<div class="exam"><p><b>Exam trap.</b> MSTP har VLAN ka ek tree nahi chalata; har instance ka ek chalata hai. Unmapped VLANs instance 0, yaani CIST, mein hote hain.</p></div>

<div class="scn"><h4>Woh idle link jo kisi ne notice nahi kiya</h4><p>Ek distribution pair ko 10G uplinks mein upgrade kiya gaya, phir bhi monitoring graph mein ek uplink saal bhar 0 percent dikha. Access switches RSTP chala rahe the, isliye doosra link design se hi blocked tha. Busy VLANs ko alag roots wale do MSTP instances mein map karne ke baad dono uplinks lagbhag aadha-aadha load lene lage aur failover time wahi raha.</p><p><b>Lesson:</b> single-tree STP mein blocked port bekaar kharcha hai; multiple trees loop protection hataye bina use wapas dilate hain.</p></div>

<div class="iv"><p class="q">"Campus mein RSTP ki jagah MSTP kyun use karoge?"</p><p>RSTP saare VLANs ke liye ek tree banata hai, isliye har access switch ka ek uplink hamesha blocked hai. MSTP VLANs ke groups ko kuch instances mein map karta hai, har ka apna root, to uplinks load share ho sakte hain aur loop-free bhi rehte hain, aur VLAN count kitna bhi ho trees ki sankhya chhoti rehti hai. Region parameters ka aur yeh ki unmapped VLANs CIST par chalte hain, zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSTP mein ek tree hai; har VLAN ke liye access switch ka ek uplink blocked rehta hai.</li>
<li>MSTP: VLANs instances (MSTI) mein map hote hain; har instance ka apna root aur port roles.</li>
<li>VSTP: har VLAN ka ek rapid tree, doosre vendors ke per-VLAN trees ke saath interoperable.</li>
<li>Dono RSTP niyam rakhte hain: lowest bridge ID jeetta hai, 1G = 20000, priority 4096 ke steps mein.</li>
<li>Load sharing = har tree ka alag root.</li>
</ul></div>
`}};export{e as default};