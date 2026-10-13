var e={id:`rf-diagnostics`,h:{en:`RF diagnostics: signal, noise, channels and coverage holes`,hi:`RF diagnostics: signal, noise, channels aur coverage holes`},body:{en:`
<p>Imagine two people talking in a hall. If one whispers, you cannot hear; if the hall is noisy, you cannot hear either; if many pairs shout on the same side, nobody hears anybody. Wi-Fi has the same three problems: <b>weak signal</b>, <b>high noise</b> and <b>too many talkers on one channel</b>. Many tickets that sound like "the controller is broken" are RF problems. This chapter shows how to prove it. RF design is the module wl-rf (and later wl-design); here we only diagnose.</p>

<h3>Numbers you must read</h3>
<dl class="terms">
<dt>RSSI</dt><dd>Received signal strength in dBm, always negative. Closer to zero is stronger: -50 dBm is excellent, -67 dBm is a common target for voice, -75 dBm is weak, -85 dBm is almost gone.</dd>
<dt>Noise floor</dt><dd>Background energy, often around -95 dBm in a clean 5 GHz space.</dd>
<dt>SNR</dt><dd>Signal-to-noise ratio in dB: RSSI minus noise floor. Example: -60 dBm signal with -95 dBm noise gives 35 dB. A common design target is 25 dB or more for voice and video; below 15 dB many clients struggle.</dd>
<dt>Co-channel interference</dt><dd>Two APs in earshot on the same channel must take turns to speak. Throughput halves even though both signals are strong.</dd>
<dt>Adjacent-channel interference</dt><dd>APs on overlapping channels (for example 2.4 GHz channels 1 and 3) corrupt each other. In 2.4 GHz only channels 1, 6 and 11 do not overlap in most domains.</dd>
</dl>
<div class="eg"><p><b>Worked example (dB maths).</b> Every 3 dB change doubles or halves power; 10 dB is ten times. If an AP lowers its transmit power from 20 dBm to 14 dBm that is 6 dB, so the power is four times smaller (two halvings). A client that heard -62 dBm now hears about -68 dBm, crossing the voice target of -67 dBm. A small power change can be the whole fault.</p></div>

<h3>The diagnostic questions</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="RF questions">
<rect x="10" y="20" width="195" height="100" rx="8" fill="#bae6fd"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Signal?</text><text x="107" y="72" text-anchor="middle" class="svg-muted" font-size="12">RSSI at the client</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">AP power, distance</text>
<rect x="222" y="20" width="195" height="100" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Noise?</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">SNR, interferers</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">CleanAir (concept)</text>
<rect x="435" y="20" width="195" height="100" rx="8" fill="#bbf7d0"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Sharing?</text><text x="532" y="72" text-anchor="middle" class="svg-muted" font-size="12">channels, neighbours</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">client count per radio</text>
</svg><p class="cap">Three questions cover most RF tickets: is the signal strong, is it clean, and is the air shared fairly.</p></div>

<h3>What the lab lets you check</h3>
<p>The lab model has a real RF engine: RSSI by distance, channel overlap and per-band radios. These commands are available (and the same names exist on the real platform):</p>
<pre class="code">WLC1# show ap dot11 5ghz summary
WLC1# show ap dot11 24ghz summary
WLC1# show ap rf-profile summary
WLC1# ap name AP1 dot11 5ghz channel 36
WLC1# ap name AP1 dot11 5ghz txpower 3
LAPTOP1# wifi status</pre>
<pre class="out">LAPTOP1# wifi status
SSID        : NK-STAFF
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : <span class="hl">-71 dBm</span>
Security    : WPA2-PSK
IP address  : 10.10.20.21/24 (DHCP)</pre>
<p>Reading it: the client is associated and has an address, so stages 1 to 5 passed. At -71 dBm it is near the edge: expect low data rates and retries. The cure is design (AP placement, power, a closer AP), not a password or policy change.</p>
<p>GUI: <b>Monitoring &gt; Wireless &gt; Radios</b> and <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b>.</p>

<h3>Typical RF symptoms and what they prove</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>Works near the AP, drops in the corridor</td><td>Coverage hole, power too low</td><td>RSSI by location, AP power and RF profile</td></tr>
<tr><td>Strong signal but slow</td><td>Co-channel interference or high load</td><td>Channel plan, clients per radio</td></tr>
<tr><td>2.4 GHz poor, 5 GHz fine</td><td>Overlap, microwave, Bluetooth</td><td>Channels 1, 6, 11; interference reports</td></tr>
<tr><td>Voice choppy while roaming</td><td>Weak cell edge, late roam</td><td>RSSI at roam point (module wl-roaming)</td></tr>
<tr><td>Whole band missing on an AP</td><td>Radio shut or RF profile shut</td><td><code>show ap dot11 5ghz summary</code>, RF profile</td></tr>
<tr><td>AP joined but no radios</td><td>Country mismatch</td><td>Join detail: regulatory check (chapter 8)</td></tr></table>

<h3>Spectrum analysis and counters (concept only)</h3>
<p>Real networks add tools the lab does not simulate. <b>CleanAir</b> uses a spectrum chip in the AP to classify interferers (microwave oven, Bluetooth, DECT phone, video bridge) and report an air-quality index. Per-radio counters show channel utilisation, retry rate and packet loss. A client-side Wi-Fi analyser app gives RSSI and channel maps. Retry rate above about 15 to 20 percent usually means RF trouble rather than a configuration fault. These are described here only; the lab does not model them, and RRM channel and power choices are deterministic in the lab.</p>

<div class="warn"><p><b>Common mistake.</b> Raising transmit power on one AP to "fix" a corridor. The client can then hear the AP but the AP cannot hear the client's weaker transmitter, giving a one-way link. Raise coverage by adding or moving APs, and match power to the client's capability.</p></div>
<div class="exam"><p><b>Exam trap.</b> Co-channel interference is cured by a better channel plan (or lower power), not by more power. Also, on 2.4 GHz the three non-overlapping channels are 1, 6 and 11; there are 25 non-overlapping 20 MHz channels in 5 GHz when all sub-bands (including DFS) are allowed.</p></div>

<div class="scn"><h4>Fast Wi-Fi, slow in the meeting room</h4><p>A meeting room with 40 laptops showed -48 dBm signal yet slow video calls. One AP carried all 40 clients, and the neighbouring AP shared its channel. Moving the neighbour to a different channel and adding a second AP in the room halved the load. No controller setting was wrong.</p><p><b>Lesson:</b> strong signal does not mean good Wi-Fi; check sharing and load.</p></div>

<div class="iv"><p class="q">"Users complain about slow Wi-Fi. How do you tell if it is RF?"</p><p>I read RSSI and SNR at the client, then channel and neighbour APs, then clients per radio. If the client authenticates and gets an IP quickly but throughput is poor and signal is weak or the channel shared, it is RF. I confirm with retry and utilisation counters and a spectrum view such as CleanAir.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check signal (RSSI), noise (SNR) and sharing (channels, load).</li>
<li>3 dB doubles or halves power; 10 dB is ten times.</li>
<li>Associated plus slow usually points at RF, not at AAA or policy.</li>
<li>Co-channel is cured by channel plan or lower power, not higher power.</li>
<li>CleanAir, utilisation and retry counters are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Hall mein do log baat kar rahe hain, socho. Ek dheere bole to sunai nahi deta; hall shor se bhara ho to bhi nahi; ek taraf kai jodiyan chillayein to koi kisi ko nahi sunta. Wi-Fi ki yahi teen problems hain: <b>weak signal</b>, <b>high noise</b> aur <b>ek channel par bahut saare bolne wale</b>. "Controller kharab hai" jaise sunai dene wale kai tickets RF problems hote hain. Yeh chapter prove karna sikhata hai. RF design module wl-rf (aur baad mein wl-design) hai; yahan hum sirf diagnose karte hain.</p>

<h3>Jo numbers padhne hain</h3>
<dl class="terms">
<dt>RSSI</dt><dd>dBm mein received signal strength, hamesha negative. Zero ke paas matlab strong: -50 dBm excellent, -67 dBm voice ke liye common target, -75 dBm weak, -85 dBm lagbhag gaya.</dd>
<dt>Noise floor</dt><dd>Background energy, saaf 5 GHz space mein aksar -95 dBm ke aaspaas.</dd>
<dt>SNR</dt><dd>dB mein signal-to-noise ratio: RSSI minus noise floor. Example: -60 dBm signal aur -95 dBm noise se 35 dB. Voice aur video ke liye common design target 25 dB ya zyada; 15 dB se neeche kai clients struggle karte hain.</dd>
<dt>Co-channel interference</dt><dd>Ek hi channel par kaan ke andar wale do APs ko baari-baari bolna padta hai. Dono ke signal strong hon tab bhi throughput aadha ho jata hai.</dd>
<dt>Adjacent-channel interference</dt><dd>Overlapping channels wale APs (jaise 2.4 GHz channels 1 aur 3) ek doosre ko corrupt karte hain. 2.4 GHz mein zyadatar domains mein sirf channels 1, 6 aur 11 overlap nahi karte.</dd>
</dl>
<div class="eg"><p><b>Worked example (dB maths).</b> Har 3 dB ka change power ko double ya half karta hai; 10 dB dus guna. Agar AP transmit power 20 dBm se 14 dBm karta hai to woh 6 dB hai, yaani power chaar guna kam (do baar half). Jo client -62 dBm sunta tha ab lagbhag -68 dBm sunta hai, voice target -67 dBm paar. Chhota power change poora fault ho sakta hai.</p></div>

<h3>Diagnostic sawaal</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="RF questions">
<rect x="10" y="20" width="195" height="100" rx="8" fill="#bae6fd"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Signal?</text><text x="107" y="72" text-anchor="middle" class="svg-muted" font-size="12">client par RSSI</text><text x="107" y="92" text-anchor="middle" class="svg-muted" font-size="12">AP power, doori</text>
<rect x="222" y="20" width="195" height="100" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Noise?</text><text x="320" y="72" text-anchor="middle" class="svg-muted" font-size="12">SNR, interferers</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">CleanAir (concept)</text>
<rect x="435" y="20" width="195" height="100" rx="8" fill="#bbf7d0"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Sharing?</text><text x="532" y="72" text-anchor="middle" class="svg-muted" font-size="12">channels, padosi</text><text x="532" y="92" text-anchor="middle" class="svg-muted" font-size="12">radio par clients</text>
</svg><p class="cap">Teen sawaal zyadatar RF tickets cover karte hain: signal strong hai, saaf hai, aur hawa barabar baanti ja rahi hai?</p></div>

<h3>Lab mein kya check kar sakte ho</h3>
<p>Lab model ka asli RF engine hai: doori se RSSI, channel overlap aur per-band radios. Yeh commands available hain (aur real platform par bhi yahi naam hain):</p>
<pre class="code">WLC1# show ap dot11 5ghz summary
WLC1# show ap dot11 24ghz summary
WLC1# show ap rf-profile summary
WLC1# ap name AP1 dot11 5ghz channel 36
WLC1# ap name AP1 dot11 5ghz txpower 3
LAPTOP1# wifi status</pre>
<pre class="out">LAPTOP1# wifi status
SSID        : NK-STAFF
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : <span class="hl">-71 dBm</span>
Security    : WPA2-PSK
IP address  : 10.10.20.21/24 (DHCP)</pre>
<p>Padhna: client associated hai aur address bhi hai, to stages 1 se 5 pass. -71 dBm par woh edge ke paas hai: low data rates aur retries expect karo. Ilaaj design hai (AP placement, power, paas ka AP), password ya policy change nahi.</p>
<p>GUI: <b>Monitoring &gt; Wireless &gt; Radios</b> aur <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b>.</p>

<h3>Typical RF symptoms aur woh kya prove karte hain</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>AP ke paas chalta hai, corridor mein drop</td><td>Coverage hole, power kam</td><td>Location ke hisaab se RSSI, AP power aur RF profile</td></tr>
<tr><td>Signal strong lekin slow</td><td>Co-channel interference ya high load</td><td>Channel plan, radio par clients</td></tr>
<tr><td>2.4 GHz kharab, 5 GHz theek</td><td>Overlap, microwave, Bluetooth</td><td>Channels 1, 6, 11; interference reports</td></tr>
<tr><td>Roam karte waqt voice choppy</td><td>Weak cell edge, late roam</td><td>Roam point par RSSI (module wl-roaming)</td></tr>
<tr><td>AP par poora band gayab</td><td>Radio ya RF profile shut</td><td><code>show ap dot11 5ghz summary</code>, RF profile</td></tr>
<tr><td>AP joined lekin radios nahi</td><td>Country mismatch</td><td>Join detail: regulatory check (chapter 8)</td></tr></table>

<h3>Spectrum analysis aur counters (concept only)</h3>
<p>Real networks mein aise tools hote hain jo lab simulate nahi karta. <b>CleanAir</b> AP ki spectrum chip se interferers (microwave oven, Bluetooth, DECT phone, video bridge) classify karta hai aur air-quality index report karta hai. Per-radio counters channel utilisation, retry rate aur packet loss dikhate hain. Client-side Wi-Fi analyser app RSSI aur channel maps deta hai. Lagbhag 15 se 20 percent se upar retry rate aam taur par configuration fault nahi, RF trouble hota hai. Yeh sirf yahan describe kiye hain; lab inhe model nahi karta, aur lab mein RRM channel aur power choices deterministic hain.</p>

<div class="warn"><p><b>Common mistake.</b> Corridor "fix" karne ke liye ek AP ka transmit power badhana. Client AP ko sun sakta hai lekin AP client ke kamzor transmitter ko nahi sun paata, to one-way link banta hai. Coverage AP jodkar ya hilakar badhao, aur power ko client ki capability se match karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Co-channel interference ka ilaaj behtar channel plan (ya kam power) hai, zyada power nahi. Aur 2.4 GHz mein teen non-overlapping channels 1, 6 aur 11 hain; 5 GHz mein sab sub-bands (DFS samet) allowed hon to 25 non-overlapping 20 MHz channels hain.</p></div>

<div class="scn"><h4>Fast Wi-Fi, meeting room mein slow</h4><p>40 laptops wale meeting room mein -48 dBm signal tha phir bhi video calls slow. Ek AP par saare 40 clients the, aur padosi AP uska channel share karta tha. Padosi ko alag channel par karke aur room mein doosra AP jodkar load aadha ho gaya. Controller ki koi setting galat nahi thi.</p><p><b>Lesson:</b> strong signal ka matlab achha Wi-Fi nahi; sharing aur load check karo.</p></div>

<div class="iv"><p class="q">"Users slow Wi-Fi ki complaint karte hain. Kaise pata karoge ki RF hai?"</p><p>Client par RSSI aur SNR padhta hoon, phir channel aur padosi APs, phir radio par clients. Agar client jaldi authenticate karke IP le leta hai lekin throughput kharab hai aur signal weak ya channel shared hai, to RF hai. Retry aur utilisation counters aur CleanAir jaise spectrum view se confirm karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Signal (RSSI), noise (SNR) aur sharing (channels, load) check karo.</li>
<li>3 dB power double ya half karta hai; 10 dB dus guna.</li>
<li>Associated plus slow aam taur par RF ki taraf point karta hai, AAA ya policy ki taraf nahi.</li>
<li>Co-channel ka ilaaj channel plan ya kam power hai, zyada power nahi.</li>
<li>CleanAir, utilisation aur retry counters lab mein concept only hain.</li>
</ul></div>
`}};export{e as default};