var e={id:`vendor-replies`,h:{en:`Vendor dialects and sanity checks on replies`,hi:`Vendor dialects aur replies par sanity checks`},body:{en:`
<p><b>The idea of this chapter:</b> three vendors, three XML habits. Once you know each habit, you can write a small checker that refuses a bad reply early and says why, instead of letting <code>None</code> travel three functions before it explodes.</p>

<h3>The three dialects side by side</h3>
<table class="cmp">
<tr><th></th><th>Junos</th><th>IOS XE NETCONF</th><th>PAN-OS</th></tr>
<tr><td>envelope</td><td><code>rpc-reply</code></td><td><code>rpc-reply</code> + <code>data</code></td><td><code>response</code> + <code>result</code></td></tr>
<tr><td>success signal</td><td>the data itself</td><td>no <code>rpc-error</code></td><td><code>status="success"</code></td></tr>
<tr><td>failure</td><td>error element in the reply</td><td><code>rpc-error</code></td><td><code>status="error"</code> + <code>code</code> + <code>msg</code></td></tr>
<tr><td>namespaces</td><td>on the payload, release inside the URI</td><td>everywhere (YANG)</td><td>none</td></tr>
<tr><td>traps</td><td><code>+179</code>, padded text</td><td>attribute on <code>error-message</code></td><td>H&#84;TP 200 on failure; odd quotes</td></tr>
</table>
<p>Two of those rows are worth seeing. PAN-OS says "no" with a perfectly normal H&#84;TP 200, and IOS XE says it inside the NETCONF envelope:</p>
<pre class="out">&lt;response status="error" code="17"&gt;&lt;msg&gt;&lt;line&gt;Invalid command: show routing protocol bgp peer&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</pre>
<pre class="out">&lt;rpc-reply message-id="103" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;rpc-error&gt;
    &lt;error-type&gt;application&lt;/error-type&gt;
    &lt;error-tag&gt;unknown-element&lt;/error-tag&gt;
    &lt;error-severity&gt;error&lt;/error-severity&gt;
    &lt;error-message xml:lang="en"&gt;element &amp;lt;bogus&amp;gt; is not part of the data model&lt;/error-message&gt;
    &lt;error-info&gt;
      &lt;bad-element&gt;bogus&lt;/bad-element&gt;
    &lt;/error-info&gt;
  &lt;/rpc-error&gt;
&lt;/rpc-reply&gt;</pre>
<p>The first is the lab firewall's answer to a BGP question (it has no BGP). The second is a NETCONF <code>rpc-error</code>. In both cases an H&#84;TP or SSH success tells you nothing: only the XML says whether the request worked.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A checker between the device and your code">
<rect x="10" y="35" width="110" height="70" rx="10" fill="#e2e8f0"/>
<text x="65" y="74" text-anchor="middle" class="svg-ink" font-size="13">reply text</text>
<rect x="160" y="35" width="110" height="70" rx="10" fill="#bae6fd"/>
<text x="215" y="66" text-anchor="middle" class="svg-ink" font-size="13">parse and root</text>
<text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="11">right dialect?</text>
<rect x="310" y="35" width="110" height="70" rx="10" fill="#bae6fd"/>
<text x="365" y="66" text-anchor="middle" class="svg-ink" font-size="13">vendor status</text>
<text x="365" y="82" text-anchor="middle" class="svg-muted" font-size="11">error to exception</text>
<rect x="460" y="35" width="80" height="70" rx="10" fill="#bbf7d0"/>
<text x="500" y="74" text-anchor="middle" class="svg-ink" font-size="13">payload</text>
<rect x="575" y="35" width="60" height="70" rx="10" fill="#bbf7d0"/>
<text x="605" y="74" text-anchor="middle" class="svg-ink" font-size="13">rows</text>
<line x1="120" y1="70" x2="160" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="160,70 152,73 152,66" fill="#64748b"/>
<line x1="270" y1="70" x2="310" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="310,70 302,73 302,66" fill="#64748b"/>
<line x1="420" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="460,70 452,73 452,66" fill="#64748b"/>
<line x1="540" y1="70" x2="575" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="575,70 567,73 567,66" fill="#64748b"/>
</svg><p class="cap">Each stage either passes the reply on or raises with the vendor's own words.</p></div>
<h3>Check the envelope, then hand over the payload</h3>
<pre class="code">import xml.etree.ElementTree as ET

NC_NS = "urn:ietf:params:xml:ns:netconf:base:1.0"
NC = {"nc": NC_NS}


def pan_result(text):
    """Return the &lt;result&gt; element of a PAN-OS reply, or raise with the firewall's own words."""
    root = ET.fromstring(text)
    if root.tag != "response":
        raise ValueError("not a PAN-OS reply, root element is " + root.tag)
    if root.get("status") != "success":
        words = " ".join(t.strip() for t in root.itertext() if t.strip())
        raise RuntimeError("PAN-OS status=%s code=%s: %s" % (root.get("status"), root.get("code"), words))
    return root.find("result")


def netconf_data(text):
    """Return the &lt;data&gt; element of a NETCONF reply, or raise the first rpc-error."""
    root = ET.fromstring(text)
    if root.tag != "{%s}rpc-reply" % NC_NS:
        raise ValueError("not a NETCONF reply, root element is " + root.tag)
    err = root.find("nc:rpc-error", NC)
    if err is not None:
        tag = err.findtext("nc:error-tag", namespaces=NC)
        msg = err.findtext("nc:error-message", namespaces=NC)
        raise RuntimeError("NETCONF %s: %s" % (tag, msg))
    return root.find("nc:data", NC)</pre>
<p>Each function does two things: it checks that this is the kind of reply it expects (root tag), and it converts the vendor's error signal into a Python exception carrying the vendor's own words. Callers then get the interesting element or an exception, never a silent <code>None</code>.</p>
<pre class="code">from xmlcheck import pan_result, netconf_data

for name in ["pan_keygen.xml", "pan_bgp.xml", "pan_badkey.xml"]:
    try:
        result = pan_result(open(name).read())
        print(name, "ok, result has", len(result), "child element(s)")
    except RuntimeError as err:
        print(name, "-&gt;", err)

for name in ["xe_ifaces.xml", "xe_err.xml"]:
    try:
        data = netconf_data(open(name).read())
        print(name, "ok, data holds", data[0].tag)
    except RuntimeError as err:
        print(name, "-&gt;", err)

try:
    netconf_data(open("pan_keygen.xml").read())
except ValueError as err:
    print("wrong parser -&gt;", err)</pre>
<pre class="out">AUTO01$ python3 c7_use.py
pan_keygen.xml ok, result has 1 child element(s)
<span class="hl">pan_bgp.xml -&gt; PAN-OS status=error code=17: Invalid command: show routing protocol bgp peer</span>
<span class="hl">pan_badkey.xml -&gt; PAN-OS status=error code=403: Invalid Credential</span>
xe_ifaces.xml ok, data holds {urn:ietf:params:xml:ns:yang:ietf-interfaces}interfaces
<span class="hl">xe_err.xml -&gt; NETCONF unknown-element: element &lt;bogus&gt; is not part of the data model</span>
<span class="hl">wrong parser -&gt; not a NETCONF reply, root element is response</span></pre>
<p>Six calls, six honest answers. The firewall's refusal and the bad credential read like sentences. The last line is the cheapest check of all: feed the wrong kind of reply and the root tag gives it away.</p>

<h3>Check the content: a Junos peer table</h3>
<pre class="code">import xml.etree.ElementTree as ET

RT = "{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}"
STATES = {"Idle", "Connect", "Active", "OpenSent", "OpenConfirm", "Established"}
REQUIRED = ("peer-address", "peer-as", "peer-state")


def bgp_peers(path):
    root = ET.parse(path).getroot()
    peers = root.findall(RT + "bgp-information/" + RT + "bgp-peer")
    if not peers:
        raise ValueError("no bgp-peer elements: BGP not configured, or the namespace is wrong")
    rows = []
    for peer in peers:
        row = {tag: (peer.findtext(RT + tag) or "").strip() for tag in REQUIRED}
        missing = [tag for tag, value in row.items() if not value]
        if missing:
            raise ValueError("peer block without " + ", ".join(missing))
        if not row["peer-as"].isdigit():
            raise ValueError("peer %s: AS %r is not a number" % (row["peer-address"], row["peer-as"]))
        if row["peer-state"] not in STATES:
            raise ValueError("peer %s: unknown state %r" % (row["peer-address"], row["peer-state"]))
        row["peer-address"] = row["peer-address"].split("+")[0]
        rows.append(row)
    return rows


rows = bgp_peers("junos_bgp.xml")
print(len(rows), "peers;", sum(r["peer-state"] == "Established" for r in rows), "established")
print(rows[0])

damaged = open("junos_bgp.xml").read().replace("&lt;peer-as&gt;65003&lt;/peer-as&gt;", "&lt;peer-as&gt;AS65003&lt;/peer-as&gt;")
open("damaged.xml", "w").write(damaged)
try:
    bgp_peers("damaged.xml")
except ValueError as err:
    print("ValueError:", err)

try:
    bgp_peers("pan_keygen.xml")
except ValueError as err:
    print("ValueError:", err)</pre>
<pre class="out">AUTO01$ python3 c7_peers.py
3 peers; 1 established
{'peer-address': '10.99.0.12', 'peer-as': '65002', 'peer-state': 'Established'}
<span class="hl">ValueError: peer 10.99.0.13+179: AS 'AS65003' is not a number</span>
<span class="hl">ValueError: no bgp-peer elements: BGP not configured, or the namespace is wrong</span></pre>
<p>The function checks required fields, a number where a number belongs, and a known state. The two failures at the end show the payoff: a damaged file and a wrong-namespace file each give a message a human can act on. Note <code>.strip()</code> and <code>split("+")[0]</code>, the Junos habits from chapter 3.</p>

<h3>What about a real schema?</h3>
<p>On your laptop, lxml can validate against an XSD with <code>etree.XMLSchema</code>. That, and XSLT, is not available inside the lab, so this course uses hand-written checks. They are usually enough: you need the five fields your script uses, not the whole schema.</p>

<div class="warn"><p><b>Common mistakes.</b> Trusting the H&#84;TP status of a PAN-OS call. Checking only that the XML parses. Hard-coding a Junos release number in a namespace URI. Catching <code>Exception</code> around the whole parser and printing "failed".</p></div>
<div class="exam"><p><b>Exam trap.</b> A well-formed reply is not a successful reply. Success is a statement the vendor makes inside the XML: <code>status</code>, an absent <code>rpc-error</code>, or the data you asked for.</p></div>

<div class="scn"><h4>The firewall that said 200</h4><p>A nightly job asked a firewall for BGP peers and recorded "0 peers" for a week. The H&#84;TP status was 200 every night. The reply said <code>status="error" code="17"</code> because that platform has no BGP. Once the job raised on <code>status</code>, the dashboard showed "unsupported" instead of a false zero.</p><p><b>Lesson:</b> an empty result and an error are different facts.</p></div>

<div class="iv"><p class="q">How do you know a PAN-OS API call really succeeded?</p><p>H&#84;TP 200 only means the web server answered. I parse the body and check the <code>status</code> attribute on the root <code>response</code> element, then read <code>code</code> and <code>msg</code> on failure and raise an exception with those words.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos, IOS XE and PAN-OS each signal success and failure differently, always inside the XML.</li>
<li>Write one checker per dialect: verify the root, turn errors into exceptions, return the payload.</li>
<li>Validate content: required fields, numbers, known states.</li>
<li>XMLSchema and XSLT are laptop-only here; hand checks cover most scripts.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> teen vendors, teen XML aadatein. Har aadat jaan lo to ek chhota checker likh sakte ho jo kharab reply ko jaldi mana kare aur wajah bataye, bajaye iske ki <code>None</code> teen functions tak safar kare aur phir phate.</p>

<h3>Teeno dialects aamne-saamne</h3>
<table class="cmp">
<tr><th></th><th>Junos</th><th>IOS XE NETCONF</th><th>PAN-OS</th></tr>
<tr><td>envelope</td><td><code>rpc-reply</code></td><td><code>rpc-reply</code> + <code>data</code></td><td><code>response</code> + <code>result</code></td></tr>
<tr><td>success ka signal</td><td>data khud</td><td><code>rpc-error</code> nahi</td><td><code>status="success"</code></td></tr>
<tr><td>failure</td><td>reply mein error element</td><td><code>rpc-error</code></td><td><code>status="error"</code> + <code>code</code> + <code>msg</code></td></tr>
<tr><td>namespaces</td><td>payload par, release URI ke andar</td><td>har jagah (YANG)</td><td>koi nahi</td></tr>
<tr><td>jaal</td><td><code>+179</code>, padded text</td><td><code>error-message</code> par attribute</td><td>failure par bhi H&#84;TP 200; ajeeb quotes</td></tr>
</table>
<p>Do rows dekhne layak hain. PAN-OS "nahi" ek bilkul normal H&#84;TP 200 ke saath kehta hai, aur IOS XE yeh NETCONF envelope ke andar kehta hai:</p>
<pre class="out">&lt;response status="error" code="17"&gt;&lt;msg&gt;&lt;line&gt;Invalid command: show routing protocol bgp peer&lt;/line&gt;&lt;/msg&gt;&lt;/response&gt;</pre>
<pre class="out">&lt;rpc-reply message-id="103" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
  &lt;rpc-error&gt;
    &lt;error-type&gt;application&lt;/error-type&gt;
    &lt;error-tag&gt;unknown-element&lt;/error-tag&gt;
    &lt;error-severity&gt;error&lt;/error-severity&gt;
    &lt;error-message xml:lang="en"&gt;element &amp;lt;bogus&amp;gt; is not part of the data model&lt;/error-message&gt;
    &lt;error-info&gt;
      &lt;bad-element&gt;bogus&lt;/bad-element&gt;
    &lt;/error-info&gt;
  &lt;/rpc-error&gt;
&lt;/rpc-reply&gt;</pre>
<p>Pehla lab firewall ka BGP sawaal par jawab hai (usme BGP nahi). Doosra NETCONF <code>rpc-error</code> hai. Dono mein H&#84;TP ya SSH ki safalta kuch nahi batati: sirf XML batata hai ki request chali ya nahi.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Device aur tumhare code ke beech ek checker">
<rect x="10" y="35" width="110" height="70" rx="10" fill="#e2e8f0"/>
<text x="65" y="74" text-anchor="middle" class="svg-ink" font-size="13">reply text</text>
<rect x="160" y="35" width="110" height="70" rx="10" fill="#bae6fd"/>
<text x="215" y="66" text-anchor="middle" class="svg-ink" font-size="13">parse aur root</text>
<text x="215" y="82" text-anchor="middle" class="svg-muted" font-size="11">sahi dialect?</text>
<rect x="310" y="35" width="110" height="70" rx="10" fill="#bae6fd"/>
<text x="365" y="66" text-anchor="middle" class="svg-ink" font-size="13">vendor status</text>
<text x="365" y="82" text-anchor="middle" class="svg-muted" font-size="11">error se exception</text>
<rect x="460" y="35" width="80" height="70" rx="10" fill="#bbf7d0"/>
<text x="500" y="74" text-anchor="middle" class="svg-ink" font-size="13">payload</text>
<rect x="575" y="35" width="60" height="70" rx="10" fill="#bbf7d0"/>
<text x="605" y="74" text-anchor="middle" class="svg-ink" font-size="13">rows</text>
<line x1="120" y1="70" x2="160" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="160,70 152,73 152,66" fill="#64748b"/>
<line x1="270" y1="70" x2="310" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="310,70 302,73 302,66" fill="#64748b"/>
<line x1="420" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="460,70 452,73 452,66" fill="#64748b"/>
<line x1="540" y1="70" x2="575" y2="70" stroke="#64748b" stroke-width="2"/>
<polygon points="575,70 567,73 567,66" fill="#64748b"/>
</svg><p class="cap">Har stage ya reply aage deta hai ya vendor ke apne shabdon ke saath raise karta hai.</p></div>
<h3>Pehle envelope check karo, phir payload do</h3>
<pre class="code">import xml.etree.ElementTree as ET

NC_NS = "urn:ietf:params:xml:ns:netconf:base:1.0"
NC = {"nc": NC_NS}


def pan_result(text):
    """Return the &lt;result&gt; element of a PAN-OS reply, or raise with the firewall's own words."""
    root = ET.fromstring(text)
    if root.tag != "response":
        raise ValueError("not a PAN-OS reply, root element is " + root.tag)
    if root.get("status") != "success":
        words = " ".join(t.strip() for t in root.itertext() if t.strip())
        raise RuntimeError("PAN-OS status=%s code=%s: %s" % (root.get("status"), root.get("code"), words))
    return root.find("result")


def netconf_data(text):
    """Return the &lt;data&gt; element of a NETCONF reply, or raise the first rpc-error."""
    root = ET.fromstring(text)
    if root.tag != "{%s}rpc-reply" % NC_NS:
        raise ValueError("not a NETCONF reply, root element is " + root.tag)
    err = root.find("nc:rpc-error", NC)
    if err is not None:
        tag = err.findtext("nc:error-tag", namespaces=NC)
        msg = err.findtext("nc:error-message", namespaces=NC)
        raise RuntimeError("NETCONF %s: %s" % (tag, msg))
    return root.find("nc:data", NC)</pre>
<p>Har function do kaam karta hai: check karta hai ki yeh wahi reply hai jisse woh umeed karta hai (root tag), aur vendor ke error signal ko Python exception mein badalta hai jisme vendor ke apne shabd hote hain. Callers ko dilchasp element milta hai ya exception, kabhi chupchap <code>None</code> nahi.</p>
<pre class="code">from xmlcheck import pan_result, netconf_data

for name in ["pan_keygen.xml", "pan_bgp.xml", "pan_badkey.xml"]:
    try:
        result = pan_result(open(name).read())
        print(name, "ok, result has", len(result), "child element(s)")
    except RuntimeError as err:
        print(name, "-&gt;", err)

for name in ["xe_ifaces.xml", "xe_err.xml"]:
    try:
        data = netconf_data(open(name).read())
        print(name, "ok, data holds", data[0].tag)
    except RuntimeError as err:
        print(name, "-&gt;", err)

try:
    netconf_data(open("pan_keygen.xml").read())
except ValueError as err:
    print("wrong parser -&gt;", err)</pre>
<pre class="out">AUTO01$ python3 c7_use.py
pan_keygen.xml ok, result has 1 child element(s)
<span class="hl">pan_bgp.xml -&gt; PAN-OS status=error code=17: Invalid command: show routing protocol bgp peer</span>
<span class="hl">pan_badkey.xml -&gt; PAN-OS status=error code=403: Invalid Credential</span>
xe_ifaces.xml ok, data holds {urn:ietf:params:xml:ns:yang:ietf-interfaces}interfaces
<span class="hl">xe_err.xml -&gt; NETCONF unknown-element: element &lt;bogus&gt; is not part of the data model</span>
<span class="hl">wrong parser -&gt; not a NETCONF reply, root element is response</span></pre>
<p>Chhe calls, chhe imaandaar jawab. Firewall ka inkaar aur kharab credential sentences ki tarah padhte hain. Aakhri line sabse sasti check hai: galat kism ka reply do aur root tag pakda deta hai.</p>

<h3>Content check karo: Junos peer table</h3>
<pre class="code">import xml.etree.ElementTree as ET

RT = "{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}"
STATES = {"Idle", "Connect", "Active", "OpenSent", "OpenConfirm", "Established"}
REQUIRED = ("peer-address", "peer-as", "peer-state")


def bgp_peers(path):
    root = ET.parse(path).getroot()
    peers = root.findall(RT + "bgp-information/" + RT + "bgp-peer")
    if not peers:
        raise ValueError("no bgp-peer elements: BGP not configured, or the namespace is wrong")
    rows = []
    for peer in peers:
        row = {tag: (peer.findtext(RT + tag) or "").strip() for tag in REQUIRED}
        missing = [tag for tag, value in row.items() if not value]
        if missing:
            raise ValueError("peer block without " + ", ".join(missing))
        if not row["peer-as"].isdigit():
            raise ValueError("peer %s: AS %r is not a number" % (row["peer-address"], row["peer-as"]))
        if row["peer-state"] not in STATES:
            raise ValueError("peer %s: unknown state %r" % (row["peer-address"], row["peer-state"]))
        row["peer-address"] = row["peer-address"].split("+")[0]
        rows.append(row)
    return rows


rows = bgp_peers("junos_bgp.xml")
print(len(rows), "peers;", sum(r["peer-state"] == "Established" for r in rows), "established")
print(rows[0])

damaged = open("junos_bgp.xml").read().replace("&lt;peer-as&gt;65003&lt;/peer-as&gt;", "&lt;peer-as&gt;AS65003&lt;/peer-as&gt;")
open("damaged.xml", "w").write(damaged)
try:
    bgp_peers("damaged.xml")
except ValueError as err:
    print("ValueError:", err)

try:
    bgp_peers("pan_keygen.xml")
except ValueError as err:
    print("ValueError:", err)</pre>
<pre class="out">AUTO01$ python3 c7_peers.py
3 peers; 1 established
{'peer-address': '10.99.0.12', 'peer-as': '65002', 'peer-state': 'Established'}
<span class="hl">ValueError: peer 10.99.0.13+179: AS 'AS65003' is not a number</span>
<span class="hl">ValueError: no bgp-peer elements: BGP not configured, or the namespace is wrong</span></pre>
<p>Function zaroori fields, jahan number chahiye wahan number, aur jaani-pehchani state check karta hai. Aakhir ke do failures fayda dikhate hain: kharab file aur galat-namespace file, dono insaan ko kaam ka message dete hain. <code>.strip()</code> aur <code>split("+")[0]</code> dekho, chapter 3 ki Junos aadatein.</p>

<h3>Asli schema ka kya?</h3>
<p>Apne laptop par lxml <code>etree.XMLSchema</code> se XSD ke against validate kar sakta hai. Woh aur XSLT lab ke andar available nahi hain, isliye yeh course haath se likhe checks use karta hai. Aam taur par kaafi hain: tumhein apni script ke paanch fields chahiye, poora schema nahi.</p>

<div class="warn"><p><b>Aam galtiyan.</b> PAN-OS call ke H&#84;TP status par bharosa karna. Sirf yeh dekhna ki XML parse hota hai. Namespace URI mein Junos release number hard-code karna. Poore parser ko <code>Exception</code> mein lapet kar "failed" chhapna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Well-formed reply ka matlab successful reply nahi. Success woh baat hai jo vendor XML ke andar kehta hai: <code>status</code>, <code>rpc-error</code> ka na hona, ya wahi data jo tumne maanga.</p></div>

<div class="scn"><h4>200 kehne wala firewall</h4><p>Ek raat ki job firewall se BGP peers maangti thi aur hafte bhar "0 peers" darj karti rahi. H&#84;TP status har raat 200 tha. Reply mein <code>status="error" code="17"</code> tha kyunki us platform mein BGP hota hi nahi. Job ne <code>status</code> par raise karna shuru kiya to dashboard galat zero ki jagah "unsupported" dikhane laga.</p><p><b>Seekh:</b> khaali result aur error alag baatein hain.</p></div>

<div class="iv"><p class="q">Tumhein kaise pata chalta hai ki PAN-OS API call sach mein safal hui?</p><p>H&#84;TP 200 ka matlab sirf web server ne jawab diya. Main body parse karta hoon aur root <code>response</code> element ke <code>status</code> attribute ko check karta hoon, phir failure par <code>code</code> aur <code>msg</code> padhkar un shabdon ke saath exception raise karta hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Junos, IOS XE aur PAN-OS har ek success aur failure alag tareeke se batate hain, hamesha XML ke andar.</li>
<li>Har dialect ke liye ek checker likho: root verify karo, errors ko exceptions banao, payload lautao.</li>
<li>Content validate karo: zaroori fields, numbers, jaani-pehchani states.</li>
<li>XMLSchema aur XSLT yahan sirf laptop par hain; haath ke checks zyadatar scripts ko cover karte hain.</li>
</ul></div>
`}};export{e as default};