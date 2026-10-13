var e={id:`errors`,h:{en:`When a call fails: status codes, FortiOS error numbers and retries`,hi:`Jab call fail ho: status codes, FortiOS error numbers aur retries`},body:{en:`
<p>Every script meets a failure sooner or later. The skill is to read it in seconds and to decide: fix the request, fix the key, fix the network, or try again. This chapter builds a short reading routine, shows the failures you can produce on purpose in the lab, and ends with a retry policy that never makes things worse.</p>

<h3>An analogy: a letter that did not arrive</h3>
<p>The post office tells you different things. "No such street" (the address is wrong). "Recipient refused" (you were not allowed). "Return to sender, door closed" (nobody home). Silence for three weeks (lost in the post). Each needs a different response, and none is fixed by sending the same letter again and again.</p>

<h3>Four layers, read from the bottom</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Five layers where an API call can fail"><rect x="8" y="30" width="118" height="70" rx="10" fill="#fecaca"/><text x="67" y="62" text-anchor="middle" class="svg-ink" font-size="12">Network</text><text x="67" y="79" text-anchor="middle" class="svg-muted" font-size="11">refused, timeout</text><line x1="126" y1="65" x2="138" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="138,65 130,61 130,69" fill="#64748b"/><rect x="138" y="30" width="118" height="70" rx="10" fill="#fed7aa"/><text x="197" y="62" text-anchor="middle" class="svg-ink" font-size="12">TLS</text><text x="197" y="79" text-anchor="middle" class="svg-muted" font-size="11">certificate</text><line x1="256" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="268,65 260,61 260,69" fill="#64748b"/><rect x="268" y="30" width="118" height="70" rx="10" fill="#fde68a"/><text x="327" y="62" text-anchor="middle" class="svg-ink" font-size="12">Key</text><text x="327" y="79" text-anchor="middle" class="svg-muted" font-size="11">401, -37</text><line x1="386" y1="65" x2="398" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="398,65 390,61 390,69" fill="#64748b"/><rect x="398" y="30" width="118" height="70" rx="10" fill="#ddd6fe"/><text x="457" y="62" text-anchor="middle" class="svg-ink" font-size="12">Caller</text><text x="457" y="79" text-anchor="middle" class="svg-muted" font-size="11">403, -14</text><line x1="516" y1="65" x2="528" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="528,65 520,61 520,69" fill="#64748b"/><rect x="528" y="30" width="104" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Data</text><text x="580" y="79" text-anchor="middle" class="svg-muted" font-size="11">404 424 500</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">Stop at the first layer that fails.</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">A fix for layer 4 cannot help a problem in layer 1.</text><text x="70" y="126" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="197" y="126" text-anchor="middle" class="svg-accent" font-size="14">2</text><text x="327" y="126" text-anchor="middle" class="svg-accent" font-size="14">3</text><text x="457" y="126" text-anchor="middle" class="svg-accent" font-size="14">4</text><text x="580" y="126" text-anchor="middle" class="svg-accent" font-size="14">5</text></svg><p class="cap">Read the failure from the left. The first layer that says no is the one to fix.</p></div>
<p>Always read a failure from the network upwards: (1) <b>network</b>, did anything answer at all? (2) <b>TLS</b>, was the certificate accepted? (3) <b>status plus FortiOS error number</b>, did the firewall understand and accept the key and the request? (4) <b>logic</b>, is the content of the change valid? A Python exception tells you the layer: a <code>requests</code> exception means layers 1 and 2; <code>FortiError</code> (the one from your client) means the firewall answered.</p>

<h3>The failures you can produce on purpose</h3>
<p><code>errors.py</code> sends eight requests and prints the status code, the FortiOS <code>error</code> number and the envelope <code>status</code> of each:</p>
<pre class="code">import os

import requests

BASE = "h&#116;tps://10.99.0.41/api/v2"
GOOD = os.environ["FGT_TOKEN"]


def attempt(label, method, path, token=GOOD, **kw):
    r = requests.request(method, BASE + path, headers={"Authorization": "Bearer " + token}, verify=False, timeout=5, **kw)
    body = r.json()
    print("%-26s status %s  error %-5s %s" % (label, r.status_code, body.get("error"), body.get("status")))


POLICY = {"name": "p", "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}], "srcaddr": [{"name": "all"}],
          "dstaddr": [{"name": "all"}], "action": "accept", "schedule": "always", "service": [{"name": "ALL"}]}
attempt("good key", "GET", "/monitor/system/status")
attempt("wrong key", "GET", "/monitor/system/status", token="notakey")
attempt("missing object", "GET", "/cmdb/firewall/address/ghost")
attempt("duplicate address", "POST", "/cmdb/firewall/address", json={"name": "web1", "subnet": "10.20.0.10 255.255.255.255"})
attempt("bad value", "POST", "/cmdb/firewall/address", json={"name": "bad1", "subnet": "10.20.0.999 255.255.255.255"})
attempt("policy, bad interface", "POST", "/cmdb/firewall/policy", json=dict(POLICY, srcintf=[{"name": "port9"}]))
attempt("policy, bad address", "POST", "/cmdb/firewall/policy", json=dict(POLICY, srcaddr=[{"name": "ghost"}]))
attempt("delete address in use", "DELETE", "/cmdb/firewall/address/web1")</pre>
<pre class="out">AUTO01$ python3 errors.py
good key                   status 200  error None  success
<span class="hl">wrong key                  status 401  error -37   error</span>
<span class="hl">missing object             status 404  error -3    error</span>
<span class="hl">duplicate address          status 424  error -5    error</span>
<span class="hl">bad value                  status 500  error -651  error</span>
<span class="hl">policy, bad interface      status 424  error -3    error</span>
<span class="hl">policy, bad address        status 424  error -3    error</span>
<span class="hl">delete address in use      status 500  error -23   error</span></pre>
<table>
<tr><th>Status / error</th><th>What it says</th><th>What you do</th></tr>
<tr><td>200 / none</td><td>success</td><td>read the result anyway</td></tr>
<tr><td>401 / -37</td><td>the key is not accepted (wrong, rotated, removed)</td><td>check <code>FGT_TOKEN</code>; never retry</td></tr>
<tr><td>403 / -14</td><td>valid key, but not allowed from here or not allowed to do this</td><td>trusted hosts, profile permissions</td></tr>
<tr><td>404 / -3</td><td>no such object or path</td><td>spelling, or "create it"</td></tr>
<tr><td>424 / -5</td><td>the entry already exists</td><td>use ensure()</td></tr>
<tr><td>500 / -651</td><td>a value that FortiOS cannot parse</td><td>fix the value (here an address with 999)</td></tr>
<tr><td>424 / -3</td><td>a policy refers to something that does not exist</td><td>read <code>cli_error</code> for the name</td></tr>
<tr><td>500 / -23</td><td>cannot delete, the entry is in use</td><td>find who uses it first</td></tr>
</table>
<div class="warn"><p><b>Do not memorise the status next to the number.</b> The same FortiOS error number is answered with 424 on one firmware build and 500 on another (the duplicate entry and the in-use cases are the famous ones). The <b>error number</b> and the <code>cli_error</code> text are the stable part. Write your checks on <code>err.error</code>, and treat the HT&#84;P status as a rough class: 4xx means "I refused your request", 5xx means "I tried and could not".</p></div>

<h3>The 403 that depends on where you stand</h3>
<p>The most confusing failure is a perfectly good key that is refused. The cause is the <b>trusted hosts</b> list of the api-user. To see it, create a second api-user whose trusted network does not include the automation host, and call with its key:</p>
<pre class="code">config system api-user
    edit other
        set accprofile fwapi
        set vdom root
        config trusthost
            edit 1
                set ipv4-trusthost 10.50.0.0 255.255.255.0
            next
        end
    next
end</pre>
<pre class="out">AUTO01$ curl -sk -i h&#116;tps://10.99.0.41/api/v2/monitor/system/status -H "Authorization: Bearer $OTHER_TOKEN"
<span class="hl">HT&#84;P/1.1 403 Forbidden</span>
Server: xxxxxxxx-xxxxx
Date: Sun, 11 Oct 2026 12:02:57 GMT
Content-Type: application/json
Content-Length: 150
Connection: keep-alive

{
  "http_method":"GET",
<span class="hl">  "status":"error",</span>
<span class="hl">  "http_status":403,</span>
<span class="hl">  "error":-14,</span>
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<p>The envelope says <code>status 403, error -14</code>. Nothing is wrong with the key's text; the firewall looked at the <b>source address</b> of the request, saw 10.99.0.60, and found it outside 10.50.0.0/24. In Lab 2 you meet the same error from the other side: the key is right and a trusted host is missing.</p>

<h3>Cannot connect at all</h3>
<p>When the firewall never answers, there is no status code. <code>requests</code> raises an exception, and the two common ones mean different things:</p>
<pre class="code">import os

import requests

URL = "h&#116;tps://10.99.0.41:8443/api/v2/monitor/system/status"
try:
    requests.get(URL, headers={"Authorization": "Bearer " + os.environ["FGT_TOKEN"]}, verify=False, timeout=3)
except requests.exceptions.Timeout as err:
    print("Timeout:", err)
except requests.exceptions.ConnectionError as err:
    print("ConnectionError:", err)</pre>
<pre class="out">AUTO01$ python3 closed.py
<span class="hl">Timeout: HTTPSConnectionPool(host='10.99.0.41', port=8443): Max retries exceeded with url: /api/v2/monitor/system/status (Caused by NewConnectionError: Connection timed out)</span></pre>
<ul>
<li><b>Timeout</b>: silence. Something dropped the packet, there is no route, or the host is down. The usual suspects are an access list, a wrong address, or a firewall rule in between.</li>
<li><b>ConnectionError, "Connection refused"</b>: the host answered "nothing listens here". The address is right, the port or service is wrong. In Lab 2 the first wall is exactly this: the administration port was moved to 8443 and the script still called 443.</li>
</ul>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab raises <code>requests.exceptions.Timeout</code>; real <code>requests</code> raises <code>ConnectTimeout</code> or <code>ReadTimeout</code>, both subclasses of <code>Timeout</code>, so catching <code>Timeout</code> works everywhere. The lab shortens the ConnectionError text and leaves out the query string; the traceback in a real Python has more frames. Write <code>except</code> clauses for the class, never for the text.</p></div>

<h3>A retry policy that does no harm</h3>
<ul>
<li><b>Never retry</b> 401, 403, 404, 424 and 400: the same request fails the same way. Fix it.</li>
<li><b>Retry with a short pause and a small limit</b> (three tries, growing pause) on timeouts and on 5xx errors that are not "in use" or "bad value", but <b>only for reads or for ensure()</b>. Because ensure() reads first, a second try after a timeout cannot create a duplicate.</li>
<li><b>Never blind-retry a bare POST</b>: after a timeout you do not know if the first one arrived.</li>
<li><b>Log the error number</b>, the path and the method. Never log headers or the key.</li>
</ul>

<div class="eg"><p><b>Worked example: reading one failure in ten seconds.</b> The log says <code>POST /cmdb/firewall/policy -> status 424, FortiOS error -3 ... value parse error before 'db-srv1'</code>. Layer 1 and 2 are fine (the firewall answered). Layer 3: key accepted, request understood. Layer 4: the policy refers to an object that is not there, and the text names it: <code>db-srv1</code>, one character too many. One look, one fix, no guessing.</p></div>

<h3>One more: the delete that is refused</h3>
<p>Deleting an object that a policy or group still uses is refused. The envelope carries the reason in <code>cli_error</code>:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE h&#116;tps://10.99.0.41:8443/api/v2/cmdb/firewall/address/db-srv -w "\\n%{http_code}\\n"
{
  "http_method":"DELETE",
  "path":"firewall",
  "name":"address",
  "mkey":"db-srv",
<span class="hl">  "error":-23,</span>
<span class="hl">  "cli_error":"The entry is used by other 1 entries\\nCommand fail. Return code -23\\n",</span>
  "status":"error",
<span class="hl">  "http_status":500,</span>
  "vdom":"root",
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">500</span></pre>
<p>"The entry is used by other 1 entries" is the sentence to look for. The fix is to find the user of the object (a policy or a group) and change that first.</p>

<div class="exam"><p><b>Exam trap.</b> 401 means "who are you?" (the key), 403 means "you may not" (permission or trusted host). A rotated key gives 401, not 403. And the token in the URL (<code>?access_token=</code>) works too, but leaks into logs and proxy history; headers are the correct place.</p></div>

<div class="scn"><h4>The retry storm</h4><p>A script retried every failed POST ten times without a pause. On a Monday morning the firewall was slow, the calls timed out, and ten copies of each request queued up. Half of them arrived late, found the object already there, and returned -5. The monitoring system raised an alarm for "configuration errors" and the on-call engineer lost an hour.</p><p><b>Lesson:</b> retry only what is safe to repeat, with a limit and a pause, and make the creation itself idempotent.</p></div>

<div class="iv"><p class="q">"A REST call to a firewall fails. How do you decide what to do?"</p><p>I read from the bottom: did anything answer, was TLS accepted, what is the status and the device's own error number, and is the content valid. Timeouts are a network question, 401 is the key, 403 is permission or trusted hosts, 404 is a missing object, 424 or 500 with an error number is a content or state problem, which I read from the error number rather than the status. I retry only safe operations, with a limit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read failures from the network upward: connect, TLS, status plus error number, content.</li>
<li>401 -37 key; 403 -14 trusted host or permission; 404 -3 not found; -5 duplicate; -651 bad value; -23 in use.</li>
<li>The status class for the same error number differs between builds; match on the number.</li>
<li>Timeout = silence; Connection refused = wrong port or service.</li>
<li>Retry only reads and idempotent calls, with a pause and a limit; never log headers.</li>
</ul></div>
`,hi:`
<p>Har script ko kabhi na kabhi failure milta hai. Hunar yeh hai ki use kuch seconds mein padho aur tay karo: request theek karo, key theek karo, network theek karo, ya dobara try karo. Yeh chapter ek chhota padhne ka routine banata hai, woh failures dikhata hai jo aap lab mein jaan-boojh kar paida kar sakte ho, aur ek retry policy par khatam hota hai jo cheezein kabhi bigaadti nahi.</p>

<h3>Ek analogy: woh letter jo pahuncha nahi</h3>
<p>Post office alag alag baatein batata hai. "Aisi koi gali nahi" (address galat). "Receiver ne mana kiya" (aapko ijaazat nahi thi). "Wapas bhej do, darwaza band" (koi ghar par nahi). Teen hafte ki khamoshi (daak mein kho gaya). Har ek ka alag jawab hai, aur wahi letter baar baar bhejne se koi theek nahi hota.</p>

<h3>Chaar layers, neeche se padho</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Paanch layers jahan API call fail ho sakti hai"><rect x="8" y="30" width="118" height="70" rx="10" fill="#fecaca"/><text x="67" y="62" text-anchor="middle" class="svg-ink" font-size="12">Network</text><text x="67" y="79" text-anchor="middle" class="svg-muted" font-size="11">refused, timeout</text><line x1="126" y1="65" x2="138" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="138,65 130,61 130,69" fill="#64748b"/><rect x="138" y="30" width="118" height="70" rx="10" fill="#fed7aa"/><text x="197" y="62" text-anchor="middle" class="svg-ink" font-size="12">TLS</text><text x="197" y="79" text-anchor="middle" class="svg-muted" font-size="11">certificate</text><line x1="256" y1="65" x2="268" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="268,65 260,61 260,69" fill="#64748b"/><rect x="268" y="30" width="118" height="70" rx="10" fill="#fde68a"/><text x="327" y="62" text-anchor="middle" class="svg-ink" font-size="12">Key</text><text x="327" y="79" text-anchor="middle" class="svg-muted" font-size="11">401, -37</text><line x1="386" y1="65" x2="398" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="398,65 390,61 390,69" fill="#64748b"/><rect x="398" y="30" width="118" height="70" rx="10" fill="#ddd6fe"/><text x="457" y="62" text-anchor="middle" class="svg-ink" font-size="12">Caller</text><text x="457" y="79" text-anchor="middle" class="svg-muted" font-size="11">403, -14</text><line x1="516" y1="65" x2="528" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="528,65 520,61 520,69" fill="#64748b"/><rect x="528" y="30" width="104" height="70" rx="10" fill="#bbf7d0"/><text x="580" y="62" text-anchor="middle" class="svg-ink" font-size="12">Data</text><text x="580" y="79" text-anchor="middle" class="svg-muted" font-size="11">404 424 500</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">Pehli fail hone wali layer par ruko.</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="12">Layer 4 ka fix layer 1 ki problem nahi sulajhata.</text><text x="70" y="126" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="197" y="126" text-anchor="middle" class="svg-accent" font-size="14">2</text><text x="327" y="126" text-anchor="middle" class="svg-accent" font-size="14">3</text><text x="457" y="126" text-anchor="middle" class="svg-accent" font-size="14">4</text><text x="580" y="126" text-anchor="middle" class="svg-accent" font-size="14">5</text></svg><p class="cap">Failure ko left se padho. Jo pehli layer na kahe, wahi theek karni hai.</p></div>
<p>Failure hamesha network se upar ki taraf padho: (1) <b>network</b>, kuch jawab bhi aaya? (2) <b>TLS</b>, certificate accept hua? (3) <b>status aur FortiOS error number</b>, kya firewall ne key aur request samjhi aur maani? (4) <b>logic</b>, change ka content valid hai? Python exception layer batata hai: <code>requests</code> exception ka matlab layer 1 aur 2; <code>FortiError</code> (aapke client wala) ka matlab firewall ne jawab diya.</p>

<h3>Woh failures jo aap jaan-boojh kar bana sakte ho</h3>
<p><code>errors.py</code> aath requests bhejti hai aur har ek ka status code, FortiOS <code>error</code> number aur envelope <code>status</code> print karti hai:</p>
<pre class="code">import os

import requests

BASE = "h&#116;tps://10.99.0.41/api/v2"
GOOD = os.environ["FGT_TOKEN"]


def attempt(label, method, path, token=GOOD, **kw):
    r = requests.request(method, BASE + path, headers={"Authorization": "Bearer " + token}, verify=False, timeout=5, **kw)
    body = r.json()
    print("%-26s status %s  error %-5s %s" % (label, r.status_code, body.get("error"), body.get("status")))


POLICY = {"name": "p", "srcintf": [{"name": "port2"}], "dstintf": [{"name": "port1"}], "srcaddr": [{"name": "all"}],
          "dstaddr": [{"name": "all"}], "action": "accept", "schedule": "always", "service": [{"name": "ALL"}]}
attempt("good key", "GET", "/monitor/system/status")
attempt("wrong key", "GET", "/monitor/system/status", token="notakey")
attempt("missing object", "GET", "/cmdb/firewall/address/ghost")
attempt("duplicate address", "POST", "/cmdb/firewall/address", json={"name": "web1", "subnet": "10.20.0.10 255.255.255.255"})
attempt("bad value", "POST", "/cmdb/firewall/address", json={"name": "bad1", "subnet": "10.20.0.999 255.255.255.255"})
attempt("policy, bad interface", "POST", "/cmdb/firewall/policy", json=dict(POLICY, srcintf=[{"name": "port9"}]))
attempt("policy, bad address", "POST", "/cmdb/firewall/policy", json=dict(POLICY, srcaddr=[{"name": "ghost"}]))
attempt("delete address in use", "DELETE", "/cmdb/firewall/address/web1")</pre>
<pre class="out">AUTO01$ python3 errors.py
good key                   status 200  error None  success
<span class="hl">wrong key                  status 401  error -37   error</span>
<span class="hl">missing object             status 404  error -3    error</span>
<span class="hl">duplicate address          status 424  error -5    error</span>
<span class="hl">bad value                  status 500  error -651  error</span>
<span class="hl">policy, bad interface      status 424  error -3    error</span>
<span class="hl">policy, bad address        status 424  error -3    error</span>
<span class="hl">delete address in use      status 500  error -23   error</span></pre>
<table>
<tr><th>Status / error</th><th>Kya kehta hai</th><th>Aap kya karo</th></tr>
<tr><td>200 / none</td><td>success</td><td>phir bhi result padho</td></tr>
<tr><td>401 / -37</td><td>key accept nahi (galat, rotate hui, hata di gayi)</td><td><code>FGT_TOKEN</code> check karo; retry kabhi nahi</td></tr>
<tr><td>403 / -14</td><td>key sahi, par yahan se ya yeh karne ki ijaazat nahi</td><td>trusted hosts, profile permissions</td></tr>
<tr><td>404 / -3</td><td>aisa object ya path nahi</td><td>spelling, ya "bana do"</td></tr>
<tr><td>424 / -5</td><td>entry pehle se hai</td><td>ensure() use karo</td></tr>
<tr><td>500 / -651</td><td>aisi value jo FortiOS parse nahi kar sakta</td><td>value theek karo (yahan 999 wala address)</td></tr>
<tr><td>424 / -3</td><td>policy aisi cheez ko refer karti hai jo hai nahi</td><td>naam ke liye <code>cli_error</code> padho</td></tr>
<tr><td>500 / -23</td><td>delete nahi ho sakta, entry use mein hai</td><td>pehle dhoondho kaun use karta hai</td></tr>
</table>
<div class="warn"><p><b>Number ke saath wala status ratto mat.</b> Wahi FortiOS error number ek firmware build par 424 aur doosre par 500 ke saath aata hai (duplicate entry aur in-use cases mashhoor hain). <b>Error number</b> aur <code>cli_error</code> text stable hissa hain. Apne checks <code>err.error</code> par likho, aur HT&#84;P status ko mota class samjho: 4xx ka matlab "maine aapki request refuse ki", 5xx ka matlab "maine koshish ki par ho nahi saka".</p></div>

<h3>Woh 403 jo is par depend karta hai ki aap kahan khade ho</h3>
<p>Sabse confusing failure ek bilkul sahi key ka refuse hona hai. Wajah api-user ki <b>trusted hosts</b> list hai. Dekhne ke liye doosra api-user banao jiske trusted network mein automation host nahi hai, aur uski key se call karo:</p>
<pre class="code">config system api-user
    edit other
        set accprofile fwapi
        set vdom root
        config trusthost
            edit 1
                set ipv4-trusthost 10.50.0.0 255.255.255.0
            next
        end
    next
end</pre>
<pre class="out">AUTO01$ curl -sk -i h&#116;tps://10.99.0.41/api/v2/monitor/system/status -H "Authorization: Bearer $OTHER_TOKEN"
<span class="hl">HT&#84;P/1.1 403 Forbidden</span>
Server: xxxxxxxx-xxxxx
Date: Sun, 11 Oct 2026 12:02:57 GMT
Content-Type: application/json
Content-Length: 150
Connection: keep-alive

{
  "http_method":"GET",
<span class="hl">  "status":"error",</span>
<span class="hl">  "http_status":403,</span>
<span class="hl">  "error":-14,</span>
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<p>Envelope kehta hai <code>status 403, error -14</code>. Key ke text mein koi galti nahi; firewall ne request ka <b>source address</b> dekha, 10.99.0.60 paaya, aur use 10.50.0.0/24 ke bahar paaya. Lab 2 mein aap wahi error doosri taraf se milte ho: key sahi hai aur trusted host missing hai.</p>

<h3>Connect hi nahi hota</h3>
<p>Jab firewall kabhi jawab nahi deta, status code hota hi nahi. <code>requests</code> exception raise karta hai, aur do aam exceptions ka matlab alag hai:</p>
<pre class="code">import os

import requests

URL = "h&#116;tps://10.99.0.41:8443/api/v2/monitor/system/status"
try:
    requests.get(URL, headers={"Authorization": "Bearer " + os.environ["FGT_TOKEN"]}, verify=False, timeout=3)
except requests.exceptions.Timeout as err:
    print("Timeout:", err)
except requests.exceptions.ConnectionError as err:
    print("ConnectionError:", err)</pre>
<pre class="out">AUTO01$ python3 closed.py
<span class="hl">Timeout: HTTPSConnectionPool(host='10.99.0.41', port=8443): Max retries exceeded with url: /api/v2/monitor/system/status (Caused by NewConnectionError: Connection timed out)</span></pre>
<ul>
<li><b>Timeout</b>: khamoshi. Kisi ne packet drop kiya, route nahi, ya host down. Aam shubhe: access list, galat address, ya beech ki firewall rule.</li>
<li><b>ConnectionError, "Connection refused"</b>: host ne jawab diya "yahan koi nahi sunta". Address sahi hai, port ya service galat. Lab 2 ki pehli deewar bilkul yahi hai: administration port 8443 par chala gaya aur script abhi bhi 443 bula rahi thi.</li>
</ul>
<div class="note"><p><b>Lab vs asli gear.</b> Lab <code>requests.exceptions.Timeout</code> raise karta hai; asli <code>requests</code> <code>ConnectTimeout</code> ya <code>ReadTimeout</code> raise karta hai, dono <code>Timeout</code> ki subclasses, isliye <code>Timeout</code> pakadna har jagah chalta hai. Lab ConnectionError ka text chhota karta hai aur query string chhod deta hai; asli Python ke traceback mein zyada frames hote hain. <code>except</code> class ke liye likho, text ke liye kabhi nahi.</p></div>

<h3>Retry policy jo nuksan na kare</h3>
<ul>
<li><b>Kabhi retry mat karo</b> 401, 403, 404, 424 aur 400: wahi request wahi tarah fail hogi. Use theek karo.</li>
<li><b>Chhote pause aur chhoti limit ke saath retry</b> (teen koshish, badhta pause) timeouts par aur un 5xx errors par jo "in use" ya "bad value" nahi hain, par <b>sirf reads ya ensure() ke liye</b>. Kyunki ensure() pehle padhta hai, timeout ke baad doosri koshish duplicate nahi bana sakti.</li>
<li><b>Nangi POST ko andhaadhund retry mat karo</b>: timeout ke baad pata nahi pehli pahunchi ya nahi.</li>
<li><b>Error number log karo</b>, path aur method bhi. Headers ya key kabhi log mat karo.</li>
</ul>

<div class="eg"><p><b>Worked example: ek failure das second mein padhna.</b> Log kehta hai <code>POST /cmdb/firewall/policy -> status 424, FortiOS error -3 ... value parse error before 'db-srv1'</code>. Layer 1 aur 2 theek hain (firewall ne jawab diya). Layer 3: key accept hui, request samjhi gayi. Layer 4: policy aisi object ko refer karti hai jo hai nahi, aur text naam batata hai: <code>db-srv1</code>, ek character zyada. Ek nazar, ek fix, koi andaza nahi.</p></div>

<h3>Ek aur: delete jo refuse hota hai</h3>
<p>Jis object ko policy ya group abhi use karta hai use delete karna refuse hota hai. Envelope wajah <code>cli_error</code> mein rakhta hai:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" -X DELETE h&#116;tps://10.99.0.41:8443/api/v2/cmdb/firewall/address/db-srv -w "\\n%{http_code}\\n"
{
  "http_method":"DELETE",
  "path":"firewall",
  "name":"address",
  "mkey":"db-srv",
<span class="hl">  "error":-23,</span>
<span class="hl">  "cli_error":"The entry is used by other 1 entries\\nCommand fail. Return code -23\\n",</span>
  "status":"error",
<span class="hl">  "http_status":500,</span>
  "vdom":"root",
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}
<span class="hl">500</span></pre>
<p>"The entry is used by other 1 entries" woh vaakya hai jise dhoondhna hai. Fix hai object ke user (policy ya group) ko dhoondh kar pehle use badalna.</p>

<div class="exam"><p><b>Exam trap.</b> 401 ka matlab "aap kaun?" (key), 403 ka matlab "aapko ijaazat nahi" (permission ya trusted host). Rotate hui key 403 nahi, 401 deti hai. Aur URL mein token (<code>?access_token=</code>) bhi chalta hai, par logs aur proxy history mein leak hota hai; sahi jagah header hai.</p></div>

<div class="scn"><h4>Retry storm</h4><p>Ek script har fail hui POST ko bina pause ke das baar retry karti thi. Somvar subah firewall slow tha, calls timeout huin, aur har request ki das copies queue mein lag gayin. Aadhi der se pahunchin, object pehle se paaya, aur -5 laayin. Monitoring ne "configuration errors" ka alarm uthaya aur on-call engineer ka ek ghanta gaya.</p><p><b>Lesson:</b> sirf wahi retry karo jo repeat karna safe hai, limit aur pause ke saath, aur creation ko khud idempotent banao.</p></div>

<div class="iv"><p class="q">"Firewall par REST call fail ho jaye. Kya karna hai kaise tay karte ho?"</p><p>Main neeche se padhta hoon: kuch jawab aaya, TLS accept hua, status aur device ka apna error number kya hai, aur content valid hai. Timeouts network ka sawal hain, 401 key hai, 403 permission ya trusted hosts, 404 missing object, error number ke saath 424 ya 500 content ya state ki problem hai, jo main status se nahi, error number se padhta hoon. Sirf safe operations retry karta hoon, limit ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Failures network se upar padho: connect, TLS, status plus error number, content.</li>
<li>401 -37 key; 403 -14 trusted host ya permission; 404 -3 not found; -5 duplicate; -651 bad value; -23 in use.</li>
<li>Wahi error number ke liye status class builds mein alag hoti hai; number par match karo.</li>
<li>Timeout = khamoshi; Connection refused = galat port ya service.</li>
<li>Sirf reads aur idempotent calls retry karo, pause aur limit ke saath; headers kabhi log mat karo.</li>
</ul></div>
`}};export{e as default};