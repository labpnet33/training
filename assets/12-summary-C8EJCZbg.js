var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a walkie-talkie picture: one shared channel, one talker at a time, voices that fade with distance and walls. Everything since then has been that picture made precise: dBm to measure the voice, SNR to compare it with the noise, channels to give groups their own frequency, standards to talk faster, and a join process with security to decide who may talk at all. Use this chapter as your revision sheet before the exam and before an interview.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain frequency, wavelength and amplitude, and calculate λ = c / f for 2.4, 5 and 6 GHz.</li>
<li>Convert between mW and dBm with the 3 dB and 10 dB rules, and calculate EIRP and SNR.</li>
<li>Describe absorption, reflection, refraction, scattering and diffraction with an example of each.</li>
<li>Match each 802.11 standard to its Wi-Fi name, band and maximum rate.</li>
<li>Explain why 2.4 GHz has only three non-overlapping channels and name them; list 5 GHz sub-bands and explain DFS; describe 6 GHz and channel bonding trade-offs.</li>
<li>Define SSID, BSSID, BSS, ESS, IBSS and describe how a client roams.</li>
<li>Compare autonomous, split-MAC and cloud architectures, and choose the right AP mode and switch port type.</li>
<li>List the 802.11 frame types and the join sequence from probe to DHCP.</li>
<li>Compare WEP, WPA, WPA2 and WPA3, PSK and 802.1X, and name the three 802.1X roles.</li>
<li>Plan channels and power for a floor, and troubleshoot a client that cannot join, step by step.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Channels per band">
<text x="10" y="40" class="svg-ink" font-size="13">2.4 GHz</text><rect x="90" y="26" width="24" height="20" fill="#bae6fd"/><text x="124" y="41" class="svg-muted" font-size="12">3 non-overlapping (1, 6, 11)</text>
<text x="10" y="85" class="svg-ink" font-size="13">5 GHz</text><rect x="90" y="71" width="200" height="20" fill="#bbf7d0"/><text x="300" y="86" class="svg-muted" font-size="12">about 25 x 20 MHz (country dependent)</text>
<text x="10" y="130" class="svg-ink" font-size="13">6 GHz</text><rect x="90" y="116" width="472" height="20" fill="#ddd6fe"/><text x="100" y="131" class="svg-ink" font-size="12">up to 59 x 20 MHz, Wi-Fi 6E/7 only</text>
<text x="320" y="162" text-anchor="middle" class="svg-accent" font-size="12">more clean channels = more capacity</text>
</svg><p class="cap">The one picture to remember: capacity grows with the number of non-overlapping channels.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm / dB / dBi</dt><dd>Absolute power versus 1 mW / relative gain or loss / antenna gain versus isotropic.</dd>
<dt>RSSI, noise floor, SNR</dt><dd>Received signal in dBm; background RF energy; the difference between them in dB.</dd>
<dt>EIRP</dt><dd>Transmit power − cable loss + antenna gain.</dd>
<dt>CSMA/CA</dt><dd>Listen before talking, random back-off, ACK for every unicast frame.</dd>
<dt>CCI / ACI</dt><dd>Same-channel contention / overlapping-channel corruption (worse).</dd>
<dt>DFS</dt><dd>Radar detection on some 5 GHz channels; the AP must vacate on radar.</dd>
<dt>SSID / BSSID</dt><dd>Network name / AP radio MAC for one SSID.</dd>
<dt>BSS / ESS / IBSS</dt><dd>One AP and clients / many BSSs with one SSID over a DS / ad hoc without an AP.</dd>
<dt>CAPWAP</dt><dd>AP-to-WLC tunnels: UDP 5246 control, UDP 5247 data.</dd>
<dt>FlexConnect</dt><dd>AP mode with local switching and WAN survivability for branches.</dd>
<dt>SAE, PMF, OWE</dt><dd>WPA3 handshake, protected management frames, encrypted open networks.</dd>
<dt>RRM (DCA, TPC)</dt><dd>Automatic channel and power management on the controller.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Duplex and access</td><td>802.11 is half duplex, CSMA/CA</td></tr>
<tr><td>dB rules</td><td>+3 dB ×2, −3 dB ÷2, +10 dB ×10; 20 dBm = 100 mW, 0 dBm = 1 mW</td></tr>
<tr><td>Wavelength</td><td>2.4 GHz ≈ 12.5 cm, 5 GHz ≈ 6 cm; higher frequency, more loss through walls</td></tr>
<tr><td>Standards</td><td>b/g 2.4; a 5; n = Wi-Fi 4 (both); ac = Wi-Fi 5 (5 only); ax = Wi-Fi 6/6E; be = Wi-Fi 7</td></tr>
<tr><td>2.4 GHz channels</td><td>1, 6, 11; centre = 2407 + 5 × ch (ch 11 = 2462 MHz)</td></tr>
<tr><td>5 GHz</td><td>All 20 MHz channels non-overlapping; U-NII-2 needs DFS</td></tr>
<tr><td>Roaming</td><td>The client decides; about 15 to 20 % cell overlap; same VLAN keeps the IP</td></tr>
<tr><td>AP modes</td><td>Local default; FlexConnect for branches; monitor/sniffer serve no clients</td></tr>
<tr><td>Join order</td><td>Probe, open auth, association, 802.1X/PSK, 4-way handshake, DHCP</td></tr>
<tr><td>Security</td><td>WPA2 = AES-CCMP; WPA3 = SAE + mandatory PMF; 802.1X: supplicant, authenticator, auth server</td></tr></table>

<h3>Command cheat-sheet (lab controller and client)</h3>
<pre class="code"><span class="c">! RF and channels</span>
show advanced 802.11b channel          <span class="c">! 2.4 GHz plan and interference</span>
show advanced 802.11a channel          <span class="c">! 5 GHz plan</span>
show ap config 802.11b AP3             <span class="c">! channel, frequency, power level</span>
config 802.11b channel ap AP1 1
config 802.11a channel ap AP2 40
config 802.11b txPower ap AP2 3        <span class="c">! level 1 = highest, each level about -3 dB</span>
config ap mode monitor AP3
<span class="c">! WLANs and clients</span>
show ap summary
show wlan summary
show wlan 1
show interface summary
show client summary
show client detail 52:54:00:aa:00:01
show msglog
config wlan enable 1
config wlan interface 1 staff
<span class="c">! client side</span>
wifi scan
wifi status
wifi connect NK-STAFF psk NkStaff2024</pre>

<div class="eg"><p><b>Worked example: one-minute exam drill.</b> An AP at 23 dBm: 20 dBm = 100 mW, +3 dB = <b>200 mW</b>. A client at −68 dBm over a −93 dBm noise floor: SNR = <b>25 dB</b>, good for voice. Channel 6 centre: 2407 + 30 = <b>2437 MHz</b>. Three APs with two SSIDs on two radios: <b>12 BSSIDs</b>. A client with a 169.254 address: <b>DHCP / VLAN problem</b>, not RF.</p></div>

<p><b>What comes next:</b> module ccna-wlan builds on these principles: AP discovery and join, WLC interfaces and ports, creating WLANs in the GUI, WPA2 and WPA3 security with PSK and RADIUS, QoS profiles and advanced settings.</p>

<div class="warn"><p><b>Common mistake in revision.</b> Memorising the standards table but not the reasons. Exams and interviewers ask "why": why 1, 6, 11; why 5 GHz has less range; why more power can make things worse; why a wrong PSK fails at the 4-way handshake. If you can explain the reasons, the facts follow.</p></div>

<div class="exam"><p><b>Final exam traps.</b> CSMA/CA not CD; BSSID is a MAC; 802.11ac is 5 GHz only; ACI is worse than CCI; the AP/WLC is the 802.1X authenticator; open system authentication is not the security check; local mode is the default and serves clients.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A fresher interviewing for a NOC role was asked to "draw how a phone connects to office Wi-Fi and where it could fail". He drew the phone, AP, switch, WLC and DHCP server, wrote the join steps along the arrows (probe, authentication, association, 4-way handshake, DHCP), and next to each wrote one failure and one command to check it. The panel moved him straight to the final round.</p><p><b>Lesson:</b> the join process is the backbone of both wireless theory and troubleshooting; practise drawing it.</p></div>

<div class="iv"><p class="q">"In two minutes, tell me what you know about wireless networking."</p><p>Strong answer: Wi-Fi is a shared, half-duplex medium using CSMA/CA. Signal is measured in dBm and quality by SNR. 2.4 GHz has three non-overlapping channels, 5 GHz many more, 6 GHz is clean spectrum for Wi-Fi 6E and 7. Standards evolved from 802.11b to Wi-Fi 7 by adding OFDM, MIMO, wider channels, denser QAM and OFDMA. Clients discover SSIDs, associate to a BSSID, authenticate with PSK/SAE or 802.1X, and roam by their own decision. Enterprises use WLCs with lightweight APs over CAPWAP. Close with how you troubleshoot: follow the join.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF: frequency, wavelength, dBm, SNR and the 3/10 dB rules explain every signal question.</li>
<li>Channels: 1/6/11 on 2.4 GHz, every 20 MHz channel on 5 GHz, clean 6 GHz for 6E/7; bonding trades channels for speed.</li>
<li>Service sets, AP modes and frames describe who talks to whom and how.</li>
<li>WPA2/WPA3 with PSK/SAE or 802.1X protect the air.</li>
<li>Plan with surveys and honeycomb reuse; troubleshoot by following the join.</li>
</ul></div>
`,hi:`
<p>Aapne walkie-talkie picture se shuru kiya tha: ek shared channel, ek time par ek bolne wala, awaazein jo doori aur deewaron se feeki padti hain. Tab se sab kuch usi picture ko precise banana tha: awaaz naapne ke liye dBm, use noise se compare karne ke liye SNR, groups ko apni frequency dene ke liye channels, tez baat karne ke liye standards, aur yeh tay karne ke liye security wala join process ki bol kaun sakta hai. Is chapter ko exam aur interview se pehle apni revision sheet ki tarah use karo.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Frequency, wavelength aur amplitude samjhao, aur 2.4, 5 aur 6 GHz ke liye λ = c / f nikalo.</li>
<li>3 dB aur 10 dB rules se mW aur dBm ke beech convert karo, aur EIRP aur SNR nikalo.</li>
<li>Absorption, reflection, refraction, scattering aur diffraction ko har ek ke example ke saath samjhao.</li>
<li>Har 802.11 standard ko uske Wi-Fi naam, band aur maximum rate se match karo.</li>
<li>Samjhao ki 2.4 GHz mein sirf teen non-overlapping channels kyun hain aur unke naam lo; 5 GHz sub-bands list karo aur DFS samjhao; 6 GHz aur channel bonding ke trade-offs batao.</li>
<li>SSID, BSSID, BSS, ESS, IBSS define karo aur batao client kaise roam karta hai.</li>
<li>Autonomous, split-MAC aur cloud architectures compare karo, aur sahi AP mode aur switch port type chuno.</li>
<li>802.11 frame types aur probe se DHCP tak join sequence list karo.</li>
<li>WEP, WPA, WPA2 aur WPA3, PSK aur 802.1X compare karo, aur 802.1X ke teen roles ka naam lo.</li>
<li>Ek floor ke liye channels aur power plan karo, aur join na kar paane wale client ko step by step troubleshoot karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Har band mein channels">
<text x="10" y="40" class="svg-ink" font-size="13">2.4 GHz</text><rect x="90" y="26" width="24" height="20" fill="#bae6fd"/><text x="124" y="41" class="svg-muted" font-size="12">3 non-overlapping (1, 6, 11)</text>
<text x="10" y="85" class="svg-ink" font-size="13">5 GHz</text><rect x="90" y="71" width="200" height="20" fill="#bbf7d0"/><text x="300" y="86" class="svg-muted" font-size="12">lagbhag 25 x 20 MHz (desh par depend)</text>
<text x="10" y="130" class="svg-ink" font-size="13">6 GHz</text><rect x="90" y="116" width="472" height="20" fill="#ddd6fe"/><text x="100" y="131" class="svg-ink" font-size="12">59 x 20 MHz tak, sirf Wi-Fi 6E/7</text>
<text x="320" y="162" text-anchor="middle" class="svg-accent" font-size="12">zyada clean channels = zyada capacity</text>
</svg><p class="cap">Yaad rakhne wali ek picture: capacity non-overlapping channels ki sankhya ke saath badhti hai.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm / dB / dBi</dt><dd>1 mW ke against absolute power / relative gain ya loss / isotropic ke against antenna gain.</dd>
<dt>RSSI, noise floor, SNR</dt><dd>dBm mein received signal; background RF energy; dono ka fark dB mein.</dd>
<dt>EIRP</dt><dd>Transmit power − cable loss + antenna gain.</dd>
<dt>CSMA/CA</dt><dd>Bolne se pehle suno, random back-off, har unicast frame ka ACK.</dd>
<dt>CCI / ACI</dt><dd>Same-channel contention / overlapping-channel corruption (zyada bura).</dd>
<dt>DFS</dt><dd>Kuch 5 GHz channels par radar detection; radar milne par AP ko channel chhodna padta hai.</dd>
<dt>SSID / BSSID</dt><dd>Network naam / ek SSID ke liye AP radio MAC.</dd>
<dt>BSS / ESS / IBSS</dt><dd>Ek AP aur clients / DS par ek SSID wale kai BSS / bina AP ke ad hoc.</dd>
<dt>CAPWAP</dt><dd>AP-to-WLC tunnels: UDP 5246 control, UDP 5247 data.</dd>
<dt>FlexConnect</dt><dd>Branches ke liye local switching aur WAN survivability wala AP mode.</dd>
<dt>SAE, PMF, OWE</dt><dd>WPA3 handshake, protected management frames, encrypted open networks.</dd>
<dt>RRM (DCA, TPC)</dt><dd>Controller par automatic channel aur power management.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Duplex aur access</td><td>802.11 half duplex hai, CSMA/CA</td></tr>
<tr><td>dB rules</td><td>+3 dB ×2, −3 dB ÷2, +10 dB ×10; 20 dBm = 100 mW, 0 dBm = 1 mW</td></tr>
<tr><td>Wavelength</td><td>2.4 GHz ≈ 12.5 cm, 5 GHz ≈ 6 cm; zyada frequency, deewaron se zyada loss</td></tr>
<tr><td>Standards</td><td>b/g 2.4; a 5; n = Wi-Fi 4 (dono); ac = Wi-Fi 5 (sirf 5); ax = Wi-Fi 6/6E; be = Wi-Fi 7</td></tr>
<tr><td>2.4 GHz channels</td><td>1, 6, 11; centre = 2407 + 5 × ch (ch 11 = 2462 MHz)</td></tr>
<tr><td>5 GHz</td><td>Saare 20 MHz channels non-overlapping; U-NII-2 ko DFS chahiye</td></tr>
<tr><td>Roaming</td><td>Client tay karta hai; lagbhag 15 se 20 % cell overlap; same VLAN IP rakhta hai</td></tr>
<tr><td>AP modes</td><td>Local default; branches ke liye FlexConnect; monitor/sniffer clients serve nahi karte</td></tr>
<tr><td>Join order</td><td>Probe, open auth, association, 802.1X/PSK, 4-way handshake, DHCP</td></tr>
<tr><td>Security</td><td>WPA2 = AES-CCMP; WPA3 = SAE + mandatory PMF; 802.1X: supplicant, authenticator, auth server</td></tr></table>

<h3>Command cheat-sheet (lab controller aur client)</h3>
<pre class="code"><span class="c">! RF aur channels</span>
show advanced 802.11b channel          <span class="c">! 2.4 GHz plan aur interference</span>
show advanced 802.11a channel          <span class="c">! 5 GHz plan</span>
show ap config 802.11b AP3             <span class="c">! channel, frequency, power level</span>
config 802.11b channel ap AP1 1
config 802.11a channel ap AP2 40
config 802.11b txPower ap AP2 3        <span class="c">! level 1 = sabse zyada, har level lagbhag -3 dB</span>
config ap mode monitor AP3
<span class="c">! WLANs aur clients</span>
show ap summary
show wlan summary
show wlan 1
show interface summary
show client summary
show client detail 52:54:00:aa:00:01
show msglog
config wlan enable 1
config wlan interface 1 staff
<span class="c">! client side</span>
wifi scan
wifi status
wifi connect NK-STAFF psk NkStaff2024</pre>

<div class="eg"><p><b>Worked example: ek minute ki exam drill.</b> 23 dBm par ek AP: 20 dBm = 100 mW, +3 dB = <b>200 mW</b>. −93 dBm noise floor par −68 dBm wala client: SNR = <b>25 dB</b>, voice ke liye achha. Channel 6 centre: 2407 + 30 = <b>2437 MHz</b>. Do radios par do SSIDs wale teen APs: <b>12 BSSIDs</b>. 169.254 address wala client: <b>DHCP / VLAN problem</b>, RF nahi.</p></div>

<p><b>Aage kya aata hai:</b> module ccna-wlan in principles par banta hai: AP discovery aur join, WLC interfaces aur ports, GUI mein WLANs banana, PSK aur RADIUS ke saath WPA2 aur WPA3 security, QoS profiles aur advanced settings.</p>

<div class="warn"><p><b>Revision ki common galti.</b> Standards table ratna par wajah nahi samajhna. Exams aur interviewers "kyun" poochte hain: 1, 6, 11 kyun; 5 GHz ki range kam kyun; zyada power cheezein kharab kyun kar sakti hai; galat PSK 4-way handshake par kyun fail hota hai. Agar aap wajah samjha sakte ho, to facts apne aap aate hain.</p></div>

<div class="exam"><p><b>Final exam traps.</b> CSMA/CA, CD nahi; BSSID ek MAC hai; 802.11ac sirf 5 GHz hai; ACI CCI se bura hai; AP/WLC 802.1X authenticator hai; open system authentication security check nahi hai; local mode default hai aur clients serve karta hai.</p></div>

<div class="scn"><h4>Interview ka whiteboard</h4><p>NOC role ke interview mein ek fresher se kaha gaya "draw karo ki phone office Wi-Fi se kaise connect hota hai aur kahan fail ho sakta hai". Usne phone, AP, switch, WLC aur DHCP server banaye, arrows ke saath join steps likhe (probe, authentication, association, 4-way handshake, DHCP), aur har ek ke paas ek failure aur use check karne ki ek command likhi. Panel ne use seedha final round mein bhej diya.</p><p><b>Seekh:</b> join process wireless theory aur troubleshooting dono ki reedh ki haddi hai; ise draw karne ki practice karo.</p></div>

<div class="iv"><p class="q">"Do minute mein batao aap wireless networking ke baare mein kya jaante ho."</p><p>Strong answer: Wi-Fi ek shared, half-duplex medium hai jo CSMA/CA use karta hai. Signal dBm mein aur quality SNR se naapi jaati hai. 2.4 GHz mein teen non-overlapping channels hain, 5 GHz mein kahin zyada, 6 GHz Wi-Fi 6E aur 7 ke liye clean spectrum hai. Standards 802.11b se Wi-Fi 7 tak OFDM, MIMO, chaude channels, ghani QAM aur OFDMA jod kar bade. Clients SSIDs discover karte hain, ek BSSID se associate hote hain, PSK/SAE ya 802.1X se authenticate hote hain, aur apne faisle se roam karte hain. Enterprises CAPWAP par lightweight APs ke saath WLCs use karte hain. Aakhir mein batao aap kaise troubleshoot karte ho: join ko follow karke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF: frequency, wavelength, dBm, SNR aur 3/10 dB rules har signal sawaal samjhate hain.</li>
<li>Channels: 2.4 GHz par 1/6/11, 5 GHz par har 20 MHz channel, 6E/7 ke liye clean 6 GHz; bonding channels ke badle speed deta hai.</li>
<li>Service sets, AP modes aur frames batate hain kaun kisse aur kaise baat karta hai.</li>
<li>PSK/SAE ya 802.1X ke saath WPA2/WPA3 hawa ko protect karte hain.</li>
<li>Surveys aur honeycomb reuse se plan karo; join follow karke troubleshoot karo.</li>
</ul></div>
`}};export{e as default};