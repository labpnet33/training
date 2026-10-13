var e={id:`safe-change`,h:{en:`Changing a live network safely`,hi:`Live network mein safely change karna`},body:{en:`
<p>At professional level you are trusted with the core. A mistaken change there affects thousands of users, and sometimes it cuts the very session you are using to repair it. Junos gives you the tools for safe change: a candidate configuration, <code>show | compare</code>, <code>commit check</code>, <code>commit confirmed</code>, rollback, and protocol features such as <b>overload</b> that drain a router before work starts. This chapter shows how to combine them into a habit.</p>

<h3>The safe-change loop</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe change loop">
<rect x="10" y="45" width="100" height="56" rx="8" fill="#bae6fd"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="12">Baseline</text><text x="60" y="88" text-anchor="middle" class="svg-muted" font-size="10">save show output</text>
<rect x="125" y="45" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="175" y="70" text-anchor="middle" class="svg-ink" font-size="12">Drain</text><text x="175" y="88" text-anchor="middle" class="svg-muted" font-size="10">overload if needed</text>
<rect x="240" y="45" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="290" y="70" text-anchor="middle" class="svg-ink" font-size="12">Compare</text><text x="290" y="88" text-anchor="middle" class="svg-muted" font-size="10">show | compare</text>
<rect x="355" y="45" width="100" height="56" rx="8" fill="#fde68a"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="10">confirmed N</text>
<rect x="470" y="45" width="100" height="56" rx="8" fill="#fed7aa"/><text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="12">Prove</text><text x="520" y="88" text-anchor="middle" class="svg-muted" font-size="10">same show output</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Good: confirm with commit. Bad: let the timer roll back, or rollback 1.</text>
</svg><p class="cap">Baseline, drain, compare, commit confirmed, prove.</p></div>

<h3>Step 1: baseline</h3>
<p>Before touching anything, save the outputs that prove the service works: the neighbour list, the routes you care about, a ping to the destination. After the change you repeat exactly these commands. A change is only "successful" when the after matches the plan.</p>

<h3>Step 2: drain the router</h3>
<p>If work will interrupt forwarding, move traffic away first. In OSPF, <code>set protocols ospf overload</code> makes transit links cost 65535, so neighbours choose another path while the router's own loopback stays reachable. IS-IS has the same idea with the overload bit. You will practise both in the next modules.</p>

<h3>Step 3: compare and commit confirmed</h3>
<p><code>show | compare</code> prints the difference between the candidate and the active configuration. Read every line: a <code>+</code> is an addition, a <code>-</code> a removal. Then use <code>commit confirmed</code> so that Junos rolls the change back by itself if you lose access and cannot confirm.</p>
<pre class="out">lab@R2-HO# set protocols ospf area 0.0.0.1 interface ge-0/0/1.0 metric 50
lab@R2-HO# show | compare
[edit protocols ospf area 0.0.0.1 interface ge-0/0/1.0]
+   metric 50;

lab@R2-HO# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

# commit confirmed will be rolled back in 5 minutes

lab@R2-HO&gt; show system commit
commit confirmed, rollback in 5mins
0   2026-10-01 23:25:19 UTC by lab via cli commit confirmed, rollback in 5mins
1   2026-10-01 23:22:56 UTC by root via other</pre>
<p>Now prove the effect with the baseline commands. Here the route to 172.16.5.0/24 changed its metric from 3 to 52, which is exactly what the plan expected for a link metric of 50:</p>
<pre class="out">lab@R2-HO&gt; show route 172.16.5.0/24
172.16.5.0/24      *[OSPF/10] 00:01:20, <span class="hl">metric 52</span>
                    &gt;  to 10.5.23.2 via ge-0/0/1.0</pre>
<p>If the result is good, run <code>commit</code> again inside the timer to confirm. If it is wrong, do nothing and the timer rolls back, or run <code>rollback 1</code> and <code>commit</code>. In the lab we undo the change on purpose:</p>
<pre class="out">lab@R2-HO# rollback 1
load complete

lab@R2-HO# show | compare
[edit protocols ospf area 0.0.0.1 interface ge-0/0/1.0]
<span class="hl">-   metric 50;</span>

lab@R2-HO# commit
commit complete</pre>

<h3>Step 4: write the back-out first</h3>
<p>A change plan has three parts: the commands, the proof, and the back-out. Write the back-out before you start. For configuration it is usually "rollback 1" or the exact <code>delete</code> lines. For a policy change it may also include clearing a BGP session softly, so decide that in advance.</p>

<div class="eg"><p><b>Worked example.</b> Plan: add an export policy on R4 to advertise two partner networks. Baseline: <code>show route protocol ospf</code> on R1 (two external routes expected after the change, none before). Change: set the policy, <code>show | compare</code>, <code>commit confirmed 5</code>. Proof: R1 shows 192.0.2.0/24 and 198.51.100.0/24 as [OSPF/150]. Back-out: <code>rollback 1</code>, commit. Total risk: low, total time: minutes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using <code>commit confirmed</code> and then closing the session without verifying. If the change was fine you must still confirm with a plain <code>commit</code> before the timer ends, or the good change is undone.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>rollback 0</code> reloads the active configuration into the candidate, discarding uncommitted edits. <code>rollback 1</code> loads the previous committed version; neither takes effect until you commit.</p></div>

<div class="scn"><h4>Lost access, saved by the timer</h4><p>An engineer changed the IP address on the management-facing interface of a remote router and committed. The session died. Because the commit was <code>commit confirmed 5</code>, the router rolled back by itself after five minutes and the engineer logged in again, then repeated the change with the new address on a secondary path first.</p><p><b>Lesson:</b> use confirmed commits for any change that can cut your own access.</p></div>

<div class="iv"><p class="q">"How do you avoid an outage when changing a production router remotely?"</p><p>Baseline the show outputs, drain the router with overload if forwarding will be disturbed, review with <code>show | compare</code>, use <code>commit confirmed</code> with a short timer, prove the result with the baseline commands, then confirm. Keep the back-out ready and a second access path such as console or out-of-band management.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline, drain, compare, commit confirmed, prove, then confirm.</li>
<li>show | compare shows exactly what will change; read every line.</li>
<li>commit confirmed rolls back automatically unless confirmed by another commit.</li>
<li>Overload moves transit traffic away while keeping the router reachable.</li>
<li>Write the back-out before you start.</li>
</ul></div>
`,hi:`
<p>Professional level par aap par core ka bharosa kiya jaata hai. Wahan galat change hazaaron users ko asar karta hai, aur kabhi-kabhi wahi session kaat deta hai jisse aap repair kar rahe ho. Junos safe change ke tools deta hai: candidate configuration, <code>show | compare</code>, <code>commit check</code>, <code>commit confirmed</code>, rollback, aur protocol features jaise <b>overload</b> jo kaam shuru hone se pehle router ko drain karte hain. Yeh chapter inhe aadat mein jodna dikhata hai.</p>

<h3>Safe-change loop</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Safe change loop">
<rect x="10" y="45" width="100" height="56" rx="8" fill="#bae6fd"/><text x="60" y="70" text-anchor="middle" class="svg-ink" font-size="12">Baseline</text><text x="60" y="88" text-anchor="middle" class="svg-muted" font-size="10">show output save</text>
<rect x="125" y="45" width="100" height="56" rx="8" fill="#bbf7d0"/><text x="175" y="70" text-anchor="middle" class="svg-ink" font-size="12">Drain</text><text x="175" y="88" text-anchor="middle" class="svg-muted" font-size="10">zaroorat ho to overload</text>
<rect x="240" y="45" width="100" height="56" rx="8" fill="#ddd6fe"/><text x="290" y="70" text-anchor="middle" class="svg-ink" font-size="12">Compare</text><text x="290" y="88" text-anchor="middle" class="svg-muted" font-size="10">show | compare</text>
<rect x="355" y="45" width="100" height="56" rx="8" fill="#fde68a"/><text x="405" y="70" text-anchor="middle" class="svg-ink" font-size="12">Commit</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="10">confirmed N</text>
<rect x="470" y="45" width="100" height="56" rx="8" fill="#fed7aa"/><text x="520" y="70" text-anchor="middle" class="svg-ink" font-size="12">Prove</text><text x="520" y="88" text-anchor="middle" class="svg-muted" font-size="10">wahi show output</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Theek: commit se confirm. Kharab: timer rollback kare, ya rollback 1.</text>
</svg><p class="cap">Baseline, drain, compare, commit confirmed, prove.</p></div>

<h3>Step 1: baseline</h3>
<p>Kuch chhune se pehle woh outputs save karo jo saabit karte hain ki service chal rahi hai: neighbour list, jo routes aapke liye mayne rakhte hain, destination tak ping. Change ke baad bilkul wahi commands dobara chalao. Change tabhi "successful" hai jab baad ka result plan se match kare.</p>

<h3>Step 2: router ko drain karo</h3>
<p>Kaam se forwarding mein rukawat aayegi to pehle traffic hatao. OSPF mein <code>set protocols ospf overload</code> transit links ka cost 65535 kar deta hai, isliye neighbours doosra path chunte hain jabki router ka apna loopback reachable rehta hai. IS-IS mein overload bit se yahi idea hai. Dono ki practice agle modules mein karoge.</p>

<h3>Step 3: compare aur commit confirmed</h3>
<p><code>show | compare</code> candidate aur active configuration ka difference print karta hai. Har line padho: <code>+</code> addition hai, <code>-</code> removal. Phir <code>commit confirmed</code> use karo taaki access kho dene aur confirm na kar paane par Junos change ko khud rollback kar de.</p>
<pre class="out">lab@R2-HO# set protocols ospf area 0.0.0.1 interface ge-0/0/1.0 metric 50
lab@R2-HO# show | compare
[edit protocols ospf area 0.0.0.1 interface ge-0/0/1.0]
+   metric 50;

lab@R2-HO# commit confirmed 5
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

# commit confirmed will be rolled back in 5 minutes

lab@R2-HO&gt; show system commit
commit confirmed, rollback in 5mins
0   2026-10-01 23:25:19 UTC by lab via cli commit confirmed, rollback in 5mins
1   2026-10-01 23:22:56 UTC by root via other</pre>
<p>Ab baseline commands se asar saabit karo. Yahan 172.16.5.0/24 ka route metric 3 se 52 ho gaya, jo link metric 50 ke plan ke bilkul mutabik hai:</p>
<pre class="out">lab@R2-HO&gt; show route 172.16.5.0/24
172.16.5.0/24      *[OSPF/10] 00:01:20, <span class="hl">metric 52</span>
                    &gt;  to 10.5.23.2 via ge-0/0/1.0</pre>
<p>Result theek ho to timer ke andar dobara <code>commit</code> chalakar confirm karo. Galat ho to kuch mat karo aur timer rollback kar dega, ya <code>rollback 1</code> aur <code>commit</code> chalao. Lab mein hum jaanbujhkar change undo karte hain:</p>
<pre class="out">lab@R2-HO# rollback 1
load complete

lab@R2-HO# show | compare
[edit protocols ospf area 0.0.0.1 interface ge-0/0/1.0]
<span class="hl">-   metric 50;</span>

lab@R2-HO# commit
commit complete</pre>

<h3>Step 4: back-out pehle likho</h3>
<p>Change plan ke teen hisse hote hain: commands, proof aur back-out. Shuru karne se pehle back-out likho. Configuration ke liye aam taur par "rollback 1" ya exact <code>delete</code> lines. Policy change mein BGP session ko softly clear karna bhi ho sakta hai, isliye pehle se tay karo.</p>

<div class="eg"><p><b>Worked example.</b> Plan: R4 par export policy lagakar do partner networks advertise karna. Baseline: R1 par <code>show route protocol ospf</code> (change ke baad do external routes, pehle koi nahi). Change: policy set karo, <code>show | compare</code>, <code>commit confirmed 5</code>. Proof: R1 par 192.0.2.0/24 aur 198.51.100.0/24 [OSPF/150] dikhein. Back-out: <code>rollback 1</code>, commit. Risk: kam, samay: kuch minutes.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>commit confirmed</code> ke baad bina verify kiye session band kar dena. Change theek tha to bhi timer khatam hone se pehle plain <code>commit</code> se confirm karna padta hai, warna achha change undo ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>rollback 0</code> active configuration ko candidate mein reload karta hai aur uncommitted edits hata deta hai. <code>rollback 1</code> pichla committed version load karta hai; commit karne tak koi asar nahi hota.</p></div>

<div class="scn"><h4>Access gaya, timer ne bacha liya</h4><p>Ek engineer ne remote router ke management-facing interface ka IP address badla aur commit kiya. Session mar gaya. Commit <code>commit confirmed 5</code> tha, isliye router paanch minute baad khud rollback ho gaya aur engineer dobara login kar saka, phir pehle secondary path par naye address ke saath change doharaya.</p><p><b>Lesson:</b> jo change aapka apna access kaat sakta hai uske liye confirmed commits use karo.</p></div>

<div class="iv"><p class="q">"Production router remotely change karte waqt outage kaise bachaoge?"</p><p>Show outputs ka baseline lo, forwarding disturb hogi to overload se router drain karo, <code>show | compare</code> se review karo, chhote timer ke saath <code>commit confirmed</code> use karo, baseline commands se result saabit karo, phir confirm karo. Back-out ready rakho aur doosra access path jaise console ya out-of-band management.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline, drain, compare, commit confirmed, prove, phir confirm.</li>
<li>show | compare bilkul dikhata hai kya badlega; har line padho.</li>
<li>commit confirmed khud rollback karta hai jab tak doosre commit se confirm na ho.</li>
<li>Overload transit traffic ko hatata hai jabki router reachable rehta hai.</li>
<li>Shuru karne se pehle back-out likho.</li>
</ul></div>
`}};export{e as default};