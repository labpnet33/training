var e={id:`values-regex`,h:{en:`Values and regular expressions: tight patterns and Value options`,hi:`Values aur regular expressions: tight patterns aur Value options`},body:{en:`
<p><b>The idea of this chapter:</b> almost every template bug is a Value whose regular expression is too loose or too narrow. You will learn the few regex pieces that cover 95 percent of network output, see one template go wrong in both directions, and learn the options that change how a Value behaves.</p>

<h3>Analogy: the size of the box on the form</h3>
<p>If a box on a form is too small, the clerk cannot write the whole name. If it is too big, the clerk fills it with the neighbouring box as well. A Value regex is that box. <b>Too narrow</b> and valid lines fail to match, so rows vanish. <b>Too loose</b> and wrong text is accepted, so rows have wrong data.</p>

<h3>The regex pieces you need</h3>
<table class="cmp"><tr><th>Piece</th><th>Meaning</th><th>Network example</th></tr>
<tr><td><code>\\S+</code></td><td>one or more non-space characters</td><td>an interface name, a hostname</td></tr>
<tr><td><code>\\d+</code></td><td>one or more digits</td><td>a VLAN id, a timer</td></tr>
<tr><td><code>\\w+</code></td><td>letters, digits and underscore</td><td>a word you want to skip</td></tr>
<tr><td><code>\\s+</code></td><td>one or more spaces or tabs</td><td>the gap between columns</td></tr>
<tr><td><code>.+</code></td><td>anything, one or more characters</td><td>the rest of the line, such as an uptime text</td></tr>
<tr><td><code>(up|down)</code></td><td>one of several words</td><td>a status</td></tr>
<tr><td><code>\\.</code></td><td>a real dot</td><td>inside an IP address</td></tr>
<tr><td><code>[0-9a-f]{4}</code></td><td>exactly four hex characters</td><td>one part of a MAC address</td></tr>
<tr><td><code>$$</code></td><td>end of the line (a single dollar is reserved for Value names)</td><td>make sure nothing follows</td></tr></table>
<p>Before you put a regex into a template, you can test it with the <code>re</code> module you know from <code>auto-parse</code>. <code>re.fullmatch</code> asks "does the pattern match the whole text?".</p>
<pre class="code">import re

IP = r"\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned"
STATUS = r"up|down|administratively down"

for text in ("10.99.0.1", "unassigned", "10.99.0"):
    print(f"{text:12} IP     -&gt;", bool(re.fullmatch(IP, text)))
for text in ("up", "administratively down", "deleted"):
    print(f"{text:22} STATUS -&gt;", bool(re.fullmatch(STATUS, text)))</pre>
<pre class="out">AUTO01$ python3 retest.py
10.99.0.1    IP     -&gt; True
unassigned   IP     -&gt; True
<span class="hl">10.99.0      IP     -&gt; False</span>
up                     STATUS -&gt; True
administratively down  STATUS -&gt; True
<span class="hl">deleted                STATUS -&gt; False</span></pre>
<p>The raw string prefix <code>r"..."</code> tells Python to keep backslashes as typed. Inside a template file you do not need the <code>r</code>, because the file is plain text.</p>

<h3>One template, three versions</h3>
<p>All three templates use the same rule on <code>r1_ipbrief.txt</code>. Only the Values differ. First a <b>loose</b> one, where the last two Values are just <code>(\\S+)</code>:</p>
<pre class="code">Value INTF (\\S+)
Value IP (\\S+)
Value STATUS (\\S+)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS} -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py loose.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
<span class="hl">['GigabitEthernet0/1', 'unassigned', 'administratively']</span>
<span class="hl">['GigabitEthernet0/2', 'unassigned', 'administratively']</span>
<span class="hl">['GigabitEthernet0/3', 'unassigned', 'administratively']</span>
['Loopback0', '1.1.1.1', 'up']</pre>
<p>Five rows, but the status is cut after the first word. This is the same lie as the <code>split()</code> in chapter 1. Now a <b>narrow</b> one: IP accepts only dotted numbers and STATUS only <code>up|down</code>.</p>
<pre class="out">AUTO01$ python3 parse_one.py narrow.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
<span class="hl">['Loopback0', '1.1.1.1', 'up']</span></pre>
<p>Only two rows. The three shut interfaces did not match, so they vanished without any message. Finally the <b>tight</b> version: <code>IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)</code> and <code>STATUS (up|down|administratively down)</code>.</p>
<pre class="out">AUTO01$ python3 parse_one.py tight.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
['GigabitEthernet0/1', 'unassigned', 'administratively down']
['GigabitEthernet0/2', 'unassigned', 'administratively down']
['GigabitEthernet0/3', 'unassigned', 'administratively down']
['Loopback0', '1.1.1.1', 'up']</pre>
<p>Rule of thumb: describe every value the device can really print, including the odd ones, and nothing more. When you do not know all values, use a looser pattern for that one Value but make sure its neighbours stop it from swallowing too much.</p>

<h3>Value options</h3>
<p>Options sit between the word <code>Value</code> and the name. Combine several with commas and no spaces, for example <code>Value Filldown,Required VRF (\\S+)</code>.</p>
<table class="cmp"><tr><th>Option</th><th>What it does</th></tr>
<tr><td><code>Required</code></td><td>If this Value is empty when the row is recorded, the row is thrown away. Use it for the field that proves "this is a real row", such as the interface name.</td></tr>
<tr><td><code>Filldown</code></td><td>The value is kept after a Record and copied into the following rows until it is replaced (chapter 8).</td></tr>
<tr><td><code>List</code></td><td>Every match is collected into a Python list instead of overwriting the last one (chapter 8).</td></tr>
<tr><td><code>Key</code></td><td>Marks the field that identifies a row. It does not change what ParseText returns.</td></tr>
<tr><td><code>Fillup</code></td><td>Like Filldown but upwards: a value found later is copied into earlier rows where it is empty.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The version line of <code>show version</code> reads "PUN-CORE-R1 uptime is 2 weeks, 3 days". The rule <code>^&#36;{HOSTNAME} uptime is &#36;{UPTIME}$$</code> with <code>Value HOSTNAME (\\S+)</code> and <code>Value UPTIME (.+)</code> works because <code>\\S+</code> stops at the first space and <code>.+</code> takes the rest of the line, up to the end marker <code>$$</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>.+</code> in the middle of a rule; it grabs as much as it can and eats the next column. Forgetting <code>\\.</code> and writing a bare dot, which matches any character. Forgetting that a status can contain a space. Putting spaces between comma-joined options.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Required</code> removes rows silently; it never raises an error. And in a rule, <code>$$</code> means end of line while <code>&#36;{NAME}</code> means "insert this Value". Always write the end of line as <code>$$</code>; a lone <code>$</code> is not the right way in a template and real TextFSM rejects it.</p></div>

<div class="scn"><h4>The port that was never in the report</h4><p>A weekly "ports in error" report always showed 4 ports, yet the NOC saw 6 on the switch. The Value for the state was <code>(connected|notconnect|disabled)</code>, but two ports were <code>err-disabled</code>. Those lines matched no rule and were ignored. Adding <code>err-disabled</code> to the Value fixed the report.</p><p><b>Lesson:</b> the most important lines are often the unusual ones. List every state the device can print.</p></div>

<div class="iv"><p class="q">"A TextFSM template returns fewer rows than the device has. Where do you look first?"</p><p>At the Value regexes. A narrow pattern, such as a status that does not allow two words, makes the line match no rule, and the engine silently skips it. I compare the row count with the number of lines in the output, then widen the pattern for the missing lines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A Value regex that is too narrow loses rows; one that is too loose gives wrong data.</li>
<li>Learn \\S+, \\d+, \\w+, \\s+, .+, alternation with |, and $$ for end of line.</li>
<li>Test a pattern with re.fullmatch before putting it in a template.</li>
<li>Required drops rows with an empty value; combine options with commas.</li>
<li>Always list every value the device can print, including the odd ones.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> lagbhag har template bug ek aisa Value hota hai jiski regular expression ya to bahut loose hai ya bahut narrow. Aap woh chhote regex pieces seekhoge jo network output ke 95 percent ko cover karte hain, ek template ko dono disha mein galat hote dekhoge, aur woh options seekhoge jo Value ka behaviour badalte hain.</p>

<h3>Analogy: form ke box ka size</h3>
<p>Agar form ka box bahut chhota hai to clerk poora naam nahi likh paata. Agar bahut bada hai to clerk uske padosi box ko bhi bhar deta hai. Value regex wahi box hai. <b>Bahut narrow</b> ho to sahi lines match nahi hoti, isliye rows gayab ho jaati hain. <b>Bahut loose</b> ho to galat text accept ho jaata hai, isliye rows mein galat data aata hai.</p>

<h3>Regex ke pieces jo chahiye</h3>
<table class="cmp"><tr><th>Piece</th><th>Matlab</th><th>Network example</th></tr>
<tr><td><code>\\S+</code></td><td>ek ya zyada non-space characters</td><td>interface ka naam, hostname</td></tr>
<tr><td><code>\\d+</code></td><td>ek ya zyada digits</td><td>VLAN id, timer</td></tr>
<tr><td><code>\\w+</code></td><td>letters, digits aur underscore</td><td>ek shabd jise skip karna hai</td></tr>
<tr><td><code>\\s+</code></td><td>ek ya zyada spaces ya tabs</td><td>columns ke beech ka gap</td></tr>
<tr><td><code>.+</code></td><td>kuch bhi, ek ya zyada characters</td><td>line ka baaki hissa, jaise uptime text</td></tr>
<tr><td><code>(up|down)</code></td><td>kai shabdon mein se ek</td><td>status</td></tr>
<tr><td><code>\\.</code></td><td>asli dot</td><td>IP address ke andar</td></tr>
<tr><td><code>[0-9a-f]{4}</code></td><td>theek chaar hex characters</td><td>MAC address ka ek hissa</td></tr>
<tr><td><code>$$</code></td><td>line ka ant (akela dollar Value names ke liye reserved hai)</td><td>pakka karo ki iske baad kuch na aaye</td></tr></table>
<p>Regex ko template mein daalne se pehle aap use <code>re</code> module se test kar sakte ho jo aapne <code>auto-parse</code> mein seekha. <code>re.fullmatch</code> poochta hai "kya pattern poore text se match karta hai?".</p>
<pre class="code">import re

IP = r"\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned"
STATUS = r"up|down|administratively down"

for text in ("10.99.0.1", "unassigned", "10.99.0"):
    print(f"{text:12} IP     -&gt;", bool(re.fullmatch(IP, text)))
for text in ("up", "administratively down", "deleted"):
    print(f"{text:22} STATUS -&gt;", bool(re.fullmatch(STATUS, text)))</pre>
<pre class="out">AUTO01$ python3 retest.py
10.99.0.1    IP     -&gt; True
unassigned   IP     -&gt; True
<span class="hl">10.99.0      IP     -&gt; False</span>
up                     STATUS -&gt; True
administratively down  STATUS -&gt; True
<span class="hl">deleted                STATUS -&gt; False</span></pre>
<p>Raw string prefix <code>r"..."</code> Python ko batata hai ki backslashes jaise type kiye waise hi rakho. Template file ke andar <code>r</code> ki zaroorat nahi, kyunki file plain text hai.</p>

<h3>Ek template, teen versions</h3>
<p>Teeno templates <code>r1_ipbrief.txt</code> par wahi rule use karte hain. Sirf Values alag hain. Pehle ek <b>loose</b>, jisme aakhri do Values sirf <code>(\\S+)</code> hain:</p>
<pre class="code">Value INTF (\\S+)
Value IP (\\S+)
Value STATUS (\\S+)

Start
  ^&#36;{INTF}\\s+&#36;{IP}\\s+\\w+\\s+\\w+\\s+&#36;{STATUS} -&gt; Record</pre>
<pre class="out">AUTO01$ python3 parse_one.py loose.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
<span class="hl">['GigabitEthernet0/1', 'unassigned', 'administratively']</span>
<span class="hl">['GigabitEthernet0/2', 'unassigned', 'administratively']</span>
<span class="hl">['GigabitEthernet0/3', 'unassigned', 'administratively']</span>
['Loopback0', '1.1.1.1', 'up']</pre>
<p>Paanch rows, par status pehle shabd ke baad kat gaya. Yeh chapter 1 ke <code>split()</code> jaisa hi jhooth hai. Ab ek <b>narrow</b>: IP sirf dotted numbers leta hai aur STATUS sirf <code>up|down</code>.</p>
<pre class="out">AUTO01$ python3 parse_one.py narrow.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
<span class="hl">['Loopback0', '1.1.1.1', 'up']</span></pre>
<p>Sirf do rows. Teen shut interfaces match nahi hue, isliye bina kisi message ke gayab ho gaye. Aakhir mein <b>tight</b> version: <code>IP (\\d+\\.\\d+\\.\\d+\\.\\d+|unassigned)</code> aur <code>STATUS (up|down|administratively down)</code>.</p>
<pre class="out">AUTO01$ python3 parse_one.py tight.textfsm r1_ipbrief.txt
['INTF', 'IP', 'STATUS']
['GigabitEthernet0/0', '10.99.0.1', 'up']
['GigabitEthernet0/1', 'unassigned', 'administratively down']
['GigabitEthernet0/2', 'unassigned', 'administratively down']
['GigabitEthernet0/3', 'unassigned', 'administratively down']
['Loopback0', '1.1.1.1', 'up']</pre>
<p>Thumb rule: har woh value describe karo jo device asal mein print kar sakta hai, ajeeb wali bhi, aur usse zyada kuch nahi. Jab saari values pata na hon, to us ek Value ke liye loose pattern use karo, par dhyan rakho ki uske padosi use zyada nigalne se rokein.</p>

<h3>Value options</h3>
<p>Options shabd <code>Value</code> aur naam ke beech aate hain. Kai options ko commas se jodo, bina space ke, jaise <code>Value Filldown,Required VRF (\\S+)</code>.</p>
<table class="cmp"><tr><th>Option</th><th>Kya karta hai</th></tr>
<tr><td><code>Required</code></td><td>Row record hote waqt agar yeh Value khaali ho to row phenk di jaati hai. Use us field ke liye lagao jo "yeh asli row hai" saabit kare, jaise interface ka naam.</td></tr>
<tr><td><code>Filldown</code></td><td>Record ke baad value rakhi jaati hai aur agli rows mein copy hoti hai jab tak badal na jaye (chapter 8).</td></tr>
<tr><td><code>List</code></td><td>Har match pichhle ko overwrite karne ki jagah Python list mein jama hota hai (chapter 8).</td></tr>
<tr><td><code>Key</code></td><td>Us field ko mark karta hai jo row ko pehchanta hai. ParseText jo return karta hai use nahi badalta.</td></tr>
<tr><td><code>Fillup</code></td><td>Filldown jaisa par upar ki taraf: baad mein mili value un pehle ki rows mein copy hoti hai jahan woh khaali hai.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> <code>show version</code> ki line "PUN-CORE-R1 uptime is 2 weeks, 3 days" hai. Rule <code>^&#36;{HOSTNAME} uptime is &#36;{UPTIME}$$</code>, <code>Value HOSTNAME (\\S+)</code> aur <code>Value UPTIME (.+)</code> ke saath chalta hai kyunki <code>\\S+</code> pehle space par ruk jaata hai aur <code>.+</code> line ka baaki hissa le leta hai, end marker <code>$$</code> tak.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rule ke beech mein <code>.+</code> use karna; woh jitna ho sake utna pakad leta hai aur agla column kha jaata hai. <code>\\.</code> bhool kar sirf dot likhna, jo kisi bhi character se match karta hai. Yeh bhool jaana ki status mein space ho sakta hai. Comma se jode options ke beech space daalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Required</code> rows ko chupchaap hata deta hai; woh kabhi error nahi deta. Aur rule mein <code>$$</code> ka matlab line ka ant hai jabki <code>&#36;{NAME}</code> ka matlab "yeh Value yahan daalo". Line ka ant hamesha <code>$$</code> likho; akela <code>$</code> template mein sahi tareeka nahi hai aur asli TextFSM use reject karta hai.</p></div>

<div class="scn"><h4>Woh port jo report mein kabhi nahi tha</h4><p>Hafte ki "ports in error" report mein hamesha 4 ports dikhte the, par NOC ko switch par 6 dikhte the. State ka Value <code>(connected|notconnect|disabled)</code> tha, par do ports <code>err-disabled</code> the. Woh lines kisi rule se match nahi hui aur ignore ho gayi. Value mein <code>err-disabled</code> jodne se report theek hui.</p><p><b>Lesson:</b> sabse zaroori lines aksar ajeeb wali hoti hain. Device jo bhi state print kar sakta hai woh sab list karo.</p></div>

<div class="iv"><p class="q">"TextFSM template device se kam rows deta hai. Pehle kahan dekhte ho?"</p><p>Value regexes mein. Narrow pattern, jaise woh status jo do shabd allow nahi karta, line ko kisi rule se match nahi hone deta, aur engine use chupchaap skip kar deta hai. Main row count ko output ki lines se milata hoon, phir gayab lines ke liye pattern chauda karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bahut narrow Value regex rows kho deta hai; bahut loose galat data deta hai.</li>
<li>\\S+, \\d+, \\w+, \\s+, .+, | wala alternation aur line ke ant ke liye $$ seekho.</li>
<li>Template mein daalne se pehle pattern ko re.fullmatch se test karo.</li>
<li>Required khaali value wali rows hata deta hai; options ko commas se jodo.</li>
<li>Device jo bhi value print kar sakta hai woh sab list karo, ajeeb wali bhi.</li>
</ul></div>
`}};export{e as default};