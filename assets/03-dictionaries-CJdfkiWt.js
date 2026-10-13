var e={id:`dictionaries`,h:{en:`Dictionaries: key to value, like an ARP table`,hi:`Dictionaries: key se value, ARP table jaisi`},body:{en:`
<p>A list finds things by <b>position</b>. But "the third column" is a poor way to ask for an IP address. You would rather say "the IP of this device". A <b>dictionary</b> (dict) finds a value by a <b>key</b>, a label you choose. You already know one: the ARP table. You look up an IP address (the key) and get a MAC address (the value). A dictionary is written with curly brackets, and a colon joins each key to its value.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Key value pairs">
<rect x="20" y="15" width="150" height="40" rx="10" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="14">key</text>
<rect x="190" y="15" width="190" height="40" rx="10" fill="#bae6fd"/><text x="285" y="40" text-anchor="middle" class="svg-ink" font-size="14">value</text>
<rect x="20" y="60" width="150" height="36" rx="10" fill="#e2e8f0"/><text x="95" y="83" text-anchor="middle" class="svg-ink" font-size="14">"ip"</text>
<rect x="190" y="60" width="190" height="36" rx="10" fill="#e2e8f0"/><text x="285" y="83" text-anchor="middle" class="svg-ink" font-size="14">"10.1.1.1"</text>
<text x="400" y="38" class="svg-muted" font-size="12">Find by the key, not by position</text>
<text x="400" y="82" class="svg-muted" font-size="12">dev["ip"]  gives  "10.1.1.1"</text>
</svg><p class="cap">A dictionary is a set of key and value pairs.</p></div>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
print(dev)
print(dev["ip"])
print(dev["role"])
print(len(dev))</pre>
<pre class="out">AUTO&gt; python3 d1.py
{'ip': '10.1.1.1', 'role': 'core'}
10.1.1.1
core
2</pre>
<h3>Adding, changing and asking</h3>
<ul>
<li><code>dev["site"] = "Pune"</code> adds a new pair, or replaces the value if the key already exists.</li>
<li><code>dev.get("os", "unknown")</code> reads a key safely: if the key is missing it returns the default you gave instead of an error.</li>
<li><code>"ip" in dev</code> asks whether a <b>key</b> is present.</li>
<li><code>keys()</code> and <code>values()</code> list the keys and the values.</li>
</ul>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
dev["site"] = "Pune"
dev["role"] = "edge"
print(dev)
print(dev.get("os", "unknown"))
print("ip" in dev)
print("os" in dev)
print(list(dev.keys()))
print(list(dev.values()))</pre>
<pre class="out">AUTO&gt; python3 d2.py
{'ip': '10.1.1.1', 'role': 'edge', 'site': 'Pune'}
unknown
True
False
['ip', 'role', 'site']
['10.1.1.1', 'edge', 'Pune']</pre>
<h3>The key that does not exist</h3>
<p>Reading a missing key with square brackets is a <b>KeyError</b>. Keys are case-sensitive, and they are text, so <code>"IP"</code> is not <code>"ip"</code>:</p>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
print(dev["IP"])</pre>
<pre class="out">AUTO&gt; python3 d3.py
Traceback (most recent call last):
  File "d3.py", line 2, in &lt;module&gt;
    print(dev["IP"])
<span class="hl">KeyError: 'IP'</span></pre>
<p>The error message shows the missing key itself: <code>KeyError: 'IP'</code>. When you are not sure a key exists, use <code>get()</code> or test with <code>in</code> first.</p>
<h3>List or dictionary?</h3>
<table class="cmp"><thead><tr><th>You need...</th><th>Use</th></tr></thead><tbody>
<tr><td>An ordered group of similar things (all router IPs)</td><td>A list</td></tr>
<tr><td>Labelled fields of one thing (IP, role, site of a device)</td><td>A dictionary</td></tr>
<tr><td>Look something up by name, quickly</td><td>A dictionary</td></tr>
<tr><td>Do something for every item</td><td>Either, with a for loop</td></tr>
</tbody></table>
<div class="eg"><p><b>Worked example.</b> The interface table of a router is naturally a dictionary: the key is the interface name and the value says <code>up</code> or <code>down</code>. <code>status["GigabitEthernet0/1"]</code> answers "is Gi0/1 up?" without counting positions.</p></div>
<div class="warn"><p><b>Common mistake.</b> Mixing up the brackets: lists use <code>[ ]</code>, dictionaries use <code>{ }</code>, but reading a value from either uses <code>[ ]</code>: <code>dev["ip"]</code>. And do not forget the quotes around a text key: <code>dev[ip]</code> without quotes looks for a variable named ip.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>d["x"]</code> on a missing key raises <code>KeyError</code>; <code>d.get("x")</code> returns <code>None</code> (or your default). <code>in</code> on a dictionary tests the keys, not the values. Dictionary keys must be unique: assigning the same key again replaces the value.</p></div>
<div class="scn"><h4>The missing key at 2 a.m.</h4><p>A monitoring script read <code>device["os"]</code> for every device. One new device in the inventory had no "os" field and the script crashed with <code>KeyError: 'os'</code> during the night. The fix was <code>device.get("os", "unknown")</code>, so a missing field no longer stopped the report.</p><p><b>Lesson:</b> use get() with a default when data may be incomplete.</p></div>
<div class="iv"><p class="q">"When would you use a dictionary instead of a list?"</p><p>When values have names and you want to look them up by name, for example the fields of one device or interface statuses by interface name. Dictionary lookup by key is direct and readable. Use a list when you have an ordered collection of similar items to loop over.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A dictionary maps keys to values with curly brackets and colons.</li>
<li>Read with d["key"]; add or change with d["key"] = value; read safely with get().</li>
<li>in tests keys; keys are case-sensitive and unique.</li>
<li>A missing key is a KeyError.</li>
</ul></div>
`,hi:`
<p>List cheezein <b>position</b> se dhoondhti hai. Lekin "teesra column" IP address maangne ka bura tareeka hai. Aap kehna chahoge "is device ka IP". <b>Dictionary</b> (dict) value ko <b>key</b> se dhoondhti hai, ek label jo aap chunte ho. Aap ek dictionary pehle se jaante ho: ARP table. Aap IP address (key) dhoondhte ho aur MAC address (value) milta hai. Dictionary curly brackets se likhi jaati hai, aur colon har key ko uski value se jodta hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Key value pairs">
<rect x="20" y="15" width="150" height="40" rx="10" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="14">key</text>
<rect x="190" y="15" width="190" height="40" rx="10" fill="#bae6fd"/><text x="285" y="40" text-anchor="middle" class="svg-ink" font-size="14">value</text>
<rect x="20" y="60" width="150" height="36" rx="10" fill="#e2e8f0"/><text x="95" y="83" text-anchor="middle" class="svg-ink" font-size="14">"ip"</text>
<rect x="190" y="60" width="190" height="36" rx="10" fill="#e2e8f0"/><text x="285" y="83" text-anchor="middle" class="svg-ink" font-size="14">"10.1.1.1"</text>
<text x="400" y="38" class="svg-muted" font-size="12">Key se dhoondho, position se nahi</text>
<text x="400" y="82" class="svg-muted" font-size="12">dev["ip"]  gives  "10.1.1.1"</text>
</svg><p class="cap">Dictionary key aur value pairs ka set hai.</p></div>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
print(dev)
print(dev["ip"])
print(dev["role"])
print(len(dev))</pre>
<pre class="out">AUTO&gt; python3 d1.py
{'ip': '10.1.1.1', 'role': 'core'}
10.1.1.1
core
2</pre>
<h3>Jodna, badalna aur poochna</h3>
<ul>
<li><code>dev["site"] = "Pune"</code> naya pair jodta hai, ya key pehle se ho to value badal deta hai.</li>
<li><code>dev.get("os", "unknown")</code> key ko safely padhta hai: key missing ho to error ki jagah aapka diya default return karta hai.</li>
<li><code>"ip" in dev</code> poochta hai kya <b>key</b> maujood hai.</li>
<li><code>keys()</code> aur <code>values()</code> keys aur values ki list dete hain.</li>
</ul>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
dev["site"] = "Pune"
dev["role"] = "edge"
print(dev)
print(dev.get("os", "unknown"))
print("ip" in dev)
print("os" in dev)
print(list(dev.keys()))
print(list(dev.values()))</pre>
<pre class="out">AUTO&gt; python3 d2.py
{'ip': '10.1.1.1', 'role': 'edge', 'site': 'Pune'}
unknown
True
False
['ip', 'role', 'site']
['10.1.1.1', 'edge', 'Pune']</pre>
<h3>Woh key jo hai hi nahi</h3>
<p>Square brackets se missing key padhna <b>KeyError</b> hai. Keys case-sensitive hain, aur woh text hain, isliye <code>"IP"</code> aur <code>"ip"</code> alag hain:</p>
<pre class="code">dev = {"ip": "10.1.1.1", "role": "core"}
print(dev["IP"])</pre>
<pre class="out">AUTO&gt; python3 d3.py
Traceback (most recent call last):
  File "d3.py", line 2, in &lt;module&gt;
    print(dev["IP"])
<span class="hl">KeyError: 'IP'</span></pre>
<p>Error message missing key ko khud dikhata hai: <code>KeyError: 'IP'</code>. Jab pakka na ho ki key hai, <code>get()</code> use karo ya pehle <code>in</code> se test karo.</p>
<h3>List ya dictionary?</h3>
<table class="cmp"><thead><tr><th>Aapko chahiye...</th><th>Use karo</th></tr></thead><tbody>
<tr><td>Milti-julti cheezon ka ordered group (saare router IPs)</td><td>List</td></tr>
<tr><td>Ek cheez ke labelled fields (device ka IP, role, site)</td><td>Dictionary</td></tr>
<tr><td>Naam se jaldi kuch dhoondhna</td><td>Dictionary</td></tr>
<tr><td>Har item ke liye kuch karna</td><td>Dono, for loop ke saath</td></tr>
</tbody></table>
<div class="eg"><p><b>Worked example.</b> Router ka interface table swabhaavik roop se dictionary hai: key interface ka naam aur value <code>up</code> ya <code>down</code>. <code>status["GigabitEthernet0/1"]</code> bina position ginte jawab deta hai "kya Gi0/1 up hai?"</p></div>
<div class="warn"><p><b>Common galti.</b> Brackets mix karna: lists <code>[ ]</code> use karti hain, dictionaries <code>{ }</code>, lekin dono se value padhne ke liye <code>[ ]</code> lagta hai: <code>dev["ip"]</code>. Aur text key ke aas-paas quotes mat bhoolo: <code>dev[ip]</code> bina quotes ke ip naam ka variable dhoondhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Missing key par <code>d["x"]</code> <code>KeyError</code> deta hai; <code>d.get("x")</code> <code>None</code> (ya aapka default) return karta hai. Dictionary par <code>in</code> keys test karta hai, values nahi. Dictionary keys unique hone chahiye: wahi key dobara assign karne se value badal jaati hai.</p></div>
<div class="scn"><h4>Raat 2 baje ki missing key</h4><p>Ek monitoring script har device ke liye <code>device["os"]</code> padhta tha. Inventory ke ek naye device mein "os" field nahi thi aur script raat ko <code>KeyError: 'os'</code> se crash ho gaya. Fix <code>device.get("os", "unknown")</code> tha, jisse missing field ab report nahi rokti.</p><p><b>Lesson:</b> data adhoora ho sakta ho to default ke saath get() use karo.</p></div>
<div class="iv"><p class="q">"List ki jagah dictionary kab use karoge?"</p><p>Jab values ke naam hon aur aap unhe naam se dhoondhna chahte ho, jaise ek device ke fields ya interface naam se interface statuses. Key se dictionary lookup seedha aur readable hai. List tab use karo jab aapke paas loop karne ke liye milte-julte items ka ordered collection ho.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dictionary curly brackets aur colons se keys ko values se jodti hai.</li>
<li>d["key"] se padho; d["key"] = value se jodo ya badlo; get() se safely padho.</li>
<li>in keys test karta hai; keys case-sensitive aur unique hain.</li>
<li>Missing key KeyError hai.</li>
</ul></div>
`}};export{e as default};