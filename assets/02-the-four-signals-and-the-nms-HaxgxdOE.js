var e={id:`four-signals-and-nms`,h:{en:`The four signals and the NMS: your first logs and first SNMP get`,hi:`Chaar signals aur NMS: aapke pehle logs aur pehla SNMP get`},body:{en:`
<h3>An analogy: four ways to know a shop is healthy</h3>
<p>Imagine you own a busy sweet shop and cannot stand inside all day. You could read the <b>counters</b> (how many boxes were sold per hour), read the <b>diary</b> the staff write in (what happened and when), watch the <b>CCTV summary</b> (who came in, who went to which counter) and follow <b>one customer's journey</b> from door to bill. Each tells you something the others cannot. Network observability has the same four sources. They are called signals.</p>

<h3>The four signals</h3>
<dl class="terms">
<dt>Metrics</dt><dd>Numbers sampled over time: CPU percent, memory, interface utilisation, latency, packet loss. Small, cheap and perfect for graphs and thresholds. In networks they mostly arrive by <b>SNMP</b>. They tell you <i>how much</i>.</dd>
<dt>Logs</dt><dd>Text events with a time: "interface Gi0/1 changed state to down", "configuration saved by user ravi". On network devices they travel by <b>syslog</b>. They tell you <i>what happened and when</i>.</dd>
<dt>Flows</dt><dd>Summaries of conversations: source address, destination address, protocol, port, bytes. Exported by <b>NetFlow or IPFIX</b>. They tell you <i>who talked to whom</i>. You never see the content, only the envelope.</dd>
<dt>Traces</dt><dd>The path of one request through several systems, with the time spent at each hop. In applications this is distributed tracing; in networks the nearest tools are <b>traceroute</b>, packet capture and active probes such as IP SLA. They tell you <i>where the time went</i>.</dd>
</dl>

<table class="cmp"><tr><th>Signal</th><th>Question it answers</th><th>Typical carrier</th><th>Size</th></tr>
<tr><td>Metrics</td><td>How much? How fast?</td><td>SNMP, streaming telemetry</td><td>small</td></tr>
<tr><td>Logs</td><td>What happened? When?</td><td>syslog UDP 514</td><td>medium</td></tr>
<tr><td>Flows</td><td>Who talked to whom?</td><td>NetFlow / IPFIX UDP 9995</td><td>large</td></tr>
<tr><td>Traces</td><td>Where did the time go?</td><td>traceroute, capture, probes</td><td>on demand</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four signals into the NMS">
<rect x="20" y="20" width="130" height="36" rx="8" fill="#bae6fd"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="13">Metrics (SNMP)</text>
<rect x="20" y="66" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="85" y="89" text-anchor="middle" class="svg-ink" font-size="13">Logs (syslog)</text>
<rect x="20" y="112" width="130" height="36" rx="8" fill="#fde68a"/><text x="85" y="135" text-anchor="middle" class="svg-ink" font-size="13">Flows (NetFlow)</text>
<rect x="20" y="158" width="130" height="36" rx="8" fill="#fed7aa"/><text x="85" y="181" text-anchor="middle" class="svg-ink" font-size="13">Traces / probes</text>
<rect x="250" y="60" width="130" height="80" rx="10" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="14">NMS</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.50.100</text>
<rect x="480" y="60" width="140" height="80" rx="10" fill="#e2e8f0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">Human reads</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">graph, search, alert</text>
<line x1="150" y1="38" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="150" y1="84" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="150" y1="130" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="176" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four kinds of evidence flow into one place, where a human reads them.</p></div>

<h3>What the NMS does</h3>
<p>The NMS has four jobs. It <b>receives</b> logs on UDP 514 and traps on UDP 162. It <b>asks</b> devices for numbers over SNMP on UDP 161. It <b>collects</b> flow records on UDP 9995. And it <b>shows</b> the result in a console. In the CLI labs the device named NMS is a simple server with these roles; the GUI console you meet in chapter 4 is the same idea with a nicer face.</p>

<h3>Lab walkthrough: first logs and one SNMP get</h3>
<p>The CLI lab obs-start-1 asks for the smallest complete loop. On the router (shown here on R-HYD, hostname HYD-CORE-R1) you tell it where to send logs, and you allow the NMS to read one value over SNMP. Then, from the NMS, you read that value and check the logs arrived.</p>
<pre class="code"><span class="c">! on HYD-CORE-R1: send logs to the NMS</span>
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# logging host 10.1.50.100
HYD-CORE-R1(config)# logging trap informational
<span class="c">! allow only the NMS to read via SNMP</span>
HYD-CORE-R1(config)# access-list 20 permit host 10.1.50.100
HYD-CORE-R1(config)# snmp-server community GF-RO RO 20
HYD-CORE-R1(config)# snmp-server location Hyderabad-Rack-A1</pre>
<p>Line by line: <code>logging host</code> names the collector; <code>logging trap informational</code> sends messages of severity 6 and more serious; <code>access-list 20</code> is a standard list that matches one source host; <code>snmp-server community GF-RO RO 20</code> creates a read-only password and ties it to that list. You will study each idea properly in the SNMP and syslog modules; for now, see the loop work.</p>
<p>Now read from the NMS:</p>
<pre class="out">NMS&gt; snmpget -c GF-RO 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span>

NMS&gt; show syslog
Syslog collector on 10.1.50.100 (UDP 514): 2 messages received
Received (UTC)   From            Sev  Message
Oct  7 09:12:40  10.255.0.1      notice  &lt;189&gt;%SYS-5-CONFIG_I: Configured from console by console</pre>
<p>The highlighted line proves the SNMP half: the NMS asked for sysName and the agent answered with the hostname. The syslog block proves the logging half: a configuration message from the router reached the collector. If either is missing, the loop is broken somewhere between configuration, routing and filtering, and the later modules show how to find where.</p>

<div class="eg"><p><b>Worked example.</b> A message is about 120 bytes. A router that logs 3 messages a minute sends about 360 bytes a minute, which is nothing. A flow export from a busy 100 Mbps link can be hundreds of kilobits a second. That is why logs and metrics are cheap to keep for a year while flow data is usually kept for days or weeks.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting the ACL entry for the NMS address, so every poll times out. (2) Using a community called public or private; always choose a company-specific name and restrict it. (3) Assuming silence from the NMS means the router is fine; it may mean the message never arrived.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNMP polling uses UDP 161 on the device; traps go to UDP 162 on the manager; syslog uses UDP 514; NetFlow commonly uses UDP 2055 or 9995 depending on the product. Know which side listens.</p></div>

<div class="scn"><h4>The silent switch</h4><p>Ravi noticed that a branch switch never appeared in the monitoring tool. The community on the switch was typed GF-R0 with a zero instead of GF-RO. The NMS saw a timeout, which looks exactly like a dead device. He ran snmpget from the NMS, saw "Timeout: No Response", checked the running config for the community name, corrected it and the switch turned green.</p><p><b>Lesson:</b> a timeout does not say "device down"; it says "no answer", and the cause may be a typo.</p></div>

<div class="iv"><p class="q">"Name the four observability signals and give one tool for each."</p><p>Strong answer: metrics by SNMP or streaming telemetry, logs by syslog, flows by NetFlow or IPFIX, and traces by traceroute, packet capture or IP SLA probes. Add that they answer different questions (how much, what happened, who talked to whom, where the time went), so you need all four to find a root cause.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Metrics say how much, logs say what and when, flows say who with whom, traces say where the time went.</li>
<li>The NMS receives logs and traps, polls with SNMP, collects flows and displays the result.</li>
<li>Logs go to UDP 514, SNMP polls to UDP 161, traps to UDP 162.</li>
<li>The first lab loop: logging host, logging trap, an ACL, a read-only community, then snmpget and show syslog.</li>
<li>A timeout means no answer; it can be a typo, an ACL or a dead device.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: dukaan healthy hai yeh jaanne ke chaar tareeke</h3>
<p>Socho aapki ek busy mithai ki dukaan hai aur aap poora din andar khade nahi reh sakte. Aap <b>counters</b> padh sakte ho (ghante mein kitne boxes bike), staff ki likhi <b>diary</b> padh sakte ho (kab kya hua), <b>CCTV summary</b> dekh sakte ho (kaun aaya, kaun kis counter par gaya) aur <b>ek customer ka safar</b> darwaze se bill tak follow kar sakte ho. Har ek woh batata hai jo baaki nahi bata sakte. Network observability ke bhi yahi chaar sources hain. Inhe signals kehte hain.</p>

<h3>Chaar signals</h3>
<dl class="terms">
<dt>Metrics</dt><dd>Time ke saath sample kiye gaye numbers: CPU percent, memory, interface utilisation, latency, packet loss. Chhote, sasta aur graphs aur thresholds ke liye perfect. Networks mein yeh zyadatar <b>SNMP</b> se aate hain. Yeh batate hain <i>kitna</i>.</dd>
<dt>Logs</dt><dd>Time ke saath text events: "interface Gi0/1 changed state to down", "configuration saved by user ravi". Network devices par yeh <b>syslog</b> se travel karte hain. Yeh batate hain <i>kya hua aur kab</i>.</dd>
<dt>Flows</dt><dd>Conversations ke summaries: source address, destination address, protocol, port, bytes. <b>NetFlow ya IPFIX</b> se export hote hain. Yeh batate hain <i>kaun kisse baat kar raha tha</i>. Aap content nahi dekhte, sirf lifafa dekhte ho.</dd>
<dt>Traces</dt><dd>Ek request ka kai systems se guzarta hua path, har hop par lage time ke saath. Applications mein yeh distributed tracing hai; networks mein sabse nazdeeki tools <b>traceroute</b>, packet capture aur IP SLA jaise active probes hain. Yeh batate hain <i>time kahan gaya</i>.</dd>
</dl>

<table class="cmp"><tr><th>Signal</th><th>Kaunsa sawaal</th><th>Typical carrier</th><th>Size</th></tr>
<tr><td>Metrics</td><td>Kitna? Kitna fast?</td><td>SNMP, streaming telemetry</td><td>chhota</td></tr>
<tr><td>Logs</td><td>Kya hua? Kab?</td><td>syslog UDP 514</td><td>medium</td></tr>
<tr><td>Flows</td><td>Kaun kisse baat kar raha?</td><td>NetFlow / IPFIX UDP 9995</td><td>bada</td></tr>
<tr><td>Traces</td><td>Time kahan gaya?</td><td>traceroute, capture, probes</td><td>on demand</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Four signals into the NMS">
<rect x="20" y="20" width="130" height="36" rx="8" fill="#bae6fd"/><text x="85" y="43" text-anchor="middle" class="svg-ink" font-size="13">Metrics (SNMP)</text>
<rect x="20" y="66" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="85" y="89" text-anchor="middle" class="svg-ink" font-size="13">Logs (syslog)</text>
<rect x="20" y="112" width="130" height="36" rx="8" fill="#fde68a"/><text x="85" y="135" text-anchor="middle" class="svg-ink" font-size="13">Flows (NetFlow)</text>
<rect x="20" y="158" width="130" height="36" rx="8" fill="#fed7aa"/><text x="85" y="181" text-anchor="middle" class="svg-ink" font-size="13">Traces / probes</text>
<rect x="250" y="60" width="130" height="80" rx="10" fill="#ddd6fe"/><text x="315" y="95" text-anchor="middle" class="svg-ink" font-size="14">NMS</text><text x="315" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.50.100</text>
<rect x="480" y="60" width="140" height="80" rx="10" fill="#e2e8f0"/><text x="550" y="95" text-anchor="middle" class="svg-ink" font-size="13">Insaan padhta hai</text><text x="550" y="115" text-anchor="middle" class="svg-muted" font-size="12">graph, search, alert</text>
<line x1="150" y1="38" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="150" y1="84" x2="250" y2="95" stroke="#64748b" stroke-width="2"/><line x1="150" y1="130" x2="250" y2="110" stroke="#64748b" stroke-width="2"/><line x1="150" y1="176" x2="250" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar tarah ka evidence ek jagah aata hai, jahan insaan use padhta hai.</p></div>

<h3>NMS kya karta hai</h3>
<p>NMS ke chaar kaam hain. Woh UDP 514 par logs aur UDP 162 par traps <b>receive</b> karta hai. UDP 161 par SNMP se devices se numbers <b>maangta</b> hai. UDP 9995 par flow records <b>collect</b> karta hai. Aur result ko console mein <b>dikhata</b> hai. CLI labs mein NMS naam ka device in roles wala ek simple server hai; chapter 4 mein jo GUI console milegi woh wahi idea hai, bas sundar chehre ke saath.</p>

<h3>Lab walkthrough: pehle logs aur ek SNMP get</h3>
<p>CLI lab obs-start-1 sabse chhota complete loop maangta hai. Router par (yahan R-HYD, hostname HYD-CORE-R1 par dikhaya) aap use batate ho ki logs kahan bhejne hain, aur NMS ko SNMP se ek value padhne ki permission dete ho. Phir NMS se woh value padhte ho aur check karte ho ki logs pahunche ya nahi.</p>
<pre class="code"><span class="c">! on HYD-CORE-R1: send logs to the NMS</span>
HYD-CORE-R1(config)# service timestamps log datetime msec
HYD-CORE-R1(config)# logging host 10.1.50.100
HYD-CORE-R1(config)# logging trap informational
<span class="c">! allow only the NMS to read via SNMP</span>
HYD-CORE-R1(config)# access-list 20 permit host 10.1.50.100
HYD-CORE-R1(config)# snmp-server community GF-RO RO 20
HYD-CORE-R1(config)# snmp-server location Hyderabad-Rack-A1</pre>
<p>Line by line: <code>logging host</code> collector ka naam batata hai; <code>logging trap informational</code> severity 6 aur usse zyada serious messages bhejta hai; <code>access-list 20</code> ek standard list hai jo ek source host match karti hai; <code>snmp-server community GF-RO RO 20</code> ek read-only password banata hai aur use us list se jodta hai. Har idea ko aap SNMP aur syslog modules mein properly padhoge; abhi bas loop ko kaam karte dekho.</p>
<p>Ab NMS se padho:</p>
<pre class="out">NMS&gt; snmpget -c GF-RO 10.255.0.1 sysName.0
<span class="hl">SNMPv2-MIB::sysName.0 = STRING: HYD-CORE-R1</span>

NMS&gt; show syslog
Syslog collector on 10.1.50.100 (UDP 514): 2 messages received
Received (UTC)   From            Sev  Message
Oct  7 09:12:40  10.255.0.1      notice  &lt;189&gt;%SYS-5-CONFIG_I: Configured from console by console</pre>
<p>Highlighted line SNMP wala hissa prove karti hai: NMS ne sysName maanga aur agent ne hostname se jawab diya. Syslog block logging wala hissa prove karta hai: router ka ek configuration message collector tak pahuncha. Agar koi bhi missing hai, to loop configuration, routing ya filtering ke beech kahin toota hai, aur aage ke modules dikhate hain ki kahan dhoondhna hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek message lagbhag 120 bytes ka hota hai. Jo router 3 messages per minute log karta hai woh lagbhag 360 bytes per minute bhejta hai, jo kuch nahi hai. Ek busy 100 Mbps link ka flow export kai sau kilobits per second ho sakta hai. Isiliye logs aur metrics saal bhar rakhna sasta hai jabki flow data aam taur par kuch din ya hafton ke liye rakha jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) NMS address ki ACL entry bhool jaana, jisse har poll time out hota hai. (2) public ya private naam ka community use karna; hamesha company-specific naam chuno aur use restrict karo. (3) NMS ki khamoshi ka matlab router theek hai samajhna; ho sakta hai message kabhi pahuncha hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNMP polling device ke UDP 161 par jaati hai; traps manager ke UDP 162 par jaate hain; syslog UDP 514; NetFlow product ke hisaab se aam taur par UDP 2055 ya 9995. Jaano ki kaunsi side listen karti hai.</p></div>

<div class="scn"><h4>Khamosh switch</h4><p>Ravi ne dekha ki ek branch switch monitoring tool mein kabhi dikha hi nahi. Switch par community GF-RO ki jagah GF-R0 (zero ke saath) type ho gayi thi. NMS ko timeout dikha, jo bilkul dead device jaisa lagta hai. Usne NMS se snmpget chalaya, "Timeout: No Response" dekha, running config mein community name check kiya, theek kiya aur switch green ho gaya.</p><p><b>Seekh:</b> timeout "device down" nahi kehta; "koi jawab nahi" kehta hai, aur wajah typo ho sakti hai.</p></div>

<div class="iv"><p class="q">"Chaar observability signals ke naam batao aur har ek ka ek tool do."</p><p>Strong answer: metrics SNMP ya streaming telemetry se, logs syslog se, flows NetFlow ya IPFIX se, aur traces traceroute, packet capture ya IP SLA probes se. Jodo ki yeh alag sawaalon ka jawab dete hain (kitna, kya hua, kaun kisse, time kahan gaya), isliye root cause dhoondhne ke liye chaaron chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Metrics batate hain kitna, logs kya aur kab, flows kaun kisse, traces time kahan gaya.</li>
<li>NMS logs aur traps receive karta hai, SNMP se poll karta hai, flows collect karta hai aur result dikhata hai.</li>
<li>Logs UDP 514 par, SNMP polls UDP 161 par, traps UDP 162 par jaate hain.</li>
<li>Pehla lab loop: logging host, logging trap, ek ACL, ek read-only community, phir snmpget aur show syslog.</li>
<li>Timeout ka matlab koi jawab nahi; yeh typo, ACL ya dead device ho sakta hai.</li>
</ul></div>
`}};export{e as default};