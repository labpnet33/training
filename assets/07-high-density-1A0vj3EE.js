var e={id:`high-density`,h:{en:`High-density design and the wl-design-high-density lab`,hi:`High-density design aur wl-design-high-density lab`},body:{en:`
<p>A <b>high-density</b> (HD) area is one where many clients sit close together: a lecture hall with 90 students, a stadium, a conference floor, an airport gate lounge. Signal is never the problem; <b>airtime</b> is. This chapter gives the HD design recipe and the lab <code>wl-design-high-density</code>. Capacity maths is in chapter 3; channel width is in chapter 4.</p>

<h3>Analogy: a wedding hall with one microphone</h3>
<p>One person with a microphone can address a hall. Give 90 guests the same microphone and only one can speak at a time, and the rest must wait. The fix is not a louder microphone. It is more microphones, each covering a small group, and everyone speaking in short, fast bursts.</p>

<h3>The HD recipe in five steps</h3>
<ol>
<li><b>Many small cells.</b> More APs, each at <b>low transmit power</b>, so each cell holds few clients.</li>
<li><b>Narrow channels.</b> 20 MHz everywhere so there are enough separate channels for reuse (chapter 4).</li>
<li><b>No slow data rates.</b> Disable 6, 9 and 12 Mbps and make 24 Mbps the lowest mandatory rate. Management frames and weak clients can no longer use airtime-hungry slow rates.</li>
<li><b>Few SSIDs.</b> Each SSID adds beacons. Three or fewer per band is a good aim.</li>
<li><b>Steer clients to 5 GHz</b> (and 6 GHz where available) and use the controller's HD features: client load limits, RX-SOP, band select.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Lecture hall with three small cells">
<rect x="10" y="10" width="620" height="170" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<circle cx="130" cy="95" r="62" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="320" cy="95" r="62" fill="#bbf7d0" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="510" cy="95" r="62" fill="#fde68a" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="130" cy="95" r="5" fill="#334155"/><circle cx="320" cy="95" r="5" fill="#334155"/><circle cx="510" cy="95" r="5" fill="#334155"/>
<text x="130" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP1 ch 36</text><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP2 ch 40</text><text x="510" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP3 ch 44</text>
<text x="130" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text><text x="510" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text>
</svg><p class="cap">Three 20 MHz cells with different channels, 11 dBm each, 30 clients per cell.</p></div>

<h3>Airtime wasted by beacons</h3>
<p>Every SSID on every AP sends a beacon about ten times a second at the lowest mandatory rate. Slow rates make those beacons expensive.</p>
<div class="eg"><p><b>Worked example.</b> A beacon of about 300 bytes (2,400 bits). At 1 Mbps with a 192 microsecond preamble it takes 2,400 + 192 = 2,592 microseconds, and 10 per second use 25.9 ms of every second, which is <b>2.6 percent per SSID</b>. Eight SSIDs: <b>20.7 percent</b> of the channel gone before any user data. At 6 Mbps (about 20 microsecond preamble) one beacon costs 420 microseconds: 0.42 percent per SSID, 3.4 percent for eight. At 24 Mbps (120 microseconds each) the eight SSIDs cost 0.96 percent. Raising the lowest mandatory rate and cutting SSIDs gives back a fifth of the airtime.</p></div>

<h3>What disabling slow rates does to the cell</h3>
<p>A client must hear the AP well enough for the lowest mandatory rate to join. In the lab model the 24 Mbps rate needs about -68 dBm. At 11 dBm (power level 4), the association radius is the distance where RSSI = -68: 11 - 46 - 35 x log10(d) = -68, log10(d) = 0.943, d = <b>8.8 m</b>. That is the point: the cell is small on purpose, clients far from any AP roam to a closer AP, and nobody drags the cell down at 6 Mbps. Check that three APs 12 to 15 m apart still cover the room.</p>

<div class="eg"><p><b>Capacity check.</b> 90 students at 3 Mbps each need 270 Mbps. With three APs that is 90 Mbps per radio, close to the 100 Mbps planning figure of chapter 3. It works in the lab, but in a real design add a fourth AP or an RF-HD client limit so a busy minute does not tip it over.</p></div>

<h3>The HD features of the RF profile</h3>
<ul>
<li><b>RX-SOP (receiver start-of-packet) threshold:</b> the AP ignores frames weaker than a threshold, so far-away co-channel APs no longer make it defer. Settings are auto, high, medium, low. A <i>high</i> setting makes the cell effectively smaller for receiving. In the lab it is configuration only: the RF profile accepts it but the radio model does not use it.</li>
<li><b>High-density clients count:</b> a per-radio client count the controller uses to decide when to push clients elsewhere (model form).</li>
<li><b>Band steering and load balancing:</b> prefer 5 GHz, spread clients across APs.</li>
<li><b>Directional antennas:</b> in stadiums, patch antennas aimed at seating sections or under-seat APs make small, sharply bounded cells (chapter 5).</li>
<li><b>Wi-Fi 6 features</b> such as OFDMA and BSS colouring (concept only; see <code>wl-standards</code>) improve efficiency but do not remove the need for small cells.</li>
</ul>

<h3>The lab: HD-5</h3>
<p>Three APs share the lecture hall. Create the profile, bind it, and read the result.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile HD-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# tx-power max 11
WLC1(config-rf-profile)# rate RATE_6M disable
WLC1(config-rf-profile)# rate RATE_9M disable
WLC1(config-rf-profile)# rate RATE_12M disable
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
WLC1(config)# wireless tag rf RF-HD
WLC1(config-wireless-rf-tag)# 5ghz-rf-policy HD-5
WLC1(config-wireless-rf-tag)# exit
<span class="c">! Then tag AP1, AP2 and AP3 with rf-tag RF-HD</span></pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band): RRM then DCA for the width, RRM then TPC for the maximum power, 802.11 then Data Rates. Then <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF &gt; Add</b> and <b>Configuration &gt; Wireless &gt; Access Points</b>, the AP, tab Tags. Verify the profile and the radios:</p>
<pre class="out">WLC1# show ap rf-profile name HD-5 detail

RF Profile Name                  : HD-5
Channel width                    : 20 MHz
Max TX power                     : 11 dBm
<span class="hl">Lowest mandatory data rate       : 24 Mbps</span>

WLC1# show ap dot11 5ghz summary
AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
AP1                  All      0011.2233.4401  Enabled   36       <span class="hl">4</span>            20 MHz
AP2                  All      0011.2233.4411  Enabled   40       <span class="hl">4</span>            20 MHz
AP3                  All      0011.2233.4421  Enabled   44       <span class="hl">4</span>            20 MHz</pre>
<p>Power level 4 is 11 dBm. Finally prove the client experience from the laptop with <code>wifi link</code>: it should show 5 GHz, 20 MHz and a signal of -70 dBm or better. A client link looks like this (values are examples):</p>
<pre class="out">LAPTOP1$ wifi link
Connected to 00:11:22:33:44:01 (on wlan0)
	SSID: NK-STAFF
	signal: -64 dBm
	protocol: 802.11ax, 5 GHz, 20 MHz, 2 spatial streams</pre>

<div class="warn"><p><b>Common mistakes.</b> Making HD cells loud ("so they cover the back row") which makes cells overlap and share channels; disabling all low rates without checking that every seat still sees -68 dBm; leaving 8 SSIDs on; using 80 MHz in a hall; designing from client count alone without Mbps per client.</p></div>
<div class="exam"><p><b>Exam trap.</b> HD means <b>more APs at lower power and higher minimum rates</b>, not fewer, louder APs. Disabling low rates shrinks the cell. RX-SOP reduces receive sensitivity to far-away frames.</p></div>

<div class="scn"><h4>The exam-hall freeze</h4><p>On an online exam day, 300 students in one auditorium reported time-outs. The room had two APs at 20 dBm on 80 MHz and eight SSIDs. The fix: eight APs at 11 dBm on 20 MHz channels, two SSIDs, 24 Mbps minimum rate, band steering. After the change channel utilisation fell from 85 to 45 percent and the exam ran cleanly.</p><p><b>Lesson:</b> in high density you win by shrinking cells, not stretching them.</p></div>

<div class="iv"><p class="q">"How would you design Wi-Fi for a 500-seat lecture hall?"</p><p>Estimate active clients and Mbps per client, divide by usable Mbps per radio to get AP count, use small cells with low power and 20 MHz channels, disable 6 to 12 Mbps, limit SSIDs, steer to 5 GHz, consider directional antennas and N+1, and validate with an active survey when the room is full.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HD recipe: small cells, 20 MHz, higher minimum rate, few SSIDs, band steering.</li>
<li>Eight SSIDs at 1 Mbps beacons cost about 20 percent of airtime; at 24 Mbps about 1 percent.</li>
<li>24 Mbps minimum rate at 11 dBm gives about an 8.8 m association radius in the lab.</li>
<li>RX-SOP and client-count settings tune HD cells; in the lab they are configuration only.</li>
<li>Lab: HD-5 (20 MHz, 11 dBm, rates 6, 9, 12 disabled), RF tag RF-HD, power level 4, no overlap.</li>
</ul></div>
`,hi:`
<p><b>High-density</b> (HD) area woh hai jahan bahut saare clients paas paas baithe hon: 90 students wala lecture hall, stadium, conference floor, airport gate lounge. Signal kabhi problem nahi hota; <b>airtime</b> problem hota hai. Yeh chapter HD design recipe aur lab <code>wl-design-high-density</code> deta hai. Capacity maths chapter 3 mein hai; channel width chapter 4 mein.</p>

<h3>Analogy: ek microphone wala shaadi ka hall</h3>
<p>Ek microphone wala insaan hall ko address kar sakta hai. 90 mehmaanon ko wahi microphone do to ek time par sirf ek bol sakta hai, baaki intezaar karte hain. Fix louder microphone nahi hai. Fix zyada microphones hain, har ek chhote group ko cover kare, aur sab chhote, tez bursts mein bolein.</p>

<h3>HD recipe paanch steps mein</h3>
<ol>
<li><b>Bahut saare chhote cells.</b> Zyada APs, har ek <b>low transmit power</b> par, taaki har cell mein kam clients hon.</li>
<li><b>Narrow channels.</b> Har jagah 20 MHz taaki reuse ke liye kaafi alag channels hon (chapter 4).</li>
<li><b>Slow data rates nahi.</b> 6, 9 aur 12 Mbps disable karo aur 24 Mbps ko sabse low mandatory rate banao. Management frames aur kamzor clients ab airtime-bhukhe slow rates use nahi kar sakte.</li>
<li><b>Kam SSIDs.</b> Har SSID beacons badhata hai. Har band mein teen ya kam achha target hai.</li>
<li><b>Clients ko 5 GHz par steer karo</b> (aur jahan ho wahan 6 GHz) aur controller ke HD features use karo: client load limits, RX-SOP, band select.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Teen chhote cells wala lecture hall">
<rect x="10" y="10" width="620" height="170" rx="10" fill="#f1f5f9" stroke="#64748b"/>
<circle cx="130" cy="95" r="62" fill="#bae6fd" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="320" cy="95" r="62" fill="#bbf7d0" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="510" cy="95" r="62" fill="#fde68a" fill-opacity="0.6" stroke="#64748b"/>
<circle cx="130" cy="95" r="5" fill="#334155"/><circle cx="320" cy="95" r="5" fill="#334155"/><circle cx="510" cy="95" r="5" fill="#334155"/>
<text x="130" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP1 ch 36</text><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP2 ch 40</text><text x="510" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP3 ch 44</text>
<text x="130" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text><text x="320" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text><text x="510" y="172" text-anchor="middle" class="svg-muted" font-size="12">30 students</text>
</svg><p class="cap">Alag channels wale teen 20 MHz cells, har ek 11 dBm, har cell mein 30 clients.</p></div>

<h3>Beacons se barbaad airtime</h3>
<p>Har AP par har SSID lagbhag har second das baar sabse low mandatory rate par beacon bhejta hai. Slow rates un beacons ko mehnga bana dete hain.</p>
<div class="eg"><p><b>Worked example.</b> Lagbhag 300 bytes (2,400 bits) ka beacon. 1 Mbps par 192 microsecond preamble ke saath 2,400 + 192 = 2,592 microsecond lagte hain, aur har second 10 beacons 25.9 ms khate hain, yaani <b>2.6 percent per SSID</b>. Aath SSIDs: user data se pehle hi channel ka <b>20.7 percent</b> gaya. 6 Mbps par (lagbhag 20 microsecond preamble) ek beacon 420 microsecond leta hai: 0.42 percent per SSID, aath ke liye 3.4 percent. 24 Mbps par (har ek 120 microsecond) aath SSIDs 0.96 percent lete hain. Lowest mandatory rate badhane aur SSIDs kam karne se airtime ka paanchva hissa wapas milta hai.</p></div>

<h3>Slow rates disable karne se cell par kya asar</h3>
<p>Client ko AP itna achha sunna chahiye ki lowest mandatory rate par join ho sake. Lab model mein 24 Mbps rate ko lagbhag -68 dBm chahiye. 11 dBm (power level 4) par association radius woh distance hai jahan RSSI = -68: 11 - 46 - 35 x log10(d) = -68, log10(d) = 0.943, d = <b>8.8 m</b>. Yahi maqsad hai: cell jaan boojh kar chhota hai, kisi AP se door wale clients paas ke AP par roam karte hain, aur koi cell ko 6 Mbps par neeche nahi kheenchta. Check karo ki 12 se 15 m door teen APs room ko ab bhi cover karte hain.</p>

<div class="eg"><p><b>Capacity check.</b> 90 students, har ek 3 Mbps, ko 270 Mbps chahiye. Teen APs ke saath yeh har radio par 90 Mbps hai, chapter 3 ke 100 Mbps planning figure ke kareeb. Lab mein chalta hai, lekin real design mein chautha AP ya RF-HD client limit jodo taaki busy minute ise gira na de.</p></div>

<h3>RF profile ke HD features</h3>
<ul>
<li><b>RX-SOP (receiver start-of-packet) threshold:</b> AP threshold se kamzor frames ko ignore karta hai, isliye door ke co-channel APs ab ise defer nahi karwate. Settings auto, high, medium, low. <i>High</i> setting cell ko receive ke liye effectively chhota banati hai. Lab mein yeh sirf configuration hai: RF profile ise accept karta hai lekin radio model use nahi karta.</li>
<li><b>High-density clients count:</b> per-radio client count jise controller yeh decide karne mein use karta hai ki clients ko kab kahin aur bheje (model form).</li>
<li><b>Band steering aur load balancing:</b> 5 GHz prefer karo, clients ko APs mein failao.</li>
<li><b>Directional antennas:</b> stadiums mein seating sections ki taraf aim kiye patch antennas ya under-seat APs chhote, tez boundary wale cells banate hain (chapter 5).</li>
<li><b>Wi-Fi 6 features</b> jaise OFDMA aur BSS colouring (concept only; <code>wl-standards</code> dekho) efficiency badhate hain lekin chhote cells ki zaroorat khatam nahi karte.</li>
</ul>

<h3>Lab: HD-5</h3>
<p>Teen APs lecture hall share karte hain. Profile banao, bind karo, aur result padho.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile HD-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# tx-power max 11
WLC1(config-rf-profile)# rate RATE_6M disable
WLC1(config-rf-profile)# rate RATE_9M disable
WLC1(config-rf-profile)# rate RATE_12M disable
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
WLC1(config)# wireless tag rf RF-HD
WLC1(config-wireless-rf-tag)# 5ghz-rf-policy HD-5
WLC1(config-wireless-rf-tag)# exit
<span class="c">! Phir AP1, AP2 aur AP3 ko rf-tag RF-HD se tag karo</span></pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band): width ke liye RRM phir DCA, maximum power ke liye RRM phir TPC, 802.11 phir Data Rates. Phir <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF &gt; Add</b> aur <b>Configuration &gt; Wireless &gt; Access Points</b>, AP, tab Tags. Profile aur radios verify karo:</p>
<pre class="out">WLC1# show ap rf-profile name HD-5 detail

RF Profile Name                  : HD-5
Channel width                    : 20 MHz
Max TX power                     : 11 dBm
<span class="hl">Lowest mandatory data rate       : 24 Mbps</span>

WLC1# show ap dot11 5ghz summary
AP Name              Subband  Radio Mac       Status    Channel  Power Level  Width
AP1                  All      0011.2233.4401  Enabled   36       <span class="hl">4</span>            20 MHz
AP2                  All      0011.2233.4411  Enabled   40       <span class="hl">4</span>            20 MHz
AP3                  All      0011.2233.4421  Enabled   44       <span class="hl">4</span>            20 MHz</pre>
<p>Power level 4 matlab 11 dBm. Aakhir mein laptop se <code>wifi link</code> chala kar client experience prove karo: 5 GHz, 20 MHz aur -70 dBm ya behtar signal dikhna chahiye. Client link aisa dikhta hai (values examples hain):</p>
<pre class="out">LAPTOP1$ wifi link
Connected to 00:11:22:33:44:01 (on wlan0)
	SSID: NK-STAFF
	signal: -64 dBm
	protocol: 802.11ax, 5 GHz, 20 MHz, 2 spatial streams</pre>

<div class="warn"><p><b>Common galtiyan.</b> HD cells ko loud banana ("taaki aakhri row cover ho") jisse cells overlap karte hain aur channels share karte hain; sab low rates disable karna bina check kiye ki har seat par -68 dBm dikhta hai; 8 SSIDs on chhodna; hall mein 80 MHz; Mbps per client ke bina sirf client count se design karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> HD ka matlab <b>zyada APs kam power par aur ooncha minimum rate</b> hai, kam, loud APs nahi. Low rates disable karne se cell chhota hota hai. RX-SOP door ke frames ke liye receive sensitivity kam karta hai.</p></div>

<div class="scn"><h4>Exam-hall freeze</h4><p>Online exam ke din ek auditorium mein 300 students ne time-outs report kiye. Room mein 80 MHz par 20 dBm ke do APs aur aath SSIDs the. Fix: 20 MHz channels par 11 dBm ke aath APs, do SSIDs, 24 Mbps minimum rate, band steering. Badlaav ke baad channel utilisation 85 se 45 percent par aaya aur exam saaf chala.</p><p><b>Seekh:</b> high density mein cells chhote karke jeette hain, kheench kar nahi.</p></div>

<div class="iv"><p class="q">"500-seat lecture hall ke liye Wi-Fi kaise design karoge?"</p><p>Active clients aur Mbps per client estimate karo, AP count ke liye usable Mbps per radio se divide karo, low power aur 20 MHz channels ke saath chhote cells use karo, 6 se 12 Mbps disable karo, SSIDs limit karo, 5 GHz par steer karo, directional antennas aur N+1 sochho, aur room bhara ho tab active survey se validate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HD recipe: chhote cells, 20 MHz, ooncha minimum rate, kam SSIDs, band steering.</li>
<li>1 Mbps beacons par aath SSIDs lagbhag 20 percent airtime khate hain; 24 Mbps par lagbhag 1 percent.</li>
<li>11 dBm par 24 Mbps minimum rate lab mein lagbhag 8.8 m association radius deta hai.</li>
<li>RX-SOP aur client-count settings HD cells tune karti hain; lab mein yeh sirf configuration hain.</li>
<li>Lab: HD-5 (20 MHz, 11 dBm, rates 6, 9, 12 disabled), RF tag RF-HD, power level 4, koi overlap nahi.</li>
</ul></div>
`}};export{e as default};