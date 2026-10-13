var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have moved from the physics of radio to a working RF design on the controller. This last chapter pulls everything together: a can-do checklist, a mini glossary, the most tested facts, and a command cheat-sheet you can re-read before an interview or an exam.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="10" y="30" width="110" height="70" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">Bands</text><text x="65" y="80" text-anchor="middle" class="svg-muted" font-size="11">2.4 / 5 / 6 GHz</text>
<rect x="135" y="30" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="13">Signal</text><text x="190" y="80" text-anchor="middle" class="svg-muted" font-size="11">dBm, SNR, rates</text>
<rect x="260" y="30" width="110" height="70" rx="8" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interference</text><text x="315" y="80" text-anchor="middle" class="svg-muted" font-size="11">CCI, ACI, noise</text>
<rect x="385" y="30" width="110" height="70" rx="8" fill="#fed7aa"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="13">Power</text><text x="440" y="80" text-anchor="middle" class="svg-muted" font-size="11">cells, levels</text>
<rect x="510" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">Profiles, tags</text><text x="570" y="80" text-anchor="middle" class="svg-muted" font-size="11">RF profile, RF tag</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Understand, design, configure, verify, troubleshoot</text>
</svg><p class="cap">The five building blocks of this module.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready when you can do each of these without notes:</p>
<ul>
<li>Name the three Wi-Fi bands, their approximate channels and one strength and weakness of each.</li>
<li>List the non-overlapping 2.4 GHz channels (1, 6, 11) and explain why.</li>
<li>Calculate SNR from RSSI and the noise floor, and use the rules of 3 and 10.</li>
<li>Explain co-channel and adjacent-channel interference, and say which is usually worse.</li>
<li>Explain why too much AP power hurts (overlap, asymmetry, sticky clients).</li>
<li>Convert between the lab's power levels and dBm (level 1 is 20 dBm, 3 dB per step).</li>
<li>Describe DCA, TPC and CHD, and say they are concept only in the lab.</li>
<li>Describe the RF profile and RF tag model and the default RF tag.</li>
<li>Pin a 2.4 GHz channel with <code>ap name AP1 dot11 24ghz channel 1</code> and read the result.</li>
<li>Build CAMPUS-5 with tx-power max 14, RF-CAMPUS, and tag both APs.</li>
<li>Diagnose a shut down RF profile that switched a band off, and repair it.</li>
<li>Prove a fix from the client with <code>wifi status</code> and <code>ping 10.10.60.20</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm</dt><dd>Power relative to 1 mW on a log scale; 20 dBm is 100 mW.</dd>
<dt>RSSI</dt><dd>Receiver's measure of received signal strength, read as dBm.</dd>
<dt>Noise floor</dt><dd>Background radio noise, typically about -95 dBm in a quiet room.</dd>
<dt>SNR</dt><dd>Signal minus noise floor in dB; drives the data rate.</dd>
<dt>CCI</dt><dd>Co-channel interference: APs on the same channel share airtime.</dd>
<dt>ACI</dt><dd>Adjacent-channel interference: overlapping different channels corrupt frames.</dd>
<dt>CSMA/CA</dt><dd>Listen before talk; only one transmitter per channel at a time.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection; radar avoidance on some 5 GHz channels.</dd>
<dt>RRM</dt><dd>Radio Resource Management: DCA (channels), TPC (power), CHD (coverage holes).</dd>
<dt>RF profile</dt><dd>Per-band radio settings object (lab: tx-power max, shutdown state).</dd>
<dt>RF tag</dt><dd>Bundle of a 2.4 and a 5 GHz RF profile assigned to APs.</dd>
<dt>Power level</dt><dd>1 to 8 on the AP; 1 is highest; about 3 dB per step.</dd>
<dt>MCS</dt><dd>Modulation and coding scheme; faster at higher SNR.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>2.4 GHz non-overlapping channels are 1, 6 and 11 (20 MHz). 5 GHz at 20 MHz has many non-overlapping channels.</li>
<li>5 GHz has about 6 dB more path loss than 2.4 GHz, so smaller cells.</li>
<li>+3 dB doubles power, +10 dB multiplies by ten.</li>
<li>Judge a link by SNR, not RSSI alone; low-rate frames cost the most airtime.</li>
<li>Adjacent-channel interference is generally worse than co-channel interference.</li>
<li>Power level 1 is the highest; a larger level number means less power.</li>
<li>A new RF profile starts shut down; a shut down profile turns that band off for tagged APs.</li>
<li>An RF tag has two slots (2.4 and 5 GHz); the AP gets the tag, not the profile.</li>
<li>An AP with no RF tag uses the default RF tag.</li>
<li>Real RRM (DCA, TPC, CHD) and data-rate controls are concepts in the lab; channels are deterministic.</li>
</ol>

<h3>Command cheat-sheet (lab model)</h3>
<pre class="code"><span class="c">! Read</span>
show ap dot11 24ghz summary
show ap dot11 5ghz summary
show ap rf-profile summary
show ap tag summary
show wireless tag rf summary
show wireless client mac-address MAC detail
show running-config | section rf-profile

<span class="c">! Pin or tune an AP radio (privileged mode)</span>
ap name AP1 dot11 24ghz channel 1
ap name AP2 dot11 24ghz channel 6
ap name AP1 dot11 5ghz txpower 3

<span class="c">! RF profile and RF tag (configuration mode)</span>
ap dot11 5ghz rf-profile CAMPUS-5
 tx-power max 14
 no shutdown
wireless tag rf RF-CAMPUS
 5ghz-rf-policy CAMPUS-5
ap name AP1 rf-tag RF-CAMPUS
ap name AP2 rf-tag RF-CAMPUS

<span class="c">! Whole band switch (not the same as an RF profile shutdown)</span>
ap dot11 5ghz shutdown

<span class="c">! Client proof</span>
wifi status
ping 10.10.60.20</pre>
<p>Remember the three labs: <b>wl-co-channel</b> (channels 1 and 6), <b>wl-rf-power</b> (CAMPUS-5 at 14 dBm, level 3) and <b>wl-band-shutdown</b> (no shutdown in the profile).</p>

<div class="exam"><p><b>Exam trap summary.</b> Level 1 is the strongest. Profile is per band. Tag goes on the AP. 1, 6, 11 not 1, 4, 8, 11. DCA is not power. A shut down profile is not "inactive": it disables the band for its APs. And never confuse the global band switch with the RF profile state.</p></div>
<div class="warn"><p><b>Common mistakes to avoid.</b> Reading a strong RSSI as proof of good service, raising power to fix slowness, leaving manual pins in place, creating a profile without enabling and assigning it, and not proving the fix from the client.</p></div>

<div class="scn"><h4>The campus refresh</h4><p>A campus replaced old APs with new ones. The engineer used RF tags per building type, capped 5 GHz at 14 dBm in dense halls, used 1, 6, 11 on 2.4 GHz with half of the 2.4 GHz radios off, and documented a single manual pin for a hall with a radar problem. After a week, retries dropped from 18 to 6 percent, and the helpdesk saw 40 percent fewer Wi-Fi tickets.</p><p><b>Lesson:</b> RF design is a set of small, consistent decisions, expressed once in profiles and tags.</p></div>

<div class="iv"><p class="q">"Summarise how you would design the RF for a new 20-AP office floor."</p><p>Gather requirements and client types; survey; plan 5 GHz first with a channel plan and lower power; 2.4 GHz only where needed with 1, 6, 11 and lower power; use RRM with RF profile limits; build RF profiles and RF tags on the controller; tag APs, verify tables, test with real clients, document pins and acceptance results.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF design balances coverage and capacity using channels, power and rates.</li>
<li>Read the per-band radio summary first when troubleshooting.</li>
<li>RF profile holds settings, RF tag bundles them, the AP gets the tag.</li>
<li>Real RRM is concept only here; lab channels are pinned by hand.</li>
<li>Always verify from the client.</li>
</ul></div>
`,hi:`
<p>Aap radio ki physics se controller par working RF design tak aa gaye ho. Yeh aakhri chapter sab kuch jodta hai: can-do checklist, mini glossary, sabse zyada tested facts, aur command cheat-sheet jo aap interview ya exam se pehle dobara padh sakte ho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Module recap">
<rect x="10" y="30" width="110" height="70" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="13">Bands</text><text x="65" y="80" text-anchor="middle" class="svg-muted" font-size="11">2.4 / 5 / 6 GHz</text>
<rect x="135" y="30" width="110" height="70" rx="8" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="13">Signal</text><text x="190" y="80" text-anchor="middle" class="svg-muted" font-size="11">dBm, SNR, rates</text>
<rect x="260" y="30" width="110" height="70" rx="8" fill="#fde68a"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interference</text><text x="315" y="80" text-anchor="middle" class="svg-muted" font-size="11">CCI, ACI, noise</text>
<rect x="385" y="30" width="110" height="70" rx="8" fill="#fed7aa"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="13">Power</text><text x="440" y="80" text-anchor="middle" class="svg-muted" font-size="11">cells, levels</text>
<rect x="510" y="30" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">Profiles, tags</text><text x="570" y="80" text-anchor="middle" class="svg-muted" font-size="11">RF profile, RF tag</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Samjho, design karo, configure karo, verify karo, troubleshoot karo</text>
</svg><p class="cap">Is module ke paanch building blocks.</p></div>

<h3>Can-do checklist</h3>
<p>Aap ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>Teen Wi-Fi bands, unke approximate channels aur har ek ki ek strength aur weakness batao.</li>
<li>Non-overlapping 2.4 GHz channels (1, 6, 11) list karo aur kyun samjhao.</li>
<li>RSSI aur noise floor se SNR calculate karo, aur rule of 3 aur 10 use karo.</li>
<li>Co-channel aur adjacent-channel interference samjhao, aur batao kaunsa aam taur par bura hai.</li>
<li>Samjhao ki bahut zyada AP power kyun nuksaan karti hai (overlap, asymmetry, sticky clients).</li>
<li>Lab ke power levels aur dBm ke beech convert karo (level 1 matlab 20 dBm, har step 3 dB).</li>
<li>DCA, TPC aur CHD describe karo, aur batao ki lab mein yeh sirf concept hain.</li>
<li>RF profile aur RF tag model aur default RF tag describe karo.</li>
<li><code>ap name AP1 dot11 24ghz channel 1</code> se 2.4 GHz channel pin karo aur result padho.</li>
<li>tx-power max 14 ke saath CAMPUS-5, RF-CAMPUS banao, aur dono APs tag karo.</li>
<li>Shut down RF profile jisne band off kiya use diagnose karo aur repair karo.</li>
<li><code>wifi status</code> aur <code>ping 10.10.60.20</code> se client se fix prove karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>dBm</dt><dd>1 mW ke relative power log scale par; 20 dBm matlab 100 mW.</dd>
<dt>RSSI</dt><dd>Receiver ka received signal strength ka measure, dBm ki tarah padha jaata hai.</dd>
<dt>Noise floor</dt><dd>Background radio noise, quiet room mein aam taur par lagbhag -95 dBm.</dd>
<dt>SNR</dt><dd>dB mein signal minus noise floor; data rate ko drive karta hai.</dd>
<dt>CCI</dt><dd>Co-channel interference: same channel ke APs airtime share karte hain.</dd>
<dt>ACI</dt><dd>Adjacent-channel interference: alag overlapping channels frames corrupt karte hain.</dd>
<dt>CSMA/CA</dt><dd>Bolne se pehle suno; ek channel par ek time par ek transmitter.</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection; kuch 5 GHz channels par radar avoidance.</dd>
<dt>RRM</dt><dd>Radio Resource Management: DCA (channels), TPC (power), CHD (coverage holes).</dd>
<dt>RF profile</dt><dd>Per-band radio settings object (lab: tx-power max, shutdown state).</dd>
<dt>RF tag</dt><dd>2.4 aur 5 GHz RF profile ka bundle jo APs ko assign hota hai.</dd>
<dt>Power level</dt><dd>AP par 1 se 8; 1 highest; har step lagbhag 3 dB.</dd>
<dt>MCS</dt><dd>Modulation and coding scheme; high SNR par tez.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<ol>
<li>2.4 GHz non-overlapping channels 1, 6 aur 11 hain (20 MHz). 5 GHz mein 20 MHz par bahut saare non-overlapping channels hain.</li>
<li>5 GHz mein 2.4 GHz se lagbhag 6 dB zyada path loss hota hai, isliye cells chhoti.</li>
<li>+3 dB power double karta hai, +10 dB das se guna karta hai.</li>
<li>Link ko SNR se judge karo, sirf RSSI se nahi; low-rate frames sabse zyada airtime lete hain.</li>
<li>Adjacent-channel interference aam taur par co-channel interference se bura hai.</li>
<li>Power level 1 highest hai; bada level number matlab kam power.</li>
<li>Naya RF profile shut down shuru hota hai; shut down profile tagged APs ke liye woh band off kar deta hai.</li>
<li>RF tag mein do slots hain (2.4 aur 5 GHz); AP ko tag milta hai, profile nahi.</li>
<li>Jis AP ka RF tag nahi hota woh default RF tag use karta hai.</li>
<li>Real RRM (DCA, TPC, CHD) aur data-rate controls lab mein concepts hain; channels deterministic hain.</li>
</ol>

<h3>Command cheat-sheet (lab model)</h3>
<pre class="code"><span class="c">! Padho</span>
show ap dot11 24ghz summary
show ap dot11 5ghz summary
show ap rf-profile summary
show ap tag summary
show wireless tag rf summary
show wireless client mac-address MAC detail
show running-config | section rf-profile

<span class="c">! AP radio pin ya tune karo (privileged mode)</span>
ap name AP1 dot11 24ghz channel 1
ap name AP2 dot11 24ghz channel 6
ap name AP1 dot11 5ghz txpower 3

<span class="c">! RF profile aur RF tag (configuration mode)</span>
ap dot11 5ghz rf-profile CAMPUS-5
 tx-power max 14
 no shutdown
wireless tag rf RF-CAMPUS
 5ghz-rf-policy CAMPUS-5
ap name AP1 rf-tag RF-CAMPUS
ap name AP2 rf-tag RF-CAMPUS

<span class="c">! Poore band ka switch (RF profile shutdown jaisa nahi)</span>
ap dot11 5ghz shutdown

<span class="c">! Client proof</span>
wifi status
ping 10.10.60.20</pre>
<p>Teeno labs yaad rakho: <b>wl-co-channel</b> (channels 1 aur 6), <b>wl-rf-power</b> (CAMPUS-5 14 dBm par, level 3) aur <b>wl-band-shutdown</b> (profile mein no shutdown).</p>

<div class="exam"><p><b>Exam trap summary.</b> Level 1 sabse strong hai. Profile per band hai. Tag AP par lagta hai. 1, 6, 11 na ki 1, 4, 8, 11. DCA power nahi hai. Shut down profile "inactive" nahi: woh apne APs ke liye band disable karta hai. Aur global band switch ko RF profile state se confuse mat karo.</p></div>
<div class="warn"><p><b>Bachne wali common galtiyan.</b> Strong RSSI ko achhi service ka proof maan lena, slowness fix karne ke liye power badhana, manual pins chhod dena, profile banana lekin enable aur assign na karna, aur fix ko client se prove na karna.</p></div>

<div class="scn"><h4>Campus refresh</h4><p>Ek campus ne purane APs naye APs se badle. Engineer ne building type ke hisaab se RF tags use kiye, dense halls mein 5 GHz ko 14 dBm par cap kiya, 2.4 GHz par 1, 6, 11 use kiye aur aadhe 2.4 GHz radios off rakhe, aur radar problem wale hall ke liye ek manual pin document kiya. Ek hafte baad retries 18 se 6 percent ho gaye, aur helpdesk ko 40 percent kam Wi-Fi tickets mile.</p><p><b>Seekh:</b> RF design chhote, consistent decisions ka set hai, jo profiles aur tags mein ek baar express hota hai.</p></div>

<div class="iv"><p class="q">"Naye 20-AP office floor ke liye RF design ka summary batao."</p><p>Requirements aur client types jama karo; survey karo; pehle 5 GHz plan karo channel plan aur kam power ke saath; 2.4 GHz sirf jahan zaroori ho 1, 6, 11 aur kam power ke saath; RRM ko RF profile limits ke saath use karo; controller par RF profiles aur RF tags banao; APs tag karo, tables verify karo, real clients se test karo, pins aur acceptance results document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF design channels, power aur rates se coverage aur capacity ka balance hai.</li>
<li>Troubleshoot mein pehle per-band radio summary padho.</li>
<li>RF profile settings rakhta hai, RF tag unhe bundle karta hai, AP ko tag milta hai.</li>
<li>Real RRM yahan sirf concept hai; lab channels haath se pin hote hain.</li>
<li>Hamesha client se verify karo.</li>
</ul></div>
`}};export{e as default};