var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a ring of roads and finished with a campus tree that you can place, steer, protect and repair. This chapter puts the whole module on one page for the night before the exam or an interview.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#fecaca"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">Loops</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="11">storms, flaps</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">Root</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="11">lowest bridge ID</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">Roles</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="11">root, desg, alt</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">Fast</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="11">edge, handshake</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#ddd6fe"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">BPDU, root, loop</text>
<line x1="125" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="255" y1="75" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="515" y1="75" x2="530" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Next: Layer 2 security hardens the access edge</text>
</svg><p class="cap">The storyline of the module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why loops cause storms, MAC flapping and duplicates, and how STP prevents them.</li>
<li>I can state the bridge ID formula, the default priority and the election rules.</li>
<li>I can name the RSTP roles and states and read <code>show spanning-tree interface</code>.</li>
<li>I can set <code>bridge-priority</code> 4k and 8k and predict which port becomes root and which alternate.</li>
<li>I can configure an edge port and explain what it changes.</li>
<li>I can describe MSTP regions and VSTP and when to choose each.</li>
<li>I can describe BPDU, root and loop protection and where each is applied.</li>
<li>I can troubleshoot a wrong root or a manual cost and prove the fix.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge protocol data unit: the control frame with root ID, cost and sender IDs.</dd>
<dt>Bridge ID</dt><dd>Priority (default 32768) plus MAC address; the lowest wins.</dd>
<dt>Root bridge</dt><dd>The switch with the lowest bridge ID; centre of the tree.</dd>
<dt>Root port</dt><dd>The best port of a non-root switch towards the root.</dd>
<dt>Designated port</dt><dd>The best port on a segment towards the root.</dd>
<dt>Alternate / Backup</dt><dd>Discarding standby ports.</dd>
<dt>Edge port</dt><dd>Host-facing port that forwards at once and causes no topology change.</dd>
<dt>Topology change</dt><dd>A notification that makes switches flush their MAC tables.</dd>
<dt>MSTI / CIST</dt><dd>An MSTP instance for VLAN groups, and instance 0.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Default bridge priority</td><td>32768, steps of 4096</td></tr>
<tr><td>Election order</td><td>Root bridge ID, root path cost, sender bridge ID, sender port ID</td></tr>
<tr><td>Costs (802.1t)</td><td>100M = 200000, 1G = 20000, 10G = 2000</td></tr>
<tr><td>Hello / max-age / forward delay</td><td>2 s / 20 s / 15 s</td></tr>
<tr><td>RSTP states</td><td>Discarding, learning, forwarding</td></tr>
<tr><td>Convergence</td><td>STP 30 to 50 s; RSTP about 1 s on point-to-point</td></tr>
<tr><td>Default port priority</td><td>128 (multiples of 16)</td></tr>
<tr><td>MSTP region identity</td><td>Name, revision level, VLAN-to-instance map</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set protocols rstp bridge-priority 4k
set protocols rstp interface ge-0/0/1 cost 40000
set protocols rstp interface ge-0/0/2 edge
set protocols rstp interface ge-0/0/0 mode point-to-point
set protocols rstp bpdu-block-on-edge
set protocols rstp interface ge-0/0/1 no-root-port
show spanning-tree bridge
show spanning-tree interface
show configuration protocols rstp
show system commit</pre>

<div class="eg"><p><b>Worked example: a 60-second self test.</b> Switch X has two 1 Gbit/s uplinks, to the root directly and to another switch that also reaches the root with one 1 Gbit/s link. Which uplink is the root port, and what is the root cost? The direct uplink has cost 20000, the other 20000 + 20000 = 40000. Root port is the direct uplink, root cost 20000, the other uplink alternate.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> A blocked port is a healthy standby. Never leave the root to chance. Declare edge ports. Do not forget that a manual cost beats an automatic one.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Lowest wins everywhere (bridge ID, cost, port ID). Priority multiples of 4096. RSTP is faster because of the handshake and alternate ports, not because timers are shorter.</p></div>

<div class="scn"><h4>From ticket to proof</h4><p>A new floor shipped with default settings. The engineer set priority 4k on the distribution switch and 8k on its partner, marked PC ports as edge, enabled BPDU block on edge and checked <code>show spanning-tree interface</code> on every access switch for one ROOT and one ALT. The commit comments recorded what and why. The handover document was two screens of output.</p><p><b>Lesson:</b> a repeatable standard is faster than a clever fix.</p></div>

<div class="iv"><p class="q">"Describe your standard spanning tree design for a campus."</p><p>RSTP everywhere, or MSTP where load sharing is needed. Primary root 4k and backup 8k on the distribution pair, access switches at default. Host ports as edge with BPDU protection, root protection on downlinks and loop protection on inter-switch links. Verification with <code>show spanning-tree bridge</code> and <code>interface</code>, and commit comments on every change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>STP turns a redundant mesh into a loop-free tree; RSTP is the fast default.</li>
<li>Lowest bridge ID wins; set 4k and 8k on purpose.</li>
<li>Edge ports and protection features secure the access layer.</li>
<li>Troubleshoot with root, roles, overrides, history.</li>
<li>Next module: Layer 2 security (MAC limiting, DHCP snooping, DAI and more).</li>
</ul></div>
`,hi:`
<p>Aapne roads ke ring se shuruat ki aur ab ek campus tree tak pahunch gaye jise aap rakh sakte, steer kar sakte, protect kar sakte aur repair kar sakte ho. Yeh chapter poore module ko ek page par rakhta hai, exam ya interview se pehle ki raat ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="40" width="115" height="70" rx="8" fill="#fecaca"/><text x="67" y="70" text-anchor="middle" class="svg-ink" font-size="13">Loops</text><text x="67" y="90" text-anchor="middle" class="svg-muted" font-size="11">storms, flaps</text>
<rect x="140" y="40" width="115" height="70" rx="8" fill="#fde68a"/><text x="197" y="70" text-anchor="middle" class="svg-ink" font-size="13">Root</text><text x="197" y="90" text-anchor="middle" class="svg-muted" font-size="11">sabse chhota bridge ID</text>
<rect x="270" y="40" width="115" height="70" rx="8" fill="#bae6fd"/><text x="327" y="70" text-anchor="middle" class="svg-ink" font-size="13">Roles</text><text x="327" y="90" text-anchor="middle" class="svg-muted" font-size="11">root, desg, alt</text>
<rect x="400" y="40" width="115" height="70" rx="8" fill="#bbf7d0"/><text x="457" y="70" text-anchor="middle" class="svg-ink" font-size="13">Fast</text><text x="457" y="90" text-anchor="middle" class="svg-muted" font-size="11">edge, handshake</text>
<rect x="530" y="40" width="100" height="70" rx="8" fill="#ddd6fe"/><text x="580" y="70" text-anchor="middle" class="svg-ink" font-size="13">Protect</text><text x="580" y="90" text-anchor="middle" class="svg-muted" font-size="11">BPDU, root, loop</text>
<line x1="125" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="255" y1="75" x2="270" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="400" y2="75" stroke="#64748b" stroke-width="2"/><line x1="515" y1="75" x2="530" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Agla: Layer 2 security access edge ko mazboot karti hai</text>
</svg><p class="cap">Module ki kahani.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki loops storms, MAC flapping aur duplicates kyun banate hain, aur STP unhe kaise rokta hai.</li>
<li>Main bridge ID formula, default priority aur election rules bata sakta hoon.</li>
<li>Main RSTP roles aur states ke naam bata sakta hoon aur <code>show spanning-tree interface</code> padh sakta hoon.</li>
<li>Main <code>bridge-priority</code> 4k aur 8k set kar sakta hoon aur predict kar sakta hoon ki kaunsa port root aur kaunsa alternate banega.</li>
<li>Main edge port configure kar sakta hoon aur samjha sakta hoon ki woh kya badalta hai.</li>
<li>Main MSTP regions aur VSTP bata sakta hoon aur kab kaunsa chunna hai.</li>
<li>Main BPDU, root aur loop protection aur har ek kahan lagti hai bata sakta hoon.</li>
<li>Main galat root ya manual cost troubleshoot karke fix saabit kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BPDU</dt><dd>Bridge protocol data unit: control frame jisme root ID, cost aur sender IDs hote hain.</dd>
<dt>Bridge ID</dt><dd>Priority (default 32768) plus MAC address; sabse chhota jeetta hai.</dd>
<dt>Root bridge</dt><dd>Sabse chhote bridge ID wala switch; tree ka kendra.</dd>
<dt>Root port</dt><dd>Non-root switch ka root ki taraf sabse achha port.</dd>
<dt>Designated port</dt><dd>Segment par root ki taraf sabse achha port.</dd>
<dt>Alternate / Backup</dt><dd>Discarding standby ports.</dd>
<dt>Edge port</dt><dd>Host-facing port jo turant forward karta hai aur topology change nahi banata.</dd>
<dt>Topology change</dt><dd>Notification jo switches se MAC tables flush karwati hai.</dd>
<dt>MSTI / CIST</dt><dd>VLAN groups ke liye MSTP instance, aur instance 0.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Default bridge priority</td><td>32768, 4096 ke steps</td></tr>
<tr><td>Election order</td><td>Root bridge ID, root path cost, sender bridge ID, sender port ID</td></tr>
<tr><td>Costs (802.1t)</td><td>100M = 200000, 1G = 20000, 10G = 2000</td></tr>
<tr><td>Hello / max-age / forward delay</td><td>2 s / 20 s / 15 s</td></tr>
<tr><td>RSTP states</td><td>Discarding, learning, forwarding</td></tr>
<tr><td>Convergence</td><td>STP 30 se 50 s; RSTP point-to-point par lagbhag 1 s</td></tr>
<tr><td>Default port priority</td><td>128 (16 ke multiples)</td></tr>
<tr><td>MSTP region identity</td><td>Name, revision level, VLAN-to-instance map</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">set protocols rstp bridge-priority 4k
set protocols rstp interface ge-0/0/1 cost 40000
set protocols rstp interface ge-0/0/2 edge
set protocols rstp interface ge-0/0/0 mode point-to-point
set protocols rstp bpdu-block-on-edge
set protocols rstp interface ge-0/0/1 no-root-port
show spanning-tree bridge
show spanning-tree interface
show configuration protocols rstp
show system commit</pre>

<div class="eg"><p><b>Worked example: 60 second ka self test.</b> Switch X ke do 1 Gbit/s uplinks hain, ek seedha root tak aur doosra aise switch tak jo ek 1 Gbit/s link se root tak pahunchta hai. Kaunsa uplink root port hai, aur root cost kya hai? Seedhe uplink ka cost 20000, doosre ka 20000 + 20000 = 40000. Root port seedha uplink, root cost 20000, doosra uplink alternate.</p></div>

<div class="warn"><p><b>Aakhri minute ke reminders.</b> Blocked port healthy standby hai. Root ko kabhi chance par mat chhodo. Edge ports declare karo. Yaad rakho ki manual cost automatic cost ko harata hai.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Har jagah sabse chhota jeetta hai (bridge ID, cost, port ID). Priority 4096 ke multiples. RSTP tez isliye hai ki handshake aur alternate ports hain, timers chhote hone ki wajah se nahi.</p></div>

<div class="scn"><h4>Ticket se saboot tak</h4><p>Naya floor default settings ke saath aaya. Engineer ne distribution switch par priority 4k aur uske partner par 8k set ki, PC ports ko edge mark kiya, edge par BPDU block enable kiya aur har access switch par <code>show spanning-tree interface</code> se ek ROOT aur ek ALT check kiya. Commit comments mein kya aur kyun likha tha. Handover document do screen ka output tha.</p><p><b>Lesson:</b> dohraya ja sakne wala standard chalaaki bhare fix se tez hai.</p></div>

<div class="iv"><p class="q">"Campus ke liye apna standard spanning tree design batao."</p><p>Har jagah RSTP, ya jahan load sharing chahiye wahan MSTP. Distribution pair par primary root 4k aur backup 8k, access switches default par. Host ports edge ke saath BPDU protection ke saath, downlinks par root protection aur inter-switch links par loop protection. <code>show spanning-tree bridge</code> aur <code>interface</code> se verification, aur har change par commit comments.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>STP redundant mesh ko loop-free tree banata hai; RSTP fast default hai.</li>
<li>Sabse chhota bridge ID jeetta hai; 4k aur 8k jaan-boojhkar set karo.</li>
<li>Edge ports aur protection features access layer ko secure karte hain.</li>
<li>Root, roles, overrides, history se troubleshoot karo.</li>
<li>Agla module: Layer 2 security (MAC limiting, DHCP snooping, DAI aur aur bhi).</li>
</ul></div>
`}};export{e as default};