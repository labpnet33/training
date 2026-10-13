var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: Lab 2, the API that leaked`,hi:`Troubleshooting workflow: Lab 2, woh API jo leak kar rahi thi`},body:{en:`
<p>This chapter walks Lab 2, "The API that leaked". The previous owner is gone. Three tickets say: valid change requests are rejected, <code>/devices</code> shows far too much, and somebody changed a description without logging in. You have <code>api.py</code>, <code>models.py</code> and a smoke test, <code>check.py</code>, that prints one PASS or FAIL line per rule. The method is the same as for a router: <b>one symptom, one layer, one change, one test</b>.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="The troubleshooting loop"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">check.py</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">find a FAIL</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Read detail</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">status, loc, type</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Fix one thing</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">one fault only</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop + start</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">new code</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">check.py</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">next FAIL</text></svg></div>
<h3>Which layer is it?</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>First command</th></tr>
<tr><td><code>curl</code> exit 7, connection refused</td><td>process or port</td><td><code>ss -tlnp</code>, <code>ps aux</code>, <code>cat api.log</code></td></tr>
<tr><td><code>address already in use</code></td><td>an old copy still runs</td><td><code>pkill -f uvicorn</code></td></tr>
<tr><td>422</td><td>request does not fit the model</td><td>read <code>loc</code>, <code>type</code>, <code>msg</code></td></tr>
<tr><td>401 / 403</td><td>token</td><td>the header and <code>API_TOKEN</code></td></tr>
<tr><td>500 / 502</td><td>handler or device</td><td>traceback in the log</td></tr>
<tr><td>200 but wrong content</td><td>answer shape or state</td><td>look at the whole body</td></tr></table>

<h3>Start: read every FAIL</h3>
<p>After the exports, start the server and run the smoke test:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
<span class="hl">FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username</span>
<span class="hl">FAIL POST description with a token        422 body.desc missing: Field required</span>
FAIL POST without a token is refused      422 body.desc missing: Field required
PASS unknown device is a 404              404
PASS device down is a 502                 502
<span class="hl">4 of 7 checks passed</span></pre>
<p>Three rules fail. Take them in the order the detail gives you information. The valid POST gets a 422 that says the field <code>desc</code> is missing. The caller sends <code>description</code>, as the ticket contract says, so the model is wrong, not the caller.</p>

<h3>Fault 1: the field has the wrong name</h3>
<pre class="code"><span class="c"># models.py as handed over</span>
class DescriptionIn(BaseModel):
    interface: str = Field(pattern=r"^(GigabitEthernet|Loopback)\\d+(/\\d+)*$")
    desc: str = Field(min_length=3, max_length=15, pattern=r"^[A-Za-z0-9 ._:/-]+$")</pre>
<p>The model calls the field <code>desc</code>; <code>api.py</code> already uses <code>change.description</code>. Rename the field in <code>models.py</code>. Then make the classic mistake on purpose, to learn its error: start the new copy while the old one is running.</p>
<pre class="out">AUTO01$ uvicorn api:app --host 0.0.0.0 --port 8000
INFO:     Started server process [2308]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
<span class="hl">ERROR:    [Errno 98] error while attempting to bind on address ('0.0.0.0', 8000): address already in use</span>
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.</pre>
<p><code>[Errno 98] ... address already in use</code>: two servers cannot share a port. Stop the old process with <code>pkill -f uvicorn</code>, start again in the background and rerun the test:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username
<span class="hl">FAIL POST description with a token        422 body.description string_too_long: String should have at most 15 characters</span>
<span class="hl">FAIL POST without a token is refused      422 body.description string_too_long: String should have at most 15 characters</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
4 of 7 checks passed</pre>
<h3>Fault 2: the limit is too tight</h3>
<p>The detail now quotes the rule: "at most 15 characters". The naming standard allows 40, and the test description <code>UPLINK-TO-BLR-CORE-01</code> has 21. Change <code>max_length=15</code> to <code>40</code>, restart, test:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username
<span class="hl">PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01</span>
<span class="hl">FAIL POST without a token is refused      200</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
5 of 7 checks passed</pre>
<p>The valid POST now passes and reads back the description from R1. But look at the POST <b>without</b> a token: it returned <code>200</code>. Until now that line showed 422, hiding the real problem behind the first one. Keep it in mind; first the leak.</p>

<h3>Fault 3: the answer shows too much</h3>
<p>The check only printed the keys. Look at what a caller really receives:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices
<span class="hl">[{"name":"R1","role":"core","device_type":"cisco_ios","host":"10.99.0.1","username":"netops","password":"NK@2026","secret":"NK@2026"},{"name":"R2","role":"edge","device_type":"cisco_ios","host":"10.99.0.2","username":"netops","password":"NK@2026","secret":"NK@2026"},{"name":"R3","role":"spare","device_type":"cisco_ios","host":"10.99.0.3","username":"netops","password":"NK@2026","secret":"NK@2026"}]</span></pre>
<p>Login name, password and enable secret, for every router, to anybody with a token. The route builds its rows from the connection parameters. Declare a narrow answer and use it:</p>
<pre class="code"><span class="c"># models.py: the narrow answer</span>
class DeviceOut(BaseModel):
    name: str
    role: str
    host: str</pre>
<p>Add the model, import it, and put <code>response_model=list[DeviceOut]</code> on the <code>/devices</code> route. Restart and test:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
<span class="hl">PASS GET /devices shows no secrets        keys: host,name,role</span>
PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01
<span class="hl">FAIL POST without a token is refused      200</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
6 of 7 checks passed</pre>
<h3>Fault 4: the change route has no gate</h3>
<p>One line is left, and it is the most dangerous: anybody on the network can change a router description. The decorator of the POST route lacks <code>dependencies=[Depends(need_token)]</code>, which the GET routes have. Add it, restart, test, and confirm in the log:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
PASS GET /devices shows no secrets        keys: host,name,role
PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01
<span class="hl">PASS POST without a token is refused      403</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
<span class="hl">7 of 7 checks passed</span></pre><pre class="out">AUTO01$ grep 403 api.log
<span class="hl">INFO:     10.99.0.60:51557 - "POST /devices/R1/description HT&#84;P/1.1" 403 Forbidden</span></pre>
<p>Seven of seven, and the log records the refusal. In the lab this is the whole job; in real life you would also change the password that was exposed, because the leak happened while the fault existed.</p>

<div class="warn"><p><b>Common mistake.</b> Fixing several things between two tests. When the test finally changes, you do not know which edit did it. Also forgetting the restart: the server runs the old code, the test still fails, and you start hunting a bug that you already fixed.</p></div>
<div class="exam"><p><b>Exam trap.</b> A 422 about a <i>missing</i> field can mean the client is wrong or the model is wrong. Check the contract (the ticket or the documentation) before you decide who changes. And a rule that returns 422 for another reason never proves the gate works; test authentication with a valid body.</p></div>

<div class="scn"><h4>The fault behind the fault</h4><p>An engineer fixed the 422 and the test then reported the unauthenticated POST as a new failure. He assumed his fix had broken the gate. In fact the gate had never existed; the earlier 422 had been covering it, because validation errors on the body happen before the handler and, with no gate, nothing else checked the call. After the fix the request went all the way through.</p><p><b>Lesson:</b> fixing one fault can reveal another. Re-run the whole test, not just the line you fixed.</p></div>

<div class="iv"><p class="q">"An API you inherited rejects valid requests and returns too much data. How do you start?"</p><p>I run a smoke test that covers each rule and read the failing details: the status, then <code>loc</code>, <code>type</code> and <code>msg</code> for a 422. I change one thing at a time, restart the server so the new code runs, and re-run everything. For the over-sharing I look at the raw body, not just the status, and fix it with a narrow <code>response_model</code>. Finally I check that every write route has the same gate as the read routes and rotate any secret that was exposed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work one symptom, one layer, one change, one test; restart after every change.</li>
<li>A 422 detail names the place (<code>loc</code>), the rule (<code>type</code>) and the limit (<code>msg</code>).</li>
<li><code>[Errno 98] address already in use</code> means an old server still holds the port.</li>
<li>A narrow <code>response_model</code> stops leaks; a missing dependency leaves a route open.</li>
<li>Fixing one fault can uncover another; always re-run the full test.</li>
</ul></div>
`,hi:`
<p>Yeh chapter Lab 2, "The API that leaked", ko walk karta hai. Pichla owner chala gaya. Teen tickets kehte hain: valid change requests reject ho rahi hain, <code>/devices</code> bahut zyada dikha raha hai, aur kisi ne bina login kiye description badal di. Aapke paas <code>api.py</code>, <code>models.py</code> aur smoke test <code>check.py</code> hai jo har rule ke liye ek PASS ya FAIL line print karta hai. Tareeka router jaisa hi hai: <b>ek symptom, ek layer, ek change, ek test</b>.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Troubleshooting loop"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">check.py</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">FAIL dhoondho</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Detail padho</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">status, loc, type</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Ek cheez fix</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">sirf ek fault</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop + start</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">naya code</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">check.py</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">agla FAIL</text></svg></div>
<h3>Kaunsi layer hai?</h3>
<table class="cmp"><tr><th>Symptom</th><th>Layer</th><th>Pehla command</th></tr>
<tr><td><code>curl</code> exit 7, connection refused</td><td>process ya port</td><td><code>ss -tlnp</code>, <code>ps aux</code>, <code>cat api.log</code></td></tr>
<tr><td><code>address already in use</code></td><td>purani copy abhi chal rahi hai</td><td><code>pkill -f uvicorn</code></td></tr>
<tr><td>422</td><td>request model se match nahi karti</td><td><code>loc</code>, <code>type</code>, <code>msg</code> padho</td></tr>
<tr><td>401 / 403</td><td>token</td><td>header aur <code>API_TOKEN</code></td></tr>
<tr><td>500 / 502</td><td>handler ya device</td><td>log mein traceback</td></tr>
<tr><td>200 par content galat</td><td>jawab ki shape ya state</td><td>poori body dekho</td></tr></table>

<h3>Shuruat: har FAIL padho</h3>
<p>Exports ke baad server start karo aur smoke test chalao:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
<span class="hl">FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username</span>
<span class="hl">FAIL POST description with a token        422 body.desc missing: Field required</span>
FAIL POST without a token is refused      422 body.desc missing: Field required
PASS unknown device is a 404              404
PASS device down is a 502                 502
<span class="hl">4 of 7 checks passed</span></pre>
<p>Teen rules fail hain. Unhe us order mein lo jis mein detail jaankari deta hai. Valid POST ko 422 milta hai jo kehta hai ki field <code>desc</code> missing hai. Caller <code>description</code> bhejta hai, jaisa ticket contract kehta hai, isliye model galat hai, caller nahi.</p>

<h3>Fault 1: field ka naam galat hai</h3>
<pre class="code"><span class="c"># models.py as handed over</span>
class DescriptionIn(BaseModel):
    interface: str = Field(pattern=r"^(GigabitEthernet|Loopback)\\d+(/\\d+)*$")
    desc: str = Field(min_length=3, max_length=15, pattern=r"^[A-Za-z0-9 ._:/-]+$")</pre>
<p>Model field ko <code>desc</code> kehta hai; <code>api.py</code> pehle se <code>change.description</code> use karta hai. <code>models.py</code> mein field ka naam badlo. Phir jaan-boojhkar classic galti karo, uska error seekhne ke liye: purana server chalte hue nayi copy start karo.</p>
<pre class="out">AUTO01$ uvicorn api:app --host 0.0.0.0 --port 8000
INFO:     Started server process [2308]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
<span class="hl">ERROR:    [Errno 98] error while attempting to bind on address ('0.0.0.0', 8000): address already in use</span>
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.</pre>
<p><code>[Errno 98] ... address already in use</code>: do servers ek port share nahi kar sakte. Purana process <code>pkill -f uvicorn</code> se roko, background mein dobara start karo aur test chalao:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username
<span class="hl">FAIL POST description with a token        422 body.description string_too_long: String should have at most 15 characters</span>
<span class="hl">FAIL POST without a token is refused      422 body.description string_too_long: String should have at most 15 characters</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
4 of 7 checks passed</pre>
<h3>Fault 2: limit bahut tight hai</h3>
<p>Detail ab rule quote karti hai: "at most 15 characters". Naming standard 40 allow karta hai, aur test description <code>UPLINK-TO-BLR-CORE-01</code> 21 characters ki hai. <code>max_length=15</code> ko <code>40</code> karo, restart karo, test karo:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
FAIL GET /devices shows no secrets        keys: device_type,host,name,password,role,secret,username
<span class="hl">PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01</span>
<span class="hl">FAIL POST without a token is refused      200</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
5 of 7 checks passed</pre>
<p>Valid POST ab pass hota hai aur R1 se description wapas padhta hai. Par <b>bina</b> token wala POST dekho: usne <code>200</code> diya. Ab tak wahi line 422 dikha rahi thi, jisne asli problem ko pehli problem ke peeche chhupa rakha tha. Dhyan mein rakho; pehle leak.</p>

<h3>Fault 3: jawab bahut dikhata hai</h3>
<p>Check ne sirf keys print kiye. Dekho caller ko sach mein kya milta hai:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices
<span class="hl">[{"name":"R1","role":"core","device_type":"cisco_ios","host":"10.99.0.1","username":"netops","password":"NK@2026","secret":"NK@2026"},{"name":"R2","role":"edge","device_type":"cisco_ios","host":"10.99.0.2","username":"netops","password":"NK@2026","secret":"NK@2026"},{"name":"R3","role":"spare","device_type":"cisco_ios","host":"10.99.0.3","username":"netops","password":"NK@2026","secret":"NK@2026"}]</span></pre>
<p>Har router ka login name, password aur enable secret, har us shakhs ko jiske paas token hai. Route apni rows connection parameters se banata hai. Narrow jawab declare karo aur use karo:</p>
<pre class="code"><span class="c"># models.py: the narrow answer</span>
class DeviceOut(BaseModel):
    name: str
    role: str
    host: str</pre>
<p>Model jodo, import karo, aur <code>/devices</code> route par <code>response_model=list[DeviceOut]</code> lagao. Restart karo aur test karo:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
<span class="hl">PASS GET /devices shows no secrets        keys: host,name,role</span>
PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01
<span class="hl">FAIL POST without a token is refused      200</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
6 of 7 checks passed</pre>
<h3>Fault 4: change route par gate nahi hai</h3>
<p>Ek line bachi hai, aur woh sabse khatarnak hai: network par koi bhi router ki description badal sakta hai. POST route ke decorator mein <code>dependencies=[Depends(need_token)]</code> nahi hai, jo GET routes mein hai. Jodo, restart karo, test karo, aur log mein confirm karo:</p>
<pre class="out">AUTO01$ python3 check.py
PASS GET /health                          200
PASS GET interfaces of R1                 200
PASS GET /devices shows no secrets        keys: host,name,role
PASS POST description with a token        200 UPLINK-TO-BLR-CORE-01
<span class="hl">PASS POST without a token is refused      403</span>
PASS unknown device is a 404              404
PASS device down is a 502                 502
<span class="hl">7 of 7 checks passed</span></pre><pre class="out">AUTO01$ grep 403 api.log
<span class="hl">INFO:     10.99.0.60:51557 - "POST /devices/R1/description HT&#84;P/1.1" 403 Forbidden</span></pre>
<p>Saat mein se saat, aur log refusal record karta hai. Lab mein poora kaam yahi hai; asli zindagi mein aap woh password bhi badalte jo expose hua, kyunki leak tab hua jab fault maujood tha.</p>

<div class="warn"><p><b>Common mistake.</b> Do tests ke beech kai cheezein badalna. Test jab aakhirkar badle to pata nahi chalta kaunsa edit se hua. Aur restart bhoolna: server purana code chalata hai, test phir bhi fail hota hai, aur aap us bug ko dhoondhne lagte ho jo aap theek kar chuke ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <i>Missing</i> field wala 422 ka matlab client galat ya model galat dono ho sakta hai. Kisi ko badalne se pehle contract (ticket ya documentation) dekho. Aur jo rule kisi aur wajah se 422 deta hai woh kabhi saabit nahi karta ki gate kaam karta hai; authentication ko valid body se test karo.</p></div>

<div class="scn"><h4>Fault ke peeche fault</h4><p>Ek engineer ne 422 theek kiya aur test ne bina token wale POST ko naye failure ki tarah report kiya. Usne maana ki uske fix ne gate tod diya. Asal mein gate kabhi tha hi nahi; pehla 422 use dhake hue tha, kyunki body ke validation errors handler se pehle hote hain aur gate na ho to koi aur call check nahi karta. Fix ke baad request poori guzar gayi.</p><p><b>Lesson:</b> ek fault theek karne se doosra saamne aa sakta hai. Poora test dobara chalao, sirf wahi line nahi jo theek ki.</p></div>

<div class="iv"><p class="q">"Virasat mein mila API valid requests reject karta hai aur zyada data lautata hai. Kahan se shuru karoge?"</p><p>Main smoke test chalata hoon jo har rule cover kare aur failing details padhta hoon: pehle status, phir 422 ke liye <code>loc</code>, <code>type</code> aur <code>msg</code>. Ek time par ek cheez badalta hoon, server restart karta hoon taaki naya code chale, aur sab dobara chalata hoon. Over-sharing ke liye sirf status nahi, raw body dekhta hoon aur narrow <code>response_model</code> se fix karta hoon. Aakhir mein check karta hoon ki har write route par wahi gate hai jo read routes par hai, aur jo secret expose hua use rotate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek symptom, ek layer, ek change, ek test; har change ke baad restart.</li>
<li>422 detail jagah (<code>loc</code>), rule (<code>type</code>) aur limit (<code>msg</code>) batati hai.</li>
<li><code>[Errno 98] address already in use</code> ka matlab purana server port pakde hai.</li>
<li>Narrow <code>response_model</code> leaks rokta hai; missing dependency route ko khula chhodti hai.</li>
<li>Ek fault theek karne se doosra dikh sakta hai; hamesha poora test dobara chalao.</li>
</ul></div>
`}};export{e as default};