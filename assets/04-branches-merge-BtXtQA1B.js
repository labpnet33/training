var e={id:`branches-merge`,h:{en:`Branches and merging`,hi:`Branches aur merging`},body:{en:`

<p><b>One idea in this chapter:</b> a branch is a safe side road. You make your change there, check it, and only then bring it back to the main road. Production configuration lives on <code>main</code>; experiments never touch it until they are ready.</p>

<h3>Why branches?</h3>
<p>Imagine two engineers: Meera is adding a VLAN, Dev is rewriting the QoS policy. If both edit <code>main</code> directly, Meera's half-done work lands in Dev's commit. With branches, each keeps their own line of commits. <code>main</code> always holds approved work, like a signed-off change plan, and every new change is prepared on a branch and reviewed first.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="A branch splits off, gets its own commits, and is merged back into main."><line x1="40" y1="45" x2="600" y2="45" stroke="#64748b" stroke-width="2"/><path d="M200 45 Q230 100 270 100 L420 100 Q450 100 470 55" fill="none" stroke="#64748b" stroke-width="2"/><circle cx="110" cy="45" r="13" fill="#bae6fd"/><circle cx="200" cy="45" r="13" fill="#bae6fd"/><circle cx="330" cy="100" r="13" fill="#fde68a"/><circle cx="420" cy="100" r="13" fill="#fde68a"/><circle cx="500" cy="45" r="13" fill="#bbf7d0"/><text x="30" y="30" class="svg-ink" font-size="13">main</text><text x="300" y="140" class="svg-ink" font-size="13">add-vlan30</text><text x="500" y="22" text-anchor="middle" class="svg-accent" font-size="12">merge</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="11">first</text></svg><p class="cap">A branch splits off, gets its own commits, and is merged back into main.</p></div>
<p>A branch in Git is extremely light: it is just a movable label that points at a commit. Creating one costs nothing, so make one per change.</p>

<h3>The branch commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it does</th></tr><tr><td>git branch</td><td>List branches. The star marks the one you are on.</td></tr><tr><td>git checkout -b NAME</td><td>Create a branch and move to it. Same as git switch -c NAME.</td></tr><tr><td>git checkout NAME / git switch NAME</td><td>Move to an existing branch. Your files change to match it.</td></tr><tr><td>git merge NAME</td><td>Bring the commits of branch NAME into the branch you are on.</td></tr><tr><td>git branch -D NAME</td><td>Delete a branch you no longer need.</td></tr></table>

<h3>Lab 1 walk-through: add VLAN 30 on a branch</h3>
<p>Kaveri Foods wants a VLAN for CCTV cameras. Create the branch, then add two lines to the VLAN file. Remember: <code>echo "text" &gt;&gt; file</code> appends a line.</p>
<pre class="code">git checkout -b add-vlan30
echo "  - id: 30" &gt;&gt; vlans.yml
echo "    name: CCTV" &gt;&gt; vlans.yml
git diff
git commit -am "Add VLAN 30 for CCTV cameras"</pre>
<pre class="out">Switched to a new branch 'add-vlan30'

diff --git a/vlans.yml b/vlans.yml
--- a/vlans.yml
+++ b/vlans.yml
@@ -1,7 +1,9 @@
 # VLAN plan - Kaveri Foods, Mysuru plant
 vlans:
   - id: 10
     name: OFFICE
   - id: 20
     name: PACKING
<span class="hl">+  - id: 30</span>
<span class="hl">+    name: CCTV</span>

[add-vlan30 3209b8a] Add VLAN 30 for CCTV cameras
 1 file changed</pre>
<p>The two <code>+</code> lines are the whole change. Spaces matter in YAML (a data format you will meet again in the Ansible and CI/CD modules): the dash must line up with the other entries. The prompt shows <code>[add-vlan30 3209b8a]</code>, so the commit went onto the new branch, not onto <code>main</code>.</p>
<p>Now prove main is untouched. Switching branches changes the files on disk to match the branch:</p>
<pre class="code">git checkout main
git merge add-vlan30
git log --oneline</pre>
<pre class="out">Switched to branch 'main'
Updating 194527b..3209b8a
<span class="hl">Fast-forward</span>
 vlans.yml
 1 file changed

3209b8a (HEAD -&gt; main, add-vlan30) Add VLAN 30 for CCTV cameras
194527b Initial import of configs</pre>

<h3>What "fast-forward" means</h3>
<p>While you worked, nobody else changed <code>main</code>. So Git did not need to combine two histories; it simply slid the <code>main</code> label forward to your newest commit. That is a <b>fast-forward</b> merge: no new commit, no conflict. The log shows both labels, <code>main</code> and <code>add-vlan30</code>, on the same commit.</p>
<p>If <code>main</code> had moved in the meantime, Git would create a <b>merge commit</b> that has two parents and joins the two lines of work. If both sides changed the same lines, you get a <b>merge conflict</b>, which is the next chapter.</p>

<h3>Branch names and habits</h3>
<ul><li>Name branches for the change: <code>add-vlan30</code>, <code>hotfix-ntp</code>, <code>noc-syslog</code>. Avoid <code>test</code> or <code>new</code>.</li><li>Always run <code>git status</code> before switching: uncommitted edits can block or follow you.</li><li>Commit your work on the branch before you merge. You can only merge commits, not loose edits.</li><li>Keep branches short-lived. A branch open for three weeks drifts far from main and merges painfully.</li></ul>

<div class="eg"><p><b>Worked example.</b> Three engineers each need a change before the weekend: VLAN 30, a new NTP server, a banner. Each creates a branch from main, commits there, and merges in turn. Even if the banner change turns out wrong, main never had it until it was approved, and the other two changes ship on time.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Committing on main by accident because you forgot which branch you were on (check the star in git branch). Merging in the wrong direction: you must be standing on the branch that should receive the work, so switch to main first, then merge the feature. Deleting a branch before it is merged.</p></div>
<div class="exam"><p><b>Exam trap.</b> git merge brings the named branch into the CURRENT branch. A fast-forward happens when the current branch has no new commits of its own. A merge commit has two parents.</p></div>

<div class="scn"><h4>Two changes, one maintenance window</h4><p>On Thursday a network team had a CCTV VLAN and an NTP change ready for the same window. The NTP change was approved; the CCTV VLAN still needed the facilities team to confirm port numbers. Because each lived on its own branch, the team merged the NTP branch, deployed it, and left the VLAN branch waiting. Had both been edited on main together, the whole window would have been postponed.</p><p><b>Lesson:</b> branches let ready work ship while unfinished work waits.</p></div>
<div class="iv"><p class="q">"What is a branch and why use one for a network change?"</p><p>A branch is a lightweight pointer to a line of commits. You prepare and test a change on its own branch so the main branch always holds approved, working configuration. After review you merge it back. Mention fast-forward when main has not moved, and a merge commit with two parents when it has.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>A branch is a cheap, movable label on a line of commits; create one per change.</li><li>git checkout -b NAME (or git switch -c NAME) creates and switches in one step.</li><li>git merge NAME merges the named branch into the branch you are standing on.</li><li>Fast-forward means main only needed to move forward; no merge commit is created.</li><li>Commit on the branch first, then switch to main and merge.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> branch ek safe side road hai. Aap apna change wahan banate ho, check karte ho, aur tabhi use main road par wapas lete ho. Production configuration <code>main</code> par rehti hai; experiments tab tak use nahi chhoote jab tak ready na ho.</p>

<h3>Branches kyun?</h3>
<p>Do engineers socho: Meera VLAN jod rahi hai, Dev QoS policy dobara likh raha hai. Agar dono seedha <code>main</code> edit karein, to Meera ka adhoora kaam Dev ke commit mein aa jaata hai. Branches ke saath har koi apni commits ki line rakhta hai. <code>main</code> mein hamesha approved kaam hota hai, jaise sign-off hua change plan, aur har naya change branch par taiyaar aur pehle review hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Branch alag hoti hai, apne commits banati hai, aur wapas main mein merge hoti hai."><line x1="40" y1="45" x2="600" y2="45" stroke="#64748b" stroke-width="2"/><path d="M200 45 Q230 100 270 100 L420 100 Q450 100 470 55" fill="none" stroke="#64748b" stroke-width="2"/><circle cx="110" cy="45" r="13" fill="#bae6fd"/><circle cx="200" cy="45" r="13" fill="#bae6fd"/><circle cx="330" cy="100" r="13" fill="#fde68a"/><circle cx="420" cy="100" r="13" fill="#fde68a"/><circle cx="500" cy="45" r="13" fill="#bbf7d0"/><text x="30" y="30" class="svg-ink" font-size="13">main</text><text x="300" y="140" class="svg-ink" font-size="13">add-vlan30</text><text x="500" y="22" text-anchor="middle" class="svg-accent" font-size="12">merge</text><text x="110" y="75" text-anchor="middle" class="svg-muted" font-size="11">first</text></svg><p class="cap">A branch splits off, gets its own commits, and is merged back into main.</p></div>
<p>Git mein branch bahut halki hoti hai: yeh bas ek movable label hai jo ek commit ko point karta hai. Banane mein kuch kharch nahi, isliye har change ke liye ek banao.</p>

<h3>Branch ke commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya karta hai</th></tr><tr><td>git branch</td><td>Branches ki list. Star us branch par hota hai jis par aap ho.</td></tr><tr><td>git checkout -b NAME</td><td>Branch banata hai aur us par le jaata hai. git switch -c NAME ke barabar.</td></tr><tr><td>git checkout NAME / git switch NAME</td><td>Maujooda branch par jaao. Aapki files branch ke hisaab se badal jaati hain.</td></tr><tr><td>git merge NAME</td><td>Branch NAME ke commits us branch mein laao jis par aap ho.</td></tr><tr><td>git branch -D NAME</td><td>Jis branch ki zaroorat nahi use delete karo.</td></tr></table>

<h3>Lab 1 walk-through: branch par VLAN 30 jodo</h3>
<p>Kaveri Foods ko CCTV cameras ke liye VLAN chahiye. Branch banao, phir VLAN file mein do lines jodo. Yaad rakho: <code>echo "text" &gt;&gt; file</code> ek line append karta hai.</p>
<pre class="code">git checkout -b add-vlan30
echo "  - id: 30" &gt;&gt; vlans.yml
echo "    name: CCTV" &gt;&gt; vlans.yml
git diff
git commit -am "Add VLAN 30 for CCTV cameras"</pre>
<pre class="out">Switched to a new branch 'add-vlan30'

diff --git a/vlans.yml b/vlans.yml
--- a/vlans.yml
+++ b/vlans.yml
@@ -1,7 +1,9 @@
 # VLAN plan - Kaveri Foods, Mysuru plant
 vlans:
   - id: 10
     name: OFFICE
   - id: 20
     name: PACKING
<span class="hl">+  - id: 30</span>
<span class="hl">+    name: CCTV</span>

[add-vlan30 3209b8a] Add VLAN 30 for CCTV cameras
 1 file changed</pre>
<p>Do <code>+</code> lines hi poora change hain. YAML (ek data format jo aap Ansible aur CI/CD modules mein phir milenge) mein spaces matter karte hain: dash baaki entries ke saath line mein hona chahiye. Prompt <code>[add-vlan30 3209b8a]</code> dikhata hai, yaani commit nayi branch par gaya, <code>main</code> par nahi.</p>
<p>Ab saabit karo ki main untouched hai. Branch badalne se disk ki files branch ke hisaab se badal jaati hain:</p>
<pre class="code">git checkout main
git merge add-vlan30
git log --oneline</pre>
<pre class="out">Switched to branch 'main'
Updating 194527b..3209b8a
<span class="hl">Fast-forward</span>
 vlans.yml
 1 file changed

3209b8a (HEAD -&gt; main, add-vlan30) Add VLAN 30 for CCTV cameras
194527b Initial import of configs</pre>

<h3>"Fast-forward" ka matlab</h3>
<p>Aapke kaam ke dauran kisi ne <code>main</code> nahi badla. To Git ko do histories jodni nahi padi; usne bas <code>main</code> label ko aapke sabse naye commit tak aage khisaka diya. Yeh <b>fast-forward</b> merge hai: koi naya commit nahi, koi conflict nahi. Log mein dono labels, <code>main</code> aur <code>add-vlan30</code>, ek hi commit par dikhte hain.</p>
<p>Agar beech mein <code>main</code> aage badh gaya hota, to Git ek <b>merge commit</b> banata jiske do parents hote hain aur do lines of work ko jodta hai. Agar dono sides ne same lines badli hoti, to <b>merge conflict</b> aata, jo agla chapter hai.</p>

<h3>Branch ke naam aur aadatein</h3>
<ul><li>Branch ka naam change ke hisaab se rakho: <code>add-vlan30</code>, <code>hotfix-ntp</code>, <code>noc-syslog</code>. <code>test</code> ya <code>new</code> se bacho.</li><li>Branch badalne se pehle <code>git status</code> chalao: uncommitted edits ruk sakte hain ya saath chal sakte hain.</li><li>Merge karne se pehle branch par apna kaam commit karo. Aap sirf commits merge kar sakte ho, loose edits nahi.</li><li>Branches ko chhota rakho. Teen hafte khuli branch main se bahut door chali jaati hai aur dardnaak merge hoti hai.</li></ul>

<div class="eg"><p><b>Worked example.</b> Teen engineers ko weekend se pehle ek-ek change chahiye: VLAN 30, naya NTP server, ek banner. Har koi main se branch banata hai, wahan commit karta hai, aur baari-baari merge karta hai. Agar banner change galat nikla bhi, to main mein approve hone tak woh tha hi nahi, aur baaki do changes time par ship hue.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Galti se main par commit kar dena kyunki yaad nahi tha kis branch par ho (git branch mein star dekho). Merge ulti direction mein karna: aapko us branch par khade hona hai jo kaam receive karegi, isliye pehle main par jao, phir feature merge karo. Merge hone se pehle branch delete kar dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> git merge named branch ko CURRENT branch mein laata hai. Fast-forward tab hota hai jab current branch ke apne koi naye commits nahi hote. Merge commit ke do parents hote hain.</p></div>

<div class="scn"><h4>Do changes, ek maintenance window</h4><p>Thursday ko ek network team ke paas ek hi window ke liye CCTV VLAN aur NTP change ready the. NTP change approve ho gaya; CCTV VLAN ko abhi facilities team se port numbers confirm karwane the. Kyunki har ek apni branch par tha, team ne NTP branch merge ki, deploy kiya, aur VLAN branch ko wait par rakha. Agar dono main par ek saath edit hote, to poori window postpone ho jaati.</p><p><b>Lesson:</b> branches ready kaam ko ship hone dete hain aur adhoore kaam ko wait karne dete hain.</p></div>
<div class="iv"><p class="q">"Branch kya hai aur network change ke liye ek kyun use karte hain?"</p><p>Branch commits ki ek line ka lightweight pointer hai. Aap change ko apni branch par taiyaar aur test karte ho taaki main branch mein hamesha approved, working configuration rahe. Review ke baad use wapas merge karte ho. Fast-forward ka zikr karo jab main aage nahi badha, aur do parents wale merge commit ka jab badha ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Branch commits ki line par ek sasta, movable label hai; har change ke liye ek banao.</li><li>git checkout -b NAME (ya git switch -c NAME) ek hi step mein banata aur switch karta hai.</li><li>git merge NAME named branch ko us branch mein merge karta hai jis par aap khade ho.</li><li>Fast-forward ka matlab main ko bas aage badhna tha; koi merge commit nahi banta.</li><li>Pehle branch par commit karo, phir main par jaakar merge karo.</li></ul></div>

`}};export{e as default};