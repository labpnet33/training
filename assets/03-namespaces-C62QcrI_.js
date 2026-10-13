var e={id:`namespaces`,h:{en:`Namespaces: why find() returns None and how to fix it`,hi:`Namespaces: find() None kyun deta hai aur theek kaise karein`},body:{en:`
<p><b>The idea of this chapter:</b> in Python a name is just text, but in XML a name can belong to a vocabulary. If your query forgets the vocabulary, the parser answers honestly: "no such element". Namespaces cause most of the "it works on the sample, not on the device" bugs in this module.</p>

<h3>Analogy: surnames</h3>
<p>There are many people called Amit. "Amit Sharma" and "Amit Verma" are different people because the surname says which family. Inside a NETCONF reply, <code>name</code> may mean the interface name (from the ietf-interfaces model) or something from another model. The <b>namespace</b>, a URI such as <code>urn:ietf:params:xml:ns:yang:ietf-interfaces</code>, is the surname. The URI is only an identifier; nothing is downloaded from it.</p>

<h3>How a namespace is declared</h3>
<ul>
<li><code>xmlns="URI"</code> sets the <b>default</b> namespace for that element and everything inside it.</li>
<li><code>xmlns:junos="URI"</code> defines a <b>prefix</b>; only names written <code>junos:style</code> use it.</li>
<li>A declaration holds from that element downwards, and a child may declare a different one. The prefix is a local nickname; only the URI matters.</li>
</ul>
<pre class="out"><span class="hl">&lt;rpc-reply message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;</span>
  &lt;data&gt;
<span class="hl">    &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;</span>
      &lt;interface&gt;
        &lt;name&gt;GigabitEthernet0/0&lt;/name&gt;
<span class="hl">        &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:ethernetCsmacd&lt;/type&gt;</span>
        &lt;enabled&gt;true&lt;/enabled&gt;
<span class="hl">        &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;</span>
          &lt;address&gt;
            &lt;ip&gt;10.99.0.1&lt;/ip&gt;
            &lt;netmask&gt;255.255.255.0&lt;/netmask&gt;
          &lt;/address&gt;
        &lt;/ipv4&gt;
...</pre>
<p>This IOS XE reply changes namespace twice in six lines: the envelope is NETCONF base, <code>interfaces</code> belongs to ietf-interfaces, and <code>ipv4</code> to ietf-ip. To a parser these are three different vocabularies.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Three namespaces in one NETCONF reply">
<rect x="10" y="10" width="620" height="170" rx="12" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">rpc-reply, data  (NETCONF base namespace)</text>
<rect x="40" y="46" width="560" height="124" rx="12" fill="#bae6fd"/><text x="54" y="68" class="svg-ink" font-size="13">interfaces, interface, name, enabled  (ietf-interfaces)</text>
<rect x="70" y="84" width="500" height="76" rx="12" fill="#bbf7d0"/><text x="84" y="106" class="svg-ink" font-size="13">ipv4, address, ip, netmask  (ietf-ip)</text>
<text x="84" y="132" class="svg-muted" font-size="11">{urn:ietf:params:xml:ns:yang:ietf-ip}ipv4</text>
</svg><p class="cap">Each box is a different namespace; a query must name the one it wants.</p></div>

<h3>What the parser hands you</h3>
<p>ElementTree does not keep prefixes. It writes the full name as <code>{uri}local</code>. Here is the Junos BGP reply, where the root has no namespace but its first child does:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
print(root.tag)
print([child.tag for child in root])
print(root.find("bgp-information"))
print(root.findall("bgp-information/bgp-peer"))
print(root.findall(".//bgp-peer"))</pre>
<pre class="out">AUTO01$ python3 c3_none.py
rpc-reply
['{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}bgp-information', 'cli']
<span class="hl">None</span>
<span class="hl">[]</span>
<span class="hl">[]</span></pre>
<p>Every query came back empty because <code>bgp-information</code> is not the same name as <code>{...junos-routing}bgp-information</code>. Nothing is wrong with the reply and nothing raised an error. That silence is the trap.</p>

<h3>Three ways to ask correctly</h3>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
ns = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}

peers = root.findall("rt:bgp-information/rt:bgp-peer", ns)
print(len(peers))
for peer in peers:
    print(peer.findtext("rt:peer-address", namespaces=ns), peer.findtext("rt:peer-state", namespaces=ns))

# the same thing, spelled with the full name in curly braces
rt = "{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}"
print(len(root.findall(rt + "bgp-information/" + rt + "bgp-peer")))

# and with the wildcard (Python 3.8+): any namespace, or none
print(len(root.findall("{*}bgp-information/{*}bgp-peer")))
print(len(root.findall(".//{*}bgp-peer")))</pre>
<pre class="out">AUTO01$ python3 c3_ns.py
3
10.99.0.12+179 Established
10.99.0.13+179 Idle
10.99.0.99+179 Active
3
3
3</pre>
<ol>
<li><b>A prefix map.</b> Pass a dict as the second argument of <code>find</code>/<code>findall</code> or as <code>namespaces=</code> to <code>findtext</code>. The prefix (<code>rt</code>) is yours; only the URI must match the document. The map is only for your query, not an edit of the document.</li>
<li><b>The full name in braces.</b> Verbose but explicit.</li>
<li><b>The wildcard <code>{*}</code>.</b> Matches the tag in any namespace, or none. It also survives a Junos upgrade, because the release number sits inside the URI (<code>.../junos/23.4R1/junos-routing</code>) and changes from release to release.</li>
</ol>
<p>The values still end in <code>+179</code>: Junos writes the peer's TCP port after the address in the detailed view. Strip it with <code>split("+")[0]</code>.</p>

<h3>Attributes have namespaces too</h3>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
peer = root.find(".//{*}bgp-peer")
print(peer.attrib)
print(peer.get("junos:style"))
print(peer.get("{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style"))</pre>
<pre class="out">AUTO01$ python3 c3_attr.py
{'{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style': 'detail'}
<span class="hl">None</span>
detail</pre>
<p><code>junos:style</code> is an attribute in the <code>junos</code> namespace. An un-prefixed attribute has no namespace; a prefixed one does. Elements inherit the default namespace, <b>attributes never do</b>.</p>

<h3>A NETCONF reply with a helper</h3>
<pre class="code">import xml.etree.ElementTree as ET

NS = {
    "nc": "urn:ietf:params:xml:ns:netconf:base:1.0",
    "if": "urn:ietf:params:xml:ns:yang:ietf-interfaces",
    "ip": "urn:ietf:params:xml:ns:yang:ietf-ip",
}
root = ET.parse("xe_ifaces.xml").getroot()
for itf in root.findall("nc:data/if:interfaces/if:interface", NS):
    name = itf.findtext("if:name", namespaces=NS)
    enabled = itf.findtext("if:enabled", namespaces=NS)
    ip = itf.findtext("ip:ipv4/ip:address/ip:ip", namespaces=NS)
    print(f"{name:&lt;20} enabled={enabled:&lt;5} ip={ip}")</pre>
<pre class="out">AUTO01$ python3 c3_nc2.py
GigabitEthernet0/0   enabled=true  ip=10.99.0.1
GigabitEthernet0/1   enabled=false ip=None
GigabitEthernet0/2   enabled=false ip=None
GigabitEthernet0/3   enabled=false ip=None
Loopback0            enabled=true  ip=192.0.2.1</pre>
<p>One dict, three prefixes, and the paths read like the document. For a long script keep the qualified-name logic in one place:</p>
<pre class="code">

def q(name, ns=BGP_NS):
    """qualified name: 'peer-state' -&gt; '{uri}peer-state'"""
    return "{" + ns + "}" + name
</pre>
<p>When a vendor changes a URI you edit one constant. Lab 2 has this exact function, and it is the first bug.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the prefix from the reply (<code>junos:</code>) inside a path without giving a map; ElementTree then raises <code>SyntaxError: prefix 'junos' not found in prefix map</code>. Copying the namespace URI from a different release or a different device. Assuming the root and its children share a namespace: in Junos replies they do not.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default namespace applies to elements but not to attributes, and a <code>find()</code> on a namespaced tag without a map returns <code>None</code>; it does not raise.</p></div>

<div class="scn"><h4>Works on the vMX, empty on the MX</h4><p>A report tool hard-coded the Junos routing namespace from a lab router running one release and printed no neighbours on production routers running another. The URI contained the release string. Switching the lookups to <code>{*}</code> wildcards, with a unit test on both saved replies, fixed it for every release.</p><p><b>Lesson:</b> do not hard-code a version-bearing URI; test against replies from two releases.</p></div>

<div class="iv"><p class="q">Why does root.find("interface") return None on a NETCONF reply?</p><p>Because the elements live in a namespace, so their tags are really <code>{urn:...ietf-interfaces}interface</code>. I pass a prefix map to <code>find</code>, or use the <code>{*}</code> wildcard, and I check the result against <code>None</code>. I would also print <code>root.tag</code> and the children's tags first to see what the device really sent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A namespace URI is an identifier, the surname of a name; the prefix is only a nickname.</li>
<li>ElementTree reports <code>{uri}local</code> and keeps no prefixes.</li>
<li>A missing namespace in a query gives <code>None</code> or <code>[]</code>, never an error.</li>
<li>Fix it with a prefix map, braces, or <code>{*}</code>; keep the logic in one helper.</li>
<li>Attributes do not inherit the default namespace.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Python mein naam sirf text hota hai, par XML mein naam kisi vocabulary ka hissa ho sakta hai. Agar tumhari query vocabulary bhool jaaye to parser imaandaari se kehta hai: "aisa koi element nahi". Is module ke zyada tar "sample par chalta hai, device par nahi" bugs namespaces ke hain.</p>

<h3>Analogy: surname</h3>
<p>Bahut se log Amit naam ke hote hain. "Amit Sharma" aur "Amit Verma" alag log hain kyunki surname batata hai ki kaunsa parivaar. NETCONF reply ke andar <code>name</code> ka matlab interface ka naam ho sakta hai (ietf-interfaces model se) ya kisi aur model ki cheez. <b>Namespace</b>, jaise <code>urn:ietf:params:xml:ns:yang:ietf-interfaces</code> URI, surname hai. URI sirf pehchaan hai; us se kuch download nahi hota.</p>

<h3>Namespace kaise declare hota hai</h3>
<ul>
<li><code>xmlns="URI"</code> us element aur uske andar sab kuch ke liye <b>default</b> namespace set karta hai.</li>
<li><code>xmlns:junos="URI"</code> ek <b>prefix</b> define karta hai; sirf <code>junos:style</code> likhe naam use karte hain.</li>
<li>Declaration us element se neeche tak chalti hai, aur child doosra declare kar sakta hai. Prefix sirf local nickname hai; sirf URI ka matlab hai.</li>
</ul>
<pre class="out"><span class="hl">&lt;rpc-reply message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;</span>
  &lt;data&gt;
<span class="hl">    &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;</span>
      &lt;interface&gt;
        &lt;name&gt;GigabitEthernet0/0&lt;/name&gt;
<span class="hl">        &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:ethernetCsmacd&lt;/type&gt;</span>
        &lt;enabled&gt;true&lt;/enabled&gt;
<span class="hl">        &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;</span>
          &lt;address&gt;
            &lt;ip&gt;10.99.0.1&lt;/ip&gt;
            &lt;netmask&gt;255.255.255.0&lt;/netmask&gt;
          &lt;/address&gt;
        &lt;/ipv4&gt;
...</pre>
<p>Yeh IOS XE reply chhe lines mein do baar namespace badalta hai: envelope NETCONF base hai, <code>interfaces</code> ietf-interfaces ka hai, aur <code>ipv4</code> ietf-ip ka. Parser ke liye yeh teen alag vocabularies hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Ek NETCONF reply mein teen namespaces">
<rect x="10" y="10" width="620" height="170" rx="12" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">rpc-reply, data  (NETCONF base namespace)</text>
<rect x="40" y="46" width="560" height="124" rx="12" fill="#bae6fd"/><text x="54" y="68" class="svg-ink" font-size="13">interfaces, interface, name, enabled  (ietf-interfaces)</text>
<rect x="70" y="84" width="500" height="76" rx="12" fill="#bbf7d0"/><text x="84" y="106" class="svg-ink" font-size="13">ipv4, address, ip, netmask  (ietf-ip)</text>
<text x="84" y="132" class="svg-muted" font-size="11">{urn:ietf:params:xml:ns:yang:ietf-ip}ipv4</text>
</svg><p class="cap">Har dabba alag namespace hai; query ko wahi batana padta hai jo chahiye.</p></div>

<h3>Parser tumhe kya deta hai</h3>
<p>ElementTree prefixes nahi rakhta. Woh poora naam <code>{uri}local</code> likhta hai. Yeh Junos BGP reply hai, jisme root par namespace nahi par uske pehle child par hai:</p>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
print(root.tag)
print([child.tag for child in root])
print(root.find("bgp-information"))
print(root.findall("bgp-information/bgp-peer"))
print(root.findall(".//bgp-peer"))</pre>
<pre class="out">AUTO01$ python3 c3_none.py
rpc-reply
['{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}bgp-information', 'cli']
<span class="hl">None</span>
<span class="hl">[]</span>
<span class="hl">[]</span></pre>
<p>Har query khaali aayi kyunki <code>bgp-information</code> aur <code>{...junos-routing}bgp-information</code> ek hi naam nahi hain. Reply mein kuch galat nahi aur koi error nahi aaya. Wahi khamoshi jaal hai.</p>

<h3>Sahi tarike se puchhne ke teen tareeke</h3>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
ns = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}

peers = root.findall("rt:bgp-information/rt:bgp-peer", ns)
print(len(peers))
for peer in peers:
    print(peer.findtext("rt:peer-address", namespaces=ns), peer.findtext("rt:peer-state", namespaces=ns))

# the same thing, spelled with the full name in curly braces
rt = "{h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing}"
print(len(root.findall(rt + "bgp-information/" + rt + "bgp-peer")))

# and with the wildcard (Python 3.8+): any namespace, or none
print(len(root.findall("{*}bgp-information/{*}bgp-peer")))
print(len(root.findall(".//{*}bgp-peer")))</pre>
<pre class="out">AUTO01$ python3 c3_ns.py
3
10.99.0.12+179 Established
10.99.0.13+179 Idle
10.99.0.99+179 Active
3
3
3</pre>
<ol>
<li><b>Prefix map.</b> <code>find</code>/<code>findall</code> ka dusra argument ya <code>findtext</code> ka <code>namespaces=</code> dict do. Prefix (<code>rt</code>) tumhara hai; sirf URI document se milna chahiye. Map sirf tumhari query ke liye hai, document ka edit nahi.</li>
<li><b>Braces mein poora naam.</b> Lamba par saaf.</li>
<li><b>Wildcard <code>{*}</code>.</b> Kisi bhi namespace ya bina namespace ke tag match karta hai. Yeh Junos upgrade bhi jhel leta hai, kyunki release number URI ke andar hota hai (<code>.../junos/23.4R1/junos-routing</code>) aur har release mein badalta hai.</li>
</ol>
<p>Values ab bhi <code>+179</code> par khatam hoti hain: Junos detailed view mein address ke baad peer ka TCP port likhta hai. Use <code>split("+")[0]</code> se hata do.</p>

<h3>Attributes ke namespaces bhi hote hain</h3>
<pre class="code">import xml.etree.ElementTree as ET

root = ET.parse("junos_bgp.xml").getroot()
peer = root.find(".//{*}bgp-peer")
print(peer.attrib)
print(peer.get("junos:style"))
print(peer.get("{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style"))</pre>
<pre class="out">AUTO01$ python3 c3_attr.py
{'{h&#116;tp://xml.juniper.net/junos/23.4R1/junos}style': 'detail'}
<span class="hl">None</span>
detail</pre>
<p><code>junos:style</code> <code>junos</code> namespace ka attribute hai. Bina prefix wale attribute ka namespace nahi hota; prefix wale ka hota hai. Elements default namespace inherit karte hain, <b>attributes kabhi nahi</b>.</p>

<h3>Helper ke saath NETCONF reply</h3>
<pre class="code">import xml.etree.ElementTree as ET

NS = {
    "nc": "urn:ietf:params:xml:ns:netconf:base:1.0",
    "if": "urn:ietf:params:xml:ns:yang:ietf-interfaces",
    "ip": "urn:ietf:params:xml:ns:yang:ietf-ip",
}
root = ET.parse("xe_ifaces.xml").getroot()
for itf in root.findall("nc:data/if:interfaces/if:interface", NS):
    name = itf.findtext("if:name", namespaces=NS)
    enabled = itf.findtext("if:enabled", namespaces=NS)
    ip = itf.findtext("ip:ipv4/ip:address/ip:ip", namespaces=NS)
    print(f"{name:&lt;20} enabled={enabled:&lt;5} ip={ip}")</pre>
<pre class="out">AUTO01$ python3 c3_nc2.py
GigabitEthernet0/0   enabled=true  ip=10.99.0.1
GigabitEthernet0/1   enabled=false ip=None
GigabitEthernet0/2   enabled=false ip=None
GigabitEthernet0/3   enabled=false ip=None
Loopback0            enabled=true  ip=192.0.2.1</pre>
<p>Ek dict, teen prefixes, aur paths document ki tarah padhte hain. Lambi script mein qualified-name ka logic ek jagah rakho:</p>
<pre class="code">

def q(name, ns=BGP_NS):
    """qualified name: 'peer-state' -&gt; '{uri}peer-state'"""
    return "{" + ns + "}" + name
</pre>
<p>Vendor URI badle to ek constant edit karte ho. Lab 2 mein yahi function hai, aur wahi pehla bug hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Reply ka prefix (<code>junos:</code>) bina map diye path mein use karna; tab ElementTree <code>SyntaxError: prefix 'junos' not found in prefix map</code> deta hai. Doosre release ya doosre device ka namespace URI copy karna. Maan lena ki root aur uske children ka namespace ek hai: Junos replies mein nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> Default namespace elements par lagta hai attributes par nahi, aur namespaced tag par bina map ke <code>find()</code> <code>None</code> deta hai; error nahi.</p></div>

<div class="scn"><h4>vMX par chalta hai, MX par khaali</h4><p>Ek report tool ne lab router ke ek release ka Junos routing namespace hard-code kar diya aur doosre release wale production routers par koi neighbour print nahi kiya. URI mein release string thi. Lookups ko <code>{*}</code> wildcards par karne se, dono saved replies par unit test ke saath, har release ke liye theek ho gaya.</p><p><b>Seekh:</b> version wali URI hard-code mat karo; do releases ke replies par test karo.</p></div>

<div class="iv"><p class="q">NETCONF reply par root.find("interface") None kyun deta hai?</p><p>Kyunki elements namespace mein hain, isliye unke tags asal mein <code>{urn:...ietf-interfaces}interface</code> hain. Main <code>find</code> ko prefix map deta hoon, ya <code>{*}</code> wildcard use karta hoon, aur result ko <code>None</code> se check karta hoon. Pehle <code>root.tag</code> aur children ke tags print karke dekhta hoon ki device ne asal mein kya bheja.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Namespace URI pehchaan hai, naam ka surname; prefix sirf nickname hai.</li>
<li>ElementTree <code>{uri}local</code> report karta hai aur prefixes nahi rakhta.</li>
<li>Query mein namespace chhoot jaaye to <code>None</code> ya <code>[]</code> milta hai, error nahi.</li>
<li>Prefix map, braces ya <code>{*}</code> se theek karo; logic ek helper mein rakho.</li>
<li>Attributes default namespace inherit nahi karte.</li>
</ul></div>
`}};export{e as default};