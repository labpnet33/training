var e={id:`xpath`,h:{en:`XPath: the small subset in ElementTree and the full language in lxml`,hi:`XPath: ElementTree ka chhota subset aur lxml ki poori language`},body:{en:`
<p><b>The idea of this chapter:</b> a path such as <code>result/address/entry</code> walks down a tree one box at a time. XPath is the language that adds questions to the walk: "only the entries whose name starts with w", "the parent of this element", "how many are there?". ElementTree speaks a small piece of it; lxml speaks all of XPath 1.0.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ElementTree subset and lxml full XPath">
<rect x="15" y="20" width="280" height="110" rx="10" fill="#bae6fd"/>
<text x="155" y="63" text-anchor="middle" class="svg-ink" font-size="13">ElementTree  find / findall</text>
<text x="155" y="79" text-anchor="middle" class="svg-muted" font-size="11">tag, path, [@a='v'], [n], {*}, ..</text>
<text x="155" y="95" text-anchor="middle" class="svg-muted" font-size="11">no text(), no functions</text>
<rect x="345" y="20" width="280" height="110" rx="10" fill="#bbf7d0"/>
<text x="485" y="63" text-anchor="middle" class="svg-ink" font-size="13">lxml  xpath()</text>
<text x="485" y="79" text-anchor="middle" class="svg-muted" font-size="11">full XPath 1.0: text(), functions,</text>
<text x="485" y="95" text-anchor="middle" class="svg-muted" font-size="11">parents, comparisons, local-name()</text>
<line x1="295" y1="75" x2="345" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="345,75 337,78 337,71" fill="#64748b"/>
</svg><p class="cap">Start with ElementTree; reach for lxml when the question needs a function or a string result.</p></div>
<h3>The ElementTree subset</h3>
<p><code>find</code>, <code>findall</code>, <code>findtext</code> and <code>iterfind</code> accept a "limited XPath". These all work:</p>
<table class="cmp">
<tr><th>Path piece</th><th>Meaning</th></tr>
<tr><td><code>a/b</code>, <code>*</code>, <code>.</code>, <code>..</code></td><td>child, any child, self, parent</td></tr>
<tr><td><code>.//b</code></td><td>b at any depth below</td></tr>
<tr><td><code>b[@k]</code>, <code>b[@k='v']</code></td><td>has the attribute, attribute equals</td></tr>
<tr><td><code>b[c]</code>, <code>b[c='text']</code></td><td>has a child c, child text equals</td></tr>
<tr><td><code>b[2]</code>, <code>b[last()]</code></td><td>position (counted from 1), last</td></tr>
<tr><td><code>{ns}b</code>, <code>{*}b</code></td><td>namespaced tag, any namespace</td></tr>
</table>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("pan_addr_two.xml").getroot()


def names(found):
    return [e.get("name") for e in found]


print(names(root.findall(".//entry")))
print(names(root.findall(".//entry[@name='db1']")))
print(names(root.findall(".//entry[description]")))
print(names(root.findall(".//entry[ip-netmask='10.20.0.20/32']")))
print(names(root.findall("result/address/entry[2]")))
print(names(root.findall("result/address/entry[last()]")))
print(root.find(".//description/..").get("name"))

try:
    root.findall(".//entry[starts-with(@name,'w')]")
except SyntaxError as err:
    print("SyntaxError:", err)</pre>
<pre class="out">AUTO01$ python3 c4_et.py
['web1', 'db1']
['db1']
['web1']
['db1']
['db1']
['db1']
web1
<span class="hl">SyntaxError: invalid predicate</span></pre>
<p>The last line is the limit. No functions (<code>starts-with</code>, <code>contains</code>, <code>count</code>), no <code>text()</code>, no way to return an attribute as the result, no <code>and</code>/<code>or</code>, no axes such as <code>ancestor::</code>. The error is a <code>SyntaxError</code> or a similar exception from inside the library: when the path is valid XPath but ElementTree refuses it, the fix is not a different spelling, it is lxml.</p>

<h3>lxml: the whole language</h3>
<p><code>from lxml import etree</code> gives an almost identical API (<code>parse</code>, <code>fromstring</code>, <code>tostring</code>, same Element methods) plus <code>xpath()</code> on every element. On your laptop install it with <code>pip install lxml</code>; the lab has it ready.</p>
<pre class="code">from lxml import etree

root = etree.parse("pan_addr_two.xml").getroot()
print(root.xpath("//entry/@name"))
print(root.xpath("//entry[starts-with(@name,'w')]/ip-netmask/text()"))
print(root.xpath("//entry[contains(ip-netmask,'.20.')]/@name"))
print(root.xpath("count(//entry)"))
print(root.xpath("//entry[description]/@name"), root.xpath("//entry[not(description)]/@name"))
print(root.xpath("string(//entry[@name='db1']/ip-netmask)"))
print(root.xpath("boolean(//entry[@name='nope'])"))
print(root.xpath("//entry[@name=$n]/ip-netmask/text()", n="web1"))
print(root.xpath("//description/ancestor::entry/@name"))
first = root.xpath("//entry")[0]
print(type(first).__name__, first.tag, first.get("name"), first.getparent().tag)
print(root.getroottree().getpath(first))</pre>
<pre class="out">AUTO01$ python3 c4_lxml.py
['web1', 'db1']
['10.20.0.10/32']
['web1', 'db1']
2.0
['web1'] ['db1']
10.20.0.20/32
False
['10.20.0.10/32']
['web1']
_Element entry web1 address
/response/result/address/entry[1]</pre>
<ul>
<li>The <b>type of the answer depends on the expression</b>: a list for node sets (elements, attribute values, text), a <code>float</code> for <code>count()</code>, a <code>bool</code> for <code>boolean()</code>, a string for <code>string()</code>.</li>
<li><code>/@name</code> and <code>/text()</code> return the values themselves, ready to use.</li>
<li><code>$n</code> is an XPath variable passed as a keyword argument: no string concatenation, no quoting problems when a name contains an apostrophe.</li>
<li><code>getparent()</code> exists on lxml elements only; ElementTree has no way back up the tree.</li>
</ul>

<h3>Namespaces in lxml XPath</h3>
<p>XPath 1.0 has a rule that surprises everyone once: a name without a prefix always means "no namespace", even if the document has a default namespace. So you must invent a prefix for it in <code>namespaces=</code>. A <code>None</code> key is refused.</p>
<pre class="code">from lxml import etree

NS = {
    "nc": "urn:ietf:params:xml:ns:netconf:base:1.0",
    "if": "urn:ietf:params:xml:ns:yang:ietf-interfaces",
    "ip": "urn:ietf:params:xml:ns:yang:ietf-ip",
}
root = etree.parse("xe_ifaces.xml").getroot()
print(root.xpath("//if:interface/if:name/text()", namespaces=NS))
print(root.xpath("//if:interface[if:enabled='true']/if:name/text()", namespaces=NS))
print(root.xpath("//ip:address/ip:ip/text()", namespaces=NS))
print(root.nsmap)

try:
    root.xpath("//if:interface")
except etree.XPathEvalError as err:
    print("XPathEvalError:", err)

print(root.xpath("//interface/name/text()"))
print(root.xpath("//*[local-name()='interface']/*[local-name()='name']/text()"))</pre>
<pre class="out">AUTO01$ python3 c4_lxml_ns.py
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']
['GigabitEthernet0/0', 'Loopback0']
['10.99.0.1', '192.0.2.1']
{None: 'urn:ietf:params:xml:ns:netconf:base:1.0'}
<span class="hl">XPathEvalError: Undefined namespace prefix</span>
<span class="hl">[]</span>
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']</pre>
<p>Read the last four lines. An unknown prefix raises <code>XPathEvalError</code> (loud, good). A prefix-less name quietly returns <code>[]</code> (silent, bad). And <code>local-name()</code> ignores namespaces altogether: slower and less precise, but handy for a quick look or when you do not know the namespace.</p>

<h3>On Junos BGP</h3>
<pre class="code">from lxml import etree

root = etree.parse("junos_bgp.xml").getroot()
NS = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}
bad = root.xpath("//rt:bgp-peer[rt:peer-state!='Established']/rt:peer-address/text()", namespaces=NS)
print(bad)
print([a.split("+")[0] for a in bad])
print(root.xpath("//rt:bgp-peer[rt:peer-state='Established']/rt:bgp-rib/rt:received-prefix-count/text()", namespaces=NS))</pre>
<pre class="out">AUTO01$ python3 c4_lxml_junos.py
['10.99.0.13+179', '10.99.0.99+179']
['10.99.0.13', '10.99.0.99']
['2']</pre>
<p>One expression finds the neighbours that are not Established, a list question that ElementTree would answer with a loop and an <code>if</code>. Lab 1 ends with this query.</p>

<table class="cmp">
<tr><th>Need</th><th>Use</th></tr>
<tr><td>Pick a few fields out of a known reply</td><td>ElementTree</td></tr>
<tr><td>Filter by text, count, go to the parent, combine conditions</td><td>lxml <code>xpath()</code></td></tr>
<tr><td>Install nothing extra</td><td>ElementTree</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Indexing an XPath result with <code>[0]</code> when the list can be empty; check <code>if result:</code> first. Writing <code>//if:interface</code> without a <code>namespaces=</code> dict. Using a single leading slash: <code>/x</code> starts at the document root, <code>//x</code> searches anywhere. Expecting lxml strings to have <code>getparent()</code>: real lxml returns "smart strings" that do, the lab returns plain strings, so do not rely on it.</p></div>
<div class="exam"><p><b>Exam trap.</b> In XPath 1.0 an unprefixed name never matches a default-namespace element. <code>count()</code> returns a float (<code>2.0</code>), not an int.</p></div>

<div class="scn"><h4>Which routers have a neighbour that is not Established?</h4><p>The NOC asked for "any BGP session not up" across forty routers. The ElementTree version was a 25-line loop. With lxml it became one XPath with a predicate and a <code>count()</code> per router, and the review was easy because the expression read like the question.</p><p><b>Lesson:</b> reach for XPath when the question is a filter.</p></div>

<div class="iv"><p class="q">When would you use lxml instead of ElementTree?</p><p>When I need real XPath: functions like <code>contains()</code>, <code>count()</code> or <code>not()</code>, axes like <code>ancestor::</code>, attribute or <code>text()</code> results, variables, or <code>getparent()</code>. For plain field extraction ElementTree is enough and needs no install. The two are close enough that moving code over is easy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ElementTree supports simple paths and predicates, not functions or axes.</li>
<li><code>xpath()</code> in lxml returns a list, float, bool or string depending on the expression.</li>
<li>Unprefixed names mean "no namespace" in XPath 1.0: give every namespace a prefix of your own.</li>
<li><code>local-name()</code> ignores namespaces, useful for exploration.</li>
<li>Always handle an empty result before indexing.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> <code>result/address/entry</code> jaisa path tree mein ek ek dabba neeche chalta hai. XPath woh language hai jo is chalne mein sawal jodti hai: "sirf woh entries jinka naam w se shuru ho", "is element ka parent", "kitne hain?". ElementTree uska chhota hissa bolta hai; lxml poora XPath 1.0 bolta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ElementTree subset aur lxml poora XPath">
<rect x="15" y="20" width="280" height="110" rx="10" fill="#bae6fd"/>
<text x="155" y="63" text-anchor="middle" class="svg-ink" font-size="13">ElementTree  find / findall</text>
<text x="155" y="79" text-anchor="middle" class="svg-muted" font-size="11">tag, path, [@a='v'], [n], {*}, ..</text>
<text x="155" y="95" text-anchor="middle" class="svg-muted" font-size="11">text() nahi, functions nahi</text>
<rect x="345" y="20" width="280" height="110" rx="10" fill="#bbf7d0"/>
<text x="485" y="63" text-anchor="middle" class="svg-ink" font-size="13">lxml  xpath()</text>
<text x="485" y="79" text-anchor="middle" class="svg-muted" font-size="11">poora XPath 1.0: text(), functions,</text>
<text x="485" y="95" text-anchor="middle" class="svg-muted" font-size="11">parents, comparisons, local-name()</text>
<line x1="295" y1="75" x2="345" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="345,75 337,78 337,71" fill="#64748b"/>
</svg><p class="cap">ElementTree se shuru karo; jab sawaal ko function ya string result chahiye tab lxml lo.</p></div>
<h3>ElementTree ka subset</h3>
<p><code>find</code>, <code>findall</code>, <code>findtext</code> aur <code>iterfind</code> "limited XPath" lete hain. Yeh sab chalte hain:</p>
<table class="cmp">
<tr><th>Path ka hissa</th><th>Matlab</th></tr>
<tr><td><code>a/b</code>, <code>*</code>, <code>.</code>, <code>..</code></td><td>child, koi bhi child, khud, parent</td></tr>
<tr><td><code>.//b</code></td><td>neeche kisi bhi depth par b</td></tr>
<tr><td><code>b[@k]</code>, <code>b[@k='v']</code></td><td>attribute hai, attribute barabar hai</td></tr>
<tr><td><code>b[c]</code>, <code>b[c='text']</code></td><td>child c hai, child ka text barabar hai</td></tr>
<tr><td><code>b[2]</code>, <code>b[last()]</code></td><td>position (1 se ginti), aakhri</td></tr>
<tr><td><code>{ns}b</code>, <code>{*}b</code></td><td>namespace wala tag, koi bhi namespace</td></tr>
</table>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("pan_addr_two.xml").getroot()


def names(found):
    return [e.get("name") for e in found]


print(names(root.findall(".//entry")))
print(names(root.findall(".//entry[@name='db1']")))
print(names(root.findall(".//entry[description]")))
print(names(root.findall(".//entry[ip-netmask='10.20.0.20/32']")))
print(names(root.findall("result/address/entry[2]")))
print(names(root.findall("result/address/entry[last()]")))
print(root.find(".//description/..").get("name"))

try:
    root.findall(".//entry[starts-with(@name,'w')]")
except SyntaxError as err:
    print("SyntaxError:", err)</pre>
<pre class="out">AUTO01$ python3 c4_et.py
['web1', 'db1']
['db1']
['web1']
['db1']
['db1']
['db1']
web1
<span class="hl">SyntaxError: invalid predicate</span></pre>
<p>Aakhri line seema hai. Functions nahi (<code>starts-with</code>, <code>contains</code>, <code>count</code>), <code>text()</code> nahi, attribute ko result ki tarah lautane ka tareeka nahi, <code>and</code>/<code>or</code> nahi, <code>ancestor::</code> jaise axes nahi. Error <code>SyntaxError</code> ya library ke andar se milta-julta exception hota hai: jab path valid XPath ho par ElementTree mana kare, to fix alag spelling nahi, lxml hai.</p>

<h3>lxml: poori language</h3>
<p><code>from lxml import etree</code> lagbhag wahi API deta hai (<code>parse</code>, <code>fromstring</code>, <code>tostring</code>, wahi Element methods) aur har element par <code>xpath()</code> bhi. Laptop par <code>pip install lxml</code> se install karo; lab mein ready hai.</p>
<pre class="code">from lxml import etree

root = etree.parse("pan_addr_two.xml").getroot()
print(root.xpath("//entry/@name"))
print(root.xpath("//entry[starts-with(@name,'w')]/ip-netmask/text()"))
print(root.xpath("//entry[contains(ip-netmask,'.20.')]/@name"))
print(root.xpath("count(//entry)"))
print(root.xpath("//entry[description]/@name"), root.xpath("//entry[not(description)]/@name"))
print(root.xpath("string(//entry[@name='db1']/ip-netmask)"))
print(root.xpath("boolean(//entry[@name='nope'])"))
print(root.xpath("//entry[@name=$n]/ip-netmask/text()", n="web1"))
print(root.xpath("//description/ancestor::entry/@name"))
first = root.xpath("//entry")[0]
print(type(first).__name__, first.tag, first.get("name"), first.getparent().tag)
print(root.getroottree().getpath(first))</pre>
<pre class="out">AUTO01$ python3 c4_lxml.py
['web1', 'db1']
['10.20.0.10/32']
['web1', 'db1']
2.0
['web1'] ['db1']
10.20.0.20/32
False
['10.20.0.10/32']
['web1']
_Element entry web1 address
/response/result/address/entry[1]</pre>
<ul>
<li><b>Jawab ka type expression par depend karta hai</b>: node sets (elements, attribute values, text) ke liye list, <code>count()</code> ke liye <code>float</code>, <code>boolean()</code> ke liye <code>bool</code>, <code>string()</code> ke liye string.</li>
<li><code>/@name</code> aur <code>/text()</code> seedhe values lautate hain, use karne ke liye ready.</li>
<li><code>$n</code> ek XPath variable hai jo keyword argument se jaata hai: string concatenation nahi, naam mein apostrophe ho to quoting ki dikkat nahi.</li>
<li><code>getparent()</code> sirf lxml elements par hota hai; ElementTree mein tree mein wapas upar jaane ka tareeka nahi.</li>
</ul>

<h3>lxml XPath mein namespaces</h3>
<p>XPath 1.0 ka ek niyam sabko ek baar chauka deta hai: bina prefix ka naam hamesha "koi namespace nahi" hota hai, chahe document mein default namespace ho. Isliye <code>namespaces=</code> mein uske liye prefix gadhna padta hai. <code>None</code> key manzoor nahi.</p>
<pre class="code">from lxml import etree

NS = {
    "nc": "urn:ietf:params:xml:ns:netconf:base:1.0",
    "if": "urn:ietf:params:xml:ns:yang:ietf-interfaces",
    "ip": "urn:ietf:params:xml:ns:yang:ietf-ip",
}
root = etree.parse("xe_ifaces.xml").getroot()
print(root.xpath("//if:interface/if:name/text()", namespaces=NS))
print(root.xpath("//if:interface[if:enabled='true']/if:name/text()", namespaces=NS))
print(root.xpath("//ip:address/ip:ip/text()", namespaces=NS))
print(root.nsmap)

try:
    root.xpath("//if:interface")
except etree.XPathEvalError as err:
    print("XPathEvalError:", err)

print(root.xpath("//interface/name/text()"))
print(root.xpath("//*[local-name()='interface']/*[local-name()='name']/text()"))</pre>
<pre class="out">AUTO01$ python3 c4_lxml_ns.py
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']
['GigabitEthernet0/0', 'Loopback0']
['10.99.0.1', '192.0.2.1']
{None: 'urn:ietf:params:xml:ns:netconf:base:1.0'}
<span class="hl">XPathEvalError: Undefined namespace prefix</span>
<span class="hl">[]</span>
['GigabitEthernet0/0', 'GigabitEthernet0/1', 'GigabitEthernet0/2', 'GigabitEthernet0/3', 'Loopback0']</pre>
<p>Aakhri chaar lines padho. Anjaan prefix <code>XPathEvalError</code> deta hai (shor machata hai, accha). Bina prefix ka naam chupchaap <code>[]</code> deta hai (khamosh, bura). Aur <code>local-name()</code> namespaces ko poori tarah ignore karta hai: dhima aur kam precise, par jaldi dekhne ya namespace na pata hone par kaam ka.</p>

<h3>Junos BGP par</h3>
<pre class="code">from lxml import etree

root = etree.parse("junos_bgp.xml").getroot()
NS = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}
bad = root.xpath("//rt:bgp-peer[rt:peer-state!='Established']/rt:peer-address/text()", namespaces=NS)
print(bad)
print([a.split("+")[0] for a in bad])
print(root.xpath("//rt:bgp-peer[rt:peer-state='Established']/rt:bgp-rib/rt:received-prefix-count/text()", namespaces=NS))</pre>
<pre class="out">AUTO01$ python3 c4_lxml_junos.py
['10.99.0.13+179', '10.99.0.99+179']
['10.99.0.13', '10.99.0.99']
['2']</pre>
<p>Ek expression woh neighbours dhoondh leta hai jo Established nahi hain, aisa list-sawal jisse ElementTree loop aur <code>if</code> se hal karta. Lab 1 isi query par khatam hota hai.</p>

<table class="cmp">
<tr><th>Zaroorat</th><th>Use karo</th></tr>
<tr><td>Jaane-pehchane reply se kuch fields nikalna</td><td>ElementTree</td></tr>
<tr><td>Text se filter, count, parent par jaana, conditions milana</td><td>lxml <code>xpath()</code></td></tr>
<tr><td>Kuch extra install nahi</td><td>ElementTree</td></tr>
</table>

<div class="warn"><p><b>Aam galtiyan.</b> XPath result ko <code>[0]</code> se index karna jab list khaali ho sakti hai; pehle <code>if result:</code> check karo. <code>namespaces=</code> dict ke bina <code>//if:interface</code> likhna. Single leading slash: <code>/x</code> document root se shuru hota hai, <code>//x</code> kahin bhi dhoondhta hai. lxml strings se <code>getparent()</code> ki ummeed: asli lxml "smart strings" deta hai jinme hota hai, lab plain strings deta hai, isliye us par nirbhar mat raho.</p></div>
<div class="exam"><p><b>Exam trap.</b> XPath 1.0 mein bina prefix ka naam default-namespace element se kabhi match nahi karta. <code>count()</code> float (<code>2.0</code>) deta hai, int nahi.</p></div>

<div class="scn"><h4>Kin routers ka koi neighbour Established nahi hai?</h4><p>NOC ne chaalis routers par "koi bhi BGP session jo up nahi" maanga. ElementTree version 25 lines ka loop tha. lxml ke saath yeh predicate wale ek XPath aur har router ke liye <code>count()</code> mein badal gaya, aur review aasaan tha kyunki expression sawal ki tarah padhta tha.</p><p><b>Seekh:</b> jab sawal filter ho to XPath uthao.</p></div>

<div class="iv"><p class="q">Kab ElementTree ki jagah lxml use karoge?</p><p>Jab mujhe asli XPath chahiye: <code>contains()</code>, <code>count()</code> ya <code>not()</code> jaise functions, <code>ancestor::</code> jaise axes, attribute ya <code>text()</code> results, variables, ya <code>getparent()</code>. Simple field extraction ke liye ElementTree kaafi hai aur install nahi chahiye. Dono itne kareeb hain ki code move karna aasaan hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>ElementTree simple paths aur predicates deta hai, functions ya axes nahi.</li>
<li><code>xpath()</code> lxml mein expression ke hisaab se list, float, bool ya string deta hai.</li>
<li>XPath 1.0 mein bina prefix ke naam ka matlab "koi namespace nahi": har namespace ko apna prefix do.</li>
<li><code>local-name()</code> namespaces ignore karta hai, exploration ke liye kaam ka.</li>
<li>Index karne se pehle khaali result sambhalo.</li>
</ul></div>
`}};export{e as default};