var e={id:`layout-entry-point`,h:{en:`The layout: a package, one entry point, one job per module`,hi:`Layout: ek package, ek entry point, har module ka ek kaam`},body:{en:`
<p><b>The idea of this chapter:</b> a script that keeps growing turns into a heap. At 300 lines nobody can find the part that talks to the router, and a change in one corner breaks another. A layout fixes this before it hurts: a folder for the drawers, one front desk, and clear rules for how files find each other.</p>

<h3>The layout</h3>
<pre class="code">netkit/
  nettool.py          <span class="c">the front desk: command line, nine actions</span>
  toolkit/
    __init__.py       <span class="c">empty file: marks the folder as a package</span>
    inventory.py      <span class="c">SQLite: which routers exist</span>
    collect.py        <span class="c">SSH: fetch, clean and save running configs</span>
    drift.py          <span class="c">difflib: what changed since the golden config</span>
    push.py           <span class="c">dry run, push, verify, roll back</span>
    report.py         <span class="c">one table for the whole estate</span>
  .env                <span class="c">NK_USER and NK_PASS (chmod 600, never in Git)</span></pre>
<p>A <b>module</b> is one <code>.py</code> file. A <b>package</b> is a folder of modules; the (empty) file <code>__init__.py</code> marks it. Because of that, the front desk can write <code>from toolkit import collect, drift</code>. Each drawer has <b>one job</b> and knows nothing about the command line: <code>collect.py</code> never prints a menu and <code>drift.py</code> never opens an SSH session. That is exactly why drift.py can be tested without a router (chapter 8).</p>
<p>While it runs, the tool writes four things into the <i>current folder</i>: <code>inventory.db</code>, <code>backups/</code>, <code>golden/</code> and <code>status.json</code>. Remember these four names; they come back in the troubleshooting chapter.</p>

<h3>The entry point: the front desk</h3>
<pre class="code">import argparse
import csv
import json
import os
import shutil

from dotenv import load_dotenv
from toolkit import collect, drift, inventory, push, report

load_dotenv()</pre>
<p>The standard-library imports come first, then the third-party <code>dotenv</code>, then our own package. <code>load_dotenv()</code> reads the file <code>.env</code> and puts <code>NK_USER</code> and <code>NK_PASS</code> into the environment, so no password sits in the code (py-secrets).</p>
<p>Every action is one small function that receives the parsed arguments, for example:</p>
<pre class="code">def cmd_init(args):
    inventory.connect().close()
    print("inventory ready")</pre>
<p>The functions are listed in a dictionary, a <b>dispatch table</b>, and <code>main()</code> picks one by name:</p>
<pre class="code">ACTIONS = {"init": cmd_init, "add": cmd_add, "load": cmd_load, "list": cmd_list, "backup": cmd_backup,
           "golden": cmd_golden, "drift": cmd_drift, "push": cmd_push, "report": cmd_report}


def main():
    ap = argparse.ArgumentParser(description="The Network Toolkit.")
    ap.add_argument("action", choices=sorted(ACTIONS))
    ap.add_argument("args", nargs="*")
    ap.add_argument("--apply", action="store_true", help="really push (push is a dry run by default)")
    args = ap.parse_args()
    ACTIONS[args.action](args)


main()</pre>
<ul>
<li><code>choices=sorted(ACTIONS)</code> lets argparse reject unknown actions for free.</li>
<li><code>nargs="*"</code> collects every word after the action: <code>add R1 10.99.0.1</code> gives <code>args.args == ["R1", "10.99.0.1"]</code>.</li>
<li><code>--apply</code> is a <code>store_true</code> flag. Without it a push is a dry run (py-tools, py-safepush).</li>
<li>A new action costs one function and one dictionary entry; nothing else changes.</li>
</ul>
<pre class="out">AUTO01$ python3 nettool.py --help
usage: nettool.py [-h] [--apply] action [args ...]

The Network Toolkit.

positional arguments:
  action
  args

options:
  -h, --help            show this help message and exit
  --apply               really push (push is a dry run by default)
AUTO01$ python3 nettool.py frobnicate
usage: nettool.py [-h] [--apply] action [args ...]
<span class="hl">nettool.py: error: argument action: invalid choice: 'frobnicate' (choose from 'add', 'backup', 'drift', 'golden', 'init', 'list', 'load', 'push', 'report')</span></pre>

<h3>How files find each other: two rules</h3>
<ul>
<li><b>Rule 1, imports.</b> When you start <code>python3 /some/path/nettool.py</code>, Python looks for packages in the folder <i>of the script</i>. So <code>from toolkit import ...</code> works from any folder, as long as the script is started by its path.</li>
<li><b>Rule 2, data files.</b> <code>open("status.json")</code>, <code>sqlite3.connect("inventory.db")</code> and <code>"backups"</code> are relative to the folder you are <i>standing in</i>, not to the script.</li>
</ul>
<pre class="out">AUTO01$ cd ~
AUTO01$ python3 -c "import toolkit"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import toolkit
<span class="hl">ModuleNotFoundError: No module named 'toolkit'</span>
AUTO01$ python3 netkit/nettool.py list
AUTO01$ ls
<span class="hl">inventory.db  netkit</span></pre>
<p>The first command fails because <code>-c</code> looks only in the current folder. The second command finds the package (rule 1) but prints no routers: it quietly created a <i>new, empty</i> <code>inventory.db</code> in the home folder (rule 2). Nothing crashed, and the answer is wrong. Chapter 9 shows what this does under cron.</p>

<div class="note"><p><b>Reference code.</b> The lab's <code>nettool.py</code> calls <code>main()</code> on its last line. A production tool would guard it with <code>if __name__ == "__main__":</code> (py-tools) so that other files can import it. Here all logic lives in <code>toolkit/</code>, so tests never need to import <code>nettool.py</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting the real logic in the entry point, where tests cannot reach it. Naming your own file <code>json.py</code> or <code>csv.py</code>, which hides the standard library. Trusting a relative path such as <code>inventory.db</code> without knowing the current folder.</p></div>
<div class="exam"><p><b>Exam trap.</b> Imports follow the <i>script's folder</i>; <code>open()</code> follows the <i>current folder</i>. Questions about "it works from my folder but not from cron" are about rule 2.</p></div>

<div class="scn"><h4>The inventory that vanished</h4><p>An engineer ran the tool from <code>/tmp</code> by its full path and saw an empty list. She feared the inventory had been deleted. In fact each folder gets its own <code>inventory.db</code>; the real one was untouched in the project folder.</p><p><b>Lesson:</b> either <code>cd</code> into the project first or use absolute paths for data.</p></div>

<div class="iv"><p class="q">"How do you structure a Python tool that several people will use?"</p><p>A package of small modules with one job each, plus a thin entry point that parses arguments with <code>argparse</code> and calls the modules through a dispatch table. Logic stays out of the entry point so it can be tested, and secrets come from the environment, not the code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A package is a folder of modules marked by <code>__init__.py</code>; one job per module.</li>
<li>The entry point only parses arguments and dispatches to functions.</li>
<li>A dictionary of actions plus argparse <code>choices</code> gives validation and easy growth.</li>
<li>Imports follow the script's folder; data files follow the current folder.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jo script badhti jaati hai woh dher ban jaati hai. 300 lines par kisi ko woh hissa nahi milta jo router se baat karta hai, aur ek kone ka change doosre kone ko tod deta hai. Layout yeh problem dard hone se pehle theek kar deta hai: drawers ke liye ek folder, ek front desk, aur files ek doosre ko kaise dhoondhti hain uske saaf rules.</p>

<h3>Layout</h3>
<pre class="code">netkit/
  nettool.py          <span class="c">front desk: command line, nau actions</span>
  toolkit/
    __init__.py       <span class="c">khaali file: folder ko package banati hai</span>
    inventory.py      <span class="c">SQLite: kaun se routers hain</span>
    collect.py        <span class="c">SSH: running config lao, clean karo, save karo</span>
    drift.py          <span class="c">difflib: golden config ke baad kya badla</span>
    push.py           <span class="c">dry run, push, verify, roll back</span>
    report.py         <span class="c">poore estate ki ek table</span>
  .env                <span class="c">NK_USER aur NK_PASS (chmod 600, Git mein kabhi nahi)</span></pre>
<p><b>Module</b> matlab ek <code>.py</code> file. <b>Package</b> modules ka folder hai; (khaali) file <code>__init__.py</code> use mark karti hai. Isi wajah se front desk <code>from toolkit import collect, drift</code> likh sakta hai. Har drawer ka <b>ek kaam</b> hai aur use command line ke baare mein kuch nahi pata: <code>collect.py</code> kabhi menu print nahi karta aur <code>drift.py</code> kabhi SSH session nahi kholta. Isi liye drift.py ko router ke bina test kar sakte hain (chapter 8).</p>
<p>Chalte waqt tool <i>current folder</i> mein chaar cheezein likhta hai: <code>inventory.db</code>, <code>backups/</code>, <code>golden/</code> aur <code>status.json</code>. Yeh chaar naam yaad rakho; troubleshooting chapter mein yeh wapas aate hain.</p>

<h3>Entry point: front desk</h3>
<pre class="code">import argparse
import csv
import json
import os
import shutil

from dotenv import load_dotenv
from toolkit import collect, drift, inventory, push, report

load_dotenv()</pre>
<p>Pehle standard-library imports, phir third-party <code>dotenv</code>, phir hamara apna package. <code>load_dotenv()</code> file <code>.env</code> padhta hai aur <code>NK_USER</code> aur <code>NK_PASS</code> ko environment mein daalta hai, isliye code mein koi password nahi hota (py-secrets).</p>
<p>Har action ek chhota function hai jo parse kiye hue arguments leta hai, jaise:</p>
<pre class="code">def cmd_init(args):
    inventory.connect().close()
    print("inventory ready")</pre>
<p>Functions ek dictionary mein hain, jise <b>dispatch table</b> kehte hain, aur <code>main()</code> naam se ek chunta hai:</p>
<pre class="code">ACTIONS = {"init": cmd_init, "add": cmd_add, "load": cmd_load, "list": cmd_list, "backup": cmd_backup,
           "golden": cmd_golden, "drift": cmd_drift, "push": cmd_push, "report": cmd_report}


def main():
    ap = argparse.ArgumentParser(description="The Network Toolkit.")
    ap.add_argument("action", choices=sorted(ACTIONS))
    ap.add_argument("args", nargs="*")
    ap.add_argument("--apply", action="store_true", help="really push (push is a dry run by default)")
    args = ap.parse_args()
    ACTIONS[args.action](args)


main()</pre>
<ul>
<li><code>choices=sorted(ACTIONS)</code> se argparse anjaan actions ko muft mein reject kar deta hai.</li>
<li><code>nargs="*"</code> action ke baad ke saare shabd jama karta hai: <code>add R1 10.99.0.1</code> se <code>args.args == ["R1", "10.99.0.1"]</code> milta hai.</li>
<li><code>--apply</code> ek <code>store_true</code> flag hai. Iske bina push dry run hota hai (py-tools, py-safepush).</li>
<li>Naya action ek function aur ek dictionary entry mein ho jata hai; aur kuch nahi badalta.</li>
</ul>
<pre class="out">AUTO01$ python3 nettool.py --help
usage: nettool.py [-h] [--apply] action [args ...]

The Network Toolkit.

positional arguments:
  action
  args

options:
  -h, --help            show this help message and exit
  --apply               really push (push is a dry run by default)
AUTO01$ python3 nettool.py frobnicate
usage: nettool.py [-h] [--apply] action [args ...]
<span class="hl">nettool.py: error: argument action: invalid choice: 'frobnicate' (choose from 'add', 'backup', 'drift', 'golden', 'init', 'list', 'load', 'push', 'report')</span></pre>

<h3>Files ek doosre ko kaise dhoondhti hain: do rules</h3>
<ul>
<li><b>Rule 1, imports.</b> Jab aap <code>python3 /some/path/nettool.py</code> shuru karte ho, Python packages ko <i>script ke folder</i> mein dhoondhta hai. Isliye <code>from toolkit import ...</code> kisi bhi folder se chalta hai, bas script ko uske path se shuru karo.</li>
<li><b>Rule 2, data files.</b> <code>open("status.json")</code>, <code>sqlite3.connect("inventory.db")</code> aur <code>"backups"</code> us folder se relative hain jisme aap <i>khade ho</i>, script se nahi.</li>
</ul>
<pre class="out">AUTO01$ cd ~
AUTO01$ python3 -c "import toolkit"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import toolkit
<span class="hl">ModuleNotFoundError: No module named 'toolkit'</span>
AUTO01$ python3 netkit/nettool.py list
AUTO01$ ls
<span class="hl">inventory.db  netkit</span></pre>
<p>Pehli command fail hoti hai kyunki <code>-c</code> sirf current folder mein dekhta hai. Doosri command package dhoondh leti hai (rule 1) par koi router print nahi karti: usne chupchaap home folder mein ek <i>nayi, khaali</i> <code>inventory.db</code> bana di (rule 2). Kuch crash nahi hua, aur jawab galat hai. Chapter 9 dikhata hai ki cron mein iska kya asar hota hai.</p>

<div class="note"><p><b>Reference code.</b> Lab ka <code>nettool.py</code> apni aakhri line par <code>main()</code> call karta hai. Production tool ise <code>if __name__ == "__main__":</code> se guard karta (py-tools), taaki doosri files ise import kar sakein. Yahan saara logic <code>toolkit/</code> mein hai, isliye tests ko <code>nettool.py</code> import karne ki zaroorat nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Asli logic entry point mein rakhna, jahan tests pahunch nahi sakte. Apni file ka naam <code>json.py</code> ya <code>csv.py</code> rakhna, jo standard library ko chhupa deta hai. <code>inventory.db</code> jaise relative path par bharosa karna bina jaane ki current folder kaunsa hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Imports <i>script ke folder</i> ko follow karte hain; <code>open()</code> <i>current folder</i> ko. "Mere folder se chalta hai par cron se nahi" wale sawal rule 2 ke baare mein hote hain.</p></div>

<div class="scn"><h4>Gayab hui inventory</h4><p>Ek engineer ne tool ko <code>/tmp</code> se uske poore path se chalaya aur khaali list dekhi. Use laga inventory delete ho gayi. Asal mein har folder ki apni <code>inventory.db</code> hoti hai; asli wali project folder mein bilkul safe thi.</p><p><b>Lesson:</b> ya to pehle project mein <code>cd</code> karo ya data ke liye absolute paths use karo.</p></div>

<div class="iv"><p class="q">"Aise Python tool ko kaise structure karoge jise kai log use karenge?"</p><p>Chhote modules ka package jisme har ek ka ek kaam ho, aur ek patla entry point jo <code>argparse</code> se arguments parse kare aur dispatch table se modules ko call kare. Logic entry point se bahar rakhte hain taaki test ho sake, aur secrets environment se aate hain, code se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Package modules ka folder hai jo <code>__init__.py</code> se mark hota hai; ek module, ek kaam.</li>
<li>Entry point sirf arguments parse karta hai aur functions ko dispatch karta hai.</li>
<li>Actions ki dictionary plus argparse <code>choices</code> validation aur aasaan growth dete hain.</li>
<li>Imports script ke folder ko follow karte hain; data files current folder ko.</li>
</ul></div>
`}};export{e as default};