var e={id:`interfaces-ports-poe`,h:{en:`Interface counters, port status and PoE`,hi:`Interface counters, port status aur PoE`},body:{en:`
<p>If cables are roads, the interface counters are the traffic police report: how many vehicles passed, how many crashed, how many were turned away. A switch or router counts every frame it receives and sends, and every error. Reading those counters is the fastest way to prove a physical or data link fault. This chapter covers the counters in objective 5.2, the port states you must recognise, duplex mismatch, and Power over Ethernet (PoE) problems.</p>

<h3>The counters that matter</h3>
<dl class="terms">
<dt>CRC (cyclic redundancy check) errors</dt><dd>The frame arrived, but its frame check sequence did not match the contents. Something corrupted it on the wire: a bad cable or connector, EMI, a failing optic, or a duplex mismatch (seen on the full-duplex side).</dd>
<dt>Runts</dt><dd>Frames smaller than the Ethernet minimum of 64 bytes. Usually fragments left behind by collisions, so they point to duplex problems or a faulty NIC.</dd>
<dt>Giants</dt><dd>Frames larger than the maximum (1518 bytes untagged, 1522 with an 802.1Q tag). Usually an MTU mismatch: one side sends jumbo frames, the other side does not accept them.</dd>
<dt>Drops</dt><dd><b>Input drops</b>: the device could not accept frames fast enough (full input queue). <b>Output drops</b>: the egress buffer was full, typically congestion, such as a 10G link feeding a 1G link. Drops are a performance symptom, not a cable fault.</dd>
<dt>Late collisions</dt><dd>A collision detected after the first 64 bytes of a frame. On a modern network this almost always means the local side runs half duplex against a full-duplex neighbour.</dd>
</dl>

<pre class="out">R1# show interfaces fa0/0
FastEthernet0/0 is up, line protocol is up
  Internet address is 10.0.12.1/24
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
  <span class="hl">Half-duplex, 100Mb/s, 100BaseTX/FX</span>
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
     1520 packets input, 152040 bytes, 0 no buffer
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     1498 packets output, 149800 bytes, 0 underruns
     0 output errors, 37 collisions, 0 interface resets
     <span class="hl">0 babbles, 37 late collision, 0 deferred</span></pre>

<h3>Duplex mismatch, step by step</h3>
<p>Full duplex means both sides send and receive at the same time. Half duplex means a side listens first and stops if it hears the other side (collision detection). Both ends normally <b>autonegotiate</b> speed and duplex. The fault appears when one side is hard-coded (say <code>speed 100</code> and <code>duplex full</code>) and so stops negotiating. The other side, still on auto, can sense the speed from the signal, but it cannot learn the duplex, so at 10 or 100 Mbps it falls back to <b>half duplex</b>.</p>
<ul>
<li>The <b>half-duplex</b> side sees the neighbour transmitting while it transmits, so it logs <b>collisions and late collisions</b>.</li>
<li>The <b>full-duplex</b> side receives frames the other side cut off, so it logs <b>CRC errors and runts</b>.</li>
<li>Small pings mostly succeed; bulk traffic (file copies, database apps) crawls and "freezes". That is exactly the symptom in the slow-link lab.</li>
</ul>
<p>The fix is to set <b>both sides the same</b>, ideally both on auto (<code>speed auto</code>, <code>duplex auto</code>), then clear the counters and confirm they stay at zero. Gigabit copper (1000BASE-T) requires autonegotiation, so duplex mismatches are mainly a 10/100 problem.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Duplex mismatch between R1 and SW1">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#fed7aa"/><text x="105" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1 Fa0/0 (auto)</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">falls back to half</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">SW1 Fa0/1</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">speed 100, duplex full</text>
<line x1="190" y1="70" x2="450" y2="70" stroke="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">no duplex negotiation</text>
<text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="12">logs late collisions</text>
<text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="12">logs CRC and runts</text>
</svg><p class="cap">One hard-coded end makes the other fall back to half duplex. Each side then reports a different error.</p></div>

<h3>Port status</h3>
<table class="cmp"><tr><th>State</th><th>How it looks</th><th>Meaning and fix</th></tr>
<tr><td><b>Administratively down</b></td><td><code>show ip interface brief</code>: administratively down / down; <code>show interfaces status</code>: disabled</td><td>Someone typed <code>shutdown</code>. Fix: <code>no shutdown</code>, after checking why it was shut.</td></tr>
<tr><td><b>Error-disabled</b></td><td>err-disabled; line protocol down (err-disabled)</td><td>The switch shut the port for protection: port security, BPDU Guard, UDLD, link flap, EtherChannel misconfiguration, unsupported transceiver. Fix the cause, then <code>shutdown</code> / <code>no shutdown</code> (or automatic errdisable recovery).</td></tr>
<tr><td><b>Suspended</b></td><td>Flag (s) in <code>show etherchannel summary</code>; suspended in status</td><td>An EtherChannel member whose speed, duplex, VLAN or trunk settings differ from the bundle, or whose peer is not negotiating LACP. Fix the mismatch.</td></tr>
<tr><td><b>Down / notconnect</b></td><td>down / down; notconnect</td><td>No link signal: cable, optic, far end off, TX/RX transposed.</td></tr>
</table>
<pre class="out">SW1# show interfaces status err-disabled
Port      Name        Status         Reason               Err-disabled Vlans
<span class="hl">Gi1/0/7   Desk-3-14   err-disabled   bpduguard</span>
SW1# show etherchannel summary | include Po1
1      Po1(SU)         LACP      Gi1/0/49(P)  <span class="hl">Gi1/0/50(s)</span></pre>

<h3>Power over Ethernet</h3>
<p>PoE lets a switch (the PSE, power sourcing equipment) power a device (the PD, powered device) such as an AP, phone or camera over the data cable.</p>
<table class="cmp"><tr><th>Standard</th><th>Name</th><th>Power at the switch port</th><th>Power at the device</th></tr>
<tr><td>802.3af</td><td>PoE, Type 1</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>802.3at</td><td>PoE+, Type 2</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>802.3bt</td><td>PoE++, Type 3</td><td>60 W</td><td>51 W</td></tr>
<tr><td>802.3bt</td><td>PoE++, Type 4</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Two PoE faults are on the exam. <b>Incorrect standard:</b> the device needs more than the port can supply, for example a Wi-Fi 6E AP that needs 802.3at plugged into an 802.3af switch. It may not boot, may reboot in a loop, or may boot in a reduced mode with radios or USB disabled. <b>Power budget exceeded:</b> each port is within its standard, but the switch's power supply cannot feed all of them together, so new devices are denied power.</p>

<div class="eg"><p><b>Worked example: the thirteenth AP.</b> An access switch has a PoE budget of 370 W. Twelve APs are class 4, so the switch reserves 30 W for each: 12 x 30 = 360 W, leaving 10 W. The thirteenth AP asks for 30 W and is denied:</p>
<pre class="out">SW-F2# show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           370.0      360.0       10.0</span>
Interface Admin  Oper       Power   Device              Class Max
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/12  auto   on         30.0    Ieee PD             4     30.0
<span class="hl">Gi1/0/13  auto   power-deny 0.0     Ieee PD             4     30.0</span>
%ILPOWER-5-ILPOWER_POWER_DENY: Interface Gi1/0/13: inline power denied</pre>
<p>Options: add a second power supply, move some APs to another switch, use a PoE injector, or lower per-port allocations if the devices really draw less.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hard-coding speed and duplex on only one side. Reading error counters without clearing them first, so you cannot tell old errors from new ones (<code>clear counters</code>, then test). Bouncing an err-disabled port without removing the cause, so it goes err-disabled again seconds later.</p></div>

<div class="exam"><p><b>Exam traps.</b> Late collisions point to duplex mismatch (on the half side); CRC and runts appear on the full side. Giants suggest an MTU mismatch. Output drops mean congestion, not a bad cable. "Administratively down" means a <code>shutdown</code> command; "err-disabled" means the switch protected itself. 802.3at (PoE+) is 30 W at the port.</p></div>

<div class="scn"><h4>The APs that rebooted every lunchtime</h4><p>Three APs in a canteen rebooted every day around 13:00. Logs showed PoE denial messages at the same moment. At lunchtime, staff plugged PoE-powered digital signage screens into spare ports on the same switch, and the switch used its power priority to protect other ports. <code>show power inline</code> showed the budget almost fully used. The team moved the signage to a separate switch and set <code>power inline</code> priorities so APs are never the first to lose power.</p><p><b>Lesson:</b> intermittent reboots of powered devices are often a PoE budget problem. Read the budget, not just the port.</p></div>

<div class="iv"><p class="q">"A link shows late collisions on one side and CRC errors on the other. What is happening?"</p><p>A duplex mismatch. One side is hard-coded full duplex, so autonegotiation fails and the other side falls back to half duplex. The half-duplex side logs late collisions; the full-duplex side logs CRC errors and runts. Fix by setting both sides the same, preferably auto/auto, then clear counters and verify they stay at zero.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CRC = corrupted frames; runts = under 64 bytes; giants = over the maximum (MTU); drops = congestion or full queues.</li>
<li>Duplex mismatch: late collisions on the half side, CRC and runts on the full side; fix both ends the same.</li>
<li>Administratively down = shutdown; err-disabled = switch protection; suspended = EtherChannel member mismatch.</li>
<li>PoE: af 15.4 W, at 30 W, bt 60/90 W at the port; watch both the standard and the total budget.</li>
<li>Always clear counters, reproduce, and read them again before you conclude anything.</li>
</ul></div>
`,hi:`
<p>Agar cables sadak hain, to interface counters traffic police ki report hain: kitni gaadiyan guzri, kitni takraayi, kitni wapas bheji gayi. Switch ya router har frame jo woh receive aur send karta hai, aur har error, ginta hai. In counters ko padhna physical ya data link fault saabit karne ka sabse tez tareeka hai. Yeh chapter objective 5.2 ke counters, woh port states jo aapko pehchanne chahiye, duplex mismatch, aur Power over Ethernet (PoE) problems cover karta hai.</p>

<h3>Counters jo matter karte hain</h3>
<dl class="terms">
<dt>CRC (cyclic redundancy check) errors</dt><dd>Frame pahuncha, lekin uska frame check sequence contents se match nahi hua. Wire par kisi cheez ne use corrupt kiya: kharab cable ya connector, EMI, fail hota optic, ya duplex mismatch (full-duplex side par dikhta hai).</dd>
<dt>Runts</dt><dd>Ethernet minimum 64 bytes se chhote frames. Aam taur par collisions ke chhode tukde, isliye duplex problems ya kharab NIC ki taraf ishara karte hain.</dd>
<dt>Giants</dt><dd>Maximum se bade frames (untagged 1518 bytes, 802.1Q tag ke saath 1522). Aam taur par MTU mismatch: ek side jumbo frames bhejti hai, doosri accept nahi karti.</dd>
<dt>Drops</dt><dd><b>Input drops</b>: device frames itni tezi se accept nahi kar paya (input queue full). <b>Output drops</b>: egress buffer full tha, typically congestion, jaise 10G link 1G link ko feed kar raha ho. Drops performance symptom hain, cable fault nahi.</dd>
<dt>Late collisions</dt><dd>Frame ke pehle 64 bytes ke baad detect hua collision. Modern network par iska matlab lagbhag hamesha yeh hai ki local side full-duplex neighbour ke saamne half duplex chal rahi hai.</dd>
</dl>

<pre class="out">R1# show interfaces fa0/0
FastEthernet0/0 is up, line protocol is up
  Internet address is 10.0.12.1/24
  MTU 1500 bytes, BW 100000 Kbit/sec, DLY 100 usec,
  <span class="hl">Half-duplex, 100Mb/s, 100BaseTX/FX</span>
  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0
     1520 packets input, 152040 bytes, 0 no buffer
     0 runts, 0 giants, 0 throttles
     0 input errors, 0 CRC, 0 frame, 0 overrun, 0 ignored
     1498 packets output, 149800 bytes, 0 underruns
     0 output errors, 37 collisions, 0 interface resets
     <span class="hl">0 babbles, 37 late collision, 0 deferred</span></pre>

<h3>Duplex mismatch, step by step</h3>
<p>Full duplex matlab dono sides ek saath send aur receive karti hain. Half duplex matlab side pehle sunti hai aur agar doosri side ko sune to ruk jaati hai (collision detection). Dono ends normally speed aur duplex <b>autonegotiate</b> karte hain. Fault tab aata hai jab ek side hard-coded ho (jaise <code>speed 100</code> aur <code>duplex full</code>) aur isliye negotiate karna band kar de. Doosri side, jo ab bhi auto par hai, signal se speed sense kar sakti hai, lekin duplex nahi seekh sakti, isliye 10 ya 100 Mbps par woh <b>half duplex</b> par gir jaati hai.</p>
<ul>
<li><b>Half-duplex</b> side dekhti hai ki neighbour uske transmit karte waqt transmit kar raha hai, isliye woh <b>collisions aur late collisions</b> log karti hai.</li>
<li><b>Full-duplex</b> side woh frames receive karti hai jo doosri side ne beech mein kaat diye, isliye woh <b>CRC errors aur runts</b> log karti hai.</li>
<li>Chhoti pings zyada tar successful hoti hain; bulk traffic (file copies, database apps) reng-ta hai aur "atakta" hai. Slow-link lab mein bilkul yahi symptom hai.</li>
</ul>
<p>Fix hai <b>dono sides same</b> set karna, behtar dono auto par (<code>speed auto</code>, <code>duplex auto</code>), phir counters clear karke confirm karna ki woh zero par rehte hain. Gigabit copper (1000BASE-T) ko autonegotiation chahiye, isliye duplex mismatch mainly 10/100 problem hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="R1 aur SW1 ke beech duplex mismatch">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#fed7aa"/><text x="105" y="64" text-anchor="middle" class="svg-ink" font-size="13">R1 Fa0/0 (auto)</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">half par gir jaata hai</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">SW1 Fa0/1</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">speed 100, duplex full</text>
<line x1="190" y1="70" x2="450" y2="70" stroke="#64748b"/><text x="320" y="62" text-anchor="middle" class="svg-accent" font-size="12">duplex negotiation nahi</text>
<text x="105" y="128" text-anchor="middle" class="svg-ink" font-size="12">late collisions log</text>
<text x="535" y="128" text-anchor="middle" class="svg-ink" font-size="12">CRC aur runts log</text>
</svg><p class="cap">Ek hard-coded end doosre ko half duplex par gira deta hai. Phir har side alag error report karti hai.</p></div>

<h3>Port status</h3>
<table class="cmp"><tr><th>State</th><th>Kaisa dikhta hai</th><th>Matlab aur fix</th></tr>
<tr><td><b>Administratively down</b></td><td><code>show ip interface brief</code>: administratively down / down; <code>show interfaces status</code>: disabled</td><td>Kisi ne <code>shutdown</code> type kiya. Fix: <code>no shutdown</code>, yeh check karne ke baad ki kyun shut kiya gaya tha.</td></tr>
<tr><td><b>Error-disabled</b></td><td>err-disabled; line protocol down (err-disabled)</td><td>Switch ne protection ke liye port band kiya: port security, BPDU Guard, UDLD, link flap, EtherChannel misconfiguration, unsupported transceiver. Cause theek karo, phir <code>shutdown</code> / <code>no shutdown</code> (ya automatic errdisable recovery).</td></tr>
<tr><td><b>Suspended</b></td><td><code>show etherchannel summary</code> mein flag (s); status mein suspended</td><td>EtherChannel member jiski speed, duplex, VLAN ya trunk settings bundle se alag hain, ya jiska peer LACP negotiate nahi kar raha. Mismatch theek karo.</td></tr>
<tr><td><b>Down / notconnect</b></td><td>down / down; notconnect</td><td>Link signal nahi: cable, optic, door wala end off, TX/RX transposed.</td></tr>
</table>
<pre class="out">SW1# show interfaces status err-disabled
Port      Name        Status         Reason               Err-disabled Vlans
<span class="hl">Gi1/0/7   Desk-3-14   err-disabled   bpduguard</span>
SW1# show etherchannel summary | include Po1
1      Po1(SU)         LACP      Gi1/0/49(P)  <span class="hl">Gi1/0/50(s)</span></pre>

<h3>Power over Ethernet</h3>
<p>PoE switch (PSE, power sourcing equipment) ko data cable par device (PD, powered device) jaise AP, phone ya camera ko power dene deta hai.</p>
<table class="cmp"><tr><th>Standard</th><th>Naam</th><th>Switch port par power</th><th>Device par power</th></tr>
<tr><td>802.3af</td><td>PoE, Type 1</td><td>15.4 W</td><td>12.95 W</td></tr>
<tr><td>802.3at</td><td>PoE+, Type 2</td><td>30 W</td><td>25.5 W</td></tr>
<tr><td>802.3bt</td><td>PoE++, Type 3</td><td>60 W</td><td>51 W</td></tr>
<tr><td>802.3bt</td><td>PoE++, Type 4</td><td>90 W</td><td>71.3 W</td></tr>
</table>
<p>Exam mein do PoE faults hain. <b>Galat standard:</b> device ko port se zyada power chahiye, jaise Wi-Fi 6E AP jise 802.3at chahiye, 802.3af switch mein laga ho. Woh boot na ho, loop mein reboot ho, ya reduced mode mein boot ho jismein radios ya USB disabled hon. <b>Power budget exceeded:</b> har port apne standard ke andar hai, lekin switch ka power supply sabko ek saath feed nahi kar sakta, isliye naye devices ko power deny ho jaati hai.</p>

<div class="eg"><p><b>Worked example: terahvaan AP.</b> Ek access switch ka PoE budget 370 W hai. Barah APs class 4 hain, isliye switch har ek ke liye 30 W reserve karta hai: 12 x 30 = 360 W, bachta hai 10 W. Terahvaan AP 30 W maangta hai aur deny ho jaata hai:</p>
<pre class="out">SW-F2# show power inline
Module   Available     Used     Remaining
          (Watts)     (Watts)    (Watts)
------   ---------   --------   ---------
<span class="hl">1           370.0      360.0       10.0</span>
Interface Admin  Oper       Power   Device              Class Max
--------- ------ ---------- ------- ------------------- ----- ----
Gi1/0/12  auto   on         30.0    Ieee PD             4     30.0
<span class="hl">Gi1/0/13  auto   power-deny 0.0     Ieee PD             4     30.0</span>
%ILPOWER-5-ILPOWER_POWER_DENY: Interface Gi1/0/13: inline power denied</pre>
<p>Options: doosra power supply jodo, kuch APs doosre switch par le jao, PoE injector use karo, ya agar devices sach mein kam kheenchte hain to per-port allocations kam karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf ek side par speed aur duplex hard-code karna. Pehle clear kiye bina error counters padhna, jisse purane aur naye errors mein farak nahi pata chalta (<code>clear counters</code>, phir test). Cause hataye bina err-disabled port bounce karna, jisse woh kuch second baad phir err-disabled ho jaata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Late collisions duplex mismatch ki taraf ishara karte hain (half side par); CRC aur runts full side par dikhte hain. Giants MTU mismatch suggest karte hain. Output drops matlab congestion, kharab cable nahi. "Administratively down" matlab <code>shutdown</code> command; "err-disabled" matlab switch ne khud ko protect kiya. 802.3at (PoE+) port par 30 W hai.</p></div>

<div class="scn"><h4>APs jo har lunchtime reboot hote the</h4><p>Canteen ke teen APs roz lagbhag 13:00 baje reboot hote the. Logs mein usi pal PoE denial messages the. Lunchtime par staff PoE-powered digital signage screens usi switch ke khaali ports mein lagata tha, aur switch doosre ports ko bachane ke liye apni power priority use karta tha. <code>show power inline</code> ne budget lagbhag poora used dikhaya. Team ne signage ko alag switch par shift kiya aur <code>power inline</code> priorities set ki taaki APs kabhi pehle power na khoyein.</p><p><b>Seekh:</b> powered devices ke intermittent reboots aksar PoE budget problem hote hain. Sirf port nahi, budget padho.</p></div>

<div class="iv"><p class="q">"Ek link ek side par late collisions aur doosri side par CRC errors dikhata hai. Kya ho raha hai?"</p><p>Duplex mismatch. Ek side full duplex par hard-coded hai, isliye autonegotiation fail hota hai aur doosri side half duplex par gir jaati hai. Half-duplex side late collisions log karti hai; full-duplex side CRC errors aur runts log karti hai. Dono sides same set karke fix karo, behtar auto/auto, phir counters clear karo aur verify karo ki woh zero par rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CRC = corrupted frames; runts = 64 bytes se kam; giants = maximum (MTU) se zyada; drops = congestion ya full queues.</li>
<li>Duplex mismatch: half side par late collisions, full side par CRC aur runts; dono ends same karo.</li>
<li>Administratively down = shutdown; err-disabled = switch protection; suspended = EtherChannel member mismatch.</li>
<li>PoE: port par af 15.4 W, at 30 W, bt 60/90 W; standard aur total budget dono dekho.</li>
<li>Kuch bhi conclude karne se pehle hamesha counters clear karo, reproduce karo, aur dobara padho.</li>
</ul></div>
`}};export{e as default};