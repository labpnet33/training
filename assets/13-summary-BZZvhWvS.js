var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you walk around the car once: tyres, lights, fuel, mirrors. This chapter is that walk-around for the module. Tick every item honestly; anything you cannot do yet points you back to one chapter.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can run Python in the <code>&gt;&gt;&gt;</code> shell and as a script, and create a venv with pip and requirements.txt. (ch. 2)</li>
<li>I can name str, int, float, bool and None, convert between them, and predict slices such as <code>"R1-CORE"[3:]</code>. (ch. 3)</li>
<li>I can read and build lists, dicts and nested structures, and use <code>.get()</code> and <code>.items()</code>. (ch. 4)</li>
<li>I can trace if/elif/else, for and while loops, <code>break</code>, <code>continue</code>, comprehensions and functions with defaults. (ch. 5, 11)</li>
<li>I can import modules, read and write files with <code>with open</code>, read a traceback from the bottom, and write try/except for specific exceptions. (ch. 6)</li>
<li>I can use Netmiko's <code>send_command</code>, <code>send_config_set</code> and <code>save_config</code>, and parse show output with split, regex or TextFSM. (ch. 7)</li>
<li>I can spot invalid JSON, build valid JSON by hand, and use loads, dumps, load and dump. (ch. 8)</li>
<li>I can describe Catalyst Center token authentication and SD-WAN Manager session authentication, and interpret status codes and payloads. (ch. 9)</li>
<li>I can compare Ansible, Puppet, Chef and SaltStack on agent, push or pull, language and transport. (ch. 10)</li>
<li>I can fix both lab scripts using a one-change-at-a-time workflow and verify on the device. (ch. 12)</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Python basics</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.1 (ch. 2-7, 11)</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">JSON</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.2 (ch. 8)</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller APIs</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.4, 6.5 (ch. 9)</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Orchestration</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.7 (ch. 10)</text>
<rect x="170" y="105" width="300" height="46" rx="8" fill="#fed7aa"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Next: YANG, NETCONF, RESTCONF</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">6.3 and RESTCONF in 6.5; then EEM (6.6)</text>
<line x1="400" y1="70" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="240" y1="70" x2="280" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">What this module covered, and where the automation domain continues.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interpreter</dt><dd>The <code>python3</code> program that reads and runs your code.</dd>
<dt>venv</dt><dd>An isolated folder of libraries for one project.</dd>
<dt>Variable / type</dt><dd>A name for a value / the kind of value: str, int, float, bool, None.</dd>
<dt>List / dict</dt><dd>Ordered values indexed from 0 / key-to-value lookup.</dd>
<dt>Function / method</dt><dd>A named, reusable block (<code>def</code>) / a function attached to a value, called with a dot.</dd>
<dt>Module / package</dt><dd>A reusable Python file / a folder of modules, loaded with <code>import</code>.</dd>
<dt>Exception / traceback</dt><dd>An error that stops the program / the report of where it happened.</dd>
<dt>Screen scraping</dt><dd>Sending CLI commands over SSH and parsing the text output.</dd>
<dt>Regex</dt><dd>A pattern language for finding text, module <code>re</code>.</dd>
<dt>JSON</dt><dd>Text data format of objects, arrays and six value types.</dd>
<dt>Token</dt><dd>A temporary credential returned by a login call and sent with later requests.</dd>
<dt>Idempotent</dt><dd>Running again changes nothing when the state is already correct.</dd>
<dt>Agent / agentless</dt><dd>Software on every managed node / management over SSH or APIs with nothing installed.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Indentation defines blocks; a colon starts one; a SyntaxError means nothing ran.</li>
<li>Indexes start at 0; <code>-1</code> is the last; a slice end is excluded; <code>range(a, b)</code> excludes b.</li>
<li><code>/</code> returns a float, <code>//</code> floor division, <code>%</code> remainder; <code>"10" == 10</code> is False.</li>
<li>KeyError = missing dict key; <code>.get()</code> returns None instead.</li>
<li>JSON: double-quoted keys and strings; true, false, null lowercase; no trailing commas; no comments.</li>
<li>JSON object, array, true, null become dict, list, True, None. <code>loads</code>/<code>dumps</code> for strings, <code>load</code>/<code>dump</code> for files.</li>
<li>Catalyst Center: POST <code>/dna/system/api/v1/auth/token</code> with Basic auth, token in <code>X-Auth-Token</code>, data under <code>"response"</code>, writes return 202 and a taskId.</li>
<li>SD-WAN Manager: POST <code>/j_security_check</code>, JSESSIONID cookie, X-XSRF-TOKEN for changes, data under <code>/dataservice</code> and <code>"data"</code>.</li>
<li>200 OK, 201 Created, 202 Accepted, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error.</li>
<li>Ansible agentless push YAML SSH; Puppet agent pull DSL 8140; Chef agent pull Ruby cookbooks; Salt minions push ZeroMQ 4505/4506.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"><span class="c"># Python</span>
x = int("10"); s = "vlan {}".format(x); parts = line.split()
for n, ip in enumerate(ips, start=1): ...
up = [r["intf"] for r in rows if r["status"] == "up"]
d.get("key", default); for k, v in d.items(): ...
try: ... except SomeError: ... finally: ...
with open("f.txt") as f: text = f.read()
m = re.search(r"Version (&#92;S+),", out); m.group(1) if m else None

<span class="c"># JSON</span>
data = json.loads(text); text = json.dumps(data, indent=2)
with open("f.json") as f: data = json.load(f)
with open("f.json", "w") as f: json.dump(data, f, indent=2)

<span class="c"># Netmiko</span>
conn = ConnectHandler(device_type="cisco_ios", host=ip, username=u, password=p)
conn.send_command("show ip interface brief", use_textfsm=True)
conn.send_config_set(lines); conn.save_config(); conn.disconnect()

<span class="c"># requests</span>
r = requests.post(base + "/dna/system/api/v1/auth/token", auth=(u, p))
hdrs = {"X-Auth-Token": r.json()["Token"]}
r = requests.get(base + "/dna/intent/api/v1/network-device", headers=hdrs)
r.status_code; r.json()["response"]</pre>

<div class="eg"><p><b>Worked example: a last mixed question.</b> A script sends a GET, receives 200, and runs <code>len(r.json()["response"])</code>, which prints 12. Then it sends a POST to create a site and receives 202 with a taskId. Has the site been created? Not necessarily: 202 means accepted; poll the task. An hour later a GET returns 401: the token expired, so authenticate again. None of these steps involved a network fault.</p></div>

<div class="warn"><p><b>Common mistakes to avoid on exam day.</b> Choosing an answer before tracing the code; mixing up 401 and 403; picking a JSON option with a trailing comma because it "looks right"; calling Ansible agent-based; and forgetting that <code>print</code> of a list shows single quotes.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint verbs matter: <b>interpret</b> Python (read and predict), <b>construct</b> JSON (build it correctly), <b>describe</b> controller APIs, <b>interpret</b> response codes and payloads, <b>compare</b> orchestration tools. You will not be asked to write a long program, but you will be asked for exact outputs and exact syntax.</p></div>

<div class="scn"><h4>From two broken scripts to a weekly audit</h4><p>A junior engineer who had never programmed finished these labs in her first month. Her first real task reused both: <code>collect.py</code> became a weekly audit that logs in to 140 branch routers and records interfaces that are up but have no description, and the JSON pattern from <code>vlans.py</code> became the input file the campus team edits to request VLAN changes. The audit found 23 undocumented links in its first run, and the VLAN requests stopped arriving as screenshots in email.</p><p><b>Lesson:</b> the two lab patterns, "collect and parse" and "read JSON and act", cover a surprising share of everyday automation.</p></div>

<div class="iv"><p class="q">"Tell me about an automation you built and what you would improve."</p><p>Strong answer: describe the problem and scale (for example, auditing 140 routers), the approach (Netmiko or an API, parsing with TextFSM or JSON, try/except per device, a JSON or CSV report), the result in numbers, and one honest improvement: moving from screen scraping to RESTCONF, making changes idempotent, adding tests with saved output, or moving credentials into a vault. Interviewers value the reasoning and the safety habits more than the size of the script.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>6.1: read Python precisely: types, indexes, loops, functions, exceptions.</li>
<li>6.2: JSON rules and the json module; build data in Python and dump it.</li>
<li>6.4 and 6.5: Catalyst Center token plus X-Auth-Token; SD-WAN Manager session plus XSRF; know the status codes.</li>
<li>6.7: agentless push (Ansible) versus agent pull (Puppet, Chef); Salt uses minions with push.</li>
<li>Next module: YANG, NETCONF and RESTCONF, where the JSON and requests skills here are used directly.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap gaadi ke chaaron taraf ek chakkar lagate ho: tyres, lights, fuel, mirrors. Yeh chapter is module ke liye wahi chakkar hai. Har item imaandaari se tick karo; jo abhi nahi kar sakte woh aapko ek chapter par wapas bhejta hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main Python ko <code>&gt;&gt;&gt;</code> shell mein aur script ki tarah chala sakta hoon, aur pip aur requirements.txt ke saath venv bana sakta hoon. (ch. 2)</li>
<li>Main str, int, float, bool aur None ke naam le sakta hoon, unke beech convert kar sakta hoon, aur <code>"R1-CORE"[3:]</code> jaise slices predict kar sakta hoon. (ch. 3)</li>
<li>Main lists, dicts aur nested structures padh aur bana sakta hoon, aur <code>.get()</code> aur <code>.items()</code> use kar sakta hoon. (ch. 4)</li>
<li>Main if/elif/else, for aur while loops, <code>break</code>, <code>continue</code>, comprehensions aur defaults wale functions trace kar sakta hoon. (ch. 5, 11)</li>
<li>Main modules import kar sakta hoon, <code>with open</code> se files padh aur likh sakta hoon, traceback neeche se padh sakta hoon, aur specific exceptions ke liye try/except likh sakta hoon. (ch. 6)</li>
<li>Main Netmiko ke <code>send_command</code>, <code>send_config_set</code> aur <code>save_config</code> use kar sakta hoon, aur split, regex ya TextFSM se show output parse kar sakta hoon. (ch. 7)</li>
<li>Main invalid JSON pakad sakta hoon, haath se valid JSON bana sakta hoon, aur loads, dumps, load aur dump use kar sakta hoon. (ch. 8)</li>
<li>Main Catalyst Center token authentication aur SD-WAN Manager session authentication describe kar sakta hoon, aur status codes aur payloads interpret kar sakta hoon. (ch. 9)</li>
<li>Main Ansible, Puppet, Chef aur SaltStack ko agent, push ya pull, language aur transport par compare kar sakta hoon. (ch. 10)</li>
<li>Main ek-waqt-mein-ek-change workflow se dono lab scripts fix kar sakta hoon aur device par verify kar sakta hoon. (ch. 12)</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Python basics</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.1 (ch. 2-7, 11)</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">JSON</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.2 (ch. 8)</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Controller APIs</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.4, 6.5 (ch. 9)</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">Orchestration</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">6.7 (ch. 10)</text>
<rect x="170" y="105" width="300" height="46" rx="8" fill="#fed7aa"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">Agla: YANG, NETCONF, RESTCONF</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">6.3 aur 6.5 ka RESTCONF; phir EEM (6.6)</text>
<line x1="400" y1="70" x2="360" y2="105" stroke="#64748b" stroke-width="2"/><line x1="240" y1="70" x2="280" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Is module ne kya cover kiya, aur automation domain aage kahan chalta hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Interpreter</dt><dd><code>python3</code> program jo aapka code padhta aur chalata hai.</dd>
<dt>venv</dt><dd>Ek project ke liye libraries ka isolated folder.</dd>
<dt>Variable / type</dt><dd>Value ka naam / value ka prakaar: str, int, float, bool, None.</dd>
<dt>List / dict</dt><dd>0 se indexed ordered values / key se value lookup.</dd>
<dt>Function / method</dt><dd>Naam wala, dobara use hone wala block (<code>def</code>) / value se juda function, dot se call hota hai.</dd>
<dt>Module / package</dt><dd>Dobara use hone wali Python file / modules ka folder, <code>import</code> se load.</dd>
<dt>Exception / traceback</dt><dd>Error jo program rok deta hai / report ki woh kahan hua.</dd>
<dt>Screen scraping</dt><dd>SSH par CLI commands bhejna aur text output parse karna.</dd>
<dt>Regex</dt><dd>Text dhoondhne ki pattern language, module <code>re</code>.</dd>
<dt>JSON</dt><dd>Objects, arrays aur chhe value types ka text data format.</dd>
<dt>Token</dt><dd>Login call se mila temporary credential jo baad ki requests ke saath bheja jaata hai.</dd>
<dt>Idempotent</dt><dd>State pehle se sahi ho to dobara chalane par kuch nahi badalta.</dd>
<dt>Agent / agentless</dt><dd>Har managed node par software / SSH ya APIs se management, kuch install nahi.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Indentation blocks define karta hai; colon block shuru karta hai; SyntaxError matlab kuch nahi chala.</li>
<li>Indexes 0 se shuru; <code>-1</code> aakhri; slice ka end shaamil nahi; <code>range(a, b)</code> mein b shaamil nahi.</li>
<li><code>/</code> float deta hai, <code>//</code> floor division, <code>%</code> remainder; <code>"10" == 10</code> False hai.</li>
<li>KeyError = dict key missing; <code>.get()</code> uski jagah None deta hai.</li>
<li>JSON: double-quoted keys aur strings; true, false, null lowercase; trailing commas nahi; comments nahi.</li>
<li>JSON object, array, true, null dict, list, True, None bante hain. Strings ke liye <code>loads</code>/<code>dumps</code>, files ke liye <code>load</code>/<code>dump</code>.</li>
<li>Catalyst Center: Basic auth ke saath POST <code>/dna/system/api/v1/auth/token</code>, token <code>X-Auth-Token</code> mein, data <code>"response"</code> ke neeche, writes 202 aur taskId dete hain.</li>
<li>SD-WAN Manager: POST <code>/j_security_check</code>, JSESSIONID cookie, changes ke liye X-XSRF-TOKEN, data <code>/dataservice</code> aur <code>"data"</code> ke neeche.</li>
<li>200 OK, 201 Created, 202 Accepted, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error.</li>
<li>Ansible agentless push YAML SSH; Puppet agent pull DSL 8140; Chef agent pull Ruby cookbooks; Salt minions push ZeroMQ 4505/4506.</li>
</ul>

<h3>Cheat-sheet</h3>
<pre class="code"><span class="c"># Python</span>
x = int("10"); s = "vlan {}".format(x); parts = line.split()
for n, ip in enumerate(ips, start=1): ...
up = [r["intf"] for r in rows if r["status"] == "up"]
d.get("key", default); for k, v in d.items(): ...
try: ... except SomeError: ... finally: ...
with open("f.txt") as f: text = f.read()
m = re.search(r"Version (&#92;S+),", out); m.group(1) if m else None

<span class="c"># JSON</span>
data = json.loads(text); text = json.dumps(data, indent=2)
with open("f.json") as f: data = json.load(f)
with open("f.json", "w") as f: json.dump(data, f, indent=2)

<span class="c"># Netmiko</span>
conn = ConnectHandler(device_type="cisco_ios", host=ip, username=u, password=p)
conn.send_command("show ip interface brief", use_textfsm=True)
conn.send_config_set(lines); conn.save_config(); conn.disconnect()

<span class="c"># requests</span>
r = requests.post(base + "/dna/system/api/v1/auth/token", auth=(u, p))
hdrs = {"X-Auth-Token": r.json()["Token"]}
r = requests.get(base + "/dna/intent/api/v1/network-device", headers=hdrs)
r.status_code; r.json()["response"]</pre>

<div class="eg"><p><b>Worked example: aakhri mixed sawaal.</b> Ek script GET bhejta hai, 200 paata hai, aur <code>len(r.json()["response"])</code> chalata hai, jo 12 print karta hai. Phir site banane ke liye POST bhejta hai aur taskId ke saath 202 paata hai. Kya site ban gayi? Zaroori nahi: 202 matlab accept hua; task poll karo. Ek ghante baad GET 401 deta hai: token expire hua, isliye dobara authenticate karo. Inme se kisi step mein network fault nahi tha.</p></div>

<div class="warn"><p><b>Exam ke din bachne wali galtiyan.</b> Code trace kiye bina answer chunna; 401 aur 403 mein confuse hona; trailing comma wala JSON option chunna kyunki woh "sahi dikhta hai"; Ansible ko agent-based kehna; aur bhool jaana ki list ka <code>print</code> single quotes dikhata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint verbs matter karte hain: Python <b>interpret</b> karo (padho aur predict karo), JSON <b>construct</b> karo (sahi banao), controller APIs <b>describe</b> karo, response codes aur payloads <b>interpret</b> karo, orchestration tools <b>compare</b> karo. Aapse lamba program likhne ko nahi kaha jaayega, par exact outputs aur exact syntax zaroor poocha jaayega.</p></div>

<div class="scn"><h4>Do toote scripts se weekly audit tak</h4><p>Ek junior engineer ne, jisne kabhi programming nahi ki thi, apne pehle mahine mein yeh labs khatam kiye. Uske pehle asli task ne dono ko dobara use kiya: <code>collect.py</code> ek weekly audit ban gaya jo 140 branch routers par login karke woh interfaces record karta hai jo up hain par jinka description nahi hai, aur <code>vlans.py</code> ka JSON pattern woh input file ban gaya jise campus team VLAN changes request karne ke liye edit karti hai. Audit ne pehle hi run mein 23 undocumented links dhoondhe, aur VLAN requests email mein screenshots ki tarah aana band ho gayi.</p><p><b>Seekh:</b> do lab patterns, "collect aur parse" aur "JSON padho aur act karo", roz ke automation ka hairaan karne layak bada hissa cover karte hain.</p></div>

<div class="iv"><p class="q">"Apne banaye kisi automation ke baare mein batao aur aap usme kya improve karoge."</p><p>Strong answer: problem aur scale describe karo (jaise 140 routers ka audit), approach (Netmiko ya API, TextFSM ya JSON se parsing, har device par try/except, JSON ya CSV report), numbers mein result, aur ek imaandaar improvement: screen scraping se RESTCONF par jaana, changes idempotent banana, saved output se tests jodna, ya credentials ko vault mein le jaana. Interviewers script ke size se zyada reasoning aur safety habits ki kadar karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>6.1: Python precisely padho: types, indexes, loops, functions, exceptions.</li>
<li>6.2: JSON rules aur json module; data Python mein banao aur dump karo.</li>
<li>6.4 aur 6.5: Catalyst Center token plus X-Auth-Token; SD-WAN Manager session plus XSRF; status codes jaano.</li>
<li>6.7: agentless push (Ansible) vs agent pull (Puppet, Chef); Salt push ke saath minions use karta hai.</li>
<li>Agla module: YANG, NETCONF aur RESTCONF, jahan yahan ki JSON aur requests skills seedhe kaam aati hain.</li>
</ul></div>
`}};export{e as default};