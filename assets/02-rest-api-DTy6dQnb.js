var e={id:`rest-api`,h:{en:`The NetBox REST API: URLs, tokens and what comes back`,hi:`NetBox REST API: URLs, tokens aur kya wapas aata hai`},body:{en:`
<p>Think of a very strict library. You show your membership card at the desk (the <b>token</b>), you name the shelf you want (the <b>URL</b>), you say which books on it (the <b>filters</b>), and the librarian hands you a numbered stack (the <b>paged answer</b>). Without a card you are not even allowed past the door. NetBox is that library, and its desk speaks REST. You already know REST from <code>auto-requests</code>; this chapter is about how NetBox does it.</p>

<h3>The shape of a URL</h3>
<p>Every object type has a list URL and a detail URL. The pattern is <code>/api/&lt;app&gt;/&lt;endpoint&gt;/</code> and <code>/api/&lt;app&gt;/&lt;endpoint&gt;/&lt;id&gt;/</code>. The apps group the endpoints, and the names use hyphens: <code>/api/ipam/ip-addresses/</code>, <code>/api/dcim/device-types/</code>.</p>
<table class="cmp"><tr><th>App</th><th>Endpoints used in this module</th></tr>
<tr><td>dcim</td><td>sites, regions, racks, manufacturers, device-types, device-roles, platforms, devices, interfaces, cables</td></tr>
<tr><td>ipam</td><td>vrfs, prefixes, ip-addresses, vlans, roles</td></tr>
<tr><td>tenancy</td><td>tenants</td></tr>
<tr><td>extras</td><td>tags, custom-fields, config-contexts</td></tr>
<tr><td>virtualization</td><td>clusters, virtual-machines, interfaces</td></tr>
<tr><td>core</td><td>object-changes (the read-only change log)</td></tr></table>
<p>Two special sub-URLs do real work and get their own chapter: <code>/api/ipam/prefixes/&lt;id&gt;/available-ips/</code> and <code>.../available-prefixes/</code>.</p>

<h3>The token</h3>
<p>Every call, even <code>/api/status/</code>, needs <code>Authorization: Token &lt;40 hex characters&gt;</code>. You create tokens in NetBox for a user; a token is either read-write or read-only. Newer NetBox releases also have a second token style sent as <code>Bearer</code>; the lab labs use the classic one. Load the file once and let curl read the variables:</p>
<pre class="out">AUTO01$ source ~/.netbox.env; curl -sk $NETBOX_URL/api/status/
{"detail":"Authentication credentials were not provided."}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" $NETBOX_URL/api/status/
{"django-version":"5.0.10","installed-apps":{"debug_toolbar":"5.0.0","django_filters":"24.3","django_prometheus":"2.3.1","django_rq":"2.10.2","django_tables2":"2.7.0","drf_spectacular":"0.27.2","drf_spectacular_sidecar":"2024.11.1","mptt":"0.16.0","rest_framew ...</pre>
<p>The first call has no header and NetBox says <code>403</code>, not 401. A wrong token also gives 403 (<code>Invalid token</code>), and a read-only token gives 403 only when you try to write. The curl flags: <code>-s</code> silent, <code>-k</code> accept the lab's self-signed certificate (never in production; install the CA instead).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Anatomy of a NetBox request">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="24" y="48" class="svg-ink" font-size="13">GET  /api/dcim/devices/?site=pune&amp;role=core-router&amp;fields=id,name</text>
<rect x="10" y="84" width="120" height="30" rx="6" fill="#bae6fd"/><text x="70" y="104" text-anchor="middle" class="svg-ink" font-size="12">method: GET</text>
<rect x="140" y="84" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="215" y="104" text-anchor="middle" class="svg-ink" font-size="12">app and endpoint</text>
<rect x="300" y="84" width="150" height="30" rx="6" fill="#fde68a"/><text x="375" y="104" text-anchor="middle" class="svg-ink" font-size="12">filters: site, role</text>
<rect x="460" y="84" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="12">fields: shape the answer</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">header: Authorization: Token ...   |   answer: count, next, previous, results</text>
</svg><p class="cap">One request: method, endpoint, filters, fields, and the token in a header.</p></div>

<h3>What comes back</h3>
<p>A list answer is an envelope: <code>count</code> (how many match in total), <code>next</code> and <code>previous</code> (full URLs of the neighbouring pages) and <code>results</code> (this page). Objects inside carry <code>id</code>, <code>url</code>, <code>display</code> and their fields. Related objects arrive as small nested objects, and choice fields arrive as <code>{"value": "active", "label": "Active"}</code>; when you write, you send only the plain value. Ask for the compact form with <code>?brief=1</code>, and ask for readable JSON with the header <code>Accept: application/json; indent=2</code>.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" -H "Accept: application/json; indent=2" "$NETBOX_URL/api/dcim/sites/?brief=1"
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "url": "h&#116;tps://10.99.0.80/api/dcim/sites/2/",
      "display": "Bengaluru",
      "name": "Bengaluru",
      "slug": "bengaluru"
    },
    {
      "id": 1,</pre>

<h3>The same in Python, with a session</h3>
<p>Typing the header on every call is how tokens end up pasted in the wrong place. The <code>requests.Session</code> in <code>nbconn.py</code> sets it once, and <code>params=</code> builds the query string for you, so you never concatenate filters by hand.</p>
<pre class="code">"""nbconn.py - the one place that knows how to reach NetBox (URL and token come from the environment)"""
import os

import pynetbox
import requests
from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.netbox.env"))
URL = os.environ["NETBOX_URL"]
TOKEN = os.environ["NETBOX_TOKEN"]


def api():
    """A pynetbox connection. Lab: self-signed certificate, so verification is off."""
    nb = pynetbox.api(URL, token=TOKEN)
    nb.h&#116;tp_session.verify = False
    return nb


def session():
    """A requests.Session with the token header set once."""
    s = requests.Session()
<span class="hl">    s.headers.update({"Authorization": "Token " + TOKEN, "Accept": "application/json"})</span>
    s.verify = False
    return s</pre>
<p>With <code>verify = False</code> a real <code>requests</code> prints an InsecureRequestWarning on every call; the lab does not, and in production you point <code>verify</code> at your CA file instead.</p>

<div class="warn"><p><b>Two ports.</b> NetBox answers on 443 through nginx (HTTPS) and, in this lab, also on 8000 directly to the application in plain HT&#84;P. Scripts use 443. Sending plain HT&#84;P to 443, or HTTPS to 8000, fails with a protocol error. Port 8000 is for the server's own health checks, not for your tools.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Missing token gives 401." In NetBox it gives 403 with <code>Authentication credentials were not provided.</code> Read the text of the answer, not only the number.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab server is fixed at NetBox 4.1.11 and the certificate is self-signed. <code>/api/</code> lists every app, but only the endpoints in the table above exist; anything else, such as cables' front ports, power or circuits, answers 404 in the lab although a real NetBox has them.</p></div>

<div class="scn"><h4>The token in the repository</h4><p>An engineer pasted the NetBox token into a script and pushed it to the team repository. A week later the audit tool flagged it. The fix took ten minutes: create a new token, rotate it, read the value from <code>NETBOX_TOKEN</code>, add <code>.netbox.env</code> to <code>.gitignore</code>. The change log in NetBox showed that the old token had made only reads, so no cleanup of data was needed.</p><p><b>Lesson:</b> use a read-only token for reports and a separate read-write token for automation, and keep both out of the code.</p></div>
<div class="iv"><p class="q">"How do you authenticate to the NetBox API from a script?"</p><p>An <code>Authorization: Token</code> header, with the value read from an environment variable or a secrets store. I use a read-only token for reporting scripts and a read-write token only for the jobs that change data, and I set the header once on a session object.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URLs look like <code>/api/app/endpoint/id/</code>, with hyphens in endpoint names.</li>
<li>Every call needs <code>Authorization: Token ...</code>; missing or wrong token gives 403.</li>
<li>Lists are envelopes with count, next, previous and results.</li>
<li><code>brief</code>, <code>fields</code> and the indent header shape the answer.</li>
<li>Use a Session and <code>params=</code> so the token and the filters are set in one place.</li></ul></div>`,hi:`
<p>Ek bahut sakht library ki kalpana karo. Aap desk par apna membership card dikhate ho (<b>token</b>), batate ho kaunsi shelf chahiye (<b>URL</b>), kaunsi kitabein chahiye (<b>filters</b>), aur librarian numbered stack deta hai (<b>paged answer</b>). Card ke bina darwaze se andar bhi nahi jaa sakte. NetBox wahi library hai, aur uska desk REST bolta hai. REST aap <code>auto-requests</code> se jaante ho; yeh chapter batata hai ki NetBox use kaise karta hai.</p>

<h3>URL ki shakal</h3>
<p>Har object type ka ek list URL aur ek detail URL hota hai. Pattern hai <code>/api/&lt;app&gt;/&lt;endpoint&gt;/</code> aur <code>/api/&lt;app&gt;/&lt;endpoint&gt;/&lt;id&gt;/</code>. Apps endpoints ko group karte hain, aur naamon mein hyphen hota hai: <code>/api/ipam/ip-addresses/</code>, <code>/api/dcim/device-types/</code>.</p>
<table class="cmp"><tr><th>App</th><th>Is module mein use hone wale endpoints</th></tr>
<tr><td>dcim</td><td>sites, regions, racks, manufacturers, device-types, device-roles, platforms, devices, interfaces, cables</td></tr>
<tr><td>ipam</td><td>vrfs, prefixes, ip-addresses, vlans, roles</td></tr>
<tr><td>tenancy</td><td>tenants</td></tr>
<tr><td>extras</td><td>tags, custom-fields, config-contexts</td></tr>
<tr><td>virtualization</td><td>clusters, virtual-machines, interfaces</td></tr>
<tr><td>core</td><td>object-changes (read-only change log)</td></tr></table>
<p>Do special sub-URLs asli kaam karte hain aur unka apna chapter hai: <code>/api/ipam/prefixes/&lt;id&gt;/available-ips/</code> aur <code>.../available-prefixes/</code>.</p>

<h3>Token</h3>
<p>Har call ko, <code>/api/status/</code> ko bhi, <code>Authorization: Token &lt;40 hex characters&gt;</code> chahiye. Tokens NetBox mein ek user ke liye bante hain; token ya read-write hota hai ya read-only. Naye NetBox releases mein doosra token style bhi hai jo <code>Bearer</code> ke saath jata hai; lab ke labs classic wala use karte hain. File ek baar load karo aur curl ko variables padhne do:</p>
<pre class="out">AUTO01$ source ~/.netbox.env; curl -sk $NETBOX_URL/api/status/
{"detail":"Authentication credentials were not provided."}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" $NETBOX_URL/api/status/
{"django-version":"5.0.10","installed-apps":{"debug_toolbar":"5.0.0","django_filters":"24.3","django_prometheus":"2.3.1","django_rq":"2.10.2","django_tables2":"2.7.0","drf_spectacular":"0.27.2","drf_spectacular_sidecar":"2024.11.1","mptt":"0.16.0","rest_framew ...</pre>
<p>Pehli call mein header nahi hai aur NetBox <code>403</code> kehta hai, 401 nahi. Galat token bhi 403 deta hai (<code>Invalid token</code>), aur read-only token tabhi 403 deta hai jab aap write karne ki koshish karo. Curl flags: <code>-s</code> silent, <code>-k</code> lab ka self-signed certificate maan lo (production mein kabhi nahi; uski jagah CA install karo).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="NetBox request ki anatomy">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="24" y="48" class="svg-ink" font-size="13">GET  /api/dcim/devices/?site=pune&amp;role=core-router&amp;fields=id,name</text>
<rect x="10" y="84" width="120" height="30" rx="6" fill="#bae6fd"/><text x="70" y="104" text-anchor="middle" class="svg-ink" font-size="12">method: GET</text>
<rect x="140" y="84" width="150" height="30" rx="6" fill="#bbf7d0"/><text x="215" y="104" text-anchor="middle" class="svg-ink" font-size="12">app aur endpoint</text>
<rect x="300" y="84" width="150" height="30" rx="6" fill="#fde68a"/><text x="375" y="104" text-anchor="middle" class="svg-ink" font-size="12">filters: site, role</text>
<rect x="460" y="84" width="170" height="30" rx="6" fill="#ddd6fe"/><text x="545" y="104" text-anchor="middle" class="svg-ink" font-size="12">fields: answer ki shakal</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">header: Authorization: Token ...   |   answer: count, next, previous, results</text>
</svg><p class="cap">Ek request: method, endpoint, filters, fields, aur token header mein.</p></div>

<h3>Wapas kya aata hai</h3>
<p>List ka jawab ek envelope hota hai: <code>count</code> (kul kitne match karte hain), <code>next</code> aur <code>previous</code> (paas ke pages ke poore URLs) aur <code>results</code> (yeh page). Andar ke objects mein <code>id</code>, <code>url</code>, <code>display</code> aur unke fields hote hain. Related objects chhote nested objects ki tarah aate hain, aur choice fields <code>{"value": "active", "label": "Active"}</code> ki tarah aate hain; likhte waqt aap sirf plain value bhejte ho. Compact form <code>?brief=1</code> se maango, aur padhne layak JSON header <code>Accept: application/json; indent=2</code> se.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" -H "Accept: application/json; indent=2" "$NETBOX_URL/api/dcim/sites/?brief=1"
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "url": "h&#116;tps://10.99.0.80/api/dcim/sites/2/",
      "display": "Bengaluru",
      "name": "Bengaluru",
      "slug": "bengaluru"
    },
    {
      "id": 1,</pre>

<h3>Wahi Python mein, session ke saath</h3>
<p>Har call par header type karna wahi tareeka hai jisse tokens galat jagah paste ho jate hain. <code>nbconn.py</code> ka <code>requests.Session</code> use ek baar set karta hai, aur <code>params=</code> query string khud banata hai, isliye filters kabhi haath se jodne nahi padte.</p>
<pre class="code">"""nbconn.py - the one place that knows how to reach NetBox (URL and token come from the environment)"""
import os

import pynetbox
import requests
from dotenv import load_dotenv

load_dotenv(os.path.expanduser("~/.netbox.env"))
URL = os.environ["NETBOX_URL"]
TOKEN = os.environ["NETBOX_TOKEN"]


def api():
    """A pynetbox connection. Lab: self-signed certificate, so verification is off."""
    nb = pynetbox.api(URL, token=TOKEN)
    nb.h&#116;tp_session.verify = False
    return nb


def session():
    """A requests.Session with the token header set once."""
    s = requests.Session()
<span class="hl">    s.headers.update({"Authorization": "Token " + TOKEN, "Accept": "application/json"})</span>
    s.verify = False
    return s</pre>
<p><code>verify = False</code> ke saath asli <code>requests</code> har call par InsecureRequestWarning print karta hai; lab nahi karta, aur production mein aap <code>verify</code> ko apni CA file par point karte ho.</p>

<div class="warn"><p><b>Do ports.</b> NetBox 443 par nginx ke zariye (HTTPS) jawab deta hai aur is lab mein 8000 par seedha application ko plain HT&#84;P mein bhi. Scripts 443 use karti hain. 443 par plain HT&#84;P ya 8000 par HTTPS bhejne se protocol error aata hai. Port 8000 server ke apne health checks ke liye hai, aapke tools ke liye nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Token na ho to 401 aata hai." NetBox mein 403 aata hai, text <code>Authentication credentials were not provided.</code> ke saath. Sirf number nahi, jawab ka text padho.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab server NetBox 4.1.11 par fixed hai aur certificate self-signed hai. <code>/api/</code> har app dikhata hai, par sirf upar table ke endpoints maujood hain; baaki sab, jaise front ports, power ya circuits, lab mein 404 dete hain jabki asli NetBox mein hote hain.</p></div>

<div class="scn"><h4>Repository mein token</h4><p>Ek engineer ne NetBox ka token script mein paste kiya aur team repository mein push kar diya. Ek hafte baad audit tool ne flag kiya. Fix mein das minute lage: naya token banaya, rotate kiya, value <code>NETBOX_TOKEN</code> se padhi, <code>.netbox.env</code> ko <code>.gitignore</code> mein daala. NetBox ke change log se dikha ki purane token ne sirf reads kiye the, isliye data ki safai ki zaroorat nahi padi.</p><p><b>Lesson:</b> reports ke liye read-only token aur automation ke liye alag read-write token use karo, aur dono code se bahar rakho.</p></div>
<div class="iv"><p class="q">"Script se NetBox API par authenticate kaise karte ho?"</p><p>Ek <code>Authorization: Token</code> header se, jiski value environment variable ya secrets store se padhi jati hai. Reporting scripts ke liye read-only token aur sirf data badalne wale jobs ke liye read-write token use karta hoon, aur header ko session object par ek baar set karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>URLs aise dikhte hain: <code>/api/app/endpoint/id/</code>, endpoint naamon mein hyphen ke saath.</li>
<li>Har call ko <code>Authorization: Token ...</code> chahiye; token na ho ya galat ho to 403.</li>
<li>Lists envelope hoti hain: count, next, previous aur results.</li>
<li><code>brief</code>, <code>fields</code> aur indent header answer ki shakal badalte hain.</li>
<li>Session aur <code>params=</code> use karo taaki token aur filters ek jagah set hon.</li></ul></div>`}};export{e as default};