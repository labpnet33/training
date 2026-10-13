var e={id:`regulatory`,h:{en:`Regulatory impacts: country rules, DFS and TPC (802.11h)`,hi:`Regulatory impacts: country rules, DFS aur TPC (802.11h)`},body:{en:`
<p>Radio spectrum is like public roads. You may drive without a licence on some roads (the unlicensed Wi-Fi bands), but the government still sets the speed limit (maximum power), says which lanes are open in your country (allowed channels), and orders you off the road when an ambulance comes (radar). Wi-Fi equipment must follow these rules, and when it does, some of your channels and power choices are made for you.</p>

<h3>Who makes the rules</h3>
<p>Every country has a regulator that decides how radio frequencies may be used: for example the FCC in the United States, the ETSI and national regulators in Europe, and the telecom ministry's wireless planning wing in India. Wi-Fi uses <b>unlicensed</b> (licence-exempt) bands, which means you do not apply for a licence per AP, but the equipment must be certified and must obey the limits for that country. The rules differ in three ways:</p>
<ul>
<li><b>Which channels are allowed.</b> In 2.4 GHz, North America allows channels 1 to 11, most of Europe and Asia allow 1 to 13, and Japan historically allowed 14 for 802.11b only. In 5 GHz and 6 GHz the allowed ranges vary even more.</li>
<li><b>Maximum power</b>, usually stated as <b>EIRP</b> (effective isotropic radiated power = transmitter power + antenna gain - cable loss). For example, European rules limit 2.4 GHz Wi-Fi to 20 dBm (100 mW) EIRP.</li>
<li><b>Extra behaviours</b> such as radar detection and power control on certain 5 GHz channels, or indoor-only use.</li>
</ul>
<p>That is why every AP or controller is configured with a <b>country code</b> (regulatory domain). It unlocks exactly the channels and power levels legal in that country. The <b>802.11d</b> amendment lets APs advertise the country, allowed channels and power limits in their beacons so that clients adjust automatically.</p>
<pre class="out">(WLC1) &gt;show 802.11a
802.11a Network.................................. Enabled
<span class="hl">Regulatory domain................................ IN</span>
Allowed channels................................. 36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140,149,153,157,161,165
Non-overlapping channels......................... all (20 MHz)</pre>

<h3>802.11h: DFS and TPC</h3>
<p>Parts of the 5 GHz band are shared with <b>radar</b> systems (weather radar, airport and military radar). Radar has priority. The <b>802.11h</b> amendment, first required in Europe and now used worldwide, adds two mechanisms:</p>
<dl class="terms">
<dt>DFS (dynamic frequency selection)</dt><dd>On DFS channels (U-NII-2A 52 to 64 and U-NII-2C 100 to 144) the AP must listen for radar before using the channel (a <b>channel availability check</b>, typically 60 seconds; up to 10 minutes on some weather-radar channels in Europe). If it detects radar while operating, it must stop transmitting on that channel within about 10 seconds, move its clients to another channel with a <b>channel switch announcement</b>, and avoid that channel for 30 minutes (the <b>non-occupancy period</b>).</dd>
<dt>TPC (transmit power control)</dt><dd>The AP advertises the local maximum power, and APs and clients reduce their power to the lowest level needed, which lowers interference with other users of the band.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DFS radar event timeline">
<rect x="20" y="70" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP on ch 52</text><text x="90" y="106" text-anchor="middle" class="svg-muted" font-size="12">after 60 s check</text>
<rect x="190" y="70" width="130" height="44" rx="8" fill="#fed7aa"/><text x="255" y="90" text-anchor="middle" class="svg-ink" font-size="13">Radar detected</text><text x="255" y="106" text-anchor="middle" class="svg-muted" font-size="12">stop within ~10 s</text>
<rect x="350" y="70" width="130" height="44" rx="8" fill="#fde68a"/><text x="415" y="90" text-anchor="middle" class="svg-ink" font-size="13">Channel switch</text><text x="415" y="106" text-anchor="middle" class="svg-muted" font-size="12">clients follow or drop</text>
<rect x="510" y="70" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="13">ch 52 banned</text><text x="565" y="106" text-anchor="middle" class="svg-muted" font-size="12">for 30 min</text>
<line x1="160" y1="92" x2="190" y2="92" stroke="#64748b" stroke-width="2"/><line x1="320" y1="92" x2="350" y2="92" stroke="#64748b" stroke-width="2"/><line x1="480" y1="92" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Users see a short outage or a drop to 2.4 GHz each time radar hits</text>
</svg><p class="cap">A DFS event. Frequent radar hits look like random disconnects to users.</p></div>

<h3>What this means for your design</h3>
<ul>
<li>DFS channels are legal and useful: they multiply your 5 GHz channel count. But near airports, ports, weather stations or military sites, radar events can cause short outages. In such places prefer non-DFS channels (36 to 48 and 149 to 165) for critical SSIDs, especially voice.</li>
<li>Some clients do not support DFS channels at all. If a site uses channel 100 and a device only scans U-NII-1 and U-NII-3, the device will never see that AP.</li>
<li>Set the correct country code. A wrong one can make your AP illegal, or can hide channels that clients expect.</li>
<li>6 GHz has its own rules: <b>low-power indoor (LPI)</b> APs can be used without coordination; <b>standard power</b> (for example outdoors) needs an <b>automated frequency coordination (AFC)</b> service that protects licensed microwave links. Some regions, such as Europe, have opened only the lower part of the 6 GHz band.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> In the lab, the installer left AP3 on 5 GHz channel 52 and AP4 on channel 100. Both are DFS channels. The office is 5 km from a weather radar, and users near AP3 and AP4 report drops several times a day. Moving the four APs to 36, 40, 44 and 48 (all U-NII-1, non-DFS) removes the radar risk and still gives every AP a unique channel.</p></div>
<pre class="out">(WLC1) &gt;show advanced 802.11a channel
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            36       5180      1 (20 dBm)   Up        AP2(36)
AP2            36       5180      1 (20 dBm)   Up        AP1(36)
<span class="hl">AP3            52       5260      1 (20 dBm)   Up        -</span>
<span class="hl">AP4            100      5500      1 (20 dBm)   Up        -</span></pre>

<div class="warn"><p><b>Common mistake.</b> Importing APs from another country, or leaving the default country code, to "unlock more channels or power". It breaks the law, can interfere with radar or licensed services, and clients may refuse channels that their own regulatory settings do not allow.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11h = DFS + TPC for coexistence with radar and other users in 5 GHz. 802.11d = country information in beacons. Do not confuse them with 802.11r (fast roaming), 802.11k (neighbour reports) or 802.11w (protected management frames).</p></div>

<div class="scn"><h4>The hospital wing that dropped every afternoon</h4><p>A hospital near an airport had voice badges that dropped calls in one wing at random times. Controller logs showed radar detection events on channels 52 and 60, with the APs jumping channels and badges losing association during each move. The engineer removed the DFS channels from the voice network's channel list, keeping 36 to 48 and 149 to 161, and left DFS channels for the guest SSID only.</p><p><b>Lesson:</b> DFS channels add capacity, but critical real-time services belong on non-DFS channels near radar.</p></div>

<div class="iv"><p class="q">"What is 802.11h and how does it affect channel planning?"</p><p>Strong answer: 802.11h adds dynamic frequency selection and transmit power control so Wi-Fi can share 5 GHz with radar. On DFS channels the AP must check for radar before use, vacate within about 10 seconds when radar is detected, and avoid the channel for 30 minutes. For planning: DFS channels add capacity, but near radar sources, and for voice or clients that do not support DFS, prefer U-NII-1 and U-NII-3. Always set the correct country code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Regulators decide allowed channels, maximum EIRP and extra behaviours per country; the AP's country code enforces them.</li>
<li>802.11h = DFS (radar detection and channel moves) + TPC (transmit power control) in 5 GHz.</li>
<li>DFS channels: 52 to 64 and 100 to 144; non-DFS: 36 to 48 and 149 to 165 (in most countries).</li>
<li>Radar events cause short outages and channel changes; avoid DFS for voice near radar.</li>
<li>6 GHz: low-power indoor needs no coordination; standard power needs AFC.</li>
</ul></div>
`,hi:`
<p>Radio spectrum public sadkon jaisa hai. Kuch sadkon par aap bina licence gaadi chala sakte ho (unlicensed Wi-Fi bands), par sarkar phir bhi speed limit (maximum power) tay karti hai, batati hai ki aapke desh mein kaunsi lanes khuli hain (allowed channels), aur ambulance aane par aapko sadak se hatne ka order deti hai (radar). Wi-Fi equipment ko in rules ko follow karna padta hai, aur jab woh karta hai, to aapke kuch channel aur power choices aapke liye pehle se tay ho jaate hain.</p>

<h3>Rules kaun banata hai</h3>
<p>Har desh ka ek regulator hota hai jo tay karta hai ki radio frequencies kaise use ho sakti hain: jaise United States mein FCC, Europe mein ETSI aur national regulators, aur India mein telecom ministry ka wireless planning wing. Wi-Fi <b>unlicensed</b> (licence-exempt) bands use karta hai, matlab aap har AP ke liye licence apply nahi karte, par equipment certified hona chahiye aur us desh ki limits maanni chahiye. Rules teen tarah se alag hote hain:</p>
<ul>
<li><b>Kaunse channels allowed hain.</b> 2.4 GHz mein North America channels 1 se 11 allow karta hai, zyada tar Europe aur Asia 1 se 13, aur Japan ne history mein 14 sirf 802.11b ke liye allow kiya. 5 GHz aur 6 GHz mein allowed ranges aur bhi zyada alag hain.</li>
<li><b>Maximum power</b>, aam taur par <b>EIRP</b> mein (effective isotropic radiated power = transmitter power + antenna gain - cable loss). Jaise, European rules 2.4 GHz Wi-Fi ko 20 dBm (100 mW) EIRP tak limit karte hain.</li>
<li><b>Extra behaviours</b> jaise kuch 5 GHz channels par radar detection aur power control, ya sirf indoor use.</li>
</ul>
<p>Isiliye har AP ya controller ek <b>country code</b> (regulatory domain) ke saath configure hota hai. Yeh bilkul wahi channels aur power levels kholta hai jo us desh mein legal hain. <b>802.11d</b> amendment APs ko beacons mein desh, allowed channels aur power limits advertise karne deta hai taaki clients apne aap adjust karein.</p>
<pre class="out">(WLC1) &gt;show 802.11a
802.11a Network.................................. Enabled
<span class="hl">Regulatory domain................................ IN</span>
Allowed channels................................. 36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140,149,153,157,161,165
Non-overlapping channels......................... all (20 MHz)</pre>

<h3>802.11h: DFS aur TPC</h3>
<p>5 GHz band ke kuch hisse <b>radar</b> systems (weather radar, airport aur military radar) ke saath shared hain. Radar ki priority hai. <b>802.11h</b> amendment, jo pehle Europe mein zaroori tha aur ab duniya bhar mein use hota hai, do mechanisms jodta hai:</p>
<dl class="terms">
<dt>DFS (dynamic frequency selection)</dt><dd>DFS channels (U-NII-2A 52 se 64 aur U-NII-2C 100 se 144) par AP ko channel use karne se pehle radar sunna padta hai (ek <b>channel availability check</b>, aam taur par 60 seconds; Europe mein kuch weather-radar channels par 10 minute tak). Agar operate karte hue radar detect ho, to use lagbhag 10 seconds mein us channel par transmit karna band karna padta hai, <b>channel switch announcement</b> ke saath apne clients ko doosre channel par le jaana padta hai, aur 30 minute tak us channel se bachna padta hai (<b>non-occupancy period</b>).</dd>
<dt>TPC (transmit power control)</dt><dd>AP local maximum power advertise karta hai, aur APs aur clients apni power sabse kam zaroori level tak ghataate hain, jisse band ke doosre users ke saath interference kam hota hai.</dd>
</dl>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="DFS radar event timeline">
<rect x="20" y="70" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="90" y="90" text-anchor="middle" class="svg-ink" font-size="13">AP ch 52 par</text><text x="90" y="106" text-anchor="middle" class="svg-muted" font-size="12">60 s check ke baad</text>
<rect x="190" y="70" width="130" height="44" rx="8" fill="#fed7aa"/><text x="255" y="90" text-anchor="middle" class="svg-ink" font-size="13">Radar detect hua</text><text x="255" y="106" text-anchor="middle" class="svg-muted" font-size="12">~10 s mein ruko</text>
<rect x="350" y="70" width="130" height="44" rx="8" fill="#fde68a"/><text x="415" y="90" text-anchor="middle" class="svg-ink" font-size="13">Channel switch</text><text x="415" y="106" text-anchor="middle" class="svg-muted" font-size="12">clients saath ya drop</text>
<rect x="510" y="70" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="13">ch 52 banned</text><text x="565" y="106" text-anchor="middle" class="svg-muted" font-size="12">30 min ke liye</text>
<line x1="160" y1="92" x2="190" y2="92" stroke="#64748b" stroke-width="2"/><line x1="320" y1="92" x2="350" y2="92" stroke="#64748b" stroke-width="2"/><line x1="480" y1="92" x2="510" y2="92" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Har radar hit par users ko chhota outage ya 2.4 GHz par drop dikhta hai</text>
</svg><p class="cap">Ek DFS event. Baar baar radar hits users ko random disconnects jaise lagte hain.</p></div>

<h3>Aapke design ke liye iska matlab</h3>
<ul>
<li>DFS channels legal aur useful hain: yeh aapke 5 GHz channels ki sankhya kai guna badhaate hain. Par airports, ports, weather stations ya military sites ke paas radar events chhote outages la sakte hain. Aisi jagahon par critical SSIDs, khaas kar voice ke liye, non-DFS channels (36 se 48 aur 149 se 165) prefer karo.</li>
<li>Kuch clients DFS channels bilkul support nahi karte. Agar site channel 100 use karti hai aur device sirf U-NII-1 aur U-NII-3 scan karta hai, to device ko woh AP kabhi nahi dikhega.</li>
<li>Sahi country code set karo. Galat code aapke AP ko illegal bana sakta hai, ya woh channels chhupa sakta hai jinki clients ummeed karte hain.</li>
<li>6 GHz ke apne rules hain: <b>low-power indoor (LPI)</b> APs bina coordination ke use ho sakte hain; <b>standard power</b> (jaise outdoors) ko <b>automated frequency coordination (AFC)</b> service chahiye jo licensed microwave links ko protect karti hai. Kuch regions, jaise Europe, ne 6 GHz band ka sirf neeche wala hissa khola hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab mein installer ne AP3 ko 5 GHz channel 52 aur AP4 ko channel 100 par chhod diya. Dono DFS channels hain. Office ek weather radar se 5 km door hai, aur AP3 aur AP4 ke paas ke users din mein kai baar drops report karte hain. Chaaron APs ko 36, 40, 44 aur 48 (sab U-NII-1, non-DFS) par le jaane se radar ka risk khatam hota hai aur har AP ko phir bhi unique channel milta hai.</p></div>
<pre class="out">(WLC1) &gt;show advanced 802.11a channel
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            36       5180      1 (20 dBm)   Up        AP2(36)
AP2            36       5180      1 (20 dBm)   Up        AP1(36)
<span class="hl">AP3            52       5260      1 (20 dBm)   Up        -</span>
<span class="hl">AP4            100      5500      1 (20 dBm)   Up        -</span></pre>

<div class="warn"><p><b>Common galti.</b> "Zyada channels ya power kholne" ke liye doosre desh se APs mangwana, ya default country code chhod dena. Yeh kaanoon todta hai, radar ya licensed services ke saath interfere kar sakta hai, aur clients woh channels mana kar sakte hain jo unki apni regulatory settings allow nahi karti.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.11h = 5 GHz mein radar aur doosre users ke saath coexistence ke liye DFS + TPC. 802.11d = beacons mein country information. Inhe 802.11r (fast roaming), 802.11k (neighbour reports) ya 802.11w (protected management frames) se confuse mat karo.</p></div>

<div class="scn"><h4>Hospital wing jo har dopahar drop hota tha</h4><p>Airport ke paas ek hospital mein voice badges ek wing mein random samay par calls drop karte the. Controller logs mein channels 52 aur 60 par radar detection events dikhe, APs channels badal rahe the aur har move par badges association kho rahe the. Engineer ne voice network ki channel list se DFS channels hata diye, 36 se 48 aur 149 se 161 rakhe, aur DFS channels sirf guest SSID ke liye chhode.</p><p><b>Seekh:</b> DFS channels capacity badhaate hain, par radar ke paas critical real-time services non-DFS channels par honi chahiye.</p></div>

<div class="iv"><p class="q">"802.11h kya hai aur yeh channel planning ko kaise affect karta hai?"</p><p>Strong answer: 802.11h dynamic frequency selection aur transmit power control jodta hai taaki Wi-Fi 5 GHz ko radar ke saath share kar sake. DFS channels par AP ko use se pehle radar check karna padta hai, radar detect hone par lagbhag 10 seconds mein channel khaali karna padta hai, aur 30 minute tak us channel se bachna padta hai. Planning ke liye: DFS channels capacity jodte hain, par radar sources ke paas, aur voice ya DFS support na karne wale clients ke liye, U-NII-1 aur U-NII-3 prefer karo. Hamesha sahi country code set karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Regulators har desh ke liye allowed channels, maximum EIRP aur extra behaviours tay karte hain; AP ka country code inhe enforce karta hai.</li>
<li>802.11h = 5 GHz mein DFS (radar detection aur channel moves) + TPC (transmit power control).</li>
<li>DFS channels: 52 se 64 aur 100 se 144; non-DFS: 36 se 48 aur 149 se 165 (zyada tar deshon mein).</li>
<li>Radar events chhote outages aur channel changes laate hain; radar ke paas voice ke liye DFS se bacho.</li>
<li>6 GHz: low-power indoor ko coordination nahi chahiye; standard power ko AFC chahiye.</li>
</ul></div>
`}};export{e as default};