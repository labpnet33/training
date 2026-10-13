var e={id:`json`,h:{en:`JSON: rules, the json module and building valid files`,hi:`JSON: rules, json module aur valid files banana`},body:{en:`
<p>A courier company in Pune and one in Delhi can exchange parcels only because both fill in the same airway-bill form: sender here, receiver there, weight in this box. Neither has to guess. <b>JSON</b> (JavaScript Object Notation) is that standard form for data. Catalyst Center, SD-WAN Manager, RESTCONF on IOS XE, cloud APIs and countless configuration files all send and store data in it. The CCNA automation module introduced JSON; here you learn to read it into Python, walk it, write it back, and build it by hand without a single syntax error, which is blueprint item 6.2.</p>

<h3>The syntax rules, completely</h3>
<ol>
<li>There are two structures. An <b>object</b> is curly braces holding <code>"key": value</code> pairs separated by commas. An <b>array</b> is square brackets holding values separated by commas, in order.</li>
<li><b>Keys are always strings in double quotes.</b> <code>{vlan: 10}</code> and <code>{'vlan': 10}</code> are invalid.</li>
<li>A value is one of six types: a <b>string</b> in double quotes, a <b>number</b> (no quotes, no leading zeros such as 010, no hex), <b>true</b> or <b>false</b> (lowercase), <b>null</b> (lowercase), an object, or an array.</li>
<li>Commas go <b>between</b> items. <b>No comma after the last item</b> (no trailing comma).</li>
<li><b>No comments</b> of any kind.</li>
<li>Whitespace and line breaks outside strings do not matter; indentation is for humans.</li>
<li>Inside a string, a double quote or backslash must be escaped: <code>&#92;"</code> and <code>&#92;&#92;</code>; <code>&#92;n</code> is a newline.</li>
</ol>
<pre class="code">{
  "hostname": "R1",
  "mgmt": "10.99.0.1",
  "vlans": [10, 20, 30],
  "ssh_enabled": true,
  "banner": null,
  "interfaces": [
    {"name": "GigabitEthernet0/0", "mtu": 1500, "enabled": true},
    {"name": "Loopback100", "mtu": 1514, "enabled": false}
  ]
}</pre>

<h3>JSON and Python map one to one</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="JSON to Python type mapping">
<text x="120" y="22" text-anchor="middle" class="svg-ink" font-size="14">JSON text</text><text x="520" y="22" text-anchor="middle" class="svg-ink" font-size="14">Python object</text>
<rect x="40" y="34" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="53" text-anchor="middle" class="svg-ink" font-size="13">object { }</text><rect x="440" y="34" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="53" text-anchor="middle" class="svg-ink" font-size="13">dict</text>
<rect x="40" y="68" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="87" text-anchor="middle" class="svg-ink" font-size="13">array [ ]</text><rect x="440" y="68" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="87" text-anchor="middle" class="svg-ink" font-size="13">list</text>
<rect x="40" y="102" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="121" text-anchor="middle" class="svg-ink" font-size="13">"string"</text><rect x="440" y="102" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="121" text-anchor="middle" class="svg-ink" font-size="13">str</text>
<rect x="40" y="136" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="13">10 / 2.5</text><rect x="440" y="136" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="13">int / float</text>
<rect x="40" y="170" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="189" text-anchor="middle" class="svg-ink" font-size="13">true / false</text><rect x="440" y="170" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="189" text-anchor="middle" class="svg-ink" font-size="13">True / False</text>
<rect x="40" y="204" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="223" text-anchor="middle" class="svg-ink" font-size="13">null</text><rect x="440" y="204" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="223" text-anchor="middle" class="svg-ink" font-size="13">None</text>
<line x1="210" y1="110" x2="430" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">json.loads / json.load  -&gt;</text>
<line x1="210" y1="160" x2="430" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">&lt;-  json.dumps / json.dump</text>
</svg><p class="cap">Decoding turns text into Python objects; encoding turns them back into text.</p></div>

<h3>The json module</h3>
<p>Four functions do everything. The trailing <b>s</b> means <b>string</b>; without it the function works with a <b>file</b>.</p>
<pre class="code">import json

text = '{"hostname": "R1", "up": true, "vlan": null}'
data = json.loads(text)              <span class="c"># str  -&gt; dict</span>
print(data["up"], data["vlan"])      <span class="c"># True None</span>
print(json.dumps(data))              <span class="c"># dict -&gt; str: {"hostname": "R1", "up": true, "vlan": null}</span>
print(json.dumps(data, indent=2, sort_keys=True))   <span class="c"># pretty, keys sorted</span>

with open("vlans.json") as f:        <span class="c"># file -&gt; Python</span>
    plan = json.load(f)
with open("report.json", "w") as f:  <span class="c"># Python -&gt; file</span>
    json.dump({"ACC-SW2": [1, 10, 30]}, f, indent=2)</pre>
<p>Encoding is also the safest way to <b>construct</b> valid JSON: build a dict and a list in Python, then let <code>json.dump</code> write the quotes and commas. A tuple is written as an array, and <code>True</code> becomes <code>true</code>.</p>

<h3>Walking nested JSON</h3>
<p>Once loaded, JSON is just nested dicts and lists, so you walk it exactly as in chapter 4. Here is how RESTCONF on IOS XE returns one interface (the next module explains the YANG names with colons):</p>
<pre class="out">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet1",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {<span class="hl">"ip": "10.99.0.1"</span>, "netmask": "255.255.255.0"}
      ]
    }
  }
}</pre>
<pre class="code">intf = data["ietf-interfaces:interface"]
print(intf["name"], intf["enabled"])                  <span class="c"># GigabitEthernet1 True</span>
print(intf["ietf-ip:ipv4"]["address"][0]["ip"])       <span class="c"># 10.99.0.1</span></pre>

<h3>Common errors and what Python says</h3>
<table class="cmp"><tr><th>Mistake</th><th>JSONDecodeError message</th></tr>
<tr><td>Trailing comma before <code>]</code></td><td>Expecting value</td></tr>
<tr><td>Trailing comma before <code>}</code>, or single-quoted / unquoted key</td><td>Expecting property name enclosed in double quotes</td></tr>
<tr><td>Missing comma between items</td><td>Expecting ',' delimiter</td></tr>
<tr><td>Missing colon after a key</td><td>Expecting ':' delimiter</td></tr>
<tr><td><code>True</code>, <code>None</code>, or a single-quoted value; a comment where a value belongs</td><td>Expecting value</td></tr>
</table>
<p>These are the messages of Python 3.12 and earlier, which the lab uses; Python 3.13 reports a trailing comma more plainly as <i>Illegal trailing comma before end of array</i> (or object). Every message ends with <code>line L column C (char N)</code>. The fault is at that position <b>or just before it</b>, because the parser only complains when the next character makes no sense. <code>python3 -m json.tool file.json</code> checks a file and pretty-prints it.</p>

<div class="eg"><p><b>Worked example: the lab file.</b> <code>python3 vlans.py</code> stops with <code>json.decoder.JSONDecodeError: Expecting value: line 19 column 7 (char 436)</code>. <code>nl vlans.json</code> shows line 18 <code>{"id": 30, "name": "VOICE"},</code> and line 19 <code>],</code>. After the comma the parser expected another value and found <code>]</code> at line 19, column 7. The fault is the trailing comma at the end of line 18: <code>edit vlans.json 18         {"id": 30, "name": "VOICE"}</code> (keep the 8 leading spaces). Note that the comma on line 19 is correct: more keys follow in that object.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Pasting a Python dict into a JSON file (single quotes, <code>True</code>, <code>None</code>); leaving a trailing comma after deleting the last item; quoting numbers you will compare later (<code>"10"</code> becomes a str); and calling <code>json.load</code> with a string or <code>json.loads</code> with a file object.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect a "which of these is valid JSON?" question. Check in this order: double quotes on every key and string, lowercase true/false/null, commas between but not after items, balanced brackets, no comments. <code>{"vlan": 010}</code> is invalid (leading zero); <code>[]</code> and <code>{}</code> alone are valid.</p></div>

<div class="scn"><h4>The comment that stopped the pipeline</h4><p>A team generated switch configurations from a shared <code>sites.json</code>. An engineer added a line <code>// temporary until Monday</code> above one site to remind colleagues. The overnight job failed on every site with <code>Expecting value</code>, and no configuration was generated for the maintenance window. The fix was to delete the comment and store notes in a real field, <code>"note": "temporary until Monday"</code>. The team also added <code>python3 -m json.tool sites.json</code> as a check that runs before any commit is accepted.</p><p><b>Lesson:</b> JSON has no comments; validate hand-edited JSON automatically before anything consumes it.</p></div>

<div class="iv"><p class="q">"What makes a JSON document valid, and how do you convert between JSON and Python?"</p><p>Strong answer: objects of double-quoted keys and values, arrays of values, six value types, lowercase true/false/null, commas only between items, no comments. In Python, <code>json.loads</code> and <code>json.load</code> decode a string or file into dicts and lists; <code>json.dumps</code> and <code>json.dump</code> encode back, with <code>indent</code> for readability. Add that you build JSON as Python data and let <code>dump</code> write it, instead of concatenating strings.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Object <code>{ }</code> of "key": value pairs; array <code>[ ]</code> of values; keys always double-quoted.</li>
<li>Values: string, number, true, false, null, object, array. No trailing commas, no comments.</li>
<li>object/array/true/null map to dict/list/True/None.</li>
<li><code>loads</code>/<code>dumps</code> work on strings, <code>load</code>/<code>dump</code> on files; <code>indent=2</code> pretty-prints.</li>
<li>A JSONDecodeError points at the character where parsing failed; the mistake is there or just before it.</li>
</ul></div>
`,hi:`
<p>Pune ki ek courier company aur Delhi ki ek company parcels tabhi exchange kar sakti hain jab dono same airway-bill form bharein: sender yahan, receiver wahan, weight is box mein. Kisi ko andaza nahi lagana padta. <b>JSON</b> (JavaScript Object Notation) data ke liye wahi standard form hai. Catalyst Center, SD-WAN Manager, IOS XE par RESTCONF, cloud APIs aur anginat configuration files sab data ise mein bhejti aur store karti hain. CCNA automation module ne JSON introduce kiya tha; yahan aap use Python mein padhna, uske andar chalna, wapas likhna, aur bina ek bhi syntax error ke haath se banana seekhoge, jo blueprint item 6.2 hai.</p>

<h3>Syntax rules, poore ke poore</h3>
<ol>
<li>Do structures hain. <b>Object</b> curly braces hain jinme commas se alag <code>"key": value</code> pairs hote hain. <b>Array</b> square brackets hain jinme commas se alag values order mein hoti hain.</li>
<li><b>Keys hamesha double quotes mein strings hoti hain.</b> <code>{vlan: 10}</code> aur <code>{'vlan': 10}</code> invalid hain.</li>
<li>Value chhe types mein se ek hai: double quotes mein <b>string</b>, <b>number</b> (quotes nahi, 010 jaise leading zeros nahi, hex nahi), <b>true</b> ya <b>false</b> (lowercase), <b>null</b> (lowercase), object, ya array.</li>
<li>Commas items ke <b>beech</b> aate hain. <b>Aakhri item ke baad comma nahi</b> (trailing comma nahi).</li>
<li>Kisi bhi tarah ke <b>comments nahi</b>.</li>
<li>Strings ke bahar whitespace aur line breaks matter nahi karte; indentation insaano ke liye hai.</li>
<li>String ke andar double quote ya backslash ko escape karna padta hai: <code>&#92;"</code> aur <code>&#92;&#92;</code>; <code>&#92;n</code> newline hai.</li>
</ol>
<pre class="code">{
  "hostname": "R1",
  "mgmt": "10.99.0.1",
  "vlans": [10, 20, 30],
  "ssh_enabled": true,
  "banner": null,
  "interfaces": [
    {"name": "GigabitEthernet0/0", "mtu": 1500, "enabled": true},
    {"name": "Loopback100", "mtu": 1514, "enabled": false}
  ]
}</pre>

<h3>JSON aur Python ek se ek map hote hain</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="JSON se Python type mapping">
<text x="120" y="22" text-anchor="middle" class="svg-ink" font-size="14">JSON text</text><text x="520" y="22" text-anchor="middle" class="svg-ink" font-size="14">Python object</text>
<rect x="40" y="34" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="53" text-anchor="middle" class="svg-ink" font-size="13">object { }</text><rect x="440" y="34" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="53" text-anchor="middle" class="svg-ink" font-size="13">dict</text>
<rect x="40" y="68" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="87" text-anchor="middle" class="svg-ink" font-size="13">array [ ]</text><rect x="440" y="68" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="87" text-anchor="middle" class="svg-ink" font-size="13">list</text>
<rect x="40" y="102" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="121" text-anchor="middle" class="svg-ink" font-size="13">"string"</text><rect x="440" y="102" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="121" text-anchor="middle" class="svg-ink" font-size="13">str</text>
<rect x="40" y="136" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="155" text-anchor="middle" class="svg-ink" font-size="13">10 / 2.5</text><rect x="440" y="136" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="155" text-anchor="middle" class="svg-ink" font-size="13">int / float</text>
<rect x="40" y="170" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="189" text-anchor="middle" class="svg-ink" font-size="13">true / false</text><rect x="440" y="170" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="189" text-anchor="middle" class="svg-ink" font-size="13">True / False</text>
<rect x="40" y="204" width="160" height="28" rx="6" fill="#bae6fd"/><text x="120" y="223" text-anchor="middle" class="svg-ink" font-size="13">null</text><rect x="440" y="204" width="160" height="28" rx="6" fill="#bbf7d0"/><text x="520" y="223" text-anchor="middle" class="svg-ink" font-size="13">None</text>
<line x1="210" y1="110" x2="430" y2="110" stroke="#64748b" stroke-width="2"/><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="12">json.loads / json.load  -&gt;</text>
<line x1="210" y1="160" x2="430" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">&lt;-  json.dumps / json.dump</text>
</svg><p class="cap">Decoding text ko Python objects mein badalta hai; encoding unhe wapas text mein.</p></div>

<h3>json module</h3>
<p>Chaar functions sab kuch karte hain. Aakhir ka <b>s</b> matlab <b>string</b>; uske bina function <b>file</b> ke saath kaam karta hai.</p>
<pre class="code">import json

text = '{"hostname": "R1", "up": true, "vlan": null}'
data = json.loads(text)              <span class="c"># str  -&gt; dict</span>
print(data["up"], data["vlan"])      <span class="c"># True None</span>
print(json.dumps(data))              <span class="c"># dict -&gt; str: {"hostname": "R1", "up": true, "vlan": null}</span>
print(json.dumps(data, indent=2, sort_keys=True))   <span class="c"># sundar, keys sorted</span>

with open("vlans.json") as f:        <span class="c"># file -&gt; Python</span>
    plan = json.load(f)
with open("report.json", "w") as f:  <span class="c"># Python -&gt; file</span>
    json.dump({"ACC-SW2": [1, 10, 30]}, f, indent=2)</pre>
<p>Encoding valid JSON <b>construct</b> karne ka sabse safe tarika bhi hai: Python mein dict aur list banao, phir <code>json.dump</code> ko quotes aur commas likhne do. Tuple array ki tarah likha jaata hai, aur <code>True</code> <code>true</code> ban jaata hai.</p>

<h3>Nested JSON mein chalna</h3>
<p>Load hone ke baad JSON bas nested dicts aur lists hai, isliye aap usme bilkul chapter 4 ki tarah chalte ho. IOS XE par RESTCONF ek interface aise return karta hai (colons wale YANG naam agla module samjhata hai):</p>
<pre class="out">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet1",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {<span class="hl">"ip": "10.99.0.1"</span>, "netmask": "255.255.255.0"}
      ]
    }
  }
}</pre>
<pre class="code">intf = data["ietf-interfaces:interface"]
print(intf["name"], intf["enabled"])                  <span class="c"># GigabitEthernet1 True</span>
print(intf["ietf-ip:ipv4"]["address"][0]["ip"])       <span class="c"># 10.99.0.1</span></pre>

<h3>Common errors aur Python kya kehta hai</h3>
<table class="cmp"><tr><th>Galti</th><th>JSONDecodeError message</th></tr>
<tr><td><code>]</code> se pehle trailing comma</td><td>Expecting value</td></tr>
<tr><td><code>}</code> se pehle trailing comma, ya single-quoted / bina quote ki key</td><td>Expecting property name enclosed in double quotes</td></tr>
<tr><td>Items ke beech comma missing</td><td>Expecting ',' delimiter</td></tr>
<tr><td>Key ke baad colon missing</td><td>Expecting ':' delimiter</td></tr>
<tr><td><code>True</code>, <code>None</code>, ya single-quoted value; jahan value honi chahiye wahan comment</td><td>Expecting value</td></tr>
</table>
<p>Yeh Python 3.12 aur pehle ke messages hain, jo lab use karta hai; Python 3.13 trailing comma ko seedhe <i>Illegal trailing comma before end of array</i> (ya object) bolta hai. Har message <code>line L column C (char N)</code> par khatam hota hai. Galti us position par <b>ya theek usse pehle</b> hoti hai, kyunki parser tabhi shikayat karta hai jab agla character samajh na aaye. <code>python3 -m json.tool file.json</code> file check karta hai aur sundar print karta hai.</p>

<div class="eg"><p><b>Worked example: lab file.</b> <code>python3 vlans.py</code> <code>json.decoder.JSONDecodeError: Expecting value: line 19 column 7 (char 436)</code> ke saath rukta hai. <code>nl vlans.json</code> line 18 <code>{"id": 30, "name": "VOICE"},</code> aur line 19 <code>],</code> dikhata hai. Comma ke baad parser ko ek aur value chahiye thi aur use line 19, column 7 par <code>]</code> mila. Galti line 18 ke end ka trailing comma hai: <code>edit vlans.json 18         {"id": 30, "name": "VOICE"}</code> (8 leading spaces rakho). Dhyan do ki line 19 ka comma sahi hai: us object mein aur keys aati hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> JSON file mein Python dict paste karna (single quotes, <code>True</code>, <code>None</code>); aakhri item delete karne ke baad trailing comma chhod dena; jin numbers ko baad mein compare karoge unhe quote karna (<code>"10"</code> str ban jaata hai); aur <code>json.load</code> ko string ke saath ya <code>json.loads</code> ko file object ke saath call karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inme se kaunsa valid JSON hai?" question expect karo. Is order mein check karo: har key aur string par double quotes, lowercase true/false/null, items ke beech commas par baad mein nahi, balanced brackets, comments nahi. <code>{"vlan": 010}</code> invalid hai (leading zero); akele <code>[]</code> aur <code>{}</code> valid hain.</p></div>

<div class="scn"><h4>Comment jisne pipeline rok di</h4><p>Ek team shared <code>sites.json</code> se switch configurations generate karti thi. Ek engineer ne colleagues ko yaad dilane ke liye ek site ke upar <code>// temporary until Monday</code> line jod di. Overnight job har site par <code>Expecting value</code> ke saath fail hua, aur maintenance window ke liye koi configuration generate nahi hui. Fix tha comment delete karna aur notes ko asli field mein rakhna, <code>"note": "temporary until Monday"</code>. Team ne <code>python3 -m json.tool sites.json</code> ko ek check ki tarah bhi joda jo koi bhi commit accept hone se pehle chalta hai.</p><p><b>Seekh:</b> JSON mein comments nahi hote; haath se edit kiye JSON ko koi bhi use kare usse pehle automatically validate karo.</p></div>

<div class="iv"><p class="q">"JSON document ko valid kya banata hai, aur JSON aur Python ke beech convert kaise karte ho?"</p><p>Strong answer: double-quoted keys aur values ke objects, values ke arrays, chhe value types, lowercase true/false/null, commas sirf items ke beech, comments nahi. Python mein <code>json.loads</code> aur <code>json.load</code> string ya file ko dicts aur lists mein decode karte hain; <code>json.dumps</code> aur <code>json.dump</code> wapas encode karte hain, readability ke liye <code>indent</code> ke saath. Jodo ki aap strings concatenate karne ki jagah JSON ko Python data ki tarah banate ho aur <code>dump</code> ko likhne dete ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Object <code>{ }</code> "key": value pairs ka; array <code>[ ]</code> values ka; keys hamesha double-quoted.</li>
<li>Values: string, number, true, false, null, object, array. Trailing commas nahi, comments nahi.</li>
<li>object/array/true/null dict/list/True/None mein map hote hain.</li>
<li><code>loads</code>/<code>dumps</code> strings par, <code>load</code>/<code>dump</code> files par kaam karte hain; <code>indent=2</code> sundar print karta hai.</li>
<li>JSONDecodeError us character ko point karta hai jahan parsing fail hui; galti wahin ya theek usse pehle hai.</li>
</ul></div>
`}};export{e as default};