var e={id:`wifi-from-zero`,h:{en:`Wi-Fi from zero: radio, bands and the big picture`,hi:`Wi-Fi zero se: radio, bands aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn what 802.11 actually is and how it grew from 2 Mbps in 1997 to Wi-Fi 7. You will read a modulation and coding scheme (MCS) table, choose channel widths, explain OFDMA, MU-MIMO, BSS colouring, TWT and MLO, understand the 6 GHz rules (PSC, LPI, VLP, AFC), decode the three frame types, follow a client through scan, authentication and association, and explain EDCA. Then you will use four labs to find out why a client is slow and fix it.</p>
<p><b>Prerequisites.</b> You should know what a VLAN, an SSID and a wireless LAN controller (WLC) are. If not, read the <code>ccna-wlan</code> module first. RF basics (dBm, RSSI, SNR) are revisited briefly here and taught in depth in <code>wl-rf</code>. WLC architectures, CAPWAP and the profile and tag model live in <code>ccna-wlan</code> and <code>np-wireless</code>, and we only use them.</p>

<h3>Analogy: a shared room where everybody talks</h3>
<p>Imagine a hall with one air space. Everybody can talk, but only one person can be understood at a time, and everyone politely waits for a gap. Wi-Fi is that hall. The <b>standard</b> (802.11) is the rule book for the language, the speaking speed, and the order of turns. A newer standard teaches people to speak faster (better modulation), to use more of the hall at once (wider channels, more streams), and to share the hall more fairly (OFDMA, colouring). It cannot make the hall bigger for free, which is why new <b>bands</b> such as 6 GHz matter.</p>

<h3>Radio in sixty seconds</h3>
<p>Wi-Fi sends data as radio waves. <b>Frequency</b> is how many wave cycles per second (GHz means billions). <b>Wavelength</b> is the distance of one cycle: about 12.5 cm at 2.4 GHz, 6 cm at 5 GHz, 5 cm at 6 GHz. Shorter waves lose more energy over distance and through walls, so higher bands reach less far. This is the first big trade-off: <b>lower frequency gives range, higher frequency gives capacity</b> (more free spectrum and more channels).</p>
<p>Power is written in <b>dBm</b>, a logarithmic scale where 0 dBm is 1 milliwatt, 20 dBm is 100 mW and every +3 dB doubles the power. A client measures what it receives as <b>RSSI</b> (for example -65 dBm). The <b>noise floor</b> is the background radio noise, typically around -95 dBm. <b>SNR</b> = signal minus noise, so -65 - (-95) = 30 dB. Data rate follows SNR, and you will see this in chapter 3.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wi-Fi bands">
<rect x="10" y="20" width="200" height="140" rx="8" fill="#fed7aa"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">2.4 GHz</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">about 83 MHz of spectrum</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">3 clean channels (1, 6, 11)</text><text x="110" y="114" text-anchor="middle" class="svg-muted" font-size="12">best range, most crowded</text><text x="110" y="136" text-anchor="middle" class="svg-muted" font-size="12">b, g, n, ax, be</text>
<rect x="225" y="20" width="200" height="140" rx="8" fill="#bae6fd"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="14">5 GHz</text>
<text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">hundreds of MHz, with DFS</text><text x="325" y="92" text-anchor="middle" class="svg-muted" font-size="12">many 20 MHz channels</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">good balance for offices</text><text x="325" y="136" text-anchor="middle" class="svg-muted" font-size="12">a, n, ac, ax, be</text>
<rect x="440" y="20" width="190" height="140" rx="8" fill="#ddd6fe"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">6 GHz</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">up to 1200 MHz (region)</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">wide channels, clean air</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">shortest range, WPA3 only</text><text x="535" y="136" text-anchor="middle" class="svg-muted" font-size="12">ax (6E), be</text>
<line x1="20" y1="190" x2="620" y2="190" stroke="#64748b" stroke-width="2"/><text x="20" y="215" class="svg-muted" font-size="12">more range</text><text x="620" y="215" text-anchor="end" class="svg-muted" font-size="12">more capacity</text>
</svg><p class="cap">Moving up the bands trades range for capacity. Each band has its own rules and channel plan.</p></div>

<h3>Who defines Wi-Fi, and what the names mean</h3>
<p>The <b>IEEE</b> writes the technical standard, called 802.11, with letters for each amendment (802.11n, 802.11ac, 802.11ax, 802.11be). The <b>Wi-Fi Alliance</b> tests products and gives easy names: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax), Wi-Fi 6E (802.11ax in 6 GHz) and Wi-Fi 7 (802.11be). 802.11a, b and g were never renamed. Regulators of each country (in India, the DoT and WPC) decide which frequencies you may use and at what power. A radio set to the wrong <b>country code</b> can break rules, so the country is always configured on the controller.</p>

<h3>What the four labs use, and what is concept only</h3>
<p>The simulator is an original learning model. It really models: which band a WLAN serves (radio policy), RF profile channel width, data rates and the cell edge, client capability (standard, streams, width), and an iw-style link line with a teaching throughput estimate. It does <b>not</b> model OFDMA, MU-MIMO, BSS colouring, TWT, MLO, 6 GHz or DFS radar events. Those chapters are labelled <b>concept only</b>: you must know them for exams and interviews, but you cannot configure them here.</p>
<table class="cmp"><tr><th>Topic</th><th>Simulator</th><th>Chapter</th></tr>
<tr><td>Radio policy per WLAN</td><td>Lab 1 (config)</td><td>10</td></tr>
<tr><td>RF profile width and data rates</td><td>Lab 2 (config)</td><td>4 and 10</td></tr>
<tr><td>Slow client: band and width</td><td>Lab 3 (troubleshoot)</td><td>11</td></tr>
<tr><td>Legacy rates and a 40 MHz 2.4 GHz channel</td><td>Lab 4 (troubleshoot)</td><td>9 and 11</td></tr>
<tr><td>OFDMA, MU-MIMO, colour, TWT, MLO, 6 GHz</td><td>Concept only</td><td>5 and 6</td></tr></table>

<div class="eg"><p><b>Worked example: wavelength.</b> Wavelength = speed of light divided by frequency = 300,000,000 / 2,437,000,000 = 0.123 m for channel 6 (2437 MHz). For channel 36 (5180 MHz) it is 0.058 m. The 5 GHz wave is roughly half as long, so walls and distance hurt it more.</p></div>

<p>For the web UI, the controller work in this module follows the menu map you already know: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> (radio policy), <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b> (width and rates), <b>Monitoring &gt; Wireless &gt; Clients</b> and <b>Radios</b> (evidence). Every GUI action is the same configuration command as on the CLI.</p>

<div class="warn"><p><b>Common mistake.</b> Treating Wi-Fi 6 as a speed upgrade only. Wi-Fi 6 mainly improves efficiency when many clients share the air. A single old laptop does not become fast because the AP is Wi-Fi 6.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wi-Fi 6E is not a new standard letter. It is Wi-Fi 6 (802.11ax) operating in the 6 GHz band. A 6E client therefore also supports 802.11ax features.</p></div>

<div class="scn"><h4>The upgrade that changed nothing</h4><p>A company in Pune replaced all APs with Wi-Fi 6 models and staff said the Wi-Fi felt the same. The engineer read the client links: most laptops were 2.4 GHz-only legacy devices on 20 MHz, and 802.11b rates were still enabled. The hardware was fine; the band, width and rate settings and the old clients limited everything.</p><p><b>Lesson:</b> a Wi-Fi network is only as fast as the weakest of AP capability, client capability, band, width, rates and signal. You check all six.</p></div>

<div class="iv"><p class="q">"Why does 5 GHz give more speed but less range than 2.4 GHz?"</p><p>Strong answer: shorter wavelength means higher free-space path loss (about 6 to 7 dB more than 2.4 GHz at the same distance) and more absorption by walls. 5 GHz has more spectrum and more non-overlapping channels, so it supports wider channels and more clients per area. Mention that this is why dual-band clients are steered to 5 GHz when the signal is strong enough.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11 is the IEEE rule book; Wi-Fi 4 to 7 are the Wi-Fi Alliance names.</li>
<li>Lower frequency means range; higher frequency means capacity. Three bands: 2.4, 5 and 6 GHz.</li>
<li>RSSI is the signal in dBm; SNR is signal minus noise floor and sets the data rate.</li>
<li>Wi-Fi 6E is 802.11ax in 6 GHz, not a new letter.</li>
<li>The labs model band, width, rates and client capability; OFDMA, MU-MIMO, colour, TWT, MLO and 6 GHz are concept only.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki 802.11 asal mein kya hai aur yeh 1997 ke 2 Mbps se Wi-Fi 7 tak kaise pahunchi. Aap modulation and coding scheme (MCS) table padhoge, channel widths choose karoge, OFDMA, MU-MIMO, BSS colouring, TWT aur MLO samjhaoge, 6 GHz ke rules (PSC, LPI, VLP, AFC) samjhoge, teen frame types decode karoge, client ko scan, authentication aur association tak follow karoge, aur EDCA explain karoge. Phir chaar labs mein pata lagaoge ki client slow kyun hai aur use fix karoge.</p>
<p><b>Prerequisites.</b> Aapko pata hona chahiye ki VLAN, SSID aur wireless LAN controller (WLC) kya hote hain. Nahi pata to pehle <code>ccna-wlan</code> module padho. RF basics (dBm, RSSI, SNR) yahan chhote mein dohraye hain aur <code>wl-rf</code> mein gehraai se sikhaye jaate hain. WLC architectures, CAPWAP aur profile-tag model <code>ccna-wlan</code> aur <code>np-wireless</code> mein hain, hum unhe sirf use karte hain.</p>

<h3>Analogy: ek shared room jahan sab bolte hain</h3>
<p>Ek hall socho jismein ek hi hawa ki jagah hai. Sab bol sakte hain, lekin ek waqt par sirf ek insaan samjha jaata hai, aur sab tameez se gap ka intezaar karte hain. Wi-Fi wahi hall hai. <b>Standard</b> (802.11) bhasha, bolne ki speed aur baari ke order ki rule book hai. Naya standard logon ko tez bolna sikhata hai (better modulation), hall ka zyada hissa ek saath use karna (wide channels, zyada streams), aur hall ko zyada fairly share karna (OFDMA, colouring). Woh hall ko free mein bada nahi kar sakta, isliye 6 GHz jaise naye <b>bands</b> matter karte hain.</p>

<h3>Radio sixty seconds mein</h3>
<p>Wi-Fi data ko radio waves ki tarah bhejta hai. <b>Frequency</b> matlab ek second mein kitne wave cycles (GHz matlab arabon). <b>Wavelength</b> ek cycle ki doori hai: 2.4 GHz par lagbhag 12.5 cm, 5 GHz par 6 cm, 6 GHz par 5 cm. Chhoti waves doori aur deewaron se zyada energy khoti hain, isliye higher bands kam door tak pahunchte hain. Yeh pehla bada trade-off hai: <b>lower frequency range deti hai, higher frequency capacity deti hai</b> (zyada free spectrum aur zyada channels).</p>
<p>Power <b>dBm</b> mein likhi jaati hai, ek logarithmic scale jahan 0 dBm matlab 1 milliwatt, 20 dBm matlab 100 mW aur har +3 dB power ko double karta hai. Client jo receive karta hai use <b>RSSI</b> kehte hain (jaise -65 dBm). <b>Noise floor</b> background radio noise hai, aam taur par lagbhag -95 dBm. <b>SNR</b> = signal minus noise, yaani -65 - (-95) = 30 dB. Data rate SNR ke saath chalta hai, yeh chapter 3 mein dikhega.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wi-Fi bands">
<rect x="10" y="20" width="200" height="140" rx="8" fill="#fed7aa"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="14">2.4 GHz</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">lagbhag 83 MHz spectrum</text><text x="110" y="92" text-anchor="middle" class="svg-muted" font-size="12">3 clean channels (1, 6, 11)</text><text x="110" y="114" text-anchor="middle" class="svg-muted" font-size="12">best range, sabse crowded</text><text x="110" y="136" text-anchor="middle" class="svg-muted" font-size="12">b, g, n, ax, be</text>
<rect x="225" y="20" width="200" height="140" rx="8" fill="#bae6fd"/><text x="325" y="45" text-anchor="middle" class="svg-ink" font-size="14">5 GHz</text>
<text x="325" y="70" text-anchor="middle" class="svg-muted" font-size="12">sainkdon MHz, DFS ke saath</text><text x="325" y="92" text-anchor="middle" class="svg-muted" font-size="12">bahut saare 20 MHz channels</text><text x="325" y="114" text-anchor="middle" class="svg-muted" font-size="12">offices ke liye achha balance</text><text x="325" y="136" text-anchor="middle" class="svg-muted" font-size="12">a, n, ac, ax, be</text>
<rect x="440" y="20" width="190" height="140" rx="8" fill="#ddd6fe"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="14">6 GHz</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">1200 MHz tak (region)</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">wide channels, saaf hawa</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">sabse kam range, sirf WPA3</text><text x="535" y="136" text-anchor="middle" class="svg-muted" font-size="12">ax (6E), be</text>
<line x1="20" y1="190" x2="620" y2="190" stroke="#64748b" stroke-width="2"/><text x="20" y="215" class="svg-muted" font-size="12">zyada range</text><text x="620" y="215" text-anchor="end" class="svg-muted" font-size="12">zyada capacity</text>
</svg><p class="cap">Upar ke bands par jaane se range ke badle capacity milti hai. Har band ke apne rules aur channel plan hain.</p></div>

<h3>Wi-Fi kaun define karta hai, aur naamon ka matlab</h3>
<p><b>IEEE</b> technical standard likhta hai, jise 802.11 kehte hain, har amendment ke liye letters ke saath (802.11n, 802.11ac, 802.11ax, 802.11be). <b>Wi-Fi Alliance</b> products test karta hai aur aasaan naam deta hai: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 (802.11ax), Wi-Fi 6E (6 GHz mein 802.11ax) aur Wi-Fi 7 (802.11be). 802.11a, b aur g ko kabhi rename nahi kiya gaya. Har desh ke regulators (India mein DoT aur WPC) tay karte hain ki kaunsi frequencies aur kitni power se use kar sakte ho. Galat <b>country code</b> wala radio rules tod sakta hai, isliye country hamesha controller par configure hoti hai.</p>

<h3>Chaar labs kya use karte hain, aur kya sirf concept hai</h3>
<p>Simulator ek original learning model hai. Yeh sach mein model karta hai: WLAN kaunsa band serve karta hai (radio policy), RF profile channel width, data rates aur cell edge, client capability (standard, streams, width), aur iw-style link line teaching throughput estimate ke saath. Yeh OFDMA, MU-MIMO, BSS colouring, TWT, MLO, 6 GHz ya DFS radar events ko model <b>nahi</b> karta. Un chapters par <b>concept only</b> likha hai: exams aur interviews ke liye aapko woh aane chahiye, lekin yahan unhe configure nahi kar sakte.</p>
<table class="cmp"><tr><th>Topic</th><th>Simulator</th><th>Chapter</th></tr>
<tr><td>Har WLAN ki radio policy</td><td>Lab 1 (config)</td><td>10</td></tr>
<tr><td>RF profile width aur data rates</td><td>Lab 2 (config)</td><td>4 aur 10</td></tr>
<tr><td>Slow client: band aur width</td><td>Lab 3 (troubleshoot)</td><td>11</td></tr>
<tr><td>Legacy rates aur 40 MHz 2.4 GHz channel</td><td>Lab 4 (troubleshoot)</td><td>9 aur 11</td></tr>
<tr><td>OFDMA, MU-MIMO, colour, TWT, MLO, 6 GHz</td><td>Concept only</td><td>5 aur 6</td></tr></table>

<div class="eg"><p><b>Worked example: wavelength.</b> Wavelength = light ki speed divided by frequency = 300,000,000 / 2,437,000,000 = 0.123 m channel 6 (2437 MHz) ke liye. Channel 36 (5180 MHz) ke liye 0.058 m. 5 GHz wave lagbhag aadhi lambi hai, isliye deewarein aur doori use zyada nuksan pahunchati hain.</p></div>

<p>Web UI ke liye, is module ka controller kaam wahi menu map follow karta hai jo aap jaante ho: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> (radio policy), <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b> (width aur rates), <b>Monitoring &gt; Wireless &gt; Clients</b> aur <b>Radios</b> (evidence). Har GUI action wahi configuration command hai jo CLI par hota hai.</p>

<div class="warn"><p><b>Common galti.</b> Wi-Fi 6 ko sirf speed upgrade samajhna. Wi-Fi 6 mainly efficiency badhata hai jab bahut saare clients hawa share karte hain. Ek purana laptop sirf isliye tez nahi ho jaata ki AP Wi-Fi 6 hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Wi-Fi 6E koi naya standard letter nahi hai. Yeh 6 GHz band mein chalne wala Wi-Fi 6 (802.11ax) hai. Isliye 6E client 802.11ax features bhi support karta hai.</p></div>

<div class="scn"><h4>Upgrade jisne kuch nahi badla</h4><p>Pune ki ek company ne saare APs Wi-Fi 6 models se badal diye aur staff ne kaha ki Wi-Fi pehle jaisa hi lagta hai. Engineer ne client links padhe: zyada tar laptops 2.4 GHz-only legacy devices the, 20 MHz par, aur 802.11b rates abhi bhi enabled the. Hardware theek tha; band, width, rate settings aur purane clients sab kuch limit kar rahe the.</p><p><b>Seekh:</b> Wi-Fi network utna hi tez hai jitna AP capability, client capability, band, width, rates aur signal mein sabse kamzor hai. Aap chhe ki chhe check karte ho.</p></div>

<div class="iv"><p class="q">"5 GHz zyada speed lekin 2.4 GHz se kam range kyun deta hai?"</p><p>Strong answer: chhoti wavelength ka matlab hai zyada free-space path loss (same doori par 2.4 GHz se lagbhag 6 se 7 dB zyada) aur deewaron se zyada absorption. 5 GHz mein zyada spectrum aur zyada non-overlapping channels hain, isliye wide channels aur har area mein zyada clients support hote hain. Batao ki isiliye dual-band clients ko 5 GHz ki taraf steer kiya jaata hai jab signal kaafi ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.11 IEEE ki rule book hai; Wi-Fi 4 se 7 Wi-Fi Alliance ke naam hain.</li>
<li>Lower frequency matlab range; higher frequency matlab capacity. Teen bands: 2.4, 5 aur 6 GHz.</li>
<li>RSSI dBm mein signal hai; SNR signal minus noise floor hai aur data rate tay karta hai.</li>
<li>Wi-Fi 6E 6 GHz mein 802.11ax hai, naya letter nahi.</li>
<li>Labs band, width, rates aur client capability model karte hain; OFDMA, MU-MIMO, colour, TWT, MLO aur 6 GHz concept only hain.</li>
</ul></div>
`}};export{e as default};