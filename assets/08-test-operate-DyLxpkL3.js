var e={id:`test-operate`,h:{en:`Tests and operations: TestClient, logs and restarts`,hi:`Tests aur operations: TestClient, logs aur restarts`},body:{en:`
<p>A service you cannot test is a service you are afraid to change. FastAPI ships a client that calls your app <b>inside the same Python process</b>, with no port and no running server, so a test takes milliseconds. This chapter (step 7 of Lab 1) writes four tests for the rules of the door, then covers the daily operation of the server: logs, stopping, restarting and what changes in production.</p>

<h3>Tests with TestClient</h3>
<pre class="code">import os

os.environ["API_TOKEN"] = "test-token-only"

from fastapi.testclient import TestClient

import api

client = TestClient(api.app)
AUTH = {"Authorization": "Bearer test-token-only"}


def test_no_token_is_refused():
    assert client.get("/devices/R1/interfaces").status_code == 403


def test_wrong_token_is_401():
    r = client.get("/devices/R1/interfaces", headers={"Authorization": "Bearer nope"})
    assert r.status_code == 401


def test_bad_body_is_422():
    r = client.post("/devices/R1/description", headers=AUTH, json={"interface": "Fa0/1", "description": "x"})
    assert r.status_code == 422
    assert {e["loc"][-1] for e in r.json()["detail"]} == {"interface", "description"}


def test_unknown_device_is_404():
    assert client.get("/devices/R9/interfaces", headers=AUTH).status_code == 404</pre>
<p>Details worth noticing:</p>
<ul>
<li><code>API_TOKEN</code> is set <b>before</b> <code>import api</code>, because <code>api.py</code> reads the variable when it is imported. A test must never depend on the real token.</li>
<li><code>TestClient(api.app)</code> behaves like <code>requests</code>: <code>client.get(...)</code>, <code>client.post(..., json=...)</code>, <code>r.status_code</code>, <code>r.json()</code>.</li>
<li>Every test checks one rule of the door: no token is refused, a wrong token is 401, a bad body is 422 <i>and names both bad fields</i>, an unknown device is 404. None of them needs a router, because FastAPI refuses the request before the handler runs.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_api.py
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span></pre><pre class="out">AUTO01$ pytest -v test_api.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_api.py::test_no_token_is_refused PASSED                             [ 25%]
test_api.py::test_wrong_token_is_401 PASSED                              [ 50%]
test_api.py::test_bad_body_is_422 PASSED                                 [ 75%]
test_api.py::test_unknown_device_is_404 PASSED                           [100%]

<span class="hl">============================== 4 passed in 0.05s ===============================</span></pre>
<p>Because these tests only need the app, they can run in a pipeline (<code>auto-cicd</code>) on every commit. Tests that need a device should replace the netmiko call with a fake; FastAPI lets a test swap any dependency through <code>app.dependency_overrides</code>. The most valuable test you can add to a real project is a loop that visits every route without a token and asserts a 401 or 403: the day somebody adds a route and forgets the gate, that test fails.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> On a real machine <code>TestClient</code> needs the package <code>ht&#116;px</code> (<code>pip install ht&#116;px</code>) and <code>pytest</code>; both are present in the lab. The first line of <code>pytest -v</code> shows the lab's Python and pytest versions, which will differ from yours.</p></div>

<h3>Operating the server</h3>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="The loop you repeat after every change"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Edit</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">api.py</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">pkill -f uvicorn</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Start</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">uvicorn ... &amp;</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">pytest, check.py</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">Read log</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">cat api.log</text></svg></div>
<p>The loop of the lab: edit, stop, start, check, read the log. You know the first four. The log is where the server explains itself:</p>
<pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2323]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)
<span class="hl">INFO:     127.0.0.1:44274 - "GET /devices/R3/interfaces HT&#84;P/1.1" 502 Bad Gateway</span>
<span class="hl">INFO:     10.99.0.60:49855 - "GET /devices/R9/interfaces HT&#84;P/1.1" 404 Not Found</span>
<span class="hl">INFO:     10.99.0.60:49929 - "GET /devices/R3/interfaces HT&#84;P/1.1" 502 Bad Gateway</span>
INFO:     10.99.0.60:50040 - "GET /devices/R2/interfaces HT&#84;P/1.1" 200 OK
INFO:     10.99.0.60:50151 - "GET /health HT&#84;P/1.1" 200 OK</pre>
<p>Each access line has the caller's address and port, the request line and the status. Scan the status column first: a block of <code>502</code> means a device problem, a block of <code>422</code> means a client sending the wrong shape, a <code>500</code> is followed by a traceback on lines you can search for. Because the log has no tokens or passwords (you never print them), you can send it to a ticket safely. Stopping and the proof that it stopped:</p>
<pre class="out">AUTO01$ pkill -f uvicorn
AUTO01$ cat api.log | tail -4
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
<span class="hl">INFO:     Finished server process [2323]</span></pre><pre class="out">AUTO01$ curl -s -m 3 localhost:8000/health; echo exit=$?
<span class="hl">exit=7</span>
curl: (7) Failed to connect to localhost port 8000 after 1 ms: Couldn't connect to server</pre>
<p>On a stop, uvicorn finishes the work, prints "Shutting down", and exits; nothing listens on 8000 any more and <code>curl</code> exits with code 7 (could not connect). That is the signature of "the service is down" as opposed to "the service answers with an error".</p>

<h3>What changes in production</h3>
<ul>
<li><b>Run it as a service</b> (systemd or a container) so it restarts after a crash or a reboot, and under a user that is not root.</li>
<li><b>Put a reverse proxy with TLS in front</b> and bind uvicorn to <code>127.0.0.1</code>; tokens in clear text on a network are tokens that will leak.</li>
<li><b>Limit who can connect</b> with an ACL or a firewall to the portals that need it, and rate-limit at the proxy.</li>
<li><b>Several workers</b> (<code>--workers 4</code>) use several CPUs; keep any shared state outside the process.</li>
<li><b>Rotate logs</b> and keep them: they are your audit trail of who changed which router.</li>
<li><b>Turn the documentation off or protect it</b> if the API is public: the OpenAPI file is a map of your service.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Testing only the happy path. The tests that earn their keep are the refusals: no token, wrong token, bad body, unknown device. Those are the rules that protect the routers, and they are the ones that silently break when somebody refactors.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>TestClient</code> does not open a socket and does not need uvicorn; it calls the ASGI app directly. A test that passes with <code>TestClient</code> does not prove that the server is listening on the right host and port; check that with <code>ss</code> and a real <code>curl</code>.</p></div>

<div class="scn"><h4>The route without a gate</h4><p>A developer added <code>/devices/{name}/reload</code> late on a Friday and forgot the dependency. The access log on Monday showed a <code>200</code> for a call with no <code>Authorization</code> header from an address nobody recognised. The team added one test that loops over <code>app.routes</code> and expects 401 or 403 from every route except <code>/health</code>; it caught the next forgotten gate in code review, not in production.</p><p><b>Lesson:</b> turn the rule "every route has a gate" into a test.</p></div>

<div class="iv"><p class="q">"How do you test a FastAPI service that talks to network devices?"</p><p>Two layers. Fast tests with <code>TestClient</code> and fake devices (override the dependency or patch the connection helper) cover validation, authentication and error mapping. A smaller set of integration tests runs against a lab or a virtual device and checks the real read-back. The refusal paths (no token, bad body, unknown device) are tested first because they protect production.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>TestClient(app)</code> calls the app in-process: no port, no server, fast.</li>
<li>Set the test token before importing the app; test the refusals first.</li>
<li>Operate in a loop: edit, stop, start, check, read the log.</li>
<li>Log statuses tell the story: 502 device, 422 client shape, 500 bug; curl exit 7 means nothing is listening.</li>
<li>Production adds a service manager, TLS at a proxy, narrow access, workers and log rotation.</li>
</ul></div>
`,hi:`
<p>Jis service ko aap test nahi kar sakte use badalne se aap darte ho. FastAPI aisa client deta hai jo aapke app ko <b>usi Python process ke andar</b> bulata hai, bina port aur bina chalte server ke, isliye test milliseconds mein hota hai. Yeh chapter (Lab 1 ka step 7) darwaze ke rules ke chaar tests likhta hai, phir server ke rozana operation ko cover karta hai: logs, stop, restart aur production mein kya badalta hai.</p>

<h3>TestClient ke saath tests</h3>
<pre class="code">import os

os.environ["API_TOKEN"] = "test-token-only"

from fastapi.testclient import TestClient

import api

client = TestClient(api.app)
AUTH = {"Authorization": "Bearer test-token-only"}


def test_no_token_is_refused():
    assert client.get("/devices/R1/interfaces").status_code == 403


def test_wrong_token_is_401():
    r = client.get("/devices/R1/interfaces", headers={"Authorization": "Bearer nope"})
    assert r.status_code == 401


def test_bad_body_is_422():
    r = client.post("/devices/R1/description", headers=AUTH, json={"interface": "Fa0/1", "description": "x"})
    assert r.status_code == 422
    assert {e["loc"][-1] for e in r.json()["detail"]} == {"interface", "description"}


def test_unknown_device_is_404():
    assert client.get("/devices/R9/interfaces", headers=AUTH).status_code == 404</pre>
<p>Dhyan dene wali baatein:</p>
<ul>
<li><code>API_TOKEN</code> <code>import api</code> se <b>pehle</b> set hota hai, kyunki <code>api.py</code> variable ko import hote waqt padhta hai. Test kabhi asli token par depend na kare.</li>
<li><code>TestClient(api.app)</code> <code>requests</code> jaisa behave karta hai: <code>client.get(...)</code>, <code>client.post(..., json=...)</code>, <code>r.status_code</code>, <code>r.json()</code>.</li>
<li>Har test darwaze ka ek rule check karta hai: token nahi to refuse, galat token 401, galat body 422 <i>aur dono galat fields ke naam</i>, unknown device 404. Kisi ko router nahi chahiye, kyunki FastAPI request ko handler chalne se pehle hi refuse kar deta hai.</li>
</ul>
<pre class="out">AUTO01$ pytest -q test_api.py
....                                                                     [100%]
<span class="hl">4 passed in 0.05s</span></pre><pre class="out">AUTO01$ pytest -v test_api.py
============================= test session starts ==============================
platform linux -- Python 3.12.0, pytest-7.4.4, pluggy-1.3.0 -- /usr/bin/python3
cachedir: .pytest_cache
rootdir: /home/netadmin
collected 4 items

test_api.py::test_no_token_is_refused PASSED                             [ 25%]
test_api.py::test_wrong_token_is_401 PASSED                              [ 50%]
test_api.py::test_bad_body_is_422 PASSED                                 [ 75%]
test_api.py::test_unknown_device_is_404 PASSED                           [100%]

<span class="hl">============================== 4 passed in 0.05s ===============================</span></pre>
<p>Kyunki in tests ko sirf app chahiye, ye pipeline (<code>auto-cicd</code>) mein har commit par chal sakte hain. Jin tests ko device chahiye unhe netmiko call ki jagah fake lagana chahiye; FastAPI test ko <code>app.dependency_overrides</code> se koi bhi dependency badalne deta hai. Asli project mein sabse keemti test woh loop hai jo har route ko bina token ke bulaye aur 401 ya 403 maange: jis din koi route jodkar gate bhool jaaye, yeh test fail hoga.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Asli machine par <code>TestClient</code> ko <code>ht&#116;px</code> package (<code>pip install ht&#116;px</code>) aur <code>pytest</code> chahiye; lab mein dono maujood hain. <code>pytest -v</code> ki pehli line lab ke Python aur pytest versions dikhati hai, jo aapke versions se alag honge.</p></div>

<h3>Server ko operate karna</h3>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Har change ke baad dohraya jaane wala loop"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">Edit</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">api.py</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">Stop</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">pkill -f uvicorn</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Start</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">uvicorn ... &amp;</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">Check</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">pytest, check.py</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">Log padho</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">cat api.log</text></svg></div>
<p>Lab ka loop: edit, stop, start, check, log padho. Pehle chaar aap jaante ho. Log woh jagah hai jahan server apne aap ko samjhata hai:</p>
<pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2323]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)
<span class="hl">INFO:     127.0.0.1:44274 - "GET /devices/R3/interfaces HT&#84;P/1.1" 502 Bad Gateway</span>
<span class="hl">INFO:     10.99.0.60:49855 - "GET /devices/R9/interfaces HT&#84;P/1.1" 404 Not Found</span>
<span class="hl">INFO:     10.99.0.60:49929 - "GET /devices/R3/interfaces HT&#84;P/1.1" 502 Bad Gateway</span>
INFO:     10.99.0.60:50040 - "GET /devices/R2/interfaces HT&#84;P/1.1" 200 OK
INFO:     10.99.0.60:50151 - "GET /health HT&#84;P/1.1" 200 OK</pre>
<p>Har access line mein caller ka address aur port, request line aur status hota hai. Pehle status column scan karo: <code>502</code> ka block device problem hai, <code>422</code> ka block client galat shape bhej raha hai, <code>500</code> ke baad traceback aati hai jise aap dhoondh sakte ho. Kyunki log mein tokens ya passwords nahi hote (aap unhe kabhi print nahi karte), use ticket mein safely bhej sakte ho. Stop karna aur saboot ki ruk gaya:</p>
<pre class="out">AUTO01$ pkill -f uvicorn
AUTO01$ cat api.log | tail -4
INFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
<span class="hl">INFO:     Finished server process [2323]</span></pre><pre class="out">AUTO01$ curl -s -m 3 localhost:8000/health; echo exit=$?
<span class="hl">exit=7</span>
curl: (7) Failed to connect to localhost port 8000 after 1 ms: Couldn't connect to server</pre>
<p>Stop par uvicorn kaam poora karta hai, "Shutting down" print karta hai aur nikal jaata hai; ab 8000 par kuch nahi sunta aur <code>curl</code> code 7 (connect nahi hua) se nikalta hai. Yahi "service down hai" ki pehchaan hai, "service error ke saath jawab deti hai" se alag.</p>

<h3>Production mein kya badalta hai</h3>
<ul>
<li><b>Service ki tarah chalao</b> (systemd ya container) taaki crash ya reboot ke baad restart ho, aur root se alag user ke under.</li>
<li><b>Aage TLS wala reverse proxy lagao</b> aur uvicorn ko <code>127.0.0.1</code> par bind karo; network par clear text tokens woh tokens hain jo leak honge.</li>
<li><b>Kaun connect kare yeh limit karo</b> ACL ya firewall se sirf unn portals tak jinhe chahiye, aur proxy par rate-limit lagao.</li>
<li><b>Kai workers</b> (<code>--workers 4</code>) kai CPUs use karte hain; shared state process ke bahar rakho.</li>
<li><b>Logs rotate karo</b> aur rakho: woh aapka audit trail hai ki kisne kaunsa router badla.</li>
<li><b>Documentation band ya protected karo</b> agar API public hai: OpenAPI file aapki service ka naksha hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Sirf happy path test karna. Jo tests kaam aate hain woh refusals hain: token nahi, galat token, galat body, unknown device. Yahi rules routers ko bachate hain, aur refactor mein yahi chupchaap toot-te hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>TestClient</code> socket nahi kholta aur uvicorn nahi chahiye; woh ASGI app ko seedha bulata hai. <code>TestClient</code> se pass hua test yeh saabit nahi karta ki server sahi host aur port par sun raha hai; woh <code>ss</code> aur asli <code>curl</code> se check karo.</p></div>

<div class="scn"><h4>Bina gate wala route</h4><p>Ek developer ne Friday raat <code>/devices/{name}/reload</code> jodaa aur dependency bhool gaya. Monday ko access log mein ek anjaan address se bina <code>Authorization</code> header ki call par <code>200</code> dikha. Team ne ek test jodaa jo <code>app.routes</code> par loop karke <code>/health</code> ke alawa har route se 401 ya 403 maangta hai; agla bhoola hua gate code review mein pakda gaya, production mein nahi.</p><p><b>Lesson:</b> "har route par gate hai" rule ko test bana do.</p></div>

<div class="iv"><p class="q">"Network devices se baat karne wali FastAPI service ko kaise test karoge?"</p><p>Do layers. <code>TestClient</code> aur fake devices ke saath tez tests (dependency override ya connection helper patch) validation, authentication aur error mapping cover karte hain. Chhota integration test set lab ya virtual device par chalta hai aur asli read-back check karta hai. Refusal paths (no token, bad body, unknown device) pehle test karta hoon kyunki wahi production ko bachate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>TestClient(app)</code> app ko process ke andar bulata hai: port nahi, server nahi, tez.</li>
<li>App import karne se pehle test token set karo; refusals pehle test karo.</li>
<li>Loop mein operate karo: edit, stop, start, check, log padho.</li>
<li>Log statuses kahani batate hain: 502 device, 422 client ki shape, 500 bug; curl exit 7 ka matlab kuch nahi sun raha.</li>
<li>Production mein service manager, proxy par TLS, narrow access, workers aur log rotation jodte hain.</li>
</ul></div>
`}};export{e as default};