var e={id:`netflow`,h:{en:`NetFlow v5, v9 and Flexible NetFlow troubleshooting`,hi:`NetFlow v5, v9 aur Flexible NetFlow troubleshooting`},body:{en:`
<p>SNMP is the electricity meter on the wall: it tells you how many units the house used. NetFlow is the itemised bill that says the air conditioner used 60%, the geyser 25% and the TV the rest. When the WAN graph spikes at 11:02, SNMP tells you <i>that</i> it spiked; NetFlow tells you <i>who</i> sent <i>what</i> to <i>where</i>.</p>

<h3>What a flow is</h3>
<p>A <b>flow</b> is a set of packets that share the same <b>key fields</b>. In traditional NetFlow the keys are seven: source IP, destination IP, source port, destination port, IP protocol, ToS and input interface. The router keeps a <b>flow cache</b>; the first packet creates an entry and later packets update its counters (bytes, packets, timestamps). An entry is exported to a <b>collector</b> when:</p>
<ul>
<li>the <b>inactive timeout</b> expires (no packets for 15 seconds by default),</li>
<li>the <b>active timeout</b> expires for a long-running flow (30 minutes by default in traditional NetFlow, often set to 1 minute),</li>
<li>a TCP FIN or RST ends the flow, or the cache is full.</li>
</ul>

<h3>Versions</h3>
<table class="cmp"><tr><th>Version</th><th>Format</th><th>Notes</th></tr>
<tr><td>v5</td><td>Fixed record</td><td>IPv4 only, no MPLS labels, no IPv6, no template. Still widely supported by collectors.</td></tr>
<tr><td>v9</td><td>Template-based</td><td>The exporter sends templates that describe the records, so it can carry IPv6, MPLS, BGP next hop and more.</td></tr>
<tr><td>IPFIX (v10)</td><td>Template-based, IETF standard</td><td>Based on v9; supported by Flexible NetFlow with <code>export-protocol ipfix</code>.</td></tr>
<tr><td>Flexible NetFlow</td><td>User-defined records</td><td>You choose match (key) and collect (non-key) fields; exports as v9, v5 or IPFIX.</td></tr></table>

<h3>Traditional NetFlow</h3>
<pre class="code">interface GigabitEthernet0/0
 ip flow ingress
ip flow-export version 9
ip flow-export destination 10.99.0.50 2055
ip flow-export source GigabitEthernet0/2
ip flow-cache timeout active 1          <span class="c">! minutes</span>
<span class="c">! verification</span>
show ip cache flow
show ip flow export
show ip flow interface</pre>
<pre class="out">EDGE# show ip flow export
Flow export v9 is enabled for main cache
  Export source and destination details :
  VRF ID : Default
    Source(1)       10.99.0.1 (GigabitEthernet0/2)
<span class="hl">    Destination(1)  10.99.0.50 (2055)</span>
  Version 9 flow records
<span class="hl">  1245 flows exported in 402 udp datagrams</span>
  0 flows failed due to lack of export packet
  0 export packets were sent up to process level
<span class="hl">  0 export packets were dropped due to no fib</span>
  0 export packets were dropped due to adjacency issues
  0 export packets were dropped due to fragmentation failures
  0 export packets were dropped due to encapsulation fixup failures</pre>
<p>"dropped due to no fib" growing means the router has no route to the collector.</p>

<h3>Flexible NetFlow (lab 3)</h3>
<pre class="code">flow record NOC-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 collect counter bytes
 collect counter packets
flow exporter NOC-EXP
 destination 10.99.0.50
 transport udp 2055
 <span class="c">! optional: source Loopback0, export-protocol ipfix</span>
flow monitor NOC-MON
 record NOC-REC
 exporter NOC-EXP
 cache timeout inactive 10
interface GigabitEthernet0/0
 ip flow monitor NOC-MON input</pre>
<p>Three objects: the <b>record</b> (what to match and collect), the <b>exporter</b> (where to send), the <b>monitor</b> (joins them, owns the cache, is applied to an interface in a direction). Cisco also provides predefined records such as <code>record netflow ipv4 original-input</code>.</p>
<pre class="out">EDGE# show flow monitor NOC-MON cache format table
  Cache type:                               Normal (Platform cache)
  Cache size:                                 4096
<span class="hl">  Current entries:                               2</span>

IPV4 SRC ADDR    IPV4 DST ADDR    TRNS SRC PORT  TRNS DST PORT  IP PROT  bytes long  pkts long
===============  ===============  =============  =============  =======  ==========  =========
192.168.60.11    203.0.113.80                 0           2048        <span class="hl">1</span>         500          5
192.168.60.12    203.0.113.80                 0           2048        1        1000         10

EDGE# show flow exporter NOC-EXP statistics
Flow Exporter NOC-EXP:
  Packet send statistics (last cleared 00:12:04 ago):
<span class="hl">    Successfully sent:         48                    (4212 bytes)</span>
  Client send statistics:
    Client: Flow Monitor NOC-MON
      Records added:           96
        - sent:                96</pre>
<p>Protocol 1 is ICMP (TCP is 6, UDP 17). For ICMP, the destination-port field holds type x 256 + code, so an echo request (type 8) shows 2048.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Flexible NetFlow objects">
<rect x="20" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="100" y="52" text-anchor="middle" class="svg-ink" font-size="13">flow record</text><text x="100" y="69" text-anchor="middle" class="svg-muted" font-size="12">match + collect</text>
<rect x="20" y="120" width="160" height="50" rx="8" fill="#fde68a"/><text x="100" y="142" text-anchor="middle" class="svg-ink" font-size="13">flow exporter</text><text x="100" y="159" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50 UDP 2055</text>
<rect x="250" y="75" width="150" height="50" rx="8" fill="#bae6fd"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">cache + timeouts</text>
<rect x="470" y="75" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="97" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0 input</text><text x="545" y="114" text-anchor="middle" class="svg-muted" font-size="12">user LAN</text>
<line x1="180" y1="55" x2="250" y2="95" stroke="#64748b"/><line x1="180" y1="145" x2="250" y2="108" stroke="#64748b"/><line x1="400" y1="100" x2="470" y2="100" stroke="#64748b"/>
</svg><p class="cap">Record and exporter are joined in a monitor, and the monitor is applied to an interface and direction.</p></div>

<h3>Troubleshooting checklist</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check</th></tr>
<tr><td>Cache empty</td><td>Monitor not applied, wrong interface or direction (<code>show flow interface</code>); traffic enters elsewhere</td></tr>
<tr><td>Cache has flows, collector sees nothing</td><td>Exporter destination or port wrong (collector on 9996 vs 2055); no route; ACL or firewall drops UDP; source address not accepted by the collector</td></tr>
<tr><td>Collector shows "unknown template"</td><td>v9/IPFIX template not yet received; lower <code>template data timeout</code> on the exporter</td></tr>
<tr><td>Traffic counted twice</td><td>Monitor applied input on one interface and output on another for the same traffic</td></tr>
<tr><td>Cannot change the record</td><td>IOS refuses to modify a record used by a monitor that is applied; remove the monitor from the interfaces first</td></tr></table>

<div class="eg"><p><b>Worked example.</b> PC2 sends 10 pings of 100 bytes to 203.0.113.80. With keys source, destination, protocol and ports, all 10 echo requests match one flow: 10 packets, 1000 bytes. The replies arrive on Gi0/1, where no monitor is applied, so they are not in the cache. Ten seconds after the last packet the inactive timeout exports the record to 10.99.0.50:2055, and "Records added" in the exporter statistics increases.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting to apply the monitor; <code>match</code> on a field you only want to count (every new value creates a new flow, and the cache explodes); no <code>collect counter</code> fields so the collector sees flows without sizes; exporting from an interface address that changes; very long active timeouts that make graphs look bursty.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>match = key</b> fields (define a flow), <b>collect = non-key</b> fields (counters, timestamps). And v5 cannot carry IPv6; use v9, IPFIX or Flexible NetFlow.</p></div>

<div class="scn"><h4>The collector that listened on the wrong port</h4><p>A new NetFlow collector was installed and nothing appeared. EDGE showed a full cache and "Successfully sent" climbing in the exporter statistics, so the router was fine. A capture on the collector's switch port showed UDP to 2055 arriving, while the collector software listened on 9996. Changing <code>transport udp 9996</code> on the exporter (or the collector's port) fixed it in one minute.</p><p><b>Lesson:</b> if the exporter counts packets sent, the problem is downstream; prove it with a capture before touching the router.</p></div>

<div class="iv"><p class="q">"What is the difference between NetFlow v5, v9 and Flexible NetFlow?"</p><p>v5 has a fixed IPv4-only record with seven key fields. v9 is template-based, so it can describe IPv6, MPLS and other fields; IPFIX standardises it. Flexible NetFlow is the IOS framework that lets you build your own records with match and collect fields, bind them to exporters in a monitor, and export as v9, v5 or IPFIX. Mention troubleshooting commands: <code>show flow monitor … cache</code>, <code>show flow exporter … statistics</code> and <code>show flow interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow is defined by key fields; the cache exports records on inactive or active timeout.</li>
<li>v5 fixed and IPv4 only; v9 and IPFIX template-based; FNF lets you define records.</li>
<li>FNF objects: record (match and collect), exporter (destination, transport, source), monitor (record, exporter, cache), applied per interface and direction.</li>
<li>Exporter statistics show whether the router sent the data; no-FIB drops mean no route to the collector.</li>
<li>ICMP flows show protocol 1 and the type and code in the destination port field.</li>
</ul></div>
`,hi:`
<p>SNMP deewar par laga bijli ka meter hai: batata hai ghar ne kitne units use kiye. NetFlow itemised bill hai jo batata hai AC ne 60%, geyser ne 25% aur baaki TV ne use kiya. Jab 11:02 par WAN graph spike karta hai, SNMP batata hai <i>ki</i> spike hua; NetFlow batata hai <i>kisne</i> <i>kya</i> <i>kahan</i> bheja.</p>

<h3>Flow kya hai</h3>
<p><b>Flow</b> un packets ka set hai jinke <b>key fields</b> same hon. Traditional NetFlow mein saat keys hain: source IP, destination IP, source port, destination port, IP protocol, ToS aur input interface. Router ek <b>flow cache</b> rakhta hai; pehla packet entry banata hai aur baad ke packets uske counters (bytes, packets, timestamps) update karte hain. Entry <b>collector</b> ko tab export hoti hai jab:</p>
<ul>
<li><b>inactive timeout</b> expire ho (default mein 15 second tak koi packet nahi),</li>
<li>lambe chalne wale flow ka <b>active timeout</b> expire ho (traditional NetFlow mein default 30 minute, aksar 1 minute set kiya jaata hai),</li>
<li>TCP FIN ya RST flow khatam kare, ya cache bhar jaaye.</li>
</ul>

<h3>Versions</h3>
<table class="cmp"><tr><th>Version</th><th>Format</th><th>Notes</th></tr>
<tr><td>v5</td><td>Fixed record</td><td>Sirf IPv4, na MPLS labels, na IPv6, na template. Collectors mein ab bhi bahut supported.</td></tr>
<tr><td>v9</td><td>Template-based</td><td>Exporter templates bhejta hai jo records describe karte hain, isliye yeh IPv6, MPLS, BGP next hop aur bahut kuch le ja sakta hai.</td></tr>
<tr><td>IPFIX (v10)</td><td>Template-based, IETF standard</td><td>v9 par based; Flexible NetFlow <code>export-protocol ipfix</code> se support karta hai.</td></tr>
<tr><td>Flexible NetFlow</td><td>User-defined records</td><td>Aap match (key) aur collect (non-key) fields chunte ho; v9, v5 ya IPFIX mein export karta hai.</td></tr></table>

<h3>Traditional NetFlow</h3>
<pre class="code">interface GigabitEthernet0/0
 ip flow ingress
ip flow-export version 9
ip flow-export destination 10.99.0.50 2055
ip flow-export source GigabitEthernet0/2
ip flow-cache timeout active 1          <span class="c">! minutes</span>
<span class="c">! verification</span>
show ip cache flow
show ip flow export
show ip flow interface</pre>
<pre class="out">EDGE# show ip flow export
Flow export v9 is enabled for main cache
  Export source and destination details :
  VRF ID : Default
    Source(1)       10.99.0.1 (GigabitEthernet0/2)
<span class="hl">    Destination(1)  10.99.0.50 (2055)</span>
  Version 9 flow records
<span class="hl">  1245 flows exported in 402 udp datagrams</span>
  0 flows failed due to lack of export packet
  0 export packets were sent up to process level
<span class="hl">  0 export packets were dropped due to no fib</span>
  0 export packets were dropped due to adjacency issues
  0 export packets were dropped due to fragmentation failures
  0 export packets were dropped due to encapsulation fixup failures</pre>
<p>"dropped due to no fib" badhne ka matlab router ke paas collector tak route nahi hai.</p>

<h3>Flexible NetFlow (lab 3)</h3>
<pre class="code">flow record NOC-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 collect counter bytes
 collect counter packets
flow exporter NOC-EXP
 destination 10.99.0.50
 transport udp 2055
 <span class="c">! optional: source Loopback0, export-protocol ipfix</span>
flow monitor NOC-MON
 record NOC-REC
 exporter NOC-EXP
 cache timeout inactive 10
interface GigabitEthernet0/0
 ip flow monitor NOC-MON input</pre>
<p>Teen objects: <b>record</b> (kya match aur collect karna hai), <b>exporter</b> (kahan bhejna hai), <b>monitor</b> (dono ko jodta hai, cache ka maalik hai, interface par ek direction mein lagta hai). Cisco predefined records bhi deta hai jaise <code>record netflow ipv4 original-input</code>.</p>
<pre class="out">EDGE# show flow monitor NOC-MON cache format table
  Cache type:                               Normal (Platform cache)
  Cache size:                                 4096
<span class="hl">  Current entries:                               2</span>

IPV4 SRC ADDR    IPV4 DST ADDR    TRNS SRC PORT  TRNS DST PORT  IP PROT  bytes long  pkts long
===============  ===============  =============  =============  =======  ==========  =========
192.168.60.11    203.0.113.80                 0           2048        <span class="hl">1</span>         500          5
192.168.60.12    203.0.113.80                 0           2048        1        1000         10

EDGE# show flow exporter NOC-EXP statistics
Flow Exporter NOC-EXP:
  Packet send statistics (last cleared 00:12:04 ago):
<span class="hl">    Successfully sent:         48                    (4212 bytes)</span>
  Client send statistics:
    Client: Flow Monitor NOC-MON
      Records added:           96
        - sent:                96</pre>
<p>Protocol 1 ICMP hai (TCP 6, UDP 17). ICMP ke liye destination-port field type x 256 + code rakhta hai, isliye echo request (type 8) 2048 dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Flexible NetFlow objects">
<rect x="20" y="30" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="100" y="52" text-anchor="middle" class="svg-ink" font-size="13">flow record</text><text x="100" y="69" text-anchor="middle" class="svg-muted" font-size="12">match + collect</text>
<rect x="20" y="120" width="160" height="50" rx="8" fill="#fde68a"/><text x="100" y="142" text-anchor="middle" class="svg-ink" font-size="13">flow exporter</text><text x="100" y="159" text-anchor="middle" class="svg-muted" font-size="12">10.99.0.50 UDP 2055</text>
<rect x="250" y="75" width="150" height="50" rx="8" fill="#bae6fd"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">flow monitor</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">cache + timeouts</text>
<rect x="470" y="75" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="545" y="97" text-anchor="middle" class="svg-ink" font-size="13">Gi0/0 input</text><text x="545" y="114" text-anchor="middle" class="svg-muted" font-size="12">user LAN</text>
<line x1="180" y1="55" x2="250" y2="95" stroke="#64748b"/><line x1="180" y1="145" x2="250" y2="108" stroke="#64748b"/><line x1="400" y1="100" x2="470" y2="100" stroke="#64748b"/>
</svg><p class="cap">Record aur exporter ek monitor mein jude hain, aur monitor ek interface aur direction par lagta hai.</p></div>

<h3>Troubleshooting checklist</h3>
<table class="cmp"><tr><th>Symptom</th><th>Check</th></tr>
<tr><td>Cache khaali</td><td>Monitor laga nahi, galat interface ya direction (<code>show flow interface</code>); traffic kahin aur se aata hai</td></tr>
<tr><td>Cache mein flows, collector ko kuch nahi</td><td>Exporter destination ya port galat (collector 9996 par vs 2055); route nahi; ACL ya firewall UDP drop karta hai; collector source address accept nahi karta</td></tr>
<tr><td>Collector "unknown template" dikhata hai</td><td>v9/IPFIX template abhi nahi mila; exporter par <code>template data timeout</code> kam karo</td></tr>
<tr><td>Traffic do baar gina</td><td>Same traffic ke liye monitor ek interface par input aur doosre par output laga</td></tr>
<tr><td>Record badal nahi sakte</td><td>IOS us record ko modify karne se mana karta hai jo lagaye gaye monitor mein use ho raha hai; pehle interfaces se monitor hatao</td></tr></table>

<div class="eg"><p><b>Worked example.</b> PC2 203.0.113.80 ko 100 bytes ke 10 pings bhejta hai. Source, destination, protocol aur ports keys ke saath, saare 10 echo requests ek flow se match hote hain: 10 packets, 1000 bytes. Replies Gi0/1 par aate hain, jahan koi monitor nahi laga, isliye woh cache mein nahi hain. Aakhri packet ke das second baad inactive timeout record ko 10.99.0.50:2055 par export karta hai, aur exporter statistics mein "Records added" badhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Monitor lagana bhoolna; us field par <code>match</code> karna jise sirf ginna hai (har nayi value naya flow banati hai, aur cache phat jaata hai); koi <code>collect counter</code> fields nahi isliye collector bina size ke flows dekhta hai; aise interface address se export karna jo badalta hai; bahut lambe active timeouts jo graphs ko bursty dikhate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>match = key</b> fields (flow define karte hain), <b>collect = non-key</b> fields (counters, timestamps). Aur v5 IPv6 nahi le ja sakta; v9, IPFIX ya Flexible NetFlow use karo.</p></div>

<div class="scn"><h4>Galat port par sunne wala collector</h4><p>Naya NetFlow collector install hua aur kuch nahi dikha. EDGE par bhara cache aur exporter statistics mein badhta "Successfully sent" tha, to router theek tha. Collector ke switch port par capture ne dikhaya ki 2055 par UDP aa raha hai, jabki collector software 9996 par sun raha tha. Exporter par <code>transport udp 9996</code> (ya collector ka port) badalne se ek minute mein theek ho gaya.</p><p><b>Seekh:</b> agar exporter bheje gaye packets ginta hai, to problem aage hai; router ko chhoone se pehle capture se sabit karo.</p></div>

<div class="iv"><p class="q">"NetFlow v5, v9 aur Flexible NetFlow mein kya fark hai?"</p><p>v5 ka fixed, sirf IPv4 record hai saat key fields ke saath. v9 template-based hai, isliye IPv6, MPLS aur doosre fields describe kar sakta hai; IPFIX ise standardise karta hai. Flexible NetFlow IOS framework hai jo aapko match aur collect fields ke saath apne records banane deta hai, unhe monitor mein exporters se jodta hai, aur v9, v5 ya IPFIX mein export karta hai. Troubleshooting commands batao: <code>show flow monitor … cache</code>, <code>show flow exporter … statistics</code> aur <code>show flow interface</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow key fields se define hota hai; cache inactive ya active timeout par records export karta hai.</li>
<li>v5 fixed aur sirf IPv4; v9 aur IPFIX template-based; FNF aapko records define karne deta hai.</li>
<li>FNF objects: record (match aur collect), exporter (destination, transport, source), monitor (record, exporter, cache), har interface aur direction par lagta hai.</li>
<li>Exporter statistics batate hain router ne data bheja ya nahi; no-FIB drops ka matlab collector tak route nahi.</li>
<li>ICMP flows protocol 1 aur destination port field mein type aur code dikhate hain.</li>
</ul></div>
`}};export{e as default};