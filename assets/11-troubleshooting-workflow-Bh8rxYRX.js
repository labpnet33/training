var e={id:`troubleshooting`,h:{en:`Wireless troubleshooting workflow`,hi:`Wireless troubleshooting workflow`},body:{en:`
<p>A doctor does not prescribe medicine because a patient says "I feel bad". She asks where it hurts, when it started, and who else is affected, then runs the right test. Wireless tickets are the same: "Wi-Fi is bad" could be a radio problem, a security problem, an IP problem or a problem with one laptop. A fixed workflow stops you guessing.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Wireless troubleshooting workflow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Scope: who, where, when</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Can it see the SSID?</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. Signal and SNR ok?</text>
<rect x="440" y="110" width="180" height="44" rx="8" fill="#fde68a"/><text x="530" y="137" text-anchor="middle" class="svg-ink" font-size="13">4. Channel and interference</text>
<rect x="230" y="110" width="180" height="44" rx="8" fill="#fed7aa"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Auth and association</text>
<rect x="20" y="110" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="137" text-anchor="middle" class="svg-ink" font-size="13">6. IP, VLAN, gateway</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="64" x2="530" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="132" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><line x1="230" y1="132" x2="200" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Radio first (steps 2 to 4), then security (5), then the wired side (6).</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">One user = client problem; one area = RF problem; everyone = infrastructure.</text>
</svg><p class="cap">Walk the join in order. Each step has its own tools and symptoms.</p></div>
<p>Start with <b>scope</b>: one device, one room, one floor or the whole site? One device points to its driver, settings or battery-saving mode. One area points to RF: coverage, interference or a failed AP. Everyone points to the controller, RADIUS, DHCP or the uplink.</p>

<h3>The six classic wireless faults</h3>
<table class="cmp"><tr><th>Fault</th><th>Typical symptoms</th><th>How to confirm</th><th>Fix</th></tr>
<tr><td><b>Interference</b></td><td>Good signal but slow, high retries, drops at certain times (lunchtime microwaves)</td><td>Spectrum analyser for non-Wi-Fi sources (microwave ovens, Bluetooth, cordless phones, video senders); Wi-Fi analyser for neighbour APs; high noise floor, low SNR</td><td>Remove or move the source, change channel, move clients to 5 or 6 GHz</td></tr>
<tr><td><b>Channel overlap</b></td><td>Slow for everyone in an area, many APs visible on the same or overlapping channels</td><td>Controller channel plan, Wi-Fi analyser channel graph</td><td>1, 6, 11 in 2.4 GHz; unique 5 GHz channels; narrower width; lower power</td></tr>
<tr><td><b>Signal degradation or loss</b></td><td>RSSI weaker than -70 dBm, falls at distance or behind walls, rate drops</td><td>RSSI and SNR on the client or controller, walk test</td><td>Reposition AP, better antenna, remove obstacles, check cable and antenna connectors</td></tr>
<tr><td><b>Insufficient coverage</b></td><td>Dead spots, clients disconnect in certain rooms, stairwells or corners</td><td>Heat map from a site survey</td><td>Add APs, re-survey, adjust placement and power</td></tr>
<tr><td><b>Client disassociation issues</b></td><td>Clients connect then drop repeatedly</td><td>Controller logs (deauth reasons), client event logs, capture</td><td>Fix weak signal, update drivers, adjust power saving, enable PMF against deauth attacks, check max-client limits and session timeouts</td></tr>
<tr><td><b>Roaming misconfiguration</b></td><td>Calls drop or IP changes when walking; clients "stick" to a far AP</td><td>Compare SSID, security and VLAN on every AP; check cell overlap</td><td>Same SSID, security and VLAN everywhere; 15 to 20 percent overlap; enable 802.11k/v/r where supported; avoid overly high power</td></tr>
</table>

<h3>Reading the evidence on the controller</h3>
<pre class="out">(WLC1) &gt;show ap auto-rf 802.11b AP1
AP Name.......................................... AP1
Channel.......................................... 1
Tx Power Level................................... 1 (20 dBm)
<span class="hl">Overlapping neighbours (interference)............ 3</span>
  Nearby APs
    AP2           ch 1    -64 dBm   18 m   CO-CHANNEL
    AP3           ch 1    -74 dBm   36 m   CO-CHANNEL
    AP4           ch 1    -81 dBm   54 m   CO-CHANNEL</pre>
<p>This is the lab floor before the fix: AP1 hears three neighbours on its own channel. That is a <b>channel overlap</b> problem, not a coverage problem; adding APs would make it worse.</p>
<pre class="out">(WLC1) &gt;show msglog
<span class="hl">Sep 29 09:14:52.318 %APF-4-AUTH_FAIL: Client 00:50:79:66:68:12 failed PSK authentication on WLAN 1 (CORP-OFFICE) via AP AP2: MIC failure in 4-way handshake (wrong pre-shared key)</span>
Sep 29 09:02:07.904 %APF-6-CLIENT_DEAUTH: Client 00:50:79:66:68:31 removed from WLAN 1 (CORP-OFFICE): AP AP3 lost its controller</pre>
<p>The first line is not RF at all: it is a wrong passphrase. The second is an AP that lost its controller, so every client on it was disconnected; check the AP's switch port, PoE and path to the controller.</p>

<h3>Useful numbers to remember</h3>
<ul>
<li>RSSI: -30 to -50 dBm excellent, -67 dBm target for voice and video, -70 dBm fine for data, -80 dBm unreliable.</li>
<li>SNR: 25 dB or more good; below about 15 dB expect low rates and retries.</li>
<li>Retry rate above about 10 percent suggests interference or overlap.</li>
<li>Channel utilisation above about 50 percent means the channel is congested.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Wi-Fi drops every day around 13:00 in the kitchen area." Scope: one area, one time. Signal is -58 dBm (fine). SNR drops from 34 dB to 9 dB at 13:05. A spectrum analyser shows a wide burst across 2.4 GHz channels 6 to 11 while the microwave runs. Microwave ovens leak energy around 2.45 GHz. Fix: move the kitchen AP's clients to 5 GHz with band steering and put the kitchen AP's 2.4 GHz radio on channel 1.</p></div>

<div class="warn"><p><b>Common mistake.</b> Answering every complaint by raising AP power. Higher AP power makes clients think the AP is closer than it is, but the client's own small transmitter cannot answer back from that far (an asymmetric link). It also increases co-channel contention. Fix the plan, not the volume.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the symptom to the term. "Good signal but slow, many retries" = interference or channel overlap. "No signal in the far corner" = insufficient coverage. "Signal weakens through a concrete wall" = signal degradation (attenuation). "Call drops while walking between APs" = roaming misconfiguration. "Clients repeatedly kicked off" = client disassociation, possibly a deauthentication attack.</p></div>

<div class="scn"><h4>The sticky laptops on the fourth floor</h4><p>Users on one side of a floor complained that their laptops "never connect to the close AP". The controller showed them associated to an AP 30 m away at -78 dBm while an AP 5 m away was idle. The far AP ran at maximum power after an RRM override, so its big cell kept clients hanging on. The engineer removed the override, letting RRM lower that AP's power, and enabled 802.11k/v. Clients began roaming to the nearest AP and throughput tripled.</p><p><b>Lesson:</b> roaming problems are often caused by cells that are too big, not too small.</p></div>

<div class="iv"><p class="q">"A user says the Wi-Fi is slow. How do you troubleshoot it?"</p><p>Strong answer: scope first (one device, one area or everyone). Check the client's RSSI and SNR, then the channel plan and utilisation for overlap and co-channel contention, then use a spectrum analyser for non-Wi-Fi interference. Check retries and data rates, whether the client is on 2.4 or 5 GHz, and whether it is stuck on a distant AP. Then check authentication logs and the wired side: VLAN, DHCP, gateway and uplink. Fix with channel and power changes, band steering, AP placement or more APs, then verify with a survey.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Scope first: one client, one area, or everyone.</li>
<li>Walk the join in order: SSID visible, signal and SNR, channel and interference, authentication, IP and VLAN.</li>
<li>Six classic faults: interference, channel overlap, signal degradation, insufficient coverage, disassociation, roaming misconfiguration.</li>
<li>Tools: controller channel plan and logs, Wi-Fi analyser, spectrum analyser, site-survey heat maps.</li>
<li>More power is rarely the fix; channel plan, cell size and band choice usually are.</li>
</ul></div>
`,hi:`
<p>Doctor sirf isliye dawa nahi likhti ki mareez kehta hai "mujhe bura lag raha hai". Woh poochti hai kahan dard hai, kab shuru hua, aur kaun aur affected hai, phir sahi test karti hai. Wireless tickets bhi aise hi hain: "Wi-Fi kharab hai" radio problem, security problem, IP problem ya ek laptop ki problem ho sakti hai. Ek fixed workflow aapko andaaze lagane se rokta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Wireless troubleshooting workflow">
<rect x="20" y="20" width="180" height="44" rx="8" fill="#e2e8f0"/><text x="110" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Scope: kaun, kahan, kab</text>
<rect x="230" y="20" width="180" height="44" rx="8" fill="#bae6fd"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. SSID dikhta hai?</text>
<rect x="440" y="20" width="180" height="44" rx="8" fill="#bbf7d0"/><text x="530" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. Signal aur SNR ok?</text>
<rect x="440" y="110" width="180" height="44" rx="8" fill="#fde68a"/><text x="530" y="137" text-anchor="middle" class="svg-ink" font-size="13">4. Channel aur interference</text>
<rect x="230" y="110" width="180" height="44" rx="8" fill="#fed7aa"/><text x="320" y="137" text-anchor="middle" class="svg-ink" font-size="13">5. Auth aur association</text>
<rect x="20" y="110" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="137" text-anchor="middle" class="svg-ink" font-size="13">6. IP, VLAN, gateway</text>
<line x1="200" y1="42" x2="230" y2="42" stroke="#64748b" stroke-width="2"/><line x1="410" y1="42" x2="440" y2="42" stroke="#64748b" stroke-width="2"/>
<line x1="530" y1="64" x2="530" y2="110" stroke="#64748b" stroke-width="2"/><line x1="440" y1="132" x2="410" y2="132" stroke="#64748b" stroke-width="2"/><line x1="230" y1="132" x2="200" y2="132" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Pehle radio (steps 2 se 4), phir security (5), phir wired side (6).</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Ek user = client problem; ek area = RF problem; sab = infrastructure.</text>
</svg><p class="cap">Join ko order mein check karo. Har step ke apne tools aur symptoms hain.</p></div>
<p><b>Scope</b> se shuru karo: ek device, ek kamra, ek floor ya poori site? Ek device uske driver, settings ya battery-saving mode ki taraf ishara karta hai. Ek area RF ki taraf: coverage, interference ya fail hua AP. Sab log controller, RADIUS, DHCP ya uplink ki taraf.</p>

<h3>Chhe classic wireless faults</h3>
<table class="cmp"><tr><th>Fault</th><th>Typical symptoms</th><th>Kaise confirm karein</th><th>Fix</th></tr>
<tr><td><b>Interference</b></td><td>Signal achha par slow, zyada retries, kuch samay par drops (lunchtime microwaves)</td><td>Non-Wi-Fi sources (microwave ovens, Bluetooth, cordless phones, video senders) ke liye spectrum analyser; padosi APs ke liye Wi-Fi analyser; oonchi noise floor, kam SNR</td><td>Source hatao ya shift karo, channel badlo, clients ko 5 ya 6 GHz par le jao</td></tr>
<tr><td><b>Channel overlap</b></td><td>Ek area mein sabke liye slow, same ya overlapping channels par bahut APs dikhte hain</td><td>Controller channel plan, Wi-Fi analyser channel graph</td><td>2.4 GHz mein 1, 6, 11; unique 5 GHz channels; patli width; kam power</td></tr>
<tr><td><b>Signal degradation ya loss</b></td><td>RSSI -70 dBm se kamzor, doori ya deewaron ke peeche girta hai, rate girta hai</td><td>Client ya controller par RSSI aur SNR, walk test</td><td>AP ki position badlo, behtar antenna, rukawatein hatao, cable aur antenna connectors check karo</td></tr>
<tr><td><b>Insufficient coverage</b></td><td>Dead spots, kuch kamron, seedhiyon ya kono mein clients disconnect</td><td>Site survey ka heat map</td><td>APs jodo, dobara survey, placement aur power adjust karo</td></tr>
<tr><td><b>Client disassociation issues</b></td><td>Clients connect hote hain phir baar baar drop</td><td>Controller logs (deauth reasons), client event logs, capture</td><td>Kamzor signal theek karo, drivers update karo, power saving adjust karo, deauth attacks ke khilaaf PMF enable karo, max-client limits aur session timeouts check karo</td></tr>
<tr><td><b>Roaming misconfiguration</b></td><td>Chalte hue calls drop ya IP badalta hai; clients door wale AP se "chipke" rehte hain</td><td>Har AP par SSID, security aur VLAN compare karo; cell overlap check karo</td><td>Har jagah same SSID, security aur VLAN; 15 se 20 percent overlap; jahan support ho 802.11k/v/r enable karo; bahut zyada power se bacho</td></tr>
</table>

<h3>Controller par evidence padhna</h3>
<pre class="out">(WLC1) &gt;show ap auto-rf 802.11b AP1
AP Name.......................................... AP1
Channel.......................................... 1
Tx Power Level................................... 1 (20 dBm)
<span class="hl">Overlapping neighbours (interference)............ 3</span>
  Nearby APs
    AP2           ch 1    -64 dBm   18 m   CO-CHANNEL
    AP3           ch 1    -74 dBm   36 m   CO-CHANNEL
    AP4           ch 1    -81 dBm   54 m   CO-CHANNEL</pre>
<p>Yeh fix se pehle ka lab floor hai: AP1 apne hi channel par teen padosi sunta hai. Yeh <b>channel overlap</b> problem hai, coverage problem nahi; APs jodne se yeh aur bigdega.</p>
<pre class="out">(WLC1) &gt;show msglog
<span class="hl">Sep 29 09:14:52.318 %APF-4-AUTH_FAIL: Client 00:50:79:66:68:12 failed PSK authentication on WLAN 1 (CORP-OFFICE) via AP AP2: MIC failure in 4-way handshake (wrong pre-shared key)</span>
Sep 29 09:02:07.904 %APF-6-CLIENT_DEAUTH: Client 00:50:79:66:68:31 removed from WLAN 1 (CORP-OFFICE): AP AP3 lost its controller</pre>
<p>Pehli line RF hai hi nahi: yeh galat passphrase hai. Doosri ek AP hai jisne apna controller kho diya, isliye uske har client ko disconnect kiya gaya; AP ka switch port, PoE aur controller tak ka path check karo.</p>

<h3>Yaad rakhne layak numbers</h3>
<ul>
<li>RSSI: -30 se -50 dBm excellent, voice aur video ke liye -67 dBm target, data ke liye -70 dBm theek, -80 dBm unreliable.</li>
<li>SNR: 25 dB ya zyada achha; lagbhag 15 dB se neeche kam rates aur retries ki ummeed karo.</li>
<li>Lagbhag 10 percent se zyada retry rate interference ya overlap ki taraf ishara karta hai.</li>
<li>Lagbhag 50 percent se zyada channel utilisation matlab channel congested hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "Kitchen area mein roz lagbhag 13:00 baje Wi-Fi drop hota hai." Scope: ek area, ek samay. Signal -58 dBm hai (theek). SNR 13:05 par 34 dB se 9 dB gir jaata hai. Spectrum analyser microwave chalne ke dauraan 2.4 GHz channels 6 se 11 par ek chauda burst dikhata hai. Microwave ovens lagbhag 2.45 GHz ke aas paas energy leak karte hain. Fix: band steering se kitchen AP ke clients ko 5 GHz par le jao aur kitchen AP ka 2.4 GHz radio channel 1 par rakho.</p></div>

<div class="warn"><p><b>Common galti.</b> Har shikayat ka jawab AP power badhakar dena. Zyada AP power se clients ko lagta hai ki AP asal se paas hai, par client ka apna chhota transmitter itni door se jawab nahi de paata (asymmetric link). Isse co-channel contention bhi badhta hai. Plan theek karo, volume nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom ko term se match karo. "Signal achha par slow, bahut retries" = interference ya channel overlap. "Door wale kone mein signal nahi" = insufficient coverage. "Concrete wall se signal kamzor hota hai" = signal degradation (attenuation). "APs ke beech chalte hue call drop" = roaming misconfiguration. "Clients baar baar bahar kiye jaate hain" = client disassociation, shayad deauthentication attack.</p></div>

<div class="scn"><h4>Chauthe floor ke chipku laptops</h4><p>Ek floor ki ek side ke users ne shikayat ki ki unke laptops "kabhi paas wale AP se connect nahi hote". Controller ne unhe 30 m door ke AP se -78 dBm par associated dikhaya jabki 5 m door ka AP khaali tha. RRM override ke baad door wala AP maximum power par chal raha tha, isliye uska bada cell clients ko pakde rakhta tha. Engineer ne override hataya, RRM ko us AP ki power kam karne diya, aur 802.11k/v enable kiya. Clients nazdeeki AP par roam karne lage aur throughput teen guna ho gaya.</p><p><b>Seekh:</b> roaming problems aksar bahut bade cells se hoti hain, chhote se nahi.</p></div>

<div class="iv"><p class="q">"User kehta hai Wi-Fi slow hai. Aap kaise troubleshoot karoge?"</p><p>Strong answer: pehle scope (ek device, ek area ya sab). Client ka RSSI aur SNR check karo, phir overlap aur co-channel contention ke liye channel plan aur utilisation, phir non-Wi-Fi interference ke liye spectrum analyser use karo. Retries aur data rates check karo, client 2.4 par hai ya 5 GHz par, aur kya woh door ke AP par atka hai. Phir authentication logs aur wired side: VLAN, DHCP, gateway aur uplink. Channel aur power changes, band steering, AP placement ya zyada APs se fix karo, phir survey se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle scope: ek client, ek area, ya sab.</li>
<li>Join ko order mein check karo: SSID dikhna, signal aur SNR, channel aur interference, authentication, IP aur VLAN.</li>
<li>Chhe classic faults: interference, channel overlap, signal degradation, insufficient coverage, disassociation, roaming misconfiguration.</li>
<li>Tools: controller channel plan aur logs, Wi-Fi analyser, spectrum analyser, site-survey heat maps.</li>
<li>Zyada power shayad hi kabhi fix hai; channel plan, cell size aur band choice aksar hote hain.</li>
</ul></div>
`}};export{e as default};