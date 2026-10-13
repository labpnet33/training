var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`
<p>You began this module able to call a REST API with <code>requests</code>. You can now treat NetBox as the place where network intent lives: ask it precise questions, let it hand out addresses, write to it safely, render configuration from its data, push and verify on a device, and catch drift afterwards. This is the chapter to reread before an exam or an interview.</p>

<h3>An analogy: the town register</h3>
<p>A town keeps a register of every house, street and owner. The council does not repaint houses from memory; it reads the register, sends a painter and updates the register when the job is done. If a house changes without the register knowing, the register is wrong and everything built on it is wrong too. NetBox is your register, scripts are the painters, and drift detection is the inspector walking the street.</p>

<h3>What you can now do</h3>
<ul>
<li>Explain what a source of truth is and what belongs in NetBox (intent) and what does not (secrets, live state).</li>
<li>Call the REST API with a token and read the envelope: <code>count</code>, <code>next</code>, <code>results</code>.</li>
<li>Read the model: site, device, interface, address, prefix, config context, tags and custom fields.</li>
<li>Filter exactly, shape the answer and assert the count before changing anything.</li>
<li>Use pynetbox: <code>get</code>, <code>filter</code>, <code>count</code>, <code>create</code>, <code>update([...])</code>, <code>delete</code>.</li>
<li>Allocate prefixes and addresses without clashes and make the script safe to run twice.</li>
<li>Read every kind of write error and decide what to do with it.</li>
<li>Render configuration with Jinja2 and <code>StrictUndefined</code>, push it, verify it and write the result back.</li>
<li>Detect drift with a script that exits non-zero.</li>
<li>Troubleshoot in four layers: reach, service, identity, question.</li></ul>

<h3>The skeleton to remember</h3>
<ol>
<li>Connect from environment settings (URL and token never in the code).</li>
<li>Ask a precise question and check the count.</li>
<li>Look before you write: does the object already exist?</li>
<li>Write through the allocation endpoints and bulk calls.</li>
<li>Render, push, verify on the device.</li>
<li>Write the outcome back to NetBox.</li>
<li>Check drift on a schedule and alert on exit code.</li></ol>

<h3>Cheat-sheet: status codes</h3>
<table class="cmp"><tr><th>You see</th><th>It means</th><th>Next move</th></tr>
<tr><td>200 / 201 / 204</td><td>read, create, delete worked</td><td>continue</td></tr>
<tr><td>400 + field name</td><td>wrong data</td><td>fix the data</td></tr>
<tr><td>403 credentials / invalid token</td><td>NetBox does not know you</td><td>fix env file or token</td></tr>
<tr><td>403 permission</td><td>token is read-only or lacks rights</td><td>use the right token</td></tr>
<tr><td>404</td><td>no such id or URL</td><td>check the id or path</td></tr>
<tr><td>409</td><td>delete blocked by dependants</td><td>remove or move them</td></tr>
<tr><td>502</td><td>NetBox behind the web server is down</td><td>start or fix the service</td></tr>
<tr><td>ConnectionError / Timeout</td><td>wrong host, port or network</td><td>check the URL and curl</td></tr></table>

<h3>Cheat-sheet: calls</h3>
<table class="cmp"><tr><th>I want to</th><th>Code</th></tr>
<tr><td>one object by name</td><td><code>nb.dcim.devices.get(name="PUN-CORE-R1")</code></td></tr>
<tr><td>many, case-insensitive</td><td><code>filter(name__ic="core")</code></td></tr>
<tr><td>how many</td><td><code>count(site="pune")</code></td></tr>
<tr><td>next free /30 in a pool</td><td><code>pool.available_prefixes.create({"prefix_length": 30})</code></td></tr>
<tr><td>next free address</td><td><code>prefix.available_ips.create({...})</code></td></tr>
<tr><td>change fields</td><td><code>update([{"id": 7, "description": "x"}])</code></td></tr>
<tr><td>get facts, not text, from a device</td><td><code>send_command("show ip interface brief", use_textfsm=True)</code></td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Source of truth</dt><dd>The one place that records what the network should be.</dd>
<dt>NetBox</dt><dd>A web application and REST API for IPAM and DCIM data.</dd>
<dt>IPAM / DCIM</dt><dd>IP address management / data centre infrastructure management.</dd>
<dt>Token</dt><dd>A secret that identifies an API user; it may be read-only.</dd>
<dt>Config context</dt><dd>JSON merged into each matching device by weight.</dd>
<dt>Custom field</dt><dd>An extra typed value you add to an object type.</dd>
<dt>Filter</dt><dd>A query parameter that narrows a list, with lookups such as <code>__ic</code>.</dd>
<dt>RecordSet</dt><dd>pynetbox's lazy, iterable result of <code>filter</code> or <code>all</code>.</dd>
<dt>Available-ips</dt><dd>The sub-endpoint of a prefix that hands out the next free address.</dd>
<dt>Atomic</dt><dd>All items succeed or none are saved.</dd>
<dt>Idempotent</dt><dd>Safe to run twice; the second run changes nothing more.</dd>
<dt>Drift</dt><dd>Device state that no longer matches the recorded intent.</dd>
<dt>StrictUndefined</dt><dd>A Jinja2 setting that turns missing variables into errors.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>The envelope has <code>count</code>, <code>next</code>, <code>previous</code>, <code>results</code>; <code>count</code> is the total, not the page size.</li>
<li>Token header: <code>Authorization: Token ...</code>.</li>
<li>Exact filters are case sensitive; <code>__ie</code> and <code>__ic</code> ignore case.</li>
<li>A bulk write is one transaction.</li>
<li><code>get()</code> returns None when nothing matches and raises ValueError when several match.</li>
<li>GET on <code>available-ips</code> reserves nothing; POST does.</li>
<li>409 means a protected delete; 502 means the service behind the web server.</li></ul>

<h3>Back to earlier modules, and forward</h3>
<p>The REST habits come from auto-requests; addresses and masks from py-ipaddr; the template from py-templates; the env file and token hygiene from py-secrets; the push from adv-nkmiko. Next, adv-nornir takes the same data as an inventory through <code>nornir_netbox</code>, so one run reaches many devices.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> What differs, in one place: the lab's pynetbox writes with <code>update([...])</code> because <code>save()</code> is unreliable there; unknown filter names are ignored; Jinja2 wording for a missing key is different; NetBox config templates, VRF-aware allocation details and many object types are not modelled; and the exact wording of some validation messages can differ by version.</p></div>

<div class="scn"><h4>An audit in ten minutes</h4><p>Auditors asked which routers had been configured by automation and which by hand. Because every push wrote <code>monitored=True</code> and a comment back to NetBox, and every change sat in the change log, one filtered query answered the first half, and the drift script answered the second. Before NetBox the answer was a week of emails.</p><p><b>Lesson:</b> automation that writes back leaves evidence.</p></div>
<div class="iv"><p class="q">"Describe an automation you would build on top of NetBox."</p><p>Onboarding: read the site's pool from NetBox, allocate a /30 and addresses through the available endpoints, render the configuration from the device's facts and config context, push and verify with netmiko, write the result back, and run a drift check on a schedule that exits non-zero on any difference. Each step is safe to repeat.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent in NetBox, secrets in the environment, templates in Git.</li>
<li>Check counts, existence and the device itself, not your own assumptions.</li>
<li>Let NetBox allocate, write in bulk, handle every error class.</li>
<li>Re-pushing a declarative configuration repairs drift.</li>
<li>Troubleshoot bottom up in four layers.</li></ul></div>`,hi:`
<p>Is module ko shuru karte waqt aap <code>requests</code> se REST API bula sakte the. Ab aap NetBox ko woh jagah maan sakte ho jahan network ka intent rehta hai: use precise sawal poochna, usse addresses dilwana, usme safely likhna, uske data se configuration render karna, device par push aur verify karna, aur baad mein drift pakadna. Exam ya interview se pehle yeh chapter dobara padho.</p>

<h3>Ek analogy: shehar ka register</h3>
<p>Shehar har ghar, gali aur maalik ka register rakhta hai. Council yaad se ghar nahi rangti; woh register padhti hai, painter bhejti hai aur kaam khatam hone par register update karti hai. Agar ghar register ko bataye bina badal jaye to register galat hai aur uspar bana sab kuch galat hai. NetBox aapka register hai, scripts painters hain, aur drift detection gali mein chalta inspector hai.</p>

<h3>Aap ab kya kar sakte ho</h3>
<ul>
<li>Samjhana ki source of truth kya hai aur NetBox mein kya jata hai (intent) aur kya nahi (secrets, live state).</li>
<li>Token ke saath REST API bulana aur envelope padhna: <code>count</code>, <code>next</code>, <code>results</code>.</li>
<li>Model padhna: site, device, interface, address, prefix, config context, tags aur custom fields.</li>
<li>Exact filter lagana, answer ko shakal dena aur kuch badalne se pehle count assert karna.</li>
<li>pynetbox use karna: <code>get</code>, <code>filter</code>, <code>count</code>, <code>create</code>, <code>update([...])</code>, <code>delete</code>.</li>
<li>Clash ke bina prefixes aur addresses allocate karna aur script ko do baar chalane layak banana.</li>
<li>Har kism ka write error padhna aur tay karna ki uska kya karna hai.</li>
<li>Jinja2 aur <code>StrictUndefined</code> se configuration render karna, push karna, verify karna aur result wapas likhna.</li>
<li>Non-zero se nikalne wali script se drift detect karna.</li>
<li>Chaar layers mein troubleshoot karna: reach, service, identity, question.</li></ul>

<h3>Yaad rakhne wala skeleton</h3>
<ol>
<li>Environment settings se connect karo (URL aur token code mein kabhi nahi).</li>
<li>Precise sawal poochho aur count check karo.</li>
<li>Likhne se pehle dekho: kya object pehle se hai?</li>
<li>Allocation endpoints aur bulk calls se likho.</li>
<li>Render, push, device par verify.</li>
<li>Nateeja NetBox mein wapas likho.</li>
<li>Schedule par drift check karo aur exit code par alert do.</li></ol>

<h3>Cheat-sheet: status codes</h3>
<table class="cmp"><tr><th>Aap dekhte ho</th><th>Matlab</th><th>Agla kadam</th></tr>
<tr><td>200 / 201 / 204</td><td>read, create, delete chala</td><td>aage badho</td></tr>
<tr><td>400 + field name</td><td>data galat</td><td>data theek karo</td></tr>
<tr><td>403 credentials / invalid token</td><td>NetBox aapko nahi jaanta</td><td>env file ya token theek karo</td></tr>
<tr><td>403 permission</td><td>token read-only hai ya adhikar nahi</td><td>sahi token use karo</td></tr>
<tr><td>404</td><td>aisa id ya URL nahi</td><td>id ya path check karo</td></tr>
<tr><td>409</td><td>dependants ki wajah se delete band</td><td>unhe hatao ya move karo</td></tr>
<tr><td>502</td><td>web server ke peeche NetBox down</td><td>service start ya theek karo</td></tr>
<tr><td>ConnectionError / Timeout</td><td>galat host, port ya network</td><td>URL aur curl check karo</td></tr></table>

<h3>Cheat-sheet: calls</h3>
<table class="cmp"><tr><th>Mujhe chahiye</th><th>Code</th></tr>
<tr><td>naam se ek object</td><td><code>nb.dcim.devices.get(name="PUN-CORE-R1")</code></td></tr>
<tr><td>kai, case-insensitive</td><td><code>filter(name__ic="core")</code></td></tr>
<tr><td>kitne</td><td><code>count(site="pune")</code></td></tr>
<tr><td>pool mein agla free /30</td><td><code>pool.available_prefixes.create({"prefix_length": 30})</code></td></tr>
<tr><td>agla free address</td><td><code>prefix.available_ips.create({...})</code></td></tr>
<tr><td>fields badalna</td><td><code>update([{"id": 7, "description": "x"}])</code></td></tr>
<tr><td>device se text nahi facts</td><td><code>send_command("show ip interface brief", use_textfsm=True)</code></td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Source of truth</dt><dd>Woh ek jagah jo record karti hai ki network kaisa hona chahiye.</dd>
<dt>NetBox</dt><dd>IPAM aur DCIM data ke liye web application aur REST API.</dd>
<dt>IPAM / DCIM</dt><dd>IP address management / data centre infrastructure management.</dd>
<dt>Token</dt><dd>Ek secret jo API user ko pehchanta hai; read-only ho sakta hai.</dd>
<dt>Config context</dt><dd>JSON jo weight ke hisaab se har matching device mein merge hota hai.</dd>
<dt>Custom field</dt><dd>Object type par aap jo extra typed value jodte ho.</dd>
<dt>Filter</dt><dd>Query parameter jo list ko chhota karta hai, <code>__ic</code> jaise lookups ke saath.</dd>
<dt>RecordSet</dt><dd><code>filter</code> ya <code>all</code> ka pynetbox ka lazy, iterable result.</dd>
<dt>Available-ips</dt><dd>Prefix ka sub-endpoint jo agla free address deta hai.</dd>
<dt>Atomic</dt><dd>Sab items safal ya kuch bhi save nahi.</dd>
<dt>Idempotent</dt><dd>Do baar chalana safe; doosri run kuch aur nahi badalti.</dd>
<dt>Drift</dt><dd>Device state jo record kiye intent se ab match nahi karti.</dd>
<dt>StrictUndefined</dt><dd>Jinja2 setting jo missing variables ko errors banati hai.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Envelope mein <code>count</code>, <code>next</code>, <code>previous</code>, <code>results</code> hote hain; <code>count</code> kul hai, page size nahi.</li>
<li>Token header: <code>Authorization: Token ...</code>.</li>
<li>Exact filters case sensitive hain; <code>__ie</code> aur <code>__ic</code> case ignore karte hain.</li>
<li>Bulk write ek transaction hai.</li>
<li><code>get()</code> kuch na milne par None deta hai aur kai milne par ValueError uthata hai.</li>
<li><code>available-ips</code> par GET kuch reserve nahi karta; POST karta hai.</li>
<li>409 matlab protected delete; 502 matlab web server ke peeche ki service.</li></ul>

<h3>Pichhle modules ki taraf, aur aage</h3>
<p>REST ki aadatein auto-requests se; addresses aur masks py-ipaddr se; template py-templates se; env file aur token hygiene py-secrets se; push adv-nkmiko se. Agla, adv-nornir, wahi data <code>nornir_netbox</code> ke zariye inventory ki tarah leta hai, taaki ek run kai devices tak pahunche.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Ek jagah par kya alag hai: lab ka pynetbox <code>update([...])</code> se likhta hai kyunki wahan <code>save()</code> bharosemand nahi; unknown filter names ignore hote hain; missing key ke liye Jinja2 ke shabd alag hain; NetBox config templates, VRF-aware allocation ki details aur kai object types model nahi hain; aur kuch validation messages ke exact shabd version ke hisaab se alag ho sakte hain.</p></div>

<div class="scn"><h4>Das minute mein audit</h4><p>Auditors ne poocha ki kaun se routers automation se configure hue aur kaun se haath se. Kyunki har push NetBox mein <code>monitored=True</code> aur comment wapas likhta tha, aur har change change log mein tha, ek filtered query ne pehla aadha jawab diya, aur drift script ne doosra. NetBox se pehle jawab ek hafte ke emails the.</p><p><b>Lesson:</b> jo automation wapas likhti hai woh saboot chhodti hai.</p></div>
<div class="iv"><p class="q">"NetBox ke upar kaun si automation banaoge, bataiye."</p><p>Onboarding: site ka pool NetBox se padhna, available endpoints se /30 aur addresses allocate karna, device ke facts aur config context se configuration render karna, netmiko se push aur verify karna, nateeja wapas likhna, aur schedule par drift check chalana jo kisi bhi farq par non-zero se nikalta hai. Har step dobara chalane layak hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Intent NetBox mein, secrets environment mein, templates Git mein.</li>
<li>Counts, existence aur device ko check karo, apne andaze ko nahi.</li>
<li>NetBox ko allocate karne do, bulk mein likho, har error class sambhalo.</li>
<li>Declarative configuration ka re-push drift theek karta hai.</li>
<li>Neeche se upar chaar layers mein troubleshoot karo.</li></ul></div>`}};export{e as default};