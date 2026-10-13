var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have covered the whole of domain 5.0, the largest domain on N10-009. This chapter is your final check before the exam and your quick reference on the job. Read the checklist aloud: if you cannot do an item with confidence, go back to its chapter.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Symptom to layer to tool">
<rect x="10" y="10" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="12">Link light off</text>
<rect x="225" y="10" width="190" height="34" rx="6" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">L1 cable, optic, port</text>
<rect x="440" y="10" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="12">tester, show interfaces</text>
<rect x="10" y="52" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="74" text-anchor="middle" class="svg-ink" font-size="12">Errors, slow, freezes</text>
<rect x="225" y="52" width="190" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">L1/L2 duplex, CRC</text>
<rect x="440" y="52" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="74" text-anchor="middle" class="svg-ink" font-size="12">counters, clear, retest</text>
<rect x="10" y="94" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">Local ok, remote fails</text>
<rect x="225" y="94" width="190" height="34" rx="6" fill="#bae6fd"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">L3 gateway, route</text>
<rect x="440" y="94" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">ping, traceroute, route</text>
<rect x="10" y="136" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="158" text-anchor="middle" class="svg-ink" font-size="12">IP ok, name fails</text>
<rect x="225" y="136" width="190" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">L7 DNS</text>
<rect x="440" y="136" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="158" text-anchor="middle" class="svg-ink" font-size="12">nslookup, dig</text>
</svg><p class="cap">Symptom, then layer, then tool: the one-page map of this module.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Recite the seven steps in order, with the sub-steps of steps 1, 2 and 3.</li>
<li>Choose between top-down, bottom-up and divide and conquer, and explain why.</li>
<li>Match cable category to speed and optic to fiber type; explain crosstalk, attenuation and interference.</li>
<li>Read <code>show interfaces</code> and name what CRC, runts, giants, drops and late collisions mean.</li>
<li>Recognise administratively down, err-disabled and suspended, and fix each correctly.</li>
<li>Calculate a PoE budget and pick the right PoE standard for a device.</li>
<li>Spot an STP loop, a wrong root bridge, a wrong VLAN and an ACL in the wrong order.</li>
<li>Use longest prefix match; diagnose wrong IP, mask, gateway and DHCP pool exhaustion.</li>
<li>Explain bandwidth, throughput, latency, loss and jitter, and pick QoS versus capacity versus a physical fix.</li>
<li>Diagnose channel overlap, low SNR, coverage and roaming problems.</li>
<li>Choose the right software and hardware tool for any symptom; use nmap only with authorisation.</li>
<li>Work the three lab tickets without hints.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Divide and conquer</dt><dd>Start troubleshooting in the middle of the OSI model, usually with a ping, and move up or down.</dd>
<dt>Escalation</dt><dd>Handing a problem to someone with more skill (vertical) or to another team or vendor (horizontal), with evidence.</dd>
<dt>CRC error</dt><dd>A received frame whose checksum does not match: corruption on the wire.</dd>
<dt>Runt / giant</dt><dd>A frame below 64 bytes / above the maximum frame size.</dd>
<dt>Err-disabled</dt><dd>A port the switch shut down itself to protect the network.</dd>
<dt>PSE / PD</dt><dd>The PoE power source (switch) / the powered device (AP, phone, camera).</dd>
<dt>Bottleneck</dt><dd>The slowest link on a path, which limits end-to-end throughput.</dd>
<dt>Jitter</dt><dd>Variation in latency between packets.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: received signal minus noise floor, in dB.</dd>
<dt>VFL</dt><dd>Visual fault locator: a red laser that makes fiber breaks glow.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Method order</td><td>Identify, theory, test, plan, implement/escalate, verify + prevent, document</td></tr>
<tr><td>Not confirmed</td><td>New theory or escalate</td></tr>
<tr><td>Copper</td><td>Cat5e 1G; Cat6a 10G at 100 m; Cat8 25/40G at 30 m; 100 m channel limit</td></tr>
<tr><td>Fiber</td><td>SMF 9 micron, 1310/1550 nm, km, yellow; MMF 50/62.5 micron, 850 nm, aqua/orange</td></tr>
<tr><td>Duplex mismatch</td><td>Late collisions on half side; CRC/runts on full side</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60 W and 90 W at the port</td></tr>
<tr><td>STP</td><td>Lowest bridge ID is root; 802.1D about 30 s to forward; RSTP about 1 s</td></tr>
<tr><td>Addressing</td><td>169.254.x.x = no DHCP; local ok remote fails = gateway</td></tr>
<tr><td>Wi-Fi</td><td>2.4 GHz channels 1, 6, 11; -67 dBm and 25 dB SNR for voice</td></tr>
<tr><td>Voice QoS</td><td>Under 150 ms one way, 30 ms jitter, 1% loss</td></tr>
<tr><td>Tools</td><td>tracert ICMP, traceroute UDP; LLDP IEEE, CDP Cisco; toner finds cables</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Host side</span>
ipconfig /all        ip addr / ip route     arp -a
ping / tracert / traceroute     nslookup / dig     netstat -an
<span class="c">! Device side</span>
show ip interface brief       show interfaces [status | transceiver]
show ip route                 show ip arp
show mac address-table        show vlan brief
show running-config           show power inline
show spanning-tree vlan 10    show access-lists
show cdp neighbors / show lldp neighbors
clear counters                ping 10.0.12.2 repeat 100</pre>

<div class="warn"><p><b>Common last-minute mistakes.</b> Swapping steps 6 and 7. Confusing crosstalk with EMI. Thinking AD beats longest prefix. Forgetting that output drops mean congestion, not a bad cable. Choosing a fix answer when the question asks for the next <b>step</b>.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Performance-based questions may give you a topology and a symptom: place the symptom on a layer, then choose the command that tests that layer. For multiple-choice "what next" questions, find which step the scenario has already completed, and choose the step after it.</p></div>

<div class="scn"><h4>The first week on the NOC</h4><p>A new NOC engineer, fresh from Network+, got three tickets on her first night: a floor with APIPA addresses, a branch with choppy calls, and an uplink flapping in the data center. She worked each one separately. The first was a DHCP pool at 100% (lease shortened, scope expanded); the second was WAN congestion at backup time (QoS added); the third was an LR optic reading -15 dBm (connector cleaned, Rx back to -3 dBm). Every ticket had symptom, root cause, actions and lessons learned written up by morning. Her lead's only comment: "This is exactly how I want tickets written."</p><p><b>Lesson:</b> the method plus the right tool per layer turns a scary night into routine work.</p></div>

<div class="iv"><p class="q">"What is the most important troubleshooting habit you have?"</p><p>A strong answer picks one habit and backs it with the method: for example, "I always check what changed and reproduce the problem before I touch anything", or "I always verify with the real application and write the root cause". Link it to a short example and to the seven steps, and show that you think about side effects on other users.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 5.0 is method (5.1), physical (5.2), services (5.3), performance (5.4) and tools (5.5).</li>
<li>Symptom, then layer, then tool: the fastest route to a proven root cause.</li>
<li>Counters, tables and captures give evidence; change one thing at a time.</li>
<li>Verify with the real application; one symptom can hide two faults.</li>
<li>Document every ticket so the next engineer, and the next you, is faster.</li>
</ul></div>
`,hi:`
<p>Aapne domain 5.0 poora cover kar liya hai, N10-009 ka sabse bada domain. Yeh chapter exam se pehle aapka final check hai aur job par quick reference. Checklist zor se padho: agar koi item confidence se nahi kar sakte, to uske chapter par wapas jao.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Symptom se layer se tool">
<rect x="10" y="10" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="12">Link light off</text>
<rect x="225" y="10" width="190" height="34" rx="6" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="12">L1 cable, optic, port</text>
<rect x="440" y="10" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="12">tester, show interfaces</text>
<rect x="10" y="52" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="74" text-anchor="middle" class="svg-ink" font-size="12">Errors, slow, atakna</text>
<rect x="225" y="52" width="190" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">L1/L2 duplex, CRC</text>
<rect x="440" y="52" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="74" text-anchor="middle" class="svg-ink" font-size="12">counters, clear, retest</text>
<rect x="10" y="94" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="12">Local ok, remote fail</text>
<rect x="225" y="94" width="190" height="34" rx="6" fill="#bae6fd"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">L3 gateway, route</text>
<rect x="440" y="94" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="116" text-anchor="middle" class="svg-ink" font-size="12">ping, traceroute, route</text>
<rect x="10" y="136" width="190" height="34" rx="6" fill="#fde68a"/><text x="105" y="158" text-anchor="middle" class="svg-ink" font-size="12">IP ok, naam fail</text>
<rect x="225" y="136" width="190" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="12">L7 DNS</text>
<rect x="440" y="136" width="190" height="34" rx="6" fill="#e2e8f0"/><text x="535" y="158" text-anchor="middle" class="svg-ink" font-size="12">nslookup, dig</text>
</svg><p class="cap">Symptom, phir layer, phir tool: is module ka ek page ka naksha.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Saat steps order mein bolo, steps 1, 2 aur 3 ke sub-steps ke saath.</li>
<li>Top-down, bottom-up aur divide and conquer mein se chuno, aur batao kyun.</li>
<li>Cable category ko speed se aur optic ko fiber type se match karo; crosstalk, attenuation aur interference samjhao.</li>
<li><code>show interfaces</code> padho aur batao CRC, runts, giants, drops aur late collisions ka kya matlab hai.</li>
<li>Administratively down, err-disabled aur suspended pehchano, aur har ek ko sahi tarah fix karo.</li>
<li>PoE budget calculate karo aur device ke liye sahi PoE standard chuno.</li>
<li>STP loop, galat root bridge, galat VLAN aur galat order wala ACL pakdo.</li>
<li>Longest prefix match use karo; galat IP, mask, gateway aur DHCP pool exhaustion diagnose karo.</li>
<li>Bandwidth, throughput, latency, loss aur jitter samjhao, aur QoS vs capacity vs physical fix chuno.</li>
<li>Channel overlap, kam SNR, coverage aur roaming problems diagnose karo.</li>
<li>Har symptom ke liye sahi software aur hardware tool chuno; nmap sirf authorisation ke saath use karo.</li>
<li>Teeno lab tickets bina hints ke solve karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Divide and conquer</dt><dd>OSI model ke beech se troubleshooting shuru karna, aam taur par ping se, aur upar ya neeche jaana.</dd>
<dt>Escalation</dt><dd>Problem ko zyada skill wale (vertical) ya doosri team ya vendor (horizontal) ko evidence ke saath saunpna.</dd>
<dt>CRC error</dt><dd>Aisa received frame jiska checksum match nahi karta: wire par corruption.</dd>
<dt>Runt / giant</dt><dd>64 bytes se chhota frame / maximum frame size se bada frame.</dd>
<dt>Err-disabled</dt><dd>Aisa port jise switch ne network bachane ke liye khud band kiya.</dd>
<dt>PSE / PD</dt><dd>PoE power source (switch) / powered device (AP, phone, camera).</dd>
<dt>Bottleneck</dt><dd>Path ka sabse slow link, jo end-to-end throughput limit karta hai.</dd>
<dt>Jitter</dt><dd>Packets ke beech latency ka variation.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: received signal minus noise floor, dB mein.</dd>
<dt>VFL</dt><dd>Visual fault locator: laal laser jo fiber breaks ko chamka deta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Method order</td><td>Identify, theory, test, plan, implement/escalate, verify + prevent, document</td></tr>
<tr><td>Confirm nahi hua</td><td>Nayi theory ya escalate</td></tr>
<tr><td>Copper</td><td>Cat5e 1G; Cat6a 100 m par 10G; Cat8 30 m par 25/40G; 100 m channel limit</td></tr>
<tr><td>Fiber</td><td>SMF 9 micron, 1310/1550 nm, km, peela; MMF 50/62.5 micron, 850 nm, aqua/orange</td></tr>
<tr><td>Duplex mismatch</td><td>Half side par late collisions; full side par CRC/runts</td></tr>
<tr><td>PoE</td><td>Port par af 15.4 W, at 30 W, bt 60 W aur 90 W</td></tr>
<tr><td>STP</td><td>Sabse chhota bridge ID root; 802.1D forward tak lagbhag 30 s; RSTP lagbhag 1 s</td></tr>
<tr><td>Addressing</td><td>169.254.x.x = DHCP nahi; local ok remote fail = gateway</td></tr>
<tr><td>Wi-Fi</td><td>2.4 GHz channels 1, 6, 11; voice ke liye -67 dBm aur 25 dB SNR</td></tr>
<tr><td>Voice QoS</td><td>One way 150 ms se kam, jitter 30 ms, loss 1%</td></tr>
<tr><td>Tools</td><td>tracert ICMP, traceroute UDP; LLDP IEEE, CDP Cisco; toner cables dhoondhta hai</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Host side</span>
ipconfig /all        ip addr / ip route     arp -a
ping / tracert / traceroute     nslookup / dig     netstat -an
<span class="c">! Device side</span>
show ip interface brief       show interfaces [status | transceiver]
show ip route                 show ip arp
show mac address-table        show vlan brief
show running-config           show power inline
show spanning-tree vlan 10    show access-lists
show cdp neighbors / show lldp neighbors
clear counters                ping 10.0.12.2 repeat 100</pre>

<div class="warn"><p><b>Aakhri minute ki common galtiyan.</b> Steps 6 aur 7 ko ulat dena. Crosstalk ko EMI samajh lena. Yeh sochna ki AD longest prefix ko harata hai. Yeh bhoolna ki output drops matlab congestion, kharab cable nahi. Jab sawaal agla <b>step</b> poochhe tab fix wala answer chunna.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Performance-based questions aapko topology aur symptom de sakte hain: symptom ko layer par rakho, phir woh command chuno jo us layer ko test kare. Multiple-choice "what next" sawaalon mein dekho scenario ne kaunsa step pehle hi poora kar liya hai, aur uske baad wala step chuno.</p></div>

<div class="scn"><h4>NOC par pehla hafta</h4><p>Ek nayi NOC engineer, Network+ ke turant baad, ko pehli raat teen tickets mile: APIPA addresses wala ek floor, choppy calls wali ek branch, aur data center mein flap karta ek uplink. Usne har ek ko alag se solve kiya. Pehla 100% par DHCP pool tha (lease chhota kiya, scope bada kiya); doosra backup time par WAN congestion tha (QoS joda); teesra -15 dBm padhta LR optic tha (connector clean kiya, Rx wapas -3 dBm). Subah tak har ticket mein symptom, root cause, actions aur lessons learned likhe the. Uske lead ka ek hi comment: "Mujhe tickets bilkul aise hi likhe hue chahiye."</p><p><b>Seekh:</b> method plus har layer ke liye sahi tool ek darawni raat ko routine kaam bana deta hai.</p></div>

<div class="iv"><p class="q">"Aapki sabse zaroori troubleshooting habit kya hai?"</p><p>Strong answer ek habit chunta hai aur use method se support karta hai: jaise, "main kuch bhi chhoone se pehle hamesha check karta hoon kya badla aur problem reproduce karta hoon", ya "main hamesha asli application se verify karta hoon aur root cause likhta hoon". Ise ek chhote example aur saat steps se jodo, aur dikhao ki aap doosre users par side effects ke baare mein sochte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 5.0 hai method (5.1), physical (5.2), services (5.3), performance (5.4) aur tools (5.5).</li>
<li>Symptom, phir layer, phir tool: saabit root cause tak sabse tez raasta.</li>
<li>Counters, tables aur captures evidence dete hain; ek time par ek cheez badlo.</li>
<li>Asli application se verify karo; ek symptom do faults chhupa sakta hai.</li>
<li>Har ticket document karo taaki agla engineer, aur agla aap, tez ho.</li>
</ul></div>
`}};export{e as default};