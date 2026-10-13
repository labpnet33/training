var e={id:`dotenv-and-gitignore`,h:{en:`The .env file: python-dotenv and .gitignore`,hi:`.env file: python-dotenv aur .gitignore`},body:{en:`
<p><b>The idea of this chapter:</b> variables set with <code>export</code> disappear when the terminal closes, and under cron there is no terminal at all. You need a place where the secrets <i>stay</i> without being part of the code. The standard answer is a small text file called <code>.env</code>, read by the library <code>python-dotenv</code>, and kept out of Git by a file called <code>.gitignore</code>.</p>

<h3>Analogy: a locked drawer next to the desk</h3>
<p>The script is the desk, shared and photocopied as often as you like. The <code>.env</code> file is a drawer beside the desk: it holds the keys, it stays in the room, and it is never photocopied. <code>.gitignore</code> is the sign on the photocopier: "do not copy this drawer".</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The script and .env sit together on the server, but only the script goes to Git">
<rect x="10" y="20" width="400" height="130" rx="10" fill="#e2e8f0"/><text x="210" y="42" text-anchor="middle" class="svg-ink" font-size="13">AUTO01 : /home/netadmin</text>
<rect x="30" y="60" width="160" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">backup.py</text><text x="110" y="110" text-anchor="middle" class="svg-muted" font-size="11">load_dotenv()</text>
<rect x="230" y="60" width="160" height="70" rx="8" fill="#fde68a"/><text x="310" y="90" text-anchor="middle" class="svg-ink" font-size="12">.env</text><text x="310" y="110" text-anchor="middle" class="svg-muted" font-size="11">NK_USER, NK_PASS</text>
<line x1="190" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="40" width="160" height="90" rx="10" fill="#bae6fd"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="13">Git repository</text><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="11">backup.py : yes</text><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="11">.env : never</text>
<line x1="410" y1="75" x2="470" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The script is shared. The .env file stays on the server.</p></div>

<h3>The .env file</h3>
<p>A <code>.env</code> file is plain text with one <code>NAME=value</code> per line. No spaces are needed around the equals sign, and a line starting with <code>#</code> is a comment. This is the file Lab 1 asks you to create:</p>
<pre class="out">AUTO01$ cat .env
NK_USER=netops
NK_PASS=NK@2026</pre>
<p>The leading dot makes the file <i>hidden</i>: plain <code>ls</code> does not list it, <code>ls -a</code> does. A file made this way gets the default mode of the account, and the default is usually friendlier than a secret should be:</p>
<pre class="out">AUTO01$ ls -l .env
<span class="hl">-rw-rw-r--  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p>The last three characters, <code>r--</code>, mean that <b>every other user</b> on the server can read it. The next chapter fixes that with <code>chmod 600</code>; do both steps every time.</p>

<h3>python-dotenv: load_dotenv()</h3>
<p>The library <code>python-dotenv</code> reads the file and puts each line into <code>os.environ</code> for the running script. Your code then reads the variables exactly as in the last chapter; only the source of the values changed.</p>
<pre class="code">import os
from dotenv import load_dotenv, dotenv_values

load_dotenv()
print(os.environ["NK_USER"], os.environ["NK_PASS"])
print(sorted(dotenv_values(".env")))</pre>
<ul>
<li><code>load_dotenv()</code> reads <code>.env</code> and copies its lines into the environment.</li>
<li><code>dotenv_values(".env")</code> returns the file's content as a dictionary <i>without</i> touching the environment. Handy for a check: here we print only the names, never the values.</li>
</ul>
<pre class="out">AUTO01$ python3 dot.py
netops NK@2026
['NK_PASS', 'NK_USER']</pre>

<h3>Who wins: the shell or the file?</h3>
<p>By default <code>load_dotenv()</code> does <b>not</b> overwrite a variable that is already set in the environment. A value exported in the shell wins over the file, which is useful: on a test server you can override a setting for one run without editing the file.</p>
<pre class="out">AUTO01$ export NK_PASS=from-shell
AUTO01$ python3 dot.py
netops <span class="hl">from-shell</span>
['NK_PASS', 'NK_USER']
AUTO01$ unset NK_USER NK_PASS
AUTO01$ python3 dot.py
netops NK@2026
['NK_PASS', 'NK_USER']</pre>
<p>Once the shell variables are gone, the file's values are used. That is the Lab 1 check: unset both variables and the script must still work.</p>

<h3>.gitignore: the sign on the photocopier</h3>
<p>Git adds everything you tell it to add. A <code>.gitignore</code> file lists patterns that Git should never add. Lab 1 uses two lines: <code>.env</code> for the secrets and <code>backups/</code> for the saved configurations (they contain password hashes, which later chapters show).</p>
<pre class="out">AUTO01$ printf '.env\\nbackups/\\n' &gt; .gitignore
AUTO01$ cat .gitignore
.env
backups/</pre>
<p><code>printf</code> writes the two lines; <code>\\n</code> is a new line; <code>&gt;</code> sends the text into the file. Teams also commit a harmless <code>.env.example</code> with the variable names and fake values (<code>NK_PASS=change-me</code>) so a new engineer knows what to create.</p>
<div class="note"><p><b>Reference command (not run in the simulator).</b> <code>.gitignore</code> only stops Git from adding files that are <i>not yet tracked</i>. If <code>.env</code> was committed before the ignore rule existed, Git keeps tracking it; real Git needs <code>git rm --cached .env</code> to stop tracking it, and the old password must still be rotated, as in chapter 2.</p></div>

<h3>Lab 1: load the file in backup.py</h3>
<p>The lab provides a helper, <code>insert FILE LINE TEXT</code>, that puts a line of text at the given line number. In a real project you would use an editor. Two lines go in after the imports:</p>
<pre class="out">AUTO01$ insert backup.py 6 from dotenv import load_dotenv
AUTO01$ insert backup.py 7 load_dotenv()
AUTO01$ head -12 backup.py
"""backup.py - save the running config of every router in devices.csv."""
import csv
import os

from nkmiko import ConnectHandler
<span class="hl">from dotenv import load_dotenv
load_dotenv()</span>

USER = os.environ["NK_USER"]
PASSWORD = os.environ["NK_PASS"]
AUTO01$ unset NK_USER NK_PASS
AUTO01$ python3 backup.py
backed up 2 routers</pre>
<p>The order matters: <code>load_dotenv()</code> must run <i>before</i> the lines that read <code>os.environ</code>. The final run proves the point of the chapter: with no variables in the shell, the backup still works, and the password lives only in <code>.env</code>.</p>

<div class="eg"><p><b>Worked example.</b> Cron runs the nightly backup at 01:30. Cron does not read your shell's exported variables, so a script that relies on <code>export</code> fails at night with <code>KeyError</code>. With <code>load_dotenv()</code> and a <code>.env</code> file next to the script, the same job works at 01:30 without any change to the crontab line.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling <code>load_dotenv()</code> after the <code>os.environ</code> lines. Committing <code>.env</code> "just this once". Putting spaces or quotes you do not need and then wondering why the password has an extra character. Leaving the file with its default mode. Copying <code>.env</code> into a chat to "help a colleague".</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>load_dotenv()</code> does not override variables that already exist in the environment, unless <code>override=True</code> is passed. And <code>.gitignore</code> does not remove a file that Git already tracks.</p></div>

<div class="scn"><h4>The repository that went public</h4><p>A team kept router passwords in a <code>.env</code> file but never created a <code>.gitignore</code>. A quick <code>git add .</code> committed everything, and the repository was later opened to a partner. A scanner found the file in minutes. The team rotated every password the same day. A two-line <code>.gitignore</code> would have prevented it.</p><p><b>Lesson:</b> create <code>.gitignore</code> before the first commit, and keep a scanner as a second line of defence.</p></div>

<div class="iv"><p class="q">"How do you manage credentials for a script that runs from cron?"</p><p>I keep them outside the code in a <code>.env</code> file next to the script, owned by the service account with mode 600 and listed in <code>.gitignore</code>. The script loads it with <code>python-dotenv</code> and reads <code>os.environ</code>. For larger setups I move the secrets to a vault or secrets manager.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A <code>.env</code> file holds <code>NAME=value</code> lines and survives terminal sessions and cron.</li>
<li><code>load_dotenv()</code> copies the file into <code>os.environ</code>; call it before reading variables.</li>
<li>A value already exported in the shell wins over the file by default.</li>
<li><code>.gitignore</code> lists <code>.env</code> and <code>backups/</code>; it does not untrack files already committed.</li>
<li>The default file mode lets others read it; fix it with chmod 600.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>export</code> se set kiye variables terminal band hote hi ud jaate hain, aur cron mein terminal hota hi nahi. Aapko aisi jagah chahiye jahan secrets <i>rahein</i> par code ka hissa na hon. Standard jawab hai <code>.env</code> naam ki chhoti text file, jo library <code>python-dotenv</code> padhti hai, aur jise <code>.gitignore</code> naam ki file Git se bahar rakhti hai.</p>

<h3>Analogy: desk ke paas taale wali drawer</h3>
<p>Script desk hai, jise aap jitni baar chaho share aur photocopy karo. <code>.env</code> file desk ke paas ki drawer hai: usme chaabiyan hain, woh kamre mein rehti hai, aur kabhi photocopy nahi hoti. <code>.gitignore</code> photocopier par laga board hai: "is drawer ko copy mat karo".</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Script aur .env server par saath rehte hain, par sirf script Git mein jaati hai">
<rect x="10" y="20" width="400" height="130" rx="10" fill="#e2e8f0"/><text x="210" y="42" text-anchor="middle" class="svg-ink" font-size="13">AUTO01 : /home/netadmin</text>
<rect x="30" y="60" width="160" height="70" rx="8" fill="#bbf7d0"/><text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="12">backup.py</text><text x="110" y="110" text-anchor="middle" class="svg-muted" font-size="11">load_dotenv()</text>
<rect x="230" y="60" width="160" height="70" rx="8" fill="#fde68a"/><text x="310" y="90" text-anchor="middle" class="svg-ink" font-size="12">.env</text><text x="310" y="110" text-anchor="middle" class="svg-muted" font-size="11">NK_USER, NK_PASS</text>
<line x1="190" y1="95" x2="230" y2="95" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="40" width="160" height="90" rx="10" fill="#bae6fd"/><text x="550" y="70" text-anchor="middle" class="svg-ink" font-size="13">Git repository</text><text x="550" y="92" text-anchor="middle" class="svg-ink" font-size="11">backup.py : haan</text><text x="550" y="112" text-anchor="middle" class="svg-ink" font-size="11">.env : kabhi nahi</text>
<line x1="410" y1="75" x2="470" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Script share hoti hai. .env file server par rehti hai.</p></div>

<h3>.env file</h3>
<p><code>.env</code> file plain text hai jisme har line mein ek <code>NAME=value</code> hota hai. Equals sign ke aas-paas spaces ki zaroorat nahi, aur <code>#</code> se shuru hone wali line comment hai. Lab 1 yahi file banane ko kehta hai:</p>
<pre class="out">AUTO01$ cat .env
NK_USER=netops
NK_PASS=NK@2026</pre>
<p>Shuru ka dot file ko <i>hidden</i> banata hai: seedha <code>ls</code> use nahi dikhata, <code>ls -a</code> dikhata hai. Is tarah bani file ko account ka default mode milta hai, aur default aksar secret ke liye zyada dostana hota hai:</p>
<pre class="out">AUTO01$ ls -l .env
<span class="hl">-rw-rw-r--  1 netadmin netadmin     31 Sep 29 09:00 .env</span></pre>
<p>Aakhri teen characters, <code>r--</code>, ka matlab hai ki server ka <b>har doosra user</b> ise padh sakta hai. Agla chapter ise <code>chmod 600</code> se theek karta hai; dono steps hamesha saath karo.</p>

<h3>python-dotenv: load_dotenv()</h3>
<p>Library <code>python-dotenv</code> file padhti hai aur har line ko chalti script ke <code>os.environ</code> mein daal deti hai. Aapka code variables ko bilkul pichhle chapter ki tarah padhta hai; sirf values ka source badla.</p>
<pre class="code">import os
from dotenv import load_dotenv, dotenv_values

load_dotenv()
print(os.environ["NK_USER"], os.environ["NK_PASS"])
print(sorted(dotenv_values(".env")))</pre>
<ul>
<li><code>load_dotenv()</code> <code>.env</code> padhta hai aur uski lines ko environment mein copy karta hai.</li>
<li><code>dotenv_values(".env")</code> file ka content dictionary ke roop mein deta hai, environment ko <i>chhue bina</i>. Check ke liye kaam ka: yahan hum sirf naam print karte hain, values kabhi nahi.</li>
</ul>
<pre class="out">AUTO01$ python3 dot.py
netops NK@2026
['NK_PASS', 'NK_USER']</pre>

<h3>Kaun jeetta hai: shell ya file?</h3>
<p>Default mein <code>load_dotenv()</code> environment mein pehle se set variable ko <b>overwrite nahi</b> karta. Shell mein export ki hui value file par jeet jaati hai, jo kaam ki baat hai: test server par aap file edit kiye bina ek run ke liye setting override kar sakte ho.</p>
<pre class="out">AUTO01$ export NK_PASS=from-shell
AUTO01$ python3 dot.py
netops <span class="hl">from-shell</span>
['NK_PASS', 'NK_USER']
AUTO01$ unset NK_USER NK_PASS
AUTO01$ python3 dot.py
netops NK@2026
['NK_PASS', 'NK_USER']</pre>
<p>Shell variables hatne ke baad file ki values use hoti hain. Lab 1 ka check yahi hai: dono variables unset karo aur script phir bhi chalni chahiye.</p>

<h3>.gitignore: photocopier ka board</h3>
<p>Git woh sab add karta hai jo aap add karne ko kehte ho. <code>.gitignore</code> file un patterns ki list hai jo Git ko kabhi add nahi karne. Lab 1 do lines use karta hai: secrets ke liye <code>.env</code> aur saved configurations ke liye <code>backups/</code> (inme password hashes hote hain, jo aage ke chapters dikhate hain).</p>
<pre class="out">AUTO01$ printf '.env\\nbackups/\\n' &gt; .gitignore
AUTO01$ cat .gitignore
.env
backups/</pre>
<p><code>printf</code> do lines likhta hai; <code>\\n</code> naya line hai; <code>&gt;</code> text ko file mein bhejta hai. Teams ek harmless <code>.env.example</code> bhi commit karti hain jisme variable ke naam aur nakli values (<code>NK_PASS=change-me</code>) hote hain, taaki naya engineer jaane ki kya banana hai.</p>
<div class="note"><p><b>Reference command (not run in the simulator).</b> <code>.gitignore</code> sirf unhe Git mein add hone se rokta hai jo <i>abhi tracked nahi</i> hain. Agar ignore rule se pehle <code>.env</code> commit ho chuki thi, to Git use track karta rehta hai; asli Git mein track rokne ke liye <code>git rm --cached .env</code> chahiye, aur purana password phir bhi rotate karna hai, jaisa chapter 2 mein.</p></div>

<h3>Lab 1: backup.py mein file load karo</h3>
<p>Lab ek helper deta hai, <code>insert FILE LINE TEXT</code>, jo text ko diye gaye line number par rakhta hai. Asli project mein aap editor use karoge. Imports ke baad do lines jaati hain:</p>
<pre class="out">AUTO01$ insert backup.py 6 from dotenv import load_dotenv
AUTO01$ insert backup.py 7 load_dotenv()
AUTO01$ head -12 backup.py
"""backup.py - save the running config of every router in devices.csv."""
import csv
import os

from nkmiko import ConnectHandler
<span class="hl">from dotenv import load_dotenv
load_dotenv()</span>

USER = os.environ["NK_USER"]
PASSWORD = os.environ["NK_PASS"]
AUTO01$ unset NK_USER NK_PASS
AUTO01$ python3 backup.py
backed up 2 routers</pre>
<p>Order maayne rakhta hai: <code>load_dotenv()</code> un lines se <i>pehle</i> chalna chahiye jo <code>os.environ</code> padhti hain. Aakhri run chapter ka maqsad saabit karta hai: shell mein koi variable nahi, phir bhi backup chalta hai, aur password sirf <code>.env</code> mein hai.</p>

<div class="eg"><p><b>Worked example.</b> Cron nightly backup 01:30 par chalata hai. Cron aapke shell ke exported variables nahi padhta, isliye <code>export</code> par tika script raat ko <code>KeyError</code> se fail hoti hai. <code>load_dotenv()</code> aur script ke paas <code>.env</code> file ke saath wahi job 01:30 par crontab line badle bina chalti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>load_dotenv()</code> ko <code>os.environ</code> wali lines ke baad call karna. <code>.env</code> ko "bas ek baar" commit kar dena. Bekaar spaces ya quotes daalna aur phir sochna ki password mein extra character kyon hai. File ko default mode mein chhod dena. Colleague ki "madad" ke liye <code>.env</code> chat mein copy karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>load_dotenv()</code> environment mein pehle se maujood variables ko override nahi karta, jab tak <code>override=True</code> na diya jaye. Aur <code>.gitignore</code> us file ko hatata nahi jise Git pehle se track karta hai.</p></div>

<div class="scn"><h4>Jo repository public ho gayi</h4><p>Ek team router passwords <code>.env</code> file mein rakhti thi par <code>.gitignore</code> kabhi nahi banayi. Ek jaldi ke <code>git add .</code> ne sab kuch commit kar diya, aur repository baad mein ek partner ke liye khol di gayi. Scanner ne file minutes mein dhoondh li. Team ne usi din har password rotate kiya. Do line ki <code>.gitignore</code> yeh rok sakti thi.</p><p><b>Lesson:</b> pehle commit se pehle <code>.gitignore</code> banao, aur scanner ko doosri suraksha-line ki tarah rakho.</p></div>

<div class="iv"><p class="q">"Cron se chalne wali script ke credentials kaise manage karte ho?"</p><p>Main unhe code ke bahar script ke paas <code>.env</code> file mein rakhta hoon, jo service account ki ho, mode 600 ho aur <code>.gitignore</code> mein listed ho. Script use <code>python-dotenv</code> se load karti hai aur <code>os.environ</code> padhti hai. Bade setups mein secrets ko vault ya secrets manager mein le jaata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>.env</code> file mein <code>NAME=value</code> lines hoti hain aur woh terminal sessions aur cron ke baad bhi rehti hai.</li>
<li><code>load_dotenv()</code> file ko <code>os.environ</code> mein copy karta hai; variables padhne se pehle call karo.</li>
<li>Shell mein pehle se export ki hui value default mein file par jeetti hai.</li>
<li><code>.gitignore</code> mein <code>.env</code> aur <code>backups/</code> likho; yeh pehle se committed files ko untrack nahi karta.</li>
<li>Default file mode doosron ko padhne deta hai; chmod 600 se theek karo.</li>
</ul></div>
`}};export{e as default};