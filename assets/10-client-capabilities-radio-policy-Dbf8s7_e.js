var e={id:`client-capabilities-radio-policy`,h:{en:`Client capabilities, radio policy and link budget (Lab 1)`,hi:`Client capabilities, radio policy aur link budget (Lab 1)`},body:{en:`
<p>An AP and a client agree on the best settings both can do. The slower of the two wins. So before you tune the AP, you must know what the client is. This chapter covers client capabilities, how a WLAN chooses its bands (radio policy), the link budget arithmetic that explains signal strength, and Lab 1.</p>

<h3>What a client advertises</h3>
<p>In its association request a client lists its capabilities. These are what you check when a device is "slow":</p>
<table class="cmp"><tr><th>Capability</th><th>Question it answers</th><th>Typical values</th></tr>
<tr><td>Bands</td><td>Can it hear 5 or 6 GHz?</td><td>2.4 only (IoT, old), dual band, tri-band</td></tr>
<tr><td>Standard</td><td>n, ac, ax, be?</td><td>HT, VHT, HE, EHT capability elements</td></tr>
<tr><td>Spatial streams</td><td>How many parallel streams?</td><td>1 (phones, IoT), 2 (laptops), 3 or 4 (rare)</td></tr>
<tr><td>Maximum width</td><td>20, 40, 80, 160 MHz?</td><td>Phones 80 MHz, IoT 20 MHz</td></tr>
<tr><td>Security</td><td>WPA2, WPA3, PMF?</td><td>Needed for 6 GHz</td></tr>
<tr><td>Roaming and power save</td><td>802.11k, v, r? TWT?</td><td>Varies by device</td></tr></table>
<p>The peak rate of a client is then streams x width x MCS, as in chapter 3. LAPTOP1 in the labs is Wi-Fi 6, two streams, up to 80 MHz and dual band: its best case is MCS 11 at 80 MHz with two streams, 1201 Mbps. SENSOR1 is a 2.4 GHz-only device: it will never see 5 GHz, whatever you configure. In Lab 4 LAPTOP1 becomes an 802.11n laptop on 2.4 GHz, so 40 MHz would be its theoretical limit.</p>

<h3>Radio policy: which bands does a WLAN serve?</h3>
<p>A WLAN can be broadcast on both bands, on 2.4 GHz only, or on 5 GHz only (and 6 GHz on real hardware). That is the <b>radio policy</b>. Design uses it in two ways. First, give 5 GHz-capable users a 5 GHz-only SSID so they are never "stuck" on 2.4 GHz. Second, give low-power 2.4 GHz-only devices a separate SSID so you can use different security and slower rates without hurting laptops. A dual-band SSID relies on the client to choose; the controller can steer (band select, concept only here), but a 5 GHz-only SSID is deterministic.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Radio policy design">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">NK-STAFF</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">5 GHz only, VLAN 20</text>
<rect x="20" y="110" width="180" height="60" rx="8" fill="#fed7aa"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">NK-IOT</text><text x="110" y="155" text-anchor="middle" class="svg-muted" font-size="12">2.4 GHz only, VLAN 40</text>
<rect x="400" y="20" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 (Wi-Fi 6, dual band)</text><text x="510" y="65" text-anchor="middle" class="svg-muted" font-size="12">joins NK-STAFF on 5 GHz</text>
<rect x="400" y="110" width="220" height="60" rx="8" fill="#fde68a"/><text x="510" y="135" text-anchor="middle" class="svg-ink" font-size="13">SENSOR1 (2.4 GHz only)</text><text x="510" y="155" text-anchor="middle" class="svg-muted" font-size="12">joins NK-IOT on 2.4 GHz</text>
<line x1="200" y1="50" x2="398" y2="50" stroke="#64748b" stroke-width="2"/><line x1="200" y1="140" x2="398" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: one SSID per client need. The radio policy is the switch.</p></div>

<h3>Lab 1: radio policy, step by step</h3>
<p>Task 1 restricts NK-STAFF to 5 GHz. A WLAN must be disabled before its radio policy changes, so shut it, change it, enable it.</p>
<pre class="code">wlan NK-STAFF
 shutdown
 no radio policy dot11 24ghz
 no shutdown</pre>
<p>Task 2 builds the new WLAN, its policy profile and the policy-tag mapping (the profile and tag model is from np-wireless):</p>
<pre class="code">wlan NK-IOT 4 NK-IOT
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkIot2024
 radio policy dot11 24ghz
 no shutdown
wireless profile policy PP-IOT
 vlan 40
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-IOT policy PP-IOT</pre>
<p>GUI paths: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> (open NK-STAFF, disable it, change <b>General &gt; Radio Policy</b>, enable; then Add for NK-IOT), <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add</b> (PP-IOT, VLAN 40), <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy &gt; PT-CAMPUS</b> (map the WLAN to the policy). Then check <b>Monitoring &gt; Wireless &gt; Clients</b> for band and VLAN, and save with <b>Administration &gt; Management &gt; Save Configuration</b>.</p>
<pre class="out">WLC1# show wlan name NK-STAFF

WLAN Profile Name     : NK-STAFF
=================================================
Identifier                     : 1
Network Name (SSID)            : NK-STAFF
Status                         : Enabled
Broadcast SSID                 : Enabled
<span class="hl">Configured Radio Bands         : 5 GHz only</span>

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
Band/channel: 5 GHz / 36
IP address  : 10.10.20.51/24 (DHCP)</pre>
<p>Task 3 proves it: LAPTOP1 must show 5 GHz and an address in 10.10.20.0/24; SENSOR1 must connect with <code>wifi connect NK-IOT psk NkIot2024</code>, show 2.4 GHz and an address in 10.10.40.0/24, and both must reach RAD1 (<code>ping 10.10.60.20</code>). Values above are samples; your channels may differ.</p>

<h3>Link budget basics</h3>
<p>Why is the signal -61 dBm at 10 metres? Because of the <b>link budget</b>, simple dB addition: <b>received power = transmit power + antenna gains - cable losses - path loss</b>. <b>EIRP</b> is transmit power plus antenna gain minus cable loss. <b>Free-space path loss (FSPL)</b> in dB = 32.44 + 20 log10(frequency in MHz) + 20 log10(distance in km).</p>
<div class="eg"><p><b>Worked example.</b> AP at 5180 MHz, 17 dBm transmit, 3 dBi antenna, no cable loss: EIRP = 20 dBm. Distance 20 m = 0.02 km: FSPL = 32.44 + 74.3 + (-34.0) = 72.8 dB. Received power = 20 - 72.8 = -52.8 dBm in free space. Real offices add 3 to 10 dB per wall and fading, so you would measure -60 to -70 dBm. Doubling the distance costs 6 dB; moving from 2.4 to 5 GHz costs about 6.7 dB at the same distance.</p></div>
<p>Remember three rules: every 3 dB is double (or half) the power, every 10 dB is ten times, and every doubling of distance costs 6 dB in free space (35 dB per decade or so indoors, which is the figure the simulator uses). The full design maths (fade margin, antenna choices) is in wl-design.</p>

<div class="warn"><p><b>Common mistake.</b> Changing the radio policy of an enabled WLAN, which the controller refuses, or forgetting to map the new WLAN in the policy tag. The SSID then never broadcasts from the APs that use that tag.</p></div>
<div class="exam"><p><b>Exam trap.</b> A 2.4 GHz-only SSID with an 802.11ax laptop still gives the laptop only 2.4 GHz speed (20 MHz, no 5 GHz). Capability tells you the maximum, but band, width and rates decide the real value.</p></div>

<div class="scn"><h4>Smart meters on the staff SSID</h4><p>Facilities attached 40 smart meters (2.4 GHz only, 802.11n, WPA2-PSK) to the staff SSID. To keep them working the team had left 802.11b rates on and the staff SSID on both bands. Laptops then paired with 2.4 GHz at random and ran slow. The fix was a separate IoT SSID on 2.4 GHz only (its own VLAN), and staff on 5 GHz only.</p><p><b>Lesson:</b> use radio policy and SSIDs to separate device classes instead of lowering the standard for everyone.</p></div>

<div class="iv"><p class="q">"How would you handle a mix of modern laptops and old 2.4 GHz-only sensors?"</p><p>Strong answer: separate SSIDs and VLANs by radio policy: 5 GHz (or dual band with band steering) for laptops, a 2.4 GHz-only SSID for sensors with simple PSK or MPSK and a restricted VLAN. Disable low rates on the staff SSID's 2.4 GHz where possible and keep 2.4 GHz at 20 MHz.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Clients advertise bands, standard, streams, width, security and roaming support; the slowest side wins.</li>
<li>Radio policy decides the bands a WLAN serves; disable the WLAN before you change it.</li>
<li>Lab 1: NK-STAFF 5 GHz only (VLAN 20), NK-IOT 2.4 GHz only (VLAN 40) mapped in PT-CAMPUS.</li>
<li>Link budget: received power = EIRP - path loss; 3 dB doubles power, 10 dB is ten times.</li>
<li>FSPL = 32.44 + 20 log f(MHz) + 20 log d(km).</li>
</ul></div>
`,hi:`
<p>AP aur client woh best settings agree karte hain jo dono kar sakte hain. Dono mein jo dheema hai woh jeet ta hai. Isliye AP tune karne se pehle jaanna zaroori hai ki client kya hai. Yeh chapter client capabilities, WLAN apne bands kaise chunta hai (radio policy), link budget arithmetic jo signal strength samjhata hai, aur Lab 1 cover karta hai.</p>

<h3>Client kya advertise karta hai</h3>
<p>Association request mein client apni capabilities list karta hai. Device "slow" ho to yahi check karte ho:</p>
<table class="cmp"><tr><th>Capability</th><th>Kaunsa sawal</th><th>Typical values</th></tr>
<tr><td>Bands</td><td>Kya woh 5 ya 6 GHz sun sakta hai?</td><td>Sirf 2.4 (IoT, purane), dual band, tri-band</td></tr>
<tr><td>Standard</td><td>n, ac, ax, be?</td><td>HT, VHT, HE, EHT capability elements</td></tr>
<tr><td>Spatial streams</td><td>Kitni parallel streams?</td><td>1 (phones, IoT), 2 (laptops), 3 ya 4 (rare)</td></tr>
<tr><td>Maximum width</td><td>20, 40, 80, 160 MHz?</td><td>Phones 80 MHz, IoT 20 MHz</td></tr>
<tr><td>Security</td><td>WPA2, WPA3, PMF?</td><td>6 GHz ke liye zaroori</td></tr>
<tr><td>Roaming aur power save</td><td>802.11k, v, r? TWT?</td><td>Device ke hisaab se</td></tr></table>
<p>Client ki peak rate phir streams x width x MCS hoti hai, jaise chapter 3 mein. Labs mein LAPTOP1 Wi-Fi 6, do streams, 80 MHz tak aur dual band hai: uska best case do streams ke saath 80 MHz par MCS 11 hai, 1201 Mbps. SENSOR1 sirf 2.4 GHz wala device hai: aap kuch bhi configure karo, woh 5 GHz kabhi nahi dekhega. Lab 4 mein LAPTOP1 2.4 GHz par 802.11n laptop ban jaata hai, isliye 40 MHz uski theoretical limit hogi.</p>

<h3>Radio policy: WLAN kaunse bands serve karta hai?</h3>
<p>WLAN dono bands par, sirf 2.4 GHz par, ya sirf 5 GHz par (aur real hardware par 6 GHz) broadcast ho sakta hai. Yahi <b>radio policy</b> hai. Design ise do tarah use karta hai. Pehla, 5 GHz-capable users ko 5 GHz-only SSID do taaki woh kabhi 2.4 GHz par "atke" na rahein. Dusra, low-power 2.4 GHz-only devices ko alag SSID do taaki laptops ko nuksan pahunchaye bina alag security aur slower rates use kar sako. Dual-band SSID client ke chunaav par depend karta hai; controller steer kar sakta hai (band select, yahan concept only), lekin 5 GHz-only SSID deterministic hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Radio policy design">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">NK-STAFF</text><text x="110" y="65" text-anchor="middle" class="svg-muted" font-size="12">sirf 5 GHz, VLAN 20</text>
<rect x="20" y="110" width="180" height="60" rx="8" fill="#fed7aa"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">NK-IOT</text><text x="110" y="155" text-anchor="middle" class="svg-muted" font-size="12">sirf 2.4 GHz, VLAN 40</text>
<rect x="400" y="20" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="510" y="45" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 (Wi-Fi 6, dual band)</text><text x="510" y="65" text-anchor="middle" class="svg-muted" font-size="12">NK-STAFF 5 GHz par join</text>
<rect x="400" y="110" width="220" height="60" rx="8" fill="#fde68a"/><text x="510" y="135" text-anchor="middle" class="svg-ink" font-size="13">SENSOR1 (sirf 2.4 GHz)</text><text x="510" y="155" text-anchor="middle" class="svg-muted" font-size="12">NK-IOT 2.4 GHz par join</text>
<line x1="200" y1="50" x2="398" y2="50" stroke="#64748b" stroke-width="2"/><line x1="200" y1="140" x2="398" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: har client need ke liye ek SSID. Radio policy switch hai.</p></div>

<h3>Lab 1: radio policy, step by step</h3>
<p>Task 1 NK-STAFF ko 5 GHz tak restrict karta hai. Radio policy badalne se pehle WLAN disabled hona chahiye, isliye shut karo, badlo, enable karo.</p>
<pre class="code">wlan NK-STAFF
 shutdown
 no radio policy dot11 24ghz
 no shutdown</pre>
<p>Task 2 naya WLAN, uska policy profile aur policy-tag mapping banata hai (profile aur tag model np-wireless se hai):</p>
<pre class="code">wlan NK-IOT 4 NK-IOT
 no security wpa akm dot1x
 security wpa akm psk
 security wpa psk set-key ascii 0 NkIot2024
 radio policy dot11 24ghz
 no shutdown
wireless profile policy PP-IOT
 vlan 40
 no shutdown
wireless tag policy PT-CAMPUS
 wlan NK-IOT policy PP-IOT</pre>
<p>GUI paths: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs</b> (NK-STAFF kholo, disable karo, <b>General &gt; Radio Policy</b> badlo, enable; phir NK-IOT ke liye Add), <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Add</b> (PP-IOT, VLAN 40), <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; Policy &gt; PT-CAMPUS</b> (WLAN ko policy se map karo). Phir band aur VLAN ke liye <b>Monitoring &gt; Wireless &gt; Clients</b> dekho, aur <b>Administration &gt; Management &gt; Save Configuration</b> se save karo.</p>
<pre class="out">WLC1# show wlan name NK-STAFF

WLAN Profile Name     : NK-STAFF
=================================================
Identifier                     : 1
Network Name (SSID)            : NK-STAFF
Status                         : Enabled
Broadcast SSID                 : Enabled
<span class="hl">Configured Radio Bands         : 5 GHz only</span>

LAPTOP1&gt; wifi status
SSID        : NK-STAFF
Band/channel: 5 GHz / 36
IP address  : 10.10.20.51/24 (DHCP)</pre>
<p>Task 3 prove karta hai: LAPTOP1 ko 5 GHz aur 10.10.20.0/24 ka address dikhana chahiye; SENSOR1 ko <code>wifi connect NK-IOT psk NkIot2024</code> se connect hona chahiye, 2.4 GHz aur 10.10.40.0/24 ka address dikhana chahiye, aur dono RAD1 tak pahunchen (<code>ping 10.10.60.20</code>). Upar ki values samples hain; aapke channels alag ho sakte hain.</p>

<h3>Link budget basics</h3>
<p>10 metre par signal -61 dBm kyun hai? <b>Link budget</b> ki wajah se, simple dB addition: <b>received power = transmit power + antenna gains - cable losses - path loss</b>. <b>EIRP</b> transmit power plus antenna gain minus cable loss hai. <b>Free-space path loss (FSPL)</b> dB mein = 32.44 + 20 log10(frequency MHz mein) + 20 log10(distance km mein).</p>
<div class="eg"><p><b>Worked example.</b> AP 5180 MHz par, 17 dBm transmit, 3 dBi antenna, cable loss nahi: EIRP = 20 dBm. Distance 20 m = 0.02 km: FSPL = 32.44 + 74.3 + (-34.0) = 72.8 dB. Free space mein received power = 20 - 72.8 = -52.8 dBm. Real offices har deewar par 3 se 10 dB aur fading jodte hain, isliye aap -60 se -70 dBm measure karoge. Doori double karne par 6 dB jaata hai; 2.4 se 5 GHz jaane par same doori par lagbhag 6.7 dB.</p></div>
<p>Teen rules yaad rakho: har 3 dB power ko double (ya half) karta hai, har 10 dB das guna, aur doori double karne par free space mein 6 dB jaata hai (indoors lagbhag 35 dB per decade, jo simulator use karta hai). Poora design maths (fade margin, antenna choices) wl-design mein hai.</p>

<div class="warn"><p><b>Common galti.</b> Enabled WLAN ki radio policy badalna, jise controller mana kar deta hai, ya naye WLAN ko policy tag mein map karna bhool jaana. Tab SSID un APs se kabhi broadcast nahi hota jo us tag ko use karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> 2.4 GHz-only SSID ke saath 802.11ax laptop ko bhi sirf 2.4 GHz speed milti hai (20 MHz, 5 GHz nahi). Capability maximum batati hai, lekin band, width aur rates real value tay karte hain.</p></div>

<div class="scn"><h4>Staff SSID par smart meters</h4><p>Facilities ne 40 smart meters (sirf 2.4 GHz, 802.11n, WPA2-PSK) staff SSID se jode. Unhe chalu rakhne ke liye team ne 802.11b rates on aur staff SSID dono bands par chhod diya tha. Tab laptops random 2.4 GHz se pair hote aur slow chalte. Fix tha alag IoT SSID sirf 2.4 GHz par (apna VLAN), aur staff sirf 5 GHz par.</p><p><b>Seekh:</b> sab ke liye standard kam karne ki jagah radio policy aur SSIDs se device classes alag karo.</p></div>

<div class="iv"><p class="q">"Modern laptops aur purane 2.4 GHz-only sensors ke mix ko aap kaise handle karoge?"</p><p>Strong answer: radio policy se alag SSIDs aur VLANs: laptops ke liye 5 GHz (ya band steering ke saath dual band), sensors ke liye 2.4 GHz-only SSID simple PSK ya MPSK aur restricted VLAN ke saath. Jahan possible ho staff SSID ke 2.4 GHz par low rates disable karo aur 2.4 GHz ko 20 MHz par rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Clients bands, standard, streams, width, security aur roaming support advertise karte hain; sabse dheema side jeet ta hai.</li>
<li>Radio policy tay karti hai WLAN kaunse bands serve karta hai; badalne se pehle WLAN disable karo.</li>
<li>Lab 1: NK-STAFF sirf 5 GHz (VLAN 20), NK-IOT sirf 2.4 GHz (VLAN 40), PT-CAMPUS mein mapped.</li>
<li>Link budget: received power = EIRP - path loss; 3 dB power double karta hai, 10 dB das guna.</li>
<li>FSPL = 32.44 + 20 log f(MHz) + 20 log d(km).</li>
</ul></div>
`}};export{e as default};