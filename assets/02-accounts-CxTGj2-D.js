var e={id:`accounts`,h:{en:`Accounts: users, UIDs, groups and /etc/passwd`,hi:`Accounts: users, UIDs, groups aur /etc/passwd`},body:{en:`
<p><b>The idea of this chapter:</b> a Linux account is just a line in a text file. The system works with <b>numbers</b> (UID and GID); names are only labels for people. Learn to read that line and you can answer "who is this, and what can they reach?" in seconds.</p>

<h3>One line, seven fields</h3>
<pre class="out">netadmin@jump01:~$ grep netadmin /etc/passwd
netadmin:x:1001:1001::/home/netadmin:/bin/bash
netadmin@jump01:~$ getent passwd netadmin
netadmin:x:1001:1001::/home/netadmin:/bin/bash</pre>
<p>The fields are separated by colons:</p>
<table class="cmp"><tr><th>#</th><th>Value</th><th>Meaning</th></tr>
<tr><td>1</td><td><code>netadmin</code></td><td>login name</td></tr>
<tr><td>2</td><td><code>x</code></td><td>password placeholder; the hash is in <code>/etc/shadow</code></td></tr>
<tr><td>3</td><td><code>1001</code></td><td><b>UID</b>, the user number</td></tr>
<tr><td>4</td><td><code>1001</code></td><td><b>GID</b>, the main group number</td></tr>
<tr><td>5</td><td>(empty)</td><td>comment, such as the full name</td></tr>
<tr><td>6</td><td><code>/home/netadmin</code></td><td>home directory</td></tr>
<tr><td>7</td><td><code>/bin/bash</code></td><td>login shell, the program that starts at login</td></tr></table>
<p><code>getent passwd</code> asks the system for the account, wherever it is stored (a local file, or a directory service such as LDAP in a big company). <code>grep</code> only reads the local file. In real life prefer <code>getent</code>.</p>

<h3>Three kinds of accounts</h3>
<pre class="out">netadmin@jump01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
syslog:x:104:110::/nonexistent:/usr/sbin/nologin
netadmin:x:1001:1001::/home/netadmin:/bin/bash</pre>
<table class="cmp"><tr><th>Kind</th><th>UID</th><th>Example</th><th>Shell</th></tr>
<tr><td>root (superuser)</td><td>0</td><td><code>root</code></td><td>bash</td></tr>
<tr><td>system / service accounts</td><td>1 to 999</td><td><code>www-data</code>, <code>syslog</code></td><td><code>nologin</code></td></tr>
<tr><td>human users</td><td>1000 and up</td><td><code>netadmin</code></td><td>bash</td></tr></table>
<p><b>UID 0 is root</b>, not the name. Any account with UID 0 has full power, so you check for unexpected UID 0 lines during a security review. Service accounts such as <code>syslog</code> run a program but must never be a way to log in, so their shell is <code>/usr/sbin/nologin</code>, which refuses a login.</p>

<h3>Groups</h3>
<p>Groups are listed in <code>/etc/group</code>: <code>name:x:GID:member,member</code>.</p>
<pre class="out">netadmin@jump01:~$ cat /etc/group
root:x:0:
daemon:x:1:
adm:x:4:syslog,netadmin
tty:x:5:
sudo:x:27:netadmin
www-data:x:33:
users:x:100:
syslog:x:110:
crontab:x:111:
netadmin:x:1001:
netadmin@jump01:~$ getent group sudo
sudo:x:27:netadmin</pre>
<p>Read <code>adm:x:4:syslog,netadmin</code> as "group adm, number 4, members syslog and netadmin". Each user also has a <b>private group</b> with the same name (<code>netadmin:x:1001:</code>), which is the main group. The extra memberships, called <b>supplementary groups</b>, give extra access: <code>adm</code> reads logs, <code>sudo</code> asks for admin rights.</p>

<h3>id and groups</h3>
<pre class="out">netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)
netadmin@jump01:~$ groups
netadmin adm sudo</pre>
<p><code>id</code> shows numbers and names; <code>groups</code> shows names only. <code>id ravi</code> shows another user's groups. When an access problem appears, this is the first command to run.</p>

<h3>Becoming another user</h3>
<p><code>su - name</code> starts a login shell as another user and asks for <b>that user's</b> password. The dash gives a clean environment and the user's home directory. We use it in later chapters to test what a person really sees.</p>
<p><b>Reference commands (not run in the simulator):</b> options you will see on a real server.</p>
<pre class="code">getent passwd | cut -d: -f1       # list all account names
awk -F: '$3 == 0' /etc/passwd     # accounts with UID 0 (should be only root)
awk -F: '$7 !~ /nologin/' /etc/passwd   # accounts that can log in
last                              # recent logins
lastlog                           # last login time per account</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking the name matters to the kernel; it is the UID. (2) Editing <code>/etc/passwd</code> by hand instead of using <code>useradd</code> and <code>usermod</code>. (3) Giving a service account a real shell. (4) Forgetting that <code>id</code> shows groups at login time; a group added later needs a new login (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> UID 0 = root; below 1000 = system accounts; the second field <code>x</code> means the hash is in shadow; a user's main group is the GID in field 4 of <code>/etc/passwd</code>.</p></div>

<div class="scn"><h4>The second root</h4><p>During an audit, a one-line check <code>awk -F: '$3 == 0' /etc/passwd</code> returned two accounts: <code>root</code> and <code>support</code>. The second one had UID 0, so it was a hidden root account, created years earlier for a vendor. It was disabled the same day.</p><p><b>Lesson:</b> the UID, not the name, decides the power.</p></div>

<div class="iv"><p class="q">"What does an /etc/passwd entry contain, and what is a UID?"</p><p>Seven colon-separated fields: login name, password placeholder, UID, GID, comment, home directory and login shell. The UID is the number the kernel uses to identify the user: 0 is root, 1 to 999 are system accounts and 1000 upward are normal users. Password hashes are in <code>/etc/shadow</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An account is a line in <code>/etc/passwd</code>; the kernel uses the UID and GID numbers.</li>
<li>UID 0 is root; service accounts use <code>nologin</code>.</li>
<li>Groups are in <code>/etc/group</code>; every user has a private main group plus optional extra groups.</li>
<li><code>id</code>, <code>groups</code> and <code>getent</code> show the facts; <code>su - name</code> becomes that user.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Linux account bas ek text file ki line hai. System <b>numbers</b> (UID aur GID) se kaam karta hai; naam sirf insaanon ke liye label hain. Us line ko padhna seekh lo to "yeh kaun hai, aur kahan tak pahunch sakta hai?" ka jawab seconds mein mil jaata hai.</p>

<h3>Ek line, saat fields</h3>
<pre class="out">netadmin@jump01:~$ grep netadmin /etc/passwd
netadmin:x:1001:1001::/home/netadmin:/bin/bash
netadmin@jump01:~$ getent passwd netadmin
netadmin:x:1001:1001::/home/netadmin:/bin/bash</pre>
<p>Fields colon se alag hote hain:</p>
<table class="cmp"><tr><th>#</th><th>Value</th><th>Matlab</th></tr>
<tr><td>1</td><td><code>netadmin</code></td><td>login name</td></tr>
<tr><td>2</td><td><code>x</code></td><td>password placeholder; hash <code>/etc/shadow</code> mein hai</td></tr>
<tr><td>3</td><td><code>1001</code></td><td><b>UID</b>, user number</td></tr>
<tr><td>4</td><td><code>1001</code></td><td><b>GID</b>, main group number</td></tr>
<tr><td>5</td><td>(khaali)</td><td>comment, jaise poora naam</td></tr>
<tr><td>6</td><td><code>/home/netadmin</code></td><td>home directory</td></tr>
<tr><td>7</td><td><code>/bin/bash</code></td><td>login shell, login par chalne wala program</td></tr></table>
<p><code>getent passwd</code> system se account maangta hai, chahe woh kahin bhi stored ho (local file, ya badi company mein LDAP jaisi directory service). <code>grep</code> sirf local file padhta hai. Real life mein <code>getent</code> behtar hai.</p>

<h3>Teen tarah ke accounts</h3>
<pre class="out">netadmin@jump01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
syslog:x:104:110::/nonexistent:/usr/sbin/nologin
netadmin:x:1001:1001::/home/netadmin:/bin/bash</pre>
<table class="cmp"><tr><th>Kism</th><th>UID</th><th>Example</th><th>Shell</th></tr>
<tr><td>root (superuser)</td><td>0</td><td><code>root</code></td><td>bash</td></tr>
<tr><td>system / service accounts</td><td>1 se 999</td><td><code>www-data</code>, <code>syslog</code></td><td><code>nologin</code></td></tr>
<tr><td>human users</td><td>1000 aur upar</td><td><code>netadmin</code></td><td>bash</td></tr></table>
<p><b>UID 0 root hai</b>, naam nahi. UID 0 wale kisi bhi account ke paas poori power hoti hai, isliye security review mein unexpected UID 0 lines check karte hain. <code>syslog</code> jaise service accounts program chalate hain par login ka raasta nahi hone chahiye, isliye unka shell <code>/usr/sbin/nologin</code> hai, jo login refuse karta hai.</p>

<h3>Groups</h3>
<p>Groups <code>/etc/group</code> mein hain: <code>name:x:GID:member,member</code>.</p>
<pre class="out">netadmin@jump01:~$ cat /etc/group
root:x:0:
daemon:x:1:
adm:x:4:syslog,netadmin
tty:x:5:
sudo:x:27:netadmin
www-data:x:33:
users:x:100:
syslog:x:110:
crontab:x:111:
netadmin:x:1001:
netadmin@jump01:~$ getent group sudo
sudo:x:27:netadmin</pre>
<p><code>adm:x:4:syslog,netadmin</code> ko aise padho: "group adm, number 4, members syslog aur netadmin". Har user ka ek <b>private group</b> bhi hota hai, wahi naam (<code>netadmin:x:1001:</code>), jo main group hai. Extra memberships, jinhe <b>supplementary groups</b> kehte hain, extra access dete hain: <code>adm</code> logs padhta hai, <code>sudo</code> admin rights maangta hai.</p>

<h3>id aur groups</h3>
<pre class="out">netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)
netadmin@jump01:~$ groups
netadmin adm sudo</pre>
<p><code>id</code> numbers aur naam dikhata hai; <code>groups</code> sirf naam. <code>id ravi</code> kisi doosre user ki groups dikhata hai. Access problem aaye to yahi pehla command hai.</p>

<h3>Doosra user banna</h3>
<p><code>su - name</code> doosre user ka login shell shuru karta hai aur <b>us user ka</b> password maangta hai. Dash saaf environment aur us user ki home directory deta hai. Aage ke chapters mein hum ise yeh test karne ke liye use karte hain ki insaan ko sach mein kya dikhta hai.</p>
<p><b>Reference commands (simulator mein nahi chalte):</b> real server par milne wale options.</p>
<pre class="code">getent passwd | cut -d: -f1       # saare account names
awk -F: '$3 == 0' /etc/passwd     # UID 0 wale accounts (sirf root hona chahiye)
awk -F: '$7 !~ /nologin/' /etc/passwd   # jo accounts login kar sakte hain
last                              # recent logins
lastlog                           # har account ka last login time</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Sochna ki kernel ke liye naam matter karta hai; woh UID dekhta hai. (2) <code>/etc/passwd</code> haath se edit karna, <code>useradd</code> aur <code>usermod</code> ki jagah. (3) Service account ko real shell dena. (4) Bhoolna ki <code>id</code> login ke time ki groups dikhata hai; baad mein jodi gayi group ke liye naya login chahiye (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> UID 0 = root; 1000 se neeche = system accounts; doosre field ka <code>x</code> matlab hash shadow mein; user ka main group <code>/etc/passwd</code> ke field 4 ka GID hai.</p></div>

<div class="scn"><h4>Doosra root</h4><p>Audit mein ek line ke check <code>awk -F: '$3 == 0' /etc/passwd</code> ne do accounts diye: <code>root</code> aur <code>support</code>. Doosre ka UID 0 tha, yaani chhupa hua root account, jo saalon pehle vendor ke liye bana tha. Usse usi din disable kar diya gaya.</p><p><b>Lesson:</b> power UID tay karta hai, naam nahi.</p></div>

<div class="iv"><p class="q">"/etc/passwd entry mein kya hota hai, aur UID kya hai?"</p><p>Saat colon-separated fields: login name, password placeholder, UID, GID, comment, home directory aur login shell. UID woh number hai jisse kernel user ko pehchanta hai: 0 root hai, 1 se 999 system accounts hain aur 1000 se upar normal users. Password hashes <code>/etc/shadow</code> mein hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Account <code>/etc/passwd</code> ki ek line hai; kernel UID aur GID numbers use karta hai.</li>
<li>UID 0 root hai; service accounts <code>nologin</code> use karte hain.</li>
<li>Groups <code>/etc/group</code> mein hain; har user ka private main group hota hai plus optional extra groups.</li>
<li><code>id</code>, <code>groups</code> aur <code>getent</code> facts dikhate hain; <code>su - name</code> us user ban jaata hai.</li>
</ul></div>
`}};export{e as default};