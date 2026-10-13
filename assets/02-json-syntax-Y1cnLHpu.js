var e={id:`json-syntax`,h:{en:`JSON syntax: objects, arrays and six value types`,hi:`JSON syntax: objects, arrays aur chhe value types`},body:{en:`
<p>JSON is the most common format you will meet. Almost every REST API answers in JSON. It has only a handful of rules, and they are strict. Learn them once and you can spot every error.</p>
<h3>The two containers</h3>
<p>JSON has two containers. Everything else is a simple value.</p>
<ul>
<li>An <b>object</b> is written with curly braces <code>{ }</code>. It holds <b>key: value</b> pairs separated by commas. The key is always text in <b>double quotes</b>. It is like a form with labelled boxes, and it becomes a Python dictionary.</li>
<li>An <b>array</b> is written with square brackets <code>[ ]</code>. It holds values in order, separated by commas. It becomes a Python list.</li>
</ul>
<pre class="code">{
  "hostname": "HYD-CORE1",
  "vlans": [10, 20, 30]
}</pre>
<p>Read it aloud: "An object with two keys. The key hostname has the text HYD-CORE1. The key vlans has an array of three numbers."</p>
<p>[[flow Containers hold values | Object/{ "key": value }/ | Array/[ value, value ] | Value/text, number, true, false, null]]</p>
<h3>The value types</h3>
<p>A value can be one of exactly six things:</p>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Python gets</th></tr><tr><td>string</td><td><code>"GigabitEthernet0/1"</code></td><td><code>str</code></td></tr><tr><td>number</td><td><code>10</code>, <code>3.5</code>, <code>-1</code></td><td><code>int</code> or <code>float</code></td></tr><tr><td>boolean</td><td><code>true</code>, <code>false</code></td><td><code>True</code>, <code>False</code></td></tr><tr><td>null</td><td><code>null</code></td><td><code>None</code></td></tr><tr><td>object</td><td><code>{"a": 1}</code></td><td><code>dict</code></td></tr><tr><td>array</td><td><code>[1, 2]</code></td><td><code>list</code></td></tr></table>
<p>Notice that booleans and null are <b>lowercase</b>, and <b>not in quotes</b>. The text <code>"true"</code> in quotes is a string, not a boolean. Also notice that <code>10</code> (a number) and <code>"10"</code> (text) are different: you can do arithmetic with the first.</p>
<h3>Nesting: boxes inside boxes</h3>
<p>Containers can hold other containers. This is how a whole inventory is described: an object with a key <code>devices</code> whose value is an array, and each item of the array is itself an object.</p>
<pre class="code">import json

text = """
{
  "company": "Deccan Net",
  "site": "Hyderabad",
  "devices": [
    {"name": "HYD-CORE1", "role": "core", "vlans": [10, 20, 30], "managed": true},
    {"name": "HYD-ACC1", "role": "access", "vlans": [10, 20], "managed": false}
  ]
}
"""
data = json.loads(text)
print(data["site"])
print(data["devices"][0]["name"])
print(data["devices"][1]["vlans"][0])
print(data["devices"][0]["managed"])</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Hyderabad
HYD-CORE1
10
True</pre>
<p>Follow each path like directions in a building: <code>data["devices"]</code> is the array, <code>[0]</code> is the first device (counting starts at 0), <code>["name"]</code> is its name. The last line prints <code>True</code>, not <code>true</code>: Python spells the boolean its own way after loading.</p>
<h3>The rules that cause most errors</h3>
<ol>
<li><b>Keys and strings use double quotes only.</b> Single quotes are not allowed.</li>
<li><b>No trailing comma.</b> A comma goes <b>between</b> items, never after the last one.</li>
<li><b>A comma is required between items.</b> Forgetting it is the other common mistake.</li>
<li><b>Keys must be strings.</b> <code>{name: "R1"}</code> is invalid; write <code>{"name": "R1"}</code>.</li>
<li><b>No comments.</b> <code>//</code> and <code>#</code> are not part of JSON.</li>
<li><b>Every opening bracket must close.</b> Count your <code>{ }</code> and <code>[ ]</code>.</li>
<li>**<code>true</code>, <code>false</code>, <code>null</code> are lowercase** and unquoted. <code>True</code> and <code>None</code> are Python, not JSON.</li>
</ol>
<p>Python can show you what happens with a broken file. Notice that the message names the line and the column where it got confused:</p>
<pre class="code">import json

text = """{
  "name": "HYD-EDGE1",
  "mgmt_ip": '10.99.0.2'
}"""
data = json.loads(text)</pre><p><i>Real output, checked in the lab terminal.</i></p><pre class="out">Traceback (most recent call last):
  File "badjson.py", line 7, in &lt;module&gt;
    data = json.loads(text)
json.decoder.JSONDecodeError: Expecting value: line 3 column 14 (char 38)</pre>
<p><code>JSONDecodeError: Expecting value: line 3 column 14</code> says: at line 3, column 15 Python expected the start of a value but found something else, here the single quote. The place where Python <b>complains</b> is sometimes just after the real mistake, so also look at the line before it.</p>
<h3>Pretty and compact</h3>
<p>Machines do not care about spaces. JSON can be one long line (compact) or indented (pretty). Both are identical in meaning. Pretty is for people, and tools such as <code>jq</code> and <code>json.dumps(data, indent=2)</code> produce it.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Copying a Python dictionary into a <code>.json</code> file: it contains single quotes, <code>True</code> and <code>None</code>, all invalid in JSON. (2) A trailing comma after the last item, which many programmers add out of habit. (3) Writing numbers with leading zeros such as <code>010</code>. (4) Putting IP addresses without quotes: <code>10.99.0.1</code> is not a valid number, it must be the string <code>"10.99.0.1"</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which of these is valid JSON? The answer always has double quotes, lowercase <code>true</code>, no trailing comma and no comments. Also remember that JSON object keys are unordered in meaning, while array items are ordered.</p></div>
<div class="scn"><h4>The controller reply that "was not JSON"</h4><p>A script that called a controller crashed with a decode error. The engineer opened the saved reply and saw a Python-style dictionary with <code>True</code> and single quotes. Someone had printed the Python object and saved the printout as the test file. The real controller reply was valid JSON. Replacing the saved sample with a proper <code>json.dump</code> of the data fixed the unit tests.</p>
<p><b>Lesson:</b> printing a Python object is not the same as writing JSON; use <code>json.dump</code> to write it.</p></div>
<div class="iv"><p class="q">"What are the data types in JSON?"</p><p>There are six: string, number, boolean, null, object and array. Objects are key-value pairs in braces with double-quoted keys, and arrays are ordered lists in brackets. Booleans and null are lowercase. JSON has no comments, no single quotes and no trailing commas.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON has two containers: objects <code>{ }</code> and arrays <code>[ ]</code>.</li>
<li>Six value types: string, number, true/false, null, object, array.</li>
<li>Strings and keys use double quotes only; commas go between items, never after the last.</li>
<li>JSON has no comments; <code>true</code>, <code>false</code> and <code>null</code> are lowercase.</li>
<li>Nested paths read like directions: <code>data["devices"][0]["name"]</code>.</li>
</ul></div>
`,hi:`
<p>JSON sabse aam format hai jo aapko milega. Lagbhag har REST API JSON mein jawab deti hai. Iske sirf kuch rules hain, aur woh strict hain. Ek baar seekh lo to har error pehchan loge.</p>
<h3>Do containers</h3>
<p>JSON mein do containers hain. Baaki sab simple values hain.</p>
<ul>
<li><b>Object</b> curly braces <code>{ }</code> se likha jaata hai. Usme commas se alag kiye hue <b>key: value</b> pairs hote hain. Key hamesha <b>double quotes</b> mein text hoti hai. Yeh labelled boxes wale form jaisa hai, aur Python dictionary ban jaata hai.</li>
<li><b>Array</b> square brackets <code>[ ]</code> se likha jaata hai. Usme values order mein, commas se alag hoti hain. Yeh Python list ban jaata hai.</li>
</ul>
<pre class="code">{
  "hostname": "HYD-CORE1",
  "vlans": [10, 20, 30]
}</pre>
<p>Zor se padho: "Do keys wala object. Key hostname mein text HYD-CORE1 hai. Key vlans mein teen numbers ka array hai."</p>
<p>[[flow Containers values rakhte hain | Object/{ "key": value }/ | Array/[ value, value ] | Value/text, number, true, false, null]]</p>
<h3>Value types</h3>
<p>Value theek chhe cheezon mein se ek ho sakti hai:</p>
<table class="cmp"><tr><th>Type</th><th>Example</th><th>Python mein</th></tr><tr><td>string</td><td><code>"GigabitEthernet0/1"</code></td><td><code>str</code></td></tr><tr><td>number</td><td><code>10</code>, <code>3.5</code>, <code>-1</code></td><td><code>int</code> ya <code>float</code></td></tr><tr><td>boolean</td><td><code>true</code>, <code>false</code></td><td><code>True</code>, <code>False</code></td></tr><tr><td>null</td><td><code>null</code></td><td><code>None</code></td></tr><tr><td>object</td><td><code>{"a": 1}</code></td><td><code>dict</code></td></tr><tr><td>array</td><td><code>[1, 2]</code></td><td><code>list</code></td></tr></table>
<p>Dhyaan do ki boolean aur null <b>lowercase</b> hain, aur <b>quotes ke bina</b>. Quotes wala <code>"true"</code> string hai, boolean nahi. Yeh bhi: <code>10</code> (number) aur <code>"10"</code> (text) alag hain: pehle wale se arithmetic ho sakta hai.</p>
<h3>Nesting: boxes ke andar boxes</h3>
<p>Containers doosre containers rakh sakte hain. Poori inventory aise hi describe hoti hai: ek object jiski key <code>devices</code> ki value array hai, aur array ka har item khud ek object hai.</p>
<pre class="code">import json

text = """
{
  "company": "Deccan Net",
  "site": "Hyderabad",
  "devices": [
    {"name": "HYD-CORE1", "role": "core", "vlans": [10, 20, 30], "managed": true},
    {"name": "HYD-ACC1", "role": "access", "vlans": [10, 20], "managed": false}
  ]
}
"""
data = json.loads(text)
print(data["site"])
print(data["devices"][0]["name"])
print(data["devices"][1]["vlans"][0])
print(data["devices"][0]["managed"])</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Hyderabad
HYD-CORE1
10
True</pre>
<p>Har path ko building ke directions ki tarah follow karo: <code>data["devices"]</code> array hai, <code>[0]</code> pehla device (ginti 0 se shuru), <code>["name"]</code> uska naam. Aakhri line <code>True</code> print karti hai, <code>true</code> nahi: load hone ke baad Python boolean ko apne tareeke se likhta hai.</p>
<h3>Jin rules se sabse zyada errors aate hain</h3>
<ol>
<li><b>Keys aur strings sirf double quotes mein.</b> Single quotes allowed nahi.</li>
<li><b>Trailing comma nahi.</b> Comma items ke <b>beech</b> aata hai, aakhri item ke baad kabhi nahi.</li>
<li><b>Items ke beech comma zaroori hai.</b> Bhoolna doosri aam galti hai.</li>
<li><b>Keys strings honi chahiye.</b> <code>{name: "R1"}</code> invalid hai; <code>{"name": "R1"}</code> likho.</li>
<li><b>Comments nahi.</b> <code>//</code> aur <code>#</code> JSON ka hissa nahi.</li>
<li><b>Har opening bracket band hona chahiye.</b> <code>{ }</code> aur <code>[ ]</code> gino.</li>
<li>**<code>true</code>, <code>false</code>, <code>null</code> lowercase** aur unquoted hain. <code>True</code> aur <code>None</code> Python hain, JSON nahi.</li>
</ol>
<p>Python toota hua file dikha sakta hai. Dhyaan do ki message line aur column batata hai jahan woh uljha:</p>
<pre class="code">import json

text = """{
  "name": "HYD-EDGE1",
  "mgmt_ip": '10.99.0.2'
}"""
data = json.loads(text)</pre><p><i>Asli output, lab terminal mein check kiya hua.</i></p><pre class="out">Traceback (most recent call last):
  File "badjson.py", line 7, in &lt;module&gt;
    data = json.loads(text)
json.decoder.JSONDecodeError: Expecting value: line 3 column 14 (char 38)</pre>
<p><code>JSONDecodeError: Expecting value: line 3 column 14</code> kehta hai: line 3, column 15 par Python ko value ki shuruaat chahiye thi lekin kuch aur mila, yahan single quote. Jahan Python <b>shikayat</b> karta hai woh kabhi kabhi asli galti ke thik baad hota hai, isliye uske pehle ki line bhi dekho.</p>
<h3>Pretty aur compact</h3>
<p>Machines ko spaces ki parwah nahi. JSON ek lambi line (compact) ya indented (pretty) ho sakta hai. Dono ka matlab same hai. Pretty insaanon ke liye hai, aur <code>jq</code> aur <code>json.dumps(data, indent=2)</code> jaise tools use banate hain.</p>
<div class="warn"><p><b>Common mistakes.</b> (1) Python dictionary ko <code>.json</code> file mein copy karna: usme single quotes, <code>True</code> aur <code>None</code> hote hain, jo JSON mein invalid hain. (2) Aakhri item ke baad trailing comma, jo kai programmers aadat se laga dete hain. (3) Leading zeros wale numbers jaise <code>010</code>. (4) IP addresses bina quotes ke likhna: <code>10.99.0.1</code> valid number nahi, woh string <code>"10.99.0.1"</code> hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> In mein se valid JSON kaun sa hai? Jawab mein hamesha double quotes, lowercase <code>true</code>, trailing comma nahi aur comments nahi hote. Yeh bhi yaad rakho ki JSON object keys ka order matlab nahi rakhta, jabki array items ordered hain.</p></div>
<div class="scn"><h4>Controller reply jo "JSON nahi thi"</h4><p>Controller ko call karne wali script decode error se crash hui. Engineer ne saved reply kholi aur <code>True</code> aur single quotes wali Python-style dictionary dekhi. Kisi ne Python object print karke printout ko test file ke roop mein save kar liya tha. Asli controller reply valid JSON thi. Saved sample ko data ke proper <code>json.dump</code> se badalne par unit tests theek ho gaye.</p>
<p><b>Lesson:</b> Python object print karna JSON likhna nahi hai; likhne ke liye <code>json.dump</code> use karo.</p></div>
<div class="iv"><p class="q">"JSON mein data types kaun se hain?"</p><p>Chhe hain: string, number, boolean, null, object aur array. Objects double-quoted keys wale braces mein key-value pairs hain, aur arrays brackets mein ordered lists. Booleans aur null lowercase hain. JSON mein comments, single quotes aur trailing commas nahi hote.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON mein do containers: objects <code>{ }</code> aur arrays <code>[ ]</code>.</li>
<li>Chhe value types: string, number, true/false, null, object, array.</li>
<li>Strings aur keys sirf double quotes mein; commas items ke beech, aakhri ke baad nahi.</li>
<li>JSON mein comments nahi; <code>true</code>, <code>false</code> aur <code>null</code> lowercase hain.</li>
<li>Nested paths directions ki tarah padhe jaate hain: <code>data["devices"][0]["name"]</code>.</li>
</ul></div>
`}};export{e as default};