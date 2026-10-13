var e={id:`big-picture`,h:{en:`XML in network automation: the big picture and the anatomy of a reply`,hi:`Network automation mein XML: bada picture aur reply ki anatomy`},body:{en:`
<p><b>The idea of this chapter:</b> a lot of network gear still answers you in XML, and the first time <code>find()</code> returns <code>None</code> on a reply that is plainly full of data, it feels like a bug in Python. It is not. It is XML working as designed. This module teaches you to read it, query it, build it and trust it.</p>

<h3>What you will learn</h3>
<ul>
<li>Read the anatomy of any reply: elements, attributes, text, tail and namespaces.</li>
<li>Parse and search with <b>xml.etree.ElementTree</b> (<code>fromstring</code>, <code>find</code>, <code>findall</code>, <code>findtext</code>, <code>iter</code>).</li>
<li>Handle <b>namespaces</b> so that Junos and NETCONF replies stop returning <code>None</code>.</li>
<li>Ask real <b>XPath</b> questions with <b>lxml</b> and know what the standard library cannot do.</li>
<li>Flatten a reply into dictionaries with <b>xmltodict</b> and avoid its single-item-versus-list trap.</li>
<li>Build RPC requests safely, and sanity-check Junos, IOS XE and PAN-OS replies before trusting them.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should have finished <b>auto-formats</b> (the first look at JSON, YAML and XML), <b>auto-parse</b>, <b>auto-requests</b>, <b>auto-ssh</b> and <b>py-textfsm</b>. This module reuses nkmiko-style SSH sessions and <code>requests</code> without re-teaching them. The sister modules <b>adv-nkmiko</b> (multivendor SSH) and <b>adv-netconf</b> (NETCONF with ncclient) sit next to this one: they fetch the XML, this module teaches what to do with it.</p>

<h3>Analogy: a form with printed labels</h3>
<p>A text reply from <code>show interfaces</code> is a handwritten note: you find the port by looking at the position of words. An XML reply is a <b>printed form</b>. Every box has a label printed on it, boxes sit inside bigger boxes, and some labels carry stamps (attributes). You never count columns; you ask for "the box called <i>oper-status</i> inside the box called <i>physical-interface</i>". That is why vendors chose it for machine-to-machine replies, and why it survives software upgrades far better than screen scraping.</p>

<h3>Where you meet XML</h3>
<table class="cmp">
<tr><th>Source</th><th>How you get it</th><th>Shape</th></tr>
<tr><td>Junos</td><td><code>show ... | display xml</code> over SSH, or a NETCONF RPC</td><td><code>rpc-reply</code>, child in its own namespace</td></tr>
<tr><td>IOS XE, NETCONF</td><td>ncclient or a raw NETCONF session</td><td><code>rpc-reply</code> in the NETCONF namespace, YANG data inside</td></tr>
<tr><td>PAN-OS</td><td>XML API with <code>requests</code></td><td><code>response status="..." code="..."</code>, no namespaces</td></tr>
</table>
<p>FortiOS and the Cisco ASA REST API answer in JSON, so they do not appear here; the PAN-OS API is the firewall that speaks XML.</p>

<h3>Anatomy of a reply</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Tree of a Junos interface reply">
<rect x="250" y="10" width="140" height="32" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">rpc-reply</text>
<text x="400" y="31" class="svg-muted" font-size="11">root element</text>
<rect x="225" y="70" width="190" height="32" rx="8" fill="#bae6fd"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">interface-information</text>
<rect x="425" y="73" width="205" height="26" rx="8" fill="#fde68a"/><text x="527" y="90" text-anchor="middle" class="svg-ink" font-size="11">junos:style="terse" (attribute)</text>
<rect x="120" y="130" width="170" height="32" rx="8" fill="#bae6fd"/><text x="205" y="151" text-anchor="middle" class="svg-ink" font-size="13">physical-interface</text>
<rect x="350" y="130" width="170" height="32" rx="8" fill="#bae6fd"/><text x="435" y="151" text-anchor="middle" class="svg-ink" font-size="13">physical-interface</text>
<rect x="45" y="190" width="120" height="44" rx="8" fill="#bae6fd"/><text x="105" y="209" text-anchor="middle" class="svg-ink" font-size="13">name</text><text x="105" y="226" text-anchor="middle" class="svg-muted" font-size="11">text: ge-0/0/0</text>
<rect x="185" y="190" width="130" height="44" rx="8" fill="#bae6fd"/><text x="250" y="209" text-anchor="middle" class="svg-ink" font-size="13">oper-status</text><text x="250" y="226" text-anchor="middle" class="svg-muted" font-size="11">text: up</text>
<text x="435" y="212" text-anchor="middle" class="svg-muted" font-size="11">same shape, ge-0/0/1</text>
<line x1="320" y1="42" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="205" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="435" y2="130" stroke="#64748b" stroke-width="2"/><line x1="205" y1="162" x2="105" y2="190" stroke="#64748b" stroke-width="2"/><line x1="205" y1="162" x2="250" y2="190" stroke="#64748b" stroke-width="2"/><line x1="435" y1="162" x2="435" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Blue boxes are elements, the yellow one is an attribute, and the text values are the leaves of the tree.</p></div>

<p>Five words describe every document you will ever parse. An <b>element</b> is a tag pair with everything between them. An <b>attribute</b> is a <code>name="value"</code> pair inside the opening tag. <b>Text</b> is what sits between the tags. <b>Tail</b> is the text that follows an element's closing tag, inside its parent; in network replies it is almost always just whitespace. A <b>namespace</b> is a label (a URI) that says which vocabulary a name belongs to; chapter 3 is about it.</p>
<pre class="code">import xml.etree.ElementTree as ET

reply = """&lt;rpc-reply xmlns:junos="h&#116;tp://xml.juniper.net/junos/23.4R1/junos"&gt;
  &lt;interface-information junos:style="terse"&gt;
    &lt;!-- one block per physical port --&gt;
    &lt;physical-interface&gt;
      &lt;name&gt;ge-0/0/0&lt;/name&gt;
      &lt;oper-status&gt;up&lt;/oper-status&gt;
    &lt;/physical-interface&gt;
    &lt;physical-interface&gt;
      &lt;name&gt;ge-0/0/1&lt;/name&gt;
      &lt;oper-status&gt;down&lt;/oper-status&gt;
    &lt;/physical-interface&gt;
  &lt;/interface-information&gt;
&lt;/rpc-reply&gt;"""

root = ET.fromstring(reply)
print(root.tag, root.attrib, len(root))
info = root[0]
print(info.tag)
print(info.attrib)
port = info.find("physical-interface")
print(port.tag, repr(port.text.strip()), len(port))
print(port[0].tag, port[0].text, repr(port[0].tail))</pre>
<pre class="out">AUTO01$ python3 c1_anatomy.py
rpc-reply {} 1
interface-information
<span class="hl">{'{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style': 'terse'}</span>
physical-interface '' 2
<span class="hl">name ge-0/0/0 '\\n      '</span></pre>
<p>Read the output line by line. The root tag is a plain <code>rpc-reply</code>. The attribute key is not <code>junos:style</code> but <code>{uri}style</code>, because the prefix <code>junos</code> was only shorthand for a namespace. The first <code>physical-interface</code> has no text of its own (just whitespace, which we stripped to <code>''</code>), two children, and the whitespace after <code>name</code> is its tail. Text and tail on a single line:</p>
<pre class="code">import xml.etree.ElementTree as ET

e = ET.fromstring("&lt;name&gt;ge-0/0/0&lt;unit&gt;0&lt;/unit&gt; (uplink)&lt;/name&gt;")
print(repr(e.text), repr(e[0].text), repr(e[0].tail))</pre>
<pre class="out">AUTO01$ python3 c1_texttail.py
'ge-0/0/0' '0' ' (uplink)'</pre>
<h3>Well-formed or rejected</h3>
<ul>
<li>exactly one root element, every opening tag closed in the right order;</li>
<li>attribute values always in quotes (<code>x="1"</code>, never <code>x=1</code>);</li>
<li>the characters <code>&lt;</code> and <code>&amp;</code> in text must be written as <code>&amp;lt;</code> and <code>&amp;amp;</code>.</li>
</ul>
<p>A parser rejects a document that breaks any rule; there is no "best effort" mode in the standard library. Chapter 2 shows the error messages.</p>

<h3>Which library for what</h3>
<table class="cmp">
<tr><th>Tool</th><th>Strength</th><th>Limit</th></tr>
<tr><td><code>xml.etree.ElementTree</code></td><td>in every Python, small, enough for most replies</td><td>a small XPath subset</td></tr>
<tr><td><code>lxml</code></td><td>full XPath 1.0, parents, pretty printing</td><td>a package to install</td></tr>
<tr><td><code>xmltodict</code></td><td>a reply as a plain dict, XML built from a dict</td><td>lone items turn into dicts, not lists</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Calling <code>.text</code> on the result of <code>find()</code> without checking for <code>None</code>. Splitting XML with <code>str.split</code> or a regex "just this once". Treating a namespace prefix such as <code>junos:</code> as part of the tag name.</p></div>
<div class="exam"><p><b>Exam trap.</b> An attribute is not a child element. <code>status</code> in <code>&lt;response status="success"&gt;</code> is read with <code>.get("status")</code>, not <code>findtext("status")</code>.</p></div>

<div class="scn"><h4>The script that "worked yesterday"</h4><p>A colleague's BGP report printed an empty table after a Junos upgrade. The CLI still showed three neighbours. The reply had gained a namespace on its first child, the script searched for bare tag names, and every <code>find()</code> quietly returned nothing. Printing the root's children showed the full tag, and one helper function fixed all lookups.</p><p><b>Lesson:</b> when a lookup returns nothing, print the tags you really have before you touch the query.</p></div>

<div class="iv"><p class="q">"Why do network vendors still use XML when JSON is lighter?"</p><p>Because NETCONF and its YANG models were designed around XML: namespaces tell two vendors' data models apart, attributes carry operations such as merge or delete, and schemas can validate a document. JSON came later and RESTCONF offers both. A strong answer adds that the engineer's job is the same either way: parse defensively and check the result.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XML is a tree of elements; attributes and text hang off them.</li>
<li>A prefix like <code>junos:</code> is shorthand for a namespace URI; the parser reports <code>{uri}name</code>.</li>
<li>Junos, NETCONF and PAN-OS each shape their replies differently.</li>
<li>ElementTree for most work, lxml for full XPath, xmltodict for a dict view.</li>
<li>When a lookup returns nothing, print the real tags first.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> bahut saara network gear aaj bhi XML mein jawab deta hai, aur jab pehli baar ek bhare hue reply par <code>find()</code> <code>None</code> deta hai to lagta hai Python mein bug hai. Bug nahi hai. XML apne design ke hisaab se kaam kar raha hai. Yeh module tumhe XML padhna, query karna, banana aur us par bharosa karna sikhata hai.</p>

<h3>Is module mein aap kya seekhoge</h3>
<ul>
<li>Kisi bhi reply ki anatomy padhna: elements, attributes, text, tail aur namespaces.</li>
<li><b>xml.etree.ElementTree</b> se parse aur search karna (<code>fromstring</code>, <code>find</code>, <code>findall</code>, <code>findtext</code>, <code>iter</code>).</li>
<li><b>Namespaces</b> sambhalna taaki Junos aur NETCONF replies <code>None</code> dena band karein.</li>
<li><b>lxml</b> se asli <b>XPath</b> sawal puchhna aur jaanna ki standard library kya nahi kar sakti.</li>
<li><b>xmltodict</b> se reply ko dictionaries mein badalna aur uske single-item-versus-list jaal se bachna.</li>
<li>RPC requests surakshit tarike se banana, aur Junos, IOS XE aur PAN-OS replies par bharosa karne se pehle unki sanity check karna.</li>
</ul>

<h3>Prerequisites</h3>
<p>Tumne <b>auto-formats</b> (JSON, YAML aur XML ki pehli jhalak), <b>auto-parse</b>, <b>auto-requests</b>, <b>auto-ssh</b> aur <b>py-textfsm</b> khatam kiye hone chahiye. Yeh module nkmiko-style SSH sessions aur <code>requests</code> ko dobara nahi sikhata. Sister modules <b>adv-nkmiko</b> (multivendor SSH) aur <b>adv-netconf</b> (ncclient se NETCONF) is ke baju mein hain: woh XML laate hain, yeh module sikhata hai ki us ka karna kya hai.</p>

<h3>Analogy: chhape hue labels wala form</h3>
<p><code>show interfaces</code> ka text reply haath se likha note hai: tum shabdon ki position dekh kar port dhoondhte ho. XML reply ek <b>chhapa hua form</b> hai. Har dabbe par label chhapa hota hai, dabbe bade dabbon ke andar hote hain, aur kuch labels par stamp (attributes) lagi hoti hai. Tum columns nahi ginte; tum puchhte ho "<i>physical-interface</i> naam ke dabbe ke andar <i>oper-status</i> naam wala dabba". Isi wajah se vendors ne machine-to-machine replies ke liye ise chuna, aur isi wajah se yeh screen scraping se kahin behtar software upgrades jhel leta hai.</p>

<h3>XML tum kahan miloge</h3>
<table class="cmp">
<tr><th>Source</th><th>Kaise milta hai</th><th>Shape</th></tr>
<tr><td>Junos</td><td>SSH par <code>show ... | display xml</code>, ya NETCONF RPC</td><td><code>rpc-reply</code>, child apne namespace mein</td></tr>
<tr><td>IOS XE, NETCONF</td><td>ncclient ya raw NETCONF session</td><td>NETCONF namespace mein <code>rpc-reply</code>, andar YANG data</td></tr>
<tr><td>PAN-OS</td><td><code>requests</code> se XML API</td><td><code>response status="..." code="..."</code>, koi namespace nahi</td></tr>
</table>
<p>FortiOS aur Cisco ASA REST API JSON mein jawab dete hain, isliye woh yahan nahi aate; XML bolne wala firewall PAN-OS API hai.</p>

<h3>Reply ki anatomy</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Junos interface reply ka tree">
<rect x="250" y="10" width="140" height="32" rx="8" fill="#bae6fd"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">rpc-reply</text>
<text x="400" y="31" class="svg-muted" font-size="11">root element</text>
<rect x="225" y="70" width="190" height="32" rx="8" fill="#bae6fd"/><text x="320" y="91" text-anchor="middle" class="svg-ink" font-size="13">interface-information</text>
<rect x="425" y="73" width="205" height="26" rx="8" fill="#fde68a"/><text x="527" y="90" text-anchor="middle" class="svg-ink" font-size="11">junos:style="terse" (attribute)</text>
<rect x="120" y="130" width="170" height="32" rx="8" fill="#bae6fd"/><text x="205" y="151" text-anchor="middle" class="svg-ink" font-size="13">physical-interface</text>
<rect x="350" y="130" width="170" height="32" rx="8" fill="#bae6fd"/><text x="435" y="151" text-anchor="middle" class="svg-ink" font-size="13">physical-interface</text>
<rect x="45" y="190" width="120" height="44" rx="8" fill="#bae6fd"/><text x="105" y="209" text-anchor="middle" class="svg-ink" font-size="13">name</text><text x="105" y="226" text-anchor="middle" class="svg-muted" font-size="11">text: ge-0/0/0</text>
<rect x="185" y="190" width="130" height="44" rx="8" fill="#bae6fd"/><text x="250" y="209" text-anchor="middle" class="svg-ink" font-size="13">oper-status</text><text x="250" y="226" text-anchor="middle" class="svg-muted" font-size="11">text: up</text>
<text x="435" y="212" text-anchor="middle" class="svg-muted" font-size="11">wahi shape, ge-0/0/1</text>
<line x1="320" y1="42" x2="320" y2="70" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="205" y2="130" stroke="#64748b" stroke-width="2"/><line x1="320" y1="102" x2="435" y2="130" stroke="#64748b" stroke-width="2"/><line x1="205" y1="162" x2="105" y2="190" stroke="#64748b" stroke-width="2"/><line x1="205" y1="162" x2="250" y2="190" stroke="#64748b" stroke-width="2"/><line x1="435" y1="162" x2="435" y2="195" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Neele dabbe elements hain, peela attribute hai, aur text values tree ke patte hain.</p></div>

<p>Paanch shabd har document ko describe karte hain jo tum kabhi parse karoge. <b>Element</b> ek tag pair hai aur unke beech ka sab kuch. <b>Attribute</b> opening tag ke andar <code>name="value"</code> jodi hai. <b>Text</b> woh hai jo tags ke beech baithta hai. <b>Tail</b> woh text hai jo element ke closing tag ke baad, uske parent ke andar aata hai; network replies mein yeh lagbhag hamesha sirf whitespace hota hai. <b>Namespace</b> ek label (URI) hai jo batata hai ki naam kis vocabulary ka hai; chapter 3 isi ke baare mein hai.</p>
<pre class="code">import xml.etree.ElementTree as ET

reply = """&lt;rpc-reply xmlns:junos="h&#116;tp://xml.juniper.net/junos/23.4R1/junos"&gt;
  &lt;interface-information junos:style="terse"&gt;
    &lt;!-- one block per physical port --&gt;
    &lt;physical-interface&gt;
      &lt;name&gt;ge-0/0/0&lt;/name&gt;
      &lt;oper-status&gt;up&lt;/oper-status&gt;
    &lt;/physical-interface&gt;
    &lt;physical-interface&gt;
      &lt;name&gt;ge-0/0/1&lt;/name&gt;
      &lt;oper-status&gt;down&lt;/oper-status&gt;
    &lt;/physical-interface&gt;
  &lt;/interface-information&gt;
&lt;/rpc-reply&gt;"""

root = ET.fromstring(reply)
print(root.tag, root.attrib, len(root))
info = root[0]
print(info.tag)
print(info.attrib)
port = info.find("physical-interface")
print(port.tag, repr(port.text.strip()), len(port))
print(port[0].tag, port[0].text, repr(port[0].tail))</pre>
<pre class="out">AUTO01$ python3 c1_anatomy.py
rpc-reply {} 1
interface-information
<span class="hl">{'{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style': 'terse'}</span>
physical-interface '' 2
<span class="hl">name ge-0/0/0 '\\n      '</span></pre>
<p>Output line by line padho. Root tag seedha <code>rpc-reply</code> hai. Attribute key <code>junos:style</code> nahi balki <code>{uri}style</code> hai, kyunki prefix <code>junos</code> sirf namespace ka shorthand tha. Pehle <code>physical-interface</code> ka apna koi text nahi hai (sirf whitespace, jo humne strip karke <code>''</code> kar diya), do children hain, aur <code>name</code> ke baad ki whitespace uska tail hai. Text aur tail ek hi line mein:</p>
<pre class="code">import xml.etree.ElementTree as ET

e = ET.fromstring("&lt;name&gt;ge-0/0/0&lt;unit&gt;0&lt;/unit&gt; (uplink)&lt;/name&gt;")
print(repr(e.text), repr(e[0].text), repr(e[0].tail))</pre>
<pre class="out">AUTO01$ python3 c1_texttail.py
'ge-0/0/0' '0' ' (uplink)'</pre>
<h3>Well-formed ya reject</h3>
<ul>
<li>sirf ek root element, har opening tag sahi order mein band;</li>
<li>attribute values hamesha quotes mein (<code>x="1"</code>, kabhi <code>x=1</code> nahi);</li>
<li>text mein <code>&lt;</code> aur <code>&amp;</code> characters ko <code>&amp;lt;</code> aur <code>&amp;amp;</code> likhna padta hai.</li>
</ul>
<p>Parser ek bhi rule todne wale document ko reject kar deta hai; standard library mein "best effort" mode nahi hota. Chapter 2 error messages dikhata hai.</p>

<h3>Kaunsi library kis kaam ki</h3>
<table class="cmp">
<tr><th>Tool</th><th>Taqat</th><th>Seema</th></tr>
<tr><td><code>xml.etree.ElementTree</code></td><td>har Python mein, chhota, zyada tar replies ke liye kaafi</td><td>XPath ka chhota subset</td></tr>
<tr><td><code>lxml</code></td><td>poora XPath 1.0, parents, pretty printing</td><td>install karne wala package</td></tr>
<tr><td><code>xmltodict</code></td><td>reply ek plain dict ki tarah, dict se XML banana</td><td>akela item list ki jagah dict ban jaata hai</td></tr>
</table>

<div class="warn"><p><b>Aam galtiyan.</b> <code>find()</code> ke result par <code>None</code> check kiye bina <code>.text</code> call karna. "bas ek baar" ke liye XML ko <code>str.split</code> ya regex se todna. <code>junos:</code> jaise namespace prefix ko tag name ka hissa samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Attribute child element nahi hota. <code>&lt;response status="success"&gt;</code> mein <code>status</code> ko <code>.get("status")</code> se padhte hain, <code>findtext("status")</code> se nahi.</p></div>

<div class="scn"><h4>Woh script jo "kal chal rahi thi"</h4><p>Ek colleague ki BGP report Junos upgrade ke baad khaali table print karne lagi. CLI abhi bhi teen neighbours dikha raha tha. Reply ke pehle child par namespace aa gaya tha, script bare tag names dhoondh rahi thi, aur har <code>find()</code> chupchaap kuch nahi de raha tha. Root ke children print karne se poora tag dikha, aur ek helper function ne saare lookups theek kar diye.</p><p><b>Seekh:</b> jab lookup kuch na de, query chhedne se pehle print karo ki asli tags kaun se hain.</p></div>

<div class="iv"><p class="q">"JSON halka hai, phir bhi network vendors XML kyon use karte hain?"</p><p>Kyunki NETCONF aur uske YANG models XML ke around design hue the: namespaces do vendors ke data models ko alag karte hain, attributes merge ya delete jaise operations le jaate hain, aur schemas document ko validate kar sakte hain. JSON baad mein aaya aur RESTCONF dono deta hai. Mazboot jawab mein yeh bhi jodo ki engineer ka kaam dono mein wahi hai: defensively parse karo aur result check karo.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>XML elements ka tree hai; attributes aur text unse latke hote hain.</li>
<li><code>junos:</code> jaisa prefix namespace URI ka shorthand hai; parser <code>{uri}name</code> report karta hai.</li>
<li>Junos, NETCONF aur PAN-OS har ek apne reply ko alag shape deta hai.</li>
<li>Zyada kaam ke liye ElementTree, poore XPath ke liye lxml, dict view ke liye xmltodict.</li>
<li>Lookup kuch na de to pehle asli tags print karo.</li>
</ul></div>
`}};export{e as default};