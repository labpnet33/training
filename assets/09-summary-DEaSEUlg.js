var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now bring up a voice-ready edge: power the phone, tell it its VLAN, carry voice and data on one port, and find faults quickly. This chapter condenses the module for JN0-650.</p>

<h3>The three jobs</h3>
<table class="cmp"><tr><th>Job</th><th>Feature</th><th>Key commands</th></tr>
<tr><td>Power</td><td>PoE (802.3af, at, bt)</td><td><code>set poe interface all</code>, <code>show poe interface</code>, <code>show poe controller</code></td></tr>
<tr><td>Policy</td><td>LLDP and LLDP-MED</td><td><code>set protocols lldp interface all</code>, <code>set protocols lldp-med interface all</code>, <code>show lldp neighbors</code></td></tr>
<tr><td>Segmentation</td><td>voice VLAN</td><td><code>set switch-options voip interface ge-0/0/1.0 vlan VOICE</code>, <code>show ethernet-switching interface</code></td></tr></table>

<h3>Numbers to remember</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>802.3af / at / bt maximum at the port</td><td>15.4 W / 30 W / up to 90 W</td></tr>
<tr><td>Class 0, 1, 2, 3, 4 maximum</td><td>15.4, 4, 7, 15.4, 30 W</td></tr>
<tr><td>LLDP interval, hold multiplier, TTL</td><td>30 s, 4, 120 s</td></tr>
<tr><td>Voice marking</td><td>DSCP 46 (EF), 802.1p 5</td></tr>
<tr><td>Lab results</td><td>static 30.8 W of 124 W; class 21.0 W of 32 W</td></tr></table>

<h3>Checklist</h3>
<ul>
<li>Static PoE reserves the port maximum; class reserves by class; neither equals real consumption.</li>
<li>Priority high keeps critical ports powered when the budget is short; guard band protects the budget.</li>
<li>LLDP discovers; LLDP-MED sends network policy, power details, inventory and location.</li>
<li>"Policy: unknown (none received from this switch)" means MED is off or the voip statement is missing.</li>
<li>Phone ports are access ports in DATA with VOICE added tagged under switch-options voip.</li>
<li>Voice needs DSCP 46 trust and a priority queue, DHCP in VOICE and, if used, 802.1X multiple handling.</li>
<li>Troubleshoot: power, LLDP, policy, VLAN, address.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="20" y="40" width="170" height="70" rx="10" fill="#fecaca"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">PoE</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="11">powers the phone</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">LLDP-MED</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">tells it the policy</text>
<rect x="450" y="40" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Voice VLAN</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="11">separates the traffic</text>
</svg><p class="cap">Power, policy, segmentation.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Mixing PoE standards and classes, forgetting that a port can be Enabled and OFF, and assuming MED provides an IP address.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the question for the layer: power (poe), discovery (lldp), policy (lldp-med) or VLAN (voip). Pick the command of that layer.</p></div>

<div class="scn"><h4>The 5-minute turn-up</h4><p>New floor, 24 ports, 40 phones: enable PoE, LLDP and MED on all ports, add voip on each phone port, verify one port with each show command, and ping the call server from a phone. Done.</p><p><b>Lesson:</b> a repeatable checklist beats improvisation.</p></div>

<div class="iv"><p class="q">"Summarise how you deploy IP phones."</p><p>Power with PoE and a suitable management mode and priorities; enable LLDP and LLDP-MED so the phone learns the voice VLAN, DSCP and priority; add the voice VLAN tagged with switch-options voip while data stays untagged; make sure QoS and DHCP exist for the voice VLAN; then verify with show poe, show lldp neighbors and show ethernet-switching interface.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three jobs: power, policy, voice VLAN.</li>
<li>Know the PoE numbers and the difference between static and class management.</li>
<li>Know the real signature of each fault.</li>
<li>Practise Labs 1 and 2 until the commands are automatic.</li>
</ul></div>
`,hi:`
<p>Ab aap voice-ready edge bana sakte hain: phone ko power do, use uska VLAN batao, ek port par voice aur data chalao, aur faults jaldi dhoondo. Yeh chapter JN0-650 ke liye module ko sankshep mein deta hai.</p>

<h3>Teen kaam</h3>
<table class="cmp"><tr><th>Kaam</th><th>Feature</th><th>Key commands</th></tr>
<tr><td>Power</td><td>PoE (802.3af, at, bt)</td><td><code>set poe interface all</code>, <code>show poe interface</code>, <code>show poe controller</code></td></tr>
<tr><td>Policy</td><td>LLDP aur LLDP-MED</td><td><code>set protocols lldp interface all</code>, <code>set protocols lldp-med interface all</code>, <code>show lldp neighbors</code></td></tr>
<tr><td>Segmentation</td><td>voice VLAN</td><td><code>set switch-options voip interface ge-0/0/1.0 vlan VOICE</code>, <code>show ethernet-switching interface</code></td></tr></table>

<h3>Yaad rakhne wale numbers</h3>
<table class="cmp"><tr><th>Item</th><th>Value</th></tr>
<tr><td>802.3af / at / bt port par maximum</td><td>15.4 W / 30 W / 90 W tak</td></tr>
<tr><td>Class 0, 1, 2, 3, 4 maximum</td><td>15.4, 4, 7, 15.4, 30 W</td></tr>
<tr><td>LLDP interval, hold multiplier, TTL</td><td>30 s, 4, 120 s</td></tr>
<tr><td>Voice marking</td><td>DSCP 46 (EF), 802.1p 5</td></tr>
<tr><td>Lab results</td><td>static 124 W mein 30.8 W; class 32 W mein 21.0 W</td></tr></table>

<h3>Checklist</h3>
<ul>
<li>Static PoE port maximum reserve karta hai; class, class ke hisaab se; dono asal consumption ke barabar nahi.</li>
<li>Priority high budget kam hone par critical ports ko powered rakhti hai; guard band budget ki raksha karta hai.</li>
<li>LLDP discover karta hai; LLDP-MED network policy, power details, inventory aur location bhejta hai.</li>
<li>"Policy: unknown (none received from this switch)" matlab MED off ya voip statement missing.</li>
<li>Phone ports DATA ke access ports hain, switch-options voip ke neeche VOICE tagged jodi jaati hai.</li>
<li>Voice ko DSCP 46 trust aur priority queue, VOICE mein DHCP aur, agar use ho, 802.1X multiple handling chahiye.</li>
<li>Troubleshoot: power, LLDP, policy, VLAN, address.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module recap">
<rect x="20" y="40" width="170" height="70" rx="10" fill="#fecaca"/><text x="105" y="70" text-anchor="middle" class="svg-ink" font-size="13">PoE</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="11">phone ko power</text>
<rect x="235" y="40" width="170" height="70" rx="10" fill="#fde68a"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">LLDP-MED</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">policy batata hai</text>
<rect x="450" y="40" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">Voice VLAN</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="11">traffic alag karta hai</text>
</svg><p class="cap">Power, policy, segmentation.</p></div>

<div class="warn"><p><b>Common mistakes.</b> PoE standards aur classes mix karna, yeh bhoolna ki port Enabled aur OFF dono ho sakta hai, aur maan lena ki MED IP address deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal se layer pehchano: power (poe), discovery (lldp), policy (lldp-med) ya VLAN (voip). Usi layer ka command chuno.</p></div>

<div class="scn"><h4>5 minute ka turn-up</h4><p>Naya floor, 24 ports, 40 phones: sab ports par PoE, LLDP aur MED enable karo, har phone port par voip jodo, ek port par har show command se verify karo, aur phone se call server ping karo. Ho gaya.</p><p><b>Lesson:</b> doharaya ja sakne wala checklist improvisation se behtar hai.</p></div>

<div class="iv"><p class="q">"IP phones kaise deploy karte ho, sankshep mein batao."</p><p>Suitable management mode aur priorities ke saath PoE se power; LLDP aur LLDP-MED enable taaki phone voice VLAN, DSCP aur priority seekhe; switch-options voip se voice VLAN tagged jodna jabki data untagged rahe; voice VLAN ke liye QoS aur DHCP pakka karna; phir show poe, show lldp neighbors aur show ethernet-switching interface se verify.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen kaam: power, policy, voice VLAN.</li>
<li>PoE numbers aur static vs class management ka fark jaano.</li>
<li>Har fault ki asli signature jaano.</li>
<li>Lab 1 aur 2 tab tak practice karo jab tak commands automatic na ho jaayein.</li>
</ul></div>
`}};export{e as default};