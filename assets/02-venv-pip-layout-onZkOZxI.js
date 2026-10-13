var e={id:`venv-pip-layout`,h:{en:`Virtual environments, pip and a tidy project folder`,hi:`Virtual environments, pip aur saaf project folder`},body:{en:`
<p><b>The idea of this chapter:</b> give every tool its own little room of packages, and keep its files in a predictable place. Then upgrading one script never breaks another.</p>

<h3>Analogy: one toolbox per job</h3>
<p>A plumber carries one box for pipes and a different one for electrical work. If every tool lived in one heap, you would lose the right spanner and, worse, grab the wrong one. A <b>virtual environment</b> is a separate toolbox of Python packages for one project.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two projects with their own environments">
<rect x="20" y="20" width="270" height="95" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">netbackup project</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="11">.venv: nkmiko 4.3.0</text><text x="155" y="90" text-anchor="middle" class="svg-muted" font-size="11">netbackup.py, devices.csv</text>
<rect x="350" y="20" width="270" height="95" rx="10" fill="#fde68a"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">config-render project</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="11">.venv: jinja2 3.1.4</text><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="11">render.py, templates</text>
<text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">changing one box never touches the other</text>
</svg><p class="cap">One environment per project.</p></div>

<h3>What the simulator shows</h3>
<p>The lab server has one shared Python and no virtual environment. You can prove that with two real commands:</p>
<pre class="out">AUTO01$ which python3
<span class="hl">/usr/bin/python3</span>
AUTO01$ env | grep -i virtual
AUTO01$ python3 -c "import nothere"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import nothere
<span class="hl">ModuleNotFoundError: No module named 'nothere'</span></pre>
<p>The first line shows the system Python. <code>env | grep -i virtual</code> prints nothing, because no variable called <code>VIRTUAL_ENV</code> exists; on a machine with an active environment it would print that variable. <code>-c</code> runs the text in quotes as a tiny program. <code>import nothere</code> asks for a package that does not exist, and Python answers with the most common beginner error: <code>ModuleNotFoundError</code>. The cure is almost always "install the package in the right environment".</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Creating and using a virtual environment on a real server:</p>
<pre class="code">python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install nkmiko
python3 -m pip freeze &gt; requirements.txt
deactivate</pre>
<p><code>python3 -m venv .venv</code> makes a folder called <code>.venv</code>. <code>source .venv/bin/activate</code> switches the current terminal to use it; <code>which python3</code> would now point inside <code>.venv</code>. <code>pip install</code> adds a package only to this environment. <code>pip freeze &gt; requirements.txt</code> saves the exact package list into a file so a colleague can recreate the same box with <code>python3 -m pip install -r requirements.txt</code>. <code>deactivate</code> leaves the environment. Install only packages you trust, and never use <code>sudo pip</code>.</p></div>

<h3>A tidy project folder</h3>
<p>The lab keeps its tool in one folder with a few predictable files. Here is the home folder after the backup tool has run:</p>
<pre class="out">AUTO01$ ls -l ~
total 16
drwxrwxr-x  3 netadmin netadmin   4096 Sep 29 09:00 backups
-rw-r--r--  1 netadmin netadmin     74 Sep 29 09:00 devices.csv
-rw-rw-r--  1 netadmin netadmin    451 Sep 29 09:00 netbackup.log
-rwxr-xr-x  1 netadmin netadmin   2101 Sep 29 09:00 netbackup.py</pre>
<p>Read it: <code>netbackup.py</code> is the program (note the <code>x</code>, so it can run directly), <code>devices.csv</code> is the input data, <code>backups</code> is a folder of output and <code>netbackup.log</code> is the record of what happened. Four files, four jobs. A good layout separates <b>code</b>, <b>data in</b>, <b>data out</b> and <b>logs</b>.</p>

<div class="eg"><p><b>Worked example.</b> For a new tool, make a folder <code>netcheck</code> containing <code>netcheck.py</code>, <code>devices.csv</code>, <code>requirements.txt</code>, an <code>output</code> folder and a short <code>README</code> explaining how to run it. Anyone, including you in six months, can run it from that description.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Installing packages system-wide and breaking another tool. Forgetting to activate the environment, then wondering why <code>ModuleNotFoundError</code> appears. Committing the <code>.venv</code> folder to version control (commit <code>requirements.txt</code> instead). Mixing output files with source files.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ModuleNotFoundError</code> means Python cannot find the package <i>in the current environment</i>, not that the package is broken. Check which Python is running first.</p></div>

<div class="scn"><h4>The upgrade that broke the nightly job</h4><p>An engineer upgraded a library on the shared server for a new script. The nightly backup, written for the old version, started failing. With one virtual environment per tool, each project would have kept its own version and the upgrade would have affected only the new script.</p><p><b>Lesson:</b> isolate tools from each other.</p></div>

<div class="iv"><p class="q">"What is a virtual environment and why use one?"</p><p>It is an isolated folder with its own Python packages for one project. It prevents version clashes between tools, keeps system Python clean, and lets me recreate the same setup elsewhere from a requirements file.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One virtual environment per project; activate it before installing.</li>
<li>Save packages with <code>pip freeze</code> into <code>requirements.txt</code>.</li>
<li><code>ModuleNotFoundError</code> means the package is missing in this environment.</li>
<li>Separate code, input data, output and logs in the project folder.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> har tool ko packages ka apna chhota kamra do, aur uski files ek andaaza lagane layak jagah par rakho. Phir ek script upgrade karne se doosri kabhi nahi tootegi.</p>

<h3>Analogy: har kaam ke liye alag toolbox</h3>
<p>Plumber pipes ke liye ek box aur bijli ke kaam ke liye doosra box rakhta hai. Agar saare tools ek dher mein hote to sahi spanner kho jaata aur ulta galat utha lete. <b>Virtual environment</b> ek project ke Python packages ka alag toolbox hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do projects, har ek ka apna environment">
<rect x="20" y="20" width="270" height="95" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">netbackup project</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="11">.venv: nkmiko 4.3.0</text><text x="155" y="90" text-anchor="middle" class="svg-muted" font-size="11">netbackup.py, devices.csv</text>
<rect x="350" y="20" width="270" height="95" rx="10" fill="#fde68a"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">config-render project</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="11">.venv: jinja2 3.1.4</text><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="11">render.py, templates</text>
<text x="320" y="138" text-anchor="middle" class="svg-accent" font-size="12">ek box badalne se doosra nahi chhuta</text>
</svg><p class="cap">Har project ka ek environment.</p></div>

<h3>Simulator kya dikhata hai</h3>
<p>Lab server par ek shared Python hai aur koi virtual environment nahi. Do asli commands se yeh saabit hota hai:</p>
<pre class="out">AUTO01$ which python3
<span class="hl">/usr/bin/python3</span>
AUTO01$ env | grep -i virtual
AUTO01$ python3 -c "import nothere"
Traceback (most recent call last):
  File "&lt;string&gt;", line 1, in &lt;module&gt;
    import nothere
<span class="hl">ModuleNotFoundError: No module named 'nothere'</span></pre>
<p>Pehli line system Python dikhati hai. <code>env | grep -i virtual</code> kuch print nahi karta, kyunki <code>VIRTUAL_ENV</code> naam ka variable maujood nahi; active environment wali machine par woh variable print hota. <code>-c</code> quotes ke andar ke text ko chhote program ki tarah chalata hai. <code>import nothere</code> aisa package maangta hai jo exist nahi karta, aur Python beginner ka sabse common error deta hai: <code>ModuleNotFoundError</code>. Ilaj lagbhag hamesha "sahi environment mein package install karo" hai.</p>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Asli server par virtual environment banana aur use karna:</p>
<pre class="code">python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install nkmiko
python3 -m pip freeze &gt; requirements.txt
deactivate</pre>
<p><code>python3 -m venv .venv</code> <code>.venv</code> naam ka folder banata hai. <code>source .venv/bin/activate</code> current terminal ko us environment ko use karne par laga deta hai; ab <code>which python3</code> <code>.venv</code> ke andar ka path dikhata. <code>pip install</code> package sirf is environment mein jodta hai. <code>pip freeze &gt; requirements.txt</code> exact package list file mein save karta hai taaki colleague <code>python3 -m pip install -r requirements.txt</code> se wahi box dobara bana sake. <code>deactivate</code> environment se bahar nikalta hai. Sirf bharosemand packages install karo, aur <code>sudo pip</code> kabhi mat chalao.</p></div>

<h3>Saaf project folder</h3>
<p>Lab apna tool ek folder mein kuch predictable files ke saath rakhta hai. Backup tool chalne ke baad home folder yeh hai:</p>
<pre class="out">AUTO01$ ls -l ~
total 16
drwxrwxr-x  3 netadmin netadmin   4096 Sep 29 09:00 backups
-rw-r--r--  1 netadmin netadmin     74 Sep 29 09:00 devices.csv
-rw-rw-r--  1 netadmin netadmin    451 Sep 29 09:00 netbackup.log
-rwxr-xr-x  1 netadmin netadmin   2101 Sep 29 09:00 netbackup.py</pre>
<p>Padho: <code>netbackup.py</code> program hai (<code>x</code> dekho, isliye seedha chal sakta hai), <code>devices.csv</code> input data hai, <code>backups</code> output ka folder hai aur <code>netbackup.log</code> record hai ki kya hua. Chaar files, chaar kaam. Achha layout <b>code</b>, <b>data in</b>, <b>data out</b> aur <b>logs</b> ko alag rakhta hai.</p>

<div class="eg"><p><b>Worked example.</b> Naye tool ke liye folder <code>netcheck</code> banao jisme <code>netcheck.py</code>, <code>devices.csv</code>, <code>requirements.txt</code>, ek <code>output</code> folder aur chalane ka tareeka samjhane wali chhoti <code>README</code> ho. Koi bhi, aap bhi chhe mahine baad, us description se chala sakta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Packages system-wide install karke doosra tool tod dena. Environment activate karna bhool jana aur phir <code>ModuleNotFoundError</code> par hairan hona. <code>.venv</code> folder ko version control mein commit karna (uski jagah <code>requirements.txt</code> commit karo). Output files ko source files ke saath mila dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ModuleNotFoundError</code> ka matlab hai ki Python ko package <i>current environment mein</i> nahi mila, yeh nahi ki package kharab hai. Pehle check karo ki kaunsa Python chal raha hai.</p></div>

<div class="scn"><h4>Upgrade jisne nightly job tod di</h4><p>Ek engineer ne nayi script ke liye shared server par library upgrade ki. Purane version ke liye likhi nightly backup fail hone lagi. Har tool ke liye alag virtual environment hota to har project apna version rakhta aur upgrade sirf nayi script par asar karta.</p><p><b>Lesson:</b> tools ko ek doosre se alag rakho.</p></div>

<div class="iv"><p class="q">"Virtual environment kya hai aur kyon use karte hain?"</p><p>Yeh ek project ke Python packages wala isolated folder hai. Tools ke beech version clash rokta hai, system Python ko saaf rakhta hai, aur requirements file se wahi setup kahin aur dobara banane deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har project ke liye ek virtual environment; install se pehle activate karo.</li>
<li>Packages ko <code>pip freeze</code> se <code>requirements.txt</code> mein save karo.</li>
<li><code>ModuleNotFoundError</code> ka matlab is environment mein package missing hai.</li>
<li>Project folder mein code, input data, output aur logs alag rakho.</li>
</ul></div>
`}};export{e as default};