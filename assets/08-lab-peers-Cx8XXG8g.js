var e={id:`lab-peers`,h:{en:`Lab 1 walkthrough: Junos neighbours and PAN-OS interfaces in one table`,hi:`Lab 1 walkthrough: Junos neighbours aur PAN-OS interfaces ek table mein`},body:{en:`
<p><b>The idea of this chapter:</b> put chapters 2 to 7 to work. You pull XML from three Junos routers and one firewall, read it with three different tools, and finish with one report. Type the scripts yourself in the lab; the outputs below are what the lab terminal printed.</p>

<h3>The setup</h3>
<ul>
<li><b>AUTO01</b> is your workstation. J1, J2, J3 are Junos routers; J1 is at 10.99.0.11 and peers with J2 (Established), J3 (Idle or Active) and a dead address (Active). PA1 is the PAN-OS firewall at 10.99.0.42.</li>
<li>Goal: one table of device, item, detail and state, from XML replies only.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 data flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/>
<text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">AUTO01</text>
<rect x="190" y="15" width="130" height="60" rx="10" fill="#bae6fd"/>
<text x="255" y="41" text-anchor="middle" class="svg-ink" font-size="13">J1 Junos</text>
<text x="255" y="57" text-anchor="middle" class="svg-muted" font-size="11">netmiko</text>
<rect x="190" y="125" width="130" height="60" rx="10" fill="#bae6fd"/>
<text x="255" y="151" text-anchor="middle" class="svg-ink" font-size="13">PA1 PAN-OS</text>
<text x="255" y="167" text-anchor="middle" class="svg-muted" font-size="11">requests</text>
<rect x="370" y="15" width="130" height="60" rx="10" fill="#fed7aa"/>
<text x="435" y="49" text-anchor="middle" class="svg-ink" font-size="13">junos_bgp.xml</text>
<rect x="370" y="125" width="130" height="60" rx="10" fill="#fed7aa"/>
<text x="435" y="159" text-anchor="middle" class="svg-ink" font-size="13">pan_if.xml</text>
<rect x="550" y="70" width="85" height="60" rx="10" fill="#bbf7d0"/>
<text x="592" y="104" text-anchor="middle" class="svg-ink" font-size="13">report.py</text>
<line x1="120" y1="90" x2="190" y2="50" stroke="#64748b" stroke-width="2"/>
<polygon points="190,50 185,56 182,50" fill="#64748b"/>
<line x1="120" y1="110" x2="190" y2="150" stroke="#64748b" stroke-width="2"/>
<polygon points="190,150 182,149 185,143" fill="#64748b"/>
<line x1="320" y1="45" x2="370" y2="45" stroke="#64748b" stroke-width="2"/>
<polygon points="370,45 362,48 362,41" fill="#64748b"/>
<line x1="320" y1="155" x2="370" y2="155" stroke="#64748b" stroke-width="2"/>
<polygon points="370,155 362,158 362,151" fill="#64748b"/>
<line x1="500" y1="45" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<polygon points="550,85 542,83 546,77" fill="#64748b"/>
<line x1="500" y1="155" x2="550" y2="115" stroke="#64748b" stroke-width="2"/>
<polygon points="550,115 546,122 542,116" fill="#64748b"/>
</svg><p class="cap">Save each reply as a file, then build the report from the files.</p></div>
<h3>Step 1: get the Junos XML</h3>
<pre class="code">with ConnectHandler(**DEVICE) as conn:
    raw = conn.send_command("show bgp neighbor | display xml")

with open("junos_bgp.xml", "w") as f:
    f.write(raw)
print("saved junos_bgp.xml,", raw.count("&lt;bgp-peer "), "bgp-peer blocks")</pre>
<pre class="out">AUTO01$ python3 fetch_junos.py
saved junos_bgp.xml, 3 bgp-peer blocks</pre>
<p><code>| display xml</code> turns the ordinary CLI output into the XML reply you studied in chapter 1. The script saves it, so every later step can work offline from <code>junos_bgp.xml</code>. Counting <code>&lt;bgp-peer </code> with the trailing space is a cheap sanity check: three blocks, three neighbours.</p>

<h3>Step 2: read it with ElementTree</h3>
<pre class="code">NS = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}
root = ET.parse("junos_bgp.xml").getroot()

print("no namespace:", root.find("bgp-information"))
for peer in root.findall("rt:bgp-information/rt:bgp-peer", NS):
    address = peer.findtext("rt:peer-address", namespaces=NS).split("+")[0]
    asn = peer.findtext("rt:peer-as", namespaces=NS)
    state = peer.findtext("rt:peer-state", namespaces=NS)
    print(f"{address:&lt;12} AS{asn:&lt;6} {state}")</pre>
<pre class="out">AUTO01$ python3 peers_et.py
<span class="hl">no namespace: None</span>
10.99.0.12   AS65002  Established
10.99.0.13   AS65003  Idle
10.99.0.99   AS65099  Active</pre>
<p>The first print is the chapter 3 lesson in one line: without the <code>rt</code> map, <code>find</code> returns <code>None</code>. With it, every field is found, and <code>split("+")[0]</code> removes Junos's <code>+179</code>. The state of J3 can show as Idle or Active depending on timing; that is real BGP behaviour, not a bug.</p>

<h3>Step 3 and 4: PAN-OS, the happy path and the refusal</h3>
<pre class="code">raw = op("&lt;show&gt;&lt;interface&gt;all&lt;/interface&gt;&lt;/show&gt;", get_key())
with open("pan_if.xml", "w") as f:
    f.write(raw)

root = ET.fromstring(raw)
print("status:", root.get("status"))
for entry in root.findall("result/ifnet/entry"):
    print(entry.findtext("name"), entry.findtext("ip"), "zone", entry.findtext("zone"))</pre>
<pre class="out">AUTO01$ python3 fetch_pan.py
status: success
ethernet1/1 10.99.0.42/24 zone trust</pre>
<p>The helper module <code>panlib.py</code> holds <code>get_key()</code> (the keygen call from chapter 2) and <code>op()</code>. The firewall answers with <code>status="success"</code> and a <code>result/ifnet/entry</code> per interface. Now the BGP question, which this lab firewall cannot answer:</p>
<pre class="code">raw = op("&lt;show&gt;&lt;routing&gt;&lt;protocol&gt;&lt;bgp&gt;&lt;peer&gt;&lt;/peer&gt;&lt;/bgp&gt;&lt;/protocol&gt;&lt;/routing&gt;&lt;/show&gt;", get_key())
root = ET.fromstring(raw)
print("status:", root.get("status"), "code:", root.get("code"))
print(root.findtext("msg/line"))</pre>
<pre class="out">AUTO01$ python3 pan_bgp.py
<span class="hl">status: error code: 17</span>
Invalid command: show routing protocol bgp peer</pre>
<p>Status error, code 17, and the firewall's own words in <code>msg/line</code>. A good script reports this and carries on; it does not crash and it does not print an empty table.</p>
<div class="warn"><p><b>Lab vs real.</b> A real PAN-OS firewall running BGP answers that request with peer data. The lab firewall does not model BGP, so the report uses its interface table instead.</p></div>

<h3>Step 5: one table</h3>
<pre class="code"># PAN-OS: one row per configured interface (the lab firewall has no BGP)
proot = ET.parse("pan_if.xml").getroot()
link = {e.findtext("name"): e.findtext("state") for e in proot.findall("result/hw/entry")}
for entry in proot.findall("result/ifnet/entry"):
    name = entry.findtext("name")
    detail = entry.findtext("ip") + " zone " + entry.findtext("zone")
    rows.append(["PA1", name, detail, link.get(name, "unknown")])

print(tabulate(rows, headers=["device", "item", "detail", "state"], tablefmt="github"))
print(len(rows), "rows")</pre>
<pre class="out">AUTO01$ python3 report.py
| device   | item           | detail                   | state       |
|----------|----------------|--------------------------|-------------|
| J1       | bgp 10.99.0.12 | AS 65002                 | Established |
| J1       | bgp 10.99.0.13 | AS 65003                 | Idle        |
| J1       | bgp 10.99.0.99 | AS 65099                 | Active      |
| PA1      | ethernet1/1    | 10.99.0.42/24 zone trust | up          |
4 rows</pre>
<p>Rows from the two vendors have the same four columns, so <code>tabulate</code> prints them together. The Junos rows come from the namespaced <code>rt:</code> queries. The PAN-OS rows come from two un-namespaced lists, <code>result/ifnet/entry</code> for addresses and <code>result/hw/entry</code> for link state, joined by interface name through a dict.</p>

<h3>Step 6 and 7: the other two tools</h3>
<pre class="code">def peers(raw, **kwargs):
    return xmltodict.parse(raw, **kwargs)["rpc-reply"]["bgp-information"]["bgp-peer"]


print("all peers:", type(peers(all_peers)).__name__)
print("one peer: ", type(peers(one_peer)).__name__)
fixed = peers(one_peer, force_list=("bgp-peer",))
print("force_list:", type(fixed).__name__, len(fixed))
for p in peers(all_peers, force_list=("bgp-peer",)):
    print(p["peer-address"].split("+")[0], p["peer-as"], p["peer-state"])</pre>
<pre class="out">AUTO01$ python3 peers_xd.py
all peers: list
<span class="hl">one peer:  dict</span>
<span class="hl">force_list: list 1</span>
10.99.0.12 65002 Established
10.99.0.13 65003 Idle
10.99.0.99 65099 Active</pre>
<p>The same data through xmltodict: the one-neighbour command gives a <code>dict</code>, and <code>force_list=("bgp-peer",)</code> turns it into a list of one, so one loop serves both cases.</p>
<pre class="code">bad = root.xpath("//rt:bgp-peer[rt:peer-state!='Established']/rt:peer-address/text()", namespaces=RT)
print(len(bad), "neighbours not Established:", [a.split("+")[0] for a in bad])</pre>
<pre class="out">AUTO01$ python3 bad_peers.py
2 neighbours not Established: ['10.99.0.13', '10.99.0.99']
local-name() gives the same: True</pre>
<p>Finally lxml: one XPath expression with a predicate returns only the neighbours that are not Established, and <code>text()</code> gives the strings directly, which ElementTree could not. The next line of the script repeats the query with <code>local-name()</code> and confirms the same answer.</p>

<div class="warn"><p><b>Common mistakes.</b> Hard-coding "bgp-peer" without the namespace. Forgetting the trailing <code>+179</code> and printing it in the report. Assuming PAN-OS can answer a BGP question because the XML request looks correct.</p></div>
<div class="exam"><p><b>Exam trap.</b> Different vendors, same job: the tool changes (namespace map, no namespace, force_list) but the method stays the same. Look at the reply first, then choose the query.</p></div>

<div class="scn"><h4>One report for two teams</h4><p>The network team wanted BGP state and the security team wanted interface zones, in the same morning report. The script keeps one parser per vendor that returns plain rows, and a single table printer. When the firewall rejected the BGP request, the report listed the interface rows and one line saying why BGP was missing.</p><p><b>Lesson:</b> normalise each vendor to rows first, then print.</p></div>

<div class="iv"><p class="q">You must report BGP state from a Junos router and interface state from a firewall in one table. How do you structure the script?</p><p>One small function per vendor that fetches, checks the reply and returns a list of rows, then one function that prints the rows. The Junos function uses a namespace map or the wildcard; the PAN-OS function reads attributes and plain paths. Each function reports its own vendor errors instead of crashing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Save the raw XML first, then parse the file, so you can debug offline.</li>
<li>Junos needs the namespace map; PAN-OS needs attribute reads and status checks.</li>
<li>Normalise to rows, then print one table.</li>
<li>A refusal from a device is information; report it.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> chapters 2 se 7 ko kaam par lagao. Teen Junos routers aur ek firewall se XML kheencho, teen alag tools se padho, aur ek report par khatam karo. Scripts lab mein khud type karo; neeche ke outputs wahi hain jo lab terminal ne chhape.</p>

<h3>Setup</h3>
<ul>
<li><b>AUTO01</b> tumhara workstation hai. J1, J2, J3 Junos routers hain; J1 10.99.0.11 par hai aur J2 (Established), J3 (Idle ya Active) aur ek murda address (Active) se peer karta hai. PA1 PAN-OS firewall hai, 10.99.0.42 par.</li>
<li>Goal: sirf XML replies se device, item, detail aur state ki ek table.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 ka data flow">
<rect x="10" y="70" width="110" height="60" rx="10" fill="#e2e8f0"/>
<text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">AUTO01</text>
<rect x="190" y="15" width="130" height="60" rx="10" fill="#bae6fd"/>
<text x="255" y="41" text-anchor="middle" class="svg-ink" font-size="13">J1 Junos</text>
<text x="255" y="57" text-anchor="middle" class="svg-muted" font-size="11">netmiko</text>
<rect x="190" y="125" width="130" height="60" rx="10" fill="#bae6fd"/>
<text x="255" y="151" text-anchor="middle" class="svg-ink" font-size="13">PA1 PAN-OS</text>
<text x="255" y="167" text-anchor="middle" class="svg-muted" font-size="11">requests</text>
<rect x="370" y="15" width="130" height="60" rx="10" fill="#fed7aa"/>
<text x="435" y="49" text-anchor="middle" class="svg-ink" font-size="13">junos_bgp.xml</text>
<rect x="370" y="125" width="130" height="60" rx="10" fill="#fed7aa"/>
<text x="435" y="159" text-anchor="middle" class="svg-ink" font-size="13">pan_if.xml</text>
<rect x="550" y="70" width="85" height="60" rx="10" fill="#bbf7d0"/>
<text x="592" y="104" text-anchor="middle" class="svg-ink" font-size="13">report.py</text>
<line x1="120" y1="90" x2="190" y2="50" stroke="#64748b" stroke-width="2"/>
<polygon points="190,50 185,56 182,50" fill="#64748b"/>
<line x1="120" y1="110" x2="190" y2="150" stroke="#64748b" stroke-width="2"/>
<polygon points="190,150 182,149 185,143" fill="#64748b"/>
<line x1="320" y1="45" x2="370" y2="45" stroke="#64748b" stroke-width="2"/>
<polygon points="370,45 362,48 362,41" fill="#64748b"/>
<line x1="320" y1="155" x2="370" y2="155" stroke="#64748b" stroke-width="2"/>
<polygon points="370,155 362,158 362,151" fill="#64748b"/>
<line x1="500" y1="45" x2="550" y2="85" stroke="#64748b" stroke-width="2"/>
<polygon points="550,85 542,83 546,77" fill="#64748b"/>
<line x1="500" y1="155" x2="550" y2="115" stroke="#64748b" stroke-width="2"/>
<polygon points="550,115 546,122 542,116" fill="#64748b"/>
</svg><p class="cap">Har reply ko file mein save karo, phir files se report banao.</p></div>
<h3>Step 1: Junos XML lo</h3>
<pre class="code">with ConnectHandler(**DEVICE) as conn:
    raw = conn.send_command("show bgp neighbor | display xml")

with open("junos_bgp.xml", "w") as f:
    f.write(raw)
print("saved junos_bgp.xml,", raw.count("&lt;bgp-peer "), "bgp-peer blocks")</pre>
<pre class="out">AUTO01$ python3 fetch_junos.py
saved junos_bgp.xml, 3 bgp-peer blocks</pre>
<p><code>| display xml</code> aam CLI output ko wahi XML reply bana deta hai jo tumne chapter 1 mein padha. Script use save karti hai, taaki baad ke har step <code>junos_bgp.xml</code> se offline kaam kare. Trailing space ke saath <code>&lt;bgp-peer </code> ginna sasti sanity check hai: teen blocks, teen neighbours.</p>

<h3>Step 2: ElementTree se padho</h3>
<pre class="code">NS = {"rt": "h&#116;tp://xml.juniper.net/junos/23.4R1/junos-routing"}
root = ET.parse("junos_bgp.xml").getroot()

print("no namespace:", root.find("bgp-information"))
for peer in root.findall("rt:bgp-information/rt:bgp-peer", NS):
    address = peer.findtext("rt:peer-address", namespaces=NS).split("+")[0]
    asn = peer.findtext("rt:peer-as", namespaces=NS)
    state = peer.findtext("rt:peer-state", namespaces=NS)
    print(f"{address:&lt;12} AS{asn:&lt;6} {state}")</pre>
<pre class="out">AUTO01$ python3 peers_et.py
<span class="hl">no namespace: None</span>
10.99.0.12   AS65002  Established
10.99.0.13   AS65003  Idle
10.99.0.99   AS65099  Active</pre>
<p>Pehli print chapter 3 ka sabak ek line mein hai: <code>rt</code> map ke bina <code>find</code> <code>None</code> deta hai. Map ke saath har field milta hai, aur <code>split("+")[0]</code> Junos ka <code>+179</code> hata deta hai. J3 ki state timing ke hisaab se Idle ya Active dikh sakti hai; yeh asli BGP behaviour hai, bug nahi.</p>

<h3>Step 3 aur 4: PAN-OS, safal raasta aur inkaar</h3>
<pre class="code">raw = op("&lt;show&gt;&lt;interface&gt;all&lt;/interface&gt;&lt;/show&gt;", get_key())
with open("pan_if.xml", "w") as f:
    f.write(raw)

root = ET.fromstring(raw)
print("status:", root.get("status"))
for entry in root.findall("result/ifnet/entry"):
    print(entry.findtext("name"), entry.findtext("ip"), "zone", entry.findtext("zone"))</pre>
<pre class="out">AUTO01$ python3 fetch_pan.py
status: success
ethernet1/1 10.99.0.42/24 zone trust</pre>
<p>Helper module <code>panlib.py</code> mein <code>get_key()</code> (chapter 2 ki keygen call) aur <code>op()</code> hain. Firewall <code>status="success"</code> aur har interface ke liye <code>result/ifnet/entry</code> ke saath jawab deta hai. Ab BGP ka sawaal, jiska yeh lab firewall jawab nahi de sakta:</p>
<pre class="code">raw = op("&lt;show&gt;&lt;routing&gt;&lt;protocol&gt;&lt;bgp&gt;&lt;peer&gt;&lt;/peer&gt;&lt;/bgp&gt;&lt;/protocol&gt;&lt;/routing&gt;&lt;/show&gt;", get_key())
root = ET.fromstring(raw)
print("status:", root.get("status"), "code:", root.get("code"))
print(root.findtext("msg/line"))</pre>
<pre class="out">AUTO01$ python3 pan_bgp.py
<span class="hl">status: error code: 17</span>
Invalid command: show routing protocol bgp peer</pre>
<p>Status error, code 17, aur firewall ke apne shabd <code>msg/line</code> mein. Achhi script ise report karke aage badhti hai; crash nahi hoti aur khaali table nahi chhapti.</p>
<div class="warn"><p><b>Lab vs real.</b> BGP chalane wala asli PAN-OS firewall us request ka jawab peer data se deta hai. Lab firewall BGP model nahi karta, isliye report uski interface table use karti hai.</p></div>

<h3>Step 5: ek table</h3>
<pre class="code"># PAN-OS: one row per configured interface (the lab firewall has no BGP)
proot = ET.parse("pan_if.xml").getroot()
link = {e.findtext("name"): e.findtext("state") for e in proot.findall("result/hw/entry")}
for entry in proot.findall("result/ifnet/entry"):
    name = entry.findtext("name")
    detail = entry.findtext("ip") + " zone " + entry.findtext("zone")
    rows.append(["PA1", name, detail, link.get(name, "unknown")])

print(tabulate(rows, headers=["device", "item", "detail", "state"], tablefmt="github"))
print(len(rows), "rows")</pre>
<pre class="out">AUTO01$ python3 report.py
| device   | item           | detail                   | state       |
|----------|----------------|--------------------------|-------------|
| J1       | bgp 10.99.0.12 | AS 65002                 | Established |
| J1       | bgp 10.99.0.13 | AS 65003                 | Idle        |
| J1       | bgp 10.99.0.99 | AS 65099                 | Active      |
| PA1      | ethernet1/1    | 10.99.0.42/24 zone trust | up          |
4 rows</pre>
<p>Dono vendors ki rows ke chaar columns same hain, isliye <code>tabulate</code> unhe saath chhapta hai. Junos rows namespaced <code>rt:</code> queries se aati hain. PAN-OS rows do un-namespaced lists se, addresses ke liye <code>result/ifnet/entry</code> aur link state ke liye <code>result/hw/entry</code>, jo interface name se dict ke zariye jodi gayi hain.</p>

<h3>Step 6 aur 7: baaki do tools</h3>
<pre class="code">def peers(raw, **kwargs):
    return xmltodict.parse(raw, **kwargs)["rpc-reply"]["bgp-information"]["bgp-peer"]


print("all peers:", type(peers(all_peers)).__name__)
print("one peer: ", type(peers(one_peer)).__name__)
fixed = peers(one_peer, force_list=("bgp-peer",))
print("force_list:", type(fixed).__name__, len(fixed))
for p in peers(all_peers, force_list=("bgp-peer",)):
    print(p["peer-address"].split("+")[0], p["peer-as"], p["peer-state"])</pre>
<pre class="out">AUTO01$ python3 peers_xd.py
all peers: list
<span class="hl">one peer:  dict</span>
<span class="hl">force_list: list 1</span>
10.99.0.12 65002 Established
10.99.0.13 65003 Idle
10.99.0.99 65099 Active</pre>
<p>Wahi data xmltodict se: ek-neighbour wali command <code>dict</code> deti hai, aur <code>force_list=("bgp-peer",)</code> use ek item ki list bana deta hai, isliye ek loop dono cases sambhalta hai.</p>
<pre class="code">bad = root.xpath("//rt:bgp-peer[rt:peer-state!='Established']/rt:peer-address/text()", namespaces=RT)
print(len(bad), "neighbours not Established:", [a.split("+")[0] for a in bad])</pre>
<pre class="out">AUTO01$ python3 bad_peers.py
2 neighbours not Established: ['10.99.0.13', '10.99.0.99']
local-name() gives the same: True</pre>
<p>Aakhir mein lxml: predicate wali ek XPath expression sirf wahi neighbours deti hai jo Established nahi hain, aur <code>text()</code> seedhe strings deta hai, jo ElementTree nahi kar sakta tha. Script ki agli line <code>local-name()</code> se query dohrati hai aur wahi jawab confirm karti hai.</p>

<div class="warn"><p><b>Aam galtiyan.</b> Namespace ke bina "bgp-peer" hard-code karna. Trailing <code>+179</code> bhoolkar report mein chhapna. Yeh maan lena ki PAN-OS BGP sawaal ka jawab dega kyunki XML request sahi dikhti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Alag vendors, ek kaam: tool badalta hai (namespace map, koi namespace nahi, force_list) par tareeka wahi rehta hai. Pehle reply dekho, phir query chuno.</p></div>

<div class="scn"><h4>Do teams ke liye ek report</h4><p>Network team ko BGP state chahiye thi aur security team ko interface zones, ek hi subah ki report mein. Script har vendor ke liye ek parser rakhti hai jo plain rows lautata hai, aur ek hi table printer. Jab firewall ne BGP request reject ki, report ne interface rows dikhayi aur ek line likhi ki BGP kyun nahi hai.</p><p><b>Seekh:</b> pehle har vendor ko rows mein normalise karo, phir chhapo.</p></div>

<div class="iv"><p class="q">Tumhein Junos router se BGP state aur firewall se interface state ek table mein report karni hai. Script kaise banaoge?</p><p>Har vendor ke liye ek chhota function jo fetch kare, reply check kare aur rows ki list lautaye, phir ek function jo rows chhape. Junos function namespace map ya wildcard use karta hai; PAN-OS function attributes aur plain paths padhta hai. Har function apne vendor ke errors khud report karta hai, crash nahi hota.</p></div>

<div class="kt"><p><b>Mukhya baatein</b></p><ul>
<li>Pehle raw XML save karo, phir file parse karo, taaki offline debug ho sake.</li>
<li>Junos ko namespace map chahiye; PAN-OS ko attribute reads aur status checks.</li>
<li>Rows mein normalise karo, phir ek table chhapo.</li>
<li>Device ka inkaar bhi jaankari hai; use report karo.</li>
</ul></div>
`}};export{e as default};