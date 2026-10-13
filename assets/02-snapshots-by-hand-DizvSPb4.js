var e={id:`snapshots-by-hand`,h:{en:`Snapshots by hand: save the state as files`,hi:`Snapshots haath se: state ko files mein save karo`},body:{en:`
<p>Before we use a tool, let us build the idea by hand, because JSNAPy is only a tidy version of it. A <b>snapshot</b> is one command's worth of device state, saved as a file. If you can write ten lines of PyEZ that save the OSPF neighbours of a router, you understand everything JSNAPy does in its first half.</p>

<h3>What is worth a snapshot?</h3>
<p>A good snapshot captures state that is <b>stable when the network is healthy</b> and <b>changes when something breaks</b>. A router's uptime is the opposite: it changes every second and tells you nothing. Good candidates for a Junos core router:</p>
<table class="cmp"><tr><th>State</th><th>PyEZ call</th><th>What you learn</th></tr>
<tr><td>OSPF neighbours</td><td><code>dev.rpc.get_ospf_neighbor_information()</code></td><td>Who is adjacent, in which state, on which interface</td></tr>
<tr><td>BGP sessions</td><td><code>dev.rpc.get_bgp_summary_information()</code></td><td>Peers, AS numbers, Established or not</td></tr>
<tr><td>Interface status</td><td><code>dev.rpc.get_interface_information(terse=True)</code></td><td>Admin and operational state per port</td></tr></table>
<p>The method name is the RPC name with dashes turned into underscores, and it is the same RPC the CLI uses when you type <code>show ospf neighbor | display xml rpc</code>. You met this rule in <code>adv-pyez</code>.</p>

<h3>The smallest snapshot tool</h3>
<p>This script connects to one router, asks for each RPC with <code>normalize=True</code> (so the text inside the XML has no stray newlines), and writes one file per RPC. The file name is <code>host_tag_what.xml</code>, the same convention JSNAPy uses, so a human can find a file without opening it.</p>
<pre class="code">"""snapshot.py - save the OSPF and BGP state of one router as XML files. Usage: python3 snapshot.py HOST TAG"""
import os
import sys

from jnpr.junos import Device
from lxml import etree

RPCS = ["get_ospf_neighbor_information", "get_bgp_summary_information"]


def take(host, tag, folder="manual"):
    if not os.path.isdir(folder):
        os.makedirs(folder)
    with Device(host=host, user="netops", passwd="NK@2026", gather_facts=False) as dev:
        for name in RPCS:
            reply = getattr(dev.rpc, name)(normalize=True)
            path = "%s/%s_%s_%s.xml" % (folder, host, tag, name[4:-12])
            with open(path, "w") as f:
                f.write(etree.tostring(reply, pretty_print=True).decode())
            print("saved", path)


if __name__ == "__main__":
    take(sys.argv[1], sys.argv[2])</pre>
<p>Run it once for J2 with the tag <code>before</code>:</p>
<pre class="out">AUTO01$ python3 snapshot.py 10.99.0.12 before
saved manual/10.99.0.12_before_ospf_neighbor.xml
saved manual/10.99.0.12_before_bgp_summary.xml</pre>
<pre class="out">AUTO01$ ls manual
10.99.0.12_before_bgp_summary.xml  10.99.0.12_before_ospf_neighbor.xml</pre>
<p>The file is plain XML. Here are its first lines. Notice what changes from one run to the next and what does not: the neighbour addresses, interfaces and states are stable, the <code>activity-timer</code> counts down and wraps, so it will differ in every snapshot.</p>
<pre class="out">AUTO01$ head -n 16 manual/10.99.0.12_before_ospf_neighbor.xml
&lt;ospf-neighbor-information&gt;
  &lt;ospf-neighbor&gt;
    &lt;neighbor-address&gt;10.99.0.11&lt;/neighbor-address&gt;
    &lt;interface-name&gt;ge-0/0/0.0&lt;/interface-name&gt;
    &lt;ospf-neighbor-state&gt;Full&lt;/ospf-neighbor-state&gt;
    &lt;neighbor-id&gt;10.255.0.1&lt;/neighbor-id&gt;
    &lt;neighbor-priority&gt;128&lt;/neighbor-priority&gt;
<span class="hl">    &lt;activity-timer&gt;35&lt;/activity-timer&gt;</span>
  &lt;/ospf-neighbor&gt;
  &lt;ospf-neighbor&gt;
    &lt;neighbor-address&gt;10.99.0.13&lt;/neighbor-address&gt;
    &lt;interface-name&gt;ge-0/0/0.0&lt;/interface-name&gt;
    &lt;ospf-neighbor-state&gt;Full&lt;/ospf-neighbor-state&gt;
    &lt;neighbor-id&gt;10.255.0.3&lt;/neighbor-id&gt;
    &lt;neighbor-priority&gt;128&lt;/neighbor-priority&gt;
<span class="hl">    &lt;activity-timer&gt;37&lt;/activity-timer&gt;</span></pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="One router, two RPCs, two files in a folder">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">snapshot.py</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="190" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="245" y="66" text-anchor="middle" class="svg-ink" font-size="13">J2</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.99.0.12</text>
<rect x="400" y="14" width="230" height="40" rx="8" fill="#fde68a"/><text x="515" y="39" text-anchor="middle" class="svg-ink" font-size="11">10.99.0.12_before_ospf_neighbor.xml</text>
<rect x="400" y="84" width="230" height="40" rx="8" fill="#fde68a"/><text x="515" y="109" text-anchor="middle" class="svg-ink" font-size="11">10.99.0.12_before_bgp_summary.xml</text>
<line x1="120" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="2"/><text x="155" y="62" text-anchor="middle" class="svg-muted" font-size="11">2 RPCs</text>
<line x1="120" y1="64" x2="400" y2="34" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="120" y1="76" x2="400" y2="104" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Each RPC reply becomes one XML file whose name says which router, which tag and which command.</p></div>

<h3>Reading a snapshot back</h3>
<p>A file is only useful if a program can read it. Parse the XML with lxml and pull out the fields you care about. Here is a four-line reader that turns a neighbour snapshot into one line per neighbour:</p>
<pre class="code">"""readback.py - read a saved snapshot back: neighbour -&gt; state"""
import sys

from lxml import etree

with open(sys.argv[1]) as f:
    root = etree.fromstring(f.read())
for nbr in root.iter("ospf-neighbor"):
    print("%-12s %-12s %s" % (nbr.findtext("neighbor-address"), nbr.findtext("interface-name"), nbr.findtext("ospf-neighbor-state")))</pre>
<pre class="out">AUTO01$ python3 readback.py snapshots/10.99.0.12_pre_show_ospf_neighbor.xml
10.99.0.11   ge-0/0/0.0   Full
10.99.0.13   ge-0/0/0.0   Full
10.12.0.1    ge-0/0/1.0   Full
10.23.0.2    ge-0/0/2.0   Full</pre>
<p>That is already a small piece of validation: a dictionary of <code>neighbour address -> state</code> that you can compare with another dictionary later. Chapter 7 does exactly that with deepdiff.</p>

<div class="eg"><p><b>Worked example.</b> J2 has four neighbours when healthy: 10.99.0.11 and 10.99.0.13 on ge-0/0/0 (through the management switch), 10.12.0.1 on ge-0/0/1 (towards J1) and 10.23.0.2 on ge-0/0/2 (towards J3). Four lines in a file are your ground truth. After a change, if the file written afterwards has three lines, you know which neighbour is missing without reading any prose.</p></div>

<h3>In the lab and on real gear</h3>
<p>The code above is the code you would run against real Junos devices. In the lab, <code>time.sleep</code> runs on a virtual clock and the devices are simulated, but file handling, lxml and PyEZ calls are used exactly the same way.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Saving the reply of <code>dev.cli("show ospf neighbor")</code>: that is text for humans, not a stable structure; ask for the RPC instead. (2) Forgetting <code>normalize=True</code>, so whitespace in the values breaks comparisons. (3) Snapshotting volatile fields such as uptime and counters, then drowning in differences. (4) Leaving snapshots world-readable: a snapshot can hold addresses and names you would not publish, so keep the folder private.</p></div>
<div class="exam"><p><b>Exam trap.</b> A snapshot describes <b>operational state</b>, not configuration. Saving <code>get_config</code> output proves what you asked for; saving the OSPF neighbour RPC proves what the network did about it. Validation needs the second.</p></div>

<div class="scn"><h4>The diff nobody could read</h4><p>An engineer saved <code>show interfaces</code> text before and after a change and ran <code>diff</code>. The result was four hundred lines of changed packet counters, and the one real change, an interface that went down, was buried inside. Afterwards the team switched to small structured snapshots of status fields only, and the same diff showed one line.</p><p><b>Lesson:</b> snapshot the few fields that mean something and leave out the counters.</p></div>

<div class="iv"><p class="q">"What would you save in a pre-change snapshot of a core router?"</p><p>State that should not change during a change window and that answers a yes or no question: OSPF and BGP neighbours with their states, interface admin and operational status, and a route count for key tables. I take them as structured data through RPCs, not as CLI text, and I leave out counters and timers, which always differ.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A snapshot is one command's state saved as a file: host, tag and command in the name.</li>
<li>Use RPCs with <code>normalize=True</code>; they return structured XML you can parse.</li>
<li>Snapshot stable status fields; counters and timers only create noise.</li>
<li>Reading a snapshot back into a dictionary is the first step towards comparing.</li>
<li>Keep snapshots private; they describe your network.</li>
</ul></div>
`,hi:`
<p>Tool use karne se pehle idea ko haath se banate hain, kyunki JSNAPy usi ka tidy version hai. <b>Snapshot</b> ek command ke barabar device state hai, file ki tarah save kiya hua. Agar aap PyEZ ki das lines likh sakte ho jo router ke OSPF neighbours save kar dein, to JSNAPy ka pehla aadha hissa aap samajh gaye.</p>

<h3>Snapshot ke layak kya hai?</h3>
<p>Achha snapshot woh state pakadta hai jo <b>network healthy ho to stable rehti hai</b> aur <b>kuch toote to badal jaati hai</b>. Router ka uptime ulta hai: har second badalta hai aur kuch nahi batata. Junos core router ke liye achhe candidates:</p>
<table class="cmp"><tr><th>State</th><th>PyEZ call</th><th>Kya pata chalta hai</th></tr>
<tr><td>OSPF neighbours</td><td><code>dev.rpc.get_ospf_neighbor_information()</code></td><td>Kaun adjacent hai, kis state mein, kis interface par</td></tr>
<tr><td>BGP sessions</td><td><code>dev.rpc.get_bgp_summary_information()</code></td><td>Peers, AS numbers, Established ya nahi</td></tr>
<tr><td>Interface status</td><td><code>dev.rpc.get_interface_information(terse=True)</code></td><td>Har port ki admin aur operational state</td></tr></table>
<p>Method ka naam RPC ka naam hai jisme dashes ki jagah underscores hain, aur yeh wahi RPC hai jo CLI use karta hai jab aap <code>show ospf neighbor | display xml rpc</code> type karte ho. Yeh rule aapne <code>adv-pyez</code> mein dekha tha.</p>

<h3>Sabse chhota snapshot tool</h3>
<p>Yeh script ek router se connect karti hai, har RPC <code>normalize=True</code> ke saath maangti hai (taaki XML ke andar ke text mein faltu newlines na ho), aur har RPC ke liye ek file likhti hai. File ka naam <code>host_tag_what.xml</code> hai, jo JSNAPy ki bhi convention hai, taaki insaan file kholne se pehle hi use dhoondh sake.</p>
<pre class="code">"""snapshot.py - save the OSPF and BGP state of one router as XML files. Usage: python3 snapshot.py HOST TAG"""
import os
import sys

from jnpr.junos import Device
from lxml import etree

RPCS = ["get_ospf_neighbor_information", "get_bgp_summary_information"]


def take(host, tag, folder="manual"):
    if not os.path.isdir(folder):
        os.makedirs(folder)
    with Device(host=host, user="netops", passwd="NK@2026", gather_facts=False) as dev:
        for name in RPCS:
            reply = getattr(dev.rpc, name)(normalize=True)
            path = "%s/%s_%s_%s.xml" % (folder, host, tag, name[4:-12])
            with open(path, "w") as f:
                f.write(etree.tostring(reply, pretty_print=True).decode())
            print("saved", path)


if __name__ == "__main__":
    take(sys.argv[1], sys.argv[2])</pre>
<p>Ise J2 ke liye tag <code>before</code> ke saath ek baar chalao:</p>
<pre class="out">AUTO01$ python3 snapshot.py 10.99.0.12 before
saved manual/10.99.0.12_before_ospf_neighbor.xml
saved manual/10.99.0.12_before_bgp_summary.xml</pre>
<pre class="out">AUTO01$ ls manual
10.99.0.12_before_bgp_summary.xml  10.99.0.12_before_ospf_neighbor.xml</pre>
<p>File plain XML hai. Yeh uski shuruaati lines hain. Dekho ki ek run se doosre run mein kya badalta hai aur kya nahi: neighbour addresses, interfaces aur states stable hain, <code>activity-timer</code> ulta ginta hai aur wrap hota hai, isliye har snapshot mein alag hoga.</p>
<pre class="out">AUTO01$ head -n 16 manual/10.99.0.12_before_ospf_neighbor.xml
&lt;ospf-neighbor-information&gt;
  &lt;ospf-neighbor&gt;
    &lt;neighbor-address&gt;10.99.0.11&lt;/neighbor-address&gt;
    &lt;interface-name&gt;ge-0/0/0.0&lt;/interface-name&gt;
    &lt;ospf-neighbor-state&gt;Full&lt;/ospf-neighbor-state&gt;
    &lt;neighbor-id&gt;10.255.0.1&lt;/neighbor-id&gt;
    &lt;neighbor-priority&gt;128&lt;/neighbor-priority&gt;
<span class="hl">    &lt;activity-timer&gt;35&lt;/activity-timer&gt;</span>
  &lt;/ospf-neighbor&gt;
  &lt;ospf-neighbor&gt;
    &lt;neighbor-address&gt;10.99.0.13&lt;/neighbor-address&gt;
    &lt;interface-name&gt;ge-0/0/0.0&lt;/interface-name&gt;
    &lt;ospf-neighbor-state&gt;Full&lt;/ospf-neighbor-state&gt;
    &lt;neighbor-id&gt;10.255.0.3&lt;/neighbor-id&gt;
    &lt;neighbor-priority&gt;128&lt;/neighbor-priority&gt;
<span class="hl">    &lt;activity-timer&gt;37&lt;/activity-timer&gt;</span></pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek router, do RPCs, folder mein do files">
<rect x="10" y="40" width="110" height="60" rx="10" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">snapshot.py</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="11">AUTO01</text>
<rect x="190" y="40" width="110" height="60" rx="10" fill="#bbf7d0"/><text x="245" y="66" text-anchor="middle" class="svg-ink" font-size="13">J2</text><text x="245" y="84" text-anchor="middle" class="svg-muted" font-size="11">10.99.0.12</text>
<rect x="400" y="14" width="230" height="40" rx="8" fill="#fde68a"/><text x="515" y="39" text-anchor="middle" class="svg-ink" font-size="11">10.99.0.12_before_ospf_neighbor.xml</text>
<rect x="400" y="84" width="230" height="40" rx="8" fill="#fde68a"/><text x="515" y="109" text-anchor="middle" class="svg-ink" font-size="11">10.99.0.12_before_bgp_summary.xml</text>
<line x1="120" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="2"/><text x="155" y="62" text-anchor="middle" class="svg-muted" font-size="11">2 RPCs</text>
<line x1="120" y1="64" x2="400" y2="34" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><line x1="120" y1="76" x2="400" y2="104" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
</svg><p class="cap">Har RPC reply ek XML file banta hai jiska naam batata hai kaunsa router, kaunsa tag aur kaunsi command.</p></div>

<h3>Snapshot ko wapas padhna</h3>
<p>File tabhi kaam ki hai jab koi program use padh sake. XML ko lxml se parse karo aur jo fields chahiye woh nikalo. Yeh chaar-line ka reader hai jo neighbour snapshot ko har neighbour ki ek line mein badal deta hai:</p>
<pre class="code">"""readback.py - read a saved snapshot back: neighbour -&gt; state"""
import sys

from lxml import etree

with open(sys.argv[1]) as f:
    root = etree.fromstring(f.read())
for nbr in root.iter("ospf-neighbor"):
    print("%-12s %-12s %s" % (nbr.findtext("neighbor-address"), nbr.findtext("interface-name"), nbr.findtext("ospf-neighbor-state")))</pre>
<pre class="out">AUTO01$ python3 readback.py snapshots/10.99.0.12_pre_show_ospf_neighbor.xml
10.99.0.11   ge-0/0/0.0   Full
10.99.0.13   ge-0/0/0.0   Full
10.12.0.1    ge-0/0/1.0   Full
10.23.0.2    ge-0/0/2.0   Full</pre>
<p>Yeh pehle se hi chhoti si validation hai: <code>neighbour address -> state</code> ki dictionary jise aap baad mein doosri dictionary se compare kar sakte ho. Chapter 7 exactly yehi deepdiff se karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Healthy hone par J2 ke chaar neighbours hote hain: 10.99.0.11 aur 10.99.0.13 ge-0/0/0 par (management switch ke raaste), 10.12.0.1 ge-0/0/1 par (J1 ki taraf) aur 10.23.0.2 ge-0/0/2 par (J3 ki taraf). File ki chaar lines aapki ground truth hain. Change ke baad agar likhi gayi file mein teen lines hain, to bina kuch padhe pata chal jaata hai kaunsa neighbour missing hai.</p></div>

<h3>Lab aur asli gear mein</h3>
<p>Upar ka code wahi code hai jo aap asli Junos devices par chalaoge. Lab mein <code>time.sleep</code> virtual clock par chalta hai aur devices simulated hain, lekin file handling, lxml aur PyEZ calls bilkul waise hi use hote hain.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>dev.cli("show ospf neighbor")</code> ka reply save karna: woh insaanon ke liye text hai, stable structure nahi; uski jagah RPC maango. (2) <code>normalize=True</code> bhool jaana, jisse values mein whitespace comparisons tod deta hai. (3) Uptime aur counters jaise volatile fields snapshot karna aur differences mein doob jaana. (4) Snapshots ko world-readable chhodna: snapshot mein aise addresses aur naam ho sakte hain jo aap publish nahi karoge, isliye folder private rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Snapshot <b>operational state</b> batata hai, configuration nahi. <code>get_config</code> ka output save karna saabit karta hai ki aapne kya maanga; OSPF neighbour RPC save karna saabit karta hai ki network ne uska kya kiya. Validation ko doosra chahiye.</p></div>

<div class="scn"><h4>Woh diff jo koi padh nahi saka</h4><p>Ek engineer ne change se pehle aur baad <code>show interfaces</code> ka text save kiya aur <code>diff</code> chalaya. Natija packet counters ki chaar sau badli hui lines thi, aur ek asli change, ek interface ka down hona, unke andar dab gaya. Baad mein team ne sirf status fields ke chhote structured snapshots apnaye, aur wahi diff ek line dikhane laga.</p><p><b>Lesson:</b> un thode fields ka snapshot lo jinka matlab hai, counters chhod do.</p></div>

<div class="iv"><p class="q">"Core router ke pre-change snapshot mein aap kya save karoge?"</p><p>Woh state jo change window mein nahi badalni chahiye aur jo haan ya na wala sawaal answer kare: OSPF aur BGP neighbours unki states ke saath, interface admin aur operational status, aur key tables ka route count. Main inhe RPCs se structured data ki tarah leta hoon, CLI text ki tarah nahi, aur counters aur timers chhod deta hoon, kyunki woh hamesha alag hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Snapshot ek command ki state hai jo file mein save hui: naam mein host, tag aur command.</li>
<li><code>normalize=True</code> ke saath RPCs use karo; woh structured XML dete hain jise parse kar sakte ho.</li>
<li>Stable status fields ka snapshot lo; counters aur timers sirf noise banate hain.</li>
<li>Snapshot ko dictionary mein wapas padhna compare karne ki taraf pehla kadam hai.</li>
<li>Snapshots private rakho; woh aapke network ko describe karte hain.</li>
</ul></div>
`}};export{e as default};