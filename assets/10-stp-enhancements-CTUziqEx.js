var e={id:`stp-enhancements`,h:{en:`STP enhancements: PortFast, BPDU Guard and Filter, Root Guard, Loop Guard, UDLD`,hi:`STP enhancements: PortFast, BPDU Guard aur Filter, Root Guard, Loop Guard, UDLD`},body:{en:`
<p>A building's fire system has smoke detectors in the flats, a guard at the main gate who stops strangers claiming to be the landlord, a watchman on the back stairs who shouts if the usual footsteps suddenly stop, and a caretaker who checks that every intercom actually works in both directions. Spanning tree has exactly these helpers. None of them change who the root is; they protect the tree you designed.</p>

<h3>Where each feature belongs</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Where STP enhancements go">
<rect x="245" y="15" width="150" height="44" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Distribution (root)</text>
<rect x="60" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="135" y="147" text-anchor="middle" class="svg-ink" font-size="13">Access SW3</text>
<rect x="430" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="505" y="147" text-anchor="middle" class="svg-ink" font-size="13">Access SW4</text>
<line x1="280" y1="59" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="480" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="175" y="82" text-anchor="middle" class="svg-accent" font-size="12">root guard (down)</text>
<text x="470" y="82" text-anchor="middle" class="svg-accent" font-size="12">loop guard + UDLD (up)</text>
<rect x="30" y="210" width="90" height="36" rx="6" fill="#fde68a"/><text x="75" y="233" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<rect x="150" y="210" width="90" height="36" rx="6" fill="#fde68a"/><text x="195" y="233" text-anchor="middle" class="svg-ink" font-size="12">phone</text>
<line x1="100" y1="164" x2="75" y2="210" stroke="#64748b" stroke-width="2"/><line x1="170" y1="164" x2="195" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="360" y="232" text-anchor="middle" class="svg-accent" font-size="12">host ports: PortFast + BPDU Guard</text>
</svg><p class="cap">Protect the edge from unexpected switches, the root from being stolen, and blocked ports from opening when BPDUs vanish.</p></div>

<h3>PortFast (edge ports)</h3>
<p>PortFast makes a host port an RSTP/MST <b>edge port</b>: it goes to forwarding immediately and never generates a topology change. Without it, a PC waits 30 seconds on 802.1D (long enough for DHCP to give up) and every PC reboot flushes MAC tables across the VLAN (chapter 7).</p>
<pre class="code">SW3(config-if)# spanning-tree portfast              <span class="c">! one access port</span>
SW3(config)# spanning-tree portfast default         <span class="c">! all access ports</span>
SW3(config-if)# spanning-tree portfast trunk        <span class="c">! trunk to a hypervisor or server</span></pre>
<p>Every access port in the labs has <code>spanning-tree portfast</code>, which is why they show <code>P2p Edge</code>.</p>

<h3>BPDU Guard</h3>
<p>A host port should never hear a BPDU. BPDU Guard err-disables the port the moment one arrives, stopping a rogue or looped switch at the edge.</p>
<pre class="code">SW3(config-if)# spanning-tree bpduguard enable            <span class="c">! per port, PortFast or not</span>
SW3(config)# spanning-tree portfast bpduguard default     <span class="c">! all PortFast ports</span>
SW3(config)# errdisable recovery cause bpduguard          <span class="c">! optional auto-recovery</span></pre>
<pre class="out">%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/5 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/5, putting Gi0/5 in err-disable state</pre>

<h3>BPDU Filter: the dangerous twin</h3>
<ul>
<li><b>Global</b> <code>spanning-tree portfast bpdufilter default</code>: PortFast ports send a few BPDUs at link-up and then stop. If a BPDU ever arrives, the port loses PortFast and filtering and runs normal STP. Reasonably safe.</li>
<li><b>Interface</b> <code>spanning-tree bpdufilter enable</code>: the port neither sends nor processes BPDUs. STP is effectively off on that port. Connect a switch and you have a loop. Use only at deliberate STP domain borders (for example toward a provider).</li>
</ul>

<h3>Root Guard</h3>
<p>Root Guard goes on <b>designated ports</b> that must never lead to the root, typically distribution downlinks to access switches. If a superior BPDU arrives, the port becomes <b>root-inconsistent</b> (discarding) for that VLAN or instance. When the superior BPDUs stop, it recovers automatically; no err-disable.</p>
<pre class="code">DSW1(config)# interface range GigabitEthernet1/0/1 - 24
DSW1(config-if-range)# spanning-tree guard root</pre>
<pre class="out">%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet1/0/10 on MST0000.
DSW1# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
MST0000              GigabitEthernet1/0/10    Root Inconsistent</pre>

<h3>Loop Guard</h3>
<p>A root or alternate port stays safe only as long as BPDUs keep arriving. If a fibre fails in one direction, or the neighbour's CPU stops sending BPDUs, a normal switch waits for the information to age out and then makes the blocked port <b>designated and forwarding</b>: a loop. Loop Guard puts that port into <b>loop-inconsistent</b> (discarding) instead, per VLAN or instance, and releases it when BPDUs return.</p>
<pre class="code">SW3(config-if)# spanning-tree guard loop            <span class="c">! on root/alternate uplinks</span>
SW3(config)# spanning-tree loopguard default        <span class="c">! all point-to-point ports</span></pre>
<pre class="out">%SPANTREE-2-LOOPGUARD_BLOCK: Loop guard blocking port GigabitEthernet0/2 on MST0001.</pre>
<p>Root Guard and Loop Guard cannot be enabled on the same port: one expects BPDUs to be inferior, the other expects them to keep arriving from the root side.</p>

<h3>UDLD</h3>
<p><b>UDLD</b> (UniDirectional Link Detection) is a Cisco Layer 2 protocol that sends hellos (every 15 seconds by default) listing the neighbour it hears, so each side confirms the other hears it too.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td>Normal</td><td>Err-disables a port when it positively detects a one-way or miswired link; if hellos simply stop, it only marks the port undetermined and logs.</td></tr>
<tr><td>Aggressive</td><td>If hellos stop while the link is up, it tries to re-establish (8 attempts, one per second) and then err-disables the port.</td></tr></table>
<pre class="code">SW1(config)# udld aggressive                 <span class="c">! global: fibre ports only</span>
SW1(config-if)# udld port aggressive         <span class="c">! per port, copper or fibre</span></pre>
<p>Loop Guard and UDLD overlap but are not the same: UDLD finds the broken link, Loop Guard stops STP from reacting to missing BPDUs. Best practice is both on inter-switch fibre.</p>

<pre class="out">SW3# show spanning-tree summary
Switch is in mst mode (IEEE Standard)
Root bridge for: none
Extended system ID                      is enabled
Portfast Default                        is disabled
<span class="hl">PortFast BPDU Guard Default             is enabled</span>
Portfast BPDU Filter Default            is disabled
<span class="hl">Loopguard Default                       is enabled</span>
EtherChannel misconfig guard            is enabled
Pathcost method used                    is long</pre>

<div class="eg"><p><b>Worked example: which guard where?</b> SW3 in Lab 1: Gi0/5 and Gi0/6 (PC10, PC30) get PortFast + BPDU Guard. Gi0/1 and Gi0/2 are uplinks that act as root or alternate in some instance: Loop Guard (and UDLD aggressive if they are fibre). On SW1 and SW2, the ports toward SW3 are designated in every instance where they are the root: Root Guard there stops SW3, or anything plugged into it, from ever becoming root. Do not put Root Guard on the SW1-SW2 link; in MST2 SW1's Gi0/1 is its root port.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding Root Guard to every port "for safety", including the link between the two distribution switches. The backup root's port toward the primary root must receive superior BPDUs; Root Guard blocks it and splits the tree.</p></div>

<div class="exam"><p><b>Exam trap.</b> BPDU Guard = err-disabled (manual or errdisable recovery). Root Guard = root-inconsistent, recovers by itself. Loop Guard = loop-inconsistent, recovers when BPDUs return. Interface-level BPDU Filter disables STP on the port; global BPDU Filter only affects PortFast ports.</p></div>

<div class="scn"><h4>The meeting-room switch</h4><p>An employee brought a small switch to a meeting room and cabled two of its ports into two wall jacks to "get more speed". The switch sent BPDUs; the access ports had PortFast but no BPDU Guard, and the wall jacks sat in the same VLAN. RSTP blocked one port, but every time the switch power-cycled, TCs flushed tables floor-wide. After the incident the team enabled <code>spanning-tree portfast bpduguard default</code> and <code>errdisable recovery cause bpduguard</code>; the next time, both jacks err-disabled instantly and recovered after the switch was removed.</p><p><b>Lesson:</b> PortFast without BPDU Guard trusts every user; always pair them.</p></div>

<div class="iv"><p class="q">"What is the difference between Root Guard and Loop Guard?"</p><p>Strong answer: Root Guard protects root placement: on designated ports it blocks the port as root-inconsistent if a superior BPDU arrives, and recovers when they stop. Loop Guard protects against unidirectional failures: on root and alternate ports, if BPDUs stop arriving it keeps the port discarding as loop-inconsistent instead of letting it become designated. They cannot be used on the same port. Mention UDLD as the physical-layer partner of Loop Guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PortFast = edge port: immediate forwarding, no TCs; pair it with BPDU Guard.</li>
<li>BPDU Guard err-disables a port on any BPDU; global form applies to PortFast ports.</li>
<li>Interface BPDU Filter turns STP off on the port; global BPDU Filter is the safe form.</li>
<li>Root Guard on designated downlinks (root-inconsistent); Loop Guard on root/alternate uplinks (loop-inconsistent).</li>
<li>UDLD detects one-way links; aggressive mode err-disables after 8 failed re-tries.</li>
</ul></div>
`,hi:`
<p>Ek building ke fire system mein flats mein smoke detectors hain, main gate par ek guard hai jo khud ko landlord bataane wale ajnabiyon ko rokta hai, pichhli seedhiyon par ek chowkidaar hai jo aam kadmon ki awaaz achanak ruk jaaye to chillata hai, aur ek caretaker hai jo check karta hai ki har intercom sach mein dono taraf kaam karta hai. Spanning tree ke paas bilkul yahi helpers hain. Inme se koi root nahi badalta; yeh aapke design kiye tree ki hifazat karte hain.</p>

<h3>Kaunsa feature kahan lagta hai</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Where STP enhancements go">
<rect x="245" y="15" width="150" height="44" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Distribution (root)</text>
<rect x="60" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="135" y="147" text-anchor="middle" class="svg-ink" font-size="13">Access SW3</text>
<rect x="430" y="120" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="505" y="147" text-anchor="middle" class="svg-ink" font-size="13">Access SW4</text>
<line x1="280" y1="59" x2="160" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="59" x2="480" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="175" y="82" text-anchor="middle" class="svg-accent" font-size="12">root guard (neeche)</text>
<text x="470" y="82" text-anchor="middle" class="svg-accent" font-size="12">loop guard + UDLD (upar)</text>
<rect x="30" y="210" width="90" height="36" rx="6" fill="#fde68a"/><text x="75" y="233" text-anchor="middle" class="svg-ink" font-size="12">PC</text>
<rect x="150" y="210" width="90" height="36" rx="6" fill="#fde68a"/><text x="195" y="233" text-anchor="middle" class="svg-ink" font-size="12">phone</text>
<line x1="100" y1="164" x2="75" y2="210" stroke="#64748b" stroke-width="2"/><line x1="170" y1="164" x2="195" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="360" y="232" text-anchor="middle" class="svg-accent" font-size="12">host ports: PortFast + BPDU Guard</text>
</svg><p class="cap">Edge ko anjaane switches se, root ko chori hone se, aur blocked ports ko BPDUs gayab hone par khulne se bachao.</p></div>

<h3>PortFast (edge ports)</h3>
<p>PortFast host port ko RSTP/MST <b>edge port</b> banata hai: woh turant forwarding mein jaata hai aur kabhi topology change generate nahi karta. Iske bina PC 802.1D par 30 second intezaar karta hai (DHCP ke haar maanne ke liye kaafi) aur har PC reboot poore VLAN mein MAC tables flush karta hai (chapter 7).</p>
<pre class="code">SW3(config-if)# spanning-tree portfast              <span class="c">! ek access port</span>
SW3(config)# spanning-tree portfast default         <span class="c">! saare access ports</span>
SW3(config-if)# spanning-tree portfast trunk        <span class="c">! hypervisor ya server ki taraf trunk</span></pre>
<p>Labs ke har access port par <code>spanning-tree portfast</code> hai, isi liye woh <code>P2p Edge</code> dikhate hain.</p>

<h3>BPDU Guard</h3>
<p>Host port ko kabhi BPDU nahi sunna chahiye. BPDU Guard BPDU aate hi port ko err-disable kar deta hai, edge par rogue ya looped switch ko rok deta hai.</p>
<pre class="code">SW3(config-if)# spanning-tree bpduguard enable            <span class="c">! per port, PortFast ho ya na ho</span>
SW3(config)# spanning-tree portfast bpduguard default     <span class="c">! saare PortFast ports</span>
SW3(config)# errdisable recovery cause bpduguard          <span class="c">! optional auto-recovery</span></pre>
<pre class="out">%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi0/5 with BPDU Guard enabled. Disabling port.
%PM-4-ERR_DISABLE: bpduguard error detected on Gi0/5, putting Gi0/5 in err-disable state</pre>

<h3>BPDU Filter: khatarnaak judwaa</h3>
<ul>
<li><b>Global</b> <code>spanning-tree portfast bpdufilter default</code>: PortFast ports link-up par kuch BPDUs bhejte hain aur phir ruk jaate hain. Agar kabhi BPDU aaye, to port PortFast aur filtering kho deta hai aur normal STP chalata hai. Kaafi had tak safe.</li>
<li><b>Interface</b> <code>spanning-tree bpdufilter enable</code>: port na BPDUs bhejta hai na process karta hai. Us port par STP effectively band hai. Switch jodo aur loop tayyar. Sirf jaan-boojh kar banaye STP domain borders par use karo (jaise provider ki taraf).</li>
</ul>

<h3>Root Guard</h3>
<p>Root Guard un <b>designated ports</b> par lagta hai jo kabhi root ki taraf nahi le jaane chahiye, aam taur par access switches ki taraf distribution downlinks. Agar superior BPDU aaye, to port us VLAN ya instance ke liye <b>root-inconsistent</b> (discarding) ho jaata hai. Superior BPDUs rukte hi yeh apne aap recover karta hai; koi err-disable nahi.</p>
<pre class="code">DSW1(config)# interface range GigabitEthernet1/0/1 - 24
DSW1(config-if-range)# spanning-tree guard root</pre>
<pre class="out">%SPANTREE-2-ROOTGUARD_BLOCK: Root guard blocking port GigabitEthernet1/0/10 on MST0000.
DSW1# show spanning-tree inconsistentports
Name                 Interface                Inconsistency
-------------------- ------------------------ ------------------
MST0000              GigabitEthernet1/0/10    Root Inconsistent</pre>

<h3>Loop Guard</h3>
<p>Root ya alternate port tabhi tak safe hai jab tak BPDUs aate rahein. Agar fibre ek direction mein fail ho, ya neighbour ka CPU BPDUs bhejna band kar de, to normal switch info ke age out hone ka intezaar karta hai aur phir blocked port ko <b>designated aur forwarding</b> bana deta hai: loop. Loop Guard us port ko iski jagah <b>loop-inconsistent</b> (discarding) mein daalta hai, per VLAN ya instance, aur BPDUs wapas aane par chhod deta hai.</p>
<pre class="code">SW3(config-if)# spanning-tree guard loop            <span class="c">! root/alternate uplinks par</span>
SW3(config)# spanning-tree loopguard default        <span class="c">! saare point-to-point ports</span></pre>
<pre class="out">%SPANTREE-2-LOOPGUARD_BLOCK: Loop guard blocking port GigabitEthernet0/2 on MST0001.</pre>
<p>Root Guard aur Loop Guard ek hi port par enable nahi ho sakte: ek BPDUs ke inferior hone ki ummeed karta hai, doosra root side se unke aate rehne ki.</p>

<h3>UDLD</h3>
<p><b>UDLD</b> (UniDirectional Link Detection) Cisco ka Layer 2 protocol hai jo hellos bhejta hai (default mein har 15 second) jinme woh neighbour listed hota hai jise yeh sunta hai, taaki har side confirm kare ki doosri side bhi use sunti hai.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th></tr>
<tr><td>Normal</td><td>Jab positively one-way ya galat wired link detect kare tab port err-disable karta hai; agar hellos bas ruk jaayein, to sirf port ko undetermined mark karke log karta hai.</td></tr>
<tr><td>Aggressive</td><td>Link up rehte hue hellos ruk jaayein to dobara establish karne ki koshish karta hai (8 attempts, har second ek) aur phir port err-disable karta hai.</td></tr></table>
<pre class="code">SW1(config)# udld aggressive                 <span class="c">! global: sirf fibre ports</span>
SW1(config-if)# udld port aggressive         <span class="c">! per port, copper ya fibre</span></pre>
<p>Loop Guard aur UDLD overlap karte hain lekin same nahi hain: UDLD toota link dhoondhta hai, Loop Guard STP ko missing BPDUs par react karne se rokta hai. Best practice: inter-switch fibre par dono.</p>

<pre class="out">SW3# show spanning-tree summary
Switch is in mst mode (IEEE Standard)
Root bridge for: none
Extended system ID                      is enabled
Portfast Default                        is disabled
<span class="hl">PortFast BPDU Guard Default             is enabled</span>
Portfast BPDU Filter Default            is disabled
<span class="hl">Loopguard Default                       is enabled</span>
EtherChannel misconfig guard            is enabled
Pathcost method used                    is long</pre>

<div class="eg"><p><b>Worked example: kaunsa guard kahan?</b> Lab 1 ka SW3: Gi0/5 aur Gi0/6 (PC10, PC30) ko PortFast + BPDU Guard milta hai. Gi0/1 aur Gi0/2 uplinks hain jo kisi na kisi instance mein root ya alternate hain: Loop Guard (aur fibre hon to UDLD aggressive). SW1 aur SW2 par SW3 ki taraf wale ports har us instance mein designated hain jiske woh root hain: wahan Root Guard SW3, ya usme lagi kisi bhi cheez, ko kabhi root banne se rokta hai. SW1-SW2 link par Root Guard mat lagao; MST2 mein SW1 ka Gi0/1 uska root port hai.</p></div>

<div class="warn"><p><b>Common galti.</b> "Safety ke liye" har port par Root Guard lagana, dono distribution switches ke beech ke link samet. Backup root ke primary root wale port ko superior BPDUs milne hi chahiye; Root Guard use block karke tree tod deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> BPDU Guard = err-disabled (manual ya errdisable recovery). Root Guard = root-inconsistent, khud recover hota hai. Loop Guard = loop-inconsistent, BPDUs wapas aane par recover hota hai. Interface-level BPDU Filter port par STP band karta hai; global BPDU Filter sirf PortFast ports ko affect karta hai.</p></div>

<div class="scn"><h4>Meeting-room ka switch</h4><p>Ek employee meeting room mein chhota switch laaya aur "zyada speed" ke liye uske do ports do wall jacks mein laga diye. Switch BPDUs bhej raha tha; access ports par PortFast tha lekin BPDU Guard nahi, aur wall jacks same VLAN mein the. RSTP ne ek port block kiya, lekin har baar switch power-cycle hone par TCs poore floor ki tables flush karte the. Incident ke baad team ne <code>spanning-tree portfast bpduguard default</code> aur <code>errdisable recovery cause bpduguard</code> enable kiya; agli baar dono jacks turant err-disable hue aur switch hatne ke baad recover ho gaye.</p><p><b>Seekh:</b> BPDU Guard ke bina PortFast har user par bharosa karta hai; hamesha dono saath lagao.</p></div>

<div class="iv"><p class="q">"Root Guard aur Loop Guard mein kya fark hai?"</p><p>Strong answer: Root Guard root placement bachata hai: designated ports par superior BPDU aane par port ko root-inconsistent ki tarah block karta hai, aur unke rukne par recover hota hai. Loop Guard unidirectional failures se bachata hai: root aur alternate ports par agar BPDUs aana band ho jaayein to port ko designated banne dene ki jagah loop-inconsistent ki tarah discarding rakhta hai. Dono ek port par use nahi ho sakte. UDLD ko Loop Guard ka physical-layer partner bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PortFast = edge port: turant forwarding, koi TCs nahi; ise BPDU Guard ke saath lagao.</li>
<li>BPDU Guard kisi bhi BPDU par port err-disable karta hai; global form PortFast ports par lagta hai.</li>
<li>Interface BPDU Filter port par STP band karta hai; global BPDU Filter safe form hai.</li>
<li>Designated downlinks par Root Guard (root-inconsistent); root/alternate uplinks par Loop Guard (loop-inconsistent).</li>
<li>UDLD one-way links pakadta hai; aggressive mode 8 fail retries ke baad err-disable karta hai.</li>
</ul></div>
`}};export{e as default};