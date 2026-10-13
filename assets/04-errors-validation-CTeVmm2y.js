var e={id:`errors-validation`,h:{en:`Errors, host bits and validating input`,hi:`Errors, host bits aur input validation`},body:{en:`
<p><b>One idea:</b> when you give the module bad input it does not guess. It stops with an <b>exception</b>, which is Python's word for "something went wrong, here is the type and the reason". For a network engineer this is a gift. A typo such as 10.60.7.300 is caught before it reaches a router.</p>
<h3>The two errors you will meet most</h3>
<pre class="code">import ipaddress

try:
    ipaddress.ip_address("10.60.7.300")
except ValueError as err:
    print("ValueError:", err)

try:
    ipaddress.ip_network("10.60.5.0/22")
except ValueError as err:
    print("ValueError:", err)

print(ipaddress.ip_network("10.60.5.0/22", strict=False))</pre>
<pre class="out">ValueError: '10.60.7.300' does not appear to be an IPv4 or IPv6 address
ValueError: 10.60.5.0/22 has host bits set
10.60.4.0/22</pre>
<ul><li><b>Invalid address.</b> An octet cannot exceed 255, so <code>10.60.7.300</code> raises <code>ValueError</code>.</li><li><b>Host bits set.</b> A /22 starts at a multiple of 4 in the third octet (4, 8, 12 and so on). 10.60.5.0 is inside the block that starts at 10.60.4.0, so it cannot be the <i>start</i> of a /22. Python refuses instead of silently using a different subnet than you typed.</li><li><code>strict=False</code> tells Python "I know the host bits are set, give me the real network anyway". Use it only when you want the answer, not to silence a typo.</li></ul>
<p>This is exactly the error that stops <code>plan.py</code> in Lab 1: the block was typed as 10.60.5.0/22 instead of 10.60.4.0/22.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Text input from a file or user to Try to build ip_address(...) to Good: use it object ready"><rect x="20" y="40" width="177" height="76" rx="10" fill="#fde68a"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Text input</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">from a file or user</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><text x="214" y="70" text-anchor="middle" class="svg-accent" font-size="11">ok</text><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Try to build</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">ip_address(...)</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><text x="425" y="70" text-anchor="middle" class="svg-accent" font-size="11">ValueError: report</text><rect x="442" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Good: use it</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">object ready</text></svg><p class="cap">The try block attempts the conversion. If it works you continue; if it raises ValueError the except block handles it.</p></div>
<h3>Catching errors with try and except</h3>
<p><code>try:</code> means "attempt this". <code>except ValueError:</code> means "if that exact type of error happens, run the lines under me instead of crashing". In <code>except ValueError as err</code>, the name <code>err</code> holds the error so you can print its message. The lines under <code>try</code> and <code>except</code> are pushed to the right by four spaces. That <b>indentation</b> is not decoration in Python; it is how Python knows which lines belong together.</p>
<h3>A reusable checker function</h3>
<pre class="code">import ipaddress

def is_valid_ip(text):
    """Return True if text is a good IPv4 or IPv6 address."""
    try:
        ipaddress.ip_address(text)
        return True
    except ValueError:
        return False

for value in ["10.60.7.12", "10.60.7.300", "10.60.7", "", "2001:db8::1"]:
    print(repr(value), is_valid_ip(value))</pre>
<pre class="out">'10.60.7.12' True
'10.60.7.300' False
'10.60.7' False
'' False
'2001:db8::1' True</pre>
<p><code>def is_valid_ip(text):</code> defines a <b>function</b>: a named block of steps you can run again and again. <code>text</code> is the input (a <b>parameter</b>). <code>return</code> hands an answer back. The text between triple quotes is a <b>docstring</b>, a note describing the function. The <code>for</code> line is a <b>loop</b>: it takes each value from the list in turn, runs the indented line, then moves on. <code>repr(value)</code> prints the value with quotes so an empty string <code>''</code> is visible. Notice that <code>"10.60.7"</code> (only three octets) and an empty string are rejected; only the first and last values are valid.</p>
<h3>Two more exceptions</h3>
<pre class="code">import ipaddress

try:
    ipaddress.ip_interface("10.60.7.12/33")
except ValueError as err:
    print("ValueError:", err)
try:
    ipaddress.ip_address("10.60.7.12") &lt; ipaddress.ip_address("2001:db8::1")
except TypeError as err:
    print("TypeError:", err)</pre>
<pre class="out">ValueError: '10.60.7.12/33' does not appear to be an IPv4 or IPv6 interface
TypeError: 10.60.7.12 and 2001:db8::1 are not of the same version</pre>
<p>A prefix larger than 32 is invalid for IPv4. Comparing an IPv4 address with an IPv6 address raises <code>TypeError</code>, because the comparison makes no sense. <code>ValueError</code> means "the value is wrong"; <code>TypeError</code> means "this kind of thing cannot do that". Read the last line of any traceback: it always starts with the exception type and then the reason.</p>
<div class="warn"><p><b>Common mistake.</b> Writing a bare <code>except:</code> that catches everything and prints "invalid". You then hide real bugs, such as a spelling mistake in your code. Catch <code>ValueError</code> specifically and keep the message.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which exception each mistake raises. Bad octet or host bits set: <code>ValueError</code>. Comparing IPv4 with IPv6: <code>TypeError</code>. And remember that <code>strict=False</code> exists on <code>ip_network</code> and <code>ip_interface</code> checks.</p></div>
<div class="scn"><h4>The typo that stopped the change board</h4><p>A spreadsheet export contained 10.60.7.256 in row 41. A script that called <code>ip_address()</code> on every row stopped at that row and printed the error with the row number. The owner fixed it to 10.60.7.25 in two minutes. Without validation, the typo would have gone into a configuration template and been rejected on the switch during the change window.</p><p><b>Lesson:</b> Validate every address before it enters a template or a device.</p></div>
<div class="iv"><p class="q">"What does "has host bits set" mean and how do you handle it?"</p><p>It means the address you gave is not the first address of that prefix, for example 10.60.5.0/22. Python raises <code>ValueError</code> to protect against typos. If the input is legitimate, I use <code>strict=False</code> to get the real network (10.60.4.0/22) and log what I corrected. If the input should be a network, I fix the source data.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Bad input raises an exception; <code>ValueError</code> covers bad octets, bad prefixes and host bits set.</li><li><code>try</code> and <code>except ValueError</code> let you keep going and report the problem.</li><li><code>strict=False</code> returns the real network when host bits are set.</li><li>A function (<code>def</code>) packages steps; a loop (<code>for</code>) repeats them for each item.</li><li>Indentation (4 spaces) shows which lines belong together.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> jab aap module ko galat input dete ho to woh andaza nahi lagata. Woh ek <b>exception</b> ke saath ruk jaata hai, jo Python ka word hai "kuch galat hua, yeh type aur yeh wajah". Network engineer ke liye yeh tohfa hai. 10.60.7.300 jaisa typo router tak pahunchne se pehle pakda jaata hai.</p>
<h3>Do errors jo sabse zyada milenge</h3>
<pre class="code">import ipaddress

try:
    ipaddress.ip_address("10.60.7.300")
except ValueError as err:
    print("ValueError:", err)

try:
    ipaddress.ip_network("10.60.5.0/22")
except ValueError as err:
    print("ValueError:", err)

print(ipaddress.ip_network("10.60.5.0/22", strict=False))</pre>
<pre class="out">ValueError: '10.60.7.300' does not appear to be an IPv4 or IPv6 address
ValueError: 10.60.5.0/22 has host bits set
10.60.4.0/22</pre>
<ul><li><b>Invalid address.</b> Octet 255 se zyada nahi ho sakta, isliye <code>10.60.7.300</code> <code>ValueError</code> deta hai.</li><li><b>Host bits set.</b> /22 teesre octet mein 4 ke multiple (4, 8, 12 aadi) par shuru hota hai. 10.60.5.0 us block ke andar hai jo 10.60.4.0 se shuru hota hai, isliye woh /22 ki <i>shuruaat</i> nahi ho sakta. Python chupchaap alag subnet use karne ki jagah mana kar deta hai.</li><li><code>strict=False</code> Python ko batata hai "mujhe pata hai host bits set hain, phir bhi asli network do". Ise tab use karo jab jawab chahiye, typo chhupane ke liye nahi.</li></ul>
<p>Yahi woh error hai jo Lab 1 mein <code>plan.py</code> ko rokta hai: block 10.60.4.0/22 ki jagah 10.60.5.0/22 type hua tha.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Text input file ya user se to Banane ki koshish ip_address(...) to Sahi: use karo object ready"><rect x="20" y="40" width="177" height="76" rx="10" fill="#fde68a"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Text input</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">file ya user se</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><text x="214" y="70" text-anchor="middle" class="svg-accent" font-size="11">ok</text><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Banane ki koshish</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">ip_address(...)</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><text x="425" y="70" text-anchor="middle" class="svg-accent" font-size="11">ValueError: report</text><rect x="442" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Sahi: use karo</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">object ready</text></svg><p class="cap">try block conversion ki koshish karta hai. Chal gaya to aage badho; ValueError aaya to except block use sambhalta hai.</p></div>
<h3>try aur except se errors pakadna</h3>
<p><code>try:</code> ka matlab "yeh koshish karo". <code>except ValueError:</code> ka matlab "agar bilkul isi type ki error aaye to crash hone ki jagah mere neeche wali lines chalao". <code>except ValueError as err</code> mein naam <code>err</code> error ko pakadta hai taaki aap uska message print kar sako. <code>try</code> aur <code>except</code> ke neeche ki lines chaar spaces daayen khisaki hoti hain. Python mein yeh <b>indentation</b> sajawat nahi hai; isi se Python ko pata chalta hai ki kaun si lines saath hain.</p>
<h3>Dobara use hone wala checker function</h3>
<pre class="code">import ipaddress

def is_valid_ip(text):
    """Return True if text is a good IPv4 or IPv6 address."""
    try:
        ipaddress.ip_address(text)
        return True
    except ValueError:
        return False

for value in ["10.60.7.12", "10.60.7.300", "10.60.7", "", "2001:db8::1"]:
    print(repr(value), is_valid_ip(value))</pre>
<pre class="out">'10.60.7.12' True
'10.60.7.300' False
'10.60.7' False
'' False
'2001:db8::1' True</pre>
<p><code>def is_valid_ip(text):</code> ek <b>function</b> define karta hai: naam wala steps ka block jo baar-baar chal sakta hai. <code>text</code> input hai (ek <b>parameter</b>). <code>return</code> jawab wapas deta hai. Triple quotes ke beech ka text <b>docstring</b> hai, function ka note. <code>for</code> line ek <b>loop</b> hai: yeh list se ek-ek value leti hai, indented line chalati hai, phir aage badhti hai. <code>repr(value)</code> value ko quotes ke saath print karta hai taaki khaali string <code>''</code> bhi dikhe. Dhyan do ki <code>"10.60.7"</code> (sirf teen octets) aur khaali string reject hote hain; sirf pehli aur aakhri values valid hain.</p>
<h3>Do aur exceptions</h3>
<pre class="code">import ipaddress

try:
    ipaddress.ip_interface("10.60.7.12/33")
except ValueError as err:
    print("ValueError:", err)
try:
    ipaddress.ip_address("10.60.7.12") &lt; ipaddress.ip_address("2001:db8::1")
except TypeError as err:
    print("TypeError:", err)</pre>
<pre class="out">ValueError: '10.60.7.12/33' does not appear to be an IPv4 or IPv6 interface
TypeError: 10.60.7.12 and 2001:db8::1 are not of the same version</pre>
<p>IPv4 ke liye 32 se bada prefix invalid hai. IPv4 address ko IPv6 address se compare karne par <code>TypeError</code> aata hai, kyunki comparison ka matlab nahi banta. <code>ValueError</code> ka matlab "value galat hai"; <code>TypeError</code> ka matlab "is tarah ki cheez yeh nahi kar sakti". Kisi bhi traceback ki aakhri line padho: woh hamesha exception type se shuru hoti hai aur phir wajah.</p>
<div class="warn"><p><b>Aam galti.</b> Bina type ka <code>except:</code> likhna jo sab kuch pakad ke "invalid" print kare. Tab aap asli bugs, jaise code mein spelling mistake, chhupa dete ho. Specifically <code>ValueError</code> pakdo aur message rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho kaun si galti kaunsa exception deti hai. Galat octet ya host bits set: <code>ValueError</code>. IPv4 ko IPv6 se compare karna: <code>TypeError</code>. Aur yaad rakho ki <code>strict=False</code> <code>ip_network</code> par hota hai.</p></div>
<div class="scn"><h4>Typo jisne change board rok diya</h4><p>Spreadsheet export ki row 41 mein 10.60.7.256 tha. Har row par <code>ip_address()</code> chalane wali script usi row par ruk gayi aur row number ke saath error print kiya. Owner ne use do minute mein 10.60.7.25 kiya. Validation ke bina typo configuration template mein jaata aur change window mein switch par reject hota.</p><p><b>Lesson:</b> Har address ko template ya device mein jaane se pehle validate karo.</p></div>
<div class="iv"><p class="q">""has host bits set" ka kya matlab hai aur ise kaise handle karte ho?"</p><p>Matlab aapka diya hua address us prefix ka pehla address nahi hai, jaise 10.60.5.0/22. Python typos se bachane ke liye <code>ValueError</code> deta hai. Input theek ho to main <code>strict=False</code> se asli network (10.60.4.0/22) leta hoon aur jo sudhaara use log karta hoon. Agar input network hona chahiye, to source data theek karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Galat input exception deta hai; <code>ValueError</code> galat octet, galat prefix aur host bits set cover karta hai.</li><li><code>try</code> aur <code>except ValueError</code> aapko aage badhne aur problem report karne dete hain.</li><li>Host bits set hone par <code>strict=False</code> asli network deta hai.</li><li>Function (<code>def</code>) steps ko package karta hai; loop (<code>for</code>) har item ke liye unhe dohrata hai.</li><li>Indentation (4 spaces) batata hai kaun si lines saath hain.</li></ul></div>
`}};export{e as default};