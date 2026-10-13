var e={id:`build-requests`,h:{en:`Building request XML safely`,hi:`Request XML surakshit tareeke se banana`},body:{en:`
<p><b>The idea of this chapter:</b> sooner or later you send XML, not only read it: a NETCONF RPC, a PAN-OS <code>element</code>, a Junos RPC. The tempting way is an f-string. The safe way is to build a tree and let the library write the text. This chapter shows why, with a demonstration.</p>

<h3>Build a tree: Element and SubElement</h3>
<pre class="code">import xml.etree.ElementTree as ET

rpc = ET.Element("rpc", {"message-id": "101"})
get = ET.SubElement(rpc, "get-config")
src = ET.SubElement(get, "source")
ET.SubElement(src, "running")
flt = ET.SubElement(get, "filter", type="subtree")
ET.SubElement(flt, "configuration").append(ET.Element("system"))

print(ET.tostring(rpc, encoding="unicode"))
ET.indent(rpc)
print(ET.tostring(rpc, encoding="unicode"))
print(len(rpc), [c.tag for c in rpc], rpc[0][1].attrib)</pre>
<pre class="out">AUTO01$ python3 c6_build.py
<span class="hl">&lt;rpc message-id="101"&gt;&lt;get-config&gt;&lt;source&gt;&lt;running /&gt;&lt;/source&gt;&lt;filter type="subtree"&gt;&lt;configuration&gt;&lt;system /&gt;&lt;/configuration&gt;&lt;/filter&gt;&lt;/get-config&gt;&lt;/rpc&gt;</span>
&lt;rpc message-id="101"&gt;
  &lt;get-config&gt;
    &lt;source&gt;
      &lt;running /&gt;
    &lt;/source&gt;
<span class="hl">    &lt;filter type="subtree"&gt;</span>
      &lt;configuration&gt;
        &lt;system /&gt;
      &lt;/configuration&gt;
    &lt;/filter&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;
<span class="hl">1 ['get-config'] {'type': 'subtree'}</span></pre>
<p><code>SubElement(parent, tag)</code> makes a node and attaches it in one step; keyword arguments such as <code>type="subtree"</code> become attributes. <code>ET.indent</code> (Python 3.9+) only adds whitespace, so call it last.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Building XML from a tree versus gluing strings">
<rect x="15" y="15" width="170" height="56" rx="10" fill="#e2e8f0"/>
<text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">value from a CSV</text>
<rect x="235" y="15" width="170" height="56" rx="10" fill="#bbf7d0"/>
<text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">Element / SubElement</text>
<text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">.text = value</text>
<rect x="455" y="15" width="170" height="56" rx="10" fill="#bbf7d0"/>
<text x="540" y="39" text-anchor="middle" class="svg-ink" font-size="13">tostring()</text>
<text x="540" y="55" text-anchor="middle" class="svg-muted" font-size="11">escaped text</text>
<rect x="15" y="115" width="170" height="56" rx="10" fill="#e2e8f0"/>
<text x="100" y="147" text-anchor="middle" class="svg-ink" font-size="13">same value</text>
<rect x="235" y="115" width="170" height="56" rx="10" fill="#fecaca"/>
<text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">"&lt;d&gt;" + value + "&lt;/d&gt;"</text>
<rect x="455" y="115" width="170" height="56" rx="10" fill="#fecaca"/>
<text x="540" y="147" text-anchor="middle" class="svg-ink" font-size="13">extra element injected</text>
<line x1="185" y1="43" x2="235" y2="43" stroke="#64748b" stroke-width="2"/>
<polygon points="235,43 227,46 227,39" fill="#64748b"/>
<line x1="405" y1="43" x2="455" y2="43" stroke="#64748b" stroke-width="2"/>
<polygon points="455,43 447,46 447,39" fill="#64748b"/>
<line x1="185" y1="143" x2="235" y2="143" stroke="#64748b" stroke-width="2"/>
<polygon points="235,143 227,146 227,139" fill="#64748b"/>
<line x1="405" y1="143" x2="455" y2="143" stroke="#64748b" stroke-width="2"/>
<polygon points="455,143 447,146 447,139" fill="#64748b"/>
</svg><p class="cap">Top: the library keeps the value as text. Bottom: a value with tags changes the structure.</p></div>
<h3>Why not an f-string?</h3>
<pre class="code">import xml.etree.ElementTree as ET

description = 'to &lt;J1&gt; &amp; "SW1"'

# WRONG: gluing strings together
bad = "&lt;description&gt;" + description + "&lt;/description&gt;"
try:
    ET.fromstring(bad)
except ET.ParseError as err:
    print("string concatenation -&gt;", err)

# an attacker-shaped value does not even fail: it rewrites the request
evil = "x&lt;/description&gt;&lt;enabled&gt;false&lt;/enabled&gt;&lt;description&gt;y"
glued = "&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;description&gt;" + evil + "&lt;/description&gt;&lt;/interface&gt;"
print([c.tag for c in ET.fromstring(glued)])

# RIGHT: let ElementTree escape
interface = ET.Element("interface")
ET.SubElement(interface, "name").text = "Gi0/1"
ET.SubElement(interface, "description").text = evil
print(ET.tostring(interface, encoding="unicode"))
print([c.tag for c in ET.fromstring(ET.tostring(interface, encoding="unicode"))])</pre>
<pre class="out">AUTO01$ python3 c6_unsafe.py
<span class="hl">string concatenation -&gt; not well-formed (invalid token): line 1, column 22</span>
<span class="hl">['name', 'description', 'enabled', 'description']</span>
<span class="hl">&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;description&gt;x&amp;lt;/description&amp;gt;&amp;lt;enabled&amp;gt;false&amp;lt;/enabled&amp;gt;&amp;lt;description&amp;gt;y&lt;/description&gt;&lt;/interface&gt;</span>
['name', 'description']</pre>
<p>Three outcomes from the same idea:</p>
<ol>
<li>A description with <code>&lt;</code> in it makes the glued text <b>not well-formed</b>; the device rejects the whole request. Annoying but harmless.</li>
<li>A value shaped like <code>x&lt;/description&gt;&lt;enabled&gt;false...</code> is <b>well-formed</b>. The glued string now has an extra <code>enabled</code> element the author never wrote. That is how a text field becomes a way to change config.</li>
<li>With ElementTree the same value is stored as <b>text</b>: the angle brackets become <code>&amp;lt;</code> and <code>&amp;gt;</code>, and parsing the output gives back just <code>name</code> and <code>description</code>.</li>
</ol>
<h3>Namespaced requests</h3>
<p>A NETCONF <code>edit-config</code> mixes three vocabularies: the base protocol, the YANG module and the <code>operation</code> attribute. Write the names as <code>{uri}local</code>, exactly as you read them in chapter 3, and register the prefix you want to see:</p>
<pre class="code">import xml.etree.ElementTree as ET

NC = "urn:ietf:params:xml:ns:netconf:base:1.0"
IF = "urn:ietf:params:xml:ns:yang:ietf-interfaces"
ET.register_namespace("nc", NC)

rpc = ET.Element("{%s}rpc" % NC, {"message-id": "7"})
edit = ET.SubElement(rpc, "{%s}edit-config" % NC)
ET.SubElement(ET.SubElement(edit, "{%s}target" % NC), "{%s}running" % NC)
config = ET.SubElement(edit, "{%s}config" % NC)
interfaces = ET.SubElement(config, "{%s}interfaces" % IF)
itf = ET.SubElement(interfaces, "{%s}interface" % IF, {"{%s}operation" % NC: "merge"})
ET.SubElement(itf, "{%s}name" % IF).text = "GigabitEthernet0/1"
ET.SubElement(itf, "{%s}description" % IF).text = 'uplink to &lt;J1&gt; &amp; "SW1"'
ET.indent(rpc)
print(ET.tostring(rpc, encoding="unicode"))</pre>
<pre class="out">AUTO01$ python3 c6_ns.py
<span class="hl">&lt;nc:rpc xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" xmlns:ns1="urn:ietf:params:xml:ns:yang:ietf-interfaces" message-id="7"&gt;</span>
  &lt;nc:edit-config&gt;
    &lt;nc:target&gt;
      &lt;nc:running /&gt;
    &lt;/nc:target&gt;
    &lt;nc:config&gt;
<span class="hl">      &lt;ns1:interfaces&gt;</span>
<span class="hl">        &lt;ns1:interface nc:operation="merge"&gt;</span>
<span class="hl">          &lt;ns1:name&gt;GigabitEthernet0/1&lt;/ns1:name&gt;</span>
<span class="hl">          &lt;ns1:description&gt;uplink to &amp;lt;J1&amp;gt; &amp;amp; "SW1"&lt;/ns1:description&gt;</span>
<span class="hl">        &lt;/ns1:interface&gt;</span>
<span class="hl">      &lt;/ns1:interfaces&gt;</span>
    &lt;/nc:config&gt;
  &lt;/nc:edit-config&gt;
&lt;/nc:rpc&gt;</pre>
<ul>
<li><code>register_namespace("nc", NC)</code> gave the base protocol the prefix <code>nc</code>; the unregistered YANG module got an invented <code>ns1</code>. A NETCONF server reads the URI, not the prefix.</li>
<li>The attribute <code>{NC}operation</code> printed as <code>nc:operation="merge"</code>. A namespaced attribute needs a prefix, so it is never written bare.</li>
</ul>
<p>The lab prints this XML but does not send it to a NETCONF server; that is the next module.</p>

<h3>Saving to a file</h3>
<pre class="code">import xml.etree.ElementTree as ET

rpc = ET.Element("rpc")
ET.SubElement(rpc, "get-software-information")
tree = ET.ElementTree(rpc)
ET.indent(tree)
tree.write("req.xml", encoding="utf-8", xml_declaration=True)
print(open("req.xml").read())

back = ET.parse("req.xml").getroot()
print(back.tag, [c.tag for c in back])</pre>
<pre class="out">AUTO01$ python3 c6_write.py
<span class="hl">&lt;?xml version='1.0' encoding='utf-8'?&gt;</span>
&lt;rpc&gt;
  &lt;get-software-information /&gt;
&lt;/rpc&gt;
rpc ['get-software-information']</pre>
<p><code>write(path, encoding="utf-8", xml_declaration=True)</code> adds the declaration line. Reading the file back with <code>ET.parse</code> proves it is well-formed. In the lab <code>tostring(encoding="unicode")</code> gives <code>str</code>; on a laptop, plain <code>tostring</code> gives <code>bytes</code>.</p>

<h3>PAN-OS and lxml: the same rule</h3>
<p>lxml builds the same way, with <code>pretty_print=True</code> instead of <code>ET.indent</code>, and it returns <code>bytes</code>, hence <code>.decode()</code>.</p>
<p>PAN-OS wants the payload in a query parameter named <code>element</code>. The XML is a string inside a URL, so two layers of escaping apply: ElementTree escapes the XML, and <code>requests</code> escapes the URL when you pass <code>params=</code>. Do not escape by hand.</p>
<pre class="code"># build the element= payload with ElementTree, never by hand
ip = ET.Element("ip-netmask")
ip.text = "10.20.0.30/32"
desc = ET.Element("description")
desc.text = "test &lt;lab&gt; &amp; more"
element = ET.tostring(ip, encoding="unicode") + ET.tostring(desc, encoding="unicode")
print(element)

xpath = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']/address/entry[@name='demo1']"
r = requests.get(API, params={"type": "config", "action": "set", "xpath": xpath, "element": element},
                 headers={"X-PAN-KEY": key}, verify=False, timeout=10)
print(r.status_code, r.text)
root = ET.fromstring(r.text)
print(root.get("status"), root.get("code"), root.findtext("msg"))</pre>
<pre class="out">AUTO01$ python3 c6_pan.py
<span class="hl">&lt;ip-netmask&gt;10.20.0.30/32&lt;/ip-netmask&gt;&lt;description&gt;test &amp;lt;lab&amp;gt; &amp;amp; more&lt;/description&gt;</span>
<span class="hl">200 &lt;response status="success" code="20"&gt;&lt;msg&gt;command succeeded&lt;/msg&gt;&lt;/response&gt;</span>
<span class="hl">success 20 command succeeded</span></pre>
<p>The firewall accepted the object (<code>code="20"</code>) and the description kept its escaped brackets. Use a CA bundle instead of <code>verify=False</code> on real firewalls.</p>

<div class="warn"><p><b>Common mistakes.</b> Building the request with an f-string. Registering a namespace after <code>tostring</code>. Appending elements after <code>ET.indent</code> without indenting again.</p></div>
<div class="exam"><p><b>Exam trap.</b> Escaping is the library's job. If an answer pastes values into a string template, it is the wrong answer, however short it looks.</p></div>

<div class="scn"><h4>The description that disabled an interface</h4><p>A script pushed interface descriptions from a spreadsheet using an f-string template. One cell contained a pasted fragment with closing tags, and the device accepted a request with an extra <code>enabled</code> element. The fix was three lines: build the tree with SubElement, set <code>.text</code>, and serialise with <code>tostring</code>. A unit test now feeds <code>&lt;</code>, <code>&amp;</code> and a closing tag as descriptions and checks the child list.</p><p><b>Lesson:</b> test your builders with hostile text.</p></div>

<div class="iv"><p class="q">Why build XML with a library instead of string formatting?</p><p>The library escapes special characters in text and attributes and guarantees a well-formed tree, so a value cannot change the structure of the request. With string formatting a value containing tags can inject elements, which is the XML version of SQL injection. For namespaces I write {uri}name and register the prefixes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build with <code>Element</code>/<code>SubElement</code>; set <code>.text</code> and attributes; never concatenate.</li>
<li><code>ET.indent</code> last; <code>tostring(encoding="unicode")</code> for str.</li>
<li>Namespaced names are <code>{uri}local</code>; <code>register_namespace</code> before serialising.</li>
<li>Read the file back to prove it is well-formed.</li>
<li>Use <code>params=</code> in requests and let it escape the URL.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> kabhi na kabhi tum XML bhejoge, sirf padhoge nahi: NETCONF RPC, PAN-OS <code>element</code>, Junos RPC. Lalach f-string ka hota hai. Surakshit tareeka hai tree banao aur text library se likhwao. Yeh chapter demo ke saath batata hai kyun.</p>

<h3>Tree banao: Element aur SubElement</h3>
<pre class="code">import xml.etree.ElementTree as ET

rpc = ET.Element("rpc", {"message-id": "101"})
get = ET.SubElement(rpc, "get-config")
src = ET.SubElement(get, "source")
ET.SubElement(src, "running")
flt = ET.SubElement(get, "filter", type="subtree")
ET.SubElement(flt, "configuration").append(ET.Element("system"))

print(ET.tostring(rpc, encoding="unicode"))
ET.indent(rpc)
print(ET.tostring(rpc, encoding="unicode"))
print(len(rpc), [c.tag for c in rpc], rpc[0][1].attrib)</pre>
<pre class="out">AUTO01$ python3 c6_build.py
<span class="hl">&lt;rpc message-id="101"&gt;&lt;get-config&gt;&lt;source&gt;&lt;running /&gt;&lt;/source&gt;&lt;filter type="subtree"&gt;&lt;configuration&gt;&lt;system /&gt;&lt;/configuration&gt;&lt;/filter&gt;&lt;/get-config&gt;&lt;/rpc&gt;</span>
&lt;rpc message-id="101"&gt;
  &lt;get-config&gt;
    &lt;source&gt;
      &lt;running /&gt;
    &lt;/source&gt;
<span class="hl">    &lt;filter type="subtree"&gt;</span>
      &lt;configuration&gt;
        &lt;system /&gt;
      &lt;/configuration&gt;
    &lt;/filter&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;
<span class="hl">1 ['get-config'] {'type': 'subtree'}</span></pre>
<p><code>SubElement(parent, tag)</code> node banakar ek hi step mein jod deta hai; <code>type="subtree"</code> jaise keyword arguments attributes ban jaate hain. <code>ET.indent</code> (Python 3.9+) sirf whitespace jodta hai, isliye use aakhir mein bulao.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Tree se XML banana versus strings chipkana">
<rect x="15" y="15" width="170" height="56" rx="10" fill="#e2e8f0"/>
<text x="100" y="47" text-anchor="middle" class="svg-ink" font-size="13">CSV ki value</text>
<rect x="235" y="15" width="170" height="56" rx="10" fill="#bbf7d0"/>
<text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">Element / SubElement</text>
<text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">.text = value</text>
<rect x="455" y="15" width="170" height="56" rx="10" fill="#bbf7d0"/>
<text x="540" y="39" text-anchor="middle" class="svg-ink" font-size="13">tostring()</text>
<text x="540" y="55" text-anchor="middle" class="svg-muted" font-size="11">escaped text</text>
<rect x="15" y="115" width="170" height="56" rx="10" fill="#e2e8f0"/>
<text x="100" y="147" text-anchor="middle" class="svg-ink" font-size="13">wahi value</text>
<rect x="235" y="115" width="170" height="56" rx="10" fill="#fecaca"/>
<text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">"&lt;d&gt;" + value + "&lt;/d&gt;"</text>
<rect x="455" y="115" width="170" height="56" rx="10" fill="#fecaca"/>
<text x="540" y="147" text-anchor="middle" class="svg-ink" font-size="13">extra element ghus gaya</text>
<line x1="185" y1="43" x2="235" y2="43" stroke="#64748b" stroke-width="2"/>
<polygon points="235,43 227,46 227,39" fill="#64748b"/>
<line x1="405" y1="43" x2="455" y2="43" stroke="#64748b" stroke-width="2"/>
<polygon points="455,43 447,46 447,39" fill="#64748b"/>
<line x1="185" y1="143" x2="235" y2="143" stroke="#64748b" stroke-width="2"/>
<polygon points="235,143 227,146 227,139" fill="#64748b"/>
<line x1="405" y1="143" x2="455" y2="143" stroke="#64748b" stroke-width="2"/>
<polygon points="455,143 447,146 447,139" fill="#64748b"/>
</svg><p class="cap">Upar: library value ko text rakhti hai. Neeche: tags wali value structure badal deti hai.</p></div>
<h3>f-string kyun nahi?</h3>
<pre class="code">import xml.etree.ElementTree as ET

description = 'to &lt;J1&gt; &amp; "SW1"'

# WRONG: gluing strings together
bad = "&lt;description&gt;" + description + "&lt;/description&gt;"
try:
    ET.fromstring(bad)
except ET.ParseError as err:
    print("string concatenation -&gt;", err)

# an attacker-shaped value does not even fail: it rewrites the request
evil = "x&lt;/description&gt;&lt;enabled&gt;false&lt;/enabled&gt;&lt;description&gt;y"
glued = "&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;description&gt;" + evil + "&lt;/description&gt;&lt;/interface&gt;"
print([c.tag for c in ET.fromstring(glued)])

# RIGHT: let ElementTree escape
interface = ET.Element("interface")
ET.SubElement(interface, "name").text = "Gi0/1"
ET.SubElement(interface, "description").text = evil
print(ET.tostring(interface, encoding="unicode"))
print([c.tag for c in ET.fromstring(ET.tostring(interface, encoding="unicode"))])</pre>
<pre class="out">AUTO01$ python3 c6_unsafe.py
<span class="hl">string concatenation -&gt; not well-formed (invalid token): line 1, column 22</span>
<span class="hl">['name', 'description', 'enabled', 'description']</span>
<span class="hl">&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;description&gt;x&amp;lt;/description&amp;gt;&amp;lt;enabled&amp;gt;false&amp;lt;/enabled&amp;gt;&amp;lt;description&amp;gt;y&lt;/description&gt;&lt;/interface&gt;</span>
['name', 'description']</pre>
<p>Ek hi idea ke teen nateeje:</p>
<ol>
<li>Jis description mein <code>&lt;</code> ho woh glued text ko <b>not well-formed</b> bana deta hai; device poori request reject karta hai. Pareshan karne wala par nuksaan nahi.</li>
<li><code>x&lt;/description&gt;&lt;enabled&gt;false...</code> jaisi value <b>well-formed</b> hoti hai. Glued string mein ab ek extra <code>enabled</code> element hai jo author ne kabhi nahi likha. Isi tarah text field config badalne ka raasta ban jaata hai.</li>
<li>ElementTree ke saath wahi value <b>text</b> ki tarah store hoti hai: angle brackets <code>&amp;lt;</code> aur <code>&amp;gt;</code> ban jaate hain, aur output parse karne par sirf <code>name</code> aur <code>description</code> milte hain.</li>
</ol>
<h3>Namespaced requests</h3>
<p>NETCONF <code>edit-config</code> teen vocabularies milata hai: base protocol, YANG module aur <code>operation</code> attribute. Naam <code>{uri}local</code> ki tarah likho, bilkul waise jaise chapter 3 mein padhe, aur jo prefix dekhna chahte ho use register karo:</p>
<pre class="code">import xml.etree.ElementTree as ET

NC = "urn:ietf:params:xml:ns:netconf:base:1.0"
IF = "urn:ietf:params:xml:ns:yang:ietf-interfaces"
ET.register_namespace("nc", NC)

rpc = ET.Element("{%s}rpc" % NC, {"message-id": "7"})
edit = ET.SubElement(rpc, "{%s}edit-config" % NC)
ET.SubElement(ET.SubElement(edit, "{%s}target" % NC), "{%s}running" % NC)
config = ET.SubElement(edit, "{%s}config" % NC)
interfaces = ET.SubElement(config, "{%s}interfaces" % IF)
itf = ET.SubElement(interfaces, "{%s}interface" % IF, {"{%s}operation" % NC: "merge"})
ET.SubElement(itf, "{%s}name" % IF).text = "GigabitEthernet0/1"
ET.SubElement(itf, "{%s}description" % IF).text = 'uplink to &lt;J1&gt; &amp; "SW1"'
ET.indent(rpc)
print(ET.tostring(rpc, encoding="unicode"))</pre>
<pre class="out">AUTO01$ python3 c6_ns.py
<span class="hl">&lt;nc:rpc xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" xmlns:ns1="urn:ietf:params:xml:ns:yang:ietf-interfaces" message-id="7"&gt;</span>
  &lt;nc:edit-config&gt;
    &lt;nc:target&gt;
      &lt;nc:running /&gt;
    &lt;/nc:target&gt;
    &lt;nc:config&gt;
<span class="hl">      &lt;ns1:interfaces&gt;</span>
<span class="hl">        &lt;ns1:interface nc:operation="merge"&gt;</span>
<span class="hl">          &lt;ns1:name&gt;GigabitEthernet0/1&lt;/ns1:name&gt;</span>
<span class="hl">          &lt;ns1:description&gt;uplink to &amp;lt;J1&amp;gt; &amp;amp; "SW1"&lt;/ns1:description&gt;</span>
<span class="hl">        &lt;/ns1:interface&gt;</span>
<span class="hl">      &lt;/ns1:interfaces&gt;</span>
    &lt;/nc:config&gt;
  &lt;/nc:edit-config&gt;
&lt;/nc:rpc&gt;</pre>
<ul>
<li><code>register_namespace("nc", NC)</code> ne base protocol ko prefix <code>nc</code> diya; register na hue YANG module ko gadha hua <code>ns1</code> mila. NETCONF server prefix nahi, URI padhta hai.</li>
<li>Attribute <code>{NC}operation</code> <code>nc:operation="merge"</code> ki tarah chhapa. Namespaced attribute ko prefix chahiye, isliye woh kabhi akela nahi likha jaata.</li>
</ul>
<p>Lab yeh XML chhapta hai par NETCONF server ko bhejta nahi; woh agla module hai.</p>

<h3>File mein save karna</h3>
<pre class="code">import xml.etree.ElementTree as ET

rpc = ET.Element("rpc")
ET.SubElement(rpc, "get-software-information")
tree = ET.ElementTree(rpc)
ET.indent(tree)
tree.write("req.xml", encoding="utf-8", xml_declaration=True)
print(open("req.xml").read())

back = ET.parse("req.xml").getroot()
print(back.tag, [c.tag for c in back])</pre>
<pre class="out">AUTO01$ python3 c6_write.py
<span class="hl">&lt;?xml version='1.0' encoding='utf-8'?&gt;</span>
&lt;rpc&gt;
  &lt;get-software-information /&gt;
&lt;/rpc&gt;
rpc ['get-software-information']</pre>
<p><code>write(path, encoding="utf-8", xml_declaration=True)</code> declaration line jodta hai. File ko <code>ET.parse</code> se wapas padhna saabit karta hai ki woh well-formed hai. Lab mein <code>tostring(encoding="unicode")</code> <code>str</code> deta hai; laptop par seedha <code>tostring</code> <code>bytes</code> deta hai.</p>

<h3>PAN-OS aur lxml: wahi niyam</h3>
<p>lxml isi tarah banata hai, <code>ET.indent</code> ki jagah <code>pretty_print=True</code> ke saath, aur <code>bytes</code> lautata hai, isliye <code>.decode()</code>.</p>
<p>PAN-OS payload ko <code>element</code> naam ke query parameter mein maangta hai. XML ek URL ke andar string hai, isliye escaping ki do parten lagti hain: ElementTree XML escape karta hai, aur <code>params=</code> dene par <code>requests</code> URL escape karta hai. Haath se escape mat karo.</p>
<pre class="code"># build the element= payload with ElementTree, never by hand
ip = ET.Element("ip-netmask")
ip.text = "10.20.0.30/32"
desc = ET.Element("description")
desc.text = "test &lt;lab&gt; &amp; more"
element = ET.tostring(ip, encoding="unicode") + ET.tostring(desc, encoding="unicode")
print(element)

xpath = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']/address/entry[@name='demo1']"
r = requests.get(API, params={"type": "config", "action": "set", "xpath": xpath, "element": element},
                 headers={"X-PAN-KEY": key}, verify=False, timeout=10)
print(r.status_code, r.text)
root = ET.fromstring(r.text)
print(root.get("status"), root.get("code"), root.findtext("msg"))</pre>
<pre class="out">AUTO01$ python3 c6_pan.py
<span class="hl">&lt;ip-netmask&gt;10.20.0.30/32&lt;/ip-netmask&gt;&lt;description&gt;test &amp;lt;lab&amp;gt; &amp;amp; more&lt;/description&gt;</span>
<span class="hl">200 &lt;response status="success" code="20"&gt;&lt;msg&gt;command succeeded&lt;/msg&gt;&lt;/response&gt;</span>
<span class="hl">success 20 command succeeded</span></pre>
<p>Firewall ne object le liya (<code>code="20"</code>) aur description ke brackets escaped rahe. Asli firewalls par <code>verify=False</code> ki jagah CA bundle use karo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Request f-string se banana. <code>tostring</code> ke baad namespace register karna. <code>ET.indent</code> ke baad elements jodna aur dobara indent na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Escaping library ka kaam hai. Jis jawab mein values string template mein chipkayi gayi hon woh galat hai, chahe kitna bhi chhota dikhe.</p></div>

<div class="scn"><h4>Description jisne interface band kar diya</h4><p>Ek script spreadsheet se interface descriptions f-string template se push karti thi. Ek cell mein closing tags wala pasted tukda tha, aur device ne extra <code>enabled</code> element wali request le li. Fix teen lines ka tha: SubElement se tree banao, <code>.text</code> set karo, aur <code>tostring</code> se serialise karo. Ab ek unit test <code>&lt;</code>, <code>&amp;</code> aur closing tag ko description bana kar bhejta hai aur children ki list check karta hai.</p><p><b>Seekh:</b> apne builders ko hostile text se test karo.</p></div>

<div class="iv"><p class="q">XML library se kyun banate hain, string formatting se kyun nahi?</p><p>Library text aur attributes ke special characters escape karti hai aur well-formed tree ki guarantee deti hai, isliye koi value request ka structure nahi badal sakti. String formatting mein tags wali value elements inject kar sakti hai, jo SQL injection ka XML version hai. Namespaces ke liye main {uri}name likhta hoon aur prefixes register karta hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li><code>Element</code>/<code>SubElement</code> se banao; <code>.text</code> aur attributes set karo; kabhi concatenate mat karo.</li>
<li><code>ET.indent</code> sabse aakhir mein; str ke liye <code>tostring(encoding="unicode")</code>.</li>
<li>Namespaced naam <code>{uri}local</code>; serialise se pehle <code>register_namespace</code>.</li>
<li>File wapas padho taaki saabit ho well-formed hai.</li>
<li>requests mein <code>params=</code> use karo aur URL ko usse escape karne do.</li>
</ul></div>
`}};export{e as default};