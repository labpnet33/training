var e={id:`troubleshooting`,h:{en:`Troubleshooting "Permission denied": the backup job ticket`,hi:`"Permission denied" troubleshoot karna: backup job ticket`},body:{en:`
<p><b>The idea of this chapter:</b> "Permission denied" always has a reason you can read. Do not guess and do not reach for <code>chmod 777</code>. Follow a short routine: <b>who am I, what is the file, what are the folders on the way, what is the smallest fix, test as the user</b>.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Permission denied routine">
<rect x="8" y="30" width="112" height="50" rx="10" fill="#bae6fd"/><text x="64" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Who am I</text><text x="64" y="68" text-anchor="middle" class="svg-muted" font-size="11">id</text>
<rect x="132" y="30" width="112" height="50" rx="10" fill="#bbf7d0"/><text x="188" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 The file</text><text x="188" y="68" text-anchor="middle" class="svg-muted" font-size="11">ls -l</text>
<rect x="256" y="30" width="112" height="50" rx="10" fill="#fde68a"/><text x="312" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 The folders</text><text x="312" y="68" text-anchor="middle" class="svg-muted" font-size="11">ls -ld</text>
<rect x="380" y="30" width="112" height="50" rx="10" fill="#e9d5ff"/><text x="436" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Smallest fix</text><text x="436" y="68" text-anchor="middle" class="svg-muted" font-size="11">chmod chgrp</text>
<rect x="504" y="30" width="126" height="50" rx="10" fill="#fecaca"/><text x="567" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 Test as user</text><text x="567" y="68" text-anchor="middle" class="svg-muted" font-size="11">su - name</text>
</svg><p class="cap">Five steps, in this order.</p></div>

<h3>The ticket (lab 2)</h3>
<p><b>NK-2290 from Ravi:</b> "I am supposed to run the nightly backup script <code>/opt/nkbackup/backup.sh</code>, but I only get Permission denied." The backup team uses the group <code>netbackup</code>. Also, the security team noticed that the TFTP password file next to the script is readable by every user. Fix both, properly.</p>

<h3>Steps 1-2: reproduce as the user, read the file</h3>
<p>Always reproduce the problem as the person who has it. <code>su - ravi</code> gives you his view (you type his password).</p>
<pre class="out">netadmin@jump01:~$ su - ravi
ravi@jump01:~$ /opt/nkbackup/backup.sh
-bash: /opt/nkbackup/backup.sh: Permission denied
ravi@jump01:~$ ls -l /opt/nkbackup/
total 8
-rw-r--r--  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r--r--  1 root     root        105 Sep 29 09:00 creds.conf
ravi@jump01:~$ exit</pre>
<p><code>-rw-r--r--</code> with owner root: Ravi falls in the <b>others</b> row, which has <code>r</code> but no <code>x</code>. Cause number one: <b>the script is not executable</b>. The smallest fix is to add execute for everybody and keep root as the only writer. Since the file belongs to root, use <code>sudo</code>:</p>
<pre class="out">netadmin@jump01:~$ sudo chmod 755 /opt/nkbackup/backup.sh
netadmin@jump01:~$ ls -l /opt/nkbackup/backup.sh
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 /opt/nkbackup/backup.sh</pre>

<h3>Step 3: the next error is a different one</h3>
<p>Test again as Ravi. The script now starts, but it fails in a new way:</p>
<pre class="out">ravi@jump01:~$ /opt/nkbackup/backup.sh
backup done
-bash: /srv/backups/run.log: Permission denied
cp: cannot create regular file '/srv/backups/hosts.bak': Permission denied
ravi@jump01:~$ ls -ld /srv/backups
drwxr-xr-x  2 root     root       4096 Sep 29 09:00 /srv/backups</pre>
<p>Notice: the error names a <b>different path</b>. The script now runs, but it must write into <code>/srv/backups</code>, and that directory is <code>drwxr-xr-x</code> owned by root. Ravi is in the others row and has no <code>w</code>. (On a real terminal the two error lines appear before <code>backup done</code>, because they happen first; the simulator prints the normal output first.) Lesson: after every fix, read the <b>new</b> message; one ticket can hide several permission problems in a row, and a script touches many paths.</p>
<p>The right fix is not to open the folder for everyone. The backup team has a group, <code>netbackup</code>. Give it the folder, add the setgid bit (chapter 5), and put Ravi in the group:</p>
<pre class="out">netadmin@jump01:~$ sudo chgrp netbackup /srv/backups
netadmin@jump01:~$ sudo chmod 2775 /srv/backups
netadmin@jump01:~$ sudo usermod -aG netbackup ravi
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1001(netbackup)
netadmin@jump01:~$ getent group netbackup
netbackup:x:1001:ravi</pre>

<h3>Step 5: test with a fresh login</h3>
<pre class="out">netadmin@jump01:~$ su - ravi
ravi@jump01:~$ id
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1001(netbackup)
ravi@jump01:~$ /opt/nkbackup/backup.sh
backup done
ravi@jump01:~$ cat /srv/backups/run.log
Tue Sep 29 09:00:30 IST 2026 backup started by ravi
ravi@jump01:~$ ls -l /srv/backups
total 8
-rw-r--r--  1 ravi     netbackup    132 Sep 29 09:00 hosts.bak
-rw-rw-r--  1 ravi     netbackup     52 Sep 29 09:00 run.log
ravi@jump01:~$ exit</pre>
<p>The job works, and both new files carry the group <code>netbackup</code> because of setgid. Testing with <code>su - ravi</code> matters: a fresh login is what proves that the group change is active.</p>

<h3>The second problem: the password file</h3>
<p>The listing in step 2 showed <code>creds.conf</code> as <code>-rw-r--r--</code>: any user, including Priya, could read the backup password. It should be readable only by root and the backup group. Change the group and remove access for others:</p>
<pre class="out">netadmin@jump01:~$ sudo chown root:netbackup /opt/nkbackup/creds.conf
netadmin@jump01:~$ sudo chmod 640 /opt/nkbackup/creds.conf
netadmin@jump01:~$ ls -l /opt/nkbackup/
total 8
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r-----  1 root     netbackup    105 Sep 29 09:00 creds.conf
netadmin@jump01:~$ su - priya
priya@jump01:~$ cat /opt/nkbackup/creds.conf
cat: /opt/nkbackup/creds.conf: Permission denied
priya@jump01:~$ exit</pre>
<p>Mode 640 means: root reads and writes, the group <code>netbackup</code> reads, everybody else gets nothing. Priya is not in the group, so she is denied, which is the correct result. Ravi (in <code>netbackup</code>) can still read it. The same pattern, group plus a mode with no access for others, fixes most "who may read this?" tickets. Because the password was readable before, the security team may also decide to change it: that is a policy decision after the exposure.</p>

<h3>Reading the message</h3>
<table class="cmp"><tr><th>Message</th><th>Likely cause</th><th>Look at</th></tr>
<tr><td><code>Permission denied</code> when running a script</td><td>no <code>x</code> bit</td><td><code>ls -l file</code></td></tr>
<tr><td><code>Permission denied</code> when creating or deleting</td><td>no <code>w</code> on the <b>directory</b></td><td><code>ls -ld dir</code></td></tr>
<tr><td><code>Permission denied</code> deep in a path</td><td>no <code>x</code> on a parent directory</td><td><code>ls -ld</code> on each parent</td></tr>
<tr><td>group was added but still denied</td><td>old login session</td><td><code>id</code>, then log in again</td></tr>
<tr><td><code>Operation not permitted</code></td><td>not the owner (chmod, chown)</td><td>use <code>sudo</code> or the owner</td></tr>
<tr><td><code>command not found</code></td><td>not a permission problem</td><td><code>which</code>, <code>echo $PATH</code></td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>chmod 777</code> or <code>chmod -R 777</code>. (2) Testing only as yourself, who has sudo. (3) Fixing the file but forgetting the directory (or the other way round). (4) Adding the group but not logging in again before testing. (5) Leaving a secret readable and "fixing" only the failing job.</p></div>
<div class="exam"><p><b>Exam trap.</b> The error is about <b>the user who runs the command</b>. To create or delete you need <code>w</code> and <code>x</code> on the directory. To fix group access: <code>chgrp</code> or <code>chown :group</code>, then <code>chmod</code> with a group digit, and a new login for new members.</p></div>

<div class="scn"><h4>Two tickets in one</h4><p>A job failed with "Permission denied". The first fix, adding <code>x</code> to the script, only moved the error to a different path. The engineer who read the <b>new</b> message found the real cause, a root-owned output folder, fixed it with group <code>netbackup</code>, and while doing so closed the open password file. Total time: fifteen minutes, with no <code>chmod 777</code>.</p><p><b>Lesson:</b> follow the message, one error at a time, and look around for neighbouring exposure.</p></div>

<div class="iv"><p class="q">"A user says 'Permission denied' on a script. How do you troubleshoot?"</p><p>I reproduce it as that user with <code>su - user</code>, check <code>id</code> for groups, then <code>ls -l</code> the file and <code>ls -ld</code> the directories on its path. I find which row (owner, group, others) applies and what is missing, apply the smallest fix such as <code>chmod +x</code> or a group and mode, and test again as the user. I never use 777, and I read each new error because there may be several.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: <code>id</code>, <code>ls -l</code>, <code>ls -ld</code> on the folders, smallest fix, test with <code>su - user</code>.</li>
<li>Scripts need <code>x</code>; creating files needs <code>w</code> on the directory; new groups need a new login.</li>
<li>Fix access with a group and a mode, not with 777.</li>
<li>Read every new error message; check neighbouring secrets such as credentials files.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> "Permission denied" ki hamesha ek wajah hoti hai jo aap padh sakte ho. Andaza mat lagao aur <code>chmod 777</code> par mat jao. Chhoti routine follow karo: <b>main kaun hoon, file kya hai, raaste ke folders kya hain, sabse chhota fix kya hai, user ke roop mein test</b>.</p>

<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Permission denied routine">
<rect x="8" y="30" width="112" height="50" rx="10" fill="#bae6fd"/><text x="64" y="52" text-anchor="middle" class="svg-ink" font-size="12">1 Main kaun</text><text x="64" y="68" text-anchor="middle" class="svg-muted" font-size="11">id</text>
<rect x="132" y="30" width="112" height="50" rx="10" fill="#bbf7d0"/><text x="188" y="52" text-anchor="middle" class="svg-ink" font-size="12">2 File</text><text x="188" y="68" text-anchor="middle" class="svg-muted" font-size="11">ls -l</text>
<rect x="256" y="30" width="112" height="50" rx="10" fill="#fde68a"/><text x="312" y="52" text-anchor="middle" class="svg-ink" font-size="12">3 Folders</text><text x="312" y="68" text-anchor="middle" class="svg-muted" font-size="11">ls -ld</text>
<rect x="380" y="30" width="112" height="50" rx="10" fill="#e9d5ff"/><text x="436" y="52" text-anchor="middle" class="svg-ink" font-size="12">4 Chhota fix</text><text x="436" y="68" text-anchor="middle" class="svg-muted" font-size="11">chmod chgrp</text>
<rect x="504" y="30" width="126" height="50" rx="10" fill="#fecaca"/><text x="567" y="52" text-anchor="middle" class="svg-ink" font-size="12">5 User se test</text><text x="567" y="68" text-anchor="middle" class="svg-muted" font-size="11">su - name</text>
</svg><p class="cap">Paanch steps, isi order mein.</p></div>

<h3>Ticket (lab 2)</h3>
<p><b>Ravi ka NK-2290:</b> "Mujhe nightly backup script <code>/opt/nkbackup/backup.sh</code> chalani hai, par sirf Permission denied milta hai." Backup team group <code>netbackup</code> use karti hai. Saath hi security team ne dekha ki script ke paas wali TFTP password file har user padh sakta hai. Dono sahi tareeke se theek karo.</p>

<h3>Steps 1-2: user ke roop mein reproduce karo, file padho</h3>
<p>Problem hamesha usi insaan ke roop mein reproduce karo jiske saath hai. <code>su - ravi</code> aapko uska nazariya deta hai (uska password type karo).</p>
<pre class="out">netadmin@jump01:~$ su - ravi
ravi@jump01:~$ /opt/nkbackup/backup.sh
-bash: /opt/nkbackup/backup.sh: Permission denied
ravi@jump01:~$ ls -l /opt/nkbackup/
total 8
-rw-r--r--  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r--r--  1 root     root        105 Sep 29 09:00 creds.conf
ravi@jump01:~$ exit</pre>
<p><code>-rw-r--r--</code> aur owner root: Ravi <b>others</b> row mein aata hai, jisme <code>r</code> hai par <code>x</code> nahi. Pehli wajah: <b>script executable nahi hai</b>. Sabse chhota fix sab ke liye execute jodna hai aur sirf root ko writer rakhna. File root ki hai, isliye <code>sudo</code>:</p>
<pre class="out">netadmin@jump01:~$ sudo chmod 755 /opt/nkbackup/backup.sh
netadmin@jump01:~$ ls -l /opt/nkbackup/backup.sh
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 /opt/nkbackup/backup.sh</pre>

<h3>Step 3: agla error alag hai</h3>
<p>Ravi ke roop mein dobara test karo. Script ab shuru hoti hai, par naye tareeke se fail hoti hai:</p>
<pre class="out">ravi@jump01:~$ /opt/nkbackup/backup.sh
backup done
-bash: /srv/backups/run.log: Permission denied
cp: cannot create regular file '/srv/backups/hosts.bak': Permission denied
ravi@jump01:~$ ls -ld /srv/backups
drwxr-xr-x  2 root     root       4096 Sep 29 09:00 /srv/backups</pre>
<p>Dhyan do: error mein <b>alag path</b> hai. Script ab chalti hai, par use <code>/srv/backups</code> mein likhna hai, aur woh directory root ki <code>drwxr-xr-x</code> hai. Ravi others row mein hai aur uske paas <code>w</code> nahi. (Real terminal par dono error lines <code>backup done</code> se pehle aati hain, kyunki woh pehle hoti hain; simulator normal output pehle print karta hai.) Seekh: har fix ke baad <b>naya</b> message padho; ek ticket mein kai permission problems line se chhupi ho sakti hain, aur script kai paths ko chhoti hai.</p>
<p>Sahi fix folder ko sab ke liye kholna nahi hai. Backup team ka group <code>netbackup</code> hai. Folder use do, setgid bit lagao (chapter 5), aur Ravi ko group mein jodo:</p>
<pre class="out">netadmin@jump01:~$ sudo chgrp netbackup /srv/backups
netadmin@jump01:~$ sudo chmod 2775 /srv/backups
netadmin@jump01:~$ sudo usermod -aG netbackup ravi
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1001(netbackup)
netadmin@jump01:~$ getent group netbackup
netbackup:x:1001:ravi</pre>

<h3>Step 5: fresh login se test</h3>
<pre class="out">netadmin@jump01:~$ su - ravi
ravi@jump01:~$ id
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1001(netbackup)
ravi@jump01:~$ /opt/nkbackup/backup.sh
backup done
ravi@jump01:~$ cat /srv/backups/run.log
Tue Sep 29 09:00:30 IST 2026 backup started by ravi
ravi@jump01:~$ ls -l /srv/backups
total 8
-rw-r--r--  1 ravi     netbackup    132 Sep 29 09:00 hosts.bak
-rw-rw-r--  1 ravi     netbackup     52 Sep 29 09:00 run.log
ravi@jump01:~$ exit</pre>
<p>Job chal gayi, aur dono nayi files ka group setgid ki wajah se <code>netbackup</code> hai. <code>su - ravi</code> se test karna matter karta hai: fresh login hi saabit karta hai ki group change active hai.</p>

<h3>Doosri problem: password file</h3>
<p>Step 2 ki listing mein <code>creds.conf</code> <code>-rw-r--r--</code> thi: koi bhi user, Priya samet, backup password padh sakta tha. Use sirf root aur backup group padh sake. Group badlo aur others ka access hatao:</p>
<pre class="out">netadmin@jump01:~$ sudo chown root:netbackup /opt/nkbackup/creds.conf
netadmin@jump01:~$ sudo chmod 640 /opt/nkbackup/creds.conf
netadmin@jump01:~$ ls -l /opt/nkbackup/
total 8
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r-----  1 root     netbackup    105 Sep 29 09:00 creds.conf
netadmin@jump01:~$ su - priya
priya@jump01:~$ cat /opt/nkbackup/creds.conf
cat: /opt/nkbackup/creds.conf: Permission denied
priya@jump01:~$ exit</pre>
<p>Mode 640 ka matlab: root padhta aur likhta hai, group <code>netbackup</code> padhta hai, baaki sab ko kuch nahi. Priya group mein nahi hai, isliye denied, jo sahi result hai. Ravi (<code>netbackup</code> mein) ab bhi padh sakta hai. Wahi pattern, group plus others ke liye no-access mode, "ise kaun padh sakta hai?" ke zyadatar tickets theek karta hai. Kyunki password pehle readable tha, security team use badalne ka faisla bhi kar sakti hai: yeh exposure ke baad ka policy faisla hai.</p>

<h3>Message padhna</h3>
<table class="cmp"><tr><th>Message</th><th>Sambhav wajah</th><th>Kahan dekho</th></tr>
<tr><td>Script chalate waqt <code>Permission denied</code></td><td><code>x</code> bit nahi</td><td><code>ls -l file</code></td></tr>
<tr><td>Banate ya delete karte waqt <code>Permission denied</code></td><td><b>directory</b> par <code>w</code> nahi</td><td><code>ls -ld dir</code></td></tr>
<tr><td>Path ke andar gehre <code>Permission denied</code></td><td>kisi parent directory par <code>x</code> nahi</td><td>har parent par <code>ls -ld</code></td></tr>
<tr><td>group jodi par phir bhi denied</td><td>purana login session</td><td><code>id</code>, phir dobara login</td></tr>
<tr><td><code>Operation not permitted</code></td><td>owner nahi (chmod, chown)</td><td><code>sudo</code> ya owner use karo</td></tr>
<tr><td><code>command not found</code></td><td>permission problem nahi</td><td><code>which</code>, <code>echo $PATH</code></td></tr></table>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>chmod 777</code> ya <code>chmod -R 777</code>. (2) Sirf apne roop mein test karna, jiske paas sudo hai. (3) File theek karna par directory bhoolna (ya ulta). (4) Group jodna par test se pehle dobara login na karna. (5) Secret readable chhodkar sirf fail hoti job ko "fix" karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Error <b>command chalane wale user</b> ke baare mein hai. Banane ya delete karne ke liye directory par <code>w</code> aur <code>x</code> chahiye. Group access fix: <code>chgrp</code> ya <code>chown :group</code>, phir group digit ke saath <code>chmod</code>, aur naye members ke liye naya login.</p></div>

<div class="scn"><h4>Do tickets ek mein</h4><p>Ek job "Permission denied" se fail hui. Pehle fix, script mein <code>x</code> jodna, ne error ko sirf alag path par kar diya. Jis engineer ne <b>naya</b> message padha use asli wajah mili, root ka output folder, jise group <code>netbackup</code> se theek kiya, aur saath hi khuli password file bhi band ki. Kul samay: pandrah minute, bina <code>chmod 777</code> ke.</p><p><b>Lesson:</b> message ko follow karo, ek ek error karke, aur aas-paas ke exposure ko bhi dekho.</p></div>

<div class="iv"><p class="q">"User kehta hai script par 'Permission denied'. Troubleshoot kaise karoge?"</p><p>Main use <code>su - user</code> se reproduce karta hoon, groups ke liye <code>id</code> dekhta hoon, phir file par <code>ls -l</code> aur uske path ki directories par <code>ls -ld</code>. Pata karta hoon kaunsi row (owner, group, others) lagti hai aur kya kam hai, sabse chhota fix, jaise <code>chmod +x</code> ya group aur mode, lagata hoon, aur user ke roop mein dobara test karta hoon. 777 kabhi nahi, aur har naya error padhta hoon kyunki kai ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: <code>id</code>, <code>ls -l</code>, folders par <code>ls -ld</code>, sabse chhota fix, <code>su - user</code> se test.</li>
<li>Scripts ko <code>x</code> chahiye; files banane ke liye directory par <code>w</code>; naye groups ko naya login.</li>
<li>Access group aur mode se theek karo, 777 se nahi.</li>
<li>Har naya error message padho; credentials files jaise aas-paas ke secrets check karo.</li>
</ul></div>
`}};export{e as default};