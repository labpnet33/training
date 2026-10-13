var e={id:`loops`,h:{en:`Loops: one script, every device in the list`,hi:`Loops: ek script, list ka har device`},body:{en:`
<p><b>The idea of this chapter:</b> a loop repeats the same steps for each item. This is where scripting pays off for a network engineer: write the check once, run it for 3 routers or 300.</p>

<h3>Analogy: the night guard's round</h3>
<p>A night guard has a list of doors. For each door on the list: walk there, try the handle, write down the result. When the list ends, the round ends. The guard does not write a new set of instructions for each door. A loop is that round.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Loop over lines of a device file">
<rect x="20" y="30" width="190" height="100" rx="10" fill="#fde68a"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">devices.txt</text>
<text x="115" y="76" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1 10.99.0.1</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">BLR-EDGE-R2 10.99.0.2</text><text x="115" y="116" text-anchor="middle" class="svg-muted" font-size="12">HYD-EDGE-R3 10.99.0.3</text>
<line x1="210" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="13">while read -r name ip</text><text x="345" y="94" text-anchor="middle" class="svg-muted" font-size="12">one line per round</text>
<line x1="430" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="40" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">ping, print,</text><text x="545" y="94" text-anchor="middle" class="svg-ink" font-size="13">count</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">when the file ends, the loop ends</text>
</svg><p class="cap">The loop reads one line of the file at a time and runs the body for it.</p></div>

<h3>for: loop over a list of words</h3>
<p>The simplest loop names the items right in the script:</p>
<pre class="code">for ip in 10.99.0.1 10.99.0.2 10.99.0.3; do
  echo "checking $ip"
done</pre>
<p><code>for ip in ... ; do ... done</code> sets the variable <code>ip</code> to the first item, runs the lines between <code>do</code> and <code>done</code>, then moves to the next item. Use it for short fixed lists.</p>

<h3>while read: loop over the lines of a file</h3>
<p>Real inventories live in files, so the loop that matters most reads a file line by line:</p>
<pre class="code">while read -r name ip; do
  echo "$name has address $ip"
done &lt; devices.txt</pre>
<ul>
<li><code>read -r name ip</code> reads one line and splits it at spaces: the first word goes into <code>name</code>, the rest into <code>ip</code>. The <code>-r</code> option stops Bash from treating a backslash specially; use it every time.</li>
<li><code>read</code> returns success while there are lines left, and failure at the end of the file. That ends the <code>while</code> loop.</li>
<li><code>&lt; devices.txt</code> after <code>done</code> feeds the file into the loop. Putting the file name at the end is a common surprise for beginners.</li>
</ul>

<h3>while with a counter</h3>
<pre class="code">n=1
while [ "$n" -le 3 ]; do
  echo "round $n"
  n=$((n + 1))
done</pre>
<p>The loop repeats while the test is true. You must change the counter inside, otherwise the loop never ends. A loop that never ends is stopped with Ctrl+C. Real output of all three loops, run from the lab script <code>loop.sh</code> with a three-line <code>devices.txt</code>:</p>
<pre class="out">AUTO01$ ./loop.sh
checking 10.99.0.1
checking 10.99.0.2
checking 10.99.0.3
PUN-CORE-R1 has address 10.99.0.1
BLR-EDGE-R2 has address 10.99.0.2
HYD-EDGE-R3 has address 10.99.0.3
<span class="hl">round 1</span>
round 2
round 3</pre>

<h3>Putting it together: count and report</h3>
<p>The reachability script from the lab combines everything so far. Inside the loop, an <code>if</code> pings each device and two counters, <code>up</code> and <code>down</code>, go up by one with <code>up=$((up+1))</code>. After the loop, a summary line prints the totals. You will run it in chapter 6.</p>
<pre class="code">up=0
down=0
while read -r name ip; do
  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
    echo "$name $ip UP"
    up=$((up+1))
  else
    echo "$name $ip DOWN"
    down=$((down+1))
  fi
done &lt; devices.txt
echo "UP: $up DOWN: $down"</pre>

<div class="eg"><p><b>Worked example.</b> The Pune NOC has 120 devices in <code>devices.txt</code>, one <code>name ip</code> pair per line. The loop above takes the same code path 120 times. Adding the 121st device means adding one line to the file, never touching the script. That separation of <i>data</i> (the file) from <i>logic</i> (the script) is the reason scripts scale.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Two more keywords appear in real scripts: <code>continue</code> skips to the next item, and <code>break</code> leaves the loop early. You may also see <code>for ip in $(cat devices.txt)</code>, which splits on every space and not just on lines, so it breaks for lines holding two words. Prefer <code>while read -r</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>done</code> or <code>do</code>. Forgetting <code>&lt; file</code> after <code>done</code>, which makes <code>read</code> wait for keyboard input. Not updating the counter, creating an endless loop. A last line in the file that has no newline at the end: the final device may be skipped by a plain <code>read</code>, so end every list file with a newline. Blank lines in the list produce a "check" of an empty address.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>for</code> iterates over a list of words; <code>while read</code> iterates over lines. <code>read</code> splits a line into as many variables as you name, and the <i>last</i> variable receives all the leftover words.</p></div>

<div class="scn"><h4>The 41st router that was never checked</h4><p>A Hyderabad team's loop used <code>for ip in $(cat branches.txt)</code>. One line held the name "HYD BR 41" with a space, so the loop treated "HYD", "BR" and "41" as three separate addresses and pinged nothing meaningful. The check reported all quiet for weeks. After switching to <code>while read -r name ip</code> with a clean two-column file, the report finally included that branch, and it was indeed down.</p><p><b>Lesson:</b> read whole lines, keep the data format strict, and test the loop with a few awkward lines.</p></div>

<div class="iv"><p class="q">"How do you run a command for every host in a file?"</p><p>With <code>while read -r name ip; do ...; done &lt; hosts.txt</code>. It reads the file line by line, splits each line into variables, and ends when the file ends. A strong answer explains why not <code>for x in $(cat file)</code> (word splitting) and mentions quoting <code>"$ip"</code> inside the loop and keeping the inventory in a data file rather than inside the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>for item in list; do ... done</code> repeats for each word in a short list.</li>
<li><code>while read -r a b; do ... done &lt; file</code> repeats for each line of a file.</li>
<li><code>while [ test ]; do ... done</code> repeats while a test holds; update the counter inside.</li>
<li>Keep device data in a file and the logic in the script.</li>
<li>Counters with <code>n=$((n+1))</code> let you print an UP/DOWN summary.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> loop har item ke liye wahi steps repeat karta hai. Yahin network engineer ke liye scripting ka fayda milta hai: check ek baar likho, 3 routers ke liye chalao ya 300 ke liye.</p>

<h3>Analogy: raat ke guard ka round</h3>
<p>Raat ke guard ke paas darwaazon ki list hai. List ke har darwaaze ke liye: wahan jao, handle try karo, result likho. List khatam to round khatam. Guard har darwaaze ke liye alag instructions nahi likhta. Loop wahi round hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Device file ki lines par loop">
<rect x="20" y="30" width="190" height="100" rx="10" fill="#fde68a"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">devices.txt</text>
<text x="115" y="76" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1 10.99.0.1</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">BLR-EDGE-R2 10.99.0.2</text><text x="115" y="116" text-anchor="middle" class="svg-muted" font-size="12">HYD-EDGE-R3 10.99.0.3</text>
<line x1="210" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="40" width="170" height="80" rx="10" fill="#bae6fd"/><text x="345" y="70" text-anchor="middle" class="svg-ink" font-size="13">while read -r name ip</text><text x="345" y="94" text-anchor="middle" class="svg-muted" font-size="12">har round mein ek line</text>
<line x1="430" y1="80" x2="470" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="40" width="150" height="80" rx="10" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">ping, print,</text><text x="545" y="94" text-anchor="middle" class="svg-ink" font-size="13">count</text>
<text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">file khatam to loop khatam</text>
</svg><p class="cap">Loop file ki ek line padhta hai aur uske liye body chalata hai.</p></div>

<h3>for: words ki list par loop</h3>
<p>Sabse simple loop items script mein hi likh deta hai:</p>
<pre class="code">for ip in 10.99.0.1 10.99.0.2 10.99.0.3; do
  echo "checking $ip"
done</pre>
<p><code>for ip in ... ; do ... done</code> variable <code>ip</code> ko pehle item par set karta hai, <code>do</code> aur <code>done</code> ke beech ki lines chalata hai, phir agle item par jaata hai. Chhoti fixed lists ke liye use karo.</p>

<h3>while read: file ki lines par loop</h3>
<p>Asli inventories files mein hoti hain, isliye sabse zaroori loop file ko line by line padhta hai:</p>
<pre class="code">while read -r name ip; do
  echo "$name has address $ip"
done &lt; devices.txt</pre>
<ul>
<li><code>read -r name ip</code> ek line padhta hai aur use spaces par todta hai: pehla word <code>name</code> mein, baaki <code>ip</code> mein. <code>-r</code> option Bash ko backslash ko special maanne se rokta hai; har baar use karo.</li>
<li><code>read</code> jab tak lines bachi hain success deta hai, aur file ke end par failure. Isse <code>while</code> loop khatam hota hai.</li>
<li><code>done</code> ke baad <code>&lt; devices.txt</code> file ko loop mein deta hai. File ka naam end mein aana beginners ko ajeeb lagta hai.</li>
</ul>

<h3>Counter wala while</h3>
<pre class="code">n=1
while [ "$n" -le 3 ]; do
  echo "round $n"
  n=$((n + 1))
done</pre>
<p>Loop tab tak repeat hota hai jab tak test true hai. Counter andar badalna zaroori hai, warna loop kabhi khatam nahi hota. Kabhi na khatam hone wala loop Ctrl+C se rokte hain. Teeno loops ka asli output, lab ki <code>loop.sh</code> script se, teen line wali <code>devices.txt</code> ke saath:</p>
<pre class="out">AUTO01$ ./loop.sh
checking 10.99.0.1
checking 10.99.0.2
checking 10.99.0.3
PUN-CORE-R1 has address 10.99.0.1
BLR-EDGE-R2 has address 10.99.0.2
HYD-EDGE-R3 has address 10.99.0.3
<span class="hl">round 1</span>
round 2
round 3</pre>

<h3>Sab jodkar: ginti aur report</h3>
<p>Lab ki reachability script ab tak ki sab cheezein jodti hai. Loop ke andar <code>if</code> har device ko ping karta hai aur do counters, <code>up</code> aur <code>down</code>, <code>up=$((up+1))</code> se ek ek badhte hain. Loop ke baad ek summary line totals print karti hai. Isse chapter 6 mein chalaoge.</p>
<pre class="code">up=0
down=0
while read -r name ip; do
  if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
    echo "$name $ip UP"
    up=$((up+1))
  else
    echo "$name $ip DOWN"
    down=$((down+1))
  fi
done &lt; devices.txt
echo "UP: $up DOWN: $down"</pre>

<div class="eg"><p><b>Worked example.</b> Pune NOC ke 120 devices <code>devices.txt</code> mein hain, har line mein ek <code>name ip</code> jodi. Upar ka loop wahi code path 120 baar chalata hai. 121va device jodna matlab file mein ek line jodna, script ko kabhi na chhoona. <i>Data</i> (file) aur <i>logic</i> (script) ka yeh alag hona hi scripts ko scale karta hai.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli scripts mein do aur keywords milte hain: <code>continue</code> agle item par jaata hai, aur <code>break</code> loop jaldi chhod deta hai. Aapko <code>for ip in $(cat devices.txt)</code> bhi dikh sakta hai, jo har space par todta hai, sirf lines par nahi, isliye do words wali lines par toot jaata hai. <code>while read -r</code> ko prefer karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>done</code> ya <code>do</code> bhoolna. <code>done</code> ke baad <code>&lt; file</code> bhoolna, jisse <code>read</code> keyboard input ka intezaar karta hai. Counter update na karna, jisse endless loop banta hai. File ki aakhri line ke end mein newline na ho: plain <code>read</code> aakhri device skip kar sakta hai, isliye har list file newline par khatam karo. List mein khaali lines khaali address ka "check" banati hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>for</code> words ki list par iterate karta hai; <code>while read</code> lines par. <code>read</code> line ko utne variables mein todta hai jitne aap naam do, aur <i>aakhri</i> variable ko bache hue saare words milte hain.</p></div>

<div class="scn"><h4>41va router jo kabhi check nahi hua</h4><p>Hyderabad team ke loop mein <code>for ip in $(cat branches.txt)</code> tha. Ek line mein "HYD BR 41" naam space ke saath tha, isliye loop ne "HYD", "BR" aur "41" ko teen alag addresses maana aur kuch kaam ka ping nahi hua. Check hafton tak "sab shaant" report karta raha. Do-column saaf file ke saath <code>while read -r name ip</code> par aane ke baad report mein aakhirkaar woh branch aayi, aur woh sach mein down thi.</p><p><b>Lesson:</b> poori lines padho, data format strict rakho, aur loop ko kuch awkward lines se test karo.</p></div>

<div class="iv"><p class="q">"File ke har host ke liye command kaise chalate ho?"</p><p><code>while read -r name ip; do ...; done &lt; hosts.txt</code> se. Yeh file ko line by line padhta hai, har line ko variables mein todta hai, aur file khatam hone par ruk jaata hai. Strong answer batata hai ki <code>for x in $(cat file)</code> kyun nahi (word splitting), loop ke andar <code>"$ip"</code> quote karna, aur inventory ko script ke andar nahi balki data file mein rakhna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>for item in list; do ... done</code> chhoti list ke har word ke liye repeat karta hai.</li>
<li><code>while read -r a b; do ... done &lt; file</code> file ki har line ke liye repeat karta hai.</li>
<li><code>while [ test ]; do ... done</code> jab tak test sach hai repeat karta hai; counter andar update karo.</li>
<li>Device data file mein, logic script mein rakho.</li>
<li><code>n=$((n+1))</code> wale counters se UP/DOWN summary print hoti hai.</li>
</ul></div>
`}};export{e as default};