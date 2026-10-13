var e={id:`summary`,h:{en:`Summary, cheat-sheet and exam checklist`,hi:`Saar, cheat-sheet aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> one page to keep. It collects what to remember, the tool to pick, the words to know, and the honest differences between the lab and a real network.</p>

<h3>Pick the tool</h3>
<table class="cmp">
<tr><th>You need to...</th><th>Use</th></tr>
<tr><td>read one or two fields from a reply</td><td><code>ET.fromstring</code> + <code>findtext</code></td></tr>
<tr><td>walk repeated records</td><td><code>findall</code> / <code>iter</code></td></tr>
<tr><td>filter with a condition, get strings, go to a parent</td><td>lxml <code>xpath()</code></td></tr>
<tr><td>treat a reply like JSON</td><td><code>xmltodict.parse</code> + <code>force_list</code></td></tr>
<tr><td>send XML</td><td><code>Element</code> / <code>SubElement</code> / <code>tostring</code></td></tr>
</table>

<h3>Cheat-sheet</h3>
<table class="cmp">
<tr><th>Situation</th><th>Write</th></tr>
<tr><td>name in a namespace</td><td><code>{uri}name</code>, <code>"rt:name"</code> + map, or <code>{*}name</code></td></tr>
<tr><td>attribute</td><td><code>el.get("status")</code>, <code>el.attrib</code></td></tr>
<tr><td>missing child</td><td><code>el.find(...)</code> returns <code>None</code>; test it</td></tr>
<tr><td>padded text</td><td><code>findtext(...).strip()</code></td></tr>
<tr><td>Junos peer address</td><td><code>.split("+")[0]</code></td></tr>
<tr><td>lxml with a namespace</td><td><code>root.xpath("//rt:x", namespaces=NS)</code></td></tr>
<tr><td>ignore namespaces in XPath</td><td><code>//*[local-name()='x']</code></td></tr>
<tr><td>xmltodict lists</td><td><code>force_list=("entry",)</code></td></tr>
<tr><td>xmltodict attribute / text</td><td><code>"@name"</code>, <code>"#text"</code></td></tr>
<tr><td>pretty print</td><td><code>ET.indent(root)</code> or <code>pretty_print=True</code></td></tr>
<tr><td>string output</td><td><code>ET.tostring(root, encoding="unicode")</code></td></tr>
<tr><td>prefix on output</td><td><code>ET.register_namespace("nc", uri)</code></td></tr>
</table>

<h3>Checklist before you trust a parser</h3>
<ol>
<li>Did I look at the raw reply, including namespaces and attributes?</li>
<li>Do I check the vendor's own success signal (<code>status</code>, <code>rpc-error</code>)?</li>
<li>Do I handle zero, one and many items?</li>
<li>Do I convert text to numbers on purpose, and strip whitespace and <code>+179</code>?</li>
<li>Do I build requests with a library, never with string pasting?</li>
<li>Do I have a saved reply for each shape in a test?</li>
</ol>

<h3>Glossary</h3>
<dl>
<dt>element, attribute, text, tail</dt><dd>a node; a name="value" in its start tag; text inside it; text after its end tag.</dd>
<dt>namespace</dt><dd>a URI that says which vocabulary a name belongs to; the prefix is only a nickname.</dd>
<dt>well-formed</dt><dd>obeys the syntax rules, so a parser accepts it.</dd>
<dt>XPath</dt><dd>a path language for selecting nodes; ElementTree supports a subset, lxml full 1.0.</dd>
<dt>RPC</dt><dd>a request to a device, answered by an <code>rpc-reply</code>.</dd>
<dt>force_list</dt><dd>an xmltodict option that keeps a repeating tag a list even when it occurs once.</dd>
</dl>

<h3>Lab versus real network</h3>
<ul>
<li>The lab Python is a simplified interpreter: bytes behave as <code>str</code>, so scripts use <code>tostring(encoding="unicode")</code>. On a laptop, plain <code>tostring</code> returns <code>bytes</code>.</li>
<li>The lab firewall has no BGP, so it answers with code 17. A real one with BGP configured returns peer data.</li>
<li>Junos namespace URIs carry the release number (23.4R1 here). Yours will differ.</li>
<li>XMLSchema validation and XSLT work in a full lxml install but not in the lab. A real request script also prints <code>InsecureRequestWarning</code> when <code>verify=False</code>.</li>
<li>The wording of exceptions such as the dict-index <code>TypeError</code> can differ between Python versions.</li>
</ul>

<h3>Exam and interview checklist</h3>
<p>Can you answer each of these in one breath?</p>
<ul>
<li>Why does <code>find()</code> return <code>None</code> for a tag I can see? (namespace)</li>
<li>Attribute versus child: <code>get</code> or <code>findtext</code>?</li>
<li>Why does xmltodict give a dict for one item and a list for many, and what is the fix?</li>
<li>Why build requests with Element and SubElement?</li>
<li>How do you know a PAN-OS or NETCONF call really succeeded?</li>
<li>When do you need lxml instead of ElementTree?</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Memorising code instead of the method: look, probe, fix. Using a regex on XML. Forgetting that a good script reports a device's refusal instead of hiding it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Most exam answers come from five facts: attributes are not children, namespaces change names, single becomes dict, escaping belongs to the library, and success lives inside the XML.</p></div>

<div class="scn"><h4>Handing over the tool</h4><p>Before leaving a project, an engineer left a folder with the parsers, six saved replies (empty, one item, many items, an error, a damaged file, a wrong namespace) and a script that ran them all. The next owner changed vendors and only had to add replies, because the checker already named every failure.</p><p><b>Lesson:</b> saved replies are the cheapest regression test.</p></div>

<div class="iv"><p class="q">Walk me through how you would parse a vendor's XML reply you have never seen.</p><p>Save a real reply and read it: root, namespaces, attributes, and how errors are signalled. Pick ElementTree with a namespace map or the wildcard, or lxml if I need real XPath, or xmltodict with force_list for a quick dict. Add a checker for the vendor's success signal, keep the saved reply as a test, and build any request with Element and SubElement.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Look first: root, namespaces, attributes, error signal.</li>
<li>Choose the smallest tool that does the job.</li>
<li>Handle zero, one and many; check success inside the XML.</li>
<li>Build with a library; test with saved replies.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> rakhne layak ek page. Isme yaad rakhne wali baatein, tool chunne ka tareeka, jaanne wale shabd, aur lab aur asli network ka imaandaar fark ek jagah hai.</p>

<h3>Tool chuno</h3>
<table class="cmp">
<tr><th>Tumhein chahiye...</th><th>Use karo</th></tr>
<tr><td>reply se ek-do fields padhna</td><td><code>ET.fromstring</code> + <code>findtext</code></td></tr>
<tr><td>repeated records par chalna</td><td><code>findall</code> / <code>iter</code></td></tr>
<tr><td>condition se filter, strings lena, parent par jaana</td><td>lxml <code>xpath()</code></td></tr>
<tr><td>reply ko JSON ki tarah dekhna</td><td><code>xmltodict.parse</code> + <code>force_list</code></td></tr>
<tr><td>XML bhejna</td><td><code>Element</code> / <code>SubElement</code> / <code>tostring</code></td></tr>
</table>

<h3>Cheat-sheet</h3>
<table class="cmp">
<tr><th>Sthiti</th><th>Likho</th></tr>
<tr><td>namespace wala naam</td><td><code>{uri}name</code>, <code>"rt:name"</code> + map, ya <code>{*}name</code></td></tr>
<tr><td>attribute</td><td><code>el.get("status")</code>, <code>el.attrib</code></td></tr>
<tr><td>child na mile</td><td><code>el.find(...)</code> deta hai <code>None</code>; use test karo</td></tr>
<tr><td>padded text</td><td><code>findtext(...).strip()</code></td></tr>
<tr><td>Junos peer address</td><td><code>.split("+")[0]</code></td></tr>
<tr><td>namespace ke saath lxml</td><td><code>root.xpath("//rt:x", namespaces=NS)</code></td></tr>
<tr><td>XPath mein namespaces ignore</td><td><code>//*[local-name()='x']</code></td></tr>
<tr><td>xmltodict lists</td><td><code>force_list=("entry",)</code></td></tr>
<tr><td>xmltodict attribute / text</td><td><code>"@name"</code>, <code>"#text"</code></td></tr>
<tr><td>pretty print</td><td><code>ET.indent(root)</code> ya <code>pretty_print=True</code></td></tr>
<tr><td>string output</td><td><code>ET.tostring(root, encoding="unicode")</code></td></tr>
<tr><td>output par prefix</td><td><code>ET.register_namespace("nc", uri)</code></td></tr>
</table>

<h3>Parser par bharosa se pehle checklist</h3>
<ol>
<li>Kya maine raw reply dekha, namespaces aur attributes samet?</li>
<li>Kya main vendor ka apna success signal check karta hoon (<code>status</code>, <code>rpc-error</code>)?</li>
<li>Kya main zero, ek aur kai items sambhalta hoon?</li>
<li>Kya main text ko jaan-boojhkar numbers mein badalta hoon, aur whitespace aur <code>+179</code> hataata hoon?</li>
<li>Kya main requests library se banata hoon, string chipkakar nahi?</li>
<li>Kya har shape ke liye test mein ek saved reply hai?</li>
</ol>

<h3>Shabdkosh</h3>
<dl>
<dt>element, attribute, text, tail</dt><dd>ek node; uske start tag mein name="value"; uske andar ka text; end tag ke baad ka text.</dd>
<dt>namespace</dt><dd>ek URI jo batata hai naam kis vocabulary ka hai; prefix sirf nickname hai.</dd>
<dt>well-formed</dt><dd>syntax rules maanta hai, isliye parser le leta hai.</dd>
<dt>XPath</dt><dd>nodes chunne ki path bhasha; ElementTree subset, lxml poora 1.0 deta hai.</dd>
<dt>RPC</dt><dd>device ko request, jiska jawab <code>rpc-reply</code> hota hai.</dd>
<dt>force_list</dt><dd>xmltodict ka option jo repeat hone wale tag ko list rakhta hai chahe woh ek baar aaye.</dd>
</dl>

<h3>Lab versus asli network</h3>
<ul>
<li>Lab ka Python ek saral interpreter hai: bytes <code>str</code> ki tarah chalte hain, isliye scripts <code>tostring(encoding="unicode")</code> use karti hain. Laptop par seedha <code>tostring</code> <code>bytes</code> deta hai.</li>
<li>Lab firewall mein BGP nahi, isliye woh code 17 deta hai. BGP configure wala asli firewall peer data lautata hai.</li>
<li>Junos namespace URIs mein release number hota hai (yahan 23.4R1). Tumhare mein alag hoga.</li>
<li>XMLSchema validation aur XSLT poore lxml install mein chalte hain par lab mein nahi. Asli request script <code>verify=False</code> par <code>InsecureRequestWarning</code> bhi chhapti hai.</li>
<li>Exceptions ki wording, jaise dict-index wala <code>TypeError</code>, Python versions mein alag ho sakti hai.</li>
</ul>

<h3>Exam aur interview checklist</h3>
<p>Kya tum inme se har ek ka jawab ek saans mein de sakte ho?</p>
<ul>
<li>Jo tag mujhe dikhta hai uske liye <code>find()</code> <code>None</code> kyun deta hai? (namespace)</li>
<li>Attribute versus child: <code>get</code> ya <code>findtext</code>?</li>
<li>xmltodict ek item par dict aur kai par list kyun deta hai, aur fix kya hai?</li>
<li>Requests Element aur SubElement se kyun banate hain?</li>
<li>PAN-OS ya NETCONF call sach mein safal hui, yeh kaise jaante ho?</li>
<li>ElementTree ki jagah lxml kab chahiye?</li>
</ul>

<div class="warn"><p><b>Aam galtiyan.</b> Method ki jagah code ratna: dekho, probe karo, theek karo. XML par regex use karna. Yeh bhoolna ki achhi script device ka inkaar chhupati nahi, report karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Zyadatar exam jawab paanch facts se aate hain: attributes children nahi hain, namespaces naam badalte hain, single dict ban jaata hai, escaping library ka kaam hai, aur success XML ke andar rehta hai.</p></div>

<div class="scn"><h4>Tool hawale karna</h4><p>Project chhodne se pehle ek engineer ne parsers, chhe saved replies (khaali, ek item, kai items, error, kharab file, galat namespace) aur unhe chalane wali script ka folder chhoda. Agle owner ne vendor badla aur use sirf replies jodni padi, kyunki checker har failure ka naam pehle se batata tha.</p><p><b>Seekh:</b> saved replies sabse sasta regression test hain.</p></div>

<div class="iv"><p class="q">Ek vendor ka XML reply jo tumne kabhi nahi dekha, use parse karne ka tareeka batao.</p><p>Ek asli reply save karke padhta hoon: root, namespaces, attributes, aur errors kaise signal hote hain. Namespace map ya wildcard ke saath ElementTree chunta hoon, asli XPath chahiye to lxml, ya jaldi dict ke liye force_list ke saath xmltodict. Vendor ke success signal ka checker jodta hoon, saved reply ko test rakhta hoon, aur request Element aur SubElement se banata hoon.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Pehle dekho: root, namespaces, attributes, error signal.</li>
<li>Kaam karne wala sabse chhota tool chuno.</li>
<li>Zero, ek aur kai sambhalo; success XML ke andar check karo.</li>
<li>Library se banao; saved replies se test karo.</li>
</ul></div>
`}};export{e as default};