var e={id:`candidate-commit`,h:{en:`Candidate, compare and commit: your first commit`,hi:`Candidate, compare aur commit: aapka pehla commit`},body:{en:`
<p>When you write an email you can save drafts, re-read them and press Send only when happy. Commit is the Send button for a router. In this chapter you finish the first lab: review the change with <code>show | compare</code>, then commit with a comment and prove it works.</p>

<h3>Compare: what exactly will change?</h3>
<p><code>show | compare</code> prints the difference between the candidate and the active configuration. Lines starting with <code>+</code> will be added, lines starting with <code>-</code> will be removed.</p>
<pre class="code">[edit]
lab@R1# show | compare
[edit]
+  system {
+      host-name R1-PUNE;
+  }
[edit interfaces]
+   ge-0/0/0 {
+       unit 0 {
+           family inet {
+               address 10.20.1.1/30;
+           }
+       }
+   }</pre>
<p>Make this a habit: <b>set, compare, commit</b>. A change that you cannot explain in the compare output is a change you must not commit.</p>

<h3>The commit family</h3>
<table class="cmp"><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>commit check</code></td><td>validate the candidate; do not activate</td></tr>
<tr><td><code>commit</code></td><td>validate and activate; old active becomes rollback 1</td></tr>
<tr><td><code>commit comment "text"</code></td><td>commit and log a note in the history</td></tr>
<tr><td><code>commit and-quit</code></td><td>commit, then leave configuration mode</td></tr>
<tr><td><code>commit confirmed N</code></td><td>commit with an N-minute auto-rollback timer (next chapter)</td></tr>
<tr><td><code>commit at "HH:MM"</code></td><td>schedule a commit for later</td></tr></table>
<p>When you commit, Junos first checks syntax and mandatory statements, then loads the configuration into the running processes. If any check fails, <b>nothing</b> is applied. Commits are all-or-nothing, so the router is never left half-configured.</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Commit steps">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">set / delete</text>
<rect x="165" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">show | compare</text>
<rect x="320" y="40" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="70" text-anchor="middle" class="svg-ink" font-size="13">commit check</text>
<rect x="475" y="40" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="13">commit (active)</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="65" x2="165" y2="65"/><line x1="295" y1="65" x2="320" y2="65"/><line x1="450" y1="65" x2="475" y2="65"/></g>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">a failed check stops the whole commit: nothing is applied</text>
</svg><p class="cap">The safe workflow: edit, review, validate, activate.</p></div>

<h3>Committing with a comment</h3>
<pre class="code">lab@R1# commit comment "Pune uplink" and-quit
commit complete
Exiting configuration mode

lab@R1-PUNE&gt; show system commit
0   2026-10-01 09:58:02 UTC by lab via cli
    Pune uplink
1   2026-10-01 09:41:10 UTC by root via other
    factory defaults</pre>
<p>Notice the prompt changed to <code>R1-PUNE</code> because the host name is now active. Commit comments are your audit trail: they say <b>why</b> a change was made, not only what changed.</p>

<h3>Prove it works</h3>
<pre class="code">lab@R1-PUNE&gt; ping 10.20.1.2 count 3
PING 10.20.1.2 (10.20.1.2): 56 data bytes
64 bytes from 10.20.1.2: icmp_seq=0 ttl=64 time=1.2 ms
64 bytes from 10.20.1.2: icmp_seq=1 ttl=64 time=0.9 ms
64 bytes from 10.20.1.2: icmp_seq=2 ttl=64 time=0.8 ms

--- 10.20.1.2 ping statistics ---
3 packets transmitted, 3 packets received, <span class="hl">0% packet loss</span></pre>
<p>Junos <code>ping</code> runs forever unless you give <code>count N</code> (or press Ctrl+C). Always confirm a change with a real test, not only with a "commit complete".</p>

<h3>Commit errors</h3>
<pre class="code">lab@R1# commit
[edit interfaces ge-0/0/0 unit 0 family inet]
  'address 10.20.1.1/33'
    invalid prefix length
error: configuration check-out failed</pre>
<p>Read the bracketed path: it names the exact place of the error. Fix it, then commit again. Nothing was applied.</p>

<h3>Private and exclusive editing</h3>
<p>If two engineers enter <code>configure</code> at the same time they share one candidate and see each other's uncommitted changes (Junos warns <code>Users currently editing the configuration</code>). Use <code>configure private</code> to edit your own copy, or <code>configure exclusive</code> to lock the candidate against others.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving configuration mode with <code>exit</code> and answering <i>yes</i> to losing changes by habit; committing without <code>show | compare</code>; forgetting that <code>commit</code> also commits changes another engineer made in the shared candidate.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit check</code> verifies syntax and does not activate. <code>commit</code> saves the previous active configuration as rollback 1. A failed commit leaves the active configuration untouched.</p></div>

<div class="scn"><h4>Two engineers, one candidate</h4><p>At the Pune branch, Asha was halfway through an OSPF change when Ravi logged in to add a description and typed <code>commit</code>. Asha's incomplete OSPF lines went live and a neighbour dropped. The login banner had shown <code>Users currently editing the configuration: asha</code>, but Ravi ignored it. From then on the team used <code>configure private</code> for all edits.</p><p><b>Lesson:</b> a shared candidate means shared risk; use private or exclusive mode and read <code>show system commit</code> to see who committed what.</p></div>

<div class="iv"><p class="q">"What does commit do if there is a syntax error in the candidate?"</p><p>It fails at the check stage and reports the error with the exact hierarchy path. The active configuration is not changed because the commit is atomic. A strong answer adds <code>commit check</code> as a way to test without activating, and <code>commit comment</code> for an audit trail.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show | compare</code> shows <code>+</code> and <code>-</code> lines of the pending change.</li>
<li>Commits are atomic: all checks pass or nothing is applied.</li>
<li><code>commit comment "why"</code> and <code>show system commit</code> give an audit trail.</li>
<li><code>commit and-quit</code> commits and leaves configuration mode.</li>
<li><code>configure private</code> and <code>configure exclusive</code> avoid editing collisions.</li>
</ul></div>
`,hi:`
<p>Email likhte waqt aap drafts save kar sakte ho, dobara padh sakte ho aur khush hone par hi Send dabate ho. Router ke liye commit Send button hai. Is chapter mein aap pehla lab poora karoge: <code>show | compare</code> se change review karo, phir comment ke saath commit karo aur saabit karo ki chal raha hai.</p>

<h3>Compare: exactly kya badlega?</h3>
<p><code>show | compare</code> candidate aur active configuration ka difference print karta hai. <code>+</code> se shuru lines judengi, <code>-</code> se shuru lines hategi.</p>
<pre class="code">[edit]
lab@R1# show | compare
[edit]
+  system {
+      host-name R1-PUNE;
+  }
[edit interfaces]
+   ge-0/0/0 {
+       unit 0 {
+           family inet {
+               address 10.20.1.1/30;
+           }
+       }
+   }</pre>
<p>Isey aadat bana lo: <b>set, compare, commit</b>. Jis change ko aap compare output mein samjha nahi sakte use commit mat karo.</p>

<h3>Commit family</h3>
<table class="cmp"><tr><th>Command</th><th>Kya karta hai</th></tr>
<tr><td><code>commit check</code></td><td>candidate validate karta hai; activate nahi karta</td></tr>
<tr><td><code>commit</code></td><td>validate aur activate; purana active rollback 1 ban jaata hai</td></tr>
<tr><td><code>commit comment "text"</code></td><td>commit karta hai aur history mein note likhta hai</td></tr>
<tr><td><code>commit and-quit</code></td><td>commit karke configuration mode se bahar</td></tr>
<tr><td><code>commit confirmed N</code></td><td>N minute ke auto-rollback timer ke saath commit (agla chapter)</td></tr>
<tr><td><code>commit at "HH:MM"</code></td><td>commit ko baad ke liye schedule karta hai</td></tr></table>
<p>Commit par Junos pehle syntax aur mandatory statements check karta hai, phir configuration running processes mein load karta hai. Koi bhi check fail ho to <b>kuch bhi</b> apply nahi hota. Commits all-or-nothing hote hain, isliye router kabhi aadha configure nahi rehta.</p>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Commit steps">
<rect x="10" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">set / delete</text>
<rect x="165" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="230" y="70" text-anchor="middle" class="svg-ink" font-size="13">show | compare</text>
<rect x="320" y="40" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="385" y="70" text-anchor="middle" class="svg-ink" font-size="13">commit check</text>
<rect x="475" y="40" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="13">commit (active)</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="65" x2="165" y2="65"/><line x1="295" y1="65" x2="320" y2="65"/><line x1="450" y1="65" x2="475" y2="65"/></g>
<text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">check fail hua to poora commit ruk jaata hai: kuch apply nahi hota</text>
</svg><p class="cap">Safe workflow: edit, review, validate, activate.</p></div>

<h3>Comment ke saath commit</h3>
<pre class="code">lab@R1# commit comment "Pune uplink" and-quit
commit complete
Exiting configuration mode

lab@R1-PUNE&gt; show system commit
0   2026-10-01 09:58:02 UTC by lab via cli
    Pune uplink
1   2026-10-01 09:41:10 UTC by root via other
    factory defaults</pre>
<p>Dhyan do prompt <code>R1-PUNE</code> ho gaya kyunki host name ab active hai. Commit comments aapka audit trail hain: yeh batate hain change <b>kyun</b> hua, sirf kya badla yeh nahi.</p>

<h3>Saabit karo ki chal raha hai</h3>
<pre class="code">lab@R1-PUNE&gt; ping 10.20.1.2 count 3
PING 10.20.1.2 (10.20.1.2): 56 data bytes
64 bytes from 10.20.1.2: icmp_seq=0 ttl=64 time=1.2 ms
64 bytes from 10.20.1.2: icmp_seq=1 ttl=64 time=0.9 ms
64 bytes from 10.20.1.2: icmp_seq=2 ttl=64 time=0.8 ms

--- 10.20.1.2 ping statistics ---
3 packets transmitted, 3 packets received, <span class="hl">0% packet loss</span></pre>
<p>Junos <code>ping</code> tab tak chalta rehta hai jab tak <code>count N</code> na do (ya Ctrl+C dabao). Change ko hamesha real test se confirm karo, sirf "commit complete" se nahi.</p>

<h3>Commit errors</h3>
<pre class="code">lab@R1# commit
[edit interfaces ge-0/0/0 unit 0 family inet]
  'address 10.20.1.1/33'
    invalid prefix length
error: configuration check-out failed</pre>
<p>Bracket wala path padho: yeh error ki exact jagah batata hai. Theek karo, phir commit karo. Kuch apply nahi hua tha.</p>

<h3>Private aur exclusive editing</h3>
<p>Do engineers ek saath <code>configure</code> karein to ek hi candidate share karte hain aur ek-dusre ke uncommitted changes dekhte hain (Junos warn karta hai <code>Users currently editing the configuration</code>). Apni alag copy edit karne ke liye <code>configure private</code>, ya dusron se candidate lock karne ke liye <code>configure exclusive</code> use karo.</p>

<div class="warn"><p><b>Common mistakes.</b> Aadatan changes khone ka sawaal <i>yes</i> karke <code>exit</code> kar dena; <code>show | compare</code> ke bina commit karna; yeh bhool jaana ki shared candidate mein dusre engineer ke changes bhi <code>commit</code> ke saath commit ho jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>commit check</code> syntax verify karta hai aur activate nahi karta. <code>commit</code> pichli active configuration ko rollback 1 ke roop mein save karta hai. Failed commit active configuration ko chhoota bhi nahi.</p></div>

<div class="scn"><h4>Do engineers, ek candidate</h4><p>Pune branch mein Asha OSPF change ke beech mein thi jab Ravi ne login karke description add ki aur <code>commit</code> type kiya. Asha ki adhoori OSPF lines live ho gayi aur ek neighbour gir gaya. Login banner ne <code>Users currently editing the configuration: asha</code> dikhaya tha, lekin Ravi ne ignore kiya. Tab se team ne saare edits ke liye <code>configure private</code> use kiya.</p><p><b>Lesson:</b> shared candidate ka matlab shared risk; private ya exclusive mode use karo aur <code>show system commit</code> se dekho kisne kya commit kiya.</p></div>

<div class="iv"><p class="q">"Candidate mein syntax error ho to commit kya karta hai?"</p><p>Yeh check stage par fail hota hai aur error ko exact hierarchy path ke saath batata hai. Active configuration nahi badalti kyunki commit atomic hai. Strong answer mein <code>commit check</code> (bina activate kiye test) aur audit trail ke liye <code>commit comment</code> ka zikr hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>show | compare</code> pending change ki <code>+</code> aur <code>-</code> lines dikhata hai.</li>
<li>Commits atomic hain: saare checks pass ya kuch bhi apply nahi.</li>
<li><code>commit comment "why"</code> aur <code>show system commit</code> audit trail dete hain.</li>
<li><code>commit and-quit</code> commit karke configuration mode chhodta hai.</li>
<li><code>configure private</code> aur <code>configure exclusive</code> editing collisions se bachate hain.</li>
</ul></div>
`}};export{e as default};