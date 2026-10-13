var e={id:`big-picture`,h:{en:`Why your own API: the big picture`,hi:`Apna API kyon: big picture`},body:{en:`
<p><b>What you will learn.</b> Until now your automation was a script: you ran it, on your laptop, with your credentials. This module turns it into a <b>service</b> that other people and other programs can call. By the end you can describe what goes into your automation and what comes out with <code>pydantic</code> models, serve it with <code>FastAPI</code> and <code>uvicorn</code>, call real routers through <code>netmiko</code> from inside a request handler, put a bearer-token check in front of every route, answer with honest status codes (400, 401, 403, 404, 422, 502), test the service with <code>TestClient</code>, and find the leaks before somebody else does.</p>
<p><b>Prerequisites.</b> <code>adv-nkmiko</code> (<code>ConnectHandler</code>, <code>send_command</code>, <code>use_textfsm</code>, the netmiko exceptions), <code>auto-requests</code> (calling an API with <code>requests</code> and reading status codes), <code>py-secrets</code> (secrets from the environment, never from the code) and <code>py-pytest</code> (writing a plain test). You will use all four in this module, and the capstone <code>adv-capstone</code> can later hide its toolkit behind the API you build here.</p>

<h3>An analogy: the reception desk of a data centre</h3>
<p>Nobody walks into the machine room just because they need a number from a router. They go to the <b>reception desk</b>. They fill in a form (the form has boxes and rules: this is <code>pydantic</code>). They show a badge (this is the <b>token</b>). The receptionist checks the form, goes inside with the keys (this is <code>netmiko</code> and the device password, which only the receptionist holds) and comes back with a printed answer (JSON). If the form is wrong, the receptionist hands it back and points at the box that is wrong (this is the <code>422</code> answer). The menu board on the wall that lists every form is <code>/docs</code>, which FastAPI writes for you.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="From a client to the routers through your own API"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Clients</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">portal, script</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">web server</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, checks</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">netmiko</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">SSH sessions</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">R1, R2</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">IOS XE</text></svg></div>
<h3>From a script to a service</h3>
<table class="cmp"><tr><th>A script on your laptop</th><th>Your own API on AUTO01</th></tr>
<tr><td>Everybody who runs it needs the router password</td><td>Only the service holds it; callers hold a token</td></tr>
<tr><td>Bad input crashes it half way (or worse, half works)</td><td>Bad input is refused at the door with a precise 422</td></tr>
<tr><td>Output is text on a screen</td><td>Output is JSON that a portal, a ticket tool or another script reads</td></tr>
<tr><td>No record of who asked for what</td><td>One access log line per request, one place to add auditing</td></tr>
<tr><td>Python only</td><td>Any language that can send a web request</td></tr></table>

<h3>The four pieces</h3>
<dl class="terms">
<dt>FastAPI</dt><dd>The framework. You write ordinary Python functions and decorate them with <code>@app.get(...)</code>; FastAPI turns them into routes, reads the parameters, validates them and builds the documentation.</dd>
<dt>pydantic</dt><dd>The data layer. A class with typed fields describes one shape of data; building an object from a dictionary checks every field and raises a <code>ValidationError</code> that lists every problem at once.</dd>
<dt>uvicorn</dt><dd>The web server. It listens on a TCP port, parses the web requests and hands them to your app through the ASGI interface. FastAPI never opens a port itself.</dd>
<dt>OpenAPI</dt><dd>The machine-readable description of your API (every route, every field). FastAPI builds it from your code, and the <code>/docs</code> page is drawn from it.</dd></dl>

<div class="eg"><p><b>Worked example: the ticket.</b> The NOC wants two buttons in its portal: "show interface state of PUN-CORE-R1" and "set the description of an interface". Nobody in the NOC should hold a router password, nobody should be able to push a 300-character description, and every click must be traceable. That is exactly the shape of an API: two routes, two pydantic models, one token check, one access log.</p></div>

<h3>The lab and the road map</h3>
<p>AUTO01 (10.99.0.60) hosts the API on port 8000. R1 (PUN-CORE-R1, 10.99.0.1) and R2 (BLR-EDGE-R2, 10.99.0.2) answer over SSH with <code>netops / NK@2026</code>; R3 is in the inventory but not racked, so it will play the broken router. The chapters follow Lab 1 step by step:</p>
<ul>
<li>Chapters 2 and 3: the first app and the models (Lab 1 steps 1 and 2).</li>
<li>Chapters 4 and 5: requests, answers and the first router call (step 3).</li>
<li>Chapter 6: the token check (step 4). Chapter 7: changing a device and failing politely (steps 5 and 6).</li>
<li>Chapter 8: tests and operations (step 7). Chapter 9: Lab 2, "The API that leaked". Chapter 10: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Treating the API as "just another script". It is a <b>new door into your network</b>. A script can only hurt what its owner can reach; an API listening on <code>0.0.0.0</code> can be called by every host that can route to it. Everything in this module (validation, the token, narrow answers, tests, logs) exists to make that door safe.</p></div>
<div class="exam"><p><b>Exam trap.</b> Keep the roles apart: FastAPI routes and validates, pydantic checks the data, uvicorn serves the port. A <code>422</code> means "your request does not fit the model" (the client must change it); a <code>5xx</code> means "the server or a device behind it failed".</p></div>

<div class="scn"><h4>The portal that needed the password</h4><p>A team built a status portal that logged in to 30 routers itself, so the router password sat in the portal's configuration, in a shared wiki page and in three engineers' shell history. When a contractor left, the password had to be changed on 30 routers and in every copy. After the team moved the SSH work behind a small API, only that service held the password (in its environment). The portal held a token that could be revoked in one minute without touching a router.</p><p><b>Lesson:</b> put the secret in one place and give callers something revocable.</p></div>

<div class="iv"><p class="q">"Why would you wrap your network automation in an API instead of just sharing the script?"</p><p>One controlled entry point: callers need a token, not the device password; input is validated against a model before any device is touched; answers are structured JSON with honest status codes; and every request leaves a log line. The script still exists inside the service, but nobody has to run it by hand. I would also mention the cost: an API is a new attack surface, so it needs a token, narrow responses, tests and TLS in front of it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FastAPI turns Python functions into web routes, pydantic describes and checks the data, uvicorn serves the TCP port.</li>
<li>The service holds the device password; callers hold a revocable token.</li>
<li>A <code>422</code> is the client's problem, a <code>502</code> is a device's problem, a <code>500</code> is your bug.</li>
<li>An API is a new door into the network: validate, authenticate, answer narrowly, log.</li>
<li>Lab 1 builds the service in seven steps; Lab 2 fixes a service that leaks.</li>
</ul></div>
`,hi:`
<p><b>Aap kya seekhoge.</b> Ab tak aapki automation ek script thi: aap use apne laptop par, apne credentials ke saath chalate the. Yeh module use ek <b>service</b> mein badalta hai jise doosre log aur doosre programs bula sakte hain. Ant mein aap <code>pydantic</code> models se bata sakoge ki automation mein kya andar jaata hai aur kya bahar aata hai, use <code>FastAPI</code> aur <code>uvicorn</code> se serve kar sakoge, request handler ke andar se <code>netmiko</code> ke zariye asli routers ko bula sakoge, har route ke aage bearer-token check laga sakoge, sachche status codes (400, 401, 403, 404, 422, 502) se jawab de sakoge, service ko <code>TestClient</code> se test kar sakoge, aur leaks ko doosron se pehle pakad sakoge.</p>
<p><b>Prerequisites.</b> <code>adv-nkmiko</code> (<code>ConnectHandler</code>, <code>send_command</code>, <code>use_textfsm</code>, netmiko exceptions), <code>auto-requests</code> (<code>requests</code> se API bulana aur status codes padhna), <code>py-secrets</code> (secrets environment se, code se kabhi nahi) aur <code>py-pytest</code> (simple test likhna). Is module mein chaaron kaam aayenge, aur capstone <code>adv-capstone</code> baad mein apna toolkit isi API ke peeche chhupa sakta hai.</p>

<h3>Ek analogy: data centre ka reception desk</h3>
<p>Router se ek number chahiye to koi seedha machine room mein nahi ghusta. Sab <b>reception desk</b> par jaate hain. Ek form bharte hain (form mein boxes aur rules hote hain: yeh <code>pydantic</code> hai). Badge dikhate hain (yeh <b>token</b> hai). Receptionist form check karta hai, chaabiyan lekar andar jaata hai (yeh <code>netmiko</code> aur device password hai, jo sirf receptionist ke paas hai) aur ek printed jawab (JSON) lekar aata hai. Form galat ho to receptionist use wapas de deta hai aur ungli rakhkar batata hai ki kaunsa box galat hai (yeh <code>422</code> jawab hai). Deewar par lagi menu board jo har form ki list deti hai woh <code>/docs</code> hai, jo FastAPI aapke liye khud likhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Client se routers tak apne API ke zariye"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Clients</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">portal, script</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">web server</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, checks</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">netmiko</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">SSH sessions</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">R1, R2</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">IOS XE</text></svg></div>
<h3>Script se service tak</h3>
<table class="cmp"><tr><th>Laptop par script</th><th>AUTO01 par apna API</th></tr>
<tr><td>Jo bhi chalaye use router password chahiye</td><td>Password sirf service ke paas; callers ke paas token</td></tr>
<tr><td>Galat input script ko beech mein girata hai (ya aadha kaam karta hai)</td><td>Galat input darwaze par hi precise 422 ke saath wapas</td></tr>
<tr><td>Output screen par text</td><td>Output JSON jo portal, ticket tool ya doosri script padhti hai</td></tr>
<tr><td>Kisne kya maanga uska record nahi</td><td>Har request ki ek access log line, auditing jodne ki ek jagah</td></tr>
<tr><td>Sirf Python</td><td>Koi bhi language jo web request bhej sake</td></tr></table>

<h3>Chaar hisse</h3>
<dl class="terms">
<dt>FastAPI</dt><dd>Framework. Aap normal Python functions likhte ho aur unhe <code>@app.get(...)</code> se decorate karte ho; FastAPI unhe routes banata hai, parameters padhta hai, validate karta hai aur documentation banata hai.</dd>
<dt>pydantic</dt><dd>Data layer. Typed fields wali class data ki ek shape batati hai; dictionary se object banane par har field check hoti hai aur <code>ValidationError</code> saari problems ek saath list karta hai.</dd>
<dt>uvicorn</dt><dd>Web server. Woh TCP port par sunta hai, web requests parse karta hai aur ASGI interface se aapke app ko deta hai. FastAPI khud kabhi port nahi kholta.</dd>
<dt>OpenAPI</dt><dd>Aapke API ka machine-readable description (har route, har field). FastAPI use aapke code se banata hai, aur <code>/docs</code> page usi se bante hain.</dd></dl>

<div class="eg"><p><b>Worked example: ticket.</b> NOC ko portal mein do buttons chahiye: "PUN-CORE-R1 ka interface state dikhao" aur "interface ki description set karo". NOC mein kisi ke paas router password nahi hona chahiye, koi 300 characters ki description push na kar sake, aur har click traceable ho. Yahi API ki shape hai: do routes, do pydantic models, ek token check, ek access log.</p></div>

<h3>Lab aur road map</h3>
<p>AUTO01 (10.99.0.60) port 8000 par API host karta hai. R1 (PUN-CORE-R1, 10.99.0.1) aur R2 (BLR-EDGE-R2, 10.99.0.2) <code>netops / NK@2026</code> se SSH par jawab dete hain; R3 inventory mein hai par rack nahi hua, isliye woh kharab router ka role karega. Chapters Lab 1 ko step by step follow karte hain:</p>
<ul>
<li>Chapter 2 aur 3: pehla app aur models (Lab 1 step 1 aur 2).</li>
<li>Chapter 4 aur 5: requests, jawab aur pehli router call (step 3).</li>
<li>Chapter 6: token check (step 4). Chapter 7: device badalna aur tameez se fail hona (step 5 aur 6).</li>
<li>Chapter 8: tests aur operations (step 7). Chapter 9: Lab 2, "The API that leaked". Chapter 10: summary.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> API ko "bas ek aur script" samajhna. Yeh aapke network mein <b>ek naya darwaza</b> hai. Script sirf wahi bigaad sakti hai jahan uska owner pahunch sake; <code>0.0.0.0</code> par sunta API har us host se bulaya ja sakta hai jo uske tak route kar sake. Is module ka sab kuch (validation, token, chhote jawab, tests, logs) is darwaze ko safe banane ke liye hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Roles alag rakho: FastAPI route aur validate karta hai, pydantic data check karta hai, uvicorn port serve karta hai. <code>422</code> ka matlab "aapki request model se match nahi karti" (client ko badalna hai); <code>5xx</code> ka matlab "server ya uske peeche ka device fail hua".</p></div>

<div class="scn"><h4>Woh portal jise password chahiye tha</h4><p>Ek team ne status portal banaya jo 30 routers mein khud login karta tha, isliye router password portal ki configuration mein, ek shared wiki page par aur teen engineers ki shell history mein tha. Contractor gaya to password 30 routers aur har copy mein badalna pada. SSH ka kaam chhote API ke peeche le jaane ke baad sirf us service ke paas password tha (uske environment mein). Portal ke paas token tha jo ek minute mein router ko chhue bina revoke ho sakta tha.</p><p><b>Lesson:</b> secret ek jagah rakho aur callers ko revocable cheez do.</p></div>

<div class="iv"><p class="q">"Network automation ko sirf script share karne ki jagah API mein kyon lapetoge?"</p><p>Ek controlled entry point: callers ko device password nahi, token chahiye; kisi device ko chhoone se pehle input model se validate hota hai; jawab structured JSON mein sachche status codes ke saath aate hain; aur har request ek log line chhodti hai. Script service ke andar hi rehti hai, bas kisi ko haath se chalani nahi padti. Main cost bhi bataunga: API ek naya attack surface hai, isliye token, narrow responses, tests aur uske aage TLS chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FastAPI Python functions ko web routes banata hai, pydantic data describe aur check karta hai, uvicorn TCP port serve karta hai.</li>
<li>Device password service ke paas rehta hai; callers ke paas revocable token.</li>
<li><code>422</code> client ki problem hai, <code>502</code> device ki problem hai, <code>500</code> aapka bug hai.</li>
<li>API network ka naya darwaza hai: validate, authenticate, narrow jawab, log.</li>
<li>Lab 1 service ko saat steps mein banata hai; Lab 2 aisi service theek karta hai jo leak karti hai.</li>
</ul></div>
`}};export{e as default};