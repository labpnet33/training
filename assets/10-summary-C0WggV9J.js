var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now own the whole path from a web request to a router and back. This chapter is the checklist, the vocabulary and the cheat-sheet to take into an interview or into your next project.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="The five tools of the module"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">pydantic</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">models, rules</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, Depends</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">serves the port</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">netmiko</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">talks to devices</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">pytest</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">proves the rules</text></svg></div>
<h3>Can-do checklist</h3>
<ul>
<li>Describe the data of an API with pydantic models: types, <code>Field</code> limits, patterns, <code>field_validator</code>, <code>SecretStr</code>.</li>
<li>Write a FastAPI app, start it with uvicorn in the background, and prove it is up with <code>ss</code>, <code>ps</code>, the log and <code>curl</code>.</li>
<li>Explain where parameters come from (path, query, body) and read a 422 body: <code>type</code>, <code>loc</code>, <code>msg</code>, <code>input</code>.</li>
<li>Call a router from a plain <code>def</code> handler with <code>ConnectHandler</code>, parse with TextFSM and return a <code>response_model</code>.</li>
<li>Attach a bearer-token dependency, compare with <code>hmac.compare_digest</code>, and tell 401 from 403.</li>
<li>Write a change route that validates, pushes, scans the device output, reads the state back and answers 400, 404, 422 or 502 correctly.</li>
<li>Test the refusals with <code>TestClient</code> and read the access log.</li>
<li>Find and fix a validation fault, a leak and a missing gate, restarting after every change.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASGI</dt><dd>The interface between a Python web server (uvicorn) and an app (FastAPI).</dd>
<dt>Route</dt><dd>A path plus a method (<code>GET /health</code>) bound to one function.</dd>
<dt>Handler</dt><dd>The function that runs for a route.</dd>
<dt>Dependency</dt><dd>A function FastAPI runs before the handler; <code>Depends(fn)</code> attaches it.</dd>
<dt>Bearer token</dt><dd>A secret string sent as <code>Authorization: Bearer ...</code>.</dd>
<dt>response_model</dt><dd>The model that validates and filters the answer.</dd>
<dt>OpenAPI</dt><dd>The machine-readable description of the API at <code>/openapi.json</code>; <code>/docs</code> is drawn from it.</dd>
<dt>422</dt><dd>"Unprocessable": the request does not fit the declared model or parameters.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>FastAPI does not serve a port; uvicorn does. <code>uvicorn module:variable</code>.</li>
<li>pydantic v2 names: <code>model_dump</code>, <code>model_validate</code>, <code>field_validator</code>, <code>Field(pattern=)</code>.</li>
<li>422 comes before the handler; <code>HT&#84;PException</code> comes from the handler.</li>
<li>Plain <code>def</code> for blocking calls; <code>async def</code> only when everything slow inside is awaited.</li>
<li>401 = unknown, 403 = not allowed; a missing bearer header is 403 on FastAPI 0.115 and 401 on newer releases.</li>
<li>netmiko returns device errors as text; the API must look for them and read the state back.</li>
<li>The server keeps old code in memory: restart after every edit. <code>[Errno 98]</code> = port still in use.</li>
</ul>

<h3>Lab versus real</h3>
<table class="cmp"><tr><th>In the lab</th><th>On a real system</th></tr>
<tr><td>uvicorn runs as a background job, one request at a time, answers curl, requests and ht&#116;px</td><td>uvicorn runs as a service with many concurrent requests; browsers can open <code>/docs</code></td></tr>
<tr><td>Short tracebacks, virtual clock</td><td>Long tracebacks, real SSH delays</td></tr>
<tr><td>FastAPI 0.115, pydantic 2.7 (pure Python)</td><td>Whatever you install; check the 401/403 behaviour with a test</td></tr>
<tr><td>Plain web traffic, lab token</td><td>TLS at a reverse proxy, real secrets from a vault or the environment</td></tr></table>
<pre class="code"><span class="c"># cheat sheet</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;   # start in the background
pkill -f uvicorn                                              # stop (then start again after edits)
ss -tlnp | grep 8000                                          # is it listening?
cat api.log                                                   # access lines and errors
curl -s localhost:8000/health                                 # body only
curl -i localhost:8000/health                                 # status line and headers
curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R1/interfaces
curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet0/2","description":"TO-PUNE"}' localhost:8000/devices/R2/description
pytest -q test_api.py                                         # the door rules</pre><pre class="code"><span class="c"># the skeleton of every route in this module (not run in the lab as a file; every line appeared in Lab 1)</span>
import hmac
import os
from typing import Annotated

from fastapi import Depends, FastAPI, HT&#84;PException
from fastapi.security import HT&#84;PAuthorizationCredentials, HT&#84;PBearer
from pydantic import BaseModel, Field

API_TOKEN = os.environ.get("API_TOKEN", "")
bearer = HT&#84;PBearer()
app = FastAPI(title="My API", version="1.0")


class ItemIn(BaseModel):
    name: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9 ._:/-]+$")


class ItemOut(BaseModel):
    name: str


def need_token(cred: Annotated[HT&#84;PAuthorizationCredentials, Depends(bearer)]) -&gt; None:
    if not API_TOKEN or not hmac.compare_digest(cred.credentials, API_TOKEN):
        raise HT&#84;PException(status_code=401, detail="invalid token")


@app.post("/items", response_model=ItemOut, dependencies=[Depends(need_token)])
def create(item: ItemIn):
    return item</pre>
<div class="warn"><p><b>Common mistake.</b> Finishing when the happy path works. The API is done when the refusals work: no token, wrong token, bad body, unknown device, dead router, and an answer that contains nothing it should not.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which component validates the request body?" pydantic, through FastAPI. "Which one listens on the port?" uvicorn. "Which one holds the device password?" Your service, from the environment, never the caller.</p></div>

<div class="scn"><h4>From the laptop to the team</h4><p>An engineer's interface-report script was copied to eight laptops, each with a stored router password. After he turned it into this kind of service, the eight copies were deleted, the password lived in one environment, the NOC called two routes with revocable tokens, and the weekly audit of "who changed what" became a search in one log file.</p><p><b>Lesson:</b> the API is the same automation with a controlled front door.</p></div>

<div class="iv"><p class="q">"Walk me through the life of one request in your automation API."</p><p>uvicorn accepts the connection and passes the request to FastAPI. FastAPI finds the route, runs the dependencies (the token check), parses and validates parameters and body with pydantic, and answers 422 or 401 or 403 before my code runs if something is wrong. My handler looks the device up, opens a netmiko session, runs the command, checks the output, reads the state back and returns data. FastAPI filters it through the response model, writes the status and JSON, and uvicorn logs one line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pydantic describes, FastAPI routes, uvicorn serves, netmiko talks, pytest proves.</li>
<li>Validate on the way in, filter on the way out, gate every route, answer honestly.</li>
<li>Secrets live in the environment; callers hold revocable tokens.</li>
<li>Restart after every change and keep a smoke test that covers the refusals.</li>
<li>Next: the capstone can put its toolkit behind an API like this one.</li>
</ul></div>
`,hi:`
<p>Ab aap web request se router tak aur wapas, poore raste ke malik ho. Yeh chapter checklist, vocabulary aur cheat-sheet hai jo aap interview ya agle project mein le jaoge.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Module ke paanch tools"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">pydantic</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">models, rules</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">routes, Depends</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">port serve karta</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">netmiko</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">devices se baat</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">pytest</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">rules saabit</text></svg></div>
<h3>Can-do checklist</h3>
<ul>
<li>API ke data ko pydantic models se describe karo: types, <code>Field</code> limits, patterns, <code>field_validator</code>, <code>SecretStr</code>.</li>
<li>FastAPI app likho, uvicorn se background mein start karo, aur <code>ss</code>, <code>ps</code>, log aur <code>curl</code> se saabit karo ki upar hai.</li>
<li>Samjhao ki parameters kahan se aate hain (path, query, body) aur 422 body padho: <code>type</code>, <code>loc</code>, <code>msg</code>, <code>input</code>.</li>
<li>Plain <code>def</code> handler se <code>ConnectHandler</code> ke saath router bulao, TextFSM se parse karo aur <code>response_model</code> lautao.</li>
<li>Bearer-token dependency lagao, <code>hmac.compare_digest</code> se compare karo, aur 401 ko 403 se alag pehchano.</li>
<li>Aisa change route likho jo validate kare, push kare, device output scan kare, state wapas padhe aur 400, 404, 422 ya 502 sahi de.</li>
<li><code>TestClient</code> se refusals test karo aur access log padho.</li>
<li>Validation fault, leak aur missing gate dhoondho aur theek karo, har change ke baad restart karke.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ASGI</dt><dd>Python web server (uvicorn) aur app (FastAPI) ke beech ka interface.</dd>
<dt>Route</dt><dd>Path plus method (<code>GET /health</code>) jo ek function se bandha hai.</dd>
<dt>Handler</dt><dd>Woh function jo route ke liye chalta hai.</dd>
<dt>Dependency</dt><dd>Aisa function jise FastAPI handler se pehle chalata hai; <code>Depends(fn)</code> use jodta hai.</dd>
<dt>Bearer token</dt><dd>Secret string jo <code>Authorization: Bearer ...</code> ki tarah bheji jaati hai.</dd>
<dt>response_model</dt><dd>Woh model jo jawab validate aur filter karta hai.</dd>
<dt>OpenAPI</dt><dd>API ka machine-readable description <code>/openapi.json</code> par; <code>/docs</code> usi se bana hai.</dd>
<dt>422</dt><dd>"Unprocessable": request declared model ya parameters se match nahi karti.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>FastAPI port serve nahi karta; uvicorn karta hai. <code>uvicorn module:variable</code>.</li>
<li>pydantic v2 ke naam: <code>model_dump</code>, <code>model_validate</code>, <code>field_validator</code>, <code>Field(pattern=)</code>.</li>
<li>422 handler se pehle aata hai; <code>HT&#84;PException</code> handler se aati hai.</li>
<li>Blocking calls ke liye plain <code>def</code>; <code>async def</code> tabhi jab andar ki har dheemi cheez await ho.</li>
<li>401 = unknown, 403 = allowed nahi; bearer header missing FastAPI 0.115 par 403 aur naye releases par 401 hai.</li>
<li>netmiko device errors text mein lautata hai; API ko unhe dhoondhna aur state wapas padhna hai.</li>
<li>Server purana code memory mein rakhta hai: har edit ke baad restart. <code>[Errno 98]</code> = port abhi bhi use mein.</li>
</ul>

<h3>Lab versus real</h3>
<table class="cmp"><tr><th>Lab mein</th><th>Asli system par</th></tr>
<tr><td>uvicorn background job hai, ek time par ek request, curl, requests aur ht&#116;px ko jawab deta hai</td><td>uvicorn service ki tarah chalta hai, kai concurrent requests; browsers <code>/docs</code> khol sakte hain</td></tr>
<tr><td>Chhote tracebacks, virtual clock</td><td>Lambe tracebacks, asli SSH delays</td></tr>
<tr><td>FastAPI 0.115, pydantic 2.7 (pure Python)</td><td>Jo bhi install karo; 401/403 behaviour test se check karo</td></tr>
<tr><td>Plain web traffic, lab token</td><td>Reverse proxy par TLS, vault ya environment se asli secrets</td></tr></table>
<pre class="code"><span class="c"># cheat sheet</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;   # start in the background
pkill -f uvicorn                                              # stop (then start again after edits)
ss -tlnp | grep 8000                                          # is it listening?
cat api.log                                                   # access lines and errors
curl -s localhost:8000/health                                 # body only
curl -i localhost:8000/health                                 # status line and headers
curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R1/interfaces
curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet0/2","description":"TO-PUNE"}' localhost:8000/devices/R2/description
pytest -q test_api.py                                         # the door rules</pre><pre class="code"><span class="c"># the skeleton of every route in this module (not run in the lab as a file; every line appeared in Lab 1)</span>
import hmac
import os
from typing import Annotated

from fastapi import Depends, FastAPI, HT&#84;PException
from fastapi.security import HT&#84;PAuthorizationCredentials, HT&#84;PBearer
from pydantic import BaseModel, Field

API_TOKEN = os.environ.get("API_TOKEN", "")
bearer = HT&#84;PBearer()
app = FastAPI(title="My API", version="1.0")


class ItemIn(BaseModel):
    name: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9 ._:/-]+$")


class ItemOut(BaseModel):
    name: str


def need_token(cred: Annotated[HT&#84;PAuthorizationCredentials, Depends(bearer)]) -&gt; None:
    if not API_TOKEN or not hmac.compare_digest(cred.credentials, API_TOKEN):
        raise HT&#84;PException(status_code=401, detail="invalid token")


@app.post("/items", response_model=ItemOut, dependencies=[Depends(need_token)])
def create(item: ItemIn):
    return item</pre>
<div class="warn"><p><b>Common mistake.</b> Happy path chalte hi khatam maan lena. API tab poori hai jab refusals kaam karein: no token, wrong token, bad body, unknown device, mara hua router, aur aisa jawab jisme woh kuch nahi jo nahi hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Request body kaun validate karta hai?" pydantic, FastAPI ke zariye. "Port par kaun sunta hai?" uvicorn. "Device password kiske paas hai?" Aapki service ke paas, environment se, caller ke paas kabhi nahi.</p></div>

<div class="scn"><h4>Laptop se team tak</h4><p>Ek engineer ki interface-report script aath laptops par copy thi, har ek par stored router password. Use is tarah ki service banane ke baad aath copies delete hui, password ek environment mein raha, NOC ne do routes revocable tokens se bulaye, aur "kisne kya badla" ka weekly audit ek log file ki search ban gaya.</p><p><b>Lesson:</b> API wahi automation hai, bas controlled front door ke saath.</p></div>

<div class="iv"><p class="q">"Apne automation API mein ek request ki zindagi samjhao."</p><p>uvicorn connection leta hai aur request FastAPI ko deta hai. FastAPI route dhoondhta hai, dependencies (token check) chalata hai, pydantic se parameters aur body parse aur validate karta hai, aur kuch galat ho to mera code chalne se pehle 422 ya 401 ya 403 deta hai. Mera handler device dhoondhta hai, netmiko session kholta hai, command chalata hai, output check karta hai, state wapas padhta hai aur data lautata hai. FastAPI use response model se filter karta hai, status aur JSON likhta hai, aur uvicorn ek line log karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>pydantic describe karta hai, FastAPI route karta hai, uvicorn serve karta hai, netmiko baat karta hai, pytest saabit karta hai.</li>
<li>Andar aate waqt validate, bahar jaate waqt filter, har route par gate, sachche jawab.</li>
<li>Secrets environment mein rehte hain; callers ke paas revocable tokens.</li>
<li>Har change ke baad restart karo aur aisa smoke test rakho jo refusals cover kare.</li>
<li>Aage: capstone apna toolkit isi tarah ke API ke peeche rakh sakta hai.</li>
</ul></div>
`}};export{e as default};