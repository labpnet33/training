var e={id:`apis-python`,h:{en:`Security APIs and automation: reading Python that calls Cisco APIs`,hi:`Security APIs aur automation: Cisco APIs call karne wala Python padhna`},body:{en:`
<p>An API is a service counter with strict rules. You show your pass at the first window and receive a token (<b>authentication</b>). At the second window you hand over a form (<b>request</b>): which department (the <b>URL path</b>), what you want done (the <b>HTTP method</b>) and the details (the <b>JSON body</b>). You get back a stamped reply (<b>status code</b>) and a printed answer (<b>JSON response</b>). The exam shows short Python scripts and asks what they do; the lab makes you read and run four of them.</p>

<h3>Read every script in five steps</h3>
<ol><li><b>Where</b>: base URL and path.</li><li><b>How authenticated</b>: Basic, bearer token, custom header.</li><li><b>Which method</b>: GET reads, POST creates or adds, PUT/PATCH changes, DELETE removes.</li><li><b>What body</b>: <code>json=</code> sends JSON; <code>data=</code> sends a form.</li><li><b>What is printed</b>: which keys of the JSON it reads.</li></ol>

<h3>Python you must recognise</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th></tr>
<tr><td><code>requests.post(url, auth=(id, secret))</code></td><td>HTTP Basic authentication with those two values</td></tr>
<tr><td><code>headers={"Authorization": f"Bearer {token}"}</code></td><td>OAuth bearer token in a request header; <code>f"..."</code> inserts variables</td></tr>
<tr><td><code>json=payload</code> / <code>data={...}</code></td><td>JSON body with Content-Type application/json / form-encoded body</td></tr>
<tr><td><code>params={"limit": 25}</code></td><td>Query string: <code>?limit=25</code></td></tr>
<tr><td><code>r.status_code</code>, <code>r.raise_for_status()</code></td><td>The number; raise an exception on 4xx or 5xx</td></tr>
<tr><td><code>r.json()["data"]</code>, <code>r.headers["X-auth-access-token"]</code></td><td>Parse the JSON body into dicts and lists; read a response header</td></tr>
<tr><td><code>sys.argv[1]</code>, <code>os.environ.get("SA_CLIENT_ID")</code></td><td>First command-line argument; a value from the environment (keeps secrets out of the file)</td></tr>
</table>

<h3>Four authentication models</h3>
<table class="cmp"><tr><th>API</th><th>How you get in</th></tr>
<tr><td><b>Secure Access</b> and <b>Umbrella</b></td><td>OAuth 2.0 <b>client credentials</b>: POST API key and secret as Basic auth to <code>/auth/v2/token</code> with <code>grant_type=client_credentials</code>; receive <code>access_token</code> (expires_in 3600); send <code>Authorization: Bearer</code></td></tr>
<tr><td><b>Secure Firewall Management Center</b></td><td>POST Basic auth to <code>/api/fmc_platform/v1/auth/generatetoken</code>; the token comes back in the <b>response header</b> <code>X-auth-access-token</code> with <code>DOMAIN_UUID</code>; send it in the same header name; tokens last 30 minutes</td></tr>
<tr><td><b>Secure Endpoint</b> (API v1)</td><td>HTTP Basic with the API client ID and API key on every call, for example GET <code>/v1/computers</code></td></tr>
<tr><td><b>Cisco XDR</b></td><td>OAuth client credentials for a bearer token, then Threat Response (IROH) endpoints such as <code>/iroh/iroh-enrich/observe/observables</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OAuth client credentials flow">
<rect x="10" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="13">AUTOMATION</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="12">python3 script</text>
<rect x="470" y="15" width="160" height="56" rx="8" fill="#fde68a"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">/auth/v2/token</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">returns token</text>
<rect x="470" y="150" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="175" text-anchor="middle" class="svg-ink" font-size="13">/policies/v2/...</text><text x="550" y="193" text-anchor="middle" class="svg-muted" font-size="12">destination lists</text>
<line x1="160" y1="95" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><text x="300" y="58" text-anchor="middle" class="svg-accent" font-size="12">1 POST key + secret (Basic)</text>
<line x1="470" y1="60" x2="160" y2="108" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="12">2 access_token, 3600 s</text>
<line x1="160" y1="125" x2="470" y2="178" stroke="#64748b" stroke-width="2"/><text x="300" y="172" text-anchor="middle" class="svg-accent" font-size="12">3 Authorization: Bearer token</text>
</svg><p class="cap">Client credentials: exchange the key for a short-lived token, then use the token on every API call.</p></div>

<h3>Lab walk-through, script by script</h3>
<p><b>Task 1:</b> <code>cat sa_get_token.py</code>. The lab file writes the base address in full; below it is split into variables:</p>
<pre class="code">HOST = "api.sse.cisco.com"
BASE = f"{SCHEME}://{HOST}"      <span class="c"># SCHEME = the TLS web scheme</span>
CLIENT_ID = os.environ.get("SA_CLIENT_ID", "7c1e0a9b54d44f0e9a1b2c3d4e5f6a7b")
CLIENT_SECRET = os.environ.get("SA_CLIENT_SECRET", "not-in-git")

def get_token():
    r = requests.post(f"{BASE}/auth/v2/token",
                      auth=(CLIENT_ID, CLIENT_SECRET),     <span class="c"># HTTP Basic: key + secret</span>
                      data={"grant_type": "client_credentials"},
                      timeout=10)
    r.raise_for_status()
    return r.json()["access_token"]</pre>
<p>The grant type is <b>client_credentials</b>. Running it prints:</p>
<pre class="out">AUTOMATION&gt; python3 sa_get_token.py
<span class="hl">HTTP 200 - token received</span>
token_type : Bearer
expires_in : 3600 seconds
access_token: eyJhbGciOiJSUzI1NiIsInR5...</pre>
<p><b>Task 2:</b> <code>python3 sa_list_destlists.py</code> does a GET on <code>/policies/v2/destinationlists</code> and loops over <code>r.json()["data"]</code>:</p>
<pre class="out">GET /policies/v2/destinationlists -&gt; 200
  17749001  Global Block List      access=block  destinations=0
  17749002  Global Allow List      access=allow  destinations=0
<span class="hl">  17749231  IR-Blocklist           access=block  destinations=2</span></pre>
<p><b>Task 3 and 4:</b> <code>sa_block_domain.py</code> builds <code>headers = {"Authorization": f"Bearer {get_token()}", "Content-Type": "application/json"}</code>, takes the domain from <code>sys.argv[1]</code>, and POSTs <code>[{"destination": DOMAIN, "comment": "INC-2231 C2 beacon"}]</code> to <code>f"{BASE}/policies/v2/destinationlists/{LIST_ID}/destinations"</code>. The token travels in the <b>Authorization</b> header.</p>
<pre class="out">AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
POST h&#116;tps://api.sse.cisco.com/policies/v2/destinationlists/17749231/destinations <span class="hl">-&gt; 200</span>
{'status': {'code': 200, 'text': 'OK'}, 'data': {'id': 17749231, 'name': 'IR-Blocklist', 'access': 'block', 'isGlobal': False, 'meta': {'destinationCount': <span class="hl">3</span>}}}</pre>
<p>Verify in the SECURE-ACCESS console under Resources, Destination Lists: IR-Blocklist now contains k7x2qvz9lm.example.</p>
<p><b>Task 5:</b> <code>fmc_list_policies.py</code> reads <code>token = r.headers["X-auth-access-token"]</code> and <code>domain = r.headers["DOMAIN_UUID"]</code>, then GETs <code>/api/fmc_config/v1/domain/{domain}/policy/accesspolicies</code> with <code>params={"limit": 25}</code> and prints each item's name and id. The FMC request header is <b>X-auth-access-token</b>, not Authorization.</p>

<div class="eg"><p><b>Worked example: an XDR enrichment script.</b> <code>obs = [{"type": "domain", "value": "k7x2qvz9lm.example"}]</code> is POSTed with a bearer token to the enrich endpoint. The loop <code>for module in r.json()["data"]</code> visits each integration module (Talos, Secure Endpoint, Umbrella...) and prints <code>v["disposition_name"]</code> from its verdicts, for example "Malicious". Reading it takes 30 seconds once you follow the five steps.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hard-coding the API secret in the script and committing it to git (use environment variables or a vault). Using <code>verify=False</code> in production, which disables TLS certificate checking. Reusing a token after it expires. Confusing <code>data=</code> with <code>json=</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> FMC: token in a <b>response header</b>, sent back as <code>X-auth-access-token</code>, and every config path contains the <b>domain UUID</b>. Secure Access and Umbrella: <b>client credentials</b>, then <b>Bearer</b>. POST to <code>.../destinations</code> adds domains; DELETE removes them. <code>json=</code> sets Content-Type automatically.</p></div>

<div class="scn"><h4>The script that blocked a partner</h4><p>An analyst ran a block script with a domain copied from a report but mistyped the argument order, so the script used its default domain and blocked a partner's portal. The team changed the script to require an argument, print the target and ask for confirmation, log every API call with the ticket number in the comment field, and restricted the API key's scope to the one incident destination list.</p><p><b>Lesson:</b> automation multiplies mistakes as fast as good actions; validate input, log, and give API keys the smallest scope.</p></div>

<div class="iv"><p class="q">"Here is a Python script that calls a security API. Tell me what it does."</p><p>Use the five steps aloud: the base URL and path, the authentication method (Basic, bearer, FMC header), the HTTP method, the body and the fields printed from the JSON. State the effect in one sentence ("it adds this domain to destination list 17749231 and prints the new count"), then mention what could go wrong: expired token (401), missing scope (403), wrong ID (404), bad body (400), rate limit (429).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read scripts in five steps: where, how authenticated, method, body, output.</li>
<li>Secure Access and Umbrella: OAuth client_credentials, then Authorization: Bearer.</li>
<li>FMC: token in the X-auth-access-token response header, domain UUID in every path, paged items.</li>
<li>Secure Endpoint v1 uses Basic auth per call; XDR uses a bearer token and IROH enrich endpoints.</li>
<li>Lab answers: client_credentials, list ID 17749231, Authorization header, POST 200, X-auth-access-token.</li>
</ul></div>
`,hi:`
<p>API sakht rules wala ek service counter hai. Pehli khidki par aap apna pass dikhate ho aur token lete ho (<b>authentication</b>). Doosri khidki par ek form dete ho (<b>request</b>): kaunsa department (<b>URL path</b>), kya karwana hai (<b>HTTP method</b>) aur details (<b>JSON body</b>). Aapko stamp laga jawab (<b>status code</b>) aur printed answer (<b>JSON response</b>) milta hai. Exam chhoti Python scripts dikhakar poochta hai woh kya karti hain; lab aapse chaar scripts padhwata aur chalwata hai.</p>

<h3>Har script paanch steps mein padho</h3>
<ol><li><b>Kahan</b>: base URL aur path.</li><li><b>Kaise authenticated</b>: Basic, bearer token, custom header.</li><li><b>Kaunsa method</b>: GET padhta hai, POST banata ya jodta hai, PUT/PATCH badalta hai, DELETE hatata hai.</li><li><b>Kya body</b>: <code>json=</code> JSON bhejta hai; <code>data=</code> form bhejta hai.</li><li><b>Kya print hota hai</b>: JSON ki kaunsi keys padhti hai.</li></ol>

<h3>Python jo aapko pehchanna hai</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th></tr>
<tr><td><code>requests.post(url, auth=(id, secret))</code></td><td>Un do values ke saath HTTP Basic authentication</td></tr>
<tr><td><code>headers={"Authorization": f"Bearer {token}"}</code></td><td>Request header mein OAuth bearer token; <code>f"..."</code> variables daalta hai</td></tr>
<tr><td><code>json=payload</code> / <code>data={...}</code></td><td>Content-Type application/json ke saath JSON body / form-encoded body</td></tr>
<tr><td><code>params={"limit": 25}</code></td><td>Query string: <code>?limit=25</code></td></tr>
<tr><td><code>r.status_code</code>, <code>r.raise_for_status()</code></td><td>Number; 4xx ya 5xx par exception raise</td></tr>
<tr><td><code>r.json()["data"]</code>, <code>r.headers["X-auth-access-token"]</code></td><td>JSON body ko dicts aur lists mein parse karo; response header padho</td></tr>
<tr><td><code>sys.argv[1]</code>, <code>os.environ.get("SA_CLIENT_ID")</code></td><td>Pehla command-line argument; environment se value (secrets file ke bahar rehte hain)</td></tr>
</table>

<h3>Chaar authentication models</h3>
<table class="cmp"><tr><th>API</th><th>Andar kaise jaate ho</th></tr>
<tr><td><b>Secure Access</b> aur <b>Umbrella</b></td><td>OAuth 2.0 <b>client credentials</b>: API key aur secret ko Basic auth ki tarah <code>/auth/v2/token</code> par <code>grant_type=client_credentials</code> ke saath POST karo; <code>access_token</code> milta hai (expires_in 3600); <code>Authorization: Bearer</code> bhejo</td></tr>
<tr><td><b>Secure Firewall Management Center</b></td><td><code>/api/fmc_platform/v1/auth/generatetoken</code> par Basic auth POST; token <b>response header</b> <code>X-auth-access-token</code> mein <code>DOMAIN_UUID</code> ke saath aata hai; usi header naam mein bhejo; tokens 30 minute chalte hain</td></tr>
<tr><td><b>Secure Endpoint</b> (API v1)</td><td>Har call par API client ID aur API key ke saath HTTP Basic, jaise GET <code>/v1/computers</code></td></tr>
<tr><td><b>Cisco XDR</b></td><td>Bearer token ke liye OAuth client credentials, phir Threat Response (IROH) endpoints jaise <code>/iroh/iroh-enrich/observe/observables</code></td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OAuth client credentials flow">
<rect x="10" y="80" width="150" height="60" rx="8" fill="#bae6fd"/><text x="85" y="106" text-anchor="middle" class="svg-ink" font-size="13">AUTOMATION</text><text x="85" y="124" text-anchor="middle" class="svg-muted" font-size="12">python3 script</text>
<rect x="470" y="15" width="160" height="56" rx="8" fill="#fde68a"/><text x="550" y="40" text-anchor="middle" class="svg-ink" font-size="13">/auth/v2/token</text><text x="550" y="58" text-anchor="middle" class="svg-muted" font-size="12">token lautata hai</text>
<rect x="470" y="150" width="160" height="56" rx="8" fill="#bbf7d0"/><text x="550" y="175" text-anchor="middle" class="svg-ink" font-size="13">/policies/v2/...</text><text x="550" y="193" text-anchor="middle" class="svg-muted" font-size="12">destination lists</text>
<line x1="160" y1="95" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><text x="300" y="58" text-anchor="middle" class="svg-accent" font-size="12">1 POST key + secret (Basic)</text>
<line x1="470" y1="60" x2="160" y2="108" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="330" y="100" text-anchor="middle" class="svg-muted" font-size="12">2 access_token, 3600 s</text>
<line x1="160" y1="125" x2="470" y2="178" stroke="#64748b" stroke-width="2"/><text x="300" y="172" text-anchor="middle" class="svg-accent" font-size="12">3 Authorization: Bearer token</text>
</svg><p class="cap">Client credentials: key ko short-lived token se badlo, phir har API call par token use karo.</p></div>

<h3>Lab walk-through, script dar script</h3>
<p><b>Task 1:</b> <code>cat sa_get_token.py</code>. Lab file base address poora likhti hai; neeche use variables mein baanta gaya hai:</p>
<pre class="code">HOST = "api.sse.cisco.com"
BASE = f"{SCHEME}://{HOST}"      <span class="c"># SCHEME = TLS web scheme</span>
CLIENT_ID = os.environ.get("SA_CLIENT_ID", "7c1e0a9b54d44f0e9a1b2c3d4e5f6a7b")
CLIENT_SECRET = os.environ.get("SA_CLIENT_SECRET", "not-in-git")

def get_token():
    r = requests.post(f"{BASE}/auth/v2/token",
                      auth=(CLIENT_ID, CLIENT_SECRET),     <span class="c"># HTTP Basic: key + secret</span>
                      data={"grant_type": "client_credentials"},
                      timeout=10)
    r.raise_for_status()
    return r.json()["access_token"]</pre>
<p>Grant type <b>client_credentials</b> hai. Chalane par print hota hai:</p>
<pre class="out">AUTOMATION&gt; python3 sa_get_token.py
<span class="hl">HTTP 200 - token received</span>
token_type : Bearer
expires_in : 3600 seconds
access_token: eyJhbGciOiJSUzI1NiIsInR5...</pre>
<p><b>Task 2:</b> <code>python3 sa_list_destlists.py</code> <code>/policies/v2/destinationlists</code> par GET karti hai aur <code>r.json()["data"]</code> par loop chalati hai:</p>
<pre class="out">GET /policies/v2/destinationlists -&gt; 200
  17749001  Global Block List      access=block  destinations=0
  17749002  Global Allow List      access=allow  destinations=0
<span class="hl">  17749231  IR-Blocklist           access=block  destinations=2</span></pre>
<p><b>Task 3 aur 4:</b> <code>sa_block_domain.py</code> <code>headers = {"Authorization": f"Bearer {get_token()}", "Content-Type": "application/json"}</code> banati hai, domain <code>sys.argv[1]</code> se leti hai, aur <code>[{"destination": DOMAIN, "comment": "INC-2231 C2 beacon"}]</code> ko <code>f"{BASE}/policies/v2/destinationlists/{LIST_ID}/destinations"</code> par POST karti hai. Token <b>Authorization</b> header mein jaata hai.</p>
<pre class="out">AUTOMATION&gt; python3 sa_block_domain.py k7x2qvz9lm.example
POST h&#116;tps://api.sse.cisco.com/policies/v2/destinationlists/17749231/destinations <span class="hl">-&gt; 200</span>
{'status': {'code': 200, 'text': 'OK'}, 'data': {'id': 17749231, 'name': 'IR-Blocklist', 'access': 'block', 'isGlobal': False, 'meta': {'destinationCount': <span class="hl">3</span>}}}</pre>
<p>SECURE-ACCESS console mein Resources, Destination Lists ke neeche verify karo: IR-Blocklist mein ab k7x2qvz9lm.example hai.</p>
<p><b>Task 5:</b> <code>fmc_list_policies.py</code> <code>token = r.headers["X-auth-access-token"]</code> aur <code>domain = r.headers["DOMAIN_UUID"]</code> padhti hai, phir <code>params={"limit": 25}</code> ke saath <code>/api/fmc_config/v1/domain/{domain}/policy/accesspolicies</code> par GET karti hai aur har item ka name aur id print karti hai. FMC request header <b>X-auth-access-token</b> hai, Authorization nahi.</p>

<div class="eg"><p><b>Worked example: XDR enrichment script.</b> <code>obs = [{"type": "domain", "value": "k7x2qvz9lm.example"}]</code> bearer token ke saath enrich endpoint par POST hota hai. Loop <code>for module in r.json()["data"]</code> har integration module (Talos, Secure Endpoint, Umbrella...) par jaata hai aur uske verdicts se <code>v["disposition_name"]</code> print karta hai, jaise "Malicious". Paanch steps follow karo to ise padhne mein 30 second lagte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> API secret script mein hard-code karke git mein commit karna (environment variables ya vault use karo). Production mein <code>verify=False</code> use karna, jo TLS certificate checking band kar deta hai. Expire hone ke baad token reuse karna. <code>data=</code> aur <code>json=</code> mein confuse hona.</p></div>

<div class="exam"><p><b>Exam traps.</b> FMC: token <b>response header</b> mein, <code>X-auth-access-token</code> ki tarah wapas bheja jaata hai, aur har config path mein <b>domain UUID</b> hota hai. Secure Access aur Umbrella: <b>client credentials</b>, phir <b>Bearer</b>. <code>.../destinations</code> par POST domains jodta hai; DELETE hatata hai. <code>json=</code> Content-Type apne aap set karta hai.</p></div>

<div class="scn"><h4>Script jisne partner ko block kar diya</h4><p>Ek analyst ne report se copy kiye domain ke saath block script chalayi par argument order galat type kiya, isliye script ne apna default domain use kiya aur ek partner ka portal block ho gaya. Team ne script badli taaki argument zaroori ho, target print ho aur confirmation maange, har API call comment field mein ticket number ke saath log ho, aur API key ka scope sirf ek incident destination list tak restrict kiya.</p><p><b>Seekh:</b> automation galtiyon ko bhi utni hi tezi se badhata hai jitna achhe actions ko; input validate karo, log karo, aur API keys ko sabse chhota scope do.</p></div>

<div class="iv"><p class="q">"Yeh ek Python script hai jo security API call karti hai. Batao yeh kya karti hai."</p><p>Paanch steps bolkar use karo: base URL aur path, authentication method (Basic, bearer, FMC header), HTTP method, body aur JSON se print hone wale fields. Effect ek sentence mein batao ("yeh is domain ko destination list 17749231 mein jodti hai aur naya count print karti hai"), phir mention karo kya galat ho sakta hai: expired token (401), missing scope (403), galat ID (404), kharaab body (400), rate limit (429).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scripts paanch steps mein padho: kahan, kaise authenticated, method, body, output.</li>
<li>Secure Access aur Umbrella: OAuth client_credentials, phir Authorization: Bearer.</li>
<li>FMC: token X-auth-access-token response header mein, har path mein domain UUID, paged items.</li>
<li>Secure Endpoint v1 har call par Basic auth use karta hai; XDR bearer token aur IROH enrich endpoints.</li>
<li>Lab answers: client_credentials, list ID 17749231, Authorization header, POST 200, X-auth-access-token.</li>
</ul></div>
`}};export{e as default};