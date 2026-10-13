var e={id:`summary`,h:{en:`Summary: checklist, cheat-sheet, glossary and what comes next`,hi:`Summary: checklist, cheat-sheet, glossary aur aage kya`},body:{en:`
<p>This is the one page to keep. It collects what you can do after the module, the skeleton of every script, the calls you need, the words you must know, the facts that interviews and exams ask, and an honest list of where the lab differs from real FortiGate and ASA gear.</p>

<h3>An analogy: the hand-over folder</h3>
<p>When an engineer leaves a project he hands over one folder: how to log in, how to change something, how to check it, how to undo it, and who to call when it breaks. This chapter is that folder for firewall REST automation.</p>

<h3>What you can now do</h3>
<ul>
<li>Create a FortiOS api-user with a narrow access profile and trusted hosts, generate its key once, and keep it in an environment variable.</li>
<li>Write a small client that sets a timeout, attaches the key as a Bearer header and raises one clear exception with the status and the device error number.</li>
<li>Read configuration (<code>cmdb</code>) and live state (<code>monitor</code>) with <code>filter</code>, <code>format</code>, <code>start</code> and <code>count</code>.</li>
<li>Create addresses, groups and policies with an idempotent <code>ensure()</code>, place a policy with <code>action=move</code>, and delete in the right order.</li>
<li>Log in to an ASA with a token, create a network object and an access rule, and read the position from the Location header.</li>
<li>Read back both firewalls with a read-only script that returns exit code 0 or 1, and repair drift.</li>
<li>Rotate a key, audit code for secrets and respond to a leaked key.</li>
<li>Troubleshoot a failing script with the loop: last line, layer, one change, re-run, record.</li>
</ul>

<h3>The skeleton to remember</h3>
<ol>
<li><b>Secret</b> from the environment, never in the file, never printed.</li>
<li><b>Client</b> with a timeout and one exception type.</li>
<li><b>Read</b> what exists (filter and format).</li>
<li><b>Ensure</b> the wanted state: created, updated or unchanged.</li>
<li><b>Verify</b> with a separate read-only script and an exit code.</li>
<li><b>Record</b> the ticket number in a comment on every object.</li>
</ol>

<h3>Cheat-sheet: calls and what they need</h3>
<table>
<tr><th>Task</th><th>FortiOS (key in Bearer header)</th><th>ASA (X-Auth-Token header)</th></tr>
<tr><td>Log in</td><td>no login; the key</td><td>POST /api/tokenservices, basic auth, 204</td></tr>
<tr><td>Read one table</td><td>GET /api/v2/cmdb/firewall/address</td><td>GET /api/objects/networkobjects</td></tr>
<tr><td>One object</td><td>GET .../address/web1 (404 -3 if missing)</td><td>GET .../networkobjects/web2 (404)</td></tr>
<tr><td>Filter</td><td>?filter=name==web1 or name=@web</td><td>read the list and compare in Python</td></tr>
<tr><td>Create</td><td>POST the table; reply has mkey</td><td>POST the table; rule: Location header</td></tr>
<tr><td>Update</td><td>PUT .../address/web1 with the delta</td><td>PUT .../networkobjects/web2</td></tr>
<tr><td>Delete</td><td>DELETE .../address/web1 (500 -23 if in use)</td><td>DELETE (400 IN-USE if in use)</td></tr>
<tr><td>Live state</td><td>/api/v2/monitor/...</td><td>POST /api/cli with show commands</td></tr>
<tr><td>Move a policy</td><td>PUT .../policy/ID?action=move&amp;before=ID</td><td>rules by position</td></tr>
<tr><td>Refused</td><td>401 -37, 403 -14, 404 -3, -5, -651, -23</td><td>401 UNAUTHORIZED, 404 RESOURCE-NOT-FOUND, 400 DUPLICATE</td></tr>
</table>

<h3>Glossary</h3>
<table>
<tr><th>Word</th><th>Meaning</th></tr>
<tr><td>api-user</td><td>the FortiOS account that owns an API key, with an access profile and trusted hosts</td></tr>
<tr><td>accprofile</td><td>access profile: what an administrator or api-user may read or write</td></tr>
<tr><td>trusted hosts</td><td>the source addresses from which a key may be used</td></tr>
<tr><td>Bearer</td><td>the Authorization header type that carries a key or token</td></tr>
<tr><td>cmdb / monitor</td><td>FortiOS configuration area / live state area</td></tr>
<tr><td>mkey, q_origin_key</td><td>the key of an object in a table; used in the URL to address it</td></tr>
<tr><td>envelope</td><td>the fixed JSON wrapper: results, status, http_status, serial, version</td></tr>
<tr><td>idempotent</td><td>safe to run many times with the same final state</td></tr>
<tr><td>drift</td><td>the firewall no longer matches what was approved</td></tr>
<tr><td>X-Auth-Token</td><td>ASA header that carries the token from /tokenservices</td></tr>
<tr><td>rotation</td><td>replacing a key or password on purpose; generate-key kills the old FortiOS key</td></tr>
<tr><td>vdom</td><td>FortiOS virtual domain; the lab has only root</td></tr>
</table>

<h3>Most tested facts</h3>
<ul>
<li>FortiOS REST: <code>/api/v2/cmdb</code> is configuration, <code>/api/v2/monitor</code> is live state.</li>
<li>The FortiOS key is shown <b>once</b>, on generation; keep it in an environment variable.</li>
<li>401 is the key, 403 is permission or trusted hosts, 404 is not found.</li>
<li>Match on the FortiOS <b>error number</b>; the status class (424 or 500) differs between builds.</li>
<li>FortiOS and ASA REST writes are <b>live at once</b>: no candidate, no commit.</li>
<li>ASA: POST /tokenservices, 204, X-Auth-Token header, User-Agent REST API Agent.</li>
<li>A token or key in a URL query string leaks into logs.</li>
</ul>

<h3>In the lab and on real gear</h3>
<ul>
<li>Lab <code>requests</code> does not verify certificates; real <code>requests</code> raises SSLError. curl does verify.</li>
<li>Lab raises <code>Timeout</code>; real raises <code>ConnectTimeout</code> or <code>ReadTimeout</code>.</li>
<li>Lab ConnectionError text is shortened and has no query string.</li>
<li>Lab keys are fixed; real keys are random.</li>
<li>Lab allows two policies with the same name; real FortiOS rejects it.</li>
<li>Lab ASA does not need the REST agent; real ASA does. The lab token header X-Auth-Token-Expires-In is lab only.</li>
<li>Lab ASA refuses to delete a token (405); <code>show running-config object</code> prints nothing in the lab.</li>
<li>Lab <code>requests</code> ignores cookies, so the cookie login <code>/logincheck</code> works with curl only.</li>
<li>The lab FortiGate has one vdom, root. FortiOS error numbers in this module were written from memory.</li>
<li>FMC and FDM (Firepower) are different products and are not covered.</li>
</ul>

<h3>What comes next</h3>
<p>The next module, <code>adv-fw-panos</code>, does the same ticket on Palo Alto PAN-OS: a different API, but a candidate configuration and a commit. The module <code>adv-vault</code> will replace the environment variable with a proper secret store. Both build on the idempotent ensure, the read-back and the habits of this module.</p>

<div class="eg"><p><b>Worked example: the one-page runbook.</b> A team keeps a half-page note next to the scripts: where the key comes from (environment, owner, rotation date), the order of the change (ensure, verify), what each exit code means, and the first check for each error number. When the engineer who wrote it is on leave, the next person runs the same ticket in twenty minutes.</p></div>

<div class="warn"><p><b>Common mistakes to avoid after this module.</b> Treating the lab as proof of the exact error numbers on your devices. Using <code>verify=False</code> outside the lab. Leaving a debug print of headers in a script. Skipping the read-back because the reply said success.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for the platform. "Candidate and commit" is PAN-OS or NETCONF; "writes are live" is FortiOS or ASA REST; "token from tokenservices" is the ASA; "Bearer key" is the FortiOS.</p></div>

<div class="scn"><h4>Handing the job to the night shift</h4><p>You finish a change late on Friday and hand it to the night shift with three lines: the ticket number, the command <code>python3 verify.py</code> and the sentence "exit 0 means done". The night engineer runs it, sees <code>problem(s)</code> for one object, runs <code>objects.py</code> again, then <code>verify.py</code> again, and signs off. Nobody called you.</p><p><b>Lesson:</b> a script with a clear exit code is a hand-over that does not need you awake.</p></div>

<div class="iv"><p class="q">"What did you learn about automating firewalls through REST?"</p><p>That the safe pattern is the same on every box: a secret from the environment, a client with a timeout, an idempotent ensure, and a separate read-back. FortiOS and ASA REST changes are live, so the script itself carries the safety. I read errors by layer and by the device's own error number, and I never print or store a key.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Skeleton: secret, client, read, ensure, verify, record.</li>
<li>FortiOS: Bearer key, cmdb versus monitor, error numbers; ASA: token, X-Auth-Token, message codes.</li>
<li>No commit on these REST APIs: read before, apply idempotently, read after.</li>
<li>Keys live in the environment; rotate on a schedule and at once if leaked.</li>
<li>Remember where the lab differs from real gear and test on the real device before production.</li>
</ul></div>
`,hi:`
<p>Yeh woh ek page hai jo sambhaal kar rakhna hai. Isme woh sab hai jo module ke baad aap kar sakte ho, har script ka skeleton, jin calls ki zaroorat hai, jin shabdon ko jaanna zaroori hai, jo facts interviews aur exams poochte hain, aur ek imaandaar list ki lab asli FortiGate aur ASA gear se kahan alag hai.</p>

<h3>Ek analogy: hand-over folder</h3>
<p>Engineer project chhodte waqt ek folder deta hai: login kaise karna hai, kuch badalna kaise hai, check kaise karna hai, undo kaise karna hai, aur kuch toote to kisko phone karna hai. Yeh chapter firewall REST automation ke liye woh folder hai.</p>

<h3>Aap ab kya kar sakte ho</h3>
<ul>
<li>Narrow access profile aur trusted hosts ke saath FortiOS api-user banana, uski key ek baar generate karna, aur use environment variable mein rakhna.</li>
<li>Chhota client likhna jo timeout lagaye, key Bearer header ki tarah lagaye, aur status aur device error number ke saath ek saaf exception raise kare.</li>
<li><code>filter</code>, <code>format</code>, <code>start</code> aur <code>count</code> ke saath configuration (<code>cmdb</code>) aur live state (<code>monitor</code>) padhna.</li>
<li>Idempotent <code>ensure()</code> se addresses, groups aur policies banana, <code>action=move</code> se policy rakhna, aur sahi order mein delete karna.</li>
<li>ASA mein token se login karna, network object aur access rule banana, aur position Location header se padhna.</li>
<li>Read-only script se dono firewalls wapas padhna jo exit code 0 ya 1 de, aur drift repair karna.</li>
<li>Key rotate karna, code mein secrets ka audit karna, aur leaked key par response dena.</li>
<li>Fail hoti script ko loop se troubleshoot karna: aakhri line, layer, ek badlav, re-run, record.</li>
</ul>

<h3>Yaad rakhne wala skeleton</h3>
<ol>
<li><b>Secret</b> environment se, file mein kabhi nahi, print kabhi nahi.</li>
<li><b>Client</b> timeout aur ek exception type ke saath.</li>
<li><b>Read</b> jo hai (filter aur format).</li>
<li><b>Ensure</b> wanted state: created, updated ya unchanged.</li>
<li><b>Verify</b> alag read-only script aur exit code se.</li>
<li><b>Record</b> har object ke comment mein ticket number.</li>
</ol>

<h3>Cheat-sheet: calls aur unhe kya chahiye</h3>
<table>
<tr><th>Kaam</th><th>FortiOS (key Bearer header mein)</th><th>ASA (X-Auth-Token header)</th></tr>
<tr><td>Login</td><td>login nahi; key</td><td>POST /api/tokenservices, basic auth, 204</td></tr>
<tr><td>Ek table padho</td><td>GET /api/v2/cmdb/firewall/address</td><td>GET /api/objects/networkobjects</td></tr>
<tr><td>Ek object</td><td>GET .../address/web1 (missing ho to 404 -3)</td><td>GET .../networkobjects/web2 (404)</td></tr>
<tr><td>Filter</td><td>?filter=name==web1 ya name=@web</td><td>list padho aur Python mein compare karo</td></tr>
<tr><td>Create</td><td>table par POST; reply mein mkey</td><td>table par POST; rule: Location header</td></tr>
<tr><td>Update</td><td>delta ke saath PUT .../address/web1</td><td>PUT .../networkobjects/web2</td></tr>
<tr><td>Delete</td><td>DELETE .../address/web1 (use mein ho to 500 -23)</td><td>DELETE (use mein ho to 400 IN-USE)</td></tr>
<tr><td>Live state</td><td>/api/v2/monitor/...</td><td>show commands ke saath POST /api/cli</td></tr>
<tr><td>Policy move</td><td>PUT .../policy/ID?action=move&amp;before=ID</td><td>rules position se</td></tr>
<tr><td>Refused</td><td>401 -37, 403 -14, 404 -3, -5, -651, -23</td><td>401 UNAUTHORIZED, 404 RESOURCE-NOT-FOUND, 400 DUPLICATE</td></tr>
</table>

<h3>Glossary</h3>
<table>
<tr><th>Shabd</th><th>Matlab</th></tr>
<tr><td>api-user</td><td>FortiOS account jo API key rakhta hai, access profile aur trusted hosts ke saath</td></tr>
<tr><td>accprofile</td><td>access profile: administrator ya api-user kya padh ya likh sakta hai</td></tr>
<tr><td>trusted hosts</td><td>woh source addresses jahan se key use ho sakti hai</td></tr>
<tr><td>Bearer</td><td>Authorization header ka type jo key ya token le jaata hai</td></tr>
<tr><td>cmdb / monitor</td><td>FortiOS configuration area / live state area</td></tr>
<tr><td>mkey, q_origin_key</td><td>table mein object ki key; URL mein use address karne ke liye</td></tr>
<tr><td>envelope</td><td>fixed JSON wrapper: results, status, http_status, serial, version</td></tr>
<tr><td>idempotent</td><td>kai baar chalane par bhi wahi final state, safe</td></tr>
<tr><td>drift</td><td>firewall ab approved cheez se match nahi karta</td></tr>
<tr><td>X-Auth-Token</td><td>ASA header jo /tokenservices ka token le jaata hai</td></tr>
<tr><td>rotation</td><td>jaan-boojh kar key ya password badalna; generate-key purani FortiOS key maar deta hai</td></tr>
<tr><td>vdom</td><td>FortiOS virtual domain; lab mein sirf root</td></tr>
</table>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>FortiOS REST: <code>/api/v2/cmdb</code> configuration hai, <code>/api/v2/monitor</code> live state.</li>
<li>FortiOS key generation par <b>sirf ek baar</b> dikhti hai; environment variable mein rakho.</li>
<li>401 key hai, 403 permission ya trusted hosts, 404 not found.</li>
<li>FortiOS <b>error number</b> par match karo; status class (424 ya 500) builds mein alag hoti hai.</li>
<li>FortiOS aur ASA REST writes <b>turant live</b> hain: candidate nahi, commit nahi.</li>
<li>ASA: POST /tokenservices, 204, X-Auth-Token header, User-Agent REST API Agent.</li>
<li>URL query string mein token ya key logs mein leak hoti hai.</li>
</ul>

<h3>Lab mein aur asli gear par</h3>
<ul>
<li>Lab <code>requests</code> certificates verify nahi karta; asli <code>requests</code> SSLError raise karta hai. curl verify karta hai.</li>
<li>Lab <code>Timeout</code> raise karta hai; asli <code>ConnectTimeout</code> ya <code>ReadTimeout</code>.</li>
<li>Lab ConnectionError ka text chhota hai aur query string nahi.</li>
<li>Lab keys fixed hain; asli keys random.</li>
<li>Lab ek hi naam ki do policies leta hai; asli FortiOS reject karta hai.</li>
<li>Lab ASA ko REST agent nahi chahiye; asli ASA ko chahiye. Lab ka token header X-Auth-Token-Expires-In sirf lab ka hai.</li>
<li>Lab ASA token delete karne se mana karta hai (405); lab mein <code>show running-config object</code> kuch print nahi karta.</li>
<li>Lab <code>requests</code> cookies ignore karta hai, isliye cookie login <code>/logincheck</code> sirf curl se chalta hai.</li>
<li>Lab FortiGate mein ek vdom hai, root. Is module ke FortiOS error numbers yaad se likhe gaye hain.</li>
<li>FMC aur FDM (Firepower) alag products hain aur cover nahi.</li>
</ul>

<h3>Aage kya</h3>
<p>Agla module, <code>adv-fw-panos</code>, wahi ticket Palo Alto PAN-OS par karta hai: alag API, par candidate configuration aur commit ke saath. Module <code>adv-vault</code> environment variable ko sahi secret store se badal dega. Dono is module ke idempotent ensure, read-back aur aadaton par bante hain.</p>

<div class="eg"><p><b>Worked example: ek page ka runbook.</b> Team scripts ke paas aadha page note rakhti hai: key kahan se aati hai (environment, owner, rotation date), change ka order (ensure, verify), har exit code ka matlab, aur har error number ka pehla check. Jab usse likhne wala engineer chhutti par ho, agla vyakti wahi ticket bees minute mein chalata hai.</p></div>

<div class="warn"><p><b>Is module ke baad bachne wali galtiyan.</b> Lab ko apne devices ke exact error numbers ka saboot maan lena. Lab ke bahar <code>verify=False</code> use karna. Script mein headers ka debug print chhod dena. Read-back chhod dena kyunki reply ne success kaha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal mein platform padho. "Candidate aur commit" PAN-OS ya NETCONF hai; "writes live hain" FortiOS ya ASA REST hai; "tokenservices se token" ASA hai; "Bearer key" FortiOS hai.</p></div>

<div class="scn"><h4>Kaam night shift ko saunpna</h4><p>Aap Shukravar der raat change khatam karke night shift ko teen line deke saunpte ho: ticket number, command <code>python3 verify.py</code> aur vaakya "exit 0 matlab done". Night engineer chalata hai, ek object ke liye <code>problem(s)</code> dekhta hai, <code>objects.py</code> dobara chalata hai, phir <code>verify.py</code> dobara, aur sign off karta hai. Kisi ne aapko phone nahi kiya.</p><p><b>Lesson:</b> saaf exit code wali script aisa hand-over hai jisme aapko jaagte rehna nahi padta.</p></div>

<div class="iv"><p class="q">"REST se firewalls automate karne ke baare mein aapne kya seekha?"</p><p>Ki safe pattern har box par wahi hai: environment se secret, timeout wala client, idempotent ensure, aur alag read-back. FortiOS aur ASA REST changes live hain, isliye safety script khud rakhti hai. Main errors ko layer aur device ke apne error number se padhta hoon, aur key kabhi print ya store nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Skeleton: secret, client, read, ensure, verify, record.</li>
<li>FortiOS: Bearer key, cmdb versus monitor, error numbers; ASA: token, X-Auth-Token, message codes.</li>
<li>In REST APIs par commit nahi: pehle padho, idempotent apply karo, baad mein padho.</li>
<li>Keys environment mein rehti hain; schedule par aur leak hone par turant rotate karo.</li>
<li>Yaad rakho lab asli gear se kahan alag hai aur production se pehle asli device par test karo.</li>
</ul></div>
`}};export{e as default};