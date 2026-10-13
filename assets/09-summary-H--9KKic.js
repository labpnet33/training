var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You now have the survival kit of Linux.</b> You can log in, know where you are, move around, read files, create, copy, move and delete safely, act on many files with wildcards, and find a file or a piece of text among hundreds. These skills are used in every other Linux module, so this chapter is a checklist you can come back to.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Navigate</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">pwd  cd  ls  paths</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">/etc  /var/log  ~</text>
<rect x="225" y="20" width="190" height="110" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Change</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">mkdir touch cp mv rm</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">wildcards, quotes</text>
<rect x="440" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Find</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">find (names)</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">grep -r (content)</text>
</svg><p class="cap">Navigate, change, find: the three skills of this module.</p></div>

<h3>Can-do checklist</h3>
<p>Tick each one only if you can do it without looking:</p>
<ul>
<li>Read the prompt and say user, host, current directory, and whether it is root.</li>
<li>Explain absolute versus relative paths, and use <code>.</code>, <code>..</code>, <code>~</code> and <code>cd -</code>.</li>
<li>Name what lives in <code>/etc</code>, <code>/var/log</code>, <code>/home</code>, <code>/srv</code> and <code>/tmp</code>.</li>
<li>Use <code>ls -la</code> and read every column of <code>ls -l</code>, including the type letter.</li>
<li>Print a small file with <code>cat</code>, page a big one with <code>less</code>, and identify it with <code>file</code> and <code>stat</code>.</li>
<li>Create directory chains with <code>mkdir -p</code>, copy trees with <code>cp -r</code>, and move or rename with <code>mv</code>.</li>
<li>Delete safely: preview with <code>ls</code>, then <code>rm</code>; know there is no recycle bin.</li>
<li>Use <code>*</code>, <code>?</code>, <code>[ ]</code> and <code>{ }</code>, and say who expands them (the shell).</li>
<li>Quote names with spaces; tell double from single quotes; read <code>$HOME</code> and <code>$PATH</code>.</li>
<li>Choose <code>find</code> for names and <code>grep -r</code> for content, and use <code>-iname</code>, <code>-type</code>, <code>-l</code>, <code>-n</code>, <code>-c</code>.</li>
<li>Follow the six-step routine and keep the original as evidence.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Shell / bash</dt><dd>The program that reads your commands and runs them.</dd>
<dt>Root directory <code>/</code></dt><dd>The top of the one directory tree. Not the same as the root user's home, <code>/root</code>.</dd>
<dt>Home directory <code>~</code></dt><dd>Your personal directory, such as <code>/home/netadmin</code>.</dd>
<dt>Absolute / relative path</dt><dd>Starts with <code>/</code> / starts from the current directory.</dd>
<dt>Hidden file</dt><dd>A name starting with a dot, shown only with <code>ls -a</code>.</dd>
<dt>Wildcard (glob)</dt><dd>A pattern such as <code>*.cfg</code> that the shell expands into file names.</dd>
<dt>Recursive (<code>-r</code>)</dt><dd>Act on a directory and everything inside it.</dd>
<dt>Exit status</dt><dd>0 for success, non-zero for failure; shown by <code>$?</code>.</dd>
<dt>PATH</dt><dd>List of directories searched for commands.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Show hidden files</td><td><code>ls -a</code> (or <code>-la</code>)</td></tr>
<tr><td>Rename a file</td><td><code>mv old new</code></td></tr>
<tr><td>Copy a directory</td><td><code>cp -r src dst</code></td></tr>
<tr><td>Create nested directories</td><td><code>mkdir -p a/b/c</code></td></tr>
<tr><td>File name search, any case</td><td><code>find / -iname "*x*"</code></td></tr>
<tr><td>Which file contains text</td><td><code>grep -rl "text" dir</code></td></tr>
<tr><td>Where am I</td><td><code>pwd</code></td></tr>
<tr><td>Is it recoverable after rm</td><td>No: there is no recycle bin</td></tr>
<tr><td>Who expands wildcards</td><td>The shell, before the command runs</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">pwd; whoami; hostname           # where, who, which server
ls -la  /  ls -lh  /  ls -ld    # list, hidden, readable sizes, directory itself
cd /path  /  cd ..  /  cd  /  cd -
cat f  /  less f  /  file f  /  stat f
mkdir -p a/b  /  touch f  /  cp -r a b  /  mv a b  /  rm f  /  rm -r d
find /srv -iname "*hyd*" -type f
grep -rn "10.40.9.1" /srv/configs
man cmd  /  which cmd  /  type cmd  /  history</pre>

<div class="warn"><p><b>Last reminder.</b> The dangerous commands are the ones that delete or overwrite: <code>rm</code>, <code>mv</code>, <code>cp</code> over an existing file, and redirection with <code>&gt;</code>. Preview, copy, then act. And always read the hostname in the prompt.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> Case-sensitivity (<code>-name</code> versus <code>-iname</code>, <code>File</code> versus <code>file</code>); <code>find</code> is not <code>grep</code>; <code>mv</code> renames; <code>cp</code> needs <code>-r</code> for directories; <code>/</code> is not <code>/root</code>; the shell, not the command, expands wildcards.</p></div>

<div class="scn"><h4>The new joiner's first week</h4><p>A new NOC engineer with no Linux background was given this module and the two labs on Monday. By Wednesday she could navigate the jump host, by Thursday she answered a duplicate-IP ticket with one <code>grep -rn</code>, and on Friday she was asked to organise a backup folder. She used the habit "preview, copy, act" and never lost a file.</p><p><b>Lesson:</b> a dozen commands and two habits cover most of everyday Linux work.</p></div>

<div class="iv"><p class="q">"Describe your Linux comfort level for a network engineer role."</p><p>I can navigate and read the file system, search names and content with <code>find</code> and <code>grep -r</code>, handle files safely with <code>cp</code>, <code>mv</code>, <code>rm</code> and wildcards, and I always check my server and path first. Then say what you are building next: pipes and log analysis, and users, permissions and sudo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Navigate with <code>pwd</code>, <code>cd</code>, <code>ls</code>; know the key directories.</li>
<li>Change with <code>mkdir</code>, <code>cp</code>, <code>mv</code>, <code>rm</code>; there is no undo.</li>
<li>Find names with <code>find</code>, text with <code>grep -r</code>.</li>
<li>The shell expands wildcards and variables; quote what must stay literal.</li>
<li>Next: lx-text (pipes and logs), then lx-users (permissions and sudo).</li>
</ul></div>
`,hi:`
<p><b>Ab aapke paas Linux ka survival kit hai.</b> Aap login kar sakte ho, jaante ho kahan ho, ghoom sakte ho, files padh sakte ho, safely create, copy, move aur delete kar sakte ho, wildcards se bahut files par kaam kar sakte ho, aur saikdon mein se file ya text dhoondh sakte ho. Yeh skills har doosre Linux module mein kaam aati hain, isliye yeh chapter ek checklist hai jis par aap wapas aa sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Navigate</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">pwd  cd  ls  paths</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">/etc  /var/log  ~</text>
<rect x="225" y="20" width="190" height="110" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Change</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">mkdir touch cp mv rm</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">wildcards, quotes</text>
<rect x="440" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Find</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">find (names)</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">grep -r (content)</text>
</svg><p class="cap">Navigate, change, find: is module ki teen skills.</p></div>

<h3>Can-do checklist</h3>
<p>Har ek tabhi tick karo jab bina dekhe kar sako:</p>
<ul>
<li>Prompt padhkar user, host, current directory batao, aur yeh bhi ki root hai ya nahi.</li>
<li>Absolute versus relative paths samjhao, aur <code>.</code>, <code>..</code>, <code>~</code> aur <code>cd -</code> use karo.</li>
<li><code>/etc</code>, <code>/var/log</code>, <code>/home</code>, <code>/srv</code> aur <code>/tmp</code> mein kya rehta hai batao.</li>
<li><code>ls -la</code> use karo aur <code>ls -l</code> ka har column padho, type letter samet.</li>
<li>Chhoti file <code>cat</code> se print karo, badi <code>less</code> se page karo, aur <code>file</code> aur <code>stat</code> se pehchano.</li>
<li><code>mkdir -p</code> se directory chains banao, <code>cp -r</code> se trees copy karo, aur <code>mv</code> se move ya rename karo.</li>
<li>Safely delete karo: pehle <code>ls</code> se preview, phir <code>rm</code>; jaano ki recycle bin nahi hai.</li>
<li><code>*</code>, <code>?</code>, <code>[ ]</code> aur <code>{ }</code> use karo, aur batao kaun expand karta hai (shell).</li>
<li>Space wale naam quote karo; double aur single quotes ka farq batao; <code>$HOME</code> aur <code>$PATH</code> padho.</li>
<li>Names ke liye <code>find</code> aur content ke liye <code>grep -r</code> chuno, aur <code>-iname</code>, <code>-type</code>, <code>-l</code>, <code>-n</code>, <code>-c</code> use karo.</li>
<li>Chhe-step routine follow karo aur original ko evidence rakho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Shell / bash</dt><dd>Woh program jo aapke commands padhkar chalata hai.</dd>
<dt>Root directory <code>/</code></dt><dd>Ek directory tree ka top. Root user ki home, <code>/root</code>, se alag.</dd>
<dt>Home directory <code>~</code></dt><dd>Aapki personal directory, jaise <code>/home/netadmin</code>.</dd>
<dt>Absolute / relative path</dt><dd><code>/</code> se shuru / current directory se shuru.</dd>
<dt>Hidden file</dt><dd>Dot se shuru hone wala naam, sirf <code>ls -a</code> se dikhta hai.</dd>
<dt>Wildcard (glob)</dt><dd><code>*.cfg</code> jaisa pattern jise shell file names mein expand karta hai.</dd>
<dt>Recursive (<code>-r</code>)</dt><dd>Directory aur uske andar ke sab par kaam karo.</dd>
<dt>Exit status</dt><dd>Success ke liye 0, failure ke liye non-zero; <code>$?</code> se dikhta hai.</dd>
<dt>PATH</dt><dd>Un directories ki list jahan commands dhoondhe jaate hain.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Hidden files dikhao</td><td><code>ls -a</code> (ya <code>-la</code>)</td></tr>
<tr><td>File rename karo</td><td><code>mv old new</code></td></tr>
<tr><td>Directory copy karo</td><td><code>cp -r src dst</code></td></tr>
<tr><td>Nested directories banao</td><td><code>mkdir -p a/b/c</code></td></tr>
<tr><td>File name search, kisi bhi case mein</td><td><code>find / -iname "*x*"</code></td></tr>
<tr><td>Kaunsi file mein text hai</td><td><code>grep -rl "text" dir</code></td></tr>
<tr><td>Main kahan hoon</td><td><code>pwd</code></td></tr>
<tr><td>rm ke baad recover ho sakta hai</td><td>Nahi: recycle bin nahi hai</td></tr>
<tr><td>Wildcards kaun expand karta hai</td><td>Shell, command chalne se pehle</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">pwd; whoami; hostname           # kahan, kaun, kaunsa server
ls -la  /  ls -lh  /  ls -ld    # list, hidden, readable sizes, directory khud
cd /path  /  cd ..  /  cd  /  cd -
cat f  /  less f  /  file f  /  stat f
mkdir -p a/b  /  touch f  /  cp -r a b  /  mv a b  /  rm f  /  rm -r d
find /srv -iname "*hyd*" -type f
grep -rn "10.40.9.1" /srv/configs
man cmd  /  which cmd  /  type cmd  /  history</pre>

<div class="warn"><p><b>Aakhri yaad-dehani.</b> Khatarnak commands woh hain jo delete ya overwrite karte hain: <code>rm</code>, <code>mv</code>, maujooda file par <code>cp</code>, aur <code>&gt;</code> ke saath redirection. Preview karo, copy karo, phir act karo. Aur prompt ka hostname hamesha padho.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> Case-sensitivity (<code>-name</code> versus <code>-iname</code>, <code>File</code> versus <code>file</code>); <code>find</code>, <code>grep</code> nahi hai; <code>mv</code> rename karta hai; directories ke liye <code>cp</code> ko <code>-r</code> chahiye; <code>/</code>, <code>/root</code> nahi hai; wildcards shell expand karta hai, command nahi.</p></div>

<div class="scn"><h4>Naye joiner ka pehla hafta</h4><p>Bina Linux background ke ek naye NOC engineer ko Monday ko yeh module aur do labs di gayi. Wednesday tak woh jump host par ghoom sakti thi, Thursday ko usne ek <code>grep -rn</code> se duplicate-IP ticket ka jawab diya, aur Friday ko use backup folder organise karne ko kaha gaya. Usne "preview, copy, act" aadat use ki aur kabhi koi file nahi khoyi.</p><p><b>Lesson:</b> ek darjan commands aur do aadatein roz ke Linux kaam ka zyadatar hissa cover karti hain.</p></div>

<div class="iv"><p class="q">"Network engineer role ke liye apni Linux comfort level batao."</p><p>Main file system navigate aur read kar sakta hoon, <code>find</code> aur <code>grep -r</code> se names aur content search kar sakta hoon, <code>cp</code>, <code>mv</code>, <code>rm</code> aur wildcards se files safely handle kar sakta hoon, aur hamesha pehle apna server aur path check karta hoon. Phir batao ki aage kya bana rahe ho: pipes aur log analysis, aur users, permissions aur sudo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>pwd</code>, <code>cd</code>, <code>ls</code> se navigate karo; key directories jaano.</li>
<li><code>mkdir</code>, <code>cp</code>, <code>mv</code>, <code>rm</code> se badlo; undo nahi hota.</li>
<li>Names <code>find</code> se, text <code>grep -r</code> se dhoondho.</li>
<li>Shell wildcards aur variables expand karta hai; jo literal rakhna ho use quote karo.</li>
<li>Aage: lx-text (pipes aur logs), phir lx-users (permissions aur sudo).</li>
</ul></div>
`}};export{e as default};