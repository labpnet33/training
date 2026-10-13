var e={id:`why-we-monitor`,h:{en:`Why we monitor: seeing the network before users call`,hi:`Hum monitor kyun karte hain: users ke call karne se pehle network ko dekhna`},body:{en:`
<h3>What you will learn</h3>
<p>This track makes you a Network Observability Engineer: a person who can see what a network is doing, prove it with evidence and fix it before the business shouts. In this first module you learn the big picture, the vocabulary and your first two hands-on tasks. By the end of this chapter you can explain why monitoring exists, what an NMS is, and what the company you will work for looks like.</p>
<p><b>Prerequisites:</b> you know what an IP address is, what a router and a switch do, and how to type a command on a router console (enable, configure terminal, show). Nothing about monitoring is assumed. We start from zero.</p>

<h3>An analogy: the hospital monitor</h3>
<p>A patient in an intensive care ward is wired to a screen. The screen shows heart rate, blood pressure and oxygen. Nurses do not wait for the patient to complain; they watch the numbers, know what is normal for this patient, and act when a number drifts. A network is the same patient. The routers, switches and servers are the organs, and monitoring is the screen at the nurses' desk. <b>Observability</b> goes one step further: it is having enough data from the patient that you can ask a new question ("why is the heartbeat irregular only at night?") and still answer it, without cutting anything open.</p>

<h3>The problem monitoring solves</h3>
<p>Without monitoring, the first alarm is a phone call from an angry user: "the ERP is slow". You then start guessing. With monitoring, you see the Kochi link filling up at 09:40, you see the router CPU rising, and you fix it at 09:45, before anyone calls. Monitoring gives you three things: <b>visibility</b> (what is happening now), <b>history</b> (what happened last Tuesday) and <b>evidence</b> (proof you can show a provider, an auditor or your manager).</p>

<h3>Meet Godavari Foods</h3>
<p>All labs in this track happen in one invented company, Godavari Foods, which makes and distributes packaged food. It has three cities, each with a server room:</p>
<ul>
<li><b>Hyderabad HQ (hyd):</b> core router R-HYD (hostname HYD-CORE-R1), switch SW-HYD, the ERP server, and the monitoring server called <b>NMS</b> or the console OBSERVER at 10.1.50.100.</li>
<li><b>Kochi branch (kch):</b> router R-KCH (KCH-EDGE-R2), a file server, a PC.</li>
<li><b>Lucknow branch (lko):</b> router R-LKO (LKO-EDGE-R3), a server, a PC.</li>
</ul>
<p>Priya Nair is the primary on-call engineer and Ravi Menon is the secondary. When a circuit such as BB-KCH-01 degrades, one of them gets the call. Your job is to make that call rare, early and useful.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Godavari Foods monitoring map">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">NMS / OBSERVER</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">10.1.50.100</text>
<rect x="250" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="13">R-HYD (HQ)</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="40" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="189" text-anchor="middle" class="svg-ink" font-size="13">R-KCH (Kochi)</text><text x="110" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2</text>
<rect x="460" y="170" width="140" height="44" rx="8" fill="#fde68a"/><text x="530" y="189" text-anchor="middle" class="svg-ink" font-size="13">R-LKO (Lucknow)</text><text x="530" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="154" x2="150" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="154" x2="490" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="400" y="92" class="svg-muted" font-size="12">logs, SNMP, flows arrive here</text>
</svg><p class="cap">One monitoring server at HQ collects data from every router.</p></div>

<h3>Words you must know</h3>
<dl class="terms">
<dt>NMS</dt><dd>Network Management System: the server that collects data from devices, stores it and shows it. In our labs the device called NMS also acts as the syslog collector, the SNMP manager and the trap receiver.</dd>
<dt>Monitoring</dt><dd>Watching known numbers and raising an alert when one crosses a limit. It answers "is it broken?".</dd>
<dt>Observability</dt><dd>Having rich enough data (metrics, logs, flows, traces) to explain <i>why</i> something is broken, even for a problem nobody predicted.</dd>
<dt>Agent</dt><dd>The small software on a device that answers questions and sends messages. A router's SNMP agent is built in.</dd>
<dt>Target</dt><dd>A device the console watches. Godavari has seven targets: three routers, one switch and three servers.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Kochi uses a 100 Mbps circuit. At 09:30 the traffic is 40 Mbps, at 09:40 it is 85 Mbps and at 09:45 it is 99 Mbps. A monitor that polls every 5 minutes records three points; a threshold of 90 percent fires at 09:45. Without monitoring you would learn about it when the ERP times out at 09:50. Five minutes of warning is the whole value of the tool.</p></div>

<h3>What this module teaches in practice</h3>
<p>Two labs belong to this module. In the CLI lab you configure a router to send its first <b>logs</b> to the NMS and answer one <b>SNMP get</b>. In the GUI lab you open the observability console, read the Overview page and find the one unhealthy target. Both labs are small on purpose: they prove the whole loop of data leaving a device, arriving at the NMS and being read by a human.</p>
<p><b>Scope boundary.</b> This track simulates SNMP v2c and v3 polling and traps, syslog, NetFlow and IPFIX export and collection, SPAN, IP SLA, and in the console: polling targets, dashboards, baselines, alert rules and routing, SLA probes, streaming-telemetry subscriptions, flow top talkers, a packet capture tool and an audit log. It does not simulate real MIB trees beyond the few objects we use, real encryption, real throughput, a real time-series database or any vendor product screens.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Thinking monitoring is only for outages; the best use is catching slow degradation. (2) Monitoring only routers and forgetting servers and the monitoring server itself. (3) Collecting data and never looking at it: a graph nobody reads is decoration.</p></div>
<div class="exam"><p><b>Exam trap.</b> Monitoring and observability are not the same word. Monitoring watches predefined signals and says "something is wrong"; observability lets you ask why. Expect a question that asks which one needs logs, flows and traces together.</p></div>

<div class="scn"><h4>The Monday the ERP crawled</h4><p>Godavari's Hyderabad ERP became slow every Monday at 10:00. Users blamed the application team; the application team blamed the network. With no graphs, nobody could prove anything for three weeks. After the NMS was set up, the first Monday showed the HQ uplink at 96 percent for twenty minutes, caused by a weekly report job copying files. The job was rescheduled to night time in one afternoon.</p><p><b>Lesson:</b> monitoring turns an argument into a graph.</p></div>

<div class="iv"><p class="q">"What is the difference between monitoring and observability?"</p><p>Strong answer: monitoring checks known signals against limits and tells you that something is wrong; observability means you collect enough varied data (metrics, logs, flows, traces) to find out why, including for failures nobody predicted. Give one example: a CPU alarm is monitoring; correlating that CPU rise with a flow showing a backup job is observability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring gives visibility, history and evidence, so you act before users call.</li>
<li>Observability means having enough data to explain why, not only that.</li>
<li>The NMS collects data from agents on devices; Godavari has seven targets in three cities.</li>
<li>The NMS lives at 10.1.50.100 in Hyderabad; the routers use loopbacks 10.255.0.1, .2 and .3.</li>
<li>This track is simulated; know what is and is not simulated.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Yeh track aapko Network Observability Engineer banata hai: aisa insaan jo dekh sake ki network kya kar raha hai, evidence se prove kar sake aur business ke chillane se pehle fix kar de. Is pehle module mein aap big picture, vocabulary aur apne pehle do hands-on tasks seekhoge. Is chapter ke end tak aap bata sakoge ki monitoring kyun hoti hai, NMS kya hai, aur jis company mein aap kaam karoge woh kaisi dikhti hai.</p>
<p><b>Prerequisites:</b> aapko pata ho IP address kya hai, router aur switch kya karte hain, aur router console par command kaise type karte hain (enable, configure terminal, show). Monitoring ke baare mein kuch bhi pehle se nahi maana gaya. Hum zero se shuru karte hain.</p>

<h3>Ek analogy: hospital ka monitor</h3>
<p>Intensive care mein patient ek screen se juda hota hai. Screen heart rate, blood pressure aur oxygen dikhati hai. Nurses patient ke shikayat karne ka intezaar nahi karti; woh numbers dekhti hain, jaanti hain is patient ke liye normal kya hai, aur number drift kare to action leti hain. Network bhi wahi patient hai. Routers, switches aur servers uske organs hain, aur monitoring nurses ke desk par rakhi screen hai. <b>Observability</b> ek kadam aage jaati hai: patient se itna data hona ki aap naya sawaal ("heartbeat sirf raat ko irregular kyun hai?") pooch sako aur bina kuch kaate jawab de sako.</p>

<h3>Monitoring kaunsi problem solve karti hai</h3>
<p>Monitoring ke bina pehla alarm ek gusse wale user ka phone call hota hai: "ERP slow hai". Phir aap andaze lagana shuru karte ho. Monitoring ke saath aap 09:40 par Kochi link ko bharte dekhte ho, router CPU ko badhte dekhte ho, aur 09:45 par fix kar dete ho, kisi ke call karne se pehle. Monitoring teen cheezein deti hai: <b>visibility</b> (abhi kya ho raha hai), <b>history</b> (pichhle Tuesday kya hua) aur <b>evidence</b> (proof jo aap provider, auditor ya manager ko dikha sako).</p>

<h3>Godavari Foods se milo</h3>
<p>Is track ke saare labs ek invented company Godavari Foods mein hote hain, jo packaged food banati aur bechti hai. Iske teen shehar hain, har ek mein server room:</p>
<ul>
<li><b>Hyderabad HQ (hyd):</b> core router R-HYD (hostname HYD-CORE-R1), switch SW-HYD, ERP server, aur monitoring server jise <b>NMS</b> ya console OBSERVER kehte hain, 10.1.50.100 par.</li>
<li><b>Kochi branch (kch):</b> router R-KCH (KCH-EDGE-R2), ek file server, ek PC.</li>
<li><b>Lucknow branch (lko):</b> router R-LKO (LKO-EDGE-R3), ek server, ek PC.</li>
</ul>
<p>Priya Nair primary on-call engineer hai aur Ravi Menon secondary. Jab BB-KCH-01 jaisa circuit degrade hota hai, in dono mein se kisi ko call jaata hai. Aapka kaam hai us call ko rare, early aur useful banana.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Godavari Foods monitoring map">
<rect x="250" y="20" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="39" text-anchor="middle" class="svg-ink" font-size="13">NMS / OBSERVER</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="12">10.1.50.100</text>
<rect x="250" y="110" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="129" text-anchor="middle" class="svg-ink" font-size="13">R-HYD (HQ)</text><text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.1</text>
<rect x="40" y="170" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="110" y="189" text-anchor="middle" class="svg-ink" font-size="13">R-KCH (Kochi)</text><text x="110" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.2</text>
<rect x="460" y="170" width="140" height="44" rx="8" fill="#fde68a"/><text x="530" y="189" text-anchor="middle" class="svg-ink" font-size="13">R-LKO (Lucknow)</text><text x="530" y="205" text-anchor="middle" class="svg-muted" font-size="12">10.255.0.3</text>
<line x1="320" y1="64" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="270" y1="154" x2="150" y2="170" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="154" x2="490" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="400" y="92" class="svg-muted" font-size="12">logs, SNMP, flows yahan aate hain</text>
</svg><p class="cap">HQ ka ek monitoring server har router se data collect karta hai.</p></div>

<h3>Words jo aapko aane chahiye</h3>
<dl class="terms">
<dt>NMS</dt><dd>Network Management System: woh server jo devices se data collect karta hai, store karta hai aur dikhata hai. Hamare labs mein NMS device syslog collector, SNMP manager aur trap receiver bhi hai.</dd>
<dt>Monitoring</dt><dd>Jaane-pehchane numbers ko dekhna aur koi number limit cross kare to alert dena. Yeh "kya kuch toota hai?" ka jawab deti hai.</dd>
<dt>Observability</dt><dd>Itna rich data (metrics, logs, flows, traces) hona ki aap <i>kyun</i> toota yeh samjha sako, un failures ke liye bhi jinki kisi ne prediction nahi ki thi.</dd>
<dt>Agent</dt><dd>Device par chhota software jo sawaalon ka jawab deta hai aur messages bhejta hai. Router ka SNMP agent built-in hota hai.</dd>
<dt>Target</dt><dd>Woh device jise console watch karta hai. Godavari ke saat targets hain: teen routers, ek switch aur teen servers.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Kochi 100 Mbps circuit use karta hai. 09:30 par traffic 40 Mbps hai, 09:40 par 85 Mbps aur 09:45 par 99 Mbps. Jo monitor har 5 minute poll karta hai woh teen points record karta hai; 90 percent ka threshold 09:45 par fire hota hai. Monitoring ke bina aapko tab pata chalta jab ERP 09:50 par time out hota. Paanch minute ki warning hi tool ki poori value hai.</p></div>

<h3>Is module mein practically kya seekhoge</h3>
<p>Is module ke do labs hain. CLI lab mein aap router ko configure karte ho ki woh apne pehle <b>logs</b> NMS ko bheje aur ek <b>SNMP get</b> ka jawab de. GUI lab mein aap observability console kholte ho, Overview page padhte ho aur ek unhealthy target dhoondhte ho. Dono labs jaan-boojhkar chhote hain: yeh poora loop prove karte hain jisme data device se nikalta hai, NMS tak pahunchta hai aur insaan use padhta hai.</p>
<p><b>Scope boundary.</b> Is track mein SNMP v2c aur v3 polling aur traps, syslog, NetFlow aur IPFIX export aur collection, SPAN, IP SLA, aur console mein: polling targets, dashboards, baselines, alert rules aur routing, SLA probes, streaming-telemetry subscriptions, flow top talkers, ek packet capture tool aur audit log simulate hote hain. Jo simulate nahi hota: hamare few objects ke aage real MIB trees, real encryption, real throughput, real time-series database ya koi vendor product screens.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Yeh sochna ki monitoring sirf outages ke liye hai; sabse achha use slow degradation pakadna hai. (2) Sirf routers monitor karna aur servers aur monitoring server ko bhool jaana. (3) Data collect karna aur use kabhi na dekhna: jis graph ko koi nahi padhta woh sirf decoration hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Monitoring aur observability ek hi word nahi hain. Monitoring predefined signals dekhti hai aur kehti hai "kuch galat hai"; observability aapko why poochne deti hai. Aisa sawaal aayega jo poochega ki logs, flows aur traces ek saath kiske liye chahiye.</p></div>

<div class="scn"><h4>Woh Monday jab ERP rengne laga</h4><p>Godavari ka Hyderabad ERP har Monday 10:00 baje slow ho jaata tha. Users application team ko blame karte, application team network ko. Graphs na hone se teen hafte tak kisi ne kuch prove nahi kiya. NMS lagne ke baad pehle Monday ne dikhaya ki HQ uplink bees minute ke liye 96 percent par tha, ek weekly report job files copy kar raha tha. Job ko raat mein shift kar diya gaya, ek hi dopahar mein.</p><p><b>Seekh:</b> monitoring behas ko graph mein badal deti hai.</p></div>

<div class="iv"><p class="q">"Monitoring aur observability mein kya difference hai?"</p><p>Strong answer: monitoring known signals ko limits se check karti hai aur batati hai ki kuch galat hai; observability ka matlab hai ki aap itna varied data (metrics, logs, flows, traces) collect karte ho ki kyun galat hai yeh dhoondh sako, un failures ke liye bhi jinki kisi ne prediction nahi ki. Ek example do: CPU alarm monitoring hai; us CPU rise ko backup job dikhane wale flow se correlate karna observability hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitoring visibility, history aur evidence deti hai, taaki users ke call karne se pehle action lo.</li>
<li>Observability ka matlab hai itna data ki sirf "kya" nahi, "kyun" bhi samjha sako.</li>
<li>NMS devices ke agents se data collect karta hai; Godavari ke teen shehron mein saat targets hain.</li>
<li>NMS Hyderabad mein 10.1.50.100 par hai; routers ke loopbacks 10.255.0.1, .2 aur .3 hain.</li>
<li>Yeh track simulated hai; jaano ki kya simulate hota hai aur kya nahi.</li>
</ul></div>
`}};export{e as default};