var e={id:`troubleshoot`,h:{en:`Troubleshooting workflow: from "it is slow" to a proven fix (lab walkthrough)`,hi:`Troubleshooting workflow: "slow hai" se proven fix tak (lab walkthrough)`},body:{en:`
<p>A good mechanic does not replace parts at random. He listens to the complaint, checks the dashboard lights, reads the fault codes, forms one theory, fixes one thing, and takes the car for a test drive. Interface troubleshooting is the same discipline: <b>state, speed and duplex, counters, cause, fix, prove</b>. This chapter gives you that workflow and then walks through the module's lab, the clinic ticket, step by step.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface troubleshooting workflow">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. State</text><text x="65" y="62" text-anchor="middle" class="svg-muted" font-size="12">up? down?</text>
<rect x="135" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="190" y="44" text-anchor="middle" class="svg-ink" font-size="13">2. Speed</text><text x="190" y="62" text-anchor="middle" class="svg-muted" font-size="12">and duplex</text>
<rect x="260" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="315" y="44" text-anchor="middle" class="svg-ink" font-size="13">3. Counters</text><text x="315" y="62" text-anchor="middle" class="svg-muted" font-size="12">both ends</text>
<rect x="385" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="440" y="44" text-anchor="middle" class="svg-ink" font-size="13">4. Fix one</text><text x="440" y="62" text-anchor="middle" class="svg-muted" font-size="12">thing</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">5. Prove</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="12">clear, retest</text>
<line x1="120" y1="48" x2="135" y2="48" stroke="#64748b" stroke-width="2"/><line x1="245" y1="48" x2="260" y2="48" stroke="#64748b" stroke-width="2"/><line x1="370" y1="48" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="495" y1="48" x2="510" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">show ip int brief / show interfaces status, then show interfaces on BOTH ends,</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">then logs (CDP duplex mismatch, err-disable), then change, clear counters, test</text>
</svg><p class="cap">Five steps, always in this order, always on both ends of the link.</p></div>
<ol>
<li><b>State.</b> <code>show ip interface brief</code> or <code>show interfaces status</code>. Down/down or notconnect: cable, far end, optic, speed mismatch. Disabled: <code>no shutdown</code>. Err-disabled: read the reason first.</li>
<li><b>Speed and duplex.</b> Are both ends at the same speed and full duplex? Is either side <code>a-half</code> or hard-coded without <code>a-</code>?</li>
<li><b>Counters, both ends.</b> Late collisions plus CRC/runts: duplex mismatch. CRC only: physical. Output drops: congestion. Giants: MTU. Check <code>Last clearing</code>, and check the logs.</li>
<li><b>Fix one thing</b> at a time, so you know what worked.</li>
<li><b>Prove.</b> <code>clear counters</code>, generate traffic, re-check that errors stay at zero, and confirm the user's symptom is gone.</li>
</ol>

<h3>Lab walkthrough: the clinic ticket</h3>
<p><b>Ticket:</b> clinic staff say the practice software freezes every few seconds, yet pings look mostly fine. The uplink between access switch SW1 (Fa0/1) and router R1 (Fa0/0) was hard-coded during a cable test last month. Addressing: R1 10.0.12.1/24, SW1 VLAN 1 10.0.12.2/24.</p>

<p><b>Task 1: collect evidence.</b> Generate traffic from R1, then read the interface.</p>
<pre class="code">R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0</pre>
<pre class="out">Type escape sequence to abort.
Sending 100, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!
<span class="hl">Success rate is 97 percent (97/100)</span>, round-trip min/avg/max = 1/3/28 ms

FastEthernet0/0 is up, line protocol is up
<span class="hl">  Half-duplex, 100Mb/s, 100BaseTX/FX</span>
<span class="hl">     19 output errors, 37 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 19 late collision, 0 deferred</span></pre>
<p>R1 is running <b>half duplex</b> and logging late collisions. Now the other end:</p>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1       full    100 10/100BaseTX</span>
SW1# show interfaces fa0/1 | include duplex|CRC|runts
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
     17 runts, 0 giants, 0 throttles
     61 input errors, 44 CRC, 0 frame, 0 overrun, 0 ignored
%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on FastEthernet0/1 (not half duplex), with R1 FastEthernet0/0 (half duplex).</pre>
<p>Diagnosis: SW1 Fa0/1 is hard-coded 100/full (no <code>a-</code>), so it stopped negotiating. R1, on auto, sensed 100 Mbps but fell back to half duplex. Classic duplex mismatch: late collisions on the half side, CRC and runts on the full side, and CDP agrees.</p>

<p><b>Task 2: fix the link.</b> The recommended fix is auto on both ends. R1 is already auto, so change SW1:</p>
<pre class="code">SW1# configure terminal
SW1(config)# interface fa0/1
SW1(config-if)# speed auto
SW1(config-if)# duplex auto
SW1(config-if)# end
<span class="c">! alternative: hard-code R1 fa0/0 to speed 100 / duplex full as well</span></pre>
<pre class="out">SW1# show interfaces status | include Fa0/1
<span class="hl">Fa0/1     UPLINK-R1  connected    1     a-full  a-100 10/100BaseTX</span>
R1# show interfaces fa0/0 | include duplex
<span class="hl">  Full-duplex, 100Mb/s, 100BaseTX/FX</span></pre>

<p><b>Task 3: prove the errors stopped.</b> The old late collisions are still in the counters, so clear them and test again.</p>
<pre class="code">R1# clear counters
Clear "show interface" counters on all interfaces [confirm]
R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0</pre>
<pre class="out">  Last clearing of "show interface" counters 00:00:41
<span class="hl">     0 output errors, 0 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 0 late collision, 0 deferred</span></pre>

<p><b>Task 4: confirm with a clean ping.</b></p>
<pre class="out">R1# ping 10.0.12.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/1/2 ms</pre>
<p>Finally, ask the clinic staff to use the software for a few minutes, and document the root cause (a forgotten test setting) and the fix in the ticket.</p>

<h3>Other cases you will meet</h3>
<ul>
<li><b>Link down, both ends fixed at different speeds</b>: notconnect on the switch; set both to auto or to the same speed.</li>
<li><b>CRC on one side, both full</b>: replace the patch cord, then run a cable test on Catalyst: <code>test cable-diagnostics tdr interface gi1/0/5</code> and <code>show cable-diagnostics tdr interface gi1/0/5</code>, which report each pair as Normal, Open or Short with an approximate distance.</li>
<li><b>Fibre link down or erroring</b>: <code>show interfaces transceiver</code> for Rx power, clean connectors, check Tx-to-Rx polarity, confirm matching optics.</li>
<li><b>Gigabit port stuck at a-100</b>: a broken pair or two-pair cabling.</li>
<li><b>Output drops</b>: congestion, not a fault; look at load and design.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Fixing only the side that shows errors: in the lab, R1 shows the late collisions but the wrong configuration is on SW1. Skipping <code>clear counters</code> and declaring victory on old numbers. Changing several things at once.</p></div>

<div class="exam"><p><b>Exam trap.</b> The device with late collisions is the <b>half</b>-duplex side, often the side left on auto. The misconfiguration is usually on the <b>other</b> side, the one hard-coded to full.</p></div>

<div class="scn"><h4>Three tickets, one root cause</h4><p>A support desk had three open tickets from one floor: slow file shares, dropped VPN sessions and choppy video calls. Each had been assigned to a different team. A network engineer checked the floor's access switch uplink and found it hard-coded to 100/full after a switch replacement, while the distribution switch was on auto and running half duplex with thousands of late collisions. One change to auto on both ends closed all three tickets.</p><p><b>Lesson:</b> check the shared physical path first. One duplex mismatch can look like three unrelated application problems.</p></div>

<div class="iv"><p class="q">"Walk me through how you would troubleshoot a slow link between a switch and a router."</p><p>Strong answer: state with <code>show interfaces status</code> and <code>show ip interface brief</code>; speed and duplex on both ends, noting any hard-coded values or <code>a-half</code>; counters on both ends after <code>clear counters</code> and a test ping (late collisions plus CRC/runts means duplex mismatch; CRC alone means cabling; output drops mean congestion); logs such as CDP duplex mismatch; fix one thing, preferably auto/auto; then clear counters, retest and document. Mention that the side with the errors is not always the side with the wrong config.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: state, speed and duplex, counters on both ends, fix one thing, prove.</li>
<li>In the lab, SW1 Fa0/1 was hard-coded 100/full; R1 fell back to 100/half.</li>
<li>Fix with <code>speed auto</code> and <code>duplex auto</code> on SW1 Fa0/1 (or hard-code both ends to match).</li>
<li>Prove with <code>clear counters</code>, a 100-packet ping and zero late collisions.</li>
<li>Use TDR for copper and DOM for fibre when counters point to a physical fault.</li>
</ul></div>
`,hi:`
<p>Achha mechanic parts random tareeke se nahi badalta. Woh complaint sunta hai, dashboard lights check karta hai, fault codes padhta hai, ek theory banata hai, ek cheez fix karta hai, aur gaadi ki test drive leta hai. Interface troubleshooting bhi wahi discipline hai: <b>state, speed aur duplex, counters, cause, fix, prove</b>. Yeh chapter aapko woh workflow deta hai aur phir module ki lab, clinic wala ticket, step by step chalata hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Interface troubleshooting workflow">
<rect x="10" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="44" text-anchor="middle" class="svg-ink" font-size="13">1. State</text><text x="65" y="62" text-anchor="middle" class="svg-muted" font-size="12">up? down?</text>
<rect x="135" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="190" y="44" text-anchor="middle" class="svg-ink" font-size="13">2. Speed</text><text x="190" y="62" text-anchor="middle" class="svg-muted" font-size="12">aur duplex</text>
<rect x="260" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="315" y="44" text-anchor="middle" class="svg-ink" font-size="13">3. Counters</text><text x="315" y="62" text-anchor="middle" class="svg-muted" font-size="12">dono ends</text>
<rect x="385" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="440" y="44" text-anchor="middle" class="svg-ink" font-size="13">4. Ek cheez</text><text x="440" y="62" text-anchor="middle" class="svg-muted" font-size="12">fix karo</text>
<rect x="510" y="20" width="120" height="56" rx="8" fill="#bbf7d0"/><text x="570" y="44" text-anchor="middle" class="svg-ink" font-size="13">5. Prove</text><text x="570" y="62" text-anchor="middle" class="svg-muted" font-size="12">clear, retest</text>
<line x1="120" y1="48" x2="135" y2="48" stroke="#64748b" stroke-width="2"/><line x1="245" y1="48" x2="260" y2="48" stroke="#64748b" stroke-width="2"/><line x1="370" y1="48" x2="385" y2="48" stroke="#64748b" stroke-width="2"/><line x1="495" y1="48" x2="510" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">show ip int brief / show interfaces status, phir DONO ends par show interfaces,</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">phir logs (CDP duplex mismatch, err-disable), phir change, clear counters, test</text>
</svg><p class="cap">Paanch steps, hamesha isi order mein, hamesha link ke dono ends par.</p></div>
<ol>
<li><b>State.</b> <code>show ip interface brief</code> ya <code>show interfaces status</code>. Down/down ya notconnect: cable, far end, optic, speed mismatch. Disabled: <code>no shutdown</code>. Err-disabled: pehle reason padho.</li>
<li><b>Speed aur duplex.</b> Kya dono ends same speed aur full duplex par hain? Kya koi side <code>a-half</code> hai ya bina <code>a-</code> ke hard-coded?</li>
<li><b>Counters, dono ends.</b> Late collisions plus CRC/runts: duplex mismatch. Sirf CRC: physical. Output drops: congestion. Giants: MTU. <code>Last clearing</code> check karo, aur logs check karo.</li>
<li><b>Ek time par ek cheez fix karo</b>, taaki pata chale kya kaam kiya.</li>
<li><b>Prove.</b> <code>clear counters</code>, traffic generate karo, re-check karo ki errors zero par rahein, aur confirm karo ki user ka symptom chala gaya.</li>
</ol>

<h3>Lab walkthrough: clinic ka ticket</h3>
<p><b>Ticket:</b> clinic staff kehta hai practice software har kuch second mein atak jaata hai, jabki pings zyada tar theek dikhte hain. Access switch SW1 (Fa0/1) aur router R1 (Fa0/0) ke beech ka uplink pichhle mahine cable test ke dauraan hard-code kiya gaya tha. Addressing: R1 10.0.12.1/24, SW1 VLAN 1 10.0.12.2/24.</p>

<p><b>Task 1: saboot jama karo.</b> R1 se traffic generate karo, phir interface padho.</p>
<pre class="code">R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0</pre>
<pre class="out">Type escape sequence to abort.
Sending 100, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!!.!!!!!!!!!!!!!!!!!!
<span class="hl">Success rate is 97 percent (97/100)</span>, round-trip min/avg/max = 1/3/28 ms

FastEthernet0/0 is up, line protocol is up
<span class="hl">  Half-duplex, 100Mb/s, 100BaseTX/FX</span>
<span class="hl">     19 output errors, 37 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 19 late collision, 0 deferred</span></pre>
<p>R1 <b>half duplex</b> par chal raha hai aur late collisions log kar raha hai. Ab dusra end:</p>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1       full    100 10/100BaseTX</span>
SW1# show interfaces fa0/1 | include duplex|CRC|runts
  Full-duplex, 100Mb/s, media type is 10/100BaseTX
     17 runts, 0 giants, 0 throttles
     61 input errors, 44 CRC, 0 frame, 0 overrun, 0 ignored
%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on FastEthernet0/1 (not half duplex), with R1 FastEthernet0/0 (half duplex).</pre>
<p>Diagnosis: SW1 Fa0/1 100/full par hard-coded hai (<code>a-</code> nahi), isliye usne negotiate karna band kar diya. R1, jo auto par hai, ne 100 Mbps sense kiya lekin half duplex par gir gaya. Classic duplex mismatch: half side par late collisions, full side par CRC aur runts, aur CDP bhi yahi kehta hai.</p>

<p><b>Task 2: link fix karo.</b> Recommended fix dono ends par auto hai. R1 pehle se auto hai, isliye SW1 badlo:</p>
<pre class="code">SW1# configure terminal
SW1(config)# interface fa0/1
SW1(config-if)# speed auto
SW1(config-if)# duplex auto
SW1(config-if)# end
<span class="c">! alternative: R1 fa0/0 ko bhi speed 100 / duplex full par hard-code karo</span></pre>
<pre class="out">SW1# show interfaces status | include Fa0/1
<span class="hl">Fa0/1     UPLINK-R1  connected    1     a-full  a-100 10/100BaseTX</span>
R1# show interfaces fa0/0 | include duplex
<span class="hl">  Full-duplex, 100Mb/s, 100BaseTX/FX</span></pre>

<p><b>Task 3: prove karo ki errors ruk gaye.</b> Purane late collisions abhi bhi counters mein hain, isliye unhe clear karo aur dobara test karo.</p>
<pre class="code">R1# clear counters
Clear "show interface" counters on all interfaces [confirm]
R1# ping 10.0.12.2 repeat 100
R1# show interfaces fa0/0</pre>
<pre class="out">  Last clearing of "show interface" counters 00:00:41
<span class="hl">     0 output errors, 0 collisions, 0 interface resets</span>
<span class="hl">     0 babbles, 0 late collision, 0 deferred</span></pre>

<p><b>Task 4: clean ping se confirm karo.</b></p>
<pre class="out">R1# ping 10.0.12.2
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.0.12.2, timeout is 2 seconds:
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span>, round-trip min/avg/max = 1/1/2 ms</pre>
<p>Aakhir mein clinic staff se kuch minute software use karne ko kaho, aur ticket mein root cause (bhooli hui test setting) aur fix document karo.</p>

<h3>Aur cases jo aapko milenge</h3>
<ul>
<li><b>Link down, dono ends alag speeds par fixed</b>: switch par notconnect; dono ko auto ya same speed par set karo.</li>
<li><b>Ek side CRC, dono full</b>: patch cord badlo, phir Catalyst par cable test chalao: <code>test cable-diagnostics tdr interface gi1/0/5</code> aur <code>show cable-diagnostics tdr interface gi1/0/5</code>, jo har pair ko approximate doori ke saath Normal, Open ya Short report karta hai.</li>
<li><b>Fibre link down ya errors</b>: Rx power ke liye <code>show interfaces transceiver</code>, connectors saaf karo, Tx-to-Rx polarity check karo, matching optics confirm karo.</li>
<li><b>Gigabit port a-100 par atka</b>: toota pair ya do-pair cabling.</li>
<li><b>Output drops</b>: congestion, fault nahi; load aur design dekho.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Sirf us side ko fix karna jo errors dikha rahi hai: lab mein R1 late collisions dikhata hai lekin galat configuration SW1 par hai. <code>clear counters</code> skip karna aur purane numbers par jeet declare karna. Ek saath kai cheezein badalna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jis device par late collisions hain woh <b>half</b>-duplex side hai, aksar woh side jo auto par chhodi gayi. Misconfiguration aam taur par <b>dusri</b> side par hota hai, jo full par hard-coded hai.</p></div>

<div class="scn"><h4>Teen tickets, ek root cause</h4><p>Support desk par ek floor se teen open tickets the: slow file shares, drop hote VPN sessions aur choppy video calls. Har ek alag team ko assign tha. Ek network engineer ne floor ke access switch ka uplink check kiya aur paaya ki switch replacement ke baad woh 100/full par hard-coded tha, jabki distribution switch auto par tha aur hazaaron late collisions ke saath half duplex chal raha tha. Dono ends ko auto karne ke ek change ne teeno tickets band kar diye.</p><p><b>Seekh:</b> pehle shared physical path check karo. Ek duplex mismatch teen alag application problems jaisa dikh sakta hai.</p></div>

<div class="iv"><p class="q">"Switch aur router ke beech slow link ko aap kaise troubleshoot karoge, step by step batao."</p><p>Strong answer: <code>show interfaces status</code> aur <code>show ip interface brief</code> se state; dono ends par speed aur duplex, koi bhi hard-coded value ya <code>a-half</code> note karo; <code>clear counters</code> aur test ping ke baad dono ends par counters (late collisions plus CRC/runts matlab duplex mismatch; sirf CRC matlab cabling; output drops matlab congestion); CDP duplex mismatch jaise logs; ek cheez fix karo, preferably auto/auto; phir clear counters, retest aur document. Batao ki errors wali side hamesha galat config wali side nahi hoti.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: state, speed aur duplex, dono ends par counters, ek cheez fix, prove.</li>
<li>Lab mein SW1 Fa0/1 100/full par hard-coded tha; R1 100/half par gir gaya.</li>
<li>SW1 Fa0/1 par <code>speed auto</code> aur <code>duplex auto</code> se fix karo (ya dono ends match karke hard-code karo).</li>
<li><code>clear counters</code>, 100-packet ping aur zero late collisions se prove karo.</li>
<li>Jab counters physical fault ki taraf ishara karein to copper ke liye TDR aur fibre ke liye DOM use karo.</li>
</ul></div>
`}};export{e as default};