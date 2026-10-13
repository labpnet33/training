var e={id:`big-picture`,h:{en:`Enterprise wireless at CCNP depth: the big picture`,hi:`CCNP depth par enterprise wireless: badi picture`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to do the RF maths an interviewer throws at you (dBm, EIRP, SNR), choose antennas and AP modes for a real floor, explain what Wi-Fi 6/6E and Wi-Fi 7 changed, compare the WLAN deployment models, walk an AP through every CAPWAP join state, explain Layer 2 and Layer 3 roaming with anchor and foreign controllers, describe every message of the EAPOL 4-way handshake, configure PSK, SAE, 802.1X and WebAuth WLANs, explain how location services find a device, and work the Catalyst 9800 web UI to build and troubleshoot WLANs. This covers the CCNP ENCOR 350-401 wireless objectives as published in blueprint v1.1: <b>1.2</b> (analyze WLAN design: deployment models, location services, client density), <b>3.3</b> (Layer 1 concepts, AP modes and antennas, AP discovery and join, roaming, GUI-only troubleshooting, segmentation with groups, profiles and tags) and <b>5.4</b> (wireless security: EAP, WebAuth, PSK, EAPOL 4-way handshake). Blueprint numbers change between versions, so check the current one on the Cisco site before your exam.</p>

<p><b>Prerequisites.</b> You finished the CCNA modules <i>Wireless principles and client troubleshooting</i> and <i>WLAN configuration on a wireless controller</i>. You already know the bands and the three clean 2.4 GHz channels, SSID versus BSSID, what a lightweight AP and a WLC do, that CAPWAP uses UDP 5246/5247, how option 43 points an AP to its controller, and how to build a WPA2-PSK or WPA2-Enterprise WLAN. We will refer back to those ideas and go one level deeper, not re-teach them. Wireless QoS (the Platinum, Gold, Silver and Bronze profiles) is not tested in depth by these objectives; module wl-qos (QoS, AVC and multicast) of the ccnp-wireless course covers it.</p>

<h3>An analogy: a radio station network across a city</h3>
<p>Imagine a chain of FM radio studios across a city. Each tower (an <b>AP</b>) has a transmitter with a power setting and an antenna that shapes where the sound goes. Listeners (the <b>clients</b>) tune to the loudest clear station, and when they drive across the city their car radio switches towers by itself (<b>roaming</b>). A head office (the <b>WLC</b>) decides which frequency each tower uses, how loud it should be, and who is allowed to listen to the paid channels (<b>security</b>). Some towers do not broadcast at all; they only listen for pirate stations (<b>monitor mode</b>). And by comparing how loudly three towers hear a car, the head office can tell roughly where the car is (<b>location services</b>).</p>
<p>At CCNA level you learned the names of these parts. At CCNP level you must explain the numbers and the messages: why 3 dB matters, what exactly happens in the four EAPOL frames, and what a foreign controller does with a roaming client's traffic.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Layer 1: RF maths,</text><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">antennas, channels</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 6/7 and</text><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">client capabilities</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Deployment models</text><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">and AP modes</text>
<rect x="10" y="100" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="13">AP discovery and</text><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">join state machine</text>
<rect x="220" y="100" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">L2 / L3 roaming,</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">anchor and foreign</text>
<rect x="430" y="100" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="13">PSK, SAE, EAPOL,</text><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="13">802.1X, WebAuth</text>
<rect x="120" y="190" width="190" height="50" rx="8" fill="#bae6fd"/><text x="215" y="220" text-anchor="middle" class="svg-ink" font-size="13">Location services</text>
<rect x="330" y="190" width="190" height="50" rx="8" fill="#fde68a"/><text x="425" y="212" text-anchor="middle" class="svg-ink" font-size="13">GUI troubleshooting</text><text x="425" y="230" text-anchor="middle" class="svg-ink" font-size="13">and ticket lab</text>
</svg><p class="cap">The module climbs from the radio (Layer 1) to the controller, the keys and finally troubleshooting.</p></div>

<h3>Why wireless is a big part of ENCOR</h3>
<p>In most offices today more users connect over Wi-Fi than over cable. Laptops, phones, scanners, badges and sensors all live on the WLAN. When the Wi-Fi is slow, the business says "the network is down", even if every switch is perfect. A CCNP engineer is expected to design coverage, pick security that auditors accept, keep voice calls alive while people walk, and prove with numbers where a problem is.</p>

<table class="cmp"><tr><th>Blueprint item (v1.1)</th><th>Where in this module</th></tr>
<tr><td>1.2.a Deployment models (centralised, distributed, controller-less, cloud, remote branch)</td><td>Chapter 6</td></tr>
<tr><td>1.2.b Location services in a WLAN design</td><td>Chapter 12</td></tr>
<tr><td>1.2.c Client density</td><td>Chapter 6</td></tr>
<tr><td>3.3.a RF power, RSSI, SNR, interference, noise, bands, channels, client capabilities</td><td>Chapters 2 to 5</td></tr>
<tr><td>3.3.b AP modes and antenna types</td><td>Chapters 3 and 6</td></tr>
<tr><td>3.3.c AP discovery and join, WLC selection</td><td>Chapter 7</td></tr>
<tr><td>3.3.d Layer 2 and Layer 3 roaming</td><td>Chapter 9</td></tr>
<tr><td>3.3.e Troubleshoot WLAN and client issues (GUI only)</td><td>Chapters 8 and 13</td></tr>
<tr><td>3.3.f Segmentation with groups, profiles and tags</td><td>Chapters 6 and 8</td></tr>
<tr><td>5.4 EAP, WebAuth, PSK, EAPOL 4-way handshake</td><td>Chapters 10 and 11</td></tr></table>

<h3>The lab you will build</h3>
<p>The hands-on labs use a Catalyst 9800-style controller, because AireOS is end of life. <b>WLC1</b> (management 10.10.99.10, VLAN 99) controls <b>AP1</b> and <b>AP2</b> (VLAN 10, joined by DHCP option 43). The WLAN profile <b>NK-STAFF</b> (WLAN 1, key NkStaff2024) uses the policy profile <b>PP-STAFF</b> (VLAN 20, 10.10.20.0/24), and the policy tag <b>PT-CAMPUS</b> ties them together for both APs. <b>RAD1</b> at 10.10.60.20 is the RADIUS server with users alice and bob and shared secret NkRadius1. In lab 1 you will:</p>
<ol><li>Move NK-STAFF to <b>WPA2/WPA3 transition mode</b> (PSK plus SAE), from the web UI.</li>
<li>Define RAD1, the server group and the 802.1X method list, then build <b>NK-CORP</b> (WLAN 2) as <b>WPA3-Enterprise</b> with the policy profile PP-CORP (VLAN 40), still from the web UI.</li>
<li>Log PHONE1 in as bob with 802.1X.</li>
<li>Turn AP1 into a <b>monitor-mode</b> sensor and watch LAPTOP1 <b>roam</b> to AP2 while keeping its 10.10.20.x subnet.</li></ol>
<p>Lab 2 is a ticket: an AP left in monitor mode, a RADIUS shared-secret mismatch and a policy profile in the wrong VLAN, all solved from the GUI. Chapter 8 tours the web UI first and chapter 13 walks through the ticket. Deeper topics live in the ccnp-wireless course: wl-flex (FlexConnect and branch design), wl-mobility (Roaming, mobility and anchoring), wl-secure (Advanced wireless security), wl-qos (QoS, AVC and multicast), wl-design (Wireless site survey and design), wl-diag (Wireless troubleshooting like a CCIE) and wl-auto (Wireless automation and Spaces).</p>

<div class="eg"><p><b>Worked example: the numbers you will meet.</b> An AP radio sends 17 dBm (50 mW) into a 6 dBi antenna through a cable that loses 2 dB, so its EIRP is 17 − 2 + 6 = 21 dBm. A laptop 15 m away hears it at −62 dBm over a noise floor of −92 dBm, which is an SNR of 30 dB: good enough for voice (Cisco's rule of thumb is −67 dBm and 25 dB SNR). You will be able to do this in your head by the end of chapter 3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating Wi-Fi as "just another access switch". A switch port either works or it does not. A radio link works partly: it can associate but move data at 6 Mbps, or work at the desk and fail in the meeting room. Always think in signal, noise, channel and client capability, not only in configuration.</p></div>

<div class="exam"><p><b>Exam trap.</b> The blueprint says to troubleshoot WLAN configuration and client connectivity "using GUI only". Expect questions that show a controller GUI screen (client details, WLAN security tab, AP list) and ask what is wrong. Know where things live in the web UI, and how a WLAN profile, a policy profile and a tag fit together, not just the CLI.</p></div>

<div class="scn"><h4>"The Wi-Fi is fine, the app is broken"</h4><p>A hospital's nurses complained that their voice badges dropped calls in one corridor. The server team found nothing wrong. The wireless engineer opened the controller, looked at the client details for one badge and saw RSSI −78 dBm and SNR 12 dB in that corridor, with the badge clinging to a far AP. Two APs nearby had been set to monitor mode during a security project and never returned to local mode. Putting them back in local mode raised the signal to −60 dBm and the calls stopped dropping.</p><p><b>Lesson:</b> wireless problems hide in RF numbers and AP settings. Look at the radio first.</p></div>

<div class="iv"><p class="q">"What changes between CCNA and CCNP wireless knowledge?"</p><p>A strong answer: CCNA is naming the parts and building a WLAN. CCNP is explaining the mechanics and the numbers: dBm and EIRP maths, SNR requirements per application, the CAPWAP join state machine and WLC selection order, L2 versus L3 roaming with anchor/foreign tunnels, the key hierarchy and 4-way handshake, SAE and OWE, 802.11r/k/v, location techniques and GUI-based troubleshooting. Mention a real example where you fixed coverage or roaming with numbers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR wireless covers 1.2 (WLAN design), 3.3 (RF, AP, roaming, GUI troubleshooting, tags) and 5.4 (wireless security) in blueprint v1.1.</li>
<li>CCNP depth means numbers (dBm, EIRP, SNR) and messages (CAPWAP join, EAPOL, mobility).</li>
<li>The labs run on a 9800-style controller: transition mode on NK-STAFF, WPA3-Enterprise NK-CORP with RAD1, monitor mode on AP1, an intra-controller roam and a GUI-only ticket.</li>
<li>Most Wi-Fi tickets are solved by reading RF values and AP state before touching configuration.</li>
<li>The exam tests the controller GUI, so learn the menu paths as well as the commands.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap interviewer ka diya hua RF maths (dBm, EIRP, SNR) kar paoge, real floor ke liye antennas aur AP modes chun paoge, samjha paoge ki Wi-Fi 6/6E aur Wi-Fi 7 ne kya badla, WLAN deployment models compare kar paoge, AP ko har CAPWAP join state se guzaar paoge, anchor aur foreign controllers ke saath Layer 2 aur Layer 3 roaming samjha paoge, EAPOL 4-way handshake ka har message bata paoge, PSK, SAE, 802.1X aur WebAuth WLANs configure kar paoge, samjha paoge ki location services device ko kaise dhoondhti hain, aur Catalyst 9800 web UI se WLANs banana aur troubleshoot karna seekhoge. Yeh CCNP ENCOR 350-401 ke wireless objectives cover karta hai, blueprint v1.1 ke hisaab se: <b>1.2</b> (WLAN design: deployment models, location services, client density), <b>3.3</b> (Layer 1 concepts, AP modes aur antennas, AP discovery aur join, roaming, sirf-GUI troubleshooting, groups, profiles aur tags se segmentation) aur <b>5.4</b> (wireless security: EAP, WebAuth, PSK, EAPOL 4-way handshake). Blueprint ke numbers versions ke saath badalte hain, isliye exam se pehle Cisco site par current version dekh lo.</p>

<p><b>Prerequisites.</b> Aapne CCNA ke modules <i>Wireless principles and client troubleshooting</i> aur <i>WLAN configuration on a wireless controller</i> khatam kar liye hain. Aapko pehle se pata hai bands aur 2.4 GHz ke teen clean channels, SSID vs BSSID, lightweight AP aur WLC kya karte hain, CAPWAP UDP 5246/5247 use karta hai, option 43 AP ko controller tak kaise pahunchata hai, aur WPA2-PSK ya WPA2-Enterprise WLAN kaise banate hain. Hum un ideas ko refer karenge aur ek level gehra jaayenge, dobara nahi padhayenge. Wireless QoS (Platinum, Gold, Silver, Bronze profiles) in objectives mein gehrai se test nahi hota; ccnp-wireless course ka module wl-qos (QoS, AVC and multicast) use cover karta hai.</p>

<h3>Ek analogy: shehar bhar mein radio stations ka network</h3>
<p>Socho ek shehar mein FM radio studios ki chain hai. Har tower (ek <b>AP</b>) ke paas power setting wala transmitter aur ek antenna hai jo tay karta hai awaaz kidhar jaayegi. Sunne wale (<b>clients</b>) sabse tez aur saaf station par tune karte hain, aur jab woh shehar mein gaadi chalate hain to car radio khud tower badal leta hai (<b>roaming</b>). Ek head office (<b>WLC</b>) tay karta hai kaunsa tower kaunsi frequency use kare, kitna tez bole, aur paid channels kaun sun sakta hai (<b>security</b>). Kuch towers broadcast karte hi nahi; woh sirf pirate stations sunte hain (<b>monitor mode</b>). Aur teen towers ek car ko kitna tez sunte hain, yeh compare karke head office andaaza laga leta hai ki car kahan hai (<b>location services</b>).</p>
<p>CCNA level par aapne in parts ke naam seekhe. CCNP level par aapko numbers aur messages samjhane hain: 3 dB kyun matter karta hai, chaar EAPOL frames mein exactly kya hota hai, aur foreign controller roaming client ke traffic ke saath kya karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module ka map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Layer 1: RF maths,</text><text x="110" y="50" text-anchor="middle" class="svg-ink" font-size="13">antennas, channels</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Wi-Fi 6/7 aur</text><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">client capabilities</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Deployment models</text><text x="530" y="50" text-anchor="middle" class="svg-ink" font-size="13">aur AP modes</text>
<rect x="10" y="100" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="13">AP discovery aur</text><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">join state machine</text>
<rect x="220" y="100" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">L2 / L3 roaming,</text><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">anchor aur foreign</text>
<rect x="430" y="100" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="13">PSK, SAE, EAPOL,</text><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="13">802.1X, WebAuth</text>
<rect x="120" y="190" width="190" height="50" rx="8" fill="#bae6fd"/><text x="215" y="220" text-anchor="middle" class="svg-ink" font-size="13">Location services</text>
<rect x="330" y="190" width="190" height="50" rx="8" fill="#fde68a"/><text x="425" y="212" text-anchor="middle" class="svg-ink" font-size="13">GUI troubleshooting</text><text x="425" y="230" text-anchor="middle" class="svg-ink" font-size="13">aur ticket lab</text>
</svg><p class="cap">Module radio (Layer 1) se controller, keys aur aakhir mein troubleshooting tak chadhta hai.</p></div>

<h3>ENCOR mein wireless itna bada hissa kyun hai</h3>
<p>Aaj zyada tar offices mein cable se zyada users Wi-Fi par connect hote hain. Laptops, phones, scanners, badges aur sensors sab WLAN par rehte hain. Jab Wi-Fi slow hota hai, business kehta hai "network down hai", chahe har switch perfect ho. CCNP engineer se umeed hoti hai ki woh coverage design kare, aisi security chune jo auditors maanein, chalte hue logon ki voice calls zinda rakhe, aur numbers se saabit kare ki problem kahan hai.</p>

<table class="cmp"><tr><th>Blueprint item (v1.1)</th><th>Is module mein kahan</th></tr>
<tr><td>1.2.a Deployment models (centralised, distributed, controller-less, cloud, remote branch)</td><td>Chapter 6</td></tr>
<tr><td>1.2.b WLAN design mein location services</td><td>Chapter 12</td></tr>
<tr><td>1.2.c Client density</td><td>Chapter 6</td></tr>
<tr><td>3.3.a RF power, RSSI, SNR, interference, noise, bands, channels, client capabilities</td><td>Chapters 2 se 5</td></tr>
<tr><td>3.3.b AP modes aur antenna types</td><td>Chapters 3 aur 6</td></tr>
<tr><td>3.3.c AP discovery aur join, WLC selection</td><td>Chapter 7</td></tr>
<tr><td>3.3.d Layer 2 aur Layer 3 roaming</td><td>Chapter 9</td></tr>
<tr><td>3.3.e WLAN aur client issues troubleshoot karna (sirf GUI)</td><td>Chapters 8 aur 13</td></tr>
<tr><td>3.3.f Groups, profiles aur tags se segmentation</td><td>Chapters 6 aur 8</td></tr>
<tr><td>5.4 EAP, WebAuth, PSK, EAPOL 4-way handshake</td><td>Chapters 10 aur 11</td></tr></table>

<h3>Jo lab aap banaoge</h3>
<p>Hands-on labs Catalyst 9800-style controller par chalti hain, kyunki AireOS end of life hai. <b>WLC1</b> (management 10.10.99.10, VLAN 99) <b>AP1</b> aur <b>AP2</b> ko control karta hai (VLAN 10, DHCP option 43 se joined). WLAN profile <b>NK-STAFF</b> (WLAN 1, key NkStaff2024) policy profile <b>PP-STAFF</b> (VLAN 20, 10.10.20.0/24) use karta hai, aur policy tag <b>PT-CAMPUS</b> dono APs ke liye unhe jodta hai. <b>RAD1</b> 10.10.60.20 par RADIUS server hai, users alice aur bob aur shared secret NkRadius1 ke saath. Lab 1 mein aap:</p>
<ol><li>NK-STAFF ko web UI se <b>WPA2/WPA3 transition mode</b> (PSK plus SAE) mein le jaoge.</li>
<li>RAD1, server group aur 802.1X method list define karoge, phir policy profile PP-CORP (VLAN 40) ke saath <b>NK-CORP</b> (WLAN 2) ko <b>WPA3-Enterprise</b> banaoge, yeh bhi web UI se.</li>
<li>PHONE1 ko 802.1X se bob ban kar login karaoge.</li>
<li>AP1 ko <b>monitor-mode</b> sensor banaoge aur dekhoge ki LAPTOP1 apna 10.10.20.x subnet rakhte hue AP2 par <b>roam</b> karta hai.</li></ol>
<p>Lab 2 ek ticket hai: ek AP monitor mode mein chhoota hua, RADIUS shared-secret mismatch aur galat VLAN wala policy profile, sab GUI se solve hota hai. Chapter 8 pehle web UI ka tour karata hai aur chapter 13 ticket ko step by step chalata hai. Gehre topics ccnp-wireless course mein hain: wl-flex (FlexConnect and branch design), wl-mobility (Roaming, mobility and anchoring), wl-secure (Advanced wireless security), wl-qos (QoS, AVC and multicast), wl-design (Wireless site survey and design), wl-diag (Wireless troubleshooting like a CCIE) aur wl-auto (Wireless automation and Spaces).</p>

<div class="eg"><p><b>Worked example: numbers jo aapko milenge.</b> Ek AP radio 17 dBm (50 mW) ek cable se bhejta hai jo 2 dB kho deti hai, aur 6 dBi antenna mein jaata hai, to uska EIRP 17 − 2 + 6 = 21 dBm hai. 15 m door ek laptop use −62 dBm par sunta hai, noise floor −92 dBm hai, yaani SNR 30 dB: voice ke liye kaafi (Cisco ka rule of thumb −67 dBm aur 25 dB SNR hai). Chapter 3 ke end tak aap yeh dimaag mein kar loge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Wi-Fi ko "bas ek aur access switch" samajhna. Switch port ya to chalta hai ya nahi. Radio link aadha-adhoora chalta hai: associate ho jaata hai par 6 Mbps par data le jaata hai, ya desk par chalta hai aur meeting room mein fail hota hai. Hamesha signal, noise, channel aur client capability mein socho, sirf configuration mein nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Blueprint kehta hai WLAN configuration aur client connectivity "using GUI only" troubleshoot karo. Aise questions expect karo jo controller GUI screen (client details, WLAN security tab, AP list) dikhakar poochein ki kya galat hai. Web UI mein cheezein kahan hain, aur WLAN profile, policy profile aur tag kaise jude hain, yeh jaano, sirf CLI nahi.</p></div>

<div class="scn"><h4>"Wi-Fi theek hai, app kharab hai"</h4><p>Ek hospital ki nurses ne shikayat ki ki ek corridor mein unke voice badges calls drop karte hain. Server team ko kuch galat nahi mila. Wireless engineer ne controller khola, ek badge ki client details dekhi aur us corridor mein RSSI −78 dBm aur SNR 12 dB dekha, badge ek door wale AP se chipka hua tha. Paas ke do APs ek security project ke dauraan monitor mode mein daale gaye the aur kabhi local mode mein wapas nahi aaye. Unhe local mode mein wapas daalne se signal −60 dBm ho gaya aur calls drop hona band ho gaya.</p><p><b>Lesson:</b> wireless problems RF numbers aur AP settings mein chhupti hain. Pehle radio dekho.</p></div>

<div class="iv"><p class="q">"CCNA aur CCNP wireless knowledge mein kya badalta hai?"</p><p>Strong answer: CCNA mein parts ke naam aur WLAN banana hai. CCNP mein mechanics aur numbers samjhane hain: dBm aur EIRP maths, har application ki SNR requirement, CAPWAP join state machine aur WLC selection order, anchor/foreign tunnels ke saath L2 vs L3 roaming, key hierarchy aur 4-way handshake, SAE aur OWE, 802.11r/k/v, location techniques aur GUI-based troubleshooting. Ek real example batao jahan aapne numbers se coverage ya roaming theek ki.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR wireless blueprint v1.1 ke 1.2 (WLAN design), 3.3 (RF, AP, roaming, GUI troubleshooting, tags) aur 5.4 (wireless security) cover karta hai.</li>
<li>CCNP depth ka matlab hai numbers (dBm, EIRP, SNR) aur messages (CAPWAP join, EAPOL, mobility).</li>
<li>Labs 9800-style controller par chalti hain: NK-STAFF par transition mode, RAD1 ke saath WPA3-Enterprise NK-CORP, AP1 par monitor mode, ek intra-controller roam aur ek sirf-GUI ticket.</li>
<li>Zyada tar Wi-Fi tickets configuration chhoone se pehle RF values aur AP state padhkar solve hote hain.</li>
<li>Exam controller GUI test karta hai, isliye commands ke saath menu paths bhi seekho.</li>
</ul></div>
`}};export{e as default};