var e={id:`objects-methods`,h:{en:`Objects, methods and imports in plain words: what the dots mean`,hi:`Objects, methods aur imports saadi bhasha mein: dots ka matlab`},body:{en:`
<p>Look at <code>ip.version</code>, <code>name.upper()</code> and <code>conn.send_command("show version")</code>. They all have <b>dots</b>, and the dots scare beginners. This chapter explains the single idea behind them, so that every later script reads like a sentence.</p>

<h3>Analogy: a router is an object</h3>
<p>Think of a real router. It has <b>facts about it</b>: hostname, model, software version. It also has <b>things it can do</b>: show its routing table, save its config, reload. Programmers call such a thing an <b>object</b>. The facts are its <b>attributes</b>. The things it can do are its <b>methods</b>.</p>
<table class="cmp">
<tr><th>Real router</th><th>In code</th><th>Name</th></tr>
<tr><td>The device itself</td><td><code>conn</code></td><td>object</td></tr>
<tr><td>Its software version</td><td><code>conn.version</code></td><td>attribute (a fact, no brackets)</td></tr>
<tr><td>"Run show version"</td><td><code>conn.send_command("show version")</code></td><td>method (an action, with brackets)</td></tr>
</table>

<h3>The rule of the dot</h3>
<p><b>thing.something</b> means: <i>look inside the thing and get something</i>. If the something is followed by brackets, it is an <b>action</b>, and the text inside the brackets is what you give it to work on (the <b>argument</b>). If there are no brackets, it is a <b>fact</b>.</p>
<pre class="code">import ipaddress

ip = ipaddress.ip_address("10.60.7.12")
print(ip.version)
print(ip.is_private)

name = "r1-core"
print(name.upper())
print(name.split("-"))</pre>
<pre class="out">4
True
R1-CORE
['r1', 'core']</pre>
<p><code>ip</code> is an object. <code>ip.version</code> and <code>ip.is_private</code> are facts about it. <code>name</code> is a string, and even a string is an object: <code>name.upper()</code> is an action that returns the text in capitals, and <code>name.split("-")</code> cuts the text at every dash and gives a list.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Object with attributes and methods">
<rect x="230" y="15" width="180" height="140" rx="12" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">conn (an object)</text>
<rect x="245" y="55" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="73" text-anchor="middle" class="svg-ink" font-size="12">facts (attributes)</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">conn.version</text>
<rect x="245" y="105" width="150" height="40" rx="8" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">actions (methods)</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">conn.send_command(...)</text>
<text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">thing.something</text><line x1="170" y1="86" x2="230" y2="86" stroke="#64748b" stroke-width="2"/>
<text x="540" y="75" text-anchor="middle" class="svg-muted" font-size="12">no brackets = a fact</text><text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">brackets = do it</text>
</svg><p class="cap">The dot opens the object. Brackets mean an action.</p></div>

<h3>Where do objects come from? Imports and pip</h3>
<p>Python ships with a few things and has a huge library of ready-made toolboxes called <b>modules</b>. <code>import ipaddress</code> says: open the toolbox called <code>ipaddress</code> so I can use what is inside. Python's own toolboxes such as <code>ipaddress</code>, <code>csv</code> and <code>json</code> are already installed.</p>
<p>Toolboxes written by other people, such as the SSH library used in the automation modules, are not built in. You fetch them once with <code>pip</code>, the package installer, like buying a new toolbox from a shop (a reference command, not run in the simulator):</p>
<pre class="code">$ pip install requests</pre>
<p>After that, <code>import requests</code> works in any script. The lab already has what you need installed, so you can focus on the code first. The virtual environment chapter later shows how to keep each project's toolboxes separate.</p>

<h3>How to discover what an object can do</h3>
<pre class="code">&gt;&gt;&gt; name = "r1-core"
&gt;&gt;&gt; type(name)
&lt;class 'str'&gt;
&gt;&gt;&gt; help(name.upper)</pre>
<p>Open the interactive prompt by typing <code>python3</code>. <code>type()</code> tells you what kind of object you have. <code>help()</code> explains one method. <code>dir(name)</code> lists everything the object offers. You do not need to memorise them: the documentation and these three helpers answer most questions.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the brackets: <code>name.upper</code> does not run the action, it only points at it. (2) Adding brackets to a fact: <code>ip.version()</code> fails because 4 is not an action. (3) Naming your own script like a module, for example <code>ipaddress.py</code>, so that Python opens your file instead. (4) Installing a package with pip but running the script with a different Python.</p></div>
<div class="exam"><p><b>Interview trap.</b> Asked "what is the difference between a function and a method", answer: a method is a function that belongs to an object and is called with the dot, such as <code>name.upper()</code>.</p></div>

<div class="scn"><h4>The script that printed an address of nowhere</h4><p>A junior engineer wrote <code>print(conn.send_command)</code> to show the output of a command and got a strange line about a "bound method". The command had never run. He had forgotten the brackets and the argument. After he wrote <code>conn.send_command("show ip interface brief")</code> the table appeared.</p><p><b>Lesson:</b> a dot with no brackets points at the action; brackets run it.</p></div>

<div class="iv"><p class="q">"What does <code>import</code> do in Python?"</p><p>It makes a module's contents available to your script. Mention that standard modules come with Python, third-party ones are installed with pip, and that you call things inside with the dot, such as <code>ipaddress.ip_address(...)</code>. Add that you would use a virtual environment for each project.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An object has facts (attributes) and actions (methods).</li>
<li>thing.something looks inside the thing; brackets run an action.</li>
<li>import opens a toolbox; pip installs toolboxes made by others.</li>
<li>type(), dir() and help() let you explore any object.</li>
<li>Never name your script after a module.</li>
</ul></div>
`,hi:`
<p><code>ip.version</code>, <code>name.upper()</code> aur <code>conn.send_command("show version")</code> dekho. Sab mein <b>dots</b> hain, aur dots beginners ko daraate hain. Yeh chapter unke peeche ki ek hi idea samjhata hai, taaki aage ki har script ek sentence ki tarah padhi jaye.</p>

<h3>Analogy: router ek object hai</h3>
<p>Ek real router socho. Uske baare mein <b>facts</b> hain: hostname, model, software version. Woh <b>kuch kaam</b> bhi kar sakta hai: routing table dikhana, config save karna, reload. Programmers aisi cheez ko <b>object</b> kehte hain. Facts uske <b>attributes</b> hain. Jo kaam woh kar sakta hai woh uske <b>methods</b> hain.</p>
<table class="cmp">
<tr><th>Real router</th><th>Code mein</th><th>Naam</th></tr>
<tr><td>Device khud</td><td><code>conn</code></td><td>object</td></tr>
<tr><td>Uska software version</td><td><code>conn.version</code></td><td>attribute (fact, bina brackets)</td></tr>
<tr><td>"show version chalao"</td><td><code>conn.send_command("show version")</code></td><td>method (action, brackets ke saath)</td></tr>
</table>

<h3>Dot ka rule</h3>
<p><b>thing.something</b> ka matlab: <i>thing ke andar dekho aur something nikalo</i>. Agar something ke baad brackets hain, to woh <b>action</b> hai, aur brackets ke andar ka text woh hai jo aap use kaam karne ko dete ho (<b>argument</b>). Brackets nahi hain to woh <b>fact</b> hai.</p>
<pre class="code">import ipaddress

ip = ipaddress.ip_address("10.60.7.12")
print(ip.version)
print(ip.is_private)

name = "r1-core"
print(name.upper())
print(name.split("-"))</pre>
<pre class="out">4
True
R1-CORE
['r1', 'core']</pre>
<p><code>ip</code> ek object hai. <code>ip.version</code> aur <code>ip.is_private</code> uske facts hain. <code>name</code> ek string hai, aur string bhi object hai: <code>name.upper()</code> ek action hai jo text ko capitals mein deta hai, aur <code>name.split("-")</code> text ko har dash par kaatkar list deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Attributes aur methods wala object">
<rect x="230" y="15" width="180" height="140" rx="12" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="14">conn (ek object)</text>
<rect x="245" y="55" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="73" text-anchor="middle" class="svg-ink" font-size="12">facts (attributes)</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">conn.version</text>
<rect x="245" y="105" width="150" height="40" rx="8" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">actions (methods)</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="11">conn.send_command(...)</text>
<text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">thing.something</text><line x1="170" y1="86" x2="230" y2="86" stroke="#64748b" stroke-width="2"/>
<text x="540" y="75" text-anchor="middle" class="svg-muted" font-size="12">brackets nahi = fact</text><text x="540" y="100" text-anchor="middle" class="svg-muted" font-size="12">brackets = karo</text>
</svg><p class="cap">Dot object ko kholta hai. Brackets matlab action.</p></div>

<h3>Objects kahan se aate hain? Imports aur pip</h3>
<p>Python kuch cheezon ke saath aata hai aur uske paas taiyaar toolboxes ki badi library hai jinhe <b>modules</b> kehte hain. <code>import ipaddress</code> kehta hai: <code>ipaddress</code> naam ka toolbox kholo taaki main andar ki cheezein use kar sakoon. Python ke apne toolboxes jaise <code>ipaddress</code>, <code>csv</code> aur <code>json</code> pehle se installed hote hain.</p>
<p>Doosron ke likhe toolboxes, jaise automation modules mein use hone wali SSH library, built-in nahi hote. Unhe aap ek baar <code>pip</code> se laate ho, package installer, jaise dukaan se naya toolbox khareedna (reference command, simulator mein nahi chalta):</p>
<pre class="code">$ pip install requests</pre>
<p>Uske baad <code>import requests</code> kisi bhi script mein chalta hai. Lab mein jo chahiye woh pehle se installed hai, isliye aap pehle code par dhyaan do. Virtual environment wala chapter aage dikhata hai ki har project ke toolboxes alag kaise rakhein.</p>

<h3>Object kya kar sakta hai yeh kaise pata karein</h3>
<pre class="code">&gt;&gt;&gt; name = "r1-core"
&gt;&gt;&gt; type(name)
&lt;class 'str'&gt;
&gt;&gt;&gt; help(name.upper)</pre>
<p><code>python3</code> type karke interactive prompt kholo. <code>type()</code> batata hai ki aapke paas kaunsa object hai. <code>help()</code> ek method samjhata hai. <code>dir(name)</code> woh sab list karta hai jo object offer karta hai. Sab ratne ki zaroorat nahi: documentation aur yeh teen helpers zyadatar sawaalon ka jawab dete hain.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Brackets bhoolna: <code>name.upper</code> action chalata nahi, sirf uski taraf ishaara karta hai. (2) Fact par brackets lagana: <code>ip.version()</code> fail hota hai kyunki 4 action nahi hai. (3) Apni script ka naam module jaisa rakhna, jaise <code>ipaddress.py</code>, taaki Python aapki file khol de. (4) pip se package install karna lekin script doosre Python se chalana.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Function aur method mein kya fark hai" poochhe to jawab: method woh function hai jo kisi object ka hota hai aur dot se call hota hai, jaise <code>name.upper()</code>.</p></div>

<div class="scn"><h4>Woh script jisne kahin ka address print kiya</h4><p>Ek junior engineer ne command ka output dikhane ke liye <code>print(conn.send_command)</code> likha aur use "bound method" wali ajeeb line mili. Command kabhi chala hi nahi tha. Woh brackets aur argument bhool gaya tha. <code>conn.send_command("show ip interface brief")</code> likhne par table aa gayi.</p><p><b>Lesson:</b> bina brackets ka dot action ki taraf ishaara karta hai; brackets use chalate hain.</p></div>

<div class="iv"><p class="q">"Python mein <code>import</code> kya karta hai?"</p><p>Yeh module ka content aapki script ke liye available karta hai. Batao ki standard modules Python ke saath aate hain, third-party pip se install hote hain, aur andar ki cheezein dot se call hoti hain, jaise <code>ipaddress.ip_address(...)</code>. Yeh bhi jodo ki har project ke liye virtual environment use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Object ke paas facts (attributes) aur actions (methods) hote hain.</li>
<li>thing.something thing ke andar dekhta hai; brackets action chalate hain.</li>
<li>import toolbox kholta hai; pip doosron ke banaye toolboxes install karta hai.</li>
<li>type(), dir() aur help() se kisi bhi object ko explore karo.</li>
<li>Apni script ka naam kabhi module jaisa mat rakho.</li>
</ul></div>
`}};export{e as default};