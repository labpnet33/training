var e={id:`first-app`,h:{en:`Your first FastAPI app and the uvicorn server`,hi:`Aapka pehla FastAPI app aur uvicorn server`},body:{en:`
<p>A <b>web server</b> is a program that stands at a door, a TCP port, and waits. When a request arrives it reads it, finds the right function, runs it and sends the answer back. In this chapter you build the smallest useful service, start it, look at it from outside with <code>curl</code>, and learn the one habit that saves most beginners an hour: <b>after every change to the code, stop the server and start it again</b>.</p>

<h3>The first app</h3>
<p>This is step 2 of Lab 1. The file is <code>api.py</code> on AUTO01:</p>
<pre class="code">"""api.py - our own automation API"""
from fastapi import FastAPI

app = FastAPI(title="NK Network API", version="1.0")


@app.get("/health")
def health():
    return {"status": "ok"}</pre>
<p><code>FastAPI(...)</code> creates the application object, here called <code>app</code>. The <b>decorator</b> <code>@app.get("/health")</code> registers the function under the path <code>/health</code> for the GET method. Whatever the function returns, a dictionary here, FastAPI converts to JSON. The <code>title</code> and <code>version</code> end up in the documentation that FastAPI builds from your code.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Life of one request"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">curl</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">or requests</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">port 8000</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">finds the route</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">health()</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">your function</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">JSON</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">back to caller</text></svg></div>
<h3>Start it with uvicorn</h3>
<pre class="code"><span class="c"># start the server in the background, log to api.log</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre>
<p>Read the command from left to right. <code>api:app</code> means "in the module <code>api</code> (the file <code>api.py</code>, without the extension) take the variable <code>app</code>". <code>--host 0.0.0.0</code> listens on every interface of AUTO01; the default <code>127.0.0.1</code> would accept only calls from AUTO01 itself. <code>--port 8000</code> is the door. The tail <code>&gt; api.log 2&gt;&amp;1 &amp;</code> sends all messages to <code>api.log</code> and runs the server in the background, so your terminal is free for the next command.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> The code and the command are exactly what you would type on a real Linux host. Two lab differences: first, in the lab the server runs as a background process of AUTO01 and answers <code>curl</code>, <code>requests</code> and <code>ht&#116;px</code> calls from any lab host; there is no browser, so <code>/docs</code> returns its HTML page but you cannot click through it. Second, the lab serves one request at a time on a virtual clock, so you cannot see concurrency. Real uvicorn handles many requests at once and stays in the foreground until Ctrl+C.</p></div>

<h3>Look at it from outside</h3>
<pre class="out">AUTO01$ curl -s localhost:8000/health
{"status":"ok"}</pre><pre class="out">AUTO01$ curl -i localhost:8000/health
<span class="hl">HT&#84;P/1.1 200 OK</span>
date: Tue, 29 Sep 2026 03:30:51 GMT
server: uvicorn
content-length: 15
<span class="hl">content-type: application/json</span>

{"status":"ok"}</pre>
<p>The first call shows the body. The second, with <code>-i</code>, shows the status line and the headers: <code>200 OK</code>, <code>server: uvicorn</code>, and a content type of <code>application/json</code> that FastAPI set for you. Now ask the server to describe itself:</p>
<pre class="out">AUTO01$ curl -s localhost:8000/openapi.json
<span class="hl">{"openapi":"3.1.0","info":{"title":"NK Network API","version":"1.0"},"paths":{"/health":{"get":{"summary":"Health","operationId":"health_health_get","responses":{"200":{"description":"Successful Response","content":{"application/json":{"schema":{}}}}}}}}}</span></pre>
<p>This is the <b>OpenAPI document</b>. It lists the paths, the methods and (later) every field of every model. The version you typed in <code>FastAPI(...)</code> is in <code>info</code>. The pretty page at <code>/docs</code> (Swagger UI) and the alternative <code>/redoc</code> are both drawn from this one JSON file, so the documentation can never drift away from the code.</p>

<h3>Is it really listening?</h3>
<pre class="out">AUTO01$ ss -tlnp | grep 8000
<span class="hl">tcp   LISTEN 0      4096         0.0.0.0:8000        0.0.0.0:*    users:(("uvicorn",pid=2306,fd=6))</span></pre><pre class="out">AUTO01$ ps aux | grep uvicorn
netadmin     2306  0.4  2.1 123456 12345 ?        Ss   09:00   0:00 /usr/bin/python3 /usr/local/bin/uvicorn api:app --host 0.0.0.0 --port 8000</pre><pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2306]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
<span class="hl">INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)</span>
INFO:     127.0.0.1:50010 - "GET /health HT&#84;P/1.1" 200 OK
INFO:     127.0.0.1:51235 - "GET /health HT&#84;P/1.1" 200 OK
INFO:     127.0.0.1:47548 - "GET /openapi.json HT&#84;P/1.1" 200 OK</pre>
<p>Three views of the same fact: a socket in LISTEN state on <code>0.0.0.0:8000</code>, a process called uvicorn, and the log line <code>Uvicorn running on ...</code>. When something does not answer, go through exactly these three: is there a process, is it listening on the port you expect, and what does the log say.</p>
<pre class="out">AUTO01$ python3 -c "import uvicorn, fastapi, pydantic, netmiko; print(fastapi.__version__, pydantic.VERSION, uvicorn.__version__)"
0.115.0 2.7.1 0.30.6</pre>
<p>The lab runs FastAPI 0.115.0, pydantic 2.7.1 and uvicorn 0.30.6. On your own machine install them with <code>pip install fastapi uvicorn</code> (plus <code>ht&#116;px</code> for tests, chapter 8) and check the versions the same way.</p>

<h3>def or async def?</h3>
<p>FastAPI accepts both. A plain <code>def</code> handler runs in a worker thread, so a slow call inside it (an SSH session to a router, for example) does not freeze the server. An <code>async def</code> handler runs on the event loop itself: it is right only when everything slow inside it is awaited. netmiko is a blocking library, so every handler that calls it in this module is a plain <code>def</code>. Putting netmiko in an <code>async def</code> is a classic way to make the whole API stall while one router answers slowly.</p>

<h3>Restart after every change</h3>
<p>Uvicorn imports <code>api.py</code> once, at start, and keeps that code in memory. Edit the file and the running server still serves the old version. Stop it and start it again:</p>
<pre class="code"><span class="c"># stop every uvicorn process of this user</span>
pkill -f uvicorn</pre><pre class="code"><span class="c"># start the server in the background, log to api.log</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre>
<div class="warn"><p><b>Common mistake.</b> Editing <code>api.py</code>, calling the API and wondering why nothing changed. Check the process start time or just restart. Starting a second copy without stopping the first fails with <code>address already in use</code> (you meet that error in Lab 2). On a real machine <code>uvicorn api:app --reload</code> restarts for you while you develop; never use it in production.</p></div>
<div class="exam"><p><b>Exam trap.</b> The argument is <code>module:variable</code>, so <code>uvicorn api:app</code>, not <code>uvicorn api.py</code> and not <code>uvicorn api</code>. And <code>--host 0.0.0.0</code> exposes the API to the network; the default <code>127.0.0.1</code> does not.</p></div>

<div class="scn"><h4>The fix that did nothing</h4><p>An engineer corrected a typo in a route, saved the file and tested again: same wrong answer. He spent forty minutes comparing request bodies. The server had been started three days earlier; <code>ps</code> showed the old start time. One <code>pkill</code> and one start later the fix worked.</p><p><b>Lesson:</b> when the behaviour does not match the code, first prove which code is running.</p></div>

<div class="iv"><p class="q">"What does <code>uvicorn api:app</code> do, and why do you need uvicorn at all?"</p><p>FastAPI is a framework; it does not open a port. Uvicorn is the ASGI server: it listens on the port, parses the web request and calls the <code>app</code> object in module <code>api</code>. So <code>api:app</code> means module <code>api</code>, variable <code>app</code>. In production I would run it as a service, behind a reverse proxy that terminates TLS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@app.get("/path")</code> turns a function into a route; the returned dictionary becomes JSON.</li>
<li><code>uvicorn module:variable --host --port</code> starts the server; <code>0.0.0.0</code> means "reachable from the network".</li>
<li>FastAPI writes the OpenAPI document and the <code>/docs</code> page for you.</li>
<li>Check a service in three steps: process, listening socket, log.</li>
<li>Use plain <code>def</code> for blocking libraries such as netmiko, and restart uvicorn after every code change.</li>
</ul></div>
`,hi:`
<p><b>Web server</b> ek program hai jo darwaze, yaani TCP port, par khada intezaar karta hai. Request aati hai to woh use padhta hai, sahi function dhoondhta hai, chalata hai aur jawab wapas bhejta hai. Is chapter mein aap sabse chhoti kaam ki service banaoge, chalaoge, <code>curl</code> se bahar se dekhoge, aur woh ek aadat seekhoge jo zyadatar beginners ka ek ghanta bachati hai: <b>code mein har change ke baad server ko stop karke dobara start karo</b>.</p>

<h3>Pehla app</h3>
<p>Yeh Lab 1 ka step 2 hai. File AUTO01 par <code>api.py</code> hai:</p>
<pre class="code">"""api.py - our own automation API"""
from fastapi import FastAPI

app = FastAPI(title="NK Network API", version="1.0")


@app.get("/health")
def health():
    return {"status": "ok"}</pre>
<p><code>FastAPI(...)</code> application object banata hai, jise yahan <code>app</code> kaha hai. <b>Decorator</b> <code>@app.get("/health")</code> function ko GET method ke liye path <code>/health</code> par register karta hai. Function jo bhi lautata hai, yahan ek dictionary, FastAPI use JSON mein badal deta hai. <code>title</code> aur <code>version</code> us documentation mein jaate hain jo FastAPI aapke code se banata hai.</p>
<div class="dia"><svg viewBox="0 0 640 88" role="img" aria-label="Ek request ki zindagi"><rect x="8" y="12" width="104" height="64" rx="10" fill="#bae6fd"/><text x="60" y="42" text-anchor="middle" class="svg-ink" font-size="13">curl</text><text x="60" y="59" text-anchor="middle" class="svg-muted" font-size="11">ya requests</text><line x1="112" y1="44" x2="138" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="138,44 131,40 131,48" fill="#64748b"/><rect x="138" y="12" width="104" height="64" rx="10" fill="#ddd6fe"/><text x="190" y="42" text-anchor="middle" class="svg-ink" font-size="13">uvicorn</text><text x="190" y="59" text-anchor="middle" class="svg-muted" font-size="11">port 8000</text><line x1="242" y1="44" x2="268" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="268,44 261,40 261,48" fill="#64748b"/><rect x="268" y="12" width="104" height="64" rx="10" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">FastAPI</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="11">route dhoondhta</text><line x1="372" y1="44" x2="398" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="398,44 391,40 391,48" fill="#64748b"/><rect x="398" y="12" width="104" height="64" rx="10" fill="#bbf7d0"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">health()</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="11">aapka function</text><line x1="502" y1="44" x2="528" y2="44" stroke="#64748b" stroke-width="2"/><polygon points="528,44 521,40 521,48" fill="#64748b"/><rect x="528" y="12" width="104" height="64" rx="10" fill="#fed7aa"/><text x="580" y="42" text-anchor="middle" class="svg-ink" font-size="13">JSON</text><text x="580" y="59" text-anchor="middle" class="svg-muted" font-size="11">caller ko wapas</text></svg></div>
<h3>uvicorn se start karo</h3>
<pre class="code"><span class="c"># start the server in the background, log to api.log</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre>
<p>Command ko left se right padho. <code>api:app</code> ka matlab "module <code>api</code> mein (file <code>api.py</code>, extension ke bina) variable <code>app</code> lo". <code>--host 0.0.0.0</code> AUTO01 ke har interface par sunta hai; default <code>127.0.0.1</code> sirf AUTO01 ke apne calls leta. <code>--port 8000</code> darwaza hai. Aakhri hissa <code>&gt; api.log 2&gt;&amp;1 &amp;</code> saare messages <code>api.log</code> mein bhejta hai aur server ko background mein chalata hai, isliye terminal agle command ke liye free rehta hai.</p>
<div class="note"><p><b>In the lab vs on real systems.</b> Code aur command bilkul wahi hain jo asli Linux host par type karoge. Lab ke do farq: pehla, lab mein server AUTO01 ka background process hai aur kisi bhi lab host ke <code>curl</code>, <code>requests</code> aur <code>ht&#116;px</code> calls ka jawab deta hai; browser nahi hai, isliye <code>/docs</code> apna HTML page deta hai par aap click karke nahi ghoom sakte. Doosra, lab ek time mein ek request serve karta hai virtual clock par, isliye concurrency nahi dikhti. Asli uvicorn kai requests ek saath handle karta hai aur Ctrl+C tak foreground mein rehta hai.</p></div>

<h3>Bahar se dekho</h3>
<pre class="out">AUTO01$ curl -s localhost:8000/health
{"status":"ok"}</pre><pre class="out">AUTO01$ curl -i localhost:8000/health
<span class="hl">HT&#84;P/1.1 200 OK</span>
date: Tue, 29 Sep 2026 03:30:51 GMT
server: uvicorn
content-length: 15
<span class="hl">content-type: application/json</span>

{"status":"ok"}</pre>
<p>Pehli call body dikhati hai. Doosri, <code>-i</code> ke saath, status line aur headers dikhati hai: <code>200 OK</code>, <code>server: uvicorn</code>, aur <code>application/json</code> content type jo FastAPI ne aapke liye set kiya. Ab server se kaho ki apna description de:</p>
<pre class="out">AUTO01$ curl -s localhost:8000/openapi.json
<span class="hl">{"openapi":"3.1.0","info":{"title":"NK Network API","version":"1.0"},"paths":{"/health":{"get":{"summary":"Health","operationId":"health_health_get","responses":{"200":{"description":"Successful Response","content":{"application/json":{"schema":{}}}}}}}}}</span></pre>
<p>Yeh <b>OpenAPI document</b> hai. Isme paths, methods aur (aage) har model ki har field hoti hai. <code>FastAPI(...)</code> mein jo version likha woh <code>info</code> mein hai. <code>/docs</code> (Swagger UI) ka sundar page aur alternative <code>/redoc</code> dono isi ek JSON file se bante hain, isliye documentation code se kabhi alag nahi ho sakta.</p>

<h3>Kya sach mein sun raha hai?</h3>
<pre class="out">AUTO01$ ss -tlnp | grep 8000
<span class="hl">tcp   LISTEN 0      4096         0.0.0.0:8000        0.0.0.0:*    users:(("uvicorn",pid=2306,fd=6))</span></pre><pre class="out">AUTO01$ ps aux | grep uvicorn
netadmin     2306  0.4  2.1 123456 12345 ?        Ss   09:00   0:00 /usr/bin/python3 /usr/local/bin/uvicorn api:app --host 0.0.0.0 --port 8000</pre><pre class="out">AUTO01$ cat api.log
INFO:     Started server process [2306]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
<span class="hl">INFO:     Uvicorn running on ht&#116;p://0.0.0.0:8000 (Press CTRL+C to quit)</span>
INFO:     127.0.0.1:50010 - "GET /health HT&#84;P/1.1" 200 OK
INFO:     127.0.0.1:51235 - "GET /health HT&#84;P/1.1" 200 OK
INFO:     127.0.0.1:47548 - "GET /openapi.json HT&#84;P/1.1" 200 OK</pre>
<p>Ek hi fact ke teen view: <code>0.0.0.0:8000</code> par LISTEN state ka socket, uvicorn naam ka process, aur log line <code>Uvicorn running on ...</code>. Kuch jawab na de to bilkul yahi teen check karo: process hai, kya expected port par sun raha hai, aur log kya kehta hai.</p>
<pre class="out">AUTO01$ python3 -c "import uvicorn, fastapi, pydantic, netmiko; print(fastapi.__version__, pydantic.VERSION, uvicorn.__version__)"
0.115.0 2.7.1 0.30.6</pre>
<p>Lab FastAPI 0.115.0, pydantic 2.7.1 aur uvicorn 0.30.6 chalata hai. Apni machine par <code>pip install fastapi uvicorn</code> se install karo (aur tests ke liye <code>ht&#116;px</code>, chapter 8) aur versions isi tarah check karo.</p>

<h3>def ya async def?</h3>
<p>FastAPI dono leta hai. Plain <code>def</code> handler worker thread mein chalta hai, isliye uske andar ki dheemi call (jaise router par SSH session) server ko freeze nahi karti. <code>async def</code> handler event loop par hi chalta hai: woh tabhi sahi hai jab andar ki har dheemi cheez await ki jaye. netmiko blocking library hai, isliye is module ka har handler jo use bulata hai plain <code>def</code> hai. Netmiko ko <code>async def</code> mein rakhna poore API ko atkaane ka classic tareeka hai, jab ek router dheere jawab deta hai.</p>

<h3>Har change ke baad restart</h3>
<p>Uvicorn <code>api.py</code> ko start par ek baar import karta hai aur woh code memory mein rakhta hai. File badal do, chalta hua server phir bhi purana version serve karta hai. Stop karo aur dobara start karo:</p>
<pre class="code"><span class="c"># stop every uvicorn process of this user</span>
pkill -f uvicorn</pre><pre class="code"><span class="c"># start the server in the background, log to api.log</span>
uvicorn api:app --host 0.0.0.0 --port 8000 &gt; api.log 2&gt;&amp;1 &amp;</pre>
<div class="warn"><p><b>Common mistake.</b> <code>api.py</code> edit karna, API bulana aur sochna ki kuch badla kyon nahi. Process ka start time dekho ya seedha restart karo. Pehli copy ko roke bina doosri start karoge to <code>address already in use</code> se fail hoga (yeh error Lab 2 mein milega). Asli machine par <code>uvicorn api:app --reload</code> development ke dauran khud restart karta hai; production mein kabhi use mat karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Argument <code>module:variable</code> hai, yaani <code>uvicorn api:app</code>, <code>uvicorn api.py</code> nahi aur <code>uvicorn api</code> bhi nahi. Aur <code>--host 0.0.0.0</code> API ko network par expose karta hai; default <code>127.0.0.1</code> nahi karta.</p></div>

<div class="scn"><h4>Woh fix jisne kuch nahi kiya</h4><p>Ek engineer ne route ka typo theek kiya, file save ki aur dobara test kiya: wahi galat jawab. Usne chalis minute request bodies compare karne mein lagaye. Server teen din pehle start hua tha; <code>ps</code> mein purana start time dikh raha tha. Ek <code>pkill</code> aur ek start ke baad fix chal gaya.</p><p><b>Lesson:</b> behaviour code se match na kare to pehle saabit karo ki kaunsa code chal raha hai.</p></div>

<div class="iv"><p class="q">"<code>uvicorn api:app</code> kya karta hai, aur uvicorn chahiye hi kyon?"</p><p>FastAPI framework hai; woh port nahi kholta. Uvicorn ASGI server hai: woh port par sunta hai, web request parse karta hai aur module <code>api</code> ke <code>app</code> object ko bulata hai. Isliye <code>api:app</code> ka matlab module <code>api</code>, variable <code>app</code>. Production mein main use service ki tarah chalaunga, ek reverse proxy ke peeche jo TLS terminate kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>@app.get("/path")</code> function ko route banata hai; lautayi hui dictionary JSON ban jaati hai.</li>
<li><code>uvicorn module:variable --host --port</code> server start karta hai; <code>0.0.0.0</code> ka matlab "network se reachable".</li>
<li>FastAPI OpenAPI document aur <code>/docs</code> page aapke liye likhta hai.</li>
<li>Service teen step mein check karo: process, listening socket, log.</li>
<li>Netmiko jaisi blocking libraries ke liye plain <code>def</code> use karo, aur har code change ke baad uvicorn restart karo.</li>
</ul></div>
`}};export{e as default};