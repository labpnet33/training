var e={id:`scale`,h:{en:`Pagination, rate limits, retries, idempotency and timeouts`,hi:`Pagination, rate limits, retries, idempotency aur timeouts`},body:{en:`
<p>A bus conductor never lets 300 people board a 50-seat bus at once. Passengers go in groups (<b>pagination</b>), the gate lets only a few in per minute (<b>rate limiting</b>), and if the bus is full you wait and try the next one (<b>retry with back-off</b>). Real APIs behave the same way, because one careless script can overload a shared service. This chapter covers exam topic 2.4. The lab router has a small data set and no limits, so every snippet here is a <b>reference snippet</b> against the example service <code>api.example</code>, written to be correct and reusable.</p>

<h3>Pagination: getting a big list in pages</h3>
<p>A call such as "list all 12,000 clients" cannot return everything in one answer. The server returns one <b>page</b> and tells you how to get the next. Four common patterns:</p>
<div class="tbl"><table class="cmp"><tr><th>Pattern</th><th>Request looks like</th><th>You stop when</th></tr>
<tr><td>Offset and limit</td><td><code>?offset=100&amp;limit=50</code></td><td>a page returns fewer than limit items (or none)</td></tr>
<tr><td>Page number</td><td><code>?page=3&amp;per_page=50</code></td><td>an empty page, or page = total_pages</td></tr>
<tr><td>Cursor / token</td><td><code>?cursor=abc123</code> from the previous reply</td><td>the reply has no next cursor</td></tr>
<tr><td>Link header</td><td>follow the URL in <code>Link: &lt;...&gt;; rel="next"</code></td><td>no rel="next" link</td></tr></table></div>
<pre class="code">import requests
url = "h&#116;tps://api.example/v2/clients"
params = {"limit": 100}
clients = []
while url:
    r = requests.get(url, params=params, headers=HEADERS, timeout=10)
    r.raise_for_status()
    clients.extend(r.json()["items"])
    url = r.links.get("next", {}).get("url")   # requests parses the Link header for you
    params = None                              # the next URL already contains its query string
print(len(clients), "clients")</pre>
<p>Cursor style: <code>cursor = body.get("next_cursor")</code> and loop <code>while cursor</code>. Offset style: increase <code>offset</code> by <code>limit</code> until a page is short. Always <b>give the loop a guaranteed end</b> (a maximum page count) so a server bug cannot make you loop forever.</p>

<h3>Rate limiting: 429 Too Many Requests</h3>
<p>To protect itself, a service allows only N requests per time window per key. Above that you receive <b>429 Too Many Requests</b>, usually with:</p>
<ul>
<li><code>Retry-After</code>: how long to wait, in seconds (or as a date).</li>
<li>Often <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code> (common, not an official standard, so check the API reference).</li>
</ul>
<pre class="out">HTTP/1.1 <span class="hl">429 Too Many Requests</span>
Retry-After: 7
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
{"error": "rate limit exceeded, retry in 7 seconds"}</pre>
<p>The right reaction is to <b>stop and wait</b>, not to hammer harder. If <code>Retry-After</code> is present, obey it. If not, use <b>exponential back-off</b>: wait 1 s, then 2, 4, 8, 16, up to a cap, plus a little random <b>jitter</b> so that 50 scripts do not all retry at the same instant.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Exponential back-off">
<line x1="30" y1="120" x2="620" y2="120" stroke="#64748b"/>
<rect x="40" y="90" width="22" height="30" fill="#fde68a"/><text x="51" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 1</text>
<rect x="100" y="104" width="30" height="16" fill="#fed7aa"/><text x="115" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 1s</text>
<rect x="150" y="90" width="22" height="30" fill="#fde68a"/><text x="161" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 2</text>
<rect x="190" y="104" width="60" height="16" fill="#fed7aa"/><text x="220" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 2s</text>
<rect x="270" y="90" width="22" height="30" fill="#fde68a"/><text x="281" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 3</text>
<rect x="310" y="104" width="120" height="16" fill="#fed7aa"/><text x="370" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 4s</text>
<rect x="450" y="90" width="22" height="30" fill="#bbf7d0"/><text x="461" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 4: 200</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">429  429  429  200  (the waits double each time: 1, 2, 4 ...)</text>
</svg><p class="cap">Back-off gives an overloaded service room to recover. Jitter spreads many clients apart.</p></div>
<pre class="code">import random, time, requests

def get_with_backoff(url, tries=5, **kw):
    for attempt in range(tries):
        r = requests.get(url, timeout=10, **kw)
        if r.status_code not in (429, 502, 503, 504):
            return r                                   # success, or an error that retrying cannot fix
        wait = float(r.headers.get("Retry-After", 2 ** attempt))   # obey the server first
        time.sleep(min(wait, 60) + random.uniform(0, 0.5))          # cap + jitter
    r.raise_for_status()                               # still failing: raise
    return r</pre>

<h3>Retries: what is safe to repeat?</h3>
<ul>
<li><b>Retry</b>: 429, 502, 503, 504 and timeouts or connection errors. These are temporary.</li>
<li><b>Do not retry</b>: 400, 401, 403, 404, 405, 409, 415. The same request will fail the same way. Fix the request.</li>
<li><b>Limit</b> the attempts (3 to 5) and the total time.</li>
</ul>
<p>Retrying raises a danger: if a POST timed out, did the server create the item or not? This is where <b>idempotency</b> matters. A method is <b>idempotent</b> if doing it many times leaves the same result as doing it once. GET, PUT and DELETE are idempotent; <b>POST is not</b> (two POSTs can create two VLANs, two orders, two tickets); PATCH depends on the change. You saw this in the requests module: PUT of Loopback100 gave 201 the first time and 204 later, with the same final state. For an unsafe POST, many APIs accept an <code>Idempotency-Key: &lt;unique value&gt;</code> header: repeat the request with the same key and the server returns the first result instead of creating a second item. Without it, check first with a GET, or use PUT with a known name. On the lab router a repeated POST of an existing interface returns <b>409 Conflict</b> (Lab 1, call 5): the safe answer is "already there", not "do it again".</p>

<h3>Timeouts: never wait forever</h3>
<p>The requests library has <b>no default timeout</b>: a silent server can freeze your script for ever. Always pass one. A single number covers connect and read; a tuple separates them.</p>
<pre class="code">r = requests.get(url, timeout=10)             # 10 s for connect and 10 s for read
r = requests.get(url, timeout=(3.05, 20))     # 3 s to connect, 20 s to wait for data
# raises requests.exceptions.ConnectTimeout / ReadTimeout (both are requests.exceptions.Timeout)</pre>
<p>Lab 2's audit script passes <code>timeout=5</code>, and an unreachable router becomes a handled <code>unreachable</code> line, not a frozen terminal.</p>

<div class="warn"><p><b>Common mistakes.</b> Retrying a 400 or 401 in a loop; retrying forever; no jitter; ignoring Retry-After; reading only the first page and thinking the list is complete; blindly retrying a POST that creates things; no timeout at all.</p></div>
<div class="exam"><p><b>Exam trap.</b> 429 is "slow down, try later" (use Retry-After and back-off); 503 is "service temporarily unavailable"; 409 is a conflict (already exists), not a retry case. Idempotent: GET, PUT, DELETE (and HEAD, OPTIONS). Not idempotent: POST.</p></div>

<div class="scn"><h4>The inventory that stopped at 100</h4><p>An engineer's script listed devices from a cloud dashboard and reported "100 devices" for a site that had 340. The API returned the first page of 100 and a Link header with rel="next". The script never followed it. After adding the loop above, it reported 340. A week later the script triggered 429 errors because it fetched pages as fast as possible; a short pause between pages and obeying Retry-After fixed it.</p><p><b>Lesson:</b> A suspiciously round number (100, 50, 25) is a page size.</p></div>

<div class="iv"><p class="q">"How do you handle a 429 in a script?"</p><p>Treat it as temporary. Read the Retry-After header and wait that long; if it is missing, use exponential back-off with jitter and a maximum number of attempts. Make sure the request is safe to repeat (idempotent, or protected by an idempotency key), and log the wait. Better still, avoid hitting the limit: page politely, cache results and spread calls over time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Large lists come in pages: offset/limit, page number, cursor or Link header; always follow all pages.</li>
<li>429 means slow down: obey Retry-After, otherwise exponential back-off with jitter.</li>
<li>Retry only temporary failures (429, 502, 503, 504, timeouts); never 4xx caused by your request.</li>
<li>GET, PUT, DELETE are idempotent; POST is not, so protect it with a check or an idempotency key.</li>
<li>Always set a timeout: requests has none by default.</li>
</ul></div>
`,hi:`
<p>Bus conductor 50-seat bus mein 300 logon ko ek saath nahi chadhne deta. Yaatri groups mein chadhte hain (<b>pagination</b>), gate ek minute mein sirf kuch ko andar aane deta hai (<b>rate limiting</b>), aur bus bhari ho to aap ruk kar agli bus try karte ho (<b>back-off ke saath retry</b>). Real APIs bhi aise hi behave karti hain, kyunki ek laparwah script shared service ko overload kar sakti hai. Yeh chapter exam topic 2.4 cover karta hai. Lab router mein chhota data set hai aur koi limits nahi, isliye yahan har snippet example service <code>api.example</code> ke against ek <b>reference snippet</b> hai, jo sahi aur reuse karne layak likha gaya hai.</p>

<h3>Pagination: bada list pages mein lena</h3>
<p>"12,000 clients ki list do" jaisi call ek jawab mein sab kuch nahi laut sakti. Server ek <b>page</b> deta hai aur batata hai agla kaise lena hai. Chaar common patterns:</p>
<div class="tbl"><table class="cmp"><tr><th>Pattern</th><th>Request aisi dikhti hai</th><th>Kab rukna hai</th></tr>
<tr><td>Offset aur limit</td><td><code>?offset=100&amp;limit=50</code></td><td>page limit se kam items de (ya koi nahi)</td></tr>
<tr><td>Page number</td><td><code>?page=3&amp;per_page=50</code></td><td>khali page, ya page = total_pages</td></tr>
<tr><td>Cursor / token</td><td>pichhle reply ka <code>?cursor=abc123</code></td><td>reply mein next cursor nahi</td></tr>
<tr><td>Link header</td><td><code>Link: &lt;...&gt;; rel="next"</code> ka URL follow karo</td><td>rel="next" link nahi</td></tr></table></div>
<pre class="code">import requests
url = "h&#116;tps://api.example/v2/clients"
params = {"limit": 100}
clients = []
while url:
    r = requests.get(url, params=params, headers=HEADERS, timeout=10)
    r.raise_for_status()
    clients.extend(r.json()["items"])
    url = r.links.get("next", {}).get("url")   # requests Link header khud parse karta hai
    params = None                              # agle URL mein query string pehle se hai
print(len(clients), "clients")</pre>
<p>Cursor style: <code>cursor = body.get("next_cursor")</code> aur <code>while cursor</code> loop. Offset style: <code>offset</code> ko <code>limit</code> se badhao jab tak page chhota na aaye. Loop ko hamesha <b>pakka end</b> do (maximum page count) taaki server bug aapko hamesha ke liye loop mein na daal sake.</p>

<h3>Rate limiting: 429 Too Many Requests</h3>
<p>Apni raksha ke liye service har key ko ek time window mein sirf N requests deti hai. Isse upar aapko <b>429 Too Many Requests</b> milta hai, aam taur par ke saath:</p>
<ul>
<li><code>Retry-After</code>: kitni der rukna hai, seconds mein (ya date ke roop mein).</li>
<li>Aksar <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code> (common hain, official standard nahi, isliye API reference dekho).</li>
</ul>
<pre class="out">HTTP/1.1 <span class="hl">429 Too Many Requests</span>
Retry-After: 7
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
{"error": "rate limit exceeded, retry in 7 seconds"}</pre>
<p>Sahi reaction hai <b>ruko aur intezaar karo</b>, aur zor se maarna nahi. Agar <code>Retry-After</code> hai to use maano. Nahi hai to <b>exponential back-off</b> use karo: 1 s, phir 2, 4, 8, 16, ek cap tak, saath mein thoda random <b>jitter</b> taaki 50 scripts ek hi pal mein retry na karein.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Exponential back-off">
<line x1="30" y1="120" x2="620" y2="120" stroke="#64748b"/>
<rect x="40" y="90" width="22" height="30" fill="#fde68a"/><text x="51" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 1</text>
<rect x="100" y="104" width="30" height="16" fill="#fed7aa"/><text x="115" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 1s</text>
<rect x="150" y="90" width="22" height="30" fill="#fde68a"/><text x="161" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 2</text>
<rect x="190" y="104" width="60" height="16" fill="#fed7aa"/><text x="220" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 2s</text>
<rect x="270" y="90" width="22" height="30" fill="#fde68a"/><text x="281" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 3</text>
<rect x="310" y="104" width="120" height="16" fill="#fed7aa"/><text x="370" y="84" text-anchor="middle" class="svg-muted" font-size="12">wait 4s</text>
<rect x="450" y="90" width="22" height="30" fill="#bbf7d0"/><text x="461" y="140" text-anchor="middle" class="svg-muted" font-size="12">try 4: 200</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">429  429  429  200  (wait har baar double: 1, 2, 4 ...)</text>
</svg><p class="cap">Back-off overloaded service ko recover hone ki jagah deta hai. Jitter kai clients ko alag-alag faila deta hai.</p></div>
<pre class="code">import random, time, requests

def get_with_backoff(url, tries=5, **kw):
    for attempt in range(tries):
        r = requests.get(url, timeout=10, **kw)
        if r.status_code not in (429, 502, 503, 504):
            return r                                   # success, ya aisa error jo retry se theek nahi hota
        wait = float(r.headers.get("Retry-After", 2 ** attempt))   # pehle server ki maano
        time.sleep(min(wait, 60) + random.uniform(0, 0.5))          # cap + jitter
    r.raise_for_status()                               # abhi bhi fail: raise
    return r</pre>

<h3>Retries: kya repeat karna safe hai?</h3>
<ul>
<li><b>Retry karo</b>: 429, 502, 503, 504 aur timeouts ya connection errors. Yeh temporary hote hain.</li>
<li><b>Retry mat karo</b>: 400, 401, 403, 404, 405, 409, 415. Wahi request wahi tarah fail hogi. Request theek karo.</li>
<li>Attempts (3 se 5) aur total time ko <b>limit</b> karo.</li>
</ul>
<p>Retry ek khatra laata hai: agar POST timeout ho gaya, to server ne item banaya ya nahi? Yahan <b>idempotency</b> kaam aati hai. Method <b>idempotent</b> hai agar use kai baar karne ka result ek baar karne jaisa hi rahe. GET, PUT aur DELETE idempotent hain; <b>POST nahi</b> (do POST se do VLANs, do orders, do tickets ban sakte hain); PATCH change par depend karta hai. Requests module mein aapne yeh dekha: Loopback100 ka PUT pehli baar 201, baad mein 204, final state wahi. Unsafe POST ke liye kai APIs <code>Idempotency-Key: &lt;unique value&gt;</code> header leti hain: wahi key dobara bhejo to server pehla result lautata hai, doosra item nahi banata. Iske bina pehle GET se check karo, ya jaanne-pehchane naam ke saath PUT use karo. Lab router par maujooda interface ka repeated POST <b>409 Conflict</b> deta hai (Lab 1, call 5): safe jawab "pehle se hai" hai, "phir se karo" nahi.</p>

<h3>Timeouts: kabhi hamesha ke liye intezaar mat karo</h3>
<p>requests library mein <b>koi default timeout nahi</b> hota: chup server aapki script ko hamesha ke liye freeze kar sakta hai. Hamesha ek do. Ek number connect aur read dono cover karta hai; tuple unhe alag karta hai.</p>
<pre class="code">r = requests.get(url, timeout=10)             # connect ke liye 10 s aur read ke liye 10 s
r = requests.get(url, timeout=(3.05, 20))     # connect ke liye 3 s, data ke liye 20 s
# requests.exceptions.ConnectTimeout / ReadTimeout raise karta hai (dono requests.exceptions.Timeout hain)</pre>
<p>Lab 2 ki audit script <code>timeout=5</code> deti hai, aur unreachable router frozen terminal ki jagah handled <code>unreachable</code> line ban jaata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> 400 ya 401 ko loop mein retry karna; hamesha retry karna; jitter na hona; Retry-After ignore karna; sirf pehla page padh kar list poori maan lena; aisa POST andhadhund retry karna jo cheezein banata hai; timeout bilkul na dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> 429 matlab "dheere karo, baad mein try karo" (Retry-After aur back-off); 503 matlab "service temporarily unavailable"; 409 conflict hai (pehle se hai), retry case nahi. Idempotent: GET, PUT, DELETE (aur HEAD, OPTIONS). Idempotent nahi: POST.</p></div>

<div class="scn"><h4>Inventory jo 100 par ruk gayi</h4><p>Ek engineer ki script cloud dashboard se devices list karti thi aur 340 devices wali site ke liye "100 devices" report karti thi. API ne 100 ka pehla page aur rel="next" wala Link header diya tha. Script ne use kabhi follow nahi kiya. Upar wala loop jodne ke baad usne 340 report kiya. Ek hafte baad script 429 errors laane lagi kyunki woh pages jitni tezi se ho sake utni tezi se fetch karti thi; pages ke beech chhota pause aur Retry-After maanne se theek ho gaya.</p><p><b>Lesson:</b> Shak wali round sankhya (100, 50, 25) page size hoti hai.</p></div>

<div class="iv"><p class="q">"Script mein 429 kaise handle karte ho?"</p><p>Ise temporary maano. Retry-After header padho aur utni der ruko; na ho to exponential back-off with jitter aur maximum attempts use karo. Dhyaan rakho ki request repeat karna safe ho (idempotent, ya idempotency key se protected), aur wait ko log karo. Behtar yeh ki limit tak pahunchte hi nahi: tameez se page karo, results cache karo aur calls ko time par failao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bade lists pages mein aate hain: offset/limit, page number, cursor ya Link header; hamesha saare pages follow karo.</li>
<li>429 matlab dheere karo: Retry-After maano, warna jitter ke saath exponential back-off.</li>
<li>Sirf temporary failures retry karo (429, 502, 503, 504, timeouts); aapki request se hue 4xx kabhi nahi.</li>
<li>GET, PUT, DELETE idempotent hain; POST nahi, isliye use check ya idempotency key se protect karo.</li>
<li>Hamesha timeout do: requests mein default nahi hota.</li>
</ul></div>
`}};export{e as default};