var e={id:`standards-bands`,h:{en:`802.11 standards and the 2.4, 5 and 6 GHz bands`,hi:`802.11 standards aur 2.4, 5 aur 6 GHz bands`},body:{en:`
<p>Think of the three Wi-Fi bands as three roads. <b>2.4 GHz</b> is an old narrow road that reaches every village but is jammed with traffic. <b>5 GHz</b> is a wide highway with many lanes that does not travel quite as far. <b>6 GHz</b> is a brand-new expressway, empty and fast, but only new cars are allowed on it and it ends sooner. Choosing a band is choosing a road for each kind of traffic.</p>

<h3>The 802.11 generations</h3>
<p>Each amendment to IEEE 802.11 added a faster way to put bits on the air. The Wi-Fi Alliance later gave the newer ones generation numbers. Rates below are theoretical maximums of the standard; real throughput is often half or less, because the air is shared and half duplex.</p>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi name</th><th>Bands</th><th>Max width</th><th>Max data rate</th><th>Key feature</th></tr>
<tr><td>802.11b (1999)</td><td>-</td><td>2.4 GHz</td><td>22 MHz</td><td>11 Mbps</td><td>DSSS</td></tr>
<tr><td>802.11a (1999)</td><td>-</td><td>5 GHz</td><td>20 MHz</td><td>54 Mbps</td><td>OFDM</td></tr>
<tr><td>802.11g (2003)</td><td>-</td><td>2.4 GHz</td><td>20 MHz</td><td>54 Mbps</td><td>OFDM, backward compatible with b</td></tr>
<tr><td>802.11n (2009)</td><td>Wi-Fi 4</td><td>2.4 and 5 GHz</td><td>40 MHz</td><td>600 Mbps</td><td>MIMO, up to 4 spatial streams, channel bonding</td></tr>
<tr><td>802.11ac (2013)</td><td>Wi-Fi 5</td><td>5 GHz only</td><td>160 MHz</td><td>about 6.9 Gbps</td><td>Downlink MU-MIMO, 256-QAM</td></tr>
<tr><td>802.11ax (2019)</td><td>Wi-Fi 6 / 6E</td><td>2.4, 5 (and 6 for 6E) GHz</td><td>160 MHz</td><td>about 9.6 Gbps</td><td>OFDMA, uplink and downlink MU-MIMO, 1024-QAM, BSS colouring, target wake time</td></tr>
<tr><td>802.11be (2024)</td><td>Wi-Fi 7</td><td>2.4, 5 and 6 GHz</td><td>320 MHz</td><td>about 46 Gbps</td><td>Multi-link operation, 4096-QAM</td></tr>
</table>
<p>Newer standards are <b>backward compatible</b> in the same band: an 802.11ax AP still serves an 802.11n phone on 5 GHz. But when old clients are present, the AP may need protection mechanisms that cost airtime, which is why many sites disable the oldest 802.11b data rates.</p>

<h3>Key terms in the table</h3>
<dl class="terms">
<dt>MIMO</dt><dd>Multiple input, multiple output: several antennas send several <b>spatial streams</b> at once on the same channel. Two streams roughly double the rate.</dd>
<dt>MU-MIMO</dt><dd>Multi-user MIMO: the AP sends different streams to different clients at the same time.</dd>
<dt>OFDMA</dt><dd>Wi-Fi 6 splits a channel into small resource units so several clients share one transmission, like a bus carrying passengers for many stops instead of a taxi for one. Huge win for many small packets, such as IoT and voice.</dd>
<dt>QAM</dt><dd>Quadrature amplitude modulation. Higher QAM packs more bits per symbol but needs a cleaner signal (higher SNR), so it only works close to the AP.</dd>
</dl>

<h3>The three bands compared</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Wi-Fi bands compared">
<rect x="20" y="30" width="120" height="40" rx="6" fill="#fed7aa"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">2.4 GHz</text>
<rect x="20" y="90" width="330" height="40" rx="6" fill="#bae6fd"/><text x="185" y="115" text-anchor="middle" class="svg-ink" font-size="13">5 GHz</text>
<rect x="20" y="150" width="600" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">6 GHz</text>
<text x="160" y="55" class="svg-muted" font-size="12">83.5 MHz wide, 3 clean 20 MHz channels, longest range</text>
<text x="370" y="115" class="svg-muted" font-size="12">about 500 to 700 MHz, 20 to 25 channels</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">1200 MHz (5925 to 7125), 59 channels of 20 MHz, Wi-Fi 6E and 7 only</text>
</svg><p class="cap">Bar length shows how much spectrum each band offers. More spectrum means more non-overlapping channels.</p></div>
<table class="cmp"><tr><th></th><th>2.4 GHz</th><th>5 GHz</th><th>6 GHz</th></tr>
<tr><td>Range and wall penetration</td><td>Best</td><td>Good</td><td>Shortest</td></tr>
<tr><td>Non-overlapping 20 MHz channels</td><td>3 (1, 6, 11)</td><td>About 20 to 25, country dependent</td><td>59</td></tr>
<tr><td>Interference sources</td><td>Microwave ovens, Bluetooth, cordless phones, neighbours</td><td>Radar on DFS channels, fewer neighbours</td><td>Almost none yet</td></tr>
<tr><td>Clients</td><td>Everything, including cheap IoT</td><td>Most laptops and phones</td><td>Only Wi-Fi 6E and Wi-Fi 7 devices</td></tr>
<tr><td>Security</td><td>WPA2 or WPA3</td><td>WPA2 or WPA3</td><td>WPA3 or Enhanced Open required</td></tr>
</table>
<p>Higher frequencies lose more energy to free space and to walls, so a 5 GHz or 6 GHz cell is smaller than a 2.4 GHz cell at the same power. In a busy office that is actually useful: small cells let you reuse channels and give each user more airtime.</p>

<h3>Band steering</h3>
<p>Most modern clients are <b>dual-band</b>, but many still pick 2.4 GHz because it looks stronger. <b>Band steering</b> is an AP or controller feature that nudges dual-band clients to 5 GHz (or 6 GHz). The common trick: when a client probes on both bands, the AP delays or ignores its probe responses on 2.4 GHz for a few attempts, so the client joins on 5 GHz. Single-band 2.4 GHz devices still get answered after a few probes, so they are not locked out. Some systems also use 802.11v BSS transition requests to suggest a better band or AP.</p>

<div class="eg"><p><b>Worked example.</b> An office has 60 laptops (all dual-band) and 20 IoT sensors (2.4 GHz only). Without band steering, 35 laptops sit on 2.4 GHz with the sensors, sharing three channels. With band steering, nearly all laptops move to 5 GHz, where the AP has much more capacity; 2.4 GHz is left to the sensors and legacy phones.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using the same SSID on both bands is normal and required for band steering. Creating separate "Office-2G" and "Office-5G" SSIDs doubles beacon overhead and leaves the choice to users, who usually pick the wrong one.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11ac is 5 GHz only; 802.11n and 802.11ax work in both 2.4 and 5 GHz; 802.11a is 5 GHz and 802.11b/g are 2.4 GHz. Wi-Fi 6E means 802.11ax extended into 6 GHz. If a question says a client "cannot see the 6 GHz network", check whether the client is 6E capable before anything else.</p></div>

<div class="scn"><h4>The warehouse scanners that could not see the new SSID</h4><p>A logistics company rolled out new Wi-Fi 6E APs and published the handheld-scanner SSID on 6 GHz only, to keep it clean. The scanners were Wi-Fi 5 devices and never saw the network. The engineer checked the scanner data sheet (802.11a/b/g/n/ac), then enabled the SSID on 5 GHz as well and kept 6 GHz for the new laptops.</p><p><b>Lesson:</b> always match bands to the client capabilities you actually have.</p></div>

<div class="iv"><p class="q">"Why would you prefer 5 GHz over 2.4 GHz in an office, and when would you still use 2.4 GHz?"</p><p>Strong answer: 5 GHz has many more non-overlapping channels, wider channel options and less interference, so it gives more capacity; its shorter range allows smaller cells and channel reuse. 2.4 GHz is still needed for legacy and IoT clients and for long-range coverage such as warehouses or outdoor areas. Mention band steering to push dual-band clients to 5 GHz, and 6 GHz for Wi-Fi 6E and 7 clients.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi 4 = 802.11n, Wi-Fi 5 = 802.11ac (5 GHz only), Wi-Fi 6/6E = 802.11ax, Wi-Fi 7 = 802.11be.</li>
<li>2.4 GHz: longest range, three clean channels, most interference.</li>
<li>5 GHz: many channels, more capacity, some channels need radar detection.</li>
<li>6 GHz: 1200 MHz of clean spectrum, 6E and 7 clients only, WPA3 or Enhanced Open mandatory.</li>
<li>Band steering nudges dual-band clients from 2.4 GHz to 5 or 6 GHz, using one SSID across bands.</li>
</ul></div>
`,hi:`
<p>Teen Wi-Fi bands ko teen sadkon ki tarah socho. <b>2.4 GHz</b> ek purani patli sadak hai jo har gaon tak pahunchti hai par traffic se jam hai. <b>5 GHz</b> kai lanes wala chauda highway hai jo utni door nahi jaata. <b>6 GHz</b> bilkul naya expressway hai, khaali aur tez, par us par sirf nayi gaadiyan chal sakti hain aur woh jaldi khatam ho jaata hai. Band chunna matlab har tarah ke traffic ke liye sadak chunna.</p>

<h3>802.11 generations</h3>
<p>IEEE 802.11 ke har amendment ne hawa par bits daalne ka tez tareeka joda. Wi-Fi Alliance ne baad mein nayi generations ko numbers diye. Neeche ke rates standard ke theoretical maximum hain; asli throughput aksar aadha ya usse kam hota hai, kyunki hawa shared aur half duplex hai.</p>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi naam</th><th>Bands</th><th>Max width</th><th>Max data rate</th><th>Key feature</th></tr>
<tr><td>802.11b (1999)</td><td>-</td><td>2.4 GHz</td><td>22 MHz</td><td>11 Mbps</td><td>DSSS</td></tr>
<tr><td>802.11a (1999)</td><td>-</td><td>5 GHz</td><td>20 MHz</td><td>54 Mbps</td><td>OFDM</td></tr>
<tr><td>802.11g (2003)</td><td>-</td><td>2.4 GHz</td><td>20 MHz</td><td>54 Mbps</td><td>OFDM, b ke saath backward compatible</td></tr>
<tr><td>802.11n (2009)</td><td>Wi-Fi 4</td><td>2.4 aur 5 GHz</td><td>40 MHz</td><td>600 Mbps</td><td>MIMO, 4 spatial streams tak, channel bonding</td></tr>
<tr><td>802.11ac (2013)</td><td>Wi-Fi 5</td><td>sirf 5 GHz</td><td>160 MHz</td><td>lagbhag 6.9 Gbps</td><td>Downlink MU-MIMO, 256-QAM</td></tr>
<tr><td>802.11ax (2019)</td><td>Wi-Fi 6 / 6E</td><td>2.4, 5 (aur 6E ke liye 6) GHz</td><td>160 MHz</td><td>lagbhag 9.6 Gbps</td><td>OFDMA, uplink aur downlink MU-MIMO, 1024-QAM, BSS colouring, target wake time</td></tr>
<tr><td>802.11be (2024)</td><td>Wi-Fi 7</td><td>2.4, 5 aur 6 GHz</td><td>320 MHz</td><td>lagbhag 46 Gbps</td><td>Multi-link operation, 4096-QAM</td></tr>
</table>
<p>Naye standards same band mein <b>backward compatible</b> hain: 802.11ax AP 5 GHz par 802.11n phone ko abhi bhi serve karta hai. Par jab purane clients maujood hon, AP ko protection mechanisms chahiye ho sakte hain jo airtime khaate hain, isiliye kai sites sabse purane 802.11b data rates disable kar deti hain.</p>

<h3>Table ke key terms</h3>
<dl class="terms">
<dt>MIMO</dt><dd>Multiple input, multiple output: kai antennas same channel par ek saath kai <b>spatial streams</b> bhejte hain. Do streams rate ko lagbhag double karte hain.</dd>
<dt>MU-MIMO</dt><dd>Multi-user MIMO: AP ek hi time par alag clients ko alag streams bhejta hai.</dd>
<dt>OFDMA</dt><dd>Wi-Fi 6 channel ko chhote resource units mein baantta hai taaki kai clients ek transmission share karein, jaise bus kai stops ke passengers le jaati hai, ek ke liye taxi ki jagah. Bahut saare chhote packets, jaise IoT aur voice, ke liye badi jeet.</dd>
<dt>QAM</dt><dd>Quadrature amplitude modulation. Zyada QAM har symbol mein zyada bits bharta hai par saaf signal (zyada SNR) chahiye, isliye sirf AP ke paas kaam karta hai.</dd>
</dl>

<h3>Teeno bands ki tulna</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Wi-Fi bands ki tulna">
<rect x="20" y="30" width="120" height="40" rx="6" fill="#fed7aa"/><text x="80" y="55" text-anchor="middle" class="svg-ink" font-size="13">2.4 GHz</text>
<rect x="20" y="90" width="330" height="40" rx="6" fill="#bae6fd"/><text x="185" y="115" text-anchor="middle" class="svg-ink" font-size="13">5 GHz</text>
<rect x="20" y="150" width="600" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="175" text-anchor="middle" class="svg-ink" font-size="13">6 GHz</text>
<text x="160" y="55" class="svg-muted" font-size="12">83.5 MHz chauda, 3 clean 20 MHz channels, sabse zyada range</text>
<text x="370" y="115" class="svg-muted" font-size="12">lagbhag 500 se 700 MHz, 20 se 25 channels</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">1200 MHz (5925 se 7125), 20 MHz ke 59 channels, sirf Wi-Fi 6E aur 7</text>
</svg><p class="cap">Bar ki lambai dikhati hai ki har band kitna spectrum deta hai. Zyada spectrum matlab zyada non-overlapping channels.</p></div>
<table class="cmp"><tr><th></th><th>2.4 GHz</th><th>5 GHz</th><th>6 GHz</th></tr>
<tr><td>Range aur deewar penetration</td><td>Sabse achha</td><td>Achha</td><td>Sabse kam</td></tr>
<tr><td>Non-overlapping 20 MHz channels</td><td>3 (1, 6, 11)</td><td>Lagbhag 20 se 25, desh par nirbhar</td><td>59</td></tr>
<tr><td>Interference sources</td><td>Microwave ovens, Bluetooth, cordless phones, padosi</td><td>DFS channels par radar, kam padosi</td><td>Abhi lagbhag koi nahi</td></tr>
<tr><td>Clients</td><td>Sab kuch, saste IoT samet</td><td>Zyada tar laptops aur phones</td><td>Sirf Wi-Fi 6E aur Wi-Fi 7 devices</td></tr>
<tr><td>Security</td><td>WPA2 ya WPA3</td><td>WPA2 ya WPA3</td><td>WPA3 ya Enhanced Open zaroori</td></tr>
</table>
<p>Oonchi frequencies free space aur deewaron mein zyada energy khoti hain, isliye same power par 5 GHz ya 6 GHz cell 2.4 GHz cell se chhota hota hai. Busy office mein yeh asal mein faydemand hai: chhote cells se aap channels reuse kar sakte ho aur har user ko zyada airtime de sakte ho.</p>

<h3>Band steering</h3>
<p>Zyada tar modern clients <b>dual-band</b> hain, par kai phir bhi 2.4 GHz chunte hain kyunki woh strong dikhta hai. <b>Band steering</b> AP ya controller ka feature hai jo dual-band clients ko 5 GHz (ya 6 GHz) ki taraf dhakelta hai. Common trick: jab client dono bands par probe karta hai, AP kuch attempts ke liye 2.4 GHz par uske probe responses delay ya ignore karta hai, isliye client 5 GHz par join karta hai. Single-band 2.4 GHz devices ko kuch probes ke baad jawab mil jaata hai, isliye woh bahar nahi hote. Kuch systems behtar band ya AP suggest karne ke liye 802.11v BSS transition requests bhi use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek office mein 60 laptops (sab dual-band) aur 20 IoT sensors (sirf 2.4 GHz) hain. Band steering ke bina 35 laptops sensors ke saath 2.4 GHz par baithe hain, teen channels share karte hue. Band steering ke saath lagbhag saare laptops 5 GHz par chale jaate hain, jahan AP ke paas kahin zyada capacity hai; 2.4 GHz sensors aur legacy phones ke liye bachta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Dono bands par same SSID use karna normal hai aur band steering ke liye zaroori hai. Alag "Office-2G" aur "Office-5G" SSIDs banana beacon overhead double karta hai aur choice users par chhod deta hai, jo aksar galat wala chunte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11ac sirf 5 GHz hai; 802.11n aur 802.11ax 2.4 aur 5 GHz dono mein kaam karte hain; 802.11a 5 GHz hai aur 802.11b/g 2.4 GHz. Wi-Fi 6E matlab 802.11ax jo 6 GHz tak badha. Agar sawaal kahe ki client "6 GHz network nahi dekh pa raha", to sabse pehle check karo ki client 6E capable hai ya nahi.</p></div>

<div class="scn"><h4>Warehouse scanners jo naya SSID nahi dekh paaye</h4><p>Ek logistics company ne naye Wi-Fi 6E APs lagaye aur handheld-scanner SSID ko saaf rakhne ke liye sirf 6 GHz par publish kiya. Scanners Wi-Fi 5 devices the aur unhe network kabhi dikha hi nahi. Engineer ne scanner data sheet check ki (802.11a/b/g/n/ac), phir SSID ko 5 GHz par bhi enable kiya aur 6 GHz naye laptops ke liye rakha.</p><p><b>Seekh:</b> bands ko hamesha un client capabilities se match karo jo aapke paas asal mein hain.</p></div>

<div class="iv"><p class="q">"Office mein aap 2.4 GHz ke upar 5 GHz kyun prefer karoge, aur 2.4 GHz kab phir bhi use karoge?"</p><p>Strong answer: 5 GHz mein kahin zyada non-overlapping channels, chaude channel options aur kam interference hai, isliye zyada capacity deta hai; uski kam range chhote cells aur channel reuse allow karti hai. 2.4 GHz legacy aur IoT clients ke liye aur warehouses ya outdoor areas jaisi long-range coverage ke liye abhi bhi chahiye. Dual-band clients ko 5 GHz par dhakelne ke liye band steering, aur Wi-Fi 6E aur 7 clients ke liye 6 GHz ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Wi-Fi 4 = 802.11n, Wi-Fi 5 = 802.11ac (sirf 5 GHz), Wi-Fi 6/6E = 802.11ax, Wi-Fi 7 = 802.11be.</li>
<li>2.4 GHz: sabse zyada range, teen clean channels, sabse zyada interference.</li>
<li>5 GHz: bahut channels, zyada capacity, kuch channels par radar detection zaroori.</li>
<li>6 GHz: 1200 MHz saaf spectrum, sirf 6E aur 7 clients, WPA3 ya Enhanced Open mandatory.</li>
<li>Band steering dual-band clients ko 2.4 GHz se 5 ya 6 GHz par dhakelta hai, bands mein ek SSID use karke.</li>
</ul></div>
`}};export{e as default};