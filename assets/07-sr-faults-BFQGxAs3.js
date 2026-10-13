var e={id:`sr-faults`,h:{en:`Faults in the SR core: conflicts, protection and migration from LDP`,hi:`SR core ke faults: conflicts, protection aur LDP se migration`},body:{en:`
<p>Once the VPN is up, most real incidents come from the transport underneath it. This chapter groups the SR faults you will meet into four families and finishes with the planned change that every operator eventually performs: moving from LDP to segment routing.</p>

<h3>Four fault families</h3>
<table class="cmp"><tr><th>Family</th><th>Typical cause</th><th>What you see</th></tr>
<tr><td>Missing SR</td><td>No <code>segment-routing mpls</code> under IS-IS, or SID map missing</td><td>"No Label" at the upstream router</td></tr>
<tr><td>Conflict or range</td><td>Duplicate index; index outside the SRGB</td><td>SID conflict log; label missing for two routers</td></tr>
<tr><td>IS-IS detail</td><td>Narrow metrics, loopback not in IS-IS</td><td>Prefix or SID missing; adjacency still up</td></tr>
<tr><td>No protection</td><td>TI-LFA absent, or protection covers only some prefixes</td><td>Traffic loss until IS-IS reconverges</td></tr></table>

<h3>TI-LFA in the ring</h3>
<p>The ring gives PE1 two ways to reach PE2: the top path through P1, and the bottom path through P2 and P3. Fast reroute prepares the bottom path in advance.</p>
<pre class="code">router isis
 fast-reroute per-prefix level-2 all
 fast-reroute ti-lfa level-2</pre>
<pre class="out">PE1# show isis fast-reroute ti-lfa
10.0.255.5/32  via 10.0.12.2 (P1)
  <span class="hl">repair path: PE1 - P2 - P3 - PE2, Q node P3, 1 label</span></pre>
<p>The Q node is the point the repair path can reach by normal shortest-path routing; the adjacency SID covers the slow link between P2 and P3. When the PE1 to P1 link fails, PE1 swaps to this stack immediately.</p>

<h3>Migrating from LDP to SR</h3>
<ol>
<li>Enable SR alongside LDP. Assign indexes. Both label sets exist.</li>
<li>Verify labels: every router shows the 160xx label for every loopback.</li>
<li>Confirm that SR is preferred, then remove LDP on a link or router at a time.</li>
<li>After each step, test the VPN end to end.</li>
</ol>
<p>The simulator in this course does not carry VPN traffic well while both label protocols are active, so the migration lab checks the final state: SR everywhere, LDP gone, VPN working. On real platforms a mixed phase is safe for hours.</p>

<div class="eg"><b>Worked example.</b> A change window removes <code>mpls ip</code> from P1 interfaces. Before the change the table shows two labels for PE2: an LDP label such as 24 and the SR label 16005. After the change only 16005 remains, VPN pings still pass, and the LDP neighbor count is zero.</div>

<div class="warn"><b>Common mistake.</b> Removing LDP before checking that the SR labels exist on every router. One forgotten P router then becomes a black hole for the VPN.</div>

<div class="exam"><b>Exam trap.</b> The repair label for TI-LFA can be an adjacency SID. Prefix SIDs are global but adjacency SIDs are not, so the repair stack only works on the router that computed it.</div>

<div class="scn"><h4>The protection that was not there</h4><p>A fibre cut caused two seconds of loss on a customer circuit. The review found per-prefix FRR enabled but TI-LFA absent, so PE1 had no backup for PE2 across the slow link. After adding TI-LFA a maintenance drill that shut the link showed a single repair label and no visible loss.</p><p><b>Lesson:</b> prove protection in a drill; do not assume it.</p></div>

<div class="iv"><p class="q">"How would you migrate a network from LDP to SR with minimum risk?"</p><p>Run SR beside LDP, verify labels everywhere, switch preference, remove LDP in small steps with end-to-end checks, and keep a rollback. Mention TI-LFA as a bonus once LDP is gone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four families: missing SR, conflicts, IS-IS detail, no protection.</li>
<li>TI-LFA prepares a short repair stack, often with an adjacency SID.</li>
<li>Migrate in steps and verify the VPN after each.</li>
<li>Prove protection with a drill.</li>
</ul></div>
`,hi:`
<p>VPN up hone ke baad zyadatar asli incidents uske neeche ke transport se aate hain. Yeh chapter SR faults ko chaar families mein baant-ta hai aur us planned change par khatam hota hai jo har operator ko kabhi na kabhi karna padta hai: LDP se segment routing par jaana.</p>

<h3>Chaar fault families</h3>
<table class="cmp"><tr><th>Family</th><th>Aam wajah</th><th>Kya dikhta hai</th></tr>
<tr><td>Missing SR</td><td>IS-IS ke neeche <code>segment-routing mpls</code> nahi, ya SID map missing</td><td>Upstream router par "No Label"</td></tr>
<tr><td>Conflict ya range</td><td>Duplicate index; SRGB ke bahar index</td><td>SID conflict log; do routers ka label missing</td></tr>
<tr><td>IS-IS detail</td><td>Narrow metrics, loopback IS-IS mein nahi</td><td>Prefix ya SID missing; adjacency phir bhi up</td></tr>
<tr><td>Protection nahi</td><td>TI-LFA absent, ya protection sirf kuch prefixes ko cover karti hai</td><td>IS-IS reconverge hone tak traffic loss</td></tr></table>

<h3>Ring mein TI-LFA</h3>
<p>Ring PE1 ko PE2 tak do raaste deti hai: P1 ke raaste upar wala, aur P2 aur P3 ke raaste neeche wala. Fast reroute neeche wala path pehle se taiyaar rakhta hai.</p>
<pre class="code">router isis
 fast-reroute per-prefix level-2 all
 fast-reroute ti-lfa level-2</pre>
<pre class="out">PE1# show isis fast-reroute ti-lfa
10.0.255.5/32  via 10.0.12.2 (P1)
  <span class="hl">repair path: PE1 - P2 - P3 - PE2, Q node P3, 1 label</span></pre>
<p>Q node woh point hai jahan repair path normal shortest-path routing se pahunch sakta hai; adjacency SID P2 aur P3 ke beech ke dheeme link ko cover karta hai. Jab PE1 se P1 ka link fail hota hai, PE1 turant is stack par swap kar deta hai.</p>

<h3>LDP se SR par migration</h3>
<ol>
<li>LDP ke saath SR enable karo. Indexes assign karo. Dono label sets maujood hote hain.</li>
<li>Labels verify karo: har router har loopback ke liye 160xx label dikhaye.</li>
<li>Confirm karo ki SR preferred hai, phir ek ek link ya router par LDP hatao.</li>
<li>Har step ke baad VPN ko end to end test karo.</li>
</ol>
<p>Is course ka simulator dono label protocols active hone par VPN traffic achhe se nahi le jaata, isliye migration lab final state check karta hai: har jagah SR, LDP gayab, VPN working. Asli platforms par mixed phase ghanton tak safe hota hai.</p>

<div class="eg"><b>Worked example.</b> Change window P1 ke interfaces se <code>mpls ip</code> hataati hai. Change se pehle table PE2 ke liye do labels dikhati hai: LDP label jaise 24 aur SR label 16005. Baad mein sirf 16005 bachta hai, VPN ping pass hote hain, aur LDP neighbor count zero hai.</div>

<div class="warn"><b>Common mistake.</b> Yeh check kiye bina ki har router par SR labels maujood hain, LDP hata dena. Ek bhoola hua P router VPN ke liye black hole ban jaata hai.</div>

<div class="exam"><b>Exam trap.</b> TI-LFA ka repair label adjacency SID ho sakta hai. Prefix SIDs global hote hain par adjacency SIDs nahi, isliye repair stack sirf usi router par kaam karta hai jisne use compute kiya.</div>

<div class="scn"><h4>Woh protection jo thi hi nahi</h4><p>Fibre cut se customer circuit par do second ka loss hua. Review mein paaya gaya ki per-prefix FRR enabled tha par TI-LFA absent, isliye PE1 ke paas dheeme link ke paar PE2 ke liye backup nahi tha. TI-LFA jodne ke baad link shut karne wali maintenance drill ne ek repair label aur koi dikhta loss nahi dikhaya.</p><p><b>Lesson:</b> protection ko drill mein prove karo; maan kar mat chalo.</p></div>

<div class="iv"><p class="q">"Network ko LDP se SR par kam se kam risk ke saath kaise le jaoge?"</p><p>SR ko LDP ke saath chalao, har jagah labels verify karo, preference badlo, chhote steps mein LDP hatao har baar end-to-end checks ke saath, aur rollback rakho. LDP jaane ke baad bonus ke roop mein TI-LFA batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar families: missing SR, conflicts, IS-IS detail, protection nahi.</li>
<li>TI-LFA chhota repair stack taiyaar rakhta hai, aksar adjacency SID ke saath.</li>
<li>Steps mein migrate karo aur har ke baad VPN verify karo.</li>
<li>Protection ko drill se prove karo.</li>
</ul></div>
`}};export{e as default};