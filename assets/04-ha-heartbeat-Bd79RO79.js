var e={id:`ha-heartbeat`,h:{en:`The heartbeat: design, timers and split brain`,hi:`Heartbeat: design, timers aur split brain`},body:{en:`
<p>Two pilots share one cockpit. They talk over an intercom all the time. If the intercom dies, each pilot must decide: "is my colleague unconscious, or is it only the intercom?" A bad pilot assumes the worst and grabs the control stick, and now two people fly one aircraft. In an FGCP cluster the intercom is the <b>heartbeat</b>, and the two-hands-on-the-stick disaster is <b>split brain</b>. This chapter shows how to build a heartbeat that does not die, how its timers work, and what to do when it dies anyway.</p>

<h3>What the heartbeat carries</h3>
<p>The heartbeat is not just "I am alive". Over the <code>hbdev</code> interfaces the units exchange hello packets (identity, priority, age, failure counters), configuration synchronisation, checksums and, if enabled, session pickup data. It uses its own Ethernet types and needs no IP address. The three ethertypes have these defaults: <code>ha-eth-type</code> 8890, <code>hc-eth-type</code> 8891 and <code>l2ep-eth-type</code> 8893. You change them only when a switch or another cluster in the same Layer 2 segment conflicts with them.</p>

<h3>Designing the heartbeat links</h3>
<ul>
<li><b>Dedicated interfaces.</b> Never share a heartbeat port with user traffic: a busy data link delays hellos and can cause a false failover.</li>
<li><b>At least two links.</b> The lab uses <code>hbdev "port3" 100 "port4" 50</code>. One cable can be pulled by accident; two cables on two different NICs survive that.</li>
<li><b>Direct cable or switch?</b> A direct (back-to-back) cable has no third device that can fail, as in the lab: FGT-A:port3 - FGT-B:port3. When the units sit in different racks, use a switch, but then give heartbeat its own isolated VLAN, never the user VLAN, and prefer two separate switches for the two links so no single switch kills both.</li>
<li><b>Protect it.</b> The heartbeat carries your configuration and sessions. On a shared switch, turn on <code>set encryption enable</code> and <code>set authentication enable</code>. Both units must have the same values. The price is some CPU; in a sealed direct cable it is normally left off.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Heartbeat designs">
<rect x="20" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">port3, port4</text>
<rect x="240" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="305" y="46" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text><text x="305" y="64" text-anchor="middle" class="svg-muted" font-size="12">port3, port4</text>
<line x1="150" y1="40" x2="240" y2="40" stroke="#64748b" stroke-width="4"/><line x1="150" y1="62" x2="240" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="195" y="100" text-anchor="middle" class="svg-accent" font-size="12">Design 1: back to back</text>
<rect x="400" y="20" width="100" height="40" rx="8" fill="#bae6fd"/><text x="450" y="45" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text>
<rect x="540" y="20" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="585" y="45" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text>
<rect x="430" y="110" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="465" y="130" text-anchor="middle" class="svg-ink" font-size="12">SW-1</text>
<rect x="540" y="110" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="575" y="130" text-anchor="middle" class="svg-ink" font-size="12">SW-2</text>
<line x1="440" y1="60" x2="455" y2="110" stroke="#64748b" stroke-width="2"/><line x1="585" y1="60" x2="580" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="125" x2="540" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="520" y="170" text-anchor="middle" class="svg-accent" font-size="12">Design 2: two switches, own VLAN</text>
<rect x="20" y="150" width="340" height="60" rx="8" fill="#fde68a"/><text x="190" y="175" text-anchor="middle" class="svg-ink" font-size="12">Never: heartbeat on a user data port</text><text x="190" y="195" text-anchor="middle" class="svg-muted" font-size="12">one busy link, one shared failure domain</text>
</svg><p class="cap">Good heartbeat designs: a direct cable pair, or two links over two isolated switches.</p></div>

<h3>The timers: how fast is "dead"?</h3>
<p>Three attributes decide how quickly a lost heartbeat is noticed:</p>
<ul>
<li><code>hb-interval</code>: time between hellos in units of 100 ms. Default <b>2</b> = 200 ms (range 1-20).</li>
<li><code>hb-lost-threshold</code>: how many hellos may be missed before the link counts as lost. Default <b>6</b> (range 1-60).</li>
<li><code>helo-holddown</code>: seconds a unit that has just joined waits before it declares itself ready. Default <b>20</b>.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Defaults: 2 x 100 ms = 200 ms per hello; 6 missed hellos = 1.2 seconds until the link is lost. A busy virtual lab with a slow hypervisor switch might need <code>hb-interval 5</code> and <code>hb-lost-threshold 10</code>: 5 x 100 ms = 500 ms, x 10 = 5 seconds. Failover is slower, but you stop false positives. Rule: lower values = faster failover but more false alarms; higher = calmer but slower.</p></div>
<div class="note"><p>Honest scope: in the lab the heartbeat is either up or down, and the simulator reacts at once. The timing maths above is real FortiOS behaviour, but you cannot watch the 1.2 seconds.</p></div>

<h3>Split brain</h3>
<p>If every heartbeat path fails but both units are healthy, each unit stops seeing the peer. The rule "no peer, so I am the only member" makes <b>both</b> units primary. Typical causes: all hbdev cables or ports down, a typo in <code>hbdev</code> (wrong port), a mismatch of group-id, group-name, password, encryption or authentication, or a switch between the units that blocks the heartbeat ethertype.</p>
<pre class="code"><span class="c">! The typo that causes it: FGT-B listens on port5, not port3</span>
config system ha
    set hbdev "port5" 100
end</pre>
<pre class="out">FGT-B # get system ha status
<span class="hl">HA Health Status: WARNING: only one member is present, the heartbeat finds no peer</span>
Model: FortiGate-VM64
Mode: HA A-P
Group Name: NILGIRI-HA
Group ID: 20
Primary selected using:
    &lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">it is the only member in the cluster</span>.
Primary     : FGT-B           , FGVMEV1OO2UZP000, HA cluster index = 0
number of vcluster: 1</pre>
<p>Symptoms: both units show themselves as primary and a single member; both answer on the virtual MAC <code>00:09:0f:09:14:00</code>, so the switch flaps that MAC between two ports; hosts see duplicate-address or intermittent loss; the same IP appears on two units. Each unit also keeps its own sessions and its own copy of the configuration, so changes made on one side do not reach the other.</p>
<p><b>Recovery.</b> Repair the heartbeat (cable, <code>hbdev</code>, matching group settings). The units see each other and hold a new election using the rules of chapter 5. The loser becomes secondary and takes the winner's configuration, so anything changed on the loser during the split is lost, and sessions that were only on the loser die. That is why you save both configurations <i>before</i> you reconnect.</p>

<h3>Session sync interface (theory)</h3>
<p>With a lot of session pickup traffic, the heartbeat can become crowded. FortiOS offers <code>session-sync-dev</code>, a separate interface only for session synchronisation, so the heartbeat stays light. It is not modelled in the lab.</p>

<div class="warn"><p><b>Common mistake.</b> One heartbeat cable, or two heartbeat ports on the same NIC chip. A single failed cable then splits the brain although the data network is perfect. Also: changing <code>password</code> on one unit only.</p></div>

<div class="exam"><p><b>Exam trap.</b> The units do not raise an alarm when the settings mismatch; they just fail to cluster. And the default timers are 200 ms and 6 misses (1.2 s), not 6 seconds.</p></div>

<div class="scn"><h4>The patched cable</h4><p>At a Chennai site the weekend team re-patched the heartbeat cable of a pair into a switch port that was in a user VLAN. Monday morning users complained about slow web. Both units said <code>HA Health Status: WARNING</code> and both were primary; the core switch logged the cluster MAC moving between two ports every few seconds. The engineer put the cable back to the isolated VLAN, saved both configurations, and the pair re-elected within seconds. A policy edited on the wrong unit during the split was overwritten by the winner and had to be redone.</p><p><b>Lesson:</b> keep heartbeat on isolated, labelled ports, and back up both units before healing a split.</p></div>

<div class="iv"><p class="q">"What is split brain in an HA cluster and how do you prevent it?"</p><p>Both units think the peer is gone, so both become primary and answer on the same virtual MAC and IP. Prevent it with two or more dedicated heartbeat links on separate NICs, ideally direct cables or two isolated switches, matching group settings, and monitored interfaces. Mention that after healing, the loser takes the winner's configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The heartbeat carries hellos, configuration sync and session data; use at least two dedicated links.</li>
<li>Defaults: hb-interval 2 (200 ms), hb-lost-threshold 6 (1.2 s), helo-holddown 20 s; ethertypes 8890, 8891, 8893.</li>
<li>Encrypt and authenticate the heartbeat on shared switches, with identical settings on both units.</li>
<li>Split brain = two primaries, flapping virtual MAC, WARNING health line.</li>
<li>Healing triggers a new election; the loser's changes and sessions are lost.</li>
</ul></div>
`,hi:`
<p>Do pilots ek cockpit share karte hain. Woh intercom par hamesha baat karte rehte hain. Agar intercom mar jaye to har pilot ko decide karna padta hai: "mera colleague behosh hai, ya sirf intercom kharab hai?" Bura pilot sabse bura maan leta hai aur control stick pakad leta hai, aur ab do log ek aircraft udaa rahe hain. FGCP cluster mein intercom <b>heartbeat</b> hai, aur do-haath-stick-par wala disaster <b>split brain</b> hai. Is chapter mein aap seekhoge ki aisa heartbeat kaise banayein jo mare nahi, uske timers kaise kaam karte hain, aur agar phir bhi mar jaye to kya karein.</p>

<h3>Heartbeat kya carry karta hai</h3>
<p>Heartbeat sirf "main zinda hoon" nahi hai. <code>hbdev</code> interfaces par units hello packets (identity, priority, age, failure counters), configuration synchronisation, checksums aur, agar enabled ho, to session pickup data exchange karte hain. Yeh apne alag Ethernet types use karta hai aur isme IP address ki zaroorat nahi. Teen ethertypes ke defaults: <code>ha-eth-type</code> 8890, <code>hc-eth-type</code> 8891 aur <code>l2ep-eth-type</code> 8893. Inhe tabhi badlo jab koi switch ya usi Layer 2 segment ka doosra cluster inse conflict kare.</p>

<h3>Heartbeat links ka design</h3>
<ul>
<li><b>Dedicated interfaces.</b> Heartbeat port ko user traffic ke saath kabhi share mat karo: busy data link hellos ko late karta hai aur false failover ho sakta hai.</li>
<li><b>Kam se kam do links.</b> Lab mein <code>hbdev "port3" 100 "port4" 50</code> hai. Ek cable galti se nikal sakti hai; do alag NICs par do cables isse bach jaate hain.</li>
<li><b>Direct cable ya switch?</b> Direct (back-to-back) cable mein koi teesra device nahi hota jo fail ho sake, jaise lab mein: FGT-A:port3 - FGT-B:port3. Jab units alag racks mein hon to switch use karo, par heartbeat ko apna isolated VLAN do, user VLAN kabhi nahi, aur do links ke liye do alag switches rakho taaki ek switch dono ko na maare.</li>
<li><b>Ise protect karo.</b> Heartbeat aapki configuration aur sessions carry karta hai. Shared switch par <code>set encryption enable</code> aur <code>set authentication enable</code> lagao. Dono units par values same honi chahiye. Keemat thoda CPU hai; sealed direct cable mein aam taur par off rakhte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Heartbeat designs">
<rect x="20" y="20" width="130" height="60" rx="8" fill="#bae6fd"/><text x="85" y="46" text-anchor="middle" class="svg-ink" font-size="14">FGT-A</text><text x="85" y="64" text-anchor="middle" class="svg-muted" font-size="12">port3, port4</text>
<rect x="240" y="20" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="305" y="46" text-anchor="middle" class="svg-ink" font-size="14">FGT-B</text><text x="305" y="64" text-anchor="middle" class="svg-muted" font-size="12">port3, port4</text>
<line x1="150" y1="40" x2="240" y2="40" stroke="#64748b" stroke-width="4"/><line x1="150" y1="62" x2="240" y2="62" stroke="#64748b" stroke-width="2"/>
<text x="195" y="100" text-anchor="middle" class="svg-accent" font-size="12">Design 1: back to back</text>
<rect x="400" y="20" width="100" height="40" rx="8" fill="#bae6fd"/><text x="450" y="45" text-anchor="middle" class="svg-ink" font-size="13">FGT-A</text>
<rect x="540" y="20" width="90" height="40" rx="8" fill="#ddd6fe"/><text x="585" y="45" text-anchor="middle" class="svg-ink" font-size="13">FGT-B</text>
<rect x="430" y="110" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="465" y="130" text-anchor="middle" class="svg-ink" font-size="12">SW-1</text>
<rect x="540" y="110" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="575" y="130" text-anchor="middle" class="svg-ink" font-size="12">SW-2</text>
<line x1="440" y1="60" x2="455" y2="110" stroke="#64748b" stroke-width="2"/><line x1="585" y1="60" x2="580" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="500" y1="125" x2="540" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="520" y="170" text-anchor="middle" class="svg-accent" font-size="12">Design 2: do switches, apna VLAN</text>
<rect x="20" y="150" width="340" height="60" rx="8" fill="#fde68a"/><text x="190" y="175" text-anchor="middle" class="svg-ink" font-size="12">Kabhi nahi: user data port par heartbeat</text><text x="190" y="195" text-anchor="middle" class="svg-muted" font-size="12">ek busy link, ek shared failure domain</text>
</svg><p class="cap">Achhe heartbeat designs: direct cable pair, ya do isolated switches par do links.</p></div>

<h3>Timers: "dead" kitni jaldi maana jaata hai?</h3>
<p>Teen attributes decide karte hain ki lost heartbeat kitni jaldi pakda jaata hai:</p>
<ul>
<li><code>hb-interval</code>: hellos ke beech ka time, 100 ms ki units mein. Default <b>2</b> = 200 ms (range 1-20).</li>
<li><code>hb-lost-threshold</code>: link lost maanne se pehle kitne hellos miss ho sakte hain. Default <b>6</b> (range 1-60).</li>
<li><code>helo-holddown</code>: abhi join hua unit khud ko ready declare karne se pehle kitne seconds rukta hai. Default <b>20</b>.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Defaults: 2 x 100 ms = har hello 200 ms; 6 missed hellos = link lost hone mein 1.2 second. Slow hypervisor switch wali busy virtual lab ko <code>hb-interval 5</code> aur <code>hb-lost-threshold 10</code> chahiye ho sakta hai: 5 x 100 ms = 500 ms, x 10 = 5 seconds. Failover slow hota hai, par false positives ruk jaate hain. Rule: kam values = tez failover par zyada false alarms; zyada values = shaant par slow.</p></div>
<div class="note"><p>Honest scope: lab mein heartbeat ya up hai ya down, aur simulator turant react karta hai. Upar ka timing maths real FortiOS behaviour hai, par 1.2 seconds aap dekh nahi sakte.</p></div>

<h3>Split brain</h3>
<p>Agar saare heartbeat paths fail ho jaayein par dono units healthy hon, to har unit peer ko dekhna band kar deta hai. Rule "peer nahi hai, matlab main akela member hoon" <b>dono</b> units ko primary bana deta hai. Aam wajah: saare hbdev cables ya ports down, <code>hbdev</code> mein typo (galat port), group-id, group-name, password, encryption ya authentication ka mismatch, ya units ke beech aisa switch jo heartbeat ethertype block karta hai.</p>
<pre class="code"><span class="c">! Woh typo jo isse karta hai: FGT-B port3 nahi, port5 sun raha hai</span>
config system ha
    set hbdev "port5" 100
end</pre>
<pre class="out">FGT-B # get system ha status
<span class="hl">HA Health Status: WARNING: only one member is present, the heartbeat finds no peer</span>
Model: FortiGate-VM64
Mode: HA A-P
Group Name: NILGIRI-HA
Group ID: 20
Primary selected using:
    &lt;2026/10/04 21:13:00&gt; vcluster-1: FGVMEV1OO2UZP000 is selected as the primary because <span class="hl">it is the only member in the cluster</span>.
Primary     : FGT-B           , FGVMEV1OO2UZP000, HA cluster index = 0
number of vcluster: 1</pre>
<p>Symptoms: dono units khud ko primary aur single member dikhate hain; dono virtual MAC <code>00:09:0f:09:14:00</code> par jawab dete hain, isliye switch woh MAC do ports ke beech flap karta hai; hosts ko duplicate-address ya intermittent loss dikhta hai; wahi IP do units par hota hai. Har unit apne sessions aur apni configuration ki copy bhi rakhta hai, isliye ek side ke changes doosri side tak nahi pahunchte.</p>
<p><b>Recovery.</b> Heartbeat theek karo (cable, <code>hbdev</code>, matching group settings). Units ek doosre ko dekhte hain aur chapter 5 ke rules se nayi election hoti hai. Loser secondary ban jaata hai aur winner ki configuration le leta hai, isliye split ke dauraan loser par kiya gaya har change chala jaata hai, aur jo sessions sirf loser par the woh mar jaate hain. Isiliye reconnect karne se <i>pehle</i> dono configurations save karo.</p>

<h3>Session sync interface (theory)</h3>
<p>Bahut zyada session pickup traffic ho to heartbeat bhar sakta hai. FortiOS <code>session-sync-dev</code> deta hai, ek alag interface sirf session synchronisation ke liye, taaki heartbeat halka rahe. Yeh lab mein model nahi kiya gaya.</p>

<div class="warn"><p><b>Common mistake.</b> Ek heartbeat cable, ya ek hi NIC chip par do heartbeat ports. Tab ek failed cable split karwa deti hai jabki data network bilkul theek hai. Aur: <code>password</code> sirf ek unit par badalna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Settings mismatch hone par units alarm nahi dete; woh bas cluster nahi banate. Aur default timers 200 ms aur 6 misses (1.2 s) hain, 6 seconds nahi.</p></div>

<div class="scn"><h4>Re-patch ki hui cable</h4><p>Chennai site par weekend team ne ek pair ki heartbeat cable ko switch ke us port mein laga diya jo user VLAN mein tha. Monday subah users ne slow web ki shikayat ki. Dono units ne <code>HA Health Status: WARNING</code> dikhaya aur dono primary the; core switch ne cluster MAC ko har kuch second mein do ports ke beech move hote log kiya. Engineer ne cable wapas isolated VLAN mein lagayi, dono configurations save kiye, aur pair kuch seconds mein re-elect ho gaya. Split ke dauraan galat unit par edit ki gayi ek policy winner ne overwrite kar di aur dobara karni padi.</p><p><b>Lesson:</b> heartbeat ko isolated, labelled ports par rakho, aur split heal karne se pehle dono units ka backup lo.</p></div>

<div class="iv"><p class="q">"HA cluster mein split brain kya hai aur ise kaise rokte hain?"</p><p>Dono units sochte hain ki peer chala gaya, isliye dono primary ban jaate hain aur same virtual MAC aur IP par jawab dete hain. Rokne ke liye alag NICs par do ya zyada dedicated heartbeat links, behtar hai direct cables ya do isolated switches, matching group settings aur monitored interfaces. Batao ki heal hone ke baad loser winner ki configuration le leta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Heartbeat hellos, configuration sync aur session data carry karta hai; kam se kam do dedicated links use karo.</li>
<li>Defaults: hb-interval 2 (200 ms), hb-lost-threshold 6 (1.2 s), helo-holddown 20 s; ethertypes 8890, 8891, 8893.</li>
<li>Shared switches par heartbeat encrypt aur authenticate karo, dono units par identical settings ke saath.</li>
<li>Split brain = do primaries, flapping virtual MAC, WARNING health line.</li>
<li>Heal karne par nayi election hoti hai; loser ke changes aur sessions chale jaate hain.</li>
</ul></div>
`}};export{e as default};