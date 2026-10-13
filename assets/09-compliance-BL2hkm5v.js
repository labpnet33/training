var e={id:`compliance`,h:{en:`Compliance reports: a YAML file that says PASS or FAIL`,hi:`Compliance reports: YAML file jo PASS ya FAIL kehti hai`},body:{en:`<p>A diff tells you what <em>your change</em> will do. It says nothing about the things nobody changed through your tool: the colleague who typed a line on the console, the router restored from an old backup, the peer whose AS number was never what the design said. <code>compliance_report()</code> answers a different question: <b>is this device, right now, what the design says it should be?</b></p>

<h3>An analogy: the building inspector</h3>
<p>An inspector walks in with a checklist: "fire exit present, two extinguishers, no extra locked doors". For each line she writes pass or fail, and she does not rebuild anything. The YAML file is the checklist; the getters are her eyes; the report is her sheet.</p>

<h3>The validation file</h3>
<p>The file is a YAML <b>list</b>. Each item has one key, the name of a getter, and the value is what you expect that getter to return. Here are E1's rules and J1's:</p>
<pre class="code">- get_facts:
    hostname: E1
    vendor: Arista
- get_ntp_servers:
    _mode: strict
    10.99.0.60: {}
- get_bgp_neighbors:
    global:
      router_id: 3.3.3.3
      peers:
        10.99.0.1:
          is_up: true
          remote_as: 65001
- get_interfaces_ip:
    Loopback0:
      ipv4:
        3.3.3.3:
          prefix_length: 32</pre>
<pre class="code">- get_facts:
    hostname: J1
    vendor: Juniper
- get_ntp_servers:
    10.99.0.60: {}
    10.99.0.61: {}
- get_bgp_neighbors:
    global:
      router_id: 2.2.2.2
      peers:
        10.99.0.1:
          is_up: true
          remote_as: 65001
- get_vlans: {1: {name: default}}</pre>
<p>How to read it:</p>
<ul>
<li>A key you list must exist on the device, and its value must match. Nested dictionaries are compared level by level (<code>global</code>, then <code>peers</code>, then one peer).</li>
<li><code>10.99.0.60: {}</code> means "this key must be present, whatever it contains". That is how you say "this NTP server must exist".</li>
<li>Keys that the device has and you did not list are <b>ignored</b>, unless you write <code>_mode: strict</code> at that level. Then every extra key is a failure. E1 uses strict for NTP: only the approved servers may exist.</li>
<li>Values are compared as typed: <code>is_up: true</code> is a boolean, <code>remote_as: 65001</code> an integer.</li></ul>

<h3>Running it</h3>
<p>Pass the file with <code>validation_file=</code>, or a Python list of rules with <code>validation_source=</code> (handy in tests and for rules you generate):</p>
<pre class="code">from nkdev import open_device

dev = open_device("R1")
rules = [{"get_facts": {"hostname": "PUN-CORE-R1"}}, {"get_ntp_servers": {"10.99.0.60": {}}}]
report = dev.compliance_report(validation_source=rules)
print(report["complies"], report["skipped"], sorted(k for k in report if k not in ("complies", "skipped")))
dev.close()</pre>
<pre class="out">AUTO01$ python3 source.py
True [] ['get_facts', 'get_ntp_servers']</pre>
<p>The top-level result has the key <code>complies</code> (a boolean for the whole device), the key <code>skipped</code> (a list), and one key per getter you listed. A missing or unreadable file raises <code>ValidationException</code>, as chapter 10 shows.</p>

<h3>Reading a report</h3>
<p>Every getter section has <code>complies</code>, and, where it applies, <code>present</code>, <code>missing</code> and <code>extra</code>. Here is J1 with the second NTP server not yet configured, printed by a tiny script:</p>
<pre class="out">AUTO01$ python3 detail.py J1
get_ntp_servers
{
 "complies": false,
 "extra": [],
 <span class="hl">"missing": [</span>
  <span class="hl">"10.99.0.61"</span>
 ],
 "present": {
  "10.99.0.60": {
   "complies": true,
   "nested": true
  }
 }
}
complies: False skipped: ['get_vlans']</pre>
<p>The expected server <code>10.99.0.61</code> is in <code>missing</code>; the server that matched, <code>10.99.0.60</code>, is under <code>present</code> with <code>complies: true</code>. For a mismatched value the section holds <code>expected_value</code> and <code>actual_value</code>; for strict mode, <code>extra</code>. Nested sections repeat inside <code>diff</code>, which is why a raw report for BGP is hard to read. Lab 2 gives you <code>check.py</code> with an <code>explain()</code> function that walks it for you:</p>
<pre class="code">"""check.py - NAPALM compliance report for every device in the inventory; exit 1 when any device fails"""
import sys

from napalm.base.exceptions import ValidationException
from nkdev import DEVICES, open_device


def explain(part, path):
    """Walk a compliance report and return one readable line per problem."""
    lines = []
    if "expected_value" in part and not part.get("complies"):
        lines.append("%s: expected %s, device has %s" % (path, part["expected_value"], part["actual_value"]))
    for kind in ("missing", "extra"):
        if part.get(kind):
            lines.append("%s: %s %s" % (path, kind, part[kind]))
    for key, sub in sorted((part.get("present") or {}).items()):
        if sub.get("complies") is False:
            lines += explain(sub, path + "/" + key)
    if isinstance(part.get("diff"), dict):
        lines += explain(part["diff"], path)
    return lines


def check(name):
    dev = open_device(name)
    try:
        report = dev.compliance_report(validation_file="validate/%s.yml" % name)
    except ValidationException as err:
        print("%s: ValidationException: %s" % (name, err))
        return False
    finally:
        dev.close()
    bad = sorted(k for k, v in report.items() if isinstance(v, dict) and v.get("complies") is False)
    print("%s: %s  failed=%s skipped=%s" % (name, "PASS" if report["complies"] else "FAIL", bad, report["skipped"]))
    for getter in bad:
        for line in explain(report[getter], getter):
            print("    " + line)
    return report["complies"]


results = [check(n) for n in DEVICES]
sys.exit(0 if all(results) else 1)</pre>
<pre class="out">AUTO01$ python3 check.py
R1: FAIL  failed=['get_bgp_neighbors'] skipped=[]
    get_bgp_neighbors/global/peers/10.99.0.11/<span class="hl">remote_as: expected 65020, device has 65002</span>
J1: FAIL  failed=['get_ntp_servers'] skipped=['get_vlans']
    get_ntp_servers: <span class="hl">missing ['10.99.0.61']</span>
E1: FAIL  failed=['get_ntp_servers'] skipped=[]
    get_ntp_servers: <span class="hl">extra ['10.99.0.99']</span></pre>
<p>Three FAILs, three different reasons, one flat line each: a value that differs, a member that is missing, a member that is extra. The path <code>get_bgp_neighbors/global/peers/10.99.0.11/remote_as</code> tells you exactly where to look.</p>

<h3>skipped is not passed</h3>
<p>J1 lists <code>get_vlans</code>, but the lab's Junos driver raises <code>NotImplementedError</code> for it, so NAPALM puts it in <code>skipped</code> and the rest of the report carries on. <code>complies</code> ignores skipped getters. A rule that never runs protects nothing, so print <code>skipped</code> and treat it as a smell.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The comparison algorithm is NAPALM's own, so the structure of the report is the real one. What the getters return follows the simulator, so a rule about LLDP neighbours or environment sensors would not match real hardware. Write your validation files against a real device and test them in the lab only for the logic.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>_mode: strict</code> and so never noticing an extra NTP server; using <code>uptime</code> or counters as expected values; ignoring <code>skipped</code>; keeping one validation file for devices of different vendors (the keys, such as interface names, differ).</p></div>

<div class="exam"><p><b>Exam trap.</b> Compliance reads state through getters; it does not change anything. A getter the driver lacks lands in <code>skipped</code> and does not make <code>complies</code> false.</p></div>

<div class="scn"><h4>The router nobody remembered to change</h4><p>A bank's compliance job went red for one core router: <code>get_ntp_servers: extra ['10.99.0.99']</code>. An engineer had added a test NTP server during an outage three weeks earlier and never removed it. The diff-based change tool could not have seen it, because it only ever merged the approved servers. Strict mode caught it on the first run.</p><p><b>Lesson:</b> merge adds, strict compliance finds what should not be there.</p></div>

<div class="iv"><p class="q">"What is the difference between compare_config and compliance_report?"</p><p>compare_config shows what a candidate would change in the configuration before I commit it. compliance_report checks the device's current state, through getters, against an expected-state file and returns PASS or FAIL with the exact path of each difference. One protects a change, the other protects the network from drift.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The validation file is a YAML list: a getter name and its expected result.</li>
<li><code>{}</code> means present; <code>_mode: strict</code> turns extra members into failures.</li>
<li>The report has <code>complies</code>, <code>skipped</code> and one section per getter.</li>
<li><code>missing</code>, <code>extra</code>, <code>expected_value</code> and <code>actual_value</code> tell you what is wrong.</li>
<li>Skipped getters do not fail the report; do not ignore them.</li></ul></div>`,hi:`<p>Diff aapko batata hai ki <em>aapka change</em> kya karega. Woh un cheezon ke baare mein kuch nahi batata jo aapke tool ke through kisi ne nahi badli: woh saathi jisne console par ek line type kar di, woh router jo purane backup se restore hua, woh peer jiska AS number kabhi design jaisa tha hi nahi. <code>compliance_report()</code> alag sawaal ka jawab deta hai: <b>kya yeh device, abhi, waisa hai jaisa design kehta hai?</b></p>

<h3>Ek analogy: building inspector</h3>
<p>Inspector checklist leke aati hai: "fire exit hai, do extinguishers, koi extra band darwaze nahi". Har line ke liye woh pass ya fail likhti hai, aur kuch dobara nahi banati. YAML file checklist hai; getters uski aankhein hain; report uski sheet hai.</p>

<h3>Validation file</h3>
<p>File ek YAML <b>list</b> hai. Har item mein ek key hai, getter ka naam, aur value woh hai jo aap us getter se expect karte ho. Yeh E1 aur J1 ke rules hain:</p>
<pre class="code">- get_facts:
    hostname: E1
    vendor: Arista
- get_ntp_servers:
    _mode: strict
    10.99.0.60: {}
- get_bgp_neighbors:
    global:
      router_id: 3.3.3.3
      peers:
        10.99.0.1:
          is_up: true
          remote_as: 65001
- get_interfaces_ip:
    Loopback0:
      ipv4:
        3.3.3.3:
          prefix_length: 32</pre>
<pre class="code">- get_facts:
    hostname: J1
    vendor: Juniper
- get_ntp_servers:
    10.99.0.60: {}
    10.99.0.61: {}
- get_bgp_neighbors:
    global:
      router_id: 2.2.2.2
      peers:
        10.99.0.1:
          is_up: true
          remote_as: 65001
- get_vlans: {1: {name: default}}</pre>
<p>Kaise padhein:</p>
<ul>
<li>Jo key aap likhte ho woh device par honi chahiye, aur uski value match karni chahiye. Nested dictionaries level dar level compare hoti hain (<code>global</code>, phir <code>peers</code>, phir ek peer).</li>
<li><code>10.99.0.60: {}</code> ka matlab "yeh key maujood honi chahiye, usme kuch bhi ho". Aise aap kehte ho "yeh NTP server hona chahiye".</li>
<li>Jo keys device ke paas hain aur aapne list nahi ki, woh <b>ignore</b> hoti hain, jab tak aap us level par <code>_mode: strict</code> na likho. Tab har extra key failure hai. E1 NTP ke liye strict use karta hai: sirf approved servers ho sakte hain.</li>
<li>Values jaise likhi hain waise compare hoti hain: <code>is_up: true</code> boolean hai, <code>remote_as: 65001</code> integer.</li></ul>

<h3>Chalana</h3>
<p>File <code>validation_file=</code> se do, ya Python list of rules <code>validation_source=</code> se (tests mein aur generate kiye hue rules ke liye kaam ki):</p>
<pre class="code">from nkdev import open_device

dev = open_device("R1")
rules = [{"get_facts": {"hostname": "PUN-CORE-R1"}}, {"get_ntp_servers": {"10.99.0.60": {}}}]
report = dev.compliance_report(validation_source=rules)
print(report["complies"], report["skipped"], sorted(k for k in report if k not in ("complies", "skipped")))
dev.close()</pre>
<pre class="out">AUTO01$ python3 source.py
True [] ['get_facts', 'get_ntp_servers']</pre>
<p>Top-level result mein key <code>complies</code> (poore device ke liye boolean), key <code>skipped</code> (list), aur aapke har listed getter ke liye ek key hoti hai. File missing ho ya padhi na jaye to <code>ValidationException</code> uthti hai, jaise chapter 10 dikhata hai.</p>

<h3>Report padhna</h3>
<p>Har getter section mein <code>complies</code> hota hai, aur jahan lagu ho wahan <code>present</code>, <code>missing</code> aur <code>extra</code>. Yeh J1 hai jab doosra NTP server abhi configure nahi hua, ek chhoti script se print kiya:</p>
<pre class="out">AUTO01$ python3 detail.py J1
get_ntp_servers
{
 "complies": false,
 "extra": [],
 <span class="hl">"missing": [</span>
  <span class="hl">"10.99.0.61"</span>
 ],
 "present": {
  "10.99.0.60": {
   "complies": true,
   "nested": true
  }
 }
}
complies: False skipped: ['get_vlans']</pre>
<p>Expected server <code>10.99.0.61</code> <code>missing</code> mein hai; jo server match hua, <code>10.99.0.60</code>, <code>present</code> ke neeche <code>complies: true</code> ke saath hai. Mismatched value ke liye section mein <code>expected_value</code> aur <code>actual_value</code> hote hain; strict mode ke liye <code>extra</code>. Nested sections <code>diff</code> ke andar dohrate hain, isliye BGP ki raw report padhna mushkil hai. Lab 2 aapko <code>check.py</code> deta hai jisme <code>explain()</code> function hai jo aapke liye use chalta hai:</p>
<pre class="code">"""check.py - NAPALM compliance report for every device in the inventory; exit 1 when any device fails"""
import sys

from napalm.base.exceptions import ValidationException
from nkdev import DEVICES, open_device


def explain(part, path):
    """Walk a compliance report and return one readable line per problem."""
    lines = []
    if "expected_value" in part and not part.get("complies"):
        lines.append("%s: expected %s, device has %s" % (path, part["expected_value"], part["actual_value"]))
    for kind in ("missing", "extra"):
        if part.get(kind):
            lines.append("%s: %s %s" % (path, kind, part[kind]))
    for key, sub in sorted((part.get("present") or {}).items()):
        if sub.get("complies") is False:
            lines += explain(sub, path + "/" + key)
    if isinstance(part.get("diff"), dict):
        lines += explain(part["diff"], path)
    return lines


def check(name):
    dev = open_device(name)
    try:
        report = dev.compliance_report(validation_file="validate/%s.yml" % name)
    except ValidationException as err:
        print("%s: ValidationException: %s" % (name, err))
        return False
    finally:
        dev.close()
    bad = sorted(k for k, v in report.items() if isinstance(v, dict) and v.get("complies") is False)
    print("%s: %s  failed=%s skipped=%s" % (name, "PASS" if report["complies"] else "FAIL", bad, report["skipped"]))
    for getter in bad:
        for line in explain(report[getter], getter):
            print("    " + line)
    return report["complies"]


results = [check(n) for n in DEVICES]
sys.exit(0 if all(results) else 1)</pre>
<pre class="out">AUTO01$ python3 check.py
R1: FAIL  failed=['get_bgp_neighbors'] skipped=[]
    get_bgp_neighbors/global/peers/10.99.0.11/<span class="hl">remote_as: expected 65020, device has 65002</span>
J1: FAIL  failed=['get_ntp_servers'] skipped=['get_vlans']
    get_ntp_servers: <span class="hl">missing ['10.99.0.61']</span>
E1: FAIL  failed=['get_ntp_servers'] skipped=[]
    get_ntp_servers: <span class="hl">extra ['10.99.0.99']</span></pre>
<p>Teen FAIL, teen alag wajah, har ek ki ek flat line: value jo alag hai, member jo missing hai, member jo extra hai. Path <code>get_bgp_neighbors/global/peers/10.99.0.11/remote_as</code> theek batata hai kahan dekhna hai.</p>

<h3>skipped ka matlab passed nahi</h3>
<p>J1 <code>get_vlans</code> list karta hai, par lab ka Junos driver uske liye <code>NotImplementedError</code> uthata hai, isliye NAPALM use <code>skipped</code> mein daalta hai aur baaki report chalti rehti hai. <code>complies</code> skipped getters ko ignore karta hai. Jo rule kabhi chalta hi nahi woh kuch nahi bachata, isliye <code>skipped</code> print karo aur use badboo maano.</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Comparison algorithm NAPALM ka apna hai, isliye report ki structure asli hai. Getters kya lautate hain woh simulator follow karta hai, isliye LLDP neighbours ya environment sensors ka rule asli hardware se match nahi karega. Validation files asli device ke khilaf likho aur lab mein sirf logic test karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>_mode: strict</code> bhool jana aur isliye extra NTP server kabhi na dikhna; <code>uptime</code> ya counters ko expected values banana; <code>skipped</code> ignore karna; alag vendors ke devices ke liye ek hi validation file rakhna (keys, jaise interface names, alag hote hain).</p></div>

<div class="exam"><p><b>Exam trap.</b> Compliance getters se state padhta hai; kuch badalta nahi. Jo getter driver ke paas nahi woh <code>skipped</code> mein jaata hai aur <code>complies</code> ko false nahi karta.</p></div>

<div class="scn"><h4>Woh router jise badalna kisi ko yaad nahi tha</h4><p>Ek bank ka compliance job ek core router ke liye laal ho gaya: <code>get_ntp_servers: extra ['10.99.0.99']</code>. Ek engineer ne teen hafte pehle outage ke dauran test NTP server jod diya tha aur hataya nahi. Diff-based change tool use dekh nahi sakta tha, kyunki woh sirf approved servers merge karta tha. Strict mode ne pehle hi run mein pakad liya.</p><p><b>Lesson:</b> merge jodta hai, strict compliance woh dhoondhta hai jo nahi hona chahiye.</p></div>

<div class="iv"><p class="q">"compare_config aur compliance_report mein kya farq hai?"</p><p>compare_config commit se pehle dikhata hai ki candidate configuration mein kya badlega. compliance_report device ki maujooda state ko getters ke through expected-state file se compare karta hai aur har farq ke exact path ke saath PASS ya FAIL deta hai. Ek change ko bachata hai, doosra network ko drift se.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validation file YAML list hai: getter ka naam aur uska expected result.</li>
<li><code>{}</code> ka matlab present; <code>_mode: strict</code> extra members ko failure banata hai.</li>
<li>Report mein <code>complies</code>, <code>skipped</code> aur har getter ka ek section hota hai.</li>
<li><code>missing</code>, <code>extra</code>, <code>expected_value</code> aur <code>actual_value</code> batate hain kya galat hai.</li>
<li>Skipped getters report fail nahi karte; unhe ignore mat karo.</li></ul></div>`}};export{e as default};