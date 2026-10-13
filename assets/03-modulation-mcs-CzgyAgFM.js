var e={id:`modulation-mcs`,h:{en:`Modulation, QAM and MCS: why SNR sets your speed`,hi:`Modulation, QAM aur MCS: SNR hi speed kyun tay karta hai`},body:{en:`
<p>Why does a phone show 866 Mbps next to the AP and 54 Mbps in the corridor? The answer is <b>modulation</b>: the radio picks the densest way to pack bits that the current signal quality can still carry.</p>

<h3>Analogy: speaking clearly or quickly</h3>
<p>In a quiet room you can speak fast and use a large vocabulary. In a noisy market you speak slowly and use simple words so the listener does not misunderstand. A radio does exactly this. Good signal-to-noise ratio (SNR) lets it use a dense modulation; poor SNR forces a simple, robust one.</p>

<h3>From bits to waves</h3>
<p>A radio changes the <b>phase</b> and <b>amplitude</b> of a carrier wave to represent bits. Each distinct combination is a <b>constellation point</b>, and each transmitted point is a <b>symbol</b>. More points per symbol means more bits per symbol, but the points sit closer together, so noise can push one onto its neighbour.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Constellations">
<rect x="10" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="105" y="30" text-anchor="middle" class="svg-ink" font-size="13">BPSK: 1 bit</text>
<circle cx="65" cy="95" r="7" fill="#0ea5e9"/><circle cx="145" cy="95" r="7" fill="#0ea5e9"/>
<rect x="225" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">QPSK: 2 bits</text>
<circle cx="285" cy="70" r="7" fill="#0ea5e9"/><circle cx="355" cy="70" r="7" fill="#0ea5e9"/><circle cx="285" cy="125" r="7" fill="#0ea5e9"/><circle cx="355" cy="125" r="7" fill="#0ea5e9"/>
<rect x="440" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="535" y="30" text-anchor="middle" class="svg-ink" font-size="13">16-QAM: 4 bits</text>
<g fill="#0ea5e9"><circle cx="490" cy="60" r="5"/><circle cx="520" cy="60" r="5"/><circle cx="550" cy="60" r="5"/><circle cx="580" cy="60" r="5"/><circle cx="490" cy="85" r="5"/><circle cx="520" cy="85" r="5"/><circle cx="550" cy="85" r="5"/><circle cx="580" cy="85" r="5"/><circle cx="490" cy="110" r="5"/><circle cx="520" cy="110" r="5"/><circle cx="550" cy="110" r="5"/><circle cx="580" cy="110" r="5"/><circle cx="490" cy="135" r="5"/><circle cx="520" cy="135" r="5"/><circle cx="550" cy="135" r="5"/><circle cx="580" cy="135" r="5"/></g>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">64-QAM = 6 bits, 256-QAM = 8, 1024-QAM = 10, 4096-QAM = 12 bits per symbol</text>
</svg><p class="cap">Denser constellations carry more bits but need a cleaner signal. QAM means quadrature amplitude modulation.</p></div>

<table class="cmp"><tr><th>Modulation</th><th>Bits per symbol</th><th>Introduced</th></tr>
<tr><td>BPSK</td><td>1</td><td>802.11a/g lowest rate</td></tr><tr><td>QPSK</td><td>2</td><td>802.11a/g</td></tr>
<tr><td>16-QAM</td><td>4</td><td>802.11a/g</td></tr><tr><td>64-QAM</td><td>6</td><td>802.11a/g, n</td></tr>
<tr><td>256-QAM</td><td>8</td><td>802.11ac (Wi-Fi 5)</td></tr><tr><td>1024-QAM</td><td>10</td><td>802.11ax (Wi-Fi 6)</td></tr>
<tr><td>4096-QAM</td><td>12</td><td>802.11be (Wi-Fi 7)</td></tr></table>

<h3>Coding rate and the MCS index</h3>
<p>Some transmitted bits are redundant error-correction bits. The <b>coding rate</b> says what fraction is real data: 1/2 means half the bits are protection, 5/6 means only one in six is. A <b>Modulation and Coding Scheme (MCS)</b> number bundles a modulation and a coding rate. A higher MCS is faster and needs better SNR.</p>
<table class="cmp"><tr><th>MCS</th><th>Modulation</th><th>Coding</th><th>Rough SNR needed</th><th>Standard that has it</th></tr>
<tr><td>0</td><td>BPSK</td><td>1/2</td><td>about 5 dB</td><td>all</td></tr>
<tr><td>2</td><td>QPSK</td><td>3/4</td><td>about 10 dB</td><td>all</td></tr>
<tr><td>4</td><td>16-QAM</td><td>3/4</td><td>about 17 dB</td><td>all</td></tr>
<tr><td>7</td><td>64-QAM</td><td>5/6</td><td>about 25 dB</td><td>n, ac, ax, be</td></tr>
<tr><td>9</td><td>256-QAM</td><td>5/6</td><td>about 30 dB</td><td>ac, ax, be</td></tr>
<tr><td>11</td><td>1024-QAM</td><td>5/6</td><td>about 35 dB</td><td>ax, be</td></tr>
<tr><td>13</td><td>4096-QAM</td><td>5/6</td><td>about 40 dB</td><td>be</td></tr></table>
<p>SNR figures are typical planning values; each chipset differs. Note that in 802.11n the MCS number also encodes streams (MCS 0 to 7 = one stream, 8 to 15 = two streams), while 802.11ac and later keep MCS and streams separate, which is why <code>wifi link</code> prints "VHT-MCS 9 80MHz VHT-NSS 2" or "HE-MCS 11 HE-NSS 2".</p>

<h3>Computing a data rate</h3>
<p>Rate = data subcarriers x bits per symbol x coding rate x streams / symbol time. A 20 MHz 802.11ax channel has 234 data subcarriers and a symbol time of 13.6 microseconds (12.8 plus a 0.8 microsecond guard interval). Wi-Fi 6 symbols are four times longer than Wi-Fi 5 symbols, which makes them more robust against echoes outdoors.</p>
<div class="eg"><p><b>Worked example.</b> Wi-Fi 6, 20 MHz, MCS 11, 1 stream: 234 x 10 x 5/6 / 13.6 = 143 Mbps. Two streams: 287 Mbps. At 40 MHz (468 subcarriers): 287 Mbps per stream, 573 with two. At 80 MHz (980): 600 per stream, 1201 with two. Width and streams multiply the same MCS, but widening raises the noise power by 3 dB per doubling, so you need about 3 dB more RSSI.</p></div>

<h3>Why SNR, not RSSI alone, decides</h3>
<p>The AP picks the MCS (rate adaptation) from the error rate it sees. Roughly: SNR 30 dB or more allows MCS 9 to 11 on a good client; SNR 20 allows MCS 5 to 6; SNR 10 allows MCS 2; below about 5 dB the link drops. Noise floor is usually about -95 dBm, so RSSI -65 dBm gives 30 dB SNR, but the same RSSI with a noisy neighbour at -80 dBm floor gives only 15 dB.</p>
<pre class="out">LAPTOP1&gt; wifi link
Connected to 0011.2233.4401 (on wlan0)
        SSID: NK-STAFF
        freq: 5180
        signal: -58 dBm
<span class="hl">        rx bitrate: 573.5 MBit/s 40MHz HE-MCS 11 HE-NSS 2 HE-GI 0 HE-DCM 0</span>
        protocol: Wi-Fi 6, 5 GHz, 40 MHz, 2 spatial streams</pre>
<p>Read that line left to right: HE means Wi-Fi 6, MCS 11 means 1024-QAM with 5/6 coding, NSS 2 means two streams, 40 MHz is the width. This is the same arithmetic as the example above (sample output; your lab numbers depend on distance).</p>

<div class="warn"><p><b>Common mistake.</b> Believing the highest MCS is always best. A higher MCS that fails and retransmits is slower than a lower MCS that succeeds. Rate adaptation chooses the best working rate, you do not.</p></div>
<div class="exam"><p><b>Exam trap.</b> Doubling channel width doubles the data subcarriers, but costs 3 dB of SNR. Doubling the transmit power gives +3 dB. The two effects are symmetric, which is why high-density designs often use narrower channels.</p></div>

<div class="scn"><h4>Same RSSI, different speed</h4><p>Two identical laptops at -62 dBm: one got 520 Mbps, the other 130 Mbps. The slow one was beside a microwave kitchen and a neighbour's AP on the same channel. RSSI was equal; the noise floor on that side was -78 dBm, so the SNR was 16 dB instead of 33 dB, and the AP dropped it to MCS 4.</p><p><b>Lesson:</b> check SNR and retry rates, not RSSI alone.</p></div>

<div class="iv"><p class="q">"What is MCS, and what happens to it as a client walks away from the AP?"</p><p>Strong answer: MCS is the index of a modulation and coding rate pair. As the client moves away, RSSI falls toward the noise floor, SNR falls, errors rise, and the AP and client lower the MCS (for example from 256-QAM 5/6 to 16-QAM 3/4, then QPSK, then BPSK) until the link is stable. Mention that streams and channel width also matter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>More bits per symbol (QAM) means a higher rate but needs a higher SNR.</li>
<li>Bits per symbol: 64-QAM 6, 256-QAM 8, 1024-QAM 10, 4096-QAM 12.</li>
<li>MCS = modulation + coding rate; higher MCS needs better SNR.</li>
<li>Rate = subcarriers x bits x coding x streams / symbol time; Wi-Fi 6 symbols are 12.8 plus guard interval.</li>
<li>Wider channels add noise: about 3 dB more RSSI needed per width doubling.</li>
</ul></div>
`,hi:`
<p>Phone AP ke bagal mein 866 Mbps aur corridor mein 54 Mbps kyun dikhata hai? Jawab hai <b>modulation</b>: radio bits ko pack karne ka sabse dense tareeka chunta hai jise maujooda signal quality abhi bhi carry kar sake.</p>

<h3>Analogy: saaf bolna ya tez bolna</h3>
<p>Shaant room mein aap tez bol sakte ho aur bada vocabulary use kar sakte ho. Shor wale bazaar mein aap dheere bolte ho aur saade shabd use karte ho taaki sunne wala galat na samjhe. Radio bilkul yahi karta hai. Achha signal-to-noise ratio (SNR) use dense modulation use karne deta hai; kharab SNR use simple, robust modulation par majboor karta hai.</p>

<h3>Bits se waves tak</h3>
<p>Radio carrier wave ki <b>phase</b> aur <b>amplitude</b> badal kar bits represent karta hai. Har alag combination ek <b>constellation point</b> hai, aur har bheja gaya point ek <b>symbol</b> hai. Ek symbol mein zyada points matlab zyada bits per symbol, lekin points paas paas baithte hain, isliye noise ek point ko uske padosi par dhakel sakta hai.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Constellations">
<rect x="10" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="105" y="30" text-anchor="middle" class="svg-ink" font-size="13">BPSK: 1 bit</text>
<circle cx="65" cy="95" r="7" fill="#0ea5e9"/><circle cx="145" cy="95" r="7" fill="#0ea5e9"/>
<rect x="225" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">QPSK: 2 bits</text>
<circle cx="285" cy="70" r="7" fill="#0ea5e9"/><circle cx="355" cy="70" r="7" fill="#0ea5e9"/><circle cx="285" cy="125" r="7" fill="#0ea5e9"/><circle cx="355" cy="125" r="7" fill="#0ea5e9"/>
<rect x="440" y="10" width="190" height="150" rx="8" fill="#e2e8f0"/><text x="535" y="30" text-anchor="middle" class="svg-ink" font-size="13">16-QAM: 4 bits</text>
<g fill="#0ea5e9"><circle cx="490" cy="60" r="5"/><circle cx="520" cy="60" r="5"/><circle cx="550" cy="60" r="5"/><circle cx="580" cy="60" r="5"/><circle cx="490" cy="85" r="5"/><circle cx="520" cy="85" r="5"/><circle cx="550" cy="85" r="5"/><circle cx="580" cy="85" r="5"/><circle cx="490" cy="110" r="5"/><circle cx="520" cy="110" r="5"/><circle cx="550" cy="110" r="5"/><circle cx="580" cy="110" r="5"/><circle cx="490" cy="135" r="5"/><circle cx="520" cy="135" r="5"/><circle cx="550" cy="135" r="5"/><circle cx="580" cy="135" r="5"/></g>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">64-QAM = 6 bits, 256-QAM = 8, 1024-QAM = 10, 4096-QAM = 12 bits per symbol</text>
</svg><p class="cap">Dense constellations zyada bits carry karte hain lekin saaf signal maangte hain. QAM matlab quadrature amplitude modulation.</p></div>

<table class="cmp"><tr><th>Modulation</th><th>Bits per symbol</th><th>Kab aaya</th></tr>
<tr><td>BPSK</td><td>1</td><td>802.11a/g lowest rate</td></tr><tr><td>QPSK</td><td>2</td><td>802.11a/g</td></tr>
<tr><td>16-QAM</td><td>4</td><td>802.11a/g</td></tr><tr><td>64-QAM</td><td>6</td><td>802.11a/g, n</td></tr>
<tr><td>256-QAM</td><td>8</td><td>802.11ac (Wi-Fi 5)</td></tr><tr><td>1024-QAM</td><td>10</td><td>802.11ax (Wi-Fi 6)</td></tr>
<tr><td>4096-QAM</td><td>12</td><td>802.11be (Wi-Fi 7)</td></tr></table>

<h3>Coding rate aur MCS index</h3>
<p>Bheje gaye kuch bits redundant error-correction bits hote hain. <b>Coding rate</b> batata hai ki kitna hissa asli data hai: 1/2 matlab aadhe bits protection hain, 5/6 matlab chhe mein se sirf ek. <b>Modulation and Coding Scheme (MCS)</b> number ek modulation aur coding rate ko bundle karta hai. Higher MCS tez hota hai aur better SNR maangta hai.</p>
<table class="cmp"><tr><th>MCS</th><th>Modulation</th><th>Coding</th><th>Roughly SNR chahiye</th><th>Kis standard mein</th></tr>
<tr><td>0</td><td>BPSK</td><td>1/2</td><td>lagbhag 5 dB</td><td>sab</td></tr>
<tr><td>2</td><td>QPSK</td><td>3/4</td><td>lagbhag 10 dB</td><td>sab</td></tr>
<tr><td>4</td><td>16-QAM</td><td>3/4</td><td>lagbhag 17 dB</td><td>sab</td></tr>
<tr><td>7</td><td>64-QAM</td><td>5/6</td><td>lagbhag 25 dB</td><td>n, ac, ax, be</td></tr>
<tr><td>9</td><td>256-QAM</td><td>5/6</td><td>lagbhag 30 dB</td><td>ac, ax, be</td></tr>
<tr><td>11</td><td>1024-QAM</td><td>5/6</td><td>lagbhag 35 dB</td><td>ax, be</td></tr>
<tr><td>13</td><td>4096-QAM</td><td>5/6</td><td>lagbhag 40 dB</td><td>be</td></tr></table>
<p>SNR figures typical planning values hain; har chipset alag hota hai. Dhyan do ki 802.11n mein MCS number streams bhi encode karta hai (MCS 0 se 7 = ek stream, 8 se 15 = do streams), jabki 802.11ac aur baad ke MCS aur streams ko alag rakhte hain, isliye <code>wifi link</code> "VHT-MCS 9 80MHz VHT-NSS 2" ya "HE-MCS 11 HE-NSS 2" print karta hai.</p>

<h3>Data rate compute karna</h3>
<p>Rate = data subcarriers x bits per symbol x coding rate x streams / symbol time. 20 MHz 802.11ax channel mein 234 data subcarriers hote hain aur symbol time 13.6 microseconds (12.8 plus 0.8 microsecond guard interval). Wi-Fi 6 symbols Wi-Fi 5 symbols se chaar guna lambe hain, jo outdoors echoes ke khilaf unhe zyada robust banata hai.</p>
<div class="eg"><p><b>Worked example.</b> Wi-Fi 6, 20 MHz, MCS 11, 1 stream: 234 x 10 x 5/6 / 13.6 = 143 Mbps. Do streams: 287 Mbps. 40 MHz (468 subcarriers) par: ek stream 287 Mbps, do ke saath 573. 80 MHz (980) par: ek stream 600, do ke saath 1201. Width aur streams same MCS ko multiply karte hain, lekin width double karne se noise power 3 dB badhti hai, isliye lagbhag 3 dB zyada RSSI chahiye.</p></div>

<h3>Sirf RSSI nahi, SNR kyun tay karta hai</h3>
<p>AP jo error rate dekhta hai usse MCS chunta hai (rate adaptation). Roughly: SNR 30 dB ya zyada achhe client par MCS 9 se 11 allow karta hai; SNR 20 MCS 5 se 6; SNR 10 MCS 2; lagbhag 5 dB se neeche link gir jaata hai. Noise floor aam taur par lagbhag -95 dBm hota hai, isliye RSSI -65 dBm 30 dB SNR deta hai, lekin wahi RSSI noisy padosi ke saath -80 dBm floor par sirf 15 dB deta hai.</p>
<pre class="out">LAPTOP1&gt; wifi link
Connected to 0011.2233.4401 (on wlan0)
        SSID: NK-STAFF
        freq: 5180
        signal: -58 dBm
<span class="hl">        rx bitrate: 573.5 MBit/s 40MHz HE-MCS 11 HE-NSS 2 HE-GI 0 HE-DCM 0</span>
        protocol: Wi-Fi 6, 5 GHz, 40 MHz, 2 spatial streams</pre>
<p>Is line ko left se right padho: HE matlab Wi-Fi 6, MCS 11 matlab 1024-QAM 5/6 coding ke saath, NSS 2 matlab do streams, 40 MHz width hai. Yeh upar ke example ka hi arithmetic hai (sample output; aapke lab ke numbers doori par depend karte hain).</p>

<div class="warn"><p><b>Common galti.</b> Yeh maanna ki sabse high MCS hamesha best hai. Higher MCS jo fail ho kar retransmit kare, lower MCS se slow hota hai jo succeed karta hai. Rate adaptation best working rate chunta hai, aap nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Channel width double karne se data subcarriers double hote hain, lekin 3 dB SNR ka kharcha hota hai. Transmit power double karne se +3 dB milta hai. Dono effects symmetric hain, isliye high-density designs aksar narrow channels use karte hain.</p></div>

<div class="scn"><h4>Same RSSI, alag speed</h4><p>-62 dBm par do identical laptops: ek ko 520 Mbps mila, dusre ko 130 Mbps. Slow wala microwave kitchen aur padosi ke same channel wale AP ke bagal mein tha. RSSI barabar tha; us taraf noise floor -78 dBm tha, isliye SNR 33 dB ki jagah 16 dB tha, aur AP ne use MCS 4 par gira diya.</p><p><b>Seekh:</b> sirf RSSI nahi, SNR aur retry rates check karo.</p></div>

<div class="iv"><p class="q">"MCS kya hai, aur client AP se door jaata hai to us par kya hota hai?"</p><p>Strong answer: MCS modulation aur coding rate ki jodi ka index hai. Client door jaata hai to RSSI noise floor ki taraf girta hai, SNR girta hai, errors badhte hain, aur AP aur client MCS kam karte hain (jaise 256-QAM 5/6 se 16-QAM 3/4, phir QPSK, phir BPSK) jab tak link stable na ho. Batao ki streams aur channel width bhi matter karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyada bits per symbol (QAM) matlab higher rate lekin higher SNR chahiye.</li>
<li>Bits per symbol: 64-QAM 6, 256-QAM 8, 1024-QAM 10, 4096-QAM 12.</li>
<li>MCS = modulation + coding rate; higher MCS ko better SNR chahiye.</li>
<li>Rate = subcarriers x bits x coding x streams / symbol time; Wi-Fi 6 symbols 12.8 plus guard interval hain.</li>
<li>Wider channels noise badhate hain: har width doubling par lagbhag 3 dB zyada RSSI chahiye.</li>
</ul></div>
`}};export{e as default};