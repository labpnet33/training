var e={id:`op-tables`,h:{en:`Ready-made operational tables`,hi:`Ready-made operational tables`},body:{en:`
<p>Chapter 5 turned one reply into a dict by hand. Most replies, however, follow the same shape: a list of repeated items, each with a few fields. PyEZ calls this shape a <b>Table</b>. A table knows which RPC to run, which element repeats, which child is the key, and which fields each row exposes (the <b>View</b>). Juniper ships ready-made tables for the common cases, so you write less code.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="20" width="200" height="150" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="120" y="59" text-anchor="middle" font-size="13" class="svg-ink">Table</text><text x="120" y="75" text-anchor="middle" font-size="13" class="svg-ink">OspfNeighborTable</text><text x="120" y="91" text-anchor="middle" font-size="13" class="svg-ink"></text><text x="120" y="107" text-anchor="middle" font-size="13" class="svg-ink">rpc: get-ospf-neighbor-information</text><text x="120" y="123" text-anchor="middle" font-size="13" class="svg-ink">item: ospf-neighbor</text><text x="120" y="139" text-anchor="middle" font-size="13" class="svg-ink">key: neighbor-address</text><rect x="300" y="20" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="44" text-anchor="middle" font-size="13" class="svg-ink">View 10.99.0.11</text><rect x="300" y="75" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="99" text-anchor="middle" font-size="13" class="svg-ink">View 10.99.0.13</text><rect x="300" y="130" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="154" text-anchor="middle" font-size="13" class="svg-ink">View 10.12.0.1</text><rect x="490" y="40" width="140" height="110" rx="8" fill="#fde68a" stroke="#64748b"/><text x="560" y="75" text-anchor="middle" font-size="13" class="svg-ink">fields of a View</text><text x="560" y="91" text-anchor="middle" font-size="13" class="svg-ink">neighbor_state</text><text x="560" y="107" text-anchor="middle" font-size="13" class="svg-ink">neighbor_id</text><text x="560" y="123" text-anchor="middle" font-size="13" class="svg-ink">interface_name</text><line x1="220" y1="95" x2="300" y2="40" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="220" y1="95" x2="300" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="220" y1="95" x2="300" y2="150" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="450" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/></svg><p class="cap">A Table runs one RPC and cuts the reply into rows (Views). Each row has a key and named fields.</p></div>
<h3>Ready-made tables in the lab</h3>
<table class="cmp"><tr><th>Import</th><th>Table class</th><th>Shows</th></tr><tr><td><code>jnpr.junos.op.ospf</code></td><td>OspfNeighborTable</td><td>OSPF neighbours</td></tr><tr><td><code>jnpr.junos.op.bgp</code></td><td>BGPNeighborTable</td><td>BGP peers and counters</td></tr><tr><td><code>jnpr.junos.op.ethport</code></td><td>EthPortTable</td><td>Ethernet ports, state, speed</td></tr><tr><td><code>jnpr.junos.op.routes</code></td><td>RouteTable</td><td>The routing table</td></tr><tr><td><code>jnpr.junos.op.lldp</code></td><td>LLDPNeighborTable</td><td>LLDP neighbours</td></tr><tr><td><code>jnpr.junos.op.arp</code></td><td>ArpTable</td><td>ARP entries</td></tr><tr><td><code>jnpr.junos.op.phyport</code></td><td>PhyPortTable, PhyPortStatsTable, PhyPortErrorTable</td><td>Physical port details and counters</td></tr><tr><td><code>jnpr.junos.op.inventory</code>, <code>.fpc</code></td><td>ModuleTable, ChassisInventoryTable, FpcHwTable</td><td>Hardware inventory</td></tr></table>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab ships these nine modules. Real PyEZ ships many more (IS-IS, LDP, VLANs, BFD and others) and the YAML in chapter 7 lets you add any you miss. A custom table on an RPC the lab device does not have fails with the same <code>syntax error</code> a real router would give.</p></div>
<h3>Step 6 of the lab: OSPF neighbours</h3><p>Three lines do the work: import the table, build it with the device, call <code>get()</code>. The loop then reads fields as attributes. Compare this with the 20 lines of parsing in chapter 5.</p>
<pre class="code">"""ospf_tbl.py - OSPF neighbours of every router from a ready-made op table"""
from jnpr.junos.op.ospf import OspfNeighborTable
from pyezutil import FLEET, device

for name, host in FLEET.items():
    with device(host, gather_facts=False) as dev:
        ospf = OspfNeighborTable(dev).get()
        print("%s: %d neighbours" % (name, len(ospf)))
        for n in ospf:
            print("  %-10s %-12s %-5s via %s" % (n.neighbor_address, n.neighbor_id, n.neighbor_state, n.interface_name))</pre>
<pre class="out">AUTO01$ python3 ospf_tbl.py
J1: 3 neighbours
  10.99.0.12 10.255.0.2   Full  via ge-0/0/0.0
  10.99.0.13 10.255.0.3   Full  via ge-0/0/0.0
  10.12.0.2  10.255.0.2   Full  via ge-0/0/1.0
<span class="hl">J2: 4 neighbours</span>
  10.99.0.11 10.255.0.1   Full  via ge-0/0/0.0
  10.99.0.13 10.255.0.3   Full  via ge-0/0/0.0
  10.12.0.1  10.255.0.1   Full  via ge-0/0/1.0
  10.23.0.2  10.255.0.3   Full  via ge-0/0/2.0
J3: 3 neighbours
  10.99.0.11 10.255.0.1   Full  via ge-0/0/0.0
  10.99.0.12 10.255.0.2   Full  via ge-0/0/0.0
  10.23.0.1  10.255.0.2   Full  via ge-0/0/1.0</pre>
<p>J2 sits in the middle of the chain, so it has four neighbours: J1 and J3 over the management segment, plus J1 and J3 over the two core links. J1 and J3 each have three.</p>
<h3>What you can do with a table</h3><p>A table is a small container with a few verbs. The tour below uses four different tables on J2 and shows the habits that avoid mistakes.</p>
<pre class="code">from jnpr.junos.op.bgp import BGPNeighborTable
from jnpr.junos.op.ethport import EthPortTable
from jnpr.junos.op.routes import RouteTable
from jnpr.junos.op.lldp import LLDPNeighborTable
from pyezutil import FLEET, device

with device(FLEET["J2"], gather_facts=False) as dev:
    ospf_empty = BGPNeighborTable(dev)
    print(ospf_empty)
    try:
        len(ospf_empty)
    except RuntimeError as err:
        print("RuntimeError:", err)
    bgp = BGPNeighborTable(dev).get()
    print(bgp, bgp.keys())
    peer = bgp["10.255.0.3"]
    print(peer.peer_state, peer.peer_as, peer.flap_count, peer.input_messages)
    print(bgp["10.1.1.1"])
    eth = EthPortTable(dev).get()
    for p in eth:
        print(p.name, p.oper, p.admin, p.speed)
    routes = RouteTable(dev).get()
    print(len(routes), "routes")
    for r in routes[:3]:
        print(r.rt_destination, r.protocol, r.preference, r.local_interface)
    print(LLDPNeighborTable(dev).get().keys())</pre>
<pre class="out">AUTO01$ python3 tables_tour.py
BGPNeighborTable:10.99.0.12: Data not loaded
<span class="hl">RuntimeError: Table is empty, use get()</span>
BGPNeighborTable:10.99.0.12: 2 items ['10.255.0.1', '10.255.0.3']
<span class="hl">Established 65000 0 4</span>
<span class="hl">None</span>
ge-0/0/0 up up 1Gbps
ge-0/0/1 up up 1Gbps
ge-0/0/2 up up 1Gbps
ge-0/0/3 down up 1000mbps
ge-0/0/4 down up 1000mbps
ge-0/0/5 down up 1000mbps
10 routes
10.12.0.0/30 Direct 0 ge-0/0/1.0
10.12.0.2/32 Local 0 ge-0/0/1.0
10.23.0.0/30 Direct 0 ge-0/0/2.0
['ge-0/0/1', 'ge-0/0/2']</pre>
<ul><li><b>get() fills the table.</b> Before it, the table says <code>Data not loaded</code> and <code>len()</code> raises <code>RuntimeError: Table is empty, use get()</code>.</li><li><b>Lookup by key.</b> <code>bgp["10.255.0.3"]</code> returns the row; a key that does not exist returns <code>None</code>, so test for it before reading fields.</li><li><b>Iteration</b> gives rows (Views). <code>keys()</code>, <code>values()</code>, <code>items()</code> and slicing like <code>routes[:3]</code> work.</li><li><b>Fields are attributes</b>: <code>peer.peer_state</code>, <code>p.oper</code>.</li><li><code>to_json()</code> turns the table into JSON for a file or an API.</li></ul>
<p>Notice that the BGP table gives <code>peer_as</code> as text but counters such as <code>flap_count</code> as numbers: each field has a type chosen by the table author. Tables always run their RPC with whitespace normalised, so you never meet the padded strings of chapter 5.</p>
<div class="warn"><p><b>Common mistakes.</b> Reading a table before <code>get()</code>. Reading fields of a missing key (<code>None.peer_state</code> fails with <code>AttributeError</code>). Assuming a field is a number when it is text.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get()</code> returns the table itself, so <code>OspfNeighborTable(dev).get()</code> can be used in one line. A table object and the rows (Views) inside it are different things.</p></div>
<div class="scn"><h4>Twelve lines instead of two hundred</h4><p>A team kept a 200-line module of regexes for interface status. A new engineer replaced it with <code>EthPortTable</code>: the module became twelve lines, and the new code also reported speed and duplex, which the old regexes never handled.</p><p><b>Lesson:</b> check whether a table already exists before you parse.</p></div>
<div class="iv"><p class="q">"What is a PyEZ operational table?"</p><p>A reusable definition of an RPC, the repeating element, its key and a view of named fields. <code>Table(dev).get()</code> runs the RPC and gives rows I can look up by key or iterate. Juniper ships tables for common commands, and I can write my own in YAML.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A Table = RPC + repeating item + key + View of fields.</li><li><code>Table(dev).get()</code> loads it; before that it is empty.</li><li>Look up rows by key; a missing key gives <code>None</code>.</li><li>Fields are attributes; <code>to_json()</code> exports.</li><li>The lab ships nine <code>jnpr.junos.op</code> modules.</li></ul></div>
`,hi:`
<p>Chapter 5 ne ek reply ko haath se dict banaya. Zyadatar replies ka shape ek jaisa hota hai: repeated items ki list, har item mein kuch fields. PyEZ is shape ko <b>Table</b> kehta hai. Table jaanta hai kaunsa RPC chalana hai, kaunsa element repeat hota hai, kaunsa child key hai, aur har row kaunse fields dikhati hai (<b>View</b>). Juniper common cases ke liye ready-made tables deta hai, isliye kam code likhna padta hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="20" width="200" height="150" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="120" y="59" text-anchor="middle" font-size="13" class="svg-ink">Table</text><text x="120" y="75" text-anchor="middle" font-size="13" class="svg-ink">OspfNeighborTable</text><text x="120" y="91" text-anchor="middle" font-size="13" class="svg-ink"></text><text x="120" y="107" text-anchor="middle" font-size="13" class="svg-ink">rpc: get-ospf-neighbor-information</text><text x="120" y="123" text-anchor="middle" font-size="13" class="svg-ink">item: ospf-neighbor</text><text x="120" y="139" text-anchor="middle" font-size="13" class="svg-ink">key: neighbor-address</text><rect x="300" y="20" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="44" text-anchor="middle" font-size="13" class="svg-ink">View 10.99.0.11</text><rect x="300" y="75" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="99" text-anchor="middle" font-size="13" class="svg-ink">View 10.99.0.13</text><rect x="300" y="130" width="150" height="40" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="375" y="154" text-anchor="middle" font-size="13" class="svg-ink">View 10.12.0.1</text><rect x="490" y="40" width="140" height="110" rx="8" fill="#fde68a" stroke="#64748b"/><text x="560" y="75" text-anchor="middle" font-size="13" class="svg-ink">View ke fields</text><text x="560" y="91" text-anchor="middle" font-size="13" class="svg-ink">neighbor_state</text><text x="560" y="107" text-anchor="middle" font-size="13" class="svg-ink">neighbor_id</text><text x="560" y="123" text-anchor="middle" font-size="13" class="svg-ink">interface_name</text><line x1="220" y1="95" x2="300" y2="40" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="220" y1="95" x2="300" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="220" y1="95" x2="300" y2="150" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="450" y1="95" x2="490" y2="95" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/></svg><p class="cap">Table ek RPC chalata hai aur reply ko rows (Views) mein kaat deta hai. Har row ki ek key aur named fields hoti hain.</p></div>
<h3>Lab mein ready-made tables</h3>
<table class="cmp"><tr><th>Import</th><th>Table class</th><th>Dikhata hai</th></tr><tr><td><code>jnpr.junos.op.ospf</code></td><td>OspfNeighborTable</td><td>OSPF neighbours</td></tr><tr><td><code>jnpr.junos.op.bgp</code></td><td>BGPNeighborTable</td><td>BGP peers aur counters</td></tr><tr><td><code>jnpr.junos.op.ethport</code></td><td>EthPortTable</td><td>Ethernet ports, state, speed</td></tr><tr><td><code>jnpr.junos.op.routes</code></td><td>RouteTable</td><td>Routing table</td></tr><tr><td><code>jnpr.junos.op.lldp</code></td><td>LLDPNeighborTable</td><td>LLDP neighbours</td></tr><tr><td><code>jnpr.junos.op.arp</code></td><td>ArpTable</td><td>ARP entries</td></tr><tr><td><code>jnpr.junos.op.phyport</code></td><td>PhyPortTable, PhyPortStatsTable, PhyPortErrorTable</td><td>Physical port details aur counters</td></tr><tr><td><code>jnpr.junos.op.inventory</code>, <code>.fpc</code></td><td>ModuleTable, ChassisInventoryTable, FpcHwTable</td><td>Hardware inventory</td></tr></table>
<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab yeh nau modules deta hai. Asli PyEZ bahut zyada deta hai (IS-IS, LDP, VLANs, BFD aur aur) aur chapter 7 ka YAML tumhe koi bhi kami hui table jodne deta hai. Jis RPC ka lab device ke paas jawab nahi, us par custom table wahi <code>syntax error</code> deta hai jo asli router deta.</p></div>
<h3>Lab ka step 6: OSPF neighbours</h3><p>Teen lines kaam karti hain: table import karo, device ke saath banao, <code>get()</code> bulao. Loop phir fields ko attributes ki tarah padhta hai. Chapter 5 ki parsing ki 20 lines se compare karo.</p>
<pre class="code">"""ospf_tbl.py - OSPF neighbours of every router from a ready-made op table"""
from jnpr.junos.op.ospf import OspfNeighborTable
from pyezutil import FLEET, device

for name, host in FLEET.items():
    with device(host, gather_facts=False) as dev:
        ospf = OspfNeighborTable(dev).get()
        print("%s: %d neighbours" % (name, len(ospf)))
        for n in ospf:
            print("  %-10s %-12s %-5s via %s" % (n.neighbor_address, n.neighbor_id, n.neighbor_state, n.interface_name))</pre>
<pre class="out">AUTO01$ python3 ospf_tbl.py
J1: 3 neighbours
  10.99.0.12 10.255.0.2   Full  via ge-0/0/0.0
  10.99.0.13 10.255.0.3   Full  via ge-0/0/0.0
  10.12.0.2  10.255.0.2   Full  via ge-0/0/1.0
<span class="hl">J2: 4 neighbours</span>
  10.99.0.11 10.255.0.1   Full  via ge-0/0/0.0
  10.99.0.13 10.255.0.3   Full  via ge-0/0/0.0
  10.12.0.1  10.255.0.1   Full  via ge-0/0/1.0
  10.23.0.2  10.255.0.3   Full  via ge-0/0/2.0
J3: 3 neighbours
  10.99.0.11 10.255.0.1   Full  via ge-0/0/0.0
  10.99.0.12 10.255.0.2   Full  via ge-0/0/0.0
  10.23.0.1  10.255.0.2   Full  via ge-0/0/1.0</pre>
<p>J2 chain ke beech mein hai, isliye uske chaar neighbours hain: management segment par J1 aur J3, aur do core links par J1 aur J3. J1 aur J3 ke teen teen hain.</p>
<h3>Table ke saath kya kar sakte ho</h3><p>Table chhota container hai jisme kuch verbs hain. Neeche ka tour J2 par chaar alag tables use karta hai aur woh aadatein dikhata hai jo galtiyan bachati hain.</p>
<pre class="code">from jnpr.junos.op.bgp import BGPNeighborTable
from jnpr.junos.op.ethport import EthPortTable
from jnpr.junos.op.routes import RouteTable
from jnpr.junos.op.lldp import LLDPNeighborTable
from pyezutil import FLEET, device

with device(FLEET["J2"], gather_facts=False) as dev:
    ospf_empty = BGPNeighborTable(dev)
    print(ospf_empty)
    try:
        len(ospf_empty)
    except RuntimeError as err:
        print("RuntimeError:", err)
    bgp = BGPNeighborTable(dev).get()
    print(bgp, bgp.keys())
    peer = bgp["10.255.0.3"]
    print(peer.peer_state, peer.peer_as, peer.flap_count, peer.input_messages)
    print(bgp["10.1.1.1"])
    eth = EthPortTable(dev).get()
    for p in eth:
        print(p.name, p.oper, p.admin, p.speed)
    routes = RouteTable(dev).get()
    print(len(routes), "routes")
    for r in routes[:3]:
        print(r.rt_destination, r.protocol, r.preference, r.local_interface)
    print(LLDPNeighborTable(dev).get().keys())</pre>
<pre class="out">AUTO01$ python3 tables_tour.py
BGPNeighborTable:10.99.0.12: Data not loaded
<span class="hl">RuntimeError: Table is empty, use get()</span>
BGPNeighborTable:10.99.0.12: 2 items ['10.255.0.1', '10.255.0.3']
<span class="hl">Established 65000 0 4</span>
<span class="hl">None</span>
ge-0/0/0 up up 1Gbps
ge-0/0/1 up up 1Gbps
ge-0/0/2 up up 1Gbps
ge-0/0/3 down up 1000mbps
ge-0/0/4 down up 1000mbps
ge-0/0/5 down up 1000mbps
10 routes
10.12.0.0/30 Direct 0 ge-0/0/1.0
10.12.0.2/32 Local 0 ge-0/0/1.0
10.23.0.0/30 Direct 0 ge-0/0/2.0
['ge-0/0/1', 'ge-0/0/2']</pre>
<ul><li><b>get() table bharta hai.</b> Usse pehle table <code>Data not loaded</code> kehta hai aur <code>len()</code> <code>RuntimeError: Table is empty, use get()</code> raise karta hai.</li><li><b>Key se lookup.</b> <code>bgp["10.255.0.3"]</code> row lautata hai; jo key maujood nahi uske liye <code>None</code> milta hai, isliye fields padhne se pehle test karo.</li><li><b>Iteration</b> rows (Views) deta hai. <code>keys()</code>, <code>values()</code>, <code>items()</code> aur <code>routes[:3]</code> jaisa slicing chalte hain.</li><li><b>Fields attributes hain</b>: <code>peer.peer_state</code>, <code>p.oper</code>.</li><li><code>to_json()</code> table ko file ya API ke liye JSON mein badalta hai.</li></ul>
<p>Dhyan do ki BGP table <code>peer_as</code> ko text deti hai par <code>flap_count</code> jaise counters ko numbers: har field ka type table ke author ne chuna hai. Tables apna RPC hamesha whitespace normalise karke chalate hain, isliye chapter 5 ke padded strings kabhi nahi milte.</p>
<div class="warn"><p><b>Aam galtiyan.</b> <code>get()</code> se pehle table padhna. Missing key ke fields padhna (<code>None.peer_state</code> <code>AttributeError</code> se fail hota hai). Maan lena ki field number hai jabki woh text hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get()</code> table ko hi lautata hai, isliye <code>OspfNeighborTable(dev).get()</code> ek line mein chal sakta hai. Table object aur uske andar ki rows (Views) alag cheezein hain.</p></div>
<div class="scn"><h4>Do sau ki jagah baarah lines</h4><p>Ek team interface status ke liye 200 lines ke regexes ka module rakhti thi. Ek naye engineer ne use <code>EthPortTable</code> se badal diya: module baarah lines ka ho gaya, aur naya code speed aur duplex bhi report karta tha jo purane regexes kabhi handle nahi karte the.</p><p><b>Lesson:</b> parse karne se pehle dekho ki table pehle se hai ya nahi.</p></div>
<div class="iv"><p class="q">"PyEZ operational table kya hai?"</p><p>RPC, repeat hone wale element, uski key aur named fields ke view ki reusable definition. <code>Table(dev).get()</code> RPC chalata hai aur aisi rows deta hai jinhe key se dhoondh sakte hain ya iterate kar sakte hain. Juniper common commands ke liye tables deta hai, aur apne tables YAML mein likh sakta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Table = RPC + repeating item + key + fields ka View.</li><li><code>Table(dev).get()</code> use load karta hai; usse pehle woh khaali hai.</li><li>Rows key se dhoondho; missing key <code>None</code> deti hai.</li><li>Fields attributes hain; <code>to_json()</code> export karta hai.</li><li>Lab nau <code>jnpr.junos.op</code> modules deta hai.</li></ul></div>
`}};export{e as default};