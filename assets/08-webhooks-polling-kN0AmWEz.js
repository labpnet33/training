var e={id:`webhooks`,h:{en:`Webhooks versus polling: receiving events and verifying signatures`,hi:`Webhooks vs polling: events receive karna aur signatures verify karna`},body:{en:`
<p>You order a parcel. One way to follow it: open the tracking page every ten minutes and refresh (<b>polling</b>). The other way: the courier sends you an SMS when the parcel is out for delivery (a <b>webhook</b>). Polling costs you effort and still shows news late. The SMS arrives the moment something happens and costs nothing in between. This chapter covers exam topic 2.6: what webhooks are, how they differ from polling, how you receive one, and how you check that it is genuine.</p>

<h3>Polling</h3>
<p>The client calls the API on a timer: "any new alerts? any new alerts? any new alerts?" It is simple and the client stays in control, and it works behind firewalls because the client only makes outgoing calls. The cost: most calls return nothing new, you add load and may hit the rate limit (chapter 7), and you learn about an event only at the next poll. Use polling when the API offers nothing else, or for checking an asynchronous job (chapter 3).</p>

<h3>Webhooks</h3>
<p>A <b>webhook</b> is an HTTP request that the <i>service</i> sends to <i>your</i> URL when an event happens. It is sometimes called a "reverse API" or HTTP callback. You register your URL (and a secret) once; afterwards the service makes a POST with a JSON body for every event. Network examples: a cloud dashboard posts an alert when an access point goes down, a controller posts when a device configuration changes, a CI system posts when a pipeline finishes, a chat bot receives a message.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Polling versus webhook">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Polling</text>
<line x1="60" y1="35" x2="60" y2="240" stroke="#64748b"/><line x1="260" y1="35" x2="260" y2="240" stroke="#64748b"/>
<text x="60" y="50" text-anchor="middle" class="svg-muted" font-size="12">client</text><text x="260" y="50" text-anchor="middle" class="svg-muted" font-size="12">service</text>
<line x1="60" y1="75" x2="260" y2="75" stroke="#64748b"/><text x="160" y="70" text-anchor="middle" class="svg-muted" font-size="12">any news? - no</text>
<line x1="60" y1="115" x2="260" y2="115" stroke="#64748b"/><text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">any news? - no</text>
<circle cx="260" cy="140" r="6" fill="#fde68a"/><text x="160" y="143" text-anchor="middle" class="svg-accent" font-size="12">event happens</text>
<line x1="60" y1="190" x2="260" y2="190" stroke="#64748b"/><text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">any news? - YES (late)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Webhook</text>
<line x1="380" y1="35" x2="380" y2="240" stroke="#64748b"/><line x1="580" y1="35" x2="580" y2="240" stroke="#64748b"/>
<text x="380" y="50" text-anchor="middle" class="svg-muted" font-size="12">your receiver</text><text x="580" y="50" text-anchor="middle" class="svg-muted" font-size="12">service</text>
<line x1="380" y1="80" x2="580" y2="80" stroke="#64748b" stroke-dasharray="5 4"/><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="12">register URL + secret (once)</text>
<circle cx="580" cy="140" r="6" fill="#fde68a"/><text x="480" y="118" text-anchor="middle" class="svg-accent" font-size="12">event happens</text>
<line x1="580" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="2"/><text x="480" y="167" text-anchor="middle" class="svg-accent" font-size="12">POST /hook {event} at once</text>
<line x1="380" y1="195" x2="580" y2="195" stroke="#64748b" stroke-dasharray="5 4"/><text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">200 OK (quickly)</text>
</svg><p class="cap">Polling asks again and again. A webhook is pushed by the service at the moment of the event.</p></div>
<div class="tbl"><table class="cmp"><tr><th></th><th>Polling</th><th>Webhook</th></tr>
<tr><td>Who starts the call</td><td>Client</td><td>Service</td></tr>
<tr><td>Delay</td><td>Up to one polling interval</td><td>Near real time</td></tr>
<tr><td>Wasted calls</td><td>Many</td><td>None</td></tr>
<tr><td>Client needs</td><td>Only outgoing access</td><td>A public HTTPS URL that the service can reach</td></tr>
<tr><td>If the client is down</td><td>Catches up on next poll</td><td>Events may be lost unless the sender retries</td></tr></table></div>

<h3>Receiving a webhook</h3>
<p>Your receiver is a small web service with one route that accepts POST. The rules: answer <b>fast</b> with a 2xx (200 or 204), because the sender gives up after a few seconds and retries; do the slow work after replying (a queue or a background task); and expect the <b>same event more than once</b>, so ignore duplicates using the event id. Reference snippet with Flask (<code>api.example</code> style names, not a lab device):</p>
<pre class="code">from flask import Flask, request, abort
app = Flask(__name__)
seen = set()

@app.route("/hook", methods=["POST"])
def hook():
    event = request.get_json(silent=True)
    if not event:
        abort(400)                                  # not JSON
    if event["id"] in seen:                          # duplicate delivery: acknowledge, do nothing
        return "", 204
    seen.add(event["id"])
    print("ALERT:", event["device"], event["type"])  # hand off to a queue in real life
    return "", 204</pre>
<pre class="out">POST /hook HTTP/1.1
Content-Type: application/json
X-Signature-256: sha256=9f2a...redacted

{"id": "evt_8812", "type": "link_down", "device": "r1", "interface": "Gi0/1"}</pre>

<h3>Verifying that a webhook is genuine</h3>
<p>Your URL is public, so anyone could POST fake alerts to it. The usual protection is a <b>signature</b> using <b>HMAC</b> (a hash computed with a shared secret key). The idea, with no maths needed:</p>
<ol>
<li>When you register the webhook, you and the service share a <b>secret</b>.</li>
<li>For each event the service computes <code>HMAC-SHA256(secret, raw body)</code> and sends the result in a header (the header name differs per provider; check the documentation).</li>
<li>Your receiver computes the same HMAC over the <b>raw bytes</b> it received and compares. Equal: genuine and unchanged. Different: reject with 401 or 403.</li>
</ol>
<pre class="code">import hmac, hashlib, os
SECRET = os.environ["WEBHOOK_SECRET"].encode()

def valid(raw_body: bytes, header_value: str) -&gt; bool:
    expected = "sha256=" + hmac.new(SECRET, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header_value)   # constant-time comparison</pre>
<p>Details that matter: sign and check the <b>raw body</b>, not a re-formatted copy; use <code>hmac.compare_digest</code> and not <code>==</code>; a <b>timestamp</b> inside the signed data (reject events older than a few minutes) stops replay of a captured message; serve the endpoint over <b>HTTPS</b>; and some providers let you restrict by source IP as an extra layer. Some simpler services only send a fixed secret token field in the payload, which you compare: weaker, but the same idea.</p>

<div class="warn"><p><b>Common mistakes.</b> Doing slow work before replying, so the sender times out and retries; no duplicate handling; trusting any POST without checking the signature; verifying against parsed JSON instead of the raw body; comparing signatures with <code>==</code>; exposing the receiver over plain HTTP; keeping the secret in the code.</p></div>
<div class="exam"><p><b>Exam trap.</b> A webhook is <b>push</b> (service to you); polling is <b>pull</b> (you to service). The receiver is the HTTP <i>server</i> in a webhook, even though it is your script. The signature proves who sent it and that the body was not changed; it does not hide the content (that is HTTPS's job).</p></div>

<div class="scn"><h4>Alerts that arrived four minutes late</h4><p>A branch-monitoring tool polled a cloud dashboard every five minutes to find offline access points. Staff complained that users noticed outages before the NOC did. The team registered a webhook for "device went offline" with a signature secret and a small receiver that created a ticket. Detection time dropped from up to five minutes to a few seconds. They kept one polling job per hour as a safety net for any lost webhook.</p><p><b>Lesson:</b> Use webhooks for speed and polling as a slow safety net, because deliveries can be lost.</p></div>

<div class="iv"><p class="q">"What is a webhook and how is it different from polling?"</p><p>A webhook is a callback: the service sends an HTTP POST to a URL I registered when an event happens, so I get near real-time data without wasted calls. With polling my client asks repeatedly and may be late. I must expose a reachable HTTPS endpoint, reply quickly with a 2xx, handle duplicates, and verify the HMAC signature over the raw body with the shared secret before trusting the event.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling = client pulls on a timer; webhook = service pushes an HTTP POST when an event happens.</li>
<li>A receiver is a small HTTPS endpoint that replies 2xx fast and works in the background.</li>
<li>Expect duplicates and lost deliveries: dedupe by event id, keep a slow safety poll.</li>
<li>Verify the HMAC signature on the raw body with a constant-time compare; add timestamp checks against replay.</li>
<li>The signature proves origin and integrity; HTTPS gives confidentiality.</li>
</ul></div>
`,hi:`
<p>Aap parcel order karte ho. Use track karne ka ek tareeka: har dus minute tracking page kholo aur refresh karo (<b>polling</b>). Doosra tareeka: courier jab parcel delivery ke liye nikalta hai to aapko SMS bhejta hai (<b>webhook</b>). Polling mein aapki mehnat lagti hai aur phir bhi khabar der se dikhti hai. SMS jaise hi kuch hota hai turant aata hai aur beech mein kuch cost nahi. Yeh chapter exam topic 2.6 cover karta hai: webhooks kya hain, polling se kaise alag hain, aap ek kaise receive karte ho, aur kaise check karte ho ki woh asli hai.</p>

<h3>Polling</h3>
<p>Client timer par API call karta hai: "koi naya alert? koi naya alert? koi naya alert?" Yeh simple hai aur client control mein rehta hai, aur firewalls ke peeche bhi chalta hai kyunki client sirf outgoing calls karta hai. Kimat: zyada tar calls mein kuch naya nahi hota, aap load badhate ho aur rate limit (chapter 7) tak pahunch sakte ho, aur event ka pata agle poll par hi chalta hai. Polling tab use karo jab API kuch aur na de, ya asynchronous job (chapter 3) check karne ke liye.</p>

<h3>Webhooks</h3>
<p><b>Webhook</b> ek HTTP request hai jo event hone par <i>service</i> <i>aapke</i> URL par bhejti hai. Ise kabhi "reverse API" ya HTTP callback bhi kehte hain. Aap apna URL (aur ek secret) ek baar register karte ho; uske baad service har event ke liye JSON body ke saath POST karti hai. Network examples: access point down hone par cloud dashboard alert post karta hai, device ki configuration badalne par controller post karta hai, pipeline khatam hone par CI system post karta hai, chat bot ko message milta hai.</p>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Polling versus webhook">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="14">Polling</text>
<line x1="60" y1="35" x2="60" y2="240" stroke="#64748b"/><line x1="260" y1="35" x2="260" y2="240" stroke="#64748b"/>
<text x="60" y="50" text-anchor="middle" class="svg-muted" font-size="12">client</text><text x="260" y="50" text-anchor="middle" class="svg-muted" font-size="12">service</text>
<line x1="60" y1="75" x2="260" y2="75" stroke="#64748b"/><text x="160" y="70" text-anchor="middle" class="svg-muted" font-size="12">koi khabar? - nahi</text>
<line x1="60" y1="115" x2="260" y2="115" stroke="#64748b"/><text x="160" y="110" text-anchor="middle" class="svg-muted" font-size="12">koi khabar? - nahi</text>
<circle cx="260" cy="140" r="6" fill="#fde68a"/><text x="160" y="143" text-anchor="middle" class="svg-accent" font-size="12">event hota hai</text>
<line x1="60" y1="190" x2="260" y2="190" stroke="#64748b"/><text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">koi khabar? - HAAN (der se)</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="14">Webhook</text>
<line x1="380" y1="35" x2="380" y2="240" stroke="#64748b"/><line x1="580" y1="35" x2="580" y2="240" stroke="#64748b"/>
<text x="380" y="50" text-anchor="middle" class="svg-muted" font-size="12">aapka receiver</text><text x="580" y="50" text-anchor="middle" class="svg-muted" font-size="12">service</text>
<line x1="380" y1="80" x2="580" y2="80" stroke="#64748b" stroke-dasharray="5 4"/><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="12">URL + secret register (ek baar)</text>
<circle cx="580" cy="140" r="6" fill="#fde68a"/><text x="480" y="118" text-anchor="middle" class="svg-accent" font-size="12">event hota hai</text>
<line x1="580" y1="150" x2="380" y2="150" stroke="#64748b" stroke-width="2"/><text x="480" y="167" text-anchor="middle" class="svg-accent" font-size="12">POST /hook {event} turant</text>
<line x1="380" y1="195" x2="580" y2="195" stroke="#64748b" stroke-dasharray="5 4"/><text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">200 OK (jaldi)</text>
</svg><p class="cap">Polling baar-baar poochta hai. Webhook event ke pal par service dwara push hota hai.</p></div>
<div class="tbl"><table class="cmp"><tr><th></th><th>Polling</th><th>Webhook</th></tr>
<tr><td>Call kaun shuru karta hai</td><td>Client</td><td>Service</td></tr>
<tr><td>Delay</td><td>Ek polling interval tak</td><td>Lagbhag real time</td></tr>
<tr><td>Bekaar calls</td><td>Bahut</td><td>Koi nahi</td></tr>
<tr><td>Client ko kya chahiye</td><td>Sirf outgoing access</td><td>Public HTTPS URL jise service reach kar sake</td></tr>
<tr><td>Client down ho to</td><td>Agle poll par catch up</td><td>Events kho sakte hain jab tak sender retry na kare</td></tr></table></div>

<h3>Webhook receive karna</h3>
<p>Aapka receiver ek chhoti web service hai jisme ek route POST accept karta hai. Rules: <b>jaldi</b> 2xx (200 ya 204) se jawab do, kyunki sender kuch seconds baad haar maan kar retry karta hai; slow kaam reply ke baad karo (queue ya background task); aur <b>wahi event ek se zyada baar</b> aane ki umeed rakho, isliye event id se duplicates ignore karo. Flask ke saath reference snippet (<code>api.example</code> style naam, lab device nahi):</p>
<pre class="code">from flask import Flask, request, abort
app = Flask(__name__)
seen = set()

@app.route("/hook", methods=["POST"])
def hook():
    event = request.get_json(silent=True)
    if not event:
        abort(400)                                  # JSON nahi hai
    if event["id"] in seen:                          # duplicate delivery: acknowledge karo, kuch mat karo
        return "", 204
    seen.add(event["id"])
    print("ALERT:", event["device"], event["type"])  # real mein queue ko do
    return "", 204</pre>
<pre class="out">POST /hook HTTP/1.1
Content-Type: application/json
X-Signature-256: sha256=9f2a...redacted

{"id": "evt_8812", "type": "link_down", "device": "r1", "interface": "Gi0/1"}</pre>

<h3>Verify karna ki webhook asli hai</h3>
<p>Aapka URL public hai, isliye koi bhi usme nakli alerts POST kar sakta hai. Aam suraksha <b>signature</b> hai jo <b>HMAC</b> use karti hai (shared secret key se nikala hua hash). Idea, bina maths ke:</p>
<ol>
<li>Webhook register karte waqt aap aur service ek <b>secret</b> share karte ho.</li>
<li>Har event ke liye service <code>HMAC-SHA256(secret, raw body)</code> nikaalti hai aur result header mein bhejti hai (header ka naam provider ke hisaab se alag hota hai; documentation dekho).</li>
<li>Aapka receiver mile hue <b>raw bytes</b> par wahi HMAC nikaalta hai aur compare karta hai. Barabar: asli aur unchanged. Alag: 401 ya 403 se reject karo.</li>
</ol>
<pre class="code">import hmac, hashlib, os
SECRET = os.environ["WEBHOOK_SECRET"].encode()

def valid(raw_body: bytes, header_value: str) -&gt; bool:
    expected = "sha256=" + hmac.new(SECRET, raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header_value)   # constant-time comparison</pre>
<p>Zaroori details: <b>raw body</b> par sign aur check karo, re-formatted copy par nahi; <code>==</code> ki jagah <code>hmac.compare_digest</code> use karo; signed data ke andar ka <b>timestamp</b> (kuch minute se purane events reject karo) pakde gaye message ke replay ko rokta hai; endpoint ko <b>HTTPS</b> par serve karo; aur kuch providers extra layer ke roop mein source IP se restrict karne dete hain. Kuch simple services payload mein sirf fixed secret token field bhejti hain jise aap compare karte ho: kamzor, par wahi idea.</p>

<div class="warn"><p><b>Common mistakes.</b> Reply se pehle slow kaam karna, jisse sender timeout hokar retry karta hai; duplicate handling na hona; signature check kiye bina har POST par bharosa; raw body ki jagah parsed JSON se verify karna; signatures ko <code>==</code> se compare karna; receiver ko plain HTTP par expose karna; secret ko code mein rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Webhook <b>push</b> hai (service se aap tak); polling <b>pull</b> hai (aap se service tak). Webhook mein receiver HTTP <i>server</i> hai, chahe woh aapki script ho. Signature saabit karti hai ki kisne bheja aur body badli nahi; woh content chhupati nahi (woh HTTPS ka kaam hai).</p></div>

<div class="scn"><h4>Alerts jo chaar minute der se aaye</h4><p>Ek branch-monitoring tool har paanch minute mein cloud dashboard ko poll karke offline access points dhoondhta tha. Staff ki shikayat thi ki users ko outage NOC se pehle pata chal jaata hai. Team ne "device went offline" ke liye signature secret ke saath webhook register kiya aur ek chhota receiver banaya jo ticket banata tha. Detection time paanch minute tak se ghat kar kuch seconds ho gaya. Unhone kisi bhi lost webhook ke liye safety net ke roop mein ghante mein ek polling job rakhi.</p><p><b>Lesson:</b> Speed ke liye webhooks aur safety net ke roop mein slow polling use karo, kyunki deliveries kho sakti hain.</p></div>

<div class="iv"><p class="q">"Webhook kya hai aur polling se kaise alag hai?"</p><p>Webhook ek callback hai: event hone par service mere register kiye URL par HTTP POST bhejti hai, isliye mujhe bekaar calls ke bina lagbhag real-time data milta hai. Polling mein mera client baar-baar poochta hai aur der ho sakti hai. Mujhe reachable HTTPS endpoint expose karna hota hai, jaldi 2xx se reply karna hota hai, duplicates handle karne hote hain, aur event par bharosa karne se pehle shared secret ke saath raw body par HMAC signature verify karna hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Polling = client timer par pull karta hai; webhook = event hone par service HTTP POST push karti hai.</li>
<li>Receiver chhota HTTPS endpoint hai jo jaldi 2xx deta hai aur background mein kaam karta hai.</li>
<li>Duplicates aur lost deliveries ki umeed rakho: event id se dedupe karo, slow safety poll rakho.</li>
<li>Raw body par HMAC signature constant-time compare se verify karo; replay ke khilaf timestamp check jodo.</li>
<li>Signature origin aur integrity saabit karti hai; HTTPS confidentiality deta hai.</li>
</ul></div>
`}};export{e as default};