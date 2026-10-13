var e={id:`lists-dicts`,h:{en:`Lists, dictionaries and nesting`,hi:`Lists, dictionaries aur nesting`},body:{en:`
<p>A single variable holds one value. Real network data is never one value: it is 48 interfaces, 12 VLANs, 200 devices each with a name, an IP and a model. Python has two workhorse containers for that. A <b>list</b> is like a train: carriages in a fixed order, numbered from the front. A <b>dictionary</b> is like your phone's contact list: you look up a name (the <b>key</b>) and get the number (the <b>value</b>), and the position does not matter.</p>

<h3>Lists: ordered collections</h3>
<p>A list is written in square brackets with commas between items. Items can be any type, and the list can grow and shrink (it is <b>mutable</b>).</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
vlans = [10, 20, 30]

print(routers[0])        <span class="c"># first item: 10.99.0.1</span>
print(vlans[-1])         <span class="c"># last item: 30</span>
print(len(routers))      <span class="c"># 3</span>
vlans.append(40)         <span class="c"># add at the end: [10, 20, 30, 40]</span>
vlans.remove(20)         <span class="c"># remove the value 20: [10, 30, 40]</span>
print(30 in vlans)       <span class="c"># True</span>
print(vlans[0:2])        <span class="c"># slice: [10, 30]</span>
print(sorted([30, 10, 20]))   <span class="c"># [10, 20, 30], a new sorted list</span></pre>
<p>Indexing and slicing work exactly as with strings. <code>.split()</code> on a string <b>returns a list</b>, which is why lists appear the moment you start parsing output: <code>"Gi0/0 10.99.0.1 YES manual up up".split()</code> is a list of six strings.</p>

<h3>Tuples and sets, briefly</h3>
<p>A <b>tuple</b> is written in round brackets, <code>("10.99.0.1", 22)</code>, and cannot be changed after creation. Use it for fixed pairs such as host and port. A <b>set</b>, written <code>{10, 20, 30}</code>, holds unique items with no order. Sets are perfect for audits: <code>expected - actual</code> gives the VLANs that are missing.</p>
<pre class="out">&gt;&gt;&gt; expected = {10, 20, 30}
&gt;&gt;&gt; actual = {1, 10, 30}
&gt;&gt;&gt; expected - actual
<span class="hl">{20}</span></pre>

<h3>Dictionaries: look things up by name</h3>
<p>A dictionary (<b>dict</b>) is written in curly braces with <code>key: value</code> pairs. Keys are usually strings and must be unique; values can be anything.</p>
<pre class="code">device = {
    "device_type": "nk_ios",
    "host": "10.99.0.1",
    "username": "netops",
    "password": "NK@2026",
}
print(device["host"])              <span class="c"># 10.99.0.1</span>
device["port"] = 22                <span class="c"># add a new key</span>
device["host"] = "10.99.0.2"       <span class="c"># change an existing value</span>
print(device.get("secret"))        <span class="c"># None: missing key, no crash</span>
print(device.get("secret", ""))    <span class="c"># "" : your own default</span>
print("username" in device)        <span class="c"># True: in tests the keys</span>
for key, value in device.items():  <span class="c"># walk every pair</span>
    print(key, "=", value)</pre>
<p>Asking for a key that does not exist with square brackets raises <code>KeyError</code>; <code>.get()</code> returns <code>None</code> (or your default) instead. Since Python 3.7 a dict remembers the order in which keys were added. <code>.keys()</code>, <code>.values()</code> and <code>.items()</code> give the keys, the values, and the (key, value) pairs.</p>
<p>The lab script keeps its login details in a dict called <code>CREDS</code> and passes it with <code>ConnectHandler(host=ip, **CREDS)</code>. The two stars <b>unpack</b> the dict into named arguments, exactly as if you had typed <code>device_type="nk_ios", username="netops", password=...</code> by hand.</p>

<h3>Nesting: lists of dicts, dicts of lists</h3>
<p>Real data is nested: a site has switches, each switch has VLANs, each VLAN has an ID and a name. You reach inside by chaining index and key lookups from left to right. This is the most important skill for reading API responses and JSON, so practise it until it is automatic.</p>
<pre class="code">plan = {
    "site": "Pune-Campus",
    "switches": [
        {"name": "ACC-SW1", "mgmt": "10.99.0.11",
         "vlans": [{"id": 10, "name": "SALES"}, {"id": 20, "name": "HR"}]},
        {"name": "ACC-SW2", "mgmt": "10.99.0.12",
         "vlans": [{"id": 10, "name": "SALES"}, {"id": 30, "name": "VOICE"}]},
    ],
}
print(plan["switches"][0]["name"])               <span class="c"># ACC-SW1</span>
print(plan["switches"][0]["vlans"][1]["name"])   <span class="c"># HR</span>
print(len(plan["switches"][1]["vlans"]))         <span class="c"># 2</span></pre>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Walking a nested structure">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">plan (dict)</text>
<rect x="175" y="20" width="140" height="40" rx="8" fill="#bae6fd"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="13">["switches"] list</text>
<rect x="350" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="410" y="45" text-anchor="middle" class="svg-ink" font-size="13">[0] dict</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">["vlans"] list</text>
<rect x="500" y="100" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">[1] dict</text>
<rect x="500" y="175" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="200" text-anchor="middle" class="svg-ink" font-size="13">"HR"</text>
<line x1="140" y1="40" x2="175" y2="40" stroke="#64748b" stroke-width="2"/><line x1="315" y1="40" x2="350" y2="40" stroke="#64748b" stroke-width="2"/><line x1="470" y1="40" x2="500" y2="40" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="60" x2="560" y2="100" stroke="#64748b" stroke-width="2"/><line x1="560" y1="140" x2="560" y2="175" stroke="#64748b" stroke-width="2"/><text x="490" y="163" text-anchor="end" class="svg-accent" font-size="12">["name"]</text>
<text x="20" y="110" class="svg-muted" font-size="12">Each step: dict -&gt; use a key in quotes</text>
<text x="20" y="132" class="svg-muted" font-size="12">list -&gt; use a number, starting at 0</text>
</svg><p class="cap">plan["switches"][0]["vlans"][1]["name"]: one step per bracket, left to right.</p></div>

<div class="eg"><p><b>Worked example.</b> Using <code>plan</code> above: <code>plan["switches"][1]["mgmt"]</code> is <code>"10.99.0.12"</code>. <code>plan["switches"][1]["vlans"][-1]["id"]</code> is <code>30</code> (an int). <code>plan["switches"][2]</code> raises <code>IndexError</code>, because there are only two switches (indexes 0 and 1). <code>plan["switches"][0]["vlan"]</code> raises <code>KeyError: 'vlan'</code>, because the key is spelled <code>vlans</code>. <code>plan["site"][0]</code> is <code>"P"</code>: indexing a string gives a character.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>[1]</code> for the first item (it is the second); spelling a key differently from the data (<code>"Name"</code> versus <code>"name"</code>: keys are case-sensitive); using a number on a dict or a key on a list (<code>TypeError: list indices must be integers or slices, not str</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> A question shows a nested structure and an expression; count brackets carefully and remember that every list starts at 0. Also know the difference: <code>d["x"]</code> raises KeyError for a missing key, <code>d.get("x")</code> returns None. And <code>in</code> on a dict checks keys, not values.</p></div>

<div class="scn"><h4>The inventory that changed its keys</h4><p>A backup script read an inventory list maintained by another team and crashed on the first device with <code>KeyError: 'mgmt_ip'</code>. The other team had renamed the key to <code>mgmt</code> in their export. Nobody had changed the network. The engineer printed <code>inventory[0].keys()</code>, saw the new name, and changed the script to use <code>dev.get("mgmt") or dev.get("mgmt_ip")</code> and to log and skip any device that had neither, instead of stopping the whole backup.</p><p><b>Lesson:</b> when a KeyError appears, print the keys you actually have; data from other systems changes shape more often than networks do.</p></div>

<div class="iv"><p class="q">"When would you use a list and when a dictionary in a network script?"</p><p>Strong answer: a list when order or position matters and items are alike, such as the IP addresses to poll or the lines of output; a dictionary when you look things up by a name, such as one device's properties, or a report keyed by hostname. Real data combines them: a list of device dicts, or a dict of hostname to list of VLANs. Mention <code>.get()</code> to avoid KeyError and sets for quick "expected minus actual" comparisons.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List <code>[ ]</code>: ordered, indexed from 0, mutable; <code>append</code>, <code>remove</code>, <code>len</code>, <code>in</code>, slices.</li>
<li>Dict <code>{key: value}</code>: look up by key; missing key with <code>[ ]</code> is KeyError, <code>.get()</code> returns None.</li>
<li><code>.items()</code> gives key and value pairs for loops; <code>**dict</code> unpacks into named arguments.</li>
<li>Tuples are fixed; sets hold unique items and make audits easy with subtraction.</li>
<li>Read nested data one bracket at a time: key in quotes for a dict, number for a list.</li>
</ul></div>
`,hi:`
<p>Ek variable ek value rakhta hai. Asli network data kabhi ek value nahi hota: 48 interfaces, 12 VLANs, 200 devices jinme har ek ka naam, IP aur model hai. Iske liye Python mein do mehnati containers hain. <b>List</b> train jaisi hai: dibbe ek fixed order mein, aage se numbered. <b>Dictionary</b> aapke phone ki contact list jaisi hai: aap ek naam (<b>key</b>) dhoondhte ho aur number (<b>value</b>) milta hai, aur position matter nahi karti.</p>

<h3>Lists: ordered collections</h3>
<p>List square brackets mein likhi jaati hai, items ke beech commas. Items kisi bhi type ke ho sakte hain, aur list badh aur ghat sakti hai (woh <b>mutable</b> hai).</p>
<pre class="code">routers = ["10.99.0.1", "10.99.0.2", "10.99.0.3"]
vlans = [10, 20, 30]

print(routers[0])        <span class="c"># pehla item: 10.99.0.1</span>
print(vlans[-1])         <span class="c"># aakhri item: 30</span>
print(len(routers))      <span class="c"># 3</span>
vlans.append(40)         <span class="c"># end mein jodo: [10, 20, 30, 40]</span>
vlans.remove(20)         <span class="c"># value 20 hatao: [10, 30, 40]</span>
print(30 in vlans)       <span class="c"># True</span>
print(vlans[0:2])        <span class="c"># slice: [10, 30]</span>
print(sorted([30, 10, 20]))   <span class="c"># [10, 20, 30], nayi sorted list</span></pre>
<p>Indexing aur slicing bilkul strings jaise kaam karte hain. String par <code>.split()</code> <b>list return karta hai</b>, isliye output parse karna shuru karte hi lists aa jaati hain: <code>"Gi0/0 10.99.0.1 YES manual up up".split()</code> chhe strings ki list hai.</p>

<h3>Tuples aur sets, sankshep mein</h3>
<p><b>Tuple</b> round brackets mein likha jaata hai, <code>("10.99.0.1", 22)</code>, aur banne ke baad badal nahi sakta. Host aur port jaise fixed pairs ke liye use karo. <b>Set</b>, <code>{10, 20, 30}</code> jaisa likha, bina order ke unique items rakhta hai. Sets audits ke liye perfect hain: <code>expected - actual</code> missing VLANs deta hai.</p>
<pre class="out">&gt;&gt;&gt; expected = {10, 20, 30}
&gt;&gt;&gt; actual = {1, 10, 30}
&gt;&gt;&gt; expected - actual
<span class="hl">{20}</span></pre>

<h3>Dictionaries: naam se cheezein dhoondho</h3>
<p>Dictionary (<b>dict</b>) curly braces mein <code>key: value</code> pairs ke saath likhi jaati hai. Keys aam taur par strings hoti hain aur unique honi chahiye; values kuch bhi ho sakti hain.</p>
<pre class="code">device = {
    "device_type": "nk_ios",
    "host": "10.99.0.1",
    "username": "netops",
    "password": "NK@2026",
}
print(device["host"])              <span class="c"># 10.99.0.1</span>
device["port"] = 22                <span class="c"># nayi key jodo</span>
device["host"] = "10.99.0.2"       <span class="c"># maujooda value badlo</span>
print(device.get("secret"))        <span class="c"># None: key missing, crash nahi</span>
print(device.get("secret", ""))    <span class="c"># "" : aapka apna default</span>
print("username" in device)        <span class="c"># True: in keys test karta hai</span>
for key, value in device.items():  <span class="c"># har pair par chalo</span>
    print(key, "=", value)</pre>
<p>Square brackets se aisi key maangna jo exist nahi karti <code>KeyError</code> deta hai; <code>.get()</code> uski jagah <code>None</code> (ya aapka default) return karta hai. Python 3.7 se dict yaad rakhti hai ki keys kis order mein jodi gayi. <code>.keys()</code>, <code>.values()</code> aur <code>.items()</code> keys, values, aur (key, value) pairs dete hain.</p>
<p>Lab script apni login details <code>CREDS</code> naam ki dict mein rakhta hai aur <code>ConnectHandler(host=ip, **CREDS)</code> se pass karta hai. Do stars dict ko named arguments mein <b>unpack</b> karte hain, bilkul waise jaise aapne haath se <code>device_type="nk_ios", username="netops", password=...</code> type kiya ho.</p>

<h3>Nesting: dicts ki lists, lists ki dicts</h3>
<p>Asli data nested hota hai: ek site mein switches hain, har switch mein VLANs, har VLAN ka ID aur naam. Andar pahunchne ke liye aap index aur key lookups ko left se right chain karte ho. API responses aur JSON padhne ki yeh sabse zaroori skill hai, isliye tab tak practice karo jab tak automatic na ho jaaye.</p>
<pre class="code">plan = {
    "site": "Pune-Campus",
    "switches": [
        {"name": "ACC-SW1", "mgmt": "10.99.0.11",
         "vlans": [{"id": 10, "name": "SALES"}, {"id": 20, "name": "HR"}]},
        {"name": "ACC-SW2", "mgmt": "10.99.0.12",
         "vlans": [{"id": 10, "name": "SALES"}, {"id": 30, "name": "VOICE"}]},
    ],
}
print(plan["switches"][0]["name"])               <span class="c"># ACC-SW1</span>
print(plan["switches"][0]["vlans"][1]["name"])   <span class="c"># HR</span>
print(len(plan["switches"][1]["vlans"]))         <span class="c"># 2</span></pre>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Nested structure mein chalna">
<rect x="20" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">plan (dict)</text>
<rect x="175" y="20" width="140" height="40" rx="8" fill="#bae6fd"/><text x="245" y="45" text-anchor="middle" class="svg-ink" font-size="13">["switches"] list</text>
<rect x="350" y="20" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="410" y="45" text-anchor="middle" class="svg-ink" font-size="13">[0] dict</text>
<rect x="500" y="20" width="120" height="40" rx="8" fill="#bae6fd"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="13">["vlans"] list</text>
<rect x="500" y="100" width="120" height="40" rx="8" fill="#ddd6fe"/><text x="560" y="125" text-anchor="middle" class="svg-ink" font-size="13">[1] dict</text>
<rect x="500" y="175" width="120" height="40" rx="8" fill="#bbf7d0"/><text x="560" y="200" text-anchor="middle" class="svg-ink" font-size="13">"HR"</text>
<line x1="140" y1="40" x2="175" y2="40" stroke="#64748b" stroke-width="2"/><line x1="315" y1="40" x2="350" y2="40" stroke="#64748b" stroke-width="2"/><line x1="470" y1="40" x2="500" y2="40" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="60" x2="560" y2="100" stroke="#64748b" stroke-width="2"/><line x1="560" y1="140" x2="560" y2="175" stroke="#64748b" stroke-width="2"/><text x="490" y="163" text-anchor="end" class="svg-accent" font-size="12">["name"]</text>
<text x="20" y="110" class="svg-muted" font-size="12">Har step: dict -&gt; quotes mein key</text>
<text x="20" y="132" class="svg-muted" font-size="12">list -&gt; number, 0 se shuru</text>
</svg><p class="cap">plan["switches"][0]["vlans"][1]["name"]: har bracket ek step, left se right.</p></div>

<div class="eg"><p><b>Worked example.</b> Upar wale <code>plan</code> se: <code>plan["switches"][1]["mgmt"]</code> <code>"10.99.0.12"</code> hai. <code>plan["switches"][1]["vlans"][-1]["id"]</code> <code>30</code> hai (ek int). <code>plan["switches"][2]</code> <code>IndexError</code> deta hai, kyunki sirf do switches hain (indexes 0 aur 1). <code>plan["switches"][0]["vlan"]</code> <code>KeyError: 'vlan'</code> deta hai, kyunki key ki spelling <code>vlans</code> hai. <code>plan["site"][0]</code> <code>"P"</code> hai: string ko index karne se ek character milta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Pehle item ke liye <code>[1]</code> use karna (woh doosra hai); key ki spelling data se alag likhna (<code>"Name"</code> vs <code>"name"</code>: keys case-sensitive hain); dict par number ya list par key use karna (<code>TypeError: list indices must be integers or slices, not str</code>).</p></div>

<div class="exam"><p><b>Exam trap.</b> Question ek nested structure aur ek expression dikhata hai; brackets dhyan se gino aur yaad rakho ki har list 0 se shuru hoti hai. Fark bhi jaano: <code>d["x"]</code> missing key par KeyError deta hai, <code>d.get("x")</code> None return karta hai. Aur dict par <code>in</code> keys check karta hai, values nahi.</p></div>

<div class="scn"><h4>Inventory jisne apni keys badal di</h4><p>Ek backup script doosri team ki maintain ki hui inventory list padhta tha aur pehle hi device par <code>KeyError: 'mgmt_ip'</code> ke saath crash ho gaya. Doosri team ne apne export mein key ka naam <code>mgmt</code> kar diya tha. Network mein kisi ne kuch nahi badla tha. Engineer ne <code>inventory[0].keys()</code> print kiya, naya naam dekha, aur script ko <code>dev.get("mgmt") or dev.get("mgmt_ip")</code> use karne ke liye badla, aur jis device mein dono na hon use poora backup rokne ki jagah log karke skip karne ke liye.</p><p><b>Seekh:</b> jab KeyError aaye, jo keys aapke paas asal mein hain unhe print karo; doosre systems ka data networks se zyada baar shape badalta hai.</p></div>

<div class="iv"><p class="q">"Network script mein aap list kab use karoge aur dictionary kab?"</p><p>Strong answer: list tab jab order ya position matter kare aur items ek jaise hon, jaise poll karne wale IP addresses ya output ki lines; dictionary tab jab aap naam se cheezein dhoondhte ho, jaise ek device ki properties, ya hostname se keyed report. Asli data dono ko jodta hai: device dicts ki list, ya hostname se VLANs ki list wali dict. KeyError se bachne ke liye <code>.get()</code> aur jaldi "expected minus actual" comparison ke liye sets batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>List <code>[ ]</code>: ordered, 0 se indexed, mutable; <code>append</code>, <code>remove</code>, <code>len</code>, <code>in</code>, slices.</li>
<li>Dict <code>{key: value}</code>: key se lookup; <code>[ ]</code> se missing key KeyError hai, <code>.get()</code> None deta hai.</li>
<li><code>.items()</code> loops ke liye key aur value pairs deta hai; <code>**dict</code> named arguments mein unpack karta hai.</li>
<li>Tuples fixed hain; sets unique items rakhte hain aur subtraction se audits aasaan banate hain.</li>
<li>Nested data ek bracket ek baar padho: dict ke liye quotes mein key, list ke liye number.</li>
</ul></div>
`}};export{e as default};