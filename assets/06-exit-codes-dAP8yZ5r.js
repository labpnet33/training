var e={id:`exit-codes`,h:{en:`Exit codes, && and ||, and a reusable function`,hi:`Exit codes, && aur ||, aur reusable function`},body:{en:`
<p><b>The idea of this chapter:</b> every command, when it finishes, leaves behind a small number: its <b>exit code</b>. Zero means "it worked". Anything else means "it did not". Scripts use these numbers to decide, to chain commands, and to tell cron or monitoring whether the whole job succeeded.</p>

<h3>Analogy: the receipt stamp</h3>
<p>Think of a courier who stamps every parcel: green for delivered, red with a reason number for failed. You do not read the courier's long story; you look at the stamp. The exit code is that stamp. The text a command prints is for people; the exit code is for machines.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Exit codes after a command">
<rect x="20" y="50" width="190" height="60" rx="10" fill="#bae6fd"/><text x="115" y="86" text-anchor="middle" class="svg-ink" font-size="13">any command runs</text>
<line x1="210" y1="80" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="210" y1="80" x2="270" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="355" y="50" text-anchor="middle" class="svg-ink" font-size="13">exit code 0 = OK</text>
<rect x="270" y="95" width="170" height="50" rx="10" fill="#fed7aa"/><text x="355" y="125" text-anchor="middle" class="svg-ink" font-size="13">1, 2, 3 ... = problem</text>
<rect x="470" y="50" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="78" text-anchor="middle" class="svg-ink" font-size="13">$? holds it</text><text x="545" y="98" text-anchor="middle" class="svg-muted" font-size="12">until next command</text>
<line x1="440" y1="45" x2="470" y2="75" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="470" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The exit code of the last command is stored in the variable $?.</p></div>

<h3>Seeing exit codes</h3>
<p>Run a command, then print <code>$?</code> straight away, because the next command overwrites it. Real lab output:</p>
<pre class="out">AUTO01$ ping -c 1 10.99.0.1 &gt; /dev/null 2&gt;&amp;1; echo "ping exit code: $?"
ping exit code: <span class="hl">0</span>
AUTO01$ ping -c 1 10.99.0.3 &gt; /dev/null 2&gt;&amp;1; echo "ping exit code: $?"
ping exit code: <span class="hl">1</span></pre>
<p>10.99.0.1 answers, so ping exits 0. 10.99.0.3 (HYD-EDGE-R3, shut down in the lab) does not, so ping exits 1. The semicolon <code>;</code> simply means "then run the next command".</p>

<h3>Chaining with && and ||</h3>
<ul>
<li><code>A &amp;&amp; B</code> runs B only if A succeeded (exit code 0). Read it as "A, and then B".</li>
<li><code>A || B</code> runs B only if A failed. Read it as "A, or else B".</li>
</ul>
<pre class="out">AUTO01$ ping -c 1 10.99.0.1 &gt; /dev/null 2&gt;&amp;1 &amp;&amp; echo "R1 ok"
R1 ok
AUTO01$ ping -c 1 10.99.0.3 &gt; /dev/null 2&gt;&amp;1 || echo "R3 failed"
R3 failed</pre>
<p>These one-liners are how engineers write quick alerts: <code>./checknet.sh || echo "something is down"</code>.</p>

<h3>Giving your own script an exit code</h3>
<p>The reachability script <code>checknet.sh</code> from the lab ends with a test: if the counter <code>down</code> is greater than zero, <code>exit 1</code>. If the script reaches its last line without calling <code>exit</code>, its exit code is that of the last command it ran. This is the tail of the script, as shown by <code>nl checknet.sh | tail -n 16</code> (line 4 only sets the list file to a default name):</p>
<pre class="out">AUTO01$ nl checknet.sh | tail -n 16
     5	up=0
     6	down=0
     7	while read -r name ip; do
     8	  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
     9	    echo "$name $ip UP"
    10	    up=$((up+1))
    11	  else
    12	    echo "$name $ip DOWN"
    13	    down=$((down+1))
    14	  fi
    15	done &lt; "$file"
    16	echo "UP: $up DOWN: $down"
    17	# exit code 1 when anything is down, so cron or another script can react
    18	if [ "$down" -gt 0 ]; then
    19	  exit 1
    20	fi</pre>
<p>Now the script's two audiences each get what they need:</p>
<pre class="out">AUTO01$ ./checknet.sh branch.txt || echo "something is down"
BLR-EDGE-R2 10.99.0.2 UP
BLR-SW-01 10.99.0.12 DOWN
BLR-AP-01 10.99.0.13 DOWN
UP: 1 DOWN: 2
<span class="hl">something is down</span>
AUTO01$ ./checknet.sh &gt; /dev/null; echo "checknet exit code: $?"
checknet exit code: <span class="hl">1</span></pre>
<p>A person reads the DOWN lines. Cron, a monitoring tool or another script only needs the number 1.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> A function packages a few lines under a name so you can call them repeatedly, and <code>return</code> hands back an exit code from the function. The lab shell does not run functions, but real Bash 5 does:</p>
<pre class="code">check_host() {
  local ip="$1"
  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
    echo "$ip UP"
    return 0
  else
    echo "$ip DOWN"
    return 1
  fi
}
check_host 10.99.0.1 || echo "R1 needs attention"</pre>
<p><code>local</code> keeps the variable inside the function so it cannot clash with others. The function name is used like a command and its <code>return</code> value is read with <code>$?</code> or tested with <code>if</code> and <code>||</code>.</p></div>

<div class="eg"><p><b>Worked example.</b> Cron runs <code>checknet.sh</code> every 15 minutes. A small wrapper does <code>./checknet.sh || echo "ALERT: devices down" &gt;&gt; alerts.log</code>. When all devices answer, nothing is added. When any is down, one line is appended. No human reads output for hours; the exit code carries the decision.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Printing <code>$?</code> after another command has run (the value is already overwritten). Treating non-zero as always "bad": some tools, like <code>grep</code>, return 1 for "no match", which is information, not a crash. Ending a script with a harmless command such as <code>echo "done"</code> after a failure, so the script as a whole returns 0 even though a step failed. Forgetting to return a failure code at all, so cron thinks every run succeeded.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exit code <b>0</b> is success; the shell's logic is the opposite of many languages where 0 is false. <code>&amp;&amp;</code> runs the next command on success, <code>||</code> on failure. <code>$?</code> holds only the <i>last</i> command's code.</p></div>

<div class="scn"><h4>The backup that always said OK</h4><p>A nightly script copied configs and ended with <code>echo "backup finished"</code>. One router was down for a week, the copy command failed every night, but the script's last command, the echo, always succeeded. The scheduler showed a green tick for seven days. After the team added <code>exit 1</code> when any copy failed, the next night produced a red alert on the first failure.</p><p><b>Lesson:</b> a script must report its own failure with a non-zero exit code.</p></div>

<div class="iv"><p class="q">"What does exit code 0 mean, and how do you use it in a script?"</p><p>0 means success, non-zero means failure; the last command's code is in <code>$?</code>. You use it in <code>if</code> tests, with <code>&amp;&amp;</code> and <code>||</code>, and by ending your own script with <code>exit 1</code> when something failed so schedulers and monitoring can react. Add that different non-zero numbers can mean different problems, and that <code>set -e</code> (reference) stops a script at the first failing command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exit code 0 is success; any other number is failure; <code>$?</code> holds the last one.</li>
<li><code>A &amp;&amp; B</code> runs B if A worked; <code>A || B</code> runs B if A failed.</li>
<li>End your scripts with a meaningful <code>exit</code> code so cron and monitoring can react.</li>
<li>Print <code>$?</code> immediately; the next command overwrites it.</li>
<li>Functions (reference) package repeated steps and use <code>return</code> for a code.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har command khatam hone par ek chhota number chhod jaati hai: uska <b>exit code</b>. Zero matlab "kaam hua". Koi aur number matlab "nahi hua". Scripts in numbers se decide karti hain, commands jodti hain, aur cron ya monitoring ko batati hain ki poora job safal hua ya nahi.</p>

<h3>Analogy: receipt ka stamp</h3>
<p>Ek courier socho jo har parcel par stamp lagata hai: delivered ke liye green, failed ke liye wajah ke number ke saath red. Aap courier ki lambi kahani nahi padhte; stamp dekhte ho. Exit code wahi stamp hai. Command jo text print karti hai woh logon ke liye hai; exit code machines ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Command ke baad exit codes">
<rect x="20" y="50" width="190" height="60" rx="10" fill="#bae6fd"/><text x="115" y="86" text-anchor="middle" class="svg-ink" font-size="13">koi bhi command chalti hai</text>
<line x1="210" y1="80" x2="270" y2="45" stroke="#64748b" stroke-width="2"/><line x1="210" y1="80" x2="270" y2="115" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="355" y="50" text-anchor="middle" class="svg-ink" font-size="13">exit code 0 = OK</text>
<rect x="270" y="95" width="170" height="50" rx="10" fill="#fed7aa"/><text x="355" y="125" text-anchor="middle" class="svg-ink" font-size="13">1, 2, 3 ... = problem</text>
<rect x="470" y="50" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="78" text-anchor="middle" class="svg-ink" font-size="13">$? mein rehta hai</text><text x="545" y="98" text-anchor="middle" class="svg-muted" font-size="12">agli command tak</text>
<line x1="440" y1="45" x2="470" y2="75" stroke="#64748b" stroke-width="2"/><line x1="440" y1="120" x2="470" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Aakhri command ka exit code variable $? mein store hota hai.</p></div>

<h3>Exit codes dekhna</h3>
<p>Command chalao, phir turant <code>$?</code> print karo, kyunki agli command use overwrite kar deti hai. Lab ka asli output:</p>
<pre class="out">AUTO01$ ping -c 1 10.99.0.1 &gt; /dev/null 2&gt;&amp;1; echo "ping exit code: $?"
ping exit code: <span class="hl">0</span>
AUTO01$ ping -c 1 10.99.0.3 &gt; /dev/null 2&gt;&amp;1; echo "ping exit code: $?"
ping exit code: <span class="hl">1</span></pre>
<p>10.99.0.1 jawab deta hai, isliye ping 0 ke saath exit hota hai. 10.99.0.3 (HYD-EDGE-R3, lab mein shut) jawab nahi deta, isliye ping 1 deta hai. Semicolon <code>;</code> ka matlab bas "phir agli command chalao".</p>

<h3>&& aur || se chaining</h3>
<ul>
<li><code>A &amp;&amp; B</code> B tabhi chalata hai jab A safal hui (exit code 0). "A, aur phir B" padho.</li>
<li><code>A || B</code> B tabhi chalata hai jab A fail hui. "A, nahi to B" padho.</li>
</ul>
<pre class="out">AUTO01$ ping -c 1 10.99.0.1 &gt; /dev/null 2&gt;&amp;1 &amp;&amp; echo "R1 ok"
R1 ok
AUTO01$ ping -c 1 10.99.0.3 &gt; /dev/null 2&gt;&amp;1 || echo "R3 failed"
R3 failed</pre>
<p>Engineers quick alerts aise hi likhte hain: <code>./checknet.sh || echo "something is down"</code>.</p>

<h3>Apni script ko exit code dena</h3>
<p>Lab ki reachability script <code>checknet.sh</code> ek test se khatam hoti hai: agar counter <code>down</code> zero se bada ho to <code>exit 1</code>. Script <code>exit</code> bulaye bina aakhri line tak pahunche to uska exit code aakhri chali command ka hota hai. Yeh script ka tail hai, <code>nl checknet.sh | tail -n 16</code> se (line 4 sirf list file ka default naam set karti hai):</p>
<pre class="out">AUTO01$ nl checknet.sh | tail -n 16
     5	up=0
     6	down=0
     7	while read -r name ip; do
     8	  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
     9	    echo "$name $ip UP"
    10	    up=$((up+1))
    11	  else
    12	    echo "$name $ip DOWN"
    13	    down=$((down+1))
    14	  fi
    15	done &lt; "$file"
    16	echo "UP: $up DOWN: $down"
    17	# exit code 1 when anything is down, so cron or another script can react
    18	if [ "$down" -gt 0 ]; then
    19	  exit 1
    20	fi</pre>
<p>Ab script ke dono audiences ko wahi milta hai jo unhe chahiye:</p>
<pre class="out">AUTO01$ ./checknet.sh branch.txt || echo "something is down"
BLR-EDGE-R2 10.99.0.2 UP
BLR-SW-01 10.99.0.12 DOWN
BLR-AP-01 10.99.0.13 DOWN
UP: 1 DOWN: 2
<span class="hl">something is down</span>
AUTO01$ ./checknet.sh &gt; /dev/null; echo "checknet exit code: $?"
checknet exit code: <span class="hl">1</span></pre>
<p>Insaan DOWN lines padhta hai. Cron, monitoring tool ya doosri script ko sirf number 1 chahiye.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Function kuch lines ko ek naam ke neeche package karta hai taaki unhe baar baar bula sako, aur <code>return</code> function se exit code wapas deta hai. Lab shell functions nahi chalata, par asli Bash 5 chalata hai:</p>
<pre class="code">check_host() {
  local ip="$1"
  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
    echo "$ip UP"
    return 0
  else
    echo "$ip DOWN"
    return 1
  fi
}
check_host 10.99.0.1 || echo "R1 needs attention"</pre>
<p><code>local</code> variable ko function ke andar rakhta hai taaki woh doosron se na takraye. Function ka naam command ki tarah use hota hai aur uski <code>return</code> value <code>$?</code> se padhte hain ya <code>if</code> aur <code>||</code> se test karte hain.</p></div>

<div class="eg"><p><b>Worked example.</b> Cron <code>checknet.sh</code> ko har 15 minute chalata hai. Ek chhota wrapper <code>./checknet.sh || echo "ALERT: devices down" &gt;&gt; alerts.log</code> karta hai. Sab devices jawab dein to kuch nahi judta. Koi down ho to ek line judti hai. Ghanton tak koi insaan output nahi padhta; faisla exit code le jaata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>$?</code> ko tab print karna jab doosri command chal chuki ho (value overwrite ho chuki hoti hai). Non-zero ko hamesha "bura" maanna: <code>grep</code> jaise tools "match nahi" ke liye 1 dete hain, jo jaankari hai, crash nahi. Failure ke baad <code>echo "done"</code> jaisi harmless command se script khatam karna, jisse poori script 0 return karti hai jabki ek step fail hua. Failure code bilkul na dena, jisse cron sochta hai har run safal tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exit code <b>0</b> success hai; shell ka logic kai languages ke ulta hai jahan 0 false hota hai. <code>&amp;&amp;</code> agli command success par chalata hai, <code>||</code> failure par. <code>$?</code> sirf <i>aakhri</i> command ka code rakhta hai.</p></div>

<div class="scn"><h4>Backup jo hamesha OK kehta tha</h4><p>Ek nightly script configs copy karti thi aur <code>echo "backup finished"</code> par khatam hoti thi. Ek router hafte bhar down raha, copy command har raat fail hui, par script ki aakhri command, echo, hamesha safal thi. Scheduler saat din green tick dikhata raha. Jab team ne kisi bhi copy ke fail hone par <code>exit 1</code> joda, agli raat pehle failure par hi red alert aaya.</p><p><b>Lesson:</b> script ko apni failure non-zero exit code se khud report karni chahiye.</p></div>

<div class="iv"><p class="q">"Exit code 0 ka kya matlab hai, aur script mein use kaise karte ho?"</p><p>0 matlab success, non-zero matlab failure; aakhri command ka code <code>$?</code> mein hota hai. Use <code>if</code> tests mein, <code>&amp;&amp;</code> aur <code>||</code> ke saath, aur apni script ko kuch fail hone par <code>exit 1</code> se khatam karke karte hain taaki schedulers aur monitoring react kar sakein. Jodo ki alag non-zero numbers alag problems ho sakte hain, aur <code>set -e</code> (reference) script ko pehli failing command par rok deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exit code 0 success hai; koi aur number failure; <code>$?</code> aakhri wala rakhta hai.</li>
<li><code>A &amp;&amp; B</code> A chali to B chalata hai; <code>A || B</code> A fail hui to B chalata hai.</li>
<li>Apni scripts ko meaningful <code>exit</code> code se khatam karo taaki cron aur monitoring react kar sakein.</li>
<li><code>$?</code> turant print karo; agli command use overwrite karti hai.</li>
<li>Functions (reference) repeated steps package karte hain aur code ke liye <code>return</code> use karte hain.</li>
</ul></div>
`}};export{e as default};