var e={id:`location-science`,h:{en:`Location science: RSSI, trilateration, BLE and Hyperlocation`,hi:`Location science: RSSI, trilateration, BLE aur Hyperlocation`},body:{en:`
<p>Imagine you are blindfolded in a hall and three friends stand in the corners calling your name. By how loud each voice sounds you can guess your distance to each friend, and the point that fits all three guesses is roughly where you stand. That is Wi-Fi location. The APs are the friends, the client's radio signal is the voice, and the loudness is the <b>RSSI</b>. All of this chapter is <b>concept only</b>: the lab has no RSSI maths engine and no location dashboards. The maths here is for understanding and for the exam.</p>

<h3>RSSI and path loss</h3>
<p><b>RSSI</b> (received signal strength indicator) is how strongly an AP hears a client, in dBm. Signals weaken with distance. A simple model is the <b>log-distance path loss</b> formula:</p>
<pre class="out">RSSI(d) = RSSI(1 m) - 10 x n x log10(d)

n = path-loss exponent (about 2 in free space, 3 to 4 indoors)</pre>
<p>Rearranged to estimate distance: <code>d = 10 ^ ((RSSI(1 m) - RSSI) / (10 x n))</code>.</p>

<div class="eg"><p><b>Worked example.</b> Suppose RSSI at 1 m is -40 dBm and the office has n = 3. A client heard at -62 dBm: (-40 minus -62) = 22; 22 divided by 30 = 0.733; 10 to the power 0.733 is about 5.4 m. At 20 m the model predicts -40 minus 30 x 1.301 = -79 dBm. Every doubling of distance costs about 9 dB at n = 3.</p></div>

<h3>Trilateration</h3>
<p>One AP gives a circle of possible positions around it. Two circles cross at two points; <b>three or more</b> APs pin one point. This is <b>trilateration</b> (the distance-based cousin of triangulation, which uses angles).</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Trilateration with three APs">
<circle cx="150" cy="190" r="110" fill="none" stroke="#64748b" stroke-width="1.5"/>
<circle cx="450" cy="190" r="150" fill="none" stroke="#64748b" stroke-width="1.5"/>
<circle cx="240" cy="50" r="90" fill="none" stroke="#64748b" stroke-width="1.5"/>
<rect x="136" y="176" width="28" height="28" rx="6" fill="#bae6fd"/><text x="150" y="195" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="436" y="176" width="28" height="28" rx="6" fill="#bae6fd"/><text x="450" y="195" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<rect x="226" y="36" width="28" height="28" rx="6" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">AP3</text>
<circle cx="258" cy="136" r="8" fill="#f97316"/><text x="275" y="140" class="svg-accent" font-size="13">client</text>
<text x="10" y="20" class="svg-muted" font-size="12">each circle = distance estimated from RSSI</text>
</svg><p class="cap">Three distance circles meet near the client. Because RSSI is noisy, the circles never meet at exactly one point; the software finds the best fit.</p></div>
<div class="eg"><p><b>Worked example.</b> AP1 at (0,0), AP2 at (20,0), AP3 at (0,20), all in metres. Estimated distances: 10 m, 13.42 m, 16.12 m. From AP1: x squared plus y squared = 100. From AP2: (x minus 20) squared plus y squared = 180. Subtract: minus 40x plus 400 = 80, so x = 8. From AP3: x squared plus (y minus 20) squared = 260; subtracting from the first gives minus 40y plus 400 = 160, so y = 6. The client is at (8, 6).</p></div>

<h3>Why real accuracy is limited</h3>
<ul>
<li><b>RSSI is noisy.</b> Walls, people, furniture and antenna orientation change it by 5 dB or more. A 5 dB error at n = 3 changes the estimated distance by a factor of 10 to the power (5 divided by 30), about 1.47, so nearly half again too far or too near.</li>
<li><b>Multipath.</b> Reflections mean the strongest path is not the straight one.</li>
<li><b>AP geometry.</b> APs in one hallway line give poor results; APs must surround the area. Typical design guidance says a client should be heard by at least three, ideally four, APs at a usable signal level, with APs also placed on the perimeter and not only in the centre. Check the current location design guide for exact spacing.</li>
<li><b>Maps and calibration.</b> The floor map must be to scale and APs placed exactly on it; wrong AP positions produce wrong locations however good the maths is.</li>
</ul>
<p>With good design, RSSI-based Wi-Fi location is typically accurate to a few metres for most clients, not centimetres. Anyone promising more from RSSI alone should be questioned.</p>

<h3>Better inputs: BLE, FastLocate and Hyperlocation</h3>
<dl class="terms">
<dt>BLE (Bluetooth Low Energy)</dt><dd>Small, cheap beacons broadcast an identifier; many Catalyst APs contain a BLE radio that can listen to beacons or act as one. Used for asset tags, wayfinding and proximity ("you are near the shoe department").</dd>
<dt>FastLocate</dt><dd>Uses data frames a client already sends, not only its occasional probe requests, so the location updates more often.</dd>
<dt>Hyperlocation</dt><dd>Uses a special antenna array (a module on some APs, built in on certain models) to measure the <b>angle of arrival</b> of the client's signal in addition to RSSI. Angle plus distance gives a tighter fix; Cisco describes accuracy in the one-to-three metre range under good conditions.</dd>
</dl>
<p>The older on-premises location engine (CMX) is being replaced by <b>Cisco Spaces</b> in the cloud, which chapter 7 covers. None of BLE, FastLocate or Hyperlocation is simulated in the lab.</p>

<div class="warn"><p><b>Common mistake.</b> Designing AP placement only for coverage and data rate (a few APs well inside the building) and then expecting accurate location. Location needs APs around the perimeter and a dense enough layout.</p></div>

<div class="exam"><p><b>Exam trap.</b> Trilateration uses distances (circles); triangulation uses angles. Hyperlocation adds angle of arrival, so it is not pure RSSI trilateration. RSSI is not constant for a client: it changes with the AP's antenna, orientation and obstacles.</p></div>

<div class="scn"><h4>The forklift that "drove through a wall"</h4><p>A warehouse tracked forklift tags and the map showed them crossing racks. The APs were mounted in a straight line down the centre aisle. The engineer added four APs along the side walls and recalibrated, and the tracks followed the aisles.</p><p><b>Lesson:</b> location accuracy depends on AP geometry as much as on the software.</p></div>

<div class="iv"><p class="q">"How accurate is Wi-Fi location and what limits it?"</p><p>With RSSI and trilateration, a few metres typically; limits are signal noise, multipath, AP geometry and map quality. Hyperlocation (angle of arrival) and BLE improve it. Show you can do the log-distance calculation and that you know it is concept only here.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSSI falls with log of distance: RSSI(d) = RSSI(1 m) minus 10 n log10(d).</li>
<li>Trilateration needs three or more APs and uses distance circles.</li>
<li>Noise, multipath, AP layout and map quality limit accuracy to a few metres.</li>
<li>BLE, FastLocate and Hyperlocation improve inputs; they are concept only in the lab.</li>
<li>Design for location means APs around the perimeter, not only coverage.</li>
</ul></div>
`,hi:`
<p>Ek hall mein aankhon par patti baandhe khade ho, aur teen dost kone mein se aapka naam pukaar rahe hain. Har awaaz kitni tez sunai deti hai us se aap har dost tak apni doori ka andaza laga sakte ho, aur jo point teeno andazon se milta hai wahi lagbhag aapki jagah hai. Wi-Fi location yahi hai. APs dost hain, client ka radio signal awaaz hai, aur tezi <b>RSSI</b> hai. Is chapter ka sab kuch <b>sirf concept</b> hai: lab mein RSSI maths engine ya location dashboards nahi hain. Yahan ka maths samajhne aur exam ke liye hai.</p>

<h3>RSSI aur path loss</h3>
<p><b>RSSI</b> (received signal strength indicator) batata hai ki AP client ko kitna tez sunta hai, dBm mein. Signal doori ke saath kamzor hota hai. Ek simple model <b>log-distance path loss</b> formula hai:</p>
<pre class="out">RSSI(d) = RSSI(1 m) - 10 x n x log10(d)

n = path-loss exponent (free space mein lagbhag 2, indoor 3 se 4)</pre>
<p>Doori estimate karne ke liye ulta: <code>d = 10 ^ ((RSSI(1 m) - RSSI) / (10 x n))</code>.</p>

<div class="eg"><p><b>Worked example.</b> Maano 1 m par RSSI -40 dBm hai aur office mein n = 3. Client -62 dBm par suna gaya: (-40 minus -62) = 22; 22 ko 30 se divide = 0.733; 10 ki power 0.733 lagbhag 5.4 m. 20 m par model -40 minus 30 x 1.301 = -79 dBm batata hai. n = 3 par doori double karne par lagbhag 9 dB ka nuksaan hota hai.</p></div>

<h3>Trilateration</h3>
<p>Ek AP apne aas-paas possible positions ka ek circle deta hai. Do circles do points par kaatte hain; <b>teen ya zyada</b> APs ek point pakadte hain. Isse <b>trilateration</b> kehte hain (triangulation ka distance-based cousin, jo angles use karta hai).</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Teen APs se trilateration">
<circle cx="150" cy="190" r="110" fill="none" stroke="#64748b" stroke-width="1.5"/>
<circle cx="450" cy="190" r="150" fill="none" stroke="#64748b" stroke-width="1.5"/>
<circle cx="240" cy="50" r="90" fill="none" stroke="#64748b" stroke-width="1.5"/>
<rect x="136" y="176" width="28" height="28" rx="6" fill="#bae6fd"/><text x="150" y="195" text-anchor="middle" class="svg-ink" font-size="12">AP1</text>
<rect x="436" y="176" width="28" height="28" rx="6" fill="#bae6fd"/><text x="450" y="195" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<rect x="226" y="36" width="28" height="28" rx="6" fill="#bae6fd"/><text x="240" y="55" text-anchor="middle" class="svg-ink" font-size="12">AP3</text>
<circle cx="258" cy="136" r="8" fill="#f97316"/><text x="275" y="140" class="svg-accent" font-size="13">client</text>
<text x="10" y="20" class="svg-muted" font-size="12">har circle = RSSI se estimate ki gayi doori</text>
</svg><p class="cap">Teen distance circles client ke paas milte hain. RSSI noisy hai, isliye circles bilkul ek point par nahi milte; software best fit nikalta hai.</p></div>
<div class="eg"><p><b>Worked example.</b> AP1 (0,0) par, AP2 (20,0) par, AP3 (0,20) par, sab metres mein. Estimated distances: 10 m, 13.42 m, 16.12 m. AP1 se: x squared plus y squared = 100. AP2 se: (x minus 20) squared plus y squared = 180. Subtract karo: minus 40x plus 400 = 80, isliye x = 8. AP3 se: x squared plus (y minus 20) squared = 260; pehle equation ko ghatane par minus 40y plus 400 = 160, isliye y = 6. Client (8, 6) par hai.</p></div>

<h3>Real accuracy limited kyun hai</h3>
<ul>
<li><b>RSSI noisy hai.</b> Deewarein, log, furniture aur antenna orientation use 5 dB ya zyada badal dete hain. n = 3 par 5 dB ki error estimated doori ko 10 ki power (5 bata 30) ke factor se badalti hai, lagbhag 1.47, yani lagbhag aadha zyada door ya paas.</li>
<li><b>Multipath.</b> Reflections ka matlab strongest path seedha path nahi hota.</li>
<li><b>AP geometry.</b> Ek hallway line mein APs kharab result dete hain; APs ko area ko gher kar rakhna chahiye. Typical design guidance kehti hai ki client ko kam se kam teen, behtar chaar, APs usable signal level par sunein, aur APs sirf beech mein nahi, perimeter par bhi hon. Exact spacing ke liye current location design guide dekho.</li>
<li><b>Maps aur calibration.</b> Floor map scale par hona chahiye aur APs us par exact jagah rakhe hon; galat AP positions galat locations deti hain chahe maths kitna bhi achha ho.</li>
</ul>
<p>Achhe design ke saath RSSI-based Wi-Fi location aam taur par zyadatar clients ke liye kuch metres tak accurate hoti hai, centimetres nahi. Jo sirf RSSI se zyada ka waada kare us se sawal karo.</p>

<h3>Behtar inputs: BLE, FastLocate aur Hyperlocation</h3>
<dl class="terms">
<dt>BLE (Bluetooth Low Energy)</dt><dd>Chhote, sasti beacons ek identifier broadcast karte hain; kai Catalyst APs mein BLE radio hota hai jo beacons sun sakta hai ya khud beacon ban sakta hai. Asset tags, wayfinding aur proximity ("aap shoe department ke paas ho") ke liye use hota hai.</dd>
<dt>FastLocate</dt><dd>Client ke sirf kabhi kabhi ke probe requests nahi, balki data frames use karta hai jo woh pehle se bhejta hai, isliye location zyada baar update hoti hai.</dd>
<dt>Hyperlocation</dt><dd>Ek special antenna array (kuch APs par module, kuch models mein built in) use karta hai jo RSSI ke saath client ke signal ka <b>angle of arrival</b> naapta hai. Angle aur doori mil kar tighter fix dete hain; Cisco accuracy ko achhi conditions mein ek se teen metre batata hai.</dd>
</dl>
<p>Purana on-premises location engine (CMX) cloud ke <b>Cisco Spaces</b> se replace ho raha hai, jise chapter 7 cover karta hai. BLE, FastLocate ya Hyperlocation mein se kuch bhi lab mein simulate nahi hai.</p>

<div class="warn"><p><b>Common mistake.</b> AP placement sirf coverage aur data rate ke liye design karna (building ke andar kuch APs) aur phir accurate location ki ummeed karna. Location ko perimeter par APs aur kaafi dense layout chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Trilateration distances (circles) use karta hai; triangulation angles. Hyperlocation angle of arrival jodta hai, isliye woh pure RSSI trilateration nahi hai. RSSI client ke liye constant nahi hota: AP ke antenna, orientation aur rukawton se badalta hai.</p></div>

<div class="scn"><h4>Forklift jo "deewar ke aar-paar chala"</h4><p>Ek warehouse forklift tags track karta tha aur map par woh racks ke beech se guzarte dikhte the. APs beech ke aisle mein seedhi line mein lage the. Engineer ne side walls par chaar APs jode aur recalibrate kiya, aur tracks aisles ke saath chalne lage.</p><p><b>Lesson:</b> location accuracy software jitni hi AP geometry par depend karti hai.</p></div>

<div class="iv"><p class="q">"Wi-Fi location kitni accurate hai aur use kya limit karta hai?"</p><p>RSSI aur trilateration ke saath aam taur par kuch metres; limits hain signal noise, multipath, AP geometry aur map quality. Hyperlocation (angle of arrival) aur BLE ise behtar karte hain. Dikhao ki aap log-distance calculation kar sakte ho aur jaante ho ki yahan yeh sirf concept hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RSSI doori ke log ke saath girta hai: RSSI(d) = RSSI(1 m) minus 10 n log10(d).</li>
<li>Trilateration ko teen ya zyada APs chahiye aur distance circles use karta hai.</li>
<li>Noise, multipath, AP layout aur map quality accuracy ko kuch metres tak limit karte hain.</li>
<li>BLE, FastLocate aur Hyperlocation inputs behtar karte hain; lab mein sirf concept hain.</li>
<li>Location ke liye design mein APs perimeter par chahiye, sirf coverage nahi.</li>
</ul></div>
`}};export{e as default};