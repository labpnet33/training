var e={id:`classes`,h:{en:`Classes and objects from zero: the Device class`,hi:`Classes aur objects zero se: Device class`},body:{en:`
<p>Functions group <i>actions</i>. But real network automation also deals with <i>things</i>: a switch with a name, a management address and a list of VLANs. Keeping that data in loose variables ("sw1_name", "sw1_ip", "sw2_name", "sw2_ip") gets messy fast. A <b>class</b> lets you bundle the data and the actions on it in one package. This chapter assumes you have never seen object-oriented programming.</p>

<h3>Analogy: a blueprint and the houses built from it</h3>
<p>An architect draws one <b>blueprint</b> for a flat: it says every flat has a door number, a number of rooms and can be locked and unlocked. From that blueprint the builder constructs fifty flats. Each flat is a separate thing with its own door number, but all follow the same plan. In Python the blueprint is a <b>class</b>; each flat built from it is an <b>object</b> (also called an <b>instance</b>). The data a flat holds (door number) are its <b>attributes</b>; the things it can do (lock) are its <b>methods</b>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Class and objects">
<rect x="10" y="20" width="220" height="180" rx="10" fill="#ddd6fe"/>
<text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">class Device</text>
<text x="25" y="75" class="svg-ink" font-size="12">attributes: name, mgmt_ip, vlans</text>
<text x="25" y="100" class="svg-ink" font-size="12">methods:</text>
<text x="40" y="120" class="svg-ink" font-size="12">add_vlan(vid)</text>
<text x="40" y="140" class="svg-ink" font-size="12">config()</text>
<text x="120" y="185" text-anchor="middle" class="svg-muted" font-size="12">the blueprint</text>
<rect x="320" y="10" width="300" height="90" rx="10" fill="#bae6fd"/>
<text x="470" y="32" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">object sw1</text>
<text x="335" y="55" class="svg-ink" font-size="12">name = "SW1"   mgmt_ip = "192.0.2.11"</text>
<text x="335" y="78" class="svg-ink" font-size="12">vlans = [10, 20]</text>
<rect x="320" y="120" width="300" height="90" rx="10" fill="#bbf7d0"/>
<text x="470" y="142" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">object sw2</text>
<text x="335" y="165" class="svg-ink" font-size="12">name = "SW2"   mgmt_ip = "192.0.2.12"</text>
<text x="335" y="188" class="svg-ink" font-size="12">vlans = [30]</text>
<line x1="230" y1="70" x2="318" y2="55" stroke="#64748b" stroke-width="2"/><line x1="230" y1="140" x2="318" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One class, many objects. Each object has its own data but the same methods.</p></div>

<h3>Your first class, step by step</h3>
<pre class="code">class Device:                                   <span class="c"># 1. the blueprint; class names start with a capital</span>
    def __init__(self, name, mgmt_ip):          <span class="c"># 2. runs automatically when you create an object</span>
        self.name = name                        <span class="c"># 3. attributes: data stored ON the object</span>
        self.mgmt_ip = mgmt_ip
        self.vlans = []

    def add_vlan(self, vid):                    <span class="c"># 4. a method: a function that belongs to the class</span>
        if vid not in self.vlans:
            self.vlans.append(vid)

    def config(self):
        lines = [f"hostname {self.name}"]
        for vid in self.vlans:
            lines.append(f"vlan {vid}")
        return lines

sw1 = Device("SW1", "192.0.2.11")               <span class="c"># 5. create (instantiate) an object</span>
sw2 = Device("SW2", "192.0.2.12")
sw1.add_vlan(10)
sw1.add_vlan(20)
sw2.add_vlan(30)
print(sw1.config())
print(sw2.config())
print(sw1.name, sw1.mgmt_ip)</pre>
<pre class="out"><span class="hl">['hostname SW1', 'vlan 10', 'vlan 20']</span>
['hostname SW2', 'vlan 30']
SW1 192.0.2.11</pre>
<p>Read the numbered comments in order:</p>
<ol>
<li><code>class Device:</code> defines the blueprint. Nothing exists yet, just the plan.</li>
<li><code>__init__</code> is the <b>constructor</b>. Python calls it when you write <code>Device("SW1", "192.0.2.11")</code>. It sets up the new object.</li>
<li><code>self</code> means "this particular object". <code>self.name = name</code> stores the value on <i>this</i> switch, so <code>sw1</code> and <code>sw2</code> keep separate names.</li>
<li>Methods look like functions but their first parameter is always <code>self</code>. You do not pass it yourself: <code>sw1.add_vlan(10)</code> passes <code>sw1</code> as <code>self</code> automatically.</li>
<li>Calling the class like a function creates an object. Each object gets its own <code>vlans</code> list.</li>
</ol>
<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>self</code> in the method definition (<code>TypeError: add_vlan() takes 1 positional argument but 2 were given</code>). Writing <code>name = name</code> instead of <code>self.name = name</code> so the data is lost when the constructor ends. Putting a list at class level (<code>vlans = []</code> directly under <code>class</code>), which makes <i>all</i> objects share one list.</p></div>

<h3>Inheritance: a specialised blueprint</h3>
<p>A router is a device too, but it has routes. Instead of copying the Device code, write a class that <b>inherits</b> from it. It gets everything for free and adds or changes what it needs.</p>
<pre class="code">class Router(Device):                           <span class="c"># Router IS-A Device</span>
    def __init__(self, name, mgmt_ip):
        super().__init__(name, mgmt_ip)         <span class="c"># reuse the parent set-up</span>
        self.routes = []

    def config(self):                           <span class="c"># override: same name, new behaviour</span>
        lines = super().config()
        for net in self.routes:
            lines.append(f"ip route {net}")
        return lines

r1 = Router("R1", "192.0.2.1")
r1.routes.append("198.51.100.0 255.255.255.0 192.0.2.254")
print(r1.config())</pre>
<pre class="out"><span class="hl">['hostname R1', 'ip route 198.51.100.0 255.255.255.0 192.0.2.254']</span></pre>

<h3>Why classes help (the blueprint answer)</h3>
<ul>
<li><b>Data and behaviour together.</b> The VLAN list and the code that changes it live in one place, so nobody edits the list in a surprising way.</li>
<li><b>Reuse through inheritance.</b> Switch, Router and Firewall can share what a Device has in common.</li>
<li><b>Models the real world.</b> Code that mirrors the network (devices, interfaces, links) is easier to discuss with colleagues.</li>
<li><b>Easier change.</b> Add a new attribute to the class and every object gets it.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> Know the vocabulary: class (blueprint), object or instance (a thing built from it), attribute (data), method (function inside a class), constructor (<code>__init__</code>), inheritance (a child class reusing a parent class). A common distractor says "a class is the same as a module". A module is a file; a class is a blueprint, and a module can contain many classes.</p></div>

<div class="scn"><h4>Fifty switches, one class</h4><p>An engineer kept parallel lists: <code>names</code>, <code>ips</code> and <code>vlan_lists</code>. After a sort, the names list was reordered but the IPs were not, and VLAN 30 was pushed to the wrong switch. Rewriting the script with a <code>Device</code> class meant name, IP and VLANs travelled together as one object, and sorting a list of devices could no longer separate them.</p><p><b>Lesson:</b> bundle data that belongs together.</p></div>
<div class="iv"><p class="q">"What is a class and how is it different from an object?"</p><p>A class is the blueprint: it defines attributes and methods. An object (instance) is a concrete thing created from that blueprint, with its own attribute values. Use the Device example: <code>Device</code> is the class, <code>sw1</code> is an object. Add that <code>__init__</code> sets the object up and that inheritance lets <code>Router</code> reuse <code>Device</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A class is a blueprint; an object (instance) is built from it.</li>
<li>Attributes hold data (<code>self.name</code>); methods are functions inside the class.</li>
<li><code>__init__</code> is the constructor and <code>self</code> means "this object".</li>
<li>Inheritance lets a child class (<code>Router</code>) reuse and override a parent (<code>Device</code>).</li>
<li>Classes keep data and the code that uses it together, which makes code easier to maintain.</li>
</ul></div>
`,hi:`
<p>Functions <i>actions</i> ko group karte hain. Par asli network automation <i>cheezon</i> se bhi deal karta hai: ek switch jiska naam hai, management address hai aur VLANs ki list hai. Us data ko alag alag variables mein ("sw1_name", "sw1_ip", "sw2_name", "sw2_ip") rakhna jaldi ganda ho jaata hai. <b>Class</b> aapko data aur us par hone wale actions ko ek package mein bundle karne deti hai. Yeh chapter maanta hai ki aapne object-oriented programming kabhi nahi dekhi.</p>

<h3>Analogy: blueprint aur usse bane ghar</h3>
<p>Architect ek flat ka ek <b>blueprint</b> banata hai: usme likha hai har flat ka door number hota hai, kuch rooms hote hain aur use lock aur unlock kiya ja sakta hai. Us blueprint se builder pachaas flats banata hai. Har flat apna alag cheez hai apne door number ke saath, par sab ek hi plan follow karte hain. Python mein blueprint <b>class</b> hai; usse bana har flat ek <b>object</b> (ya <b>instance</b>) hai. Flat jo data rakhta hai (door number) uske <b>attributes</b> hain; jo kaam woh kar sakta hai (lock) uske <b>methods</b> hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Class aur objects">
<rect x="10" y="20" width="220" height="180" rx="10" fill="#ddd6fe"/>
<text x="120" y="45" text-anchor="middle" class="svg-ink" font-size="14" font-weight="bold">class Device</text>
<text x="25" y="75" class="svg-ink" font-size="12">attributes: name, mgmt_ip, vlans</text>
<text x="25" y="100" class="svg-ink" font-size="12">methods:</text>
<text x="40" y="120" class="svg-ink" font-size="12">add_vlan(vid)</text>
<text x="40" y="140" class="svg-ink" font-size="12">config()</text>
<text x="120" y="185" text-anchor="middle" class="svg-muted" font-size="12">blueprint</text>
<rect x="320" y="10" width="300" height="90" rx="10" fill="#bae6fd"/>
<text x="470" y="32" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">object sw1</text>
<text x="335" y="55" class="svg-ink" font-size="12">name = "SW1"   mgmt_ip = "192.0.2.11"</text>
<text x="335" y="78" class="svg-ink" font-size="12">vlans = [10, 20]</text>
<rect x="320" y="120" width="300" height="90" rx="10" fill="#bbf7d0"/>
<text x="470" y="142" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">object sw2</text>
<text x="335" y="165" class="svg-ink" font-size="12">name = "SW2"   mgmt_ip = "192.0.2.12"</text>
<text x="335" y="188" class="svg-ink" font-size="12">vlans = [30]</text>
<line x1="230" y1="70" x2="318" y2="55" stroke="#64748b" stroke-width="2"/><line x1="230" y1="140" x2="318" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek class, kai objects. Har object ka apna data hota hai par methods wahi.</p></div>

<h3>Aapki pehli class, step by step</h3>
<pre class="code">class Device:                                   <span class="c"># 1. blueprint; class ke naam capital se shuru</span>
    def __init__(self, name, mgmt_ip):          <span class="c"># 2. object banate hi apne aap chalta hai</span>
        self.name = name                        <span class="c"># 3. attributes: data object PAR store</span>
        self.mgmt_ip = mgmt_ip
        self.vlans = []

    def add_vlan(self, vid):                    <span class="c"># 4. method: class ka function</span>
        if vid not in self.vlans:
            self.vlans.append(vid)

    def config(self):
        lines = [f"hostname {self.name}"]
        for vid in self.vlans:
            lines.append(f"vlan {vid}")
        return lines

sw1 = Device("SW1", "192.0.2.11")               <span class="c"># 5. object banao (instantiate)</span>
sw2 = Device("SW2", "192.0.2.12")
sw1.add_vlan(10)
sw1.add_vlan(20)
sw2.add_vlan(30)
print(sw1.config())
print(sw2.config())
print(sw1.name, sw1.mgmt_ip)</pre>
<pre class="out"><span class="hl">['hostname SW1', 'vlan 10', 'vlan 20']</span>
['hostname SW2', 'vlan 30']
SW1 192.0.2.11</pre>
<p>Numbered comments ko order mein padho:</p>
<ol>
<li><code>class Device:</code> blueprint define karta hai. Abhi kuch exist nahi karta, sirf plan hai.</li>
<li><code>__init__</code> <b>constructor</b> hai. Jab aap <code>Device("SW1", "192.0.2.11")</code> likhte ho Python ise call karta hai. Yeh naye object ko set up karta hai.</li>
<li><code>self</code> ka matlab "yeh khaas object". <code>self.name = name</code> value <i>is</i> switch par store karta hai, isliye <code>sw1</code> aur <code>sw2</code> ke naam alag rehte hain.</li>
<li>Methods functions jaise dikhte hain par unka pehla parameter hamesha <code>self</code> hota hai. Aap use khud pass nahi karte: <code>sw1.add_vlan(10)</code> khud <code>sw1</code> ko <code>self</code> bana deta hai.</li>
<li>Class ko function ki tarah call karne se object banta hai. Har object ki apni <code>vlans</code> list hoti hai.</li>
</ol>
<div class="warn"><p><b>Aam galtiyan.</b> Method definition mein <code>self</code> bhool jaana (<code>TypeError: add_vlan() takes 1 positional argument but 2 were given</code>). <code>self.name = name</code> ki jagah <code>name = name</code> likhna, jisse constructor khatam hote hi data kho jaata hai. Class level par list rakhna (<code>class</code> ke theek neeche <code>vlans = []</code>), jisse <i>saare</i> objects ek hi list share karte hain.</p></div>

<h3>Inheritance: specialised blueprint</h3>
<p>Router bhi ek device hai, par uske paas routes hote hain. Device ka code copy karne ki jagah aisi class likho jo usse <b>inherit</b> kare. Use sab kuch free mein milta hai aur jo chahiye woh jodta ya badalta hai.</p>
<pre class="code">class Router(Device):                           <span class="c"># Router IS-A Device</span>
    def __init__(self, name, mgmt_ip):
        super().__init__(name, mgmt_ip)         <span class="c"># parent ka set-up reuse karo</span>
        self.routes = []

    def config(self):                           <span class="c"># override: wahi naam, naya behaviour</span>
        lines = super().config()
        for net in self.routes:
            lines.append(f"ip route {net}")
        return lines

r1 = Router("R1", "192.0.2.1")
r1.routes.append("198.51.100.0 255.255.255.0 192.0.2.254")
print(r1.config())</pre>
<pre class="out"><span class="hl">['hostname R1', 'ip route 198.51.100.0 255.255.255.0 192.0.2.254']</span></pre>

<h3>Classes kyun madad karti hain (blueprint ka jawab)</h3>
<ul>
<li><b>Data aur behaviour saath.</b> VLAN list aur use badalne wala code ek jagah rehta hai, isliye koi list ko chaunkane wale tareeke se edit nahi karta.</li>
<li><b>Inheritance se reuse.</b> Switch, Router aur Firewall woh share kar sakte hain jo Device mein common hai.</li>
<li><b>Asli duniya ka model.</b> Jo code network ko mirror kare (devices, interfaces, links) use colleagues se discuss karna aasaan hai.</li>
<li><b>Change aasaan.</b> Class mein ek naya attribute jodo aur har object ko mil jaata hai.</li>
</ul>
<div class="exam"><p><b>Exam trap.</b> Vocabulary jaano: class (blueprint), object ya instance (usse bana cheez), attribute (data), method (class ke andar function), constructor (<code>__init__</code>), inheritance (child class parent class ko reuse karti hai). Ek aam distractor kehta hai "class aur module same hain". Module ek file hai; class ek blueprint hai, aur ek module mein kai classes ho sakti hain.</p></div>

<div class="scn"><h4>Pachaas switches, ek class</h4><p>Ek engineer ne parallel lists rakhi thi: <code>names</code>, <code>ips</code> aur <code>vlan_lists</code>. Sort ke baad names list reorder hui par IPs nahi, aur VLAN 30 galat switch par push ho gaya. Script ko <code>Device</code> class se dobara likhne ka matlab tha ki naam, IP aur VLANs ek object ke roop mein saath chalte hain, aur devices ki list sort karne se woh alag nahi ho sakte.</p><p><b>Lesson:</b> jo data saath belong karta hai use bundle karo.</p></div>
<div class="iv"><p class="q">"Class kya hai aur object se kaise alag hai?"</p><p>Class blueprint hai: woh attributes aur methods define karti hai. Object (instance) us blueprint se bana ek concrete cheez hai, jiske apne attribute values hote hain. Device example use karo: <code>Device</code> class hai, <code>sw1</code> object hai. Jodo ki <code>__init__</code> object ko set up karta hai aur inheritance <code>Router</code> ko <code>Device</code> reuse karne deti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Class blueprint hai; object (instance) usse banta hai.</li>
<li>Attributes data rakhte hain (<code>self.name</code>); methods class ke andar functions hain.</li>
<li><code>__init__</code> constructor hai aur <code>self</code> ka matlab "yeh object".</li>
<li>Inheritance child class (<code>Router</code>) ko parent (<code>Device</code>) reuse aur override karne deti hai.</li>
<li>Classes data aur use karne wala code saath rakhti hain, jisse code maintain karna aasaan hota hai.</li>
</ul></div>
`}};export{e as default};