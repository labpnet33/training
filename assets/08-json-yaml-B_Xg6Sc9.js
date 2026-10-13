var e={id:`json-yaml`,h:{en:`Reading and writing JSON by hand, plus XML and YAML`,hi:`JSON haath se padhna aur likhna, saath mein XML aur YAML`},body:{en:`
<p>A postal address works from big to small: country, city, street, house number, flat. To deliver a letter you follow that path one step at a time. Nested JSON is read in exactly the same way: start at the outside, step into one key, then the next, until you reach the value you want. Writing JSON is the reverse: build the envelope first, then fill it from the outside in.</p>

<h3>Reading JSON: follow the path</h3>
<p>We describe a location in JSON with a <b>path</b>. A dot and a key step into an object (<code>.name</code>). A number in square brackets steps into an array (<code>[0]</code> is the <b>first</b> item, because counting starts at zero). Keys with special characters such as a colon are written in brackets and quotes: <code>.["ietf-interfaces:interfaces"]</code>.</p>
<p>Take the GET output from R1 in the previous chapter. Its skeleton looks like this:</p>
<pre class="code">{
  "ietf-interfaces:interfaces": {        <span class="c">! object</span>
    "interface": [                       <span class="c">! array</span>
      { "name": "GigabitEthernet0/0", ... "ietf-ip:ipv4": { "address": [ { "ip": "10.20.0.1", ... } ] } },
      { "name": "GigabitEthernet0/1", "description": "TO-OLD-ISP", "enabled": false, ... }
    ]
  }
}</pre>

<div class="eg"><p><b>Worked example: three paths.</b></p>
<ul>
<li>Description of Gi0/1: <code>.["ietf-interfaces:interfaces"].interface[1].description</code> = <code>"TO-OLD-ISP"</code> (item 1 is the <i>second</i> interface).</li>
<li>Is Gi0/1 enabled? <code>.["ietf-interfaces:interfaces"].interface[1].enabled</code> = <code>false</code>, a boolean.</li>
<li>IP of Gi0/0: <code>.["ietf-interfaces:interfaces"].interface[0]["ietf-ip:ipv4"].address[0].ip</code> = <code>"10.20.0.1"</code>, a string inside an object inside an array inside an object.</li>
</ul></div>

<p>The lab's <code>json get</code> tool follows such a path inside a file and prints the value in JSON form, so a string keeps its quotes:</p>
<pre class="out">NMS&gt; json get enable.json '.["ietf-interfaces:interface"].name'
"GigabitEthernet0/1"
NMS&gt; json get enable.json '.["ietf-interfaces:interface"].enabled'
<span class="hl">"true"</span></pre>
<p>The quotes around <code>"true"</code> reveal the type problem instantly.</p>

<h3>Writing JSON by hand, step by step</h3>
<p>Requirement: "send R1 a body that sets the description of GigabitEthernet0/1 to WAN link to Branch-A and enables it". Build it like this:</p>
<ol>
<li>Write the outer braces first: <code>{ }</code>. Always type opening and closing brackets as a pair.</li>
<li>Add the top-level key the API expects, module-qualified for RESTCONF: <code>"ietf-interfaces:interface"</code>, followed by a colon and a new pair of braces.</li>
<li>Inside, add one key: value pair per line, a comma after every pair <b>except the last</b>.</li>
<li>Choose the right type for each value: text in double quotes, boolean without quotes.</li>
<li>Validate before sending.</li>
</ol>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/1",
    "description": "WAN link to Branch-A",
    "enabled": true
  }
}</pre>
<p>A second example, a list of two VLANs, each with an array of access ports:</p>
<pre class="code">{
  "vlans": [
    { "vlan_id": 10, "name": "SALES",       "ports": ["Gi0/3", "Gi0/4"] },
    { "vlan_id": 20, "name": "ENGINEERING", "ports": [] }
  ]
}</pre>
<p>An empty array <code>[]</code> is perfectly valid: VLAN 20 has no ports yet.</p>

<h3>The same data in XML and YAML</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Same data in JSON, XML and YAML">
<rect x="10" y="15" width="200" height="160" rx="8" fill="#bae6fd"/>
<text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">JSON</text>
<text x="22" y="68" class="svg-ink" font-size="12">{ "name": "Gi0/1",</text>
<text x="34" y="92" class="svg-ink" font-size="12">"enabled": true,</text>
<text x="34" y="116" class="svg-ink" font-size="12">"vlans": [10, 20] }</text>
<rect x="220" y="15" width="200" height="160" rx="8" fill="#fed7aa"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">XML</text>
<text x="232" y="68" class="svg-ink" font-size="12">&lt;name&gt;Gi0/1&lt;/name&gt;</text>
<text x="232" y="92" class="svg-ink" font-size="12">&lt;enabled&gt;true&lt;/enabled&gt;</text>
<text x="232" y="116" class="svg-ink" font-size="12">&lt;vlans&gt;10&lt;/vlans&gt;</text>
<text x="232" y="140" class="svg-ink" font-size="12">&lt;vlans&gt;20&lt;/vlans&gt;</text>
<rect x="430" y="15" width="200" height="160" rx="8" fill="#bbf7d0"/>
<text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">YAML</text>
<text x="442" y="68" class="svg-ink" font-size="12">name: Gi0/1</text>
<text x="442" y="92" class="svg-ink" font-size="12">enabled: true</text>
<text x="442" y="116" class="svg-ink" font-size="12">vlans:</text>
<text x="458" y="140" class="svg-ink" font-size="12">- 10</text>
<text x="458" y="164" class="svg-ink" font-size="12">- 20</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">brackets and quotes / tags / indentation and dashes</text>
</svg><p class="cap">One piece of data, three encodings. Recognise each at a glance.</p></div>

<p><b>XML</b> (eXtensible Markup Language) wraps each value in opening and closing <b>tags</b>. It is used by NETCONF and many older APIs. It is more verbose, and every value is text: the type comes from the data model, not from the syntax.</p>
<p><b>YAML</b> (YAML Ain't Markup Language) is designed for humans to write. It is the language of Ansible playbooks. Its basic rules:</p>
<ul>
<li><b>Indentation with spaces</b> (never tabs) shows nesting. Items at the same level start in the same column.</li>
<li><code>key: value</code> makes a mapping (like a JSON object); a space after the colon is required.</li>
<li><code>- item</code> makes a list item (like a JSON array element).</li>
<li>Strings usually need no quotes; quote them when they contain <code>: </code> or start with special characters such as <code>{</code>, <code>[</code>, <code>*</code> or <code>@</code>.</li>
<li><code>true</code>/<code>false</code> are booleans; <code>#</code> starts a comment; <code>---</code> marks the start of a document.</li>
<li>YAML 1.2 is a superset of JSON: valid JSON is also valid YAML.</li>
</ul>

<table class="cmp"><tr><th></th><th>JSON</th><th>XML</th><th>YAML</th></tr>
<tr><td>Structure shown by</td><td><code>{ } [ ]</code>, commas</td><td>Opening and closing tags</td><td>Indentation, <code>-</code> for lists</td></tr>
<tr><td>Comments</td><td>No</td><td>Yes <code>&lt;!-- --&gt;</code></td><td>Yes <code>#</code></td></tr>
<tr><td>Typical use</td><td>REST APIs, RESTCONF</td><td>NETCONF, older APIs</td><td>Ansible playbooks, config files</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Forgetting that array indexes start at 0. "The second interface" is <code>interface[1]</code>, not <code>interface[2]</code>. In YAML, the most common mistake is a line indented one space too far or too little, which silently changes the structure or breaks the file.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam shows a block of data and asks which format it is or how many objects and arrays it contains. Curly braces and quoted keys = JSON; angle-bracket tags = XML; indentation with dashes and no brackets = YAML. In JSON, count every <code>{</code> as one object and every <code>[</code> as one array.</p></div>

<div class="scn"><h4>The body that was YAML</h4><p>An engineer copied a working interface definition from an Ansible playbook and used it as the body of a RESTCONF PATCH. R1 answered <b>400 Bad Request</b> with "malformed JSON body: line 1, column 1". The data was correct but it was written in YAML, while the API expects JSON (Content-Type application/yang-data+json). Rewriting it with braces, double-quoted keys and commas fixed the call on the first try.</p><p><b>Lesson:</b> the same data has different encodings; each API and tool expects one of them.</p></div>

<div class="iv"><p class="q">"Here is a JSON document. How would you find the IP address of the first interface?"</p><p>Strong answer: walk the path from the outside in, saying the type at each step: the top-level object, the key holding the interface array, item 0 of that array (because indexes start at zero), then the address array inside it, item 0, and finally the <code>ip</code> key, whose value is a string. Then mention you would validate the syntax and check types before using data in automation, and that the same data could appear as XML (NETCONF) or YAML (Ansible).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read JSON with a path: <code>.key</code> into objects, <code>[n]</code> into arrays, indexes start at 0.</li>
<li>Write JSON outside in: brackets in pairs, commas between items but not after the last, correct types.</li>
<li>XML uses tags and is used by NETCONF; YAML uses indentation and dashes and is used by Ansible.</li>
<li>YAML: spaces not tabs, a space after every colon, <code>-</code> for list items, <code>#</code> for comments.</li>
<li>Recognise each format at a glance: braces and quotes, tags, or indentation.</li>
</ul></div>
`,hi:`
<p>Postal address bade se chhote ki taraf chalta hai: desh, shehar, gali, ghar number, flat. Chitthi pahunchane ke liye aap is raaste ko ek-ek step follow karte ho. Nested JSON bilkul isi tarah padha jaata hai: bahar se shuru karo, ek key mein jao, phir agli mein, jab tak woh value na mil jaaye jo chahiye. JSON likhna iska ulta hai: pehle lifaafa banao, phir bahar se andar ki taraf bharo.</p>

<h3>JSON padhna: path follow karo</h3>
<p>JSON mein kisi location ko hum ek <b>path</b> se describe karte hain. Dot aur key object ke andar le jaate hain (<code>.name</code>). Square brackets mein number array ke andar le jaata hai (<code>[0]</code> <b>pehla</b> item hai, kyunki ginti zero se shuru hoti hai). Colon jaise special characters wali keys brackets aur quotes mein likhi jaati hain: <code>.["ietf-interfaces:interfaces"]</code>.</p>
<p>Pichhle chapter ka R1 ka GET output lo. Uska dhaancha aisa dikhta hai:</p>
<pre class="code">{
  "ietf-interfaces:interfaces": {        <span class="c">! object</span>
    "interface": [                       <span class="c">! array</span>
      { "name": "GigabitEthernet0/0", ... "ietf-ip:ipv4": { "address": [ { "ip": "10.20.0.1", ... } ] } },
      { "name": "GigabitEthernet0/1", "description": "TO-OLD-ISP", "enabled": false, ... }
    ]
  }
}</pre>

<div class="eg"><p><b>Worked example: teen paths.</b></p>
<ul>
<li>Gi0/1 ka description: <code>.["ietf-interfaces:interfaces"].interface[1].description</code> = <code>"TO-OLD-ISP"</code> (item 1 <i>doosra</i> interface hai).</li>
<li>Kya Gi0/1 enabled hai? <code>.["ietf-interfaces:interfaces"].interface[1].enabled</code> = <code>false</code>, ek boolean.</li>
<li>Gi0/0 ka IP: <code>.["ietf-interfaces:interfaces"].interface[0]["ietf-ip:ipv4"].address[0].ip</code> = <code>"10.20.0.1"</code>, ek string jo object ke andar, array ke andar, object ke andar hai.</li>
</ul></div>

<p>Lab ka <code>json get</code> tool file ke andar aisa path follow karta hai aur value JSON form mein print karta hai, isliye string apne quotes rakhti hai:</p>
<pre class="out">NMS&gt; json get enable.json '.["ietf-interfaces:interface"].name'
"GigabitEthernet0/1"
NMS&gt; json get enable.json '.["ietf-interfaces:interface"].enabled'
<span class="hl">"true"</span></pre>
<p><code>"true"</code> ke aas-paas ke quotes type ki problem turant dikha dete hain.</p>

<h3>JSON haath se likhna, step by step</h3>
<p>Requirement: "R1 ko ek body bhejo jo GigabitEthernet0/1 ka description WAN link to Branch-A kare aur use enable kare". Ise aise banao:</p>
<ol>
<li>Pehle bahar ke braces likho: <code>{ }</code>. Opening aur closing brackets hamesha jodi mein type karo.</li>
<li>API jo top-level key expect karti hai woh jodo, RESTCONF ke liye module-qualified: <code>"ietf-interfaces:interface"</code>, uske baad colon aur braces ki nayi jodi.</li>
<li>Andar har line par ek key: value pair jodo, har pair ke baad comma <b>aakhri ko chhodkar</b>.</li>
<li>Har value ka sahi type chuno: text double quotes mein, boolean bina quotes ke.</li>
<li>Bhejne se pehle validate karo.</li>
</ol>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "GigabitEthernet0/1",
    "description": "WAN link to Branch-A",
    "enabled": true
  }
}</pre>
<p>Doosra example, do VLANs ki list, har ek ke saath access ports ka array:</p>
<pre class="code">{
  "vlans": [
    { "vlan_id": 10, "name": "SALES",       "ports": ["Gi0/3", "Gi0/4"] },
    { "vlan_id": 20, "name": "ENGINEERING", "ports": [] }
  ]
}</pre>
<p>Khaali array <code>[]</code> bilkul valid hai: VLAN 20 mein abhi koi port nahi hai.</p>

<h3>Same data XML aur YAML mein</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Same data JSON, XML aur YAML mein">
<rect x="10" y="15" width="200" height="160" rx="8" fill="#bae6fd"/>
<text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">JSON</text>
<text x="22" y="68" class="svg-ink" font-size="12">{ "name": "Gi0/1",</text>
<text x="34" y="92" class="svg-ink" font-size="12">"enabled": true,</text>
<text x="34" y="116" class="svg-ink" font-size="12">"vlans": [10, 20] }</text>
<rect x="220" y="15" width="200" height="160" rx="8" fill="#fed7aa"/>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">XML</text>
<text x="232" y="68" class="svg-ink" font-size="12">&lt;name&gt;Gi0/1&lt;/name&gt;</text>
<text x="232" y="92" class="svg-ink" font-size="12">&lt;enabled&gt;true&lt;/enabled&gt;</text>
<text x="232" y="116" class="svg-ink" font-size="12">&lt;vlans&gt;10&lt;/vlans&gt;</text>
<text x="232" y="140" class="svg-ink" font-size="12">&lt;vlans&gt;20&lt;/vlans&gt;</text>
<rect x="430" y="15" width="200" height="160" rx="8" fill="#bbf7d0"/>
<text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">YAML</text>
<text x="442" y="68" class="svg-ink" font-size="12">name: Gi0/1</text>
<text x="442" y="92" class="svg-ink" font-size="12">enabled: true</text>
<text x="442" y="116" class="svg-ink" font-size="12">vlans:</text>
<text x="458" y="140" class="svg-ink" font-size="12">- 10</text>
<text x="458" y="164" class="svg-ink" font-size="12">- 20</text>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">brackets aur quotes / tags / indentation aur dashes</text>
</svg><p class="cap">Ek data, teen encodings. Har ek ko ek nazar mein pehchaano.</p></div>

<p><b>XML</b> (eXtensible Markup Language) har value ko opening aur closing <b>tags</b> mein lapet-ta hai. NETCONF aur kai purani APIs ise use karti hain. Yeh zyada lamba hai, aur har value text hai: type data model se aata hai, syntax se nahi.</p>
<p><b>YAML</b> (YAML Ain't Markup Language) insaano ke likhne ke liye design hua hai. Yeh Ansible playbooks ki bhasha hai. Iske basic rules:</p>
<ul>
<li><b>Spaces se indentation</b> (tabs kabhi nahi) nesting dikhata hai. Same level ke items same column se shuru hote hain.</li>
<li><code>key: value</code> ek mapping banata hai (JSON object jaisa); colon ke baad space zaroori hai.</li>
<li><code>- item</code> ek list item banata hai (JSON array element jaisa).</li>
<li>Strings ko aam taur par quotes nahi chahiye; unhe quote karo jab unmein <code>: </code> ho ya woh <code>{</code>, <code>[</code>, <code>*</code> ya <code>@</code> jaise special characters se shuru hon.</li>
<li><code>true</code>/<code>false</code> booleans hain; <code>#</code> comment shuru karta hai; <code>---</code> document ki shuruaat mark karta hai.</li>
<li>YAML 1.2 JSON ka superset hai: valid JSON valid YAML bhi hai.</li>
</ul>

<table class="cmp"><tr><th></th><th>JSON</th><th>XML</th><th>YAML</th></tr>
<tr><td>Structure kaise dikhta hai</td><td><code>{ } [ ]</code>, commas</td><td>Opening aur closing tags</td><td>Indentation, lists ke liye <code>-</code></td></tr>
<tr><td>Comments</td><td>Nahi</td><td>Haan <code>&lt;!-- --&gt;</code></td><td>Haan <code>#</code></td></tr>
<tr><td>Aam use</td><td>REST APIs, RESTCONF</td><td>NETCONF, purani APIs</td><td>Ansible playbooks, config files</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Bhool jaana ki array indexes 0 se shuru hote hain. "Doosra interface" <code>interface[1]</code> hai, <code>interface[2]</code> nahi. YAML mein sabse common galti ek line ko ek space zyada ya kam indent karna hai, jo chupchaap structure badal deta hai ya file tod deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam data ka ek block dikhata hai aur poochta hai yeh kaunsa format hai ya ismein kitne objects aur arrays hain. Curly braces aur quoted keys = JSON; angle-bracket tags = XML; dashes ke saath indentation aur koi brackets nahi = YAML. JSON mein har <code>{</code> ko ek object aur har <code>[</code> ko ek array gino.</p></div>

<div class="scn"><h4>Woh body jo YAML thi</h4><p>Ek engineer ne Ansible playbook se ek chalti hui interface definition copy ki aur use RESTCONF PATCH ki body ki tarah use kiya. R1 ne "malformed JSON body: line 1, column 1" ke saath <b>400 Bad Request</b> diya. Data sahi tha par YAML mein likha tha, jabki API JSON expect karti hai (Content-Type application/yang-data+json). Braces, double-quoted keys aur commas ke saath dobara likhne se call pehli koshish mein chal gayi.</p><p><b>Seekh:</b> same data ki alag encodings hoti hain; har API aur tool unmein se ek expect karta hai.</p></div>

<div class="iv"><p class="q">"Yeh ek JSON document hai. Pehle interface ka IP address kaise dhoondoge?"</p><p>Strong answer: path ko bahar se andar ki taraf chalo, har step par type batate hue: top-level object, woh key jismein interface array hai, us array ka item 0 (kyunki indexes zero se shuru hote hain), phir uske andar address array, item 0, aur aakhir mein <code>ip</code> key, jiski value ek string hai. Phir batao ki automation mein data use karne se pehle aap syntax validate aur types check karoge, aur yahi data XML (NETCONF) ya YAML (Ansible) mein bhi aa sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON ko path se padho: objects mein <code>.key</code>, arrays mein <code>[n]</code>, indexes 0 se shuru.</li>
<li>JSON bahar se andar likho: brackets jodi mein, items ke beech commas par aakhri ke baad nahi, sahi types.</li>
<li>XML tags use karta hai aur NETCONF mein use hota hai; YAML indentation aur dashes use karta hai aur Ansible mein use hota hai.</li>
<li>YAML: tabs nahi spaces, har colon ke baad space, list items ke liye <code>-</code>, comments ke liye <code>#</code>.</li>
<li>Har format ek nazar mein pehchaano: braces aur quotes, tags, ya indentation.</li>
</ul></div>
`}};export{e as default};