var e={id:`inheritance-super`,h:{en:`Inheritance and super(): Router and Switch from Device`,hi:`Inheritance aur super(): Device se Router aur Switch`},body:{en:`
<p><b>The idea of this chapter:</b> routers and switches share a lot (a name, an IP, interfaces) and differ in a few things (a router has an AS number, a switch has VLANs). <b>Inheritance</b> lets you write the shared part once in a parent class and add only the differences in child classes.</p>

<h3>Analogy: the base form and the specialised forms</h3>
<p>The NOC has a base device card. For routers it staples on an extra sheet "BGP AS number"; for switches, an extra sheet "VLAN list". Nobody redraws the base card. A child class is "the base card plus my extra sheet". It <b>inherits</b> everything from the parent and may <b>override</b> (replace) any part.</p>

<h3>Writing a child class</h3>
<p>Put the parent in brackets: <code>class Router(Device):</code>. The child gets every attribute and method of <code>Device</code>. If it defines a method with the same name, the child's version wins (<b>override</b>). To reuse the parent's version inside the override, call <code>super()</code>, which means "the parent class's version".</p>
<pre class="code">class Device:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
        self.interfaces = []

    def describe(self):
        return f"{self.name} {self.ip}"

    def show_cmd(self):
        return "show version"


class Router(Device):
    def __init__(self, name, ip, asn):
        super().__init__(name, ip)
        self.asn = asn

    def describe(self):
        return super().describe() + f" AS{self.asn}"

    def show_cmd(self):
        return "show ip route"


class Switch(Device):
    def __init__(self, name, ip, vlans=None):
        super().__init__(name, ip)
        self.vlans = list(vlans or [])

    def show_cmd(self):
        return "show vlan brief"


devs = [Router("PUN-CORE-R1", "10.99.0.1", 65001), Switch("SW1", "10.99.0.20", [10, 20]), Device("X", "10.0.0.9")]
for d in devs:
    print(type(d).__name__, "|", d.describe(), "|", d.show_cmd())
r = devs[0]
print(isinstance(r, Router), isinstance(r, Device), isinstance(r, Switch))
print(issubclass(Router, Device))
print(Router.__mro__)
print(Router.__bases__)
print(r.__dict__)</pre>
<pre class="out">AUTO01$ python3 c8a.py
Router | PUN-CORE-R1 10.99.0.1 AS65001 | show ip route
Switch | SW1 10.99.0.20 | show vlan brief
Device | X 10.0.0.9 | show version
True True False
True
(&lt;class '__main__.Router'&gt;, &lt;class '__main__.Device'&gt;, &lt;class 'object'&gt;)
(&lt;class '__main__.Device'&gt;,)
{'name': 'PUN-CORE-R1', 'ip': '10.99.0.1', 'interfaces': [], 'asn': 65001}</pre>
<p>Read the three result lines. The loop calls the same two method names on three different kinds of object, and each answers in its own way: this is <b>polymorphism</b> ("many shapes"). The router's <code>describe</code> reuses the parent's text with <code>super().describe()</code> and adds the AS number. The switch does not override <code>describe</code>, so it uses the parent's. Plain <code>Device</code> uses the default <code>show version</code>. The script that loops never needs <code>if type == "router"</code>: you add a new kind of device and the loop still works.</p>
<p>Further down: <code>isinstance(r, Device)</code> is <code>True</code>, because a router <i>is a</i> device (that "is-a" test is how you decide to use inheritance). <code>Router.__mro__</code> is the <b>method resolution order</b>, the list Python searches when you call a method: first <code>Router</code>, then <code>Device</code>, then the universal base <code>object</code>. <code>r.__dict__</code> shows that one object holds the parent's attributes (<code>name, ip, interfaces</code>) and the child's (<code>asn</code>) together.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Device is the parent of Router and Switch">
<rect x="205" y="15" width="230" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">class Device</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">name, ip, interfaces, describe()</text>
<rect x="40" y="130" width="230" height="70" rx="10" fill="#bae6fd"/><text x="155" y="155" text-anchor="middle" class="svg-ink" font-size="13">class Router(Device)</text><text x="155" y="175" text-anchor="middle" class="svg-muted" font-size="11">adds asn, own show_cmd</text>
<rect x="370" y="130" width="230" height="70" rx="10" fill="#bbf7d0"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="13">class Switch(Device)</text><text x="485" y="175" text-anchor="middle" class="svg-muted" font-size="11">adds vlans, own show_cmd</text>
<line x1="155" y1="130" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="485" y1="130" x2="370" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="11">is-a</text>
</svg><p class="cap">The arrows point up: a Router is a Device.</p></div>

<h3>Why super().__init__() matters (Lab 2 bug number two)</h3>
<p>If a child defines its own <code>__init__</code>, the parent's is <b>not</b> run automatically. You must call it, with the arguments it needs. Forget, and the parent's attributes are never created:</p>
<pre class="code">class Device:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip


class Router(Device):
    def __init__(self, name, ip, asn):
        self.asn = asn


r = Router("R1", "10.0.0.1", 65001)
print(r.asn)
print(r.name)</pre>
<pre class="out">AUTO01$ python3 c8b.py
65001
Traceback (most recent call last):
  File "c8b.py", line 14, in &lt;module&gt;
    print(r.name)
<span class="hl">AttributeError: 'Router' object has no attribute 'name'</span></pre>
<p>The router has its AS number but no name. A related slip is calling <code>super().__init__()</code> with <i>no</i> arguments when the parent requires a name; that raises <code>TypeError: Device.__init__() missing 1 required positional argument: 'name'</code>, which is exactly what you will see in Lab 2 and fix with <code>super().__init__(name)</code>.</p>

<h3>Inheritance with dataclasses</h3>
<p>Dataclasses inherit too. The child's fields are added after the parent's, so the generated <code>__init__</code> takes the parent fields first. Remember the rule from chapter 7: if the parent has no defaults, child fields may have them.</p>
<pre class="code">from dataclasses import dataclass, field


@dataclass
class Device:
    name: str
    ip: str


@dataclass
class Router(Device):
    asn: int = 0
    neighbors: list = field(default_factory=list)


@dataclass
class Switch(Device):
    vlans: list = field(default_factory=list)


r = Router("PUN-CORE-R1", "10.99.0.1", 65001)
s = Switch("SW1", "10.99.0.20", [10, 20])
print(r)
print(s)
print(r == Router("PUN-CORE-R1", "10.99.0.1", 65001))
print(isinstance(r, Device))</pre>
<pre class="out">AUTO01$ python3 c8c.py
Router(name='PUN-CORE-R1', ip='10.99.0.1', asn=65001, neighbors=[])
Switch(name='SW1', ip='10.99.0.20', vlans=[10, 20])
True
True</pre>
<p>No <code>super()</code> call is needed, because the generated <code>__init__</code> sets all fields, parent and child.</p>

<h3>Forcing children to implement a method</h3>
<p>Sometimes the parent should say "every child must supply this". Raise <code>NotImplementedError</code> in the parent so a forgetful child fails with a clear message:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name
    def show_cmd(self):
        raise NotImplementedError("subclass must define show_cmd")

class Firewall(Device):
    pass

try:
    Firewall("FW1").show_cmd()
except NotImplementedError as e:
    print("NotImplementedError:", e)
print(hasattr(Firewall("FW1"), "name"), hasattr(Firewall("FW1"), "asn"))
print(getattr(Firewall("FW1"), "asn", "none"))</pre>
<pre class="out">AUTO01$ python3 c8d.py
NotImplementedError: subclass must define show_cmd
True False
none</pre>
<p><code>hasattr</code> and <code>getattr(obj, "name", default)</code> let you ask whether an attribute exists without crashing.</p>

<div class="warn"><p><b>Common mistakes.</b> Overriding <code>__init__</code> and forgetting <code>super().__init__(...)</code>. Passing the wrong arguments to it. Using inheritance when the relationship is "has-a" (a router <i>has</i> interfaces; it is not a kind of interface), where you should store a list instead. Building deep trees of five levels; prefer shallow hierarchies.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>super().__init__()</code> does not pass <code>self</code> explicitly; Python supplies it. Writing <code>super().__init__(self, name)</code> gives one argument too many.</p></div>

<div class="scn"><h4>The BGP check that skipped the firewall</h4><p>A health-check script looped over all devices and called <code>d.show_cmd()</code>. A new <code>Firewall</code> class had been added without that method and silently inherited the parent's <code>show version</code>, so the BGP check ran the wrong command. The parent was changed to raise <code>NotImplementedError</code>; the next run failed loudly on the firewall, and the team added the right command in one place.</p><p><b>Lesson:</b> make "must override" explicit.</p></div>

<div class="iv"><p class="q">"What does super() do?"</p><p>It gives access to the parent class's version of a method. In an overridden <code>__init__</code> I call <code>super().__init__(...)</code> so the parent still sets up its attributes, then add the child's own. In other methods I use it to extend, not replace, the parent's behaviour.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>class Router(Device):</code> inherits everything; redefine a method to override it.</li>
<li><code>super().__init__(...)</code> runs the parent constructor; forgetting it loses the parent's attributes.</li>
<li>The same method name on different classes gives polymorphism, with no <code>if type</code> chains.</li>
<li>Use inheritance for "is-a" and a list of objects for "has-a".</li>
<li>Dataclasses inherit fields; child fields follow the parent's.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> routers aur switches mein bahut kuch common hai (naam, IP, interfaces) aur thodi cheezein alag (router ka AS number, switch ke VLANs). <b>Inheritance</b> se shared hissa parent class mein ek baar likhte ho aur child classes mein sirf farak jodte ho.</p>

<h3>Analogy: base form aur specialised forms</h3>
<p>NOC ke paas base device card hai. Routers ke liye woh ek extra sheet "BGP AS number" staple karta hai; switches ke liye extra sheet "VLAN list". Base card koi dobara nahi banata. Child class hai "base card plus meri extra sheet". Woh parent se sab kuch <b>inherit</b> karti hai aur kisi bhi hisse ko <b>override</b> (replace) kar sakti hai.</p>

<h3>Child class likhna</h3>
<p>Parent ko bracket mein rakho: <code>class Router(Device):</code>. Child ko <code>Device</code> ka har attribute aur method milta hai. Wahi naam ka method define karo to child ka version jeetta hai (<b>override</b>). Override ke andar parent ka version dobara use karne ke liye <code>super()</code> call karo, jiska matlab "parent class ka version".</p>
<pre class="code">class Device:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
        self.interfaces = []

    def describe(self):
        return f"{self.name} {self.ip}"

    def show_cmd(self):
        return "show version"


class Router(Device):
    def __init__(self, name, ip, asn):
        super().__init__(name, ip)
        self.asn = asn

    def describe(self):
        return super().describe() + f" AS{self.asn}"

    def show_cmd(self):
        return "show ip route"


class Switch(Device):
    def __init__(self, name, ip, vlans=None):
        super().__init__(name, ip)
        self.vlans = list(vlans or [])

    def show_cmd(self):
        return "show vlan brief"


devs = [Router("PUN-CORE-R1", "10.99.0.1", 65001), Switch("SW1", "10.99.0.20", [10, 20]), Device("X", "10.0.0.9")]
for d in devs:
    print(type(d).__name__, "|", d.describe(), "|", d.show_cmd())
r = devs[0]
print(isinstance(r, Router), isinstance(r, Device), isinstance(r, Switch))
print(issubclass(Router, Device))
print(Router.__mro__)
print(Router.__bases__)
print(r.__dict__)</pre>
<pre class="out">AUTO01$ python3 c8a.py
Router | PUN-CORE-R1 10.99.0.1 AS65001 | show ip route
Switch | SW1 10.99.0.20 | show vlan brief
Device | X 10.0.0.9 | show version
True True False
True
(&lt;class '__main__.Router'&gt;, &lt;class '__main__.Device'&gt;, &lt;class 'object'&gt;)
(&lt;class '__main__.Device'&gt;,)
{'name': 'PUN-CORE-R1', 'ip': '10.99.0.1', 'interfaces': [], 'asn': 65001}</pre>
<p>Teen result lines padho. Loop teen alag kism ke objects par wahi do method naam call karta hai, aur har ek apne tareeke se jawab deta hai: yeh <b>polymorphism</b> ("kai shapes") hai. Router ka <code>describe</code> <code>super().describe()</code> se parent ka text reuse karta hai aur AS number jodta hai. Switch <code>describe</code> override nahi karta, isliye parent ka use karta hai. Plain <code>Device</code> default <code>show version</code> use karta hai. Loop chalane wali script ko kabhi <code>if type == "router"</code> nahi chahiye: naya device kism jodo aur loop phir bhi chalta hai.</p>
<p>Aage: <code>isinstance(r, Device)</code> <code>True</code> hai, kyunki router ek device <i>hai</i> (yeh "is-a" test hi tay karta hai ki inheritance use karni hai). <code>Router.__mro__</code> <b>method resolution order</b> hai, woh list jisme Python method call par dhoondhta hai: pehle <code>Router</code>, phir <code>Device</code>, phir sab ka base <code>object</code>. <code>r.__dict__</code> dikhata hai ki ek object parent ke attributes (<code>name, ip, interfaces</code>) aur child ke (<code>asn</code>) saath mein rakhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Device Router aur Switch ka parent hai">
<rect x="205" y="15" width="230" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">class Device</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="11">name, ip, interfaces, describe()</text>
<rect x="40" y="130" width="230" height="70" rx="10" fill="#bae6fd"/><text x="155" y="155" text-anchor="middle" class="svg-ink" font-size="13">class Router(Device)</text><text x="155" y="175" text-anchor="middle" class="svg-muted" font-size="11">asn jodta hai, apna show_cmd</text>
<rect x="370" y="130" width="230" height="70" rx="10" fill="#bbf7d0"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="13">class Switch(Device)</text><text x="485" y="175" text-anchor="middle" class="svg-muted" font-size="11">vlans jodta hai, apna show_cmd</text>
<line x1="155" y1="130" x2="270" y2="85" stroke="#64748b" stroke-width="2"/><line x1="485" y1="130" x2="370" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="108" text-anchor="middle" class="svg-accent" font-size="11">is-a</text>
</svg><p class="cap">Teer upar ki taraf hain: Router ek Device hai.</p></div>

<h3>super().__init__() kyon zaroori hai (Lab 2 ka doosra bug)</h3>
<p>Child apna <code>__init__</code> define kare to parent ka <b>apne aap nahi</b> chalta. Aapko use call karna padta hai, uske zaroori arguments ke saath. Bhoole to parent ke attributes kabhi bante hi nahi:</p>
<pre class="code">class Device:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip


class Router(Device):
    def __init__(self, name, ip, asn):
        self.asn = asn


r = Router("R1", "10.0.0.1", 65001)
print(r.asn)
print(r.name)</pre>
<pre class="out">AUTO01$ python3 c8b.py
65001
Traceback (most recent call last):
  File "c8b.py", line 14, in &lt;module&gt;
    print(r.name)
<span class="hl">AttributeError: 'Router' object has no attribute 'name'</span></pre>
<p>Router ke paas AS number hai par naam nahi. Isse milti-julti galti <code>super().__init__()</code> ko <i>bina</i> arguments ke call karna hai jab parent ko naam chahiye; tab <code>TypeError: Device.__init__() missing 1 required positional argument: 'name'</code> aata hai, jo Lab 2 mein dikhega aur <code>super().__init__(name)</code> se theek hoga.</p>

<h3>Dataclasses ke saath inheritance</h3>
<p>Dataclasses bhi inherit karti hain. Child ke fields parent ke baad jude hote hain, isliye generated <code>__init__</code> pehle parent ke fields leta hai. Chapter 7 ka rule yaad rakho: parent mein defaults na ho to child fields mein ho sakte hain.</p>
<pre class="code">from dataclasses import dataclass, field


@dataclass
class Device:
    name: str
    ip: str


@dataclass
class Router(Device):
    asn: int = 0
    neighbors: list = field(default_factory=list)


@dataclass
class Switch(Device):
    vlans: list = field(default_factory=list)


r = Router("PUN-CORE-R1", "10.99.0.1", 65001)
s = Switch("SW1", "10.99.0.20", [10, 20])
print(r)
print(s)
print(r == Router("PUN-CORE-R1", "10.99.0.1", 65001))
print(isinstance(r, Device))</pre>
<pre class="out">AUTO01$ python3 c8c.py
Router(name='PUN-CORE-R1', ip='10.99.0.1', asn=65001, neighbors=[])
Switch(name='SW1', ip='10.99.0.20', vlans=[10, 20])
True
True</pre>
<p><code>super()</code> call ki zaroorat nahi, kyunki generated <code>__init__</code> parent aur child dono ke saare fields set karta hai.</p>

<h3>Children se method implement karwana</h3>
<p>Kabhi parent ko kehna hota hai "har child yeh dega". Parent mein <code>NotImplementedError</code> raise karo taaki bhoolne wala child saaf message ke saath fail ho:</p>
<pre class="code">class Device:
    def __init__(self, name):
        self.name = name
    def show_cmd(self):
        raise NotImplementedError("subclass must define show_cmd")

class Firewall(Device):
    pass

try:
    Firewall("FW1").show_cmd()
except NotImplementedError as e:
    print("NotImplementedError:", e)
print(hasattr(Firewall("FW1"), "name"), hasattr(Firewall("FW1"), "asn"))
print(getattr(Firewall("FW1"), "asn", "none"))</pre>
<pre class="out">AUTO01$ python3 c8d.py
NotImplementedError: subclass must define show_cmd
True False
none</pre>
<p><code>hasattr</code> aur <code>getattr(obj, "name", default)</code> se poochh sakte ho ki attribute hai ya nahi, crash hue bina.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>__init__</code> override karke <code>super().__init__(...)</code> bhool jana. Usme galat arguments dena. Jahan relation "has-a" hai wahan inheritance use karna (router ke paas interfaces <i>hain</i>; woh interface ki kism nahi), wahan list rakhni chahiye. Paanch level ke gehre trees banana; shallow hierarchies behtar hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>super().__init__()</code> mein <code>self</code> explicit pass nahi hota; Python deta hai. <code>super().__init__(self, name)</code> likhne se ek argument zyada ho jaata hai.</p></div>

<div class="scn"><h4>BGP check jisne firewall chhod diya</h4><p>Ek health-check script saare devices par loop karke <code>d.show_cmd()</code> call karti thi. Naya <code>Firewall</code> class us method ke bina jodi gayi aur chupke se parent ka <code>show version</code> inherit kar liya, isliye BGP check ne galat command chalayi. Parent ko <code>NotImplementedError</code> raise karne ke liye badla gaya; agle run mein firewall par loudly fail hua, aur team ne sahi command ek jagah jod di.</p><p><b>Lesson:</b> "must override" ko explicit banao.</p></div>

<div class="iv"><p class="q">"super() kya karta hai?"</p><p>Yeh parent class ke method ka version access deta hai. Override kiye <code>__init__</code> mein main <code>super().__init__(...)</code> call karta hoon taaki parent apne attributes set kare, phir child ke apne jodta hoon. Doosre methods mein parent ke behaviour ko replace nahi, extend karne ke liye use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>class Router(Device):</code> sab inherit karta hai; method dobara define karo to override.</li>
<li><code>super().__init__(...)</code> parent constructor chalata hai; bhoolne par parent ke attributes kho jaate hain.</li>
<li>Alag classes par wahi method naam polymorphism deta hai, <code>if type</code> chains ke bina.</li>
<li>"Is-a" ke liye inheritance, "has-a" ke liye objects ki list.</li>
<li>Dataclasses fields inherit karti hain; child ke fields parent ke baad aate hain.</li>
</ul></div>
`}};export{e as default};