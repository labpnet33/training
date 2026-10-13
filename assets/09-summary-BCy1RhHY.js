var e={id:`summary`,h:{en:`Summary: your REST cheat sheet`,hi:`Summary: aapki REST cheat sheet`},body:{en:`

<p>You now understand every part of an API call. Nothing here needs a programming language yet: you can do all of it with the lab's <code>rest</code> command, and the next module will do the same thing from Python.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Every API call is these five ideas."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="57" text-anchor="middle" class="svg-ink" font-size="14">URL</text><text x="70" y="75" text-anchor="middle" class="svg-muted" font-size="12">where</text><rect x="150" y="30" width="120" height="60" rx="10" fill="#fde68a"/><text x="210" y="57" text-anchor="middle" class="svg-ink" font-size="14">Method</text><text x="210" y="75" text-anchor="middle" class="svg-muted" font-size="12">what to do</text><rect x="290" y="30" width="120" height="60" rx="10" fill="#fed7aa"/><text x="350" y="57" text-anchor="middle" class="svg-ink" font-size="14">Headers</text><text x="350" y="75" text-anchor="middle" class="svg-muted" font-size="12">who, format</text><rect x="430" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="14">Body</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">JSON</text><rect x="545" y="30" width="85" height="60" rx="10" fill="#bbf7d0"/><text x="587.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">Status</text><text x="587.5" y="75" text-anchor="middle" class="svg-muted" font-size="12">2xx 4xx</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Request: URL + method + headers + body  -&gt;  Reply: status + headers + body</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Then verify on the device</text></svg><p class="cap">Every API call is these five ideas.</p></div>

<h3>One-page cheat sheet</h3>
<table class="cmp"><tr><th>Part</th><th>What to remember</th></tr>
<tr><td>URL</td><td>scheme + host + path; RESTCONF path is <code>/restconf/data/module:container/list=key</code>; escape a slash in a key as <code>%2F</code></td></tr>
<tr><td>Method</td><td>GET read, POST create, PUT replace, PATCH modify, DELETE remove</td></tr>
<tr><td>Safe / idempotent</td><td>GET is safe; GET, PUT, PATCH, DELETE are idempotent; POST is not</td></tr>
<tr><td>Status</td><td>2xx worked, 4xx your fault, 5xx server's fault; 401 login, 404 path, 405 verb, 400 body, 415 Content-Type, 409 clash</td></tr>
<tr><td>Headers</td><td>Authorization, Accept, Content-Type; Basic is base64, not encryption</td></tr>
<tr><td>Body</td><td>JSON: double quotes, lowercase true/false/null, no trailing comma, module-prefixed keys</td></tr></table>

<h3>The routine for any change</h3>
<ol>
<li>Read the current state with a GET.</li>
<li>Build the body, validate it with <code>json validate</code>.</li>
<li>Send the right verb and read the status.</li>
<li>Read the error-message if it is not 2xx; fix one thing; repeat.</li>
<li>GET again, and run a show command on the device to prove the change.</li>
</ol>

<h3>Check yourself</h3>
<p>Without looking back: what status do you expect from a PUT that creates an object? (201.) From a POST to a leaf? (405.) What does <code>Authorization: Basic ...</code> protect? (Nothing by itself; it must travel over HTTPS.) Which header tells the server the body is JSON? (Content-Type.) If any answer is unsure, return to that chapter.</p>

<div class="eg"><p><b>Worked example.</b> A change request: "Create Loopback60, address 192.0.2.60 and check it." You PUT a validated file to the interface address (201), PUT it again to see 204 (safe to repeat), GET it to read back, run <code>show ip interface brief</code> on the router, then DELETE the test loopback (204). Five calls, every status explained.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Guessing instead of reading the status. Using PUT where PATCH was meant. Forgetting that 2xx only means "accepted". Sharing logs with an Authorization header in them. Turning off certificate checks outside a lab.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expect scenario questions that give you a status code, a verb or a header and ask which concept it is. Also remember the difference between REST (the style) and RESTCONF (REST for YANG data on network devices, using the application/yang-data media types).</p></div>

<div class="scn"><h4>From CLI person to API person</h4><p>A team that only knew the CLI was asked to apply one description change on two hundred routers. Instead of two hundred logins, they proved the call on one router with the <code>rest</code> command, confirmed 204 and the show output, and then handed the exact same call to a script. The key was that every part of the call was understood first.</p><p><b>Lesson:</b> master one call by hand; scale it with code.</p></div>

<div class="iv"><p class="q">"Explain a REST API call to a non-programmer."</p><p>It is a short message to the device: an address (URL), an action (GET, POST, PUT, PATCH, DELETE), some labels (headers) and sometimes data (JSON). The device replies with a three-digit status and usually data. 2xx worked, 4xx means I made a mistake, 5xx means the device did. It is like show and configure commands, just structured so that programs can use it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An API call is URL + method + headers + body; a reply is status + headers + body.</li>
<li>Pick the verb by intent; know which are safe and idempotent.</li>
<li>Read the status family and the error-message before fixing anything.</li>
<li>Validate JSON, keep TLS verification on, never expose credentials.</li>
<li>Next: do the same calls from Python with the requests library.</li>
</ul></div>

`,hi:`

<p>Ab aap API call ka har hissa samajhte ho. Yahan abhi kisi programming language ki zaroorat nahi: yeh sab lab ke <code>rest</code> command se ho jaata hai, aur agla module wahi cheez Python se karega.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Har API call yahi paanch ideas hai."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="57" text-anchor="middle" class="svg-ink" font-size="14">URL</text><text x="70" y="75" text-anchor="middle" class="svg-muted" font-size="12">kahan</text><rect x="150" y="30" width="120" height="60" rx="10" fill="#fde68a"/><text x="210" y="57" text-anchor="middle" class="svg-ink" font-size="14">Method</text><text x="210" y="75" text-anchor="middle" class="svg-muted" font-size="12">kya karna</text><rect x="290" y="30" width="120" height="60" rx="10" fill="#fed7aa"/><text x="350" y="57" text-anchor="middle" class="svg-ink" font-size="14">Headers</text><text x="350" y="75" text-anchor="middle" class="svg-muted" font-size="12">kaun, format</text><rect x="430" y="30" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="480" y="57" text-anchor="middle" class="svg-ink" font-size="14">Body</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">JSON</text><rect x="545" y="30" width="85" height="60" rx="10" fill="#bbf7d0"/><text x="587.5" y="57" text-anchor="middle" class="svg-ink" font-size="14">Status</text><text x="587.5" y="75" text-anchor="middle" class="svg-muted" font-size="12">2xx 4xx</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Request: URL + method + headers + body  -&gt;  Reply: status + headers + body</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="13">Phir device par verify karo</text></svg><p class="cap">Har API call yahi paanch ideas hai.</p></div>

<h3>Ek page ki cheat sheet</h3>
<table class="cmp"><tr><th>Hissa</th><th>Kya yaad rakhna hai</th></tr>
<tr><td>URL</td><td>scheme + host + path; RESTCONF path <code>/restconf/data/module:container/list=key</code>; key mein slash ko <code>%2F</code> se escape karo</td></tr>
<tr><td>Method</td><td>GET padho, POST banao, PUT replace, PATCH badlo, DELETE hatao</td></tr>
<tr><td>Safe / idempotent</td><td>GET safe hai; GET, PUT, PATCH, DELETE idempotent; POST nahi</td></tr>
<tr><td>Status</td><td>2xx chala, 4xx aapki galti, 5xx server ki; 401 login, 404 path, 405 verb, 400 body, 415 Content-Type, 409 takraav</td></tr>
<tr><td>Headers</td><td>Authorization, Accept, Content-Type; Basic base64 hai, encryption nahi</td></tr>
<tr><td>Body</td><td>JSON: double quotes, lowercase true/false/null, trailing comma nahi, module-prefix wali keys</td></tr></table>

<h3>Har change ki routine</h3>
<ol>
<li>GET se maujooda state padho.</li>
<li>Body banao, <code>json validate</code> se check karo.</li>
<li>Sahi verb bhejo aur status padho.</li>
<li>2xx nahi to error-message padho; ek cheez fix karo; dohrao.</li>
<li>Dobara GET karo, aur device par show command chalakar change saabit karo.</li>
</ol>

<h3>Khud ko check karo</h3>
<p>Peeche dekhe bina: object banane wale PUT se kaunsa status milta hai? (201.) Leaf par POST se? (405.) <code>Authorization: Basic ...</code> akela kya bachata hai? (Kuch nahi; use HTTPS par hi jaana chahiye.) Kaunsa header server ko batata hai ki body JSON hai? (Content-Type.) Koi jawab pakka na ho to us chapter par wapas jao.</p>

<div class="eg"><p><b>Worked example.</b> Change request: "Loopback60 banao, address 192.0.2.60, aur check karo." Aap validated file ko interface address par PUT karte ho (201), dobara PUT karke 204 dekhte ho (dohrana safe), GET se padhte ho, router par <code>show ip interface brief</code> chalate ho, phir test loopback ko DELETE karte ho (204). Paanch calls, har status samjha hua.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Status padhne ki jagah andaaza lagana. PATCH ki jagah PUT use karna. Bhool jaana ki 2xx ka matlab sirf "accept hua". Authorization header wale logs share karna. Lab ke bahar certificate checks band karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Scenario questions mein status code, verb ya header diya hoga aur poochha jaayega ki kaunsa concept hai. Yeh bhi yaad rakho ki REST (style) aur RESTCONF (network devices par YANG data ke liye REST, application/yang-data media types ke saath) alag hain.</p></div>

<div class="scn"><h4>CLI wale se API wale tak</h4><p>Jo team sirf CLI jaanti thi use do sau routers par ek description change karna tha. Do sau logins ki jagah, unhone ek router par <code>rest</code> command se call saabit ki, 204 aur show output confirm kiya, aur phir wahi call script ko de di. Kunji yeh thi ki call ka har hissa pehle samjha gaya tha.</p><p><b>Lesson:</b> ek call haath se master karo; code se scale karo.</p></div>

<div class="iv"><p class="q">"Non-programmer ko REST API call samjhao."</p><p>Yeh device ko ek chhota message hai: ek address (URL), ek action (GET, POST, PUT, PATCH, DELETE), kuch labels (headers) aur kabhi data (JSON). Device teen digit ke status aur aksar data ke saath jawab deta hai. 2xx chala, 4xx matlab mujhse galti hui, 5xx matlab device se. Yeh show aur configure commands jaisa hi hai, bas structured taaki programs use kar sakein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>API call = URL + method + headers + body; reply = status + headers + body.</li>
<li>Intent se verb chuno; jaano kaunse safe aur idempotent hain.</li>
<li>Kuch fix karne se pehle status family aur error-message padho.</li>
<li>JSON validate karo, TLS verification on rakho, credentials expose mat karo.</li>
<li>Aage: wahi calls Python ki requests library se karo.</li>
</ul></div>

`}};export{e as default};