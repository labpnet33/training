var e={id:`running-safely`,h:{en:`Running a script safely: arguments, main and a dry run`,hi:`Script safely chalana: arguments, main aur dry run`},body:{en:`
<p><b>The idea of this chapter:</b> a script that touches routers should never surprise you. You will learn how a script receives what you type, how it decides "I was started directly", and why a <b>dry run</b> is the best habit a network engineer can build.</p>

<h3>Analogy: a flight checklist</h3>
<p>A pilot reads the checklist on the ground, not in the air. A dry run is that checklist: the tool prints what it <i>would</i> do and does nothing. Only after the printout looks right do you run it for real.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Read the script, dry run, real run, check exit code">
<rect x="10" y="30" width="135" height="60" rx="10" fill="#bae6fd"/><text x="77" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Read it</text><text x="77" y="74" text-anchor="middle" class="svg-muted" font-size="10">cat, understand</text>
<rect x="170" y="30" width="135" height="60" rx="10" fill="#fde68a"/><text x="237" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Dry run</text><text x="237" y="74" text-anchor="middle" class="svg-muted" font-size="10">prints, changes nothing</text>
<rect x="330" y="30" width="135" height="60" rx="10" fill="#ddd6fe"/><text x="397" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Real run</text><text x="397" y="74" text-anchor="middle" class="svg-muted" font-size="10">small scope first</text>
<rect x="490" y="30" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="557" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Exit code</text><text x="557" y="74" text-anchor="middle" class="svg-muted" font-size="10">0 good, else check</text>
<line x1="145" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="305" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="465" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four habits before and after any run.</p></div>

<h3>How a script receives your words: sys.argv</h3>
<p>The file <code>args.py</code> has two lines:</p>
<pre class="code">import sys

print(sys.argv)
print(len(sys.argv))</pre>
<ul>
<li><code>import sys</code> loads the standard module that talks to the interpreter.</li>
<li><code>sys.argv</code> is a <b>list</b>: the script name followed by everything you typed after it.</li>
<li><code>len(...)</code> counts the items in a list.</li>
</ul>
<pre class="out">AUTO01$ python3 args.py a b
<span class="hl">['args.py', 'a', 'b']</span>
<span class="hl">3</span></pre>
<p>Square brackets mean a list, and each item is in quotes because it is text. Item 0 is always the script name, so the first real argument is item 1. Chapter 5 shows <code>argparse</code>, which does this job properly with help text and error messages.</p>

<h3>"Was I started directly?": __name__</h3>
<p>The file <code>main.py</code>:</p>
<pre class="code">def greet(name):
    return f"hello {name}"

if __name__ == "__main__":
    print(greet("R1"))
print(__name__)</pre>
<ul>
<li><code>def greet(name):</code> defines a small reusable action called a function. The indented line is its body, and <code>return</code> hands back a result.</li>
<li><code>f"hello {name}"</code> is an f-string: the text inside the curly braces is replaced by the value.</li>
<li>Python sets a built-in name, <code>__name__</code>, to <code>"__main__"</code> when the file is run directly. When another file imports this one, it is the module's name instead.</li>
<li>So the <code>if</code> line means "only do this when I am the program being started".</li>
</ul>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">hello R1</span>
<span class="hl">__main__</span></pre>
<p>Both lines printed because the file was started directly. This pattern lets you reuse the functions elsewhere without the program running by accident.</p>

<h3>The dry run in the lab tool</h3>
<p>The lab's <code>netbackup.py</code> has a <code>--dry-run</code> option. It lists what it would back up and touches no router:</p>
<pre class="out">AUTO01$ python3 netbackup.py --dry-run
would save PUN-CORE-R1 (10.99.0.1) to backups/2026-09-29/PUN-CORE-R1.cfg
would save BLR-EDGE-R2 (10.99.0.2) to backups/2026-09-29/BLR-EDGE-R2.cfg
would save HYD-EDGE-R3 (10.99.0.3) to backups/2026-09-29/HYD-EDGE-R3.cfg
<span class="hl">0 saved, 0 failed</span></pre>
<p>You see the three devices, their addresses and the exact file names, and the counters stay at zero. If one address were wrong, you would spot it here, before any connection.</p>

<h3>Exit codes: the script's verdict</h3>
<p>Every program ends with a number: <b>0</b> for success, anything else for a problem. The shell keeps the last one in <code>$?</code>. Typing a wrong option shows a non-zero code:</p>
<pre class="out">AUTO01$ python3 netbackup.py --bogus; echo "rc=$?"
usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]
netbackup.py: error: unrecognized arguments: --bogus
<span class="hl">rc=2</span></pre>
<p>Code 2 is the conventional "bad command line". Cron, monitoring and other scripts read this number, which is why a good tool exits with 1 when something failed (you will see that in chapter 8).</p>

<div class="eg"><p><b>Worked example.</b> A new script arrives by email. Before running: <code>cat</code> it and read every line; check which files and addresses it touches; run it with a dry run or against a lab device; only then run it on one real device and check <code>echo $?</code>.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> To run a script as <code>./netbackup.py</code>, the first line must be <code>#!/usr/bin/env python3</code> and the file needs <code>chmod +x netbackup.py</code>. The lab's file already has both.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running a script you have not read. Skipping the dry run on a change script. Ignoring the exit code. Testing against production first instead of a lab device.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sys.argv[0]</code> is the script name, not the first argument. And <code>__name__ == "__main__"</code> is true only when the file is run directly, not when imported.</p></div>

<div class="scn"><h4>The script that "only listed" devices</h4><p>An engineer ran a shared cleanup script to "see what it does". It had no dry run and deleted old interface descriptions on twenty devices. The team added a <code>--dry-run</code> option to every change script and made it the default in their training labs.</p><p><b>Lesson:</b> make "show me first" the easiest path.</p></div>

<div class="iv"><p class="q">"How do you make a script safe to run?"</p><p>I read it first, offer a dry run that only prints, test on a lab or a single device, check the exit code, and keep credentials out of the file. A <code>--dry-run</code> option is the most useful single feature.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sys.argv</code> is a list; item 0 is the script name.</li>
<li><code>if __name__ == "__main__":</code> runs code only when the file starts directly.</li>
<li>A dry run prints what would happen and changes nothing.</li>
<li>Exit code 0 is success; 2 is a bad command line; others mean a problem.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script routers ko chhuti hai woh kabhi aapko hairan nahi karni chahiye. Aap seekhoge ki script aapke type kiye shabd kaise receive karti hai, woh kaise decide karti hai "mujhe seedha shuru kiya gaya", aur <b>dry run</b> network engineer ki sabse achhi aadat kyon hai.</p>

<h3>Analogy: flight checklist</h3>
<p>Pilot checklist zameen par padhta hai, hawa mein nahi. Dry run wahi checklist hai: tool print karta hai ki woh <i>kya karega</i> aur kuch karta nahi. Printout theek lage tabhi asli run chalate ho.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Script padho, dry run, asli run, exit code check">
<rect x="10" y="30" width="135" height="60" rx="10" fill="#bae6fd"/><text x="77" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Padho</text><text x="77" y="74" text-anchor="middle" class="svg-muted" font-size="10">cat, samjho</text>
<rect x="170" y="30" width="135" height="60" rx="10" fill="#fde68a"/><text x="237" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Dry run</text><text x="237" y="74" text-anchor="middle" class="svg-muted" font-size="10">print, kuch nahi badalta</text>
<rect x="330" y="30" width="135" height="60" rx="10" fill="#ddd6fe"/><text x="397" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Asli run</text><text x="397" y="74" text-anchor="middle" class="svg-muted" font-size="10">pehle chhota scope</text>
<rect x="490" y="30" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="557" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Exit code</text><text x="557" y="74" text-anchor="middle" class="svg-muted" font-size="10">0 achha, warna dekho</text>
<line x1="145" y1="60" x2="170" y2="60" stroke="#64748b" stroke-width="2"/><line x1="305" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="465" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har run se pehle aur baad ki chaar aadatein.</p></div>

<h3>Script aapke shabd kaise receive karti hai: sys.argv</h3>
<p><code>args.py</code> file mein do lines hain:</p>
<pre class="code">import sys

print(sys.argv)
print(len(sys.argv))</pre>
<ul>
<li><code>import sys</code> woh standard module load karta hai jo interpreter se baat karta hai.</li>
<li><code>sys.argv</code> ek <b>list</b> hai: script ka naam aur uske baad jo bhi aapne type kiya.</li>
<li><code>len(...)</code> list ke items gintha hai.</li>
</ul>
<pre class="out">AUTO01$ python3 args.py a b
<span class="hl">['args.py', 'a', 'b']</span>
<span class="hl">3</span></pre>
<p>Square brackets ka matlab list hai, aur har item quotes mein hai kyunki woh text hai. Item 0 hamesha script ka naam hota hai, isliye pehla asli argument item 1 hai. Chapter 5 <code>argparse</code> dikhata hai, jo yeh kaam help text aur error messages ke saath theek se karta hai.</p>

<h3>"Kya mujhe seedha shuru kiya gaya?": __name__</h3>
<p>File <code>main.py</code>:</p>
<pre class="code">def greet(name):
    return f"hello {name}"

if __name__ == "__main__":
    print(greet("R1"))
print(__name__)</pre>
<ul>
<li><code>def greet(name):</code> ek chhota reusable kaam define karta hai jise function kehte hain. Indented line uski body hai, aur <code>return</code> result wapas deta hai.</li>
<li><code>f"hello {name}"</code> f-string hai: curly braces ke andar ka text value se badal jaata hai.</li>
<li>Jab file seedha chalayi jaati hai to Python ek built-in naam, <code>__name__</code>, ko <code>"__main__"</code> set karta hai. Doosri file isse import kare to wahan module ka naam hota hai.</li>
<li>Isliye <code>if</code> line ka matlab hai "yeh tabhi karo jab main hi shuru kiya gaya program hun".</li>
</ul>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">hello R1</span>
<span class="hl">__main__</span></pre>
<p>Dono lines print huin kyunki file seedha chalayi gayi. Is pattern se aap functions ko kahin aur reuse kar sakte ho bina program galti se chale.</p>

<h3>Lab tool mein dry run</h3>
<p>Lab ke <code>netbackup.py</code> mein <code>--dry-run</code> option hai. Woh batata hai ki kya backup karega aur kisi router ko nahi chhuta:</p>
<pre class="out">AUTO01$ python3 netbackup.py --dry-run
would save PUN-CORE-R1 (10.99.0.1) to backups/2026-09-29/PUN-CORE-R1.cfg
would save BLR-EDGE-R2 (10.99.0.2) to backups/2026-09-29/BLR-EDGE-R2.cfg
would save HYD-EDGE-R3 (10.99.0.3) to backups/2026-09-29/HYD-EDGE-R3.cfg
<span class="hl">0 saved, 0 failed</span></pre>
<p>Aapko teen devices, unke addresses aur exact file names dikhte hain, aur counters zero rehte hain. Koi address galat hota to yahin dikh jaata, kisi connection se pehle.</p>

<h3>Exit codes: script ka faisla</h3>
<p>Har program ek number par khatam hota hai: safalta ke liye <b>0</b>, kisi problem ke liye koi aur. Shell aakhri number <code>$?</code> mein rakhta hai. Galat option type karne par non-zero code dikhta hai:</p>
<pre class="out">AUTO01$ python3 netbackup.py --bogus; echo "rc=$?"
usage: netbackup.py [-h] [-d DEVICES] [-o OUTDIR] [-n] [-v]
netbackup.py: error: unrecognized arguments: --bogus
<span class="hl">rc=2</span></pre>
<p>Code 2 "galat command line" ke liye convention hai. Cron, monitoring aur doosri scripts yeh number padhte hain, isliye achha tool kuch fail hone par 1 se exit karta hai (chapter 8 mein dekhoge).</p>

<div class="eg"><p><b>Worked example.</b> Nayi script email se aayi. Chalane se pehle: use <code>cat</code> karo aur har line padho; dekho woh kaunsi files aur addresses ko chhuti hai; dry run ya lab device par chalao; tab ek asli device par chalao aur <code>echo $?</code> check karo.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Script ko <code>./netbackup.py</code> ki tarah chalane ke liye pehli line <code>#!/usr/bin/env python3</code> honi chahiye aur file ko <code>chmod +x netbackup.py</code> chahiye. Lab ki file mein dono pehle se hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Bina padhi script chalana. Change script par dry run chhod dena. Exit code ko ignore karna. Lab device ke bajaye pehle production par test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>sys.argv[0]</code> script ka naam hai, pehla argument nahi. Aur <code>__name__ == "__main__"</code> tabhi true hai jab file seedha chalayi jaye, import hone par nahi.</p></div>

<div class="scn"><h4>Script jo "sirf list" karti thi</h4><p>Ek engineer ne shared cleanup script "dekhne ke liye ki kya karti hai" chalayi. Usme dry run nahi tha aur usne bees devices par purane interface descriptions delete kar diye. Team ne har change script mein <code>--dry-run</code> option joda aur training labs mein use default banaya.</p><p><b>Lesson:</b> "pehle dikhao" ko sabse aasaan raasta banao.</p></div>

<div class="iv"><p class="q">"Script ko run karne ke liye safe kaise banate ho?"</p><p>Pehle padhta hoon, ek dry run deta hoon jo sirf print kare, lab ya ek device par test karta hoon, exit code check karta hoon, aur credentials file se bahar rakhta hoon. <code>--dry-run</code> option sabse kaam ka single feature hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sys.argv</code> list hai; item 0 script ka naam hai.</li>
<li><code>if __name__ == "__main__":</code> code tabhi chalata hai jab file seedha shuru ho.</li>
<li>Dry run print karta hai ki kya hoga aur kuch nahi badalta.</li>
<li>Exit code 0 safalta; 2 galat command line; baaki problem.</li>
</ul></div>
`}};export{e as default};