var e={id:`summary`,h:{en:`Summary, can-do checklist and cheat-sheet`,hi:`Summary, can-do checklist aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> one page to review before the labs, an interview, or the next module. If you can do everything in the checklist without looking back, you have the skill.</p>

<h3>The module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Summary: text, template, engine, rows; library or own template; test and use">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="12">Raw show text</text><text x="75" y="65" text-anchor="middle" class="svg-muted" font-size="10">saved in a file</text>
<rect x="170" y="5" width="150" height="40" rx="10" fill="#fde68a"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="12">Your template</text>
<rect x="170" y="55" width="150" height="40" rx="10" fill="#ddd6fe"/><text x="245" y="80" text-anchor="middle" class="svg-ink" font-size="12">ntc-templates</text>
<rect x="350" y="20" width="120" height="60" rx="10" fill="#fed7aa"/><text x="410" y="47" text-anchor="middle" class="svg-ink" font-size="12">TextFSM</text><text x="410" y="65" text-anchor="middle" class="svg-muted" font-size="10">the engine</text>
<rect x="500" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="12">Rows / dicts</text><text x="565" y="65" text-anchor="middle" class="svg-muted" font-size="10">for your code</text>
<line x1="140" y1="50" x2="170" y2="25" stroke="#64748b" stroke-width="2"/><line x1="140" y1="50" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="25" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="75" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="500" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="115" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Test with saved samples: rows = lines? Zero rows is a warning, not a success.</text><text x="320" y="151" text-anchor="middle" class="svg-muted" font-size="11">Troubleshoot: few rows, one row, one missing item, load error</text>
</svg><p class="cap">Text in, rows out, tested at every step.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why <code>split()</code> by position gives wrong data for "administratively down".</li>
<li>I can read a template and name its parts: Value lines, blank line, <code>Start</code>, rules, actions.</li>
<li>I can write Value regexes that accept every value the device prints, and test them with <code>re.fullmatch</code>.</li>
<li>I can choose between <code>Record</code>, <code>Continue.Record</code>, <code>Clear</code>, <code>Clearall</code>, <code>Error</code> and a state change.</li>
<li>I can run a template from Python with <code>textfsm.TextFSM</code>, <code>ParseText</code> and <code>ParseTextToDicts</code>.</li>
<li>I can use <code>parse_output</code> and <code>use_textfsm=True</code>, and I know that the result may be a string.</li>
<li>I can write a template for a new command step by step, and handle wrapped lines with Filldown, List and Continue.</li>
<li>I can test a template against saved samples and read an exit code.</li>
<li>I can find the cause when a template returns too few rows, one row, a missing item, or will not load.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>A text file with Values and states that describes how to turn command output into rows.</dd>
<dt>Value</dt><dd>A named field with a regex in parentheses, for example <code>Value STATUS (up|down)</code>.</dd>
<dt>State</dt><dd>A named group of rules. <code>Start</code> is mandatory and is where parsing begins.</dd>
<dt>Rule</dt><dd>An indented line that begins with <code>^</code>, a regex that may use Value names, and an optional action.</dd>
<dt>Action</dt><dd>What happens after a match: <code>Next</code>, <code>Continue</code>, <code>Error</code>, <code>Record</code>, <code>NoRecord</code>, <code>Clear</code>, <code>Clearall</code>, or a new state.</dd>
<dt>Header</dt><dd>The list of Value names, in declaration order (<code>fsm.header</code>).</dd>
<dt>Filldown / List / Required</dt><dd>Value options: repeat into following rows, collect into a list, drop the row if empty.</dd>
<dt>Implicit Record</dt><dd>The automatic save of the current Values at the end of the text.</dd>
<dt>ntc-templates</dt><dd>A community library of ready-made templates, selected through an index file by platform and command.</dd>
<dt>use_textfsm</dt><dd>An option of <code>send_command</code> that parses the output for you, returning a list, or the raw string when it cannot.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>A line that matches no rule is ignored silently; empty text gives <code>[]</code>.</li>
<li>No <code>Record</code> means one row (the last), through the implicit Record at the end.</li>
<li>The first matching rule wins; <code>Continue</code> lets later rules see the line, and cannot be combined with a state change.</li>
<li>A <code>Filldown</code> Value survives <code>Record</code> and <code>Clear</code>; only <code>Clearall</code> removes it.</li>
<li>A <code>List</code> Value returns a Python list, which is empty when nothing matched.</li>
<li>A bad template fails when <code>TextFSM(...)</code> is created, with <code>TextFSMTemplateError</code>.</li>
<li><code>parse_output</code> returns lowercase keys such as <code>intf</code>; unknown platform or command raises <code>ParsingException</code>.</li>
<li>In the lab the <code>use_textfsm=True</code> shortcut returns friendlier keys (<code>interface</code>, <code>ip_address</code>); always print <code>rows[0]</code>.</li>
<li>End of line in a rule is written <code>$$</code>.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code">Value Required INTF (\\S+)
Value IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)
Value STATUS (up|down|administratively down)
Value PROTO (up|down)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<pre class="code">import textfsm

with open("ipbrief.textfsm") as t:
    fsm = textfsm.TextFSM(t)
with open("r1_ipbrief.txt") as r:
    rows = fsm.ParseTextToDicts(r.read())

from ntc_templates.parse import parse_output
rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)</pre>
<table class="cmp"><tr><th>I see</th><th>Do this</th></tr>
<tr><td>3 rows instead of 5</td><td>Widen the Value regex; print the survivors</td></tr>
<tr><td>Only the last row</td><td>Add <code>-&gt; Record</code></td></tr>
<tr><td>One neighbour missing</td><td>Look for a wrapped line; add two rules</td></tr>
<tr><td>Value X not defined</td><td>Add a <code>Value X (...)</code> line above <code>Start</code></td></tr>
<tr><td>Extra last row</td><td>Make the real-row field <code>Required</code></td></tr>
<tr><td>String instead of a list</td><td>Check <code>isinstance(rows, list)</code></td></tr></table>

<div class="eg"><p><b>Worked example.</b> Interview drill in 60 seconds: "Command output arrives as text. I save it, pick a template (ntc-templates if it exists, my own if not), parse it to dictionaries, check the row count, and only then use the data."</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading zero rows as success. Guessing key names. Testing only on a clean sample. Fixing a count by loosening a regex without understanding the line.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix up the three exception names: <code>TextFSMTemplateError</code> (bad template), <code>TextFSMError</code> (Error rule fired) and <code>ParsingException</code> (ntc-templates lookup).</p></div>

<div class="scn"><h4>From a week to an hour</h4><p>A team needed interface, VLAN and neighbour data from 80 switches for a migration plan. Their old regex scripts took a week and needed manual cleanup. With ntc-templates for the common commands, two own templates for the rest and a sample test, they produced the same data in an hour and could rerun it after every change window.</p><p><b>Lesson:</b> shared templates plus tests turn a one-off job into a repeatable tool.</p></div>

<div class="iv"><p class="q">"Walk me through parsing show command output in Python."</p><p>I collect the text and keep it, choose ntc-templates or my own TextFSM template, run ParseTextToDicts, check that I got rows and the number I expect, then use the dictionaries for the report or database. I test the template with saved samples including odd and empty ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = Values + states + rules; engine = TextFSM; result = rows.</li>
<li>Actions control saving and moving: Record, Continue, Clear, Clearall, Error, state change.</li>
<li>ntc-templates first, own template when missing, always tested with samples.</li>
<li>Read the symptom: few rows, one row, one missing item, or a load error.</li>
<li>Next: <code>py-ipaddr</code> plans addresses, and <code>py-sqlite</code> stores the rows you now know how to produce.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> labs, interview ya agle module se pehle review karne ke liye ek page. Agar aap checklist ki har cheez bina peeche dekhe kar sakte ho, to skill aapke paas hai.</p>

<h3>Module ek tasveer mein</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Summary: text, template, engine, rows; library ya apna template; test aur use">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="75" y="47" text-anchor="middle" class="svg-ink" font-size="12">Kachcha show text</text><text x="75" y="65" text-anchor="middle" class="svg-muted" font-size="10">file mein saved</text>
<rect x="170" y="5" width="150" height="40" rx="10" fill="#fde68a"/><text x="245" y="30" text-anchor="middle" class="svg-ink" font-size="12">Aapka template</text>
<rect x="170" y="55" width="150" height="40" rx="10" fill="#ddd6fe"/><text x="245" y="80" text-anchor="middle" class="svg-ink" font-size="12">ntc-templates</text>
<rect x="350" y="20" width="120" height="60" rx="10" fill="#fed7aa"/><text x="410" y="47" text-anchor="middle" class="svg-ink" font-size="12">TextFSM</text><text x="410" y="65" text-anchor="middle" class="svg-muted" font-size="10">engine</text>
<rect x="500" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="565" y="47" text-anchor="middle" class="svg-ink" font-size="12">Rows / dicts</text><text x="565" y="65" text-anchor="middle" class="svg-muted" font-size="10">aapke code ke liye</text>
<line x1="140" y1="50" x2="170" y2="25" stroke="#64748b" stroke-width="2"/><line x1="140" y1="50" x2="170" y2="75" stroke="#64748b" stroke-width="2"/><line x1="320" y1="25" x2="350" y2="45" stroke="#64748b" stroke-width="2"/><line x1="320" y1="75" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="500" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="115" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">Saved samples se test karo: rows = lines? Zero rows warning hai, safalta nahi.</text><text x="320" y="151" text-anchor="middle" class="svg-muted" font-size="11">Troubleshoot: kam rows, ek row, ek item gayab, load error</text>
</svg><p class="cap">Text andar, rows bahar, har step par test.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki position se <code>split()</code> "administratively down" par galat data kyon deta hai.</li>
<li>Main template padh sakta hoon aur uske hisse bata sakta hoon: Value lines, blank line, <code>Start</code>, rules, actions.</li>
<li>Main aisi Value regexes likh sakta hoon jo device ki print ki hui har value accept karein, aur unhe <code>re.fullmatch</code> se test kar sakta hoon.</li>
<li>Main <code>Record</code>, <code>Continue.Record</code>, <code>Clear</code>, <code>Clearall</code>, <code>Error</code> aur state change mein se chun sakta hoon.</li>
<li>Main Python se template <code>textfsm.TextFSM</code>, <code>ParseText</code> aur <code>ParseTextToDicts</code> se chala sakta hoon.</li>
<li>Main <code>parse_output</code> aur <code>use_textfsm=True</code> use kar sakta hoon, aur jaanta hoon ki result string ho sakta hai.</li>
<li>Main nayi command ka template step by step likh sakta hoon, aur wrapped lines ko Filldown, List aur Continue se sambhal sakta hoon.</li>
<li>Main template ko saved samples se test kar sakta hoon aur exit code padh sakta hoon.</li>
<li>Main wajah dhoondh sakta hoon jab template bahut kam rows de, ek row de, ek item kho de, ya load na ho.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Template</dt><dd>Values aur states wali text file jo batati hai ki command output ko rows mein kaise badla jaye.</dd>
<dt>Value</dt><dd>Parentheses mein regex wala naam ka field, jaise <code>Value STATUS (up|down)</code>.</dd>
<dt>State</dt><dd>Rules ka naam wala group. <code>Start</code> zaroori hai aur wahin se parsing shuru hoti hai.</dd>
<dt>Rule</dt><dd><code>^</code> se shuru hone wali indented line, ek regex jo Value names use kar sakti hai, aur optional action.</dd>
<dt>Action</dt><dd>Match ke baad kya hota hai: <code>Next</code>, <code>Continue</code>, <code>Error</code>, <code>Record</code>, <code>NoRecord</code>, <code>Clear</code>, <code>Clearall</code>, ya naya state.</dd>
<dt>Header</dt><dd>Value names ki list, declaration order mein (<code>fsm.header</code>).</dd>
<dt>Filldown / List / Required</dt><dd>Value options: agli rows mein dohrao, list mein jama karo, khaali ho to row hatao.</dd>
<dt>Implicit Record</dt><dd>Text ke ant mein maujooda Values ka apne aap save hona.</dd>
<dt>ntc-templates</dt><dd>Ready-made templates ki community library, jo platform aur command se index file ke zariye chuni jaati hai.</dd>
<dt>use_textfsm</dt><dd><code>send_command</code> ka option jo output aapke liye parse karta hai, list lautata hai, ya parse na ho paaye to raw string.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Jo line kisi rule se match nahi hoti woh chupchaap ignore hoti hai; khaali text <code>[]</code> deta hai.</li>
<li><code>Record</code> nahi to ek row (aakhri), ant ke implicit Record se.</li>
<li>Pehla matching rule jeetta hai; <code>Continue</code> baad ke rules ko line dekhne deta hai, aur ise state change ke saath nahi jod sakte.</li>
<li><code>Filldown</code> Value <code>Record</code> aur <code>Clear</code> se bachti hai; sirf <code>Clearall</code> use hataata hai.</li>
<li><code>List</code> Value Python list lautati hai, jo kuch match na ho to khaali hoti hai.</li>
<li>Bad template <code>TextFSM(...)</code> banate waqt <code>TextFSMTemplateError</code> ke saath fail hota hai.</li>
<li><code>parse_output</code> <code>intf</code> jaisi lowercase keys lautata hai; anjaan platform ya command par <code>ParsingException</code>.</li>
<li>Lab mein <code>use_textfsm=True</code> shortcut friendlier keys (<code>interface</code>, <code>ip_address</code>) lautata hai; hamesha <code>rows[0]</code> print karo.</li>
<li>Rule mein line ka ant <code>$$</code> likha jaata hai.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code">Value Required INTF (\\S+)
Value IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)
Value STATUS (up|down|administratively down)
Value PROTO (up|down)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS}\\s+&#36;{PROTO} -&gt; Record</pre>
<pre class="code">import textfsm

with open("ipbrief.textfsm") as t:
    fsm = textfsm.TextFSM(t)
with open("r1_ipbrief.txt") as r:
    rows = fsm.ParseTextToDicts(r.read())

from ntc_templates.parse import parse_output
rows = parse_output(platform="cisco_ios", command="show ip interface brief", data=raw)</pre>
<table class="cmp"><tr><th>Main dekhta hoon</th><th>Yeh karo</th></tr>
<tr><td>5 ki jagah 3 rows</td><td>Value regex chauda karo; bachi hui rows print karo</td></tr>
<tr><td>Sirf aakhri row</td><td><code>-&gt; Record</code> jodo</td></tr>
<tr><td>Ek neighbour gayab</td><td>Wrapped line dhoondho; do rules jodo</td></tr>
<tr><td>Value X not defined</td><td><code>Start</code> ke upar <code>Value X (...)</code> line jodo</td></tr>
<tr><td>Extra aakhri row</td><td>Asli-row field ko <code>Required</code> banao</td></tr>
<tr><td>List ki jagah string</td><td><code>isinstance(rows, list)</code> check karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> 60 second ki interview drill: "Command output text ki tarah aata hai. Main use save karta hoon, template chunta hoon (ntc-templates agar hai, warna apna), dictionaries mein parse karta hoon, row count check karta hoon, aur tabhi data use karta hoon."</p></div>

<div class="warn"><p><b>Common mistakes.</b> Zero rows ko safalta padhna. Keys guess karna. Sirf saaf sample par test karna. Line samjhe bina regex loose karke count theek karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Teen exception names mat milao: <code>TextFSMTemplateError</code> (bad template), <code>TextFSMError</code> (Error rule fire hua) aur <code>ParsingException</code> (ntc-templates lookup).</p></div>

<div class="scn"><h4>Ek hafte se ek ghante tak</h4><p>Ek team ko migration plan ke liye 80 switches se interface, VLAN aur neighbour data chahiye tha. Unki purani regex scripts ne ek hafta liya aur haath se safai chahiye thi. Common commands ke liye ntc-templates, baaki ke liye do apne templates aur sample test ke saath unhone wahi data ek ghante mein banaya aur har change window ke baad dobara chala sakte the.</p><p><b>Lesson:</b> shared templates plus tests ek-baar ke kaam ko repeatable tool bana dete hain.</p></div>

<div class="iv"><p class="q">"Python mein show command output parse karne ka tareeka samjhao."</p><p>Text collect karke rakhta hoon, ntc-templates ya apna TextFSM template chunta hoon, ParseTextToDicts chalata hoon, check karta hoon ki rows mili aur expected ginti ki mili, phir dictionaries ko report ya database ke liye use karta hoon. Template ko saved samples se test karta hoon, ajeeb aur khaali wale bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template = Values + states + rules; engine = TextFSM; result = rows.</li>
<li>Actions saving aur moving control karte hain: Record, Continue, Clear, Clearall, Error, state change.</li>
<li>Pehle ntc-templates, na ho to apna template, hamesha samples se tested.</li>
<li>Symptom padho: kam rows, ek row, ek item gayab, ya load error.</li>
<li>Aage: <code>py-ipaddr</code> addresses plan karta hai, aur <code>py-sqlite</code> woh rows store karta hai jo ab aap banana jaante ho.</li>
</ul></div>
`}};export{e as default};