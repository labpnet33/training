var e={id:`running-python`,h:{en:`Running Python: interpreter, scripts and virtual environments`,hi:`Python chalana: interpreter, scripts aur virtual environments`},body:{en:`
<p>There are two ways to talk to someone: a phone call, where each sentence gets an immediate reply, or a letter, where you write everything first and the reader goes through it top to bottom. Python offers both. The <b>interactive shell</b> is the phone call. A <b>script</b> is the letter.</p>

<h3>The interpreter</h3>
<p>Python is an <b>interpreted</b> language: you do not compile it into a separate program first. You hand your text to the <b>interpreter</b>, a program called <code>python3</code>, and it runs it. Always use Python 3. Python 2 reached end of life in 2020, and its syntax differs (for example, <code>print "hi"</code> without brackets is Python 2 and is a syntax error in Python 3).</p>
<pre class="code">AUTO&gt; python3 --version
Python 3.11.4</pre>

<h3>The interactive shell: try things instantly</h3>
<p>Type <code>python3</code> with no file name and you get the <b>&gt;&gt;&gt;</b> prompt, also called the <b>REPL</b> (read, evaluate, print, loop). Every line you type runs immediately and its value is printed. It is the best place to test one idea before you put it in a script.</p>
<pre class="out">AUTO&gt; python3
&gt;&gt;&gt; 2 ** (32 - 24) - 2
<span class="hl">254</span>
&gt;&gt;&gt; "GigabitEthernet0/1".startswith("Gig")
True
&gt;&gt;&gt; hostname = "R1"
&gt;&gt;&gt; hostname
'R1'
&gt;&gt;&gt; exit()</pre>
<p>Notice two details. <code>**</code> means "to the power of", so the first line computes the usable hosts in a /24. And typing a name alone shows its value with quotes (<code>'R1'</code>) because the shell shows the <b>representation</b>; <code>print(hostname)</code> would show <code>R1</code> without quotes.</p>

<h3>Scripts: files the interpreter reads top to bottom</h3>
<p>A <b>script</b> is a plain text file whose name ends in <code>.py</code>. You run it with <code>python3 file.py</code>. The interpreter first checks the whole file for grammar (<b>syntax</b>), then executes it from the first line to the last, unless a loop, a function call or an error changes the flow.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="How a script runs">
<rect x="20" y="50" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="14">collect.py</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">plain text file</text>
<rect x="245" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="14">python3</text><text x="330" y="82" text-anchor="middle" class="svg-muted" font-size="12">1. check syntax</text><text x="330" y="102" text-anchor="middle" class="svg-muted" font-size="12">2. run line 1, 2, 3...</text><text x="330" y="122" text-anchor="middle" class="svg-muted" font-size="12">3. stop at end or error</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">printed output</text>
<rect x="490" y="100" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="130" text-anchor="middle" class="svg-ink" font-size="13">traceback</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="415" y1="70" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><line x1="415" y1="100" x2="490" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The interpreter checks syntax first, then runs the file line by line. You get output, or a traceback that says where it stopped.</p></div>

<h3>Three grammar rules to know on day one</h3>
<ul>
<li><b>Indentation is grammar.</b> Python groups lines into blocks by indenting them, normally <b>4 spaces</b>. A line that ends in a colon (<code>if</code>, <code>for</code>, <code>def</code>) must be followed by an indented block. There are no curly braces or <code>end</code> keywords.</li>
<li><b>Comments</b> start with <code>#</code>. Everything after it on that line is ignored. A string in triple quotes right under a function is a <b>docstring</b>, a description of the function.</li>
<li><b>Case matters.</b> <code>Hostname</code> and <code>hostname</code> are two different names, and <code>Print()</code> is an error.</li>
</ul>
<pre class="code"># hello.py - my first script
hostname = "R1"
mgmt_ip = "10.99.0.1"
print("Device", hostname, "is at", mgmt_ip)</pre>
<pre class="out">AUTO&gt; python3 hello.py
<span class="hl">Device R1 is at 10.99.0.1</span></pre>
<p><code>print()</code> accepts several values separated by commas and puts one space between them.</p>

<h3>Virtual environments and pip</h3>
<p>Python's power comes from <b>libraries</b> (packages written by others) such as Netmiko or requests, installed with <b>pip</b>, Python's package installer. Different projects may need different versions of the same library. A <b>virtual environment</b> (venv) is a private folder holding one project's interpreter link and libraries, so projects do not break each other and you never touch the system Python.</p>
<pre class="code"><span class="c"># create and use a virtual environment (Linux or macOS)</span>
python3 -m venv .venv              <span class="c"># create the folder .venv</span>
source .venv/bin/activate          <span class="c"># activate it; the prompt shows (.venv)</span>
pip install netmiko requests       <span class="c"># install libraries into this venv only</span>
pip freeze &gt; requirements.txt      <span class="c"># record exact versions</span>
pip install -r requirements.txt    <span class="c"># rebuild the same set on another server</span>
deactivate                         <span class="c"># leave the venv</span></pre>
<p>On Windows the activate script is <code>.venv&#92;Scripts&#92;activate</code>.</p>

<h3>Working on the lab host</h3>
<p>The AUTO host in the labs has its own Python 3 interpreter and a few file commands, so you can read and repair scripts without an editor:</p>
<pre class="code">AUTO&gt; ls                                  <span class="c"># list files</span>
AUTO&gt; cat vlans.json                      <span class="c"># print a file</span>
AUTO&gt; nl collect.py                       <span class="c"># print with line numbers</span>
AUTO&gt; edit collect.py 12 def parse_brief(text):   <span class="c"># replace line 12</span>
AUTO&gt; insert collect.py 32     conn.save_config() <span class="c"># insert a new line 32</span>
AUTO&gt; sed -i 's/old/new/' collect.py      <span class="c"># replace text in every line</span>
AUTO&gt; python3 collect.py                  <span class="c"># run the script</span></pre>
<p>With <code>edit</code> and <code>insert</code>, everything after the line number becomes the line, <b>including leading spaces</b>, so type the indentation too.</p>

<div class="eg"><p><b>Worked example.</b> A script has 40 lines. Line 12 is <code>def parse_brief(text)</code> without the colon. You run it and get <code>SyntaxError: expected ':'</code> pointing at line 12. Did lines 1 to 11 run? <b>No.</b> Because the interpreter checks the syntax of the whole file before running anything, no line runs and no device is contacted. A runtime error such as a failed login on line 24, in contrast, happens after lines 1 to 23 have already run.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mixing tabs and spaces (the file looks fine but raises <code>TabError</code> or <code>IndentationError</code>); running <code>pip install</code> without activating the venv, so the library lands in a different Python; and typing <code>python</code> on a server where that name still points to Python 2 or does not exist.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blocks are defined by indentation, not by brackets. If a question shows two lines under an <code>if</code>, check whether the second one is indented at the same level; if it is not, it runs every time, not only when the condition is true.</p></div>

<div class="scn"><h4>Works on my laptop</h4><p>An engineer's inventory script ran perfectly on his laptop but failed on the shared jump server with <code>ModuleNotFoundError: No module named 'netmiko'</code>. On the laptop he had installed Netmiko inside a venv; on the jump server nobody had. The fix was to copy <code>requirements.txt</code> with the script, create a venv on the server, run <code>pip install -r requirements.txt</code>, and activate it in the cron job that runs the script.</p><p><b>Lesson:</b> a script and its libraries travel together; <code>requirements.txt</code> plus a venv makes the run repeatable anywhere.</p></div>

<div class="iv"><p class="q">"What is a Python virtual environment and why would you use one for network automation?"</p><p>Strong answer: a venv is an isolated directory with its own site-packages and a link to a Python interpreter. Each project gets exactly the library versions it was tested with, upgrading Netmiko for one project cannot break another, and you never modify the operating system's Python. Mention <code>python3 -m venv</code>, activation, <code>pip freeze &gt; requirements.txt</code>, and that CI pipelines and servers rebuild the same environment from that file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use <code>python3</code>; the <code>&gt;&gt;&gt;</code> shell runs one line at a time, a script runs a whole file.</li>
<li>The whole file is syntax-checked first; a SyntaxError means nothing ran at all.</li>
<li>Indentation (4 spaces) defines blocks; a colon starts a block; <code>#</code> starts a comment; names are case-sensitive.</li>
<li>Install libraries with pip inside a venv and record them in requirements.txt.</li>
<li>In the lab: <code>nl</code> to see line numbers, <code>edit</code>/<code>insert</code>/<code>sed</code> to fix, <code>python3 file.py</code> to run.</li>
</ul></div>
`,hi:`
<p>Kisi se baat karne ke do tarike hain: phone call, jahan har sentence ka turant jawab milta hai, ya letter, jahan aap pehle sab likhte ho aur padhne wala use upar se neeche padhta hai. Python dono deta hai. <b>Interactive shell</b> phone call hai. <b>Script</b> letter hai.</p>

<h3>Interpreter</h3>
<p>Python ek <b>interpreted</b> language hai: aapko pehle use alag program mein compile nahi karna padta. Aap apna text <b>interpreter</b> ko dete ho, jo <code>python3</code> naam ka program hai, aur woh use chala deta hai. Hamesha Python 3 use karo. Python 2 ka end of life 2020 mein ho gaya, aur uska syntax alag hai (jaise brackets ke bina <code>print "hi"</code> Python 2 hai aur Python 3 mein syntax error hai).</p>
<pre class="code">AUTO&gt; python3 --version
Python 3.11.4</pre>

<h3>Interactive shell: cheezein turant try karo</h3>
<p>File name ke bina <code>python3</code> type karo aur aapko <b>&gt;&gt;&gt;</b> prompt milta hai, jise <b>REPL</b> (read, evaluate, print, loop) bhi kehte hain. Aap jo line type karte ho woh turant chalti hai aur uski value print hoti hai. Kisi idea ko script mein daalne se pehle test karne ki yeh sabse achhi jagah hai.</p>
<pre class="out">AUTO&gt; python3
&gt;&gt;&gt; 2 ** (32 - 24) - 2
<span class="hl">254</span>
&gt;&gt;&gt; "GigabitEthernet0/1".startswith("Gig")
True
&gt;&gt;&gt; hostname = "R1"
&gt;&gt;&gt; hostname
'R1'
&gt;&gt;&gt; exit()</pre>
<p>Do details dekho. <code>**</code> ka matlab "power", isliye pehli line /24 ke usable hosts nikaalti hai. Aur sirf naam type karne par value quotes ke saath (<code>'R1'</code>) dikhti hai kyunki shell <b>representation</b> dikhata hai; <code>print(hostname)</code> bina quotes ke <code>R1</code> dikhata.</p>

<h3>Scripts: files jinhe interpreter upar se neeche padhta hai</h3>
<p><b>Script</b> ek plain text file hai jiska naam <code>.py</code> par khatam hota hai. Aap use <code>python3 file.py</code> se chalate ho. Interpreter pehle poori file ka grammar (<b>syntax</b>) check karta hai, phir pehli line se aakhri tak execute karta hai, jab tak koi loop, function call ya error flow na badle.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Script kaise chalta hai">
<rect x="20" y="50" width="150" height="70" rx="8" fill="#e2e8f0"/><text x="95" y="80" text-anchor="middle" class="svg-ink" font-size="14">collect.py</text><text x="95" y="100" text-anchor="middle" class="svg-muted" font-size="12">plain text file</text>
<rect x="245" y="30" width="170" height="110" rx="8" fill="#bae6fd"/><text x="330" y="58" text-anchor="middle" class="svg-ink" font-size="14">python3</text><text x="330" y="82" text-anchor="middle" class="svg-muted" font-size="12">1. syntax check</text><text x="330" y="102" text-anchor="middle" class="svg-muted" font-size="12">2. line 1, 2, 3... chalao</text><text x="330" y="122" text-anchor="middle" class="svg-muted" font-size="12">3. end ya error par ruko</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">printed output</text>
<rect x="490" y="100" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="130" text-anchor="middle" class="svg-ink" font-size="13">traceback</text>
<line x1="170" y1="85" x2="245" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="415" y1="70" x2="490" y2="45" stroke="#64748b" stroke-width="2"/><line x1="415" y1="100" x2="490" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Interpreter pehle syntax check karta hai, phir file line by line chalata hai. Aapko output milta hai, ya traceback jo batata hai kahan ruka.</p></div>

<h3>Pehle din ke teen grammar rules</h3>
<ul>
<li><b>Indentation hi grammar hai.</b> Python lines ko indent karke blocks mein group karta hai, normally <b>4 spaces</b>. Jo line colon par khatam ho (<code>if</code>, <code>for</code>, <code>def</code>), uske baad indented block aana zaroori hai. Koi curly braces ya <code>end</code> keywords nahi.</li>
<li><b>Comments</b> <code>#</code> se shuru hote hain. Us line par uske baad sab ignore hota hai. Function ke theek neeche triple quotes wala string <b>docstring</b> hai, function ka description.</li>
<li><b>Case matter karta hai.</b> <code>Hostname</code> aur <code>hostname</code> do alag naam hain, aur <code>Print()</code> error hai.</li>
</ul>
<pre class="code"># hello.py - mera pehla script
hostname = "R1"
mgmt_ip = "10.99.0.1"
print("Device", hostname, "is at", mgmt_ip)</pre>
<pre class="out">AUTO&gt; python3 hello.py
<span class="hl">Device R1 is at 10.99.0.1</span></pre>
<p><code>print()</code> comma se alag kai values leta hai aur unke beech ek space daalta hai.</p>

<h3>Virtual environments aur pip</h3>
<p>Python ki taakat <b>libraries</b> se aati hai (doosron ke likhe packages) jaise Netmiko ya requests, jo <b>pip</b> se install hote hain, Python ka package installer. Alag projects ko ek hi library ke alag versions chahiye ho sakte hain. <b>Virtual environment</b> (venv) ek private folder hai jisme ek project ka interpreter link aur libraries hoti hain, taaki projects ek doosre ko na todein aur aap system Python ko kabhi na chhuo.</p>
<pre class="code"><span class="c"># virtual environment banao aur use karo (Linux ya macOS)</span>
python3 -m venv .venv              <span class="c"># .venv folder banao</span>
source .venv/bin/activate          <span class="c"># activate karo; prompt (.venv) dikhata hai</span>
pip install netmiko requests       <span class="c"># libraries sirf is venv mein install</span>
pip freeze &gt; requirements.txt      <span class="c"># exact versions record karo</span>
pip install -r requirements.txt    <span class="c"># doosre server par same set dobara banao</span>
deactivate                         <span class="c"># venv se bahar</span></pre>
<p>Windows par activate script <code>.venv&#92;Scripts&#92;activate</code> hai.</p>

<h3>Lab host par kaam karna</h3>
<p>Labs ke AUTO host par apna Python 3 interpreter aur kuch file commands hain, taaki aap editor ke bina scripts padh aur repair kar sako:</p>
<pre class="code">AUTO&gt; ls                                  <span class="c"># files list karo</span>
AUTO&gt; cat vlans.json                      <span class="c"># file print karo</span>
AUTO&gt; nl collect.py                       <span class="c"># line numbers ke saath print</span>
AUTO&gt; edit collect.py 12 def parse_brief(text):   <span class="c"># line 12 replace karo</span>
AUTO&gt; insert collect.py 32     conn.save_config() <span class="c"># nayi line 32 insert karo</span>
AUTO&gt; sed -i 's/old/new/' collect.py      <span class="c"># har line mein text replace</span>
AUTO&gt; python3 collect.py                  <span class="c"># script chalao</span></pre>
<p><code>edit</code> aur <code>insert</code> mein line number ke baad sab kuch line ban jaata hai, <b>shuru ke spaces samet</b>, isliye indentation bhi type karo.</p>

<div class="eg"><p><b>Worked example.</b> Ek script mein 40 lines hain. Line 12 colon ke bina <code>def parse_brief(text)</code> hai. Aap chalate ho aur line 12 par <code>SyntaxError: expected ':'</code> milta hai. Kya lines 1 se 11 chali? <b>Nahi.</b> Kyunki interpreter kuch bhi chalane se pehle poori file ka syntax check karta hai, koi line nahi chalti aur kisi device se contact nahi hota. Iske ulat, line 24 par failed login jaisa runtime error lines 1 se 23 chal jaane ke baad hota hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Tabs aur spaces mix karna (file theek dikhti hai par <code>TabError</code> ya <code>IndentationError</code> deti hai); venv activate kiye bina <code>pip install</code> chalana, jisse library kisi aur Python mein chali jaati hai; aur aise server par <code>python</code> type karna jahan woh naam abhi bhi Python 2 ki taraf point karta hai ya exist hi nahi karta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blocks indentation se define hote hain, brackets se nahi. Agar question mein <code>if</code> ke neeche do lines hain, check karo ki doosri line same level par indented hai ya nahi; agar nahi, to woh har baar chalti hai, sirf condition true hone par nahi.</p></div>

<div class="scn"><h4>Mere laptop par to chalta hai</h4><p>Ek engineer ka inventory script uske laptop par perfect chalta tha par shared jump server par <code>ModuleNotFoundError: No module named 'netmiko'</code> ke saath fail hota tha. Laptop par usne Netmiko ek venv mein install kiya tha; jump server par kisi ne nahi kiya tha. Fix tha script ke saath <code>requirements.txt</code> copy karna, server par venv banana, <code>pip install -r requirements.txt</code> chalana, aur script chalane wale cron job mein use activate karna.</p><p><b>Seekh:</b> script aur uski libraries saath travel karti hain; <code>requirements.txt</code> plus venv run ko kahin bhi repeatable banata hai.</p></div>

<div class="iv"><p class="q">"Python virtual environment kya hai aur network automation ke liye aap ise kyun use karoge?"</p><p>Strong answer: venv ek isolated directory hai jisme apne site-packages aur ek Python interpreter ka link hota hai. Har project ko exactly wahi library versions milte hain jinke saath woh test hua, ek project ke liye Netmiko upgrade karne se doosra nahi tootta, aur aap operating system ka Python kabhi modify nahi karte. <code>python3 -m venv</code>, activation, <code>pip freeze &gt; requirements.txt</code> batao, aur yeh ki CI pipelines aur servers usi file se same environment dobara banate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>python3</code> use karo; <code>&gt;&gt;&gt;</code> shell ek line ek baar chalata hai, script poori file.</li>
<li>Poori file pehle syntax-check hoti hai; SyntaxError ka matlab kuch bhi nahi chala.</li>
<li>Indentation (4 spaces) blocks define karta hai; colon block shuru karta hai; <code>#</code> comment shuru karta hai; naam case-sensitive hain.</li>
<li>Libraries venv ke andar pip se install karo aur requirements.txt mein record karo.</li>
<li>Lab mein: line numbers ke liye <code>nl</code>, fix ke liye <code>edit</code>/<code>insert</code>/<code>sed</code>, chalane ke liye <code>python3 file.py</code>.</li>
</ul></div>
`}};export{e as default};