var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with "Wi-Fi is radio in a shared room" and now you can read a link line, plan a channel width, explain Wi-Fi 6 and 7, decode frames and fix a slow client. This chapter collects everything you should be able to do, the terms you must know, the most tested facts and the command cheat-sheet. These are the skills practised for wireless fundamentals at CCNA and ENCOR level and for foundations before the professional wireless topics; always check the current official blueprint for your exam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">PHY ideas</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">bands, QAM, MCS, widths</text>
<rect x="165" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="235" y="45" text-anchor="middle" class="svg-ink" font-size="12">Generations</text><text x="235" y="63" text-anchor="middle" class="svg-muted" font-size="11">b/g/a/n/ac/ax/be</text>
<rect x="320" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="12">MAC ideas</text><text x="390" y="63" text-anchor="middle" class="svg-muted" font-size="11">frames, join, EDCA</text>
<rect x="475" y="20" width="150" height="60" rx="8" fill="#fde68a"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="12">Controller skills</text><text x="550" y="63" text-anchor="middle" class="svg-muted" font-size="11">radio policy, RF profile</text>
<rect x="10" y="100" width="615" height="50" rx="8" fill="#e2e8f0"/><text x="318" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence loop: client, band, width, rates, signal, channel</text>
</svg><p class="cap">The module in one picture: PHY and MAC knowledge feeds controller settings, and the evidence loop checks the result.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Name the generation, band and Wi-Fi Alliance name for 802.11a, b, g, n, ac, ax and be, and say what each added.</li>
<li>Explain why 2.4 GHz gives range and 5 and 6 GHz give capacity, and say which channels do not overlap (1, 6, 11).</li>
<li>Compute a data rate from subcarriers, bits per symbol, coding rate and streams, and read an MCS line in <code>wifi link</code>.</li>
<li>Choose 20, 40 or 80 MHz for a design and explain the trade-off (speed, noise, number of cells).</li>
<li>Describe OFDMA, MU-MIMO, BSS colouring, TWT and MLO in one sentence each, and say they are concept only in the simulator.</li>
<li>Explain 6 GHz: PSC, LPI, VLP, AFC, mandatory WPA3 and PMF, and how clients discover 6 GHz APs.</li>
<li>List the three frame types with examples and the order scan, authentication, association, handshake, DHCP.</li>
<li>Explain EDCA access categories, mandatory versus supported rates, and why disabling the 802.11b rates removes protection.</li>
<li>Configure radio policy, an RF profile (width, rates) and an RF tag, and verify with <code>show ap dot11 5ghz summary</code> and <code>wifi link</code>.</li>
<li>Run the five-question slow-client method and fix two-fault tickets.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BSS / BSSID / ESS</dt><dd>One AP radio and its clients; its MAC; a set of BSSs sharing an SSID.</dd>
<dt>RSSI / SNR</dt><dd>Signal strength in dBm; signal minus noise in dB.</dd>
<dt>QAM / MCS</dt><dd>Modulation type; index of modulation plus coding rate.</dd>
<dt>OFDMA / RU</dt><dd>Multi-user OFDM; a slice of the channel given to one client.</dd>
<dt>BSS colour</dt><dd>6-bit tag in the HE header that enables spatial reuse.</dd>
<dt>TWT</dt><dd>Target Wake Time, scheduled wake-ups for battery and contention.</dd>
<dt>MLO / MLD</dt><dd>Multi-Link Operation of Wi-Fi 7; a device using several links.</dd>
<dt>PSC / RNR</dt><dd>Preferred Scanning Channel in 6 GHz; Reduced Neighbor Report listing APs on other bands.</dd>
<dt>LPI / VLP / SP / AFC</dt><dd>6 GHz power classes and the frequency coordination service for standard power.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection that protects radar in 5 GHz.</dd>
<dt>EDCA / WMM</dt><dd>Four-priority channel access; Wi-Fi Alliance certification name.</dd>
<dt>Mandatory rate</dt><dd>Rate every associating client must support; the lowest sets beacon rate and cell edge.</dd>
<dt>PMF (802.11w)</dt><dd>Protected management frames; mandatory in WPA3.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Non-overlapping 2.4 GHz channels</td><td>1, 6, 11 (20 MHz)</td></tr>
<tr><td>Standards by band</td><td>a 5; b, g 2.4; n both; ac 5 only; ax 2.4, 5, 6; be 2.4, 5, 6</td></tr>
<tr><td>Bits per symbol</td><td>64-QAM 6, 256-QAM 8, 1024-QAM 10, 4096-QAM 12</td></tr>
<tr><td>Wi-Fi 6 symbol time</td><td>12.8 microseconds plus 0.8, 1.6 or 3.2 guard</td></tr>
<tr><td>Wi-Fi 6 streams</td><td>MU-MIMO up and down, up to 8 users; Wi-Fi 5 wave 2 downlink only</td></tr>
<tr><td>Wi-Fi 7 extras</td><td>320 MHz, 4096-QAM, MLO, multi-RU, preamble puncturing</td></tr>
<tr><td>DFS channels</td><td>52 to 144</td></tr>
<tr><td>PSC channels</td><td>5, 21, 37, ... every fourth 20 MHz channel in 6 GHz</td></tr>
<tr><td>6 GHz security</td><td>WPA3 or OWE with PMF; no WPA2-PSK, open, WEP, TKIP</td></tr>
<tr><td>Beacon interval</td><td>102.4 ms (100 TU)</td></tr>
<tr><td>Join order</td><td>Probe, authentication, association, handshake, DHCP</td></tr>
<tr><td>Codes</td><td>Status 17 AP full; status 18 rates; reason 15 4-way timeout; reason 23 802.1X failed</td></tr>
<tr><td>dB rules</td><td>+3 dB = x2, +10 dB = x10, doubling distance = 6 dB</td></tr></table>

<h3>Command cheat-sheet (simulator)</h3>
<pre class="code"><span class="c">! radio policy (disable the WLAN first)</span>
wlan NK-STAFF
 shutdown
 no radio policy dot11 24ghz
 no shutdown
<span class="c">! RF profile, rates and tag</span>
ap dot11 5ghz rf-profile STD-5
 channel chan-width 40
 rate RATE_6M disable
 no shutdown
wireless tag rf RF-STD
 5ghz-rf-policy STD-5
ap name AP1 rf-tag RF-STD</pre>
<pre class="out">show wlan name NK-STAFF
show ap dot11 5ghz summary
show ap dot11 24ghz summary
show ap rf-profile name STD-5 detail
wifi scan | wifi connect NK-STAFF psk NkStaff2024 | wifi status | wifi link</pre>
<p>GUI map: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs | RF | Tags</b>; <b>Configuration &gt; Wireless &gt; Access Points | Global</b>; <b>Monitoring &gt; Wireless &gt; Clients | Radios</b>; <b>Administration &gt; Management &gt; Save Configuration</b>.</p>

<div class="warn"><p><b>Common mistake.</b> Memorising Wi-Fi 6 feature names without the "why". Interviewers ask when a feature helps (many clients, small packets, battery) and when it does not (a single old client).</p></div>
<div class="exam"><p><b>Exam trap.</b> Concept-only items (OFDMA, MU-MIMO, colouring, TWT, MLO, 6 GHz) are still examinable. Practise stating the problem each one solves in one sentence.</p></div>

<div class="scn"><h4>The interview that turned on one command</h4><p>A candidate was shown a link line with HE-MCS 4, 20 MHz and a protection flag on 2.4 GHz and asked what was wrong. She named the generation (Wi-Fi 6 client), the band (2.4 GHz), the width (20 MHz is correct there), the flag (802.11b rates on), then proposed disabling the four b rates and moving the client to 5 GHz via radio policy, and said what she would check afterwards. She got the offer.</p><p><b>Lesson:</b> read the evidence aloud in order, then propose one measured change and its verification.</p></div>

<div class="iv"><p class="q">"Summarise in one minute how Wi-Fi speed is decided."</p><p>Strong answer: peak rate is streams x channel width x modulation (MCS) from the standard the client and AP both support; the actual MCS follows SNR; the band decides range and channel plan; rates and protection decide overhead; and EDCA and contention decide who talks when. Then give one tuning example from this module.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed = streams x width x MCS, limited by the weakest of client and AP, and SNR picks the MCS.</li>
<li>2.4 GHz at 20 MHz with 1, 6, 11; 5 GHz at 20 to 80 MHz depending on density; 6 GHz needs WPA3, PMF and has PSC discovery.</li>
<li>Wi-Fi 6 is efficiency in crowds (OFDMA, colour, TWT); Wi-Fi 7 adds MLO, 320 MHz and 4096-QAM.</li>
<li>Frames: management, control, data; join order scan, authentication, association, handshake.</li>
<li>Always work client first: client, band, width, rates, signal, channel.</li>
</ul></div>
`,hi:`
<p>Aapne "Wi-Fi shared room mein radio hai" se shuru kiya tha aur ab aap link line padh sakte ho, channel width plan kar sakte ho, Wi-Fi 6 aur 7 samjha sakte ho, frames decode kar sakte ho aur slow client fix kar sakte ho. Yeh chapter woh sab ikattha karta hai jo aapko aana chahiye, jo terms aapko aane chahiye, sabse zyada puche jaane wale facts aur command cheat-sheet. Yeh CCNA aur ENCOR level ke wireless fundamentals aur professional wireless topics se pehle ki foundations ki practised skills hain; apne exam ke liye hamesha current official blueprint check karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module map">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">PHY ideas</text><text x="80" y="63" text-anchor="middle" class="svg-muted" font-size="11">bands, QAM, MCS, widths</text>
<rect x="165" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="235" y="45" text-anchor="middle" class="svg-ink" font-size="12">Generations</text><text x="235" y="63" text-anchor="middle" class="svg-muted" font-size="11">b/g/a/n/ac/ax/be</text>
<rect x="320" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="390" y="45" text-anchor="middle" class="svg-ink" font-size="12">MAC ideas</text><text x="390" y="63" text-anchor="middle" class="svg-muted" font-size="11">frames, join, EDCA</text>
<rect x="475" y="20" width="150" height="60" rx="8" fill="#fde68a"/><text x="550" y="45" text-anchor="middle" class="svg-ink" font-size="12">Controller skills</text><text x="550" y="63" text-anchor="middle" class="svg-muted" font-size="11">radio policy, RF profile</text>
<rect x="10" y="100" width="615" height="50" rx="8" fill="#e2e8f0"/><text x="318" y="130" text-anchor="middle" class="svg-ink" font-size="13">Evidence loop: client, band, width, rates, signal, channel</text>
</svg><p class="cap">Module ek picture mein: PHY aur MAC knowledge controller settings ko feed karta hai, aur evidence loop result check karta hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>802.11a, b, g, n, ac, ax aur be ki generation, band aur Wi-Fi Alliance naam batao, aur har ek ne kya joda.</li>
<li>Samjhao kyun 2.4 GHz range deta hai aur 5 aur 6 GHz capacity, aur kaunse channels overlap nahi karte (1, 6, 11).</li>
<li>Subcarriers, bits per symbol, coding rate aur streams se data rate compute karo, aur <code>wifi link</code> mein MCS line padho.</li>
<li>Design ke liye 20, 40 ya 80 MHz chuno aur trade-off samjhao (speed, noise, cells ki ginti).</li>
<li>OFDMA, MU-MIMO, BSS colouring, TWT aur MLO ko ek ek vakya mein describe karo, aur batao ki simulator mein yeh concept only hain.</li>
<li>6 GHz samjhao: PSC, LPI, VLP, AFC, mandatory WPA3 aur PMF, aur clients 6 GHz APs kaise dhoondhte hain.</li>
<li>Teen frame types examples ke saath batao aur order scan, authentication, association, handshake, DHCP.</li>
<li>EDCA access categories, mandatory versus supported rates samjhao, aur kyun 802.11b rates disable karne se protection hat jaata hai.</li>
<li>Radio policy, RF profile (width, rates) aur RF tag configure karo, aur <code>show ap dot11 5ghz summary</code> aur <code>wifi link</code> se verify karo.</li>
<li>Paanch-sawal slow-client method chalao aur do-fault tickets fix karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BSS / BSSID / ESS</dt><dd>Ek AP radio aur uske clients; uska MAC; same SSID share karne wale BSSs ka set.</dd>
<dt>RSSI / SNR</dt><dd>dBm mein signal strength; signal minus noise dB mein.</dd>
<dt>QAM / MCS</dt><dd>Modulation type; modulation plus coding rate ka index.</dd>
<dt>OFDMA / RU</dt><dd>Multi-user OFDM; channel ka slice jo ek client ko diya jaata hai.</dd>
<dt>BSS colour</dt><dd>HE header mein 6-bit tag jo spatial reuse enable karta hai.</dd>
<dt>TWT</dt><dd>Target Wake Time, battery aur contention ke liye scheduled wake-ups.</dd>
<dt>MLO / MLD</dt><dd>Wi-Fi 7 ka Multi-Link Operation; kai links use karne wala device.</dd>
<dt>PSC / RNR</dt><dd>6 GHz mein Preferred Scanning Channel; dusre bands ke APs list karne wala Reduced Neighbor Report.</dd>
<dt>LPI / VLP / SP / AFC</dt><dd>6 GHz power classes aur standard power ke liye frequency coordination service.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection jo 5 GHz mein radar ko protect karta hai.</dd>
<dt>EDCA / WMM</dt><dd>Chaar-priority channel access; Wi-Fi Alliance certification naam.</dd>
<dt>Mandatory rate</dt><dd>Woh rate jo har associating client ko support karna zaroori hai; sabse low wala beacon rate aur cell edge tay karta hai.</dd>
<dt>PMF (802.11w)</dt><dd>Protected management frames; WPA3 mein mandatory.</dd>
</dl>

<h3>Sabse zyada puche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>Non-overlapping 2.4 GHz channels</td><td>1, 6, 11 (20 MHz)</td></tr>
<tr><td>Band ke hisaab se standards</td><td>a 5; b, g 2.4; n dono; ac sirf 5; ax 2.4, 5, 6; be 2.4, 5, 6</td></tr>
<tr><td>Bits per symbol</td><td>64-QAM 6, 256-QAM 8, 1024-QAM 10, 4096-QAM 12</td></tr>
<tr><td>Wi-Fi 6 symbol time</td><td>12.8 microseconds plus 0.8, 1.6 ya 3.2 guard</td></tr>
<tr><td>Wi-Fi 6 streams</td><td>MU-MIMO up aur down, 8 users tak; Wi-Fi 5 wave 2 sirf downlink</td></tr>
<tr><td>Wi-Fi 7 extras</td><td>320 MHz, 4096-QAM, MLO, multi-RU, preamble puncturing</td></tr>
<tr><td>DFS channels</td><td>52 se 144</td></tr>
<tr><td>PSC channels</td><td>5, 21, 37, ... 6 GHz mein har chautha 20 MHz channel</td></tr>
<tr><td>6 GHz security</td><td>WPA3 ya OWE PMF ke saath; WPA2-PSK, open, WEP, TKIP nahi</td></tr>
<tr><td>Beacon interval</td><td>102.4 ms (100 TU)</td></tr>
<tr><td>Join order</td><td>Probe, authentication, association, handshake, DHCP</td></tr>
<tr><td>Codes</td><td>Status 17 AP full; status 18 rates; reason 15 4-way timeout; reason 23 802.1X failed</td></tr>
<tr><td>dB rules</td><td>+3 dB = x2, +10 dB = x10, doori double = 6 dB</td></tr></table>

<h3>Command cheat-sheet (simulator)</h3>
<pre class="code"><span class="c">! radio policy (pehle WLAN disable karo)</span>
wlan NK-STAFF
 shutdown
 no radio policy dot11 24ghz
 no shutdown
<span class="c">! RF profile, rates aur tag</span>
ap dot11 5ghz rf-profile STD-5
 channel chan-width 40
 rate RATE_6M disable
 no shutdown
wireless tag rf RF-STD
 5ghz-rf-policy STD-5
ap name AP1 rf-tag RF-STD</pre>
<pre class="out">show wlan name NK-STAFF
show ap dot11 5ghz summary
show ap dot11 24ghz summary
show ap rf-profile name STD-5 detail
wifi scan | wifi connect NK-STAFF psk NkStaff2024 | wifi status | wifi link</pre>
<p>GUI map: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs | RF | Tags</b>; <b>Configuration &gt; Wireless &gt; Access Points | Global</b>; <b>Monitoring &gt; Wireless &gt; Clients | Radios</b>; <b>Administration &gt; Management &gt; Save Configuration</b>.</p>

<div class="warn"><p><b>Common galti.</b> Wi-Fi 6 feature names "kyun" ke bina ratna. Interviewers poochte hain ki feature kab madad karta hai (bahut clients, chhote packets, battery) aur kab nahi (ek akela purana client).</p></div>
<div class="exam"><p><b>Exam trap.</b> Concept-only items (OFDMA, MU-MIMO, colouring, TWT, MLO, 6 GHz) bhi exam mein aa sakte hain. Har ek kaunsi problem solve karta hai yeh ek vakya mein kehne ki practice karo.</p></div>

<div class="scn"><h4>Interview jo ek command par palta</h4><p>Ek candidate ko link line dikhayi gayi jisme HE-MCS 4, 20 MHz aur 2.4 GHz par protection flag tha, aur poocha gaya ki kya galat hai. Usne generation (Wi-Fi 6 client), band (2.4 GHz), width (wahan 20 MHz sahi hai), flag (802.11b rates on) batayi, phir chaar b rates disable karne aur client ko radio policy se 5 GHz par le jaane ka prastav diya, aur bataya ki baad mein kya check karegi. Use offer mil gaya.</p><p><b>Seekh:</b> evidence ko order mein zor se padho, phir ek measured change aur uska verification batao.</p></div>

<div class="iv"><p class="q">"Ek minute mein samjhao Wi-Fi speed kaise tay hoti hai."</p><p>Strong answer: peak rate streams x channel width x modulation (MCS) hai us standard se jo client aur AP dono support karte hain; asli MCS SNR follow karta hai; band range aur channel plan tay karta hai; rates aur protection overhead tay karte hain; aur EDCA aur contention tay karte hain ki kaun kab bolta hai. Phir is module se ek tuning example do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed = streams x width x MCS, client aur AP mein kamzor se limited, aur SNR MCS chunta hai.</li>
<li>2.4 GHz 20 MHz par 1, 6, 11 ke saath; 5 GHz density ke hisaab se 20 se 80 MHz; 6 GHz ko WPA3, PMF chahiye aur PSC discovery hai.</li>
<li>Wi-Fi 6 bheed mein efficiency hai (OFDMA, colour, TWT); Wi-Fi 7 MLO, 320 MHz aur 4096-QAM jodta hai.</li>
<li>Frames: management, control, data; join order scan, authentication, association, handshake.</li>
<li>Hamesha client-first kaam karo: client, band, width, rates, signal, channel.</li>
</ul></div>
`}};export{e as default};