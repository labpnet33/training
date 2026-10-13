var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a highway between two cities: the road, the speed limit, the lane rules and the CCTV. You now know each of those in engineering terms, can configure and verify them on Cisco IOS, and have fixed a real duplex mismatch in the lab. Use this chapter as your revision sheet before the exam and before interviews.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="200" height="56" rx="8" fill="#bae6fd"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Media</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">UTP, MMF, SMF, SFP, PoE</text>
<rect x="220" y="20" width="200" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Link rules</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex, autoneg</text>
<rect x="430" y="20" width="200" height="56" rx="8" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">status, counters, logs</text>
<rect x="115" y="96" width="410" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Switching</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">learn source, forward, filter, flood, age</text>
</svg><p class="cap">Four blocks of the module, all at Layer 1 and Layer 2.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Choose copper or fibre, and multimode or single-mode, for a given distance and speed.</li>
<li>Name UTP categories and their speeds; explain the 100 m limit.</li>
<li>Explain MDI, MDI-X, straight-through, crossover and Auto-MDIX.</li>
<li>Decode names such as 1000BASE-T, 1000BASE-LX, 10GBASE-SR and 100GBASE-SR4.</li>
<li>Identify SFP, SFP+, SFP28, QSFP and the LC, SC and MPO connectors.</li>
<li>State the PoE standards and wattages; read <code>show power inline</code>.</li>
<li>Explain half and full duplex, CSMA/CD, collision and broadcast domains.</li>
<li>Predict auto-negotiation results for auto/auto, fixed/fixed and fixed/auto.</li>
<li>Configure <code>speed</code> and <code>duplex</code> and verify with <code>show interfaces status</code>.</li>
<li>Read status/protocol combinations and recover err-disabled ports.</li>
<li>Explain runts, giants, CRC, collisions, late collisions and output drops.</li>
<li>Diagnose and fix a duplex mismatch, then prove it with <code>clear counters</code>.</li>
<li>Describe MAC learning, aging, forwarding, filtering and flooding.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>UTP</dt><dd>Unshielded twisted pair, four pairs, RJ-45, 100 m.</dd>
<dt>MMF / SMF</dt><dd>Multimode (50 µm core, hundreds of metres) / single-mode (9 µm core, kilometres).</dd>
<dt>SFP</dt><dd>Small form-factor pluggable transceiver; SFP+ for 10G.</dd>
<dt>PSE / PD</dt><dd>PoE power source (switch) / powered device (phone, AP).</dd>
<dt>Auto-MDIX</dt><dd>Automatic swap of transmit and receive pairs.</dd>
<dt>Auto-negotiation</dt><dd>FLP-based exchange that picks the best common speed and duplex.</dd>
<dt>Parallel detection</dt><dd>How an auto port senses speed when the neighbour does not negotiate.</dd>
<dt>CSMA/CD</dt><dd>Half-duplex access method: listen, send, detect collisions, back off.</dd>
<dt>Late collision</dt><dd>A collision after the first 64 bytes; points to duplex mismatch.</dd>
<dt>Runt / giant</dt><dd>Frame under 64 bytes / over the maximum size.</dd>
<dt>CRC</dt><dd>FCS check failure: the frame was damaged in transit.</dd>
<dt>err-disabled</dt><dd>Port shut by the switch because a protection feature triggered.</dd>
<dt>MAC table</dt><dd>Per-VLAN list of MAC to port, learned from source addresses, aged at 300 s.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Copper</td><td>100 m; Cat5e 1G; Cat6A 10G at 100 m; 1000BASE-T uses 4 pairs</td></tr>
<tr><td>Fibre</td><td>MMF short, SMF long; SX/SR multimode, LX/LR single-mode; immune to EMI</td></tr>
<tr><td>Crossover</td><td>Like devices: switch-switch, router-router, PC-PC, PC-router</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60/90 W, UPOE 60 W, UPOE+ 90 W</td></tr>
<tr><td>Autoneg fallback</td><td>Speed sensed; duplex half at 10/100, full at 1000</td></tr>
<tr><td>Speed mismatch</td><td>Link down (notconnect)</td></tr>
<tr><td>Duplex mismatch</td><td>Link up; half side late collisions, full side CRC and runts</td></tr>
<tr><td>Frame sizes</td><td>64 to 1518 bytes (1522 with 802.1Q)</td></tr>
<tr><td>Domains</td><td>Switch port = 1 collision domain; VLAN or router interface = 1 broadcast domain</td></tr>
<tr><td>MAC table</td><td>Learn source, flood unknown and broadcast within VLAN, age 300 s</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! configure</span>
interface fa0/1
 description UPLINK-R1
 speed auto | 10 | 100
 duplex auto | full | half
 mdix auto
 power inline auto | never | static max 30000
 shutdown / no shutdown
errdisable recovery cause link-flap
mac address-table aging-time 300
<span class="c">! verify</span>
show ip interface brief
show interfaces status
show interfaces status err-disabled
show interfaces fa0/1
show interfaces fa0/1 counters errors
show interfaces transceiver
show power inline
show mac address-table dynamic
clear counters
test cable-diagnostics tdr interface gi1/0/5</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Hard-coding only one end. Assuming a Gi port runs at 1 Gbps. Reading counters without clearing them. Fixing the side that shows errors instead of the side with the wrong configuration. Mixing SR and LR optics.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> "Administratively down" is always <code>shutdown</code>. Up/up with poor throughput suggests a duplex mismatch. Late collisions identify the half-duplex side. CSMA/CD is half duplex only. Switches learn from source, never destination.</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard</h4><p>A fresher interviewing for a NOC role was shown two outputs: one interface with <code>Half-duplex</code> and 150 late collisions, the other with <code>Full-duplex</code> and 90 CRC errors, both up/up. She said: "These are the two ends of one link with a duplex mismatch. The full-duplex side is probably hard-coded, the half side is on auto and fell back to half. I would set both to auto, clear counters, run a ping with 1000 packets and confirm the counters stay at zero." She got the job, because she answered with evidence, cause, fix and proof.</p><p><b>Lesson:</b> structure every answer as symptom, evidence, cause, fix and verification.</p></div>

<div class="iv"><p class="q">"In one minute, what do you check on any interface that users complain about?"</p><p>Strong answer: state and protocol; speed and duplex on both ends, including whether values are negotiated (<code>a-</code>); error counters (CRC, runts, giants, collisions, late collisions) and output drops, after clearing and generating traffic; logs for CDP duplex mismatch and err-disable reasons; for fibre, DOM light levels; for PoE devices, the power budget. Then fix one thing and prove the counters stay clean.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pick the medium by distance and speed: copper to 100 m, MMF to hundreds of metres, SMF to kilometres.</li>
<li>Auto on both ends, or fixed and identical on both ends.</li>
<li>Speed mismatch = link down; duplex mismatch = link up with late collisions and CRC.</li>
<li>Counters are evidence: clear, test, compare both ends.</li>
<li>Switches learn source MACs, forward known unicast, flood unknown and broadcast within the VLAN. Next up: IPv4 addressing.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module do shehron ke beech highway se shuru kiya tha: sadak, speed limit, lane rules aur CCTV. Ab aap in sabko engineering terms mein jaante ho, Cisco IOS par configure aur verify kar sakte ho, aur lab mein ek real duplex mismatch fix kar chuke ho. Exam aur interviews se pehle is chapter ko apni revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="200" height="56" rx="8" fill="#bae6fd"/><text x="110" y="44" text-anchor="middle" class="svg-ink" font-size="13">Media</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="12">UTP, MMF, SMF, SFP, PoE</text>
<rect x="220" y="20" width="200" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">Link rules</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex, autoneg</text>
<rect x="430" y="20" width="200" height="56" rx="8" fill="#fde68a"/><text x="530" y="44" text-anchor="middle" class="svg-ink" font-size="13">Saboot</text><text x="530" y="62" text-anchor="middle" class="svg-muted" font-size="12">status, counters, logs</text>
<rect x="115" y="96" width="410" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Switching</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">source seekho, forward, filter, flood, age</text>
</svg><p class="cap">Module ke chaar blocks, sab Layer 1 aur Layer 2 par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Di gayi doori aur speed ke liye copper ya fibre, aur multimode ya single-mode chun sako.</li>
<li>UTP categories aur unki speeds ke naam le sako; 100 m limit samjha sako.</li>
<li>MDI, MDI-X, straight-through, crossover aur Auto-MDIX samjha sako.</li>
<li>1000BASE-T, 1000BASE-LX, 10GBASE-SR aur 100GBASE-SR4 jaise naam decode kar sako.</li>
<li>SFP, SFP+, SFP28, QSFP aur LC, SC aur MPO connectors pehchan sako.</li>
<li>PoE standards aur wattages bata sako; <code>show power inline</code> padh sako.</li>
<li>Half aur full duplex, CSMA/CD, collision aur broadcast domains samjha sako.</li>
<li>auto/auto, fixed/fixed aur fixed/auto ke auto-negotiation results predict kar sako.</li>
<li><code>speed</code> aur <code>duplex</code> configure karke <code>show interfaces status</code> se verify kar sako.</li>
<li>Status/protocol combinations padh sako aur err-disabled ports recover kar sako.</li>
<li>Runts, giants, CRC, collisions, late collisions aur output drops samjha sako.</li>
<li>Duplex mismatch diagnose aur fix kar sako, phir <code>clear counters</code> se prove kar sako.</li>
<li>MAC learning, aging, forwarding, filtering aur flooding describe kar sako.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>UTP</dt><dd>Unshielded twisted pair, chaar pairs, RJ-45, 100 m.</dd>
<dt>MMF / SMF</dt><dd>Multimode (50 µm core, kuch sau metre) / single-mode (9 µm core, kilometres).</dd>
<dt>SFP</dt><dd>Small form-factor pluggable transceiver; 10G ke liye SFP+.</dd>
<dt>PSE / PD</dt><dd>PoE power source (switch) / powered device (phone, AP).</dd>
<dt>Auto-MDIX</dt><dd>Transmit aur receive pairs ka automatic swap.</dd>
<dt>Auto-negotiation</dt><dd>FLP-based exchange jo best common speed aur duplex chunta hai.</dd>
<dt>Parallel detection</dt><dd>Jab neighbour negotiate na kare to auto port speed kaise sense karta hai.</dd>
<dt>CSMA/CD</dt><dd>Half-duplex access method: suno, bhejo, collisions detect karo, back off karo.</dd>
<dt>Late collision</dt><dd>Pehle 64 bytes ke baad collision; duplex mismatch ki taraf ishara.</dd>
<dt>Runt / giant</dt><dd>64 bytes se chhota frame / maximum size se bada.</dd>
<dt>CRC</dt><dd>FCS check fail: frame raaste mein damage hua.</dd>
<dt>err-disabled</dt><dd>Switch ne port band kiya kyunki koi protection feature trigger hua.</dd>
<dt>MAC table</dt><dd>MAC se port ki per-VLAN list, source addresses se seekhi gayi, 300 s par age hoti hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Copper</td><td>100 m; Cat5e 1G; Cat6A 100 m par 10G; 1000BASE-T 4 pairs use karta hai</td></tr>
<tr><td>Fibre</td><td>MMF kam doori, SMF zyada; SX/SR multimode, LX/LR single-mode; EMI se immune</td></tr>
<tr><td>Crossover</td><td>Same type devices: switch-switch, router-router, PC-PC, PC-router</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60/90 W, UPOE 60 W, UPOE+ 90 W</td></tr>
<tr><td>Autoneg fallback</td><td>Speed sense hoti hai; duplex 10/100 par half, 1000 par full</td></tr>
<tr><td>Speed mismatch</td><td>Link down (notconnect)</td></tr>
<tr><td>Duplex mismatch</td><td>Link up; half side late collisions, full side CRC aur runts</td></tr>
<tr><td>Frame sizes</td><td>64 se 1518 bytes (802.1Q ke saath 1522)</td></tr>
<tr><td>Domains</td><td>Switch port = 1 collision domain; VLAN ya router interface = 1 broadcast domain</td></tr>
<tr><td>MAC table</td><td>Source seekho, unknown aur broadcast VLAN ke andar flood, 300 s age</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! configure</span>
interface fa0/1
 description UPLINK-R1
 speed auto | 10 | 100
 duplex auto | full | half
 mdix auto
 power inline auto | never | static max 30000
 shutdown / no shutdown
errdisable recovery cause link-flap
mac address-table aging-time 300
<span class="c">! verify</span>
show ip interface brief
show interfaces status
show interfaces status err-disabled
show interfaces fa0/1
show interfaces fa0/1 counters errors
show interfaces transceiver
show power inline
show mac address-table dynamic
clear counters
test cable-diagnostics tdr interface gi1/0/5</pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> Sirf ek end hard-code karna. Yeh maan lena ki Gi port 1 Gbps par chal raha hai. Counters bina clear kiye padhna. Galat configuration wali side ke bajaye errors dikhane wali side fix karna. SR aur LR optics mix karna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> "Administratively down" hamesha <code>shutdown</code> hai. Kharab throughput ke saath up/up duplex mismatch ka ishara hai. Late collisions half-duplex side pehchante hain. CSMA/CD sirf half duplex hai. Switches source se seekhte hain, destination se kabhi nahi.</p></div>

<div class="scn"><h4>Woh interview jo whiteboard ban gaya</h4><p>NOC role ke liye interview de rahi ek fresher ko do outputs dikhaye gaye: ek interface <code>Half-duplex</code> aur 150 late collisions ke saath, dusra <code>Full-duplex</code> aur 90 CRC errors ke saath, dono up/up. Usne kaha: "Yeh ek link ke do ends hain jismein duplex mismatch hai. Full-duplex side shayad hard-coded hai, half side auto par hai aur half par gir gayi. Main dono ko auto karungi, counters clear karungi, 1000 packets ka ping chalaungi aur confirm karungi ki counters zero par rahein." Use job mil gayi, kyunki usne saboot, cause, fix aur proof ke saath jawab diya.</p><p><b>Seekh:</b> har jawab ko symptom, saboot, cause, fix aur verification ki tarah structure karo.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao, jis interface ki users complain karein us par aap kya check karte ho?"</p><p>Strong answer: state aur protocol; dono ends par speed aur duplex, yeh bhi ki values negotiated hain ya nahi (<code>a-</code>); clear karke aur traffic generate karke error counters (CRC, runts, giants, collisions, late collisions) aur output drops; CDP duplex mismatch aur err-disable reasons ke liye logs; fibre ke liye DOM light levels; PoE devices ke liye power budget. Phir ek cheez fix karo aur prove karo ki counters clean rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Medium doori aur speed se chuno: copper 100 m tak, MMF kuch sau metre tak, SMF kilometres tak.</li>
<li>Dono ends auto, ya dono ends fixed aur ek jaise.</li>
<li>Speed mismatch = link down; duplex mismatch = link up, late collisions aur CRC ke saath.</li>
<li>Counters saboot hain: clear karo, test karo, dono ends compare karo.</li>
<li>Switches source MACs seekhte hain, known unicast forward karte hain, unknown aur broadcast VLAN ke andar flood karte hain. Agla: IPv4 addressing.</li>
</ul></div>
`}};export{e as default};