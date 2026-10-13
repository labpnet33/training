var e=(e,t,n,r,i,a,o,s)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="6" fill="`+i+`" stroke="`+(o||`#64748b`)+`"`+(s?` stroke-width="`+s+`"`:``)+`/>`+(a?`<text x="`+(e+n/2)+`" y="`+(t+r/2+4)+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`:``),t=(e,t,n,r,i)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(i||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="12">`+n+`</text>`,n=(e,t,n,r,i,a)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="`+i+`" stroke-width="2"`+(a?` stroke-dasharray="6 4"`:``)+`/>`,r=(e,t)=>`<circle cx="`+e+`" cy="`+t+`" r="8" fill="#0ea5e9" stroke="#0369a1"/>`,i=(e,t,n)=>`<circle cx="`+e+`" cy="`+t+`" r="6" fill="`+(n?`#22c55e`:`#ffffff`)+`" stroke="#15803d" stroke-width="2"/>`,a=e=>`<ellipse cx="`+e+`" cy="118" rx="80" ry="50" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/>`,o=o=>`<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="`+o.aria+`">`+e(20,8,120,30,`#ddd6fe`,o.wlc)+e(260,8,120,30,`#bbf7d0`,o.sw)+n(140,23,260,23,`#7c3aed`)+e(20,62,600,130,`#f1f5f9`,``)+e(20,100,600,50,`#e2e8f0`,``,`#e2e8f0`)+e(270,150,100,42,`#fed7aa`,o.core,`#64748b`,3)+t(50,84,o.rooms,`svg-muted`,`start`)+t(50,176,o.rooms,`svg-muted`,`start`)+n(320,38,95,110,`#94a3b8`)+n(320,38,225,110,`#94a3b8`)+n(320,38,355,110,`#94a3b8`)+n(320,38,485,110,`#94a3b8`)+a(95)+a(225)+a(355)+a(485)+r(95,118)+r(225,118)+r(355,118)+r(485,118)+n(60,138,540,138,`#f97316`,!0)+i(60,138,!0)+i(540,138,!1)+t(320,212,o.ov,`svg-muted`)+r(20,238)+t(34,242,o.k1,`svg-ink`,`start`)+e(90,230,22,16,`#ddd6fe`,``)+t(120,242,o.k2,`svg-ink`,`start`)+i(230,238,!0)+t(242,242,o.k3,`svg-ink`,`start`)+e(380,230,22,16,`#fed7aa`,``,`#64748b`,3)+t(410,242,o.k4,`svg-ink`,`start`)+n(20,268,50,268,`#f97316`,!0)+t(58,272,o.k5,`svg-ink`,`start`)+`<ellipse cx="270" cy="268" rx="14" ry="8" fill="none" stroke="#0ea5e9" stroke-dasharray="4 3"/>`+t(292,272,o.k6,`svg-ink`,`start`)+`</svg><p class="cap">`+o.cap+`</p></div>`,s=o({aria:`Hotel corridor with voice cells and a roaming handset`,wlc:`Controller`,sw:`PoE switch`,core:`Lift and stairs`,rooms:`Rooms`,ov:`Neighbour cells overlap about 20 percent (typical)`,k1:`AP`,k2:`Controller`,k3:`Handset`,k4:`Concrete core`,k5:`Roam path`,k6:`5 GHz voice cell`,cap:`Summit Tower floor plan: corridor APs, cells overlapped for roaming, and the lift core that forced the extra AP beside it.`}),c=o({aria:`Hotel corridor mein voice cells aur roam karta handset`,wlc:`Controller`,sw:`PoE switch`,core:`Lift aur stairs`,rooms:`Rooms`,ov:`Padosi cells lagbhag 20 percent overlap (typical)`,k1:`AP`,k2:`Controller`,k3:`Handset`,k4:`Concrete core`,k5:`Roam path`,k6:`5 GHz voice cell`,cap:`Summit Tower floor plan: corridor APs, roaming ke liye overlap wali cells, aur lift core jiski wajah se uske paas extra AP lagana pada.`}),l={id:`voice-over-wifi`,h:{en:`Voice over Wi-Fi: QoS, CAC and roaming for handsets`,hi:`Voice over Wi-Fi: handsets ke liye QoS, CAC aur roaming`},body:{en:`
<h3>Case 2: Summit Tower Hotel (fictional)</h3>
<p>Summit Tower is a 22-floor hotel. Housekeeping, security and engineering staff carry Wi-Fi handsets such as Cisco 8821 class phones. Calls must work in rooms, corridors, lifts, stairs and the basement kitchen. The previous Wi-Fi was designed for guest browsing and staff complained of choppy audio and dropped calls when walking.</p>

<h3>Requirements</h3>
<ul>
<li>One-way delay of 150 ms or less, jitter of 30 ms or less and packet loss of 1 percent or less (the common voice targets).</li>
<li>Primary signal about -67 dBm and SNR about 25 dB at every point a handset can be carried (typical voice design values).</li>
<li>Seamless roaming while walking, with no audible gap.</li>
<li>Battery life of a full shift.</li>
<li>Emergency calls must be locatable to a floor and zone.</li>
</ul>

<h3>Constraints</h3>
<p>Each floor has a heavy concrete lift and stair core. The hotel wants the cheapest design that still meets voice. Guests expect Wi-Fi in rooms on the same building system. Cabling to rooms is not available on older floors.</p>

<h3>Why voice is different</h3>
<p>A voice call sends small packets about 50 times per second each way (a 20 ms packetisation interval). The bandwidth is tiny, but each packet needs its own medium access, so a call costs real <b>airtime</b>. Voice cannot wait for a retransmission storm, so a bad cell hurts instantly. That is why voice design asks for stronger signal, higher minimum data rates, smaller cells and clean channels.</p>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Coverage</th><th>Cost</th><th>Voice risk</th></tr>
<tr><td><b>A. Corridor APs only</b></td><td>Rooms receive signal through doors and walls</td><td>Lowest</td><td>Weak signal in far rooms, lift core shadow</td></tr>
<tr><td><b>B. One AP per room or per two rooms</b></td><td>Excellent everywhere</td><td>Highest</td><td>Many co-channel cells unless power is reduced</td></tr>
<tr><td><b>C. Corridor APs plus extra AP at the lift core, 5 GHz voice SSID, validated by survey</b></td><td>Meets -67 dBm in corridors and rooms with doors open or closed after validation</td><td>Medium</td><td>Low once surveyed</td></tr>
</table>

<h3>Chosen design</h3>
<p>Summit picks option C. A <b>voice-grade survey</b> with a handset (or the right adapter) measures -67 dBm and SNR on each floor. Voice runs on a dedicated SSID in 5 GHz only, with 802.11b rates disabled, a low mandatory rate such as 12 Mbps (typical choice) and the unneeded lower rates off. Cells overlap by about 20 percent. Where possible the plan avoids DFS channels on voice floors because a radar event forces a channel change and a call gap.</p>

<h3>QoS end to end</h3>
<p>Quality of service must be marked and trusted on every hop. The WLAN QoS profile for voice is <b>Platinum</b>. Gold is for video, Silver for best effort and Bronze for background.</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>802.11 UP</th><th>WMM class</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>6</td><td>AC_VO</td></tr>
<tr><td>Video</td><td>AF41 (34)</td><td>5</td><td>AC_VI</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>4</td><td>AC_VI</td></tr>
<tr><td>Best effort</td><td>0</td><td>0</td><td>AC_BE</td></tr>
<tr><td>Background</td><td>CS1 (8)</td><td>1</td><td>AC_BK</td></tr>
</table>
<p>The AP port, the uplink and the path to the call server must trust DSCP. <b>WMM</b> must be on. <b>Call admission control (CAC)</b> keeps the cell from being overloaded: when a new call would push the AP past its voice bandwidth budget, the call is refused or the handset moves to another AP instead of every call getting worse. CAC relies on clients that send a TSPEC, and its use must match the handset vendor guide.</p>
`+s+`
<div class="eg"><p><b>Worked example.</b> 60 staff handsets across 22 floors, a peak of 25 percent on a call: 15 calls hotel-wide. That is tiny per AP, so capacity is not the issue. The issue is signal and roaming at each point. If the lobby has 12 staff plus a front desk phone and four more calls at shift change, a single lobby AP still carries fewer calls than its voice budget, so CAC rarely trips there. Confirm the AP call limit with the vendor figures, which are typical planning numbers and not a promise.</p></div>
<pre class="out">DESIGN WORKSHEET (example, not device output)
SSID voice-staff   band 5 GHz only   security 802.1X  FT adaptive
QoS profile        Platinum          WMM on           CAC voice on
Min data rate      12 Mbps           802.11b rates off
Cell overlap       about 20 percent  <span class="hl">primary -67 dBm, SNR 25 dB</span>
Switch ports       trust DSCP        PoE budget checked per AP
</pre>
<p>For battery life the handsets use power save (U-APSD). Do not set an aggressive DTIM for multicast on the voice SSID, since it delays power-save wake-ups.</p>

<div class="warn"><p><b>Common mistakes.</b> Leaving 2.4 GHz voice on, keeping 1 and 2 Mbps rates enabled so the cell is huge but slow, turning on every DFS channel on a voice floor, and forgetting that the wired switch is re-marking DSCP to zero.</p></div>
<div class="exam"><p><b>Exam trap.</b> A strong signal is not enough. The exam checks QoS marking, WMM, CAC, overlap and the voice survey together. Also remember that voice and video markings differ: EF for voice, AF41 for video.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>The one-way audio near the lifts</h4><p>On floor 14 a housekeeper heard the caller, but the caller could not hear her. The survey showed -60 dBm downlink, yet the handset uplink was weak: the lift core attenuated the low-power handset signal and the AP was far on the far side. The engineer added one AP beside the core, lowered the corridor APs power slightly and re-ran the voice survey. Calls then held through the lift lobby.</p><p><b>Lesson:</b> design for the weakest device, the client. The handset transmits less than the AP, so the uplink fails first.</p></div>

<div class="iv"><p class="q">"What do you configure on a WLAN to carry voice correctly?"</p><p>Strong answer: a dedicated SSID, 5 GHz, the Platinum QoS profile, WMM, CAC, DSCP trust on the wired path, 802.11b rates off, a suitable minimum rate, 802.11k/v/r or OKC for fast roaming, and a voice-grade survey for -67 dBm, 25 dB SNR and about 20 percent overlap.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice targets: 150 ms delay, 30 ms jitter, 1 percent loss.</li>
<li>Design to about -67 dBm and 25 dB SNR with about 20 percent overlap (typical).</li>
<li>Marking: voice EF and UP 6, video AF41 and UP 5; Platinum profile for voice.</li>
<li>CAC protects existing calls; WMM and DSCP trust must exist on every hop.</li>
<li>Avoid 2.4 GHz and, where possible, DFS channels for voice cells.</li>
</ul></div>
`,hi:`
<h3>Case 2: Summit Tower Hotel (fictional)</h3>
<p>Summit Tower 22 floors ka hotel hai. Housekeeping, security aur engineering staff Wi-Fi handsets rakhta hai, jaise Cisco 8821 class phones. Calls rooms, corridors, lifts, stairs aur basement kitchen mein chalni chahiye. Pehle ka Wi-Fi guest browsing ke liye design hua tha aur staff chalte waqt choppy audio aur call drops ki shikayat karta tha.</p>

<h3>Requirements</h3>
<ul>
<li>One-way delay 150 ms ya kam, jitter 30 ms ya kam aur packet loss 1 percent ya kam (common voice targets).</li>
<li>Har us point par jahan handset le jaya ja sakta hai, primary signal lagbhag -67 dBm aur SNR lagbhag 25 dB (typical voice design values).</li>
<li>Chalte waqt seamless roaming, koi sunai dene wala gap nahi.</li>
<li>Poori shift ki battery life.</li>
<li>Emergency calls ko floor aur zone tak locate kiya ja sake.</li>
</ul>

<h3>Constraints</h3>
<p>Har floor par heavy concrete lift aur stair core hai. Hotel sabse sasta design chahta hai jo phir bhi voice meet kare. Guests rooms mein usi building system par Wi-Fi expect karte hain. Purani floors par rooms tak cabling available nahi hai.</p>

<h3>Voice alag kyun hai</h3>
<p>Voice call har direction mein lagbhag 50 baar per second chhote packets bhejti hai (20 ms packetisation interval). Bandwidth bahut kam hai, lekin har packet ko apna medium access chahiye, isliye call asli <b>airtime</b> kharch karti hai. Voice retransmission storm ka intezaar nahi kar sakti, isliye kharab cell turant dikhti hai. Isiliye voice design mein stronger signal, higher minimum data rates, chhoti cells aur clean channels maange jate hain.</p>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Coverage</th><th>Cost</th><th>Voice risk</th></tr>
<tr><td><b>A. Sirf corridor APs</b></td><td>Rooms mein signal doors aur walls ke through aata hai</td><td>Sabse kam</td><td>Door rooms mein weak signal, lift core ka shadow</td></tr>
<tr><td><b>B. Har room ya do rooms par ek AP</b></td><td>Har jagah excellent</td><td>Sabse zyada</td><td>Power kam na karo to bahut co-channel cells</td></tr>
<tr><td><b>C. Corridor APs plus lift core par extra AP, 5 GHz voice SSID, survey se validated</b></td><td>Validation ke baad corridors aur rooms mein -67 dBm meet hota hai</td><td>Medium</td><td>Survey ke baad kam</td></tr>
</table>

<h3>Chosen design</h3>
<p>Summit option C chunta hai. Handset (ya sahi adapter) ke saath <b>voice-grade survey</b> har floor par -67 dBm aur SNR naapta hai. Voice ek dedicated SSID par sirf 5 GHz mein chalti hai, 802.11b rates disabled, low mandatory rate jaise 12 Mbps (typical choice) aur unneeded lower rates off. Cells lagbhag 20 percent overlap karti hain. Jahan possible ho plan voice floors par DFS channels avoid karta hai kyunki radar event channel change aur call gap karata hai.</p>

<h3>End-to-end QoS</h3>
<p>Quality of service har hop par mark aur trust honi chahiye. Voice ke liye WLAN QoS profile <b>Platinum</b> hai. Gold video ke liye, Silver best effort ke liye aur Bronze background ke liye.</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>802.11 UP</th><th>WMM class</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>6</td><td>AC_VO</td></tr>
<tr><td>Video</td><td>AF41 (34)</td><td>5</td><td>AC_VI</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>4</td><td>AC_VI</td></tr>
<tr><td>Best effort</td><td>0</td><td>0</td><td>AC_BE</td></tr>
<tr><td>Background</td><td>CS1 (8)</td><td>1</td><td>AC_BK</td></tr>
</table>
<p>AP port, uplink aur call server tak ka path DSCP trust karna chahiye. <b>WMM</b> on hona chahiye. <b>Call admission control (CAC)</b> cell ko overload hone se rokta hai: jab nayi call AP ko uske voice bandwidth budget se aage le jaye, to call refuse hoti hai ya handset doosre AP par jata hai, taaki har call kharab na ho. CAC un clients par depend karta hai jo TSPEC bhejte hain, aur iska use handset vendor guide se match hona chahiye.</p>
`+c+`
<div class="eg"><p><b>Worked example.</b> 22 floors par 60 staff handsets, peak par 25 percent call mein: poore hotel mein 15 calls. Per AP yeh bahut kam hai, isliye capacity issue nahi hai. Issue har point par signal aur roaming ka hai. Agar lobby mein 12 staff plus front desk phone hai aur shift change par chaar aur calls, to bhi akela lobby AP apne voice budget se kam calls carry karta hai, isliye wahan CAC shayad hi trigger hota hai. AP call limit vendor figures se confirm karo; woh typical planning numbers hain, promise nahi.</p></div>
<pre class="out">DESIGN WORKSHEET (example, not device output)
SSID voice-staff   band 5 GHz only   security 802.1X  FT adaptive
QoS profile        Platinum          WMM on           CAC voice on
Min data rate      12 Mbps           802.11b rates off
Cell overlap       about 20 percent  <span class="hl">primary -67 dBm, SNR 25 dB</span>
Switch ports       trust DSCP        PoE budget checked per AP
</pre>
<p>Battery life ke liye handsets power save (U-APSD) use karte hain. Voice SSID par multicast ke liye aggressive DTIM mat set karo, kyunki woh power-save wake-ups ko delay karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> 2.4 GHz voice on chhod dena, 1 aur 2 Mbps rates enabled rakhna jisse cell badi lekin slow ho jati hai, voice floor par har DFS channel on karna, aur yeh bhool jana ki wired switch DSCP ko zero par re-mark kar raha hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Strong signal kaafi nahi hai. Exam QoS marking, WMM, CAC, overlap aur voice survey ko saath mein check karta hai. Yaad rakho ki voice aur video markings alag hain: voice ke liye EF, video ke liye AF41.</p></div>

<h3>Post-mortem</h3>
<div class="scn"><h4>Lifts ke paas one-way audio</h4><p>Floor 14 par ek housekeeper caller ko sun rahi thi, lekin caller use nahi sun pa raha tha. Survey mein downlink -60 dBm tha, lekin handset uplink weak tha: lift core ne low-power handset signal ko attenuate kiya aur AP doosri taraf door tha. Engineer ne core ke paas ek AP add kiya, corridor APs ka power thoda kam kiya aur voice survey dobara chalaya. Uske baad lift lobby mein calls tik gayi.</p><p><b>Seekh:</b> sabse kamzor device, yaani client, ke liye design karo. Handset AP se kam transmit karta hai, isliye uplink pehle fail hota hai.</p></div>

<div class="iv"><p class="q">"Voice sahi se carry karne ke liye WLAN par kya configure karte ho?"</p><p>Strong answer: dedicated SSID, 5 GHz, Platinum QoS profile, WMM, CAC, wired path par DSCP trust, 802.11b rates off, suitable minimum rate, fast roaming ke liye 802.11k/v/r ya OKC, aur -67 dBm, 25 dB SNR aur lagbhag 20 percent overlap ke liye voice-grade survey.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice targets: 150 ms delay, 30 ms jitter, 1 percent loss.</li>
<li>Lagbhag -67 dBm aur 25 dB SNR, lagbhag 20 percent overlap ke saath design karo (typical).</li>
<li>Marking: voice EF aur UP 6, video AF41 aur UP 5; voice ke liye Platinum profile.</li>
<li>CAC maujooda calls ko bachata hai; WMM aur DSCP trust har hop par hona chahiye.</li>
<li>Voice cells ke liye 2.4 GHz aur, jahan possible ho, DFS channels avoid karo.</li>
</ul></div>
`}};export{l as default};