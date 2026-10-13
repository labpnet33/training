var e={id:`first-repo`,h:{en:`Your first repository: init, status, add, commit`,hi:`Aapki pehli repository: init, status, add, commit`},body:{en:`

<p><b>One idea in this chapter:</b> a commit is a saved snapshot, and you choose what goes into it. Think of packing a parcel: you put items on a table (edit), place the ones you want in a box (stage), then seal and label the box (commit).</p>

<h3>Four words to learn first</h3>
<ul><li><b>Repository (repo)</b>: a folder whose history Git tracks. Git keeps its records in a hidden place inside that folder.</li><li><b>Working tree</b>: the files exactly as they are on disk right now. This is where you edit.</li><li><b>Staging area</b> (also called the index): a "ready to save" list. <code>git add</code> puts a file on it.</li><li><b>Commit</b>: one saved snapshot of everything on the staging list, with a message. Git gives each commit a short ID called a <b>hash</b>, such as <code>194527b</code>.</li></ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Three places a change passes through. Two commands move it forward."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Working tree</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">files you edit</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">git add</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Staging area</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">ready list</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">git commit</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">Repository</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">saved history</text></svg><p class="cap">Three places a change passes through. Two commands move it forward.</p></div>

<h3>Step 1: turn the folder into a repository</h3>
<p>You start with a folder of three loose files from Kaveri Foods. <code>git init</code> means "start tracking this folder". You do it once per project.</p>
<pre class="code">git init
git status</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/

On branch main

No commits yet

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	r1.cfg
	r2.cfg
	vlans.yml</pre>
<p>The first command prints <code>Initialized empty Git repository</code>. The second, <code>git status</code>, is the command you will type most often: it tells you the current <b>branch</b> (here <code>main</code>, the default line of work), whether there are commits, and which files Git is not tracking yet. <b>Untracked</b> means Git sees the file but has never recorded it.</p>

<h3>Step 2: stage, then commit</h3>
<pre class="code">git add .
git commit -m "Initial import of configs"</pre>
<p><code>git add .</code> stages every file in the folder (the dot means "here"). You can also stage one file: <code>git add r1.cfg</code>. <code>git commit</code> saves what is staged; <code>-m</code> gives the message on the same line. Without <code>-m</code> Git opens a text editor, which the simulator does not.</p>
<pre class="out">[main (root-commit) 194527b] Initial import of configs
 3 files changed</pre>
<p><code>root-commit</code> tells you this is the very first commit. The value <code>194527b</code> is its hash. Your hash will differ from the book; hashes depend on content and time. After this, <code>git status</code> says the tree is clean:</p>
<pre class="out">On branch main
nothing to commit, working tree clean</pre>

<h3>Step 3: the everyday loop</h3>
<p>From now on every change follows <b>edit, status, add, commit</b>. Here is the loop on Kaveri's r1.cfg. First we append a line (<code>echo "text" &gt;&gt; file</code> adds a line to the end of a file), then watch status change as we move the file through the three places:</p>
<pre class="code">echo "ntp server 10.1.1.2" &gt;&gt; r1.cfg
git status
git add r1.cfg
git status
git commit -m "Add second NTP server"</pre>
<pre class="out">On branch main

<span class="hl">Changes not staged for commit:</span>
	modified:   r1.cfg

On branch main

<span class="hl">Changes to be committed:</span>
	modified:   r1.cfg

[main 6ac4cb6] Add second NTP server
 1 file changed</pre>
<p>Read the two status blocks. <b>Changes not staged for commit</b> means the file is edited in the working tree only. <b>Changes to be committed</b> means it is on the staging list and will go into the next commit. This split is useful: if you edited three files but only two belong to one idea, stage those two, commit, and commit the third separately.</p>
<p>A shortcut exists: <code>git commit -am "message"</code> stages every <i>already tracked</i> file and commits in one go. It does not pick up brand-new files, so use <code>git add</code> for those.</p>

<h3>Writing a good message</h3>
<p>A message answers <b>what and why</b> in one short line. "Move NTP to 10.1.1.10" is good. "update" and "fix" are useless six months later. A reader should understand the change without opening the files.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 4. The NTP server moves to 10.1.1.10. You change r1.cfg and r2.cfg with one sed command each, run git status (both files show as modified), run git diff to read the change, then git add r1.cfg r2.cfg and git commit -m "Move NTP to 10.1.1.10". One idea, one commit, two files.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Running git add but forgetting git commit (the change is staged, not saved). Running git commit when nothing is staged: Git answers "nothing to commit, working tree clean". Committing a file that holds a real password. Once committed, a secret lives in the history forever; chapter 7 shows how to keep secrets out.</p></div>
<div class="exam"><p><b>Exam trap.</b> git add does not save anything permanently; it only stages. Only git commit records a snapshot. Also, git commit -a skips untracked files.</p></div>

<div class="scn"><h4>Three files, one commit, no argument</h4><p>A junior changed an interface description on 12 switches and also, in the same sitting, fixed a typo in a banner. He committed everything together with the message "changes". Two weeks later the banner fix had to be rolled back because legal reworded it, but the commit also held the 12 descriptions, so he could not undo it cleanly. The senior engineer taught him to stage files separately so each commit holds one idea.</p><p><b>Lesson:</b> small, single-purpose commits can be undone or reviewed alone; mixed commits cannot.</p></div>
<div class="iv"><p class="q">"What is the difference between git add and git commit?"</p><p>git add moves changes from the working tree to the staging area, so you choose exactly what the next snapshot contains. git commit then records everything staged as a permanent snapshot with a message and a hash. Mention git status to see which stage a file is in, and that git commit -am skips new files.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git init starts tracking a folder; git status shows branch, staged, unstaged and untracked files.</li><li>Files move working tree, then staging area (git add), then repository (git commit).</li><li>A commit has a message and a short hash; keep each commit to one idea.</li><li>git commit -am stages tracked files only, never new ones.</li><li>A clean tree reads: nothing to commit, working tree clean.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> commit ek saved snapshot hai, aur aap chunte ho ki usme kya jaaye. Parcel pack karne jaisa socho: saamaan table par rakhte ho (edit), jo chahiye woh box mein daalte ho (stage), phir box seal karke label lagate ho (commit).</p>

<h3>Pehle chaar words seekho</h3>
<ul><li><b>Repository (repo)</b>: ek folder jiski history Git track karta hai. Git apna record us folder ke andar ek hidden jagah rakhta hai.</li><li><b>Working tree</b>: files jaisi abhi disk par hain. Yahin aap edit karte ho.</li><li><b>Staging area</b> (index bhi kehte hain): "save karne ke liye ready" list. <code>git add</code> file ko usme daalta hai.</li><li><b>Commit</b>: staging list ki sab cheezon ka ek saved snapshot, message ke saath. Git har commit ko ek chhota ID deta hai jise <b>hash</b> kehte hain, jaise <code>194527b</code>.</li></ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Change teen jagah se guzarta hai. Do commands use aage badhate hain."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Working tree</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">edit hone wali files</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">git add</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Staging area</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">ready list</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">git commit</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">Repository</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">saved history</text></svg><p class="cap">Change teen jagah se guzarta hai. Do commands use aage badhate hain.</p></div>

<h3>Step 1: folder ko repository banao</h3>
<p>Aapke paas Kaveri Foods ki teen alag files ka folder hai. <code>git init</code> ka matlab "is folder ko track karna shuru karo". Yeh har project mein ek baar karte hain.</p>
<pre class="code">git init
git status</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/

On branch main

No commits yet

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	r1.cfg
	r2.cfg
	vlans.yml</pre>
<p>Pehla command <code>Initialized empty Git repository</code> print karta hai. Doosra, <code>git status</code>, woh command hai jo aap sabse zyada type karoge: yeh current <b>branch</b> batata hai (yahan <code>main</code>, kaam ki default line), commits hain ya nahi, aur kaun si files Git abhi track nahi kar raha. <b>Untracked</b> ka matlab Git file dekhta hai par usne use kabhi record nahi kiya.</p>

<h3>Step 2: stage karo, phir commit</h3>
<pre class="code">git add .
git commit -m "Initial import of configs"</pre>
<p><code>git add .</code> folder ki har file stage karta hai (dot ka matlab "yahan"). Ek file bhi stage kar sakte ho: <code>git add r1.cfg</code>. <code>git commit</code> jo staged hai use save karta hai; <code>-m</code> usi line mein message deta hai. <code>-m</code> ke bina Git text editor kholta hai, jo simulator mein nahi hai.</p>
<pre class="out">[main (root-commit) 194527b] Initial import of configs
 3 files changed</pre>
<p><code>root-commit</code> batata hai ki yeh sabse pehla commit hai. <code>194527b</code> uska hash hai. Aapka hash book se alag hoga; hash content aur time par depend karta hai. Iske baad <code>git status</code> kehta hai ki tree clean hai:</p>
<pre class="out">On branch main
nothing to commit, working tree clean</pre>

<h3>Step 3: roz ka loop</h3>
<p>Ab se har change <b>edit, status, add, commit</b> follow karta hai. Kaveri ki r1.cfg par yeh loop dekho. Pehle ek line jodte hain (<code>echo "text" &gt;&gt; file</code> file ke end mein line jodta hai), phir dekhte hain ki file teen jagahon se guzarte hue status kaise badalta hai:</p>
<pre class="code">echo "ntp server 10.1.1.2" &gt;&gt; r1.cfg
git status
git add r1.cfg
git status
git commit -m "Add second NTP server"</pre>
<pre class="out">On branch main

<span class="hl">Changes not staged for commit:</span>
	modified:   r1.cfg

On branch main

<span class="hl">Changes to be committed:</span>
	modified:   r1.cfg

[main 6ac4cb6] Add second NTP server
 1 file changed</pre>
<p>Dono status blocks padho. <b>Changes not staged for commit</b> ka matlab file sirf working tree mein edit hui hai. <b>Changes to be committed</b> ka matlab woh staging list par hai aur agle commit mein jaayegi. Yeh split kaam ka hai: agar aapne teen files edit ki par sirf do ek idea ki hain, to wohi do stage karo, commit karo, aur teesri alag se commit karo.</p>
<p>Ek shortcut hai: <code>git commit -am "message"</code> har <i>pehle se tracked</i> file ko stage karke ek hi baar mein commit kar deta hai. Yeh bilkul nayi files nahi uthata, isliye unke liye <code>git add</code> use karo.</p>

<h3>Achha message likhna</h3>
<p>Message ek chhoti line mein <b>kya aur kyun</b> batata hai. "Move NTP to 10.1.1.10" achha hai. "update" aur "fix" chhe mahine baad bekaar hain. Padhne wale ko files kholne se pehle change samajh aa jaana chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Lab 1, task 4. NTP server 10.1.1.10 par shift ho raha hai. Aap r1.cfg aur r2.cfg ko ek-ek sed command se badalte ho, git status chalate ho (dono files modified dikhti hain), git diff se change padhte ho, phir git add r1.cfg r2.cfg aur git commit -m "Move NTP to 10.1.1.10". Ek idea, ek commit, do files.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> git add chalana par git commit bhool jaana (change staged hai, saved nahi). Kuch staged na ho aur git commit chalana: Git kehta hai "nothing to commit, working tree clean". Asli password wali file commit kar dena. Ek baar commit hone ke baad secret history mein hamesha rehta hai; chapter 7 dikhata hai ki secrets ko bahar kaise rakhein.</p></div>
<div class="exam"><p><b>Exam trap.</b> git add kuch permanently save nahi karta; woh sirf stage karta hai. Sirf git commit snapshot record karta hai. Aur git commit -a untracked files ko skip karta hai.</p></div>

<div class="scn"><h4>Teen files, ek commit, koi bahas nahi</h4><p>Ek junior ne 12 switches par interface description badla aur usi sitting mein banner ka typo bhi theek kiya. Usne sab kuch ek saath "changes" message se commit kar diya. Do hafte baad banner fix wapas lena pada kyunki legal ne wording badal di, par commit mein 12 descriptions bhi the, isliye woh use saaf tareeke se undo nahi kar saka. Senior engineer ne use files alag-alag stage karna sikhaya taaki har commit mein ek hi idea ho.</p><p><b>Lesson:</b> chhote, single-purpose commits akele undo ya review ho sakte hain; mixed commits nahi.</p></div>
<div class="iv"><p class="q">"git add aur git commit mein kya difference hai?"</p><p>git add changes ko working tree se staging area mein le jaata hai, taaki aap exactly chuno ki agle snapshot mein kya ho. git commit phir jo staged hai use message aur hash ke saath permanent snapshot bana deta hai. git status ka zikr karo jo batata hai file kis stage mein hai, aur yeh ki git commit -am nayi files skip karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>git init folder ko track karna shuru karta hai; git status branch, staged, unstaged aur untracked files dikhata hai.</li><li>Files working tree se staging area (git add) aur phir repository (git commit) mein jaati hain.</li><li>Commit ka message aur chhota hash hota hai; har commit mein ek hi idea rakho.</li><li>git commit -am sirf tracked files stage karta hai, nayi files nahi.</li><li>Clean tree ka message: nothing to commit, working tree clean.</li></ul></div>

`}};export{e as default};