var e={id:`ls-cd`,h:{en:`Looking around and moving: ls and cd`,hi:`Aas-paas dekhna aur ghoomna: ls aur cd`},body:{en:`
<p><b>The idea of this chapter:</b> two commands you will type hundreds of times a day. <code>ls</code> lists what is in a directory, and <code>cd</code> moves you to another one. Think of walking into a room (<code>cd</code>) and looking at what is on the shelves (<code>ls</code>).</p>

<h3>ls: list the contents</h3>
<p>On its own, <code>ls</code> shows the names in the current directory. Options add detail. Here is the lab server in its starting state:</p>
<pre class="out">netadmin@nms01:~$ ls
incoming
netadmin@nms01:~$ ls -l
total 4
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 incoming</pre>
<p>The option <code>-l</code> means <b>long format</b>. Look into the folder, and add <code>-a</code> to show <b>all</b> files, including hidden ones:</p>
<pre class="out">netadmin@nms01:~$ ls -la incoming
total 28
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 .
drwxr-x---  3 netadmin netadmin   4096 Sep 29 09:00 ..
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 BLR-EDGE-R2.cfg
-rw-r--r--  1 netadmin netadmin    256 Sep 29 09:00 .handover.txt
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 HYD-EDGE-R3.cfg
-rw-r--r--  1 netadmin netadmin    144 Sep 29 09:00 PUN-ACC-SW1.cfg
-rw-r--r--  1 netadmin netadmin    144 Sep 29 09:00 PUN-ACC-SW2.cfg
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 PUN-CORE-R1.cfg
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 PUN-CORE-R1.cfg.bak</pre>
<p>You can join options: <code>-la</code> is the same as <code>-l -a</code>. The file <code>.handover.txt</code> is a <b>hidden file</b>: any name that starts with a dot is skipped by plain <code>ls</code>. Settings files such as <code>.bashrc</code> and folders such as <code>.ssh</code> are hidden this way, and people also leave notes in them. Remember <code>ls -la</code>. Two more entries are always there: <code>.</code> (this directory) and <code>..</code> (the parent).</p>

<h3>How to read one line of ls -l</h3>
<pre class="out">-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 BLR-EDGE-R2.cfg
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 incoming</pre>
<table class="cmp"><tr><th>Part</th><th>Example</th><th>Meaning</th></tr>
<tr><td>Type</td><td><code>-</code> or <code>d</code></td><td>first character: <code>-</code> file, <code>d</code> directory, <code>l</code> link</td></tr>
<tr><td>Permissions</td><td><code>rw-r--r--</code></td><td>who may read, write, execute (module lx-users)</td></tr>
<tr><td>Link count</td><td><code>1</code></td><td>number of names for it; ignore for now</td></tr>
<tr><td>Owner, group</td><td><code>netadmin netadmin</code></td><td>who owns it</td></tr>
<tr><td>Size</td><td><code>146</code></td><td>bytes</td></tr>
<tr><td>Date</td><td><code>Sep 29 09:00</code></td><td>last modified</td></tr>
<tr><td>Name</td><td><code>BLR-EDGE-R2.cfg</code></td><td>case-sensitive</td></tr></table>
<p>Sizes in bytes are hard to read for big files. <code>-h</code> means <b>human-readable</b> and prints K, M, G:</p>
<pre class="out">netadmin@nms01:~$ ls -lh /var/log
total 16
-rw-r-----  1 syslog   adm        243 Sep 29 09:00 auth.log
-rw-r--r--  1 root     root         0 Sep 29 09:00 dpkg.log
-rw-r-----  1 syslog   adm          0 Sep 29 09:00 kern.log
-rw-r-----  1 syslog   adm        650 Sep 29 09:00 syslog</pre>
<p>To look at a directory itself instead of its contents, use <code>-d</code>: <code>ls -ld /tmp</code>. This is how you check the permissions of a folder.</p>
<pre class="out">netadmin@nms01:~$ ls -ld /etc /tmp /home/netadmin
drwxr-xr-x  9 root     root       4096 Sep 29 09:00 /etc
drwxrwxrwt  2 root     root       4096 Sep 29 09:00 /tmp
drwxr-x---  3 netadmin netadmin   4096 Sep 29 09:00 /home/netadmin</pre>

<h3>cd: change directory</h3>
<pre class="code">cd /var/log     # absolute path: go there from anywhere
cd ..           # one level up
cd              # no argument: go home (same as cd ~)
cd -            # go back to the previous directory</pre>
<p>Real output, remembering that the prompt shows where you are and <code>cd</code> itself prints nothing (except <code>cd -</code>, which prints the place it takes you to):</p>
<pre class="out">netadmin@nms01:~$ cd /var/log
netadmin@nms01:/var/log$ pwd
/var/log
netadmin@nms01:/var/log$ cd -
/home/netadmin
netadmin@nms01:~$ cd ..
netadmin@nms01:/home$ pwd
/home
netadmin@nms01:/home$ cd
netadmin@nms01:~$ pwd
/home/netadmin</pre>
<p>Typical errors, and what they mean:</p>
<pre class="out">netadmin@nms01:~$ cd /nonexistent
-bash: cd: /nonexistent: No such file or directory
netadmin@nms01:~$ cd incoming/PUN-CORE-R1.cfg
-bash: cd: incoming/PUN-CORE-R1.cfg: Not a directory</pre>
<p>"No such file or directory" is a typo or the wrong path. "Not a directory" means you tried to <code>cd</code> into a file.</p>

<div class="tip"><p><b>Two habits that save hours.</b> Press <b>Tab</b> to complete a name: type <code>cd inc</code> then Tab and the shell writes <code>incoming/</code> for you (and if there is more than one match, press Tab twice to see them). And press the <b>Up arrow</b> to bring back the previous command instead of typing it again. Both also reduce typos, which matters when a path is long.</p></div>

<div class="eg"><p><b>Worked example.</b> You need the Pune backup config. Work like this: <code>cd /srv/configs</code>, <code>ls</code> to see the years, <code>cd 2026</code>, <code>ls</code>, <code>cd q3</code>, <code>ls</code>, <code>cd pune</code>, <code>ls</code>. At every step you read the answer before you choose the next move, just as you would walk through a building. If you get lost, <code>pwd</code> and <code>cd</code> (home) get you back.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Spaces: <code>cd my notes</code> sends two arguments. Quote the name or use the backslash form <code>my\\ notes</code>; better, avoid spaces in names. (2) Forgetting <code>-a</code> and concluding "there is no such file" when it is hidden. (3) Reading <code>ls</code> output as sorted by time. It is sorted by name (<code>ls -lt</code> sorts by time, newest first). (4) Typing <code>cd</code> and being surprised you are home: no argument means home.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ls</code> and <code>ls -a</code> differ in hidden files, and <code>ls -l</code> shows type, permissions, owner, group, size, date and name, in that order. The first character <code>d</code> means directory. The <code>total</code> line at the top is disk blocks used, not a file count.</p></div>

<div class="scn"><h4>The note nobody could see</h4><p>The day shift said, "the night engineer left instructions". The folder looked empty of notes. A trainee ran <code>ls -la</code> and found <code>.handover.txt</code>: it said which files to move and which to delete, and gave the ticket number. The instructions had been there all along, hidden by the leading dot.</p><p><b>Lesson:</b> when something "is not there", look with <code>ls -la</code> before you decide it is missing.</p></div>

<div class="iv"><p class="q">"What does ls -l show, and how do you see hidden files?"</p><p>Long format: file type, permissions, link count, owner, group, size in bytes, modification time and name. Hidden files are those starting with a dot; <code>ls -a</code> (or <code>-A</code>, which skips <code>.</code> and <code>..</code>) shows them. Add <code>-h</code> for readable sizes. A strong answer also names <code>ls -ld</code> for checking a directory's own permissions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ls</code> lists, <code>-l</code> gives details, <code>-a</code> adds hidden files, <code>-h</code> makes sizes readable.</li>
<li>The first character in <code>ls -l</code>: <code>-</code> file, <code>d</code> directory, <code>l</code> link.</li>
<li><code>ls -ld</code> shows a directory itself, not its contents.</li>
<li><code>cd path</code> moves; <code>cd ..</code> up; <code>cd</code> home; <code>cd -</code> back.</li>
<li>Use Tab to complete names and the Up arrow to repeat commands.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> do commands jo aap din mein sainkdon baar type karoge. <code>ls</code> batata hai directory mein kya hai, aur <code>cd</code> aapko doosri directory mein le jaata hai. Socho ek kamre mein jaana (<code>cd</code>) aur shelves par kya rakha hai dekhna (<code>ls</code>).</p>

<h3>ls: contents list karo</h3>
<p>Akela <code>ls</code> current directory ke naam dikhata hai. Options detail jodte hain. Lab server ki starting state:</p>
<pre class="out">netadmin@nms01:~$ ls
incoming
netadmin@nms01:~$ ls -l
total 4
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 incoming</pre>
<p>Option <code>-l</code> ka matlab <b>long format</b>. Folder ke andar dekho, aur hidden files samet <b>saari</b> files dikhane ke liye <code>-a</code> jodo:</p>
<pre class="out">netadmin@nms01:~$ ls -la incoming
total 28
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 .
drwxr-x---  3 netadmin netadmin   4096 Sep 29 09:00 ..
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 BLR-EDGE-R2.cfg
-rw-r--r--  1 netadmin netadmin    256 Sep 29 09:00 .handover.txt
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 HYD-EDGE-R3.cfg
-rw-r--r--  1 netadmin netadmin    144 Sep 29 09:00 PUN-ACC-SW1.cfg
-rw-r--r--  1 netadmin netadmin    144 Sep 29 09:00 PUN-ACC-SW2.cfg
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 PUN-CORE-R1.cfg
-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 PUN-CORE-R1.cfg.bak</pre>
<p>Options jod sakte ho: <code>-la</code>, <code>-l -a</code> ke barabar hai. File <code>.handover.txt</code> ek <b>hidden file</b> hai: jo bhi naam dot se shuru ho use simple <code>ls</code> skip kar deta hai. <code>.bashrc</code> jaisi settings files aur <code>.ssh</code> jaise folders isi tarah hidden hote hain, aur log notes bhi inme chhod dete hain. <code>ls -la</code> yaad rakho. Do entries hamesha hoti hain: <code>.</code> (yahi directory) aur <code>..</code> (parent).</p>

<h3>ls -l ki ek line kaise padhein</h3>
<pre class="out">-rw-r--r--  1 netadmin netadmin    146 Sep 29 09:00 BLR-EDGE-R2.cfg
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 incoming</pre>
<table class="cmp"><tr><th>Part</th><th>Example</th><th>Matlab</th></tr>
<tr><td>Type</td><td><code>-</code> ya <code>d</code></td><td>pehla character: <code>-</code> file, <code>d</code> directory, <code>l</code> link</td></tr>
<tr><td>Permissions</td><td><code>rw-r--r--</code></td><td>kaun read, write, execute kar sakta hai (module lx-users)</td></tr>
<tr><td>Link count</td><td><code>1</code></td><td>uske kitne naam hain; abhi ignore karo</td></tr>
<tr><td>Owner, group</td><td><code>netadmin netadmin</code></td><td>kiska hai</td></tr>
<tr><td>Size</td><td><code>146</code></td><td>bytes</td></tr>
<tr><td>Date</td><td><code>Sep 29 09:00</code></td><td>last modified</td></tr>
<tr><td>Name</td><td><code>BLR-EDGE-R2.cfg</code></td><td>case-sensitive</td></tr></table>
<p>Badi files ka bytes mein size padhna mushkil hai. <code>-h</code> ka matlab <b>human-readable</b> hai aur K, M, G print karta hai:</p>
<pre class="out">netadmin@nms01:~$ ls -lh /var/log
total 16
-rw-r-----  1 syslog   adm        243 Sep 29 09:00 auth.log
-rw-r--r--  1 root     root         0 Sep 29 09:00 dpkg.log
-rw-r-----  1 syslog   adm          0 Sep 29 09:00 kern.log
-rw-r-----  1 syslog   adm        650 Sep 29 09:00 syslog</pre>
<p>Directory ko khud dekhna ho, uske contents ko nahi, to <code>-d</code> use karo: <code>ls -ld /tmp</code>. Isi se folder ki permissions check hoti hain.</p>
<pre class="out">netadmin@nms01:~$ ls -ld /etc /tmp /home/netadmin
drwxr-xr-x  9 root     root       4096 Sep 29 09:00 /etc
drwxrwxrwt  2 root     root       4096 Sep 29 09:00 /tmp
drwxr-x---  3 netadmin netadmin   4096 Sep 29 09:00 /home/netadmin</pre>

<h3>cd: directory badlo</h3>
<pre class="code">cd /var/log     # absolute path: kahin se bhi wahan jao
cd ..           # ek level upar
cd              # bina argument: home jao (cd ~ ke barabar)
cd -            # pichhli directory par wapas</pre>
<p>Real output; yaad rakho prompt dikhata hai aap kahan ho aur <code>cd</code> khud kuch print nahi karta (sirf <code>cd -</code> jo us jagah ka naam print karta hai jahan woh le jaata hai):</p>
<pre class="out">netadmin@nms01:~$ cd /var/log
netadmin@nms01:/var/log$ pwd
/var/log
netadmin@nms01:/var/log$ cd -
/home/netadmin
netadmin@nms01:~$ cd ..
netadmin@nms01:/home$ pwd
/home
netadmin@nms01:/home$ cd
netadmin@nms01:~$ pwd
/home/netadmin</pre>
<p>Typical errors aur unka matlab:</p>
<pre class="out">netadmin@nms01:~$ cd /nonexistent
-bash: cd: /nonexistent: No such file or directory
netadmin@nms01:~$ cd incoming/PUN-CORE-R1.cfg
-bash: cd: incoming/PUN-CORE-R1.cfg: Not a directory</pre>
<p>"No such file or directory" matlab typo ya galat path. "Not a directory" matlab aapne file ke andar <code>cd</code> karne ki koshish ki.</p>

<div class="tip"><p><b>Do aadatein jo ghante bachati hain.</b> Naam complete karne ke liye <b>Tab</b> dabao: <code>cd inc</code> type karke Tab dabao to shell <code>incoming/</code> likh deta hai (aur ek se zyada match hon to do baar Tab dabao list dekhne ke liye). Aur pichhla command wapas laane ke liye <b>Up arrow</b> dabao. Dono typos bhi kam karte hain, jo lambe path mein zaroori hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Aapko Pune ki backup config chahiye. Aise kaam karo: <code>cd /srv/configs</code>, saal dekhne ke liye <code>ls</code>, <code>cd 2026</code>, <code>ls</code>, <code>cd q3</code>, <code>ls</code>, <code>cd pune</code>, <code>ls</code>. Har step par agla move chunne se pehle jawab padho, jaise building mein chalte ho. Kho jao to <code>pwd</code> aur <code>cd</code> (home) wapas le aate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Spaces: <code>cd my notes</code> do arguments bhejta hai. Naam ko quote karo ya backslash form <code>my\\ notes</code> use karo; behtar hai naamon mein space na rakho. (2) <code>-a</code> bhoolkar sochna "file hai hi nahi", jabki woh hidden hai. (3) <code>ls</code> output ko time ke hisaab se sorted samajhna. Yeh naam se sorted hota hai (<code>ls -lt</code> time se sort karta hai, naya pehle). (4) <code>cd</code> type karke chaukna ki home aa gaye: bina argument ka matlab home.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ls</code> aur <code>ls -a</code> mein hidden files ka farq hai, aur <code>ls -l</code> type, permissions, owner, group, size, date aur name isi order mein dikhata hai. Pehla character <code>d</code> matlab directory. Upar ki <code>total</code> line disk blocks hai, files ki ginti nahi.</p></div>

<div class="scn"><h4>Woh note jo kisi ko dikha nahi</h4><p>Day shift ne kaha, "night engineer ne instructions chhode hain". Folder mein notes dikhe nahi. Ek trainee ne <code>ls -la</code> chalaya aur <code>.handover.txt</code> mil gayi: usme likha tha kaunsi files move karni hain, kaunsi delete, aur ticket number bhi. Instructions shuru se wahin the, bas leading dot ne chhupa rakha tha.</p><p><b>Lesson:</b> jab kuch "hai nahi" lage, to missing maanne se pehle <code>ls -la</code> se dekho.</p></div>

<div class="iv"><p class="q">"ls -l kya dikhata hai, aur hidden files kaise dekhte ho?"</p><p>Long format: file type, permissions, link count, owner, group, bytes mein size, modification time aur name. Hidden files woh hain jo dot se shuru hoti hain; <code>ls -a</code> (ya <code>-A</code>, jo <code>.</code> aur <code>..</code> skip karta hai) unhe dikhata hai. Readable sizes ke liye <code>-h</code> jodo. Strong answer mein directory ki apni permissions check karne ke liye <code>ls -ld</code> ka naam bhi aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ls</code> list karta hai, <code>-l</code> details, <code>-a</code> hidden files, <code>-h</code> readable sizes.</li>
<li><code>ls -l</code> ka pehla character: <code>-</code> file, <code>d</code> directory, <code>l</code> link.</li>
<li><code>ls -ld</code> directory ko khud dikhata hai, uske contents ko nahi.</li>
<li><code>cd path</code> jaata hai; <code>cd ..</code> upar; <code>cd</code> home; <code>cd -</code> wapas.</li>
<li>Naam complete karne ke liye Tab, commands repeat karne ke liye Up arrow.</li>
</ul></div>
`}};export{e as default};