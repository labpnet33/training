var e={id:`change-and-errors`,h:{en:`Changing a device through the API, and failing politely`,hi:`API se device badalna, aur tameez se fail hona`},body:{en:`
<p>Reading is easy to get right: nothing changes, so a mistake costs little. A route that <b>changes</b> a router needs more care: the input must be safe, the result must be proved, and every way it can fail must produce an honest answer. This chapter covers steps 5 and 6 of Lab 1.</p>

<h3>A route that changes something</h3>
<pre class="code"><span class="c"># models.py: one more model</span>
class ChangeResult(BaseModel):
    device: str
    interface: str
    description: str</pre><pre class="code"><span class="c"># api.py: the route that changes something</span>
@app.post("/devices/{name}/description", response_model=ChangeResult, dependencies=[Depends(need_token)])
def set_description(name: str, change: DescriptionIn):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        out = conn.send_config_set(["interface " + change.interface, "description " + change.description])
        if "% Invalid" in out:
            raise HT&#84;PException(status_code=400, detail="the device rejected " + change.interface)
        shown = conn.send_command("show running-config interface " + change.interface)
    found = re.search(r"^ description (.*)$", shown, re.M)
    return {"device": name, "interface": change.interface, "description": found.group(1) if found else ""}</pre>
<p>Walk through it. FastAPI has already validated <code>change</code> against <code>DescriptionIn</code> before the function starts, so by now the interface name matches its pattern and the description is 3 to 40 safe characters. The function pushes two configuration lines with <code>send_config_set</code>. <b>netmiko does not raise an exception when a router prints an error</b>; the error text is simply returned. So the code looks for <code>% Invalid</code> and answers <code>400</code>. Then it <b>reads the description back</b> from the running configuration and returns what the router really holds, not what the caller asked for.</p>
<pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]

good = {"interface": "GigabitEthernet0/1", "description": "TO-HYD-CORE"}
r = call("POST", "/devices/R1/description", token=TOKEN, json=good)
print("good body ", r.status_code, r.json())

bad = {"interface": "Fa0/1", "description": "x" * 60}
r = call("POST", "/devices/R1/description", token=TOKEN, json=bad)
print("bad body  ", r.status_code)
for err in r.json()["detail"]:
    print("   ", err["loc"], err["type"], "|", err["msg"])

missing = {"interface": "Loopback0"}
r = call("POST", "/devices/R1/description", token=TOKEN, json=missing)
print("missing   ", r.status_code, [e["loc"][-1] + ":" + e["type"] for e in r.json()["detail"]])</pre><pre class="out">AUTO01$ python3 change.py
<span class="hl">good body  200 {'device': 'R1', 'interface': 'GigabitEthernet0/1', 'description': 'TO-HYD-CORE'}</span>
bad body   422
    ['body', 'interface'] string_pattern_mismatch | String should match pattern '^(GigabitEthernet|Loopback)\\d+(/\\d+)*$'
<span class="hl">    ['body', 'description'] string_too_long | String should have at most 40 characters</span>
<span class="hl">missing    422 ['description:missing']</span></pre>
<p>One good call and two bad ones, all through the API. The bad bodies never reached a router: pydantic stopped them. Look at what the router refuses instead:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet9/9","description":"TO-PUNE"}' localhost:8000/devices/R2/description
<span class="hl">{"detail":"the device rejected GigabitEthernet9/9"}</span></pre>
<p>The body was valid, but this interface does not exist on the router, so the device said no and the API turned that into a <code>400</code> with a clear message.</p>

<h3>Validation is also protection</h3>
<p>The pattern you gave <code>description</code> in chapter 3 matters here. <code>send_config_set</code> sends every string as a separate line, so a description that contains a line break could carry a second command. Try it:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet0/2","description":"TO-PUNE\\nshutdown"}' localhost:8000/devices/R2/description
<span class="hl">{"detail":[{"type":"string_pattern_mismatch","loc":["body","description"],"msg":"String should match pattern '^[A-Za-z0-9 ._:/-]+$'","input":"TO-PUNE\\nshutdown","ctx":{"pattern":"^[A-Za-z0-9 ._:/-]+$"}}]}</span></pre>
<p>Refused with <code>string_pattern_mismatch</code>, before any SSH session. Whitelist what is allowed instead of trying to list what is dangerous.</p>

<h3>When the router is the problem</h3>
<p>R3 is not racked. What does the caller see if the API simply lets netmiko's exception escape?</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R3/interfaces
<span class="hl">Internal Server Error</span></pre><pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2318]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "api.py", line 40, in interfaces
    with ConnectHandler(**dev) as conn:
<span class="hl">netmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: cisco_ios 10.99.0.3:22
(connection timed out)
<span class="hl">INFO:     127.0.0.1:52840 - "GET /devices/R3/interfaces HT&#84;P/1.1" 500 Internal Server Error</span></pre>
<p>A bare <code>500</code> with no explanation, and a traceback in the log. The caller cannot tell a bug from a dead router. An <b>exception handler</b> converts a known exception class into a proper answer for the whole API in one place:</p>
<pre class="code"><span class="c"># api.py: map device failures to 502</span>
@app.exception_handler(NetmikoTimeoutException)
async def device_unreachable(request: Request, exc: NetmikoTimeoutException):
    return JSONResponse(status_code=502, content={"detail": "device unreachable"})


@app.exception_handler(NetmikoAuthenticationException)
async def device_login_failed(request: Request, exc: NetmikoAuthenticationException):
    return JSONResponse(status_code=502, content={"detail": "device login failed"})</pre><div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Five honest answers"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">404</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">unknown name</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">422</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">bad request shape</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">400</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">device said no</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">502</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">device unreachable</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">500</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">bug in the API</text></svg></div><pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R3/interfaces
<span class="hl">{"detail":"device unreachable"}</span></pre><pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]

cases = (
    ("unknown device", "R9"),
    ("device down", "R3"),
    ("device up", "R2"),
)
for label, name in cases:
    r = call("GET", "/devices/%s/interfaces" % name, token=TOKEN)
    print("%-15s %-3s %s %s" % (label, name, r.status_code, r.text[:70]))
r = call("GET", "/health")
print("server still up", r.status_code, r.json())</pre><pre class="out">AUTO01$ python3 errors.py
<span class="hl">unknown device  R9  404 {"detail":"unknown device R9"}</span>
<span class="hl">device down     R3  502 {"detail":"device unreachable"}</span>
device up       R2  200 [{"interface":"GigabitEthernet0/0","ip_address":"10.99.0.2","status":"
<span class="hl">server still up 200 {'status': 'ok'}</span></pre>
<p>Unknown device 404, dead router 502, healthy router 200, and the server is still serving. The caller now knows whose problem it is: 404 is theirs, 502 belongs to the network team, 500 would belong to you.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Real uvicorn prints a much longer traceback than the lab (it includes the Starlette frames), and a real unreachable router costs the SSH connect timeout (set <code>conn_timeout</code> low). The status codes and the handler code are the same.</p></div>

<div class="warn"><p><b>Common mistake.</b> Trusting the return value of <code>send_config_set</code> as proof of success. It returns text whatever happened. Check the text for the vendor's error marker, and always read the state back before you say "done".</p></div>
<div class="exam"><p><b>Exam trap.</b> Exception handlers are registered with <code>@app.exception_handler(ExceptionClass)</code> and receive <code>(request, exc)</code>. An <code>HT&#84;PException</code> raised inside a handler is already turned into a JSON answer by FastAPI; for exceptions from other libraries you must register a handler yourself.</p></div>

<div class="scn"><h4>"Done" that was not done</h4><p>A change API answered 200 after every push. Weeks later an audit found 14 interfaces with the old description: the routers had printed an invalid-input marker and the API never looked. The fix was twelve lines: scan the output, read the description back, return what the device holds, and answer 400 when it differs.</p><p><b>Lesson:</b> the answer must report the state of the device, not the success of the send.</p></div>

<div class="iv"><p class="q">"What should an API answer when the router behind it is down?"</p><p>502 Bad Gateway (or 504 for a timeout the gateway enforces), with a short JSON detail and nothing sensitive. I map the netmiko timeout and authentication exceptions to that in one exception handler, so a dead router never looks like a bug in my code, and the log keeps the full reason for the network team.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A change route validates first, pushes, checks the device output, reads the state back and returns what the device holds.</li>
<li>netmiko returns errors as text; scan for the vendor's marker and answer 400.</li>
<li>A pattern on input fields keeps extra commands out of the configuration.</li>
<li>One exception handler per known failure turns 500 into an honest 502.</li>
<li>404 = their name, 422 = their shape, 400 = their content, 502 = the device, 500 = your bug.</li>
</ul></div>
`,hi:`
<p>Padhne wala route sahi karna aasaan hai: kuch badalta nahi, isliye galti sasti padti hai. Jo route router ko <b>badalta</b> hai use zyada dhyan chahiye: input safe ho, result saabit ho, aur fail hone ka har tareeka sachcha jawab de. Yeh chapter Lab 1 ke step 5 aur 6 ko cover karta hai.</p>

<h3>Kuch badalne wala route</h3>
<pre class="code"><span class="c"># models.py: one more model</span>
class ChangeResult(BaseModel):
    device: str
    interface: str
    description: str</pre><pre class="code"><span class="c"># api.py: the route that changes something</span>
@app.post("/devices/{name}/description", response_model=ChangeResult, dependencies=[Depends(need_token)])
def set_description(name: str, change: DescriptionIn):
    dev = get_device(name)
    with ConnectHandler(**dev) as conn:
        out = conn.send_config_set(["interface " + change.interface, "description " + change.description])
        if "% Invalid" in out:
            raise HT&#84;PException(status_code=400, detail="the device rejected " + change.interface)
        shown = conn.send_command("show running-config interface " + change.interface)
    found = re.search(r"^ description (.*)$", shown, re.M)
    return {"device": name, "interface": change.interface, "description": found.group(1) if found else ""}</pre>
<p>Ise dekho. Function shuru hone se pehle FastAPI <code>change</code> ko <code>DescriptionIn</code> se validate kar chuka hai, isliye ab tak interface naam pattern se match karta hai aur description 3 se 40 safe characters ki hai. Function <code>send_config_set</code> se do configuration lines push karta hai. <b>Router error print kare to netmiko exception raise nahi karta</b>; error text bas lautaya jaata hai. Isliye code <code>% Invalid</code> dhoondhta hai aur <code>400</code> deta hai. Phir running configuration se description <b>wapas padhta</b> hai aur woh lautata hai jo router ke paas sach mein hai, woh nahi jo caller ne maanga tha.</p>
<pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]

good = {"interface": "GigabitEthernet0/1", "description": "TO-HYD-CORE"}
r = call("POST", "/devices/R1/description", token=TOKEN, json=good)
print("good body ", r.status_code, r.json())

bad = {"interface": "Fa0/1", "description": "x" * 60}
r = call("POST", "/devices/R1/description", token=TOKEN, json=bad)
print("bad body  ", r.status_code)
for err in r.json()["detail"]:
    print("   ", err["loc"], err["type"], "|", err["msg"])

missing = {"interface": "Loopback0"}
r = call("POST", "/devices/R1/description", token=TOKEN, json=missing)
print("missing   ", r.status_code, [e["loc"][-1] + ":" + e["type"] for e in r.json()["detail"]])</pre><pre class="out">AUTO01$ python3 change.py
<span class="hl">good body  200 {'device': 'R1', 'interface': 'GigabitEthernet0/1', 'description': 'TO-HYD-CORE'}</span>
bad body   422
    ['body', 'interface'] string_pattern_mismatch | String should match pattern '^(GigabitEthernet|Loopback)\\d+(/\\d+)*$'
<span class="hl">    ['body', 'description'] string_too_long | String should have at most 40 characters</span>
<span class="hl">missing    422 ['description:missing']</span></pre>
<p>Ek achhi call aur do buri, sab API ke zariye. Buri bodies kisi router tak nahi pahunchi: pydantic ne roka. Ab dekho router kya refuse karta hai:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet9/9","description":"TO-PUNE"}' localhost:8000/devices/R2/description
<span class="hl">{"detail":"the device rejected GigabitEthernet9/9"}</span></pre>
<p>Body valid thi, par yeh interface router par hai hi nahi, isliye device ne mana kiya aur API ne use saaf message ke saath <code>400</code> bana diya.</p>

<h3>Validation protection bhi hai</h3>
<p>Chapter 3 mein <code>description</code> ko diya pattern yahan kaam aata hai. <code>send_config_set</code> har string ko alag line ki tarah bhejta hai, isliye jis description mein line break ho woh doosra command le ja sakti hai. Try karo:</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" -d '{"interface":"GigabitEthernet0/2","description":"TO-PUNE\\nshutdown"}' localhost:8000/devices/R2/description
<span class="hl">{"detail":[{"type":"string_pattern_mismatch","loc":["body","description"],"msg":"String should match pattern '^[A-Za-z0-9 ._:/-]+$'","input":"TO-PUNE\\nshutdown","ctx":{"pattern":"^[A-Za-z0-9 ._:/-]+$"}}]}</span></pre>
<p><code>string_pattern_mismatch</code> ke saath refuse, kisi SSH session se pehle. Allowed cheezein whitelist karo, khatarnak cheezon ki list banane ki koshish mat karo.</p>

<h3>Jab router hi problem ho</h3>
<p>R3 rack nahi hua. Agar API netmiko ki exception ko bas nikalne de to caller kya dekhta hai?</p>
<pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R3/interfaces
<span class="hl">Internal Server Error</span></pre><pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2318]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "api.py", line 40, in interfaces
    with ConnectHandler(**dev) as conn:
<span class="hl">netmiko.exceptions.NetmikoTimeoutException: TCP connection to device failed.</span>

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: cisco_ios 10.99.0.3:22
(connection timed out)
<span class="hl">INFO:     127.0.0.1:52840 - "GET /devices/R3/interfaces HT&#84;P/1.1" 500 Internal Server Error</span></pre>
<p>Bina kisi explanation ke sirf <code>500</code>, aur log mein traceback. Caller bug aur mare hue router mein farq nahi kar sakta. <b>Exception handler</b> kisi known exception class ko poore API ke liye ek jagah sahi jawab mein badal deta hai:</p>
<pre class="code"><span class="c"># api.py: map device failures to 502</span>
@app.exception_handler(NetmikoTimeoutException)
async def device_unreachable(request: Request, exc: NetmikoTimeoutException):
    return JSONResponse(status_code=502, content={"detail": "device unreachable"})


@app.exception_handler(NetmikoAuthenticationException)
async def device_login_failed(request: Request, exc: NetmikoAuthenticationException):
    return JSONResponse(status_code=502, content={"detail": "device login failed"})</pre><div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Paanch sachche jawab"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">404</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">unknown naam</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">422</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">request ki shape galat</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">400</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">device ne mana kiya</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">502</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">device unreachable</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">500</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">API ka bug</text></svg></div><pre class="out">AUTO01$ curl -s -H "Authorization: Bearer $API_TOKEN" localhost:8000/devices/R3/interfaces
<span class="hl">{"detail":"device unreachable"}</span></pre><pre class="code">import os

from apiclient import call

TOKEN = os.environ["API_TOKEN"]

cases = (
    ("unknown device", "R9"),
    ("device down", "R3"),
    ("device up", "R2"),
)
for label, name in cases:
    r = call("GET", "/devices/%s/interfaces" % name, token=TOKEN)
    print("%-15s %-3s %s %s" % (label, name, r.status_code, r.text[:70]))
r = call("GET", "/health")
print("server still up", r.status_code, r.json())</pre><pre class="out">AUTO01$ python3 errors.py
<span class="hl">unknown device  R9  404 {"detail":"unknown device R9"}</span>
<span class="hl">device down     R3  502 {"detail":"device unreachable"}</span>
device up       R2  200 [{"interface":"GigabitEthernet0/0","ip_address":"10.99.0.2","status":"
<span class="hl">server still up 200 {'status': 'ok'}</span></pre>
<p>Unknown device 404, mara hua router 502, theek router 200, aur server abhi bhi serve kar raha hai. Ab caller ko pata hai ki kiski problem hai: 404 unki hai, 502 network team ki, 500 aapki hoti.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Asli uvicorn lab se kahin lamba traceback print karta hai (Starlette frames samet), aur asli unreachable router SSH connect timeout jitna waqt leta hai (<code>conn_timeout</code> kam rakho). Status codes aur handler code wahi hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>send_config_set</code> ki return value ko success ka saboot maan lena. Woh jo bhi hua ho text lautata hai. Text mein vendor ka error marker dhoondho, aur "done" kehne se pehle state hamesha wapas padho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exception handlers <code>@app.exception_handler(ExceptionClass)</code> se register hote hain aur <code>(request, exc)</code> lete hain. Handler ke andar raise hui <code>HT&#84;PException</code> ko FastAPI khud JSON jawab bana deta hai; doosri libraries ki exceptions ke liye handler aapko khud register karna padta hai.</p></div>

<div class="scn"><h4>"Done" jo done nahi tha</h4><p>Ek change API har push ke baad 200 deta tha. Hafton baad audit mein 14 interfaces purani description ke saath mile: routers ne invalid-input marker print kiya tha aur API ne kabhi dekha hi nahi. Fix bara lines ka tha: output scan karo, description wapas padho, woh lautao jo device ke paas hai, aur alag ho to 400 do.</p><p><b>Lesson:</b> jawab device ki state batana chahiye, send ki safalta nahi.</p></div>

<div class="iv"><p class="q">"Peeche ka router down ho to API ko kya jawab dena chahiye?"</p><p>502 Bad Gateway (ya gateway jab timeout enforce kare to 504), chhote JSON detail ke saath aur kuch sensitive nahi. Netmiko ke timeout aur authentication exceptions ko main ek exception handler mein isse map karta hoon, taaki mara hua router mere code ka bug na lage, aur log network team ke liye poori wajah rakhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Change route pehle validate karta hai, push karta hai, device output check karta hai, state wapas padhta hai aur woh lautata hai jo device ke paas hai.</li>
<li>netmiko errors text mein lautata hai; vendor ka marker dhoondho aur 400 do.</li>
<li>Input fields par pattern configuration mein extra commands ko bahar rakhta hai.</li>
<li>Har known failure ke liye ek exception handler 500 ko sachche 502 mein badal deta hai.</li>
<li>404 = unka naam, 422 = unki shape, 400 = unka content, 502 = device, 500 = aapka bug.</li>
</ul></div>
`}};export{e as default};