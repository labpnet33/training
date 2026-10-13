var e={id:`file-permissions`,h:{en:`File permissions: chmod 600, ls -l and checking the mode in Python`,hi:`File permissions: chmod 600, ls -l aur Python mein mode check karna`},body:{en:`
<p><b>The idea of this chapter:</b> a secret in a file is only as safe as the file's permissions. The <code>.env</code> you created in the last chapter can be read by every account on the server. You will learn to read the permission string of <code>ls -l</code>, set the right mode with <code>chmod 600</code>, and write a small Python check that warns when a secret file is too open.</p>

<h3>Analogy: three kinds of keys</h3>
<p>An office has three kinds of people: the <b>owner</b> of a room, the owner's <b>team</b> (group) and <b>everybody else</b> (others). For each, you decide whether they may look in (<b>r</b>ead), change things (<b>w</b>rite) or walk through as a program (e<b>x</b>ecute). A secret room gives the key to the owner only.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="The permission string rw-r----- split into owner, group and others">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">-rw-r-----  1 netadmin netadmin  31  .env</text>
<rect x="150" y="40" width="30" height="40" rx="6" fill="#e2e8f0"/><text x="165" y="66" text-anchor="middle" class="svg-ink" font-size="12">-</text>
<rect x="190" y="40" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="12">rw- = 6</text>
<rect x="290" y="40" width="90" height="40" rx="6" fill="#fde68a"/><text x="335" y="66" text-anchor="middle" class="svg-ink" font-size="12">r-- = 4</text>
<rect x="390" y="40" width="90" height="40" rx="6" fill="#fecaca"/><text x="435" y="66" text-anchor="middle" class="svg-ink" font-size="12">--- = 0</text>
<text x="165" y="104" text-anchor="middle" class="svg-muted" font-size="11">file</text><text x="235" y="104" text-anchor="middle" class="svg-muted" font-size="11">owner</text><text x="335" y="104" text-anchor="middle" class="svg-muted" font-size="11">group</text><text x="435" y="104" text-anchor="middle" class="svg-muted" font-size="11">others</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">r = 4, w = 2, x = 1 : add them up per group, so rw-r----- is 640</text>
</svg><p class="cap">Read the ten characters in groups: type, owner, group, others.</p></div>

<h3>Reading ls -l</h3>
<p>The first character is the type (<code>-</code> for a normal file, <code>d</code> for a directory). The next nine are three groups of <code>rwx</code>. A dash means "not allowed". Add the numbers (r=4, w=2, x=1) inside each group and you get the <b>octal mode</b> that <code>chmod</code> accepts.</p>
<table class="cmp"><tr><th>Mode</th><th>Looks like</th><th>Meaning for a secret file</th></tr>
<tr><td><code>600</code></td><td><code>-rw-------</code></td><td>Owner reads and writes. Nobody else. <b>The target.</b></td></tr>
<tr><td><code>400</code></td><td><code>-r--------</code></td><td>Owner reads only. Even stricter.</td></tr>
<tr><td><code>640</code></td><td><code>-rw-r-----</code></td><td>The group can read. Too open unless the group is exactly your service team.</td></tr>
<tr><td><code>644</code></td><td><code>-rw-r--r--</code></td><td>Everybody can read. The typical default. <b>Wrong for secrets.</b></td></tr>
<tr><td><code>604</code></td><td><code>-rw----r--</code></td><td>Odd but real: others can read. Easy to miss.</td></tr>
</table>

<h3>Setting the mode with chmod</h3>
<p>Lab 1 asks for <code>chmod 600 .env</code>. Watch the string change:</p>
<pre class="out">AUTO01$ ls -l .env
-rw-rw-r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ chmod 600 .env
AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p>The same idea protects the folder of saved configurations. A <b>directory</b> needs the <code>x</code> bit to be entered, so the private mode for a folder is <code>700</code>:</p>
<pre class="out">AUTO01$ chmod 700 backups
AUTO01$ ls -ld backups
<span class="hl">drwx------</span>  2 netadmin netadmin   4096 Sep 29 09:00 backups</pre>
<p>Backups contain password hashes and the full network design, so they deserve the same care as <code>.env</code>. <code>ls -ld</code> shows the folder itself instead of its content.</p>

<h3>Checking the mode from Python</h3>
<p>A good tool refuses to run, or at least warns, when its secret file is too open. Python reads the mode with <code>os.stat</code> and the <code>stat</code> module:</p>
<pre class="code">import os
import stat

st = os.stat(".env")
mode = stat.S_IMODE(st.st_mode)
print(oct(mode), stat.filemode(st.st_mode))
print("group/other bits:", oct(mode &amp; 0o077))</pre>
<ul>
<li><code>os.stat(path)</code> returns the file's facts; <code>st.st_mode</code> mixes the file type and the permission bits.</li>
<li><code>stat.S_IMODE(...)</code> keeps only the permission bits. <code>oct(...)</code> prints them in octal, with the prefix <code>0o</code>.</li>
<li><code>stat.filemode(...)</code> turns the number back into the familiar <code>-rw-------</code> text.</li>
<li><code>mode &amp; 0o077</code> is a <b>bit mask</b>: <code>0o077</code> selects the six group and other bits. If the result is not zero, someone besides the owner has some access.</li>
</ul>
<pre class="out">AUTO01$ chmod 600 .env
AUTO01$ python3 perm.py
0o600 -rw-------
group/other bits: 0o0
AUTO01$ chmod 640 .env
AUTO01$ python3 perm.py
0o640 -rw-r-----
group/other bits: <span class="hl">0o40</span>
AUTO01$ chmod 604 .env
AUTO01$ python3 perm.py
0o604 -rw----r--
group/other bits: <span class="hl">0o4</span></pre>
<p>Mode 640 leaves the group's read bit (0o40); mode 604 leaves the others' read bit (0o4). Both are caught by the mask. The finished check is one line:</p>
<pre class="code">def is_private(path):
    mode = stat.S_IMODE(os.stat(path).st_mode)
    return mode &amp; 0o077 == 0</pre>
<pre class="out">AUTO01$ python3 permok.py
.env True
devices.csv <span class="hl">False</span></pre>
<p>The mask names the exact bits to forbid. In Lab 2 you will meet a version of this function that uses the wrong mask, <code>0o070</code>, and approves mode 604. Keep that in mind: a security check is only as good as its mask.</p>

<div class="eg"><p><b>Worked example.</b> Decode <code>-rw-r-----</code>: type <code>-</code>; owner <code>rw-</code> = 4+2 = 6; group <code>r--</code> = 4; others <code>---</code> = 0. The mode is 640. Now decode 604 yourself: owner 6, group 0, others 4, which is <code>-rw----r--</code>. The group cannot read it but every stranger can.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the mode but not the folder around it. Using <code>chmod 777</code> to "make the error go away". Creating the file with a secret inside first and tightening the mode afterwards, which leaves a short window of exposure. Believing <code>chmod</code> hides a file from the administrator of the machine; it does not.</p></div>
<div class="exam"><p><b>Exam trap.</b> The octal digits are in the order owner, group, others. A mode of 604 is not "almost 600": it gives the world read access. The correct secret-file modes are 600 or 400.</p></div>

<div class="scn"><h4>A backup folder everyone could read</h4><p>An audit of a shared automation server found the <code>backups</code> folder with mode 755. Any of the twelve accounts on the server could read every router configuration, including the password hashes. Nobody had misused it, but the audit finding forced a password rotation anyway. <code>chmod 700 backups</code> and a nightly permission check closed the finding.</p><p><b>Lesson:</b> treat the output of your own tools as sensitive too.</p></div>

<div class="iv"><p class="q">"What does chmod 600 do and why use it on a credentials file?"</p><p>It gives the owner read and write permission and removes all access for the group and others. A credentials file must be readable only by the account that runs the job, so other local users cannot read the password. I also check the mode in code and refuse to run when group or other bits are set.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ls -l</code> shows type, then owner, group and others as <code>rwx</code>; r=4, w=2, x=1.</li>
<li>Secret files should be 600 (or 400); private folders 700.</li>
<li><code>os.stat</code>, <code>stat.S_IMODE</code> and <code>oct</code> read the mode in Python.</li>
<li><code>mode &amp; 0o077 == 0</code> means no group or other access at all.</li>
<li>A check with the wrong mask gives false comfort.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> file mein rakha secret utna hi safe hai jitni file ki permissions. Pichhle chapter mein banayi <code>.env</code> ko server ka har account padh sakta hai. Aap <code>ls -l</code> ki permission string padhna, <code>chmod 600</code> se sahi mode set karna, aur chhota Python check likhna seekhoge jo secret file zyada khuli ho to warn kare.</p>

<h3>Analogy: teen tarah ki chaabiyan</h3>
<p>Office mein teen tarah ke log hote hain: kamre ka <b>owner</b>, owner ki <b>team</b> (group) aur <b>baaki sab</b> (others). Har ek ke liye aap tay karte ho ki woh andar dekh sakta hai (<b>r</b>ead), cheezein badal sakta hai (<b>w</b>rite) ya program ki tarah chala sakta hai (e<b>x</b>ecute). Secret kamre ki chaabi sirf owner ko milti hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Permission string rw-r----- owner, group aur others mein bata hua">
<text x="320" y="24" text-anchor="middle" class="svg-ink" font-size="14">-rw-r-----  1 netadmin netadmin  31  .env</text>
<rect x="150" y="40" width="30" height="40" rx="6" fill="#e2e8f0"/><text x="165" y="66" text-anchor="middle" class="svg-ink" font-size="12">-</text>
<rect x="190" y="40" width="90" height="40" rx="6" fill="#bbf7d0"/><text x="235" y="66" text-anchor="middle" class="svg-ink" font-size="12">rw- = 6</text>
<rect x="290" y="40" width="90" height="40" rx="6" fill="#fde68a"/><text x="335" y="66" text-anchor="middle" class="svg-ink" font-size="12">r-- = 4</text>
<rect x="390" y="40" width="90" height="40" rx="6" fill="#fecaca"/><text x="435" y="66" text-anchor="middle" class="svg-ink" font-size="12">--- = 0</text>
<text x="165" y="104" text-anchor="middle" class="svg-muted" font-size="11">file</text><text x="235" y="104" text-anchor="middle" class="svg-muted" font-size="11">owner</text><text x="335" y="104" text-anchor="middle" class="svg-muted" font-size="11">group</text><text x="435" y="104" text-anchor="middle" class="svg-muted" font-size="11">others</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">r = 4, w = 2, x = 1 : har group ka jod, to rw-r----- matlab 640</text>
</svg><p class="cap">Das characters ko groups mein padho: type, owner, group, others.</p></div>

<h3>ls -l padhna</h3>
<p>Pehla character type hai (<code>-</code> normal file, <code>d</code> directory). Agle nau characters <code>rwx</code> ke teen groups hain. Dash ka matlab "allowed nahi". Har group ke andar numbers jodo (r=4, w=2, x=1) aur aapko <b>octal mode</b> milta hai jo <code>chmod</code> leta hai.</p>
<table class="cmp"><tr><th>Mode</th><th>Dikhta hai</th><th>Secret file ke liye matlab</th></tr>
<tr><td><code>600</code></td><td><code>-rw-------</code></td><td>Owner padhta aur likhta hai. Aur koi nahi. <b>Target.</b></td></tr>
<tr><td><code>400</code></td><td><code>-r--------</code></td><td>Owner sirf padhta hai. Aur sakht.</td></tr>
<tr><td><code>640</code></td><td><code>-rw-r-----</code></td><td>Group padh sakta hai. Zyada khula, jab tak group theek aapki service team na ho.</td></tr>
<tr><td><code>644</code></td><td><code>-rw-r--r--</code></td><td>Sab padh sakte hain. Aam default. <b>Secrets ke liye galat.</b></td></tr>
<tr><td><code>604</code></td><td><code>-rw----r--</code></td><td>Ajeeb par asli: others padh sakte hain. Miss karna aasaan.</td></tr>
</table>

<h3>chmod se mode set karna</h3>
<p>Lab 1 <code>chmod 600 .env</code> maangta hai. String ko badalte dekho:</p>
<pre class="out">AUTO01$ ls -l .env
-rw-rw-r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ chmod 600 .env
AUTO01$ ls -l .env
<span class="hl">-rw-------  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p>Wahi idea saved configurations ke folder ko bachata hai. <b>Directory</b> mein enter karne ke liye <code>x</code> bit chahiye, isliye folder ka private mode <code>700</code> hai:</p>
<pre class="out">AUTO01$ chmod 700 backups
AUTO01$ ls -ld backups
<span class="hl">drwx------</span>  2 netadmin netadmin   4096 Sep 29 09:00 backups</pre>
<p>Backups mein password hashes aur poora network design hota hai, isliye unhe <code>.env</code> jaisi hi care chahiye. <code>ls -ld</code> folder ka content nahi, folder khud dikhata hai.</p>

<h3>Python se mode check karna</h3>
<p>Achha tool tab chalne se mana kar deta hai, ya kam se kam warn karta hai, jab uski secret file zyada khuli ho. Python mode ko <code>os.stat</code> aur <code>stat</code> module se padhta hai:</p>
<pre class="code">import os
import stat

st = os.stat(".env")
mode = stat.S_IMODE(st.st_mode)
print(oct(mode), stat.filemode(st.st_mode))
print("group/other bits:", oct(mode &amp; 0o077))</pre>
<ul>
<li><code>os.stat(path)</code> file ke facts deta hai; <code>st.st_mode</code> file type aur permission bits ko milata hai.</li>
<li><code>stat.S_IMODE(...)</code> sirf permission bits rakhta hai. <code>oct(...)</code> unhe octal mein print karta hai, prefix <code>0o</code> ke saath.</li>
<li><code>stat.filemode(...)</code> number ko wapas jaana-pehchana <code>-rw-------</code> text bana deta hai.</li>
<li><code>mode &amp; 0o077</code> ek <b>bit mask</b> hai: <code>0o077</code> group aur other ke chhe bits chunta hai. Result zero na ho to owner ke alawa kisi ko kuch access hai.</li>
</ul>
<pre class="out">AUTO01$ chmod 600 .env
AUTO01$ python3 perm.py
0o600 -rw-------
group/other bits: 0o0
AUTO01$ chmod 640 .env
AUTO01$ python3 perm.py
0o640 -rw-r-----
group/other bits: <span class="hl">0o40</span>
AUTO01$ chmod 604 .env
AUTO01$ python3 perm.py
0o604 -rw----r--
group/other bits: <span class="hl">0o4</span></pre>
<p>Mode 640 group ka read bit (0o40) chhodta hai; mode 604 others ka read bit (0o4) chhodta hai. Dono mask se pakde jaate hain. Poora check ek line ka hai:</p>
<pre class="code">def is_private(path):
    mode = stat.S_IMODE(os.stat(path).st_mode)
    return mode &amp; 0o077 == 0</pre>
<pre class="out">AUTO01$ python3 permok.py
.env True
devices.csv <span class="hl">False</span></pre>
<p>Mask un exact bits ka naam leta hai jo mana hain. Lab 2 mein aapko is function ka ek aisa version milega jo galat mask, <code>0o070</code>, use karta hai aur mode 604 ko approve kar deta hai. Yaad rakho: security check utna hi achha hai jitna uska mask.</p>

<div class="eg"><p><b>Worked example.</b> <code>-rw-r-----</code> decode karo: type <code>-</code>; owner <code>rw-</code> = 4+2 = 6; group <code>r--</code> = 4; others <code>---</code> = 0. Mode 640 hai. Ab 604 khud decode karo: owner 6, group 0, others 4, yaani <code>-rw----r--</code>. Group nahi padh sakta par har ajnabi padh sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mode theek karna par aas-paas ka folder nahi. "Error hatane" ke liye <code>chmod 777</code> karna. Pehle file mein secret daalna aur baad mein mode kasna, jisse thodi der ka exposure reh jaata hai. Yeh maanna ki <code>chmod</code> file ko machine ke administrator se chhupa deta hai; nahi chhupata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Octal digits ka order owner, group, others hai. Mode 604 "lagbhag 600" nahi hai: yeh duniya ko read access deta hai. Secret file ke sahi modes 600 ya 400 hain.</p></div>

<div class="scn"><h4>Backup folder jise sab padh sakte the</h4><p>Ek shared automation server ke audit mein <code>backups</code> folder mode 755 ke saath mila. Server ke barah accounts mein se koi bhi har router configuration, password hashes samet, padh sakta tha. Kisi ne misuse nahi kiya tha, phir bhi audit finding ne password rotation karwa di. <code>chmod 700 backups</code> aur nightly permission check ne finding band ki.</p><p><b>Lesson:</b> apne tools ke output ko bhi sensitive maano.</p></div>

<div class="iv"><p class="q">"chmod 600 kya karta hai aur credentials file par kyon lagate hain?"</p><p>Yeh owner ko read aur write permission deta hai aur group aur others ka saara access hata deta hai. Credentials file sirf us account ko readable honi chahiye jo job chalata hai, taaki doosre local users password na padh sakein. Main code mein mode check bhi karta hoon aur group ya other bits set hon to chalne se mana kar deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ls -l</code> type, phir owner, group aur others ko <code>rwx</code> mein dikhata hai; r=4, w=2, x=1.</li>
<li>Secret files 600 (ya 400) hon; private folders 700.</li>
<li><code>os.stat</code>, <code>stat.S_IMODE</code> aur <code>oct</code> Python mein mode padhte hain.</li>
<li><code>mode &amp; 0o077 == 0</code> ka matlab group ya other ka bilkul access nahi.</li>
<li>Galat mask wala check jhoota bharosa deta hai.</li>
</ul></div>
`}};export{e as default};