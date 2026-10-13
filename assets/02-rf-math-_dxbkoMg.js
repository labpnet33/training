var e={id:`rf-math`,h:{en:`RF power maths: dBm, RSSI, noise floor, SNR and the link budget`,hi:`RF power maths: dBm, RSSI, noise floor, SNR aur link budget`},body:{en:`
<p>In CCNA you learned that +3 dB doubles power and that −55 dBm is a good signal. At CCNP level you must calculate: convert milliwatts to dBm, add gains and losses along a path, and decide from RSSI and SNR whether an application will work. This chapter gives you the tools; the next adds antennas and EIRP.</p>

<h3>An analogy: shouting across a hall</h3>
<p>You shout (transmit power) in a hall. Every metre, your voice gets weaker (path loss). Walls swallow some of it (absorption). The listener hears you at some loudness (RSSI), while other people chatter in the background (noise). Whether the listener understands you depends not on how loud you are, but on how much louder you are than the chatter. That difference is the <b>signal-to-noise ratio</b>.</p>

<h3>Why decibels?</h3>
<p>Radio power spans a huge range: an AP sends about 100 mW, while a client may receive 0.000001 mW (one nanowatt, −60 dBm). Writing those numbers is painful, and multiplying gains and losses is worse. The <b>decibel</b> is a logarithmic ratio: <code>dB = 10 × log10(P1 / P2)</code>. Logarithms turn multiplication into addition, so a whole radio path becomes simple plus and minus.</p>
<dl class="terms">
<dt>dB</dt><dd>A ratio between two powers (a gain or a loss). Has no absolute value.</dd>
<dt>dBm</dt><dd>Absolute power relative to 1 mW: <code>dBm = 10 × log10(mW)</code>. 0 dBm = 1 mW.</dd>
<dt>dBi</dt><dd>Antenna gain relative to a perfect isotropic radiator (chapter 3).</dd>
<dt>RSSI</dt><dd>Received Signal Strength Indicator: how strongly the receiver hears the transmitter, usually shown in dBm (for example −62 dBm). Closer to zero is stronger.</dd>
<dt>Noise floor</dt><dd>The background RF energy on the channel when nobody is transmitting, typically −90 to −95 dBm in a clean office.</dd>
<dt>SNR</dt><dd>Signal minus noise, in dB: RSSI (dBm) − noise floor (dBm).</dd>
</dl>

<h3>The rule of 3s and 10s</h3>
<p>You do not need a calculator in an interview. Two rules cover almost everything:</p>
<ul><li><b>+3 dB = double the power, −3 dB = half.</b></li>
<li><b>+10 dB = ten times the power, −10 dB = one tenth.</b></li></ul>
<table class="cmp"><tr><th>mW</th><th>dBm</th><th>How to get it</th></tr>
<tr><td>1</td><td>0</td><td>definition</td></tr>
<tr><td>2</td><td>3</td><td>double</td></tr>
<tr><td>4</td><td>6</td><td>double again</td></tr>
<tr><td>10</td><td>10</td><td>×10</td></tr>
<tr><td>50</td><td>17</td><td>100 mW halved = 20 − 3</td></tr>
<tr><td>100</td><td>20</td><td>×10 twice</td></tr>
<tr><td>200</td><td>23</td><td>100 doubled</td></tr>
<tr><td>1000 (1 W)</td><td>30</td><td>×10 three times</td></tr>
<tr><td>0.1</td><td>−10</td><td>÷10</td></tr>
<tr><td>0.000001 (1 nW)</td><td>−60</td><td>÷10 six times</td></tr></table>
<p>Any number can be built from steps of 3 and 10. 40 mW? 10 mW (10 dBm) × 2 × 2 = 16 dBm. 25 dBm? Start at 30 dBm (1000 mW) and subtract 3 dB twice: 24 dBm ≈ 250 mW. One more dB is about ×1.26, so 25 dBm ≈ 316 mW.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Link budget from transmitter to receiver">
<rect x="10" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="92" text-anchor="middle" class="svg-ink" font-size="13">AP radio</text><text x="60" y="110" text-anchor="middle" class="svg-ink" font-size="13">+17 dBm</text>
<rect x="130" y="70" width="90" height="50" rx="8" fill="#fed7aa"/><text x="175" y="92" text-anchor="middle" class="svg-ink" font-size="13">cable</text><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">−2 dB</text>
<rect x="240" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="13">antenna</text><text x="285" y="110" text-anchor="middle" class="svg-ink" font-size="13">+4 dBi</text>
<rect x="350" y="70" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="420" y="92" text-anchor="middle" class="svg-ink" font-size="13">air + 1 wall</text><text x="420" y="110" text-anchor="middle" class="svg-ink" font-size="13">−75 dB</text>
<rect x="510" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="92" text-anchor="middle" class="svg-ink" font-size="13">laptop hears</text><text x="570" y="110" text-anchor="middle" class="svg-ink" font-size="13">−56 dBm</text>
<line x1="110" y1="95" x2="130" y2="95" stroke="#64748b"/><line x1="220" y1="95" x2="240" y2="95" stroke="#64748b"/><line x1="330" y1="95" x2="350" y2="95" stroke="#64748b"/><line x1="490" y1="95" x2="510" y2="95" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">17 − 2 + 4 − 75 = −56 dBm (plus the client antenna gain, if any)</text>
</svg><p class="cap">A link budget is just addition: every gain is plus, every loss is minus.</p></div>

<h3>Path loss and what eats the signal</h3>
<p><b>Free-space path loss</b> (FSPL) grows with distance and frequency. Two handy facts: <b>doubling the distance costs about 6 dB</b> (the inverse-square law), and at the same distance 5 GHz loses roughly 6 to 7 dB more than 2.4 GHz with the same antennas, which is one reason 5 GHz cells are smaller. On top of FSPL come the physical effects you met in CCNA: <b>absorption</b> (drywall 3–4 dB, brick or concrete 10–15 dB or more, people and water), <b>reflection</b> (metal, glass with coating), <b>scattering</b>, <b>refraction</b> and <b>diffraction</b>. Reflections also cause <b>multipath</b>: copies of the signal arrive at slightly different times. Old 802.11a/b/g suffered from it; 802.11n and later use MIMO to turn multipath into extra spatial streams.</p>

<h3>RSSI and SNR targets</h3>
<p>Signal alone is not enough. A −65 dBm signal is excellent over a −95 dBm noise floor (SNR 30 dB) but poor next to a microwave oven that lifts the floor to −75 dBm (SNR 10 dB). Higher data rates use denser modulation (more bits per symbol, chapter 5), and dense modulation needs a high SNR. Design targets commonly used for Cisco enterprise designs:</p>
<table class="cmp"><tr><th>Use</th><th>Minimum RSSI</th><th>Minimum SNR</th></tr>
<tr><td>Voice and real-time video</td><td>−67 dBm</td><td>25 dB</td></tr>
<tr><td>General data, high density</td><td>−67 to −70 dBm</td><td>20–25 dB</td></tr>
<tr><td>Basic data coverage</td><td>−70 to −72 dBm</td><td>15–20 dB</td></tr>
<tr><td>Location (RSSI-based)</td><td>heard by 3+ APs at −75 dBm or better</td><td>—</td></tr>
<tr><td>Barely usable</td><td>−80 dBm</td><td>below 10 dB</td></tr></table>
<p>Also check the <b>receiver sensitivity</b> on the datasheet: the weakest signal at which a radio can still decode a given data rate. A radio might decode MCS 0 at −92 dBm but need −65 dBm for its fastest rate. The difference between what you receive and what you need is your <b>fade margin</b>; leave 10 dB or more for doors, people and rain on outdoor links.</p>

<div class="eg"><p><b>Worked example.</b> AP transmit 14 dBm, cable loss 1 dB, AP antenna 4 dBi. Path: free-space loss over 20 m at 5 GHz is about 73 dB, plus one drywall (4 dB) = 77 dB. RSSI = 14 − 1 + 4 − 77 = <b>−60 dBm</b>. Noise floor −92 dBm, so SNR = −60 − (−92) = <b>32 dB</b>. Good for voice and for high MCS rates. Now a steel shelf adds 15 dB: RSSI −75 dBm, SNR 17 dB: well below the voice target. Move the AP or add one.</p></div>

<h3>Asymmetric links: the client's power matters</h3>
<p>An AP can transmit at 20 dBm; a phone often transmits at only 10–15 dBm. If you turn the AP up to maximum, the phone hears the AP well but the AP barely hears the phone. The client sees "full bars" and still suffers retries on the uplink. Designers match AP power to typical client power and add APs instead of shouting louder. Controllers' transmit power control (TPC, chapter 4) does the same automatically.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding dBm to dBm. You add dB (gains and losses) to one dBm value; two transmitters of 20 dBm each together make 23 dBm, not 40. (2) Reading −80 dBm as "higher" than −70 dBm. It is ten times weaker. (3) Judging a link by RSSI alone and ignoring the noise floor.</p></div>

<div class="exam"><p><b>Exam traps.</b> "A signal drops from −50 dBm to −56 dBm. By what factor did the power fall?" 6 dB = half of a half = one quarter. "An AP at 100 mW is reduced to 25 mW. How many dB?" −6 dB. "RSSI −70 dBm, noise −90 dBm, SNR?" 20 dB. Expect the rule of 3s and 10s, not logarithm tables.</p></div>

<div class="scn"><h4>Full bars, terrible calls</h4><p>A warehouse installed APs at maximum power (20 dBm) on high racks. Scanners showed full signal, yet voice calls from the scanners were choppy. The engineer looked at the controller's client details: downlink RSSI −55 dBm, but the AP's received signal from the scanner was −79 dBm with many retries, because the scanner transmits at 12 dBm. Lowering AP power to 11–14 dBm with RRM, adding three APs lower on the aisles, and re-checking both directions brought uplink RSSI to −64 dBm and the calls cleared.</p><p><b>Lesson:</b> a radio link has two directions. Design for the weakest transmitter, which is almost always the client.</p></div>

<div class="iv"><p class="q">"Convert 50 mW to dBm and explain SNR."</p><p>Strong answer: 100 mW is 20 dBm; half of it is 3 dB less, so 50 mW is 17 dBm. SNR is the received signal minus the noise floor in dB; for example −65 dBm over −92 dBm is 27 dB. Say why it matters: higher MCS rates need higher SNR, and voice designs aim for −67 dBm and 25 dB SNR. Mention that the uplink from a low-power client is usually the weak direction.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dBm is absolute (0 dBm = 1 mW); dB is a ratio you add or subtract.</li>
<li>+3 dB doubles, +10 dB multiplies by ten; 20 dBm = 100 mW, 30 dBm = 1 W.</li>
<li>Doubling distance costs about 6 dB; walls add 3–15 dB or more.</li>
<li>SNR = RSSI − noise floor; voice needs about −67 dBm and 25 dB SNR.</li>
<li>Balance AP power with client power; the uplink is usually the weak side.</li>
</ul></div>
`,hi:`
<p>CCNA mein aapne seekha ki +3 dB power double karta hai aur −55 dBm achha signal hai. CCNP level par aapko calculate karna hai: milliwatts ko dBm mein badlo, path par gains aur losses jodo, aur RSSI aur SNR se tay karo ki application chalegi ya nahi. Yeh chapter tools deta hai; agla antennas aur EIRP jodta hai.</p>

<h3>Ek analogy: hall ke paar chillana</h3>
<p>Aap ek hall mein chillate ho (transmit power). Har metre par aawaz kamzor hoti hai (path loss). Deewarein kuch hissa nigal leti hain (absorption). Sunne wala aapko kisi loudness par sunta hai (RSSI), jabki peeche log baatein kar rahe hain (noise). Sunne wala samjhega ya nahi, yeh is par depend nahi karta ki aap kitna tez ho, balki is par ki aap us shor se kitna zyada tez ho. Wahi farak <b>signal-to-noise ratio</b> hai.</p>

<h3>Decibels kyun?</h3>
<p>Radio power ki range bahut badi hai: AP lagbhag 100 mW bhejta hai, jabki client 0.000001 mW (ek nanowatt, −60 dBm) receive kar sakta hai. Aise numbers likhna mushkil hai, aur gains aur losses multiply karna aur bhi. <b>Decibel</b> ek logarithmic ratio hai: <code>dB = 10 × log10(P1 / P2)</code>. Logarithm multiplication ko addition bana dete hain, isliye poora radio path simple plus aur minus ban jaata hai.</p>
<dl class="terms">
<dt>dB</dt><dd>Do powers ke beech ka ratio (gain ya loss). Iski koi absolute value nahi.</dd>
<dt>dBm</dt><dd>1 mW ke relative absolute power: <code>dBm = 10 × log10(mW)</code>. 0 dBm = 1 mW.</dd>
<dt>dBi</dt><dd>Perfect isotropic radiator ke relative antenna gain (chapter 3).</dd>
<dt>RSSI</dt><dd>Received Signal Strength Indicator: receiver transmitter ko kitna tez sunta hai, aam taur par dBm mein (jaise −62 dBm). Zero ke jitna paas, utna strong.</dd>
<dt>Noise floor</dt><dd>Jab koi transmit nahi kar raha, tab channel par background RF energy, saaf office mein aam taur par −90 se −95 dBm.</dd>
<dt>SNR</dt><dd>Signal minus noise, dB mein: RSSI (dBm) − noise floor (dBm).</dd>
</dl>

<h3>3s aur 10s ka rule</h3>
<p>Interview mein calculator nahi chahiye. Do rules lagbhag sab cover karte hain:</p>
<ul><li><b>+3 dB = power double, −3 dB = aadha.</b></li>
<li><b>+10 dB = power das guna, −10 dB = dasvaan hissa.</b></li></ul>
<table class="cmp"><tr><th>mW</th><th>dBm</th><th>Kaise nikla</th></tr>
<tr><td>1</td><td>0</td><td>definition</td></tr>
<tr><td>2</td><td>3</td><td>double</td></tr>
<tr><td>4</td><td>6</td><td>phir double</td></tr>
<tr><td>10</td><td>10</td><td>×10</td></tr>
<tr><td>50</td><td>17</td><td>100 mW ka aadha = 20 − 3</td></tr>
<tr><td>100</td><td>20</td><td>do baar ×10</td></tr>
<tr><td>200</td><td>23</td><td>100 ka double</td></tr>
<tr><td>1000 (1 W)</td><td>30</td><td>teen baar ×10</td></tr>
<tr><td>0.1</td><td>−10</td><td>÷10</td></tr>
<tr><td>0.000001 (1 nW)</td><td>−60</td><td>chhe baar ÷10</td></tr></table>
<p>Koi bhi number 3 aur 10 ke steps se ban jaata hai. 40 mW? 10 mW (10 dBm) × 2 × 2 = 16 dBm. 25 dBm? 30 dBm (1000 mW) se shuru karo aur do baar 3 dB ghatao: 24 dBm ≈ 250 mW. Ek aur dB lagbhag ×1.26 hai, to 25 dBm ≈ 316 mW.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Transmitter se receiver tak link budget">
<rect x="10" y="70" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="92" text-anchor="middle" class="svg-ink" font-size="13">AP radio</text><text x="60" y="110" text-anchor="middle" class="svg-ink" font-size="13">+17 dBm</text>
<rect x="130" y="70" width="90" height="50" rx="8" fill="#fed7aa"/><text x="175" y="92" text-anchor="middle" class="svg-ink" font-size="13">cable</text><text x="175" y="110" text-anchor="middle" class="svg-ink" font-size="13">−2 dB</text>
<rect x="240" y="70" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="285" y="92" text-anchor="middle" class="svg-ink" font-size="13">antenna</text><text x="285" y="110" text-anchor="middle" class="svg-ink" font-size="13">+4 dBi</text>
<rect x="350" y="70" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="420" y="92" text-anchor="middle" class="svg-ink" font-size="13">hawa + 1 deewar</text><text x="420" y="110" text-anchor="middle" class="svg-ink" font-size="13">−75 dB</text>
<rect x="510" y="70" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="570" y="92" text-anchor="middle" class="svg-ink" font-size="13">laptop sunta hai</text><text x="570" y="110" text-anchor="middle" class="svg-ink" font-size="13">−56 dBm</text>
<line x1="110" y1="95" x2="130" y2="95" stroke="#64748b"/><line x1="220" y1="95" x2="240" y2="95" stroke="#64748b"/><line x1="330" y1="95" x2="350" y2="95" stroke="#64748b"/><line x1="490" y1="95" x2="510" y2="95" stroke="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="13">17 − 2 + 4 − 75 = −56 dBm (client antenna gain ho to woh bhi jodo)</text>
</svg><p class="cap">Link budget sirf addition hai: har gain plus, har loss minus.</p></div>

<h3>Path loss aur signal ko kya khaata hai</h3>
<p><b>Free-space path loss</b> (FSPL) doori aur frequency ke saath badhta hai. Do kaam ke facts: <b>doori double karne par lagbhag 6 dB jaata hai</b> (inverse-square law), aur same doori par same antennas ke saath 5 GHz, 2.4 GHz se lagbhag 6 se 7 dB zyada khota hai, yeh ek wajah hai ki 5 GHz cells chhote hote hain. FSPL ke upar CCNA wale physical effects aate hain: <b>absorption</b> (drywall 3–4 dB, brick ya concrete 10–15 dB ya zyada, log aur paani), <b>reflection</b> (metal, coating wala glass), <b>scattering</b>, <b>refraction</b> aur <b>diffraction</b>. Reflections se <b>multipath</b> bhi hota hai: signal ki copies thode alag time par pahunchti hain. Purane 802.11a/b/g isse pareshaan the; 802.11n aur baad wale MIMO se multipath ko extra spatial streams bana dete hain.</p>

<h3>RSSI aur SNR targets</h3>
<p>Sirf signal kaafi nahi. −65 dBm signal −95 dBm noise floor par (SNR 30 dB) excellent hai, lekin microwave oven ke paas jo floor ko −75 dBm tak utha de (SNR 10 dB) kharab hai. Zyada data rates ghani modulation use karte hain (har symbol mein zyada bits, chapter 5), aur ghani modulation ko high SNR chahiye. Cisco enterprise designs mein aam taur par use hone wale targets:</p>
<table class="cmp"><tr><th>Use</th><th>Minimum RSSI</th><th>Minimum SNR</th></tr>
<tr><td>Voice aur real-time video</td><td>−67 dBm</td><td>25 dB</td></tr>
<tr><td>General data, high density</td><td>−67 se −70 dBm</td><td>20–25 dB</td></tr>
<tr><td>Basic data coverage</td><td>−70 se −72 dBm</td><td>15–20 dB</td></tr>
<tr><td>Location (RSSI-based)</td><td>3+ APs se −75 dBm ya behtar sunai de</td><td>—</td></tr>
<tr><td>Mushkil se chalne layak</td><td>−80 dBm</td><td>10 dB se kam</td></tr></table>
<p>Datasheet par <b>receiver sensitivity</b> bhi dekho: sabse kamzor signal jis par radio ek diya hua data rate decode kar sake. Ek radio MCS 0 ko −92 dBm par decode kar sakta hai par sabse tez rate ke liye −65 dBm chahiye. Jo aap receive karte ho aur jo chahiye, uska farak aapka <b>fade margin</b> hai; darwaazon, logon aur outdoor links par baarish ke liye 10 dB ya zyada chhodo.</p>

<div class="eg"><p><b>Worked example.</b> AP transmit 14 dBm, cable loss 1 dB, AP antenna 4 dBi. Path: 5 GHz par 20 m ka free-space loss lagbhag 73 dB, plus ek drywall (4 dB) = 77 dB. RSSI = 14 − 1 + 4 − 77 = <b>−60 dBm</b>. Noise floor −92 dBm, to SNR = −60 − (−92) = <b>32 dB</b>. Voice aur high MCS rates ke liye achha. Ab ek steel shelf 15 dB jodti hai: RSSI −75 dBm, SNR 17 dB: voice target se kaafi neeche. AP hatao ya ek aur lagao.</p></div>

<h3>Asymmetric links: client ki power bhi matter karti hai</h3>
<p>AP 20 dBm par transmit kar sakta hai; phone aksar sirf 10–15 dBm par. Agar aap AP ko maximum par kar do, phone AP ko achhe se sunta hai par AP phone ko mushkil se. Client "full bars" dekhta hai phir bhi uplink par retries jhelta hai. Designers AP power ko typical client power se match karte hain aur zor se chillane ki jagah APs jodte hain. Controllers ka transmit power control (TPC, chapter 4) yahi automatically karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) dBm ko dBm mein jodna. Aap dB (gains aur losses) ek dBm value mein jodte ho; 20 dBm ke do transmitters milkar 23 dBm banate hain, 40 nahi. (2) −80 dBm ko −70 dBm se "zyada" samajhna. Woh das guna kamzor hai. (3) Noise floor ko ignore karke sirf RSSI se link judge karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Signal −50 dBm se −56 dBm gira. Power kitne guna giri?" 6 dB = aadhe ka aadha = ek chauthai. "100 mW wala AP 25 mW kiya gaya. Kitne dB?" −6 dB. "RSSI −70 dBm, noise −90 dBm, SNR?" 20 dB. Logarithm tables nahi, 3s aur 10s ka rule expect karo.</p></div>

<div class="scn"><h4>Full bars, bekaar calls</h4><p>Ek warehouse ne APs ko oonche racks par maximum power (20 dBm) par lagaya. Scanners full signal dikhate the, phir bhi scanners ki voice calls toot-toot kar aati thi. Engineer ne controller ki client details dekhi: downlink RSSI −55 dBm, lekin AP ko scanner ka signal −79 dBm par bahut retries ke saath mil raha tha, kyunki scanner 12 dBm par transmit karta hai. RRM se AP power 11–14 dBm karne, aisles mein neeche teen APs jodne aur dono directions dobara check karne se uplink RSSI −64 dBm ho gaya aur calls saaf ho gayi.</p><p><b>Lesson:</b> radio link ki do directions hoti hain. Sabse kamzor transmitter ke liye design karo, jo lagbhag hamesha client hota hai.</p></div>

<div class="iv"><p class="q">"50 mW ko dBm mein badlo aur SNR samjhao."</p><p>Strong answer: 100 mW 20 dBm hai; uska aadha 3 dB kam, to 50 mW 17 dBm hai. SNR received signal minus noise floor hai dB mein; jaise −92 dBm par −65 dBm = 27 dB. Batao kyun matter karta hai: high MCS rates ko zyada SNR chahiye, aur voice designs −67 dBm aur 25 dB SNR target karte hain. Batao ki low-power client se uplink aam taur par kamzor direction hoti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dBm absolute hai (0 dBm = 1 mW); dB ek ratio hai jo jodte ya ghatate ho.</li>
<li>+3 dB double karta hai, +10 dB das guna; 20 dBm = 100 mW, 30 dBm = 1 W.</li>
<li>Doori double karne par lagbhag 6 dB jaata hai; deewarein 3–15 dB ya zyada jodti hain.</li>
<li>SNR = RSSI − noise floor; voice ko lagbhag −67 dBm aur 25 dB SNR chahiye.</li>
<li>AP power ko client power se balance karo; uplink aam taur par kamzor side hai.</li>
</ul></div>
`}};export{e as default};