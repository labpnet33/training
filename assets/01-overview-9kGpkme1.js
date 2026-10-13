var e={id:`overview`,h:{en:`Why structured data? JSON, YAML and XML in one picture`,hi:`Structured data kyun? JSON, YAML aur XML ek tasveer mein`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn to read, write and repair the three data formats that network automation runs on: <b>JSON</b>, <b>YAML</b> and <b>XML</b>. You will load them into Python, change them, convert one into another, and find a syntax mistake quickly when a file will not load. In the labs you repair an <code>inventory.json</code> that nobody can read and a <code>vlans.yml</code> that makes a config generator crash, then grow a network by editing only data. This is part of the CCNP Automation (350-901 AUTOCOR) track.</p>
<p><b>Prerequisites.</b> The previous modules: Python 1 (variables, strings), Python 2 (lists, dictionaries, loops) and Python 3 (functions, files and exceptions). You do not need to know any of the three formats yet.</p>
<h3>Analogy: a letter versus a form</h3>
<p>A letter says "Please send the parcel to Mr Rao, flat 12, Tower B, Pune 411001". A human reads it easily. A machine cannot reliably tell where the name ends and the address begins. Now look at a <b>form</b>: boxes labelled *Name*, *Flat*, *Tower*, *City*, *Pincode*, each box with its value. A machine can read a form without guessing, because every value has a label and a fixed place. <b>Structured data</b> is a form that a computer can read. JSON, YAML and XML are three ways of drawing the form.</p>
<h3>The problem with CLI text</h3>
<p>The output of <code>show ip interface brief</code> is a letter for humans. To use it in a program you must cut it with <code>split()</code> or regular expressions, and the cuts break the moment a column changes. The next module teaches that skill. But APIs, automation tools and source-of-truth files do not use letters; they exchange forms. So you must be fluent in them.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Same information, three ways to write it"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">CLI text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">for humans</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">JSON</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">APIs, configs</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">YAML</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">Ansible, variables</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">XML</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">NETCONF, older APIs</text></svg><p class="cap">Same information, three ways to write it</p></div>
<h3>One device, three formats</h3>
<p>Here is the same small fact: router R1 has the management IP 10.99.0.1 and two VLANs, 10 and 20.</p>
<pre class="code">{"name": "R1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20]}</pre>
<p>That was <b>JSON</b> (JavaScript Object Notation): braces, quotes, commas.</p>
<pre class="code">name: R1
mgmt_ip: 10.99.0.1
vlans:
  - 10
  - 20</pre>
<p>That was <b>YAML</b> ("YAML Ain't Markup Language"): no braces, no quotes, and the structure comes from indentation. Easy for humans to write.</p>
<pre class="code">&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;mgmt_ip&gt;10.99.0.1&lt;/mgmt_ip&gt;
  &lt;vlans&gt;
    &lt;vlan&gt;10&lt;/vlan&gt;
    &lt;vlan&gt;20&lt;/vlan&gt;
  &lt;/vlans&gt;
&lt;/device&gt;</pre>
<p>That was <b>XML</b> (eXtensible Markup Language): every value sits between an opening tag and a closing tag. It is wordy but very strict, and NETCONF still uses it.</p>
<h3>They all mean the same thing</h3>
<p>Different spelling, same data. Python can prove it: it loads both texts and compares the results.</p>
<pre class="code">import json
import yaml

json_text = '{"name": "R1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20]}'
yaml_text = """
name: R1
mgmt_ip: 10.99.0.1
vlans:
  - 10
  - 20
"""

a = json.loads(json_text)
b = yaml.safe_load(yaml_text)
print(a)
print(b)
print("Same data:", a == b)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{'name': 'R1', 'mgmt_ip': '10.99.0.1', 'vlans': [10, 20]}
{'name': 'R1', 'mgmt_ip': '10.99.0.1', 'vlans': [10, 20]}
Same data: True</pre>
<p>Both texts became the same Python <b>dictionary</b> with a <b>list</b> inside. That is the key idea of this module: once the file is loaded, the format no longer matters. What matters is the shape: dictionaries (labelled values) and lists (ordered items), which you already know from Python 2.</p>
<h3>Which format where</h3>
<table class="cmp"><tr><th>Format</th><th>Typical home in networking</th><th>Strength</th></tr><tr><td>JSON</td><td>REST and RESTCONF APIs, controller replies, config files</td><td>Simple, universal, strict</td></tr><tr><td>YAML</td><td>Ansible playbooks and variables, CI pipelines, inventories</td><td>Easy for humans to edit, allows comments</td></tr><tr><td>XML</td><td>NETCONF, older vendor APIs</td><td>Strict, supports schemas and attributes</td></tr></table>
<h3>What the labs ask you to do</h3>
<p>Lab 1 gives you <code>inventory.json</code> that Python cannot read, plus a <code>show_inv.py</code> that prints a table from it. You validate, fix two syntax mistakes, correct a wrong key name in the script and query the file with <code>jq</code>. Lab 2 gives you <code>vlans.yml</code> and <code>build.py</code>: fix an indentation error, add a VLAN and a switch <b>by editing only the data</b>, and convert the plan to JSON with <code>to_json.py</code>.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Your path"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Read</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">what each format looks like</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Write</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">the syntax rules</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Load</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">in Python</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Repair</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">validate and fix</text></svg><p class="cap">Your path</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Treating the three formats as three different languages to learn. They are three notations for the same two building blocks, dictionaries and lists. Learn the blocks once and the notations follow.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know which format goes with which technology: JSON with REST and RESTCONF, XML with NETCONF, YAML with Ansible. Also know that YAML uses indentation and JSON uses braces and brackets.</p></div>
<div class="scn"><h4>The inventory nobody could read</h4><p>A company stored its device list as text pasted from an email. Each engineer parsed it with their own scripts and the three scripts disagreed about which devices existed. After moving the list to one JSON file, every script loaded it the same way, and a new device was added in one place. The data became the single source of truth.</p>
<p><b>Lesson:</b> structured data gives every tool the same view of the network.</p></div>
<div class="iv"><p class="q">"What is the difference between JSON, YAML and XML?"</p><p>All three describe structured data. JSON uses braces, brackets and quotes and is the standard for REST APIs. YAML uses indentation, is easy for humans and allows comments, so Ansible uses it. XML uses opening and closing tags, is strict, and is used by NETCONF. Once loaded in Python, JSON and YAML become dictionaries and lists.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured data is a form a program can read without guessing.</li>
<li>JSON, YAML and XML are three notations for dictionaries and lists.</li>
<li>JSON is used by REST APIs, YAML by Ansible, XML by NETCONF.</li>
<li>Once loaded into Python, the original format no longer matters.</li>
<li>Two labs: repair an inventory.json and drive config from vlans.yml.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap un teen data formats ko padhna, likhna aur repair karna seekhoge jin par network automation chalta hai: <b>JSON</b>, <b>YAML</b> aur <b>XML</b>. Aap unhe Python mein load karoge, badloge, ek ko doosre mein convert karoge, aur file load na ho to syntax galti jaldi dhoondhoge. Labs mein aap ek <code>inventory.json</code> repair karte ho jo koi padh nahi pa raha aur ek <code>vlans.yml</code> jo config generator ko crash karti hai, phir sirf data edit karke network badhate ho. Yeh CCNP Automation (350-901 AUTOCOR) track ka hissa hai.</p>
<p><b>Prerequisites.</b> Pichhle modules: Python 1 (variables, strings), Python 2 (lists, dictionaries, loops) aur Python 3 (functions, files aur exceptions). In teeno formats mein se kuch pehle se aana zaroori nahi.</p>
<h3>Analogy: chitthi vs form</h3>
<p>Chitthi kehti hai "Parcel Mr Rao ko bhejo, flat 12, Tower B, Pune 411001". Insaan aasani se padhta hai. Machine pakka nahi bata sakti ki naam kahan khatam hota hai aur pata kahan shuru. Ab <b>form</b> dekho: *Name*, *Flat*, *Tower*, *City*, *Pincode* ke labelled boxes, har box mein uski value. Machine form bina andaza lagaye padh sakti hai, kyunki har value ka label aur fixed jagah hai. <b>Structured data</b> aisa form hai jo computer padh sake. JSON, YAML aur XML form banane ke teen tareeke hain.</p>
<h3>CLI text ki problem</h3>
<p><code>show ip interface brief</code> ka output insaanon ke liye chitthi hai. Program mein use karne ke liye use <code>split()</code> ya regular expressions se kaatna padta hai, aur column badalte hi cuts toot jaate hain. Yeh skill agla module sikhata hai. Lekin APIs, automation tools aur source-of-truth files chitthi nahi, forms exchange karte hain. Isliye aapko unmein fluent hona padega.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Wahi information, likhne ke teen tareeke"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">CLI text</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">insaanon ke liye</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">JSON</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">APIs, configs</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">YAML</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">Ansible, variables</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">XML</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">NETCONF, purane APIs</text></svg><p class="cap">Wahi information, likhne ke teen tareeke</p></div>
<h3>Ek device, teen formats</h3>
<p>Yeh wahi chhoti baat hai: router R1 ka management IP 10.99.0.1 hai aur do VLANs hain, 10 aur 20.</p>
<pre class="code">{"name": "R1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20]}</pre>
<p>Yeh <b>JSON</b> (JavaScript Object Notation) tha: braces, quotes, commas.</p>
<pre class="code">name: R1
mgmt_ip: 10.99.0.1
vlans:
  - 10
  - 20</pre>
<p>Yeh <b>YAML</b> ("YAML Ain't Markup Language") tha: na braces, na quotes, aur structure indentation se aata hai. Insaan ke liye likhna aasaan.</p>
<pre class="code">&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;mgmt_ip&gt;10.99.0.1&lt;/mgmt_ip&gt;
  &lt;vlans&gt;
    &lt;vlan&gt;10&lt;/vlan&gt;
    &lt;vlan&gt;20&lt;/vlan&gt;
  &lt;/vlans&gt;
&lt;/device&gt;</pre>
<p>Yeh <b>XML</b> (eXtensible Markup Language) tha: har value opening tag aur closing tag ke beech hoti hai. Lamba hai lekin bahut strict, aur NETCONF abhi bhi use karta hai.</p>
<h3>Sabka matlab ek hi hai</h3>
<p>Spelling alag, data wahi. Python saabit kar sakta hai: woh dono texts load karke results compare karta hai.</p>
<pre class="code">import json
import yaml

json_text = '{"name": "R1", "mgmt_ip": "10.99.0.1", "vlans": [10, 20]}'
yaml_text = """
name: R1
mgmt_ip: 10.99.0.1
vlans:
  - 10
  - 20
"""

a = json.loads(json_text)
b = yaml.safe_load(yaml_text)
print(a)
print(b)
print("Same data:", a == b)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{'name': 'R1', 'mgmt_ip': '10.99.0.1', 'vlans': [10, 20]}
{'name': 'R1', 'mgmt_ip': '10.99.0.1', 'vlans': [10, 20]}
Same data: True</pre>
<p>Dono texts ek hi Python <b>dictionary</b> ban gaye jisme <b>list</b> hai. Is module ka key idea yahi hai: file load hone ke baad format matter nahi karta. Shape matter karta hai: dictionaries (labelled values) aur lists (ordered items), jo aap Python 2 mein seekh chuke ho.</p>
<h3>Kaun sa format kahan</h3>
<table class="cmp"><tr><th>Format</th><th>Networking mein aam jagah</th><th>Taakat</th></tr><tr><td>JSON</td><td>REST aur RESTCONF APIs, controller replies, config files</td><td>Simple, universal, strict</td></tr><tr><td>YAML</td><td>Ansible playbooks aur variables, CI pipelines, inventories</td><td>Insaan ke liye edit karna aasaan, comments allowed</td></tr><tr><td>XML</td><td>NETCONF, purane vendor APIs</td><td>Strict, schemas aur attributes support</td></tr></table>
<h3>Labs aapse kya karwate hain</h3>
<p>Lab 1 mein aapko <code>inventory.json</code> milti hai jo Python padh nahi sakta, saath mein <code>show_inv.py</code> jo usse table print karti hai. Aap validate karte ho, do syntax galtiyan fix karte ho, script ki ek galat key naam sudharte ho aur <code>jq</code> se file query karte ho. Lab 2 mein <code>vlans.yml</code> aur <code>build.py</code> milti hain: indentation error fix karo, <b>sirf data edit karke</b> ek VLAN aur ek switch jodo, aur <code>to_json.py</code> se plan JSON mein convert karo.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Aapka raasta"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Padho</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">har format kaisa dikhta hai</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Likho</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">syntax rules</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Load</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">Python mein</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Repair</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">validate aur fix</text></svg><p class="cap">Aapka raasta</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Teeno formats ko teen alag languages samajhna. Yeh wahi do building blocks, dictionaries aur lists, ke teen notations hain. Blocks ek baar seekho to notations apne aap aa jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano kaun sa format kis technology ke saath: JSON REST aur RESTCONF ke saath, XML NETCONF ke saath, YAML Ansible ke saath. Yeh bhi: YAML indentation use karta hai aur JSON braces aur brackets.</p></div>
<div class="scn"><h4>Inventory jo koi padh nahi pata tha</h4><p>Ek company ne device list email se paste kiye text mein rakhi thi. Har engineer ne apni script se use parse kiya aur teeno scripts is par asahmat thi ki kaun se devices hain. List ek JSON file mein jaane ke baad har script use ek tarah load karti thi, aur naya device ek jagah jodna padta tha. Data single source of truth ban gaya.</p>
<p><b>Lesson:</b> structured data har tool ko network ka ek hi nazariya deta hai.</p></div>
<div class="iv"><p class="q">"JSON, YAML aur XML mein kya difference hai?"</p><p>Teeno structured data describe karte hain. JSON braces, brackets aur quotes use karta hai aur REST APIs ka standard hai. YAML indentation use karta hai, insaan ke liye aasaan hai aur comments allow karta hai, isliye Ansible use karta hai. XML opening aur closing tags use karta hai, strict hai, aur NETCONF mein use hota hai. Python mein load hone ke baad JSON aur YAML dictionaries aur lists ban jaate hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Structured data aisa form hai jo program bina andaza lagaye padh sake.</li>
<li>JSON, YAML aur XML dictionaries aur lists ke teen notations hain.</li>
<li>JSON REST APIs mein, YAML Ansible mein, XML NETCONF mein use hota hai.</li>
<li>Python mein load hone ke baad original format matter nahi karta.</li>
<li>Do labs: inventory.json repair karo aur vlans.yml se config chalao.</li>
</ul></div>
`}};export{e as default};