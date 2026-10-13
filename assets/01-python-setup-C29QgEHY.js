var e={id:`python-setup`,h:{en:`What you will learn, and your first look at Python on the server`,hi:`Aap kya seekhoge, aur server par Python ki pehli jhalak`},body:{en:`
<p><b>The idea of this chapter:</b> before you write anything, learn to <i>ask the machine</i> two questions: "which Python do I have?" and "what is installed for it?". A network engineer who can answer these in ten seconds saves hours of confusion later.</p>

<h3>What you will learn in this module</h3>
<ul>
<li>Check Python and its packages, and keep each project in its own <b>virtual environment</b>.</li>
<li>Lay out a project so anyone can find the script, the data and the output.</li>
<li>Run a script safely: arguments, a dry run and meaningful exit codes.</li>
<li>Read documentation and error messages without panic.</li>
<li>Add options with <b>argparse</b>, a log file with <b>logging</b>, and a schedule with <b>cron</b>.</li>
<li>Debug a script step by step.</li>
</ul>

<h3>Prerequisites</h3>
<p>You need to type commands in a terminal and know <code>cd</code>, <code>ls</code> and <code>cat</code>. You do <b>not</b> need to have written code before; every line in this module is explained. If you have done the Bash module, the idea of "a text file of commands" will feel familiar.</p>

<h3>Analogy: a new tool in the toolbox</h3>
<p>Python is a very patient assistant. It reads your text file from the top, one line at a time, and does exactly what each line says. It never guesses. If a line is wrong it stops and tells you which line. The program that reads your file is called the <b>interpreter</b>, and on Linux it is usually started with the command <code>python3</code>.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Your file is read by the interpreter and produces output">
<rect x="20" y="30" width="150" height="62" rx="10" fill="#bae6fd"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="13">script.py</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="11">plain text you wrote</text>
<rect x="245" y="30" width="150" height="62" rx="10" fill="#fde68a"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">python3</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">the interpreter</text>
<rect x="470" y="30" width="150" height="62" rx="10" fill="#bbf7d0"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="13">output</text><text x="545" y="76" text-anchor="middle" class="svg-muted" font-size="11">text, files, exit code</text>
<line x1="170" y1="61" x2="245" y2="61" stroke="#64748b" stroke-width="2"/><line x1="395" y1="61" x2="470" y2="61" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">You write the file; the interpreter runs it.</p></div>

<h3>Question 1: which Python?</h3>
<pre class="code">python3 --version
which python3</pre>
<p><code>--version</code> prints the version and exits. <code>which</code> prints the full path of the program that would run when you type that name.</p>
<pre class="out">AUTO01$ python3 --version
<span class="hl">Python 3.12.0 (NK-OS lab interpreter)</span>
AUTO01$ which python3
<span class="hl">/usr/bin/python3</span></pre>
<p>The lab prints its own tag after the version number; a real server prints just the number, for example <code>Python 3.12.3</code>. Why does the path matter? Later you will see that a virtual environment changes which <code>python3</code> runs, and <code>which</code> proves it.</p>

<h3>Question 2: what is installed?</h3>
<pre class="code">pip list</pre>
<p><code>pip</code> is the installer that comes with Python. <code>pip list</code> shows the extra packages (add-on libraries) available.</p>
<pre class="out">AUTO01$ pip list
Package    Version
---------- ---------
<span class="hl">nkmiko     4.3.0-nk</span>
<span class="hl">jinja2     3.1.4</span>
(standard library: json, re, csv, ipaddress, datetime, argparse, logging, time, math, os, sys, pprint, random)</pre>
<p>Two add-ons are installed: <code>nkmiko</code> (the lab's SSH library for network devices) and <code>jinja2</code> (templates). The last line lists the <b>standard library</b>, the modules that ship with Python itself. <code>argparse</code>, <code>logging</code> and <code>datetime</code> are in it, which is why this module needs no installation.</p>

<div class="eg"><p><b>Worked example.</b> A colleague says "your script fails on my laptop". Ask for two outputs: <code>python3 --version</code> and <code>pip list</code>. Nine times out of ten the version or a missing package explains it.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> On a real Linux server you may need <code>python3 -m pip list</code> if <code>pip</code> alone is not found. Installing packages (<code>pip install</code>) is not simulated here; chapter 2 explains how to do it safely.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>python</code> when only <code>python3</code> exists. Assuming the laptop and the server have the same version. Installing packages system-wide with administrator rights; use a virtual environment instead.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pip</code> installs <i>packages</i>; the standard library needs no installing. Questions often list <code>argparse</code> or <code>logging</code> as something to install, which is wrong.</p></div>

<div class="scn"><h4>Works on my machine</h4><p>A backup script ran for months on one server, then failed on a new one with "No module named" an add-on. Nobody had recorded which packages the script needed. After that the team kept a short list of requirements next to every script, so a new server was ready in minutes.</p><p><b>Lesson:</b> write down which Python and which packages a tool needs.</p></div>

<div class="iv"><p class="q">"How do you check what Python environment a script will run in?"</p><p>I run <code>python3 --version</code> for the version, <code>which python3</code> for the path, and <code>pip list</code> for the installed packages. If a virtual environment is active, the path points inside it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The interpreter, <code>python3</code>, runs your text file line by line.</li>
<li><code>python3 --version</code>, <code>which python3</code> and <code>pip list</code> answer "what do I have?".</li>
<li>The standard library ships with Python; packages come from pip.</li>
<li>Always record the version and package list a tool needs.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kuch likhne se pehle machine se do sawal poochna seekho: "mere paas kaunsa Python hai?" aur "uske liye kya install hai?". Jo network engineer yeh dus second mein bata sake, woh baad mein ghanton ki uljhan bacha leta hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Python aur uske packages check karna, aur har project ko apne <b>virtual environment</b> mein rakhna.</li>
<li>Project ko aise sajaana ki koi bhi script, data aur output dhoondh sake.</li>
<li>Script safely chalana: arguments, dry run aur matlab wale exit codes.</li>
<li>Documentation aur error messages ko bina ghabraye padhna.</li>
<li><b>argparse</b> se options, <b>logging</b> se log file, aur <b>cron</b> se schedule jodna.</li>
<li>Script ko step by step debug karna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko terminal mein commands type karne aane chahiye aur <code>cd</code>, <code>ls</code> aur <code>cat</code> pata hon. Aapko pehle code likha hona <b>zaroori nahi</b>; is module ki har line samjhayi gayi hai. Agar aapne Bash module kiya hai to "commands ki text file" ka idea jaana-pehchana lagega.</p>

<h3>Analogy: toolbox mein naya tool</h3>
<p>Python bahut dhairya wala assistant hai. Woh aapki text file ko upar se, ek-ek line karke padhta hai aur har line jo kehti hai bilkul wahi karta hai. Woh andaza nahi lagata. Line galat ho to ruk jaata hai aur batata hai kaunsi line. Jo program aapki file padhta hai use <b>interpreter</b> kehte hain, aur Linux par ise aksar <code>python3</code> command se shuru karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Aapki file interpreter padhta hai aur output deta hai">
<rect x="20" y="30" width="150" height="62" rx="10" fill="#bae6fd"/><text x="95" y="57" text-anchor="middle" class="svg-ink" font-size="13">script.py</text><text x="95" y="76" text-anchor="middle" class="svg-muted" font-size="11">aapki likhi text</text>
<rect x="245" y="30" width="150" height="62" rx="10" fill="#fde68a"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">python3</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="11">interpreter</text>
<rect x="470" y="30" width="150" height="62" rx="10" fill="#bbf7d0"/><text x="545" y="57" text-anchor="middle" class="svg-ink" font-size="13">output</text><text x="545" y="76" text-anchor="middle" class="svg-muted" font-size="11">text, files, exit code</text>
<line x1="170" y1="61" x2="245" y2="61" stroke="#64748b" stroke-width="2"/><line x1="395" y1="61" x2="470" y2="61" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">File aap likhte ho; interpreter use chalata hai.</p></div>

<h3>Sawal 1: kaunsa Python?</h3>
<pre class="code">python3 --version
which python3</pre>
<p><code>--version</code> version print karke exit hota hai. <code>which</code> us program ka poora path batata hai jo woh naam type karne par chalega.</p>
<pre class="out">AUTO01$ python3 --version
<span class="hl">Python 3.12.0 (NK-OS lab interpreter)</span>
AUTO01$ which python3
<span class="hl">/usr/bin/python3</span></pre>
<p>Lab version number ke baad apna tag print karta hai; asli server sirf number print karta hai, jaise <code>Python 3.12.3</code>. Path kyon zaroori hai? Aage dekhoge ki virtual environment <code>python3</code> ko badal deta hai, aur <code>which</code> yeh saabit karta hai.</p>

<h3>Sawal 2: kya install hai?</h3>
<pre class="code">pip list</pre>
<p><code>pip</code> Python ke saath aane wala installer hai. <code>pip list</code> extra packages (add-on libraries) dikhata hai.</p>
<pre class="out">AUTO01$ pip list
Package    Version
---------- ---------
<span class="hl">nkmiko     4.3.0-nk</span>
<span class="hl">jinja2     3.1.4</span>
(standard library: json, re, csv, ipaddress, datetime, argparse, logging, time, math, os, sys, pprint, random)</pre>
<p>Do add-ons installed hain: <code>nkmiko</code> (network devices ke liye lab ki SSH library) aur <code>jinja2</code> (templates). Aakhri line <b>standard library</b> ki list hai, yaani woh modules jo Python ke saath hi aate hain. <code>argparse</code>, <code>logging</code> aur <code>datetime</code> usme hain, isliye is module ko kisi installation ki zaroorat nahi.</p>

<div class="eg"><p><b>Worked example.</b> Colleague kehta hai "tumhari script mere laptop par fail hoti hai". Do outputs maango: <code>python3 --version</code> aur <code>pip list</code>. Dus mein se nau baar version ya missing package wajah nikalti hai.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli Linux server par agar <code>pip</code> akela na mile to <code>python3 -m pip list</code> chalana pad sakta hai. Packages install karna (<code>pip install</code>) yahan simulate nahi hota; chapter 2 batata hai ise safely kaise karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Jab sirf <code>python3</code> maujood ho tab <code>python</code> type karna. Maan lena ki laptop aur server ka version same hai. Administrator rights se packages system-wide install karna; uski jagah virtual environment use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>pip</code> <i>packages</i> install karta hai; standard library ko install nahi karna padta. Sawal aksar <code>argparse</code> ya <code>logging</code> ko install karne wali cheez bata dete hain, jo galat hai.</p></div>

<div class="scn"><h4>Meri machine par to chalta hai</h4><p>Ek backup script mahino ek server par chali, phir naye server par add-on ke "No module named" error se fail hui. Kisi ne record nahi kiya tha ki script ko kaunse packages chahiye. Uske baad team ne har script ke paas requirements ki chhoti list rakhi, taaki naya server minutes mein ready ho jaye.</p><p><b>Lesson:</b> likh kar rakho ki tool ko kaunsa Python aur kaunse packages chahiye.</p></div>

<div class="iv"><p class="q">"Script kis Python environment mein chalegi, yeh kaise check karte ho?"</p><p>Version ke liye <code>python3 --version</code>, path ke liye <code>which python3</code>, aur installed packages ke liye <code>pip list</code>. Virtual environment active ho to path uske andar ka dikhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interpreter, <code>python3</code>, aapki text file line by line chalata hai.</li>
<li><code>python3 --version</code>, <code>which python3</code> aur <code>pip list</code> "mere paas kya hai?" ka jawab dete hain.</li>
<li>Standard library Python ke saath aati hai; packages pip se aate hain.</li>
<li>Tool ko jo version aur package list chahiye woh hamesha record karo.</li>
</ul></div>
`}};export{e as default};