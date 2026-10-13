var e={id:`states-timers`,h:{en:`802.1D port states, timers and topology changes`,hi:`802.1D port states, timers aur topology changes`},body:{en:`
<p>When the traffic police open a new road at a busy junction, they do not simply lift the barrier. First they watch for a while to be sure no other road is still feeding the same junction (<b>listening</b>). Then they note where cars want to go and put up signs (<b>learning</b>). Only then do they wave traffic through (<b>forwarding</b>). Classic 802.1D does exactly this, and because it waits on fixed timers rather than asking its neighbours, it is slow. Understanding the slowness is the best way to appreciate RSTP in the next chapter.</p>

<h3>The five 802.1D port states</h3>
<table class="cmp"><tr><th>State</th><th>Receives BPDUs</th><th>Sends BPDUs</th><th>Learns MACs</th><th>Forwards data</th><th>How long</th></tr>
<tr><td><b>Blocking</b></td><td>Yes</td><td>No</td><td>No</td><td>No</td><td>Until chosen as RP or DP (up to 20 s max age after an indirect failure)</td></tr>
<tr><td><b>Listening</b></td><td>Yes</td><td>Yes</td><td>No</td><td>No</td><td>15 s (forward delay)</td></tr>
<tr><td><b>Learning</b></td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td><td>15 s (forward delay)</td></tr>
<tr><td><b>Forwarding</b></td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Stable</td></tr>
<tr><td><b>Disabled</b></td><td>No</td><td>No</td><td>No</td><td>No</td><td>Shut down or failed</td></tr>
</table>
<p>Blocking and forwarding are <b>stable</b> states; listening and learning are <b>transitional</b>. Listening gives the network time to settle so that a port does not open while an old path is still active. Learning fills the MAC table before forwarding begins, so the switch does not flood everything it receives the moment it opens. In <code>show spanning-tree</code> output the Sts column shows <code>BLK</code>, <code>LIS</code>, <code>LRN</code> and <code>FWD</code>.</p>

<h3>The three timers</h3>
<dl class="terms">
<dt>Hello time, 2 s</dt><dd>How often the root sends configuration BPDUs.</dd>
<dt>Max age, 20 s</dt><dd>How long a switch keeps the best BPDU it heard on a port after BPDUs stop arriving. Ten missed hellos.</dd>
<dt>Forward delay, 15 s</dt><dd>Time spent in listening, and again in learning.</dd>
</dl>
<p>Only the <b>root's</b> timers matter: they travel inside its BPDUs and every switch uses them. You can change them on the root with <code>spanning-tree vlan 10 hello-time</code>, <code>forward-time</code> and <code>max-age</code>, but the defaults are tuned for a network diameter of seven switches and changing them is rarely wise. Moving to RSTP is the right answer to slow convergence.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1D convergence timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="70" width="200" height="60" rx="6" fill="#e2e8f0"/><text x="140" y="96" text-anchor="middle" class="svg-ink" font-size="13">Blocking</text><text x="140" y="116" text-anchor="middle" class="svg-muted" font-size="12">wait max age 20 s</text>
<rect x="240" y="70" width="150" height="60" rx="6" fill="#fde68a"/><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="13">Listening</text><text x="315" y="116" text-anchor="middle" class="svg-muted" font-size="12">15 s</text>
<rect x="390" y="70" width="150" height="60" rx="6" fill="#fed7aa"/><text x="465" y="96" text-anchor="middle" class="svg-ink" font-size="13">Learning</text><text x="465" y="116" text-anchor="middle" class="svg-muted" font-size="12">15 s</text>
<rect x="540" y="70" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="13">FWD</text>
<text x="40" y="150" class="svg-muted" font-size="12">0 s</text><text x="232" y="150" class="svg-muted" font-size="12">20 s</text><text x="382" y="150" class="svg-muted" font-size="12">35 s</text><text x="530" y="150" class="svg-muted" font-size="12">50 s</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">indirect failure: 20 + 15 + 15 = 50 s</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">direct failure: skip the 20 s, 30 s total</text>
</svg><p class="cap">Classic STP convergence after a failure. Users lose connectivity for the whole time.</p></div>

<h3>Direct and indirect failures</h3>
<ul>
<li><b>Direct failure</b>: the switch's <b>own</b> root port goes down. The switch knows immediately, picks its best blocked port as the new root port, and runs it through listening and learning: <b>30 seconds</b>.</li>
<li><b>Indirect failure</b>: a link <b>elsewhere</b> fails. The switch's blocked port simply stops hearing the good BPDUs that used to arrive. It must wait until the stored information expires (<b>max age, 20 s</b>) before it re-evaluates, then listening and learning: <b>50 seconds</b>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In the lab running PVST+ with defaults, SW2 Gi0/2 blocks for VLAN 10 (chapter 6). If the SW1-SW3 link fails, SW3 loses its root port directly, and its only remaining path to the root is through SW2. But SW2 Gi0/2 is blocking, so SW2 must first decide that its end should now be designated and then run Gi0/2 through listening (15 s) and learning (15 s). If SW2 also has to wait for the old information on Gi0/2 to age out (max age), the outage stretches toward 50 s. PC1 is cut off for 30 to 50 seconds. Under Rapid PVST+ the same failure is repaired in about a second (chapter 8).</p></div>

<h3>Topology changes and MAC aging</h3>
<p>After the tree changes, MAC tables still point along the old paths. With the normal aging time of 300 seconds, some traffic would be sent into a dead end for up to five minutes. 802.1D handles this with the <b>topology change</b> process:</p>
<ol>
<li>A switch that sees a port go to forwarding, or a forwarding port go down, sends a <b>TCN BPDU</b> out of its root port, repeating every hello until acknowledged.</li>
<li>The upstream switch acknowledges with the <b>TCA</b> flag and relays the TCN toward the root.</li>
<li>The root sets the <b>TC flag</b> in its configuration BPDUs for max age + forward delay (<b>35 s</b>).</li>
<li>Every switch that sees the TC flag shortens its MAC aging time from 300 s to <b>forward delay, 15 s</b>, so stale entries disappear quickly and are relearned.</li>
</ol>
<p>The side effect: more flooding while the entries are relearned. A host port that flaps many times a day without PortFast keeps triggering topology changes and needless flooding. The counters are in <code>show spanning-tree detail</code>:</p>
<pre class="out">SW3# show spanning-tree vlan 10 detail | include ieee|Number|from
 VLAN0010 is executing the ieee compatible Spanning Tree protocol
<span class="hl">  Number of topology changes 41 last change occurred 00:00:12 ago</span>
<span class="hl">          from GigabitEthernet0/5</span></pre>

<p>Cisco added three proprietary fixes for 802.1D's slowness: <b>PortFast</b> (host ports go straight to forwarding and never cause a TC), <b>UplinkFast</b> (an access switch's backup uplink takes over in a few seconds) and <b>BackboneFast</b> (skip the max age wait after an indirect failure). RSTP builds the ideas of all three into the standard, so on Rapid PVST+ only PortFast is still configured.</p>

<div class="warn"><p><b>Common mistake.</b> Lowering forward delay and max age on one non-root switch to "speed things up". Timers come from the root's BPDUs, so the change has no effect unless it is made on the root, and aggressive values on the root can create loops in a larger network.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learning state <b>does</b> learn MAC addresses but does <b>not</b> forward. Listening does neither. Blocking still <b>receives</b> BPDUs. And 30 s (direct) versus 50 s (indirect) is a favourite calculation.</p></div>

<div class="scn"><h4>PCs with 169.254 addresses every morning</h4><p>An office still running PVST+ had PCs that often booted with a 169.254.x.x address. The desk ports had no PortFast, so after power-on each port spent 30 seconds in listening and learning. Fast-booting PCs sent their DHCP Discovers during that time, received no answer, and fell back to link-local addresses. Enabling PortFast on the access ports (and later moving to Rapid PVST+) fixed it, and the topology change counter stopped climbing every morning.</p><p><b>Lesson:</b> 802.1D timers delay every host port by 30 seconds unless PortFast is enabled.</p></div>

<div class="iv"><p class="q">"Why can classic STP take 50 seconds to converge?"</p><p>Strong answer: after an indirect failure the blocked port keeps the old best BPDU until max age (20 s) expires, then passes through listening (15 s forward delay) and learning (15 s) before forwarding. A direct failure skips max age, so 30 s. Explain what listening and learning are for, mention the topology change process that shortens MAC aging to 15 s, and add that RSTP replaces the timers with a handshake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D states: blocking, listening, learning, forwarding, disabled; only forwarding sends data.</li>
<li>Timers from the root: hello 2 s, max age 20 s, forward delay 15 s.</li>
<li>Direct failure about 30 s; indirect failure about 50 s.</li>
<li>TCN goes up to the root, the root sets TC for 35 s, and MAC aging drops to 15 s.</li>
<li>PortFast, UplinkFast and BackboneFast patched 802.1D; RSTP makes them standard behaviour.</li>
</ul></div>
`,hi:`
<p>Jab traffic police kisi busy junction par nayi road kholti hai, woh bas barrier nahi utha deti. Pehle kuch der dekhti hai ki koi doosri road abhi bhi usi junction ko feed to nahi kar rahi (<b>listening</b>). Phir note karti hai ki gaadiyan kahan jaana chahti hain aur signs lagati hai (<b>learning</b>). Tabhi traffic ko aage badhne deti hai (<b>forwarding</b>). Classic 802.1D bilkul yahi karta hai, aur kyunki woh neighbours se poochne ki jagah fixed timers par wait karta hai, woh slow hai. Is slowness ko samajhna agle chapter mein RSTP ki value samajhne ka best tareeka hai.</p>

<h3>802.1D ke paanch port states</h3>
<table class="cmp"><tr><th>State</th><th>BPDUs receive</th><th>BPDUs send</th><th>MACs learn</th><th>Data forward</th><th>Kitni der</th></tr>
<tr><td><b>Blocking</b></td><td>Haan</td><td>Nahi</td><td>Nahi</td><td>Nahi</td><td>Jab tak RP ya DP na chuna jaaye (indirect failure ke baad 20 s max age tak)</td></tr>
<tr><td><b>Listening</b></td><td>Haan</td><td>Haan</td><td>Nahi</td><td>Nahi</td><td>15 s (forward delay)</td></tr>
<tr><td><b>Learning</b></td><td>Haan</td><td>Haan</td><td>Haan</td><td>Nahi</td><td>15 s (forward delay)</td></tr>
<tr><td><b>Forwarding</b></td><td>Haan</td><td>Haan</td><td>Haan</td><td>Haan</td><td>Stable</td></tr>
<tr><td><b>Disabled</b></td><td>Nahi</td><td>Nahi</td><td>Nahi</td><td>Nahi</td><td>Shut down ya failed</td></tr>
</table>
<p>Blocking aur forwarding <b>stable</b> states hain; listening aur learning <b>transitional</b> hain. Listening network ko settle hone ka time deta hai taaki koi port tab na khule jab purana path abhi bhi active ho. Learning forwarding shuru hone se pehle MAC table bharta hai, taaki switch khulte hi jo mile use flood na kare. <code>show spanning-tree</code> output mein Sts column <code>BLK</code>, <code>LIS</code>, <code>LRN</code> aur <code>FWD</code> dikhata hai.</p>

<h3>Teen timers</h3>
<dl class="terms">
<dt>Hello time, 2 s</dt><dd>Root kitni baar configuration BPDUs bhejta hai.</dd>
<dt>Max age, 20 s</dt><dd>BPDUs aana band hone ke baad switch port par suna hua best BPDU kitni der rakhta hai. Das missed hellos.</dd>
<dt>Forward delay, 15 s</dt><dd>Listening mein bitaya time, aur phir learning mein bhi.</dd>
</dl>
<p>Sirf <b>root</b> ke timers matter karte hain: woh uske BPDUs ke andar travel karte hain aur har switch unhe use karta hai. Aap root par <code>spanning-tree vlan 10 hello-time</code>, <code>forward-time</code> aur <code>max-age</code> se unhe badal sakte ho, lekin defaults saat switches ke network diameter ke liye tuned hain aur unhe badalna shayad hi samajhdari hai. Slow convergence ka sahi jawab RSTP par jaana hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1D convergence timeline">
<line x1="40" y1="100" x2="610" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="40" y="70" width="200" height="60" rx="6" fill="#e2e8f0"/><text x="140" y="96" text-anchor="middle" class="svg-ink" font-size="13">Blocking</text><text x="140" y="116" text-anchor="middle" class="svg-muted" font-size="12">max age 20 s wait</text>
<rect x="240" y="70" width="150" height="60" rx="6" fill="#fde68a"/><text x="315" y="96" text-anchor="middle" class="svg-ink" font-size="13">Listening</text><text x="315" y="116" text-anchor="middle" class="svg-muted" font-size="12">15 s</text>
<rect x="390" y="70" width="150" height="60" rx="6" fill="#fed7aa"/><text x="465" y="96" text-anchor="middle" class="svg-ink" font-size="13">Learning</text><text x="465" y="116" text-anchor="middle" class="svg-muted" font-size="12">15 s</text>
<rect x="540" y="70" width="70" height="60" rx="6" fill="#bbf7d0"/><text x="575" y="104" text-anchor="middle" class="svg-ink" font-size="13">FWD</text>
<text x="40" y="150" class="svg-muted" font-size="12">0 s</text><text x="232" y="150" class="svg-muted" font-size="12">20 s</text><text x="382" y="150" class="svg-muted" font-size="12">35 s</text><text x="530" y="150" class="svg-muted" font-size="12">50 s</text>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">indirect failure: 20 + 15 + 15 = 50 s</text>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="13">direct failure: 20 s skip, total 30 s</text>
</svg><p class="cap">Failure ke baad classic STP convergence. Is poore time users ki connectivity gayab rehti hai.</p></div>

<h3>Direct aur indirect failures</h3>
<ul>
<li><b>Direct failure</b>: switch ka <b>apna</b> root port down hota hai. Switch ko turant pata chalta hai, woh apne best blocked port ko naya root port chunta hai, aur use listening aur learning se guzarta hai: <b>30 second</b>.</li>
<li><b>Indirect failure</b>: <b>kahin aur</b> ka link fail hota hai. Switch ke blocked port par woh acche BPDUs aana bas band ho jaate hain jo pehle aate the. Use stored information expire hone (<b>max age, 20 s</b>) tak wait karna padta hai, tab re-evaluate karta hai, phir listening aur learning: <b>50 second</b>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Defaults ke saath PVST+ chalate lab mein VLAN 10 ke liye SW2 Gi0/2 block karta hai (chapter 6). Agar SW1-SW3 link fail ho, SW3 ka root port directly chala jaata hai, aur root tak uska bacha hua akela path SW2 ke through hai. Lekin SW2 Gi0/2 blocking hai, isliye SW2 ko pehle decide karna padta hai ki uska end ab designated hona chahiye, aur phir Gi0/2 ko listening (15 s) aur learning (15 s) se guzarna padta hai. Agar SW2 ko Gi0/2 par purani information ke age out hone (max age) ka bhi wait karna pade, to outage 50 s ki taraf badh jaata hai. PC1 30 se 50 second tak kata rehta hai. Rapid PVST+ mein wahi failure lagbhag ek second mein repair hota hai (chapter 8).</p></div>

<h3>Topology changes aur MAC aging</h3>
<p>Tree badalne ke baad MAC tables abhi bhi purane paths ki taraf point karti hain. Normal aging time 300 second ke saath kuch traffic paanch minute tak dead end mein bheja jaata. 802.1D ise <b>topology change</b> process se handle karta hai:</p>
<ol>
<li>Jo switch kisi port ko forwarding mein jaate, ya forwarding port ko down hote dekhta hai, woh apne root port se <b>TCN BPDU</b> bhejta hai, acknowledge hone tak har hello par repeat karta hai.</li>
<li>Upstream switch <b>TCA</b> flag se acknowledge karta hai aur TCN ko root ki taraf relay karta hai.</li>
<li>Root apne configuration BPDUs mein max age + forward delay (<b>35 s</b>) ke liye <b>TC flag</b> set karta hai.</li>
<li>TC flag dekhne wala har switch apna MAC aging time 300 s se ghata kar <b>forward delay, 15 s</b> kar deta hai, taaki stale entries jaldi gayab hon aur dobara learn hon.</li>
</ol>
<p>Side effect: entries dobara learn hone tak zyada flooding. Bina PortFast wala host port jo din mein kai baar flap karta hai, baar-baar topology changes aur bekaar flooding trigger karta rehta hai. Counters <code>show spanning-tree detail</code> mein hain:</p>
<pre class="out">SW3# show spanning-tree vlan 10 detail | include ieee|Number|from
 VLAN0010 is executing the ieee compatible Spanning Tree protocol
<span class="hl">  Number of topology changes 41 last change occurred 00:00:12 ago</span>
<span class="hl">          from GigabitEthernet0/5</span></pre>

<p>Cisco ne 802.1D ki slowness ke liye teen proprietary fixes jode: <b>PortFast</b> (host ports seedha forwarding mein jaate hain aur kabhi TC nahi karte), <b>UplinkFast</b> (access switch ka backup uplink kuch second mein le leta hai) aur <b>BackboneFast</b> (indirect failure ke baad max age wait skip). RSTP teeno ke ideas standard mein bana deta hai, isliye Rapid PVST+ par sirf PortFast abhi bhi configure hota hai.</p>

<div class="warn"><p><b>Common galti.</b> Ek non-root switch par "speed badhane ke liye" forward delay aur max age kam karna. Timers root ke BPDUs se aate hain, isliye jab tak change root par na ho uska koi asar nahi, aur root par aggressive values bade network mein loops bana sakti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learning state MAC addresses <b>learn karta hai</b> lekin forward <b>nahi</b> karta. Listening dono nahi karta. Blocking phir bhi BPDUs <b>receive</b> karta hai. Aur 30 s (direct) versus 50 s (indirect) favourite calculation hai.</p></div>

<div class="scn"><h4>Har subah 169.254 addresses wale PCs</h4><p>Abhi bhi PVST+ chalane wale ek office ke PCs aksar 169.254.x.x address ke saath boot hote the. Desk ports par PortFast nahi tha, isliye power-on ke baad har port 30 second listening aur learning mein bitata tha. Tez boot hone wale PCs usi time DHCP Discovers bhejte, koi jawab nahi milta, aur link-local addresses par gir jaate. Access ports par PortFast enable karne se (aur baad mein Rapid PVST+ par jaane se) yeh theek hua, aur topology change counter har subah badhna band ho gaya.</p><p><b>Seekh:</b> jab tak PortFast enable na ho, 802.1D timers har host port ko 30 second delay karte hain.</p></div>

<div class="iv"><p class="q">"Classic STP ko converge hone mein 50 second kyun lag sakte hain?"</p><p>Strong answer: indirect failure ke baad blocked port purana best BPDU tab tak rakhta hai jab tak max age (20 s) expire na ho, phir forwarding se pehle listening (15 s forward delay) aur learning (15 s) se guzarta hai. Direct failure max age skip karta hai, isliye 30 s. Samjhao ki listening aur learning kis liye hain, topology change process ka zikr karo jo MAC aging ko 15 s kar deta hai, aur jodo ki RSTP timers ki jagah handshake use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1D states: blocking, listening, learning, forwarding, disabled; sirf forwarding data bhejta hai.</li>
<li>Root se timers: hello 2 s, max age 20 s, forward delay 15 s.</li>
<li>Direct failure lagbhag 30 s; indirect failure lagbhag 50 s.</li>
<li>TCN root tak upar jaata hai, root 35 s ke liye TC set karta hai, aur MAC aging 15 s ho jaati hai.</li>
<li>PortFast, UplinkFast aur BackboneFast ne 802.1D ko patch kiya; RSTP inhe standard behaviour bana deta hai.</li>
</ul></div>
`}};export{e as default};