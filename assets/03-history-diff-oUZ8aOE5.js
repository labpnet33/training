var e={id:`history-diff`,h:{en:`Reading history: log, show and diff`,hi:`History padhna: log, show aur diff`},body:{en:`

<p><b>One idea in this chapter:</b> history is only useful if you can read it. Three commands answer almost every question: <code>git log</code> (what happened), <code>git show</code> (what did this one commit change) and <code>git diff</code> (what is different right now).</p>

<h3>git log: the list of commits</h3>
<p>The Deccan Net team keeps its edge-router configuration in a repository. Start at the top of the history:</p>
<pre class="code">git log --oneline</pre>
<pre class="out">faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs</pre>
<p><code>--oneline</code> prints one line per commit: the short hash, then the message. The newest commit is on top. The words in brackets are <b>labels</b>: <code>HEAD</code> is "where you are now", and <code>main</code> is the branch name. So <code>(HEAD -&gt; main)</code> reads "you are standing on the newest commit of main".</p>
<p>Without <code>--oneline</code>, <code>git log</code> shows the full hash, the author and the message of each commit. To see only the latest few, add a number: <code>git log --oneline -n 2</code> shows two.</p>
<p>Notice what the four messages tell you before you open a single file: someone tightened the management ACL, then added a banner, then moved the syslog collector. If the NOC lost access on Friday, <code>Tighten mgmt ACL</code> is your first suspect.</p>

<h3>git show: one commit in detail</h3>
<p>You can name a commit by its hash, or relative to <code>HEAD</code>. <code>HEAD~1</code> means "one commit before HEAD" and <code>HEAD~2</code> means two before. In the log above, <code>HEAD~2</code> is the "Tighten mgmt ACL" commit.</p>
<pre class="code">git show HEAD~2</pre>
<pre class="out">commit 89822dc75bee3d
Author: netops &lt;netops@nk.lab&gt;

    Tighten mgmt ACL

diff --git a/edge.cfg b/edge.cfg
--- a/edge.cfg
+++ b/edge.cfg
@@ -1,11 +1,11 @@
 hostname DN-EDGE1
 !
 ntp server 10.1.1.1
 !
 access-list 10 remark NOC management hosts
<span class="hl">-access-list 10 permit 10.99.0.0 0.0.0.255</span>
<span class="hl">+access-list 10 permit 10.99.9.0 0.0.0.255</span>
 !
 line vty 0 4
  access-class 10 in
 !</pre>
<p>How to read a <b>diff</b> (a list of differences):</p>
<ul><li>A line starting with <code>-</code> was <b>removed</b>.</li><li>A line starting with <code>+</code> was <b>added</b>.</li><li>A line starting with a space is unchanged context, shown so you can see where the change sits.</li><li><code>@@ -1,11 +1,11 @@</code> says which lines of the old and new file the block covers.</li></ul>
<p>Here the permit line changed from <code>10.99.0.0</code> to <code>10.99.9.0</code>. The NOC management hosts live in 10.99.0.0/24, so the ACL now blocks them. One command found the cause. (The simulator prints a short form of the real Git headers; real Git adds index lines, which you can ignore.)</p>

<h3>git diff: what is different right now</h3>
<p>Before you commit, always look at what you are about to save.</p>
<table class="cmp"><tr><th>Command</th><th>Compares</th><th>Use it when</th></tr><tr><td>git diff</td><td>working tree against the staging area</td><td>you edited a file and want to review it</td></tr><tr><td>git diff --staged</td><td>staging area against the last commit</td><td>you ran git add and want to review what will be committed</td></tr><tr><td>git diff HEAD~1</td><td>working tree against the commit before HEAD</td><td>you want everything changed since the previous commit</td></tr></table>
<pre class="code">sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r1.cfg
git diff</pre>
<pre class="out">diff --git a/r1.cfg b/r1.cfg
--- a/r1.cfg
+++ b/r1.cfg
@@ -1,10 +1,10 @@
 hostname KF-R1
 !
<span class="hl">-ntp server 10.1.1.1</span>
<span class="hl">+ntp server 10.1.1.10</span>
 logging host 10.1.1.5
 !</pre>
<p>The <code>sed</code> command is a find-and-replace tool: it changed <code>10.1.1.1</code> to <code>10.1.1.10</code> inside r1.cfg. The diff proves that exactly one line changed. If the diff shows twenty changed lines, you changed more than you meant to, and that is the moment to stop and fix it.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="History is a chain of commits. HEAD is the newest; HEAD~1 and HEAD~2 count backwards."><line x1="40" y1="60" x2="600" y2="60" stroke="#64748b" stroke-width="2"/><circle cx="90" cy="60" r="14" fill="#bae6fd"/><circle cx="230" cy="60" r="14" fill="#bae6fd"/><circle cx="370" cy="60" r="14" fill="#bae6fd"/><circle cx="510" cy="60" r="14" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-muted" font-size="12">661a103</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="12">89822dc</text><text x="370" y="95" text-anchor="middle" class="svg-muted" font-size="12">e349603</text><text x="510" y="95" text-anchor="middle" class="svg-muted" font-size="12">faf4702</text><text x="90" y="30" text-anchor="middle" class="svg-ink" font-size="12">Initial import</text><text x="230" y="30" text-anchor="middle" class="svg-ink" font-size="12">Tighten ACL</text><text x="370" y="30" text-anchor="middle" class="svg-ink" font-size="12">Add banner</text><text x="510" y="30" text-anchor="middle" class="svg-ink" font-size="12">Backup syslog</text><text x="510" y="125" text-anchor="middle" class="svg-accent" font-size="12">HEAD (main)</text><text x="370" y="125" text-anchor="middle" class="svg-muted" font-size="12">HEAD~1</text><text x="230" y="125" text-anchor="middle" class="svg-muted" font-size="12">HEAD~2</text></svg><p class="cap">History is a chain of commits. HEAD is the newest; HEAD~1 and HEAD~2 count backwards.</p></div>

<div class="eg"><p><b>Worked example.</b> You are asked: "Who tightened the ACL and what exactly did they change?" You run git log --oneline, spot Tighten mgmt ACL, run git show HEAD~2 and read one removed line and one added line. Total time: under a minute. The same question in a folder of files named edge-final-v2.cfg could take an afternoon.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Running git diff after git add and seeing nothing: the change is already staged, so use git diff --staged. Reading a diff backwards: minus is the old value, plus is the new value. Counting HEAD~1 from the wrong place: HEAD~0 is the newest commit itself.</p></div>
<div class="exam"><p><b>Exam trap.</b> git diff with no options does not show staged changes. The exam also expects you to know that a commit hash is a unique ID and that HEAD points at the commit you currently have checked out.</p></div>

<div class="scn"><h4>The ACL that blocked its own owners</h4><p>After a Friday change the NOC could not SSH to DN-EDGE1. The on-call engineer did not touch the router first. She opened the repository, ran git log --oneline and git show on the suspicious commit, and saw the permit line had moved from the 10.99.0.0 range to 10.99.9.0. She now knew the cause, the author and the time before logging in to anything, which also meant the fix could be prepared and reviewed instead of typed in a panic.</p><p><b>Lesson:</b> read the history first; the repository is the fastest incident timeline you have.</p></div>
<div class="iv"><p class="q">"How do you find out what a specific past change did?"</p><p>Use git log --oneline to find the commit, then git show with its hash or a relative name such as HEAD~2 to see the message, the author and the diff. Explain that minus lines were removed and plus lines were added. Mention git diff and git diff --staged for reviewing your own work before you commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git log --oneline lists commits newest first; labels such as HEAD and main show where you are.</li><li>git show names one commit and prints its message and its diff.</li><li>In a diff, minus lines are removed, plus lines are added.</li><li>git diff compares the working tree with the staging area; git diff --staged compares staging with the last commit.</li><li>HEAD~1 and HEAD~2 count commits backwards from the one you are on.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> history tabhi kaam ki hai jab aap use padh sako. Teen commands lagbhag har sawaal ka jawab dete hain: <code>git log</code> (kya hua), <code>git show</code> (is ek commit ne kya badla) aur <code>git diff</code> (abhi kya alag hai).</p>

<h3>git log: commits ki list</h3>
<p>Deccan Net ki team apni edge-router configuration repository mein rakhti hai. History ke top se shuru karo:</p>
<pre class="code">git log --oneline</pre>
<pre class="out">faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs</pre>
<p><code>--oneline</code> har commit ke liye ek line print karta hai: chhota hash, phir message. Sabse naya commit upar hota hai. Bracket ke andar ke words <b>labels</b> hain: <code>HEAD</code> matlab "aap abhi yahan ho", aur <code>main</code> branch ka naam hai. To <code>(HEAD -&gt; main)</code> ka matlab "aap main ke sabse naye commit par khade ho".</p>
<p><code>--oneline</code> ke bina <code>git log</code> har commit ka poora hash, author aur message dikhata hai. Sirf last kuch dekhne ke liye number jodo: <code>git log --oneline -n 2</code> do dikhata hai.</p>
<p>Dekho ki ek bhi file kholne se pehle chaaron messages kya batate hain: kisi ne management ACL tight ki, phir banner joda, phir syslog collector badla. Agar Friday ko NOC ka access gaya, to <code>Tighten mgmt ACL</code> aapka pehla suspect hai.</p>

<h3>git show: ek commit detail mein</h3>
<p>Aap commit ko hash se bula sakte ho, ya <code>HEAD</code> ke relative. <code>HEAD~1</code> ka matlab "HEAD se ek commit pehle" aur <code>HEAD~2</code> do pehle. Upar ke log mein <code>HEAD~2</code> "Tighten mgmt ACL" wala commit hai.</p>
<pre class="code">git show HEAD~2</pre>
<pre class="out">commit 89822dc75bee3d
Author: netops &lt;netops@nk.lab&gt;

    Tighten mgmt ACL

diff --git a/edge.cfg b/edge.cfg
--- a/edge.cfg
+++ b/edge.cfg
@@ -1,11 +1,11 @@
 hostname DN-EDGE1
 !
 ntp server 10.1.1.1
 !
 access-list 10 remark NOC management hosts
<span class="hl">-access-list 10 permit 10.99.0.0 0.0.0.255</span>
<span class="hl">+access-list 10 permit 10.99.9.0 0.0.0.255</span>
 !
 line vty 0 4
  access-class 10 in
 !</pre>
<p><b>Diff</b> (farq ki list) kaise padhein:</p>
<ul><li><code>-</code> se shuru hone wali line <b>hataayi</b> gayi.</li><li><code>+</code> se shuru hone wali line <b>jodi</b> gayi.</li><li>Space se shuru hone wali line badli nahi, sirf context hai taaki dikhe change kahan baitha hai.</li><li><code>@@ -1,11 +1,11 @@</code> batata hai ki block purani aur nayi file ki kaun si lines cover karta hai.</li></ul>
<p>Yahan permit line <code>10.99.0.0</code> se <code>10.99.9.0</code> ho gayi. NOC management hosts 10.99.0.0/24 mein rehte hain, isliye ACL ab unhe block karti hai. Ek command ne wajah dhoondh di. (Simulator asli Git headers ka chhota form print karta hai; asli Git index lines bhi jodta hai, jinhe ignore kar sakte ho.)</p>

<h3>git diff: abhi kya alag hai</h3>
<p>Commit karne se pehle hamesha dekho ki aap kya save karne wale ho.</p>
<table class="cmp"><tr><th>Command</th><th>Kisse compare karta hai</th><th>Kab use karein</th></tr><tr><td>git diff</td><td>working tree ko staging area se</td><td>aapne file edit ki aur review karna hai</td></tr><tr><td>git diff --staged</td><td>staging area ko last commit se</td><td>git add chalaya aur dekhna hai ki kya commit hoga</td></tr><tr><td>git diff HEAD~1</td><td>working tree ko HEAD se pehle wale commit se</td><td>pichhle commit ke baad ka sab kuch dekhna hai</td></tr></table>
<pre class="code">sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r1.cfg
git diff</pre>
<pre class="out">diff --git a/r1.cfg b/r1.cfg
--- a/r1.cfg
+++ b/r1.cfg
@@ -1,10 +1,10 @@
 hostname KF-R1
 !
<span class="hl">-ntp server 10.1.1.1</span>
<span class="hl">+ntp server 10.1.1.10</span>
 logging host 10.1.1.5
 !</pre>
<p><code>sed</code> ek find-and-replace tool hai: usne r1.cfg ke andar <code>10.1.1.1</code> ko <code>10.1.1.10</code> kar diya. Diff saabit karta hai ki exactly ek line badli. Agar diff bees badli hui lines dikhaye, to aapne jitna socha tha usse zyada badla, aur yahi rukkar theek karne ka waqt hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="History commits ki chain hai. HEAD sabse naya hai; HEAD~1 aur HEAD~2 peeche ginte hain."><line x1="40" y1="60" x2="600" y2="60" stroke="#64748b" stroke-width="2"/><circle cx="90" cy="60" r="14" fill="#bae6fd"/><circle cx="230" cy="60" r="14" fill="#bae6fd"/><circle cx="370" cy="60" r="14" fill="#bae6fd"/><circle cx="510" cy="60" r="14" fill="#bbf7d0"/><text x="90" y="95" text-anchor="middle" class="svg-muted" font-size="12">661a103</text><text x="230" y="95" text-anchor="middle" class="svg-muted" font-size="12">89822dc</text><text x="370" y="95" text-anchor="middle" class="svg-muted" font-size="12">e349603</text><text x="510" y="95" text-anchor="middle" class="svg-muted" font-size="12">faf4702</text><text x="90" y="30" text-anchor="middle" class="svg-ink" font-size="12">Initial import</text><text x="230" y="30" text-anchor="middle" class="svg-ink" font-size="12">Tighten ACL</text><text x="370" y="30" text-anchor="middle" class="svg-ink" font-size="12">Add banner</text><text x="510" y="30" text-anchor="middle" class="svg-ink" font-size="12">Backup syslog</text><text x="510" y="125" text-anchor="middle" class="svg-accent" font-size="12">HEAD (main)</text><text x="370" y="125" text-anchor="middle" class="svg-muted" font-size="12">HEAD~1</text><text x="230" y="125" text-anchor="middle" class="svg-muted" font-size="12">HEAD~2</text></svg><p class="cap">History commits ki chain hai. HEAD sabse naya hai; HEAD~1 aur HEAD~2 peeche ginte hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Aapse poocha gaya: "ACL kisne tight ki aur exactly kya badla?" Aap git log --oneline chalate ho, Tighten mgmt ACL dhoondte ho, git show HEAD~2 chalate ho aur ek hataayi hui aur ek jodi hui line padhte ho. Total time: ek minute se kam. Wahi sawaal edge-final-v2.cfg jaise naam wali files ke folder mein poora din le sakta tha.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> git add ke baad git diff chalana aur kuch na dikhna: change pehle se staged hai, to git diff --staged use karo. Diff ko ulta padhna: minus purani value hai, plus nayi value. HEAD~1 ko galat jagah se ginna: HEAD~0 sabse naya commit khud hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina options ke git diff staged changes nahi dikhata. Exam yeh bhi expect karta hai ki aap jaanein ki commit hash ek unique ID hai aur HEAD us commit ko point karta hai jo aapne abhi checkout kiya hai.</p></div>

<div class="scn"><h4>Jis ACL ne apne hi owners ko block kiya</h4><p>Friday ke change ke baad NOC DN-EDGE1 par SSH nahi kar paya. On-call engineer ne pehle router ko haath nahi lagaya. Usne repository kholi, git log --oneline aur suspicious commit par git show chalaya, aur dekha ki permit line 10.99.0.0 range se 10.99.9.0 par chali gayi thi. Kisi bhi cheez mein login karne se pehle hi use wajah, author aur time pata thi, jiska matlab tha ki fix panic mein type karne ke bajaye taiyaar aur review ho sakta tha.</p><p><b>Lesson:</b> pehle history padho; repository aapki sabse tez incident timeline hai.</p></div>
<div class="iv"><p class="q">"Kisi purane change ne kya kiya, yeh kaise pata karoge?"</p><p>git log --oneline se commit dhoondo, phir uske hash ya HEAD~2 jaise relative naam ke saath git show chalao jisse message, author aur diff dikhe. Samjhao ki minus lines hataayi gayi aur plus lines jodi gayi. Apna kaam commit se pehle review karne ke liye git diff aur git diff --staged ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git log --oneline commits ko naya pehle dikhata hai; HEAD aur main jaise labels batate hain aap kahan ho.</li><li>git show ek commit ko naam se bulakar uska message aur diff print karta hai.</li><li>Diff mein minus lines hataayi gayi, plus lines jodi gayi.</li><li>git diff working tree ko staging se compare karta hai; git diff --staged staging ko last commit se.</li><li>HEAD~1 aur HEAD~2 us commit se peeche ginte hain jis par aap ho.</li></ul></div>

`}};export{e as default};