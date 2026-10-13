var e={id:`wildcards-quotes`,h:{en:`Wildcards, quotes, variables and chaining commands`,hi:`Wildcards, quotes, variables aur commands ko jodna`},body:{en:`
<p><b>The idea of this chapter:</b> how to act on many files with one command, and how the shell treats special characters before your command even starts. This single idea, "the shell expands first", explains most beginner surprises.</p>

<h3>Wildcards (globbing)</h3>
<p>A <b>wildcard</b> is a pattern that stands for many names. The <b>shell</b> (not the command) replaces the pattern with the list of matching file names, and then runs the command with that list. Here are the folder contents again:</p>
<pre class="out">netadmin@nms01:~/incoming$ ls
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg  PUN-CORE-R1.cfg  PUN-CORE-R1.cfg.bak</pre>
<table class="cmp"><tr><th>Pattern</th><th>Matches</th></tr>
<tr><td><code>*</code></td><td>any number of any characters (even none)</td></tr>
<tr><td><code>?</code></td><td>exactly one character</td></tr>
<tr><td><code>[abc]</code> or <code>[A-H]</code></td><td>one character from the set or range</td></tr></table>
<pre class="out">netadmin@nms01:~/incoming$ ls PUN-*
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg  PUN-CORE-R1.cfg  PUN-CORE-R1.cfg.bak
netadmin@nms01:~/incoming$ ls *SW*
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg
netadmin@nms01:~/incoming$ ls *-R?.cfg
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ ls *-R[12].cfg
BLR-EDGE-R2.cfg  PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ ls [A-H]*
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg
netadmin@nms01:~/incoming$ ls *.cfg.bak
PUN-CORE-R1.cfg.bak</pre>
<p>Look closely at <code>*-R?.cfg</code>: it matches <code>-R1.cfg</code>, <code>-R2.cfg</code> and <code>-R3.cfg</code> but not the <code>.bak</code> file, because the name must <i>end</i> in <code>.cfg</code>. And <code>[12]</code> picks only R1 and R2 and leaves R3 out.</p>
<p>The proof that the shell does the work is <code>echo</code>, which just prints its arguments:</p>
<pre class="out">netadmin@nms01:~/incoming$ echo *-R?.cfg
BLR-EDGE-R2.cfg HYD-EDGE-R3.cfg PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ echo *.xyz
*.xyz
netadmin@nms01:~/incoming$ ls *.xyz
ls: cannot access '*.xyz': No such file or directory</pre>
<p>If nothing matches, bash passes the pattern through unchanged, and the command then complains that no such file exists. Wildcards do not match hidden files unless the pattern itself starts with a dot, so <code>rm *</code> will not remove <code>.handover.txt</code>.</p>

<h3>Brace expansion: make lists</h3>
<p>Curly braces generate a list of words; they are not wildcards, since they need no existing files.</p>
<pre class="out">netadmin@nms01:~$ mkdir -p x/{a,b,c}
netadmin@nms01:~$ ls x
a  b  c
netadmin@nms01:~$ echo file{1,2,3}.txt
file1.txt file2.txt file3.txt
netadmin@nms01:~$ echo R{1..3}.cfg
R1.cfg R2.cfg R3.cfg</pre>

<h3>Quotes: stop the shell from being helpful</h3>
<p>Spaces split a command into arguments. A file called <code>my file.txt</code> has a space, so the shell sees two names. Quotes keep it as one:</p>
<pre class="out">netadmin@nms01:~$ ls my file.txt
ls: cannot access 'my': No such file or directory
ls: cannot access 'file.txt': No such file or directory
netadmin@nms01:~$ ls "my file.txt"
my file.txt</pre>
<ul>
<li><b>Double quotes</b> <code>"..."</code>: keep spaces together, but still expand variables like <code>$HOME</code>.</li>
<li><b>Single quotes</b> <code>'...'</code>: everything is literal. Nothing expands.</li>
<li>A <b>backslash</b> before one character, <code>my\\ file.txt</code>, also protects a single space.</li>
</ul>
<p>Quote patterns that are meant for a command, not the shell: <code>find . -name "*.cfg"</code>, <code>grep "state to down"</code>. Without quotes, the shell may expand <code>*.cfg</code> in the current directory <i>before</i> <code>find</code> sees it.</p>

<h3>Variables</h3>
<p>A <b>variable</b> is a named box that holds text. Set it with no spaces around the equals sign, read it with a dollar sign:</p>
<pre class="out">netadmin@nms01:~$ SITE=pune
netadmin@nms01:~$ echo $SITE
pune
netadmin@nms01:~$ echo "site is $SITE"
site is pune
netadmin@nms01:~$ echo 'site is $SITE'
site is $SITE
netadmin@nms01:~$ echo $HOME
/home/netadmin
netadmin@nms01:~$ echo $USER
netadmin
netadmin@nms01:~$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin</pre>
<p><code>$HOME</code> and <code>$USER</code> are set for you. <code>$PATH</code> is the list of directories where the shell looks for commands, which is why you can type <code>ls</code> instead of <code>/usr/bin/ls</code>. A plain variable lives only in your shell. <code>export SITE</code> makes it visible to programs you start, and <code>env</code> lists the exported ones.</p>
<pre class="out">netadmin@nms01:~$ export SITE
netadmin@nms01:~$ env | grep SITE
SITE=pune</pre>

<h3>Exit status and chaining</h3>
<p>Every command ends with an <b>exit status</b>: <code>0</code> means success, anything else means failure. <code>$?</code> holds the last one.</p>
<pre class="out">netadmin@nms01:~$ ls /nonexistent
ls: cannot access '/nonexistent': No such file or directory
netadmin@nms01:~$ echo $?
2</pre>
<ul>
<li><code>cmd1 ; cmd2</code> runs both, always.</li>
<li><code>cmd1 &amp;&amp; cmd2</code> runs <code>cmd2</code> only if <code>cmd1</code> succeeded.</li>
<li><code>cmd1 || cmd2</code> runs <code>cmd2</code> only if <code>cmd1</code> failed.</li>
</ul>
<pre class="code">mkdir -p backups &amp;&amp; cp *.cfg backups/ &amp;&amp; echo "backup ok"</pre>
<p>If the <code>mkdir</code> fails, nothing after it runs. This is how scripts avoid doing damage after an error.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>SITE = pune</code> with spaces: bash thinks <code>SITE</code> is a command. (2) Using single quotes around a variable and wondering why it prints <code>$SITE</code>. (3) <code>rm *</code> in the wrong directory: preview with <code>ls *</code> first. (4) Forgetting that <code>*.cfg</code> only matches names ending in <code>.cfg</code>; <code>.cfg.bak</code> files are skipped.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wildcards are expanded by the <b>shell</b>, not by the command. <code>?</code> is one character; <code>*</code> is any number. File names and variables are case-sensitive: <code>$Home</code> is empty. Exit status 0 means success.</p></div>

<div class="scn"><h4>Fifty files, one command</h4><p>After a data-centre move, 50 interface config snippets named <code>sw01-old.cfg</code> to <code>sw50-old.cfg</code> had to be renamed for a new naming scheme. The engineer first ran <code>ls sw*-old.cfg | wc -l</code> and saw 50, as expected. Then she moved them all into <code>archive/old/</code> with one <code>mv sw*-old.cfg archive/old/</code>. The whole job took thirty seconds, instead of fifty drag-and-drops.</p><p><b>Lesson:</b> count and preview with <code>ls</code> and <code>wc -l</code> before a wildcard action.</p></div>

<div class="iv"><p class="q">"Who expands the wildcard, the command or the shell, and why does it matter?"</p><p>The shell expands it before the command runs, so the command receives a list of names. That is why unquoted patterns can behave unexpectedly, for example with <code>find -name</code>, where you should quote the pattern, and why a huge directory may hit the argument-length limit. It is also why you can test a wildcard safely with <code>echo</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>*</code> any length, <code>?</code> one character, <code>[ ]</code> one from a set; the shell expands them.</li>
<li>Braces such as <code>{a,b,c}</code> create lists, even for files that do not exist yet.</li>
<li>Double quotes allow variables; single quotes are fully literal; quote names with spaces.</li>
<li>Variables: <code>NAME=value</code> to set, <code>$NAME</code> to read, <code>export</code> to share.</li>
<li><code>&amp;&amp;</code> runs the next command only on success; <code>$?</code> is the last exit status.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ek command se bahut saari files par kaam kaise karein, aur aapka command shuru hone se pehle hi shell special characters ke saath kya karta hai. Yeh ek idea, "shell pehle expand karta hai", zyadatar beginner surprises samjha deti hai.</p>

<h3>Wildcards (globbing)</h3>
<p><b>Wildcard</b> ek pattern hai jo kai naamon ki jagah khada hota hai. <b>Shell</b> (command nahi) pattern ko matching file names ki list se badal deta hai, aur phir command ko woh list deta hai. Folder ke contents phir se:</p>
<pre class="out">netadmin@nms01:~/incoming$ ls
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg  PUN-CORE-R1.cfg  PUN-CORE-R1.cfg.bak</pre>
<table class="cmp"><tr><th>Pattern</th><th>Kisse match karta hai</th></tr>
<tr><td><code>*</code></td><td>kitne bhi characters (zero bhi)</td></tr>
<tr><td><code>?</code></td><td>bilkul ek character</td></tr>
<tr><td><code>[abc]</code> ya <code>[A-H]</code></td><td>set ya range mein se ek character</td></tr></table>
<pre class="out">netadmin@nms01:~/incoming$ ls PUN-*
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg  PUN-CORE-R1.cfg  PUN-CORE-R1.cfg.bak
netadmin@nms01:~/incoming$ ls *SW*
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg
netadmin@nms01:~/incoming$ ls *-R?.cfg
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ ls *-R[12].cfg
BLR-EDGE-R2.cfg  PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ ls [A-H]*
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg
netadmin@nms01:~/incoming$ ls *.cfg.bak
PUN-CORE-R1.cfg.bak</pre>
<p><code>*-R?.cfg</code> ko dhyan se dekho: yeh <code>-R1.cfg</code>, <code>-R2.cfg</code> aur <code>-R3.cfg</code> se match karta hai par <code>.bak</code> file se nahi, kyunki naam <code>.cfg</code> par <i>khatam</i> hona chahiye. Aur <code>[12]</code> sirf R1 aur R2 chunta hai, R3 chhod deta hai.</p>
<p>Shell hi kaam karta hai iska saboot <code>echo</code> hai, jo bas apne arguments print karta hai:</p>
<pre class="out">netadmin@nms01:~/incoming$ echo *-R?.cfg
BLR-EDGE-R2.cfg HYD-EDGE-R3.cfg PUN-CORE-R1.cfg
netadmin@nms01:~/incoming$ echo *.xyz
*.xyz
netadmin@nms01:~/incoming$ ls *.xyz
ls: cannot access '*.xyz': No such file or directory</pre>
<p>Kuch match na ho to bash pattern ko jaisa tha waisa hi aage pass kar deta hai, aur command shikayat karta hai ki file hai hi nahi. Wildcards hidden files se match nahi karte jab tak pattern khud dot se shuru na ho, isliye <code>rm *</code> <code>.handover.txt</code> ko nahi hatayega.</p>

<h3>Brace expansion: lists banao</h3>
<p>Curly braces words ki list banate hain; yeh wildcards nahi hain, kyunki inhe maujooda files nahi chahiye.</p>
<pre class="out">netadmin@nms01:~$ mkdir -p x/{a,b,c}
netadmin@nms01:~$ ls x
a  b  c
netadmin@nms01:~$ echo file{1,2,3}.txt
file1.txt file2.txt file3.txt
netadmin@nms01:~$ echo R{1..3}.cfg
R1.cfg R2.cfg R3.cfg</pre>

<h3>Quotes: shell ko zyada madadgaar banne se roko</h3>
<p>Spaces command ko arguments mein todte hain. <code>my file.txt</code> naam ki file mein space hai, isliye shell do naam dekhta hai. Quotes use ek rakhte hain:</p>
<pre class="out">netadmin@nms01:~$ ls my file.txt
ls: cannot access 'my': No such file or directory
ls: cannot access 'file.txt': No such file or directory
netadmin@nms01:~$ ls "my file.txt"
my file.txt</pre>
<ul>
<li><b>Double quotes</b> <code>"..."</code>: spaces ko saath rakhte hain, par <code>$HOME</code> jaise variables phir bhi expand hote hain.</li>
<li><b>Single quotes</b> <code>'...'</code>: sab kuch literal. Kuch expand nahi hota.</li>
<li>Ek character se pehle <b>backslash</b>, <code>my\\ file.txt</code>, ek space ko bhi bacha leta hai.</li>
</ul>
<p>Woh patterns quote karo jo command ke liye hain, shell ke liye nahi: <code>find . -name "*.cfg"</code>, <code>grep "state to down"</code>. Bina quotes ke shell <code>*.cfg</code> ko current directory mein <code>find</code> ke dekhne se <i>pehle</i> expand kar sakta hai.</p>

<h3>Variables</h3>
<p><b>Variable</b> ek naam wala dabba hai jisme text rehta hai. Barabar ke chinh ke aas-paas space ke bina set karo, dollar sign se padho:</p>
<pre class="out">netadmin@nms01:~$ SITE=pune
netadmin@nms01:~$ echo $SITE
pune
netadmin@nms01:~$ echo "site is $SITE"
site is pune
netadmin@nms01:~$ echo 'site is $SITE'
site is $SITE
netadmin@nms01:~$ echo $HOME
/home/netadmin
netadmin@nms01:~$ echo $USER
netadmin
netadmin@nms01:~$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin</pre>
<p><code>$HOME</code> aur <code>$USER</code> aapke liye pehle se set hain. <code>$PATH</code> un directories ki list hai jahan shell commands dhoondhta hai, isiliye aap <code>/usr/bin/ls</code> ki jagah <code>ls</code> type kar sakte ho. Plain variable sirf aapke shell mein rehta hai. <code>export SITE</code> use un programs ko dikhata hai jo aap shuru karte ho, aur <code>env</code> exported variables list karta hai.</p>
<pre class="out">netadmin@nms01:~$ export SITE
netadmin@nms01:~$ env | grep SITE
SITE=pune</pre>

<h3>Exit status aur chaining</h3>
<p>Har command ek <b>exit status</b> ke saath khatam hota hai: <code>0</code> matlab success, baaki sab failure. <code>$?</code> pichhla status rakhta hai.</p>
<pre class="out">netadmin@nms01:~$ ls /nonexistent
ls: cannot access '/nonexistent': No such file or directory
netadmin@nms01:~$ echo $?
2</pre>
<ul>
<li><code>cmd1 ; cmd2</code> dono chalata hai, hamesha.</li>
<li><code>cmd1 &amp;&amp; cmd2</code> <code>cmd2</code> tabhi chalata hai jab <code>cmd1</code> succeed hua.</li>
<li><code>cmd1 || cmd2</code> <code>cmd2</code> tabhi chalata hai jab <code>cmd1</code> fail hua.</li>
</ul>
<pre class="code">mkdir -p backups &amp;&amp; cp *.cfg backups/ &amp;&amp; echo "backup ok"</pre>
<p><code>mkdir</code> fail ho to uske baad kuch nahi chalta. Scripts isi tarah error ke baad nuksaan karne se bachti hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>SITE = pune</code> spaces ke saath: bash sochta hai <code>SITE</code> ek command hai. (2) Variable ke aas-paas single quotes lagakar sochna ki <code>$SITE</code> kyun print hua. (3) Galat directory mein <code>rm *</code>: pehle <code>ls *</code> se preview karo. (4) Yeh bhoolna ki <code>*.cfg</code> sirf <code>.cfg</code> par khatam hone wale naam pakadta hai; <code>.cfg.bak</code> files skip ho jaati hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wildcards <b>shell</b> expand karta hai, command nahi. <code>?</code> ek character hai; <code>*</code> kitne bhi. File names aur variables case-sensitive hain: <code>$Home</code> khaali hai. Exit status 0 matlab success.</p></div>

<div class="scn"><h4>Pachaas files, ek command</h4><p>Data-centre move ke baad <code>sw01-old.cfg</code> se <code>sw50-old.cfg</code> tak 50 interface config snippets naye naming scheme ke liye move karne the. Engineer ne pehle <code>ls sw*-old.cfg | wc -l</code> chalaya aur 50 dekha, jaisa expected tha. Phir ek <code>mv sw*-old.cfg archive/old/</code> se sab <code>archive/old/</code> mein bhej di. Poora kaam tees second mein hua, pachaas drag-and-drop ki jagah.</p><p><b>Lesson:</b> wildcard action se pehle <code>ls</code> aur <code>wc -l</code> se ginti aur preview karo.</p></div>

<div class="iv"><p class="q">"Wildcard kaun expand karta hai, command ya shell, aur isse kya farq padta hai?"</p><p>Shell command chalne se pehle expand karta hai, isliye command ko names ki list milti hai. Isiliye unquoted patterns kabhi-kabhi ajeeb behave karte hain, jaise <code>find -name</code> mein, jahan pattern quote karna chahiye, aur isiliye bahut badi directory argument-length limit tak pahunch sakti hai. Isiliye aap wildcard ko <code>echo</code> se safely test bhi kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>*</code> kitni bhi length, <code>?</code> ek character, <code>[ ]</code> set mein se ek; inhe shell expand karta hai.</li>
<li><code>{a,b,c}</code> jaise braces lists banate hain, un files ke liye bhi jo abhi exist nahi karti.</li>
<li>Double quotes variables allow karte hain; single quotes poore literal; space wale naam quote karo.</li>
<li>Variables: set karne ke liye <code>NAME=value</code>, padhne ke liye <code>$NAME</code>, share karne ke liye <code>export</code>.</li>
<li><code>&amp;&amp;</code> agla command sirf success par chalata hai; <code>$?</code> pichhla exit status hai.</li>
</ul></div>
`}};export{e as default};