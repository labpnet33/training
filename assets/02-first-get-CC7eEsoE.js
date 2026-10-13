var e={id:`first-get`,h:{en:`Your first GET: the Response object`,hi:`Aapka pehla GET: Response object`},body:{en:`

<p>Let us make one real call and look at what comes back. The whole script is eight lines, and you can run it as it is in Lab 1.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="One Response object holds everything the router sent back."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">r</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">Response</text><rect x="215" y="10" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="280" y="27" text-anchor="middle" class="svg-ink" font-size="14">r.status_code</text><text x="280" y="45" text-anchor="middle" class="svg-muted" font-size="12">200</text><rect x="215" y="60" width="130" height="40" rx="10" fill="#fde68a"/><text x="280" y="77" text-anchor="middle" class="svg-ink" font-size="14">r.ok</text><text x="280" y="95" text-anchor="middle" class="svg-muted" font-size="12">True</text><rect x="215" y="110" width="130" height="40" rx="10" fill="#bae6fd"/><text x="280" y="127" text-anchor="middle" class="svg-ink" font-size="14">r.headers</text><text x="280" y="145" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="400" y="10" width="120" height="40" rx="10" fill="#fed7aa"/><text x="460" y="27" text-anchor="middle" class="svg-ink" font-size="14">r.text</text><text x="460" y="45" text-anchor="middle" class="svg-muted" font-size="12">str</text><rect x="400" y="60" width="120" height="40" rx="10" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="14">r.json()</text><text x="460" y="95" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="400" y="110" width="120" height="40" rx="10" fill="#fecaca"/><text x="460" y="127" text-anchor="middle" class="svg-ink" font-size="14">r.url</text><text x="460" y="145" text-anchor="middle" class="svg-muted" font-size="12">str</text><line x1="160" y1="80" x2="215" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="90" x2="215" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="100" x2="215" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="30" x2="400" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="130" x2="400" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">One Response object holds everything the router sent back.</p></div>

<h3>The script, line by line</h3>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r)
print(r.status_code)
print(r.reason)
print(r.ok)
print(type(r.text), len(r.text))
print(r.text[:120])
print(r.headers["Content-Type"])
print(r.url)</pre>
<p><b>Line 1</b> loads the library. <b>Line 2</b> stores the address in a variable called <code>url</code>. <b>Line 3</b> sends a GET and saves the reply in <code>r</code>. Notice the two extra pieces: <code>auth=(...)</code> is a pair (a tuple) of username and password, and <code>headers={...}</code> is a dictionary with the Accept header, so we ask for JSON. The remaining lines use <code>print</code> to show different parts of the reply.</p>
<pre class="out">AUTO&gt; python3 a.py
<span class="hl">&lt;Response [200]&gt;</span>
<span class="hl">200</span>
<span class="hl">OK</span>
<span class="hl">True</span>
&lt;class 'str'&gt; 2871
{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
        "name": "GigabitEthernet0/0",
        "descriptio
application/yang-data+json
h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces</pre>

<h3>Reading the output</h3>
<ul>
<li><code>&lt;Response [200]&gt;</code>: printing <code>r</code> itself shows the status in brackets.</li>
<li><code>r.status_code</code> is the number 200, and <code>r.reason</code> is the word OK.</li>
<li><code>r.ok</code> is <code>True</code> for any status below 400. It is a quick yes or no.</li>
<li><code>r.text</code> is the body as plain text (a <code>str</code>) of 2871 characters. We printed only the first 120 with <code>[:120]</code>, a slice.</li>
<li><code>r.headers["Content-Type"]</code> reads one header; the server says the body is <code>application/yang-data+json</code>.</li>
<li><code>r.url</code> is the address that was really called.</li>
</ul>

<h3>The response headers as a dictionary</h3>
<p><code>r.headers</code> behaves like a dictionary, so you can print all of them, or loop over them. This is the same information the <code>rest</code> command printed above the body:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"))
print(r.status_code)
print(r.headers)
for k, v in r.headers.items():
    print(k, "=", v)</pre><pre class="out">AUTO&gt; python3 j.py
200
<span class="hl">{'Server': 'nginx', 'Content-Type': 'application/yang-data+json'}</span>
Server = nginx
<span class="hl">Content-Type = application/yang-data+json</span></pre>
<p>Here the <code>for k, v in r.headers.items():</code> line means "for each key and value pair, run the indented line below". Note the indentation: four spaces.</p>

<div class="eg"><p><b>Worked example.</b> You are asked: "Did the call work?" Your script prints <code>r.status_code</code> (200) and <code>r.ok</code> (True). Then "what format is the body?" You print the Content-Type header. Both answers come from the same <code>r</code>, with no new request. The reply is stored; you can inspect it as many times as you like.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Forgetting the quotes around the URL (Python then thinks it is a variable). (2) Writing <code>r.status_code()</code> with brackets: it is an attribute, not a function. <code>r.json()</code> <i>is</i> a function and needs brackets. (3) Printing <code>r.text</code> and expecting to index into it: it is only text. We convert it in the next chapter. (4) Sending credentials as two separate arguments instead of one pair.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>r.text</code> is a string; <code>r.json()</code> is parsed data; <code>r.content</code> is raw bytes. <code>r.ok</code> is true for any status below 400. <code>r.status_code</code> is an integer, so compare it to <code>200</code> not <code>"200"</code>.</p></div>

<div class="scn"><h4>The status that was a string</h4><p>A new script compared <code>r.status_code == "200"</code> and always printed "failed", even though the router answered 200 every time. The number 200 and the text "200" are different things to Python. Removing the quotes fixed it.</p><p><b>Lesson:</b> status_code is an integer. Check types with <code>print(type(x))</code> when something that looks right behaves wrong.</p></div>

<div class="iv"><p class="q">"What is in a requests Response object?"</p><p>The status code and reason, the headers (a dictionary-like object), the body as text and as parsed JSON via <code>.json()</code>, the final URL, and a convenience flag <code>.ok</code>. One call gives you everything the server sent, so I can inspect any part without making a second request.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>requests.get(url, auth=..., headers=...)</code> sends a GET and returns a Response.</li>
<li>status_code is an integer; ok is True below 400; text is a string.</li>
<li>headers behaves like a dictionary: r.headers["Content-Type"].</li>
<li>Attributes have no brackets; json() is a function and needs them.</li>
<li>print() is how you look inside any variable.</li>
</ul></div>

`,hi:`

<p>Chalo ek asli call karte hain aur dekhte hain ki kya wapas aata hai. Poori script aath lines ki hai, aur Lab 1 mein aap ise jaisa hai waisa chala sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek Response object mein woh sab hai jo router ne wapas bheja."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="50" width="150" height="80" rx="10" fill="#ddd6fe"/><text x="85" y="87" text-anchor="middle" class="svg-ink" font-size="14">r</text><text x="85" y="105" text-anchor="middle" class="svg-muted" font-size="12">Response</text><rect x="215" y="10" width="130" height="40" rx="10" fill="#bbf7d0"/><text x="280" y="27" text-anchor="middle" class="svg-ink" font-size="14">r.status_code</text><text x="280" y="45" text-anchor="middle" class="svg-muted" font-size="12">200</text><rect x="215" y="60" width="130" height="40" rx="10" fill="#fde68a"/><text x="280" y="77" text-anchor="middle" class="svg-ink" font-size="14">r.ok</text><text x="280" y="95" text-anchor="middle" class="svg-muted" font-size="12">True</text><rect x="215" y="110" width="130" height="40" rx="10" fill="#bae6fd"/><text x="280" y="127" text-anchor="middle" class="svg-ink" font-size="14">r.headers</text><text x="280" y="145" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="400" y="10" width="120" height="40" rx="10" fill="#fed7aa"/><text x="460" y="27" text-anchor="middle" class="svg-ink" font-size="14">r.text</text><text x="460" y="45" text-anchor="middle" class="svg-muted" font-size="12">str</text><rect x="400" y="60" width="120" height="40" rx="10" fill="#ddd6fe"/><text x="460" y="77" text-anchor="middle" class="svg-ink" font-size="14">r.json()</text><text x="460" y="95" text-anchor="middle" class="svg-muted" font-size="12">dict</text><rect x="400" y="110" width="120" height="40" rx="10" fill="#fecaca"/><text x="460" y="127" text-anchor="middle" class="svg-ink" font-size="14">r.url</text><text x="460" y="145" text-anchor="middle" class="svg-muted" font-size="12">str</text><line x1="160" y1="80" x2="215" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="90" x2="215" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="160" y1="100" x2="215" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="30" x2="400" y2="30" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="80" x2="400" y2="80" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="345" y1="130" x2="400" y2="130" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Ek Response object mein woh sab hai jo router ne wapas bheja.</p></div>

<h3>Script, line by line</h3>
<pre class="code">import requests
url = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
r = requests.get(url, auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r)
print(r.status_code)
print(r.reason)
print(r.ok)
print(type(r.text), len(r.text))
print(r.text[:120])
print(r.headers["Content-Type"])
print(r.url)</pre>
<p><b>Line 1</b> library load karti hai. <b>Line 2</b> address ko <code>url</code> naam ke variable mein rakhti hai. <b>Line 3</b> GET bhejti hai aur reply ko <code>r</code> mein save karti hai. Do extra cheezein dekho: <code>auth=(...)</code> username aur password ki jodi (tuple) hai, aur <code>headers={...}</code> Accept header wali dictionary hai, taaki hum JSON maangein. Baaki lines <code>print</code> se reply ke alag hisse dikhati hain.</p>
<pre class="out">AUTO&gt; python3 a.py
<span class="hl">&lt;Response [200]&gt;</span>
<span class="hl">200</span>
<span class="hl">OK</span>
<span class="hl">True</span>
&lt;class 'str'&gt; 2871
{
  "ietf-interfaces:interfaces": {
    "interface": [
      {
        "name": "GigabitEthernet0/0",
        "descriptio
application/yang-data+json
h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces</pre>

<h3>Output padhna</h3>
<ul>
<li><code>&lt;Response [200]&gt;</code>: <code>r</code> ko hi print karo to status brackets mein dikhta hai.</li>
<li><code>r.status_code</code> number 200 hai, aur <code>r.reason</code> shabd OK hai.</li>
<li><code>r.ok</code> 400 se kam har status par <code>True</code> hota hai. Yeh haan ya naa ka jaldi jawab hai.</li>
<li><code>r.text</code> body ko plain text (<code>str</code>) mein deta hai, 2871 characters. Humne sirf pehle 120 <code>[:120]</code> se print kiye, jise slice kehte hain.</li>
<li><code>r.headers["Content-Type"]</code> ek header padhta hai; server batata hai ki body <code>application/yang-data+json</code> hai.</li>
<li><code>r.url</code> woh address hai jo asal mein call hua.</li>
</ul>

<h3>Response headers dictionary ki tarah</h3>
<p><code>r.headers</code> dictionary ki tarah kaam karta hai, isliye aap sab print kar sakte ho ya unpar loop chala sakte ho. Yeh wahi jankari hai jo <code>rest</code> command body ke upar print karta tha:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"))
print(r.status_code)
print(r.headers)
for k, v in r.headers.items():
    print(k, "=", v)</pre><pre class="out">AUTO&gt; python3 j.py
200
<span class="hl">{'Server': 'nginx', 'Content-Type': 'application/yang-data+json'}</span>
Server = nginx
<span class="hl">Content-Type = application/yang-data+json</span></pre>
<p>Yahan <code>for k, v in r.headers.items():</code> line ka matlab "har key aur value jodi ke liye, neeche ki indented line chalao". Indentation dekho: chaar spaces.</p>

<div class="eg"><p><b>Worked example.</b> Aapse poochha jaata hai: "Call chali?" Script <code>r.status_code</code> (200) aur <code>r.ok</code> (True) print karti hai. Phir "body kis format mein hai?" Aap Content-Type header print karte ho. Dono jawab ek hi <code>r</code> se aate hain, nayi request ke bina. Reply store hai; jitni baar chaho dekh sakte ho.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) URL ke aas-paas quotes bhool jaana (tab Python ise variable samajhta hai). (2) <code>r.status_code()</code> brackets ke saath likhna: yeh attribute hai, function nahi. <code>r.json()</code> <i>function</i> hai aur use brackets chahiye. (3) <code>r.text</code> print karke usme index karne ki ummeed: woh sirf text hai. Agle chapter mein ise convert karenge. (4) Credentials ko ek jodi ki jagah do alag arguments mein bhejna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>r.text</code> string hai; <code>r.json()</code> parsed data hai; <code>r.content</code> raw bytes hai. <code>r.ok</code> 400 se kam har status par true hota hai. <code>r.status_code</code> integer hai, isliye <code>200</code> se compare karo, <code>"200"</code> se nahi.</p></div>

<div class="scn"><h4>Status jo string tha</h4><p>Ek nayi script ne <code>r.status_code == "200"</code> compare kiya aur hamesha "failed" print kiya, jabki router har baar 200 deta tha. Python ke liye number 200 aur text "200" alag cheezein hain. Quotes hatane se theek hua.</p><p><b>Lesson:</b> status_code integer hai. Jab kuch sahi dikhne wala galat chale to <code>print(type(x))</code> se type check karo.</p></div>

<div class="iv"><p class="q">"requests Response object mein kya hota hai?"</p><p>Status code aur reason, headers (dictionary jaisa object), body text ke roop mein aur <code>.json()</code> se parsed JSON ke roop mein, final URL, aur suvidha ke liye <code>.ok</code> flag. Ek call mein server ka bheja sab milta hai, isliye doosri request ke bina koi bhi hissa dekh sakta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>requests.get(url, auth=..., headers=...)</code> GET bhejta hai aur Response deta hai.</li>
<li>status_code integer hai; ok 400 se kam par True; text string hai.</li>
<li>headers dictionary ki tarah: r.headers["Content-Type"].</li>
<li>Attributes mein brackets nahi; json() function hai aur brackets maangta hai.</li>
<li>print() kisi bhi variable ke andar dekhne ka tareeka hai.</li>
</ul></div>

`}};export{e as default};