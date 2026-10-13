var e={id:`channels`,h:{en:`Channels: 2.4, 5 and 6 GHz, overlap, width and bonding`,hi:`Channels: 2.4, 5 aur 6 GHz, overlap, width aur bonding`},body:{en:`
<p>Tune an FM radio. Each station sits at its own frequency, 91.1, 93.5, 98.3, with a gap between them. If two stations were only a tiny step apart, you would hear both at once, a garbled mess. Wi-Fi <b>channels</b> are the same idea: each channel is a slice of spectrum defined by a <b>centre frequency</b> and a <b>width</b>. Neighbouring APs must sit on slices that do not overlap, or they talk over each other.</p>

<h3>The 2.4 GHz band: only three clean channels</h3>
<p>2.4 GHz is split into channels 1 to 13 (channel 14 exists only in Japan for old 802.11b). The centre of each channel is <b>2407 + 5 × channel number</b> MHz, so the centres are only <b>5 MHz apart</b>. But a Wi-Fi signal is about <b>20 MHz</b> wide (22 MHz for old 802.11b DSSS). A signal on channel 1 therefore spills over channels 2, 3, 4 and 5. To avoid overlap, channels must be at least five numbers apart, which leaves exactly three: <b>1, 6 and 11</b>.</p>

<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="170" x2="610" y2="170" stroke="#64748b" stroke-width="1.5"/>
<path d="M71 170 Q146 50 221 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M105 170 Q180 50 255 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M139 170 Q214 50 289 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M173 170 Q248 50 323 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M242 170 Q317 50 392 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M276 170 Q351 50 426 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M310 170 Q385 50 460 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M344 170 Q419 50 494 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M37 170 Q112 50 187 170" fill="#bae6fd" fill-opacity="0.7" stroke="#0284c7" stroke-width="2"/>
<path d="M208 170 Q283 50 358 170" fill="#bbf7d0" fill-opacity="0.7" stroke="#16a34a" stroke-width="2"/>
<path d="M378 170 Q453 50 528 170" fill="#fde68a" fill-opacity="0.7" stroke="#d97706" stroke-width="2"/>
<text x="112" y="188" text-anchor="middle" class="svg-accent" font-size="13">1</text>
<text x="283" y="188" text-anchor="middle" class="svg-accent" font-size="13">6</text>
<text x="453" y="188" text-anchor="middle" class="svg-accent" font-size="13">11</text>
<text x="112" y="205" text-anchor="middle" class="svg-muted" font-size="12">2412 MHz</text>
<text x="283" y="205" text-anchor="middle" class="svg-muted" font-size="12">2437 MHz</text>
<text x="453" y="205" text-anchor="middle" class="svg-muted" font-size="12">2462 MHz</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">dashed = channels 2-5 and 7-10, overlapping</text>
</svg><p class="cap">Channels 1, 6 and 11 are 25 MHz apart, more than one signal width, so they do not overlap. Every channel in between overlaps its neighbours.</p></div>

<h3>Co-channel versus adjacent-channel interference</h3>
<dl class="terms">
<dt>Co-channel interference (CCI)</dt><dd>Two APs on the <b>same</b> channel can hear each other. They decode each other's frames and politely take turns with CSMA/CA. Nothing is corrupted, but the airtime is shared, so each cell gets less capacity. Better called <b>co-channel contention</b>.</dd>
<dt>Adjacent-channel interference (ACI)</dt><dd>Two APs on <b>overlapping</b> channels, for example 1 and 3. They cannot decode each other, so they do not wait; their energy simply collides and corrupts frames, causing retries. ACI is worse than CCI.</dd>
</dl>

<h3>The 5 GHz band</h3>
<p>In 5 GHz the centre frequency is <b>5000 + 5 × channel</b> MHz, and 20 MHz channels are numbered in steps of four: 36, 40, 44, 48 and so on. Because each step is 20 MHz, <b>every 20 MHz channel is non-overlapping</b>. The band is divided into U-NII sub-bands:</p>
<table class="cmp"><tr><th>Sub-band</th><th>Channels</th><th>Notes</th></tr>
<tr><td>U-NII-1</td><td>36, 40, 44, 48</td><td>Indoor, no radar checks</td></tr>
<tr><td>U-NII-2A</td><td>52, 56, 60, 64</td><td>DFS required</td></tr>
<tr><td>U-NII-2C (extended)</td><td>100 to 144</td><td>DFS required</td></tr>
<tr><td>U-NII-3</td><td>149, 153, 157, 161, 165</td><td>Higher power allowed in many countries</td></tr></table>
<p><b>DFS</b> (dynamic frequency selection) protects weather and military radar. Before using a DFS channel, an AP must listen for radar (normally 60 seconds). If it detects radar while operating, it must leave the channel quickly and avoid it for 30 minutes. The exact channel list and power limits depend on the country's regulatory domain.</p>

<h3>The 6 GHz band</h3>
<p>6 GHz spans up to 1200 MHz (5925 to 7125 MHz), where the regulator permits it; some countries open only the lower 500 MHz. It holds up to <b>59 channels of 20 MHz</b>, numbered 1, 5, 9 up to 233, with centre = 5950 + 5 × channel. Only Wi-Fi 6E and Wi-Fi 7 devices can use it, there are no legacy clients, and <b>WPA3 is mandatory</b>. To avoid scanning 59 channels, clients look first at 15 <b>preferred scanning channels</b> (PSC), one in every 80 MHz block.</p>

<h3>Channel width and bonding</h3>
<p><b>Channel bonding</b> joins adjacent 20 MHz channels into a wider one: 40 MHz (two), 80 MHz (four), 160 MHz (eight), and 320 MHz (sixteen, Wi-Fi 7 in 6 GHz only). One 20 MHz part is the <b>primary channel</b>, used for control frames and legacy clients. Doubling the width roughly doubles the data rate, but it halves the number of non-overlapping channels and raises the noise floor by about 3 dB, which lowers SNR.</p>
<table class="cmp"><tr><th>Width</th><th>2.4 GHz</th><th>5 GHz (typical, all U-NII bands)</th><th>6 GHz (full 1200 MHz)</th></tr>
<tr><td>20 MHz</td><td>3</td><td>about 25</td><td>59</td></tr>
<tr><td>40 MHz</td><td>1 (never use)</td><td>about 12</td><td>29</td></tr>
<tr><td>80 MHz</td><td>none</td><td>about 6</td><td>14</td></tr>
<tr><td>160 MHz</td><td>none</td><td>about 2</td><td>7</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Channel 11 in 2.4 GHz: 2407 + 5 × 11 = <b>2462 MHz</b>. Channels 1 (2412) and 6 (2437) are 25 MHz apart, more than 20 MHz, so no overlap. Channels 1 and 4 (2427) are only 15 MHz apart: overlap. In 5 GHz, channel 36 = 5000 + 180 = <b>5180 MHz</b>; bonding 36 and 40 into 40 MHz gives a channel centred on 5190 MHz, written as 38.</p></div>

<p>In the lab, the 5 GHz fix gives the three neighbours different 20 MHz channels:</p>
<pre class="code">(WLC1) &gt;config 802.11a channel ap AP2 40
(WLC1) &gt;config 802.11a channel ap AP3 44
(WLC1) &gt;show advanced 802.11a channel</pre>
<pre class="out">802.11a/n/ac (5 GHz) channel plan   (every 20 MHz channel is non-overlapping)
Network status................................... Enabled

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            36       5180      1 (20 dBm)   Up        -
AP2            40       5200      1 (20 dBm)   Up        -
AP3            44       5220      1 (20 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>

<div class="warn"><p><b>Common mistake.</b> Enabling 40 MHz on 2.4 GHz "for speed". It uses two of the three usable channels and overlaps every neighbour. Keep 2.4 GHz at 20 MHz, and in dense 5 GHz offices prefer 20 or 40 MHz so you have enough channels to reuse.</p></div>

<div class="exam"><p><b>Exam trap.</b> 2.4 GHz non-overlapping channels are <b>1, 6 and 11</b>, not 1, 5, 9 or 2, 7, 12. Channels are 5 MHz apart but signals are 20 to 22 MHz wide. In 5 GHz every 20 MHz channel is non-overlapping. Adjacent-channel interference is worse than co-channel interference.</p></div>

<div class="scn"><h4>Clients dropping near the airport</h4><p>An office near an airport reported that laptops on one floor disconnected for a few seconds several times a day. The controller log showed radar detected on channel 100, and the AP moving to channel 36 and then waiting before returning. The APs were on DFS channels, and each radar hit forced a channel change that dropped clients. The engineer excluded the affected DFS channels for that building and used U-NII-1 and U-NII-3 channels instead.</p><p><b>Lesson:</b> DFS channels add capacity, but near radar they cause channel changes; check the logs and exclude channels where needed.</p></div>

<div class="iv"><p class="q">"Why are only channels 1, 6 and 11 recommended on 2.4 GHz?"</p><p>Strong answer: 2.4 GHz channel centres are 5 MHz apart but each 802.11 signal is about 20 to 22 MHz wide, so a channel overlaps the four channels on each side. Only channels five apart, 1, 6 and 11 at 2412, 2437 and 2462 MHz, avoid overlap. Overlapping channels cause adjacent-channel interference, which corrupts frames; using the same channel only causes contention. Contrast with 5 GHz, where all 20 MHz channels are non-overlapping.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz: centre = 2407 + 5 × ch; only 1, 6 and 11 are non-overlapping.</li>
<li>5 GHz: centre = 5000 + 5 × ch; every 20 MHz channel (36, 40, 44, …) is non-overlapping; DFS channels must avoid radar.</li>
<li>6 GHz: up to 59 × 20 MHz channels, Wi-Fi 6E/7 only, WPA3 mandatory, 15 PSCs.</li>
<li>Bonding to 40/80/160/320 MHz raises speed but reduces the number of channels and SNR.</li>
<li>Co-channel = contention; adjacent-channel = corruption, which is worse.</li>
</ul></div>
`,hi:`
<p>FM radio tune karo. Har station apni frequency par baitha hai, 91.1, 93.5, 98.3, beech mein gap ke saath. Agar do stations sirf ek chhote step ki doori par hote, to aap dono ek saath sunte, ek bigdi hui khichdi. Wi-Fi <b>channels</b> bhi yahi idea hain: har channel spectrum ka ek tukda hai jo <b>centre frequency</b> aur <b>width</b> se define hota hai. Padosi APs ko aise tukdon par baithna chahiye jo overlap na karein, warna woh ek doosre ke upar bolte hain.</p>

<h3>2.4 GHz band: sirf teen clean channels</h3>
<p>2.4 GHz channels 1 se 13 mein bata hai (channel 14 sirf Japan mein purane 802.11b ke liye hai). Har channel ka centre <b>2407 + 5 × channel number</b> MHz hai, isliye centres sirf <b>5 MHz door</b> hain. Par ek Wi-Fi signal lagbhag <b>20 MHz</b> chauda hota hai (purane 802.11b DSSS ke liye 22 MHz). Isliye channel 1 ka signal channels 2, 3, 4 aur 5 par phail jaata hai. Overlap se bachne ke liye channels kam se kam paanch number door hone chahiye, jisse bilkul teen bachte hain: <b>1, 6 aur 11</b>.</p>

<div class="dia"><svg viewBox="0 0 640 215" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="170" x2="610" y2="170" stroke="#64748b" stroke-width="1.5"/>
<path d="M71 170 Q146 50 221 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M105 170 Q180 50 255 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M139 170 Q214 50 289 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M173 170 Q248 50 323 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M242 170 Q317 50 392 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M276 170 Q351 50 426 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M310 170 Q385 50 460 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M344 170 Q419 50 494 170" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
<path d="M37 170 Q112 50 187 170" fill="#bae6fd" fill-opacity="0.7" stroke="#0284c7" stroke-width="2"/>
<path d="M208 170 Q283 50 358 170" fill="#bbf7d0" fill-opacity="0.7" stroke="#16a34a" stroke-width="2"/>
<path d="M378 170 Q453 50 528 170" fill="#fde68a" fill-opacity="0.7" stroke="#d97706" stroke-width="2"/>
<text x="112" y="188" text-anchor="middle" class="svg-accent" font-size="13">1</text>
<text x="283" y="188" text-anchor="middle" class="svg-accent" font-size="13">6</text>
<text x="453" y="188" text-anchor="middle" class="svg-accent" font-size="13">11</text>
<text x="112" y="205" text-anchor="middle" class="svg-muted" font-size="12">2412 MHz</text>
<text x="283" y="205" text-anchor="middle" class="svg-muted" font-size="12">2437 MHz</text>
<text x="453" y="205" text-anchor="middle" class="svg-muted" font-size="12">2462 MHz</text>
<text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">dashed = channels 2-5 aur 7-10, overlapping</text>
</svg><p class="cap">Channels 1, 6 aur 11 ke beech 25 MHz ka gap hai, ek signal width se zyada, isliye woh overlap nahi karte. Beech ka har channel apne padosiyon se overlap karta hai.</p></div>

<h3>Co-channel vs adjacent-channel interference</h3>
<dl class="terms">
<dt>Co-channel interference (CCI)</dt><dd>Do APs <b>same</b> channel par ek doosre ko sun sakte hain. Woh ek doosre ke frames decode karte hain aur CSMA/CA se tameez se baari lete hain. Kuch corrupt nahi hota, par airtime share hota hai, isliye har cell ko kam capacity milti hai. Ise behtar <b>co-channel contention</b> kehna hai.</dd>
<dt>Adjacent-channel interference (ACI)</dt><dd>Do APs <b>overlapping</b> channels par, jaise 1 aur 3. Woh ek doosre ko decode nahi kar sakte, isliye wait nahi karte; unki energy bas takraati hai aur frames corrupt karti hai, jisse retries hote hain. ACI, CCI se bura hai.</dd>
</dl>

<h3>5 GHz band</h3>
<p>5 GHz mein centre frequency <b>5000 + 5 × channel</b> MHz hai, aur 20 MHz channels chaar ke steps mein numbered hain: 36, 40, 44, 48 wagairah. Kyunki har step 20 MHz hai, <b>har 20 MHz channel non-overlapping hai</b>. Band U-NII sub-bands mein bata hai:</p>
<table class="cmp"><tr><th>Sub-band</th><th>Channels</th><th>Notes</th></tr>
<tr><td>U-NII-1</td><td>36, 40, 44, 48</td><td>Indoor, radar checks nahi</td></tr>
<tr><td>U-NII-2A</td><td>52, 56, 60, 64</td><td>DFS zaroori</td></tr>
<tr><td>U-NII-2C (extended)</td><td>100 se 144</td><td>DFS zaroori</td></tr>
<tr><td>U-NII-3</td><td>149, 153, 157, 161, 165</td><td>Kai deshon mein zyada power allowed</td></tr></table>
<p><b>DFS</b> (dynamic frequency selection) mausam aur military radar ko bachata hai. DFS channel use karne se pehle AP ko radar ke liye sunna padta hai (normally 60 seconds). Chalte waqt radar mile to use channel jaldi chhodna padta hai aur 30 minute tak usse door rehna padta hai. Exact channel list aur power limits desh ke regulatory domain par depend karte hain.</p>

<h3>6 GHz band</h3>
<p>6 GHz 1200 MHz tak phaila hai (5925 se 7125 MHz), jahan regulator allow kare; kuch desh sirf neeche ke 500 MHz kholte hain. Isme <b>20 MHz ke 59 channels</b> tak hain, numbered 1, 5, 9 se 233 tak, centre = 5950 + 5 × channel. Sirf Wi-Fi 6E aur Wi-Fi 7 devices ise use kar sakte hain, koi legacy clients nahi, aur <b>WPA3 mandatory</b> hai. 59 channels scan karne se bachne ke liye clients pehle 15 <b>preferred scanning channels</b> (PSC) dekhte hain, har 80 MHz block mein ek.</p>

<h3>Channel width aur bonding</h3>
<p><b>Channel bonding</b> paas ke 20 MHz channels ko jod kar ek chauda channel banata hai: 40 MHz (do), 80 MHz (chaar), 160 MHz (aath), aur 320 MHz (solah, sirf 6 GHz mein Wi-Fi 7). Ek 20 MHz hissa <b>primary channel</b> hota hai, control frames aur legacy clients ke liye. Width double karne se data rate lagbhag double hota hai, par non-overlapping channels ki sankhya aadhi ho jaati hai aur noise floor lagbhag 3 dB badhta hai, jo SNR kam karta hai.</p>
<table class="cmp"><tr><th>Width</th><th>2.4 GHz</th><th>5 GHz (typical, saare U-NII bands)</th><th>6 GHz (poora 1200 MHz)</th></tr>
<tr><td>20 MHz</td><td>3</td><td>lagbhag 25</td><td>59</td></tr>
<tr><td>40 MHz</td><td>1 (kabhi use mat karo)</td><td>lagbhag 12</td><td>29</td></tr>
<tr><td>80 MHz</td><td>koi nahi</td><td>lagbhag 6</td><td>14</td></tr>
<tr><td>160 MHz</td><td>koi nahi</td><td>lagbhag 2</td><td>7</td></tr></table>

<div class="eg"><p><b>Worked example.</b> 2.4 GHz mein channel 11: 2407 + 5 × 11 = <b>2462 MHz</b>. Channels 1 (2412) aur 6 (2437) 25 MHz door hain, 20 MHz se zyada, isliye overlap nahi. Channels 1 aur 4 (2427) sirf 15 MHz door hain: overlap. 5 GHz mein channel 36 = 5000 + 180 = <b>5180 MHz</b>; 36 aur 40 ko 40 MHz mein bond karne se 5190 MHz par centred channel banta hai, jise 38 likhte hain.</p></div>

<p>Lab mein 5 GHz fix teeno padosiyon ko alag 20 MHz channels deta hai:</p>
<pre class="code">(WLC1) &gt;config 802.11a channel ap AP2 40
(WLC1) &gt;config 802.11a channel ap AP3 44
(WLC1) &gt;show advanced 802.11a channel</pre>
<pre class="out">802.11a/n/ac (5 GHz) channel plan   (every 20 MHz channel is non-overlapping)
Network status................................... Enabled

AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
-------------  -------  --------  -----------  --------  ----------------------
AP1            36       5180      1 (20 dBm)   Up        -
AP2            40       5200      1 (20 dBm)   Up        -
AP3            44       5220      1 (20 dBm)   Up        -

<span class="hl">Interference: none - no neighbouring APs share or overlap a channel</span></pre>

<div class="warn"><p><b>Common galti.</b> "Speed ke liye" 2.4 GHz par 40 MHz enable karna. Yeh teen usable channels mein se do kha jaata hai aur har padosi se overlap karta hai. 2.4 GHz ko 20 MHz par rakho, aur dense 5 GHz offices mein 20 ya 40 MHz pasand karo taaki reuse ke liye kaafi channels hon.</p></div>

<div class="exam"><p><b>Exam trap.</b> 2.4 GHz ke non-overlapping channels <b>1, 6 aur 11</b> hain, 1, 5, 9 ya 2, 7, 12 nahi. Channels 5 MHz door hain par signals 20 se 22 MHz chaude. 5 GHz mein har 20 MHz channel non-overlapping hai. Adjacent-channel interference co-channel interference se bura hai.</p></div>

<div class="scn"><h4>Airport ke paas clients drop hona</h4><p>Airport ke paas ek office ne report kiya ki ek floor par laptops din mein kai baar kuch seconds ke liye disconnect hote hain. Controller log mein channel 100 par radar detected dikha, aur AP channel 36 par jaakar lautne se pehle wait karta dikha. APs DFS channels par the, aur har radar hit channel change karwata tha jo clients ko drop karta tha. Engineer ne us building ke liye affected DFS channels exclude kiye aur unki jagah U-NII-1 aur U-NII-3 channels use kiye.</p><p><b>Seekh:</b> DFS channels capacity badhate hain, par radar ke paas channel changes karwate hain; logs check karo aur zaroorat ho to channels exclude karo.</p></div>

<div class="iv"><p class="q">"2.4 GHz par sirf channels 1, 6 aur 11 hi kyun recommend kiye jaate hain?"</p><p>Strong answer: 2.4 GHz channel centres 5 MHz door hain par har 802.11 signal lagbhag 20 se 22 MHz chauda hai, isliye ek channel dono taraf ke chaar channels se overlap karta hai. Sirf paanch door wale channels, 2412, 2437 aur 2462 MHz par 1, 6 aur 11, overlap se bachte hain. Overlapping channels adjacent-channel interference karte hain jo frames corrupt karta hai; same channel sirf contention karta hai. 5 GHz se contrast karo, jahan saare 20 MHz channels non-overlapping hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz: centre = 2407 + 5 × ch; sirf 1, 6 aur 11 non-overlapping hain.</li>
<li>5 GHz: centre = 5000 + 5 × ch; har 20 MHz channel (36, 40, 44, …) non-overlapping; DFS channels ko radar se bachna hota hai.</li>
<li>6 GHz: 59 × 20 MHz channels tak, sirf Wi-Fi 6E/7, WPA3 mandatory, 15 PSCs.</li>
<li>40/80/160/320 MHz bonding speed badhata hai par channels ki sankhya aur SNR kam karta hai.</li>
<li>Co-channel = contention; adjacent-channel = corruption, jo zyada bura hai.</li>
</ul></div>
`}};export{e as default};