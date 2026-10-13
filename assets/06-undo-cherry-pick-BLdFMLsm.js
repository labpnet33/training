var e={id:`undo-cherry-pick`,h:{en:`Undoing safely: revert, reset and cherry-pick`,hi:`Safely undo karna: revert, reset aur cherry-pick`},body:{en:`

<p><b>One idea in this chapter:</b> in Git there are two very different ways to "go back", and choosing the wrong one on shared history causes real damage. You will learn when to use <code>revert</code>, when <code>reset</code> is acceptable, and how <code>cherry-pick</code> copies a single good commit.</p>

<h3>The situation (Lab 2)</h3>
<p>Deccan Net's repository has been pushed to the team server. Since the last push, the NOC cannot SSH to DN-EDGE1. From chapter 3 you know the culprit is <code>Tighten mgmt ACL</code>. But two good commits came after it: <code>Add login banner</code> and <code>Use backup syslog collector</code>. You want to remove only the bad one.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Revert undoes one old commit by adding a new opposite commit at the end."><line x1="40" y1="50" x2="600" y2="50" stroke="#64748b" stroke-width="2"/><circle cx="90" cy="50" r="13" fill="#bae6fd"/><circle cx="190" cy="50" r="13" fill="#fecaca"/><circle cx="290" cy="50" r="13" fill="#bae6fd"/><circle cx="390" cy="50" r="13" fill="#bae6fd"/><circle cx="520" cy="50" r="13" fill="#bbf7d0"/><text x="90" y="82" text-anchor="middle" class="svg-muted" font-size="11">Initial</text><text x="190" y="82" text-anchor="middle" class="svg-muted" font-size="11">Bad ACL</text><text x="290" y="82" text-anchor="middle" class="svg-muted" font-size="11">Banner</text><text x="390" y="82" text-anchor="middle" class="svg-muted" font-size="11">Syslog</text><text x="520" y="82" text-anchor="middle" class="svg-accent" font-size="11">Revert Bad ACL</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">revert adds one new commit. Nothing is erased; the later commits stay.</text></svg><p class="cap">Revert undoes one old commit by adding a new opposite commit at the end.</p></div>

<h3>git revert: the safe undo</h3>
<p><code>git revert HASH</code> creates a <b>new</b> commit that applies the opposite of an old commit. History is not rewritten, so teammates who already have the old commits are not disturbed. Use it for anything that has been <b>pushed or shared</b>. It is the Git version of typing <code>no shut</code> after a wrong <code>shut</code>: you do not pretend the mistake never happened; you record the correction.</p>
<pre class="code">git log --oneline
git revert HEAD~2
git log --oneline
cat edge.cfg</pre>
<pre class="out">faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs

[main 5344cc1] Revert "Tighten mgmt ACL"
 1 file(s) changed

5344cc1 (HEAD -&gt; main) Revert "Tighten mgmt ACL"
faf4702 Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs

hostname DN-EDGE1
!
ntp server 10.1.1.1
!
access-list 10 remark NOC management hosts
<span class="hl">access-list 10 permit 10.99.0.0 0.0.0.255</span>
!
line vty 0 4
 access-class 10 in
!
<span class="hl">banner motd ^Authorised access only^</span></pre>
<p><code>HEAD~2</code> pointed to the bad commit, so Git created <code>Revert "Tighten mgmt ACL"</code>. The permit line is back to 10.99.0.0, and the banner, added later, is still there. The original bad commit remains visible in history, which is exactly what an auditor wants.</p>

<h3>git reset: moving the branch backwards</h3>
<p><code>git reset --hard HASH</code> moves the branch label back to an older commit and discards everything after it, from the working files too. The commits after that point disappear from the branch, the good ones included. In the simulator:</p>
<pre class="code">git reset --hard HEAD~1
git log --oneline</pre>
<pre class="out"><span class="hl">HEAD is now at 7c80cc9 Add rest of files</span>
7c80cc9 (HEAD -&gt; feature-x) Add rest of files
4735c97 Add r1</pre>
<p>(That output comes from a practice branch with three commits, from which the newest was thrown away.) Use <code>reset --hard</code> only on <b>local work that nobody else has</b>, for example when you committed something by mistake five minutes ago and have not pushed. If a teammate already pulled the old commits, resetting makes your history disagree with theirs and creates a mess to untangle.</p>
<table class="cmp"><tr><th></th><th>git revert</th><th>git reset --hard</th></tr><tr><td>What it does</td><td>adds a new commit that cancels an old one</td><td>moves the branch back, deleting later commits</td></tr><tr><td>History</td><td>kept, nothing lost</td><td>rewritten</td></tr><tr><td>Safe for pushed commits</td><td>yes</td><td>no</td></tr><tr><td>Can undo one commit in the middle</td><td>yes</td><td>no, it drops everything after</td></tr></table>
<p>Two other forms exist: <code>git reset --soft</code> keeps your changes staged and <code>git reset</code> (mixed) keeps them unstaged. They are used to redo a local commit; for the exam, remember that <code>--hard</code> is the one that destroys work.</p>

<h3>git cherry-pick: copy one commit</h3>
<p>Sometimes a branch contains one ready fix and some unfinished work. In Lab 2, branch <code>hotfix-ntp</code> has a half-written QoS draft first and then, on top, the real NTP fix:</p>
<pre class="code">git log --oneline hotfix-ntp
git show hotfix-ntp</pre>
<pre class="out">afed562 (hotfix-ntp) Fix NTP server address
5587a6a WIP: draft WAN QoS policy (not ready)
661a103 Initial import of edge configs

commit afed5629fc9e71
Author: netops &lt;netops@nk.lab&gt;

    Fix NTP server address

diff --git a/edge.cfg b/edge.cfg
--- a/edge.cfg
+++ b/edge.cfg
@@ -1,11 +1,11 @@
 hostname DN-EDGE1
 !
<span class="hl">-ntp server 10.1.1.1</span>
<span class="hl">+ntp server 10.1.1.10</span>
 !
 access-list 10 remark NOC management hosts</pre>
<p>A normal merge would bring the WIP commit and <code>qos.cfg</code> into main. You want only the fix. <code>git show hotfix-ntp</code> names the newest commit on that branch. Now copy it onto main:</p>
<pre class="code">git checkout main
git cherry-pick hotfix-ntp
cat edge.cfg
ls</pre>
<pre class="out">[main 429f01a] Fix NTP server address
 1 file(s) changed

hostname DN-EDGE1
!
<span class="hl">ntp server 10.1.1.10</span>
!
access-list 10 remark NOC management hosts
access-list 10 permit 10.99.0.0 0.0.0.255
!
line vty 0 4
 access-class 10 in
!
banner motd ^Authorised access only^

edge.cfg  syslog.cfg</pre>
<p>The NTP line changed, the banner and ACL are intact, and there is no <code>qos.cfg</code> in the listing. The copy is a <b>new commit</b> with a new hash (<code>429f01a</code>), made from the same change. Cherry-pick is a precision tool: use it for hotfixes, not as a replacement for merge.</p>

<h3>A safe habit: look before you undo</h3>
<ul><li>Run <code>git status</code>. A dirty working tree plus reset --hard equals lost edits.</li><li>Read the commit with <code>git show</code> before you revert it.</li><li>After the revert, read the file (<code>cat</code>) and confirm the line is what you expect.</li><li><b>Reference (not run in the simulator):</b> real Git keeps a private diary of where HEAD has been, <code>git reflog</code>, which can rescue a commit lost to reset on your own machine. Never rely on it for pushed work.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 2, tasks 2 and 4. Revert HEAD~2 (the bad ACL), check that edge.cfg allows 10.99.0.0 and still has the banner. Then cherry-pick hotfix-ntp so main gets the NTP fix with no qos.cfg. Neither action rewrites history, so the later push is accepted by the server.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Using reset --hard on commits already pushed. Reverting a merge commit without telling Git which parent to keep (real Git asks for -m 1). Cherry-picking a commit that depends on an earlier unmerged one, which can fail or give odd results. Expecting revert to delete the old commit from history; it does not.</p></div>
<div class="exam"><p><b>Exam trap.</b> For pushed, shared history the correct undo is git revert. reset --hard rewrites history and is for local work. cherry-pick copies one commit and creates a new commit with a new hash.</p></div>

<div class="scn"><h4>The reset that erased a colleague</h4><p>An engineer saw a bad commit at the top of the shared main branch, ran git reset --hard HEAD~1 and force-pushed. Unfortunately a teammate had committed a good change on top of it ten minutes earlier. The reset removed that change from the server, and the teammate later pushed his copy back by accident and re-introduced the bad commit. The team adopted a rule: shared branches are only corrected with revert, and force pushes are blocked on main.</p><p><b>Lesson:</b> rewriting shared history surprises everyone who already has it; add a correcting commit instead.</p></div>
<div class="iv"><p class="q">"When would you use git revert instead of git reset?"</p><p>Revert for anything already pushed or shared, because it adds a new commit that cancels the old one and leaves history intact, and it can undo one commit from the middle while keeping later commits. Reset --hard only for private local commits, because it rewrites history and discards work. I would also mention cherry-pick for taking a single fix from another branch.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git revert HASH adds a new opposite commit; safe for pushed history.</li><li>git reset --hard moves the branch back and deletes later commits; local work only.</li><li>HEAD~2 names the commit two before the newest; read it with git show before reverting.</li><li>git cherry-pick copies one chosen commit onto your branch as a new commit.</li><li>Cherry-pick is for single hotfixes; merge is for bringing a whole branch.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> Git mein "wapas jaane" ke do bilkul alag tareeke hain, aur shared history par galat tareeka chunne se asli nuksaan hota hai. Aap seekhoge ki <code>revert</code> kab, <code>reset</code> kab theek hai, aur <code>cherry-pick</code> ek achhe commit ko kaise copy karta hai.</p>

<h3>Situation (Lab 2)</h3>
<p>Deccan Net ki repository team server par push ho chuki hai. Last push ke baad NOC DN-EDGE1 par SSH nahi kar pa raha. Chapter 3 se aap jaante ho ki culprit <code>Tighten mgmt ACL</code> hai. Par uske baad do achhe commits aaye: <code>Add login banner</code> aur <code>Use backup syslog collector</code>. Aap sirf kharab wala hatana chahte ho.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Revert ek purane commit ko end mein naya ulta commit jodkar undo karta hai."><line x1="40" y1="50" x2="600" y2="50" stroke="#64748b" stroke-width="2"/><circle cx="90" cy="50" r="13" fill="#bae6fd"/><circle cx="190" cy="50" r="13" fill="#fecaca"/><circle cx="290" cy="50" r="13" fill="#bae6fd"/><circle cx="390" cy="50" r="13" fill="#bae6fd"/><circle cx="520" cy="50" r="13" fill="#bbf7d0"/><text x="90" y="82" text-anchor="middle" class="svg-muted" font-size="11">Initial</text><text x="190" y="82" text-anchor="middle" class="svg-muted" font-size="11">Bad ACL</text><text x="290" y="82" text-anchor="middle" class="svg-muted" font-size="11">Banner</text><text x="390" y="82" text-anchor="middle" class="svg-muted" font-size="11">Syslog</text><text x="520" y="82" text-anchor="middle" class="svg-accent" font-size="11">Revert Bad ACL</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">revert ek naya commit jodta hai. Kuch mitta nahi; baad ke commits bache rehte hain.</text></svg><p class="cap">Revert undoes one old commit by adding a new opposite commit at the end.</p></div>

<h3>git revert: safe undo</h3>
<p><code>git revert HASH</code> ek <b>naya</b> commit banata hai jo purane commit ka ulta apply karta hai. History rewrite nahi hoti, isliye jin teammates ke paas purane commits pehle se hain unhe takleef nahi hoti. Jo bhi <b>push ya share</b> ho chuka ho uspe yahi use karo. Yeh Git ka woh tareeka hai jaise galat <code>shut</code> ke baad <code>no shut</code> type karna: aap nahi dikhate ki galti hui hi nahi; aap correction record karte ho.</p>
<pre class="code">git log --oneline
git revert HEAD~2
git log --oneline
cat edge.cfg</pre>
<pre class="out">faf4702 (HEAD -&gt; main) Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs

[main 5344cc1] Revert "Tighten mgmt ACL"
 1 file(s) changed

5344cc1 (HEAD -&gt; main) Revert "Tighten mgmt ACL"
faf4702 Use backup syslog collector
e349603 Add login banner
89822dc Tighten mgmt ACL
661a103 Initial import of edge configs

hostname DN-EDGE1
!
ntp server 10.1.1.1
!
access-list 10 remark NOC management hosts
<span class="hl">access-list 10 permit 10.99.0.0 0.0.0.255</span>
!
line vty 0 4
 access-class 10 in
!
<span class="hl">banner motd ^Authorised access only^</span></pre>
<p><code>HEAD~2</code> kharab commit ko point karta tha, isliye Git ne <code>Revert "Tighten mgmt ACL"</code> banaya. Permit line wapas 10.99.0.0 ho gayi, aur baad mein jodi gayi banner abhi bhi hai. Asli kharab commit history mein dikhta rehta hai, aur auditor yehi chahta hai.</p>

<h3>git reset: branch ko peeche le jaana</h3>
<p><code>git reset --hard HASH</code> branch label ko purane commit par wapas le jaata hai aur uske baad ka sab kuch phenk deta hai, working files se bhi. Us point ke baad ke commits branch se gayab ho jaate hain, achhe wale bhi. Simulator mein:</p>
<pre class="code">git reset --hard HEAD~1
git log --oneline</pre>
<pre class="out"><span class="hl">HEAD is now at 7c80cc9 Add rest of files</span>
7c80cc9 (HEAD -&gt; feature-x) Add rest of files
4735c97 Add r1</pre>
<p>(Yeh output ek practice branch se hai jisme teen commits the, aur sabse naya phenk diya gaya.) <code>reset --hard</code> sirf <b>local kaam par use karo jo kisi aur ke paas nahi</b>, jaise paanch minute pehle galti se commit kiya aur push nahi kiya. Agar teammate ne purane commits pehle hi pull kar liye hain, to reset aapki history ko unki history se alag kar deta hai aur suljhane ke liye jhanjhat banata hai.</p>
<table class="cmp"><tr><th></th><th>git revert</th><th>git reset --hard</th></tr><tr><td>Kya karta hai</td><td>naya commit jodta hai jo purane ko cancel karta hai</td><td>branch peeche le jaata hai, baad ke commits delete karta hai</td></tr><tr><td>History</td><td>bachi rehti hai, kuch khota nahi</td><td>rewrite hoti hai</td></tr><tr><td>Pushed commits ke liye safe</td><td>haan</td><td>nahi</td></tr><tr><td>Beech ka ek commit undo kar sakta hai</td><td>haan</td><td>nahi, uske baad ka sab hata deta hai</td></tr></table>
<p>Do aur forms hain: <code>git reset --soft</code> aapke changes staged rakhta hai aur <code>git reset</code> (mixed) unstaged rakhta hai. Inhe local commit dobara banane ke liye use karte hain; exam ke liye yaad rakho ki kaam ko tabaah karne wala <code>--hard</code> hai.</p>

<h3>git cherry-pick: ek commit copy karo</h3>
<p>Kabhi branch mein ek ready fix aur kuch adhoora kaam hota hai. Lab 2 mein branch <code>hotfix-ntp</code> mein pehle adhoora QoS draft hai aur uske upar asli NTP fix:</p>
<pre class="code">git log --oneline hotfix-ntp
git show hotfix-ntp</pre>
<pre class="out">afed562 (hotfix-ntp) Fix NTP server address
5587a6a WIP: draft WAN QoS policy (not ready)
661a103 Initial import of edge configs

commit afed5629fc9e71
Author: netops &lt;netops@nk.lab&gt;

    Fix NTP server address

diff --git a/edge.cfg b/edge.cfg
--- a/edge.cfg
+++ b/edge.cfg
@@ -1,11 +1,11 @@
 hostname DN-EDGE1
 !
<span class="hl">-ntp server 10.1.1.1</span>
<span class="hl">+ntp server 10.1.1.10</span>
 !
 access-list 10 remark NOC management hosts</pre>
<p>Normal merge WIP commit aur <code>qos.cfg</code> ko main mein le aata. Aapko sirf fix chahiye. <code>git show hotfix-ntp</code> us branch ke sabse naye commit ko naam se bulata hai. Ab use main par copy karo:</p>
<pre class="code">git checkout main
git cherry-pick hotfix-ntp
cat edge.cfg
ls</pre>
<pre class="out">[main 429f01a] Fix NTP server address
 1 file(s) changed

hostname DN-EDGE1
!
<span class="hl">ntp server 10.1.1.10</span>
!
access-list 10 remark NOC management hosts
access-list 10 permit 10.99.0.0 0.0.0.255
!
line vty 0 4
 access-class 10 in
!
banner motd ^Authorised access only^

edge.cfg  syslog.cfg</pre>
<p>NTP line badal gayi, banner aur ACL intact hain, aur listing mein <code>qos.cfg</code> nahi hai. Copy ek <b>naya commit</b> hai naye hash (<code>429f01a</code>) ke saath, usi change se bana. Cherry-pick precision tool hai: hotfixes ke liye use karo, merge ki jagah nahi.</p>

<h3>Safe aadat: undo se pehle dekho</h3>
<ul><li><code>git status</code> chalao. Dirty working tree aur reset --hard ka matlab edits ka khona.</li><li>Revert karne se pehle commit ko <code>git show</code> se padho.</li><li>Revert ke baad file (<code>cat</code>) padho aur confirm karo ki line waisi hai jaisi expect thi.</li><li><b>Reference (simulator mein nahi chalta):</b> asli Git mein <code>git reflog</code> ek private diary hai jo yaad rakhti hai HEAD kahan-kahan gaya, aur apni machine par reset se khoye commit ko bachaa sakti hai. Pushed kaam ke liye uspar bharosa mat karo.</li></ul>

<div class="eg"><p><b>Worked example.</b> Lab 2, tasks 2 aur 4. HEAD~2 (kharab ACL) revert karo, check karo ki edge.cfg 10.99.0.0 allow karta hai aur banner abhi bhi hai. Phir hotfix-ntp cherry-pick karo taaki main ko NTP fix mile aur qos.cfg na aaye. Dono actions history rewrite nahi karte, isliye baad ka push server accept kar leta hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Pehle se pushed commits par reset --hard use karna. Merge commit ko revert karna bina Git ko batae ki kaun sa parent rakhna hai (asli Git -m 1 maangta hai). Aise commit ko cherry-pick karna jo pehle ke unmerged commit par depend karta ho, jo fail ho sakta hai ya ajeeb result de sakta hai. Yeh sochna ki revert purane commit ko history se delete kar deta hai; woh nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pushed, shared history ke liye sahi undo git revert hai. reset --hard history rewrite karta hai aur local kaam ke liye hai. cherry-pick ek commit copy karta hai aur naye hash ke saath naya commit banata hai.</p></div>

<div class="scn"><h4>Jis reset ne colleague ko mita diya</h4><p>Ek engineer ne shared main branch ke top par kharab commit dekha, git reset --hard HEAD~1 chalaya aur force-push kar diya. Durbhagyavash ek teammate ne das minute pehle uske upar achha change commit kiya tha. Reset ne woh change server se hata diya, aur teammate ne baad mein galti se apni copy wapas push kar di aur kharab commit dobara aa gaya. Team ne rule banaya: shared branches sirf revert se theek hongi, aur main par force push block hoga.</p><p><b>Lesson:</b> shared history rewrite karna un sabko hairaan karta hai jinke paas pehle se woh hai; uski jagah correcting commit jodo.</p></div>
<div class="iv"><p class="q">"git revert kab use karoge aur git reset kab?"</p><p>Revert un sab cheezon ke liye jo pushed ya shared hain, kyunki woh naya commit jodta hai jo purane ko cancel karta hai, history intact rakhta hai, aur beech ka ek commit undo karte hue baad ke commits rakh sakta hai. Reset --hard sirf private local commits ke liye, kyunki woh history rewrite karta hai aur kaam phenk deta hai. Doosri branch se ek fix lene ke liye cherry-pick ka bhi zikr karunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git revert HASH naya ulta commit jodta hai; pushed history ke liye safe.</li><li>git reset --hard branch peeche le jaata hai aur baad ke commits delete karta hai; sirf local kaam ke liye.</li><li>HEAD~2 sabse naye se do pehle wala commit hai; revert se pehle git show se padho.</li><li>git cherry-pick chuna hua ek commit aapki branch par naye commit ke roop mein copy karta hai.</li><li>Cherry-pick single hotfix ke liye hai; poori branch laane ke liye merge.</li></ul></div>

`}};export{e as default};