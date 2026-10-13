var e={id:`voice-video`,h:{en:`Designing for voice and video: RSSI, overlap, rates and roaming`,hi:`Voice aur video ke liye design: RSSI, overlap, rates aur roaming`},body:{en:`
<p>Voice and live video are <b>real-time</b>: a late packet is as bad as a lost one. A web page can wait 300 ms; a phone call cannot. Designing for them means stricter signal targets, deliberate cell overlap, higher minimum data rates and fast roaming. QoS marking itself (WMM, EDCA, DSCP) belongs to <code>wl-qos</code>; this chapter covers the <b>RF design</b> side and previews the roaming tools.</p>

<h3>Analogy: a live cricket commentary versus a recorded one</h3>
<p>A recorded match can buffer. Live commentary cannot: if a word arrives late the moment is gone. Wi-Fi voice has no buffer to hide behind, so the RF design must be tight before QoS can help.</p>

<h3>The numbers real-time traffic needs</h3>
<table class="cmp"><tr><th>Metric</th><th>Voice target</th><th>Why</th></tr>
<tr><td><b>Signal (RSSI)</b></td><td>-67 dBm or better at every point on the call path</td><td>Keeps a high data rate and few retries</td></tr>
<tr><td><b>SNR</b></td><td>25 dB or better</td><td>Clean modulation, low error rate</td></tr>
<tr><td><b>Cell overlap</b></td><td>about 20 percent in roaming zones</td><td>Next AP is already audible before the signal fails</td></tr>
<tr><td><b>One-way latency</b></td><td>150 ms or less end to end</td><td>Conversation feels natural</td></tr>
<tr><td><b>Jitter</b></td><td>30 ms or less end to end</td><td>Small playout buffer</td></tr>
<tr><td><b>Packet loss</b></td><td>1 percent or less</td><td>No audible clipping</td></tr>
</table>
<p>These are common design targets for voice over Wi-Fi; always confirm with the handset maker's deployment guide, because each device has its own recommended RSSI, bands and channel counts.</p>

<h3>Voice design rules</h3>
<ul>
<li><b>Use 5 GHz for voice</b> (or 6 GHz). 2.4 GHz has only three channels and is noisy. Keep 2.4 GHz for old handsets only.</li>
<li><b>Raise the minimum data rate.</b> Disable 6 and 9 Mbps and make 12 Mbps the lowest mandatory rate. Slow rates give voice frames long airtime and keep weak clients clinging to a bad AP.</li>
<li><b>Match power on both sides.</b> A handset transmits at about 14 dBm. If the AP shouts at 20 dBm the handset hears the AP but the AP cannot hear the handset (asymmetry). Set AP power near the client power, for example 14 dBm, and use extra APs for coverage.</li>
<li><b>Plan overlap at the roaming edge</b>, not just coverage.</li>
<li><b>Use DFS channels carefully.</b> A radar event drops calls for the channel move. Add non-DFS channels for voice-critical areas.</li>
<li><b>Enable fast roaming tools:</b> 802.11k (neighbour list), 802.11r (fast BSS transition, also called FT) and 802.11v (BSS transition management). They cut the roam from a full authentication (hundreds of ms) to a short exchange (tens of ms). Details are in <code>wl-mobility</code> and <code>wl-roaming</code>.</li>
<li><b>Admission control (CAC)</b> limits how many calls an AP accepts, so call 25 does not ruin calls 1 to 24. Configured in the QoS profile.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Overlap between two voice cells">
<circle cx="225" cy="85" r="75" fill="#bae6fd" fill-opacity="0.55" stroke="#64748b"/>
<circle cx="385" cy="85" r="75" fill="#bbf7d0" fill-opacity="0.55" stroke="#64748b"/>
<circle cx="225" cy="85" r="5" fill="#334155"/><circle cx="385" cy="85" r="5" fill="#334155"/>
<text x="225" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="385" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<rect x="310" y="60" width="0" height="50" fill="none"/>
<text x="305" y="88" text-anchor="middle" class="svg-ink" font-size="11">overlap</text><text x="305" y="102" text-anchor="middle" class="svg-ink" font-size="11">20%</text>
<path d="M170 150 H440" stroke="#64748b" stroke-width="2"/><path d="M430 144 L440 150 L430 156" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="305" y="168" text-anchor="middle" class="svg-muted" font-size="12">walking handset roams here</text>
<text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">Edge = -67 dBm</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">both APs audible</text><text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="12">before the signal dies</text>
</svg><p class="cap">The roaming zone is where both APs are at -67 dBm or better.</p></div>

<div class="eg"><p><b>Worked example: voice cell spacing.</b> Voice RF profile uses AP power 14 dBm (power level 3). Radius at the -67 dBm edge with the lab model: 14 - 46 - 35 x log10(d) = -67, so log10(d) = 1.0, d = <b>10 m</b>. If overlap means 20 percent of the cell diameter (20 m), the roaming zone is 4 m wide and spacing is 20 x 0.8 = <b>16 m</b>. Halfway at 8 m from each AP the signal is 14 - 46 - 35 x log10(8) = -63.6 dBm from both, so a walking handset has about 4 m, around 3 seconds at walking pace, to roam inside the -67 dBm zone.</p></div>

<h3>Video design</h3>
<p>Streaming video is more tolerant than voice but uses more bandwidth. Interactive video (meetings, telepresence) needs low jitter like voice and 1 to 4 Mbps per stream. Use the capacity method from chapter 3 with the real Mbps per user, and consider the <b>multicast</b> problem: multicast frames go at a basic rate and are not acknowledged, so a single video to 50 clients can burn the cell. Convert multicast to unicast (the Videostream / multicast-direct idea) and read <code>wl-qos</code> for the exact settings. Both voice and video use WMM access categories: voice is AC_VO, video is AC_VI, but only if the client and the network trust the marking.</p>

<h3>RF profile for voice</h3>
<p>The 9800 lets you set these things per RF profile. The coverage hole detection threshold for voice can be tightened so the controller reports voice clients with poor signal earlier.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile VOICE-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# tx-power max 14
WLC1(config-rf-profile)# rate RATE_6M disable
WLC1(config-rf-profile)# rate RATE_9M disable
WLC1(config-rf-profile)# rate RATE_12M mandatory
WLC1(config-rf-profile)# coverage voice rssi threshold -75
WLC1(config-rf-profile)# no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band), tabs <b>802.11</b> for data rates, <b>RRM</b> for TPC and DCA, and <b>Coverage</b>. Check it:</p>
<pre class="out">WLC1# show ap rf-profile name VOICE-5 detail

RF Profile Name                  : VOICE-5
Band                             : 802.11a (5 GHz)
Status                           : Up
Channel width                    : 20 MHz
Max TX power                     : 14 dBm
<span class="hl">Lowest mandatory data rate       : 12 Mbps</span>
Coverage data/voice RSSI         : -80 / -75 dBm</pre>
<p>Exact syntax varies by release; <code>coverage</code> lines and the RX-SOP idea are model forms in the lab. The rate and tx-power commands are real forms.</p>

<div class="warn"><p><b>Common mistakes.</b> Designing voice for -75 dBm because "data works there"; leaving 6 Mbps enabled; putting AP power far above the handset power; mixing 2.4 and 5 GHz roaming in a voice SSID; testing voice only while standing still.</p></div>
<div class="exam"><p><b>Exam trap.</b> Voice needs -67 dBm and about 20 percent overlap; data may be fine at -70 dBm. Latency 150 ms, jitter 30 ms, loss 1 percent are the standard real-time limits. 802.11r is fast roaming; 802.11k is the neighbour list; 802.11v is the steering message.</p></div>

<div class="scn"><h4>Voice calls that broke at the stairwell</h4><p>Staff on call walked from floor 2 to floor 3 and the audio died for 4 seconds. The survey showed -78 dBm in the stairwell and no 802.11r. The team added an AP on the landing, set 12 Mbps as the minimum rate, lowered AP power from 20 to 14 dBm to match handsets, and enabled 802.11k, r and v. The roam fell to well under a second.</p><p><b>Lesson:</b> stairwells and lifts are roaming boundaries, so give them real overlap.</p></div>

<div class="iv"><p class="q">"What changes in your RF design when voice is a requirement?"</p><p>Raise the coverage target to -67 dBm with 25 dB SNR, plan about 20 percent overlap, use 5 GHz, disable the lowest rates (12 Mbps minimum), match AP power to handset power, add APs at stairwells and lifts, enable 802.11k, r and v, and use CAC. Then validate with an active walk test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real-time targets: -67 dBm, SNR 25 dB, 20 percent overlap, latency 150 ms, jitter 30 ms, loss 1 percent.</li>
<li>Voice on 5 GHz with 12 Mbps minimum and AP power near client power.</li>
<li>Roaming boundaries (stairs, lifts) need overlap and 802.11k, r and v.</li>
<li>Multicast video needs unicast conversion; use CAC to protect existing calls.</li>
<li>Validate voice with an active survey while walking.</li>
</ul></div>
`,hi:`
<p>Voice aur live video <b>real-time</b> hain: late packet lost packet jitna hi kharab hai. Web page 300 ms intezaar kar sakta hai; phone call nahi. Inke liye design ka matlab hai sakht signal targets, soch samajh kar cell overlap, ooncha minimum data rate aur tez roaming. QoS marking (WMM, EDCA, DSCP) <code>wl-qos</code> ka hissa hai; yeh chapter <b>RF design</b> side cover karta hai aur roaming tools ka preview deta hai.</p>

<h3>Analogy: live cricket commentary versus recorded</h3>
<p>Recorded match buffer ho sakta hai. Live commentary nahi: agar ek shabd late aaya to pal chala gaya. Wi-Fi voice ke paas chhupne ke liye buffer nahi hai, isliye QoS madad kare usse pehle RF design tight hona chahiye.</p>

<h3>Real-time traffic ko chahiye numbers</h3>
<table class="cmp"><tr><th>Metric</th><th>Voice target</th><th>Kyun</th></tr>
<tr><td><b>Signal (RSSI)</b></td><td>call path ke har point par -67 dBm ya behtar</td><td>High data rate aur kam retries</td></tr>
<tr><td><b>SNR</b></td><td>25 dB ya behtar</td><td>Saaf modulation, kam error rate</td></tr>
<tr><td><b>Cell overlap</b></td><td>roaming zones mein lagbhag 20 percent</td><td>Signal fail hone se pehle agla AP sunai deta hai</td></tr>
<tr><td><b>One-way latency</b></td><td>end to end 150 ms ya kam</td><td>Baatcheet natural lagti hai</td></tr>
<tr><td><b>Jitter</b></td><td>end to end 30 ms ya kam</td><td>Chhota playout buffer</td></tr>
<tr><td><b>Packet loss</b></td><td>1 percent ya kam</td><td>Aawaz mein clipping nahi</td></tr>
</table>
<p>Voice over Wi-Fi ke yeh common design targets hain; hamesha handset maker ki deployment guide se confirm karo, kyunki har device ka apna recommended RSSI, bands aur channel count hota hai.</p>

<h3>Voice design rules</h3>
<ul>
<li><b>Voice ke liye 5 GHz use karo</b> (ya 6 GHz). 2.4 GHz mein sirf teen channels hain aur woh noisy hai. 2.4 GHz sirf purane handsets ke liye rakho.</li>
<li><b>Minimum data rate badhao.</b> 6 aur 9 Mbps disable karo aur 12 Mbps ko sabse low mandatory rate banao. Slow rates voice frames ko lamba airtime dete hain aur kamzor clients ko kharab AP se chipkaye rakhte hain.</li>
<li><b>Dono taraf power match karo.</b> Handset lagbhag 14 dBm par transmit karta hai. Agar AP 20 dBm par chillata hai to handset AP ko sunta hai lekin AP handset ko nahi sun pata (asymmetry). AP power ko client power ke paas rakho, jaise 14 dBm, aur coverage ke liye extra APs lagao.</li>
<li><b>Roaming edge par overlap plan karo</b>, sirf coverage nahi.</li>
<li><b>DFS channels dhyan se use karo.</b> Radar event channel move ke dauraan calls girata hai. Voice-critical areas ke liye non-DFS channels jodo.</li>
<li><b>Fast roaming tools on karo:</b> 802.11k (neighbour list), 802.11r (fast BSS transition, FT bhi kehte hain) aur 802.11v (BSS transition management). Yeh roam ko full authentication (sainkdon ms) se chhote exchange (das ms) tak kam kar dete hain. Details <code>wl-mobility</code> aur <code>wl-roaming</code> mein hain.</li>
<li><b>Admission control (CAC)</b> AP kitne calls accept kare yeh limit karta hai, taaki call 25 calls 1 se 24 ko kharab na kare. QoS profile mein configure hota hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Do voice cells ke beech overlap">
<circle cx="225" cy="85" r="75" fill="#bae6fd" fill-opacity="0.55" stroke="#64748b"/>
<circle cx="385" cy="85" r="75" fill="#bbf7d0" fill-opacity="0.55" stroke="#64748b"/>
<circle cx="225" cy="85" r="5" fill="#334155"/><circle cx="385" cy="85" r="5" fill="#334155"/>
<text x="225" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP1</text><text x="385" y="30" text-anchor="middle" class="svg-ink" font-size="12">AP2</text>
<text x="305" y="88" text-anchor="middle" class="svg-ink" font-size="11">overlap</text><text x="305" y="102" text-anchor="middle" class="svg-ink" font-size="11">20%</text>
<path d="M170 150 H440" stroke="#64748b" stroke-width="2"/><path d="M430 144 L440 150 L430 156" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="305" y="168" text-anchor="middle" class="svg-muted" font-size="12">chalta handset yahan roam karta hai</text>
<text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">Edge = -67 dBm</text><text x="560" y="90" text-anchor="middle" class="svg-muted" font-size="12">dono APs sunai dete hain</text><text x="560" y="106" text-anchor="middle" class="svg-muted" font-size="12">signal marne se pehle</text>
</svg><p class="cap">Roaming zone woh hai jahan dono APs -67 dBm ya behtar par hain.</p></div>

<div class="eg"><p><b>Worked example: voice cell spacing.</b> Voice RF profile AP power 14 dBm (power level 3) use karta hai. Lab model se -67 dBm edge par radius: 14 - 46 - 35 x log10(d) = -67, to log10(d) = 1.0, d = <b>10 m</b>. Agar overlap ka matlab cell diameter (20 m) ka 20 percent hai, to roaming zone 4 m chaura hai aur spacing 20 x 0.8 = <b>16 m</b>. Har AP se 8 m par beech mein signal dono se 14 - 46 - 35 x log10(8) = -63.6 dBm hai, isliye chalte handset ke paas -67 dBm zone ke andar roam karne ke liye lagbhag 4 m hai, paidal chaal par kareeb 3 second.</p></div>

<h3>Video design</h3>
<p>Streaming video voice se zyada sahansheel hai lekin zyada bandwidth leta hai. Interactive video (meetings, telepresence) ko voice jaisa kam jitter aur har stream 1 se 4 Mbps chahiye. Chapter 3 ka capacity method asli Mbps per user ke saath use karo, aur <b>multicast</b> problem ka dhyan rakho: multicast frames basic rate par jaate hain aur acknowledge nahi hote, isliye 50 clients ko ek video poora cell jala sakta hai. Multicast ko unicast mein convert karo (Videostream / multicast-direct idea) aur exact settings ke liye <code>wl-qos</code> padho. Voice aur video dono WMM access categories use karte hain: voice AC_VO, video AC_VI, lekin tabhi jab client aur network marking par bharosa karein.</p>

<h3>Voice ke liye RF profile</h3>
<p>9800 mein yeh cheezein per RF profile set hoti hain. Voice ke liye coverage hole detection threshold ko tight kiya ja sakta hai taaki controller kamzor signal wale voice clients ko pehle report kare.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile VOICE-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# tx-power max 14
WLC1(config-rf-profile)# rate RATE_6M disable
WLC1(config-rf-profile)# rate RATE_9M disable
WLC1(config-rf-profile)# rate RATE_12M mandatory
WLC1(config-rf-profile)# coverage voice rssi threshold -75
WLC1(config-rf-profile)# no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band), data rates ke liye tab <b>802.11</b>, TPC aur DCA ke liye <b>RRM</b>, aur <b>Coverage</b>. Check karo:</p>
<pre class="out">WLC1# show ap rf-profile name VOICE-5 detail

RF Profile Name                  : VOICE-5
Band                             : 802.11a (5 GHz)
Status                           : Up
Channel width                    : 20 MHz
Max TX power                     : 14 dBm
<span class="hl">Lowest mandatory data rate       : 12 Mbps</span>
Coverage data/voice RSSI         : -80 / -75 dBm</pre>
<p>Exact syntax release ke hisaab se badalta hai; <code>coverage</code> lines aur RX-SOP idea lab mein model forms hain. Rate aur tx-power commands real forms hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Voice ko -75 dBm ke liye design karna kyunki "data wahan chalta hai"; 6 Mbps enabled chhodna; AP power ko handset power se bahut upar rakhna; voice SSID mein 2.4 aur 5 GHz roaming mix karna; voice ko sirf khade hokar test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Voice ko -67 dBm aur lagbhag 20 percent overlap chahiye; data -70 dBm par theek ho sakta hai. Latency 150 ms, jitter 30 ms, loss 1 percent standard real-time limits hain. 802.11r fast roaming hai; 802.11k neighbour list hai; 802.11v steering message hai.</p></div>

<div class="scn"><h4>Stairwell par toot-ti voice calls</h4><p>Call par staff floor 2 se floor 3 chala aur audio 4 second ke liye mar gaya. Survey mein stairwell mein -78 dBm tha aur 802.11r nahi tha. Team ne landing par AP lagaya, minimum rate 12 Mbps kiya, AP power 20 se 14 dBm kiya taaki handsets se match ho, aur 802.11k, r aur v enable kiye. Roam ek second se bhi kam ho gaya.</p><p><b>Seekh:</b> stairwells aur lifts roaming boundaries hain, unhe asli overlap do.</p></div>

<div class="iv"><p class="q">"Voice requirement ho to aapke RF design mein kya badalta hai?"</p><p>Coverage target -67 dBm aur 25 dB SNR karo, lagbhag 20 percent overlap plan karo, 5 GHz use karo, sabse low rates disable karo (12 Mbps minimum), AP power ko handset power se match karo, stairwells aur lifts par APs lagao, 802.11k, r aur v enable karo, aur CAC use karo. Phir active walk test se validate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Real-time targets: -67 dBm, SNR 25 dB, 20 percent overlap, latency 150 ms, jitter 30 ms, loss 1 percent.</li>
<li>Voice 5 GHz par, 12 Mbps minimum aur AP power client power ke paas.</li>
<li>Roaming boundaries (stairs, lifts) ko overlap aur 802.11k, r, v chahiye.</li>
<li>Multicast video ko unicast conversion chahiye; maujooda calls bachane ke liye CAC use karo.</li>
<li>Voice ko chalte hue active survey se validate karo.</li>
</ul></div>
`}};export{e as default};