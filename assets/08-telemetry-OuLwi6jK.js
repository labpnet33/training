var e={id:`telemetry`,h:{en:`Monitoring: SNMP, syslog, streaming telemetry, NetFlow and sFlow`,hi:`Monitoring: SNMP, syslog, streaming telemetry, NetFlow aur sFlow`},body:{en:`
<p>A doctor can check a patient in two ways. A nurse can walk by every hour and take the temperature (polling), or the patient can wear a monitor that streams heart rate and oxygen level every second and beeps when something is wrong (streaming with alerts). The hourly visit misses a crisis that lasts ten minutes. Data center networks moved in the same direction: from <b>SNMP polling</b> every few minutes to <b>streaming telemetry</b> every few seconds, with syslog and flow data filling in the story.</p>

<h3>The four data sources and what each tells you</h3>
<table class="cmp"><tr><th>Source</th><th>Model</th><th>Answers the question</th><th>Transport</th></tr>
<tr><td><b>SNMP</b></td><td>Pull (poll) plus traps</td><td>How are counters and states changing?</td><td>UDP 161 polls, UDP 162 traps</td></tr>
<tr><td><b>Syslog</b></td><td>Push, event based</td><td>What just happened?</td><td>UDP 514 (TCP/TLS options)</td></tr>
<tr><td><b>Streaming telemetry</b></td><td>Push, periodic or on change</td><td>What is the detailed state, every few seconds?</td><td>gRPC/gNMI (also UDP or HTTP on NX-OS)</td></tr>
<tr><td><b>NetFlow / sFlow</b></td><td>Push, flow records or samples</td><td>Who is talking to whom, how much?</td><td>UDP to a flow collector</td></tr>
</table>

<h3>SNMP and syslog: the classics</h3>
<p><b>SNMP</b> organises data as <b>OIDs</b> (numbered object identifiers) described in <b>MIBs</b>. A manager polls OIDs such as interface octet counters; the device can also send <b>traps</b> (unacknowledged) or <b>informs</b> (acknowledged). Use <b>SNMPv3</b>, which adds user-based authentication and encryption; v1 and v2c send a community string in clear text. <b>Syslog</b> messages carry a severity from 0 (emergencies) to 7 (debugging); the logging level you configure sends that severity and everything more severe.</p>
<pre class="code">snmp-server user nocmon network-operator auth sha Str0ngAuthPass priv aes-128 Str0ngPrivPass
snmp-server host 10.99.0.25 traps version 3 priv nocmon
snmp-server enable traps
logging server 10.99.0.20 5 use-vrf management
logging timestamp milliseconds</pre>

<h3>Streaming telemetry: model-driven and pushed</h3>
<p>With <b>model-driven telemetry</b> the switch reads data from its internal models (the DME object tree, YANG models or even show commands) and <b>pushes</b> it to a collector at a fixed interval or when it changes. There is no poller asking again and again, so you can collect every 10 seconds with less CPU than heavy SNMP polling every 5 minutes. Key terms:</p>
<dl class="terms">
<dt>Sensor path</dt><dd>What to stream, for example DME path <code>sys/intf</code> (all interfaces) or a YANG path.</dd>
<dt>Sample interval</dt><dd>How often, in milliseconds on NX-OS; 0 means event-driven (send on change).</dd>
<dt>Encoding</dt><dd>GPB (Google Protocol Buffers, compact binary) or JSON.</dd>
<dt>Dial-out</dt><dd>The switch initiates the connection to the collector (configured on the switch). Works well through firewalls and survives collector restarts.</dd>
<dt>Dial-in</dt><dd>The collector connects to the switch and subscribes, usually with <b>gNMI Subscribe</b> over gRPC (<code>feature grpc</code> on the switch).</dd>
</dl>
<pre class="code">feature telemetry
telemetry
  destination-group 1
    ip address 192.0.2.50 port 57500 protocol gRPC encoding GPB
  sensor-group 1
    data-source DME
    path sys/intf depth unbounded
  subscription 1
    dst-grp 1
    snsr-grp 1 sample-interval 10000</pre>
<pre class="out">LEAF1# show telemetry transport
Session Id   IP Address    Port    Encoding   Transport   Status
---------------------------------------------------------------------
<span class="hl">0            192.0.2.50    57500   GPB        gRPC        Connected</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Dial-out versus dial-in telemetry">
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="250" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<line x1="150" y1="52" x2="250" y2="52" stroke="#64748b" stroke-width="2"/><text x="200" y="44" text-anchor="middle" class="svg-accent" font-size="12">connects</text>
<text x="200" y="100" text-anchor="middle" class="svg-muted" font-size="13">Dial-out: switch starts the session</text>
<rect x="250" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<line x1="390" y1="142" x2="490" y2="142" stroke="#64748b" stroke-width="2"/><text x="440" y="134" text-anchor="middle" class="svg-accent" font-size="12">subscribes</text>
<text x="520" y="100" text-anchor="middle" class="svg-muted" font-size="13">Dial-in: collector starts (gNMI)</text>
</svg><p class="cap">In both models the data flows from switch to collector; only the side that opens the connection differs.</p></div>

<h3>Flow data: NetFlow and sFlow</h3>
<p><b>NetFlow</b> (and its standard form, IPFIX) builds a record per flow: source and destination address, ports, protocol, bytes and packets. On NX-OS you define a <b>record</b> (what to match and collect), an <b>exporter</b> (where to send) and a <b>monitor</b> (record plus exporter), then apply the monitor to an interface. Some Nexus platforms need a TCAM region for NetFlow first. <b>sFlow</b> instead samples 1 in N packets and sends the headers, which is light on hardware and good for traffic profiles at high speed.</p>
<pre class="code">feature netflow
flow exporter EXP1
  destination 192.0.2.60 use-vrf management
  transport udp 2055
  source mgmt0
  version 9
flow record REC1
  match ipv4 source address
  match ipv4 destination address
  match ip protocol
  match transport destination-port
  collect counter bytes
flow monitor MON1
  record REC1
  exporter EXP1
interface Ethernet1/5
  ip flow monitor MON1 input</pre>

<h3>What to alert on</h3>
<p>Collecting everything is easy; alerting well is the skill. Alert on things that need a human, with thresholds that avoid noise:</p>
<ul>
<li><b>Loss of redundancy</b>: uplink down, OSPF or BGP neighbor down, vPC peer-link or keepalive down, a power supply or fan failed.</li>
<li><b>Errors that grow</b>: CRC or input errors increasing over several intervals (a dirty optic or bad cable), output discards (congestion).</li>
<li><b>Capacity</b>: link utilisation above about 70 to 80% for 15 minutes, TCAM or MAC/ARP table near its limit.</li>
<li><b>Control plane stress</b>: high CPU, CoPP drops rising, MAC flapping between ports (possible loop).</li>
<li><b>Security and change</b>: failed logins, configuration changes outside a window (from the accounting log).</li>
</ul>

<div class="eg"><p><b>Worked example: why interval matters.</b> A 100 Gbps uplink has a 30-second microburst at 100% utilisation every 5 minutes, while the average is 20%. SNMP polled every 300 seconds computes the average over the whole interval: 30 s at 100% plus 270 s at about 11% gives about 20%. The graph looks healthy. Telemetry every 10 seconds shows three samples at 100% and the output discards at the same moment, which explains the application team's complaints about slow backups.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using SNMPv2c with a public community string. Forgetting <code>use-vrf management</code>, so logs and telemetry try to leave through the data plane. Clocks not synchronised with NTP, so events from different switches cannot be correlated. Alerting on every single interface flap on server ports at 3 a.m., which trains the NOC to ignore alerts.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNMP polls on UDP 161 and traps go to UDP 162; syslog uses UDP 514; severity 0 is the most severe. Telemetry is push-based; <b>dial-out</b> = switch initiates, <b>dial-in</b> = collector initiates (gNMI). NX-OS sample intervals are in milliseconds. NetFlow = record + exporter + monitor; sFlow = sampling.</p></div>

<div class="scn"><h4>The slow nightly backup</h4><p>Every night between 01:00 and 02:00 the backup team saw throughput collapse. SNMP graphs of the leaf uplinks peaked at 45%, so the network team said it was not the network. The engineer enabled dial-out telemetry for <code>sys/intf</code> at 10-second intervals to the collector and added output discard counters. The next night the data showed repeated 10-second bursts at line rate and thousands of discards on one spine-facing port, because ECMP hashed two large backup flows onto the same link. The fix was to spread the backup jobs across more source ports, which changed the hashing, and later to add uplink capacity.</p><p><b>Lesson:</b> averages hide bursts; high-resolution streaming telemetry shows what users actually feel.</p></div>

<div class="iv"><p class="q">"Why move from SNMP to streaming telemetry, and what is dial-in versus dial-out?"</p><p>Strong answer: SNMP polling is pull-based, coarse (minutes), CPU-heavy at scale and uses MIBs; telemetry pushes model-driven data (DME or YANG paths) every few seconds or on change, encoded in GPB or JSON over gRPC. Dial-out: the switch connects to the collector using configured destination groups, sensor groups and subscriptions. Dial-in: the collector connects and subscribes with gNMI. Give the microburst example and mention verification with <code>show telemetry transport</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP (poll, traps), syslog (events), telemetry (streamed state) and flow data (conversations) answer different questions.</li>
<li>Use SNMPv3 and send logs and telemetry through the management VRF; keep NTP in sync.</li>
<li>NX-OS telemetry: destination-group, sensor-group (path), subscription (sample interval in ms).</li>
<li>Dial-out: switch connects; dial-in: collector subscribes with gNMI.</li>
<li>Alert on lost redundancy, growing errors, capacity, control-plane stress and unexpected changes.</li>
</ul></div>
`,hi:`
<p>Doctor patient ko do tarah check kar sakta hai. Nurse har ghante aa kar temperature le sakti hai (polling), ya patient ek monitor pehen sakta hai jo har second heart rate aur oxygen level stream karta hai aur kuch galat ho to beep karta hai (alerts ke saath streaming). Ghante wali visit das minute ka crisis miss kar deti hai. Data center networks bhi isi disha mein gaye: har kuch minute ki <b>SNMP polling</b> se har kuch second ki <b>streaming telemetry</b> tak, aur syslog aur flow data baaki kahani poori karte hain.</p>

<h3>Chaar data sources aur har ek kya batata hai</h3>
<table class="cmp"><tr><th>Source</th><th>Model</th><th>Kis sawaal ka jawab</th><th>Transport</th></tr>
<tr><td><b>SNMP</b></td><td>Pull (poll) plus traps</td><td>Counters aur states kaise badal rahe hain?</td><td>UDP 161 polls, UDP 162 traps</td></tr>
<tr><td><b>Syslog</b></td><td>Push, event based</td><td>Abhi kya hua?</td><td>UDP 514 (TCP/TLS options)</td></tr>
<tr><td><b>Streaming telemetry</b></td><td>Push, periodic ya on change</td><td>Har kuch second mein detailed state kya hai?</td><td>gRPC/gNMI (NX-OS par UDP ya HTTP bhi)</td></tr>
<tr><td><b>NetFlow / sFlow</b></td><td>Push, flow records ya samples</td><td>Kaun kisse baat kar raha hai, kitna?</td><td>Flow collector ko UDP</td></tr>
</table>

<h3>SNMP aur syslog: classics</h3>
<p><b>SNMP</b> data ko <b>OIDs</b> (numbered object identifiers) mein organise karta hai jo <b>MIBs</b> mein describe hote hain. Manager interface octet counters jaise OIDs poll karta hai; device <b>traps</b> (unacknowledged) ya <b>informs</b> (acknowledged) bhi bhej sakta hai. <b>SNMPv3</b> use karo, jo user-based authentication aur encryption jodta hai; v1 aur v2c community string clear text mein bhejte hain. <b>Syslog</b> messages mein 0 (emergencies) se 7 (debugging) tak severity hoti hai; jo logging level aap configure karte ho woh us severity aur usse zyada severe sab bhejta hai.</p>
<pre class="code">snmp-server user nocmon network-operator auth sha Str0ngAuthPass priv aes-128 Str0ngPrivPass
snmp-server host 10.99.0.25 traps version 3 priv nocmon
snmp-server enable traps
logging server 10.99.0.20 5 use-vrf management
logging timestamp milliseconds</pre>

<h3>Streaming telemetry: model-driven aur push</h3>
<p><b>Model-driven telemetry</b> mein switch apne internal models (DME object tree, YANG models ya show commands tak) se data padhta hai aur use fixed interval par ya badalne par collector ko <b>push</b> karta hai. Koi poller baar baar nahi poochta, isliye aap har 10 second collect kar sakte ho, har 5 minute ki bhaari SNMP polling se kam CPU mein. Key terms:</p>
<dl class="terms">
<dt>Sensor path</dt><dd>Kya stream karna hai, jaise DME path <code>sys/intf</code> (saare interfaces) ya YANG path.</dd>
<dt>Sample interval</dt><dd>Kitni baar, NX-OS par milliseconds mein; 0 ka matlab event-driven (badalne par bhejo).</dd>
<dt>Encoding</dt><dd>GPB (Google Protocol Buffers, compact binary) ya JSON.</dd>
<dt>Dial-out</dt><dd>Switch collector tak connection shuru karta hai (switch par configure hota hai). Firewalls ke paar achha chalta hai aur collector restarts jhel leta hai.</dd>
<dt>Dial-in</dt><dd>Collector switch se connect karke subscribe karta hai, aam taur par gRPC par <b>gNMI Subscribe</b> se (switch par <code>feature grpc</code>).</dd>
</dl>
<pre class="code">feature telemetry
telemetry
  destination-group 1
    ip address 192.0.2.50 port 57500 protocol gRPC encoding GPB
  sensor-group 1
    data-source DME
    path sys/intf depth unbounded
  subscription 1
    dst-grp 1
    snsr-grp 1 sample-interval 10000</pre>
<pre class="out">LEAF1# show telemetry transport
Session Id   IP Address    Port    Encoding   Transport   Status
---------------------------------------------------------------------
<span class="hl">0            192.0.2.50    57500   GPB        gRPC        Connected</span></pre>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Dial-out versus dial-in telemetry">
<rect x="10" y="30" width="140" height="44" rx="8" fill="#bae6fd"/><text x="80" y="57" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="250" y="30" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="57" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<line x1="150" y1="52" x2="250" y2="52" stroke="#64748b" stroke-width="2"/><text x="200" y="44" text-anchor="middle" class="svg-accent" font-size="12">connect karta hai</text>
<text x="200" y="100" text-anchor="middle" class="svg-muted" font-size="13">Dial-out: switch session shuru karta hai</text>
<rect x="250" y="120" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">Collector</text>
<rect x="490" y="120" width="140" height="44" rx="8" fill="#bae6fd"/><text x="560" y="147" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<line x1="390" y1="142" x2="490" y2="142" stroke="#64748b" stroke-width="2"/><text x="440" y="134" text-anchor="middle" class="svg-accent" font-size="12">subscribe</text>
<text x="520" y="100" text-anchor="middle" class="svg-muted" font-size="13">Dial-in: collector shuru (gNMI)</text>
</svg><p class="cap">Dono models mein data switch se collector tak jaata hai; farak sirf itna hai ki connection kaunsi side kholti hai.</p></div>

<h3>Flow data: NetFlow aur sFlow</h3>
<p><b>NetFlow</b> (aur uska standard roop, IPFIX) har flow ka ek record banata hai: source aur destination address, ports, protocol, bytes aur packets. NX-OS par aap ek <b>record</b> (kya match aur collect karna hai), ek <b>exporter</b> (kahan bhejna hai) aur ek <b>monitor</b> (record plus exporter) define karte ho, phir monitor ko interface par lagate ho. Kuch Nexus platforms ko pehle NetFlow ke liye TCAM region chahiye. <b>sFlow</b> iski jagah N mein se 1 packet sample karta hai aur headers bhejta hai, jo hardware par halka hai aur high speed par traffic profiles ke liye achha hai.</p>
<pre class="code">feature netflow
flow exporter EXP1
  destination 192.0.2.60 use-vrf management
  transport udp 2055
  source mgmt0
  version 9
flow record REC1
  match ipv4 source address
  match ipv4 destination address
  match ip protocol
  match transport destination-port
  collect counter bytes
flow monitor MON1
  record REC1
  exporter EXP1
interface Ethernet1/5
  ip flow monitor MON1 input</pre>

<h3>Kis par alert karein</h3>
<p>Sab kuch collect karna aasaan hai; achhe alerts banana skill hai. Un cheezon par alert karo jinhe insaan chahiye, aise thresholds ke saath jo noise se bachayein:</p>
<ul>
<li><b>Redundancy khona</b>: uplink down, OSPF ya BGP neighbor down, vPC peer-link ya keepalive down, power supply ya fan fail.</li>
<li><b>Badhte errors</b>: kai intervals mein CRC ya input errors badhna (gandi optic ya kharab cable), output discards (congestion).</li>
<li><b>Capacity</b>: 15 minute tak link utilisation lagbhag 70 se 80% se upar, TCAM ya MAC/ARP table limit ke paas.</li>
<li><b>Control plane stress</b>: high CPU, CoPP drops badhna, MAC ka ports ke beech flap hona (shayad loop).</li>
<li><b>Security aur change</b>: failed logins, window ke bahar configuration changes (accounting log se).</li>
</ul>

<div class="eg"><p><b>Worked example: interval kyun matter karta hai.</b> Ek 100 Gbps uplink par har 5 minute mein 100% utilisation ka 30 second ka microburst hota hai, jabki average 20% hai. Har 300 second poll hone wala SNMP poore interval ka average nikaalta hai: 30 s 100% par plus 270 s lagbhag 11% par, yaani lagbhag 20%. Graph healthy dikhta hai. Har 10 second ki telemetry 100% par teen samples aur usi pal output discards dikhati hai, jo application team ki slow backups wali shikayat samjhata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Public community string ke saath SNMPv2c use karna. <code>use-vrf management</code> bhool jaana, taaki logs aur telemetry data plane se nikalne ki koshish karein. Clocks NTP se sync na hona, taaki alag switches ke events correlate na ho sakein. Raat 3 baje server ports ke har interface flap par alert karna, jo NOC ko alerts ignore karna sikha deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> SNMP UDP 161 par poll karta hai aur traps UDP 162 par jaate hain; syslog UDP 514 use karta hai; severity 0 sabse severe hai. Telemetry push-based hai; <b>dial-out</b> = switch shuru karta hai, <b>dial-in</b> = collector shuru karta hai (gNMI). NX-OS sample intervals milliseconds mein hain. NetFlow = record + exporter + monitor; sFlow = sampling.</p></div>

<div class="scn"><h4>Raat ka slow backup</h4><p>Har raat 01:00 se 02:00 ke beech backup team throughput girta dekhti thi. Leaf uplinks ke SNMP graphs 45% par peak karte the, isliye network team ne kaha network ki galti nahi hai. Engineer ne collector ke liye 10-second intervals par <code>sys/intf</code> ki dial-out telemetry enable ki aur output discard counters jode. Agli raat data ne line rate par baar baar 10-second bursts aur ek spine-facing port par hazaaron discards dikhaye, kyunki ECMP ne do bade backup flows ek hi link par hash kar diye the. Fix tha backup jobs ko zyada source ports par failana, jisne hashing badli, aur baad mein uplink capacity jodna.</p><p><b>Seekh:</b> averages bursts chhupa dete hain; high-resolution streaming telemetry wahi dikhati hai jo users asal mein mehsoos karte hain.</p></div>

<div class="iv"><p class="q">"SNMP se streaming telemetry par kyun jaayein, aur dial-in versus dial-out kya hai?"</p><p>Strong answer: SNMP polling pull-based hai, coarse (minutes mein), scale par CPU-heavy hai aur MIBs use karta hai; telemetry model-driven data (DME ya YANG paths) har kuch second ya change par push karti hai, gRPC par GPB ya JSON mein encoded. Dial-out: switch configured destination groups, sensor groups aur subscriptions ke saath collector se connect karta hai. Dial-in: collector connect karke gNMI se subscribe karta hai. Microburst example do aur <code>show telemetry transport</code> se verification batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP (poll, traps), syslog (events), telemetry (streamed state) aur flow data (baatcheet) alag sawaalon ke jawab dete hain.</li>
<li>SNMPv3 use karo aur logs aur telemetry management VRF se bhejo; NTP sync rakho.</li>
<li>NX-OS telemetry: destination-group, sensor-group (path), subscription (ms mein sample interval).</li>
<li>Dial-out: switch connect karta hai; dial-in: collector gNMI se subscribe karta hai.</li>
<li>Redundancy khone, badhte errors, capacity, control-plane stress aur unexpected changes par alert karo.</li>
</ul></div>
`}};export{e as default};