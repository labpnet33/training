var e={id:`chmod`,h:{en:`chmod: changing permissions with letters and numbers`,hi:`chmod: letters aur numbers se permissions badalna`},body:{en:`
<p><b>The idea of this chapter:</b> <code>chmod</code> ("change mode") edits the permission string. You can say <i>what to add or remove</i> with letters (symbolic mode) or <i>the final result</i> with three digits (numeric mode). Only the owner of a file, or root, may do it.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="chmod 750 example">
<rect x="20" y="20" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">7 = rwx</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">owner</text>
<rect x="230" y="20" width="180" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">5 = r-x</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">group</text>
<rect x="440" y="20" width="180" height="50" rx="10" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">0 = ---</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">others</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="15">chmod 750 file  =  -rwxr-x---</text>
</svg><p class="cap">Three digits: owner, group, others.</p></div>

<h3>Numeric mode: three digits</h3>
<p>Add r=4, w=2, x=1 for each of the three groups. The most common values:</p>
<table class="cmp"><tr><th>Mode</th><th>String</th><th>Typical use</th></tr>
<tr><td><code>644</code></td><td><code>rw-r--r--</code></td><td>normal data or config file</td></tr>
<tr><td><code>600</code></td><td><code>rw-------</code></td><td>private file, such as an SSH key</td></tr>
<tr><td><code>640</code></td><td><code>rw-r-----</code></td><td>owner writes, one group reads (log, credentials)</td></tr>
<tr><td><code>755</code></td><td><code>rwxr-xr-x</code></td><td>script or directory everyone may use</td></tr>
<tr><td><code>750</code></td><td><code>rwxr-x---</code></td><td>script or directory for owner and one group</td></tr>
<tr><td><code>777</code></td><td><code>rwxrwxrwx</code></td><td>everybody can do everything: almost never correct</td></tr></table>
<pre class="out">netadmin@jump01:~$ touch newfile; mkdir newdir; ls -ld newfile newdir
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 newfile
drwxrwxr-x  2 netadmin netadmin   4096 Sep 29 09:00 newdir
netadmin@jump01:~$ chmod 600 newfile; ls -l newfile
-rw-------  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ chmod 755 newdir; ls -ld newdir
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 newdir</pre>
<p>New files start as <code>rw-rw-r--</code> and new directories as <code>rwxrwxr-x</code>. This comes from the default mask, <code>umask</code>, which removes rights from new items. On this Ubuntu server it prints <code>0002</code>: only the "write" bit for others is removed. Some systems use <code>0022</code>, which also removes group write.</p>

<h3>Symbolic mode: who, what, which</h3>
<p>The pattern is <b>who</b> + <b>operator</b> + <b>permission</b>. Who is <code>u</code> (user/owner), <code>g</code> (group), <code>o</code> (others) or <code>a</code> (all). The operator is <code>+</code> add, <code>-</code> remove, <code>=</code> set exactly.</p>
<pre class="out">netadmin@jump01:~$ chmod u+x,g-w newfile; ls -l newfile
-rwx------  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ chmod g+w,o-r newfile; ls -l newfile
-rwx-w----  1 netadmin netadmin      0 Sep 29 09:00 newfile</pre>
<p>Read <code>u+x,g-w</code> as "owner: add execute; group: remove write". The second line shows a legal but odd result, <code>-rwx-w----</code>: the group may write but not read. It shows that chmod does exactly what it is told, so always check with <code>ls -l</code> afterwards.</p>
<p>Use <b>symbolic mode</b> to change <i>one</i> thing and leave the rest (<code>chmod +x script.sh</code> adds execute for everybody who already has read). Use <b>numeric mode</b> to set the <i>complete</i> result in one line (<code>chmod 640 creds.conf</code>).</p>

<h3>Making a script executable</h3>
<p>The nightly backup script from chapter 3 is mode 644, so Ravi gets "Permission denied". The fix is the execute bit, applied by a person with the right to change the file. Here <code>netadmin</code> uses <code>sudo</code> because the file belongs to root:</p>
<pre class="out">netadmin@jump01:~$ sudo chmod 755 /opt/nkbackup/backup.sh
netadmin@jump01:~$ ls -l /opt/nkbackup/backup.sh
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 /opt/nkbackup/backup.sh</pre>
<p>The string is now <code>-rwxr-xr-x</code> (755). Everybody can run the script, but only the owner can edit it, which is what you want for a shared tool. Note the minimum: Ravi needs <code>x</code> to run it and, for a shell script, <code>r</code> as well so the shell can read the commands.</p>

<p><b>Reference commands (not run in the simulator):</b> options for real servers.</p>
<pre class="code">chmod -R 750 /srv/tools            # recursive: the directory and everything inside
chmod a+r report.txt               # everybody may read
chmod o= file                      # others get no permissions at all
chmod --reference=a.txt b.txt      # copy the mode of a.txt to b.txt
find /srv -type f -perm -o+w       # find world-writable files (security check)
umask 027                          # new files 640, new directories 750 for this session</pre>
<p>On a real system, <code>-R</code> with <code>755</code> makes every <i>file</i> executable too. Use <code>find ... -type d -exec chmod 755 {} +</code> style commands to treat directories and files differently.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>chmod 777</code> to "make it work": it fixes nothing about <i>who</i> needs access and opens the file to every account. (2) <code>chmod -R</code> on a large directory without checking the path first. (3) Removing your own access, for example <code>chmod 000 file</code>, and then needing root to recover. (4) Forgetting that <code>chmod</code> works only for the owner or root: "Operation not permitted" otherwise.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>chmod 640</code> = <code>rw-r-----</code>. <code>chmod u+x</code> changes only the owner. <code>chmod a-x</code> removes execute for all. <code>umask 022</code> gives files 644 and directories 755.</p></div>

<div class="scn"><h4>The 777 shortcut</h4><p>A teammate got "Permission denied" on a config folder and ran <code>chmod -R 777 /srv/configs</code>. The job worked, but a security scan the next week listed 400 world-writable files, among them router backups containing credentials. The correct fix would have been one <code>chgrp</code> and a group permission (chapter 5).</p><p><b>Lesson:</b> find out <i>who</i> needs <i>which</i> right and give exactly that.</p></div>

<div class="iv"><p class="q">"How do you make a script executable, and what is chmod 755?"</p><p><code>chmod +x script.sh</code>, or <code>chmod 755 script.sh</code> to set the full result. 755 means owner read, write and execute; group and others read and execute. I check the result with <code>ls -l</code>. If the file belongs to someone else I need sudo, and I avoid 777 because it gives write access to everyone.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Numeric: r=4, w=2, x=1 per owner, group, others; 644, 640, 600, 750, 755 are the common modes.</li>
<li>Symbolic: <code>u g o a</code> with <code>+ - =</code> and <code>r w x</code>, for example <code>u+x,g-w</code>.</li>
<li>A script needs the <code>x</code> bit; check with <code>ls -l</code> after every change.</li>
<li>Never use 777 as a fix; only the owner or root can run chmod.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>chmod</code> ("change mode") permission string ko edit karta hai. Aap letters (symbolic mode) se <i>kya jodna ya hatana hai</i>, ya teen digits (numeric mode) se <i>final result</i> bata sakte ho. Yeh sirf file ka owner ya root kar sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="chmod 750 example">
<rect x="20" y="20" width="180" height="50" rx="10" fill="#bbf7d0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="14">7 = rwx</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">owner</text>
<rect x="230" y="20" width="180" height="50" rx="10" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">5 = r-x</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">group</text>
<rect x="440" y="20" width="180" height="50" rx="10" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="14">0 = ---</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">others</text>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="15">chmod 750 file  =  -rwxr-x---</text>
</svg><p class="cap">Teen digits: owner, group, others.</p></div>

<h3>Numeric mode: teen digits</h3>
<p>Teeno groups ke liye r=4, w=2, x=1 jodo. Sabse common values:</p>
<table class="cmp"><tr><th>Mode</th><th>String</th><th>Aam use</th></tr>
<tr><td><code>644</code></td><td><code>rw-r--r--</code></td><td>normal data ya config file</td></tr>
<tr><td><code>600</code></td><td><code>rw-------</code></td><td>private file, jaise SSH key</td></tr>
<tr><td><code>640</code></td><td><code>rw-r-----</code></td><td>owner likhta hai, ek group padhta hai (log, credentials)</td></tr>
<tr><td><code>755</code></td><td><code>rwxr-xr-x</code></td><td>script ya directory jo sab use kar sakein</td></tr>
<tr><td><code>750</code></td><td><code>rwxr-x---</code></td><td>owner aur ek group ke liye script ya directory</td></tr>
<tr><td><code>777</code></td><td><code>rwxrwxrwx</code></td><td>sab sab kuch kar sakte hain: lagbhag kabhi sahi nahi</td></tr></table>
<pre class="out">netadmin@jump01:~$ touch newfile; mkdir newdir; ls -ld newfile newdir
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 newfile
drwxrwxr-x  2 netadmin netadmin   4096 Sep 29 09:00 newdir
netadmin@jump01:~$ chmod 600 newfile; ls -l newfile
-rw-------  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ chmod 755 newdir; ls -ld newdir
drwxr-xr-x  2 netadmin netadmin   4096 Sep 29 09:00 newdir</pre>
<p>Nayi files <code>rw-rw-r--</code> aur nayi directories <code>rwxrwxr-x</code> se shuru hoti hain. Yeh default mask, <code>umask</code>, se aata hai jo naye items se rights hata deta hai. Is Ubuntu server par yeh <code>0002</code> print karta hai: sirf others ka "write" bit hatta hai. Kuch systems <code>0022</code> use karte hain, jo group write bhi hata deta hai.</p>

<h3>Symbolic mode: kaun, kya, kaunsa</h3>
<p>Pattern hai <b>who</b> + <b>operator</b> + <b>permission</b>. Who: <code>u</code> (user/owner), <code>g</code> (group), <code>o</code> (others) ya <code>a</code> (all). Operator: <code>+</code> jodo, <code>-</code> hatao, <code>=</code> bilkul yahi set karo.</p>
<pre class="out">netadmin@jump01:~$ chmod u+x,g-w newfile; ls -l newfile
-rwx------  1 netadmin netadmin      0 Sep 29 09:00 newfile
netadmin@jump01:~$ chmod g+w,o-r newfile; ls -l newfile
-rwx-w----  1 netadmin netadmin      0 Sep 29 09:00 newfile</pre>
<p><code>u+x,g-w</code> ko aise padho "owner: execute jodo; group: write hatao". Doosri line legal par ajeeb result dikhati hai, <code>-rwx-w----</code>: group likh sakta hai par padh nahi sakta. Yeh dikhata hai ki chmod bilkul wahi karta hai jo bola jaaye, isliye baad mein hamesha <code>ls -l</code> se check karo.</p>
<p><b>Symbolic mode</b> tab use karo jab <i>ek</i> cheez badalni ho aur baaki chhodna (<code>chmod +x script.sh</code>). <b>Numeric mode</b> tab jab <i>poora</i> result ek line mein set karna ho (<code>chmod 640 creds.conf</code>).</p>

<h3>Script ko executable banana</h3>
<p>Chapter 3 ki nightly backup script mode 644 hai, isliye Ravi ko "Permission denied" milta hai. Fix execute bit hai, jo woh insaan lagata hai jiske paas file badalne ka haq ho. Yahan <code>netadmin</code> <code>sudo</code> use karta hai kyunki file root ki hai:</p>
<pre class="out">netadmin@jump01:~$ sudo chmod 755 /opt/nkbackup/backup.sh
netadmin@jump01:~$ ls -l /opt/nkbackup/backup.sh
-rwxr-xr-x  1 root     root        181 Sep 29 09:00 /opt/nkbackup/backup.sh</pre>
<p>String ab <code>-rwxr-xr-x</code> (755) hai. Script sab chala sakte hain, par edit sirf owner kar sakta hai, jo shared tool ke liye sahi hai. Minimum yaad rakho: Ravi ko chalane ke liye <code>x</code> chahiye aur shell script ke liye <code>r</code> bhi, taaki shell commands padh sake.</p>

<p><b>Reference commands (simulator mein nahi chalte):</b> real servers ke options.</p>
<pre class="code">chmod -R 750 /srv/tools            # recursive: directory aur andar sab kuch
chmod a+r report.txt               # sab padh sakein
chmod o= file                      # others ko koi permission nahi
chmod --reference=a.txt b.txt      # a.txt ka mode b.txt par copy
find /srv -type f -perm -o+w       # world-writable files dhoondho (security check)
umask 027                          # is session mein nayi files 640, directories 750</pre>
<p>Real system par <code>-R</code> ke saath <code>755</code> har <i>file</i> ko bhi executable bana deta hai. Directories aur files ko alag treat karne ke liye <code>find ... -type d -exec chmod 755 {} +</code> jaisi commands use karo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) "Chal jaye" ke liye <code>chmod 777</code>: yeh yeh nahi sudharta ki <i>kise</i> access chahiye aur file har account ke liye khol deta hai. (2) Path check kiye bina bade directory par <code>chmod -R</code>. (3) Apna hi access hata dena, jaise <code>chmod 000 file</code>, aur phir recover karne ke liye root chahiye. (4) Bhoolna ki <code>chmod</code> sirf owner ya root ke liye chalta hai: warna "Operation not permitted".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>chmod 640</code> = <code>rw-r-----</code>. <code>chmod u+x</code> sirf owner ko badalta hai. <code>chmod a-x</code> sab ka execute hatata hai. <code>umask 022</code> files ko 644 aur directories ko 755 deta hai.</p></div>

<div class="scn"><h4>777 ka shortcut</h4><p>Ek teammate ko config folder par "Permission denied" mila aur usne <code>chmod -R 777 /srv/configs</code> chalaya. Job chal gayi, par agle hafte security scan ne 400 world-writable files list ki, jinme credentials wale router backups the. Sahi fix ek <code>chgrp</code> aur group permission thi (chapter 5).</p><p><b>Lesson:</b> pata karo <i>kise</i> <i>kaunsa</i> haq chahiye aur bilkul wahi do.</p></div>

<div class="iv"><p class="q">"Script ko executable kaise banate ho, aur chmod 755 kya hai?"</p><p><code>chmod +x script.sh</code>, ya poora result set karne ke liye <code>chmod 755 script.sh</code>. 755 ka matlab owner read, write, execute; group aur others read aur execute. Result <code>ls -l</code> se check karta hoon. File kisi aur ki ho to sudo chahiye, aur 777 se bachta hoon kyunki woh sab ko write access deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Numeric: owner, group, others ke liye r=4, w=2, x=1; 644, 640, 600, 750, 755 common modes hain.</li>
<li>Symbolic: <code>u g o a</code> ke saath <code>+ - =</code> aur <code>r w x</code>, jaise <code>u+x,g-w</code>.</li>
<li>Script ko <code>x</code> bit chahiye; har change ke baad <code>ls -l</code> se check karo.</li>
<li>777 ko kabhi fix mat banao; chmod sirf owner ya root chala sakta hai.</li>
</ul></div>
`}};export{e as default};