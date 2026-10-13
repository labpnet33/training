var e={id:`monitoring-telemetry`,h:{en:`Monitoring and telemetry design: SNMP, streaming, flows, syslog and visibility`,hi:`Monitoring aur telemetry design: SNMP, streaming, flows, syslog aur visibility`},body:{en:`
<p>You cannot operate what you cannot see, and you cannot see everything at full resolution without paying for it. Monitoring design is the art of choosing <b>which data, at what rate, collected how, and stored where</b>. This chapter compares the main tools so you can justify each choice.</p>

<h3>The customer case: Brightwave Insurance</h3>
<p>Brightwave has 2 data centers, 60 branches, 1,200 network devices and 4,500 staff. Their monitoring is an SNMP poller with a 5-minute interval, and last quarter a payment-processing link suffered 40-second bursts of loss that never showed on any graph. The service desk also complains that "the app is slow" tickets take hours because nobody can tell whether the problem is the LAN, the WAN, the internet or the SaaS provider. Budget: USD 220,000. <b>Requirements:</b> see short bursts in the data center, know who is using the WAN, find where an internet or SaaS path breaks. <b>Constraints:</b> the existing collector server cannot handle 10 times more data; the security team wants flow records kept for 90 days; syslog during a recent outage reached 25,000 messages per second and the collector dropped most of it.</p>

<h3>Analogy: a car dashboard, a black box and a traffic camera</h3>
<p>SNMP polling is glancing at the dashboard every five minutes. Streaming telemetry is a flight recorder pushing readings every few seconds. NetFlow is the traffic camera noting who drove where. Syslog is the car shouting "engine warning" when something happens. Each answers a different question.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Telemetry sources and collectors">
<rect x="10" y="20" width="140" height="190" rx="10" fill="#bbf7d0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Network devices</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">Switches</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">Routers</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">Firewalls</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">Wireless</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="12">SNMP poller</text>
<rect x="260" y="74" width="130" height="44" rx="8" fill="#fed7aa"/><text x="325" y="101" text-anchor="middle" class="svg-ink" font-size="12">gNMI collector</text>
<rect x="260" y="128" width="130" height="44" rx="8" fill="#fde68a"/><text x="325" y="155" text-anchor="middle" class="svg-ink" font-size="12">Flow collector</text>
<rect x="260" y="182" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="325" y="209" text-anchor="middle" class="svg-ink" font-size="12">Syslog relay</text>
<rect x="500" y="60" width="130" height="110" rx="10" fill="#e2e8f0"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">Time-series</text><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">and log store</text>
<line x1="150" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="96" x2="260" y2="96" stroke="#64748b" stroke-width="2"/><line x1="150" y1="150" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="150" y1="204" x2="260" y2="204" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="96" x2="500" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="150" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="204" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="205" y="238" text-anchor="middle" class="svg-muted" font-size="12">pull or push</text>
</svg><p class="cap">Blue: pull (poll). Orange: push (stream). Yellow: flows. Purple: logs. Grey: storage.</p></div>

<h3>SNMP versus streaming telemetry</h3>
<table class="cmp"><tr><th>Aspect</th><th>SNMP</th><th>Model-driven streaming</th></tr>
<tr><td>Pattern</td><td>Collector polls (pull); traps and informs are events</td><td>Device pushes on a subscription</td></tr>
<tr><td>Resolution</td><td>Usually 1 to 5 minutes</td><td>Seconds, or on-change</td></tr>
<tr><td>Data format</td><td>MIB OIDs, ASN.1</td><td>YANG paths, encoded as protobuf or JSON</td></tr>
<tr><td>Load</td><td>Poller CPU and request-response overhead</td><td>Efficient binary stream; collector must keep up</td></tr>
<tr><td>Coverage</td><td>Almost every device ever made</td><td>Newer platforms and releases</td></tr>
</table>
<p>Streaming telemetry has two connection styles. In <b>dial-in</b> the collector opens a gNMI session and subscribes. In <b>dial-out</b> the device opens the connection to the collector, which works well through firewalls and NAT because only outbound traffic is needed. Subscriptions can be <b>periodic</b> (sample) or <b>on-change</b>. On-change is efficient for state such as interface up/down; periodic suits counters.</p>
<pre class="code"><span class="c">! IOS XE: dial-out YANG push subscription (sample)</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface
 stream yang-push
 update-policy periodic 1000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp</pre>
<pre class="out">Router# show telemetry ietf subscription 101 receiver
Receiver Details:
Address: 192.0.2.50  Port: 57500  Protocol: grpc-tcp
State: <span class="hl">Connected</span></pre>
<p>The update-policy period is in hundredths of a second, so 1000 means every 10 seconds.</p>

<h3>Flows, syslog and path visibility</h3>
<ul>
<li><b>NetFlow / IPFIX:</b> records of conversations (source, destination, ports, bytes), exported as Flexible NetFlow templates; IPFIX is the IETF standard based on NetFlow v9. Use <b>sampling</b> on high-speed links to control volume, and size retention by records per second times days.</li>
<li><b>Syslog:</b> severity 0 (emergency) to 7 (debug). Design for bursts: set a sensible trap level on devices, use regional relays that buffer, and prefer TCP or a reliable transport for critical logs. Never send debug level to the central collector.</li>
<li><b>ThousandEyes-style visibility:</b> agents (enterprise agents in your sites, cloud agents in provider locations, endpoint agents on laptops) run active tests and draw hop-by-hop path views across networks you do not own, showing where the internet or SaaS path degrades. Catalyst 9000 switches can host an agent as an application.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 400 switches with 48 ports, 2 counters per port: 38,400 values. Polled every 5 minutes that is 128 values per second. Polled every 30 seconds that is 1,280 per second, ten times the load on the poller. Streaming just the 20 critical uplinks per DC at 10 seconds adds only a few hundred records per second but shows a 40-second burst clearly.</p></div>

<h3>Chosen design for Brightwave</h3>
<p>Keep SNMP for inventory and long-term capacity trends at 5 minutes. Add gNMI dial-out streaming at 10-second intervals for DC leaf and spine uplinks and the payment path only. Add IPFIX with 1-in-100 sampling at WAN edges, stored 90 days on a separate flow collector. Put a syslog relay in each data center, buffering to disk, forwarding warnings and above. Deploy ThousandEyes enterprise agents at the two DCs and 5 key branches, with tests to the payment gateway and the SaaS ERP.</p>

<div class="warn"><p><b>Common mistake.</b> Streaming everything at the lowest interval "because we can". The collector, the network and the storage become the next outage.</p></div>
<div class="exam"><p><b>Exam trap.</b> Choose streaming telemetry for fine-grained, near-real-time data and SNMP for broad legacy coverage. Flow data tells you who and what, counters tell you how much, active tests tell you the user experience.</p></div>

<div class="scn"><h4>Post-mortem: the missing 40 seconds</h4><p>Brightwave's payment link lost packets in bursts every night at 22:00 during a batch job. A 5-minute SNMP average showed 30 percent utilisation. After 10-second streaming was enabled, the graph showed 98 percent saturation for 40 seconds. Flow records identified a backup server using the link. QoS and a rescheduled backup solved it.</p><p><b>Lesson:</b> averages hide bursts; choose the sampling interval from the problem you must detect.</p></div>

<div class="iv"><p class="q">"Why use streaming telemetry instead of SNMP polling?"</p><p>Streaming pushes data at high resolution and on change, uses structured YANG paths and is lighter on the device than frequent polls. I would still keep SNMP for broad inventory and older platforms. The real design question is capacity of the collector and storage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP is pull, broad and coarse; streaming is push, fine and model-driven.</li>
<li>Dial-out is firewall-friendly; on-change suits state, periodic suits counters.</li>
<li>NetFlow or IPFIX shows conversations; sample on fast links.</li>
<li>Design syslog for bursts with relays and sensible severity.</li>
<li>Active agents see paths beyond your network.</li>
</ul></div>
`,hi:`
<p>Jo aap dekh nahi sakte use operate nahi kar sakte, aur sab kuch full resolution par bina cost ke dekh bhi nahi sakte. Monitoring design ek art hai: <b>kaunsa data, kis rate par, kaise collect, aur kahan store</b>. Yeh chapter main tools compare karta hai taaki aap har choice ko justify kar sako.</p>

<h3>Customer case: Brightwave Insurance</h3>
<p>Brightwave ke 2 data centers, 60 branches, 1,200 network devices aur 4,500 staff hain. Unka monitoring 5-minute interval wala SNMP poller hai, aur pichhli quarter payment-processing link par 40-second ke loss bursts aaye jo kisi graph mein nahi dikhe. Service desk bhi shikayat karta hai ki "app slow hai" tickets mein ghante lagte hain kyunki koi nahi bata sakta ki problem LAN, WAN, internet ya SaaS provider mein hai. Budget: USD 220,000. <b>Requirements:</b> data center mein chhote bursts dekhna, WAN kaun use kar raha hai jaanna, internet ya SaaS path kahan tootta hai dhundhna. <b>Constraints:</b> maujooda collector server 10 guna data handle nahi kar sakta; security team flow records 90 din rakhna chahti hai; haal ke outage mein syslog 25,000 messages per second tak pahunch gaya aur collector ne zyada tar drop kar diye.</p>

<h3>Analogy: car dashboard, black box aur traffic camera</h3>
<p>SNMP polling har paanch minute mein dashboard par nazar daalna hai. Streaming telemetry flight recorder hai jo har kuch seconds mein readings push karta hai. NetFlow traffic camera hai jo note karta hai kaun kahan gaya. Syslog car ka "engine warning" chillana hai jab kuch hota hai. Har ek alag sawal ka jawab deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Telemetry sources and collectors">
<rect x="10" y="20" width="140" height="190" rx="10" fill="#bbf7d0"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="13">Network devices</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">Switches</text><text x="80" y="90" text-anchor="middle" class="svg-muted" font-size="12">Routers</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">Firewalls</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">Wireless</text>
<rect x="260" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="325" y="47" text-anchor="middle" class="svg-ink" font-size="12">SNMP poller</text>
<rect x="260" y="74" width="130" height="44" rx="8" fill="#fed7aa"/><text x="325" y="101" text-anchor="middle" class="svg-ink" font-size="12">gNMI collector</text>
<rect x="260" y="128" width="130" height="44" rx="8" fill="#fde68a"/><text x="325" y="155" text-anchor="middle" class="svg-ink" font-size="12">Flow collector</text>
<rect x="260" y="182" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="325" y="209" text-anchor="middle" class="svg-ink" font-size="12">Syslog relay</text>
<rect x="500" y="60" width="130" height="110" rx="10" fill="#e2e8f0"/><text x="565" y="105" text-anchor="middle" class="svg-ink" font-size="13">Time-series</text><text x="565" y="125" text-anchor="middle" class="svg-ink" font-size="13">aur log store</text>
<line x1="150" y1="42" x2="260" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="96" x2="260" y2="96" stroke="#64748b" stroke-width="2"/><line x1="150" y1="150" x2="260" y2="150" stroke="#64748b" stroke-width="2"/><line x1="150" y1="204" x2="260" y2="204" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="390" y1="96" x2="500" y2="105" stroke="#64748b" stroke-width="2"/><line x1="390" y1="150" x2="500" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="204" x2="500" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="205" y="238" text-anchor="middle" class="svg-muted" font-size="12">pull ya push</text>
</svg><p class="cap">Blue: pull (poll). Orange: push (stream). Yellow: flows. Purple: logs. Grey: storage.</p></div>

<h3>SNMP versus streaming telemetry</h3>
<table class="cmp"><tr><th>Aspect</th><th>SNMP</th><th>Model-driven streaming</th></tr>
<tr><td>Pattern</td><td>Collector poll karta hai (pull); traps aur informs events hain</td><td>Device subscription par push karta hai</td></tr>
<tr><td>Resolution</td><td>Aam taur par 1 se 5 minute</td><td>Seconds, ya on-change</td></tr>
<tr><td>Data format</td><td>MIB OIDs, ASN.1</td><td>YANG paths, protobuf ya JSON mein encoded</td></tr>
<tr><td>Load</td><td>Poller CPU aur request-response overhead</td><td>Efficient binary stream; collector ko saath dena padta hai</td></tr>
<tr><td>Coverage</td><td>Lagbhag har device</td><td>Naye platforms aur releases</td></tr>
</table>
<p>Streaming telemetry ke do connection styles hain. <b>Dial-in</b> mein collector gNMI session kholta hai aur subscribe karta hai. <b>Dial-out</b> mein device collector se connection kholta hai, jo firewalls aur NAT ke through achha chalta hai kyunki sirf outbound traffic chahiye. Subscriptions <b>periodic</b> (sample) ya <b>on-change</b> ho sakti hain. On-change interface up/down jaise state ke liye efficient hai; periodic counters ke liye theek hai.</p>
<pre class="code"><span class="c">! IOS XE: dial-out YANG push subscription (sample)</span>
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /interfaces-ios-xe-oper:interfaces/interface
 stream yang-push
 update-policy periodic 1000
 receiver ip address 192.0.2.50 57500 protocol grpc-tcp</pre>
<pre class="out">Router# show telemetry ietf subscription 101 receiver
Receiver Details:
Address: 192.0.2.50  Port: 57500  Protocol: grpc-tcp
State: <span class="hl">Connected</span></pre>
<p>Update-policy period centiseconds mein hota hai, isliye 1000 ka matlab har 10 seconds.</p>

<h3>Flows, syslog aur path visibility</h3>
<ul>
<li><b>NetFlow / IPFIX:</b> conversations ke records (source, destination, ports, bytes), Flexible NetFlow templates se export; IPFIX NetFlow v9 par based IETF standard hai. High-speed links par volume control karne ke liye <b>sampling</b> use karo, aur retention ko records per second guna days se size karo.</li>
<li><b>Syslog:</b> severity 0 (emergency) se 7 (debug). Bursts ke liye design karo: devices par sahi trap level, buffer karne wale regional relays, aur critical logs ke liye TCP ya reliable transport. Debug level kabhi central collector ko mat bhejo.</li>
<li><b>ThousandEyes-style visibility:</b> agents (aapki sites mein enterprise agents, provider locations mein cloud agents, laptops par endpoint agents) active tests chalate hain aur aise networks ka hop-by-hop path view banate hain jo aapke nahi hain, dikhate hain ki internet ya SaaS path kahan degrade hota hai. Catalyst 9000 switches agent ko application ke roop mein host kar sakte hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 400 switches, 48 ports, har port par 2 counters: 38,400 values. Har 5 minute poll karein to 128 values per second. Har 30 second poll karein to 1,280 per second, poller par das guna load. Har DC ke sirf 20 critical uplinks ko 10 seconds par stream karne se kuch sau records per second hi jude, aur 40-second burst saaf dikhta hai.</p></div>

<h3>Brightwave ke liye chosen design</h3>
<p>SNMP ko inventory aur long-term capacity trends ke liye 5 minute par rakho. Sirf DC leaf aur spine uplinks aur payment path ke liye 10-second intervals par gNMI dial-out streaming jodo. WAN edges par 1-in-100 sampling ke saath IPFIX jodo, alag flow collector par 90 din store. Har data center mein syslog relay lagao jo disk par buffer kare aur warnings aur upar forward kare. Do DCs aur 5 key branches mein ThousandEyes enterprise agents lagao, payment gateway aur SaaS ERP ke tests ke saath.</p>

<div class="warn"><p><b>Common mistake.</b> Sab kuch sabse chhote interval par stream kar dena "kyunki kar sakte hain". Collector, network aur storage agla outage ban jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Fine-grained, near-real-time data ke liye streaming telemetry chuno aur broad legacy coverage ke liye SNMP. Flow data batata hai kaun aur kya, counters batate hain kitna, active tests user experience batate hain.</p></div>

<div class="scn"><h4>Post-mortem: gayab 40 seconds</h4><p>Brightwave ki payment link har raat 22:00 par batch job ke dauraan bursts mein packets lose karti thi. 5-minute SNMP average 30 percent utilisation dikhata tha. 10-second streaming enable karne ke baad graph ne 40 seconds ke liye 98 percent saturation dikhaya. Flow records ne bataya ki ek backup server link use kar raha tha. QoS aur backup ka naya schedule karne se solve hua.</p><p><b>Seekh:</b> averages bursts chhupa dete hain; sampling interval us problem se chuno jo aapko detect karni hai.</p></div>

<div class="iv"><p class="q">"SNMP polling ke bajaye streaming telemetry kyun?"</p><p>Streaming high resolution aur on change data push karta hai, structured YANG paths use karta hai aur frequent polls se device par halka hai. Main phir bhi broad inventory aur purane platforms ke liye SNMP rakhta. Asli design sawal collector aur storage ki capacity hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP pull, broad aur coarse hai; streaming push, fine aur model-driven hai.</li>
<li>Dial-out firewall-friendly hai; on-change state ke liye, periodic counters ke liye.</li>
<li>NetFlow ya IPFIX conversations dikhata hai; fast links par sample karo.</li>
<li>Syslog ko relays aur sahi severity ke saath bursts ke liye design karo.</li>
<li>Active agents aapke network ke bahar ke paths dekhte hain.</li>
</ul></div>
`}};export{e as default};