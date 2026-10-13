var e={id:`bands-channels-rrm`,h:{en:`Bands, channels, interference and RRM`,hi:`Bands, channels, interference aur RRM`},body:{en:`
<p>In CCNA you planned 1, 6 and 11 on 2.4 GHz and gave neighbours different 5 GHz channels. At CCNP level you must know the sub-bands of 5 GHz and their rules, what 6 GHz brings, how channel width trades capacity for speed, how to tell Wi-Fi interference from non-Wi-Fi interference, and how the controller's Radio Resource Management (RRM) keeps the plan healthy.</p>

<h3>An analogy: lanes on a motorway</h3>
<p>Each channel is a lane. Wider lanes (40, 80, 160 MHz) let bigger lorries through faster, but the motorway has a fixed width, so wide lanes mean fewer lanes. Cars in the same lane must take turns (<b>co-channel contention</b>). A lane painted half over another causes crashes (<b>adjacent-channel interference</b>). A tractor that is not a car at all (a microwave oven, a video sender) ignores the rules and blocks the lane (<b>non-Wi-Fi interference</b>). RRM is the traffic authority that repaints lanes and sets speed limits every few minutes.</p>

<h3>The three bands at CCNP depth</h3>
<table class="cmp"><tr><th>Band</th><th>20 MHz channels</th><th>Notes</th></tr>
<tr><td><b>2.4 GHz</b> (2.400–2.4835 GHz)</td><td>1–13 (1–11 in some countries); only 1, 6, 11 do not overlap</td><td>Long range, crowded, Bluetooth and microwave ovens. Use 20 MHz only.</td></tr>
<tr><td><b>5 GHz UNII-1</b></td><td>36, 40, 44, 48</td><td>Indoor use, no radar detection</td></tr>
<tr><td><b>5 GHz UNII-2</b></td><td>52–64</td><td><b>DFS</b> required (radar detection)</td></tr>
<tr><td><b>5 GHz UNII-2 Extended</b></td><td>100–144</td><td>DFS required; often the most channels</td></tr>
<tr><td><b>5 GHz UNII-3</b></td><td>149–165</td><td>Higher power allowed in many countries</td></tr>
<tr><td><b>6 GHz</b> (5.925–7.125 GHz)</td><td>up to 59 channels of 20 MHz (1, 5, 9 … 233)</td><td>Wi-Fi 6E/7 only; WPA3 or OWE mandatory; no legacy clients. Availability depends on the country.</td></tr></table>
<p><b>DFS</b> (Dynamic Frequency Selection): on UNII-2 and UNII-2e the AP must listen for weather and military radar. Before using a channel it performs a channel availability check (typically 60 seconds), and if it detects radar while running it must leave the channel within seconds and avoid it for at least 30 minutes. Clients drop or roam when this happens. Some older clients do not support DFS channels at all.</p>
<p>In 6 GHz, clients do not scan all 59 channels. APs advertise their 6 GHz radio in 2.4/5 GHz beacons (reduced neighbour reports), and 15 <b>preferred scanning channels</b> (PSC, every fourth 20 MHz channel) are used so clients can find a 6 GHz-only AP quickly. Regulators differ: in India (regulatory domain IN) the licence-free indoor 6 GHz band is only the lower part, 5925 to 6425 MHz, which gives 24 channels of 20 MHz, not 59, as far as the rules in 2025 go. Always check your own country's current rules and the controller's channel list.</p>

<h3>Channel width: speed versus capacity</h3>
<table class="cmp"><tr><th>Width</th><th>Non-overlapping 5 GHz channels (roughly, country-dependent)</th><th>6 GHz channels</th></tr>
<tr><td>20 MHz</td><td>about 25</td><td>59</td></tr>
<tr><td>40 MHz</td><td>about 12</td><td>29</td></tr>
<tr><td>80 MHz</td><td>about 6</td><td>14</td></tr>
<tr><td>160 MHz</td><td>2</td><td>7</td></tr>
<tr><td>320 MHz (Wi-Fi 7)</td><td>—</td><td>3</td></tr></table>
<p>Doubling the width roughly doubles one client's peak rate, but halves the number of channels you can reuse and adds about 3 dB of noise (a wider receiver hears more noise). In a dense office, <b>20 or 40 MHz on 5 GHz</b> usually beats 80 MHz, because more APs on different channels serve more users in total. 6 GHz, with so many channels, makes 80 and 160 MHz practical.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Co-channel versus adjacent-channel">
<rect x="20" y="40" width="280" height="120" rx="10" fill="#e2e8f0"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Co-channel: both on 36</text>
<circle cx="100" cy="100" r="45" fill="#bae6fd" fill-opacity="0.7"/><circle cx="210" cy="100" r="45" fill="#bae6fd" fill-opacity="0.7"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP1 ch36</text><text x="210" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP2 ch36</text>
<text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">they take turns: capacity shared</text>
<rect x="340" y="40" width="280" height="120" rx="10" fill="#e2e8f0"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">Adjacent: 2.4 GHz ch 1 and 3</text>
<circle cx="420" cy="100" r="45" fill="#fed7aa" fill-opacity="0.8"/><circle cx="530" cy="100" r="45" fill="#fde68a" fill-opacity="0.8"/><text x="420" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP3 ch1</text><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP4 ch3</text>
<text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">frames corrupted: worse</text>
</svg><p class="cap">Co-channel contention shares airtime politely; adjacent-channel overlap corrupts frames.</p></div>

<h3>Interference and noise</h3>
<ul><li><b>Co-channel interference (CCI)</b>, better called co-channel <b>contention</b>: other Wi-Fi on the same channel. CSMA/CA makes everyone wait; airtime is shared. Cure: more channels, smaller cells (lower power), BSS colouring in Wi-Fi 6 (chapter 5).</li>
<li><b>Adjacent-channel interference (ACI)</b>: overlapping channels (2.4 GHz 1 and 3, or a 40 MHz channel overlapping a neighbour's 20 MHz primary). Receivers cannot decode; frames are lost and retried.</li>
<li><b>Non-Wi-Fi interference</b>: microwave ovens (2.4 GHz, around channels 9–11), Bluetooth (frequency hopping), wireless video cameras, cordless phones, jammers. These devices do not speak 802.11, so they raise the <b>noise floor</b> and the <b>duty cycle</b> (the percentage of time the energy is present). Only a <b>spectrum analyser</b> sees them; Cisco's <b>CleanAir</b> radios classify them and report an Air Quality index.</li></ul>

<h3>RRM: letting the controller plan</h3>
<p>Radio Resource Management runs on the controller (the RF group leader) using measurements the APs make by briefly scanning other channels:</p>
<ul><li><b>DCA</b> (Dynamic Channel Assignment): picks channels to minimise co-channel and adjacent interference, considering noise, load and neighbours.</li>
<li><b>TPC</b> (Transmit Power Control): lowers power when an AP hears enough neighbours (by default it aims for the third-strongest neighbour to be heard around −70 dBm), shrinking cells.</li>
<li><b>CHD</b> (Coverage Hole Detection): if too many clients have poor RSSI and SNR, raises power locally.</li>
<li><b>RF grouping</b>: controllers that hear each other's APs form an RF group with one leader that runs DCA and TPC for all.</li></ul>
<p>On a Catalyst 9800, <b>RF profiles</b> (grouped in an RF tag) set allowed channels, widths, data rates and TPC thresholds per area, for example a high-density profile for an auditorium.</p>
<pre class="code"><span class="c">! Lab controller (9800-style CLI): read the plan, then pin a channel and power (GUI: Monitoring &gt; Wireless &gt; Radios shows the result)</span>
WLC1# show ap dot11 5ghz summary
WLC1# ap name AP2 dot11 5ghz channel 44
WLC1# ap name AP2 dot11 5ghz txpower 3
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name             Subband  Radio Mac       Status    Channel  Power Level  Width
----------------------------------------------------------------------------------
AP1                 All      0050.42a6.9810  Enabled   36       1            <span class="hl">20 MHz</span>
AP2                 All      0050.43a6.9a10  Enabled   <span class="hl">44</span>       <span class="hl">3</span>            20 MHz</pre>

<div class="eg"><p><b>Worked example.</b> A floor with 12 APs. At 80 MHz you have about 6 clean 5 GHz channels (fewer if DFS channels are excluded), so every channel is reused twice and neighbouring APs contend. At 40 MHz you have about 12 channels: each AP gets its own. Per-client peak speed halves, but total floor capacity roughly doubles and latency drops. In a lecture hall with 300 students, capacity wins.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling 80 MHz everywhere because "it is faster". (2) Excluding all DFS channels out of fear, leaving only UNII-1 and UNII-3 and forcing reuse. (3) Fixing channels by hand and then forgetting them when the building changes; pinned channels do not adapt.</p></div>

<div class="exam"><p><b>Exam traps.</b> DFS applies to UNII-2 and UNII-2 Extended (52–144), not to 36–48. Non-Wi-Fi interference is found with spectrum analysis (CleanAir, SE-Connect mode), not with a normal Wi-Fi scan. TPC lowers power; CHD raises it. 6 GHz requires WPA3 or OWE.</p></div>

<div class="scn"><h4>Lunchtime Wi-Fi collapse</h4><p>Every day between 12:30 and 13:30 the cafeteria's 2.4 GHz clients disconnected. Channel utilisation looked normal but retries were huge. The engineer checked CleanAir: "Microwave oven, duty cycle 50 %, channels 8–13, severity high". The APs near the kitchen were on channel 11. The fix: steer dual-band clients to 5 GHz (band select), move the nearest APs to channel 1, and reduce 2.4 GHz power in the kitchen area.</p><p><b>Lesson:</b> when retries are high but Wi-Fi utilisation is not, suspect non-Wi-Fi interference and look at the spectrum.</p></div>

<div class="iv"><p class="q">"Would you use 80 MHz channels in an office?"</p><p>Strong answer: it depends on density. In a dense office on 5 GHz I prefer 20 or 40 MHz so each AP gets its own channel and total capacity is higher; 80 MHz only where there are few APs or plenty of channels, such as 6 GHz. Mention DFS channels, the 3 dB noise penalty of wider channels, and that RRM/DCA with RF profiles can set width per area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>5 GHz sub-bands: UNII-1 36–48, UNII-2 52–64 (DFS), UNII-2e 100–144 (DFS), UNII-3 149–165.</li>
<li>6 GHz: up to 59 × 20 MHz channels, PSCs for discovery, WPA3/OWE only.</li>
<li>Wider channels mean more speed per client but fewer channels and less total capacity.</li>
<li>CCI shares airtime, ACI corrupts frames, non-Wi-Fi interference needs spectrum analysis.</li>
<li>RRM: DCA picks channels, TPC lowers power, CHD fills coverage holes; RF profiles tune it per area.</li>
</ul></div>
`,hi:`
<p>CCNA mein aapne 2.4 GHz par 1, 6 aur 11 plan kiye aur padosiyon ko alag 5 GHz channels diye. CCNP level par aapko 5 GHz ke sub-bands aur unke rules jaanne hain, 6 GHz kya laata hai, channel width speed ke badle capacity kaise deti hai, Wi-Fi interference ko non-Wi-Fi interference se kaise alag pehchano, aur controller ka Radio Resource Management (RRM) plan ko healthy kaise rakhta hai.</p>

<h3>Ek analogy: motorway par lanes</h3>
<p>Har channel ek lane hai. Chaudi lanes (40, 80, 160 MHz) bade trucks ko tez nikaalti hain, lekin motorway ki chaudai fixed hai, to chaudi lanes matlab kam lanes. Ek lane mein cars ko baari-baari chalna padta hai (<b>co-channel contention</b>). Ek lane jo aadhi doosri par paint ho, accidents karaati hai (<b>adjacent-channel interference</b>). Ek tractor jo car hai hi nahi (microwave oven, video sender) rules nahi maanta aur lane block karta hai (<b>non-Wi-Fi interference</b>). RRM traffic authority hai jo har kuch minute mein lanes dobara paint karti hai aur speed limits set karti hai.</p>

<h3>CCNP depth par teen bands</h3>
<table class="cmp"><tr><th>Band</th><th>20 MHz channels</th><th>Notes</th></tr>
<tr><td><b>2.4 GHz</b> (2.400–2.4835 GHz)</td><td>1–13 (kuch deshon mein 1–11); sirf 1, 6, 11 overlap nahi karte</td><td>Lambi range, bheed, Bluetooth aur microwave ovens. Sirf 20 MHz use karo.</td></tr>
<tr><td><b>5 GHz UNII-1</b></td><td>36, 40, 44, 48</td><td>Indoor use, radar detection nahi</td></tr>
<tr><td><b>5 GHz UNII-2</b></td><td>52–64</td><td><b>DFS</b> zaroori (radar detection)</td></tr>
<tr><td><b>5 GHz UNII-2 Extended</b></td><td>100–144</td><td>DFS zaroori; aksar sabse zyada channels</td></tr>
<tr><td><b>5 GHz UNII-3</b></td><td>149–165</td><td>Kai deshon mein zyada power allowed</td></tr>
<tr><td><b>6 GHz</b> (5.925–7.125 GHz)</td><td>20 MHz ke 59 channels tak (1, 5, 9 … 233)</td><td>Sirf Wi-Fi 6E/7; WPA3 ya OWE zaroori; legacy clients nahi. Availability desh par depend karti hai.</td></tr></table>
<p><b>DFS</b> (Dynamic Frequency Selection): UNII-2 aur UNII-2e par AP ko weather aur military radar sunna padta hai. Channel use karne se pehle woh channel availability check karta hai (aam taur par 60 seconds), aur chalte hue radar mile to use kuch seconds mein channel chhodna padta hai aur kam se kam 30 minute us channel se door rehna padta hai. Aisa hone par clients drop ya roam karte hain. Kuch purane clients DFS channels support hi nahi karte.</p>
<p>6 GHz mein clients saare 59 channels scan nahi karte. APs apna 6 GHz radio 2.4/5 GHz beacons mein advertise karte hain (reduced neighbour reports), aur 15 <b>preferred scanning channels</b> (PSC, har chautha 20 MHz channel) use hote hain taaki clients 6 GHz-only AP jaldi dhoondh sakein. Regulators alag hote hain: India (regulatory domain IN) mein licence-free indoor 6 GHz band sirf neeche wala hissa hai, 5925 se 6425 MHz, yaani 20 MHz ke 24 channels, 59 nahi, jaisa 2025 ke rules mein hai. Hamesha apne desh ke current rules aur controller ki channel list dekho.</p>

<h3>Channel width: speed vs capacity</h3>
<table class="cmp"><tr><th>Width</th><th>Non-overlapping 5 GHz channels (lagbhag, desh ke hisaab se)</th><th>6 GHz channels</th></tr>
<tr><td>20 MHz</td><td>lagbhag 25</td><td>59</td></tr>
<tr><td>40 MHz</td><td>lagbhag 12</td><td>29</td></tr>
<tr><td>80 MHz</td><td>lagbhag 6</td><td>14</td></tr>
<tr><td>160 MHz</td><td>2</td><td>7</td></tr>
<tr><td>320 MHz (Wi-Fi 7)</td><td>—</td><td>3</td></tr></table>
<p>Width double karne se ek client ka peak rate lagbhag double hota hai, par reuse karne layak channels aadhe ho jaate hain aur lagbhag 3 dB noise badhta hai (chauda receiver zyada noise sunta hai). Ghane office mein <b>5 GHz par 20 ya 40 MHz</b> aam taur par 80 MHz se behtar hai, kyunki alag channels par zyada APs total zyada users serve karte hain. 6 GHz, itne channels ke saath, 80 aur 160 MHz ko practical banata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Co-channel vs adjacent-channel">
<rect x="20" y="40" width="280" height="120" rx="10" fill="#e2e8f0"/><text x="160" y="30" text-anchor="middle" class="svg-ink" font-size="13">Co-channel: dono 36 par</text>
<circle cx="100" cy="100" r="45" fill="#bae6fd" fill-opacity="0.7"/><circle cx="210" cy="100" r="45" fill="#bae6fd" fill-opacity="0.7"/><text x="100" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP1 ch36</text><text x="210" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP2 ch36</text>
<text x="160" y="178" text-anchor="middle" class="svg-muted" font-size="12">baari-baari bolte hain: capacity bant-ti hai</text>
<rect x="340" y="40" width="280" height="120" rx="10" fill="#e2e8f0"/><text x="480" y="30" text-anchor="middle" class="svg-ink" font-size="13">Adjacent: 2.4 GHz ch 1 aur 3</text>
<circle cx="420" cy="100" r="45" fill="#fed7aa" fill-opacity="0.8"/><circle cx="530" cy="100" r="45" fill="#fde68a" fill-opacity="0.8"/><text x="420" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP3 ch1</text><text x="530" y="104" text-anchor="middle" class="svg-ink" font-size="13">AP4 ch3</text>
<text x="480" y="178" text-anchor="middle" class="svg-muted" font-size="12">frames kharab: aur bura</text>
</svg><p class="cap">Co-channel contention airtime tameez se share karta hai; adjacent-channel overlap frames kharab karta hai.</p></div>

<h3>Interference aur noise</h3>
<ul><li><b>Co-channel interference (CCI)</b>, behtar naam co-channel <b>contention</b>: same channel par doosra Wi-Fi. CSMA/CA sabko wait karata hai; airtime share hota hai. Ilaaj: zyada channels, chhote cells (kam power), Wi-Fi 6 mein BSS colouring (chapter 5).</li>
<li><b>Adjacent-channel interference (ACI)</b>: overlapping channels (2.4 GHz 1 aur 3, ya 40 MHz channel jo padosi ke 20 MHz primary par chadh jaaye). Receivers decode nahi kar paate; frames kho jaate hain aur retry hote hain.</li>
<li><b>Non-Wi-Fi interference</b>: microwave ovens (2.4 GHz, channels 9–11 ke aas paas), Bluetooth (frequency hopping), wireless video cameras, cordless phones, jammers. Yeh devices 802.11 nahi bolte, isliye <b>noise floor</b> aur <b>duty cycle</b> (kitne percent time energy maujood hai) badhaate hain. Sirf <b>spectrum analyser</b> inhe dekhta hai; Cisco ke <b>CleanAir</b> radios inhe classify karke Air Quality index report karte hain.</li></ul>

<h3>RRM: controller ko plan karne do</h3>
<p>Radio Resource Management controller (RF group leader) par chalta hai, un measurements se jo APs thodi der doosre channels scan karke lete hain:</p>
<ul><li><b>DCA</b> (Dynamic Channel Assignment): noise, load aur padosiyon ko dekhte hue co-channel aur adjacent interference kam karne wale channels chunta hai.</li>
<li><b>TPC</b> (Transmit Power Control): jab AP kaafi padosi sunta hai to power kam karta hai (default mein target hota hai ki teesra sabse strong padosi lagbhag −70 dBm par sunai de), cells chhote karta hai.</li>
<li><b>CHD</b> (Coverage Hole Detection): agar bahut clients ka RSSI aur SNR kharab ho, to wahan power badhata hai.</li>
<li><b>RF grouping</b>: jo controllers ek doosre ke APs sunte hain woh ek RF group banate hain jiska ek leader sabke liye DCA aur TPC chalata hai.</li></ul>
<p>Catalyst 9800 par <b>RF profiles</b> (RF tag mein grouped) har area ke liye allowed channels, widths, data rates aur TPC thresholds set karte hain, jaise auditorium ke liye high-density profile.</p>
<pre class="code"><span class="c">! Lab controller (9800-style CLI): plan padho, phir channel aur power pin karo (GUI: Monitoring &gt; Wireless &gt; Radios result dikhata hai)</span>
WLC1# show ap dot11 5ghz summary
WLC1# ap name AP2 dot11 5ghz channel 44
WLC1# ap name AP2 dot11 5ghz txpower 3
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name             Subband  Radio Mac       Status    Channel  Power Level  Width
----------------------------------------------------------------------------------
AP1                 All      0050.42a6.9810  Enabled   36       1            <span class="hl">20 MHz</span>
AP2                 All      0050.43a6.9a10  Enabled   <span class="hl">44</span>       <span class="hl">3</span>            20 MHz</pre>

<div class="eg"><p><b>Worked example.</b> Ek floor par 12 APs. 80 MHz par lagbhag 6 clean 5 GHz channels hain (DFS channels hataao to aur kam), to har channel do baar reuse hota hai aur padosi APs contend karte hain. 40 MHz par lagbhag 12 channels: har AP ko apna. Per-client peak speed aadhi, par floor ki total capacity lagbhag double aur latency kam. 300 students wale lecture hall mein capacity jeetti hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Tez hai" soch kar har jagah 80 MHz enable karna. (2) Darr se saare DFS channels hata dena, sirf UNII-1 aur UNII-3 bachte hain aur reuse karna padta hai. (3) Haath se channels fix karke building badalne par unhe bhool jaana; pinned channels adapt nahi karte.</p></div>

<div class="exam"><p><b>Exam traps.</b> DFS UNII-2 aur UNII-2 Extended (52–144) par lagta hai, 36–48 par nahi. Non-Wi-Fi interference spectrum analysis (CleanAir, SE-Connect mode) se milta hai, normal Wi-Fi scan se nahi. TPC power ghatata hai; CHD badhata hai. 6 GHz ko WPA3 ya OWE chahiye.</p></div>

<div class="scn"><h4>Lunch time par Wi-Fi dhadaam</h4><p>Roz 12:30 se 13:30 ke beech cafeteria ke 2.4 GHz clients disconnect ho jaate the. Channel utilisation normal dikhta tha par retries bahut zyada the. Engineer ne CleanAir check kiya: "Microwave oven, duty cycle 50 %, channels 8–13, severity high". Kitchen ke paas ke APs channel 11 par the. Fix: dual-band clients ko 5 GHz par steer karo (band select), sabse paas ke APs ko channel 1 par le jao, aur kitchen area mein 2.4 GHz power kam karo.</p><p><b>Lesson:</b> jab retries zyada hon par Wi-Fi utilisation nahi, to non-Wi-Fi interference par shak karo aur spectrum dekho.</p></div>

<div class="iv"><p class="q">"Kya aap office mein 80 MHz channels use karoge?"</p><p>Strong answer: density par depend karta hai. Ghane office mein 5 GHz par main 20 ya 40 MHz pasand karunga taaki har AP ko apna channel mile aur total capacity zyada ho; 80 MHz sirf wahan jahan kam APs hon ya bahut channels hon, jaise 6 GHz. DFS channels, chaude channels ki 3 dB noise penalty, aur yeh batao ki RRM/DCA RF profiles ke saath har area ki width set kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>5 GHz sub-bands: UNII-1 36–48, UNII-2 52–64 (DFS), UNII-2e 100–144 (DFS), UNII-3 149–165.</li>
<li>6 GHz: 59 tak × 20 MHz channels, discovery ke liye PSCs, sirf WPA3/OWE.</li>
<li>Chaude channels matlab per client zyada speed, par kam channels aur kam total capacity.</li>
<li>CCI airtime share karta hai, ACI frames kharab karta hai, non-Wi-Fi interference ko spectrum analysis chahiye.</li>
<li>RRM: DCA channels chunta hai, TPC power ghatata hai, CHD coverage holes bharta hai; RF profiles ise area ke hisaab se tune karte hain.</li>
</ul></div>
`}};export{e as default};