var e={id:`summary`,h:{en:`Summary: your requests toolbox`,hi:`Summary: aapka requests toolbox`},body:{en:`

<p>You can now read and write the configuration of a network device from Python. Here is the whole toolbox on one page, plus a routine to follow every time.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Your requests toolbox."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="14">import requests</text><rect x="165" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="14">requests.get/put...</text><rect x="320" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="14">r.status_code</text><rect x="475" y="20" width="155" height="50" rx="10" fill="#ddd6fe"/><text x="552.5" y="50" text-anchor="middle" class="svg-ink" font-size="14">r.json()</text><rect x="10" y="100" width="140" height="50" rx="10" fill="#fed7aa"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="14">auth=(u, p)</text><rect x="165" y="100" width="140" height="50" rx="10" fill="#fecaca"/><text x="235" y="130" text-anchor="middle" class="svg-ink" font-size="14">raise_for_status()</text><rect x="320" y="100" width="140" height="50" rx="10" fill="#bae6fd"/><text x="390" y="130" text-anchor="middle" class="svg-ink" font-size="14">try / except</text><rect x="475" y="100" width="155" height="50" rx="10" fill="#bbf7d0"/><text x="552.5" y="130" text-anchor="middle" class="svg-ink" font-size="14">for / def</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="13">Eight pieces build every script in this module</text></svg><p class="cap">Your requests toolbox.</p></div>

<h3>Cheat sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Code</th></tr>
<tr><td>Load the library</td><td><code>import requests</code></td></tr>
<tr><td>Read</td><td><code>r = requests.get(url, auth=A, headers=H, timeout=5)</code></td></tr>
<tr><td>Change one value</td><td><code>requests.patch(url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>Create or replace</td><td><code>requests.put(url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>Create in a list</td><td><code>requests.post(parent_url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>Remove</td><td><code>requests.delete(url, auth=A, headers=H)</code></td></tr>
<tr><td>Status</td><td><code>r.status_code</code>, <code>r.ok</code>, <code>r.raise_for_status()</code></td></tr>
<tr><td>Data</td><td><code>r.json()</code>, then <code>["key"]</code>, <code>[0]</code>, <code>.get("key", default)</code></td></tr>
<tr><td>Failure types</td><td><code>HTTPError</code>, <code>ConnectionError</code>, <code>Timeout</code></td></tr></table>

<h3>The routine</h3>
<ol>
<li>Write the credentials, headers and device list at the top as data.</li>
<li>Put the single-device action in a function that checks the status.</li>
<li>Loop over the devices, with try / except around each call.</li>
<li>Print or save one clear result line per device.</li>
<li>Read back with a GET, and confirm on the device with a show command.</li>
</ol>

<h3>Safety reminders</h3>
<ul>
<li>Placeholder passwords in examples; real ones from a secret store, never in the script.</li>
<li><code>verify=False</code> only in a disposable lab. Real networks: verify on, trusted CA.</li>
<li>Test on one lab router first. Prefer PATCH or an idempotent PUT. Keep a rollback.</li>
<li>Always set a timeout.</li>
</ul>

<h3>Beyond this module</h3>
<p>The same calls work with other APIs: you change the URL, headers and body. When one request needs many, a <code>requests.Session</code> reuses the connection and settings; that is reference material only (our simulator does not provide Session, so it is not run here). You can also turn replies into files (JSON or CSV) for reports, and combine this with SSH scripts from the Python and Netmiko modules.</p>

<div class="eg"><p><b>Worked example.</b> Task: "Report which interfaces are enabled on R1 and R2, and set Loopback100 on both." You start from <code>intf.py</code> (read), extend it with a loop over the two routers (chapter 7), add handlers (chapter 6), and reuse <code>loopbacks.py</code> for the change (chapter 5). Four chapters, one script, and every step has a status you can read.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Debugging the traceback instead of the status. Using data= when you meant json=. Forgetting timeout. Leaving verify=False in production code. Declaring success on 204 without a read-back.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know: requests verbs, <code>json=</code> versus <code>data=</code>, <code>status_code</code>, <code>.json()</code>, <code>raise_for_status()</code>, the exception types, <code>verify</code> and <code>timeout</code>, and how a JSON reply maps to dictionaries and lists. Expect questions that show a short script and ask what it prints or why it fails.</p></div>

<div class="scn"><h4>The script that became a tool</h4><p>An engineer's first requests script read one interface. Over a month it grew a function, a loop over routers, handlers, and an output file. The team now runs it before every change window to confirm state, and after to confirm the change. The engineer never touched a CLI for those checks again.</p><p><b>Lesson:</b> small scripts grow into the team's tools when each step is clear and checked.</p></div>

<div class="iv"><p class="q">"Describe how you would automate a change on twenty routers with Python requests."</p><p>I prove the call on one lab router. Then I put the router list and credentials at the top, write a function that sends the PATCH or idempotent PUT and calls raise_for_status(), and loop over the routers with try/except for HTTPError, ConnectionError and Timeout. Each router prints one result line. I read back with a GET, compare with the intended state, and confirm a sample with show commands before closing the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests mirrors the REST verbs; auth, headers, json, verify and timeout are named arguments.</li>
<li>r.json() gives dicts and lists; walk them with keys and indexes.</li>
<li>Check the status code first; print r.text when a call fails.</li>
<li>Functions, loops and try/except scale one call to many devices safely.</li>
<li>Verify every change on the device. Lab shortcuts stay in the lab.</li>
</ul></div>

`,hi:`

<p>Ab aap Python se network device ki configuration padh aur likh sakte ho. Yeh poora toolbox ek page par hai, saath mein har baar follow karne ki routine.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Aapka requests toolbox."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="20" width="140" height="50" rx="10" fill="#bae6fd"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="14">import requests</text><rect x="165" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="235" y="50" text-anchor="middle" class="svg-ink" font-size="14">requests.get/put...</text><rect x="320" y="20" width="140" height="50" rx="10" fill="#bbf7d0"/><text x="390" y="50" text-anchor="middle" class="svg-ink" font-size="14">r.status_code</text><rect x="475" y="20" width="155" height="50" rx="10" fill="#ddd6fe"/><text x="552.5" y="50" text-anchor="middle" class="svg-ink" font-size="14">r.json()</text><rect x="10" y="100" width="140" height="50" rx="10" fill="#fed7aa"/><text x="80" y="130" text-anchor="middle" class="svg-ink" font-size="14">auth=(u, p)</text><rect x="165" y="100" width="140" height="50" rx="10" fill="#fecaca"/><text x="235" y="130" text-anchor="middle" class="svg-ink" font-size="14">raise_for_status()</text><rect x="320" y="100" width="140" height="50" rx="10" fill="#bae6fd"/><text x="390" y="130" text-anchor="middle" class="svg-ink" font-size="14">try / except</text><rect x="475" y="100" width="155" height="50" rx="10" fill="#bbf7d0"/><text x="552.5" y="130" text-anchor="middle" class="svg-ink" font-size="14">for / def</text><text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="13">Is module ki har script aath tukdon se bani hai</text></svg><p class="cap">Aapka requests toolbox.</p></div>

<h3>Cheat sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Code</th></tr>
<tr><td>Library load karo</td><td><code>import requests</code></td></tr>
<tr><td>Padho</td><td><code>r = requests.get(url, auth=A, headers=H, timeout=5)</code></td></tr>
<tr><td>Ek value badlo</td><td><code>requests.patch(url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>Banao ya replace karo</td><td><code>requests.put(url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>List mein banao</td><td><code>requests.post(parent_url, auth=A, headers=H, json=body)</code></td></tr>
<tr><td>Hatao</td><td><code>requests.delete(url, auth=A, headers=H)</code></td></tr>
<tr><td>Status</td><td><code>r.status_code</code>, <code>r.ok</code>, <code>r.raise_for_status()</code></td></tr>
<tr><td>Data</td><td><code>r.json()</code>, phir <code>["key"]</code>, <code>[0]</code>, <code>.get("key", default)</code></td></tr>
<tr><td>Failure types</td><td><code>HTTPError</code>, <code>ConnectionError</code>, <code>Timeout</code></td></tr></table>

<h3>Routine</h3>
<ol>
<li>Credentials, headers aur device list upar data ki tarah likho.</li>
<li>Ek-device ka action function mein rakho jo status check kare.</li>
<li>Devices par loop chalao, har call ke aas-paas try / except ke saath.</li>
<li>Har device ki ek saaf result line print ya save karo.</li>
<li>GET se read-back karo, aur device par show command se confirm karo.</li>
</ol>

<h3>Safety yaad rakho</h3>
<ul>
<li>Examples mein placeholder passwords; asli wale secret store se, script mein kabhi nahi.</li>
<li><code>verify=False</code> sirf disposable lab mein. Asli networks: verify on, trusted CA.</li>
<li>Pehle ek lab router par test karo. PATCH ya idempotent PUT prefer karo. Rollback rakho.</li>
<li>Hamesha timeout set karo.</li>
</ul>

<h3>Is module ke aage</h3>
<p>Wahi calls doosri APIs ke saath chalti hain: aap URL, headers aur body badalte ho. Jab ek kaam ko kai requests chahiye, <code>requests.Session</code> connection aur settings dobara use karta hai; yeh sirf reference hai (hamara simulator Session nahi deta, isliye yahan chalaya nahi gaya). Replies ko reports ke liye files (JSON ya CSV) mein bhi badal sakte ho, aur ise Python aur Netmiko modules ki SSH scripts ke saath jod sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Kaam: "R1 aur R2 par kaunse interfaces enabled hain report karo, aur dono par Loopback100 set karo." Aap <code>intf.py</code> (padhna) se shuru karte ho, use do routers par loop se badhate ho (chapter 7), handlers jodte ho (chapter 6), aur badlav ke liye <code>loopbacks.py</code> reuse karte ho (chapter 5). Chaar chapters, ek script, aur har step ka status padh sakte ho.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Status ki jagah traceback debug karna. json= ki jagah data= use karna. timeout bhool jaana. Production code mein verify=False chhod dena. Read-back ke bina 204 par safalta ghoshit karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano: requests verbs, <code>json=</code> versus <code>data=</code>, <code>status_code</code>, <code>.json()</code>, <code>raise_for_status()</code>, exception types, <code>verify</code> aur <code>timeout</code>, aur JSON reply dictionaries aur lists se kaise map hota hai. Aise sawaal aayenge jisme chhoti script dikhakar poochte hain kya print hoga ya kyun fail hogi.</p></div>

<div class="scn"><h4>Script jo tool ban gayi</h4><p>Ek engineer ki pehli requests script ek interface padhti thi. Ek mahine mein usme function, routers par loop, handlers aur output file aa gayi. Team ab har change window se pehle state confirm karne aur baad mein badlav confirm karne ke liye ise chalati hai. Un checks ke liye engineer ne dobara CLI nahi chhua.</p><p><b>Lesson:</b> chhoti scripts team ke tools ban jaati hain jab har step saaf aur checked ho.</p></div>

<div class="iv"><p class="q">"Python requests se bees routers par change automate karna kaise batayenge?"</p><p>Pehle ek lab router par call saabit karta hoon. Phir router list aur credentials upar rakhta hoon, ek function likhta hoon jo PATCH ya idempotent PUT bhejta hai aur raise_for_status() bulata hai, aur routers par HTTPError, ConnectionError aur Timeout ke try/except ke saath loop chalata hoon. Har router ek result line print karta hai. GET se read-back karta hoon, intended state se compare karta hoon, aur change band karne se pehle ek sample ko show commands se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests REST verbs ko mirror karta hai; auth, headers, json, verify aur timeout named arguments hain.</li>
<li>r.json() dicts aur lists deta hai; keys aur indexes se chalo.</li>
<li>Pehle status code dekho; call fail ho to r.text print karo.</li>
<li>Functions, loops aur try/except ek call ko kai devices tak safely badhate hain.</li>
<li>Har change device par verify karo. Lab ke shortcuts lab mein hi rahein.</li>
</ul></div>

`}};export{e as default};