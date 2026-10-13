var e={id:`json-python`,h:{en:`JSON in Python: load, dump and the four functions`,hi:`Python mein JSON: load, dump aur chaar functions`},body:{en:`
<p>Python ships with a module called <code>json</code> for reading and writing JSON. It has four main functions. They look alike, so this chapter gives you a simple memory trick.</p>
<h3>The "s" means string</h3>
<ul>
<li><code>json.loads(text)</code>: <b>load from a string</b>. Text in, Python data out.</li>
<li><code>json.load(file)</code>: <b>load from a file object</b>. File in, Python data out.</li>
<li><code>json.dumps(data)</code>: <b>dump to a string</b>. Python data in, text out.</li>
<li><code>json.dump(data, file)</code>: <b>dump to a file object</b>. Python data in, file written.</li>
</ul>
<p>The trick: the function with an <b>s</b> works with a <b>s</b>tring. The one without works with a file. And <b>load</b> means "into Python", <b>dump</b> means "out of Python".</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Four functions"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Text or file</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">JSON on disk</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">load</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">loads/text to Python</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Python data</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">dict and list</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">dump</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">dumps/Python to text</text></svg><p class="cap">Four functions</p></div>
<h3>Loading text into data</h3>
<pre class="code">import json

text = '{"name": "HYD-CORE1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20, 30], "managed": true, "owner": null}'
device = json.loads(text)

print(type(device))
print(device["name"])
print(device["vlans"][1])
print(device["managed"], type(device["managed"]))
print(device["owner"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">&lt;class 'dict'&gt;
HYD-CORE1
20
True &lt;class 'bool'&gt;
None</pre>
<p>The text became a dictionary. Look at the last two lines: <code>true</code> became <code>True</code>, and <code>null</code> became <code>None</code>. After loading, you use ordinary Python: keys, indexes, loops.</p>
<h3>Loading from a file</h3>
<p>In lab 1 the data lives in <code>inventory.json</code> and <code>show_inv.py</code> reads it with <code>json.load</code>. Here is a self-contained version: it first writes a small file, then reads it back.</p>
<pre class="code">import json

with open("inventory.json", "w") as f:
    f.write('{"site": "Hyderabad", "devices": [{"name": "HYD-CORE1", "vlans": [10, 20, 30]}, {"name": "HYD-ACC1", "vlans": [10, 20]}]}')

with open("inventory.json") as f:
    inv = json.load(f)

print("Site:", inv["site"])
for dev in inv["devices"]:
    print(dev["name"], dev["vlans"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Site: Hyderabad
HYD-CORE1 [10, 20, 30]
HYD-ACC1 [10, 20]</pre>
<h3>Changing data and writing it back</h3>
<p>Because the data is now a dictionary, you edit it like any dictionary. Then <code>json.dump</code> writes it out. The <code>indent=2</code> argument makes the file pretty. Without it everything lands on one line.</p>
<pre class="code">import json

inv = {"site": "Hyderabad", "devices": [{"name": "HYD-CORE1", "vlans": [10, 20]}]}
inv["devices"][0]["vlans"].append(30)
inv["devices"].append({"name": "HYD-ACC2", "vlans": [10]})

with open("out.json", "w") as f:
    json.dump(inv, f, indent=2)

with open("out.json") as f:
    print(f.read())</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{
  "site": "Hyderabad",
  "devices": [
    {
      "name": "HYD-CORE1",
      "vlans": [
        10,
        20,
        30
      ]
    },
    {
      "name": "HYD-ACC2",
      "vlans": [
        10
      ]
    }
  ]
}</pre>
<p>Notice that Python's <code>True</code> and <code>None</code> would be written back as <code>true</code> and <code>null</code>, so a program can write valid JSON without you thinking about it. This is why you write JSON with <code>json.dump</code> and never by pasting Python's printout.</p>
<h3>dumps: JSON as text</h3>
<p><code>json.dumps</code> is handy to show data or to send it in an API request. Useful options: <code>indent=2</code> (pretty) and <code>sort_keys=True</code> (alphabetical keys, good for comparing two files).</p>
<pre class="code">import json

data = {"name": "R1", "up": True, "owner": None, "vlans": [10, 20]}
print(json.dumps(data))
print(json.dumps(data, indent=2, sort_keys=True))
print(type(json.dumps(data)))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{"name": "R1", "up": true, "owner": null, "vlans": [10, 20]}
{
  "name": "R1",
  "owner": null,
  "up": true,
  "vlans": [
    10,
    20
  ]
}
&lt;class 'str'&gt;</pre>
<p><code>type</code> shows <code>str</code>: <code>dumps</code> gives you <b>text</b>, not a dictionary. A very common beginner confusion is to call <code>dumps</code> and then try to use the result as a dictionary.</p>
<h3>Walking through a loaded inventory</h3>
<p>Loops and dictionary reads from the previous module work unchanged:</p>
<pre class="code">import json

inv = json.loads('{"devices": [{"name": "A", "managed": true}, {"name": "B", "managed": false}, {"name": "C", "managed": true}]}')
managed = [d["name"] for d in inv["devices"] if d["managed"]]
print("Managed devices:", managed)
print("Count:", len(inv["devices"]))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Managed devices: ['A', 'C']
Count: 3</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) Using <code>json.load</code> on a string or <code>json.loads</code> on a file object: you get a <code>TypeError</code> or <code>AttributeError</code>. (2) Forgetting to open the file with <code>with open(...)</code>. (3) Calling <code>json.dumps(data)</code> and expecting a file to be written. (4) Reading a missing key and getting <code>KeyError</code>; use <code>data.get("key")</code> when the key may be absent.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which function turns a <b>string</b> into a Python dictionary? <code>loads</code>. Which writes a dictionary to a <b>file</b>? <code>dump</code>. The one with the s is for strings.</p></div>
<div class="scn"><h4>One byte too many</h4><p>A script saved device data with <code>str(data)</code> instead of <code>json.dump</code>. The saved file looked fine, but the next script crashed trying to load it, because <code>str</code> wrote <code>True</code> and single quotes. The fix was a one-line change to <code>json.dump(data, f, indent=2)</code>. From then on both scripts read and wrote the same valid JSON.</p>
<p><b>Lesson:</b> always write JSON with the json module, never with <code>str()</code> or <code>print()</code>.</p></div>
<div class="iv"><p class="q">"What is the difference between json.load and json.loads?"</p><p><code>load</code> reads JSON from a file object, <code>loads</code> from a string. The same pairing exists for <code>dump</code> and <code>dumps</code>. After loading, JSON objects become dictionaries and arrays become lists, with <code>true</code>, <code>false</code> and <code>null</code> becoming <code>True</code>, <code>False</code> and <code>None</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>loads</code> and <code>dumps</code> work with strings; <code>load</code> and <code>dump</code> work with files.</li>
<li>load means into Python, dump means out of Python.</li>
<li>JSON objects become dicts, arrays become lists, null becomes None.</li>
<li><code>json.dump(data, f, indent=2)</code> writes a readable file.</li>
<li>Never write JSON by printing a Python object; use the json module.</li>
</ul></div>
`,hi:`
<p>Python ke saath <code>json</code> naam ka module aata hai jo JSON padhne aur likhne ke liye hai. Uske chaar main functions hain. Woh ek jaise dikhte hain, isliye yeh chapter aapko yaad rakhne ki ek aasaan trick deta hai.</p>
<h3>"s" ka matlab string</h3>
<ul>
<li><code>json.loads(text)</code>: <b>string se load</b>. Text andar, Python data bahar.</li>
<li><code>json.load(file)</code>: <b>file object se load</b>. File andar, Python data bahar.</li>
<li><code>json.dumps(data)</code>: <b>string mein dump</b>. Python data andar, text bahar.</li>
<li><code>json.dump(data, file)</code>: <b>file object mein dump</b>. Python data andar, file likhi gayi.</li>
</ul>
<p>Trick: jis function mein <b>s</b> hai woh <b>s</b>tring ke saath kaam karta hai. Jis mein nahi woh file ke saath. Aur <b>load</b> ka matlab "Python mein", <b>dump</b> ka matlab "Python se bahar".</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Chaar functions"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Text ya file</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">disk par JSON</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">load</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">loads/text se Python</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Python data</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">dict aur list</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">dump</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">dumps/Python se text</text></svg><p class="cap">Chaar functions</p></div>
<h3>Text ko data mein load karna</h3>
<pre class="code">import json

text = '{"name": "HYD-CORE1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20, 30], "managed": true, "owner": null}'
device = json.loads(text)

print(type(device))
print(device["name"])
print(device["vlans"][1])
print(device["managed"], type(device["managed"]))
print(device["owner"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">&lt;class 'dict'&gt;
HYD-CORE1
20
True &lt;class 'bool'&gt;
None</pre>
<p>Text dictionary ban gaya. Aakhri do lines dekho: <code>true</code> <code>True</code> ban gaya, aur <code>null</code> <code>None</code>. Load ke baad aap ordinary Python use karte ho: keys, indexes, loops.</p>
<h3>File se load karna</h3>
<p>Lab 1 mein data <code>inventory.json</code> mein hai aur <code>show_inv.py</code> use <code>json.load</code> se padhti hai. Yeh self-contained version hai: pehle ek chhoti file likhta hai, phir wapas padhta hai.</p>
<pre class="code">import json

with open("inventory.json", "w") as f:
    f.write('{"site": "Hyderabad", "devices": [{"name": "HYD-CORE1", "vlans": [10, 20, 30]}, {"name": "HYD-ACC1", "vlans": [10, 20]}]}')

with open("inventory.json") as f:
    inv = json.load(f)

print("Site:", inv["site"])
for dev in inv["devices"]:
    print(dev["name"], dev["vlans"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Site: Hyderabad
HYD-CORE1 [10, 20, 30]
HYD-ACC1 [10, 20]</pre>
<h3>Data badalna aur wapas likhna</h3>
<p>Data ab dictionary hai, isliye use kisi bhi dictionary ki tarah edit karte ho. Phir <code>json.dump</code> use bahar likhta hai. <code>indent=2</code> argument file ko pretty banata hai. Uske bina sab kuch ek line mein aata hai.</p>
<pre class="code">import json

inv = {"site": "Hyderabad", "devices": [{"name": "HYD-CORE1", "vlans": [10, 20]}]}
inv["devices"][0]["vlans"].append(30)
inv["devices"].append({"name": "HYD-ACC2", "vlans": [10]})

with open("out.json", "w") as f:
    json.dump(inv, f, indent=2)

with open("out.json") as f:
    print(f.read())</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{
  "site": "Hyderabad",
  "devices": [
    {
      "name": "HYD-CORE1",
      "vlans": [
        10,
        20,
        30
      ]
    },
    {
      "name": "HYD-ACC2",
      "vlans": [
        10
      ]
    }
  ]
}</pre>
<p>Dhyaan do ki Python ke <code>True</code> aur <code>None</code> wapas <code>true</code> aur <code>null</code> ke roop mein likhe jaate hain, isliye program aapko soche bina valid JSON likh sakta hai. Isiliye JSON ko <code>json.dump</code> se likhte hain, Python ka printout paste karke kabhi nahi.</p>
<h3>dumps: text ke roop mein JSON</h3>
<p><code>json.dumps</code> data dikhane ya API request mein bhejne ke liye kaam ka hai. Kaam ke options: <code>indent=2</code> (pretty) aur <code>sort_keys=True</code> (alphabetical keys, do files compare karne ke liye achha).</p>
<pre class="code">import json

data = {"name": "R1", "up": True, "owner": None, "vlans": [10, 20]}
print(json.dumps(data))
print(json.dumps(data, indent=2, sort_keys=True))
print(type(json.dumps(data)))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{"name": "R1", "up": true, "owner": null, "vlans": [10, 20]}
{
  "name": "R1",
  "owner": null,
  "up": true,
  "vlans": [
    10,
    20
  ]
}
&lt;class 'str'&gt;</pre>
<p><code>type</code> <code>str</code> dikhata hai: <code>dumps</code> aapko <b>text</b> deta hai, dictionary nahi. Beginners ki bahut aam uljhan hai <code>dumps</code> call karke result ko dictionary ki tarah use karna.</p>
<h3>Load kiye hue inventory par chalna</h3>
<p>Pichhle module ke loops aur dictionary reads bina badle chalte hain:</p>
<pre class="code">import json

inv = json.loads('{"devices": [{"name": "A", "managed": true}, {"name": "B", "managed": false}, {"name": "C", "managed": true}]}')
managed = [d["name"] for d in inv["devices"] if d["managed"]]
print("Managed devices:", managed)
print("Count:", len(inv["devices"]))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Managed devices: ['A', 'C']
Count: 3</pre>
<div class="warn"><p><b>Common mistakes.</b> (1) String par <code>json.load</code> ya file object par <code>json.loads</code> use karna: <code>TypeError</code> ya <code>AttributeError</code> milta hai. (2) File ko <code>with open(...)</code> se kholna bhoolna. (3) <code>json.dumps(data)</code> call karke umeed karna ki file likhi jaayegi. (4) Missing key padhna aur <code>KeyError</code> paana; key absent ho sakti ho to <code>data.get("key")</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaun sa function <b>string</b> ko Python dictionary mein badalta hai? <code>loads</code>. Kaun dictionary ko <b>file</b> mein likhta hai? <code>dump</code>. Jis mein s hai woh strings ke liye hai.</p></div>
<div class="scn"><h4>Ek byte zyada</h4><p>Ek script ne device data <code>json.dump</code> ki jagah <code>str(data)</code> se save kiya. Saved file theek dikhti thi, lekin agli script use load karte hue crash hui, kyunki <code>str</code> ne <code>True</code> aur single quotes likhe the. Fix ek line ka tha <code>json.dump(data, f, indent=2)</code>. Uske baad dono scripts wahi valid JSON padhti aur likhti thi.</p>
<p><b>Lesson:</b> JSON hamesha json module se likho, <code>str()</code> ya <code>print()</code> se kabhi nahi.</p></div>
<div class="iv"><p class="q">"json.load aur json.loads mein kya difference hai?"</p><p><code>load</code> file object se JSON padhta hai, <code>loads</code> string se. Yahi jodi <code>dump</code> aur <code>dumps</code> mein hai. Load ke baad JSON objects dictionaries aur arrays lists ban jaate hain, aur <code>true</code>, <code>false</code> aur <code>null</code> <code>True</code>, <code>False</code> aur <code>None</code> ban jaate hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>loads</code> aur <code>dumps</code> strings ke saath; <code>load</code> aur <code>dump</code> files ke saath.</li>
<li>load matlab Python mein, dump matlab Python se bahar.</li>
<li>JSON objects dicts, arrays lists, null None ban jaata hai.</li>
<li><code>json.dump(data, f, indent=2)</code> readable file likhta hai.</li>
<li>JSON kabhi Python object print karke mat likho; json module use karo.</li>
</ul></div>
`}};export{e as default};