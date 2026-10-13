var e={id:`protection-tuning`,h:{en:`Protecting and tuning a multi-tree design`,hi:`Multi-tree design ko protect aur tune karna`},body:{en:`
<p>A well designed MSTP or VSTP network can still be damaged by one wrong cable or one rogue switch. This chapter shows the protection features you must know for JN0-650, plus the timers that matter. The configuration below is shown as <b>configuration</b>, not as device output; the lab for this module does not exercise these features, so no counters are shown.</p>

<h3>Four dangers and four protections</h3>
<table class="cmp"><tr><th>Danger</th><th>Protection</th><th>Statement (ELS)</th></tr>
<tr><td>A user plugs a small switch into a wall port and it joins the tree</td><td>BPDU block on edge ports</td><td><code>set protocols mstp interface ge-0/0/2 edge</code> and <code>set protocols mstp bpdu-block-on-edge</code></td></tr>
<tr><td>A new switch with a better priority takes the root</td><td>Root protection</td><td><code>set protocols mstp interface ge-0/0/1 no-root-port</code></td></tr>
<tr><td>A unidirectional link stops BPDUs and an alternate port starts forwarding: loop</td><td>Loop protection</td><td><code>set protocols mstp interface ge-0/0/1 bpdu-timeout-action block</code></td></tr>
<tr><td>A disabled port should come back by itself after a while</td><td>Auto recovery</td><td><code>set protocols layer2-control bpdu-block disable-timeout 120</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where to apply protections">
<rect x="230" y="20" width="180" height="40" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Distribution (root)</text>
<rect x="60" y="130" width="140" height="40" rx="10" fill="#bbf7d0"/><text x="130" y="155" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<rect x="440" y="130" width="140" height="40" rx="10" fill="#fde68a"/><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="13">Wall port / PC</text>
<line x1="270" y1="60" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><text x="175" y="88" class="svg-accent" font-size="12">loop protection</text>
<line x1="370" y1="60" x2="490" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="420" y="88" class="svg-accent" font-size="12">no-root-port on downlinks</text>
<text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="11">edge + bpdu-block-on-edge</text>
</svg><p class="cap">Protect the edge from users, protect the root from new switches, protect alternates from silent links.</p></div>

<h3>Edge ports and BPDU block</h3>
<p>An <b>edge</b> port goes straight to forwarding because nothing behind it should be a switch. With <code>bpdu-block-on-edge</code> the switch disables the port as soon as it receives a BPDU, instead of letting the rogue device take part. The disabled port stays down until you clear it (<code>clear ethernet-switching bpdu-error</code>) or until a <code>disable-timeout</code> expires.</p>

<h3>Root protection</h3>
<p>If a port with <code>no-root-port</code> receives a superior BPDU, it does <b>not</b> become root port; it moves to a blocking, inconsistent state and recovers when the superior BPDUs stop. Apply it on distribution downlinks that must never lead to the root, and on boundary ports toward other regions where you must keep your CIST root inside your region.</p>

<h3>Loop protection</h3>
<p>RSTP/MSTP assume BPDUs arrive. If a fibre fault breaks only one direction, an alternate port stops hearing BPDUs, assumes the neighbour is gone and starts forwarding: a loop. <code>bpdu-timeout-action block</code> puts the port into a blocked state instead, and it recovers when BPDUs return. Apply it on root and alternate ports of access and distribution links.</p>

<h3>Timers and limits worth knowing</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Notes</th></tr>
<tr><td>Hello time</td><td>2 seconds</td><td>seen in <code>show spanning-tree bridge</code></td></tr>
<tr><td>Maximum age</td><td>20 seconds</td><td>only matters with legacy STP neighbours</td></tr>
<tr><td>Forward delay</td><td>15 seconds</td><td>only used by legacy STP, not by rapid handshakes</td></tr>
<tr><td>MSTP max-hops</td><td>20</td><td><code>set protocols mstp max-hops 20</code>; each BPDU is decremented in the region</td></tr>
<tr><td>Link type</td><td>point-to-point on full duplex</td><td>shared links converge slowly</td></tr></table>
<p>Rapid convergence relies on a <b>proposal and agreement</b> handshake between point-to-point neighbours, not on timers. If a hub or a half-duplex link sits in the path, the handshake fails and the port falls back to timers. For most modern designs, leave the timers at default; change <code>max-hops</code> only if the region is deeper than 20 switches, which is rare.</p>

<h3>Topology changes</h3>
<p>When a non-edge port goes forwarding, the switch sends a topology change notification and neighbours flush their MAC tables for the affected instance or VLAN. A flapping uplink therefore causes repeated MAC flushing and flooding. Edge ports do not trigger it, one more reason to mark every access port as edge.</p>

<div class="warn"><p><b>Common mistakes.</b> Marking an uplink as edge: if it forms a loop, the port forwards immediately and you get a broadcast storm. Putting <code>no-root-port</code> on the uplink toward the real root, which blocks your own root path. Setting very low hop counts. Turning off protections for a test and forgetting to re-enable them.</p></div>
<div class="exam"><p><b>Exam trap.</b> Root protection prevents a port becoming a <b>root port</b>; loop protection prevents an <b>alternate or root</b> port from forwarding when BPDUs stop; BPDU block protects <b>edge</b> ports. Do not mix the three up.</p></div>

<div class="scn"><h4>The desk switch that became root</h4><p>A trainer plugged a 5-port desk switch into a wall port during a workshop. It sent a BPDU with priority 32768 and a low MAC. Because the wall port was not protected, and the desk switch was also plugged into two wall ports by mistake, a short loop and an election followed. After the incident the team set edge plus bpdu-block-on-edge on all access ports with a 120 second disable-timeout and a 60k priority on all access switches.</p><p><b>Lesson:</b> the access layer is where untrusted devices connect; protect it first.</p></div>

<div class="iv"><p class="q">"What is the difference between root guard and loop guard?"</p><p>Root guard (no-root-port on Junos) stops a port from becoming root port when it hears a superior BPDU, protecting your chosen root placement. Loop guard (bpdu-timeout-action block) stops a port from moving to forwarding when BPDUs stop arriving, protecting against unidirectional links. Root guard sits on designated ports toward downstream, loop guard on root and alternate ports.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge + bpdu-block-on-edge protects access ports from rogue switches.</li>
<li>no-root-port (root protection) keeps your root where you put it.</li>
<li>bpdu-timeout-action block (loop protection) stops loops from one-way links.</li>
<li>Defaults: hello 2 s, max age 20 s, forward delay 15 s, max-hops 20.</li>
<li>Edge ports never cause topology change flushes.</li>
</ul></div>
`,hi:`
<p>Achhe se design kiya hua MSTP ya VSTP network bhi ek galat cable ya ek rogue switch se kharab ho sakta hai. Yeh chapter JN0-650 ke liye zaroori protection features aur kaam ke timers batata hai. Neeche configuration <b>configuration</b> ke roop mein hai, device output nahi; is module ka lab in features ko exercise nahi karta, isliye koi counters nahi dikhaye gaye.</p>

<h3>Chaar khatre aur chaar protections</h3>
<table class="cmp"><tr><th>Khatra</th><th>Protection</th><th>Statement (ELS)</th></tr>
<tr><td>User wall port mein chhota switch laga deta hai aur woh tree mein shaamil ho jaata hai</td><td>Edge ports par BPDU block</td><td><code>set protocols mstp interface ge-0/0/2 edge</code> aur <code>set protocols mstp bpdu-block-on-edge</code></td></tr>
<tr><td>Behtar priority wala naya switch root le leta hai</td><td>Root protection</td><td><code>set protocols mstp interface ge-0/0/1 no-root-port</code></td></tr>
<tr><td>Unidirectional link BPDUs rok deta hai aur alternate port forward karne lagta hai: loop</td><td>Loop protection</td><td><code>set protocols mstp interface ge-0/0/1 bpdu-timeout-action block</code></td></tr>
<tr><td>Disabled port kuch der baad khud wapas aana chahiye</td><td>Auto recovery</td><td><code>set protocols layer2-control bpdu-block disable-timeout 120</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Protections kahan lagayein">
<rect x="230" y="20" width="180" height="40" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Distribution (root)</text>
<rect x="60" y="130" width="140" height="40" rx="10" fill="#bbf7d0"/><text x="130" y="155" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text>
<rect x="440" y="130" width="140" height="40" rx="10" fill="#fde68a"/><text x="510" y="155" text-anchor="middle" class="svg-ink" font-size="13">Wall port / PC</text>
<line x1="270" y1="60" x2="150" y2="130" stroke="#64748b" stroke-width="2"/><text x="175" y="88" class="svg-accent" font-size="12">loop protection</text>
<line x1="370" y1="60" x2="490" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="420" y="88" class="svg-accent" font-size="12">downlinks par no-root-port</text>
<text x="510" y="190" text-anchor="middle" class="svg-muted" font-size="11">edge + bpdu-block-on-edge</text>
</svg><p class="cap">Edge ko users se bachao, root ko naye switches se, alternates ko chup links se.</p></div>

<h3>Edge ports aur BPDU block</h3>
<p><b>Edge</b> port seedha forwarding mein jaata hai kyunki uske peeche switch nahi hona chahiye. <code>bpdu-block-on-edge</code> ke saath switch BPDU milte hi port disable kar deta hai, rogue device ko tree mein shaamil hone ki jagah. Disabled port tab tak down rehta hai jab tak aap clear na karo (<code>clear ethernet-switching bpdu-error</code>) ya <code>disable-timeout</code> khatam na ho.</p>

<h3>Root protection</h3>
<p><code>no-root-port</code> wale port ko superior BPDU mile to woh root port <b>nahi</b> banta; woh blocking, inconsistent state mein jaata hai aur superior BPDUs band hone par recover hota hai. Isse distribution downlinks par lagao jo kabhi root ki taraf nahi jaane chahiye, aur doosre regions ki taraf boundary ports par jahan CIST root apne region ke andar rakhna hai.</p>

<h3>Loop protection</h3>
<p>RSTP/MSTP maante hain ki BPDUs aate rahenge. Fibre fault sirf ek direction tod de to alternate port BPDU sunna band kar deta hai, maan leta hai ki neighbour gaya, aur forward karne lagta hai: loop. <code>bpdu-timeout-action block</code> port ko blocked state mein rakhta hai, aur BPDUs wapas aane par recover hota hai. Access aur distribution links ke root aur alternate ports par lagao.</p>

<h3>Kaam ke timers aur limits</h3>
<table class="cmp"><tr><th>Setting</th><th>Default</th><th>Notes</th></tr>
<tr><td>Hello time</td><td>2 seconds</td><td><code>show spanning-tree bridge</code> mein dikhta hai</td></tr>
<tr><td>Maximum age</td><td>20 seconds</td><td>sirf legacy STP neighbours ke saath matter karta hai</td></tr>
<tr><td>Forward delay</td><td>15 seconds</td><td>sirf legacy STP use karta hai, rapid handshake nahi</td></tr>
<tr><td>MSTP max-hops</td><td>20</td><td><code>set protocols mstp max-hops 20</code>; region mein har BPDU ka hop count ghatta hai</td></tr>
<tr><td>Link type</td><td>full duplex par point-to-point</td><td>shared links dheere converge karte hain</td></tr></table>
<p>Rapid convergence point-to-point neighbours ke beech <b>proposal aur agreement</b> handshake par chalta hai, timers par nahi. Raste mein hub ya half-duplex link ho to handshake fail hota hai aur port timers par aa jaata hai. Zyadatar modern designs mein timers default rakho; <code>max-hops</code> sirf tab badlo jab region 20 switches se gehra ho, jo bahut kam hota hai.</p>

<h3>Topology changes</h3>
<p>Jab koi non-edge port forwarding mein jaata hai, switch topology change notification bhejta hai aur neighbours us instance ya VLAN ke liye MAC tables flush karte hain. Flapping uplink isliye baar-baar MAC flush aur flooding karata hai. Edge ports yeh trigger nahi karte, isliye har access port ko edge mark karna ek aur wajah hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Uplink ko edge mark karna: loop bane to port turant forward karta hai aur broadcast storm aata hai. Asli root ki taraf wale uplink par <code>no-root-port</code> lagana, jo aapka apna root path block kar deta hai. Bahut kam hop count set karna. Test ke liye protections band karke dobara on karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Root protection port ko <b>root port</b> banne se rokta hai; loop protection BPDUs band hone par <b>alternate ya root</b> port ko forward karne se rokta hai; BPDU block <b>edge</b> ports ko protect karta hai. Teeno mix mat karo.</p></div>

<div class="scn"><h4>Desk switch jo root ban gaya</h4><p>Workshop ke dauran ek trainer ne wall port mein 5-port desk switch laga diya. Usne priority 32768 aur chhote MAC wala BPDU bheja. Wall port protected nahi tha, aur desk switch galti se do wall ports mein bhi laga tha, to chhota loop aur election hua. Incident ke baad team ne saare access ports par edge plus bpdu-block-on-edge 120 second disable-timeout ke saath, aur saare access switches par 60k priority lagayi.</p><p><b>Lesson:</b> access layer wahan hai jahan untrusted devices judte hain; pehle use protect karo.</p></div>

<div class="iv"><p class="q">"Root guard aur loop guard mein kya fark hai?"</p><p>Root guard (Junos mein no-root-port) superior BPDU sunne par port ko root port banne se rokta hai, aapke chune hue root placement ki raksha karta hai. Loop guard (bpdu-timeout-action block) BPDUs aana band hone par port ko forwarding mein jaane se rokta hai, unidirectional links se bachata hai. Root guard downstream ki taraf wale designated ports par, loop guard root aur alternate ports par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Edge + bpdu-block-on-edge access ports ko rogue switches se bachata hai.</li>
<li>no-root-port (root protection) aapka root wahin rakhta hai jahan aapne rakha.</li>
<li>bpdu-timeout-action block (loop protection) one-way links se loops rokta hai.</li>
<li>Defaults: hello 2 s, max age 20 s, forward delay 15 s, max-hops 20.</li>
<li>Edge ports topology change flush trigger nahi karte.</li>
</ul></div>
`}};export{e as default};