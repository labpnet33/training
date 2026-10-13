var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from a broken push to a clean main`,hi:`Troubleshooting workflow: toote push se clean main tak`},body:{en:`

<p><b>One idea in this chapter:</b> every Git problem is solved by the same four questions: where am I, what happened, what is the safest way to fix it, and did it work? Learn the loop once and use it for tickets, labs and interviews.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="The troubleshooting loop: orient, read history, choose the safe fix, verify, then push."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">1. Where am I?</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">status, branch</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">2. What happened?</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">log, show</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">3. Choose undo</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">revert / pick</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">4. Verify, push</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">cat, status</text></svg><p class="cap">The troubleshooting loop: orient, read history, choose the safe fix, verify, then push.</p></div>

<h3>The ticket (Lab 2)</h3>
<p>Deccan Net's edge configs are already pushed to the team server. Since the last push the NOC cannot SSH to DN-EDGE1. Your orders: find the cause, undo it without losing later good commits, merge the NOC's syslog branch, bring over only the NTP fix, and push. Follow the loop.</p>

<h3>Step 1: where am I?</h3>
<pre class="code">git status
git branch
git log --oneline</pre>
<pre class="out">On branch main
nothing to commit, working tree clean

  hotfix-ntp
* main
  noc-syslog

faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs</pre>
<p>A clean tree on main, with two side branches waiting: <code>hotfix-ntp</code> and <code>noc-syslog</code>. Starting from a clean tree is important. If status shows modified files, decide first whether to commit them or consciously discard them.</p>

<h3>Step 2: what happened?</h3>
<p>Management access broke, so look for the commit that touched the management ACL. The message "Tighten mgmt ACL" is the lead. Open it:</p>
<pre class="code">git show HEAD~2</pre>
<pre class="out">    Tighten mgmt ACL

-access-list 10 permit 10.99.0.0 0.0.0.255
+access-list 10 permit 10.99.9.0 0.0.0.255</pre>
<p>(Only the key lines are repeated; chapter 3 shows the full output.) The NOC hosts are in 10.99.0.0/24, so they are no longer permitted. Cause found: <b>Tighten mgmt ACL</b>. The Lab 2 first task asks for exactly this message or its short hash.</p>

<h3>Step 3: choose the safe fix</h3>
<table class="cmp"><tr><th>Question</th><th>If yes</th></tr>
<tr><td>Is the bad commit already pushed or shared?</td><td>Use <code>git revert</code>, never <code>reset --hard</code>.</td></tr>
<tr><td>Do I need one fix from a branch with unfinished work?</td><td>Use <code>git cherry-pick</code>.</td></tr>
<tr><td>Do I need a whole finished branch?</td><td>Use <code>git merge</code>.</td></tr>
<tr><td>Is the merge conflicting?</td><td>Read the markers, choose, <code>git add</code>, <code>git commit</code>, or <code>git merge --abort</code>.</td></tr></table>
<p>Here the bad commit is pushed, so revert it. Then merge <code>noc-syslog</code>, which will conflict, and cherry-pick the NTP fix. The command sequence the lab expects is the one from chapters 5 and 6:</p>
<pre class="code">git revert HEAD~2
git merge noc-syslog
git checkout --theirs syslog.cfg
git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git cherry-pick hotfix-ntp</pre>

<h3>Step 4: verify before you push</h3>
<p>Never push on faith. Read the files and the status:</p>
<pre class="code">cat edge.cfg
git status
git push origin main</pre>
<pre class="out">hostname DN-EDGE1
!
<span class="hl">ntp server 10.1.1.10</span>
!
access-list 10 remark NOC management hosts
<span class="hl">access-list 10 permit 10.99.0.0 0.0.0.255</span>
!
line vty 0 4
 access-class 10 in
!
<span class="hl">banner motd ^Authorised access only^</span>

On branch main
nothing to commit, working tree clean

   faf4702..429f01a  main -&gt; main</pre>
<p>Checklist: ACL allows 10.99.0.0, banner kept, NTP fixed, no <code>qos.cfg</code>, syslog points to 10.20.0.5, status clean, push accepted. That is every requirement of the ticket.</p>

<h3>Common error messages and what they mean</h3>
<table class="cmp"><tr><th>Message</th><th>Meaning</th><th>Fix</th></tr><tr><td>fatal: not a git repository</td><td>you are not inside a tracked folder</td><td>cd to the project, or run git init</td></tr><tr><td>nothing to commit, working tree clean</td><td>no changes to save</td><td>edit or stage something first</td></tr><tr><td>error: pathspec 'nosuch' did not match any file(s) known to git</td><td>branch or file name misspelled</td><td>check git branch and ls</td></tr><tr><td>merge: nosuch - not something we can merge</td><td>the branch does not exist</td><td>check the spelling with git branch</td></tr><tr><td>CONFLICT (content): Merge conflict in FILE</td><td>both sides changed the same lines</td><td>resolve, git add, git commit</td></tr><tr><td>error: Cannot delete branch X checked out</td><td>you are standing on that branch</td><td>switch to another branch first</td></tr></table>
<p>These are the exact messages printed by the lab host, so you will recognise them in the labs.</p>

<h3>When you are stuck</h3>
<ul><li>Run <code>git status</code> again; it always tells you the next sensible step.</li><li>Run <code>git log --oneline</code> and compare with what you expect.</li><li>For a half-done merge, <code>git merge --abort</code> restores the starting point.</li><li><b>Reference (not run in the simulator):</b> on a real machine <code>git reflog</code> lists where HEAD has been and can recover a commit that a reset appeared to delete.</li></ul>

<div class="eg"><p><b>Worked example.</b> In Lab 1 you type git checkout add-vlan3 (a typo). Git answers error: pathspec &#39;add-vlan3&#39; did not match any file(s) known to git. Loop: where am I (git branch shows add-vlan30), what is wrong (one character missing), fix (retype). Total cost: ten seconds, because the message names the problem.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Fixing the symptom on the device by hand instead of in the repository: the next pipeline run would restore the repository version and the fix is lost. Pushing before reading the final file. Panic-typing commands: after any surprise, stop and run git status.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions give you a history and ask for the correct undo. Pushed and mixed with good later commits: revert. One good commit in a branch with unfinished work: cherry-pick. Never reset --hard on shared history.</p></div>

<div class="scn"><h4>Monday morning, red main</h4><p>A team found that main on the shared server had a commit nobody could explain. The engineer on duty used the loop. Status was clean, log showed a commit named "tmp test" from Saturday, show proved it removed the SNMP trap server line. The commit was pushed, so she reverted it, read the file, pushed, and added a note in the commit message. The whole repair took four minutes, and no one lost any work.</p><p><b>Lesson:</b> a calm, repeatable loop beats clever commands.</p></div>
<div class="iv"><p class="q">"A pushed commit broke production. Walk me through your Git steps."</p><p>I check git status and git log --oneline to see where I am, then git show on the suspect commit to confirm the cause. Because it is pushed, I use git revert so history is not rewritten and later good commits remain. I run cat or git diff to verify the file, then push. If I only need part of another branch I use cherry-pick; if a merge conflicts I resolve markers, git add and commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Loop: where am I, what happened, safest fix, verify, push.</li><li>Pushed commits are fixed with revert; one commit from a messy branch uses cherry-pick.</li><li>Read the file before you push; check git status is clean afterwards.</li><li>The lab host error messages are real Git wording: learn to read them.</li><li>Fix problems in the repository, not by hand on the device.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> Git ki har problem ek hi jaise chaar sawaalon se suljhti hai: main kahan hoon, kya hua, theek karne ka sabse safe tareeka kaun sa hai, aur kya kaam kiya? Loop ek baar seekho aur tickets, labs aur interviews mein use karo.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Troubleshooting loop: orient ho, history padho, safe fix chuno, verify karo, phir push."><rect x="10" y="28" width="128" height="68" rx="10" fill="#bae6fd"/><text x="74" y="58" text-anchor="middle" class="svg-ink" font-size="14">1. Main kahan?</text><text x="74" y="78" text-anchor="middle" class="svg-muted" font-size="12">status, branch</text><line x1="138" y1="62" x2="168" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="168,57 174,62 168,67" fill="#64748b"/><rect x="174" y="28" width="128" height="68" rx="10" fill="#bbf7d0"/><text x="238" y="58" text-anchor="middle" class="svg-ink" font-size="14">2. Kya hua?</text><text x="238" y="78" text-anchor="middle" class="svg-muted" font-size="12">log, show</text><line x1="302" y1="62" x2="332" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="332,57 338,62 332,67" fill="#64748b"/><rect x="338" y="28" width="128" height="68" rx="10" fill="#fde68a"/><text x="402" y="58" text-anchor="middle" class="svg-ink" font-size="14">3. Undo chuno</text><text x="402" y="78" text-anchor="middle" class="svg-muted" font-size="12">revert / pick</text><line x1="466" y1="62" x2="496" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="496,57 502,62 496,67" fill="#64748b"/><rect x="502" y="28" width="128" height="68" rx="10" fill="#ddd6fe"/><text x="566" y="58" text-anchor="middle" class="svg-ink" font-size="14">4. Verify, push</text><text x="566" y="78" text-anchor="middle" class="svg-muted" font-size="12">cat, status</text></svg><p class="cap">The troubleshooting loop: orient, read history, choose the safe fix, verify, then push.</p></div>

<h3>Ticket (Lab 2)</h3>
<p>Deccan Net ke edge configs team server par pehle se pushed hain. Last push ke baad NOC DN-EDGE1 par SSH nahi kar pa raha. Aapke orders: wajah dhoondo, baad ke achhe commits khoye bina undo karo, NOC ki syslog branch merge karo, sirf NTP fix lao, aur push karo. Loop follow karo.</p>

<h3>Step 1: main kahan hoon?</h3>
<pre class="code">git status
git branch
git log --oneline</pre>
<pre class="out">On branch main
nothing to commit, working tree clean

  hotfix-ntp
* main
  noc-syslog

faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs</pre>
<p>Main par clean tree, aur do side branches intezaar mein: <code>hotfix-ntp</code> aur <code>noc-syslog</code>. Clean tree se shuru karna zaroori hai. Agar status modified files dikhaye, to pehle decide karo ki unhe commit karna hai ya soch-samajhkar discard karna hai.</p>

<h3>Step 2: kya hua?</h3>
<p>Management access toota, isliye woh commit dhoondo jisne management ACL chhua. Message "Tighten mgmt ACL" lead hai. Use kholo:</p>
<pre class="code">git show HEAD~2</pre>
<pre class="out">    Tighten mgmt ACL

-access-list 10 permit 10.99.0.0 0.0.0.255
+access-list 10 permit 10.99.9.0 0.0.0.255</pre>
<p>(Sirf key lines dohrayi hain; poora output chapter 3 mein hai.) NOC hosts 10.99.0.0/24 mein hain, isliye ab permitted nahi hain. Wajah mil gayi: <b>Tighten mgmt ACL</b>. Lab 2 ka pehla task exactly yahi message ya uska short hash maangta hai.</p>

<h3>Step 3: safe fix chuno</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Agar haan</th></tr>
<tr><td>Kharab commit pehle se pushed ya shared hai?</td><td><code>git revert</code> use karo, <code>reset --hard</code> kabhi nahi.</td></tr>
<tr><td>Adhoore kaam wali branch se ek fix chahiye?</td><td><code>git cherry-pick</code> use karo.</td></tr>
<tr><td>Poori finished branch chahiye?</td><td><code>git merge</code> use karo.</td></tr>
<tr><td>Merge conflict kar raha hai?</td><td>Markers padho, chuno, <code>git add</code>, <code>git commit</code>, ya <code>git merge --abort</code>.</td></tr></table>
<p>Yahan kharab commit pushed hai, isliye revert karo. Phir <code>noc-syslog</code> merge karo, jo conflict karegi, aur NTP fix cherry-pick karo. Lab jo command sequence expect karta hai woh chapters 5 aur 6 wala hai:</p>
<pre class="code">git revert HEAD~2
git merge noc-syslog
git checkout --theirs syslog.cfg
git add syslog.cfg
git commit -m "Merge noc-syslog: use NOC collector"
git cherry-pick hotfix-ntp</pre>

<h3>Step 4: push se pehle verify karo</h3>
<p>Bharose par kabhi push mat karo. Files aur status padho:</p>
<pre class="code">cat edge.cfg
git status
git push origin main</pre>
<pre class="out">hostname DN-EDGE1
!
<span class="hl">ntp server 10.1.1.10</span>
!
access-list 10 remark NOC management hosts
<span class="hl">access-list 10 permit 10.99.0.0 0.0.0.255</span>
!
line vty 0 4
 access-class 10 in
!
<span class="hl">banner motd ^Authorised access only^</span>

On branch main
nothing to commit, working tree clean

   faf4702..429f01a  main -&gt; main</pre>
<p>Checklist: ACL 10.99.0.0 allow karta hai, banner bacha, NTP theek, <code>qos.cfg</code> nahi, syslog 10.20.0.5 par, status clean, push accept. Ticket ki har requirement poori.</p>

<h3>Common error messages aur unke matlab</h3>
<table class="cmp"><tr><th>Message</th><th>Matlab</th><th>Fix</th></tr><tr><td>fatal: not a git repository</td><td>aap tracked folder ke andar nahi ho</td><td>project mein cd karo, ya git init chalao</td></tr><tr><td>nothing to commit, working tree clean</td><td>save karne ke liye koi change nahi</td><td>pehle kuch edit ya stage karo</td></tr><tr><td>error: pathspec 'nosuch' did not match any file(s) known to git</td><td>branch ya file ka naam galat likha</td><td>git branch aur ls se check karo</td></tr><tr><td>merge: nosuch - not something we can merge</td><td>woh branch maujood nahi</td><td>git branch se spelling check karo</td></tr><tr><td>CONFLICT (content): Merge conflict in FILE</td><td>dono sides ne same lines badli</td><td>resolve, git add, git commit</td></tr><tr><td>error: Cannot delete branch X checked out</td><td>aap usi branch par khade ho</td><td>pehle doosri branch par jao</td></tr></table>
<p>Yeh lab host ke exact messages hain, isliye aap unhe labs mein pehchan loge.</p>

<h3>Jab atak jao</h3>
<ul><li>Phir <code>git status</code> chalao; woh hamesha agla sensible step batata hai.</li><li><code>git log --oneline</code> chalao aur apni expectation se compare karo.</li><li>Aadhe merge ke liye <code>git merge --abort</code> starting point wapas deta hai.</li><li><b>Reference (simulator mein nahi chalta):</b> asli machine par <code>git reflog</code> list karta hai ki HEAD kahan-kahan gaya aur reset se delete dikhne wala commit wapas la sakta hai.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein aap git checkout add-vlan3 (typo) type karte ho. Git jawab deta hai error: pathspec &#39;add-vlan3&#39; did not match any file(s) known to git. Loop: main kahan hoon (git branch add-vlan30 dikhata hai), kya galat hai (ek character kam), fix (dobara type). Kul kharch: das second, kyunki message problem ka naam batata hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Repository ki jagah device par haath se symptom theek karna: agla pipeline run repository version restore kar dega aur fix kho jaayega. Final file padhe bina push karna. Panic mein commands type karna: kisi bhi surprise ke baad ruko aur git status chalao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions history dete hain aur sahi undo poochte hain. Pushed aur baad ke achhe commits ke saath mila hua: revert. Adhoore kaam wali branch mein ek achha commit: cherry-pick. Shared history par reset --hard kabhi nahi.</p></div>

<div class="scn"><h4>Monday subah, red main</h4><p>Ek team ko shared server ki main par aisa commit mila jise koi explain nahi kar saka. Duty engineer ne loop use kiya. Status clean tha, log mein Saturday ka "tmp test" naam ka commit tha, show ne saabit kiya ki usne SNMP trap server line hata di thi. Commit pushed tha, isliye usne revert kiya, file padhi, push kiya, aur commit message mein note joda. Poori repair chaar minute mein hui, aur kisi ka kaam nahi khoya.</p><p><b>Lesson:</b> shaant, repeatable loop clever commands se behtar hai.</p></div>
<div class="iv"><p class="q">"Pushed commit ne production tod diya. Apne Git steps batao."</p><p>Main git status aur git log --oneline se dekhta hoon ki kahan hoon, phir suspect commit par git show se wajah confirm karta hoon. Kyunki woh pushed hai, main git revert use karta hoon taaki history rewrite na ho aur baad ke achhe commits bache rahein. File verify karne ke liye cat ya git diff chalata hoon, phir push. Agar doosri branch ka sirf hissa chahiye to cherry-pick; agar merge conflict ho to markers resolve, git add aur commit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Loop: main kahan, kya hua, sabse safe fix, verify, push.</li><li>Pushed commits revert se theek hote hain; messy branch ka ek commit cherry-pick se.</li><li>Push se pehle file padho; baad mein check karo git status clean hai.</li><li>Lab host ke error messages asli Git ke wording hain: unhe padhna seekho.</li><li>Problems repository mein theek karo, device par haath se nahi.</li></ul></div>

`}};export{e as default};