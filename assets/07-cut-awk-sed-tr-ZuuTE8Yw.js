var e={id:`cut-awk-sed-tr`,h:{en:`cut, awk, sed and tr: pick, reshape and replace text`,hi:`cut, awk, sed aur tr: text chuno, badlo aur replace karo`},body:{en:`
<p><b>The idea of this chapter:</b> logs and CSV files are tables made of text. Four small tools cut them up: <code>cut</code> picks columns, <code>awk</code> picks columns <i>and</i> tests conditions, <code>sed</code> replaces text, and <code>tr</code> swaps single characters. Each one can sit in the middle of a pipe.</p>

<table class="cmp"><tr><th>Tool</th><th>Think of it as</th><th>Typical use</th></tr>
<tr><td><code>cut</code></td><td>scissors</td><td>take column 1 and 3 of a CSV</td></tr>
<tr><td><code>awk</code></td><td>column calculator</td><td>print field 4; only rows where a column matches</td></tr>
<tr><td><code>sed</code></td><td>find and replace</td><td>change a word; delete or print chosen lines</td></tr>
<tr><td><code>tr</code></td><td>character swapper</td><td>upper case; squeeze double spaces</td></tr></table>

<h3>cut: columns by separator</h3>
<p><code>-d,</code> sets the delimiter (the separator character) and <code>-f</code> chooses the fields:</p>
<pre class="out">netadmin@nms01:~$ cut -d, -f1 devices.csv
hostname
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
CHN-EDGE-R4
netadmin@nms01:~$ cut -d, -f1,3 devices.csv
hostname,site
PUN-CORE-R1,Pune
BLR-EDGE-R2,Bengaluru
HYD-EDGE-R3,Hyderabad
CHN-EDGE-R4,Chennai
netadmin@nms01:~$ tail -n +2 devices.csv | cut -d, -f2
10.10.0.1
10.20.0.1
10.40.3.1
10.50.0.1</pre>
<p><code>tail -n +2</code> means "start from line 2", which skips the header. Use <code>cut</code> when the separator is one clear character, like a comma.</p>

<h3>awk: fields split on spaces</h3>
<p>By default <code>awk</code> splits every line on <b>spaces</b> and names the pieces <code>$1</code>, <code>$2</code>, ... The whole line is <code>$0</code> and <code>NF</code> is the number of fields. Put the instruction inside single quotes so the shell leaves the dollar signs alone. <code>-F,</code> changes the separator to a comma.</p>
<pre class="out">netadmin@nms01:~$ awk -F, '{print $1}' devices.csv
hostname
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
CHN-EDGE-R4
netadmin@nms01:~$ awk -F, 'NR&gt;1 {print $1, $3}' devices.csv
PUN-CORE-R1 Pune
BLR-EDGE-R2 Bengaluru
HYD-EDGE-R3 Hyderabad
CHN-EDGE-R4 Chennai
netadmin@nms01:~$ awk -F, '$3=="Pune"' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ awk 'END {print NR}' devices.csv
5</pre>
<p>Read the pattern <code>NR&gt;1 {print $1, $3}</code> as "when the line number (NR) is greater than 1, do this". <code>$3=="Pune"</code> is a pattern with no action, so awk prints the matching lines. <code>END</code> runs after the last line, so <code>NR</code> is the line count. This is why awk beats cut on logs, where the gaps between fields are uneven. In the syslog file the router address is always field 4, so <code>awk '{print $4}'</code> works every time. In <code>auth.log</code> the address is near the end, so <code>awk '{print $(NF-3)}'</code> counts backwards from the last field.</p>

<h3>sed: replace and select lines</h3>
<pre class="out">netadmin@nms01:~$ sed 's/Pune/PUNE/' devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,PUNE
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ sed 's/,/;/g' devices.csv
hostname;ip;site
PUN-CORE-R1;10.10.0.1;Pune
BLR-EDGE-R2;10.20.0.1;Bengaluru
HYD-EDGE-R3;10.40.3.1;Hyderabad
CHN-EDGE-R4;10.50.0.1;Chennai
netadmin@nms01:~$ sed -n '2,3p' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
BLR-EDGE-R2,10.20.0.1,Bengaluru
netadmin@nms01:~$ sed '1d' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai</pre>
<p>The pattern is <code>s/old/new/</code>: substitute. Without <code>g</code> it replaces only the <b>first</b> match on each line; with <code>g</code> (global) it replaces all of them. <code>-n '2,3p'</code> prints only lines 2 to 3 (-n turns off the normal printing, <code>p</code> prints what you chose). <code>1d</code> deletes line 1. Nothing here changed the file; <code>sed</code> only prints the result. Save it with <code>&gt;</code> to a new file.</p>

<h3>tr: characters, from stdin only</h3>
<pre class="out">netadmin@nms01:~$ tr 'a-z' 'A-Z' &lt; devices.csv
HOSTNAME,IP,SITE
PUN-CORE-R1,10.10.0.1,PUNE
BLR-EDGE-R2,10.20.0.1,BENGALURU
HYD-EDGE-R3,10.40.3.1,HYDERABAD
CHN-EDGE-R4,10.50.0.1,CHENNAI
netadmin@nms01:~$ echo "a  b" | tr -s ' '
a b</pre>
<p><code>tr 'a-z' 'A-Z'</code> maps every lower-case letter to upper case. <code>-s</code> squeezes a repeated character into one, useful before <code>cut</code> when columns are padded with several spaces. <code>tr</code> never takes a file name, so use <code>&lt;</code> or a pipe.</p>

<p><b>Reference commands (not run in the simulator):</b> editing a file in place changes the original, so test without <code>-i</code> first and keep a backup.</p>
<pre class="code">sed -i.bak 's/Pune/PUNE/' devices.csv       # edit in place, keep devices.csv.bak
awk -F, '{sum += $2} END {print sum}' f.csv # add up a numeric column
awk '{print toupper($1)}' file              # awk has built-in functions
cut -c1-15 file                             # first 15 characters of each line</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Double quotes around an awk program: the shell expands <code>$1</code> itself and awk gets an empty value; always use single quotes. (2) Using <code>cut</code> on space-padded output: <code>cut -d' '</code> sees every space as a new field, so use <code>awk</code>. (3) Forgetting <code>g</code> in <code>sed</code>, so only the first match per line changes. (4) <code>sed -i</code> on a config with no backup.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cut -d, -f2</code> = second comma field. <code>awk '{print $2}'</code> = second space field. <code>sed 's/a/b/g'</code> = replace all. <code>tr</code> reads only stdin.</p></div>

<div class="scn"><h4>One column, one minute</h4><p>The security team wanted every source IP from a 20,000 line log. An engineer opened the file in an editor and started copying addresses. A colleague typed <code>awk '{print $(NF-3)}' auth.log | sort -u</code> and had the list in a few seconds.</p><p><b>Lesson:</b> let awk pick the field and let sort remove duplicates.</p></div>

<div class="iv"><p class="q">"When would you use awk instead of cut?"</p><p><code>cut</code> needs one exact single-character delimiter, so it suits CSV. <code>awk</code> splits on any run of spaces, can count fields from the end with <code>NF</code>, filter rows by a condition, and do arithmetic, so it suits logs and command output. Both read from a file or a pipe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cut -d, -f1,3</code> picks CSV columns; <code>tail -n +2</code> skips the header.</li>
<li><code>awk '{print $4}'</code> picks space-separated fields; <code>-F,</code> sets another separator; <code>NF</code> and <code>NR</code> count fields and lines.</li>
<li><code>sed 's/old/new/g'</code> replaces; <code>-n 'Np'</code> prints a line; <code>1d</code> deletes one.</li>
<li><code>tr</code> swaps characters from stdin; <code>-s</code> squeezes repeats.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> logs aur CSV files text se bani tables hain. Chaar chhote tools unhe kaatte hain: <code>cut</code> columns chunta hai, <code>awk</code> columns chunta hai <i>aur</i> conditions bhi check karta hai, <code>sed</code> text replace karta hai, aur <code>tr</code> single characters badalta hai. Har ek pipe ke beech mein baith sakta hai.</p>

<table class="cmp"><tr><th>Tool</th><th>Isse aise socho</th><th>Aam use</th></tr>
<tr><td><code>cut</code></td><td>kainchi</td><td>CSV ka column 1 aur 3 lena</td></tr>
<tr><td><code>awk</code></td><td>column calculator</td><td>field 4 print karna; sirf matching rows</td></tr>
<tr><td><code>sed</code></td><td>find and replace</td><td>word badalna; chuni lines delete ya print karna</td></tr>
<tr><td><code>tr</code></td><td>character badalne wala</td><td>upper case; double spaces ek karna</td></tr></table>

<h3>cut: separator se columns</h3>
<p><code>-d,</code> delimiter (separator character) set karta hai aur <code>-f</code> fields chunta hai:</p>
<pre class="out">netadmin@nms01:~$ cut -d, -f1 devices.csv
hostname
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
CHN-EDGE-R4
netadmin@nms01:~$ cut -d, -f1,3 devices.csv
hostname,site
PUN-CORE-R1,Pune
BLR-EDGE-R2,Bengaluru
HYD-EDGE-R3,Hyderabad
CHN-EDGE-R4,Chennai
netadmin@nms01:~$ tail -n +2 devices.csv | cut -d, -f2
10.10.0.1
10.20.0.1
10.40.3.1
10.50.0.1</pre>
<p><code>tail -n +2</code> ka matlab "line 2 se shuru karo", yaani header skip. <code>cut</code> tab use karo jab separator ek saaf character ho, jaise comma.</p>

<h3>awk: spaces par fields</h3>
<p>Default mein <code>awk</code> har line ko <b>spaces</b> par todta hai aur tukdon ko <code>$1</code>, <code>$2</code>, ... naam deta hai. Poori line <code>$0</code> hai aur <code>NF</code> fields ki sankhya. Instruction single quotes ke andar rakho taaki shell dollar signs ko na chhede. <code>-F,</code> separator ko comma kar deta hai.</p>
<pre class="out">netadmin@nms01:~$ awk -F, '{print $1}' devices.csv
hostname
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
CHN-EDGE-R4
netadmin@nms01:~$ awk -F, 'NR&gt;1 {print $1, $3}' devices.csv
PUN-CORE-R1 Pune
BLR-EDGE-R2 Bengaluru
HYD-EDGE-R3 Hyderabad
CHN-EDGE-R4 Chennai
netadmin@nms01:~$ awk -F, '$3=="Pune"' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
netadmin@nms01:~$ awk 'END {print NR}' devices.csv
5</pre>
<p><code>NR&gt;1 {print $1, $3}</code> ko aise padho: "jab line number (NR) 1 se bada ho, yeh karo". <code>$3=="Pune"</code> action ke bina pattern hai, isliye awk matching lines print karta hai. <code>END</code> aakhri line ke baad chalta hai, isliye <code>NR</code> line count hai. Isiliye logs par awk, cut se behtar hai, jahan fields ke beech ke gap barabar nahi hote. Syslog file mein router address hamesha field 4 hai, isliye <code>awk '{print $4}'</code> har baar chalta hai. <code>auth.log</code> mein address end ke paas hai, isliye <code>awk '{print $(NF-3)}'</code> aakhri field se ulta ginta hai.</p>

<h3>sed: replace aur lines chunna</h3>
<pre class="out">netadmin@nms01:~$ sed 's/Pune/PUNE/' devices.csv
hostname,ip,site
PUN-CORE-R1,10.10.0.1,PUNE
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai
netadmin@nms01:~$ sed 's/,/;/g' devices.csv
hostname;ip;site
PUN-CORE-R1;10.10.0.1;Pune
BLR-EDGE-R2;10.20.0.1;Bengaluru
HYD-EDGE-R3;10.40.3.1;Hyderabad
CHN-EDGE-R4;10.50.0.1;Chennai
netadmin@nms01:~$ sed -n '2,3p' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
BLR-EDGE-R2,10.20.0.1,Bengaluru
netadmin@nms01:~$ sed '1d' devices.csv
PUN-CORE-R1,10.10.0.1,Pune
BLR-EDGE-R2,10.20.0.1,Bengaluru
HYD-EDGE-R3,10.40.3.1,Hyderabad
CHN-EDGE-R4,10.50.0.1,Chennai</pre>
<p>Pattern <code>s/old/new/</code> hai: substitute. <code>g</code> ke bina har line mein sirf <b>pehla</b> match badalta hai; <code>g</code> (global) ke saath sab. <code>-n '2,3p'</code> sirf line 2 se 3 print karta hai (-n normal printing band karta hai, <code>p</code> chuni hui lines print karta hai). <code>1d</code> line 1 delete karta hai. Yahan file nahi badli; <code>sed</code> sirf result print karta hai. Use <code>&gt;</code> se naye file mein save karo.</p>

<h3>tr: characters, sirf stdin se</h3>
<pre class="out">netadmin@nms01:~$ tr 'a-z' 'A-Z' &lt; devices.csv
HOSTNAME,IP,SITE
PUN-CORE-R1,10.10.0.1,PUNE
BLR-EDGE-R2,10.20.0.1,BENGALURU
HYD-EDGE-R3,10.40.3.1,HYDERABAD
CHN-EDGE-R4,10.50.0.1,CHENNAI
netadmin@nms01:~$ echo "a  b" | tr -s ' '
a b</pre>
<p><code>tr 'a-z' 'A-Z'</code> har lower-case letter ko upper case mein badalta hai. <code>-s</code> repeat hue character ko ek kar deta hai, <code>cut</code> se pehle kaam aata hai jab columns kai spaces se padded hon. <code>tr</code> file name kabhi nahi leta, isliye <code>&lt;</code> ya pipe use karo.</p>

<p><b>Reference commands (simulator mein nahi chalte):</b> file ko in place edit karne se original badal jaata hai, isliye pehle <code>-i</code> ke bina test karo aur backup rakho.</p>
<pre class="code">sed -i.bak 's/Pune/PUNE/' devices.csv       # in place edit, devices.csv.bak rakho
awk -F, '{sum += $2} END {print sum}' f.csv # numeric column ka jod
awk '{print toupper($1)}' file              # awk mein built-in functions hain
cut -c1-15 file                             # har line ke pehle 15 characters</pre>

<div class="warn"><p><b>Aam galtiyan.</b> (1) awk program ke aaspaas double quotes: shell khud <code>$1</code> expand kar deta hai aur awk ko khaali value milti hai; hamesha single quotes. (2) Space se padded output par <code>cut</code>: <code>cut -d' '</code> har space ko naya field maanta hai, isliye <code>awk</code> use karo. (3) <code>sed</code> mein <code>g</code> bhoolna, to har line mein sirf pehla match badalta hai. (4) Backup ke bina config par <code>sed -i</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cut -d, -f2</code> = doosra comma field. <code>awk '{print $2}'</code> = doosra space field. <code>sed 's/a/b/g'</code> = sab replace. <code>tr</code> sirf stdin padhta hai.</p></div>

<div class="scn"><h4>Ek column, ek minute</h4><p>Security team ko 20,000 line ke log se har source IP chahiye tha. Ek engineer ne file editor mein kholkar addresses copy karne shuru kiye. Ek colleague ne <code>awk '{print $(NF-3)}' auth.log | sort -u</code> type kiya aur kuch seconds mein list mil gayi.</p><p><b>Lesson:</b> field awk chune, duplicates sort hataye.</p></div>

<div class="iv"><p class="q">"cut ki jagah awk kab use karoge?"</p><p><code>cut</code> ko ek exact single-character delimiter chahiye, isliye CSV ke liye theek hai. <code>awk</code> spaces ke kisi bhi run par todta hai, <code>NF</code> se aakhir se fields ginta hai, condition se rows filter karta hai aur arithmetic bhi karta hai, isliye logs aur command output ke liye theek hai. Dono file ya pipe se padhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>cut -d, -f1,3</code> CSV columns chunta hai; <code>tail -n +2</code> header skip karta hai.</li>
<li><code>awk '{print $4}'</code> space-separated fields chunta hai; <code>-F,</code> doosra separator; <code>NF</code> aur <code>NR</code> fields aur lines ginte hain.</li>
<li><code>sed 's/old/new/g'</code> replace karta hai; <code>-n 'Np'</code> ek line print; <code>1d</code> ek line delete.</li>
<li><code>tr</code> stdin se characters badalta hai; <code>-s</code> repeats ko ek karta hai.</li>
</ul></div>
`}};export{e as default};