var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: the tree that grew the wrong way (Lab 2)`,hi:`Troubleshooting workflow: galat taraf ugga tree (Lab 2)`},body:{en:`
<p>Spanning tree faults rarely look like faults. Nothing is down; traffic simply takes a longer road, or one day a link carries nothing. A doctor calls these "silent symptoms". The cure is a repeatable method: find the root, check the roles, compare with the design, and ask what changed. This chapter walks through Lab 2, the Kochi warehouse ticket, with real output from the simulator.</p>

<h3>The ticket and the design</h3>
<p><i>"The design says DIST1 (priority 4k) is the root, DIST2 (8k) the backup, and ACC1 reaches the root directly over ge-0/0/0. Since last night all ACC1 traffic takes the long way round. Someone 'tested' STP settings and forgot to remove them."</i></p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Kochi topology">
<rect x="60" y="20" width="170" height="54" rx="10" fill="#fde68a"/><text x="145" y="43" text-anchor="middle" class="svg-ink" font-size="13">DIST1</text><text x="145" y="62" text-anchor="middle" class="svg-muted" font-size="11">design: 4k, root</text>
<rect x="410" y="20" width="170" height="54" rx="10" fill="#bae6fd"/><text x="495" y="43" text-anchor="middle" class="svg-ink" font-size="13">DIST2</text><text x="495" y="62" text-anchor="middle" class="svg-muted" font-size="11">design: 8k, backup</text>
<rect x="235" y="150" width="170" height="54" rx="10" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">PC1 on ge-0/0/2</text>
<line x1="230" y1="47" x2="410" y2="47" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="74" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="470" y1="74" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="125" class="svg-muted" font-size="12">ge-0/0/0</text><text x="400" y="125" class="svg-muted" font-size="12">ge-0/0/1</text>
</svg><p class="cap">Lab 2: the intended root is DIST1, and ACC1 should use ge-0/0/0 towards it.</p></div>

<h3>Step 1: who is the root?</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree bridge
  Root ID                           : <span class="hl">0</span>.52:54:2c:97:9e:00
  Root cost                         : 20000
  Root port                         : <span class="hl">ge-0/0/1</span>
  Local parameters
    Bridge ID                       : 32768.52:54:6b:02:03:00</pre>
<p>The Root ID starts with priority <b>0</b>, which is better than the 4k design value. Root port is ge-0/0/1, towards DIST2. So DIST2 is the root, not DIST1. Answer to the lab question: <b>DIST2</b>.</p>

<h3>Step 2: read the roles</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.525429979a00   <span class="hl">200000</span>  BLK    ALT
ge-0/0/1                   128:2      128:2        0.52542c979e00    20000  FWD    ROOT
ge-0/0/2                   128:3      128:3    32768.52546b020300    20000  FWD    DESG</pre>
<p>Two different problems are visible. (1) The designated bridge on ge-0/0/1 has priority 0, so something raised DIST2 above the design. (2) The Port Cost of ge-0/0/0 is <b>200000</b> instead of 20000: a manual cost ten times higher than the automatic value for a 1 Gbit/s link. Even if DIST1 were the root, ACC1 would still prefer the other uplink for this reason.</p>

<h3>Step 3: ask what changed</h3>
<pre class="out">lab@DIST2&gt; show system commit
0   2026-10-01 21:43:07 UTC by root via other
    <span class="hl">stp test</span>
1   2026-10-01 21:43:07 UTC by root via other</pre>
<p>The commit comment "stp test" on DIST2 is the smoking gun. <code>show | compare rollback 1</code> in configuration mode would show the bridge-priority moving from 8k to 0. Always read commit comments: a good change record shortens a fault hunt from hours to minutes.</p>

<h3>Step 4: fix against the design</h3>
<pre class="code">DIST2&gt; configure
DIST2# set protocols rstp bridge-priority 8k
DIST2# commit and-quit

ACC1&gt; configure
ACC1# delete protocols rstp interface ge-0/0/0 cost
ACC1# commit and-quit</pre>
<p>Two faults, two switches, two commits. Notice that you did <i>not</i> touch DIST1: it already matched the design. Also note we used <code>delete</code> on the cost, to return to the automatic value, rather than inventing a new number.</p>

<h3>Step 5: verify</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.525429979a00    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.52542c979e00    20000  BLK    <span class="hl">ALT</span>
ge-0/0/2                   128:3      128:3    32768.52546b020300    20000  FWD    DESG

lab@DIST1&gt; show spanning-tree interface
ge-0/0/0                   128:1      128:1     4096.525429979a00    20000  FWD    DESG
ge-0/0/1                   128:2      128:2     4096.525429979a00    20000  FWD    DESG

PC1&gt; ping 10.5.50.1
84 bytes from 10.5.50.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>All DIST1 ports are designated, as on any root. ACC1's root port is ge-0/0/0 and the alternate is ge-0/0/1, exactly as designed, and PC1 reaches its gateway.</p>

<h3>The general workflow</h3>
<ol>
<li><b>Find the root</b> with <code>show spanning-tree bridge</code> on any switch. Is it the switch in the design?</li>
<li><b>Read the roles</b> with <code>show spanning-tree interface</code> on the affected switch. Which port is ROOT, which is ALT, what are the costs?</li>
<li><b>Look for manual settings</b>: <code>show configuration protocols rstp</code>, priorities, costs, edge ports.</li>
<li><b>Check history</b>: <code>show system commit</code>.</li>
<li><b>Count topology changes</b>: a steady increase means a flapping link or missing edge settings.</li>
<li><b>Fix against the design</b>, review with <code>show | compare</code>, then re-verify.</li>
</ol>

<div class="eg"><p><b>Worked example: a flapping root.</b> A Pune engineer noticed that the root bridge changed every few minutes. <code>show spanning-tree bridge</code> on three switches gave three different Root IDs. Two switches had priority 4k, set during a migration, and the one with the lower MAC won each time the other rebooted. Giving the primary 4k and the backup 8k ended the flapping.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the root but leaving a manual cost, so the path is still wrong. Restarting a switch to "refresh" STP: it triggers a topology change and fixes nothing. Disabling STP to test. Looking only at the access switch and never at the root.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question may show two <code>show spanning-tree interface</code> outputs and ask why a port is blocked: compare the Port Cost and the Designated bridge ID columns, and remember that priority 0 beats 4096.</p></div>

<div class="scn"><h4>The test that was never cleaned up</h4><p>A team ran a root failover test on Friday and left priority 0 on DIST2 with the comment "stp test". On Saturday a cable was moved and all warehouse traffic started to cross DIST2. The fix was two commits. The team added a rule: every test change is committed with <code>commit confirmed</code> so it rolls back by itself.</p><p><b>Lesson:</b> use <code>commit confirmed</code> for experiments, and always write a commit comment.</p></div>

<div class="iv"><p class="q">"Traffic takes a strange path after a change. How do you troubleshoot spanning tree?"</p><p>Identify the root with <code>show spanning-tree bridge</code> and compare it with the design, read the port roles and costs with <code>show spanning-tree interface</code>, look for manual priorities or costs, check <code>show system commit</code> for what changed, fix to match the design and re-verify. Mention that you check the topology change counter for flapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Find the root first, then the port roles, then manual overrides, then the commit history.</li>
<li>Priority 0 beats 4k; a manual cost can silently steer the tree.</li>
<li>Fix against the design and touch only the switches that are wrong.</li>
<li>Use <code>delete</code> to restore automatic cost; use <code>commit confirmed</code> for tests.</li>
</ul></div>
`,hi:`
<p>Spanning tree ke faults kabhi fault jaise nahi dikhte. Kuch down nahi hota; traffic bas lambe raaste se jaata hai, ya ek din koi link kuch carry nahi karta. Doctor ise "silent symptoms" kehti hai. Ilaaj ek dohraya ja sakne wala method hai: root dhoondho, roles check karo, design se compare karo, aur poocho kya badla. Yeh chapter Lab 2, Kochi warehouse ticket, ko simulator ke real output ke saath chalata hai.</p>

<h3>Ticket aur design</h3>
<p><i>"Design kehta hai DIST1 (priority 4k) root hai, DIST2 (8k) backup, aur ACC1 seedha ge-0/0/0 se root tak pahunchta hai. Kal raat se ACC1 ka saara traffic lamba raasta le raha hai. Kisi ne STP settings 'test' kin aur hatana bhool gaya."</i></p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Kochi topology">
<rect x="60" y="20" width="170" height="54" rx="10" fill="#fde68a"/><text x="145" y="43" text-anchor="middle" class="svg-ink" font-size="13">DIST1</text><text x="145" y="62" text-anchor="middle" class="svg-muted" font-size="11">design: 4k, root</text>
<rect x="410" y="20" width="170" height="54" rx="10" fill="#bae6fd"/><text x="495" y="43" text-anchor="middle" class="svg-ink" font-size="13">DIST2</text><text x="495" y="62" text-anchor="middle" class="svg-muted" font-size="11">design: 8k, backup</text>
<rect x="235" y="150" width="170" height="54" rx="10" fill="#bbf7d0"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">ACC1</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="11">ge-0/0/2 par PC1</text>
<line x1="230" y1="47" x2="410" y2="47" stroke="#64748b" stroke-width="2"/>
<line x1="170" y1="74" x2="290" y2="150" stroke="#64748b" stroke-width="2"/><line x1="470" y1="74" x2="350" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="180" y="125" class="svg-muted" font-size="12">ge-0/0/0</text><text x="400" y="125" class="svg-muted" font-size="12">ge-0/0/1</text>
</svg><p class="cap">Lab 2: intended root DIST1 hai, aur ACC1 ko uski taraf ge-0/0/0 use karna chahiye.</p></div>

<h3>Step 1: root kaun hai?</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree bridge
  Root ID                           : <span class="hl">0</span>.52:54:2c:97:9e:00
  Root cost                         : 20000
  Root port                         : <span class="hl">ge-0/0/1</span>
  Local parameters
    Bridge ID                       : 32768.52:54:6b:02:03:00</pre>
<p>Root ID priority <b>0</b> se shuru hota hai, jo design ke 4k se behtar hai. Root port ge-0/0/1 hai, DIST2 ki taraf. Yaani root DIST2 hai, DIST1 nahi. Lab sawaal ka jawab: <b>DIST2</b>.</p>

<h3>Step 2: roles padho</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.525429979a00   <span class="hl">200000</span>  BLK    ALT
ge-0/0/1                   128:2      128:2        0.52542c979e00    20000  FWD    ROOT
ge-0/0/2                   128:3      128:3    32768.52546b020300    20000  FWD    DESG</pre>
<p>Do alag problems dikhti hain. (1) ge-0/0/1 par designated bridge ki priority 0 hai, yaani kisi ne DIST2 ko design se upar kar diya. (2) ge-0/0/0 ka Port Cost 20000 ki jagah <b>200000</b> hai: 1 Gbit/s link ke automatic value se das guna manual cost. DIST1 root hota tab bhi ACC1 isi wajah se doosra uplink prefer karta.</p>

<h3>Step 3: poocho kya badla</h3>
<pre class="out">lab@DIST2&gt; show system commit
0   2026-10-01 21:43:07 UTC by root via other
    <span class="hl">stp test</span>
1   2026-10-01 21:43:07 UTC by root via other</pre>
<p>DIST2 par commit comment "stp test" saboot hai. Configuration mode mein <code>show | compare rollback 1</code> bridge-priority ko 8k se 0 hota dikhata. Commit comments hamesha padho: achha change record fault hunt ko ghanton se minutes mein laa deta hai.</p>

<h3>Step 4: design ke hisaab se fix karo</h3>
<pre class="code">DIST2&gt; configure
DIST2# set protocols rstp bridge-priority 8k
DIST2# commit and-quit

ACC1&gt; configure
ACC1# delete protocols rstp interface ge-0/0/0 cost
ACC1# commit and-quit</pre>
<p>Do faults, do switches, do commits. Dhyan do ki aapne DIST1 ko <i>nahi</i> chhua: woh pehle se design se match karta tha. Yeh bhi dekho ki cost par <code>delete</code> use kiya, taaki automatic value wapas aaye, naya number gadhne ki jagah.</p>

<h3>Step 5: verify karo</h3>
<pre class="out">lab@ACC1&gt; show spanning-tree interface
Interface                  Port ID    Designated         Designated         Port    State  Role
ge-0/0/0                   128:1      128:2     4096.525429979a00    20000  FWD    <span class="hl">ROOT</span>
ge-0/0/1                   128:2      128:2     8192.52542c979e00    20000  BLK    <span class="hl">ALT</span>
ge-0/0/2                   128:3      128:3    32768.52546b020300    20000  FWD    DESG

lab@DIST1&gt; show spanning-tree interface
ge-0/0/0                   128:1      128:1     4096.525429979a00    20000  FWD    DESG
ge-0/0/1                   128:2      128:2     4096.525429979a00    20000  FWD    DESG

PC1&gt; ping 10.5.50.1
84 bytes from 10.5.50.1 icmp_seq=1 ttl=64 time=0.500 ms</pre>
<p>DIST1 ke saare ports designated hain, jaise kisi bhi root par. ACC1 ka root port ge-0/0/0 hai aur alternate ge-0/0/1, bilkul design jaisa, aur PC1 apne gateway tak pahunchta hai.</p>

<h3>General workflow</h3>
<ol>
<li><b>Root dhoondho</b>: kisi bhi switch par <code>show spanning-tree bridge</code>. Kya woh design wala switch hai?</li>
<li><b>Roles padho</b>: affected switch par <code>show spanning-tree interface</code>. Kaunsa port ROOT hai, kaunsa ALT, costs kya hain?</li>
<li><b>Manual settings dhoondho</b>: <code>show configuration protocols rstp</code>, priorities, costs, edge ports.</li>
<li><b>History dekho</b>: <code>show system commit</code>.</li>
<li><b>Topology changes gino</b>: lagatar badhna matlab flapping link ya missing edge settings.</li>
<li><b>Design ke hisaab se fix karo</b>, <code>show | compare</code> se review karo, phir dobara verify karo.</li>
</ol>

<div class="eg"><p><b>Worked example: flapping root.</b> Pune ke engineer ne dekha ki root bridge har kuch minute mein badal raha hai. Teen switches par <code>show spanning-tree bridge</code> ne teen alag Root IDs diye. Do switches par migration ke dauran priority 4k set hui thi, aur doosra reboot hone par chhote MAC wala har baar jeet jaata. Primary ko 4k aur backup ko 8k dene se flapping ruk gayi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Root theek karna lekin manual cost chhod dena, jisse path abhi bhi galat rehta hai. STP "refresh" karne ke liye switch restart karna: woh topology change trigger karta hai aur kuch theek nahi karta. Test ke liye STP disable karna. Sirf access switch dekhna aur root ko kabhi na dekhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question do <code>show spanning-tree interface</code> outputs dikhakar pooch sakta hai ki port blocked kyun hai: Port Cost aur Designated bridge ID columns compare karo, aur yaad rakho ki priority 0, 4096 ko harati hai.</p></div>

<div class="scn"><h4>Test jo kabhi saaf nahi hua</h4><p>Ek team ne Friday ko root failover test kiya aur DIST2 par priority 0 comment "stp test" ke saath chhod di. Saturday ko ek cable shift hui aur warehouse ka saara traffic DIST2 se guzarne laga. Fix do commits ka tha. Team ne niyam banaya: har test change <code>commit confirmed</code> se ho taaki khud rollback ho jaaye.</p><p><b>Lesson:</b> experiments ke liye <code>commit confirmed</code> use karo, aur hamesha commit comment likho.</p></div>

<div class="iv"><p class="q">"Change ke baad traffic ajeeb raaste se ja raha hai. Spanning tree kaise troubleshoot karoge?"</p><p><code>show spanning-tree bridge</code> se root pehchano aur design se compare karo, <code>show spanning-tree interface</code> se port roles aur costs padho, manual priorities ya costs dhoondho, <code>show system commit</code> se dekho kya badla, design ke hisaab se fix karo aur dobara verify karo. Batao ki flapping ke liye topology change counter check karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle root, phir port roles, phir manual overrides, phir commit history dhoondho.</li>
<li>Priority 0, 4k ko harati hai; manual cost chupchaap tree ko steer kar sakta hai.</li>
<li>Design ke hisaab se fix karo aur sirf galat switches ko chhuo.</li>
<li>Automatic cost wapas laane ke liye <code>delete</code>; tests ke liye <code>commit confirmed</code> use karo.</li>
</ul></div>
`}};export{e as default};