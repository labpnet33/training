var e={id:`conditions`,h:{en:`Decisions: if, elif, else and tests`,hi:`Decisions: if, elif, else aur tests`},body:{en:`
<p><b>The idea of this chapter:</b> a script becomes useful when it can choose. "If the router answers, print UP, otherwise print DOWN." That choice is an <code>if</code> statement.</p>

<h3>Analogy: the traffic signal</h3>
<p>A traffic signal asks one question and acts on the answer: is the light green? If yes, go; if not, stop. Your script asks questions about the network or about files and chooses one road. Every question has only two answers, <b>true</b> or <b>false</b>. In Bash, true means "the command finished with exit code 0".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="if then else flow">
<rect x="240" y="10" width="160" height="44" rx="22" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">ping -c 1 "$ip" works?</text>
<line x1="280" y1="54" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="54" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="205" y="72" class="svg-accent" font-size="12">yes (exit 0)</text><text x="405" y="72" class="svg-accent" font-size="12">no (not 0)</text>
<rect x="70" y="100" width="200" height="44" rx="10" fill="#bbf7d0"/><text x="170" y="127" text-anchor="middle" class="svg-ink" font-size="13">echo "$ip is UP"</text>
<rect x="370" y="100" width="200" height="44" rx="10" fill="#fed7aa"/><text x="470" y="127" text-anchor="middle" class="svg-ink" font-size="13">echo "$ip is DOWN"</text>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">if ... then ... else ... fi</text>
</svg><p class="cap">An if statement runs a test and picks one of two branches.</p></div>

<h3>The shape of if</h3>
<pre class="code">#!/bin/bash
ip="$1"
if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
  echo "$ip is UP"
else
  echo "$ip is DOWN"
fi
links=7
if [ "$links" -lt 5 ]; then
  echo "few links"
elif [ "$links" -lt 10 ]; then
  echo "normal links"
else
  echo "many links"
fi
if [ -f devices.txt ]; then
  echo "devices.txt exists"
fi
if [ "$ip" = "10.99.0.3" ]; then
  echo "this is HYD-EDGE-R3"
fi</pre>
<ul>
<li><code>if COMMAND; then ... fi</code>. Bash runs the command after <code>if</code>. Exit code 0 means true and the lines after <code>then</code> run. <code>fi</code> is <code>if</code> backwards and closes the block.</li>
<li><code>ping -c 1 "$ip"</code> sends one echo request. Its exit code is 0 when a reply comes back. <code>&gt; /dev/null 2&gt;&amp;1</code> throws the ping text away because we only need the verdict: <code>&gt; /dev/null</code> discards normal output and <code>2&gt;&amp;1</code> sends error output to the same place.</li>
<li><code>elif</code> is "else if", a second question. <code>else</code> runs when nothing above matched.</li>
<li>The square brackets <code>[ ... ]</code> are a command called <code>test</code>. That is why <b>spaces are required</b> inside them: <code>[ "$links" -lt 5 ]</code>.</li>
</ul>

<h3>The tests you will use</h3>
<table class="cmp"><tr><th>Test</th><th>True when</th></tr>
<tr><td><code>[ "$a" -eq "$b" ]</code></td><td>numbers are equal (also <code>-ne</code> not equal)</td></tr>
<tr><td><code>[ "$a" -gt "$b" ]</code></td><td>greater than (also <code>-ge</code>, <code>-lt</code>, <code>-le</code>)</td></tr>
<tr><td><code>[ "$a" = "$b" ]</code></td><td>text is equal (<code>!=</code> not equal)</td></tr>
<tr><td><code>[ -f file ]</code></td><td>file exists and is a regular file</td></tr>
<tr><td><code>[ -d dir ]</code></td><td>directory exists</td></tr>
<tr><td><code>[ -z "$x" ]</code></td><td>text is empty (<code>-n</code> means not empty)</td></tr></table>
<p>Real output from the lab, run once for a working router and once for the one that is down:</p>
<pre class="out">AUTO01$ ./cond.sh 10.99.0.1
10.99.0.1 is <span class="hl">UP</span>
normal links
devices.txt exists
AUTO01$ ./cond.sh 10.99.0.3
10.99.0.3 is <span class="hl">DOWN</span>
normal links
devices.txt exists
this is HYD-EDGE-R3</pre>
<p>HYD-EDGE-R3 has its interface shut down in the lab, so the ping gets no reply and the <code>else</code> branch runs. Only the last <code>if</code> matched the address, so the last line appears only for that router.</p>

<div class="eg"><p><b>Worked example.</b> Before a nightly job starts, check that its input exists: <code>if [ ! -f devices.txt ]; then echo "devices.txt missing"; exit 3; fi</code>. The <code>!</code> means "not". This three-line guard prevents a script from running on an empty or missing list and reporting that everything is fine.</p></div>

<div class="warn"><p><b>Common mistakes.</b> No spaces inside the brackets (<code>[$a -eq 1]</code> fails). Using <code>=</code> for numbers and <code>-eq</code> for text; use <code>-eq</code>, <code>-lt</code> and friends for numbers, <code>=</code> and <code>!=</code> for text. Forgetting <code>then</code> or <code>fi</code>. And leaving a variable unquoted in a test: if <code>$name</code> is empty, <code>[ $name = "R1" ]</code> loses an argument and Bash complains with an error such as <i>unary operator expected</i> in real Bash. Writing <code>[ "$name" = "R1" ]</code> avoids it. The lab shell words this error differently, so check your own Linux host for the exact text.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>if</code> tests a command's <i>exit code</i>, not a printed word. "Success" is 0, which is why a successful <code>ping</code> counts as true. <code>[ ]</code> is a command, so <code>[ "$a"="$b" ]</code> without spaces is one string and always true.</p></div>

<div class="scn"><h4>Everything is fine, said the script</h4><p>A health script ran <code>[ $status = "up" ]</code>. One morning the status command returned nothing, so the variable was empty, the test errored, and the script's <code>else</code> branch was skipped, printing the default "all good" message. Monitoring showed green for three hours while a link was dead. The fix: quote the variable, treat an empty status as a failure, and make the default message "unknown".</p><p><b>Lesson:</b> design the quiet path to mean "something is wrong", not "everything is fine".</p></div>

<div class="iv"><p class="q">"How does an if statement decide true or false in Bash?"</p><p>It runs the command after <code>if</code> and checks the exit status: 0 is true, any other value is false. <code>[ ]</code> or <code>[[ ]]</code> are test commands that return 0 or 1. Mention <code>-eq</code> versus <code>=</code>, quoting variables inside tests, and that you can test any command directly, for example <code>if ping -c 1 "$ip"</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>if COMMAND; then ... elif ...; else ...; fi</code> chooses between branches.</li>
<li>True means exit code 0; a successful <code>ping</code> is true.</li>
<li><code>[ ]</code> is a command: keep spaces inside it and quote variables.</li>
<li>Numbers use <code>-eq -ne -gt -lt -ge -le</code>; text uses <code>=</code> and <code>!=</code>.</li>
<li>File tests: <code>-f</code> file, <code>-d</code> directory, <code>-z</code> empty text.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> script tab kaam ki banti hai jab woh choose kar sake. "Router jawab de to UP print karo, warna DOWN." Yeh choice <code>if</code> statement hai.</p>

<h3>Analogy: traffic signal</h3>
<p>Traffic signal ek sawaal poochta hai aur jawab par act karta hai: kya light green hai? Haan to jao; nahi to ruko. Aapki script network ya files ke baare mein sawaal poochti hai aur ek raasta choose karti hai. Har sawaal ke sirf do jawab hote hain, <b>true</b> ya <b>false</b>. Bash mein true ka matlab "command exit code 0 ke saath khatam hui".</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="if then else ka flow">
<rect x="240" y="10" width="160" height="44" rx="22" fill="#fde68a"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">ping -c 1 "$ip" chali?</text>
<line x1="280" y1="54" x2="170" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="54" x2="470" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="205" y="72" class="svg-accent" font-size="12">haan (exit 0)</text><text x="405" y="72" class="svg-accent" font-size="12">nahi (0 nahi)</text>
<rect x="70" y="100" width="200" height="44" rx="10" fill="#bbf7d0"/><text x="170" y="127" text-anchor="middle" class="svg-ink" font-size="13">echo "$ip is UP"</text>
<rect x="370" y="100" width="200" height="44" rx="10" fill="#fed7aa"/><text x="470" y="127" text-anchor="middle" class="svg-ink" font-size="13">echo "$ip is DOWN"</text>
<text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">if ... then ... else ... fi</text>
</svg><p class="cap">if statement test chalata hai aur do branches mein se ek chunta hai.</p></div>

<h3>if ka shape</h3>
<pre class="code">#!/bin/bash
ip="$1"
if ping -c 1 "$ip" &gt; /dev/null 2&gt;&amp;1; then
  echo "$ip is UP"
else
  echo "$ip is DOWN"
fi
links=7
if [ "$links" -lt 5 ]; then
  echo "few links"
elif [ "$links" -lt 10 ]; then
  echo "normal links"
else
  echo "many links"
fi
if [ -f devices.txt ]; then
  echo "devices.txt exists"
fi
if [ "$ip" = "10.99.0.3" ]; then
  echo "this is HYD-EDGE-R3"
fi</pre>
<ul>
<li><code>if COMMAND; then ... fi</code>. Bash <code>if</code> ke baad ki command chalata hai. Exit code 0 matlab true aur <code>then</code> ke baad ki lines chalti hain. <code>fi</code> yaani <code>if</code> ulta, block band karta hai.</li>
<li><code>ping -c 1 "$ip"</code> ek echo request bhejta hai. Reply aane par exit code 0 hota hai. <code>&gt; /dev/null 2&gt;&amp;1</code> ping ka text fenk deta hai kyunki humein sirf faisla chahiye: <code>&gt; /dev/null</code> normal output discard karta hai aur <code>2&gt;&amp;1</code> error output ko wahi bhej deta hai.</li>
<li><code>elif</code> "else if" hai, doosra sawaal. <code>else</code> tab chalta hai jab upar kuch match na ho.</li>
<li>Square brackets <code>[ ... ]</code> ek command hain jiska naam <code>test</code> hai. Isliye unke andar <b>spaces zaroori</b> hain: <code>[ "$links" -lt 5 ]</code>.</li>
</ul>

<h3>Jo tests aap use karoge</h3>
<table class="cmp"><tr><th>Test</th><th>True jab</th></tr>
<tr><td><code>[ "$a" -eq "$b" ]</code></td><td>numbers barabar hain (<code>-ne</code> barabar nahi)</td></tr>
<tr><td><code>[ "$a" -gt "$b" ]</code></td><td>bada hai (<code>-ge</code>, <code>-lt</code>, <code>-le</code> bhi)</td></tr>
<tr><td><code>[ "$a" = "$b" ]</code></td><td>text barabar hai (<code>!=</code> barabar nahi)</td></tr>
<tr><td><code>[ -f file ]</code></td><td>file hai aur regular file hai</td></tr>
<tr><td><code>[ -d dir ]</code></td><td>directory hai</td></tr>
<tr><td><code>[ -z "$x" ]</code></td><td>text khaali hai (<code>-n</code> matlab khaali nahi)</td></tr></table>
<p>Lab ka asli output, ek baar chalte router ke liye aur ek baar down router ke liye:</p>
<pre class="out">AUTO01$ ./cond.sh 10.99.0.1
10.99.0.1 is <span class="hl">UP</span>
normal links
devices.txt exists
AUTO01$ ./cond.sh 10.99.0.3
10.99.0.3 is <span class="hl">DOWN</span>
normal links
devices.txt exists
this is HYD-EDGE-R3</pre>
<p>Lab mein HYD-EDGE-R3 ka interface shut hai, isliye ping ko reply nahi milta aur <code>else</code> branch chalta hai. Sirf aakhri <code>if</code> ne address match kiya, isliye aakhri line sirf usi router ke liye aati hai.</p>

<div class="eg"><p><b>Worked example.</b> Nightly job shuru hone se pehle check karo ki uska input hai: <code>if [ ! -f devices.txt ]; then echo "devices.txt missing"; exit 3; fi</code>. <code>!</code> matlab "nahi". Yeh teen line ka guard script ko khaali ya missing list par chalne aur "sab theek hai" report karne se rokta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Brackets ke andar space nahi (<code>[$a -eq 1]</code> fail hota hai). Numbers ke liye <code>=</code> aur text ke liye <code>-eq</code> use karna; numbers ke liye <code>-eq</code>, <code>-lt</code> waghera, text ke liye <code>=</code> aur <code>!=</code>. <code>then</code> ya <code>fi</code> bhoolna. Aur test mein variable ko unquoted chhodna: agar <code>$name</code> khaali hai to <code>[ $name = "R1" ]</code> ka ek argument gaayab ho jaata hai aur asli Bash <i>unary operator expected</i> jaisa error deta hai. <code>[ "$name" = "R1" ]</code> likhne se yeh bachta hai. Lab shell yeh error alag shabdon mein likhta hai, isliye exact text ke liye apna Linux host dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>if</code> command ka <i>exit code</i> test karta hai, print kiya gaya shabd nahi. "Success" 0 hai, isliye safal <code>ping</code> true maana jaata hai. <code>[ ]</code> ek command hai, isliye <code>[ "$a"="$b" ]</code> bina spaces ke ek hi string hai aur hamesha true hota hai.</p></div>

<div class="scn"><h4>Sab theek hai, script ne kaha</h4><p>Ek health script <code>[ $status = "up" ]</code> chalati thi. Ek subah status command ne kuch return nahi kiya, variable khaali tha, test error hua, script ki <code>else</code> branch skip hui, aur default "all good" message print hua. Monitoring teen ghante green dikhati rahi jabki link dead tha. Fix: variable quote karo, khaali status ko failure maano, aur default message "unknown" rakho.</p><p><b>Lesson:</b> chup raste ka matlab "kuch galat hai" rakho, "sab theek hai" nahi.</p></div>

<div class="iv"><p class="q">"Bash mein if statement true ya false kaise decide karta hai?"</p><p>Woh <code>if</code> ke baad ki command chalata hai aur exit status dekhta hai: 0 true, koi bhi aur value false. <code>[ ]</code> ya <code>[[ ]]</code> test commands hain jo 0 ya 1 return karte hain. <code>-eq</code> versus <code>=</code>, tests mein variables quote karna, aur yeh ki aap kisi bhi command ko seedha test kar sakte ho, jaise <code>if ping -c 1 "$ip"</code>, zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>if COMMAND; then ... elif ...; else ...; fi</code> branches mein se chunta hai.</li>
<li>True matlab exit code 0; safal <code>ping</code> true hai.</li>
<li><code>[ ]</code> ek command hai: andar spaces rakho aur variables quote karo.</li>
<li>Numbers: <code>-eq -ne -gt -lt -ge -le</code>; text: <code>=</code> aur <code>!=</code>.</li>
<li>File tests: <code>-f</code> file, <code>-d</code> directory, <code>-z</code> khaali text.</li>
</ul></div>
`}};export{e as default};