var e={id:`aiops`,h:{en:`AIOps: event correlation, noise reduction, root cause and assurance`,hi:`AIOps: event correlation, noise reduction, root cause aur assurance`},body:{en:`
<p>When a water main bursts under a city road, the control room gets hundreds of calls: no water in building A, low pressure in street B, a flooded basement in C. A good control room does not send 300 plumbers. It sees that all calls come from one area downstream of one pipe, and sends one crew to that pipe. <b>AIOps</b> (AI for IT operations) is that control room for your network: it turns a flood of events into a few incidents, points at the probable root cause, and suggests what to do.</p>

<h3>The data AIOps eats</h3>
<ul>
<li><b>Syslog</b> messages and <b>SNMP</b> traps and polled counters (the ops-services module).</li>
<li><b>Streaming (model-driven) telemetry</b>: devices push structured data every few seconds instead of waiting to be polled.</li>
<li><b>NetFlow / IPFIX</b>: who talks to whom, how much.</li>
<li><b>Configuration and change records</b>: what changed, when, by whom.</li>
<li><b>Topology</b> (from CDP/LLDP, routing tables or a source of truth) and <b>tickets</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AIOps pipeline from data sources to action">
<rect x="10" y="20" width="120" height="160" rx="8" fill="#e2e8f0"/>
<text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">Sources</text>
<text x="70" y="75" text-anchor="middle" class="svg-muted" font-size="12">syslog, SNMP</text>
<text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">telemetry</text>
<text x="70" y="121" text-anchor="middle" class="svg-muted" font-size="12">flows, changes</text>
<text x="70" y="144" text-anchor="middle" class="svg-muted" font-size="12">topology, tickets</text>
<rect x="160" y="60" width="110" height="80" rx="8" fill="#bae6fd"/><text x="215" y="95" text-anchor="middle" class="svg-ink" font-size="13">Collect and</text><text x="215" y="113" text-anchor="middle" class="svg-ink" font-size="13">normalise</text>
<rect x="300" y="60" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="355" y="95" text-anchor="middle" class="svg-ink" font-size="13">Correlate</text><text x="355" y="113" text-anchor="middle" class="svg-ink" font-size="13">and dedupe</text>
<rect x="440" y="60" width="90" height="80" rx="8" fill="#fde68a"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="13">Root</text><text x="485" y="113" text-anchor="middle" class="svg-ink" font-size="13">cause</text>
<rect x="550" y="60" width="80" height="80" rx="8" fill="#bbf7d0"/><text x="590" y="95" text-anchor="middle" class="svg-ink" font-size="13">Human</text><text x="590" y="113" text-anchor="middle" class="svg-ink" font-size="13">or action</text>
<line x1="130" y1="100" x2="160" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="100" x2="550" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Thousands of events in, a handful of explained incidents out.</p></div>

<h3>Use case 1: noise reduction</h3>
<p><b>Alert fatigue</b> is what happens when engineers receive so many alerts that they stop reading them. Noise reduction cuts the volume with <b>deduplication</b> (the same message repeated 50 times becomes one alert with a count), <b>suppression</b> (known maintenance windows, flapping filters) and learned importance (this message type has never mattered on this device class).</p>

<h3>Use case 2: event correlation</h3>
<p>Correlation groups related events into one <b>incident</b>. It uses time (events within the same minute), topology (devices behind the same uplink) and learned patterns (these messages often appear together). Unsupervised clustering from chapter 2 is a common technique here.</p>

<h3>Use case 3: root cause analysis (RCA)</h3>
<p>Once events are grouped, the tool ranks the probable cause. <b>Topology-aware</b> RCA knows that if a distribution switch uplink is down, the 40 access switches behind it being unreachable are <i>symptoms</i>, not 40 separate problems. Good tools show their <b>evidence</b> (which events, which counters) and a confidence, so the engineer can check.</p>

<div class="eg"><p><b>Worked example.</b> A fibre to distribution switch DIST1 is cut at 02:14. Within two minutes the NOC receives: 2 interface-down and 2 line-protocol messages (both ends), 2 OSPF adjacency-down messages, 40 SNMP "unreachable" alarms for access switches, 210 wireless AP disconnect events and 58 automatic user-experience alerts: 314 events. The AIOps platform correlates them by time and topology into <b>one incident</b> with probable cause "DIST1 Gi1/0/1 down, physical layer". One engineer checks the optic and the fibre patch; the rest of the team sleeps. Mean time to detect (MTTD) and mean time to repair (MTTR) both drop.</p></div>

<pre class="out">*Sep 29 02:14:07.118: %LINK-3-UPDOWN: Interface GigabitEthernet1/0/1, changed state to down
*Sep 29 02:14:07.121: <span class="hl">%OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.2 on GigabitEthernet1/0/1 from FULL to DOWN, Neighbor Down: Interface down or detached</span>
*Sep 29 02:14:08.118: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet1/0/1, changed state to down</pre>
<p>These three lines on DIST1 are the real root-cause evidence; the other 311 events are consequences. An engineer should always be able to click from the incident down to lines like these.</p>

<h3>Use case 4: assurance platforms</h3>
<p><b>Assurance</b> means continuously checking that the network delivers the experience it should, not just that devices are up. Controller-based platforms (for example the assurance function in Cisco Catalyst Center, or cloud-managed dashboards) collect telemetry from devices, clients and applications, compute <b>health scores</b> for devices, clients and sites, run synthetic tests, show path traces, and raise issues with a plain-English description and suggested actions. Many now include a natural-language assistant so you can ask "why is the Pune site unhealthy?". At CCNA level you need the concept: assurance = telemetry + analytics + health scores + guided troubleshooting.</p>

<h3>Use case 5: guided and automated remediation</h3>
<p>The last step connects AIOps to automation: open a ticket with the evidence attached, run a diagnostic playbook, or, inside guardrails, apply a known safe fix. Chapters 8 and 10 cover how to let this happen safely.</p>

<div class="warn"><p><b>Common mistakes.</b> Feeding the platform incomplete topology, so it cannot tell cause from symptom. Letting suppression rules pile up until real alarms are hidden. Trusting a root-cause label without clicking through to the raw evidence. Unsynchronised clocks: without NTP, time-based correlation fails.</p></div>
<div class="exam"><p><b>Exam trap.</b> Event correlation reduces many events to one incident; it does not fix anything. Root cause analysis suggests a probable cause; a human or a guarded automation still acts. Streaming telemetry is pushed by the device; SNMP polling is pulled by the manager.</p></div>

<div class="scn"><h4>Correlation needs the clock</h4><p>A retailer's new AIOps platform kept producing separate incidents for what was obviously one WAN outage. Engineers found that half the branch routers had no NTP configured and their clocks were hours off, so events that happened together looked hours apart. After configuring NTP on every device with a common source and time zone, the next WAN outage appeared as one incident with the provider circuit as the probable cause.</p><p><b>Lesson:</b> AIOps is only as good as its data. Accurate timestamps (NTP), complete topology and clean logs come first.</p></div>

<div class="iv"><p class="q">"What is AIOps and what problem does it solve in a NOC?"</p><p>Strong answer: AIOps applies analytics and machine learning to operations data (syslog, SNMP, streaming telemetry, flows, changes, tickets) to reduce noise, correlate events into incidents, suggest root causes and support remediation. The problem is alert fatigue and slow triage: hundreds of symptoms hiding one cause. Give the fibre-cut example and mention MTTD and MTTR, plus prerequisites such as NTP and accurate topology.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AIOps applies analytics and ML to operations data: syslog, SNMP, telemetry, flows, changes, topology, tickets.</li>
<li>Noise reduction and correlation turn hundreds of events into a few incidents and fight alert fatigue.</li>
<li>Topology-aware RCA separates the cause from downstream symptoms; always check the evidence.</li>
<li>Assurance platforms combine telemetry, health scores and guided troubleshooting.</li>
<li>Clean data comes first: NTP, complete topology and consistent logging.</li>
</ul></div>
`,hi:`
<p>Jab sheher ki sadak ke neeche paani ki main pipe phat jaati hai, control room ko sainkdon calls aati hain: building A mein paani nahi, street B mein pressure kam, C mein basement mein paani. Achha control room 300 plumbers nahi bhejta. Woh dekhta hai ki saari calls ek pipe ke downstream wale ek area se aa rahi hain, aur us pipe par ek crew bhejta hai. <b>AIOps</b> (AI for IT operations) aapke network ke liye wahi control room hai: events ki baadh ko kuch incidents mein badalta hai, probable root cause ki taraf ishaara karta hai, aur batata hai kya karna hai.</p>

<h3>AIOps kaunsa data khaata hai</h3>
<ul>
<li><b>Syslog</b> messages aur <b>SNMP</b> traps aur polled counters (ops-services module).</li>
<li><b>Streaming (model-driven) telemetry</b>: devices poll hone ka wait karne ki jagah har kuch second mein structured data push karte hain.</li>
<li><b>NetFlow / IPFIX</b>: kaun kisse baat karta hai, kitna.</li>
<li><b>Configuration aur change records</b>: kya badla, kab, kisne.</li>
<li><b>Topology</b> (CDP/LLDP, routing tables ya source of truth se) aur <b>tickets</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Data sources se action tak AIOps pipeline">
<rect x="10" y="20" width="120" height="160" rx="8" fill="#e2e8f0"/>
<text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">Sources</text>
<text x="70" y="75" text-anchor="middle" class="svg-muted" font-size="12">syslog, SNMP</text>
<text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="12">telemetry</text>
<text x="70" y="121" text-anchor="middle" class="svg-muted" font-size="12">flows, changes</text>
<text x="70" y="144" text-anchor="middle" class="svg-muted" font-size="12">topology, tickets</text>
<rect x="160" y="60" width="110" height="80" rx="8" fill="#bae6fd"/><text x="215" y="95" text-anchor="middle" class="svg-ink" font-size="13">Collect aur</text><text x="215" y="113" text-anchor="middle" class="svg-ink" font-size="13">normalise</text>
<rect x="300" y="60" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="355" y="95" text-anchor="middle" class="svg-ink" font-size="13">Correlate</text><text x="355" y="113" text-anchor="middle" class="svg-ink" font-size="13">aur dedupe</text>
<rect x="440" y="60" width="90" height="80" rx="8" fill="#fde68a"/><text x="485" y="95" text-anchor="middle" class="svg-ink" font-size="13">Root</text><text x="485" y="113" text-anchor="middle" class="svg-ink" font-size="13">cause</text>
<rect x="550" y="60" width="80" height="80" rx="8" fill="#bbf7d0"/><text x="590" y="95" text-anchor="middle" class="svg-ink" font-size="13">Insaan</text><text x="590" y="113" text-anchor="middle" class="svg-ink" font-size="13">ya action</text>
<line x1="130" y1="100" x2="160" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="100" x2="550" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Hazaaron events andar, kuch explained incidents bahar.</p></div>

<h3>Use case 1: noise reduction</h3>
<p><b>Alert fatigue</b> tab hoti hai jab engineers ko itne alerts milte hain ki woh unhe padhna chhod dete hain. Noise reduction volume kam karta hai <b>deduplication</b> se (ek hi message 50 baar repeat ho to count ke saath ek alert ban jaata hai), <b>suppression</b> se (known maintenance windows, flapping filters) aur seekhi hui importance se (is message type ne is device class par kabhi matter nahi kiya).</p>

<h3>Use case 2: event correlation</h3>
<p>Correlation related events ko ek <b>incident</b> mein group karta hai. Yeh time (ek hi minute ke events), topology (ek hi uplink ke peeche wale devices) aur seekhe hue patterns (yeh messages aksar saath aate hain) use karta hai. Chapter 2 ka unsupervised clustering yahan common technique hai.</p>

<h3>Use case 3: root cause analysis (RCA)</h3>
<p>Events group hone ke baad tool probable cause ko rank karta hai. <b>Topology-aware</b> RCA jaanta hai ki agar distribution switch ka uplink down hai, to uske peeche ke 40 access switches ka unreachable hona <i>symptoms</i> hain, 40 alag problems nahi. Achhe tools apna <b>evidence</b> (kaunse events, kaunse counters) aur confidence dikhate hain, taaki engineer check kar sake.</p>

<div class="eg"><p><b>Worked example.</b> 02:14 par distribution switch DIST1 ka fibre kat jaata hai. Do minute ke andar NOC ko milte hain: 2 interface-down aur 2 line-protocol messages (dono ends), 2 OSPF adjacency-down messages, access switches ke liye 40 SNMP "unreachable" alarms, 210 wireless AP disconnect events aur 58 automatic user-experience alerts: 314 events. AIOps platform unhe time aur topology se <b>ek incident</b> mein correlate karta hai jiska probable cause hai "DIST1 Gi1/0/1 down, physical layer". Ek engineer optic aur fibre patch check karta hai; baaki team soti hai. Mean time to detect (MTTD) aur mean time to repair (MTTR) dono gir jaate hain.</p></div>

<pre class="out">*Sep 29 02:14:07.118: %LINK-3-UPDOWN: Interface GigabitEthernet1/0/1, changed state to down
*Sep 29 02:14:07.121: <span class="hl">%OSPF-5-ADJCHG: Process 1, Nbr 10.0.0.2 on GigabitEthernet1/0/1 from FULL to DOWN, Neighbor Down: Interface down or detached</span>
*Sep 29 02:14:08.118: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet1/0/1, changed state to down</pre>
<p>DIST1 par yeh teen lines asli root-cause evidence hain; baaki 311 events nateeje hain. Engineer ko hamesha incident se click karke aisi lines tak pahunch paana chahiye.</p>

<h3>Use case 4: assurance platforms</h3>
<p><b>Assurance</b> ka matlab hai lagataar check karna ki network woh experience de raha hai jo use dena chahiye, sirf yeh nahi ki devices up hain. Controller-based platforms (jaise Cisco Catalyst Center ka assurance function, ya cloud-managed dashboards) devices, clients aur applications se telemetry collect karte hain, devices, clients aur sites ke liye <b>health scores</b> compute karte hain, synthetic tests chalate hain, path traces dikhate hain, aur plain English description aur suggested actions ke saath issues raise karte hain. Kai ab natural-language assistant bhi dete hain taaki aap pooch sako "Pune site unhealthy kyun hai?". CCNA level par concept chahiye: assurance = telemetry + analytics + health scores + guided troubleshooting.</p>

<h3>Use case 5: guided aur automated remediation</h3>
<p>Aakhri step AIOps ko automation se jodta hai: evidence attach karke ticket kholna, diagnostic playbook chalana, ya guardrails ke andar known safe fix apply karna. Chapters 8 aur 10 batate hain ki yeh safely kaise hone dein.</p>

<div class="warn"><p><b>Common galtiyan.</b> Platform ko adhoori topology dena, jisse woh cause aur symptom mein farak nahi kar pata. Suppression rules itne jama hone dena ki asli alarms chhup jaayein. Raw evidence tak click kiye bina root-cause label par trust karna. Unsynchronised clocks: NTP ke bina time-based correlation fail hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Event correlation bahut events ko ek incident banata hai; kuch fix nahi karta. Root cause analysis probable cause suggest karta hai; act phir bhi insaan ya guarded automation karta hai. Streaming telemetry device push karta hai; SNMP polling manager pull karta hai.</p></div>

<div class="scn"><h4>Correlation ko clock chahiye</h4><p>Ek retailer ka naya AIOps platform ek hi WAN outage ke liye alag-alag incidents banata raha. Engineers ne dekha ki aadhe branch routers par NTP configured nahi tha aur unki clocks ghanton aage-peeche thi, isliye saath hue events ghanton door dikhte the. Har device par common source aur time zone ke saath NTP configure karne ke baad, agla WAN outage ek incident ki tarah dikha jiska probable cause provider circuit tha.</p><p><b>Seekh:</b> AIOps utna hi achha hai jitna uska data. Sahi timestamps (NTP), poori topology aur saaf logs pehle aate hain.</p></div>

<div class="iv"><p class="q">"AIOps kya hai aur NOC mein kaunsi problem solve karta hai?"</p><p>Strong answer: AIOps operations data (syslog, SNMP, streaming telemetry, flows, changes, tickets) par analytics aur machine learning lagata hai taaki noise kam ho, events incidents mein correlate hon, root causes suggest hon aur remediation support ho. Problem hai alert fatigue aur slow triage: sainkdon symptoms ek cause ko chhupa dete hain. Fibre-cut example do aur MTTD aur MTTR ka zikr karo, saath hi NTP aur accurate topology jaise prerequisites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AIOps operations data par analytics aur ML lagata hai: syslog, SNMP, telemetry, flows, changes, topology, tickets.</li>
<li>Noise reduction aur correlation sainkdon events ko kuch incidents mein badalte hain aur alert fatigue se ladte hain.</li>
<li>Topology-aware RCA cause ko downstream symptoms se alag karta hai; hamesha evidence check karo.</li>
<li>Assurance platforms telemetry, health scores aur guided troubleshooting ko jodte hain.</li>
<li>Saaf data pehle: NTP, poori topology aur consistent logging.</li>
</ul></div>
`}};export{e as default};