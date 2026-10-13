var e={id:`redirection`,h:{en:`Redirection: saving output, appending, errors and /dev/null`,hi:`Redirection: output save karna, append, errors aur /dev/null`},body:{en:`
<p><b>The idea of this chapter:</b> by default a command prints its results on your screen. With <b>redirection</b> you send that output into a <b>file</b> instead (or throw it away), and you can feed a file into a command's input. This is how you turn an investigation into a report that you can attach to a ticket.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Redirection operators">
<rect x="20" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="14">command</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">grep, echo ...</text>
<rect x="500" y="10" width="120" height="40" rx="10" fill="#bbf7d0"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="13">file.txt</text>
<rect x="500" y="65" width="120" height="40" rx="10" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="13">err.txt</text>
<rect x="500" y="120" width="120" height="40" rx="10" fill="#e2e8f0"/><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">/dev/null</text>
<line x1="150" y1="75" x2="500" y2="30" stroke="#64748b" stroke-width="2"/><text x="330" y="40" text-anchor="middle" class="svg-accent" font-size="12">&gt;  or  &gt;&gt;  (stdout)</text>
<line x1="150" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><text x="330" y="78" text-anchor="middle" class="svg-accent" font-size="12">2&gt;  (stderr)</text>
<line x1="150" y1="100" x2="500" y2="140" stroke="#64748b" stroke-width="2"/><text x="330" y="132" text-anchor="middle" class="svg-accent" font-size="12">2&gt; /dev/null  (discard)</text>
</svg><p class="cap">Where the output goes: a file, an error file, or nowhere.</p></div>

<h3>&gt; and &gt;&gt;: write and append</h3>
<table class="cmp"><tr><th>Operator</th><th>Meaning</th></tr>
<tr><td><code>&gt;</code></td><td>send stdout to a file; <b>create it, or erase it first</b> if it exists</td></tr>
<tr><td><code>&gt;&gt;</code></td><td>send stdout to the <b>end</b> of a file (append); create it if missing</td></tr>
<tr><td><code>&lt;</code></td><td>read stdin from a file</td></tr>
<tr><td><code>2&gt;</code></td><td>send stderr (errors) to a file</td></tr></table>
<pre class="out">netadmin@nms01:~$ mkdir -p reports
netadmin@nms01:~$ echo "first line" &gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
first line
netadmin@nms01:~$ echo "second line" &gt;&gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
first line
second line
netadmin@nms01:~$ echo "overwritten" &gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
overwritten</pre>
<p><code>echo</code> prints the text you give it. The first <code>&gt;</code> created the file. <code>&gt;&gt;</code> added a line at the end. The last <code>&gt;</code> wiped the file and started again. Remember the picture: <b>one arrow replaces, two arrows add</b>.</p>

<h3>Building a report</h3>
<p>This is the last step of the flap investigation: the top-talker pipeline from chapter 4, saved with <code>&gt;</code>, then a human note added with <code>&gt;&gt;</code>.</p>
<pre class="code">mkdir -p reports
grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | awk '{print $4}' | sort | uniq -c | sort -rn &gt; reports/flaps.txt
echo "Action: check cabling on BLR-EDGE-R2 Gi0/2" &gt;&gt; reports/flaps.txt</pre>
<pre class="out">netadmin@nms01:~$ cat reports/flaps.txt
      8 10.20.0.1
      2 10.40.3.1
      1 10.10.0.1
Action: check cabling on BLR-EDGE-R2 Gi0/2
netadmin@nms01:~$ wc -l reports/flaps.txt
4 reports/flaps.txt</pre>
<p>Nothing was printed when the long pipeline ran, because all of its output went into the file. A redirect always applies to the <b>last command of a pipeline</b> (here <code>sort -rn</code>).</p>

<h3>&lt;: file into a command</h3>
<pre class="out">netadmin@nms01:~$ wc -l &lt; devices.csv
5
netadmin@nms01:~$ tr ',' ' ' &lt; devices.csv
hostname ip site
PUN-CORE-R1 10.10.0.1 Pune
BLR-EDGE-R2 10.20.0.1 Bengaluru
HYD-EDGE-R3 10.40.3.1 Hyderabad
CHN-EDGE-R4 10.50.0.1 Chennai</pre>
<p>Compare <code>wc -l devices.csv</code>, which prints <code>5 devices.csv</code> (with the name), with <code>wc -l &lt; devices.csv</code>, which prints only <code>5</code> because <code>wc</code> never saw a file name. That is handy in scripts. <code>tr</code> (translate) cannot take a file name at all and reads only from stdin, so <code>&lt;</code> is the way (chapter 7).</p>

<h3>Errors: 2&gt; and /dev/null</h3>
<p>Errors travel on stderr, channel 2, so <code>&gt;</code> does not catch them. Use <code>2&gt;</code>:</p>
<pre class="out">netadmin@nms01:~$ cat nosuchfile 2&gt; reports/err.txt
netadmin@nms01:~$ cat reports/err.txt
cat: nosuchfile: No such file or directory
netadmin@nms01:~$ ls /nonexistent /var/log/remote 2&gt; /dev/null
routers.log</pre>
<p><code>/dev/null</code> is the <b>black hole</b>: anything written to it disappears. <code>2&gt; /dev/null</code> hides noisy errors such as "Permission denied" while you search a big tree with <code>find</code>. Use it only when you are sure the errors are harmless, because it hides real problems too.</p>
<p><b>Reference commands (not run in the simulator):</b> to capture output and errors <b>together</b> in one file, send stderr to wherever stdout goes. Order matters: <code>2&gt;&amp;1</code> must come after <code>&gt; file</code>. The simulator does not apply this correctly, so practise it on a real server.</p>
<pre class="code">command &gt; all.txt 2&gt;&amp;1       # stdout to all.txt, then stderr to the same place
command &amp;&gt; all.txt           # bash shorthand for the same thing
command 2&gt;&amp;1 | less          # errors travel down the pipe too
sudo tee /etc/motd &lt; note.txt   # write to a root-owned file (module lx-users)</pre>

<h3>tee: save and keep going</h3>
<p><code>tee</code> copies its input to a file and also passes it on, like a T-junction in a pipe. It lets you save an intermediate result and keep processing:</p>
<pre class="out">netadmin@nms01:~$ grep OSPF /var/log/remote/routers.log | tee /tmp/ospf.txt | wc -l
2
netadmin@nms01:~$ cat /tmp/ospf.txt | wc -l
2</pre>

<h3>Command substitution: use output inside a command</h3>
<p><code>$( ... )</code> runs a command and pastes its output into the line. It is perfect for dates in file names and for counts in messages:</p>
<pre class="out">netadmin@nms01:~$ echo "devices: $(wc -l &lt; devices.csv)"
devices: 5
netadmin@nms01:~$ echo "report made on $(date)" &gt;&gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
overwritten
report made on Tue Sep 29 09:00:30 IST 2026</pre>

<div class="warn"><p><b>The most dangerous trap: reading and writing the same file.</b> <code>sort devices.csv &gt; devices.csv</code> or <code>cat devices.csv &gt; devices.csv</code> looks harmless, but the shell empties the destination file <i>before</i> the command starts, so the command reads nothing and the file is left <b>empty</b>. Always write to a new name (<code>sort devices.csv &gt; devices.sorted.csv</code>) and rename it afterwards. The simulator is forgiving here; a real server is not.</p></div>
<div class="warn"><p><b>Other mistakes.</b> (1) <code>&gt;</code> where you meant <code>&gt;&gt;</code>: yesterday's data is gone. (2) <code>2&gt;&amp;1</code> before <code>&gt; file</code>: errors still reach the screen. (3) Redirecting inside <code>sudo</code>: <code>sudo echo x &gt; /etc/file</code> fails because the redirect is done by <i>your</i> shell, not by sudo; use <code>echo x | sudo tee /etc/file</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>&gt;</code> overwrites, <code>&gt;&gt;</code> appends, <code>2&gt;</code> redirects errors, <code>&lt;</code> reads input from a file, <code>/dev/null</code> discards. The redirect belongs to the last command in a pipeline.</p></div>

<div class="scn"><h4>The empty config file</h4><p>An engineer wanted to sort the device list and ran <code>sort devices.csv &gt; devices.csv</code>. The next morning the automation job that reads the list found an empty file and skipped every router. Because the previous night's backup existed, the list was restored in a minute. Since then the team's rule is "write to a new file, then <code>mv</code>".</p><p><b>Lesson:</b> never redirect output onto the file you are reading.</p></div>

<div class="iv"><p class="q">"What is the difference between &gt; and &gt;&gt;, and how do you capture errors?"</p><p><code>&gt;</code> creates the file or overwrites it; <code>&gt;&gt;</code> appends to it. Normal output is stdout (channel 1) and errors are stderr (channel 2), so errors need <code>2&gt;</code> to a file, or <code>2&gt; /dev/null</code> to discard them, or <code>&gt; file 2&gt;&amp;1</code> to capture both. Warn about reading and writing the same file in one command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>&gt;</code> replaces, <code>&gt;&gt;</code> appends, <code>&lt;</code> reads from a file.</li>
<li>Errors use channel 2: <code>2&gt; file</code> or <code>2&gt; /dev/null</code>.</li>
<li><code>tee</code> saves a copy and passes the data on; <code>$( )</code> pastes a command's output.</li>
<li>Never write onto the file you are reading in the same command.</li>
<li>Reports: pipeline to <code>&gt;</code>, notes with <code>&gt;&gt;</code>, then <code>cat</code> to check.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> default mein command apne results aapki screen par print karta hai. <b>Redirection</b> se aap woh output ek <b>file</b> mein bhejte ho (ya phenk dete ho), aur file ko command ke input mein bhi de sakte ho. Isi se aap investigation ko aisi report mein badalte ho jo ticket mein attach ho sake.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Redirection operators">
<rect x="20" y="55" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="14">command</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="11">grep, echo ...</text>
<rect x="500" y="10" width="120" height="40" rx="10" fill="#bbf7d0"/><text x="560" y="35" text-anchor="middle" class="svg-ink" font-size="13">file.txt</text>
<rect x="500" y="65" width="120" height="40" rx="10" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="13">err.txt</text>
<rect x="500" y="120" width="120" height="40" rx="10" fill="#e2e8f0"/><text x="560" y="145" text-anchor="middle" class="svg-ink" font-size="13">/dev/null</text>
<line x1="150" y1="75" x2="500" y2="30" stroke="#64748b" stroke-width="2"/><text x="330" y="40" text-anchor="middle" class="svg-accent" font-size="12">&gt;  ya  &gt;&gt;  (stdout)</text>
<line x1="150" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/><text x="330" y="78" text-anchor="middle" class="svg-accent" font-size="12">2&gt;  (stderr)</text>
<line x1="150" y1="100" x2="500" y2="140" stroke="#64748b" stroke-width="2"/><text x="330" y="132" text-anchor="middle" class="svg-accent" font-size="12">2&gt; /dev/null  (phenk do)</text>
</svg><p class="cap">Output kahan jaata hai: file mein, error file mein, ya kahin nahi.</p></div>

<h3>&gt; aur &gt;&gt;: likho aur append karo</h3>
<table class="cmp"><tr><th>Operator</th><th>Matlab</th></tr>
<tr><td><code>&gt;</code></td><td>stdout ko file mein bhejo; <b>file banao, ya pehle se ho to pehle mita do</b></td></tr>
<tr><td><code>&gt;&gt;</code></td><td>stdout ko file ke <b>end</b> mein bhejo (append); na ho to banao</td></tr>
<tr><td><code>&lt;</code></td><td>stdin file se padho</td></tr>
<tr><td><code>2&gt;</code></td><td>stderr (errors) file mein bhejo</td></tr></table>
<pre class="out">netadmin@nms01:~$ mkdir -p reports
netadmin@nms01:~$ echo "first line" &gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
first line
netadmin@nms01:~$ echo "second line" &gt;&gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
first line
second line
netadmin@nms01:~$ echo "overwritten" &gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
overwritten</pre>
<p><code>echo</code> wahi text print karta hai jo aap do. Pehle <code>&gt;</code> ne file banayi. <code>&gt;&gt;</code> ne end mein ek line jodi. Aakhri <code>&gt;</code> ne file saaf karke dobara shuru kiya. Tasveer yaad rakho: <b>ek arrow replace karta hai, do arrows add karte hain</b>.</p>

<h3>Report banana</h3>
<p>Yeh flap investigation ka aakhri step hai: chapter 4 ki top-talker pipeline ko <code>&gt;</code> se save karna, phir insaan ka note <code>&gt;&gt;</code> se jodna.</p>
<pre class="code">mkdir -p reports
grep LINEPROTO /var/log/remote/routers.log | grep "state to down" | awk '{print $4}' | sort | uniq -c | sort -rn &gt; reports/flaps.txt
echo "Action: check cabling on BLR-EDGE-R2 Gi0/2" &gt;&gt; reports/flaps.txt</pre>
<pre class="out">netadmin@nms01:~$ cat reports/flaps.txt
      8 10.20.0.1
      2 10.40.3.1
      1 10.10.0.1
Action: check cabling on BLR-EDGE-R2 Gi0/2
netadmin@nms01:~$ wc -l reports/flaps.txt
4 reports/flaps.txt</pre>
<p>Lambi pipeline chalte waqt kuch print nahi hua, kyunki uska poora output file mein chala gaya. Redirect hamesha <b>pipeline ke aakhri command</b> par lagta hai (yahan <code>sort -rn</code>).</p>

<h3>&lt;: file ko command mein</h3>
<pre class="out">netadmin@nms01:~$ wc -l &lt; devices.csv
5
netadmin@nms01:~$ tr ',' ' ' &lt; devices.csv
hostname ip site
PUN-CORE-R1 10.10.0.1 Pune
BLR-EDGE-R2 10.20.0.1 Bengaluru
HYD-EDGE-R3 10.40.3.1 Hyderabad
CHN-EDGE-R4 10.50.0.1 Chennai</pre>
<p><code>wc -l devices.csv</code> se compare karo, jo <code>5 devices.csv</code> (naam ke saath) print karta hai, aur <code>wc -l &lt; devices.csv</code> jo sirf <code>5</code> print karta hai kyunki <code>wc</code> ne file name dekha hi nahi. Scripts mein yeh kaam aata hai. <code>tr</code> (translate) file name le hi nahi sakta aur sirf stdin se padhta hai, isliye <code>&lt;</code> hi raasta hai (chapter 7).</p>

<h3>Errors: 2&gt; aur /dev/null</h3>
<p>Errors stderr, channel 2, par chalte hain, isliye <code>&gt;</code> unhe nahi pakadta. <code>2&gt;</code> use karo:</p>
<pre class="out">netadmin@nms01:~$ cat nosuchfile 2&gt; reports/err.txt
netadmin@nms01:~$ cat reports/err.txt
cat: nosuchfile: No such file or directory
netadmin@nms01:~$ ls /nonexistent /var/log/remote 2&gt; /dev/null
routers.log</pre>
<p><code>/dev/null</code> <b>black hole</b> hai: jo bhi usme likha jaaye gayab ho jaata hai. <code>2&gt; /dev/null</code> shor machane wale errors, jaise "Permission denied", chhupata hai jab aap <code>find</code> se bade tree mein search karte ho. Ise tabhi use karo jab pakka ho ki errors harmless hain, kyunki yeh asli problems bhi chhupa deta hai.</p>
<p><b>Reference commands (simulator mein nahi chalte):</b> output aur errors ko <b>ek saath</b> ek file mein pakadne ke liye stderr ko wahin bhejo jahan stdout jaata hai. Order matter karta hai: <code>2&gt;&amp;1</code> <code>&gt; file</code> ke baad aana chahiye. Simulator ise sahi apply nahi karta, isliye real server par practise karo.</p>
<pre class="code">command &gt; all.txt 2&gt;&amp;1       # stdout all.txt mein, phir stderr usi jagah
command &amp;&gt; all.txt           # bash ka shorthand, wahi kaam
command 2&gt;&amp;1 | less          # errors bhi pipe mein jaate hain
sudo tee /etc/motd &lt; note.txt   # root ki file mein likho (module lx-users)</pre>

<h3>tee: save karo aur aage badho</h3>
<p><code>tee</code> apna input file mein copy karta hai aur aage bhi bhejta hai, pipe ke T-junction jaisa. Isse aap intermediate result save karke processing jaari rakh sakte ho:</p>
<pre class="out">netadmin@nms01:~$ grep OSPF /var/log/remote/routers.log | tee /tmp/ospf.txt | wc -l
2
netadmin@nms01:~$ cat /tmp/ospf.txt | wc -l
2</pre>

<h3>Command substitution: output ko command ke andar use karo</h3>
<p><code>$( ... )</code> ek command chalata hai aur uska output line mein paste kar deta hai. File names mein dates aur messages mein counts ke liye perfect:</p>
<pre class="out">netadmin@nms01:~$ echo "devices: $(wc -l &lt; devices.csv)"
devices: 5
netadmin@nms01:~$ echo "report made on $(date)" &gt;&gt; reports/a.txt
netadmin@nms01:~$ cat reports/a.txt
overwritten
report made on Tue Sep 29 09:00:30 IST 2026</pre>

<div class="warn"><p><b>Sabse khatarnak trap: ek hi file padhna aur likhna.</b> <code>sort devices.csv &gt; devices.csv</code> ya <code>cat devices.csv &gt; devices.csv</code> harmless lagta hai, par shell command shuru hone se <i>pehle</i> destination file ko khaali kar deta hai, isliye command kuch padhta nahi aur file <b>khaali</b> reh jaati hai. Hamesha naye naam par likho (<code>sort devices.csv &gt; devices.sorted.csv</code>) aur baad mein rename karo. Simulator yahan maaf kar deta hai; real server nahi karta.</p></div>
<div class="warn"><p><b>Aur galtiyan.</b> (1) <code>&gt;&gt;</code> ki jagah <code>&gt;</code>: kal ka data gaya. (2) <code>&gt; file</code> se pehle <code>2&gt;&amp;1</code>: errors phir bhi screen par aate hain. (3) <code>sudo</code> ke andar redirect: <code>sudo echo x &gt; /etc/file</code> fail hota hai kyunki redirect <i>aapka</i> shell karta hai, sudo nahi; <code>echo x | sudo tee /etc/file</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>&gt;</code> overwrite karta hai, <code>&gt;&gt;</code> append, <code>2&gt;</code> errors redirect karta hai, <code>&lt;</code> file se input padhta hai, <code>/dev/null</code> discard karta hai. Redirect pipeline ke aakhri command ka hota hai.</p></div>

<div class="scn"><h4>Khaali config file</h4><p>Ek engineer device list sort karna chahta tha aur <code>sort devices.csv &gt; devices.csv</code> chalaya. Agli subah list padhne wali automation job ko khaali file mili aur usne har router skip kar diya. Pichhli raat ka backup tha, isliye list ek minute mein restore ho gayi. Tab se team ka rule hai "naye file mein likho, phir <code>mv</code>".</p><p><b>Lesson:</b> jis file ko padh rahe ho usi par output redirect mat karo.</p></div>

<div class="iv"><p class="q">"&gt; aur &gt;&gt; mein kya difference hai, aur errors kaise pakadte ho?"</p><p><code>&gt;</code> file banata hai ya overwrite karta hai; <code>&gt;&gt;</code> append karta hai. Normal output stdout (channel 1) hai aur errors stderr (channel 2), isliye errors ke liye <code>2&gt;</code> file mein, ya <code>2&gt; /dev/null</code> unhe phenkne ke liye, ya dono pakadne ke liye <code>&gt; file 2&gt;&amp;1</code>. Ek hi command mein ek hi file padhne aur likhne ke baare mein chetavani do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>&gt;</code> replace karta hai, <code>&gt;&gt;</code> append, <code>&lt;</code> file se padhta hai.</li>
<li>Errors channel 2 par: <code>2&gt; file</code> ya <code>2&gt; /dev/null</code>.</li>
<li><code>tee</code> copy save karke data aage bhejta hai; <code>$( )</code> command ka output paste karta hai.</li>
<li>Ek hi command mein jis file ko padh rahe ho usi par kabhi mat likho.</li>
<li>Reports: pipeline ko <code>&gt;</code> mein, notes <code>&gt;&gt;</code> se, phir <code>cat</code> se check.</li>
</ul></div>
`}};export{e as default};