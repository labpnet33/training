var e={id:`big-picture`,h:{en:`Firewall APIs from Python: the big picture`,hi:`Python se firewall APIs: big picture`},body:{en:`
<p><b>What you will learn.</b> This module takes you from "I click through the firewall GUI" to "I change a firewall from Python, prove the change, and never leak the key that allowed it". By the end you can create a least-privilege API user on a FortiGate, call the FortiOS REST API v2 with <code>requests</code>, read and write address, group and policy objects without creating duplicates, log in to the Cisco ASA REST API and create a network object and an access rule, read a failure down to its layer (network, key, caller, data), and rotate a key.</p>
<p><b>Prerequisites.</b> <code>auto-h&#116;tp</code> and <code>auto-requests</code> (REST, status codes, the <code>requests</code> library), <code>py-secrets</code> (environment variables, no passwords in code), <code>adv-nkmiko</code> (you already drive Cisco devices over SSH) and <code>adv-netconf</code> (so you can compare a transactional protocol with plain REST). The next module, <code>adv-fw-panos</code>, covers the PAN-OS XML API; this one does not.</p>

<h3>An analogy: the front desk and the staff entrance</h3>
<p>The firewall GUI is the front desk: a person walks up, talks to a receptionist and clicks. The REST API is the <b>staff entrance</b> next to it. It is faster and a script can use it all day, but it opens with a <b>key card</b>. If the card is lost, whoever finds it walks straight in. So the entrance has three guards: the card itself (the API key), a list of doors the card may be used from (trusted hosts), and a role printed on the card (the access profile). Most of this module is about learning to use the entrance quickly <i>and</i> keeping the card safe.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="From a Python script to two firewall APIs"><rect x="8" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="68" y="102" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="68" y="119" text-anchor="middle" class="svg-muted" font-size="11">requests + env vars</text><line x1="128" y1="105" x2="168" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="168,105 160,101 160,109" fill="#64748b"/><rect x="168" y="70" width="90" height="70" rx="10" fill="#fde68a"/><text x="213" y="102" text-anchor="middle" class="svg-ink" font-size="12">TLS</text><text x="213" y="119" text-anchor="middle" class="svg-muted" font-size="11">encrypted</text><line x1="258" y1="85" x2="318" y2="52" stroke="#64748b" stroke-width="2"/><polygon points="318,52 310,60 310,60" fill="#64748b"/><line x1="258" y1="125" x2="318" y2="158" stroke="#64748b" stroke-width="2"/><polygon points="318,158 310,150 310,150" fill="#64748b"/><rect x="318" y="12" width="170" height="80" rx="10" fill="#fed7aa"/><text x="403" y="49" text-anchor="middle" class="svg-ink" font-size="12">FGT1 FortiOS</text><text x="403" y="66" text-anchor="middle" class="svg-muted" font-size="11">REST API v2: Bearer key</text><rect x="318" y="118" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="403" y="155" text-anchor="middle" class="svg-ink" font-size="12">ASA1 ASA REST</text><text x="403" y="172" text-anchor="middle" class="svg-muted" font-size="11">REST API: login, then token</text><rect x="512" y="12" width="120" height="80" rx="10" fill="#ddd6fe"/><text x="572" y="49" text-anchor="middle" class="svg-ink" font-size="12">cmdb</text><text x="572" y="66" text-anchor="middle" class="svg-muted" font-size="11">config, state</text><rect x="512" y="118" width="120" height="80" rx="10" fill="#e2e8f0"/><text x="572" y="155" text-anchor="middle" class="svg-ink" font-size="12">objects, access</text><text x="572" y="172" text-anchor="middle" class="svg-muted" font-size="11">objects, rules</text><line x1="488" y1="52" x2="512" y2="52" stroke="#64748b" stroke-width="2"/><line x1="488" y1="158" x2="512" y2="158" stroke="#64748b" stroke-width="2"/></svg><p class="cap">One script, two REST APIs. FortiOS wants a key in a header; the ASA wants a login first and hands back a token.</p></div>

<h3>The three firewall APIs of this track</h3>
<table class="cmp"><tr><th></th><th>FortiOS REST v2</th><th>Cisco ASA REST</th><th>PAN-OS XML API</th></tr>
<tr><td>Module</td><td>this one</td><td>this one</td><td><code>adv-fw-panos</code></td></tr>
<tr><td>Login</td><td>API key in a header</td><td>basic login, then a token</td><td>key from a keygen call</td></tr>
<tr><td>Data</td><td>JSON</td><td>JSON</td><td>XML</td></tr>
<tr><td>A write is live</td><td>at once</td><td>at once</td><td>after a commit</td></tr></table>
<p>The last row is the one to remember. A FortiOS or ASA REST call that succeeds has <b>already changed the running firewall</b>. There is no candidate datastore, no commit and no confirmed-commit timer like the one you used in <code>adv-netconf</code>. That is why every tool in this module looks before it writes (idempotence), reads back after it writes (proof), and keeps the key out of every place a key can leak.</p>

<h3>Your first call</h3>
<p>The lab host AUTO01 (10.99.0.60) can reach FGT1 (10.99.0.41). With a key in the environment variable <code>FGT_TOKEN</code> one line of <code>curl</code> asks the firewall about itself. <code>-s</code> keeps curl quiet and <code>-k</code> accepts the lab's self-signed certificate. Note that the key is never typed: the shell expands <code>$FGT_TOKEN</code>.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" h&#116;tps://10.99.0.41/api/v2/monitor/system/status
{
  "http_method":"GET",
  "results":{
    "model_name":"FortiGate",
    "model_number":"VM64",
    "model":"FGVM64",
<span class="hl">    "hostname":"FGT1",</span>
    "log_disk_status":"available"
  },
  "vdom":"root",
  "path":"system",
  "name":"status",
  "status":"success",
<span class="hl">  "http_status":200,</span>
<span class="hl">  "serial":"FGVMEV5I0AL40000",</span>
<span class="hl">  "version":"v7.4.4",</span>
  "build":2662
}</pre>
<p>Read the answer as an <b>envelope</b>: <code>results</code> is the letter, everything around it is the receipt. <code>status</code> and <code>http_status</code> say whether the call worked, and <code>serial</code>, <code>version</code> and <code>build</code> say which box answered. You will use the same envelope in every chapter.</p>

<div class="eg"><p><b>Worked example: the ticket.</b> Change request CHG-3105 says: put the web servers 10.20.0.10 and 10.20.0.11 behind an address group <code>WEB-SERVERS</code> with a policy <code>lan-to-web</code> on the FortiGate FGT1, and give the web server 10.1.1.20 a network object and a tcp/443 rule on the ASA ASA1. By hand that is two different GUIs. In Lab 1 you build one set of scripts that does both, can be run twice without harm, and ends with a checker that returns exit code 0 only when both firewalls match the ticket.</p></div>

<h3>The road map</h3>
<ul>
<li>Chapters 2 and 3: the API user, the key and the secret rule; first calls and the JSON envelope (Lab 1, steps 1 and 2).</li>
<li>Chapters 4 to 6: reading the cmdb, creating objects without duplicates, and policies (Lab 1, steps 3 and 4).</li>
<li>Chapter 7: reading FortiOS errors, layer by layer.</li>
<li>Chapter 8: the ASA REST API (Lab 1, step 5).</li>
<li>Chapter 9: one change, two firewalls, proven by reading back; rotating a key (Lab 1, steps 6 and 7).</li>
<li>Chapter 10: Lab 2, "The script that hit four walls". Chapter 11: summary and checklist.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Treating the API as "the GUI with a script on top". The GUI shows you the object before you press OK and has an undo of sorts. A script with a valid key can create, change or delete a hundred objects in a second, with nobody watching. The safety has to be built into the script: look first, change little, read back, stop on the first surprise.</p></div>
<div class="exam"><p><b>Exam trap.</b> The FortiOS REST API listens on the <b>administration HTT&#80;S port</b> (<code>admin-sport</code>, 443 by default), the same web server as the GUI. The ASA REST API also uses port 443. Neither is a separate "API port", so if the GUI is unreachable the API is too.</p></div>

<div class="scn"><h4>The key in the chat</h4><p>A network engineer wanted a colleague to test a script, so he pasted the script, with the API key inside it, into a team chat. Two weeks later a firewall policy named "test-any-any" appeared. The key had been copied from the chat history by a contractor's account that should not have had it. Nothing was hacked: the key simply did what a key does for whoever holds it.</p><p><b>Lesson:</b> an API key is a password with no second factor. Treat it that way from the first line of the first script.</p></div>

<div class="iv"><p class="q">"Why would you use the REST API instead of the firewall GUI or CLI for changes?"</p><p>Repeatable and reviewable: the same script gives the same result on ten firewalls, can be peer reviewed and kept in version control, and can read the result back to prove it. The price is that a REST write is live at once on FortiOS and ASA, so I make the script idempotent, I read back after every change, and I keep the key in an environment variable with a narrow access profile and trusted host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS REST v2 and ASA REST are JSON over the firewall's own web server on port 443; PAN-OS comes in the next module.</li>
<li>A successful FortiOS or ASA REST write is live at once: no commit, no candidate.</li>
<li>FortiOS uses an API key in a header; the ASA uses a basic login that returns a token.</li>
<li>Always read the envelope: <code>status</code>, <code>http_status</code>, <code>error</code>, and which box answered.</li>
<li>The API key is a password: environment variable only, narrow profile, trusted host, rotate on suspicion.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Yeh module aapko "main firewall GUI mein click karta hoon" se "main Python se firewall badalta hoon, change saabit karta hoon, aur jis key se badla usse kabhi leak nahi karta" tak le jaata hai. Ant mein aap FortiGate par least-privilege API user bana sakoge, <code>requests</code> se FortiOS REST API v2 call kar sakoge, duplicates banaye bina address, group aur policy objects padh aur likh sakoge, Cisco ASA REST API mein login karke network object aur access rule bana sakoge, failure ko uski layer (network, key, caller, data) tak padh sakoge, aur key rotate kar sakoge.</p>
<p><b>Prerequisites.</b> <code>auto-h&#116;tp</code> aur <code>auto-requests</code> (REST, status codes, <code>requests</code> library), <code>py-secrets</code> (environment variables, code mein password nahi), <code>adv-nkmiko</code> (Cisco devices ko SSH se chalana aap jaante ho) aur <code>adv-netconf</code> (taaki transactional protocol ko plain REST se compare kar sako). Agla module <code>adv-fw-panos</code> PAN-OS XML API sikhata hai; yeh module nahi.</p>

<h3>Ek analogy: front desk aur staff entrance</h3>
<p>Firewall GUI front desk hai: insaan aata hai, receptionist se baat karta hai aur click karta hai. REST API uske bagal ka <b>staff entrance</b> hai. Woh tez hai aur script use poora din chala sakti hai, par woh <b>key card</b> se khulta hai. Card kho jaye to jise mile woh seedha andar chala jaata hai. Isliye entrance par teen guard hain: card khud (API key), un darwazon ki list jahan se card chal sakta hai (trusted hosts), aur card par chhapa role (access profile). Is module ka zyadatar hissa entrance ko tezi se use karna <i>aur</i> card ko safe rakhna sikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Python script se do firewall APIs tak"><rect x="8" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="68" y="102" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="68" y="119" text-anchor="middle" class="svg-muted" font-size="11">requests + env vars</text><line x1="128" y1="105" x2="168" y2="105" stroke="#64748b" stroke-width="2"/><polygon points="168,105 160,101 160,109" fill="#64748b"/><rect x="168" y="70" width="90" height="70" rx="10" fill="#fde68a"/><text x="213" y="102" text-anchor="middle" class="svg-ink" font-size="12">TLS</text><text x="213" y="119" text-anchor="middle" class="svg-muted" font-size="11">encrypted</text><line x1="258" y1="85" x2="318" y2="52" stroke="#64748b" stroke-width="2"/><polygon points="318,52 310,60 310,60" fill="#64748b"/><line x1="258" y1="125" x2="318" y2="158" stroke="#64748b" stroke-width="2"/><polygon points="318,158 310,150 310,150" fill="#64748b"/><rect x="318" y="12" width="170" height="80" rx="10" fill="#fed7aa"/><text x="403" y="49" text-anchor="middle" class="svg-ink" font-size="12">FGT1 FortiOS</text><text x="403" y="66" text-anchor="middle" class="svg-muted" font-size="11">REST API v2: Bearer key</text><rect x="318" y="118" width="170" height="80" rx="10" fill="#bbf7d0"/><text x="403" y="155" text-anchor="middle" class="svg-ink" font-size="12">ASA1 ASA REST</text><text x="403" y="172" text-anchor="middle" class="svg-muted" font-size="11">REST API: login, phir token</text><rect x="512" y="12" width="120" height="80" rx="10" fill="#ddd6fe"/><text x="572" y="49" text-anchor="middle" class="svg-ink" font-size="12">cmdb</text><text x="572" y="66" text-anchor="middle" class="svg-muted" font-size="11">config, state</text><rect x="512" y="118" width="120" height="80" rx="10" fill="#e2e8f0"/><text x="572" y="155" text-anchor="middle" class="svg-ink" font-size="12">objects, access</text><text x="572" y="172" text-anchor="middle" class="svg-muted" font-size="11">objects, rules</text><line x1="488" y1="52" x2="512" y2="52" stroke="#64748b" stroke-width="2"/><line x1="488" y1="158" x2="512" y2="158" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Ek script, do REST APIs. FortiOS header mein key maangta hai; ASA pehle login maangta hai aur token wapas deta hai.</p></div>

<h3>Is track ke teen firewall APIs</h3>
<table class="cmp"><tr><th></th><th>FortiOS REST v2</th><th>Cisco ASA REST</th><th>PAN-OS XML API</th></tr>
<tr><td>Module</td><td>yahi module</td><td>yahi module</td><td><code>adv-fw-panos</code></td></tr>
<tr><td>Login</td><td>header mein API key</td><td>basic login, phir token</td><td>keygen call se key</td></tr>
<tr><td>Data</td><td>JSON</td><td>JSON</td><td>XML</td></tr>
<tr><td>Write live hota hai</td><td>turant</td><td>turant</td><td>commit ke baad</td></tr></table>
<p>Aakhri row yaad rakhne wali hai. Jo FortiOS ya ASA REST call safal hoti hai woh <b>running firewall ko pehle hi badal chuki hoti hai</b>. Na candidate datastore hai, na commit, na <code>adv-netconf</code> wala confirmed-commit timer. Isliye is module ka har tool likhne se pehle dekhta hai (idempotence), likhne ke baad wapas padhta hai (proof), aur key ko har us jagah se door rakhta hai jahan key leak ho sakti hai.</p>

<h3>Aapki pehli call</h3>
<p>Lab host AUTO01 (10.99.0.60) FGT1 (10.99.0.41) tak pahunch sakta hai. Environment variable <code>FGT_TOKEN</code> mein key ho to <code>curl</code> ki ek line firewall se uske baare mein poochti hai. <code>-s</code> curl ko chup rakhta hai aur <code>-k</code> lab ka self-signed certificate maan leta hai. Dhyan do: key kabhi type nahi hui, shell <code>$FGT_TOKEN</code> ko expand karta hai.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" h&#116;tps://10.99.0.41/api/v2/monitor/system/status
{
  "http_method":"GET",
  "results":{
    "model_name":"FortiGate",
    "model_number":"VM64",
    "model":"FGVM64",
<span class="hl">    "hostname":"FGT1",</span>
    "log_disk_status":"available"
  },
  "vdom":"root",
  "path":"system",
  "name":"status",
  "status":"success",
<span class="hl">  "http_status":200,</span>
<span class="hl">  "serial":"FGVMEV5I0AL40000",</span>
<span class="hl">  "version":"v7.4.4",</span>
  "build":2662
}</pre>
<p>Jawab ko ek <b>envelope</b> ki tarah padho: <code>results</code> chitthi hai, uske aas-paas sab receipt. <code>status</code> aur <code>http_status</code> batate hain ki call chali ya nahi, aur <code>serial</code>, <code>version</code> aur <code>build</code> batate hain ki kaunsa box bola. Yahi envelope aap har chapter mein use karoge.</p>

<div class="eg"><p><b>Worked example: ticket.</b> Change request CHG-3105 kehti hai: FortiGate FGT1 par web servers 10.20.0.10 aur 10.20.0.11 ko address group <code>WEB-SERVERS</code> mein daalo aur unki policy <code>lan-to-web</code> banao, aur ASA ASA1 par web server 10.1.1.20 ko network object aur tcp/443 rule do. Haath se yeh do alag GUIs hain. Lab 1 mein aap scripts ka ek set banate ho jo dono karta hai, do baar chalane par bhi koi nuksan nahi, aur ek checker par khatam hota hai jo tabhi exit code 0 deta hai jab dono firewalls ticket se match karein.</p></div>

<h3>Road map</h3>
<ul>
<li>Chapters 2 aur 3: API user, key aur secret rule; pehli calls aur JSON envelope (Lab 1, steps 1 aur 2).</li>
<li>Chapters 4 se 6: cmdb padhna, duplicates ke bina objects banana, aur policies (Lab 1, steps 3 aur 4).</li>
<li>Chapter 7: FortiOS errors, layer by layer padhna.</li>
<li>Chapter 8: ASA REST API (Lab 1, step 5).</li>
<li>Chapter 9: ek change, do firewalls, wapas padhkar saabit; key rotate karna (Lab 1, steps 6 aur 7).</li>
<li>Chapter 10: Lab 2, "The script that hit four walls". Chapter 11: summary aur checklist.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> API ko "GUI ke upar script" samajhna. GUI OK dabane se pehle object dikhata hai aur ek tarah ka undo bhi deta hai. Valid key wali script ek second mein sau objects bana, badal ya hata sakti hai, bina kisi ke dekhe. Safety script ke andar banani padti hai: pehle dekho, thoda badlo, wapas padho, pehli hairani par ruk jao.</p></div>
<div class="exam"><p><b>Exam trap.</b> FortiOS REST API <b>administration HT&#84;PS port</b> (<code>admin-sport</code>, default 443) par sunti hai, wahi web server jo GUI ka hai. ASA REST API bhi port 443 use karti hai. Dono mein koi alag "API port" nahi hai, isliye GUI na khule to API bhi nahi khulegi.</p></div>

<div class="scn"><h4>Chat mein key</h4><p>Ek network engineer ne colleague ko script test karwane ke liye script, API key samet, team chat mein paste kar di. Do hafte baad "test-any-any" naam ki firewall policy dikhi. Key chat history se ek contractor ke account ne copy kar li thi jise woh nahi milni chahiye thi. Kuch hack nahi hua: key ne bas wahi kiya jo key apne holder ke liye karti hai.</p><p><b>Lesson:</b> API key bina second factor ka password hai. Pehli script ki pehli line se use waisa hi maano.</p></div>

<div class="iv"><p class="q">"Changes ke liye firewall GUI ya CLI ki jagah REST API kyon use karoge?"</p><p>Repeatable aur reviewable: wahi script das firewalls par wahi result deti hai, peer review ho sakti hai, version control mein rakhi ja sakti hai, aur result wapas padhkar saabit kar sakti hai. Qeemat yeh hai ki FortiOS aur ASA par REST write turant live hota hai, isliye script ko idempotent banata hoon, har change ke baad read back karta hoon, aur key ko environment variable mein narrow access profile aur trusted host ke saath rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS REST v2 aur ASA REST firewall ke apne web server par port 443 par JSON hain; PAN-OS agle module mein.</li>
<li>FortiOS ya ASA par safal REST write turant live hota hai: na commit, na candidate.</li>
<li>FortiOS header mein API key use karta hai; ASA basic login se token deta hai.</li>
<li>Envelope hamesha padho: <code>status</code>, <code>http_status</code>, <code>error</code>, aur kaunsa box bola.</li>
<li>API key password hai: sirf environment variable, narrow profile, trusted host, shak par rotate.</li>
</ul></div>
`}};export{e as default};