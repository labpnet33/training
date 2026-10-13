var e={id:`permissions`,h:{en:`Reading permissions: r, w, x for owner, group and others`,hi:`Permissions padhna: owner, group aur others ke liye r, w, x`},body:{en:`
<p><b>The idea of this chapter:</b> every file and directory has <b>one owner</b>, <b>one group</b> and a 9-letter permission string. The kernel picks <b>one</b> of three rows (owner, group or others) for the person asking, and applies it. Once you can read the string, "Permission denied" is no longer a mystery.</p>

<h3>The ls -l string</h3>
<p>The scene is the backup server JUMP01 (the second lab). Ravi is told to run the nightly script, but cannot:</p>
<pre class="out">ravi@jump01:~$ /opt/nkbackup/backup.sh
-bash: /opt/nkbackup/backup.sh: Permission denied
ravi@jump01:~$ ls -l /opt/nkbackup/
total 8
-rw-r--r--  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r--r--  1 root     root        105 Sep 29 09:00 creds.conf
ravi@jump01:~$ ls -ld /srv/backups
drwxr-xr-x  2 root     root       4096 Sep 29 09:00 /srv/backups</pre>
<p>Split <code>-rw-r--r--  1 root  root  181 ...  backup.sh</code> into its columns:</p>
<table class="cmp"><tr><th>Part</th><th>Value</th><th>Meaning</th></tr>
<tr><td>Type</td><td><code>-</code></td><td><code>-</code> file, <code>d</code> directory, <code>l</code> symbolic link</td></tr>
<tr><td>Owner permissions</td><td><code>rw-</code></td><td>the owner can read and write, not execute</td></tr>
<tr><td>Group permissions</td><td><code>r--</code></td><td>group members can only read</td></tr>
<tr><td>Others permissions</td><td><code>r--</code></td><td>everybody else can only read</td></tr>
<tr><td>Link count</td><td><code>1</code></td><td>number of hard links; ignore for now</td></tr>
<tr><td>Owner, group</td><td><code>root root</code></td><td>who owns it, which group it belongs to</td></tr>
<tr><td>Size, date, name</td><td><code>181 ... backup.sh</code></td><td>bytes, last change, name</td></tr></table>
<p>Ravi is neither root nor in group root, so the <b>others</b> row applies: read only. No <code>x</code> means he cannot execute the script. That is exactly the message he saw.</p>

<h3>What r, w and x mean</h3>
<table class="cmp"><tr><th>Letter</th><th>On a file</th><th>On a directory</th><th>Number</th></tr>
<tr><td><code>r</code></td><td>read the content</td><td>list the names inside (<code>ls</code>)</td><td>4</td></tr>
<tr><td><code>w</code></td><td>change the content</td><td>create, rename and delete entries inside</td><td>2</td></tr>
<tr><td><code>x</code></td><td>run it as a program</td><td>enter it (<code>cd</code>) and reach what is inside</td><td>1</td></tr></table>
<p>The numbers add up: <code>rwx</code> = 4+2+1 = <b>7</b>, <code>r-x</code> = 5, <code>rw-</code> = 6, <code>r--</code> = 4, <code>---</code> = 0. So <code>-rw-r--r--</code> is <b>644</b> and <code>drwxr-xr-x</code> is <b>755</b>. Chapter 4 uses these numbers with <code>chmod</code>.</p>
<p>Directories deserve special attention. To create or delete a file you need <code>w</code> on the <b>directory</b>, not on the file. To open a file deep in a path you need <code>x</code> on <b>every directory</b> along the way. This is why <code>/srv/backups</code> being <code>drwxr-xr-x</code> (owned by root) stops Ravi from writing his run log there, as you will see in chapter 8.</p>

<h3>Which row applies?</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Which row applies">
<rect x="10" y="30" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Are you the owner?</text><text x="95" y="75" text-anchor="middle" class="svg-muted" font-size="12">yes: owner row</text>
<rect x="235" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 In the group?</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">yes: group row</text>
<rect x="460" y="30" width="170" height="60" rx="10" fill="#fde68a"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Anyone else</text><text x="545" y="75" text-anchor="middle" class="svg-muted" font-size="12">others row</text>
<line x1="180" y1="60" x2="235" y2="60" stroke="#64748b" stroke-width="2"/><line x1="405" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The first match wins; the rows are not added together.</p></div>
<p>The check stops at the <b>first</b> match. If you are the owner, only the owner bits count, even when the others have more rights. That is why an owner with <code>---</code> can be locked out of his own file by a mistake.</p>

<h3>root and normal users</h3>
<p>Root skips these checks almost entirely, which is why root is dangerous. Normal users meet them everywhere:</p>
<pre class="out">netadmin@jump01:~$ ls -l /etc/passwd /etc/sudoers
-rw-r--r--  1 root     root        229 Sep 29 09:00 /etc/passwd
-r--r-----  1 root     root        330 Sep 29 09:00 /etc/sudoers
netadmin@jump01:~$ cat /etc/shadow
cat: /etc/shadow: Permission denied</pre>
<p><code>/etc/passwd</code> (644) is readable by everyone. <code>/etc/sudoers</code> (<code>-r--r-----</code> = 440) can be read only by root and the root group, and nobody can write it directly; you edit it with <code>visudo</code> (chapter 7). Notice how the security level of each file is visible in the string.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking the rows add up: an owner with <code>---</code> is denied even if others have <code>r--</code>. (2) Forgetting <code>x</code> on a directory: <code>r</code> without <code>x</code> lets you list names but not open anything. (3) Reading <code>w</code> on a file as the right to delete it; deletion depends on the directory. (4) Confusing <code>ls -l dir</code> (contents) with <code>ls -ld dir</code> (the directory itself).</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>r=4 w=2 x=1</code>. <code>rwxr-xr--</code> = 754. A script needs <code>x</code> to be executed directly. Deleting a file needs <code>w</code> on the directory.</p></div>

<div class="scn"><h4>Readable, not runnable</h4><p>A teammate copied a backup script to a server and the nightly job failed with "Permission denied". The file was owned by root with mode 644: everybody could read it, nobody could run it. Adding the execute bit fixed it in one command, which you will practise in the next chapter.</p><p><b>Lesson:</b> a script is just text until it has the <code>x</code> permission.</p></div>

<div class="iv"><p class="q">"Explain -rwxr-x--- and what each part means."</p><p>The first character <code>-</code> says it is a regular file. <code>rwx</code> lets the owner read, write and execute. <code>r-x</code> lets group members read and execute but not change it. <code>---</code> gives other users no access at all. In numbers that is 750.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The string is: type, then owner, group and others, each as r, w, x.</li>
<li>Numbers: r=4, w=2, x=1; 644 = <code>rw-r--r--</code>, 755 = <code>rwxr-xr-x</code>.</li>
<li>The first matching row (owner, then group, then others) is the one that applies.</li>
<li>On directories, <code>w</code> means create or delete inside and <code>x</code> means enter.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har file aur directory ka <b>ek owner</b>, <b>ek group</b> aur 9-letter ki permission string hoti hai. Kernel poochne wale insaan ke liye teen rows (owner, group ya others) mein se <b>ek</b> chunta hai aur wahi lagata hai. String padhna aa gaya to "Permission denied" ab rahasya nahi rehta.</p>

<h3>ls -l ki string</h3>
<p>Scene backup server JUMP01 (doosri lab) ka hai. Ravi ko nightly script chalani hai, par woh nahi chala paata:</p>
<pre class="out">ravi@jump01:~$ /opt/nkbackup/backup.sh
-bash: /opt/nkbackup/backup.sh: Permission denied
ravi@jump01:~$ ls -l /opt/nkbackup/
total 8
-rw-r--r--  1 root     root        181 Sep 29 09:00 backup.sh
-rw-r--r--  1 root     root        105 Sep 29 09:00 creds.conf
ravi@jump01:~$ ls -ld /srv/backups
drwxr-xr-x  2 root     root       4096 Sep 29 09:00 /srv/backups</pre>
<p><code>-rw-r--r--  1 root  root  181 ...  backup.sh</code> ko columns mein todo:</p>
<table class="cmp"><tr><th>Hissa</th><th>Value</th><th>Matlab</th></tr>
<tr><td>Type</td><td><code>-</code></td><td><code>-</code> file, <code>d</code> directory, <code>l</code> symbolic link</td></tr>
<tr><td>Owner permissions</td><td><code>rw-</code></td><td>owner padh aur likh sakta hai, execute nahi</td></tr>
<tr><td>Group permissions</td><td><code>r--</code></td><td>group members sirf padh sakte hain</td></tr>
<tr><td>Others permissions</td><td><code>r--</code></td><td>baaki sab sirf padh sakte hain</td></tr>
<tr><td>Link count</td><td><code>1</code></td><td>hard links ki sankhya; abhi ignore karo</td></tr>
<tr><td>Owner, group</td><td><code>root root</code></td><td>kiska hai, kis group ka hai</td></tr>
<tr><td>Size, date, name</td><td><code>181 ... backup.sh</code></td><td>bytes, last change, naam</td></tr></table>
<p>Ravi na root hai na group root mein, isliye <b>others</b> row lagti hai: sirf read. <code>x</code> nahi hai, isliye woh script execute nahi kar sakta. Yahi message usne dekha.</p>

<h3>r, w aur x ka matlab</h3>
<table class="cmp"><tr><th>Letter</th><th>File par</th><th>Directory par</th><th>Number</th></tr>
<tr><td><code>r</code></td><td>content padhna</td><td>andar ke naam list karna (<code>ls</code>)</td><td>4</td></tr>
<tr><td><code>w</code></td><td>content badalna</td><td>andar entries banana, rename aur delete karna</td><td>2</td></tr>
<tr><td><code>x</code></td><td>program ki tarah chalana</td><td>andar jaana (<code>cd</code>) aur andar ki cheezon tak pahunchna</td><td>1</td></tr></table>
<p>Numbers jodte hain: <code>rwx</code> = 4+2+1 = <b>7</b>, <code>r-x</code> = 5, <code>rw-</code> = 6, <code>r--</code> = 4, <code>---</code> = 0. Isliye <code>-rw-r--r--</code> <b>644</b> hai aur <code>drwxr-xr-x</code> <b>755</b>. Chapter 4 in numbers ko <code>chmod</code> ke saath use karta hai.</p>
<p>Directories par khaas dhyan do. File banane ya delete karne ke liye <b>directory</b> par <code>w</code> chahiye, file par nahi. Lambe path ke andar ki file kholne ke liye raaste ki <b>har directory</b> par <code>x</code> chahiye. Isiliye <code>/srv/backups</code> ka <code>drwxr-xr-x</code> (root ki) hona Ravi ko wahan apna run log likhne se rokta hai, jaise chapter 8 mein dekhoge.</p>

<h3>Kaunsi row lagti hai?</h3>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Kaunsi row lagti hai">
<rect x="10" y="30" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="13">1 Kya aap owner ho?</text><text x="95" y="75" text-anchor="middle" class="svg-muted" font-size="12">haan: owner row</text>
<rect x="235" y="30" width="170" height="60" rx="10" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">2 Group mein ho?</text><text x="320" y="75" text-anchor="middle" class="svg-muted" font-size="12">haan: group row</text>
<rect x="460" y="30" width="170" height="60" rx="10" fill="#fde68a"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="13">3 Koi aur</text><text x="545" y="75" text-anchor="middle" class="svg-muted" font-size="12">others row</text>
<line x1="180" y1="60" x2="235" y2="60" stroke="#64748b" stroke-width="2"/><line x1="405" y1="60" x2="460" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehla match jeetta hai; rows jodi nahi jaati.</p></div>
<p>Check <b>pehle</b> match par ruk jaata hai. Aap owner ho to sirf owner bits gine jaate hain, chahe others ke paas zyada rights ho. Isiliye <code>---</code> wala owner galti se apni hi file se bahar ho sakta hai.</p>

<h3>root aur normal users</h3>
<p>Root in checks ko lagbhag skip kar deta hai, isiliye root khatarnak hai. Normal users inse har jagah milte hain:</p>
<pre class="out">netadmin@jump01:~$ ls -l /etc/passwd /etc/sudoers
-rw-r--r--  1 root     root        229 Sep 29 09:00 /etc/passwd
-r--r-----  1 root     root        330 Sep 29 09:00 /etc/sudoers
netadmin@jump01:~$ cat /etc/shadow
cat: /etc/shadow: Permission denied</pre>
<p><code>/etc/passwd</code> (644) sab padh sakte hain. <code>/etc/sudoers</code> (<code>-r--r-----</code> = 440) sirf root aur root group padh sakte hain, aur seedha koi likh nahi sakta; use <code>visudo</code> se edit karte hain (chapter 7). Dekho har file ka security level string mein dikhta hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Sochna ki rows jud jaati hain: <code>---</code> wale owner ko denial milta hai chahe others ke paas <code>r--</code> ho. (2) Directory par <code>x</code> bhoolna: <code>x</code> ke bina <code>r</code> naam list karne deta hai par kuch kholne nahi. (3) File par <code>w</code> ko delete ka haq samajhna; delete directory par nirbhar hai. (4) <code>ls -l dir</code> (andar ka content) ko <code>ls -ld dir</code> (directory khud) se confuse karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>r=4 w=2 x=1</code>. <code>rwxr-xr--</code> = 754. Script ko seedha chalane ke liye <code>x</code> chahiye. File delete karne ke liye directory par <code>w</code> chahiye.</p></div>

<div class="scn"><h4>Padh sakte hain, chala nahi sakte</h4><p>Ek teammate ne backup script server par copy ki aur nightly job "Permission denied" se fail ho gayi. File root ki thi aur mode 644: sab padh sakte the, koi chala nahi sakta tha. Execute bit jodne se ek command mein theek ho gaya, jo aap agle chapter mein karoge.</p><p><b>Lesson:</b> script tab tak sirf text hai jab tak usme <code>x</code> permission na ho.</p></div>

<div class="iv"><p class="q">"-rwxr-x--- ko samjhao aur har hissa kya batata hai."</p><p>Pehla character <code>-</code> batata hai ki yeh regular file hai. <code>rwx</code> owner ko read, write aur execute deta hai. <code>r-x</code> group members ko read aur execute deta hai par badalne nahi. <code>---</code> baaki users ko koi access nahi deta. Numbers mein yeh 750 hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>String: type, phir owner, group aur others, har ek r, w, x mein.</li>
<li>Numbers: r=4, w=2, x=1; 644 = <code>rw-r--r--</code>, 755 = <code>rwxr-xr-x</code>.</li>
<li>Pehli matching row (owner, phir group, phir others) wahi lagti hai.</li>
<li>Directories par <code>w</code> ka matlab andar banana ya delete karna aur <code>x</code> ka matlab andar jaana.</li>
</ul></div>
`}};export{e as default};