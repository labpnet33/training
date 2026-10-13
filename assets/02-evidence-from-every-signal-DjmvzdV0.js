var e={id:`evidence-from-every-signal`,h:{en:`Evidence from every signal`,hi:`Har signal se evidence`},body:{en:`
<h3>One witness is a rumour, three witnesses are a case</h3>
<p>Imagine a road accident. One bystander says "the red car went too fast". Useful, but you want the camera footage, the speed sign reading and the skid marks too. In a network incident each signal is a different witness with a different view, and each can be wrong in its own way. <b>Correlation</b> means lining up what several signals say about the same time window and the same place. When they agree, you have a case. When they disagree, you have found the next question.</p>

<h3>What each signal can and cannot tell you</h3>
<table class="cmp"><tr><th>Signal</th><th>Good at</th><th>Blind to</th></tr>
<tr><td>SNMP utilisation, CPU, errors</td><td>Is a link or device busy or erroring; trend over days</td><td>Who is using it; sub-minute bursts</td></tr>
<tr><td>Flows</td><td>Who talks to whom, how much, which app</td><td>Packet contents, drops, latency</td></tr>
<tr><td>Logs (syslog)</td><td>What the device itself says happened: link down, protocol flaps, config change</td><td>Anything the device did not log</td></tr>
<tr><td>SLA probes</td><td>What a user path feels like: latency, loss, jitter</td><td>Where on the path the problem sits</td></tr>
<tr><td>Packet capture</td><td>The ground truth for a flow: retransmissions, resets, who answered</td><td>Anything not on the captured link; long history</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Five witnesses around one incident">
<circle cx="320" cy="105" r="42" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Incident</text>
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">SNMP: util 94 pct</text>
<rect x="260" y="8" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Flows: backup 4 GB</text>
<rect x="500" y="20" width="125" height="44" rx="8" fill="#ddd6fe"/><text x="562" y="47" text-anchor="middle" class="svg-ink" font-size="12">Logs: flap at 10:02</text>
<rect x="60" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="135" y="177" text-anchor="middle" class="svg-ink" font-size="12">Probe: 310 ms, loss 4</text>
<rect x="430" y="150" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="515" y="177" text-anchor="middle" class="svg-ink" font-size="12">Capture: retransmits</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="140" y1="55" x2="285" y2="90"/><line x1="320" y1="52" x2="320" y2="63"/><line x1="500" y1="55" x2="357" y2="90"/><line x1="190" y1="150" x2="290" y2="135"/><line x1="440" y1="150" x2="350" y2="135"/></g>
</svg><p class="cap">Five signals around one time window and one place.</p></div>

<h3>The correlation habit</h3>
<ol>
<li>Fix the <b>time window</b> from the first alert. Use the same window on every page.</li>
<li>Fix the <b>place</b>: the site, the circuit, the device pair.</li>
<li>Ask each signal the same question: "what changed in this window?"</li>
<li>Write down agreements and contradictions. A contradiction is a clue, not a nuisance.</li>
</ol>
<p>Example from Godavari Foods: Kochi ERP users complain at 10:00. SNMP shows R-KCH Gi0/3 (circuit BB-KCH-01) at 94 percent. Flows show a large file copy from PC-KCH to SRV-HYD. The probe p-erp is 310 ms with loss. The logs show nothing wrong: the device is healthy. The capture shows retransmissions on the ERP flow. Together: a link is full because of a file copy, and ERP suffers. The fix is policy (limit or schedule the copy), not a repair.</p>
<pre class="out">Evidence table (incident 10:00 to 10:30, Kochi circuit BB-KCH-01)
Signal     Observation                                   Agrees?
SNMP       R-KCH Gi0/3 util 94 pct for 30 min            yes
Flows      PC-KCH to SRV-HYD file-copy 3800 MB           yes
Logs       no link or protocol events                    <span class="hl">consistent: device healthy</span>
Probe      p-erp 310 ms, loss 4 pct                      yes
Capture    ERP flow: retransmissions, small window       yes</pre>

<h3>Packet capture basics</h3>
<p>A <b>packet capture</b> records the actual packets on a link, like a dashcam. In the console, Live tools offers a capture from a chosen router and target with a filter. Filters keep the result small and readable. The words the simulator understands are: <code>host x</code> (either direction), <code>src x</code>, <code>dst x</code>, <code>port n</code>, <code>tcp</code> and <code>udp</code>, joined with <code>and</code>. In the CLI labs the same idea is a SPAN session that copies traffic to a capture host.</p>
<ul>
<li><b>Capture narrowly:</b> one host and one protocol. Capturing everything is slow to read and heavy to store.</li>
<li><b>Capture at the right place:</b> on the side of the suspect handoff, and ideally at both ends of the path.</li>
<li><b>Capture while the problem exists.</b> A clean capture of a quiet moment proves nothing.</li>
</ul>
<pre class="out">capture R-KCH  filter: host 10.1.20.10 and tcp and port 443
No.  Time     Source       Destination  Info
 1   0.000    10.2.20.21   10.1.20.10   TCP SYN
 2   1.004    10.2.20.21   10.1.20.10   <span class="hl">TCP SYN (retransmission)</span>
 3   3.010    10.2.20.21   10.1.20.10   <span class="hl">TCP SYN (retransmission)</span>
Summary: 3 packets, 0 replies from 10.1.20.10</pre>
<p>How to read it: the client sent a SYN and nothing came back; the retransmissions at 1 and 3 seconds are the client giving up slowly. So the packet left Kochi but no answer returned. Now the question is where it was lost: capture at the other end, at SRV-HYD, with the same filter.</p>

<h3>Proving loss at a handoff</h3>
<p>Providers will say "our side is fine" unless you show data. Capture on your router facing the provider (the handoff) and on the far router. If packets leave your handoff and never arrive at the far end, the loss is in between. Add a probe from your edge router to the far edge: a steady 4 percent loss on the same time window is the second witness. Evidence in a ticket: filter used, times, packet counts at both ends, probe numbers. This is how you win the ESC ticket against a provider.</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> A capture changes no forwarding: it copies packets for reading (in a CLI lab, SPAN mirrors a port to another port). The cost is CPU and capture storage, and in real networks the sensitivity of the data: packet captures can hold passwords and personal data, so capture only what you need and delete it afterwards.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Trusting one signal. (2) Comparing windows that differ by an hour. (3) Capturing with no filter and drowning. (4) Capturing on the wrong side of the problem, which shows nothing wrong. (5) Treating a flow record as proof of delivery; it shows what was seen, not that it arrived.</p></div>
<div class="exam"><p><b>Exam trap.</b> Flow data does not contain payload or latency; SNMP counters do not say who. Match the question to the signal that can answer it.</p></div>

<div class="scn"><h4>The provider says it is fine</h4><p>Lucknow users reported slow video calls. Kabir Shah saw 3 percent loss on the voice probe from Hyderabad to Lucknow and 0 errors on every interface. He captured udp traffic at R-HYD and at R-LKO for the same 10 minutes: 12,000 packets left, 11,640 arrived. He attached both counts and the probe graph; the provider found a faulty transmission card.</p><p><b>Lesson:</b> counts at both ends of a handoff are persuasive evidence.</p></div>

<div class="iv"><p class="q">"How do you prove packet loss to a provider?"</p><p>Capture with a narrow filter at both sides of the handoff for the same time window, compare the packet counts, add a probe showing loss on that path, and show interface counters are clean on your side. Present times, filters and numbers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Correlate SNMP, flows, logs, probes and captures on the same window and place.</li>
<li>Each signal has blind spots; contradictions are clues.</li>
<li>Capture narrowly, at the right place, while the problem exists.</li>
<li>Read a capture for who spoke, who answered and what was retransmitted.</li>
<li>Prove loss at a handoff with counts at both ends plus a probe.</li>
</ul></div>
`,hi:`
<h3>Ek gawah afwah hai, teen gawah case hain</h3>
<p>Road accident socho. Ek rahgir kehta hai "laal gaadi bahut tez thi". Kaam ka hai, lekin aapko camera footage, speed sign reading aur skid marks bhi chahiye. Network incident mein har signal alag nazariye wala gawah hai, aur har ek apne tareeke se galat ho sakta hai. <b>Correlation</b> matlab kai signals ne ek hi time window aur ek hi jagah ke baare mein kya kaha use line up karna. Jab woh sehmat hon, to case ban gaya. Jab asehmat hon, to agla sawal mil gaya.</p>

<h3>Har signal kya bata sakta hai aur kya nahi</h3>
<table class="cmp"><tr><th>Signal</th><th>Achha kis mein</th><th>Andha kis mein</th></tr>
<tr><td>SNMP utilisation, CPU, errors</td><td>Link ya device busy ya erroring hai; dino ka trend</td><td>Kaun use kar raha hai; minute se chhote bursts</td></tr>
<tr><td>Flows</td><td>Kaun kis se baat kar raha hai, kitna, kaun si app</td><td>Packet contents, drops, latency</td></tr>
<tr><td>Logs (syslog)</td><td>Device khud kya kehta hai: link down, protocol flaps, config change</td><td>Jo device ne log nahi kiya</td></tr>
<tr><td>SLA probes</td><td>User path kaisa lagta hai: latency, loss, jitter</td><td>Path par problem kahan hai</td></tr>
<tr><td>Packet capture</td><td>Flow ka ground truth: retransmissions, resets, kisne jawab diya</td><td>Jo captured link par nahi; lambi history</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ek incident ke paanch gawah">
<circle cx="320" cy="105" r="42" fill="#fed7aa"/><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Incident</text>
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="12">SNMP: util 94 pct</text>
<rect x="260" y="8" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="12">Flows: backup 4 GB</text>
<rect x="500" y="20" width="125" height="44" rx="8" fill="#ddd6fe"/><text x="562" y="47" text-anchor="middle" class="svg-ink" font-size="12">Logs: flap 10:02</text>
<rect x="60" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="135" y="177" text-anchor="middle" class="svg-ink" font-size="12">Probe: 310 ms, loss 4</text>
<rect x="430" y="150" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="515" y="177" text-anchor="middle" class="svg-ink" font-size="12">Capture: retransmits</text>
<g stroke="#64748b" stroke-width="1.5"><line x1="140" y1="55" x2="285" y2="90"/><line x1="320" y1="52" x2="320" y2="63"/><line x1="500" y1="55" x2="357" y2="90"/><line x1="190" y1="150" x2="290" y2="135"/><line x1="440" y1="150" x2="350" y2="135"/></g>
</svg><p class="cap">Paanch signals, ek time window aur ek jagah.</p></div>

<h3>Correlation ki aadat</h3>
<ol>
<li>Pehle alert se <b>time window</b> fix karo. Har page par wahi window use karo.</li>
<li><b>Jagah</b> fix karo: site, circuit, device pair.</li>
<li>Har signal se wahi sawal poochho: "is window mein kya badla?"</li>
<li>Sehmati aur virodh likho. Virodh ek clue hai, pareshani nahi.</li>
</ol>
<p>Godavari Foods ka example: Kochi ERP users 10:00 par complain karte hain. SNMP R-KCH Gi0/3 (circuit BB-KCH-01) 94 percent dikhata hai. Flows PC-KCH se SRV-HYD tak badi file copy dikhate hain. Probe p-erp 310 ms hai loss ke saath. Logs mein kuch galat nahi: device healthy hai. Capture ERP flow par retransmissions dikhata hai. Milakar: link file copy se bhara hai, aur ERP bhugat raha hai. Fix policy hai (copy ko limit ya schedule karo), repair nahi.</p>
<pre class="out">Evidence table (incident 10:00 to 10:30, Kochi circuit BB-KCH-01)
Signal     Observation                                   Agrees?
SNMP       R-KCH Gi0/3 util 94 pct for 30 min            yes
Flows      PC-KCH to SRV-HYD file-copy 3800 MB           yes
Logs       no link or protocol events                    <span class="hl">consistent: device healthy</span>
Probe      p-erp 310 ms, loss 4 pct                      yes
Capture    ERP flow: retransmissions, small window       yes</pre>

<h3>Packet capture basics</h3>
<p><b>Packet capture</b> link par asli packets record karta hai, dashcam ki tarah. Console mein Live tools chune hue router aur target se filter ke saath capture deta hai. Filters result ko chhota aur padhne layak rakhte hain. Simulator ye words samajhta hai: <code>host x</code> (dono directions), <code>src x</code>, <code>dst x</code>, <code>port n</code>, <code>tcp</code> aur <code>udp</code>, <code>and</code> se jode hue. CLI labs mein wahi idea SPAN session hai jo traffic ko capture host par copy karta hai.</p>
<ul>
<li><b>Narrow capture karo:</b> ek host aur ek protocol. Sab kuch capture karna padhne mein slow aur store karne mein bhaari hai.</li>
<li><b>Sahi jagah capture karo:</b> shak wale handoff ki side par, aur ideally path ke dono ends par.</li>
<li><b>Jab problem ho tab capture karo.</b> Shaant pal ka saaf capture kuch saabit nahi karta.</li>
</ul>
<pre class="out">capture R-KCH  filter: host 10.1.20.10 and tcp and port 443
No.  Time     Source       Destination  Info
 1   0.000    10.2.20.21   10.1.20.10   TCP SYN
 2   1.004    10.2.20.21   10.1.20.10   <span class="hl">TCP SYN (retransmission)</span>
 3   3.010    10.2.20.21   10.1.20.10   <span class="hl">TCP SYN (retransmission)</span>
Summary: 3 packets, 0 replies from 10.1.20.10</pre>
<p>Kaise padhein: client ne SYN bheja aur kuch wapas nahi aaya; 1 aur 3 second par retransmissions client ka dheere dheere haar maanna hain. To packet Kochi se nikla lekin jawab wapas nahi aaya. Ab sawal hai ki kahan khoya: doosre end par, SRV-HYD par, wahi filter ke saath capture karo.</p>

<h3>Handoff par loss saabit karna</h3>
<p>Providers kehte hain "hamari side theek hai" jab tak aap data na dikhao. Provider ki taraf wale apne router par (handoff) aur door wale router par capture karo. Agar packets aapke handoff se nikle aur door ke end par nahi pahunche, to loss beech mein hai. Apne edge router se door ke edge tak probe jodo: usi window mein steady 4 percent loss doosra gawah hai. Ticket mein evidence: use kiya filter, times, dono ends par packet counts, probe numbers. Isi tarah aap provider ke khilaf ESC ticket jeette ho.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Capture forwarding nahi badalta: yeh padhne ke liye packets ki copy leta hai (CLI lab mein SPAN ek port ko doosre port par mirror karta hai). Keemat CPU aur capture storage hai, aur asli networks mein data ki sensitivity: captures mein passwords aur personal data ho sakta hai, isliye sirf jitna chahiye utna capture karo aur baad mein delete karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek signal par bharosa. (2) Aisi windows compare karna jo ek ghante se alag hain. (3) Bina filter capture karke doob jaana. (4) Problem ki galat side par capture karna, jisme kuch galat nahi dikhta. (5) Flow record ko delivery ka saboot maanna; woh dikhata hai kya dekha gaya, yeh nahi ki pahuncha.</p></div>
<div class="exam"><p><b>Exam trap.</b> Flow data mein payload ya latency nahi hoti; SNMP counters nahi batate kaun. Sawal ko us signal se match karo jo jawab de sakta hai.</p></div>

<div class="scn"><h4>Provider kehta hai sab theek hai</h4><p>Lucknow users ne slow video calls report kiye. Kabir Shah ne Hyderabad se Lucknow voice probe par 3 percent loss dekha aur har interface par 0 errors. Usne R-HYD aur R-LKO par usi 10 minute ke liye udp traffic capture kiya: 12,000 packets nikle, 11,640 pahunche. Usne dono counts aur probe graph attach kiye; provider ko faulty transmission card mila.</p><p><b>Seekh:</b> handoff ke dono ends par counts convincing evidence hain.</p></div>

<div class="iv"><p class="q">"Provider ko packet loss kaise saabit karoge?"</p><p>Same time window ke liye handoff ki dono taraf narrow filter se capture karo, packet counts compare karo, us path par loss dikhane wala probe jodo, aur dikhao ki aapki side par interface counters saaf hain. Times, filters aur numbers present karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNMP, flows, logs, probes aur captures ko ek window aur ek jagah par correlate karo.</li>
<li>Har signal ke blind spots hain; virodh clues hain.</li>
<li>Narrow, sahi jagah, aur problem ke dauraan capture karo.</li>
<li>Capture mein padho kisne bola, kisne jawab diya aur kya retransmit hua.</li>
<li>Handoff par loss dono ends ke counts plus probe se saabit karo.</li>
</ul></div>
`}};export{e as default};