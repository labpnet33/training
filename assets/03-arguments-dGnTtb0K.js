var e={id:`arguments`,h:{en:`Arguments: giving a script its input`,hi:`Arguments: script ko input dena`},body:{en:`
<p><b>The idea of this chapter:</b> instead of editing the script every time the device list changes, you pass the list name when you run it: <code>./checknet.sh branch.txt</code>. The values you type after the script name are called <b>arguments</b>.</p>

<h3>Analogy: a vending machine with buttons</h3>
<p>A vending machine does the same job every time, but you press different buttons to choose the drink. The script is the machine; the arguments are the buttons. One script, many uses.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Arguments passed to a script">
<rect x="20" y="55" width="260" height="50" rx="10" fill="#fde68a"/><text x="150" y="86" text-anchor="middle" class="svg-ink" font-size="13">./checknet.sh branch.txt extra</text>
<line x1="280" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="20" width="290" height="30" rx="6" fill="#bae6fd"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="12">$0 = ./checknet.sh   (script name)</text>
<rect x="330" y="55" width="290" height="30" rx="6" fill="#bbf7d0"/><text x="475" y="75" text-anchor="middle" class="svg-ink" font-size="12">$1 = branch.txt   $2 = extra</text>
<rect x="330" y="90" width="290" height="30" rx="6" fill="#ddd6fe"/><text x="475" y="110" text-anchor="middle" class="svg-ink" font-size="12">$# = 2 (how many)   $@ = all of them</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">bash fills these special variables before the script starts</text>
</svg><p class="cap">The words after the script name arrive in $1, $2 and so on.</p></div>

<h3>The special variables</h3>
<table class="cmp"><tr><th>Variable</th><th>Meaning</th></tr>
<tr><td><code>$0</code></td><td>the name the script was started with</td></tr>
<tr><td><code>$1</code>, <code>$2</code> ... <code>$9</code></td><td>the first, second ... ninth argument</td></tr>
<tr><td><code>$#</code></td><td>how many arguments were given</td></tr>
<tr><td><code>$@</code></td><td>all the arguments</td></tr>
<tr><td><code>$?</code></td><td>exit code of the last command (chapter 6)</td></tr></table>
<p>Here is a tiny script, <code>arg.sh</code>, and its real output in the lab:</p>
<pre class="code">#!/bin/bash
echo "script name: $0"
echo "argument count: $#"
echo "first: $1"
echo "second: $2"
echo "all: $@"</pre>
<pre class="out">AUTO01$ ./arg.sh a.txt b.txt
script name: ./arg.sh
argument count: 2
first: a.txt
second: b.txt
all: a.txt b.txt
AUTO01$ ./arg.sh
script name: ./arg.sh
<span class="hl">argument count: 0</span>
first:
second:
all:</pre>
<p>Notice the second run: no arguments, so <code>$1</code> is empty. A script that needs an argument must check for that. You will use <code>if</code> next chapter, but you can already read this pattern.</p>

<h3>A script that checks its own input</h3>
<pre class="code">#!/bin/bash
if [ $# -lt 1 ]; then
  echo "usage: $0 listfile"
  exit 2
fi
if [ ! -f "$1" ]; then
  echo "error: $1 not found"
  exit 3
fi
echo "reading $1"
exit 0</pre>
<p>Line by line: <code>[ $# -lt 1 ]</code> asks "is the number of arguments less than 1?". If so, print a <b>usage</b> message (how to run me) and <code>exit 2</code>, which stops the script and reports failure code 2. The second test <code>[ ! -f "$1" ]</code> asks "is the first argument <i>not</i> an existing regular file?". Only when both checks pass does the script do its work and exit with 0, which means success. Real lab output:</p>
<pre class="out">AUTO01$ ./use.sh; echo "exit code: $?"
usage: ./use.sh listfile
<span class="hl">exit code: 2</span>
AUTO01$ ./use.sh nothere.txt; echo "exit code: $?"
error: nothere.txt not found
<span class="hl">exit code: 3</span>
AUTO01$ ./use.sh devices.txt; echo "exit code: $?"
reading devices.txt
<span class="hl">exit code: 0</span></pre>
<p>Different failures get different codes. A person reads the message; another script or cron reads the number.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Real scripts print errors on <i>standard error</i> so they do not mix into saved reports: <code>echo "usage: $0 listfile" 1&gt;&amp;2</code>. When a script takes many arguments, <code>shift</code> drops the first one so that <code>$1</code> becomes the old second argument, and <code>"$@"</code> (in quotes) hands every argument on safely, keeping spaces inside each one. The lab shell does not run these two features, so test them on a real Linux host.</p></div>

<div class="eg"><p><b>Worked example.</b> One reachability script, three lists: <code>./checknet.sh devices.txt</code> for the core, <code>./checknet.sh branch.txt</code> for Bengaluru, <code>./checknet.sh lab.txt</code> for the lab. The script never changes; only the argument does. When the list file is missing, the script says so and exits with a clear code instead of printing confusing errors.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>$1</code> without checking it exists. Writing <code>$10</code> for a tenth argument (Bash reads it as <code>$1</code> followed by <code>0</code>). Forgetting that arguments are separated by spaces, so a name with a space needs quotes when you type it: <code>./check.sh "my list.txt"</code>. Printing the usage text and then continuing to run instead of exiting.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>$#</code> is the <i>count</i> of arguments, <code>$@</code> is the arguments themselves, and <code>$0</code> is the script, not the first argument. Also, <code>exit 0</code> means success and a non-zero number means failure, the opposite of "true is 1" in many programming languages.</p></div>

<div class="scn"><h4>The script that deleted the wrong folder</h4><p>An engineer's clean-up script used <code>rm -r $1/old</code>. A colleague ran it with no argument by mistake. <code>$1</code> was empty, so the command became <code>rm -r /old</code>. Nothing was lost that day, but only because <code>/old</code> did not exist. The team added a check at the top: if there is no argument, print the usage and <code>exit 2</code>.</p><p><b>Lesson:</b> validate arguments before the script touches anything, and quote every variable.</p></div>

<div class="iv"><p class="q">"How does a Bash script receive input from the command line?"</p><p>Through positional parameters: <code>$1</code>, <code>$2</code> and so on, with <code>$#</code> as the count and <code>"$@"</code> as the full list; <code>$0</code> is the script name. A good answer adds that you must validate them, print a usage message and exit with a non-zero code when input is missing, and read user-supplied values only after quoting them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Arguments arrive in <code>$1</code>, <code>$2</code>, ...; <code>$#</code> counts them; <code>$0</code> is the script name.</li>
<li>Always check that a required argument exists and that its file is real.</li>
<li>Print a usage message and <code>exit</code> with a non-zero code on bad input.</li>
<li>Quote <code>"$1"</code> so spaces and empty values cannot break commands.</li>
<li>Exit code 0 means success; any other number means a problem.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> device list badalne par har baar script edit karne ki jagah, aap script chalate waqt list ka naam dete ho: <code>./checknet.sh branch.txt</code>. Script ke naam ke baad jo values type karte ho unhe <b>arguments</b> kehte hain.</p>

<h3>Analogy: buttons wali vending machine</h3>
<p>Vending machine har baar wahi kaam karti hai, par aap alag buttons dabakar drink choose karte ho. Script machine hai; arguments buttons hain. Ek script, kai use.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Script ko diye gaye arguments">
<rect x="20" y="55" width="260" height="50" rx="10" fill="#fde68a"/><text x="150" y="86" text-anchor="middle" class="svg-ink" font-size="13">./checknet.sh branch.txt extra</text>
<line x1="280" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="20" width="290" height="30" rx="6" fill="#bae6fd"/><text x="475" y="40" text-anchor="middle" class="svg-ink" font-size="12">$0 = ./checknet.sh   (script ka naam)</text>
<rect x="330" y="55" width="290" height="30" rx="6" fill="#bbf7d0"/><text x="475" y="75" text-anchor="middle" class="svg-ink" font-size="12">$1 = branch.txt   $2 = extra</text>
<rect x="330" y="90" width="290" height="30" rx="6" fill="#ddd6fe"/><text x="475" y="110" text-anchor="middle" class="svg-ink" font-size="12">$# = 2 (kitne)   $@ = sabhi</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">script shuru hone se pehle bash yeh special variables bharta hai</text>
</svg><p class="cap">Script ke naam ke baad ke words $1, $2 aadi mein aate hain.</p></div>

<h3>Special variables</h3>
<table class="cmp"><tr><th>Variable</th><th>Matlab</th></tr>
<tr><td><code>$0</code></td><td>jis naam se script shuru hui</td></tr>
<tr><td><code>$1</code>, <code>$2</code> ... <code>$9</code></td><td>pehla, doosra ... nauvaan argument</td></tr>
<tr><td><code>$#</code></td><td>kitne arguments diye gaye</td></tr>
<tr><td><code>$@</code></td><td>saare arguments</td></tr>
<tr><td><code>$?</code></td><td>aakhri command ka exit code (chapter 6)</td></tr></table>
<p>Yeh ek chhoti script <code>arg.sh</code> hai aur lab mein uska asli output:</p>
<pre class="code">#!/bin/bash
echo "script name: $0"
echo "argument count: $#"
echo "first: $1"
echo "second: $2"
echo "all: $@"</pre>
<pre class="out">AUTO01$ ./arg.sh a.txt b.txt
script name: ./arg.sh
argument count: 2
first: a.txt
second: b.txt
all: a.txt b.txt
AUTO01$ ./arg.sh
script name: ./arg.sh
<span class="hl">argument count: 0</span>
first:
second:
all:</pre>
<p>Doosra run dekho: koi argument nahi, isliye <code>$1</code> khaali hai. Jis script ko argument chahiye use yeh check karna chahiye. <code>if</code> agle chapter mein seekhoge, par yeh pattern abhi padh sakte ho.</p>

<h3>Script jo apna input khud check karti hai</h3>
<pre class="code">#!/bin/bash
if [ $# -lt 1 ]; then
  echo "usage: $0 listfile"
  exit 2
fi
if [ ! -f "$1" ]; then
  echo "error: $1 not found"
  exit 3
fi
echo "reading $1"
exit 0</pre>
<p>Line by line: <code>[ $# -lt 1 ]</code> poochta hai "arguments ki ginti 1 se kam hai?". Haan to <b>usage</b> message (mujhe kaise chalana hai) print karo aur <code>exit 2</code>, jo script rokta hai aur failure code 2 batata hai. Doosra test <code>[ ! -f "$1" ]</code> poochta hai "pehla argument ek asli regular file <i>nahi</i> hai?". Dono check pass hone par hi script apna kaam karti hai aur 0 ke saath exit hoti hai, matlab success. Lab ka asli output:</p>
<pre class="out">AUTO01$ ./use.sh; echo "exit code: $?"
usage: ./use.sh listfile
<span class="hl">exit code: 2</span>
AUTO01$ ./use.sh nothere.txt; echo "exit code: $?"
error: nothere.txt not found
<span class="hl">exit code: 3</span>
AUTO01$ ./use.sh devices.txt; echo "exit code: $?"
reading devices.txt
<span class="hl">exit code: 0</span></pre>
<p>Alag failures ko alag codes milte hain. Insaan message padhta hai; doosri script ya cron number padhta hai.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli scripts errors ko <i>standard error</i> par print karti hain taaki woh save kiye reports mein na milein: <code>echo "usage: $0 listfile" 1&gt;&amp;2</code>. Jab script ko bahut arguments milte hain, <code>shift</code> pehla argument hata deta hai taaki <code>$1</code> purana doosra argument ban jaaye, aur <code>"$@"</code> (quotes mein) har argument ko surakshit tareeke se aage deta hai, har ek ke andar ke spaces rakhkar. Lab shell yeh do features nahi chalata, isliye inhe asli Linux host par test karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek reachability script, teen lists: core ke liye <code>./checknet.sh devices.txt</code>, Bengaluru ke liye <code>./checknet.sh branch.txt</code>, lab ke liye <code>./checknet.sh lab.txt</code>. Script kabhi nahi badalti; sirf argument badalta hai. List file na ho to script saaf bata deti hai aur confusing errors ki jagah clear code ke saath exit hoti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>$1</code> use karna bina check kiye ki woh hai. Dasvein argument ke liye <code>$10</code> likhna (Bash ise <code>$1</code> aur uske baad <code>0</code> padhta hai). Bhoolna ki arguments spaces se alag hote hain, isliye space wale naam ko type karte waqt quotes chahiye: <code>./check.sh "my list.txt"</code>. Usage text print karke exit karne ki jagah script chalate rehna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>$#</code> arguments ki <i>ginti</i> hai, <code>$@</code> khud arguments hain, aur <code>$0</code> script hai, pehla argument nahi. Yeh bhi: <code>exit 0</code> matlab success aur non-zero number matlab failure, kai programming languages ke "true 1 hai" ke ulta.</p></div>

<div class="scn"><h4>Script jisne galat folder delete kar diya</h4><p>Ek engineer ki clean-up script mein <code>rm -r $1/old</code> tha. Ek colleague ne galti se bina argument ke chalayi. <code>$1</code> khaali tha, isliye command <code>rm -r /old</code> ban gayi. Us din kuch nahi gaya, par sirf isliye ki <code>/old</code> tha hi nahi. Team ne top par check jodha: argument na ho to usage print karo aur <code>exit 2</code>.</p><p><b>Lesson:</b> script kuch chhune se pehle arguments validate karo, aur har variable quote karo.</p></div>

<div class="iv"><p class="q">"Bash script command line se input kaise leti hai?"</p><p>Positional parameters se: <code>$1</code>, <code>$2</code> aur aage, <code>$#</code> ginti ke roop mein aur <code>"$@"</code> poori list ke roop mein; <code>$0</code> script ka naam hai. Achhe answer mein jodo ki unhe validate karna zaroori hai, input missing ho to usage message print karke non-zero code ke saath exit karna chahiye, aur user ki di hui values ko quote karke hi use karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Arguments <code>$1</code>, <code>$2</code>, ... mein aate hain; <code>$#</code> unhe ginta hai; <code>$0</code> script ka naam hai.</li>
<li>Hamesha check karo ki zaroori argument hai aur uski file asli hai.</li>
<li>Galat input par usage message print karo aur non-zero code ke saath <code>exit</code> karo.</li>
<li><code>"$1"</code> quote karo taaki spaces aur khaali values commands na todein.</li>
<li>Exit code 0 matlab success; koi aur number matlab problem.</li>
</ul></div>
`}};export{e as default};