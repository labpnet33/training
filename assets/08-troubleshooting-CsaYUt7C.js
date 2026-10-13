var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from a vague ticket to evidence`,hi:`Troubleshooting workflow: vague ticket se evidence tak`},body:{en:`
<p><b>The idea of this chapter:</b> real tickets are vague: "the config is lost", "someone reused an IP". A good engineer follows a short routine so that nothing is guessed and nothing is destroyed. In this chapter you walk through both labs in that routine and learn to read the usual error messages.</p>

<h3>The six-step routine</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Six step routine">
<rect x="10" y="40" width="92" height="50" rx="8" fill="#e2e8f0"/><text x="56" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 Where am I?</text><text x="56" y="78" text-anchor="middle" class="svg-muted" font-size="10">pwd, hostname</text>
<rect x="112" y="40" width="92" height="50" rx="8" fill="#bae6fd"/><text x="158" y="62" text-anchor="middle" class="svg-ink" font-size="12">2 What do I</text><text x="158" y="78" text-anchor="middle" class="svg-muted" font-size="10">know? name/text</text>
<rect x="214" y="40" width="92" height="50" rx="8" fill="#bbf7d0"/><text x="260" y="62" text-anchor="middle" class="svg-ink" font-size="12">3 Pick tool</text><text x="260" y="78" text-anchor="middle" class="svg-muted" font-size="10">find or grep</text>
<rect x="316" y="40" width="92" height="50" rx="8" fill="#fde68a"/><text x="362" y="62" text-anchor="middle" class="svg-ink" font-size="12">4 Narrow</text><text x="362" y="78" text-anchor="middle" class="svg-muted" font-size="10">path, -l, -c</text>
<rect x="418" y="40" width="92" height="50" rx="8" fill="#ddd6fe"/><text x="464" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text><text x="464" y="78" text-anchor="middle" class="svg-muted" font-size="10">cat, ls -l</text>
<rect x="520" y="40" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="12">6 Copy, record</text><text x="570" y="78" text-anchor="middle" class="svg-muted" font-size="10">cp, ticket note</text>
</svg><p class="cap">Look, search, narrow, verify, then change a copy.</p></div>
<ol>
<li><b>Where am I?</b> <code>hostname</code>, <code>whoami</code>, <code>pwd</code>. Are you on the right server and in the right directory?</li>
<li><b>What do I know?</b> A file name (even a part of it), a piece of text such as an IP address, or an approximate time?</li>
<li><b>Pick the tool.</b> A name means <code>find</code>. A text means <code>grep -r</code>. A directory you want to see means <code>ls -R</code>.</li>
<li><b>Narrow it.</b> Search the smallest directory that can contain the answer. Use <code>-iname</code> if unsure of the case, <code>-l</code> to list files only, <code>-c</code> to count.</li>
<li><b>Verify.</b> Open the file (<code>cat</code>) and read the actual lines. Check <code>ls -l</code> for owner and time.</li>
<li><b>Act safely and record.</b> Copy evidence into the ticket folder with <code>cp</code>, never move the original. Change only copies. Write down what you found.</li>
</ol>

<h3>Walk-through 1: organise the archive (Lab 1, ticket NK-2207)</h3>
<p>Last night's backup dropped five configs and an old <code>.bak</code> into <code>~/incoming</code>. The folder looks plain, but there is a hidden hand-over note:</p>
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
<p>Steps 1 and 2 are done by <code>pwd</code> and <code>ls -la</code>; <code>cat incoming/.handover.txt</code> gives the plan (routers to <code>archive/routers</code>, switches to <code>archive/switches</code>, delete the <code>.bak</code>, ticket NK-2207). The work then follows chapters 5 and 6:</p>
<pre class="code">mkdir -p archive/{routers,switches}
ls incoming/*-R?.cfg            # preview first
mv incoming/*-R?.cfg archive/routers/
mv incoming/*-SW?.cfg archive/switches/
ls incoming/*.bak               # preview first
rm incoming/*.bak
cp -r archive archive-NK-2207   # safety copy before anyone else touches it
grep "ip address" archive/routers/HYD-EDGE-R3.cfg</pre>
<pre class="out">netadmin@nms01:~$ grep "ip address" archive/routers/HYD-EDGE-R3.cfg
 ip address 10.40.3.1 255.255.255.0</pre>
<p>Every destructive command (<code>mv</code>, <code>rm</code>) was preceded by an <code>ls</code> with the same pattern, and the evidence (the IP 10.40.3.1) was read from the file, not remembered.</p>

<h3>Walk-through 2: where is the Hyderabad config? (Lab 2, ticket NK-2231)</h3>
<p>The ticket: "HYD-EDGE-R3 was changed last quarter and nobody can find its config. Also 10.40.9.1 is reused on another router."</p>
<ol>
<li><b>Know:</b> a part of a name, "hyd". <b>Tool:</b> <code>find</code>. Not sure of the case, so <code>-iname</code>.</li>
<li><b>Know:</b> an IP, <code>10.40.9.1</code>. <b>Tool:</b> <code>grep -rl</code>.</li>
</ol>
<pre class="out">netadmin@nms01:~$ find /srv/configs -iname "*hyd*"
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep -rl "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep hostname /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
hostname BLR-EDGE-R2
netadmin@nms01:~$ grep -c "^interface" /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
4</pre>
<p>Answers for the ticket: the file is in <code>/srv/configs/2026/q3/tmp/work/</code> (a temporary folder, a bad place for the only copy), the duplicate belongs to <b>BLR-EDGE-R2</b>, and the Hyderabad config defines <b>4</b> interfaces. Then the evidence goes into a ticket folder as copies, and the Hyderabad copy gets a proper name:</p>
<pre class="code">mkdir -p tickets/NK-2231
cp /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg tickets/NK-2231/
cp /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg tickets/NK-2231/
cd tickets/NK-2231
mv hyd-edge-r3-final-v2.cfg HYD-EDGE-R3.cfg</pre>
<p>The originals stay untouched in <code>/srv/configs</code>. Renaming happens on the copy.</p>

<h3>Reading the common error messages</h3>
<table class="cmp"><tr><th>Message</th><th>Meaning and fix</th></tr>
<tr><td><code>No such file or directory</code></td><td>Wrong name or path. Check typos, case, <code>pwd</code>, and use Tab.</td></tr>
<tr><td><code>Permission denied</code></td><td>You are not allowed. See <code>ls -l</code> and the lx-users module. Do not reach for <code>chmod 777</code>.</td></tr>
<tr><td><code>Is a directory</code> (rm) / <code>Not a directory</code> (cd)</td><td>You used a file command on a directory, or the other way round.</td></tr>
<tr><td><code>File exists</code> (mkdir)</td><td>Already there. Fine, or use <code>-p</code>.</td></tr>
<tr><td><code>Directory not empty</code> (rmdir)</td><td>It still has contents. Look with <code>ls -la</code> before <code>rm -r</code>.</td></tr>
<tr><td><code>command not found</code></td><td>Typo, wrong case, or the program is not installed.</td></tr></table>
<pre class="out">netadmin@nms01:~$ tree -L 1 /srv
Command 'tree' not found, but can be installed with:
sudo apt install tree</pre>
<p>On Ubuntu the shell even tells you which package to install. On RHEL-family systems the equivalent is <code>sudo dnf install tree</code>. Installing software needs sudo, which you meet in lx-users.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing the original during an investigation: always work on copies, because evidence must stay as found. (2) Searching a huge tree when the quarter is known. (3) Stopping at the first match: a duplicate IP means look for the <i>second</i> file. (4) Not writing down the command. Paste the exact command and output into the ticket so a colleague can repeat it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often give a scenario ("find which config contains an IP") and ask for the right command. Choose <code>grep -r</code> for content and <code>find</code> for names; and choose <code>cp</code>, not <code>mv</code>, to keep the original.</p></div>

<div class="scn"><h4>The config in the temp folder</h4><p>A new engineer was told "the Hyderabad config is on the server". She searched with <code>-name "*HYD*"</code> and found nothing, and was ready to report it missing. A senior colleague asked her to try <code>-iname</code>. It found a lower-case file inside <code>tmp/work</code>, the only copy, with the word "final-v2" in its name. It was copied into the official archive that day and a rule was added: nothing important lives in tmp.</p><p><b>Lesson:</b> when a search returns nothing, change one thing (case, path, tool) before concluding the file is gone.</p></div>

<div class="iv"><p class="q">"Walk me through how you would investigate 'we cannot find the config for router X'."</p><p>Confirm the server and directory, then search by name with <code>find -iname</code> in the backup tree. If that fails, search by content, for example its hostname or loopback address, with <code>grep -rl</code>. Verify the hit by reading it, copy it to a ticket folder, and never edit the original. Mention that you record the commands used.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: where am I, what do I know, pick the tool, narrow, verify, copy and record.</li>
<li>Preview every destructive command with <code>ls</code> on the same pattern.</li>
<li>Nothing found? Change the case, the path, or the tool before giving up.</li>
<li>Work on copies; keep the original as evidence.</li>
<li>Learn the six common error messages and what they mean.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> real tickets vague hote hain: "config kho gayi", "kisi ne IP dobara use kiya". Achha engineer ek chhoti routine follow karta hai taaki kuch guess na ho aur kuch nasht na ho. Is chapter mein aap dono labs ko usi routine mein chaloge aur aam error messages padhna seekhoge.</p>

<h3>Chhe-step routine</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Chhe step routine">
<rect x="10" y="40" width="92" height="50" rx="8" fill="#e2e8f0"/><text x="56" y="62" text-anchor="middle" class="svg-ink" font-size="12">1 Kahan hoon?</text><text x="56" y="78" text-anchor="middle" class="svg-muted" font-size="10">pwd, hostname</text>
<rect x="112" y="40" width="92" height="50" rx="8" fill="#bae6fd"/><text x="158" y="62" text-anchor="middle" class="svg-ink" font-size="12">2 Kya pata hai?</text><text x="158" y="78" text-anchor="middle" class="svg-muted" font-size="10">naam/text</text>
<rect x="214" y="40" width="92" height="50" rx="8" fill="#bbf7d0"/><text x="260" y="62" text-anchor="middle" class="svg-ink" font-size="12">3 Tool chuno</text><text x="260" y="78" text-anchor="middle" class="svg-muted" font-size="10">find ya grep</text>
<rect x="316" y="40" width="92" height="50" rx="8" fill="#fde68a"/><text x="362" y="62" text-anchor="middle" class="svg-ink" font-size="12">4 Narrow karo</text><text x="362" y="78" text-anchor="middle" class="svg-muted" font-size="10">path, -l, -c</text>
<rect x="418" y="40" width="92" height="50" rx="8" fill="#ddd6fe"/><text x="464" y="62" text-anchor="middle" class="svg-ink" font-size="12">5 Verify</text><text x="464" y="78" text-anchor="middle" class="svg-muted" font-size="10">cat, ls -l</text>
<rect x="520" y="40" width="100" height="50" rx="8" fill="#fed7aa"/><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="12">6 Copy, record</text><text x="570" y="78" text-anchor="middle" class="svg-muted" font-size="10">cp, ticket note</text>
</svg><p class="cap">Dekho, dhoondho, narrow karo, verify karo, phir copy badlo.</p></div>
<ol>
<li><b>Kahan hoon?</b> <code>hostname</code>, <code>whoami</code>, <code>pwd</code>. Kya aap sahi server aur sahi directory mein ho?</li>
<li><b>Kya pata hai?</b> File ka naam (uska kuch hissa bhi), koi text jaise IP address, ya andaza hua time?</li>
<li><b>Tool chuno.</b> Naam matlab <code>find</code>. Text matlab <code>grep -r</code>. Directory dekhni ho to <code>ls -R</code>.</li>
<li><b>Narrow karo.</b> Sabse chhoti directory mein search karo jisme jawab ho sakta hai. Case ka pata na ho to <code>-iname</code>, sirf files list karne ke liye <code>-l</code>, ginne ke liye <code>-c</code>.</li>
<li><b>Verify.</b> File kholo (<code>cat</code>) aur asli lines padho. Owner aur time ke liye <code>ls -l</code> dekho.</li>
<li><b>Safely act karo aur record rakho.</b> Evidence ko <code>cp</code> se ticket folder mein copy karo, original kabhi move mat karo. Sirf copies badlo. Jo mila woh likho.</li>
</ol>

<h3>Walk-through 1: archive organise karo (Lab 1, ticket NK-2207)</h3>
<p>Kal raat ke backup ne paanch configs aur ek purani <code>.bak</code> <code>~/incoming</code> mein daal di. Folder simple dikhta hai, par ek hidden hand-over note hai:</p>
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
<p>Steps 1 aur 2 <code>pwd</code> aur <code>ls -la</code> se ho gaye; <code>cat incoming/.handover.txt</code> plan deta hai (routers <code>archive/routers</code> mein, switches <code>archive/switches</code> mein, <code>.bak</code> delete, ticket NK-2207). Phir kaam chapters 5 aur 6 ke hisaab se chalta hai:</p>
<pre class="code">mkdir -p archive/{routers,switches}
ls incoming/*-R?.cfg            # pehle preview
mv incoming/*-R?.cfg archive/routers/
mv incoming/*-SW?.cfg archive/switches/
ls incoming/*.bak               # pehle preview
rm incoming/*.bak
cp -r archive archive-NK-2207   # kisi aur ke chhune se pehle safety copy
grep "ip address" archive/routers/HYD-EDGE-R3.cfg</pre>
<pre class="out">netadmin@nms01:~$ grep "ip address" archive/routers/HYD-EDGE-R3.cfg
 ip address 10.40.3.1 255.255.255.0</pre>
<p>Har destructive command (<code>mv</code>, <code>rm</code>) se pehle usi pattern ke saath <code>ls</code> chala, aur evidence (IP 10.40.3.1) file se padha gaya, yaad se nahi.</p>

<h3>Walk-through 2: Hyderabad ki config kahan hai? (Lab 2, ticket NK-2231)</h3>
<p>Ticket: "HYD-EDGE-R3 pichhle quarter badla gaya aur kisi ko uski config nahi mil rahi. Saath hi 10.40.9.1 doosre router par dobara use hua hai."</p>
<ol>
<li><b>Pata hai:</b> naam ka ek hissa, "hyd". <b>Tool:</b> <code>find</code>. Case ka pata nahi, isliye <code>-iname</code>.</li>
<li><b>Pata hai:</b> ek IP, <code>10.40.9.1</code>. <b>Tool:</b> <code>grep -rl</code>.</li>
</ol>
<pre class="out">netadmin@nms01:~$ find /srv/configs -iname "*hyd*"
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep -rl "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep hostname /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
hostname BLR-EDGE-R2
netadmin@nms01:~$ grep -c "^interface" /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
4</pre>
<p>Ticket ke jawab: file <code>/srv/configs/2026/q3/tmp/work/</code> mein hai (ek temporary folder, ikloti copy ke liye buri jagah), duplicate <b>BLR-EDGE-R2</b> ka hai, aur Hyderabad config mein <b>4</b> interfaces defined hain. Phir evidence copies ke roop mein ticket folder mein jaata hai, aur Hyderabad copy ko sahi naam milta hai:</p>
<pre class="code">mkdir -p tickets/NK-2231
cp /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg tickets/NK-2231/
cp /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg tickets/NK-2231/
cd tickets/NK-2231
mv hyd-edge-r3-final-v2.cfg HYD-EDGE-R3.cfg</pre>
<p>Originals <code>/srv/configs</code> mein jas ke tas rehte hain. Rename copy par hota hai.</p>

<h3>Aam error messages padhna</h3>
<table class="cmp"><tr><th>Message</th><th>Matlab aur fix</th></tr>
<tr><td><code>No such file or directory</code></td><td>Galat naam ya path. Typos, case, <code>pwd</code> check karo, aur Tab use karo.</td></tr>
<tr><td><code>Permission denied</code></td><td>Aapko ijaazat nahi. <code>ls -l</code> aur lx-users module dekho. <code>chmod 777</code> par mat jao.</td></tr>
<tr><td><code>Is a directory</code> (rm) / <code>Not a directory</code> (cd)</td><td>Aapne directory par file command, ya ulta chalaya.</td></tr>
<tr><td><code>File exists</code> (mkdir)</td><td>Pehle se hai. Theek hai, ya <code>-p</code> use karo.</td></tr>
<tr><td><code>Directory not empty</code> (rmdir)</td><td>Abhi contents hain. <code>rm -r</code> se pehle <code>ls -la</code> se dekho.</td></tr>
<tr><td><code>command not found</code></td><td>Typo, galat case, ya program installed nahi.</td></tr></table>
<pre class="out">netadmin@nms01:~$ tree -L 1 /srv
Command 'tree' not found, but can be installed with:
sudo apt install tree</pre>
<p>Ubuntu par shell khud batata hai kaunsa package install karna hai. RHEL-family par iska equivalent <code>sudo dnf install tree</code> hai. Software install karne ke liye sudo chahiye, jo aap lx-users mein milenge.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Investigation ke dauran original badalna: hamesha copies par kaam karo, kyunki evidence jaisa mila waisa rehna chahiye. (2) Quarter pata ho phir bhi bade tree mein search karna. (3) Pehle match par ruk jaana: duplicate IP ka matlab <i>doosri</i> file dhoondho. (4) Command na likhna. Exact command aur output ticket mein paste karo taaki colleague use dohra sake.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar scenario dete hain ("dhoondho kis config mein IP hai") aur sahi command poochte hain. Content ke liye <code>grep -r</code> aur names ke liye <code>find</code> chuno; aur original rakhne ke liye <code>mv</code> nahi, <code>cp</code> chuno.</p></div>

<div class="scn"><h4>Temp folder mein padi config</h4><p>Ek naye engineer ko bataya gaya "Hyderabad config server par hai". Usne <code>-name "*HYD*"</code> se search kiya, kuch nahi mila, aur woh use missing report karne wali thi. Ek senior colleague ne <code>-iname</code> try karne ko kaha. Usne <code>tmp/work</code> ke andar lower-case file dhoondh li, ikloti copy, jiske naam mein "final-v2" tha. Use usi din official archive mein copy kiya gaya aur ek rule joda gaya: tmp mein kuch zaroori nahi rehta.</p><p><b>Lesson:</b> search se kuch na mile to file gayi maanne se pehle ek cheez badlo (case, path, tool).</p></div>

<div class="iv"><p class="q">"'Router X ki config nahi mil rahi' ki investigation kaise karoge, step by step batao."</p><p>Pehle server aur directory confirm karunga, phir backup tree mein <code>find -iname</code> se naam se search. Fail ho to content se, jaise uska hostname ya loopback address, <code>grep -rl</code> ke saath. Hit ko padhkar verify karunga, ticket folder mein copy karunga, aur original kabhi edit nahi karunga. Batao ki aap use kiye commands record karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routine: kahan hoon, kya pata hai, tool chuno, narrow karo, verify karo, copy aur record.</li>
<li>Har destructive command se pehle usi pattern par <code>ls</code> se preview karo.</li>
<li>Kuch nahi mila? Haar manne se pehle case, path ya tool badlo.</li>
<li>Copies par kaam karo; original ko evidence ki tarah rakho.</li>
<li>Chhe aam error messages aur unka matlab seekho.</li>
</ul></div>
`}};export{e as default};