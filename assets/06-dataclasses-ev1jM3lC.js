var e={id:`dataclasses`,h:{en:`Dataclasses: the same class in a third of the code (Lab 1 task 5)`,hi:`Dataclasses: wahi class ek tihai code mein (Lab 1 task 5)`},body:{en:`
<p><b>The idea of this chapter:</b> most classes in network scripts are "a bag of named facts" plus a few helper methods. Writing <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> by hand for every one is boring and a source of typos. The <code>@dataclass</code> decorator writes all three for you from a list of fields.</p>

<h3>Analogy: a pre-printed form with the boxes already labelled</h3>
<p>Earlier you drew every box on the form by hand. A dataclass is a form printer: you list the labels (name, role, ip, site), and it prints the form, the "how to read it aloud" rule and the "are two forms the same" rule.</p>

<h3>From class to dataclass</h3>
<p>Import <code>dataclass</code>, put <code>@dataclass</code> above the class, and list the fields as <b>annotations</b>: <code>name: str</code> means "a field called name, intended to be a string". Keep your own methods and properties.</p>
<pre class="code">from dataclasses import dataclass


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    @property
    def is_core(self):
        return self.role == "core"


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(r1)
print(repr(r1))
print([r1])
same = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(r1 == same, r1 is same)
r1.site = "Pune-DC"
print(r1 == same)
print(r1.is_core)
print(Device("X", "edge", "10.99.0.9"))</pre>
<pre class="out">AUTO01$ python3 c6a.py
PUN-CORE-R1 (core) 10.99.0.1
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
[Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')]
True False
False
True
Traceback (most recent call last):
  File "c6a.py", line 28, in &lt;module&gt;
    print(Device("X", "edge", "10.99.0.9"))
<span class="hl">TypeError: Device.__init__() missing 1 required positional argument: 'site'</span></pre>
<p>Everything that you used to write is there, with no code from you. <code>print(r1)</code> still uses your own <code>__str__</code> (you wrote it, so the dataclass does not replace it). <code>repr</code> is the generated one: every field, in order, with <code>name=value</code>, which is a much better debugging view than <code>Device('PUN-CORE-R1')</code>. The list uses the generated repr. <code>==</code> compares all fields: equal while the facts match (<code>True False</code> for equal but not identical), and <code>False</code> as soon as one field differs. The generated <code>__init__</code> demands one value per field, so forgetting <code>site</code> gives the familiar <code>TypeError</code>.</p>

<div class="dia"><svg viewBox="0 0 640 175" role="img" aria-label="What @dataclass generates">
<rect x="20" y="20" width="220" height="130" rx="10" fill="#ddd6fe"/><text x="130" y="44" text-anchor="middle" class="svg-ink" font-size="13">you write</text><text x="130" y="70" text-anchor="middle" class="svg-muted" font-size="11">@dataclass</text><text x="130" y="90" text-anchor="middle" class="svg-muted" font-size="11">name: str</text><text x="130" y="108" text-anchor="middle" class="svg-muted" font-size="11">role: str, ip: str, site: str</text><text x="130" y="134" text-anchor="middle" class="svg-accent" font-size="11">your own methods</text>
<rect x="330" y="20" width="290" height="130" rx="10" fill="#bbf7d0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="13">Python generates</text><text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="11">__init__(name, role, ip, site)</text><text x="475" y="94" text-anchor="middle" class="svg-muted" font-size="11">__repr__ : Device(name=..., ...)</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="11">__eq__ : compares every field</text>
<line x1="240" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A field list in, three methods out.</p></div>

<h3>Lab 1, task 5: rebuild netmodel.py as a dataclass</h3>
<p>Rewrite the file completely with <code>cat &gt;</code> (one arrow replaces the file; two arrows append). Keep only <code>__str__</code> and <code>is_core</code>: the decorator writes <code>__init__</code> and <code>__repr__</code>, and the checker looks for them to be gone.</p>
<pre class="code">cat &gt; netmodel.py &lt;&lt;'EOF'
from dataclasses import dataclass


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    @property
    def is_core(self):
        return self.role == "core"
EOF
cat &gt;&gt; main.py &lt;&lt;'EOF'
print(Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune") == devices[0])
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune'), Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2', site='Bengaluru'), Device(name='HYD-EDGE-R3', role='edge', ip='10.99.0.3', site='Hyderabad')]
['PUN-CORE-R1']
<span class="hl">True</span></pre>
<p>The hand-built <code>Device</code> equals <code>devices[0]</code> because every field matches, so the answer is <code>True</code>. The hand-written <code>__init__</code> and <code>__repr__</code> are gone, and the class gained a better repr and a real <code>==</code>. Notice that <code>main.py</code> needs no change except the new last line: that is the benefit of putting behaviour in the class.</p>

<h3>Type hints are hints, not rules</h3>
<p>Annotations such as <code>str</code> document the intended type. Python does not enforce them:</p>
<pre class="code">x = Device(1, 2, 3, 4)
print(x)
print(Device(name="A", site="Pune", role="edge", ip="10.0.0.1"))
print(type(x.name))</pre>
<pre class="out">AUTO01$ python3 c6d.py
Device(name=1, role=2, ip=3, site=4)
Device(name='A', role='edge', ip='10.0.0.1', site='Pune')
&lt;class 'int'&gt;</pre>
<p>Integers went into string fields without complaint. If you need a check, add it yourself in <code>__post_init__</code> (below) or use a tool such as a type checker. Keyword arguments (second line) may come in any order, which makes calls with many fields self-documenting.</p>

<h3>Helpers: asdict, replace, fields and __post_init__</h3>
<p>The <code>dataclasses</code> module gives you tools that work on any dataclass:</p>
<pre class="code">from dataclasses import dataclass, fields, asdict, astuple, replace, is_dataclass

d = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(asdict(d))
print(astuple(d))
print([f.name for f in fields(d)])
print(is_dataclass(d))
e = replace(d, name="PUN-CORE-R2", ip="10.99.0.9")
print(e)
print(d)</pre>
<pre class="out">AUTO01$ python3 c6b.py
{'name': 'PUN-CORE-R1', 'role': 'core', 'ip': '10.99.0.1', 'site': 'Pune'}
('PUN-CORE-R1', 'core', '10.99.0.1', 'Pune')
['name', 'role', 'ip', 'site']
True
Device(name='PUN-CORE-R2', role='core', ip='10.99.0.9', site='Pune')
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')</pre>
<p><code>asdict</code> gives a dictionary (perfect for JSON, chapter 9). <code>replace</code> makes a modified <b>copy</b> and leaves the original alone, handy for "same router, new IP" without editing in place.</p>
<p>When you need to tidy or check values right after construction, define <code>__post_init__</code>; the generated <code>__init__</code> calls it at the end:</p>
<pre class="code">    def __post_init__(self):
        self.name = self.name.upper()
        if self.role not in ("core", "edge", "access"):
            raise ValueError(f"unknown role {self.role!r}")</pre>
<pre class="out">AUTO01$ python3 c6c.py
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
ValueError: unknown role 'spine'</pre>
<p>The first object was created with the lower-case name <code>pun-core-r1</code> and came out upper-case. The second was refused, because <code>spine</code> is not in the allowed roles.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the annotation: <code>name = "x"</code> without <code>: str</code> is a plain class attribute, not a field. Writing your own <code>__init__</code> inside a dataclass and fighting the generated one. Expecting <code>str</code> annotations to reject integers. Putting a <code>@dataclass</code> on a class that holds behaviour only and no facts.</p></div>
<div class="exam"><p><b>Exam trap.</b> A dataclass does not replace methods you wrote yourself. If you define <code>__str__</code>, <code>print</code> uses yours; the generated one is <code>__repr__</code>. The decorator only fills the gaps.</p></div>

<div class="scn"><h4>The five-line change that stopped a typo</h4><p>A team's <code>Device</code> class had a hand-written <code>__repr__</code> that forgot to include the <code>site</code> field when it was added, so logs for two routers with the same name in different cities looked identical. After moving to a dataclass the repr always listed every field, and the duplicate name showed up at the first run.</p><p><b>Lesson:</b> generated code cannot forget a field.</p></div>

<div class="iv"><p class="q">"What does the @dataclass decorator give you?"</p><p>From the annotated fields it generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> (and ordering or immutability if I ask for them). It cuts boilerplate and keeps the repr in step with the fields. I still add my own methods and properties, and I use <code>asdict</code> when I need a dictionary or JSON.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@dataclass</code> plus annotated fields generates <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code>.</li>
<li>Your own methods and properties stay; your own <code>__str__</code> wins over nothing.</li>
<li>Type hints document intent; Python does not enforce them.</li>
<li><code>asdict</code>, <code>astuple</code>, <code>replace</code> and <code>fields</code> work on any dataclass.</li>
<li><code>__post_init__</code> runs after the generated <code>__init__</code>: normalise and validate there.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> network scripts ki zyadatar classes "naam wale facts ka thaila" aur kuch helper methods hoti hain. Har ek ke liye <code>__init__</code>, <code>__repr__</code> aur <code>__eq__</code> haath se likhna boring hai aur typos ki wajah. <code>@dataclass</code> decorator fields ki list se teeno aapke liye likh deta hai.</p>

<h3>Analogy: pehle se print hua form jisme dibbe labelled hain</h3>
<p>Pehle aap form ka har dibba haath se banate the. Dataclass form printer hai: aap labels ki list dete ho (name, role, ip, site), aur woh form, "ise zor se kaise padhna hai" rule aur "do forms same hain ya nahi" rule print kar deta hai.</p>

<h3>Class se dataclass</h3>
<p><code>dataclass</code> import karo, class ke upar <code>@dataclass</code> lagao, aur fields ko <b>annotations</b> ki tarah likho: <code>name: str</code> ka matlab "name naam ka field, jo string hona chahiye". Apne methods aur properties rakho.</p>
<pre class="code">from dataclasses import dataclass


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    @property
    def is_core(self):
        return self.role == "core"


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(r1)
print(repr(r1))
print([r1])
same = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(r1 == same, r1 is same)
r1.site = "Pune-DC"
print(r1 == same)
print(r1.is_core)
print(Device("X", "edge", "10.99.0.9"))</pre>
<pre class="out">AUTO01$ python3 c6a.py
PUN-CORE-R1 (core) 10.99.0.1
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
[Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')]
True False
False
True
Traceback (most recent call last):
  File "c6a.py", line 28, in &lt;module&gt;
    print(Device("X", "edge", "10.99.0.9"))
<span class="hl">TypeError: Device.__init__() missing 1 required positional argument: 'site'</span></pre>
<p>Jo aap pehle likhte the woh sab maujood hai, aapka ek line code nahi. <code>print(r1)</code> abhi bhi aapka apna <code>__str__</code> use karta hai (aapne likha, isliye dataclass use replace nahi karti). <code>repr</code> generated hai: har field, order mein, <code>name=value</code> ke saath, jo <code>Device('PUN-CORE-R1')</code> se kahin behtar debugging view hai. List generated repr use karti hai. <code>==</code> saare fields compare karta hai: facts match hone tak equal (<code>True False</code> matlab equal par identical nahi), aur ek field alag hote hi <code>False</code>. Generated <code>__init__</code> har field ki ek value maangta hai, isliye <code>site</code> bhoolne par jaana-pehchana <code>TypeError</code> aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 175" role="img" aria-label="@dataclass kya generate karta hai">
<rect x="20" y="20" width="220" height="130" rx="10" fill="#ddd6fe"/><text x="130" y="44" text-anchor="middle" class="svg-ink" font-size="13">aap likhte ho</text><text x="130" y="70" text-anchor="middle" class="svg-muted" font-size="11">@dataclass</text><text x="130" y="90" text-anchor="middle" class="svg-muted" font-size="11">name: str</text><text x="130" y="108" text-anchor="middle" class="svg-muted" font-size="11">role: str, ip: str, site: str</text><text x="130" y="134" text-anchor="middle" class="svg-accent" font-size="11">aapke apne methods</text>
<rect x="330" y="20" width="290" height="130" rx="10" fill="#bbf7d0"/><text x="475" y="44" text-anchor="middle" class="svg-ink" font-size="13">Python generate karta hai</text><text x="475" y="72" text-anchor="middle" class="svg-muted" font-size="11">__init__(name, role, ip, site)</text><text x="475" y="94" text-anchor="middle" class="svg-muted" font-size="11">__repr__ : Device(name=..., ...)</text><text x="475" y="116" text-anchor="middle" class="svg-muted" font-size="11">__eq__ : har field compare karta hai</text>
<line x1="240" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Andar field list, bahar teen methods.</p></div>

<h3>Lab 1, task 5: netmodel.py ko dataclass banao</h3>
<p>File ko <code>cat &gt;</code> se poora dobara likho (ek arrow file replace karta hai; do arrows append). Sirf <code>__str__</code> aur <code>is_core</code> rakho: decorator <code>__init__</code> aur <code>__repr__</code> likhta hai, aur checker dekhta hai ki woh hat gaye hain.</p>
<pre class="code">cat &gt; netmodel.py &lt;&lt;'EOF'
from dataclasses import dataclass


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    def __str__(self):
        return f"{self.name} ({self.role}) {self.ip}"

    @property
    def is_core(self):
        return self.role == "core"
EOF
cat &gt;&gt; main.py &lt;&lt;'EOF'
print(Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune") == devices[0])
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune'), Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2', site='Bengaluru'), Device(name='HYD-EDGE-R3', role='edge', ip='10.99.0.3', site='Hyderabad')]
['PUN-CORE-R1']
<span class="hl">True</span></pre>
<p>Haath se bana <code>Device</code> <code>devices[0]</code> ke barabar hai kyunki har field match karta hai, isliye jawab <code>True</code> hai. Haath se likhe <code>__init__</code> aur <code>__repr__</code> hat gaye, aur class ko behtar repr tatha asli <code>==</code> mila. Dhyan do ki <code>main.py</code> mein nayi aakhri line ke alawa kuch nahi badla: behaviour ko class mein rakhne ka yahi fayda hai.</p>

<h3>Type hints hints hain, rules nahi</h3>
<p><code>str</code> jaise annotations intended type document karte hain. Python unhe enforce nahi karta:</p>
<pre class="code">x = Device(1, 2, 3, 4)
print(x)
print(Device(name="A", site="Pune", role="edge", ip="10.0.0.1"))
print(type(x.name))</pre>
<pre class="out">AUTO01$ python3 c6d.py
Device(name=1, role=2, ip=3, site=4)
Device(name='A', role='edge', ip='10.0.0.1', site='Pune')
&lt;class 'int'&gt;</pre>
<p>Integers string fields mein bina shikayat ke chale gaye. Check chahiye to khud <code>__post_init__</code> mein jodo (neeche) ya type checker jaisa tool use karo. Keyword arguments (doosri line) kisi bhi order mein aa sakte hain, jisse bahut fields wali calls apne aap document ho jaati hain.</p>

<h3>Helpers: asdict, replace, fields aur __post_init__</h3>
<p><code>dataclasses</code> module aise tools deta hai jo kisi bhi dataclass par chalte hain:</p>
<pre class="code">from dataclasses import dataclass, fields, asdict, astuple, replace, is_dataclass

d = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
print(asdict(d))
print(astuple(d))
print([f.name for f in fields(d)])
print(is_dataclass(d))
e = replace(d, name="PUN-CORE-R2", ip="10.99.0.9")
print(e)
print(d)</pre>
<pre class="out">AUTO01$ python3 c6b.py
{'name': 'PUN-CORE-R1', 'role': 'core', 'ip': '10.99.0.1', 'site': 'Pune'}
('PUN-CORE-R1', 'core', '10.99.0.1', 'Pune')
['name', 'role', 'ip', 'site']
True
Device(name='PUN-CORE-R2', role='core', ip='10.99.0.9', site='Pune')
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')</pre>
<p><code>asdict</code> dictionary deta hai (JSON ke liye perfect, chapter 9). <code>replace</code> badli hui <b>copy</b> banata hai aur original ko chhodta hai, "wahi router, naya IP" ke liye jab jagah par edit nahi karna.</p>
<p>Construction ke turant baad values tidy ya check karni hon to <code>__post_init__</code> define karo; generated <code>__init__</code> use ant mein call karta hai:</p>
<pre class="code">    def __post_init__(self):
        self.name = self.name.upper()
        if self.role not in ("core", "edge", "access"):
            raise ValueError(f"unknown role {self.role!r}")</pre>
<pre class="out">AUTO01$ python3 c6c.py
Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
ValueError: unknown role 'spine'</pre>
<p>Pehla object lower-case naam <code>pun-core-r1</code> se bana aur upper-case mein nikla. Doosra refuse hua, kyunki <code>spine</code> allowed roles mein nahi hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Annotation bhool jana: <code>: str</code> ke bina <code>name = "x"</code> plain class attribute hai, field nahi. Dataclass ke andar apna <code>__init__</code> likhna aur generated wale se ladna. <code>str</code> annotations se integers reject hone ki ummeed rakhna. Sirf behaviour wali class par <code>@dataclass</code> lagana jisme facts hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Dataclass aapke khud likhe methods ko replace nahi karti. <code>__str__</code> define karo to <code>print</code> aapka use karta hai; generated wala <code>__repr__</code> hai. Decorator sirf khaali jagah bharta hai.</p></div>

<div class="scn"><h4>Paanch line ka change jisne typo roka</h4><p>Ek team ki <code>Device</code> class ka haath se likha <code>__repr__</code> <code>site</code> field jodne par use shaamil karna bhool gaya, isliye alag shehron ke same naam wale do routers ke logs ek jaise dikhte the. Dataclass mein jaane ke baad repr hamesha har field dikhane laga, aur duplicate naam pehle run mein hi pakda gaya.</p><p><b>Lesson:</b> generated code koi field bhool nahi sakta.</p></div>

<div class="iv"><p class="q">"@dataclass decorator kya deta hai?"</p><p>Annotated fields se yeh <code>__init__</code>, <code>__repr__</code> aur <code>__eq__</code> generate karta hai (aur maangne par ordering ya immutability). Boilerplate kam hota hai aur repr fields ke saath sync rehta hai. Apne methods aur properties main phir bhi jodta hoon, aur dictionary ya JSON chahiye to <code>asdict</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@dataclass</code> aur annotated fields <code>__init__</code>, <code>__repr__</code> aur <code>__eq__</code> generate karte hain.</li>
<li>Aapke apne methods aur properties rehte hain; aapka apna <code>__str__</code> generated par bhaari padta hai.</li>
<li>Type hints iraada document karte hain; Python enforce nahi karta.</li>
<li><code>asdict</code>, <code>astuple</code>, <code>replace</code> aur <code>fields</code> kisi bhi dataclass par chalte hain.</li>
<li><code>__post_init__</code> generated <code>__init__</code> ke baad chalta hai: wahan normalise aur validate karo.</li>
</ul></div>
`}};export{e as default};