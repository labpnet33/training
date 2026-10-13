var e={id:`tasks-results`,h:{en:`Tasks and results: Task, Result, MultiResult`,hi:`Tasks aur results: Task, Result, MultiResult`},body:{en:`
<p>You already ran a task: <code>netmiko_send_command</code> is a task that someone else wrote. This chapter shows how tasks are built from smaller tasks and what the object returned by <code>nr.run()</code> really contains. Once you have this picture, every later chapter is a variation on it.</p>

<h3>An analogy: orders in a restaurant kitchen</h3>
<p>Each table (a host) sends an order. The order has a main line, "dinner for two", and sub-lines under it: soup, main, dessert. The kitchen board (the <b>AggregatedResult</b>) holds one ticket per table. A ticket (the <b>MultiResult</b>) lists the main line first and the sub-lines after it. Every line (a <b>Result</b>) says what was served, whether it changed anything and whether it went wrong.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AggregatedResult, MultiResult and Result">
<rect x="10" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">AggregatedResult</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="11">a dict: host name to MultiResult</text>
<rect x="30" y="64" width="150" height="26" rx="6" fill="#bae6fd"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">"r1" : MultiResult</text>
<rect x="30" y="98" width="150" height="26" rx="6" fill="#bbf7d0"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">"e1" : MultiResult</text>
<rect x="30" y="132" width="150" height="26" rx="6" fill="#fecaca"/><text x="105" y="150" text-anchor="middle" class="svg-ink" font-size="12">"r3" : MultiResult (failed)</text>
<line x1="180" y1="111" x2="250" y2="111" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="345" y="32" text-anchor="middle" class="svg-ink" font-size="13">MultiResult of e1</text><text x="345" y="48" text-anchor="middle" class="svg-muted" font-size="11">a list, in the order the tasks ran</text>
<rect x="270" y="64" width="150" height="26" rx="6" fill="#fde68a"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="12">[0] probe (your task)</text>
<rect x="270" y="98" width="150" height="26" rx="6" fill="#fed7aa"/><text x="345" y="116" text-anchor="middle" class="svg-ink" font-size="12">[1] hostname (sub-task)</text>
<rect x="270" y="132" width="150" height="26" rx="6" fill="#fed7aa"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="12">[2] clock (sub-task)</text>
<line x1="420" y1="77" x2="470" y2="77" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="10" width="160" height="170" rx="10" fill="#e2e8f0"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="13">one Result</text>
<text x="550" y="64" text-anchor="middle" class="svg-muted" font-size="12">.host   .name</text><text x="550" y="86" text-anchor="middle" class="svg-muted" font-size="12">.result</text><text x="550" y="108" text-anchor="middle" class="svg-muted" font-size="12">.changed   .failed</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">.diff</text><text x="550" y="152" text-anchor="middle" class="svg-muted" font-size="12">.exception</text>
</svg><p class="cap">What nr.run() returns: a dict of lists of Results.</p></div>

<h3>The three objects</h3>
<table class="cmp"><tr><th>Object</th><th>What it is</th><th>You use it to</th></tr>
<tr><td><code>AggregatedResult</code></td><td>A dictionary, host name to <code>MultiResult</code></td><td>Loop over hosts, read <code>.failed</code> and <code>.failed_hosts</code></td></tr>
<tr><td><code>MultiResult</code></td><td>A list of <code>Result</code>: the task itself first, then its sub-tasks in order</td><td>Pick <code>[0]</code> for the final answer; <code>.failed</code> is true if any item failed</td></tr>
<tr><td><code>Result</code></td><td>One task outcome</td><td>Read <code>.result</code>, <code>.changed</code>, <code>.diff</code>, <code>.exception</code>, <code>.name</code></td></tr></table>

<h3>A task with sub-tasks</h3>
<p>A task is a function. It receives a <code>task</code> object as its first argument and may return a <code>Result</code>. Inside it you call other tasks with <code>task.run()</code>. This one asks for the host name, asks for the clock, and returns one sentence.</p>
<pre class="code">def probe(task):
<span class="hl">    clock = task.run(task=netmiko_send_command, command_string="show hostname", name="hostname")</span>
<span class="hl">    task.run(task=netmiko_send_command, command_string="show clock", name="clock")</span>
<span class="hl">    return Result(host=task.host, result="hostname says " + clock.result.split()[1])</span></pre>
<p>Three things to notice. <code>task.host</code> is the host this copy of the task is running for; Nornir starts the function once per host, so you write it for <b>one</b> device. <code>name="hostname"</code> gives the sub-task a readable name (without it the name is the function name, <code>netmiko_send_command</code>). And <code>task.run()</code> returns the sub-task's own results, so <code>clock.result</code> is the text of the reply.</p>
<p>If your function returns a plain string (as the <code>version</code> task does in Lab 2), Nornir wraps it into a <code>Result</code> for you. Return an explicit <code>Result</code> when you also want to set <code>changed</code>, as the backup task does in chapter 5.</p>

<h3>Reading the result</h3>
<pre class="out">AUTO01$ python3 results.py
probe***************************************************************************
* e1 ** changed : False ********************************************************
vvvv probe ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
<span class="hl">hostname says E1</span>
---- hostname ** changed : False ----------------------------------------------- INFO
Hostname: E1
FQDN:     E1
---- clock ** changed : False -------------------------------------------------- INFO
Sun Oct 11 15:23:30 2026
Timezone: UTC
Clock source: local
^^^^ END probe ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
<span class="hl">AggregatedResult ['e1'] -&gt; MultiResult 3</span>
[('probe', False, False), ('hostname', False, False), ('clock', False, False)]
<span class="hl">hostname says E1 | e1 | False</span></pre>
<p><code>print_result</code> from <code>nornir_utils</code> prints the whole tree: a header for the task, then each sub-task between lines, with <code>changed : False</code> for each. Good for exploring, too noisy for a script. The last three lines show the objects: the outer type is <code>AggregatedResult</code> with the key <code>e1</code>, its value is a <code>MultiResult</code> with 3 items, and the items are <code>probe</code>, <code>hostname</code>, <code>clock</code> in that order. In your own code you print what you need: <code>multi[0].result</code>, <code>multi.failed</code>.</p>

<div class="eg"><p><b>Worked example: which index?</b> After <code>result = nr.run(task=probe)</code>, the text returned by the task is <code>result["e1"][0].result</code>. The reply to the <code>show clock</code> sub-task is <code>result["e1"][2].result</code>. If you call a plugin task directly, as in <code>first.py</code>, there are no sub-tasks and index <code>[0]</code> is the command output.</p></div>

<h3>Arguments and names</h3>
<p>Extra keyword arguments to <code>nr.run()</code> go to the task function: <code>nr.run(task=backup, folder=folder)</code> calls <code>backup(task, folder=folder)</code> for every host. The task function never loops over hosts; Nornir does that.</p>

<div class="warn"><p><b>Common mistake.</b> Looping over hosts inside the task, or reading <code>nr.inventory.hosts</code> in it. The task already runs per host, so use <code>task.host</code>. A loop inside would run N times N and open N times N connections.</p></div>
<div class="exam"><p><b>Exam trap.</b> The first item of a <code>MultiResult</code> is the <b>parent</b> task, not the first sub-task. A task that calls three sub-tasks gives a list of four results. Counting from zero without this rule gives the wrong item.</p></div>

<div class="scn"><h4>The wrong index</h4><p>A task ran two sub-tasks, the host name and the clock. An engineer printed <code>result["e1"][1].result</code> expecting the clock and got the host name text. Item 0 is the task itself, so the sub-tasks sit at 1 and 2, in the order they ran. Giving each sub-task a <code>name=</code> and checking <code>[r.name for r in multi]</code> removed the guessing.</p><p><b>Lesson:</b> when unsure, print the names and the length of the MultiResult.</p></div>

<div class="iv"><p class="q">"What does nr.run() return?"</p><p>An <code>AggregatedResult</code>: a dict from host name to a <code>MultiResult</code>. A <code>MultiResult</code> is a list of <code>Result</code> objects, the task first and then its sub-tasks. Each <code>Result</code> has <code>result</code>, <code>changed</code>, <code>failed</code>, <code>diff</code> and <code>exception</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A task is a function of one host; Nornir calls it once per host.</li>
<li><code>task.run()</code> starts a sub-task and returns its results.</li>
<li>Result tree: <code>AggregatedResult</code> to <code>MultiResult</code> to <code>Result</code>.</li>
<li>Index <code>[0]</code> of a <code>MultiResult</code> is the parent task.</li>
<li>Use <code>print_result</code> to explore and your own prints in scripts.</li>
</ul></div>
`,hi:`
<p>Aap ek task chala chuke ho: <code>netmiko_send_command</code> aisa task hai jo kisi aur ne likha hai. Yeh chapter dikhata hai ki tasks chhote tasks se kaise bante hain aur <code>nr.run()</code> ka wapas diya object asal mein kya rakhta hai. Yeh tasveer samajh aate hi baaki har chapter isi ka ek variation lagta hai.</p>

<h3>Ek analogy: restaurant kitchen ke orders</h3>
<p>Har table (ek host) order bhejta hai. Order ki ek main line hai, "do logon ka dinner", aur uske neeche sub-lines: soup, main, dessert. Kitchen board (<b>AggregatedResult</b>) mein har table ka ek ticket hota hai. Ticket (<b>MultiResult</b>) pehle main line list karta hai, phir sub-lines. Har line (<b>Result</b>) batati hai ki kya serve hua, kuch badla ya nahi, aur kuch galat hua ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AggregatedResult, MultiResult and Result">
<rect x="10" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">AggregatedResult</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="11">a dict: host name to MultiResult</text>
<rect x="30" y="64" width="150" height="26" rx="6" fill="#bae6fd"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="12">"r1" : MultiResult</text>
<rect x="30" y="98" width="150" height="26" rx="6" fill="#bbf7d0"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">"e1" : MultiResult</text>
<rect x="30" y="132" width="150" height="26" rx="6" fill="#fecaca"/><text x="105" y="150" text-anchor="middle" class="svg-ink" font-size="12">"r3" : MultiResult (failed)</text>
<line x1="180" y1="111" x2="250" y2="111" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="10" width="190" height="170" rx="10" fill="#e2e8f0"/><text x="345" y="32" text-anchor="middle" class="svg-ink" font-size="13">MultiResult of e1</text><text x="345" y="48" text-anchor="middle" class="svg-muted" font-size="11">a list, in the order the tasks ran</text>
<rect x="270" y="64" width="150" height="26" rx="6" fill="#fde68a"/><text x="345" y="82" text-anchor="middle" class="svg-ink" font-size="12">[0] probe (your task)</text>
<rect x="270" y="98" width="150" height="26" rx="6" fill="#fed7aa"/><text x="345" y="116" text-anchor="middle" class="svg-ink" font-size="12">[1] hostname (sub-task)</text>
<rect x="270" y="132" width="150" height="26" rx="6" fill="#fed7aa"/><text x="345" y="150" text-anchor="middle" class="svg-ink" font-size="12">[2] clock (sub-task)</text>
<line x1="420" y1="77" x2="470" y2="77" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="10" width="160" height="170" rx="10" fill="#e2e8f0"/><text x="550" y="32" text-anchor="middle" class="svg-ink" font-size="13">one Result</text>
<text x="550" y="64" text-anchor="middle" class="svg-muted" font-size="12">.host   .name</text><text x="550" y="86" text-anchor="middle" class="svg-muted" font-size="12">.result</text><text x="550" y="108" text-anchor="middle" class="svg-muted" font-size="12">.changed   .failed</text><text x="550" y="130" text-anchor="middle" class="svg-muted" font-size="12">.diff</text><text x="550" y="152" text-anchor="middle" class="svg-muted" font-size="12">.exception</text>
</svg><p class="cap">What nr.run() returns: a dict of lists of Results.</p></div>

<h3>Teen objects</h3>
<table class="cmp"><tr><th>Object</th><th>Kya hai</th><th>Kis liye use karte ho</th></tr>
<tr><td><code>AggregatedResult</code></td><td>Dictionary, host name se <code>MultiResult</code> tak</td><td>Hosts par loop, <code>.failed</code> aur <code>.failed_hosts</code> padhna</td></tr>
<tr><td><code>MultiResult</code></td><td><code>Result</code> ki list: pehle task khud, phir uske sub-tasks order se</td><td>Final jawab ke liye <code>[0]</code>; koi bhi item fail ho to <code>.failed</code> true</td></tr>
<tr><td><code>Result</code></td><td>Ek task ka nateeja</td><td><code>.result</code>, <code>.changed</code>, <code>.diff</code>, <code>.exception</code>, <code>.name</code> padhna</td></tr></table>

<h3>Sub-tasks wala task</h3>
<p>Task ek function hai. Use pehle argument ki tarah <code>task</code> object milta hai aur woh <code>Result</code> return kar sakta hai. Andar aap <code>task.run()</code> se dusre tasks bulate ho. Yeh task host ka naam poochta hai, clock poochta hai, aur ek vaakya return karta hai.</p>
<pre class="code">def probe(task):
<span class="hl">    clock = task.run(task=netmiko_send_command, command_string="show hostname", name="hostname")</span>
<span class="hl">    task.run(task=netmiko_send_command, command_string="show clock", name="clock")</span>
<span class="hl">    return Result(host=task.host, result="hostname says " + clock.result.split()[1])</span></pre>
<p>Teen baatein dhyaan do. <code>task.host</code> woh host hai jiske liye task ki yeh copy chal rahi hai; Nornir function ko har host ke liye ek baar start karta hai, isliye aap use <b>ek</b> device ke liye likhte ho. <code>name="hostname"</code> sub-task ko padhne layak naam deta hai (iske bina naam function ka naam hota, <code>netmiko_send_command</code>). Aur <code>task.run()</code> sub-task ke apne results lautata hai, isliye <code>clock.result</code> reply ka text hai.</p>
<p>Agar aapka function plain string return kare (jaise Lab 2 ka <code>version</code> task), to Nornir use khud <code>Result</code> mein lapet deta hai. Jab <code>changed</code> bhi set karna ho, explicit <code>Result</code> return karo, jaise chapter 5 ka backup task karta hai.</p>

<h3>Result padhna</h3>
<pre class="out">AUTO01$ python3 results.py
probe***************************************************************************
* e1 ** changed : False ********************************************************
vvvv probe ** changed : False vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv INFO
<span class="hl">hostname says E1</span>
---- hostname ** changed : False ----------------------------------------------- INFO
Hostname: E1
FQDN:     E1
---- clock ** changed : False -------------------------------------------------- INFO
Sun Oct 11 15:23:30 2026
Timezone: UTC
Clock source: local
^^^^ END probe ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
<span class="hl">AggregatedResult ['e1'] -&gt; MultiResult 3</span>
[('probe', False, False), ('hostname', False, False), ('clock', False, False)]
<span class="hl">hostname says E1 | e1 | False</span></pre>
<p><code>nornir_utils</code> ka <code>print_result</code> poora tree print karta hai: task ka header, phir har sub-task lines ke beech, har ek ke liye <code>changed : False</code> ke saath. Explore karne ke liye accha, script ke liye bahut shor. Aakhri teen lines objects dikhati hain: bahar ka type <code>AggregatedResult</code> hai jiski key <code>e1</code> hai, uski value 3 items wala <code>MultiResult</code> hai, aur items order mein <code>probe</code>, <code>hostname</code>, <code>clock</code> hain. Apne code mein wahi print karo jo chahiye: <code>multi[0].result</code>, <code>multi.failed</code>.</p>

<div class="eg"><p><b>Worked example: kaunsa index?</b> <code>result = nr.run(task=probe)</code> ke baad task ka lautaya text <code>result["e1"][0].result</code> hai. <code>show clock</code> sub-task ka reply <code>result["e1"][2].result</code> hai. Agar aap plugin task seedha bulate ho, jaise <code>first.py</code> mein, to sub-tasks nahi hote aur index <code>[0]</code> command ka output hai.</p></div>

<h3>Arguments aur names</h3>
<p><code>nr.run()</code> ke extra keyword arguments task function ko jaate hain: <code>nr.run(task=backup, folder=folder)</code> har host ke liye <code>backup(task, folder=folder)</code> bulata hai. Task function kabhi hosts par loop nahi karta; woh Nornir karta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Task ke andar hosts par loop karna, ya usme <code>nr.inventory.hosts</code> padhna. Task pehle se per host chalta hai, isliye <code>task.host</code> use karo. Andar loop ho to N guna N baar chalega aur N guna N connections khulenge.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>MultiResult</code> ka pehla item <b>parent</b> task hai, pehla sub-task nahi. Teen sub-tasks bulane wala task chaar results ki list deta hai. Is rule ke bina zero se ginne par galat item milta hai.</p></div>

<div class="scn"><h4>Galat index</h4><p>Ek task ne do sub-tasks chalaye, host name aur clock. Engineer ne clock ke liye <code>result["e1"][1].result</code> print kiya aur host name ka text mila. Item 0 task khud hai, isliye sub-tasks 1 aur 2 par hain, jis order mein chale. Har sub-task ko <code>name=</code> dena aur <code>[r.name for r in multi]</code> dekhna andaaza lagana khatam kar deta hai.</p><p><b>Lesson:</b> shak ho to MultiResult ke names aur length print karo.</p></div>

<div class="iv"><p class="q">"nr.run() kya return karta hai?"</p><p>Ek <code>AggregatedResult</code>: host name se <code>MultiResult</code> tak ki dict. <code>MultiResult</code>, <code>Result</code> objects ki list hai, pehle task phir uske sub-tasks. Har <code>Result</code> mein <code>result</code>, <code>changed</code>, <code>failed</code>, <code>diff</code> aur <code>exception</code> hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Task ek host ka function hai; Nornir use har host ke liye ek baar bulata hai.</li>
<li><code>task.run()</code> sub-task start karta hai aur uske results lautata hai.</li>
<li>Result tree: <code>AggregatedResult</code> se <code>MultiResult</code> se <code>Result</code>.</li>
<li><code>MultiResult</code> ka index <code>[0]</code> parent task hai.</li>
<li>Explore ke liye <code>print_result</code>, scripts mein apne prints.</li>
</ul></div>
`}};export{e as default};