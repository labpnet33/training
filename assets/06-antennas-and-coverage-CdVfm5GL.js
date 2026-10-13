var e={id:`antennas`,h:{en:`Antennas, EIRP and coverage design`,hi:`Antennas, EIRP aur coverage design`},body:{en:`
<p>A bare light bulb lights a whole room evenly but not very far. A torch focuses the same energy into a beam that reaches the end of a long corridor but leaves the sides dark. Antennas do the same with radio energy. An antenna never creates power; it only <b>shapes</b> where the power goes.</p>

<h3>Omnidirectional antennas</h3>
<p>An <b>omnidirectional</b> antenna radiates equally in all horizontal directions, in a pattern shaped like a doughnut around the antenna. Most indoor APs, with internal antennas or small "rubber duck" dipoles, are omnidirectional. Mounted on the ceiling, they cover a circle of floor around them. Their weak spot is directly above and below, which is why an AP mounted on a wall or turned on its side covers the floor badly.</p>

<h3>Directional antennas</h3>
<p>A <b>directional</b> antenna focuses energy into a beam. The narrower the beam, the higher the <b>gain</b> and the longer the reach in that direction.</p>
<table class="cmp"><tr><th>Type</th><th>Beam</th><th>Typical gain</th><th>Use</th></tr>
<tr><td>Dipole / omni</td><td>360 degrees horizontal</td><td>2 to 6 dBi</td><td>Ceiling APs, offices, homes</td></tr>
<tr><td>Patch / panel</td><td>about 60 to 90 degrees</td><td>6 to 12 dBi</td><td>Wall-mounted coverage of a corridor, hall or warehouse aisle</td></tr>
<tr><td>Sector</td><td>60 to 120 degree slice</td><td>12 to 18 dBi</td><td>Stadiums, outdoor point-to-multipoint</td></tr>
<tr><td>Yagi</td><td>narrow, about 30 degrees</td><td>10 to 16 dBi</td><td>Point-to-point links, long corridors</td></tr>
<tr><td>Parabolic dish / grid</td><td>very narrow, a few degrees</td><td>20 to 30 dBi</td><td>Long-distance building-to-building links</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Omnidirectional and directional patterns seen from above">
<circle cx="150" cy="110" r="80" fill="#bae6fd" stroke="#64748b"/><circle cx="150" cy="110" r="8" fill="#64748b"/>
<text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">Omni: circle of coverage</text>
<path d="M380 110 L600 60 Q630 110 600 160 Z" fill="#bbf7d0" stroke="#64748b"/><circle cx="380" cy="110" r="8" fill="#64748b"/>
<text x="500" y="115" text-anchor="middle" class="svg-ink" font-size="13">high gain beam</text>
<text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">Directional: long, narrow reach</text>
</svg><p class="cap">Top view. Same transmitter power; the directional antenna trades width for distance.</p></div>

<h3>Gain, dBi and EIRP</h3>
<p>Antenna gain is measured in <b>dBi</b>, decibels relative to a theoretical <b>isotropic</b> antenna that radiates equally in every direction. A 6 dBi antenna sends four times the power of an isotropic antenna in its best direction (6 dB = two doublings) and correspondingly less elsewhere.</p>
<p>What regulators limit is <b>EIRP</b>, the power as if it came from an isotropic antenna:</p>
<p style="text-align:center"><b>EIRP (dBm) = transmitter power (dBm) + antenna gain (dBi) - cable and connector loss (dB)</b></p>
<div class="eg"><p><b>Worked example.</b> An outdoor bridge radio transmits at 18 dBm, connects through a cable with 2 dB of loss to a 14 dBi Yagi. EIRP = 18 + 14 - 2 = 30 dBm (1 W). If the local limit is 30 dBm EIRP, this is exactly on the limit. Swapping to a 20 dBi dish without lowering transmitter power would make it 36 dBm and illegal, so the engineer would reduce the radio to 12 dBm.</p></div>

<h3>Polarisation and MIMO</h3>
<p>Radio waves have <b>polarisation</b>, the orientation of the electric field: vertical, horizontal or both. For a point-to-point link, both ends must use the same polarisation, or the signal can drop by 20 dB or more. MIMO APs use several antennas, often mixing polarisations, so clients in any orientation (a phone held sideways) still get a good signal.</p>

<h3>Designing coverage: the site survey</h3>
<p>You cannot guess coverage; walls of concrete, glass, metal shelving, lift shafts and even people change it. A <b>site survey</b> measures it:</p>
<ul>
<li><b>Predictive survey</b>: software models the floor plan with wall materials and places virtual APs. Fast and cheap, good for a first design.</li>
<li><b>Passive survey</b>: walk the site with a survey tool that listens to all APs and records RSSI, SNR and channels on the floor plan.</li>
<li><b>Active survey</b>: the tool associates to the network and measures real throughput, retries and roaming.</li>
<li><b>AP-on-a-stick</b>: temporarily mount an AP where you plan to install it and measure its cell before drilling.</li>
</ul>
<p>The result is a <b>heat map</b>: colours over the floor plan showing signal strength. Designers usually aim for -67 dBm or better with at least two APs heard at -67 dBm in voice areas, and 25 dB SNR. Design for <b>capacity</b> too: count users and devices per area, not only square metres. A lecture hall for 300 students needs several APs on different channels even though one AP's signal would reach every seat.</p>

<div class="warn"><p><b>Common mistake.</b> Mounting ceiling APs inside metal enclosures, above metal ceiling tiles or in comms cupboards. Metal reflects and blocks signal; the AP ends up covering the cupboard. Another classic: mounting an omnidirectional AP vertically on a wall so half its doughnut points into the next room or the floor above.</p></div>

<div class="exam"><p><b>Exam trap.</b> For a building-to-building link, choose <b>directional</b> antennas (Yagi, dish, panel). For even coverage of an open office from the ceiling, choose <b>omnidirectional</b>. If a question says "signal leaks into the car park", the answers are lower power, directional or patch antennas pointed inward, and repositioning the AP, not a stronger antenna.</p></div>

<div class="scn"><h4>The warehouse aisles with no signal</h4><p>A warehouse had omnidirectional APs mounted high in the centre of the roof. Scanners worked in the main corridor but failed deep inside the 12 m tall racking aisles, where metal shelving full of stock absorbed and reflected the signal. A passive survey showed -84 dBm halfway down each aisle. The engineer replaced them with patch antennas at the end of each aisle, pointing down its length, and added APs at the far end for long aisles. The new survey showed -62 to -66 dBm along every aisle.</p><p><b>Lesson:</b> pick the antenna pattern that matches the shape of the space, and verify with a survey.</p></div>

<div class="iv"><p class="q">"When would you use a directional antenna instead of an omnidirectional one?"</p><p>Strong answer: directional antennas focus energy for long, narrow coverage: point-to-point links between buildings, long corridors or warehouse aisles, outdoor sectors, or to keep signal inside a building instead of leaking outside. Omnidirectional antennas suit ceiling-mounted APs covering open areas. Mention gain in dBi, the EIRP formula (transmit power + gain - cable loss) and that regulators limit EIRP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antennas shape power, they do not add it: omni = 360-degree doughnut; directional = focused beam with higher gain.</li>
<li>Patch/panel for walls and aisles, Yagi and dish for point-to-point, sector for outdoor multipoint.</li>
<li>EIRP = transmit power + antenna gain - cable loss; regulators limit EIRP.</li>
<li>Match polarisation on point-to-point links.</li>
<li>Use predictive, passive and active surveys and heat maps; design for both coverage (-67 dBm, 25 dB SNR) and capacity.</li>
</ul></div>
`,hi:`
<p>Ek khula bulb poore kamre ko barabar roshni deta hai par bahut door tak nahi. Ek torch wahi energy ek beam mein focus karti hai jo lambe corridor ke end tak pahunchti hai par side andhere mein chhod deti hai. Antennas radio energy ke saath yahi karte hain. Antenna kabhi power paida nahi karta; woh sirf <b>shape</b> karta hai ki power kahan jaaye.</p>

<h3>Omnidirectional antennas</h3>
<p><b>Omnidirectional</b> antenna saari horizontal directions mein barabar radiate karta hai, antenna ke chaaron taraf doughnut jaise pattern mein. Zyada tar indoor APs, internal antennas ya chhote "rubber duck" dipoles ke saath, omnidirectional hote hain. Ceiling par lage hon to apne aas paas floor ka ek circle cover karte hain. Inki kamzori seedha upar aur neeche hai, isiliye deewar par ya side mein ghumaaya hua AP floor ko bura cover karta hai.</p>

<h3>Directional antennas</h3>
<p><b>Directional</b> antenna energy ko ek beam mein focus karta hai. Beam jitni patli, <b>gain</b> utna zyada aur us direction mein reach utni lambi.</p>
<table class="cmp"><tr><th>Type</th><th>Beam</th><th>Typical gain</th><th>Use</th></tr>
<tr><td>Dipole / omni</td><td>360 degrees horizontal</td><td>2 se 6 dBi</td><td>Ceiling APs, offices, ghar</td></tr>
<tr><td>Patch / panel</td><td>lagbhag 60 se 90 degrees</td><td>6 se 12 dBi</td><td>Corridor, hall ya warehouse aisle ki wall-mounted coverage</td></tr>
<tr><td>Sector</td><td>60 se 120 degree ka tukda</td><td>12 se 18 dBi</td><td>Stadiums, outdoor point-to-multipoint</td></tr>
<tr><td>Yagi</td><td>patli, lagbhag 30 degrees</td><td>10 se 16 dBi</td><td>Point-to-point links, lambe corridors</td></tr>
<tr><td>Parabolic dish / grid</td><td>bahut patli, kuch degrees</td><td>20 se 30 dBi</td><td>Lambi doori ke building-to-building links</td></tr>
</table>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Upar se dekhe gaye omnidirectional aur directional patterns">
<circle cx="150" cy="110" r="80" fill="#bae6fd" stroke="#64748b"/><circle cx="150" cy="110" r="8" fill="#64748b"/>
<text x="150" y="205" text-anchor="middle" class="svg-ink" font-size="13">Omni: coverage ka circle</text>
<path d="M380 110 L600 60 Q630 110 600 160 Z" fill="#bbf7d0" stroke="#64748b"/><circle cx="380" cy="110" r="8" fill="#64748b"/>
<text x="500" y="115" text-anchor="middle" class="svg-ink" font-size="13">high gain beam</text>
<text x="490" y="205" text-anchor="middle" class="svg-ink" font-size="13">Directional: lambi, patli reach</text>
</svg><p class="cap">Upar se view. Same transmitter power; directional antenna chaudai ke badle doori deta hai.</p></div>

<h3>Gain, dBi aur EIRP</h3>
<p>Antenna gain <b>dBi</b> mein measure hota hai, ek theoretical <b>isotropic</b> antenna ke relative decibels jo har direction mein barabar radiate karta hai. 6 dBi antenna apni best direction mein isotropic antenna se chaar guna power bhejta hai (6 dB = do doublings) aur baaki jagah utna hi kam.</p>
<p>Regulators jo limit karte hain woh <b>EIRP</b> hai, power aise jaise woh isotropic antenna se aayi ho:</p>
<p style="text-align:center"><b>EIRP (dBm) = transmitter power (dBm) + antenna gain (dBi) - cable aur connector loss (dB)</b></p>
<div class="eg"><p><b>Worked example.</b> Ek outdoor bridge radio 18 dBm par transmit karta hai, 2 dB loss wali cable se 14 dBi Yagi se juda hai. EIRP = 18 + 14 - 2 = 30 dBm (1 W). Agar local limit 30 dBm EIRP hai, to yeh bilkul limit par hai. Transmitter power kam kiye bina 20 dBi dish lagane se yeh 36 dBm aur illegal ho jaayega, isliye engineer radio ko 12 dBm par kar dega.</p></div>

<h3>Polarisation aur MIMO</h3>
<p>Radio waves ki <b>polarisation</b> hoti hai, electric field ki disha: vertical, horizontal ya dono. Point-to-point link ke liye dono ends par same polarisation honi chahiye, warna signal 20 dB ya usse zyada gir sakta hai. MIMO APs kai antennas use karte hain, aksar polarisations mix karke, taaki kisi bhi orientation wale clients (side mein pakda phone) ko achha signal mile.</p>

<h3>Coverage design: site survey</h3>
<p>Coverage ka andaaza nahi laga sakte; concrete ki deewarein, glass, metal shelving, lift shafts aur log bhi use badal dete hain. <b>Site survey</b> ise measure karta hai:</p>
<ul>
<li><b>Predictive survey</b>: software wall materials ke saath floor plan model karta hai aur virtual APs rakhta hai. Tez aur sasta, pehle design ke liye achha.</li>
<li><b>Passive survey</b>: survey tool ke saath site par chalo jo saare APs sunta hai aur floor plan par RSSI, SNR aur channels record karta hai.</li>
<li><b>Active survey</b>: tool network se associate hota hai aur asli throughput, retries aur roaming measure karta hai.</li>
<li><b>AP-on-a-stick</b>: drilling se pehle AP ko temporarily wahan lagao jahan install karna hai aur uska cell measure karo.</li>
</ul>
<p>Result ek <b>heat map</b> hai: floor plan par rang jo signal strength dikhate hain. Designers aam taur par -67 dBm ya behtar ka target rakhte hain, voice areas mein kam se kam do APs -67 dBm par sunai dein, aur 25 dB SNR. <b>Capacity</b> ke liye bhi design karo: har area mein users aur devices gino, sirf square metres nahi. 300 students wale lecture hall ko alag channels par kai APs chahiye, bhale hi ek AP ka signal har seat tak pahunch jaaye.</p>

<div class="warn"><p><b>Common galti.</b> Ceiling APs ko metal enclosures ke andar, metal ceiling tiles ke upar ya comms cupboards mein lagana. Metal signal ko reflect aur block karta hai; AP cupboard ko hi cover karta reh jaata hai. Ek aur classic: omnidirectional AP ko deewar par vertical lagana taaki uska aadha doughnut agle kamre ya upar wale floor mein jaaye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Building-to-building link ke liye <b>directional</b> antennas chuno (Yagi, dish, panel). Ceiling se open office ki barabar coverage ke liye <b>omnidirectional</b> chuno. Agar sawaal kahe "signal car park mein leak ho raha hai", to jawab hain kam power, andar ki taraf point kiye directional ya patch antennas, aur AP ki position badalna, strong antenna nahi.</p></div>

<div class="scn"><h4>Warehouse aisles jahan signal nahi tha</h4><p>Ek warehouse mein omnidirectional APs roof ke beech mein oonchai par lage the. Scanners main corridor mein chalte the par 12 m oonchi racking aisles ke andar fail ho jaate the, jahan stock se bhari metal shelving signal ko absorb aur reflect karti thi. Passive survey ne har aisle ke beech mein -84 dBm dikhaya. Engineer ne unhe har aisle ke end par patch antennas se badla, aisle ki lambai ki taraf point karte hue, aur lambi aisles ke door wale end par APs jode. Naye survey ne har aisle mein -62 se -66 dBm dikhaya.</p><p><b>Seekh:</b> woh antenna pattern chuno jo jagah ke shape se match kare, aur survey se verify karo.</p></div>

<div class="iv"><p class="q">"Aap omnidirectional ki jagah directional antenna kab use karoge?"</p><p>Strong answer: directional antennas lambi, patli coverage ke liye energy focus karte hain: buildings ke beech point-to-point links, lambe corridors ya warehouse aisles, outdoor sectors, ya signal ko bahar leak hone ki jagah building ke andar rakhne ke liye. Omnidirectional antennas open areas cover karne wale ceiling-mounted APs ke liye theek hain. dBi mein gain, EIRP formula (transmit power + gain - cable loss) aur yeh ki regulators EIRP limit karte hain, zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antennas power shape karte hain, jodte nahi: omni = 360-degree doughnut; directional = zyada gain wali focused beam.</li>
<li>Deewaron aur aisles ke liye patch/panel, point-to-point ke liye Yagi aur dish, outdoor multipoint ke liye sector.</li>
<li>EIRP = transmit power + antenna gain - cable loss; regulators EIRP limit karte hain.</li>
<li>Point-to-point links par polarisation match karo.</li>
<li>Predictive, passive aur active surveys aur heat maps use karo; coverage (-67 dBm, 25 dB SNR) aur capacity dono ke liye design karo.</li>
</ul></div>
`}};export{e as default};