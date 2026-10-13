var e={id:`ownership-shared`,h:{en:`chown, chgrp and shared team folders (setgid)`,hi:`chown, chgrp aur shared team folders (setgid)`},body:{en:`
<p><b>The idea of this chapter:</b> permissions say <i>what</i> each row may do; ownership says <i>who</i> the rows are. A shared team folder needs three things: a <b>group</b> for the team, the folder <b>owned by that group</b>, and the <b>setgid</b> bit so every new file inherits the group. Then the team can work together and outsiders stay out.</p>

<h3>chown and chgrp</h3>
<table class="cmp"><tr><th>Command</th><th>Effect</th></tr>
<tr><td><code>chown ravi file</code></td><td>change the owner to ravi</td></tr>
<tr><td><code>chown ravi:netbackup file</code></td><td>change owner and group in one step</td></tr>
<tr><td><code>chown :netbackup file</code></td><td>change only the group</td></tr>
<tr><td><code>chgrp netbackup file</code></td><td>change only the group (same as above)</td></tr></table>
<pre class="out">netadmin@jump01:~$ touch newfile; ls -l newfile
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ sudo chown ravi newfile
netadmin@jump01:~$ ls -l newfile
-rw-rw-r--  1 ravi     netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ sudo chown ravi:netbackup newfile
netadmin@jump01:~$ ls -l newfile
-rw-rw-r--  1 ravi     netbackup      0 Sep 29 09:00 newfile</pre>
<p>Only <b>root</b> may give a file to another user, which is why <code>sudo</code> is needed. A normal user may change the group of a file he owns, but only to a group he belongs to. Trying to hand over a directory without root fails:</p>
<pre class="out">netadmin@jump01:~$ chown ravi newdir
chown: changing ownership of 'newdir': Operation not permitted</pre>

<h3>The setgid bit: "new files join the folder's group"</h3>
<p>Normally a new file belongs to the <b>creator's main group</b>. In a shared folder that is a problem: Ravi's new file would belong to group <code>ravi</code> and Priya, though in the team, could not edit it. The <b>setgid</b> bit on a directory fixes this: new files inherit the <b>directory's</b> group. In numeric mode it is a fourth digit in front, <code>2</code>:</p>
<table class="cmp"><tr><th>Mode</th><th>Shown as</th><th>Meaning</th></tr>
<tr><td><code>2770</code></td><td><code>drwxrws---</code></td><td>owner and group full access, others none, setgid on</td></tr>
<tr><td><code>2775</code></td><td><code>drwxrwsr-x</code></td><td>same, others may read and enter</td></tr></table>
<p>The setgid shows as an <code>s</code> in place of the group's <code>x</code>. Use <b>2770</b> for private team data and <b>2775</b> when other staff may look but not change.</p>

<h3>Building the NOC shared folder (lab 1)</h3>
<p>Create the group and the two users first (chapter 6). Then the folder: create it, give it to group <code>noc</code>, and set the mode:</p>
<pre class="out">netadmin@jump01:~$ sudo mkdir /srv/noc
netadmin@jump01:~$ sudo chown root:noc /srv/noc
netadmin@jump01:~$ sudo chmod 2770 /srv/noc
netadmin@jump01:~$ ls -ld /srv/noc
drwxrws---  2 root     noc        4096 Sep 29 09:00 /srv/noc
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1002(noc)</pre>
<p>Read it: owner <code>root</code> (can do everything), group <code>noc</code> (<code>rws</code>: read, write, enter, and the setgid), others <code>---</code> (nothing). Ravi is in <code>noc</code>, so he can use it. Test it from his side:</p>
<pre class="out">ravi@jump01:~$ touch /srv/noc/shift-notes.txt
ravi@jump01:~$ ls -l /srv/noc
total 4
-rw-rw-r--  1 ravi     noc           0 Sep 29 09:00 shift-notes.txt</pre>
<p>The new file belongs to Ravi but its group is <code>noc</code>, inherited from the folder, so Priya can edit it too. A user who is <b>not</b> in <code>noc</code> cannot even list the folder, because the others row is <code>---</code>. In this lab the folder is owned by root rather than a person: nobody can delete the folder itself or change its permissions by accident, but the team can freely create files inside.</p>

<h3>The same pattern for the backup job (lab 2)</h3>
<p>The backup team's group is <code>netbackup</code>. After the group owns <code>/srv/backups</code> and the mode is 2775, the script's output files get the right group automatically:</p>
<pre class="out">netadmin@jump01:~$ sudo chgrp netbackup /srv/backups
netadmin@jump01:~$ sudo chmod 2775 /srv/backups
ravi@jump01:~$ ls -l /srv/backups
total 8
-rw-r--r--  1 ravi     netbackup    132 Sep 29 09:00 hosts.bak
-rw-rw-r--  1 ravi     netbackup     52 Sep 29 09:00 run.log</pre>
<p>Both files carry the group <code>netbackup</code> although Ravi's main group is <code>ravi</code>. That is setgid at work. The file <code>hosts.bak</code> is <code>rw-r--r--</code> because <code>cp</code> keeps the mode of the source file.</p>

<p><b>Reference commands (not run in the simulator):</b> related special bits and options.</p>
<pre class="code">chown -R root:noc /srv/noc        # recursive: change everything inside too
chmod +t /srv/shared              # sticky bit: users delete only their own files (like /tmp)
ls -ld /tmp                       # drwxrwxrwt shows the sticky bit as t
chmod u+s /usr/local/bin/tool     # setuid: runs as the file owner (powerful, avoid)
find / -perm -4000 -type f 2&gt;/dev/null   # security review: list setuid programs</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting setgid, so a team folder slowly fills with files that only their creators can edit. (2) Setting the group but giving the group no <code>w</code>: <code>2750</code> lets the team read only. (3) Using <code>chown -R</code> on the wrong path, such as <code>/</code> or <code>/etc</code>. (4) Adding a user to the group and expecting an open shell to notice; a new login is needed (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> The 2 in <code>2770</code> is setgid; the <code>s</code> in <code>drwxrws---</code> is its display. Only root can change the owner; the group can be changed by the owner to one of his own groups. <code>chown user:group</code> sets both.</p></div>

<div class="scn"><h4>Files nobody could edit</h4><p>A shared <code>/srv/configs</code> folder belonged to group <code>netops</code>, but without setgid every file got the creator's own group. Priya kept being told "Permission denied" on files Ravi had made. One <code>chmod g+s /srv/configs</code> (and a one-time <code>chgrp</code> of the old files) ended months of workarounds.</p><p><b>Lesson:</b> a shared directory needs the right group and setgid.</p></div>

<div class="iv"><p class="q">"How do you set up a folder that a team can share?"</p><p>I create a group for the team and add the members, create the directory and set <code>chown root:team dir</code>, then <code>chmod 2770 dir</code>. The group gets read and write, others get nothing, and the setgid bit makes new files inherit the team group. I test as a team member with <code>su - user</code> and check <code>ls -ld</code> and <code>ls -l</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>chown owner:group</code> sets both; only root can change the owner.</li>
<li>setgid (<code>2</code> in front, <code>s</code> in the string) makes new files inherit the directory group.</li>
<li>Team folder recipe: <code>chown root:team</code>, <code>chmod 2770</code> (or 2775).</li>
<li>Always test from the team member's account, not from your own.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> permissions batate hain ki har row <i>kya</i> kar sakti hai; ownership batati hai ki rows <i>kaun</i> hain. Shared team folder ko teen cheezein chahiye: team ke liye ek <b>group</b>, folder us <b>group ka</b>, aur <b>setgid</b> bit taaki har nayi file group inherit kare. Tab team saath kaam kar sakti hai aur bahar wale bahar rehte hain.</p>

<h3>chown aur chgrp</h3>
<table class="cmp"><tr><th>Command</th><th>Asar</th></tr>
<tr><td><code>chown ravi file</code></td><td>owner ko ravi kar do</td></tr>
<tr><td><code>chown ravi:netbackup file</code></td><td>owner aur group ek step mein badlo</td></tr>
<tr><td><code>chown :netbackup file</code></td><td>sirf group badlo</td></tr>
<tr><td><code>chgrp netbackup file</code></td><td>sirf group badlo (upar jaisa)</td></tr></table>
<pre class="out">netadmin@jump01:~$ touch newfile; ls -l newfile
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ sudo chown ravi newfile
netadmin@jump01:~$ ls -l newfile
-rw-rw-r--  1 ravi     netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ sudo chown ravi:netbackup newfile
netadmin@jump01:~$ ls -l newfile
-rw-rw-r--  1 ravi     netbackup      0 Sep 29 09:00 newfile</pre>
<p>File kisi doosre user ko sirf <b>root</b> de sakta hai, isliye <code>sudo</code> chahiye. Normal user apni file ka group badal sakta hai, par sirf apni kisi group mein. Root ke bina directory dene ki koshish fail hoti hai:</p>
<pre class="out">netadmin@jump01:~$ chown ravi newdir
chown: changing ownership of 'newdir': Operation not permitted</pre>

<h3>setgid bit: "nayi files folder ke group mein judti hain"</h3>
<p>Normally nayi file <b>banane wale ke main group</b> ki hoti hai. Shared folder mein yeh problem hai: Ravi ki nayi file group <code>ravi</code> ki hogi aur Priya, team mein hone ke bawajood, use edit nahi kar paayegi. Directory par <b>setgid</b> bit isse theek karta hai: nayi files <b>directory ka</b> group inherit karti hain. Numeric mode mein yeh aage ka chautha digit <code>2</code> hai:</p>
<table class="cmp"><tr><th>Mode</th><th>Dikhta hai</th><th>Matlab</th></tr>
<tr><td><code>2770</code></td><td><code>drwxrws---</code></td><td>owner aur group ko poora access, others ko nahi, setgid on</td></tr>
<tr><td><code>2775</code></td><td><code>drwxrwsr-x</code></td><td>wahi, others padh aur andar aa sakte hain</td></tr></table>
<p>Setgid group ke <code>x</code> ki jagah <code>s</code> ki tarah dikhta hai. Private team data ke liye <b>2770</b> aur jab doosra staff dekh sake par badal na sake tab <b>2775</b> use karo.</p>

<h3>NOC shared folder banana (lab 1)</h3>
<p>Pehle group aur do users banao (chapter 6). Phir folder: banao, group <code>noc</code> ko do, aur mode set karo:</p>
<pre class="out">netadmin@jump01:~$ sudo mkdir /srv/noc
netadmin@jump01:~$ sudo chown root:noc /srv/noc
netadmin@jump01:~$ sudo chmod 2770 /srv/noc
netadmin@jump01:~$ ls -ld /srv/noc
drwxrws---  2 root     noc        4096 Sep 29 09:00 /srv/noc
netadmin@jump01:~$ id ravi
uid=1002(ravi) gid=1003(ravi) groups=1003(ravi),1002(noc)</pre>
<p>Padho: owner <code>root</code> (sab kar sakta hai), group <code>noc</code> (<code>rws</code>: read, write, andar jaana, aur setgid), others <code>---</code> (kuch nahi). Ravi <code>noc</code> mein hai, isliye use kar sakta hai. Uski taraf se test karo:</p>
<pre class="out">ravi@jump01:~$ touch /srv/noc/shift-notes.txt
ravi@jump01:~$ ls -l /srv/noc
total 4
-rw-rw-r--  1 ravi     noc           0 Sep 29 09:00 shift-notes.txt</pre>
<p>Nayi file Ravi ki hai par uska group <code>noc</code> hai, folder se inherit hua, isliye Priya bhi use edit kar sakti hai. Jo user <code>noc</code> mein <b>nahi</b> hai woh folder list bhi nahi kar sakta, kyunki others row <code>---</code> hai. Is lab mein folder kisi insaan ka nahi, root ka hai: koi galti se folder delete ya uski permissions nahi badal sakta, par team andar files freely bana sakti hai.</p>

<h3>Backup job ke liye wahi pattern (lab 2)</h3>
<p>Backup team ka group <code>netbackup</code> hai. Jab group <code>/srv/backups</code> ka owner ho aur mode 2775 ho, script ki output files ko sahi group apne aap mil jaata hai:</p>
<pre class="out">netadmin@jump01:~$ sudo chgrp netbackup /srv/backups
netadmin@jump01:~$ sudo chmod 2775 /srv/backups
ravi@jump01:~$ ls -l /srv/backups
total 8
-rw-r--r--  1 ravi     netbackup    132 Sep 29 09:00 hosts.bak
-rw-rw-r--  1 ravi     netbackup     52 Sep 29 09:00 run.log</pre>
<p>Dono files ka group <code>netbackup</code> hai bhale hi Ravi ka main group <code>ravi</code> hai. Yeh setgid ka kaam hai. <code>hosts.bak</code> <code>rw-r--r--</code> hai kyunki <code>cp</code> source file ka mode rakhta hai.</p>

<p><b>Reference commands (simulator mein nahi chalte):</b> related special bits aur options.</p>
<pre class="code">chown -R root:noc /srv/noc        # recursive: andar ka sab kuch bhi badlo
chmod +t /srv/shared              # sticky bit: users sirf apni files delete karein (/tmp jaisa)
ls -ld /tmp                       # drwxrwxrwt mein sticky bit t dikhta hai
chmod u+s /usr/local/bin/tool     # setuid: file ke owner ke roop mein chalta hai (powerful, bacho)
find / -perm -4000 -type f 2&gt;/dev/null   # security review: setuid programs list karo</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) setgid bhoolna, to team folder dheere dheere aisi files se bhar jaata hai jinhe sirf unke banane wale edit kar sakte hain. (2) Group set karna par group ko <code>w</code> na dena: <code>2750</code> team ko sirf read deta hai. (3) Galat path par <code>chown -R</code>, jaise <code>/</code> ya <code>/etc</code>. (4) User ko group mein jodna aur ummeed karna ki khula shell dekh lega; naya login chahiye (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>2770</code> ka 2 setgid hai; <code>drwxrws---</code> ka <code>s</code> uska display hai. Owner sirf root badal sakta hai; group ko owner apni kisi group mein badal sakta hai. <code>chown user:group</code> dono set karta hai.</p></div>

<div class="scn"><h4>Files jo koi edit nahi kar paaya</h4><p>Shared <code>/srv/configs</code> folder group <code>netops</code> ka tha, par setgid ke bina har file ko banane wale ka apna group milta tha. Priya ko Ravi ki banayi files par baar baar "Permission denied" milta raha. Ek <code>chmod g+s /srv/configs</code> (aur purani files ka ek baar ka <code>chgrp</code>) ne mahinon ke workarounds khatam kar diye.</p><p><b>Lesson:</b> shared directory ko sahi group aur setgid chahiye.</p></div>

<div class="iv"><p class="q">"Aisa folder kaise set up karoge jo team share kar sake?"</p><p>Main team ke liye group banata hoon aur members jodta hoon, directory banakar <code>chown root:team dir</code> karta hoon, phir <code>chmod 2770 dir</code>. Group ko read aur write milta hai, others ko kuch nahi, aur setgid bit nayi files ko team group inherit karwata hai. Team member ke roop mein <code>su - user</code> se test karta hoon aur <code>ls -ld</code> aur <code>ls -l</code> check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>chown owner:group</code> dono set karta hai; owner sirf root badal sakta hai.</li>
<li>setgid (aage <code>2</code>, string mein <code>s</code>) nayi files ko directory ka group inherit karwata hai.</li>
<li>Team folder recipe: <code>chown root:team</code>, <code>chmod 2770</code> (ya 2775).</li>
<li>Hamesha team member ke account se test karo, apne se nahi.</li>
</ul></div>
`}};export{e as default};