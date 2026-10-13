var e={id:`rf-math`,h:{en:`RF power maths: mW, dBm, RSSI, noise floor and SNR`,hi:`RF power maths: mW, dBm, RSSI, noise floor aur SNR`},body:{en:`
<p>Imagine talking to a friend across a railway platform. How well they understand you depends on two things: how loud your voice is when it reaches them, and how loud the platform noise is. A whisper in a silent library works; a shout next to a passing train does not. Wi-Fi is the same. The received <b>signal</b> must be strong enough, and it must stand well above the <b>noise</b>. This chapter gives you the numbers to measure both.</p>

<h3>Milliwatts and decibels</h3>
<p>Radio power is measured in <b>watts</b>. A Wi-Fi AP transmits around 100 milliwatts (<b>mW</b>) at most, while the signal that reaches a laptop can be a millionth of a millionth of that. Writing 0.000000001 mW is painful, so engineers use a logarithmic unit, the <b>decibel</b>.</p>
<dl class="terms">
<dt>dB</dt><dd>A <b>ratio</b> between two powers: dB = 10 × log10(P1 / P2). It describes gain or loss, for example "the wall costs 6 dB". It is relative, never an absolute level.</dd>
<dt>dBm</dt><dd>An <b>absolute</b> power level compared with 1 mW: dBm = 10 × log10(P in mW). 1 mW = 0 dBm, 100 mW = 20 dBm, 1 W = 30 dBm. Below 1 mW the number is negative.</dd>
<dt>dBi</dt><dd>Antenna gain compared with an ideal isotropic antenna that radiates equally in all directions. A 6 dBi antenna focuses energy, it does not create it.</dd>
</dl>

<h3>The 3 dB and 10 dB rules</h3>
<p>You never need a calculator for the exam. Learn four rules and combine them:</p>
<ul>
<li><b>+3 dB = double</b> the power (×2). <b>−3 dB = half</b> (÷2).</li>
<li><b>+10 dB = ten times</b> the power (×10). <b>−10 dB = one tenth</b> (÷10).</li>
<li>Gains and losses in dB simply <b>add and subtract</b>; in mW they multiply and divide.</li>
<li>Start from an anchor: <b>0 dBm = 1 mW</b>, <b>10 dBm = 10 mW</b>, <b>20 dBm = 100 mW</b>.</li>
</ul>
<table class="cmp"><tr><th>dBm</th><th>mW</th><th>How to get it</th></tr>
<tr><td>20</td><td>100</td><td>anchor</td></tr>
<tr><td>17</td><td>50</td><td>20 − 3: half of 100</td></tr>
<tr><td>14</td><td>25</td><td>20 − 3 − 3: a quarter of 100</td></tr>
<tr><td>13</td><td>20</td><td>10 + 3: double 10</td></tr>
<tr><td>16</td><td>40</td><td>10 + 3 + 3: 10 × 2 × 2</td></tr>
<tr><td>0</td><td>1</td><td>anchor</td></tr>
<tr><td>−30</td><td>0.001</td><td>0 − 10 − 10 − 10</td></tr>
<tr><td>−60</td><td>0.000001 (1 nW)</td><td>six times ÷10</td></tr></table>

<div class="eg"><p><b>Worked example.</b> An AP transmits 17 dBm into a cable that loses 3 dB, connected to a 6 dBi antenna. The effective power leaving the antenna, the <b>EIRP</b> (effective isotropic radiated power), is 17 − 3 + 6 = <b>20 dBm = 100 mW</b>. Regulators limit EIRP, not just transmitter power, so a high-gain antenna may force you to lower the radio's power. In mW the same sum is 50 mW ÷ 2 × 4 = 100 mW (6 dB = ×4).</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Link budget">
<rect x="5" y="30" width="96" height="54" rx="8" fill="#bae6fd"/><text x="53" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP radio</text><text x="53" y="70" text-anchor="middle" class="svg-accent" font-size="13">17 dBm</text>
<rect x="111" y="30" width="96" height="54" rx="8" fill="#fed7aa"/><text x="159" y="52" text-anchor="middle" class="svg-ink" font-size="12">cable</text><text x="159" y="70" text-anchor="middle" class="svg-accent" font-size="13">−3 dB</text>
<rect x="217" y="30" width="96" height="54" rx="8" fill="#bbf7d0"/><text x="265" y="52" text-anchor="middle" class="svg-ink" font-size="12">antenna</text><text x="265" y="70" text-anchor="middle" class="svg-accent" font-size="13">+6 dBi</text>
<rect x="323" y="30" width="96" height="54" rx="8" fill="#ddd6fe"/><text x="371" y="52" text-anchor="middle" class="svg-ink" font-size="12">EIRP</text><text x="371" y="70" text-anchor="middle" class="svg-accent" font-size="13">20 dBm</text>
<rect x="429" y="30" width="96" height="54" rx="8" fill="#fed7aa"/><text x="477" y="52" text-anchor="middle" class="svg-ink" font-size="12">path + walls</text><text x="477" y="70" text-anchor="middle" class="svg-accent" font-size="13">−80 dB</text>
<rect x="535" y="30" width="100" height="54" rx="8" fill="#bbf7d0"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="12">client RSSI</text><text x="585" y="70" text-anchor="middle" class="svg-accent" font-size="13">−60 dBm</text>
<line x1="20" y1="130" x2="620" y2="130" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<text x="585" y="120" text-anchor="middle" class="svg-muted" font-size="12">signal −60</text>
<text x="585" y="160" text-anchor="middle" class="svg-muted" font-size="12">noise −95</text>
<line x1="585" y1="126" x2="585" y2="148" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">SNR = −60 − (−95) = 35 dB</text>
</svg><p class="cap">A link budget: add and subtract dB from transmitter to receiver, then compare the received signal with the noise floor.</p></div>

<h3>What the receiver sees</h3>
<dl class="terms">
<dt>RSSI</dt><dd>Received signal strength indicator. Strictly it is a vendor-specific index, but tools and controllers normally show it in dBm, always negative. Closer to zero is stronger: −45 dBm is excellent, −67 dBm is the usual design target for voice and video, −70 dBm is fine for data, −80 dBm is poor, and around −90 dBm most clients lose the connection.</dd>
<dt>Noise floor</dt><dd>The background RF energy on the channel when nobody is transmitting Wi-Fi: electronics, distant transmitters, thermal noise. Typically −90 to −100 dBm; 2.4 GHz is usually noisier than 5 GHz.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio, in dB: <b>SNR = signal (dBm) − noise (dBm)</b>. It tells the receiver how clearly the signal stands out. Aim for at least 20 dB for data and 25 dB or more for voice.</dd>
<dt>Receiver sensitivity</dt><dd>The weakest signal at which a radio can still decode a given data rate. Higher rates use denser modulation and need a stronger signal and a higher SNR.</dd>
</dl>
<p>In free space, every <b>doubling of distance costs about 6 dB</b> (the inverse square law). This is why walking from 5 m to 10 m from an AP drops a reading from, say, −50 to −56 dBm, while one concrete wall can cost more than that.</p>

<h3>Transmit power on the controller</h3>
<p>Cisco controllers set AP power in <b>levels</b>: level 1 is the highest the radio allows, and each higher level is roughly 3 dB (half the power) lower. In the lab, level 1 = 20 dBm, so level 3 = 20 − 6 = 14 dBm, one quarter of the power.</p>
<pre class="code"><span class="c">! shrink AP2's 2.4 GHz cell in the middle of the hall</span>
(WLC1) &gt;config 802.11b txPower ap AP2 3
(WLC1) &gt;show ap config 802.11b AP2</pre>
<pre class="out">AP Name.......................................... AP2
AP Mode.......................................... Local
Radio Slot....................................... 0 (802.11b/g/n (2.4 GHz))
Admin State...................................... ENABLED
Operation State.................................. UP
Current Channel.................................. 6 (2437 MHz)
Channel Width.................................... 20 MHz
<span class="hl">Current Tx Power Level........................... 3 (14 dBm)</span>
Channel Assignment............................... Custom (set by administrator)</pre>
<p>On the client, <code>wifi status</code> shows the received level, for example <code>Signal      : -58 dBm</code>. If the noise floor is −95 dBm, the SNR is 37 dB: excellent.</p>

<div class="warn"><p><b>Common mistake.</b> Comparing negative numbers the wrong way round. −55 dBm is <b>stronger</b> than −75 dBm. And a 20 dB difference is not "20 % less"; it is 100 times less power.</p></div>

<div class="exam"><p><b>Exam trap.</b> A question may give power in mW and a change in dB. 100 mW with 3 dB of loss is 50 mW; 10 mW with a 10 dB gain is 100 mW. Also know that dB is relative and dBm is absolute. SNR is a difference of two dBm values, so its unit is dB.</p></div>

<div class="scn"><h4>Full bars, no throughput</h4><p>A user in the accounts office complained that her laptop showed full Wi-Fi bars but video calls kept freezing. The engineer checked the client on the controller: RSSI −62 dBm, which looked fine. A spectrum scan showed a noise floor of −70 dBm on channel 6, caused by a faulty wireless CCTV camera on the same band. The SNR was only 8 dB. Moving the camera to cable and the AP to 5 GHz raised the SNR to above 30 dB and the calls became stable.</p><p><b>Lesson:</b> signal strength alone means nothing; always check the SNR.</p></div>

<div class="iv"><p class="q">"An AP transmits at 20 dBm. How many milliwatts is that, and what happens if you lower it by 6 dB?"</p><p>Strong answer: 20 dBm is 100 mW. Minus 3 dB halves it to 50 mW, minus another 3 dB halves it again to 25 mW, which is 14 dBm. Mention the 3 dB and 10 dB rules, that dB values add while mW values multiply, and why engineers lower power: smaller cells, less co-channel interference and more channel reuse.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dBm is absolute (0 dBm = 1 mW); dB is a relative gain or loss; dBi is antenna gain.</li>
<li>+3 dB doubles, −3 dB halves, +10 dB multiplies by 10, −10 dB divides by 10.</li>
<li>EIRP = transmit power − cable loss + antenna gain.</li>
<li>RSSI is negative dBm: −67 dBm is a common voice design target; SNR = signal − noise, aim for 20 to 25 dB or more.</li>
<li>Cisco power level 1 is the highest; each level is about 3 dB lower.</li>
</ul></div>
`,hi:`
<p>Railway platform ke paar ek dost se baat karna socho. Woh aapko kitna achha samjhega yeh do cheezon par depend karta hai: aapki awaaz unke paas pahunch kar kitni tez hai, aur platform ka shor kitna tez hai. Shaant library mein fusfusahat kaam karti hai; guzarti train ke paas chillana nahi. Wi-Fi bhi aisa hi hai. Received <b>signal</b> kaafi strong hona chahiye, aur <b>noise</b> se kaafi upar hona chahiye. Yeh chapter aapko dono naapne ke numbers deta hai.</p>

<h3>Milliwatts aur decibels</h3>
<p>Radio power <b>watts</b> mein naapi jaati hai. Wi-Fi AP zyada se zyada lagbhag 100 milliwatts (<b>mW</b>) transmit karta hai, jabki laptop tak pahunchne wala signal uska dus lakh ka dus lakhwaan hissa ho sakta hai. 0.000000001 mW likhna takleef hai, isliye engineers ek logarithmic unit use karte hain, <b>decibel</b>.</p>
<dl class="terms">
<dt>dB</dt><dd>Do powers ke beech <b>ratio</b>: dB = 10 × log10(P1 / P2). Yeh gain ya loss batata hai, jaise "deewar 6 dB kha jaati hai". Yeh relative hai, kabhi absolute level nahi.</dd>
<dt>dBm</dt><dd>1 mW ke comparison mein <b>absolute</b> power level: dBm = 10 × log10(P mW mein). 1 mW = 0 dBm, 100 mW = 20 dBm, 1 W = 30 dBm. 1 mW se neeche number negative hota hai.</dd>
<dt>dBi</dt><dd>Ek ideal isotropic antenna ke comparison mein antenna gain, jo har disha mein barabar radiate karta hai. 6 dBi antenna energy ko focus karta hai, banata nahi.</dd>
</dl>

<h3>3 dB aur 10 dB rules</h3>
<p>Exam ke liye aapko kabhi calculator nahi chahiye. Chaar rules seekho aur unhe jodo:</p>
<ul>
<li><b>+3 dB = power double</b> (×2). <b>−3 dB = aadhi</b> (÷2).</li>
<li><b>+10 dB = power das guna</b> (×10). <b>−10 dB = dasvaan hissa</b> (÷10).</li>
<li>dB mein gains aur losses bas <b>jodte aur ghatate</b> hain; mW mein multiply aur divide hote hain.</li>
<li>Ek anchor se shuru karo: <b>0 dBm = 1 mW</b>, <b>10 dBm = 10 mW</b>, <b>20 dBm = 100 mW</b>.</li>
</ul>
<table class="cmp"><tr><th>dBm</th><th>mW</th><th>Kaise nikla</th></tr>
<tr><td>20</td><td>100</td><td>anchor</td></tr>
<tr><td>17</td><td>50</td><td>20 − 3: 100 ka aadha</td></tr>
<tr><td>14</td><td>25</td><td>20 − 3 − 3: 100 ka chauthai</td></tr>
<tr><td>13</td><td>20</td><td>10 + 3: 10 ka double</td></tr>
<tr><td>16</td><td>40</td><td>10 + 3 + 3: 10 × 2 × 2</td></tr>
<tr><td>0</td><td>1</td><td>anchor</td></tr>
<tr><td>−30</td><td>0.001</td><td>0 − 10 − 10 − 10</td></tr>
<tr><td>−60</td><td>0.000001 (1 nW)</td><td>chhe baar ÷10</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek AP 17 dBm ek aise cable mein transmit karta hai jo 3 dB khota hai, aur 6 dBi antenna se juda hai. Antenna se nikalne wali effective power, <b>EIRP</b> (effective isotropic radiated power), 17 − 3 + 6 = <b>20 dBm = 100 mW</b> hai. Regulators EIRP limit karte hain, sirf transmitter power nahi, isliye high-gain antenna aapko radio ki power kam karne par majboor kar sakta hai. mW mein yahi hisaab 50 mW ÷ 2 × 4 = 100 mW hai (6 dB = ×4).</p></div>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Link budget">
<rect x="5" y="30" width="96" height="54" rx="8" fill="#bae6fd"/><text x="53" y="52" text-anchor="middle" class="svg-ink" font-size="12">AP radio</text><text x="53" y="70" text-anchor="middle" class="svg-accent" font-size="13">17 dBm</text>
<rect x="111" y="30" width="96" height="54" rx="8" fill="#fed7aa"/><text x="159" y="52" text-anchor="middle" class="svg-ink" font-size="12">cable</text><text x="159" y="70" text-anchor="middle" class="svg-accent" font-size="13">−3 dB</text>
<rect x="217" y="30" width="96" height="54" rx="8" fill="#bbf7d0"/><text x="265" y="52" text-anchor="middle" class="svg-ink" font-size="12">antenna</text><text x="265" y="70" text-anchor="middle" class="svg-accent" font-size="13">+6 dBi</text>
<rect x="323" y="30" width="96" height="54" rx="8" fill="#ddd6fe"/><text x="371" y="52" text-anchor="middle" class="svg-ink" font-size="12">EIRP</text><text x="371" y="70" text-anchor="middle" class="svg-accent" font-size="13">20 dBm</text>
<rect x="429" y="30" width="96" height="54" rx="8" fill="#fed7aa"/><text x="477" y="52" text-anchor="middle" class="svg-ink" font-size="12">path + deewar</text><text x="477" y="70" text-anchor="middle" class="svg-accent" font-size="13">−80 dB</text>
<rect x="535" y="30" width="100" height="54" rx="8" fill="#bbf7d0"/><text x="585" y="52" text-anchor="middle" class="svg-ink" font-size="12">client RSSI</text><text x="585" y="70" text-anchor="middle" class="svg-accent" font-size="13">−60 dBm</text>
<line x1="20" y1="130" x2="620" y2="130" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<text x="585" y="120" text-anchor="middle" class="svg-muted" font-size="12">signal −60</text>
<text x="585" y="160" text-anchor="middle" class="svg-muted" font-size="12">noise −95</text>
<line x1="585" y1="126" x2="585" y2="148" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">SNR = −60 − (−95) = 35 dB</text>
</svg><p class="cap">Link budget: transmitter se receiver tak dB jodo aur ghatao, phir received signal ko noise floor se compare karo.</p></div>

<h3>Receiver kya dekhta hai</h3>
<dl class="terms">
<dt>RSSI</dt><dd>Received signal strength indicator. Strictly yeh vendor-specific index hai, par tools aur controllers ise normally dBm mein dikhate hain, hamesha negative. Zero ke paas matlab zyada strong: −45 dBm excellent hai, −67 dBm voice aur video ka usual design target hai, −70 dBm data ke liye theek hai, −80 dBm kamzor hai, aur lagbhag −90 dBm par zyada tar clients connection kho dete hain.</dd>
<dt>Noise floor</dt><dd>Channel par background RF energy jab koi Wi-Fi transmit nahi kar raha: electronics, door ke transmitters, thermal noise. Typically −90 se −100 dBm; 2.4 GHz aam taur par 5 GHz se zyada noisy hota hai.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio, dB mein: <b>SNR = signal (dBm) − noise (dBm)</b>. Yeh receiver ko batata hai ki signal kitna saaf alag dikhta hai. Data ke liye kam se kam 20 dB aur voice ke liye 25 dB ya zyada rakho.</dd>
<dt>Receiver sensitivity</dt><dd>Sabse kamzor signal jis par radio ek diye gaye data rate ko abhi bhi decode kar sakta hai. Zyada rates ghani modulation use karte hain aur unhe strong signal aur zyada SNR chahiye.</dd>
</dl>
<p>Free space mein, <b>doori double hone par lagbhag 6 dB</b> jaata hai (inverse square law). Isiliye AP se 5 m se 10 m chalne par reading, maan lo, −50 se −56 dBm girti hai, jabki ek concrete deewar isse zyada kha sakti hai.</p>

<h3>Controller par transmit power</h3>
<p>Cisco controllers AP power <b>levels</b> mein set karte hain: level 1 radio ki sabse zyada allowed power hai, aur har agla level lagbhag 3 dB (aadhi power) kam hai. Lab mein level 1 = 20 dBm, isliye level 3 = 20 − 6 = 14 dBm, power ka ek chauthai.</p>
<pre class="code"><span class="c">! hall ke beech mein AP2 ka 2.4 GHz cell chhota karo</span>
(WLC1) &gt;config 802.11b txPower ap AP2 3
(WLC1) &gt;show ap config 802.11b AP2</pre>
<pre class="out">AP Name.......................................... AP2
AP Mode.......................................... Local
Radio Slot....................................... 0 (802.11b/g/n (2.4 GHz))
Admin State...................................... ENABLED
Operation State.................................. UP
Current Channel.................................. 6 (2437 MHz)
Channel Width.................................... 20 MHz
<span class="hl">Current Tx Power Level........................... 3 (14 dBm)</span>
Channel Assignment............................... Custom (set by administrator)</pre>
<p>Client par <code>wifi status</code> received level dikhata hai, jaise <code>Signal      : -58 dBm</code>. Agar noise floor −95 dBm hai, to SNR 37 dB hai: excellent.</p>

<div class="warn"><p><b>Common galti.</b> Negative numbers ko ulta compare karna. −55 dBm, −75 dBm se <b>zyada strong</b> hai. Aur 20 dB ka fark "20 % kam" nahi hai; yeh 100 guna kam power hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Question power mW mein aur change dB mein de sakta hai. 100 mW par 3 dB loss = 50 mW; 10 mW par 10 dB gain = 100 mW. Yeh bhi jaano ki dB relative hai aur dBm absolute. SNR do dBm values ka fark hai, isliye uska unit dB hai.</p></div>

<div class="scn"><h4>Poore bars, throughput zero</h4><p>Accounts office ki ek user ne shikayat ki ki uske laptop par poore Wi-Fi bars dikhte hain par video calls baar baar freeze hoti hain. Engineer ne controller par client check kiya: RSSI −62 dBm, jo theek lag raha tha. Spectrum scan ne channel 6 par −70 dBm ka noise floor dikhaya, jo same band par ek kharab wireless CCTV camera ki wajah se tha. SNR sirf 8 dB tha. Camera ko cable par aur AP ko 5 GHz par le jaane se SNR 30 dB se upar gaya aur calls stable ho gayi.</p><p><b>Seekh:</b> akela signal strength kuch nahi batata; hamesha SNR check karo.</p></div>

<div class="iv"><p class="q">"Ek AP 20 dBm par transmit karta hai. Yeh kitne milliwatts hai, aur 6 dB kam karne par kya hota hai?"</p><p>Strong answer: 20 dBm = 100 mW. Minus 3 dB use aadha karke 50 mW karta hai, aur ek aur minus 3 dB phir aadha karke 25 mW, jo 14 dBm hai. 3 dB aur 10 dB rules batao, ki dB values judti hain jabki mW values multiply hoti hain, aur engineers power kyun kam karte hain: chhote cells, kam co-channel interference aur zyada channel reuse.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>dBm absolute hai (0 dBm = 1 mW); dB relative gain ya loss hai; dBi antenna gain hai.</li>
<li>+3 dB double, −3 dB aadha, +10 dB das guna, −10 dB dasvaan hissa.</li>
<li>EIRP = transmit power − cable loss + antenna gain.</li>
<li>RSSI negative dBm hai: −67 dBm common voice design target hai; SNR = signal − noise, 20 se 25 dB ya zyada rakho.</li>
<li>Cisco power level 1 sabse zyada hai; har level lagbhag 3 dB kam.</li>
</ul></div>
`}};export{e as default};