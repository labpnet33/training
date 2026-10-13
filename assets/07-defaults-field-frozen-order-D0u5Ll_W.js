var e={id:`defaults-field-frozen-order`,h:{en:`Defaults, field(default_factory), frozen and order`,hi:`Defaults, field(default_factory), frozen aur order`},body:{en:`
<p><b>The idea of this chapter:</b> real devices have optional facts (a role that is usually "edge", a list of interfaces that starts empty), some records must never change after creation (a VLAN definition), and some need sorting. Dataclass options handle all three, and one of them protects you from the most famous Python trap.</p>

<h3>Analogy: pre-filled boxes on the form</h3>
<p>A good form pre-fills the common answers: "Role: edge", "Site: Pune". The clerk only changes what is different. But a pre-filled box that is a <i>shared notepad</i> (every form points to the same one) would be a disaster: one clerk writes on it and every form changes. Keep that picture in mind for the list default below.</p>

<h3>Simple defaults</h3>
<p>Give a field a value after the annotation. Fields with defaults must come <b>after</b> fields without defaults, because Python fills arguments left to right:</p>
<pre class="code">from dataclasses import dataclass, field


@dataclass
class Interface:
    name: str
    ip: str = ""
    up: bool = False


@dataclass
class Device:
    name: str
    role: str = "edge"
    site: str = "Pune"
    interfaces: list = field(default_factory=list)
    tags: set = field(default_factory=set, repr=False)


a = Device("PUN-CORE-R1")
b = Device("BLR-EDGE-R2", site="Bengaluru")
a.interfaces.append(Interface("Gi0/0", "10.0.0.1", True))
print(a)
print(b)
print(a.interfaces is b.interfaces)
print(Interface("Gi0/1"))</pre>
<pre class="out">AUTO01$ python3 c7a.py
Device(name='PUN-CORE-R1', role='edge', site='Pune', interfaces=[Interface(name='Gi0/0', ip='10.0.0.1', up=True)])
Device(name='BLR-EDGE-R2', role='edge', site='Bengaluru', interfaces=[])
<span class="hl">False</span>
Interface(name='Gi0/1', ip='', up=False)</pre>
<p>Both devices got the default role and site. Adding an interface to <code>a</code> did not touch <code>b</code>, and <code>a.interfaces is b.interfaces</code> is <code>False</code>: each device owns its own list. That is what <code>field(default_factory=list)</code> does: instead of one shared list, it calls <code>list()</code> to build a fresh one for every new object. <code>repr=False</code> on <code>tags</code> simply hides that field from the printed repr.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shared default versus default_factory">
<rect x="20" y="15" width="285" height="160" rx="10" fill="#fecaca"/><text x="162" y="40" text-anchor="middle" class="svg-ink" font-size="13">interfaces = []  (wrong)</text>
<rect x="45" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="95" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R1</text><rect x="180" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="230" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R3</text>
<rect x="95" y="125" width="130" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="11">ONE shared list</text>
<line x1="95" y1="96" x2="140" y2="125" stroke="#64748b" stroke-width="2"/><line x1="230" y1="96" x2="180" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="335" y="15" width="285" height="160" rx="10" fill="#bbf7d0"/><text x="477" y="40" text-anchor="middle" class="svg-ink" font-size="13">default_factory=list  (right)</text>
<rect x="355" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="405" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R1</text><rect x="500" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="550" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R3</text>
<rect x="355" y="125" width="100" height="36" rx="6" fill="#e2e8f0"/><text x="405" y="148" text-anchor="middle" class="svg-ink" font-size="11">list of R1</text><rect x="500" y="125" width="100" height="36" rx="6" fill="#e2e8f0"/><text x="550" y="148" text-anchor="middle" class="svg-ink" font-size="11">list of R3</text>
<line x1="405" y1="96" x2="405" y2="125" stroke="#64748b" stroke-width="2"/><line x1="550" y1="96" x2="550" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A mutable default must be built per object.</p></div>

<h3>The shared-list trap (and why dataclass refuses it)</h3>
<p>This is the most famous Python trap and Lab 2's first bug. A default value written as <code>[]</code> is created <b>once</b>, when Python reads the line, not each time you build an object. In a plain class:</p>
<pre class="code">class Device:
    def __init__(self, name, interfaces=[]):
        self.name = name
        self.interfaces = interfaces

a = Device("R1")
b = Device("R3")
a.interfaces.append("Gi0/0")
print(b.interfaces)
print(a.interfaces is b.interfaces)</pre>
<pre class="out">AUTO01$ python3 t2.py
<span class="hl">['Gi0/0']</span>
True</pre>
<p>R3 never got an interface, yet its list shows <code>Gi0/0</code>: both objects point at the same list. The same applies to dictionaries and sets. Dataclasses protect you from this by refusing the mistake outright:</p>
<pre class="code">from dataclasses import dataclass


@dataclass
class Device:
    name: str
    interfaces: list = []</pre>
<pre class="out">AUTO01$ python3 c7c.py
Traceback (most recent call last):
  File "c7c.py", line 7, in &lt;module&gt;
    interfaces: list = []
<span class="hl">ValueError: mutable default &lt;class 'list'&gt; for field interfaces is not allowed: use default_factory</span></pre>
<p>The message names the cure. The general rule for any function or class: never use a list, dictionary or set as a default value; use <code>None</code> and create the object inside, or use <code>default_factory</code>.</p>
<p>Another ordering error you will see is a field without a default after one with a default:</p>
<pre class="out">AUTO01$ python3 c7b.py
Traceback (most recent call last):
  File "c7b.py", line 8, in &lt;module&gt;
    ip: str
<span class="hl">TypeError: non-default argument 'ip' follows default argument</span></pre>
<p>Here <code>role: str = "edge"</code> came before <code>ip: str</code>. Move required fields first, optional ones last.</p>

<h3>frozen=True: records that cannot change</h3>
<p>A VLAN definition, once approved, should not be edited by accident. <code>@dataclass(frozen=True)</code> makes every assignment after construction an error:</p>
<pre class="code">@dataclass(frozen=True)
class Vlan:
    vid: int
    name: str


v = Vlan(10, "USERS")
print(v)
try:
    v.name = "GUEST"
except Exception as e:
    print(type(e).__name__ + ":", e)</pre>
<pre class="out">AUTO01$ python3 c7d.py
Vlan(vid=10, name='USERS')
FrozenInstanceError: cannot assign to field 'name'</pre>
<p>To "change" a frozen object, make a new one with <code>replace(v, name="GUEST")</code>. In real Python a frozen dataclass is also hashable, so it can serve as a dictionary key or set member, which is a common reason to freeze one. The lab does not model hashing of dataclasses faithfully, so we do not test that here.</p>

<h3>order=True: sorting for free</h3>
<p>Add <code>order=True</code> and the dataclass writes <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, comparing the fields as a tuple in the order they are declared:</p>
<pre class="code">@dataclass(order=True)
class Vlan:
    vid: int
    name: str = ""


vl = [Vlan(30, "GUEST"), Vlan(10, "USERS"), Vlan(20, "VOICE")]
print(sorted(vl))
print(Vlan(10) &lt; Vlan(20), max(vl))</pre>
<pre class="out">AUTO01$ python3 c7e.py
[Vlan(vid=10, name='USERS'), Vlan(vid=20, name='VOICE'), Vlan(vid=30, name='GUEST')]
True Vlan(vid=30, name='GUEST')</pre>
<p>Sorted by <code>vid</code> first, because it is the first field. Without <code>order=True</code>, <code>Vlan(10, "A") &lt; Vlan(20, "B")</code> raises <code>TypeError: '&lt;' not supported between instances of 'Vlan' and 'Vlan'</code>. For other sort orders, use <code>sorted(devices, key=...)</code> (chapter 9) rather than reshuffling the fields.</p>

<div class="warn"><p><b>Common mistakes.</b> A bare <code>[]</code>, <code>{}</code> or <code>set()</code> as a default. Putting a required field after an optional one. Trying to modify a frozen object instead of using <code>replace</code>. Relying on <code>order=True</code> and then reordering the fields, which silently changes the sort order.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>field(default_factory=list)</code> takes the function <code>list</code> itself, with no brackets. Writing <code>default_factory=list()</code> passes an empty list and raises an error, because a list is not callable.</p></div>

<div class="scn"><h4>Interfaces that appeared from nowhere</h4><p>An audit script printed 2 interfaces for a brand-new router that nobody had configured. The cause was <code>interfaces=[]</code> in the constructor: the first router's interfaces were being shared with every later router. Switching to <code>None</code> and building <code>list(interfaces or [])</code> inside <code>__init__</code> gave each router its own list, and the audit count dropped to 0, which was correct.</p><p><b>Lesson:</b> a mutable default is shared by every object. Always build it per object.</p></div>

<div class="iv"><p class="q">"What is wrong with def __init__(self, interfaces=[])?"</p><p>The default list is created once, when the function is defined, and then shared by every call that omits the argument. Appending to it in one object changes all of them. I use <code>interfaces=None</code> and create a new list inside, or in a dataclass <code>field(default_factory=list)</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defaults follow the annotation; fields with defaults come after fields without.</li>
<li>Never use <code>[]</code>, <code>{}</code> or <code>set()</code> as a default; use <code>None</code> or <code>default_factory</code>.</li>
<li><code>frozen=True</code> makes the object read-only; use <code>replace()</code> for a changed copy.</li>
<li><code>order=True</code> adds comparisons using the field order.</li>
<li>The shared default list is Lab 2 bug number one.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> asli devices ke optional facts hote hain (role jo aam taur par "edge" hota hai, interfaces ki list jo khaali se shuru hoti hai), kuch records banne ke baad kabhi nahi badalne chahiye (VLAN definition), aur kuch ko sorting chahiye. Dataclass options teeno sambhalte hain, aur ek option aapko Python ke sabse mashhoor trap se bachata hai.</p>

<h3>Analogy: form ke pehle se bhare dibbe</h3>
<p>Achha form aam jawab pehle se bhar deta hai: "Role: edge", "Site: Pune". Clerk sirf woh badalta hai jo alag hai. Par agar koi pehle se bhara dibba <i>shared notepad</i> ho (har form usi ek ko point kare) to aafat ho jaayegi: ek clerk usme likhe aur har form badal jaaye. List default ke liye yeh picture yaad rakho.</p>

<h3>Simple defaults</h3>
<p>Field ko annotation ke baad value do. Defaults wale fields bina-default wale fields ke <b>baad</b> aane chahiye, kyunki Python arguments left se right bharta hai:</p>
<pre class="code">from dataclasses import dataclass, field


@dataclass
class Interface:
    name: str
    ip: str = ""
    up: bool = False


@dataclass
class Device:
    name: str
    role: str = "edge"
    site: str = "Pune"
    interfaces: list = field(default_factory=list)
    tags: set = field(default_factory=set, repr=False)


a = Device("PUN-CORE-R1")
b = Device("BLR-EDGE-R2", site="Bengaluru")
a.interfaces.append(Interface("Gi0/0", "10.0.0.1", True))
print(a)
print(b)
print(a.interfaces is b.interfaces)
print(Interface("Gi0/1"))</pre>
<pre class="out">AUTO01$ python3 c7a.py
Device(name='PUN-CORE-R1', role='edge', site='Pune', interfaces=[Interface(name='Gi0/0', ip='10.0.0.1', up=True)])
Device(name='BLR-EDGE-R2', role='edge', site='Bengaluru', interfaces=[])
<span class="hl">False</span>
Interface(name='Gi0/1', ip='', up=False)</pre>
<p>Dono devices ko default role aur site mile. <code>a</code> mein interface jodne se <code>b</code> ko kuch nahi hua, aur <code>a.interfaces is b.interfaces</code> <code>False</code> hai: har device ki apni list hai. <code>field(default_factory=list)</code> yahi karta hai: ek shared list ki jagah har naye object ke liye <code>list()</code> call karke nayi list banata hai. <code>tags</code> par <code>repr=False</code> bas us field ko printed repr se chhupa deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Shared default aur default_factory">
<rect x="20" y="15" width="285" height="160" rx="10" fill="#fecaca"/><text x="162" y="40" text-anchor="middle" class="svg-ink" font-size="13">interfaces = []  (galat)</text>
<rect x="45" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="95" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R1</text><rect x="180" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="230" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R3</text>
<rect x="95" y="125" width="130" height="36" rx="6" fill="#e2e8f0"/><text x="160" y="148" text-anchor="middle" class="svg-ink" font-size="11">EK shared list</text>
<line x1="95" y1="96" x2="140" y2="125" stroke="#64748b" stroke-width="2"/><line x1="230" y1="96" x2="180" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="335" y="15" width="285" height="160" rx="10" fill="#bbf7d0"/><text x="477" y="40" text-anchor="middle" class="svg-ink" font-size="13">default_factory=list  (sahi)</text>
<rect x="355" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="405" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R1</text><rect x="500" y="60" width="100" height="36" rx="6" fill="#fde68a"/><text x="550" y="83" text-anchor="middle" class="svg-ink" font-size="11">device R3</text>
<rect x="355" y="125" width="100" height="36" rx="6" fill="#e2e8f0"/><text x="405" y="148" text-anchor="middle" class="svg-ink" font-size="11">R1 ki list</text><rect x="500" y="125" width="100" height="36" rx="6" fill="#e2e8f0"/><text x="550" y="148" text-anchor="middle" class="svg-ink" font-size="11">R3 ki list</text>
<line x1="405" y1="96" x2="405" y2="125" stroke="#64748b" stroke-width="2"/><line x1="550" y1="96" x2="550" y2="125" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Mutable default har object ke liye alag banana chahiye.</p></div>

<h3>Shared-list trap (aur dataclass use kyon mana karta hai)</h3>
<p>Yeh Python ka sabse mashhoor trap hai aur Lab 2 ka pehla bug. <code>[]</code> likha default <b>ek hi baar</b> banta hai, jab Python line padhta hai, har object banate waqt nahi. Plain class mein:</p>
<pre class="code">class Device:
    def __init__(self, name, interfaces=[]):
        self.name = name
        self.interfaces = interfaces

a = Device("R1")
b = Device("R3")
a.interfaces.append("Gi0/0")
print(b.interfaces)
print(a.interfaces is b.interfaces)</pre>
<pre class="out">AUTO01$ python3 t2.py
<span class="hl">['Gi0/0']</span>
True</pre>
<p>R3 ko kabhi interface nahi mila, phir bhi uski list <code>Gi0/0</code> dikhati hai: dono objects ek hi list ko point karte hain. Yahi dictionaries aur sets par bhi lagu hota hai. Dataclasses galti ko seedha refuse karke aapko bachati hain:</p>
<pre class="code">from dataclasses import dataclass


@dataclass
class Device:
    name: str
    interfaces: list = []</pre>
<pre class="out">AUTO01$ python3 c7c.py
Traceback (most recent call last):
  File "c7c.py", line 7, in &lt;module&gt;
    interfaces: list = []
<span class="hl">ValueError: mutable default &lt;class 'list'&gt; for field interfaces is not allowed: use default_factory</span></pre>
<p>Message ilaaj ka naam batata hai. Kisi bhi function ya class ke liye general rule: list, dictionary ya set ko kabhi default mat banao; <code>None</code> use karo aur andar object banao, ya <code>default_factory</code> use karo.</p>
<p>Ek aur ordering error jo aap dekhoge: default wale field ke baad bina default wala field:</p>
<pre class="out">AUTO01$ python3 c7b.py
Traceback (most recent call last):
  File "c7b.py", line 8, in &lt;module&gt;
    ip: str
<span class="hl">TypeError: non-default argument 'ip' follows default argument</span></pre>
<p>Yahan <code>role: str = "edge"</code> <code>ip: str</code> se pehle aaya. Required fields pehle, optional baad mein rakho.</p>

<h3>frozen=True: jo records badal nahi sakte</h3>
<p>VLAN definition ek baar approve ho jaaye to galti se edit nahi honi chahiye. <code>@dataclass(frozen=True)</code> construction ke baad har assignment ko error bana deta hai:</p>
<pre class="code">@dataclass(frozen=True)
class Vlan:
    vid: int
    name: str


v = Vlan(10, "USERS")
print(v)
try:
    v.name = "GUEST"
except Exception as e:
    print(type(e).__name__ + ":", e)</pre>
<pre class="out">AUTO01$ python3 c7d.py
Vlan(vid=10, name='USERS')
FrozenInstanceError: cannot assign to field 'name'</pre>
<p>Frozen object ko "badalne" ke liye <code>replace(v, name="GUEST")</code> se naya banao. Asli Python mein frozen dataclass hashable bhi hoti hai, isliye woh dictionary key ya set member ban sakti hai, aur freeze karne ki yeh ek aam wajah hai. Lab dataclasses ki hashing ko sahi se model nahi karta, isliye hum use yahan test nahi karte.</p>

<h3>order=True: sorting muft mein</h3>
<p><code>order=True</code> jodo to dataclass <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code> likh deti hai, fields ko tuple ki tarah declare hue order mein compare karke:</p>
<pre class="code">@dataclass(order=True)
class Vlan:
    vid: int
    name: str = ""


vl = [Vlan(30, "GUEST"), Vlan(10, "USERS"), Vlan(20, "VOICE")]
print(sorted(vl))
print(Vlan(10) &lt; Vlan(20), max(vl))</pre>
<pre class="out">AUTO01$ python3 c7e.py
[Vlan(vid=10, name='USERS'), Vlan(vid=20, name='VOICE'), Vlan(vid=30, name='GUEST')]
True Vlan(vid=30, name='GUEST')</pre>
<p><code>vid</code> se sort hua, kyunki woh pehla field hai. <code>order=True</code> ke bina <code>Vlan(10, "A") &lt; Vlan(20, "B")</code> <code>TypeError: '&lt;' not supported between instances of 'Vlan' and 'Vlan'</code> deta hai. Doosre sort order ke liye fields ko pheta-pheti karne ki jagah <code>sorted(devices, key=...)</code> use karo (chapter 9).</p>

<div class="warn"><p><b>Common mistakes.</b> Default mein seedha <code>[]</code>, <code>{}</code> ya <code>set()</code>. Optional field ke baad required field. Frozen object ko <code>replace</code> ki jagah modify karne ki koshish. <code>order=True</code> par bharosa karke fields ka order badal dena, jisse sort order chupke se badal jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>field(default_factory=list)</code> function <code>list</code> ko khud leta hai, bracket ke bina. <code>default_factory=list()</code> likhne se khaali list pass hoti hai aur error aata hai, kyunki list callable nahi hai.</p></div>

<div class="scn"><h4>Jo interfaces kahin se aa gaye</h4><p>Ek audit script ne bilkul naye router ke liye 2 interfaces print kiye jise kisi ne configure nahi kiya tha. Wajah constructor mein <code>interfaces=[]</code> thi: pehle router ke interfaces har baad ke router ke saath shared ho rahe the. <code>None</code> par jaakar <code>__init__</code> ke andar <code>list(interfaces or [])</code> banane se har router ko apni list mili, aur audit count 0 ho gaya, jo sahi tha.</p><p><b>Lesson:</b> mutable default har object ke saath shared hota hai. Hamesha per object banao.</p></div>

<div class="iv"><p class="q">"def __init__(self, interfaces=[]) mein kya galat hai?"</p><p>Default list function define hote waqt ek baar banti hai aur har us call ke saath shared hoti hai jo argument chhod deti hai. Ek object mein append karne se sab badal jaate hain. Main <code>interfaces=None</code> use karta hoon aur andar nayi list banata hoon, ya dataclass mein <code>field(default_factory=list)</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defaults annotation ke baad aate hain; defaults wale fields bina-default wale fields ke baad aate hain.</li>
<li><code>[]</code>, <code>{}</code> ya <code>set()</code> ko default mat banao; <code>None</code> ya <code>default_factory</code> use karo.</li>
<li><code>frozen=True</code> object ko read-only banata hai; badli copy ke liye <code>replace()</code>.</li>
<li><code>order=True</code> field order se comparisons jodta hai.</li>
<li>Shared default list Lab 2 ka pehla bug hai.</li>
</ul></div>
`}};export{e as default};