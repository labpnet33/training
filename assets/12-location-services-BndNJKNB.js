var e={id:`location-services`,h:{en:`Location services: RSSI, fingerprinting, AoA, FastLocate and their use cases`,hi:`Location services: RSSI, fingerprinting, AoA, FastLocate aur unke use cases`},body:{en:`
<p>A WLAN already hears every client and every tag that transmits. If several APs hear the same device, the network can estimate where the device is. ENCOR 1.2.b asks for the main principles and use cases of location services in a WLAN design. You do not configure a location server in the exam, but you must explain how the position is calculated, what limits accuracy, and what the business uses it for.</p>

<h3>An analogy: finding a phone by its ring</h3>
<p>Three friends stand in different corners of a house while a phone rings. Each says how loud it sounds. The one who hears it loudest is closest; combining all three answers narrows it to a room. If one friend has very good ears that can tell the direction of the sound, they can point straight at it (<b>angle of arrival</b>). And if the friends had walked around earlier recording how loud a test phone sounded in every room, they can match today's loudness pattern to that recording (<b>fingerprinting</b>).</p>

<h3>The techniques</h3>
<dl class="terms">
<dt>RSSI trilateration</dt><dd>Each AP's RSSI is converted into an estimated distance using a path-loss model; with three or more APs the circles intersect at the estimated position. Simple, works with any AP, typical accuracy about 5–10 m.</dd>
<dt>RF fingerprinting</dt><dd>Instead of a simple model, the location engine uses the floor map with walls and materials, or a <b>calibration</b> walk where known positions are measured. Today's readings are matched against that expected pattern. Better indoors where walls distort signal strength.</dd>
<dt>AoA (angle of arrival)</dt><dd>An antenna array measures the phase difference of the signal on its elements to compute the direction. Cisco's Hyperlocation modules and some Catalyst 9100 APs use this for about 1–3 m accuracy.</dd>
<dt>TDoA (time difference of arrival)</dt><dd>Several time-synchronised APs record when a signal arrives; the time differences give the position. Used mainly outdoors and for active RFID tags over large areas.</dd>
<dt>FastLocate</dt><dd>Traditionally only <b>probe requests</b> were used, and phones probe irregularly (every few minutes when idle). FastLocate lets local-mode APs sample RSSI from ordinary <b>data packets</b> of associated clients as well, giving far more frequent updates.</dd>
<dt>BLE</dt><dd>Many APs include a Bluetooth Low Energy radio. BLE beacons and tags add another source for wayfinding and asset tracking.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="RSSI trilateration">
<circle cx="200" cy="90" r="80" fill="#bae6fd" fill-opacity="0.45" stroke="#64748b"/><circle cx="360" cy="90" r="95" fill="#bbf7d0" fill-opacity="0.45" stroke="#64748b"/><circle cx="280" cy="200" r="70" fill="#fde68a" fill-opacity="0.5" stroke="#64748b"/>
<rect x="190" y="80" width="20" height="20" fill="#ddd6fe"/><text x="200" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP1 −58</text>
<rect x="350" y="80" width="20" height="20" fill="#ddd6fe"/><text x="360" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP2 −63</text>
<rect x="270" y="190" width="20" height="20" fill="#ddd6fe"/><text x="280" y="230" text-anchor="middle" class="svg-ink" font-size="12">AP3 −55</text>
<circle cx="275" cy="140" r="7" fill="#64748b"/><text x="300" y="145" class="svg-accent" font-size="13">estimated client</text>
<text x="520" y="70" class="svg-muted" font-size="12">stronger RSSI</text><text x="520" y="88" class="svg-muted" font-size="12">= smaller circle</text>
</svg><p class="cap">Three or more APs hearing a device give intersecting distance estimates; walls make the circles fuzzy.</p></div>

<h3>How the pieces fit</h3>
<p>APs (in local mode with off-channel scanning, or better, dedicated <b>monitor-mode</b> APs that scan all channels) measure RSSI for every device. The controller collects those measurements and streams them over <b>NMSP</b> (Network Mobility Services Protocol, TCP 16113) to a location engine: historically Cisco <b>CMX</b> (Connected Mobile Experiences) on premises, which is end of life, today <b>Cisco Spaces</b> in the cloud (formerly DNA Spaces), with a connector. Location is concept only in the lab (no location engine is simulated); Spaces is covered in module <b>wl-auto</b> (Wireless automation and Spaces). The engine combines the readings with the floor maps (imported from Prime Infrastructure or Catalyst Center, formerly DNA Center) and produces positions, history and analytics.</p>

<h3>What limits accuracy</h3>
<ul><li><b>AP placement and density</b>: the device should be heard by at least three, ideally four or more APs at −75 dBm or better. APs only along a corridor, or all in the middle of a floor, cannot triangulate the edges; location-grade designs place APs along the perimeter and in a staggered grid (roughly 15–20 m apart).</li>
<li><b>Update rate</b>: idle phones probe rarely; FastLocate or associated traffic improves it.</li>
<li><b>Environment</b>: metal shelves, glass and moving crowds change RSSI; calibration and good maps matter.</li>
<li><b>MAC randomisation</b>: modern phones use random MAC addresses in probes and often per SSID, so anonymous visitor tracking counts devices less reliably; associated devices with authentication are easier to follow.</li></ul>

<h3>Use cases</h3>
<table class="cmp"><tr><th>Use case</th><th>Example</th></tr>
<tr><td>Asset tracking</td><td>Hospital infusion pumps and wheelchairs with Wi-Fi or BLE tags</td></tr>
<tr><td>Wayfinding</td><td>Airport or campus app showing "you are here" and a route</td></tr>
<tr><td>Occupancy and presence analytics</td><td>How many people used the third floor; meeting-room utilisation; retail dwell time</td></tr>
<tr><td>Security</td><td>Locating a rogue AP or an attacking client on the floor map (wIPS)</td></tr>
<tr><td>Safety and compliance</td><td>Finding a caller or a staff duress button; evacuation headcount</td></tr>
<tr><td>Troubleshooting</td><td>Seeing where a client was when it reported poor RSSI</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A hospital wants to find infusion pumps within one room (about 5 m). The current design has APs every 30 m down the corridor centre. A tag in a patient room is heard by two APs at −72 and −80 dBm: not enough. The redesign adds APs inside alternate rooms along the outer wall (perimeter), turns a few into monitor mode, and uses BLE tags. Tags are now heard by four APs at −55 to −70 dBm, and accuracy improves to room level.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Expecting a coverage design (for data) to deliver location accuracy; location needs more APs and perimeter placement. (2) Forgetting the floor maps: without accurate scale and wall materials, RSSI-based estimates drift. (3) Assuming a phone in a pocket updates every second; without FastLocate or traffic it may be minutes.</p></div>

<div class="exam"><p><b>Exam traps.</b> RSSI trilateration needs at least 3 APs; AoA (Hyperlocation) gives the best accuracy (1–3 m); TDoA needs time-synchronised APs and suits outdoor RFID. FastLocate samples data packets, not just probes. The controller sends location data to CMX / Cisco Spaces using NMSP.</p></div>

<div class="scn"><h4>The rogue AP in the storeroom</h4><p>wIPS reported a rogue AP broadcasting the company's SSID. The security team could not find it on a floor of 60 offices. The engineer opened the location view: the rogue was heard by five APs, two of them in monitor mode, and the location engine placed it within about 5 m of the storeroom. A walk with a handheld analyser confirmed a small travel router behind a box, plugged in by a contractor. It was removed and its switch port shut.</p><p><b>Lesson:</b> location services are not only for marketing; monitor-mode APs and good maps turn security alerts into a place you can walk to.</p></div>

<div class="iv"><p class="q">"How does a Wi-Fi network locate a device, and how would you improve accuracy?"</p><p>Strong answer: APs measure the device's RSSI (from probes, or data frames with FastLocate); a location engine (CMX or Cisco Spaces, fed over NMSP) applies trilateration or fingerprinting against the floor map. For more accuracy: ensure 3–4+ APs hear each device at −75 dBm or better, place APs along the perimeter, calibrate, add monitor-mode APs, and use AoA hardware such as Hyperlocation for 1–3 m. Mention use cases like asset tracking and rogue location.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Techniques: RSSI trilateration (5–10 m), RF fingerprinting, AoA (1–3 m), TDoA (outdoor/RFID), BLE.</li>
<li>FastLocate samples data packets for faster updates than probe-only location.</li>
<li>Controller → NMSP (TCP 16113) → CMX or Cisco Spaces with floor maps.</li>
<li>Accuracy needs 3–4+ APs per device at −75 dBm or better and perimeter AP placement.</li>
<li>Use cases: assets, wayfinding, occupancy analytics, rogue location, safety, troubleshooting.</li>
</ul></div>
`,hi:`
<p>WLAN pehle se har client aur har transmit karne wale tag ko sunta hai. Agar kai APs ek hi device ko sunein, network andaaza laga sakta hai ki device kahan hai. ENCOR 1.2.b WLAN design mein location services ke main principles aur use cases poochta hai. Exam mein aap location server configure nahi karte, par aapko samjhana hai ki position kaise calculate hoti hai, accuracy ko kya limit karta hai, aur business ise kis liye use karta hai.</p>

<h3>Ek analogy: ghanti se phone dhoondhna</h3>
<p>Teen dost ghar ke alag kono mein khade hain aur ek phone baj raha hai. Har ek batata hai ki kitna tez sunai de raha hai. Jise sabse tez sunai de woh sabse paas hai; teeno jawab milakar kamra tay ho jaata hai. Agar ek dost ke kaan itne achhe hain ki aawaz ki direction bata sake, woh seedha us taraf ishara kar sakta hai (<b>angle of arrival</b>). Aur agar doston ne pehle ghoom kar har kamre mein ek test phone ki loudness record ki thi, to woh aaj ka loudness pattern us recording se match kar sakte hain (<b>fingerprinting</b>).</p>

<h3>Techniques</h3>
<dl class="terms">
<dt>RSSI trilateration</dt><dd>Har AP ka RSSI path-loss model se andaazan doori mein badla jaata hai; teen ya zyada APs ke saath circles andaazan position par milte hain. Simple, kisi bhi AP ke saath chalta hai, typical accuracy lagbhag 5–10 m.</dd>
<dt>RF fingerprinting</dt><dd>Simple model ki jagah location engine deewaron aur materials wala floor map use karta hai, ya ek <b>calibration</b> walk jismein jaani-maani positions naapi jaati hain. Aaj ki readings us expected pattern se match hoti hain. Indoor mein behtar jahan deewarein signal strength bigaadti hain.</dd>
<dt>AoA (angle of arrival)</dt><dd>Antenna array apne elements par signal ka phase difference naap kar direction nikaalta hai. Cisco ke Hyperlocation modules aur kuch Catalyst 9100 APs isse lagbhag 1–3 m accuracy dete hain.</dd>
<dt>TDoA (time difference of arrival)</dt><dd>Kai time-synchronised APs record karte hain ki signal kab pahuncha; time differences position dete hain. Mainly outdoor aur bade areas mein active RFID tags ke liye.</dd>
<dt>FastLocate</dt><dd>Pehle sirf <b>probe requests</b> use hote the, aur phones irregularly probe karte hain (idle mein har kuch minute). FastLocate local-mode APs ko associated clients ke aam <b>data packets</b> se bhi RSSI sample karne deta hai, jisse kahin zyada baar updates milte hain.</dd>
<dt>BLE</dt><dd>Bahut APs mein Bluetooth Low Energy radio hota hai. BLE beacons aur tags wayfinding aur asset tracking ke liye ek aur source jodte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="RSSI trilateration">
<circle cx="200" cy="90" r="80" fill="#bae6fd" fill-opacity="0.45" stroke="#64748b"/><circle cx="360" cy="90" r="95" fill="#bbf7d0" fill-opacity="0.45" stroke="#64748b"/><circle cx="280" cy="200" r="70" fill="#fde68a" fill-opacity="0.5" stroke="#64748b"/>
<rect x="190" y="80" width="20" height="20" fill="#ddd6fe"/><text x="200" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP1 −58</text>
<rect x="350" y="80" width="20" height="20" fill="#ddd6fe"/><text x="360" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP2 −63</text>
<rect x="270" y="190" width="20" height="20" fill="#ddd6fe"/><text x="280" y="230" text-anchor="middle" class="svg-ink" font-size="12">AP3 −55</text>
<circle cx="275" cy="140" r="7" fill="#64748b"/><text x="300" y="145" class="svg-accent" font-size="13">andaazan client</text>
<text x="520" y="70" class="svg-muted" font-size="12">strong RSSI</text><text x="520" y="88" class="svg-muted" font-size="12">= chhota circle</text>
</svg><p class="cap">Teen ya zyada APs ek device ko sunein to doori ke andaaze milte hain; deewarein circles ko dhundhla karti hain.</p></div>

<h3>Pieces kaise judte hain</h3>
<p>APs (off-channel scanning wale local mode mein, ya behtar, saare channels scan karne wale dedicated <b>monitor-mode</b> APs) har device ka RSSI naapte hain. Controller measurements ikattha karke <b>NMSP</b> (Network Mobility Services Protocol, TCP 16113) par location engine ko stream karta hai: pehle on-premises Cisco <b>CMX</b> (Connected Mobile Experiences), jo end of life hai, aaj cloud mein <b>Cisco Spaces</b> (pehle DNA Spaces), ek connector ke saath. Lab mein location concept only hai (koi location engine simulate nahi hota); Spaces module <b>wl-auto</b> (Wireless automation and Spaces) mein hai. Engine readings ko floor maps (Prime Infrastructure ya Catalyst Center, pehle DNA Center, se import) se jodkar positions, history aur analytics banata hai.</p>

<h3>Accuracy ko kya limit karta hai</h3>
<ul><li><b>AP placement aur density</b>: device ko kam se kam teen, behtar chaar ya zyada APs −75 dBm ya behtar par sunein. Sirf corridor ke saath, ya sab floor ke beech mein lage APs edges ko triangulate nahi kar sakte; location-grade designs APs ko perimeter ke saath aur staggered grid mein (lagbhag 15–20 m door) lagate hain.</li>
<li><b>Update rate</b>: idle phones kam probe karte hain; FastLocate ya associated traffic isse behtar karta hai.</li>
<li><b>Environment</b>: metal shelves, glass aur chalti bheed RSSI badalte hain; calibration aur achhe maps matter karte hain.</li>
<li><b>MAC randomisation</b>: modern phones probes mein aur aksar har SSID ke liye random MAC addresses use karte hain, isliye anonymous visitor tracking devices ko kam reliably ginti hai; authentication wale associated devices follow karna aasaan hai.</li></ul>

<h3>Use cases</h3>
<table class="cmp"><tr><th>Use case</th><th>Example</th></tr>
<tr><td>Asset tracking</td><td>Hospital ke infusion pumps aur wheelchairs Wi-Fi ya BLE tags ke saath</td></tr>
<tr><td>Wayfinding</td><td>Airport ya campus app jo "aap yahan ho" aur raasta dikhaye</td></tr>
<tr><td>Occupancy aur presence analytics</td><td>Teesri manzil kitne logon ne use ki; meeting-room utilisation; retail dwell time</td></tr>
<tr><td>Security</td><td>Floor map par rogue AP ya attacking client dhoondhna (wIPS)</td></tr>
<tr><td>Safety aur compliance</td><td>Caller ya staff duress button dhoondhna; evacuation headcount</td></tr>
<tr><td>Troubleshooting</td><td>Dekhna ki client kahan tha jab usne kharab RSSI report kiya</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek hospital infusion pumps ko ek kamre (lagbhag 5 m) ke andar dhoondhna chahta hai. Current design mein corridor ke beech har 30 m par APs hain. Patient room ka ek tag do APs ko −72 aur −80 dBm par sunai deta hai: kaafi nahi. Redesign bahari deewar (perimeter) ke saath ek-chhod-ek kamron ke andar APs jodta hai, kuch ko monitor mode mein daalta hai, aur BLE tags use karta hai. Ab tags chaar APs ko −55 se −70 dBm par sunai dete hain, aur accuracy room level tak aa jaati hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Data ke liye bane coverage design se location accuracy expect karna; location ko zyada APs aur perimeter placement chahiye. (2) Floor maps bhoolna: sahi scale aur wall materials ke bina RSSI-based estimates bhatakte hain. (3) Maanna ki jeb mein rakha phone har second update karta hai; FastLocate ya traffic ke bina yeh minutes ho sakte hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> RSSI trilateration ko kam se kam 3 APs chahiye; AoA (Hyperlocation) sabse achhi accuracy (1–3 m) deta hai; TDoA ko time-synchronised APs chahiye aur outdoor RFID ke liye theek hai. FastLocate sirf probes nahi, data packets sample karta hai. Controller location data NMSP se CMX / Cisco Spaces ko bhejta hai.</p></div>

<div class="scn"><h4>Storeroom mein rogue AP</h4><p>wIPS ne company ka SSID broadcast karta ek rogue AP report kiya. Security team 60 offices wale floor par use dhoondh nahi paayi. Engineer ne location view khola: rogue ko paanch APs sun rahe the, jinmein do monitor mode mein the, aur location engine ne use storeroom ke lagbhag 5 m ke andar rakha. Handheld analyser ke saath walk ne ek dabbe ke peeche chhota travel router confirm kiya, jo ek contractor ne lagaya tha. Use hataya gaya aur uska switch port shut kiya gaya.</p><p><b>Lesson:</b> location services sirf marketing ke liye nahi; monitor-mode APs aur achhe maps security alerts ko ek aisi jagah bana dete hain jahan aap chal kar pahunch sako.</p></div>

<div class="iv"><p class="q">"Wi-Fi network device ko kaise locate karta hai, aur aap accuracy kaise badhaoge?"</p><p>Strong answer: APs device ka RSSI naapte hain (probes se, ya FastLocate ke saath data frames se); location engine (CMX ya Cisco Spaces, NMSP se feed) floor map ke against trilateration ya fingerprinting lagata hai. Zyada accuracy ke liye: har device ko 3–4+ APs −75 dBm ya behtar par sunein, APs perimeter ke saath lagao, calibrate karo, monitor-mode APs jodo, aur 1–3 m ke liye Hyperlocation jaisa AoA hardware use karo. Asset tracking aur rogue location jaise use cases batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Techniques: RSSI trilateration (5–10 m), RF fingerprinting, AoA (1–3 m), TDoA (outdoor/RFID), BLE.</li>
<li>FastLocate probe-only location se tez updates ke liye data packets sample karta hai.</li>
<li>Controller → NMSP (TCP 16113) → floor maps ke saath CMX ya Cisco Spaces.</li>
<li>Accuracy ke liye har device par 3–4+ APs −75 dBm ya behtar par aur perimeter AP placement chahiye.</li>
<li>Use cases: assets, wayfinding, occupancy analytics, rogue location, safety, troubleshooting.</li>
</ul></div>
`}};export{e as default};