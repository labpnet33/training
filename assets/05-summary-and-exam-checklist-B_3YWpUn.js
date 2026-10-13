var e=`<svg viewBox="0 0 640 150" role="img" aria-label="Escalation from SNMP to flow to capture">
<rect x="10" y="35" width="180" height="70" rx="10" fill="#bae6fd"/><text x="100" y="64" text-anchor="middle" class="svg-ink" font-size="13">SNMP counters</text><text x="100" y="84" text-anchor="middle" class="svg-muted" font-size="11">is it busy?</text>
<rect x="230" y="35" width="180" height="70" rx="10" fill="#fde68a"/><text x="320" y="64" text-anchor="middle" class="svg-ink" font-size="13">Flow records</text><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="11">who, to whom, how much?</text>
<rect x="450" y="35" width="180" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="64" text-anchor="middle" class="svg-ink" font-size="13">Packet capture</text><text x="540" y="84" text-anchor="middle" class="svg-muted" font-size="11">what exactly happened?</text>
<line x1="190" y1="70" x2="230" y2="70" stroke="#64748b" stroke-width="2"/><line x1="410" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="12">more detail, more cost, more privacy risk at each step</text>
</svg>`,t={id:`summary-exam-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module in one picture</h3>
<p>You now have three ways to look at traffic and you know when to use each. Counters tell you that a link is busy. Flow records tell you who is using it. A capture shows what really happened on the wire. This chapter gathers the facts and commands so you can revise quickly before a lab, an exam or an interview.</p>
<div class="dia">`+e+`<p class="cap">Escalate only as far as the question needs: each step costs more and exposes more.</p></div>

<div class="note"><p><b>Scope of the simulator.</b> Simulated: NetFlow and IPFIX export and collection, flow monitors, records and exporters, top-talker views, SPAN sessions and a capture view. Not simulated: real throughput, a real time-series or analytics database, real encryption, and vendor product screens. Real products differ in menus and limits; read the vendor documentation before applying these ideas to production.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can define a flow and list the five-tuple, and say what key and non-key fields are.</li>
<li>I can compare NetFlow v5, v9 and IPFIX, and explain what a template is.</li>
<li>I can explain active and inactive timeouts and what sampling trades away.</li>
<li>I can describe exporter, collector and analyser, and name top talkers as a use.</li>
<li>I can build a record, exporter GF-EXPORT (10.1.50.100, UDP 9995, source Loopback0) and monitor GF-MON-FLOW, and apply it with ip flow monitor input.</li>
<li>I can verify with show flow exporter, show flow monitor, show flow interface, the cache and show flows on the collector.</li>
<li>I can troubleshoot in order: applied, cache, exporter, network, collector.</li>
<li>I can name the four exporter faults: destination, port, source and version.</li>
<li>I can configure a local SPAN session and read show monitor session.</li>
<li>I can explain RSPAN and ERSPAN and when to use each.</li>
<li>I can write capture filters and read a TCP handshake, a retransmission and a reset.</li>
<li>I can state the privacy rules for captures and flow data.</li>
</ul>

<h3>Flow vs SNMP vs capture: choosing quickly</h3>
<table class="cmp"><tr><th>Question</th><th>Use</th><th>Why</th></tr>
<tr><td>Is the Kochi circuit full right now?</td><td>SNMP interface counters</td><td>cheap and continuous</td></tr>
<tr><td>Which host is filling it?</td><td>Flow top talkers</td><td>shows addresses, ports and bytes</td></tr>
<tr><td>Why does one session hang?</td><td>Packet capture via SPAN</td><td>shows handshake, retransmissions, resets</td></tr>
<tr><td>Did last night's backup overrun?</td><td>Flow with a one-minute active timeout</td><td>history by application</td></tr>
<tr><td>Who talked to a suspicious address?</td><td>Flow, then capture to prove</td><td>flow finds, capture proves</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Flow</dt><dd>Packets sharing the same key fields, counted as one record.</dd>
<dt>Five-tuple</dt><dd>Source IP, destination IP, protocol, source port, destination port.</dd>
<dt>Key field</dt><dd>A field that separates one flow from another; a non-key field is only collected.</dd>
<dt>Exporter</dt><dd>The device that builds flow records and sends them.</dd>
<dt>Collector</dt><dd>The server that receives records, here NMS on UDP 9995.</dd>
<dt>Template</dt><dd>The description of record layout that v9 and IPFIX send before the data.</dd>
<dt>Active timeout</dt><dd>Export of a long-lived flow after this many seconds.</dd>
<dt>Inactive timeout</dt><dd>Export of an idle flow after this many seconds without packets.</dd>
<dt>Sampling</dt><dd>Observing one packet in N to save CPU, with less accuracy.</dd>
<dt>SPAN</dt><dd>Local copy of port or VLAN traffic to a destination port.</dd>
<dt>RSPAN / ERSPAN</dt><dd>SPAN across Layer 2 (VLAN) or Layer 3 (GRE).</dd>
<dt>Promiscuous mode</dt><dd>Network card mode that accepts frames not addressed to it.</dd>
<dt>Capture filter</dt><dd>A rule that limits what is stored, written in BPF words.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>IPFIX</td><td>protocol version 10, open standard from NetFlow v9</td></tr>
<tr><td>NetFlow v5</td><td>fixed format, no templates, IPv4 only</td></tr>
<tr><td>Flexible NetFlow parts</td><td>record, exporter, monitor, interface application</td></tr>
<tr><td>Lab exporter</td><td>GF-EXPORT to 10.1.50.100, UDP 9995, source Loopback0</td></tr>
<tr><td>Classic timeouts</td><td>inactive 15 seconds, active 30 minutes (often set to 60 seconds)</td></tr>
<tr><td>Monitor "not allocated"</td><td>not applied to any interface</td></tr>
<tr><td>Apply direction</td><td>input on each interface avoids double counting</td></tr>
<tr><td>SPAN destination port</td><td>carries only the copy and is not a normal port</td></tr>
<tr><td>Flow content</td><td>no payload, only counts and fields</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">flow record GF-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 match interface input
 collect counter bytes
 collect counter packets
flow exporter GF-EXPORT
 destination 10.1.50.100
 source Loopback0
 transport udp 9995
 export-protocol netflow-v9
flow monitor GF-MON-FLOW
 record GF-REC
 exporter GF-EXPORT
 cache timeout active 60
 cache timeout inactive 15
interface GigabitEthernet0/0
 ip flow monitor GF-MON-FLOW input

show flow exporter GF-EXPORT
show flow monitor GF-MON-FLOW cache format table
show flow interface

monitor session 1 source interface GigabitEthernet0/1 both
monitor session 1 destination interface GigabitEthernet0/5
show monitor session 1
no monitor session 1</pre>

<h3>Privacy checklist</h3>
<ul>
<li>Flow data reveals who talks to whom: limit access to the analyser and keep retention to policy.</li>
<li>Captures can hold passwords and personal data: narrow filter, short time, safe storage, delete when done.</li>
<li>Record who captured what, when and why; remove SPAN sessions when finished.</li>
</ul>

<div class="warn"><p><b>Last-minute mistakes.</b> Do not confuse SPAN (copy of frames) with flow (summary records). Do not apply the monitor in both directions on every interface. Do not stop at the first exporter fault. Do not leave a mirror session running.</p></div>
<div class="exam"><p><b>Exam trap.</b> If a scenario says "determine which host consumes the bandwidth", the answer is flow data. If it says "see why the TCP session fails", the answer is packet capture. If it says "how busy is the interface", the answer is SNMP counters.</p></div>

<div class="scn"><h4>A single Monday, three signals</h4><p>At 09:30 SNMP showed BB-KCH-01 at 96 percent. Flow top talkers named one host sending to an unfamiliar address on TCP 8443. A short, filtered SPAN capture on the Kochi uplink confirmed the upload and its size. Security spoke to the user within the hour, and the evidence was removed after the case closed.</p><p><b>Lesson:</b> each signal answered the next question; none could do it alone.</p></div>

<div class="iv"><p class="q">"How do flow data, SNMP and packet capture complement each other?"</p><p>Strong answer: SNMP is cheap and continuous and shows that a link or CPU is busy. Flow adds who and what, with no payload, so it scales. Capture gives full detail for a short time and a narrow target, with privacy cost. The usual order is SNMP to detect, flow to scope and capture to prove.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Counters say how busy, flow says who and what, capture says exactly what happened.</li>
<li>Flexible NetFlow: record, exporter, monitor, applied on an interface.</li>
<li>Four exporter faults: destination, port, source and version; the monitor must also be applied.</li>
<li>SPAN, RSPAN and ERSPAN copy traffic locally, across Layer 2 and across Layer 3.</li>
<li>Protect privacy: narrow filters, short captures, restricted access, clean up.</li>
</ul></div>
`,hi:`
<h3>Module ek picture mein</h3>
<p>Ab aapke paas traffic dekhne ke teen tareeke hain aur aap jaante ho ki kab kaun sa use karna hai. Counters batate hain ki link busy hai. Flow records batate hain ki kaun use kar raha hai. Capture dikhata hai ki wire par asal mein kya hua. Yeh chapter facts aur commands ek jagah laata hai taaki lab, exam ya interview se pehle jaldi revise kar sako.</p>
<div class="dia">`+e+`<p class="cap">Sirf utna aage badho jitna sawal ko chahiye: har step zyada cost aur zyada exposure laata hai.</p></div>

<div class="note"><p><b>Simulator ka scope.</b> Simulated: NetFlow aur IPFIX export aur collection, flow monitors, records aur exporters, top-talker views, SPAN sessions aur capture view. Simulated nahi: asli throughput, asli time-series ya analytics database, asli encryption, aur vendor product screens. Asli products menus aur limits mein alag hote hain; production mein lagane se pehle vendor documentation padho.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main flow define kar sakta hoon aur five-tuple list kar sakta hoon, aur bata sakta hoon key aur non-key fields kya hain.</li>
<li>Main NetFlow v5, v9 aur IPFIX ki tulna kar sakta hoon, aur samjha sakta hoon template kya hai.</li>
<li>Main active aur inactive timeouts samjha sakta hoon aur sampling kya chhodta hai.</li>
<li>Main exporter, collector aur analyser describe kar sakta hoon, aur top talkers ko use ke roop mein bata sakta hoon.</li>
<li>Main record, exporter GF-EXPORT (10.1.50.100, UDP 9995, source Loopback0) aur monitor GF-MON-FLOW bana sakta hoon, aur ip flow monitor input se apply kar sakta hoon.</li>
<li>Main show flow exporter, show flow monitor, show flow interface, cache aur collector par show flows se verify kar sakta hoon.</li>
<li>Main order mein troubleshoot kar sakta hoon: applied, cache, exporter, network, collector.</li>
<li>Main chaar exporter faults bata sakta hoon: destination, port, source aur version.</li>
<li>Main local SPAN session configure kar sakta hoon aur show monitor session padh sakta hoon.</li>
<li>Main RSPAN aur ERSPAN samjha sakta hoon aur kab kaun sa use karna hai.</li>
<li>Main capture filters likh sakta hoon aur TCP handshake, retransmission aur reset padh sakta hoon.</li>
<li>Main captures aur flow data ke privacy rules bata sakta hoon.</li>
</ul>

<h3>Flow vs SNMP vs capture: jaldi chunna</h3>
<table class="cmp"><tr><th>Sawal</th><th>Use karo</th><th>Kyun</th></tr>
<tr><td>Kya Kochi circuit abhi full hai?</td><td>SNMP interface counters</td><td>sasta aur lagataar</td></tr>
<tr><td>Kaun sa host use bhar raha hai?</td><td>Flow top talkers</td><td>addresses, ports aur bytes dikhata hai</td></tr>
<tr><td>Ek session hang kyun hota hai?</td><td>SPAN se packet capture</td><td>handshake, retransmissions, resets dikhata hai</td></tr>
<tr><td>Kya kal raat ka backup overrun hua?</td><td>Ek minute active timeout ke saath flow</td><td>application ke hisaab se history</td></tr>
<tr><td>Kisne shak wale address se baat ki?</td><td>Flow, phir capture se saboot</td><td>flow dhoondhta hai, capture sabit karta hai</td></tr></table>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Flow</dt><dd>Same key fields wale packets, ek record ke roop mein ginte hue.</dd>
<dt>Five-tuple</dt><dd>Source IP, destination IP, protocol, source port, destination port.</dd>
<dt>Key field</dt><dd>Woh field jo ek flow ko doosre se alag karta hai; non-key field sirf collect hota hai.</dd>
<dt>Exporter</dt><dd>Woh device jo flow records banata aur bhejta hai.</dd>
<dt>Collector</dt><dd>Woh server jo records receive karta hai, yahan NMS UDP 9995 par.</dd>
<dt>Template</dt><dd>Record layout ka description jo v9 aur IPFIX data se pehle bhejte hain.</dd>
<dt>Active timeout</dt><dd>Lambe flow ka itne seconds ke baad export.</dd>
<dt>Inactive timeout</dt><dd>Idle flow ka itne seconds bina packets ke baad export.</dd>
<dt>Sampling</dt><dd>CPU bachane ke liye N mein se ek packet dekhna, kam accuracy ke saath.</dd>
<dt>SPAN</dt><dd>Port ya VLAN traffic ki local copy destination port ko.</dd>
<dt>RSPAN / ERSPAN</dt><dd>Layer 2 (VLAN) ya Layer 3 (GRE) ke across SPAN.</dd>
<dt>Promiscuous mode</dt><dd>Network card ka mode jo unhe address na hue frames bhi accept karta hai.</dd>
<dt>Capture filter</dt><dd>Aisa rule jo tay karta hai kya store hoga, BPF words mein.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>IPFIX</td><td>protocol version 10, NetFlow v9 se bana open standard</td></tr>
<tr><td>NetFlow v5</td><td>fixed format, templates nahi, sirf IPv4</td></tr>
<tr><td>Flexible NetFlow parts</td><td>record, exporter, monitor, interface application</td></tr>
<tr><td>Lab exporter</td><td>GF-EXPORT, 10.1.50.100 ko, UDP 9995, source Loopback0</td></tr>
<tr><td>Classic timeouts</td><td>inactive 15 second, active 30 minute (aksar 60 second set)</td></tr>
<tr><td>Monitor "not allocated"</td><td>kisi interface par apply nahi</td></tr>
<tr><td>Apply direction</td><td>har interface par input double counting se bachata hai</td></tr>
<tr><td>SPAN destination port</td><td>sirf copy carry karta hai aur normal port nahi hai</td></tr>
<tr><td>Flow content</td><td>payload nahi, sirf counts aur fields</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">flow record GF-REC
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 match interface input
 collect counter bytes
 collect counter packets
flow exporter GF-EXPORT
 destination 10.1.50.100
 source Loopback0
 transport udp 9995
 export-protocol netflow-v9
flow monitor GF-MON-FLOW
 record GF-REC
 exporter GF-EXPORT
 cache timeout active 60
 cache timeout inactive 15
interface GigabitEthernet0/0
 ip flow monitor GF-MON-FLOW input

show flow exporter GF-EXPORT
show flow monitor GF-MON-FLOW cache format table
show flow interface

monitor session 1 source interface GigabitEthernet0/1 both
monitor session 1 destination interface GigabitEthernet0/5
show monitor session 1
no monitor session 1</pre>

<h3>Privacy checklist</h3>
<ul>
<li>Flow data batata hai ki kaun kisse baat karta hai: analyser ka access limit karo aur retention policy ke hisaab se rakho.</li>
<li>Captures mein passwords aur personal data ho sakta hai: narrow filter, kam samay, safe storage, kaam ke baad delete.</li>
<li>Record rakho ki kisne kab, kya aur kyun capture kiya; kaam khatam hone par SPAN sessions hata do.</li>
</ul>

<div class="warn"><p><b>Aakhri minute ki galtiyan.</b> SPAN (frames ki copy) ko flow (summary records) se mix mat karo. Har interface par monitor ko dono directions mein apply mat karo. Pehle exporter fault par mat ruko. Mirror session chalta hua mat chhodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Agar scenario kehta hai "pata karo kaun sa host bandwidth kha raha hai", jawab flow data hai. Agar kehta hai "dekho TCP session kyun fail hota hai", jawab packet capture hai. Agar kehta hai "interface kitna busy hai", jawab SNMP counters hai.</p></div>

<div class="scn"><h4>Ek Somvar, teen signals</h4><p>09:30 par SNMP ne BB-KCH-01 ko 96 percent dikhaya. Flow top talkers ne ek host ko naam diya jo anjaan address ko TCP 8443 par bhej raha tha. Kochi uplink par chhote, filtered SPAN capture ne upload aur uska size confirm kiya. Security ne ghante ke andar user se baat ki, aur case band hone ke baad evidence hata diya gaya.</p><p><b>Seekh:</b> har signal ne agle sawal ka jawab diya; koi akela yeh nahi kar sakta tha.</p></div>

<div class="iv"><p class="q">"Flow data, SNMP aur packet capture ek doosre ko kaise poora karte hain?"</p><p>Strong answer: SNMP sasta aur lagataar hai aur dikhata hai ki link ya CPU busy hai. Flow kaun aur kya jodta hai, payload ke bina, isliye scale karta hai. Capture ek chhote samay aur narrow target ke liye poori detail deta hai, privacy cost ke saath. Aam order: SNMP detect karne ke liye, flow scope karne ke liye aur capture sabit karne ke liye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Counters batate hain kitna busy, flow batata hai kaun aur kya, capture batata hai bilkul kya hua.</li>
<li>Flexible NetFlow: record, exporter, monitor, interface par apply.</li>
<li>Chaar exporter faults: destination, port, source aur version; monitor bhi apply hona chahiye.</li>
<li>SPAN, RSPAN aur ERSPAN traffic ko local, Layer 2 aur Layer 3 ke across copy karte hain.</li>
<li>Privacy bachao: narrow filters, chhote captures, restricted access, safai.</li>
</ul></div>
`}};export{t as default};