var e=e=>`<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="`+e.aria+`"><text x="10" y="22" class="svg-accent" font-size="13">`+e.b1+`</text><rect x="10" y="30" width="620" height="34" rx="4" fill="#e2e8f0"/><rect x="20" y="34" width="150" height="26" rx="4" fill="#bae6fd" stroke="#64748b"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ch 1</text><rect x="250" y="34" width="150" height="26" rx="4" fill="#bbf7d0" stroke="#64748b"/><text x="325" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ch 6</text><rect x="470" y="34" width="150" height="26" rx="4" fill="#ddd6fe" stroke="#64748b"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="12">Ch 11</text><text x="10" y="92" class="svg-accent" font-size="13">`+e.b2+`</text><rect x="10" y="100" width="620" height="34" rx="4" fill="#e2e8f0"/><rect x="14" y="104" width="100" height="26" fill="#bae6fd" stroke="#64748b"/><text x="64" y="121" text-anchor="middle" class="svg-ink" font-size="12">UNII-1</text><rect x="120" y="104" width="100" height="26" fill="#fde68a" stroke="#64748b"/><text x="170" y="121" text-anchor="middle" class="svg-ink" font-size="12">UNII-2A DFS</text><rect x="226" y="104" width="230" height="26" fill="#fed7aa" stroke="#64748b"/><text x="341" y="121" text-anchor="middle" class="svg-ink" font-size="12">UNII-2C DFS</text><rect x="462" y="104" width="160" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="542" y="121" text-anchor="middle" class="svg-ink" font-size="12">UNII-3</text><text x="10" y="162" class="svg-accent" font-size="13">`+e.b3+`</text><rect x="10" y="170" width="620" height="34" rx="4" fill="#e2e8f0"/><rect x="14" y="174" width="150" height="26" fill="#bae6fd" stroke="#64748b"/><text x="89" y="191" text-anchor="middle" class="svg-ink" font-size="12">UNII-5</text><rect x="170" y="174" width="90" height="26" fill="#fde68a" stroke="#64748b"/><text x="215" y="191" text-anchor="middle" class="svg-ink" font-size="12">UNII-6</text><rect x="266" y="174" width="190" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="361" y="191" text-anchor="middle" class="svg-ink" font-size="12">UNII-7</text><rect x="462" y="174" width="160" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="542" y="191" text-anchor="middle" class="svg-ink" font-size="12">UNII-8</text><rect x="10" y="222" width="300" height="66" rx="6" fill="#f8fafc" stroke="#64748b"/><text x="20" y="242" class="svg-ink" font-size="12">`+e.n1+`</text><text x="20" y="260" class="svg-ink" font-size="12">`+e.n2+`</text><text x="20" y="278" class="svg-ink" font-size="12">`+e.n3+`</text><rect x="330" y="222" width="300" height="66" rx="6" fill="#f8fafc" stroke="#64748b"/><text x="340" y="242" class="svg-ink" font-size="12">`+e.m1+`</text><text x="340" y="260" class="svg-ink" font-size="12">`+e.m2+`</text><text x="340" y="278" class="svg-ink" font-size="12">`+e.m3+`</text></svg><p class="cap">`+e.cap+`</p></div>`,t=e({aria:`Wi-Fi bands compared`,b1:`2.4 GHz: only 3 clean 20 MHz channels`,b2:`5 GHz: many channels, DFS blocks marked`,b3:`6 GHz: up to 1200 MHz (US), no old clients`,n1:`Range: 2.4 > 5 > 6 GHz`,n2:`Capacity: 6 > 5 > 2.4 GHz`,n3:`Walls hurt higher bands more`,m1:`3 dB = 2x or half the power`,m2:`10 dB = 10x or one tenth`,m3:`Path loss: +6 dB per double distance`,cap:`Band overview (not to scale). Exact channel counts depend on the regulatory domain, so always confirm for the country of the site.`}),n=e({aria:`Wi-Fi bands compared`,b1:`2.4 GHz: sirf 3 clean 20 MHz channels`,b2:`5 GHz: bahut channels, DFS blocks marked`,b3:`6 GHz: 1200 MHz tak (US), purane clients nahi`,n1:`Range: 2.4 > 5 > 6 GHz`,n2:`Capacity: 6 > 5 > 2.4 GHz`,n3:`Walls higher bands ko zyada rokti hain`,m1:`3 dB = power 2x ya aadha`,m2:`10 dB = 10x ya dasva hissa`,m3:`Path loss: har double distance par +6 dB`,cap:`Band overview (scale nahi). Exact channel counts regulatory domain par depend karte hain, isliye site ke country ke liye hamesha confirm karo.`}),r={id:`rf-fundamentals`,h:{en:`RF fundamentals for design: bands, standards, SNR and interference`,hi:`Design ke liye RF fundamentals: bands, standards, SNR aur interference`},body:{en:`
<p>A design engineer does not need to derive antenna equations, but must predict how the radio will behave in a building. This chapter gives you the RF facts that drive every later choice: bands, channel widths, Wi-Fi generations, signal and noise targets, and the two kinds of interference.</p>

<h3>Case: Hotel Marigold Bay, 240 rooms</h3>
<p>Hotel Marigold Bay (fictional) has a long corridor of guest rooms on eight floors. The 2.4 GHz network was "fine" for years. After guests started streaming 4K video and video-calling from bed, the complaints began. The brief: reliable streaming in every room, a staff voice app, and a smart-room system (door locks, thermostats) that mostly uses 2.4 GHz IoT chips. Constraints: thick concrete between rooms, a fixed number of cable drops, and a budget that allows one AP per two rooms at most.</p>

<h3>The three bands</h3>
<ul>
<li><b>2.4 GHz.</b> Long range and good wall penetration, but only three non-overlapping 20 MHz channels (1, 6 and 11 in most regions) and lots of non-Wi-Fi interference: microwave ovens, Bluetooth, cordless devices. Many IoT and legacy clients live here.</li>
<li><b>5 GHz.</b> Many more channels, shorter range, less interference. Some channels need Dynamic Frequency Selection (DFS) because they are shared with radar. Supported by Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax) and Wi-Fi 7 (802.11be).</li>
<li><b>6 GHz.</b> Introduced for Wi-Fi 6E and used by Wi-Fi 7. In the US it offers 1200 MHz of spectrum (5925 to 7125 MHz), with room for several 160 MHz and 320 MHz channels. Only 6 GHz-capable clients use it, so there are no legacy 802.11b/g/n clients dragging performance down. Range is shorter again and WPA3 is mandatory there.</li>
</ul>
`+t+`
<h3>Wi-Fi generations in one table</h3>
<table class="cmp"><tr><th>Name</th><th>Standard</th><th>Bands</th><th>Design-relevant features</th></tr>
<tr><td>Wi-Fi 4</td><td>802.11n</td><td>2.4, 5</td><td>MIMO, 40 MHz channels</td></tr>
<tr><td>Wi-Fi 5</td><td>802.11ac</td><td>5</td><td>Wider channels (80/160 MHz), MU-MIMO downlink</td></tr>
<tr><td>Wi-Fi 6</td><td>802.11ax</td><td>2.4, 5</td><td>OFDMA, BSS colouring, target wake time, uplink MU-MIMO; better in dense areas</td></tr>
<tr><td>Wi-Fi 6E</td><td>802.11ax</td><td>6 added</td><td>Same features, clean new spectrum</td></tr>
<tr><td>Wi-Fi 7</td><td>802.11be</td><td>2.4, 5, 6</td><td>320 MHz channels in 6 GHz, multi-link operation, higher modulation</td></tr>
</table>
<p>The design point: a newer standard only helps when the <b>clients</b> support it. A hotel full of older phones gets limited benefit from a Wi-Fi 7 AP, though the extra radios and airtime efficiency still help.</p>

<h3>Channel width: a trade-off, not a free gain</h3>
<p>Wider channels (40, 80, 160 MHz) give higher peak data rates but use more spectrum, so you can create fewer non-overlapping cells. In a hotel with many APs close together, 20 or 40 MHz in 5 GHz is usually the right balance. In a small office with five APs, 80 MHz might be fine. In 2.4 GHz, use 20 MHz only.</p>

<h3>RSSI, noise and SNR</h3>
<dl class="terms"><dt>RSSI</dt><dd>Received signal strength, in dBm (a negative number; -60 is stronger than -80).</dd>
<dt>Noise floor</dt><dd>The background RF energy, typically around -90 to -95 dBm in a clean environment (typical range, not a guarantee).</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: signal minus noise, in dB. A signal of -65 dBm over a -95 dBm floor is 30 dB SNR.</dd></dl>
<div class="eg"><p><b>Worked example.</b> A guest phone hears the AP at -68 dBm. A microwave oven in a staff kitchen lifts the noise to -80 dBm. SNR drops from 27 dB to 12 dB, and the phone steps down to slow data rates. Signal did not change: noise did. This is why design targets are given as RSSI <b>and</b> SNR.</p></div>
<p>Typical planning targets (confirm with vendor guides): voice about -67 dBm with 25 dB SNR; general data about -70 dBm with 20 dB SNR; location about -67 dBm with several APs audible. Higher data rates need higher SNR, so cell edges that are "connected" can still be slow.</p>

<h3>The dB rules of thumb</h3>
<p>Remember: <b>+3 dB doubles power, -3 dB halves it; +10 dB is ten times</b>. Free-space path loss rises about 6 dB each time distance doubles. A wall or floor subtracts a further fixed amount (next chapter). You can reason with these three facts without a calculator.</p>

<h3>Multipath, co-channel and adjacent-channel interference</h3>
<ul>
<li><b>Multipath.</b> Signals bounce off walls, metal and floors and arrive at slightly different times. It can create dead spots or help MIMO. Metal-rich areas have strong multipath.</li>
<li><b>Co-channel interference (CCI).</b> Two APs on the same channel that hear each other must take turns. Nothing is corrupted but airtime is shared. Too many or too loud APs cause CCI, which is the usual real-world capacity killer.</li>
<li><b>Adjacent-channel interference (ACI).</b> APs on partly overlapping channels (like 2.4 GHz channels 1 and 4) corrupt each other's frames. It is worse than CCI, because neither side can defer properly. Use 1, 6 and 11 only.</li>
</ul>

<h3>Options for the hotel and the chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Trade-off</th></tr>
<tr><td>High-power APs in the corridor, 2.4 and 5 GHz</td><td>Few APs, cheap</td><td>Concrete walls block 5 GHz; 2.4 GHz overlaps floors; heavy CCI</td></tr>
<tr><td>One lower-power AP per two rooms, in-room mounting, 5 GHz at 20/40 MHz plus 6 GHz where clients support it</td><td>Strong signal, little interference, room for streaming</td><td>More APs and cabling</td></tr>
<tr><td>2.4 GHz only</td><td>Compatible with IoT</td><td>Only 3 channels; fails under streaming load</td></tr>
</table>
<p>Chosen: the second option. The 2.4 GHz radios stay on for IoT at low power with 20 MHz, 5 GHz carries guest video, and 6 GHz is enabled for new devices. Guests get a band-steered, WPA3-capable SSID.</p>

<div class="warn"><p><b>Common mistakes.</b> Turning on 80 or 160 MHz everywhere; setting every AP to maximum power; using channels 2, 3, 4 or 8 in 2.4 GHz; designing only to RSSI and ignoring the noise floor.</p></div>
<div class="exam"><p><b>Exam trap.</b> A higher band means shorter range and more wall loss, but more channels. A wider channel means fewer cells. Co-channel interference is shared airtime; adjacent-channel interference is corruption.</p></div>

<div class="scn"><h4>The 160 MHz hotel</h4><p>A new hotel enabled 160 MHz channels in 5 GHz so speed tests looked great in the lobby. After opening, upper floors had constant retries. With only a few non-overlapping 160 MHz channels, many neighbours shared the same one, and DFS radar events knocked cells off the air. The fix was to reduce to 20 MHz on most floors, 40 MHz in the lobby, and cut transmit power.</p><p><b>Lesson:</b> peak speed in one spot is not a design goal. Many clean cells are.</p></div>
<div class="iv"><p class="q">"Why not use 80 MHz channels everywhere to give users more speed?"</p><p>Strong answer: Wider channels cut the number of non-overlapping channels, so neighbouring APs share channels and cause co-channel interference. In a dense deployment, capacity per cell and cleanliness matter more than per-client peak speed. I would use 20 or 40 MHz in dense areas and wider only where cell reuse allows, based on the survey.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz has long range but only 3 clean channels; 5 GHz has more channels; 6 GHz is clean spectrum for Wi-Fi 6E and 7 clients.</li>
<li>Design targets use both RSSI and SNR; the noise floor matters.</li>
<li>+3 dB doubles power, +10 dB is ten times, and path loss rises about 6 dB per distance doubling.</li>
<li>Wider channels mean fewer cells; prefer 20 or 40 MHz in dense designs.</li>
<li>Co-channel interference shares airtime; adjacent-channel interference corrupts frames.</li>
</ul></div>
`,hi:`
<p>Design engineer ko antenna equations derive karne ki zaroorat nahi, lekin yeh predict karna aana chahiye ki building mein radio kaise behave karega. Yeh chapter aapko woh RF facts deta hai jo aage ki har choice ko drive karte hain: bands, channel widths, Wi-Fi generations, signal aur noise targets, aur do tarah ka interference.</p>

<h3>Case: Hotel Marigold Bay, 240 rooms</h3>
<p>Hotel Marigold Bay (fictional) mein aath floors par guest rooms ka lamba corridor hai. 2.4 GHz network saalon tak "theek" tha. Jab guests bed se 4K video stream aur video-call karne lage, tab shikayatein shuru hui. Brief: har room mein reliable streaming, staff voice app, aur smart-room system (door locks, thermostats) jo zyadatar 2.4 GHz IoT chips use karta hai. Constraints: rooms ke beech moti concrete, fixed cable drops, aur budget jo zyada se zyada do rooms par ek AP allow karta hai.</p>

<h3>Teen bands</h3>
<ul>
<li><b>2.4 GHz.</b> Lamba range aur achhi wall penetration, lekin sirf teen non-overlapping 20 MHz channels (zyadatar regions mein 1, 6 aur 11) aur bahut non-Wi-Fi interference: microwave ovens, Bluetooth, cordless devices. Bahut saare IoT aur legacy clients yahin rehte hain.</li>
<li><b>5 GHz.</b> Bahut zyada channels, chhota range, kam interference. Kuch channels ko Dynamic Frequency Selection (DFS) chahiye kyunki woh radar ke saath shared hain. Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax) aur Wi-Fi 7 (802.11be) support karte hain.</li>
<li><b>6 GHz.</b> Wi-Fi 6E ke liye aaya aur Wi-Fi 7 use karta hai. US mein 1200 MHz spectrum (5925 se 7125 MHz) milta hai, jisme kai 160 MHz aur 320 MHz channels ki jagah hai. Sirf 6 GHz-capable clients use karte hain, isliye purane 802.11b/g/n clients performance neeche nahi khinchte. Range phir chhota hota hai aur wahan WPA3 mandatory hai.</li>
</ul>
`+n+`
<h3>Wi-Fi generations ek table mein</h3>
<table class="cmp"><tr><th>Naam</th><th>Standard</th><th>Bands</th><th>Design se related features</th></tr>
<tr><td>Wi-Fi 4</td><td>802.11n</td><td>2.4, 5</td><td>MIMO, 40 MHz channels</td></tr>
<tr><td>Wi-Fi 5</td><td>802.11ac</td><td>5</td><td>Wider channels (80/160 MHz), MU-MIMO downlink</td></tr>
<tr><td>Wi-Fi 6</td><td>802.11ax</td><td>2.4, 5</td><td>OFDMA, BSS colouring, target wake time, uplink MU-MIMO; dense areas mein behtar</td></tr>
<tr><td>Wi-Fi 6E</td><td>802.11ax</td><td>6 add hua</td><td>Same features, clean naya spectrum</td></tr>
<tr><td>Wi-Fi 7</td><td>802.11be</td><td>2.4, 5, 6</td><td>6 GHz mein 320 MHz channels, multi-link operation, higher modulation</td></tr>
</table>
<p>Design point: naya standard tabhi madad karta hai jab <b>clients</b> use support karte hon. Purane phones se bhare hotel ko Wi-Fi 7 AP se limited fayda milta hai, halaanki extra radios aur airtime efficiency phir bhi madad karte hain.</p>

<h3>Channel width: trade-off hai, free gain nahi</h3>
<p>Wider channels (40, 80, 160 MHz) peak data rate zyada dete hain lekin zyada spectrum use karte hain, isliye kam non-overlapping cells ban paate hain. Bahut saare paas-paas APs wale hotel mein 5 GHz mein 20 ya 40 MHz aam taur par sahi balance hai. Paanch APs wale chhote office mein 80 MHz theek ho sakta hai. 2.4 GHz mein sirf 20 MHz use karo.</p>

<h3>RSSI, noise aur SNR</h3>
<dl class="terms"><dt>RSSI</dt><dd>Received signal strength, dBm mein (negative number; -60, -80 se strong hai).</dd>
<dt>Noise floor</dt><dd>Background RF energy, clean environment mein aam taur par -90 se -95 dBm (typical range, guarantee nahi).</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio: signal minus noise, dB mein. -95 dBm floor par -65 dBm signal 30 dB SNR hota hai.</dd></dl>
<div class="eg"><p><b>Worked example.</b> Guest phone AP ko -68 dBm par sunta hai. Staff kitchen ka microwave oven noise ko -80 dBm tak utha deta hai. SNR 27 dB se 12 dB ho jata hai, aur phone slow data rates par aa jata hai. Signal nahi badla: noise badha. Isiliye design targets RSSI <b>aur</b> SNR dono mein diye jate hain.</p></div>
<p>Typical planning targets (vendor guides se confirm karo): voice lagbhag -67 dBm aur 25 dB SNR; general data lagbhag -70 dBm aur 20 dB SNR; location lagbhag -67 dBm aur kai APs sunai dene chahiye. Higher data rates ko higher SNR chahiye, isliye cell edge jo "connected" hai woh phir bhi slow ho sakta hai.</p>

<h3>dB ke rules of thumb</h3>
<p>Yaad rakho: <b>+3 dB power double karta hai, -3 dB aadha; +10 dB das guna</b>. Free-space path loss har baar distance double hone par lagbhag 6 dB badhta hai. Wall ya floor ek fixed amount aur ghatata hai (agla chapter). In teen facts se aap bina calculator ke reason kar sakte ho.</p>

<h3>Multipath, co-channel aur adjacent-channel interference</h3>
<ul>
<li><b>Multipath.</b> Signals walls, metal aur floors se bounce hokar thode alag time par pahunchte hain. Isse dead spots ban sakte hain ya MIMO ko madad mil sakti hai. Metal-rich areas mein multipath strong hota hai.</li>
<li><b>Co-channel interference (CCI).</b> Same channel par do APs jo ek doosre ko sunte hain unhe baari-baari bolna padta hai. Kuch corrupt nahi hota lekin airtime share hota hai. Bahut zyada ya bahut loud APs CCI karte hain, jo real-world capacity ka sabse bada dushman hai.</li>
<li><b>Adjacent-channel interference (ACI).</b> Partly overlapping channels par APs (jaise 2.4 GHz channel 1 aur 4) ek doosre ke frames corrupt karte hain. Yeh CCI se bura hai kyunki dono side theek se defer nahi kar paate. Sirf 1, 6 aur 11 use karo.</li>
</ul>

<h3>Hotel ke options aur chosen design</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Trade-off</th></tr>
<tr><td>Corridor mein high-power APs, 2.4 aur 5 GHz</td><td>Kam APs, sasta</td><td>Concrete walls 5 GHz block karti hain; 2.4 GHz floors par overlap; heavy CCI</td></tr>
<tr><td>Do rooms par ek lower-power AP, in-room mounting, 5 GHz 20/40 MHz par aur jahan clients support karein wahan 6 GHz</td><td>Strong signal, kam interference, streaming ke liye jagah</td><td>Zyada APs aur cabling</td></tr>
<tr><td>Sirf 2.4 GHz</td><td>IoT ke saath compatible</td><td>Sirf 3 channels; streaming load mein fail</td></tr>
</table>
<p>Chosen: doosra option. 2.4 GHz radios IoT ke liye low power aur 20 MHz par on rehte hain, 5 GHz guest video chalata hai, aur naye devices ke liye 6 GHz enable hota hai. Guests ko band-steered, WPA3-capable SSID milta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Har jagah 80 ya 160 MHz on kar dena; har AP ko maximum power par rakhna; 2.4 GHz mein channel 2, 3, 4 ya 8 use karna; sirf RSSI se design karna aur noise floor ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Higher band ka matlab chhota range aur zyada wall loss, lekin zyada channels. Wider channel ka matlab kam cells. Co-channel interference shared airtime hai; adjacent-channel interference corruption hai.</p></div>

<div class="scn"><h4>160 MHz wala hotel</h4><p>Ek naye hotel ne 5 GHz mein 160 MHz channels enable kiye taaki lobby mein speed tests achhe dikhein. Opening ke baad upar ke floors par constant retries hone lage. Sirf kuch non-overlapping 160 MHz channels the, isliye bahut saare padosi same channel share kar rahe the, aur DFS radar events cells ko off-air kar dete the. Fix: zyadatar floors par 20 MHz, lobby mein 40 MHz, aur transmit power kam.</p><p><b>Lesson:</b> ek jagah ki peak speed design goal nahi hai. Bahut saare clean cells hain.</p></div>
<div class="iv"><p class="q">"Users ko zyada speed dene ke liye har jagah 80 MHz channels kyun na use karein?"</p><p>Strong answer: Wider channels non-overlapping channels ki ginti ghatate hain, isliye neighbouring APs channels share karte hain aur co-channel interference karte hain. Dense deployment mein capacity per cell aur cleanliness per-client peak speed se zyada matter karti hai. Main dense areas mein 20 ya 40 MHz use karunga aur wider sirf wahan jahan cell reuse allow kare, survey ke basis par.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz ka range lamba par sirf 3 clean channels; 5 GHz mein zyada channels; 6 GHz Wi-Fi 6E aur 7 clients ke liye clean spectrum hai.</li>
<li>Design targets RSSI aur SNR dono use karte hain; noise floor matter karta hai.</li>
<li>+3 dB power double karta hai, +10 dB das guna, aur path loss distance doubling par lagbhag 6 dB badhta hai.</li>
<li>Wider channels ka matlab kam cells; dense designs mein 20 ya 40 MHz prefer karo.</li>
<li>Co-channel interference airtime share karta hai; adjacent-channel interference frames corrupt karta hai.</li>
</ul></div>
`}};export{r as default};