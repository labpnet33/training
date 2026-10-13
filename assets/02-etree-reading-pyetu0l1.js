var e={id:`etree-reading`,h:{en:`Reading replies with xml.etree.ElementTree`,hi:`xml.etree.ElementTree se replies padhna`},body:{en:`
<p><b>The idea of this chapter:</b> ElementTree turns a string of XML into a small tree of Python objects, and four methods answer nearly every question you will ask it. Learn those four, and learn what each one returns when the answer is "nothing".</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="From text to values">
<rect x="15" y="30" width="130" height="56" rx="10" fill="#e2e8f0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">XML text</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="11">str or file</text>
<rect x="200" y="30" width="130" height="56" rx="10" fill="#fde68a"/><text x="265" y="55" text-anchor="middle" class="svg-ink" font-size="13">fromstring</text><text x="265" y="73" text-anchor="middle" class="svg-muted" font-size="11">parse(...).getroot()</text>
<rect x="385" y="30" width="110" height="56" rx="10" fill="#bae6fd"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="13">Element</text><text x="440" y="73" text-anchor="middle" class="svg-muted" font-size="11">the root</text>
<rect x="545" y="30" width="85" height="56" rx="10" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">find...</text><text x="587" y="73" text-anchor="middle" class="svg-muted" font-size="11">values</text>
<line x1="145" y1="58" x2="200" y2="58" stroke="#64748b" stroke-width="2"/><line x1="330" y1="58" x2="385" y2="58" stroke="#64748b" stroke-width="2"/><line x1="495" y1="58" x2="545" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Parse once, then ask the root.</p></div>

<h3>A PAN-OS reply, no namespaces</h3>
<p>PAN-OS replies have no namespaces, so they are the gentlest place to start. This is the reply to "list the address objects":</p>
<pre class="code">import xml.etree.ElementTree as ET

raw = """&lt;response status="success" code="19"&gt;&lt;result total-count="2" count="2"&gt;
  &lt;address&gt;
    &lt;entry name="web1"&gt;
      &lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;
      &lt;description&gt;web server&lt;/description&gt;
    &lt;/entry&gt;
    &lt;entry name="db1"&gt;
      &lt;ip-netmask&gt;10.20.0.20/32&lt;/ip-netmask&gt;
    &lt;/entry&gt;
  &lt;/address&gt;
&lt;/result&gt;&lt;/response&gt;"""</pre>
<p>Parse it and ask questions:</p>
<pre class="code">root = ET.fromstring(raw)
print(root.tag, root.attrib)
print(root.get("status"), root.get("code"), root.get("missing"))
for entry in root.findall("result/address/entry"):
    print(entry.get("name"), entry.findtext("ip-netmask"), entry.findtext("description", default="-"))
print([e.get("name") for e in root.iter("entry")])
print(root.find("msg"))
print(root.findtext("msg"))
print(len(root.findall(".//entry")), len(root.findall("entry")))
print(root.find("result").attrib)</pre>
<pre class="out">AUTO01$ python3 c2_pan.py
response {'status': 'success', 'code': '19'}
success 19 None
web1 10.20.0.10/32 web server
db1 10.20.0.20/32 -
['web1', 'db1']
None
None
2 0
{'total-count': '2', 'count': '2'}</pre>
<ul>
<li><code>fromstring(text)</code> returns the <b>root</b> Element. Its <code>.tag</code> is <code>response</code> and <code>.attrib</code> is a plain dict.</li>
<li><code>.get("status")</code> reads an attribute and returns <code>None</code> (or a default you pass) when it is missing.</li>
<li><code>findall("result/address/entry")</code> returns a <b>list</b> of every match, relative to the element you call it on. An empty list means no match.</li>
<li><code>findtext("description", default="-")</code> returns the text of the first match, or the default. Without a default a missing child gives <code>None</code>.</li>
<li><code>iter("entry")</code> walks the whole subtree, any depth, and yields matching elements. <code>findall("entry")</code> found nothing because <code>entry</code> is not a direct child of the root: a path looks only where you tell it to.</li>
</ul>

<table class="cmp">
<tr><th>Call</th><th>Returns</th><th>When nothing matches</th></tr>
<tr><td><code>find(path)</code></td><td>first matching Element</td><td><code>None</code></td></tr>
<tr><td><code>findall(path)</code></td><td>list of Elements</td><td><code>[]</code></td></tr>
<tr><td><code>findtext(path, default)</code></td><td>text of the first match</td><td>the default (<code>None</code> if you gave none)</td></tr>
<tr><td><code>iter(tag)</code></td><td>iterator over the subtree</td><td>an empty iterator</td></tr>
<tr><td><code>get(name)</code></td><td>attribute value</td><td><code>None</code></td></tr>
</table>

<h3>The None trap</h3>
<p><code>find()</code> returns <code>None</code>, and <code>None</code> has no <code>.text</code>:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.fromstring('&lt;response status="success"&gt;&lt;result/&gt;&lt;/response&gt;')
try:
    print(root.find("msg").text)
except AttributeError as err:
    print("AttributeError:", err)</pre>
<pre class="out">AUTO01$ python3 c2_none.py
<span class="hl">AttributeError: 'NoneType' object has no attribute 'text'</span></pre>
<p>Three safe habits. Use <code>findtext(path, default="")</code> when you only want text. Compare with <code>is not None</code> when you need the element (do not write <code>if element:</code>, because an element is "false" when it has no children, even if it has text). Print what you have before you guess.</p>

<h3>Live: the firewall's interface table</h3>
<p>Here is the same technique on a reply fetched from a running firewall with <code>requests</code> (the lab's PA1; <code>verify=False</code> because lab devices use self-signed certificates, as real ones often do before a proper certificate is installed):</p>
<pre class="code">import requests
import xml.etree.ElementTree as ET

API = "h&#116;tps://10.99.0.42/api/"
r = requests.get(API, params={"type": "keygen", "user": "admin", "password": "admin"}, verify=False, timeout=10)
key = ET.fromstring(r.text).findtext("result/key")
r = requests.get(API, params={"type": "op", "cmd": "&lt;show&gt;&lt;interface&gt;all&lt;/interface&gt;&lt;/show&gt;"},
                 headers={"X-PAN-KEY": key}, verify=False, timeout=10)
root = ET.fromstring(r.text)
print(root.get("status"))
for entry in root.findall("result/ifnet/entry"):
    print(entry.findtext("name"), entry.findtext("ip"), entry.findtext("zone"))
for hw in root.findall("result/hw/entry")[:3]:
    print(hw.findtext("name"), hw.findtext("state"))</pre>
<pre class="out">AUTO01$ python3 c2_live.py
success
ethernet1/1 10.99.0.42/24 trust
ethernet1/1 up
ethernet1/2 down
ethernet1/3 down</pre>
<p>Note the shape: <code>ifnet</code> lists configured interfaces with their IP and zone, <code>hw</code> lists every port with its state. Joining them by name is a job for a dict, which you will do in the lab. Real <code>requests</code> also prints an <code>InsecureRequestWarning</code> for <code>verify=False</code>; the lab does not.</p>

<h3>When the XML itself is bad</h3>
<pre class="code">import xml.etree.ElementTree as ET

for bad in ["&lt;a&gt;&lt;b&gt;&lt;/a&gt;", "&lt;a&gt;", "", "&lt;a x=1/&gt;", "&lt;a&gt;&amp;nbsp;&lt;/a&gt;"]:
    try:
        ET.fromstring(bad)
    except ET.ParseError as err:
        print(repr(bad), "-&gt;", err, err.position)</pre>
<pre class="out">AUTO01$ python3 c2_errors.py
'&lt;a&gt;&lt;b&gt;&lt;/a&gt;' -&gt; mismatched tag: line 1, column 8 (1, 8)
'&lt;a&gt;' -&gt; no element found: line 1, column 3 (1, 3)
'' -&gt; no element found: line 1, column 0 (1, 0)
'&lt;a x=1/&gt;' -&gt; not well-formed (invalid token): line 1, column 5 (1, 5)
'&lt;a&gt;&amp;nbsp;&lt;/a&gt;' -&gt; undefined entity: line 1, column 3 (1, 3)</pre>
<p><code>ParseError</code> carries the problem and a (line, column) position. You will meet these when a device truncates a reply (<code>no element found</code>), when a banner or a CLI prompt is glued to the XML (<code>junk after document element</code>), or when a hand-built string contains a raw <code>&amp;</code> (<code>not well-formed</code>). The exact wording and column numbers belong to the expat parser inside Python; do not match on them in code, catch <code>ET.ParseError</code> instead.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading <code>.text</code> of a container such as <code>physical-interface</code> and getting whitespace. Forgetting <code>.strip()</code> on text from Junos, which pads values with newlines. Searching with <code>findall("entry")</code> from the root when the entries are two levels down: use the full path or <code>.//entry</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find</code> gives one Element or <code>None</code>; <code>findall</code> gives a list. <code>findtext</code> gives a string, never an Element.</p></div>

<div class="scn"><h4>A half-reply in the log</h4><p>A nightly script crashed with <code>ParseError: no element found</code> on one firewall only. The saved reply stopped in the middle of an <code>entry</code>: the device had hit an API timeout and cut the response. The script now catches <code>ET.ParseError</code>, logs the first 200 characters of the reply and moves on to the next device, so one broken answer no longer ends the run.</p><p><b>Lesson:</b> wrap the parse, log a snippet of the raw reply, continue.</p></div>

<div class="iv"><p class="q">Difference between find, findall and findtext?</p><p><code>find</code> returns the first matching element or <code>None</code>, <code>findall</code> returns a list of all matches (possibly empty), <code>findtext</code> returns the first match's text or a default. Add that <code>.text</code> on a missing element raises <code>AttributeError</code>, which is why I prefer <code>findtext</code> with a default for simple values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>fromstring</code> and <code>parse(...).getroot()</code> give you the root Element.</li>
<li><code>find</code> returns an Element or <code>None</code>, <code>findall</code> a list, <code>findtext</code> a string or a default.</li>
<li>Attributes come from <code>.get()</code> or <code>.attrib</code>, text from <code>.text</code> or <code>findtext</code>.</li>
<li>Paths are relative to the element you call them on; use <code>.//</code> to search at any depth.</li>
<li>Catch <code>ET.ParseError</code> and keep a snippet of the raw reply.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ElementTree XML ke string ko Python objects ke chhote tree mein badalta hai, aur chaar methods lagbhag har sawal ka jawab dete hain. Woh chaar seekho, aur yeh bhi seekho ki "kuch nahi" milne par har ek kya return karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Text se values tak">
<rect x="15" y="30" width="130" height="56" rx="10" fill="#e2e8f0"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">XML text</text><text x="80" y="73" text-anchor="middle" class="svg-muted" font-size="11">str ya file</text>
<rect x="200" y="30" width="130" height="56" rx="10" fill="#fde68a"/><text x="265" y="55" text-anchor="middle" class="svg-ink" font-size="13">fromstring</text><text x="265" y="73" text-anchor="middle" class="svg-muted" font-size="11">parse(...).getroot()</text>
<rect x="385" y="30" width="110" height="56" rx="10" fill="#bae6fd"/><text x="440" y="55" text-anchor="middle" class="svg-ink" font-size="13">Element</text><text x="440" y="73" text-anchor="middle" class="svg-muted" font-size="11">root</text>
<rect x="545" y="30" width="85" height="56" rx="10" fill="#bbf7d0"/><text x="587" y="55" text-anchor="middle" class="svg-ink" font-size="13">find...</text><text x="587" y="73" text-anchor="middle" class="svg-muted" font-size="11">values</text>
<line x1="145" y1="58" x2="200" y2="58" stroke="#64748b" stroke-width="2"/><line x1="330" y1="58" x2="385" y2="58" stroke="#64748b" stroke-width="2"/><line x1="495" y1="58" x2="545" y2="58" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek baar parse karo, phir root se pucho.</p></div>

<h3>PAN-OS reply, bina namespaces ke</h3>
<p>PAN-OS replies mein namespaces nahi hote, isliye shuruaat ke liye sabse aasaan hain. Yeh "address objects list karo" ka reply hai:</p>
<pre class="code">import xml.etree.ElementTree as ET

raw = """&lt;response status="success" code="19"&gt;&lt;result total-count="2" count="2"&gt;
  &lt;address&gt;
    &lt;entry name="web1"&gt;
      &lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;
      &lt;description&gt;web server&lt;/description&gt;
    &lt;/entry&gt;
    &lt;entry name="db1"&gt;
      &lt;ip-netmask&gt;10.20.0.20/32&lt;/ip-netmask&gt;
    &lt;/entry&gt;
  &lt;/address&gt;
&lt;/result&gt;&lt;/response&gt;"""</pre>
<p>Ise parse karo aur sawal pucho:</p>
<pre class="code">root = ET.fromstring(raw)
print(root.tag, root.attrib)
print(root.get("status"), root.get("code"), root.get("missing"))
for entry in root.findall("result/address/entry"):
    print(entry.get("name"), entry.findtext("ip-netmask"), entry.findtext("description", default="-"))
print([e.get("name") for e in root.iter("entry")])
print(root.find("msg"))
print(root.findtext("msg"))
print(len(root.findall(".//entry")), len(root.findall("entry")))
print(root.find("result").attrib)</pre>
<pre class="out">AUTO01$ python3 c2_pan.py
response {'status': 'success', 'code': '19'}
success 19 None
web1 10.20.0.10/32 web server
db1 10.20.0.20/32 -
['web1', 'db1']
None
None
2 0
{'total-count': '2', 'count': '2'}</pre>
<ul>
<li><code>fromstring(text)</code> <b>root</b> Element deta hai. Uska <code>.tag</code> <code>response</code> hai aur <code>.attrib</code> ek plain dict hai.</li>
<li><code>.get("status")</code> attribute padhta hai aur missing hone par <code>None</code> (ya tumhara diya default) deta hai.</li>
<li><code>findall("result/address/entry")</code> har match ki <b>list</b> deta hai, us element ke relative jis par call kiya. Khaali list ka matlab koi match nahi.</li>
<li><code>findtext("description", default="-")</code> pehle match ka text deta hai, ya default. Default ke bina gayab child <code>None</code> deta hai.</li>
<li><code>iter("entry")</code> poore subtree mein kisi bhi depth tak chalta hai aur matching elements deta hai. <code>findall("entry")</code> ko kuch nahi mila kyunki <code>entry</code> root ka seedha child nahi hai: path wahin dekhta hai jahan tum bataate ho.</li>
</ul>

<table class="cmp">
<tr><th>Call</th><th>Return karta hai</th><th>Kuch match na ho to</th></tr>
<tr><td><code>find(path)</code></td><td>pehla matching Element</td><td><code>None</code></td></tr>
<tr><td><code>findall(path)</code></td><td>Elements ki list</td><td><code>[]</code></td></tr>
<tr><td><code>findtext(path, default)</code></td><td>pehle match ka text</td><td>default (agar diya nahi to <code>None</code>)</td></tr>
<tr><td><code>iter(tag)</code></td><td>subtree par iterator</td><td>khaali iterator</td></tr>
<tr><td><code>get(name)</code></td><td>attribute ki value</td><td><code>None</code></td></tr>
</table>

<h3>None ka jaal</h3>
<p><code>find()</code> <code>None</code> deta hai, aur <code>None</code> ka <code>.text</code> nahi hota:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.fromstring('&lt;response status="success"&gt;&lt;result/&gt;&lt;/response&gt;')
try:
    print(root.find("msg").text)
except AttributeError as err:
    print("AttributeError:", err)</pre>
<pre class="out">AUTO01$ python3 c2_none.py
<span class="hl">AttributeError: 'NoneType' object has no attribute 'text'</span></pre>
<p>Teen surakshit aadatein. Sirf text chahiye to <code>findtext(path, default="")</code> use karo. Element chahiye to <code>is not None</code> se compare karo (<code>if element:</code> mat likho, kyunki children na hone par element "false" hota hai, chahe text ho). Andaza lagane se pehle print karo ki kya hai.</p>

<h3>Live: firewall ki interface table</h3>
<p>Yeh wahi technique ek chalte firewall se <code>requests</code> se laye reply par hai (lab ka PA1; <code>verify=False</code> kyunki lab devices self-signed certificates use karte hain, jaise asli devices proper certificate lagne se pehle karte hain):</p>
<pre class="code">import requests
import xml.etree.ElementTree as ET

API = "h&#116;tps://10.99.0.42/api/"
r = requests.get(API, params={"type": "keygen", "user": "admin", "password": "admin"}, verify=False, timeout=10)
key = ET.fromstring(r.text).findtext("result/key")
r = requests.get(API, params={"type": "op", "cmd": "&lt;show&gt;&lt;interface&gt;all&lt;/interface&gt;&lt;/show&gt;"},
                 headers={"X-PAN-KEY": key}, verify=False, timeout=10)
root = ET.fromstring(r.text)
print(root.get("status"))
for entry in root.findall("result/ifnet/entry"):
    print(entry.findtext("name"), entry.findtext("ip"), entry.findtext("zone"))
for hw in root.findall("result/hw/entry")[:3]:
    print(hw.findtext("name"), hw.findtext("state"))</pre>
<pre class="out">AUTO01$ python3 c2_live.py
success
ethernet1/1 10.99.0.42/24 trust
ethernet1/1 up
ethernet1/2 down
ethernet1/3 down</pre>
<p>Shape dekho: <code>ifnet</code> configured interfaces ko unke IP aur zone ke saath dikhata hai, <code>hw</code> har port ko uski state ke saath. Unhe naam se jodna dict ka kaam hai, jo tum lab mein karoge. Asli <code>requests</code> <code>verify=False</code> par <code>InsecureRequestWarning</code> bhi print karta hai; lab nahi karta.</p>

<h3>Jab XML hi kharab ho</h3>
<pre class="code">import xml.etree.ElementTree as ET

for bad in ["&lt;a&gt;&lt;b&gt;&lt;/a&gt;", "&lt;a&gt;", "", "&lt;a x=1/&gt;", "&lt;a&gt;&amp;nbsp;&lt;/a&gt;"]:
    try:
        ET.fromstring(bad)
    except ET.ParseError as err:
        print(repr(bad), "-&gt;", err, err.position)</pre>
<pre class="out">AUTO01$ python3 c2_errors.py
'&lt;a&gt;&lt;b&gt;&lt;/a&gt;' -&gt; mismatched tag: line 1, column 8 (1, 8)
'&lt;a&gt;' -&gt; no element found: line 1, column 3 (1, 3)
'' -&gt; no element found: line 1, column 0 (1, 0)
'&lt;a x=1/&gt;' -&gt; not well-formed (invalid token): line 1, column 5 (1, 5)
'&lt;a&gt;&amp;nbsp;&lt;/a&gt;' -&gt; undefined entity: line 1, column 3 (1, 3)</pre>
<p><code>ParseError</code> problem aur (line, column) position leke aata hai. Yeh tab milte hain jab device reply ko kaat deta hai (<code>no element found</code>), jab banner ya CLI prompt XML se chipak jaata hai (<code>junk after document element</code>), ya jab haath se bane string mein raw <code>&amp;</code> hota hai (<code>not well-formed</code>). Exact wording aur column numbers Python ke andar ke expat parser ke hain; code mein unpar match mat karo, <code>ET.ParseError</code> pakdo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> <code>physical-interface</code> jaise container ka <code>.text</code> padhna aur whitespace pana. Junos ke text par <code>.strip()</code> bhool jaana, jo values ko newlines se pad karta hai. Entries do level neeche hon aur root se <code>findall("entry")</code> karna: poora path ya <code>.//entry</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find</code> ek Element ya <code>None</code> deta hai; <code>findall</code> list deta hai. <code>findtext</code> string deta hai, kabhi Element nahi.</p></div>

<div class="scn"><h4>Log mein aadha reply</h4><p>Ek raat ki script sirf ek firewall par <code>ParseError: no element found</code> se crash hui. Saved reply ek <code>entry</code> ke beech mein ruk gaya tha: device ko API timeout mila aur usne response kaat diya. Ab script <code>ET.ParseError</code> pakadti hai, reply ke pehle 200 characters log karti hai aur agle device par chali jaati hai, isliye ek toota jawab poora run nahi rokta.</p><p><b>Seekh:</b> parse ko wrap karo, raw reply ka tukda log karo, aage badho.</p></div>

<div class="iv"><p class="q">find, findall aur findtext mein kya fark hai?</p><p><code>find</code> pehla matching element ya <code>None</code> deta hai, <code>findall</code> sab matches ki list (khaali bhi ho sakti hai), <code>findtext</code> pehle match ka text ya default. Jodo ki gayab element par <code>.text</code> <code>AttributeError</code> deta hai, isliye simple values ke liye main default wala <code>findtext</code> pasand karta hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li><code>fromstring</code> aur <code>parse(...).getroot()</code> root Element dete hain.</li>
<li><code>find</code> Element ya <code>None</code> deta hai, <code>findall</code> list, <code>findtext</code> string ya default.</li>
<li>Attributes <code>.get()</code> ya <code>.attrib</code> se aate hain, text <code>.text</code> ya <code>findtext</code> se.</li>
<li>Paths us element ke relative hote hain jis par call karo; kisi bhi depth par dhoondhne ke liye <code>.//</code> use karo.</li>
<li><code>ET.ParseError</code> pakdo aur raw reply ka tukda rakho.</li>
</ul></div>
`}};export{e as default};