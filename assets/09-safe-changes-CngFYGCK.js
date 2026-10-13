var e={id:`safe-changes`,h:{en:`Safe changes: checkpoint, rollback, config replace and commit-confirm thinking`,hi:`Safe changes: checkpoint, rollback, config replace aur commit-confirm soch`},body:{en:`
<p>Every video game player knows the rule: <b>save before the boss fight</b>. If the fight goes badly, you reload the save and try again, instead of replaying the whole level. Production changes are boss fights. NX-OS gives you a save button (<b>checkpoint</b>), a preview of what reloading would change (<b>rollback patch</b>), and a reload button (<b>rollback</b>). This chapter is exactly Lab 2: checkpoint first, make a bad change, see the damage, preview the patch, roll back and verify.</p>

<h3>Checkpoints: the save button</h3>
<p>A <b>checkpoint</b> is a copy of the running configuration stored on the switch under a name. You create it in exec mode (not configuration mode):</p>
<pre class="code">LEAF1# checkpoint BEFORE-CHG
..........Done
LEAF1# show checkpoint summary</pre>
<pre class="out">User Checkpoint Summary
--------------------------------------------------------------------------------
<span class="hl">1) BEFORE-CHG:</span>
Created by admin
Created at Tue, 01:00:12 29 Sep 2026
Size is 18,442 bytes
Description: None</pre>
<p>Facts to know: you can keep up to 10 user checkpoints, so delete old ones you no longer need; NX-OS also creates <b>system checkpoints</b> automatically when you disable certain features, so you can bring their configuration back; <code>checkpoint file bootflash:pre-chg.cfg</code> writes the checkpoint as a file; and checkpoints are cleared by <code>clear checkpoint database</code> or by <code>write erase</code> followed by a reload.</p>

<h3>The bad change (what Lab 2 simulates)</h3>
<p>Change CHG-2291 moves LEAF1's uplink into OSPF area 0.0.0.5, but SPINE1 still says area 0.0.0.0 on its side. OSPF hellos carry the area ID; when the areas differ, the neighbors ignore each other's hellos. After the dead interval (40 seconds by default on this link type) the adjacency drops.</p>
<pre class="code">LEAF1(config)# interface Ethernet1/1
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.5
LEAF1(config-if)# end</pre>
<pre class="out"><span class="hl">%OSPF-5-ADJCHANGE: ospf-UNDERLAY [5821] Nbr 10.255.0.11 on Ethernet1/1 went DOWN</span>
LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 0</pre>

<h3>Preview before you act: the rollback patch</h3>
<p>Never roll back blind. <code>show diff rollback-patch</code> computes the exact commands that would turn one configuration into another, without applying anything:</p>
<pre class="code">LEAF1# show diff rollback-patch running-config checkpoint BEFORE-CHG</pre>
<pre class="out">#Generating Rollback Patch
!!
interface Ethernet1/1
  no ip router ospf UNDERLAY area 0.0.0.5
  <span class="hl">ip router ospf UNDERLAY area 0.0.0.0</span></pre>
<p>Read it as "to go from the running config to BEFORE-CHG, remove area 0.0.0.5 and put back area <b>0.0.0.0</b>". That is the answer Lab 2 asks for. If the patch showed dozens of unexpected lines, you would stop and find out why before rolling back.</p>

<h3>Rollback: the reload button</h3>
<pre class="code">LEAF1# rollback running-config checkpoint BEFORE-CHG</pre>
<pre class="out">Collecting Running-Config
#Generating Rollback Patch
Executing Rollback Patch
Generating Running-config for verification
Generating Patch for verification
<span class="hl">Verification is Successful.</span>

Rollback completed successfully.</pre>
<p>Rollback has three modes, added at the end of the command:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>When to use</th></tr>
<tr><td><b>atomic</b> (default)</td><td>Applies the patch only if every command succeeds; otherwise nothing changes</td><td>Almost always</td></tr>
<tr><td><b>best-effort</b></td><td>Applies what it can and skips errors</td><td>Recovering as much as possible when some lines cannot apply</td></tr>
<tr><td><b>stop-at-first-failure</b></td><td>Stops at the first error; commands already applied stay applied</td><td>Troubleshooting a patch step by step</td></tr>
</table>
<p>Then verify like a professional: <code>show ip ospf neighbors</code> must show SPINE1 in FULL state again after a few seconds, <code>ping 10.255.0.11</code> (SPINE1's loopback) must succeed, and only then <code>copy running-config startup-config</code>. A rollback changes the running configuration only; it does not save.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe change sequence">
<rect x="10" y="50" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="13">checkpoint</text>
<rect x="138" y="50" width="110" height="44" rx="8" fill="#fed7aa"/><text x="193" y="77" text-anchor="middle" class="svg-ink" font-size="13">change</text>
<rect x="266" y="50" width="110" height="44" rx="8" fill="#fde68a"/><text x="321" y="77" text-anchor="middle" class="svg-ink" font-size="13">verify</text>
<rect x="394" y="50" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="449" y="77" text-anchor="middle" class="svg-ink" font-size="13">diff patch</text>
<rect x="522" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="577" y="77" text-anchor="middle" class="svg-ink" font-size="13">rollback</text>
<line x1="120" y1="72" x2="138" y2="72" stroke="#64748b" stroke-width="2"/><line x1="248" y1="72" x2="266" y2="72" stroke="#64748b" stroke-width="2"/><line x1="376" y1="72" x2="394" y2="72" stroke="#64748b" stroke-width="2"/><line x1="504" y1="72" x2="522" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="321" y="30" text-anchor="middle" class="svg-accent" font-size="12">verification OK: save and close the change</text>
<text x="513" y="125" text-anchor="middle" class="svg-muted" font-size="12">verification failed: preview, then roll back</text>
</svg><p class="cap">The professional sequence: save state, change, verify, and if needed preview and roll back.</p></div>

<h3>Config replace and commit-confirm thinking</h3>
<p><b>Configure replace</b> makes the running configuration equal to a complete file, such as a golden configuration from Git, by computing and applying the difference. The <b>commit-timeout</b> option gives you "commit-confirm" safety: if you do not confirm within the time, the switch rolls itself back. That protects you when a change could cut your own access, for example an ACL on the management interface.</p>
<pre class="code">LEAF1# configure replace bootflash:golden-leaf.cfg commit-timeout 300
<span class="c">! test: can you still log in? are neighbors up?</span>
LEAF1# configure replace commit
LEAF1# show config-replace status</pre>
<p>For some features, such as ACLs and QoS, NX-OS also offers <b>configuration sessions</b>: <code>configure session CHG-2291</code>, enter commands, <code>verify</code> to check them against hardware resources, then <code>commit</code> to apply them together or <code>abort</code> to discard. The idea behind all of these is the same: stage, check, apply as a unit, and have an automatic way back.</p>

<div class="eg"><p><b>Worked example: timing a rollback decision.</b> The window is 01:00 to 03:00. Pre-checks and the checkpoint take 10 minutes, the change 15, and OSPF needs up to 40 seconds to show whether the adjacency survives. Rollback plus reconvergence takes about 5 minutes, and verification after rollback 10 minutes. So the latest go/no-go point is 03:00 minus 15 minutes, 02:45. In the lab the problem is visible within one minute, so the correct decision is immediate: preview, roll back, verify.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Taking the checkpoint after starting the change. Running the checkpoint command in configuration mode (it is an exec command). Rolling back without reading the patch. Forgetting to save after a successful rollback, or saving the bad configuration before verifying. Relying on a checkpoint after <code>write erase</code> and reload, when it no longer exists.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default rollback mode is <b>atomic</b>. <code>show diff rollback-patch</code> previews without applying. Checkpoints live on the switch (up to 10 user checkpoints). <code>configure replace ... commit-timeout</code> reverts automatically unless you run <code>configure replace commit</code>.</p></div>

<div class="scn"><h4>The ACL that locked out the NOC</h4><p>An engineer applied a new management ACL to a pair of spines at 23:10 to meet an audit finding. The ACL had the NOC subnet as 10.99.1.0/24 instead of 10.99.0.0/23, so the SSH session froze and nobody could log back in. On the first spine he had used <code>configure replace</code> with a 300-second commit-timeout: five minutes later it reverted on its own and access returned. On the second spine he had pasted the ACL directly and had to ask the colocation remote hands for console access, which took 50 minutes. The corrected ACL was then deployed to both spines using commit-timeout.</p><p><b>Lesson:</b> for any change that can cut your own access, use a mechanism that rolls back automatically unless you confirm.</p></div>

<div class="iv"><p class="q">"A change you made broke OSPF. How do you recover safely on NX-OS?"</p><p>Strong answer: I take a checkpoint before every change, so I run <code>show diff rollback-patch running-config checkpoint NAME</code> to see exactly what the rollback will do, then <code>rollback running-config checkpoint NAME</code> (atomic by default), verify neighbors, routes and a ping, then save. Mention best-effort and stop-at-first-failure, and <code>configure replace</code> with commit-timeout for changes that could lock you out.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>checkpoint NAME</code> (exec mode) saves the running config on the switch; <code>show checkpoint summary</code> lists them.</li>
<li><code>show diff rollback-patch running-config checkpoint NAME</code> previews the rollback without applying it.</li>
<li><code>rollback running-config checkpoint NAME</code> is atomic by default; best-effort and stop-at-first-failure exist.</li>
<li><code>configure replace</code> with commit-timeout gives automatic revert unless confirmed.</li>
<li>Verify after rollback, then save; rollback does not write the startup configuration.</li>
</ul></div>
`,hi:`
<p>Har video game player rule jaanta hai: <b>boss fight se pehle save karo</b>. Fight bigdi to save reload karo aur phir try karo, poora level dobara khelne ki jagah. Production changes boss fights hain. NX-OS aapko save button (<b>checkpoint</b>), reload karne par kya badlega uska preview (<b>rollback patch</b>), aur reload button (<b>rollback</b>) deta hai. Yeh chapter bilkul Lab 2 hai: pehle checkpoint, bura change karo, nuksaan dekho, patch preview karo, rollback karo aur verify karo.</p>

<h3>Checkpoints: save button</h3>
<p><b>Checkpoint</b> running configuration ki copy hai jo switch par ek naam ke saath store hoti hai. Aap ise exec mode mein banate ho (configuration mode mein nahi):</p>
<pre class="code">LEAF1# checkpoint BEFORE-CHG
..........Done
LEAF1# show checkpoint summary</pre>
<pre class="out">User Checkpoint Summary
--------------------------------------------------------------------------------
<span class="hl">1) BEFORE-CHG:</span>
Created by admin
Created at Tue, 01:00:12 29 Sep 2026
Size is 18,442 bytes
Description: None</pre>
<p>Jaanne wale facts: aap 10 tak user checkpoints rakh sakte ho, isliye jo purane kaam ke nahi unhe delete karo; kuch features disable karne par NX-OS automatically <b>system checkpoints</b> bhi banata hai, taaki aap unka configuration wapas la sako; <code>checkpoint file bootflash:pre-chg.cfg</code> checkpoint ko file ki tarah likhta hai; aur checkpoints <code>clear checkpoint database</code> se ya <code>write erase</code> ke baad reload se clear hote hain.</p>

<h3>Bura change (jo Lab 2 simulate karta hai)</h3>
<p>Change CHG-2291 LEAF1 ke uplink ko OSPF area 0.0.0.5 mein daalta hai, lekin SPINE1 apni side par ab bhi area 0.0.0.0 kehta hai. OSPF hellos area ID le jaate hain; jab areas alag hote hain, neighbors ek dusre ke hellos ignore karte hain. Dead interval ke baad (is link type par default 40 second) adjacency gir jaati hai.</p>
<pre class="code">LEAF1(config)# interface Ethernet1/1
LEAF1(config-if)# ip router ospf UNDERLAY area 0.0.0.5
LEAF1(config-if)# end</pre>
<pre class="out"><span class="hl">%OSPF-5-ADJCHANGE: ospf-UNDERLAY [5821] Nbr 10.255.0.11 on Ethernet1/1 went DOWN</span>
LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 0</pre>

<h3>Kuch karne se pehle preview: rollback patch</h3>
<p>Kabhi andhe mein rollback mat karo. <code>show diff rollback-patch</code> woh exact commands compute karta hai jo ek configuration ko dusri mein badlenge, bina kuch apply kiye:</p>
<pre class="code">LEAF1# show diff rollback-patch running-config checkpoint BEFORE-CHG</pre>
<pre class="out">#Generating Rollback Patch
!!
interface Ethernet1/1
  no ip router ospf UNDERLAY area 0.0.0.5
  <span class="hl">ip router ospf UNDERLAY area 0.0.0.0</span></pre>
<p>Ise aise padho "running config se BEFORE-CHG tak jaane ke liye area 0.0.0.5 hatao aur area <b>0.0.0.0</b> wapas lagao". Yahi jawab Lab 2 maangta hai. Agar patch darjanon unexpected lines dikhata, to aap rollback se pehle ruk kar wajah dhoondhte.</p>

<h3>Rollback: reload button</h3>
<pre class="code">LEAF1# rollback running-config checkpoint BEFORE-CHG</pre>
<pre class="out">Collecting Running-Config
#Generating Rollback Patch
Executing Rollback Patch
Generating Running-config for verification
Generating Patch for verification
<span class="hl">Verification is Successful.</span>

Rollback completed successfully.</pre>
<p>Rollback ke teen modes hain, jo command ke end mein lagte hain:</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>Kab use karein</th></tr>
<tr><td><b>atomic</b> (default)</td><td>Patch tabhi lagata hai jab har command succeed kare; warna kuch nahi badalta</td><td>Lagbhag hamesha</td></tr>
<tr><td><b>best-effort</b></td><td>Jo lag sake lagata hai aur errors skip karta hai</td><td>Jab kuch lines apply na ho sakein, tab jitna ho sake recover karna</td></tr>
<tr><td><b>stop-at-first-failure</b></td><td>Pehli error par ruk jaata hai; pehle lage commands lage rehte hain</td><td>Patch ko step by step troubleshoot karna</td></tr>
</table>
<p>Phir professional ki tarah verify karo: kuch second baad <code>show ip ospf neighbors</code> mein SPINE1 phir FULL state mein dikhna chahiye, <code>ping 10.255.0.11</code> (SPINE1 ka loopback) succeed hona chahiye, aur tabhi <code>copy running-config startup-config</code>. Rollback sirf running configuration badalta hai; save nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe change sequence">
<rect x="10" y="50" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="65" y="77" text-anchor="middle" class="svg-ink" font-size="13">checkpoint</text>
<rect x="138" y="50" width="110" height="44" rx="8" fill="#fed7aa"/><text x="193" y="77" text-anchor="middle" class="svg-ink" font-size="13">change</text>
<rect x="266" y="50" width="110" height="44" rx="8" fill="#fde68a"/><text x="321" y="77" text-anchor="middle" class="svg-ink" font-size="13">verify</text>
<rect x="394" y="50" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="449" y="77" text-anchor="middle" class="svg-ink" font-size="13">diff patch</text>
<rect x="522" y="50" width="110" height="44" rx="8" fill="#bae6fd"/><text x="577" y="77" text-anchor="middle" class="svg-ink" font-size="13">rollback</text>
<line x1="120" y1="72" x2="138" y2="72" stroke="#64748b" stroke-width="2"/><line x1="248" y1="72" x2="266" y2="72" stroke="#64748b" stroke-width="2"/><line x1="376" y1="72" x2="394" y2="72" stroke="#64748b" stroke-width="2"/><line x1="504" y1="72" x2="522" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="321" y="30" text-anchor="middle" class="svg-accent" font-size="12">verification OK: save karo aur change band karo</text>
<text x="513" y="125" text-anchor="middle" class="svg-muted" font-size="12">verification fail: preview, phir rollback</text>
</svg><p class="cap">Professional sequence: state save karo, change karo, verify karo, aur zaroorat ho to preview karke rollback karo.</p></div>

<h3>Config replace aur commit-confirm soch</h3>
<p><b>Configure replace</b> running configuration ko ek poori file ke barabar bana deta hai, jaise Git ki golden configuration, farak compute karke aur apply karke. <b>commit-timeout</b> option aapko "commit-confirm" safety deta hai: agar aap time ke andar confirm nahi karte, switch khud rollback kar leta hai. Yeh aapko tab bachata hai jab change aapka apna access kaat sakta ho, jaise management interface par ACL.</p>
<pre class="code">LEAF1# configure replace bootflash:golden-leaf.cfg commit-timeout 300
<span class="c">! test: kya abhi bhi login ho raha hai? neighbors up hain?</span>
LEAF1# configure replace commit
LEAF1# show config-replace status</pre>
<p>Kuch features ke liye, jaise ACLs aur QoS, NX-OS <b>configuration sessions</b> bhi deta hai: <code>configure session CHG-2291</code>, commands daalo, <code>verify</code> se unhe hardware resources ke against check karo, phir <code>commit</code> se saath mein apply karo ya <code>abort</code> se discard karo. In sabke peeche idea same hai: stage karo, check karo, ek unit ki tarah apply karo, aur wapas jaane ka automatic raasta rakho.</p>

<div class="eg"><p><b>Worked example: rollback decision ka timing.</b> Window 01:00 se 03:00 hai. Pre-checks aur checkpoint mein 10 minute, change mein 15, aur OSPF ko yeh dikhane mein 40 second tak lagte hain ki adjacency bachi ya nahi. Rollback plus reconvergence lagbhag 5 minute, aur rollback ke baad verification 10 minute. Isliye aakhri go/no-go point 03:00 minus 15 minute, yaani 02:45 hai. Lab mein problem ek minute ke andar dikh jaati hai, isliye sahi decision turant hai: preview, rollback, verify.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Change shuru karne ke baad checkpoint lena. Checkpoint command configuration mode mein chalana (yeh exec command hai). Patch padhe bina rollback karna. Successful rollback ke baad save bhool jaana, ya verify karne se pehle bura configuration save kar dena. <code>write erase</code> aur reload ke baad checkpoint par bharosa karna, jab woh exist hi nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default rollback mode <b>atomic</b> hai. <code>show diff rollback-patch</code> bina apply kiye preview karta hai. Checkpoints switch par rehte hain (10 tak user checkpoints). <code>configure replace ... commit-timeout</code> automatically revert karta hai jab tak aap <code>configure replace commit</code> na chalao.</p></div>

<div class="scn"><h4>Woh ACL jisne NOC ko lock out kar diya</h4><p>Ek engineer ne audit finding poori karne ke liye 23:10 par spines ke ek pair par naya management ACL lagaya. ACL mein NOC subnet 10.99.0.0/23 ki jagah 10.99.1.0/24 tha, isliye SSH session jam gaya aur koi wapas login nahi kar paaya. Pehle spine par usne 300-second commit-timeout ke saath <code>configure replace</code> use kiya tha: paanch minute baad woh khud revert ho gaya aur access wapas aa gaya. Dusre spine par usne ACL seedha paste kiya tha aur use colocation remote hands se console access maangna pada, jismein 50 minute lage. Phir sahi ACL dono spines par commit-timeout ke saath deploy kiya gaya.</p><p><b>Seekh:</b> jo bhi change aapka apna access kaat sakta hai, uske liye aisa mechanism use karo jo confirm na karne par automatically rollback kare.</p></div>

<div class="iv"><p class="q">"Aapke change ne OSPF tod diya. NX-OS par safely kaise recover karoge?"</p><p>Strong answer: main har change se pehle checkpoint leta hoon, isliye <code>show diff rollback-patch running-config checkpoint NAME</code> chala kar dekhta hoon ki rollback bilkul kya karega, phir <code>rollback running-config checkpoint NAME</code> (default atomic), neighbors, routes aur ping verify karta hoon, phir save karta hoon. best-effort aur stop-at-first-failure ka zikr karo, aur lock-out kar sakne wale changes ke liye commit-timeout ke saath <code>configure replace</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>checkpoint NAME</code> (exec mode) running config switch par save karta hai; <code>show checkpoint summary</code> list karta hai.</li>
<li><code>show diff rollback-patch running-config checkpoint NAME</code> bina apply kiye rollback preview karta hai.</li>
<li><code>rollback running-config checkpoint NAME</code> default atomic hai; best-effort aur stop-at-first-failure bhi hain.</li>
<li>commit-timeout ke saath <code>configure replace</code> confirm na hone par automatic revert deta hai.</li>
<li>Rollback ke baad verify karo, phir save karo; rollback startup configuration nahi likhta.</li>
</ul></div>
`}};export{e as default};