var e={id:`xr-config-model`,h:{en:`The IOS XR configuration model: commit, rollback and safe change`,hi:`IOS XR configuration model: commit, rollback aur safe change`},body:{en:`
<p>The biggest day-to-day difference an engineer feels when moving to IOS XR is how configuration changes are applied. XR works like a transaction system. You build a change in a private buffer, review it, and commit it in one atomic step. If something is wrong you can roll back to a known good version. This chapter explains the model and the commands, with the caveat that the simulator does not run IOS XR, so the examples are <b>Reference configuration (not run in the simulator)</b> and no device output is shown. The same candidate-and-commit idea exists on Junos (see the jncia-cli module) and you can practise that mental model there.</p>

<h3>Analogy: a shared document with a Publish button</h3>
<p>In classic IOS every keystroke edits the live document. In XR you edit a <b>draft</b> (the <b>target configuration</b>) and press <b>commit</b> to publish it. Each publish is saved as a numbered <b>commit ID</b>, so the history is a list of versions you can go back to.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="XR commit model">
<rect x="20" y="50" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">Target config</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">your uncommitted changes</text>
<rect x="235" y="50" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Running config</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">what the router uses now</text>
<rect x="450" y="50" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="14">Commit history</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">numbered commit IDs</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><text x="212" y="76" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">rollback configuration goes back to an earlier commit</text>
</svg><p class="cap">Edit the target configuration, commit to apply, roll back to undo.</p></div>

<h3>The everyday workflow</h3>
<ol>
<li>Enter configuration mode with <code>configure</code> (also <code>configure terminal</code>). The prompt shows the config context.</li>
<li>Type your changes. Nothing is applied yet.</li>
<li>Review with <code>show configuration</code>, which lists the uncommitted changes.</li>
<li>Apply with <code>commit</code>. The router validates the whole change and applies all or none.</li>
<li>Leave with <code>end</code> (it asks about uncommitted changes) or <code>exit</code>.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
RP/0/RP0/CPU0:PE1# configure
RP/0/RP0/CPU0:PE1(config)# interface Loopback0
RP/0/RP0/CPU0:PE1(config-if)# ipv4 address 192.0.2.1 255.255.255.255
RP/0/RP0/CPU0:PE1(config-if)# exit
RP/0/RP0/CPU0:PE1(config)# show configuration
RP/0/RP0/CPU0:PE1(config)# commit
RP/0/RP0/CPU0:PE1(config)# end</pre>

<h3>The commands that make it safe</h3>
<table class="cmp"><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>show configuration</code></td><td>Shows the uncommitted changes in the target configuration</td></tr>
<tr><td><code>commit</code></td><td>Validates and applies the whole change atomically, creating a commit ID</td></tr>
<tr><td><code>commit confirmed</code> with a timeout</td><td>Applies the change but rolls back automatically unless you confirm with another commit before the timer ends</td></tr>
<tr><td><code>commit label</code> or <code>commit comment</code></td><td>Tags the commit so the history is readable</td></tr>
<tr><td><code>show configuration failed</code></td><td>Shows which lines failed in the last commit or why validation failed</td></tr>
<tr><td><code>show configuration commit list</code></td><td>Lists commit IDs and who made them</td></tr>
<tr><td><code>show configuration commit changes</code> with an ID or "last"</td><td>Shows what a given commit changed</td></tr>
<tr><td><code>rollback configuration last</code> N or <code>rollback configuration to</code> ID</td><td>Returns to an earlier commit (this is also a commit)</td></tr>
<tr><td><code>abort</code> or <code>clear</code></td><td>Discards the uncommitted changes in your session</td></tr>
<tr><td><code>commit replace</code></td><td>Replaces the entire running configuration with the target; powerful and dangerous</td></tr></table>
<p>The exact options vary by release, so confirm on the platform. For example, the safest habit for a remote change is the confirmed commit.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
RP/0/RP0/CPU0:PE1(config)# commit confirmed 120
<span class="c">! ... test the change; if it is good, confirm before the 120 seconds end:</span>
RP/0/RP0/CPU0:PE1(config)# commit</pre>

<h3>Why this model matters to a provider</h3>
<ul>
<li><b>Atomic change</b>: a 200-line change either all applies or none does, so there is no half-configured state in front of customers.</li>
<li><b>Review before impact</b>: engineers and automation can compare the target with the running configuration first.</li>
<li><b>Audit trail</b>: every commit has an ID, a time and a user, so you can say who changed what and roll back.</li>
<li><b>Concurrent editing</b>: several sessions can edit target configurations; the commit step detects conflicts, and a commit can be refused if another session changed the same area.</li>
<li><b>Automation friendliness</b>: it matches NETCONF and YANG transactions, so tools can validate and commit configuration the same way.</li>
</ul>

<h3>Route policy and other XR habits</h3>
<ul>
<li><b>Route policy language (RPL)</b> is the policy tool for BGP and others. eBGP needs one for routes to pass.</li>
<li><b>Hierarchical, address-family-nested</b> structure under protocol blocks.</li>
<li>Many configurations that IOS does in one line sit in a small hierarchy in XR, such as <code>address-family ipv4 unicast</code> under a protocol.</li>
<li><code>show running-config</code> displays committed config; use <code>show configuration</code> for the pending changes.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An operator needs to change an uplink's IS-IS metric on a remote PE. The engineer enters the new metric, uses <code>show configuration</code> to confirm only that one line is pending, then <code>commit confirmed 120</code>. Traffic shifts and the engineer verifies it from the far side. The test is good, so a plain <code>commit</code> confirms the change. If the SSH session had dropped because of the change, the router would have rolled back by itself after 120 seconds.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing configuration and forgetting to commit; leaving a session with uncommitted changes that later confuse a colleague; and using <code>commit replace</code> without a full target configuration.</p></div>
<div class="exam"><p><b>Exam trap.</b> In XR, <code>show configuration</code> shows the pending target changes and <code>show running-config</code> shows the committed running configuration. A rollback creates a new commit; it does not erase history.</p></div>

<div class="scn"><h4>The change that saved itself</h4><p>A late-night change moved a link into a new IS-IS metric but accidentally shut the management interface used for access. The engineer had used a confirmed commit. When the SSH session dropped, no confirmation arrived, and the router rolled back to the previous commit on its own. Access returned within two minutes and the change was reworked.</p><p><b>Lesson:</b> a confirmed commit is cheap insurance for remote changes.</p></div>

<div class="iv"><p class="q">"How does configuration work on IOS XR compared with IOS XE?"</p><p>IOS XE applies each line immediately. IOS XR collects changes in a target configuration and applies them atomically on commit, with numbered commit IDs, rollback, and commit confirmed with an automatic revert. It supports review with show configuration and concurrent sessions, which suits large carrier networks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XR uses a target configuration and applies it on commit, atomically.</li>
<li>Each commit has an ID; rollback returns to a previous commit.</li>
<li>Use commit confirmed for risky remote changes.</li>
<li>show configuration shows pending changes; show running-config shows committed.</li>
<li>Junos has a similar model, so the idea carries between platforms.</li>
</ul></div>
`,hi:`
<p>IOS XR par jaane par engineer ko roz ka sabse bada farq yeh lagta hai ki configuration changes kaise apply hote hain. XR transaction system ki tarah kaam karta hai. Aap private buffer mein change banate ho, review karte ho aur ek atomic step mein commit karte ho. Kuch galat ho to known good version par roll back kar sakte ho. Yeh chapter model aur commands samjhata hai, is caveat ke saath ki simulator IOS XR nahi chalata, isliye examples <b>Reference configuration (not run in the simulator)</b> hain aur koi device output nahi dikhaya gaya. Wahi candidate-and-commit idea Junos par bhi hai (jncia-cli module dekho) aur aap wahan yeh mental model practise kar sakte ho.</p>

<h3>Analogy: Publish button wala shared document</h3>
<p>Classic IOS mein har keystroke live document edit karta hai. XR mein aap <b>draft</b> (<b>target configuration</b>) edit karte ho aur publish karne ke liye <b>commit</b> dabate ho. Har publish ek numbered <b>commit ID</b> ke roop mein save hota hai, isliye history un versions ki list hai jin par aap wapas ja sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="XR commit model">
<rect x="20" y="50" width="170" height="70" rx="10" fill="#fde68a"/><text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="14">Target config</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">aapke uncommitted changes</text>
<rect x="235" y="50" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Running config</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">router abhi yahi use karta hai</text>
<rect x="450" y="50" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="14">Commit history</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">numbered commit IDs</text>
<line x1="190" y1="85" x2="235" y2="85" stroke="#64748b" stroke-width="2"/><text x="212" y="76" text-anchor="middle" class="svg-accent" font-size="12">commit</text>
<line x1="405" y1="85" x2="450" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">rollback configuration pehle ke commit par wapas le jaata hai</text>
</svg><p class="cap">Target configuration edit karo, apply karne ke liye commit, undo ke liye rollback.</p></div>

<h3>Roz ka workflow</h3>
<ol>
<li><code>configure</code> (ya <code>configure terminal</code>) se configuration mode mein jao. Prompt config context dikhata hai.</li>
<li>Apne changes type karo. Abhi kuch apply nahi hua.</li>
<li><code>show configuration</code> se review karo, jo uncommitted changes list karta hai.</li>
<li><code>commit</code> se apply karo. Router poore change ko validate karta hai aur sab apply karta hai ya kuch nahi.</li>
<li><code>end</code> (yeh uncommitted changes ke baare mein poochta hai) ya <code>exit</code> se bahar aao.</li>
</ol>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
RP/0/RP0/CPU0:PE1# configure
RP/0/RP0/CPU0:PE1(config)# interface Loopback0
RP/0/RP0/CPU0:PE1(config-if)# ipv4 address 192.0.2.1 255.255.255.255
RP/0/RP0/CPU0:PE1(config-if)# exit
RP/0/RP0/CPU0:PE1(config)# show configuration
RP/0/RP0/CPU0:PE1(config)# commit
RP/0/RP0/CPU0:PE1(config)# end</pre>

<h3>Woh commands jo ise safe banate hain</h3>
<table class="cmp"><tr><th>Command</th><th>Kya karta hai</th></tr>
<tr><td><code>show configuration</code></td><td>Target configuration ke uncommitted changes dikhata hai</td></tr>
<tr><td><code>commit</code></td><td>Poore change ko validate karke atomically apply karta hai, commit ID banata hai</td></tr>
<tr><td>timeout ke saath <code>commit confirmed</code></td><td>Change apply karta hai lekin timer khatam hone se pehle doosre commit se confirm na karo to apne aap roll back ho jaata hai</td></tr>
<tr><td><code>commit label</code> ya <code>commit comment</code></td><td>Commit ko tag karta hai taaki history padhne layak ho</td></tr>
<tr><td><code>show configuration failed</code></td><td>Dikhata hai pichhle commit mein kaun si lines fail huin ya validation kyun fail hui</td></tr>
<tr><td><code>show configuration commit list</code></td><td>Commit IDs aur kisne kiye, list karta hai</td></tr>
<tr><td>ID ya "last" ke saath <code>show configuration commit changes</code></td><td>Dikhata hai diye gaye commit ne kya badla</td></tr>
<tr><td><code>rollback configuration last</code> N ya <code>rollback configuration to</code> ID</td><td>Pehle ke commit par wapas jaata hai (yeh bhi ek commit hai)</td></tr>
<tr><td><code>abort</code> ya <code>clear</code></td><td>Aapke session ke uncommitted changes discard karta hai</td></tr>
<tr><td><code>commit replace</code></td><td>Poori running configuration ko target se replace karta hai; powerful aur khatarnak</td></tr></table>
<p>Exact options release ke hisaab se badalte hain, isliye platform par confirm karo. Jaise remote change ke liye sabse safe aadat confirmed commit hai.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
RP/0/RP0/CPU0:PE1(config)# commit confirmed 120
<span class="c">! ... test the change; if it is good, confirm before the 120 seconds end:</span>
RP/0/RP0/CPU0:PE1(config)# commit</pre>

<h3>Provider ke liye yeh model kyun matter karta hai</h3>
<ul>
<li><b>Atomic change</b>: 200-line change ya poora apply hota hai ya kuch nahi, isliye customers ke saamne aadhi configured state nahi hoti.</li>
<li><b>Impact se pehle review</b>: engineers aur automation pehle target ko running configuration se compare kar sakte hain.</li>
<li><b>Audit trail</b>: har commit ka ID, time aur user hota hai, isliye aap bata sakte ho kisne kya badla aur roll back kar sakte ho.</li>
<li><b>Concurrent editing</b>: kai sessions target configurations edit kar sakte hain; commit step conflicts detect karta hai, aur agar doosre session ne same area badla to commit refuse ho sakta hai.</li>
<li><b>Automation friendliness</b>: yeh NETCONF aur YANG transactions se match karta hai, isliye tools configuration ko waise hi validate aur commit kar sakte hain.</li>
</ul>

<h3>Route policy aur doosri XR aadatein</h3>
<ul>
<li><b>Route policy language (RPL)</b> BGP aur doosron ke liye policy tool hai. eBGP ko routes pass karne ke liye ek chahiye.</li>
<li>Protocol blocks ke neeche <b>hierarchical, address-family-nested</b> structure.</li>
<li>Kai configurations jo IOS ek line mein karta hai XR mein chhoti hierarchy mein hoti hain, jaise protocol ke neeche <code>address-family ipv4 unicast</code>.</li>
<li><code>show running-config</code> committed config dikhata hai; pending changes ke liye <code>show configuration</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Operator ko remote PE par uplink ka IS-IS metric badalna hai. Engineer naya metric daalta hai, <code>show configuration</code> se confirm karta hai ki sirf wahi ek line pending hai, phir <code>commit confirmed 120</code>. Traffic shift hota hai aur engineer far side se verify karta hai. Test achha hai, isliye plain <code>commit</code> change ko confirm karta hai. Agar change ki wajah se SSH session gir jaata, to router 120 seconds baad apne aap roll back kar leta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuration type karke commit bhoolna; uncommitted changes ke saath session chhodna jo baad mein colleague ko confuse karte hain; aur poora target configuration ke bina <code>commit replace</code> use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> XR mein <code>show configuration</code> pending target changes dikhata hai aur <code>show running-config</code> committed running configuration. Rollback naya commit banata hai; history mitata nahi.</p></div>

<div class="scn"><h4>Change jisne khud ko bacha liya</h4><p>Raat ke change ne link ko naye IS-IS metric par daala lekin galti se access ke liye use hone wala management interface shut kar diya. Engineer ne confirmed commit use kiya tha. SSH session gira, koi confirmation nahi aayi, aur router apne aap pichhle commit par roll back ho gaya. Do minute mein access wapas aaya aur change dobara kiya gaya.</p><p><b>Lesson:</b> remote changes ke liye confirmed commit sasta insurance hai.</p></div>

<div class="iv"><p class="q">"IOS XR par configuration IOS XE se kaise alag kaam karti hai?"</p><p>IOS XE har line turant apply karta hai. IOS XR changes ko target configuration mein ikattha karta hai aur commit par atomically apply karta hai, numbered commit IDs, rollback, aur automatic revert ke saath commit confirmed ke saath. Yeh show configuration se review aur concurrent sessions support karta hai, jo bade carrier networks ke liye fit hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XR target configuration use karta hai aur commit par atomically apply karta hai.</li>
<li>Har commit ka ID hota hai; rollback pehle ke commit par wapas jaata hai.</li>
<li>Risky remote changes ke liye commit confirmed use karo.</li>
<li>show configuration pending changes dikhata hai; show running-config committed.</li>
<li>Junos ka similar model hai, isliye idea platforms ke beech chalta hai.</li>
</ul></div>
`}};export{e as default};