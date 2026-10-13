var e={id:`viewing-files`,h:{en:`Viewing text: cat, head, tail, less, wc, nl`,hi:`Text dekhna: cat, head, tail, less, wc, nl`},body:{en:`
<p><b>The idea of this chapter:</b> before you search a log you must be able to <b>look at it</b> in the right way. A log is long, and what you need is usually at one end: the first lines show the format, the last lines show what happened most recently. Think of a diary: you flip to the first page to learn the style, and to the last page to see today.</p>

<h3>head and tail: the two ends of a file</h3>
<p><code>head</code> prints the <b>first</b> lines (10 by default) and <code>tail</code> the <b>last</b> lines. The option <code>-n</code> sets how many.</p>
<pre class="out">netadmin@nms01:~$ head -n 2 devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ tail -n 1 devices.csv
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ tail -n 3 /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down</pre>
<p>Two more forms are very useful. A plus sign in <code>tail</code> means <i>start from this line</i>, so <code>tail -n +2</code> skips a header row. A minus in <code>head</code> means <i>all except the last N</i>.</p>
<pre class="out">netadmin@nms01:~$ tail -n +3 devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ head -n -2 devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune</pre>
<p><b>Following a log live.</b> <code>tail -f</code> keeps the file open and prints new lines as they arrive. It is the standard way to watch a syslog while you reproduce a problem, for example while you shut and unshut a router port. Press Ctrl+C to stop. The simulator logs are fixed files, so this is a reference command for a real server:</p>
<pre class="code">tail -f /var/log/syslog          # watch new lines until Ctrl+C
sudo tail -f /var/log/auth.log   # some logs need sudo (module lx-users)</pre>

<h3>cat, tac, nl: whole file, reversed, numbered</h3>
<pre class="out">netadmin@nms01:~$ cat -n devices.csv
     1	hostname,ip,site
     2	PUN-CORE-R1,10.10.0.1,Pune
     3	BLR-EDGE-R2,10.20.0.1,Bengaluru
     4	HYD-EDGE-R3,10.40.3.1,Hyderabad
     5	CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ tac devices.csv
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
BLR-EDGE-R2,10.20.0.1,Bengaluru
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site</pre>
<p><code>cat -n</code> (and <code>nl</code>) number the lines, which helps when a colleague says "look at line 17". <code>tac</code> is <code>cat</code> backwards: the newest entry of a log that grows downwards comes first.</p>

<h3>less: read at your own pace</h3>
<p>For a file too long for one screen, <code>less /var/log/remote/routers.log</code> shows one page at a time. Space = next page, <code>b</code> = back, <code>/OSPF</code> = search for OSPF, <code>n</code> = next match, <code>G</code> = end, <code>q</code> = quit. The simulator prints the whole file instead, because it has no screen paging; on a real server, <code>less</code> is interactive.</p>

<h3>wc: count lines, words and bytes</h3>
<p><code>wc</code> means <i>word count</i>. Its most-used option is <code>-l</code> for lines, and a log line is an event, so <b>counting lines is counting events</b>.</p>
<pre class="out">netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log
netadmin@nms01:~$ wc -w devices.csv
5 devices.csv
netadmin@nms01:~$ wc -c devices.csv
138 devices.csv
netadmin@nms01:~$ wc -l /var/log/remote/routers.log devices.csv
30 /var/log/remote/routers.log
5 devices.csv
35 total</pre>
<p>The option <code>-w</code> counts words (a word is anything between spaces; here every row has no space, so five rows are five words) and <code>-c</code> counts bytes. Note that <code>wc -l</code> counts <i>newline characters</i>, so a file whose last line has no newline at the end is counted one line short.</p>

<h3>Combining two tools: a first taste of the pipe</h3>
<p>Want lines 4 and 5 of the log? Take the first five lines with <code>head</code>, then the last two of those with <code>tail</code>. The vertical bar <code>|</code> hands the output of the first command to the second. Chapter 4 explains this properly; here it is only a peek.</p>
<pre class="out">netadmin@nms01:~$ head -n 5 /var/log/remote/routers.log | tail -n 2
Sep 29 06:07:54 10.40.3.1 34: *Sep 29 06:07:54.538: %OSPF-5-ADJCHG: Process 1, Nbr 10.40.0.2 on GigabitEthernet0/1 from FULL to DOWN, Neighbor Down: Dead timer expired
Sep 29 06:11:25 10.20.0.1 413: *Sep 29 06:11:25.345: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down</pre>
<p>Line 4 is an OSPF neighbour loss on HYD-EDGE-R3 (a dead timer expired), and line 5 is another flap on Bengaluru Gi0/2. You found them without scrolling.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>cat</code> on a multi-gigabyte log. Use <code>tail</code>, <code>less</code> or <code>grep</code>. (2) Reading only the top of a log when the problem is recent: the interesting lines are at the end. (3) Confusing <code>head -n 5</code> (the first five lines) with <code>head -5</code>; both work on GNU systems, but be consistent. (4) Forgetting that logs <b>rotate</b>: yesterday's lines may be in <code>syslog.1</code> or a compressed <code>syslog.2.gz</code>, not in <code>syslog</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>head</code> and <code>tail</code> default to <b>10</b> lines. <code>tail -f</code> follows a file; <code>tail -n +2</code> starts at line 2 (it does not mean "last 2"). <code>wc -l</code> counts lines, <code>-w</code> words, <code>-c</code> bytes.</p></div>

<div class="scn"><h4>Watching the log while you test</h4><p>A branch complained that a link flapped when the cable was touched. The engineer opened a second terminal on the syslog server and ran <code>tail -f</code> on the router log. She asked the branch to wiggle the cable once. Instantly a <code>changed state to down</code> line and a line protocol <code>up</code> line appeared. The cause was confirmed in ten seconds, with an exact timestamp, and the cable was replaced.</p><p><b>Lesson:</b> <code>tail -f</code> lets you watch cause and effect while you test.</p></div>

<div class="iv"><p class="q">"How do you check the most recent events in a log, and watch new ones as they arrive?"</p><p>Use <code>tail -n 50</code> to see the last 50 lines, and <code>tail -f</code> to follow the file live until Ctrl+C. For old events I use <code>less</code> and search with a slash. I also remember that logs rotate, so I may need the older <code>.1</code> or <code>.gz</code> file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>head</code> shows the first lines, <code>tail</code> the last; both default to 10; <code>-n</code> sets the count.</li>
<li><code>tail -n +2</code> skips a header; <code>tail -f</code> follows a growing log.</li>
<li><code>cat -n</code> or <code>nl</code> numbers lines; <code>tac</code> reverses them.</li>
<li><code>wc -l</code> counts lines, which in a log means events.</li>
<li>Use <code>less</code>, not <code>cat</code>, for big files; remember log rotation.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> log search karne se pehle use sahi tareeke se <b>dekhna</b> aana chahiye. Log lamba hota hai, aur jo chahiye woh aksar ek end par hota hai: pehli lines format dikhati hain, aakhri lines dikhati hain abhi sabse recent kya hua. Diary socho: style samajhne ke liye pehla page, aaj dekhne ke liye aakhri page.</p>

<h3>head aur tail: file ke do sire</h3>
<p><code>head</code> <b>pehli</b> lines print karta hai (default 10) aur <code>tail</code> <b>aakhri</b> lines. Option <code>-n</code> count set karta hai.</p>
<pre class="out">netadmin@nms01:~$ head -n 2 devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ tail -n 1 devices.csv
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ tail -n 3 /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down</pre>
<p>Do aur forms bahut kaam ke hain. <code>tail</code> mein plus sign ka matlab <i>is line se shuru karo</i>, isliye <code>tail -n +2</code> header row skip karta hai. <code>head</code> mein minus ka matlab <i>aakhri N ko chhodkar baaki sab</i>.</p>
<pre class="out">netadmin@nms01:~$ tail -n +3 devices.csv
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ head -n -2 devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,Pune</pre>
<p><b>Log ko live follow karna.</b> <code>tail -f</code> file ko khula rakhta hai aur nayi lines aate hi print karta hai. Problem reproduce karte waqt syslog dekhne ka standard tareeka hai, jaise router port shut aur unshut karte waqt. Rokne ke liye Ctrl+C. Simulator ke logs fixed files hain, isliye yeh real server ke liye reference command hai:</p>
<pre class="code">tail -f /var/log/syslog          # Ctrl+C tak nayi lines dekho
sudo tail -f /var/log/auth.log   # kuch logs ke liye sudo chahiye (module lx-users)</pre>

<h3>cat, tac, nl: poori file, ulti, numbered</h3>
<pre class="out">netadmin@nms01:~$ cat -n devices.csv
     1	hostname,ip,site
     2	PUN-CORE-R1,10.10.0.1,Pune
     3	BLR-EDGE-R2,10.20.0.1,Bengaluru
     4	HYD-EDGE-R3,10.40.3.1,Hyderabad
     5	CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ tac devices.csv
CHN-EDGE-R4,10.50.0.1,Chennai
HYD-EDGE-R3,10.40.3.1,Hyderabad
BLR-EDGE-R2,10.20.0.1,Bengaluru
PUN-CORE-R1,10.10.0.1,Pune
hostname,ip,site</pre>
<p><code>cat -n</code> (aur <code>nl</code>) lines ko number karte hain, jo tab kaam aata hai jab colleague kahe "line 17 dekho". <code>tac</code> ulta <code>cat</code> hai: neeche ki taraf badhne wale log ki sabse nayi entry pehle aati hai.</p>

<h3>less: apni raftaar se padho</h3>
<p>Ek screen se lambi file ke liye <code>less /var/log/remote/routers.log</code> ek baar mein ek page dikhata hai. Space = agla page, <code>b</code> = peeche, <code>/OSPF</code> = OSPF search, <code>n</code> = agla match, <code>G</code> = end, <code>q</code> = quit. Simulator poori file print kar deta hai kyunki usme screen paging nahi hai; real server par <code>less</code> interactive hota hai.</p>

<h3>wc: lines, words aur bytes ginna</h3>
<p><code>wc</code> ka matlab <i>word count</i>. Sabse zyada use hone wala option <code>-l</code> hai (lines), aur log line ek event hai, isliye <b>lines ginna matlab events ginna</b>.</p>
<pre class="out">netadmin@nms01:~$ wc -l /var/log/remote/routers.log
30 /var/log/remote/routers.log
netadmin@nms01:~$ wc -w devices.csv
5 devices.csv
netadmin@nms01:~$ wc -c devices.csv
138 devices.csv
netadmin@nms01:~$ wc -l /var/log/remote/routers.log devices.csv
30 /var/log/remote/routers.log
5 devices.csv
35 total</pre>
<p>Option <code>-w</code> words ginta hai (word space ke beech ki cheez hai; yahan har row mein space nahi, isliye paanch rows paanch words hain) aur <code>-c</code> bytes. Dhyan rakho ki <code>wc -l</code> <i>newline characters</i> ginta hai, isliye jis file ki aakhri line ke end mein newline na ho woh ek line kam ginti hai.</p>

<h3>Do tools jodna: pipe ka pehla swaad</h3>
<p>Log ki line 4 aur 5 chahiye? <code>head</code> se pehli paanch lines lo, phir unmein se <code>tail</code> se aakhri do. Vertical bar <code>|</code> pehle command ka output doosre ko deta hai. Chapter 4 ise sahi se samjhata hai; yahan sirf jhalak hai.</p>
<pre class="out">netadmin@nms01:~$ head -n 5 /var/log/remote/routers.log | tail -n 2
Sep 29 06:07:54 10.40.3.1 34: *Sep 29 06:07:54.538: %OSPF-5-ADJCHG: Process 1, Nbr 10.40.0.2 on GigabitEthernet0/1 from FULL to DOWN, Neighbor Down: Dead timer expired
Sep 29 06:11:25 10.20.0.1 413: *Sep 29 06:11:25.345: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down</pre>
<p>Line 4 HYD-EDGE-R3 par OSPF neighbour loss hai (dead timer expire hua), aur line 5 Bengaluru Gi0/2 ka ek aur flap hai. Aapne unhe scroll kiye bina dhoondh liya.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Multi-gigabyte log par <code>cat</code>. <code>tail</code>, <code>less</code> ya <code>grep</code> use karo. (2) Sirf log ka top padhna jabki problem recent hai: dilchasp lines end mein hoti hain. (3) <code>head -n 5</code> (pehli paanch lines) ko <code>head -5</code> se confuse karna; GNU systems par dono chalte hain, par ek hi style rakho. (4) Yeh bhoolna ki logs <b>rotate</b> hote hain: kal ki lines <code>syslog.1</code> ya compressed <code>syslog.2.gz</code> mein ho sakti hain, <code>syslog</code> mein nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>head</code> aur <code>tail</code> default mein <b>10</b> lines dete hain. <code>tail -f</code> file follow karta hai; <code>tail -n +2</code> line 2 se shuru karta hai ("aakhri 2" nahi). <code>wc -l</code> lines, <code>-w</code> words, <code>-c</code> bytes ginta hai.</p></div>

<div class="scn"><h4>Test karte waqt log dekhna</h4><p>Ek branch ne shikayat ki ki cable chhone par link flap hota hai. Engineer ne syslog server par doosra terminal khola aur router log par <code>tail -f</code> chalaya. Usne branch se cable ek baar hilane ko kaha. Turant ek <code>changed state to down</code> line aur ek line protocol <code>up</code> line aa gayi. Wajah das second mein exact timestamp ke saath confirm ho gayi, aur cable badal di gayi.</p><p><b>Lesson:</b> <code>tail -f</code> test karte waqt cause aur effect live dekhne deta hai.</p></div>

<div class="iv"><p class="q">"Log ke sabse recent events kaise check karte ho, aur nayi events aate hi kaise dekhte ho?"</p><p>Aakhri 50 lines ke liye <code>tail -n 50</code>, aur file ko live follow karne ke liye <code>tail -f</code> jab tak Ctrl+C. Purane events ke liye <code>less</code> aur slash se search. Yeh bhi yaad rakhta hoon ki logs rotate hote hain, isliye purani <code>.1</code> ya <code>.gz</code> file chahiye ho sakti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>head</code> pehli lines, <code>tail</code> aakhri; dono default 10; <code>-n</code> count set karta hai.</li>
<li><code>tail -n +2</code> header skip karta hai; <code>tail -f</code> badhte log ko follow karta hai.</li>
<li><code>cat -n</code> ya <code>nl</code> lines number karte hain; <code>tac</code> ulta karta hai.</li>
<li><code>wc -l</code> lines ginta hai, jo log mein events hain.</li>
<li>Badi files ke liye <code>cat</code> nahi, <code>less</code>; log rotation yaad rakho.</li>
</ul></div>
`}};export{e as default};