var e={id:`class-init-attributes`,h:{en:`Your first class: __init__ and attributes (Lab 1 starts)`,hi:`Aapki pehli class: __init__ aur attributes (Lab 1 shuru)`},body:{en:`
<p><b>The idea of this chapter:</b> write a class once, then stamp out as many device objects as you like. Each object remembers its own name, role, IP and site.</p>

<h3>The shape of a class</h3>
<p>You already know how to write a function with <code>def</code>. A class uses the word <code>class</code>, then a name (capitalised by habit), a colon, and an indented body. The most important thing inside is a special function called <code>__init__</code> (say "dunder init": double underscore on each side). Python calls it automatically, right after it creates a new empty object, so you can fill in the boxes of the record card.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site</pre>
<ul>
<li><code>class Device:</code> defines the blank form. Nothing runs yet.</li>
<li><code>def __init__(self, ...)</code> is the <b>constructor</b>. The first parameter is always <code>self</code>: the new object itself. You do not pass it; Python does.</li>
<li><code>self.name = name</code> stores the value in an <b>attribute</b> called <code>name</code> on this object. The left side is the box on the card, the right side is the value you were given.</li>
</ul>
<p>This is exactly the <code>netmodel.py</code> file that Lab 1 gives you on AUTO01.</p>

<h3>Creating and using objects</h3>
<p>Calling the class like a function builds an object: <code>Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")</code>. Python creates an empty object, then runs <code>__init__</code> with that object as <code>self</code> and your four values as the other parameters. You read an attribute with a dot: <code>r1.name</code>.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1.name, r1.ip)
print(r2.name, r2.ip)
r2.site = "Bangalore"
print(r2.site)
print(type(r1))
print(isinstance(r1, Device))
print(r1 is r2)
print(r1.__dict__)
print(vars(r2))
r1.vendor = "Cisco"
print(r1.vendor)</pre>
<pre class="out">AUTO01$ python3 c2a.py
PUN-CORE-R1 10.99.0.1
BLR-EDGE-R2 10.99.0.2
Bangalore
&lt;class '__main__.Device'&gt;
True
False
{'name': 'PUN-CORE-R1', 'role': 'core', 'ip': '10.99.0.1', 'site': 'Pune'}
{'name': 'BLR-EDGE-R2', 'role': 'edge', 'ip': '10.99.0.2', 'site': 'Bangalore'}
Cisco</pre>
<p>Read it line by line. Two objects, each with its own values. Writing <code>r2.site = "Bangalore"</code> changes only R2. <code>type(r1)</code> shows the class it was built from (<code>__main__</code> is the name of the file you ran directly). <code>isinstance(r1, Device)</code> asks "was this built from Device?". <code>r1 is r2</code> asks "are these the very same object?"; they are two different cards, so <code>False</code>. <code>__dict__</code> and <code>vars()</code> show the attributes as a dictionary, a great debugging peek. The last two lines show something to be careful about: Python happily lets you attach a brand-new attribute <code>vendor</code> to one object, even though the class never mentioned it.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Calling the class runs __init__">
<rect x="10" y="40" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="95" y="66" text-anchor="middle" class="svg-ink" font-size="12">Device("PUN-CORE-R1", ...)</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="10">you call the class</text>
<rect x="220" y="40" width="170" height="60" rx="10" fill="#fde68a"/><text x="305" y="66" text-anchor="middle" class="svg-ink" font-size="12">new empty object</text><text x="305" y="85" text-anchor="middle" class="svg-muted" font-size="10">Python creates it</text>
<rect x="430" y="40" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="66" text-anchor="middle" class="svg-ink" font-size="12">__init__(self, ...)</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="10">fills in the attributes</text>
<line x1="180" y1="70" x2="220" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">self = the new object</text>
</svg><p class="cap">Three steps happen every time you write Device(...).</p></div>

<h3>Lab 1, task 1: run main.py</h3>
<p>On AUTO01, <code>main.py</code> reads <code>inventory.csv</code> with <code>csv.DictReader</code> and builds one <code>Device</code> per row. Run it:</p>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">&lt;netmodel.Device object at 0x7f007f3a1c50&gt;</span>
&lt;netmodel.Device object at 0x7f007f3a1c80&gt;
&lt;netmodel.Device object at 0x7f007f3a1cb0&gt;
[&lt;netmodel.Device object at 0x7f007f3a1c50&gt;, &lt;netmodel.Device object at 0x7f007f3a1c80&gt;, &lt;netmodel.Device object at 0x7f007f3a1cb0&gt;]</pre>
<p>Three objects exist (the answer to the task is <b>3</b>). The memory addresses after <code>0x</code> change on every run, so do not worry if yours differ. The point is that Python has no idea how to show a <code>Device</code> yet, so it prints the class name and a memory address. The next chapters fix that.</p>

<h3>Class attributes versus object attributes</h3>
<p>An attribute set with <code>self.</code> belongs to one object. An attribute written directly in the class body belongs to the class and is shared as a default by every object:</p>
<pre class="code">class Device:
    vendor = "Cisco"
    count = 0

    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
        Device.count += 1

a = Device("R1", "10.99.0.1")
b = Device("R2", "10.99.0.2")
print(a.vendor, b.vendor, Device.count)
b.vendor = "Juniper"
print(a.vendor, b.vendor, Device.vendor)
print(a.__dict__)
print(b.__dict__)</pre>
<pre class="out">AUTO01$ python3 c2d.py
Cisco Cisco 2
Cisco Juniper Cisco
{'name': 'R1', 'ip': '10.99.0.1'}
{'name': 'R2', 'ip': '10.99.0.2', 'vendor': 'Juniper'}</pre>
<p><code>count</code> is a shared counter on the class. When <code>b.vendor = "Juniper"</code> runs, Python does not change the class; it creates a private <code>vendor</code> on <code>b</code> only, which is why <code>__dict__</code> of <code>b</code> has it and that of <code>a</code> does not. Use class attributes for constants and counters, object attributes for facts about one device.</p>

<h3>Two errors you will meet in this chapter</h3>
<p>In <code>c2b.py</code> the constructor stores only <code>self.name</code> and <code>self.ip</code>, and line 7 asks for <code>r1.hostname</code>. In <code>c2c.py</code> the constructor needs four values (<code>name, role, ip, site</code>) and line 5 passes only three.</p>
<pre class="out">AUTO01$ python3 c2b.py
Traceback (most recent call last):
  File "c2b.py", line 7, in &lt;module&gt;
    print(r1.hostname)
<span class="hl">AttributeError: 'Device' object has no attribute 'hostname'</span>
AUTO01$ python3 c2c.py
Traceback (most recent call last):
  File "c2c.py", line 5, in &lt;module&gt;
    r1 = Device("PUN-CORE-R1", "core", "10.99.0.1")
<span class="hl">TypeError: Device.__init__() missing 1 required positional argument: 'site'</span></pre>
<p>The first asks for an attribute the object never had (here <code>__init__</code> stored only <code>name</code> and <code>ip</code>). The second forgot to give a value for <code>site</code>. Both messages name the exact thing, so read the last line first.</p>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>self.</code> in <code>self.name = name</code>: then the value is a throw-away local variable and the object never gets the attribute. Spelling an attribute differently when you write and read it. Passing the arguments in the wrong order: the class does not know that "core" was meant to be the role.</p></div>
<div class="exam"><p><b>Exam trap.</b> You write <code>__init__(self, name)</code> but call <code>Device("R1")</code>: only one argument is passed by you. <code>self</code> is supplied by Python, so the error message counts it as the first parameter, not as something you forgot.</p></div>

<div class="scn"><h4>The nameless router</h4><p>A report listed the names of all routers but printed <code>None</code> for one. The engineer checked <code>__init__</code> and found <code>name = name</code> instead of <code>self.name = name</code> for that field, so the value was thrown away at the end of the constructor. Printing <code>obj.__dict__</code> showed the missing key at once.</p><p><b>Lesson:</b> when an attribute is missing, look at <code>__dict__</code> and at the <code>self.</code> prefixes.</p></div>

<div class="iv"><p class="q">"What does __init__ do and what is self?"</p><p><code>__init__</code> is the constructor Python runs right after creating an object. <code>self</code> is that new object, passed automatically as the first parameter; assigning to <code>self.attr</code> gives the object its own data. Each object has its own attributes, while class-level attributes are shared defaults.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>class Device:</code> defines the form; <code>Device(...)</code> builds an object.</li>
<li><code>__init__(self, ...)</code> runs automatically and stores values with <code>self.name = name</code>.</li>
<li>Read attributes with a dot; <code>obj.__dict__</code> shows them all.</li>
<li>Class attributes are shared defaults; setting one on an object creates a private copy.</li>
<li>Without a <code>__str__</code>, print shows a class name and a memory address.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> class ek baar likho, phir jitne chaaho device objects banao. Har object apna name, role, IP aur site yaad rakhta hai.</p>

<h3>Class ki shape</h3>
<p>Aap <code>def</code> se function likhna jaante ho. Class mein <code>class</code> shabd aata hai, phir naam (aadat se capital letter se), colon, aur indented body. Andar sabse zaroori cheez ek special function <code>__init__</code> hai ("dunder init" bolte hain: dono taraf double underscore). Python naya khaali object banate hi ise apne aap call karta hai, taaki aap record card ke dibbe bhar sako.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site</pre>
<ul>
<li><code>class Device:</code> khaali form define karta hai. Abhi kuch chalta nahi.</li>
<li><code>def __init__(self, ...)</code> <b>constructor</b> hai. Pehla parameter hamesha <code>self</code> hota hai: naya object khud. Aap ise pass nahi karte; Python karta hai.</li>
<li><code>self.name = name</code> value ko is object ke <b>attribute</b> <code>name</code> mein rakhta hai. Left side card ka dibba hai, right side woh value jo aapko di gayi.</li>
</ul>
<p>Lab 1 mein AUTO01 par aapko yahi <code>netmodel.py</code> file milti hai.</p>

<h3>Objects banana aur use karna</h3>
<p>Class ko function ki tarah call karne se object banta hai: <code>Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")</code>. Python khaali object banata hai, phir <code>__init__</code> ko us object ko <code>self</code> aur aapki chaar values ko baaki parameters bana kar chalata hai. Attribute dot se padhte ho: <code>r1.name</code>.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1.name, r1.ip)
print(r2.name, r2.ip)
r2.site = "Bangalore"
print(r2.site)
print(type(r1))
print(isinstance(r1, Device))
print(r1 is r2)
print(r1.__dict__)
print(vars(r2))
r1.vendor = "Cisco"
print(r1.vendor)</pre>
<pre class="out">AUTO01$ python3 c2a.py
PUN-CORE-R1 10.99.0.1
BLR-EDGE-R2 10.99.0.2
Bangalore
&lt;class '__main__.Device'&gt;
True
False
{'name': 'PUN-CORE-R1', 'role': 'core', 'ip': '10.99.0.1', 'site': 'Pune'}
{'name': 'BLR-EDGE-R2', 'role': 'edge', 'ip': '10.99.0.2', 'site': 'Bangalore'}
Cisco</pre>
<p>Line by line padho. Do objects, har ek ki apni values. <code>r2.site = "Bangalore"</code> sirf R2 ko badalta hai. <code>type(r1)</code> dikhata hai ki woh kis class se bana (<code>__main__</code> us file ka naam hai jo aapne seedha chalayi). <code>isinstance(r1, Device)</code> poochta hai "kya yeh Device se bana hai?". <code>r1 is r2</code> poochta hai "kya yeh bilkul wahi object hain?"; yeh do alag cards hain, isliye <code>False</code>. <code>__dict__</code> aur <code>vars()</code> attributes ko dictionary ki tarah dikhate hain, debugging ke liye shaandaar jhalak. Aakhri do lines mein dhyan dene wali baat hai: Python ek object par bilkul naya attribute <code>vendor</code> jodne deta hai, bhale class ne uska zikr hi na kiya ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Class call karne par __init__ chalta hai">
<rect x="10" y="40" width="170" height="60" rx="10" fill="#e2e8f0"/><text x="95" y="66" text-anchor="middle" class="svg-ink" font-size="12">Device("PUN-CORE-R1", ...)</text><text x="95" y="85" text-anchor="middle" class="svg-muted" font-size="10">aap class call karte ho</text>
<rect x="220" y="40" width="170" height="60" rx="10" fill="#fde68a"/><text x="305" y="66" text-anchor="middle" class="svg-ink" font-size="12">naya khaali object</text><text x="305" y="85" text-anchor="middle" class="svg-muted" font-size="10">Python banata hai</text>
<rect x="430" y="40" width="200" height="60" rx="10" fill="#bbf7d0"/><text x="530" y="66" text-anchor="middle" class="svg-ink" font-size="12">__init__(self, ...)</text><text x="530" y="85" text-anchor="middle" class="svg-muted" font-size="10">attributes bharta hai</text>
<line x1="180" y1="70" x2="220" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="70" x2="430" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">self = naya object</text>
</svg><p class="cap">Device(...) likhte hi teen steps hote hain.</p></div>

<h3>Lab 1, task 1: main.py chalao</h3>
<p>AUTO01 par <code>main.py</code> <code>csv.DictReader</code> se <code>inventory.csv</code> padhta hai aur har row ka ek <code>Device</code> banata hai. Chalao:</p>
<pre class="out">AUTO01$ python3 main.py
<span class="hl">&lt;netmodel.Device object at 0x7f007f3a1c50&gt;</span>
&lt;netmodel.Device object at 0x7f007f3a1c80&gt;
&lt;netmodel.Device object at 0x7f007f3a1cb0&gt;
[&lt;netmodel.Device object at 0x7f007f3a1c50&gt;, &lt;netmodel.Device object at 0x7f007f3a1c80&gt;, &lt;netmodel.Device object at 0x7f007f3a1cb0&gt;]</pre>
<p>Teen objects bane hain (task ka jawab <b>3</b> hai). <code>0x</code> ke baad ke memory addresses har run par badalte hain, isliye aapke alag hon to chinta mat karo. Asli baat yeh hai ki Python ko abhi <code>Device</code> dikhana aata hi nahi, isliye woh class ka naam aur memory address print karta hai. Agle chapters yeh theek karte hain.</p>

<h3>Class attributes aur object attributes</h3>
<p><code>self.</code> se set kiya attribute ek object ka hota hai. Class body mein seedha likha attribute class ka hota hai aur har object ke liye shared default ki tarah kaam karta hai:</p>
<pre class="code">class Device:
    vendor = "Cisco"
    count = 0

    def __init__(self, name, ip):
        self.name = name
        self.ip = ip
        Device.count += 1

a = Device("R1", "10.99.0.1")
b = Device("R2", "10.99.0.2")
print(a.vendor, b.vendor, Device.count)
b.vendor = "Juniper"
print(a.vendor, b.vendor, Device.vendor)
print(a.__dict__)
print(b.__dict__)</pre>
<pre class="out">AUTO01$ python3 c2d.py
Cisco Cisco 2
Cisco Juniper Cisco
{'name': 'R1', 'ip': '10.99.0.1'}
{'name': 'R2', 'ip': '10.99.0.2', 'vendor': 'Juniper'}</pre>
<p><code>count</code> class par shared counter hai. Jab <code>b.vendor = "Juniper"</code> chalta hai to Python class ko nahi badalta; woh sirf <code>b</code> par private <code>vendor</code> bana deta hai, isiliye <code>b</code> ke <code>__dict__</code> mein woh hai aur <code>a</code> ke mein nahi. Constants aur counters ke liye class attributes, ek device ke facts ke liye object attributes use karo.</p>

<h3>Is chapter ke do errors</h3>
<p><code>c2b.py</code> mein constructor sirf <code>self.name</code> aur <code>self.ip</code> rakhta hai, aur line 7 <code>r1.hostname</code> maangti hai. <code>c2c.py</code> mein constructor ko chaar values chahiye (<code>name, role, ip, site</code>) aur line 5 sirf teen deti hai.</p>
<pre class="out">AUTO01$ python3 c2b.py
Traceback (most recent call last):
  File "c2b.py", line 7, in &lt;module&gt;
    print(r1.hostname)
<span class="hl">AttributeError: 'Device' object has no attribute 'hostname'</span>
AUTO01$ python3 c2c.py
Traceback (most recent call last):
  File "c2c.py", line 5, in &lt;module&gt;
    r1 = Device("PUN-CORE-R1", "core", "10.99.0.1")
<span class="hl">TypeError: Device.__init__() missing 1 required positional argument: 'site'</span></pre>
<p>Pehla aisa attribute maangta hai jo object ke paas kabhi tha hi nahi (yahan <code>__init__</code> ne sirf <code>name</code> aur <code>ip</code> rakhe). Doosre mein <code>site</code> ki value dena bhool gaye. Dono messages exact cheez ka naam batate hain, isliye aakhri line pehle padho.</p>

<div class="warn"><p><b>Common mistakes.</b> <code>self.name = name</code> mein <code>self.</code> bhool jana: tab value bas ek local variable hai jo fek di jaati hai aur object ko attribute milta hi nahi. Likhte aur padhte waqt attribute ki spelling alag karna. Arguments galat order mein dena: class ko pata nahi ki "core" role ke liye tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aap <code>__init__(self, name)</code> likhte ho par <code>Device("R1")</code> call karte ho: aap sirf ek argument dete ho. <code>self</code> Python deta hai, isliye error message use pehla parameter ginta hai, aisi cheez nahi jo aap bhoole.</p></div>

<div class="scn"><h4>Bina naam ka router</h4><p>Ek report mein saare routers ke naam the par ek ke liye <code>None</code> print hua. Engineer ne <code>__init__</code> dekha to us field ke liye <code>self.name = name</code> ki jagah <code>name = name</code> likha tha, isliye constructor ke ant mein value fek di gayi. <code>obj.__dict__</code> print karne par missing key turant dikh gayi.</p><p><b>Lesson:</b> attribute missing ho to <code>__dict__</code> aur <code>self.</code> prefixes dekho.</p></div>

<div class="iv"><p class="q">"__init__ kya karta hai aur self kya hai?"</p><p><code>__init__</code> constructor hai jo Python object banate hi chalata hai. <code>self</code> woh naya object hai, jo pehle parameter ke roop mein apne aap pass hota hai; <code>self.attr</code> mein assign karne se object ko apna data milta hai. Har object ke apne attributes hote hain, jabki class-level attributes shared defaults hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>class Device:</code> form define karta hai; <code>Device(...)</code> object banata hai.</li>
<li><code>__init__(self, ...)</code> apne aap chalta hai aur <code>self.name = name</code> se values rakhta hai.</li>
<li>Attribute dot se padho; <code>obj.__dict__</code> sab dikhata hai.</li>
<li>Class attributes shared defaults hain; object par set karne se private copy banti hai.</li>
<li><code>__str__</code> ke bina print class ka naam aur memory address dikhata hai.</li>
</ul></div>
`}};export{e as default};