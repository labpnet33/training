var e={id:`first-calls`,h:{en:`First calls: requests, headers and the JSON envelope`,hi:`Pehli calls: requests, headers aur JSON envelope`},body:{en:`
<p>You have a key in <code>FGT_TOKEN</code>. This chapter turns it into a small, reusable FortiOS client in Python: <code>fgt.py</code>. Every later script of the module imports it. It is Lab 1, step 2. You already know <code>requests</code> from <code>auto-requests</code>; here the focus is what is special about talking to a firewall.</p>

<h3>An analogy: a letter with an address, a stamp and a receipt</h3>
<p>A REST call is a registered letter. The <b>URL</b> is the address, the <b>method</b> (GET, POST, PUT, DELETE) is what you want done, the <b>headers</b> are the stamp and your signature, and the <b>reply</b> is the receipt that says whether the post office accepted it. A sloppy sender throws the receipt away. A good one reads it every time.</p>

<h3>The anatomy of a FortiOS URL</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Anatomy of a FortiOS REST v2 URL"><rect x="8" y="20" width="84" height="50" rx="10" fill="#e2e8f0"/><text x="50" y="49" text-anchor="middle" class="svg-ink" font-size="12">/api/v2</text><rect x="100" y="20" width="128" height="50" rx="10" fill="#bae6fd"/><text x="164" y="42" text-anchor="middle" class="svg-ink" font-size="12">/cmdb</text><text x="164" y="59" text-anchor="middle" class="svg-muted" font-size="11">configuration</text><rect x="236" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="306" y="42" text-anchor="middle" class="svg-ink" font-size="12">/firewall/address</text><text x="306" y="59" text-anchor="middle" class="svg-muted" font-size="11">table</text><rect x="384" y="20" width="80" height="50" rx="10" fill="#bbf7d0"/><text x="424" y="42" text-anchor="middle" class="svg-ink" font-size="12">/web1</text><text x="424" y="59" text-anchor="middle" class="svg-muted" font-size="11">one object</text><rect x="472" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="552" y="42" text-anchor="middle" class="svg-ink" font-size="12">?filter=name==web1</text><text x="552" y="59" text-anchor="middle" class="svg-muted" font-size="11">options</text><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">or live state instead of configuration:</text><rect x="100" y="124" width="128" height="50" rx="10" fill="#fed7aa"/><text x="164" y="146" text-anchor="middle" class="svg-ink" font-size="12">/monitor</text><text x="164" y="163" text-anchor="middle" class="svg-muted" font-size="11">state</text><rect x="236" y="124" width="200" height="50" rx="10" fill="#fed7aa"/><text x="336" y="146" text-anchor="middle" class="svg-ink" font-size="12">/system/status</text><text x="336" y="163" text-anchor="middle" class="svg-muted" font-size="11">path</text></svg><p class="cap">cmdb is configuration, monitor is live state. The query string filters and trims the answer.</p></div>
<p>Everything starts with <code>/api/v2</code>. Then comes the <b>area</b>: <code>cmdb</code> is configuration (what you configured), <code>monitor</code> is live state (what is happening now). Then the path of the table, for example <code>firewall/address</code>, then optionally the key of one object, then a query string. Both lab firewalls listen on 443, the administration web port.</p>

<h3>The client</h3>
<p>Write the first half of <code>fgt.py</code>. It has three jobs: never run without a key, attach the key as a <code>Bearer</code> header, and turn a failed call into one clear exception that keeps the status code and the FortiOS error number.</p>
<pre class="code">"""fgt.py - FortiOS REST v2 client for FGT1. The API key comes from the environment, never from this file."""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.41/api/v2"
TIMEOUT = 5


class FortiError(Exception):
    """A FortiOS answer that is not a success: keeps the status code and the FortiOS error number."""

    def __init__(self, method, path, response):
        body = response.json()
        lines = (body.get("cli_error") or "").strip().splitlines()
        self.status = response.status_code
        self.code = body.get("error")
        self.detail = lines[0] if lines else ""
        super().__init__(("%s %s -&gt; status %s, FortiOS error %s %s" % (method, path, self.status, self.code, self.detail)).rstrip())


def session():
    key = os.environ.get("FGT_TOKEN")
    if not key:
        sys.exit("FGT_TOKEN is not set - export it in this shell, never write the key into a file")
    s = requests.Session()
    s.headers.update({"Authorization": "Bearer " + key})
    s.verify = False        <span class="c"># lab: self-signed certificate. Real gear: verify="/path/to/ca-bundle.pem"</span>
    return s


def call(s, method, path, **kw):
    r = s.request(method, BASE + path, timeout=TIMEOUT, **kw)
    if r.status_code &gt;= 400:
        raise FortiError(method, path, r)
    return r.json()</pre>
<p>Four details matter. <code>sys.exit("message")</code> prints the message and exits with code 1, so a missing key stops the script before any call. <code>Session</code> carries the header for every request. <code>timeout=5</code> is mandatory in practice: without it <code>requests</code> waits forever for a firewall that drops your packets. And <code>verify=False</code> exists only because the lab firewall has a self-signed certificate.</p>
<div class="warn"><p><b>Do not copy verify=False into production.</b> It switches off the check that you are talking to the right firewall. On real gear install your own certificate authority on the firewall and pass <code>verify="/path/to/ca-bundle.pem"</code>, or pin the firewall's certificate. <code>curl</code> shows what the check does; it refuses a self-signed certificate unless you add <code>-k</code>:</p></div>
<pre class="out">AUTO01$ curl -s h&#116;tps://10.99.0.41/api/v2/monitor/system/status
<span class="hl">curl: (60) SSL certificate problem: self-signed certificate</span></pre>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab's <code>requests</code> does not verify certificates, even with <code>verify=True</code>. Real <code>requests</code> raises <code>requests.exceptions.SSLError</code>. Write the code for the real behaviour.</p></div>

<h3>The first script</h3>
<p><code>status.py</code> asks the monitor area for the system status, prints three facts, and turns a refusal into one line and exit code 1:</p>
<pre class="code">import sys

from fgt import FortiError, call, session

try:
    st = call(session(), "GET", "/monitor/system/status")
except FortiError as err:
    print("rejected:", err)
    sys.exit(1)
print("%s %s serial %s" % (st["results"]["hostname"], st["version"], st["serial"]))</pre>
<pre class="out">AUTO01$ python3 status.py
<span class="hl">FGT1 v7.4.4 serial FGVMEV5I0AL40000</span></pre>
<p>To see what the firewall really sent, print the whole reply once. The shape is the same for every endpoint:</p>
<pre class="code">import json

from fgt import call, session

print(json.dumps(call(session(), "GET", "/monitor/system/status"), indent=1))</pre>
<pre class="out">AUTO01$ python3 raw.py
{
 "http_method": "GET",
 "results": {
  "model_name": "FortiGate",
  "model_number": "VM64",
  "model": "FGVM64",
  "hostname": "FGT1",
  "log_disk_status": "available"
 },
 "vdom": "root",
 "path": "system",
<span class="hl"> "name": "status",</span>
<span class="hl"> "status": "success",</span>
<span class="hl"> "http_status": 200,</span>
<span class="hl"> "serial": "FGVMEV5I0AL40000",</span>
<span class="hl"> "version": "v7.4.4",</span>
 "build": 2662
}</pre>
<p>The <b>envelope</b> has fixed fields: <code>http_method</code> echoes your verb, <code>results</code> holds the answer (a dictionary here, a list for a table), <code>vdom</code>, <code>path</code> and <code>name</code> say what was addressed, <code>status</code> is <code>success</code> or <code>error</code>, <code>http_status</code> repeats the status code, and <code>serial</code>, <code>version</code>, <code>build</code> identify the firewall. Checking <code>serial</code> in a multi-firewall script is a cheap way to be sure you changed the box you meant to.</p>

<div class="eg"><p><b>Worked example: where did that status come from?</b> Two ways to ask the same question. In <code>curl</code>: <code>curl -sk -H "Authorization: Bearer $FGT_TOKEN" .../api/v2/monitor/system/status</code>. In Python: <code>call(session(), "GET", "/monitor/system/status")</code>. Same URL, same header, same envelope. When Python fails and curl works (or the other way round), the difference is in your script, not the firewall: that is the quickest test there is.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>timeout</code>. Building the URL by hand in ten places instead of one <code>BASE</code>. Calling <code>r.json()</code> before checking the status: an error page may not be JSON. Printing the whole <code>Session</code> or its headers.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cmdb</code> is configuration, <code>monitor</code> is live state. A question that asks for "the routing table in use" wants <code>monitor/router/ipv4</code>, not <code>cmdb/router/static</code>, which is only what an engineer typed.</p></div>

<div class="scn"><h4>Curl worked, Python hung</h4><p>A script froze for twenty minutes during a change window. The same <code>curl</code> command answered in a second. The difference: the script ran from a build server whose address was not in the key's trusted hosts, and the firewall dropped the connection instead of answering. The script had no <code>timeout</code>, so it waited. With <code>timeout=5</code> it would have failed in five seconds with a message that pointed at the network path.</p><p><b>Lesson:</b> every call gets a timeout, and a hang is a network or access-list question before it is an API question.</p></div>

<div class="iv"><p class="q">"What does a good API client wrapper do?"</p><p>It reads the secret from the environment, sets a timeout on every call, attaches the auth header once, raises one clear exception that carries the status code and the device's own error number, and never prints headers. Everything else in the project imports it, so a fix happens in one place.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS URLs: <code>/api/v2/</code> + <code>cmdb</code> (configuration) or <code>monitor</code> (live state) + table + optional key + query string.</li>
<li>The key goes in <code>Authorization: Bearer ...</code>, read from the environment.</li>
<li>Always set <code>timeout</code>; use a <code>Session</code>; raise one exception type for failed calls.</li>
<li><code>verify=False</code> is a lab shortcut; real firewalls need a trusted certificate or a pinned one.</li>
<li>Read the whole envelope: <code>status</code>, <code>http_status</code>, <code>serial</code>, <code>version</code>.</li>
</ul></div>
`,hi:`
<p>Aapke paas <code>FGT_TOKEN</code> mein key hai. Yeh chapter use Python mein ek chhote, reusable FortiOS client mein badalta hai: <code>fgt.py</code>. Module ki har agli script ise import karti hai. Yeh Lab 1, step 2 hai. <code>requests</code> aap <code>auto-requests</code> se jaante ho; yahan dhyan is par hai ki firewall se baat karne mein kya khaas hai.</p>

<h3>Ek analogy: address, stamp aur receipt wala letter</h3>
<p>REST call ek registered letter hai. <b>URL</b> address hai, <b>method</b> (GET, POST, PUT, DELETE) batata hai ki kya karwana hai, <b>headers</b> stamp aur aapka signature hain, aur <b>reply</b> woh receipt hai jo batati hai ki post office ne letter liya ya nahi. Laparwah bhejne wala receipt fenk deta hai. Achha bhejne wala har baar padhta hai.</p>

<h3>FortiOS URL ki banawat</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="FortiOS REST v2 URL ki banawat"><rect x="8" y="20" width="84" height="50" rx="10" fill="#e2e8f0"/><text x="50" y="49" text-anchor="middle" class="svg-ink" font-size="12">/api/v2</text><rect x="100" y="20" width="128" height="50" rx="10" fill="#bae6fd"/><text x="164" y="42" text-anchor="middle" class="svg-ink" font-size="12">/cmdb</text><text x="164" y="59" text-anchor="middle" class="svg-muted" font-size="11">configuration</text><rect x="236" y="20" width="140" height="50" rx="10" fill="#fde68a"/><text x="306" y="42" text-anchor="middle" class="svg-ink" font-size="12">/firewall/address</text><text x="306" y="59" text-anchor="middle" class="svg-muted" font-size="11">table</text><rect x="384" y="20" width="80" height="50" rx="10" fill="#bbf7d0"/><text x="424" y="42" text-anchor="middle" class="svg-ink" font-size="12">/web1</text><text x="424" y="59" text-anchor="middle" class="svg-muted" font-size="11">ek object</text><rect x="472" y="20" width="160" height="50" rx="10" fill="#ddd6fe"/><text x="552" y="42" text-anchor="middle" class="svg-ink" font-size="12">?filter=name==web1</text><text x="552" y="59" text-anchor="middle" class="svg-muted" font-size="11">options</text><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">ya configuration ki jagah live state:</text><rect x="100" y="124" width="128" height="50" rx="10" fill="#fed7aa"/><text x="164" y="146" text-anchor="middle" class="svg-ink" font-size="12">/monitor</text><text x="164" y="163" text-anchor="middle" class="svg-muted" font-size="11">state</text><rect x="236" y="124" width="200" height="50" rx="10" fill="#fed7aa"/><text x="336" y="146" text-anchor="middle" class="svg-ink" font-size="12">/system/status</text><text x="336" y="163" text-anchor="middle" class="svg-muted" font-size="11">path</text></svg><p class="cap">cmdb configuration hai, monitor live state. Query string jawab ko filter aur chhota karti hai.</p></div>
<p>Sab kuch <code>/api/v2</code> se shuru hota hai. Phir <b>area</b> aata hai: <code>cmdb</code> configuration hai (jo aapne configure kiya), <code>monitor</code> live state hai (abhi kya ho raha hai). Phir table ka path, jaise <code>firewall/address</code>, phir optionally ek object ki key, phir query string. Dono lab firewalls 443 par sunte hain, administration web port.</p>

<h3>Client</h3>
<p><code>fgt.py</code> ka pehla aadha likho. Iske teen kaam hain: key ke bina kabhi na chalna, key ko <code>Bearer</code> header ki tarah lagana, aur fail hui call ko ek saaf exception mein badalna jo status code aur FortiOS error number rakhe.</p>
<pre class="code">"""fgt.py - FortiOS REST v2 client for FGT1. The API key comes from the environment, never from this file."""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.41/api/v2"
TIMEOUT = 5


class FortiError(Exception):
    """A FortiOS answer that is not a success: keeps the status code and the FortiOS error number."""

    def __init__(self, method, path, response):
        body = response.json()
        lines = (body.get("cli_error") or "").strip().splitlines()
        self.status = response.status_code
        self.code = body.get("error")
        self.detail = lines[0] if lines else ""
        super().__init__(("%s %s -&gt; status %s, FortiOS error %s %s" % (method, path, self.status, self.code, self.detail)).rstrip())


def session():
    key = os.environ.get("FGT_TOKEN")
    if not key:
        sys.exit("FGT_TOKEN is not set - export it in this shell, never write the key into a file")
    s = requests.Session()
    s.headers.update({"Authorization": "Bearer " + key})
    s.verify = False        <span class="c"># lab: self-signed certificate. Real gear: verify="/path/to/ca-bundle.pem"</span>
    return s


def call(s, method, path, **kw):
    r = s.request(method, BASE + path, timeout=TIMEOUT, **kw)
    if r.status_code &gt;= 400:
        raise FortiError(method, path, r)
    return r.json()</pre>
<p>Chaar baatein zaroori hain. <code>sys.exit("message")</code> message print karta hai aur code 1 se exit karta hai, isliye key na ho to script kisi bhi call se pehle ruk jaati hai. <code>Session</code> har request ke liye header rakhta hai. <code>timeout=5</code> practice mein zaroori hai: iske bina <code>requests</code> us firewall ka intezaar karta rehta hai jo aapke packets drop karta hai. Aur <code>verify=False</code> sirf isliye hai kyunki lab firewall ka certificate self-signed hai.</p>
<div class="warn"><p><b>verify=False ko production mein copy mat karo.</b> Yeh woh check band kar deta hai ki aap sahi firewall se baat kar rahe ho. Asli gear par firewall par apna certificate authority install karo aur <code>verify="/path/to/ca-bundle.pem"</code> do, ya firewall ka certificate pin karo. <code>curl</code> dikhata hai ki check kya karta hai; <code>-k</code> ke bina woh self-signed certificate refuse karta hai:</p></div>
<pre class="out">AUTO01$ curl -s h&#116;tps://10.99.0.41/api/v2/monitor/system/status
<span class="hl">curl: (60) SSL certificate problem: self-signed certificate</span></pre>
<div class="note"><p><b>Lab vs asli gear.</b> Lab ka <code>requests</code> certificates verify nahi karta, <code>verify=True</code> par bhi. Asli <code>requests</code> <code>requests.exceptions.SSLError</code> raise karta hai. Code asli behaviour ke liye likho.</p></div>

<h3>Pehli script</h3>
<p><code>status.py</code> monitor area se system status maangti hai, teen facts print karti hai, aur refusal ko ek line aur exit code 1 mein badalti hai:</p>
<pre class="code">import sys

from fgt import FortiError, call, session

try:
    st = call(session(), "GET", "/monitor/system/status")
except FortiError as err:
    print("rejected:", err)
    sys.exit(1)
print("%s %s serial %s" % (st["results"]["hostname"], st["version"], st["serial"]))</pre>
<pre class="out">AUTO01$ python3 status.py
<span class="hl">FGT1 v7.4.4 serial FGVMEV5I0AL40000</span></pre>
<p>Firewall ne asal mein kya bheja dekhne ke liye poora reply ek baar print karo. Shape har endpoint ke liye wahi hai:</p>
<pre class="code">import json

from fgt import call, session

print(json.dumps(call(session(), "GET", "/monitor/system/status"), indent=1))</pre>
<pre class="out">AUTO01$ python3 raw.py
{
 "http_method": "GET",
 "results": {
  "model_name": "FortiGate",
  "model_number": "VM64",
  "model": "FGVM64",
  "hostname": "FGT1",
  "log_disk_status": "available"
 },
 "vdom": "root",
 "path": "system",
<span class="hl"> "name": "status",</span>
<span class="hl"> "status": "success",</span>
<span class="hl"> "http_status": 200,</span>
<span class="hl"> "serial": "FGVMEV5I0AL40000",</span>
<span class="hl"> "version": "v7.4.4",</span>
 "build": 2662
}</pre>
<p><b>Envelope</b> ke fixed fields hain: <code>http_method</code> aapka verb dohrata hai, <code>results</code> mein jawab hai (yahan dictionary, table ke liye list), <code>vdom</code>, <code>path</code> aur <code>name</code> batate hain ki kya address hua, <code>status</code> <code>success</code> ya <code>error</code> hai, <code>http_status</code> status code dohrata hai, aur <code>serial</code>, <code>version</code>, <code>build</code> firewall ki pehchaan hain. Multi-firewall script mein <code>serial</code> check karna yeh pakka karne ka sasta tareeka hai ki aapne wahi box badla jo chaaha tha.</p>

<div class="eg"><p><b>Worked example: yeh status kahan se aaya?</b> Ek hi sawal do tareeke se. <code>curl</code> mein: <code>curl -sk -H "Authorization: Bearer $FGT_TOKEN" .../api/v2/monitor/system/status</code>. Python mein: <code>call(session(), "GET", "/monitor/system/status")</code>. Wahi URL, wahi header, wahi envelope. Jab Python fail ho aur curl chale (ya ulta), farq aapki script mein hai, firewall mein nahi: isse tez test koi nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>timeout</code> bhool jaana. URL ko ek <code>BASE</code> ki jagah das jagah haath se banana. Status dekhe bina <code>r.json()</code> bulana: error page JSON na ho sakta hai. Poora <code>Session</code> ya uske headers print karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>cmdb</code> configuration hai, <code>monitor</code> live state. "Use mein routing table" maangne wale sawal ko <code>monitor/router/ipv4</code> chahiye, <code>cmdb/router/static</code> nahi, jo sirf wahi hai jo engineer ne type kiya.</p></div>

<div class="scn"><h4>Curl chala, Python latak gaya</h4><p>Change window mein ek script bees minute atki rahi. Wahi <code>curl</code> command ek second mein jawab de deti thi. Farq: script ek build server se chali jiska address key ke trusted hosts mein nahi tha, aur firewall ne jawab dene ki jagah connection drop kiya. Script mein <code>timeout</code> nahi tha, isliye woh intezaar karti rahi. <code>timeout=5</code> hota to paanch second mein fail hoti, aise message ke saath jo network path ki taraf ishara karta.</p><p><b>Lesson:</b> har call ko timeout milta hai, aur hang pehle network ya access-list ka sawal hai, API ka baad mein.</p></div>

<div class="iv"><p class="q">"Achha API client wrapper kya karta hai?"</p><p>Secret environment se padhta hai, har call par timeout lagata hai, auth header ek baar lagata hai, ek saaf exception raise karta hai jo status code aur device ka apna error number rakhti hai, aur headers kabhi print nahi karta. Project ki baaki sab cheezein ise import karti hain, isliye fix ek hi jagah hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FortiOS URLs: <code>/api/v2/</code> + <code>cmdb</code> (configuration) ya <code>monitor</code> (live state) + table + optional key + query string.</li>
<li>Key <code>Authorization: Bearer ...</code> mein jaati hai, environment se padhi hui.</li>
<li>Hamesha <code>timeout</code> lagao; <code>Session</code> use karo; fail hui calls ke liye ek hi exception type raise karo.</li>
<li><code>verify=False</code> lab ka shortcut hai; asli firewalls ko trusted ya pinned certificate chahiye.</li>
<li>Poora envelope padho: <code>status</code>, <code>http_status</code>, <code>serial</code>, <code>version</code>.</li>
</ul></div>
`}};export{e as default};