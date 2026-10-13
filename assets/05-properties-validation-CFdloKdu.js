var e={id:`properties-validation`,h:{en:`Properties and validation: computed values and guarded attributes (Lab 1 task 4)`,hi:`Properties aur validation: computed values aur guarded attributes (Lab 1 task 4)`},body:{en:`
<p><b>The idea of this chapter:</b> some facts about a device are not stored, they are worked out from other facts ("is this a core router?"). And some facts must never be allowed to take a silly value (VLAN 5000, IP 10.0.0.300). A <b>property</b> handles both, and the user of your class still writes a plain <code>obj.attribute</code>.</p>

<h3>Analogy: the calculated box on a form</h3>
<p>On a tax form, "total" is not typed by you; it is calculated from the other boxes. A property is that calculated box. You read it like an attribute, but a small function produces the answer each time.</p>

<h3>A read-only computed property</h3>
<p>Put <code>@property</code> on a method and you can read it without brackets. The line starting with <code>@</code> is a <b>decorator</b>: it wraps the method that follows.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

    @property
    def is_core(self):
        return self.role == "core"

    @property
    def hostname(self):
        return self.name.lower()


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1.is_core, r2.is_core)
print(r1.hostname)
print([d.name for d in (r1, r2) if d.is_core])
try:
    r1.is_core = False
except AttributeError as e:
    print("AttributeError:", e)
print(r1.is_core())</pre>
<pre class="out">AUTO01$ python3 c5a.py
True False
pun-core-r1
['PUN-CORE-R1']
AttributeError: property 'is_core' of 'Device' object has no setter
Traceback (most recent call last):
  File "c5a.py", line 26, in &lt;module&gt;
    print(r1.is_core())
<span class="hl">TypeError: 'bool' object is not callable</span></pre>
<p>Read the results. <code>r1.is_core</code> runs the method and gives <code>True</code>; no brackets are needed because Python treats it as an attribute. Because <code>is_core</code> is computed from <code>role</code>, it can never get out of step: change the role and the answer changes with it. A property without a setter is read-only, so assigning to it raises <code>AttributeError</code>. The last line is the classic slip: <code>r1.is_core</code> is already the answer (<code>True</code>), and brackets try to call a <code>bool</code>.</p>

<h3>Lab 1, task 4: add is_core and use it</h3>
<p>Append the property to the class and one more line to <code>main.py</code>:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    @property
    def is_core(self):
        return self.role == "core"
EOF
cat &gt;&gt; main.py &lt;&lt;'EOF'
print([d.name for d in devices if d.is_core])
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3')]
<span class="hl">['PUN-CORE-R1']</span></pre>
<p>The answer is a one-item list, because only one row in <code>inventory.csv</code> has the role <code>core</code>. Notice how readable the filter is: <code>if d.is_core</code>. The definition of "core" lives in one method.</p>

<h3>A guarded attribute: getter and setter</h3>
<p>To validate a value on every assignment, give the property a <b>setter</b> with <code>@name.setter</code>. By convention the real value is stored in an attribute with a leading underscore (<code>_ip</code>), and the property is the gate in front of it. The <code>ipaddress</code> module you met earlier does the checking:</p>
<pre class="code">import ipaddress


class Interface:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip

    @property
    def ip(self):
        return self._ip

    @ip.setter
    def ip(self, value):
        ipaddress.ip_address(value)
        self._ip = value


gi = Interface("Gi0/0", "10.0.0.1")
print(gi.ip)
gi.ip = "10.0.0.2"
print(gi.ip)
print(gi.__dict__)
try:
    gi.ip = "10.0.0.300"
except ValueError as e:
    print("ValueError:", e)
print(gi.ip)
try:
    Interface("Gi0/1", "not-an-ip")
except ValueError as e:
    print("ValueError:", e)</pre>
<pre class="out">AUTO01$ python3 c5b.py
10.0.0.1
10.0.0.2
{'name': 'Gi0/0', '_ip': '10.0.0.2'}
ValueError: '10.0.0.300' does not appear to be an IPv4 or IPv6 address
10.0.0.2
<span class="hl">ValueError: 'not-an-ip' does not appear to be an IPv4 or IPv6 address</span></pre>
<p>Two details matter. First, <code>__init__</code> writes <code>self.ip = ip</code>, which goes through the setter, so even the very first value is checked (the last line shows a bad IP refused at construction). Second, the bad assignment raised <code>ValueError</code> and the old value <code>10.0.0.2</code> stayed in place: a rejected change leaves the object untouched. <code>__dict__</code> shows the hidden storage name <code>_ip</code>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A setter guards the stored value">
<rect x="10" y="40" width="150" height="60" rx="10" fill="#e2e8f0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="12">gi.ip = "10.0.0.2"</text><text x="85" y="85" text-anchor="middle" class="svg-muted" font-size="10">you assign</text>
<rect x="200" y="40" width="220" height="60" rx="10" fill="#fde68a"/><text x="310" y="66" text-anchor="middle" class="svg-ink" font-size="12">@ip.setter checks value</text><text x="310" y="85" text-anchor="middle" class="svg-muted" font-size="10">ip_address(value) or ValueError</text>
<rect x="460" y="40" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="12">self._ip</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="10">stored only if valid</text>
<line x1="160" y1="70" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><line x1="420" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">bad values never reach the stored attribute</text>
</svg><p class="cap">The property is the doorman in front of _ip.</p></div>

<h3>Validating a VLAN id</h3>
<p>You can choose the exception. <code>TypeError</code> says "wrong kind of value", <code>ValueError</code> says "right kind, unacceptable value":</p>
<pre class="code">class Vlan:
    def __init__(self, vid, name):
        self.vid = vid
        self.name = name

    @property
    def vid(self):
        return self._vid

    @vid.setter
    def vid(self, value):
        if not isinstance(value, int):
            raise TypeError("VLAN id must be an integer")
        if not 1 &lt;= value &lt;= 4094:
            raise ValueError(f"VLAN id {value} out of range 1-4094")
        self._vid = value</pre>
<pre class="out">AUTO01$ python3 c5c.py
10 USERS
ValueError: VLAN id 5000 out of range 1-4094
TypeError: VLAN id must be an integer
ValueError: VLAN id 0 out of range 1-4094
20</pre>
<p>The test script tried 5000, the string <code>"10"</code> and 0, and then set a valid 20. Every script that creates a <code>Vlan</code> now gets the 802.1Q range check for free.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the same name for the property and the stored value (<code>self.ip = value</code> inside the <code>ip</code> setter): this loops forever. Always store in <code>self._ip</code>. Calling a property with brackets. Defining a setter before the getter. Adding a property for a trivial attribute that needs no rule: use a plain attribute until you need the guard.</p></div>
<div class="exam"><p><b>Exam trap.</b> A property with only <code>@property</code> and no <code>@name.setter</code> is read-only. Assigning to it raises <code>AttributeError</code>, not <code>TypeError</code>.</p></div>

<div class="scn"><h4>VLAN 5000 in the inventory</h4><p>A nightly job built <code>Vlan</code> objects from a spreadsheet. Someone typed 5000 for a guest VLAN, and the job used to render it straight into a config that the switch rejected at 02:00. After a setter with the 1-4094 check was added, the job failed in the first minute with a clear <code>ValueError: VLAN id 5000 out of range 1-4094</code>, before any device was touched.</p><p><b>Lesson:</b> validate at the door so bad data never reaches a device.</p></div>

<div class="iv"><p class="q">"When would you use @property?"</p><p>For a value that is derived from other attributes (like <code>is_core</code>), so it never goes stale, and for guarded attributes where I must validate on assignment, using a setter that stores into an underscore attribute. Callers keep the simple <code>obj.attr</code> syntax, and I can add the rule later without changing them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@property</code> turns a method into a read-only attribute; no brackets when reading.</li>
<li>Computed properties cannot go stale because they are calculated on every read.</li>
<li>A setter (<code>@name.setter</code>) validates assignments; store the value in <code>self._name</code>.</li>
<li><code>TypeError</code> for the wrong kind of value, <code>ValueError</code> for a bad value of the right kind.</li>
<li>Lab 1 task 4: <code>is_core</code> returns <code>True</code> for role "core", giving <code>['PUN-CORE-R1']</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> device ke kuch facts store nahi hote, doosre facts se nikaale jaate hain ("kya yeh core router hai?"). Aur kuch facts ko kabhi bewakoof value nahi leni chahiye (VLAN 5000, IP 10.0.0.300). <b>Property</b> dono sambhalti hai, aur class use karne wala ab bhi seedha <code>obj.attribute</code> likhta hai.</p>

<h3>Analogy: form ka calculated dibba</h3>
<p>Tax form mein "total" aap type nahi karte; woh baaki dibbon se calculate hota hai. Property wahi calculated dibba hai. Aap use attribute ki tarah padhte ho, par har baar ek chhota function jawab banata hai.</p>

<h3>Read-only computed property</h3>
<p>Method par <code>@property</code> lagao to aap use bracket ke bina padh sakte ho. <code>@</code> se shuru hone wali line ek <b>decorator</b> hai: woh uske neeche wale method ko wrap karta hai.</p>
<pre class="code">class Device:
    def __init__(self, name, role, ip, site):
        self.name = name
        self.role = role
        self.ip = ip
        self.site = site

    @property
    def is_core(self):
        return self.role == "core"

    @property
    def hostname(self):
        return self.name.lower()


r1 = Device("PUN-CORE-R1", "core", "10.99.0.1", "Pune")
r2 = Device("BLR-EDGE-R2", "edge", "10.99.0.2", "Bengaluru")
print(r1.is_core, r2.is_core)
print(r1.hostname)
print([d.name for d in (r1, r2) if d.is_core])
try:
    r1.is_core = False
except AttributeError as e:
    print("AttributeError:", e)
print(r1.is_core())</pre>
<pre class="out">AUTO01$ python3 c5a.py
True False
pun-core-r1
['PUN-CORE-R1']
AttributeError: property 'is_core' of 'Device' object has no setter
Traceback (most recent call last):
  File "c5a.py", line 26, in &lt;module&gt;
    print(r1.is_core())
<span class="hl">TypeError: 'bool' object is not callable</span></pre>
<p>Results padho. <code>r1.is_core</code> method chalata hai aur <code>True</code> deta hai; bracket ki zaroorat nahi kyunki Python ise attribute maanta hai. <code>is_core</code> <code>role</code> se compute hota hai, isliye kabhi out of step nahi hota: role badlo to jawab saath badal jaata hai. Setter ke bina property read-only hai, isliye usme assign karne par <code>AttributeError</code> aata hai. Aakhri line classic slip hai: <code>r1.is_core</code> khud jawab (<code>True</code>) hai, aur bracket <code>bool</code> ko call karne ki koshish karte hain.</p>

<h3>Lab 1, task 4: is_core jodo aur use karo</h3>
<p>Property ko class mein append karo aur <code>main.py</code> mein ek line aur jodo:</p>
<pre class="code">cat &gt;&gt; netmodel.py &lt;&lt;'EOF'

    @property
    def is_core(self):
        return self.role == "core"
EOF
cat &gt;&gt; main.py &lt;&lt;'EOF'
print([d.name for d in devices if d.is_core])
EOF
python3 main.py</pre>
<pre class="out">AUTO01$ python3 main.py
PUN-CORE-R1 (core) 10.99.0.1
BLR-EDGE-R2 (edge) 10.99.0.2
HYD-EDGE-R3 (edge) 10.99.0.3
[Device('PUN-CORE-R1'), Device('BLR-EDGE-R2'), Device('HYD-EDGE-R3')]
<span class="hl">['PUN-CORE-R1']</span></pre>
<p>Jawab ek item ki list hai, kyunki <code>inventory.csv</code> ki sirf ek row ka role <code>core</code> hai. Dekho filter kitna padhne layak hai: <code>if d.is_core</code>. "Core" ki definition ek method mein rehti hai.</p>

<h3>Guarded attribute: getter aur setter</h3>
<p>Har assignment par value validate karne ke liye property ko <b>setter</b> do, <code>@name.setter</code> se. Convention hai ki asli value underscore wale attribute (<code>_ip</code>) mein rakhte hain, aur property uske aage ka gate hai. Checking aapka jaana-pehchana <code>ipaddress</code> module karta hai:</p>
<pre class="code">import ipaddress


class Interface:
    def __init__(self, name, ip):
        self.name = name
        self.ip = ip

    @property
    def ip(self):
        return self._ip

    @ip.setter
    def ip(self, value):
        ipaddress.ip_address(value)
        self._ip = value


gi = Interface("Gi0/0", "10.0.0.1")
print(gi.ip)
gi.ip = "10.0.0.2"
print(gi.ip)
print(gi.__dict__)
try:
    gi.ip = "10.0.0.300"
except ValueError as e:
    print("ValueError:", e)
print(gi.ip)
try:
    Interface("Gi0/1", "not-an-ip")
except ValueError as e:
    print("ValueError:", e)</pre>
<pre class="out">AUTO01$ python3 c5b.py
10.0.0.1
10.0.0.2
{'name': 'Gi0/0', '_ip': '10.0.0.2'}
ValueError: '10.0.0.300' does not appear to be an IPv4 or IPv6 address
10.0.0.2
ValueError: 'not-an-ip' does not appear to be an IPv4 or IPv6 address</pre>
<p>Do details important hain. Pehla, <code>__init__</code> <code>self.ip = ip</code> likhta hai, jo setter se guzarta hai, isliye pehli value bhi check hoti hai (aakhri line construction par bad IP refuse hota dikhati hai). Doosra, bad assignment ne <code>ValueError</code> uthaya aur purani value <code>10.0.0.2</code> jagah par rahi: rejected change object ko nahi chhuta. <code>__dict__</code> chhipa hua storage naam <code>_ip</code> dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Setter stored value ki hifazat karta hai">
<rect x="10" y="40" width="150" height="60" rx="10" fill="#e2e8f0"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="12">gi.ip = "10.0.0.2"</text><text x="85" y="85" text-anchor="middle" class="svg-muted" font-size="10">aap assign karte ho</text>
<rect x="200" y="40" width="220" height="60" rx="10" fill="#fde68a"/><text x="310" y="66" text-anchor="middle" class="svg-ink" font-size="12">@ip.setter value check karta hai</text><text x="310" y="85" text-anchor="middle" class="svg-muted" font-size="10">ip_address(value) ya ValueError</text>
<rect x="460" y="40" width="170" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="66" text-anchor="middle" class="svg-ink" font-size="12">self._ip</text><text x="545" y="85" text-anchor="middle" class="svg-muted" font-size="10">valid ho tabhi store</text>
<line x1="160" y1="70" x2="200" y2="70" stroke="#64748b" stroke-width="2"/><line x1="420" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">bad values stored attribute tak kabhi nahi pahunchte</text>
</svg><p class="cap">Property _ip ke aage khada darbaan hai.</p></div>

<h3>VLAN id validate karna</h3>
<p>Exception aap chun sakte ho. <code>TypeError</code> kehta hai "galat kism ki value", <code>ValueError</code> kehta hai "sahi kism, par unacceptable value":</p>
<pre class="code">class Vlan:
    def __init__(self, vid, name):
        self.vid = vid
        self.name = name

    @property
    def vid(self):
        return self._vid

    @vid.setter
    def vid(self, value):
        if not isinstance(value, int):
            raise TypeError("VLAN id must be an integer")
        if not 1 &lt;= value &lt;= 4094:
            raise ValueError(f"VLAN id {value} out of range 1-4094")
        self._vid = value</pre>
<pre class="out">AUTO01$ python3 c5c.py
10 USERS
ValueError: VLAN id 5000 out of range 1-4094
TypeError: VLAN id must be an integer
ValueError: VLAN id 0 out of range 1-4094
20</pre>
<p>Test script ne 5000, string <code>"10"</code> aur 0 try kiye, phir valid 20 set kiya. Ab <code>Vlan</code> banane wali har script ko 802.1Q range check muft mein milta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Property aur stored value ke liye same naam use karna (<code>ip</code> setter ke andar <code>self.ip = value</code>): yeh hamesha ke liye loop mein fansa deta hai. Hamesha <code>self._ip</code> mein store karo. Property ko bracket ke saath call karna. Getter se pehle setter define karna. Aise attribute par property lagana jise kisi rule ki zaroorat nahi: guard chahiye hone tak plain attribute rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sirf <code>@property</code> wali aur <code>@name.setter</code> ke bina property read-only hoti hai. Usme assign karne par <code>AttributeError</code> aata hai, <code>TypeError</code> nahi.</p></div>

<div class="scn"><h4>Inventory mein VLAN 5000</h4><p>Ek nightly job spreadsheet se <code>Vlan</code> objects banata tha. Kisi ne guest VLAN ke liye 5000 type kar diya, aur job use seedha config mein render kar deta tha jise switch ne raat 02:00 baje reject kar diya. 1-4094 check wala setter jodne ke baad job pehle minute mein hi saaf <code>ValueError: VLAN id 5000 out of range 1-4094</code> se fail hui, kisi device ko chhuye bina.</p><p><b>Lesson:</b> darwaze par validate karo taaki bad data device tak na pahunche.</p></div>

<div class="iv"><p class="q">"@property kab use karte ho?"</p><p>Aisi value ke liye jo doosre attributes se nikalti hai (jaise <code>is_core</code>), taaki woh kabhi stale na ho, aur guarded attributes ke liye jahan assignment par validate karna ho, underscore attribute mein store karne wale setter ke saath. Callers simple <code>obj.attr</code> syntax rakhte hain, aur main baad mein rule jod sakta hoon bina unhe badle.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@property</code> method ko read-only attribute banata hai; padhte waqt bracket nahi.</li>
<li>Computed properties stale nahi hoti kyunki har read par calculate hoti hain.</li>
<li>Setter (<code>@name.setter</code>) assignments validate karta hai; value <code>self._name</code> mein store karo.</li>
<li>Galat kism ki value ke liye <code>TypeError</code>, sahi kism ki bad value ke liye <code>ValueError</code>.</li>
<li>Lab 1 task 4: role "core" ke liye <code>is_core</code> <code>True</code> deta hai, jisse <code>['PUN-CORE-R1']</code> milta hai.</li>
</ul></div>
`}};export{e as default};