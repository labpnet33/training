var e={id:`json-bodies`,h:{en:`JSON bodies: the data you send`,hi:`JSON bodies: jo data aap bhejte ho`},body:{en:`

<p>When you create or change something, you send a <b>body</b>, and in RESTCONF the body is <b>JSON</b>. JSON looks like a Python dictionary, so you already half know it. But JSON is strict, and a single wrong quote makes the router reject the whole thing with a 400.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="JSON has only objects, lists and simple values."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="14">{ }</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">object = key: value pairs</text><rect x="225" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">[ ]</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">list = ordered items</text><rect x="440" y="40" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="82" text-anchor="middle" class="svg-ink" font-size="14">"text" 5 true null</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">values</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">like a Python dict</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">like a Python list</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">str, int, bool, None</text></svg><p class="cap">JSON has only objects, lists and simple values.</p></div>

<h3>The rules, all of them</h3>
<ul>
<li>An <b>object</b> is wrapped in <code>{ }</code> and holds <code>"key": value</code> pairs separated by commas.</li>
<li>A <b>list</b> is wrapped in <code>[ ]</code> and holds values separated by commas.</li>
<li>Keys and text must use <b>double quotes</b>. Single quotes are not allowed.</li>
<li>Numbers, <code>true</code>, <code>false</code> and <code>null</code> have no quotes. Booleans are lowercase (Python writes <code>True</code>; JSON writes <code>true</code>).</li>
<li>No comma after the last item. No comments.</li>
</ul>

<h3>A real body, read line by line</h3>
<p>This is the <code>lo50.json</code> file from the previous chapter. Notice the module prefix in the first key, and how the IP address sits inside lists:</p>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "Loopback50",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "50.50.50.50",
          "netmask": "255.255.255.255"
        }
      ]
    }
  }
}</pre>
<p>Reading it from the top: one object with one key, <code>ietf-interfaces:interface</code>. Inside, a list of one interface (<code>[ ... ]</code>). The interface has a <code>name</code>, a <code>type</code> and <code>enabled</code> set to true. Its IPv4 settings contain a list of addresses, and each address has an <code>ip</code> and a <code>netmask</code>.</p>

<h3>Check before you send</h3>
<p>The lab host has a <code>json validate</code> command. It catches syntax errors on your own computer, before the router sees them. A good file says so, and describes the top level:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</span></pre>
<p>A file using single quotes, a very common mistake from Python habits, is rejected and the pointer shows exactly where:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: INVALID JSON</span>
<span class="hl">  line 2, column 3: property names must use double quotes ("), not single quotes (')</span>
    2 |   'ietf-interfaces:description': 'Router ID - Chennai core'
      |   ^</pre>
<p>If you skip validation and send it, the router answers 400 with the same complaint. Same error, one step later, and now it is also a live API call:</p>
<pre class="out">AUTO&gt; rest PATCH .../description -u netops:NK@2026 -d '{bad}'
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 1, column 2: expected a property name in double quotes but found 'b'"</span>
      }
    ]
  }</pre>
<p>After the fix (double quotes), validate passes and the file looks like this:</p>
<pre class="code">{
  "ietf-interfaces:description": "Router ID - Chennai core"
}</pre>

<h3>Why this matters for Python</h3>
<p>In the next module you will use <code>json=</code> in the requests library, and Python will build correct JSON for you from a dictionary. You will never hand-type quotes again. But reading and checking JSON by eye is a skill you use daily.</p>

<div class="eg"><p><b>Worked example.</b> You copy a body from a blog post and the router returns 400. You save it to a file and run <code>json validate</code>. It reports line 2, column 3: single quotes. You replace them with double quotes, validate again (valid JSON), and the PATCH returns 204. Total time: one minute, and no guesswork on the device.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Single quotes. (2) A trailing comma after the last item. (3) Writing <code>True</code> or <code>None</code> instead of <code>true</code> or <code>null</code>. (4) Forgetting the module prefix on the key, for example <code>description</code> instead of <code>ietf-interfaces:description</code>. (5) Sending the wrong shape: a PATCH to the description leaf needs an object with that one key, not the whole interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> JSON uses double quotes only, lowercase true/false/null, no trailing commas. A JSON object maps to a Python dict, a JSON list maps to a Python list. RESTCONF JSON keys carry the YANG module name before the colon.</p></div>

<div class="scn"><h4>The invisible trailing comma</h4><p>A change window needed forty interface descriptions. The engineer built the JSON by hand in a text editor and left a comma after the last entry. Every call returned 400, and the window started to burn. A two-second <code>json validate</code> on the file showed the line. Generating the body from a Python dictionary afterwards removed the whole class of mistake.</p><p><b>Lesson:</b> validate before you send, and generate JSON with code when the body is repetitive.</p></div>

<div class="iv"><p class="q">"How do JSON types map to Python?"</p><p>Object to dict, list to list, string to str, number to int or float, true and false to True and False, and null to None. JSON itself is stricter than Python: double quotes only and no trailing comma, which is why we let a library produce it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON bodies use objects, lists and simple values.</li>
<li>Double quotes only; lowercase true, false, null; no trailing comma.</li>
<li>Keys carry the module prefix, for example ietf-interfaces:description.</li>
<li>Validate with json validate before sending; a bad body returns 400.</li>
<li>Python dict and list map directly to JSON object and list.</li>
</ul></div>

`,hi:`

<p>Jab aap kuch banate ya badalte ho, to <b>body</b> bhejte ho, aur RESTCONF mein body <b>JSON</b> hoti hai. JSON Python dictionary jaisa dikhta hai, isliye aap aadha jaante ho. Par JSON sakht hai, aur ek galat quote poori cheez ko router se 400 ke saath reject karwa deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="JSON mein sirf objects, lists aur simple values hote hain."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="40" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="82" text-anchor="middle" class="svg-ink" font-size="14">{ }</text><text x="105" y="100" text-anchor="middle" class="svg-muted" font-size="12">object = key: value jodi</text><rect x="225" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="14">[ ]</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">list = kram mein items</text><rect x="440" y="40" width="190" height="90" rx="10" fill="#bbf7d0"/><text x="535" y="82" text-anchor="middle" class="svg-ink" font-size="14">"text" 5 true null</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">values</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">Python dict jaisa</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Python list jaisa</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">str, int, bool, None</text></svg><p class="cap">JSON mein sirf objects, lists aur simple values hote hain.</p></div>

<h3>Saare rules</h3>
<ul>
<li><b>Object</b> <code>{ }</code> mein hota hai aur comma se alag kiye <code>"key": value</code> jode rakhta hai.</li>
<li><b>List</b> <code>[ ]</code> mein hoti hai aur comma se alag values rakhti hai.</li>
<li>Keys aur text <b>double quotes</b> mein hone chahiye. Single quotes allowed nahi.</li>
<li>Numbers, <code>true</code>, <code>false</code> aur <code>null</code> bina quotes ke. Booleans lowercase (Python <code>True</code> likhta hai; JSON <code>true</code>).</li>
<li>Aakhri item ke baad comma nahi. Comments nahi.</li>
</ul>

<h3>Asli body, line by line</h3>
<p>Yeh pichhle chapter ki <code>lo50.json</code> file hai. Pehli key mein module prefix dekho, aur kaise IP address lists ke andar hai:</p>
<pre class="code">{
  "ietf-interfaces:interface": {
    "name": "Loopback50",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    "ietf-ip:ipv4": {
      "address": [
        {
          "ip": "50.50.50.50",
          "netmask": "255.255.255.255"
        }
      ]
    }
  }
}</pre>
<p>Upar se padho: ek object jisme ek key hai, <code>ietf-interfaces:interface</code>. Andar ek interface ki list (<code>[ ... ]</code>). Interface ka <code>name</code>, <code>type</code> aur <code>enabled</code> true hai. Uski IPv4 settings mein addresses ki list hai, aur har address mein <code>ip</code> aur <code>netmask</code> hai.</p>

<h3>Bhejne se pehle check karo</h3>
<p>Lab host mein <code>json validate</code> command hai. Yeh syntax errors aapke apne computer par pakad leta hai, router dekhe usse pehle. Sahi file yeh kehti hai aur top level describe karti hai:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: valid JSON (object with 1 top-level key(s): ietf-interfaces:description)</span></pre>
<p>Single quotes wali file, jo Python ki aadat se aam galti hai, reject hoti hai aur pointer theek jagah dikhata hai:</p>
<pre class="out">AUTO&gt; json validate lo-desc.json
<span class="hl">lo-desc.json: INVALID JSON</span>
<span class="hl">  line 2, column 3: property names must use double quotes ("), not single quotes (')</span>
    2 |   'ietf-interfaces:description': 'Router ID - Chennai core'
      |   ^</pre>
<p>Validation chhodkar bhejoge to router wahi shikayat ke saath 400 deta hai. Wahi error, ek step baad, aur ab yeh live API call bhi hai:</p>
<pre class="out">AUTO&gt; rest PATCH .../description -u netops:NK@2026 -d '{bad}'
<span class="hl">HTTP/1.1 400 Bad Request</span>
Content-Type: application/yang-data+json

{
  "ietf-restconf:errors": {
    "error": [
      {
        "error-type": "protocol",
        "error-tag": "malformed-message",
<span class="hl">        "error-message": "malformed JSON body: line 1, column 2: expected a property name in double quotes but found 'b'"</span>
      }
    ]
  }</pre>
<p>Fix ke baad (double quotes), validate pass hota hai aur file aisi dikhti hai:</p>
<pre class="code">{
  "ietf-interfaces:description": "Router ID - Chennai core"
}</pre>

<h3>Python ke liye kyun matter karta hai</h3>
<p>Agle module mein aap requests library mein <code>json=</code> use karoge, aur Python dictionary se sahi JSON khud bana dega. Quotes haath se type nahi karne padenge. Par JSON ko aankh se padhna aur check karna ek skill hai jo roz kaam aati hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapne blog post se body copy ki aur router ne 400 diya. Aap use file mein save karke <code>json validate</code> chalate ho. Woh line 2, column 3 batata hai: single quotes. Aap unhe double quotes se badalte ho, dobara validate karte ho (valid JSON), aur PATCH 204 deta hai. Kul samay: ek minute, device par koi andaaza nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Single quotes. (2) Aakhri item ke baad trailing comma. (3) <code>true</code> ya <code>null</code> ki jagah <code>True</code> ya <code>None</code> likhna. (4) Key par module prefix bhool jaana, jaise <code>ietf-interfaces:description</code> ki jagah <code>description</code>. (5) Galat shape bhejna: description leaf par PATCH ke liye usi ek key wala object chahiye, poora interface nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> JSON sirf double quotes, lowercase true/false/null, trailing comma nahi. JSON object Python dict se map hota hai, JSON list Python list se. RESTCONF JSON keys mein colon se pehle YANG module ka naam hota hai.</p></div>

<div class="scn"><h4>Na dikhne wala trailing comma</h4><p>Ek change window mein chalis interface descriptions chahiye the. Engineer ne text editor mein JSON haath se banaya aur aakhri entry ke baad comma chhod diya. Har call 400 deti rahi aur window ka samay jaata raha. File par do second ka <code>json validate</code> ne line dikha di. Baad mein body ko Python dictionary se generate karne se yeh poori tarah ki galti hi khatam ho gayi.</p><p><b>Lesson:</b> bhejne se pehle validate karo, aur body baar-baar ki ho to JSON ko code se generate karo.</p></div>

<div class="iv"><p class="q">"JSON types Python se kaise map hote hain?"</p><p>Object se dict, list se list, string se str, number se int ya float, true aur false se True aur False, aur null se None. JSON khud Python se zyada sakht hai: sirf double quotes aur trailing comma nahi, isliye hum library se banwate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>JSON bodies objects, lists aur simple values use karti hain.</li>
<li>Sirf double quotes; lowercase true, false, null; trailing comma nahi.</li>
<li>Keys mein module prefix hota hai, jaise ietf-interfaces:description.</li>
<li>Bhejne se pehle json validate se check karo; kharab body 400 deti hai.</li>
<li>Python dict aur list seedhe JSON object aur list se map hote hain.</li>
</ul></div>

`}};export{e as default};