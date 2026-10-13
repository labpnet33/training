var e={id:`prompt-tree`,h:{en:`The prompt, the directory tree and paths`,hi:`Prompt, directory tree aur paths`},body:{en:`
<p><b>The idea of this chapter:</b> where am I, and how do I describe where a file is? Everything else in Linux depends on these two answers.</p>

<h3>Reading the prompt</h3>
<p>When you log in, the shell prints a <b>prompt</b>, a short line that says "I am ready for a command". On Ubuntu it looks like this:</p>
<pre class="code">netadmin@nms01:~$</pre>
<ul>
<li><code>netadmin</code> is the user you are logged in as.</li>
<li><code>nms01</code> is the hostname of the server. After you SSH somewhere, this tells you which machine you are on. Always look at it before a risky command.</li>
<li><code>~</code> is the directory you are in. The tilde is short for your <b>home directory</b>, here <code>/home/netadmin</code>.</li>
<li><code>$</code> means a normal user. For <b>root</b>, the all-powerful administrator, it changes to <code>#</code>. This is just like <code>&gt;</code> and <code>#</code> on a Cisco router.</li>
</ul>
<p>When you move to <code>/var/log</code> the prompt follows you: <code>netadmin@nms01:/var/log$</code>. The part after the colon is always your current directory.</p>

<h3>One tree, starting at the slash</h3>
<p>Windows has drives (C:, D:). Linux has <b>one tree</b> of directories. Its top is called <b>root directory</b> and is written <code>/</code>. (Do not confuse it with the <i>root user</i>; the word is used for both.) Everything, including disks and USB sticks, is attached somewhere under this tree. Here is the real listing from the lab server:</p>
<pre class="out">netadmin@nms01:~$ ls /
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var</pre>
<p>You will use only a handful of these:</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Linux directory tree">
<rect x="270" y="10" width="100" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="14">/</text>
<rect x="20" y="110" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">/etc</text><text x="75" y="147" text-anchor="middle" class="svg-muted" font-size="11">config files</text>
<rect x="150" y="110" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="205" y="130" text-anchor="middle" class="svg-ink" font-size="13">/home</text><text x="205" y="147" text-anchor="middle" class="svg-muted" font-size="11">user files</text>
<rect x="280" y="110" width="110" height="46" rx="8" fill="#fde68a"/><text x="335" y="130" text-anchor="middle" class="svg-ink" font-size="13">/var/log</text><text x="335" y="147" text-anchor="middle" class="svg-muted" font-size="11">logs</text>
<rect x="410" y="110" width="100" height="46" rx="8" fill="#fed7aa"/><text x="460" y="130" text-anchor="middle" class="svg-ink" font-size="13">/srv</text><text x="460" y="147" text-anchor="middle" class="svg-muted" font-size="11">served data</text>
<rect x="530" y="110" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="575" y="130" text-anchor="middle" class="svg-ink" font-size="13">/tmp</text><text x="575" y="147" text-anchor="middle" class="svg-muted" font-size="11">scratch</text>
<rect x="150" y="185" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="205" y="206" text-anchor="middle" class="svg-ink" font-size="12">/home/netadmin</text>
<line x1="320" y1="42" x2="75" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="205" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="335" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="460" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="575" y2="110" stroke="#64748b" stroke-width="1.5"/>
<line x1="205" y1="156" x2="205" y2="185" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">The six places a network engineer visits most.</p></div>

<ul>
<li><code>/etc</code> holds <b>configuration files</b>, the Linux equivalent of a router's running-config, but spread over many text files.</li>
<li><code>/home</code> holds each user's personal files. Yours is <code>/home/netadmin</code>.</li>
<li><code>/var/log</code> holds <b>log files</b>: <code>syslog</code>, <code>auth.log</code> and so on.</li>
<li><code>/srv</code> holds data that the server serves to others, such as TFTP backups.</li>
<li><code>/tmp</code> is scratch space. Anyone can write there; it is cleaned regularly.</li>
<li><code>/opt</code> holds add-on software, and <code>/usr</code> holds installed programs.</li>
</ul>
<pre class="out">netadmin@nms01:~$ ls /etc
cron.d  cron.daily  crontab  default  fstab  group  hostname  hosts  issue  motd  netplan  os-release  passwd  resolv.conf  rsyslog.conf  rsyslog.d  shadow  shells  ssh  sudoers  sudoers.d
netadmin@nms01:~$ ls /var/log
auth.log  dpkg.log  kern.log  syslog
netadmin@nms01:~$ cat /etc/hostname
nms01</pre>
<p>A real server has far more entries in <code>/etc</code>; the simulator shows a small selection. Notice how <code>/etc/hostname</code> is simply a file with one word in it. Linux configuration is plain text.</p>

<h3>Paths: the address of a file</h3>
<p>A <b>path</b> is the address of a file or directory, with slashes between the levels. There are two kinds.</p>
<ul>
<li>An <b>absolute path</b> starts with <code>/</code> and works from anywhere: <code>/var/log/syslog</code>.</li>
<li>A <b>relative path</b> does not start with <code>/</code>; it starts from where you are now. If you are in <code>/var</code>, then <code>log/syslog</code> means the same file.</li>
</ul>
<p>Three special names help with relative paths: <code>.</code> means <i>this directory</i>, <code>..</code> means <i>one level up</i>, and <code>~</code> means <i>my home directory</i>.</p>

<div class="eg"><p><b>Worked example.</b> You are in <code>/home/netadmin/incoming</code>. The file <code>/home/netadmin/archive/routers/PUN-CORE-R1.cfg</code> can be written as:</p><ul><li>absolute: <code>/home/netadmin/archive/routers/PUN-CORE-R1.cfg</code></li><li>from home: <code>~/archive/routers/PUN-CORE-R1.cfg</code></li><li>relative: <code>../archive/routers/PUN-CORE-R1.cfg</code> (up one to /home/netadmin, then down)</li></ul><p>All three name the same file. Use absolute paths in scripts and notes, relative paths when typing fast.</p></div>

<p>Use <code>pwd</code> (print working directory) any time you are unsure where you are:</p>
<pre class="out">netadmin@nms01:~$ pwd
/home/netadmin</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing <code>/archive/routers</code> when you meant <code>archive/routers</code>. The leading slash makes it start at the top of the whole tree, so it does not exist. (2) Forgetting that <code>~</code> belongs to the user: for the user <code>root</code> it is <code>/root</code>, not <code>/home/root</code>. (3) Running a command on the wrong server because you did not read the hostname in the prompt.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question "what is the path to the top of the file system?" has the answer <code>/</code>, not <code>C:</code> and not <code>~</code>. And <code>/root</code> (the root user's home) is not the same as <code>/</code> (the root directory).</p></div>

<div class="scn"><h4>Wrong server, right command</h4><p>An engineer ran a cleanup command on what he thought was the staging jump host. The prompt said <code>netadmin@jump01</code>, not <code>jump-stg</code>. He read the prompt before pressing Enter, saw the difference, and typed <code>exit</code> to return to the correct session. A week earlier, a colleague had skipped this glance and cleared the logs of the production server.</p><p><b>Lesson:</b> the hostname in the prompt is your seat belt. Read it every time.</p></div>

<div class="iv"><p class="q">"What is the difference between an absolute and a relative path?"</p><p>An absolute path starts at the root of the tree with a slash and means the same thing from any directory. A relative path starts from the current directory and changes meaning when you move. Mention <code>.</code> and <code>..</code>, and say that you use absolute paths in scripts and cron jobs so they do not depend on the current directory.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The prompt is user@host:directory followed by $ (normal user) or # (root).</li>
<li>Linux has one tree starting at <code>/</code>; there are no drive letters.</li>
<li>Configuration is in <code>/etc</code>, logs in <code>/var/log</code>, your files in <code>/home</code>.</li>
<li>Absolute paths start with <code>/</code>; relative paths start from where you are.</li>
<li><code>.</code> is here, <code>..</code> is one level up, <code>~</code> is home; <code>pwd</code> tells you where you are.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> main kahan hoon, aur kisi file ki jagah kaise batayein? Linux mein baaki sab kuch inhi do jawabon par tika hai.</p>

<h3>Prompt padhna</h3>
<p>Login karte hi shell ek <b>prompt</b> print karta hai, ek chhoti line jo kehti hai "main command ke liye ready hoon". Ubuntu par yeh aisa dikhta hai:</p>
<pre class="code">netadmin@nms01:~$</pre>
<ul>
<li><code>netadmin</code> woh user hai jisse aap login ho.</li>
<li><code>nms01</code> server ka hostname hai. Kahin SSH karne ke baad yeh batata hai ki aap kaunsi machine par ho. Risky command se pehle ise hamesha dekho.</li>
<li><code>~</code> woh directory hai jisme aap ho. Tilde aapki <b>home directory</b> ka short form hai, yahan <code>/home/netadmin</code>.</li>
<li><code>$</code> matlab normal user. <b>Root</b>, sabse powerful administrator, ke liye yeh <code>#</code> ban jaata hai. Bilkul Cisco router ke <code>&gt;</code> aur <code>#</code> jaisa.</li>
</ul>
<p><code>/var/log</code> mein jaane par prompt saath chalta hai: <code>netadmin@nms01:/var/log$</code>. Colon ke baad ka hissa hamesha aapki current directory hota hai.</p>

<h3>Ek tree, slash se shuru</h3>
<p>Windows mein drives hote hain (C:, D:). Linux mein directories ka <b>ek hi tree</b> hota hai. Uske top ko <b>root directory</b> kehte hain aur <code>/</code> likhte hain. (Ise <i>root user</i> se mat milao; word dono ke liye use hota hai.) Disks aur USB sticks bhi isi tree ke neeche kahin jud jaate hain. Lab server ki real listing:</p>
<pre class="out">netadmin@nms01:~$ ls /
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var</pre>
<p>Inme se aap sirf kuch hi use karoge:</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Linux directory tree">
<rect x="270" y="10" width="100" height="32" rx="8" fill="#ddd6fe"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="14">/</text>
<rect x="20" y="110" width="110" height="46" rx="8" fill="#bae6fd"/><text x="75" y="130" text-anchor="middle" class="svg-ink" font-size="13">/etc</text><text x="75" y="147" text-anchor="middle" class="svg-muted" font-size="11">config files</text>
<rect x="150" y="110" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="205" y="130" text-anchor="middle" class="svg-ink" font-size="13">/home</text><text x="205" y="147" text-anchor="middle" class="svg-muted" font-size="11">user files</text>
<rect x="280" y="110" width="110" height="46" rx="8" fill="#fde68a"/><text x="335" y="130" text-anchor="middle" class="svg-ink" font-size="13">/var/log</text><text x="335" y="147" text-anchor="middle" class="svg-muted" font-size="11">logs</text>
<rect x="410" y="110" width="100" height="46" rx="8" fill="#fed7aa"/><text x="460" y="130" text-anchor="middle" class="svg-ink" font-size="13">/srv</text><text x="460" y="147" text-anchor="middle" class="svg-muted" font-size="11">serve hota data</text>
<rect x="530" y="110" width="90" height="46" rx="8" fill="#e2e8f0"/><text x="575" y="130" text-anchor="middle" class="svg-ink" font-size="13">/tmp</text><text x="575" y="147" text-anchor="middle" class="svg-muted" font-size="11">scratch</text>
<rect x="150" y="185" width="110" height="34" rx="8" fill="#bbf7d0"/><text x="205" y="206" text-anchor="middle" class="svg-ink" font-size="12">/home/netadmin</text>
<line x1="320" y1="42" x2="75" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="205" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="335" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="460" y2="110" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="42" x2="575" y2="110" stroke="#64748b" stroke-width="1.5"/>
<line x1="205" y1="156" x2="205" y2="185" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">Woh chhe jagahein jahan network engineer sabse zyada jaata hai.</p></div>

<ul>
<li><code>/etc</code> mein <b>configuration files</b> hoti hain, router ki running-config jaisa, par kai text files mein bata hua.</li>
<li><code>/home</code> mein har user ki personal files hoti hain. Aapki <code>/home/netadmin</code> hai.</li>
<li><code>/var/log</code> mein <b>log files</b> hoti hain: <code>syslog</code>, <code>auth.log</code> waghaira.</li>
<li><code>/srv</code> mein woh data hota hai jo server doosron ko serve karta hai, jaise TFTP backups.</li>
<li><code>/tmp</code> scratch jagah hai. Yahan koi bhi likh sakta hai; yeh regularly saaf hoti hai.</li>
<li><code>/opt</code> mein add-on software hota hai, aur <code>/usr</code> mein installed programs.</li>
</ul>
<pre class="out">netadmin@nms01:~$ ls /etc
cron.d  cron.daily  crontab  default  fstab  group  hostname  hosts  issue  motd  netplan  os-release  passwd  resolv.conf  rsyslog.conf  rsyslog.d  shadow  shells  ssh  sudoers  sudoers.d
netadmin@nms01:~$ ls /var/log
auth.log  dpkg.log  kern.log  syslog
netadmin@nms01:~$ cat /etc/hostname
nms01</pre>
<p>Real server ke <code>/etc</code> mein kaafi zyada entries hoti hain; simulator ek chhota selection dikhata hai. Dekho, <code>/etc/hostname</code> bas ek file hai jisme ek word hai. Linux configuration plain text hai.</p>

<h3>Paths: file ka address</h3>
<p><b>Path</b> kisi file ya directory ka address hai, levels ke beech slash ke saath. Do tarah ke hote hain.</p>
<ul>
<li><b>Absolute path</b> <code>/</code> se shuru hota hai aur kahin se bhi chalta hai: <code>/var/log/syslog</code>.</li>
<li><b>Relative path</b> <code>/</code> se shuru nahi hota; woh abhi jahan ho wahan se shuru hota hai. Agar aap <code>/var</code> mein ho, to <code>log/syslog</code> wahi file hai.</li>
</ul>
<p>Relative paths ke liye teen special naam madad karte hain: <code>.</code> matlab <i>yahi directory</i>, <code>..</code> matlab <i>ek level upar</i>, aur <code>~</code> matlab <i>meri home directory</i>.</p>

<div class="eg"><p><b>Worked example.</b> Aap <code>/home/netadmin/incoming</code> mein ho. File <code>/home/netadmin/archive/routers/PUN-CORE-R1.cfg</code> ko aise likh sakte ho:</p><ul><li>absolute: <code>/home/netadmin/archive/routers/PUN-CORE-R1.cfg</code></li><li>home se: <code>~/archive/routers/PUN-CORE-R1.cfg</code></li><li>relative: <code>../archive/routers/PUN-CORE-R1.cfg</code> (ek upar /home/netadmin, phir neeche)</li></ul><p>Teeno ek hi file ka naam hain. Scripts aur notes mein absolute paths, jaldi type karne mein relative paths use karo.</p></div>

<p>Jab bhi pata na ho ki kahan ho, <code>pwd</code> (print working directory) chalao:</p>
<pre class="out">netadmin@nms01:~$ pwd
/home/netadmin</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>archive/routers</code> ki jagah <code>/archive/routers</code> type karna. Shuru ka slash use poore tree ke top se shuru karta hai, isliye woh exist nahi karta. (2) Yeh bhoolna ki <code>~</code> user ka hota hai: user <code>root</code> ke liye yeh <code>/root</code> hai, <code>/home/root</code> nahi. (3) Prompt ka hostname padhe bina galat server par command chalana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "File system ke top ka path kya hai?" ka jawab <code>/</code> hai, <code>C:</code> nahi aur <code>~</code> nahi. Aur <code>/root</code> (root user ki home) <code>/</code> (root directory) se alag hai.</p></div>

<div class="scn"><h4>Galat server, sahi command</h4><p>Ek engineer ne cleanup command chalaya, yeh sochkar ki woh staging jump host par hai. Prompt mein <code>netadmin@jump01</code> tha, <code>jump-stg</code> nahi. Usne Enter dabane se pehle prompt padha, farq dekha, aur <code>exit</code> type karke sahi session mein wapas aa gaya. Ek hafte pehle ek colleague ne yeh nazar nahi daali thi aur production server ke logs saaf kar diye the.</p><p><b>Lesson:</b> prompt ka hostname aapki seat belt hai. Har baar padho.</p></div>

<div class="iv"><p class="q">"Absolute aur relative path mein kya difference hai?"</p><p>Absolute path tree ke root se slash ke saath shuru hota hai aur har directory se ek hi matlab rakhta hai. Relative path current directory se shuru hota hai aur jagah badalne par matlab badal jaata hai. <code>.</code> aur <code>..</code> ka zikr karo, aur batao ki scripts aur cron jobs mein absolute paths use karte ho taaki woh current directory par depend na karein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prompt user@host:directory hota hai, uske baad $ (normal user) ya # (root).</li>
<li>Linux mein ek tree <code>/</code> se shuru hota hai; drive letters nahi hote.</li>
<li>Configuration <code>/etc</code> mein, logs <code>/var/log</code> mein, aapki files <code>/home</code> mein.</li>
<li>Absolute paths <code>/</code> se shuru hote hain; relative paths jahan ho wahan se.</li>
<li><code>.</code> yahan, <code>..</code> ek level upar, <code>~</code> home; <code>pwd</code> batata hai aap kahan ho.</li>
</ul></div>
`}};export{e as default};