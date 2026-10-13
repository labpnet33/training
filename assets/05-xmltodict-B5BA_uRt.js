var e={id:`xmltodict`,h:{en:`xmltodict: a reply as a dict, and the single-item trap`,hi:`xmltodict: reply ek dict ki tarah, aur single-item ka jaal`},body:{en:`
<p><b>The idea of this chapter:</b> if you are comfortable with JSON, <code>xmltodict</code> lets you treat XML the same way: one call turns the whole reply into nested dicts and lists. It is quick to write and it hides one trap that bites every beginner exactly once.</p>

<h3>The conversion rules</h3>
<table class="cmp">
<tr><th>In the XML</th><th>In the dict</th></tr>
<tr><td>a child element</td><td>a key with the tag name</td></tr>
<tr><td>an attribute</td><td><code>"@name"</code></td></tr>
<tr><td>text next to attributes or children</td><td><code>"#text"</code></td></tr>
<tr><td>text only</td><td>a plain string</td></tr>
<tr><td>an empty element</td><td><code>None</code></td></tr>
<tr><td>the same tag repeated</td><td>a <b>list</b></td></tr>
<tr><td>the tag appearing once</td><td>a <b>dict</b> (not a list of one)</td></tr>
</table>
<pre class="code">doc = xmltodict.parse(raw)
print(json.dumps(doc, indent=2))
entries = doc["response"]["result"]["address"]["entry"]
print(type(entries).__name__, [e["@name"] for e in entries])</pre>
<pre class="out">AUTO01$ python3 c5_basic.py
{
  "response": {
    "@status": "success",
    "@code": "19",
    "result": {
      "@total-count": "2",
      "@count": "2",
      "address": {
        "entry": [
          {
<span class="hl">            "@name": "web1",</span>
            "ip-netmask": "10.20.0.10/32",
            "description": "web server"
          },
          {
<span class="hl">            "@name": "db1",</span>
            "ip-netmask": "10.20.0.20/32"
          }
        ]
      }
    }
  }
}
<span class="hl">list ['web1', 'db1']</span></pre>
<p>(<code>raw</code> is the two-entry reply from chapter 2.) Notice that attribute names carry an <code>@</code>, that every value is a <b>string</b> (<code>"19"</code>, never the number 19) and that the dict keeps document order. Text mixed with attributes uses <code>#text</code>:</p>
<pre class="code">doc = xmltodict.parse('&lt;rpc-error&gt;&lt;error-message xml:lang="en"&gt;lock failed&lt;/error-message&gt;&lt;severity&gt;error&lt;/severity&gt;&lt;/rpc-error&gt;')
print(doc)
print(doc["rpc-error"]["error-message"]["#text"])
print(doc["rpc-error"]["severity"])</pre>
<pre class="out">AUTO01$ python3 c5_text.py
{'rpc-error': {'error-message': {'@xml:lang': 'en', '#text': 'lock failed'}, 'severity': 'error'}}
lock failed</pre>
<p>A NETCONF error message with an <code>xml:lang</code> attribute becomes a dict with <code>#text</code>; the same tag without the attribute is a plain string. Code that reads <code>["error-message"]</code> as a string will break on the first kind. That is the same family of surprise as the next one.</p>

<h3>The single-item trap</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="One entry gives a dict, two entries give a list">
<rect x="15" y="15" width="270" height="62" rx="10" fill="#e2e8f0"/><text x="150" y="40" text-anchor="middle" class="svg-ink" font-size="13">one entry in the XML</text><text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="11">address / entry</text>
<rect x="355" y="15" width="270" height="62" rx="10" fill="#fed7aa"/><text x="490" y="40" text-anchor="middle" class="svg-ink" font-size="13">entry: { "@name": "web1", ... }</text><text x="490" y="60" text-anchor="middle" class="svg-muted" font-size="11">a dict</text>
<rect x="15" y="95" width="270" height="62" rx="10" fill="#e2e8f0"/><text x="150" y="120" text-anchor="middle" class="svg-ink" font-size="13">two entries in the XML</text><text x="150" y="140" text-anchor="middle" class="svg-muted" font-size="11">address / entry, entry</text>
<rect x="355" y="95" width="270" height="62" rx="10" fill="#bbf7d0"/><text x="490" y="120" text-anchor="middle" class="svg-ink" font-size="13">entry: [ {...}, {...} ]</text><text x="490" y="140" text-anchor="middle" class="svg-muted" font-size="11">a list</text>
<line x1="285" y1="46" x2="355" y2="46" stroke="#64748b" stroke-width="2"/><line x1="285" y1="126" x2="355" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Same tag, same code path, different Python type.</p></div>
<pre class="code">import xmltodict

one = xmltodict.parse(open("pan_addr_one.xml").read())
two = xmltodict.parse(open("pan_addr_two.xml").read())
e1 = one["response"]["result"]["address"]["entry"]
e2 = two["response"]["result"]["address"]["entry"]
print(type(e1).__name__, type(e2).__name__)
print(e1)

# one entry: iterating a dict walks its keys, not the entries
try:
    print([e["@name"] for e in e1])
except TypeError as err:
    print("TypeError:", err)

fixed = xmltodict.parse(open("pan_addr_one.xml").read(), force_list=("entry",))
e1 = fixed["response"]["result"]["address"]["entry"]
print(type(e1).__name__, [e["@name"] for e in e1])</pre>
<pre class="out">AUTO01$ python3 c5_single.py
dict list
{'@name': 'web1', 'ip-netmask': '10.20.0.10/32', 'description': 'web server'}
<span class="hl">TypeError: string indices must be integers or slices, not str</span>
<span class="hl">list ['web1']</span></pre>
<p>A loop over a dict walks its keys (strings), and <code>"@name"["@name"]</code> is the <code>TypeError</code>. The exact wording of that message changes between Python versions. Your script works for months with two address objects and crashes the day someone deletes one. The cure is <code>force_list</code>: name the tags that must always be lists.</p>
<ul>
<li><code>force_list=("entry",)</code> a tuple or list of tag names;</li>
<li><code>force_list=True</code> everything becomes a list (rarely what you want);</li>
<li>a function <code>(path, key, value) -> bool</code> for fine control.</li>
</ul>

<h3>Junos and NETCONF replies</h3>
<pre class="code">import xmltodict

doc = xmltodict.parse(open("junos_bgp.xml").read(), force_list=("bgp-peer",))
info = doc["rpc-reply"]["bgp-information"]
print(list(info))
for p in info["bgp-peer"]:
    print(p["peer-address"], p["peer-as"], p["peer-state"], p["@junos:style"])

one = xmltodict.parse(open("junos_bgp_one.xml").read())["rpc-reply"]["bgp-information"]["bgp-peer"]
print(type(one).__name__, one["peer-state"])</pre>
<pre class="out">AUTO01$ python3 c5_junos.py
<span class="hl">['@xmlns', 'bgp-peer']</span>
10.99.0.12+179 65002 Established detail
10.99.0.13+179 65003 Idle detail
10.99.0.99+179 65099 Active detail
<span class="hl">dict Established</span></pre>
<p>The namespace declaration appears as an <code>@xmlns</code> key and the namespaced attribute keeps its prefix as <code>@junos:style</code>. The second query, for one neighbour, gives a <code>dict</code> without <code>force_list</code>, as the diagram predicted.</p>
<p>For YANG replies, <code>process_namespaces=True</code> with a <code>namespaces</code> mapping removes the namespaces from the keys (map each URI to <code>None</code>):</p>
<pre class="code">
NSMAP = {
    "urn:ietf:params:xml:ns:netconf:base:1.0": None,
    "urn:ietf:params:xml:ns:yang:ietf-interfaces": None,
    "urn:ietf:params:xml:ns:yang:ietf-ip": None,
}
doc = xmltodict.parse(raw, process_namespaces=True, namespaces=NSMAP, force_list=("interface",))
interfaces = doc["rpc-reply"]["data"]["interfaces"]["interface"]
for itf in interfaces:
    ipv4 = itf["ipv4"]</pre>
<pre class="out">['@message-id', '@xmlns', 'data']
GigabitEthernet0/0 true 10.99.0.1
GigabitEthernet0/1 false -
GigabitEthernet0/2 false -
GigabitEthernet0/3 false -</pre>
<p>An empty <code>ipv4</code> element is <code>None</code>, which is why the loop tests it before looking inside. (The lab's xmltodict follows version 0.13; where a namespace declaration lands in the dict can differ between versions, so do not depend on the <code>@xmlns</code> keys.)</p>

<h3>unparse: dict back to XML</h3>
<pre class="code">import xmltodict

rpc = {"rpc": {"@message-id": "101", "get-config": {"source": {"running": None}, "filter": {"@type": "subtree", "interfaces": {"@xmlns": "urn:ietf:params:xml:ns:yang:ietf-interfaces"}}}}}
print(xmltodict.unparse(rpc, pretty=True))
print(xmltodict.unparse({"description": 'to &lt;J1&gt; &amp; "SW1"'}, full_document=False))
print(xmltodict.unparse({"ntp": {"server": ["10.0.0.1", "10.0.0.2"]}}, pretty=True, full_document=False))</pre>
<pre class="out">AUTO01$ python3 c5_unparse.py
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;rpc message-id="101"&gt;
	&lt;get-config&gt;
		&lt;source&gt;
			&lt;running&gt;&lt;/running&gt;
		&lt;/source&gt;
		&lt;filter type="subtree"&gt;
			&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;&lt;/interfaces&gt;
		&lt;/filter&gt;
	&lt;/get-config&gt;
&lt;/rpc&gt;
&lt;description&gt;to &amp;lt;J1&amp;gt; &amp;amp; "SW1"&lt;/description&gt;
&lt;ntp&gt;
	&lt;server&gt;10.0.0.1&lt;/server&gt;
	&lt;server&gt;10.0.0.2&lt;/server&gt;
&lt;/ntp&gt;</pre>
<p><code>@</code> keys become attributes, a <code>None</code> becomes an empty element, a list repeats the tag, and text is escaped for you (<code>&amp;lt;</code>, <code>&amp;amp;</code>). Good for small requests such as an RPC or a PAN-OS <code>element</code>; for namespaced requests with several prefixes ElementTree in chapter 6 is easier to get exactly right.</p>

<h3>What xmltodict loses</h3>
<ul>
<li>the order between different sibling tags that are interleaved, and mixed text and tail;</li>
<li>comments and the difference between a missing element and an empty one;</li>
<li>types: every value is a string, so cast with <code>int()</code> yourself.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Not passing <code>force_list</code> for a repeating tag. Comparing <code>"65002" == 65002</code>. Reading <code>["error-message"]</code> as a string when the tag has an attribute. Calling <code>xmltodict.parse</code> on bytes or str with a banner glued to the front: it raises <code>ExpatError</code>, the same family as <code>ParseError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A tag that appears once gives a dict, the same tag repeated gives a list. <code>force_list</code> is the standard answer.</p></div>

<div class="scn"><h4>The report that broke on a quiet day</h4><p>A daily PAN-OS address report ran for weeks, then died with a <code>TypeError</code> the morning after a cleanup removed all but one object from a group. The code treated <code>entry</code> as a list. Adding <code>force_list=("entry",)</code> made the one-object case behave like the fifty-object case, and a test with a one-entry sample was added.</p><p><b>Lesson:</b> always test with the empty, one-item and many-item shapes.</p></div>

<div class="iv"><p class="q">What is the main gotcha of xmltodict?</p><p>A repeated tag becomes a list but a single occurrence becomes a dict (or a string), so code that loops breaks when there is exactly one item. I pass <code>force_list</code> for the tags that repeat, and I remember attributes are <code>@name</code> and mixed text is <code>#text</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attributes are <code>@name</code>, mixed text is <code>#text</code>, empty elements are <code>None</code>, all values are strings.</li>
<li>One occurrence gives a dict, many give a list: use <code>force_list</code>.</li>
<li><code>process_namespaces</code> with a mapping to <code>None</code> removes namespaces from keys.</li>
<li><code>unparse</code> builds small requests and escapes text for you.</li>
<li>It loses comments, interleaved order and types.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> agar tum JSON mein comfortable ho, to <code>xmltodict</code> XML ko usi tarah treat karne deta hai: ek call poore reply ko nested dicts aur lists mein badal deti hai. Likhna tez hai aur ek jaal chhupa hai jo har beginner ko theek ek baar kaatta hai.</p>

<h3>Conversion ke niyam</h3>
<table class="cmp">
<tr><th>XML mein</th><th>Dict mein</th></tr>
<tr><td>child element</td><td>tag name wali key</td></tr>
<tr><td>attribute</td><td><code>"@name"</code></td></tr>
<tr><td>attributes ya children ke saath wala text</td><td><code>"#text"</code></td></tr>
<tr><td>sirf text</td><td>plain string</td></tr>
<tr><td>khaali element</td><td><code>None</code></td></tr>
<tr><td>wahi tag kai baar</td><td>ek <b>list</b></td></tr>
<tr><td>tag sirf ek baar</td><td>ek <b>dict</b> (ek item ki list nahi)</td></tr>
</table>
<pre class="code">doc = xmltodict.parse(raw)
print(json.dumps(doc, indent=2))
entries = doc["response"]["result"]["address"]["entry"]
print(type(entries).__name__, [e["@name"] for e in entries])</pre>
<pre class="out">AUTO01$ python3 c5_basic.py
{
  "response": {
    "@status": "success",
    "@code": "19",
    "result": {
      "@total-count": "2",
      "@count": "2",
      "address": {
        "entry": [
          {
<span class="hl">            "@name": "web1",</span>
            "ip-netmask": "10.20.0.10/32",
            "description": "web server"
          },
          {
<span class="hl">            "@name": "db1",</span>
            "ip-netmask": "10.20.0.20/32"
          }
        ]
      }
    }
  }
}
<span class="hl">list ['web1', 'db1']</span></pre>
<p>(<code>raw</code> chapter 2 ka do-entry wala reply hai.) Dhyan do ki attribute names ke saath <code>@</code> aata hai, har value ek <b>string</b> hai (<code>"19"</code>, number 19 nahi) aur dict document ka order rakhta hai. Attributes ke saath mila text <code>#text</code> mein jaata hai:</p>
<pre class="code">doc = xmltodict.parse('&lt;rpc-error&gt;&lt;error-message xml:lang="en"&gt;lock failed&lt;/error-message&gt;&lt;severity&gt;error&lt;/severity&gt;&lt;/rpc-error&gt;')
print(doc)
print(doc["rpc-error"]["error-message"]["#text"])
print(doc["rpc-error"]["severity"])</pre>
<pre class="out">AUTO01$ python3 c5_text.py
{'rpc-error': {'error-message': {'@xml:lang': 'en', '#text': 'lock failed'}, 'severity': 'error'}}
lock failed</pre>
<p>NETCONF error message jisme <code>xml:lang</code> attribute ho, <code>#text</code> wali dict ban jaata hai; wahi tag bina attribute ke plain string hota hai. Jo code <code>["error-message"]</code> ko string maanta hai woh pehli kism par toot jaayega. Yeh agle surprise ki hi family hai.</p>

<h3>Single-item ka jaal</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Ek entry dict deti hai, do entries list deti hain">
<rect x="15" y="15" width="270" height="62" rx="10" fill="#e2e8f0"/><text x="150" y="40" text-anchor="middle" class="svg-ink" font-size="13">XML mein ek entry</text><text x="150" y="60" text-anchor="middle" class="svg-muted" font-size="11">address / entry</text>
<rect x="355" y="15" width="270" height="62" rx="10" fill="#fed7aa"/><text x="490" y="40" text-anchor="middle" class="svg-ink" font-size="13">entry: { "@name": "web1", ... }</text><text x="490" y="60" text-anchor="middle" class="svg-muted" font-size="11">dict</text>
<rect x="15" y="95" width="270" height="62" rx="10" fill="#e2e8f0"/><text x="150" y="120" text-anchor="middle" class="svg-ink" font-size="13">XML mein do entries</text><text x="150" y="140" text-anchor="middle" class="svg-muted" font-size="11">address / entry, entry</text>
<rect x="355" y="95" width="270" height="62" rx="10" fill="#bbf7d0"/><text x="490" y="120" text-anchor="middle" class="svg-ink" font-size="13">entry: [ {...}, {...} ]</text><text x="490" y="140" text-anchor="middle" class="svg-muted" font-size="11">list</text>
<line x1="285" y1="46" x2="355" y2="46" stroke="#64748b" stroke-width="2"/><line x1="285" y1="126" x2="355" y2="126" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Wahi tag, wahi code path, alag Python type.</p></div>
<pre class="code">import xmltodict

one = xmltodict.parse(open("pan_addr_one.xml").read())
two = xmltodict.parse(open("pan_addr_two.xml").read())
e1 = one["response"]["result"]["address"]["entry"]
e2 = two["response"]["result"]["address"]["entry"]
print(type(e1).__name__, type(e2).__name__)
print(e1)

# one entry: iterating a dict walks its keys, not the entries
try:
    print([e["@name"] for e in e1])
except TypeError as err:
    print("TypeError:", err)

fixed = xmltodict.parse(open("pan_addr_one.xml").read(), force_list=("entry",))
e1 = fixed["response"]["result"]["address"]["entry"]
print(type(e1).__name__, [e["@name"] for e in e1])</pre>
<pre class="out">AUTO01$ python3 c5_single.py
dict list
{'@name': 'web1', 'ip-netmask': '10.20.0.10/32', 'description': 'web server'}
<span class="hl">TypeError: string indices must be integers or slices, not str</span>
<span class="hl">list ['web1']</span></pre>
<p>Dict par loop uski keys (strings) par chalta hai, aur <code>"@name"["@name"]</code> hi <code>TypeError</code> hai. Us message ki exact wording Python versions ke saath badalti hai. Tumhari script do address objects ke saath mahino chalti hai aur jis din koi ek delete kare, crash ho jaati hai. Ilaaj <code>force_list</code> hai: un tags ke naam do jo hamesha list hone chahiye.</p>
<ul>
<li><code>force_list=("entry",)</code> tag names ka tuple ya list;</li>
<li><code>force_list=True</code> sab kuch list ban jaata hai (kam hi kaam ka);</li>
<li>bareeki ke liye ek function <code>(path, key, value) -&gt; bool</code>.</li>
</ul>

<h3>Junos aur NETCONF replies</h3>
<pre class="code">import xmltodict

doc = xmltodict.parse(open("junos_bgp.xml").read(), force_list=("bgp-peer",))
info = doc["rpc-reply"]["bgp-information"]
print(list(info))
for p in info["bgp-peer"]:
    print(p["peer-address"], p["peer-as"], p["peer-state"], p["@junos:style"])

one = xmltodict.parse(open("junos_bgp_one.xml").read())["rpc-reply"]["bgp-information"]["bgp-peer"]
print(type(one).__name__, one["peer-state"])</pre>
<pre class="out">AUTO01$ python3 c5_junos.py
<span class="hl">['@xmlns', 'bgp-peer']</span>
10.99.0.12+179 65002 Established detail
10.99.0.13+179 65003 Idle detail
10.99.0.99+179 65099 Active detail
<span class="hl">dict Established</span></pre>
<p>Namespace declaration <code>@xmlns</code> key ki tarah dikhta hai aur namespaced attribute apna prefix <code>@junos:style</code> ki tarah rakhta hai. Doosri query, ek neighbour ki, <code>force_list</code> ke bina <code>dict</code> deti hai, jaisa diagram ne bataya tha.</p>
<p>YANG replies ke liye <code>process_namespaces=True</code> aur <code>namespaces</code> mapping keys se namespaces hata deti hai (har URI ko <code>None</code> se map karo):</p>
<pre class="code">
NSMAP = {
    "urn:ietf:params:xml:ns:netconf:base:1.0": None,
    "urn:ietf:params:xml:ns:yang:ietf-interfaces": None,
    "urn:ietf:params:xml:ns:yang:ietf-ip": None,
}
doc = xmltodict.parse(raw, process_namespaces=True, namespaces=NSMAP, force_list=("interface",))
interfaces = doc["rpc-reply"]["data"]["interfaces"]["interface"]
for itf in interfaces:
    ipv4 = itf["ipv4"]</pre>
<pre class="out">['@message-id', '@xmlns', 'data']
GigabitEthernet0/0 true 10.99.0.1
GigabitEthernet0/1 false -
GigabitEthernet0/2 false -
GigabitEthernet0/3 false -</pre>
<p>Khaali <code>ipv4</code> element <code>None</code> hai, isiliye loop andar dekhne se pehle use test karta hai. (Lab ka xmltodict version 0.13 follow karta hai; namespace declaration dict mein kahan aati hai yeh versions mein alag ho sakta hai, isliye <code>@xmlns</code> keys par nirbhar mat raho.)</p>

<h3>unparse: dict se wapas XML</h3>
<pre class="code">import xmltodict

rpc = {"rpc": {"@message-id": "101", "get-config": {"source": {"running": None}, "filter": {"@type": "subtree", "interfaces": {"@xmlns": "urn:ietf:params:xml:ns:yang:ietf-interfaces"}}}}}
print(xmltodict.unparse(rpc, pretty=True))
print(xmltodict.unparse({"description": 'to &lt;J1&gt; &amp; "SW1"'}, full_document=False))
print(xmltodict.unparse({"ntp": {"server": ["10.0.0.1", "10.0.0.2"]}}, pretty=True, full_document=False))</pre>
<pre class="out">AUTO01$ python3 c5_unparse.py
&lt;?xml version="1.0" encoding="utf-8"?&gt;
&lt;rpc message-id="101"&gt;
	&lt;get-config&gt;
		&lt;source&gt;
			&lt;running&gt;&lt;/running&gt;
		&lt;/source&gt;
		&lt;filter type="subtree"&gt;
			&lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;&lt;/interfaces&gt;
		&lt;/filter&gt;
	&lt;/get-config&gt;
&lt;/rpc&gt;
&lt;description&gt;to &amp;lt;J1&amp;gt; &amp;amp; "SW1"&lt;/description&gt;
&lt;ntp&gt;
	&lt;server&gt;10.0.0.1&lt;/server&gt;
	&lt;server&gt;10.0.0.2&lt;/server&gt;
&lt;/ntp&gt;</pre>
<p><code>@</code> keys attributes ban jaati hain, <code>None</code> khaali element, list tag ko repeat karti hai, aur text tumhare liye escape ho jaata hai (<code>&amp;lt;</code>, <code>&amp;amp;</code>). Chhoti requests ke liye achha hai jaise RPC ya PAN-OS <code>element</code>; kai prefixes wali namespaced requests ke liye chapter 6 ka ElementTree sahi karna zyada aasaan hai.</p>

<h3>xmltodict kya kho deta hai</h3>
<ul>
<li>alag sibling tags ke beech ka order jab woh interleaved hon, aur mixed text aur tail;</li>
<li>comments aur gayab element ya khaali element ka fark;</li>
<li>types: har value string hai, isliye <code>int()</code> khud karo.</li>
</ul>

<div class="warn"><p><b>Aam galtiyan.</b> Repeating tag ke liye <code>force_list</code> na dena. <code>"65002" == 65002</code> compare karna. Tag mein attribute ho tab <code>["error-message"]</code> ko string ki tarah padhna. Aage banner chipka ho aur <code>xmltodict.parse</code> bytes ya str par call karna: <code>ExpatError</code> aata hai, <code>ParseError</code> ki hi family ka.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek baar aane wala tag dict deta hai, wahi tag repeat ho to list. <code>force_list</code> standard jawab hai.</p></div>

<div class="scn"><h4>Shaant din par toot gayi report</h4><p>Roz ki PAN-OS address report hafte chali, phir ek cleanup ke baad subah <code>TypeError</code> se mar gayi jisme ek group mein ek object ke alawa sab hata diye gaye. Code <code>entry</code> ko list maanta tha. <code>force_list=("entry",)</code> se ek-object ka case pachaas-object ke case jaisa chalne laga, aur ek-entry sample ka test jod diya gaya.</p><p><b>Seekh:</b> hamesha khaali, ek-item aur kai-item shapes se test karo.</p></div>

<div class="iv"><p class="q">xmltodict ka sabse bada gotcha kya hai?</p><p>Repeat hone wala tag list banta hai par ek hi baar aaye to dict (ya string), isliye loop wala code tab toot jaata hai jab sirf ek item ho. Main repeat hone wale tags ke liye <code>force_list</code> deta hoon, aur yaad rakhta hoon ki attributes <code>@name</code> aur mixed text <code>#text</code> hota hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Attributes <code>@name</code>, mixed text <code>#text</code>, khaali elements <code>None</code>, saari values strings.</li>
<li>Ek occurrence dict deta hai, kai list: <code>force_list</code> use karo.</li>
<li><code>process_namespaces</code> ek <code>None</code> mapping ke saath keys se namespaces hata deta hai.</li>
<li><code>unparse</code> chhoti requests banata hai aur text escape karta hai.</li>
<li>Yeh comments, interleaved order aur types kho deta hai.</li>
</ul></div>
`}};export{e as default};