var e={id:`standards`,h:{en:`802.11 standards: from 802.11b to Wi-Fi 7`,hi:`802.11 standards: 802.11b se Wi-Fi 7 tak`},body:{en:`
<p>Think of the 802.11 standards as generations of road design. The first roads were narrow single lanes (802.11b). Then engineers widened the lanes (wider channels), added more lanes side by side (MIMO spatial streams), packed more passengers into each car (denser modulation), and finally built smart traffic lights that let many small cars share one lane at the same moment (OFDMA). Every generation is still a road in the same city, and old cars still need to drive on it, which is why backward compatibility matters.</p>

<h3>The standards at a glance</h3>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi name</th><th>Band(s)</th><th>Max width</th><th>Key technology</th><th>Max PHY rate (theory)</th></tr>
<tr><td>802.11b (1999)</td><td>none (unofficially Wi-Fi 1)</td><td>2.4 GHz</td><td>22 MHz</td><td>DSSS/CCK</td><td>11 Mbps</td></tr>
<tr><td>802.11a (1999)</td><td>none</td><td>5 GHz</td><td>20 MHz</td><td>OFDM</td><td>54 Mbps</td></tr>
<tr><td>802.11g (2003)</td><td>none</td><td>2.4 GHz</td><td>20 MHz</td><td>OFDM</td><td>54 Mbps</td></tr>
<tr><td>802.11n (2009)</td><td>Wi-Fi 4</td><td>2.4 and 5 GHz</td><td>40 MHz</td><td>MIMO, up to 4 spatial streams, 64-QAM</td><td>600 Mbps</td></tr>
<tr><td>802.11ac (2013)</td><td>Wi-Fi 5</td><td>5 GHz only</td><td>160 MHz</td><td>256-QAM, up to 8 streams, downlink MU-MIMO</td><td>about 6.9 Gbps</td></tr>
<tr><td>802.11ax (2019)</td><td>Wi-Fi 6</td><td>2.4 and 5 GHz</td><td>160 MHz</td><td>OFDMA, 1024-QAM, uplink and downlink MU-MIMO, BSS colouring, TWT</td><td>about 9.6 Gbps</td></tr>
<tr><td>802.11ax in 6 GHz</td><td>Wi-Fi 6E</td><td>2.4, 5 and 6 GHz</td><td>160 MHz</td><td>Same as Wi-Fi 6, plus the clean 6 GHz band</td><td>about 9.6 Gbps</td></tr>
<tr><td>802.11be (2024)</td><td>Wi-Fi 7</td><td>2.4, 5 and 6 GHz</td><td>320 MHz (6 GHz)</td><td>4096-QAM, multi-link operation (MLO)</td><td>about 46 Gbps</td></tr></table>
<p>The Wi-Fi Alliance officially introduced the generation names with Wi-Fi 4, 5 and 6; older standards never had official numbers. The maximum rates assume the widest channel, the most spatial streams and perfect signal. Real clients such as a phone with two antennas reach a fraction of them.</p>

<h3>The building blocks behind the speed</h3>
<dl class="terms">
<dt>OFDM</dt><dd>Orthogonal frequency-division multiplexing: a channel is split into many narrow subcarriers that carry data in parallel. It resists multipath far better than the older DSSS of 802.11b.</dd>
<dt>Modulation (QAM)</dt><dd>How many bits each symbol carries. 64-QAM carries 6 bits, 256-QAM 8, 1024-QAM 10, 4096-QAM 12. Denser modulation needs a cleaner signal (higher SNR), so it only works close to the AP.</dd>
<dt>MCS</dt><dd>Modulation and coding scheme: an index combining the modulation and the error-correction ratio. Clients step down to a lower MCS as the signal weakens; this is <b>dynamic rate shifting</b>.</dd>
<dt>MIMO and spatial streams</dt><dd>Multiple-input multiple-output: several antennas send different data streams on the same channel at the same time, using multipath to keep them apart. A radio described as <b>2x2:2</b> has 2 transmit antennas, 2 receive antennas and 2 spatial streams.</dd>
<dt>MU-MIMO</dt><dd>Multi-user MIMO: the AP sends different streams to several clients at once. Wi-Fi 5 added it for downlink, Wi-Fi 6 for uplink as well.</dd>
<dt>OFDMA</dt><dd>Orthogonal frequency-division multiple access (Wi-Fi 6): the subcarriers of one channel are grouped into <b>resource units</b> that serve several clients in the same transmission. Perfect for many small packets such as voice, chat and IoT.</dd>
<dt>BSS colouring and TWT</dt><dd>Wi-Fi 6 features. BSS colouring tags frames with a colour so a radio can ignore distant same-channel traffic instead of waiting. Target wake time lets clients sleep until an agreed moment, saving battery.</dd>
<dt>MLO</dt><dd>Multi-link operation (Wi-Fi 7): one client connects over several bands at once, for example 5 and 6 GHz, for higher speed and lower latency.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OFDM versus OFDMA">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDM: one client per transmission</text>
<rect x="30" y="35" width="80" height="120" fill="#bae6fd"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="14">A</text>
<rect x="120" y="35" width="80" height="120" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="14">B</text>
<rect x="210" y="35" width="80" height="120" fill="#fde68a"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="14">C</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDMA: resource units, many clients</text>
<rect x="400" y="35" width="160" height="28" fill="#bae6fd"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="12">A</text>
<rect x="400" y="65" width="160" height="28" fill="#bbf7d0"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">B</text>
<rect x="400" y="95" width="160" height="28" fill="#fde68a"/><text x="480" y="114" text-anchor="middle" class="svg-ink" font-size="12">C</text>
<rect x="400" y="125" width="160" height="30" fill="#ddd6fe"/><text x="480" y="145" text-anchor="middle" class="svg-ink" font-size="12">D</text>
<line x1="30" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">time</text>
<line x1="400" y1="170" x2="560" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">one transmission</text>
<line x1="15" y1="35" x2="15" y2="155" stroke="#64748b" stroke-width="1.5"/><text x="12" y="30" class="svg-muted" font-size="12">freq</text>
</svg><p class="cap">OFDM gives the whole channel to one client at a time; OFDMA (Wi-Fi 6) splits it into resource units so four clients share one transmission.</p></div>

<div class="eg"><p><b>Worked example.</b> A Wi-Fi 5 laptop with a 2x2:2 radio on an 80 MHz channel at 256-QAM (MCS 9) and short guard interval connects at 433.3 Mbps per stream × 2 streams = <b>866.7 Mbps</b>. The same laptop with a Wi-Fi 6 radio at 1024-QAM (MCS 11) gets about 600 Mbps per stream × 2 = <b>1201 Mbps</b>. Walk to the back of the hall and the SNR drops; the client shifts down to, say, MCS 4 and the connection rate falls to a few hundred Mbps.</p></div>

<h3>Seeing the standard in use</h3>
<p>The controller shows the protocol each client negotiated. In the lab, LAPTOP1 is dual-band and joins on 5 GHz, while PHONE1 only supports 2.4 GHz:</p>
<pre class="out">(WLC1) &gt;show client summary

Number of Clients................................ 2

MAC Address        AP Name      Slot  Status      WLAN  Auth  Protocol   IP Address       Port
-----------------  -----------  ----  ----------  ----  ----  ---------  ---------------  ----
<span class="hl">52:54:00:aa:00:01  AP2          1     Associated  1     Yes   802.11ac   10.10.20.11      1</span>
52:54:00:aa:00:02  AP1          0     Associated  1     Yes   802.11n(2.4) 10.10.20.12    1</pre>
<p>Slot 0 is the 2.4 GHz radio, slot 1 the 5 GHz radio.</p>

<h3>Backward compatibility</h3>
<p>New APs still serve old clients. When an 802.11b client joins a 2.4 GHz cell, OFDM stations must first send protection frames (RTS/CTS or CTS-to-self) that the old client understands, and the old client itself talks slowly, using a lot of airtime. One slow client makes the whole cell slower. That is why modern designs disable the lowest legacy data rates, which you will configure in ccna-wlan.</p>

<div class="warn"><p><b>Common mistake.</b> Saying "802.11ac works on 2.4 GHz". 802.11ac is 5 GHz only; a dual-band "AC" router uses 802.11n on its 2.4 GHz radio. Likewise, Wi-Fi 6 works on 2.4 GHz, but the 6 GHz band requires Wi-Fi 6E or Wi-Fi 7.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the pairs: 802.11a = 5 GHz, 54 Mbps; 802.11b = 2.4 GHz, 11 Mbps; 802.11g = 2.4 GHz, 54 Mbps; 802.11n = Wi-Fi 4, both bands; 802.11ac = Wi-Fi 5, 5 GHz; 802.11ax = Wi-Fi 6 and 6E; 802.11be = Wi-Fi 7. OFDMA arrived with Wi-Fi 6, not Wi-Fi 5.</p></div>

<div class="scn"><h4>The barcode scanners that slowed everyone</h4><p>In a warehouse, new Wi-Fi 6 APs were installed, but staff laptops on 2.4 GHz still crawled. The client list showed twenty old handheld scanners connected with 802.11b at 1 and 2 Mbps. Every one of their frames took many times longer on air than a modern frame, and protection overhead taxed everyone. The team moved laptops to 5 GHz, put the scanners on their own SSID, and scheduled a scanner upgrade after which the low rates could be disabled.</p><p><b>Lesson:</b> the slowest client on a channel sets the pace for airtime; plan around legacy devices.</p></div>

<div class="iv"><p class="q">"What does Wi-Fi 6 improve compared with Wi-Fi 5, and what is Wi-Fi 6E?"</p><p>Strong answer: Wi-Fi 6 (802.11ax) is about efficiency in dense places rather than only peak speed: OFDMA resource units, uplink and downlink MU-MIMO, BSS colouring to reduce co-channel waiting, target wake time for battery savings, and 1024-QAM. It works on 2.4 and 5 GHz. Wi-Fi 6E is the same 802.11ax technology extended into the 6 GHz band, which offers far more clean channels but only for 6E-capable clients. Mention Wi-Fi 7 (802.11be) adds 320 MHz channels, 4096-QAM and multi-link operation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11b and g are 2.4 GHz; 802.11a is 5 GHz; 802.11n (Wi-Fi 4) uses both; 802.11ac (Wi-Fi 5) is 5 GHz only.</li>
<li>802.11ax is Wi-Fi 6 (2.4 and 5 GHz) and Wi-Fi 6E (adds 6 GHz); 802.11be is Wi-Fi 7.</li>
<li>Speed comes from wider channels, more spatial streams and denser QAM; denser QAM needs higher SNR.</li>
<li>Wi-Fi 6 adds OFDMA, uplink MU-MIMO, BSS colouring and TWT for efficiency in crowded cells.</li>
<li>Legacy clients slow the whole cell; maximum PHY rates are theoretical.</li>
</ul></div>
`,hi:`
<p>802.11 standards ko sadak design ki peedhiyon ki tarah socho. Pehli sadkein patli single lane thi (802.11b). Phir engineers ne lanes chaudi ki (wider channels), bagal bagal mein aur lanes jodi (MIMO spatial streams), har gaadi mein zyada passengers bhare (denser modulation), aur aakhir mein smart traffic lights banayi jo kai chhoti gaadiyon ko ek hi pal mein ek lane share karne deti hain (OFDMA). Har peedhi abhi bhi usi shehar ki sadak hai, aur purani gaadiyon ko bhi us par chalna hai, isiliye backward compatibility matter karti hai.</p>

<h3>Standards ek nazar mein</h3>
<table class="cmp"><tr><th>Standard</th><th>Wi-Fi naam</th><th>Band(s)</th><th>Max width</th><th>Key technology</th><th>Max PHY rate (theory)</th></tr>
<tr><td>802.11b (1999)</td><td>koi nahi (unofficially Wi-Fi 1)</td><td>2.4 GHz</td><td>22 MHz</td><td>DSSS/CCK</td><td>11 Mbps</td></tr>
<tr><td>802.11a (1999)</td><td>koi nahi</td><td>5 GHz</td><td>20 MHz</td><td>OFDM</td><td>54 Mbps</td></tr>
<tr><td>802.11g (2003)</td><td>koi nahi</td><td>2.4 GHz</td><td>20 MHz</td><td>OFDM</td><td>54 Mbps</td></tr>
<tr><td>802.11n (2009)</td><td>Wi-Fi 4</td><td>2.4 aur 5 GHz</td><td>40 MHz</td><td>MIMO, 4 spatial streams tak, 64-QAM</td><td>600 Mbps</td></tr>
<tr><td>802.11ac (2013)</td><td>Wi-Fi 5</td><td>sirf 5 GHz</td><td>160 MHz</td><td>256-QAM, 8 streams tak, downlink MU-MIMO</td><td>lagbhag 6.9 Gbps</td></tr>
<tr><td>802.11ax (2019)</td><td>Wi-Fi 6</td><td>2.4 aur 5 GHz</td><td>160 MHz</td><td>OFDMA, 1024-QAM, uplink aur downlink MU-MIMO, BSS colouring, TWT</td><td>lagbhag 9.6 Gbps</td></tr>
<tr><td>6 GHz mein 802.11ax</td><td>Wi-Fi 6E</td><td>2.4, 5 aur 6 GHz</td><td>160 MHz</td><td>Wi-Fi 6 jaisa, plus clean 6 GHz band</td><td>lagbhag 9.6 Gbps</td></tr>
<tr><td>802.11be (2024)</td><td>Wi-Fi 7</td><td>2.4, 5 aur 6 GHz</td><td>320 MHz (6 GHz)</td><td>4096-QAM, multi-link operation (MLO)</td><td>lagbhag 46 Gbps</td></tr></table>
<p>Wi-Fi Alliance ne generation naam officially Wi-Fi 4, 5 aur 6 ke saath shuru kiye; purane standards ke kabhi official numbers nahi the. Maximum rates sabse chauda channel, sabse zyada spatial streams aur perfect signal maan kar hain. Real clients, jaise do antennas wala phone, inka ek hissa hi paate hain.</p>

<h3>Speed ke peeche ke building blocks</h3>
<dl class="terms">
<dt>OFDM</dt><dd>Orthogonal frequency-division multiplexing: channel ko kai patle subcarriers mein baanta jaata hai jo parallel mein data le jaate hain. Yeh 802.11b ke purane DSSS se kahin behtar multipath jhelta hai.</dd>
<dt>Modulation (QAM)</dt><dd>Har symbol kitne bits le jaata hai. 64-QAM 6 bits, 256-QAM 8, 1024-QAM 10, 4096-QAM 12. Ghani modulation ko saaf signal (zyada SNR) chahiye, isliye yeh sirf AP ke paas kaam karti hai.</dd>
<dt>MCS</dt><dd>Modulation and coding scheme: ek index jo modulation aur error-correction ratio ko jodta hai. Signal kamzor hone par clients neeche ke MCS par utarte hain; ise <b>dynamic rate shifting</b> kehte hain.</dd>
<dt>MIMO aur spatial streams</dt><dd>Multiple-input multiple-output: kai antennas same channel par same time alag data streams bhejte hain, multipath ka use karke unhe alag rakhte hain. <b>2x2:2</b> radio mein 2 transmit antennas, 2 receive antennas aur 2 spatial streams hote hain.</dd>
<dt>MU-MIMO</dt><dd>Multi-user MIMO: AP ek saath kai clients ko alag streams bhejta hai. Wi-Fi 5 ne ise downlink ke liye joda, Wi-Fi 6 ne uplink ke liye bhi.</dd>
<dt>OFDMA</dt><dd>Orthogonal frequency-division multiple access (Wi-Fi 6): ek channel ke subcarriers ko <b>resource units</b> mein group kiya jaata hai jo ek hi transmission mein kai clients ko serve karte hain. Voice, chat aur IoT jaise chhote packets ke liye perfect.</dd>
<dt>BSS colouring aur TWT</dt><dd>Wi-Fi 6 features. BSS colouring frames par ek colour lagata hai taaki radio door ke same-channel traffic ko wait karne ke bajaye ignore kar sake. Target wake time clients ko tay pal tak sone deta hai, battery bachata hai.</dd>
<dt>MLO</dt><dd>Multi-link operation (Wi-Fi 7): ek client ek saath kai bands par connect hota hai, jaise 5 aur 6 GHz, zyada speed aur kam latency ke liye.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="OFDM vs OFDMA">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDM: har transmission mein ek client</text>
<rect x="30" y="35" width="80" height="120" fill="#bae6fd"/><text x="70" y="100" text-anchor="middle" class="svg-ink" font-size="14">A</text>
<rect x="120" y="35" width="80" height="120" fill="#bbf7d0"/><text x="160" y="100" text-anchor="middle" class="svg-ink" font-size="14">B</text>
<rect x="210" y="35" width="80" height="120" fill="#fde68a"/><text x="250" y="100" text-anchor="middle" class="svg-ink" font-size="14">C</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">OFDMA: resource units, kai clients</text>
<rect x="400" y="35" width="160" height="28" fill="#bae6fd"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="12">A</text>
<rect x="400" y="65" width="160" height="28" fill="#bbf7d0"/><text x="480" y="84" text-anchor="middle" class="svg-ink" font-size="12">B</text>
<rect x="400" y="95" width="160" height="28" fill="#fde68a"/><text x="480" y="114" text-anchor="middle" class="svg-ink" font-size="12">C</text>
<rect x="400" y="125" width="160" height="30" fill="#ddd6fe"/><text x="480" y="145" text-anchor="middle" class="svg-ink" font-size="12">D</text>
<line x1="30" y1="170" x2="290" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="160" y="190" text-anchor="middle" class="svg-muted" font-size="12">time</text>
<line x1="400" y1="170" x2="560" y2="170" stroke="#64748b" stroke-width="1.5"/><text x="480" y="190" text-anchor="middle" class="svg-muted" font-size="12">ek transmission</text>
<line x1="15" y1="35" x2="15" y2="155" stroke="#64748b" stroke-width="1.5"/><text x="12" y="30" class="svg-muted" font-size="12">freq</text>
</svg><p class="cap">OFDM ek time par poora channel ek client ko deta hai; OFDMA (Wi-Fi 6) use resource units mein baantta hai taaki chaar clients ek transmission share karein.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek Wi-Fi 5 laptop jiska 2x2:2 radio 80 MHz channel par 256-QAM (MCS 9) aur short guard interval par hai, 433.3 Mbps per stream × 2 streams = <b>866.7 Mbps</b> par connect hota hai. Wahi laptop Wi-Fi 6 radio ke saath 1024-QAM (MCS 11) par lagbhag 600 Mbps per stream × 2 = <b>1201 Mbps</b> paata hai. Hall ke peeche jaao to SNR girta hai; client, maan lo, MCS 4 par shift hota hai aur connection rate kuch sau Mbps reh jaata hai.</p></div>

<h3>Use mein standard dekhna</h3>
<p>Controller har client ka negotiated protocol dikhata hai. Lab mein LAPTOP1 dual-band hai aur 5 GHz par join karta hai, jabki PHONE1 sirf 2.4 GHz support karta hai:</p>
<pre class="out">(WLC1) &gt;show client summary

Number of Clients................................ 2

MAC Address        AP Name      Slot  Status      WLAN  Auth  Protocol   IP Address       Port
-----------------  -----------  ----  ----------  ----  ----  ---------  ---------------  ----
<span class="hl">52:54:00:aa:00:01  AP2          1     Associated  1     Yes   802.11ac   10.10.20.11      1</span>
52:54:00:aa:00:02  AP1          0     Associated  1     Yes   802.11n(2.4) 10.10.20.12    1</pre>
<p>Slot 0 2.4 GHz radio hai, slot 1 5 GHz radio.</p>

<h3>Backward compatibility</h3>
<p>Naye APs abhi bhi purane clients serve karte hain. Jab ek 802.11b client 2.4 GHz cell join karta hai, to OFDM stations ko pehle protection frames (RTS/CTS ya CTS-to-self) bhejne padte hain jo purana client samajhta hai, aur purana client khud dheere bolta hai, bahut airtime khaata hai. Ek slow client poore cell ko slow kar deta hai. Isiliye modern designs sabse neeche ke legacy data rates disable karte hain, jo aap ccna-wlan mein configure karoge.</p>

<div class="warn"><p><b>Common galti.</b> Kehna ki "802.11ac 2.4 GHz par chalta hai". 802.11ac sirf 5 GHz hai; dual-band "AC" router apne 2.4 GHz radio par 802.11n use karta hai. Isi tarah, Wi-Fi 6 2.4 GHz par chalta hai, par 6 GHz band ke liye Wi-Fi 6E ya Wi-Fi 7 chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jodiyan match karo: 802.11a = 5 GHz, 54 Mbps; 802.11b = 2.4 GHz, 11 Mbps; 802.11g = 2.4 GHz, 54 Mbps; 802.11n = Wi-Fi 4, dono bands; 802.11ac = Wi-Fi 5, 5 GHz; 802.11ax = Wi-Fi 6 aur 6E; 802.11be = Wi-Fi 7. OFDMA Wi-Fi 6 ke saath aaya, Wi-Fi 5 ke saath nahi.</p></div>

<div class="scn"><h4>Barcode scanners jinhone sabko slow kiya</h4><p>Ek warehouse mein naye Wi-Fi 6 APs lage, par 2.4 GHz par staff laptops phir bhi reng rahe the. Client list mein bees purane handheld scanners 802.11b par 1 aur 2 Mbps se connected dikhe. Unka har frame hawa mein modern frame se kai guna zyada time leta tha, aur protection overhead sab par tax lagata tha. Team ne laptops ko 5 GHz par bheja, scanners ko unka apna SSID diya, aur scanner upgrade schedule kiya jiske baad low rates disable kiye ja sakein.</p><p><b>Seekh:</b> channel par sabse slow client airtime ki raftaar tay karta hai; legacy devices ke hisaab se plan karo.</p></div>

<div class="iv"><p class="q">"Wi-Fi 6 Wi-Fi 5 ke comparison mein kya improve karta hai, aur Wi-Fi 6E kya hai?"</p><p>Strong answer: Wi-Fi 6 (802.11ax) sirf peak speed nahi, balki bheed wali jagahon mein efficiency ke baare mein hai: OFDMA resource units, uplink aur downlink MU-MIMO, co-channel waiting kam karne ke liye BSS colouring, battery bachane ke liye target wake time, aur 1024-QAM. Yeh 2.4 aur 5 GHz par chalta hai. Wi-Fi 6E wahi 802.11ax technology hai jo 6 GHz band tak badhi hai, jo kahin zyada clean channels deti hai par sirf 6E-capable clients ke liye. Batao ki Wi-Fi 7 (802.11be) 320 MHz channels, 4096-QAM aur multi-link operation jodta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11b aur g 2.4 GHz hain; 802.11a 5 GHz hai; 802.11n (Wi-Fi 4) dono use karta hai; 802.11ac (Wi-Fi 5) sirf 5 GHz hai.</li>
<li>802.11ax Wi-Fi 6 (2.4 aur 5 GHz) aur Wi-Fi 6E (6 GHz jodta hai) hai; 802.11be Wi-Fi 7 hai.</li>
<li>Speed chaude channels, zyada spatial streams aur ghani QAM se aati hai; ghani QAM ko zyada SNR chahiye.</li>
<li>Wi-Fi 6 bheed wale cells mein efficiency ke liye OFDMA, uplink MU-MIMO, BSS colouring aur TWT jodta hai.</li>
<li>Legacy clients poore cell ko slow karte hain; maximum PHY rates theoretical hain.</li>
</ul></div>
`}};export{e as default};