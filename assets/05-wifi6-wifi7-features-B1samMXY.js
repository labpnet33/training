var e={id:`wifi6-wifi7-features`,h:{en:`Wi-Fi 6 and Wi-Fi 7 features: OFDMA, MU-MIMO, colour, TWT, MLO (concept only)`,hi:`Wi-Fi 6 aur Wi-Fi 7 features: OFDMA, MU-MIMO, colour, TWT, MLO (concept only)`},body:{en:`
<div class="note"><p><b>Concept only.</b> The lab simulator does not model any feature in this chapter. You cannot configure or measure OFDMA, MU-MIMO, BSS colouring, TWT or MLO there. Learn them for the exam and for interviews; the lab skills (band, width, rates) still decide most real-world slowness.</p></div>

<h3>The problem Wi-Fi 6 solves</h3>
<p>Before Wi-Fi 6 an AP served one client at a time, and every small packet (a chat message, a sensor reading) took a whole transmission with full overhead. In a classroom with 60 devices sending tiny packets, most airtime went to overhead and waiting. Wi-Fi 6 is built for <b>many clients, small packets, and crowded air</b>, so its biggest gains show up in dense places, not in a single speed test.</p>

<h3>OFDMA: one transmission, many clients</h3>
<p>OFDM gave one client the whole channel for each transmission. <b>OFDMA</b> (Orthogonal Frequency Division <i>Multiple Access</i>) splits the channel into <b>Resource Units (RUs)</b> and gives each RU to a different client in the same transmission. Think of a delivery truck: OFDM sends one truck per customer, OFDMA loads several customers' parcels on one truck.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OFDM versus OFDMA">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDM (Wi-Fi 5): one user per slot</text>
<rect x="20" y="30" width="60" height="150" fill="#bae6fd"/><rect x="85" y="30" width="60" height="150" fill="#bbf7d0"/><rect x="150" y="30" width="60" height="150" fill="#fde68a"/><rect x="215" y="30" width="60" height="150" fill="#ddd6fe"/>
<text x="50" y="200" text-anchor="middle" class="svg-muted" font-size="11">A</text><text x="115" y="200" text-anchor="middle" class="svg-muted" font-size="11">B</text><text x="180" y="200" text-anchor="middle" class="svg-muted" font-size="11">C</text><text x="245" y="200" text-anchor="middle" class="svg-muted" font-size="11">D</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDMA (Wi-Fi 6): RUs shared in time</text>
<rect x="340" y="30" width="60" height="150" fill="#bae6fd"/><rect x="405" y="30" width="120" height="75" fill="#bbf7d0"/><rect x="405" y="105" width="60" height="75" fill="#fde68a"/><rect x="470" y="105" width="55" height="75" fill="#ddd6fe"/><rect x="530" y="30" width="60" height="150" fill="#fed7aa"/>
<text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="11">frequency is the vertical axis, time runs left to right</text>
</svg><p class="cap">Same airtime, more users served. RUs range from 26 tones (up to 9 users in 20 MHz) to 996 tones (a full 80 MHz).</p></div>
<p>The AP controls this with a <b>trigger frame</b>: it tells several clients "send now on RU 3". That makes <b>uplink OFDMA</b> possible, which is new. OFDMA helps latency and efficiency for small packets; it does not raise one client's peak speed.</p>

<h3>MU-MIMO: several clients in parallel</h3>
<p><b>SU-MIMO</b> uses many streams to one client at a time. <b>MU-MIMO</b> (multi-user MIMO) uses spatial separation (beamforming) to send different streams to different clients at the same time on the same frequency. Wi-Fi 5 wave 2 added it for the downlink only, up to four users. Wi-Fi 6 adds <b>uplink</b> MU-MIMO and up to eight users. MU-MIMO needs many AP antennas, clients in different directions, and clients that support it; its real gain is smaller than the marketing figure. Compare: OFDMA divides frequency, MU-MIMO divides space, and they can be used together.</p>

<h3>BSS colouring: spatial reuse</h3>
<p>In 2.4 and 5 GHz, if an AP hears another AP on the same channel (even faintly) it must wait, so neighbouring cells share one slot, called <b>co-channel contention</b>. Wi-Fi 6 stamps every frame header with a 6-bit <b>BSS colour</b> (0 to 63). A station hearing a frame with a different colour knows it is from an overlapping neighbour, and if that signal is weak (below the OBSS PD threshold, between about -82 and -62 dBm) it may transmit anyway at reduced power. It is a way to reuse the same channel in neighbouring cells. The AP chooses and changes the colour automatically when it detects a colour collision.</p>

<h3>TWT: Target Wake Time</h3>
<p>Wi-Fi 6 clients, especially phones and IoT sensors, previously woke every beacon (about every 100 ms) to check for data. With <b>Target Wake Time</b> the AP and client agree a schedule: "wake at second 30, stay for 5 ms, sleep for 10 minutes". This saves battery, and it reduces contention because clients are told when to talk. TWT can be individual (one client) or broadcast (a schedule for a group).</p>

<h3>Other Wi-Fi 6 changes</h3>
<ul><li><b>1024-QAM</b> (MCS 10 and 11): 25 percent more bits per symbol than 256-QAM, needing about 35 dB SNR.</li>
<li><b>Longer symbols</b>: 12.8 microseconds plus guard interval 0.8, 1.6 or 3.2 microseconds for robustness outdoors.</li>
<li><b>Wi-Fi 6E</b>: the same 802.11ax in the 6 GHz band (chapter 6).</li></ul>

<h3>Wi-Fi 7 (802.11be): extremely high throughput</h3>
<ul>
<li><b>320 MHz channels</b> in 6 GHz and <b>4096-QAM</b> (12 bits per symbol, MCS 12 and 13): peak rates of tens of Gbps in theory.</li>
<li><b>Multi-Link Operation (MLO)</b>: one client (a <b>Multi-Link Device</b>, MLD) uses links in 2.4, 5 and 6 GHz at once, with one association and one MAC identity. It can aggregate links for speed or switch instantly to the clearest link for low latency and reliability. Modes include simultaneous transmit and receive (STR) and enhanced single-radio modes (EMLSR).</li>
<li><b>Multi-RU</b>: give one client several RUs that are not contiguous, so interference on one part of the channel no longer wastes it.</li>
<li><b>Preamble puncturing</b>: use a wide channel even when a part of it is busy, by punching a 20 MHz hole.</li></ul>
<table class="cmp"><tr><th>Feature</th><th>Divides</th><th>Standard</th><th>Main win</th></tr>
<tr><td>OFDMA</td><td>Frequency (RUs)</td><td>ax</td><td>Efficiency, latency, many small packets</td></tr>
<tr><td>MU-MIMO</td><td>Space</td><td>ac wave 2 (DL), ax (UL and DL)</td><td>Several clients at once</td></tr>
<tr><td>BSS colour</td><td>Co-channel contention</td><td>ax</td><td>Spatial reuse</td></tr>
<tr><td>TWT</td><td>Time</td><td>ax</td><td>Battery and scheduled access</td></tr>
<tr><td>MLO</td><td>Bands (links)</td><td>be</td><td>Throughput, latency, reliability</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Promising "Wi-Fi 6 will triple speed". OFDMA and colouring improve aggregate efficiency in crowds. A single Wi-Fi 6 client next to the AP gains mainly from 1024-QAM (about 25 percent) and wider channels, and only if the client is Wi-Fi 6 too.</p></div>
<div class="exam"><p><b>Exam trap.</b> BSS colour is carried in the PHY header (HE-SIG-A), not in a beacon only. Uplink MU-MIMO and uplink OFDMA are Wi-Fi 6; downlink MU-MIMO started in Wi-Fi 5 wave 2. MLO is Wi-Fi 7, not Wi-Fi 6E.</p></div>

<div class="scn"><h4>Lecture hall with 300 phones</h4><p>A college upgraded a hall to Wi-Fi 6 APs but students on old phones saw little change. The engineer checked the client mix: 70 percent of devices were Wi-Fi 5 or older. OFDMA only works with Wi-Fi 6 clients, so gains were small. After a semester of phone refresh, hall-wide latency fell clearly and the AP count could be reduced.</p><p><b>Lesson:</b> Wi-Fi 6 features need both sides to support them. Always check the client mix before promising results.</p></div>

<div class="iv"><p class="q">"Explain OFDMA versus MU-MIMO in simple words."</p><p>Strong answer: OFDMA splits the channel in frequency into resource units so one transmission carries data for many clients, which suits many small packets. MU-MIMO uses antennas and beamforming to send separate streams to several clients at the same time by space. One divides frequency, the other divides space, and Wi-Fi 6 supports both on uplink and downlink.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi 6 targets efficiency in crowds: OFDMA, MU-MIMO (UL and DL), BSS colour, TWT, 1024-QAM.</li>
<li>OFDMA divides frequency into RUs; MU-MIMO divides space; colour enables spatial reuse; TWT schedules wake times.</li>
<li>Wi-Fi 7 adds 320 MHz, 4096-QAM, MLO, multi-RU and preamble puncturing.</li>
<li>These features need client support; they are concept only in the lab simulator.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Concept only.</b> Lab simulator is chapter ka koi bhi feature model nahi karta. Wahan aap OFDMA, MU-MIMO, BSS colouring, TWT ya MLO configure ya measure nahi kar sakte. Inhe exam aur interviews ke liye seekho; lab skills (band, width, rates) hi real-world slowness ka zyada hissa tay karti hain.</p></div>

<h3>Wi-Fi 6 kaunsi problem solve karta hai</h3>
<p>Wi-Fi 6 se pehle AP ek waqt mein ek hi client ko serve karta tha, aur har chhota packet (chat message, sensor reading) poore overhead ke saath poora transmission leta tha. 60 devices wale classroom mein chhote packets bhejne par zyada tar airtime overhead aur intezaar mein jaata tha. Wi-Fi 6 <b>bahut clients, chhote packets aur bheed wali hawa</b> ke liye bana hai, isliye uske sabse bade fayde dense jagahon par dikhte hain, single speed test mein nahi.</p>

<h3>OFDMA: ek transmission, kai clients</h3>
<p>OFDM har transmission mein ek client ko poora channel deta tha. <b>OFDMA</b> (Orthogonal Frequency Division <i>Multiple Access</i>) channel ko <b>Resource Units (RUs)</b> mein baantta hai aur ek hi transmission mein har RU alag client ko deta hai. Delivery truck socho: OFDM har customer ke liye ek truck bhejta hai, OFDMA kai customers ke parcels ek truck mein load karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="OFDM versus OFDMA">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDM (Wi-Fi 5): ek slot, ek user</text>
<rect x="20" y="30" width="60" height="150" fill="#bae6fd"/><rect x="85" y="30" width="60" height="150" fill="#bbf7d0"/><rect x="150" y="30" width="60" height="150" fill="#fde68a"/><rect x="215" y="30" width="60" height="150" fill="#ddd6fe"/>
<text x="50" y="200" text-anchor="middle" class="svg-muted" font-size="11">A</text><text x="115" y="200" text-anchor="middle" class="svg-muted" font-size="11">B</text><text x="180" y="200" text-anchor="middle" class="svg-muted" font-size="11">C</text><text x="245" y="200" text-anchor="middle" class="svg-muted" font-size="11">D</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDMA (Wi-Fi 6): RUs time mein share</text>
<rect x="340" y="30" width="60" height="150" fill="#bae6fd"/><rect x="405" y="30" width="120" height="75" fill="#bbf7d0"/><rect x="405" y="105" width="60" height="75" fill="#fde68a"/><rect x="470" y="105" width="55" height="75" fill="#ddd6fe"/><rect x="530" y="30" width="60" height="150" fill="#fed7aa"/>
<text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="11">frequency vertical axis hai, time left se right chalta hai</text>
</svg><p class="cap">Same airtime, zyada users serve. RUs 26 tones (20 MHz mein 9 users tak) se 996 tones (poora 80 MHz) tak hote hain.</p></div>
<p>AP isse <b>trigger frame</b> se control karta hai: woh kai clients ko bolta hai "RU 3 par abhi bhejo". Isse <b>uplink OFDMA</b> possible hota hai, jo naya hai. OFDMA chhote packets ke liye latency aur efficiency badhata hai; yeh ek client ki peak speed nahi badhata.</p>

<h3>MU-MIMO: kai clients parallel mein</h3>
<p><b>SU-MIMO</b> ek waqt mein ek client ko kai streams deta hai. <b>MU-MIMO</b> (multi-user MIMO) spatial separation (beamforming) se same frequency par ek saath alag clients ko alag streams bhejta hai. Wi-Fi 5 wave 2 ne ise sirf downlink ke liye joda, chaar users tak. Wi-Fi 6 <b>uplink</b> MU-MIMO aur aath users tak jodta hai. MU-MIMO ko bahut AP antennas, alag directions mein clients aur support karne wale clients chahiye; uska real gain marketing figure se chhota hota hai. Tulna: OFDMA frequency baantta hai, MU-MIMO space baantta hai, aur dono saath use ho sakte hain.</p>

<h3>BSS colouring: spatial reuse</h3>
<p>2.4 aur 5 GHz mein agar AP same channel par kisi dusre AP ko sun leta hai (halka sa bhi) to use wait karna padta hai, isliye padosi cells ek hi slot share karte hain, jise <b>co-channel contention</b> kehte hain. Wi-Fi 6 har frame header par 6-bit <b>BSS colour</b> (0 se 63) lagata hai. Alag colour wala frame sunne wala station jaan jaata hai ki woh overlapping padosi ka hai, aur agar woh signal kamzor hai (OBSS PD threshold se neeche, lagbhag -82 aur -62 dBm ke beech) to woh phir bhi kam power par transmit kar sakta hai. Yeh padosi cells mein same channel dobara use karne ka tareeka hai. Colour collision detect hone par AP colour khud chunta aur badalta hai.</p>

<h3>TWT: Target Wake Time</h3>
<p>Wi-Fi 6 se pehle clients, khaaskar phones aur IoT sensors, har beacon (lagbhag har 100 ms) par data check karne ke liye jaagte the. <b>Target Wake Time</b> ke saath AP aur client schedule tay karte hain: "second 30 par jaago, 5 ms ruko, 10 minute so jao". Isse battery bachti hai, aur contention bhi kam hota hai kyunki clients ko bataya jaata hai ki kab bolna hai. TWT individual (ek client) ya broadcast (group ka schedule) ho sakta hai.</p>

<h3>Wi-Fi 6 ke baaki badlav</h3>
<ul><li><b>1024-QAM</b> (MCS 10 aur 11): 256-QAM se 25 percent zyada bits per symbol, lagbhag 35 dB SNR chahiye.</li>
<li><b>Lambe symbols</b>: 12.8 microseconds plus guard interval 0.8, 1.6 ya 3.2 microseconds, outdoors robustness ke liye.</li>
<li><b>Wi-Fi 6E</b>: wahi 802.11ax 6 GHz band mein (chapter 6).</li></ul>

<h3>Wi-Fi 7 (802.11be): extremely high throughput</h3>
<ul>
<li>6 GHz mein <b>320 MHz channels</b> aur <b>4096-QAM</b> (12 bits per symbol, MCS 12 aur 13): theory mein tens of Gbps peak rates.</li>
<li><b>Multi-Link Operation (MLO)</b>: ek client (ek <b>Multi-Link Device</b>, MLD) 2.4, 5 aur 6 GHz ke links ek saath use karta hai, ek association aur ek MAC identity ke saath. Woh speed ke liye links aggregate kar sakta hai ya low latency aur reliability ke liye turant sabse saaf link par switch kar sakta hai. Modes mein simultaneous transmit and receive (STR) aur enhanced single-radio modes (EMLSR) hain.</li>
<li><b>Multi-RU</b>: ek client ko kai RUs dena jo contiguous nahi hain, taaki channel ke ek hisse par interference use waste na kare.</li>
<li><b>Preamble puncturing</b>: channel ka ek hissa busy ho tab bhi 20 MHz ka hole banakar wide channel use karna.</li></ul>
<table class="cmp"><tr><th>Feature</th><th>Kya baantta hai</th><th>Standard</th><th>Main fayda</th></tr>
<tr><td>OFDMA</td><td>Frequency (RUs)</td><td>ax</td><td>Efficiency, latency, bahut chhote packets</td></tr>
<tr><td>MU-MIMO</td><td>Space</td><td>ac wave 2 (DL), ax (UL aur DL)</td><td>Kai clients ek saath</td></tr>
<tr><td>BSS colour</td><td>Co-channel contention</td><td>ax</td><td>Spatial reuse</td></tr>
<tr><td>TWT</td><td>Time</td><td>ax</td><td>Battery aur scheduled access</td></tr>
<tr><td>MLO</td><td>Bands (links)</td><td>be</td><td>Throughput, latency, reliability</td></tr></table>

<div class="warn"><p><b>Common galti.</b> "Wi-Fi 6 speed teen guna kar dega" ka vaada karna. OFDMA aur colouring bheed mein aggregate efficiency badhate hain. AP ke bagal mein ek Wi-Fi 6 client mainly 1024-QAM (lagbhag 25 percent) aur wider channels se gain karta hai, aur tabhi jab client bhi Wi-Fi 6 ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> BSS colour PHY header (HE-SIG-A) mein hota hai, sirf beacon mein nahi. Uplink MU-MIMO aur uplink OFDMA Wi-Fi 6 hain; downlink MU-MIMO Wi-Fi 5 wave 2 se shuru hua. MLO Wi-Fi 7 hai, Wi-Fi 6E nahi.</p></div>

<div class="scn"><h4>300 phones wala lecture hall</h4><p>Ek college ne hall ko Wi-Fi 6 APs se upgrade kiya lekin purane phones wale students ko zyada fark nahi dikha. Engineer ne client mix check kiya: 70 percent devices Wi-Fi 5 ya purane the. OFDMA sirf Wi-Fi 6 clients ke saath chalta hai, isliye gains chhote the. Ek semester ke phone refresh ke baad hall-wide latency saaf gir gayi aur AP count kam kiya ja saka.</p><p><b>Seekh:</b> Wi-Fi 6 features ke liye dono taraf support chahiye. Results ka vaada karne se pehle hamesha client mix check karo.</p></div>

<div class="iv"><p class="q">"OFDMA aur MU-MIMO simple shabdon mein samjhao."</p><p>Strong answer: OFDMA channel ko frequency mein resource units mein baantta hai taaki ek transmission kai clients ka data carry kare, jo bahut chhote packets ke liye theek hai. MU-MIMO antennas aur beamforming se space ke through ek saath kai clients ko alag streams bhejta hai. Ek frequency baantta hai, dusra space baantta hai, aur Wi-Fi 6 dono ko uplink aur downlink par support karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi 6 bheed mein efficiency target karta hai: OFDMA, MU-MIMO (UL aur DL), BSS colour, TWT, 1024-QAM.</li>
<li>OFDMA frequency ko RUs mein baantta hai; MU-MIMO space baantta hai; colour spatial reuse deta hai; TWT wake times schedule karta hai.</li>
<li>Wi-Fi 7 320 MHz, 4096-QAM, MLO, multi-RU aur preamble puncturing jodta hai.</li>
<li>In features ke liye client support chahiye; lab simulator mein yeh concept only hain.</li>
</ul></div>
`}};export{e as default};