var e={id:`wifi6-7-clients`,h:{en:`Wi-Fi 6, 6E and 7 features and wireless client capabilities`,hi:`Wi-Fi 6, 6E aur 7 features aur wireless client capabilities`},body:{en:`
<p>The CCNA table told you that 802.11ax is Wi-Fi 6. ENCOR wants to know <b>why</b> it is better in a crowded office, what Wi-Fi 7 adds, and how the capabilities of the client, not the AP, usually decide what you actually get.</p>

<h3>An analogy: from taxis to a shared bus</h3>
<p>Before Wi-Fi 6, the AP was a taxi rank: one client got the whole channel for each transmission, even if it carried one small packet. Wi-Fi 6 turned the channel into a bus with seats: in one trip the AP can drop small packets to many clients at once, each in its own seats (<b>OFDMA</b>). It also lets several buses leave at the same time in different directions (<b>MU-MIMO</b>), lets buses from a neighbouring depot on the same road stop wasting time politely waiting (<b>BSS colouring</b>), and gives sleepy passengers fixed pick-up times so they can nap (<b>TWT</b>).</p>

<h3>Modulation, MCS and SNR</h3>
<p>Each <b>MCS</b> (Modulation and Coding Scheme) index combines a modulation (how many bits per symbol) with a coding rate (how much error correction). Denser modulation needs a cleaner signal:</p>
<table class="cmp"><tr><th>Modulation</th><th>Bits per symbol</th><th>Approximate SNR needed</th><th>Introduced in</th></tr>
<tr><td>BPSK</td><td>1</td><td>about 5 dB</td><td>802.11a/g</td></tr>
<tr><td>QPSK</td><td>2</td><td>about 10 dB</td><td>802.11a/g</td></tr>
<tr><td>16-QAM</td><td>4</td><td>about 17 dB</td><td>802.11a/g</td></tr>
<tr><td>64-QAM</td><td>6</td><td>about 25 dB</td><td>802.11a/g/n</td></tr>
<tr><td>256-QAM</td><td>8</td><td>about 30 dB</td><td>802.11ac (Wi-Fi 5)</td></tr>
<tr><td>1024-QAM</td><td>10</td><td>about 35 dB</td><td>802.11ax (Wi-Fi 6)</td></tr>
<tr><td>4096-QAM</td><td>12</td><td>about 40 dB+</td><td>802.11be (Wi-Fi 7)</td></tr></table>
<p>The exact values vary by vendor, but the pattern is fixed: the fastest rates only happen close to the AP with high SNR. That is why "maximum rate" marketing numbers rarely match reality. A client at the cell edge falls back to QPSK or BPSK (<b>rate shifting</b>).</p>

<h3>What Wi-Fi 6 (802.11ax) changed</h3>
<ul><li><b>OFDMA</b> (Orthogonal Frequency-Division Multiple Access): the channel's subcarriers are grouped into <b>resource units</b> (RUs). The smallest RU is 26 tones, so a 20 MHz channel can serve up to 9 clients in one transmission, in both downlink and (new in ax) uplink. It cuts latency for many small flows such as voice and IoT.</li>
<li><b>MU-MIMO</b> (multi-user MIMO): the AP beamforms different streams to different clients at the same time. Wi-Fi 5 had downlink only with up to 4 users; Wi-Fi 6 supports up to 8 users and adds uplink MU-MIMO.</li>
<li><b>BSS colouring</b>: each BSS marks its frames with a colour (a number 1–63). A radio that hears a frame from a different-colour BSS at low power may ignore it and transmit anyway (spatial reuse with an adjusted detection threshold, OBSS-PD). This reduces co-channel contention in dense deployments.</li>
<li><b>TWT</b> (Target Wake Time): the AP and a client agree on scheduled wake times. Battery-powered IoT sensors can sleep for long periods, and the AP can schedule who talks when.</li>
<li><b>1024-QAM</b>, <b>longer OFDM symbols</b> (12.8 µs, four times longer, with 78.125 kHz subcarrier spacing) for better efficiency and outdoor robustness, and the same maximum of 8 spatial streams that 802.11ac already allowed (real APs and clients use 2 to 4; the gains come from OFDMA and uplink MU-MIMO, not from more streams).</li>
<li><b>Wi-Fi 6E</b> is Wi-Fi 6 extended into the <b>6 GHz</b> band: clean spectrum, many wide channels, WPA3 mandatory.</li></ul>

<h3>What Wi-Fi 7 (802.11be) adds</h3>
<ul><li><b>320 MHz channels</b> in 6 GHz and <b>4096-QAM</b>.</li>
<li><b>Multi-Link Operation (MLO)</b>: a client connects to one AP over two or three bands at once (for example 5 and 6 GHz) as one logical link, sending on whichever is free or aggregating them. Lower latency and better reliability.</li>
<li><b>Preamble puncturing</b> and multi-RU: if part of a wide channel is busy (say, radar or a neighbour on one 20 MHz slice), the AP can "punch out" that slice and still use the rest.</li></ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OFDM versus OFDMA">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 5 OFDM: one client per transmission</text>
<rect x="20" y="35" width="90" height="120" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="115" y="35" width="90" height="120" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="210" y="35" width="90" height="120" fill="#fde68a"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 6 OFDMA: many clients at once</text>
<rect x="360" y="35" width="240" height="38" fill="#bae6fd"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">RU for A</text>
<rect x="360" y="76" width="240" height="38" fill="#bbf7d0"/><text x="480" y="100" text-anchor="middle" class="svg-ink" font-size="13">RU for B</text>
<rect x="360" y="117" width="240" height="38" fill="#fde68a"/><text x="480" y="141" text-anchor="middle" class="svg-ink" font-size="13">RU for C</text>
<text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">time →   (three separate transmissions)</text>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">frequency ↕   (one transmission)</text>
</svg><p class="cap">OFDMA splits the channel in frequency so small packets for several clients share one transmission.</p></div>

<h3>Client capabilities: the client decides</h3>
<p>An AP can only use what the client supports, and the client advertises its abilities in its probe and association requests (HT, VHT, HE and EHT capability elements for n, ac, ax and be). The controller shows them in the client details (protocol, spatial streams, channel width). Key capabilities to check:</p>
<table class="cmp"><tr><th>Capability</th><th>Why it matters</th></tr>
<tr><td>Bands (2.4 / 5 / 6 GHz)</td><td>Many IoT devices are 2.4 GHz only; 6 GHz needs a 6E or 7 client.</td></tr>
<tr><td>Spatial streams</td><td>Most phones are 2×2:2; many IoT devices 1×1:1. A 4×4 AP still sends one client only as many streams as it has.</td></tr>
<tr><td>Channel width</td><td>Some clients support only 20 or 40 MHz.</td></tr>
<tr><td>Transmit power</td><td>Clients send 10–15 dBm; this sets the real uplink cell size (chapter 2).</td></tr>
<tr><td>DFS channel support</td><td>Some clients cannot use 52–144 and simply do not see the AP there.</td></tr>
<tr><td>Security: WPA3, SAE, PMF</td><td>Older clients may fail on WPA3-only or PMF-required WLANs; hence transition mode (chapter 10).</td></tr>
<tr><td>802.11k/v/r support</td><td>Decides whether fast and assisted roaming works (chapters 9 and 11).</td></tr></table>
<p>Controllers help clients choose well with <b>band select</b> (delaying 2.4 GHz probe responses to push dual-band clients to 5 GHz), <b>load balancing</b>, and 802.11k/v neighbour and transition hints, but the final decision is always the client's.</p>

<pre class="out">MAC Address     AP Name           WLAN  State             Protocol  Method
--------------------------------------------------------------------------
0050.2fe9.9a01  AP1               1     Run               <span class="hl">11ac</span>      PSK

MAC Address     AP Name           WLAN  State             Protocol  Method
--------------------------------------------------------------------------
0050.2fe9.9a01  AP2               1     Run               <span class="hl">11n</span>       PSK</pre>
<p>This is <code>show wireless client summary</code> from lab 1, before and after AP1 goes to monitor mode (GUI: Monitoring &gt; Wireless &gt; Clients). The Protocol column tells you which radio and standard the client really uses: LAPTOP1 was on 5 GHz (11ac) and, after the roam to AP2, landed on the 2.4 GHz radio (11n). A roam can move a client to a slower band, so check the protocol after every AP change.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Buying Wi-Fi 6 APs and expecting OFDMA gains while all clients are Wi-Fi 5; the new features need Wi-Fi 6 clients. (2) Enabling WPA3-only on a WLAN full of old scanners. (3) Forgetting that a 1×1 IoT device on 2.4 GHz at a low rate consumes a lot of airtime and slows everyone on that channel.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFDMA is multi-user in frequency (RUs); MU-MIMO is multi-user in space (beams). BSS colouring reduces co-channel contention. TWT saves client battery. MLO is Wi-Fi 7. Wi-Fi 6E means 6 GHz, not a new PHY.</p></div>

<div class="scn"><h4>The new APs did not help</h4><p>A company replaced Wi-Fi 5 APs with Wi-Fi 6 models and expected a big improvement in the busy sales floor. Nothing changed. The client list showed that 80 % of devices were three-year-old laptops reporting 802.11ac. The Wi-Fi 6 features (OFDMA, uplink MU-MIMO, BSS colouring) only helped the few new phones. The real gain came from the planned laptop refresh six months later, plus moving to 40 MHz channels to give each AP its own channel.</p><p><b>Lesson:</b> the network runs at the level of its clients. Check client capabilities before promising results.</p></div>

<div class="iv"><p class="q">"Explain OFDMA versus MU-MIMO."</p><p>Strong answer: both serve several clients at once. OFDMA divides the channel's subcarriers into resource units so different clients get different frequency slices in one transmission; it is ideal for many small packets and reduces latency. MU-MIMO uses multiple antennas to send separate spatial streams to different clients in the same frequencies at the same time; it needs good SNR and spatially separated clients and suits large transfers. Wi-Fi 6 has both in downlink and uplink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Higher MCS needs higher SNR: 256-QAM about 30 dB, 1024-QAM about 35 dB.</li>
<li>Wi-Fi 6: OFDMA, UL/DL MU-MIMO (8 users), BSS colouring, TWT, 1024-QAM; 6E adds 6 GHz.</li>
<li>Wi-Fi 7: 320 MHz, 4096-QAM, Multi-Link Operation, preamble puncturing.</li>
<li>Client capabilities (bands, streams, width, power, DFS, WPA3/PMF, 11k/v/r) decide the result.</li>
<li>The client chooses the AP; band select and 802.11k/v only give hints.</li>
</ul></div>
`,hi:`
<p>CCNA table ne bataya ki 802.11ax Wi-Fi 6 hai. ENCOR jaanna chahta hai ki bheed wale office mein yeh <b>kyun</b> behtar hai, Wi-Fi 7 kya jodta hai, aur kaise AP nahi balki client ki capabilities aam taur par tay karti hain ki aapko asal mein kya milega.</p>

<h3>Ek analogy: taxi se shared bus tak</h3>
<p>Wi-Fi 6 se pehle AP ek taxi stand tha: har transmission mein ek client ko poora channel milta tha, chahe usmein ek chhota packet ho. Wi-Fi 6 ne channel ko seats wali bus bana diya: ek trip mein AP kai clients ko ek saath chhote packets pahuncha sakta hai, har ek apni seats mein (<b>OFDMA</b>). Yeh kai buses ko ek hi time par alag directions mein bhejne deta hai (<b>MU-MIMO</b>), padosi depot ki buses ko same sadak par tameez se wait karke time barbaad karne se rokta hai (<b>BSS colouring</b>), aur neend wale passengers ko fixed pick-up time deta hai taaki woh so sakein (<b>TWT</b>).</p>

<h3>Modulation, MCS aur SNR</h3>
<p>Har <b>MCS</b> (Modulation and Coding Scheme) index ek modulation (har symbol mein kitne bits) aur ek coding rate (kitna error correction) jodta hai. Ghani modulation ko saaf signal chahiye:</p>
<table class="cmp"><tr><th>Modulation</th><th>Bits per symbol</th><th>Lagbhag zaroori SNR</th><th>Kab aaya</th></tr>
<tr><td>BPSK</td><td>1</td><td>lagbhag 5 dB</td><td>802.11a/g</td></tr>
<tr><td>QPSK</td><td>2</td><td>lagbhag 10 dB</td><td>802.11a/g</td></tr>
<tr><td>16-QAM</td><td>4</td><td>lagbhag 17 dB</td><td>802.11a/g</td></tr>
<tr><td>64-QAM</td><td>6</td><td>lagbhag 25 dB</td><td>802.11a/g/n</td></tr>
<tr><td>256-QAM</td><td>8</td><td>lagbhag 30 dB</td><td>802.11ac (Wi-Fi 5)</td></tr>
<tr><td>1024-QAM</td><td>10</td><td>lagbhag 35 dB</td><td>802.11ax (Wi-Fi 6)</td></tr>
<tr><td>4096-QAM</td><td>12</td><td>lagbhag 40 dB+</td><td>802.11be (Wi-Fi 7)</td></tr></table>
<p>Exact values vendor ke hisaab se badalti hain, par pattern fixed hai: sabse tez rates sirf AP ke paas high SNR par milte hain. Isliye "maximum rate" wale marketing numbers asliyat se kam hi milte hain. Cell edge par client QPSK ya BPSK par gir jaata hai (<b>rate shifting</b>).</p>

<h3>Wi-Fi 6 (802.11ax) ne kya badla</h3>
<ul><li><b>OFDMA</b> (Orthogonal Frequency-Division Multiple Access): channel ke subcarriers <b>resource units</b> (RUs) mein group hote hain. Sabse chhota RU 26 tones ka hai, to ek 20 MHz channel ek transmission mein 9 clients tak serve kar sakta hai, downlink aur (ax mein naya) uplink dono mein. Yeh voice aur IoT jaise bahut saare chhote flows ki latency kam karta hai.</li>
<li><b>MU-MIMO</b> (multi-user MIMO): AP ek hi time par alag clients ko alag streams beamform karta hai. Wi-Fi 5 mein sirf downlink tha, 4 users tak; Wi-Fi 6 8 users tak support karta hai aur uplink MU-MIMO jodta hai.</li>
<li><b>BSS colouring</b>: har BSS apne frames par ek colour (number 1–63) lagata hai. Jo radio doosre colour wale BSS ka frame kam power par sune, woh use ignore karke transmit kar sakta hai (adjusted detection threshold ke saath spatial reuse, OBSS-PD). Isse dense deployments mein co-channel contention kam hota hai.</li>
<li><b>TWT</b> (Target Wake Time): AP aur client scheduled wake times par sehmat hote hain. Battery wale IoT sensors lambe time so sakte hain, aur AP schedule kar sakta hai ki kaun kab bolega.</li>
<li><b>1024-QAM</b>, <b>lambe OFDM symbols</b> (12.8 µs, chaar guna lambe, 78.125 kHz subcarrier spacing ke saath) behtar efficiency aur outdoor robustness ke liye, aur utne hi 8 spatial streams tak jitne 802.11ac mein pehle se the (asli APs aur clients 2 se 4 use karte hain; fayda OFDMA aur uplink MU-MIMO se aata hai, zyada streams se nahi).</li>
<li><b>Wi-Fi 6E</b> Wi-Fi 6 ko <b>6 GHz</b> band tak badhata hai: saaf spectrum, bahut saare chaude channels, WPA3 zaroori.</li></ul>

<h3>Wi-Fi 7 (802.11be) kya jodta hai</h3>
<ul><li>6 GHz mein <b>320 MHz channels</b> aur <b>4096-QAM</b>.</li>
<li><b>Multi-Link Operation (MLO)</b>: client ek AP se do ya teen bands par ek saath (jaise 5 aur 6 GHz) ek logical link ke roop mein judta hai, jo free ho us par bhejta hai ya unhe aggregate karta hai. Kam latency aur behtar reliability.</li>
<li><b>Preamble puncturing</b> aur multi-RU: agar chaude channel ka ek hissa busy ho (jaise radar ya ek 20 MHz slice par padosi), AP us slice ko "punch out" karke baaki use kar sakta hai.</li></ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OFDM vs OFDMA">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 5 OFDM: har transmission mein ek client</text>
<rect x="20" y="35" width="90" height="120" fill="#bae6fd"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">A</text>
<rect x="115" y="35" width="90" height="120" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="13">B</text>
<rect x="210" y="35" width="90" height="120" fill="#fde68a"/><text x="255" y="100" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 6 OFDMA: kai clients ek saath</text>
<rect x="360" y="35" width="240" height="38" fill="#bae6fd"/><text x="480" y="59" text-anchor="middle" class="svg-ink" font-size="13">A ka RU</text>
<rect x="360" y="76" width="240" height="38" fill="#bbf7d0"/><text x="480" y="100" text-anchor="middle" class="svg-ink" font-size="13">B ka RU</text>
<rect x="360" y="117" width="240" height="38" fill="#fde68a"/><text x="480" y="141" text-anchor="middle" class="svg-ink" font-size="13">C ka RU</text>
<text x="160" y="185" text-anchor="middle" class="svg-muted" font-size="12">time →   (teen alag transmissions)</text>
<text x="480" y="185" text-anchor="middle" class="svg-muted" font-size="12">frequency ↕   (ek transmission)</text>
</svg><p class="cap">OFDMA channel ko frequency mein baant-ta hai taaki kai clients ke chhote packets ek transmission share karein.</p></div>

<h3>Client capabilities: faisla client karta hai</h3>
<p>AP sirf wahi use kar sakta hai jo client support kare, aur client apni capabilities probe aur association requests mein advertise karta hai (n, ac, ax aur be ke liye HT, VHT, HE aur EHT capability elements). Controller unhe client details mein dikhata hai (protocol, spatial streams, channel width). Check karne wali main capabilities:</p>
<table class="cmp"><tr><th>Capability</th><th>Kyun matter karti hai</th></tr>
<tr><td>Bands (2.4 / 5 / 6 GHz)</td><td>Bahut IoT devices sirf 2.4 GHz hain; 6 GHz ke liye 6E ya 7 client chahiye.</td></tr>
<tr><td>Spatial streams</td><td>Zyada tar phones 2×2:2 hain; bahut IoT devices 1×1:1. 4×4 AP bhi ek client ko utne hi streams bhejta hai jitne uske paas hain.</td></tr>
<tr><td>Channel width</td><td>Kuch clients sirf 20 ya 40 MHz support karte hain.</td></tr>
<tr><td>Transmit power</td><td>Clients 10–15 dBm bhejte hain; yahi asli uplink cell size tay karta hai (chapter 2).</td></tr>
<tr><td>DFS channel support</td><td>Kuch clients 52–144 use nahi kar sakte aur wahan AP ko dekhte hi nahi.</td></tr>
<tr><td>Security: WPA3, SAE, PMF</td><td>Purane clients WPA3-only ya PMF-required WLANs par fail ho sakte hain; isliye transition mode (chapter 10).</td></tr>
<tr><td>802.11k/v/r support</td><td>Tay karta hai ki fast aur assisted roaming chalega ya nahi (chapters 9 aur 11).</td></tr></table>
<p>Controllers clients ko achha chunne mein madad karte hain <b>band select</b> se (2.4 GHz probe responses der se bhejkar dual-band clients ko 5 GHz par dhakelna), <b>load balancing</b> se, aur 802.11k/v neighbour aur transition hints se, lekin aakhri faisla hamesha client ka hota hai.</p>

<pre class="out">MAC Address     AP Name           WLAN  State             Protocol  Method
--------------------------------------------------------------------------
0050.2fe9.9a01  AP1               1     Run               <span class="hl">11ac</span>      PSK

MAC Address     AP Name           WLAN  State             Protocol  Method
--------------------------------------------------------------------------
0050.2fe9.9a01  AP2               1     Run               <span class="hl">11n</span>       PSK</pre>
<p>Yeh lab 1 ka <code>show wireless client summary</code> hai, AP1 ke monitor mode mein jaane se pehle aur baad (GUI: Monitoring &gt; Wireless &gt; Clients). Protocol column batata hai ki client asal mein kaunsa radio aur standard use kar raha hai: LAPTOP1 5 GHz (11ac) par tha aur AP2 par roam ke baad 2.4 GHz radio (11n) par aa gaya. Roam client ko slower band par le ja sakta hai, isliye har AP change ke baad protocol check karo.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Wi-Fi 6 APs khareed kar OFDMA ke fayde expect karna jabki saare clients Wi-Fi 5 hain; naye features ko Wi-Fi 6 clients chahiye. (2) Purane scanners se bhare WLAN par WPA3-only enable karna. (3) Bhoolna ki 2.4 GHz par low rate wala 1×1 IoT device bahut airtime khaata hai aur us channel par sabko slow karta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> OFDMA frequency mein multi-user hai (RUs); MU-MIMO space mein multi-user (beams). BSS colouring co-channel contention kam karta hai. TWT client ki battery bachata hai. MLO Wi-Fi 7 hai. Wi-Fi 6E ka matlab 6 GHz, naya PHY nahi.</p></div>

<div class="scn"><h4>Naye APs se fayda nahi hua</h4><p>Ek company ne Wi-Fi 5 APs ko Wi-Fi 6 models se badla aur busy sales floor par bade sudhaar ki umeed ki. Kuch nahi badla. Client list ne dikhaya ki 80 % devices teen saal purane laptops the jo 802.11ac report karte the. Wi-Fi 6 features (OFDMA, uplink MU-MIMO, BSS colouring) sirf kuch naye phones ki madad kar rahe the. Asli fayda chhe mahine baad planned laptop refresh se aaya, saath mein 40 MHz channels par jaane se taaki har AP ko apna channel mile.</p><p><b>Lesson:</b> network apne clients ke level par chalta hai. Results promise karne se pehle client capabilities check karo.</p></div>

<div class="iv"><p class="q">"OFDMA vs MU-MIMO samjhao."</p><p>Strong answer: dono ek saath kai clients serve karte hain. OFDMA channel ke subcarriers ko resource units mein baant-ta hai taaki ek transmission mein alag clients ko alag frequency slices milein; bahut saare chhote packets ke liye best hai aur latency kam karta hai. MU-MIMO kai antennas se ek hi frequencies mein ek hi time par alag clients ko alag spatial streams bhejta hai; achha SNR aur spatially alag clients chahiye aur bade transfers ke liye theek hai. Wi-Fi 6 mein dono downlink aur uplink mein hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>High MCS ko high SNR chahiye: 256-QAM lagbhag 30 dB, 1024-QAM lagbhag 35 dB.</li>
<li>Wi-Fi 6: OFDMA, UL/DL MU-MIMO (8 users), BSS colouring, TWT, 1024-QAM; 6E 6 GHz jodta hai.</li>
<li>Wi-Fi 7: 320 MHz, 4096-QAM, Multi-Link Operation, preamble puncturing.</li>
<li>Client capabilities (bands, streams, width, power, DFS, WPA3/PMF, 11k/v/r) result tay karti hain.</li>
<li>AP ko client chunta hai; band select aur 802.11k/v sirf hints dete hain.</li>
</ul></div>
`}};export{e as default};