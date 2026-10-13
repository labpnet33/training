var e={id:`merge-conflicts`,h:{en:`Merge conflicts: reading the markers and resolving them`,hi:`Merge conflicts: markers padhna aur resolve karna`},body:{en:`

<p><b>One idea in this chapter:</b> a conflict is not an error, it is Git asking a human to decide. Git can combine changes to different lines on its own. When two branches changed the <i>same</i> line in different ways, it stops and says "you choose".</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Both branches changed the same line, so Git cannot choose. A person decides, then a merge commit joins the two lines."><line x1="40" y1="40" x2="600" y2="40" stroke="#64748b" stroke-width="2"/><path d="M150 40 Q175 105 215 105 L380 105" fill="none" stroke="#64748b" stroke-width="2"/><circle cx="110" cy="40" r="13" fill="#bae6fd"/><circle cx="250" cy="40" r="13" fill="#fecaca"/><circle cx="330" cy="105" r="13" fill="#fecaca"/><circle cx="500" cy="40" r="13" fill="#ddd6fe"/><path d="M343 98 Q440 85 490 52" fill="none" stroke="#64748b" stroke-width="2"/><path d="M263 40 L487 40" stroke="#64748b" stroke-width="2"/><text x="30" y="25" class="svg-ink" font-size="13">main</text><text x="250" y="68" text-anchor="middle" class="svg-muted" font-size="11">syslog .6</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="11">noc-syslog: .5</text><text x="500" y="22" text-anchor="middle" class="svg-accent" font-size="12">merge commit</text></svg><p class="cap">Both branches changed the same line, so Git cannot choose. A person decides, then a merge commit joins the two lines.</p></div>

<h3>How a conflict happens</h3>
<p>Two engineers at Deccan Net changed the same line of <code>syslog.cfg</code>. On <code>main</code>, someone moved logging to the backup collector, 10.1.1.6. On the branch <code>noc-syslog</code>, the NOC moved it to its new collector, 10.20.0.5. Both started from the same old line (10.1.1.5). Now you try to merge the branch into main:</p>
<pre class="code">git checkout main
git merge noc-syslog</pre>
<pre class="out">Auto-merging syslog.cfg
<span class="hl">CONFLICT (content): Merge conflict in syslog.cfg</span>
Automatic merge failed; fix conflicts and then commit the result.</pre>
<p>The merge is paused halfway. <code>git status</code> reminds you where you are:</p>
<pre class="out">On branch main
<span class="hl">You have unmerged paths.</span>
  (fix conflicts and run "git commit")

Changes not staged for commit:
	modified:   syslog.cfg</pre>

<h3>Reading the conflict markers</h3>
<p>Git writes both versions into the file with three kinds of marker lines. Open the file:</p>
<pre class="code">cat syslog.cfg</pre>
<pre class="out">! syslog settings for DN-EDGE1
logging trap informational
<span class="hl">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>
logging host 10.1.1.6
<span class="hl">=======</span>
logging host 10.20.0.5
<span class="hl">&gt;&gt;&gt;&gt;&gt;&gt;&gt; noc-syslog</span></pre>
<table class="cmp"><tr><th>Marker</th><th>Meaning</th></tr><tr><td>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</td><td>Start. Lines below are "ours": the branch you are on (main).</td></tr><tr><td>=======</td><td>Divider between the two versions.</td></tr><tr><td>&gt;&gt;&gt;&gt;&gt;&gt;&gt; noc-syslog</td><td>End. Lines above it are "theirs": the branch you are merging in.</td></tr></table>
<p>Only the lines between the markers are in dispute. Everything else in the file merged cleanly. Your job: make the file look exactly the way it should, with <b>no marker lines left</b>.</p>

<h3>Resolving: three ways</h3>
<p><b>1. Pick one side.</b> The NOC collector 10.20.0.5 is correct, and it is "theirs". In the simulator and in real Git you can take that side of the file with:</p>
<pre class="code">git checkout --theirs syslog.cfg
cat syslog.cfg</pre>
<pre class="out">Updated 1 path from the index
! syslog settings for DN-EDGE1
logging trap informational
logging host 10.20.0.5</pre>
<p>The markers are gone and the file has one logging host line. (<code>git checkout --ours syslog.cfg</code> would keep the main version instead.) Use this shortcut only when one whole side is right.</p>
<p><b>2. Edit by hand.</b> Open the file in an editor, delete the three marker lines and keep or combine the lines you want. For example, if both collectors should receive logs, the final file keeps two <code>logging host</code> lines. This is the right method whenever the correct answer is a mix. The simulator host has a line-editing command, but a real editor such as nano or vim, or your IDE, is easier; the result is the same.</p>
<p><b>3. Give up.</b> <code>git merge --abort</code> returns you to exactly where you were before the merge started, with nothing changed. It is a safe way out when you are unsure. Real Git supports this; the simulator also accepts it.</p>

<h3>Finishing the merge</h3>
<p>Telling Git "this file is resolved" is done with <code>git add</code>. Then <code>git commit</code> creates the merge commit.</p>
<pre class="code">git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git status</pre>
<pre class="out">[main 49ec2a9] Merge noc-syslog: use NOC collector
 1 file changed

On branch main
nothing to commit, working tree clean</pre>
<p>The merge commit has two parents, one from each line of work. Before you commit, always <code>cat</code> the file (or run <code>git diff</code>) and check that no <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> or <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> remains. A committed marker inside a router configuration would be pasted straight into a device by automation, so this check matters.</p>

<h3>Avoiding conflicts</h3>
<ul><li>Keep branches short and merge often.</li><li>Tell the team who is editing which file.</li><li>Keep one setting per line and one device per file; conflicts happen only when two people touch the same lines.</li><li>Take the latest main into your branch before you finish, so you meet the conflict early, on your own branch.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 2, task 3. You merge noc-syslog into main and Git reports a conflict in syslog.cfg. The ticket says the NOC collector 10.20.0.5 is right. You run git checkout --theirs syslog.cfg, then git add syslog.cfg, then git commit -m "Merge noc-syslog: use NOC collector". The check passes: the file contains 10.20.0.5, no marker lines, and the merge commit has two parents.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Committing a file that still contains the marker lines. Using --ours or --theirs on a file that needed both versions. Forgetting that ours and theirs flip meaning in some other commands; in a merge, ours is the branch you stand on. Running git commit before git add: Git still sees the file as unresolved.</p></div>
<div class="exam"><p><b>Exam trap.</b> HEAD in the markers is your current branch, and the section after the divider is the branch being merged. A conflict only occurs when both sides changed the same lines; different lines in the same file merge automatically.</p></div>

<div class="scn"><h4>Two collectors, one line</h4><p>A bank branch had two syslog collectors being introduced in the same week by two teams. Both edited the same line in the logging config on separate branches. The first merge went through; the second stopped with a conflict. The engineer did not pick a side. She asked both teams, learned that both collectors were needed, and kept two logging host lines in the final file. Reviewing the merge commit later, the auditors could see exactly who had decided what.</p><p><b>Lesson:</b> a conflict is a conversation prompt: ask the people before you choose.</p></div>
<div class="iv"><p class="q">"What is a merge conflict and how do you resolve one?"</p><p>A conflict happens when two branches changed the same lines differently, so Git cannot decide. Git marks the file with markers: HEAD shows your side, the part after the divider shows the incoming side. I decide the correct content, remove all markers, run git add on the file, then git commit to create the merge commit. If unsure I use git merge --abort to go back. I always re-read the file to confirm no markers remain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>A conflict means two sides changed the same lines; Git asks a human to choose.</li><li>In the markers, HEAD is your current branch and the other part is the branch being merged.</li><li>Resolve by choosing a side (--ours / --theirs), by editing by hand, or give up with git merge --abort.</li><li>After resolving: git add the file, then git commit to create the merge commit.</li><li>Always check that no marker lines are left before committing.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> conflict error nahi hai, Git ka insaan se decide karwana hai. Git alag-alag lines ke changes khud jod sakta hai. Jab do branches ne <i>same</i> line ko alag tareeke se badla ho, wo ruk kar kehta hai "aap chuno".</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Dono branches ne same line badli, isliye Git choose nahi kar sakta. Insaan decide karta hai, phir merge commit dono lines ko jodta hai."><line x1="40" y1="40" x2="600" y2="40" stroke="#64748b" stroke-width="2"/><path d="M150 40 Q175 105 215 105 L380 105" fill="none" stroke="#64748b" stroke-width="2"/><circle cx="110" cy="40" r="13" fill="#bae6fd"/><circle cx="250" cy="40" r="13" fill="#fecaca"/><circle cx="330" cy="105" r="13" fill="#fecaca"/><circle cx="500" cy="40" r="13" fill="#ddd6fe"/><path d="M343 98 Q440 85 490 52" fill="none" stroke="#64748b" stroke-width="2"/><path d="M263 40 L487 40" stroke="#64748b" stroke-width="2"/><text x="30" y="25" class="svg-ink" font-size="13">main</text><text x="250" y="68" text-anchor="middle" class="svg-muted" font-size="11">syslog .6</text><text x="330" y="140" text-anchor="middle" class="svg-muted" font-size="11">noc-syslog: .5</text><text x="500" y="22" text-anchor="middle" class="svg-accent" font-size="12">merge commit</text></svg><p class="cap">Both branches changed the same line, so Git cannot choose. A person decides, then a merge commit joins the two lines.</p></div>

<h3>Conflict kaise hota hai</h3>
<p>Deccan Net ke do engineers ne <code>syslog.cfg</code> ki same line badli. <code>main</code> par kisi ne logging backup collector 10.1.1.6 par kar di. Branch <code>noc-syslog</code> par NOC ne use apne naye collector 10.20.0.5 par kar diya. Dono ek hi purani line (10.1.1.5) se shuru hue the. Ab aap branch ko main mein merge karte ho:</p>
<pre class="code">git checkout main
git merge noc-syslog</pre>
<pre class="out">Auto-merging syslog.cfg
<span class="hl">CONFLICT (content): Merge conflict in syslog.cfg</span>
Automatic merge failed; fix conflicts and then commit the result.</pre>
<p>Merge beech mein ruk gaya hai. <code>git status</code> yaad dilata hai ki aap kahan ho:</p>
<pre class="out">On branch main
<span class="hl">You have unmerged paths.</span>
  (fix conflicts and run "git commit")

Changes not staged for commit:
	modified:   syslog.cfg</pre>

<h3>Conflict markers padhna</h3>
<p>Git dono versions file mein teen tarah ki marker lines ke saath likhta hai. File kholo:</p>
<pre class="code">cat syslog.cfg</pre>
<pre class="out">! syslog settings for DN-EDGE1
logging trap informational
<span class="hl">&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</span>
logging host 10.1.1.6
<span class="hl">=======</span>
logging host 10.20.0.5
<span class="hl">&gt;&gt;&gt;&gt;&gt;&gt;&gt; noc-syslog</span></pre>
<table class="cmp"><tr><th>Marker</th><th>Matlab</th></tr><tr><td>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</td><td>Shuruaat. Neeche ki lines "ours" hain: jis branch par aap ho (main).</td></tr><tr><td>=======</td><td>Dono versions ke beech ka divider.</td></tr><tr><td>&gt;&gt;&gt;&gt;&gt;&gt;&gt; noc-syslog</td><td>End. Iske upar ki lines "theirs" hain: jo branch aap merge kar rahe ho.</td></tr></table>
<p>Sirf markers ke beech ki lines par vivad hai. File ka baaki sab saaf merge ho gaya. Aapka kaam: file ko bilkul waisa banao jaisa honi chahiye, <b>ek bhi marker line bacha kar nahi</b>.</p>

<h3>Resolve karna: teen tareeke</h3>
<p><b>1. Ek side chuno.</b> NOC collector 10.20.0.5 sahi hai, aur woh "theirs" hai. Simulator aur asli Git dono mein aap file ka woh side is tarah le sakte ho:</p>
<pre class="code">git checkout --theirs syslog.cfg
cat syslog.cfg</pre>
<pre class="out">Updated 1 path from the index
! syslog settings for DN-EDGE1
logging trap informational
logging host 10.20.0.5</pre>
<p>Markers chale gaye aur file mein ek logging host line hai. (<code>git checkout --ours syslog.cfg</code> main wala version rakhta.) Yeh shortcut tabhi use karo jab poori ek side sahi ho.</p>
<p><b>2. Haath se edit karo.</b> File ko editor mein kholo, teen marker lines delete karo aur jo lines chahiye unhe rakho ya mila do. Maslan agar dono collectors ko logs chahiye, to final file mein do <code>logging host</code> lines rehti hain. Jab sahi jawab dono ka mix ho, tab yahi tareeka sahi hai. Simulator host mein line-editing command hai, par asli editor jaise nano, vim ya aapka IDE aasan hai; result same hota hai.</p>
<p><b>3. Chhod do.</b> <code>git merge --abort</code> aapko bilkul wahan wapas le jaata hai jahan merge shuru hone se pehle the, kuch badle bina. Jab confident nahi ho tab yeh safe nikaasi hai. Asli Git ise support karta hai; simulator bhi ise accept karta hai.</p>

<h3>Merge poora karna</h3>
<p>Git ko "yeh file resolve ho gayi" batane ka tareeka <code>git add</code> hai. Phir <code>git commit</code> merge commit banata hai.</p>
<pre class="code">git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git status</pre>
<pre class="out">[main 49ec2a9] Merge noc-syslog: use NOC collector
 1 file changed

On branch main
nothing to commit, working tree clean</pre>
<p>Merge commit ke do parents hote hain, har line of work ka ek. Commit se pehle hamesha file par <code>cat</code> (ya <code>git diff</code>) chalao aur check karo ki koi <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> ya <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> nahi bacha. Router configuration ke andar commit hua marker automation seedha device par paste kar deta, isliye yeh check zaroori hai.</p>

<h3>Conflicts se bachna</h3>
<ul><li>Branches chhoti rakho aur baar-baar merge karo.</li><li>Team ko batao kaun si file kaun edit kar raha hai.</li><li>Ek line mein ek setting aur ek file mein ek device rakho; conflict tabhi hota hai jab do log same lines chhoote hain.</li><li>Apni branch khatam karne se pehle latest main apni branch mein lo, taaki conflict jaldi aur apni branch par mile.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 2, task 3. Aap noc-syslog ko main mein merge karte ho aur Git syslog.cfg mein conflict batata hai. Ticket kehta hai NOC collector 10.20.0.5 sahi hai. Aap git checkout --theirs syslog.cfg chalate ho, phir git add syslog.cfg, phir git commit -m "Merge noc-syslog: use NOC collector". Check pass hota hai: file mein 10.20.0.5 hai, marker lines nahi hain, aur merge commit ke do parents hain.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Marker lines wali file commit kar dena. Jis file ko dono versions chahiye the usme --ours ya --theirs use karna. Yeh bhoolna ki ours aur theirs ka matlab kuch doosre commands mein ulta ho jaata hai; merge mein ours woh branch hai jis par aap khade ho. git add se pehle git commit chalana: Git file ko abhi bhi unresolved dekhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Markers mein HEAD aapki current branch hai, aur divider ke baad ka hissa merge hone wali branch hai. Conflict tabhi hota hai jab dono sides ne same lines badli hon; same file ki alag lines automatically merge ho jaati hain.</p></div>

<div class="scn"><h4>Do collectors, ek line</h4><p>Ek bank branch mein ek hi hafte mein do teams do syslog collectors laa rahi thin. Dono ne alag branches par logging config ki same line edit ki. Pehla merge nikal gaya; doosra conflict ke saath ruk gaya. Engineer ne ek side nahi chuni. Usne dono teams se poochha, pata chala ki dono collectors chahiye, aur final file mein do logging host lines rakhi. Baad mein merge commit dekhkar auditors ko saaf dikha ki kisne kya decide kiya.</p><p><b>Lesson:</b> conflict baatcheet ka signal hai: chunne se pehle logon se pucho.</p></div>
<div class="iv"><p class="q">"Merge conflict kya hai aur use kaise resolve karte ho?"</p><p>Conflict tab hota hai jab do branches ne same lines ko alag tarah badla, isliye Git decide nahi kar sakta. Git file mein markers lagata hai: HEAD aapki side dikhata hai, divider ke baad ka hissa incoming side. Main sahi content decide karta hoon, saare markers hata deta hoon, file par git add chalata hoon, phir git commit se merge commit banata hoon. Agar unsure hoon to git merge --abort se wapas jaata hoon. Confirm karne ke liye file dobara padhta hoon ki koi marker nahi bacha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Conflict ka matlab do sides ne same lines badli; Git insaan se choose karwata hai.</li><li>Markers mein HEAD aapki current branch hai aur doosra hissa merge ho rahi branch hai.</li><li>Resolve karo side chunkar (--ours / --theirs), haath se edit karke, ya git merge --abort se chhodkar.</li><li>Resolve ke baad: file par git add, phir merge commit ke liye git commit.</li><li>Commit se pehle hamesha check karo ki koi marker line na bachi ho.</li></ul></div>

`}};export{e as default};