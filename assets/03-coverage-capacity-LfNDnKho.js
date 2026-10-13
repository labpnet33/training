var e={id:`coverage-capacity`,h:{en:`Coverage versus capacity: sizing cells and counting APs`,hi:`Coverage versus capacity: cells size karna aur APs ginna`},body:{en:`
<p>Chapter 1 said every design answers coverage and capacity. This chapter turns both into numbers. You will size a cell from a target RSSI, count APs for coverage, count APs for capacity, and take the larger answer. The radio rules you need (RSSI, SNR, cell edge and data rates) are from <code>wl-rf</code>; here we use them as design tools.</p>

<h3>Analogy: a restaurant</h3>
<p>Coverage is whether every table can <i>reach</i> a waiter. Capacity is whether the waiters can <i>serve</i> everyone in the dinner rush. A big dining room with one waiter has coverage and no capacity. Wi-Fi works the same: all clients on one channel in one cell share the same airtime, one speaker at a time.</p>

<h3>Coverage: from a target RSSI to a cell radius</h3>
<p>Pick the weakest signal you will accept. Common design targets: <b>-67 dBm</b> for voice and real-time apps, about <b>-70 dBm</b> for general data, always with <b>SNR of at least 25 dB</b> for good rates. With a -95 dBm noise floor, -67 dBm gives 28 dB SNR.</p>
<p>The lab model (10 px = 1 m) is RSSI = tx - 40 - 6 (5 GHz only) - 35 x log10(metres). Solve for the distance at the target:</p>
<div class="eg"><p><b>Worked example: 5 GHz cell radius.</b> Target -67 dBm, AP at 17 dBm (power level 2). 17 - 46 - 35 x log10(d) = -67, so 35 x log10(d) = 38, log10(d) = 1.0857, d = 12.2 m. At 11 dBm (level 4): 35 x log10(d) = 32, d = 8.2 m. Six dB less power cut the radius from 12.2 m to 8.2 m, about one third, and the cell area roughly in half (8.2 squared over 12.2 squared is 0.45). This is why power is the first tool for cell size.</p></div>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Cell radius at two power levels">
<circle cx="200" cy="90" r="76" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="200" cy="90" r="51" fill="#bbf7d0" fill-opacity="0.8" stroke="#64748b"/>
<circle cx="200" cy="90" r="5" fill="#334155"/>
<text x="200" y="22" text-anchor="middle" class="svg-ink" font-size="12">17 dBm: radius 12.2 m</text>
<text x="200" y="172" text-anchor="middle" class="svg-ink" font-size="12">11 dBm: radius 8.2 m</text>
<rect x="340" y="40" width="290" height="100" rx="8" fill="#e2e8f0"/>
<text x="485" y="66" text-anchor="middle" class="svg-ink" font-size="13">Target edge -67 dBm</text>
<text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="12">-6 dB power = about 2/3 radius</text>
<text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="12">half the area, half the clients per cell</text>
<text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">more APs, more total capacity</text>
</svg><p class="cap">Lower power makes smaller cells. Smaller cells mean more cells per floor, so more capacity.</p></div>

<h3>Cell overlap and AP spacing</h3>
<p>Neighbouring cells must overlap so a roaming client always has a next AP to move to. The usual rule of thumb is <b>15 to 20 percent</b> overlap in the roaming zone, more for voice. Too little overlap leaves holes; too much overlap makes co-channel interference (chapter 4). Two APs 24 m apart with 12.2 m radius at -67 dBm meet exactly at the midpoint: that spacing gives zero overlap at -67 and is the <b>maximum</b>, not the target. For overlap, space closer, or measure overlap at a lower edge such as -72 dBm.</p>

<h3>AP count for coverage</h3>
<p>Divide the area by the cell area. A hexagon with circumradius r has area 2.598 x r squared, which is a good tiling model: for r = 12.2 m, area = 2.598 x 148.8 = 387 m2. Subtract overlap by using about 85 percent of that, 329 m2.</p>

<h3>AP count for capacity</h3>
<p>Capacity needs three numbers: <b>active clients</b>, <b>Mbps per client</b>, and <b>usable Mbps per AP radio</b>. A Wi-Fi 6 (802.11ax) 2-stream client on a 20 MHz channel has a top PHY rate of 286.8 Mbps (MCS 11). Real throughput is far lower: MAC overhead, contention, retries and slower clients. A planning figure of <b>100 Mbps usable per 20 MHz 5 GHz radio</b> for a mixed population is prudent. Use your site's measured value if you have one. A rule of thumb in many designs is to stay around 25 to 40 active data clients per 5 GHz radio, fewer for voice.</p>

<div class="eg"><p><b>Worked example (continues chapter 1).</b> Floor 2 is 40 m x 36 m = 1,440 m2. <b>Coverage:</b> 1,440 / 329 = 4.4, so 5 APs. <b>Capacity:</b> 96 active clients x 5 Mbps = 480 Mbps; 480 / 100 = 4.8, so 5 APs. Both say 5. Add one more AP so that the failure of any one AP does not leave a hole: N + 1 = 6. Then the 96 clients average 16 per AP, well below the rule of thumb.</p></div>

<p>If the capacity number is larger, you do not stretch the cells; you add APs and make cells smaller with lower power, so the AP count rises while each cell stays inside coverage. This is the same logic as the lecture hall lab in chapter 7.</p>

<h3>Airtime: why slow clients hurt everyone</h3>
<p>Wi-Fi shares time, not bits. A frame of 12,000 bits (1,500 bytes) takes about 2 ms at 6 Mbps but only 0.2 ms at 60 Mbps. A client at 6 Mbps therefore uses ten times the airtime for the same data, and every other client in the cell waits. Two design tools fix this: shrink cells so clients sit closer and connect faster, and <b>disable the lowest data rates</b> so very weak clients roam instead of clinging (data rates were covered in <code>wl-rf</code>).</p>

<h3>Checking the plan in the lab</h3>
<p>The lab shows each AP radio with channel, power level and width:</p>
<pre class="out">WLC1# show ap dot11 5ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
AP1                  All      0011.2233.4401  Enabled   36       2            20 MHz
AP2                  All      0011.2233.4411  Enabled   40       2            20 MHz
AP3                  All      0011.2233.4421  Enabled   44       2            20 MHz
<span class="hl">AP4                  All      0011.2233.4431  Enabled   48       2            20 MHz</span>
AP5                  All      0011.2233.4441  Enabled   149      2            20 MHz</pre>
<p>Power level 2 is 17 dBm. Each level is 3 dB lower: level 3 = 14, level 4 = 11, level 5 = 8 dBm. GUI: <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>.</p>

<div class="warn"><p><b>Common mistakes.</b> Counting APs only by area; using the maximum transmit power everywhere (cells get big and share too few channels); assuming clients are as strong as APs (a phone transmits at 10 to 15 dBm, much less than an AP, so the downlink may look fine and the uplink fail); forgetting the future growth of devices per person.</p></div>
<div class="exam"><p><b>Exam trap.</b> Doubling power is only +3 dB; to double the radius in free space you need +6 dB. Capacity is solved with <b>more, smaller cells</b>, not louder cells.</p></div>

<div class="scn"><h4>The open-plan office with seven bars of signal</h4><p>A floor had four APs at maximum power and full signal everywhere, yet video calls stuttered at 10:00. Utilisation showed 80 percent on channel 36 with 70 clients. The fix kept the AP positions but dropped power to level 4 and added two APs, so each cell served 12 to 15 clients.</p><p><b>Lesson:</b> signal bars say nothing about capacity.</p></div>

<div class="iv"><p class="q">"How do you decide how many APs a floor needs?"</p><p>Calculate both: coverage count from area over cell size at the target RSSI, capacity count from active clients times Mbps per client over usable Mbps per radio. Take the larger, add N+1 headroom, then validate with a survey. Mention that smaller cells with lower power and no low rates raise capacity.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design targets: about -67 dBm for voice, -70 dBm for data, SNR of 25 dB or more.</li>
<li>Cell radius comes from the RSSI model; 6 dB less power is about two thirds of the radius.</li>
<li>Coverage count = area over cell area; capacity count = demand over usable Mbps per radio; take the larger plus N+1.</li>
<li>Airtime is shared; slow clients cost everyone, so shrink cells and drop low rates.</li>
<li>Capacity grows with more, smaller cells, not with louder ones.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ne kaha tha ki har design coverage aur capacity answer karta hai. Yeh chapter dono ko numbers mein badalta hai. Aap target RSSI se cell size karoge, coverage ke liye APs ginoge, capacity ke liye APs ginoge, aur bada jawab loge. Jo radio rules chahiye (RSSI, SNR, cell edge aur data rates) woh <code>wl-rf</code> mein hain; yahan hum unhe design tools ki tarah use karte hain.</p>

<h3>Analogy: restaurant</h3>
<p>Coverage yeh hai ki har table waiter tak <i>pahunch</i> sakta hai ya nahi. Capacity yeh hai ki dinner rush mein waiters sabko <i>serve</i> kar sakte hain ya nahi. Ek waiter wale bade dining room mein coverage hai capacity nahi. Wi-Fi bhi aise hi kaam karta hai: ek channel par ek cell ke saare clients same airtime share karte hain, ek time par ek hi bolta hai.</p>

<h3>Coverage: target RSSI se cell radius tak</h3>
<p>Sabse kamzor signal chuno jo aap accept karoge. Common design targets: voice aur real-time apps ke liye <b>-67 dBm</b>, general data ke liye lagbhag <b>-70 dBm</b>, hamesha achhe rates ke liye <b>kam se kam 25 dB SNR</b> ke saath. -95 dBm noise floor ke saath -67 dBm 28 dB SNR deta hai.</p>
<p>Lab model (10 px = 1 m) hai RSSI = tx - 40 - 6 (sirf 5 GHz) - 35 x log10(metres). Target par distance nikalo:</p>
<div class="eg"><p><b>Worked example: 5 GHz cell radius.</b> Target -67 dBm, AP 17 dBm par (power level 2). 17 - 46 - 35 x log10(d) = -67, to 35 x log10(d) = 38, log10(d) = 1.0857, d = 12.2 m. 11 dBm (level 4) par: 35 x log10(d) = 32, d = 8.2 m. 6 dB kam power ne radius 12.2 m se 8.2 m kar diya, lagbhag ek tihai kam, aur cell area lagbhag aadhi (8.2 ka square 12.2 ke square se 0.45). Isiliye cell size ke liye power pehla tool hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Do power levels par cell radius">
<circle cx="200" cy="90" r="76" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="200" cy="90" r="51" fill="#bbf7d0" fill-opacity="0.8" stroke="#64748b"/>
<circle cx="200" cy="90" r="5" fill="#334155"/>
<text x="200" y="22" text-anchor="middle" class="svg-ink" font-size="12">17 dBm: radius 12.2 m</text>
<text x="200" y="172" text-anchor="middle" class="svg-ink" font-size="12">11 dBm: radius 8.2 m</text>
<rect x="340" y="40" width="290" height="100" rx="8" fill="#e2e8f0"/>
<text x="485" y="66" text-anchor="middle" class="svg-ink" font-size="13">Target edge -67 dBm</text>
<text x="485" y="90" text-anchor="middle" class="svg-muted" font-size="12">-6 dB power = lagbhag 2/3 radius</text>
<text x="485" y="110" text-anchor="middle" class="svg-muted" font-size="12">aadha area, cell mein aadhe clients</text>
<text x="485" y="130" text-anchor="middle" class="svg-muted" font-size="12">zyada APs, zyada total capacity</text>
</svg><p class="cap">Kam power chhote cells banata hai. Chhote cells ka matlab floor par zyada cells, yaani zyada capacity.</p></div>

<h3>Cell overlap aur AP spacing</h3>
<p>Padosi cells overlap karne chahiye taaki roam karte client ke paas hamesha agla AP ho. Usual rule of thumb roaming zone mein <b>15 se 20 percent</b> overlap hai, voice ke liye zyada. Bahut kam overlap holes chhodta hai; bahut zyada overlap co-channel interference banata hai (chapter 4). 24 m door do APs, -67 dBm par 12.2 m radius ke saath, theek midpoint par milte hain: yeh spacing -67 par zero overlap deti hai aur <b>maximum</b> hai, target nahi. Overlap ke liye paas lagao, ya overlap ko -72 dBm jaise lower edge par naapo.</p>

<h3>Coverage ke liye AP count</h3>
<p>Area ko cell area se divide karo. Circumradius r wale hexagon ka area 2.598 x r squared hota hai, jo achha tiling model hai: r = 12.2 m ke liye area = 2.598 x 148.8 = 387 m2. Overlap ghatane ke liye uska lagbhag 85 percent use karo, 329 m2.</p>

<h3>Capacity ke liye AP count</h3>
<p>Capacity ko teen numbers chahiye: <b>active clients</b>, <b>per client Mbps</b>, aur <b>per AP radio usable Mbps</b>. Wi-Fi 6 (802.11ax) 2-stream client ka 20 MHz channel par top PHY rate 286.8 Mbps (MCS 11) hota hai. Real throughput kahin kam hota hai: MAC overhead, contention, retries aur slower clients. Mixed population ke liye <b>100 Mbps usable per 20 MHz 5 GHz radio</b> ka planning figure samajhdaar hai. Agar aapki site ki measured value ho to wahi use karo. Kai designs mein rule of thumb hai har 5 GHz radio par lagbhag 25 se 40 active data clients, voice ke liye kam.</p>

<div class="eg"><p><b>Worked example (chapter 1 se aage).</b> Floor 2 40 m x 36 m = 1,440 m2 hai. <b>Coverage:</b> 1,440 / 329 = 4.4, to 5 APs. <b>Capacity:</b> 96 active clients x 5 Mbps = 480 Mbps; 480 / 100 = 4.8, to 5 APs. Dono 5 kehte hain. Ek AP aur jodo taaki kisi ek AP ke fail hone par hole na bane: N + 1 = 6. Tab 96 clients ka average har AP par 16 hai, rule of thumb se kaafi neeche.</p></div>

<p>Agar capacity wala number bada ho, to aap cells ko kheenchte nahi; aap APs badhate ho aur cells ko kam power se chhota karte ho, taaki AP count badhe jabki har cell coverage ke andar rahe. Yahi logic chapter 7 ke lecture hall lab ka hai.</p>

<h3>Airtime: slow clients sabko kyun nuksan karte hain</h3>
<p>Wi-Fi bits nahi, time share karta hai. 12,000 bits (1,500 bytes) ka frame 6 Mbps par lagbhag 2 ms leta hai lekin 60 Mbps par sirf 0.2 ms. 6 Mbps wala client same data ke liye das guna airtime use karta hai, aur cell ke baaki saare clients intezaar karte hain. Do design tools isse theek karte hain: cells chhote karo taaki clients paas baithein aur tez connect hon, aur <b>sabse low data rates disable karo</b> taaki bahut kamzor clients chipke rehne ki jagah roam karein (data rates <code>wl-rf</code> mein cover hue).</p>

<h3>Lab mein plan check karna</h3>
<p>Lab har AP radio ko channel, power level aur width ke saath dikhata hai:</p>
<pre class="out">WLC1# show ap dot11 5ghz summary

AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
AP1                  All      0011.2233.4401  Enabled   36       2            20 MHz
AP2                  All      0011.2233.4411  Enabled   40       2            20 MHz
AP3                  All      0011.2233.4421  Enabled   44       2            20 MHz
<span class="hl">AP4                  All      0011.2233.4431  Enabled   48       2            20 MHz</span>
AP5                  All      0011.2233.4441  Enabled   149      2            20 MHz</pre>
<p>Power level 2 matlab 17 dBm. Har level 3 dB kam hota hai: level 3 = 14, level 4 = 11, level 5 = 8 dBm. GUI: <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>.</p>

<div class="warn"><p><b>Common galtiyan.</b> APs ko sirf area se ginna; har jagah maximum transmit power use karna (cells bade ho jaate hain aur kam channels share karte hain); yeh maan lena ki clients AP jitne strong hain (phone 10 se 15 dBm par transmit karta hai, AP se kahin kam, isliye downlink theek dikh sakta hai aur uplink fail); har insaan ke devices ki future growth bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Power double karna sirf +3 dB hai; free space mein radius double karne ke liye +6 dB chahiye. Capacity <b>zyada, chhote cells</b> se solve hoti hai, zyada loud cells se nahi.</p></div>

<div class="scn"><h4>Saat bars signal wala open-plan office</h4><p>Ek floor par chaar APs maximum power par the aur har jagah full signal, phir bhi 10:00 baje video calls atakte the. Utilisation channel 36 par 80 percent aur 70 clients dikha. Fix mein AP positions wahi rahe lekin power level 4 kiya aur do APs add kiye, jisse har cell 12 se 15 clients serve karne laga.</p><p><b>Seekh:</b> signal bars capacity ke baare mein kuch nahi batate.</p></div>

<div class="iv"><p class="q">"Ek floor ko kitne APs chahiye yeh aap kaise decide karte ho?"</p><p>Dono calculate karo: coverage count target RSSI par area ko cell size se divide karke, capacity count active clients x Mbps per client ko usable Mbps per radio se divide karke. Bada lo, N+1 headroom jodo, phir survey se validate karo. Yeh bhi bolo ki kam power, chhote cells aur low rates ke bina capacity badhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design targets: voice ke liye lagbhag -67 dBm, data ke liye -70 dBm, SNR 25 dB ya zyada.</li>
<li>Cell radius RSSI model se aata hai; 6 dB kam power lagbhag do tihai radius hai.</li>
<li>Coverage count = area / cell area; capacity count = demand / usable Mbps per radio; bada lo aur N+1 jodo.</li>
<li>Airtime shared hai; slow clients sabko nuksan karte hain, isliye cells chhote karo aur low rates hatao.</li>
<li>Capacity zyada chhote cells se badhti hai, louder cells se nahi.</li>
</ul></div>
`}};export{e as default};