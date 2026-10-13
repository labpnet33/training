var e={id:`lists-of-objects-json`,h:{en:`Lists of objects: build, sort, filter, group and save as JSON`,hi:`Objects ki lists: banao, sort, filter, group aur JSON mein save karo`},body:{en:`
<p><b>The idea of this chapter:</b> in real work you rarely have one device; you have an inventory of hundreds. This chapter shows the everyday moves on a list of objects: load them from a CSV, sort, filter, group, count, wrap them in an inventory class, and write them out as JSON.</p>

<h3>Analogy: the filing cabinet</h3>
<p>One record card is a note. A drawer of cards is a filing cabinet: you want to pull out all the cards for Pune, arrange them by name, count how many are edge routers, or photocopy the lot to send to another team. Each of those is a one-line operation on a list of objects.</p>

<h3>Build objects from CSV rows</h3>
<p><code>csv.DictReader</code> gives each row as a dictionary with the header names as keys. If those names are exactly the dataclass field names, <code>Device(**row)</code> turns the row into an object: the two stars unpack the dictionary into keyword arguments.</p>
<pre class="code">import csv
import json
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict
from operator import attrgetter


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    @property
    def is_core(self):
        return self.role == "core"


with open("inventory.csv") as f:
    devices = [Device(**row) for row in csv.DictReader(f)]

print(len(devices), devices[0])
for d in sorted(devices, key=attrgetter("site")):
    print(d.site, d.name)
print([d.name for d in devices if d.role == "edge"])

by_role = defaultdict(list)
for d in devices:
    by_role[d.role].append(d.name)
print(dict(by_role))
print(Counter(d.role for d in devices))

payload = [asdict(d) for d in devices]
print(json.dumps(payload[0]))
back = [Device(**item) for item in json.loads(json.dumps(payload))]
print(back == devices)
with open("inventory.json", "w") as out:
    json.dump(payload, out, indent=2)</pre>
<pre class="out">AUTO01$ python3 c9a.py
3 Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
Bengaluru BLR-EDGE-R2
Hyderabad HYD-EDGE-R3
Pune PUN-CORE-R1
['BLR-EDGE-R2', 'HYD-EDGE-R3']
{'core': ['PUN-CORE-R1'], 'edge': ['BLR-EDGE-R2', 'HYD-EDGE-R3']}
Counter({'edge': 2, 'core': 1})
{"name": "PUN-CORE-R1", "role": "core", "ip": "10.99.0.1", "site": "Pune"}
True
AUTO01$ head -4 inventory.json
[
  {
    "name": "PUN-CORE-R1",
    "role": "core",</pre>
<p>Go through it. <b>Sort:</b> <code>sorted(devices, key=attrgetter("site"))</code> orders by the <code>site</code> attribute; <code>attrgetter</code> is a tidy replacement for <code>lambda d: d.site</code> and can take several names, such as <code>attrgetter("site", "name")</code>. <b>Filter:</b> a list comprehension with an <code>if</code> picks the edge routers. <b>Group:</b> <code>defaultdict(list)</code> creates an empty list the first time a role is seen, so <code>by_role[d.role].append(...)</code> just works. <b>Count:</b> <code>Counter</code> counts how many of each role. <b>Save:</b> <code>asdict</code> turns each object into a dictionary, <code>json.dumps</code> turns that into text, and <code>json.dump(..., indent=2)</code> writes a human-readable file. <b>Load:</b> <code>json.loads</code> and <code>Device(**item)</code> rebuild equal objects; the final <code>True</code> proves that the round trip lost nothing, thanks to the dataclass <code>==</code>.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="CSV to objects to JSON and back">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="12">inventory.csv</text><text x="65" y="85" text-anchor="middle" class="svg-muted" font-size="10">DictReader rows</text>
<rect x="165" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="230" y="66" text-anchor="middle" class="svg-ink" font-size="12">Device objects</text><text x="230" y="85" text-anchor="middle" class="svg-muted" font-size="10">Device(**row)</text>
<rect x="340" y="40" width="120" height="60" rx="10" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">dicts</text><text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="10">asdict(d)</text>
<rect x="505" y="40" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="12">inventory.json</text><text x="567" y="85" text-anchor="middle" class="svg-muted" font-size="10">json.dump</text>
<line x1="120" y1="70" x2="165" y2="70" stroke="#64748b" stroke-width="2"/><line x1="295" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">json.load and Device(**item) bring it back</text>
</svg><p class="cap">The round trip: file, objects, dictionaries, file.</p></div>

<h3>A constructor from a row: @classmethod</h3>
<p>When the file's columns need tidying (extra spaces, lower case), put the conversion inside the class as a <b>class method</b>. It receives the class itself as <code>cls</code> and returns a new object. A <code>@staticmethod</code> is a plain function that lives in the class for tidiness and needs neither <code>cls</code> nor <code>self</code>.</p>
<pre class="code">    @classmethod
    def from_row(cls, row):
        return cls(row["name"].strip().upper(), row["role"], row["ip"], row["site"])

    @staticmethod
    def valid_role(role):
        return role in ("core", "edge", "access")</pre>
<pre class="out">AUTO01$ python3 t3.py
Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2', site='Bengaluru')
True False</pre>
<p>That output is <code>devs[1]</code> built with <code>Device.from_row(r)</code>, then the static check for <code>"edge"</code> and <code>"spine"</code>.</p>

<h3>Wrapping the list in an Inventory class</h3>
<p>Once the same list-handling code appears in three scripts, give the list a home. Special methods let your class behave like a collection: <code>__len__</code> for <code>len()</code>, <code>__iter__</code> for <code>for</code> loops, <code>__getitem__</code> for <code>inv[0]</code>.</p>
<pre class="code">class Inventory:
    def __init__(self, devices=None):
        self._devices = list(devices or [])

    def __len__(self):
        return len(self._devices)

    def __iter__(self):
        return iter(self._devices)

    def __getitem__(self, i):
        return self._devices[i]

    def add(self, device):
        self._devices.append(device)

    def by_role(self, role):
        return [d for d in self._devices if d.role == role]

    def find(self, name):
        for d in self._devices:
            if d.name == name:
                return d
        raise KeyError(name)</pre>
<pre class="out">AUTO01$ python3 t7.py
3 PUN-CORE-R1
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
[Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2'), Device(name='HYD-EDGE-R3', role='edge', ip='10.99.0.3')]
name         role    ip
-----------  ------  ---------
PUN-CORE-R1  core    10.99.0.1
BLR-EDGE-R2  edge    10.99.0.2
HYD-EDGE-R3  edge    10.99.0.3
KeyError: 'NOPE'</pre>
<p>The test script builds an <code>Inventory</code> of a three-field <code>Device</code>, adds one, loops over it, filters edge devices, prints a <code>tabulate</code> table and shows that <code>find("NOPE")</code> raises <code>KeyError</code>. Callers use the inventory as if it were a list, without knowing about <code>_devices</code>.</p>

<h3>Two things that go wrong</h3>
<p>Objects are not JSON by themselves. Convert with <code>asdict</code> first:</p>
<pre class="out">AUTO01$ python3 t1.py
<span class="hl">TypeError: Object of type D is not JSON serializable</span></pre>
<p>That is the result of <code>json.dumps(D("x"))</code> on a dataclass named <code>D</code>. The other classic is a row with a column your class does not know:</p>
<pre class="out">AUTO01$ python3 t4.py
<span class="hl">TypeError: Device.__init__() got an unexpected keyword argument 'extra'</span></pre>
<p>Here a row carried an extra column <code>extra</code>, and <code>Device(**row)</code> passed it on. Fix the data, or pick the columns you need: <code>Device(row["name"], row["role"], row["ip"], row["site"])</code>.</p>
<p>Finally, remember copies. Assigning <code>b = a</code> makes a second name for the same object. <code>copy.copy(a)</code> copies the object but still shares inner lists; only <code>copy.deepcopy(a)</code> gives a fully independent one. With an object holding <code>["Gi0/0"]</code>, appending <code>"Gi0/1"</code> to the original changed <code>b</code> and the shallow copy, but not the deep copy: the three results printed were <code>['Gi0/0', 'Gi0/1'] ['Gi0/0', 'Gi0/1'] ['Gi0/0']</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Sorting by a string when you mean a number (IP addresses sort as text, not numerically; use the <code>ipaddress</code> module for that). Forgetting that <code>sorted</code> returns a new list while <code>list.sort()</code> changes the original and returns <code>None</code>. Dumping objects to JSON without <code>asdict</code>. Assuming a copy is independent.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Device(**row)</code> needs the dictionary keys to match the parameter names exactly. A header called <code>hostname</code> instead of <code>name</code> gives <code>unexpected keyword argument</code> (and a missing <code>name</code>).</p></div>

<div class="scn"><h4>The inventory that went to the API team</h4><p>The automation team had to send the device list as JSON to another team's API. The first script tried <code>json.dumps(devices)</code> and failed with "not JSON serializable". The fix was one line, <code>[asdict(d) for d in devices]</code>. When the other team sent back an edited JSON file, <code>Device(**item)</code> rebuilt the objects, and comparing with <code>==</code> showed exactly which routers they had changed.</p><p><b>Lesson:</b> keep objects inside your program and dictionaries at the edges.</p></div>

<div class="iv"><p class="q">"How do you save a list of objects to JSON and load it again?"</p><p>With dataclasses I convert each object using <code>asdict</code>, write the list with <code>json.dump</code>, and on loading I rebuild with <code>Device(**item)</code>. A dataclass <code>==</code> lets me assert that the round trip is lossless. For nested objects <code>asdict</code> converts them recursively.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>Device(**row)</code> turns a CSV or JSON dictionary into an object when the keys match the fields.</li>
<li><code>sorted(..., key=attrgetter("site"))</code>, comprehensions, <code>defaultdict</code> and <code>Counter</code> cover sort, filter, group and count.</li>
<li><code>asdict</code> before <code>json.dump</code>; <code>Device(**item)</code> after <code>json.load</code>.</li>
<li>A class with <code>__len__</code>, <code>__iter__</code> and <code>__getitem__</code> behaves like a collection.</li>
<li>Use <code>deepcopy</code> for an independent copy of nested data.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> asli kaam mein aapke paas shayad hi ek device hota hai; sainkdon devices ki inventory hoti hai. Yeh chapter objects ki list par roz ke moves dikhata hai: CSV se load, sort, filter, group, count, inventory class mein lapetna, aur JSON ke roop mein likhna.</p>

<h3>Analogy: filing cabinet</h3>
<p>Ek record card ek note hai. Cards ki drawer filing cabinet hai: aap Pune ke saare cards nikalna chaahte ho, naam se arrange karna, ginna ki kitne edge routers hain, ya poori drawer ki photocopy doosri team ko bhejna. Har ek objects ki list par ek line ka operation hai.</p>

<h3>CSV rows se objects banana</h3>
<p><code>csv.DictReader</code> har row ko dictionary ki tarah deta hai, header ke naam keys hote hain. Agar woh naam dataclass ke field names ke bilkul barabar hain, to <code>Device(**row)</code> row ko object bana deta hai: do stars dictionary ko keyword arguments mein unpack karte hain.</p>
<pre class="code">import csv
import json
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict
from operator import attrgetter


@dataclass
class Device:
    name: str
    role: str
    ip: str
    site: str

    @property
    def is_core(self):
        return self.role == "core"


with open("inventory.csv") as f:
    devices = [Device(**row) for row in csv.DictReader(f)]

print(len(devices), devices[0])
for d in sorted(devices, key=attrgetter("site")):
    print(d.site, d.name)
print([d.name for d in devices if d.role == "edge"])

by_role = defaultdict(list)
for d in devices:
    by_role[d.role].append(d.name)
print(dict(by_role))
print(Counter(d.role for d in devices))

payload = [asdict(d) for d in devices]
print(json.dumps(payload[0]))
back = [Device(**item) for item in json.loads(json.dumps(payload))]
print(back == devices)
with open("inventory.json", "w") as out:
    json.dump(payload, out, indent=2)</pre>
<pre class="out">AUTO01$ python3 c9a.py
3 Device(name='PUN-CORE-R1', role='core', ip='10.99.0.1', site='Pune')
Bengaluru BLR-EDGE-R2
Hyderabad HYD-EDGE-R3
Pune PUN-CORE-R1
['BLR-EDGE-R2', 'HYD-EDGE-R3']
{'core': ['PUN-CORE-R1'], 'edge': ['BLR-EDGE-R2', 'HYD-EDGE-R3']}
Counter({'edge': 2, 'core': 1})
{"name": "PUN-CORE-R1", "role": "core", "ip": "10.99.0.1", "site": "Pune"}
True
AUTO01$ head -4 inventory.json
[
  {
    "name": "PUN-CORE-R1",
    "role": "core",</pre>
<p>Ek ek karke dekho. <b>Sort:</b> <code>sorted(devices, key=attrgetter("site"))</code> <code>site</code> attribute se order karta hai; <code>attrgetter</code>, <code>lambda d: d.site</code> ka saaf replacement hai aur kai naam le sakta hai, jaise <code>attrgetter("site", "name")</code>. <b>Filter:</b> <code>if</code> wali list comprehension edge routers chunti hai. <b>Group:</b> <code>defaultdict(list)</code> role pehli baar dikhte hi khaali list bana deta hai, isliye <code>by_role[d.role].append(...)</code> seedha chalta hai. <b>Count:</b> <code>Counter</code> har role ginta hai. <b>Save:</b> <code>asdict</code> har object ko dictionary banata hai, <code>json.dumps</code> use text banata hai, aur <code>json.dump(..., indent=2)</code> insaan ke padhne layak file likhta hai. <b>Load:</b> <code>json.loads</code> aur <code>Device(**item)</code> barabar objects dobara banate hain; aakhri <code>True</code> saabit karta hai ki round trip mein kuch nahi khoya, dataclass ke <code>==</code> ki badaulat.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="CSV se objects, JSON aur wapas">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#e2e8f0"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="12">inventory.csv</text><text x="65" y="85" text-anchor="middle" class="svg-muted" font-size="10">DictReader rows</text>
<rect x="165" y="40" width="130" height="60" rx="10" fill="#bae6fd"/><text x="230" y="66" text-anchor="middle" class="svg-ink" font-size="12">Device objects</text><text x="230" y="85" text-anchor="middle" class="svg-muted" font-size="10">Device(**row)</text>
<rect x="340" y="40" width="120" height="60" rx="10" fill="#fde68a"/><text x="400" y="66" text-anchor="middle" class="svg-ink" font-size="12">dicts</text><text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="10">asdict(d)</text>
<rect x="505" y="40" width="125" height="60" rx="10" fill="#bbf7d0"/><text x="567" y="66" text-anchor="middle" class="svg-ink" font-size="12">inventory.json</text><text x="567" y="85" text-anchor="middle" class="svg-muted" font-size="10">json.dump</text>
<line x1="120" y1="70" x2="165" y2="70" stroke="#64748b" stroke-width="2"/><line x1="295" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="2"/><line x1="460" y1="70" x2="505" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">json.load aur Device(**item) wapas le aate hain</text>
</svg><p class="cap">Round trip: file, objects, dictionaries, file.</p></div>

<h3>Row se constructor: @classmethod</h3>
<p>File ke columns ko tidy karna ho (extra space, lower case) to conversion ko class ke andar <b>class method</b> mein rakho. Use class khud <code>cls</code> ke roop mein milti hai aur woh naya object return karta hai. <code>@staticmethod</code> ek plain function hai jo tidiness ke liye class mein rehta hai aur use <code>cls</code> ya <code>self</code> nahi chahiye.</p>
<pre class="code">    @classmethod
    def from_row(cls, row):
        return cls(row["name"].strip().upper(), row["role"], row["ip"], row["site"])

    @staticmethod
    def valid_role(role):
        return role in ("core", "edge", "access")</pre>
<pre class="out">AUTO01$ python3 t3.py
Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2', site='Bengaluru')
True False</pre>
<p>Yeh output <code>Device.from_row(r)</code> se bane <code>devs[1]</code> ka hai, phir <code>"edge"</code> aur <code>"spine"</code> ka static check.</p>

<h3>List ko Inventory class mein lapetna</h3>
<p>Jab wahi list-handling code teen scripts mein dikhe, list ko ghar do. Special methods se aapki class collection ki tarah behave karti hai: <code>len()</code> ke liye <code>__len__</code>, <code>for</code> loops ke liye <code>__iter__</code>, <code>inv[0]</code> ke liye <code>__getitem__</code>.</p>
<pre class="code">class Inventory:
    def __init__(self, devices=None):
        self._devices = list(devices or [])

    def __len__(self):
        return len(self._devices)

    def __iter__(self):
        return iter(self._devices)

    def __getitem__(self, i):
        return self._devices[i]

    def add(self, device):
        self._devices.append(device)

    def by_role(self, role):
        return [d for d in self._devices if d.role == role]

    def find(self, name):
        for d in self._devices:
            if d.name == name:
                return d
        raise KeyError(name)</pre>
<pre class="out">AUTO01$ python3 t7.py
3 PUN-CORE-R1
PUN-CORE-R1
BLR-EDGE-R2
HYD-EDGE-R3
[Device(name='BLR-EDGE-R2', role='edge', ip='10.99.0.2'), Device(name='HYD-EDGE-R3', role='edge', ip='10.99.0.3')]
name         role    ip
-----------  ------  ---------
PUN-CORE-R1  core    10.99.0.1
BLR-EDGE-R2  edge    10.99.0.2
HYD-EDGE-R3  edge    10.99.0.3
KeyError: 'NOPE'</pre>
<p>Test script teen-field wale <code>Device</code> ki <code>Inventory</code> banati hai, ek jodti hai, uspar loop karti hai, edge devices filter karti hai, <code>tabulate</code> table print karti hai aur dikhati hai ki <code>find("NOPE")</code> <code>KeyError</code> uthata hai. Callers inventory ko list ki tarah use karte hain, <code>_devices</code> ke baare mein jaane bina.</p>

<h3>Do cheezein jo bigad sakti hain</h3>
<p>Objects khud se JSON nahi hote. Pehle <code>asdict</code> se convert karo:</p>
<pre class="out">AUTO01$ python3 t1.py
<span class="hl">TypeError: Object of type D is not JSON serializable</span></pre>
<p>Yeh <code>D</code> naam ki dataclass par <code>json.dumps(D("x"))</code> ka result hai. Doosra classic aisi row hai jisme aisa column ho jo aapki class nahi jaanti:</p>
<pre class="out">AUTO01$ python3 t4.py
<span class="hl">TypeError: Device.__init__() got an unexpected keyword argument 'extra'</span></pre>
<p>Yahan ek row mein extra column <code>extra</code> tha, aur <code>Device(**row)</code> ne use aage pass kar diya. Data theek karo, ya zaroori columns chuno: <code>Device(row["name"], row["role"], row["ip"], row["site"])</code>.</p>
<p>Aakhir mein copies yaad rakho. <code>b = a</code> ek hi object ka doosra naam banata hai. <code>copy.copy(a)</code> object ki copy banata hai par andar ki lists abhi bhi shared rehti hain; sirf <code>copy.deepcopy(a)</code> poori tarah independent copy deta hai. <code>["Gi0/0"]</code> rakhne wale object mein original mein <code>"Gi0/1"</code> append karne se <code>b</code> aur shallow copy badle, par deep copy nahi: teen printed results <code>['Gi0/0', 'Gi0/1'] ['Gi0/0', 'Gi0/1'] ['Gi0/0']</code> the.</p>

<div class="warn"><p><b>Common mistakes.</b> Number ki jagah string se sort karna (IP addresses text ki tarah sort hote hain, numerically nahi; uske liye <code>ipaddress</code> module use karo). Yeh bhoolna ki <code>sorted</code> nayi list return karta hai jabki <code>list.sort()</code> original badalta hai aur <code>None</code> return karta hai. <code>asdict</code> ke bina objects ko JSON mein dump karna. Copy ko independent maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>Device(**row)</code> ko dictionary keys parameter names se bilkul match chahiye. <code>name</code> ki jagah <code>hostname</code> header se <code>unexpected keyword argument</code> (aur missing <code>name</code>) aata hai.</p></div>

<div class="scn"><h4>API team ko gayi inventory</h4><p>Automation team ko device list JSON mein doosri team ki API ko bhejni thi. Pehli script ne <code>json.dumps(devices)</code> try kiya aur "not JSON serializable" se fail hui. Fix ek line ka tha, <code>[asdict(d) for d in devices]</code>. Doosri team ne edited JSON file wapas bheji to <code>Device(**item)</code> ne objects dobara banaye, aur <code>==</code> se compare karne par ek-ek dikha ki unhone kaun se routers badle.</p><p><b>Lesson:</b> objects ko program ke andar rakho aur dictionaries ko kinaaron par.</p></div>

<div class="iv"><p class="q">"Objects ki list ko JSON mein kaise save aur dobara load karte ho?"</p><p>Dataclasses ke saath har object ko <code>asdict</code> se convert karta hoon, list <code>json.dump</code> se likhta hoon, aur load karte waqt <code>Device(**item)</code> se rebuild karta hoon. Dataclass ka <code>==</code> mujhe assert karne deta hai ki round trip lossless hai. Nested objects ke liye <code>asdict</code> recursively convert karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Keys fields se match karein to <code>Device(**row)</code> CSV ya JSON dictionary ko object banata hai.</li>
<li><code>sorted(..., key=attrgetter("site"))</code>, comprehensions, <code>defaultdict</code> aur <code>Counter</code> sort, filter, group aur count sambhalte hain.</li>
<li><code>json.dump</code> se pehle <code>asdict</code>; <code>json.load</code> ke baad <code>Device(**item)</code>.</li>
<li><code>__len__</code>, <code>__iter__</code> aur <code>__getitem__</code> wali class collection ki tarah behave karti hai.</li>
<li>Nested data ki independent copy ke liye <code>deepcopy</code>.</li>
</ul></div>
`}};export{e as default};