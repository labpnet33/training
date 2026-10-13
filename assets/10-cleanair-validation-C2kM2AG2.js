var e={id:`cleanair-validation`,h:{en:`CleanAir, spectrum analysis, validation and handover`,hi:`CleanAir, spectrum analysis, validation aur handover`},body:{en:`
<p>Wi-Fi frames are only part of what is in the air. Microwave ovens, Bluetooth, cordless phones, wireless cameras and jammers all put energy into the same bands but are not Wi-Fi, so an AP cannot decode them and a normal survey tool cannot name them. This chapter covers <b>CleanAir and spectrum analysis</b>, then how to <b>validate and hand over</b> a design. CleanAir hardware and real survey tools are <b>concept only</b> in the lab; the commands shown are for orientation and the outputs are illustrations.</p>

<h3>Analogy: a doctor with only a thermometer versus one with an X-ray</h3>
<p>A normal Wi-Fi view measures retries, RSSI and utilisation, like a thermometer: it tells you something is wrong. A spectrum view is the X-ray: it shows <i>what</i> is wrong and where.</p>

<h3>What CleanAir is</h3>
<p><b>CleanAir</b> is spectrum intelligence built into the radio chip of supported Cisco APs. While the AP serves clients it also samples the spectrum, classifies non-Wi-Fi energy by signature, and reports it to the controller. You do not need a separate spectrum analyser on a laptop for day-to-day work, and the AP sees what the clients see.</p>
<table class="cmp"><tr><th>Concept</th><th>Meaning</th></tr>
<tr><td><b>Interferer classification</b></td><td>Names the device type: microwave oven, Bluetooth, DECT or other cordless phone, video camera or bridge, jammer, continuous transmitter, and others.</td></tr>
<tr><td><b>Duty cycle</b></td><td>Percentage of time the interferer is transmitting. A 10 percent device is a nuisance; 80 percent is an outage.</td></tr>
<tr><td><b>Severity</b></td><td>How much damage the interferer does to Wi-Fi on that channel (index).</td></tr>
<tr><td><b>Air Quality Index (AQI)</b></td><td>Per radio and channel score from 100 (perfect) down to 1 (unusable) that combines interference and its duty cycle. The alarm threshold is configurable and low by default.</td></tr>
<tr><td><b>Persistent device avoidance</b></td><td>Remembers devices that appear on a schedule (a canteen microwave) and steers channels away before they start.</td></tr>
<tr><td><b>Event-driven RRM</b></td><td>When the AQI of a channel drops below its limit, RRM changes channel at once instead of waiting for the next DCA interval (chapter 9).</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Spectrum view with Wi-Fi and a non-Wi-Fi interferer">
<rect x="10" y="10" width="620" height="120" rx="6" fill="#f1f5f9" stroke="#64748b"/>
<path d="M20 120 H120 L140 40 L200 40 L220 120 H330 L350 40 L410 40 L430 120 H620" fill="#bae6fd" fill-opacity="0.8" stroke="#64748b"/>
<path d="M170 120 L180 70 L195 120 Z" fill="#fed7aa" stroke="#64748b"/>
<path d="M455 120 C470 20 560 20 575 120 Z" fill="#fde68a" fill-opacity="0.9" stroke="#64748b"/>
<text x="170" y="32" text-anchor="middle" class="svg-ink" font-size="12">Wi-Fi ch 1</text><text x="380" y="32" text-anchor="middle" class="svg-ink" font-size="12">Wi-Fi ch 6</text>
<text x="515" y="18" text-anchor="middle" class="svg-ink" font-size="12">microwave oven</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">2.4 GHz energy over frequency: a normal AP sees only frames, a spectrum view sees the oven</text>
</svg><p class="cap">The microwave oven cannot be decoded as Wi-Fi, but it is clearly visible in the spectrum and hurts the upper channels.</p></div>

<h3>CleanAir modes and relatives</h3>
<ul>
<li><b>Local mode AP:</b> serves clients and monitors spectrum in short samples. Good for most installs.</li>
<li><b>Monitor mode AP</b> or a dedicated sensor: spends all its time listening; used for deep analysis, rogue detection and troubleshooting.</li>
<li><b>Spectrum Intelligence (SI):</b> a lighter feature on some older APs that finds only a few interferer types.</li>
<li><b>Spectrum analyser software with a survey adapter:</b> the Layer 1 survey of chapter 2.</li>
</ul>

<h3>Turning it on and reading it</h3>
<p>CleanAir is enabled per band on the controller, and RRM can use its reports. Typical forms on the 9800 (exact syntax varies by release; not simulated in the lab):</p>
<pre class="code">WLC1(config)# ap dot11 24ghz cleanair
WLC1(config)# ap dot11 5ghz cleanair
WLC1# show ap dot11 24ghz cleanair air-quality summary
WLC1# show ap dot11 24ghz cleanair device type all</pre>
<p>GUI: the CleanAir pages sit under the radio configuration and the monitoring menus on the real controller; the lab has none. Output looks like this (illustration only):</p>
<pre class="out">AP Name   Channel   Avg AQ   Min AQ   Interferers   DC(%)
AP2       6         <span class="hl">42</span>       31       1             64
AP3       11        96       91       0             0
AP4       1         93       88       0             0</pre>
<p>AP2 has an air quality of 42 and a 64 percent duty-cycle interferer on channel 6. An operator would then read the device list (for example, a microwave oven near AP2), and either remove the device or move AP2 to 5 GHz or to a channel away from the oven.</p>

<h3>Validation: proving the design</h3>
<p>The design is finished only when measurements match the written targets from chapter 1. A validation (post-deployment) survey checks, in this order:</p>
<ol>
<li><b>Coverage:</b> RSSI and SNR at or above target everywhere, with the AP list and channel plan matching the design.</li>
<li><b>Interference:</b> co-channel AP count, utilisation, noise floor, CleanAir or Layer 1 findings.</li>
<li><b>Active tests:</b> throughput, retries, latency and packet loss to a test server through the real SSID.</li>
<li><b>Roaming:</b> walk the main paths with a voice test, including stairwells, lifts and floor changes. Count gaps and time each roam.</li>
<li><b>Failure tests:</b> power off one AP and confirm the neighbours cover its area (N+1), and fail over the controller (<code>wl-mobility</code> covers SSO and N+1 design, which belong to the HA and mobility blueprint areas).</li>
<li><b>Edge cases:</b> guest, IoT, voice SSIDs, and every client type from the requirements list.</li>
</ol>
<p>In the lab, the same evidence appears as <code>show ap dot11 5ghz summary</code> (channel, power, width), <code>show ap dot11 5ghz coverage</code> (clients below threshold) and <code>wifi link</code> on the client (band, RSSI, rate).</p>

<h3>Handover to operations</h3>
<ul>
<li>As-built drawing with AP names, models, antennas, heights and mounting.</li>
<li>Channel plan, power plan and RF profiles, tags, SSID and VLAN map, with the reasons.</li>
<li>Survey data and the acceptance report signed against the targets.</li>
<li>Baseline numbers (utilisation, retries, client counts) to compare in six months.</li>
<li>RRM settings and a change process: who may change channels, power or rates, and how.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Validating in an empty building; testing only with a laptop and not with the real handset; ignoring non-Wi-Fi energy; skipping the failure test; delivering without documentation.</p></div>
<div class="exam"><p><b>Exam trap.</b> CleanAir detects <b>non-Wi-Fi</b> interferers; rogue APs are Wi-Fi and are found by other features. AQI 100 is the best, not the worst. Passive survey for coverage and interference, active for performance and roaming.</p></div>

<div class="scn"><h4>The canteen microwave</h4><p>Every day at 12:30 the Wi-Fi in the canteen corner slowed to a crawl for 20 minutes. Retries were high but RSSI was perfect. CleanAir showed a microwave oven with a 60 percent duty cycle on channel 11 and persistent device avoidance learned the pattern. The team moved the canteen APs to 5 GHz and pushed 2.4 GHz-only handhelds to channel 1.</p><p><b>Lesson:</b> perfect signal with high retries often means non-Wi-Fi interference.</p></div>

<div class="iv"><p class="q">"Wi-Fi is slow at lunchtime in one area, RSSI is fine. How do you investigate?"</p><p>Check utilisation, retries and noise, then look at spectrum: CleanAir interferer list and AQI for the area, or a Layer 1 survey. Identify the device (microwave, Bluetooth, camera), then remove it, shield it or move APs and clients to 5 GHz or a different channel. Mention event-driven RRM and persistent device avoidance.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CleanAir classifies non-Wi-Fi interferers in the AP and reports duty cycle, severity and AQI (100 is best).</li>
<li>Event-driven RRM reacts at once; persistent device avoidance learns schedules.</li>
<li>Validation compares measurements with written targets: coverage, interference, active tests, roaming, failure tests.</li>
<li>Handover includes as-builts, plans, survey data, baselines and a change process.</li>
<li>Perfect RSSI with high retries suggests non-Wi-Fi interference.</li>
</ul></div>
`,hi:`
<p>Wi-Fi frames hawa mein maujood cheezon ka sirf ek hissa hain. Microwave ovens, Bluetooth, cordless phones, wireless cameras aur jammers sab usi bands mein energy daalte hain lekin Wi-Fi nahi hain, isliye AP unhe decode nahi kar sakta aur normal survey tool unka naam nahi bata sakta. Yeh chapter <b>CleanAir aur spectrum analysis</b> cover karta hai, phir design ko <b>validate aur handover</b> kaise karte hain. CleanAir hardware aur real survey tools lab mein <b>concept only</b> hain; dikhaye gaye commands orientation ke liye hain aur outputs illustrations hain.</p>

<h3>Analogy: sirf thermometer wala doctor versus X-ray wala doctor</h3>
<p>Normal Wi-Fi view retries, RSSI aur utilisation naapta hai, thermometer ki tarah: batata hai ki kuch gadbad hai. Spectrum view X-ray hai: dikhata hai ki <i>kya</i> gadbad hai aur kahan.</p>

<h3>CleanAir kya hai</h3>
<p><b>CleanAir</b> supported Cisco APs ke radio chip mein bana spectrum intelligence hai. AP clients serve karte hue spectrum ke samples bhi leta hai, non-Wi-Fi energy ko signature se classify karta hai, aur controller ko report karta hai. Rozmarra ke kaam ke liye laptop par alag spectrum analyser nahi chahiye, aur AP wahi dekhta hai jo clients dekhte hain.</p>
<table class="cmp"><tr><th>Concept</th><th>Matlab</th></tr>
<tr><td><b>Interferer classification</b></td><td>Device type ka naam batata hai: microwave oven, Bluetooth, DECT ya doosra cordless phone, video camera ya bridge, jammer, continuous transmitter, aur doosre.</td></tr>
<tr><td><b>Duty cycle</b></td><td>Interferer kitne percent time transmit karta hai. 10 percent device pareshani hai; 80 percent outage hai.</td></tr>
<tr><td><b>Severity</b></td><td>Interferer us channel par Wi-Fi ko kitna nuksan karta hai (index).</td></tr>
<tr><td><b>Air Quality Index (AQI)</b></td><td>Per radio aur channel score, 100 (perfect) se 1 (unusable) tak, jo interference aur uska duty cycle milata hai. Alarm threshold configurable hai aur default mein low hai.</td></tr>
<tr><td><b>Persistent device avoidance</b></td><td>Schedule par aane wale devices (canteen microwave) ko yaad rakhta hai aur unke shuru hone se pehle channels door kar deta hai.</td></tr>
<tr><td><b>Event-driven RRM</b></td><td>Jab channel ka AQI limit se neeche girta hai, RRM agle DCA interval ka intezaar kiye bina turant channel badal deta hai (chapter 9).</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Wi-Fi aur non-Wi-Fi interferer wala spectrum view">
<rect x="10" y="10" width="620" height="120" rx="6" fill="#f1f5f9" stroke="#64748b"/>
<path d="M20 120 H120 L140 40 L200 40 L220 120 H330 L350 40 L410 40 L430 120 H620" fill="#bae6fd" fill-opacity="0.8" stroke="#64748b"/>
<path d="M170 120 L180 70 L195 120 Z" fill="#fed7aa" stroke="#64748b"/>
<path d="M455 120 C470 20 560 20 575 120 Z" fill="#fde68a" fill-opacity="0.9" stroke="#64748b"/>
<text x="170" y="32" text-anchor="middle" class="svg-ink" font-size="12">Wi-Fi ch 1</text><text x="380" y="32" text-anchor="middle" class="svg-ink" font-size="12">Wi-Fi ch 6</text>
<text x="515" y="18" text-anchor="middle" class="svg-ink" font-size="12">microwave oven</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">frequency par 2.4 GHz energy: normal AP sirf frames dekhta hai, spectrum view oven dekhta hai</text>
</svg><p class="cap">Microwave oven ko Wi-Fi ki tarah decode nahi kiya ja sakta, lekin spectrum mein saaf dikhta hai aur upar ke channels ko nuksan pahunchata hai.</p></div>

<h3>CleanAir modes aur rishtedaar</h3>
<ul>
<li><b>Local mode AP:</b> clients serve karta hai aur chhote samples mein spectrum monitor karta hai. Zyada tar installs ke liye achha.</li>
<li><b>Monitor mode AP</b> ya dedicated sensor: poora time sunne mein lagata hai; deep analysis, rogue detection aur troubleshooting ke liye.</li>
<li><b>Spectrum Intelligence (SI):</b> kuch purane APs par halka feature jo sirf kuch interferer types dhoondta hai.</li>
<li><b>Survey adapter ke saath spectrum analyser software:</b> chapter 2 ka Layer 1 survey.</li>
</ul>

<h3>Ise on karna aur padhna</h3>
<p>CleanAir controller par per band enable hota hai, aur RRM uski reports use kar sakta hai. 9800 par typical forms (exact syntax release ke hisaab se badalta hai; lab mein simulate nahi):</p>
<pre class="code">WLC1(config)# ap dot11 24ghz cleanair
WLC1(config)# ap dot11 5ghz cleanair
WLC1# show ap dot11 24ghz cleanair air-quality summary
WLC1# show ap dot11 24ghz cleanair device type all</pre>
<p>GUI: CleanAir pages real controller par radio configuration aur monitoring menus ke andar hain; lab mein nahi hain. Output aisa dikhta hai (sirf illustration):</p>
<pre class="out">AP Name   Channel   Avg AQ   Min AQ   Interferers   DC(%)
AP2       6         <span class="hl">42</span>       31       1             64
AP3       11        96       91       0             0
AP4       1         93       88       0             0</pre>
<p>AP2 ka air quality 42 hai aur channel 6 par 64 percent duty-cycle interferer hai. Operator phir device list padhega (jaise AP2 ke paas microwave oven), aur ya to device hatayega ya AP2 ko 5 GHz par ya oven se door channel par le jayega.</p>

<h3>Validation: design ko prove karna</h3>
<p>Design tabhi khatam hota hai jab measurements chapter 1 ke likhe targets se match karein. Validation (post-deployment) survey is order mein check karta hai:</p>
<ol>
<li><b>Coverage:</b> har jagah RSSI aur SNR target par ya behtar, AP list aur channel plan design se match.</li>
<li><b>Interference:</b> co-channel AP count, utilisation, noise floor, CleanAir ya Layer 1 findings.</li>
<li><b>Active tests:</b> asli SSID ke through test server tak throughput, retries, latency aur packet loss.</li>
<li><b>Roaming:</b> voice test ke saath mukhya raaston par chalo, stairwells, lifts aur floor changes sahit. Gaps ginon aur har roam ka time naapo.</li>
<li><b>Failure tests:</b> ek AP band karo aur confirm karo ki padosi uska area cover karte hain (N+1), aur controller failover karo (<code>wl-mobility</code> SSO aur N+1 design cover karta hai, jo HA aur mobility blueprint areas ke hain).</li>
<li><b>Edge cases:</b> guest, IoT, voice SSIDs, aur requirements list ka har client type.</li>
</ol>
<p>Lab mein wahi evidence <code>show ap dot11 5ghz summary</code> (channel, power, width), <code>show ap dot11 5ghz coverage</code> (threshold se neeche clients) aur client par <code>wifi link</code> (band, RSSI, rate) ke roop mein aata hai.</p>

<h3>Operations ko handover</h3>
<ul>
<li>AP names, models, antennas, heights aur mounting ke saath as-built drawing.</li>
<li>Channel plan, power plan aur RF profiles, tags, SSID aur VLAN map, wajah ke saath.</li>
<li>Survey data aur targets ke against sign hui acceptance report.</li>
<li>Baseline numbers (utilisation, retries, client counts) jo chhe mahine baad compare ho sakein.</li>
<li>RRM settings aur change process: channels, power ya rates kaun badal sakta hai aur kaise.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Khaali building mein validate karna; sirf laptop se test karna aur real handset se nahi; non-Wi-Fi energy ignore karna; failure test skip karna; documentation ke bina deliver karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> CleanAir <b>non-Wi-Fi</b> interferers detect karta hai; rogue APs Wi-Fi hain aur doosre features se milte hain. AQI 100 sabse achha hai, sabse kharab nahi. Coverage aur interference ke liye passive survey, performance aur roaming ke liye active.</p></div>

<div class="scn"><h4>Canteen ka microwave</h4><p>Roz 12:30 baje canteen corner ka Wi-Fi 20 minute ke liye rengne laga. Retries zyada the lekin RSSI perfect tha. CleanAir ne channel 11 par 60 percent duty cycle wala microwave oven dikhaya aur persistent device avoidance ne pattern seekh liya. Team ne canteen APs ko 5 GHz par move kiya aur 2.4 GHz-only handhelds ko channel 1 par dhakela.</p><p><b>Seekh:</b> perfect signal ke saath zyada retries aksar non-Wi-Fi interference ka matlab hota hai.</p></div>

<div class="iv"><p class="q">"Ek area mein lunchtime par Wi-Fi slow hai, RSSI theek hai. Aap kaise investigate karoge?"</p><p>Utilisation, retries aur noise check karo, phir spectrum dekho: us area ki CleanAir interferer list aur AQI, ya Layer 1 survey. Device pehchano (microwave, Bluetooth, camera), phir use hatao, shield karo ya APs aur clients ko 5 GHz ya alag channel par le jao. Event-driven RRM aur persistent device avoidance ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CleanAir AP mein non-Wi-Fi interferers classify karta hai aur duty cycle, severity aur AQI (100 sabse achha) report karta hai.</li>
<li>Event-driven RRM turant react karta hai; persistent device avoidance schedules seekhta hai.</li>
<li>Validation measurements ko likhe targets se compare karta hai: coverage, interference, active tests, roaming, failure tests.</li>
<li>Handover mein as-builts, plans, survey data, baselines aur change process shamil hain.</li>
<li>Perfect RSSI ke saath high retries non-Wi-Fi interference ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};