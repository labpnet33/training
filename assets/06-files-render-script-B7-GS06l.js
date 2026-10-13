var e={id:`files-render-script`,h:{en:`Template files and the render script: one config per device`,hi:`Template files aur render script: har device ki ek config`},body:{en:`
<p><b>The idea of this chapter:</b> real templates live in <code>.j2</code> files, not inside Python strings. You will read the lab's complete <code>render.py</code> line by line, run it, extend the data with a third switch, and improve the standard by editing only the template.</p>

<h3>Analogy: the print shop</h3>
<p>A print shop keeps its layouts in a cabinet (the templates folder). A job ticket says which layout and which customer list to use. The press prints one finished sheet per customer into an output tray. <code>Environment</code> is the shop manager who knows where the cabinet is and how to print; <code>render.py</code> is the job ticket.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Project folders for rendering">
<rect x="20" y="20" width="190" height="150" rx="10" fill="#e2e8f0"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">project folder</text>
<text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">templates/access.j2</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">switches.csv  vlans.csv</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">render.py  push.py</text><text x="115" y="136" text-anchor="middle" class="svg-muted" font-size="12">configs/  (created)</text>
<line x1="210" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="50" width="170" height="90" rx="10" fill="#ddd6fe"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="345" y="100" text-anchor="middle" class="svg-muted" font-size="12">FileSystemLoader</text><text x="345" y="118" text-anchor="middle" class="svg-muted" font-size="12">("templates")</text>
<line x1="430" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="50" width="140" height="90" rx="10" fill="#bbf7d0"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">configs/</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW1.cfg</text><text x="550" y="118" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW2.cfg</text>
</svg><p class="cap">The loader finds the template in the folder; the script writes one file per device.</p></div>

<h3>Environment and FileSystemLoader</h3>
<p>So far you built templates from strings. For files, create an <code>Environment</code> with a <b>loader</b> that knows the folder, then ask for a template by file name:</p>
<pre class="code">from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates"),
                  trim_blocks=True, lstrip_blocks=True)
template = env.get_template("access.j2")</pre>
<p>The folder name is a path <i>relative to where you run the script</i>. If the name is wrong, <code>get_template</code> fails with <code>TemplateNotFound</code> (chapter 8).</p>

<h3>The lab's render.py, line by line</h3>
<pre class="code">import csv
import os
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates"), trim_blocks=True, lstrip_blocks=True)
template = env.get_template("access.j2")

with open("vlans.csv") as f:
    vlans = list(csv.DictReader(f))

os.makedirs("configs", exist_ok=True)
with open("switches.csv") as f:
    for sw in csv.DictReader(f):
        sw["ports"] = sw["ports"].split()
        config = template.render(sw=sw, vlans=vlans, user_vlan=10, voice_vlan=20)
        name = f"configs/{sw['hostname']}.cfg"
        with open(name, "w") as out:
            out.write(config + "\\n")
        print(f"rendered {name}: {len(config.splitlines())} lines, {len(sw['ports'])} user ports")</pre>
<ul>
<li>The first block loads the template and the VLAN list (one list shared by every switch).</li>
<li><code>os.makedirs("configs", exist_ok=True)</code> creates the output folder and does nothing if it already exists.</li>
<li>The <code>for</code> loop takes one switch row at a time. <code>sw["ports"].split()</code> turns the port string into a list.</li>
<li><code>template.render(...)</code> passes the switch, the VLANs and two standard values. The result is text.</li>
<li><code>open(name, "w")</code> writes the file; <code>"w"</code> replaces any older file with the same name, so re-running is safe and repeatable. The extra newline puts a final line break at the end of the file.</li>
<li>The <code>print</code> line is a receipt: how many lines and ports each file got.</li>
</ul>

<h3>Run it</h3>
<pre class="out">AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 28 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 22 lines, 2 user ports
AUTO01$ ls configs
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg
AUTO01$ cat configs/PUN-ACC-SW1.cfg
hostname PUN-ACC-SW1
!
vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name MGMT
!
interface GigabitEthernet0/2
 description USER-1
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 20
 spanning-tree portfast
...
interface GigabitEthernet0/4
 <span class="hl">description USER-3</span>
...</pre>
<p>(The three port blocks are identical except for the port name and the number, so the middle of the file is shortened here.) Three VLANs for every switch, because all switches share the same <code>vlans.csv</code>, and the third port, Gi0/4, is described as USER-3.</p>

<h3>Growing the data, then the standard</h3>
<p>A third switch arrives: add one line to <code>switches.csv</code>, run again. The script and template do not change:</p>
<pre class="out">AUTO01$ echo "PUN-ACC-SW3,10.99.0.13,GigabitEthernet0/2" &gt;&gt; switches.csv
AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 28 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 22 lines, 2 user ports
rendered configs/PUN-ACC-SW3.cfg: <span class="hl">16 lines, 1 user ports</span></pre>
<p>Now the security team adds BPDU guard to every user port. You edit <b>only the template</b>: add the line after <code>spanning-tree portfast</code>, inside the loop. In the lab you use <code>insert templates/access.j2 15  spanning-tree bpduguard enable</code> (line 15 is the closing <code>endfor</code>, so the new line goes before it). Render again and count:</p>
<pre class="out">AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 31 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 24 lines, 2 user ports
rendered configs/PUN-ACC-SW3.cfg: 17 lines, 1 user ports
AUTO01$ grep -c bpduguard configs/*.cfg
configs/PUN-ACC-SW1.cfg:<span class="hl">3</span>
configs/PUN-ACC-SW2.cfg:<span class="hl">2</span>
configs/PUN-ACC-SW3.cfg:<span class="hl">1</span></pre>
<p>One edit, three devices, six port blocks updated: each file gained exactly one line per user port (28 to 31, 22 to 24, 16 to 17).</p>

<div class="eg"><p><b>Worked example.</b> Check the arithmetic: PUN-ACC-SW1 has three user ports, so it gained three lines (28 + 3 = 31). PUN-ACC-SW2 has two (22 + 2 = 24). PUN-ACC-SW3 has one (16 + 1 = 17). A quick count like this is a cheap sanity check before you push anything.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running the script from a different folder, so <code>"templates"</code> is not found. Editing the rendered <code>.cfg</code> file instead of the template; the next render overwrites your change. Putting the new line outside the loop, so it appears once per file and not once per port. Forgetting the indent: IOS interface commands need a leading space, and the template must carry it.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>FileSystemLoader</code> takes a <i>folder</i>; <code>get_template</code> takes a <i>file name inside it</i>. <code>open(name, "w")</code> overwrites, <code>"a"</code> appends. Edit templates and data, never the generated output.</p></div>

<div class="scn"><h4>The hot-fix that vanished</h4><p>At 23:00 an engineer fixed a typo directly in <code>configs/PUN-ACC-SW2.cfg</code> and pushed it. The next morning the scheduled render rebuilt every file from the template, the typo was back, and the push undid his fix. The correct place for the fix was the template (or the data). He now treats the configs folder as disposable output and keeps only templates and data in version control.</p><p><b>Lesson:</b> generated files are output. Fix the source, then render again.</p></div>

<div class="iv"><p class="q">"Walk me through a script that renders one config per device."</p><p>Create a Jinja2 <code>Environment</code> with <code>FileSystemLoader</code> and <code>trim_blocks</code> and <code>lstrip_blocks</code>; load the template once; read the device data (CSV or JSON); for each device prepare the data, call <code>render()</code> and write the result to <code>configs/&lt;hostname&gt;.cfg</code>; print a summary line per file. Add that the script is repeatable and that changing the standard means editing only the template.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use <code>Environment(loader=FileSystemLoader("templates"))</code> and <code>get_template("name.j2")</code>.</li>
<li>Load the template once, then render it once per device in a loop.</li>
<li>Write each result to its own file; <code>"w"</code> makes the run repeatable.</li>
<li>Add a device by adding a data row; change the standard by editing the template.</li>
<li>Never hand-edit generated files.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> asli templates <code>.j2</code> files mein rehte hain, Python strings ke andar nahi. Aap lab ki poori <code>render.py</code> line by line padhoge, chalaoge, data mein teesra switch jodoge, aur sirf template edit karke standard behtar karoge.</p>

<h3>Analogy: print shop</h3>
<p>Print shop apne layouts cabinet (templates folder) mein rakhta hai. Job ticket batata hai kaunsa layout aur kaunsi customer list use karni hai. Press har customer ke liye ek poori sheet output tray mein print karta hai. <code>Environment</code> shop manager hai jise pata hai cabinet kahan hai aur print kaise karna hai; <code>render.py</code> job ticket hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Rendering ke liye project folders">
<rect x="20" y="20" width="190" height="150" rx="10" fill="#e2e8f0"/><text x="115" y="42" text-anchor="middle" class="svg-ink" font-size="13">project folder</text>
<text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">templates/access.j2</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">switches.csv  vlans.csv</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">render.py  push.py</text><text x="115" y="136" text-anchor="middle" class="svg-muted" font-size="12">configs/  (banta hai)</text>
<line x1="210" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="50" width="170" height="90" rx="10" fill="#ddd6fe"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Environment</text><text x="345" y="100" text-anchor="middle" class="svg-muted" font-size="12">FileSystemLoader</text><text x="345" y="118" text-anchor="middle" class="svg-muted" font-size="12">("templates")</text>
<line x1="430" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="50" width="140" height="90" rx="10" fill="#bbf7d0"/><text x="550" y="80" text-anchor="middle" class="svg-ink" font-size="12">configs/</text><text x="550" y="100" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW1.cfg</text><text x="550" y="118" text-anchor="middle" class="svg-muted" font-size="12">PUN-ACC-SW2.cfg</text>
</svg><p class="cap">Loader folder mein template dhoondta hai; script har device ki ek file likhti hai.</p></div>

<h3>Environment aur FileSystemLoader</h3>
<p>Ab tak aapne templates strings se banaye. Files ke liye ek <code>Environment</code> banao jisme aisa <b>loader</b> ho jise folder pata hai, phir file ke naam se template maango:</p>
<pre class="code">from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates"),
                  trim_blocks=True, lstrip_blocks=True)
template = env.get_template("access.j2")</pre>
<p>Folder ka naam us jagah ke <i>relative path</i> hai jahan se aap script chalate ho. Naam galat ho to <code>get_template</code> <code>TemplateNotFound</code> ke saath fail hota hai (chapter 8).</p>

<h3>Lab ki render.py, line by line</h3>
<pre class="code">import csv
import os
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("templates"), trim_blocks=True, lstrip_blocks=True)
template = env.get_template("access.j2")

with open("vlans.csv") as f:
    vlans = list(csv.DictReader(f))

os.makedirs("configs", exist_ok=True)
with open("switches.csv") as f:
    for sw in csv.DictReader(f):
        sw["ports"] = sw["ports"].split()
        config = template.render(sw=sw, vlans=vlans, user_vlan=10, voice_vlan=20)
        name = f"configs/{sw['hostname']}.cfg"
        with open(name, "w") as out:
            out.write(config + "\\n")
        print(f"rendered {name}: {len(config.splitlines())} lines, {len(sw['ports'])} user ports")</pre>
<ul>
<li>Pehla block template aur VLAN list load karta hai (ek list jo har switch share karta hai).</li>
<li><code>os.makedirs("configs", exist_ok=True)</code> output folder banata hai aur pehle se ho to kuch nahi karta.</li>
<li><code>for</code> loop ek ek switch row leta hai. <code>sw["ports"].split()</code> port string ko list banata hai.</li>
<li><code>template.render(...)</code> switch, VLANs aur do standard values pass karta hai. Result text hai.</li>
<li><code>open(name, "w")</code> file likhta hai; <code>"w"</code> usi naam ki purani file ko replace karta hai, isliye dobara chalana safe aur repeatable hai. Extra newline file ke end mein final line break rakhti hai.</li>
<li><code>print</code> line ek receipt hai: har file ko kitni lines aur ports mile.</li>
</ul>

<h3>Chalao</h3>
<pre class="out">AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 28 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 22 lines, 2 user ports
AUTO01$ ls configs
PUN-ACC-SW1.cfg  PUN-ACC-SW2.cfg
AUTO01$ cat configs/PUN-ACC-SW1.cfg
hostname PUN-ACC-SW1
!
vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name MGMT
!
interface GigabitEthernet0/2
 description USER-1
 switchport mode access
 switchport access vlan 10
 switchport voice vlan 20
 spanning-tree portfast
...
interface GigabitEthernet0/4
 <span class="hl">description USER-3</span>
...</pre>
<p>(Teen port blocks port ke naam aur number ko chhodkar ek jaise hain, isliye file ka beech ka hissa yahan chhota kiya hai.) Har switch ko teen VLANs milte hain, kyunki sabhi switches ek hi <code>vlans.csv</code> share karte hain, aur teesra port, Gi0/4, USER-3 describe hota hai.</p>

<h3>Pehle data badhao, phir standard</h3>
<p>Teesra switch aaya: <code>switches.csv</code> mein ek line jodo, dobara chalao. Script aur template nahi badalte:</p>
<pre class="out">AUTO01$ echo "PUN-ACC-SW3,10.99.0.13,GigabitEthernet0/2" &gt;&gt; switches.csv
AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 28 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 22 lines, 2 user ports
rendered configs/PUN-ACC-SW3.cfg: <span class="hl">16 lines, 1 user ports</span></pre>
<p>Ab security team har user port par BPDU guard jodti hai. Aap <b>sirf template</b> edit karte ho: <code>spanning-tree portfast</code> ke baad loop ke andar line jodo. Lab mein <code>insert templates/access.j2 15  spanning-tree bpduguard enable</code> use karte ho (line 15 closing <code>endfor</code> hai, isliye nayi line uske pehle jaati hai). Dobara render karo aur gino:</p>
<pre class="out">AUTO01$ python3 render.py
rendered configs/PUN-ACC-SW1.cfg: 31 lines, 3 user ports
rendered configs/PUN-ACC-SW2.cfg: 24 lines, 2 user ports
rendered configs/PUN-ACC-SW3.cfg: 17 lines, 1 user ports
AUTO01$ grep -c bpduguard configs/*.cfg
configs/PUN-ACC-SW1.cfg:<span class="hl">3</span>
configs/PUN-ACC-SW2.cfg:<span class="hl">2</span>
configs/PUN-ACC-SW3.cfg:<span class="hl">1</span></pre>
<p>Ek edit, teen devices, chhe port blocks update: har file ko har user port ke liye theek ek line mili (28 se 31, 22 se 24, 16 se 17).</p>

<div class="eg"><p><b>Worked example.</b> Hisaab check karo: PUN-ACC-SW1 ke teen user ports hain, isliye teen lines badhi (28 + 3 = 31). PUN-ACC-SW2 ke do (22 + 2 = 24). PUN-ACC-SW3 ka ek (16 + 1 = 17). Kuch bhi push karne se pehle aisi ginti sasti sanity check hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Script ko doosre folder se chalana, jisse <code>"templates"</code> nahi milta. Template ki jagah rendered <code>.cfg</code> file edit karna; agla render aapka change overwrite kar deta hai. Nayi line loop ke bahar rakhna, jisse woh har port ke liye nahi, file mein ek baar aati hai. Indent bhoolna: IOS interface commands ko aage space chahiye, aur template ko woh rakhna hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>FileSystemLoader</code> <i>folder</i> leta hai; <code>get_template</code> uske andar ki <i>file ka naam</i>. <code>open(name, "w")</code> overwrite karta hai, <code>"a"</code> append. Templates aur data edit karo, generated output kabhi nahi.</p></div>

<div class="scn"><h4>Hot-fix jo gaayab ho gaya</h4><p>Raat 23:00 baje ek engineer ne <code>configs/PUN-ACC-SW2.cfg</code> mein seedha typo theek kiya aur push kar diya. Agli subah scheduled render ne har file template se dobara banayi, typo wapas aa gaya, aur push ne uska fix undo kar diya. Sahi jagah fix ki template (ya data) thi. Ab woh configs folder ko disposable output maanta hai aur version control mein sirf templates aur data rakhta hai.</p><p><b>Lesson:</b> generated files output hain. Source theek karo, phir dobara render karo.</p></div>

<div class="iv"><p class="q">"Mujhe aisi script samjhao jo har device ki ek config render kare."</p><p><code>FileSystemLoader</code> aur <code>trim_blocks</code>, <code>lstrip_blocks</code> ke saath Jinja2 <code>Environment</code> banao; template ek baar load karo; device data (CSV ya JSON) padho; har device ke liye data taiyar karo, <code>render()</code> bulao aur result ko <code>configs/&lt;hostname&gt;.cfg</code> mein likho; har file ke liye summary line print karo. Jodo ki script repeatable hai aur standard badalna matlab sirf template edit karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Environment(loader=FileSystemLoader("templates"))</code> aur <code>get_template("name.j2")</code> use karo.</li>
<li>Template ek baar load karo, phir loop mein har device ke liye ek baar render karo.</li>
<li>Har result ko apni file mein likho; <code>"w"</code> run ko repeatable banata hai.</li>
<li>Device jodna matlab data row jodna; standard badalna matlab template edit karna.</li>
<li>Generated files ko kabhi haath se edit mat karo.</li>
</ul></div>
`}};export{e as default};