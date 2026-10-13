var e={id:`antennas-eirp`,h:{en:`Antennas: types, gain, patterns, MIMO and EIRP`,hi:`Antennas: types, gain, patterns, MIMO aur EIRP`},body:{en:`
<p>An antenna does not create power. It <b>shapes</b> the power the radio gives it, pushing more energy in some directions and less in others. Choosing the antenna is choosing the shape of your cell. ENCOR expects you to know the common antenna types, read gain and beamwidth, and calculate EIRP.</p>

<h3>An analogy: a torch and a bare bulb</h3>
<p>A bare bulb lights the whole room evenly but dimly far away. Put the same bulb in a torch with a reflector and it throws a bright narrow beam down the corridor, while the sides of the room go dark. The bulb's wattage did not change. The reflector redistributed the light. An <b>omnidirectional</b> antenna is the bare bulb; a <b>directional</b> antenna is the torch.</p>

<h3>Gain, dBi and dBd</h3>
<p>Antenna gain is measured against a reference. The <b>isotropic radiator</b> is an imaginary point that radiates equally in all directions (a perfect sphere): gain relative to it is <b>dBi</b>. Some vendors quote gain against a simple <b>dipole</b>: <b>dBd</b>. A dipole already has 2.14 dBi, so <code>dBi = dBd + 2.14</code>. A "3 dBd" antenna is about 5.14 dBi.</p>
<p>Gain comes with a price: the more gain, the narrower the beam. <b>Beamwidth</b> is the angle between the points where the signal is 3 dB below the peak (the half-power points), quoted separately for the horizontal (azimuth) and vertical (elevation) planes.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Omni versus directional patterns">
<circle cx="110" cy="110" r="10" fill="#64748b"/><ellipse cx="110" cy="110" rx="90" ry="40" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/><text x="110" y="185" text-anchor="middle" class="svg-ink" font-size="13">Omni (dipole): donut</text><text x="110" y="203" text-anchor="middle" class="svg-muted" font-size="12">2–6 dBi, 360° horizontal</text>
<circle cx="280" cy="110" r="8" fill="#64748b"/><path d="M280 110 L400 60 Q430 110 400 160 Z" fill="#bbf7d0" fill-opacity="0.7" stroke="#64748b"/><text x="340" y="185" text-anchor="middle" class="svg-ink" font-size="13">Patch: wide beam</text><text x="340" y="203" text-anchor="middle" class="svg-muted" font-size="12">6–9 dBi, 60–75°</text>
<circle cx="460" cy="110" r="8" fill="#64748b"/><path d="M460 110 L620 90 Q630 110 620 130 Z" fill="#fde68a" fill-opacity="0.8" stroke="#64748b"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="13">Yagi / dish: narrow</text><text x="545" y="203" text-anchor="middle" class="svg-muted" font-size="12">10–16 dBi Yagi, 20+ dBi dish</text>
</svg><p class="cap">Same radio power, different shapes. Higher gain always means a narrower beam.</p></div>

<h3>The common antenna types</h3>
<table class="cmp"><tr><th>Type</th><th>Typical gain</th><th>Pattern</th><th>Where you use it</th></tr>
<tr><td><b>Omnidirectional dipole</b> (internal or "rubber duck")</td><td>2–6 dBi</td><td>Donut: 360° horizontally, flattened vertically</td><td>Carpeted offices, ceiling-mounted APs</td></tr>
<tr><td><b>Downtilt omni</b></td><td>3–6 dBi</td><td>Donut tilted downwards</td><td>High ceilings where the signal must reach the floor</td></tr>
<tr><td><b>Patch</b> (panel)</td><td>6–9 dBi</td><td>Wide directional, about 60–75°</td><td>Wall-mounted along a corridor, stadium seating</td></tr>
<tr><td><b>Sector</b></td><td>12–17 dBi</td><td>Wide horizontally (60–120°), narrow vertically</td><td>Outdoor areas, large halls, point-to-multipoint</td></tr>
<tr><td><b>Yagi</b></td><td>10–16 dBi</td><td>Narrow, about 25–50°</td><td>Warehouse aisles, building-to-building links</td></tr>
<tr><td><b>Parabolic dish / grid</b></td><td>20–30 dBi</td><td>Very narrow, a few degrees</td><td>Long point-to-point bridge links</td></tr></table>
<p>Cisco APs come as <b>internal-antenna</b> models (the "I" models, for offices) and <b>external-antenna</b> models (the "E" models, with connectors for patch, Yagi or sector antennas). Some models add a smart antenna connector for hyperlocation or directional kits. Always use the antennas the vendor certified for that AP, because the regulatory limit is on the total radiated power.</p>

<h3>Polarisation</h3>
<p>Radio waves have an orientation: vertical or horizontal <b>polarisation</b>. If the transmitter and receiver antennas are crossed at 90°, you can lose 20 dB or more. Indoors, reflections mix polarisations and the effect is smaller, but on a point-to-point bridge link both ends must be aligned exactly.</p>

<h3>MIMO and spatial streams</h3>
<p>Since 802.11n, APs have several radio chains, each with its own antenna. The notation <b>T×R:S</b> (for example <b>4×4:4</b>) means 4 transmit chains, 4 receive chains, 4 <b>spatial streams</b>. Multiple antennas give three benefits:</p>
<ul><li><b>Spatial multiplexing</b>: different data on each stream at the same time, so throughput multiplies (only up to the smaller of the AP's and the client's stream count).</li>
<li><b>Transmit beamforming</b> (TxBF): the AP adjusts the phase on each antenna so the signals add up at the client's position, gaining a few dB.</li>
<li><b>Maximal ratio combining</b> (MRC): the AP combines what all its receive antennas heard, improving uplink sensitivity from weak clients.</li></ul>

<h3>EIRP: what actually leaves the antenna</h3>
<p><b>Effective Isotropic Radiated Power</b> is the power an isotropic antenna would need to produce the same peak signal as your antenna in its strongest direction. Regulators limit EIRP, not just the radio's output:</p>
<pre class="code"><span class="c">! EIRP = transmitter power (dBm) − cable/connector loss (dB) + antenna gain (dBi)</span>
EIRP = Tx − cable loss + antenna gain</pre>

<div class="eg"><p><b>Worked example 1.</b> Radio 20 dBm, 3 dB of cable, 6 dBi patch: EIRP = 20 − 3 + 6 = <b>23 dBm</b> (about 200 mW). <b>Worked example 2.</b> A 14 dBi Yagi on the same radio would give 20 − 3 + 14 = 31 dBm. If the regulatory limit in that band is 30 dBm, you must lower the radio to at most 19 dBm. <b>Worked example 3.</b> Two setups are equal in EIRP: 17 dBm radio + 6 dBi antenna, or 20 dBm radio + 3 dBi antenna, both 23 dBm (ignoring cable). The second hears clients worse, because receive gain comes from the antenna, not from transmit power.</p></div>
<p>That last point is important for design: antenna gain helps in <b>both directions</b> (transmit and receive), while increasing radio power helps only the downlink. Controllers display the radio's configured power level, for example power level 1 = the maximum for that radio and band, with each level usually 3 dB lower. In the lab, <code>show ap dot11 5ghz summary</code> lists the power level of every 5 GHz radio (level 1 is the maximum), and <code>ap name AP2 dot11 5ghz txpower 3</code> sets level 3.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Fitting a high-gain directional antenna "to get more range" in an open-plan office: coverage behind and beside the antenna disappears. (2) Mounting a ceiling omni on a wall: half the donut goes into the wall and the neighbours' floor. (3) Forgetting cable loss on long outdoor runs; 10 m of thin cable can eat several dB at 5 GHz.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Tx 17 dBm, cable loss 2 dB, antenna 9 dBi. EIRP?" 24 dBm. "Which antenna for a long, narrow warehouse aisle?" Yagi (or a patch for shorter aisles), not an omni. "What does 3×3:2 mean?" Three transmit chains, three receive chains, two spatial streams. "dBd to dBi?" add 2.14.</p></div>

<div class="scn"><h4>The campus bridge that kept flapping</h4><p>A college linked two buildings 400 m apart with a pair of outdoor APs in bridge mode and 13 dBi patch antennas. The link dropped every afternoon. The engineer found RSSI −78 dBm at the far end, too low for the data rate chosen, and one antenna rotated to horizontal polarisation after a storm. Re-aligning both antennas vertically gained 18 dB, and swapping to 23 dBi dishes (with radio power lowered to stay inside the EIRP limit) added the fade margin needed for summer foliage.</p><p><b>Lesson:</b> for point-to-point links, gain, alignment and polarisation matter more than transmit power, and the EIRP limit applies to the whole chain.</p></div>

<div class="iv"><p class="q">"What is EIRP and why do regulators care about it rather than the radio's output power?"</p><p>Strong answer: EIRP is transmit power minus cable loss plus antenna gain, the effective power radiated in the antenna's strongest direction. Regulators limit what reaches the air and could interfere with others; a high-gain antenna focuses energy, so the same radio power can exceed the limit. Give a numeric example, and add that antenna gain also improves reception, so it is better to use gain than to raise radio power.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antennas shape power; more gain means a narrower beam (beamwidth is measured at −3 dB).</li>
<li>dBi = dBd + 2.14. Omni 2–6 dBi, patch 6–9, sector 12–17, Yagi 10–16, dish 20+.</li>
<li>EIRP = Tx − cable loss + antenna gain; regulators limit EIRP.</li>
<li>MIMO T×R:S; streams are limited by the weaker side. Beamforming and MRC add a few dB.</li>
<li>Match polarisation and use vendor-certified antennas, especially on bridge links.</li>
</ul></div>
`,hi:`
<p>Antenna power paida nahi karta. Woh radio se mili power ko <b>shape</b> karta hai, kuch directions mein zyada energy aur kuch mein kam bhejta hai. Antenna chunna apne cell ka shape chunna hai. ENCOR expect karta hai ki aap common antenna types jaano, gain aur beamwidth padh sako, aur EIRP calculate kar sako.</p>

<h3>Ek analogy: torch aur khula bulb</h3>
<p>Khula bulb poore kamre ko barabar roshni deta hai par door tak dheema. Wahi bulb reflector wali torch mein daalo to woh corridor mein tez patli beam phenkta hai, jabki kamre ke side andhere ho jaate hain. Bulb ki wattage nahi badli. Reflector ne roshni ko dobara baant diya. <b>Omnidirectional</b> antenna khula bulb hai; <b>directional</b> antenna torch hai.</p>

<h3>Gain, dBi aur dBd</h3>
<p>Antenna gain ek reference ke against naapa jaata hai. <b>Isotropic radiator</b> ek kaalpanik point hai jo har direction mein barabar radiate karta hai (perfect sphere): uske relative gain <b>dBi</b> hai. Kuch vendors simple <b>dipole</b> ke against gain batate hain: <b>dBd</b>. Dipole ke paas pehle se 2.14 dBi hai, isliye <code>dBi = dBd + 2.14</code>. "3 dBd" antenna lagbhag 5.14 dBi hai.</p>
<p>Gain ki keemat hai: jitna zyada gain, utni patli beam. <b>Beamwidth</b> un points ke beech ka angle hai jahan signal peak se 3 dB neeche hai (half-power points), horizontal (azimuth) aur vertical (elevation) planes ke liye alag batate hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Omni vs directional patterns">
<circle cx="110" cy="110" r="10" fill="#64748b"/><ellipse cx="110" cy="110" rx="90" ry="40" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/><text x="110" y="185" text-anchor="middle" class="svg-ink" font-size="13">Omni (dipole): donut</text><text x="110" y="203" text-anchor="middle" class="svg-muted" font-size="12">2–6 dBi, 360° horizontal</text>
<circle cx="280" cy="110" r="8" fill="#64748b"/><path d="M280 110 L400 60 Q430 110 400 160 Z" fill="#bbf7d0" fill-opacity="0.7" stroke="#64748b"/><text x="340" y="185" text-anchor="middle" class="svg-ink" font-size="13">Patch: chaudi beam</text><text x="340" y="203" text-anchor="middle" class="svg-muted" font-size="12">6–9 dBi, 60–75°</text>
<circle cx="460" cy="110" r="8" fill="#64748b"/><path d="M460 110 L620 90 Q630 110 620 130 Z" fill="#fde68a" fill-opacity="0.8" stroke="#64748b"/><text x="545" y="185" text-anchor="middle" class="svg-ink" font-size="13">Yagi / dish: patli</text><text x="545" y="203" text-anchor="middle" class="svg-muted" font-size="12">10–16 dBi Yagi, 20+ dBi dish</text>
</svg><p class="cap">Same radio power, alag shapes. Zyada gain ka matlab hamesha patli beam.</p></div>

<h3>Common antenna types</h3>
<table class="cmp"><tr><th>Type</th><th>Typical gain</th><th>Pattern</th><th>Kahan use karte ho</th></tr>
<tr><td><b>Omnidirectional dipole</b> (internal ya "rubber duck")</td><td>2–6 dBi</td><td>Donut: horizontally 360°, vertically chapta</td><td>Carpet wale offices, ceiling-mounted APs</td></tr>
<tr><td><b>Downtilt omni</b></td><td>3–6 dBi</td><td>Neeche jhuka hua donut</td><td>Oonchi ceilings jahan signal floor tak pahunchna chahiye</td></tr>
<tr><td><b>Patch</b> (panel)</td><td>6–9 dBi</td><td>Chauda directional, lagbhag 60–75°</td><td>Corridor ke saath wall-mounted, stadium seating</td></tr>
<tr><td><b>Sector</b></td><td>12–17 dBi</td><td>Horizontally chauda (60–120°), vertically patla</td><td>Outdoor areas, bade halls, point-to-multipoint</td></tr>
<tr><td><b>Yagi</b></td><td>10–16 dBi</td><td>Patla, lagbhag 25–50°</td><td>Warehouse aisles, building-to-building links</td></tr>
<tr><td><b>Parabolic dish / grid</b></td><td>20–30 dBi</td><td>Bahut patla, kuch degree</td><td>Lambe point-to-point bridge links</td></tr></table>
<p>Cisco APs <b>internal-antenna</b> models ("I" models, offices ke liye) aur <b>external-antenna</b> models ("E" models, patch, Yagi ya sector antennas ke connectors ke saath) mein aate hain. Kuch models hyperlocation ya directional kits ke liye smart antenna connector bhi dete hain. Hamesha wahi antennas use karo jo vendor ne us AP ke liye certify kiye hain, kyunki regulatory limit total radiated power par hai.</p>

<h3>Polarisation</h3>
<p>Radio waves ka ek orientation hota hai: vertical ya horizontal <b>polarisation</b>. Agar transmitter aur receiver antennas 90° par cross hon, to 20 dB ya zyada kho sakte ho. Indoor mein reflections polarisations mila dete hain aur asar kam hota hai, lekin point-to-point bridge link par dono ends exactly aligned hone chahiye.</p>

<h3>MIMO aur spatial streams</h3>
<p>802.11n se APs mein kai radio chains hoti hain, har ek ka apna antenna. Notation <b>T×R:S</b> (jaise <b>4×4:4</b>) ka matlab 4 transmit chains, 4 receive chains, 4 <b>spatial streams</b>. Kai antennas teen fayde dete hain:</p>
<ul><li><b>Spatial multiplexing</b>: ek hi time par har stream par alag data, to throughput guna ho jaata hai (sirf AP aur client ke stream count mein se chhote tak).</li>
<li><b>Transmit beamforming</b> (TxBF): AP har antenna par phase adjust karta hai taaki signals client ki position par jud jaayein, kuch dB ka fayda.</li>
<li><b>Maximal ratio combining</b> (MRC): AP apne saare receive antennas ne jo suna use combine karta hai, kamzor clients se uplink sensitivity behtar hoti hai.</li></ul>

<h3>EIRP: antenna se asal mein kya nikalta hai</h3>
<p><b>Effective Isotropic Radiated Power</b> woh power hai jo ek isotropic antenna ko chahiye taaki woh aapke antenna ki sabse strong direction jitna peak signal de. Regulators sirf radio output nahi, EIRP limit karte hain:</p>
<pre class="code"><span class="c">! EIRP = transmitter power (dBm) − cable/connector loss (dB) + antenna gain (dBi)</span>
EIRP = Tx − cable loss + antenna gain</pre>

<div class="eg"><p><b>Worked example 1.</b> Radio 20 dBm, 3 dB cable, 6 dBi patch: EIRP = 20 − 3 + 6 = <b>23 dBm</b> (lagbhag 200 mW). <b>Worked example 2.</b> Usi radio par 14 dBi Yagi dega 20 − 3 + 14 = 31 dBm. Agar us band mein regulatory limit 30 dBm hai, to radio ko zyada se zyada 19 dBm karna padega. <b>Worked example 3.</b> Do setups EIRP mein barabar hain: 17 dBm radio + 6 dBi antenna, ya 20 dBm radio + 3 dBi antenna, dono 23 dBm (cable ignore karke). Doosra clients ko kharab sunta hai, kyunki receive gain antenna se aata hai, transmit power se nahi.</p></div>
<p>Yeh aakhri point design ke liye important hai: antenna gain <b>dono directions</b> (transmit aur receive) mein madad karta hai, jabki radio power badhana sirf downlink mein. Controllers radio ka configured power level dikhate hain, jaise power level 1 = us radio aur band ka maximum, aur har level aam taur par 3 dB kam. Lab mein <code>show ap dot11 5ghz summary</code> har 5 GHz radio ka power level dikhata hai (level 1 maximum hai), aur <code>ap name AP2 dot11 5ghz txpower 3</code> level 3 set karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Open-plan office mein "range badhane" ke liye high-gain directional antenna lagana: antenna ke peeche aur side ki coverage gayab. (2) Ceiling omni ko deewar par lagana: aadha donut deewar aur padosi floor mein jaata hai. (3) Lambe outdoor runs par cable loss bhoolna; 10 m patli cable 5 GHz par kai dB kha sakti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Tx 17 dBm, cable loss 2 dB, antenna 9 dBi. EIRP?" 24 dBm. "Lambi patli warehouse aisle ke liye kaunsa antenna?" Yagi (chhoti aisles ke liye patch), omni nahi. "3×3:2 ka matlab?" Teen transmit chains, teen receive chains, do spatial streams. "dBd se dBi?" 2.14 jodo.</p></div>

<div class="scn"><h4>Campus bridge jo baar-baar flap karta tha</h4><p>Ek college ne 400 m door do buildings ko bridge mode mein outdoor APs aur 13 dBi patch antennas ki pair se joda. Link har dopahar drop hota tha. Engineer ko far end par RSSI −78 dBm mila, chune gaye data rate ke liye bahut kam, aur ek toofan ke baad ek antenna ghoom kar horizontal polarisation par tha. Dono antennas vertically re-align karne se 18 dB mila, aur 23 dBi dishes lagane se (EIRP limit mein rehne ke liye radio power kam karke) garmiyon ki patton ke liye zaroori fade margin mil gaya.</p><p><b>Lesson:</b> point-to-point links par gain, alignment aur polarisation transmit power se zyada matter karte hain, aur EIRP limit poori chain par lagti hai.</p></div>

<div class="iv"><p class="q">"EIRP kya hai aur regulators radio output power ki jagah iski parvaah kyun karte hain?"</p><p>Strong answer: EIRP transmit power minus cable loss plus antenna gain hai, antenna ki sabse strong direction mein effective radiated power. Regulators wahi limit karte hain jo hawa mein pahunchta hai aur doosron ko interfere kar sakta hai; high-gain antenna energy focus karta hai, to same radio power bhi limit cross kar sakti hai. Ek numeric example do, aur jodo ki antenna gain reception bhi behtar karta hai, isliye radio power badhane se behtar gain use karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antennas power ko shape karte hain; zyada gain matlab patli beam (beamwidth −3 dB par naapi jaati hai).</li>
<li>dBi = dBd + 2.14. Omni 2–6 dBi, patch 6–9, sector 12–17, Yagi 10–16, dish 20+.</li>
<li>EIRP = Tx − cable loss + antenna gain; regulators EIRP limit karte hain.</li>
<li>MIMO T×R:S; streams kamzor side tak limited. Beamforming aur MRC kuch dB jodte hain.</li>
<li>Polarisation match karo aur vendor-certified antennas use karo, khaas kar bridge links par.</li>
</ul></div>
`}};export{e as default};