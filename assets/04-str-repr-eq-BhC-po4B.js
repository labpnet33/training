var e={id:`str-repr-eq`,h:{en:`Readable objects: __str__, __repr__, == and sorting (Lab 1 tasks 2 and 3)`,hi:`Padhne layak objects: __str__, __repr__, == aur sorting (Lab 1 tasks 2 aur 3)`},body:{en:`
<p><b>The idea of this chapter:</b> out of the box, printing a <code>Device</code> shows a memory address. Python lets you teach every class how to introduce itself, how to be shown in a list, and how to be compared. These hooks are called <b>special methods</b> (or dunder methods), because their names start and end with two underscores.</p>

<h3>Analogy: name badge and passport</h3>
<p>At a conference you wear a name badge: short and friendly, for people. At the airport you show a passport: precise and unambiguous, for officials and debugging. <code>__str__</code> is the badge, for users and reports. <code>__repr__</code> is the passport, for developers and logs.</p>

<h3>__str__ and __repr__</h3>
<p>Python calls <code>__str__</code> when you <code>print(obj)</code>, use <code>str(obj)</code> or put the object in an f-string. It calls <code>__repr__</code> when you use <code>repr(obj)</code>, when a <b>list</b> prints its items, and in the interactive prompt. If you write only <code>__repr__</code>, Python uses it for both jobs; if you write only <code>__str__</code>, lists still show the ugly address. That is exactly what Lab 1 shows.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    def __repr__(self):
        return f"Device({self.name!r})"


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1)
print(repr(r1))
print([r1, r2])
print(f"{r1}")
print(f"{r1!r}")
print("devices: " + str(r1))</pre>
<pre class="out">AUTO01$ python3 c4a.py
PUN-CORE-R1 (core) 10.99.0.1
Device('PUN-CORE-R1')
[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2')]
PUN-CORE-R1 (core) 10.99.0.1
Device('PUN-CORE-R1')
devices: PUN-CORE-R1 (core) 10.99.0.1</pre>
<p><code>print(r1)</code> uses the badge. <code>repr(r1)</code> uses the passport. The list prints passports for its items. In an f-string, <code>{r1}</code> means <code>str</code> and <code>{r1!r}</code> means <code>repr</code>. Inside <code>__repr__</code> the <code>!r</code> on <code>self.name</code> adds the quotes, so the output looks like the code you would type to build the object.</p>

<h3>Lab 1, tasks 2 and 3 step by step</h3>
<p>The class in <code>netmodel.py</code> is the last thing in the file, so you can append a method with <code>cat &gt;&gt;</code>. Task 2:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">PUN-CORE-R1 (core) 10.99.0.1</span>
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[&lt;netmodel.Device object at 0x7f007f3a1c50&gt;, &lt;netmodel.Device object at 0x7f007f3a1c80&gt;, &lt;netmodel.Device object at 0x7f007f3a1cb0&gt;]</pre>
<p>The three lines are now readable, but the last line, <code>print(devices)</code>, still shows addresses because a list uses <code>__repr__</code> for its items. The blank line in the heredoc matters: it separates the new method from <code>__init__</code>, and the four-space indent keeps it inside the class. Task 3 adds the passport:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    def __repr__(self):
        return f"Device({self.name!r})"
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
<span class="hl">[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3')]</span></pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Which special method Python calls">
<rect x="20" y="20" width="270" height="100" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">__str__ : the badge</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="11">print(obj), str(obj), f"{obj}"</text><text x="155" y="90" text-anchor="middle" class="svg-muted" font-size="11">for people and reports</text>
<rect x="350" y="20" width="270" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">__repr__ : the passport</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="11">repr(obj), items in a list, f"{obj!r}"</text><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="11">for developers and logs</text>
</svg><p class="cap">Two audiences, two methods.</p></div>

<h3>Comparing objects: == and sorting</h3>
<p>By default <code>==</code> asks "is this the very same object?". Two cards with identical facts are still two cards. To make <code>==</code> compare facts, write <code>__eq__</code>:</p>
<pre class="code">def __eq__(self, other):
    if not isinstance(other, Device):
        return False
    return (self.name, self.role, self.ip, self.site) == (other.name, other.role, other.ip, other.site)</pre>
<pre class="out">AUTO01$ python3 c4b.py
True False False
False
True</pre>
<p>That output is for <code>a == b</code> (same facts, different objects), <code>a == c</code> (different facts) and <code>a is b</code> (never the same object); then <code>a == "PUN-CORE-R1"</code>, which is <code>False</code> because a string is not a <code>Device</code>; and <code>a in [c, b]</code>, which uses <code>==</code> and finds the match. Without <code>__eq__</code>, the plain comparison of two identical cards gives <code>False</code>, which surprises beginners. Chapter 6 shows that a dataclass writes <code>__eq__</code> for you.</p>
<p>For ordering, write <code>__lt__</code> ("less than"); then <code>sorted()</code>, <code>min()</code> and <code>max()</code> work. <code>__len__</code> makes <code>len(obj)</code> work:</p>
<pre class="code">def __lt__(self, other):
    return self.name &lt; other.name

def __len__(self):
    return len(self.name)</pre>
<pre class="out">AUTO01$ python3 c4c.py
[Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3'), Device('PUN-CORE-R1')]
Device('BLR-EDGE-R2') Device('PUN-CORE-R1')
11</pre>

<div class="note"><p>In real Python, a class that defines <code>__eq__</code> but not <code>__hash__</code> becomes unhashable, so it cannot be a dictionary key or a set member. The lab interpreter does not enforce this rule, so do not test it here. Dataclasses (chapter 6) and <code>frozen=True</code> manage it for you.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to <code>return</code> a string from <code>__str__</code> (using <code>print</code> inside it instead). Returning a non-string, such as the IP object. Writing <code>__str__</code> only and wondering why lists show addresses. Comparing objects with <code>is</code> when you mean <code>==</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>print(list_of_devices)</code> uses <code>__repr__</code> of each item, not <code>__str__</code>. A frequent exam question: "you defined <code>__str__</code> but the list still prints addresses, why?"</p></div>

<div class="scn"><h4>The log nobody could read</h4><p>A change script logged <code>Pushing to [&lt;netmodel.Device object at 0x7f...&gt;, ...]</code> and the on-call engineer could not tell which routers were targeted. Adding a one-line <code>__repr__</code> returning <code>Device('PUN-CORE-R1')</code> turned every log line into a readable list of hostnames without changing the logging code.</p><p><b>Lesson:</b> always give a class a <code>__repr__</code>; it is the debugging view.</p></div>

<div class="iv"><p class="q">"What is the difference between __str__ and __repr__?"</p><p><code>__str__</code> is the friendly text for users, used by <code>print</code> and f-strings. <code>__repr__</code> is the unambiguous developer view, used by <code>repr()</code>, by containers such as lists, and by the prompt. If I can write only one, I write <code>__repr__</code>, because Python falls back to it for <code>print</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>__str__</code> is the badge (print, f-strings); <code>__repr__</code> is the passport (lists, logs, debugging).</li>
<li>A list prints its items with <code>__repr__</code>.</li>
<li>Default <code>==</code> means "same object"; write <code>__eq__</code> to compare facts.</li>
<li><code>__lt__</code> makes sorting work; <code>__len__</code> makes <code>len()</code> work.</li>
<li>Special methods are called by Python, not by you.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> bina kuch kiye <code>Device</code> print karo to memory address dikhta hai. Python har class ko sikhane deta hai ki woh apna parichay kaise de, list mein kaise dikhe, aur kaise compare ho. In hooks ko <b>special methods</b> (ya dunder methods) kehte hain, kyunki unke naam do underscore se shuru aur khatam hote hain.</p>

<h3>Analogy: name badge aur passport</h3>
<p>Conference mein aap name badge lagate ho: chhota aur friendly, logon ke liye. Airport par passport dikhate ho: precise aur unambiguous, officials aur debugging ke liye. <code>__str__</code> badge hai, users aur reports ke liye. <code>__repr__</code> passport hai, developers aur logs ke liye.</p>

<h3>__str__ aur __repr__</h3>
<p>Python <code>__str__</code> tab call karta hai jab aap <code>print(obj)</code>, <code>str(obj)</code> ya f-string mein object use karte ho. <code>__repr__</code> tab call karta hai jab <code>repr(obj)</code> use karte ho, jab <b>list</b> apne items print karti hai, aur interactive prompt mein. Sirf <code>__repr__</code> likhoge to Python dono kaam ke liye use karta hai; sirf <code>__str__</code> likhoge to lists abhi bhi bhadda address dikhati hain. Lab 1 yahi dikhata hai.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    def __repr__(self):
        return f"Device({self.name!r})"


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1)
print(repr(r1))
print([r1, r2])
print(f"{r1}")
print(f"{r1!r}")
print("devices: " + str(r1))</pre>
<pre class="out">AUTO01$ python3 c4a.py
PUN-CORE-R1 (core) 10.99.0.1
Device('PUN-CORE-R1')
[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2')]
PUN-CORE-R1 (core) 10.99.0.1
Device('PUN-CORE-R1')
devices: PUN-CORE-R1 (core) 10.99.0.1</pre>
<p><code>print(r1)</code> badge use karta hai. <code>repr(r1)</code> passport. List apne items ke passports print karti hai. F-string mein <code>{r1}</code> ka matlab <code>str</code> aur <code>{r1!r}</code> ka matlab <code>repr</code>. <code>__repr__</code> ke andar <code>self.name</code> par <code>!r</code> quotes jodta hai, isliye output wahi code lagta hai jo object banane ke liye type karte.</p>

<h3>Lab 1, tasks 2 aur 3 step by step</h3>
<p><code>netmodel.py</code> mein class file ki sabse aakhri cheez hai, isliye method <code>cat &gt;&gt;</code> se append kar sakte ho. Task 2:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">PUN-CORE-R1 (core) 10.99.0.1</span>
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[&lt;netmodel.Device object at 0x7f007f3a1c50&gt;, &lt;netmodel.Device object at 0x7f007f3a1c80&gt;, &lt;netmodel.Device object at 0x7f007f3a1cb0&gt;]</pre>
<p>Teen lines ab padhne layak hain, par aakhri line <code>print(devices)</code> abhi bhi addresses dikhati hai kyunki list apne items ke liye <code>__repr__</code> use karti hai. Heredoc ki blank line zaroori hai: woh naye method ko <code>__init__</code> se alag karti hai, aur chaar space ka indent use class ke andar rakhta hai. Task 3 passport jodta hai:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    def __repr__(self):
        return f"Device({self.name!r})"
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
<span class="hl">[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3')]</span></pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Python kaunsa special method call karta hai">
<rect x="20" y="20" width="270" height="100" rx="10" fill="#bae6fd"/><text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="13">__str__ : badge</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="11">print(obj), str(obj), f"{obj}"</text><text x="155" y="90" text-anchor="middle" class="svg-muted" font-size="11">logon aur reports ke liye</text>
<rect x="350" y="20" width="270" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="44" text-anchor="middle" class="svg-ink" font-size="13">__repr__ : passport</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="11">repr(obj), list ke items, f"{obj!r}"</text><text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="11">developers aur logs ke liye</text>
</svg><p class="cap">Do audience, do methods.</p></div>

<h3>Objects compare karna: == aur sorting</h3>
<p>Default mein <code>==</code> poochta hai "kya yeh bilkul wahi object hai?". Same facts wale do cards bhi do alag cards hain. <code>==</code> ko facts compare karwane ke liye <code>__eq__</code> likho:</p>
<pre class="code">def __eq__(self, other):
    if not isinstance(other, Device):
        return False
    return (self.name, self.role, self.ip, self.site) == (other.name, other.role, other.ip, other.site)</pre>
<pre class="out">AUTO01$ python3 c4b.py
True False False
False
True</pre>
<p>Yeh output <code>a == b</code> (same facts, alag objects), <code>a == c</code> (alag facts) aur <code>a is b</code> (kabhi same object nahi) ka hai; phir <code>a == "PUN-CORE-R1"</code>, jo <code>False</code> hai kyunki string <code>Device</code> nahi; aur <code>a in [c, b]</code>, jo <code>==</code> use karta hai aur match dhoondh leta hai. <code>__eq__</code> ke bina do identical cards ka plain comparison <code>False</code> deta hai, jo beginners ko chaunkata hai. Chapter 6 dikhata hai ki dataclass <code>__eq__</code> aapke liye likh deti hai.</p>
<p>Ordering ke liye <code>__lt__</code> ("less than") likho; phir <code>sorted()</code>, <code>min()</code> aur <code>max()</code> chalte hain. <code>__len__</code> se <code>len(obj)</code> chalta hai:</p>
<pre class="code">def __lt__(self, other):
    return self.name &lt; other.name

def __len__(self):
    return len(self.name)</pre>
<pre class="out">AUTO01$ python3 c4c.py
[Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3'), Device('PUN-CORE-R1')]
Device('BLR-EDGE-R2') Device('PUN-CORE-R1')
11</pre>

<div class="note"><p>Asli Python mein jo class <code>__eq__</code> define kare par <code>__hash__</code> nahi, woh unhashable ho jaati hai, yaani dictionary key ya set member nahi ban sakti. Lab interpreter yeh rule enforce nahi karta, isliye ise yahan test mat karo. Dataclasses (chapter 6) aur <code>frozen=True</code> ise aapke liye sambhalte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>__str__</code> se string <code>return</code> karna bhool jana (andar <code>print</code> karna). Non-string return karna, jaise IP object. Sirf <code>__str__</code> likhna aur hairan hona ki lists address kyun dikhati hain. Jahan <code>==</code> chahiye wahan <code>is</code> se compare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>print(list_of_devices)</code> har item ka <code>__repr__</code> use karta hai, <code>__str__</code> nahi. Aksar poochte hain: "aapne <code>__str__</code> define kiya par list abhi bhi addresses print karti hai, kyon?"</p></div>

<div class="scn"><h4>Jo log koi padh nahi paya</h4><p>Ek change script ne log kiya <code>Pushing to [&lt;netmodel.Device object at 0x7f...&gt;, ...]</code> aur on-call engineer samajh nahi paya ki kin routers par push ho raha hai. <code>Device('PUN-CORE-R1')</code> return karne wala ek line ka <code>__repr__</code> jodne se logging code badle bina har log line hostnames ki padhne layak list ban gayi.</p><p><b>Lesson:</b> class ko hamesha <code>__repr__</code> do; yeh debugging view hai.</p></div>

<div class="iv"><p class="q">"__str__ aur __repr__ mein kya fark hai?"</p><p><code>__str__</code> users ke liye friendly text hai, <code>print</code> aur f-strings use karte hain. <code>__repr__</code> developer ke liye unambiguous view hai, <code>repr()</code>, lists jaise containers aur prompt use karte hain. Sirf ek likh sakun to <code>__repr__</code> likhta hoon, kyunki <code>print</code> ke liye Python usi par fall back karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>__str__</code> badge hai (print, f-strings); <code>__repr__</code> passport hai (lists, logs, debugging).</li>
<li>List apne items ko <code>__repr__</code> se print karti hai.</li>
<li>Default <code>==</code> ka matlab "same object"; facts compare karne ke liye <code>__eq__</code> likho.</li>
<li><code>__lt__</code> sorting chalata hai; <code>__len__</code> <code>len()</code> chalata hai.</li>
<li>Special methods Python call karta hai, aap nahi.</li>
</ul></div>
`}};export{e as default};