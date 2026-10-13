var e={id:`generations`,h:{en:`802.11 generations: b, g, a, n, ac, ax, be`,hi:`802.11 generations: b, g, a, n, ac, ax, be`},body:{en:`
<p>Every new 802.11 amendment attacks the same three limits: how many bits fit in one radio symbol, how wide the channel is, and how many parallel streams you can send. If you remember those three levers, the whole history becomes easy to recall.</p>

<h3>The timeline</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.11 timeline">
<line x1="20" y1="100" x2="620" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="50" cy="100" r="6" fill="#fed7aa"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="12">1999</text><text x="50" y="125" text-anchor="middle" class="svg-muted" font-size="12">b: 11M</text><text x="50" y="142" text-anchor="middle" class="svg-muted" font-size="12">a: 54M</text>
<circle cx="140" cy="100" r="6" fill="#fed7aa"/><text x="140" y="80" text-anchor="middle" class="svg-ink" font-size="12">2003</text><text x="140" y="125" text-anchor="middle" class="svg-muted" font-size="12">g: 54M</text>
<circle cx="240" cy="100" r="6" fill="#bbf7d0"/><text x="240" y="80" text-anchor="middle" class="svg-ink" font-size="12">2009</text><text x="240" y="125" text-anchor="middle" class="svg-muted" font-size="12">n (Wi-Fi 4)</text><text x="240" y="142" text-anchor="middle" class="svg-muted" font-size="12">600M</text>
<circle cx="350" cy="100" r="6" fill="#bae6fd"/><text x="350" y="80" text-anchor="middle" class="svg-ink" font-size="12">2013</text><text x="350" y="125" text-anchor="middle" class="svg-muted" font-size="12">ac (Wi-Fi 5)</text><text x="350" y="142" text-anchor="middle" class="svg-muted" font-size="12">6.9G</text>
<circle cx="470" cy="100" r="6" fill="#ddd6fe"/><text x="470" y="80" text-anchor="middle" class="svg-ink" font-size="12">2019-21</text><text x="470" y="125" text-anchor="middle" class="svg-muted" font-size="12">ax (Wi-Fi 6/6E)</text><text x="470" y="142" text-anchor="middle" class="svg-muted" font-size="12">9.6G</text>
<circle cx="585" cy="100" r="6" fill="#fde68a"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="12">2024</text><text x="585" y="125" text-anchor="middle" class="svg-muted" font-size="12">be (Wi-Fi 7)</text><text x="585" y="142" text-anchor="middle" class="svg-muted" font-size="12">46G</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Maximum theoretical PHY rates (all streams, widest channel)</text>
</svg><p class="cap">Theoretical maximums. Real clients with one or two streams reach a small fraction of these numbers.</p></div>

<h3>What each generation added</h3>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi name</th><th>Band</th><th>Key technology</th><th>Max width</th><th>Top modulation</th></tr>
<tr><td>802.11b</td><td>(none)</td><td>2.4</td><td>DSSS and CCK, 1/2/5.5/11 Mbps</td><td>22 MHz</td><td>CCK</td></tr>
<tr><td>802.11a</td><td>(none)</td><td>5</td><td>OFDM, up to 54 Mbps</td><td>20</td><td>64-QAM</td></tr>
<tr><td>802.11g</td><td>(none)</td><td>2.4</td><td>OFDM on 2.4 GHz, compatible with b</td><td>20</td><td>64-QAM</td></tr>
<tr><td>802.11n</td><td>Wi-Fi 4</td><td>2.4 and 5</td><td>MIMO (up to 4 streams), 40 MHz, frame aggregation</td><td>40</td><td>64-QAM</td></tr>
<tr><td>802.11ac</td><td>Wi-Fi 5</td><td>5 only</td><td>256-QAM, 80 and 160 MHz, downlink MU-MIMO (wave 2)</td><td>160</td><td>256-QAM</td></tr>
<tr><td>802.11ax</td><td>Wi-Fi 6, 6E</td><td>2.4, 5, 6 (6E)</td><td>OFDMA, uplink and downlink MU-MIMO, 1024-QAM, BSS colour, TWT</td><td>160</td><td>1024-QAM</td></tr>
<tr><td>802.11be</td><td>Wi-Fi 7</td><td>2.4, 5, 6</td><td>MLO, multi-RU, 4096-QAM, 320 MHz, preamble puncturing</td><td>320</td><td>4096-QAM</td></tr></table>

<h3>Step by step through the ideas</h3>
<p><b>DSSS and CCK (802.11b).</b> The first popular Wi-Fi spread each bit over a wide signal, which is robust but slow, 11 Mbps at best. Its legacy lives on: the lowest "basic" rates of 1, 2, 5.5 and 11 Mbps are still enabled by default on many networks, and they cost everyone airtime (chapter 9).</p>
<p><b>OFDM (802.11a, g and later).</b> Orthogonal Frequency Division Multiplexing splits a channel into many narrow subcarriers (52 in a 20 MHz 802.11a/g channel, 48 for data). Each subcarrier carries a slow stream, so echoes from walls hurt less. 802.11g brought OFDM to 2.4 GHz and kept b compatibility, which meant <b>protection mechanisms</b> when a b client is present.</p>
<p><b>MIMO (802.11n).</b> Multiple antennas send several independent <b>spatial streams</b> at the same time on the same frequency, which works because the signal takes different paths. 2x2 means two transmit and two receive antennas giving two streams. 802.11n also added 40 MHz channels and <b>aggregation</b> (many frames in one transmission, A-MPDU) to cut overhead. 802.11n is the first standard to work in both 2.4 and 5 GHz, so it is the first Wi-Fi 4 dual-band generation.</p>
<p><b>802.11ac (Wi-Fi 5).</b> 5 GHz only. 256-QAM (8 bits per symbol), 80 and 160 MHz channels and up to eight streams. <b>Wave 2</b> added downlink MU-MIMO: the AP sends to several clients at once. A dual-band 802.11ac device uses 802.11n on 2.4 GHz, because ac exists only in 5 GHz.</p>
<p><b>802.11ax (Wi-Fi 6).</b> Focus on <b>efficiency in crowds</b>: OFDMA, uplink MU-MIMO, 1024-QAM, BSS colouring, Target Wake Time. It runs in 2.4 and 5 GHz, and as Wi-Fi 6E also in 6 GHz. Chapter 5 explains each feature.</p>
<p><b>802.11be (Wi-Fi 7).</b> Peak rate and low latency: 320 MHz channels in 6 GHz, 4096-QAM, <b>Multi-Link Operation</b> (one client using two or three bands at once) and multi-RU (giving one client several scattered resource units). IEEE approved 802.11be in 2024; the Wi-Fi Alliance started Wi-Fi 7 certification in 2024. 802.11bn (Wi-Fi 8) is still in development.</p>

<div class="eg"><p><b>Worked example: where the numbers come from.</b> 802.11ac, 80 MHz, 1 stream, MCS 9: 234 data subcarriers x 8 bits (256-QAM) x 5/6 coding / 3.6 microseconds (symbol with short guard interval) = 433 Mbps. Two streams double it to 866 Mbps. A phone with one stream is often marketed as "433 Mbps"; a laptop with two streams as "867 Mbps". The AP's advertised "AX3000" or "5 Gbps" is the sum of all radios and streams, which no single client sees.</p></div>

<h3>Backward compatibility and why old clients matter</h3>
<p>Every new standard talks to older ones, but an old client is slower and uses more airtime for the same data. A 54 Mbps client needs six times the airtime of a 300 Mbps client to send the same file, and the whole cell waits for it. On 2.4 GHz, an 802.11b client forces everyone to use protection. This is why modern designs disable low rates and sometimes split old clients onto their own SSID, as in Lab 1.</p>

<div class="note"><p>The simulator names the client standard through the lab client capability: LAPTOP1 is Wi-Fi 6 (ax), 2 streams, up to 80 MHz, dual band; in Lab 4 it is an 802.11n device on 2.4 GHz only; SENSOR1 is a 2.4 GHz-only device. In <code>wifi link</code> you read the generation in the <b>protocol</b> line.</p></div>

<div class="warn"><p><b>Common mistake.</b> Saying 802.11ac works on 2.4 GHz. It does not. Marketing "dual-band AC" means the 2.4 GHz radio runs 802.11n (some vendors add proprietary 256-QAM on 2.4, which is not standard).</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.11a is 5 GHz, 802.11b and g are 2.4 GHz, 802.11n is both. Wi-Fi 6 is not 5 GHz only: it runs in 2.4 and 5 GHz, and Wi-Fi 6E adds 6 GHz.</p></div>

<div class="scn"><h4>The 54 Mbps laptop that slowed a floor</h4><p>A call centre complained of slow Wi-Fi on one floor. The wireless controller client list showed one old 802.11g device in a corner. Because 2.4 GHz had 802.11b rates enabled, every beacon was sent at 1 Mbps, and protection frames added overhead. The team disabled the four 802.11b rates, moved the legacy device to a dedicated 2.4 GHz SSID, and the floor recovered.</p><p><b>Lesson:</b> one slow, old client can take much of the shared airtime. Find it in the client list first.</p></div>

<div class="iv"><p class="q">"What did 802.11ac add over 802.11n?"</p><p>Strong answer: 5 GHz only, 256-QAM instead of 64-QAM, 80 and 160 MHz channels instead of 40, up to eight spatial streams, and downlink MU-MIMO in wave 2, plus explicit beamforming standardisation. Say that 802.11ax then focused on efficiency (OFDMA) rather than only raw speed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed grows by three levers: bits per symbol (QAM), channel width and spatial streams.</li>
<li>a is 5 GHz, b and g are 2.4 GHz, n is both, ac is 5 GHz only, ax and be cover all three bands.</li>
<li>OFDM replaced DSSS; MIMO arrived with n; MU-MIMO with ac wave 2; OFDMA with ax; MLO with be.</li>
<li>Old clients cost airtime for everyone, and 802.11b support brings protection overhead.</li>
<li>Advertised AP speeds are sums of radios; a client sees one link.</li>
</ul></div>
`,hi:`
<p>Har naya 802.11 amendment teen hi limits par hamla karta hai: ek radio symbol mein kitne bits aate hain, channel kitna chauda hai, aur kitni parallel streams bhej sakte ho. Agar yeh teen levers yaad rakho to poori history yaad karna aasaan ho jaata hai.</p>

<h3>Timeline</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.11 timeline">
<line x1="20" y1="100" x2="620" y2="100" stroke="#64748b" stroke-width="2"/>
<circle cx="50" cy="100" r="6" fill="#fed7aa"/><text x="50" y="80" text-anchor="middle" class="svg-ink" font-size="12">1999</text><text x="50" y="125" text-anchor="middle" class="svg-muted" font-size="12">b: 11M</text><text x="50" y="142" text-anchor="middle" class="svg-muted" font-size="12">a: 54M</text>
<circle cx="140" cy="100" r="6" fill="#fed7aa"/><text x="140" y="80" text-anchor="middle" class="svg-ink" font-size="12">2003</text><text x="140" y="125" text-anchor="middle" class="svg-muted" font-size="12">g: 54M</text>
<circle cx="240" cy="100" r="6" fill="#bbf7d0"/><text x="240" y="80" text-anchor="middle" class="svg-ink" font-size="12">2009</text><text x="240" y="125" text-anchor="middle" class="svg-muted" font-size="12">n (Wi-Fi 4)</text><text x="240" y="142" text-anchor="middle" class="svg-muted" font-size="12">600M</text>
<circle cx="350" cy="100" r="6" fill="#bae6fd"/><text x="350" y="80" text-anchor="middle" class="svg-ink" font-size="12">2013</text><text x="350" y="125" text-anchor="middle" class="svg-muted" font-size="12">ac (Wi-Fi 5)</text><text x="350" y="142" text-anchor="middle" class="svg-muted" font-size="12">6.9G</text>
<circle cx="470" cy="100" r="6" fill="#ddd6fe"/><text x="470" y="80" text-anchor="middle" class="svg-ink" font-size="12">2019-21</text><text x="470" y="125" text-anchor="middle" class="svg-muted" font-size="12">ax (Wi-Fi 6/6E)</text><text x="470" y="142" text-anchor="middle" class="svg-muted" font-size="12">9.6G</text>
<circle cx="585" cy="100" r="6" fill="#fde68a"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="12">2024</text><text x="585" y="125" text-anchor="middle" class="svg-muted" font-size="12">be (Wi-Fi 7)</text><text x="585" y="142" text-anchor="middle" class="svg-muted" font-size="12">46G</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Maximum theoretical PHY rates (saari streams, sabse wide channel)</text>
</svg><p class="cap">Theoretical maximums. Ek ya do stream wale real clients in numbers ka chhota sa hissa hi pahunchte hain.</p></div>

<h3>Har generation ne kya jodha</h3>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi name</th><th>Band</th><th>Key technology</th><th>Max width</th><th>Top modulation</th></tr>
<tr><td>802.11b</td><td>(none)</td><td>2.4</td><td>DSSS aur CCK, 1/2/5.5/11 Mbps</td><td>22 MHz</td><td>CCK</td></tr>
<tr><td>802.11a</td><td>(none)</td><td>5</td><td>OFDM, 54 Mbps tak</td><td>20</td><td>64-QAM</td></tr>
<tr><td>802.11g</td><td>(none)</td><td>2.4</td><td>2.4 GHz par OFDM, b ke saath compatible</td><td>20</td><td>64-QAM</td></tr>
<tr><td>802.11n</td><td>Wi-Fi 4</td><td>2.4 aur 5</td><td>MIMO (4 streams tak), 40 MHz, frame aggregation</td><td>40</td><td>64-QAM</td></tr>
<tr><td>802.11ac</td><td>Wi-Fi 5</td><td>sirf 5</td><td>256-QAM, 80 aur 160 MHz, downlink MU-MIMO (wave 2)</td><td>160</td><td>256-QAM</td></tr>
<tr><td>802.11ax</td><td>Wi-Fi 6, 6E</td><td>2.4, 5, 6 (6E)</td><td>OFDMA, uplink aur downlink MU-MIMO, 1024-QAM, BSS colour, TWT</td><td>160</td><td>1024-QAM</td></tr>
<tr><td>802.11be</td><td>Wi-Fi 7</td><td>2.4, 5, 6</td><td>MLO, multi-RU, 4096-QAM, 320 MHz, preamble puncturing</td><td>320</td><td>4096-QAM</td></tr></table>

<h3>Ideas step by step</h3>
<p><b>DSSS aur CCK (802.11b).</b> Pehle popular Wi-Fi ne har bit ko wide signal par failaya, jo robust hai lekin slow, zyada se zyada 11 Mbps. Iski legacy abhi bhi hai: 1, 2, 5.5 aur 11 Mbps ke lowest "basic" rates kai networks par abhi default enabled hain, aur sab ka airtime khate hain (chapter 9).</p>
<p><b>OFDM (802.11a, g aur baad ke).</b> Orthogonal Frequency Division Multiplexing ek channel ko bahut saare patle subcarriers mein baantta hai (20 MHz 802.11a/g channel mein 52, data ke liye 48). Har subcarrier dheemi stream carry karta hai, isliye deewaron se aane wali echoes kam nuksan karti hain. 802.11g OFDM ko 2.4 GHz par laya aur b compatibility rakhi, jiska matlab tha ki b client ho to <b>protection mechanisms</b> chalte hain.</p>
<p><b>MIMO (802.11n).</b> Multiple antennas ek hi frequency par ek saath kai independent <b>spatial streams</b> bhejte hain, jo isliye chalta hai ki signal alag alag raste leta hai. 2x2 matlab do transmit aur do receive antennas jo do streams dete hain. 802.11n ne 40 MHz channels aur <b>aggregation</b> (ek transmission mein kai frames, A-MPDU) bhi joda taaki overhead kam ho. 802.11n pehla standard hai jo 2.4 aur 5 GHz dono mein chalta hai.</p>
<p><b>802.11ac (Wi-Fi 5).</b> Sirf 5 GHz. 256-QAM (8 bits per symbol), 80 aur 160 MHz channels aur aath streams tak. <b>Wave 2</b> ne downlink MU-MIMO joda: AP ek saath kai clients ko bhejta hai. Dual-band 802.11ac device 2.4 GHz par 802.11n use karta hai, kyunki ac sirf 5 GHz mein hai.</p>
<p><b>802.11ax (Wi-Fi 6).</b> Focus <b>bheed mein efficiency</b> par: OFDMA, uplink MU-MIMO, 1024-QAM, BSS colouring, Target Wake Time. Yeh 2.4 aur 5 GHz mein chalta hai, aur Wi-Fi 6E ki tarah 6 GHz mein bhi. Chapter 5 har feature samjhata hai.</p>
<p><b>802.11be (Wi-Fi 7).</b> Peak rate aur low latency: 6 GHz mein 320 MHz channels, 4096-QAM, <b>Multi-Link Operation</b> (ek client do ya teen bands ek saath use karta hai) aur multi-RU (ek client ko kai bikhre hue resource units dena). IEEE ne 802.11be ko 2024 mein approve kiya; Wi-Fi Alliance ne Wi-Fi 7 certification 2024 mein shuru ki. 802.11bn (Wi-Fi 8) abhi development mein hai.</p>

<div class="eg"><p><b>Worked example: numbers kahan se aate hain.</b> 802.11ac, 80 MHz, 1 stream, MCS 9: 234 data subcarriers x 8 bits (256-QAM) x 5/6 coding / 3.6 microseconds (short guard interval wala symbol) = 433 Mbps. Do streams ise double karke 866 Mbps kar deti hain. Ek stream wala phone aksar "433 Mbps" ki tarah market hota hai; do stream wala laptop "867 Mbps". AP ka advertised "AX3000" ya "5 Gbps" saare radios aur streams ka sum hai, jo koi ek client nahi dekhta.</p></div>

<h3>Backward compatibility aur purane clients kyun matter karte hain</h3>
<p>Har naya standard purane se baat karta hai, lekin purana client slow hota hai aur same data ke liye zyada airtime leta hai. 54 Mbps client ko wahi file bhejne mein 300 Mbps client se chhe guna airtime lagta hai, aur poora cell uska intezaar karta hai. 2.4 GHz par 802.11b client sab ko protection use karne par majboor karta hai. Isliye modern designs low rates disable karte hain aur kabhi kabhi purane clients ko apne alag SSID par daalte hain, jaise Lab 1 mein.</p>

<div class="note"><p>Simulator client standard lab ki client capability se batata hai: LAPTOP1 Wi-Fi 6 (ax), 2 streams, 80 MHz tak, dual band hai; Lab 4 mein woh sirf 2.4 GHz par 802.11n device hai; SENSOR1 sirf 2.4 GHz wala device hai. <code>wifi link</code> mein generation <b>protocol</b> line mein padho.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh kehna ki 802.11ac 2.4 GHz par chalta hai. Nahi chalta. Marketing ka "dual-band AC" matlab 2.4 GHz radio 802.11n chalata hai (kuch vendors 2.4 par proprietary 256-QAM jodte hain, jo standard nahi hai).</p></div>
<div class="exam"><p><b>Exam trap.</b> 802.11a 5 GHz hai, 802.11b aur g 2.4 GHz hain, 802.11n dono. Wi-Fi 6 sirf 5 GHz nahi hai: yeh 2.4 aur 5 GHz mein chalta hai, aur Wi-Fi 6E 6 GHz jodta hai.</p></div>

<div class="scn"><h4>54 Mbps laptop jisne poora floor slow kar diya</h4><p>Ek call centre ne ek floor par slow Wi-Fi ki shikayat ki. Wireless controller ki client list mein ek corner mein ek purana 802.11g device dikha. 2.4 GHz par 802.11b rates enabled the, isliye har beacon 1 Mbps par bheja ja raha tha, aur protection frames overhead badha rahe the. Team ne chaar 802.11b rates disable kiye, legacy device ko dedicated 2.4 GHz SSID par shift kiya, aur floor theek ho gaya.</p><p><b>Seekh:</b> ek slow purana client shared airtime ka bada hissa kha sakta hai. Sabse pehle use client list mein dhundho.</p></div>

<div class="iv"><p class="q">"802.11ac ne 802.11n ke upar kya joda?"</p><p>Strong answer: sirf 5 GHz, 64-QAM ki jagah 256-QAM, 40 ki jagah 80 aur 160 MHz channels, aath spatial streams tak, aur wave 2 mein downlink MU-MIMO, saath mein explicit beamforming ki standardisation. Batao ki 802.11ax ne phir sirf raw speed ki jagah efficiency (OFDMA) par focus kiya.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed teen levers se badhti hai: bits per symbol (QAM), channel width aur spatial streams.</li>
<li>a 5 GHz hai, b aur g 2.4 GHz hain, n dono, ac sirf 5 GHz, ax aur be teeno bands cover karte hain.</li>
<li>OFDM ne DSSS ki jagah li; MIMO n ke saath aaya; MU-MIMO ac wave 2 ke saath; OFDMA ax ke saath; MLO be ke saath.</li>
<li>Purane clients sab ka airtime khate hain, aur 802.11b support protection overhead laata hai.</li>
<li>AP ki advertised speeds radios ka sum hain; ek client ek link dekhta hai.</li>
</ul></div>
`}};export{e as default};