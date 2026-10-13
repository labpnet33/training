var e={id:`create-copy-delete`,h:{en:`Creating, copying, moving and deleting: mkdir, touch, cp, mv, rm`,hi:`Banana, copy, move aur delete karna: mkdir, touch, cp, mv, rm`},body:{en:`
<p><b>The idea of this chapter:</b> you can look and read; now you will <b>change</b> things. Five small commands do almost all file work. We use the same job as Lab 1: the night backup dropped every config into one folder, and you must sort it into an archive.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Sorting incoming into archive">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#fde68a"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="14">~/incoming</text>
<text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1.cfg</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="12">BLR-EDGE-R2.cfg</text><text x="105" y="116" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW1.cfg</text><text x="105" y="134" text-anchor="middle" class="svg-muted" font-size="12">....cfg.bak</text>
<rect x="340" y="10" width="280" height="75" rx="10" fill="#bbf7d0"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">~/archive/routers</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">routers go here</text>
<rect x="340" y="105" width="280" height="75" rx="10" fill="#bae6fd"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="14">~/archive/switches</text><text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">switches go here</text>
<line x1="190" y1="80" x2="340" y2="47" stroke="#64748b" stroke-width="2"/><text x="265" y="55" text-anchor="middle" class="svg-accent" font-size="12">mv</text>
<line x1="190" y1="120" x2="340" y2="142" stroke="#64748b" stroke-width="2"/><text x="265" y="145" text-anchor="middle" class="svg-accent" font-size="12">mv</text>
</svg><p class="cap">mv moves a file from one folder to another; the old copy disappears.</p></div>

<h3>mkdir: make directories</h3>
<pre class="out">netadmin@nms01:~$ mkdir backups
netadmin@nms01:~$ mkdir -p archive/2026/q3
netadmin@nms01:~$ mkdir -p archive/{routers,switches}
netadmin@nms01:~$ ls -R archive
archive:
2026  routers  switches

archive/2026:
q3

archive/2026/q3:

archive/routers:

archive/switches:
</pre>
<p>Plain <code>mkdir</code> makes one directory. The option <code>-p</code> (parents) builds the whole chain in one go and does not complain if it already exists. The braces <code>{routers,switches}</code> are a shell trick that expands into two names, so one command makes two folders (more in the next chapter). <code>ls -R</code> lists a directory and everything below it (R for recursive). The most common errors:</p>
<pre class="out">netadmin@nms01:~$ mkdir backups
mkdir: cannot create directory 'backups': File exists
netadmin@nms01:~$ mkdir a/b/c
mkdir: cannot create directory 'a/b/c': No such file or directory</pre>
<p>Both are fixed by <code>-p</code>.</p>

<h3>touch: create an empty file</h3>
<pre class="out">netadmin@nms01:~$ touch notes.txt
netadmin@nms01:~$ ls -l notes.txt
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 notes.txt</pre>
<p><code>touch</code> creates an empty file (size 0), or just updates the time of an existing one. To put text in a file you normally use redirection, covered in the next module.</p>

<h3>cp: copy</h3>
<pre class="out">netadmin@nms01:~$ cp incoming/PUN-CORE-R1.cfg incoming/PUN-CORE-R1.cfg.orig
netadmin@nms01:~$ cp archive archive2
cp: -r not specified; omitting directory 'archive'
netadmin@nms01:~$ cp -r archive archive-copy</pre>
<p>The pattern is <code>cp  source  destination</code>. A directory needs <code>-r</code> (recursive: copy everything inside). Before you change a config, make a copy: <code>cp R1.cfg R1.cfg.orig</code>. It costs nothing and saves careers.</p>

<h3>mv: move and rename</h3>
<pre class="out">netadmin@nms01:~$ mv incoming/*-R?.cfg archive/routers/
netadmin@nms01:~$ mv incoming/*-SW?.cfg archive/switches/
netadmin@nms01:~$ mv notes.txt todo.txt
netadmin@nms01:~$ ls -R archive
archive:
2026  routers  switches

archive/2026:
q3

archive/2026/q3:

archive/routers:
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-CORE-R1.cfg

archive/switches:
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg</pre>
<p><code>mv</code> has two jobs. Give it a directory as the destination and it <b>moves</b>; give it a new file name and it <b>renames</b>. There is no separate rename command to learn. The <code>*-R?.cfg</code> is a wildcard, explained in the next chapter.</p>

<h3>rm and rmdir: delete</h3>
<pre class="out">netadmin@nms01:~$ rm incoming/*.bak
netadmin@nms01:~$ rm notes.txt
rm: cannot remove 'notes.txt': No such file or directory
netadmin@nms01:~$ rm archive
rm: cannot remove 'archive': Is a directory
netadmin@nms01:~$ rmdir archive
rmdir: failed to remove 'archive': Directory not empty
netadmin@nms01:~$ rm -r archive-copy</pre>
<p><code>rm</code> deletes files. For a directory use <code>rmdir</code> (only works if it is empty) or <code>rm -r</code> (removes it and everything inside). The simulator output above shows the safe refusals.</p>
<div class="warn"><p><b>Linux has no recycle bin.</b> <code>rm</code> is permanent. Never run <code>rm -rf</code> on a path you have not checked, and never combine <code>rm -r</code> with <code>sudo</code> and a wildcard in a hurry. The classic disaster is a stray space: <code>rm -rf /srv/configs /*</code> is not the same as <code>rm -rf /srv/configs/*</code>. Habit that saves you: run <code>ls</code> with the same pattern first, look at exactly what will be hit, then replace <code>ls</code> with <code>rm</code>.</p></div>
<p><b>Reference commands (not run in the simulator):</b> the safe options <code>-i</code> (ask before each action) and <code>-v</code> (print what was done) are very useful on a real server. The simulator accepts them but does not ask or print.</p>
<pre class="code">cp -i new.cfg R1.cfg      # asks before overwriting an existing file
rm -i *.bak               # asks before each delete
mv -v R1.cfg archive/     # prints: renamed 'R1.cfg' -&gt; 'archive/R1.cfg'</pre>
<p>Also remember that <code>cp</code> and <code>mv</code> <b>overwrite</b> an existing destination file silently by default. Copying a new config over an old one with the same name destroys the old one.</p>

<div class="exam"><p><b>Exam trap.</b> <code>mv</code> is both move and rename. <code>cp</code> without <code>-r</code> refuses directories. <code>mkdir -p</code> creates parents; <code>rmdir</code> only removes empty directories; <code>rm -r</code> removes a tree. <code>touch</code> on an existing file changes only its time stamp.</p></div>

<div class="scn"><h4>The three-letter slip</h4><p>A junior engineer wanted to clean the old files in <code>/srv/tftp/old</code>. He typed <code>rm -r /srv/tftp /old</code> with a space by mistake. The first path deleted the live TFTP folder with every router backup. Because the team kept a nightly copy on a second server, nothing was lost, but the restore took two hours. Since then the team habit is: <code>ls</code> first, then <code>rm</code>; and make a safety copy with <code>cp -r</code> before any bulk delete.</p><p><b>Lesson:</b> read the path twice and preview with <code>ls</code>.</p></div>

<div class="iv"><p class="q">"How do you safely delete a group of files on a production Linux server?"</p><p>First run <code>ls</code> with exactly the same pattern and check the list. Make a safety copy if the files matter. Then run <code>rm</code> with the same pattern, without <code>-f</code>, so errors are visible. Avoid wildcards at the top level, never run it as root unless needed, and check the prompt to confirm which server I am on.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>mkdir -p</code> builds a whole path; <code>touch</code> makes an empty file.</li>
<li><code>cp source destination</code>; use <code>-r</code> for directories.</li>
<li><code>mv</code> both moves and renames; copy and move overwrite silently.</li>
<li><code>rm</code> is permanent; <code>rmdir</code> removes empty directories, <code>rm -r</code> whole trees.</li>
<li>Preview with <code>ls</code> and keep a safety copy before bulk changes.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> aap dekh aur padh sakte ho; ab aap cheezein <b>badloge</b>. Paanch chhote commands lagbhag saara file ka kaam karte hain. Hum Lab 1 wala hi kaam use karenge: raat ke backup ne har config ek folder mein daal di, aur aapko use archive mein sort karna hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Incoming ko archive mein sort karna">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#fde68a"/><text x="105" y="55" text-anchor="middle" class="svg-ink" font-size="14">~/incoming</text>
<text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1.cfg</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="12">BLR-EDGE-R2.cfg</text><text x="105" y="116" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW1.cfg</text><text x="105" y="134" text-anchor="middle" class="svg-muted" font-size="12">....cfg.bak</text>
<rect x="340" y="10" width="280" height="75" rx="10" fill="#bbf7d0"/><text x="480" y="35" text-anchor="middle" class="svg-ink" font-size="14">~/archive/routers</text><text x="480" y="60" text-anchor="middle" class="svg-muted" font-size="12">routers yahan jaate hain</text>
<rect x="340" y="105" width="280" height="75" rx="10" fill="#bae6fd"/><text x="480" y="130" text-anchor="middle" class="svg-ink" font-size="14">~/archive/switches</text><text x="480" y="155" text-anchor="middle" class="svg-muted" font-size="12">switches yahan jaate hain</text>
<line x1="190" y1="80" x2="340" y2="47" stroke="#64748b" stroke-width="2"/><text x="265" y="55" text-anchor="middle" class="svg-accent" font-size="12">mv</text>
<line x1="190" y1="120" x2="340" y2="142" stroke="#64748b" stroke-width="2"/><text x="265" y="145" text-anchor="middle" class="svg-accent" font-size="12">mv</text>
</svg><p class="cap">mv file ko ek folder se doosre mein le jaata hai; purani copy gayab ho jaati hai.</p></div>

<h3>mkdir: directories banao</h3>
<pre class="out">netadmin@nms01:~$ mkdir backups
netadmin@nms01:~$ mkdir -p archive/2026/q3
netadmin@nms01:~$ mkdir -p archive/{routers,switches}
netadmin@nms01:~$ ls -R archive
archive:
2026  routers  switches

archive/2026:
q3

archive/2026/q3:

archive/routers:

archive/switches:
</pre>
<p>Simple <code>mkdir</code> ek directory banata hai. Option <code>-p</code> (parents) poori chain ek baar mein banata hai aur pehle se ho to shikayat nahi karta. Braces <code>{routers,switches}</code> ek shell trick hai jo do naamon mein expand ho jaata hai, isliye ek command do folders banata hai (agle chapter mein aur). <code>ls -R</code> directory aur uske neeche sab kuch list karta hai (R matlab recursive). Sabse common errors:</p>
<pre class="out">netadmin@nms01:~$ mkdir backups
mkdir: cannot create directory 'backups': File exists
netadmin@nms01:~$ mkdir a/b/c
mkdir: cannot create directory 'a/b/c': No such file or directory</pre>
<p>Dono <code>-p</code> se theek ho jaate hain.</p>

<h3>touch: khaali file banao</h3>
<pre class="out">netadmin@nms01:~$ touch notes.txt
netadmin@nms01:~$ ls -l notes.txt
-rw-rw-r--  1 netadmin netadmin      0 Sep 29 09:00 notes.txt</pre>
<p><code>touch</code> khaali file (size 0) banata hai, ya sirf maujooda file ka time update karta hai. File mein text daalne ke liye aap normally redirection use karte ho, jo agle module mein hai.</p>

<h3>cp: copy</h3>
<pre class="out">netadmin@nms01:~$ cp incoming/PUN-CORE-R1.cfg incoming/PUN-CORE-R1.cfg.orig
netadmin@nms01:~$ cp archive archive2
cp: -r not specified; omitting directory 'archive'
netadmin@nms01:~$ cp -r archive archive-copy</pre>
<p>Pattern hai <code>cp  source  destination</code>. Directory ke liye <code>-r</code> chahiye (recursive: andar ka sab copy). Config badalne se pehle copy bana lo: <code>cp R1.cfg R1.cfg.orig</code>. Isme kuch lagta nahi aur career bacha leta hai.</p>

<h3>mv: move aur rename</h3>
<pre class="out">netadmin@nms01:~$ mv incoming/*-R?.cfg archive/routers/
netadmin@nms01:~$ mv incoming/*-SW?.cfg archive/switches/
netadmin@nms01:~$ mv notes.txt todo.txt
netadmin@nms01:~$ ls -R archive
archive:
2026  routers  switches

archive/2026:
q3

archive/2026/q3:

archive/routers:
BLR-EDGE-R2.cfg  HYD-EDGE-R3.cfg  PUN-CORE-R1.cfg

archive/switches:
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg</pre>
<p><code>mv</code> ke do kaam hain. Destination mein directory do to woh <b>move</b> karta hai; naya file naam do to <b>rename</b> karta hai. Alag rename command seekhna nahi padta. <code>*-R?.cfg</code> ek wildcard hai, jo agle chapter mein samjhaya hai.</p>

<h3>rm aur rmdir: delete</h3>
<pre class="out">netadmin@nms01:~$ rm incoming/*.bak
netadmin@nms01:~$ rm notes.txt
rm: cannot remove 'notes.txt': No such file or directory
netadmin@nms01:~$ rm archive
rm: cannot remove 'archive': Is a directory
netadmin@nms01:~$ rmdir archive
rmdir: failed to remove 'archive': Directory not empty
netadmin@nms01:~$ rm -r archive-copy</pre>
<p><code>rm</code> files delete karta hai. Directory ke liye <code>rmdir</code> (sirf khaali ho tab chalta hai) ya <code>rm -r</code> (use aur andar ka sab hata deta hai). Upar ka simulator output safe refusals dikhata hai.</p>
<div class="warn"><p><b>Linux mein recycle bin nahi hota.</b> <code>rm</code> permanent hai. Jis path ko check nahi kiya us par kabhi <code>rm -rf</code> mat chalao, aur jaldi mein <code>rm -r</code> ko <code>sudo</code> aur wildcard ke saath mat milao. Classic disaster ek stray space hai: <code>rm -rf /srv/configs /*</code>, <code>rm -rf /srv/configs/*</code> jaisa nahi hai. Aadat jo bachati hai: pehle wahi pattern <code>ls</code> ke saath chalao, dekho kya-kya hit hoga, phir <code>ls</code> ki jagah <code>rm</code> likho.</p></div>
<p><b>Reference commands (simulator mein nahi chalte):</b> safe options <code>-i</code> (har action se pehle poochho) aur <code>-v</code> (kya hua print karo) real server par bahut kaam ke hain. Simulator inhe accept karta hai par poochta ya print nahi karta.</p>
<pre class="code">cp -i new.cfg R1.cfg      # maujooda file overwrite karne se pehle poochta hai
rm -i *.bak               # har delete se pehle poochta hai
mv -v R1.cfg archive/     # print karta hai: renamed 'R1.cfg' -&gt; 'archive/R1.cfg'</pre>
<p>Yeh bhi yaad rakho ki <code>cp</code> aur <code>mv</code> default mein maujooda destination file ko <b>chupchaap overwrite</b> kar dete hain. Naya config usi naam ke purane config par copy karne se purana nasht ho jaata hai.</p>

<div class="exam"><p><b>Exam trap.</b> <code>mv</code> move bhi hai aur rename bhi. <code>cp</code> bina <code>-r</code> ke directories mana karta hai. <code>mkdir -p</code> parents banata hai; <code>rmdir</code> sirf khaali directories hatata hai; <code>rm -r</code> poora tree hatata hai. Maujooda file par <code>touch</code> sirf time stamp badalta hai.</p></div>

<div class="scn"><h4>Teen letter ki chook</h4><p>Ek junior engineer <code>/srv/tftp/old</code> ki purani files saaf karna chahta tha. Usne galti se space ke saath <code>rm -r /srv/tftp /old</code> type kar diya. Pehle path ne live TFTP folder har router backup ke saath delete kar diya. Team ki nightly copy doosre server par thi, isliye kuch khoya nahi, par restore mein do ghante lage. Tab se team ki aadat hai: pehle <code>ls</code>, phir <code>rm</code>; aur kisi bhi bulk delete se pehle <code>cp -r</code> se safety copy.</p><p><b>Lesson:</b> path do baar padho aur <code>ls</code> se preview karo.</p></div>

<div class="iv"><p class="q">"Production Linux server par files ka group safely kaise delete karte ho?"</p><p>Pehle bilkul wahi pattern <code>ls</code> ke saath chalata hoon aur list check karta hoon. Files zaroori hon to safety copy banata hoon. Phir wahi pattern <code>rm</code> ke saath chalata hoon, <code>-f</code> ke bina, taaki errors dikhein. Top level par wildcards se bachta hoon, zaroorat na ho to root se nahi chalata, aur prompt dekhkar confirm karta hoon ki kaunse server par hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>mkdir -p</code> poora path banata hai; <code>touch</code> khaali file banata hai.</li>
<li><code>cp source destination</code>; directories ke liye <code>-r</code>.</li>
<li><code>mv</code> move bhi karta hai aur rename bhi; copy aur move chupchaap overwrite karte hain.</li>
<li><code>rm</code> permanent hai; <code>rmdir</code> khaali directories, <code>rm -r</code> poore trees hatata hai.</li>
<li>Bulk changes se pehle <code>ls</code> se preview aur safety copy rakho.</li>
</ul></div>
`}};export{e as default};