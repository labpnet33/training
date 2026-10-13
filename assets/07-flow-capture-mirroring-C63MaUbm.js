var e={id:`flow`,h:{en:`Flow data, packet capture and port mirroring`,hi:`Flow data, packet capture aur port mirroring`},body:{en:`
<p>Think about your phone bill. It does not record what you said in each call, but it lists who you called, when, and for how long. That is enough to see that someone phoned an international number for three hours at 2 a.m. A <b>call recording</b>, on the other hand, contains every word, but takes far more storage and is only made when really needed. In networking, the phone bill is <b>flow data</b> and the call recording is <b>packet capture</b>. <b>Port mirroring</b> is how you get a copy of the conversation to the recorder.</p>

<h3>Flow data</h3>
<p>A <b>flow</b> is a set of packets that share the same key fields, typically the <b>5-tuple</b>: source IP, destination IP, source port, destination port and protocol (often with ingress interface and ToS as well). A router or switch keeps a <b>flow cache</b>, counts packets and bytes per flow, and <b>exports</b> finished flow records to a <b>flow collector</b>.</p>
<table class="cmp"><tr><th>Technology</th><th>Notes</th></tr>
<tr><td><b>NetFlow v5 / v9</b></td><td>Vendor-originated; v5 has a fixed IPv4 record, v9 uses flexible templates (IPv6, MPLS)</td></tr>
<tr><td><b>IPFIX</b></td><td>The IETF standard based on NetFlow v9 (sometimes called "v10"); default UDP port 4739</td></tr>
<tr><td><b>sFlow</b></td><td>Samples 1 in N packets plus interface counters; light on hardware, widely used on switches</td></tr>
</table>
<p>Flow data answers <b>who talked to whom, when, with which protocol, and how much</b>. It does not contain payload. It is ideal for top talkers, capacity planning, detecting scans or data exfiltration, and billing.</p>

<pre class="code"><span class="c">! example: traditional flow export on the industry-standard CLI</span>
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip flow ingress
R1(config-if)# exit
R1(config)# ip flow-export version 9
R1(config)# ip flow-export destination 192.168.50.100 2055
R1# show ip cache flow</pre>

<h3>Packet capture</h3>
<p><b>Packet capture</b> records complete packets, headers and payload, into a file (commonly <b>pcap</b> format) for analysis with a protocol analyser such as Wireshark or tcpdump. It shows exactly what was sent: TCP handshakes, retransmissions, DNS answers, SNMP community strings in clear text. The cost is storage and privacy: a busy 10 Gbps link fills a terabyte disk in minutes, and payloads may contain personal data. Use <b>capture filters</b> to record only what you need, and capture only with authorisation.</p>
<pre class="code"><span class="c">! on a Linux host: capture only SNMP traps and syslog into a file</span>
$ sudo tcpdump -i eth0 -w nms.pcap udp port 162 or udp port 514</pre>

<h3>Port mirroring</h3>
<p>On a switched network, a capture laptop plugged into a random port sees only its own traffic and broadcasts. <b>Port mirroring</b> copies traffic from one or more source ports or VLANs to a destination port where the analyser, IDS or monitoring probe is connected. Common names: <b>SPAN</b> (local), <b>RSPAN</b> (across switches using a special VLAN) and <b>ERSPAN</b> (encapsulated over an IP network).</p>
<pre class="code">SW1(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW1(config)# monitor session 1 destination interface GigabitEthernet0/24</pre>
<p>The alternative is a <b>network TAP</b>, a hardware device placed inline on a cable that copies everything, including errored frames, and never drops traffic because the switch is busy. SPAN is free and flexible but can drop copies if the destination port is oversubscribed (mirroring two busy 1 Gbps ports into one 1 Gbps port).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flow export, port mirroring and capture compared">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="47" text-anchor="middle" class="svg-ink" font-size="13">R1 flow cache</text>
<rect x="250" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="13">Flow collector</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">who, when, how much</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="205" y="34" text-anchor="middle" class="svg-accent" font-size="12">records</text>
<rect x="20" y="120" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="147" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1 (src)</text>
<rect x="250" y="120" width="160" height="44" rx="8" fill="#fde68a"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="13">SPAN to Gi0/24</text><text x="330" y="156" text-anchor="middle" class="svg-muted" font-size="12">copy of every frame</text>
<rect x="480" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Analyser</text><text x="550" y="156" text-anchor="middle" class="svg-muted" font-size="12">pcap, payload</text>
<line x1="160" y1="142" x2="250" y2="142" stroke="#64748b" stroke-width="2"/><line x1="410" y1="142" x2="480" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Flow = metadata, small, always on. Capture = full content, large, on demand.</text>
</svg><p class="cap">Flow export sends summaries to a collector; port mirroring delivers full copies to an analyser.</p></div>

<div class="eg"><p><b>Worked example: which tool?</b> Users complain the WAN is slow every afternoon. Flow data from the WAN router shows one host, 10.20.0.57, sending 40 GB to a cloud backup service between 14:00 and 16:00. That answers "who and how much" without any capture. If instead a single application shows random session drops, you mirror the server port and capture: the pcap reveals TCP resets from a firewall after 60 seconds of idle time.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Plugging a laptop into a switch and wondering why the capture is empty (you need mirroring or a TAP). Mirroring more traffic than the destination port can carry. Capturing without a filter and filling the disk. Expecting flow data to show URLs or payload. Forgetting that flow exports need the collector's UDP port open on firewalls.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which tool shows the top talkers by volume without storing payload?" is <b>flow data</b> (NetFlow, IPFIX, sFlow). "Which shows the contents of the packets?" is a <b>packet capture</b> / protocol analyser. "How do you get traffic from other switch ports to the analyser?" is <b>port mirroring</b> (SPAN) or a <b>TAP</b>.</p></div>

<div class="scn"><h4>The printer that phoned home</h4><p>A hospital's flow collector showed a network printer sending steady outbound traffic on TCP 443 to an unknown external address every night. No one had noticed because the volume was small. The security team mirrored the printer's switch port and captured a night's traffic: the printer's outdated firmware was sending scanned documents to a malicious server. They isolated the printer, updated its firmware, blocked the address and added a SIEM rule for any printer talking to the internet.</p><p><b>Lesson:</b> flow data finds the suspicious conversation; packet capture proves what it contains.</p></div>

<div class="iv"><p class="q">"When would you use NetFlow and when would you use a packet capture?"</p><p>Strong answer: flow data for continuous visibility (top talkers, trends, capacity, unusual destinations), because it is small and always on. Packet capture for deep troubleshooting or forensics when you must see headers and payload, such as TCP retransmissions or application errors, and only on a filtered, targeted basis. Mention SPAN or TAP to get the traffic to the analyser, and the privacy and storage trade-off.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow is packets sharing key fields (5-tuple); flow records are exported to a collector.</li>
<li>NetFlow v5/v9, IPFIX (UDP 4739) and sFlow (sampled) provide flow data without payload.</li>
<li>Packet capture records full packets in pcap files; use filters and authorisation.</li>
<li>Port mirroring (SPAN, RSPAN, ERSPAN) copies traffic to an analyser; a TAP does it in hardware.</li>
<li>Flow = who, when, how much; capture = exactly what.</li>
</ul></div>
`,hi:`
<p>Apne phone bill ke baare mein socho. Usmein yeh record nahi hota ki har call mein aapne kya kaha, lekin yeh list hoti hai ki aapne kise call kiya, kab, aur kitni der. Itna yeh dekhne ke liye kaafi hai ki kisi ne raat 2 baje teen ghante international number par baat ki. Doosri taraf <b>call recording</b> mein har shabd hota hai, lekin bahut zyada storage leti hai aur sirf zaroorat hone par ki jaati hai. Networking mein phone bill <b>flow data</b> hai aur call recording <b>packet capture</b>. <b>Port mirroring</b> woh tareeka hai jisse baatcheet ki copy recorder tak pahunchti hai.</p>

<h3>Flow data</h3>
<p><b>Flow</b> packets ka ek set hai jinke key fields same hote hain, aam taur par <b>5-tuple</b>: source IP, destination IP, source port, destination port aur protocol (aksar ingress interface aur ToS bhi). Router ya switch ek <b>flow cache</b> rakhta hai, har flow ke packets aur bytes ginta hai, aur khatam hue flow records ko <b>flow collector</b> ko <b>export</b> karta hai.</p>
<table class="cmp"><tr><th>Technology</th><th>Notes</th></tr>
<tr><td><b>NetFlow v5 / v9</b></td><td>Vendor se shuru hua; v5 ka fixed IPv4 record hai, v9 flexible templates (IPv6, MPLS) use karta hai</td></tr>
<tr><td><b>IPFIX</b></td><td>NetFlow v9 par based IETF standard (kabhi kabhi "v10" kehte hain); default UDP port 4739</td></tr>
<tr><td><b>sFlow</b></td><td>N mein se 1 packet sample karta hai aur interface counters bhi; hardware par halka, switches par bahut use hota hai</td></tr>
</table>
<p>Flow data jawab deta hai <b>kisne kisse baat ki, kab, kaunse protocol se, aur kitni</b>. Isme payload nahi hota. Yeh top talkers, capacity planning, scans ya data exfiltration pakadne, aur billing ke liye ideal hai.</p>

<pre class="code"><span class="c">! example: industry-standard CLI par traditional flow export</span>
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip flow ingress
R1(config-if)# exit
R1(config)# ip flow-export version 9
R1(config)# ip flow-export destination 192.168.50.100 2055
R1# show ip cache flow</pre>

<h3>Packet capture</h3>
<p><b>Packet capture</b> poore packets, headers aur payload, ek file mein record karta hai (aam taur par <b>pcap</b> format) taaki Wireshark ya tcpdump jaise protocol analyser se analyse ho sake. Yeh exactly dikhata hai ki kya bheja gaya: TCP handshakes, retransmissions, DNS answers, clear text mein SNMP community strings. Keemat storage aur privacy hai: ek busy 10 Gbps link minutes mein terabyte disk bhar deta hai, aur payloads mein personal data ho sakta hai. Sirf zaroorat ki cheez record karne ke liye <b>capture filters</b> use karo, aur sirf authorisation ke saath capture karo.</p>
<pre class="code"><span class="c">! Linux host par: sirf SNMP traps aur syslog file mein capture karo</span>
$ sudo tcpdump -i eth0 -w nms.pcap udp port 162 or udp port 514</pre>

<h3>Port mirroring</h3>
<p>Switched network par kisi random port mein lagaya capture laptop sirf apna traffic aur broadcasts dekhta hai. <b>Port mirroring</b> ek ya zyada source ports ya VLANs ka traffic ek destination port par copy karta hai jahan analyser, IDS ya monitoring probe laga hota hai. Common naam: <b>SPAN</b> (local), <b>RSPAN</b> (special VLAN use karke switches ke paar) aur <b>ERSPAN</b> (IP network par encapsulated).</p>
<pre class="code">SW1(config)# monitor session 1 source interface GigabitEthernet0/1 both
SW1(config)# monitor session 1 destination interface GigabitEthernet0/24</pre>
<p>Alternative <b>network TAP</b> hai, ek hardware device jo cable par inline lagta hai aur sab kuch copy karta hai, errored frames bhi, aur switch busy hone ki wajah se kabhi traffic drop nahi karta. SPAN free aur flexible hai lekin destination port oversubscribed ho to copies drop kar sakta hai (do busy 1 Gbps ports ko ek 1 Gbps port mein mirror karna).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Flow export, port mirroring aur capture ki tulna">
<rect x="20" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="47" text-anchor="middle" class="svg-ink" font-size="13">R1 flow cache</text>
<rect x="250" y="20" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="330" y="40" text-anchor="middle" class="svg-ink" font-size="13">Flow collector</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">kaun, kab, kitna</text>
<line x1="160" y1="42" x2="250" y2="42" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="205" y="34" text-anchor="middle" class="svg-accent" font-size="12">records</text>
<rect x="20" y="120" width="140" height="44" rx="8" fill="#bae6fd"/><text x="90" y="147" text-anchor="middle" class="svg-ink" font-size="13">SW1 Gi0/1 (src)</text>
<rect x="250" y="120" width="160" height="44" rx="8" fill="#fde68a"/><text x="330" y="140" text-anchor="middle" class="svg-ink" font-size="13">SPAN Gi0/24 par</text><text x="330" y="156" text-anchor="middle" class="svg-muted" font-size="12">har frame ki copy</text>
<rect x="480" y="120" width="140" height="44" rx="8" fill="#fed7aa"/><text x="550" y="140" text-anchor="middle" class="svg-ink" font-size="13">Analyser</text><text x="550" y="156" text-anchor="middle" class="svg-muted" font-size="12">pcap, payload</text>
<line x1="160" y1="142" x2="250" y2="142" stroke="#64748b" stroke-width="2"/><line x1="410" y1="142" x2="480" y2="142" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Flow = metadata, chhota, hamesha on. Capture = poora content, bada, zaroorat par.</text>
</svg><p class="cap">Flow export collector ko summaries bhejta hai; port mirroring analyser tak poori copies pahunchata hai.</p></div>

<div class="eg"><p><b>Worked example: kaunsa tool?</b> Users shikayat karte hain ki har dopahar WAN slow hota hai. WAN router ka flow data dikhata hai ki ek host, 10.20.0.57, 14:00 se 16:00 ke beech ek cloud backup service ko 40 GB bhej raha hai. Isse bina kisi capture ke "kaun aur kitna" ka jawab mil jaata hai. Agar iski jagah ek hi application mein random session drops hon, to aap server port mirror karke capture karte ho: pcap dikhata hai ki 60 seconds idle ke baad firewall TCP resets bhej raha hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Switch mein laptop laga ke sochna ki capture khaali kyun hai (mirroring ya TAP chahiye). Destination port jitna le sake usse zyada traffic mirror karna. Bina filter ke capture karna aur disk bhar dena. Flow data se URLs ya payload ki ummeed rakhna. Bhoolna ki flow exports ke liye firewalls par collector ka UDP port khula hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa tool payload store kiye bina volume ke hisaab se top talkers dikhata hai?" <b>flow data</b> hai (NetFlow, IPFIX, sFlow). "Kaunsa packets ka content dikhata hai?" <b>packet capture</b> / protocol analyser. "Doosre switch ports ka traffic analyser tak kaise laate ho?" <b>port mirroring</b> (SPAN) ya <b>TAP</b>.</p></div>

<div class="scn"><h4>Printer jo ghar phone karta tha</h4><p>Ek hospital ke flow collector ne dikhaya ki ek network printer har raat TCP 443 par ek anjaan external address ko lagataar outbound traffic bhej raha hai. Kisi ne notice nahi kiya tha kyunki volume chhota tha. Security team ne printer ka switch port mirror kiya aur ek raat ka traffic capture kiya: printer ka purana firmware scanned documents ek malicious server ko bhej raha tha. Unhone printer isolate kiya, firmware update kiya, address block kiya aur internet se baat karne wale kisi bhi printer ke liye SIEM rule joda.</p><p><b>Seekh:</b> flow data suspicious baatcheet dhoondhta hai; packet capture sabit karta hai ki usmein kya hai.</p></div>

<div class="iv"><p class="q">"Aap NetFlow kab use karoge aur packet capture kab?"</p><p>Strong answer: continuous visibility ke liye flow data (top talkers, trends, capacity, unusual destinations), kyunki yeh chhota aur hamesha on hai. Deep troubleshooting ya forensics ke liye packet capture jab headers aur payload dekhna zaroori ho, jaise TCP retransmissions ya application errors, aur sirf filtered, targeted tareeke se. Traffic analyser tak laane ke liye SPAN ya TAP, aur privacy aur storage trade-off ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow same key fields (5-tuple) wale packets hain; flow records collector ko export hote hain.</li>
<li>NetFlow v5/v9, IPFIX (UDP 4739) aur sFlow (sampled) bina payload ke flow data dete hain.</li>
<li>Packet capture poore packets pcap files mein record karta hai; filters aur authorisation use karo.</li>
<li>Port mirroring (SPAN, RSPAN, ERSPAN) traffic analyser ko copy karta hai; TAP yahi hardware mein karta hai.</li>
<li>Flow = kaun, kab, kitna; capture = exactly kya.</li>
</ul></div>
`}};export{e as default};