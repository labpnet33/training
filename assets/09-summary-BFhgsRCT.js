var e={id:`summary`,h:{en:`Summary and exam checklist: planning and design`,hi:`Summary aur exam checklist: planning aur design`},body:{en:`
<p>This chapter pulls the module together. Use it the night before the exam and as a template for real design documents. Remember the honest note from chapter 1: there are no simulator labs for this module, so the practice is on paper. Take the Harbor Foods story and redo the design for a different company with different numbers; if you can do that without looking, you know the module.</p>
<h3>Can-do checklist</h3>
<ul>
<li>I can name the three ION families (branch hardware, data center hardware, virtual) and choose a model from throughput, ports and special features.</li>
<li>I can explain the data center subscription and the three branch licence models (per-device, per-site, aggregate), the S, M, L tiers, what is included and the 1 to 5 year term.</li>
<li>I can run an assessment of sites, circuits, applications, LAN, routing, security, NAT and management.</li>
<li>I can compute hub bandwidth with peaks, concurrency factor, overhead, growth and failure case.</li>
<li>I can design a data center site: internet-facing port, network-peering port, routing, return routes, DC-to-DC fabric links, Prisma Access connection.</li>
<li>I can pick one of five branch patterns and justify circuits, LTE or 5G and breakout.</li>
<li>I can describe HA groups, priorities, tracking and bypass pairs and compute failover arithmetic.</li>
<li>I can write a zone matrix, bind zones to interfaces and say what ZBFW can and cannot do.</li>
<li>I can run the ten-step design review.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Design summary map">
<rect x="10" y="10" width="200" height="60" rx="10" fill="#bae6fd"/><text x="110" y="36" text-anchor="middle" class="svg-ink" font-size="13">Assess</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="11">sites, circuits, apps, LAN</text>
<rect x="220" y="10" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Size and license</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="11">ION model, tiers, DC sub</text>
<rect x="430" y="10" width="200" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="36" text-anchor="middle" class="svg-ink" font-size="13">Topology</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="11">DC, branch, overlay</text>
<rect x="10" y="90" width="200" height="60" rx="10" fill="#fde68a"/><text x="110" y="116" text-anchor="middle" class="svg-ink" font-size="13">High availability</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="11">links, HA group, bypass</text>
<rect x="220" y="90" width="200" height="60" rx="10" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="11">zones, matrix, segments</text>
<rect x="430" y="90" width="200" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="11">next module</text>
<rect x="10" y="170" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Review: ten-step checklist before sign-off, and when a design fails</text>
</svg><p class="cap">The module on one page.</p></div>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>ION</dt><dd>Instant-On Network device, the Prisma SD-WAN edge device (physical or virtual).</dd>
<dt>Data center site</dt><dd>A hub site that terminates branch tunnels and connects to the core network.</dd>
<dt>Circuit</dt><dd>A WAN connection with a category (public or private) and a label.</dd>
<dt>ZBFW</dt><dd>Zone-based firewall built into the ION.</dd>
<dt>HA group</dt><dd>Two IONs in active/backup, with priorities and tracking.</dd>
<dt>Bypass pair</dt><dd>A LAN port and WAN port pair (hardware or virtual) used for pass-through and HA topologies.</dd>
<dt>Aggregate bandwidth</dt><dd>A licence pool in Mbps shared across all branch sites.</dd>
<dt>Secure fabric link</dt><dd>A secure tunnel between ION devices, including DC-to-DC links.</dd>
<dt>Analytics, Control, Disabled</dt><dd>The three deployment modes of a device or site.</dd>
<dt>Standard VPN</dt><dd>An IPsec tunnel to a non-ION endpoint.</dd>
</dl>
<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Data center ION models</td><td>5200, 7000, 9000, 9200 in the documentation; virtual 7108V and larger</td></tr>
<tr><td>DC ION interfaces</td><td>An internet-facing port for public VPNs and a network-peering port toward the core</td></tr>
<tr><td>DC licence</td><td>One DC subscription per ION at a data center site, physical or virtual</td></tr>
<tr><td>Branch licence</td><td>Per-device (ZBFW included; WCR and DVR optional), per-site (ZBFW, DVR, WCR included), aggregate (ZBFW, WCR, DVR included)</td></tr>
<tr><td>Tiers</td><td>S up to 25, M up to 250, L up to 2,500 Mbps; term 1 to 5 years</td></tr>
<tr><td>DC-to-DC links</td><td>Secure fabric links, 6.5.1 or later, under Data Centers, Overlay Connections</td></tr>
<tr><td>HA</td><td>Max 2 devices, active/backup, priority 1 to 254, gap at least 40, track up to 4 interfaces</td></tr>
<tr><td>HA caution</td><td>Do not track L3 on private WAN with BGP or on a shared circuit</td></tr>
<tr><td>Bypass pair</td><td>Hardware or virtual; branch IONs only; not on controller interfaces</td></tr>
<tr><td>Overlays</td><td>Direct, Prisma SD-WAN VPN, Standard VPN</td></tr>
<tr><td>Security</td><td>Three non-editable default rules per set; one stack per site; up to four sets in an advanced stack</td></tr>
<tr><td>Modes</td><td>Analytics (observe), Control (enforce), Disabled (pass-through)</td></tr></table>
<h3>Reference commands and portal paths (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! ION CLI commands named in the HA documentation (no sample output shown)</span>
dump spoke ha config
dump spoke ha status</pre>
<p>Portal paths named in the documentation: Configuration, Prisma SD-WAN, Data Centers, Add Site; and Configuration, Prisma SD-WAN, Data Centers, Overlay Connections, Add Secure Fabric Link. Both are portal walk-throughs (not run in the simulator).</p>
<div class="exam"><p><b>Top exam traps.</b> (1) Sizing by interface speed instead of encrypted throughput. (2) Forgetting the DC subscription or the second device in HA. (3) Calling Prisma SD-WAN HA active/active. (4) A tracking reduction that is smaller than the priority gap. (5) A zone not bound to an interface. (6) Counting two circuits from one provider as diverse. (7) Forgetting return routes from the core to branch prefixes. (8) Mixing PAN-OS firewall HA with ION HA.</p></div>
<div class="warn"><p><b>Common mistake.</b> Memorising model numbers. Names and figures change; the exam rewards the logic of matching requirements to features. Keep the datasheet open while you practise and learn which column answers which requirement.</p></div>
<div class="scn"><h4>A design that passed review</h4><p>A logistics company with 3 data centers and 80 branches used the ten-step review as a gate. Step 3 found no licence for the standby IONs at 14 HA sites, step 6 found an HA gap of 15 with a tracking reduction of 20 (inconsistent), and step 7 found no return route at one DC. All three were fixed on paper, so the cutover weekend had no surprises.</p><p><b>Lesson:</b> the checklist is cheap; the cut-over weekend is expensive.</p></div>
<div class="iv"><p class="q">"Walk me through your approach to a Prisma SD-WAN design in two minutes."</p><p>Assess requirements and the existing network; size ION devices and bandwidth with peak, overhead, growth and failure case; choose licensing; design data centers (internet and peering ports, DC-to-DC links, Prisma Access), branches (patterns, diverse circuits, HA and bypass) and overlays; write security zones and segmentation; hand over to policy design; and run a review checklist before a phased rollout through Analytics mode.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design order: assess, size, license, topology and HA, security, policy, review.</li>
<li>Know the licence structure, HA numbers and DC interface roles precisely; these are exam favourites.</li>
<li>Check every claim against current documentation; models and tiers change.</li>
<li>No simulator labs: practise by redoing the Harbor Foods design with new numbers.</li>
<li>Next: the policy design module (psd-policy), then deployment and routing.</li>
</ul></div>
`,hi:`
<p>Yeh chapter module ko ek saath jodta hai. Ise exam se pehli raat aur real design documents ke template ki tarah use karo. Chapter 1 ka imaandaar note yaad rakho: is module ke liye simulator labs nahi hain, isliye practice paper par hai. Harbor Foods ki story lo aur alag company aur alag numbers ke saath design dobara karo; agar yeh bina dekhe kar sako to aapko module aata hai.</p>
<h3>Can-do checklist</h3>
<ul>
<li>Main teen ION families (branch hardware, data center hardware, virtual) ke naam bata sakta hoon aur throughput, ports aur special features se model chun sakta hoon.</li>
<li>Main data center subscription aur teen branch licence models (per-device, per-site, aggregate), S, M, L tiers, kya included hai aur 1 se 5 saal ka term samjha sakta hoon.</li>
<li>Main sites, circuits, applications, LAN, routing, security, NAT aur management ka assessment kar sakta hoon.</li>
<li>Main peaks, concurrency factor, overhead, growth aur failure case ke saath hub bandwidth nikaal sakta hoon.</li>
<li>Main data center site design kar sakta hoon: internet-facing port, network-peering port, routing, return routes, DC-to-DC fabric links, Prisma Access connection.</li>
<li>Main paanch branch patterns mein se ek chun kar circuits, LTE ya 5G aur breakout justify kar sakta hoon.</li>
<li>Main HA groups, priorities, tracking aur bypass pairs describe kar sakta hoon aur failover arithmetic nikaal sakta hoon.</li>
<li>Main zone matrix likh sakta hoon, zones ko interfaces se bind kar sakta hoon aur bata sakta hoon ki ZBFW kya kar sakta hai aur kya nahi.</li>
<li>Main das-step design review chala sakta hoon.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Design summary map">
<rect x="10" y="10" width="200" height="60" rx="10" fill="#bae6fd"/><text x="110" y="36" text-anchor="middle" class="svg-ink" font-size="13">Assess</text><text x="110" y="54" text-anchor="middle" class="svg-muted" font-size="11">sites, circuits, apps, LAN</text>
<rect x="220" y="10" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">Size aur license</text><text x="320" y="54" text-anchor="middle" class="svg-muted" font-size="11">ION model, tiers, DC sub</text>
<rect x="430" y="10" width="200" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="36" text-anchor="middle" class="svg-ink" font-size="13">Topology</text><text x="530" y="54" text-anchor="middle" class="svg-muted" font-size="11">DC, branch, overlay</text>
<rect x="10" y="90" width="200" height="60" rx="10" fill="#fde68a"/><text x="110" y="116" text-anchor="middle" class="svg-ink" font-size="13">High availability</text><text x="110" y="134" text-anchor="middle" class="svg-muted" font-size="11">links, HA group, bypass</text>
<rect x="220" y="90" width="200" height="60" rx="10" fill="#fed7aa"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">Security</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="11">zones, matrix, segments</text>
<rect x="430" y="90" width="200" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="116" text-anchor="middle" class="svg-ink" font-size="13">Policy</text><text x="530" y="134" text-anchor="middle" class="svg-muted" font-size="11">agla module</text>
<rect x="10" y="170" width="620" height="50" rx="10" fill="#e2e8f0"/><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">Review: sign-off se pehle das-step checklist, aur jab design fail ho</text>
</svg><p class="cap">Module ek page par.</p></div>
<h3>Mini glossary</h3>
<dl class="terms">
<dt>ION</dt><dd>Instant-On Network device, Prisma SD-WAN edge device (physical ya virtual).</dd>
<dt>Data center site</dt><dd>Hub site jo branch tunnels terminate karti hai aur core network se judti hai.</dd>
<dt>Circuit</dt><dd>Category (public ya private) aur label wala WAN connection.</dd>
<dt>ZBFW</dt><dd>ION mein built-in zone-based firewall.</dd>
<dt>HA group</dt><dd>Priorities aur tracking ke saath active/backup mein do IONs.</dd>
<dt>Bypass pair</dt><dd>LAN port aur WAN port ki jodi (hardware ya virtual) jo pass-through aur HA topologies mein use hoti hai.</dd>
<dt>Aggregate bandwidth</dt><dd>Saare branch sites mein shared Mbps ka licence pool.</dd>
<dt>Secure fabric link</dt><dd>ION devices ke beech secure tunnel, DC-to-DC links sahit.</dd>
<dt>Analytics, Control, Disabled</dt><dd>Device ya site ke teen deployment modes.</dd>
<dt>Standard VPN</dt><dd>Non-ION endpoint tak IPsec tunnel.</dd>
</dl>
<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Data center ION models</td><td>Documentation mein 5200, 7000, 9000, 9200; virtual 7108V aur bade</td></tr>
<tr><td>DC ION interfaces</td><td>Public VPNs ke liye internet-facing port aur core ki taraf network-peering port</td></tr>
<tr><td>DC licence</td><td>Data center site par har ION ke liye ek DC subscription, physical ya virtual</td></tr>
<tr><td>Branch licence</td><td>Per-device (ZBFW included; WCR aur DVR optional), per-site (ZBFW, DVR, WCR included), aggregate (ZBFW, WCR, DVR included)</td></tr>
<tr><td>Tiers</td><td>S 25 tak, M 250 tak, L 2,500 Mbps tak; term 1 se 5 saal</td></tr>
<tr><td>DC-to-DC links</td><td>Secure fabric links, 6.5.1 ya baad, Data Centers, Overlay Connections ke under</td></tr>
<tr><td>HA</td><td>Max 2 devices, active/backup, priority 1 se 254, gap kam se kam 40, 4 interfaces tak track</td></tr>
<tr><td>HA caution</td><td>BGP wale private WAN ya shared circuit par L3 track mat karo</td></tr>
<tr><td>Bypass pair</td><td>Hardware ya virtual; sirf branch IONs; controller interfaces par nahi</td></tr>
<tr><td>Overlays</td><td>Direct, Prisma SD-WAN VPN, Standard VPN</td></tr>
<tr><td>Security</td><td>Har set mein teen non-editable default rules; har site par ek stack; advanced stack mein chaar tak sets</td></tr>
<tr><td>Modes</td><td>Analytics (observe), Control (enforce), Disabled (pass-through)</td></tr></table>
<h3>Reference commands aur portal paths (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! HA documentation mein naam diye gaye ION CLI commands (sample output nahi dikhaya)</span>
dump spoke ha config
dump spoke ha status</pre>
<p>Documentation mein naam diye gaye portal paths: Configuration, Prisma SD-WAN, Data Centers, Add Site; aur Configuration, Prisma SD-WAN, Data Centers, Overlay Connections, Add Secure Fabric Link. Dono portal walk-throughs hain (not run in the simulator).</p>
<div class="exam"><p><b>Top exam traps.</b> (1) Encrypted throughput ki jagah interface speed se size karna. (2) DC subscription ya HA mein doosra device bhool jaana. (3) Prisma SD-WAN HA ko active/active kehna. (4) Tracking reduction jo priority gap se chhota hai. (5) Zone jo interface se bound nahi hai. (6) Ek hi provider ke do circuits ko diverse ginna. (7) Core se branch prefixes ke return routes bhool jaana. (8) PAN-OS firewall HA ko ION HA ke saath mix karna.</p></div>
<div class="warn"><p><b>Common galti.</b> Model numbers ratna. Naam aur figures badalte hain; exam requirements ko features se match karne ke logic ko reward karta hai. Practice karte waqt datasheet khuli rakho aur seekho ki kaunsa column kaunsi requirement ka jawab deta hai.</p></div>
<div class="scn"><h4>Design jo review mein pass hua</h4><p>3 data centers aur 80 branches wali logistics company ne das-step review ko gate ki tarah use kiya. Step 3 mein 14 HA sites par standby IONs ka licence nahi mila, step 6 mein HA gap 15 aur tracking reduction 20 mila (inconsistent), aur step 7 mein ek DC par return route nahi mila. Teeno paper par theek ho gaye, isliye cut-over weekend mein koi surprise nahi hua.</p><p><b>Seekh:</b> checklist sasti hai; cut-over weekend mehnga.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN design ka apna approach do minute mein samjhao."</p><p>Requirements aur existing network assess karo; peak, overhead, growth aur failure case ke saath ION devices aur bandwidth size karo; licensing chuno; data centers (internet aur peering ports, DC-to-DC links, Prisma Access), branches (patterns, diverse circuits, HA aur bypass) aur overlays design karo; security zones aur segmentation likho; policy design ko hand over karo; aur Analytics mode se phased rollout se pehle review checklist chalao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design order: assess, size, license, topology aur HA, security, policy, review.</li>
<li>Licence structure, HA numbers aur DC interface roles exactly yaad rakho; yeh exam ke favourites hain.</li>
<li>Har claim current documentation se check karo; models aur tiers badalte hain.</li>
<li>Simulator labs nahi hain: Harbor Foods design ko naye numbers ke saath dobara karke practice karo.</li>
<li>Agla: policy design module (psd-policy), phir deployment aur routing.</li>
</ul></div>
`}};export{e as default};