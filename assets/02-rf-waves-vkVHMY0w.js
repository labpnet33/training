var e={id:`rf-waves`,h:{en:`RF basics: waves, bands and how signals travel`,hi:`RF basics: waves, bands aur signals kaise travel karte hain`},body:{en:`
<p>Drop a stone into a still pond. Ripples spread out in circles, getting weaker the further they travel. If you bob your finger up and down quickly, the ripples come close together; bob it slowly and they are far apart. A leaf floating in the water rises and falls as each ripple passes. A Wi-Fi radio is the finger, the <b>radio frequency (RF)</b> wave is the ripple, and the receiving antenna is the leaf. Everything in this chapter is a way of describing those ripples.</p>

<h3>Frequency, period and wavelength</h3>
<dl class="terms">
<dt>Frequency (f)</dt><dd>How many complete cycles the wave makes in one second, measured in <b>hertz (Hz)</b>. 1 kHz = one thousand, 1 MHz = one million, 1 GHz = one billion cycles per second. A 2.4 GHz Wi-Fi signal oscillates 2.4 billion times every second.</dd>
<dt>Period (T)</dt><dd>The time for one cycle: T = 1 / f. For 2.4 GHz, about 0.42 nanoseconds.</dd>
<dt>Wavelength (λ)</dt><dd>The physical distance one cycle covers. Radio travels at the speed of light, c ≈ 300,000,000 m/s, so <b>λ = c / f</b>. Higher frequency means a shorter wavelength.</dd>
<dt>Amplitude</dt><dd>The height of the wave, how strong it is. Transmit power sets the amplitude; distance and obstacles shrink it.</dd>
<dt>Phase</dt><dd>Where in its cycle a wave is at a given moment, in degrees. Two copies of the same signal that arrive 180° out of phase cancel each other; this matters for multipath below.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Wavelength and amplitude">
<line x1="20" y1="80" x2="320" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M20 80 Q57 10 95 80 T170 80 T245 80 T320 80" fill="none" stroke="#0284c7" stroke-width="2.5"/>
<line x1="20" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="20" y1="122" x2="20" y2="138" stroke="#64748b"/><line x1="170" y1="122" x2="170" y2="138" stroke="#64748b"/>
<text x="95" y="150" text-anchor="middle" class="svg-accent" font-size="12">1 wavelength (12.5 cm)</text>
<line x1="57" y1="80" x2="57" y2="45" stroke="#64748b" stroke-width="1.5"/><text x="64" y="40" class="svg-muted" font-size="12">amplitude</text>
<text x="170" y="178" text-anchor="middle" class="svg-ink" font-size="13">2.4 GHz</text>
<line x1="360" y1="80" x2="620" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M360 80 Q378 10 396 80 T432 80 T468 80 T504 80 T540 80 T576 80 T612 80" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
<line x1="360" y1="130" x2="432" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="122" x2="360" y2="138" stroke="#64748b"/><line x1="432" y1="122" x2="432" y2="138" stroke="#64748b"/>
<text x="400" y="150" text-anchor="middle" class="svg-accent" font-size="12">1 wavelength (6 cm)</text>
<text x="490" y="178" text-anchor="middle" class="svg-ink" font-size="13">5 GHz</text>
</svg><p class="cap">Same amplitude, different frequency: the 5 GHz wave completes a cycle in about half the distance of the 2.4 GHz wave.</p></div>

<div class="eg"><p><b>Worked example.</b> λ = 300,000,000 / 2,400,000,000 = 0.125 m = <b>12.5 cm</b> for 2.4 GHz. For 5 GHz (5,000,000,000 Hz): 0.06 m = <b>6 cm</b>. For 6 GHz: 0.05 m = <b>5 cm</b>. Antenna elements are sized in fractions of the wavelength, which is why 5 and 6 GHz antennas are smaller.</p></div>

<h3>The three Wi-Fi bands</h3>
<table class="cmp"><tr><th>Band</th><th>Range</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>2.4 GHz (ISM)</td><td>2.400 to 2.4835 GHz</td><td>Longest range, penetrates walls best, every device supports it</td><td>Only 3 non-overlapping channels, crowded with Bluetooth, microwave ovens, cordless devices</td></tr>
<tr><td>5 GHz (U-NII)</td><td>about 5.150 to 5.850 GHz</td><td>Many more channels, less legacy noise, higher speeds</td><td>Shorter range, some channels need radar detection (DFS)</td></tr>
<tr><td>6 GHz</td><td>5.925 to 7.125 GHz (where permitted)</td><td>Huge clean spectrum, only Wi-Fi 6E and 7 devices, no legacy clients</td><td>Shortest range, needs new clients, availability depends on the country</td></tr></table>
<p>All three are <b>unlicensed</b>: anyone may transmit without a licence, provided they respect power limits. That freedom is why Wi-Fi spread everywhere, and also why you must share the air with neighbours.</p>

<h3>How signals meet the real world</h3>
<p>Even in empty space a signal gets weaker with distance because the energy spreads over a growing sphere. This is <b>free-space path loss</b>. Inside buildings, objects add five more effects:</p>
<ul>
<li><b>Absorption</b>: the material soaks up energy and turns it into a tiny amount of heat. Water, human bodies, concrete and brick absorb strongly. The wave continues, but with a lower amplitude.</li>
<li><b>Reflection</b>: the wave bounces off a smooth surface larger than its wavelength, like light from a mirror. Metal cabinets, lift doors, coated glass and whiteboards reflect.</li>
<li><b>Refraction</b>: the wave bends as it passes from one medium into another of different density, like a straw that looks bent in a glass of water. Glass, and air layers of different temperature over long outdoor links, refract.</li>
<li><b>Scattering</b>: a rough or uneven surface (gravel, foliage, dust, a chain-link fence) breaks the wave into many weak reflections in all directions.</li>
<li><b>Diffraction</b>: the wave bends around the edge of an obstacle, leaving an <b>RF shadow</b> directly behind it.</li>
</ul>
<p>Reflections create <b>multipath</b>: the receiver gets several copies of the same signal via different paths, arriving at slightly different times and phases. Copies that arrive out of phase partly cancel, causing deep fades. Older 802.11a/b/g radios suffered from multipath; since 802.11n, <b>MIMO</b> radios with several antennas actually use multipath to send separate spatial streams.</p>

<table class="cmp"><tr><th>Obstacle</th><th>Typical loss (varies a lot)</th></tr>
<tr><td>Interior drywall or wooden door</td><td>about 3 to 4 dB</td></tr>
<tr><td>Plain glass window</td><td>about 2 to 3 dB</td></tr>
<tr><td>Brick wall</td><td>about 6 to 10 dB</td></tr>
<tr><td>Concrete wall or floor</td><td>10 to 20 dB or more</td></tr>
<tr><td>Metal door, lift shaft</td><td>very high, often blocks the signal</td></tr></table>

<h3>Why it matters</h3>
<p>These effects decide where APs go. Mounting an AP inside a metal ceiling box, behind a pillar or next to a water tank wastes it. Planning 5 GHz coverage with the same AP spacing as 2.4 GHz leaves holes. Knowing the sources of <b>interference</b> (any non-Wi-Fi transmitter on your frequency) also saves hours: microwave ovens leak energy around 2.45 GHz, and Bluetooth, cordless phones and wireless cameras share 2.4 GHz.</p>

<div class="warn"><p><b>Common mistake.</b> Mounting APs above a false ceiling or inside metal enclosures "to keep them neat". The ceiling grid and tiles absorb and reflect the signal before it reaches the room. Mount APs below the ceiling with the antennas facing the users.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reflection = bounce off a smooth surface; refraction = bending when passing through a different medium; scattering = many weak reflections off a rough surface; absorption = energy lost inside the material. Also remember: higher frequency, shorter wavelength, more loss through obstacles.</p></div>

<div class="scn"><h4>Great survey, bad Monday</h4><p>A training centre surveyed its new floor on a Sunday: every seat showed a 5 GHz signal of about −60 dBm. On Monday, with 120 students and their bags and water bottles in the room, the back rows dropped to −74 dBm and video lessons buffered. The engineer repeated the measurement during a class and saw about 10 dB of extra loss from human bodies. Two extra APs on the side walls fixed it.</p><p><b>Lesson:</b> people are mostly water and absorb RF; always plan margin and validate coverage in real operating conditions.</p></div>

<div class="iv"><p class="q">"Why does 5 GHz have a shorter range than 2.4 GHz?"</p><p>Strong answer: higher frequency means a shorter wavelength, so walls and people absorb more of it, and with antennas of the same gain the received power is lower: free-space loss at 5 GHz is about 6 dB higher than at 2.4 GHz over the same distance. Add that 5 GHz is still preferred for capacity because it offers many more non-overlapping channels and less interference.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Frequency in Hz, wavelength λ = c / f: 2.4 GHz ≈ 12.5 cm, 5 GHz ≈ 6 cm, 6 GHz ≈ 5 cm.</li>
<li>Amplitude is signal strength; phase explains how multipath copies can cancel.</li>
<li>Wi-Fi bands: 2.4 GHz (range, crowded), 5 GHz (channels, speed), 6 GHz (clean, Wi-Fi 6E/7 only).</li>
<li>Absorption, reflection, refraction, scattering and diffraction all change the signal; distance adds free-space path loss.</li>
<li>Higher frequency means more loss through obstacles, so 5 and 6 GHz cells are smaller.</li>
</ul></div>
`,hi:`
<p>Ek shaant talaab mein patthar daalo. Lehrein golon mein phailti hain, aur jitna door jaati hain utni kamzor hoti jaati hain. Agar aap ungli ko tezi se upar neeche karo, to lehrein paas paas aati hain; dheere karo to door door. Paani par tairta ek patta har lehar ke guzarne par upar neeche hota hai. Wi-Fi radio ungli hai, <b>radio frequency (RF)</b> wave lehar hai, aur receiving antenna patta hai. Is chapter mein sab kuch in lehron ko describe karne ka tarika hai.</p>

<h3>Frequency, period aur wavelength</h3>
<dl class="terms">
<dt>Frequency (f)</dt><dd>Wave ek second mein kitne poore cycles banati hai, <b>hertz (Hz)</b> mein naapte hain. 1 kHz = ek hazaar, 1 MHz = das lakh, 1 GHz = ek arab cycles per second. 2.4 GHz Wi-Fi signal har second 2.4 arab baar oscillate karta hai.</dd>
<dt>Period (T)</dt><dd>Ek cycle ka time: T = 1 / f. 2.4 GHz ke liye lagbhag 0.42 nanoseconds.</dd>
<dt>Wavelength (λ)</dt><dd>Ek cycle jitni physical doori cover karta hai. Radio light ki speed se chalta hai, c ≈ 300,000,000 m/s, isliye <b>λ = c / f</b>. Zyada frequency matlab chhoti wavelength.</dd>
<dt>Amplitude</dt><dd>Wave ki oonchai, woh kitni strong hai. Transmit power amplitude set karta hai; doori aur rukaavatein use chhota karti hain.</dd>
<dt>Phase</dt><dd>Kisi pal mein wave apne cycle mein kahan hai, degrees mein. Same signal ki do copies jo 180° out of phase pahunchti hain ek doosre ko cancel karti hain; yeh neeche multipath ke liye matter karta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Wavelength aur amplitude">
<line x1="20" y1="80" x2="320" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M20 80 Q57 10 95 80 T170 80 T245 80 T320 80" fill="none" stroke="#0284c7" stroke-width="2.5"/>
<line x1="20" y1="130" x2="170" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="20" y1="122" x2="20" y2="138" stroke="#64748b"/><line x1="170" y1="122" x2="170" y2="138" stroke="#64748b"/>
<text x="95" y="150" text-anchor="middle" class="svg-accent" font-size="12">1 wavelength (12.5 cm)</text>
<line x1="57" y1="80" x2="57" y2="45" stroke="#64748b" stroke-width="1.5"/><text x="64" y="40" class="svg-muted" font-size="12">amplitude</text>
<text x="170" y="178" text-anchor="middle" class="svg-ink" font-size="13">2.4 GHz</text>
<line x1="360" y1="80" x2="620" y2="80" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M360 80 Q378 10 396 80 T432 80 T468 80 T504 80 T540 80 T576 80 T612 80" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
<line x1="360" y1="130" x2="432" y2="130" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="122" x2="360" y2="138" stroke="#64748b"/><line x1="432" y1="122" x2="432" y2="138" stroke="#64748b"/>
<text x="400" y="150" text-anchor="middle" class="svg-accent" font-size="12">1 wavelength (6 cm)</text>
<text x="490" y="178" text-anchor="middle" class="svg-ink" font-size="13">5 GHz</text>
</svg><p class="cap">Same amplitude, alag frequency: 5 GHz wave 2.4 GHz wave ki lagbhag aadhi doori mein ek cycle poora karti hai.</p></div>

<div class="eg"><p><b>Worked example.</b> 2.4 GHz ke liye λ = 300,000,000 / 2,400,000,000 = 0.125 m = <b>12.5 cm</b>. 5 GHz (5,000,000,000 Hz) ke liye: 0.06 m = <b>6 cm</b>. 6 GHz ke liye: 0.05 m = <b>5 cm</b>. Antenna elements wavelength ke fractions mein size kiye jaate hain, isliye 5 aur 6 GHz antennas chhote hote hain.</p></div>

<h3>Teen Wi-Fi bands</h3>
<table class="cmp"><tr><th>Band</th><th>Range</th><th>Taakat</th><th>Kamzori</th></tr>
<tr><td>2.4 GHz (ISM)</td><td>2.400 se 2.4835 GHz</td><td>Sabse zyada range, deewaron ke paar sabse achha, har device support karta hai</td><td>Sirf 3 non-overlapping channels, Bluetooth, microwave ovens, cordless devices se bheed</td></tr>
<tr><td>5 GHz (U-NII)</td><td>lagbhag 5.150 se 5.850 GHz</td><td>Kahin zyada channels, kam legacy noise, zyada speeds</td><td>Kam range, kuch channels par radar detection (DFS) chahiye</td></tr>
<tr><td>6 GHz</td><td>5.925 se 7.125 GHz (jahan allowed)</td><td>Bahut bada clean spectrum, sirf Wi-Fi 6E aur 7 devices, koi legacy clients nahi</td><td>Sabse kam range, naye clients chahiye, availability desh par depend karti hai</td></tr></table>
<p>Teeno <b>unlicensed</b> hain: koi bhi bina licence ke transmit kar sakta hai, bas power limits ka dhyaan rakhe. Isi aazaadi ki wajah se Wi-Fi har jagah phail gaya, aur isi wajah se aapko padosiyon ke saath hawa share karni padti hai.</p>

<h3>Signals real duniya se kaise milte hain</h3>
<p>Khaali space mein bhi signal doori ke saath kamzor hota hai kyunki energy ek badhte gole par phailti hai. Ise <b>free-space path loss</b> kehte hain. Buildings ke andar objects paanch aur effects jodte hain:</p>
<ul>
<li><b>Absorption</b>: material energy sokh leta hai aur use bahut thodi garmi mein badal deta hai. Paani, insaani shareer, concrete aur brick zor se absorb karte hain. Wave aage jaati hai, par kam amplitude ke saath.</li>
<li><b>Reflection</b>: wave apni wavelength se badi smooth surface se takra kar lautti hai, jaise aaine se roshni. Metal cabinets, lift ke darwaaze, coated glass aur whiteboards reflect karte hain.</li>
<li><b>Refraction</b>: wave ek medium se alag density wale doosre medium mein jaate waqt mudti hai, jaise paani ke glass mein straw tedha dikhta hai. Glass, aur lambe outdoor links par alag temperature wali hawa ki layers, refract karti hain.</li>
<li><b>Scattering</b>: khurdari ya asamaan surface (gravel, patte, dhool, chain-link fence) wave ko har disha mein kai kamzor reflections mein tod deti hai.</li>
<li><b>Diffraction</b>: wave kisi rukaavat ke kinaare ke aas paas mudti hai, aur uske theek peeche ek <b>RF shadow</b> chhodti hai.</li>
</ul>
<p>Reflections <b>multipath</b> banate hain: receiver ko same signal ki kai copies alag raaston se milti hain, thode alag time aur phase par. Jo copies out of phase pahunchti hain woh aanshik roop se cancel hoti hain, jisse deep fades aate hain. Purane 802.11a/b/g radios multipath se pareshaan the; 802.11n se, kai antennas wale <b>MIMO</b> radios multipath ka hi use karke alag spatial streams bhejte hain.</p>

<table class="cmp"><tr><th>Rukaavat</th><th>Typical loss (kaafi badalta hai)</th></tr>
<tr><td>Andar ki drywall ya lakdi ka darwaza</td><td>lagbhag 3 se 4 dB</td></tr>
<tr><td>Saada glass window</td><td>lagbhag 2 se 3 dB</td></tr>
<tr><td>Brick wall</td><td>lagbhag 6 se 10 dB</td></tr>
<tr><td>Concrete wall ya floor</td><td>10 se 20 dB ya zyada</td></tr>
<tr><td>Metal darwaza, lift shaft</td><td>bahut zyada, aksar signal rok deta hai</td></tr></table>

<h3>Yeh kyun zaroori hai</h3>
<p>Yahi effects tay karte hain ki APs kahan lagenge. AP ko metal ceiling box ke andar, pillar ke peeche ya paani ki tanki ke paas lagana use barbaad karta hai. 5 GHz coverage ko 2.4 GHz jaisi AP spacing se plan karna holes chhod deta hai. <b>Interference</b> ke sources (aapki frequency par koi bhi non-Wi-Fi transmitter) jaanna bhi ghante bachata hai: microwave ovens 2.45 GHz ke aas paas energy leak karte hain, aur Bluetooth, cordless phones aur wireless cameras 2.4 GHz share karte hain.</p>

<div class="warn"><p><b>Common galti.</b> APs ko "saaf dikhne ke liye" false ceiling ke upar ya metal enclosures ke andar lagana. Ceiling grid aur tiles signal ko room tak pahunchne se pehle hi absorb aur reflect kar dete hain. APs ceiling ke neeche lagao, antennas users ki taraf.</p></div>

<div class="exam"><p><b>Exam trap.</b> Reflection = smooth surface se takra kar lautna; refraction = alag medium se guzarte waqt mudna; scattering = khurdari surface se kai kamzor reflections; absorption = material ke andar energy ka nuksaan. Yeh bhi yaad rakho: zyada frequency, chhoti wavelength, rukaavaton se zyada loss.</p></div>

<div class="scn"><h4>Survey badhiya, Monday bura</h4><p>Ek training centre ne apne naye floor ka survey Sunday ko kiya: har seat par lagbhag −60 dBm ka 5 GHz signal tha. Monday ko, room mein 120 students aur unke bags aur paani ki bottles ke saath, peeche ki rows −74 dBm par gir gayi aur video lessons buffer hone lage. Engineer ne class ke dauraan measurement dobara kiya aur insaani shareeron se lagbhag 10 dB ka extra loss dekha. Side walls par do extra APs ne ise theek kiya.</p><p><b>Seekh:</b> insaan zyada tar paani hain aur RF absorb karte hain; hamesha margin plan karo aur coverage ko real operating conditions mein validate karo.</p></div>

<div class="iv"><p class="q">"5 GHz ki range 2.4 GHz se kam kyun hai?"</p><p>Strong answer: zyada frequency matlab chhoti wavelength, isliye deewarein aur log use zyada absorb karte hain, aur same gain ke antennas ke saath received power kam hoti hai: same doori par 5 GHz ka free-space loss 2.4 GHz se lagbhag 6 dB zyada hai. Jodo ki capacity ke liye phir bhi 5 GHz pasand kiya jaata hai kyunki isme kahin zyada non-overlapping channels aur kam interference hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Frequency Hz mein, wavelength λ = c / f: 2.4 GHz ≈ 12.5 cm, 5 GHz ≈ 6 cm, 6 GHz ≈ 5 cm.</li>
<li>Amplitude signal strength hai; phase batata hai ki multipath copies kaise cancel ho sakti hain.</li>
<li>Wi-Fi bands: 2.4 GHz (range, bheed), 5 GHz (channels, speed), 6 GHz (clean, sirf Wi-Fi 6E/7).</li>
<li>Absorption, reflection, refraction, scattering aur diffraction sab signal badalte hain; doori free-space path loss jodti hai.</li>
<li>Zyada frequency matlab rukaavaton se zyada loss, isliye 5 aur 6 GHz cells chhote hote hain.</li>
</ul></div>
`}};export{e as default};