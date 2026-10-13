var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: who broke OSPF? Roll it back`,hi:`Troubleshooting workflow: OSPF kisne toda? Rollback karo`},body:{en:`
<p>When a house alarm rings, a good security guard does not run in circles. He checks the log: which door, at what time, who set the alarm last. A Junos engineer has the same log: the <b>commit history</b>. This chapter walks the third lab ticket step by step, then gives you a general workflow for any "it worked yesterday" problem.</p>

<h3>The ticket</h3>
<p>Topology: <b>R1</b> (192.0.2.1) is linked to <b>R2</b> (192.0.2.2) over <code>ge-0/0/0</code>, 10.20.1.0/30. R2 has the server LAN 172.16.50.0/24 on <code>ge-0/0/1</code> with the server SRV at 172.16.50.10. OSPF runs in area 0. <i>Since this morning R1 has no route to 172.16.50.0/24.</i></p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab topology R1 R2 SRV">
<rect x="40" y="45" width="110" height="60" rx="10" fill="#bae6fd"/><text x="95" y="72" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.1</text>
<rect x="265" y="45" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.2</text>
<rect x="490" y="45" width="110" height="60" rx="10" fill="#fde68a"/><text x="545" y="72" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">172.16.50.10</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="75" x2="265" y2="75"/><line x1="375" y1="75" x2="490" y2="75"/></g>
<text x="207" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/30</text><text x="432" y="68" text-anchor="middle" class="svg-muted" font-size="12">172.16.50.0/24</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">OSPF area 0 between R1 and R2: R1 has lost the server LAN</text>
</svg><p class="cap">The ticket topology: OSPF carries the server LAN from R2 to R1.</p></div>

<h3>Step 1: confirm the symptom</h3>
<pre class="code">lab@R1&gt; show route 172.16.50.0/24
<span class="c">(no output: no route)</span>
lab@R1&gt; show ospf neighbor
<span class="c">(no output: no neighbour)</span>
lab@R1&gt; ping 10.20.1.2 count 2
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>Layer 3 to the neighbour works (the ping succeeds) but the OSPF neighbour is gone. The link and addresses are fine; the problem is <i>in OSPF itself</i>, and the symptom began "this morning". That points at a recent change.</p>

<h3>Step 2: ask the commit history</h3>
<pre class="code">lab@R1&gt; show system commit
0   2026-10-01 08:12:40 UTC by lab via cli
    tuning
1   2026-10-01 07:55:03 UTC by lab via cli
    baseline</pre>
<p>A commit named <b>tuning</b> happened at 08:12. Never guess what it changed. Ask Junos:</p>
<pre class="code">lab@R1&gt; show system rollback 1 compare 0
[edit system]
+   syslog {
+       file messages {
+           any notice;
+       }
+   }
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
+       <span class="hl">hello-interval 30;</span></pre>
<p>The <code>+</code> line answers the lab question: the hello interval was set to <b>30 seconds</b>. R2 still uses the default of 10 seconds. OSPF requires both neighbours on a link to agree on hello and dead intervals; the dead interval defaults to four times the hello (so 120 on R1 against 40 on R2). The mismatch means hellos are ignored and the adjacency never forms.</p>

<h3>Step 3: undo exactly that change</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# rollback 1
load complete
lab@R1# show | compare
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
-       hello-interval 30;
[edit system]
-   syslog { ... }
lab@R1# commit and-quit
commit complete</pre>
<p>Rolling back to rollback 1 also removes the harmless syslog line from the same commit. That is acceptable here because the whole commit was a failed "tuning" exercise. If the syslog line were important, the alternative is to <code>delete protocols ospf area 0 interface ge-0/0/0.0 hello-interval</code> and commit, which fixes only the OSPF problem.</p>

<h3>Step 4: verify the fix</h3>
<pre class="code">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.20.1.2        ge-0/0/0.0             <span class="hl">Full</span>            192.0.2.2        128    35
lab@R1&gt; show route 172.16.50.0/24
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.50.0/24     *[OSPF/10] 00:01:00, metric 2
                    &gt;  to 10.20.1.2 via ge-0/0/0.0
lab@R1&gt; ping 172.16.50.1 count 3
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Give OSPF a few seconds after the commit. <b>Full</b> state, an OSPF route with preference 10, and a working ping together prove the repair.</p>

<h3>A general workflow for "it worked yesterday"</h3>
<ol>
<li><b>Define</b> the symptom with a command (a missing route, a down neighbour).</li>
<li><b>Layer-check</b> bottom up: <code>show interfaces terse</code>, <code>ping</code>, protocol state.</li>
<li><b>Ask what changed</b>: <code>show system commit</code>, then <code>show system rollback N compare M</code>.</li>
<li><b>Form one hypothesis</b> from the diff and confirm it (compare both ends if possible).</li>
<li><b>Fix with the smallest change</b>; use <code>commit confirmed</code> if the path could be cut.</li>
<li><b>Verify</b> with the same command that showed the symptom, then record a commit comment.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Changing both routers at once, so you never learn which change mattered; rolling back without reading the compare output; forgetting to wait for OSPF timers before declaring the fix a failure.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show system rollback 1 compare 0</code> reads "what is different between rollback 1 and the active configuration", so lines marked <code>+</code> are what the last commit added. In configuration mode the equivalent is <code>show | compare rollback 1</code> (candidate against rollback 1).</p></div>

<div class="scn"><h4>The tuning commit nobody remembered</h4><p>A senior engineer had changed hello timers on one side of a link during a Friday "optimisation" and forgot it. On Monday the NOC raised a P2: the branch server LAN was unreachable. The on-call engineer ran <code>show system commit</code>, saw the commit from Friday, compared it and found the hello change within three minutes. Without commit history the team would have compared full configurations of two routers by eye.</p><p><b>Lesson:</b> always write meaningful commit comments and always start with "what changed".</p></div>

<div class="iv"><p class="q">"OSPF neighbours are stuck or missing after a change. How do you find the cause on Junos?"</p><p>I confirm the interface and ping work, then run <code>show system commit</code> and <code>show system rollback 1 compare 0</code> to see the diff. For OSPF I check that hello and dead intervals, area, network type and authentication match on both ends. I roll back or delete only the offending statement and verify with <code>show ospf neighbor</code> reaching Full.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ping works but the OSPF neighbour is missing: look for a timer, area or authentication mismatch.</li>
<li><code>show system commit</code> and <code>show system rollback 1 compare 0</code> find the recent change quickly.</li>
<li>OSPF hello and dead intervals must match on both ends; default dead is four times hello.</li>
<li><code>rollback 1</code> then <code>commit</code> undoes the last commit; verify with <code>show ospf neighbor</code> and <code>show route</code>.</li>
<li>Work in order: symptom, layers, what changed, one hypothesis, smallest fix, verify.</li>
</ul></div>
`,hi:`
<p>Ghar ka alarm baje to achha security guard chakkar nahi kaatta. Woh log dekhta hai: kaunsa darwaza, kis time, alarm aakhri baar kisne set kiya. Junos engineer ke paas bhi wahi log hai: <b>commit history</b>. Yeh chapter teesre lab ticket ko step by step chalata hai, phir kisi bhi "kal tak chal raha tha" problem ke liye general workflow deta hai.</p>

<h3>Ticket</h3>
<p>Topology: <b>R1</b> (192.0.2.1) <b>R2</b> (192.0.2.2) se <code>ge-0/0/0</code> par, 10.20.1.0/30 se juda hai. R2 ke paas <code>ge-0/0/1</code> par server LAN 172.16.50.0/24 hai aur server SRV 172.16.50.10 par hai. OSPF area 0 mein chal raha hai. <i>Aaj subah se R1 ke paas 172.16.50.0/24 ka route nahi hai.</i></p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Lab topology R1 R2 SRV">
<rect x="40" y="45" width="110" height="60" rx="10" fill="#bae6fd"/><text x="95" y="72" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="95" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.1</text>
<rect x="265" y="45" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="14">R2</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.2</text>
<rect x="490" y="45" width="110" height="60" rx="10" fill="#fde68a"/><text x="545" y="72" text-anchor="middle" class="svg-ink" font-size="14">SRV</text><text x="545" y="92" text-anchor="middle" class="svg-muted" font-size="12">172.16.50.10</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="75" x2="265" y2="75"/><line x1="375" y1="75" x2="490" y2="75"/></g>
<text x="207" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/30</text><text x="432" y="68" text-anchor="middle" class="svg-muted" font-size="12">172.16.50.0/24</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">R1 aur R2 ke beech OSPF area 0: R1 ne server LAN kho diya</text>
</svg><p class="cap">Ticket topology: OSPF server LAN ko R2 se R1 tak le jaata hai.</p></div>

<h3>Step 1: symptom confirm karo</h3>
<pre class="code">lab@R1&gt; show route 172.16.50.0/24
<span class="c">(koi output nahi: route nahi)</span>
lab@R1&gt; show ospf neighbor
<span class="c">(koi output nahi: neighbour nahi)</span>
lab@R1&gt; ping 10.20.1.2 count 2
2 packets transmitted, 2 packets received, 0% packet loss</pre>
<p>Neighbour tak Layer 3 chal raha hai (ping succeed) lekin OSPF neighbour gayab hai. Link aur addresses theek hain; problem <i>OSPF ke andar</i> hai, aur symptom "aaj subah" se shuru hua. Yeh kisi recent change ki taraf ishara karta hai.</p>

<h3>Step 2: commit history se poocho</h3>
<pre class="code">lab@R1&gt; show system commit
0   2026-10-01 08:12:40 UTC by lab via cli
    tuning
1   2026-10-01 07:55:03 UTC by lab via cli
    baseline</pre>
<p>08:12 par <b>tuning</b> naam ka commit hua. Kabhi andaza mat lagao ki usne kya badla. Junos se poocho:</p>
<pre class="code">lab@R1&gt; show system rollback 1 compare 0
[edit system]
+   syslog {
+       file messages {
+           any notice;
+       }
+   }
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
+       <span class="hl">hello-interval 30;</span></pre>
<p><code>+</code> line lab ke sawaal ka jawab hai: hello interval <b>30 second</b> set hua. R2 abhi default 10 second use karta hai. OSPF mein link ke dono neighbours ko hello aur dead interval par agree karna padta hai; dead interval default mein hello ka chaar guna hota hai (R1 par 120 aur R2 par 40). Mismatch ka matlab hellos ignore hote hain aur adjacency kabhi nahi banti.</p>

<h3>Step 3: sirf wahi change undo karo</h3>
<pre class="code">lab@R1&gt; configure
lab@R1# rollback 1
load complete
lab@R1# show | compare
[edit protocols ospf area 0.0.0.0 interface ge-0/0/0.0]
-       hello-interval 30;
[edit system]
-   syslog { ... }
lab@R1# commit and-quit
commit complete</pre>
<p>Rollback 1 usi commit ki harmless syslog line bhi hata deta hai. Yahan theek hai kyunki poora commit ek failed "tuning" exercise tha. Syslog line zaroori hoti to alternative hai <code>delete protocols ospf area 0 interface ge-0/0/0.0 hello-interval</code> karke commit karna, jo sirf OSPF problem theek karta hai.</p>

<h3>Step 4: fix verify karo</h3>
<pre class="code">lab@R1&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.20.1.2        ge-0/0/0.0             <span class="hl">Full</span>            192.0.2.2        128    35
lab@R1&gt; show route 172.16.50.0/24
inet.0: 6 destinations, 6 routes (6 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.50.0/24     *[OSPF/10] 00:01:00, metric 2
                    &gt;  to 10.20.1.2 via ge-0/0/0.0
lab@R1&gt; ping 172.16.50.1 count 3
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Commit ke baad OSPF ko kuch second do. <b>Full</b> state, preference 10 wala OSPF route aur chalta ping milkar repair saabit karte hain.</p>

<h3>"Kal tak chal raha tha" ke liye general workflow</h3>
<ol>
<li>Symptom ko command se <b>define</b> karo (missing route, down neighbour).</li>
<li>Neeche se upar <b>layer-check</b>: <code>show interfaces terse</code>, <code>ping</code>, protocol state.</li>
<li><b>Poocho kya badla</b>: <code>show system commit</code>, phir <code>show system rollback N compare M</code>.</li>
<li>Diff se <b>ek hypothesis</b> banao aur confirm karo (ho sake to dono ends compare karo).</li>
<li><b>Sabse chhote change se fix</b> karo; raasta kat sakta ho to <code>commit confirmed</code> use karo.</li>
<li>Jis command ne symptom dikhaya tha usi se <b>verify</b> karo, phir commit comment likho.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Dono routers ek saath badalna, taaki pata hi na chale kaunsa change matter karta tha; compare output padhe bina rollback karna; OSPF timers ka intezaar kiye bina fix ko fail declare kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show system rollback 1 compare 0</code> ka matlab "rollback 1 aur active configuration mein kya alag hai", isliye <code>+</code> lines woh hain jo pichle commit ne add ki. Configuration mode mein iska equivalent <code>show | compare rollback 1</code> hai (candidate versus rollback 1).</p></div>

<div class="scn"><h4>Tuning commit jo kisi ko yaad nahi tha</h4><p>Ek senior engineer ne Friday ke "optimisation" mein link ki ek side par hello timers badle aur bhool gaya. Monday ko NOC ne P2 raise kiya: branch server LAN unreachable hai. On-call engineer ne <code>show system commit</code> chalaya, Friday ka commit dekha, compare kiya aur teen minute mein hello change pakad liya. Commit history ke bina team do routers ki poori configurations ankhon se compare karti.</p><p><b>Lesson:</b> hamesha meaningful commit comments likho aur hamesha "kya badla" se shuru karo.</p></div>

<div class="iv"><p class="q">"Change ke baad OSPF neighbours stuck ya missing hain. Junos par cause kaise dhoondhte ho?"</p><p>Main confirm karta hoon ki interface aur ping chal rahe hain, phir <code>show system commit</code> aur <code>show system rollback 1 compare 0</code> se diff dekhta hoon. OSPF ke liye check karta hoon ki hello aur dead intervals, area, network type aur authentication dono ends par match karte hain. Sirf galat statement rollback ya delete karta hoon aur <code>show ospf neighbor</code> ke Full tak pahunchne se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ping chalta hai lekin OSPF neighbour missing hai: timer, area ya authentication mismatch dhoondho.</li>
<li><code>show system commit</code> aur <code>show system rollback 1 compare 0</code> recent change jaldi dhoondhte hain.</li>
<li>OSPF hello aur dead intervals dono ends par match hone chahiye; default dead hello ka chaar guna.</li>
<li><code>rollback 1</code> phir <code>commit</code> pichla commit undo karta hai; <code>show ospf neighbor</code> aur <code>show route</code> se verify karo.</li>
<li>Is order mein kaam karo: symptom, layers, kya badla, ek hypothesis, sabse chhota fix, verify.</li>
</ul></div>
`}};export{e as default};