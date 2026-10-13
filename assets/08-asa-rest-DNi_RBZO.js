var e={id:`asa-rest`,h:{en:`The ASA REST API: token, objects and access rules`,hi:`ASA REST API: token, objects aur access rules`},body:{en:`
<p>The second firewall of the lab is a Cisco ASA, ASA1. Its REST API has the same idea as FortiOS (JSON over a secure web connection) but a different login, different paths and a different error format. If you can read one, you can read the other in an hour. This is Lab 1, step 5.</p>

<h3>An analogy: a visitor badge</h3>
<p>FortiOS gives you a permanent key card that you carry (the API key). The ASA works like the reception desk of an office: you show your ID (user and password) once, they print a <b>visitor badge</b> (the token) that is valid for a short time, and you wear the badge for the rest of the visit. The ID is used once; the badge is used in every call.</p>

<h3>The shape of the ASA API</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="The ASA REST token flow"><rect x="8" y="20" width="130" height="56" rx="10" fill="#bae6fd"/><text x="73" y="45" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="73" y="62" text-anchor="middle" class="svg-muted" font-size="11">script</text><line x1="138" y1="40" x2="238" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="238,40 230,36 230,44" fill="#64748b"/><text x="188" y="32" text-anchor="middle" class="svg-muted" font-size="11">basic login</text><rect x="238" y="14" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="313" y="37" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="313" y="54" text-anchor="middle" class="svg-muted" font-size="11">POST /tokenservices</text><line x1="388" y1="50" x2="138" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="138,100 146,92 146,92" fill="#64748b"/><text x="262" y="104" text-anchor="middle" class="svg-muted" font-size="11">204 + X-Auth-Token</text><rect x="8" y="110" width="130" height="56" rx="10" fill="#bae6fd"/><text x="73" y="135" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="73" y="152" text-anchor="middle" class="svg-muted" font-size="11">script</text><line x1="138" y1="136" x2="238" y2="136" stroke="#64748b" stroke-width="2"/><polygon points="238,136 230,132 230,140" fill="#64748b"/><text x="188" y="128" text-anchor="middle" class="svg-muted" font-size="11">token in header</text><rect x="238" y="110" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="313" y="135" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="313" y="152" text-anchor="middle" class="svg-muted" font-size="11">/objects, /access</text><line x1="388" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><polygon points="470,142 462,138 462,146" fill="#64748b"/><rect x="470" y="114" width="162" height="52" rx="10" fill="#fde68a"/><text x="551" y="137" text-anchor="middle" class="svg-ink" font-size="12">the change</text><text x="551" y="154" text-anchor="middle" class="svg-muted" font-size="11">object, ACE</text><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">The token expires: when you see 401, log in again.</text></svg><p class="cap">Log in once with basic authentication, then send the token in a header on every call.</p></div>
<p>Two steps: (1) <code>POST /api/tokenservices</code> with the user and password as HT&#84;P basic authentication; (2) every later call carries the <code>X-Auth-Token</code> header. A third rule matters on real gear: every call also needs the header <code>User-Agent: REST API Agent</code>. Here is step 1 on its own:</p>
<pre class="code">import os

import requests

r = requests.post("h&#116;tps://10.99.0.50/api/tokenservices", auth=(os.environ["ASA_USER"], os.environ["ASA_PASS"]),
                  headers={"User-Agent": "REST API Agent"}, verify=False, timeout=5)
print("status", r.status_code, "body", repr(r.text))
print("headers:", sorted(r.headers.keys()))
print("token:", "&lt;%d chars&gt;" % len(r.headers["X-Auth-Token"]), "expires in", r.headers.get("X-Auth-Token-Expires-In"))</pre>
<pre class="out">AUTO01$ python3 asa_tok.py
<span class="hl">status 204 body ''</span>
<span class="hl">headers: ['Content-Type', 'Server', 'X-Auth-Token', 'X-Auth-Token-Expires-In']</span>
<span class="hl">token: &lt;36 chars&gt; expires in 1800</span></pre>
<p>Three details: the answer is <b>204 with an empty body</b> (the token is in a header, not in the JSON), the printed token is only its length, never its text, and the lab adds an <code>X-Auth-Token-Expires-In</code> header. Real tokens are documented as valid for about 30 minutes; do not depend on the lab's header being there.</p>

<h3>The client</h3>
<p>The pattern is the one from chapter 3. <code>asa.py</code> reads <code>ASA_USER</code> and <code>ASA_PASS</code> from the environment, fetches the token once, and returns a session that carries it:</p>
<pre class="code">"""asa.py - ASA REST client for ASA1. The login comes from the environment, never from this file."""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.50/api"
AGENT = {"User-Agent": "REST API Agent"}      <span class="c"># a real ASA refuses REST calls without this header</span>
TIMEOUT = 5


class AsaError(Exception):
    """An ASA answer that is not a success: keeps the status code and the message code."""

    def __init__(self, method, path, response):
        msg = response.json()["messages"][0]
        self.status = response.status_code
        self.code = msg["code"]
        super().__init__("%s %s -&gt; status %s %s: %s" % (method, path, self.status, msg["code"], msg["details"]))


def session():
    user, password = os.environ.get("ASA_USER"), os.environ.get("ASA_PASS")
    if not user or not password:
        sys.exit("ASA_USER and ASA_PASS are not set - export them in this shell")
    r = requests.post(BASE + "/tokenservices", auth=(user, password), headers=AGENT, verify=False, timeout=TIMEOUT)
    if r.status_code != 204:
        raise AsaError("POST", "/tokenservices", r)
    s = requests.Session()
    s.headers.update(AGENT)
    s.headers.update({"X-Auth-Token": r.headers["X-Auth-Token"], "Content-Type": "application/json"})
    s.verify = False
    return s


def call(s, method, path, **kw):
    r = s.request(method, BASE + path, timeout=TIMEOUT, **kw)
    if r.status_code &gt;= 400:
        raise AsaError(method, path, r)
    return r</pre>
<p>The error class differs because the ASA answers failures in another format. Instead of FortiOS's status plus number, it returns <code>{"messages": [{"level", "code", "details"}]}</code> and the <b>code string</b> is the stable part (UNAUTHORIZED, RESOURCE-NOT-FOUND, DUPLICATE, ...). Let the exception carry both.</p>

<h3>Objects and access rules, again idempotent</h3>
<p>Append the second half. The structure is the same as <code>ensure()</code>: get the object, create when missing (POST), update when different (PUT), else <code>unchanged</code>. A rule has no name, so it is found by what it matches:</p>
<pre class="code">

def get_object(s, name):
    try:
        return call(s, "GET", "/objects/networkobjects/" + name).json()
    except AsaError as err:
        if err.status == 404:
            return None
        raise


def ensure_object(s, name, ip, description=""):
    body = {"name": name, "host": {"kind": "IPv4Address", "value": ip}, "description": description}
    have = get_object(s, name)
    if have is None:
        call(s, "POST", "/objects/networkobjects", json=body)
        return "created"
    if have["host"]["value"] == ip and have.get("description", "") == description:
        return "unchanged"
    call(s, "PUT", "/objects/networkobjects/" + name, json=body)
    return "updated"


def find_rule(s, interface, obj, service):
    for rule in call(s, "GET", "/access/in/%s/rules" % interface).json()["items"]:
        if rule["destinationAddress"].get("objectId") == obj and rule["destinationService"]["value"] == service:
            return rule
    return None


def ensure_rule(s, interface, obj, service):
    have = find_rule(s, interface, obj, service)
    if have:
        return "unchanged", have["position"]
    body = {
        "permit": True,
        "sourceAddress": {"kind": "AnyIPAddress", "value": "any"},
        "destinationAddress": {"kind": "objectRef#NetworkObj", "objectId": obj},
        "destinationService": {"kind": "TcpUdpService", "value": service},
    }
    r = call(s, "POST", "/access/in/%s/rules" % interface, json=body)
    return "created", int(r.headers["Location"].rsplit("/", 1)[1])</pre>
<p>One ASA-specific trick: a successful <code>POST</code> of a rule answers with a <code>Location</code> header ending in the rule's number. The script reads that to report the position. The ticket step is short:</p>
<pre class="code">from asa import ensure_object, ensure_rule, session

s = session()
print("object   %-12s %s" % ("web2", ensure_object(s, "web2", "10.1.1.20", "CHG-3105")))
action, position = ensure_rule(s, "outside", "web2", "tcp/443")
print("rule     %-12s %s, position %s" % ("outside", action, position))</pre>
<pre class="out">AUTO01$ python3 asaobj.py
<span class="hl">object   web2         created</span>
<span class="hl">rule     outside      created, position 2</span>
AUTO01$ python3 asaobj.py
<span class="hl">object   web2         unchanged</span>
<span class="hl">rule     outside      unchanged, position 2</span></pre>
<h3>Reading it back</h3>
<p>Three kinds of reads help in a ticket: the objects, the rules of one interface, and a free-form CLI command through <code>/cli</code>. A last call, <code>/monitoring/serialnumber</code>, proves you talk to the right box:</p>
<pre class="code">from asa import call, session

s = session()
for o in call(s, "GET", "/objects/networkobjects").json()["items"]:
    print("object", o["name"], o["host"]["value"])
for rule in call(s, "GET", "/access/in/outside/rules").json()["items"]:
    dst = rule["destinationAddress"]
    print("rule", rule["position"], "permit" if rule["permit"] else "deny", dst.get("value") or dst["objectId"], rule["destinationService"]["value"])
out = call(s, "POST", "/cli", json={"commands": ["show version"]}).json()["response"][0]
print(out.strip().splitlines()[0])
print(call(s, "GET", "/monitoring/serialnumber").json()["serialNumber"])</pre>
<pre class="out">AUTO01$ python3 asa_read.py
<span class="hl">object web1 10.1.1.10</span>
<span class="hl">object web2 10.1.1.20</span>
<span class="hl">rule 1 permit 10.1.1.10 tcp/80</span>
<span class="hl">rule 2 permit web2 tcp/443</span>
Cisco Adaptive Security Appliance Software Version 9.20(2) (NK-OS educational simulator)
9A741032271</pre>
<p>Now compare with what the ASA itself says. The REST change is in the running configuration, as the console shows:</p>
<pre class="out">ASA1# show running-config | include object|host|description|access-list OUT-IN
hostname ASA1
object network web1
 host 10.1.1.10
<span class="hl">object network web2</span>
 host 10.1.1.20
 description CHG-3105
<span class="hl">access-list OUT-IN extended permit tcp any host 10.1.1.10 eq www</span>
<span class="hl">access-list OUT-IN extended permit tcp any4 object web2 eq 443</span>
prompt hostname context</pre>
<pre class="out">ASA1# show access-list OUT-IN
access-list cached ACL log flows: total 0, denied 0 (deny-flow-max 4096)
            alert-interval 300
access-list OUT-IN; 2 elements; name hash: 0x72d60039
access-list OUT-IN line 1 extended permit tcp any host 10.1.1.10 eq www (hitcnt=0) 0xb00bc219
<span class="hl">access-list OUT-IN line 2 extended permit tcp any4 object web2 eq 443 (hitcnt=0) 0xf89b14ee</span>
<span class="hl">  access-list OUT-IN line 2 extended permit tcp any4 host 10.1.1.20 eq 443 (hitcnt=0) 0xf89b14ee</span></pre>
<p>Notice the rule: <code>any4 object web2 eq 443</code> and, indented, the expanded line with the host address. The ASA lists both the object form and the expanded form of the same rule. Nobody edited the console; the REST call did this.</p>

<h3>The ASA error format</h3>
<pre class="code">import os

import requests

from asa import AsaError, call, session

BASE = "h&#116;tps://10.99.0.50/api"
bad = requests.post(BASE + "/tokenservices", auth=(os.environ["ASA_USER"], "wrong"), headers={"User-Agent": "REST API Agent"}, verify=False, timeout=5)
print("wrong password         ", bad.status_code, bad.json()["messages"][0]["code"])
s = session()
CASES = [
    ("missing object", "GET", "/objects/networkobjects/ghost", None),
    ("duplicate object", "POST", "/objects/networkobjects", {"name": "web2", "host": {"kind": "IPv4Address", "value": "10.1.1.20"}}),
    ("rule, missing object", "POST", "/access/in/outside/rules", {"permit": True, "sourceAddress": {"kind": "AnyIPAddress", "value": "any"}, "destinationAddress": {"kind": "objectRef#NetworkObj", "objectId": "ghost"}}),
    ("delete object in use", "DELETE", "/objects/networkobjects/web2", None),
]
for label, method, path, body in CASES:
    try:
        call(s, method, path, json=body)
    except AsaError as err:
        print("%-23s %s %s" % (label, err.status, err.code))</pre>
<pre class="out">AUTO01$ python3 asa_errors.py
<span class="hl">wrong password          401 UNAUTHORIZED</span>
<span class="hl">missing object          404 RESOURCE-NOT-FOUND</span>
<span class="hl">duplicate object        400 DUPLICATE</span>
<span class="hl">rule, missing object    400 INVALID-ENTRY</span>
<span class="hl">delete object in use    400 IN-USE</span></pre>
<p>Compare with chapter 7: the same ideas (bad credentials, not found, duplicate, bad reference, in use), a different vocabulary. Here five cases: 401 UNAUTHORIZED, 404 RESOURCE-NOT-FOUND, and three 400 codes DUPLICATE, INVALID-ENTRY, IN-USE. From the console, a wrong password looks like this when you ask for the headers:</p>
<pre class="out">AUTO01$ curl -sk -m 3 -u "$ASA_USER:wrong" -X POST -i h&#116;tps://10.99.0.50/api/tokenservices
<span class="hl">HT&#84;P/1.1 401 Unauthorized</span>
Server: xxxxxxxx-xxxxx
Date: Sun, 11 Oct 2026 12:02:58 GMT
Content-Type: application/json
Content-Length: 147
WWW-Authenticate: Basic realm="ASA REST API"
Connection: keep-alive

{
  "messages": [
    {
      "level": "Error",
<span class="hl">      "code": "UNAUTHORIZED",</span>
      "details": "Authentication failed or token invalid"
    }
  ]
}</pre>

<h3>What a real ASA needs first</h3>
<p>In the lab, the REST service is simply on. On a real ASA somebody has to prepare it. The list below is written from the Cisco documentation as I remember it; check it against the release you run.</p>
<table>
<tr><th>Prerequisite</th><th>Lab ASA1</th><th>Real ASA</th></tr>
<tr><td>REST API agent image installed and enabled</td><td>not needed</td><td>needed (the agent is a separate package and an enable command)</td></tr>
<tr><td>HT&#84;P server enabled</td><td>yes (see below)</td><td>yes, the same server as the ASDM</td></tr>
<tr><td>Management network allowed to the HT&#84;P server</td><td>yes</td><td>yes, per interface</td></tr>
<tr><td>Local user with privilege level 15 and HT&#84;P authentication to LOCAL</td><td>netops</td><td>needed</td></tr>
<tr><td>Header <code>User-Agent: REST API Agent</code></td><td>harmless</td><td>required</td></tr>
</table>
<pre class="out">ASA1# show running-config | include h&#116;tp
<span class="hl">h&#116;tp server enable</span>
<span class="hl">h&#116;tp 10.99.0.0 255.255.255.0 inside</span></pre>
<p>The <code>h&#116;tp</code> lines are what the REST service stands on. If somebody removes them, the API stops answering, and the script sees silence. Switch the server off in the console and try again:</p>
<pre class="code">configure terminal
no h&#116;tp server enable
end</pre>
<pre class="out">AUTO01$ curl -sk -m 3 -u "$ASA_USER:$ASA_PASS" -X POST h&#116;tps://10.99.0.50/api/tokenservices; echo "curl exit: $?"
<span class="hl">curl exit: 28</span>
<span class="hl">curl: (28) Failed to connect to 10.99.0.50 port 443 after 2001 ms: Timeout was reached</span></pre>
<p>Curl exit code 28 is "operation timed out". No status code, no JSON. Compare with the closed-port example in chapter 7: the ASA no longer listens, and the symptom on the script side is a timeout. After this experiment, put the server back with <code>h&#116;tp server enable</code>.</p>

<div class="eg"><p><b>Worked example: the rule that exists twice.</b> A colleague adds the rule for web2 on port 443 through the console on Monday. On Tuesday the REST script runs the same ticket. A plain POST would add a second identical rule at position 3. The script first calls <code>find_rule()</code> for "outside, web2, tcp/443"; it finds Monday's rule, reports <code>unchanged, position 2</code>, and the ACL stays clean. A rule table fills up with duplicates quickly if nothing checks.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab ASA does not require the <code>rest-api agent</code> step and accepts the User-Agent header without needing it. The lab does not allow deleting a token (the call answers 405); a real ASA lets you invalidate a token. <code>show running-config object</code> prints nothing in the lab, so the examples use <code>include</code>. The ASA error code strings are written from memory; read what your device returns. On a real ASA a REST change is in the running configuration only: it is not in the startup configuration until the configuration is saved, by the CLI or by a REST call that I did not test here. FMC and FDM (the Firepower management APIs) are different products with different APIs and are not covered.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Asking for a new token on every call. Putting the password in the script. Forgetting the User-Agent header and being told "unauthorized" or "forbidden" on real gear. Assuming the rule number is permanent: it moves when someone inserts above it. Forgetting that the REST service is on the same HT&#84;P server as ASDM, so removing the <code>h&#116;tp</code> lines for ASDM removes REST too.</p></div>
<div class="exam"><p><b>Exam trap.</b> FortiOS: key in <code>Authorization: Bearer</code>, no login step. ASA: a login that returns <code>204</code> and the token in the <code>X-Auth-Token</code> header. Keep them apart: a Bearer header sent to an ASA is simply unauthorised.</p></div>

<div class="scn"><h4>Works from my laptop, times out from the server</h4><p>The same REST script ran fine from an engineer's laptop in the management VLAN and timed out from the new automation server. The ASA answered both with the same token flow. The difference was in the ASA configuration: the <code>h&#116;tp</code> line allowed only the management subnet. The new server was outside it, so the ASA stayed silent.</p><p><b>Lesson:</b> on the ASA the REST service obeys the HT&#84;P access list of the interface. A timeout from one place and success from another points at that line.</p></div>

<div class="iv"><p class="q">"How do you authenticate to the ASA REST API?"</p><p>A POST to /api/tokenservices with basic authentication returns 204 and an X-Auth-Token header. I put that token in a session and use it for the other calls, with the User-Agent header the API expects. The password comes from the environment, I ask for one token per run, and I never print it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA: POST /api/tokenservices (basic auth) gives 204 and the X-Auth-Token header; FortiOS uses a Bearer key.</li>
<li>Objects at /objects/networkobjects, rules at /access/in/INTERFACE/rules; a created rule returns its position in the Location header.</li>
<li>Errors are a messages list with a code string: UNAUTHORIZED, RESOURCE-NOT-FOUND, DUPLICATE, INVALID-ENTRY, IN-USE.</li>
<li>Use the same idempotent pattern; find a rule by what it matches, not by number.</li>
<li>Real ASA needs the REST agent, the HT&#84;P server and access list, privilege 15, and the User-Agent header. REST changes are live in running config.</li>
</ul></div>
`,hi:`
<p>Lab ka doosra firewall Cisco ASA hai, ASA1. Uski REST API ka vichaar FortiOS jaisa hi hai (secure web connection par JSON), par login alag, paths alag aur error format alag. Ek padh sakte ho to doosra ek ghante mein padh loge. Yeh Lab 1, step 5 hai.</p>

<h3>Ek analogy: visitor badge</h3>
<p>FortiOS aapko permanent key card deta hai jo aap saath rakhte ho (API key). ASA office ke reception desk ki tarah chalta hai: aap ek baar apna ID dikhate ho (user aur password), woh ek <b>visitor badge</b> (token) chhaap dete hain jo thodi der ke liye valid hai, aur baaki visit mein aap badge pehente ho. ID ek baar use hota hai; badge har call mein.</p>

<h3>ASA API ki shape</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ASA REST token flow"><rect x="8" y="20" width="130" height="56" rx="10" fill="#bae6fd"/><text x="73" y="45" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="73" y="62" text-anchor="middle" class="svg-muted" font-size="11">script</text><line x1="138" y1="40" x2="238" y2="40" stroke="#64748b" stroke-width="2"/><polygon points="238,40 230,36 230,44" fill="#64748b"/><text x="188" y="32" text-anchor="middle" class="svg-muted" font-size="11">basic login</text><rect x="238" y="14" width="150" height="52" rx="10" fill="#bbf7d0"/><text x="313" y="37" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="313" y="54" text-anchor="middle" class="svg-muted" font-size="11">POST /tokenservices</text><line x1="388" y1="50" x2="138" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="138,100 146,92 146,92" fill="#64748b"/><text x="262" y="104" text-anchor="middle" class="svg-muted" font-size="11">204 + X-Auth-Token</text><rect x="8" y="110" width="130" height="56" rx="10" fill="#bae6fd"/><text x="73" y="135" text-anchor="middle" class="svg-ink" font-size="12">AUTO01</text><text x="73" y="152" text-anchor="middle" class="svg-muted" font-size="11">script</text><line x1="138" y1="136" x2="238" y2="136" stroke="#64748b" stroke-width="2"/><polygon points="238,136 230,132 230,140" fill="#64748b"/><text x="188" y="128" text-anchor="middle" class="svg-muted" font-size="11">header mein token</text><rect x="238" y="110" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="313" y="135" text-anchor="middle" class="svg-ink" font-size="12">ASA1</text><text x="313" y="152" text-anchor="middle" class="svg-muted" font-size="11">/objects, /access</text><line x1="388" y1="142" x2="470" y2="142" stroke="#64748b" stroke-width="2"/><polygon points="470,142 462,138 462,146" fill="#64748b"/><rect x="470" y="114" width="162" height="52" rx="10" fill="#fde68a"/><text x="551" y="137" text-anchor="middle" class="svg-ink" font-size="12">the change</text><text x="551" y="154" text-anchor="middle" class="svg-muted" font-size="11">object, ACE</text><text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Token expire hota hai: 401 dikhe to dobara login karo.</text></svg><p class="cap">Ek baar basic authentication se login karo, phir har call mein token header mein bhejo.</p></div>
<p>Do step: (1) <code>POST /api/tokenservices</code>, user aur password HT&#84;P basic authentication ki tarah; (2) har agli call <code>X-Auth-Token</code> header ke saath. Asli gear par teesra niyam bhi maayne rakhta hai: har call ko <code>User-Agent: REST API Agent</code> header bhi chahiye. Yeh step 1 akela:</p>
<pre class="code">import os

import requests

r = requests.post("h&#116;tps://10.99.0.50/api/tokenservices", auth=(os.environ["ASA_USER"], os.environ["ASA_PASS"]),
                  headers={"User-Agent": "REST API Agent"}, verify=False, timeout=5)
print("status", r.status_code, "body", repr(r.text))
print("headers:", sorted(r.headers.keys()))
print("token:", "&lt;%d chars&gt;" % len(r.headers["X-Auth-Token"]), "expires in", r.headers.get("X-Auth-Token-Expires-In"))</pre>
<pre class="out">AUTO01$ python3 asa_tok.py
<span class="hl">status 204 body ''</span>
<span class="hl">headers: ['Content-Type', 'Server', 'X-Auth-Token', 'X-Auth-Token-Expires-In']</span>
<span class="hl">token: &lt;36 chars&gt; expires in 1800</span></pre>
<p>Teen details: jawab <b>204 aur khaali body</b> hai (token header mein hai, JSON mein nahi), print hua token sirf uski length hai, text nahi, aur lab ek <code>X-Auth-Token-Expires-In</code> header jodta hai. Asli tokens lagbhag 30 minute valid documented hain; lab ke header ke hone par depend mat karo.</p>

<h3>Client</h3>
<p>Pattern chapter 3 wala hai. <code>asa.py</code> <code>ASA_USER</code> aur <code>ASA_PASS</code> environment se padhti hai, token ek baar leti hai, aur token rakhne wala session lautati hai:</p>
<pre class="code">"""asa.py - ASA REST client for ASA1. The login comes from the environment, never from this file."""
import os
import sys

import requests

BASE = "h&#116;tps://10.99.0.50/api"
AGENT = {"User-Agent": "REST API Agent"}      <span class="c"># a real ASA refuses REST calls without this header</span>
TIMEOUT = 5


class AsaError(Exception):
    """An ASA answer that is not a success: keeps the status code and the message code."""

    def __init__(self, method, path, response):
        msg = response.json()["messages"][0]
        self.status = response.status_code
        self.code = msg["code"]
        super().__init__("%s %s -&gt; status %s %s: %s" % (method, path, self.status, msg["code"], msg["details"]))


def session():
    user, password = os.environ.get("ASA_USER"), os.environ.get("ASA_PASS")
    if not user or not password:
        sys.exit("ASA_USER and ASA_PASS are not set - export them in this shell")
    r = requests.post(BASE + "/tokenservices", auth=(user, password), headers=AGENT, verify=False, timeout=TIMEOUT)
    if r.status_code != 204:
        raise AsaError("POST", "/tokenservices", r)
    s = requests.Session()
    s.headers.update(AGENT)
    s.headers.update({"X-Auth-Token": r.headers["X-Auth-Token"], "Content-Type": "application/json"})
    s.verify = False
    return s


def call(s, method, path, **kw):
    r = s.request(method, BASE + path, timeout=TIMEOUT, **kw)
    if r.status_code &gt;= 400:
        raise AsaError(method, path, r)
    return r</pre>
<p>Error class alag hai kyunki ASA failures ka jawab doosre format mein deta hai. FortiOS ke status plus number ki jagah woh <code>{"messages": [{"level", "code", "details"}]}</code> lautata hai aur <b>code string</b> stable hissa hai (UNAUTHORIZED, RESOURCE-NOT-FOUND, DUPLICATE, ...). Exception dono rakhe.</p>

<h3>Objects aur access rules, phir idempotent</h3>
<p>Doosra aadha jodo. Structure <code>ensure()</code> jaisa hi hai: object lo, missing ho to banao (POST), alag ho to update karo (PUT), warna <code>unchanged</code>. Rule ka naam nahi hota, isliye woh jis par match karti hai usse dhoondhi jaati hai:</p>
<pre class="code">

def get_object(s, name):
    try:
        return call(s, "GET", "/objects/networkobjects/" + name).json()
    except AsaError as err:
        if err.status == 404:
            return None
        raise


def ensure_object(s, name, ip, description=""):
    body = {"name": name, "host": {"kind": "IPv4Address", "value": ip}, "description": description}
    have = get_object(s, name)
    if have is None:
        call(s, "POST", "/objects/networkobjects", json=body)
        return "created"
    if have["host"]["value"] == ip and have.get("description", "") == description:
        return "unchanged"
    call(s, "PUT", "/objects/networkobjects/" + name, json=body)
    return "updated"


def find_rule(s, interface, obj, service):
    for rule in call(s, "GET", "/access/in/%s/rules" % interface).json()["items"]:
        if rule["destinationAddress"].get("objectId") == obj and rule["destinationService"]["value"] == service:
            return rule
    return None


def ensure_rule(s, interface, obj, service):
    have = find_rule(s, interface, obj, service)
    if have:
        return "unchanged", have["position"]
    body = {
        "permit": True,
        "sourceAddress": {"kind": "AnyIPAddress", "value": "any"},
        "destinationAddress": {"kind": "objectRef#NetworkObj", "objectId": obj},
        "destinationService": {"kind": "TcpUdpService", "value": service},
    }
    r = call(s, "POST", "/access/in/%s/rules" % interface, json=body)
    return "created", int(r.headers["Location"].rsplit("/", 1)[1])</pre>
<p>Ek ASA-specific trick: rule ka kaamyaab <code>POST</code> ek <code>Location</code> header ke saath jawab deta hai jo rule ke number par khatam hota hai. Script position report karne ke liye wahi padhti hai. Ticket ka step chhota hai:</p>
<pre class="code">from asa import ensure_object, ensure_rule, session

s = session()
print("object   %-12s %s" % ("web2", ensure_object(s, "web2", "10.1.1.20", "CHG-3105")))
action, position = ensure_rule(s, "outside", "web2", "tcp/443")
print("rule     %-12s %s, position %s" % ("outside", action, position))</pre>
<pre class="out">AUTO01$ python3 asaobj.py
<span class="hl">object   web2         created</span>
<span class="hl">rule     outside      created, position 2</span>
AUTO01$ python3 asaobj.py
<span class="hl">object   web2         unchanged</span>
<span class="hl">rule     outside      unchanged, position 2</span></pre>
<h3>Wapas padhna</h3>
<p>Ticket mein teen tarah ke reads kaam aate hain: objects, ek interface ki rules, aur <code>/cli</code> se free-form CLI command. Aakhri call, <code>/monitoring/serialnumber</code>, saabit karti hai ki sahi box se baat ho rahi hai:</p>
<pre class="code">from asa import call, session

s = session()
for o in call(s, "GET", "/objects/networkobjects").json()["items"]:
    print("object", o["name"], o["host"]["value"])
for rule in call(s, "GET", "/access/in/outside/rules").json()["items"]:
    dst = rule["destinationAddress"]
    print("rule", rule["position"], "permit" if rule["permit"] else "deny", dst.get("value") or dst["objectId"], rule["destinationService"]["value"])
out = call(s, "POST", "/cli", json={"commands": ["show version"]}).json()["response"][0]
print(out.strip().splitlines()[0])
print(call(s, "GET", "/monitoring/serialnumber").json()["serialNumber"])</pre>
<pre class="out">AUTO01$ python3 asa_read.py
<span class="hl">object web1 10.1.1.10</span>
<span class="hl">object web2 10.1.1.20</span>
<span class="hl">rule 1 permit 10.1.1.10 tcp/80</span>
<span class="hl">rule 2 permit web2 tcp/443</span>
Cisco Adaptive Security Appliance Software Version 9.20(2) (NK-OS educational simulator)
9A741032271</pre>
<p>Ab ASA jo khud kehta hai us se compare karo. REST change running configuration mein hai, jaise console dikhata hai:</p>
<pre class="out">ASA1# show running-config | include object|host|description|access-list OUT-IN
hostname ASA1
object network web1
 host 10.1.1.10
<span class="hl">object network web2</span>
 host 10.1.1.20
 description CHG-3105
<span class="hl">access-list OUT-IN extended permit tcp any host 10.1.1.10 eq www</span>
<span class="hl">access-list OUT-IN extended permit tcp any4 object web2 eq 443</span>
prompt hostname context</pre>
<pre class="out">ASA1# show access-list OUT-IN
access-list cached ACL log flows: total 0, denied 0 (deny-flow-max 4096)
            alert-interval 300
access-list OUT-IN; 2 elements; name hash: 0x72d60039
access-list OUT-IN line 1 extended permit tcp any host 10.1.1.10 eq www (hitcnt=0) 0xb00bc219
<span class="hl">access-list OUT-IN line 2 extended permit tcp any4 object web2 eq 443 (hitcnt=0) 0xf89b14ee</span>
<span class="hl">  access-list OUT-IN line 2 extended permit tcp any4 host 10.1.1.20 eq 443 (hitcnt=0) 0xf89b14ee</span></pre>
<p>Rule dekho: <code>any4 object web2 eq 443</code> aur, indent ke saath, host address wali expanded line. ASA ek hi rule ka object form aur expanded form dono dikhata hai. Console par kisi ne edit nahi kiya; REST call ne yeh kiya.</p>

<h3>ASA error format</h3>
<pre class="code">import os

import requests

from asa import AsaError, call, session

BASE = "h&#116;tps://10.99.0.50/api"
bad = requests.post(BASE + "/tokenservices", auth=(os.environ["ASA_USER"], "wrong"), headers={"User-Agent": "REST API Agent"}, verify=False, timeout=5)
print("wrong password         ", bad.status_code, bad.json()["messages"][0]["code"])
s = session()
CASES = [
    ("missing object", "GET", "/objects/networkobjects/ghost", None),
    ("duplicate object", "POST", "/objects/networkobjects", {"name": "web2", "host": {"kind": "IPv4Address", "value": "10.1.1.20"}}),
    ("rule, missing object", "POST", "/access/in/outside/rules", {"permit": True, "sourceAddress": {"kind": "AnyIPAddress", "value": "any"}, "destinationAddress": {"kind": "objectRef#NetworkObj", "objectId": "ghost"}}),
    ("delete object in use", "DELETE", "/objects/networkobjects/web2", None),
]
for label, method, path, body in CASES:
    try:
        call(s, method, path, json=body)
    except AsaError as err:
        print("%-23s %s %s" % (label, err.status, err.code))</pre>
<pre class="out">AUTO01$ python3 asa_errors.py
<span class="hl">wrong password          401 UNAUTHORIZED</span>
<span class="hl">missing object          404 RESOURCE-NOT-FOUND</span>
<span class="hl">duplicate object        400 DUPLICATE</span>
<span class="hl">rule, missing object    400 INVALID-ENTRY</span>
<span class="hl">delete object in use    400 IN-USE</span></pre>
<p>Chapter 7 se compare karo: wahi vichaar (bad credentials, not found, duplicate, bad reference, in use), alag shabdavali. Yahan paanch cases: 401 UNAUTHORIZED, 404 RESOURCE-NOT-FOUND, aur teen 400 codes DUPLICATE, INVALID-ENTRY, IN-USE. Console se headers maango to galat password aisa dikhta hai:</p>
<pre class="out">AUTO01$ curl -sk -m 3 -u "$ASA_USER:wrong" -X POST -i h&#116;tps://10.99.0.50/api/tokenservices
<span class="hl">HT&#84;P/1.1 401 Unauthorized</span>
Server: xxxxxxxx-xxxxx
Date: Sun, 11 Oct 2026 12:02:58 GMT
Content-Type: application/json
Content-Length: 147
WWW-Authenticate: Basic realm="ASA REST API"
Connection: keep-alive

{
  "messages": [
    {
      "level": "Error",
<span class="hl">      "code": "UNAUTHORIZED",</span>
      "details": "Authentication failed or token invalid"
    }
  ]
}</pre>

<h3>Asli ASA ko pehle kya chahiye</h3>
<p>Lab mein REST service bas on hai. Asli ASA par kisi ko ise taiyaar karna padta hai. Neeche ki list Cisco documentation se jaise mujhe yaad hai waise likhi hai; apne release se mila lo.</p>
<table>
<tr><th>Prerequisite</th><th>Lab ASA1</th><th>Asli ASA</th></tr>
<tr><td>REST API agent image installed aur enabled</td><td>zaroori nahi</td><td>zaroori (agent alag package hai aur ek enable command)</td></tr>
<tr><td>HT&#84;P server enabled</td><td>haan (neeche dekho)</td><td>haan, wahi server jo ASDM ka hai</td></tr>
<tr><td>Management network ko HT&#84;P server tak allow</td><td>haan</td><td>haan, per interface</td></tr>
<tr><td>Privilege level 15 wala local user aur HT&#84;P authentication LOCAL</td><td>netops</td><td>zaroori</td></tr>
<tr><td>Header <code>User-Agent: REST API Agent</code></td><td>harmless</td><td>required</td></tr>
</table>
<pre class="out">ASA1# show running-config | include h&#116;tp
<span class="hl">h&#116;tp server enable</span>
<span class="hl">h&#116;tp 10.99.0.0 255.255.255.0 inside</span></pre>
<p><code>h&#116;tp</code> lines woh hain jin par REST service khadi hai. Koi hata de to API jawab dena band kar deti hai, aur script ko khamoshi dikhti hai. Console mein server band karke dobara try karo:</p>
<pre class="code">configure terminal
no h&#116;tp server enable
end</pre>
<pre class="out">AUTO01$ curl -sk -m 3 -u "$ASA_USER:$ASA_PASS" -X POST h&#116;tps://10.99.0.50/api/tokenservices; echo "curl exit: $?"
<span class="hl">curl exit: 28</span>
<span class="hl">curl: (28) Failed to connect to 10.99.0.50 port 443 after 2001 ms: Timeout was reached</span></pre>
<p>Curl exit code 28 ka matlab "operation timed out". Na status code, na JSON. Chapter 7 ke closed-port example se compare karo: ASA ab sunta nahi, aur script ki taraf lakshan timeout hai. Is experiment ke baad server wapas <code>h&#116;tp server enable</code> se lagao.</p>

<div class="eg"><p><b>Worked example: woh rule jo do baar hai.</b> Colleague somvar ko console se web2 ke port 443 ki rule jodta hai. Mangalvar ko REST script wahi ticket chalati hai. Plain POST position 3 par doosri ek jaisi rule jod deta. Script pehle "outside, web2, tcp/443" ke liye <code>find_rule()</code> bulati hai; Somvar ki rule milti hai, <code>unchanged, position 2</code> report hota hai, aur ACL saaf rehta hai. Kuch check na kare to rule table duplicates se jaldi bhar jaati hai.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab ASA ko <code>rest-api agent</code> step nahi chahiye aur User-Agent header ke bina bhi chalta hai. Lab token delete karne nahi deta (call 405 deti hai); asli ASA token invalidate karne deta hai. Lab mein <code>show running-config object</code> kuch print nahi karta, isliye examples <code>include</code> use karte hain. ASA error code strings yaad se likhe hain; apna device jo lautata hai wahi padho. Asli ASA par REST change sirf running configuration mein hai: configuration save hone tak woh startup configuration mein nahi, CLI se ya REST call se jo maine yahan test nahi ki. FMC aur FDM (Firepower management APIs) alag products hain, alag APIs ke saath, aur yahan cover nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Har call par naya token maangna. Password script mein likhna. User-Agent header bhool kar asli gear par "unauthorized" ya "forbidden" milna. Rule number ko permanent samajhna: koi upar insert kare to woh khisakta hai. Yeh bhoolna ki REST service ASDM wale hi HT&#84;P server par hai, isliye ASDM ke liye <code>h&#116;tp</code> lines hatane se REST bhi hat jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> FortiOS: key <code>Authorization: Bearer</code> mein, login step nahi. ASA: login jo <code>204</code> lautata hai aur token <code>X-Auth-Token</code> header mein. Inhe alag rakho: ASA ko Bearer header bhejna seedha unauthorised hai.</p></div>

<div class="scn"><h4>Mere laptop se chalta hai, server se timeout</h4><p>Wahi REST script management VLAN ke engineer ke laptop se theek chali aur naye automation server se timeout hui. ASA ne dono ko wahi token flow se jawab diya. Farq ASA configuration mein tha: <code>h&#116;tp</code> line sirf management subnet ko allow karti thi. Naya server uske bahar tha, isliye ASA chup raha.</p><p><b>Lesson:</b> ASA par REST service interface ki HT&#84;P access list maanti hai. Ek jagah se timeout aur doosri se success us line ki taraf ishara karta hai.</p></div>

<div class="iv"><p class="q">"ASA REST API par authenticate kaise karte ho?"</p><p>/api/tokenservices par basic authentication ke saath POST 204 aur X-Auth-Token header deta hai. Main wo token session mein rakhta hoon aur baaki calls ke liye API ke expected User-Agent header ke saath use karta hoon. Password environment se aata hai, har run mein ek token maangta hoon, aur kabhi print nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA: POST /api/tokenservices (basic auth) se 204 aur X-Auth-Token header; FortiOS Bearer key use karta hai.</li>
<li>Objects /objects/networkobjects par, rules /access/in/INTERFACE/rules par; bani rule apni position Location header mein lautati hai.</li>
<li>Errors messages list hain jisme code string hai: UNAUTHORIZED, RESOURCE-NOT-FOUND, DUPLICATE, INVALID-ENTRY, IN-USE.</li>
<li>Wahi idempotent pattern use karo; rule ko number se nahi, jis par match karti hai usse dhoondho.</li>
<li>Asli ASA ko REST agent, HT&#84;P server aur access list, privilege 15, aur User-Agent header chahiye. REST changes running config mein live hain.</li>
</ul></div>
`}};export{e as default};