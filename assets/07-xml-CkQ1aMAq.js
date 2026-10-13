var e={id:`xml`,h:{en:`XML: tags, attributes and reading it in Python`,hi:`XML: tags, attributes aur Python mein padhna`},body:{en:`
<p>XML is the oldest of the three formats and the wordiest. You will still meet it, mainly in <b>NETCONF</b>, the protocol that older and many current network devices use for model-driven configuration. You rarely write XML by hand in this track, but you must be able to read it and pick values out of it.</p>
<h3>Anatomy of an XML document</h3>
<ul>
<li>An <b>element</b> is a pair of tags: <code>&lt;name&gt;R1&lt;/name&gt;</code>. The first is the <b>opening tag</b>, the last the <b>closing tag</b>, and the text in between is the <b>value</b>.</li>
<li>Elements nest. An element that contains others is a parent; the ones inside are children. The single outermost element is the <b>root</b>.</li>
<li>An <b>attribute</b> is extra information inside the opening tag: <code>&lt;interface type="ethernet"&gt;</code>. The value is always in quotes.</li>
<li>An element with no content can close itself: <code>&lt;shutdown/&gt;</code>.</li>
</ul>
<pre class="code">&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;interfaces&gt;
    &lt;interface type="ethernet"&gt;
      &lt;name&gt;GigabitEthernet0/1&lt;/name&gt;
      &lt;ip&gt;10.10.1.1&lt;/ip&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
    &lt;/interface&gt;
    &lt;interface type="loopback"&gt;
      &lt;name&gt;Loopback0&lt;/name&gt;
      &lt;ip&gt;1.1.1.1&lt;/ip&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/device&gt;</pre>
<p>Read it like a tree: <code>device</code> is the root, it has one child <code>interfaces</code>, which has two <code>interface</code> children, and each of those has <code>name</code>, <code>ip</code> and <code>enabled</code>. The attribute <code>type</code> describes the interface itself.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="XML is a tree"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Root</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">device</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parent</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Child</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">interface (type)</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Leaves</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">name, ip, enabled</text></svg><p class="cap">XML is a tree</p></div>
<h3>The strict rules</h3>
<ol>
<li>Every opening tag needs a matching closing tag (or a self-closing tag).</li>
<li>Tags must be <b>properly nested</b>: close the inner tag before the outer one.</li>
<li>There is exactly <b>one root</b> element.</li>
<li>Attribute values are in quotes.</li>
<li>Tag names are <b>case-sensitive</b>: <code>&lt;Name&gt;</code> and <code>&lt;name&gt;</code> differ.</li>
<li>The characters <code>&lt;</code>, <code>&gt;</code> and <code>&amp;</code> inside text must be written as <code>&amp;lt;</code>, <code>&amp;gt;</code> and <code>&amp;amp;</code>.</li>
</ol>
<h3>Reading XML with Python</h3>
<p>The standard library module <code>xml.etree.ElementTree</code> loads XML into a tree you can search. This is <b>reference code (not run in the simulator)</b>, but it runs on any normal Python 3 install, and the output below is from a real Python 3 run.</p>
<pre class="code">import xml.etree.ElementTree as ET

text = """
&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;interfaces&gt;
    &lt;interface type="ethernet"&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;ip&gt;10.10.1.1&lt;/ip&gt;&lt;/interface&gt;
    &lt;interface type="loopback"&gt;&lt;name&gt;Loopback0&lt;/name&gt;&lt;ip&gt;1.1.1.1&lt;/ip&gt;&lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/device&gt;
"""
root = ET.fromstring(text)
print(root.tag)
print(root.find("name").text)
for intf in root.findall("./interfaces/interface"):
    print(intf.attrib["type"], intf.find("name").text, intf.find("ip").text)</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">device
R1
ethernet GigabitEthernet0/1 10.10.1.1
loopback Loopback0 1.1.1.1</pre>
<p>Line by line: <code>ET.fromstring(text)</code> parses the text and returns the <b>root element</b>. <code>root.tag</code> is its tag name. <code>root.find("name")</code> finds the first child called <code>name</code>, and <code>.text</code> gives its value. <code>findall("./interfaces/interface")</code> is a small <b>path expression</b> (a limited form of XPath): start at the root, go into <code>interfaces</code>, then collect every <code>interface</code>. <code>.attrib</code> is a dictionary of the attributes.</p>
<p>Everything you read is <b>text</b>. If you need a number, convert it yourself, for example <code>int(vlan.text)</code>.</p>
<h3>Writing XML</h3>
<p>You can build a tree with code and turn it into text:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.Element("interface", {"type": "ethernet"})
ET.SubElement(root, "name").text = "GigabitEthernet0/2"
ET.SubElement(root, "ip").text = "10.10.2.1"
print(ET.tostring(root, encoding="unicode"))</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">&lt;interface type="ethernet"&gt;&lt;name&gt;GigabitEthernet0/2&lt;/name&gt;&lt;ip&gt;10.10.2.1&lt;/ip&gt;&lt;/interface&gt;</pre>
<h3>Namespaces in one minute</h3>
<p>Large XML systems mix vocabularies, so tags may carry a <b>namespace</b>, a label that says which vocabulary a tag belongs to. In NETCONF replies you often see an attribute such as <code>xmlns="urn:example:interfaces"</code> on the root. In Python the namespace is glued in front of the tag name inside curly brackets.</p>
<pre class="code">import xml.etree.ElementTree as ET

text = '&lt;interfaces xmlns="urn:example:interfaces"&gt;&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;'
root = ET.fromstring(text)
print(root.tag)
ns = {"i": "urn:example:interfaces"}
print(root.find("i:interface/i:name", ns).text)</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">{urn:example:interfaces}interfaces
Gi0/1</pre>
<p>If <code>find</code> returns <code>None</code> on a document that clearly has the element, a namespace is the usual reason. You then get <code>AttributeError: 'NoneType' object has no attribute 'text'</code>, the same shape of error you saw with missing return values.</p>
<h3>Broken XML</h3>
<p>A wrong closing tag gives a <code>ParseError</code> that names the position. Catch it and print the message:</p>
<pre class="code">import xml.etree.ElementTree as ET

bad = "&lt;device&gt;&lt;name&gt;R1&lt;/nme&gt;&lt;/device&gt;"
try:
    ET.fromstring(bad)
except ET.ParseError as e:
    print("XML error:", e)</pre><p><i>Reference code (not run in the simulator). Output below is from standard Python 3.</i></p><pre class="out">XML error: mismatched tag: line 1, column 18</pre>
<h3>Where you will meet XML: NETCONF</h3>
<p>A NETCONF request is an XML message. This one asks a device for its running configuration. It is shown only to help you recognise the shape; the NETCONF module of this course goes deeper.</p>
<pre class="code">&lt;rpc message-id="101"&gt;
  &lt;get-config&gt;
    &lt;source&gt;&lt;running/&gt;&lt;/source&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;</pre>
<h3>JSON, YAML or XML? A quick comparison</h3>
<table class="cmp"><tr><th>Question</th><th>JSON</th><th>YAML</th><th>XML</th></tr><tr><td>Comments</td><td>no</td><td>yes</td><td>yes (between comment markers)</td></tr><tr><td>Structure shown by</td><td>braces and brackets</td><td>indentation</td><td>opening and closing tags</td></tr><tr><td>Attributes</td><td>no</td><td>no</td><td>yes</td></tr><tr><td>Typical use</td><td>REST, RESTCONF</td><td>Ansible, variables</td><td>NETCONF</td></tr><tr><td>Python module</td><td><code>json</code></td><td><code>yaml</code> (PyYAML)</td><td><code>xml.etree.ElementTree</code></td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) A mismatched or misspelled closing tag, which is case-sensitive. (2) Forgetting that every value read from XML is text. (3) Searching without the namespace and getting <code>None</code>. (4) Parsing untrusted XML from the internet with unsafe settings; in production use a hardened parser for external input.</p></div>
<div class="exam"><p><b>Exam trap.</b> XML elements have opening and closing tags; attributes live inside the opening tag. NETCONF uses XML; RESTCONF can use XML or JSON. XML can carry attributes, JSON cannot.</p></div>
<div class="scn"><h4>The None that was a namespace</h4><p>An engineer parsed a NETCONF reply and <code>root.find("interface")</code> returned <code>None</code> even though the text clearly contained interface elements. The reply declared a namespace on the root, so the real tag was <code>{urn:example:interfaces}interface</code>. After passing the namespace mapping to <code>find</code>, the script read all interfaces.</p>
<p><b>Lesson:</b> when an element that is obviously there cannot be found in XML, suspect a namespace.</p></div>
<div class="iv"><p class="q">"How would you read values from an XML reply in Python?"</p><p>I parse it with <code>xml.etree.ElementTree.fromstring</code>, then use <code>find</code> and <code>findall</code> with a path such as <code>./interfaces/interface</code> and read <code>.text</code> for values and <code>.attrib</code> for attributes. I convert text to numbers myself, and if the document has a namespace I pass a namespace dictionary to <code>find</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XML is a tree of elements with opening and closing tags; attributes sit in the opening tag.</li>
<li>Tags must be properly nested, with one root, and are case-sensitive.</li>
<li><code>ElementTree.fromstring</code>, <code>find</code>, <code>findall</code>, <code>.text</code> and <code>.attrib</code> read it.</li>
<li>All values from XML are text; convert numbers yourself.</li>
<li>A namespace is the usual reason <code>find</code> returns None; NETCONF uses XML.</li>
</ul></div>
`,hi:`
<p>XML teeno formats mein sabse purana aur sabse lamba hai. Aap use abhi bhi milte rahoge, mukhya roop se <b>NETCONF</b> mein, jo protocol purane aur kai maujooda network devices model-driven configuration ke liye use karte hain. Is track mein aap XML haath se kam hi likhoge, lekin use padhna aur usme se values nikalna aana chahiye.</p>
<h3>XML document ki anatomy</h3>
<ul>
<li><b>Element</b> tags ki jodi hai: <code>&lt;name&gt;R1&lt;/name&gt;</code>. Pehla <b>opening tag</b>, aakhri <b>closing tag</b>, aur beech ka text <b>value</b>.</li>
<li>Elements nest hote hain. Jis element mein doosre hon woh parent; andar wale children. Sabse bahar ka ek akela element <b>root</b> hai.</li>
<li><b>Attribute</b> opening tag ke andar extra jankari hai: <code>&lt;interface type="ethernet"&gt;</code>. Value hamesha quotes mein.</li>
<li>Bina content wala element khud ko band kar sakta hai: <code>&lt;shutdown/&gt;</code>.</li>
</ul>
<pre class="code">&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;interfaces&gt;
    &lt;interface type="ethernet"&gt;
      &lt;name&gt;GigabitEthernet0/1&lt;/name&gt;
      &lt;ip&gt;10.10.1.1&lt;/ip&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
    &lt;/interface&gt;
    &lt;interface type="loopback"&gt;
      &lt;name&gt;Loopback0&lt;/name&gt;
      &lt;ip&gt;1.1.1.1&lt;/ip&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/device&gt;</pre>
<p>Ise ped ki tarah padho: <code>device</code> root hai, uska ek child <code>interfaces</code> hai, jiske do <code>interface</code> children hain, aur har ek mein <code>name</code>, <code>ip</code> aur <code>enabled</code> hain. Attribute <code>type</code> interface ke baare mein batata hai.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="XML ek ped hai"><rect x="20" y="30" width="129" height="70" rx="10" fill="#bae6fd"/><text x="84" y="60" text-anchor="middle" class="svg-ink" font-size="14">Root</text><text x="84" y="82" text-anchor="middle" class="svg-muted" font-size="12">device</text><line x1="151" y1="65" x2="171" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="171,60 177,65 171,70" fill="#64748b"/><rect x="177" y="30" width="129" height="70" rx="10" fill="#bbf7d0"/><text x="241" y="60" text-anchor="middle" class="svg-ink" font-size="14">Parent</text><text x="241" y="82" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text><line x1="308" y1="65" x2="328" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="328,60 334,65 328,70" fill="#64748b"/><rect x="334" y="30" width="129" height="70" rx="10" fill="#fde68a"/><text x="398" y="60" text-anchor="middle" class="svg-ink" font-size="14">Child</text><text x="398" y="82" text-anchor="middle" class="svg-muted" font-size="12">interface (type)</text><line x1="465" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><polygon points="485,60 491,65 485,70" fill="#64748b"/><rect x="491" y="30" width="129" height="70" rx="10" fill="#ddd6fe"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="14">Leaves</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="12">name, ip, enabled</text></svg><p class="cap">XML ek ped hai</p></div>
<h3>Strict rules</h3>
<ol>
<li>Har opening tag ko matching closing tag (ya self-closing tag) chahiye.</li>
<li>Tags <b>sahi nest</b> hone chahiye: bahar wale se pehle andar wala band karo.</li>
<li>Theek <b>ek root</b> element hota hai.</li>
<li>Attribute values quotes mein.</li>
<li>Tag names <b>case-sensitive</b> hain: <code>&lt;Name&gt;</code> aur <code>&lt;name&gt;</code> alag hain.</li>
<li>Text ke andar <code>&lt;</code>, <code>&gt;</code> aur <code>&amp;</code> ko <code>&amp;lt;</code>, <code>&amp;gt;</code> aur <code>&amp;amp;</code> likhna padta hai.</li>
</ol>
<h3>Python mein XML padhna</h3>
<p>Standard library module <code>xml.etree.ElementTree</code> XML ko aise tree mein load karta hai jisme search ho sake. Yeh <b>reference code (simulator mein nahi chalta)</b> hai, lekin kisi bhi normal Python 3 install par chalta hai, aur neeche ka output asli Python 3 run ka hai.</p>
<pre class="code">import xml.etree.ElementTree as ET

text = """
&lt;device&gt;
  &lt;name&gt;R1&lt;/name&gt;
  &lt;interfaces&gt;
    &lt;interface type="ethernet"&gt;&lt;name&gt;GigabitEthernet0/1&lt;/name&gt;&lt;ip&gt;10.10.1.1&lt;/ip&gt;&lt;/interface&gt;
    &lt;interface type="loopback"&gt;&lt;name&gt;Loopback0&lt;/name&gt;&lt;ip&gt;1.1.1.1&lt;/ip&gt;&lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/device&gt;
"""
root = ET.fromstring(text)
print(root.tag)
print(root.find("name").text)
for intf in root.findall("./interfaces/interface"):
    print(intf.attrib["type"], intf.find("name").text, intf.find("ip").text)</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">device
R1
ethernet GigabitEthernet0/1 10.10.1.1
loopback Loopback0 1.1.1.1</pre>
<p>Line by line: <code>ET.fromstring(text)</code> text parse karke <b>root element</b> deta hai. <code>root.tag</code> uska tag naam hai. <code>root.find("name")</code> <code>name</code> naam ka pehla child dhoondhta hai, aur <code>.text</code> uski value deta hai. <code>findall("./interfaces/interface")</code> ek chhota <b>path expression</b> hai (XPath ka seemit roop): root se shuru karo, <code>interfaces</code> mein jao, phir har <code>interface</code> ikattha karo. <code>.attrib</code> attributes ki dictionary hai.</p>
<p>Jo bhi aap padhte ho woh <b>text</b> hai. Number chahiye to khud convert karo, jaise <code>int(vlan.text)</code>.</p>
<h3>XML likhna</h3>
<p>Code se tree bana sakte ho aur use text mein badal sakte ho:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.Element("interface", {"type": "ethernet"})
ET.SubElement(root, "name").text = "GigabitEthernet0/2"
ET.SubElement(root, "ip").text = "10.10.2.1"
print(ET.tostring(root, encoding="unicode"))</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">&lt;interface type="ethernet"&gt;&lt;name&gt;GigabitEthernet0/2&lt;/name&gt;&lt;ip&gt;10.10.2.1&lt;/ip&gt;&lt;/interface&gt;</pre>
<h3>Namespaces ek minute mein</h3>
<p>Bade XML systems kai vocabularies mix karte hain, isliye tags par <b>namespace</b> ho sakta hai, ek label jo batata hai tag kis vocabulary ka hai. NETCONF replies mein aksar root par <code>xmlns="urn:example:interfaces"</code> jaisa attribute dikhta hai. Python mein namespace tag naam ke aage curly brackets mein jud jaata hai.</p>
<pre class="code">import xml.etree.ElementTree as ET

text = '&lt;interfaces xmlns="urn:example:interfaces"&gt;&lt;interface&gt;&lt;name&gt;Gi0/1&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;'
root = ET.fromstring(text)
print(root.tag)
ns = {"i": "urn:example:interfaces"}
print(root.find("i:interface/i:name", ns).text)</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">{urn:example:interfaces}interfaces
Gi0/1</pre>
<p>Agar <code>find</code> aise document par <code>None</code> deta hai jisme element saaf hai, to namespace aam wajah hai. Tab <code>AttributeError: 'NoneType' object has no attribute 'text'</code> milta hai, wahi shape ka error jo aapne missing return values ke saath dekha.</p>
<h3>Toota hua XML</h3>
<p>Galat closing tag <code>ParseError</code> deta hai jo position batata hai. Use pakdo aur message print karo:</p>
<pre class="code">import xml.etree.ElementTree as ET

bad = "&lt;device&gt;&lt;name&gt;R1&lt;/nme&gt;&lt;/device&gt;"
try:
    ET.fromstring(bad)
except ET.ParseError as e:
    print("XML error:", e)</pre><p><i>Reference code (simulator mein nahi chalta). Neeche ka output standard Python 3 ka hai.</i></p><pre class="out">XML error: mismatched tag: line 1, column 18</pre>
<h3>Jahan XML milega: NETCONF</h3>
<p>NETCONF request ek XML message hai. Yeh device se uski running configuration maangti hai. Yeh sirf shape pehchanne ke liye hai; is course ka NETCONF module aur gehra jaata hai.</p>
<pre class="code">&lt;rpc message-id="101"&gt;
  &lt;get-config&gt;
    &lt;source&gt;&lt;running/&gt;&lt;/source&gt;
  &lt;/get-config&gt;
&lt;/rpc&gt;</pre>
<h3>JSON, YAML ya XML? Jaldi compare</h3>
<table class="cmp"><tr><th>Sawaal</th><th>JSON</th><th>YAML</th><th>XML</th></tr><tr><td>Comments</td><td>nahi</td><td>haan</td><td>haan (comment markers ke beech)</td></tr><tr><td>Structure dikhta hai</td><td>braces aur brackets se</td><td>indentation se</td><td>opening aur closing tags se</td></tr><tr><td>Attributes</td><td>nahi</td><td>nahi</td><td>haan</td></tr><tr><td>Aam use</td><td>REST, RESTCONF</td><td>Ansible, variables</td><td>NETCONF</td></tr><tr><td>Python module</td><td><code>json</code></td><td><code>yaml</code> (PyYAML)</td><td><code>xml.etree.ElementTree</code></td></tr></table>
<div class="warn"><p><b>Common mistakes.</b> (1) Mismatched ya galat spelling wala closing tag, jo case-sensitive hai. (2) Yeh bhoolna ki XML se padhi har value text hai. (3) Namespace ke bina search karke <code>None</code> paana. (4) Internet ke untrusted XML ko unsafe settings se parse karna; production mein external input ke liye hardened parser use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> XML elements ke opening aur closing tags hote hain; attributes opening tag ke andar. NETCONF XML use karta hai; RESTCONF XML ya JSON. XML attributes rakh sakta hai, JSON nahi.</p></div>
<div class="scn"><h4>None jo namespace tha</h4><p>Ek engineer ne NETCONF reply parse ki aur <code>root.find("interface")</code> <code>None</code> deta raha, jabki text mein interface elements saaf the. Reply ne root par namespace declare kiya tha, isliye asli tag <code>{urn:example:interfaces}interface</code> tha. <code>find</code> ko namespace mapping dene ke baad script ne saare interfaces padh liye.</p>
<p><b>Lesson:</b> XML mein jo element saaf maujood hai par mil nahi raha, namespace par shak karo.</p></div>
<div class="iv"><p class="q">"XML reply se Python mein values kaise padhoge?"</p><p>Main use <code>xml.etree.ElementTree.fromstring</code> se parse karta hoon, phir <code>./interfaces/interface</code> jaise path ke saath <code>find</code> aur <code>findall</code> use karta hoon, aur values ke liye <code>.text</code> aur attributes ke liye <code>.attrib</code> padhta hoon. Text ko numbers mein khud convert karta hoon, aur document mein namespace ho to <code>find</code> ko namespace dictionary deta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XML elements ka ped hai jisme opening aur closing tags hote hain; attributes opening tag mein.</li>
<li>Tags sahi nest, ek root, aur case-sensitive hone chahiye.</li>
<li><code>ElementTree.fromstring</code>, <code>find</code>, <code>findall</code>, <code>.text</code> aur <code>.attrib</code> use padhte hain.</li>
<li>XML ki saari values text hain; numbers khud convert karo.</li>
<li><code>find</code> ke None dene ki aam wajah namespace hai; NETCONF XML use karta hai.</li>
</ul></div>
`}};export{e as default};