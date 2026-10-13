var e={id:`troubleshooting`,h:{en:`Troubleshooting XML parsers: four faults, one method`,hi:`XML parsers ka troubleshooting: chaar faults, ek tareeka`},body:{en:`
<p><b>The idea of this chapter:</b> XML parsing bugs rarely raise an error. They return <code>None</code>, an empty list or the wrong type, and the report quietly goes wrong. The method is always the same: read the output, look at the real XML, probe one fact, fix one thing, run again. This chapter walks Lab 2 with that method.</p>

<h3>The method</h3>
<ol>
<li><b>Read</b> the output: which check, what was got, what was wanted.</li>
<li><b>Look</b> at the real XML with <code>head</code> or <code>grep</code>.</li>
<li><b>Probe</b> one fact in a three-line script.</li>
<li><b>Fix</b> one thing, run again, watch the count of failures drop.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The troubleshooting loop">
<rect x="10" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="75" y="71" text-anchor="middle" class="svg-ink" font-size="13">1  Read</text>
<text x="75" y="87" text-anchor="middle" class="svg-muted" font-size="11">the output</text>
<rect x="170" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="235" y="71" text-anchor="middle" class="svg-ink" font-size="13">2  Look</text>
<text x="235" y="87" text-anchor="middle" class="svg-muted" font-size="11">head / grep</text>
<rect x="330" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="395" y="71" text-anchor="middle" class="svg-ink" font-size="13">3  Probe</text>
<text x="395" y="87" text-anchor="middle" class="svg-muted" font-size="11">print tags, types</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/>
<text x="560" y="71" text-anchor="middle" class="svg-ink" font-size="13">4  Fix</text>
<text x="560" y="87" text-anchor="middle" class="svg-muted" font-size="11">run again</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="170,75 162,78 162,71" fill="#64748b"/>
<line x1="300" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="330,75 322,78 322,71" fill="#64748b"/>
<line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="490,75 482,78 482,71" fill="#64748b"/>
</svg><p class="cap">One fault per lap. The failure count drops from four to zero.</p></div>
<h3>The first run</h3>
<p><code>parse_replies.py</code> holds four small parsers and checks each against a saved reply:</p>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    WRONG  got []</span>
                      want [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]
<span class="hl">xe addresses   WRONG  got []</span>
                      want ['10.99.0.1', '192.0.2.1']
<span class="hl">pan addresses  ERROR  TypeError: string indices must be integers or slices, not str</span>
<span class="hl">pan reply      WRONG  got (None, None)</span>
                      want ('error', '17')
<span class="hl">4 of 4 checks failed</span></pre>
<p>Four failures, four different symptoms: two empty results, one exception, one pair of <code>None</code>. Take them one at a time, from the top.</p>

<h3>Fault 1: an empty list from a namespace</h3>
<pre class="code">def q(name):
    return name</pre>
<pre class="out">AUTO01$ grep -n xmlns junos_bgp.xml
1:&lt;rpc-reply xmlns:junos="h&#116;tp://xml.juniper.net/junos/23.4R1/junos"&gt;
<span class="hl">2:    &lt;bgp-information xmlns="h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"&gt;</span></pre>
<pre class="code">root = ET.parse("junos_bgp.xml").getroot()
print(root.tag)
print([child.tag for child in root])</pre>
<pre class="out">AUTO01$ python3 c9_diag1.py
rpc-reply
<span class="hl">['{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}bgp-information', 'cli']</span></pre>
<p><code>grep</code> shows that <code>bgp-information</code> declares a default namespace. The probe confirms ElementTree sees the child as <code>{...junos-routing}bgp-information</code>, while the helper <code>q()</code> returns a bare name. This is chapter 3 again. The fix is to make <code>q()</code> return <code>"{" + BGP_NS + "}" + name</code>. The wildcard <code>{*}</code> would also work and survives a release upgrade.</p>
<pre class="out">AUTO01$ sed -i 's|^    return name$|    return "{" + BGP_NS + "}" + name|' parse_replies.py</pre>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    ok     got [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]</span>
xe addresses   WRONG  got []
                      want ['10.99.0.1', '192.0.2.1']
pan addresses  ERROR  TypeError: string indices must be integers or slices, not str
pan reply      WRONG  got (None, None)
                      want ('error', '17')
<span class="hl">3 of 4 checks failed</span></pre>

<h3>Fault 2: an XPath that starts in the wrong place</h3>
<pre class="code">    return root.xpath("/if:interfaces/if:interface/ip:ipv4/ip:address/ip:ip/text()", namespaces=NS)</pre>
<pre class="code">root = etree.parse("xe_ifaces.xml").getroot()
print(root.tag)
print(root.xpath("/if:interfaces", namespaces=NS))
print(len(root.xpath("/nc:rpc-reply/nc:data/if:interfaces/if:interface", namespaces=NS)))
print(len(root.xpath("//if:interface", namespaces=NS)))</pre>
<pre class="out">AUTO01$ python3 c9_diag2.py
{urn:ietf:params:xml:ns:netconf:base:1.0}rpc-reply
[]
5
5</pre>
<p>Look at the first line of the probe's output: the root is <code>rpc-reply</code>, not <code>interfaces</code>. A path starting with a single <code>/</code> begins at the root, so <code>/if:interfaces</code> asks "is the root an interfaces element?" and gets <code>[]</code>. The explicit path from the root and <code>//if:interface</code> both find five. Change the leading <code>/</code> to <code>//</code>. The prefixes were fine all along: a wrong path and a wrong namespace look the same from outside.</p>
<pre class="out">AUTO01$ sed -i 's|root.xpath("/if:interfaces|root.xpath("//if:interfaces|' parse_replies.py</pre>

<h3>Fault 3: a dict where a list was expected</h3>
<pre class="code">    entries = doc["response"]["result"]["address"]["entry"]
    return [e["@name"] for e in entries]</pre>
<pre class="code">doc = xmltodict.parse(open("pan_addr_one.xml").read())
entries = doc["response"]["result"]["address"]["entry"]
print(type(entries).__name__)
print(entries)</pre>
<pre class="out">AUTO01$ python3 c9_diag3.py
<span class="hl">dict</span>
{'@name': 'web1', 'ip-netmask': '10.20.0.10/32', 'description': 'web server'}</pre>
<p>The exception is the clue: <code>string indices must be integers or slices, not str</code> means <code>e</code> is a string, so <code>entries</code> is a dict being iterated by key. The saved reply has exactly one address object, and chapter 5 told you what that does. Add <code>force_list=("entry",)</code> to the <code>parse</code> call.</p>
<pre class="out">AUTO01$ sed -i 's|xmltodict.parse(open(path).read())|xmltodict.parse(open(path).read(), force_list=("entry",))|' parse_replies.py</pre>

<h3>Fault 4: an attribute read as text</h3>
<pre class="code">    return root.findtext("status"), root.findtext("code")</pre>
<pre class="code">root = ET.parse("pan_bgp.xml").getroot()
print(root.attrib)
print(root.findtext("status"), root.findtext("code"))
print(root.get("status"), root.get("code"))</pre>
<pre class="out">AUTO01$ python3 c9_diag4.py
{'status': 'error', 'code': '17'}
None None
error 17</pre>
<p><code>root.attrib</code> shows <code>status</code> and <code>code</code> sitting in the start tag, so they are attributes of <code>response</code>, not child elements. <code>findtext</code> looks for children and finds none; <code>get</code> reads attributes. Replace both calls with <code>root.get(...)</code>.</p>
<pre class="out">AUTO01$ sed -i 's|root.findtext("status"), root.findtext("code")|root.get("status"), root.get("code")|' parse_replies.py</pre>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    ok     got [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]</span>
<span class="hl">xe addresses   ok     got ['10.99.0.1', '192.0.2.1']</span>
<span class="hl">pan addresses  ok     got ['web1']</span>
<span class="hl">pan reply      ok     got ('error', '17')</span>
<span class="hl">all checks ok</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Fixing by trial and error without printing a tag, an attribute or a type first. Fixing two things at once, so you cannot tell which one worked. Assuming a silent empty result means the data is absent.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom to cause: <code>None</code> or <code>[]</code> from a valid file is usually a namespace or a path; a <code>TypeError</code> on indexing is a dict-for-list; <code>None</code> from <code>findtext</code> on a status field is an attribute.</p></div>

<div class="scn"><h4>Four bugs, one afternoon</h4><p>A colleague's report printed empty tables for two vendors and crashed on a third. Instead of rewriting it, we added a probe script that printed the root tag, the child tags and the type of each parsed value. Within an hour each of the four faults had a one-line fix, and the probe became a unit test with saved replies.</p><p><b>Lesson:</b> measure the data before you change the code.</p></div>

<div class="iv"><p class="q">A parser that worked yesterday returns an empty list today. What do you check first?</p><p>I look at the raw reply: did the root or a namespace URI change, for example a new Junos release in the URI? Then I print the tags the parser actually sees and compare them with my query. If the structure is the same, I check the types, because a single item can switch a list to a dict.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read, look, probe, fix, run again: one change at a time.</li>
<li>Empty result from valid XML: namespace or path.</li>
<li>Wrong type: dict for list, fixed by <code>force_list</code>.</li>
<li><code>None</code> from <code>findtext</code>: it is an attribute, use <code>get</code>.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> XML parsing ke bugs shayad hi error dete hain. Woh <code>None</code>, khaali list ya galat type lautate hain, aur report chupchap galat ho jaati hai. Tareeka hamesha wahi: output padho, asli XML dekho, ek fact probe karo, ek cheez theek karo, phir chalao. Yeh chapter Lab 2 ko isi tareeke se chalata hai.</p>

<h3>Tareeka</h3>
<ol>
<li><b>Padho</b> output: kaun si check, kya mila, kya chahiye tha.</li>
<li><b>Dekho</b> asli XML <code>head</code> ya <code>grep</code> se.</li>
<li><b>Probe karo</b> ek fact teen-line ki script se.</li>
<li><b>Theek karo</b> ek cheez, phir chalao, failures ki ginti ghatte dekho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting ka loop">
<rect x="10" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="75" y="71" text-anchor="middle" class="svg-ink" font-size="13">1  Padho</text>
<text x="75" y="87" text-anchor="middle" class="svg-muted" font-size="11">output</text>
<rect x="170" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="235" y="71" text-anchor="middle" class="svg-ink" font-size="13">2  Dekho</text>
<text x="235" y="87" text-anchor="middle" class="svg-muted" font-size="11">head / grep</text>
<rect x="330" y="40" width="130" height="70" rx="10" fill="#bae6fd"/>
<text x="395" y="71" text-anchor="middle" class="svg-ink" font-size="13">3  Probe</text>
<text x="395" y="87" text-anchor="middle" class="svg-muted" font-size="11">tags, types print</text>
<rect x="490" y="40" width="140" height="70" rx="10" fill="#bbf7d0"/>
<text x="560" y="71" text-anchor="middle" class="svg-ink" font-size="13">4  Fix</text>
<text x="560" y="87" text-anchor="middle" class="svg-muted" font-size="11">phir chalao</text>
<line x1="140" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="170,75 162,78 162,71" fill="#64748b"/>
<line x1="300" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="330,75 322,78 322,71" fill="#64748b"/>
<line x1="460" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
<polygon points="490,75 482,78 482,71" fill="#64748b"/>
</svg><p class="cap">Ek lap mein ek fault. Failures chaar se zero tak ghatte hain.</p></div>
<h3>Pehla run</h3>
<p><code>parse_replies.py</code> mein chaar chhote parsers hain aur har ek ko saved reply ke against check karta hai:</p>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    WRONG  got []</span>
                      want [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]
<span class="hl">xe addresses   WRONG  got []</span>
                      want ['10.99.0.1', '192.0.2.1']
<span class="hl">pan addresses  ERROR  TypeError: string indices must be integers or slices, not str</span>
<span class="hl">pan reply      WRONG  got (None, None)</span>
                      want ('error', '17')
<span class="hl">4 of 4 checks failed</span></pre>
<p>Chaar failures, chaar alag lakshan: do khaali results, ek exception, ek <code>None</code> ka jodi. Ek ek karke lo, upar se.</p>

<h3>Fault 1: namespace se khaali list</h3>
<pre class="code">def q(name):
    return name</pre>
<pre class="out">AUTO01$ grep -n xmlns junos_bgp.xml
1:&lt;rpc-reply xmlns:junos="h&#116;tp://xml.juniper.net/junos/23.4R1/junos"&gt;
<span class="hl">2:    &lt;bgp-information xmlns="h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"&gt;</span></pre>
<pre class="code">root = ET.parse("junos_bgp.xml").getroot()
print(root.tag)
print([child.tag for child in root])</pre>
<pre class="out">AUTO01$ python3 c9_diag1.py
rpc-reply
<span class="hl">['{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}bgp-information', 'cli']</span></pre>
<p><code>grep</code> dikhata hai ki <code>bgp-information</code> default namespace declare karta hai. Probe confirm karta hai ki ElementTree child ko <code>{...junos-routing}bgp-information</code> ki tarah dekhta hai, jabki helper <code>q()</code> sirf naam lautata hai. Yeh phir chapter 3 hai. Fix hai <code>q()</code> se <code>"{" + BGP_NS + "}" + name</code> lautana. Wildcard <code>{*}</code> bhi chalta aur release upgrade mein bacha rehta.</p>
<pre class="out">AUTO01$ sed -i 's|^    return name$|    return "{" + BGP_NS + "}" + name|' parse_replies.py</pre>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    ok     got [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]</span>
xe addresses   WRONG  got []
                      want ['10.99.0.1', '192.0.2.1']
pan addresses  ERROR  TypeError: string indices must be integers or slices, not str
pan reply      WRONG  got (None, None)
                      want ('error', '17')
<span class="hl">3 of 4 checks failed</span></pre>

<h3>Fault 2: XPath jo galat jagah se shuru hoti hai</h3>
<pre class="code">    return root.xpath("/if:interfaces/if:interface/ip:ipv4/ip:address/ip:ip/text()", namespaces=NS)</pre>
<pre class="code">root = etree.parse("xe_ifaces.xml").getroot()
print(root.tag)
print(root.xpath("/if:interfaces", namespaces=NS))
print(len(root.xpath("/nc:rpc-reply/nc:data/if:interfaces/if:interface", namespaces=NS)))
print(len(root.xpath("//if:interface", namespaces=NS)))</pre>
<pre class="out">AUTO01$ python3 c9_diag2.py
{urn:ietf:params:xml:ns:netconf:base:1.0}rpc-reply
[]
5
5</pre>
<p>Probe ke output ki pehli line dekho: root <code>rpc-reply</code> hai, <code>interfaces</code> nahi. Ek <code>/</code> se shuru hone wala path root se shuru hota hai, isliye <code>/if:interfaces</code> poochta hai "kya root interfaces element hai?" aur <code>[]</code> paata hai. Root se explicit path aur <code>//if:interface</code> dono paanch dhoondhte hain. Shuruaati <code>/</code> ko <code>//</code> karo. Prefixes shuru se theek the: galat path aur galat namespace bahar se ek jaise dikhte hain.</p>
<pre class="out">AUTO01$ sed -i 's|root.xpath("/if:interfaces|root.xpath("//if:interfaces|' parse_replies.py</pre>

<h3>Fault 3: list ki jagah dict</h3>
<pre class="code">    entries = doc["response"]["result"]["address"]["entry"]
    return [e["@name"] for e in entries]</pre>
<pre class="code">doc = xmltodict.parse(open("pan_addr_one.xml").read())
entries = doc["response"]["result"]["address"]["entry"]
print(type(entries).__name__)
print(entries)</pre>
<pre class="out">AUTO01$ python3 c9_diag3.py
<span class="hl">dict</span>
{'@name': 'web1', 'ip-netmask': '10.20.0.10/32', 'description': 'web server'}</pre>
<p>Exception hi suraag hai: <code>string indices must be integers or slices, not str</code> ka matlab <code>e</code> string hai, yaani <code>entries</code> ek dict hai jise key se iterate kiya ja raha hai. Saved reply mein theek ek address object hai, aur chapter 5 ne bataya tha ki iska kya hota hai. <code>parse</code> call mein <code>force_list=("entry",)</code> jodo.</p>
<pre class="out">AUTO01$ sed -i 's|xmltodict.parse(open(path).read())|xmltodict.parse(open(path).read(), force_list=("entry",))|' parse_replies.py</pre>

<h3>Fault 4: attribute ko text ki tarah padhna</h3>
<pre class="code">    return root.findtext("status"), root.findtext("code")</pre>
<pre class="code">root = ET.parse("pan_bgp.xml").getroot()
print(root.attrib)
print(root.findtext("status"), root.findtext("code"))
print(root.get("status"), root.get("code"))</pre>
<pre class="out">AUTO01$ python3 c9_diag4.py
{'status': 'error', 'code': '17'}
None None
error 17</pre>
<p><code>root.attrib</code> dikhata hai ki <code>status</code> aur <code>code</code> start tag mein baithe hain, yaani <code>response</code> ke attributes hain, child elements nahi. <code>findtext</code> children dhoondhta hai aur kuch nahi paata; <code>get</code> attributes padhta hai. Dono calls ko <code>root.get(...)</code> se badlo.</p>
<pre class="out">AUTO01$ sed -i 's|root.findtext("status"), root.findtext("code")|root.get("status"), root.get("code")|' parse_replies.py</pre>
<pre class="out">AUTO01$ python3 parse_replies.py
<span class="hl">junos peers    ok     got [('10.99.0.12+179', 'Established'), ('10.99.0.13+179', 'Idle'), ('10.99.0.99+179', 'Active')]</span>
<span class="hl">xe addresses   ok     got ['10.99.0.1', '192.0.2.1']</span>
<span class="hl">pan addresses  ok     got ['web1']</span>
<span class="hl">pan reply      ok     got ('error', '17')</span>
<span class="hl">all checks ok</span></pre>

<div class="warn"><p><b>Aam galtiyan.</b> Tag, attribute ya type print kiye bina andaze se fix karna. Ek saath do cheezein theek karna, taaki pata na chale kisne kaam kiya. Yeh maan lena ki chupchap khaali result ka matlab data nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Lakshan se kaaran: valid file se <code>None</code> ya <code>[]</code> aam taur par namespace ya path hai; indexing par <code>TypeError</code> list ki jagah dict hai; status field par <code>findtext</code> se <code>None</code> attribute hai.</p></div>

<div class="scn"><h4>Chaar bugs, ek dopahar</h4><p>Ek saathi ki report do vendors ke liye khaali tables chhapti thi aur teesre par crash hoti thi. Use dobara likhne ke bajaye humne ek probe script jodi jo root tag, child tags aur har parse hui value ka type chhapti thi. Ek ghante mein chaaron faults ka ek-line fix mil gaya, aur probe saved replies ke saath unit test ban gaya.</p><p><b>Seekh:</b> code badalne se pehle data napo.</p></div>

<div class="iv"><p class="q">Jo parser kal chalta tha aaj khaali list deta hai. Pehle kya check karte ho?</p><p>Main raw reply dekhta hoon: kya root ya namespace URI badla, jaise URI mein naya Junos release? Phir parser jo tags asal mein dekhta hai unhe print karke apni query se milata hoon. Structure wahi ho to types check karta hoon, kyunki ek akela item list ko dict mein badal sakta hai.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Padho, dekho, probe karo, theek karo, phir chalao: ek samay mein ek badlaav.</li>
<li>Valid XML se khaali result: namespace ya path.</li>
<li>Galat type: list ki jagah dict, <code>force_list</code> se theek.</li>
<li><code>findtext</code> se <code>None</code>: woh attribute hai, <code>get</code> use karo.</li>
</ul></div>
`}};export{e as default};