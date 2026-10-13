var e={id:`request-anatomy`,h:{en:`One endpoint, five parameters: the anatomy of an XML API request and reply`,hi:`Ek endpoint, paanch parameters: XML API request aur reply ki banawat`},body:{en:`
<p>Think of the XML API as a restaurant with one counter and an order slip with a few boxes: <b>what kind of order</b> (<code>type</code>), <b>what to do</b> (<code>action</code>), <b>where</b> (<code>xpath</code>), <b>with what</b> (<code>element</code> or <code>cmd</code>) and your <b>badge</b> (the key). The kitchen answers with a numbered ticket in a fixed format. Learn the slip and the ticket once and every call in this module is a variation.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="diagram">
<rect x="8" y="14" width="300" height="120" rx="10" fill="#e2e8f0"/><text x="158" y="79" text-anchor="middle" class="svg-ink" font-size="13"></text>
<text x="158" y="36" text-anchor="middle" class="svg-ink" font-size="13">Request (POST to /api/)</text>
<text x="20" y="60" text-anchor="start" class="svg-ink" font-size="12">type   = keygen | op | config | commit | export</text>
<text x="20" y="80" text-anchor="start" class="svg-ink" font-size="12">action = get | show | set | edit | delete | rename</text>
<text x="20" y="100" text-anchor="start" class="svg-ink" font-size="12">xpath  = /config/devices/entry[...]/vsys/...</text>
<text x="20" y="120" text-anchor="start" class="svg-ink" font-size="11">element = &lt;ip-netmask&gt;...&lt;/ip-netmask&gt;   cmd = &lt;show&gt;...&lt;/show&gt;</text>
<rect x="332" y="14" width="300" height="120" rx="10" fill="#bbf7d0"/><text x="482" y="79" text-anchor="middle" class="svg-ink" font-size="13"></text>
<text x="482" y="36" text-anchor="middle" class="svg-ink" font-size="13">Response (XML)</text>
<text x="344" y="60" text-anchor="start" class="svg-ink" font-size="12">&lt;response status="success|error" code="N"&gt;</text>
<text x="344" y="80" text-anchor="start" class="svg-ink" font-size="11">  &lt;msg&gt;&lt;line&gt;words from the firewall&lt;/line&gt;&lt;/msg&gt;</text>
<text x="344" y="100" text-anchor="start" class="svg-ink" font-size="11">  &lt;result&gt; ... data or &lt;job&gt;N&lt;/job&gt; ...&lt;/result&gt;</text>
<text x="344" y="120" text-anchor="start" class="svg-accent" font-size="12">H&#84;TP 200 even for most errors</text>
<line x1="308" y1="74" x2="332" y2="74" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four parameters go in, one XML envelope comes back. Read the status attribute, not just the H&#84;TP status.</p></div>

<h3>The parameters</h3>
<table class="cmp"><tr><th>Parameter</th><th>Values you use</th><th>Meaning</th></tr>
<tr><td><code>type</code></td><td><code>keygen</code>, <code>op</code>, <code>config</code>, <code>commit</code>, <code>export</code></td><td>The family of the request. Also <code>log</code>, <code>report</code>, <code>import</code>, <code>user-id</code>.</td></tr>
<tr><td><code>action</code></td><td><code>get</code>, <code>show</code>, <code>set</code>, <code>edit</code>, <code>delete</code>, <code>rename</code>, <code>move</code></td><td>Only for <code>type=config</code>. Chapter 4.</td></tr>
<tr><td><code>xpath</code></td><td><code>/config/devices/entry[...]/vsys/...</code></td><td>Where in the configuration tree.</td></tr>
<tr><td><code>element</code></td><td>XML snippet</td><td>The data to write with <code>set</code> or <code>edit</code>.</td></tr>
<tr><td><code>cmd</code></td><td>XML snippet</td><td>The operational command (<code>type=op</code>) or the commit (<code>type=commit</code>).</td></tr></table>
<p>The endpoint is always <code>/api/</code> on the management address. Everything is one H&#84;TPS POST (or GET) with these fields, and the key in the <code>X-PAN-KEY</code> header.</p>

<h3>Operational commands are CLI words turned into tags</h3>
<p>For <code>type=op</code> every word of the CLI command becomes a nested tag. <code>show system info</code> becomes <code>&lt;show&gt;&lt;system&gt;&lt;info&gt;&lt;/info&gt;&lt;/system&gt;&lt;/show&gt;</code>, and <code>show jobs id 5</code> becomes <code>&lt;show&gt;&lt;jobs&gt;&lt;id&gt;5&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;</code>: the last word is the value, written inside its own tag. You saw the first one in chapter 1.</p>

<h3>The reply: an envelope with a status and a code</h3>
<p>Every reply is an XML <code>&lt;response&gt;</code>. Its attributes carry the verdict. Its <code>msg</code> holds the firewall's words, one <code>line</code> per sentence, and its <code>result</code> holds data, or a job number. <code>raw.py</code> prints the H&#84;TP status and the untouched body of six calls to the lab firewall, good and bad.</p>
<pre class="code">import requests

from panconf import BASE, VSYS, api_key


def show(label, key=None, **params):
    reply = requests.post(BASE, data=params, headers={"X-PAN-KEY": key or api_key()}, verify=False, timeout=10)
    print("--", label, "(H&#84;TP %d)" % reply.status_code)
    print(reply.text.strip())</pre>
<pre class="out">AUTO01$ python3 raw.py
-- an object that exists (H&#84;TP 200)
&lt;response status="success" code="19"&gt;&lt;result total-count="1" count="1"&gt;
  &lt;entry name="web-srv"&gt;
    &lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;
    &lt;description&gt;Web server&lt;/description&gt;
  &lt;/entry&gt;
&lt;/result&gt;&lt;/response&gt;
-- an object that does not exist (H&#84;TP 200)
&lt;response status="success" code="7"&gt;&lt;result/&gt;&lt;/response&gt;
-- an invalid value (H&#84;TP 200)
<span class="hl">&lt;response status="error" code="12"&gt;&lt;msg&gt;&lt;line&gt;address -&amp;gt; bad -&amp;gt; ip-netmask '10.20.0.300/32' is not a valid value or not allowed here&lt;/line&gt;&lt;line&gt;Edit breaks config validity&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</span>
-- a path that does not exist (H&#84;TP 200)
<span class="hl">&lt;response status="error" code="12"&gt;&lt;msg&gt;&lt;line&gt;Invalid XPath /config/nope/path&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</span>
-- a request without a type (H&#84;TP 200)
&lt;response status="error" code="17"&gt;&lt;msg&gt;&lt;line&gt;Invalid or missing type&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;
-- a wrong key (H&#84;TP 403)
&lt;response status = 'error' code = '403'&gt;&lt;result&gt;&lt;msg&gt;Invalid Credential&lt;/msg&gt;&lt;/result&gt;&lt;/response&gt;</pre>
<p>Read the list top to bottom:</p>
<ul>
<li><b>Success with data</b>: <code>status="success" code="19"</code> and the object inside <code>result</code>.</li>
<li><b>Success with nothing</b>: <code>code="7"</code> and an empty <code>&lt;result/&gt;</code>. A missing object is not an error for a read; you must test for it.</li>
<li><b>Error</b>: <code>status="error"</code> with a code and the words of the firewall. Code 12 covers a bad value, a bad XPath and a reference to something that does not exist. Code 17 is an invalid command or type.</li>
<li><b>Authentication</b>: the one real H&#84;TP error. Wrong key gives H&#84;TP 403 and a body written with spaces and single quotes. Everything else is H&#84;TP 200.</li>
</ul>

<h3>The rule: look at status, not at H&#84;TP</h3>
<p>So the helper never trusts <code>reply.status_code</code> alone. It parses the body, reads <code>status</code>, and raises an exception that carries the H&#84;TP status, the code and the firewall's words. This is Lab 1 task 2, first half.</p>
<pre class="code">"""xapi.py - small helpers for the PAN-OS XML API: one call function, one error class, commit with job polling"""
import time
import xml.etree.ElementTree as ET

import requests

from panconf import BASE, api_key


class PanApiError(Exception):
    """The firewall answered, but with status=error."""

    def __init__(self, code, message, h&#116;tp=200):
        super().__init__("code %s: %s" % (code, message))
        self.code = code
        self.message = message
        self.h&#116;tp = h&#116;tp


def call(**params):
    """One XML API request. Returns the parsed &lt;response&gt;; raises PanApiError when status is error."""
    reply = requests.post(BASE, data=params, headers={"X-PAN-KEY": api_key()}, verify=False, timeout=10)
    root = ET.fromstring(reply.text)
    if root.get("status") != "success":
        lines = [x.text for x in root.iter("line")] or [root.findtext(".//msg")]
        raise PanApiError(root.get("code"), " | ".join(t for t in lines if t), reply.status_code)
    return root</pre>
<p>Three details matter. The key comes from <code>api_key()</code>, which stops with a clear message when it is missing. <code>root.iter("line")</code> gathers every sentence of the message, because errors usually have two. And <code>PanApiError</code> keeps <code>code</code>, <code>message</code> and <code>h&#116;tp</code> as attributes, so a caller can treat code 10 differently from code 16.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab accepts the key in the header and in the form body. Code numbers other than 403 follow the PAN-OS list from memory of the documentation: do not memorise the number for a message you have not seen, look at the words.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Checking <code>reply.ok</code> or <code>raise_for_status()</code> and calling it done: a rejected change is H&#84;TP 200.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>type=op</code> runs operational commands and returns data; <code>type=config</code> reads and edits the configuration tree; <code>type=commit</code> starts a commit. A <code>set</code> sent as <code>type=op</code> does nothing useful.</p></div>

<div class="scn"><h4>All green, nothing changed</h4><p>A monitoring job posted address objects to a firewall and checked <code>response.status_code == 200</code>. It stayed green for a week while the firewall rejected every call with code 12: the new xpath did not exist. One check of the <code>status</code> attribute would have turned it red on day one.</p><p><b>Lesson:</b> on PAN-OS, H&#84;TP 200 answers "did a web server reply", not "did my change work".</p></div>

<div class="iv"><p class="q">"A PAN-OS API call returned H&#84;TP 200. Did it work?"</p><p>Not necessarily. I parse the body and read the <code>status</code> attribute of <code>response</code>, then the <code>code</code> and the <code>msg</code> lines. An invalid key is a real H&#84;TP 403, but a bad xpath, a bad value or a missing reference all come back as 200 with <code>status="error"</code>. I keep that logic in one helper that raises an exception.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One endpoint, <code>/api/</code>, driven by <code>type</code>, <code>action</code>, <code>xpath</code>, <code>element</code>, <code>cmd</code>.</li>
<li>Operational commands are CLI words written as nested XML tags.</li>
<li>The verdict is in the <code>status</code> attribute and the <code>code</code>; H&#84;TP is 200 even for most errors.</li>
<li>A read of a missing object is success with code 7 and an empty result.</li>
<li>Put the call, the error class and the checks in one helper module.</li>
</ul></div>
`,hi:`
<p>XML API ko ek restaurant samjho jisme ek counter hai aur order slip par kuch dibbe hain: <b>kis tarah ka order</b> (<code>type</code>), <b>kya karna hai</b> (<code>action</code>), <b>kahan</b> (<code>xpath</code>), <b>kis cheez ke saath</b> (<code>element</code> ya <code>cmd</code>) aur aapka <b>badge</b> (key). Kitchen ek tay format mein numbered ticket se jawab deta hai. Slip aur ticket ek baar seekh lo, to is module ki har call uski ek variation hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="diagram">
<rect x="8" y="14" width="300" height="120" rx="10" fill="#e2e8f0"/><text x="158" y="79" text-anchor="middle" class="svg-ink" font-size="13"></text>
<text x="158" y="36" text-anchor="middle" class="svg-ink" font-size="13">Request (/api/ par POST)</text>
<text x="20" y="60" text-anchor="start" class="svg-ink" font-size="12">type   = keygen | op | config | commit | export</text>
<text x="20" y="80" text-anchor="start" class="svg-ink" font-size="12">action = get | show | set | edit | delete | rename</text>
<text x="20" y="100" text-anchor="start" class="svg-ink" font-size="12">xpath  = /config/devices/entry[...]/vsys/...</text>
<text x="20" y="120" text-anchor="start" class="svg-ink" font-size="11">element = &lt;ip-netmask&gt;...&lt;/ip-netmask&gt;   cmd = &lt;show&gt;...&lt;/show&gt;</text>
<rect x="332" y="14" width="300" height="120" rx="10" fill="#bbf7d0"/><text x="482" y="79" text-anchor="middle" class="svg-ink" font-size="13"></text>
<text x="482" y="36" text-anchor="middle" class="svg-ink" font-size="13">Response (XML)</text>
<text x="344" y="60" text-anchor="start" class="svg-ink" font-size="12">&lt;response status="success|error" code="N"&gt;</text>
<text x="344" y="80" text-anchor="start" class="svg-ink" font-size="11">  &lt;msg&gt;&lt;line&gt;firewall ke apne shabd&lt;/line&gt;&lt;/msg&gt;</text>
<text x="344" y="100" text-anchor="start" class="svg-ink" font-size="11">  &lt;result&gt; ... data ya &lt;job&gt;N&lt;/job&gt; ...&lt;/result&gt;</text>
<text x="344" y="120" text-anchor="start" class="svg-accent" font-size="12">Zyaadatar errors par bhi H&#84;TP 200</text>
<line x1="308" y1="74" x2="332" y2="74" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar parameters andar, ek XML envelope wapas. Sirf H&#84;TP status nahi, status attribute padho.</p></div>

<h3>Parameters</h3>
<table class="cmp"><tr><th>Parameter</th><th>Jo values use hongi</th><th>Matlab</th></tr>
<tr><td><code>type</code></td><td><code>keygen</code>, <code>op</code>, <code>config</code>, <code>commit</code>, <code>export</code></td><td>Request ka parivaar. Saath mein <code>log</code>, <code>report</code>, <code>import</code>, <code>user-id</code> bhi.</td></tr>
<tr><td><code>action</code></td><td><code>get</code>, <code>show</code>, <code>set</code>, <code>edit</code>, <code>delete</code>, <code>rename</code>, <code>move</code></td><td>Sirf <code>type=config</code> ke liye. Chapter 4.</td></tr>
<tr><td><code>xpath</code></td><td><code>/config/devices/entry[...]/vsys/...</code></td><td>Configuration tree mein kahan.</td></tr>
<tr><td><code>element</code></td><td>XML snippet</td><td><code>set</code> ya <code>edit</code> ke saath likhne wala data.</td></tr>
<tr><td><code>cmd</code></td><td>XML snippet</td><td>Operational command (<code>type=op</code>) ya commit (<code>type=commit</code>).</td></tr></table>
<p>Endpoint hamesha management address par <code>/api/</code> hai. Sab kuch in fields ke saath ek H&#84;TPS POST (ya GET) hai, aur key <code>X-PAN-KEY</code> header mein.</p>

<h3>Operational commands: CLI ke shabd tags ban jaate hain</h3>
<p><code>type=op</code> ke liye CLI command ka har shabd nested tag ban jaata hai. <code>show system info</code> ban jaata hai <code>&lt;show&gt;&lt;system&gt;&lt;info&gt;&lt;/info&gt;&lt;/system&gt;&lt;/show&gt;</code>, aur <code>show jobs id 5</code> ban jaata hai <code>&lt;show&gt;&lt;jobs&gt;&lt;id&gt;5&lt;/id&gt;&lt;/jobs&gt;&lt;/show&gt;</code>: aakhri shabd value hai, jo apne tag ke andar likhi jaati hai. Pehli wali aap chapter 1 mein dekh chuke ho.</p>

<h3>Reply: status aur code wala envelope</h3>
<p>Har reply ek XML <code>&lt;response&gt;</code> hai. Uske attributes mein faisla hota hai. Uska <code>msg</code> firewall ke shabd rakhta hai, har vaakya ek <code>line</code> mein, aur <code>result</code> data ya job number rakhta hai. <code>raw.py</code> lab firewall ko chhah calls ka H&#84;TP status aur bina chhue body print karti hai, achhi bhi aur buri bhi.</p>
<pre class="code">import requests

from panconf import BASE, VSYS, api_key


def show(label, key=None, **params):
    reply = requests.post(BASE, data=params, headers={"X-PAN-KEY": key or api_key()}, verify=False, timeout=10)
    print("--", label, "(H&#84;TP %d)" % reply.status_code)
    print(reply.text.strip())</pre>
<pre class="out">AUTO01$ python3 raw.py
-- an object that exists (H&#84;TP 200)
&lt;response status="success" code="19"&gt;&lt;result total-count="1" count="1"&gt;
  &lt;entry name="web-srv"&gt;
    &lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;
    &lt;description&gt;Web server&lt;/description&gt;
  &lt;/entry&gt;
&lt;/result&gt;&lt;/response&gt;
-- an object that does not exist (H&#84;TP 200)
&lt;response status="success" code="7"&gt;&lt;result/&gt;&lt;/response&gt;
-- an invalid value (H&#84;TP 200)
<span class="hl">&lt;response status="error" code="12"&gt;&lt;msg&gt;&lt;line&gt;address -&amp;gt; bad -&amp;gt; ip-netmask '10.20.0.300/32' is not a valid value or not allowed here&lt;/line&gt;&lt;line&gt;Edit breaks config validity&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</span>
-- a path that does not exist (H&#84;TP 200)
<span class="hl">&lt;response status="error" code="12"&gt;&lt;msg&gt;&lt;line&gt;Invalid XPath /config/nope/path&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</span>
-- a request without a type (H&#84;TP 200)
&lt;response status="error" code="17"&gt;&lt;msg&gt;&lt;line&gt;Invalid or missing type&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;
-- a wrong key (H&#84;TP 403)
&lt;response status = 'error' code = '403'&gt;&lt;result&gt;&lt;msg&gt;Invalid Credential&lt;/msg&gt;&lt;/result&gt;&lt;/response&gt;</pre>
<p>List ko upar se neeche padho:</p>
<ul>
<li><b>Data ke saath success</b>: <code>status="success" code="19"</code> aur object <code>result</code> ke andar.</li>
<li><b>Kuch nahi ke saath success</b>: <code>code="7"</code> aur khaali <code>&lt;result/&gt;</code>. Padhne par object ka na hona error nahi hai; aapko khud test karna padta hai.</li>
<li><b>Error</b>: <code>status="error"</code> code aur firewall ke shabdon ke saath. Code 12 galat value, galat XPath aur aisi cheez ke reference ko cover karta hai jo hai hi nahi. Code 17 invalid command ya type hai.</li>
<li><b>Authentication</b>: ek asli H&#84;TP error. Galat key H&#84;TP 403 deti hai aur body spaces aur single quotes ke saath likhi hoti hai. Baaki sab H&#84;TP 200 hai.</li>
</ul>

<h3>Niyam: status dekho, H&#84;TP nahi</h3>
<p>Isliye helper sirf <code>reply.status_code</code> par bharosa nahi karta. Woh body parse karta hai, <code>status</code> padhta hai, aur exception uthata hai jisme H&#84;TP status, code aur firewall ke shabd hote hain. Yeh Lab 1 task 2 ka pehla hissa hai.</p>
<pre class="code">"""xapi.py - small helpers for the PAN-OS XML API: one call function, one error class, commit with job polling"""
import time
import xml.etree.ElementTree as ET

import requests

from panconf import BASE, api_key


class PanApiError(Exception):
    """The firewall answered, but with status=error."""

    def __init__(self, code, message, h&#116;tp=200):
        super().__init__("code %s: %s" % (code, message))
        self.code = code
        self.message = message
        self.h&#116;tp = h&#116;tp


def call(**params):
    """One XML API request. Returns the parsed &lt;response&gt;; raises PanApiError when status is error."""
    reply = requests.post(BASE, data=params, headers={"X-PAN-KEY": api_key()}, verify=False, timeout=10)
    root = ET.fromstring(reply.text)
    if root.get("status") != "success":
        lines = [x.text for x in root.iter("line")] or [root.findtext(".//msg")]
        raise PanApiError(root.get("code"), " | ".join(t for t in lines if t), reply.status_code)
    return root</pre>
<p>Teen baatein zaroori hain. Key <code>api_key()</code> se aati hai, jo missing hone par saaf message ke saath ruk jaati hai. <code>root.iter("line")</code> message ke har vaakya ko jama karta hai, kyunki errors mein aam taur par do hote hain. Aur <code>PanApiError</code> <code>code</code>, <code>message</code> aur <code>h&#116;tp</code> ko attributes ki tarah rakhta hai, taaki caller code 10 ko code 16 se alag sambhal sake.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab key ko header mein aur form body mein accept karta hai. 403 ke alawa code numbers documentation ki yaad se PAN-OS list ko follow karte hain: jis message ko dekha nahi uska number ratne ki jagah shabd dekho.</p></div>
<div class="warn"><p><b>Aam galtiyan.</b> <code>reply.ok</code> ya <code>raise_for_status()</code> check karke kaam khatam maan lena: reject hua change bhi H&#84;TP 200 hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>type=op</code> operational commands chalata hai aur data lautata hai; <code>type=config</code> configuration tree padhta aur edit karta hai; <code>type=commit</code> commit shuru karta hai. <code>type=op</code> ke roop mein bheja gaya <code>set</code> kaam ka kuch nahi karta.</p></div>

<div class="scn"><h4>Sab hara, kuch nahi badla</h4><p>Ek monitoring job firewall par address objects post karti thi aur <code>response.status_code == 200</code> check karti thi. Woh ek hafte green rahi jabki firewall har call code 12 se reject karta raha: naya xpath exist nahi karta tha. <code>status</code> attribute ki ek check use pehle din laal kar deti.</p><p><b>Lesson:</b> PAN-OS par H&#84;TP 200 ka matlab "web server ne jawab diya", "mera change kaam kar gaya" nahi.</p></div>

<div class="iv"><p class="q">"PAN-OS API call ne H&#84;TP 200 diya. Kya woh kaam kiya?"</p><p>Zaroori nahi. Main body parse karta hoon aur <code>response</code> ka <code>status</code> attribute padhta hoon, phir <code>code</code> aur <code>msg</code> lines. Invalid key asli H&#84;TP 403 hai, par galat xpath, galat value ya missing reference sab <code>status="error"</code> ke saath 200 mein aate hain. Yeh logic main ek helper mein rakhta hoon jo exception uthata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek endpoint, <code>/api/</code>, jo <code>type</code>, <code>action</code>, <code>xpath</code>, <code>element</code>, <code>cmd</code> se chalta hai.</li>
<li>Operational commands CLI ke shabd hain jo nested XML tags mein likhe jaate hain.</li>
<li>Faisla <code>status</code> attribute aur <code>code</code> mein hota hai; zyadatar errors par bhi H&#84;TP 200 hota hai.</li>
<li>Missing object ko padhna code 7 aur khaali result ke saath success hai.</li>
<li>Call, error class aur checks ek helper module mein rakho.</li>
</ul></div>
`}};export{e as default};