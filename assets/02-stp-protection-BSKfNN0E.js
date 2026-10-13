var e={id:`stp-protection`,h:{en:`Protecting the spanning tree: BPDU, root and loop protection`,hi:`Spanning tree ki hifazat: BPDU, root aur loop protection`},body:{en:`
<p><b>The problem.</b> RSTP elects the switch with the lowest bridge ID (priority, then MAC) as root. Any device that speaks RSTP can send BPDUs and claim to be root. If a visitor connects a small switch with priority 0, every other switch accepts it as the new root, the tree is rebuilt, and traffic may flow through a weak device. A second, quieter problem exists too: if BPDUs <i>stop</i> arriving on a link (a faulty transceiver, a one-way fibre), the switch may decide it is safe to forward and create a loop. Junos has three protections, each for a different case.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Where each STP protection goes">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">DIS1 root (4k)</text>
<rect x="30" y="85" width="150" height="40" rx="8" fill="#bae6fd"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="13">DIS2 (8k)</text>
<rect x="460" y="85" width="150" height="40" rx="8" fill="#bae6fd"/><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<rect x="30" y="180" width="150" height="40" rx="8" fill="#fed7aa"/><text x="105" y="205" text-anchor="middle" class="svg-ink" font-size="13">LABSW (prio 0)</text>
<rect x="460" y="180" width="150" height="40" rx="8" fill="#fed7aa"/><text x="535" y="205" text-anchor="middle" class="svg-ink" font-size="13">ROGUE (prio 0)</text>
<line x1="270" y1="50" x2="140" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="125" x2="105" y2="180" stroke="#64748b" stroke-width="2"/><line x1="535" y1="125" x2="535" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="115" y="158" class="svg-accent" font-size="12">no-root-port (root protection)</text>
<text x="360" y="158" class="svg-accent" font-size="12">edge + bpdu-block-on-edge</text>
<text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="11">bpdu-timeout-action block on uplinks</text>
</svg><p class="cap">Root protection toward partners, BPDU protection on user ports, loop protection on uplinks.</p></div>

<h3>The three features compared</h3>
<table class="cmp"><tr><th>Feature</th><th>Reacts to</th><th>Result</th><th>Recovery</th></tr>
<tr><td>BPDU protection</td><td>any BPDU on an edge port</td><td>port disabled, <code>BPDU Error: Detected</code></td><td>manual or <code>disable-timeout</code></td></tr>
<tr><td>Root protection</td><td>a <b>superior</b> BPDU on the port</td><td>port blocked, <code>Root-Prevented</code></td><td>automatic when superior BPDUs stop</td></tr>
<tr><td>Loop protection</td><td>BPDUs <b>missing</b> on a root or alternate port</td><td>port stays blocked, <code>Loop-Inconsistent</code></td><td>automatic when BPDUs return</td></tr></table>

<h3>BPDU protection on edge ports</h3>
<p>An <b>edge port</b> faces a host, never another switch. Declare it with <code>edge</code> (it then skips the forwarding delay). With <code>bpdu-block-on-edge</code>, any BPDU arriving on an edge port means a switch is attached, so the port is shut down.</p>
<pre class="code"><span class="c">! ASW1: user ports ge-0/0/2 (PC) and ge-0/0/3 (visitor switch)</span>
set protocols rstp interface ge-0/0/2 edge
set protocols rstp interface ge-0/0/3 edge
set protocols rstp bpdu-block-on-edge
set protocols layer2-control bpdu-block disable-timeout 300
commit</pre>
<p>Real output from the lab after the visitor switch ROGUE sent its first BPDU:</p>
<pre class="out">lab@ASW1&gt; show interfaces ge-0/0/3
Physical interface: ge-0/0/3, Enabled, Physical link is Down
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: 1000mbps, <span class="hl">BPDU Error: Detected</span>, ...

lab@ASW1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/2                   128:3      128:3    32768.5254404df300    20000  FWD    DESG
ge-0/0/3                   128:4      -                         -    20000  <span class="hl">BLK    DIS (BPDU-Error)</span></pre>
<p>The port stays disabled until you run <code>clear error bpdu interface ge-0/0/3</code> or until the <code>disable-timeout</code> (here 300 seconds) expires. If the rogue switch is still attached, the port will be disabled again.</p>

<h3>Root protection toward partner links</h3>
<p>Use it where you must keep the link <i>up</i> but never allow the neighbour to become root, for example a partner or lab switch that you do not own. Configure <code>no-root-port</code> on the port that faces it.</p>
<pre class="code">set protocols rstp interface ge-0/0/2 no-root-port     <span class="c">! on DIS2, toward LABSW</span>
commit</pre>
<pre class="out">lab@DIS2&gt; show spanning-tree interface
ge-0/0/0                   128:1      128:1     4096.52545b94fe00    20000  FWD    ROOT
ge-0/0/2                   128:3      128:1        0.525465c35c00    20000  BLK    <span class="hl">ALT (Root-Prevented)</span></pre>
<p>DIS1 is the root again (priority 4096). The LABSW port keeps its link but carries no traffic as long as LABSW claims superiority.</p>

<h3>Loop protection on uplinks</h3>
<p>On a root or alternate port, if BPDUs stop arriving, the port would normally age out the old information and become designated and forwarding. That is dangerous when the cause is a unidirectional link. <code>bpdu-timeout-action block</code> keeps it blocked instead (or <code>alarm</code> only raises an alarm).</p>
<pre class="code">set protocols rstp interface ge-0/0/0 bpdu-timeout-action block
set protocols rstp interface ge-0/0/1 bpdu-timeout-action block</pre>

<div class="warn"><p><b>Common mistake.</b> Putting root protection on an uplink toward the real root. The root's own BPDUs are superior, so the uplink is blocked and you cut yourself off. Root protection belongs on <i>downlinks and partner links</i> only. Likewise, do not use <code>edge</code> on a port that faces another switch.</p></div>
<div class="exam"><p><b>Exam trap.</b> BPDU protection disables the port; root protection only blocks it and recovers by itself. Loop protection fits root and alternate ports, root protection fits designated ports: they guard different roles.</p></div>

<div class="scn"><h4>The partner lab that wanted to be root</h4><p>A partner company brought its own switch LABSW to a Jaipur office and connected it to DIS2. Its priority was 0, so it won the root election and the building's traffic detoured through it. The engineer first thought BPDU protection would help, but the link had to stay up for the partner's tests. Root protection on DIS2 ge-0/0/2 kept the cable active, restored DIS1 as root, and logged the event.</p><p><b>Lesson:</b> choose the protection by whether the neighbour is allowed to exist (root protection) or not (BPDU protection).</p></div>
<div class="iv"><p class="q">"What is the difference between BPDU guard and root guard on Junos?"</p><p>On Junos the names are BPDU protection (<code>bpdu-block-on-edge</code>) and root protection (<code>no-root-port</code>). BPDU protection disables an edge port on any BPDU. Root protection allows BPDUs but blocks the port if they are superior to the current root. Add loop protection for lost BPDUs.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BPDU protection: edge ports, any BPDU, port disabled.</li>
<li>Root protection: <code>no-root-port</code>, superior BPDU, port blocked until it stops.</li>
<li>Loop protection: <code>bpdu-timeout-action block</code>, missing BPDUs, port stays blocked.</li>
<li>Recovery: <code>clear error bpdu</code> or <code>layer2-control bpdu-block disable-timeout</code>.</li>
<li>Root protection never goes toward the real root.</li>
</ul></div>
`,hi:`
<p><b>Problem.</b> RSTP sabse chhote bridge ID (priority, phir MAC) wale switch ko root chunta hai. Jo bhi device RSTP bolta hai wo BPDUs bhej kar root hone ka daava kar sakta hai. Agar visitor priority 0 wala chhota switch laga de, to baaki sab switches use naya root maan lete hain, tree dobara banta hai, aur traffic kamzor device se guzar sakta hai. Ek doosri, shaant problem bhi hai: agar link par BPDUs aana <i>band</i> ho jaaye (kharab transceiver, one-way fibre), to switch samajh sakta hai ki forward karna safe hai aur loop bana deta hai. Junos mein teen protections hain, har ek alag case ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Har STP protection kahan lagti hai">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">DIS1 root (4k)</text>
<rect x="30" y="85" width="150" height="40" rx="8" fill="#bae6fd"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="13">DIS2 (8k)</text>
<rect x="460" y="85" width="150" height="40" rx="8" fill="#bae6fd"/><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<rect x="30" y="180" width="150" height="40" rx="8" fill="#fed7aa"/><text x="105" y="205" text-anchor="middle" class="svg-ink" font-size="13">LABSW (prio 0)</text>
<rect x="460" y="180" width="150" height="40" rx="8" fill="#fed7aa"/><text x="535" y="205" text-anchor="middle" class="svg-ink" font-size="13">ROGUE (prio 0)</text>
<line x1="270" y1="50" x2="140" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="50" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="105" x2="460" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="105" y1="125" x2="105" y2="180" stroke="#64748b" stroke-width="2"/><line x1="535" y1="125" x2="535" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="115" y="158" class="svg-accent" font-size="12">no-root-port (root protection)</text>
<text x="360" y="158" class="svg-accent" font-size="12">edge + bpdu-block-on-edge</text>
<text x="320" y="97" text-anchor="middle" class="svg-muted" font-size="11">uplinks par bpdu-timeout-action block</text>
</svg><p class="cap">Partners ki taraf root protection, user ports par BPDU protection, uplinks par loop protection.</p></div>

<h3>Teeno features ka comparison</h3>
<table class="cmp"><tr><th>Feature</th><th>Kis par react</th><th>Nateeja</th><th>Recovery</th></tr>
<tr><td>BPDU protection</td><td>edge port par koi bhi BPDU</td><td>port disabled, <code>BPDU Error: Detected</code></td><td>manual ya <code>disable-timeout</code></td></tr>
<tr><td>Root protection</td><td>port par <b>superior</b> BPDU</td><td>port blocked, <code>Root-Prevented</code></td><td>superior BPDUs band hote hi automatic</td></tr>
<tr><td>Loop protection</td><td>root ya alternate port par BPDUs <b>missing</b></td><td>port blocked rehta hai, <code>Loop-Inconsistent</code></td><td>BPDUs wapas aate hi automatic</td></tr></table>

<h3>Edge ports par BPDU protection</h3>
<p><b>Edge port</b> host ki taraf hota hai, kabhi doosre switch ki taraf nahi. Use <code>edge</code> se declare karo (phir forwarding delay skip hota hai). <code>bpdu-block-on-edge</code> ke saath edge port par BPDU aane ka matlab hai switch laga hai, isliye port band kar diya jaata hai.</p>
<pre class="code"><span class="c">! ASW1: user ports ge-0/0/2 (PC) aur ge-0/0/3 (visitor switch)</span>
set protocols rstp interface ge-0/0/2 edge
set protocols rstp interface ge-0/0/3 edge
set protocols rstp bpdu-block-on-edge
set protocols layer2-control bpdu-block disable-timeout 300
commit</pre>
<p>Lab ka real output, ROGUE visitor switch ka pehla BPDU aane ke baad:</p>
<pre class="out">lab@ASW1&gt; show interfaces ge-0/0/3
Physical interface: ge-0/0/3, Enabled, Physical link is Down
  Link-level type: Ethernet, MTU: 1514, MRU: 1522, Speed: 1000mbps, <span class="hl">BPDU Error: Detected</span>, ...

lab@ASW1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/2                   128:3      128:3    32768.5254404df300    20000  FWD    DESG
ge-0/0/3                   128:4      -                         -    20000  <span class="hl">BLK    DIS (BPDU-Error)</span></pre>
<p>Port tab tak disabled rehta hai jab tak aap <code>clear error bpdu interface ge-0/0/3</code> na chalao ya <code>disable-timeout</code> (yahan 300 second) khatam na ho. Agar rogue switch abhi bhi laga hai to port phir disable ho jaayega.</p>

<h3>Partner links ki taraf root protection</h3>
<p>Isse wahan use karo jahan link <i>up</i> rakhna hai lekin neighbour ko kabhi root nahi banne dena, jaise partner ya lab switch jo aapka nahi hai. Us ki taraf wale port par <code>no-root-port</code> lagao.</p>
<pre class="code">set protocols rstp interface ge-0/0/2 no-root-port     <span class="c">! DIS2 par, LABSW ki taraf</span>
commit</pre>
<pre class="out">lab@DIS2&gt; show spanning-tree interface
ge-0/0/0                   128:1      128:1     4096.52545b94fe00    20000  FWD    ROOT
ge-0/0/2                   128:3      128:1        0.525465c35c00    20000  BLK    <span class="hl">ALT (Root-Prevented)</span></pre>
<p>DIS1 phir root hai (priority 4096). LABSW wale port ka link bana rehta hai lekin jab tak LABSW superior hone ka daava karta hai tab tak traffic nahi chalta.</p>

<h3>Uplinks par loop protection</h3>
<p>Root ya alternate port par agar BPDUs aana band ho jaayein to port aam taur par purani information expire karke designated aur forwarding ban jaata hai. Agar wajah unidirectional link hai to yeh khatarnak hai. <code>bpdu-timeout-action block</code> use blocked rakhta hai (ya <code>alarm</code> sirf alarm uthata hai).</p>
<pre class="code">set protocols rstp interface ge-0/0/0 bpdu-timeout-action block
set protocols rstp interface ge-0/0/1 bpdu-timeout-action block</pre>

<div class="warn"><p><b>Common mistake.</b> Asli root ki taraf wale uplink par root protection lagana. Root ke apne BPDUs superior hote hain, isliye uplink block ho jaata hai aur aap khud ko kaat lete ho. Root protection sirf <i>downlinks aur partner links</i> par lagti hai. Isi tarah, doosre switch ki taraf wale port par <code>edge</code> mat lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> BPDU protection port disable karti hai; root protection sirf block karti hai aur apne aap recover hoti hai. Loop protection root aur alternate ports ke liye hai, root protection designated ports ke liye: dono alag roles ko guard karti hain.</p></div>

<div class="scn"><h4>Partner lab jo root banna chahta tha</h4><p>Ek partner company ne Jaipur office mein apna switch LABSW laa kar DIS2 se jod diya. Uski priority 0 thi, isliye woh root election jeet gaya aur building ka traffic uske raaste se ghoomne laga. Engineer ne pehle socha BPDU protection kaam aayegi, lekin partner ke tests ke liye link up rakhna tha. DIS2 ge-0/0/2 par root protection ne cable active rakha, DIS1 ko dobara root banaya aur event log kiya.</p><p><b>Lesson:</b> protection is baat se chuno ki neighbour ka hona allowed hai (root protection) ya nahi (BPDU protection).</p></div>
<div class="iv"><p class="q">"Junos par BPDU guard aur root guard mein kya difference hai?"</p><p>Junos mein naam hain BPDU protection (<code>bpdu-block-on-edge</code>) aur root protection (<code>no-root-port</code>). BPDU protection edge port par kisi bhi BPDU par port disable karti hai. Root protection BPDUs allow karti hai lekin agar woh current root se superior hon to port block karti hai. Lost BPDUs ke liye loop protection jodo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BPDU protection: edge ports, koi bhi BPDU, port disabled.</li>
<li>Root protection: <code>no-root-port</code>, superior BPDU, jab tak woh band na ho port blocked.</li>
<li>Loop protection: <code>bpdu-timeout-action block</code>, BPDUs missing, port blocked rehta hai.</li>
<li>Recovery: <code>clear error bpdu</code> ya <code>layer2-control bpdu-block disable-timeout</code>.</li>
<li>Root protection kabhi asli root ki taraf nahi lagti.</li>
</ul></div>
`}};export{e as default};