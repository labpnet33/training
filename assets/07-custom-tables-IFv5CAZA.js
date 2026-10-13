var e={id:`custom-tables`,h:{en:`Your own tables and views in YAML`,hi:`YAML mein apne tables aur views`},body:{en:`
<p>The nine ready-made tables will not cover everything you want to read. Maybe the router has a command with no shipped table, or you only want three of its twenty fields, or you want the numbers already converted. PyEZ lets you define a table in a small YAML file, with no Python parsing code at all.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="15" width="260" height="180" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="150" y="71" text-anchor="middle" font-size="12" class="svg-ink">&lt;lldp-neighbors-information&gt;</text><text x="150" y="86" text-anchor="middle" font-size="12" class="svg-ink">  &lt;lldp-neighbor-information&gt;</text><text x="150" y="101" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-local-port-id&gt;ge-0/0/1</text><text x="150" y="116" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-remote-system-name&gt;BLR-J2</text><text x="150" y="131" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-remote-port-id&gt;ge-0/0/1</text><text x="150" y="146" text-anchor="middle" font-size="12" class="svg-ink">  &lt;/lldp-neighbor-information&gt;</text><rect x="350" y="15" width="270" height="180" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="485" y="64" text-anchor="middle" font-size="12" class="svg-ink">LldpNbrTable</text><text x="485" y="79" text-anchor="middle" font-size="12" class="svg-ink">item: lldp-neighbor-information</text><text x="485" y="94" text-anchor="middle" font-size="12" class="svg-ink">key: lldp-local-port-id</text><text x="485" y="109" text-anchor="middle" font-size="12" class="svg-ink"></text><text x="485" y="124" text-anchor="middle" font-size="12" class="svg-ink">LldpNbrView.fields</text><text x="485" y="139" text-anchor="middle" font-size="12" class="svg-ink">neighbor: lldp-remote-system-name</text><text x="485" y="154" text-anchor="middle" font-size="12" class="svg-ink">remote_port: lldp-remote-port-id</text><line x1="280" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="315" y="95" text-anchor="middle" font-size="12" class="svg-muted">YAML</text></svg><p class="cap">A YAML table is a map from XML tags (left) to Python names (right).</p></div>
<h3>The anatomy of a table definition</h3><ul><li><b>Table name</b> (top level key): becomes a Python class. By habit it ends with <code>Table</code>.</li><li><code>rpc:</code> the RPC to run (with hyphens, as the router names it).</li><li><code>item:</code> the XML element that repeats, one per row.</li><li><code>key:</code> the child element whose text names the row.</li><li><code>view:</code> the name of the view class below.</li><li><code>args:</code> (optional) fixed arguments for the RPC, such as <code>terse: True</code>.</li><li><b>View</b>: <code>fields:</code> a map of Python name to the child tag it reads.</li></ul>
<h3>Step 7 of the lab: your own LLDP table</h3><p>Here is the definition and the script that loads it. <code>loadyaml()</code> returns a dict of classes, and <code>globals().update(...)</code> makes them usable by name.</p>
<pre class="code">---
LldpNbrTable:
  rpc: get-lldp-neighbors-information
  item: lldp-neighbor-information
  key: lldp-local-port-id
  view: LldpNbrView

LldpNbrView:
  fields:
    local_port: lldp-local-port-id
    neighbor: lldp-remote-system-name
    remote_port: lldp-remote-port-id
    chassis_id: lldp-remote-chassis-id</pre>
<pre class="code">"""lldp.py - LLDP neighbours through our own table definition"""
from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("lldp_nk.yml"))

for name, host in FLEET.items():
    with device(host, gather_facts=False) as dev:
        tbl = LldpNbrTable(dev).get()
        print("%s: %s" % (name, tbl))
        for n in tbl:
            print("  %-10s -&gt; %-8s %s" % (n.local_port, n.neighbor, n.remote_port))</pre>
<pre class="out">AUTO01$ python3 lldp.py
J1: LldpNbrTable:10.99.0.11: 1 items
  ge-0/0/1   -&gt; BLR-J2   ge-0/0/1
J2: LldpNbrTable:10.99.0.12: 2 items
  ge-0/0/1   -&gt; PUN-J1   ge-0/0/1
<span class="hl">  ge-0/0/2   -&gt; HYD-J3   ge-0/0/1</span>
J3: LldpNbrTable:10.99.0.13: 1 items
<span class="hl">  ge-0/0/1   -&gt; BLR-J2   ge-0/0/2</span></pre>
<p>The table printed itself as <code>LldpNbrTable:10.99.0.12: 2 items</code>: class name, device, row count. J2 sees J1 on <code>ge-0/0/1</code> and J3 on <code>ge-0/0/2</code>, which matches the cabling in chapter 1.</p>
<h3>Field types: numbers, attributes and arguments</h3><p>A plain field returns text. To get a number, give the field a type. To read an XML attribute such as <code>elapsed-time seconds="63"</code>, nest the attribute name with an <code>@</code>. The second file also shows <code>args</code>.</p>
<pre class="code">---
BgpPeerTable:
  rpc: get-bgp-summary-information
  item: bgp-peer
  key: peer-address
  view: BgpPeerView

BgpPeerView:
  fields:
    asn: peer-as
    state: peer-state
    in_msgs:
      input-messages: int
    flaps:
      flap-count: int
    up_seconds:
      elapsed-time:
        "@seconds": int

IfTerseTable:
  rpc: get-interface-information
  args:
    terse: True
  item: physical-interface
  key: name
  view: IfTerseView

IfTerseView:
  fields:
    admin: admin-status
    oper: oper-status

FooTable:
  rpc: get-foo-information
  item: foo
  key: name
  view: FooView

FooView:
  fields:
    x: x</pre>
<pre class="code">from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("bgp_nk.yml"))

with device(FLEET["J2"], gather_facts=False) as dev:
    peers = BgpPeerTable(dev).get()
    print(peers)
    for p in peers:
        print(p.name, p.asn, p.state, p.flaps, p.in_msgs, p.up_seconds + 1 - 1)
    first = peers[0]
    print(first.keys())
    try:
        first.nope
    except Exception as err:
        print(type(err).__name__ + ":", err)
    ifs = IfTerseTable(dev).get()
    print(ifs, ifs.keys())
    print(ifs["ge-0/0/1"].oper, ifs["ge-0/0/1"].admin)</pre>
<pre class="out">AUTO01$ python3 bgp_table.py
BgpPeerTable:10.99.0.12: 2 items
10.255.0.1 65000 Established 0 4 60
10.255.0.3 65000 Established 0 4 60
['asn', 'state', 'in_msgs', 'flaps', 'up_seconds']
<span class="hl">ValueError: Unknown field: 'nope'</span>
<span class="hl">IfTerseTable:10.99.0.12: 16 items ['dsc', 'fxp0', 'ge-0/0/0', 'ge-0/0/1', 'ge-0/0/2', 'ge-0/0/3', 'ge-0/0/4', 'ge-0/0/5', 'gre', 'ipip', 'lo0', 'lsi', 'mtun', 'pimd', 'pime', 'tap']</span>
up up</pre>
<p>Check the output against the YAML. <code>in_msgs</code> and <code>flaps</code> came out as numbers because of <code>int</code>. <code>up_seconds</code> reads the attribute. <code>asn</code> stayed text. <code>IfTerseTable</code> sends <code>&lt;terse/&gt;</code> because of <code>args</code>, and returns sixteen rows keyed by interface name. Asking a row for a field the view does not define raises <code>ValueError: Unknown field: 'nope'</code>.</p>
<h3>When the RPC does not exist</h3><p>A typo in <code>rpc:</code> is only found when you call <code>get()</code>. The router answers like it would to any unknown RPC. The last block of <code>bgp_nk.yml</code> above, <code>FooTable</code>, points at an RPC that does not exist:</p>
<pre class="code">from jnpr.junos.exception import RpcError
from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("bgp_nk.yml"))

with device(FLEET["J1"], gather_facts=False) as dev:
    try:
        FooTable(dev).get()
    except RpcError as err:
        print(repr(err))</pre>
<pre class="out">AUTO01$ python3 bad_table.py
<span class="hl">RpcError(severity: error, bad_element: get-foo-information, message: syntax error)</span></pre>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab has the YAML tables (<code>Table</code>, <code>View</code>, <code>loadyaml</code>) and read-only config tables (<code>get:</code>), but no <code>set/put</code> on config tables. Keep the YAML files in version control next to your scripts.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Indentation errors in YAML (two spaces, never tabs). Giving the Python class name where <code>view:</code> expects the view name. A key element that is not unique per row, so rows overwrite each other.</p></div>
<div class="exam"><p><b>Exam trap.</b> In a table definition, <code>item</code> is the element that repeats and <code>key</code> is a child of it. The view maps names to children of the item, not to the whole reply.</p></div>
<div class="scn"><h4>One YAML file for four teams</h4><p>A network team needed LLDP neighbours on every router for a cabling audit. Instead of writing a parser for each script, they put one YAML file in the shared repository. The audit script, the topology drawer and the monitoring check all loaded it, and when Junos added a field the file was edited in one place.</p><p><b>Lesson:</b> a table definition is reusable documentation of an RPC.</p></div>
<div class="iv"><p class="q">"How would you read a Junos command that has no ready-made PyEZ table?"</p><p>I write a YAML table: the RPC name, the repeating item, the key and a view mapping my field names to child tags, with <code>int</code> types where I want numbers. I load it with <code>loadyaml</code> and call <code>Table(dev).get()</code>. It keeps parsing out of the script.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A YAML table has <code>rpc</code>, <code>item</code>, <code>key</code> and a <code>view</code> of <code>fields</code>.</li><li><code>globals().update(loadyaml("file.yml"))</code> makes the classes usable.</li><li>Types such as <code>int</code> and the <code>@attribute</code> form convert on the way in.</li><li><code>args</code> sends fixed RPC arguments.</li><li>Unknown fields raise <code>ValueError</code>; a bad RPC raises <code>RpcError</code> at <code>get()</code>.</li></ul></div>
`,hi:`
<p>Nau ready-made tables woh sab cover nahi karenge jo tum padhna chahte ho. Ho sakta hai router ke command ka koi shipped table na ho, ya tumhe bees mein se sirf teen fields chahiye, ya numbers pehle se convert chahiye. PyEZ tumhe chhoti YAML file mein table define karne deta hai, Python parsing code ke bina.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="15" width="260" height="180" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="150" y="71" text-anchor="middle" font-size="12" class="svg-ink">&lt;lldp-neighbors-information&gt;</text><text x="150" y="86" text-anchor="middle" font-size="12" class="svg-ink">  &lt;lldp-neighbor-information&gt;</text><text x="150" y="101" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-local-port-id&gt;ge-0/0/1</text><text x="150" y="116" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-remote-system-name&gt;BLR-J2</text><text x="150" y="131" text-anchor="middle" font-size="12" class="svg-ink">     &lt;lldp-remote-port-id&gt;ge-0/0/1</text><text x="150" y="146" text-anchor="middle" font-size="12" class="svg-ink">  &lt;/lldp-neighbor-information&gt;</text><rect x="350" y="15" width="270" height="180" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="485" y="64" text-anchor="middle" font-size="12" class="svg-ink">LldpNbrTable</text><text x="485" y="79" text-anchor="middle" font-size="12" class="svg-ink">item: lldp-neighbor-information</text><text x="485" y="94" text-anchor="middle" font-size="12" class="svg-ink">key: lldp-local-port-id</text><text x="485" y="109" text-anchor="middle" font-size="12" class="svg-ink"></text><text x="485" y="124" text-anchor="middle" font-size="12" class="svg-ink">LldpNbrView.fields</text><text x="485" y="139" text-anchor="middle" font-size="12" class="svg-ink">neighbor: lldp-remote-system-name</text><text x="485" y="154" text-anchor="middle" font-size="12" class="svg-ink">remote_port: lldp-remote-port-id</text><line x1="280" y1="105" x2="350" y2="105" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="315" y="95" text-anchor="middle" font-size="12" class="svg-muted">YAML</text></svg><p class="cap">YAML table XML tags (left) se Python names (right) ka map hai.</p></div>
<h3>Table definition ki anatomy</h3><ul><li><b>Table name</b> (top level key): Python class ban jaata hai. Aadat se <code>Table</code> par khatam hota hai.</li><li><code>rpc:</code> chalane wala RPC (hyphens ke saath, jaise router naam deta hai).</li><li><code>item:</code> woh XML element jo repeat hota hai, har row ke liye ek.</li><li><code>key:</code> woh child element jiska text row ka naam hai.</li><li><code>view:</code> neeche wali view class ka naam.</li><li><code>args:</code> (optional) RPC ke fixed arguments, jaise <code>terse: True</code>.</li><li><b>View</b>: <code>fields:</code> Python naam se us child tag ka map jise woh padhta hai.</li></ul>
<h3>Lab ka step 7: apna LLDP table</h3><p>Yeh definition aur use load karne wali script hai. <code>loadyaml()</code> classes ka dict lautata hai, aur <code>globals().update(...)</code> unhe naam se use karne layak banata hai.</p>
<pre class="code">---
LldpNbrTable:
  rpc: get-lldp-neighbors-information
  item: lldp-neighbor-information
  key: lldp-local-port-id
  view: LldpNbrView

LldpNbrView:
  fields:
    local_port: lldp-local-port-id
    neighbor: lldp-remote-system-name
    remote_port: lldp-remote-port-id
    chassis_id: lldp-remote-chassis-id</pre>
<pre class="code">"""lldp.py - LLDP neighbours through our own table definition"""
from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("lldp_nk.yml"))

for name, host in FLEET.items():
    with device(host, gather_facts=False) as dev:
        tbl = LldpNbrTable(dev).get()
        print("%s: %s" % (name, tbl))
        for n in tbl:
            print("  %-10s -&gt; %-8s %s" % (n.local_port, n.neighbor, n.remote_port))</pre>
<pre class="out">AUTO01$ python3 lldp.py
J1: LldpNbrTable:10.99.0.11: 1 items
  ge-0/0/1   -&gt; BLR-J2   ge-0/0/1
J2: LldpNbrTable:10.99.0.12: 2 items
  ge-0/0/1   -&gt; PUN-J1   ge-0/0/1
<span class="hl">  ge-0/0/2   -&gt; HYD-J3   ge-0/0/1</span>
J3: LldpNbrTable:10.99.0.13: 1 items
<span class="hl">  ge-0/0/1   -&gt; BLR-J2   ge-0/0/2</span></pre>
<p>Table ne khud ko <code>LldpNbrTable:10.99.0.12: 2 items</code> ki tarah print kiya: class name, device, row count. J2 <code>ge-0/0/1</code> par J1 aur <code>ge-0/0/2</code> par J3 ko dekhta hai, jo chapter 1 ki cabling se milta hai.</p>
<h3>Field types: numbers, attributes aur arguments</h3><p>Plain field text lautata hai. Number ke liye field ko type do. <code>elapsed-time seconds="63"</code> jaise XML attribute ko padhne ke liye attribute naam ko <code>@</code> ke saath nest karo. Doosri file <code>args</code> bhi dikhati hai.</p>
<pre class="code">---
BgpPeerTable:
  rpc: get-bgp-summary-information
  item: bgp-peer
  key: peer-address
  view: BgpPeerView

BgpPeerView:
  fields:
    asn: peer-as
    state: peer-state
    in_msgs:
      input-messages: int
    flaps:
      flap-count: int
    up_seconds:
      elapsed-time:
        "@seconds": int

IfTerseTable:
  rpc: get-interface-information
  args:
    terse: True
  item: physical-interface
  key: name
  view: IfTerseView

IfTerseView:
  fields:
    admin: admin-status
    oper: oper-status

FooTable:
  rpc: get-foo-information
  item: foo
  key: name
  view: FooView

FooView:
  fields:
    x: x</pre>
<pre class="code">from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("bgp_nk.yml"))

with device(FLEET["J2"], gather_facts=False) as dev:
    peers = BgpPeerTable(dev).get()
    print(peers)
    for p in peers:
        print(p.name, p.asn, p.state, p.flaps, p.in_msgs, p.up_seconds + 1 - 1)
    first = peers[0]
    print(first.keys())
    try:
        first.nope
    except Exception as err:
        print(type(err).__name__ + ":", err)
    ifs = IfTerseTable(dev).get()
    print(ifs, ifs.keys())
    print(ifs["ge-0/0/1"].oper, ifs["ge-0/0/1"].admin)</pre>
<pre class="out">AUTO01$ python3 bgp_table.py
BgpPeerTable:10.99.0.12: 2 items
10.255.0.1 65000 Established 0 4 60
10.255.0.3 65000 Established 0 4 60
['asn', 'state', 'in_msgs', 'flaps', 'up_seconds']
<span class="hl">ValueError: Unknown field: 'nope'</span>
<span class="hl">IfTerseTable:10.99.0.12: 16 items ['dsc', 'fxp0', 'ge-0/0/0', 'ge-0/0/1', 'ge-0/0/2', 'ge-0/0/3', 'ge-0/0/4', 'ge-0/0/5', 'gre', 'ipip', 'lo0', 'lsi', 'mtun', 'pimd', 'pime', 'tap']</span>
up up</pre>
<p>Output ko YAML se milao. <code>in_msgs</code> aur <code>flaps</code> <code>int</code> ki wajah se numbers bane. <code>up_seconds</code> attribute padhta hai. <code>asn</code> text hi raha. <code>IfTerseTable</code> <code>args</code> ki wajah se <code>&lt;terse/&gt;</code> bhejta hai, aur interface name se keyed solah rows lautata hai. Row se aisa field maangna jo view define nahi karta <code>ValueError: Unknown field: 'nope'</code> raise karta hai.</p>
<h3>Jab RPC maujood nahi</h3><p><code>rpc:</code> mein typo sirf <code>get()</code> bulane par pakda jaata hai. Router waisa hi jawab deta hai jaisa kisi bhi anjaan RPC par deta. Upar <code>bgp_nk.yml</code> ka aakhri block, <code>FooTable</code>, aise RPC ki taraf ishara karta hai jo maujood nahi:</p>
<pre class="code">from jnpr.junos.exception import RpcError
from jnpr.junos.factory import loadyaml
from pyezutil import FLEET, device

globals().update(loadyaml("bgp_nk.yml"))

with device(FLEET["J1"], gather_facts=False) as dev:
    try:
        FooTable(dev).get()
    except RpcError as err:
        print(repr(err))</pre>
<pre class="out">AUTO01$ python3 bad_table.py
<span class="hl">RpcError(severity: error, bad_element: get-foo-information, message: syntax error)</span></pre>
<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab mein YAML tables (<code>Table</code>, <code>View</code>, <code>loadyaml</code>) aur read-only config tables (<code>get:</code>) hain, par config tables par <code>set/put</code> nahi. YAML files ko scripts ke saath version control mein rakho.</p></div>
<div class="warn"><p><b>Aam galtiyan.</b> YAML mein indentation errors (do spaces, tabs kabhi nahi). <code>view:</code> jahan view ka naam chahta hai wahan Python class name dena. Aisa key element jo har row ke liye unique nahi, isliye rows ek doosre ko overwrite karti hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Table definition mein <code>item</code> repeat hone wala element hai aur <code>key</code> uska child. View naamon ko item ke children se map karta hai, poori reply se nahi.</p></div>
<div class="scn"><h4>Chaar teams ke liye ek YAML file</h4><p>Ek network team ko cabling audit ke liye har router par LLDP neighbours chahiye the. Har script ke liye parser likhne ki jagah unhone shared repository mein ek YAML file rakhi. Audit script, topology drawer aur monitoring check sab ne use load kiya, aur jab Junos ne field jodi to file ek jagah edit hui.</p><p><b>Lesson:</b> table definition RPC ka reusable documentation hai.</p></div>
<div class="iv"><p class="q">"Jis Junos command ka ready-made PyEZ table nahi, use kaise padhoge?"</p><p>Main YAML table likhta hoon: RPC ka naam, repeat hone wala item, key aur view jo mere field names ko child tags se map karta hai, jahan number chahiye wahan <code>int</code> type ke saath. Use <code>loadyaml</code> se load karta hoon aur <code>Table(dev).get()</code> bulata hoon. Isse parsing script se bahar rehti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>YAML table mein <code>rpc</code>, <code>item</code>, <code>key</code> aur <code>fields</code> ka <code>view</code> hota hai.</li><li><code>globals().update(loadyaml("file.yml"))</code> classes ko use karne layak banata hai.</li><li><code>int</code> jaise types aur <code>@attribute</code> form andar aate waqt convert karte hain.</li><li><code>args</code> fixed RPC arguments bhejta hai.</li><li>Unknown fields <code>ValueError</code> raise karte hain; kharab RPC <code>get()</code> par <code>RpcError</code>.</li></ul></div>
`}};export{e as default};