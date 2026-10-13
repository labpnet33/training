var e={id:`deepdiff-vendors`,h:{en:`deepdiff across vendors: one shape, then compare`,hi:`deepdiff vendors ke across: ek shape, phir compare`},body:{en:`
<p>You already know deepdiff from <b>adv-junos-validate</b>: two structures in, a list of added, removed and changed items out. This chapter does not repeat that. It answers a different question: how do you compare a <b>Cisco</b> config with a <b>Junos</b> config, or the state before a change with the state after it, when the three vendors write everything differently?</p>

<h3>Compare data, never vendor text</h3>
<p>Compare three ways of saying the same thing: <code>ip address 10.0.12.1 255.255.255.0</code> on IOS XE, <code>address 10.0.12.2/24</code> under a unit on Junos, <code>ip address 10.0.13.3/24</code> on EOS. A text diff between vendors is pure noise, and even within one vendor a moved line is a "change". The fix is a <b>vendor-neutral model</b>: nested dictionaries with the same keys for every device. The model is built once, and then deepdiff does what it is good at.</p>
<p>You do not have to write a parser per vendor. Batfish has already done it, and its answers are tables. The helper below turns the interface table into <code>{node: {interface: {...}}}</code>.</p>
<pre class="code">"""dd_vendors.py - config and state as plain dictionaries, one shape for every vendor"""
from deepdiff import DeepDiff

from bfcheck import bgp_routes, load, open_session


def interfaces(bf, snap):
    """{node: {interface: {description, address, active}}} - same keys for IOS XE, Junos and EOS."""
    frame = bf.q.interfaceProperties(properties="Description|Primary_Address|Active").answer(snapshot=snap).frame()
    model = {}
    for row in frame.to_dict("records"):
        node = str(row["Interface"]).split("[")[0]
        name = str(row["Interface"]).split("[")[1].rstrip("]")
        model.setdefault(node, {})[name] = {"description": row["Description"], "address": str(row["Primary_Address"]), "active": row["Active"]}
    return model


bf = open_session()
load(bf, "live")
load(bf, "candidate")
before = interfaces(bf, "live")
after = interfaces(bf, "candidate")
print(sorted(before["j1"]))
print(before["xe1"]["GigabitEthernet0/0"])
diff = DeepDiff(before, after)
print(diff.pretty())
print(sorted(diff.affected_root_keys))
print(DeepDiff(before, after, verbose_level=2)["dictionary_item_added"])</pre>
<pre class="out">AUTO01$ python3 dd_vendors.py
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
['ge-0/0/0', 'ge-0/0/0.0', 'lo0', 'lo0.0']
{'description': 'to-J1', 'address': '10.0.12.1/24', 'active': True}
<span class="hl">Item root['xe1']['Loopback100'] added to dictionary.</span>
['xe1']
<span class="hl">{"root['xe1']['Loopback100']": {'description': 'customer-block', 'address': '192.0.2.1/24', 'active': True}}</span></pre>
<div class="dia"><svg viewBox="0 0 640 205" role="img" aria-label="DeepDiff compares two nested dictionaries"><rect x="10" y="30" width="170" height="56" rx="9" fill="#e2e8f0"/><text x="95" y="54" text-anchor="middle" class="svg-ink" font-size="13">live state</text><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">{node: {prefix: hop}}</text><rect x="10" y="112" width="170" height="56" rx="9" fill="#e2e8f0"/><text x="95" y="136" text-anchor="middle" class="svg-ink" font-size="13">candidate state</text><text x="95" y="152" text-anchor="middle" class="svg-ink" font-size="13">{node: {prefix: hop}}</text><rect x="235" y="70" width="120" height="62" rx="9" fill="#fde68a"/><text x="295" y="97" text-anchor="middle" class="svg-ink" font-size="13">DeepDiff</text><text x="295" y="113" text-anchor="middle" class="svg-ink" font-size="13">before, after</text><rect x="430" y="14" width="200" height="40" rx="9" fill="#bbf7d0"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="13">dictionary_item_added</text><rect x="430" y="80" width="200" height="40" rx="9" fill="#fed7aa"/><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">dictionary_item_removed</text><rect x="430" y="146" width="200" height="40" rx="9" fill="#ddd6fe"/><text x="530" y="170" text-anchor="middle" class="svg-ink" font-size="13">values_changed</text><line x1="180" y1="58" x2="233" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="233,90 222.71107449735607,89.62850033506936 227.87976548769527,81.06785588232012" fill="#64748b"/><line x1="180" y1="140" x2="233" y2="112" stroke="#64748b" stroke-width="2"/><polygon points="233,112 227.37786470881426,120.62505621822858 222.7066543778587,111.78312237749135" fill="#64748b"/><line x1="355" y1="90" x2="428" y2="36" stroke="#64748b" stroke-width="2"/><polygon points="428,36 423.7379785115534,45.372042084413586 417.7909717834884,37.33257002610346" fill="#64748b"/><line x1="355" y1="101" x2="428" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="428,100 419.0693310424124,105.1228070400886 418.9323575921427,95.12374517039696" fill="#64748b"/><line x1="355" y1="112" x2="428" y2="166" stroke="#64748b" stroke-width="2"/><polygon points="428,166 417.7909717834884,164.66742997389656 423.7379785115534,156.62795791558642" fill="#64748b"/></svg><p class="cap">Nothing is guessed: every difference is named with its path, such as root['j1']['1.1.1.1/32'].</p></div>
<ul>
<li>The Junos node lists <code>ge-0/0/0</code> and the unit <code>ge-0/0/0.0</code>; the IOS node lists <code>GigabitEthernet0/0</code>. The neutral model keeps each device's own interface names but gives them the same fields.</li>
<li>The diff is one sentence: <code>Loopback100</code> was added on xe1. Nothing else moved, on any vendor.</li>
<li><code>affected_root_keys</code> returns the top-level keys that changed, here <code>['xe1']</code>. In a real change that is the list of devices to post-check with the tools from adv-junos-validate.</li>
<li><code>verbose_level=2</code> adds the <b>values</b> of added or removed items, so the report shows the new interface's address and description, not only its name.</li>
</ul>

<h3>The options that matter when you compare vendors</h3>
<p>The basics (<code>ignore_order</code>, <code>exclude_regex_paths</code>, <code>to_json</code>, <code>ignore_numeric_type_changes</code>) were in the earlier module. These are the ones you will add when the data comes from several sources.</p>
<table class="cmp"><tr><th>Option</th><th>Use it when</th></tr>
<tr><td><code>ignore_string_case=True</code></td><td>one vendor says <code>ESTABLISHED</code> and another <code>established</code></td></tr>
<tr><td><code>significant_digits=1</code>, <code>math_epsilon=0.01</code></td><td>floats such as utilisation that never match exactly</td></tr>
<tr><td><code>exclude_paths=[...]</code>, <code>include_paths=[...]</code></td><td>skip a field such as uptime, or compare only one branch</td></tr>
<tr><td><code>ignore_order=True</code></td><td>lists of dictionaries that vendors return in any order</td></tr>
<tr><td><code>verbose_level=2</code></td><td>you want values of added and removed items in the report</td></tr></table>
<pre class="code">want = {"xe1": {"asn": 65001, "peers": [{"ip": "10.0.12.2", "state": "ESTABLISHED"}, {"ip": "10.0.13.3", "state": "ESTABLISHED"}], "util": 71.234}}
have = {"xe1": {"asn": 65001, "peers": [{"ip": "10.0.13.3", "state": "established"}, {"ip": "10.0.12.2", "state": "ESTABLISHED"}], "util": 71.236, "uptime": 9042}}

print(DeepDiff(want, have).pretty())
print(DeepDiff(want, have, ignore_order=True, ignore_string_case=True, significant_digits=1, exclude_paths=["root['xe1']['uptime']"]))
print(DeepDiff(want, have, include_paths=["root['xe1']['asn']"]))
print(DeepDiff(want, have, ignore_order=True, ignore_string_case=True, math_epsilon=0.01, exclude_regex_paths=["uptime"]))
print(DeepDiff(want, have, verbose_level=2, exclude_paths=["root['xe1']['peers']", "root['xe1']['util']"]))
for path in DeepSearch(have, "10.0.13.3")["matched_values"]:
    print(path)
print(extract(have, "root['xe1']['peers'][0]['ip']"))</pre>
<pre class="out">AUTO01$ python3 dd_options.py
Item root['xe1']['uptime'] added to dictionary.
<span class="hl">Value of root['xe1']['peers'][0]['ip'] changed from "10.0.12.2" to "10.0.13.3".</span>
<span class="hl">Value of root['xe1']['peers'][0]['state'] changed from "ESTABLISHED" to "established".</span>
<span class="hl">Value of root['xe1']['peers'][1]['ip'] changed from "10.0.13.3" to "10.0.12.2".</span>
<span class="hl">Value of root['xe1']['util'] changed from 71.234 to 71.236.</span>
{}
{}
{}
{'dictionary_item_added': {"root['xe1']['uptime']": 9042}}
root['xe1']['peers'][0]['ip']
10.0.13.3</pre>
<p>Read the output as a story. Without options, five differences appear: a new <code>uptime</code> key, two peers that swapped places, a changed state spelling and a tiny float change. With order, case and digits ignored, and uptime excluded, the answer is <code>{}</code>: same network. <code>include_paths</code> keeps only the AS number, so nothing differs. <code>DeepSearch</code> finds where a value hides, and <code>extract</code> reads one path out of a structure.</p>

<h3>The expected-difference pattern</h3>
<p>This is the idea that turns deepdiff into a gate. A change has an <b>intended</b> difference, and the diff must equal it. For CHG-3101 the intent says xe1 announces 192.0.2.0/24, so the only acceptable difference is that prefix appearing at j1 and e1. Anything else, a removed route or a changed next hop, is a side effect and blocks the change.</p>
<p>First look at the raw diff of the BGP routes, live against candidate (this is task 4 of Lab 1):</p>
<pre class="code">"""statediff.py - what does the candidate change in the BGP routes? Usage: python3 statediff.py LIVE CANDIDATE"""
import sys

from deepdiff import DeepDiff

from bfcheck import bgp_routes, load, open_session

live, candidate = sys.argv[1:3]
bf = open_session()
load(bf, live)
load(bf, candidate)
diff = DeepDiff(bgp_routes(bf, live), bgp_routes(bf, candidate))
print(diff.pretty() if diff else "no difference")</pre>
<pre class="out">AUTO01$ python3 statediff.py live candidate
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
Item root['e1']['192.0.2.0/24'] added to dictionary.
Item root['j1']['192.0.2.0/24'] added to dictionary.
<span class="hl">Item root['j1']['1.1.1.1/32'] removed from dictionary.</span>
<span class="hl">Item root['j1']['3.3.3.3/32'] removed from dictionary.</span></pre>
<p>The new prefix appears on both neighbours, as intended. But j1 also <b>loses</b> 1.1.1.1/32 and 3.3.3.3/32. Nobody asked for that. A test written for "j1 has 192.0.2.0/24" would pass; the diff shows what the test never asked about. The gate stage turns this into a rule:</p>
<pre class="code">def stage_state(ctx):
    before = bgp_routes(ctx["bf"], ctx["live"])
    after = bgp_routes(ctx["bf"], ctx["candidate"])
    diff = DeepDiff(before, after)
    wanted = set("root['%s']['%s']" % (n, a["prefix"]) for a in ctx["intent"]["announce"] for n in NODES if n != a["node"])
    bad = []
    for kind in ("dictionary_item_removed", "values_changed", "type_changes"):
        for path in diff.get(kind, []):
            bad.append("%s %s" % (kind.replace("dictionary_item_", ""), path))
    for path in diff.get("dictionary_item_added", []):
        if path not in wanted:
            bad.append("added %s (not in the intent)" % path)
    return bad</pre>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab's deepdiff supports the text view and the options in this chapter. The tree view, <code>Delta</code>, <code>DeepHash</code>, custom operators and <code>group_by</code> are not available, so do not use them in lab scripts. <code>pretty()</code> wording follows deepdiff 6 and 7.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Diffing configuration text between vendors. (2) Putting a list where a dictionary would give readable paths: <code>root['j1']['1.1.1.1/32']</code> beats <code>root['j1'][0]</code>. (3) Excluding too much, so the diff is empty by design. (4) Comparing a live state read today with a candidate computed yesterday.</p></div>
<div class="exam"><p><b>Exam trap.</b> Values in <code>diff['dictionary_item_removed']</code> are paths (text), not the removed data. Use <code>verbose_level=2</code> or look the path up in the old structure to see the value.</p></div>

<div class="scn"><h4>The diff that found a lost prefix</h4><p>A route-map change was reviewed by three engineers and all the tests passed: the new prefix was announced. The pre-deploy diff of modelled routes printed two <code>removed</code> lines for the loopbacks of two neighbours. The route-map ended in an implicit deny. The fix was one more clause, found before the change window, not after the monitoring alarm.</p><p><b>Lesson:</b> tests check what you thought of; a diff checks everything.</p></div>

<div class="iv"><p class="q">"How do you prove a change did only what the ticket said?"</p><p>I model state in a neutral dictionary before and after, diff it with the noise excluded, and require the diff to equal the intended one. Extra removals or changed values block the change. The same diff, attached to the ticket, is the evidence.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Compare vendor-neutral dictionaries, never vendor text.</li>
<li>Batfish tables are an easy source for the neutral model.</li>
<li><code>ignore_string_case</code>, <code>significant_digits</code>, <code>include_paths</code> and <code>verbose_level</code> handle multi-source data.</li>
<li>The gate rule is: actual difference must equal intended difference.</li>
<li><code>affected_root_keys</code> names the devices to post-check.</li>
</ul></div>
`,hi:`
<p>deepdiff aap <b>adv-junos-validate</b> se jaante ho: do structures andar, added, removed aur changed items ki list bahar. Yeh chapter woh nahi dohrata. Yeh alag sawaal ka jawab deta hai: <b>Cisco</b> config ko <b>Junos</b> config se, ya change se pehle ki state ko baad ki state se kaise compare karein, jab teeno vendors sab kuch alag tareeke se likhte hain?</p>

<h3>Data compare karo, vendor text kabhi nahi</h3>
<p>Ek hi baat kehne ke teen tareeke dekho: IOS XE par <code>ip address 10.0.12.1 255.255.255.0</code>, Junos par unit ke neeche <code>address 10.0.12.2/24</code>, EOS par <code>ip address 10.0.13.3/24</code>. Vendors ke beech text diff sirf shor hai, aur ek hi vendor mein bhi khisaki hui line "change" ban jaati hai. Hal hai <b>vendor-neutral model</b>: nested dictionaries jinki keys har device ke liye same hon. Model ek baar banta hai, phir deepdiff woh karta hai jisme woh achha hai.</p>
<p>Har vendor ke liye parser likhne ki zaroorat nahi. Batfish yeh kar chuka hai, aur uske jawab tables hain. Neeche ka helper interface table ko <code>{node: {interface: {...}}}</code> mein badalta hai.</p>
<pre class="code">"""dd_vendors.py - config and state as plain dictionaries, one shape for every vendor"""
from deepdiff import DeepDiff

from bfcheck import bgp_routes, load, open_session


def interfaces(bf, snap):
    """{node: {interface: {description, address, active}}} - same keys for IOS XE, Junos and EOS."""
    frame = bf.q.interfaceProperties(properties="Description|Primary_Address|Active").answer(snapshot=snap).frame()
    model = {}
    for row in frame.to_dict("records"):
        node = str(row["Interface"]).split("[")[0]
        name = str(row["Interface"]).split("[")[1].rstrip("]")
        model.setdefault(node, {})[name] = {"description": row["Description"], "address": str(row["Primary_Address"]), "active": row["Active"]}
    return model


bf = open_session()
load(bf, "live")
load(bf, "candidate")
before = interfaces(bf, "live")
after = interfaces(bf, "candidate")
print(sorted(before["j1"]))
print(before["xe1"]["GigabitEthernet0/0"])
diff = DeepDiff(before, after)
print(diff.pretty())
print(sorted(diff.affected_root_keys))
print(DeepDiff(before, after, verbose_level=2)["dictionary_item_added"])</pre>
<pre class="out">AUTO01$ python3 dd_vendors.py
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
['ge-0/0/0', 'ge-0/0/0.0', 'lo0', 'lo0.0']
{'description': 'to-J1', 'address': '10.0.12.1/24', 'active': True}
<span class="hl">Item root['xe1']['Loopback100'] added to dictionary.</span>
['xe1']
<span class="hl">{"root['xe1']['Loopback100']": {'description': 'customer-block', 'address': '192.0.2.1/24', 'active': True}}</span></pre>
<div class="dia"><svg viewBox="0 0 640 205" role="img" aria-label="DeepDiff do nested dictionaries compare karta hai"><rect x="10" y="30" width="170" height="56" rx="9" fill="#e2e8f0"/><text x="95" y="54" text-anchor="middle" class="svg-ink" font-size="13">live state</text><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">{node: {prefix: hop}}</text><rect x="10" y="112" width="170" height="56" rx="9" fill="#e2e8f0"/><text x="95" y="136" text-anchor="middle" class="svg-ink" font-size="13">candidate state</text><text x="95" y="152" text-anchor="middle" class="svg-ink" font-size="13">{node: {prefix: hop}}</text><rect x="235" y="70" width="120" height="62" rx="9" fill="#fde68a"/><text x="295" y="97" text-anchor="middle" class="svg-ink" font-size="13">DeepDiff</text><text x="295" y="113" text-anchor="middle" class="svg-ink" font-size="13">before, after</text><rect x="430" y="14" width="200" height="40" rx="9" fill="#bbf7d0"/><text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="13">dictionary_item_added</text><rect x="430" y="80" width="200" height="40" rx="9" fill="#fed7aa"/><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">dictionary_item_removed</text><rect x="430" y="146" width="200" height="40" rx="9" fill="#ddd6fe"/><text x="530" y="170" text-anchor="middle" class="svg-ink" font-size="13">values_changed</text><line x1="180" y1="58" x2="233" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="233,90 222.71107449735607,89.62850033506936 227.87976548769527,81.06785588232012" fill="#64748b"/><line x1="180" y1="140" x2="233" y2="112" stroke="#64748b" stroke-width="2"/><polygon points="233,112 227.37786470881426,120.62505621822858 222.7066543778587,111.78312237749135" fill="#64748b"/><line x1="355" y1="90" x2="428" y2="36" stroke="#64748b" stroke-width="2"/><polygon points="428,36 423.7379785115534,45.372042084413586 417.7909717834884,37.33257002610346" fill="#64748b"/><line x1="355" y1="101" x2="428" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="428,100 419.0693310424124,105.1228070400886 418.9323575921427,95.12374517039696" fill="#64748b"/><line x1="355" y1="112" x2="428" y2="166" stroke="#64748b" stroke-width="2"/><polygon points="428,166 417.7909717834884,164.66742997389656 423.7379785115534,156.62795791558642" fill="#64748b"/></svg><p class="cap">Kuch andaaza nahi: har farak apne path ke saath naam se milta hai, jaise root['j1']['1.1.1.1/32'].</p></div>
<ul>
<li>Junos node <code>ge-0/0/0</code> aur unit <code>ge-0/0/0.0</code> list karta hai; IOS node <code>GigabitEthernet0/0</code>. Neutral model har device ke apne interface naam rakhta hai par unhe same fields deta hai.</li>
<li>Diff ek vaakya hai: xe1 par <code>Loopback100</code> add hua. Kisi vendor par kuch aur nahi hila.</li>
<li><code>affected_root_keys</code> woh top-level keys lautata hai jo badli, yahan <code>['xe1']</code>. Asli change mein yeh un devices ki list hai jinhe adv-junos-validate ke tools se post-check karna hai.</li>
<li><code>verbose_level=2</code> added ya removed items ki <b>values</b> bhi jodta hai, isliye report mein naye interface ka address aur description dikhta hai, sirf naam nahi.</li>
</ul>

<h3>Vendors compare karte waqt kaam ke options</h3>
<p>Basics (<code>ignore_order</code>, <code>exclude_regex_paths</code>, <code>to_json</code>, <code>ignore_numeric_type_changes</code>) pichhle module mein the. Jab data kai sources se aata hai tab yeh jodoge.</p>
<table class="cmp"><tr><th>Option</th><th>Kab use karo</th></tr>
<tr><td><code>ignore_string_case=True</code></td><td>ek vendor <code>ESTABLISHED</code> kehta hai aur doosra <code>established</code></td></tr>
<tr><td><code>significant_digits=1</code>, <code>math_epsilon=0.01</code></td><td>floats jaise utilisation jo kabhi exact match nahi karte</td></tr>
<tr><td><code>exclude_paths=[...]</code>, <code>include_paths=[...]</code></td><td>uptime jaisi field chhodni ho, ya sirf ek branch compare karni ho</td></tr>
<tr><td><code>ignore_order=True</code></td><td>dictionaries ki lists jo vendors kisi bhi order mein lautate hain</td></tr>
<tr><td><code>verbose_level=2</code></td><td>report mein added aur removed items ki values chahiye</td></tr></table>
<pre class="code">want = {"xe1": {"asn": 65001, "peers": [{"ip": "10.0.12.2", "state": "ESTABLISHED"}, {"ip": "10.0.13.3", "state": "ESTABLISHED"}], "util": 71.234}}
have = {"xe1": {"asn": 65001, "peers": [{"ip": "10.0.13.3", "state": "established"}, {"ip": "10.0.12.2", "state": "ESTABLISHED"}], "util": 71.236, "uptime": 9042}}

print(DeepDiff(want, have).pretty())
print(DeepDiff(want, have, ignore_order=True, ignore_string_case=True, significant_digits=1, exclude_paths=["root['xe1']['uptime']"]))
print(DeepDiff(want, have, include_paths=["root['xe1']['asn']"]))
print(DeepDiff(want, have, ignore_order=True, ignore_string_case=True, math_epsilon=0.01, exclude_regex_paths=["uptime"]))
print(DeepDiff(want, have, verbose_level=2, exclude_paths=["root['xe1']['peers']", "root['xe1']['util']"]))
for path in DeepSearch(have, "10.0.13.3")["matched_values"]:
    print(path)
print(extract(have, "root['xe1']['peers'][0]['ip']"))</pre>
<pre class="out">AUTO01$ python3 dd_options.py
Item root['xe1']['uptime'] added to dictionary.
<span class="hl">Value of root['xe1']['peers'][0]['ip'] changed from "10.0.12.2" to "10.0.13.3".</span>
<span class="hl">Value of root['xe1']['peers'][0]['state'] changed from "ESTABLISHED" to "established".</span>
<span class="hl">Value of root['xe1']['peers'][1]['ip'] changed from "10.0.13.3" to "10.0.12.2".</span>
<span class="hl">Value of root['xe1']['util'] changed from 71.234 to 71.236.</span>
{}
{}
{}
{'dictionary_item_added': {"root['xe1']['uptime']": 9042}}
root['xe1']['peers'][0]['ip']
10.0.13.3</pre>
<p>Output ko kahani ki tarah padho. Options ke bina paanch farak aate hain: naya <code>uptime</code> key, do peers jinhone jagah badli, state ki badli hui spelling aur ek chhota float badlaav. Order, case aur digits ignore karke aur uptime exclude karke jawab <code>{}</code> hai: same network. <code>include_paths</code> sirf AS number rakhta hai, isliye kuch alag nahi. <code>DeepSearch</code> dhoondhta hai ki value kahan chhupi hai, aur <code>extract</code> structure se ek path padhta hai.</p>

<h3>Expected-difference pattern</h3>
<p>Yeh woh idea hai jo deepdiff ko gate banata hai. Change ka ek <b>irada kiya hua</b> farak hota hai, aur diff use barabar hona chahiye. CHG-3101 ke liye intent kehta hai xe1 192.0.2.0/24 announce kare, isliye sirf yeh farak chalega ki woh prefix j1 aur e1 par dikhe. Aur kuch bhi, removed route ya badla hua next hop, side effect hai aur change ko rok deta hai.</p>
<p>Pehle BGP routes ka raw diff dekho, live aur candidate (yeh Lab 1 ka task 4 hai):</p>
<pre class="code">"""statediff.py - what does the candidate change in the BGP routes? Usage: python3 statediff.py LIVE CANDIDATE"""
import sys

from deepdiff import DeepDiff

from bfcheck import bgp_routes, load, open_session

live, candidate = sys.argv[1:3]
bf = open_session()
load(bf, live)
load(bf, candidate)
diff = DeepDiff(bgp_routes(bf, live), bgp_routes(bf, candidate))
print(diff.pretty() if diff else "no difference")</pre>
<pre class="out">AUTO01$ python3 statediff.py live candidate
Successfully initialized snapshot 'live' from 'live'
Default snapshot is now set to live
Successfully initialized snapshot 'candidate' from 'candidate'
Default snapshot is now set to candidate
Item root['e1']['192.0.2.0/24'] added to dictionary.
Item root['j1']['192.0.2.0/24'] added to dictionary.
<span class="hl">Item root['j1']['1.1.1.1/32'] removed from dictionary.</span>
<span class="hl">Item root['j1']['3.3.3.3/32'] removed from dictionary.</span></pre>
<p>Naya prefix dono neighbours par aaya, jaisa irada tha. Par j1 1.1.1.1/32 aur 3.3.3.3/32 bhi <b>kho</b> deta hai. Yeh kisi ne nahi maanga tha. "j1 ke paas 192.0.2.0/24 hai" ka test pass ho jaata; diff woh dikhata hai jo test ne poochha hi nahi. Gate stage ise rule bana deta hai:</p>
<pre class="code">def stage_state(ctx):
    before = bgp_routes(ctx["bf"], ctx["live"])
    after = bgp_routes(ctx["bf"], ctx["candidate"])
    diff = DeepDiff(before, after)
    wanted = set("root['%s']['%s']" % (n, a["prefix"]) for a in ctx["intent"]["announce"] for n in NODES if n != a["node"])
    bad = []
    for kind in ("dictionary_item_removed", "values_changed", "type_changes"):
        for path in diff.get(kind, []):
            bad.append("%s %s" % (kind.replace("dictionary_item_", ""), path))
    for path in diff.get("dictionary_item_added", []):
        if path not in wanted:
            bad.append("added %s (not in the intent)" % path)
    return bad</pre>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab ka deepdiff text view aur is chapter ke options support karta hai. Tree view, <code>Delta</code>, <code>DeepHash</code>, custom operators aur <code>group_by</code> available nahi hain, isliye lab scripts mein unhe use mat karo. <code>pretty()</code> ki wording deepdiff 6 aur 7 ko follow karti hai.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Vendors ke beech configuration text ka diff. (2) Jahan dictionary readable paths deti, wahan list rakhna: <code>root['j1']['1.1.1.1/32']</code>, <code>root['j1'][0]</code> se behtar hai. (3) Zyada exclude kar dena, isliye diff design se hi khaali. (4) Aaj padhi live state ko kal ke computed candidate se compare karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>diff['dictionary_item_removed']</code> ki values paths (text) hain, hataya hua data nahi. Value dekhne ke liye <code>verbose_level=2</code> use karo ya path ko purani structure mein lookup karo.</p></div>

<div class="scn"><h4>Diff jisne khoya hua prefix pakda</h4><p>Ek route-map change ko teen engineers ne review kiya aur saare tests pass hue: naya prefix announce ho raha tha. Pre-deploy mein modelled routes ke diff ne do neighbours ke loopbacks ke liye do <code>removed</code> lines print ki. Route-map ka ant implicit deny tha. Fix ek aur clause tha, jo change window se pehle mila, monitoring alarm ke baad nahi.</p><p><b>Lesson:</b> tests wahi check karte hain jo aapne socha; diff sab kuch check karta hai.</p></div>

<div class="iv"><p class="q">"Kaise saabit karte ho ki change ne wahi kiya jo ticket mein tha?"</p><p>Main change se pehle aur baad ki state neutral dictionary mein model karta hoon, shor exclude karke diff leta hoon, aur diff ko irade ke barabar maangta hoon. Extra removals ya badli values change ko rok deti hain. Wahi diff ticket mein laga ho to saboot hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Vendor-neutral dictionaries compare karo, vendor text kabhi nahi.</li>
<li>Batfish tables neutral model ka aasaan source hain.</li>
<li><code>ignore_string_case</code>, <code>significant_digits</code>, <code>include_paths</code> aur <code>verbose_level</code> multi-source data sambhalte hain.</li>
<li>Gate ka rule: asli farak irade ke farak ke barabar ho.</li>
<li><code>affected_root_keys</code> un devices ke naam deta hai jinhe post-check karna hai.</li>
</ul></div>
`}};export{e as default};