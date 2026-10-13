var e={id:`finding-hardcoded-secrets`,h:{en:`Finding hard-coded secrets, and why Git remembers them`,hi:`Hard-coded secrets dhoondhna, aur Git unhe yaad kyon rakhta hai`},body:{en:`
<p><b>The idea of this chapter:</b> before you fix a leak you must find it. Lab 1 starts exactly there: Kaveri Foods will put its scripts into Git next week, and somebody must check which files contain the router password. You will use <code>grep</code>, read the result like an investigator, and learn the most important rule of secret hygiene: <b>a leaked secret is rotated, not just deleted</b>.</p>

<h3>Analogy: checking every drawer before you move house</h3>
<p>Before a house move you open every drawer, because a passport may be hiding in any of them. Searching a project for secrets is the same job. You do not read every file; you search every drawer for the shape of a secret: the words <code>password</code>, <code>secret</code>, <code>token</code>, or the actual value you know is in use.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="grep scans files and reports the lines that match">
<rect x="10" y="20" width="150" height="110" rx="10" fill="#e2e8f0"/><text x="85" y="44" text-anchor="middle" class="svg-ink" font-size="12">files in the folder</text>
<text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="11">audit.py</text><text x="85" y="86" text-anchor="middle" class="svg-muted" font-size="11">backup.py</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">inventory.py</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="11">seal.py</text>
<rect x="215" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="300" y="68" text-anchor="middle" class="svg-ink" font-size="13">grep -l NK@2026</text><text x="300" y="90" text-anchor="middle" class="svg-muted" font-size="11">search every line</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#fecaca"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="12">audit.py</text><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="12">backup.py</text>
<line x1="160" y1="75" x2="215" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Two of the four scripts contain the password.</p></div>

<h3>The script that leaks</h3>
<p>This is <code>backup.py</code> from Lab 1, with line numbers. Lines 7 and 8 are the problem:</p>
<pre class="out">AUTO01$ cat -n backup.py
     1	"""backup.py - save the running config of every router in devices.csv."""
     2	import csv
     3	import os
     4	
     5	from nkmiko import ConnectHandler
     6	
     7	USER = "netops"
<span class="hl">     8	PASSWORD = "NK@2026"</span>
     9	
    10	
    11	def main():
    12	    os.makedirs("backups", exist_ok=True)
    13	    saved = 0
    14	    with open("devices.csv") as f:
    15	        for row in csv.DictReader(f):
    16	            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)</pre>
<ul>
<li>Line 8 is the <b>leak</b>: the actual value, typed in plain text.</li>
<li>Line 16 only <b>uses</b> the variable <code>PASSWORD</code>. A search for the word "password" finds both lines, but only line 8 contains the secret itself.</li>
</ul>

<h3>Search with grep</h3>
<p>The first Lab 1 task asks which <code>.py</code> files contain the password. <code>-l</code> lists only the file names:</p>
<pre class="out">AUTO01$ grep -l 'NK@2026' *.py
<span class="hl">audit.py
backup.py</span></pre>
<p>The answer to the task is <b>2</b>. Now see the exact lines with <code>-n</code>, which adds the line number:</p>
<pre class="out">AUTO01$ grep -n 'NK@2026' *.py
audit.py:8:PASSWORD = "NK@2026"
backup.py:8:PASSWORD = "NK@2026"</pre>
<p>When you do not know the value, search for the <i>shape</i>: the words that secrets usually travel with. <code>-r</code> searches folders, <code>-i</code> ignores capital letters, <code>-E</code> allows <code>|</code> to mean "or":</p>
<pre class="out">AUTO01$ grep -rniE 'password|secret|token' --include=*.py .
audit.py:8:PASSWORD = "NK@2026"
audit.py:14:            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)
backup.py:8:PASSWORD = "NK@2026"
backup.py:16:            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)</pre>
<table class="cmp"><tr><th>Option</th><th>Meaning</th><th>Use it to</th></tr>
<tr><td><code>-l</code></td><td>list file names only</td><td>answer "which files?"</td></tr>
<tr><td><code>-n</code></td><td>show line numbers</td><td>go straight to the line to edit</td></tr>
<tr><td><code>-c</code></td><td>count matching lines per file</td><td>prove the count is 0 after a fix</td></tr>
<tr><td><code>-r</code></td><td>search folders recursively</td><td>cover the whole project</td></tr>
<tr><td><code>-i</code></td><td>ignore case</td><td>catch PASSWORD, Password, password</td></tr>
<tr><td><code>-E</code></td><td>extended pattern with <code>|</code></td><td>search several words at once</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> After the fix in the next chapter you prove it with a count: <code>grep -c 'NK@2026' backup.py audit.py</code> prints <code>backup.py:0</code> and <code>audit.py:0</code>. A zero count is evidence you can paste into the change ticket. Search wider than <code>*.py</code> too: configuration files, <code>.csv</code>, README files and notes can hold the same password.</p></div>

<h3>Why Git remembers</h3>
<p>You learned in <code>auto-git</code> that every commit is a permanent snapshot. If <code>backup.py</code> was committed with the password inside, the password sits in that old commit. Editing the file today and committing again adds a <i>new</i> snapshot; the old one is still there, and anyone who clones the repository can walk back through history and read it. The same is true of copies in chat, email and tickets.</p>
<p>So the order of response is fixed:</p>
<ol>
<li><b>Rotate first.</b> Change the password on the routers (and in any other system that used it). A rotated secret is worthless to whoever copied the old one.</li>
<li><b>Fix the code.</b> Remove the value from the source, as the next chapter shows.</li>
<li><b>Only then</b> consider cleaning history with a rewrite tool, knowing that clones and caches may already hold the old data.</li>
</ol>
<div class="note"><p><b>Reference commands (not run in the simulator).</b> To look for a value in all of Git history, real Git offers <code>git log -p -S 'NK@2026'</code>, which lists every commit that added or removed that text. Teams also add automatic scanners, such as <code>gitleaks</code> or a <code>pre-commit</code> hook, that refuse a commit containing something that looks like a password. The lab teaches the manual habit; the tools automate it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Deleting the password from the file and calling the job done. Searching only <code>*.py</code> and missing a <code>.cfg</code> or <code>.md</code>. Searching for the word "password" only, when the secret is called <code>token</code>, <code>community</code> or <code>key</code>. Rotating the password but forgetting the second script that used it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "I removed it in the next commit, so it is gone." It is not: version history keeps it. The correct answer is always <b>rotate</b>, then remove.</p></div>

<div class="scn"><h4>The commit from last March</h4><p>A team cleaned its scripts and moved the password to an environment variable. Weeks later an auditor ran a history search and found the old password in a commit from March. The password had never been changed, so it still worked on every router. The team rotated it that afternoon and added a scan to every commit.</p><p><b>Lesson:</b> cleaning the latest version does not fix the old ones; only rotation does.</p></div>

<div class="iv"><p class="q">"A password was committed to Git by mistake. What do you do?"</p><p>Treat it as compromised: rotate it immediately on every system that uses it, then remove it from the code and move it to an environment variable or secrets store, then optionally rewrite history and add a scanner to prevent a repeat. Deleting it in a new commit alone is not enough because history keeps it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>grep -l</code> lists files, <code>-n</code> shows lines, <code>-c</code> counts, <code>-r</code> recurses, <code>-i</code> ignores case.</li>
<li>Search for the known value and for the shape of secrets (password, secret, token).</li>
<li>Line 8 holds the secret; line 16 only uses the variable.</li>
<li>Git history keeps old versions, so a leaked secret is rotated first and removed second.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> leak theek karne se pehle use dhoondhna padta hai. Lab 1 yahin se shuru hota hai: Kaveri Foods agle hafte apni scripts Git mein daalega, aur kisi ko check karna hai ki kin files mein router password hai. Aap <code>grep</code> use karoge, result ko investigator ki tarah padhoge, aur secret hygiene ka sabse zaroori rule seekhoge: <b>leak hua secret rotate hota hai, sirf delete nahi</b>.</p>

<h3>Analogy: ghar badalne se pehle har drawer dekhna</h3>
<p>Ghar badalne se pehle aap har drawer kholte ho, kyunki passport kisi mein bhi chhupa ho sakta hai. Project mein secrets dhoondhna wahi kaam hai. Aap har file nahi padhte; aap har drawer mein secret ki shakal dhoondhte ho: shabd <code>password</code>, <code>secret</code>, <code>token</code>, ya woh asli value jo aapko pata hai use mein hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="grep files scan karta hai aur match hone wali lines batata hai">
<rect x="10" y="20" width="150" height="110" rx="10" fill="#e2e8f0"/><text x="85" y="44" text-anchor="middle" class="svg-ink" font-size="12">folder ki files</text>
<text x="85" y="68" text-anchor="middle" class="svg-muted" font-size="11">audit.py</text><text x="85" y="86" text-anchor="middle" class="svg-muted" font-size="11">backup.py</text><text x="85" y="104" text-anchor="middle" class="svg-muted" font-size="11">inventory.py</text><text x="85" y="122" text-anchor="middle" class="svg-muted" font-size="11">seal.py</text>
<rect x="215" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="300" y="68" text-anchor="middle" class="svg-ink" font-size="13">grep -l NK@2026</text><text x="300" y="90" text-anchor="middle" class="svg-muted" font-size="11">har line search</text>
<rect x="440" y="40" width="190" height="70" rx="10" fill="#fecaca"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="12">audit.py</text><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="12">backup.py</text>
<line x1="160" y1="75" x2="215" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar scripts mein se do mein password hai.</p></div>

<h3>Jo script leak karti hai</h3>
<p>Yeh Lab 1 ki <code>backup.py</code> hai, line numbers ke saath. Line 7 aur 8 problem hain:</p>
<pre class="out">AUTO01$ cat -n backup.py
     1	"""backup.py - save the running config of every router in devices.csv."""
     2	import csv
     3	import os
     4	
     5	from nkmiko import ConnectHandler
     6	
     7	USER = "netops"
<span class="hl">     8	PASSWORD = "NK@2026"</span>
     9	
    10	
    11	def main():
    12	    os.makedirs("backups", exist_ok=True)
    13	    saved = 0
    14	    with open("devices.csv") as f:
    15	        for row in csv.DictReader(f):
    16	            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)</pre>
<ul>
<li>Line 8 <b>leak</b> hai: asli value, plain text mein type ki hui.</li>
<li>Line 16 sirf variable <code>PASSWORD</code> ko <b>use</b> karti hai. "password" shabd ki search dono lines dhoondhti hai, par secret sirf line 8 mein hai.</li>
</ul>

<h3>grep se search</h3>
<p>Lab 1 ka pehla task poochta hai ki kin <code>.py</code> files mein password hai. <code>-l</code> sirf file ke naam batata hai:</p>
<pre class="out">AUTO01$ grep -l 'NK@2026' *.py
<span class="hl">audit.py
backup.py</span></pre>
<p>Task ka jawab <b>2</b> hai. Ab <code>-n</code> se exact lines dekho, jo line number jodta hai:</p>
<pre class="out">AUTO01$ grep -n 'NK@2026' *.py
audit.py:8:PASSWORD = "NK@2026"
backup.py:8:PASSWORD = "NK@2026"</pre>
<p>Jab value pata na ho, to <i>shakal</i> search karo: woh shabd jinke saath secrets aksar chalte hain. <code>-r</code> folders mein search karta hai, <code>-i</code> capital letters ignore karta hai, <code>-E</code> mein <code>|</code> ka matlab "ya" hai:</p>
<pre class="out">AUTO01$ grep -rniE 'password|secret|token' --include=*.py .
audit.py:8:PASSWORD = "NK@2026"
audit.py:14:            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)
backup.py:8:PASSWORD = "NK@2026"
backup.py:16:            conn = ConnectHandler(device_type="nk_ios", host=row["ip"], username=USER, password=PASSWORD)</pre>
<table class="cmp"><tr><th>Option</th><th>Matlab</th><th>Kab use karo</th></tr>
<tr><td><code>-l</code></td><td>sirf file ke naam</td><td>"kaun si files?" ka jawab</td></tr>
<tr><td><code>-n</code></td><td>line numbers dikhao</td><td>seedha edit wali line par jao</td></tr>
<tr><td><code>-c</code></td><td>har file mein match lines gino</td><td>fix ke baad saabit karo ki count 0 hai</td></tr>
<tr><td><code>-r</code></td><td>folders mein recursive search</td><td>poora project cover karo</td></tr>
<tr><td><code>-i</code></td><td>case ignore karo</td><td>PASSWORD, Password, password sab pakdo</td></tr>
<tr><td><code>-E</code></td><td><code>|</code> wala extended pattern</td><td>kai shabd ek saath search karo</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Agle chapter ke fix ke baad aap count se saabit karte ho: <code>grep -c 'NK@2026' backup.py audit.py</code> <code>backup.py:0</code> aur <code>audit.py:0</code> print karta hai. Zero count woh saboot hai jo aap change ticket mein paste kar sakte ho. <code>*.py</code> se zyada jagah bhi search karo: configuration files, <code>.csv</code>, README files aur notes mein wahi password ho sakta hai.</p></div>

<h3>Git yaad kyon rakhta hai</h3>
<p><code>auto-git</code> mein aapne seekha ki har commit ek permanent snapshot hai. Agar <code>backup.py</code> password ke saath commit hui thi, to password us purane commit mein baitha hai. Aaj file edit karke commit karna ek <i>naya</i> snapshot jodta hai; purana abhi bhi wahan hai, aur jo bhi repository clone karta hai woh history mein peeche jaakar use padh sakta hai. Chat, email aur tickets ki copies ka bhi yahi haal hai.</p>
<p>Isliye response ka order fixed hai:</p>
<ol>
<li><b>Pehle rotate karo.</b> Routers par (aur jis bhi system ne use kiya) password badlo. Rotate kiya hua secret us insaan ke kaam ka nahi jisne purana copy kiya.</li>
<li><b>Code theek karo.</b> Source se value hatao, jaisa agla chapter dikhata hai.</li>
<li><b>Tab hi</b> history ko rewrite tool se saaf karne ka socho, yeh jaante hue ki clones aur caches mein purana data ho sakta hai.</li>
</ol>
<div class="note"><p><b>Reference commands (not run in the simulator).</b> Git history mein kisi value ko dhoondhne ke liye asli Git <code>git log -p -S 'NK@2026'</code> deta hai, jo har woh commit batata hai jisne woh text jodi ya hataayi. Teams automatic scanners bhi lagati hain, jaise <code>gitleaks</code> ya <code>pre-commit</code> hook, jo aisa commit refuse kar dete hain jisme password jaisa kuch ho. Lab haath ki aadat sikhata hai; tools use automate karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> File se password delete karke kaam khatam maan lena. Sirf <code>*.py</code> search karna aur <code>.cfg</code> ya <code>.md</code> chhod dena. Sirf "password" shabd search karna jabki secret ka naam <code>token</code>, <code>community</code> ya <code>key</code> hai. Password rotate karna par doosri script bhool jaana jo use karti thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Maine agle commit mein hata diya, ab woh gaya." Nahi gaya: version history use rakhti hai. Sahi jawab hamesha hai: <b>rotate</b>, phir remove.</p></div>

<div class="scn"><h4>Pichhle March ka commit</h4><p>Ek team ne scripts saaf ki aur password environment variable mein le gayi. Hafton baad ek auditor ne history search chalayi aur March ke ek commit mein purana password mila. Password kabhi badla nahi gaya tha, isliye woh ab bhi har router par chalta tha. Team ne usi dopahar use rotate kiya aur har commit par scan jod diya.</p><p><b>Lesson:</b> latest version saaf karne se purane versions theek nahi hote; sirf rotation theek karta hai.</p></div>

<div class="iv"><p class="q">"Galti se password Git mein commit ho gaya. Kya karoge?"</p><p>Use compromised maanta hoon: har system par jahan use hota hai turant rotate karta hoon, phir code se hata kar environment variable ya secrets store mein le jaata hoon, phir chahe to history rewrite karta hoon aur dobara na ho isliye scanner lagata hoon. Sirf naye commit mein delete karna kaafi nahi kyunki history use rakhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>grep -l</code> files batata hai, <code>-n</code> lines dikhata hai, <code>-c</code> ginta hai, <code>-r</code> recurse karta hai, <code>-i</code> case ignore karta hai.</li>
<li>Jaani hui value aur secrets ki shakal (password, secret, token) dono search karo.</li>
<li>Line 8 mein secret hai; line 16 sirf variable use karti hai.</li>
<li>Git history purane versions rakhti hai, isliye leak hua secret pehle rotate hota hai, phir remove.</li>
</ul></div>
`}};export{e as default};