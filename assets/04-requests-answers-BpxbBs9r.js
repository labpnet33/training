var e={id:`requests-answers`,h:{en:`Requests in, answers out: parameters, 422 and response_model`,hi:`Requests andar, jawab bahar: parameters, 422 aur response_model`},body:{en:`
<p>FastAPI does most of its work <b>around</b> your function. Before the function runs, FastAPI reads the request and checks it; after it returns, FastAPI filters the result and builds the answer. If the check fails, your function never runs. This chapter shows where each value comes from and how to read the errors that come back. Lab 1 steps 3 and 5 use all of it.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="What FastAPI does around your function"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Request</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">path, query, body</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Validation</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">pydantic rules</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Your function</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">runs only if valid</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">response_model</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">filters the answer</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">Answer</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">status + JSON</text></svg></div>
<h3>Where does a value come from?</h3>
<p>You do not say it with a keyword; FastAPI reads the function signature. A name that appears in the path (<code>/vlans/{vlan_id}</code>) is a <b>path</b> parameter. A simple type (<code>int</code>, <code>str</code>, <code>bool</code>) that is not in the path is a <b>query</b> parameter (<code>?limit=50</code>). A pydantic model is the <b>JSON body</b>. <code>Path(...)</code> and <code>Query(...)</code> add the same limits you know from <code>Field</code>.</p>
<pre class="code">from typing import Optional

from fastapi import FastAPI, Path, Query
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/vlans/{vlan_id}")
def vlan(
    vlan_id: int = Path(ge=1, le=4094),
    verbose: bool = False,
    limit: int = Query(default=5, ge=1, le=100),
    name: Optional[str] = None,
):
    return {"vlan_id": vlan_id, "verbose": verbose, "limit": limit, "name": name}


@app.post("/vlans", status_code=201)
def create(body: dict):
    return {"got": body}


client = TestClient(app)
for url in ("/vlans/10", "/vlans/10?verbose=true&amp;limit=50&amp;name=USERS", "/vlans/abc", "/vlans/5000", "/vlans/10?limit=0", "/nothing"):
    r = client.get(url)
    print(url, r.status_code, r.json())
r = client.post("/vlans", json={"a": 1})
print("POST", r.status_code, r.json())
r = client.post("/vlans", content="{bad json")
print("POST bad json", r.status_code, r.json())
r = client.delete("/vlans/10")
print("DELETE", r.status_code, r.json(), r.headers.get("allow"))</pre><pre class="out">AUTO01$ python3 fa1.py
/vlans/10 200 {'vlan_id': 10, 'verbose': False, 'limit': 5, 'name': None}
/vlans/10?verbose=true&amp;limit=50&amp;name=USERS 200 {'vlan_id': 10, 'verbose': True, 'limit': 50, 'name': 'USERS'}
<span class="hl">/vlans/abc 422 {'detail': [{'type': 'int_parsing', 'loc': ['path', 'vlan_id'], 'msg': 'Input should be a valid integer, unable to parse string as an integer', 'input': 'abc'}]}</span>
/vlans/5000 422 {'detail': [{'type': 'less_than_equal', 'loc': ['path', 'vlan_id'], 'msg': 'Input should be less than or equal to 4094', 'input': '5000', 'ctx': {'le': 4094}}]}
<span class="hl">/vlans/10?limit=0 422 {'detail': [{'type': 'greater_than_equal', 'loc': ['query', 'limit'], 'msg': 'Input should be greater than or equal to 1', 'input': '0', 'ctx': {'ge': 1}}]}</span>
/nothing 404 {'detail': 'Not Found'}
POST 201 {'got': {'a': 1}}
<span class="hl">POST bad json 422 {'detail': [{'type': 'json_invalid', 'loc': ['body', 1], 'msg': 'JSON decode error', 'input': {}, 'ctx': {'error': 'Expecting property name enclosed in double quotes'}}]}</span>
<span class="hl">DELETE 405 {'detail': 'Method Not Allowed'} GET</span></pre>
<p>Read the results top to bottom. <code>"true"</code> in the query became the boolean <code>True</code>. A letter where a number is expected, a number out of range, and a broken JSON text are all <b>422</b> answers, and the first item of <code>loc</code> names the place: <code>path</code>, <code>query</code> or <code>body</code>. An unknown path is <code>404</code>, a wrong method is <code>405</code> and the <code>allow</code> header lists the methods that would work. <code>status_code=201</code> on the route changed the success code of the POST.</p>

<h3>Anatomy of a 422</h3>
<p>The body is always <code>{"detail": [ ... ]}</code>, one item per problem. Every item has <code>type</code> (the rule, the same names as in chapter 3), <code>loc</code> (a path to the bad value, such as <code>["body", "description"]</code>), <code>msg</code>, the offending <code>input</code> and sometimes <code>ctx</code> with the limits. Here is the real thing from the Lab 1 API:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"Fa0/1","description":"x"}' localhost:8000/devices/R1/description
<span class="hl">{"detail":[{"type":"string_pattern_mismatch","loc":["body","interface"],"msg":"String should match pattern '^(GigabitEthernet|Loopback)\\\\d+(/\\\\d+)*$'","input":"Fa0/1","ctx":{"pattern":"^(GigabitEthernet|Loopback)\\\\d+(/\\\\d+)*$"}},{"type":"string_too_short","loc":["body","description"],"msg":"String should have at least 3 characters","input":"x","ctx":{"min_length":3}}]}</span></pre>
<p>A client developer can fix this without reading your code: the field, the rule and the value are all there. Never swallow these details and answer a vague "bad request".</p>

<h3>Status codes you will use</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning here</th><th>Who must act</th></tr>
<tr><td>200 / 201</td><td>done / created</td><td>nobody</td></tr>
<tr><td>400</td><td>valid request, but the device refused it</td><td>caller changes the content</td></tr>
<tr><td>401 / 403</td><td>wrong token / no credentials at all</td><td>caller authenticates</td></tr>
<tr><td>404</td><td>unknown device or path</td><td>caller fixes the name</td></tr>
<tr><td>422</td><td>request does not fit the model</td><td>caller fixes the request</td></tr>
<tr><td>500</td><td>bug in your code</td><td>you</td></tr>
<tr><td>502</td><td>the router behind you failed</td><td>network team</td></tr></table>

<h3>response_model: the answer has a shape too</h3>
<p>The same idea works in the other direction. With <code>response_model=SomeModel</code> FastAPI validates what your function returns and <b>drops every field the model does not declare</b>:</p>
<pre class="code">from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel


class DeviceOut(BaseModel):
    name: str
    host: str


app = FastAPI()
ROW = {"name": "R1", "host": "10.99.0.1", "username": "netops", "password": "NK@2026"}


@app.get("/raw")
def raw():
    return ROW


@app.get("/safe", response_model=DeviceOut)
def safe():
    return ROW


client = TestClient(app)
print(client.get("/raw").json())
print(client.get("/safe").json())</pre><pre class="out">AUTO01$ python3 fa3.py
{'name': 'R1', 'host': '10.99.0.1', 'username': 'netops', 'password': 'NK@2026'}
<span class="hl">{'name': 'R1', 'host': '10.99.0.1'}</span></pre>
<p>The route <code>/raw</code> returns the row as it is, password included. The route <code>/safe</code> returns the same dictionary, but the answer contains only <code>name</code> and <code>host</code>. This is the single most useful leak-prevention tool in FastAPI, and it is the reason every route in Lab 1 has a <code>response_model</code>. The shape is also written into the OpenAPI document, so clients know what to expect.</p>
<div class="warn"><p><b>Common mistake.</b> Returning a device's connection parameters or a database row "because it is convenient". The first time a field is added to that row (a token, a community string), it leaks. Declare the answer with a model, always.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>422</code> is raised by FastAPI <b>before</b> your function runs; <code>HT&#84;PException</code> is raised <b>by your function</b> (404, 401, 400, 502). A model on the function argument validates the request; <code>response_model</code> on the decorator validates and filters the answer.</p></div>

<div class="scn"><h4>The field that nobody asked for</h4><p>A team's inventory API returned database rows directly. It worked for a year. Then someone added a column for the SNMP community and the next release returned it to every caller, including a dashboard on a shared screen. Nobody changed the route; the row simply grew. A <code>response_model</code> with the three fields the dashboard needed would have ignored the new column.</p><p><b>Lesson:</b> new fields must be opted in to the answer, not opted out.</p></div>

<div class="iv"><p class="q">"What is the difference between a 400 and a 422 in a FastAPI service?"</p><p>422 is FastAPI's own answer when the request does not fit the declared model or parameters: the function does not run and the body lists every problem with location and rule. 400 is something my code raises when the request was valid but could not be carried out, for example the router rejected the configuration. I keep them separate so the caller knows whether to fix the shape or the content.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FastAPI reads the signature: path names are path parameters, simple types are query parameters, models are the body.</li>
<li>A bad request gets a 422 with one item per problem: <code>type</code>, <code>loc</code>, <code>msg</code>, <code>input</code>.</li>
<li>404 unknown, 405 wrong method, 401/403 authentication, 400 content refused, 502 device failed, 500 your bug.</li>
<li><code>response_model</code> filters the answer and removes undeclared fields.</li>
<li>Always declare the answer shape; it documents the API and prevents leaks.</li>
</ul></div>
`,hi:`
<p>FastAPI ka zyadatar kaam aapke function ke <b>aaspaas</b> hota hai. Function chalne se pehle FastAPI request padhta aur check karta hai; function lautne ke baad FastAPI result filter karta hai aur jawab banata hai. Check fail ho to aapka function kabhi chalta hi nahi. Yeh chapter dikhata hai ki har value kahan se aati hai aur wapas aane wale errors kaise padhein. Lab 1 ke step 3 aur 5 sab iska use karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="FastAPI aapke function ke aaspaas kya karta hai"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Request</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">path, query, body</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Validation</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">pydantic rules</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Aapka function</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">valid ho tabhi chalta</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">response_model</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">jawab filter</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">Answer</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">status + JSON</text></svg></div>
<h3>Value kahan se aati hai?</h3>
<p>Aap keyword se nahi batate; FastAPI function ka signature padhta hai. Jo naam path mein hai (<code>/vlans/{vlan_id}</code>) woh <b>path</b> parameter hai. Jo simple type (<code>int</code>, <code>str</code>, <code>bool</code>) path mein nahi hai woh <b>query</b> parameter hai (<code>?limit=50</code>). Pydantic model <b>JSON body</b> hai. <code>Path(...)</code> aur <code>Query(...)</code> wahi limits jodte hain jo aap <code>Field</code> se jaante ho.</p>
<pre class="code">from typing import Optional

from fastapi import FastAPI, Path, Query
from fastapi.testclient import TestClient

app = FastAPI()


@app.get("/vlans/{vlan_id}")
def vlan(
    vlan_id: int = Path(ge=1, le=4094),
    verbose: bool = False,
    limit: int = Query(default=5, ge=1, le=100),
    name: Optional[str] = None,
):
    return {"vlan_id": vlan_id, "verbose": verbose, "limit": limit, "name": name}


@app.post("/vlans", status_code=201)
def create(body: dict):
    return {"got": body}


client = TestClient(app)
for url in ("/vlans/10", "/vlans/10?verbose=true&amp;limit=50&amp;name=USERS", "/vlans/abc", "/vlans/5000", "/vlans/10?limit=0", "/nothing"):
    r = client.get(url)
    print(url, r.status_code, r.json())
r = client.post("/vlans", json={"a": 1})
print("POST", r.status_code, r.json())
r = client.post("/vlans", content="{bad json")
print("POST bad json", r.status_code, r.json())
r = client.delete("/vlans/10")
print("DELETE", r.status_code, r.json(), r.headers.get("allow"))</pre><pre class="out">AUTO01$ python3 fa1.py
/vlans/10 200 {'vlan_id': 10, 'verbose': False, 'limit': 5, 'name': None}
/vlans/10?verbose=true&amp;limit=50&amp;name=USERS 200 {'vlan_id': 10, 'verbose': True, 'limit': 50, 'name': 'USERS'}
<span class="hl">/vlans/abc 422 {'detail': [{'type': 'int_parsing', 'loc': ['path', 'vlan_id'], 'msg': 'Input should be a valid integer, unable to parse string as an integer', 'input': 'abc'}]}</span>
/vlans/5000 422 {'detail': [{'type': 'less_than_equal', 'loc': ['path', 'vlan_id'], 'msg': 'Input should be less than or equal to 4094', 'input': '5000', 'ctx': {'le': 4094}}]}
<span class="hl">/vlans/10?limit=0 422 {'detail': [{'type': 'greater_than_equal', 'loc': ['query', 'limit'], 'msg': 'Input should be greater than or equal to 1', 'input': '0', 'ctx': {'ge': 1}}]}</span>
/nothing 404 {'detail': 'Not Found'}
POST 201 {'got': {'a': 1}}
<span class="hl">POST bad json 422 {'detail': [{'type': 'json_invalid', 'loc': ['body', 1], 'msg': 'JSON decode error', 'input': {}, 'ctx': {'error': 'Expecting property name enclosed in double quotes'}}]}</span>
<span class="hl">DELETE 405 {'detail': 'Method Not Allowed'} GET</span></pre>
<p>Results ko upar se neeche padho. Query mein <code>"true"</code> boolean <code>True</code> ban gaya. Number ki jagah letter, range se bahar number, aur toota hua JSON text, teeno <b>422</b> jawab hain, aur <code>loc</code> ka pehla item jagah batata hai: <code>path</code>, <code>query</code> ya <code>body</code>. Unknown path <code>404</code> hai, galat method <code>405</code> hai aur <code>allow</code> header woh methods list karta hai jo chalte. Route par <code>status_code=201</code> ne POST ka success code badal diya.</p>

<h3>422 ki anatomy</h3>
<p>Body hamesha <code>{"detail": [ ... ]}</code> hoti hai, har problem ka ek item. Har item mein <code>type</code> (rule, wahi naam jo chapter 3 mein hain), <code>loc</code> (bad value tak ka path, jaise <code>["body", "description"]</code>), <code>msg</code>, galat <code>input</code> aur kabhi kabhi limits ke saath <code>ctx</code> hota hai. Lab 1 ke API ka asli udaharan:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"Fa0/1","description":"x"}' localhost:8000/devices/R1/description
<span class="hl">{"detail":[{"type":"string_pattern_mismatch","loc":["body","interface"],"msg":"String should match pattern '^(GigabitEthernet|Loopback)\\\\d+(/\\\\d+)*$'","input":"Fa0/1","ctx":{"pattern":"^(GigabitEthernet|Loopback)\\\\d+(/\\\\d+)*$"}},{"type":"string_too_short","loc":["body","description"],"msg":"String should have at least 3 characters","input":"x","ctx":{"min_length":3}}]}</span></pre>
<p>Client developer aapka code padhe bina ise theek kar sakta hai: field, rule aur value sab maujood hain. In details ko kabhi mat nigalo aur vague "bad request" mat bolo.</p>

<h3>Status codes jo aap use karoge</h3>
<table class="cmp"><tr><th>Code</th><th>Yahan matlab</th><th>Kise kuch karna hai</th></tr>
<tr><td>200 / 201</td><td>ho gaya / ban gaya</td><td>kisi ko nahi</td></tr>
<tr><td>400</td><td>request valid, par device ne mana kiya</td><td>caller content badle</td></tr>
<tr><td>401 / 403</td><td>galat token / credentials hi nahi</td><td>caller authenticate kare</td></tr>
<tr><td>404</td><td>unknown device ya path</td><td>caller naam theek kare</td></tr>
<tr><td>422</td><td>request model se match nahi karti</td><td>caller request theek kare</td></tr>
<tr><td>500</td><td>aapke code ka bug</td><td>aap</td></tr>
<tr><td>502</td><td>aapke peeche ka router fail hua</td><td>network team</td></tr></table>

<h3>response_model: jawab ki bhi shape hoti hai</h3>
<p>Wahi idea doosri direction mein bhi chalta hai. <code>response_model=SomeModel</code> ke saath FastAPI aapke function ka lautaya hua validate karta hai aur <b>woh har field hata deta hai jo model declare nahi karta</b>:</p>
<pre class="code">from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel


class DeviceOut(BaseModel):
    name: str
    host: str


app = FastAPI()
ROW = {"name": "R1", "host": "10.99.0.1", "username": "netops", "password": "NK@2026"}


@app.get("/raw")
def raw():
    return ROW


@app.get("/safe", response_model=DeviceOut)
def safe():
    return ROW


client = TestClient(app)
print(client.get("/raw").json())
print(client.get("/safe").json())</pre><pre class="out">AUTO01$ python3 fa3.py
{'name': 'R1', 'host': '10.99.0.1', 'username': 'netops', 'password': 'NK@2026'}
<span class="hl">{'name': 'R1', 'host': '10.99.0.1'}</span></pre>
<p>Route <code>/raw</code> row ko jaisa hai waisa lautata hai, password samet. Route <code>/safe</code> wahi dictionary lautata hai, par jawab mein sirf <code>name</code> aur <code>host</code> hai. FastAPI mein leak rokne ka yeh sabse kaam ka tool hai, aur isi wajah se Lab 1 ke har route par <code>response_model</code> hai. Shape OpenAPI document mein bhi likhi jaati hai, isliye clients ko pata hota hai kya aayega.</p>
<div class="warn"><p><b>Common mistake.</b> Device ke connection parameters ya database row "suvidha ke liye" seedha lautana. Jis din us row mein koi field judegi (token, community string), woh leak hogi. Jawab ko hamesha model se declare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>422</code> FastAPI aapka function chalne se <b>pehle</b> raise karta hai; <code>HT&#84;PException</code> <b>aapka function</b> raise karta hai (404, 401, 400, 502). Function argument par model request validate karta hai; decorator par <code>response_model</code> jawab validate aur filter karta hai.</p></div>

<div class="scn"><h4>Woh field jo kisi ne maangi nahi thi</h4><p>Ek team ka inventory API database rows seedha lautata tha. Saal bhar chala. Phir kisi ne SNMP community ka column jodaa aur agli release ne use har caller ko de diya, ek shared screen par lagi dashboard samet. Route kisi ne nahi badla; row bas badh gayi. Teen fields wala <code>response_model</code>, jo dashboard ko chahiye the, naye column ko ignore kar deta.</p><p><b>Lesson:</b> nayi fields jawab mein opt-in hoon, opt-out nahi.</p></div>

<div class="iv"><p class="q">"FastAPI service mein 400 aur 422 mein kya farq hai?"</p><p>422 FastAPI ka apna jawab hai jab request declared model ya parameters se match nahi karti: function nahi chalta aur body har problem ko location aur rule ke saath list karti hai. 400 woh hai jo mera code raise karta hai jab request valid thi par poori nahi ho saki, jaise router ne configuration reject kar di. Main dono alag rakhta hoon taaki caller ko pata ho ki shape theek karni hai ya content.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FastAPI signature padhta hai: path ke naam path parameters, simple types query parameters, models body.</li>
<li>Galat request par 422 milta hai, har problem ka ek item: <code>type</code>, <code>loc</code>, <code>msg</code>, <code>input</code>.</li>
<li>404 unknown, 405 galat method, 401/403 authentication, 400 content refuse, 502 device fail, 500 aapka bug.</li>
<li><code>response_model</code> jawab filter karta hai aur undeclared fields hata deta hai.</li>
<li>Jawab ki shape hamesha declare karo; yeh API document karti hai aur leaks rokti hai.</li>
</ul></div>
`}};export{e as default};