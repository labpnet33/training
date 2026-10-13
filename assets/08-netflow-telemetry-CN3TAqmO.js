var e={id:`netflow-telemetry`,h:{en:`Telemetry-based detection: NetFlow, IPFIX and Secure Network Analytics`,hi:`Telemetry-based detection: NetFlow, IPFIX aur Secure Network Analytics`},body:{en:`
<p>Your phone bill does not record what you said on each call, but it lists every call: who you called, when, for how long. That list alone tells a lot. If a number you never call suddenly appears forty times in one night with calls of two hours each, something is going on, even without hearing a word. <b>NetFlow</b> is the phone bill of the network: it records every conversation's metadata, not its content, and that is enough to spot scanning, beaconing, data hoarding and exfiltration, even inside encrypted traffic.</p>

<h3>What a flow is</h3>
<p>A <b>flow</b> is a set of packets that share the same key fields, classically the <b>5-tuple</b>: source IP, destination IP, source port, destination port and protocol (often plus input interface and ToS). The router or switch keeps a counter per flow in its <b>flow cache</b>: bytes, packets, first and last timestamps, TCP flags. When a flow ends, or a timer expires, the record is <b>exported</b> to a <b>collector</b> over UDP.</p>
<dl class="terms">
<dt>NetFlow v5</dt><dd>The old fixed format, IPv4 only.</dd>
<dt>NetFlow v9</dt><dd>Template-based: the exporter first sends a template describing the fields, then data records. Supports IPv6 and custom fields.</dd>
<dt>IPFIX</dt><dd>The IETF standard based on v9 (sometimes called NetFlow v10), also template-based.</dd>
<dt>Flexible NetFlow (FNF)</dt><dd>Cisco's configuration model on IOS XE: a <b>flow record</b> (what to match and collect), a <b>flow exporter</b> (where to send), and a <b>flow monitor</b> (record plus exporter plus cache), applied to an interface.</dd>
</dl>

<h3>Configuring Flexible NetFlow on the edge router</h3>
<p>In the lab topology, GW is the edge between the users (Gi0/0, 10.10.0.0/24) and the internet (Gi0/1). To send flows to a collector at 10.10.0.50 (a Flow Collector, not part of the lab), the configuration is:</p>
<pre class="code"><span class="c">! what to match (keys) and what to count (non-key fields)</span>
flow record NK-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 collect counter bytes long
 collect counter packets long
 collect timestamp absolute first
 collect timestamp absolute last
 collect transport tcp flags
<span class="c">! where to send it</span>
flow exporter NK-EXP
 destination 10.10.0.50
 source GigabitEthernet0/0
 transport udp 2055
 export-protocol ipfix
<span class="c">! tie record and exporter together, set the active timeout</span>
flow monitor NK-MON
 record NK-REC
 exporter NK-EXP
 cache timeout active 60
<span class="c">! watch both directions on the internet-facing interface</span>
interface GigabitEthernet0/1
 ip flow monitor NK-MON input
 ip flow monitor NK-MON output</pre>
<pre class="out">GW# show flow exporter NK-EXP statistics
Flow Exporter NK-EXP:
  Packet send statistics (last cleared 00:12:40 ago):
<span class="hl">    Successfully sent:         164                   (221384 bytes)</span>
  Client send statistics:
    Client: Flow Monitor NK-MON
      Records added:           3912
        - sent:                3912
      Bytes added:             191688
        - sent:                191688</pre>
<p><code>show flow monitor NK-MON cache format table</code> lists the live flows, and <code>show flow monitor NK-MON statistics</code> shows how full the cache is. If "Successfully sent" stays at zero, check reachability to the collector and the UDP port.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Secure Network Analytics components">
<rect x="10" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Routers, switches</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">NetFlow / IPFIX</text>
<rect x="10" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="13">Flow Sensor</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="11">flows from SPAN</text>
<rect x="210" y="75" width="140" height="50" rx="8" fill="#fde68a"/><text x="280" y="97" text-anchor="middle" class="svg-ink" font-size="13">UDP Director</text><text x="280" y="115" text-anchor="middle" class="svg-muted" font-size="11">optional replication</text>
<rect x="410" y="75" width="110" height="50" rx="8" fill="#fed7aa"/><text x="465" y="97" text-anchor="middle" class="svg-ink" font-size="13">Flow</text><text x="465" y="115" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="540" y="75" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="585" y="97" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="585" y="115" text-anchor="middle" class="svg-muted" font-size="11">UI, alarms</text>
<line x1="150" y1="55" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="210" y2="108" stroke="#64748b" stroke-width="2"/><line x1="350" y1="100" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="520" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">ISE adds user names; Secure Cloud Analytics does the same for cloud flow logs</text>
</svg><p class="cap">Secure Network Analytics: exporters and sensors feed collectors; the Manager baselines hosts and raises alarms.</p></div>

<h3>Secure Network Analytics: from flows to alarms</h3>
<p>Raw flows are millions of lines. <b>Cisco Secure Network Analytics</b> (formerly Stealthwatch) turns them into behaviour:</p>
<ul>
<li><b>Flow Collector</b>: receives NetFlow, IPFIX and other telemetry and stitches the two directions of a conversation together.</li>
<li><b>Manager</b>: the console; keeps the configuration, correlates across collectors and raises alarms.</li>
<li><b>Flow Sensor</b>: creates flow records from a SPAN or TAP where devices cannot export NetFlow, adding application and latency data.</li>
<li><b>UDP Director</b>: receives UDP streams such as NetFlow and syslog once and replicates them to several destinations.</li>
<li><b>Host groups</b>: you describe your network (inside ranges, servers, finance, guest) so that "outside" and "unusual for this group" mean something.</li>
<li><b>Identity</b>: with ISE integration, an IP address becomes a user name and device type.</li>
</ul>
<p>Each host gets a baseline, and deviations add points to security indices. The ones most tested: <b>Concern Index</b> (this host is doing suspicious things), <b>Target Index</b> (this host is being targeted), and the alarm categories <b>Data Hoarding</b> (a host pulling unusual amounts of data from inside, the staging step), <b>Exfiltration</b> (unusual amounts of data sent outside), <b>Recon</b>, <b>Command &amp; Control</b> and <b>Policy Violation</b>. <b>Encrypted Traffic Analytics</b> adds fields from the first packets of TLS sessions so malware in encrypted traffic can be classified without decryption. For public cloud, <b>Secure Cloud Analytics</b> applies the same modelling to cloud flow logs.</p>

<div class="eg"><p><b>Worked example.</b> PC-FIN normally sends about 40 MB a day outside and pulls 300 MB from the file server. On Tuesday the collector shows it pulled 6 GB from three file servers between 01:00 and 03:00 (Data Hoarding: twenty times its baseline) and at 03:10 sent 5.8 GB to 198.51.100.77, an address no other host in the company has ever talked to (Exfiltration). Two alarms on one host within an hour, in the order an attacker would work, make this a top-priority incident.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling NetFlow on only one direction, or with sampling on the security-critical edge. A one-way flow hides the upload volume and sampled flows miss short connections; for security use, export unsampled flows in both directions and keep the active timeout short (60 seconds) so long transfers are reported while they happen.</p></div>

<div class="exam"><p><b>Exam trap.</b> NetFlow records <b>metadata</b>, never payload, so it still works for encrypted traffic. The FNF chain is record, exporter, monitor, interface. Data Hoarding is the inside staging step; Exfiltration is data going outside. The Flow Sensor generates flows; the Flow Collector receives and stores them.</p></div>

<div class="scn"><h4>The quiet file server</h4><p>A hospital's NetFlow analytics raised a Data Hoarding alarm on a reception PC that had copied 12 GB from the records share overnight. No antivirus alert existed. The analyst saw the PC also opened regular HTTPS sessions every 300 seconds to a newly registered domain. Secure Endpoint showed a remote-access tool installed from a phishing email. The PC was isolated before the planned upload, and the alarm became the first evidence in the incident report.</p><p><b>Lesson:</b> flows catch the staging step when signature-based tools are silent.</p></div>

<div class="iv"><p class="q">"Why is NetFlow useful for security if it does not contain payload?"</p><p>Strong answer: flows show who talked to whom, when, how much and how often, for every conversation, including encrypted ones and east-west traffic that never crosses a firewall. That is enough to baseline hosts and detect scanning, beaconing, data hoarding and exfiltration. Mention Flexible NetFlow configuration, unsampled bidirectional export, Secure Network Analytics with host groups, ISE identity and Encrypted Traffic Analytics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow is metadata about a conversation: keys such as the 5-tuple plus counters and timestamps.</li>
<li>Flexible NetFlow: flow record, flow exporter, flow monitor, then apply to the interface; verify with show flow exporter statistics.</li>
<li>Secure Network Analytics components: Flow Collector, Manager, Flow Sensor, UDP Director; ISE adds identity.</li>
<li>Key alarms: Concern Index, Target Index, Data Hoarding (staging), Exfiltration, Recon, C&amp;C.</li>
<li>Flows work on encrypted traffic; Encrypted Traffic Analytics and Secure Cloud Analytics extend the idea.</li>
</ul></div>
`,hi:`
<p>Aapka phone bill yeh record nahi karta ki har call par aapne kya kaha, par har call list karta hai: kise call kiya, kab, kitni der. Sirf woh list bahut kuch batati hai. Agar ek number jise aap kabhi call nahi karte achanak ek raat mein chaalis baar do-do ghante ki calls ke saath dikhe, to kuch chal raha hai, ek shabd sune bina bhi. <b>NetFlow</b> network ka phone bill hai: yeh har conversation ka metadata record karta hai, content nahi, aur scanning, beaconing, data hoarding aur exfiltration pakadne ke liye itna kaafi hai, encrypted traffic ke andar bhi.</p>

<h3>Flow kya hai</h3>
<p><b>Flow</b> packets ka ek set hai jo same key fields share karte hain, classically <b>5-tuple</b>: source IP, destination IP, source port, destination port aur protocol (aksar plus input interface aur ToS). Router ya switch apne <b>flow cache</b> mein har flow ka counter rakhta hai: bytes, packets, first aur last timestamps, TCP flags. Jab flow khatam hota hai, ya timer expire hota hai, record UDP par ek <b>collector</b> ko <b>export</b> hota hai.</p>
<dl class="terms">
<dt>NetFlow v5</dt><dd>Purana fixed format, sirf IPv4.</dd>
<dt>NetFlow v9</dt><dd>Template-based: exporter pehle fields describe karne wala template bhejta hai, phir data records. IPv6 aur custom fields support karta hai.</dd>
<dt>IPFIX</dt><dd>v9 par based IETF standard (kabhi kabhi NetFlow v10 kehte hain), yeh bhi template-based.</dd>
<dt>Flexible NetFlow (FNF)</dt><dd>IOS XE par Cisco ka configuration model: <b>flow record</b> (kya match aur collect karna hai), <b>flow exporter</b> (kahan bhejna hai), aur <b>flow monitor</b> (record plus exporter plus cache), interface par apply.</dd>
</dl>

<h3>Edge router par Flexible NetFlow configure karna</h3>
<p>Lab topology mein GW users (Gi0/0, 10.10.0.0/24) aur internet (Gi0/1) ke beech edge hai. 10.10.0.50 par collector (ek Flow Collector, lab ka hissa nahi) ko flows bhejne ke liye configuration:</p>
<pre class="code"><span class="c">! kya match karna hai (keys) aur kya count karna hai (non-key fields)</span>
flow record NK-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 collect counter bytes long
 collect counter packets long
 collect timestamp absolute first
 collect timestamp absolute last
 collect transport tcp flags
<span class="c">! kahan bhejna hai</span>
flow exporter NK-EXP
 destination 10.10.0.50
 source GigabitEthernet0/0
 transport udp 2055
 export-protocol ipfix
<span class="c">! record aur exporter jodo, active timeout set karo</span>
flow monitor NK-MON
 record NK-REC
 exporter NK-EXP
 cache timeout active 60
<span class="c">! internet-facing interface par dono directions dekho</span>
interface GigabitEthernet0/1
 ip flow monitor NK-MON input
 ip flow monitor NK-MON output</pre>
<pre class="out">GW# show flow exporter NK-EXP statistics
Flow Exporter NK-EXP:
  Packet send statistics (last cleared 00:12:40 ago):
<span class="hl">    Successfully sent:         164                   (221384 bytes)</span>
  Client send statistics:
    Client: Flow Monitor NK-MON
      Records added:           3912
        - sent:                3912
      Bytes added:             191688
        - sent:                191688</pre>
<p><code>show flow monitor NK-MON cache format table</code> live flows list karta hai, aur <code>show flow monitor NK-MON statistics</code> dikhata hai ki cache kitna bhara hai. Agar "Successfully sent" zero par rahe, to collector tak reachability aur UDP port check karo.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Secure Network Analytics components">
<rect x="10" y="30" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Routers, switches</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">NetFlow / IPFIX</text>
<rect x="10" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="13">Flow Sensor</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="11">SPAN se flows</text>
<rect x="210" y="75" width="140" height="50" rx="8" fill="#fde68a"/><text x="280" y="97" text-anchor="middle" class="svg-ink" font-size="13">UDP Director</text><text x="280" y="115" text-anchor="middle" class="svg-muted" font-size="11">optional replication</text>
<rect x="410" y="75" width="110" height="50" rx="8" fill="#fed7aa"/><text x="465" y="97" text-anchor="middle" class="svg-ink" font-size="13">Flow</text><text x="465" y="115" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="540" y="75" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="585" y="97" text-anchor="middle" class="svg-ink" font-size="13">Manager</text><text x="585" y="115" text-anchor="middle" class="svg-muted" font-size="11">UI, alarms</text>
<line x1="150" y1="55" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="150" y1="145" x2="210" y2="108" stroke="#64748b" stroke-width="2"/><line x1="350" y1="100" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="520" y1="100" x2="540" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-accent" font-size="12">ISE user names jodta hai; Secure Cloud Analytics cloud flow logs ke liye yahi karta hai</text>
</svg><p class="cap">Secure Network Analytics: exporters aur sensors collectors ko feed karte hain; Manager hosts ka baseline banata hai aur alarms uthata hai.</p></div>

<h3>Secure Network Analytics: flows se alarms tak</h3>
<p>Raw flows millions lines hain. <b>Cisco Secure Network Analytics</b> (pehle Stealthwatch) unhe behaviour mein badalta hai:</p>
<ul>
<li><b>Flow Collector</b>: NetFlow, IPFIX aur doosri telemetry receive karta hai aur conversation ki dono directions ko jodta hai.</li>
<li><b>Manager</b>: console; configuration rakhta hai, collectors ke across correlate karta hai aur alarms uthata hai.</li>
<li><b>Flow Sensor</b>: jahan devices NetFlow export nahi kar sakte wahan SPAN ya TAP se flow records banata hai, application aur latency data jodkar.</li>
<li><b>UDP Director</b>: NetFlow aur syslog jaise UDP streams ek baar receive karke kai destinations ko replicate karta hai.</li>
<li><b>Host groups</b>: aap apna network describe karte ho (inside ranges, servers, finance, guest) taaki "outside" aur "is group ke liye unusual" ka matlab ho.</li>
<li><b>Identity</b>: ISE integration ke saath IP address user name aur device type ban jaata hai.</li>
</ul>
<p>Har host ka baseline banta hai, aur deviations security indices mein points jodte hain. Sabse zyada test hone wale: <b>Concern Index</b> (yeh host suspicious kaam kar raha hai), <b>Target Index</b> (yeh host target ho raha hai), aur alarm categories <b>Data Hoarding</b> (host andar se unusual amount mein data kheench raha hai, staging step), <b>Exfiltration</b> (unusual amount mein data bahar bheja gaya), <b>Recon</b>, <b>Command &amp; Control</b> aur <b>Policy Violation</b>. <b>Encrypted Traffic Analytics</b> TLS sessions ke pehle packets se fields jodta hai taaki encrypted traffic mein malware bina decryption classify ho sake. Public cloud ke liye <b>Secure Cloud Analytics</b> cloud flow logs par yahi modelling lagata hai.</p>

<div class="eg"><p><b>Worked example.</b> PC-FIN normally roz lagbhag 40 MB bahar bhejta hai aur file server se 300 MB kheenchta hai. Tuesday ko collector dikhata hai ki usne 01:00 se 03:00 ke beech teen file servers se 6 GB kheencha (Data Hoarding: baseline ka bees guna) aur 03:10 par 198.51.100.77 ko 5.8 GB bheja, ek address jisse company ke kisi aur host ne kabhi baat nahi ki (Exfiltration). Ek ghante ke andar ek host par do alarms, usi order mein jaise attacker kaam karta, ise top-priority incident banate hain.</p></div>

<div class="warn"><p><b>Common galti.</b> NetFlow sirf ek direction par enable karna, ya security-critical edge par sampling ke saath. One-way flow upload volume chhupata hai aur sampled flows chhote connections miss karte hain; security use ke liye dono directions mein unsampled flows export karo aur active timeout chhota rakho (60 seconds) taaki lambe transfers hote hue hi report hon.</p></div>

<div class="exam"><p><b>Exam trap.</b> NetFlow <b>metadata</b> record karta hai, payload kabhi nahi, isliye encrypted traffic par bhi kaam karta hai. FNF chain hai record, exporter, monitor, interface. Data Hoarding andar ka staging step hai; Exfiltration data ka bahar jaana hai. Flow Sensor flows generate karta hai; Flow Collector unhe receive aur store karta hai.</p></div>

<div class="scn"><h4>Shaant file server</h4><p>Ek hospital ke NetFlow analytics ne reception PC par Data Hoarding alarm uthaya jisne raat bhar records share se 12 GB copy kiya tha. Koi antivirus alert nahi tha. Analyst ne dekha ki PC har 300 seconds par ek newly registered domain par regular HTTPS sessions bhi kholta tha. Secure Endpoint ne phishing email se install hua remote-access tool dikhaya. Planned upload se pehle PC isolate hua, aur alarm incident report ka pehla evidence bana.</p><p><b>Seekh:</b> jab signature-based tools chup hon tab flows staging step pakadte hain.</p></div>

<div class="iv"><p class="q">"Agar NetFlow mein payload nahi hota to woh security ke liye useful kyun hai?"</p><p>Strong answer: flows har conversation ke liye dikhate hain ki kisne kisse baat ki, kab, kitna aur kitni baar, encrypted wale aur east-west traffic samet jo kabhi firewall cross nahi karta. Hosts ka baseline banane aur scanning, beaconing, data hoarding aur exfiltration detect karne ke liye itna kaafi hai. Flexible NetFlow configuration, unsampled bidirectional export, host groups ke saath Secure Network Analytics, ISE identity aur Encrypted Traffic Analytics ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow conversation ka metadata hai: 5-tuple jaisi keys plus counters aur timestamps.</li>
<li>Flexible NetFlow: flow record, flow exporter, flow monitor, phir interface par apply; show flow exporter statistics se verify.</li>
<li>Secure Network Analytics components: Flow Collector, Manager, Flow Sensor, UDP Director; ISE identity jodta hai.</li>
<li>Key alarms: Concern Index, Target Index, Data Hoarding (staging), Exfiltration, Recon, C&amp;C.</li>
<li>Flows encrypted traffic par kaam karte hain; Encrypted Traffic Analytics aur Secure Cloud Analytics idea ko aage le jaate hain.</li>
</ul></div>
`}};export{e as default};