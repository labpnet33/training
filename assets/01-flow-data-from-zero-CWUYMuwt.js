var e=`<svg viewBox="0 0 640 210" role="img" aria-label="Packets grouped into flows by the five-tuple">
<rect x="10" y="20" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">Packets on a link</text>
<text x="20" y="66" class="svg-muted" font-size="11">10.2.20.21:51044 to 10.1.20.10:443 tcp</text><text x="20" y="84" class="svg-muted" font-size="11">10.2.20.21:51044 to 10.1.20.10:443 tcp</text><text x="20" y="102" class="svg-muted" font-size="11">10.2.20.35:40122 to 10.1.20.10:443 tcp</text><text x="20" y="120" class="svg-muted" font-size="11">10.2.20.21:51044 to 10.1.20.10:443 tcp</text><text x="20" y="138" class="svg-muted" font-size="11">10.2.20.21:60001 to 10.1.50.100:53 udp</text><text x="20" y="156" class="svg-muted" font-size="11">10.2.20.35:40122 to 10.1.20.10:443 tcp</text>
<line x1="210" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/><text x="240" y="95" text-anchor="middle" class="svg-accent" font-size="12">group</text>
<rect x="270" y="20" width="360" height="52" rx="8" fill="#bae6fd"/><text x="280" y="42" class="svg-ink" font-size="12">Flow 1  10.2.20.21 to 10.1.20.10  tcp 443</text><text x="280" y="60" class="svg-muted" font-size="11">3 packets, 1,820 bytes</text>
<rect x="270" y="80" width="360" height="52" rx="8" fill="#bbf7d0"/><text x="280" y="102" class="svg-ink" font-size="12">Flow 2  10.2.20.35 to 10.1.20.10  tcp 443</text><text x="280" y="120" class="svg-muted" font-size="11">2 packets, 1,310 bytes</text>
<rect x="270" y="140" width="360" height="52" rx="8" fill="#fde68a"/><text x="280" y="162" class="svg-ink" font-size="12">Flow 3  10.2.20.21 to 10.1.50.100  udp 53</text><text x="280" y="180" class="svg-muted" font-size="11">1 packet, 74 bytes</text>
</svg>`,t={id:`flow-data-from-zero`,h:{en:`Flow data from zero: who talks to whom`,hi:`Flow data zero se: kaun kisse baat karta hai`},body:{en:`
<h3>What you will learn</h3>
<p>This module answers a question that SNMP graphs and syslog lines cannot: <b>who is talking to whom, how much, and over which application?</b> You will learn what a flow is, what NetFlow, IPFIX and sampling mean, how to configure a router to export flows, how to mirror traffic with SPAN and read a capture, and how to fix it when the data does not arrive. This first chapter builds the concepts.</p>
<p><b>Prerequisites:</b> you know IP addresses, TCP and UDP port numbers, and the monitoring loop from obs-start. You have seen syslog in module obs-syslog; flow export uses the same idea of devices sending to a collector, but the data is numbers, not text.</p>

<h3>An analogy: the phone bill, not the call recording</h3>
<p>Your mobile operator does not keep a recording of every call. It keeps a bill: who called whom, at what time, for how long, how much data. From the bill you can spot that one number was called two hundred times, or that one SIM used 40 GB. Flow data is the phone bill of the network. A packet capture is the call recording: complete, but heavy and private. SNMP counters are the total on the meter: they say the line is busy but not who is using it.</p>

<h3>Packets, flows and the five-tuple</h3>
<p>A <b>packet</b> is one small unit sent on the wire. A <b>flow</b> is a series of packets that belong to the same conversation, all sharing the same identifying fields. The classic identifying set is the <b>five-tuple</b>:</p>
<ol>
<li>source IP address</li>
<li>destination IP address</li>
<li>protocol (TCP is 6, UDP is 17, ICMP is 1)</li>
<li>source port</li>
<li>destination port</li>
</ol>
<p>Many routers also add the input interface and the ToS (type of service) byte. These are the <b>key fields</b>: if any key field differs, it is a different flow. Other fields, such as byte and packet counts and start and end times, are <b>non-key fields</b>. They are filled in as the flow runs.</p>
<div class="dia">`+e+`<p class="cap">Six packets become three flow records. The records are far smaller than the traffic they describe.</p></div>
<div class="eg"><p><b>Worked example.</b> PC-KCH (10.2.20.21) opens an ERP page on SRV-HYD (10.1.20.10). Its browser uses source port 51044 and destination port 443, TCP. All packets of that session share the same five values, so the router keeps one record and adds up bytes and packets. A second browser tab uses source port 51046: a new flow. A DNS lookup to NMS is UDP 53: yet another flow.</p></div>

<h3>Why flow data is useful</h3>
<ul>
<li><b>Top talkers</b>: which source or destination addresses used the most bytes. This finds the backup job, the video stream or the infected laptop.</li>
<li><b>Application mix</b>: how much of a circuit is ERP, web, file copy, DNS.</li>
<li><b>Capacity planning</b>: who will fill ILL-HYD-01 next quarter.</li>
<li><b>Security hints</b>: a PC talking to an unknown address on a strange port, a scan touching many hosts.</li>
<li><b>Billing and proof</b>: show a department how much it used.</li>
</ul>

<h3>NetFlow versions and IPFIX</h3>
<table class="cmp"><tr><th>Format</th><th>Key idea</th><th>Remember</th></tr>
<tr><td>NetFlow v5</td><td>fixed record, IPv4 only, fixed fields</td><td>simple, old, no templates</td></tr>
<tr><td>NetFlow v9</td><td>template based: the exporter sends a template that describes the fields, then data records that follow it</td><td>flexible, supports IPv6 and other fields</td></tr>
<tr><td>IPFIX</td><td>the IETF standard based on v9 (protocol version 10)</td><td>vendor-neutral, supports variable-length fields</td></tr></table>
<p>A <b>template</b> is the layout of a record: "field 1 is the source address, field 2 is the destination address, then protocol, ports, bytes, packets". Without the template the collector cannot decode the data, so it must receive the template first. This is why a collector that was restarted may show nothing until the next template arrives. Cisco's Flexible NetFlow and the Godavari lab let you choose v9 or IPFIX where the platform supports it. Other vendors use their own names for the same idea, for example sFlow (which samples packets) and J-Flow.</p>

<h3>Two timers and sampling</h3>
<p>The router does not export a record for every packet. It keeps active flows in a <b>cache</b> and exports a record when the flow is finished or has been seen long enough.</p>
<dl class="terms">
<dt>Inactive timeout</dt><dd>If no packet arrives for this many seconds (default 15), the flow is considered finished and exported.</dd>
<dt>Active timeout</dt><dd>A long flow, such as a nightly backup, is exported every so often even while it continues (classic default 30 minutes, often set to 60 seconds for faster graphs).</dd>
<dt>Sampling</dt><dd>On very fast links the router looks at only one packet in N, for example one in 100, and the collector multiplies the counts back. It saves CPU and memory at the price of accuracy for small flows.</dd>
</dl>

<h3>The architecture: exporter, collector, analyser</h3>
<p>Three roles make a flow system. The <b>exporter</b> (the router or switch) builds the records. The <b>collector</b> receives them on a UDP port; for the labs it is NMS on UDP 9995. The <b>analyser</b> turns records into top-talker tables and charts. As with syslog, export is one-way UDP, so a lost datagram is lost and nobody complains.</p>

<h3>Flow versus SNMP versus packet capture</h3>
<table class="cmp"><tr><th>Tool</th><th>Answers</th><th>Cost</th></tr>
<tr><td>SNMP counters</td><td>how busy is the link or CPU</td><td>tiny; no detail on who</td></tr>
<tr><td>Flow records</td><td>who, to whom, which port, how many bytes</td><td>small; no payload</td></tr>
<tr><td>Packet capture</td><td>exactly what was sent, packet by packet</td><td>large, privacy-sensitive, short windows</td></tr></table>
<p>The usual order of work is: SNMP says there is a problem, flow says who and what, and capture proves the details.</p>

<div class="note"><p><b>Scope.</b> The Godavari labs simulate flow export, collection and top-talker views and SPAN, but not real throughput or a real analytics database.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking flow records contain packet content; they do not. (2) Expecting to see a flow instantly: it appears after a timeout or on the next active export. (3) Forgetting that flow only sees traffic crossing a monitored interface. (4) Reading sampled data as exact.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPFIX is protocol version 10 and is the standard derived from NetFlow v9. NetFlow v5 has no templates. The five-tuple is source and destination IP, protocol, source and destination port.</p></div>

<div class="scn"><h4>The slow circuit with no name</h4><p>Priya Nair saw the Kochi circuit BB-KCH-01 at 95 percent every night. SNMP showed the load but not the cause. Flow data on R-KCH showed one internal address sending 2.4 GB to an outside address on TCP 8443. It was a laptop uploading to a personal cloud account. Because the record had the five-tuple, security could contact the user the same morning.</p><p><b>Lesson:</b> SNMP tells you that, flow tells you who.</p></div>

<div class="iv"><p class="q">"What is a flow and what fields define it?"</p><p>Strong answer: a flow is a set of packets sharing the same key fields, classically the five-tuple of source IP, destination IP, protocol, source port and destination port, often plus the input interface. The router counts bytes and packets and timestamps for each flow and exports the record. Add that flow gives who-to-whom and volume without payload.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A flow is a conversation identified by key fields, usually the five-tuple.</li>
<li>Flow records give who, to whom, which port and how much; they do not contain payload.</li>
<li>NetFlow v5 is fixed; v9 and IPFIX use templates; IPFIX is the open standard.</li>
<li>Inactive and active timeouts decide when records are exported; sampling trades accuracy for load.</li>
<li>Use SNMP for how busy, flow for who and what, capture for proof.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh module us sawal ka jawab deta hai jo SNMP graphs aur syslog lines nahi de sakte: <b>kaun kisse baat kar raha hai, kitna, aur kis application par?</b> Aap seekhoge ki flow kya hai, NetFlow, IPFIX aur sampling ka kya matlab hai, router ko flows export karne ke liye kaise configure karte hain, SPAN se traffic mirror karke capture kaise padhte hain, aur data na aaye to use kaise theek karte hain. Yeh pehla chapter concepts banata hai.</p>
<p><b>Prerequisites:</b> aapko IP addresses, TCP aur UDP port numbers, aur obs-start ka monitoring loop aata ho. Aapne module obs-syslog mein syslog dekha hai; flow export mein bhi wahi idea hai ki devices collector ko bhejte hain, lekin data text nahi, numbers hota hai.</p>

<h3>Ek analogy: phone bill, call recording nahi</h3>
<p>Aapka mobile operator har call ki recording nahi rakhta. Woh bill rakhta hai: kisne kisko call kiya, kis time par, kitni der, kitna data. Bill se aap pakad sakte ho ki ek number ko do sau baar call kiya gaya, ya ek SIM ne 40 GB use kiya. Flow data network ka phone bill hai. Packet capture call recording hai: poori, lekin bhaari aur private. SNMP counters meter ka total hain: woh batate hain ki line busy hai lekin yeh nahi ki kaun use kar raha hai.</p>

<h3>Packets, flows aur five-tuple</h3>
<p>Ek <b>packet</b> wire par bheji jaane wali ek chhoti unit hai. Ek <b>flow</b> ek hi conversation ke packets ki series hai, jinke pehchaanne wale fields same hote hain. Classic pehchaan set <b>five-tuple</b> hai:</p>
<ol>
<li>source IP address</li>
<li>destination IP address</li>
<li>protocol (TCP 6, UDP 17, ICMP 1)</li>
<li>source port</li>
<li>destination port</li>
</ol>
<p>Kai routers input interface aur ToS (type of service) byte bhi jodte hain. Yeh <b>key fields</b> hain: agar koi key field alag hai to woh alag flow hai. Baaki fields, jaise byte aur packet counts aur start aur end times, <b>non-key fields</b> hain. Flow chalte hue yeh bharte jaate hain.</p>
<div class="dia">`+e+`<p class="cap">Chhe packets teen flow records ban gaye. Records us traffic se bahut chhote hain jise woh describe karte hain.</p></div>
<div class="eg"><p><b>Worked example.</b> PC-KCH (10.2.20.21) SRV-HYD (10.1.20.10) par ERP page kholta hai. Uska browser source port 51044 aur destination port 443, TCP use karta hai. Us session ke saare packets ki yahi paanch values hain, to router ek record rakhta hai aur bytes aur packets jodta jaata hai. Doosra browser tab source port 51046 use karta hai: naya flow. NMS ko DNS lookup UDP 53 hai: ek aur flow.</p></div>

<h3>Flow data kaam ka kyun hai</h3>
<ul>
<li><b>Top talkers</b>: kaun se source ya destination addresses ne sabse zyada bytes use kiye. Isse backup job, video stream ya infected laptop pakda jaata hai.</li>
<li><b>Application mix</b>: circuit ka kitna hissa ERP, web, file copy, DNS hai.</li>
<li><b>Capacity planning</b>: agli quarter mein ILL-HYD-01 ko kaun bharega.</li>
<li><b>Security hints</b>: PC anjaan address se ajeeb port par baat kar raha hai, scan kai hosts ko chhoo raha hai.</li>
<li><b>Billing aur saboot</b>: department ko dikhao ki usne kitna use kiya.</li>
</ul>

<h3>NetFlow versions aur IPFIX</h3>
<table class="cmp"><tr><th>Format</th><th>Key idea</th><th>Yaad rakho</th></tr>
<tr><td>NetFlow v5</td><td>fixed record, sirf IPv4, fixed fields</td><td>simple, purana, templates nahi</td></tr>
<tr><td>NetFlow v9</td><td>template based: exporter ek template bhejta hai jo fields describe karta hai, phir uske baad data records</td><td>flexible, IPv6 aur doosre fields support</td></tr>
<tr><td>IPFIX</td><td>v9 par based IETF standard (protocol version 10)</td><td>vendor-neutral, variable-length fields support</td></tr></table>
<p>Ek <b>template</b> record ka layout hai: "field 1 source address hai, field 2 destination address hai, phir protocol, ports, bytes, packets". Template ke bina collector data decode nahi kar sakta, isliye use pehle template milna chahiye. Isiliye restart hua collector agle template tak kuch nahi dikha sakta. Cisco ka Flexible NetFlow aur Godavari lab jahan platform support kare wahan v9 ya IPFIX chunne dete hain. Doosre vendors isi idea ke liye apne naam use karte hain, jaise sFlow (jo packets sample karta hai) aur J-Flow.</p>

<h3>Do timers aur sampling</h3>
<p>Router har packet ke liye record export nahi karta. Woh active flows ko ek <b>cache</b> mein rakhta hai aur record tab export karta hai jab flow khatam ho jaye ya kaafi der dikh chuka ho.</p>
<dl class="terms">
<dt>Inactive timeout</dt><dd>Agar itne seconds tak koi packet na aaye (default 15), flow khatam maana jaata hai aur export hota hai.</dd>
<dt>Active timeout</dt><dd>Lamba flow, jaise raat ka backup, chalte hue bhi thodi thodi der mein export hota hai (classic default 30 minute, tez graphs ke liye aksar 60 second).</dd>
<dt>Sampling</dt><dd>Bahut tez links par router N mein se sirf ek packet dekhta hai, jaise 100 mein ek, aur collector counts ko wapas multiply karta hai. CPU aur memory bachti hai, lekin chhote flows ki accuracy ghat jaati hai.</dd>
</dl>

<h3>Architecture: exporter, collector, analyser</h3>
<p>Flow system teen roles se banta hai. <b>Exporter</b> (router ya switch) records banata hai. <b>Collector</b> unhe UDP port par receive karta hai; labs mein woh NMS hai, UDP 9995. <b>Analyser</b> records ko top-talker tables aur charts mein badalta hai. Syslog ki tarah export one-way UDP hai, to khoya hua datagram khoya hi rehta hai aur koi shikayat nahi karta.</p>

<h3>Flow versus SNMP versus packet capture</h3>
<table class="cmp"><tr><th>Tool</th><th>Kya batata hai</th><th>Cost</th></tr>
<tr><td>SNMP counters</td><td>link ya CPU kitna busy hai</td><td>bahut kam; kaun, yeh detail nahi</td></tr>
<tr><td>Flow records</td><td>kaun, kisko, kaun sa port, kitne bytes</td><td>chhota; payload nahi</td></tr>
<tr><td>Packet capture</td><td>bilkul kya bheja gaya, packet by packet</td><td>bada, privacy-sensitive, chhoti windows</td></tr></table>
<p>Kaam ka aam order: SNMP kehta hai problem hai, flow batata hai kaun aur kya, aur capture detail sabit karta hai.</p>

<div class="note"><p><b>Scope.</b> Godavari labs flow export, collection aur top-talker views aur SPAN simulate karte hain, lekin asli throughput ya asli analytics database nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh sochna ki flow records mein packet content hota hai; nahi hota. (2) Flow ke turant dikhne ki ummeed rakhna: woh timeout ke baad ya agle active export par dikhta hai. (3) Yeh bhoolna ki flow sirf monitored interface se guzarne wala traffic dekhta hai. (4) Sampled data ko exact padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPFIX protocol version 10 hai aur NetFlow v9 se bana standard hai. NetFlow v5 mein templates nahi hote. Five-tuple matlab source aur destination IP, protocol, source aur destination port.</p></div>

<div class="scn"><h4>Woh slow circuit jiska koi naam nahi tha</h4><p>Priya Nair ne dekha ki Kochi circuit BB-KCH-01 har raat 95 percent par rehta hai. SNMP ne load dikhaya lekin cause nahi. R-KCH ke flow data ne dikhaya ki ek internal address ek bahari address ko TCP 8443 par 2.4 GB bhej raha tha. Woh ek laptop tha jo personal cloud account par upload kar raha tha. Record mein five-tuple tha, isliye security usi subah user se contact kar saki.</p><p><b>Seekh:</b> SNMP batata hai ki kya hai, flow batata hai ki kaun.</p></div>

<div class="iv"><p class="q">"Flow kya hota hai aur kaun se fields use define karte hain?"</p><p>Strong answer: flow un packets ka set hai jinke key fields same hote hain, classically five-tuple: source IP, destination IP, protocol, source port aur destination port, aksar input interface ke saath. Router har flow ke liye bytes, packets aur timestamps count karta hai aur record export karta hai. Yeh jodo ki flow payload ke bina who-to-whom aur volume deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow key fields se pehchani jaane wali conversation hai, aam taur par five-tuple.</li>
<li>Flow records kaun, kisko, kaun sa port aur kitna dete hain; payload nahi.</li>
<li>NetFlow v5 fixed hai; v9 aur IPFIX templates use karte hain; IPFIX open standard hai.</li>
<li>Inactive aur active timeouts tay karte hain ki records kab export hon; sampling accuracy ke badle load kam karta hai.</li>
<li>SNMP se kitna busy, flow se kaun aur kya, capture se saboot.</li>
</ul></div>
`}};export{t as default};