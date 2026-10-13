var e={id:`json`,h:{en:`JSON: syntax, data types and common errors`,hi:`JSON: syntax, data types aur common errors`},body:{en:`
<p>Think of a visiting card. Every card has <b>labels</b> and <b>values</b>: "Name: Priya", "Phone: 98xxxxxx01", "Company: NK Networks". Anyone, in any country, can read it because the layout is predictable. <b>JSON</b> is a visiting card for data: a simple, strict layout of labels and values that every programming language and every API can read.</p>

<h3>What JSON is</h3>
<p><b>JSON</b> (JavaScript Object Notation) is a text format for structured data. Despite the name it has nothing to do with JavaScript today: Python, Ansible, Go, controllers and routers all read and write it. It is the default data encoding for REST APIs, including RESTCONF and the Catalyst Center API. JSON is built from only <b>two structures</b> and <b>six value types</b>.</p>

<h3>The two structures</h3>
<ul>
<li><b>Object</b>: curly braces <code>{ }</code> holding <b>key: value</b> pairs separated by commas. A key is always a string in <b>double quotes</b>. The order of keys does not matter.</li>
<li><b>Array</b>: square brackets <code>[ ]</code> holding values separated by commas. The order <b>does</b> matter: item 0, item 1, item 2.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Parts of a JSON object">
<rect x="10" y="15" width="620" height="120" rx="10" fill="#e2e8f0"/>
<text x="30" y="40" class="svg-ink" font-size="14">object { }</text>
<rect x="30" y="55" width="160" height="60" rx="8" fill="#bae6fd"/>
<text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="13">"vlan_id": 10</text>
<rect x="205" y="55" width="170" height="60" rx="8" fill="#bbf7d0"/>
<text x="290" y="90" text-anchor="middle" class="svg-ink" font-size="13">"name": "SALES"</text>
<rect x="390" y="55" width="225" height="60" rx="8" fill="#fde68a"/>
<text x="502" y="90" text-anchor="middle" class="svg-ink" font-size="13">"ports": ["Gi0/1", "Gi0/2"]</text>
<text x="110" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: number</text>
<text x="290" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: string</text>
<text x="502" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: array of strings</text>
<text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="12">one object, three key: value pairs, commas between pairs</text>
</svg><p class="cap">Keys are always double-quoted strings; values can be any of the six types.</p></div>

<h3>The six value types</h3>
<table class="cmp"><tr><th>Type</th><th>Valid examples</th><th>Not valid / not this type</th></tr>
<tr><td><b>string</b></td><td><code>"GigabitEthernet0/1"</code>, <code>"10.20.0.1"</code>, <code>""</code></td><td><code>'SALES'</code> (single quotes)</td></tr>
<tr><td><b>number</b></td><td><code>10</code>, <code>1500</code>, <code>-3</code>, <code>99.5</code></td><td><code>"10"</code> is a string; <code>010</code> (leading zero) is invalid</td></tr>
<tr><td><b>boolean</b></td><td><code>true</code>, <code>false</code></td><td><code>True</code>, <code>TRUE</code>, <code>"true"</code></td></tr>
<tr><td><b>null</b></td><td><code>null</code></td><td><code>None</code>, <code>NULL</code></td></tr>
<tr><td><b>object</b></td><td><code>{"ip": "10.20.0.1"}</code>, <code>{}</code></td><td><code>{ip: "10.20.0.1"}</code> (unquoted key)</td></tr>
<tr><td><b>array</b></td><td><code>[10, 20, 30]</code>, <code>[]</code></td><td><code>[10, 20, 30,]</code> (trailing comma)</td></tr></table>
<p>Notice that an IP address is a <b>string</b>: <code>10.20.0.1</code> without quotes is not a valid number. Whitespace, line breaks and indentation between tokens are ignored; they only help humans.</p>

<h3>Examples from simple to nested</h3>
<pre class="code"><span class="c">! 1. one flat object</span>
{"hostname": "R1", "model": "ISR4331", "uptime_days": 42}

<span class="c">! 2. an array of numbers</span>
[10, 20, 30]

<span class="c">! 3. an array of objects: a VLAN list</span>
[
  {"vlan_id": 10, "name": "SALES"},
  {"vlan_id": 20, "name": "ENGINEERING"}
]

<span class="c">! 4. nesting: an object inside an object, an array inside that</span>
{
  "device": {
    "hostname": "SW1",
    "managed": true,
    "location": null,
    "vlans": [10, 20],
    "mgmt": {"ip": "10.30.0.11", "mask": 24}
  }
}</pre>
<p>In example 4, <code>device</code> is an object; <code>hostname</code> is a string; <code>managed</code> is a boolean; <code>location</code> is null (known key, no value); <code>vlans</code> is an array of numbers; <code>mgmt</code> is a nested object. (The lines starting with <code>!</code> are our comments for you. JSON itself does <b>not</b> allow comments.)</p>

<div class="eg"><p><b>Worked example.</b> Count the parts of example 3: the outer value is an <b>array</b> with <b>2</b> items; each item is an <b>object</b> with <b>2</b> keys; so there are 4 key: value pairs, 2 numbers and 2 strings. Exam questions often ask exactly this: "how many objects", "how many arrays", "what type is this value".</p></div>

<h3>The errors that break JSON</h3>
<table class="cmp"><tr><th>Broken</th><th>Why</th><th>Fixed</th></tr>
<tr><td><code>{"a": 1,}</code></td><td>Trailing comma after the last member</td><td><code>{"a": 1}</code></td></tr>
<tr><td><code>{'a': 'b'}</code></td><td>Single quotes</td><td><code>{"a": "b"}</code></td></tr>
<tr><td><code>{a: 1}</code></td><td>Key without quotes</td><td><code>{"a": 1}</code></td></tr>
<tr><td><code>{"a": 1 "b": 2}</code></td><td>Missing comma between members</td><td><code>{"a": 1, "b": 2}</code></td></tr>
<tr><td><code>{"a": [1, 2}</code></td><td>Unclosed array</td><td><code>{"a": [1, 2]}</code></td></tr>
<tr><td><code>{"up": True}</code></td><td>Boolean must be lowercase</td><td><code>{"up": true}</code></td></tr>
<tr><td><code>{"a" = 1}</code></td><td>Key and value are separated by a colon</td><td><code>{"a": 1}</code></td></tr></table>

<p>The lab's <code>json validate</code> tool points at the exact spot. Here it is on the broken <code>desc.json</code> from Lab 1, and again after the fix:</p>
<pre class="out">NMS&gt; json validate desc.json
desc.json: INVALID JSON
<span class="hl">  line 3, column 1: trailing comma is not allowed before '}'</span>
    3 | }
      | ^
NMS&gt; sed -i '2s/,$//' desc.json
NMS&gt; json validate desc.json
desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</pre>
<p>The error is reported at the <code>}</code> on line 3, but the mistake is the comma at the end of line 2. Parsers report where they <i>noticed</i> the problem, which is often just after the real mistake.</p>
<p>A file can also be valid JSON but carry the <b>wrong type</b>. <code>json types</code> shows the type of every value:</p>
<pre class="out">NMS&gt; json types enable.json
.                                                         object
.["ietf-interfaces:interface"]                            object
.["ietf-interfaces:interface"].name                       string
<span class="hl">.["ietf-interfaces:interface"].enabled                    string</span></pre>
<p>The model expects a boolean, so this is the 400 error you met in the previous chapter.</p>

<div class="warn"><p><b>Common mistake.</b> Copying JSON from a chat window or a word processor. They often turn straight quotes into curly "smart" quotes, which are different characters, and the file becomes invalid even though it looks right. Always paste into a plain-text editor and validate.</p></div>

<div class="exam"><p><b>Exam trap.</b> Anything in double quotes is a string, even <code>"10"</code> and <code>"true"</code>. Objects use <code>{ }</code> and key: value pairs; arrays use <code>[ ]</code> and plain values. Keys must be double-quoted strings. JSON has no comments and no trailing commas. Whitespace does not matter.</p></div>

<div class="scn"><h4>The VLAN script that read "010"</h4><p>A team's script created VLANs from a JSON file. A new engineer edited the file and typed <code>"vlan_id": 010</code> for VLAN 10. The whole run stopped with "invalid number" because JSON forbids leading zeros. He changed it to <code>"vlan_id": "010"</code>, the file became valid, but now the API returned 400 because a VLAN ID must be a number. The fix was simply <code>"vlan_id": 10</code>.</p><p><b>Lesson:</b> check two things every time: is the JSON syntax valid, and does every value have the type the API expects?</p></div>

<div class="iv"><p class="q">"What data types does JSON support, and what is the difference between an object and an array?"</p><p>Strong answer: six types: string (double quotes), number, boolean (true or false, lowercase), null, object and array. An object is an unordered set of key: value pairs in curly braces with double-quoted string keys; an array is an ordered list of values in square brackets. Give a network example, such as an interface object containing an array of address objects, and mention the classic errors: trailing commas, single quotes and quoted booleans.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON = two structures (object <code>{ }</code>, array <code>[ ]</code>) and six types (string, number, boolean, null, object, array).</li>
<li>Keys and strings use double quotes; booleans are lowercase <code>true</code>/<code>false</code>; IP addresses are strings.</li>
<li>No trailing commas, no single quotes, no comments, no leading zeros in numbers.</li>
<li>Valid syntax is not enough: the value types must match what the API or data model expects.</li>
<li>Validate first (<code>json validate</code>), then check types (<code>json types</code>).</li>
</ul></div>
`,hi:`
<p>Ek visiting card socho. Har card par <b>labels</b> aur <b>values</b> hote hain: "Name: Priya", "Phone: 98xxxxxx01", "Company: NK Networks". Kisi bhi desh mein koi bhi use padh sakta hai kyunki layout predictable hai. <b>JSON</b> data ke liye visiting card hai: labels aur values ka ek simple, strict layout jo har programming language aur har API padh sakti hai.</p>

<h3>JSON kya hai</h3>
<p><b>JSON</b> (JavaScript Object Notation) structured data ke liye ek text format hai. Naam ke bawajood aaj iska JavaScript se koi lena-dena nahi: Python, Ansible, Go, controllers aur routers sab ise padhte aur likhte hain. Yeh REST APIs ka default data encoding hai, RESTCONF aur Catalyst Center API samet. JSON sirf <b>do structures</b> aur <b>chhe value types</b> se banta hai.</p>

<h3>Do structures</h3>
<ul>
<li><b>Object</b>: curly braces <code>{ }</code> jinmein commas se alag <b>key: value</b> pairs hote hain. Key hamesha <b>double quotes</b> mein string hoti hai. Keys ka order matter nahi karta.</li>
<li><b>Array</b>: square brackets <code>[ ]</code> jinmein commas se alag values hoti hain. Yahan order <b>matter karta hai</b>: item 0, item 1, item 2.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="JSON object ke hisse">
<rect x="10" y="15" width="620" height="120" rx="10" fill="#e2e8f0"/>
<text x="30" y="40" class="svg-ink" font-size="14">object { }</text>
<rect x="30" y="55" width="160" height="60" rx="8" fill="#bae6fd"/>
<text x="110" y="90" text-anchor="middle" class="svg-ink" font-size="13">"vlan_id": 10</text>
<rect x="205" y="55" width="170" height="60" rx="8" fill="#bbf7d0"/>
<text x="290" y="90" text-anchor="middle" class="svg-ink" font-size="13">"name": "SALES"</text>
<rect x="390" y="55" width="225" height="60" rx="8" fill="#fde68a"/>
<text x="502" y="90" text-anchor="middle" class="svg-ink" font-size="13">"ports": ["Gi0/1", "Gi0/2"]</text>
<text x="110" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: number</text>
<text x="290" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: string</text>
<text x="502" y="158" text-anchor="middle" class="svg-accent" font-size="12">key: strings ka array</text>
<text x="320" y="188" text-anchor="middle" class="svg-muted" font-size="12">ek object, teen key: value pairs, pairs ke beech commas</text>
</svg><p class="cap">Keys hamesha double-quoted strings hoti hain; values chhe types mein se koi bhi ho sakti hain.</p></div>

<h3>Chhe value types</h3>
<table class="cmp"><tr><th>Type</th><th>Valid examples</th><th>Valid nahi / yeh type nahi</th></tr>
<tr><td><b>string</b></td><td><code>"GigabitEthernet0/1"</code>, <code>"10.20.0.1"</code>, <code>""</code></td><td><code>'SALES'</code> (single quotes)</td></tr>
<tr><td><b>number</b></td><td><code>10</code>, <code>1500</code>, <code>-3</code>, <code>99.5</code></td><td><code>"10"</code> string hai; <code>010</code> (leading zero) invalid hai</td></tr>
<tr><td><b>boolean</b></td><td><code>true</code>, <code>false</code></td><td><code>True</code>, <code>TRUE</code>, <code>"true"</code></td></tr>
<tr><td><b>null</b></td><td><code>null</code></td><td><code>None</code>, <code>NULL</code></td></tr>
<tr><td><b>object</b></td><td><code>{"ip": "10.20.0.1"}</code>, <code>{}</code></td><td><code>{ip: "10.20.0.1"}</code> (bina quotes ki key)</td></tr>
<tr><td><b>array</b></td><td><code>[10, 20, 30]</code>, <code>[]</code></td><td><code>[10, 20, 30,]</code> (trailing comma)</td></tr></table>
<p>Dhyaan do ki IP address ek <b>string</b> hai: bina quotes ka <code>10.20.0.1</code> valid number nahi hai. Tokens ke beech whitespace, line breaks aur indentation ignore hote hain; woh sirf insaano ki madad karte hain.</p>

<h3>Simple se nested tak examples</h3>
<pre class="code"><span class="c">! 1. ek flat object</span>
{"hostname": "R1", "model": "ISR4331", "uptime_days": 42}

<span class="c">! 2. numbers ka array</span>
[10, 20, 30]

<span class="c">! 3. objects ka array: ek VLAN list</span>
[
  {"vlan_id": 10, "name": "SALES"},
  {"vlan_id": 20, "name": "ENGINEERING"}
]

<span class="c">! 4. nesting: object ke andar object, uske andar array</span>
{
  "device": {
    "hostname": "SW1",
    "managed": true,
    "location": null,
    "vlans": [10, 20],
    "mgmt": {"ip": "10.30.0.11", "mask": 24}
  }
}</pre>
<p>Example 4 mein <code>device</code> ek object hai; <code>hostname</code> string hai; <code>managed</code> boolean hai; <code>location</code> null hai (key pata hai, value nahi); <code>vlans</code> numbers ka array hai; <code>mgmt</code> ek nested object hai. (<code>!</code> se shuru hone wali lines aapke liye hamare comments hain. JSON khud comments allow <b>nahi</b> karta.)</p>

<div class="eg"><p><b>Worked example.</b> Example 3 ke hisse gino: bahar ki value ek <b>array</b> hai jismein <b>2</b> items hain; har item ek <b>object</b> hai jismein <b>2</b> keys hain; to kul 4 key: value pairs, 2 numbers aur 2 strings. Exam questions aksar bilkul yahi poochte hain: "kitne objects", "kitne arrays", "is value ka type kya hai".</p></div>

<h3>Woh errors jo JSON tod dete hain</h3>
<table class="cmp"><tr><th>Toota hua</th><th>Kyun</th><th>Theek kiya hua</th></tr>
<tr><td><code>{"a": 1,}</code></td><td>Aakhri member ke baad trailing comma</td><td><code>{"a": 1}</code></td></tr>
<tr><td><code>{'a': 'b'}</code></td><td>Single quotes</td><td><code>{"a": "b"}</code></td></tr>
<tr><td><code>{a: 1}</code></td><td>Bina quotes ki key</td><td><code>{"a": 1}</code></td></tr>
<tr><td><code>{"a": 1 "b": 2}</code></td><td>Members ke beech comma missing</td><td><code>{"a": 1, "b": 2}</code></td></tr>
<tr><td><code>{"a": [1, 2}</code></td><td>Array band nahi hua</td><td><code>{"a": [1, 2]}</code></td></tr>
<tr><td><code>{"up": True}</code></td><td>Boolean lowercase hona chahiye</td><td><code>{"up": true}</code></td></tr>
<tr><td><code>{"a" = 1}</code></td><td>Key aur value colon se alag hote hain</td><td><code>{"a": 1}</code></td></tr></table>

<p>Lab ka <code>json validate</code> tool exact jagah dikhata hai. Yeh Lab 1 ki tooti <code>desc.json</code> par hai, aur fix ke baad dobara:</p>
<pre class="out">NMS&gt; json validate desc.json
desc.json: INVALID JSON
<span class="hl">  line 3, column 1: trailing comma is not allowed before '}'</span>
    3 | }
      | ^
NMS&gt; sed -i '2s/,$//' desc.json
NMS&gt; json validate desc.json
desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</pre>
<p>Error line 3 ke <code>}</code> par report hota hai, par galti line 2 ke end ka comma hai. Parsers wahan report karte hain jahan unhe problem <i>dikhi</i>, jo aksar asli galti ke thoda baad hota hai.</p>
<p>File valid JSON hote hue bhi <b>galat type</b> le ja sakti hai. <code>json types</code> har value ka type dikhata hai:</p>
<pre class="out">NMS&gt; json types enable.json
.                                                         object
.["ietf-interfaces:interface"]                            object
.["ietf-interfaces:interface"].name                       string
<span class="hl">.["ietf-interfaces:interface"].enabled                    string</span></pre>
<p>Model boolean expect karta hai, isliye yahi woh 400 error hai jo aapne pichhle chapter mein dekha.</p>

<div class="warn"><p><b>Common galti.</b> Chat window ya word processor se JSON copy karna. Woh aksar seedhe quotes ko curly "smart" quotes mein badal dete hain, jo alag characters hain, aur file sahi dikhne ke bawajood invalid ho jaati hai. Hamesha plain-text editor mein paste karo aur validate karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Double quotes mein jo bhi hai woh string hai, <code>"10"</code> aur <code>"true"</code> bhi. Objects <code>{ }</code> aur key: value pairs use karte hain; arrays <code>[ ]</code> aur simple values. Keys double-quoted strings honi chahiye. JSON mein na comments hain na trailing commas. Whitespace matter nahi karta.</p></div>

<div class="scn"><h4>VLAN script jisne "010" padha</h4><p>Ek team ki script JSON file se VLANs banati thi. Ek naye engineer ne file edit ki aur VLAN 10 ke liye <code>"vlan_id": 010</code> type kiya. Poora run "invalid number" ke saath ruk gaya kyunki JSON leading zeros allow nahi karta. Usne ise <code>"vlan_id": "010"</code> kar diya, file valid ho gayi, par ab API ne 400 diya kyunki VLAN ID number hona chahiye. Fix bas <code>"vlan_id": 10</code> tha.</p><p><b>Seekh:</b> har baar do cheezein check karo: kya JSON syntax valid hai, aur kya har value ka type wahi hai jo API expect karti hai?</p></div>

<div class="iv"><p class="q">"JSON kaunse data types support karta hai, aur object aur array mein kya farak hai?"</p><p>Strong answer: chhe types: string (double quotes), number, boolean (true ya false, lowercase), null, object aur array. Object curly braces mein key: value pairs ka unordered set hai jismein keys double-quoted strings hoti hain; array square brackets mein values ki ordered list hai. Network example do, jaise ek interface object jismein address objects ka array hai, aur classic errors batao: trailing commas, single quotes aur quoted booleans.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON = do structures (object <code>{ }</code>, array <code>[ ]</code>) aur chhe types (string, number, boolean, null, object, array).</li>
<li>Keys aur strings double quotes use karte hain; booleans lowercase <code>true</code>/<code>false</code>; IP addresses strings hain.</li>
<li>Na trailing commas, na single quotes, na comments, na numbers mein leading zeros.</li>
<li>Valid syntax kaafi nahi: value types wahi hone chahiye jo API ya data model expect kare.</li>
<li>Pehle validate karo (<code>json validate</code>), phir types check karo (<code>json types</code>).</li>
</ul></div>
`}};export{e as default};