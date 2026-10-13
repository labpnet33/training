var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>You can now turn a huge log into a short answer.</b> You can view the start, end and middle of a file, search it with patterns, chain small tools with pipes, save results in files, and count, sort, cut and rewrite text. Network engineers use these skills daily for syslog, SSH logs and CSV inventories, so keep this chapter as a checklist.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">View and search</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">head tail wc less</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">grep -i -v -c -E -o</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Connect and save</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">pipe |</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">&gt;  &gt;&gt;  2&gt;  tee</text>
<rect x="440" y="20" width="190" height="90" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Count and reshape</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">sort uniq -c</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">cut awk sed tr</text>
</svg><p class="cap">View and search, connect and save, count and reshape.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Read one syslog line: time, device address, sequence, message code, severity.</li>
<li>Use <code>head</code>, <code>tail</code>, <code>wc -l</code>, <code>cat -n</code> and <code>less</code> on the right file size.</li>
<li>Use <code>grep</code> with <code>-i</code>, <code>-v</code>, <code>-c</code>, <code>-n</code>, <code>-E</code> and <code>-o</code>, and with <code>^</code> and <code>$</code>.</li>
<li>Explain stdin, stdout and stderr, and build a pipeline stage by stage.</li>
<li>Choose between <code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code>, <code>&lt;</code> and <code>tee</code>, and avoid reading and writing one file.</li>
<li>Count the most frequent value with <code>sort | uniq -c | sort -rn</code>, using <code>-n</code> for numbers.</li>
<li>Pick columns with <code>cut</code> or <code>awk</code>, replace with <code>sed</code>, swap characters with <code>tr</code>.</li>
<li>Follow look, narrow, count, save, and check success lines before declaring an attack.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Pipe <code>|</code></dt><dd>Connects the output of one command to the input of the next.</dd>
<dt>stdin / stdout / stderr</dt><dd>Channels 0, 1 and 2: input, normal output, errors.</dd>
<dt>Redirect</dt><dd>Send a channel to a file with <code>&gt;</code>, <code>&gt;&gt;</code> or <code>2&gt;</code>.</dd>
<dt>Regex</dt><dd>A pattern language for text, used by <code>grep -E</code> and <code>sed</code>.</dd>
<dt>Field / delimiter</dt><dd>A column of a line / the character that separates columns.</dd>
<dt>/dev/null</dt><dd>A black hole that discards anything written to it.</dd>
<dt>Syslog</dt><dd>The standard way devices send log messages to a server.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Last 20 lines of a file</td><td><code>tail -n 20 file</code></td></tr>
<tr><td>Lines that do NOT match</td><td><code>grep -v</code></td></tr>
<tr><td>Count matching lines</td><td><code>grep -c</code></td></tr>
<tr><td>Show only the matching part</td><td><code>grep -o</code></td></tr>
<tr><td>Overwrite / append</td><td><code>&gt;</code> / <code>&gt;&gt;</code></td></tr>
<tr><td>Redirect errors</td><td><code>2&gt;</code> (discard: <code>2&gt; /dev/null</code>)</td></tr>
<tr><td>Numeric sort</td><td><code>sort -n</code></td></tr>
<tr><td>Does uniq need sorted input?</td><td>Yes, it merges only neighbours</td></tr>
<tr><td>Second CSV column</td><td><code>cut -d, -f2</code></td></tr>
<tr><td>Replace all matches on a line</td><td><code>sed 's/a/b/g'</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">head -n 5 f  /  tail -n 5 f  /  wc -l f  /  less f
grep -iE "pattern|other" f  /  grep -v x f  /  grep -c x f  /  grep -o x f
cmd1 | cmd2 | cmd3            # build and test one stage at a time
cmd &gt; out  /  cmd &gt;&gt; out  /  cmd 2&gt; err  /  cmd | tee out
sort -n  /  sort | uniq -c | sort -rn | head
cut -d, -f1,3 f  /  awk -F, '{print $2}' f  /  sed 's/a/b/g' f  /  tr a-z A-Z</pre>

<div class="warn"><p><b>Last reminder.</b> Text tools only print; the redirect is what changes files. Never send output to the file you are reading, review blocklists and reports before others use them, and keep the original log untouched as evidence.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> <code>uniq</code> needs <code>sort</code> first; <code>sort</code> needs <code>-n</code> for numbers; <code>&gt;</code> overwrites; <code>2&gt;</code> is errors; <code>-v</code> inverts; awk programs go in single quotes.</p></div>

<div class="scn"><h4>The Monday report</h4><p>Every Monday the NOC lead needed a list of the busiest devices in the weekend logs. Before this module it took an hour in a spreadsheet. With <code>grep</code>, <code>awk</code>, <code>sort | uniq -c | sort -rn</code> and <code>&gt;</code>, one saved line produced the same report in seconds, and it could be re-run any week.</p><p><b>Lesson:</b> a good pipeline is a repeatable report.</p></div>

<div class="iv"><p class="q">"How comfortable are you with Linux text processing for a network engineer role?"</p><p>I can search and summarise large logs with <code>grep</code>, pipes, <code>sort | uniq -c</code>, <code>awk</code> and <code>sed</code>, and save evidence with redirection. For example, I can count flaps per interface or failed SSH logins per source address, confirm whether any login succeeded, and write a reviewed list for the firewall team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Look, narrow, count, save.</li>
<li>Pipes connect tools; redirection saves results; errors need <code>2&gt;</code>.</li>
<li><code>sort | uniq -c | sort -rn</code> answers "what is most frequent".</li>
<li>Preview every pipeline stage and keep the original file.</li>
</ul></div>
`,hi:`
<p><b>Ab aap ek bade log ko chhote jawab mein badal sakte ho.</b> Aap file ka shuru, end aur beech dekh sakte ho, patterns se search kar sakte ho, chhote tools ko pipes se jod sakte ho, results files mein save kar sakte ho, aur text ginna, sort, cut aur rewrite kar sakte ho. Network engineers syslog, SSH logs aur CSV inventories ke liye roz yeh skills use karte hain, isliye is chapter ko checklist ki tarah rakho.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Module map">
<rect x="10" y="20" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="14">Dekho aur search</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">head tail wc less</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">grep -i -v -c -E -o</text>
<rect x="225" y="20" width="190" height="90" rx="10" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Jodo aur save</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">pipe |</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">&gt;  &gt;&gt;  2&gt;  tee</text>
<rect x="440" y="20" width="190" height="90" rx="10" fill="#fde68a"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">Ginti aur reshape</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">sort uniq -c</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">cut awk sed tr</text>
</svg><p class="cap">Dekho aur search, jodo aur save, ginti aur reshape.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Ek syslog line padho: time, device address, sequence, message code, severity.</li>
<li>File ke size ke hisaab se <code>head</code>, <code>tail</code>, <code>wc -l</code>, <code>cat -n</code> aur <code>less</code> use karo.</li>
<li><code>grep</code> ko <code>-i</code>, <code>-v</code>, <code>-c</code>, <code>-n</code>, <code>-E</code>, <code>-o</code> aur <code>^</code>, <code>$</code> ke saath use karo.</li>
<li>stdin, stdout aur stderr samjhao, aur pipeline stage by stage banao.</li>
<li><code>&gt;</code>, <code>&gt;&gt;</code>, <code>2&gt;</code>, <code>&lt;</code> aur <code>tee</code> mein se chuno, aur ek hi file padhne-likhne se bacho.</li>
<li><code>sort | uniq -c | sort -rn</code> se sabse frequent value ginno, numbers ke liye <code>-n</code> ke saath.</li>
<li><code>cut</code> ya <code>awk</code> se columns chuno, <code>sed</code> se replace karo, <code>tr</code> se characters badlo.</li>
<li>Dekho, chhaanto, ginti, save follow karo, aur attack kehne se pehle success lines check karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Pipe <code>|</code></dt><dd>Ek command ka output agle command ke input se jodta hai.</dd>
<dt>stdin / stdout / stderr</dt><dd>Channels 0, 1 aur 2: input, normal output, errors.</dd>
<dt>Redirect</dt><dd>Channel ko <code>&gt;</code>, <code>&gt;&gt;</code> ya <code>2&gt;</code> se file mein bhejna.</dd>
<dt>Regex</dt><dd>Text ke liye pattern language, <code>grep -E</code> aur <code>sed</code> mein use hoti hai.</dd>
<dt>Field / delimiter</dt><dd>Line ka ek column / columns ko alag karne wala character.</dd>
<dt>/dev/null</dt><dd>Black hole jo usme likha sab kuch discard kar deta hai.</dd>
<dt>Syslog</dt><dd>Devices ka log messages server ko bhejne ka standard tareeqa.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Sawal</th><th>Jawab</th></tr>
<tr><td>File ki aakhri 20 lines</td><td><code>tail -n 20 file</code></td></tr>
<tr><td>Jo lines match NAHI karti</td><td><code>grep -v</code></td></tr>
<tr><td>Matching lines ginna</td><td><code>grep -c</code></td></tr>
<tr><td>Sirf matching hissa dikhana</td><td><code>grep -o</code></td></tr>
<tr><td>Overwrite / append</td><td><code>&gt;</code> / <code>&gt;&gt;</code></td></tr>
<tr><td>Errors redirect</td><td><code>2&gt;</code> (discard: <code>2&gt; /dev/null</code>)</td></tr>
<tr><td>Numeric sort</td><td><code>sort -n</code></td></tr>
<tr><td>Kya uniq ko sorted input chahiye?</td><td>Haan, yeh sirf paas-paas wale milata hai</td></tr>
<tr><td>CSV ka doosra column</td><td><code>cut -d, -f2</code></td></tr>
<tr><td>Line ke saare matches replace</td><td><code>sed 's/a/b/g'</code></td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">head -n 5 f  /  tail -n 5 f  /  wc -l f  /  less f
grep -iE "pattern|other" f  /  grep -v x f  /  grep -c x f  /  grep -o x f
cmd1 | cmd2 | cmd3            # ek ek stage banao aur test karo
cmd &gt; out  /  cmd &gt;&gt; out  /  cmd 2&gt; err  /  cmd | tee out
sort -n  /  sort | uniq -c | sort -rn | head
cut -d, -f1,3 f  /  awk -F, '{print $2}' f  /  sed 's/a/b/g' f  /  tr a-z A-Z</pre>

<div class="warn"><p><b>Aakhri yaad-dehani.</b> Text tools sirf print karte hain; files redirect badalta hai. Jis file ko padh rahe ho usi mein output kabhi mat bhejo, blocklists aur reports doosron ke use se pehle review karo, aur original log ko evidence ki tarah chhedo mat.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> <code>uniq</code> ko pehle <code>sort</code> chahiye; numbers ke liye <code>sort -n</code>; <code>&gt;</code> overwrite karta hai; <code>2&gt;</code> errors hain; <code>-v</code> ulta karta hai; awk programs single quotes mein.</p></div>

<div class="scn"><h4>Monday ki report</h4><p>Har Monday NOC lead ko weekend logs mein sabse busy devices ki list chahiye thi. Is module se pehle spreadsheet mein ek ghanta lagta tha. <code>grep</code>, <code>awk</code>, <code>sort | uniq -c | sort -rn</code> aur <code>&gt;</code> se ek saved line ne wahi report seconds mein bana di, aur kisi bhi hafte dobara chal sakti thi.</p><p><b>Lesson:</b> achhi pipeline ek repeatable report hai.</p></div>

<div class="iv"><p class="q">"Network engineer role ke liye Linux text processing mein tum kitne comfortable ho?"</p><p>Main <code>grep</code>, pipes, <code>sort | uniq -c</code>, <code>awk</code> aur <code>sed</code> se bade logs search aur summarise kar sakta hoon, aur redirection se evidence save karta hoon. Jaise interface ke hisaab se flaps ya source address ke hisaab se failed SSH logins ginna, confirm karna ki koi login succeed hua ya nahi, aur firewall team ke liye reviewed list likhna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dekho, chhaanto, ginti, save.</li>
<li>Pipes tools jodte hain; redirection results save karta hai; errors ko <code>2&gt;</code> chahiye.</li>
<li><code>sort | uniq -c | sort -rn</code> "sabse frequent kya hai" ka jawab deta hai.</li>
<li>Har pipeline stage preview karo aur original file rakho.</li>
</ul></div>
`}};export{e as default};