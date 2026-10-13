var e={id:`rf-big-picture`,h:{en:`Wi-Fi is shared radio: the big picture of RF design`,hi:`Wi-Fi shared radio hai: RF design ki big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn why a wireless network is a radio design problem and not only a configuration problem. You will study the 2.4, 5 and 6 GHz bands and their channels, signal strength (dBm, RSSI, SNR), data rates, co-channel and adjacent-channel interference, transmit power and cell size, and the ideas behind Radio Resource Management (RRM): Dynamic Channel Assignment (DCA), Transmit Power Control (TPC) and Coverage Hole Detection (CHD). Then you will learn how the Catalyst 9800 style controller packages RF settings into <b>RF profiles</b> and <b>RF tags</b>, and you will practise three labs: <b>wl-co-channel</b> (two APs on the same 2.4 GHz channel), <b>wl-rf-power</b> (cap 5 GHz power with RF profile CAMPUS-5 and RF tag RF-CAMPUS) and <b>wl-band-shutdown</b> (a 5 GHz-only handset finds no network).</p>
<p><b>Prerequisites.</b> The previous module, wl-start: you should know the controller management interface, how APs join through DHCP option 43, and the chain WLAN profile, policy profile, policy tag and AP. Basic IP knowledge is enough; no radio background is assumed.</p>

<h3>Start with an analogy: a classroom with one microphone</h3>
<p>Picture a classroom where everyone must talk using the same air. If two people speak at once, neither is understood. A polite class has a rule: listen first, speak only when it is quiet. Wi-Fi works like that. All devices on one channel share one <b>collision domain</b>: only one device transmits at a time. A second classroom next door on the same channel can be heard through the wall, so the two classrooms must take turns together. That is the key reality of RF design: <b>airtime is the real currency</b>. Every transmission, even a slow or corrupted one, spends airtime that nobody else can use.</p>
<p>A good designer does three things. First, give every area enough <b>coverage</b>: a strong enough signal for the slowest device that matters. Second, give every area enough <b>capacity</b>: enough clean airtime for the number of users. Third, keep neighbouring APs from shouting over each other: different channels, and power low enough that cells are small. Coverage and capacity pull in opposite directions, and RF design is the art of balancing them.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three layers of RF design">
<rect x="20" y="20" width="190" height="150" rx="8" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. Physics</text>
<text x="115" y="78" text-anchor="middle" class="svg-ink" font-size="12">Bands and channels</text><text x="115" y="100" text-anchor="middle" class="svg-ink" font-size="12">dBm, SNR, path loss</text><text x="115" y="122" text-anchor="middle" class="svg-ink" font-size="12">Interference</text>
<rect x="225" y="20" width="190" height="150" rx="8" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. Design</text>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">Channel plan</text><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Power and cell size</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Data rates, band control</text>
<rect x="430" y="20" width="190" height="150" rx="8" fill="#ddd6fe"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">3. Controller</text>
<text x="525" y="78" text-anchor="middle" class="svg-ink" font-size="12">RF profile (per band)</text><text x="525" y="100" text-anchor="middle" class="svg-ink" font-size="12">RF tag (24 + 5 GHz)</text><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="12">AP gets the rf-tag</text>
<line x1="210" y1="95" x2="225" y2="95" stroke="#64748b"/><line x1="415" y1="95" x2="430" y2="95" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Understand the physics, decide the design, then express it on the controller</text>
</svg><p class="cap">The module follows these three layers in order.</p></div>

<h3>The lab topology you will use</h3>
<p>Every lab uses the same small campus: router R1 (DHCP and inter-VLAN routing), switch SW1, controller WLC1, RADIUS server RAD1 behind R1, two access points AP1 and AP2 on VLAN 10 (a third, AP3, appears in a later module), and clients LAPTOP1, LAPTOP2, PHONE1 and GUEST1. The staff SSID is NK-STAFF in VLAN 20 (10.10.20.0/24). The shared server RAD1 is 10.10.60.20, which makes it a handy ping target to prove that a client really has working connectivity.</p>

<table class="cmp"><tr><th>Lab</th><th>Type</th><th>RF idea it teaches</th></tr>
<tr><td>wl-co-channel</td><td>troubleshoot</td><td>Two neighbouring 2.4 GHz radios on channel 6 overlap; move to channels 1 and 6</td></tr>
<tr><td>wl-rf-power</td><td>config</td><td>RF profile CAMPUS-5 with tx-power max 14, bound in RF tag RF-CAMPUS</td></tr>
<tr><td>wl-band-shutdown</td><td>troubleshoot</td><td>An RF profile that is still shut down switches that band off</td></tr>
</table>

<div class="note"><p><b>Honest scope note.</b> The lab controller is an original learning model written in the IOS XE command style. It is not Cisco software. Real RRM algorithms (DCA, TPC, CHD) are explained as concepts only; in the lab, channels are assigned in a deterministic way and you pin them by hand. Each chapter says clearly when something is not simulated in the lab.</p></div>

<div class="eg"><p><b>Worked example: why "more APs at full power" fails.</b> A hall has 4 APs. A junior engineer sets all radios to the maximum and leaves them on the same channel. Every AP now hears every other AP, so all four share one collision domain: the total capacity of the hall is that of one AP, split among four cells. If instead the APs use channels 1, 6, 11 and 1 again at lower power, three cells work in parallel and the repeated channel is far enough away to be quiet. Same hardware, roughly three times the capacity.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking that a strong signal means a good network. Signal strength tells you the client can hear the AP. It says nothing about whether the channel is busy. Always check both signal and airtime.</p></div>

<div class="scn"><h4>The meeting room that crawls</h4><p>Staff complain that the second-floor meeting room is slow every morning. The signal bars are full. The engineer reads the AP radio table and finds AP1 and AP2 both on 2.4 GHz channel 6 with maximum power. Every transmission from one AP forces the other to wait. After pinning AP1 to channel 1 and AP2 to channel 6, complaints stop.</p><p><b>Lesson:</b> full bars with slow speed is a classic interference or airtime symptom, not a coverage symptom.</p></div>

<div class="iv"><p class="q">"What is the difference between coverage and capacity in a WLAN design?"</p><p>Coverage is whether a usable signal reaches every place a client will be. Capacity is whether there is enough clean airtime for all clients at once. Mention that raising power improves coverage but hurts capacity through bigger overlapping cells, and that a good design uses many small cells on different channels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A channel is a shared medium: one transmitter at a time, so airtime is the scarce resource.</li>
<li>Good design balances coverage (signal) against capacity (clean airtime).</li>
<li>Neighbouring APs need different channels and sensible power.</li>
<li>The controller expresses RF design through RF profiles and RF tags.</li>
<li>Real RRM is concept only here; lab channels are deterministic and pinned by hand.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki wireless network sirf configuration ka nahi, ek radio design ka problem hai. Aap 2.4, 5 aur 6 GHz bands aur unke channels, signal strength (dBm, RSSI, SNR), data rates, co-channel aur adjacent-channel interference, transmit power aur cell size, aur Radio Resource Management (RRM) ke ideas padhoge: Dynamic Channel Assignment (DCA), Transmit Power Control (TPC) aur Coverage Hole Detection (CHD). Phir aap seekhoge ki Catalyst 9800 style controller RF settings ko <b>RF profiles</b> aur <b>RF tags</b> mein kaise package karta hai, aur teen labs practise karoge: <b>wl-co-channel</b> (do APs same 2.4 GHz channel par), <b>wl-rf-power</b> (RF profile CAMPUS-5 aur RF tag RF-CAMPUS se 5 GHz power cap karo) aur <b>wl-band-shutdown</b> (5 GHz-only handset ko network nahi milta).</p>
<p><b>Prerequisites.</b> Pichla module wl-start: aapko controller management interface, DHCP option 43 se AP join, aur chain WLAN profile, policy profile, policy tag aur AP pata hona chahiye. Basic IP knowledge kaafi hai; radio background ki zaroorat nahi.</p>

<h3>Ek analogy se shuru karo: ek microphone wali classroom</h3>
<p>Ek classroom socho jahan sabko same hawa use karke bolna hai. Do log ek saath bolen to koi samajh nahi paata. Polite class ka rule hota hai: pehle suno, sirf shaant hone par bolo. Wi-Fi bhi aise hi kaam karta hai. Ek channel par saare devices ek <b>collision domain</b> share karte hain: ek time par sirf ek device transmit karta hai. Bagal ki classroom agar same channel par hai to deewar ke paar bhi sunai deti hai, isliye dono classrooms ko saath mein baari-baari bolna padta hai. Yahi RF design ki key reality hai: <b>airtime asli currency hai</b>. Har transmission, slow ya corrupted bhi, airtime kharch karta hai jo koi aur use nahi kar sakta.</p>
<p>Ek achha designer teen kaam karta hai. Pehla, har area ko kaafi <b>coverage</b> do: us slowest device ke liye strong signal jo matter karta hai. Doosra, har area ko kaafi <b>capacity</b> do: users ke hisaab se clean airtime. Teesra, neighbouring APs ek dusre par chillayein nahi: alag channels aur itni low power ki cells chhoti rahein. Coverage aur capacity ulti direction mein kheenchte hain, aur RF design inka balance banane ki kala hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="RF design ki teen layers">
<rect x="20" y="20" width="190" height="150" rx="8" fill="#bae6fd"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="14">1. Physics</text>
<text x="115" y="78" text-anchor="middle" class="svg-ink" font-size="12">Bands aur channels</text><text x="115" y="100" text-anchor="middle" class="svg-ink" font-size="12">dBm, SNR, path loss</text><text x="115" y="122" text-anchor="middle" class="svg-ink" font-size="12">Interference</text>
<rect x="225" y="20" width="190" height="150" rx="8" fill="#bbf7d0"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">2. Design</text>
<text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="12">Channel plan</text><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">Power aur cell size</text><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">Data rates, band control</text>
<rect x="430" y="20" width="190" height="150" rx="8" fill="#ddd6fe"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="14">3. Controller</text>
<text x="525" y="78" text-anchor="middle" class="svg-ink" font-size="12">RF profile (per band)</text><text x="525" y="100" text-anchor="middle" class="svg-ink" font-size="12">RF tag (24 + 5 GHz)</text><text x="525" y="122" text-anchor="middle" class="svg-ink" font-size="12">AP ko rf-tag milta hai</text>
<line x1="210" y1="95" x2="225" y2="95" stroke="#64748b"/><line x1="415" y1="95" x2="430" y2="95" stroke="#64748b"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Pehle physics samjho, phir design decide karo, phir controller par express karo</text>
</svg><p class="cap">Module in teen layers ko order mein follow karta hai.</p></div>

<h3>Lab topology jo aap use karoge</h3>
<p>Har lab same chhota campus use karta hai: router R1 (DHCP aur inter-VLAN routing), switch SW1, controller WLC1, R1 ke peeche RADIUS server RAD1, VLAN 10 par do access points AP1 aur AP2 (teesra, AP3, aage ke module mein aata hai), aur clients LAPTOP1, LAPTOP2, PHONE1 aur GUEST1. Staff SSID NK-STAFF hai VLAN 20 (10.10.20.0/24) mein. Shared server RAD1 10.10.60.20 hai, jo ping target ke roop mein kaam aata hai taaki prove ho ki client ke paas sach mein working connectivity hai.</p>

<table class="cmp"><tr><th>Lab</th><th>Type</th><th>Kaunsa RF idea sikhata hai</th></tr>
<tr><td>wl-co-channel</td><td>troubleshoot</td><td>Do neighbouring 2.4 GHz radios channel 6 par overlap karte hain; channels 1 aur 6 par move karo</td></tr>
<tr><td>wl-rf-power</td><td>config</td><td>RF profile CAMPUS-5 tx-power max 14 ke saath, RF tag RF-CAMPUS mein bound</td></tr>
<tr><td>wl-band-shutdown</td><td>troubleshoot</td><td>Jo RF profile abhi shut down hai woh us band ko off kar deta hai</td></tr>
</table>

<div class="note"><p><b>Honest scope note.</b> Lab controller ek original learning model hai jo IOS XE command style mein likha gaya hai. Yeh Cisco software nahi hai. Real RRM algorithms (DCA, TPC, CHD) sirf concept ke roop mein samjhaye gaye hain; lab mein channels deterministic tareeke se assign hote hain aur aap unhe haath se pin karte ho. Har chapter saaf batata hai ki kya lab mein simulate nahi hota.</p></div>

<div class="eg"><p><b>Worked example: "zyada APs full power par" kyun fail hota hai.</b> Ek hall mein 4 APs hain. Junior engineer sab radios maximum par set karta hai aur same channel par chhod deta hai. Ab har AP har dusre AP ko sunta hai, to chaaron ek collision domain share karte hain: hall ki total capacity ek AP jitni hai, chaar cells mein baant gayi. Agar APs channels 1, 6, 11 aur phir 1 par low power ke saath hon, to teen cells parallel kaam karte hain aur repeat hua channel itna door hai ki quiet rehta hai. Hardware same, capacity lagbhag teen guna.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki strong signal matlab achha network. Signal strength sirf batati hai ki client AP ko sun sakta hai. Yeh nahi batati ki channel busy hai ya nahi. Hamesha signal aur airtime dono check karo.</p></div>

<div class="scn"><h4>Meeting room jo reng raha hai</h4><p>Staff shikayat karte hain ki second-floor meeting room har subah slow hai. Signal bars full hain. Engineer AP radio table padhta hai aur dekhta hai ki AP1 aur AP2 dono 2.4 GHz channel 6 par maximum power ke saath hain. Ek AP ka har transmission dusre AP ko wait karne par majboor karta hai. AP1 ko channel 1 aur AP2 ko channel 6 par pin karne ke baad shikayatein band ho gayin.</p><p><b>Seekh:</b> full bars ke saath slow speed classic interference ya airtime symptom hai, coverage symptom nahi.</p></div>

<div class="iv"><p class="q">"WLAN design mein coverage aur capacity mein kya farak hai?"</p><p>Coverage matlab har us jagah usable signal pahunchta hai jahan client hoga. Capacity matlab saare clients ke liye ek saath kaafi clean airtime hai ya nahi. Batao ki power badhane se coverage sudharti hai lekin bade overlapping cells ki wajah se capacity bigadti hai, aur achha design alag channels par kai chhoti cells use karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Channel ek shared medium hai: ek time par ek transmitter, isliye airtime scarce resource hai.</li>
<li>Achha design coverage (signal) aur capacity (clean airtime) ka balance hai.</li>
<li>Neighbouring APs ko alag channels aur sensible power chahiye.</li>
<li>Controller RF design ko RF profiles aur RF tags se express karta hai.</li>
<li>Real RRM yahan sirf concept hai; lab channels deterministic hain aur haath se pin hote hain.</li>
</ul></div>
`}};export{e as default};