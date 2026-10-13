var e={id:`json-to-python`,h:{en:`From JSON text to Python data`,hi:`JSON text se Python data tak`},body:{en:`

<p>The router sends <b>text</b>. Your program wants <b>data</b> it can pick apart. The method <code>r.json()</code> does the conversion: JSON text goes in, and Python dictionaries and lists come out. This is the single most useful trick in API scripting.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="JSON becomes dictionaries and lists. Square brackets walk down the levels."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="90" y="60" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="10" y="90" width="160" height="50" rx="10" fill="#fde68a"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="14">["ietf-interfaces:interfaces"]</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="230" y="90" width="150" height="50" rx="10" fill="#bae6fd"/><text x="305" y="112" text-anchor="middle" class="svg-ink" font-size="14">["interface"]</text><text x="305" y="130" text-anchor="middle" class="svg-muted" font-size="12">list of 5</text><rect x="440" y="90" width="90" height="50" rx="10" fill="#bbf7d0"/><text x="485" y="112" text-anchor="middle" class="svg-ink" font-size="14">[0]</text><text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="545" y="90" width="85" height="50" rx="10" fill="#fed7aa"/><text x="587.5" y="112" text-anchor="middle" class="svg-ink" font-size="14">["name"]</text><text x="587.5" y="130" text-anchor="middle" class="svg-muted" font-size="12">str</text><line x1="90" y1="70" x2="90" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="170" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="380" y1="115" x2="440" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="530" y1="115" x2="545" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="13">Read it left to right: each [ ] goes one level deeper</text></svg><p class="cap">JSON becomes dictionaries and lists. Square brackets walk down the levels.</p></div>

<h3>Walking down the data</h3>
<p>Read the script slowly. After <code>data = r.json()</code> the variable <code>data</code> is a dictionary. Each pair of square brackets picks one key (in a dictionary) or one position (in a list, counting from 0):</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
data = r.json()
print(type(data))
print(list(data.keys()))
interfaces = data["ietf-interfaces:interfaces"]["interface"]
print(type(interfaces), len(interfaces))
first = interfaces[0]
print(first["name"], first["enabled"], first["oper-status"])
print(first["ietf-ip:ipv4"]["address"][0]["ip"])
for i in interfaces:
    print(i["name"], i["enabled"])
print(first.get("description", "no description"))
print(interfaces[1].get("description", "no description"))
print(interfaces[2]["description"])</pre><pre class="out">AUTO&gt; python3 c.py
<span class="hl">&lt;class 'dict'&gt;</span>
['ietf-interfaces:interfaces']
&lt;class 'list'&gt; 5
<span class="hl">GigabitEthernet0/0 True up</span>
<span class="hl">10.99.0.1</span>
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
Loopback0 True
MGMT
WAN-JIO
SPARE</pre>
<p>What each part of the output shows:</p>
<ul>
<li><code>&lt;class 'dict'&gt;</code>: <code>r.json()</code> returned a dictionary. <code>list(data.keys())</code> shows it has just one key, <code>ietf-interfaces:interfaces</code>.</li>
<li><code>&lt;class 'list'&gt; 5</code>: below that key, <code>["interface"]</code> is a list with 5 entries, one per interface.</li>
<li><code>interfaces[0]</code> is the <b>first</b> interface (lists count from zero). We read its <code>name</code>, <code>enabled</code> and <code>oper-status</code>.</li>
<li>The IP address sits deeper: <code>["ietf-ip:ipv4"]["address"][0]["ip"]</code>. Notice another list, <code>address</code>, because an interface can have several addresses.</li>
<li><code>for i in interfaces:</code> runs the indented line once for every interface. The name <code>i</code> is a new variable that holds the current one. That is how we printed all five.</li>
</ul>

<h3>When a key is missing: get() and KeyError</h3>
<p>Not every interface has a description. <code>first.get("description", "no description")</code> asks "give me this key, or a default if it is missing". Look at the three lines at the end of the output: the first interface answered <code>MGMT</code> (the key exists, so we got it), the second <code>WAN-JIO</code>, and the third <code>SPARE</code>. In this lab all three have a description, but the safe pattern is always <code>.get()</code> for optional keys.</p>
<p>Square brackets on a missing key raise an error called <b>KeyError</b>, and a typo does the same. Here the key is spelled <code>descriptio</code>:</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
interfaces = r.json()["ietf-interfaces:interfaces"]["interface"]
print(interfaces[0]["descriptio"])</pre><pre class="out">AUTO&gt; python3 c2.py
Traceback (most recent call last):
  File "c2.py", line 5, in &lt;module&gt;
    print(interfaces[0]["descriptio"])
<span class="hl">KeyError: 'descriptio'</span></pre>
<p>Read a traceback from the bottom: the last line says what went wrong (KeyError: 'descriptio'), the line above shows which line of your code. The key was not found, so the fix is the spelling.</p>

<h3>One interface at a time</h3>
<p>You can also ask the router for just one interface. The reply is a smaller dictionary, with the module and the object name as the single top-level key:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r.status_code)
print(r.json())</pre><pre class="out">AUTO&gt; python3 d.py
<span class="hl">200</span>
<span class="hl">{'ietf-interfaces:interface': {'name': 'Loopback0', 'type': 'iana-if-type:softwareLoopback', 'enabled': True, 'ietf-ip:ipv4': {'address': [{'ip': '1.1.1.1', 'netmask': '255.255.255.255'}]}, 'ietf-ip:ipv6': {}, 'oper-status': 'up', 'phys-address': '52:54:0c:04:4b:05', 'statistics': {'in-octets': '0', 'in-unicast-pkts': '0', 'out-octets': '0', 'out-unicast-pkts': '0'}}}</span></pre>
<p>Because it is one object, there is no list: the next step is <code>r.json()["ietf-interfaces:interface"]["name"]</code>.</p>

<div class="eg"><p><b>Worked example.</b> Question: "What is the IP address of the first interface?" Start at the top and walk: <code>data</code>, then <code>["ietf-interfaces:interfaces"]</code>, then <code>["interface"]</code>, then <code>[0]</code>, then <code>["ietf-ip:ipv4"]</code>, then <code>["address"]</code>, then <code>[0]</code>, then <code>["ip"]</code>. The answer is 10.99.0.1. If it fails, print the variable at the last step that worked and look at what is inside.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Using <code>r.text["name"]</code>: text is a string, so convert with <code>r.json()</code> first. (2) Counting from 1: the first list item is <code>[0]</code>. (3) Forgetting the module prefix in a key: it is <code>"ietf-ip:ipv4"</code>, not <code>"ipv4"</code>. (4) Calling <code>r.json()</code> on a reply that has no body (a 204) or is not JSON: it fails. Check the status first.</p></div>
<div class="exam"><p><b>Exam trap.</b> JSON object becomes a Python dict, JSON array becomes a list, true becomes True, null becomes None. Lists use numeric index starting at 0. <code>dict.get(key, default)</code> avoids KeyError.</p></div>

<div class="scn"><h4>The nightly report with a hole</h4><p>A report script read <code>i["description"]</code> for every interface. It worked for weeks, then stopped with a KeyError the day a new interface without a description was added. Replacing it with <code>i.get("description", "none")</code> made the report robust.</p><p><b>Lesson:</b> use get() for optional keys, brackets for keys that must exist.</p></div>

<div class="iv"><p class="q">"How do you extract a value from a RESTCONF reply in Python?"</p><p>I call <code>r.json()</code> to get dictionaries and lists, then walk down with keys and list indexes, for example the interface list, then item zero, then the name. For optional fields I use <code>.get()</code> with a default, and I print the intermediate variable to check the shape when I am unsure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>r.json()</code> turns JSON text into dicts and lists.</li>
<li>Square brackets pick a key in a dict or a position (from 0) in a list.</li>
<li><code>for item in list:</code> repeats the indented block for each item.</li>
<li>.get(key, default) is safe; a missing key with [ ] gives KeyError.</li>
<li>Read tracebacks from the bottom up.</li>
</ul></div>

`,hi:`

<p>Router <b>text</b> bhejta hai. Aapka program <b>data</b> chahta hai jise woh todkar dekh sake. <code>r.json()</code> method yeh badlav karta hai: JSON text andar jaata hai, aur Python dictionaries aur lists bahar aati hain. API scripting ki sabse kaam ki trick yahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="JSON dictionaries aur lists ban jaata hai. Square brackets level-level andar jaate hain."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="90" y="42" text-anchor="middle" class="svg-ink" font-size="14">data</text><text x="90" y="60" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="10" y="90" width="160" height="50" rx="10" fill="#fde68a"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="14">["ietf-interfaces:interfaces"]</text><text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="230" y="90" width="150" height="50" rx="10" fill="#bae6fd"/><text x="305" y="112" text-anchor="middle" class="svg-ink" font-size="14">["interface"]</text><text x="305" y="130" text-anchor="middle" class="svg-muted" font-size="12">list of 5</text><rect x="440" y="90" width="90" height="50" rx="10" fill="#bbf7d0"/><text x="485" y="112" text-anchor="middle" class="svg-ink" font-size="14">[0]</text><text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="545" y="90" width="85" height="50" rx="10" fill="#fed7aa"/><text x="587.5" y="112" text-anchor="middle" class="svg-ink" font-size="14">["name"]</text><text x="587.5" y="130" text-anchor="middle" class="svg-muted" font-size="12">str</text><line x1="90" y1="70" x2="90" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="170" y1="115" x2="230" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="380" y1="115" x2="440" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="530" y1="115" x2="545" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="13">Left se right padho: har [ ] ek level andar jaata hai</text></svg><p class="cap">JSON dictionaries aur lists ban jaata hai. Square brackets level-level andar jaate hain.</p></div>

<h3>Data mein neeche chalna</h3>
<p>Script dheere padho. <code>data = r.json()</code> ke baad variable <code>data</code> dictionary hai. Square brackets ki har jodi ek key (dictionary mein) ya ek position (list mein, 0 se ginti) chunti hai:</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
data = r.json()
print(type(data))
print(list(data.keys()))
interfaces = data["ietf-interfaces:interfaces"]["interface"]
print(type(interfaces), len(interfaces))
first = interfaces[0]
print(first["name"], first["enabled"], first["oper-status"])
print(first["ietf-ip:ipv4"]["address"][0]["ip"])
for i in interfaces:
    print(i["name"], i["enabled"])
print(first.get("description", "no description"))
print(interfaces[1].get("description", "no description"))
print(interfaces[2]["description"])</pre><pre class="out">AUTO&gt; python3 c.py
<span class="hl">&lt;class 'dict'&gt;</span>
['ietf-interfaces:interfaces']
&lt;class 'list'&gt; 5
<span class="hl">GigabitEthernet0/0 True up</span>
<span class="hl">10.99.0.1</span>
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
Loopback0 True
MGMT
WAN-JIO
SPARE</pre>
<p>Output ka har hissa kya dikhata hai:</p>
<ul>
<li><code>&lt;class 'dict'&gt;</code>: <code>r.json()</code> ne dictionary di. <code>list(data.keys())</code> dikhata hai ki bas ek key hai, <code>ietf-interfaces:interfaces</code>.</li>
<li><code>&lt;class 'list'&gt; 5</code>: us key ke neeche <code>["interface"]</code> 5 entries ki list hai, har interface ke liye ek.</li>
<li><code>interfaces[0]</code> <b>pehla</b> interface hai (lists zero se ginti shuru karti hain). Hum uska <code>name</code>, <code>enabled</code> aur <code>oper-status</code> padhte hain.</li>
<li>IP address aur gehre hai: <code>["ietf-ip:ipv4"]["address"][0]["ip"]</code>. Ek aur list <code>address</code> dekho, kyunki ek interface ke kai addresses ho sakte hain.</li>
<li><code>for i in interfaces:</code> indented line ko har interface ke liye ek baar chalata hai. Naam <code>i</code> naya variable hai jisme maujooda interface hota hai. Isi se hamne paanchon print kiye.</li>
</ul>

<h3>Key missing ho to: get() aur KeyError</h3>
<p>Har interface ka description nahi hota. <code>first.get("description", "no description")</code> kehta hai "yeh key do, ya missing ho to default do". Output ki aakhri teen lines dekho: pehle interface ne <code>MGMT</code> diya (key hai, isliye mili), doosre ne <code>WAN-JIO</code>, teesre ne <code>SPARE</code>. Is lab mein teeno ka description hai, par optional keys ke liye safe pattern hamesha <code>.get()</code> hai.</p>
<p>Missing key par square brackets <b>KeyError</b> naam ka error dete hain, aur typo bhi yahi deta hai. Yahan key ki spelling <code>descriptio</code> hai:</p>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
interfaces = r.json()["ietf-interfaces:interfaces"]["interface"]
print(interfaces[0]["descriptio"])</pre><pre class="out">AUTO&gt; python3 c2.py
Traceback (most recent call last):
  File "c2.py", line 5, in &lt;module&gt;
    print(interfaces[0]["descriptio"])
<span class="hl">KeyError: 'descriptio'</span></pre>
<p>Traceback neeche se padho: aakhri line batati hai kya galat hua (KeyError: 'descriptio'), uske upar ki line batati hai aapke code ki kaunsi line. Key nahi mili, isliye fix spelling hai.</p>

<h3>Ek-ek interface</h3>
<p>Aap router se sirf ek interface bhi maang sakte ho. Reply chhoti dictionary hoti hai, jisme module aur object ka naam akela top-level key hota hai:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r.status_code)
print(r.json())</pre><pre class="out">AUTO&gt; python3 d.py
<span class="hl">200</span>
<span class="hl">{'ietf-interfaces:interface': {'name': 'Loopback0', 'type': 'iana-if-type:softwareLoopback', 'enabled': True, 'ietf-ip:ipv4': {'address': [{'ip': '1.1.1.1', 'netmask': '255.255.255.255'}]}, 'ietf-ip:ipv6': {}, 'oper-status': 'up', 'phys-address': '52:54:0c:04:4b:05', 'statistics': {'in-octets': '0', 'in-unicast-pkts': '0', 'out-octets': '0', 'out-unicast-pkts': '0'}}}</span></pre>
<p>Kyunki yeh ek object hai, list nahi hai: agla step <code>r.json()["ietf-interfaces:interface"]["name"]</code> hai.</p>

<div class="eg"><p><b>Worked example.</b> Sawaal: "Pehle interface ka IP address kya hai?" Upar se shuru karke chalo: <code>data</code>, phir <code>["ietf-interfaces:interfaces"]</code>, phir <code>["interface"]</code>, phir <code>[0]</code>, phir <code>["ietf-ip:ipv4"]</code>, phir <code>["address"]</code>, phir <code>[0]</code>, phir <code>["ip"]</code>. Jawab 10.99.0.1. Fail ho to aakhri chalte hue step ka variable print karke dekho andar kya hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) <code>r.text["name"]</code> use karna: text string hai, pehle <code>r.json()</code> se convert karo. (2) 1 se ginna: list ka pehla item <code>[0]</code> hai. (3) Key mein module prefix bhool jaana: <code>"ietf-ip:ipv4"</code> hai, <code>"ipv4"</code> nahi. (4) <code>r.json()</code> aise reply par chalana jisme body nahi (204) ya JSON nahi: fail hota hai. Pehle status check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> JSON object Python dict banta hai, JSON array list, true True aur null None. Lists mein numeric index 0 se shuru. <code>dict.get(key, default)</code> KeyError se bachata hai.</p></div>

<div class="scn"><h4>Chhed wali nightly report</h4><p>Ek report script har interface ke liye <code>i["description"]</code> padhti thi. Hafton chali, phir ek din bina description wala naya interface judte hi KeyError se ruk gayi. <code>i.get("description", "none")</code> se report robust ho gayi.</p><p><b>Lesson:</b> optional keys ke liye get(), jo key hona hi chahiye uske liye brackets.</p></div>

<div class="iv"><p class="q">"RESTCONF reply se Python mein value kaise nikalte ho?"</p><p>Main <code>r.json()</code> se dictionaries aur lists leta hoon, phir keys aur list indexes se neeche chalta hoon, jaise interface list, phir item zero, phir name. Optional fields ke liye default ke saath <code>.get()</code> use karta hoon, aur shape pakki na ho to beech ka variable print karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>r.json()</code> JSON text ko dicts aur lists mein badalta hai.</li>
<li>Square brackets dict mein key ya list mein position (0 se) chunte hain.</li>
<li><code>for item in list:</code> indented block ko har item ke liye dohrata hai.</li>
<li>.get(key, default) safe hai; [ ] se missing key KeyError deti hai.</li>
<li>Traceback neeche se upar padho.</li>
</ul></div>

`}};export{e as default};