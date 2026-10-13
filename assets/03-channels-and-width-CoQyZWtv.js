var e={id:`channels-width`,h:{en:`Channels, overlap and channel width`,hi:`Channels, overlap aur channel width`},body:{en:`
<p>Imagine a row of radio stations whose frequencies are so close that each station bleeds into the next two on the dial. You can only use every fifth station if you want clean sound. That is the 2.4 GHz band. The 5 GHz band is like a dial where every station has its own clean slot, but if you ask for a "double-width" station for better sound, you use up two slots.</p>

<h3>2.4 GHz: why only 1, 6 and 11</h3>
<p>In 2.4 GHz the channel <b>centres</b> are only 5 MHz apart: channel 1 is centred at 2412 MHz, channel 2 at 2417 MHz, and so on (centre = 2407 + 5 x channel). But a Wi-Fi signal is about <b>20 MHz</b> wide (22 MHz for old 802.11b). So a channel covers its own slot plus the two neighbours on each side. To avoid overlap, channels must be at least five numbers apart. In a country that allows channels 1 to 11, the only set of three that never overlap is <b>1, 6 and 11</b>.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="160" x2="610" y2="160" stroke="#64748b" stroke-width="1.5"/>
<path d="M40 160 Q110 40 180 160" fill="#bae6fd" stroke="#64748b"/><text x="110" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 1</text>
<path d="M240 160 Q310 40 380 160" fill="#bbf7d0" stroke="#64748b"/><text x="310" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 6</text>
<path d="M440 160 Q510 40 580 160" fill="#fde68a" stroke="#64748b"/><text x="510" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 11</text>
<path d="M120 160 Q190 60 260 160" fill="none" stroke="#dc2626" stroke-dasharray="5 4"/><text x="190" y="75" text-anchor="middle" class="svg-accent" font-size="12">ch 3 overlaps 1 and 6</text>
<text x="110" y="182" text-anchor="middle" class="svg-muted" font-size="12">2412 MHz</text><text x="310" y="182" text-anchor="middle" class="svg-muted" font-size="12">2437 MHz</text><text x="510" y="182" text-anchor="middle" class="svg-muted" font-size="12">2462 MHz</text>
</svg><p class="cap">Channels 1, 6 and 11 are 25 MHz apart, wider than a 20 MHz signal. Channel 3 lands on top of both 1 and 6.</p></div>

<h3>Co-channel versus adjacent-channel interference</h3>
<dl class="terms">
<dt>Co-channel interference (CCI), also called co-channel contention</dt><dd>Two APs on the <b>same</b> channel hear each other. They cooperate through CSMA/CA and take turns, so they share the airtime. Throughput drops but frames are not corrupted.</dd>
<dt>Adjacent-channel interference (ACI)</dt><dd>Two APs on <b>overlapping</b> channels, for example 1 and 3. They cannot decode each other's frames, so they do not wait for each other; their signals collide and frames are corrupted and retransmitted. This is worse than co-channel.</dd>
</dl>
<p>So if you must choose, putting two neighbours on the same channel is better than putting them on overlapping channels. Never use channels 2, 3, 4, 5, 7, 8, 9 or 10 in a multi-AP design.</p>

<h3>5 GHz: many channels, no overlap at 20 MHz</h3>
<p>5 GHz channel numbers are also 5 MHz steps (centre = 5000 + 5 x channel), but the usable channels are spaced four numbers apart: 36, 40, 44, 48, 52 and so on, each exactly 20 MHz wide. <b>Every 20 MHz channel in 5 GHz is non-overlapping.</b> The ranges are grouped into U-NII bands:</p>
<table class="cmp"><tr><th>Band</th><th>Channels</th><th>Note</th></tr>
<tr><td>U-NII-1</td><td>36, 40, 44, 48</td><td>No radar detection needed; safest indoor choice</td></tr>
<tr><td>U-NII-2A</td><td>52, 56, 60, 64</td><td>DFS (radar detection) required</td></tr>
<tr><td>U-NII-2C (extended)</td><td>100 to 144</td><td>DFS required; some channels restricted near weather radar</td></tr>
<tr><td>U-NII-3</td><td>149, 153, 157, 161, 165</td><td>No DFS in most countries</td></tr>
</table>
<p>Exactly which channels are legal depends on the country; chapter 4 covers that.</p>

<h3>Channel width: speed versus number of channels</h3>
<p><b>Channel bonding</b> joins neighbouring 20 MHz channels into one wider channel: 40, 80, 160 MHz (and 320 MHz in 6 GHz with Wi-Fi 7). Doubling the width roughly doubles the peak data rate, but halves the number of separate channels you can give to neighbouring APs, and a wider channel collects more noise, which lowers SNR slightly.</p>
<table class="cmp"><tr><th>Width</th><th>Channels in 5 GHz (typical, with DFS)</th><th>Channels in 6 GHz</th><th>Use</th></tr>
<tr><td>20 MHz</td><td>about 25</td><td>59</td><td>High-density halls, 2.4 GHz always</td></tr>
<tr><td>40 MHz</td><td>about 12</td><td>29</td><td>Typical enterprise office</td></tr>
<tr><td>80 MHz</td><td>about 6</td><td>14</td><td>Low-density, small offices, homes</td></tr>
<tr><td>160 MHz</td><td>2 or 3</td><td>7</td><td>Very low density or 6 GHz</td></tr>
</table>
<p>In 2.4 GHz, always use 20 MHz: a 40 MHz channel would take two of the three clean channels.</p>

<div class="eg"><p><b>Worked example.</b> A floor needs 8 APs in 5 GHz, and neighbours must not share a channel. At 80 MHz you only have about 6 channels (36-48, 52-64, 100-112, 116-128, 132-144, 149-161), so two pairs of neighbours would share. At 40 MHz you have about 12, which is plenty. The designer chooses 40 MHz: each client gets a little less peak speed, but the whole floor gets far more total capacity.</p></div>

<h3>Designing the reuse pattern</h3>
<p>Think in honeycomb cells. Neighbouring cells get different channels; the same channel is reused only where the two cells are far enough apart, or their transmit power is low enough, that they do not hear each other above roughly -82 dBm. Clients need about <b>15 to 20 percent cell overlap</b> at the design signal level (often -67 dBm) to roam smoothly. Transmit power is your tool to shape cells: lower power means smaller cells and more reuse.</p>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1) AP4(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1) AP4(1)
...
<span class="hl">Interference: 6 AP pair(s) on overlapping channels</span></pre>
<p>This is the lab floor straight out of the box: four APs all on channel 1. In chapter 10 you will fix it.</p>

<div class="warn"><p><b>Common mistake.</b> Leaving channel width on "auto 80 MHz" in a dense building. Every AP grabs a wide channel, neighbours end up sharing, and the network is slower than it would be at 20 or 40 MHz.</p></div>

<div class="exam"><p><b>Exam trap.</b> The three non-overlapping 2.4 GHz channels are 1, 6 and 11 (North America). If asked how to add capacity in 2.4 GHz, the answer is never "use channel 3"; it is to use 5 GHz, reduce power or add APs on the correct pattern.</p></div>

<div class="scn"><h4>The neighbour on channel 9</h4><p>A shop on 2.4 GHz channel 11 had frequent retransmissions and slow card terminals. A Wi-Fi analyser showed the café next door running its AP on channel 9 at full power. That overlaps channel 11, causing adjacent-channel interference. The engineer could not change the café's AP, so he moved the shop to channel 6 and put the terminals, which supported 5 GHz, on a 5 GHz SSID.</p><p><b>Lesson:</b> overlapping channels are worse than sharing one; always survey the neighbours too.</p></div>

<div class="iv"><p class="q">"What is the difference between co-channel and adjacent-channel interference?"</p><p>Strong answer: co-channel means neighbouring APs on the same channel; they decode each other and defer through CSMA/CA, so they share airtime but do not corrupt frames. Adjacent-channel means partly overlapping channels, such as 1 and 4 in 2.4 GHz; they cannot decode each other, so they transmit over each other and corrupt frames. Fix with 1, 6, 11 in 2.4 GHz, unique channels in 5 GHz, narrower widths and lower power.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz channel centres are 5 MHz apart but signals are 20 to 22 MHz wide: use only 1, 6 and 11.</li>
<li>Every 20 MHz channel in 5 GHz and 6 GHz is non-overlapping.</li>
<li>Adjacent-channel interference corrupts frames; co-channel contention shares airtime.</li>
<li>Wider channels give more peak speed but fewer channels to reuse: 20 MHz in 2.4 GHz, 20 or 40 MHz in dense 5 GHz.</li>
<li>Transmit power shapes cell size and makes channel reuse possible.</li>
</ul></div>
`,hi:`
<p>Radio stations ki ek line socho jinki frequencies itni paas hain ki har station dial par agle do mein ghus jaata hai. Saaf awaaz chahiye to aap sirf har paanchwa station use kar sakte ho. Yahi 2.4 GHz band hai. 5 GHz band aisa dial hai jahan har station ka apna saaf slot hai, par agar behtar awaaz ke liye "double-width" station maango, to do slots kharch hote hain.</p>

<h3>2.4 GHz: sirf 1, 6 aur 11 kyun</h3>
<p>2.4 GHz mein channel <b>centres</b> sirf 5 MHz door hain: channel 1 ka centre 2412 MHz, channel 2 ka 2417 MHz, aur aise hi (centre = 2407 + 5 x channel). Par Wi-Fi signal lagbhag <b>20 MHz</b> chauda hota hai (purane 802.11b ke liye 22 MHz). Isliye ek channel apna slot plus dono taraf ke do padosi cover karta hai. Overlap se bachne ke liye channels kam se kam paanch number door hone chahiye. Jis desh mein channels 1 se 11 allowed hain, wahan teen channels ka ek hi set jo kabhi overlap nahi karta woh hai <b>1, 6 aur 11</b>.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="2.4 GHz channel overlap">
<line x1="30" y1="160" x2="610" y2="160" stroke="#64748b" stroke-width="1.5"/>
<path d="M40 160 Q110 40 180 160" fill="#bae6fd" stroke="#64748b"/><text x="110" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 1</text>
<path d="M240 160 Q310 40 380 160" fill="#bbf7d0" stroke="#64748b"/><text x="310" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 6</text>
<path d="M440 160 Q510 40 580 160" fill="#fde68a" stroke="#64748b"/><text x="510" y="95" text-anchor="middle" class="svg-ink" font-size="13">ch 11</text>
<path d="M120 160 Q190 60 260 160" fill="none" stroke="#dc2626" stroke-dasharray="5 4"/><text x="190" y="75" text-anchor="middle" class="svg-accent" font-size="12">ch 3, 1 aur 6 dono par</text>
<text x="110" y="182" text-anchor="middle" class="svg-muted" font-size="12">2412 MHz</text><text x="310" y="182" text-anchor="middle" class="svg-muted" font-size="12">2437 MHz</text><text x="510" y="182" text-anchor="middle" class="svg-muted" font-size="12">2462 MHz</text>
</svg><p class="cap">Channels 1, 6 aur 11 ke beech 25 MHz ka gap hai, 20 MHz signal se zyada. Channel 3, 1 aur 6 dono ke upar aata hai.</p></div>

<h3>Co-channel vs adjacent-channel interference</h3>
<dl class="terms">
<dt>Co-channel interference (CCI), jise co-channel contention bhi kehte hain</dt><dd>Do APs <b>same</b> channel par ek doosre ko sunte hain. Woh CSMA/CA se cooperate karte hain aur baari baari bolte hain, isliye airtime share karte hain. Throughput girta hai par frames kharab nahi hote.</dd>
<dt>Adjacent-channel interference (ACI)</dt><dd>Do APs <b>overlapping</b> channels par, jaise 1 aur 3. Woh ek doosre ke frames decode nahi kar paate, isliye ek doosre ka wait nahi karte; unke signals takraate hain aur frames kharab hokar retransmit hote hain. Yeh co-channel se bura hai.</dd>
</dl>
<p>Isliye agar chunna pade, to do padosiyon ko same channel par rakhna overlapping channels par rakhne se behtar hai. Multi-AP design mein channels 2, 3, 4, 5, 7, 8, 9 ya 10 kabhi use mat karo.</p>

<h3>5 GHz: bahut channels, 20 MHz par koi overlap nahi</h3>
<p>5 GHz channel numbers bhi 5 MHz steps hain (centre = 5000 + 5 x channel), par usable channels chaar number door hain: 36, 40, 44, 48, 52 aur aage, har ek bilkul 20 MHz chauda. <b>5 GHz ka har 20 MHz channel non-overlapping hai.</b> Ranges U-NII bands mein grouped hain:</p>
<table class="cmp"><tr><th>Band</th><th>Channels</th><th>Note</th></tr>
<tr><td>U-NII-1</td><td>36, 40, 44, 48</td><td>Radar detection nahi chahiye; sabse safe indoor choice</td></tr>
<tr><td>U-NII-2A</td><td>52, 56, 60, 64</td><td>DFS (radar detection) zaroori</td></tr>
<tr><td>U-NII-2C (extended)</td><td>100 se 144</td><td>DFS zaroori; weather radar ke paas kuch channels restricted</td></tr>
<tr><td>U-NII-3</td><td>149, 153, 157, 161, 165</td><td>Zyada tar deshon mein DFS nahi</td></tr>
</table>
<p>Kaunse channels bilkul legal hain yeh desh par nirbhar hai; chapter 4 yeh cover karta hai.</p>

<h3>Channel width: speed vs channels ki sankhya</h3>
<p><b>Channel bonding</b> padosi 20 MHz channels ko ek chaude channel mein jodta hai: 40, 80, 160 MHz (aur Wi-Fi 7 ke saath 6 GHz mein 320 MHz). Width double karne se peak data rate lagbhag double hota hai, par padosi APs ko dene layak alag channels aadhe ho jaate hain, aur chauda channel zyada noise ikattha karta hai, jo SNR thoda kam karta hai.</p>
<table class="cmp"><tr><th>Width</th><th>5 GHz mein channels (typical, DFS ke saath)</th><th>6 GHz mein channels</th><th>Use</th></tr>
<tr><td>20 MHz</td><td>lagbhag 25</td><td>59</td><td>High-density halls, 2.4 GHz hamesha</td></tr>
<tr><td>40 MHz</td><td>lagbhag 12</td><td>29</td><td>Typical enterprise office</td></tr>
<tr><td>80 MHz</td><td>lagbhag 6</td><td>14</td><td>Low-density, chhote offices, ghar</td></tr>
<tr><td>160 MHz</td><td>2 ya 3</td><td>7</td><td>Bahut kam density ya 6 GHz</td></tr>
</table>
<p>2.4 GHz mein hamesha 20 MHz use karo: 40 MHz channel teen clean channels mein se do le lega.</p>

<div class="eg"><p><b>Worked example.</b> Ek floor ko 5 GHz mein 8 APs chahiye, aur padosi ek channel share nahi kar sakte. 80 MHz par sirf lagbhag 6 channels hain (36-48, 52-64, 100-112, 116-128, 132-144, 149-161), isliye padosiyon ke do pairs share karenge. 40 MHz par lagbhag 12 hain, jo kaafi hai. Designer 40 MHz chunta hai: har client ko thodi kam peak speed milti hai, par poore floor ko kahin zyada total capacity.</p></div>

<h3>Reuse pattern design karna</h3>
<p>Honeycomb cells mein socho. Padosi cells ko alag channels milte hain; same channel sirf wahan reuse hota hai jahan do cells kaafi door hon, ya unki transmit power itni kam ho, ki woh ek doosre ko lagbhag -82 dBm se upar na sunein. Smoothly roam karne ke liye clients ko design signal level (aksar -67 dBm) par lagbhag <b>15 se 20 percent cell overlap</b> chahiye. Transmit power cells ko shape karne ka aapka tool hai: kam power matlab chhote cells aur zyada reuse.</p>
<pre class="out">(WLC1) &gt;show advanced 802.11b channel
AP Name        Channel  Freq MHz  Tx Power     Radio     Overlapping neighbours
AP1            1        2412      1 (20 dBm)   Up        AP2(1) AP3(1) AP4(1)
AP2            1        2412      1 (20 dBm)   Up        AP1(1) AP3(1) AP4(1)
...
<span class="hl">Interference: 6 AP pair(s) on overlapping channels</span></pre>
<p>Yeh box se nikla lab floor hai: chaaron APs channel 1 par. Chapter 10 mein aap ise theek karoge.</p>

<div class="warn"><p><b>Common galti.</b> Dense building mein channel width "auto 80 MHz" par chhod dena. Har AP chauda channel le leta hai, padosi share karne lagte hain, aur network 20 ya 40 MHz se bhi slow ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Teen non-overlapping 2.4 GHz channels 1, 6 aur 11 hain (North America). Agar poocha jaaye ki 2.4 GHz mein capacity kaise badhayein, to jawab kabhi "channel 3 use karo" nahi hai; jawab hai 5 GHz use karo, power kam karo ya sahi pattern par APs jodo.</p></div>

<div class="scn"><h4>Channel 9 wala padosi</h4><p>2.4 GHz channel 11 par ek dukaan mein baar baar retransmissions aur slow card terminals the. Wi-Fi analyser ne dikhaya ki bagal ka café apna AP full power par channel 9 par chala raha tha. Woh channel 11 ko overlap karta hai, jisse adjacent-channel interference hota hai. Engineer café ka AP nahi badal sakta tha, isliye usne dukaan ko channel 6 par shift kiya aur terminals ko, jo 5 GHz support karte the, 5 GHz SSID par daala.</p><p><b>Seekh:</b> overlapping channels ek channel share karne se bure hain; hamesha padosiyon ka bhi survey karo.</p></div>

<div class="iv"><p class="q">"Co-channel aur adjacent-channel interference mein kya fark hai?"</p><p>Strong answer: co-channel matlab padosi APs same channel par; woh ek doosre ko decode karte hain aur CSMA/CA se defer karte hain, isliye airtime share karte hain par frames kharab nahi karte. Adjacent-channel matlab partly overlapping channels, jaise 2.4 GHz mein 1 aur 4; woh ek doosre ko decode nahi kar paate, isliye ek doosre ke upar transmit karke frames kharab karte hain. Fix: 2.4 GHz mein 1, 6, 11, 5 GHz mein unique channels, patli widths aur kam power.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>2.4 GHz channel centres 5 MHz door hain par signals 20 se 22 MHz chaude: sirf 1, 6 aur 11 use karo.</li>
<li>5 GHz aur 6 GHz ka har 20 MHz channel non-overlapping hai.</li>
<li>Adjacent-channel interference frames kharab karta hai; co-channel contention airtime share karta hai.</li>
<li>Chaude channels zyada peak speed dete hain par reuse ke liye kam channels: 2.4 GHz mein 20 MHz, dense 5 GHz mein 20 ya 40 MHz.</li>
<li>Transmit power cell size shape karti hai aur channel reuse possible banati hai.</li>
</ul></div>
`}};export{e as default};