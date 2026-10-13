var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the three lab tickets`,hi:`Troubleshooting workflow aur teen lab tickets`},body:{en:`
<p>Tools are only useful in the right order. A good engineer works from the bottom of the network stack upwards and changes nothing until she knows what is wrong. This chapter gives a simple workflow and then walks through the three lab tickets step by step, with the commands and the reasoning.</p>

<h3>The workflow: bottom up</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bottom-up troubleshooting">
<rect x="120" y="150" width="400" height="44" rx="8" fill="#fed7aa"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">1. Interface: Admin, Link, errors, duplex</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="11">show interfaces terse / extensive</text>
<rect x="120" y="100" width="400" height="44" rx="8" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">2. Address and neighbour</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="11">Local address, show ospf neighbor, logs</text>
<rect x="120" y="50" width="400" height="44" rx="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">3. Routing</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="11">show route, traceroute</text>
<rect x="120" y="0" width="400" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">4. End to end</text><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="11">ping from the PC</text>
</svg><p class="cap">Start at the bottom. A fault low in the stack makes everything above it look broken.</p></div>
<ol>
<li><b>State the symptom</b> in one sentence, with source and destination.</li>
<li><b>Observe</b> the facts with show commands. Change nothing yet.</li>
<li><b>Form one hypothesis</b> that explains the facts.</li>
<li><b>Make one change</b>, commit, and watch (monitor) if it is an event.</li>
<li><b>Verify</b> with the same command that showed the fault, then end to end with ping.</li>
<li><b>Look for a second fault.</b> One symptom can have several causes.</li>
</ol>

<h3>Ticket 1: Find the failing interface (Jaipur)</h3>
<p><b>Symptom:</b> PC1 behind R1 cannot reach SRV 10.33.3.10 behind R3; transfers over R1 to R2 are slow. Three routers, three faults.</p>
<ol>
<li>On R2: <code>show interfaces terse</code>. Port <code>ge-0/0/1</code> is Admin down. Fix: <code>delete interfaces ge-0/0/1 disable</code>, commit. Verify with <code>show ospf neighbor</code>: R2 and R3 (10.255.1.3) become Full after about 40 seconds.</li>
<li>On R1 and R2: <code>show interfaces ge-0/0/0 extensive</code>. R1 is hard-set to 100m full-duplex with framing errors and runts. R2 reports <code>Link-mode: Half-duplex</code> with collisions. This is the duplex mismatch. Fix on R1: <code>delete interfaces ge-0/0/0 speed</code> and <code>delete interfaces ge-0/0/0 link-mode</code>, commit, then <code>clear interfaces statistics all</code> and recheck: both ends full, counters stay at zero.</li>
<li>PC1 still fails. On R3: <code>show interfaces terse ge-0/0/2</code> shows 10.30.3.1/24, but SRV is 10.33.3.10 with gateway 10.33.3.1. Replace the address: delete the old one, set <code>10.33.3.1/24</code>, commit, and keep OSPF passive on that port. Now <code>ping 10.33.3.10</code> from PC1 succeeds.</li></ol>

<h3>Ticket 2: Trace the path (Surat)</h3>
<p><b>Symptom:</b> after R3 was replaced, R1 and PC1 cannot reach ERP server 10.4.4.10. The path R1, R2, R3, R4 uses static routes.</p>
<ol>
<li>On R1: <code>traceroute 10.4.4.10</code>. The output reaches 10.0.12.2 (R2), then 10.0.23.2, and 10.0.23.2 again with <code>!H</code>.</li>
<li>10.0.23.2 is R3's ingress address, so R3 has no route onward. On R3: <code>show route</code> confirms no route to 10.4.4.0/24.</li>
<li>Fix: <code>set routing-options static route 10.4.4.0/24 next-hop 10.0.34.2</code>, commit.</li>
<li>Trace again. Four lines now: R2, R3, R4 and the server itself. <code>ping 10.4.4.10</code> from PC1 works.</li></ol>
<pre class="out">lab@R1-SURAT&gt; traceroute 10.4.4.10
traceroute to 10.4.4.10 (10.4.4.10), 30 hops max, 40 byte packets
 1  10.0.12.2 (10.0.12.2)  0.805 ms  0.590 ms  0.571 ms
 2  10.0.23.2 (10.0.23.2)  1.018 ms  0.897 ms  0.881 ms
 3  10.0.34.2 (10.0.34.2)  1.322 ms  1.190 ms  1.176 ms
 <span class="hl">4  10.4.4.10 (10.4.4.10)  1.710 ms  1.502 ms  1.498 ms</span>
</pre>

<h3>Ticket 3: Watch the neighbour come up (Indore)</h3>
<p><b>Symptom:</b> a new link R1 to R2 never forms OSPF.</p>
<ol>
<li>On R1 first: <code>monitor start messages</code>, so you can see the result of your change live.</li>
<li>Compare <code>show ospf interface</code> on R1 and R2. R1 has the link in area 0.0.0.1, R2 in area 0. An area mismatch stops the adjacency. Fix on R1: delete the area 0.0.0.1 stanza and put <code>ge-0/0/0.0</code> in area 0, then commit.</li>
<li>Within about 40 seconds the log line <code>RPD_OSPF_NBRUP</code> appears. It says the neighbour changed from <b>Loading</b> to Full.</li>
<li>Run <code>monitor stop</code>. With the site stable, run <code>request system snapshot</code> and check with <code>show system snapshot</code>.</li></ol>

<div class="warn"><p><b>Common mistake.</b> Fixing the first fault and declaring victory. Ticket 1 has three independent faults; after each fix, re-test end to end and look for the next one.</p></div>
<div class="exam"><p><b>Exam trap.</b> Show output and symptoms are given and you pick the command or cause. Match: Admin down = disable; late collisions plus runts = duplex mismatch; !H = router without route; OSPF stuck with different areas = area mismatch.</p></div>

<div class="scn"><h4>Slow but "up"</h4><p>A hospital reported that its scanner images took minutes to upload, yet monitoring showed all links green. The engineer ran show interfaces extensive on the uplink and found hundreds of late collisions on one side. A contractor had hard-set the port to full-duplex months earlier; the switch end auto-negotiated to half. Removing the manual settings brought uploads from minutes down to seconds.</p><p><b>Lesson:</b> green lights do not prove a healthy link. Counters do.</p></div>

<div class="iv"><p class="q">"Users cannot reach a server across three routers. Describe your troubleshooting."</p><p>Define source and destination. Start at layer 1 and 2 on the path: show interfaces terse and extensive. Check addressing and neighbours. Then traceroute to find the last good hop and read the routing table of the router that answers with !H. Make one change, verify with the same command and an end-to-end ping, and look for a second fault.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work bottom up: interface, address and neighbour, routing, end to end.</li>
<li>Observe first, make one change, verify, then look for another fault.</li>
<li>Jaipur ticket: disabled interface, duplex mismatch, wrong address.</li>
<li>Surat ticket: traceroute !H at 10.0.23.2 led to a missing static route on R3.</li>
<li>Indore ticket: area mismatch; monitor start messages shows RPD_OSPF_NBRUP; then snapshot.</li>
</ul></div>
`,hi:`
<p>Tools tabhi kaam ke hain jab sahi order mein use ho. Achha engineer network stack mein neeche se upar ki taraf chalta hai aur jab tak pata na ho kya galat hai kuch nahi badalta. Yeh chapter ek simple workflow deta hai, phir teeno lab tickets ko step by step commands aur reasoning ke saath chalata hai.</p>

<h3>Workflow: neeche se upar</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bottom-up troubleshooting">
<rect x="120" y="150" width="400" height="44" rx="8" fill="#fed7aa"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">1. Interface: Admin, Link, errors, duplex</text><text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="11">show interfaces terse / extensive</text>
<rect x="120" y="100" width="400" height="44" rx="8" fill="#fde68a"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">2. Address aur neighbour</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="11">Local address, show ospf neighbor, logs</text>
<rect x="120" y="50" width="400" height="44" rx="8" fill="#bae6fd"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">3. Routing</text><text x="320" y="86" text-anchor="middle" class="svg-muted" font-size="11">show route, traceroute</text>
<rect x="120" y="0" width="400" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">4. End to end</text><text x="320" y="36" text-anchor="middle" class="svg-muted" font-size="11">PC se ping</text>
</svg><p class="cap">Neeche se shuru karo. Stack mein neeche ka fault upar sab kuch toota hua dikhata hai.</p></div>
<ol>
<li><b>Symptom ek line mein likho</b>, source aur destination ke saath.</li>
<li><b>Facts observe karo</b> show commands se. Abhi kuch mat badlo.</li>
<li><b>Ek hypothesis banao</b> jo facts samjhaye.</li>
<li><b>Ek change karo</b>, commit karo, aur agar event hai to monitor se dekho.</li>
<li><b>Verify karo</b> usi command se jisne fault dikhaya tha, phir ping se end to end.</li>
<li><b>Doosra fault dhoondho.</b> Ek symptom ke kai kaaran ho sakte hain.</li>
</ol>

<h3>Ticket 1: Kharab interface dhoondho (Jaipur)</h3>
<p><b>Symptom:</b> R1 ke peeche PC1 R3 ke peeche SRV 10.33.3.10 tak nahi pahunch pa raha; R1 se R2 par transfers slow hain. Teen routers, teen faults.</p>
<ol>
<li>R2 par: <code>show interfaces terse</code>. Port <code>ge-0/0/1</code> Admin down hai. Fix: <code>delete interfaces ge-0/0/1 disable</code>, commit. <code>show ospf neighbor</code> se verify: R2 aur R3 (10.255.1.3) lagbhag 40 second baad Full ho jaate hain.</li>
<li>R1 aur R2 par: <code>show interfaces ge-0/0/0 extensive</code>. R1 100m full-duplex par hard-set hai aur framing errors aur runts hain. R2 <code>Link-mode: Half-duplex</code> aur collisions dikhata hai. Yeh duplex mismatch hai. R1 par fix: <code>delete interfaces ge-0/0/0 speed</code> aur <code>delete interfaces ge-0/0/0 link-mode</code>, commit, phir <code>clear interfaces statistics all</code> aur dobara check: dono ends full, counters zero rehte hain.</li>
<li>PC1 abhi bhi fail hai. R3 par: <code>show interfaces terse ge-0/0/2</code> 10.30.3.1/24 dikhata hai, lekin SRV 10.33.3.10 hai aur gateway 10.33.3.1. Address badlo: purana delete karo, <code>10.33.3.1/24</code> set karo, commit, aur us port par OSPF passive rakho. Ab PC1 se <code>ping 10.33.3.10</code> chalta hai.</li></ol>

<h3>Ticket 2: Rasta trace karo (Surat)</h3>
<p><b>Symptom:</b> R3 badalne ke baad R1 aur PC1 ERP server 10.4.4.10 tak nahi pahunch rahe. R1, R2, R3, R4 ka path static routes use karta hai.</p>
<ol>
<li>R1 par: <code>traceroute 10.4.4.10</code>. Output 10.0.12.2 (R2) tak jaata hai, phir 10.0.23.2, aur 10.0.23.2 dobara <code>!H</code> ke saath.</li>
<li>10.0.23.2 R3 ka ingress address hai, yaani R3 ke paas aage ka route nahi. R3 par <code>show route</code> confirm karta hai ki 10.4.4.0/24 ka route nahi hai.</li>
<li>Fix: <code>set routing-options static route 10.4.4.0/24 next-hop 10.0.34.2</code>, commit.</li>
<li>Dobara trace karo. Ab chaar lines: R2, R3, R4 aur khud server. PC1 se <code>ping 10.4.4.10</code> chalta hai.</li></ol>
<pre class="out">lab@R1-SURAT&gt; traceroute 10.4.4.10
traceroute to 10.4.4.10 (10.4.4.10), 30 hops max, 40 byte packets
 1  10.0.12.2 (10.0.12.2)  0.805 ms  0.590 ms  0.571 ms
 2  10.0.23.2 (10.0.23.2)  1.018 ms  0.897 ms  0.881 ms
 3  10.0.34.2 (10.0.34.2)  1.322 ms  1.190 ms  1.176 ms
 <span class="hl">4  10.4.4.10 (10.4.4.10)  1.710 ms  1.502 ms  1.498 ms</span>
</pre>

<h3>Ticket 3: Neighbour ko up hote dekho (Indore)</h3>
<p><b>Symptom:</b> naya link R1 se R2 par OSPF kabhi nahi banta.</p>
<ol>
<li>R1 par pehle: <code>monitor start messages</code>, taaki aapke change ka nateeja live dikhe.</li>
<li>R1 aur R2 par <code>show ospf interface</code> compare karo. R1 ne link area 0.0.0.1 mein rakha hai, R2 ne area 0 mein. Area mismatch adjacency rok deta hai. R1 par fix: area 0.0.0.1 stanza delete karo aur <code>ge-0/0/0.0</code> ko area 0 mein rakho, phir commit.</li>
<li>Lagbhag 40 second mein log line <code>RPD_OSPF_NBRUP</code> aati hai. Woh batati hai neighbour <b>Loading</b> se Full mein gaya.</li>
<li><code>monitor stop</code> chalao. Site stable hone par <code>request system snapshot</code> chalao aur <code>show system snapshot</code> se check karo.</li></ol>

<div class="warn"><p><b>Common mistake.</b> Pehla fault theek karke jeet maan lena. Ticket 1 mein teen independent faults hain; har fix ke baad end to end dobara test karo aur agla fault dhoondho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Show output aur symptoms diye jaate hain aur aapko command ya kaaran chunna hota hai. Milao: Admin down = disable; late collisions aur runts = duplex mismatch; !H = route-less router; alag areas ke saath OSPF atka = area mismatch.</p></div>

<div class="scn"><h4>Slow lekin "up"</h4><p>Ek hospital ne bataya ki scanner images upload hone mein minutes lagte hain, jabki monitoring mein saare links green the. Engineer ne uplink par show interfaces extensive chalaya aur ek side par sainkdon late collisions paye. Ek contractor ne mahino pehle port ko full-duplex par hard-set kiya tha; switch end auto-negotiate karke half par aa gaya. Manual settings hatane se upload minutes se seconds par aa gaya.</p><p><b>Lesson:</b> green lights healthy link saabit nahi karti. Counters karte hain.</p></div>

<div class="iv"><p class="q">"Users teen routers ke paar server tak nahi pahunch pa rahe. Aap troubleshooting kaise karoge?"</p><p>Source aur destination define karo. Path par layer 1 aur 2 se shuru karo: show interfaces terse aur extensive. Addressing aur neighbours check karo. Phir traceroute se last good hop dhoondho aur !H dene wale router ki routing table padho. Ek change karo, usi command aur end-to-end ping se verify karo, aur doosra fault dhoondho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Neeche se upar chalo: interface, address aur neighbour, routing, end to end.</li>
<li>Pehle observe, ek change, verify, phir doosra fault dhoondho.</li>
<li>Jaipur ticket: disabled interface, duplex mismatch, galat address.</li>
<li>Surat ticket: 10.0.23.2 par traceroute !H se R3 par missing static route mila.</li>
<li>Indore ticket: area mismatch; monitor start messages RPD_OSPF_NBRUP dikhata hai; phir snapshot.</li>
</ul></div>
`}};export{e as default};