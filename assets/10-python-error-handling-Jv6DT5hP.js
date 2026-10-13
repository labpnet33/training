var e={id:`python-errors`,h:{en:`Python requests that fail safely: raise_for_status, try/except, timeouts and sessions`,hi:`Python requests jo safely fail hon: raise_for_status, try/except, timeouts aur sessions`},body:{en:`
<p>A good pilot does not assume every flight is smooth. There are checklists for engine trouble, weather and radio loss, and each has its own procedure. A good script works the same way: each kind of API failure has its own handler, and one failure never crashes the whole trip. You already used <code>raise_for_status()</code> in the requests module. Now you will classify the failures, put <code>try/except</code> in the right order, add timeouts, and use a <b>session</b> to make calls shorter and more robust. This chapter is the Python half of exam topic 2.5 and is practised in Lab 2.</p>

<h3>Four ways a call can go wrong</h3>
<div class="tbl"><table class="cmp"><tr><th>What happened</th><th>What you see</th><th>Python signal</th></tr>
<tr><td>No answer at all (no route, port closed, link down)</td><td>ping fails, connection refused</td><td><code>requests.exceptions.ConnectionError</code></td></tr>
<tr><td>Answer too slow</td><td>script hangs without a timeout</td><td><code>requests.exceptions.Timeout</code></td></tr>
<tr><td>Answer with an error code (401, 404, 500...)</td><td><code>r.status_code</code> is 400 or more</td><td>nothing, until you call <code>r.raise_for_status()</code> which raises <code>HTTPError</code></td></tr>
<tr><td>Answer that is not what you expected</td><td>HTML page, empty body, missing key</td><td><code>JSONDecodeError</code> or <code>KeyError</code> when you parse</td></tr></table></div>
<p>The key point that surprises beginners: <b>requests does not raise an exception for 4xx and 5xx by default</b>. A 404 is a valid HTTP answer. Your script continues with bad data unless you check the status yourself, which <code>raise_for_status()</code> does in one line.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="requests exception hierarchy">
<rect x="200" y="10" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">RequestException (base class)</text>
<rect x="20" y="95" width="170" height="38" rx="8" fill="#bae6fd"/><text x="105" y="119" text-anchor="middle" class="svg-ink" font-size="13">HTTPError</text>
<rect x="215" y="95" width="200" height="38" rx="8" fill="#bae6fd"/><text x="315" y="119" text-anchor="middle" class="svg-ink" font-size="13">ConnectionError</text>
<rect x="440" y="95" width="180" height="38" rx="8" fill="#bae6fd"/><text x="530" y="119" text-anchor="middle" class="svg-ink" font-size="13">Timeout</text>
<rect x="440" y="170" width="85" height="34" rx="8" fill="#bbf7d0"/><text x="482" y="192" text-anchor="middle" class="svg-ink" font-size="12">Connect</text>
<rect x="535" y="170" width="85" height="34" rx="8" fill="#bbf7d0"/><text x="577" y="192" text-anchor="middle" class="svg-ink" font-size="12">Read</text>
<line x1="320" y1="48" x2="105" y2="95" stroke="#64748b"/><line x1="320" y1="48" x2="315" y2="95" stroke="#64748b"/><line x1="320" y1="48" x2="530" y2="95" stroke="#64748b"/>
<line x1="530" y1="133" x2="482" y2="170" stroke="#64748b"/><line x1="530" y1="133" x2="577" y2="170" stroke="#64748b"/>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">answer with 4xx/5xx</text><text x="315" y="160" text-anchor="middle" class="svg-muted" font-size="12">no TCP/TLS connection</text>
</svg><p class="cap">Catch the specific exceptions first and RequestException last. A ConnectTimeout is both a Timeout and a connection problem.</p></div>

<h3>The safe call pattern</h3>
<pre class="code">import requests

def get_json(url, auth, headers):
    try:
        r = requests.get(url, auth=auth, headers=headers, verify=False, timeout=5)
        r.raise_for_status()                          # 4xx/5xx -&gt; HTTPError
        return r.json()                               # not JSON -&gt; JSONDecodeError (a ValueError)
    except requests.exceptions.HTTPError as err:
        print("API error:", err)                       # 401 Client Error: Unauthorized for url: ...
        print("   status:", err.response.status_code, "body:", err.response.text[:200])
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        print("unreachable or too slow:", url)
    except ValueError:
        print("answer was not valid JSON:", url)
    return None                                       # caller decides what to do</pre>
<p>Three habits: catch <b>specific</b> exceptions, not a bare <code>except:</code> that would hide typing mistakes; print enough to troubleshoot (URL, status code, the first part of the body); and <b>return a clear failure value</b> so the loop can continue with the next device. Order matters: put specific classes first, <code>requests.exceptions.RequestException</code> last as a catch-all for anything else that requests raises.</p>

<h3>What Lab 2 shows</h3>
<p>The audit script of Lab 2 starts with no error handling. After the fixes it prints a line for every router, and each line tells you where to look:</p>
<pre class="out">10.99.0.1 enabled: 2
10.99.0.2 API error: <span class="hl">404</span> Client Error: Not Found for url: .../ietf-interfaces:interfaces   (RESTCONF off on R2)
10.99.0.3 API error: <span class="hl">401</span> Client Error: Unauthorized for url: .../ietf-interfaces:interfaces  (password mismatch on R3)
10.99.0.4 <span class="hl">unreachable</span>                                                                (link shut on R4)</pre>
<p>Notice what the exception type tells you: <code>HTTPError</code> means the router <i>answered</i> and refused, so the network works and the problem is in the API settings or credentials. <code>ConnectionError</code>/<code>Timeout</code> means no answer arrived, so test the network first (ping, interface state).</p>

<h3>Sessions: share settings across calls</h3>
<p>A <code>requests.Session()</code> remembers settings and reuses the TCP/TLS connection, which makes many calls to the same host faster and the code shorter. Reference snippet (the lab interpreter has the plain <code>requests.get</code> calls only):</p>
<pre class="code">import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

s = requests.Session()
s.auth = ("netops", "NK@2026")                       # sent on every call
s.headers.update({"Accept": "application/yang-data+json"})
s.verify = False                                      # lab only
retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 502, 503, 504],
              allowed_methods=["GET", "PUT", "DELETE"])        # idempotent methods only
s.mount("h&#116;tps://", HTTPAdapter(max_retries=retry))        # automatic back-off retries

for host in ROUTERS:
    r = s.get(f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces", timeout=5)
    ...</pre>
<p>The <code>Retry</code> object gives you chapter 7's back-off and obeys <code>Retry-After</code> by default. Remember: a session does not add a timeout for you; pass <code>timeout=</code> on each call. Use <code>with requests.Session() as s:</code> so connections are closed.</p>

<h3>Log, do not just print</h3>
<p>For scripts that run unattended, use the <code>logging</code> module with a level and a timestamp, include the device name in every message, and end with a summary: "38 ok, 2 failed: r7 (401), r19 (timeout)". Never log tokens or passwords. Return a non-zero exit code (<code>sys.exit(1)</code>) when anything failed, so schedulers and CI can notice.</p>

<div class="warn"><p><b>Common mistakes.</b> A bare <code>except:</code> or <code>except Exception: pass</code> that hides every error; no timeout; calling <code>r.json()</code> before checking the status; assuming a 200 contains the key you need (use <code>.get()</code> or check); retrying non-idempotent POSTs inside an adapter; not closing sessions.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>raise_for_status()</code> raises <code>requests.exceptions.HTTPError</code> only for 4xx and 5xx; for 2xx and 3xx it does nothing. A connection that fails raises <code>ConnectionError</code>, not HTTPError, because there was no HTTP response at all.</p></div>

<div class="scn"><h4>One bad router, a whole night lost</h4><p>An overnight job audited 60 routers with a plain <code>for</code> loop and no try/except. At 01:12 router 7 returned 503 during its own reload. The script died with a KeyError at the first missing key, and the other 53 routers were never checked. The rewrite wrapped each router in try/except, recorded the failure and continued, retried 503s twice with back-off, and printed a final failure list. The next night the report was complete, with two clearly labelled failures.</p><p><b>Lesson:</b> Isolate failures per device. The loop must outlive any one router.</p></div>

<div class="iv"><p class="q">"How do you make a requests-based script robust?"</p><p>Always set a timeout; call <code>raise_for_status()</code>; wrap calls in try/except with specific exceptions (HTTPError, ConnectionError, Timeout, JSON errors) and continue with the next device; retry only temporary errors with back-off; use a Session for shared auth and headers; log failures with the device name, and exit non-zero if anything failed. Mention verify=False is for labs only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests does not raise for 4xx/5xx by default; call <code>raise_for_status()</code>.</li>
<li>HTTPError = answer with an error code; ConnectionError/Timeout = no usable answer; JSON/KeyError = unexpected body.</li>
<li>Catch specific exceptions in order; never use a bare except.</li>
<li>Always pass <code>timeout=</code>; a Session shares auth/headers and can add retries with back-off.</li>
<li>Isolate failures per device, log them with context, and report a summary.</li>
</ul></div>
`,hi:`
<p>Achha pilot maan kar nahi chalta ki har flight smooth hogi. Engine trouble, mausam aur radio loss ke liye checklists hoti hain, aur har ek ka apna procedure hota hai. Achhi script bhi aise hi kaam karti hai: API ki har kism ki failure ka apna handler hota hai, aur ek failure poori trip nahi todti. Requests module mein aap <code>raise_for_status()</code> use kar chuke ho. Ab aap failures ko classify karoge, <code>try/except</code> ko sahi order mein rakhoge, timeouts jodoge, aur calls ko chhota aur robust banane ke liye <b>session</b> use karoge. Yeh chapter exam topic 2.5 ka Python hissa hai aur Lab 2 mein practise hota hai.</p>

<h3>Call ke galat hone ke chaar tareeke</h3>
<div class="tbl"><table class="cmp"><tr><th>Kya hua</th><th>Aap kya dekhte ho</th><th>Python signal</th></tr>
<tr><td>Koi jawab hi nahi (route nahi, port band, link down)</td><td>ping fail, connection refused</td><td><code>requests.exceptions.ConnectionError</code></td></tr>
<tr><td>Jawab bahut dheere</td><td>timeout ke bina script hang</td><td><code>requests.exceptions.Timeout</code></td></tr>
<tr><td>Error code ke saath jawab (401, 404, 500...)</td><td><code>r.status_code</code> 400 ya zyada</td><td>kuch nahi, jab tak <code>r.raise_for_status()</code> call na karo jo <code>HTTPError</code> raise karta hai</td></tr>
<tr><td>Jawab jo umeed jaisa nahi</td><td>HTML page, khali body, missing key</td><td>parse karte waqt <code>JSONDecodeError</code> ya <code>KeyError</code></td></tr></table></div>
<p>Beginners ko jo baat chaunkati hai: <b>requests by default 4xx aur 5xx par exception nahi uthata</b>. 404 valid HTTP jawab hai. Aapki script kharab data ke saath aage chalti hai jab tak aap status khud check na karo, jo <code>raise_for_status()</code> ek line mein karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="requests exception hierarchy">
<rect x="200" y="10" width="240" height="38" rx="8" fill="#ddd6fe"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">RequestException (base class)</text>
<rect x="20" y="95" width="170" height="38" rx="8" fill="#bae6fd"/><text x="105" y="119" text-anchor="middle" class="svg-ink" font-size="13">HTTPError</text>
<rect x="215" y="95" width="200" height="38" rx="8" fill="#bae6fd"/><text x="315" y="119" text-anchor="middle" class="svg-ink" font-size="13">ConnectionError</text>
<rect x="440" y="95" width="180" height="38" rx="8" fill="#bae6fd"/><text x="530" y="119" text-anchor="middle" class="svg-ink" font-size="13">Timeout</text>
<rect x="440" y="170" width="85" height="34" rx="8" fill="#bbf7d0"/><text x="482" y="192" text-anchor="middle" class="svg-ink" font-size="12">Connect</text>
<rect x="535" y="170" width="85" height="34" rx="8" fill="#bbf7d0"/><text x="577" y="192" text-anchor="middle" class="svg-ink" font-size="12">Read</text>
<line x1="320" y1="48" x2="105" y2="95" stroke="#64748b"/><line x1="320" y1="48" x2="315" y2="95" stroke="#64748b"/><line x1="320" y1="48" x2="530" y2="95" stroke="#64748b"/>
<line x1="530" y1="133" x2="482" y2="170" stroke="#64748b"/><line x1="530" y1="133" x2="577" y2="170" stroke="#64748b"/>
<text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">4xx/5xx ke saath jawab</text><text x="315" y="160" text-anchor="middle" class="svg-muted" font-size="12">TCP/TLS connection nahi bana</text>
</svg><p class="cap">Pehle specific exceptions pakdo aur RequestException aakhir mein. ConnectTimeout Timeout bhi hai aur connection problem bhi.</p></div>

<h3>Safe call pattern</h3>
<pre class="code">import requests

def get_json(url, auth, headers):
    try:
        r = requests.get(url, auth=auth, headers=headers, verify=False, timeout=5)
        r.raise_for_status()                          # 4xx/5xx -&gt; HTTPError
        return r.json()                               # JSON nahi -&gt; JSONDecodeError (ek ValueError)
    except requests.exceptions.HTTPError as err:
        print("API error:", err)                       # 401 Client Error: Unauthorized for url: ...
        print("   status:", err.response.status_code, "body:", err.response.text[:200])
    except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
        print("unreachable or too slow:", url)
    except ValueError:
        print("answer was not valid JSON:", url)
    return None                                       # caller tay karega aage kya karna hai</pre>
<p>Teen aadatein: <b>specific</b> exceptions pakdo, bare <code>except:</code> nahi jo typing mistakes chhupa de; troubleshoot karne layak print karo (URL, status code, body ka pehla hissa); aur <b>saaf failure value return karo</b> taaki loop agle device par chal sake. Order maayne rakhta hai: specific classes pehle, <code>requests.exceptions.RequestException</code> aakhir mein, requests jo bhi aur raise kare uske catch-all ke roop mein.</p>

<h3>Lab 2 kya dikhata hai</h3>
<p>Lab 2 ki audit script bina error handling ke shuru hoti hai. Fixes ke baad woh har router ke liye ek line print karti hai, aur har line batati hai kahan dekhna hai:</p>
<pre class="out">10.99.0.1 enabled: 2
10.99.0.2 API error: <span class="hl">404</span> Client Error: Not Found for url: .../ietf-interfaces:interfaces   (R2 par RESTCONF off)
10.99.0.3 API error: <span class="hl">401</span> Client Error: Unauthorized for url: .../ietf-interfaces:interfaces  (R3 par password mismatch)
10.99.0.4 <span class="hl">unreachable</span>                                                                (R4 par link shut)</pre>
<p>Dhyaan do exception type kya batata hai: <code>HTTPError</code> ka matlab router ne <i>jawab diya</i> aur mana kiya, yaani network chal raha hai aur problem API settings ya credentials mein hai. <code>ConnectionError</code>/<code>Timeout</code> ka matlab koi jawab nahi aaya, isliye pehle network test karo (ping, interface state).</p>

<h3>Sessions: calls ke beech settings share karo</h3>
<p><code>requests.Session()</code> settings yaad rakhta hai aur TCP/TLS connection reuse karta hai, jisse ek hi host par kai calls tez aur code chhota ho jaata hai. Reference snippet (lab interpreter mein sirf seedhi <code>requests.get</code> calls hain):</p>
<pre class="code">import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

s = requests.Session()
s.auth = ("netops", "NK@2026")                       # har call par jaata hai
s.headers.update({"Accept": "application/yang-data+json"})
s.verify = False                                      # sirf lab
retry = Retry(total=3, backoff_factor=1, status_forcelist=[429, 502, 503, 504],
              allowed_methods=["GET", "PUT", "DELETE"])        # sirf idempotent methods
s.mount("h&#116;tps://", HTTPAdapter(max_retries=retry))        # automatic back-off retries

for host in ROUTERS:
    r = s.get(f"h&#116;tps://{host}/restconf/data/ietf-interfaces:interfaces", timeout=5)
    ...</pre>
<p><code>Retry</code> object aapko chapter 7 ka back-off deta hai aur default mein <code>Retry-After</code> maanta hai. Yaad rakho: session aapke liye timeout nahi jodta; har call par <code>timeout=</code> do. <code>with requests.Session() as s:</code> use karo taaki connections band hon.</p>

<h3>Sirf print nahi, log karo</h3>
<p>Unattended chalne wali scripts ke liye <code>logging</code> module level aur timestamp ke saath use karo, har message mein device ka naam rakho, aur summary ke saath khatam karo: "38 ok, 2 failed: r7 (401), r19 (timeout)". Tokens ya passwords kabhi log mat karo. Kuch bhi fail ho to non-zero exit code (<code>sys.exit(1)</code>) do, taaki schedulers aur CI ko pata chale.</p>

<div class="warn"><p><b>Common mistakes.</b> Bare <code>except:</code> ya <code>except Exception: pass</code> jo har error chhupa deta hai; timeout nahi; status check karne se pehle <code>r.json()</code> call karna; maan lena ki 200 mein zaroori key hogi (<code>.get()</code> use karo ya check karo); adapter ke andar non-idempotent POSTs retry karna; sessions band na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>raise_for_status()</code> sirf 4xx aur 5xx par <code>requests.exceptions.HTTPError</code> raise karta hai; 2xx aur 3xx par kuch nahi karta. Fail hui connection <code>ConnectionError</code> raise karti hai, HTTPError nahi, kyunki koi HTTP response hi nahi tha.</p></div>

<div class="scn"><h4>Ek kharab router, poori raat gayi</h4><p>Ek overnight job ne seedhe <code>for</code> loop aur bina try/except ke 60 routers audit kiye. 01:12 par router 7 ne apne reload ke dauran 503 diya. Script pehli missing key par KeyError ke saath mar gayi, aur baaki 53 routers check hi nahi hue. Rewrite ne har router ko try/except mein lapeta, failure record karke aage badhi, 503 ko back-off ke saath do baar retry kiya, aur aakhir mein failure list print ki. Agli raat report poori thi, do clearly labelled failures ke saath.</p><p><b>Lesson:</b> Failures ko per device alag karo. Loop kisi bhi ek router se zyada jeena chahiye.</p></div>

<div class="iv"><p class="q">"requests-based script ko robust kaise banate ho?"</p><p>Hamesha timeout do; <code>raise_for_status()</code> call karo; calls ko specific exceptions (HTTPError, ConnectionError, Timeout, JSON errors) ke saath try/except mein lapeto aur agle device par chalo; sirf temporary errors back-off ke saath retry karo; shared auth aur headers ke liye Session use karo; failures ko device ke naam ke saath log karo, aur kuch fail ho to non-zero exit karo. Yeh bhi bolo ki verify=False sirf labs ke liye hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>requests by default 4xx/5xx par raise nahi karta; <code>raise_for_status()</code> call karo.</li>
<li>HTTPError = error code ke saath jawab; ConnectionError/Timeout = kaam ka jawab nahi; JSON/KeyError = ulti-seedhi body.</li>
<li>Specific exceptions order mein pakdo; bare except kabhi nahi.</li>
<li>Hamesha <code>timeout=</code> do; Session auth/headers share karta hai aur back-off ke saath retries jod sakta hai.</li>
<li>Failures ko per device alag karo, context ke saath log karo, aur summary report karo.</li>
</ul></div>
`}};export{e as default};