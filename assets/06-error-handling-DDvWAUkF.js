var e={id:`error-handling`,h:{en:`When things fail: status, timeouts, try/except`,hi:`Jab cheezein fail hon: status, timeouts, try/except`},body:{en:`

<p>Calls fail. A good script says <i>how</i> it failed and carries on with the next device. requests has two kinds of failure, and you handle them differently.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Two kinds of failure: a reply that says no, and no reply at all."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="14">Send request</text><rect x="215" y="10" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="295" y="32" text-anchor="middle" class="svg-ink" font-size="14">Reply: 2xx</text><text x="295" y="50" text-anchor="middle" class="svg-muted" font-size="12">carry on</text><rect x="215" y="75" width="160" height="50" rx="10" fill="#fde68a"/><text x="295" y="97" text-anchor="middle" class="svg-ink" font-size="14">Reply: 4xx / 5xx</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="12">raise_for_status()</text><rect x="215" y="140" width="160" height="50" rx="10" fill="#fecaca"/><text x="295" y="162" text-anchor="middle" class="svg-ink" font-size="14">No reply</text><text x="295" y="180" text-anchor="middle" class="svg-muted" font-size="12">Timeout, ConnectionError</text><rect x="440" y="75" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="97" text-anchor="middle" class="svg-ink" font-size="14">except HTTPError</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">handle it</text><rect x="440" y="140" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="162" text-anchor="middle" class="svg-ink" font-size="14">except Timeout / ConnectionError</text><text x="535" y="180" text-anchor="middle" class="svg-muted" font-size="12">handle it</text><line x1="150" y1="85" x2="215" y2="35" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="90" x2="215" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="100" x2="215" y2="165" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="375" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="375" y1="165" x2="440" y2="165" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Two kinds of failure: a reply that says no, and no reply at all.</p></div>

<h3>Kind 1: the router answered, and the answer was "no"</h3>
<p>A 404 is a <b>normal reply</b>, so requests does not stop. Your script has to look at the status. The easy way is <code>r.raise_for_status()</code>: it does nothing for 2xx and raises an <b>HTTPError</b> for 4xx and 5xx:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback99", auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r.status_code)
r.raise_for_status()
print("not reached")</pre><pre class="out">AUTO&gt; python3 g.py
<span class="hl">404</span>
Traceback (most recent call last):
  File "g.py", line 4, in &lt;module&gt;
    r.raise_for_status()
<span class="hl">requests.exceptions.HTTPError: 404 Client Error: Not Found for url: ...</span></pre>
<p>The first print shows <code>404</code>. Then <code>raise_for_status()</code> stops the script, and "not reached" never prints. (The long address after <code>for url:</code> is shortened here.) A crash like this is useful, but it would also stop a loop over fifty routers. To keep going, catch the error with <code>try</code> and <code>except</code>:</p>
<pre class="code">import requests
try:
    r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback99", auth=("netops", "NK@2026"))
    r.raise_for_status()
except requests.exceptions.HTTPError as e:
    print("HTTP problem:", e)</pre><pre class="out">AUTO&gt; python3 h.py
<span class="hl">HTTP problem: 404 Client Error: Not Found for url: ...</span></pre>
<p><code>try:</code> means "attempt this block". If an HTTPError occurs inside it, Python jumps to <code>except requests.exceptions.HTTPError as e:</code> and runs that block. <code>e</code> holds the error, and printing it shows the status and reason.</p>

<h3>Kind 2: no answer at all</h3>
<p>If the router is down, the address is wrong or a firewall drops packets, there is no status code to read. requests raises an exception instead. Always give a <b>timeout</b> (in seconds), or a script can wait forever. First, what happens without a handler:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
print(r.status_code)</pre><pre class="out">AUTO&gt; python3 e.py
Traceback (most recent call last):
  File "e.py", line 2, in &lt;module&gt;
    r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
<span class="hl">requests.exceptions.Timeout: HTTPSConnectionPool(host='10.99.0.9', port=443): Max retries exceeded with url: ... (Caused by NewConnectionError: Connection timed out)</span></pre>
<p>Now with handlers for the two network problems. In the lab, 10.99.0.9 does not exist, so the call times out:</p>
<pre class="code">import requests
try:
    r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
except requests.exceptions.ConnectionError as e:
    print("cannot connect:", e)
except requests.exceptions.Timeout:
    print("timed out")</pre><pre class="out">AUTO&gt; python3 f.py
<span class="hl">timed out</span></pre>
<p>Two <code>except</code> blocks, one for each kind of problem. <code>ConnectionError</code> means "could not connect or the connection was refused", and <code>Timeout</code> means "waited too long". Python chooses the first block that matches. Another device may refuse a connection quickly instead; a handler for both is the safe pattern.</p>

<h3>One more: a bad URL</h3>
<p>A URL needs its scheme (<code>h&#116;tps://</code>). Without it, requests refuses to send anything:</p>
<pre class="code">import requests
try:
    requests.get("10.99.0.1/restconf")
except Exception as e:
    print(type(e).__name__, e)</pre><pre class="out">AUTO&gt; python3 m.py
<span class="hl">ValueError Invalid URL '10.99.0.1/restconf': No scheme supplied. Perhaps you meant h&#116;tps://10.99.0.1/restconf?</span></pre>
<p>This time we caught a general <code>Exception</code> and printed its type name with <code>type(e).__name__</code>. That is handy for discovering which exception class to catch, but in finished scripts catch the specific ones.</p>

<h3>Branching on the status yourself</h3>
<p>Instead of raising, you can branch with <code>if</code>, <code>elif</code> and <code>else</code>. This script also uses <code>json.dumps(..., indent=2)</code> to print the data neatly (the middle of the output is shortened here):</p>
<pre class="code">import requests, json
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"))
print(json.dumps(r.json(), indent=2))
print(r.status_code == requests.codes.ok)
status = r.status_code
if status == 200:
    print("fine")
elif status in (401, 403):
    print("login problem")
else:
    print("other", status)</pre>
<pre class="out">AUTO&gt; python3 k.py
{
  "ietf-interfaces:interface": {
    "name": "Loopback0",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    ...
}
True
<span class="hl">fine</span></pre>

<div class="eg"><p><b>Worked example.</b> Three routers in a list: one healthy, one with a typo in the path, one powered off. With try/except around each call, the script prints three lines: the data, an HTTP problem (404) and "timed out". It never crashes, and you know exactly where to look. Without handlers, the first failure would have hidden the other two.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) No timeout: one dead router freezes the whole script. (2) A bare <code>except:</code> that swallows every error silently. (3) Catching only HTTPError and forgetting network errors, or the other way round. (4) Printing "success" without checking status_code. (5) Expecting a 404 to raise an exception by itself: it will not unless you call raise_for_status().</p></div>
<div class="exam"><p><b>Exam trap.</b> requests does not raise for 4xx/5xx by default; <code>raise_for_status()</code> does. Network problems raise <code>ConnectionError</code> or <code>Timeout</code>. The timeout argument is in seconds. All requests exceptions live under <code>requests.exceptions</code>.</p></div>

<div class="scn"><h4>The silent router</h4><p>A nightly job covered sixty routers. One site lost power. Without a timeout the script waited on that router for hours, and the other fifty-nine reports were never produced. With <code>timeout=5</code> and a <code>Timeout</code> handler, the job finished in minutes and the report simply said "R41 timed out".</p><p><b>Lesson:</b> timeouts and handlers turn a stuck job into a useful report.</p></div>

<div class="iv"><p class="q">"What is the difference between HTTPError and ConnectionError in requests?"</p><p>HTTPError is raised by <code>raise_for_status()</code> when the server did reply with a 4xx or 5xx status. ConnectionError and Timeout are raised when there was no usable reply: the host is unreachable, refused the connection or took too long. I always set a timeout and catch each kind, so one bad device never stops the loop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4xx and 5xx are normal replies; call raise_for_status() to turn them into HTTPError.</li>
<li>No reply raises ConnectionError or Timeout; always pass timeout=.</li>
<li>try / except keeps the script alive; catch specific exceptions.</li>
<li>A URL without its scheme raises ValueError.</li>
<li>if / elif / else lets you branch on the status code.</li>
</ul></div>

`,hi:`

<p>Calls fail hoti hain. Achhi script batati hai ki woh <i>kaise</i> fail hui aur agle device par chalti rehti hai. requests mein do tarah ki failure hoti hain, aur dono alag sambhalte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Do tarah ki failure: aisa reply jo na kehta hai, aur reply hi nahi."><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs><rect x="10" y="60" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="14">Request bhejo</text><rect x="215" y="10" width="160" height="50" rx="10" fill="#bbf7d0"/><text x="295" y="32" text-anchor="middle" class="svg-ink" font-size="14">Reply: 2xx</text><text x="295" y="50" text-anchor="middle" class="svg-muted" font-size="12">aage badho</text><rect x="215" y="75" width="160" height="50" rx="10" fill="#fde68a"/><text x="295" y="97" text-anchor="middle" class="svg-ink" font-size="14">Reply: 4xx / 5xx</text><text x="295" y="115" text-anchor="middle" class="svg-muted" font-size="12">raise_for_status()</text><rect x="215" y="140" width="160" height="50" rx="10" fill="#fecaca"/><text x="295" y="162" text-anchor="middle" class="svg-ink" font-size="14">Reply nahi</text><text x="295" y="180" text-anchor="middle" class="svg-muted" font-size="12">Timeout, ConnectionError</text><rect x="440" y="75" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="97" text-anchor="middle" class="svg-ink" font-size="14">except HTTPError</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">sambhalo</text><rect x="440" y="140" width="190" height="50" rx="10" fill="#ddd6fe"/><text x="535" y="162" text-anchor="middle" class="svg-ink" font-size="14">except Timeout / ConnectionError</text><text x="535" y="180" text-anchor="middle" class="svg-muted" font-size="12">sambhalo</text><line x1="150" y1="85" x2="215" y2="35" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="90" x2="215" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="150" y1="100" x2="215" y2="165" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="375" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/><line x1="375" y1="165" x2="440" y2="165" stroke="#64748b" stroke-width="2" marker-end="url(#ah)"/></svg><p class="cap">Do tarah ki failure: aisa reply jo na kehta hai, aur reply hi nahi.</p></div>

<h3>Type 1: router ne jawab diya, aur jawab "na" tha</h3>
<p>404 ek <b>normal reply</b> hai, isliye requests ruka nahi. Aapki script ko status dekhna padta hai. Aasan tareeka <code>r.raise_for_status()</code> hai: 2xx par kuch nahi karta aur 4xx, 5xx par <b>HTTPError</b> uthata hai:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback99", auth=("netops", "NK@2026"), headers={"Accept": "application/yang-data+json"})
print(r.status_code)
r.raise_for_status()
print("not reached")</pre><pre class="out">AUTO&gt; python3 g.py
<span class="hl">404</span>
Traceback (most recent call last):
  File "g.py", line 4, in &lt;module&gt;
    r.raise_for_status()
<span class="hl">requests.exceptions.HTTPError: 404 Client Error: Not Found for url: ...</span></pre>
<p>Pehla print <code>404</code> dikhata hai. Phir <code>raise_for_status()</code> script rok deta hai, aur "not reached" kabhi print nahi hota. (<code>for url:</code> ke baad ka lamba address yahan chhota kiya gaya hai.) Aisa crash kaam ka hai, par pachaas routers ke loop ko bhi rok deta. Aage badhne ke liye error ko <code>try</code> aur <code>except</code> se pakdo:</p>
<pre class="code">import requests
try:
    r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback99", auth=("netops", "NK@2026"))
    r.raise_for_status()
except requests.exceptions.HTTPError as e:
    print("HTTP problem:", e)</pre><pre class="out">AUTO&gt; python3 h.py
<span class="hl">HTTP problem: 404 Client Error: Not Found for url: ...</span></pre>
<p><code>try:</code> ka matlab "yeh block try karo". Uske andar HTTPError aaye to Python <code>except requests.exceptions.HTTPError as e:</code> par jaakar woh block chalata hai. <code>e</code> mein error hai, aur print karne par status aur reason dikhte hain.</p>

<h3>Type 2: jawab hi nahi</h3>
<p>Router down ho, address galat ho ya firewall packets gira de, to padhne ko status code hi nahi hota. requests exception uthata hai. Hamesha <b>timeout</b> (seconds mein) do, nahi to script hamesha ke liye ruk sakti hai. Pehle dekho handler ke bina kya hota hai:</p>
<pre class="code">import requests
r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
print(r.status_code)</pre><pre class="out">AUTO&gt; python3 e.py
Traceback (most recent call last):
  File "e.py", line 2, in &lt;module&gt;
    r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
<span class="hl">requests.exceptions.Timeout: HTTPSConnectionPool(host='10.99.0.9', port=443): Max retries exceeded with url: ... (Caused by NewConnectionError: Connection timed out)</span></pre>
<p>Ab do network problems ke handlers ke saath. Lab mein 10.99.0.9 hai hi nahi, isliye call timeout hoti hai:</p>
<pre class="code">import requests
try:
    r = requests.get("h&#116;tps://10.99.0.9/restconf/data/ietf-interfaces:interfaces", auth=("netops", "NK@2026"), timeout=5)
except requests.exceptions.ConnectionError as e:
    print("cannot connect:", e)
except requests.exceptions.Timeout:
    print("timed out")</pre><pre class="out">AUTO&gt; python3 f.py
<span class="hl">timed out</span></pre>
<p>Do <code>except</code> blocks, har problem ke liye ek. <code>ConnectionError</code> ka matlab "connect nahi hua ya connection refuse hua", aur <code>Timeout</code> ka matlab "bahut der wait kiya". Python pehla matching block chunta hai. Koi doosra device jaldi connection refuse kar sakta hai; dono ka handler safe pattern hai.</p>

<h3>Ek aur: kharab URL</h3>
<p>URL ko apna scheme (<code>h&#116;tps://</code>) chahiye. Uske bina requests kuch bhejne se mana kar deta hai:</p>
<pre class="code">import requests
try:
    requests.get("10.99.0.1/restconf")
except Exception as e:
    print(type(e).__name__, e)</pre><pre class="out">AUTO&gt; python3 m.py
<span class="hl">ValueError Invalid URL '10.99.0.1/restconf': No scheme supplied. Perhaps you meant h&#116;tps://10.99.0.1/restconf?</span></pre>
<p>Is baar humne general <code>Exception</code> pakda aur <code>type(e).__name__</code> se uska type naam print kiya. Kaunsi exception class pakadni hai yeh jaanne ke liye kaam ka hai, par poori scripts mein specific wali pakdo.</p>

<h3>Status par khud branch karna</h3>
<p>Raise karne ki jagah aap <code>if</code>, <code>elif</code> aur <code>else</code> se branch kar sakte ho. Yeh script <code>json.dumps(..., indent=2)</code> se data saaf print bhi karti hai (output ka beech ka hissa yahan chhota kiya gaya hai):</p>
<pre class="code">import requests, json
r = requests.get("h&#116;tps://10.99.0.1/restconf/data/ietf-interfaces:interfaces/interface=Loopback0", auth=("netops", "NK@2026"))
print(json.dumps(r.json(), indent=2))
print(r.status_code == requests.codes.ok)
status = r.status_code
if status == 200:
    print("fine")
elif status in (401, 403):
    print("login problem")
else:
    print("other", status)</pre>
<pre class="out">AUTO&gt; python3 k.py
{
  "ietf-interfaces:interface": {
    "name": "Loopback0",
    "type": "iana-if-type:softwareLoopback",
    "enabled": true,
    ...
}
True
<span class="hl">fine</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek list mein teen routers: ek theek, ek ke path mein typo, ek band. Har call ke aas-paas try/except ke saath script teen lines print karti hai: data, ek HTTP problem (404) aur "timed out". Woh kabhi crash nahi hoti, aur aap jaante ho kahan dekhna hai. Handlers ke bina pehli failure baaki do ko chhupa deti.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> (1) Timeout nahi: ek dead router poori script jama deta hai. (2) Khaali <code>except:</code> jo har error ko chupchaap nigal leta hai. (3) Sirf HTTPError pakadna aur network errors bhool jaana, ya ulta. (4) status_code dekhe bina "success" print karna. (5) 404 se khud-ba-khud exception ki ummeed: nahi aayegi jab tak raise_for_status() na bulao.</p></div>
<div class="exam"><p><b>Exam trap.</b> requests default mein 4xx/5xx par raise nahi karta; <code>raise_for_status()</code> karta hai. Network problems <code>ConnectionError</code> ya <code>Timeout</code> uthati hain. timeout argument seconds mein hai. Saari requests exceptions <code>requests.exceptions</code> ke neeche hain.</p></div>

<div class="scn"><h4>Khamosh router</h4><p>Ek nightly job saath routers cover karti thi. Ek site ki bijli gayi. Timeout ke bina script us router par ghanton rukti rahi, aur baaki unsath reports kabhi bani hi nahi. <code>timeout=5</code> aur <code>Timeout</code> handler ke saath job kuch minutes mein khatam hui aur report mein bas likha tha "R41 timed out".</p><p><b>Lesson:</b> timeouts aur handlers atki hui job ko kaam ki report bana dete hain.</p></div>

<div class="iv"><p class="q">"requests mein HTTPError aur ConnectionError mein kya farak hai?"</p><p>HTTPError <code>raise_for_status()</code> uthata hai jab server ne 4xx ya 5xx status ke saath reply diya. ConnectionError aur Timeout tab uthte hain jab koi kaam ka reply hi nahi mila: host unreachable hai, connection refuse kiya ya bahut der lagayi. Main hamesha timeout set karta hoon aur har type pakadta hoon, taaki ek kharab device loop na roke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4xx aur 5xx normal replies hain; raise_for_status() unhe HTTPError banata hai.</li>
<li>Reply na mile to ConnectionError ya Timeout; hamesha timeout= do.</li>
<li>try / except script ko zinda rakhta hai; specific exceptions pakdo.</li>
<li>Scheme ke bina URL ValueError deta hai.</li>
<li>if / elif / else status code par branch karne deta hai.</li>
</ul></div>

`}};export{e as default};