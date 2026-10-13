var e={id:`sdk-objects`,h:{en:`pan-os-python: objects as Python classes`,hi:`pan-os-python: objects ko Python classes ki tarah`},body:{en:`
<p>Chapters 3 to 5 built every request by hand: an xpath, an element string, a reply parser. That teaches you what travels on the wire, but it is slow to write and easy to get wrong. <b>pan-os-python</b> is a library that does the same calls for you. You work with Python objects, and the library builds the xpath and the XML.</p>

<div class="dia"><svg viewBox="0 0 640 212" role="img" aria-label="diagram">
<rect x="250" y="8" width="140" height="38" rx="10" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<rect x="30" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="95" y="104" text-anchor="middle" class="svg-ink" font-size="13">AddressObject</text>
<rect x="180" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="245" y="104" text-anchor="middle" class="svg-ink" font-size="13">AddressGroup</text>
<rect x="330" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="395" y="104" text-anchor="middle" class="svg-ink" font-size="13">Tag</text>
<rect x="480" y="80" width="130" height="38" rx="10" fill="#ddd6fe"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text>
<rect x="480" y="150" width="130" height="38" rx="10" fill="#bbf7d0"/><text x="545" y="174" text-anchor="middle" class="svg-ink" font-size="13">SecurityRule</text>
<line x1="320" y1="46" x2="95" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="245" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="395" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="545" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="545" y1="118" x2="545" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="30" y="160" text-anchor="start" class="svg-ink" font-size="12">create()  apply()  update()</text>
<text x="30" y="178" text-anchor="start" class="svg-ink" font-size="12">refresh()  refreshall()  delete()</text>
<text x="30" y="196" text-anchor="start" class="svg-ink" font-size="12">fw.add(obj)   fw.find(name, cls)</text>
</svg><p class="cap">pan-os-python mirrors the configuration as a tree of Python objects. Each object knows how to write itself to the firewall.</p></div>

<h3>One tree, one connection</h3>
<p>Create a <code>Firewall</code> with the address and the key from the environment. Every object you <code>add</code> to it becomes its child, and the child inherits the connection and knows its own xpath. Nothing is sent when you add: <code>add</code> only builds the tree in memory.</p>
<p>The methods are the same on every object class (<code>AddressObject</code>, <code>AddressGroup</code>, <code>Tag</code>, <code>ServiceObject</code>, <code>SecurityRule</code>):</p>
<table class="cmp"><tr><th>Method</th><th>Does</th><th>XML API action</th></tr>
<tr><td><code>create()</code></td><td>Writes a new object</td><td><code>set</code></td></tr>
<tr><td><code>apply()</code></td><td>Writes the object as it is in Python, create or replace</td><td><code>edit</code></td></tr>
<tr><td><code>refresh()</code></td><td>Reads the object from the firewall into this Python object</td><td><code>get</code></td></tr>
<tr><td><code>delete()</code></td><td>Removes it from the firewall</td><td><code>delete</code></td></tr>
<tr><td><code>refreshall(parent, add=False)</code></td><td>Class method: reads all objects of that class</td><td><code>get</code> on the list</td></tr></table>

<h3>Live: create, read back, change, delete</h3>
<p><code>sdkdemo.py</code> uses two views of the same firewall, so that the read-back proves the data really went to the device and not only into the Python variable.</p>
<pre class="code">import os

from dotenv import load_dotenv
from panos import firewall, objects

load_dotenv()
key = os.environ["PAN_API_KEY"]
fw = firewall.Firewall("10.99.0.42", api_key=key)

fw.add(objects.Tag("prod", color="red")).create()
a = fw.add(objects.AddressObject("db1", "10.20.0.31/32", description="database", tag=["prod"]))
a.create()
print("children of fw:", [type(c).__name__ + ":" + c.name for c in fw.children])

other = firewall.Firewall("10.99.0.42", api_key=key)          # a second, empty view of the same firewall
b = other.add(objects.AddressObject("db1"))
b.refresh()
print("read back:", b.value, "|", b.description, "|", b.tag)

a.description = "primary database"
a.apply()
b.refresh()
print("after apply:", b.description)

print("all addresses:", sorted(x.name for x in objects.AddressObject.refreshall(other, add=False)))
a.delete()
print("after delete:", sorted(x.name for x in objects.AddressObject.refreshall(other, add=False)))</pre>
<pre class="out">AUTO01$ python3 sdkdemo.py
children of fw: ['Tag:prod', 'AddressObject:db1']
read back: 10.20.0.31/32 | database | ['prod']
<span class="hl">after apply: primary database</span>
all addresses: ['db1', 'web-srv']
<span class="hl">after delete: ['web-srv']</span></pre>
<p>The tag and the address were written with <code>create()</code>. The second <code>Firewall</code> object started empty, and <code>refresh()</code> filled <code>b</code> with value, description and tags from the device. Changing a Python attribute and calling <code>apply()</code> wrote the new description. Note the argument <code>add=False</code> on <code>refreshall</code>: it returns a list and does <b>not</b> attach the objects to the tree. Without it, every object read is added as a child, and a later <code>apply</code> of the parent would write all of them again.</p>

<h3>Keys, not passwords, in the code</h3>
<p>The key is read from the environment (<code>load_dotenv()</code> fills it from <code>.env</code> and never overrides a variable that is already set). The library does not print it, and neither should you. If you only have a username and password, <code>Firewall("10.99.0.42", "svc-fw", "...")</code> asks for a key itself, but then the password sits in your script. Prefer the key.</p>

<h3>Under the library</h3>
<p>pan-os-python is built on a lower layer, <code>pan.xapi.PanXapi</code>. It is close to chapter 3: you pass an xpath and an element and read <code>element_result</code>. It raises <code>PanXapiError</code> and keeps the numeric code in <code>status_code</code>:</p>
<pre class="code">import os

import pan.xapi
from dotenv import load_dotenv

load_dotenv()
x = pan.xapi.PanXapi(hostname="10.99.0.42", api_key=os.environ["PAN_API_KEY"])
x.op(cmd="show system info", cmd_xml=True)
print("status:", x.status, "| hostname:", x.element_result.findtext("./system/hostname"))
try:
    x.set(xpath="/config/nope/path", element="&lt;a/&gt;")
except pan.xapi.PanXapiError as e:
    print("PanXapiError:", e, "| status_code", x.status_code)</pre>
<pre class="out">AUTO01$ python3 panxapi.py
status: success | hostname: BLR-FW1
<span class="hl">PanXapiError: Invalid XPath /config/nope/path | status_code 12</span></pre>
<p>Use the library for objects and rules. Drop to <code>PanXapi</code>, or to <code>fw.op()</code> and <code>fw.xapi</code>, for a command the object model does not cover.</p>

<div class="warn"><p><b>Common mistakes.</b> Calling <code>refreshall</code> without <code>add=False</code> and then applying the parent. Using <code>apply()</code> when only a field should change on a rule that was edited by someone else. Putting the key in the script. Assuming <code>create()</code> on an existing name fails: it merges, as <code>set</code> does.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>create</code> maps to <code>set</code> and <code>apply</code> to <code>edit</code>. Objects added with <code>add()</code> are only in memory until you call a write method. Nothing you call on an object commits; a commit is always a separate <code>fw.commit()</code>.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The library is the real pan-os-python, but the lab firewall is a simulator that accepts the calls used here. Behaviour of rarely used attributes, version-specific fields and Panorama device groups is not simulated.</p></div>

<div class="scn"><h4>The sync that rewrote everything</h4><p>A sync script read the address list with <code>refreshall(fw)</code>, which added every address under the firewall object, and then called <code>apply()</code> on a new object of the same parent. The whole tree was written back, so unrelated addresses were rewritten, including stale values from the script's old read.</p><p><b>Lesson:</b> read with <code>add=False</code> when you only want a list, and write the object you mean.</p></div>

<div class="iv"><p class="q">"Why use pan-os-python instead of requests with the XML API?"</p><p>It removes the xpath and XML string building, which is where most typos happen, and it raises specific exceptions. I still know the XML API underneath, because I need it to read an error code, to run an operational command, or to explain what the library sent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects are children of a <code>Firewall</code>; <code>add()</code> builds the tree, it does not write.</li>
<li><code>create</code> = set, <code>apply</code> = edit, <code>refresh</code> = get, <code>delete</code> = delete.</li>
<li>Use <code>refreshall(..., add=False)</code> to list.</li>
<li>Take the key from the environment and do not print it.</li>
<li><code>pan.xapi.PanXapi</code> is the lower layer and exposes the numeric code.</li>
</ul></div>
`,hi:`
<p>Chapter 3 se 5 mein har request haath se banai: xpath, element string, reply parser. Isse pata chalta hai ki wire par kya jaata hai, lekin likhna dheema hai aur galti aasaan. <b>pan-os-python</b> ek library hai jo wahi calls aapke liye karti hai. Aap Python objects ke saath kaam karte ho, aur library xpath aur XML banati hai.</p>

<div class="dia"><svg viewBox="0 0 640 212" role="img" aria-label="diagram">
<rect x="250" y="8" width="140" height="38" rx="10" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text>
<rect x="30" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="95" y="104" text-anchor="middle" class="svg-ink" font-size="13">AddressObject</text>
<rect x="180" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="245" y="104" text-anchor="middle" class="svg-ink" font-size="13">AddressGroup</text>
<rect x="330" y="80" width="130" height="38" rx="10" fill="#fde68a"/><text x="395" y="104" text-anchor="middle" class="svg-ink" font-size="13">Tag</text>
<rect x="480" y="80" width="130" height="38" rx="10" fill="#ddd6fe"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="13">Rulebase</text>
<rect x="480" y="150" width="130" height="38" rx="10" fill="#bbf7d0"/><text x="545" y="174" text-anchor="middle" class="svg-ink" font-size="13">SecurityRule</text>
<line x1="320" y1="46" x2="95" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="245" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="395" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="46" x2="545" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="545" y1="118" x2="545" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="30" y="160" text-anchor="start" class="svg-ink" font-size="12">create()  apply()  update()</text>
<text x="30" y="178" text-anchor="start" class="svg-ink" font-size="12">refresh()  refreshall()  delete()</text>
<text x="30" y="196" text-anchor="start" class="svg-ink" font-size="12">fw.add(obj)   fw.find(name, cls)</text>
</svg><p class="cap">pan-os-python configuration ko Python objects ke tree ki tarah dikhata hai. Har object jaanta hai ki khud ko firewall par kaise likhna hai.</p></div>

<h3>Ek tree, ek connection</h3>
<p>Address aur environment se key ke saath ek <code>Firewall</code> banao. Jo bhi object <code>add</code> karte ho woh uska child ban jaata hai, connection inherit karta hai aur apna xpath jaanta hai. Add karne par kuch bheja nahi jaata: <code>add</code> sirf memory mein tree banata hai.</p>
<p>Methods har object class par same hain (<code>AddressObject</code>, <code>AddressGroup</code>, <code>Tag</code>, <code>ServiceObject</code>, <code>SecurityRule</code>):</p>
<table class="cmp"><tr><th>Method</th><th>Kya karta hai</th><th>XML API action</th></tr>
<tr><td><code>create()</code></td><td>Naya object likhta hai</td><td><code>set</code></td></tr>
<tr><td><code>apply()</code></td><td>Object ko waisa hi likhta hai jaisa Python mein hai, create ya replace</td><td><code>edit</code></td></tr>
<tr><td><code>refresh()</code></td><td>Firewall se object padh kar is Python object mein bharta hai</td><td><code>get</code></td></tr>
<tr><td><code>delete()</code></td><td>Firewall se hata deta hai</td><td><code>delete</code></td></tr>
<tr><td><code>refreshall(parent, add=False)</code></td><td>Class method: us class ke saare objects padhta hai</td><td>list par <code>get</code></td></tr></table>

<h3>Live: create, read back, change, delete</h3>
<p><code>sdkdemo.py</code> ek hi firewall ke do views use karti hai, taaki read-back saabit kare ki data sach mein device par gaya, sirf Python variable mein nahi.</p>
<pre class="code">import os

from dotenv import load_dotenv
from panos import firewall, objects

load_dotenv()
key = os.environ["PAN_API_KEY"]
fw = firewall.Firewall("10.99.0.42", api_key=key)

fw.add(objects.Tag("prod", color="red")).create()
a = fw.add(objects.AddressObject("db1", "10.20.0.31/32", description="database", tag=["prod"]))
a.create()
print("children of fw:", [type(c).__name__ + ":" + c.name for c in fw.children])

other = firewall.Firewall("10.99.0.42", api_key=key)          # a second, empty view of the same firewall
b = other.add(objects.AddressObject("db1"))
b.refresh()
print("read back:", b.value, "|", b.description, "|", b.tag)

a.description = "primary database"
a.apply()
b.refresh()
print("after apply:", b.description)

print("all addresses:", sorted(x.name for x in objects.AddressObject.refreshall(other, add=False)))
a.delete()
print("after delete:", sorted(x.name for x in objects.AddressObject.refreshall(other, add=False)))</pre>
<pre class="out">AUTO01$ python3 sdkdemo.py
children of fw: ['Tag:prod', 'AddressObject:db1']
read back: 10.20.0.31/32 | database | ['prod']
<span class="hl">after apply: primary database</span>
all addresses: ['db1', 'web-srv']
<span class="hl">after delete: ['web-srv']</span></pre>
<p>Tag aur address <code>create()</code> se likhe gaye. Doosra <code>Firewall</code> object khaali tha, aur <code>refresh()</code> ne <code>b</code> ko device se value, description aur tags se bhar diya. Python attribute badal kar <code>apply()</code> bulane se nayi description likhi gayi. <code>refreshall</code> par <code>add=False</code> ka dhyan rakho: yeh list lautata hai aur objects ko tree se <b>nahi</b> jodta. Iske bina padhe gaye har object child ban jaata hai, aur baad mein parent ka <code>apply</code> sab ko dobara likh deta hai.</p>

<h3>Code mein key, password nahi</h3>
<p>Key environment se aati hai (<code>load_dotenv()</code> use <code>.env</code> se bharta hai aur pehle se set variable ko override nahi karta). Library use print nahi karti, aap bhi mat karo. Sirf username aur password ho to <code>Firewall("10.99.0.42", "svc-fw", "...")</code> khud key mangta hai, lekin tab password script mein baitha hai. Key ko tarjeeh do.</p>

<h3>Library ke neeche</h3>
<p>pan-os-python ek neeche ki layer, <code>pan.xapi.PanXapi</code>, par bani hai. Yeh chapter 3 ke kareeb hai: xpath aur element do aur <code>element_result</code> padho. Yeh <code>PanXapiError</code> uthata hai aur numeric code <code>status_code</code> mein rakhta hai:</p>
<pre class="code">import os

import pan.xapi
from dotenv import load_dotenv

load_dotenv()
x = pan.xapi.PanXapi(hostname="10.99.0.42", api_key=os.environ["PAN_API_KEY"])
x.op(cmd="show system info", cmd_xml=True)
print("status:", x.status, "| hostname:", x.element_result.findtext("./system/hostname"))
try:
    x.set(xpath="/config/nope/path", element="&lt;a/&gt;")
except pan.xapi.PanXapiError as e:
    print("PanXapiError:", e, "| status_code", x.status_code)</pre>
<pre class="out">AUTO01$ python3 panxapi.py
status: success | hostname: BLR-FW1
<span class="hl">PanXapiError: Invalid XPath /config/nope/path | status_code 12</span></pre>
<p>Objects aur rules ke liye library use karo. Jo command object model mein nahi, uske liye <code>PanXapi</code>, ya <code>fw.op()</code> aur <code>fw.xapi</code> par utro.</p>

<div class="warn"><p><b>Aam galtiyan.</b> <code>refreshall</code> ko <code>add=False</code> ke bina bulana aur phir parent apply karna. Jis rule ko kisi aur admin ne edit kiya, uspar sirf ek field badalni ho tab <code>apply()</code> use karna. Key ko script mein rakhna. Yeh maan lena ki maujooda naam par <code>create()</code> fail hota hai: woh <code>set</code> ki tarah merge karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>create</code> ka matlab <code>set</code> aur <code>apply</code> ka matlab <code>edit</code>. <code>add()</code> se jode gaye objects write method bulane tak sirf memory mein hain. Object par bulaya koi bhi method commit nahi karta; commit hamesha alag <code>fw.commit()</code> hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Library asli pan-os-python hai, lekin lab ka firewall ek simulator hai jo yahan use hui calls accept karta hai. Kam use hone wale attributes, version-specific fields aur Panorama device groups simulate nahi hote.</p></div>

<div class="scn"><h4>Sync jisne sab dobara likh diya</h4><p>Ek sync script ne address list <code>refreshall(fw)</code> se padhi, jisne har address firewall object ke neeche add kar diya, phir usi parent ke naye object par <code>apply()</code> bulaya. Poora tree wapas likha gaya, to script ki purani read ki stale values samet unrelated addresses bhi dobara likh diye gaye.</p><p><b>Lesson:</b> sirf list chahiye to <code>add=False</code> se padho, aur wahi object likho jo aap likhna chahte ho.</p></div>

<div class="iv"><p class="q">"XML API ke saath requests ki jagah pan-os-python kyun?"</p><p>Yeh xpath aur XML string banane ka kaam hata deta hai, jahan zyadatar typos hote hain, aur specific exceptions uthata hai. Neeche ka XML API phir bhi aana chahiye, kyunki error code padhne, operational command chalane ya library ne kya bheja yeh samjhane ke liye woh chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Objects <code>Firewall</code> ke children hain; <code>add()</code> tree banata hai, likhta nahi.</li>
<li><code>create</code> = set, <code>apply</code> = edit, <code>refresh</code> = get, <code>delete</code> = delete.</li>
<li>List ke liye <code>refreshall(..., add=False)</code> use karo.</li>
<li>Key environment se lo aur print mat karo.</li>
<li><code>pan.xapi.PanXapi</code> neeche ki layer hai aur numeric code dikhati hai.</li>
</ul></div>
`}};export{e as default};