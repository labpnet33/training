var e={id:`tokens`,h:{en:`Token checks: Depends, HTTPBearer and API keys`,hi:`Token checks: Depends, HTTPBearer aur API keys`},body:{en:`
<p>Right now anybody who can reach port 8000 can read your routers. In this chapter (step 4 of Lab 1) you put a <b>gate</b> in front of the route. FastAPI builds gates with <b>dependencies</b>: a dependency is a function that runs <i>before</i> the handler, receives what it asks for (a header, for example), and either returns a value or raises an exception that stops the request.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="A dependency as a gate in front of a route"><rect x="8" y="12" width="136" height="64" rx="10" fill="#bae6fd"/><text x="76" y="42" text-anchor="middle" class="svg-ink" font-size="13">Request</text><text x="76" y="59" text-anchor="middle" class="svg-muted" font-size="11">Authorization header</text><line x1="144" y1="44" x2="170" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="170,44 164,40 164,48" fill="#64748b"/><rect x="170" y="12" width="136" height="64" rx="10" fill="#ddd6fe"/><text x="239" y="42" text-anchor="middle" class="svg-ink" font-size="13">need_token()</text><text x="239" y="59" text-anchor="middle" class="svg-muted" font-size="11">a dependency</text><line x1="307" y1="44" x2="333" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="333,44 326,40 326,48" fill="#64748b"/><rect x="333" y="12" width="136" height="64" rx="10" fill="#fde68a"/><text x="401" y="42" text-anchor="middle" class="svg-ink" font-size="13">401 / 403</text><text x="401" y="59" text-anchor="middle" class="svg-muted" font-size="11">stop here</text><line x1="470" y1="44" x2="496" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="496,44 488,40 488,48" fill="#64748b"/><rect x="496" y="12" width="136" height="64" rx="10" fill="#bbf7d0"/><text x="564" y="42" text-anchor="middle" class="svg-ink" font-size="13">Handler</text><text x="564" y="59" text-anchor="middle" class="svg-muted" font-size="11">runs only if allowed</text></svg></div>
<h3>The code</h3>
<pre class="code">"""api.py - our own automation API"""
import hmac
import os
from typing import Annotated

from fastapi import Depends, FastAPI, HT&#84;PException
from fastapi.security import HT&#84;PAuthorizationCredentials, HT&#84;PBearer
from netmiko import ConnectHandler

from inventory import DEVICES, params
from models import InterfaceOut

API_TOKEN = os.environ.get("API_TOKEN", "")
bearer = HT&#84;PBearer()

app = FastAPI(title="NK Network API", version="1.0")


def need_token(cred: Annotated[HT&#84;PAuthorizationCredentials, Depends(bearer)]) -&gt; None:
    """Refuse the request unless the bearer token matches the one in the environment."""
    if not API_TOKEN or not hmac.compare_digest(cred.credentials, API_TOKEN):
        raise HT&#84;PException(status_code=401, detail="invalid token", headers={"WWW-Authenticate": "Bearer"})


def get_device(name: str) -&gt; dict:
    if name not in DEVICES:
        raise HT&#84;PException(status_code=404, detail="unknown device " + name)
    return params(name)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/devices/{name}/interfaces", response_model=list[InterfaceOut], dependencies=[Depends(need_token)])
def interfaces(name: str):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        return conn.send_command("show ip interface brief", use_textfsm=True)</pre>
<p>Three ideas make this work:</p>
<ul>
<li><code>HT&#84;PBearer()</code> reads the header <code>Authorization: Bearer &lt;token&gt;</code> and hands your function an <code>HT&#84;PAuthorizationCredentials</code> object. It also adds the lock icon and the "Authorize" button to the generated documentation.</li>
<li><code>need_token</code> compares the presented token with <code>API_TOKEN</code>, read once from the environment. A wrong or missing configuration (<code>not API_TOKEN</code>) refuses everybody; the safe default is "closed".</li>
<li><code>dependencies=[Depends(need_token)]</code> on the decorator attaches the gate to the route without adding a parameter to the handler. <code>/health</code> has no gate on purpose, so a load balancer can probe it.</li>
</ul>
<h3>Why compare_digest?</h3>
<p>A normal <code>==</code> on strings stops at the first different character. An attacker who can measure response times over many requests can learn the token one character at a time. <code>hmac.compare_digest</code> takes the same time wherever the strings differ. It costs nothing, so use it for every secret comparison.</p>

<h3>Try the three doors</h3>
<pre class="code">export API_TOKEN='nk-lab-token-2026'
pkill -f uvicorn
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre><pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]
path = "/devices/R1/interfaces"

for label, token in (("no token", None), ("wrong token", "guess-123"), ("right token", TOKEN)):
    r = call("GET", path, token=token)
    print("%-12s %s %s" % (label, r.status_code, r.text[:60]))</pre><pre class="out">AUTO01$ python3 auth_test.py
<span class="hl">no token     403 {"detail":"Not authenticated"}</span>
<span class="hl">wrong token  401 {"detail":"invalid token"}</span>
<span class="hl">right token  200 [{"interface":"GigabitEthernet0/0","ip_address":"10.99.0.1",</span></pre>
<p>Three different requests, three different answers. With no header at all, <code>HT&#84;PBearer</code> refuses before your function runs. With a wrong token your function raises <code>401</code> and adds a <code>WWW-Authenticate: Bearer</code> header. With the right token the route works. Look at the headers once with <code>curl -i</code>:</p>
<pre class="out">AUTO01$ curl -s -i -H "Authorization: Bearer wrong" localhost:8000/devices/R2/interfaces | head -4
<span class="hl">HT&#84;P/1.1 401 Unauthorized</span>
date: Tue, 29 Sep 2026 03:31:27 GMT
server: uvicorn
<span class="hl">www-authenticate: Bearer</span></pre><pre class="out">AUTO01$ curl -s -i localhost:8000/devices/R2/interfaces | head -4
<span class="hl">HT&#84;P/1.1 403 Forbidden</span>
date: Tue, 29 Sep 2026 03:31:39 GMT
server: uvicorn
content-length: 30</pre>
<div class="note"><p><b>In the lab vs on real systems.</b> The lab runs FastAPI 0.115, whose <code>HT&#84;PBearer</code> answers <b>403</b> "Not authenticated" when the header is missing. Newer FastAPI releases changed this to <b>401</b> with a <code>WWW-Authenticate</code> header, which is the more correct answer. Check your own version with a test (chapter 8) instead of trusting a table. The code is the same on both.</p></div>

<h3>An API key in a header, and roles</h3>
<p>Many tools prefer a plain header such as <code>X-API-Key</code>. <code>APIKeyHeader</code> does that, and dependencies can build on each other, which gives you roles for free: <code>admin_only</code> depends on <code>who</code>.</p>
<pre class="code">from fastapi import Depends, FastAPI, HT&#84;PException, Security
from fastapi.security import APIKeyHeader
from fastapi.testclient import TestClient

key_header = APIKeyHeader(name="X-API-Key")
KEYS = {"k-readonly": "read", "k-admin": "admin"}
app = FastAPI()


def who(key: str = Security(key_header)):
    role = KEYS.get(key)
    if role is None:
        raise HT&#84;PException(status_code=401, detail="unknown key")
    return role


def admin_only(role: str = Depends(who)):
    if role != "admin":
        raise HT&#84;PException(status_code=403, detail="admin role needed")
    return role


@app.get("/state")
def state(role: str = Depends(who)):
    return {"role": role}


@app.post("/change")
def change(role: str = Depends(admin_only)):
    return {"changed": True}


client = TestClient(app)
print(client.get("/state").status_code, client.get("/state").json())
print(client.get("/state", headers={"X-API-Key": "nope"}).json())
print(client.get("/state", headers={"X-API-Key": "k-readonly"}).json())
r = client.post("/change", headers={"X-API-Key": "k-readonly"})
print(r.status_code, r.json())
print(client.post("/change", headers={"X-API-Key": "k-admin"}).json())
print(app.openapi()["components"]["securitySchemes"])</pre><pre class="out">AUTO01$ python3 fa2.py
403 {'detail': 'Not authenticated'}
{'detail': 'unknown key'}
{'role': 'read'}
<span class="hl">403 {'detail': 'admin role needed'}</span>
<span class="hl">{'changed': True}</span>
{'APIKeyHeader': {'type': 'apiKey', 'in': 'header', 'name': 'X-API-Key'}}</pre>
<p>A missing key is refused, an unknown key gets 401, a read-only key can read but gets <b>403</b> on the change route, and the admin key passes. Here 401 means "I do not know you" and 403 means "I know you, and you may not". The last line shows that the OpenAPI document records the scheme, so generated clients know to send the header.</p>
<pre class="code"><span class="c"># how to make a real token (lab value above is only for the lab)</span>
python3 -c "import secrets; print(secrets.token_urlsafe(32))"</pre>
<div class="warn"><p><b>Common mistake.</b> Putting the token in the code, in a URL query string (it ends up in every access log), or in a log message. Read it from the environment, send it in the header, and never print the <code>Authorization</code> header. Also remember that a token sent over plain web traffic can be read by anybody on the path: in production put a reverse proxy with TLS in front of uvicorn and restrict who can reach the port.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication failed or missing (who are you?), 403 = authenticated but not allowed (you may not). Bearer tokens are sent in the <code>Authorization</code> header; API keys are usually in a custom header. FastAPI does not check anything unless you attach a dependency.</p></div>

<div class="scn"><h4>The reporting key that could write</h4><p>A team gave the same token to the reporting dashboard and to the automation pipeline. A tester pasted the dashboard's token into a script "just to try" and changed an interface description in production. After the split (a read-only key for dashboards, an admin key for the pipeline, each revocable) the same mistake returned a clean 403 and a log line.</p><p><b>Lesson:</b> one key per caller, with the least power that works.</p></div>

<div class="iv"><p class="q">"How would you secure a small automation API?"</p><p>A dependency on every route except the health check; per-caller tokens read from the environment or a secrets store; constant-time comparison; 401 for unknown credentials and 403 for missing rights; TLS at a reverse proxy; narrow responses; no secrets in logs; and tests that prove each route refuses a call without a token.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A dependency runs before the handler and can stop the request with an exception.</li>
<li><code>HT&#84;PBearer</code> reads the bearer token; <code>APIKeyHeader</code> reads a custom header.</li>
<li>Compare secrets with <code>hmac.compare_digest</code>; refuse everyone when the token is not configured.</li>
<li>401 = unknown, 403 = known but not allowed; the missing-header code depends on the FastAPI version.</li>
<li>Tokens belong in the environment and the header, never in code, URLs or logs.</li>
</ul></div>
`,hi:`
<p>Abhi port 8000 tak pahunchne wala koi bhi aapke routers padh sakta hai. Is chapter mein (Lab 1 ka step 4) aap route ke aage ek <b>gate</b> lagate ho. FastAPI gates <b>dependencies</b> se banata hai: dependency ek function hai jo handler se <i>pehle</i> chalta hai, jo maanga (jaise ek header) woh paata hai, aur ya to value lautata hai ya exception raise karke request rok deta hai.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Route ke aage gate jaisi dependency"><rect x="8" y="12" width="136" height="64" rx="10" fill="#bae6fd"/><text x="76" y="42" text-anchor="middle" class="svg-ink" font-size="13">Request</text><text x="76" y="59" text-anchor="middle" class="svg-muted" font-size="11">Authorization header</text><line x1="144" y1="44" x2="170" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="170,44 164,40 164,48" fill="#64748b"/><rect x="170" y="12" width="136" height="64" rx="10" fill="#ddd6fe"/><text x="239" y="42" text-anchor="middle" class="svg-ink" font-size="13">need_token()</text><text x="239" y="59" text-anchor="middle" class="svg-muted" font-size="11">ek dependency</text><line x1="307" y1="44" x2="333" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="333,44 326,40 326,48" fill="#64748b"/><rect x="333" y="12" width="136" height="64" rx="10" fill="#fde68a"/><text x="401" y="42" text-anchor="middle" class="svg-ink" font-size="13">401 / 403</text><text x="401" y="59" text-anchor="middle" class="svg-muted" font-size="11">yahin ruk jao</text><line x1="470" y1="44" x2="496" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="496,44 488,40 488,48" fill="#64748b"/><rect x="496" y="12" width="136" height="64" rx="10" fill="#bbf7d0"/><text x="564" y="42" text-anchor="middle" class="svg-ink" font-size="13">Handler</text><text x="564" y="59" text-anchor="middle" class="svg-muted" font-size="11">allowed ho tabhi chalta</text></svg></div>
<h3>Code</h3>
<pre class="code">"""api.py - our own automation API"""
import hmac
import os
from typing import Annotated

from fastapi import Depends, FastAPI, HT&#84;PException
from fastapi.security import HT&#84;PAuthorizationCredentials, HT&#84;PBearer
from netmiko import ConnectHandler

from inventory import DEVICES, params
from models import InterfaceOut

API_TOKEN = os.environ.get("API_TOKEN", "")
bearer = HT&#84;PBearer()

app = FastAPI(title="NK Network API", version="1.0")


def need_token(cred: Annotated[HT&#84;PAuthorizationCredentials, Depends(bearer)]) -&gt; None:
    """Refuse the request unless the bearer token matches the one in the environment."""
    if not API_TOKEN or not hmac.compare_digest(cred.credentials, API_TOKEN):
        raise HT&#84;PException(status_code=401, detail="invalid token", headers={"WWW-Authenticate": "Bearer"})


def get_device(name: str) -&gt; dict:
    if name not in DEVICES:
        raise HT&#84;PException(status_code=404, detail="unknown device " + name)
    return params(name)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/devices/{name}/interfaces", response_model=list[InterfaceOut], dependencies=[Depends(need_token)])
def interfaces(name: str):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        return conn.send_command("show ip interface brief", use_textfsm=True)</pre>
<p>Teen ideas yeh kaam karwate hain:</p>
<ul>
<li><code>HT&#84;PBearer()</code> header <code>Authorization: Bearer &lt;token&gt;</code> padhta hai aur aapke function ko <code>HT&#84;PAuthorizationCredentials</code> object deta hai. Woh generated documentation mein lock icon aur "Authorize" button bhi jodta hai.</li>
<li><code>need_token</code> pesh kiye gaye token ko <code>API_TOKEN</code> se compare karta hai, jo environment se ek baar padha gaya. Galat ya missing configuration (<code>not API_TOKEN</code>) sabko refuse karti hai; safe default "band" hai.</li>
<li>Decorator par <code>dependencies=[Depends(need_token)]</code> gate ko route se jodta hai bina handler mein parameter jode. <code>/health</code> par jaan-boojhkar gate nahi hai, taaki load balancer use probe kar sake.</li>
</ul>
<h3>compare_digest kyon?</h3>
<p>Strings par normal <code>==</code> pehle alag character par ruk jaata hai. Jo attacker bahut requests ke response times naap sakta hai woh token ek ek character karke seekh sakta hai. <code>hmac.compare_digest</code> utna hi time leta hai chahe strings kahin bhi alag hon. Isme kuch kharch nahi, isliye har secret comparison ke liye use karo.</p>

<h3>Teen darwaze try karo</h3>
<pre class="code">export API_TOKEN='nk-lab-token-2026'
pkill -f uvicorn
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre><pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]
path = "/devices/R1/interfaces"

for label, token in (("no token", None), ("wrong token", "guess-123"), ("right token", TOKEN)):
    r = call("GET", path, token=token)
    print("%-12s %s %s" % (label, r.status_code, r.text[:60]))</pre><pre class="out">AUTO01$ python3 auth_test.py
<span class="hl">no token     403 {"detail":"Not authenticated"}</span>
<span class="hl">wrong token  401 {"detail":"invalid token"}</span>
<span class="hl">right token  200 [{"interface":"GigabitEthernet0/0","ip_address":"10.99.0.1",</span></pre>
<p>Teen alag requests, teen alag jawab. Header bilkul na ho to <code>HT&#84;PBearer</code> aapka function chalne se pehle refuse karta hai. Galat token par aapka function <code>401</code> raise karta hai aur <code>WWW-Authenticate: Bearer</code> header jodta hai. Sahi token par route chalta hai. Headers ek baar <code>curl -i</code> se dekho:</p>
<pre class="out">AUTO01$ curl -s -i -H "Authorization: Bearer wrong" localhost:8000/devices/R2/interfaces | head -4
<span class="hl">HT&#84;P/1.1 401 Unauthorized</span>
date: Tue, 29 Sep 2026 03:31:27 GMT
server: uvicorn
<span class="hl">www-authenticate: Bearer</span></pre><pre class="out">AUTO01$ curl -s -i localhost:8000/devices/R2/interfaces | head -4
<span class="hl">HT&#84;P/1.1 403 Forbidden</span>
date: Tue, 29 Sep 2026 03:31:39 GMT
server: uvicorn
content-length: 30</pre>
<div class="note"><p><b>In the lab vs on real systems.</b> Lab FastAPI 0.115 chalata hai, jiska <code>HT&#84;PBearer</code> header missing hone par <b>403</b> "Not authenticated" deta hai. Naye FastAPI releases ne ise <b>401</b> (<code>WWW-Authenticate</code> header ke saath) kar diya, jo zyada sahi jawab hai. Apna version table par bharosa karne ki jagah test (chapter 8) se check karo. Code dono par wahi hai.</p></div>

<h3>Header mein API key, aur roles</h3>
<p>Kai tools simple header jaise <code>X-API-Key</code> pasand karte hain. <code>APIKeyHeader</code> yahi karta hai, aur dependencies ek doosre par bani ho sakti hain, jisse roles muft mil jaate hain: <code>admin_only</code> <code>who</code> par depend karta hai.</p>
<pre class="code">from fastapi import Depends, FastAPI, HT&#84;PException, Security
from fastapi.security import APIKeyHeader
from fastapi.testclient import TestClient

key_header = APIKeyHeader(name="X-API-Key")
KEYS = {"k-readonly": "read", "k-admin": "admin"}
app = FastAPI()


def who(key: str = Security(key_header)):
    role = KEYS.get(key)
    if role is None:
        raise HT&#84;PException(status_code=401, detail="unknown key")
    return role


def admin_only(role: str = Depends(who)):
    if role != "admin":
        raise HT&#84;PException(status_code=403, detail="admin role needed")
    return role


@app.get("/state")
def state(role: str = Depends(who)):
    return {"role": role}


@app.post("/change")
def change(role: str = Depends(admin_only)):
    return {"changed": True}


client = TestClient(app)
print(client.get("/state").status_code, client.get("/state").json())
print(client.get("/state", headers={"X-API-Key": "nope"}).json())
print(client.get("/state", headers={"X-API-Key": "k-readonly"}).json())
r = client.post("/change", headers={"X-API-Key": "k-readonly"})
print(r.status_code, r.json())
print(client.post("/change", headers={"X-API-Key": "k-admin"}).json())
print(app.openapi()["components"]["securitySchemes"])</pre><pre class="out">AUTO01$ python3 fa2.py
403 {'detail': 'Not authenticated'}
{'detail': 'unknown key'}
{'role': 'read'}
<span class="hl">403 {'detail': 'admin role needed'}</span>
<span class="hl">{'changed': True}</span>
{'APIKeyHeader': {'type': 'apiKey', 'in': 'header', 'name': 'X-API-Key'}}</pre>
<p>Missing key refuse hoti hai, unknown key par 401, read-only key padh sakti hai par change route par <b>403</b> milta hai, aur admin key pass hoti hai. Yahan 401 ka matlab "main aapko nahi jaanta" aur 403 ka matlab "main jaanta hoon, aur aapko ijazat nahi". Aakhri line dikhati hai ki OpenAPI document scheme record karta hai, isliye generated clients ko pata hota hai header bhejna hai.</p>
<pre class="code"><span class="c"># how to make a real token (lab value above is only for the lab)</span>
python3 -c "import secrets; print(secrets.token_urlsafe(32))"</pre>
<div class="warn"><p><b>Common mistake.</b> Token ko code mein, URL query string mein (woh har access log mein chala jaata hai) ya log message mein rakhna. Environment se padho, header mein bhejo, aur <code>Authorization</code> header kabhi print mat karo. Yaad rakho ki plain web traffic par bheja token raste mein koi bhi padh sakta hai: production mein uvicorn ke aage TLS wala reverse proxy lagao aur port tak kaun pahunch sakta hai woh restrict karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> 401 = authentication fail ya missing (aap kaun?), 403 = authenticated par allowed nahi (aapko ijazat nahi). Bearer tokens <code>Authorization</code> header mein jaate hain; API keys aam taur par custom header mein. FastAPI tab tak kuch check nahi karta jab tak aap dependency na jodo.</p></div>

<div class="scn"><h4>Reporting key jo likh bhi sakti thi</h4><p>Ek team ne reporting dashboard aur automation pipeline ko ek hi token diya. Ek tester ne dashboard ka token "bas try karne" ke liye script mein paste kiya aur production mein interface description badal di. Split ke baad (dashboards ke liye read-only key, pipeline ke liye admin key, dono revocable) wahi galti saaf 403 aur ek log line lautati.</p><p><b>Lesson:</b> har caller ki alag key, jitni kam power se kaam chale.</p></div>

<div class="iv"><p class="q">"Chhote automation API ko secure kaise karoge?"</p><p>Health check ke alawa har route par dependency; per-caller tokens jo environment ya secrets store se aayein; constant-time comparison; unknown credentials par 401 aur rights na hone par 403; reverse proxy par TLS; narrow responses; logs mein secrets nahi; aur aise tests jo saabit karein ki har route bina token ke call refuse karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dependency handler se pehle chalti hai aur exception se request rok sakti hai.</li>
<li><code>HT&#84;PBearer</code> bearer token padhta hai; <code>APIKeyHeader</code> custom header padhta hai.</li>
<li>Secrets <code>hmac.compare_digest</code> se compare karo; token configured na ho to sabko refuse karo.</li>
<li>401 = unknown, 403 = known par allowed nahi; header missing ka code FastAPI version par depend karta hai.</li>
<li>Tokens environment aur header mein rehte hain, code, URLs ya logs mein kabhi nahi.</li>
</ul></div>
`}};export{e as default};