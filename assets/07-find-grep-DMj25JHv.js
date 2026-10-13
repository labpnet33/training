var e={id:`find-grep`,h:{en:`Finding files and finding text: find and grep -r`,hi:`Files dhoondhna aur text dhoondhna: find aur grep -r`},body:{en:`
<p><b>The idea of this chapter:</b> a backup server holds years of configs. You will never open them one by one. Two different questions need two different tools:</p>
<ul>
<li><b>"Where is the file called ...?"</b> uses <code>find</code>, which searches by <b>name</b>, type, size or age.</li>
<li><b>"Which file contains the text ...?"</b> uses <code>grep -r</code>, which searches <b>inside</b> the files.</li>
</ul>
<p>Mixing them up is the number one beginner mistake. <code>find</code> never looks inside a file, and <code>grep</code> never cares what the file is called.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="find versus grep">
<rect x="20" y="20" width="270" height="110" rx="10" fill="#bae6fd"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="15">find</text><text x="155" y="72" text-anchor="middle" class="svg-muted" font-size="12">looks at NAMES, types, sizes, ages</text><text x="155" y="96" text-anchor="middle" class="svg-ink" font-size="12">find /srv -iname "*hyd*"</text><text x="155" y="116" text-anchor="middle" class="svg-muted" font-size="12">answer: a list of paths</text>
<rect x="350" y="20" width="270" height="110" rx="10" fill="#fde68a"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="15">grep -r</text><text x="485" y="72" text-anchor="middle" class="svg-muted" font-size="12">looks INSIDE files for text</text><text x="485" y="96" text-anchor="middle" class="svg-ink" font-size="12">grep -rl "10.40.9.1" /srv</text><text x="485" y="116" text-anchor="middle" class="svg-muted" font-size="12">answer: files and lines</text>
</svg><p class="cap">Name search versus content search.</p></div>

<h3>The lab data</h3>
<p>The Deccan Net backups sit in <code>/srv/configs</code>, sorted by year, quarter and city:</p>
<pre class="out">netadmin@nms01:~$ ls -R /srv/configs/2026
/srv/configs/2026:
q1  q2  q3

/srv/configs/2026/q1:
pune

/srv/configs/2026/q1/pune:
PUN-CORE-R1.cfg

/srv/configs/2026/q2:
blr  chn

/srv/configs/2026/q2/blr:
BLR-EDGE-R2.cfg

/srv/configs/2026/q2/chn:
CHN-EDGE-R4.cfg

/srv/configs/2026/q3:
pune  tmp

/srv/configs/2026/q3/pune:
PUN-CORE-R1.cfg

/srv/configs/2026/q3/tmp:
work

/srv/configs/2026/q3/tmp/work:
hyd-edge-r3-final-v2.cfg</pre>

<h3>find: search by name</h3>
<p>The shape is <code>find  where-to-start  conditions</code>. By default it lists everything below the start directory that matches.</p>
<pre class="out">netadmin@nms01:~$ find /srv/configs -name "*HYD*"
netadmin@nms01:~$ find /srv/configs -iname "*hyd*"
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg</pre>
<p>The first search found nothing. <code>-name</code> is <b>case-sensitive</b> and this file has a lower-case name. <code>-iname</code> ignores case and finds it, hidden in a "tmp/work" folder where nobody would look. Notice the quotes around <code>"*hyd*"</code>: the pattern must reach <code>find</code>, not be expanded by the shell.</p>
<p>More conditions, all real simulator output:</p>
<pre class="out">netadmin@nms01:~$ find /srv/configs -type f -name "*.cfg"
/srv/configs/2025/q4/blr/BLR-EDGE-R2.cfg
/srv/configs/2025/q4/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q1/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q2/chn/CHN-EDGE-R4.cfg
/srv/configs/2026/q3/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ find /srv/configs -maxdepth 2
/srv/configs
/srv/configs/2025
/srv/configs/2025/q4
/srv/configs/2026
/srv/configs/2026/q1
/srv/configs/2026/q2
/srv/configs/2026/q3
netadmin@nms01:~$ find /srv/configs -name "*.cfg" | wc -l
7</pre>
<ul>
<li><code>-type f</code> files only, <code>-type d</code> directories only.</li>
<li><code>-maxdepth 2</code> do not go deeper than two levels.</li>
<li>Pipe into <code>wc -l</code> to count results (the pipe is explained in the next module).</li>
</ul>
<p>If you search from <code>/</code> as a normal user, you will see lines such as <code>find: '/root': Permission denied</code>. They are harmless warnings: you are not allowed to look in that directory.</p>
<p><b>Reference commands (not run in the simulator):</b> <code>find</code> can also test age and size, and run a command on every hit. The simulator does not evaluate these tests reliably, so treat them as a reference for a real server.</p>
<pre class="code">find /var/log -name "*.log" -mtime -1       # changed in the last 24 hours
find /srv/configs -size +1M                  # bigger than 1 MB
find /tmp -name "*.tmp" -mtime +7            # older than 7 days
find /srv/configs -name "*.bak" -exec ls -l {} \\;   # run ls -l on each hit</pre>

<h3>grep -r: search inside files</h3>
<p><code>grep pattern file</code> prints the lines of one file that contain the pattern. With <code>-r</code> (recursive) it walks a whole directory tree:</p>
<pre class="out">netadmin@nms01:~$ grep -r "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg: ip address 10.40.9.1 255.255.255.252
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: ip address 10.40.9.1 255.255.255.252
netadmin@nms01:~$ grep -rl "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep -rn "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg:8: ip address 10.40.9.1 255.255.255.252
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg:7: ip address 10.40.9.1 255.255.255.252</pre>
<p>In one second you learn that two different routers have the same IP address, a duplicate-IP fault. <code>-l</code> prints only the file names, <code>-n</code> adds line numbers, <code>-i</code> ignores case, <code>-c</code> counts matching lines per file:</p>
<pre class="out">netadmin@nms01:~$ grep hostname /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
hostname BLR-EDGE-R2
netadmin@nms01:~$ grep -c "^interface" /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
4
netadmin@nms01:~$ grep -ri "SHUTDOWN" /srv/configs
/srv/configs/2025/q4/blr/BLR-EDGE-R2.cfg: no shutdown
/srv/configs/2025/q4/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q1/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q2/chn/CHN-EDGE-R4.cfg: no shutdown
/srv/configs/2026/q3/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: shutdown
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: shutdown</pre>
<p>The pattern <code>^interface</code> uses <code>^</code>, which means "at the start of the line", so only real interface headers are counted, not text like <code>no interface</code>. The <code>-ri</code> search shows how a word can hide inside another (<code>no shutdown</code> contains <code>shutdown</code>); read the whole line, not just the match. Full grep, with patterns and options, is the heart of the next module.</p>
<p>Use <code>--include</code> to restrict a recursive search to certain files: <code>grep -r "10.40.9.1" /srv/configs/2026 --include=*.cfg</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>find -name</code> to look for text, or <code>grep</code> to look for a file name. (2) Using <code>-name</code> when you are not sure about the case: use <code>-iname</code>. (3) Forgetting the quotes around patterns. (4) Running <code>grep -r</code> from <code>/</code>: it takes ages and reads files you should not. Start in the narrowest directory that makes sense.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find</code> = by name, type, size, age. <code>grep</code> = by content. <code>find -name</code> is case-sensitive and <code>-iname</code> is not; <code>grep -i</code> is the case-insensitive grep. <code>grep -l</code> lists file names; <code>grep -c</code> counts.</p></div>

<div class="scn"><h4>Who reused 10.40.9.1?</h4><p>Ticket NK-2231: the Hyderabad router lost its OSPF neighbour intermittently. A search of the backup tree with <code>grep -rl "10.40.9.1" /srv/configs</code> showed two files, both claiming that address. One was the Hyderabad config, the other was a temporary link on the Bengaluru router with a note "ask Ravi". The duplicate IP was causing ARP confusion. The engineer attached both files to the ticket and the Bengaluru address was changed the same day.</p><p><b>Lesson:</b> a content search over configs finds in seconds what would take an hour of logging into routers.</p></div>

<div class="iv"><p class="q">"A ticket says an IP address is duplicated somewhere. How do you find it with the config backups?"</p><p>Run <code>grep -rn "10.40.9.1" /srv/configs</code>, ideally on the newest backup folder only. It prints every file and line number holding the address. Then check hostnames with <code>grep hostname</code> on those files. Explain that <code>find</code> is for names, so it would be the wrong tool here.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>find</code> searches names, types and ages; <code>grep -r</code> searches text inside files.</li>
<li><code>-name</code> is case-sensitive; <code>-iname</code> ignores case; always quote the pattern.</li>
<li><code>-type f</code>, <code>-type d</code> and <code>-maxdepth</code> narrow a <code>find</code>.</li>
<li><code>grep -rl</code> lists files, <code>-n</code> adds line numbers, <code>-c</code> counts, <code>-i</code> ignores case.</li>
<li>Start your search in the narrowest directory, not in <code>/</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> backup server mein saalon ki configs hoti hain. Aap unhe ek-ek karke nahi khologe. Do alag sawaalon ke liye do alag tools chahiye:</p>
<ul>
<li><b>"... naam ki file kahan hai?"</b> ke liye <code>find</code>, jo <b>naam</b>, type, size ya age se dhoondhta hai.</li>
<li><b>"Kis file mein ... text hai?"</b> ke liye <code>grep -r</code>, jo files ke <b>andar</b> dhoondhta hai.</li>
</ul>
<p>Inhe mix karna beginner ki number ek galti hai. <code>find</code> kabhi file ke andar nahi dekhta, aur <code>grep</code> ko file ke naam se matlab nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="find aur grep">
<rect x="20" y="20" width="270" height="110" rx="10" fill="#bae6fd"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="15">find</text><text x="155" y="72" text-anchor="middle" class="svg-muted" font-size="12">NAAM, type, size, age dekhta hai</text><text x="155" y="96" text-anchor="middle" class="svg-ink" font-size="12">find /srv -iname "*hyd*"</text><text x="155" y="116" text-anchor="middle" class="svg-muted" font-size="12">jawab: paths ki list</text>
<rect x="350" y="20" width="270" height="110" rx="10" fill="#fde68a"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="15">grep -r</text><text x="485" y="72" text-anchor="middle" class="svg-muted" font-size="12">files ke ANDAR text dhoondhta hai</text><text x="485" y="96" text-anchor="middle" class="svg-ink" font-size="12">grep -rl "10.40.9.1" /srv</text><text x="485" y="116" text-anchor="middle" class="svg-muted" font-size="12">jawab: files aur lines</text>
</svg><p class="cap">Naam se search versus content se search.</p></div>

<h3>Lab data</h3>
<p>Deccan Net ke backups <code>/srv/configs</code> mein hain, saal, quarter aur city ke hisaab se sorted:</p>
<pre class="out">netadmin@nms01:~$ ls -R /srv/configs/2026
/srv/configs/2026:
q1  q2  q3

/srv/configs/2026/q1:
pune

/srv/configs/2026/q1/pune:
PUN-CORE-R1.cfg

/srv/configs/2026/q2:
blr  chn

/srv/configs/2026/q2/blr:
BLR-EDGE-R2.cfg

/srv/configs/2026/q2/chn:
CHN-EDGE-R4.cfg

/srv/configs/2026/q3:
pune  tmp

/srv/configs/2026/q3/pune:
PUN-CORE-R1.cfg

/srv/configs/2026/q3/tmp:
work

/srv/configs/2026/q3/tmp/work:
hyd-edge-r3-final-v2.cfg</pre>

<h3>find: naam se search</h3>
<p>Shape hai <code>find  kahan-se-shuru  conditions</code>. Default mein yeh start directory ke neeche jo bhi match ho sab list karta hai.</p>
<pre class="out">netadmin@nms01:~$ find /srv/configs -name "*HYD*"
netadmin@nms01:~$ find /srv/configs -iname "*hyd*"
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg</pre>
<p>Pehli search ko kuch nahi mila. <code>-name</code> <b>case-sensitive</b> hai aur is file ka naam lower case mein hai. <code>-iname</code> case ignore karta hai aur use dhoondh leta hai, ek "tmp/work" folder mein chhipi hui jahan koi nahi dekhta. <code>"*hyd*"</code> ke aas-paas quotes dekho: pattern <code>find</code> tak pahunchna chahiye, shell dwara expand nahi hona chahiye.</p>
<p>Aur conditions, sab real simulator output:</p>
<pre class="out">netadmin@nms01:~$ find /srv/configs -type f -name "*.cfg"
/srv/configs/2025/q4/blr/BLR-EDGE-R2.cfg
/srv/configs/2025/q4/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q1/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q2/chn/CHN-EDGE-R4.cfg
/srv/configs/2026/q3/pune/PUN-CORE-R1.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ find /srv/configs -maxdepth 2
/srv/configs
/srv/configs/2025
/srv/configs/2025/q4
/srv/configs/2026
/srv/configs/2026/q1
/srv/configs/2026/q2
/srv/configs/2026/q3
netadmin@nms01:~$ find /srv/configs -name "*.cfg" | wc -l
7</pre>
<ul>
<li><code>-type f</code> sirf files, <code>-type d</code> sirf directories.</li>
<li><code>-maxdepth 2</code> do level se zyada gehra mat jao.</li>
<li>Results ginne ke liye <code>wc -l</code> mein pipe karo (pipe agle module mein samjhaya hai).</li>
</ul>
<p>Normal user ke roop mein <code>/</code> se search karoge to <code>find: '/root': Permission denied</code> jaisi lines dikhengi. Yeh harmless warnings hain: aapko us directory mein dekhne ki ijaazat nahi hai.</p>
<p><b>Reference commands (simulator mein nahi chalte):</b> <code>find</code> age aur size bhi test kar sakta hai, aur har hit par command chala sakta hai. Simulator in tests ko reliably evaluate nahi karta, isliye inhe real server ke liye reference maano.</p>
<pre class="code">find /var/log -name "*.log" -mtime -1       # pichhle 24 ghante mein badli
find /srv/configs -size +1M                  # 1 MB se badi
find /tmp -name "*.tmp" -mtime +7            # 7 din se purani
find /srv/configs -name "*.bak" -exec ls -l {} \\;   # har hit par ls -l chalao</pre>

<h3>grep -r: files ke andar search</h3>
<p><code>grep pattern file</code> ek file ki woh lines print karta hai jinme pattern ho. <code>-r</code> (recursive) ke saath yeh poora directory tree ghoomta hai:</p>
<pre class="out">netadmin@nms01:~$ grep -r "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg: ip address 10.40.9.1 255.255.255.252
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: ip address 10.40.9.1 255.255.255.252
netadmin@nms01:~$ grep -rl "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
netadmin@nms01:~$ grep -rn "10.40.9.1" /srv/configs
/srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg:8: ip address 10.40.9.1 255.255.255.252
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg:7: ip address 10.40.9.1 255.255.255.252</pre>
<p>Ek second mein pata chal gaya ki do alag routers ka same IP address hai, yaani duplicate-IP fault. <code>-l</code> sirf file names print karta hai, <code>-n</code> line numbers jodta hai, <code>-i</code> case ignore karta hai, <code>-c</code> har file mein matching lines ginta hai:</p>
<pre class="out">netadmin@nms01:~$ grep hostname /srv/configs/2026/q2/blr/BLR-EDGE-R2.cfg
hostname BLR-EDGE-R2
netadmin@nms01:~$ grep -c "^interface" /srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg
4
netadmin@nms01:~$ grep -ri "SHUTDOWN" /srv/configs
/srv/configs/2025/q4/blr/BLR-EDGE-R2.cfg: no shutdown
/srv/configs/2025/q4/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q1/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q2/chn/CHN-EDGE-R4.cfg: no shutdown
/srv/configs/2026/q3/pune/PUN-CORE-R1.cfg: no shutdown
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: shutdown
/srv/configs/2026/q3/tmp/work/hyd-edge-r3-final-v2.cfg: shutdown</pre>
<p>Pattern <code>^interface</code> mein <code>^</code> hai, jiska matlab "line ki shuruaat par", isliye sirf asli interface headers ginte hain, <code>no interface</code> jaisa text nahi. <code>-ri</code> search dikhati hai ki ek word doosre ke andar chhip sakta hai (<code>no shutdown</code> mein <code>shutdown</code> hai); poori line padho, sirf match nahi. Patterns aur options ke saath poora grep agle module ka dil hai.</p>
<p>Recursive search ko kuch files tak seemit karne ke liye <code>--include</code> use karo: <code>grep -r "10.40.9.1" /srv/configs/2026 --include=*.cfg</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Text dhoondhne ke liye <code>find -name</code>, ya file name dhoondhne ke liye <code>grep</code> use karna. (2) Case ka pata na ho to <code>-name</code>: <code>-iname</code> use karo. (3) Patterns ke aas-paas quotes bhoolna. (4) <code>/</code> se <code>grep -r</code> chalana: bahut der lagti hai aur woh files padhta hai jo nahi padhni chahiye. Sabse chhoti sahi directory se shuru karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find</code> = naam, type, size, age se. <code>grep</code> = content se. <code>find -name</code> case-sensitive hai aur <code>-iname</code> nahi; <code>grep -i</code> case-insensitive grep hai. <code>grep -l</code> file names list karta hai; <code>grep -c</code> ginta hai.</p></div>

<div class="scn"><h4>10.40.9.1 kisne dobara use kiya?</h4><p>Ticket NK-2231: Hyderabad router ka OSPF neighbour beech-beech mein toot raha tha. Backup tree mein <code>grep -rl "10.40.9.1" /srv/configs</code> chalaya to do files mili, dono us address ka daava kar rahi thi. Ek Hyderabad config thi, doosri Bengaluru router ka temporary link thi jisme note tha "ask Ravi". Duplicate IP se ARP confusion ho raha tha. Engineer ne dono files ticket mein lagayi aur Bengaluru ka address usi din badal diya gaya.</p><p><b>Lesson:</b> configs par content search woh seconds mein dhoondh deti hai jo routers mein login karke ghante bhar leta.</p></div>

<div class="iv"><p class="q">"Ticket kehta hai kahin ek IP address duplicate hai. Config backups se kaise dhoondhoge?"</p><p><code>grep -rn "10.40.9.1" /srv/configs</code> chalaunga, behtar hai sirf sabse naye backup folder par. Yeh har file aur line number print karta hai jisme woh address hai. Phir un files par <code>grep hostname</code> se hostnames check karunga. Samjhao ki <code>find</code> names ke liye hai, isliye yahan galat tool hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>find</code> names, types aur ages dhoondhta hai; <code>grep -r</code> files ke andar text.</li>
<li><code>-name</code> case-sensitive; <code>-iname</code> case ignore karta hai; pattern hamesha quote karo.</li>
<li><code>-type f</code>, <code>-type d</code> aur <code>-maxdepth</code> <code>find</code> ko narrow karte hain.</li>
<li><code>grep -rl</code> files list karta hai, <code>-n</code> line numbers, <code>-c</code> ginti, <code>-i</code> case ignore.</li>
<li>Search sabse chhoti directory se shuru karo, <code>/</code> se nahi.</li>
</ul></div>
`}};export{e as default};