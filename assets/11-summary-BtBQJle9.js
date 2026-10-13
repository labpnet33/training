var e={id:`summary`,h:{en:`Summary, can-do checklist, glossary and cheat-sheet`,hi:`Summary, can-do checklist, glossary aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> one page to revise the whole module. You started with devices as loose dictionaries. You can now model a device, an interface or a VLAN as an object with its own rules, print it readably, validate it, share code through inheritance, and save lists of them as JSON.</p>

<h3>Analogy: from sticky notes to a proper record system</h3>
<p>Sticky notes (dictionaries) are quick but each person writes differently. A record system (classes) has a printed form, rules on the back, and a clerk who refuses a bad entry. Each chapter added one feature of that system.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="From dictionary to inheritance">
<rect x="10" y="30" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="60" y="56" text-anchor="middle" class="svg-ink" font-size="12">dict</text><text x="60" y="74" text-anchor="middle" class="svg-muted" font-size="10">loose keys</text>
<rect x="125" y="30" width="100" height="60" rx="10" fill="#bae6fd"/><text x="175" y="56" text-anchor="middle" class="svg-ink" font-size="12">class</text><text x="175" y="74" text-anchor="middle" class="svg-muted" font-size="10">__init__, self</text>
<rect x="240" y="30" width="100" height="60" rx="10" fill="#fde68a"/><text x="290" y="56" text-anchor="middle" class="svg-ink" font-size="12">str, repr</text><text x="290" y="74" text-anchor="middle" class="svg-muted" font-size="10">readable</text>
<rect x="355" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="56" text-anchor="middle" class="svg-ink" font-size="12">property</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="10">computed, valid</text>
<rect x="470" y="30" width="80" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="12">dataclass</text><text x="510" y="74" text-anchor="middle" class="svg-muted" font-size="10">less code</text>
<rect x="562" y="30" width="70" height="60" rx="10" fill="#fed7aa"/><text x="597" y="56" text-anchor="middle" class="svg-ink" font-size="12">super()</text><text x="597" y="74" text-anchor="middle" class="svg-muted" font-size="10">inherit</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">each box is one or two chapters of this module</text>
</svg><p class="cap">The journey of this module.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Why objects.</b> Class = form, object = filled card. Prerequisites: auto-intro, auto-py-basics, auto-py-data, auto-py-func.</li>
<li><b>2 Class and __init__.</b> <code>self.name = name</code>; class attributes are shared defaults; <code>__dict__</code> shows the facts.</li>
<li><b>3 Methods and self.</b> <code>r1.describe()</code> is <code>Device.describe(r1)</code>; a missing <code>self</code> gives "takes 0 positional arguments but 1 was given".</li>
<li><b>4 __str__, __repr__, ==.</b> Badge and passport; lists use <code>__repr__</code>; default <code>==</code> means same object.</li>
<li><b>5 Properties.</b> <code>@property</code> for computed values, <code>@x.setter</code> to validate (VLAN 1-4094, valid IP).</li>
<li><b>6 Dataclasses.</b> Generate <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code>; <code>asdict</code>, <code>replace</code>, <code>__post_init__</code>.</li>
<li><b>7 Defaults.</b> <code>default_factory</code>, <code>frozen</code>, <code>order</code>; never a bare <code>[]</code> as default.</li>
<li><b>8 Inheritance.</b> <code>class Router(Device)</code>, <code>super().__init__(...)</code>, polymorphism, is-a versus has-a.</li>
<li><b>9 Lists of objects.</b> <code>Device(**row)</code>, <code>attrgetter</code>, <code>defaultdict</code>, <code>Counter</code>, <code>asdict</code> to JSON.</li>
<li><b>10 Troubleshooting.</b> Lab 2: shared list, missing <code>name</code> to <code>super()</code>, missing <code>self</code>.</li>
</ul>

<h3>Lab answers at a glance</h3>
<table class="cmp"><tr><th>Lab</th><th>Question</th><th>Answer</th></tr>
<tr><td>Lab 1 task 1</td><td>How many objects does main.py list?</td><td>3</td></tr>
<tr><td>Lab 1 task 4</td><td>Core devices</td><td><code>['PUN-CORE-R1']</code></td></tr>
<tr><td>Lab 1 task 5</td><td>Hand-built Device == devices[0]</td><td>True</td></tr>
<tr><td>Lab 2 task 1</td><td>Interfaces reported for HYD-EDGE-R3</td><td>1 (should be 0)</td></tr>
<tr><td>Lab 2 task 3</td><td>Missing required argument</td><td>name</td></tr>
<tr><td>Lab 2 task 4</td><td>First parameter of every method</td><td>self</td></tr></table>

<h3>Cheat-sheet</h3>
<pre class="code">class Device:                          # plain class
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
    def __str__(self):  return f"{self.name} {self.ip}"
    def __repr__(self): return f"Device({self.name!r})"
    @property
    def hostname(self): return self.name.lower()

from dataclasses import dataclass, field, asdict, replace

@dataclass(order=True)                 # frozen=True for read-only
class Vlan:
    vid: int
    name: str = ""
    ports: list = field(default_factory=list)
    def __post_init__(self): ...       # validate here

class Router(Device):                  # inheritance
    def __init__(self, name, ip, asn):
        super().__init__(name, ip)
        self.asn = asn

devices = [Device(**row) for row in rows]      # from csv/json dicts
sorted(devices, key=attrgetter("name"))        # from operator
[asdict(d) for d in devices]                   # to json.dump</pre>

<h3>Can-do checklist</h3>
<ul>
<li>I can write a class with <code>__init__</code> and explain what <code>self</code> is.</li>
<li>I can tell a class from an object, and a class attribute from an object attribute.</li>
<li>I can write <code>__str__</code> and <code>__repr__</code> and say which one a list uses.</li>
<li>I can add a computed property and a validating setter.</li>
<li>I can turn a class into a dataclass and use <code>asdict</code> and <code>replace</code>.</li>
<li>I can explain why <code>=[]</code> as a default is a bug and use <code>default_factory</code> or <code>None</code>.</li>
<li>I can write a child class with <code>super().__init__(...)</code> and override a method.</li>
<li>I can sort, filter, group and save a list of objects as JSON.</li>
<li>I can read a traceback from the last line up and fix one bug at a time.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>class</dt><dd>The blueprint (blank form) that defines attributes and methods.</dd>
<dt>object / instance</dt><dd>One filled-in card built from a class.</dd>
<dt>attribute</dt><dd>A named fact stored on an object, such as <code>r1.ip</code>.</dd>
<dt>method</dt><dd>A function defined in a class; its first parameter is <code>self</code>.</dd>
<dt>self</dt><dd>The object a method was called on, supplied by Python.</dd>
<dt>constructor</dt><dd><code>__init__</code>, run when an object is created.</dd>
<dt>special (dunder) method</dt><dd>A method such as <code>__str__</code> or <code>__eq__</code> that Python calls for you.</dd>
<dt>property</dt><dd>A method read like an attribute; with a setter it can validate.</dd>
<dt>dataclass</dt><dd>A class whose <code>__init__</code>, <code>__repr__</code> and <code>__eq__</code> are generated from fields.</dd>
<dt>inheritance</dt><dd>A child class reusing and extending a parent class.</dd>
<dt>override</dt><dd>Redefining a parent's method in the child.</dd>
<dt>polymorphism</dt><dd>Different classes answering the same method name in their own way.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li><code>print(list_of_objects)</code> uses <code>__repr__</code>, not <code>__str__</code>.</li>
<li>Default <code>==</code> on plain objects compares identity; dataclasses compare all fields.</li>
<li>A mutable default (<code>[]</code>, <code>{}</code>) is created once and shared; use <code>None</code> or <code>default_factory</code>.</li>
<li>A child that defines <code>__init__</code> must call <code>super().__init__(...)</code>.</li>
<li>A property without a setter is read-only (<code>AttributeError</code>).</li>
<li>Type annotations in a dataclass are not enforced.</li>
<li><code>frozen=True</code> forbids assignment; <code>order=True</code> adds comparisons.</li>
</ul>

<div class="warn"><p><b>Common mistakes to avoid.</b> Missing <code>self</code> in a <code>def</code> line, missing <code>self.</code> inside a method, <code>=[]</code> defaults, forgetting <code>super().__init__</code>, and putting objects straight into <code>json.dumps</code> without <code>asdict</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Class" and "object" are not the same. The class is the form; every call such as <code>Device(...)</code> creates a new object.</p></div>

<div class="scn"><h4>The handover that worked</h4><p>An engineer left the company and handed over 25 loose scripts. The new owner moved the shared device facts into one dataclass in <code>netmodel.py</code>, added validation for IPs and VLANs, and let <code>Router</code> and <code>Switch</code> inherit from <code>Device</code>. Three weeks later a new platform was added by writing one small child class; no script had to change.</p><p><b>Lesson:</b> a good model makes the next change cheap.</p></div>

<div class="iv"><p class="q">"When do you use a class, a dataclass, or a plain dictionary?"</p><p>A dictionary for quick, one-off data. A dataclass for a record with named fields that several scripts share, especially when I want a readable repr, equality and JSON conversion. A regular class when I need custom constructor logic, validation or behaviour that is more than a few helpers. I add inheritance only for a real is-a relationship.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A class is the form; an object is a filled card; <code>self</code> is the card in your hand.</li>
<li>Give every class a <code>__repr__</code>; add <code>__str__</code> for user text.</li>
<li>Use properties for computed or validated values, dataclasses for plain records.</li>
<li>Never use a mutable default; use <code>None</code> or <code>default_factory</code>.</li>
<li>Next module: py-iter, where comprehensions and generators stream huge logs.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> poore module ko revise karne ka ek page. Aapne devices ko loose dictionaries se shuru kiya tha. Ab aap device, interface ya VLAN ko apne rules wale object ki tarah model kar sakte ho, readable print kara sakte ho, validate kar sakte ho, inheritance se code share kar sakte ho, aur unki lists ko JSON mein save kar sakte ho.</p>

<h3>Analogy: sticky notes se proper record system</h3>
<p>Sticky notes (dictionaries) tez hain par har insaan alag likhta hai. Record system (classes) mein printed form hai, peeche rules hain, aur ek clerk jo bad entry refuse karta hai. Har chapter ne us system ka ek feature jodha.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Dictionary se inheritance tak">
<rect x="10" y="30" width="100" height="60" rx="10" fill="#e2e8f0"/><text x="60" y="56" text-anchor="middle" class="svg-ink" font-size="12">dict</text><text x="60" y="74" text-anchor="middle" class="svg-muted" font-size="10">loose keys</text>
<rect x="125" y="30" width="100" height="60" rx="10" fill="#bae6fd"/><text x="175" y="56" text-anchor="middle" class="svg-ink" font-size="12">class</text><text x="175" y="74" text-anchor="middle" class="svg-muted" font-size="10">__init__, self</text>
<rect x="240" y="30" width="100" height="60" rx="10" fill="#fde68a"/><text x="290" y="56" text-anchor="middle" class="svg-ink" font-size="12">str, repr</text><text x="290" y="74" text-anchor="middle" class="svg-muted" font-size="10">readable</text>
<rect x="355" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="56" text-anchor="middle" class="svg-ink" font-size="12">property</text><text x="405" y="74" text-anchor="middle" class="svg-muted" font-size="10">computed, valid</text>
<rect x="470" y="30" width="80" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="12">dataclass</text><text x="510" y="74" text-anchor="middle" class="svg-muted" font-size="10">kam code</text>
<rect x="562" y="30" width="70" height="60" rx="10" fill="#fed7aa"/><text x="597" y="56" text-anchor="middle" class="svg-ink" font-size="12">super()</text><text x="597" y="74" text-anchor="middle" class="svg-muted" font-size="10">inherit</text>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">har box is module ke ek ya do chapters hain</text>
</svg><p class="cap">Is module ka safar.</p></div>

<h3>Chapter recap</h3>
<ul>
<li><b>1 Why objects.</b> Class = form, object = bhara card. Prerequisites: auto-intro, auto-py-basics, auto-py-data, auto-py-func.</li>
<li><b>2 Class aur __init__.</b> <code>self.name = name</code>; class attributes shared defaults hain; <code>__dict__</code> facts dikhata hai.</li>
<li><b>3 Methods aur self.</b> <code>r1.describe()</code> matlab <code>Device.describe(r1)</code>; <code>self</code> missing ho to "takes 0 positional arguments but 1 was given".</li>
<li><b>4 __str__, __repr__, ==.</b> Badge aur passport; lists <code>__repr__</code> use karti hain; default <code>==</code> ka matlab same object.</li>
<li><b>5 Properties.</b> Computed values ke liye <code>@property</code>, validate karne ke liye <code>@x.setter</code> (VLAN 1-4094, valid IP).</li>
<li><b>6 Dataclasses.</b> <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> generate hote hain; <code>asdict</code>, <code>replace</code>, <code>__post_init__</code>.</li>
<li><b>7 Defaults.</b> <code>default_factory</code>, <code>frozen</code>, <code>order</code>; default mein seedha <code>[]</code> kabhi nahi.</li>
<li><b>8 Inheritance.</b> <code>class Router(Device)</code>, <code>super().__init__(...)</code>, polymorphism, is-a versus has-a.</li>
<li><b>9 Objects ki lists.</b> <code>Device(**row)</code>, <code>attrgetter</code>, <code>defaultdict</code>, <code>Counter</code>, JSON ke liye <code>asdict</code>.</li>
<li><b>10 Troubleshooting.</b> Lab 2: shared list, <code>super()</code> ko missing <code>name</code>, missing <code>self</code>.</li>
</ul>

<h3>Lab answers ek nazar mein</h3>
<table class="cmp"><tr><th>Lab</th><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Lab 1 task 1</td><td>main.py kitne objects list karta hai?</td><td>3</td></tr>
<tr><td>Lab 1 task 4</td><td>Core devices</td><td><code>['PUN-CORE-R1']</code></td></tr>
<tr><td>Lab 1 task 5</td><td>Haath se bana Device == devices[0]</td><td>True</td></tr>
<tr><td>Lab 2 task 1</td><td>HYD-EDGE-R3 ke liye reported interfaces</td><td>1 (0 hona chahiye)</td></tr>
<tr><td>Lab 2 task 3</td><td>Missing required argument</td><td>name</td></tr>
<tr><td>Lab 2 task 4</td><td>Har method ka pehla parameter</td><td>self</td></tr></table>

<h3>Cheat-sheet</h3>
<pre class="code">class Device:                          # plain class
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
    def __str__(self):  return f"{self.name} {self.ip}"
    def __repr__(self): return f"Device({self.name!r})"
    @property
    def hostname(self): return self.name.lower()

from dataclasses import dataclass, field, asdict, replace

@dataclass(order=True)                 # read-only ke liye frozen=True
class Vlan:
    vid: int
    name: str = ""
    ports: list = field(default_factory=list)
    def __post_init__(self): ...       # yahan validate karo

class Router(Device):                  # inheritance
    def __init__(self, name, ip, asn):
        super().__init__(name, ip)
        self.asn = asn

devices = [Device(**row) for row in rows]      # csv/json dicts se
sorted(devices, key=attrgetter("name"))        # operator se
[asdict(d) for d in devices]                   # json.dump ke liye</pre>

<h3>Can-do checklist</h3>
<ul>
<li>Main <code>__init__</code> wali class likh sakta hoon aur bata sakta hoon ki <code>self</code> kya hai.</li>
<li>Main class aur object ka, aur class attribute aur object attribute ka fark bata sakta hoon.</li>
<li>Main <code>__str__</code> aur <code>__repr__</code> likh sakta hoon aur bata sakta hoon ki list kaunsa use karti hai.</li>
<li>Main computed property aur validating setter jod sakta hoon.</li>
<li>Main class ko dataclass bana sakta hoon aur <code>asdict</code> tatha <code>replace</code> use kar sakta hoon.</li>
<li>Main samjha sakta hoon ki default mein <code>=[]</code> bug kyon hai aur <code>default_factory</code> ya <code>None</code> use kar sakta hoon.</li>
<li>Main <code>super().__init__(...)</code> wali child class likh sakta hoon aur method override kar sakta hoon.</li>
<li>Main objects ki list ko sort, filter, group aur JSON mein save kar sakta hoon.</li>
<li>Main traceback ko aakhri line se upar padh sakta hoon aur ek ek bug theek kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>class</dt><dd>Blueprint (khaali form) jo attributes aur methods define karta hai.</dd>
<dt>object / instance</dt><dd>Class se bana ek bhara hua card.</dd>
<dt>attribute</dt><dd>Object par rakha naam wala fact, jaise <code>r1.ip</code>.</dd>
<dt>method</dt><dd>Class mein define function; uska pehla parameter <code>self</code> hai.</dd>
<dt>self</dt><dd>Woh object jis par method call hua, Python deta hai.</dd>
<dt>constructor</dt><dd><code>__init__</code>, object banate waqt chalta hai.</dd>
<dt>special (dunder) method</dt><dd><code>__str__</code> ya <code>__eq__</code> jaisa method jo Python aapke liye call karta hai.</dd>
<dt>property</dt><dd>Attribute ki tarah padha jaane wala method; setter ke saath validate kar sakta hai.</dd>
<dt>dataclass</dt><dd>Aisi class jiske <code>__init__</code>, <code>__repr__</code> aur <code>__eq__</code> fields se generate hote hain.</dd>
<dt>inheritance</dt><dd>Child class ka parent class ko reuse aur extend karna.</dd>
<dt>override</dt><dd>Parent ke method ko child mein dobara define karna.</dd>
<dt>polymorphism</dt><dd>Alag classes ka wahi method naam par apne tareeke se jawab dena.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li><code>print(list_of_objects)</code> <code>__repr__</code> use karta hai, <code>__str__</code> nahi.</li>
<li>Plain objects par default <code>==</code> identity compare karta hai; dataclasses saare fields compare karti hain.</li>
<li>Mutable default (<code>[]</code>, <code>{}</code>) ek baar banta hai aur shared hota hai; <code>None</code> ya <code>default_factory</code> use karo.</li>
<li><code>__init__</code> define karne wale child ko <code>super().__init__(...)</code> call karna padta hai.</li>
<li>Setter ke bina property read-only hai (<code>AttributeError</code>).</li>
<li>Dataclass ke type annotations enforce nahi hote.</li>
<li><code>frozen=True</code> assignment mana karta hai; <code>order=True</code> comparisons jodta hai.</li>
</ul>

<div class="warn"><p><b>Bachne wale common mistakes.</b> <code>def</code> line mein <code>self</code> missing, method ke andar <code>self.</code> missing, <code>=[]</code> defaults, <code>super().__init__</code> bhoolna, aur objects ko <code>asdict</code> ke bina seedha <code>json.dumps</code> mein daalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Class" aur "object" ek nahi hain. Class form hai; <code>Device(...)</code> jaisi har call naya object banati hai.</p></div>

<div class="scn"><h4>Handover jo kaam kar gaya</h4><p>Ek engineer company chhod gaya aur 25 loose scripts handover mein de gaya. Naye owner ne shared device facts ko <code>netmodel.py</code> ki ek dataclass mein rakha, IPs aur VLANs ke liye validation jodi, aur <code>Router</code> tatha <code>Switch</code> ko <code>Device</code> se inherit karwaya. Teen hafte baad naya platform ek chhoti child class likhkar jod diya gaya; kisi script ko badalna nahi pada.</p><p><b>Lesson:</b> achha model agla change sasta bana deta hai.</p></div>

<div class="iv"><p class="q">"Class, dataclass ya plain dictionary kab use karte ho?"</p><p>Quick, one-off data ke liye dictionary. Naam wale fields ke record ke liye dataclass jo kai scripts share karti hain, khaas kar jab readable repr, equality aur JSON conversion chahiye. Regular class tab jab custom constructor logic, validation ya kuch helpers se zyada behaviour chahiye. Inheritance sirf asli is-a relationship ke liye jodta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Class form hai; object bhara card hai; <code>self</code> aapke haath mein pakda hua card hai.</li>
<li>Har class ko <code>__repr__</code> do; user text ke liye <code>__str__</code> jodo.</li>
<li>Computed ya validated values ke liye properties, plain records ke liye dataclasses.</li>
<li>Mutable default kabhi nahi; <code>None</code> ya <code>default_factory</code> use karo.</li>
<li>Agla module: py-iter, jahan comprehensions aur generators bade logs stream karte hain.</li>
</ul></div>
`}};export{e as default};