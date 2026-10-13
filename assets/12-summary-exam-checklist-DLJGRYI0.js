var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>A pilot runs through a printed checklist before every flight, however experienced they are, because the checklist catches what memory misses. Use this chapter the same way before the exam and before every wireless deployment.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can match 802.11a, b, g, n, ac, ax and be to their band, Wi-Fi name and headline feature.</li>
<li>I can explain why 2.4 GHz has only three non-overlapping channels (1, 6, 11) and calculate a centre frequency.</li>
<li>I can choose a channel width (20, 40, 80, 160 MHz) by balancing speed against the number of channels.</li>
<li>I can explain 802.11h (DFS and TPC), country codes and why DFS channels can cause outages near radar.</li>
<li>I can compare 2.4, 5 and 6 GHz and explain band steering.</li>
<li>I can define SSID, BSSID, BSS, ESS and ESSID, and explain roaming.</li>
<li>I can describe infrastructure, ad hoc, mesh, point-to-point and point-to-multipoint networks.</li>
<li>I can pick omnidirectional or directional antennas and calculate EIRP.</li>
<li>I can compare autonomous and lightweight APs, and explain CAPWAP and controller discovery.</li>
<li>I can compare WPA2 and WPA3, PSK and Enterprise, and name the 802.1X roles.</li>
<li>I can design a guest network with VLAN isolation and a captive portal.</li>
<li>I can plan channels and power for a floor on a controller and verify there is no interference.</li>
<li>I can troubleshoot interference, channel overlap, signal loss, poor coverage, disassociation and roaming faults.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="20" y="20" width="190" height="44" rx="8" fill="#bae6fd"/><text x="115" y="47" text-anchor="middle" class="svg-ink" font-size="13">Radio: bands, channels</text>
<rect x="225" y="20" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Design: SSIDs, antennas</text>
<rect x="430" y="20" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="525" y="47" text-anchor="middle" class="svg-ink" font-size="13">Architecture: APs, WLC</text>
<rect x="120" y="110" width="190" height="44" rx="8" fill="#fde68a"/><text x="215" y="137" text-anchor="middle" class="svg-ink" font-size="13">Security: WPA3, 802.1X</text>
<rect x="330" y="110" width="190" height="44" rx="8" fill="#fed7aa"/><text x="425" y="137" text-anchor="middle" class="svg-ink" font-size="13">Operate: plan, troubleshoot</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Every wireless question on the exam falls into one of these five boxes.</text>
</svg><p class="cap">The module on one page.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BSSID</dt><dd>MAC address of one AP radio for one SSID.</dd>
<dt>ESS / ESSID</dt><dd>Several APs sharing one SSID and security over a common wired network.</dd>
<dt>Band steering</dt><dd>Nudging dual-band clients from 2.4 GHz to 5 or 6 GHz.</dd>
<dt>DFS / TPC</dt><dd>802.11h radar detection with channel moves, and transmit power control, in 5 GHz.</dd>
<dt>EIRP</dt><dd>Transmit power + antenna gain - cable loss; what regulators limit.</dd>
<dt>CAPWAP</dt><dd>AP-to-controller protocol; UDP 5246 control, 5247 data.</dd>
<dt>SAE</dt><dd>WPA3-Personal handshake that resists offline dictionary attacks.</dd>
<dt>802.1X</dt><dd>Port-based access control: supplicant, authenticator, RADIUS server, EAP.</dd>
<dt>Captive portal</dt><dd>Web page guests must pass before internet access; no encryption.</dd>
<dt>RRM</dt><dd>Controller feature that sets channels and power automatically.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Standards</td><td>Wi-Fi 4 = 802.11n (2.4/5), Wi-Fi 5 = 802.11ac (5 only), Wi-Fi 6/6E = 802.11ax (6E adds 6 GHz), Wi-Fi 7 = 802.11be</td></tr>
<tr><td>2.4 GHz</td><td>Non-overlapping 1, 6, 11; always 20 MHz; longest range, most interference</td></tr>
<tr><td>5 GHz</td><td>All 20 MHz channels non-overlapping; DFS on 52 to 64 and 100 to 144</td></tr>
<tr><td>6 GHz</td><td>1200 MHz, 59 x 20 MHz channels, WPA3 or Enhanced Open mandatory</td></tr>
<tr><td>Signal targets</td><td>-67 dBm for voice/video, SNR 25 dB, 15 to 20 percent cell overlap</td></tr>
<tr><td>Security</td><td>WPA2 = AES-CCMP; WPA3 = SAE + PMF; never WEP/WPA/TKIP; disable WPS</td></tr>
<tr><td>Enterprise</td><td>RADIUS UDP 1812/1813; EAP-TLS (certificates) strongest</td></tr>
<tr><td>APs</td><td>Autonomous = standalone; lightweight = controller + CAPWAP; discovery via DHCP option 43, DNS, broadcast, static</td></tr>
<tr><td>Antennas</td><td>Omni for ceiling coverage; Yagi, dish, panel for directional and point-to-point</td></tr>
</table>

<h3>Command cheat-sheet (lab controller)</h3>
<pre class="code"><span class="c">! read</span>
show ap summary
show advanced 802.11b channel          <span class="c">! 2.4 GHz plan and interfering pairs</span>
show advanced 802.11a channel          <span class="c">! 5 GHz plan</span>
show ap config 802.11b AP2             <span class="c">! channel, frequency, power of one radio</span>
show ap auto-rf 802.11b AP1            <span class="c">! neighbours one AP hears</span>
show wlan summary / show wlan 1
show msglog
<span class="c">! change</span>
config 802.11b channel ap AP2 6
config 802.11a channel ap AP3 44
config 802.11b txPower ap AP1 2        <span class="c">! level 1 = 20 dBm, -3 dB per level</span>
config wlan security wpa akm sae enable 1</pre>

<div class="eg"><p><b>Worked example: a full design in five lines.</b> 2-floor office, 120 staff, 20 guests. 5 GHz primary with band steering, 40 MHz, non-DFS channels near the airport; 2.4 GHz at 20 MHz on 1/6/11 for IoT. Lightweight APs on a controller with RRM. Staff SSID WPA3-Enterprise (EAP-TLS) in VLAN 20; guest SSID in VLAN 30 with captive portal, client isolation and internet-only ACL. Verify with a post-install survey at -67 dBm and 25 dB SNR.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising numbers without the reason. The exam often describes a situation instead of naming the term. If you know why channels overlap, why DFS moves channels and why a portal does not encrypt, you can answer questions phrased in any way.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read the whole scenario: "clients cannot see the network" (band, SSID broadcast, 6E support, DFS support), "clients see it but cannot join" (security, key, RADIUS), "join but no internet" (VLAN, DHCP, portal, ACL), "slow" (overlap, interference, width, band) and "drop while walking" (roaming). The keyword tells you the layer.</p></div>

<div class="scn"><h4>The pre-flight checklist that saved a launch</h4><p>Before opening a new branch, an engineer ran this checklist against the controller: the country code was still the factory default, two APs were on DFS channels next to a port with radar, the guest SSID was mapped to the staff VLAN, and WPS was enabled on a small autonomous AP in the meeting room. Each took a minute to fix before opening day. Without the check, all four would have become tickets in the first week.</p><p><b>Lesson:</b> a short checklist before go-live prevents most wireless incidents.</p></div>

<div class="iv"><p class="q">"Walk me through how you would design Wi-Fi for a new office floor."</p><p>Strong answer: gather requirements (users, devices, applications, voice); predictive design, then an AP-on-a-stick or passive survey; choose bands (5 GHz primary, band steering, 6 GHz for new clients), channel width and a non-overlapping plan; set country code and avoid DFS where radar is near; choose lightweight APs with a controller and RRM; secure staff with WPA3-Enterprise and 802.1X, guests on an isolated VLAN with a portal; verify with a post-install survey; document the plan.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Radio: standards, bands, 1/6/11, channel width, 802.11h and country rules.</li>
<li>Design: SSID/BSSID/ESS, network types, antennas, EIRP, site surveys.</li>
<li>Architecture: autonomous vs lightweight, CAPWAP, controller discovery, RRM.</li>
<li>Security: WPA3 SAE, PMF, 802.1X Enterprise, guest isolation, captive portals.</li>
<li>Operations: plan channels and power, then troubleshoot the six classic faults with the workflow.</li>
</ul></div>
`,hi:`
<p>Pilot har flight se pehle ek printed checklist chalata hai, chahe kitna bhi experienced ho, kyunki checklist woh pakadti hai jo yaaddasht chhod deti hai. Is chapter ko exam se pehle aur har wireless deployment se pehle aise hi use karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main 802.11a, b, g, n, ac, ax aur be ko unke band, Wi-Fi naam aur headline feature se match kar sakta hoon.</li>
<li>Main samjha sakta hoon ki 2.4 GHz mein sirf teen non-overlapping channels (1, 6, 11) kyun hain aur centre frequency calculate kar sakta hoon.</li>
<li>Main speed aur channels ki sankhya ko balance karke channel width (20, 40, 80, 160 MHz) chun sakta hoon.</li>
<li>Main 802.11h (DFS aur TPC), country codes aur yeh samjha sakta hoon ki radar ke paas DFS channels outages kyun la sakte hain.</li>
<li>Main 2.4, 5 aur 6 GHz compare kar sakta hoon aur band steering samjha sakta hoon.</li>
<li>Main SSID, BSSID, BSS, ESS aur ESSID define kar sakta hoon, aur roaming samjha sakta hoon.</li>
<li>Main infrastructure, ad hoc, mesh, point-to-point aur point-to-multipoint networks describe kar sakta hoon.</li>
<li>Main omnidirectional ya directional antennas chun sakta hoon aur EIRP calculate kar sakta hoon.</li>
<li>Main autonomous aur lightweight APs compare kar sakta hoon, aur CAPWAP aur controller discovery samjha sakta hoon.</li>
<li>Main WPA2 aur WPA3, PSK aur Enterprise compare kar sakta hoon, aur 802.1X roles bata sakta hoon.</li>
<li>Main VLAN isolation aur captive portal ke saath guest network design kar sakta hoon.</li>
<li>Main controller par ek floor ke channels aur power plan kar sakta hoon aur verify kar sakta hoon ki koi interference nahi hai.</li>
<li>Main interference, channel overlap, signal loss, kam coverage, disassociation aur roaming faults troubleshoot kar sakta hoon.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="20" y="20" width="190" height="44" rx="8" fill="#bae6fd"/><text x="115" y="47" text-anchor="middle" class="svg-ink" font-size="13">Radio: bands, channels</text>
<rect x="225" y="20" width="190" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">Design: SSIDs, antennas</text>
<rect x="430" y="20" width="190" height="44" rx="8" fill="#ddd6fe"/><text x="525" y="47" text-anchor="middle" class="svg-ink" font-size="13">Architecture: APs, WLC</text>
<rect x="120" y="110" width="190" height="44" rx="8" fill="#fde68a"/><text x="215" y="137" text-anchor="middle" class="svg-ink" font-size="13">Security: WPA3, 802.1X</text>
<rect x="330" y="110" width="190" height="44" rx="8" fill="#fed7aa"/><text x="425" y="137" text-anchor="middle" class="svg-ink" font-size="13">Operate: plan, troubleshoot</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Exam ka har wireless sawaal in paanch boxes mein se kisi ek mein aata hai.</text>
</svg><p class="cap">Ek page par poora module.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BSSID</dt><dd>Ek SSID ke liye ek AP radio ka MAC address.</dd>
<dt>ESS / ESSID</dt><dd>Common wired network par ek SSID aur security share karne wale kai APs.</dd>
<dt>Band steering</dt><dd>Dual-band clients ko 2.4 GHz se 5 ya 6 GHz ki taraf dhakelna.</dd>
<dt>DFS / TPC</dt><dd>5 GHz mein 802.11h radar detection channel moves ke saath, aur transmit power control.</dd>
<dt>EIRP</dt><dd>Transmit power + antenna gain - cable loss; jo regulators limit karte hain.</dd>
<dt>CAPWAP</dt><dd>AP-to-controller protocol; UDP 5246 control, 5247 data.</dd>
<dt>SAE</dt><dd>WPA3-Personal handshake jo offline dictionary attacks jhel leta hai.</dd>
<dt>802.1X</dt><dd>Port-based access control: supplicant, authenticator, RADIUS server, EAP.</dd>
<dt>Captive portal</dt><dd>Web page jise guests ko internet access se pehle paar karna padta hai; koi encryption nahi.</dd>
<dt>RRM</dt><dd>Controller feature jo channels aur power apne aap set karta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Standards</td><td>Wi-Fi 4 = 802.11n (2.4/5), Wi-Fi 5 = 802.11ac (sirf 5), Wi-Fi 6/6E = 802.11ax (6E 6 GHz jodta hai), Wi-Fi 7 = 802.11be</td></tr>
<tr><td>2.4 GHz</td><td>Non-overlapping 1, 6, 11; hamesha 20 MHz; sabse zyada range, sabse zyada interference</td></tr>
<tr><td>5 GHz</td><td>Saare 20 MHz channels non-overlapping; 52 se 64 aur 100 se 144 par DFS</td></tr>
<tr><td>6 GHz</td><td>1200 MHz, 59 x 20 MHz channels, WPA3 ya Enhanced Open mandatory</td></tr>
<tr><td>Signal targets</td><td>Voice/video ke liye -67 dBm, SNR 25 dB, 15 se 20 percent cell overlap</td></tr>
<tr><td>Security</td><td>WPA2 = AES-CCMP; WPA3 = SAE + PMF; WEP/WPA/TKIP kabhi nahi; WPS disable karo</td></tr>
<tr><td>Enterprise</td><td>RADIUS UDP 1812/1813; EAP-TLS (certificates) sabse strong</td></tr>
<tr><td>APs</td><td>Autonomous = standalone; lightweight = controller + CAPWAP; discovery DHCP option 43, DNS, broadcast, static se</td></tr>
<tr><td>Antennas</td><td>Ceiling coverage ke liye omni; directional aur point-to-point ke liye Yagi, dish, panel</td></tr>
</table>

<h3>Command cheat-sheet (lab controller)</h3>
<pre class="code"><span class="c">! padhna</span>
show ap summary
show advanced 802.11b channel          <span class="c">! 2.4 GHz plan aur interfering pairs</span>
show advanced 802.11a channel          <span class="c">! 5 GHz plan</span>
show ap config 802.11b AP2             <span class="c">! ek radio ka channel, frequency, power</span>
show ap auto-rf 802.11b AP1            <span class="c">! ek AP jo padosi sunta hai</span>
show wlan summary / show wlan 1
show msglog
<span class="c">! badalna</span>
config 802.11b channel ap AP2 6
config 802.11a channel ap AP3 44
config 802.11b txPower ap AP1 2        <span class="c">! level 1 = 20 dBm, har level -3 dB</span>
config wlan security wpa akm sae enable 1</pre>

<div class="eg"><p><b>Worked example: paanch lines mein poora design.</b> 2-floor office, 120 staff, 20 guests. Band steering ke saath 5 GHz primary, 40 MHz, airport ke paas non-DFS channels; IoT ke liye 2.4 GHz 20 MHz par 1/6/11 par. RRM ke saath controller par lightweight APs. Staff SSID VLAN 20 mein WPA3-Enterprise (EAP-TLS); guest SSID VLAN 30 mein captive portal, client isolation aur internet-only ACL ke saath. -67 dBm aur 25 dB SNR par post-install survey se verify karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Wajah samjhe bina numbers ratna. Exam aksar term ka naam lene ki jagah situation describe karta hai. Agar aapko pata hai ki channels overlap kyun karte hain, DFS channels kyun badalta hai aur portal encrypt kyun nahi karta, to aap kisi bhi tarah se poochhe gaye sawaal ka jawab de sakte ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Poora scenario padho: "clients ko network nahi dikhta" (band, SSID broadcast, 6E support, DFS support), "dikhta hai par join nahi hota" (security, key, RADIUS), "join hota hai par internet nahi" (VLAN, DHCP, portal, ACL), "slow" (overlap, interference, width, band) aur "chalte hue drop" (roaming). Keyword aapko layer batata hai.</p></div>

<div class="scn"><h4>Pre-flight checklist jisne launch bachaya</h4><p>Nayi branch kholne se pehle ek engineer ne controller par yeh checklist chalayi: country code abhi bhi factory default tha, radar wale port ke paas do APs DFS channels par the, guest SSID staff VLAN se mapped tha, aur meeting room ke ek chhote autonomous AP par WPS enabled tha. Opening day se pehle har ek ko theek karne mein ek minute laga. Check ke bina chaaron pehle hafte mein tickets ban jaate.</p><p><b>Seekh:</b> go-live se pehle ek chhoti checklist zyada tar wireless incidents rok deti hai.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki aap naye office floor ke liye Wi-Fi kaise design karoge."</p><p>Strong answer: requirements ikatthi karo (users, devices, applications, voice); predictive design, phir AP-on-a-stick ya passive survey; bands chuno (5 GHz primary, band steering, naye clients ke liye 6 GHz), channel width aur non-overlapping plan; country code set karo aur jahan radar paas ho DFS se bacho; controller aur RRM ke saath lightweight APs chuno; staff ko WPA3-Enterprise aur 802.1X se secure karo, guests ko portal ke saath isolated VLAN par; post-install survey se verify karo; plan document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Radio: standards, bands, 1/6/11, channel width, 802.11h aur country rules.</li>
<li>Design: SSID/BSSID/ESS, network types, antennas, EIRP, site surveys.</li>
<li>Architecture: autonomous vs lightweight, CAPWAP, controller discovery, RRM.</li>
<li>Security: WPA3 SAE, PMF, 802.1X Enterprise, guest isolation, captive portals.</li>
<li>Operations: channels aur power plan karo, phir workflow se chhe classic faults troubleshoot karo.</li>
</ul></div>
`}};export{e as default};