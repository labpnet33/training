var e={id:`xml-to-dict`,h:{en:`From XML reply to a plain dict`,hi:`XML reply se plain dict tak`},body:{en:`
<p>An RPC reply is an lxml element tree, the same kind you parsed in <code>adv-xml</code>. It is rich, but a report should not be full of <code>findtext</code> calls. The pattern of this chapter is to read the tree <b>once</b>, in one small function, and return a plain dict. Everything after that (tables, JSON files, tests) works on the dict.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="65" y="56" text-anchor="middle" font-size="13" class="svg-ink">Device</text><text x="65" y="72" text-anchor="middle" font-size="13" class="svg-ink">dev.rpc...()</text><rect x="150" y="30" width="110" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="205" y="56" text-anchor="middle" font-size="13" class="svg-ink">XML tree</text><text x="205" y="72" text-anchor="middle" font-size="13" class="svg-ink">bgp-information</text><rect x="290" y="30" width="110" height="60" rx="8" fill="#fde68a" stroke="#64748b"/><text x="345" y="56" text-anchor="middle" font-size="13" class="svg-ink">find / findtext</text><text x="345" y="72" text-anchor="middle" font-size="13" class="svg-ink">int(), strip()</text><rect x="430" y="30" width="90" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="56" text-anchor="middle" font-size="13" class="svg-ink">dict</text><text x="475" y="72" text-anchor="middle" font-size="13" class="svg-ink">peers{...}</text><rect x="545" y="30" width="85" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="587" y="56" text-anchor="middle" font-size="13" class="svg-ink">report</text><text x="587" y="72" text-anchor="middle" font-size="13" class="svg-ink">exit code</text><line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="520" y1="60" x2="545" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">read by tag name, convert types once, then forget the XML</text></svg><p class="cap">From router to report. The XML lives only inside one small function.</p></div>
<h3>Six calls you need</h3>
<table class="cmp"><tr><th>Call</th><th>Returns</th><th>Use for</th></tr><tr><td><code>el.find("a/b")</code></td><td>first matching element or None</td><td>one child, attributes</td></tr><tr><td><code>el.findall("a")</code></td><td>list of elements (empty list if none)</td><td>repeated rows such as peers</td></tr><tr><td><code>el.findtext("a", "0")</code></td><td>text, or the default</td><td>a safe leaf value</td></tr><tr><td><code>el.get("seconds")</code></td><td>attribute text</td><td>values stored in attributes</td></tr><tr><td><code>el.iter("tag")</code></td><td>every descendant with that tag</td><td>search at any depth</td></tr><tr><td><code>el.xpath("//a/text()")</code></td><td>list of results</td><td>XPath expressions</td></tr></table>
<h3>Look at the real reply first</h3><p>Before you write a parser, print one element of the reply. This shows one BGP peer from J1. Notice that the interesting numbers are tags, and the uptime is an attribute: <code>elapsed-time seconds="63"</code>.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_bgp_summary_information()
    print(xml.tag, [c.tag for c in xml])
    peer = xml.find("bgp-peer")
    print(etree.tostring(peer, pretty_print=True).decode())</pre>
<pre class="out">AUTO01$ python3 rawpeer.py
bgp-information ['group-count', 'peer-count', 'down-peer-count', 'bgp-rib', 'bgp-peer', 'bgp-peer']
&lt;bgp-peer style="terse"&gt;
  &lt;peer-address&gt;10.255.0.2&lt;/peer-address&gt;
  &lt;peer-as&gt;65000&lt;/peer-as&gt;
  &lt;input-messages&gt;4&lt;/input-messages&gt;
  &lt;output-messages&gt;4&lt;/output-messages&gt;
  &lt;route-queue-count&gt;0&lt;/route-queue-count&gt;
  &lt;flap-count&gt;0&lt;/flap-count&gt;
<span class="hl">  &lt;elapsed-time seconds="63"&gt;00:01:03&lt;/elapsed-time&gt;</span>
<span class="hl">  &lt;peer-state format="Establ"&gt;Established&lt;/peer-state&gt;</span>
  &lt;bgp-rib style="terse"&gt;
    &lt;name&gt;inet.0&lt;/name&gt;
    &lt;active-prefix-count&gt;0&lt;/active-prefix-count&gt;
    &lt;received-prefix-count&gt;0&lt;/received-prefix-count&gt;
    &lt;accepted-prefix-count&gt;0&lt;/accepted-prefix-count&gt;
    &lt;suppressed-prefix-count&gt;0&lt;/suppressed-prefix-count&gt;
  &lt;/bgp-rib&gt;
&lt;/bgp-peer&gt;</pre>
<h3>The whitespace trap</h3><p>On Junos, many XML text values arrive padded with newlines. Compare the interface name with the BGP state, then fix the first with <code>normalize=True</code> (an RPC option) or <code>.strip()</code>.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    raw = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1")
    print(repr(raw.findtext("physical-interface/name")))
    print(repr(raw.findtext("physical-interface/name").strip()))
    clean = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1", normalize=True)
    print(repr(clean.findtext("physical-interface/name")))
    bgp = dev.rpc.get_bgp_summary_information()
    print(repr(bgp.findtext("bgp-peer/peer-state")))</pre>
<pre class="out">AUTO01$ python3 pad.py
<span class="hl">'\\nge-0/0/1\\n'</span>
'ge-0/0/1'
'ge-0/0/1'
'Established'</pre>
<p>Without cleaning, <code>name == "ge-0/0/1"</code> is <code>False</code> and the bug is invisible in print output. Tables (chapter 6) always normalize for you.</p>
<h3>find, findall and the silent empty list</h3><p>The most dangerous mistake is a wrong tag name in <code>findall</code>: it does not raise, it returns an empty list. The last line shows both the wrong and the right name.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_bgp_summary_information()
    print(xml.xpath("//bgp-peer/peer-address/text()"))
    print([a.text for a in xml.iter("peer-address")])
    print(xml.find("bgp-peer/elapsed-time").get("seconds"), xml.find("bgp-peer/elapsed-time").text)
    print(xml.findtext("no-such-element"), xml.findtext("no-such-element", "0"))
    print(len(xml.findall("bgp-peers")), len(xml.findall("bgp-peer")))
    first = xml.find("bgp-peer")
    print(first.tag, [c.tag for c in first][:5])
    print(etree.tostring(first.find("peer-state")).decode().strip())</pre>
<pre class="out">AUTO01$ python3 xpath.py
['10.255.0.2', '10.255.0.3']
['10.255.0.2', '10.255.0.3']
69 00:01:09
None 0
<span class="hl">0 2</span>
bgp-peer ['peer-address', 'peer-as', 'input-messages', 'output-messages', 'route-queue-count']
&lt;peer-state format="Establ"&gt;Established&lt;/peer-state&gt;</pre>
<h3>Step 4 of the lab: bgp_summary(dev)</h3><p>Now the function. It asks the RPC, reads the counters with a default so an empty reply does not crash, and builds one entry per peer. Every number is converted with <code>int()</code> once, here.</p>
<pre class="code">"""bgp.py - bgp_summary(dev) turns the RPC reply into a plain dict"""
import json

from pyezutil import FLEET, device


def bgp_summary(dev):
    xml = dev.rpc.get_bgp_summary_information()
    out = {"peer_count": int(xml.findtext("peer-count", "0")), "down_peers": int(xml.findtext("down-peer-count", "0")), "peers": {}}
    for p in xml.findall("bgp-peer"):
        addr = p.findtext("peer-address").strip()
        out["peers"][addr] = {
            "as": int(p.findtext("peer-as")),
            "state": p.findtext("peer-state").strip(),
            "in_msgs": int(p.findtext("input-messages")),
            "flaps": int(p.findtext("flap-count")),
            "up_seconds": int(p.find("elapsed-time").get("seconds")),
        }
    return out


if __name__ == "__main__":
    with device(FLEET["J1"], gather_facts=False) as dev:
        print(json.dumps(bgp_summary(dev), indent=2))</pre>
<pre class="out">AUTO01$ python3 bgp.py
{
  "peer_count": 2,
  "down_peers": 0,
  "peers": {
    "10.255.0.2": {
      "as": 65000,
<span class="hl">      "state": "Established",</span>
      "in_msgs": 4,
      "flaps": 0,
<span class="hl">      "up_seconds": 73</span>
    },
    "10.255.0.3": {
      "as": 65000,
<span class="hl">      "state": "Established",</span></pre>
<h3>The fleet report</h3><p><code>bgpfleet.py</code> imports the function, prints one row per peer, writes <code>bgp_report.json</code> and exits <b>1</b> when anything is wrong. The exit code is what lets cron, a CI job or a monitoring system react without parsing your text (see <code>py-tools</code>).</p>
<pre class="code">"""bgpfleet.py - BGP state of every router, a JSON report and an exit code for cron"""
import json
import sys

from jnpr.junos.exception import ConnectError
from bgp import bgp_summary
from pyezutil import FLEET, device

report = {}
problems = 0
print("%-4s %-12s %-6s %-12s %5s %8s" % ("NAME", "PEER", "AS", "STATE", "FLAPS", "UP(SEC)"))
for name, host in FLEET.items():
    try:
        with device(host, gather_facts=False) as dev:
            report[name] = bgp_summary(dev)
    except ConnectError as err:
        print("%-4s UNREACHABLE  %r" % (name, err))
        problems += 1
        continue
    for addr, p in report[name]["peers"].items():
        print("%-4s %-12s %-6d %-12s %5d %8d" % (name, addr, p["as"], p["state"], p["flaps"], p["up_seconds"]))
        if p["state"] != "Established":
            problems += 1
with open("bgp_report.json", "w") as f:
    json.dump(report, f, indent=2)
print("problems: %d (report saved in bgp_report.json)" % problems)
sys.exit(1 if problems else 0)</pre>
<pre class="out">AUTO01$ python3 bgpfleet.py
NAME PEER         AS     STATE        FLAPS  UP(SEC)
J1   10.255.0.2    65000 Established      0       74
J1   10.255.0.3    65000 Established      0       74
J2   10.255.0.1    65000 Established      0       74
J2   10.255.0.3    65000 Established      0       74
J3   10.255.0.1    65000 Established      0       74
J3   10.255.0.2    65000 Established      0       74
<span class="hl">problems: 0 (report saved in bgp_report.json)</span></pre>
<h3>Break it on purpose</h3><p>A report you never saw fail is a report you cannot trust. On J3, deactivate one neighbour statement (a safe way to take a session down) and run the report again:</p>
<pre class="code"><span class="c"># on J3</span>
configure
deactivate protocols bgp group IBGP neighbor 10.255.0.2
commit and-quit</pre>
<pre class="out">AUTO01$ python3 bgpfleet.py; echo "exit code: $?"
NAME PEER         AS     STATE        FLAPS  UP(SEC)
J1   10.255.0.2    65000 Established      0       66
J1   10.255.0.3    65000 Established      0       66
J2   10.255.0.1    65000 Established      0       66
<span class="hl">J2   10.255.0.3    65000 Active           0        2</span>
J3   10.255.0.1    65000 Established      0       66
<span class="hl">problems: 1 (report saved in bgp_report.json)</span>
<span class="hl">exit code: 1</span></pre>
<p>J2 reports its session to J3 as <code>Active</code>, J3 lists only one peer, and the script exits with 1. To restore, run <code>activate protocols bgp group IBGP neighbor 10.255.0.2</code>, commit, and wait about 30 seconds for the session to come back.</p>
<div class="warn"><p><b>Common mistakes.</b> Comparing a padded string with <code>==</code>. Calling <code>int(el.findtext(...))</code> when the tag may be missing (use a default). Trusting <code>findall</code> to complain about a wrong name.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>find</code> returns <code>None</code> when nothing matches, <code>findall</code> returns <code>[]</code>, and <code>findtext</code> returns <code>None</code> unless you give a default.</p></div>
<div class="scn"><h4>The dashboard that said all green</h4><p>A health script counted Established peers with <code>findall("bgp-peers")</code>. It never matched anything, the count was 0, and the author assumed that meant "no problems found". The dashboard was green for a month while one session was down. A test that broke a session on purpose, as above, would have caught it on day one.</p><p><b>Lesson:</b> test your checks by making them fail.</p></div>
<div class="iv"><p class="q">"How do you turn a PyEZ RPC reply into something a report can use?"</p><p>One function reads the element tree with find, findall and findtext, converts types once, strips whitespace, uses defaults for optional tags and returns a plain dict. Reports, JSON files and tests then use the dict and never touch XML.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Read the XML once, in one function, and return a dict.</li><li>Text values may be padded: use <code>normalize=True</code> or <code>strip()</code>.</li><li>A wrong tag in <code>findall</code> gives an empty list, not an error.</li><li>Use defaults for optional tags; convert numbers with <code>int()</code> once.</li><li>Exit codes make a script usable by cron and CI; test it by breaking something.</li></ul></div>
`,hi:`
<p>RPC reply lxml element tree hota hai, wahi jo tumne <code>adv-xml</code> mein parse kiya. Yeh rich hai, par report ko <code>findtext</code> calls se bhara nahi hona chahiye. Is chapter ka pattern hai tree ko <b>ek baar</b>, ek chhote function mein padhna aur plain dict lautana. Uske baad sab kuch (tables, JSON files, tests) dict par chalta hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img"><defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs><rect x="10" y="30" width="110" height="60" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="65" y="56" text-anchor="middle" font-size="13" class="svg-ink">Device</text><text x="65" y="72" text-anchor="middle" font-size="13" class="svg-ink">dev.rpc...()</text><rect x="150" y="30" width="110" height="60" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="205" y="56" text-anchor="middle" font-size="13" class="svg-ink">XML tree</text><text x="205" y="72" text-anchor="middle" font-size="13" class="svg-ink">bgp-information</text><rect x="290" y="30" width="110" height="60" rx="8" fill="#fde68a" stroke="#64748b"/><text x="345" y="56" text-anchor="middle" font-size="13" class="svg-ink">find / findtext</text><text x="345" y="72" text-anchor="middle" font-size="13" class="svg-ink">int(), strip()</text><rect x="430" y="30" width="90" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="56" text-anchor="middle" font-size="13" class="svg-ink">dict</text><text x="475" y="72" text-anchor="middle" font-size="13" class="svg-ink">peers{...}</text><rect x="545" y="30" width="85" height="60" rx="8" fill="#fed7aa" stroke="#64748b"/><text x="587" y="56" text-anchor="middle" font-size="13" class="svg-ink">report</text><text x="587" y="72" text-anchor="middle" font-size="13" class="svg-ink">exit code</text><line x1="120" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="260" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="400" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><line x1="520" y1="60" x2="545" y2="60" stroke="#64748b" stroke-width="2" marker-end="url(#arw)"/><text x="320" y="125" text-anchor="middle" font-size="12" class="svg-muted">tag name se padho, types ek baar convert karo, phir XML bhool jao</text></svg><p class="cap">Router se report tak. XML sirf ek chhote function ke andar rehta hai.</p></div>
<h3>Chhe calls jo chahiye</h3>
<table class="cmp"><tr><th>Call</th><th>Lautata hai</th><th>Kis liye</th></tr><tr><td><code>el.find("a/b")</code></td><td>pehla matching element ya None</td><td>ek child, attributes</td></tr><tr><td><code>el.findall("a")</code></td><td>elements ki list (na ho to khaali list)</td><td>peers jaisi repeated rows</td></tr><tr><td><code>el.findtext("a", "0")</code></td><td>text, ya default</td><td>surakshit leaf value</td></tr><tr><td><code>el.get("seconds")</code></td><td>attribute ka text</td><td>attributes mein rakhi values</td></tr><tr><td><code>el.iter("tag")</code></td><td>us tag wala har descendant</td><td>kisi bhi depth par khoj</td></tr><tr><td><code>el.xpath("//a/text()")</code></td><td>results ki list</td><td>XPath expressions</td></tr></table>
<h3>Pehle asli reply dekho</h3><p>Parser likhne se pehle reply ka ek element print karo. Yeh J1 ka ek BGP peer dikhata hai. Dhyan do ki zaroori numbers tags hain, aur uptime attribute hai: <code>elapsed-time seconds="63"</code>.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_bgp_summary_information()
    print(xml.tag, [c.tag for c in xml])
    peer = xml.find("bgp-peer")
    print(etree.tostring(peer, pretty_print=True).decode())</pre>
<pre class="out">AUTO01$ python3 rawpeer.py
bgp-information ['group-count', 'peer-count', 'down-peer-count', 'bgp-rib', 'bgp-peer', 'bgp-peer']
&lt;bgp-peer style="terse"&gt;
  &lt;peer-address&gt;10.255.0.2&lt;/peer-address&gt;
  &lt;peer-as&gt;65000&lt;/peer-as&gt;
  &lt;input-messages&gt;4&lt;/input-messages&gt;
  &lt;output-messages&gt;4&lt;/output-messages&gt;
  &lt;route-queue-count&gt;0&lt;/route-queue-count&gt;
  &lt;flap-count&gt;0&lt;/flap-count&gt;
<span class="hl">  &lt;elapsed-time seconds="63"&gt;00:01:03&lt;/elapsed-time&gt;</span>
<span class="hl">  &lt;peer-state format="Establ"&gt;Established&lt;/peer-state&gt;</span>
  &lt;bgp-rib style="terse"&gt;
    &lt;name&gt;inet.0&lt;/name&gt;
    &lt;active-prefix-count&gt;0&lt;/active-prefix-count&gt;
    &lt;received-prefix-count&gt;0&lt;/received-prefix-count&gt;
    &lt;accepted-prefix-count&gt;0&lt;/accepted-prefix-count&gt;
    &lt;suppressed-prefix-count&gt;0&lt;/suppressed-prefix-count&gt;
  &lt;/bgp-rib&gt;
&lt;/bgp-peer&gt;</pre>
<h3>Whitespace ka jaal</h3><p>Junos par bahut se XML text values newlines ke saath padded aati hain. Interface name ko BGP state se compare karo, phir pehle ko <code>normalize=True</code> (RPC option) ya <code>.strip()</code> se theek karo.</p>
<pre class="code">from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    raw = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1")
    print(repr(raw.findtext("physical-interface/name")))
    print(repr(raw.findtext("physical-interface/name").strip()))
    clean = dev.rpc.get_interface_information(terse=True, interface_name="ge-0/0/1", normalize=True)
    print(repr(clean.findtext("physical-interface/name")))
    bgp = dev.rpc.get_bgp_summary_information()
    print(repr(bgp.findtext("bgp-peer/peer-state")))</pre>
<pre class="out">AUTO01$ python3 pad.py
<span class="hl">'\\nge-0/0/1\\n'</span>
'ge-0/0/1'
'ge-0/0/1'
'Established'</pre>
<p>Safai ke bina <code>name == "ge-0/0/1"</code> <code>False</code> hota hai aur bug print output mein dikhta nahi. Tables (chapter 6) hamesha normalize karte hain.</p>
<h3>find, findall aur chupi hui khaali list</h3><p>Sabse khatarnak galti <code>findall</code> mein galat tag name hai: woh error nahi deta, khaali list lautata hai. Aakhri line galat aur sahi dono naam dikhati hai.</p>
<pre class="code">from lxml import etree
from pyezutil import FLEET, device

with device(FLEET["J1"], gather_facts=False) as dev:
    xml = dev.rpc.get_bgp_summary_information()
    print(xml.xpath("//bgp-peer/peer-address/text()"))
    print([a.text for a in xml.iter("peer-address")])
    print(xml.find("bgp-peer/elapsed-time").get("seconds"), xml.find("bgp-peer/elapsed-time").text)
    print(xml.findtext("no-such-element"), xml.findtext("no-such-element", "0"))
    print(len(xml.findall("bgp-peers")), len(xml.findall("bgp-peer")))
    first = xml.find("bgp-peer")
    print(first.tag, [c.tag for c in first][:5])
    print(etree.tostring(first.find("peer-state")).decode().strip())</pre>
<pre class="out">AUTO01$ python3 xpath.py
['10.255.0.2', '10.255.0.3']
['10.255.0.2', '10.255.0.3']
69 00:01:09
None 0
<span class="hl">0 2</span>
bgp-peer ['peer-address', 'peer-as', 'input-messages', 'output-messages', 'route-queue-count']
&lt;peer-state format="Establ"&gt;Established&lt;/peer-state&gt;</pre>
<h3>Lab ka step 4: bgp_summary(dev)</h3><p>Ab function. Yeh RPC poochta hai, counters default ke saath padhta hai taaki khaali reply crash na kare, aur har peer ki ek entry banata hai. Har number yahin ek baar <code>int()</code> se convert hota hai.</p>
<pre class="code">"""bgp.py - bgp_summary(dev) turns the RPC reply into a plain dict"""
import json

from pyezutil import FLEET, device


def bgp_summary(dev):
    xml = dev.rpc.get_bgp_summary_information()
    out = {"peer_count": int(xml.findtext("peer-count", "0")), "down_peers": int(xml.findtext("down-peer-count", "0")), "peers": {}}
    for p in xml.findall("bgp-peer"):
        addr = p.findtext("peer-address").strip()
        out["peers"][addr] = {
            "as": int(p.findtext("peer-as")),
            "state": p.findtext("peer-state").strip(),
            "in_msgs": int(p.findtext("input-messages")),
            "flaps": int(p.findtext("flap-count")),
            "up_seconds": int(p.find("elapsed-time").get("seconds")),
        }
    return out


if __name__ == "__main__":
    with device(FLEET["J1"], gather_facts=False) as dev:
        print(json.dumps(bgp_summary(dev), indent=2))</pre>
<pre class="out">AUTO01$ python3 bgp.py
{
  "peer_count": 2,
  "down_peers": 0,
  "peers": {
    "10.255.0.2": {
      "as": 65000,
<span class="hl">      "state": "Established",</span>
      "in_msgs": 4,
      "flaps": 0,
<span class="hl">      "up_seconds": 73</span>
    },
    "10.255.0.3": {
      "as": 65000,
<span class="hl">      "state": "Established",</span></pre>
<h3>Fleet report</h3><p><code>bgpfleet.py</code> function import karta hai, har peer ki ek row print karta hai, <code>bgp_report.json</code> likhta hai aur kuch galat ho to <b>1</b> se exit karta hai. Exit code wahi cheez hai jisse cron, CI job ya monitoring system tumhara text parse kiye bina react kar sakta hai (<code>py-tools</code> dekho).</p>
<pre class="code">"""bgpfleet.py - BGP state of every router, a JSON report and an exit code for cron"""
import json
import sys

from jnpr.junos.exception import ConnectError
from bgp import bgp_summary
from pyezutil import FLEET, device

report = {}
problems = 0
print("%-4s %-12s %-6s %-12s %5s %8s" % ("NAME", "PEER", "AS", "STATE", "FLAPS", "UP(SEC)"))
for name, host in FLEET.items():
    try:
        with device(host, gather_facts=False) as dev:
            report[name] = bgp_summary(dev)
    except ConnectError as err:
        print("%-4s UNREACHABLE  %r" % (name, err))
        problems += 1
        continue
    for addr, p in report[name]["peers"].items():
        print("%-4s %-12s %-6d %-12s %5d %8d" % (name, addr, p["as"], p["state"], p["flaps"], p["up_seconds"]))
        if p["state"] != "Established":
            problems += 1
with open("bgp_report.json", "w") as f:
    json.dump(report, f, indent=2)
print("problems: %d (report saved in bgp_report.json)" % problems)
sys.exit(1 if problems else 0)</pre>
<pre class="out">AUTO01$ python3 bgpfleet.py
NAME PEER         AS     STATE        FLAPS  UP(SEC)
J1   10.255.0.2    65000 Established      0       74
J1   10.255.0.3    65000 Established      0       74
J2   10.255.0.1    65000 Established      0       74
J2   10.255.0.3    65000 Established      0       74
J3   10.255.0.1    65000 Established      0       74
J3   10.255.0.2    65000 Established      0       74
<span class="hl">problems: 0 (report saved in bgp_report.json)</span></pre>
<h3>Jaan-bujhkar todo</h3><p>Jo report kabhi fail hote nahi dekhi, us par bharosa nahi kar sakte. J3 par ek neighbour statement deactivate karo (session girane ka surakshit tareeka) aur report dobara chalao:</p>
<pre class="code"><span class="c"># on J3</span>
configure
deactivate protocols bgp group IBGP neighbor 10.255.0.2
commit and-quit</pre>
<pre class="out">AUTO01$ python3 bgpfleet.py; echo "exit code: $?"
NAME PEER         AS     STATE        FLAPS  UP(SEC)
J1   10.255.0.2    65000 Established      0       66
J1   10.255.0.3    65000 Established      0       66
J2   10.255.0.1    65000 Established      0       66
<span class="hl">J2   10.255.0.3    65000 Active           0        2</span>
J3   10.255.0.1    65000 Established      0       66
<span class="hl">problems: 1 (report saved in bgp_report.json)</span>
<span class="hl">exit code: 1</span></pre>
<p>J2 apne J3 wale session ko <code>Active</code> batata hai, J3 sirf ek peer list karta hai, aur script 1 se exit karti hai. Restore karne ke liye <code>activate protocols bgp group IBGP neighbor 10.255.0.2</code> chalao, commit karo, aur session wapas aane ke liye lagbhag 30 seconds ruko.</p>
<div class="warn"><p><b>Aam galtiyan.</b> Padded string ko <code>==</code> se compare karna. Jab tag missing ho sakta hai tab <code>int(el.findtext(...))</code> bulana (default use karo). Maan lena ki <code>findall</code> galat naam par shikayat karega.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kuch match na ho to <code>find</code> <code>None</code> lautata hai, <code>findall</code> <code>[]</code>, aur <code>findtext</code> <code>None</code> jab tak default na do.</p></div>
<div class="scn"><h4>Dashboard jo hamesha green tha</h4><p>Ek health script Established peers <code>findall("bgp-peers")</code> se ginti thi. Woh kabhi kuch match nahi karta tha, count 0 tha, aur author ne maan liya ki iska matlab "koi problem nahi mili". Dashboard ek mahine green raha jabki ek session down tha. Upar jaisa test jo jaan-bujhkar session todta, pehle din pakad leta.</p><p><b>Lesson:</b> apne checks ko fail karwakar test karo.</p></div>
<div class="iv"><p class="q">"PyEZ RPC reply ko report ke layak kaise banate ho?"</p><p>Ek function element tree ko find, findall aur findtext se padhta hai, types ek baar convert karta hai, whitespace strip karta hai, optional tags ke liye defaults use karta hai aur plain dict lautata hai. Reports, JSON files aur tests phir dict use karte hain aur XML ko chhute nahi.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>XML ek baar, ek function mein padho, aur dict lautao.</li><li>Text values padded ho sakti hain: <code>normalize=True</code> ya <code>strip()</code> use karo.</li><li><code>findall</code> mein galat tag error nahi, khaali list deta hai.</li><li>Optional tags ke liye defaults; numbers ko ek baar <code>int()</code> se convert karo.</li><li>Exit codes script ko cron aur CI ke layak banate hain; kuch todkar use test karo.</li></ul></div>
`}};export{e as default};