var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with requirements and finished with validation. This last chapter pulls everything into one place: what you should be able to do, the key words, the most tested numbers and the command cheat sheet for the five labs. Read it the evening before an interview or exam, and use it as a map to find the chapter to revisit.</p>

<h3>Analogy: the pilot's pre-flight card</h3>
<p>A pilot knows how to fly, but still checks a one-page card before take-off. This chapter is that card for wireless design.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Design map of the module">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Requirements, 2 Surveys</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Coverage and capacity</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 Channels, widths, DFS</text>
<rect x="10" y="70" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="12">5 Antennas, EIRP, FSPL</text>
<rect x="220" y="70" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">6 Voice and video, 7 High density</text>
<rect x="430" y="70" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="12">8 Infra, outdoor, mesh</text>
<rect x="10" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="12">9 RRM</text>
<rect x="220" y="130" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">10 CleanAir, validation</text>
<rect x="430" y="130" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="12">11 Troubleshooting</text>
</svg><p class="cap">The eleven chapters in one picture.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Write requirements as measurable targets (RSSI, SNR, Mbps per client, roaming).</li>
<li>Choose between predictive, AP-on-a-stick, passive, active, post-deployment and Layer 1 surveys and say what each outputs.</li>
<li>Size a cell from a target RSSI, count APs for coverage and for capacity, and add N+1.</li>
<li>Build a 5 GHz plan with a channel list, 20 MHz width and RF tag, and read the Source column.</li>
<li>Explain CCI versus ACI, the width trap, and DFS timers.</li>
<li>Do dB maths: dBm to mW, EIRP, FSPL, link budget and fade margin.</li>
<li>Design for voice (-67 dBm, 25 dB SNR, 20 percent overlap, 12 Mbps minimum) and for high density (small cells, 24 Mbps minimum, few SSIDs).</li>
<li>Check PoE class, multigigabit ports, mounting and grounding; explain RAP, MAP, AWPP and Fresnel clearance.</li>
<li>Configure and explain TPC bounds, RF group name and mode, DCA restart and CHDM.</li>
<li>Describe CleanAir (interferer, duty cycle, severity, AQI) and run a validation and handover.</li>
<li>Troubleshoot with symptom, evidence, layer, one fix, proof.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP-on-a-stick</dt><dd>Pre-deployment survey with a real AP on a pole or tripod at the planned height.</dd>
<dt>Passive / active survey</dt><dd>Passive listens (coverage, interference); active joins the SSID (throughput, roaming).</dd>
<dt>CCI / ACI</dt><dd>Co-channel contention (shared airtime) versus adjacent-channel interference (corrupting overlap).</dd>
<dt>DFS</dt><dd>Dynamic Frequency Selection for radar channels: 60 second check, 30 minute non-occupancy.</dd>
<dt>EIRP</dt><dd>Tx power plus antenna gain minus cable loss; regulated.</dd>
<dt>FSPL</dt><dd>Free-space path loss, 32.44 + 20 log10(MHz) + 20 log10(km).</dd>
<dt>Fade margin</dt><dd>Rx power minus receiver sensitivity; 10 to 20 dB for outdoor links.</dd>
<dt>RRM, DCA, TPC, CHDM</dt><dd>Radio Resource Management with channel, power and coverage hole functions.</dd>
<dt>RF group</dt><dd>Controllers with the same RF group name whose APs hear each other; one leader plans.</dd>
<dt>CleanAir, AQI</dt><dd>Spectrum intelligence in the AP; Air Quality Index 100 is best.</dd>
<dt>RAP / MAP / AWPP / BGN</dt><dd>Root AP, Mesh AP, path protocol and bridge group name.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice design</td><td>-67 dBm, SNR 25 dB, about 20 percent overlap, 5 GHz, 12 Mbps minimum rate, latency 150 ms, jitter 30 ms, loss 1 percent</td></tr>
<tr><td>dB rules</td><td>+3 dB = x2 power, +10 dB = x10, +6 dB doubles free-space range, dBi = dBd + 2.15</td></tr>
<tr><td>EIRP</td><td>Tx + gain - cable loss; 17 + 5 - 2 = 20 dBm = 100 mW</td></tr>
<tr><td>FSPL</td><td>5180 MHz at 100 m is 86.7 dB; 2437 MHz is 80.2 dB; 5 GHz loses about 6.5 dB more</td></tr>
<tr><td>Width</td><td>Each doubling adds 3 dB noise and halves the blocks; enterprise default 20 MHz</td></tr>
<tr><td>2.4 GHz</td><td>Only channels 1, 6, 11 do not overlap</td></tr>
<tr><td>PoE</td><td>af 15.4 W, at 30 W, bt 60 or 90 W at the switch; AP gets less</td></tr>
<tr><td>TPC</td><td>Third loudest neighbour, -70 dBm default threshold</td></tr>
<tr><td>CHDM</td><td>-80 dBm, 3 clients, 25 percent</td></tr>
<tr><td>RF group vs mobility group</td><td>RF group for RRM; mobility group for roaming</td></tr>
<tr><td>Lab power levels</td><td>1 = 20, 2 = 17, 3 = 14, 4 = 11, 5 = 8 dBm</td></tr>
<tr><td>Blueprint areas</td><td>Site survey; wired and wireless infrastructure; mobility; WLAN high availability</td></tr>
</table>

<h3>Command cheat sheet (the five labs)</h3>
<pre class="code"><span class="c">! RF profile, RF tag, AP tag, channel auto  (wl-design-clean-5g-plan)</span>
ap dot11 5ghz rf-profile PLAN-5
 channel chan-width 20
 channel remove 157
 channel remove 161
 no shutdown
wireless tag rf RF-PLAN
 5ghz-rf-policy PLAN-5
ap name AP1 dot11 5ghz channel auto
<span class="c">! Power cap (wl-design-coverage-hole)</span>
ap dot11 5ghz rf-profile CAMPUS-5
 shutdown
 tx-power max 17
 no shutdown
<span class="c">! High density (wl-design-high-density)</span>
ap dot11 5ghz rf-profile HD-5
 channel chan-width 20
 tx-power max 11
 rate RATE_6M disable
 rate RATE_9M disable
 rate RATE_12M disable
<span class="c">! RRM model (wl-design-rrm-model)</span>
ap dot11 5ghz rrm txpower auto
ap dot11 5ghz rrm txpower min 8
ap dot11 5ghz rrm txpower max 17
wireless rf-network NK-CAMPUS
ap dot11 5ghz rrm group-mode leader
ap dot11 5ghz rrm dca restart
<span class="c">! Width trap (wl-design-width-trap)</span>
ap dot11 5ghz rf-profile WIDE-5
 shutdown
 channel chan-width 40
 no shutdown
<span class="c">! Evidence</span>
show ap dot11 5ghz summary
show ap dot11 5ghz channel
show ap dot11 5ghz group
show ap dot11 5ghz coverage
show ap name AP5 auto-rf dot11 5ghz
show ap rf-profile name HD-5 detail
wifi link   (client)</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b> and <b>Tags</b>, <b>Configuration &gt; Wireless &gt; Access Points</b> and <b>Global</b>, <b>Monitoring &gt; Wireless &gt; Radios</b> and <b>Clients</b>, and in this simulator <b>Configuration &gt; Wireless &gt; RRM</b>. Remember: real survey tools, CleanAir hardware, the real RRM algorithms, mesh and antenna patterns are concept only.</p>

<div class="warn"><p><b>Final common mistakes.</b> Designing for coverage only; skipping requirements; loud cells; 80 MHz everywhere; ignoring PoE, mounting and grounding; no validation survey; no documentation.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> More power is not more capacity. Wider is not faster in a dense plan. CleanAir finds non-Wi-Fi; AQI 100 is best. RF group is not mobility group.</p></div>

<div class="scn"><h4>The handover that saved a weekend</h4><p>Two months after go-live a new engineer saw complaints at a client site. The handover pack held the survey data, the target table and the channel plan. Within an hour she found that a manual channel had been set on one AP after a move, put it back to the RF profile and restored the plan. Without the pack it would have been days.</p><p><b>Lesson:</b> documentation is part of the design.</p></div>

<div class="iv"><p class="q">"Summarise your wireless design approach in one minute."</p><p>Requirements as measurable targets, predictive model, AP-on-a-stick calibration, coverage and capacity counts with N+1, a channel plan of 20 or 40 MHz with reuse, voice and high-density rules, correct infrastructure and PoE, RRM bounded by profiles, CleanAir for non-Wi-Fi, then a post-deployment survey against the targets and a documented handover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design is requirements, model, calibration, install, validation, operate.</li>
<li>Coverage is signal; capacity is airtime. Small cells, narrow channels and high minimum rates scale capacity.</li>
<li>dB maths and the link budget work in addition and subtraction.</li>
<li>RRM and CleanAir keep the plan healthy; profiles keep RRM within bounds.</li>
<li>Prove everything with the same evidence you collected first.</li>
</ul></div>
`,hi:`
<p>Aapne requirements se shuru kiya aur validation par khatam kiya. Yeh aakhri chapter sab kuch ek jagah laata hai: aap kya kar paane chahiye, key words, sabse zyada pooche jaane wale numbers aur paanch labs ki command cheat sheet. Ise interview ya exam se ek sham pehle padho, aur ise map ki tarah use karo ki kaunsa chapter dobara dekhna hai.</p>

<h3>Analogy: pilot ka pre-flight card</h3>
<p>Pilot ko udaana aata hai, phir bhi take-off se pehle ek page ka card check karta hai. Yeh chapter wireless design ke liye wahi card hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module ka design map">
<rect x="10" y="10" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Requirements, 2 Surveys</text>
<rect x="220" y="10" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Coverage aur capacity</text>
<rect x="430" y="10" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="12">4 Channels, widths, DFS</text>
<rect x="10" y="70" width="200" height="50" rx="8" fill="#fde68a"/><text x="110" y="100" text-anchor="middle" class="svg-ink" font-size="12">5 Antennas, EIRP, FSPL</text>
<rect x="220" y="70" width="200" height="50" rx="8" fill="#fed7aa"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">6 Voice aur video, 7 High density</text>
<rect x="430" y="70" width="200" height="50" rx="8" fill="#e2e8f0"/><text x="530" y="100" text-anchor="middle" class="svg-ink" font-size="12">8 Infra, outdoor, mesh</text>
<rect x="10" y="130" width="200" height="50" rx="8" fill="#bae6fd"/><text x="110" y="160" text-anchor="middle" class="svg-ink" font-size="12">9 RRM</text>
<rect x="220" y="130" width="200" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="12">10 CleanAir, validation</text>
<rect x="430" y="130" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="160" text-anchor="middle" class="svg-ink" font-size="12">11 Troubleshooting</text>
</svg><p class="cap">Gyarah chapters ek picture mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Requirements ko measurable targets (RSSI, SNR, Mbps per client, roaming) mein likho.</li>
<li>Predictive, AP-on-a-stick, passive, active, post-deployment aur Layer 1 surveys mein se chuno aur batao ki har ek kya output deta hai.</li>
<li>Target RSSI se cell size karo, coverage aur capacity ke liye APs gino, aur N+1 jodo.</li>
<li>Channel list, 20 MHz width aur RF tag ke saath 5 GHz plan banao, aur Source column padho.</li>
<li>CCI versus ACI, width trap aur DFS timers samjhao.</li>
<li>dB maths karo: dBm se mW, EIRP, FSPL, link budget aur fade margin.</li>
<li>Voice (-67 dBm, 25 dB SNR, 20 percent overlap, 12 Mbps minimum) aur high density (chhote cells, 24 Mbps minimum, kam SSIDs) ke liye design karo.</li>
<li>PoE class, multigigabit ports, mounting aur grounding check karo; RAP, MAP, AWPP aur Fresnel clearance samjhao.</li>
<li>TPC bounds, RF group name aur mode, DCA restart aur CHDM configure karo aur samjhao.</li>
<li>CleanAir (interferer, duty cycle, severity, AQI) describe karo aur validation aur handover chalao.</li>
<li>Symptom, evidence, layer, ek fix, proof se troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AP-on-a-stick</dt><dd>Planned height par pole ya tripod par real AP ke saath pre-deployment survey.</dd>
<dt>Passive / active survey</dt><dd>Passive sunta hai (coverage, interference); active SSID join karta hai (throughput, roaming).</dd>
<dt>CCI / ACI</dt><dd>Co-channel contention (shared airtime) versus adjacent-channel interference (corrupting overlap).</dd>
<dt>DFS</dt><dd>Radar channels ke liye Dynamic Frequency Selection: 60 second check, 30 minute non-occupancy.</dd>
<dt>EIRP</dt><dd>Tx power plus antenna gain minus cable loss; regulated.</dd>
<dt>FSPL</dt><dd>Free-space path loss, 32.44 + 20 log10(MHz) + 20 log10(km).</dd>
<dt>Fade margin</dt><dd>Rx power minus receiver sensitivity; outdoor links ke liye 10 se 20 dB.</dd>
<dt>RRM, DCA, TPC, CHDM</dt><dd>Channel, power aur coverage hole functions wala Radio Resource Management.</dd>
<dt>RF group</dt><dd>Same RF group name wale controllers jinke APs ek dusre ko sunte hain; ek leader plan karta hai.</dd>
<dt>CleanAir, AQI</dt><dd>AP mein spectrum intelligence; Air Quality Index 100 sabse achha.</dd>
<dt>RAP / MAP / AWPP / BGN</dt><dd>Root AP, Mesh AP, path protocol aur bridge group name.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Voice design</td><td>-67 dBm, SNR 25 dB, lagbhag 20 percent overlap, 5 GHz, 12 Mbps minimum rate, latency 150 ms, jitter 30 ms, loss 1 percent</td></tr>
<tr><td>dB rules</td><td>+3 dB = x2 power, +10 dB = x10, +6 dB free-space range double karta hai, dBi = dBd + 2.15</td></tr>
<tr><td>EIRP</td><td>Tx + gain - cable loss; 17 + 5 - 2 = 20 dBm = 100 mW</td></tr>
<tr><td>FSPL</td><td>100 m par 5180 MHz 86.7 dB; 2437 MHz 80.2 dB; 5 GHz lagbhag 6.5 dB zyada khota hai</td></tr>
<tr><td>Width</td><td>Har doubling 3 dB noise jodta hai aur blocks aadhe karta hai; enterprise default 20 MHz</td></tr>
<tr><td>2.4 GHz</td><td>Sirf channels 1, 6, 11 overlap nahi karte</td></tr>
<tr><td>PoE</td><td>Switch par af 15.4 W, at 30 W, bt 60 ya 90 W; AP ko kam milta hai</td></tr>
<tr><td>TPC</td><td>Teesra sabse loud neighbour, -70 dBm default threshold</td></tr>
<tr><td>CHDM</td><td>-80 dBm, 3 clients, 25 percent</td></tr>
<tr><td>RF group vs mobility group</td><td>RF group RRM ke liye; mobility group roaming ke liye</td></tr>
<tr><td>Lab power levels</td><td>1 = 20, 2 = 17, 3 = 14, 4 = 11, 5 = 8 dBm</td></tr>
<tr><td>Blueprint areas</td><td>Site survey; wired aur wireless infrastructure; mobility; WLAN high availability</td></tr>
</table>

<h3>Command cheat sheet (paanch labs)</h3>
<pre class="code"><span class="c">! RF profile, RF tag, AP tag, channel auto  (wl-design-clean-5g-plan)</span>
ap dot11 5ghz rf-profile PLAN-5
 channel chan-width 20
 channel remove 157
 channel remove 161
 no shutdown
wireless tag rf RF-PLAN
 5ghz-rf-policy PLAN-5
ap name AP1 dot11 5ghz channel auto
<span class="c">! Power cap (wl-design-coverage-hole)</span>
ap dot11 5ghz rf-profile CAMPUS-5
 shutdown
 tx-power max 17
 no shutdown
<span class="c">! High density (wl-design-high-density)</span>
ap dot11 5ghz rf-profile HD-5
 channel chan-width 20
 tx-power max 11
 rate RATE_6M disable
 rate RATE_9M disable
 rate RATE_12M disable
<span class="c">! RRM model (wl-design-rrm-model)</span>
ap dot11 5ghz rrm txpower auto
ap dot11 5ghz rrm txpower min 8
ap dot11 5ghz rrm txpower max 17
wireless rf-network NK-CAMPUS
ap dot11 5ghz rrm group-mode leader
ap dot11 5ghz rrm dca restart
<span class="c">! Width trap (wl-design-width-trap)</span>
ap dot11 5ghz rf-profile WIDE-5
 shutdown
 channel chan-width 40
 no shutdown
<span class="c">! Evidence</span>
show ap dot11 5ghz summary
show ap dot11 5ghz channel
show ap dot11 5ghz group
show ap dot11 5ghz coverage
show ap name AP5 auto-rf dot11 5ghz
show ap rf-profile name HD-5 detail
wifi link   (client)</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b> aur <b>Tags</b>, <b>Configuration &gt; Wireless &gt; Access Points</b> aur <b>Global</b>, <b>Monitoring &gt; Wireless &gt; Radios</b> aur <b>Clients</b>, aur is simulator mein <b>Configuration &gt; Wireless &gt; RRM</b>. Yaad rakho: real survey tools, CleanAir hardware, real RRM algorithms, mesh aur antenna patterns concept only hain.</p>

<div class="warn"><p><b>Aakhri common galtiyan.</b> Sirf coverage ke liye design karna; requirements skip karna; loud cells; har jagah 80 MHz; PoE, mounting aur grounding ignore karna; validation survey nahi; documentation nahi.</p></div>
<div class="exam"><p><b>Exam trap recap.</b> Zyada power matlab zyada capacity nahi. Dense plan mein wider matlab faster nahi. CleanAir non-Wi-Fi dhoondta hai; AQI 100 sabse achha. RF group mobility group nahi hai.</p></div>

<div class="scn"><h4>Handover jisne weekend bacha liya</h4><p>Go-live ke do mahine baad ek naye engineer ne client site par shikayatein dekhi. Handover pack mein survey data, target table aur channel plan tha. Ek ghante mein usne dhoondh liya ki move ke baad ek AP par manual channel set ho gaya tha, use RF profile par wapas kiya aur plan bahal kiya. Pack ke bina yeh dino ka kaam hota.</p><p><b>Seekh:</b> documentation design ka hissa hai.</p></div>

<div class="iv"><p class="q">"Apna wireless design approach ek minute mein batao."</p><p>Measurable targets ke roop mein requirements, predictive model, AP-on-a-stick calibration, N+1 ke saath coverage aur capacity counts, reuse ke saath 20 ya 40 MHz channel plan, voice aur high-density rules, sahi infrastructure aur PoE, profiles se bounded RRM, non-Wi-Fi ke liye CleanAir, phir targets ke against post-deployment survey aur documented handover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design hai requirements, model, calibration, install, validation, operate.</li>
<li>Coverage signal hai; capacity airtime hai. Chhote cells, narrow channels aur ooncha minimum rate capacity badhate hain.</li>
<li>dB maths aur link budget addition aur subtraction mein chalte hain.</li>
<li>RRM aur CleanAir plan ko healthy rakhte hain; profiles RRM ko bounds mein rakhte hain.</li>
<li>Sab kuch usi evidence se prove karo jo pehle collect kiya tha.</li>
</ul></div>
`}};export{e as default};