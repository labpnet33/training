var e={id:`grep`,h:{en:`grep: find the lines that matter`,hi:`grep: kaam ki lines dhoondhna`},body:{en:`
<p><b>The idea of this chapter:</b> <code>grep</code> reads text and prints <b>only the lines that match</b> a pattern. Think of a highlighter pen that also throws away every line you did not highlight. It is the single most used tool in log analysis, and its name comes from an old editor command, "global regular expression print".</p>
<p>The shape is <code>grep  options  "pattern"  file</code>. Put the pattern in quotes so the shell does not touch it (see lx-shell chapter 6).</p>

<h3>The basics</h3>
<pre class="out">netadmin@nms01:~$ grep "CONFIG_I" /var/log/remote/routers.log
Sep 29 06:02:37 10.10.0.1 121: *Sep 29 06:02:37.809: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)
Sep 29 06:31:05 10.20.0.1 419: *Sep 29 06:31:05.005: %SYS-5-CONFIG_I: Configured from console by priya on vty0 (10.99.0.51)
Sep 29 06:48:59 10.10.0.1 124: *Sep 29 06:48:59.743: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)</pre>
<p>Three configuration changes this morning, and you can see who made each. A config-change audit is exactly what an auditor asks for. grep also sets an <b>exit status</b>: 0 if it found something, 1 if nothing matched. Scripts use this to decide what to do.</p>
<pre class="out">netadmin@nms01:~$ grep PANIC /var/log/remote/routers.log
netadmin@nms01:~$ echo $?
1</pre>

<h3>The options you use every day</h3>
<table class="cmp"><tr><th>Option</th><th>What it does</th><th>Example</th></tr>
<tr><td><code>-i</code></td><td>ignore upper/lower case</td><td><code>grep -i "login failed"</code></td></tr>
<tr><td><code>-v</code></td><td>invert: lines that do NOT match</td><td><code>grep -v LINEPROTO</code></td></tr>
<tr><td><code>-c</code></td><td>count matching lines (do not print them)</td><td><code>grep -c "state to down"</code></td></tr>
<tr><td><code>-n</code></td><td>show line numbers</td><td><code>grep -n OSPF</code></td></tr>
<tr><td><code>-o</code></td><td>print only the matching part</td><td><code>grep -o "by [a-z]* on"</code></td></tr>
<tr><td><code>-w</code></td><td>match whole words only</td><td><code>grep -w "10.40.3.1"</code></td></tr>
<tr><td><code>-E</code></td><td>extended regular expressions (OR, groups)</td><td><code>grep -E "OSPF|LOGIN"</code></td></tr>
<tr><td><code>-r</code> <code>-l</code></td><td>recursive; list file names only</td><td><code>grep -rl "x" dir</code></td></tr></table>
<pre class="out">netadmin@nms01:~$ grep -c LINEPROTO /var/log/remote/routers.log
22
netadmin@nms01:~$ grep -v LINEPROTO /var/log/remote/routers.log | wc -l
8
netadmin@nms01:~$ grep -ic ospf /var/log/remote/routers.log
2
netadmin@nms01:~$ grep -n "Interface GigabitEthernet0/1" /var/log/remote/routers.log
8:Sep 29 06:16:42 10.10.0.1 122: *Sep 29 06:16:42.074: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
9:Sep 29 06:16:51 10.10.0.1 123: *Sep 29 06:16:51.407: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
18:Sep 29 06:34:36 10.20.0.1 420: *Sep 29 06:34:36.812: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
19:Sep 29 06:34:45 10.20.0.1 421: *Sep 29 06:34:45.145: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</pre>
<p>22 interface messages and 8 of other kinds make 30, the whole file. <code>-c</code> and <code>-v</code> together give a quick sanity check. The line numbers from <code>-n</code> let you jump to exactly that line in <code>less</code> later.</p>

<h3>-o: pull out just the interesting part</h3>
<p>Often the whole line is more than you need. <code>-o</code> prints only what the pattern matched:</p>
<pre class="out">netadmin@nms01:~$ grep -o "by [a-z]* on" /var/log/remote/routers.log
by ravi on
by priya on
by ravi on
netadmin@nms01:~$ grep -oE "user: [a-z]+" /var/log/remote/routers.log
user: netops
user: admin
netadmin@nms01:~$ grep -oE "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" /var/log/remote/routers.log | sort -u
10.10.0.1
10.20.0.1
10.40.0.2
10.40.3.1
10.50.0.1
10.99.0.50
10.99.0.51
10.99.0.77</pre>
<p>The last command extracted every IPv4 address in the file, with duplicates removed by <code>sort -u</code> (chapter 6): the set of all devices and users mentioned in the log.</p>

<h3>Patterns: a tiny regular-expression kit</h3>
<p>A <b>regular expression</b> is a pattern language. You need only a few symbols:</p>
<table class="cmp"><tr><th>Symbol</th><th>Meaning</th></tr>
<tr><td><code>.</code></td><td>any one character</td></tr>
<tr><td><code>*</code></td><td>zero or more of the previous item</td></tr>
<tr><td><code>[0-9]</code> <code>[a-z]</code></td><td>one character from the set</td></tr>
<tr><td><code>^</code></td><td>start of the line</td></tr>
<tr><td><code>$</code></td><td>end of the line (put it last)</td></tr>
<tr><td><code>\\.</code></td><td>a real dot, not "any character"</td></tr>
<tr><td><code>a|b</code> (with -E)</td><td>a OR b</td></tr></table>
<pre class="out">netadmin@nms01:~$ grep "^Sep 29 06:5" /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down
netadmin@nms01:~$ grep "to down$" /var/log/remote/routers.log | wc -l
12
netadmin@nms01:~$ grep -E "state to (up|down)" /var/log/remote/routers.log | wc -l
23
netadmin@nms01:~$ grep -E "10.40.3.1|10.50.0.1" /var/log/remote/routers.log | wc -l
9</pre>
<p>The first command used <code>^</code> to select only entries from the 06:50 to 06:59 window, which is how you cut a log down to a time range, since the time is at the line start. The second used <code>$</code> to find lines <i>ending</i> in "to down" (12, which includes one <code>%LINK</code> line; see the next chapters on why this differs from 11). The third used a group and <code>|</code>.</p>
<p>A dot inside an IP address pattern means "any character", so <code>grep "10.40"</code> would also match <code>10x40</code>. Usually harmless, but the precise form is <code>grep "10\\.40\\.3\\.1"</code>. Both give 7 lines here.</p>

<h3>Excluding noise with a second grep</h3>
<p>Chain greps: the first keeps a family of lines, the second removes some of them.</p>
<pre class="out">netadmin@nms01:~$ grep "SEC_LOGIN" /var/log/remote/routers.log | grep -v SUCCESS
Sep 29 06:40:02 10.50.0.1 79: *Sep 29 06:40:02.874: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 10.99.0.77] [localport: 22] [Reason: Login Authentication Failed]</pre>
<p>That is a failed login on CHN-EDGE-R4 for user <code>admin</code> from 10.99.0.77. The pipe is explained in chapter 4.</p>
<p><b>Reference commands (not run in the simulator):</b> context options show lines around a match, and <code>-m</code> stops after N matches. The simulator prints only the matching line for the context options, but a real server prints the neighbours too.</p>
<pre class="code">grep -A2 "Dead timer" /var/log/remote/routers.log   # match plus 2 lines After
grep -B2 "Dead timer" /var/log/remote/routers.log   # plus 2 lines Before
grep -C2 "Dead timer" /var/log/remote/routers.log   # 2 lines of Context both sides
grep -m 5 "state to down" /var/log/remote/routers.log   # stop after 5 matches
zgrep "state to down" /var/log/syslog.2.gz          # search a compressed rotated log</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting quotes around a pattern with spaces: <code>grep state to down file</code> treats <code>to</code> and <code>down</code> as file names. (2) Case: <code>grep ospf</code> misses <code>OSPF</code>; use <code>-i</code>. (3) Using <code>-c</code> and believing it counts <i>matches</i>; it counts matching <i>lines</i>. (4) Reading <code>grep -v</code> wrongly: it keeps the lines that do not match. (5) Searching for <code>down</code> and catching <code>shutdown</code> or <code>Dead timer ... DOWN</code> too: make the pattern specific ("state to down") or use <code>-w</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>grep -c</code> counts lines; <code>-v</code> inverts; <code>-i</code> ignores case; <code>-n</code> adds line numbers; <code>-E</code> enables <code>|</code> alternation; <code>^</code> is the start and <code>$</code> the end of a line. <code>grep</code> returns 1 when there is no match.</p></div>

<div class="scn"><h4>Who changed the router?</h4><p>On Monday a core router in Pune stopped forwarding a route. The team asked: "Did anyone touch it overnight?" The engineer ran <code>grep "CONFIG_I" routers.log</code> and found two <code>Configured from console</code> lines on the Pune router, one by ravi at 06:02 and one at 06:48. A quick call to Ravi revealed a typo in his second change. The fix took five minutes, with no blame game, because the log held the facts.</p><p><b>Lesson:</b> <code>%SYS-5-CONFIG_I</code> messages are your change audit trail. Search for them first.</p></div>

<div class="iv"><p class="q">"What is the difference between grep -c and grep | wc -l, and what does grep -v do?"</p><p>Both count matching lines; <code>grep -c</code> does it in one step, while <code>grep | wc -l</code> shows the pipe idea and is handy when you chain more filters. <code>grep -v</code> inverts the match, printing lines that do not contain the pattern, which is the way to remove noise. Add that <code>grep -o</code> prints only the matching text, useful for extracting IPs or users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>grep "pattern" file</code> prints matching lines; quote the pattern.</li>
<li><code>-i</code> ignore case, <code>-v</code> invert, <code>-c</code> count, <code>-n</code> line numbers, <code>-o</code> only the match.</li>
<li><code>-E</code> allows <code>a|b</code>; <code>^</code> and <code>$</code> anchor to line start and end.</li>
<li>Chain greps to keep a family of lines and remove noise.</li>
<li>Exit status 0 means found, 1 means no match.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>grep</code> text padhta hai aur <b>sirf woh lines print karta hai jo pattern se match karti hain</b>. Socho ek highlighter pen jo har un-highlighted line ko phenk bhi deta hai. Log analysis mein yeh sabse zyada use hone wala tool hai, aur iska naam ek purane editor command, "global regular expression print", se aaya hai.</p>
<p>Shape hai <code>grep  options  "pattern"  file</code>. Pattern ko quotes mein rakho taaki shell use na chhue (lx-shell chapter 6 dekho).</p>

<h3>Basics</h3>
<pre class="out">netadmin@nms01:~$ grep "CONFIG_I" /var/log/remote/routers.log
Sep 29 06:02:37 10.10.0.1 121: *Sep 29 06:02:37.809: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)
Sep 29 06:31:05 10.20.0.1 419: *Sep 29 06:31:05.005: %SYS-5-CONFIG_I: Configured from console by priya on vty0 (10.99.0.51)
Sep 29 06:48:59 10.10.0.1 124: *Sep 29 06:48:59.743: %SYS-5-CONFIG_I: Configured from console by ravi on vty0 (10.99.0.50)</pre>
<p>Aaj subah teen configuration changes hue, aur dikhta hai har ek kisne kiya. Config-change audit bilkul wahi hai jo auditor poochta hai. grep ek <b>exit status</b> bhi set karta hai: kuch mila to 0, kuch match nahi hua to 1. Scripts ise decide karne ke liye use karti hain.</p>
<pre class="out">netadmin@nms01:~$ grep PANIC /var/log/remote/routers.log
netadmin@nms01:~$ echo $?
1</pre>

<h3>Roz use hone wale options</h3>
<table class="cmp"><tr><th>Option</th><th>Kya karta hai</th><th>Example</th></tr>
<tr><td><code>-i</code></td><td>upper/lower case ignore</td><td><code>grep -i "login failed"</code></td></tr>
<tr><td><code>-v</code></td><td>invert: jo lines match NAHI karti</td><td><code>grep -v LINEPROTO</code></td></tr>
<tr><td><code>-c</code></td><td>matching lines ginta hai (print nahi karta)</td><td><code>grep -c "state to down"</code></td></tr>
<tr><td><code>-n</code></td><td>line numbers dikhata hai</td><td><code>grep -n OSPF</code></td></tr>
<tr><td><code>-o</code></td><td>sirf matching hissa print karta hai</td><td><code>grep -o "by [a-z]* on"</code></td></tr>
<tr><td><code>-w</code></td><td>sirf poore words match karta hai</td><td><code>grep -w "10.40.3.1"</code></td></tr>
<tr><td><code>-E</code></td><td>extended regular expressions (OR, groups)</td><td><code>grep -E "OSPF|LOGIN"</code></td></tr>
<tr><td><code>-r</code> <code>-l</code></td><td>recursive; sirf file names list</td><td><code>grep -rl "x" dir</code></td></tr></table>
<pre class="out">netadmin@nms01:~$ grep -c LINEPROTO /var/log/remote/routers.log
22
netadmin@nms01:~$ grep -v LINEPROTO /var/log/remote/routers.log | wc -l
8
netadmin@nms01:~$ grep -ic ospf /var/log/remote/routers.log
2
netadmin@nms01:~$ grep -n "Interface GigabitEthernet0/1" /var/log/remote/routers.log
8:Sep 29 06:16:42 10.10.0.1 122: *Sep 29 06:16:42.074: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
9:Sep 29 06:16:51 10.10.0.1 123: *Sep 29 06:16:51.407: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up
18:Sep 29 06:34:36 10.20.0.1 420: *Sep 29 06:34:36.812: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down
19:Sep 29 06:34:45 10.20.0.1 421: *Sep 29 06:34:45.145: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up</pre>
<p>22 interface messages aur 8 doosri kism ke milakar 30 hote hain, poori file. <code>-c</code> aur <code>-v</code> saath mein quick sanity check dete hain. <code>-n</code> ke line numbers se aap baad mein <code>less</code> mein theek us line par ja sakte ho.</p>

<h3>-o: sirf dilchasp hissa nikalo</h3>
<p>Aksar poori line zaroorat se zyada hoti hai. <code>-o</code> sirf wahi print karta hai jo pattern se match hua:</p>
<pre class="out">netadmin@nms01:~$ grep -o "by [a-z]* on" /var/log/remote/routers.log
by ravi on
by priya on
by ravi on
netadmin@nms01:~$ grep -oE "user: [a-z]+" /var/log/remote/routers.log
user: netops
user: admin
netadmin@nms01:~$ grep -oE "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" /var/log/remote/routers.log | sort -u
10.10.0.1
10.20.0.1
10.40.0.2
10.40.3.1
10.50.0.1
10.99.0.50
10.99.0.51
10.99.0.77</pre>
<p>Aakhri command ne file ke har IPv4 address nikale, <code>sort -u</code> (chapter 6) se duplicates hatakar: log mein zikr kiye gaye saare devices aur users ka set.</p>

<h3>Patterns: chhota regular-expression kit</h3>
<p><b>Regular expression</b> ek pattern language hai. Aapko sirf kuch symbols chahiye:</p>
<table class="cmp"><tr><th>Symbol</th><th>Matlab</th></tr>
<tr><td><code>.</code></td><td>koi bhi ek character</td></tr>
<tr><td><code>*</code></td><td>pichhli cheez zero ya zyada baar</td></tr>
<tr><td><code>[0-9]</code> <code>[a-z]</code></td><td>set mein se ek character</td></tr>
<tr><td><code>^</code></td><td>line ki shuruaat</td></tr>
<tr><td><code>$</code></td><td>line ka end (aakhir mein likho)</td></tr>
<tr><td><code>\\.</code></td><td>asli dot, "koi bhi character" nahi</td></tr>
<tr><td><code>a|b</code> (-E ke saath)</td><td>a YA b</td></tr></table>
<pre class="out">netadmin@nms01:~$ grep "^Sep 29 06:5" /var/log/remote/routers.log
Sep 29 06:52:30 10.20.0.1 426: *Sep 29 06:52:30.550: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to down
Sep 29 06:52:39 10.20.0.1 427: *Sep 29 06:52:39.883: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/2, changed state to up
Sep 29 06:53:29 10.40.3.1 40: *Sep 29 06:53:29.733: %LINK-3-UPDOWN: Interface GigabitEthernet0/3, changed state to down
netadmin@nms01:~$ grep "to down$" /var/log/remote/routers.log | wc -l
12
netadmin@nms01:~$ grep -E "state to (up|down)" /var/log/remote/routers.log | wc -l
23
netadmin@nms01:~$ grep -E "10.40.3.1|10.50.0.1" /var/log/remote/routers.log | wc -l
9</pre>
<p>Pehle command ne <code>^</code> se sirf 06:50 se 06:59 ki entries chuni, yahi tareeka hai log ko time range tak kaatne ka, kyunki time line ki shuruaat mein hota hai. Doosre ne <code>$</code> se woh lines dhoondhi jo "to down" par <i>khatam</i> hoti hain (12, jisme ek <code>%LINK</code> line shamil hai; agle chapters mein dekho yeh 11 se kyun alag hai). Teesre ne group aur <code>|</code> use kiya.</p>
<p>IP address pattern ke andar dot ka matlab "koi bhi character" hai, isliye <code>grep "10.40"</code> <code>10x40</code> se bhi match karta. Aksar harmless, par precise form <code>grep "10\\.40\\.3\\.1"</code> hai. Yahan dono 7 lines dete hain.</p>

<h3>Doosre grep se noise hatao</h3>
<p>Greps ko chain karo: pehla lines ka ek family rakhta hai, doosra unmein se kuch hata deta hai.</p>
<pre class="out">netadmin@nms01:~$ grep "SEC_LOGIN" /var/log/remote/routers.log | grep -v SUCCESS
Sep 29 06:40:02 10.50.0.1 79: *Sep 29 06:40:02.874: %SEC_LOGIN-4-LOGIN_FAILED: Login failed [user: admin] [Source: 10.99.0.77] [localport: 22] [Reason: Login Authentication Failed]</pre>
<p>Yeh CHN-EDGE-R4 par user <code>admin</code> ka 10.99.0.77 se failed login hai. Pipe chapter 4 mein samjhaya hai.</p>
<p><b>Reference commands (simulator mein nahi chalte):</b> context options match ke aas-paas ki lines dikhate hain, aur <code>-m</code> N matches ke baad ruk jaata hai. Simulator context options mein sirf matching line print karta hai, par real server padosi lines bhi print karta hai.</p>
<pre class="code">grep -A2 "Dead timer" /var/log/remote/routers.log   # match aur uske baad 2 lines After
grep -B2 "Dead timer" /var/log/remote/routers.log   # aur pehle 2 lines Before
grep -C2 "Dead timer" /var/log/remote/routers.log   # dono taraf 2 lines Context
grep -m 5 "state to down" /var/log/remote/routers.log   # 5 matches ke baad ruko
zgrep "state to down" /var/log/syslog.2.gz          # compressed rotated log mein search</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Spaces wale pattern ke aas-paas quotes bhoolna: <code>grep state to down file</code> mein <code>to</code> aur <code>down</code> file names ban jaate hain. (2) Case: <code>grep ospf</code> <code>OSPF</code> miss karta hai; <code>-i</code> use karo. (3) <code>-c</code> ko <i>matches</i> ginta samajhna; yeh matching <i>lines</i> ginta hai. (4) <code>grep -v</code> galat padhna: yeh woh lines rakhta hai jo match nahi karti. (5) <code>down</code> search karke <code>shutdown</code> ya <code>Dead timer ... DOWN</code> bhi pakad lena: pattern specific rakho ("state to down") ya <code>-w</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>grep -c</code> lines ginta hai; <code>-v</code> invert karta hai; <code>-i</code> case ignore karta hai; <code>-n</code> line numbers jodta hai; <code>-E</code> <code>|</code> alternation enable karta hai; <code>^</code> line ki shuruaat aur <code>$</code> end hai. Match na ho to <code>grep</code> 1 return karta hai.</p></div>

<div class="scn"><h4>Router kisne badla?</h4><p>Monday ko Pune ka ek core router ek route forward karna band kar gaya. Team ne poochha: "Raat mein kisi ne chhua?" Engineer ne <code>grep "CONFIG_I" routers.log</code> chalaya aur Pune router par do <code>Configured from console</code> lines mili, ek ravi ki 06:02 par aur ek 06:48 par. Ravi ko call karne par uske doosre change mein typo nikla. Fix paanch minute mein hua, bina blame game ke, kyunki log ne facts rakhe the.</p><p><b>Lesson:</b> <code>%SYS-5-CONFIG_I</code> messages aapka change audit trail hain. Pehle unhe search karo.</p></div>

<div class="iv"><p class="q">"grep -c aur grep | wc -l mein kya difference hai, aur grep -v kya karta hai?"</p><p>Dono matching lines ginte hain; <code>grep -c</code> ek step mein karta hai, jabki <code>grep | wc -l</code> pipe idea dikhata hai aur jab aur filters chain karne hon tab kaam aata hai. <code>grep -v</code> match ko invert karta hai, woh lines print karta hai jinme pattern nahi hai, jo noise hatane ka tareeka hai. Jodo ki <code>grep -o</code> sirf matching text print karta hai, IPs ya users nikalne ke liye useful.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>grep "pattern" file</code> matching lines print karta hai; pattern quote karo.</li>
<li><code>-i</code> case ignore, <code>-v</code> invert, <code>-c</code> ginti, <code>-n</code> line numbers, <code>-o</code> sirf match.</li>
<li><code>-E</code> <code>a|b</code> allow karta hai; <code>^</code> aur <code>$</code> line ki shuruaat aur end se anchor karte hain.</li>
<li>Lines ka family rakhne aur noise hatane ke liye greps chain karo.</li>
<li>Exit status 0 matlab mila, 1 matlab match nahi.</li>
</ul></div>
`}};export{e as default};