var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`

<p>You started this module never having typed a Git command. You can now keep configuration under version control, read its history, branch, merge, resolve conflicts, undo safely and publish. This chapter gathers everything for revision and for the CCNP Automation 350-901 exam.</p>

<h3>Can-do checklist</h3>
<ul><li>Turn a folder into a repository with <code>git init</code> and make a first commit with <code>git add</code> and <code>git commit -m</code>.</li><li>Explain working tree, staging area and repository, and say which command moves a change between them.</li><li>Read <code>git log --oneline</code>, <code>git show</code>, <code>git diff</code> and <code>git diff --staged</code>, including plus and minus lines.</li><li>Create a branch, switch between branches and merge; explain fast-forward versus a merge commit.</li><li>Recognise conflict markers and resolve them with <code>--ours</code>, <code>--theirs</code>, a manual edit, or <code>git merge --abort</code>.</li><li>Choose between <code>revert</code>, <code>reset --hard</code> and <code>cherry-pick</code>, and justify it for shared history.</li><li>Add a remote, push a branch, create a tag, and describe clone, fetch, pull and pull requests.</li><li>Keep secrets out of a repository and explain why deleting them later does not help.</li></ul>

<h3>Command cheat-sheet (all run in the simulator)</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr><tr><td>Start tracking a folder</td><td>git init</td></tr><tr><td>See state</td><td>git status</td></tr><tr><td>Stage files</td><td>git add FILE  /  git add .</td></tr><tr><td>Save a snapshot</td><td>git commit -m "message"  /  git commit -am "message"</td></tr><tr><td>Read history</td><td>git log --oneline  /  git log --oneline -n 2</td></tr><tr><td>Show one commit</td><td>git show HEAD~2  /  git show BRANCH</td></tr><tr><td>Review changes</td><td>git diff  /  git diff --staged  /  git diff HEAD~1</td></tr><tr><td>Branches</td><td>git branch  /  git checkout -b NAME  /  git switch -c NAME  /  git checkout NAME</td></tr><tr><td>Merge</td><td>git merge NAME  /  git merge --abort</td></tr><tr><td>Resolve a conflict</td><td>git checkout --theirs FILE  /  git checkout --ours FILE, then git add FILE and git commit</td></tr><tr><td>Undo safely</td><td>git revert HASH</td></tr><tr><td>Undo locally</td><td>git reset --hard HEAD~1</td></tr><tr><td>Copy one commit</td><td>git cherry-pick BRANCH_OR_HASH</td></tr><tr><td>Label a commit</td><td>git tag NAME  /  git tag</td></tr><tr><td>Remote</td><td>git remote add origin ADDRESS  /  git remote -v  /  git push origin main</td></tr></table>
<p>Reference configuration (not run in the simulator): <code>git clone</code>, <code>git fetch</code>, <code>git pull</code>, <code>git stash</code>, <code>git blame</code>, <code>git restore</code>, <code>git reflog</code> and <code>.gitignore</code>. They exist in real Git; know what they do, but the lab host will answer that they are not Git commands in this lab.</p>

<h3>Most tested facts</h3>
<ul><li>Git is local; GitHub, GitLab and Bitbucket are hosting services. A commit is local; a push sends it to a remote.</li><li>git add stages; only git commit records a snapshot; git commit -am skips untracked files.</li><li>In a diff, minus is removed and plus is added.</li><li>HEAD is the commit you are on; HEAD~1 is one commit before.</li><li>git merge brings the named branch into the current branch. Fast-forward needs no merge commit; a real merge commit has two parents.</li><li>In conflict markers, HEAD (above the divider) is your current branch; below it is the branch being merged.</li><li>revert adds an opposite commit and is safe for shared history; reset --hard rewrites history and discards work.</li><li>cherry-pick copies one commit and creates a new commit with a new hash.</li><li>The main branch is the source of truth that automation reads from.</li><li>Secrets stay in history forever once committed; use vaults or masked CI variables.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>Repository</dt><dd>folder whose history Git tracks</dd><dt>Commit</dt><dd>saved snapshot with author, message and hash</dd><dt>Hash</dt><dd>short unique ID of a commit, such as 194527b</dd><dt>Working tree</dt><dd>files as they are on disk now</dd><dt>Staging area</dt><dd>list of changes chosen for the next commit</dd><dt>Branch</dt><dd>movable label on a line of commits</dd><dt>HEAD</dt><dd>pointer to the commit or branch you are on</dd><dt>Merge</dt><dd>combining another branch into the current one</dd><dt>Fast-forward</dt><dd>merge that only moves the branch label forward</dd><dt>Conflict</dt><dd>both sides changed the same lines; a human must choose</dd><dt>Revert</dt><dd>new commit that cancels an old one</dd><dt>Cherry-pick</dt><dd>copy one commit onto the current branch</dd><dt>Remote / origin</dt><dd>shared copy of the repository and its usual name</dd><dt>Tag</dt><dd>fixed label on a commit</dd><dt>Pull request</dt><dd>hosting-service review step before merging</dd></dl>

<h3>Lab command recap</h3>
<p><b>Lab 1 (first repo):</b></p>
<pre class="code">git init
git add .
git commit -m "Initial import of configs"
git checkout -b add-vlan30
echo "  - id: 30" &gt;&gt; vlans.yml
echo "    name: CCTV" &gt;&gt; vlans.yml
git commit -am "Add VLAN 30 for CCTV cameras"
git checkout main
git merge add-vlan30
sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r1.cfg
sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r2.cfg
git add r1.cfg r2.cfg
git commit -m "Move NTP to 10.1.1.10"
git log --oneline</pre>
<p>The final log shows three commits, which is the number Lab 1 asks for. <b>Lab 2 (undo):</b></p>
<pre class="code">git log --oneline
git show HEAD~2
git revert HEAD~2
git merge noc-syslog
git checkout --theirs syslog.cfg
git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git cherry-pick hotfix-ntp
git status
git push origin main</pre>

<h3>Where this leads</h3>
<p>Your repository is now the source of truth. In the <b>Ansible</b> modules playbooks and inventories live in this repository. In the <b>CI/CD</b> module a pipeline runs on every push, so a bad VLAN file is caught before it reaches a switch.</p>

<div class="eg"><p><b>Worked example.</b> Exam question: "A bad commit was pushed; two good commits followed. Which command removes only the bad one without rewriting history?" Answer: git revert HASH. Distractors: git reset --hard (rewrites history, drops the good commits), git cherry-pick (copies a commit), git checkout -b (creates a branch).</p></div>
<div class="exam"><p><b>Final exam trap.</b> Read the verb. "Copy one commit" is cherry-pick. "Undo a pushed commit" is revert. "Combine a branch" is merge. "Send to the server" is push. "Where are the markers from" is a merge conflict.</p></div>
<div class="scn"><h4>A team that trusted the repository</h4><p>After a year with Git, a network team could answer an audit question such as "who changed the management ACL on this router in March, and who approved it?" in under two minutes, from the log and the pull request. Before Git the same question took a week and was never answered with certainty.</p><p><b>Lesson:</b> a repository is both an undo button and an audit trail.</p></div>
<div class="iv"><p class="q">"Explain Git to someone who has never used it, using a network example."</p><p>Git is a notebook of configuration versions. Each saved version is a commit with an author and a message. You prepare a change on a branch, review it, merge it back, and if it breaks something you revert it with a new commit. The remote copy is the source of truth that tools like Ansible and CI/CD read from.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Master the loop: status, add, commit, log, diff.</li><li>Branch for every change; merge when approved; resolve conflicts by choosing deliberately.</li><li>Shared history: revert. One commit from a messy branch: cherry-pick.</li><li>Remote and pull requests make the repository the source of truth; protect main.</li><li>Never commit secrets; the repository is the base for Ansible and CI/CD.</li></ul></div>

`,hi:`

<p>Aapne yeh module aise shuru kiya tha jaise kabhi Git command type nahi kiya. Ab aap configuration ko version control mein rakh sakte ho, history padh sakte ho, branch, merge kar sakte ho, conflicts resolve kar sakte ho, safely undo kar sakte ho aur publish kar sakte ho. Yeh chapter revision aur CCNP Automation 350-901 exam ke liye sab kuch ek jagah jodta hai.</p>

<h3>Can-do checklist</h3>
<ul><li><code>git init</code> se folder ko repository banana aur <code>git add</code> aur <code>git commit -m</code> se pehla commit karna.</li><li>Working tree, staging area aur repository samjhana, aur batana ki kaun sa command change ko inke beech le jaata hai.</li><li><code>git log --oneline</code>, <code>git show</code>, <code>git diff</code> aur <code>git diff --staged</code> padhna, plus aur minus lines samet.</li><li>Branch banana, branches ke beech switch karna aur merge karna; fast-forward aur merge commit ka fark samjhana.</li><li>Conflict markers pehchanna aur unhe <code>--ours</code>, <code>--theirs</code>, haath ke edit, ya <code>git merge --abort</code> se resolve karna.</li><li><code>revert</code>, <code>reset --hard</code> aur <code>cherry-pick</code> mein se chunna, aur shared history ke liye reason dena.</li><li>Remote jodna, branch push karna, tag banana, aur clone, fetch, pull aur pull requests samjhana.</li><li>Secrets ko repository se bahar rakhna aur samjhana ki baad mein delete karne se kyun fayda nahi.</li></ul>

<h3>Command cheat-sheet (sab simulator mein chalte hain)</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr><tr><td>Folder track karna shuru</td><td>git init</td></tr><tr><td>State dekhna</td><td>git status</td></tr><tr><td>Files stage karna</td><td>git add FILE  /  git add .</td></tr><tr><td>Snapshot save karna</td><td>git commit -m "message"  /  git commit -am "message"</td></tr><tr><td>History padhna</td><td>git log --oneline  /  git log --oneline -n 2</td></tr><tr><td>Ek commit dikhana</td><td>git show HEAD~2  /  git show BRANCH</td></tr><tr><td>Changes review karna</td><td>git diff  /  git diff --staged  /  git diff HEAD~1</td></tr><tr><td>Branches</td><td>git branch  /  git checkout -b NAME  /  git switch -c NAME  /  git checkout NAME</td></tr><tr><td>Merge</td><td>git merge NAME  /  git merge --abort</td></tr><tr><td>Conflict resolve</td><td>git checkout --theirs FILE  /  git checkout --ours FILE, phir git add FILE aur git commit</td></tr><tr><td>Safely undo</td><td>git revert HASH</td></tr><tr><td>Locally undo</td><td>git reset --hard HEAD~1</td></tr><tr><td>Ek commit copy</td><td>git cherry-pick BRANCH_OR_HASH</td></tr><tr><td>Commit par label</td><td>git tag NAME  /  git tag</td></tr><tr><td>Remote</td><td>git remote add origin ADDRESS  /  git remote -v  /  git push origin main</td></tr></table>
<p>Reference configuration (not run in the simulator): <code>git clone</code>, <code>git fetch</code>, <code>git pull</code>, <code>git stash</code>, <code>git blame</code>, <code>git restore</code>, <code>git reflog</code> aur <code>.gitignore</code>. Yeh asli Git mein hain; jaano ki yeh kya karte hain, par lab host jawab dega ki yeh is lab mein Git commands nahi hain.</p>

<h3>Sabse zyada test hone wale facts</h3>
<ul><li>Git local hai; GitHub, GitLab aur Bitbucket hosting services hain. Commit local hai; push use remote par bhejta hai.</li><li>git add stage karta hai; sirf git commit snapshot record karta hai; git commit -am untracked files skip karta hai.</li><li>Diff mein minus hataaya gaya hai aur plus jodha gaya hai.</li><li>HEAD woh commit hai jis par aap ho; HEAD~1 uske ek pehle wala.</li><li>git merge named branch ko current branch mein laata hai. Fast-forward mein merge commit nahi banta; asli merge commit ke do parents hote hain.</li><li>Conflict markers mein HEAD (divider ke upar) aapki current branch hai; neeche merge hone wali branch hai.</li><li>revert ulta commit jodta hai aur shared history ke liye safe hai; reset --hard history rewrite karta hai aur kaam phenk deta hai.</li><li>cherry-pick ek commit copy karke naye hash ke saath naya commit banata hai.</li><li>Main branch source of truth hai jise automation padhta hai.</li><li>Secret ek baar commit hua to history mein hamesha rehta hai; vaults ya masked CI variables use karo.</li></ul>

<h3>Mini glossary</h3>
<dl class="terms"><dt>Repository</dt><dd>folder jiski history Git track karta hai</dd><dt>Commit</dt><dd>author, message aur hash ke saath saved snapshot</dd><dt>Hash</dt><dd>commit ka chhota unique ID, jaise 194527b</dd><dt>Working tree</dt><dd>files jaisi abhi disk par hain</dd><dt>Staging area</dt><dd>agle commit ke liye chune hue changes ki list</dd><dt>Branch</dt><dd>commits ki line par movable label</dd><dt>HEAD</dt><dd>us commit ya branch ka pointer jis par aap ho</dd><dt>Merge</dt><dd>doosri branch ko current mein milana</dd><dt>Fast-forward</dt><dd>merge jo sirf branch label ko aage khisakata hai</dd><dt>Conflict</dt><dd>dono sides ne same lines badli; insaan ko choose karna hai</dd><dt>Revert</dt><dd>naya commit jo purane ko cancel karta hai</dd><dt>Cherry-pick</dt><dd>ek commit ko current branch par copy karna</dd><dt>Remote / origin</dt><dd>repository ki shared copy aur uska aam naam</dd><dt>Tag</dt><dd>commit par fixed label</dd><dt>Pull request</dt><dd>merge se pehle hosting-service ka review step</dd></dl>

<h3>Lab command recap</h3>
<p><b>Lab 1 (first repo):</b></p>
<pre class="code">git init
git add .
git commit -m "Initial import of configs"
git checkout -b add-vlan30
echo "  - id: 30" &gt;&gt; vlans.yml
echo "    name: CCTV" &gt;&gt; vlans.yml
git commit -am "Add VLAN 30 for CCTV cameras"
git checkout main
git merge add-vlan30
sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r1.cfg
sed -i 's/ntp server 10.1.1.1/ntp server 10.1.1.10/' r2.cfg
git add r1.cfg r2.cfg
git commit -m "Move NTP to 10.1.1.10"
git log --oneline</pre>
<p>Aakhri log teen commits dikhata hai, jo Lab 1 ka maanga hua number hai. <b>Lab 2 (undo):</b></p>
<pre class="code">git log --oneline
git show HEAD~2
git revert HEAD~2
git merge noc-syslog
git checkout --theirs syslog.cfg
git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git cherry-pick hotfix-ntp
git status
git push origin main</pre>

<h3>Yeh kahan le jaata hai</h3>
<p>Aapki repository ab source of truth hai. <b>Ansible</b> modules mein playbooks aur inventories isi repository mein rehte hain. <b>CI/CD</b> module mein har push par pipeline chalti hai, isliye kharab VLAN file switch tak pahunchne se pehle pakdi jaati hai.</p>

<div class="eg"><p><b>Worked example.</b> Exam question: "Ek kharab commit push hua; do achhe commits uske baad aaye. Kaun sa command history rewrite kiye bina sirf kharab wala hataata hai?" Jawab: git revert HASH. Distractors: git reset --hard (history rewrite karta hai, achhe commits girata hai), git cherry-pick (commit copy karta hai), git checkout -b (branch banata hai).</p></div>
<div class="exam"><p><b>Final exam trap.</b> Verb padho. "Ek commit copy karo" matlab cherry-pick. "Pushed commit undo karo" matlab revert. "Branch jodo" matlab merge. "Server par bhejo" matlab push. "Markers kahan se aaye" matlab merge conflict.</p></div>
<div class="scn"><h4>Jis team ne repository par bharosa kiya</h4><p>Ek saal Git ke baad ek network team "March mein is router par management ACL kisne badli aur kisne approve ki?" jaise audit sawaal ka jawab log aur pull request se do minute mein de sakti thi. Git se pehle wahi sawaal ek hafta leta tha aur kabhi pakke taur par jawab nahi milta tha.</p><p><b>Lesson:</b> repository undo button bhi hai aur audit trail bhi.</p></div>
<div class="iv"><p class="q">"Jisne kabhi Git use nahi kiya use network example se samjhao."</p><p>Git configuration versions ki notebook hai. Har saved version ek commit hai jisme author aur message hota hai. Aap change branch par taiyaar karte ho, review karte ho, wapas merge karte ho, aur agar kuch toote to naye commit se revert karte ho. Remote copy source of truth hai jise Ansible aur CI/CD jaise tools padhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Loop master karo: status, add, commit, log, diff.</li><li>Har change ke liye branch; approve hone par merge; conflicts soch-samajhkar resolve karo.</li><li>Shared history: revert. Messy branch ka ek commit: cherry-pick.</li><li>Remote aur pull requests repository ko source of truth banate hain; main protect karo.</li><li>Secrets kabhi commit mat karo; repository Ansible aur CI/CD ka base hai.</li></ul></div>

`}};export{e as default};