var e={id:`formats`,h:{en:`JSON, XML and YAML for network engineers, and data models (YANG)`,hi:`Network engineers ke liye JSON, XML aur YAML, aur data models (YANG)`},body:{en:`
<p>Think of a shipping form at a courier office. Every form has the same boxes: sender, receiver, weight, address. Because the boxes are fixed, any clerk in any city can read any form without asking what you meant. Data formats are the shipping forms of automation. They give every value a <b>name</b> and a <b>place</b>, so a program can read "the MTU of Ethernet1/5" without guessing which column it sits in.</p>

<h3>Why screen output is not enough</h3>
<p>The normal CLI output of <code>show interface brief</code> is written for human eyes: columns padded with spaces, headings, sometimes lines that wrap. A script that splits this text on spaces breaks the day a new release adds a column or a description contains a space. <b>Structured data</b> solves this by labelling every value. The three formats you will meet constantly are JSON, XML and YAML. They hold exactly the same kind of information; only the punctuation differs.</p>

<h3>The same interface in all three formats</h3>
<p>Here is one trunk interface, Ethernet1/5, with a description, an MTU, an admin state and a list of allowed VLANs.</p>
<p><b>JSON</b> (JavaScript Object Notation): curly braces for objects, square brackets for lists, keys in double quotes.</p>
<pre class="code">{
  "interface": {
    "name": "Ethernet1/5",
    "description": "to SRV1 web",
    "enabled": true,
    "mtu": 9216,
    "mode": "trunk",
    "allowed_vlans": [10, 20, 30]
  }
}</pre>
<p><b>XML</b> (eXtensible Markup Language): every value sits between an opening and a closing tag; a list is simply the same tag repeated.</p>
<pre class="code">&lt;interface&gt;
  &lt;name&gt;Ethernet1/5&lt;/name&gt;
  &lt;description&gt;to SRV1 web&lt;/description&gt;
  &lt;enabled&gt;true&lt;/enabled&gt;
  &lt;mtu&gt;9216&lt;/mtu&gt;
  &lt;mode&gt;trunk&lt;/mode&gt;
  &lt;allowed_vlan&gt;10&lt;/allowed_vlan&gt;
  &lt;allowed_vlan&gt;20&lt;/allowed_vlan&gt;
  &lt;allowed_vlan&gt;30&lt;/allowed_vlan&gt;
&lt;/interface&gt;</pre>
<p><b>YAML</b> (YAML Ain't Markup Language): no braces or tags; <b>indentation with spaces</b> shows nesting, and a dash starts a list item. It is the easiest for humans to write, which is why Ansible uses it.</p>
<pre class="code">interface:
  name: Ethernet1/5
  description: to SRV1 web
  enabled: true
  mtu: 9216
  mode: trunk
  allowed_vlans:
    - 10
    - 20
    - 30</pre>

<table class="cmp"><tr><th>Format</th><th>Where you meet it</th><th>Watch out for</th></tr>
<tr><td><b>JSON</b></td><td>NX-API responses, <code>| json</code>, REST APIs, ACI, telemetry collectors</td><td>Double quotes only, no trailing comma, no comments</td></tr>
<tr><td><b>XML</b></td><td>NETCONF, <code>| xml</code>, older APIs, ACI (also supports XML)</td><td>Every tag must be closed; namespaces; very verbose</td></tr>
<tr><td><b>YAML</b></td><td>Ansible playbooks and inventories, config templates, CI pipelines</td><td>Tabs are illegal; indentation errors change meaning; <code>yes/no/on/off</code> may become true/false</td></tr>
</table>

<h3>The building blocks: objects, lists and values</h3>
<p>Every format is built from the same three ideas. An <b>object</b> (also called a dictionary or map) is a set of key-value pairs, such as <code>"mtu": 9216</code>. A <b>list</b> (array) is an ordered set of items, such as <code>[10, 20, 30]</code>. A <b>value</b> is a string, a number, a boolean (<code>true</code>/<code>false</code>) or null. In Python, a JSON object becomes a <code>dict</code> and a JSON list becomes a <code>list</code>, so reading data is just following the path of keys and positions.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Path through a JSON document">
<rect x="10" y="60" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">data</text>
<rect x="160" y="60" width="120" height="40" rx="8" fill="#bae6fd"/><text x="220" y="85" text-anchor="middle" class="svg-ink" font-size="13">"interface"</text>
<rect x="320" y="60" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="390" y="85" text-anchor="middle" class="svg-ink" font-size="13">"allowed_vlans"</text>
<rect x="500" y="60" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">[2] = 30</text>
<line x1="120" y1="80" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="280" y1="80" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="460" y1="80" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="220" y="40" text-anchor="middle" class="svg-muted" font-size="12">object key</text>
<text x="390" y="40" text-anchor="middle" class="svg-muted" font-size="12">list key</text>
<text x="560" y="40" text-anchor="middle" class="svg-muted" font-size="12">position (from 0)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">data["interface"]["allowed_vlans"][2]</text>
</svg><p class="cap">Reading structured data is following a path: keys for objects, positions (starting at 0) for lists.</p></div>

<div class="eg"><p><b>Worked example.</b> Using the JSON above, <code>data["interface"]["mtu"]</code> returns the number 9216, and <code>data["interface"]["allowed_vlans"]</code> returns the list [10, 20, 30]. The third VLAN is at position 2, because lists count from 0, so <code>data["interface"]["allowed_vlans"][2]</code> is 30. <code>len(data["interface"]["allowed_vlans"])</code> is 3. If a colleague asks "is VLAN 20 allowed?", the script checks <code>20 in data["interface"]["allowed_vlans"]</code> and gets True, no text parsing needed.</p></div>

<h3>Data models and YANG, at concept level</h3>
<p>A format says how to <b>write</b> data. A <b>data model</b> says what data is <b>allowed</b>: which fields exist, their types, and their limits. <b>YANG</b> (Yet Another Next Generation, RFC 7950) is the standard language for network data models. A YANG model is like the blank courier form itself: it defines that an interface has a name (a string, used as the key), an MTU (a number in a range) and an enabled flag (a boolean, default true).</p>
<pre class="code"><span class="c">// a simplified YANG snippet</span>
container interfaces {
  list interface {
    key "name";
    leaf name    { type string; }
    leaf mtu     { type uint16 { range "576..9216"; } }
    leaf enabled { type boolean; default true; }
  }
}</pre>
<p>YANG terms: a <b>container</b> groups things, a <b>list</b> holds many entries identified by a <b>key</b>, a <b>leaf</b> is a single value and a <b>leaf-list</b> is a list of single values. Models come from standards bodies (<b>IETF</b>, such as ietf-interfaces), from the operator community (<b>OpenConfig</b>, vendor neutral) and from vendors (<b>Cisco native</b> NX-OS models, which mirror the NX-OS object tree). The model is then carried by a protocol: <b>NETCONF</b> (over SSH, port 830, XML), <b>RESTCONF</b> (over HTTPS, JSON or XML) or <b>gNMI</b> (over gRPC). On NX-OS these are enabled with <code>feature netconf</code>, <code>feature restconf</code> and <code>feature grpc</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Mixing tabs and spaces in YAML (Ansible will fail with a parse error). Writing a JSON list with a trailing comma, <code>[10, 20, 30,]</code>, which is invalid. Forgetting that a YAML value like <code>no</code> or <code>on</code> may be read as a boolean, so a description of "no" should be quoted. Assuming positions in a list never change: always look items up by a key such as the interface name when you can.</p></div>
<div class="exam"><p><b>Exam trap.</b> YANG is a <b>modelling language</b>, not a transport and not an encoding. NETCONF uses XML encoding over SSH; RESTCONF uses HTTPS with JSON or XML; gNMI uses gRPC. JSON and XML are encodings; YAML is mostly used for human-written input such as playbooks.</p></div>

<div class="scn"><h4>The playbook that silently skipped a VLAN</h4><p>A junior engineer added VLAN 40 to an Ansible variables file, but used a tab to indent the new line. The playbook failed on the first run with a YAML syntax error. He "fixed" it by moving the line to the left, which made <code>- 40</code> part of a different key, so the play ran green but VLAN 40 never appeared on the leaves. A reviewer ran a YAML linter, saw the wrong nesting, and re-indented with two spaces. The team then added a lint step to every pull request.</p><p><b>Lesson:</b> in YAML, indentation is meaning. Validate files with a linter before any playbook touches the network.</p></div>

<div class="iv"><p class="q">"What is the difference between JSON, XML and YANG?"</p><p>Strong answer: JSON and XML are <b>encodings</b>, ways of writing structured data (JSON with objects and arrays, XML with nested tags). YANG is a <b>data modelling language</b> that defines what data exists and its types and constraints, independent of encoding. The same YANG model can be carried as XML over NETCONF or as JSON over RESTCONF. Mention YAML as the human-friendly format Ansible uses, and give an example path such as an interface MTU.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON, XML and YAML all describe objects, lists and values; they differ only in punctuation.</li>
<li>JSON is the language of NX-API and REST; XML of NETCONF; YAML of Ansible.</li>
<li>Read structured data by following keys and list positions (lists count from 0).</li>
<li>YANG models define which data is allowed; IETF, OpenConfig and Cisco native models all exist.</li>
<li>NETCONF (SSH 830, XML), RESTCONF (HTTPS, JSON/XML) and gNMI (gRPC) carry model-driven data.</li>
</ul></div>
`,hi:`
<p>Courier office ke shipping form ke baare mein socho. Har form mein same boxes hote hain: sender, receiver, weight, address. Kyunki boxes fixed hain, kisi bhi shehar ka koi bhi clerk koi bhi form padh sakta hai bina pooche ki aapka matlab kya tha. Data formats automation ke shipping forms hain. Yeh har value ko ek <b>naam</b> aur ek <b>jagah</b> dete hain, taaki program "Ethernet1/5 ka MTU" padh sake bina guess kiye ki woh kaunse column mein hai.</p>

<h3>Screen output kaafi kyun nahi hai</h3>
<p><code>show interface brief</code> ka normal CLI output insaano ki aankhon ke liye likha jaata hai: spaces se padded columns, headings, kabhi kabhi wrap hoti lines. Jo script is text ko spaces par split karti hai, woh us din toot jaati hai jab nayi release ek column jodti hai ya kisi description mein space hota hai. <b>Structured data</b> har value par label laga kar yeh problem solve karta hai. Teen formats jo aapko baar baar milenge woh hain JSON, XML aur YAML. Teeno bilkul same tarah ki information rakhte hain; sirf punctuation alag hai.</p>

<h3>Ek hi interface teeno formats mein</h3>
<p>Yeh ek trunk interface hai, Ethernet1/5, jiske paas description, MTU, admin state aur allowed VLANs ki list hai.</p>
<p><b>JSON</b> (JavaScript Object Notation): objects ke liye curly braces, lists ke liye square brackets, keys double quotes mein.</p>
<pre class="code">{
  "interface": {
    "name": "Ethernet1/5",
    "description": "to SRV1 web",
    "enabled": true,
    "mtu": 9216,
    "mode": "trunk",
    "allowed_vlans": [10, 20, 30]
  }
}</pre>
<p><b>XML</b> (eXtensible Markup Language): har value ek opening aur closing tag ke beech baithti hai; list bas same tag ka repeat hona hai.</p>
<pre class="code">&lt;interface&gt;
  &lt;name&gt;Ethernet1/5&lt;/name&gt;
  &lt;description&gt;to SRV1 web&lt;/description&gt;
  &lt;enabled&gt;true&lt;/enabled&gt;
  &lt;mtu&gt;9216&lt;/mtu&gt;
  &lt;mode&gt;trunk&lt;/mode&gt;
  &lt;allowed_vlan&gt;10&lt;/allowed_vlan&gt;
  &lt;allowed_vlan&gt;20&lt;/allowed_vlan&gt;
  &lt;allowed_vlan&gt;30&lt;/allowed_vlan&gt;
&lt;/interface&gt;</pre>
<p><b>YAML</b> (YAML Ain't Markup Language): na braces na tags; <b>spaces wala indentation</b> nesting dikhata hai, aur dash list item shuru karta hai. Insaano ke liye likhna sabse aasaan hai, isiliye Ansible ise use karta hai.</p>
<pre class="code">interface:
  name: Ethernet1/5
  description: to SRV1 web
  enabled: true
  mtu: 9216
  mode: trunk
  allowed_vlans:
    - 10
    - 20
    - 30</pre>

<table class="cmp"><tr><th>Format</th><th>Kahan milta hai</th><th>Dhyan rakho</th></tr>
<tr><td><b>JSON</b></td><td>NX-API responses, <code>| json</code>, REST APIs, ACI, telemetry collectors</td><td>Sirf double quotes, trailing comma nahi, comments nahi</td></tr>
<tr><td><b>XML</b></td><td>NETCONF, <code>| xml</code>, purane APIs, ACI (XML bhi support karta hai)</td><td>Har tag close hona chahiye; namespaces; bahut lamba</td></tr>
<tr><td><b>YAML</b></td><td>Ansible playbooks aur inventories, config templates, CI pipelines</td><td>Tabs illegal hain; indentation ki galti matlab badal deti hai; <code>yes/no/on/off</code> true/false ban sakte hain</td></tr>
</table>

<h3>Building blocks: objects, lists aur values</h3>
<p>Har format same teen ideas se bana hai. <b>Object</b> (dictionary ya map bhi kehte hain) key-value pairs ka set hai, jaise <code>"mtu": 9216</code>. <b>List</b> (array) items ka ordered set hai, jaise <code>[10, 20, 30]</code>. <b>Value</b> ek string, number, boolean (<code>true</code>/<code>false</code>) ya null hoti hai. Python mein JSON object <code>dict</code> ban jaata hai aur JSON list <code>list</code> ban jaati hai, isliye data padhna bas keys aur positions ka path follow karna hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="JSON document mein path">
<rect x="10" y="60" width="110" height="40" rx="8" fill="#ddd6fe"/><text x="65" y="85" text-anchor="middle" class="svg-ink" font-size="13">data</text>
<rect x="160" y="60" width="120" height="40" rx="8" fill="#bae6fd"/><text x="220" y="85" text-anchor="middle" class="svg-ink" font-size="13">"interface"</text>
<rect x="320" y="60" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="390" y="85" text-anchor="middle" class="svg-ink" font-size="13">"allowed_vlans"</text>
<rect x="500" y="60" width="120" height="40" rx="8" fill="#fde68a"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">[2] = 30</text>
<line x1="120" y1="80" x2="160" y2="80" stroke="#64748b" stroke-width="2"/><line x1="280" y1="80" x2="320" y2="80" stroke="#64748b" stroke-width="2"/><line x1="460" y1="80" x2="500" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="220" y="40" text-anchor="middle" class="svg-muted" font-size="12">object key</text>
<text x="390" y="40" text-anchor="middle" class="svg-muted" font-size="12">list key</text>
<text x="560" y="40" text-anchor="middle" class="svg-muted" font-size="12">position (0 se)</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">data["interface"]["allowed_vlans"][2]</text>
</svg><p class="cap">Structured data padhna ek path follow karna hai: objects ke liye keys, lists ke liye positions (0 se shuru).</p></div>

<div class="eg"><p><b>Worked example.</b> Upar wale JSON mein <code>data["interface"]["mtu"]</code> number 9216 deta hai, aur <code>data["interface"]["allowed_vlans"]</code> list [10, 20, 30] deta hai. Teesra VLAN position 2 par hai, kyunki lists 0 se ginti hain, isliye <code>data["interface"]["allowed_vlans"][2]</code> 30 hai. <code>len(data["interface"]["allowed_vlans"])</code> 3 hai. Agar colleague pooche "kya VLAN 20 allowed hai?", to script <code>20 in data["interface"]["allowed_vlans"]</code> check karti hai aur True paati hai, koi text parsing nahi chahiye.</p></div>

<h3>Data models aur YANG, concept level par</h3>
<p>Format batata hai ki data kaise <b>likhna</b> hai. <b>Data model</b> batata hai ki kaunsa data <b>allowed</b> hai: kaunse fields exist karte hain, unke types, aur unki limits. <b>YANG</b> (Yet Another Next Generation, RFC 7950) network data models ki standard language hai. YANG model khud khaali courier form jaisa hai: yeh define karta hai ki interface ka ek naam hai (string, key ki tarah use hota hai), ek MTU hai (range wala number) aur ek enabled flag hai (boolean, default true).</p>
<pre class="code"><span class="c">// ek simplified YANG snippet</span>
container interfaces {
  list interface {
    key "name";
    leaf name    { type string; }
    leaf mtu     { type uint16 { range "576..9216"; } }
    leaf enabled { type boolean; default true; }
  }
}</pre>
<p>YANG terms: <b>container</b> cheezon ko group karta hai, <b>list</b> kai entries rakhti hai jo <b>key</b> se pehchani jaati hain, <b>leaf</b> ek single value hai aur <b>leaf-list</b> single values ki list hai. Models standards bodies se aate hain (<b>IETF</b>, jaise ietf-interfaces), operator community se (<b>OpenConfig</b>, vendor neutral) aur vendors se (<b>Cisco native</b> NX-OS models, jo NX-OS object tree ko mirror karte hain). Phir model ko ek protocol le jaata hai: <b>NETCONF</b> (SSH par, port 830, XML), <b>RESTCONF</b> (HTTPS par, JSON ya XML) ya <b>gNMI</b> (gRPC par). NX-OS par yeh <code>feature netconf</code>, <code>feature restconf</code> aur <code>feature grpc</code> se enable hote hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> YAML mein tabs aur spaces mix karna (Ansible parse error ke saath fail hoga). JSON list trailing comma ke saath likhna, <code>[10, 20, 30,]</code>, jo invalid hai. Bhool jaana ki YAML value jaise <code>no</code> ya <code>on</code> boolean padhi ja sakti hai, isliye "no" wali description ko quote karo. Yeh maan lena ki list mein positions kabhi nahi badalti: jab ho sake items ko interface name jaisi key se dhoondho.</p></div>
<div class="exam"><p><b>Exam trap.</b> YANG ek <b>modelling language</b> hai, transport nahi aur encoding bhi nahi. NETCONF SSH par XML encoding use karta hai; RESTCONF HTTPS ke saath JSON ya XML; gNMI gRPC use karta hai. JSON aur XML encodings hain; YAML zyada tar insaano ke likhe input jaise playbooks ke liye use hota hai.</p></div>

<div class="scn"><h4>Woh playbook jisne chupchaap ek VLAN chhod diya</h4><p>Ek junior engineer ne Ansible variables file mein VLAN 40 joda, lekin nayi line ko indent karne ke liye tab use kiya. Pehli run par playbook YAML syntax error ke saath fail hui. Usne line ko left khiska kar "theek" kiya, jisse <code>- 40</code> kisi dusri key ka hissa ban gaya, to play green chali lekin VLAN 40 leaves par kabhi nahi aaya. Ek reviewer ne YAML linter chalaya, galat nesting dekhi, aur do spaces se re-indent kiya. Phir team ne har pull request mein lint step jod diya.</p><p><b>Seekh:</b> YAML mein indentation hi matlab hai. Koi bhi playbook network ko chhoone se pehle files ko linter se validate karo.</p></div>

<div class="iv"><p class="q">"JSON, XML aur YANG mein kya farak hai?"</p><p>Strong answer: JSON aur XML <b>encodings</b> hain, structured data likhne ke tareeke (JSON objects aur arrays ke saath, XML nested tags ke saath). YANG ek <b>data modelling language</b> hai jo define karti hai ki kaunsa data exist karta hai aur uske types aur constraints kya hain, encoding se independent. Same YANG model NETCONF par XML ki tarah ya RESTCONF par JSON ki tarah ja sakta hai. YAML ka zikr karo jo human-friendly format hai aur Ansible use karta hai, aur ek example path do jaise interface MTU.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON, XML aur YAML teeno objects, lists aur values describe karte hain; farak sirf punctuation ka hai.</li>
<li>JSON NX-API aur REST ki language hai; XML NETCONF ki; YAML Ansible ki.</li>
<li>Structured data keys aur list positions follow karke padho (lists 0 se ginti hain).</li>
<li>YANG models define karte hain ki kaunsa data allowed hai; IETF, OpenConfig aur Cisco native models sab exist karte hain.</li>
<li>NETCONF (SSH 830, XML), RESTCONF (HTTPS, JSON/XML) aur gNMI (gRPC) model-driven data le jaate hain.</li>
</ul></div>
`}};export{e as default};