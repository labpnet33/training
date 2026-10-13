var e={id:`convergence-edge`,h:{en:`Fast convergence: proposal/agreement, edge ports and topology changes`,hi:`Fast convergence: proposal/agreement, edge ports aur topology changes`},body:{en:`
<p>Imagine a new traffic light at a junction. The old system (802.1D) made every car wait 30 seconds just in case: 15 seconds in a "listening" phase and 15 in a "learning" phase, even when the road was clearly empty. RSTP replaced that blind wait with a quick conversation between the two lights: "I want to go green, are you red on your other roads?" "Yes." "Then I go." This handshake is the heart of RSTP's speed.</p>

<h3>Why 802.1D was slow</h3>
<p>Classic STP trusted timers, not neighbours. A port that was newly active went blocking, then listening (15 seconds, forward delay), then learning (15 seconds), then forwarding. If a link failed on the far side of the network, switches waited for the BPDU <b>max-age</b> (20 seconds) to expire before reacting. Typical failure recovery was 30 to 50 seconds, long enough to drop voice calls and TCP sessions.</p>

<h3>How RSTP converges in about a second</h3>
<ul>
<li><b>Every switch sends its own BPDUs</b> every hello time (2 seconds). Three missed hellos (6 seconds) declare the neighbour gone; a physical link-down is noticed at once.</li>
<li><b>Proposal/agreement handshake:</b> on a <b>point-to-point</b> (full-duplex) link a designated port sends a <i>proposal</i>. The neighbour <b>syncs</b>: it temporarily blocks its other non-edge ports to make sure no loop can form, then replies with an <i>agreement</i>. The link moves to forwarding immediately, with no timer wait. The sync ripples down the tree, switch by switch, in milliseconds.</li>
<li><b>Alternate ports</b> are pre-calculated, so a root-port failure needs no new election: the alternate becomes root and forwards at once.</li>
<li><b>Edge ports</b> skip all of this.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Proposal agreement">
<rect x="40" y="40" width="150" height="50" rx="10" fill="#fde68a"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">DSW1 (root)</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">designated port</text>
<rect x="450" y="40" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">new root port</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#64748b" stroke-width="3"/>
<text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="12">1 Proposal</text>
<text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">3 Agreement</text>
<text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">2 Sync: block other</text>
<text x="525" y="141" text-anchor="middle" class="svg-muted" font-size="12">non-edge ports</text>
<text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">4 Port forwards at once</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">No timers: the handshake replaces listening and learning</text>
</svg><p class="cap">The proposal/agreement handshake on a point-to-point link.</p></div>

<h3>Link type: point-to-point versus shared</h3>
<p>The handshake works only on <b>point-to-point</b> links. Junos assumes full-duplex means point-to-point and half-duplex or a hub means shared. You can force it:</p>
<pre class="code">set protocols rstp interface ge-0/0/0 mode point-to-point</pre>
<p>A link that is really shared (a hub or a wireless bridge between two switches) must not be forced to point-to-point, or the sync logic may open a loop.</p>

<h3>Edge ports</h3>
<p>An <b>edge port</b> connects an end host (a PC, printer or server) where no switch is expected. It goes to forwarding immediately when the link comes up, skips the handshake and, importantly, <b>does not generate a topology change</b> when the link flaps. A user rebooting a PC must not make every switch in the building flush its MAC table.</p>
<pre class="code">set protocols rstp interface ge-0/0/2 edge</pre>
<p>Real configuration and verification from FLOOR2 in Lab 1:</p>
<pre class="out">lab@FLOOR2&gt; show configuration protocols rstp
interface ge-0/0/2 {
    edge;
}

lab@FLOOR2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.5254c6fcd000    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  BLK    ALT
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  <span class="hl">FWD    DESG</span></pre>
<p>The PC port is designated and forwarding. If a switch BPDU ever arrives on an edge port, RSTP immediately treats the port as a normal port again, which is a safety net (protection features are covered in the Layer 2 security module).</p>

<h3>Topology changes</h3>
<p>When a non-edge port goes to forwarding, or a forwarding port is lost, the switch sends a <b>topology change</b> notification through the tree. Every switch that receives it <b>flushes its MAC table</b> (except on the port it came from) so that traffic is re-learned along the new path. This is why <code>show spanning-tree bridge</code> reports <b>Number of topology changes</b> and <b>Time since last topology change</b>. A steadily growing counter is a clue to a flapping uplink or a port that should have been an edge port.</p>

<h3>Timers at a glance</h3>
<table class="cmp"><tr><th>Item</th><th>802.1D</th><th>RSTP</th></tr>
<tr><td>Hello time</td><td>Root only, 2 s</td><td>Every switch, 2 s</td></tr>
<tr><td>Port states</td><td>5</td><td>3</td></tr>
<tr><td>Typical convergence</td><td>30 to 50 s</td><td>About 1 s on point-to-point links</td></tr>
<tr><td>Forward delay</td><td>15 s per phase</td><td>Only a fallback</td></tr></table>

<div class="eg"><p><b>Worked example.</b> In Lab 1 the PC on FLOOR2 ge-0/0/2 is rebooted. Without the edge setting, RSTP treats the port as a possible switch link: it goes through the handshake and each flap can produce a topology change that flushes MAC tables across the floor. With <code>edge</code>, the port forwards at once and nothing else notices.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Marking an inter-switch trunk as edge: a loop can form for the moment before RSTP notices the BPDU. Forgetting edge on PC ports and then wondering about topology change counters. Forcing point-to-point on shared media.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know that RSTP default hello is 2 seconds, three missed hellos mean a lost neighbour, and edge ports neither wait nor cause topology changes. Remember that proposal/agreement needs a point-to-point link.</p></div>

<div class="scn"><h4>The printer that flushed the floor</h4><p>Every time a shared printer was switched on, VoIP calls on the floor stuttered for a moment. <code>show spanning-tree bridge</code> showed the topology change counter growing at each power-on. The printer port had not been defined as an edge port, so each link-up triggered a topology change and MAC flush. One <code>set protocols rstp interface ge-0/0/7 edge</code> removed the stutter.</p><p><b>Lesson:</b> declare every host-facing port as an edge port.</p></div>

<div class="iv"><p class="q">"Why does RSTP converge faster than STP?"</p><p>It replaces timer-driven state changes with a proposal/agreement handshake on point-to-point links, has pre-calculated alternate ports, lets every switch generate BPDUs and detects neighbour loss in three hellos or at link-down. Edge ports forward immediately. Mention three states and about one second.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D used timers (30 to 50 seconds); RSTP uses a handshake (about one second).</li>
<li>Proposal/agreement needs a point-to-point link.</li>
<li>Edge ports forward at once and do not cause topology changes.</li>
<li>A topology change flushes MAC tables; watch the counter in <code>show spanning-tree bridge</code>.</li>
<li>Alternate ports give instant root-port failover.</li>
</ul></div>
`,hi:`
<p>Socho ek junction par naya traffic light. Purana system (802.1D) har gaadi ko 30 second rukata tha, "kya pata" ke naam par: 15 second "listening" phase aur 15 second "learning" phase, chahe road saaf khaali ho. RSTP ne us andhe intezaar ki jagah do lights ke beech chhoti baatchit rakh di: "Main green hona chahta hoon, kya tumhari doosri roads par red hai?" "Haan." "To main jaata hoon." Yahi handshake RSTP ki speed ka dil hai.</p>

<h3>802.1D slow kyun tha</h3>
<p>Classic STP neighbours par nahi, timers par bharosa karta tha. Naya active port blocking mein jaata tha, phir listening (15 seconds, forward delay), phir learning (15 seconds), phir forwarding. Network ke door ke kone par link fail ho to switches BPDU <b>max-age</b> (20 seconds) expire hone ka intezaar karte the. Typical failure recovery 30 se 50 seconds thi, jo voice calls aur TCP sessions girane ke liye kaafi hai.</p>

<h3>RSTP lagbhag ek second mein kaise converge hota hai</h3>
<ul>
<li><b>Har switch apne BPDUs bhejta hai</b> har hello time (2 seconds) par. Teen hello miss hone (6 seconds) par neighbour gaya maana jaata hai; physical link-down turant pakda jaata hai.</li>
<li><b>Proposal/agreement handshake:</b> <b>point-to-point</b> (full-duplex) link par designated port <i>proposal</i> bhejta hai. Neighbour <b>sync</b> karta hai: apne baaki non-edge ports ko thodi der ke liye block karta hai taaki loop na ban sake, phir <i>agreement</i> se jawab deta hai. Link bina timer ke turant forwarding mein chala jaata hai. Sync tree mein switch-by-switch milliseconds mein phailta hai.</li>
<li><b>Alternate ports</b> pehle se calculate hote hain, isliye root-port failure mein naye election ki zaroorat nahi: alternate root ban jaata hai aur turant forward karta hai.</li>
<li><b>Edge ports</b> yeh sab skip karte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Proposal agreement">
<rect x="40" y="40" width="150" height="50" rx="10" fill="#fde68a"/><text x="115" y="62" text-anchor="middle" class="svg-ink" font-size="13">DSW1 (root)</text><text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="11">designated port</text>
<rect x="450" y="40" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="525" y="62" text-anchor="middle" class="svg-ink" font-size="13">FLOOR2</text><text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="11">naya root port</text>
<line x1="190" y1="65" x2="450" y2="65" stroke="#64748b" stroke-width="3"/>
<text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="12">1 Proposal</text>
<text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">3 Agreement</text>
<text x="525" y="125" text-anchor="middle" class="svg-muted" font-size="12">2 Sync: baaki non-edge</text>
<text x="525" y="141" text-anchor="middle" class="svg-muted" font-size="12">ports block</text>
<text x="115" y="125" text-anchor="middle" class="svg-muted" font-size="12">4 Port turant forward</text>
<text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">Koi timer nahi: handshake listening aur learning ki jagah leta hai</text>
</svg><p class="cap">Point-to-point link par proposal/agreement handshake.</p></div>

<h3>Link type: point-to-point versus shared</h3>
<p>Handshake sirf <b>point-to-point</b> links par chalta hai. Junos maanta hai ki full-duplex matlab point-to-point, aur half-duplex ya hub matlab shared. Aap ise force kar sakte ho:</p>
<pre class="code">set protocols rstp interface ge-0/0/0 mode point-to-point</pre>
<p>Jo link sach mein shared hai (do switches ke beech hub ya wireless bridge) use point-to-point force mat karo, warna sync logic loop khol sakta hai.</p>

<h3>Edge ports</h3>
<p><b>Edge port</b> end host (PC, printer ya server) ko jodta hai jahan switch ki ummeed nahi. Link up hote hi woh turant forwarding mein jaata hai, handshake skip karta hai aur sabse zaroori, link flap par <b>topology change generate nahi karta</b>. User ka PC reboot karna building ke har switch ka MAC table flush nahi karna chahiye.</p>
<pre class="code">set protocols rstp interface ge-0/0/2 edge</pre>
<p>Lab 1 mein FLOOR2 se real configuration aur verification:</p>
<pre class="out">lab@FLOOR2&gt; show configuration protocols rstp
interface ge-0/0/2 {
    edge;
}

lab@FLOOR2&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.5254c6fcd000    20000  FWD    ROOT
ge-0/0/1                   128:2      128:2     8192.5254c9fcd500    20000  BLK    ALT
ge-0/0/2                   128:3      128:3    32768.525400a77100    20000  <span class="hl">FWD    DESG</span></pre>
<p>PC port designated aur forwarding hai. Edge port par kabhi switch BPDU aa jaaye to RSTP use turant normal port ki tarah treat karta hai, jo safety net hai (protection features Layer 2 security module mein hain).</p>

<h3>Topology changes</h3>
<p>Jab koi non-edge port forwarding mein jaata hai, ya forwarding port kho jaata hai, switch tree mein <b>topology change</b> notification bhejta hai. Jo switch use receive karta hai woh apna <b>MAC table flush</b> kar deta hai (jis port se aaya use chhod kar) taaki traffic naye path par dobara learn ho. Isi liye <code>show spanning-tree bridge</code> <b>Number of topology changes</b> aur <b>Time since last topology change</b> dikhata hai. Lagatar badhta counter flapping uplink ya aise port ka sanket hai jo edge hona chahiye tha.</p>

<h3>Timers ek nazar mein</h3>
<table class="cmp"><tr><th>Item</th><th>802.1D</th><th>RSTP</th></tr>
<tr><td>Hello time</td><td>Sirf root, 2 s</td><td>Har switch, 2 s</td></tr>
<tr><td>Port states</td><td>5</td><td>3</td></tr>
<tr><td>Typical convergence</td><td>30 se 50 s</td><td>Point-to-point links par lagbhag 1 s</td></tr>
<tr><td>Forward delay</td><td>Har phase 15 s</td><td>Sirf fallback</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein FLOOR2 ge-0/0/2 ka PC reboot hota hai. Edge setting ke bina RSTP port ko possible switch link maanta hai: woh handshake se guzarta hai aur har flap topology change bana sakta hai jo poore floor ke MAC tables flush kare. <code>edge</code> ke saath port turant forward karta hai aur kisi aur ko pata nahi chalta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Inter-switch trunk ko edge mark karna: RSTP BPDU notice karne se pehle ke pal mein loop ban sakta hai. PC ports par edge bhool jaana aur phir topology change counters par hairaan hona. Shared media par point-to-point force karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho ki RSTP ka default hello 2 seconds hai, teen missed hellos matlab neighbour gaya, aur edge ports na intezaar karte hain na topology change karte hain. Yaad rakho ki proposal/agreement ko point-to-point link chahiye.</p></div>

<div class="scn"><h4>Printer jisne floor flush kar diya</h4><p>Jab bhi shared printer on hota tha, floor par VoIP calls ek pal ke liye atakti thin. <code>show spanning-tree bridge</code> mein har power-on par topology change counter badhta dikha. Printer port edge port define nahi tha, isliye har link-up topology change aur MAC flush trigger karta tha. Ek <code>set protocols rstp interface ge-0/0/7 edge</code> ne atakna hata diya.</p><p><b>Lesson:</b> har host-facing port ko edge port declare karo.</p></div>

<div class="iv"><p class="q">"RSTP STP se tez kyun converge hota hai?"</p><p>Woh point-to-point links par timer-driven state changes ki jagah proposal/agreement handshake use karta hai, alternate ports pehle se calculate hote hain, har switch BPDUs generate karta hai aur neighbour loss teen hellos mein ya link-down par pakad leta hai. Edge ports turant forward karte hain. Teen states aur lagbhag ek second ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D timers use karta tha (30 se 50 seconds); RSTP handshake (lagbhag ek second).</li>
<li>Proposal/agreement ko point-to-point link chahiye.</li>
<li>Edge ports turant forward karte hain aur topology change nahi banate.</li>
<li>Topology change MAC tables flush karta hai; <code>show spanning-tree bridge</code> mein counter dekho.</li>
<li>Alternate ports instant root-port failover dete hain.</li>
</ul></div>
`}};export{e as default};