var e={id:`yaml-syntax`,h:{en:`YAML syntax: indentation is the structure`,hi:`YAML syntax: indentation hi structure hai`},body:{en:`
<p>YAML was designed to be easy for people to write. It drops braces and quotes and uses <b>indentation</b> and a few symbols instead. Ansible, many CI tools and most variable files use it. The price of the clean look: you must be exact with spaces.</p>
<h3>The three building blocks</h3>
<ol>
<li><b>Mapping</b>: <code>key: value</code>. A colon and a space. This is a dictionary.</li>
<li><b>Sequence</b>: items that start with <code>- </code> (dash and space), one per line. This is a list.</li>
<li><b>Scalar</b>: a plain value: text, number, true/false, null.</li>
</ol>
<pre class="code">import yaml

text = """
name: HYD-CORE1
mgmt_ip: 10.99.0.1
managed: true
vlans:
  - 10
  - 20
  - 30
"""
data = yaml.safe_load(text)
print(data)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">{'name': 'HYD-CORE1', 'mgmt_ip': '10.99.0.1', 'managed': True, 'vlans': [10, 20, 30]}</pre>
<p>Compare with JSON from the previous chapters: no braces, no quotes, no commas. The two keys with simple values sit on one line each. The key <code>vlans</code> has nothing after the colon, so its value is the indented sequence below it. Python received a dictionary with a list inside, exactly as for JSON.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="YAML building blocks"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Mapping</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">key: value</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Sequence</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">- item</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Scalar</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">text, number, true, null</text></svg><p class="cap">YAML building blocks</p></div>
<h3>Indentation rules</h3>
<ul>
<li>Indentation means <b>belonging</b>. Lines indented under a key belong to that key.</li>
<li>Use <b>spaces only</b>, never tabs. Two spaces per level is the convention.</li>
<li>Items at the same level must line up exactly. One extra space makes them a different level, and then YAML breaks.</li>
</ul>
<h3>A list of mappings</h3>
<p>The most common structure in network files is a list where each item has several fields. Each item starts with a dash. The fields of that item line up under the first field.</p>
<pre class="code">import yaml

text = """
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
"""
data = yaml.safe_load(text)
for sw in data["switches"]:
    print(sw["name"], sw["mgmt"])
print(data["switches"][1]["mgmt"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">WH-SW1 10.99.0.11
WH-SW2 10.99.0.12
10.99.0.12</pre>
<p>Read the shape: the key <code>switches</code> holds a list. The first item begins with <code>- name: WH-SW1</code>, and <code>mgmt:</code> is lined up exactly under <code>name:</code> (4 spaces), so it belongs to the same item. The second dash starts a new item.</p>
<h3>Comments and extra tools</h3>
<p>A <code>#</code> starts a comment, which JSON cannot do. This makes YAML ideal for files that people maintain.</p>
<pre class="code">import yaml

text = """
# VLAN plan for the warehouse
site: Nagpur-WH      # the site name
vlans: [10, 20, 30]  # a short list can be written like JSON
ids: {office: 10, cctv: 30}
note: "text with: a colon needs quotes"
description: |
  Line one
  Line two
"""
data = yaml.safe_load(text)
for key, value in data.items():
    print(key, "-&gt;", repr(value))</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">site -&gt; 'Nagpur-WH'
vlans -&gt; [10, 20, 30]
ids -&gt; {'office': 10, 'cctv': 30}
note -&gt; 'text with: a colon needs quotes'
description -&gt; 'Line one\\nLine two\\n'</pre>
<p>What you see: short lists and mappings may use JSON-like brackets (called <b>flow style</b>); a value that contains a colon followed by a space needs quotes; and <code>|</code> starts a <b>block of text</b> that keeps its line breaks.</p>
<h3>YAML guesses types</h3>
<p>Without quotes, YAML decides the type for you. That is convenient, and sometimes surprising.</p>
<pre class="code">import yaml

text = """
vlan: 10
version: 1.10
enabled: true
speed: 1G
code: 0123
answer: no
empty:
"""
data = yaml.safe_load(text)
for key, value in data.items():
    print(key, repr(value), type(value).__name__)</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">vlan 10 int
version 1.1 float
enabled True bool
speed '1G' str
code 83 int
answer False bool
empty None NoneType</pre>
<p>Look at three traps. <code>1.10</code> became the number <code>1.1</code>, so a version string lost its zero. <code>0123</code> was read as the number 83, because a leading zero meant octal in older YAML. And <code>no</code> became <code>False</code>, the so-called "Norway problem": a country code <code>NO</code>, or the word <code>on</code> or <code>yes</code>, turns into a boolean. The cure for all of them is the same: <b>put quotes around values that must stay text</b> (<code>version: "1.10"</code>, <code>country: "NO"</code>).</p>
<h3>Syntax errors in YAML</h3>
<p>A wrong indentation produces an error that names the line and what it expected. The lab tool <code>yamllint</code> reports it like this:</p>
<pre class="out">AUTO&gt; yamllint vlans.yml
vlans.yml:11:4: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>It says line 11, column 4: the dash is one space too far to the right compared with the other items. On a real computer the Python <code>yaml</code> module and the <code>yamllint</code> program give similar messages. Tabs trigger their own message.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Using a tab instead of spaces. (2) Misaligning one item by one space. (3) Forgetting the space after the colon (<code>key:value</code> is a plain string, not a mapping). (4) Leaving unquoted values that YAML converts (<code>no</code>, <code>on</code>, <code>1.10</code>, <code>010</code>). (5) Copying JSON-style quotes unnecessarily; they are allowed but not needed.</p></div>
<div class="exam"><p><b>Exam trap.</b> YAML allows comments with <code>#</code>; JSON does not. YAML structure comes from indentation with spaces; tabs are forbidden. A dash starts a list item and <code>key: value</code> a mapping.</p></div>
<div class="scn"><h4>The country that became False</h4><p>An inventory file had a field <code>country: NO</code> for a branch in Norway. After loading it, a report said the country was <code>False</code>. YAML 1.1 loaders read <code>NO</code> as the boolean false. The team quoted the value as <code>"NO"</code> and added a test that checks the type of every field after loading.</p>
<p><b>Lesson:</b> when a value must stay text, quote it.</p></div>
<div class="iv"><p class="q">"How does YAML represent a list of dictionaries?"</p><p>Each list item starts with a dash and a space, and the fields of that item are written as key: value lines aligned under the first key. The indentation shows which keys belong to which item. For example, <code>- name: SW1</code> then <code>  mgmt: 10.0.0.1</code> under it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YAML has mappings (<code>key: value</code>), sequences (<code>- item</code>) and scalars.</li>
<li>Indentation with spaces is the structure; tabs are not allowed.</li>
<li><code>#</code> starts a comment; quotes protect values from being converted.</li>
<li><code>no</code>, <code>yes</code>, <code>on</code>, <code>1.10</code> and <code>0123</code> are guessed as other types unless quoted.</li>
<li>Both JSON and YAML load into the same Python dictionaries and lists.</li>
</ul></div>
`,hi:`
<p>YAML ko insaanon ke liye likhna aasaan banane ke liye design kiya gaya. Woh braces aur quotes hata deta hai aur unki jagah <b>indentation</b> aur kuch symbols use karta hai. Ansible, kai CI tools aur zyadatar variable files ise use karte hain. Saaf dikhne ki keemat: spaces mein exact hona padta hai.</p>
<h3>Teen building blocks</h3>
<ol>
<li><b>Mapping</b>: <code>key: value</code>. Colon aur space. Yeh dictionary hai.</li>
<li><b>Sequence</b>: <code>- </code> (dash aur space) se shuru hone wale items, ek line mein ek. Yeh list hai.</li>
<li><b>Scalar</b>: seedhi value: text, number, true/false, null.</li>
</ol>
<pre class="code">import yaml

text = """
name: HYD-CORE1
mgmt_ip: 10.99.0.1
managed: true
vlans:
  - 10
  - 20
  - 30
"""
data = yaml.safe_load(text)
print(data)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">{'name': 'HYD-CORE1', 'mgmt_ip': '10.99.0.1', 'managed': True, 'vlans': [10, 20, 30]}</pre>
<p>JSON se compare karo: na braces, na quotes, na commas. Simple values wali do keys ek ek line mein hain. Key <code>vlans</code> ke colon ke baad kuch nahi hai, isliye uski value uske neeche ki indented sequence hai. Python ko dictionary mili jisme list hai, bilkul JSON ki tarah.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="YAML building blocks"><rect x="20" y="30" width="181" height="70" rx="10" fill="#bae6fd"/><text x="110" y="60" text-anchor="middle" class="svg-ink" font-size="14">Mapping</text><text x="110" y="82" text-anchor="middle" class="svg-muted" font-size="12">key: value</text><line x1="203" y1="65" x2="223" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="223,60 229,65 223,70" fill="#64748b"/><rect x="229" y="30" width="181" height="70" rx="10" fill="#bbf7d0"/><text x="319" y="60" text-anchor="middle" class="svg-ink" font-size="14">Sequence</text><text x="319" y="82" text-anchor="middle" class="svg-muted" font-size="12">- item</text><line x1="412" y1="65" x2="432" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="432,60 438,65 432,70" fill="#64748b"/><rect x="438" y="30" width="181" height="70" rx="10" fill="#fde68a"/><text x="528" y="60" text-anchor="middle" class="svg-ink" font-size="14">Scalar</text><text x="528" y="82" text-anchor="middle" class="svg-muted" font-size="12">text, number, true, null</text></svg><p class="cap">YAML building blocks</p></div>
<h3>Indentation rules</h3>
<ul>
<li>Indentation ka matlab <b>belonging</b> hai. Key ke neeche indented lines usi key ki hain.</li>
<li><b>Sirf spaces</b>, tabs kabhi nahi. Convention ek level par do spaces ka hai.</li>
<li>Ek hi level ke items bilkul line up hone chahiye. Ek extra space unhe alag level bana deta hai, aur tab YAML toot jaata hai.</li>
</ul>
<h3>Mappings ki list</h3>
<p>Network files mein sabse aam structure woh list hai jisme har item ke kai fields hote hain. Har item dash se shuru hota hai. Us item ke fields pehle field ke neeche line up hote hain.</p>
<pre class="code">import yaml

text = """
switches:
  - name: WH-SW1
    mgmt: 10.99.0.11
  - name: WH-SW2
    mgmt: 10.99.0.12
"""
data = yaml.safe_load(text)
for sw in data["switches"]:
    print(sw["name"], sw["mgmt"])
print(data["switches"][1]["mgmt"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">WH-SW1 10.99.0.11
WH-SW2 10.99.0.12
10.99.0.12</pre>
<p>Shape padho: key <code>switches</code> mein list hai. Pehla item <code>- name: WH-SW1</code> se shuru hota hai, aur <code>mgmt:</code> bilkul <code>name:</code> ke neeche (4 spaces) line up hai, isliye wahi item ka hissa hai. Doosra dash naya item shuru karta hai.</p>
<h3>Comments aur extra tools</h3>
<p><code>#</code> comment shuru karta hai, jo JSON nahi kar sakta. Isse YAML un files ke liye ideal hai jinhe log maintain karte hain.</p>
<pre class="code">import yaml

text = """
# VLAN plan for the warehouse
site: Nagpur-WH      # the site name
vlans: [10, 20, 30]  # a short list can be written like JSON
ids: {office: 10, cctv: 30}
note: "text with: a colon needs quotes"
description: |
  Line one
  Line two
"""
data = yaml.safe_load(text)
for key, value in data.items():
    print(key, "-&gt;", repr(value))</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">site -&gt; 'Nagpur-WH'
vlans -&gt; [10, 20, 30]
ids -&gt; {'office': 10, 'cctv': 30}
note -&gt; 'text with: a colon needs quotes'
description -&gt; 'Line one\\nLine two\\n'</pre>
<p>Aap dekh rahe ho: chhoti lists aur mappings JSON jaise brackets use kar sakti hain (<b>flow style</b>); jis value mein colon ke baad space ho use quotes chahiye; aur <code>|</code> <b>text ka block</b> shuru karta hai jo apne line breaks rakhta hai.</p>
<h3>YAML types ka andaza lagata hai</h3>
<p>Quotes ke bina YAML type khud tay karta hai. Yeh suvidha hai, aur kabhi kabhi hairaan karti hai.</p>
<pre class="code">import yaml

text = """
vlan: 10
version: 1.10
enabled: true
speed: 1G
code: 0123
answer: no
empty:
"""
data = yaml.safe_load(text)
for key, value in data.items():
    print(key, repr(value), type(value).__name__)</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">vlan 10 int
version 1.1 float
enabled True bool
speed '1G' str
code 83 int
answer False bool
empty None NoneType</pre>
<p>Teen traps dekho. <code>1.10</code> number <code>1.1</code> ban gaya, isliye version string ka zero kho gaya. <code>0123</code> number 83 ke roop mein padha gaya, kyunki purane YAML mein leading zero ka matlab octal tha. Aur <code>no</code> <code>False</code> ban gaya, jise "Norway problem" kehte hain: country code <code>NO</code>, ya shabd <code>on</code> ya <code>yes</code>, boolean ban jaata hai. Sabka ilaaj ek hi hai: <b>jo values text hi rehni chahiye unke aaspaas quotes lagao</b> (<code>version: "1.10"</code>, <code>country: "NO"</code>).</p>
<h3>YAML mein syntax errors</h3>
<p>Galat indentation ek error deti hai jo line aur kya expected tha batati hai. Lab tool <code>yamllint</code> use aise report karta hai:</p>
<pre class="out">AUTO&gt; yamllint vlans.yml
vlans.yml:11:4: error: bad indentation of a sequence entry (this line is indented more than the list item above it)</pre>
<p>Yeh line 11, column 4 kehta hai: dash baaki items ke mukable ek space zyada daayein hai. Asli computer par Python <code>yaml</code> module aur <code>yamllint</code> program milte-julte messages dete hain. Tabs ka apna message hota hai.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Spaces ki jagah tab use karna. (2) Ek item ko ek space se misalign karna. (3) Colon ke baad space bhoolna (<code>key:value</code> plain string hai, mapping nahi). (4) Aisi values bina quotes ke chhodna jinhe YAML convert kar deta hai (<code>no</code>, <code>on</code>, <code>1.10</code>, <code>010</code>). (5) JSON-style quotes bekaar mein copy karna; allowed hain lekin zaroori nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> YAML <code>#</code> se comments allow karta hai; JSON nahi. YAML structure spaces ki indentation se aata hai; tabs forbidden hain. Dash list item shuru karta hai aur <code>key: value</code> mapping.</p></div>
<div class="scn"><h4>Woh country jo False ban gaya</h4><p>Ek inventory file mein Norway ke branch ke liye <code>country: NO</code> field tha. Load karne ke baad report ne country <code>False</code> bataya. YAML 1.1 loaders <code>NO</code> ko boolean false padhte hain. Team ne value ko <code>"NO"</code> quote kiya aur ek test jodi jo load ke baad har field ka type check karti hai.</p>
<p><b>Lesson:</b> value text hi rehni chahiye to use quote karo.</p></div>
<div class="iv"><p class="q">"YAML dictionaries ki list kaise represent karta hai?"</p><p>Har list item dash aur space se shuru hota hai, aur us item ke fields pehli key ke neeche aligned key: value lines mein likhe jaate hain. Indentation dikhati hai kaun si keys kaun se item ki hain. Jaise <code>- name: SW1</code> aur uske neeche <code>  mgmt: 10.0.0.1</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YAML mein mappings (<code>key: value</code>), sequences (<code>- item</code>) aur scalars hote hain.</li>
<li>Spaces ki indentation structure hai; tabs allowed nahi.</li>
<li><code>#</code> comment shuru karta hai; quotes values ko convert hone se bachate hain.</li>
<li><code>no</code>, <code>yes</code>, <code>on</code>, <code>1.10</code> aur <code>0123</code> quote na ho to doosre types ki tarah guess hote hain.</li>
<li>JSON aur YAML dono wahi Python dictionaries aur lists mein load hote hain.</li>
</ul></div>
`}};export{e as default};