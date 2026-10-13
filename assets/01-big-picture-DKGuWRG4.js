var e={id:`big-picture`,h:{en:`Network assurance: the big picture`,hi:`Network assurance: big picture`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>How to think like a troubleshooter: pick the right tool for the question you are asking.</li>
<li>Extended <b>ping</b> and <b>traceroute</b> options: source, size, DF bit, repeat, timeouts and what every result code means.</li>
<li>How to run <b>debugs</b> safely on a production router, and how <b>conditional debugs</b> limit output to one interface or one IP address.</li>
<li><b>SNMP</b> v2c versus v3 at CCNP depth, and a recap of <b>syslog</b> severities and facilities.</li>
<li>Traditional <b>NetFlow</b> versus <b>Flexible NetFlow</b>: flow records, key and non-key fields, exporters, monitors and the flow cache; NetFlow v5, v9 and IPFIX.</li>
<li>Port mirroring with <b>SPAN</b>, <b>RSPAN</b> and <b>ERSPAN</b>, and their restrictions.</li>
<li><b>IP SLA</b> operations (icmp-echo, udp-jitter, HTTP), scheduling, the responder, and <b>object tracking</b> with static routes for dual-ISP failover.</li>
</ul>
<p>This module maps to ENCOR 350-401 v1.2 domain <b>4.0 Network Assurance</b>: 4.1 diagnose network problems with debugs, conditional debugs, traceroute, ping, SNMP and syslog; 4.2 configure and verify Flexible NetFlow; 4.3 configure SPAN/RSPAN/ERSPAN; 4.4 configure and verify IP SLA.</p>

<h3>Prerequisites</h3>
<p>You should already be comfortable with the CCNA material on syslog, SNMP and NTP (the CCNA operational services module), with packet captures in Wireshark (the CCNA capture module), with VLANs and trunks, and with static and floating static routes. GRE was covered in the ENCOR VRF and tunnels module; ERSPAN reuses it. We refer back to those modules instead of teaching them again.</p>

<h3>The analogy: a hospital, not a toolbox</h3>
<p>Think of a hospital. A patient walks in saying "I feel bad". A good doctor does not start with surgery. First the doctor reads the <b>patient history</b> (that is <b>syslog</b>: what happened, when, how severe). Then checks the <b>pulse</b> (a quick <b>ping</b>: alive or not). If something is wrong along the way, the doctor follows the blood vessel step by step (<b>traceroute</b>). For long-term care the patient wears a <b>heart monitor</b> that measures every few seconds and raises an alarm (<b>IP SLA</b> with tracking). A <b>blood test</b> shows what the body is consuming and in what amounts (<b>NetFlow</b>: who talks to whom, how much). A <b>CCTV camera</b> copy of the corridor shows exactly what passed by (<b>SPAN</b> to an analyser). The regular <b>ward round</b>, where a nurse asks each patient standard questions, is <b>SNMP</b> polling. And <b>exploratory surgery</b> is a <b>debug</b>: it shows everything inside, but it is risky, so you do it carefully, for a short time, on exactly the right spot.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Assurance tools by layer">
<rect x="20" y="20" width="190" height="220" rx="10" fill="#bae6fd"/>
<text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">Device health</text>
<text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="13">syslog (4.1)</text>
<text x="115" y="110" text-anchor="middle" class="svg-muted" font-size="13">SNMP (4.1)</text>
<text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="13">debug (4.1)</text>
<text x="115" y="170" text-anchor="middle" class="svg-muted" font-size="13">conditional debug</text>
<text x="115" y="220" text-anchor="middle" class="svg-accent" font-size="12">"what is the box doing?"</text>
<rect x="225" y="20" width="190" height="220" rx="10" fill="#bbf7d0"/>
<text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Path health</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="13">ping (4.1)</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="13">traceroute (4.1)</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="13">IP SLA (4.4)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="13">object tracking</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">"can A reach B, how well?"</text>
<rect x="430" y="20" width="190" height="220" rx="10" fill="#ddd6fe"/>
<text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">Traffic content</text>
<text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="13">NetFlow / FNF (4.2)</text>
<text x="525" y="110" text-anchor="middle" class="svg-muted" font-size="13">SPAN (4.3)</text>
<text x="525" y="140" text-anchor="middle" class="svg-muted" font-size="13">RSPAN (4.3)</text>
<text x="525" y="170" text-anchor="middle" class="svg-muted" font-size="13">ERSPAN (4.3)</text>
<text x="525" y="220" text-anchor="middle" class="svg-accent" font-size="12">"what is on the wire?"</text>
</svg><p class="cap">Every ENCOR assurance tool answers one of three questions. Pick the column first, then the tool.</p></div>

<h3>Reactive versus continuous tools</h3>
<p>Some tools are <b>reactive</b>: you run them when a problem is reported (ping, traceroute, debug, a SPAN capture). Others are <b>continuous</b>: they run all the time and build history (syslog, SNMP polling and traps, NetFlow export, IP SLA probes). Mature networks rely on continuous tools, so that when a user complains at 10:05 you can look at what the network was doing at 10:04 instead of waiting for the problem to happen again.</p>

<table class="cmp">
<tr><th>Tool</th><th>Question it answers</th><th>Cost / risk</th></tr>
<tr><td>ping, traceroute</td><td>Is the path up? Where does it break? What MTU fits?</td><td>Very low</td></tr>
<tr><td>syslog</td><td>What events happened, and how serious were they?</td><td>Low</td></tr>
<tr><td>SNMP</td><td>Counters and status over time; alerts via traps</td><td>Low</td></tr>
<tr><td>debug</td><td>Exactly what the control plane is doing right now</td><td>High (CPU)</td></tr>
<tr><td>NetFlow</td><td>Who talks to whom, which application, how much</td><td>Medium</td></tr>
<tr><td>SPAN family</td><td>Full packets for deep analysis or an IDS</td><td>Low on CPU, can drop copies</td></tr>
<tr><td>IP SLA</td><td>Continuous delay, jitter, loss; triggers failover</td><td>Low</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A user in the Chennai office says "the internet was down for ten minutes at 14:20". Syslog on EDGE shows no interface went down, so it was not a cable. The IP SLA statistics for the probe to 203.0.113.53 show 120 failures starting at 14:19:40. NetFlow shows that traffic kept leaving via ISP1 during those minutes. Conclusion in five minutes, without reproducing anything: ISP1 lost its upstream while the local link stayed up, and there was no tracking. That is exactly the IP SLA lab of this module.</p></div>

<h3>The four labs of this module</h3>
<ul>
<li><b>IP SLA with object tracking for dual-ISP failover</b>: EDGE, ISP1, ISP2 and CORE; probe 203.0.113.53 through ISP1 and move the default route to ISP2 when the probe fails.</li>
<li><b>Local SPAN</b>: SW1 mirrors SRV1 (Gi0/3, both directions) and PC1 (Gi0/1, rx) to SNIFFER on Gi0/7.</li>
<li><b>RSPAN</b>: SW1 sends copies over RSPAN VLAN 999 through SW2 to the ANALYZER on SW3.</li>
<li><b>ERSPAN</b>: SW1 wraps copies in GRE with ERSPAN ID 77 and routes them to R2 (192.0.2.50), which hands them to the IDS.</li>
</ul>
<p>Later modules build on this. Catalyst Center assurance collects the same syslog, SNMP, NetFlow and streaming data and correlates it for you, and Embedded Event Manager can react to a track object or a syslog message automatically.</p>

<div class="warn"><p><b>Common mistake.</b> Jumping straight to <code>debug all</code> or a heavy debug on a busy router because "it shows everything". It can push the CPU to 100% and take the device off the network. Start with the cheap tools and narrow the problem first.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint separates <i>diagnose</i> (4.1: debugs, conditional debugs, ping, traceroute, SNMP, syslog) from <i>configure and verify</i> (4.2 NetFlow, 4.3 SPAN, 4.4 IP SLA). Expect configuration and show-output questions for the last three, not just definitions.</p></div>

<div class="scn"><h4>The call-centre slowdown nobody could reproduce</h4><p>A call centre reported that the CRM application froze every afternoon for about a minute. Each time the network team arrived, everything worked. They enabled NetFlow export on the WAN router and a udp-jitter IP SLA to the data centre. Two days later the NetFlow data showed a backup job starting at 15:00 that consumed the whole link for 70 seconds, and IP SLA showed jitter jumping from 3 ms to 180 ms at the same moment. The backup was rescheduled and QoS was tuned.</p><p><b>Lesson:</b> continuous tools catch intermittent problems that reactive tools miss.</p></div>

<div class="iv"><p class="q">"How do you start troubleshooting a problem that a user reports as 'the network is slow'?"</p><p>A strong candidate asks clarifying questions first (who, what application, since when, always or intermittent), then uses cheap tools: syslog for events, SNMP graphs for utilisation and errors, ping and traceroute from the right source for the path, NetFlow for top talkers, IP SLA history for delay and jitter. Only then, if needed, a narrow conditional debug or a SPAN capture. Mention the risk of debugs and the value of baselines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 covers diagnosis tools (4.1), Flexible NetFlow (4.2), SPAN/RSPAN/ERSPAN (4.3) and IP SLA (4.4).</li>
<li>Ask which question you need answered: device health, path health or traffic content.</li>
<li>Continuous tools (syslog, SNMP, NetFlow, IP SLA) build history; reactive tools (ping, traceroute, debug, SPAN) look at now.</li>
<li>Debugs are the most powerful and the most dangerous tool; use them last and narrowly.</li>
<li>The labs cover IP SLA with tracking, local SPAN, RSPAN and ERSPAN.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>Troubleshooter ki tarah kaise sochna hai: jo sawaal aap pooch rahe ho uske liye sahi tool chunna.</li>
<li>Extended <b>ping</b> aur <b>traceroute</b> options: source, size, DF bit, repeat, timeouts aur har result code ka matlab.</li>
<li>Production router par <b>debugs</b> safely kaise chalayein, aur <b>conditional debugs</b> output ko ek interface ya ek IP address tak kaise simit karte hain.</li>
<li><b>SNMP</b> v2c versus v3 CCNP depth par, aur <b>syslog</b> severities aur facilities ka recap.</li>
<li>Traditional <b>NetFlow</b> versus <b>Flexible NetFlow</b>: flow records, key aur non-key fields, exporters, monitors aur flow cache; NetFlow v5, v9 aur IPFIX.</li>
<li><b>SPAN</b>, <b>RSPAN</b> aur <b>ERSPAN</b> se port mirroring, aur unki restrictions.</li>
<li><b>IP SLA</b> operations (icmp-echo, udp-jitter, HTTP), scheduling, responder, aur dual-ISP failover ke liye static routes ke saath <b>object tracking</b>.</li>
</ul>
<p>Yeh module ENCOR 350-401 v1.2 ke domain <b>4.0 Network Assurance</b> se map hota hai: 4.1 debugs, conditional debugs, traceroute, ping, SNMP aur syslog se network problems diagnose karna; 4.2 Flexible NetFlow configure aur verify karna; 4.3 SPAN/RSPAN/ERSPAN configure karna; 4.4 IP SLA configure aur verify karna.</p>

<h3>Prerequisites</h3>
<p>Aapko pehle se syslog, SNMP aur NTP ka CCNA material (CCNA operational services module), Wireshark mein packet captures (CCNA capture module), VLANs aur trunks, aur static aur floating static routes aane chahiye. GRE ENCOR ke VRF aur tunnels module mein cover hua tha; ERSPAN usi ko reuse karta hai. Hum un modules ko dobara padhane ki jagah unka reference denge.</p>

<h3>Analogy: toolbox nahi, ek hospital</h3>
<p>Ek hospital socho. Ek patient aakar kehta hai "mujhe theek nahi lag raha". Achha doctor surgery se shuru nahi karta. Pehle doctor <b>patient history</b> padhta hai (yeh <b>syslog</b> hai: kya hua, kab hua, kitna serious). Phir <b>pulse</b> check karta hai (ek quick <b>ping</b>: zinda hai ya nahi). Agar raaste mein kahin gadbad hai, doctor blood vessel ko step by step follow karta hai (<b>traceroute</b>). Lambe care ke liye patient ek <b>heart monitor</b> pehnta hai jo har kuch second mein measure karta hai aur alarm bajata hai (<b>IP SLA</b> tracking ke saath). <b>Blood test</b> dikhata hai ki body kya consume kar rahi hai aur kitna (<b>NetFlow</b>: kaun kisse baat karta hai, kitna). Corridor ki <b>CCTV camera</b> copy dikhati hai ki exactly kya guzra (<b>SPAN</b> analyser tak). Regular <b>ward round</b>, jahan nurse har patient se standard sawaal poochti hai, woh <b>SNMP</b> polling hai. Aur <b>exploratory surgery</b> ek <b>debug</b> hai: yeh andar ka sab kuch dikhati hai, par risky hai, isliye aap ise dhyan se, thodi der ke liye, bilkul sahi jagah par karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Assurance tools by layer">
<rect x="20" y="20" width="190" height="220" rx="10" fill="#bae6fd"/>
<text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">Device ki sehat</text>
<text x="115" y="80" text-anchor="middle" class="svg-muted" font-size="13">syslog (4.1)</text>
<text x="115" y="110" text-anchor="middle" class="svg-muted" font-size="13">SNMP (4.1)</text>
<text x="115" y="140" text-anchor="middle" class="svg-muted" font-size="13">debug (4.1)</text>
<text x="115" y="170" text-anchor="middle" class="svg-muted" font-size="13">conditional debug</text>
<text x="115" y="220" text-anchor="middle" class="svg-accent" font-size="12">"box kya kar raha hai?"</text>
<rect x="225" y="20" width="190" height="220" rx="10" fill="#bbf7d0"/>
<text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">Path ki sehat</text>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="13">ping (4.1)</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="13">traceroute (4.1)</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="13">IP SLA (4.4)</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="13">object tracking</text>
<text x="320" y="220" text-anchor="middle" class="svg-accent" font-size="12">"A se B, kitna achha?"</text>
<rect x="430" y="20" width="190" height="220" rx="10" fill="#ddd6fe"/>
<text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">Traffic content</text>
<text x="525" y="80" text-anchor="middle" class="svg-muted" font-size="13">NetFlow / FNF (4.2)</text>
<text x="525" y="110" text-anchor="middle" class="svg-muted" font-size="13">SPAN (4.3)</text>
<text x="525" y="140" text-anchor="middle" class="svg-muted" font-size="13">RSPAN (4.3)</text>
<text x="525" y="170" text-anchor="middle" class="svg-muted" font-size="13">ERSPAN (4.3)</text>
<text x="525" y="220" text-anchor="middle" class="svg-accent" font-size="12">"wire par kya hai?"</text>
</svg><p class="cap">Har ENCOR assurance tool teen sawaalon mein se ek ka jawab deta hai. Pehle column chuno, phir tool.</p></div>

<h3>Reactive versus continuous tools</h3>
<p>Kuch tools <b>reactive</b> hote hain: aap unhe tab chalate ho jab problem report hoti hai (ping, traceroute, debug, SPAN capture). Kuch <b>continuous</b> hote hain: yeh hamesha chalte hain aur history banate hain (syslog, SNMP polling aur traps, NetFlow export, IP SLA probes). Mature networks continuous tools par bharosa karte hain, taaki jab user 10:05 par complain kare to aap dekh sako ki network 10:04 par kya kar raha tha, bajaye problem ke dobara hone ka intezaar karne ke.</p>

<table class="cmp">
<tr><th>Tool</th><th>Kis sawaal ka jawab deta hai</th><th>Cost / risk</th></tr>
<tr><td>ping, traceroute</td><td>Path up hai? Kahan toot-ta hai? Kaunsa MTU fit hota hai?</td><td>Bahut kam</td></tr>
<tr><td>syslog</td><td>Kya events hue, aur kitne serious the?</td><td>Kam</td></tr>
<tr><td>SNMP</td><td>Time ke saath counters aur status; traps se alerts</td><td>Kam</td></tr>
<tr><td>debug</td><td>Control plane abhi exactly kya kar raha hai</td><td>Zyada (CPU)</td></tr>
<tr><td>NetFlow</td><td>Kaun kisse baat karta hai, kaunsi application, kitna</td><td>Medium</td></tr>
<tr><td>SPAN family</td><td>Deep analysis ya IDS ke liye poore packets</td><td>CPU par kam, copies drop ho sakti hain</td></tr>
<tr><td>IP SLA</td><td>Lagatar delay, jitter, loss; failover trigger karta hai</td><td>Kam</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Chennai office ka ek user kehta hai "14:20 par dus minute internet band tha". EDGE ka syslog dikhata hai ki koi interface down nahi hua, to cable ki problem nahi thi. 203.0.113.53 wale probe ki IP SLA statistics 14:19:40 se 120 failures dikhati hain. NetFlow dikhata hai ki un minutes mein traffic ISP1 se hi bahar jaata raha. Paanch minute mein conclusion, bina kuch reproduce kiye: ISP1 ka upstream gaya jabki local link up raha, aur tracking nahi thi. Yahi is module ki IP SLA lab hai.</p></div>

<h3>Is module ki chaar labs</h3>
<ul>
<li><b>Dual-ISP failover ke liye IP SLA aur object tracking</b>: EDGE, ISP1, ISP2 aur CORE; ISP1 ke through 203.0.113.53 ko probe karo aur probe fail hone par default route ISP2 par le jao.</li>
<li><b>Local SPAN</b>: SW1 SRV1 (Gi0/3, dono directions) aur PC1 (Gi0/1, rx) ko Gi0/7 par SNIFFER tak mirror karta hai.</li>
<li><b>RSPAN</b>: SW1 copies ko RSPAN VLAN 999 par SW2 ke through SW3 ke ANALYZER tak bhejta hai.</li>
<li><b>ERSPAN</b>: SW1 copies ko ERSPAN ID 77 ke saath GRE mein wrap karke R2 (192.0.2.50) tak route karta hai, jo unhe IDS ko de deta hai.</li>
</ul>
<p>Aage ke modules isi par banenge. Catalyst Center assurance yahi syslog, SNMP, NetFlow aur streaming data collect karke aapke liye correlate karta hai, aur Embedded Event Manager kisi track object ya syslog message par automatically react kar sakta hai.</p>

<div class="warn"><p><b>Common galti.</b> Busy router par seedha <code>debug all</code> ya koi heavy debug chala dena kyunki "yeh sab dikhata hai". Yeh CPU ko 100% tak le ja sakta hai aur device ko network se gira sakta hai. Sasti tools se shuru karo aur pehle problem ko narrow karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint <i>diagnose</i> (4.1: debugs, conditional debugs, ping, traceroute, SNMP, syslog) ko <i>configure aur verify</i> (4.2 NetFlow, 4.3 SPAN, 4.4 IP SLA) se alag rakhta hai. Aakhri teen ke liye sirf definitions nahi, configuration aur show-output questions expect karo.</p></div>

<div class="scn"><h4>Call-centre slowdown jo koi reproduce nahi kar paaya</h4><p>Ek call centre ne report kiya ki CRM application har dopahar lagbhag ek minute ke liye freeze hoti hai. Har baar network team pahunchti, sab theek chalta. Unhone WAN router par NetFlow export aur data centre ki taraf ek udp-jitter IP SLA enable kiya. Do din baad NetFlow data ne dikhaya ki 15:00 par ek backup job shuru hota hai jo 70 second tak poora link kha jaata hai, aur IP SLA ne dikhaya ki usi pal jitter 3 ms se 180 ms tak kood gaya. Backup reschedule hua aur QoS tune kiya gaya.</p><p><b>Seekh:</b> continuous tools woh intermittent problems pakadte hain jo reactive tools miss kar dete hain.</p></div>

<div class="iv"><p class="q">"Jab user 'network slow hai' report kare to aap troubleshooting kaise shuru karte ho?"</p><p>Strong candidate pehle clarifying sawaal poochta hai (kaun, kaunsi application, kab se, hamesha ya intermittent), phir saste tools use karta hai: events ke liye syslog, utilisation aur errors ke liye SNMP graphs, path ke liye sahi source se ping aur traceroute, top talkers ke liye NetFlow, delay aur jitter ke liye IP SLA history. Sirf uske baad, zaroorat ho to, ek narrow conditional debug ya SPAN capture. Debugs ka risk aur baselines ki value zaroor batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 mein diagnosis tools (4.1), Flexible NetFlow (4.2), SPAN/RSPAN/ERSPAN (4.3) aur IP SLA (4.4) aate hain.</li>
<li>Poocho ki aapko kis sawaal ka jawab chahiye: device health, path health ya traffic content.</li>
<li>Continuous tools (syslog, SNMP, NetFlow, IP SLA) history banate hain; reactive tools (ping, traceroute, debug, SPAN) abhi ko dekhte hain.</li>
<li>Debugs sabse powerful aur sabse khatarnak tool hain; inhe aakhir mein aur narrow tareeke se use karo.</li>
<li>Labs mein tracking ke saath IP SLA, local SPAN, RSPAN aur ERSPAN aate hain.</li>
</ul></div>
`}};export{e as default};