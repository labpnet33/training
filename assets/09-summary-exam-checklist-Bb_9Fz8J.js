var e={id:`summary-checklist`,h:{en:`Summary, capstone checklist and exam checklist`,hi:`Summary, capstone checklist aur exam checklist`},body:{en:`<h3>What you can now do</h3>
<p>You have reached the end of the Multicast and QoS Mastery track. In this module you learned to treat voice and video as a design problem with numbers, not as a feeling. The checklist below is your self-test: if you can do every item without looking back, you are ready for the module exam, the track exam and an interview on the topic.</p>
<div class="kt"><p><b>Can-do checklist</b></p><ul>
<li>Explain how a G.711 call becomes 50 packets per second of 200 bytes, and calculate 80 kbps at layer 3 and about 87 kbps on Ethernet.</li>
<li>State the targets for voice: 150 ms one-way delay, 30 ms jitter, 1 percent loss, and name the six parts of the delay budget.</li>
<li>Design an eight-class model and map it to DSCP: EF, AF41, CS3, CS6, AF21, AF11, CS1, default.</li>
<li>Place marking inbound at the trust boundary, queueing outbound at every bottleneck, in both directions and on the backup circuit.</li>
<li>Explain conditional trust, the voice VLAN and CoS to DSCP mapping at the access layer.</li>
<li>Size an LLQ from peak calls, keep priority under about 33 percent and guarantees under about 75 percent, and say why admission control is needed.</li>
<li>Prove a policy with classification, marking, queue and end-to-end tests, always under load.</li>
<li>Troubleshoot one-way audio by splitting the call into two flows and following the dead one hop by hop.</li>
<li>Troubleshoot poor quality: lost marking at the provider, small priority queue, policer on the wrong class, missing policy on the backup.</li></ul></div>
<h3>Capstone: the three-city design in one page</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three city design summary">
<rect x="20" y="20" width="170" height="90" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">Mumbai head office</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="12">PBX, video bridge</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="12">R-MUM, 100 Mbps</text>
<rect x="450" y="20" width="170" height="90" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="12">phones, video, PCs</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="12">R-PUN, 10 Mbps</text>
<rect x="450" y="140" width="170" height="90" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="535" y="164" text-anchor="middle" class="svg-ink" font-size="13">Delhi branch</text><text x="535" y="184" text-anchor="middle" class="svg-muted" font-size="12">phones, video, PCs</text><text x="535" y="202" text-anchor="middle" class="svg-muted" font-size="12">R-DEL, 10 Mbps</text>
<rect x="250" y="80" width="110" height="90" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="305" y="120" text-anchor="middle" class="svg-ink" font-size="13">MPLS (PE)</text><text x="305" y="138" text-anchor="middle" class="svg-muted" font-size="12">honours CS5</text>
<line x1="190" y1="65" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="110" x2="450" y2="65" stroke="#64748b" stroke-width="2"/><line x1="360" y1="140" x2="450" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Same MARK-IN and WAN-OUT policy on every router, both directions, backup too</text></svg><p class="cap">The design of module mq-voice in one picture.</p></div>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Codec</dt><dd>Converts sound to digital data and back; G.711 is 64 kbps, G.729 is 8 kbps.</dd>
<dt>RTP / RTCP</dt><dd>Real-time Transport Protocol numbers voice packets; RTCP reports loss and jitter.</dd>
<dt>Jitter buffer</dt><dd>Receiver memory that evens out arrival times at the price of extra delay.</dd>
<dt>MOS / R-factor</dt><dd>Estimated call-quality score from 1 to 5 / from 0 to 100 (E-model).</dd>
<dt>EF, AF41, CS3</dt><dd>DSCP 46 voice, 34 interactive video, 24 call signalling.</dd>
<dt>LLQ</dt><dd>Low Latency Queueing: strict priority queue, policed to its rate during congestion.</dd>
<dt>CAC</dt><dd>Call admission control: refuses a call when the bandwidth for its site is used up.</dd>
<dt>Trust boundary</dt><dd>The first device whose DSCP or CoS markings you believe.</dd>
<dt>Conditional trust</dt><dd>Trust on a switch port only while a phone is detected.</dd>
<dt>IP SLA</dt><dd>Router feature that sends synthetic traffic and measures delay, jitter, loss and MOS.</dd></dl>
<h3>The most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice packet</td><td>G.711, 20 ms: 160 bytes payload + 40 header = 200 bytes, 50 pps, 80 kbps layer 3</td></tr>
<tr><td>G.729</td><td>20 bytes payload, 60-byte packet, 24 kbps layer 3</td></tr>
<tr><td>Targets</td><td>one-way delay under 150 ms, jitter under 30 ms, loss under 1 percent</td></tr>
<tr><td>Markings</td><td>voice EF 46, interactive video AF41 34, signalling CS3 24, network control CS6 48</td></tr>
<tr><td>Priority limits</td><td>priority up to about 33 percent of the link; all guarantees up to about 75 percent</td></tr>
<tr><td>Priority policing</td><td>only during congestion; excess dropped; counter b/w exceed drops</td></tr>
<tr><td>Video queue</td><td>bandwidth class, not priority</td></tr>
<tr><td>CoS vs DSCP</td><td>CoS is in the 802.1Q tag and is lost at the router; DSCP stays</td></tr>
<tr><td>Where to apply</td><td>mark input at the trust boundary, queue output at the bottleneck</td></tr>
<tr><td>One-way audio</td><td>routing, ACL, NAT, asymmetric path; signalling can work while media fails</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show policy-map interface GigabitEthernet0/1 input   <span class="c">! marking counters</span>
show policy-map interface GigabitEthernet0/0 output  <span class="c">! queue, drops, b/w exceed drops</span>
clear counters                                      <span class="c">! start a clean test</span>
show access-lists FROM-WAN                           <span class="c">! ACL hit counters</span>
show ip route 10.1.0.0                               <span class="c">! next hop in use</span>
show ip sla statistics 10                            <span class="c">! delay, jitter, loss, MOS</span>
show mls qos interface GigabitEthernet1/0/5          <span class="c">! switch trust state</span>
traffic 10.1.0.10 udp/16500 800 20                   <span class="c">! lab host: a ten-call stream</span></pre>
<div class="warn"><p><b>Common mistake in exams.</b> Choosing "increase the priority queue" for every voice problem. If the DSCP never reaches the queue, a bigger queue changes nothing; if the call set-up fails, QoS is not the problem.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Voice is marked EF so it is protected end to end." Marking protects nothing without a queue that honours it at every congested hop, in both directions, on the backup path too.</p></div>
<div class="scn"><h4>Scenario: The go-live review</h4><p>Before the Delhi go-live, the change manager asked for evidence. The engineer attached four items: the class counters on the LAN input, a capture on both sides of the provider showing EF becoming CS5 and back, a load test with a 12 Mbps backup in which a ten-call stream and a video stream arrived with zero loss, and a second test with the primary circuit shut. The change was approved in five minutes.</p><p><b>Lesson:</b> Evidence in four layers ends discussions. It is also the best interview story you can tell.</p></div>
<div class="iv"><p class="q">"Walk me through a project where you made voice reliable across sites."</p><p>Use the structure of this module: the numbers (calls, codec, bandwidth), the design (classes, marking at the trust boundary, queues at the bottlenecks, provider mapping, both directions, backup), the verification under load and the monitoring you left behind (IP SLA). Finish with one problem you found and how you proved the fix.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Voice quality is arithmetic plus evidence: size from calls, prove with load.</li><li>One policy language everywhere, in both directions, on every circuit.</li><li>Mark at the edge, queue at the bottleneck, check the provider.</li><li>Reachability and quality problems have different methods: never mix them.</li><li>Next steps: take the track exam, then practise the Real Experience tickets for voice, WAN and mixed faults.</li></ul></div>`,hi:`<h3>Ab aap kya kar sakte ho</h3>
<p>Aap Multicast and QoS Mastery track ke ant tak pahunch gaye ho. Is module mein aapne voice aur video ko ehsaas ki jagah numbers wali design problem ki tarah dekhna seekha. Neeche ki checklist aapka self-test hai: agar aap har item peeche dekhe bina kar sakte ho to aap module exam, track exam aur is topic par interview ke liye taiyaar ho.</p>
<div class="kt"><p><b>Can-do checklist</b></p><ul>
<li>Samjhao ki G.711 call 200 bytes ke 50 packets per second kaise banti hai, aur layer 3 par 80 kbps aur Ethernet par lagbhag 87 kbps nikaalo.</li>
<li>Voice ke targets batao: 150 ms one-way delay, 30 ms jitter, 1 percent loss, aur delay budget ke chhe hisson ke naam lo.</li>
<li>Aath-class model design karo aur DSCP se map karo: EF, AF41, CS3, CS6, AF21, AF11, CS1, default.</li>
<li>Marking trust boundary par inbound, queueing har bottleneck par outbound, dono directions mein aur backup circuit par lagao.</li>
<li>Access layer par conditional trust, voice VLAN aur CoS se DSCP mapping samjhao.</li>
<li>Peak calls se LLQ ka size nikaalo, priority lagbhag 33 percent aur guarantees lagbhag 75 percent se neeche rakho, aur batao admission control kyun chahiye.</li>
<li>Policy ko classification, marking, queue aur end-to-end tests se sabit karo, hamesha load mein.</li>
<li>One-way audio ko call ko do flows mein baant kar aur marte flow ko hop by hop follow karke troubleshoot karo.</li>
<li>Kharab quality troubleshoot karo: provider par khoyi marking, chhoti priority queue, galat class par policer, backup par policy ka na hona.</li></ul></div>
<h3>Capstone: teen-shehar design ek page mein</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Teen shehar design summary">
<rect x="20" y="20" width="170" height="90" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="13">Mumbai head office</text><text x="105" y="64" text-anchor="middle" class="svg-muted" font-size="12">PBX, video bridge</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="12">R-MUM, 100 Mbps</text>
<rect x="450" y="20" width="170" height="90" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="13">Pune branch</text><text x="535" y="64" text-anchor="middle" class="svg-muted" font-size="12">phones, video, PCs</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="12">R-PUN, 10 Mbps</text>
<rect x="450" y="140" width="170" height="90" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="535" y="164" text-anchor="middle" class="svg-ink" font-size="13">Delhi branch</text><text x="535" y="184" text-anchor="middle" class="svg-muted" font-size="12">phones, video, PCs</text><text x="535" y="202" text-anchor="middle" class="svg-muted" font-size="12">R-DEL, 10 Mbps</text>
<rect x="250" y="80" width="110" height="90" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="305" y="120" text-anchor="middle" class="svg-ink" font-size="13">MPLS (PE)</text><text x="305" y="138" text-anchor="middle" class="svg-muted" font-size="12">CS5 maanta hai</text>
<line x1="190" y1="65" x2="250" y2="120" stroke="#64748b" stroke-width="2"/><line x1="360" y1="110" x2="450" y2="65" stroke="#64748b" stroke-width="2"/><line x1="360" y1="140" x2="450" y2="185" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">Har router par wahi MARK-IN aur WAN-OUT policy, dono directions, backup bhi</text></svg><p class="cap">Module mq-voice ka design ek tasveer mein.</p></div>
<h3>Mini glossary</h3>
<dl class="terms"><dt>Codec</dt><dd>Awaaz ko digital data mein badalta hai aur wapas; G.711 64 kbps hai, G.729 8 kbps.</dd>
<dt>RTP / RTCP</dt><dd>Real-time Transport Protocol voice packets ko number deta hai; RTCP loss aur jitter report karta hai.</dd>
<dt>Jitter buffer</dt><dd>Receiver ki memory jo extra delay ki keemat par pahunchne ke samay ko barabar karti hai.</dd>
<dt>MOS / R-factor</dt><dd>Call quality ka estimated score 1 se 5 / 0 se 100 (E-model).</dd>
<dt>EF, AF41, CS3</dt><dd>DSCP 46 voice, 34 interactive video, 24 call signalling.</dd>
<dt>LLQ</dt><dd>Low Latency Queueing: strict priority queue, congestion mein apne rate par police.</dd>
<dt>CAC</dt><dd>Call admission control: site ki bandwidth khatam hone par call mana karta hai.</dd>
<dt>Trust boundary</dt><dd>Pehla device jiski DSCP ya CoS markings par aap bharosa karte ho.</dd>
<dt>Conditional trust</dt><dd>Switch port par trust sirf tab jab phone detect ho.</dd>
<dt>IP SLA</dt><dd>Router feature jo synthetic traffic bhejta hai aur delay, jitter, loss aur MOS naapta hai.</dd></dl>
<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice packet</td><td>G.711, 20 ms: 160 bytes payload + 40 header = 200 bytes, 50 pps, layer 3 par 80 kbps</td></tr>
<tr><td>G.729</td><td>20 bytes payload, 60-byte packet, layer 3 par 24 kbps</td></tr>
<tr><td>Targets</td><td>one-way delay 150 ms se kam, jitter 30 ms se kam, loss 1 percent se kam</td></tr>
<tr><td>Markings</td><td>voice EF 46, interactive video AF41 34, signalling CS3 24, network control CS6 48</td></tr>
<tr><td>Priority limits</td><td>priority link ka lagbhag 33 percent tak; saari guarantees lagbhag 75 percent tak</td></tr>
<tr><td>Priority policing</td><td>sirf congestion mein; excess drop; counter b/w exceed drops</td></tr>
<tr><td>Video queue</td><td>bandwidth class, priority nahi</td></tr>
<tr><td>CoS vs DSCP</td><td>CoS 802.1Q tag mein hai aur router par kho jaata hai; DSCP rehta hai</td></tr>
<tr><td>Kahan lagayein</td><td>trust boundary par input mark, bottleneck par output queue</td></tr>
<tr><td>One-way audio</td><td>routing, ACL, NAT, asymmetric path; signalling chal sakti hai jabki media fail ho</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show policy-map interface GigabitEthernet0/1 input   <span class="c">! marking counters</span>
show policy-map interface GigabitEthernet0/0 output  <span class="c">! queue, drops, b/w exceed drops</span>
clear counters                                      <span class="c">! saaf test shuru karo</span>
show access-lists FROM-WAN                           <span class="c">! ACL hit counters</span>
show ip route 10.1.0.0                               <span class="c">! use mein next hop</span>
show ip sla statistics 10                            <span class="c">! delay, jitter, loss, MOS</span>
show mls qos interface GigabitEthernet1/0/5          <span class="c">! switch trust state</span>
traffic 10.1.0.10 udp/16500 800 20                   <span class="c">! lab host: das-call stream</span></pre>
<div class="warn"><p><b>Exam mein common mistake.</b> Har voice problem ke liye "priority queue badhao" chunna. Agar DSCP kabhi queue tak pahunchta hi nahi to badi queue kuch nahi badalti; agar call set-up fail ho to QoS problem nahi hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Voice EF mark hai isliye end to end protected hai." Marking kuch protect nahi karti jab tak har congested hop par, dono directions mein, backup path par bhi use maanne wali queue na ho.</p></div>
<div class="scn"><h4>Scenario: Go-live review</h4><p>Delhi go-live se pehle change manager ne evidence maanga. Engineer ne chaar cheezein attach ki: LAN input par class counters, provider ke dono taraf capture jisme EF CS5 banta aur wapas hota dikha, 12 Mbps backup ke saath load test jisme das-call stream aur video stream zero loss se pahunche, aur primary circuit shut karke doosra test. Change paanch minute mein approve ho gaya.</p><p><b>Lesson:</b> Chaar layers ka evidence bahas khatam kar deta hai. Yeh sabse achhi interview story bhi hai.</p></div>
<div class="iv"><p class="q">"Aisa project batao jisme tumne sites ke beech voice reliable banayi."</p><p>Is module ka dhaancha use karo: numbers (calls, codec, bandwidth), design (classes, trust boundary par marking, bottlenecks par queues, provider mapping, dono directions, backup), load mein verification aur jo monitoring chhodi (IP SLA). Ek problem aur uska fix kaise sabit kiya, us par khatam karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Voice quality arithmetic plus evidence hai: calls se size karo, load se sabit karo.</li><li>Har jagah ek policy bhasha, dono directions mein, har circuit par.</li><li>Edge par mark, bottleneck par queue, provider check karo.</li><li>Reachability aur quality problems ke alag tareeke hain: kabhi mat milao.</li><li>Agle steps: track exam do, phir voice, WAN aur mixed faults ke Real Experience tickets practise karo.</li></ul></div>`}};export{e as default};