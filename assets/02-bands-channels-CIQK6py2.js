var e={id:`bands-channels`,h:{en:`Bands and channels: 2.4, 5 and 6 GHz`,hi:`Bands aur channels: 2.4, 5 aur 6 GHz`},body:{en:`
<p>Wi-Fi uses radio waves in unlicensed spectrum: anyone may transmit there, within the power rules of the country. Three bands matter today. This chapter explains what each band offers, how channels are numbered, why only three 2.4 GHz channels are usable together, and what regulators and the lab controller do with the country setting.</p>

<h3>Frequency, wavelength and why bands behave differently</h3>
<p>A radio wave has a <b>frequency</b> measured in hertz (Hz). 2.4 GHz means 2.4 billion cycles per second. Lower frequencies have longer waves; longer waves travel further and pass through walls more easily. Higher frequencies carry more data but lose strength faster and are absorbed by walls, glass and people. This is the root of every band decision:</p>
<table class="cmp"><tr><th>Band</th><th>Range</th><th>Channels (20 MHz)</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>2.4 GHz</td><td>2400 to 2483.5 MHz</td><td>1 to 13 in most countries (14 only in Japan); only 3 non-overlapping</td><td>Long range, every legacy device supports it</td><td>Crowded: microwaves, Bluetooth, neighbours; very little capacity</td></tr>
<tr><td>5 GHz</td><td>5150 to 5850 MHz (subranges differ by country)</td><td>Up to 25 real 20 MHz channels (36 to 165); the lab model lists 24 (it leaves out 144); all non-overlapping at 20 MHz</td><td>Many clean channels, higher rates</td><td>Shorter range; some channels need DFS</td></tr>
<tr><td>6 GHz</td><td>5925 to 7125 MHz (Wi-Fi 6E and 7)</td><td>Up to 59 channels of 20 MHz</td><td>Cleanest spectrum, no legacy devices, wide channels</td><td>Shortest range; only newer clients; rules differ per country</td></tr>
</table>

<h3>Channels and overlap</h3>
<p>The band is cut into <b>channels</b>. In 2.4 GHz, channel numbers are 5 MHz apart (channel 1 is 2412 MHz, channel 6 is 2437 MHz, channel 11 is 2462 MHz), but one Wi-Fi signal is about 20 to 22 MHz wide. So channel 1 and channel 2 overlap almost completely. Only channels whose centres are at least 25 MHz apart avoid each other: <b>1, 6 and 11</b> (1, 5, 9, 13 is sometimes used in ETSI regions, but 1, 6, 11 is the standard plan). The lab model uses the same rule: two 2.4 GHz channels overlap when they are fewer than 5 channel numbers apart; in 5 GHz at 20 MHz, they overlap only if they are the same channel.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="170" x2="610" y2="170" stroke="#64748b"/>
<path d="M30 170 Q100 40 170 170" fill="#bae6fd" stroke="#64748b"/><text x="100" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 1</text>
<path d="M240 170 Q310 40 380 170" fill="#bbf7d0" stroke="#64748b"/><text x="310" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 6</text>
<path d="M450 170 Q520 40 590 170" fill="#fde68a" stroke="#64748b"/><text x="520" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 11</text>
<path d="M120 170 Q190 70 260 170" fill="none" stroke="#dc2626" stroke-dasharray="4"/><text x="190" y="62" text-anchor="middle" class="svg-accent" font-size="12">Ch 3 overlaps both</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Each signal is about 22 MHz wide; 1, 6, 11 sit apart</text>
</svg><p class="cap">Channels 1, 6 and 11 do not overlap. A "creative" channel such as 3 damages two neighbours.</p></div>

<h3>Channel width</h3>
<p>Wi-Fi 4 and later can bond 20 MHz channels into 40, 80 and 160 MHz channels for higher speed. A wider channel uses more spectrum: in 2.4 GHz a 40 MHz channel leaves room for effectively one channel, so enterprises use 20 MHz there. In 5 GHz, 20 or 40 MHz is typical for dense designs, 80 MHz for light use. The lab model works at 20 MHz only; width is a concept here.</p>

<h3>DFS and the country list</h3>
<p>Part of the 5 GHz band (channels 52 to 144 in many countries) is shared with weather and military radar. APs must listen before using these channels and must leave within seconds if radar is detected: this is <b>Dynamic Frequency Selection (DFS)</b>. DFS channels are often free of neighbours, but a radar hit forces a channel change and a short outage, so avoid them for voice-critical areas in noisy radar zones. Each country has its own allowed channels and maximum power. In India (country code IN) the 5 GHz channels fall in a lower group (36 to 64), a middle DFS group and an upper group (149 to 165), and the exact list depends on the AP regulatory domain and the release, so read the allowed channel list on the controller (show ap dot11 5ghz summary and the country list) instead of trusting a table. The Wi-Fi standards that use these bands come in wl-standards (Wi-Fi standards). That is why a controller needs a <b>wireless country</b> setting, and why the lab shows radios staying off when the AP country is not on the controller list (you meet that in the wl-control module). The allowed channel lists in the lab model are 1 to 13 in 2.4 GHz and the 24 channels 36 to 165 in 5 GHz.</p>

<h3>Which band does a client choose?</h3>
<p>The client decides, not the AP. Many clients prefer 2.4 GHz because the signal looks stronger. Some devices support only one band: an old barcode scanner may be 2.4 GHz only and a modern handset may be 5 GHz only. This matters for the labs: LAPTOP1 in wl-co-channel is a 2.4 GHz-only device, and in wl-band-shutdown the handset is 5 GHz-only. You cannot just "turn off" a band without asking which devices need it.</p>

<pre class="code"><span class="c">! Controller view of channels and bands (lab model, exec mode)</span>
WLC1# show ap dot11 24ghz summary
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">6</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>

<div class="exam"><p><b>Exam trap.</b> "Which 2.4 GHz channels do not overlap?" is 1, 6 and 11 (20 MHz). A plan of 1, 4, 8, 11 sounds clever but channels 4 and 8 overlap with neighbours. Also remember: in 5 GHz at 20 MHz, adjacent channel numbers (36 and 40) do not overlap.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using 40 MHz channels in 2.4 GHz or enabling DFS everywhere without checking the client list. Some clients do not support DFS channels and simply never see the SSID.</p></div>

<div class="scn"><h4>The scanner that disappeared</h4><p>After a 5 GHz-only redesign, warehouse barcode scanners lost Wi-Fi. They were old 2.4 GHz-only models. The team enabled 2.4 GHz again on two APs per aisle at low power and kept 5 GHz for laptops.</p><p><b>Lesson:</b> before changing bands, list the client types and the bands each supports.</p></div>

<div class="iv"><p class="q">"Why are only channels 1, 6 and 11 recommended in 2.4 GHz?"</p><p>Each channel is about 22 MHz wide but channel numbers are only 5 MHz apart, so only channels five apart or more avoid overlap, and 1, 6, 11 fit inside the band. Add that 5 GHz offers many non-overlapping 20 MHz channels, with DFS on some of them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lower frequency means longer range, higher frequency means more capacity and less range.</li>
<li>2.4 GHz has three usable channels (1, 6, 11); 5 GHz and 6 GHz have many.</li>
<li>Overlapping but different 2.4 GHz channels are worse than the same channel, as you will see.</li>
<li>DFS channels share spectrum with radar and may force a channel change.</li>
<li>Always ask which bands your clients support before shutting a band down.</li>
</ul></div>
`,hi:`
<p>Wi-Fi unlicensed spectrum mein radio waves use karta hai: wahan koi bhi transmit kar sakta hai, bas desh ke power rules ke andar. Aaj teen bands matter karte hain. Yeh chapter samjhata hai ki har band kya deta hai, channels ka numbering kaise hota hai, 2.4 GHz mein sirf teen channels ek saath kyun usable hain, aur regulators aur lab controller country setting ke saath kya karte hain.</p>

<h3>Frequency, wavelength aur bands alag kyun behave karte hain</h3>
<p>Radio wave ki <b>frequency</b> hertz (Hz) mein naapi jaati hai. 2.4 GHz matlab 2.4 billion cycles per second. Low frequency ki waves lambi hoti hain; lambi waves door tak jaati hain aur deewaron se aasani se guzarti hain. High frequency zyada data le jaati hai lekin strength jaldi kho deti hai aur deewar, glass aur logon se absorb hoti hai. Har band decision ki jad yahi hai:</p>
<table class="cmp"><tr><th>Band</th><th>Range</th><th>Channels (20 MHz)</th><th>Strengths</th><th>Weaknesses</th></tr>
<tr><td>2.4 GHz</td><td>2400 se 2483.5 MHz</td><td>Zyadatar deshon mein 1 se 13 (14 sirf Japan mein); sirf 3 non-overlapping</td><td>Long range, har legacy device support karta hai</td><td>Crowded: microwave, Bluetooth, padosi; capacity bahut kam</td></tr>
<tr><td>5 GHz</td><td>5150 se 5850 MHz (subranges desh ke hisaab se alag)</td><td>Real mein 25 tak 20 MHz channels (36 se 165); lab model 24 dikhata hai (channel 144 chhoot jaata hai); 20 MHz par sab non-overlapping</td><td>Bahut saare clean channels, higher rates</td><td>Short range; kuch channels ko DFS chahiye</td></tr>
<tr><td>6 GHz</td><td>5925 se 7125 MHz (Wi-Fi 6E aur 7)</td><td>20 MHz ke 59 channels tak</td><td>Sabse clean spectrum, koi legacy device nahi, wide channels</td><td>Sabse short range; sirf naye clients; rules desh ke hisaab se alag</td></tr>
</table>

<h3>Channels aur overlap</h3>
<p>Band ko <b>channels</b> mein kaata jaata hai. 2.4 GHz mein channel numbers 5 MHz door hain (channel 1 = 2412 MHz, channel 6 = 2437 MHz, channel 11 = 2462 MHz), lekin ek Wi-Fi signal lagbhag 20 se 22 MHz chaudi hoti hai. Isliye channel 1 aur channel 2 lagbhag poori tarah overlap karte hain. Sirf woh channels ek dusre se bachte hain jinke centres kam se kam 25 MHz door hon: <b>1, 6 aur 11</b> (ETSI regions mein kabhi 1, 5, 9, 13 bhi use hota hai, lekin standard plan 1, 6, 11 hai). Lab model yahi rule use karta hai: do 2.4 GHz channels overlap karte hain jab unke numbers mein 5 se kam ka farak ho; 5 GHz mein 20 MHz par woh sirf tab overlap karte hain jab same channel ho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="170" x2="610" y2="170" stroke="#64748b"/>
<path d="M30 170 Q100 40 170 170" fill="#bae6fd" stroke="#64748b"/><text x="100" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 1</text>
<path d="M240 170 Q310 40 380 170" fill="#bbf7d0" stroke="#64748b"/><text x="310" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 6</text>
<path d="M450 170 Q520 40 590 170" fill="#fde68a" stroke="#64748b"/><text x="520" y="190" text-anchor="middle" class="svg-ink" font-size="12">Ch 11</text>
<path d="M120 170 Q190 70 260 170" fill="none" stroke="#dc2626" stroke-dasharray="4"/><text x="190" y="62" text-anchor="middle" class="svg-accent" font-size="12">Ch 3 dono se overlap</text>
<text x="320" y="20" text-anchor="middle" class="svg-muted" font-size="12">Har signal lagbhag 22 MHz chaudi; 1, 6, 11 door door hain</text>
</svg><p class="cap">Channels 1, 6 aur 11 overlap nahi karte. Ek "creative" channel jaise 3 do padosiyon ko kharab karta hai.</p></div>

<h3>Channel width</h3>
<p>Wi-Fi 4 aur usse aage ke standards 20 MHz channels ko jodkar 40, 80 aur 160 MHz channels bana sakte hain, zyada speed ke liye. Wider channel zyada spectrum leta hai: 2.4 GHz mein 40 MHz channel se effectively sirf ek channel bachta hai, isliye enterprises wahan 20 MHz use karte hain. 5 GHz mein dense designs ke liye 20 ya 40 MHz typical hai, light use ke liye 80 MHz. Lab model sirf 20 MHz par chalta hai; width yahan concept hai.</p>

<h3>DFS aur country list</h3>
<p>5 GHz band ka ek hissa (kai deshon mein channels 52 se 144) weather aur military radar ke saath shared hai. APs ko in channels ko use karne se pehle sunna padta hai aur radar detect hone par kuch seconds mein chhodna padta hai: yeh <b>Dynamic Frequency Selection (DFS)</b> hai. DFS channels aksar padosiyon se free hote hain, lekin radar hit hone par channel change aur chhota outage hota hai, isliye radar-heavy zones mein voice-critical areas ke liye inse bacho. Har desh ke apne allowed channels aur maximum power hote hain. Isi liye controller ko <b>wireless country</b> setting chahiye, aur isi liye lab mein radios off rehte hain jab AP country controller list mein nahi hoti (yeh aap wl-control module mein dekhoge). Lab model mein allowed channel lists 2.4 GHz mein 1 se 13 aur 5 GHz mein 36 se 165 tak ke 24 channels hain. India (country code IN) mein 5 GHz channels ek lower group (36 se 64), ek middle DFS group aur ek upper group (149 se 165) mein aate hain, aur exact list AP regulatory domain aur release par depend karti hai, isliye table par bharosa karne ke bajay controller par allowed channel list padho (show ap dot11 5ghz summary aur country list). In bands ko use karne wale Wi-Fi standards wl-standards (Wi-Fi standards) mein aate hain.</p>

<h3>Client kaunsa band chunta hai?</h3>
<p>Client decide karta hai, AP nahi. Kai clients 2.4 GHz prefer karte hain kyunki signal zyada strong dikhta hai. Kuch devices sirf ek band support karte hain: purana barcode scanner 2.4 GHz-only ho sakta hai aur modern handset 5 GHz-only. Labs ke liye yeh matter karta hai: wl-co-channel mein LAPTOP1 2.4 GHz-only device hai, aur wl-band-shutdown mein handset 5 GHz-only hai. Bina poochhe ki kin devices ko band chahiye, aap band ko bas "off" nahi kar sakte.</p>

<pre class="code"><span class="c">! Controller view of channels and bands (lab model, exec mode)</span>
WLC1# show ap dot11 24ghz summary
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4401  Enabled   <span class="hl">6</span>        1
AP2                  All      0011.2233.4411  Enabled   <span class="hl">6</span>        1</pre>

<div class="exam"><p><b>Exam trap.</b> "Kaunse 2.4 GHz channels overlap nahi karte?" jawab 1, 6 aur 11 (20 MHz). 1, 4, 8, 11 ka plan smart lagta hai lekin channels 4 aur 8 padosiyon se overlap karte hain. Yeh bhi yaad rakho: 5 GHz mein 20 MHz par adjacent channel numbers (36 aur 40) overlap nahi karte.</p></div>

<div class="warn"><p><b>Common galti.</b> 2.4 GHz mein 40 MHz channels use karna ya client list dekhe bina har jagah DFS enable karna. Kuch clients DFS channels support nahi karte aur SSID kabhi dekh hi nahi paate.</p></div>

<div class="scn"><h4>Scanner jo gaayab ho gaya</h4><p>Sirf 5 GHz wale redesign ke baad warehouse ke barcode scanners ka Wi-Fi chala gaya. Woh purane 2.4 GHz-only models the. Team ne har aisle mein do APs par 2.4 GHz low power par wapas enable kiya aur laptops ke liye 5 GHz rakha.</p><p><b>Seekh:</b> bands badalne se pehle client types aur unke supported bands ki list banao.</p></div>

<div class="iv"><p class="q">"2.4 GHz mein sirf channels 1, 6 aur 11 kyun recommend hote hain?"</p><p>Har channel lagbhag 22 MHz chaudi hai lekin channel numbers sirf 5 MHz door hain, isliye sirf paanch ya zyada door channels overlap se bachte hain, aur 1, 6, 11 band ke andar fit hote hain. Jodo ki 5 GHz mein bahut saare non-overlapping 20 MHz channels hain, kuch par DFS ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Low frequency matlab zyada range, high frequency matlab zyada capacity aur kam range.</li>
<li>2.4 GHz mein teen usable channels (1, 6, 11); 5 GHz aur 6 GHz mein bahut saare.</li>
<li>Overlapping lekin alag 2.4 GHz channels same channel se bhi bure ho sakte hain, aage dekhoge.</li>
<li>DFS channels radar ke saath spectrum share karte hain aur channel change force kar sakte hain.</li>
<li>Band shut karne se pehle hamesha poocho ki clients kaunsa band support karte hain.</li>
</ul></div>
`}};export{e as default};