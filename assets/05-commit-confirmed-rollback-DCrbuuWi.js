var e={id:`commit-confirmed-rollback`,h:{en:`Safety nets: commit confirmed and rollback`,hi:`Safety nets: commit confirmed aur rollback`},body:{en:`
<p>A climber uses a rope. Most of the time she does not fall, but the rope means that a slip is not a disaster. <code>commit confirmed</code> and <code>rollback</code> are the ropes of Junos. In this chapter you will do the second lab: move R1's uplink to a new subnet while managing it remotely.</p>

<h3>The remote-management risk</h3>
<p>You are logged in to R1 through the very link you are about to renumber. If you change the address and make a mistake, the SSH session dies and you cannot reach the router to fix it. Somebody has to drive to the site. <code>commit confirmed</code> prevents that.</p>

<h3>commit confirmed</h3>
<p><code>commit confirmed 5</code> activates the candidate and starts a <b>5-minute timer</b>. If you do not confirm, the router automatically rolls back to the previous configuration. The default timer is 10 minutes; the range is 1 to 65,535.</p>
<pre class="code">lab@R1# delete interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 10.20.9.1/30
lab@R1# show | compare
[edit interfaces ge-0/0/0 unit 0 family inet]
-       address 10.20.1.1/30;
+       address 10.20.9.1/30;

lab@R1# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

<span class="c">! now test, from inside configuration mode:</span>
lab@R1# run ping 10.20.9.2 count 3
3 packets transmitted, 3 packets received, <span class="hl">0% packet loss</span>

lab@R1# commit and-quit
commit complete
Exiting configuration mode</pre>
<p>The second <code>commit</code> (or <code>commit check</code>) is the <b>confirmation</b>. If the ping had failed and the session had died, the timer would expire and R1 would return to 10.20.1.1/30 by itself, so R2 (still on the old subnet in the failure case) could talk to it again.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Commit confirmed timeline">
<line x1="30" y1="90" x2="610" y2="90" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="90" r="8" fill="#fde68a"/><text x="60" y="125" text-anchor="middle" class="svg-ink" font-size="12">commit confirmed 5</text>
<circle cx="290" cy="90" r="8" fill="#bbf7d0"/><text x="290" y="125" text-anchor="middle" class="svg-ink" font-size="12">commit (confirm)</text>
<circle cx="560" cy="90" r="8" fill="#fed7aa"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="12">timer ends: auto rollback</text>
<rect x="60" y="45" width="500" height="18" rx="9" fill="#e2e8f0"/><text x="310" y="58" text-anchor="middle" class="svg-muted" font-size="12">5-minute window to test and confirm</text>
<text x="290" y="155" text-anchor="middle" class="svg-accent" font-size="12">Confirm in time and the change stays; miss it and the old config returns</text>
</svg><p class="cap">commit confirmed is a dead-man switch for your change.</p></div>

<h3>rollback</h3>
<p>Every commit pushes the previous active configuration into a numbered file. <b>rollback 0</b> is the active one, <b>rollback 1</b> the one before the last commit, up to <b>rollback 49</b> (50 versions in total).</p>
<table class="cmp"><tr><th>Command</th><th>Result</th></tr>
<tr><td><code>rollback 0</code></td><td>discard uncommitted candidate changes (candidate = active)</td></tr>
<tr><td><code>rollback 1</code></td><td>load the previous configuration into the candidate</td></tr>
<tr><td><code>rollback 1</code> then <code>commit</code></td><td>actually undo the last commit</td></tr>
<tr><td><code>show system rollback 1 compare 0</code></td><td>what the last commit changed</td></tr>
<tr><td><code>show | compare rollback 1</code></td><td>candidate versus rollback 1 (in configuration mode)</td></tr></table>
<p><b>Important:</b> rollback only changes the <i>candidate</i>. The device does not run the old configuration until you commit again. This is the single most-tested rollback fact.</p>
<pre class="code">lab@R1# rollback 1
load complete
lab@R1# show | compare
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
-       hello-interval 30;
lab@R1# commit and-quit</pre>

<h3>Commit history and who did what</h3>
<pre class="code">lab@R1&gt; show system commit
0   2026-10-01 11:20:44 UTC by lab via cli commit confirmed, rollback in 5mins
1   2026-10-01 11:05:12 UTC by lab via cli
    Pune uplink
2   2026-10-01 10:58:00 UTC by root via other</pre>
<p>You can inspect the older versions of a file without loading them, for example <code>show system rollback 3</code>.</p>

<div class="eg"><p><b>Worked example.</b> It is 11:20. You run <code>commit confirmed 5</code>. At 11:23 you have checked the ping and the OSPF neighbour and you type <code>commit</code>. The change is permanent. Had you forgotten, at 11:25 the router would have logged <code>UI_COMMIT_CONFIRMED_TIMEOUT</code> and restored the old configuration by itself.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>rollback 1</code> and assuming the problem is fixed without a commit. Using <code>commit confirmed</code> and then testing for longer than the timer. Running a second <code>commit confirmed</code> instead of a plain commit: that only restarts a timer.</p></div>
<div class="exam"><p><b>Exam trap.</b> What stops the auto-rollback? Another <code>commit</code> (or <code>commit check</code>) within the time window, not leaving configuration mode and not <code>rollback 0</code>. Also remember: the range is rollback 0 to 49, and 50 files are kept.</p></div>

<div class="scn"><h4>Renumbering at 2 a.m.</h4><p>The core team renumbered R2 to 10.20.9.2/30 and asked the Pune engineer to move R1 to 10.20.9.1/30 over SSH. He typed the new address by mistake as 10.20.19.1/30 and used <code>commit confirmed 5</code>. The session froze. He waited five minutes without touching anything. R1 rolled back, SSH returned, and he repeated the change correctly. A plain <code>commit</code> would have meant a site visit.</p><p><b>Lesson:</b> any change that can cut your own path deserves <code>commit confirmed</code>.</p></div>

<div class="iv"><p class="q">"How do you safely change the interface you are connected through?"</p><p>I make the change in the candidate, review with <code>show | compare</code>, and use <code>commit confirmed</code> with a short timer. Then I test connectivity and confirm with a second commit. If I lose access the router rolls back by itself. I also keep a rescue configuration as a last resort.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit confirmed N</code> auto-rolls back unless a second commit confirms it in N minutes.</li>
<li><code>rollback N</code> loads version N into the candidate only; commit to activate.</li>
<li>Rollback 0 is the active configuration; Junos keeps 50 versions (0 to 49).</li>
<li><code>show system commit</code> lists commits; <code>show system rollback 1 compare 0</code> shows the last change.</li>
<li>Use <code>rollback 0</code> to abandon uncommitted edits.</li>
</ul></div>
`,hi:`
<p>Climber rope use karta hai. Zyadatar waqt woh girti nahi, lekin rope ka matlab hai ki phisalna disaster nahi banta. <code>commit confirmed</code> aur <code>rollback</code> Junos ki ropes hain. Is chapter mein aap doosra lab karoge: R1 ke uplink ko naye subnet par le jaana jabki aap use remotely manage kar rahe ho.</p>

<h3>Remote-management ka risk</h3>
<p>Aap R1 mein usi link se login ho jise aap renumber karne wale ho. Address badalte waqt galti hui to SSH session mar jaata hai aur router tak pahunchkar theek karna possible nahi rehta. Kisi ko site tak jaana padta hai. <code>commit confirmed</code> isse rokta hai.</p>

<h3>commit confirmed</h3>
<p><code>commit confirmed 5</code> candidate ko activate karta hai aur <b>5 minute ka timer</b> shuru karta hai. Agar aap confirm nahi karte to router apne aap pichli configuration par rollback ho jaata hai. Default timer 10 minute hai; range 1 se 65,535.</p>
<pre class="code">lab@R1# delete interfaces ge-0/0/0 unit 0 family inet address 10.20.1.1/30
lab@R1# set interfaces ge-0/0/0 unit 0 family inet address 10.20.9.1/30
lab@R1# show | compare
[edit interfaces ge-0/0/0 unit 0 family inet]
-       address 10.20.1.1/30;
+       address 10.20.9.1/30;

lab@R1# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

<span class="c">! ab configuration mode ke andar se test karo:</span>
lab@R1# run ping 10.20.9.2 count 3
3 packets transmitted, 3 packets received, <span class="hl">0% packet loss</span>

lab@R1# commit and-quit
commit complete
Exiting configuration mode</pre>
<p>Doosra <code>commit</code> (ya <code>commit check</code>) hi <b>confirmation</b> hai. Agar ping fail hota aur session mar jaata, timer khatam hone par R1 khud 10.20.1.1/30 par wapas aa jaata, taaki R2 (failure case mein purane subnet par) use dobara baat kar sake.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Commit confirmed timeline">
<line x1="30" y1="90" x2="610" y2="90" stroke="#64748b" stroke-width="2"/>
<circle cx="60" cy="90" r="8" fill="#fde68a"/><text x="60" y="125" text-anchor="middle" class="svg-ink" font-size="12">commit confirmed 5</text>
<circle cx="290" cy="90" r="8" fill="#bbf7d0"/><text x="290" y="125" text-anchor="middle" class="svg-ink" font-size="12">commit (confirm)</text>
<circle cx="560" cy="90" r="8" fill="#fed7aa"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="12">timer khatam: auto rollback</text>
<rect x="60" y="45" width="500" height="18" rx="9" fill="#e2e8f0"/><text x="310" y="58" text-anchor="middle" class="svg-muted" font-size="12">test aur confirm ke liye 5 minute ki window</text>
<text x="290" y="155" text-anchor="middle" class="svg-accent" font-size="12">Time par confirm karo to change rehta hai; chuke to purani config wapas</text>
</svg><p class="cap">commit confirmed aapke change ke liye dead-man switch hai.</p></div>

<h3>rollback</h3>
<p>Har commit pichli active configuration ko ek numbered file mein daal deta hai. <b>rollback 0</b> active wali hai, <b>rollback 1</b> pichle commit se pehle wali, aur <b>rollback 49</b> tak (kul 50 versions).</p>
<table class="cmp"><tr><th>Command</th><th>Result</th></tr>
<tr><td><code>rollback 0</code></td><td>uncommitted candidate changes phenk do (candidate = active)</td></tr>
<tr><td><code>rollback 1</code></td><td>pichli configuration candidate mein load karo</td></tr>
<tr><td><code>rollback 1</code> phir <code>commit</code></td><td>pichla commit sach mein undo</td></tr>
<tr><td><code>show system rollback 1 compare 0</code></td><td>pichle commit ne kya badla</td></tr>
<tr><td><code>show | compare rollback 1</code></td><td>candidate versus rollback 1 (configuration mode mein)</td></tr></table>
<p><b>Important:</b> rollback sirf <i>candidate</i> badalta hai. Device purani configuration tab tak nahi chalata jab tak aap dobara commit na karo. Rollback ka sabse zyada poochha jaane wala fact yahi hai.</p>
<pre class="code">lab@R1# rollback 1
load complete
lab@R1# show | compare
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
-       hello-interval 30;
lab@R1# commit and-quit</pre>

<h3>Commit history aur kisne kya kiya</h3>
<pre class="code">lab@R1&gt; show system commit
0   2026-10-01 11:20:44 UTC by lab via cli commit confirmed, rollback in 5mins
1   2026-10-01 11:05:12 UTC by lab via cli
    Pune uplink
2   2026-10-01 10:58:00 UTC by root via other</pre>
<p>Purane versions ko load kiye bina dekh sakte ho, jaise <code>show system rollback 3</code>.</p>

<div class="eg"><p><b>Worked example.</b> 11:20 baje aap <code>commit confirmed 5</code> chalate ho. 11:23 par aapne ping aur OSPF neighbour check kar liya aur <code>commit</code> type kiya. Change permanent ho gaya. Agar bhool jaate to 11:25 par router <code>UI_COMMIT_CONFIRMED_TIMEOUT</code> log karta aur purani configuration khud restore kar deta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>rollback 1</code> type karke bina commit ke maan lena ki problem theek ho gayi. <code>commit confirmed</code> ke baad timer se zyada der test karna. Plain commit ki jagah dusra <code>commit confirmed</code> chalana: isse bas timer dobara shuru hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Auto-rollback ko kya rokta hai? Time window ke andar dusra <code>commit</code> (ya <code>commit check</code>), configuration mode chhodna nahi aur <code>rollback 0</code> nahi. Yeh bhi yaad rakho: range rollback 0 se 49, aur 50 files rakhi jaati hain.</p></div>

<div class="scn"><h4>Raat 2 baje renumbering</h4><p>Core team ne R2 ko 10.20.9.2/30 par renumber kiya aur Pune engineer se kaha ki R1 ko SSH par 10.20.9.1/30 par le jaaye. Usne galti se naya address 10.20.19.1/30 type kiya aur <code>commit confirmed 5</code> use kiya. Session freeze ho gaya. Usne paanch minute bina kuch chhue intezaar kiya. R1 rollback ho gaya, SSH wapas aa gaya, aur usne change sahi se dohraya. Plain <code>commit</code> hota to site visit karni padti.</p><p><b>Lesson:</b> jis change se aapka apna raasta kat sakta ho uske liye <code>commit confirmed</code> use karo.</p></div>

<div class="iv"><p class="q">"Jis interface se connected ho use safely kaise badalte ho?"</p><p>Main change candidate mein karta hoon, <code>show | compare</code> se review karta hoon, aur chhote timer ke saath <code>commit confirmed</code> use karta hoon. Phir connectivity test karke doosre commit se confirm karta hoon. Access chala jaaye to router khud rollback ho jaata hai. Last resort ke liye rescue configuration bhi rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>commit confirmed N</code> N minute mein doosre commit se confirm na ho to auto-rollback karta hai.</li>
<li><code>rollback N</code> version N ko sirf candidate mein load karta hai; activate karne ke liye commit karo.</li>
<li>Rollback 0 active configuration hai; Junos 50 versions (0 se 49) rakhta hai.</li>
<li><code>show system commit</code> commits list karta hai; <code>show system rollback 1 compare 0</code> pichla change dikhata hai.</li>
<li>Uncommitted edits chhodne ke liye <code>rollback 0</code> use karo.</li>
</ul></div>
`}};export{e as default};