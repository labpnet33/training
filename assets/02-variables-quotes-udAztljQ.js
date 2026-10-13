var e={id:`variables-quotes`,h:{en:`Variables, quotes and command substitution`,hi:`Variables, quotes aur command substitution`},body:{en:`
<p><b>The idea of this chapter:</b> a variable is a named box that holds one value, so you type the value once and use it many times. This is the first building block of every useful script.</p>

<h3>Analogy: labelled boxes on a shelf</h3>
<p>Think of a shelf in the network store room with boxes labelled <code>router</code>, <code>site</code> and <code>ip</code>. Each box holds one slip of paper. When the script needs the router name, it does not remember the text; it opens the box labelled <code>router</code>. If the name changes, you change one slip, not twenty lines.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variables as labelled boxes">
<rect x="30" y="40" width="170" height="70" rx="10" fill="#bae6fd"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">router</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">ip</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="440" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">links</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="12">write: name=value    read: $name</text>
</svg><p class="cap">Set a variable with name=value; read it with a dollar sign.</p></div>

<h3>Setting and reading a variable</h3>
<p>You set a variable with <code>name=value</code>. There must be <b>no spaces</b> around the equals sign. You read it by putting a dollar sign in front: <code>$name</code>. The shell replaces <code>$name</code> with the stored value before running the line. This replacement is called <b>expansion</b>.</p>
<pre class="code">#!/bin/bash
site="Pune"
router="PUN-CORE-R1"
ip="10.99.0.1"
echo "Checking $router at $site ($ip)"
echo 'Single quotes keep $router as text'
today=$(date +%F)
echo "Report name: report-$today.txt"
links=3
links=$((links + 1))
echo "Links now: $links"
hosts=$(wc -l &lt; devices.txt)
echo "Devices in list: $hosts"</pre>
<p>This is the real output of that script, saved as <code>vars.sh</code> in the lab (with a three-line <code>devices.txt</code> next to it):</p>
<pre class="out">AUTO01$ ./vars.sh
Checking PUN-CORE-R1 at Pune (10.99.0.1)
<span class="hl">Single quotes keep $router as text</span>
Report name: report-2026-09-29.txt
Links now: 4
Devices in list: 3</pre>

<h3>Double quotes, single quotes</h3>
<ul>
<li><b>Double quotes</b> <code>"..."</code> let variables and <code>$(...)</code> expand inside the text. Use them by default.</li>
<li><b>Single quotes</b> <code>'...'</code> keep everything exactly as typed. <code>'$router'</code> prints the characters <code>$router</code>. Use them when you want the dollar sign as text.</li>
</ul>

<h3>Command substitution: the answer of a command becomes text</h3>
<p><code>$(command)</code> runs the command and replaces itself with what it printed. <code>today=$(date +%F)</code> stores a date like <code>2026-09-29</code> (<code>%F</code> means year-month-day). Putting the date in file names, such as <code>report-$today.txt</code> or a backup folder, gives you one file per day that sorts in date order. The same idea gives you counts: <code>$(wc -l &lt; devices.txt)</code> stores how many lines the device list has.</p>

<h3>Arithmetic: $(( ))</h3>
<p>Double parentheses do whole-number maths: <code>links=$((links + 1))</code>. Division throws away the remainder, so in Bash <code>$((7 / 2))</code> gives <code>3</code>. For counting devices up and down that is exactly what you need.</p>

<h3>Why you should quote variables</h3>
<p>Without quotes, Bash splits the value at spaces. Take a file called <code>my list.txt</code> stored in a variable. In the lab:</p>
<pre class="out">AUTO01$ cat "$file"
R1 10.99.0.1
AUTO01$ cat $file
<span class="hl">cat: my: No such file or directory</span>
<span class="hl">cat: list.txt: No such file or directory</span></pre>
<p>The unquoted <code>cat $file</code> became <code>cat my list.txt</code>: two file names. With quotes it stays one. A device name or path with a space, or an empty variable, causes the same trouble. Quote every variable: <code>"$ip"</code>. This is the single most useful habit in shell scripting.</p>

<div class="eg"><p><b>Worked example.</b> A backup script saves configs into <code>/home/netadmin/backups/$(date +%F)</code>. Run on 29 September 2026 it creates the folder <code>2026-09-29</code>; tomorrow a fresh folder <code>2026-09-30</code>. Yesterday's backups are never overwritten, and <code>ls</code> lists the days in order.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Spaces around the equals sign. The lab shows what happens when a script has <code>site = "Pune"</code>:</p>
<pre class="out">AUTO01$ ./bad1.sh
Site is
<span class="hl">site: command not found</span></pre>
<p>Bash thinks <code>site</code> is a command and <code>=</code> and <code>"Pune"</code> are its arguments, so the variable stays empty. (Real Bash prints the script name and line number in front of the error; the lab prints it in a shorter form.) Other mistakes: typing <code>$ip = 5</code>, misspelling a variable name (an unknown variable silently expands to nothing), and forgetting that single quotes do not expand.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>$(command)</code> and <code>$((maths))</code> look alike but differ: one parenthesis runs a command, two do integer arithmetic. And single quotes never expand variables, double quotes do.</p></div>

<div class="scn"><h4>The backup that overwrote itself</h4><p>A team saved router configs to a fixed file name, <code>backup.cfg</code>, every night. After a bad change on Monday, they needed Sunday's copy, but Monday's run had already replaced it. The fix was one line: put <code>$(date +%F)</code> into the folder name. Seven days of history now exist, and the disk cost is tiny.</p><p><b>Lesson:</b> command substitution with a date turns a single overwritten file into a timeline.</p></div>

<div class="iv"><p class="q">"What is the difference between single and double quotes in Bash?"</p><p>Double quotes allow variable and command expansion inside the text, but stop word splitting of the result. Single quotes treat everything literally, so <code>$HOME</code> stays <code>$HOME</code>. A strong answer adds: always quote variables such as <code>"$file"</code> so values with spaces or an empty value do not break the command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Set with <code>name=value</code> (no spaces); read with <code>$name</code>.</li>
<li>Double quotes expand variables; single quotes do not.</li>
<li><code>$(command)</code> captures a command's output, for example <code>$(date +%F)</code>.</li>
<li><code>$((a + b))</code> does integer arithmetic.</li>
<li>Always quote variables: <code>"$ip"</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> variable ek naam wala dabba hai jisme ek value rehti hai, taaki aap value ek baar type karo aur kai baar use karo. Har kaam ki script ka yeh pehla building block hai.</p>

<h3>Analogy: shelf par label wale dabbe</h3>
<p>Network store room ki shelf socho jisme <code>router</code>, <code>site</code> aur <code>ip</code> label wale dabbe hain. Har dabbe mein ek parchi hai. Script ko router ka naam chahiye to woh text yaad nahi rakhti; woh <code>router</code> label wala dabba kholti hai. Naam badle to ek parchi badalte ho, bees lines nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Variables label wale dabbon ki tarah">
<rect x="30" y="40" width="170" height="70" rx="10" fill="#bae6fd"/><text x="115" y="68" text-anchor="middle" class="svg-ink" font-size="14">router</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">PUN-CORE-R1</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">ip</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.1</text>
<rect x="440" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="525" y="68" text-anchor="middle" class="svg-ink" font-size="14">links</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">3</text>
<text x="320" y="146" text-anchor="middle" class="svg-accent" font-size="12">likhna: name=value    padhna: $name</text>
</svg><p class="cap">Variable name=value se set hota hai; dollar sign se padhte hain.</p></div>

<h3>Variable set karna aur padhna</h3>
<p>Variable <code>name=value</code> se set karte ho. Equals sign ke aas-paas <b>space bilkul nahi</b> hona chahiye. Padhne ke liye aage dollar sign lagate ho: <code>$name</code>. Shell line chalane se pehle <code>$name</code> ko stored value se badal deta hai. Is badalne ko <b>expansion</b> kehte hain.</p>
<pre class="code">#!/bin/bash
site="Pune"
router="PUN-CORE-R1"
ip="10.99.0.1"
echo "Checking $router at $site ($ip)"
echo 'Single quotes keep $router as text'
today=$(date +%F)
echo "Report name: report-$today.txt"
links=3
links=$((links + 1))
echo "Links now: $links"
hosts=$(wc -l &lt; devices.txt)
echo "Devices in list: $hosts"</pre>
<p>Yeh us script ka asli output hai, jo lab mein <code>vars.sh</code> ke naam se save hai (saath mein teen line wali <code>devices.txt</code>):</p>
<pre class="out">AUTO01$ ./vars.sh
Checking PUN-CORE-R1 at Pune (10.99.0.1)
<span class="hl">Single quotes keep $router as text</span>
Report name: report-2026-09-29.txt
Links now: 4
Devices in list: 3</pre>

<h3>Double quotes, single quotes</h3>
<ul>
<li><b>Double quotes</b> <code>"..."</code> text ke andar variables aur <code>$(...)</code> ko expand hone dete hain. Inhe default rakho.</li>
<li><b>Single quotes</b> <code>'...'</code> sab kuch bilkul waisa hi rakhte hain jaisa type kiya. <code>'$router'</code> characters <code>$router</code> print karta hai. Dollar sign text ki tarah chahiye to inhe use karo.</li>
</ul>

<h3>Command substitution: command ka jawab text ban jaata hai</h3>
<p><code>$(command)</code> command chalata hai aur khud ko uske print kiye text se badal leta hai. <code>today=$(date +%F)</code> <code>2026-09-29</code> jaisi date store karta hai (<code>%F</code> matlab year-month-day). File names mein date daalne se, jaise <code>report-$today.txt</code> ya backup folder, har din ki ek file milti hai jo date ke order mein sort hoti hai. Yehi idea counts bhi deta hai: <code>$(wc -l &lt; devices.txt)</code> store karta hai ki device list mein kitni lines hain.</p>

<h3>Arithmetic: $(( ))</h3>
<p>Double parentheses poore numbers ka maths karte hain: <code>links=$((links + 1))</code>. Division remainder fenk deta hai, isliye Bash mein <code>$((7 / 2))</code> ka jawab <code>3</code> hai. Devices up aur down ginne ke liye yahi chahiye.</p>

<h3>Variables ko quote kyun karna chahiye</h3>
<p>Quotes ke bina Bash value ko spaces par tod deta hai. Ek file <code>my list.txt</code> variable mein hai. Lab mein:</p>
<pre class="out">AUTO01$ cat "$file"
R1 10.99.0.1
AUTO01$ cat $file
<span class="hl">cat: my: No such file or directory</span>
<span class="hl">cat: list.txt: No such file or directory</span></pre>
<p>Bina quote ka <code>cat $file</code> <code>cat my list.txt</code> ban gaya: do file names. Quotes ke saath woh ek rehta hai. Space wala device name ya path, ya khaali variable, wahi pareshani deta hai. Har variable ko quote karo: <code>"$ip"</code>. Shell scripting ki yeh sabse kaam ki aadat hai.</p>

<div class="eg"><p><b>Worked example.</b> Backup script configs ko <code>/home/netadmin/backups/$(date +%F)</code> mein save karti hai. 29 September 2026 ko chalane par folder <code>2026-09-29</code> banta hai; kal naya folder <code>2026-09-30</code>. Kal ke backups kabhi overwrite nahi hote, aur <code>ls</code> din ke order mein dikhata hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Equals sign ke aas-paas spaces. Lab dikhata hai jab script mein <code>site = "Pune"</code> ho to kya hota hai:</p>
<pre class="out">AUTO01$ ./bad1.sh
Site is
<span class="hl">site: command not found</span></pre>
<p>Bash sochta hai <code>site</code> command hai aur <code>=</code> aur <code>"Pune"</code> uske arguments, isliye variable khaali rehta hai. (Asli Bash error ke aage script ka naam aur line number print karta hai; lab chhote roop mein print karta hai.) Aur galtiyan: <code>$ip = 5</code> likhna, variable ka naam galat spell karna (anjaan variable chupchaap khaali expand hota hai), aur bhoolna ki single quotes expand nahi karte.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>$(command)</code> aur <code>$((maths))</code> ek jaise dikhte hain par alag hain: ek parenthesis command chalata hai, do integer arithmetic karte hain. Aur single quotes variables kabhi expand nahi karte, double quotes karte hain.</p></div>

<div class="scn"><h4>Backup jisne khud ko overwrite kar diya</h4><p>Ek team har raat router configs ko fixed file name <code>backup.cfg</code> mein save karti thi. Monday ke kharab change ke baad Sunday ki copy chahiye thi, par Monday ke run ne use pehle hi replace kar diya tha. Fix ek line ka tha: folder ke naam mein <code>$(date +%F)</code> daalo. Ab saat din ki history hai, aur disk ka kharch bahut kam.</p><p><b>Lesson:</b> date wala command substitution ek overwrite hoti file ko timeline bana deta hai.</p></div>

<div class="iv"><p class="q">"Bash mein single aur double quotes ka kya difference hai?"</p><p>Double quotes text ke andar variable aur command expansion ki ijazat dete hain, par result ka word splitting rokte hain. Single quotes sab kuch literal lete hain, isliye <code>$HOME</code> <code>$HOME</code> hi rehta hai. Strong answer mein yeh jodo: variables ko hamesha quote karo jaise <code>"$file"</code> taaki space wali ya khaali value command ko na tode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>name=value</code> se set karo (space nahi); <code>$name</code> se padho.</li>
<li>Double quotes variables expand karte hain; single quotes nahi.</li>
<li><code>$(command)</code> command ka output pakadta hai, jaise <code>$(date +%F)</code>.</li>
<li><code>$((a + b))</code> integer arithmetic karta hai.</li>
<li>Variables hamesha quote karo: <code>"$ip"</code>.</li>
</ul></div>
`}};export{e as default};