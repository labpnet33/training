var e={id:`cabling-optics`,h:{en:`Cabling, signal degradation and transceivers`,hi:`Cabling, signal degradation aur transceivers`},body:{en:`
<p>Objective 5.2 starts at the bottom of the OSI model, and for good reason: a large share of real tickets are physical. Think of cables as roads. The wrong road type (a narrow lane for a heavy truck), a road that is too long, potholes, noise from a factory next door, or a one-way street built the wrong way round all stop traffic, however good the drivers are. This chapter covers the road itself: cable type, signal quality, termination, TX/RX and optics.</p>

<h3>Incorrect cable: copper categories</h3>
<p>Twisted-pair copper comes in <b>categories</b>. A higher category supports a higher frequency and therefore a higher speed. Using a lower category than the link needs is a classic fault: the link comes up at a lower speed, or it comes up at full speed and logs errors under load.</p>
<table class="cmp"><tr><th>Category</th><th>Typical max speed</th><th>Frequency</th><th>Notes</th></tr>
<tr><td>Cat5</td><td>100 Mbps</td><td>100 MHz</td><td>Legacy; do not use for gigabit</td></tr>
<tr><td>Cat5e</td><td>1 Gbps, 100 m</td><td>100 MHz</td><td>Still common at desks</td></tr>
<tr><td>Cat6</td><td>1 Gbps, 100 m (10 Gbps to about 55 m)</td><td>250 MHz</td><td>Common for new office cabling</td></tr>
<tr><td>Cat6a</td><td>10 Gbps, 100 m</td><td>500 MHz</td><td>Good for Wi-Fi 6/7 APs and 10GBASE-T</td></tr>
<tr><td>Cat7</td><td>10 Gbps, 100 m</td><td>600 MHz</td><td>Fully shielded (S/FTP); an ISO class, not a TIA category</td></tr>
<tr><td>Cat8</td><td>25 or 40 Gbps, 30 m</td><td>2000 MHz</td><td>Shielded; short data center runs</td></tr>
</table>
<p><b>UTP vs STP.</b> Unshielded twisted pair (UTP) relies only on the twists to cancel noise. Shielded twisted pair (STP, including F/UTP and S/FTP) adds a foil or braid that blocks electromagnetic interference. Use shielded cable near motors, lift machinery, welding or high-voltage lines. Shielding must be <b>grounded</b> at the right end; badly grounded shielding can pick up noise and make things worse.</p>

<h3>Incorrect cable: single-mode vs multimode fiber</h3>
<table class="cmp"><tr><th></th><th>Single-mode (SMF)</th><th>Multimode (MMF)</th></tr>
<tr><td>Core</td><td>about 9 micron</td><td>50 or 62.5 micron</td></tr>
<tr><td>Light source</td><td>Laser, 1310 or 1550 nm</td><td>VCSEL or LED, 850 nm</td></tr>
<tr><td>Distance</td><td>Kilometres (10 km, 40 km and more)</td><td>Hundreds of metres (10GBASE-SR about 300 m on OM3, 400 m on OM4)</td></tr>
<tr><td>Jacket colour</td><td>Usually yellow</td><td>Orange (OM1/OM2), aqua (OM3/OM4), lime green (OM5)</td></tr>
<tr><td>Typical optic</td><td>LR, ER</td><td>SR</td></tr>
</table>
<p>The optic and the cable must match. An SR (multimode) optic on a yellow single-mode patch cord, or an LR optic pushed into a multimode run, gives very low received light, no link, or a link that flaps.</p>

<h3>Signal degradation</h3>
<ul>
<li><b>Attenuation:</b> the signal gets weaker with distance. Copper Ethernet is specified to <b>100 m</b> per channel (Cat8 only 30 m). In fiber, loss comes from length, dirty connectors, tight bends and splices, measured in <b>dB</b>.</li>
<li><b>Crosstalk:</b> signal from one pair leaks into a neighbouring pair. <b>NEXT</b> (near-end crosstalk) is measured at the transmitting end; <b>FEXT</b> (far-end) at the other end; <b>alien crosstalk</b> comes from a neighbouring cable in the same bundle. Usually caused by untwisting pairs at the connector.</li>
<li><b>Interference (EMI/RFI):</b> noise from outside sources: fluorescent light ballasts, motors, power cables run in parallel. Fix with distance, shielded cable or fiber, which is immune to EMI.</li>
</ul>

<h3>Improper termination</h3>
<p>Termination is how the cable is fitted to a connector or punched into a panel. Typical faults: pairs untwisted more than about 13 mm (half an inch), which causes crosstalk; <b>T568A at one end and T568B at the other</b> by mistake, which makes a crossover cable; <b>split pairs</b>, where wires from two different pairs share one twisted pair, which passes a simple continuity test but fails under load; and a poor crimp that works until someone moves the desk. A cable tester's wire map shows all of these.</p>

<h3>TX/RX transposed</h3>
<p>Every link needs one side's transmit to reach the other side's receive. In copper, modern ports use <b>Auto-MDIX</b> to swap pairs automatically, so straight-through versus crossover rarely matters now; on old or hard-coded ports it still does. In fiber, a duplex LC patch cord with swapped strands (reversed <b>polarity</b>) means each side transmits into the other side's transmitter: no link at all. The fix is to flip the strands or use a patch cord of the correct polarity.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Fiber TX RX correct and transposed">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Correct polarity</text>
<rect x="20" y="40" width="70" height="80" rx="6" fill="#bae6fd"/><text x="55" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text><text x="55" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="55" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<rect x="230" y="40" width="70" height="80" rx="6" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text><text x="265" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="265" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<line x1="90" y1="80" x2="230" y2="104" stroke="#64748b"/><line x1="90" y1="104" x2="230" y2="80" stroke="#64748b"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">TX/RX transposed</text>
<rect x="340" y="40" width="70" height="80" rx="6" fill="#fed7aa"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text><text x="375" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="375" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<rect x="550" y="40" width="70" height="80" rx="6" fill="#fed7aa"/><text x="585" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="585" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<line x1="410" y1="80" x2="550" y2="80" stroke="#64748b"/><line x1="410" y1="104" x2="550" y2="104" stroke="#64748b"/>
<text x="480" y="145" text-anchor="middle" class="svg-muted" font-size="12">TX meets TX: no light received, link down</text>
</svg><p class="cap">Each transmitter must land on the far receiver. Swapped strands leave both receivers dark.</p></div>

<h3>Transceiver mismatch and signal strength</h3>
<p>Optical links fail in three typical ways. <b>Mismatch:</b> different optic types at each end (SR at one end, LR at the other), different speeds (a 1G SFP in a port set to 10G only), or an optic the switch does not support, which logs an "unsupported transceiver" message and can err-disable the port. <b>Low signal:</b> the receive power is below the optic's sensitivity. <b>Too much signal:</b> a long-reach optic on a very short cable can overload the receiver; you add an attenuator.</p>
<pre class="out">DIST1# show interfaces transceiver
++ : high alarm, +  : high warning, -  : low warning, -- : low alarm.
                                          Optical   Optical
           Temperature  Voltage  Current  Tx Power  Rx Power
Port       (Celsius)    (Volts)  (mA)     (dBm)     (dBm)
---------  -----------  -------  -------  --------  --------
Te1/1/1       31.8       3.29      35.2     -1.1      -3.8
<span class="hl">Te1/1/2       32.4       3.28      36.0     -1.0     -14.9 --</span></pre>

<div class="eg"><p><b>Worked example: is -14.9 dBm acceptable?</b> Te1/1/2 is a 10GBASE-LR link over 2 km of single-mode fiber with 4 connectors and 1 splice. Expected loss: fiber 2 km x 0.4 dB/km = 0.8 dB, connectors 4 x 0.5 dB = 2.0 dB, splice 0.1 dB, total about 2.9 dB. With Tx at -1.0 dBm, Rx should be about -3.9 dBm, like Te1/1/1. The reading is -14.9 dBm, about 11 dB worse, and below the LR receiver sensitivity of roughly -14.4 dBm (the "--" low alarm). Conclusion: a dirty or damaged connector, or a crushed patch cord. Inspect and clean the connectors, then retest.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Replacing an optic before cleaning the connectors (dirt is the number one fiber fault). Looking into a fiber or an optic to "see the light" (lasers can damage your eyes; use a power meter or the switch readings). Assuming any cable that "fits" is fine: an RJ45 fits Cat5 and Cat6a alike.</p></div>

<div class="exam"><p><b>Exam traps.</b> Crosstalk is pair to pair inside the cable; interference (EMI) comes from outside sources. Attenuation is loss over distance. Yellow jacket usually means single-mode; aqua means OM3/OM4 multimode. Fiber is immune to EMI. A link that is completely down after new fiber work suggests TX/RX transposed; a link with low Rx suggests dirt, bends or wrong cable type.</p></div>

<div class="scn"><h4>The new 10G uplinks that would not stay up</h4><p>A contractor installed six new 10G uplinks between two racks. Four flapped every few minutes. <code>show interfaces transceiver</code> showed Rx around -12 dBm on SR optics, close to the alarm threshold. The engineer walked to the rack: the SR optics were connected with yellow single-mode patch cords borrowed from another job. Replacing them with aqua OM4 cords brought Rx to about -2.5 dBm, and the flaps stopped.</p><p><b>Lesson:</b> the optic and the cable must be the same mode. Read the Rx power first, then look at the cable colour.</p></div>

<div class="iv"><p class="q">"How do you tell single-mode from multimode, and what happens if you mix them?"</p><p>Single-mode has a 9-micron core, uses lasers at 1310/1550 nm for kilometres, and is usually yellow; multimode has a 50 or 62.5-micron core, uses 850 nm for hundreds of metres, and is orange, aqua or lime. Mixing an optic and a cable of different modes causes high loss: no link, a flapping link, or errors. Say you would verify with the optic part number, the cable colour and the transceiver Rx power reading.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Match cable category to speed: Cat5e for 1G, Cat6a for 10G at 100 m, Cat8 for 25/40G at 30 m.</li>
<li>Match optic to fiber: SR with multimode, LR/ER with single-mode.</li>
<li>Attenuation is distance loss, crosstalk is pair-to-pair leakage, interference is outside noise.</li>
<li>Improper termination (untwisting, split pairs, A/B mix) and TX/RX transposed are installation faults a tester finds.</li>
<li>Read transceiver Tx/Rx power in dBm against the optic's thresholds; clean connectors before replacing anything.</li>
</ul></div>
`,hi:`
<p>Objective 5.2 OSI model ke neeche se shuru hota hai, aur achhi wajah se: real tickets ka bada hissa physical hota hai. Cables ko sadak samjho. Galat type ki sadak (bhaari truck ke liye patli gali), bahut lambi sadak, gaddhe, bagal ki factory ka shor, ya ulta bana one-way, sab traffic rok dete hain, driver kitne bhi achhe hon. Yeh chapter khud sadak cover karta hai: cable type, signal quality, termination, TX/RX aur optics.</p>

<h3>Galat cable: copper categories</h3>
<p>Twisted-pair copper <b>categories</b> mein aata hai. Oonchi category zyada frequency aur isliye zyada speed support karti hai. Link ki zaroorat se neechi category use karna classic fault hai: link kam speed par aata hai, ya full speed par aata hai aur load par errors log karta hai.</p>
<table class="cmp"><tr><th>Category</th><th>Typical max speed</th><th>Frequency</th><th>Notes</th></tr>
<tr><td>Cat5</td><td>100 Mbps</td><td>100 MHz</td><td>Legacy; gigabit ke liye use mat karo</td></tr>
<tr><td>Cat5e</td><td>1 Gbps, 100 m</td><td>100 MHz</td><td>Desks par ab bhi common</td></tr>
<tr><td>Cat6</td><td>1 Gbps, 100 m (10 Gbps lagbhag 55 m tak)</td><td>250 MHz</td><td>Nayi office cabling ke liye common</td></tr>
<tr><td>Cat6a</td><td>10 Gbps, 100 m</td><td>500 MHz</td><td>Wi-Fi 6/7 APs aur 10GBASE-T ke liye achha</td></tr>
<tr><td>Cat7</td><td>10 Gbps, 100 m</td><td>600 MHz</td><td>Poori tarah shielded (S/FTP); ISO class hai, TIA category nahi</td></tr>
<tr><td>Cat8</td><td>25 ya 40 Gbps, 30 m</td><td>2000 MHz</td><td>Shielded; chhote data center runs</td></tr>
</table>
<p><b>UTP vs STP.</b> Unshielded twisted pair (UTP) noise cancel karne ke liye sirf twists par nirbhar hai. Shielded twisted pair (STP, jismein F/UTP aur S/FTP shaamil hain) ek foil ya braid jodta hai jo electromagnetic interference rokta hai. Motors, lift machinery, welding ya high-voltage lines ke paas shielded cable use karo. Shielding sahi end par <b>grounded</b> honi chahiye; galat grounded shielding noise pakad kar haalat aur kharab kar sakti hai.</p>

<h3>Galat cable: single-mode vs multimode fiber</h3>
<table class="cmp"><tr><th></th><th>Single-mode (SMF)</th><th>Multimode (MMF)</th></tr>
<tr><td>Core</td><td>lagbhag 9 micron</td><td>50 ya 62.5 micron</td></tr>
<tr><td>Light source</td><td>Laser, 1310 ya 1550 nm</td><td>VCSEL ya LED, 850 nm</td></tr>
<tr><td>Distance</td><td>Kilometres (10 km, 40 km aur zyada)</td><td>Sainkdon metres (10GBASE-SR OM3 par lagbhag 300 m, OM4 par 400 m)</td></tr>
<tr><td>Jacket colour</td><td>Aam taur par peela</td><td>Orange (OM1/OM2), aqua (OM3/OM4), lime green (OM5)</td></tr>
<tr><td>Typical optic</td><td>LR, ER</td><td>SR</td></tr>
</table>
<p>Optic aur cable match hone chahiye. Peele single-mode patch cord par SR (multimode) optic, ya multimode run mein LR optic, bahut kam received light, no link, ya flap karta link deta hai.</p>

<h3>Signal degradation</h3>
<ul>
<li><b>Attenuation:</b> distance ke saath signal kamzor hota jaata hai. Copper Ethernet per channel <b>100 m</b> tak specified hai (Cat8 sirf 30 m). Fiber mein loss length, gande connectors, tight bends aur splices se aata hai, <b>dB</b> mein naapa jaata hai.</li>
<li><b>Crosstalk:</b> ek pair ka signal bagal ke pair mein leak hota hai. <b>NEXT</b> (near-end crosstalk) transmit karne wale end par naapa jaata hai; <b>FEXT</b> (far-end) doosre end par; <b>alien crosstalk</b> same bundle ki padosi cable se aata hai. Aam taur par connector par pairs untwist karne se hota hai.</li>
<li><b>Interference (EMI/RFI):</b> bahar ke sources ka noise: fluorescent light ballasts, motors, parallel chalti power cables. Doori, shielded cable ya fiber se fix karo, jo EMI se immune hai.</li>
</ul>

<h3>Improper termination</h3>
<p>Termination matlab cable ko connector mein kaise lagaya ya panel mein punch kiya gaya. Typical faults: pairs lagbhag 13 mm (aadha inch) se zyada untwisted, jisse crosstalk hota hai; galti se <b>ek end par T568A aur doosre par T568B</b>, jo crossover cable bana deta hai; <b>split pairs</b>, jahan do alag pairs ke wires ek twisted pair share karte hain, jo simple continuity test pass karta hai lekin load par fail hota hai; aur kharab crimp jo tab tak chalta hai jab tak koi desk na hilaye. Cable tester ka wire map yeh sab dikhata hai.</p>

<h3>TX/RX transposed</h3>
<p>Har link mein ek side ka transmit doosri side ke receive tak pahunchna chahiye. Copper mein modern ports <b>Auto-MDIX</b> se pairs apne aap swap karte hain, isliye straight-through vs crossover ab kam matter karta hai; purane ya hard-coded ports par ab bhi karta hai. Fiber mein, swapped strands wala duplex LC patch cord (ulti <b>polarity</b>) matlab har side doosri side ke transmitter mein transmit karti hai: koi link nahi. Fix hai strands flip karna ya sahi polarity ka patch cord use karna.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Fiber TX RX sahi aur transposed">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Sahi polarity</text>
<rect x="20" y="40" width="70" height="80" rx="6" fill="#bae6fd"/><text x="55" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text><text x="55" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="55" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<rect x="230" y="40" width="70" height="80" rx="6" fill="#bae6fd"/><text x="265" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text><text x="265" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="265" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<line x1="90" y1="80" x2="230" y2="104" stroke="#64748b"/><line x1="90" y1="104" x2="230" y2="80" stroke="#64748b"/>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">TX/RX transposed</text>
<rect x="340" y="40" width="70" height="80" rx="6" fill="#fed7aa"/><text x="375" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW1</text><text x="375" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="375" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<rect x="550" y="40" width="70" height="80" rx="6" fill="#fed7aa"/><text x="585" y="60" text-anchor="middle" class="svg-ink" font-size="12">SW2</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="12">TX</text><text x="585" y="108" text-anchor="middle" class="svg-muted" font-size="12">RX</text>
<line x1="410" y1="80" x2="550" y2="80" stroke="#64748b"/><line x1="410" y1="104" x2="550" y2="104" stroke="#64748b"/>
<text x="480" y="145" text-anchor="middle" class="svg-muted" font-size="12">TX se TX: light receive nahi, link down</text>
</svg><p class="cap">Har transmitter door wale receiver par pahunchna chahiye. Swapped strands dono receivers ko andhera chhod dete hain.</p></div>

<h3>Transceiver mismatch aur signal strength</h3>
<p>Optical links teen typical tareekon se fail hote hain. <b>Mismatch:</b> dono ends par alag optic types (ek taraf SR, doosri taraf LR), alag speeds (sirf 10G par set port mein 1G SFP), ya aisa optic jo switch support nahi karta, jo "unsupported transceiver" message log karta hai aur port ko err-disable kar sakta hai. <b>Kam signal:</b> receive power optic ki sensitivity se neeche hai. <b>Bahut zyada signal:</b> bahut chhoti cable par long-reach optic receiver ko overload kar sakta hai; aap attenuator lagate ho.</p>
<pre class="out">DIST1# show interfaces transceiver
++ : high alarm, +  : high warning, -  : low warning, -- : low alarm.
                                          Optical   Optical
           Temperature  Voltage  Current  Tx Power  Rx Power
Port       (Celsius)    (Volts)  (mA)     (dBm)     (dBm)
---------  -----------  -------  -------  --------  --------
Te1/1/1       31.8       3.29      35.2     -1.1      -3.8
<span class="hl">Te1/1/2       32.4       3.28      36.0     -1.0     -14.9 --</span></pre>

<div class="eg"><p><b>Worked example: kya -14.9 dBm theek hai?</b> Te1/1/2 ek 10GBASE-LR link hai jo 2 km single-mode fiber par hai, 4 connectors aur 1 splice ke saath. Expected loss: fiber 2 km x 0.4 dB/km = 0.8 dB, connectors 4 x 0.5 dB = 2.0 dB, splice 0.1 dB, total lagbhag 2.9 dB. Tx -1.0 dBm ke saath Rx lagbhag -3.9 dBm hona chahiye, Te1/1/1 ki tarah. Reading -14.9 dBm hai, lagbhag 11 dB kharab, aur LR receiver sensitivity lagbhag -14.4 dBm se neeche ("--" low alarm). Nateeja: ganda ya damaged connector, ya dabba hua patch cord. Connectors inspect aur clean karo, phir retest karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Connectors clean karne se pehle optic replace karna (gandagi fiber ka number one fault hai). "Light dekhne" ke liye fiber ya optic mein jhaankna (lasers aankhon ko nuksaan pahuncha sakte hain; power meter ya switch readings use karo). Yeh maan lena ki jo cable "fit" ho jaaye woh theek hai: RJ45 Cat5 aur Cat6a dono mein fit hota hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Crosstalk cable ke andar pair se pair hota hai; interference (EMI) bahar ke sources se aata hai. Attenuation distance par loss hai. Peela jacket aam taur par single-mode; aqua matlab OM3/OM4 multimode. Fiber EMI se immune hai. Naye fiber kaam ke baad poori tarah down link TX/RX transposed ki taraf ishara karta hai; kam Rx wala link gandagi, bends ya galat cable type ki taraf.</p></div>

<div class="scn"><h4>Naye 10G uplinks jo up nahi rukte the</h4><p>Ek contractor ne do racks ke beech chhe naye 10G uplinks lagaye. Chaar har kuch minute mein flap karte the. <code>show interfaces transceiver</code> ne SR optics par Rx lagbhag -12 dBm dikhaya, alarm threshold ke kareeb. Engineer rack tak gaya: SR optics peele single-mode patch cords se jude the jo kisi aur job se udhaar liye gaye the. Unhe aqua OM4 cords se badalne par Rx lagbhag -2.5 dBm aaya, aur flaps ruk gaye.</p><p><b>Seekh:</b> optic aur cable same mode ke hone chahiye. Pehle Rx power padho, phir cable ka rang dekho.</p></div>

<div class="iv"><p class="q">"Single-mode aur multimode mein farak kaise pehchanoge, aur mix karne par kya hota hai?"</p><p>Single-mode ka core 9 micron hai, kilometres ke liye 1310/1550 nm lasers use karta hai, aur aam taur par peela hota hai; multimode ka core 50 ya 62.5 micron hai, sainkdon metres ke liye 850 nm use karta hai, aur orange, aqua ya lime hota hai. Alag modes ka optic aur cable mix karne se high loss hota hai: no link, flap karta link, ya errors. Bolo ki aap optic part number, cable colour aur transceiver Rx power reading se verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cable category ko speed se match karo: 1G ke liye Cat5e, 100 m par 10G ke liye Cat6a, 30 m par 25/40G ke liye Cat8.</li>
<li>Optic ko fiber se match karo: SR multimode ke saath, LR/ER single-mode ke saath.</li>
<li>Attenuation distance loss hai, crosstalk pair-to-pair leakage hai, interference bahar ka noise hai.</li>
<li>Improper termination (untwisting, split pairs, A/B mix) aur TX/RX transposed installation faults hain jo tester pakadta hai.</li>
<li>Transceiver Tx/Rx power dBm mein optic ke thresholds ke against padho; kuch bhi replace karne se pehle connectors clean karo.</li>
</ul></div>
`}};export{e as default};