var e={id:`stp-flavours`,h:{en:`STP history and flavours: 802.1D to Rapid PVST+ and MST`,hi:`STP ka itihaas aur flavours: 802.1D se Rapid PVST+ aur MST tak`},body:{en:`
<p>Spanning tree is like the Indian railway timetable: the basic idea has not changed in decades, but the trains have become much faster and there are now separate timetables for different routes. Every "flavour" of STP uses the same election logic you will learn in chapters 4 to 6. What changes is <b>how fast</b> it converges and <b>how many trees</b> it builds.</p>

<h3>The family tree</h3>
<dl class="terms">
<dt>802.1D STP (classic)</dt><dd>The original IEEE standard, based on Radia Perlman's algorithm from 1985. One spanning tree for the whole switched network. Ports move through timer-driven states (blocking, listening, learning, forwarding), so convergence takes <b>30 to 50 seconds</b>.</dd>
<dt>CST (Common Spanning Tree)</dt><dd>When VLANs arrived, IEEE 802.1Q specified <b>one</b> tree shared by all VLANs. Simple and light, but every VLAN blocks the same links, so half your uplink bandwidth sits idle.</dd>
<dt>PVST+ (Per-VLAN Spanning Tree Plus)</dt><dd>Cisco's answer: run a <b>separate 802.1D instance per VLAN</b> over 802.1Q trunks. Each VLAN can have a different root and block a different link, so you can load-share. Convergence is still 802.1D speed. (Plain PVST was the older ISL-only version.)</dd>
<dt>802.1w RSTP (Rapid STP)</dt><dd>Published in 2001 and later folded into 802.1D-2004. Same election, new port roles (alternate, backup), fewer states, and a handshake called proposal/agreement that converges in about <b>a second</b> on point-to-point links.</dd>
<dt>Rapid PVST+</dt><dd>Cisco's per-VLAN version of RSTP: one RSTP instance per VLAN. This is what the CCNA exam focuses on and what you configure in the lab.</dd>
<dt>802.1s MST (Multiple Spanning Tree)</dt><dd>Later folded into 802.1Q-2005. Uses RSTP mechanics but maps many VLANs to a small number of <b>instances</b>, for example VLANs 1-500 to instance 1 and 501-1000 to instance 2. Switches that agree on the region name, revision number and VLAN-to-instance map form an <b>MST region</b>. MST scales far better than per-VLAN STP and is the usual choice between vendors; its configuration is a CCNP topic.</dd>
</dl>

<table class="cmp"><tr><th>Flavour</th><th>Standard</th><th>Trees</th><th>Convergence</th><th>IOS mode keyword</th></tr>
<tr><td>STP</td><td>IEEE 802.1D</td><td>1 (CST)</td><td>30 to 50 s</td><td>(not offered alone)</td></tr>
<tr><td>PVST+</td><td>Cisco</td><td>1 per VLAN</td><td>30 to 50 s</td><td><code>pvst</code></td></tr>
<tr><td>RSTP</td><td>IEEE 802.1w</td><td>1</td><td>about 1 s</td><td>(runs inside rapid-pvst or mst)</td></tr>
<tr><td>Rapid PVST+</td><td>Cisco</td><td>1 per VLAN</td><td>about 1 s</td><td><code>rapid-pvst</code></td></tr>
<tr><td>MST</td><td>IEEE 802.1s</td><td>1 per instance</td><td>about 1 s</td><td><code>mst</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Timeline of STP flavours">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="3"/>
<rect x="30" y="40" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1D</text><text x="85" y="77" text-anchor="middle" class="svg-muted" font-size="12">one tree, slow</text>
<rect x="150" y="134" width="110" height="46" rx="8" fill="#fde68a"/><text x="205" y="154" text-anchor="middle" class="svg-ink" font-size="13">PVST+</text><text x="205" y="171" text-anchor="middle" class="svg-muted" font-size="12">per VLAN, slow</text>
<rect x="270" y="40" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1w RSTP</text><text x="325" y="77" text-anchor="middle" class="svg-muted" font-size="12">one tree, fast</text>
<rect x="390" y="134" width="110" height="46" rx="8" fill="#bae6fd"/><text x="445" y="154" text-anchor="middle" class="svg-ink" font-size="13">Rapid PVST+</text><text x="445" y="171" text-anchor="middle" class="svg-muted" font-size="12">per VLAN, fast</text>
<rect x="510" y="40" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="565" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1s MST</text><text x="565" y="77" text-anchor="middle" class="svg-muted" font-size="12">per instance, fast</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">same election logic in all of them</text>
</svg><p class="cap">Each step either made STP faster (RSTP) or gave it more trees (per VLAN, per instance).</p></div>

<h3>Why per-VLAN trees matter</h3>
<p>In the lab, SW3 has two uplinks. With one shared tree, one of those uplinks blocks for <b>all</b> VLANs. With Rapid PVST+ you can make SW1 the root for VLAN 10 and SW2 the root for VLAN 20: VLAN 10 blocks the uplink to SW2 and VLAN 20 blocks the uplink to SW1, so both links carry traffic. The price is CPU and memory: 200 VLANs on a trunk means 200 instances, each sending BPDUs every 2 seconds. Every Catalyst model has a limit on spanning-tree instances; beyond it, MST is the answer.</p>

<h3>Choosing and checking the mode</h3>
<pre class="code"><span class="c">! Pick one mode, the same on every switch in the domain</span>
SW1(config)# spanning-tree mode rapid-pvst
<span class="c">! Other options: spanning-tree mode pvst | mst</span></pre>
<pre class="out">SW1# show spanning-tree summary
<span class="hl">Switch is in rapid-pvst mode</span>
Root bridge for: none
Extended system ID                      is enabled
Portfast Default                        is disabled
...</pre>
<p>Older Catalyst models (2960, 3750) default to <b>PVST+</b>; the Catalyst 9000 family on IOS XE defaults to <b>Rapid PVST+</b>. Never assume; always check the summary line.</p>

<h3>Mixing flavours</h3>
<p>RSTP is backward compatible. A Rapid PVST+ port that receives 802.1D (version 0) BPDUs from a PVST+ neighbour falls back to 802.1D behaviour <b>on that port only</b>, and <code>show spanning-tree</code> marks it with <code>Peer(STP)</code> in the Type column. The network works, but that port converges at 30 to 50 seconds. PVST+ BPDUs for VLANs other than the native VLAN are sent to Cisco's multicast MAC <b>0100.0ccc.cccd</b> with an 802.1Q tag; IEEE BPDUs use <b>0180.c200.0000</b>. That is why a non-Cisco switch running plain RSTP or MST sees only one tree.</p>

<div class="eg"><p><b>Worked example.</b> A company has 40 VLANs and three access switches. With PVST+, a failed uplink leaves users waiting up to 50 seconds: 20 s max age, 15 s listening, 15 s learning. After changing every switch to <code>spanning-tree mode rapid-pvst</code>, the same failure is repaired in under a second because SW3's alternate port becomes the root port immediately. The number of instances (40) is unchanged, so CPU load is the same; only the speed improves.</p></div>

<div class="warn"><p><b>Common mistake.</b> Changing the mode on one switch in production and forgetting the others. Rapid PVST+ still interoperates, but the ports facing the old switch keep 802.1D timers, and people wonder why failover is "sometimes fast, sometimes 50 seconds".</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the names to the numbers: 802.1D = STP, 802.1w = RSTP, 802.1s = MST. PVST+ and Rapid PVST+ are Cisco proprietary. The CCNA blueprint names <b>Rapid PVST+</b>; expect <code>show spanning-tree</code> output that says <code>Spanning tree enabled protocol rstp</code>. A switch in PVST+ mode shows <code>protocol ieee</code>.</p></div>

<div class="scn"><h4>Fast most of the time</h4><p>After a core refresh, a retailer noticed that failover tests took under a second on most floors but 45 seconds on the third floor. <code>show spanning-tree vlan 10</code> on the distribution switch showed the third-floor downlink as <code>P2p Peer(STP)</code>. The old third-floor access switch had been left in PVST+ mode. Changing it to rapid-pvst removed the Peer(STP) flag and the next test converged in a second.</p><p><b>Lesson:</b> RSTP speed needs RSTP on both ends of each link; Peer(STP) in the Type column is the clue.</p></div>

<div class="iv"><p class="q">"What is the difference between PVST+, Rapid PVST+ and MST?"</p><p>Strong answer: PVST+ runs one classic 802.1D instance per VLAN, so it allows per-VLAN root placement but converges in 30 to 50 seconds. Rapid PVST+ runs one 802.1w RSTP instance per VLAN, keeping per-VLAN load sharing and converging in about a second. MST (802.1s) also uses RSTP mechanics but groups many VLANs into a few instances inside a region, so it scales better and interoperates between vendors. Mention the mode commands and that Rapid PVST+ is the CCNA focus.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D (STP), 802.1w (RSTP) and 802.1s (MST) are IEEE; PVST+ and Rapid PVST+ are Cisco.</li>
<li>Per-VLAN flavours let each VLAN pick its own root and blocked link, enabling load sharing.</li>
<li>RSTP-based flavours converge in about a second; 802.1D-based ones take 30 to 50 seconds.</li>
<li>Configure with <code>spanning-tree mode pvst | rapid-pvst | mst</code>; verify with <code>show spanning-tree summary</code>.</li>
<li>Peer(STP) on a Rapid PVST+ port means the neighbour speaks 802.1D and that port loses fast convergence.</li>
</ul></div>
`,hi:`
<p>Spanning tree Indian railway timetable jaisa hai: basic idea decades se nahi badla, lekin trains bahut tez ho gayi hain aur ab alag routes ke liye alag timetables hain. STP ka har "flavour" wahi election logic use karta hai jo aap chapters 4 se 6 mein seekhoge. Jo badalta hai woh hai ki woh <b>kitni tezi</b> se converge karta hai aur <b>kitne trees</b> banata hai.</p>

<h3>Family tree</h3>
<dl class="terms">
<dt>802.1D STP (classic)</dt><dd>Original IEEE standard, Radia Perlman ke 1985 ke algorithm par based. Poore switched network ke liye ek spanning tree. Ports timer-driven states (blocking, listening, learning, forwarding) se guzarte hain, isliye convergence mein <b>30 se 50 second</b> lagte hain.</dd>
<dt>CST (Common Spanning Tree)</dt><dd>Jab VLANs aaye, IEEE 802.1Q ne saare VLANs ke liye <b>ek</b> shared tree specify kiya. Simple aur halka, lekin har VLAN same links block karta hai, isliye aapki aadhi uplink bandwidth khaali padi rehti hai.</dd>
<dt>PVST+ (Per-VLAN Spanning Tree Plus)</dt><dd>Cisco ka jawab: 802.1Q trunks par <b>har VLAN ke liye alag 802.1D instance</b> chalao. Har VLAN ka alag root ho sakta hai aur woh alag link block kar sakta hai, isliye aap load-share kar sakte ho. Convergence abhi bhi 802.1D speed ki hai. (Plain PVST purana ISL-only version tha.)</dd>
<dt>802.1w RSTP (Rapid STP)</dt><dd>2001 mein publish hua aur baad mein 802.1D-2004 mein mila diya gaya. Same election, naye port roles (alternate, backup), kam states, aur proposal/agreement naam ka handshake jo point-to-point links par lagbhag <b>ek second</b> mein converge karta hai.</dd>
<dt>Rapid PVST+</dt><dd>RSTP ka Cisco per-VLAN version: har VLAN ke liye ek RSTP instance. CCNA exam isi par focus karta hai aur lab mein aap yahi configure karte ho.</dd>
<dt>802.1s MST (Multiple Spanning Tree)</dt><dd>Baad mein 802.1Q-2005 mein mila diya gaya. RSTP mechanics use karta hai lekin bahut saare VLANs ko kam <b>instances</b> mein map karta hai, jaise VLANs 1-500 instance 1 mein aur 501-1000 instance 2 mein. Jo switches region name, revision number aur VLAN-to-instance map par agree karte hain woh ek <b>MST region</b> banate hain. MST per-VLAN STP se kahin better scale karta hai aur vendors ke beech aam choice hai; iska configuration CCNP topic hai.</dd>
</dl>

<table class="cmp"><tr><th>Flavour</th><th>Standard</th><th>Trees</th><th>Convergence</th><th>IOS mode keyword</th></tr>
<tr><td>STP</td><td>IEEE 802.1D</td><td>1 (CST)</td><td>30 se 50 s</td><td>(akele offer nahi hota)</td></tr>
<tr><td>PVST+</td><td>Cisco</td><td>har VLAN ka 1</td><td>30 se 50 s</td><td><code>pvst</code></td></tr>
<tr><td>RSTP</td><td>IEEE 802.1w</td><td>1</td><td>lagbhag 1 s</td><td>(rapid-pvst ya mst ke andar chalta hai)</td></tr>
<tr><td>Rapid PVST+</td><td>Cisco</td><td>har VLAN ka 1</td><td>lagbhag 1 s</td><td><code>rapid-pvst</code></td></tr>
<tr><td>MST</td><td>IEEE 802.1s</td><td>har instance ka 1</td><td>lagbhag 1 s</td><td><code>mst</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="STP flavours ki timeline">
<line x1="30" y1="110" x2="610" y2="110" stroke="#64748b" stroke-width="3"/>
<rect x="30" y="40" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1D</text><text x="85" y="77" text-anchor="middle" class="svg-muted" font-size="12">ek tree, slow</text>
<rect x="150" y="134" width="110" height="46" rx="8" fill="#fde68a"/><text x="205" y="154" text-anchor="middle" class="svg-ink" font-size="13">PVST+</text><text x="205" y="171" text-anchor="middle" class="svg-muted" font-size="12">per VLAN, slow</text>
<rect x="270" y="40" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1w RSTP</text><text x="325" y="77" text-anchor="middle" class="svg-muted" font-size="12">ek tree, fast</text>
<rect x="390" y="134" width="110" height="46" rx="8" fill="#bae6fd"/><text x="445" y="154" text-anchor="middle" class="svg-ink" font-size="13">Rapid PVST+</text><text x="445" y="171" text-anchor="middle" class="svg-muted" font-size="12">per VLAN, fast</text>
<rect x="510" y="40" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="565" y="60" text-anchor="middle" class="svg-ink" font-size="13">802.1s MST</text><text x="565" y="77" text-anchor="middle" class="svg-muted" font-size="12">per instance, fast</text>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">sab mein same election logic</text>
</svg><p class="cap">Har step ne ya to STP ko tez banaya (RSTP) ya use zyada trees diye (per VLAN, per instance).</p></div>

<h3>Per-VLAN trees kyun matter karte hain</h3>
<p>Lab mein SW3 ke do uplinks hain. Ek shared tree ke saath unmein se ek uplink <b>saare</b> VLANs ke liye block hota hai. Rapid PVST+ ke saath aap SW1 ko VLAN 10 ka root aur SW2 ko VLAN 20 ka root bana sakte ho: VLAN 10 SW2 wala uplink block karta hai aur VLAN 20 SW1 wala uplink block karta hai, isliye dono links traffic le jaate hain. Keemat hai CPU aur memory: trunk par 200 VLANs matlab 200 instances, har ek har 2 second BPDUs bhejta hai. Har Catalyst model ki spanning-tree instances ki ek limit hoti hai; usse aage MST jawab hai.</p>

<h3>Mode chunna aur check karna</h3>
<pre class="code"><span class="c">! Ek mode chuno, domain ke har switch par same</span>
SW1(config)# spanning-tree mode rapid-pvst
<span class="c">! Doosre options: spanning-tree mode pvst | mst</span></pre>
<pre class="out">SW1# show spanning-tree summary
<span class="hl">Switch is in rapid-pvst mode</span>
Root bridge for: none
Extended system ID                      is enabled
Portfast Default                        is disabled
...</pre>
<p>Purane Catalyst models (2960, 3750) ka default <b>PVST+</b> hai; IOS XE par Catalyst 9000 family ka default <b>Rapid PVST+</b> hai. Kabhi assume mat karo; hamesha summary line check karo.</p>

<h3>Flavours mix karna</h3>
<p>RSTP backward compatible hai. Jo Rapid PVST+ port PVST+ neighbour se 802.1D (version 0) BPDUs receive karta hai, woh <b>sirf us port par</b> 802.1D behaviour par aa jaata hai, aur <code>show spanning-tree</code> Type column mein use <code>Peer(STP)</code> se mark karta hai. Network chalta hai, lekin woh port 30 se 50 second mein converge karta hai. Native VLAN ke alawa baaki VLANs ke PVST+ BPDUs Cisco ke multicast MAC <b>0100.0ccc.cccd</b> par 802.1Q tag ke saath bheje jaate hain; IEEE BPDUs <b>0180.c200.0000</b> use karte hain. Isiliye plain RSTP ya MST chalane wale non-Cisco switch ko sirf ek tree dikhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke 40 VLANs aur teen access switches hain. PVST+ ke saath failed uplink users ko 50 second tak wait karwata hai: 20 s max age, 15 s listening, 15 s learning. Har switch ko <code>spanning-tree mode rapid-pvst</code> par badalne ke baad wahi failure ek second se kam mein repair hota hai kyunki SW3 ka alternate port turant root port ban jaata hai. Instances ki ginti (40) same rehti hai, isliye CPU load same hai; sirf speed improve hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Production mein ek switch par mode badalna aur baaki bhool jaana. Rapid PVST+ phir bhi interoperate karta hai, lekin purane switch ki taraf wale ports 802.1D timers rakhte hain, aur log sochte hain ki failover "kabhi fast, kabhi 50 second" kyun hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Naam aur numbers match karo: 802.1D = STP, 802.1w = RSTP, 802.1s = MST. PVST+ aur Rapid PVST+ Cisco proprietary hain. CCNA blueprint <b>Rapid PVST+</b> ka naam leta hai; aisa <code>show spanning-tree</code> output expect karo jo <code>Spanning tree enabled protocol rstp</code> kehta hai. PVST+ mode wala switch <code>protocol ieee</code> dikhata hai.</p></div>

<div class="scn"><h4>Zyada tar time fast</h4><p>Core refresh ke baad ek retailer ne dekha ki failover tests zyada tar floors par ek second se kam lete the lekin teesre floor par 45 second. Distribution switch par <code>show spanning-tree vlan 10</code> ne teesre floor ka downlink <code>P2p Peer(STP)</code> dikhaya. Teesre floor ka purana access switch PVST+ mode mein chhoda gaya tha. Use rapid-pvst par badalne se Peer(STP) flag hat gaya aur agla test ek second mein converge hua.</p><p><b>Seekh:</b> RSTP speed ke liye har link ke dono ends par RSTP chahiye; Type column mein Peer(STP) clue hai.</p></div>

<div class="iv"><p class="q">"PVST+, Rapid PVST+ aur MST mein kya fark hai?"</p><p>Strong answer: PVST+ har VLAN ke liye ek classic 802.1D instance chalata hai, isliye per-VLAN root placement allow karta hai lekin 30 se 50 second mein converge karta hai. Rapid PVST+ har VLAN ke liye ek 802.1w RSTP instance chalata hai, per-VLAN load sharing rakhta hai aur lagbhag ek second mein converge karta hai. MST (802.1s) bhi RSTP mechanics use karta hai lekin region ke andar bahut saare VLANs ko kuch instances mein group karta hai, isliye better scale karta hai aur vendors ke beech interoperate karta hai. Mode commands batao aur yeh ki CCNA focus Rapid PVST+ hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D (STP), 802.1w (RSTP) aur 802.1s (MST) IEEE hain; PVST+ aur Rapid PVST+ Cisco hain.</li>
<li>Per-VLAN flavours har VLAN ko apna root aur blocked link chunne dete hain, jisse load sharing possible hai.</li>
<li>RSTP-based flavours lagbhag ek second mein converge karte hain; 802.1D-based 30 se 50 second lete hain.</li>
<li><code>spanning-tree mode pvst | rapid-pvst | mst</code> se configure karo; <code>show spanning-tree summary</code> se verify karo.</li>
<li>Rapid PVST+ port par Peer(STP) ka matlab neighbour 802.1D bolta hai aur woh port fast convergence kho deta hai.</li>
</ul></div>
`}};export{e as default};