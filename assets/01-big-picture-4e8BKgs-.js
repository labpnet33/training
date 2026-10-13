var e={id:`big-picture`,h:{en:`Python and the requests library: why bother?`,hi:`Python aur requests library: kyun?`},body:{en:`

<p>In the REST module you made API calls with the lab's <code>rest</code> command, typing each one by hand. That is fine for one router. For fifty routers it is slow and easy to get wrong. A <b>Python script</b> can make the same calls in a loop, check every status, and write the results to a file. The standard Python tool for the job is the <b>requests</b> library.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The requests library does the web part so you can write only the network part."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">Python</text><text x="80" y="115" text-anchor="middle" class="svg-muted" font-size="12">intf.py</text><rect x="250" y="60" width="140" height="80" rx="10" fill="#fde68a"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">requests</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">library</text><rect x="490" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="560" y="115" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF API</text><line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="115" x2="390" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="250" y1="115" x2="150" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="11">Your code  -&gt;  library builds the request  -&gt;  device replies  -&gt;  you get a Response object</text></svg><p class="cap">The requests library does the web part so you can write only the network part.</p></div>

<h3>What you must already know (and nothing more)</h3>
<p>You do not need to be a programmer. In this module we use only a handful of ideas, and each is explained the first time it appears:</p>
<ul>
<li><b>import</b>: load a ready-made toolbox, for example <code>import requests</code>.</li>
<li><b>Variable</b>: a name for a value, for example <code>URL = "..."</code>. Python reads top to bottom.</li>
<li><b>String, list, dictionary</b>: text in quotes, a list in <code>[ ]</code>, and key and value pairs in <code>{ }</code>.</li>
<li><b>Function call</b>: <code>name(arguments)</code>, for example <code>print("hello")</code>.</li>
</ul>

<h3>Your rest command, in Python words</h3>
<table class="cmp"><tr><th>In the rest command</th><th>In Python requests</th></tr>
<tr><td><code>rest GET url</code></td><td><code>requests.get(url)</code></td></tr>
<tr><td><code>-u netops:NK@2026</code></td><td><code>auth=("netops", "NK@2026")</code></td></tr>
<tr><td><code>-H 'Accept: ...'</code></td><td><code>headers={"Accept": "..."}</code></td></tr>
<tr><td><code>-d '{...}'</code></td><td><code>json={...}</code> (a Python dictionary)</td></tr>
<tr><td>the status line</td><td><code>r.status_code</code></td></tr>
<tr><td>the JSON body</td><td><code>r.json()</code></td></tr></table>
<p>The reply comes back in a variable, by convention called <code>r</code> (for response). Everything you saw in the status line, headers and body is an attribute of <code>r</code>.</p>

<h3>The finished program</h3>
<p>In Lab 1 you will complete <code>intf.py</code>. Here is the finished file. Do not worry about every line yet; each chapter explains one part. Read the comments after the <code>#</code> signs: Python ignores them and they are for humans.</p>
<pre class="code"># intf.py - read the interfaces of R1 through its RESTCONF API
import requests
requests.packages.urllib3.disable_warnings()     # lab routers use self-signed certificates

URL = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
HEADERS = {"Accept": "application/yang-data+json"}   # please answer in JSON
AUTH = ("netops", "NK@2026")                      # (username, password)

r = requests.get(URL, auth=AUTH, headers=HEADERS, verify=False)
print("Status:", r.status_code)

data = r.json()                                   # JSON text -&gt; Python dictionary
interfaces = data["ietf-interfaces:interfaces"]["interface"]   # a list of dictionaries
for i in interfaces:
    print(i["name"], i["enabled"])</pre>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 200</span>
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
<span class="hl">Loopback0 True</span></pre>
<p>Five interfaces, one line each, from one API call. The same program also works on another router by changing one value, the URL.</p>

<div class="eg"><p><b>Worked example.</b> Your manager asks: "Which interfaces are enabled on R1?" With the CLI you log in, run a show command and read. With <code>intf.py</code> you run one command and the program prints the name and the enabled value of every interface. Next quarter the question is about forty routers: you change the script to loop, and the answer takes the same effort.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Saving the file with the wrong name or running it from the wrong folder: <code>python3 intf.py</code> must be run where the file is. (2) Mixing up <code>=</code> (store a value) and <code>==</code> (compare). (3) Forgetting that indentation is part of Python: the four spaces in front of a line decide which block it belongs to. (4) Treating the lab's <code>verify=False</code> as normal; it is lab-only.</p></div>
<div class="exam"><p><b>Exam trap.</b> The requests library is a third-party Python package (not built in). The common calls are <code>requests.get/post/put/patch/delete</code>. Each returns a Response object with <code>.status_code</code>, <code>.text</code>, <code>.headers</code> and <code>.json()</code>.</p></div>

<div class="scn"><h4>From one router to fifty</h4><p>A team had a one-line question for their new routers: "is the management interface enabled?". Asking it by hand on each router took a morning. A twenty-line requests script asked all fifty and printed a table in under a minute. The first run found three routers where the answer was no.</p><p><b>Lesson:</b> API plus a script turns a repetitive task into a report.</p></div>

<div class="iv"><p class="q">"Why use Python requests instead of the CLI for network checks?"</p><p>A script is repeatable, can loop over many devices, checks each status code, and produces structured data (JSON turned into dictionaries) that is easy to filter and report on. The CLI returns text that must be parsed. The API returns data in a format designed for programs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests is the Python library for REST calls; load it with <code>import requests</code>.</li>
<li>Each rest-command option has a matching requests argument: auth, headers, json.</li>
<li>The reply is a Response object, usually stored in <code>r</code>.</li>
<li>A script repeats the same call on many devices and checks every status.</li>
<li>Comments start with # and are ignored by Python.</li>
</ul></div>

`,hi:`

<p>REST module mein aapne lab ke <code>rest</code> command se API calls ki thi, har ek haath se type karke. Ek router ke liye theek hai. Pachaas routers ke liye dheema hai aur galti ka khatra. <b>Python script</b> wahi calls loop mein kar sakti hai, har status check kar sakti hai aur results file mein likh sakti hai. Is kaam ka standard Python tool <b>requests</b> library hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="requests library web ka hissa karti hai taaki aap sirf network ka hissa likho."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="80" y="97" text-anchor="middle" class="svg-ink" font-size="14">Python</text><text x="80" y="115" text-anchor="middle" class="svg-muted" font-size="12">intf.py</text><rect x="250" y="60" width="140" height="80" rx="10" fill="#fde68a"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">requests</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">library</text><rect x="490" y="60" width="140" height="80" rx="10" fill="#bae6fd"/><text x="560" y="97" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="560" y="115" text-anchor="middle" class="svg-muted" font-size="12">RESTCONF API</text><line x1="150" y1="90" x2="250" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="490" y1="115" x2="390" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="250" y1="115" x2="150" y2="115" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="11">Aapka code -&gt; library request banati hai -&gt; device jawab deta hai -&gt; aapko Response object milta hai</text></svg><p class="cap">requests library web ka hissa karti hai taaki aap sirf network ka hissa likho.</p></div>

<h3>Aapko kya aana chahiye (aur bas utna)</h3>
<p>Aapko programmer hone ki zaroorat nahi. Is module mein hum sirf kuch ideas use karte hain, aur har ek pehli baar aate hi samjhaya jaata hai:</p>
<ul>
<li><b>import</b>: ready-made toolbox load karna, jaise <code>import requests</code>.</li>
<li><b>Variable</b>: value ka naam, jaise <code>URL = "..."</code>. Python upar se neeche padhta hai.</li>
<li><b>String, list, dictionary</b>: quotes mein text, <code>[ ]</code> mein list, aur <code>{ }</code> mein key aur value jodi.</li>
<li><b>Function call</b>: <code>name(arguments)</code>, jaise <code>print("hello")</code>.</li>
</ul>

<h3>Aapka rest command, Python ke shabdon mein</h3>
<table class="cmp"><tr><th>rest command mein</th><th>Python requests mein</th></tr>
<tr><td><code>rest GET url</code></td><td><code>requests.get(url)</code></td></tr>
<tr><td><code>-u netops:NK@2026</code></td><td><code>auth=("netops", "NK@2026")</code></td></tr>
<tr><td><code>-H 'Accept: ...'</code></td><td><code>headers={"Accept": "..."}</code></td></tr>
<tr><td><code>-d '{...}'</code></td><td><code>json={...}</code> (Python dictionary)</td></tr>
<tr><td>status line</td><td><code>r.status_code</code></td></tr>
<tr><td>JSON body</td><td><code>r.json()</code></td></tr></table>
<p>Reply ek variable mein aata hai, jise convention se <code>r</code> (response) kehte hain. Status line, headers aur body mein jo bhi dekha, sab <code>r</code> ka attribute hai.</p>

<h3>Poora program</h3>
<p>Lab 1 mein aap <code>intf.py</code> poori karoge. Yeh poori file hai. Har line ki chinta abhi mat karo; har chapter ek hissa samjhata hai. <code>#</code> ke baad ke comments padho: Python unhe ignore karta hai, woh insaanon ke liye hain.</p>
<pre class="code"># intf.py - read the interfaces of R1 through its RESTCONF API
import requests
requests.packages.urllib3.disable_warnings()     # lab routers use self-signed certificates

URL = "h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces"
HEADERS = {"Accept": "application/yang-data+json"}   # please answer in JSON
AUTH = ("netops", "NK@2026")                      # (username, password)

r = requests.get(URL, auth=AUTH, headers=HEADERS, verify=False)
print("Status:", r.status_code)

data = r.json()                                   # JSON text -&gt; Python dictionary
interfaces = data["ietf-interfaces:interfaces"]["interface"]   # a list of dictionaries
for i in interfaces:
    print(i["name"], i["enabled"])</pre>
<pre class="out">AUTO&gt; python3 intf.py
<span class="hl">Status: 200</span>
GigabitEthernet0/0 True
GigabitEthernet0/1 True
GigabitEthernet0/2 False
GigabitEthernet0/3 True
<span class="hl">Loopback0 True</span></pre>
<p>Paanch interfaces, ek API call se ek-ek line. Wahi program doosre router par bhi chalta hai, bas ek value, URL, badalni hoti hai.</p>

<div class="eg"><p><b>Worked example.</b> Manager poochta hai: "R1 par kaunse interfaces enabled hain?" CLI se aap login karke show command chalate ho aur padhte ho. <code>intf.py</code> se aap ek command chalate ho aur program har interface ka name aur enabled value print kar deta hai. Agli quarter sawaal chalis routers ka hai: script ko loop mein badalte ho, aur mehnat utni hi lagti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) File ko galat naam se save karna ya galat folder se chalana: <code>python3 intf.py</code> wahin chalana hai jahan file hai. (2) <code>=</code> (value store karna) aur <code>==</code> (compare karna) mein confuse hona. (3) Bhool jaana ki indentation Python ka hissa hai: line ke aage ke chaar spaces tay karte hain woh kis block mein hai. (4) Lab ke <code>verify=False</code> ko normal samajhna; woh sirf lab ke liye hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> requests library third-party Python package hai (built-in nahi). Common calls <code>requests.get/post/put/patch/delete</code> hain. Har ek Response object deta hai jisme <code>.status_code</code>, <code>.text</code>, <code>.headers</code> aur <code>.json()</code> hote hain.</p></div>

<div class="scn"><h4>Ek router se pachaas tak</h4><p>Ek team ko naye routers ke baare mein ek line ka sawaal tha: "management interface enabled hai?" Har router par haath se poochne mein poori subah gayi. Bees line ki requests script ne pachaason ko poochha aur ek minute se kam mein table print kar di. Pehli run mein teen routers mile jahan jawab "nahi" tha.</p><p><b>Lesson:</b> API aur script milkar dohrane wale kaam ko report bana dete hain.</p></div>

<div class="iv"><p class="q">"Network checks ke liye CLI ki jagah Python requests kyun?"</p><p>Script repeatable hoti hai, kai devices par loop kar sakti hai, har status code check karti hai, aur structured data (JSON se bane dictionaries) deti hai jise filter aur report karna aasan hai. CLI text deta hai jise parse karna padta hai. API data aise format mein deti hai jo programs ke liye bana hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests REST calls ke liye Python library hai; <code>import requests</code> se use hoti hai.</li>
<li>rest-command ke har option ka requests argument hai: auth, headers, json.</li>
<li>Reply Response object hai, aam taur par <code>r</code> mein.</li>
<li>Script wahi call kai devices par dohrati hai aur har status check karti hai.</li>
<li>Comments # se shuru hote hain aur Python unhe ignore karta hai.</li>
</ul></div>

`}};export{e as default};