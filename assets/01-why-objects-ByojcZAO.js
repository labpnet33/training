var e={id:`why-objects`,h:{en:`Why objects: what you will learn, prerequisites and the big picture`,hi:`Objects kyun: aap kya seekhoge, prerequisites aur big picture`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you will be able to describe a network device, an interface or a VLAN as one tidy <b>object</b> instead of a loose dictionary. You will:</p>
<ul>
<li>write a <b>class</b> with <code>__init__</code>, attributes and methods, and explain what <code>self</code> means;</li>
<li>make objects print in a readable way with <code>__str__</code> and <code>__repr__</code>, and compare them with <code>==</code>;</li>
<li>add computed values with <code>@property</code> and refuse bad values such as VLAN 5000;</li>
<li>replace boilerplate with <code>@dataclass</code>, and use defaults, <code>field(default_factory=list)</code>, <code>frozen</code> and <code>order</code>;</li>
<li>share code with inheritance (<code>Router</code> and <code>Switch</code> from <code>Device</code>) and <code>super()</code>;</li>
<li>sort, filter, group and save lists of objects as JSON;</li>
<li>read and fix the classic class bugs: the shared default list, a forgotten argument and a method without <code>self</code>.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <b>auto-intro</b> (your first script), <b>auto-py-basics</b> (variables, strings, f-strings), <b>auto-py-data</b> (lists, dictionaries, loops) and <b>auto-py-func</b> (functions, files, <code>try</code> and <code>except</code>). You also need the Linux shell basics: <code>cat</code>, <code>ls</code>, running <code>python3 file.py</code>. Everything here is plain Python; there is nothing to install. The next module, <b>py-iter</b>, builds on this one: comprehensions and generators work beautifully on lists of objects.</p>

<h3>Analogy: the device record card</h3>
<p>Imagine the NOC keeps a paper card for every router. Every card has the same boxes: name, role, management IP, site. Anyone can pick up any card and know where to look. The blank <b>printed form</b> is the <b>class</b>. Each filled-in card is an <b>object</b> (also called an <b>instance</b>). The form guarantees the boxes; the filled card holds the facts. A good card also carries a few rules written on the back, for example "a core router is one whose role box says core". Those rules are the <b>methods</b>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One class, three objects">
<rect x="20" y="30" width="190" height="125" rx="10" fill="#ddd6fe"/><text x="115" y="54" text-anchor="middle" class="svg-ink" font-size="13">class Device</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="11">name, role, ip, site</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">is_core, __str__</text><text x="115" y="132" text-anchor="middle" class="svg-accent" font-size="12">the blank form</text>
<rect x="290" y="14" width="170" height="50" rx="8" fill="#bae6fd"/><text x="375" y="36" text-anchor="middle" class="svg-ink" font-size="12">PUN-CORE-R1</text><text x="375" y="53" text-anchor="middle" class="svg-muted" font-size="10">core 10.99.0.1 Pune</text>
<rect x="290" y="72" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="375" y="94" text-anchor="middle" class="svg-ink" font-size="12">BLR-EDGE-R2</text><text x="375" y="111" text-anchor="middle" class="svg-muted" font-size="10">edge 10.99.0.2 Bengaluru</text>
<rect x="290" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="375" y="152" text-anchor="middle" class="svg-ink" font-size="12">HYD-EDGE-R3</text><text x="375" y="169" text-anchor="middle" class="svg-muted" font-size="10">edge 10.99.0.3 Hyderabad</text>
<line x1="210" y1="92" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="92" x2="290" y2="97" stroke="#64748b" stroke-width="2"/><line x1="210" y1="92" x2="290" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="550" y="97" text-anchor="middle" class="svg-accent" font-size="12">three objects</text>
</svg><p class="cap">One class (the form), many objects (the filled cards).</p></div>

<h3>The problem with loose dictionaries</h3>
<p>In the earlier modules you stored a device in a dictionary. That is fine for ten lines. It becomes painful when forty scripts each invent their own keys: one writes <code>"hostname"</code>, another <code>"name"</code>. Python only complains when it runs the wrong line:</p>
<pre class="code">device = {"name": "PUN-CORE-R1", "ip": "10.99.0.1"}
print(device["hostname"])</pre>
<pre class="out">AUTO01$ python3 d1.py
Traceback (most recent call last):
  File "d1.py", line 2, in &lt;module&gt;
    print(device["hostname"])
<span class="hl">KeyError: 'hostname'</span></pre>
<p>A dictionary cannot tell you which keys are allowed, cannot carry behaviour, and prints as an unstructured blob. A class fixes all three: the allowed attributes are written in one place, the rules sit next to the data, and you control how the object prints.</p>

<div class="eg"><p><b>Worked example.</b> Your inventory file has three rows. With dictionaries you write <code>d["role"] == "core"</code> everywhere. With a class you write <code>d.is_core</code> everywhere, and the definition of "core" lives in exactly one place. When the company later adds a role called <code>spine</code>, you change one method, not ten scripts.</p></div>

<h3>The two labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>Files on AUTO01</th><th>Job</th></tr>
<tr><td>Lab 1 (configure)</td><td><code>inventory.csv</code>, <code>netmodel.py</code>, <code>main.py</code></td><td>Turn the inventory into <code>Device</code> objects: <code>__str__</code>, <code>__repr__</code>, a property, then a dataclass</td></tr>
<tr><td>Lab 2 (troubleshoot)</td><td><code>devmodel.py</code>, <code>audit.py</code></td><td>Fix the broken <code>Router</code> class: shared list, forgotten argument, missing <code>self</code></td></tr></table>
<p>Both labs run on the Ubuntu host AUTO01 (user <code>netadmin</code>). You write code with <code>cat &gt;&gt; file &lt;&lt;'EOF'</code> and check it with <code>python3 main.py</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking a class is "advanced" and avoiding it; classes are just records with rules. Creating a class when a plain function would do: if there is no data to keep together, you do not need one. Mixing up the class (the form) and an object (a filled card).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Class" and "object" are not synonyms. <code>Device</code> is the class; <code>Device("R1", ...)</code> creates an object. Calling the class creates the object.</p></div>

<div class="scn"><h4>Forty scripts, three spellings</h4><p>A team kept device facts in dictionaries. One script used <code>"hostname"</code>, another <code>"name"</code>, a third <code>"host"</code>. An inventory export changed one key and two nightly reports crashed with <code>KeyError</code> at 02:00. After the team moved to one shared <code>Device</code> class, a typo gave an immediate <code>AttributeError</code> in testing, and the allowed fields were written in a single file.</p><p><b>Lesson:</b> one agreed shape beats forty private ones.</p></div>

<div class="iv"><p class="q">"Why use a class instead of a dictionary for a device?"</p><p>A class fixes the allowed fields in one place, attaches behaviour such as <code>is_core</code> to the data, and controls how the object prints. A typo fails loudly and early. I still use dictionaries for quick, throwaway data, and convert to objects when the same shape is used in many places.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A class is the blank form; an object is one filled-in card built from it.</li>
<li>Dictionaries invite inconsistent keys and late <code>KeyError</code>s; classes give one agreed shape.</li>
<li>Rules about a device (methods, properties) live next to its data.</li>
<li>Lab 1 builds a <code>Device</code> class; Lab 2 repairs a broken <code>Router</code>.</li>
<li>Prerequisites: auto-intro, auto-py-basics, auto-py-data, auto-py-func. Next module: py-iter.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Is module ke ant tak aap network device, interface ya VLAN ko loose dictionary ki jagah ek saaf <b>object</b> ki tarah describe kar paoge. Aap yeh karoge:</p>
<ul>
<li><code>__init__</code>, attributes aur methods wali <b>class</b> likhna, aur <code>self</code> ka matlab samjhana;</li>
<li><code>__str__</code> aur <code>__repr__</code> se objects ko padhne layak print karna, aur <code>==</code> se compare karna;</li>
<li><code>@property</code> se computed values jodna aur VLAN 5000 jaisi galat values ko mana karna;</li>
<li><code>@dataclass</code> se boilerplate hatana, aur defaults, <code>field(default_factory=list)</code>, <code>frozen</code> aur <code>order</code> use karna;</li>
<li>inheritance (<code>Device</code> se <code>Router</code> aur <code>Switch</code>) aur <code>super()</code> se code share karna;</li>
<li>objects ki lists ko sort, filter, group karna aur JSON mein save karna;</li>
<li>classic class bugs padhna aur theek karna: shared default list, bhoola hua argument aur bina <code>self</code> wala method.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapne <b>auto-intro</b> (pehli script), <b>auto-py-basics</b> (variables, strings, f-strings), <b>auto-py-data</b> (lists, dictionaries, loops) aur <b>auto-py-func</b> (functions, files, <code>try</code> aur <code>except</code>) khatam kiye hone chahiye. Linux shell basics bhi chahiye: <code>cat</code>, <code>ls</code>, <code>python3 file.py</code> chalana. Yahan sab plain Python hai; kuch install nahi karna. Agla module <b>py-iter</b> isi par bana hai: comprehensions aur generators objects ki lists par bahut achhe chalte hain.</p>

<h3>Analogy: device record card</h3>
<p>Socho NOC har router ke liye paper card rakhta hai. Har card mein wahi dibbe hain: name, role, management IP, site. Koi bhi card uthao, pata hai kahan dekhna hai. Khaali <b>printed form</b> <b>class</b> hai. Har bhara hua card ek <b>object</b> (ya <b>instance</b>) hai. Form dibbon ki guarantee deta hai; bhara hua card facts rakhta hai. Achhe card ke peeche kuch rules bhi likhe hote hain, jaise "core router woh hai jiske role dibbe mein core likha ho". Yahi rules <b>methods</b> hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek class, teen objects">
<rect x="20" y="30" width="190" height="125" rx="10" fill="#ddd6fe"/><text x="115" y="54" text-anchor="middle" class="svg-ink" font-size="13">class Device</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="11">name, role, ip, site</text><text x="115" y="100" text-anchor="middle" class="svg-muted" font-size="11">is_core, __str__</text><text x="115" y="132" text-anchor="middle" class="svg-accent" font-size="12">khaali form</text>
<rect x="290" y="14" width="170" height="50" rx="8" fill="#bae6fd"/><text x="375" y="36" text-anchor="middle" class="svg-ink" font-size="12">PUN-CORE-R1</text><text x="375" y="53" text-anchor="middle" class="svg-muted" font-size="10">core 10.99.0.1 Pune</text>
<rect x="290" y="72" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="375" y="94" text-anchor="middle" class="svg-ink" font-size="12">BLR-EDGE-R2</text><text x="375" y="111" text-anchor="middle" class="svg-muted" font-size="10">edge 10.99.0.2 Bengaluru</text>
<rect x="290" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="375" y="152" text-anchor="middle" class="svg-ink" font-size="12">HYD-EDGE-R3</text><text x="375" y="169" text-anchor="middle" class="svg-muted" font-size="10">edge 10.99.0.3 Hyderabad</text>
<line x1="210" y1="92" x2="290" y2="40" stroke="#64748b" stroke-width="2"/><line x1="210" y1="92" x2="290" y2="97" stroke="#64748b" stroke-width="2"/><line x1="210" y1="92" x2="290" y2="155" stroke="#64748b" stroke-width="2"/>
<text x="550" y="97" text-anchor="middle" class="svg-accent" font-size="12">teen objects</text>
</svg><p class="cap">Ek class (form), kai objects (bhare hue cards).</p></div>

<h3>Loose dictionaries ki dikkat</h3>
<p>Pichhle modules mein aapne device ko dictionary mein rakha. Das lines ke liye theek hai. Dikkat tab hoti hai jab chaalis scripts apne apne keys bana lete hain: ek <code>"hostname"</code> likhta hai, doosra <code>"name"</code>. Python tabhi shikayat karta hai jab galat line chalti hai:</p>
<pre class="code">device = {"name": "PUN-CORE-R1", "ip": "10.99.0.1"}
print(device["hostname"])</pre>
<pre class="out">AUTO01$ python3 d1.py
Traceback (most recent call last):
  File "d1.py", line 2, in &lt;module&gt;
    print(device["hostname"])
<span class="hl">KeyError: 'hostname'</span></pre>
<p>Dictionary yeh nahi bata sakti ki kaunse keys allowed hain, behaviour nahi rakh sakti, aur unstructured blob ki tarah print hoti hai. Class teeno theek karti hai: allowed attributes ek jagah likhe hote hain, rules data ke paas rehte hain, aur object kaise print ho yeh aap tay karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Aapki inventory file mein teen rows hain. Dictionaries ke saath har jagah <code>d["role"] == "core"</code> likhte ho. Class ke saath har jagah <code>d.is_core</code> likhte ho, aur "core" ki definition sirf ek jagah rehti hai. Kal company <code>spine</code> naam ka role jodti hai to aap ek method badalte ho, das scripts nahi.</p></div>

<h3>Is module ke do labs</h3>
<table class="cmp"><tr><th>Lab</th><th>AUTO01 par files</th><th>Kaam</th></tr>
<tr><td>Lab 1 (configure)</td><td><code>inventory.csv</code>, <code>netmodel.py</code>, <code>main.py</code></td><td>Inventory ko <code>Device</code> objects banao: <code>__str__</code>, <code>__repr__</code>, ek property, phir dataclass</td></tr>
<tr><td>Lab 2 (troubleshoot)</td><td><code>devmodel.py</code>, <code>audit.py</code></td><td>Toote hue <code>Router</code> class ko theek karo: shared list, bhoola hua argument, missing <code>self</code></td></tr></table>
<p>Dono labs Ubuntu host AUTO01 (user <code>netadmin</code>) par chalte hain. Code <code>cat &gt;&gt; file &lt;&lt;'EOF'</code> se likhte ho aur <code>python3 main.py</code> se check karte ho.</p>

<div class="warn"><p><b>Common mistakes.</b> Class ko "advanced" samajh kar avoid karna; class bas rules wala record hai. Jahan plain function kaafi ho wahan class banana: agar saath rakhne layak data nahi hai to class ki zaroorat nahi. Class (form) aur object (bhara card) ko mila dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Class" aur "object" same cheez nahi hain. <code>Device</code> class hai; <code>Device("R1", ...)</code> object banata hai. Class ko call karne se object banta hai.</p></div>

<div class="scn"><h4>Chaalis scripts, teen spellings</h4><p>Ek team device facts dictionaries mein rakhti thi. Ek script <code>"hostname"</code>, doosri <code>"name"</code>, teesri <code>"host"</code> use karti thi. Inventory export ne ek key badli aur raat 02:00 baje do nightly reports <code>KeyError</code> se crash hui. Team ne ek shared <code>Device</code> class apnayi to typo par testing mein hi turant <code>AttributeError</code> aaya, aur allowed fields ek file mein likhe the.</p><p><b>Lesson:</b> ek tay shape chaalis private shapes se behtar hai.</p></div>

<div class="iv"><p class="q">"Device ke liye dictionary ki jagah class kyun use karte hain?"</p><p>Class allowed fields ek jagah tay karti hai, <code>is_core</code> jaise behaviour ko data ke saath jodti hai, aur object ka print control karti hai. Typo loudly aur jaldi fail hota hai. Quick, throwaway data ke liye main abhi bhi dictionary use karta hoon, aur jab wahi shape kai jagah chale tab objects mein badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Class khaali form hai; object usse bana ek bhara hua card hai.</li>
<li>Dictionaries inconsistent keys aur late <code>KeyError</code> bulati hain; classes ek tay shape deti hain.</li>
<li>Device ke rules (methods, properties) uske data ke paas rehte hain.</li>
<li>Lab 1 <code>Device</code> class banata hai; Lab 2 toote <code>Router</code> ko theek karta hai.</li>
<li>Prerequisites: auto-intro, auto-py-basics, auto-py-data, auto-py-func. Agla module: py-iter.</li>
</ul></div>
`}};export{e as default};