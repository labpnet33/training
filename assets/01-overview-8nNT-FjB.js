var e={id:`overview`,h:{en:`Why users, groups and permissions matter`,hi:`Users, groups aur permissions kyun zaroori hain`},body:{en:`
<p><b>The idea of this chapter:</b> a Linux server is shared. The NOC engineers, the backup job, the web server and the syslog service all live on the same machine. Linux keeps them from damaging each other with three questions asked on <b>every single action</b>: <i>who are you</i> (user), <i>which team are you in</i> (group), and <i>what does this file allow</i> (permissions).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Who, what, allowed">
<rect x="20" y="50" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="14">User</text><text x="95" y="102" text-anchor="middle" class="svg-muted" font-size="12">netadmin, ravi</text>
<rect x="245" y="50" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Permission check</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">owner / group / others</text>
<rect x="470" y="50" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">File or command</text><text x="545" y="102" text-anchor="middle" class="svg-muted" font-size="12">/srv/noc, backup.sh</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">allowed or Permission denied</text>
</svg><p class="cap">Every action passes the permission check.</p></div>

<h3>Why a network engineer cares</h3>
<ul>
<li><b>Least privilege.</b> A new L1 engineer should see logs and restart one service, not reconfigure the whole jump host.</li>
<li><b>Shared folders.</b> A team keeps shift notes and backups in one place; the right people must be able to write and the wrong people must not read.</li>
<li><b>Secrets.</b> Files with passwords (backup credentials, SNMP strings) must not be readable by everyone.</li>
<li><b>Audit.</b> When something changes, the log should show which person did it, so shared logins are avoided.</li>
</ul>

<h3>Who am I on this server?</h3>
<p>You are on the jump host JUMP01 as <code>netadmin</code>. Two commands answer "who" and "which teams":</p>
<pre class="out">netadmin@jump01:~$ whoami
netadmin
netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)</pre>
<p><code>id</code> shows the number (uid) and name of the user, the main group (gid), and every group the user belongs to. Here netadmin is in <code>adm</code> (can read logs) and <code>sudo</code> (can ask for admin rights). The next chapters explain each part.</p>

<h3>Where the answers are stored</h3>
<p>Linux keeps users and groups in plain text files that anyone may read, so you can look without special tools:</p>
<pre class="out">netadmin@jump01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
syslog:x:104:110::/nonexistent:/usr/sbin/nologin
netadmin:x:1001:1001::/home/netadmin:/bin/bash
netadmin@jump01:~$ ls -l /etc/passwd /etc/sudoers
-rw-r--r--  1 root     root        229 Sep 29 09:00 /etc/passwd
-r--r-----  1 root     root        330 Sep 29 09:00 /etc/sudoers
netadmin@jump01:~$ cat /etc/shadow
cat: /etc/shadow: Permission denied</pre>
<p>The account list <code>/etc/passwd</code> is readable by all (<code>-rw-r--r--</code>), but the file that holds password hashes, <code>/etc/shadow</code>, answers "Permission denied" to a normal user. That one message is the permission system working as designed. It is also the message you will troubleshoot in chapter 8.</p>

<h3>This module in one picture</h3>
<table class="cmp"><tr><th>Chapter</th><th>Question it answers</th><th>Commands</th></tr>
<tr><td>2 Accounts</td><td>Who exists and in which groups?</td><td><code>id</code>, <code>getent</code>, <code>/etc/passwd</code></td></tr>
<tr><td>3-4 Permissions</td><td>What can each person do with a file?</td><td><code>ls -l</code>, <code>chmod</code></td></tr>
<tr><td>5 Ownership</td><td>Who owns it, and how do teams share?</td><td><code>chown</code>, <code>chgrp</code>, setgid</td></tr>
<tr><td>6 Managing users</td><td>How do I add or remove a person?</td><td><code>useradd</code>, <code>usermod</code>, <code>passwd</code></td></tr>
<tr><td>7 sudo</td><td>How do I give limited admin power?</td><td><code>sudo</code>, <code>visudo</code></td></tr>
<tr><td>8 Troubleshooting</td><td>Why "Permission denied"?</td><td>the whole routine</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Working as root all the time: one typo then has no safety net. (2) Sharing one login between several engineers, so the logs cannot show who did what. (3) "Fixing" every denial with <code>chmod 777</code>. (4) Reading <code>/etc/shadow</code> access as a bug; it is protection.</p></div>
<div class="exam"><p><b>Exam trap.</b> The password hashes are in <code>/etc/shadow</code>, not in <code>/etc/passwd</code>, even though the older file is still called "passwd". The <code>x</code> in the second field of <code>/etc/passwd</code> means the hash is stored in shadow.</p></div>

<div class="scn"><h4>The shared login</h4><p>A team used one account, <code>admin</code>, on every server. When a switch config was deleted, the log only showed "admin" and nobody could tell which of six engineers did it. After the incident each person got a named account in a <code>noc</code> group and limited sudo rights, and the next mistake was traced in minutes.</p><p><b>Lesson:</b> individual accounts and groups give both security and accountability.</p></div>

<div class="iv"><p class="q">"Why do Linux servers use users, groups and permissions?"</p><p>To apply least privilege on shared machines. Every process and file belongs to a user and a group, and the kernel checks owner, group and others permissions on every access. That protects secrets such as password files, lets teams share folders safely, and makes audit logs meaningful.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every action asks: which user, which group, which permission.</li>
<li><code>whoami</code> gives the user; <code>id</code> gives uid, gid and all groups.</li>
<li>Accounts live in <code>/etc/passwd</code>; password hashes are in <code>/etc/shadow</code>, which normal users cannot read.</li>
<li>"Permission denied" is protection, not a fault; diagnose it, do not bypass it.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Linux server shared hota hai. NOC engineers, backup job, web server aur syslog service sab ek hi machine par rehte hain. Linux unhe ek doosre ko nuksan se bachata hai <b>har ek action par</b> teen sawal puchh kar: <i>tum kaun ho</i> (user), <i>kis team mein ho</i> (group), aur <i>yeh file kya allow karti hai</i> (permissions).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kaun, kya, allowed">
<rect x="20" y="50" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="82" text-anchor="middle" class="svg-ink" font-size="14">User</text><text x="95" y="102" text-anchor="middle" class="svg-muted" font-size="12">netadmin, ravi</text>
<rect x="245" y="50" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">Permission check</text><text x="320" y="102" text-anchor="middle" class="svg-muted" font-size="12">owner / group / others</text>
<rect x="470" y="50" width="150" height="70" rx="10" fill="#fde68a"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">File ya command</text><text x="545" y="102" text-anchor="middle" class="svg-muted" font-size="12">/srv/noc, backup.sh</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/><line x1="395" y1="85" x2="470" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="30" text-anchor="middle" class="svg-accent" font-size="12">allowed ya Permission denied</text>
</svg><p class="cap">Har action permission check se guzarta hai.</p></div>

<h3>Network engineer ko kyun parwah honi chahiye</h3>
<ul>
<li><b>Least privilege.</b> Naye L1 engineer ko logs dekhne aur ek service restart karne do, poora jump host reconfigure karne nahi.</li>
<li><b>Shared folders.</b> Team shift notes aur backups ek jagah rakhti hai; sahi logon ko likhne milna chahiye aur galat logon ko padhne nahi.</li>
<li><b>Secrets.</b> Passwords wali files (backup credentials, SNMP strings) har kisi ko padhne layak nahi honi chahiye.</li>
<li><b>Audit.</b> Kuch badle to log mein dikhna chahiye ki kis insaan ne kiya, isliye shared logins se bachte hain.</li>
</ul>

<h3>Is server par main kaun hoon?</h3>
<p>Aap jump host JUMP01 par <code>netadmin</code> ke roop mein ho. Do commands "kaun" aur "kaunsi teams" ka jawab dete hain:</p>
<pre class="out">netadmin@jump01:~$ whoami
netadmin
netadmin@jump01:~$ id
uid=1001(netadmin) gid=1001(netadmin) groups=1001(netadmin),4(adm),27(sudo)</pre>
<p><code>id</code> user ka number (uid) aur naam, main group (gid), aur user jin sab groups mein hai woh dikhata hai. Yahan netadmin <code>adm</code> (logs padh sakta hai) aur <code>sudo</code> (admin rights maang sakta hai) mein hai. Agle chapters har hissa samjhate hain.</p>

<h3>Jawab kahan store hote hain</h3>
<p>Linux users aur groups ko plain text files mein rakhta hai jo koi bhi padh sakta hai, isliye bina kisi special tool ke dekh sakte ho:</p>
<pre class="out">netadmin@jump01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
syslog:x:104:110::/nonexistent:/usr/sbin/nologin
netadmin:x:1001:1001::/home/netadmin:/bin/bash
netadmin@jump01:~$ ls -l /etc/passwd /etc/sudoers
-rw-r--r--  1 root     root        229 Sep 29 09:00 /etc/passwd
-r--r-----  1 root     root        330 Sep 29 09:00 /etc/sudoers
netadmin@jump01:~$ cat /etc/shadow
cat: /etc/shadow: Permission denied</pre>
<p>Account list <code>/etc/passwd</code> sab ke liye readable hai (<code>-rw-r--r--</code>), par jis file mein password hashes hain, <code>/etc/shadow</code>, woh normal user ko "Permission denied" deti hai. Yeh ek message permission system ka design ke mutabiq kaam karna hai. Yahi message aap chapter 8 mein troubleshoot karoge.</p>

<h3>Is module ka ek nakshaa</h3>
<table class="cmp"><tr><th>Chapter</th><th>Kaunsa sawal</th><th>Commands</th></tr>
<tr><td>2 Accounts</td><td>Kaun hai aur kin groups mein?</td><td><code>id</code>, <code>getent</code>, <code>/etc/passwd</code></td></tr>
<tr><td>3-4 Permissions</td><td>Har insaan file ke saath kya kar sakta hai?</td><td><code>ls -l</code>, <code>chmod</code></td></tr>
<tr><td>5 Ownership</td><td>Kiska hai, aur teams kaise share karti hain?</td><td><code>chown</code>, <code>chgrp</code>, setgid</td></tr>
<tr><td>6 Managing users</td><td>Insaan ko kaise jodein ya hatayein?</td><td><code>useradd</code>, <code>usermod</code>, <code>passwd</code></td></tr>
<tr><td>7 sudo</td><td>Seemit admin power kaise dein?</td><td><code>sudo</code>, <code>visudo</code></td></tr>
<tr><td>8 Troubleshooting</td><td>"Permission denied" kyun?</td><td>poori routine</td></tr></table>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Hamesha root ban kar kaam karna: ek typo par koi safety net nahi. (2) Kai engineers ka ek hi login, isliye logs nahi bata paate ki kisne kya kiya. (3) Har denial ko <code>chmod 777</code> se "theek" karna. (4) <code>/etc/shadow</code> ke access ko bug samajhna; yeh protection hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Password hashes <code>/etc/shadow</code> mein hote hain, <code>/etc/passwd</code> mein nahi, bhale hi purani file ka naam abhi bhi "passwd" hai. <code>/etc/passwd</code> ke doosre field ka <code>x</code> matlab hash shadow mein stored hai.</p></div>

<div class="scn"><h4>Shared login</h4><p>Ek team har server par ek hi account, <code>admin</code>, use karti thi. Jab ek switch config delete hui to log mein sirf "admin" tha aur koi nahi bata saka ki chhe engineers mein se kisne kiya. Incident ke baad har insaan ko <code>noc</code> group mein apna naam wala account aur seemit sudo rights mile, aur agli galti minutes mein pakdi gayi.</p><p><b>Lesson:</b> individual accounts aur groups security aur accountability dono dete hain.</p></div>

<div class="iv"><p class="q">"Linux servers users, groups aur permissions kyun use karte hain?"</p><p>Shared machines par least privilege lagane ke liye. Har process aur file ek user aur group ki hoti hai, aur kernel har access par owner, group aur others permissions check karta hai. Isse password files jaise secrets bachte hain, teams folders safely share karti hain, aur audit logs ka matlab banta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har action poochta hai: kaunsa user, kaunsa group, kaunsi permission.</li>
<li><code>whoami</code> user deta hai; <code>id</code> uid, gid aur saari groups deta hai.</li>
<li>Accounts <code>/etc/passwd</code> mein hain; password hashes <code>/etc/shadow</code> mein hain, jo normal users nahi padh sakte.</li>
<li>"Permission denied" protection hai, fault nahi; use diagnose karo, bypass nahi.</li>
</ul></div>
`}};export{e as default};