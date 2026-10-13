var e={id:`antennas-link-budget`,h:{en:`Antennas, EIRP, FSPL and the link budget (dB maths)`,hi:`Antennas, EIRP, FSPL aur link budget (dB maths)`},body:{en:`
<p>Radio engineers add and subtract instead of multiplying, because decibels turn multiplication into addition. This chapter teaches the dB language, antenna types, EIRP, free-space path loss (FSPL) and the link budget. These are <b>calculator skills</b>: the lab engine has no antenna patterns, but its RSSI formula is a simplified version of the same ideas. Every calculation below was checked by running it.</p>

<h3>Analogy: a loudspeaker and a megaphone</h3>
<p>Transmit power is the amplifier. An antenna does not create power; like a megaphone it only <i>focuses</i> the same power in one direction, so the sound is louder ahead and quieter behind. The gain of an antenna is the focus, not extra energy.</p>

<h3>The dB toolkit you must know by heart</h3>
<table class="cmp"><tr><th>Change</th><th>Meaning</th></tr>
<tr><td><b>+3 dB</b></td><td>power x 2 (really 1.995)</td></tr>
<tr><td><b>-3 dB</b></td><td>power / 2</td></tr>
<tr><td><b>+10 dB</b></td><td>power x 10</td></tr>
<tr><td><b>+20 dB</b></td><td>power x 100</td></tr>
<tr><td><b>+6 dB</b></td><td>power x 4, or double the free-space distance</td></tr>
</table>
<dl class="terms">
<dt>dB</dt><dd>A ratio between two powers: 10 x log10(P2 / P1).</dd>
<dt>dBm</dt><dd>Power relative to 1 milliwatt: dBm = 10 x log10(mW). 1 mW = 0 dBm, 100 mW = 20 dBm, 200 mW = 23 dBm, 40 mW = 16 dBm.</dd>
<dt>dBi</dt><dd>Antenna gain compared to an ideal isotropic radiator that sends equally in all directions.</dd>
<dt>dBd</dt><dd>Gain compared to a dipole. dBi = dBd + 2.15.</dd>
<dt>EIRP</dt><dd>Effective Isotropic Radiated Power: the power a perfect isotropic antenna would need to send to match the real beam peak. Regulators limit EIRP.</dd>
</dl>

<h3>Antenna types and what gain costs</h3>
<ul>
<li><b>Omnidirectional</b> (ceiling AP, dipole): gain 2 to 6 dBi, wide horizontal pattern, flat vertical doughnut. Best for open floors.</li>
<li><b>Patch and sector (directional)</b>: 6 to 14 dBi, beam 60 to 120 degrees. Used in halls, stadiums, warehouses and corridors.</li>
<li><b>Yagi, parabolic dish</b>: 12 to 30 dBi, very narrow beam. Used for point-to-point bridges.</li>
</ul>
<p>The rule: <b>more gain means a narrower beam</b>. Gain is not free; a higher-gain antenna must be aimed precisely, and its coverage elsewhere is weaker. Also note that antenna gain works in <i>both</i> directions: it improves receive as well as transmit, but the regulator limits only the transmit EIRP.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Omni versus directional pattern">
<ellipse cx="130" cy="80" rx="70" ry="52" fill="#bae6fd" fill-opacity="0.7" stroke="#64748b"/><circle cx="130" cy="80" r="5" fill="#334155"/>
<text x="130" y="150" text-anchor="middle" class="svg-ink" font-size="12">Omni, 5 dBi: wide, short</text>
<path d="M300 80 L470 22 Q500 80 470 138 Z" fill="#bbf7d0" fill-opacity="0.8" stroke="#64748b"/><circle cx="300" cy="80" r="5" fill="#334155"/>
<text x="400" y="150" text-anchor="middle" class="svg-ink" font-size="12">Patch, 13 dBi: narrow, long</text>
<path d="M540 80 L632 72 L632 88 Z" fill="#fde68a" stroke="#64748b"/><circle cx="540" cy="80" r="5" fill="#334155"/>
<text x="585" y="120" text-anchor="middle" class="svg-muted" font-size="12">Dish</text>
</svg><p class="cap">The same transmit power spread over a smaller angle reaches farther.</p></div>

<h3>EIRP</h3>
<p>EIRP (dBm) = transmit power (dBm) + antenna gain (dBi) - cable and connector loss (dB). Check against your regulatory limit; the WLC country code sets the limit for its APs.</p>
<div class="eg"><p><b>Worked example 1.</b> AP at 17 dBm, 5 dBi antenna, 2 dB cable loss: EIRP = 17 + 5 - 2 = <b>20 dBm</b> = 100 mW. <b>Example 2.</b> Outdoor bridge at 23 dBm, 13 dBi antenna, 3 dB cable loss: EIRP = 23 + 13 - 3 = <b>33 dBm</b>, about 2 W. If the local limit is 30 dBm, lower the transmit power to 20 dBm, giving 20 + 13 - 3 = 30 dBm.</p></div>

<h3>Free-space path loss (FSPL)</h3>
<p>Signal spreads out as it travels. For frequency f in MHz and distance d in km:</p>
<p><b>FSPL (dB) = 32.44 + 20 x log10(f in MHz) + 20 x log10(d in km)</b></p>
<div class="eg"><p><b>Worked example 3.</b> 5180 MHz (channel 36), 100 m = 0.1 km: 32.44 + 74.29 - 20 = <b>86.7 dB</b>. At 2437 MHz (channel 6) and the same 100 m: 32.44 + 67.74 - 20 = <b>80.2 dB</b>. The 5 GHz signal loses 6.5 dB more, which is 20 x log10(5180 / 2437). At 200 m both lose another 6 dB (the distance doubled). This is one reason 5 GHz cells are smaller than 2.4 GHz cells at the same power.</p></div>
<p>The lab formula, RSSI = tx - 40 - 6 (5 GHz) - 35 x log10(metres), is a close cousin: the 40 dB and 46 dB constants are FSPL at one metre (40.2 and 46.7), but indoors the exponent is about 35 instead of 20 because walls and furniture add loss. Free space is the optimistic best case; indoors loses faster.</p>

<h3>The link budget</h3>
<p>A link budget adds every gain and subtracts every loss from transmitter to receiver. Then it compares the received power with the receiver's sensitivity.</p>
<p><b>Rx power = Tx power + Tx antenna gain - Tx cable loss - path loss + Rx antenna gain - Rx cable loss.</b></p>
<p><b>Fade margin = Rx power - receiver sensitivity.</b> Fade margin is the safety buffer for rain, multipath, foliage growth and ageing. Outdoor links are usually designed for 10 to 20 dB.</p>
<div class="eg"><p><b>Worked example 4: 5 km 5.5 GHz bridge.</b> FSPL = 32.44 + 20 x log10(5500) + 20 x log10(5) = 32.44 + 74.81 + 13.98 = <b>121.2 dB</b>.
<br>Option A: 17 dBm radios, 13 dBi antennas, 1 dB cable each end: Rx = 17 + 13 - 1 - 121.2 + 13 - 1 = <b>-80.2 dBm</b>. With sensitivity of -90 dBm at a robust rate, fade margin = 9.8 dB, thin.
<br>Option B: 17 dBi dishes at 14 dBm (to stay at EIRP 14 + 17 - 1 = 30 dBm): Rx = 14 + 17 - 1 - 121.2 + 17 - 1 = <b>-75.2 dBm</b>, fade margin = <b>14.8 dB</b>. Better antennas gave +5 dB margin even with 3 dB less transmit power, because gain applies at both ends.</p></div>
<p>Remember the <b>weak side</b>: a client radio transmits at about 10 to 15 dBm with a tiny antenna, so the uplink usually fails before the downlink. Design to the weaker direction.</p>

<h3>Putting dB maths to use in design</h3>
<ul>
<li>Choosing power: each 3 dB step in the lab's power levels is a factor of two in power.</li>
<li>Omni versus patch: for a hall, a directional antenna aimed down the room gives stronger signal at the far end and less spill into the next AP's channel.</li>
<li>Cable loss: every extra metre of external cable between AP and antenna costs dB that you can never get back.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Adding dBm to dBm (never; add dB to dBm); mixing dBi and dBd (2.15 dB error); forgetting cable loss in EIRP; designing an outdoor link with only 3 dB of fade margin; assuming the client can match the AP's range.</p></div>
<div class="exam"><p><b>Exam trap.</b> 3 dB is double power, but you need 6 dB to double free-space range. Two antennas of 3 dBi each do not add to 6 dBi on one AP; gains add only when you add gain to the same path (Tx antenna gain plus Rx antenna gain).</p></div>

<div class="scn"><h4>The warehouse bridge that worked in summer</h4><p>A 3 km 5 GHz link to the warehouse passed the first test at 11 dB fade margin. In the monsoon the link kept dropping. The 5 GHz rain loss was small, but trees by the path had grown into the Fresnel zone. The team raised the mast by 3 m, swapped to 17 dBi dishes (+8 dB across both ends) and accepted a 20 dB margin.</p><p><b>Lesson:</b> a thin fade margin turns small changes into outages.</p></div>

<div class="iv"><p class="q">"An AP has 17 dBm transmit power, a 5 dBi antenna and 2 dB cable loss. What is the EIRP, and what is it in milliwatts?"</p><p>17 + 5 - 2 = 20 dBm, which is 100 mW. Show that you know the formula, convert with 10 to the power of dBm over 10, and mention that the regulatory limit is on EIRP, so antenna gain may force lower transmit power.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>+3 dB is double power, +10 dB is ten times, +6 dB doubles free-space range.</li>
<li>dBm is absolute, dB is a ratio, dBi is antenna gain (dBi = dBd + 2.15).</li>
<li>EIRP = Tx dBm + antenna dBi - cable loss; regulators limit it.</li>
<li>FSPL = 32.44 + 20 log10(MHz) + 20 log10(km); 5 GHz loses about 6.5 dB more than 2.4 GHz.</li>
<li>Fade margin = Rx power minus sensitivity; aim for 10 to 20 dB outdoors; design for the weaker client uplink.</li>
</ul></div>
`,hi:`
<p>Radio engineers multiply karne ki jagah add aur subtract karte hain, kyunki decibels multiplication ko addition mein badal dete hain. Yeh chapter dB ki bhasha, antenna types, EIRP, free-space path loss (FSPL) aur link budget sikhata hai. Yeh <b>calculator skills</b> hain: lab engine mein antenna patterns nahi hain, lekin uska RSSI formula inhi ideas ka simplified version hai. Neeche har calculation ko chala kar check kiya gaya hai.</p>

<h3>Analogy: loudspeaker aur megaphone</h3>
<p>Transmit power amplifier hai. Antenna power paida nahi karta; megaphone ki tarah woh sirf wahi power ek disha mein <i>focus</i> karta hai, isliye aawaz aage zyada aur peeche kam hoti hai. Antenna ka gain focus hai, extra energy nahi.</p>

<h3>dB toolkit jo yaad hona chahiye</h3>
<table class="cmp"><tr><th>Badlaav</th><th>Matlab</th></tr>
<tr><td><b>+3 dB</b></td><td>power x 2 (asal mein 1.995)</td></tr>
<tr><td><b>-3 dB</b></td><td>power / 2</td></tr>
<tr><td><b>+10 dB</b></td><td>power x 10</td></tr>
<tr><td><b>+20 dB</b></td><td>power x 100</td></tr>
<tr><td><b>+6 dB</b></td><td>power x 4, ya free-space distance double</td></tr>
</table>
<dl class="terms">
<dt>dB</dt><dd>Do powers ke beech ratio: 10 x log10(P2 / P1).</dd>
<dt>dBm</dt><dd>1 milliwatt ke relative power: dBm = 10 x log10(mW). 1 mW = 0 dBm, 100 mW = 20 dBm, 200 mW = 23 dBm, 40 mW = 16 dBm.</dd>
<dt>dBi</dt><dd>Ideal isotropic radiator se compare kiya gaya antenna gain, jo sab dishaon mein barabar bhejta hai.</dd>
<dt>dBd</dt><dd>Dipole se compare kiya gaya gain. dBi = dBd + 2.15.</dd>
<dt>EIRP</dt><dd>Effective Isotropic Radiated Power: woh power jo ek perfect isotropic antenna ko real beam ke peak ko match karne ke liye bhejni padti. Regulators EIRP par limit lagate hain.</dd>
</dl>

<h3>Antenna types aur gain ki keemat</h3>
<ul>
<li><b>Omnidirectional</b> (ceiling AP, dipole): gain 2 se 6 dBi, wide horizontal pattern, flat vertical doughnut. Khule floors ke liye best.</li>
<li><b>Patch aur sector (directional)</b>: 6 se 14 dBi, beam 60 se 120 degree. Halls, stadiums, warehouses aur corridors mein use hote hain.</li>
<li><b>Yagi, parabolic dish</b>: 12 se 30 dBi, bahut narrow beam. Point-to-point bridges ke liye.</li>
</ul>
<p>Rule: <b>zyada gain matlab narrow beam</b>. Gain muft nahi; high-gain antenna ko precisely aim karna padta hai, aur baaki jagah uski coverage kamzor hoti hai. Yeh bhi dhyan rakho ki antenna gain <i>dono</i> directions mein kaam karta hai: transmit ke saath receive bhi behtar karta hai, lekin regulator sirf transmit EIRP par limit lagata hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Omni versus directional pattern">
<ellipse cx="130" cy="80" rx="70" ry="52" fill="#bae6fd" fill-opacity="0.7" stroke="#64748b"/><circle cx="130" cy="80" r="5" fill="#334155"/>
<text x="130" y="150" text-anchor="middle" class="svg-ink" font-size="12">Omni, 5 dBi: wide, chhota</text>
<path d="M300 80 L470 22 Q500 80 470 138 Z" fill="#bbf7d0" fill-opacity="0.8" stroke="#64748b"/><circle cx="300" cy="80" r="5" fill="#334155"/>
<text x="400" y="150" text-anchor="middle" class="svg-ink" font-size="12">Patch, 13 dBi: narrow, lamba</text>
<path d="M540 80 L632 72 L632 88 Z" fill="#fde68a" stroke="#64748b"/><circle cx="540" cy="80" r="5" fill="#334155"/>
<text x="585" y="120" text-anchor="middle" class="svg-muted" font-size="12">Dish</text>
</svg><p class="cap">Wahi transmit power chhote angle mein failne par door tak pahunchti hai.</p></div>

<h3>EIRP</h3>
<p>EIRP (dBm) = transmit power (dBm) + antenna gain (dBi) - cable aur connector loss (dB). Apne regulatory limit se check karo; WLC ka country code uske APs ke liye limit set karta hai.</p>
<div class="eg"><p><b>Worked example 1.</b> AP 17 dBm, 5 dBi antenna, 2 dB cable loss: EIRP = 17 + 5 - 2 = <b>20 dBm</b> = 100 mW. <b>Example 2.</b> Outdoor bridge 23 dBm, 13 dBi antenna, 3 dB cable loss: EIRP = 23 + 13 - 3 = <b>33 dBm</b>, lagbhag 2 W. Agar local limit 30 dBm hai, to transmit power 20 dBm karo, tab 20 + 13 - 3 = 30 dBm.</p></div>

<h3>Free-space path loss (FSPL)</h3>
<p>Signal chalte hue failta hai. Frequency f MHz mein aur distance d km mein:</p>
<p><b>FSPL (dB) = 32.44 + 20 x log10(f in MHz) + 20 x log10(d in km)</b></p>
<div class="eg"><p><b>Worked example 3.</b> 5180 MHz (channel 36), 100 m = 0.1 km: 32.44 + 74.29 - 20 = <b>86.7 dB</b>. 2437 MHz (channel 6) par wahi 100 m: 32.44 + 67.74 - 20 = <b>80.2 dB</b>. 5 GHz signal 6.5 dB zyada khota hai, jo 20 x log10(5180 / 2437) hai. 200 m par dono 6 dB aur khote hain (distance double). Isiliye same power par 5 GHz cells 2.4 GHz cells se chhote hote hain.</p></div>
<p>Lab formula, RSSI = tx - 40 - 6 (5 GHz) - 35 x log10(metres), iska kareebi rishtedaar hai: 40 dB aur 46 dB constants ek metre par FSPL hain (40.2 aur 46.7), lekin indoors exponent 20 ke bajaye lagbhag 35 hota hai kyunki deewarein aur furniture loss jodte hain. Free space optimistic best case hai; indoors jaldi khota hai.</p>

<h3>Link budget</h3>
<p>Link budget transmitter se receiver tak har gain jodta aur har loss ghatata hai. Phir received power ko receiver ki sensitivity se compare karta hai.</p>
<p><b>Rx power = Tx power + Tx antenna gain - Tx cable loss - path loss + Rx antenna gain - Rx cable loss.</b></p>
<p><b>Fade margin = Rx power - receiver sensitivity.</b> Fade margin baarish, multipath, foliage growth aur ageing ke liye safety buffer hai. Outdoor links aam taur par 10 se 20 dB ke liye design hote hain.</p>
<div class="eg"><p><b>Worked example 4: 5 km 5.5 GHz bridge.</b> FSPL = 32.44 + 20 x log10(5500) + 20 x log10(5) = 32.44 + 74.81 + 13.98 = <b>121.2 dB</b>.
<br>Option A: 17 dBm radios, 13 dBi antennas, har end par 1 dB cable: Rx = 17 + 13 - 1 - 121.2 + 13 - 1 = <b>-80.2 dBm</b>. Robust rate par -90 dBm sensitivity ke saath fade margin = 9.8 dB, patla.
<br>Option B: 14 dBm par 17 dBi dishes (EIRP 14 + 17 - 1 = 30 dBm par rehne ke liye): Rx = 14 + 17 - 1 - 121.2 + 17 - 1 = <b>-75.2 dBm</b>, fade margin = <b>14.8 dB</b>. Behtar antennas ne 3 dB kam transmit power ke bawajood +5 dB margin diya, kyunki gain dono ends par lagta hai.</p></div>
<p><b>Kamzor side</b> yaad rakho: client radio chhote antenna ke saath lagbhag 10 se 15 dBm par transmit karta hai, isliye uplink aam taur par downlink se pehle fail hota hai. Kamzor direction ke liye design karo.</p>

<h3>Design mein dB maths ka use</h3>
<ul>
<li>Power chunna: lab ke power levels ka har 3 dB step power ka factor of two hai.</li>
<li>Omni versus patch: hall ke liye, room ke neeche aim kiya directional antenna door ke end par strong signal deta hai aur agle AP ke channel mein kam spill karta hai.</li>
<li>Cable loss: AP aur antenna ke beech external cable ka har extra metre dB khata hai jo kabhi wapas nahi milta.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> dBm ko dBm se add karna (kabhi nahi; dB ko dBm mein add karo); dBi aur dBd mix karna (2.15 dB error); EIRP mein cable loss bhool jaana; outdoor link sirf 3 dB fade margin se design karna; yeh maan lena ki client AP ki range match kar sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 3 dB double power hai, lekin free-space range double karne ke liye 6 dB chahiye. Ek AP par do 3 dBi antennas 6 dBi nahi banate; gains tabhi jodte hain jab aap same path mein gain jodo (Tx antenna gain plus Rx antenna gain).</p></div>

<div class="scn"><h4>Warehouse bridge jo garmi mein chali</h4><p>Warehouse tak 3 km ka 5 GHz link pehle test mein 11 dB fade margin par pass hua. Monsoon mein link girta raha. 5 GHz rain loss chhota tha, lekin raaste ke ped Fresnel zone mein ug aaye the. Team ne mast 3 m uncha kiya, 17 dBi dishes lagayi (dono ends par +8 dB) aur 20 dB margin rakha.</p><p><b>Seekh:</b> patla fade margin chhote badlaavon ko outage bana deta hai.</p></div>

<div class="iv"><p class="q">"AP ka transmit power 17 dBm hai, antenna 5 dBi aur cable loss 2 dB. EIRP kitna hai, aur milliwatts mein kitna?"</p><p>17 + 5 - 2 = 20 dBm, jo 100 mW hai. Formula aata hai yeh dikhao, 10 ki power dBm by 10 se convert karo, aur yeh bolo ki regulatory limit EIRP par hai, isliye antenna gain transmit power kam karwa sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>+3 dB double power, +10 dB das guna, +6 dB free-space range double karta hai.</li>
<li>dBm absolute hai, dB ratio hai, dBi antenna gain hai (dBi = dBd + 2.15).</li>
<li>EIRP = Tx dBm + antenna dBi - cable loss; regulators ise limit karte hain.</li>
<li>FSPL = 32.44 + 20 log10(MHz) + 20 log10(km); 5 GHz 2.4 GHz se lagbhag 6.5 dB zyada khota hai.</li>
<li>Fade margin = Rx power minus sensitivity; outdoors 10 se 20 dB rakho; kamzor client uplink ke liye design karo.</li>
</ul></div>
`}};export{e as default};