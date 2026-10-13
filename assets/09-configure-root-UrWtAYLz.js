var e={id:`configure-root`,h:{en:`Configuring the root, per-VLAN load sharing and cost tuning`,hi:`Root configure karna, per-VLAN load sharing aur cost tuning`},body:{en:`
<p>A wedding planner does not let guests seat themselves and hope the family ends up at the right table. She decides the head table first, then arranges everyone else around it. Spanning tree is the same: if you leave the root to chance, the oldest switch with the lowest MAC is the head table. In this chapter you decide it, and then fine-tune which links carry traffic.</p>

<h3>Where the root should be</h3>
<ul>
<li>On a <b>distribution or core</b> switch, never on an access switch.</li>
<li>Where the VLAN's <b>default gateway</b> lives (the SVI or the active HSRP router), so the Layer 2 path and the Layer 3 path agree.</li>
<li>With a planned <b>secondary</b> root, so that if the primary fails the tree re-forms around another strong switch, not around a random access switch.</li>
<li>With roots <b>split</b> across VLANs when you have two distribution switches, so both uplinks of every access switch carry traffic.</li>
</ul>

<h3>Two ways to set the root</h3>
<pre class="code"><span class="c">! Method 1: the macro (calculates a priority once)</span>
SW1(config)# spanning-tree mode rapid-pvst
SW1(config)# spanning-tree vlan 10 root primary
SW1(config)# spanning-tree vlan 20 root secondary

<span class="c">! Method 2: an explicit priority (multiple of 4096)</span>
SW2(config)# spanning-tree mode rapid-pvst
SW2(config)# spanning-tree vlan 20 priority 24576
SW2(config)# spanning-tree vlan 10 priority 28672</pre>
<ul>
<li><code>root primary</code> sets the priority to <b>24576</b>. If a current root already has a priority at or below 24576, it instead sets <b>4096 less</b> than that root's priority.</li>
<li><code>root secondary</code> sets <b>28672</b>: better than the default 32768 but worse than the primary.</li>
<li>The macro is <b>not a permanent rule</b>. It runs once and writes a normal <code>spanning-tree vlan N priority X</code> line into the running configuration. If a better switch appears later, it wins.</li>
</ul>

<h3>Lab walkthrough: split roots at Nilgiri Logistics</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Per-VLAN roots and blocked uplinks">
<rect x="60" y="30" width="160" height="50" rx="8" fill="#fde68a"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">root V10, second V20</text>
<rect x="420" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">root V20, second V10</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="80" x2="270" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="80" x2="370" y2="170" stroke="#64748b" stroke-width="3"/>
<text x="120" y="130" class="svg-accent" font-size="12">Gi0/1: RP V10</text><text x="120" y="146" class="svg-muted" font-size="12">ALT V20</text>
<text x="440" y="130" class="svg-accent" font-size="12">Gi0/2: RP V20</text><text x="440" y="146" class="svg-muted" font-size="12">ALT V10</text>
<text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="12">each VLAN blocks a different SW3 uplink: both links carry traffic</text>
</svg><p class="cap">The target design: VLAN 10 uses SW3 Gi0/1, VLAN 20 uses SW3 Gi0/2.</p></div>

<p><b>Step 1, look first.</b> As chapter 6 showed, with defaults SW1 is root for both VLANs and SW2 Gi0/2 blocks. Record it with <code>show spanning-tree root</code> on SW3.</p>
<p><b>Step 2, configure.</b></p>
<pre class="code"><span class="c">! SW1: root for VLAN 10, backup root for VLAN 20</span>
SW1(config)# spanning-tree vlan 10 root primary
SW1(config)# spanning-tree vlan 20 root secondary
<span class="c">! SW2: root for VLAN 20, backup root for VLAN 10</span>
SW2(config)# spanning-tree vlan 20 root primary
SW2(config)# spanning-tree vlan 10 root secondary</pre>
<p>Because the existing root (SW1) had 32768, SW1 gets 24576 for VLAN 10. When SW2's macro runs for VLAN 20, the current root is still SW1, now at 28672 (its root secondary setting). That is above 24576, so SW2 also gets 24576 and takes over VLAN 20.</p>
<p><b>Step 3, verify on the roots and on SW3.</b></p>
<pre class="out">SW1# show spanning-tree vlan 10 | begin Root ID
  Root ID    Priority    24586
             Address     5254.0023.a200
<span class="hl">             This bridge is the root</span>

SW1# show running-config | include spanning-tree vlan
spanning-tree vlan 10 priority 24576
spanning-tree vlan 20 priority 28672

SW3# show spanning-tree vlan 20 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1               Altn BLK 4         128.2    P2p</span>
<span class="hl">Gi0/2               Root FWD 4         128.3    P2p</span>
Gi0/6               Desg FWD 4         128.7    P2p</pre>
<div class="eg"><p><b>Why SW3 Gi0/1 blocks in VLAN 20.</b> Root is SW2 (24596). SW3 via Gi0/2 = 4; via Gi0/1 through SW1 = 4 + 4 = 8, so Gi0/2 is root port. On the SW1-SW3 segment both SW1 and SW3 advertise cost 4. Tie, so compare Bridge IDs: SW1 28692 beats SW3 32788. SW1 owns the designated port and SW3 Gi0/1 becomes alternate. In VLAN 10 the mirror image happens, so both uplinks now forward something.</p></div>

<h3>Tuning which port wins: cost and port priority</h3>
<p><b>Port cost</b> changes a switch's <b>own</b> root port choice. Configure it on the switch whose choice you want to change:</p>
<pre class="code">SW3(config)# interface GigabitEthernet0/1
SW3(config-if)# spanning-tree vlan 10 cost 10
<span class="c">! or for all VLANs on the port: spanning-tree cost 10</span></pre>
<p>Now SW3's cost via Gi0/1 is 10, via Gi0/2 through SW2 is 4 + 4 = 8, so Gi0/2 becomes the root port for VLAN 10 too. Useful when one uplink is a slower backup that STP cannot see as slower.</p>
<p><b>Port priority</b> changes a <b>neighbour's</b> choice between parallel links to this switch, because it travels inside the BPDUs this switch sends. Configure it on the <b>upstream</b> switch, in steps of 16 (0 to 240, default 128):</p>
<pre class="code">DIST-SW1(config)# interface GigabitEthernet0/2
DIST-SW1(config-if)# spanning-tree vlan 10 port-priority 64
DIST-SW1(config-if)# spanning-tree port-priority 100
% Port Priority in increments of 16 is required</pre>
<p>The downstream switch now sees 64.3 on that link instead of 128.3 and prefers it as root port when costs and neighbour BID tie.</p>

<div class="warn"><p><b>Common mistake.</b> Setting port-priority on the downstream switch and expecting its root port to change. The downstream switch compares the port IDs its <b>neighbour</b> advertises, so its own port-priority does nothing to its root port choice.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>root primary</code> = 24576 (or 4096 below the current root), <code>root secondary</code> = 28672, default = 32768. Output adds the VLAN: VLAN 10 primary shows 24586. The running configuration never contains the words "root primary"; it stores the calculated priority.</p></div>

<div class="scn"><h4>The macro that did not keep watch</h4><p>A campus had used <code>root primary</code> on CORE1 years ago, which set 24576. A new core switch was later installed from a vendor template that included <code>spanning-tree vlan 1-4094 priority 20480</code>. It became root for every VLAN the moment it was connected, and traffic between buildings took a longer path. The team removed the template line, set CORE1 to an explicit priority of 4096 and CORE2 to 8192, and added Root Guard on the distribution downlinks.</p><p><b>Lesson:</b> the root macro is a one-time calculation; lock the design with explicit low priorities and Root Guard.</p></div>

<div class="iv"><p class="q">"What does spanning-tree vlan 10 root primary actually do?"</p><p>Strong answer: it is a macro that looks at the current root for VLAN 10 and sets this switch's priority to 24576, or to 4096 below the current root if that root is already at or below 24576. It writes a normal priority command into the config and does not monitor anything afterwards. Pair it with root secondary (28672) on the backup, split roots per VLAN for load sharing, and use Root Guard to stop a later switch from taking over.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Put the root on the distribution or core switch that holds the VLAN's gateway, with a planned secondary.</li>
<li><code>root primary</code> = 24576 or 4096 below the current root; <code>root secondary</code> = 28672; both are one-time macros.</li>
<li>Split roots per VLAN so each VLAN blocks a different uplink and both links are used.</li>
<li>Port cost changes this switch's root port; port-priority on the upstream switch changes the neighbour's choice.</li>
<li>Verify with <code>show spanning-tree vlan N</code> ("This bridge is the root", Role column) and the running config.</li>
</ul></div>
`,hi:`
<p>Wedding planner mehmaanon ko khud baithne nahi deti aur ummeed nahi karti ki family sahi table par pahunch jaayegi. Woh pehle head table decide karti hai, phir baaki sabko uske aas-paas arrange karti hai. Spanning tree bhi aisa hi hai: agar aap root ko luck par chhodte ho, to sabse chhote MAC wala sabse purana switch head table ban jaata hai. Is chapter mein aap ise decide karoge, aur phir fine-tune karoge ki kaunse links traffic le jaayenge.</p>

<h3>Root kahan hona chahiye</h3>
<ul>
<li><b>Distribution ya core</b> switch par, kabhi access switch par nahi.</li>
<li>Jahan VLAN ka <b>default gateway</b> ho (SVI ya active HSRP router), taaki Layer 2 path aur Layer 3 path match karein.</li>
<li>Ek planned <b>secondary</b> root ke saath, taaki primary fail ho to tree kisi doosre strong switch ke aas-paas bane, kisi random access switch ke aas-paas nahi.</li>
<li>Do distribution switches hon to VLANs mein roots <b>split</b> karke, taaki har access switch ke dono uplinks traffic le jaayein.</li>
</ul>

<h3>Root set karne ke do tareeke</h3>
<pre class="code"><span class="c">! Method 1: macro (ek baar priority calculate karta hai)</span>
SW1(config)# spanning-tree mode rapid-pvst
SW1(config)# spanning-tree vlan 10 root primary
SW1(config)# spanning-tree vlan 20 root secondary

<span class="c">! Method 2: explicit priority (4096 ka multiple)</span>
SW2(config)# spanning-tree mode rapid-pvst
SW2(config)# spanning-tree vlan 20 priority 24576
SW2(config)# spanning-tree vlan 10 priority 28672</pre>
<ul>
<li><code>root primary</code> priority <b>24576</b> set karta hai. Agar current root ki priority pehle se 24576 ya usse kam hai, to uski jagah us root ki priority se <b>4096 kam</b> set karta hai.</li>
<li><code>root secondary</code> <b>28672</b> set karta hai: default 32768 se better lekin primary se worse.</li>
<li>Macro <b>permanent rule nahi</b> hai. Yeh ek baar chalta hai aur running configuration mein normal <code>spanning-tree vlan N priority X</code> line likh deta hai. Agar baad mein better switch aaye, woh jeetta hai.</li>
</ul>

<h3>Lab walkthrough: Nilgiri Logistics par split roots</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Per-VLAN roots aur blocked uplinks">
<rect x="60" y="30" width="160" height="50" rx="8" fill="#fde68a"/><text x="140" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="140" y="70" text-anchor="middle" class="svg-muted" font-size="12">root V10, second V20</text>
<rect x="420" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="500" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW2</text><text x="500" y="70" text-anchor="middle" class="svg-muted" font-size="12">root V20, second V10</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="14">SW3</text><text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">access</text>
<line x1="220" y1="55" x2="420" y2="55" stroke="#64748b" stroke-width="3"/>
<line x1="150" y1="80" x2="270" y2="170" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="80" x2="370" y2="170" stroke="#64748b" stroke-width="3"/>
<text x="120" y="130" class="svg-accent" font-size="12">Gi0/1: RP V10</text><text x="120" y="146" class="svg-muted" font-size="12">ALT V20</text>
<text x="440" y="130" class="svg-accent" font-size="12">Gi0/2: RP V20</text><text x="440" y="146" class="svg-muted" font-size="12">ALT V10</text>
<text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="12">har VLAN SW3 ka alag uplink block karta hai: dono links traffic le jaate hain</text>
</svg><p class="cap">Target design: VLAN 10 SW3 Gi0/1 use karta hai, VLAN 20 SW3 Gi0/2.</p></div>

<p><b>Step 1, pehle dekho.</b> Jaisa chapter 6 ne dikhaya, defaults ke saath SW1 dono VLANs ka root hai aur SW2 Gi0/2 block karta hai. SW3 par <code>show spanning-tree root</code> se ise record karo.</p>
<p><b>Step 2, configure karo.</b></p>
<pre class="code"><span class="c">! SW1: VLAN 10 ka root, VLAN 20 ka backup root</span>
SW1(config)# spanning-tree vlan 10 root primary
SW1(config)# spanning-tree vlan 20 root secondary
<span class="c">! SW2: VLAN 20 ka root, VLAN 10 ka backup root</span>
SW2(config)# spanning-tree vlan 20 root primary
SW2(config)# spanning-tree vlan 10 root secondary</pre>
<p>Kyunki maujooda root (SW1) ki priority 32768 thi, SW1 ko VLAN 10 ke liye 24576 milta hai. Jab VLAN 20 ke liye SW2 ka macro chalta hai, current root abhi bhi SW1 hai, ab 28672 par (uski root secondary setting). Yeh 24576 se upar hai, isliye SW2 ko bhi 24576 milta hai aur woh VLAN 20 le leta hai.</p>
<p><b>Step 3, roots par aur SW3 par verify karo.</b></p>
<pre class="out">SW1# show spanning-tree vlan 10 | begin Root ID
  Root ID    Priority    24586
             Address     5254.0023.a200
<span class="hl">             This bridge is the root</span>

SW1# show running-config | include spanning-tree vlan
spanning-tree vlan 10 priority 24576
spanning-tree vlan 20 priority 28672

SW3# show spanning-tree vlan 20 | begin Interface
Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
<span class="hl">Gi0/1               Altn BLK 4         128.2    P2p</span>
<span class="hl">Gi0/2               Root FWD 4         128.3    P2p</span>
Gi0/6               Desg FWD 4         128.7    P2p</pre>
<div class="eg"><p><b>VLAN 20 mein SW3 Gi0/1 kyun block karta hai.</b> Root SW2 (24596) hai. SW3 Gi0/2 se = 4; Gi0/1 se SW1 ke through = 4 + 4 = 8, isliye Gi0/2 root port hai. SW1-SW3 segment par SW1 aur SW3 dono cost 4 advertise karte hain. Tie, isliye Bridge IDs compare karo: SW1 28692, SW3 32788 ko harata hai. Designated port SW1 ka hai aur SW3 Gi0/1 alternate ban jaata hai. VLAN 10 mein iska mirror image hota hai, isliye ab dono uplinks kuch na kuch forward karte hain.</p></div>

<h3>Kaunsa port jeete, yeh tune karna: cost aur port priority</h3>
<p><b>Port cost</b> switch ki <b>apni</b> root port choice badalti hai. Ise us switch par configure karo jiski choice aap badalna chahte ho:</p>
<pre class="code">SW3(config)# interface GigabitEthernet0/1
SW3(config-if)# spanning-tree vlan 10 cost 10
<span class="c">! ya port ke saare VLANs ke liye: spanning-tree cost 10</span></pre>
<p>Ab SW3 ki Gi0/1 se cost 10 hai, Gi0/2 se SW2 ke through 4 + 4 = 8, isliye VLAN 10 ke liye bhi Gi0/2 root port ban jaata hai. Kaam ka hai jab ek uplink slow backup ho jise STP slow nahi dekh sakta.</p>
<p><b>Port priority</b> is switch tak parallel links mein se <b>neighbour</b> ki choice badalti hai, kyunki yeh is switch ke bheje BPDUs ke andar jaati hai. Ise <b>upstream</b> switch par configure karo, 16 ke steps mein (0 se 240, default 128):</p>
<pre class="code">DIST-SW1(config)# interface GigabitEthernet0/2
DIST-SW1(config-if)# spanning-tree vlan 10 port-priority 64
DIST-SW1(config-if)# spanning-tree port-priority 100
% Port Priority in increments of 16 is required</pre>
<p>Downstream switch ko ab us link par 128.3 ki jagah 64.3 dikhta hai aur jab costs aur neighbour BID tie hon to woh use root port ke roop mein prefer karta hai.</p>

<div class="warn"><p><b>Common galti.</b> Downstream switch par port-priority set karna aur ummeed karna ki uska root port badlega. Downstream switch apne <b>neighbour</b> ke advertise kiye port IDs compare karta hai, isliye uski apni port-priority uski root port choice par kuch nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>root primary</code> = 24576 (ya current root se 4096 kam), <code>root secondary</code> = 28672, default = 32768. Output VLAN jodta hai: VLAN 10 primary 24586 dikhata hai. Running configuration mein kabhi "root primary" words nahi hote; woh calculated priority store karti hai.</p></div>

<div class="scn"><h4>Macro jo nazar nahi rakhta</h4><p>Ek campus ne saalon pehle CORE1 par <code>root primary</code> use kiya tha, jisne 24576 set kiya. Baad mein ek naya core switch vendor template se install hua jismein <code>spanning-tree vlan 1-4094 priority 20480</code> tha. Connect hote hi woh har VLAN ka root ban gaya, aur buildings ke beech traffic lamba path lene laga. Team ne template line hatayi, CORE1 ko explicit priority 4096 aur CORE2 ko 8192 par set kiya, aur distribution downlinks par Root Guard joda.</p><p><b>Seekh:</b> root macro ek baar ki calculation hai; design ko explicit low priorities aur Root Guard se lock karo.</p></div>

<div class="iv"><p class="q">"spanning-tree vlan 10 root primary asal mein kya karta hai?"</p><p>Strong answer: yeh ek macro hai jo VLAN 10 ke current root ko dekhta hai aur is switch ki priority 24576 set karta hai, ya agar woh root pehle se 24576 ya usse kam par hai to current root se 4096 kam. Yeh config mein normal priority command likhta hai aur baad mein kuch monitor nahi karta. Ise backup par root secondary (28672) ke saath jodo, load sharing ke liye har VLAN ke roots split karo, aur baad mein aane wale switch ko takeover se rokne ke liye Root Guard use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Root ko us distribution ya core switch par rakho jahan VLAN ka gateway hai, planned secondary ke saath.</li>
<li><code>root primary</code> = 24576 ya current root se 4096 kam; <code>root secondary</code> = 28672; dono ek baar ke macros hain.</li>
<li>Har VLAN ke roots split karo taaki har VLAN alag uplink block kare aur dono links use hon.</li>
<li>Port cost is switch ka root port badalti hai; upstream switch par port-priority neighbour ki choice badalti hai.</li>
<li><code>show spanning-tree vlan N</code> ("This bridge is the root", Role column) aur running config se verify karo.</li>
</ul></div>
`}};export{e as default};