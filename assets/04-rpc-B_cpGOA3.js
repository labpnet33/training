var e={id:`rpc`,h:{en:`Operational commands as RPCs`,hi:`Operational commands RPC ki tarah`},body:{en:`
<p>Facts cover the basics. For everything else (interfaces, routes, BGP, OSPF) PyEZ lets you call the operational command as an <b>RPC</b>, a remote procedure call. Each Junos command that prints something has an XML twin. <code>dev.rpc</code> is the object that builds the twin for you, sends it and returns the reply.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="20" width="190" height="44" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="115" y="38" text-anchor="middle" font-size="13" class="svg-ink">show bgp summary</text><text x="115" y="54" text-anchor="middle" font-size="13" class="svg-ink">the CLI command</text><rect x="225" y="20" width="190" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="38" text-anchor="middle" font-size="13" class="svg-ink">&lt;get-bgp-summary-information/&gt;</text><text x="320" y="54" text-anchor="middle" font-size="13" class="svg-ink">the RPC element</text><rect x="430" y="20" width="190" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="525" y="38" text-anchor="middle" font-size="13" class="svg-ink">dev.rpc.get_bgp_summary_</text><text x="525" y="54" text-anchor="middle" font-size="13" class="svg-ink">information()</text><line x1="210" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="415" y1="42" x2="430" y2="42" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="100" text-anchor="middle" font-size="12" class="svg-muted">hyphens become underscores in the Python name</text><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">find the RPC name:  show bgp summary | display xml rpc</text><text x="320" y="150" text-anchor="middle" font-size="12" class="svg-muted">or ask PyEZ:  dev.display_xml_rpc("show bgp summary")</text></svg><p class="cap">Every operational command has an RPC twin. The Python name is the RPC name with underscores.</p></div>
<h3>Finding the RPC for a command</h3><p>You do not have to guess. On the router CLI, add <code>| display xml rpc</code> to any show command. In PyEZ, <code>dev.display_xml_rpc()</code> does the same and returns the XML. Here are seven common commands:</p>
<pre class="code">from pyezutil import FLEET, device

CMDS = ["show interfaces terse", "show route", "show bgp summary", "show ospf neighbor",
        "show lldp neighbors", "show arp", "show system uptime"]
with device(FLEET["J1"], gather_facts=False) as dev:
    for c in CMDS:
        print("%-24s -&gt; %s" % (c, dev.display_xml_rpc(c, format="text").replace("\\n", "").replace("  ", "")))</pre>
<pre class="out">AUTO01$ python3 rpcnames.py
show interfaces terse    -&gt; &lt;get-interface-information&gt;&lt;terse/&gt;&lt;/get-interface-information&gt;
show route               -&gt; &lt;get-route-information/&gt;
<span class="hl">show bgp summary         -&gt; &lt;get-bgp-summary-information/&gt;</span>
show ospf neighbor       -&gt; &lt;get-ospf-neighbor-information/&gt;
show lldp neighbors      -&gt; &lt;get-lldp-neighbors-information/&gt;
show arp                 -&gt; &lt;get-arp-table-information/&gt;
show system uptime       -&gt; &lt;get-system-uptime-information/&gt;</pre>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab maps the commands above plus <code>show interfaces</code> variants and <code>show configuration</code>. For any other command <code>display_xml_rpc()</code> returns <code>invalid command: ...</code>. On real Junos every command has a mapping.</p></div>
<h3>Arguments become child elements</h3><p>The rule is simple. Each keyword argument becomes a child element of the RPC. <code>True</code> becomes an empty element (a flag such as <code>&lt;terse/&gt;</code>), a string becomes the text of the element, and <code>False</code> or <code>None</code> are dropped. Underscores in names become hyphens. A few extra keywords control PyEZ itself: <code>normalize=True</code> strips whitespace, <code>dev_timeout=</code> sets the wait for this call only, and <code>ignore_warning=True</code> hides warnings.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    up = dev.rpc.get_system_uptime_information()
    print(up.tag, up.findtext(".//time-length"))
    sw = dev.rpc.get_software_information()
    print(sw.tag, sw.findtext("host-name"), sw.findtext("product-model"))
    rt = dev.rpc.get_route_information(table="inet.0", normalize=True)
    print(rt.tag, rt.findtext("route-table/table-name"), rt.findtext("route-table/active-route-count"))
    ifs = dev.rpc.get_interface_information(terse=True, normalize=True)
    print(ifs.tag, [p.findtext("name") for p in ifs.findall("physical-interface")][:4])
    one = dev.rpc.get_interface_information(terse=True, interface_name=["ge-0/0/0", "ge-0/0/1"], normalize=True)
    print([p.findtext("name") for p in one.findall("physical-interface")])
    x = dev.execute(etree.XML("&lt;get-system-uptime-information/&gt;"))
    print("execute:", x.tag)
    cfg = dev.rpc.get_config(filter_xml="&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;", options={"format": "set"})
    print(cfg.tag, cfg.text.strip())</pre>
<pre class="out">AUTO01$ python3 rpcargs.py
system-uptime-information 00:01:08
software-information PUN-J1 vmx
route-information inet.0 9
interface-information ['dsc', 'fxp0', 'ge-0/0/0', 'ge-0/0/1']
['ge-0/0/1']
<span class="hl">execute: system-uptime-information</span>
<span class="hl">configuration-set set system host-name PUN-J1</span></pre>
<p>The reply is the first child of the <code>rpc-reply</code>, so you get <code>system-uptime-information</code>, <code>route-information</code> and so on as lxml elements. <code>dev.execute()</code> sends an element you built yourself, which is the escape hatch for RPCs PyEZ has no friendly name for. <code>dev.rpc.get_config()</code> reads configuration; the lab supports XML replies and <code>options={"format": "set"}</code>.</p>
<h3>Step 3 of the lab: the same question twice</h3><p><code>rpcview.py</code> asks for the terse status of one interface as an RPC and then as a CLI string. The RPC answer is a tree; the CLI answer is text.</p>
<pre class="code">"""rpcview.py - one question, asked as an RPC and as a CLI command"""
from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1", normalize=True)
    print(xml.tag, len(xml))
    print(etree.tostring(xml, pretty_print=True).decode())
    for li in xml.findall("logical-interface"):
        print(li.findtext("name"), li.findtext("oper-status"), li.findtext("address-family/interface-address/ifa-local"))
    print(dev.cli("show interfaces ge-0/0/1 terse", warning=False))</pre>
<pre class="out">AUTO01$ python3 rpcview.py
interface-information 2
&lt;interface-information style="terse"&gt;
  &lt;physical-interface&gt;
    &lt;name&gt;ge-0/0/1&lt;/name&gt;
    &lt;admin-status&gt;up&lt;/admin-status&gt;
    &lt;oper-status&gt;up&lt;/oper-status&gt;
  &lt;/physical-interface&gt;
  &lt;logical-interface&gt;
    &lt;name&gt;ge-0/0/1.0&lt;/name&gt;
    &lt;admin-status&gt;up&lt;/admin-status&gt;
    &lt;oper-status&gt;up&lt;/oper-status&gt;
    &lt;filter-information/&gt;
    &lt;address-family&gt;
      &lt;address-family-name&gt;inet&lt;/address-family-name&gt;
      &lt;interface-address&gt;
        &lt;ifa-local emit="emit"&gt;10.12.0.1/30&lt;/ifa-local&gt;
      &lt;/interface-address&gt;
    &lt;/address-family&gt;
  &lt;/logical-interface&gt;
&lt;/interface-information&gt;

<span class="hl">ge-0/0/1.0 up 10.12.0.1/30</span>

Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    up
<span class="hl">ge-0/0/1.0              up    up   inet     10.12.0.1/30</span></pre>
<p>The two answers carry the same facts, but only the first can be read by tag name: the address sits in <code>address-family/interface-address/ifa-local</code>. Chapter 5 turns such a tree into a dict.</p>
<h3>dev.cli: for debugging only</h3><p><code>dev.cli("show ...")</code> sends a CLI command and returns text. It is handy at a prompt. PyEZ prints a warning because production scripts should use RPCs. Silence it with <code>warning=False</code> only when you mean it.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    text = dev.cli("show interfaces ge-0/0/1 terse")
    print(type(text).__name__, len(text.splitlines()))
    print(dev.cli("show interfaces ge-0/0/1 terse", warning=False).strip().splitlines()[-1])</pre>
<pre class="out">AUTO01$ python3 cli_warn.py
<span class="hl">RuntimeWarning: CLI command is for debug use only!</span>
str 4
ge-0/0/1.0              up    up   inet     10.12.0.1/30</pre>
<p>On real gear a file path precedes the warning; it was shortened here.</p>
<div class="warn"><p><b>Common mistakes.</b> Writing <code>get-interface-information</code> with hyphens in Python (a syntax error). Forgetting that the reply text may carry newlines (chapter 5). Sending a configuration command through <code>dev.cli</code>: use the Config class from the next module.</p></div>
<div class="scn"><h4>The RPC nobody could name</h4><p>An engineer needed the PoE status of a switch and could not find a PyEZ helper. He ran the command on the CLI with <code>| display xml rpc</code>, copied the element name, turned its hyphens into underscores and called it on <code>dev.rpc</code>. It worked on the first try, and the same trick found three other RPCs that week.</p><p><b>Lesson:</b> if a command exists, an RPC exists.</p></div>
<div class="iv"><p class="q">"How do you call a Junos operational command from PyEZ?"</p><p>I find its RPC name with <code>| display xml rpc</code> or <code>dev.display_xml_rpc()</code>, then call <code>dev.rpc.name_with_underscores(...)</code>. Keyword arguments become child elements, <code>True</code> makes a flag, and the reply is an lxml element that I read by tag name.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>dev.rpc.get_x_information()</code> sends <code>&lt;get-x-information/&gt;</code>.</li><li>Keyword arguments become child elements; <code>True</code> makes an empty flag.</li><li>Find names with <code>| display xml rpc</code> or <code>display_xml_rpc()</code>.</li><li><code>dev.execute()</code> sends an element you built.</li><li><code>dev.cli</code> is for debugging and prints a warning.</li></ul></div>
`,hi:`
<p>Facts basics cover karte hain. Baaki sab ke liye (interfaces, routes, BGP, OSPF) PyEZ operational command ko <b>RPC</b>, remote procedure call, ki tarah bulane deta hai. Jo bhi Junos command kuch print karta hai uska ek XML twin hota hai. <code>dev.rpc</code> woh object hai jo twin banata hai, bhejta hai aur reply lautata hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="20" y="20" width="190" height="44" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="115" y="38" text-anchor="middle" font-size="13" class="svg-ink">show bgp summary</text><text x="115" y="54" text-anchor="middle" font-size="13" class="svg-ink">CLI command</text><rect x="225" y="20" width="190" height="44" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="38" text-anchor="middle" font-size="13" class="svg-ink">&lt;get-bgp-summary-information/&gt;</text><text x="320" y="54" text-anchor="middle" font-size="13" class="svg-ink">RPC element</text><rect x="430" y="20" width="190" height="44" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="525" y="38" text-anchor="middle" font-size="13" class="svg-ink">dev.rpc.get_bgp_summary_</text><text x="525" y="54" text-anchor="middle" font-size="13" class="svg-ink">information()</text><line x1="210" y1="42" x2="225" y2="42" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="415" y1="42" x2="430" y2="42" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="100" text-anchor="middle" font-size="12" class="svg-muted">Python naam mein hyphens underscores ban jaate hain</text><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">RPC naam dhoondho:  show bgp summary | display xml rpc</text><text x="320" y="150" text-anchor="middle" font-size="12" class="svg-muted">ya PyEZ se poochho:  dev.display_xml_rpc("show bgp summary")</text></svg><p class="cap">Har operational command ka ek RPC twin hota hai. Python naam wahi RPC naam hai, underscores ke saath.</p></div>
<h3>Command ka RPC dhoondhna</h3><p>Andaza lagane ki zaroorat nahi. Router CLI par kisi bhi show command mein <code>| display xml rpc</code> jodo. PyEZ mein <code>dev.display_xml_rpc()</code> wahi karta hai aur XML lautata hai. Saat common commands:</p>
<pre class="code">from pyezutil import FLEET, device

CMDS = ["show interfaces terse", "show route", "show bgp summary", "show ospf neighbor",
        "show lldp neighbors", "show arp", "show system uptime"]
with device(FLEET["J1"], gather_facts=False) as dev:
    for c in CMDS:
        print("%-24s -&gt; %s" % (c, dev.display_xml_rpc(c, format="text").replace("\\n", "").replace("  ", "")))</pre>
<pre class="out">AUTO01$ python3 rpcnames.py
show interfaces terse    -&gt; &lt;get-interface-information&gt;&lt;terse/&gt;&lt;/get-interface-information&gt;
show route               -&gt; &lt;get-route-information/&gt;
<span class="hl">show bgp summary         -&gt; &lt;get-bgp-summary-information/&gt;</span>
show ospf neighbor       -&gt; &lt;get-ospf-neighbor-information/&gt;
show lldp neighbors      -&gt; &lt;get-lldp-neighbors-information/&gt;
show arp                 -&gt; &lt;get-arp-table-information/&gt;
show system uptime       -&gt; &lt;get-system-uptime-information/&gt;</pre>
<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab upar ke commands, <code>show interfaces</code> ke variants aur <code>show configuration</code> map karta hai. Baaki commands ke liye <code>display_xml_rpc()</code> <code>invalid command: ...</code> lautata hai. Asli Junos par har command ka mapping hota hai.</p></div>
<h3>Arguments child elements ban jaate hain</h3><p>Rule simple hai. Har keyword argument RPC ka child element ban jaata hai. <code>True</code> khaali element ban jaata hai (flag jaise <code>&lt;terse/&gt;</code>), string element ka text banti hai, aur <code>False</code> ya <code>None</code> hata diye jaate hain. Naam ke underscores hyphens ban jaate hain. Kuch extra keywords PyEZ ko khud control karte hain: <code>normalize=True</code> whitespace hatata hai, <code>dev_timeout=</code> sirf is call ka wait set karta hai, aur <code>ignore_warning=True</code> warnings chhupata hai.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    up = dev.rpc.get_system_uptime_information()
    print(up.tag, up.findtext(".//time-length"))
    sw = dev.rpc.get_software_information()
    print(sw.tag, sw.findtext("host-name"), sw.findtext("product-model"))
    rt = dev.rpc.get_route_information(table="inet.0", normalize=True)
    print(rt.tag, rt.findtext("route-table/table-name"), rt.findtext("route-table/active-route-count"))
    ifs = dev.rpc.get_interface_information(terse=True, normalize=True)
    print(ifs.tag, [p.findtext("name") for p in ifs.findall("physical-interface")][:4])
    one = dev.rpc.get_interface_information(terse=True, interface_name=["ge-0/0/0", "ge-0/0/1"], normalize=True)
    print([p.findtext("name") for p in one.findall("physical-interface")])
    x = dev.execute(etree.XML("&lt;get-system-uptime-information/&gt;"))
    print("execute:", x.tag)
    cfg = dev.rpc.get_config(filter_xml="&lt;configuration&gt;&lt;system&gt;&lt;host-name/&gt;&lt;/system&gt;&lt;/configuration&gt;", options={"format": "set"})
    print(cfg.tag, cfg.text.strip())</pre>
<pre class="out">AUTO01$ python3 rpcargs.py
system-uptime-information 00:01:08
software-information PUN-J1 vmx
route-information inet.0 9
interface-information ['dsc', 'fxp0', 'ge-0/0/0', 'ge-0/0/1']
['ge-0/0/1']
<span class="hl">execute: system-uptime-information</span>
<span class="hl">configuration-set set system host-name PUN-J1</span></pre>
<p>Reply <code>rpc-reply</code> ka pehla child hota hai, isliye <code>system-uptime-information</code>, <code>route-information</code> jaise elements lxml elements ki tarah milte hain. <code>dev.execute()</code> woh element bhejta hai jo tumne khud banaya, un RPCs ke liye jinka PyEZ mein friendly naam nahi. <code>dev.rpc.get_config()</code> configuration padhta hai; lab XML replies aur <code>options={"format": "set"}</code> support karta hai.</p>
<h3>Lab ka step 3: wahi sawaal do baar</h3><p><code>rpcview.py</code> ek interface ka terse status pehle RPC se aur phir CLI string se maangti hai. RPC ka jawab tree hai; CLI ka jawab text.</p>
<pre class="code">"""rpcview.py - one question, asked as an RPC and as a CLI command"""
from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1", normalize=True)
    print(xml.tag, len(xml))
    print(etree.tostring(xml, pretty_print=True).decode())
    for li in xml.findall("logical-interface"):
        print(li.findtext("name"), li.findtext("oper-status"), li.findtext("address-family/interface-address/ifa-local"))
    print(dev.cli("show interfaces ge-0/0/1 terse", warning=False))</pre>
<pre class="out">AUTO01$ python3 rpcview.py
interface-information 2
&lt;interface-information style="terse"&gt;
  &lt;physical-interface&gt;
    &lt;name&gt;ge-0/0/1&lt;/name&gt;
    &lt;admin-status&gt;up&lt;/admin-status&gt;
    &lt;oper-status&gt;up&lt;/oper-status&gt;
  &lt;/physical-interface&gt;
  &lt;logical-interface&gt;
    &lt;name&gt;ge-0/0/1.0&lt;/name&gt;
    &lt;admin-status&gt;up&lt;/admin-status&gt;
    &lt;oper-status&gt;up&lt;/oper-status&gt;
    &lt;filter-information/&gt;
    &lt;address-family&gt;
      &lt;address-family-name&gt;inet&lt;/address-family-name&gt;
      &lt;interface-address&gt;
        &lt;ifa-local emit="emit"&gt;10.12.0.1/30&lt;/ifa-local&gt;
      &lt;/interface-address&gt;
    &lt;/address-family&gt;
  &lt;/logical-interface&gt;
&lt;/interface-information&gt;

<span class="hl">ge-0/0/1.0 up 10.12.0.1/30</span>

Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    up
<span class="hl">ge-0/0/1.0              up    up   inet     10.12.0.1/30</span></pre>
<p>Dono jawab wahi facts rakhte hain, par sirf pehla tag name se padha ja sakta hai: address <code>address-family/interface-address/ifa-local</code> mein hai. Chapter 5 aise tree ko dict mein badalta hai.</p>
<h3>dev.cli: sirf debugging ke liye</h3><p><code>dev.cli("show ...")</code> CLI command bhejta hai aur text lautata hai. Prompt par kaam aata hai. PyEZ warning print karta hai kyunki production scripts ko RPCs use karne chahiye. Warning sirf tab chhupao jab sach mein chahte ho.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    text = dev.cli("show interfaces ge-0/0/1 terse")
    print(type(text).__name__, len(text.splitlines()))
    print(dev.cli("show interfaces ge-0/0/1 terse", warning=False).strip().splitlines()[-1])</pre>
<pre class="out">AUTO01$ python3 cli_warn.py
<span class="hl">RuntimeWarning: CLI command is for debug use only!</span>
str 4
ge-0/0/1.0              up    up   inet     10.12.0.1/30</pre>
<p>Asli gear par warning ke aage file path hota hai; yahan chhota kiya gaya hai.</p>
<div class="warn"><p><b>Aam galtiyan.</b> Python mein <code>get-interface-information</code> hyphens ke saath likhna (syntax error). Bhoolna ki reply text mein newlines ho sakte hain (chapter 5). Configuration command ko <code>dev.cli</code> se bhejna: agle module ki Config class use karo.</p></div>
<div class="scn"><h4>Woh RPC jiska naam kisi ko nahi pata tha</h4><p>Ek engineer ko switch ka PoE status chahiye tha aur PyEZ helper nahi mila. Usne CLI par <code>| display xml rpc</code> ke saath command chalaya, element ka naam copy kiya, hyphens ko underscores banaya aur <code>dev.rpc</code> par bula diya. Pehli koshish mein chala, aur isi trick se us hafte teen aur RPCs mile.</p><p><b>Lesson:</b> command hai to RPC bhi hai.</p></div>
<div class="iv"><p class="q">"PyEZ se Junos operational command kaise bulate ho?"</p><p>Main uska RPC naam <code>| display xml rpc</code> ya <code>dev.display_xml_rpc()</code> se dhoondhta hoon, phir <code>dev.rpc.name_with_underscores(...)</code> bulata hoon. Keyword arguments child elements ban jaate hain, <code>True</code> flag banata hai, aur reply lxml element hai jise main tag name se padhta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>dev.rpc.get_x_information()</code> <code>&lt;get-x-information/&gt;</code> bhejta hai.</li><li>Keyword arguments child elements ban jaate hain; <code>True</code> khaali flag banata hai.</li><li>Naam <code>| display xml rpc</code> ya <code>display_xml_rpc()</code> se dhoondho.</li><li><code>dev.execute()</code> tumhara banaya element bhejta hai.</li><li><code>dev.cli</code> debugging ke liye hai aur warning print karta hai.</li></ul></div>
`}};export{e as default};