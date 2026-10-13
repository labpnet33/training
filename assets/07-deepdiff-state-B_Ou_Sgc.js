var e={id:`deepdiff-state`,h:{en:`deepdiff: ask which exact field changed`,hi:`deepdiff: poochho kaunsi exact field badli`},body:{en:`
<p>JSNAPy tells you a test failed. pytest tells you an assertion failed. Sometimes you want something else: <b>everything that is different</b> between two states, without having written a test for it first. That is what <code>deepdiff</code> does. It takes two Python structures, such as two nested dictionaries, and reports every added, removed and changed item with its path. It is also a good way to learn: you read the diff and discover what the change really touched.</p>

<h3>Turn a snapshot into a small dictionary</h3>
<p>A snapshot is an XML file. We read the OSPF one back, keep the fields we care about and build <code>{router: {neighbor: {interface, state, timer}}}</code>. Then deepdiff compares two such dictionaries.</p>
<pre class="code">"""statediff.py - what changed between two JSNAPy snapshots? Usage: python3 statediff.py PRE POST"""
import sys

from deepdiff import DeepDiff
from lxml import etree

from jsnap import HOSTS


def ospf_state(host, tag):
    with open("snapshots/%s_%s_show_ospf_neighbor.xml" % (host, tag)) as f:
        root = etree.fromstring(f.read())
    state = {}
    for nbr in root.iter("ospf-neighbor"):
        state[nbr.findtext("neighbor-address")] = {
            "interface": nbr.findtext("interface-name"),
            "state": nbr.findtext("ospf-neighbor-state"),
            "timer": nbr.findtext("activity-timer"),
        }
    return state


pre = {h: ospf_state(h, sys.argv[1]) for h in HOSTS}
post = {h: ospf_state(h, sys.argv[2]) for h in HOSTS}

raw = DeepDiff(pre, post)
print("raw diff: %d kinds of change (the activity timers always move)" % len(raw))
clean = DeepDiff(pre, post, exclude_regex_paths=[r"\\['timer'\\]"])
print(clean.pretty() if clean else "no change")
sys.exit(1 if clean else 0)</pre>
<pre class="out">AUTO01$ python3 statediff.py pre post; echo "exit code: $?"
raw diff: 2 kinds of change (the activity timers always move)
<span class="hl">Item root['10.99.0.12']['10.23.0.2'] removed from dictionary.</span>
<span class="hl">Item root['10.99.0.13']['10.23.0.1'] removed from dictionary.</span>
exit code: 1</pre>
<p>The output is two sentences about the outage. <code>root['10.99.0.12']['10.23.0.2']</code> was removed: J2 no longer has a neighbour at 10.23.0.2. Same for J3. The first line says the raw diff held two kinds of change before filtering. Why? Because the activity timer in every neighbour counts down and is never the same twice. Without the filter the diff would list every timer on every router and bury the real finding.</p>

<h3>The diff vocabulary</h3>
<table class="cmp"><tr><th>Key in the diff</th><th>Meaning</th></tr>
<tr><td><code>dictionary_item_removed</code></td><td>A key was in the first and is not in the second (a lost neighbour)</td></tr>
<tr><td><code>dictionary_item_added</code></td><td>A key is new (a neighbour that appeared)</td></tr>
<tr><td><code>values_changed</code></td><td>The key is the same, the value is not (Full to ExStart)</td></tr>
<tr><td><code>type_changes</code></td><td>The value looks the same but the type differs (1500 against "1500")</td></tr></table>

<h3>Seeing it in miniature</h3>
<p>A tiny script makes each feature visible. Read the code and the output together.</p>
<pre class="code">from deepdiff import DeepDiff

pre = {"J2": {"10.23.0.2": {"state": "Full", "timer": "36"}, "10.12.0.1": {"state": "Full", "timer": "34"}}}
post = {"J2": {"10.12.0.1": {"state": "ExStart", "timer": "37"}}}
d = DeepDiff(pre, post)
print(sorted(d.keys()))
print(d.pretty())
print(DeepDiff(pre, post, exclude_regex_paths=[r"\\['timer'\\]"]).pretty())
print(DeepDiff({"asn": 65000, "peers": ["a", "b"]}, {"asn": 65000, "peers": ["b", "a"]}))
print(DeepDiff({"asn": 65000, "peers": ["a", "b"]}, {"asn": 65000, "peers": ["b", "a"]}, ignore_order=True))
print(DeepDiff({"mtu": 1500}, {"mtu": "1500"}))
print(DeepDiff({"mtu": 1500}, {"mtu": "1500"}, ignore_numeric_type_changes=True))
print(DeepDiff({"mtu": 1500, "desc": "x"}, {"mtu": 9000, "desc": "x"}).to_json())
print(bool(DeepDiff(pre, pre)))
print(DeepDiff({"a": 1}, {"a": 2, "b": 3}).affected_paths)</pre>
<pre class="out">AUTO01$ python3 dd.py
['dictionary_item_removed', 'values_changed']
Item root['J2']['10.23.0.2'] removed from dictionary.
Value of root['J2']['10.12.0.1']['state'] changed from "Full" to "ExStart".
Value of root['J2']['10.12.0.1']['timer'] changed from "34" to "37".
Item root['J2']['10.23.0.2'] removed from dictionary.
Value of root['J2']['10.12.0.1']['state'] changed from "Full" to "ExStart".
{'values_changed': {"root['peers'][0]": {'new_value': 'b', 'old_value': 'a'}, "root['peers'][1]": {'new_value': 'a', 'old_value': 'b'}}}
{}
{'type_changes': {"root['mtu']": {'old_type': &lt;class 'int'&gt;, 'new_type': &lt;class 'str'&gt;, 'old_value': 1500, 'new_value': '1500'}}}
{'type_changes': {"root['mtu']": {'old_type': &lt;class 'int'&gt;, 'new_type': &lt;class 'str'&gt;, 'old_value': 1500, 'new_value': '1500'}}}
{"values_changed": {"root['mtu']": {"new_value": 9000, "old_value": 1500}}}
False
{"root['b']", "root['a']"}</pre>
<p>Go line by line:</p>
<ul>
<li>Line 1: the kinds of change found, <code>dictionary_item_removed</code> and <code>values_changed</code>.</li>
<li>Next three: <code>pretty()</code> turns the diff into sentences, including the timer noise.</li>
<li>Next two: with <code>exclude_regex_paths</code> on the timer only the real changes stay.</li>
<li>The dictionary of changed list items: a reordered list counts as a change. With <code>ignore_order=True</code> the result is an empty dictionary: same peers, different order, no difference.</li>
<li><code>type_changes</code> for 1500 against "1500", and <code>ignore_numeric_type_changes</code> does not fix it because that option is for int against float, not number against text. Normalise your data first.</li>
<li><code>to_json()</code> gives a string you can attach to a ticket or send to a log system.</li>
<li><code>bool(diff)</code> is False for equal data: <code>if diff:</code> is the idiom for "something changed".</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Your tests passed and the manager asks "did anything else move?". You diff the full state with no filter, then add one <code>exclude_regex_paths</code> rule at a time (timers, counters, uptimes) until only meaningful entries remain. That list is your <b>change record</b>: it can be attached to the ticket as evidence of what the change did and nothing else.</p></div>

<h3>When deepdiff is the wrong tool</h3>
<p>deepdiff needs you to turn the raw output into data first, which is more work than a JSNAPy operator. For one question, such as "did a neighbour vanish?", an operator is shorter. For open questions ("show me everything different"), deepdiff wins, because you do not have to know in advance what to ask.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Diffing raw command text instead of parsed data; one extra space becomes a change. (2) Forgetting to exclude counters, timers and uptimes, so the diff is never empty. (3) Comparing lists without <code>ignore_order</code> when the router returns them in any order. (4) Using a type-sensitive compare on data that mixes numbers and strings.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>exclude_regex_paths</code> takes regular expressions matched against the path as text, such as <code>root['J2']['timer']</code>. Square brackets must be escaped: <code>r"\\['timer'\\]"</code>.</p></div>

<div class="scn"><h4>The diff that was never empty</h4><p>A team gated a change on "diff must be empty". The very first run failed, because uptime and timers differ between any two moments. They put a long list of ignored fields in a shared file, reviewed by the whole team. Over time the file became the team's definition of "operationally the same".</p><p><b>Lesson:</b> write down what you consider noise, and review that list as carefully as the checks.</p></div>

<div class="iv"><p class="q">"How do you show that a change did only what the ticket said?"</p><p>I snapshot the state, parse it to dictionaries, and diff with the known-noisy fields excluded. The diff must contain exactly the intended items. Anything extra is a side effect to explain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>deepdiff compares two Python structures and reports added, removed and changed items by path.</li>
<li>Parse snapshots to dictionaries first; do not diff raw text.</li>
<li><code>exclude_regex_paths</code> removes the noise (timers, counters); <code>ignore_order</code> handles lists.</li>
<li><code>pretty()</code> for people, <code>to_json()</code> for logs, <code>bool(diff)</code> for scripts.</li>
<li>deepdiff answers open questions; JSNAPy operators answer fixed ones.</li>
</ul></div>
`,hi:`
<p>JSNAPy batata hai ki test fail hua. pytest batata hai ki assertion fail hui. Kabhi aap kuch aur chahte ho: do states ke beech <b>jo kuch bhi alag hai</b>, uske liye pehle test likhe bina. Yahi <code>deepdiff</code> karta hai. Woh do Python structures leta hai, jaise do nested dictionaries, aur har added, removed aur changed item ko uske path ke saath batata hai. Seekhne ka bhi achha tareeka hai: aap diff padhte ho aur jaan lete ho ki change ne asal mein kya chhua.</p>

<h3>Snapshot ko chhote dictionary mein badlo</h3>
<p>Snapshot ek XML file hai. Hum OSPF wali ko wapas padhte hain, jo fields chahiye rakhte hain aur <code>{router: {neighbor: {interface, state, timer}}}</code> banate hain. Phir deepdiff aise do dictionaries compare karta hai.</p>
<pre class="code">"""statediff.py - what changed between two JSNAPy snapshots? Usage: python3 statediff.py PRE POST"""
import sys

from deepdiff import DeepDiff
from lxml import etree

from jsnap import HOSTS


def ospf_state(host, tag):
    with open("snapshots/%s_%s_show_ospf_neighbor.xml" % (host, tag)) as f:
        root = etree.fromstring(f.read())
    state = {}
    for nbr in root.iter("ospf-neighbor"):
        state[nbr.findtext("neighbor-address")] = {
            "interface": nbr.findtext("interface-name"),
            "state": nbr.findtext("ospf-neighbor-state"),
            "timer": nbr.findtext("activity-timer"),
        }
    return state


pre = {h: ospf_state(h, sys.argv[1]) for h in HOSTS}
post = {h: ospf_state(h, sys.argv[2]) for h in HOSTS}

raw = DeepDiff(pre, post)
print("raw diff: %d kinds of change (the activity timers always move)" % len(raw))
clean = DeepDiff(pre, post, exclude_regex_paths=[r"\\['timer'\\]"])
print(clean.pretty() if clean else "no change")
sys.exit(1 if clean else 0)</pre>
<pre class="out">AUTO01$ python3 statediff.py pre post; echo "exit code: $?"
raw diff: 2 kinds of change (the activity timers always move)
<span class="hl">Item root['10.99.0.12']['10.23.0.2'] removed from dictionary.</span>
<span class="hl">Item root['10.99.0.13']['10.23.0.1'] removed from dictionary.</span>
exit code: 1</pre>
<p>Output outage ke baare mein do vaakya hai. <code>root['10.99.0.12']['10.23.0.2']</code> hata di gayi: J2 ke paas ab 10.23.0.2 par neighbour nahi hai. J3 ke liye bhi wahi. Pehli line kehti hai ki filter se pehle raw diff mein do tarah ke badlaav the. Kyun? Kyunki har neighbour ka activity timer ulta ginta hai aur do baar kabhi same nahi hota. Filter ke bina diff har router ke har timer ko list karta aur asli khoj dab jaati.</p>

<h3>Diff ki shabdavali</h3>
<table class="cmp"><tr><th>Diff ki key</th><th>Matlab</th></tr>
<tr><td><code>dictionary_item_removed</code></td><td>Key pehle mein thi, doosre mein nahi (khoya hua neighbour)</td></tr>
<tr><td><code>dictionary_item_added</code></td><td>Key nayi hai (naya aaya neighbour)</td></tr>
<tr><td><code>values_changed</code></td><td>Key wahi hai, value nahi (Full se ExStart)</td></tr>
<tr><td><code>type_changes</code></td><td>Value same dikhti hai par type alag hai (1500 aur "1500")</td></tr></table>

<h3>Chhote roop mein dekho</h3>
<p>Ek chhoti script har feature dikha deti hai. Code aur output saath padho.</p>
<pre class="code">from deepdiff import DeepDiff

pre = {"J2": {"10.23.0.2": {"state": "Full", "timer": "36"}, "10.12.0.1": {"state": "Full", "timer": "34"}}}
post = {"J2": {"10.12.0.1": {"state": "ExStart", "timer": "37"}}}
d = DeepDiff(pre, post)
print(sorted(d.keys()))
print(d.pretty())
print(DeepDiff(pre, post, exclude_regex_paths=[r"\\['timer'\\]"]).pretty())
print(DeepDiff({"asn": 65000, "peers": ["a", "b"]}, {"asn": 65000, "peers": ["b", "a"]}))
print(DeepDiff({"asn": 65000, "peers": ["a", "b"]}, {"asn": 65000, "peers": ["b", "a"]}, ignore_order=True))
print(DeepDiff({"mtu": 1500}, {"mtu": "1500"}))
print(DeepDiff({"mtu": 1500}, {"mtu": "1500"}, ignore_numeric_type_changes=True))
print(DeepDiff({"mtu": 1500, "desc": "x"}, {"mtu": 9000, "desc": "x"}).to_json())
print(bool(DeepDiff(pre, pre)))
print(DeepDiff({"a": 1}, {"a": 2, "b": 3}).affected_paths)</pre>
<pre class="out">AUTO01$ python3 dd.py
['dictionary_item_removed', 'values_changed']
Item root['J2']['10.23.0.2'] removed from dictionary.
Value of root['J2']['10.12.0.1']['state'] changed from "Full" to "ExStart".
Value of root['J2']['10.12.0.1']['timer'] changed from "34" to "37".
Item root['J2']['10.23.0.2'] removed from dictionary.
Value of root['J2']['10.12.0.1']['state'] changed from "Full" to "ExStart".
{'values_changed': {"root['peers'][0]": {'new_value': 'b', 'old_value': 'a'}, "root['peers'][1]": {'new_value': 'a', 'old_value': 'b'}}}
{}
{'type_changes': {"root['mtu']": {'old_type': &lt;class 'int'&gt;, 'new_type': &lt;class 'str'&gt;, 'old_value': 1500, 'new_value': '1500'}}}
{'type_changes': {"root['mtu']": {'old_type': &lt;class 'int'&gt;, 'new_type': &lt;class 'str'&gt;, 'old_value': 1500, 'new_value': '1500'}}}
{"values_changed": {"root['mtu']": {"new_value": 9000, "old_value": 1500}}}
False
{"root['b']", "root['a']"}</pre>
<p>Line-by-line chalo:</p>
<ul>
<li>Line 1: mile hue badlaav ke kinds, <code>dictionary_item_removed</code> aur <code>values_changed</code>.</li>
<li>Agli teen: <code>pretty()</code> diff ko vaakyon mein badalta hai, timer ke shor samet.</li>
<li>Agli do: timer par <code>exclude_regex_paths</code> ke saath sirf asli badlaav bachte hain.</li>
<li>Changed list items ka dictionary: reorder ki hui list badlaav gini jaati hai. <code>ignore_order=True</code> ke saath result khaali dictionary hai: wahi peers, alag order, koi farak nahi.</li>
<li>1500 aur "1500" ke liye <code>type_changes</code>, aur <code>ignore_numeric_type_changes</code> ise theek nahi karta kyunki yeh option int aur float ke liye hai, number aur text ke liye nahi. Pehle data normalise karo.</li>
<li><code>to_json()</code> ek string deta hai jo ticket mein laga sakte ho ya log system ko bhej sakte ho.</li>
<li>Barabar data ke liye <code>bool(diff)</code> False hai: <code>if diff:</code> "kuch badla" ka idiom hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Aapke tests pass hue aur manager poochhta hai "aur kuch hila?". Aap poori state ka bina filter diff lete ho, phir ek-ek <code>exclude_regex_paths</code> rule jodte ho (timers, counters, uptimes) jab tak sirf matlab ki entries na bachein. Woh list aapka <b>change record</b> hai: ticket mein saboot ki tarah laga sakte ho ki change ne yeh kiya aur kuch nahi.</p></div>

<h3>Jab deepdiff galat tool hai</h3>
<p>deepdiff chahta hai ki aap pehle raw output ko data banao, jo JSNAPy operator se zyada kaam hai. Ek sawaal ke liye, jaise "kya neighbour gayab hua?", operator chhota hai. Khule sawaalon ("jo kuch alag hai dikhao") mein deepdiff jeetta hai, kyunki pehle se jaanna nahi padta ki kya poochhna hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Parse kiye data ki jagah raw command text diff karna; ek extra space badlaav ban jaata hai. (2) Counters, timers aur uptimes exclude karna bhoolna, isliye diff kabhi khaali nahi hota. (3) Jab router lists kisi bhi order mein lautata hai tab <code>ignore_order</code> ke bina compare karna. (4) Numbers aur strings mile data par type-sensitive compare.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>exclude_regex_paths</code> regular expressions leta hai jo path ke text se match hoti hain, jaise <code>root['J2']['timer']</code>. Square brackets escape karne padte hain: <code>r"\\['timer'\\]"</code>.</p></div>

<div class="scn"><h4>Diff jo kabhi khaali nahi hua</h4><p>Ek team ne change ko "diff khaali hona chahiye" par gate kiya. Pehli run hi fail hui, kyunki uptime aur timers kisi bhi do pal ke beech alag hote hain. Unhone ignored fields ki lambi list ek shared file mein rakhi, poori team ne review ki. Waqt ke saath woh file team ki "operationally same" ki paribhasha ban gayi.</p><p><b>Lesson:</b> likh lo ki aap kya shor maante ho, aur us list ko checks jitni dhyan se review karo.</p></div>

<div class="iv"><p class="q">"Kaise dikhate ho ki change ne wahi kiya jo ticket mein tha?"</p><p>Main state snapshot karta hoon, dictionaries mein parse karta hoon, aur jaane-pehchaane shor wali fields exclude karke diff leta hoon. Diff mein theek wahi items hone chahiye jo irada tha. Koi bhi extra side effect hai jise samjhana hoga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>deepdiff do Python structures compare karta hai aur added, removed, changed items path ke saath batata hai.</li>
<li>Pehle snapshots ko dictionaries mein parse karo; raw text diff mat karo.</li>
<li><code>exclude_regex_paths</code> shor (timers, counters) hataata hai; <code>ignore_order</code> lists sambhalta hai.</li>
<li>Logon ke liye <code>pretty()</code>, logs ke liye <code>to_json()</code>, scripts ke liye <code>bool(diff)</code>.</li>
<li>deepdiff khule sawaalon ka jawab deta hai; JSNAPy operators tay sawaalon ka.</li>
</ul></div>
`}};export{e as default};