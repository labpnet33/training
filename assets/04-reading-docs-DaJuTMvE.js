var e={id:`reading-docs`,h:{en:`Reading documentation: --help, type, dir and a usage line`,hi:`Documentation padhna: --help, type, dir aur usage line`},body:{en:`
<p><b>The idea of this chapter:</b> nobody remembers every command. Good engineers know <i>where to look</i>. You will learn four quick ways to ask a tool or a Python object "what are you and what can you do?", without leaving the terminal.</p>

<h3>Analogy: the label on a box of medicine</h3>
<p>You do not guess how to use a new device; you read the leaflet. Programs carry their own leaflet. <code>--help</code> prints it for a command-line tool. <code>type()</code> and <code>dir()</code> print it for a Python value.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Four ways to ask for help">
<rect x="10" y="25" width="145" height="70" rx="10" fill="#bae6fd"/><text x="82" y="52" text-anchor="middle" class="svg-ink" font-size="13">--help</text><text x="82" y="74" text-anchor="middle" class="svg-muted" font-size="10">what options exist</text>
<rect x="170" y="25" width="145" height="70" rx="10" fill="#fde68a"/><text x="242" y="52" text-anchor="middle" class="svg-ink" font-size="13">type(x)</text><text x="242" y="74" text-anchor="middle" class="svg-muted" font-size="10">what kind of thing</text>
<rect x="330" y="25" width="145" height="70" rx="10" fill="#ddd6fe"/><text x="402" y="52" text-anchor="middle" class="svg-ink" font-size="13">dir(x)</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="10">what it can do</text>
<rect x="490" y="25" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">help(x)</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="10">the full leaflet</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">start with the shortest one that answers your question</text>
</svg><p class="cap">Ask the tool before you ask a colleague.</p></div>

<h3>1. A command-line tool: --help</h3>
<p>Most tools built with <code>argparse</code> print a usage page on <code>--help</code> (or <code>-h</code>). The lab's backup tool:</p>
<pre class="out">AUTO01$ python3 netbackup.py --help
<span class="hl">usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]</span>

Back up router configs over SSH.

options:
  -h, --help            show this help message and exit
  -d, --devices DEVICES
                        CSV file with name,ip columns (default: devices.csv)
  -o, --outdir OUTDIR   folder for the backups (default: backups)
  -n, --dry-run         only show what would be backed up
  -v, --verbose         also log every successful backup</pre>
<p>Read the <b>usage line</b> first. Square brackets mean "optional". <code>-d DEVICES</code> means the option takes a value. <code>-n</code> and <code>-v</code> have no value; they are on/off switches. Below it, every option has a short form (<code>-n</code>), a long form (<code>--dry-run</code>) and a sentence. Defaults are printed in brackets, so you know what happens when you give nothing.</p>

<h3>2. A Python value: type() and dir()</h3>
<p>The file <code>pr.py</code> asks Python about a network object:</p>
<pre class="code">import ipaddress
net = ipaddress.ip_network("192.0.2.0/24")
print(net.netmask, net.num_addresses)
print(type(net))
print(dir(net)[:3])
print(len("abc"))</pre>
<ul>
<li>Line 2 builds a network object from the text. <code>192.0.2.0/24</code> is a documentation address range, safe for examples.</li>
<li><code>net.netmask</code> and <code>net.num_addresses</code> are <b>attributes</b>: facts the object knows about itself.</li>
<li><code>type(net)</code> says what kind of thing it is.</li>
<li><code>dir(net)</code> lists every name the object has; <code>[:3]</code> keeps only the first three so the screen stays readable.</li>
<li><code>len("abc")</code> counts the characters of the text.</li>
</ul>
<pre class="out">AUTO01$ python3 pr.py
<span class="hl">255.255.255.0 256</span>
&lt;class 'IPv4Network'&gt;
['__contains__', '__eq__', '__lt__']
3</pre>
<p>The mask and the 256 addresses came straight from the object, with no maths by you. The lab shows a short, simplified list from <code>dir</code>; on a real Python the list is much longer and starts with other names, so use <code>dir</code> to <i>browse</i>, then read the documentation for the details. Names with double underscores are Python's internals; look for the plain names such as <code>netmask</code>.</p>

<h3>3. Read the error message as documentation</h3>
<p>Errors are help too. A missing package says exactly what is missing:</p>
<pre class="out">AUTO01$ python3 -c "import nothere"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import nothere
<span class="hl">ModuleNotFoundError: No module named 'nothere'</span></pre>
<p>Reading it from the bottom: the error type, then the reason, then where. Chapter 8 turns this into a routine.</p>

<div class="eg"><p><b>Worked example.</b> You need the number of usable hosts in a subnet. Build the object, then run <code>dir()</code> on it and look for a plain name that sounds right. You will find names such as <code>num_addresses</code> and <code>hosts</code>. Try the one you pick on <code>192.0.2.0/24</code>, then search the official Python documentation for the module to confirm what it returns.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> On a real server, <code>python3 -c "help(len)"</code> or <code>help(ipaddress)</code> opens a full manual page; press <code>q</code> to leave it. Many tools also have a manual: <code>man ls</code>. The lab shows only a short stub for <code>help()</code>, so use <code>--help</code>, <code>type</code> and <code>dir</code> here.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Copying a command from a forum without reading its options. Guessing option names instead of running <code>--help</code>. Reading only the first line of an error. Assuming <code>dir</code> output in the lab equals a real Python's output.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a usage line, square brackets mean <i>optional</i>. A tool with <code>[-d DEVICES]</code> still runs without <code>-d</code>, using its default.</p></div>

<div class="scn"><h4>Which flag does what?</h4><p>A junior engineer found a backup script and was afraid to run it. His senior asked him to run only <code>--help</code>. In one minute he saw a <code>--dry-run</code> option, ran it and understood exactly which devices would be touched.</p><p><b>Lesson:</b> the first command to try on any tool is its help.</p></div>

<div class="iv"><p class="q">"You get a Python script from a colleague. How do you learn what it does without running it on devices?"</p><p>I read the file, run it with <code>--help</code> to see the options, use a <code>--dry-run</code> option if it exists, and test on a lab device. For unknown objects in code I use <code>type()</code> and <code>dir()</code>, and then the official documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--help</code> prints a usage line and the list of options.</li>
<li>Square brackets mean optional; an option with a capital word takes a value.</li>
<li><code>type()</code> says what something is; <code>dir()</code> lists what it can do.</li>
<li>Error messages are documentation: read from the bottom up.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> koi bhi har command yaad nahi rakhta. Achhe engineers jaante hain ki <i>kahan dekhna hai</i>. Aap chaar tez tareeke seekhoge jinse tool ya Python object se poochh sako "tum kya ho aur kya kar sakte ho?", terminal chhode bina.</p>

<h3>Analogy: dawai ke dibbe par label</h3>
<p>Nayi device kaise chalani hai, aap andaza nahi lagate; leaflet padhte ho. Programs apna leaflet saath rakhte hain. Command-line tool ke liye <code>--help</code> use print karta hai. Python value ke liye <code>type()</code> aur <code>dir()</code> karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Madad maangne ke chaar tareeke">
<rect x="10" y="25" width="145" height="70" rx="10" fill="#bae6fd"/><text x="82" y="52" text-anchor="middle" class="svg-ink" font-size="13">--help</text><text x="82" y="74" text-anchor="middle" class="svg-muted" font-size="10">kaunse options hain</text>
<rect x="170" y="25" width="145" height="70" rx="10" fill="#fde68a"/><text x="242" y="52" text-anchor="middle" class="svg-ink" font-size="13">type(x)</text><text x="242" y="74" text-anchor="middle" class="svg-muted" font-size="10">kis qism ki cheez</text>
<rect x="330" y="25" width="145" height="70" rx="10" fill="#ddd6fe"/><text x="402" y="52" text-anchor="middle" class="svg-ink" font-size="13">dir(x)</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="10">kya kar sakta hai</text>
<rect x="490" y="25" width="140" height="70" rx="10" fill="#bbf7d0"/><text x="560" y="52" text-anchor="middle" class="svg-ink" font-size="13">help(x)</text><text x="560" y="74" text-anchor="middle" class="svg-muted" font-size="10">poora leaflet</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">sabse chhota wala shuru karo jo sawal ka jawab de</text>
</svg><p class="cap">Colleague se poochne se pehle tool se poochho.</p></div>

<h3>1. Command-line tool: --help</h3>
<p><code>argparse</code> se bane zyadatar tools <code>--help</code> (ya <code>-h</code>) par usage page print karte hain. Lab ka backup tool:</p>
<pre class="out">AUTO01$ python3 netbackup.py --help
<span class="hl">usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]</span>

Back up router configs over SSH.

options:
  -h, --help            show this help message and exit
  -d, --devices DEVICES
                        CSV file with name,ip columns (default: devices.csv)
  -o, --outdir OUTDIR   folder for the backups (default: backups)
  -n, --dry-run         only show what would be backed up
  -v, --verbose         also log every successful backup</pre>
<p>Pehle <b>usage line</b> padho. Square brackets ka matlab "optional". <code>-d DEVICES</code> ka matlab option ek value leta hai. <code>-n</code> aur <code>-v</code> ki value nahi hoti; woh on/off switches hain. Uske neeche har option ka chhota form (<code>-n</code>), lamba form (<code>--dry-run</code>) aur ek vakya hai. Defaults brackets mein print hote hain, isliye pata chalta hai ki kuch na do to kya hoga.</p>

<h3>2. Python value: type() aur dir()</h3>
<p>File <code>pr.py</code> Python se network object ke baare mein poochhti hai:</p>
<pre class="code">import ipaddress
net = ipaddress.ip_network("192.0.2.0/24")
print(net.netmask, net.num_addresses)
print(type(net))
print(dir(net)[:3])
print(len("abc"))</pre>
<ul>
<li>Line 2 text se network object banati hai. <code>192.0.2.0/24</code> documentation address range hai, examples ke liye safe.</li>
<li><code>net.netmask</code> aur <code>net.num_addresses</code> <b>attributes</b> hain: woh baatein jo object apne baare mein jaanta hai.</li>
<li><code>type(net)</code> batata hai ki yeh kis qism ki cheez hai.</li>
<li><code>dir(net)</code> object ke saare naam list karta hai; <code>[:3]</code> sirf pehle teen rakhta hai taaki screen padhne layak rahe.</li>
<li><code>len("abc")</code> text ke characters ginta hai.</li>
</ul>
<pre class="out">AUTO01$ python3 pr.py
<span class="hl">255.255.255.0 256</span>
&lt;class 'IPv4Network'&gt;
['__contains__', '__eq__', '__lt__']
3</pre>
<p>Mask aur 256 addresses seedha object se aaye, aapko koi ganit nahi karna pada. Lab <code>dir</code> ki chhoti, saral list dikhata hai; asli Python mein list bahut lambi hoti hai aur doosre naamon se shuru hoti hai, isliye <code>dir</code> ko <i>browse</i> karne ke liye use karo, phir details ke liye documentation padho. Double underscore wale naam Python ke internals hain; <code>netmask</code> jaise seedhe naam dhoondho.</p>

<h3>3. Error message ko documentation ki tarah padho</h3>
<p>Errors bhi madad hain. Missing package bilkul batata hai ki kya missing hai:</p>
<pre class="out">AUTO01$ python3 -c "import nothere"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import nothere
<span class="hl">ModuleNotFoundError: No module named 'nothere'</span></pre>
<p>Neeche se padho: error type, phir wajah, phir kahan. Chapter 8 ise ek routine bana deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko subnet mein usable hosts ki ginti chahiye. Object banao, us par <code>dir()</code> chalao aur aisa seedha naam dhoondho jo sahi lage. Aapko <code>num_addresses</code> aur <code>hosts</code> jaise naam milenge. Jo chuna use <code>192.0.2.0/24</code> par try karo, phir official Python documentation mein module search karke confirm karo ki woh kya return karta hai.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli server par <code>python3 -c "help(len)"</code> ya <code>help(ipaddress)</code> poora manual page kholta hai; bahar nikalne ke liye <code>q</code> dabao. Kai tools ka manual bhi hota hai: <code>man ls</code>. Lab <code>help()</code> ke liye sirf chhota stub dikhata hai, isliye yahan <code>--help</code>, <code>type</code> aur <code>dir</code> use karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forum se command copy karna bina uske options padhe. <code>--help</code> chalane ki jagah option ke naam andaza lagana. Error ki sirf pehli line padhna. Maan lena ki lab ka <code>dir</code> output asli Python ke barabar hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Usage line mein square brackets ka matlab <i>optional</i> hai. <code>[-d DEVICES]</code> wala tool <code>-d</code> ke bina bhi chalta hai, apne default ke saath.</p></div>

<div class="scn"><h4>Kaunsa flag kya karta hai?</h4><p>Ek junior engineer ko backup script mili aur woh use chalane se darta tha. Uske senior ne kaha sirf <code>--help</code> chalao. Ek minute mein usne <code>--dry-run</code> option dekha, chalaya aur samjha ki kaunse devices chhue jayenge.</p><p><b>Lesson:</b> kisi bhi tool par pehla command uska help hai.</p></div>

<div class="iv"><p class="q">"Colleague se Python script mili. Devices par chalaye bina kaise jaanoge woh kya karti hai?"</p><p>File padhta hoon, options dekhne ke liye <code>--help</code> chalata hoon, <code>--dry-run</code> option ho to use karta hoon, aur lab device par test karta hoon. Code mein anjaan objects ke liye <code>type()</code> aur <code>dir()</code>, phir official documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--help</code> usage line aur options ki list print karta hai.</li>
<li>Square brackets optional; capital shabd wala option value leta hai.</li>
<li><code>type()</code> batata hai kya hai; <code>dir()</code> batata hai kya kar sakta hai.</li>
<li>Error messages documentation hain: neeche se upar padho.</li>
</ul></div>
`}};export{e as default};