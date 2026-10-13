var e={id:`assurance-health`,h:{en:`Assurance: telemetry and health scores`,hi:`Assurance: telemetry aur health scores`},body:{en:`
<p>A hospital ward does not wait for a patient to say "I feel bad". Monitors track heart rate, oxygen and blood pressure all the time, a nurse's station shows every bed as green, amber or red, and an alarm fires when a number crosses a threshold. <b>Assurance</b> is that ward monitor for the network. It answers one question continuously: <i>is the network delivering what I intended, and if not, why?</i></p>

<h3>Where the data comes from</h3>
<p>Assurance is only as good as its telemetry. Catalyst Center collects from many sources and correlates them:</p>
<ul><li><b>SNMP polling</b> and <b>CLI</b> collection — interface state, counters, CPU, memory, neighbours.</li>
<li><b>Syslog</b> and <b>SNMP traps</b> — events such as link down, OSPF adjacency change, err-disable.</li>
<li><b>Model-driven streaming telemetry</b> — IOS XE pushes YANG-modelled data on change or on a timer, faster and cheaper than polling.</li>
<li><b>NetFlow / AVC (NBAR)</b> — which applications are used, with throughput, latency, jitter and loss.</li>
<li><b>Wireless controllers and APs</b> — RF data, client onboarding steps, roaming.</li>
<li><b>ISE, DHCP, DNS and AAA</b> — identity and onboarding context for each client.</li></ul>
<p>This is why site assignment with device controllability matters: it configures the telemetry destinations on the devices.</p>

<h3>Device health: a score from 1 to 10</h3>
<p>Each network device gets a <b>health score from 1 to 10</b> built from KPIs: reachability, interface availability and errors, link utilisation, routing adjacencies, CPU and memory, and for wireless, radio metrics. The overall device score is driven by its <b>worst</b> KPI (the minimum), because one broken thing is what users feel. Bands:</p>
<table class="cmp"><tr><th>Score</th><th>Category</th><th>Colour</th></tr>
<tr><td>8–10</td><td><b>Good</b></td><td>Green</td></tr>
<tr><td>4–7</td><td><b>Fair</b></td><td>Orange</td></tr>
<tr><td>1–3</td><td><b>Poor</b></td><td>Red</td></tr>
<tr><td>0 / no data</td><td>Unmonitored or no data</td><td>Grey</td></tr></table>
<p><b>Overall network health</b> is a <b>percentage</b>: the share of monitored devices in the Good band. It is not an average of scores.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Health scores roll-up">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">DSW1 1/10</text><text x="65" y="57" text-anchor="middle" class="svg-muted" font-size="12">Poor</text>
<rect x="130" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="185" y="40" text-anchor="middle" class="svg-ink" font-size="13">ASW1 3/10</text><text x="185" y="57" text-anchor="middle" class="svg-muted" font-size="12">Poor</text>
<rect x="250" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="13">ASW2 8/10</text><text x="305" y="57" text-anchor="middle" class="svg-muted" font-size="12">Good</text>
<rect x="400" y="20" width="230" height="46" rx="8" fill="#fde68a"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="13">Network health 33%</text><text x="515" y="57" text-anchor="middle" class="svg-muted" font-size="12">1 of 3 devices Good</text>
<line x1="360" y1="43" x2="400" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="170" height="46" rx="8" fill="#fed7aa"/><text x="95" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1 1/10</text><text x="95" y="147" text-anchor="middle" class="svg-muted" font-size="12">gateway unreachable</text>
<rect x="190" y="110" width="170" height="46" rx="8" fill="#fde68a"/><text x="275" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC2 6/10</text><text x="275" y="147" text-anchor="middle" class="svg-muted" font-size="12">DNS unreachable</text>
<rect x="400" y="110" width="230" height="46" rx="8" fill="#fed7aa"/><text x="515" y="130" text-anchor="middle" class="svg-ink" font-size="13">Client health 0%</text><text x="515" y="147" text-anchor="middle" class="svg-muted" font-size="12">0 of 2 clients Good</text>
<line x1="360" y1="133" x2="400" y2="133" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1 right after discovery: individual scores roll up into two percentages.</p></div>

<h3>Client and application health</h3>
<p><b>Client health</b> scores each wired and wireless endpoint. For wired clients it looks at the access link and onboarding (did it get an address, reach its gateway, resolve DNS); for wireless it adds association, authentication, DHCP and RF quality (RSSI, SNR). Client health is again the percentage of clients that are Good. <b>Application health</b> uses NetFlow/AVC to score business-relevant applications by throughput, latency, jitter and packet loss. The <b>Device 360</b> and <b>Client 360</b> pages show one device or one user's full story over time: KPIs, topology, events, issues, and which access port or AP they were on at 9:14 this morning.</p>

<h3>Reading health in the lab</h3>
<p>The lab <b>Dashboard</b> shows the <b>Network health</b> and <b>Client health</b> donuts, <b>Open issues</b> by priority, <b>Device health</b> cards, a <b>Health trend</b> line and the <b>Event timeline</b>. The <b>Assurance</b> page has three tabs: <b>Network</b> (a card per device with KPIs Reachability, Interfaces, Adjacencies, Max util., Errors, NTP), <b>Clients</b> (IP, Gateway, DNS, Connected to, Health, and a <b>Trace</b> link) and <b>Event timeline</b>.</p>
<pre class="code">CTRL&gt; center health</pre>
<pre class="out"><span class="hl">Overall network health : 33%  (1 of 3 devices healthy)</span>
Client health          : 0%  (0 of 2 clients healthy)
Open issues            : P1 2  P2 1  P3 1  P4 3

Device  Health  Category  Top issue
------  ------  --------  ------------------------------------------------------
DSW1    1/10    Poor      P1 OSPF adjacency down on Gi0/3 toward R1
ASW1    3/10    Poor      P2 Interface Gi0/3 is err-disabled (psecure-violation)
ASW2    8/10    Good      P4 No NTP source on ASW2</pre>
<pre class="code">CTRL&gt; center health DSW1</pre>
<pre class="out">Device DSW1  health 1/10 (Poor)
  Reachability      : Reachable
  Interfaces up     : 4/4 cabled
  <span class="hl">Routing adjacency : 0/1 up</span>
  NTP               : none</pre>

<div class="eg"><p><b>Worked example: the arithmetic.</b> Five managed devices score 10, 9, 7, 3 and 10. Good devices (8–10) are three of five, so network health is <b>60%</b>, not the average 7.8. In Lab 1 after all fixes, every device only has a P4 "No NTP source" issue, which caps each score at 8. Eight is still Good, so network health reads <b>100%</b> even though four informational issues are open; Lab 2's templates then clear those too and scores reach 10.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Treating a green dashboard as proof that users are happy: health checks reachability-style KPIs, and an ACL blocking one TCP port will not lower any score (Lab 2 teaches exactly this). Averaging device scores in your head instead of counting Good devices. Forgetting that unmonitored devices (not in inventory) are invisible to the percentage.</p></div>
<div class="exam"><p><b>Exam traps.</b> Device health is 1–10; Good 8–10, Fair 4–7, Poor 1–3. Overall network and client health are percentages of healthy members. The minimum KPI drives the device score. Health categories: network, client, application.</p></div>

<div class="scn"><h4>The 100% dashboard during an outage</h4><p>A university's dashboard showed 100% network health while the library complained that the e-journal portal would not load. Every switch was reachable and every interface up. The application health view showed the portal's latency at 900 ms from one building only; Client 360 for an affected student showed good onboarding. The cause was a WAN QoS policy dropping that traffic class during peak. Adjusting the application policy restored it.</p><p><b>Lesson:</b> device health says the roads exist; client and application health say whether the traffic actually arrives well.</p></div>

<div class="iv"><p class="q">"How is the Catalyst Center network health score calculated?"</p><p>Each device gets a 1–10 score driven by its worst KPI (reachability, interfaces, errors, utilisation, adjacencies, CPU/memory). Scores 8–10 are Good. Overall network health is the percentage of monitored devices that are Good. Give a quick example: 3 Good out of 5 is 60%. Add that client health works the same way for endpoints and that application health comes from NetFlow/AVC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assurance correlates SNMP, CLI, syslog, streaming telemetry, NetFlow, wireless and ISE data.</li>
<li>Device health 1–10, driven by the worst KPI; Good 8–10, Fair 4–7, Poor 1–3.</li>
<li>Network and client health are percentages of Good members, not averages.</li>
<li>Device 360 and Client 360 give the full story of one device or user over time.</li>
<li>A green dashboard does not prove an application works; trace with the real port.</li>
</ul></div>
`,hi:`
<p>Hospital ward patient ke "mujhe bura lag raha hai" bolne ka intezaar nahi karta. Monitors lagataar heart rate, oxygen aur blood pressure track karte hain, nurse station har bed ko green, amber ya red dikhata hai, aur koi number threshold cross kare to alarm bajta hai. <b>Assurance</b> network ke liye wahi ward monitor hai. Yeh lagataar ek sawaal ka jawab deta hai: <i>kya network wahi de raha hai jo maine chaha, aur agar nahi to kyun?</i></p>

<h3>Data kahan se aata hai</h3>
<p>Assurance utna hi accha hai jitni uski telemetry. Catalyst Center kai sources se collect karke unhe correlate karta hai:</p>
<ul><li><b>SNMP polling</b> aur <b>CLI</b> collection — interface state, counters, CPU, memory, neighbours.</li>
<li><b>Syslog</b> aur <b>SNMP traps</b> — link down, OSPF adjacency change, err-disable jaise events.</li>
<li><b>Model-driven streaming telemetry</b> — IOS XE YANG-modelled data change par ya timer par push karta hai, polling se tez aur sasta.</li>
<li><b>NetFlow / AVC (NBAR)</b> — kaunsi applications use ho rahi hain, throughput, latency, jitter aur loss ke saath.</li>
<li><b>Wireless controllers aur APs</b> — RF data, client onboarding steps, roaming.</li>
<li><b>ISE, DHCP, DNS aur AAA</b> — har client ka identity aur onboarding context.</li></ul>
<p>Isiliye device controllability ke saath site assignment matter karta hai: yeh devices par telemetry destinations configure karta hai.</p>

<h3>Device health: 1 se 10 tak ka score</h3>
<p>Har network device ko KPIs se bana <b>1 se 10 ka health score</b> milta hai: reachability, interface availability aur errors, link utilisation, routing adjacencies, CPU aur memory, aur wireless ke liye radio metrics. Device ka overall score uske <b>sabse kharab</b> KPI (minimum) se drive hota hai, kyunki users ko ek hi tooti cheez mehsoos hoti hai. Bands:</p>
<table class="cmp"><tr><th>Score</th><th>Category</th><th>Colour</th></tr>
<tr><td>8–10</td><td><b>Good</b></td><td>Green</td></tr>
<tr><td>4–7</td><td><b>Fair</b></td><td>Orange</td></tr>
<tr><td>1–3</td><td><b>Poor</b></td><td>Red</td></tr>
<tr><td>0 / data nahi</td><td>Unmonitored ya no data</td><td>Grey</td></tr></table>
<p><b>Overall network health</b> ek <b>percentage</b> hai: monitored devices mein se kitne Good band mein hain. Yeh scores ka average nahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Health scores roll-up">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="40" text-anchor="middle" class="svg-ink" font-size="13">DSW1 1/10</text><text x="65" y="57" text-anchor="middle" class="svg-muted" font-size="12">Poor</text>
<rect x="130" y="20" width="110" height="46" rx="8" fill="#fed7aa"/><text x="185" y="40" text-anchor="middle" class="svg-ink" font-size="13">ASW1 3/10</text><text x="185" y="57" text-anchor="middle" class="svg-muted" font-size="12">Poor</text>
<rect x="250" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="305" y="40" text-anchor="middle" class="svg-ink" font-size="13">ASW2 8/10</text><text x="305" y="57" text-anchor="middle" class="svg-muted" font-size="12">Good</text>
<rect x="400" y="20" width="230" height="46" rx="8" fill="#fde68a"/><text x="515" y="40" text-anchor="middle" class="svg-ink" font-size="13">Network health 33%</text><text x="515" y="57" text-anchor="middle" class="svg-muted" font-size="12">3 mein se 1 device Good</text>
<line x1="360" y1="43" x2="400" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="110" width="170" height="46" rx="8" fill="#fed7aa"/><text x="95" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC1 1/10</text><text x="95" y="147" text-anchor="middle" class="svg-muted" font-size="12">gateway unreachable</text>
<rect x="190" y="110" width="170" height="46" rx="8" fill="#fde68a"/><text x="275" y="130" text-anchor="middle" class="svg-ink" font-size="13">PC2 6/10</text><text x="275" y="147" text-anchor="middle" class="svg-muted" font-size="12">DNS unreachable</text>
<rect x="400" y="110" width="230" height="46" rx="8" fill="#fed7aa"/><text x="515" y="130" text-anchor="middle" class="svg-ink" font-size="13">Client health 0%</text><text x="515" y="147" text-anchor="middle" class="svg-muted" font-size="12">2 mein se 0 clients Good</text>
<line x1="360" y1="133" x2="400" y2="133" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1 discovery ke turant baad: alag-alag scores do percentages mein roll up hote hain.</p></div>

<h3>Client aur application health</h3>
<p><b>Client health</b> har wired aur wireless endpoint ko score karta hai. Wired clients ke liye yeh access link aur onboarding dekhta hai (address mila, gateway tak pahuncha, DNS resolve hua); wireless ke liye association, authentication, DHCP aur RF quality (RSSI, SNR) bhi jodta hai. Client health phir se Good clients ka percentage hai. <b>Application health</b> NetFlow/AVC use karke business-relevant applications ko throughput, latency, jitter aur packet loss se score karta hai. <b>Device 360</b> aur <b>Client 360</b> pages ek device ya ek user ki poori kahaani time ke saath dikhate hain: KPIs, topology, events, issues, aur aaj subah 9:14 par woh kaunse access port ya AP par tha.</p>

<h3>Lab mein health padhna</h3>
<p>Lab <b>Dashboard</b> <b>Network health</b> aur <b>Client health</b> donuts, priority ke hisaab se <b>Open issues</b>, <b>Device health</b> cards, <b>Health trend</b> line aur <b>Event timeline</b> dikhata hai. <b>Assurance</b> page mein teen tabs hain: <b>Network</b> (har device ka card KPIs Reachability, Interfaces, Adjacencies, Max util., Errors, NTP ke saath), <b>Clients</b> (IP, Gateway, DNS, Connected to, Health, aur ek <b>Trace</b> link) aur <b>Event timeline</b>.</p>
<pre class="code">CTRL&gt; center health</pre>
<pre class="out"><span class="hl">Overall network health : 33%  (1 of 3 devices healthy)</span>
Client health          : 0%  (0 of 2 clients healthy)
Open issues            : P1 2  P2 1  P3 1  P4 3

Device  Health  Category  Top issue
------  ------  --------  ------------------------------------------------------
DSW1    1/10    Poor      P1 OSPF adjacency down on Gi0/3 toward R1
ASW1    3/10    Poor      P2 Interface Gi0/3 is err-disabled (psecure-violation)
ASW2    8/10    Good      P4 No NTP source on ASW2</pre>
<pre class="code">CTRL&gt; center health DSW1</pre>
<pre class="out">Device DSW1  health 1/10 (Poor)
  Reachability      : Reachable
  Interfaces up     : 4/4 cabled
  <span class="hl">Routing adjacency : 0/1 up</span>
  NTP               : none</pre>

<div class="eg"><p><b>Worked example: hisaab.</b> Paanch managed devices ke scores 10, 9, 7, 3 aur 10 hain. Good devices (8–10) paanch mein se teen hain, to network health <b>60%</b> hai, average 7.8 nahi. Lab 1 mein saare fixes ke baad har device par sirf P4 "No NTP source" issue bachta hai, jo har score ko 8 par cap karta hai. Aath ab bhi Good hai, isliye char informational issues khule hone par bhi network health <b>100%</b> dikhata hai; Lab 2 ke templates unhe bhi hata dete hain aur scores 10 tak pahunchte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Green dashboard ko proof maan lena ki users khush hain: health reachability jaise KPIs check karta hai, aur ek TCP port block karne wala ACL koi score kam nahi karega (Lab 2 bilkul yahi sikhata hai). Good devices ginne ki jagah dimaag mein device scores ka average nikalna. Bhool jaana ki unmonitored devices (inventory mein nahi) percentage mein dikhte hi nahi.</p></div>
<div class="exam"><p><b>Exam traps.</b> Device health 1–10 hai; Good 8–10, Fair 4–7, Poor 1–3. Overall network aur client health healthy members ke percentages hain. Minimum KPI device score drive karta hai. Health categories: network, client, application.</p></div>

<div class="scn"><h4>Outage ke dauraan 100% dashboard</h4><p>Ek university ka dashboard 100% network health dikha raha tha jabki library shikayat kar rahi thi ki e-journal portal load nahi hota. Har switch reachable tha aur har interface up. Application health view ne portal ki latency sirf ek building se 900 ms dikhayi; affected student ka Client 360 accha onboarding dikha raha tha. Cause tha ek WAN QoS policy jo peak par us traffic class ko drop kar rahi thi. Application policy adjust karne se theek ho gaya.</p><p><b>Lesson:</b> device health batata hai ki sadkein hain; client aur application health batate hain ki traffic sach mein theek se pahunchta hai ya nahi.</p></div>

<div class="iv"><p class="q">"Catalyst Center ka network health score kaise calculate hota hai?"</p><p>Har device ko 1–10 score milta hai jo uske sabse kharab KPI (reachability, interfaces, errors, utilisation, adjacencies, CPU/memory) se drive hota hai. 8–10 Good hai. Overall network health monitored devices mein Good ka percentage hai. Chhota example do: 5 mein se 3 Good = 60%. Jodo ki client health endpoints ke liye same tarah kaam karta hai aur application health NetFlow/AVC se aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assurance SNMP, CLI, syslog, streaming telemetry, NetFlow, wireless aur ISE data correlate karta hai.</li>
<li>Device health 1–10, sabse kharab KPI se drive; Good 8–10, Fair 4–7, Poor 1–3.</li>
<li>Network aur client health Good members ke percentages hain, averages nahi.</li>
<li>Device 360 aur Client 360 ek device ya user ki poori kahaani time ke saath dete hain.</li>
<li>Green dashboard prove nahi karta ki application chal rahi hai; asli port se trace karo.</li>
</ul></div>
`}};export{e as default};