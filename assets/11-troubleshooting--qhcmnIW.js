var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: coverage hole, width trap and the other design labs`,hi:`Troubleshooting workflow: coverage hole, width trap aur baaki design labs`},body:{en:`
<p>Design problems show up as user complaints: "Wi-Fi is slow here", "my phone sticks to 2.4 GHz", "calls break in the corridor". Good engineers do not change settings at random. They follow a short, repeatable workflow, collect evidence from the controller and the client, and change <b>one thing at a time</b>. This chapter gives the workflow and walks the two troubleshooting labs, <code>wl-design-coverage-hole</code> and <code>wl-design-width-trap</code>, step by step, then revisits the three config labs as quick checks.</p>

<h3>Analogy: a doctor's visit</h3>
<p>The doctor asks symptoms, takes temperature and blood pressure, forms a guess, prescribes one treatment and checks again. Prescribing five medicines at once makes it impossible to know which one worked.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Define the symptom</b> in numbers: which client, where, which band, what is slow.</li>
<li><b>Collect evidence</b> from the client (band, RSSI, rate, width) and from the controller (radios, profile, coverage).</li>
<li><b>Place the problem in a layer:</b> coverage (RSSI too low), capacity (too many clients, too much utilisation), interference (co-channel, non-Wi-Fi), or configuration (profile, rates, width, power cap).</li>
<li><b>Form one hypothesis</b> and one fix.</li>
<li><b>Apply it</b> and reconnect the client.</li>
<li><b>Prove it</b> with the same evidence you started with, and write it down.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting decision flow">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="12">Symptom</text>
<rect x="140" y="50" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="195" y="78" text-anchor="middle" class="svg-ink" font-size="12">Evidence</text>
<rect x="270" y="10" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="30" text-anchor="middle" class="svg-ink" font-size="12">RSSI low: coverage</text>
<rect x="270" y="60" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">Overlap: channels</text>
<rect x="270" y="110" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="130" text-anchor="middle" class="svg-ink" font-size="12">Slow rate: config</text>
<rect x="420" y="50" width="100" height="46" rx="8" fill="#bbf7d0"/><text x="470" y="78" text-anchor="middle" class="svg-ink" font-size="12">One fix</text>
<rect x="540" y="50" width="90" height="46" rx="8" fill="#fed7aa"/><text x="585" y="78" text-anchor="middle" class="svg-ink" font-size="12">Prove it</text>
<path d="M120 73h20M250 73h20M390 25l30 35M390 75h30M390 125l30-35M520 73h20" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Sort the evidence into coverage, overlap or configuration, then apply one fix and prove it.</p></div>

<h3>Lab walk-through 1: wl-design-coverage-hole</h3>
<p><b>Ticket.</b> A laptop between AP1 and AP2 is stuck on 2.4 GHz and slow. A survey note said "shrink the cells". <b>Step 1: evidence.</b> Read the client link and the profile:</p>
<pre class="out">LAPTOP1$ wifi link
Connected to 00:11:22:33:44:01 (on wlan0)
	SSID: NK-STAFF
	freq: 2437
	signal: <span class="hl">-62 dBm</span>
	protocol: 802.11ax, <span class="hl">2.4 GHz</span>, 20 MHz, 2 spatial streams

WLC1# show ap rf-profile name CAMPUS-5 detail
RF Profile Name                  : CAMPUS-5
Band                             : 802.11a (5 GHz)
Status                           : Up
Max TX power                     : <span class="hl">8 dBm</span>

WLC1# show ap dot11 5ghz coverage
Coverage Hole Detection (5 GHz)
  Data RSSI threshold          : -80 dBm
  Clients below the data RSSI threshold (model view): 0</pre>
<p>GUI: <b>Monitoring &gt; Wireless &gt; Clients</b> (client detail), <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b>. <b>Step 2: layer.</b> The 2.4 GHz signal is strong (-62 dBm) but the client is on the weaker band: it prefers 5 GHz only if 5 GHz RSSI is -70 dBm or better. With a profile cap of 8 dBm the 5 GHz RSSI is 8 - 46 - 35 x log10(12.65 m) = -76.6 dBm, so the client never moves. It is a configuration problem (a power cap), not a missing AP. Note that CHDM cannot rescue it: no client is below -80 dBm, and the cap blocks any increase.</p>
<div class="eg"><p><b>Step 3: choose the minimum fix.</b> Power moves in 3 dB steps: 8 dBm gives -76.6, 11 dBm gives -73.6, 14 dBm gives -70.6 (still below -70), 17 dBm gives <b>-67.6 dBm</b>. 17 dBm is the lowest level that works.</p></div>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# shutdown
WLC1(config-rf-profile)# tx-power max 17
WLC1(config-rf-profile)# no shutdown
<span class="c">! then reconnect the client</span>
LAPTOP1$ wifi connect NK-STAFF psk NkStaff2024
LAPTOP1$ wifi link</pre>
<p><b>Step 4: prove.</b> The link now reads 5 GHz, signal about -68 dBm. Done: one change, one proof.</p>

<h3>Lab walk-through 2: wl-design-width-trap</h3>
<p><b>Ticket.</b> Someone set WIDE-5 to 80 MHz on five APs "for gigabit speeds" and everyone slowed down. <b>Evidence:</b></p>
<pre class="out">WLC1# show ap name AP5 auto-rf dot11 5ghz
AP Name                          : AP5
Channel                          : 36
Channel Width                    : <span class="hl">80 MHz</span>
Nearby APs                       : 2
  AP AP2 : -72 dBm on channel 36, 11.4 m <span class="hl">(OVERLAPS this radio)</span>
  AP AP3 : -72 dBm on channel 149, 11.4 m</pre>
<p>(The neighbour list is an example.) GUI: <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; WIDE-5 &gt; RRM &gt; DCA &gt; Channel Width</b>. <b>Layer:</b> overlap, caused by configuration. The non-DFS plan has only two 80 MHz blocks, so five APs must share them. <b>Fix:</b> change the profile, do not delete it. Try 40 MHz: four blocks, and APs that cannot hear each other may reuse a block.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile WIDE-5
WLC1(config-rf-profile)# shutdown
WLC1(config-rf-profile)# channel chan-width 40
WLC1(config-rf-profile)# no shutdown
WLC1# show ap dot11 5ghz summary</pre>
<p><b>Prove:</b> the summary shows 40 MHz and the overlap count is zero; the laptop link is on 5 GHz with -70 dBm or better. 20 MHz would also be clean, but the task asks for the widest clean width, which is 40 MHz.</p>

<h3>Quick checks for the config labs</h3>
<table class="cmp"><tr><th>Lab</th><th>What to read</th><th>Pass condition</th></tr>
<tr><td>wl-design-clean-5g-plan</td><td><code>show ap dot11 5ghz channel</code></td><td>Source is DCA (RF profile), channels inside the list, no overlap</td></tr>
<tr><td>wl-design-high-density</td><td><code>show ap dot11 5ghz summary</code>, <code>wifi link</code></td><td>Power level 4, 20 MHz, laptop on 5 GHz at -70 dBm or better</td></tr>
<tr><td>wl-design-rrm-model</td><td><code>show ap dot11 5ghz group</code>, summary</td><td>Group NK-CAMPUS, mode LEADER, power levels 2 to 5</td></tr>
</table>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>First command</th></tr>
<tr><td>Client stuck on 2.4 GHz</td><td>5 GHz RSSI below -70 dBm, power cap, WLAN band setting</td><td><code>wifi link</code>, <code>show wlan name</code></td></tr>
<tr><td>Slow everywhere in one area</td><td>Co-channel overlap, wide channels, slow rates</td><td><code>show ap dot11 5ghz channel</code></td></tr>
<tr><td>High retries, good RSSI</td><td>Non-Wi-Fi interferer</td><td>CleanAir or spectrum view</td></tr>
<tr><td>Cells too big, sticky clients</td><td>Power too high, low rates enabled</td><td><code>show ap rf-profile name ... detail</code></td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Changing power, width and channels in one go; fixing the symptom of one client by raising power for the whole floor; deleting a profile instead of editing it; skipping the proof step.</p></div>
<div class="exam"><p><b>Exam trap.</b> The first number to read is RSSI plus band; the second is overlap; the third is the lowest mandatory rate. A "weak signal" ticket may be a power cap, not a hole in the building.</p></div>

<div class="scn"><h4>The sticky phone in Meeting Room 4</h4><p>A manager's phone stayed on 2.4 GHz and kept dropping on video calls. The AP showed a 5 GHz cap of 8 dBm in the RF profile from an old "shrink the cells" project. The engineer proved -76 dBm on 5 GHz, raised the cap to 17 dBm, and the phone moved to 5 GHz at -67 dBm.</p><p><b>Lesson:</b> check the profile caps before blaming the building.</p></div>

<div class="iv"><p class="q">"A client is on 2.4 GHz even though the AP supports 5 GHz. How do you troubleshoot?"</p><p>Read the client link for band and RSSI, then the AP radios and the RF profile (power cap, rates, width), and the WLAN band setting. A client prefers 5 GHz only above about -70 dBm, so a power cap can strand it. Change one thing, reconnect, prove with the same command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, evidence, layer, one hypothesis, one fix, proof.</li>
<li>Coverage-hole lab: the 8 dBm cap gave -76.6 dBm on 5 GHz; 17 dBm gave -67.6 dBm and fixed it.</li>
<li>Width-trap lab: 80 MHz leaves two blocks for five APs; 40 MHz is the widest clean width.</li>
<li>Edit profiles (shutdown, change, no shutdown) instead of deleting them.</li>
<li>Prove every fix with the same evidence you collected first.</li>
</ul></div>
`,hi:`
<p>Design problems user complaints ki tarah dikhte hain: "yahan Wi-Fi slow hai", "mera phone 2.4 GHz par chipka rehta hai", "corridor mein calls toot-te hain". Achhe engineers random settings nahi badalte. Woh ek chhota, repeatable workflow follow karte hain, controller aur client se evidence collect karte hain, aur <b>ek time par ek hi cheez</b> badalte hain. Yeh chapter workflow deta hai aur dono troubleshooting labs, <code>wl-design-coverage-hole</code> aur <code>wl-design-width-trap</code>, step by step walk karta hai, phir teen config labs ko quick checks ki tarah dohrata hai.</p>

<h3>Analogy: doctor ka visit</h3>
<p>Doctor symptoms poochta hai, temperature aur blood pressure leta hai, ek andaza lagata hai, ek ilaaj likhta hai aur dobara check karta hai. Ek saath paanch dawaiyan dene se pata nahi chalta ki kaunsi kaam aayi.</p>

<h3>Chhe-step workflow</h3>
<ol>
<li><b>Symptom ko numbers mein define karo:</b> kaunsa client, kahan, kaunsa band, kya slow hai.</li>
<li><b>Evidence collect karo</b> client se (band, RSSI, rate, width) aur controller se (radios, profile, coverage).</li>
<li><b>Problem ko layer mein rakho:</b> coverage (RSSI kam), capacity (zyada clients, zyada utilisation), interference (co-channel, non-Wi-Fi), ya configuration (profile, rates, width, power cap).</li>
<li><b>Ek hypothesis aur ek fix banao.</b></li>
<li><b>Lagao</b> aur client ko reconnect karo.</li>
<li><b>Prove karo</b> usi evidence se jisse shuru kiya tha, aur likh lo.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Troubleshooting decision flow">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="12">Symptom</text>
<rect x="140" y="50" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="195" y="78" text-anchor="middle" class="svg-ink" font-size="12">Evidence</text>
<rect x="270" y="10" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="30" text-anchor="middle" class="svg-ink" font-size="12">RSSI low: coverage</text>
<rect x="270" y="60" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="80" text-anchor="middle" class="svg-ink" font-size="12">Overlap: channels</text>
<rect x="270" y="110" width="120" height="30" rx="8" fill="#fde68a"/><text x="330" y="130" text-anchor="middle" class="svg-ink" font-size="12">Slow rate: config</text>
<rect x="420" y="50" width="100" height="46" rx="8" fill="#bbf7d0"/><text x="470" y="78" text-anchor="middle" class="svg-ink" font-size="12">Ek fix</text>
<rect x="540" y="50" width="90" height="46" rx="8" fill="#fed7aa"/><text x="585" y="78" text-anchor="middle" class="svg-ink" font-size="12">Prove karo</text>
<path d="M120 73h20M250 73h20M390 25l30 35M390 75h30M390 125l30-35M520 73h20" stroke="#64748b" stroke-width="2" fill="none"/>
</svg><p class="cap">Evidence ko coverage, overlap ya configuration mein baanto, phir ek fix lagao aur prove karo.</p></div>

<h3>Lab walk-through 1: wl-design-coverage-hole</h3>
<p><b>Ticket.</b> AP1 aur AP2 ke beech ka laptop 2.4 GHz par atka hai aur slow hai. Survey note ne kaha "cells chhote karo". <b>Step 1: evidence.</b> Client link aur profile padho:</p>
<pre class="out">LAPTOP1$ wifi link
Connected to 00:11:22:33:44:01 (on wlan0)
	SSID: NK-STAFF
	freq: 2437
	signal: <span class="hl">-62 dBm</span>
	protocol: 802.11ax, <span class="hl">2.4 GHz</span>, 20 MHz, 2 spatial streams

WLC1# show ap rf-profile name CAMPUS-5 detail
RF Profile Name                  : CAMPUS-5
Band                             : 802.11a (5 GHz)
Status                           : Up
Max TX power                     : <span class="hl">8 dBm</span>

WLC1# show ap dot11 5ghz coverage
Coverage Hole Detection (5 GHz)
  Data RSSI threshold          : -80 dBm
  Clients below the data RSSI threshold (model view): 0</pre>
<p>GUI: <b>Monitoring &gt; Wireless &gt; Clients</b> (client detail), <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b>. <b>Step 2: layer.</b> 2.4 GHz signal strong hai (-62 dBm) lekin client kamzor band par hai: woh 5 GHz tabhi prefer karta hai jab 5 GHz RSSI -70 dBm ya behtar ho. 8 dBm profile cap ke saath 5 GHz RSSI 8 - 46 - 35 x log10(12.65 m) = -76.6 dBm hai, isliye client kabhi nahi hilta. Yeh configuration problem hai (power cap), kisi AP ki kami nahi. Dhyan do ki CHDM bhi ise nahi bacha sakta: koi client -80 dBm se neeche nahi hai, aur cap kisi bhi increase ko rokta hai.</p>
<div class="eg"><p><b>Step 3: minimum fix chuno.</b> Power 3 dB steps mein chalti hai: 8 dBm se -76.6, 11 dBm se -73.6, 14 dBm se -70.6 (abhi bhi -70 se neeche), 17 dBm se <b>-67.6 dBm</b>. 17 dBm sabse low level hai jo kaam karta hai.</p></div>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# shutdown
WLC1(config-rf-profile)# tx-power max 17
WLC1(config-rf-profile)# no shutdown
<span class="c">! phir client reconnect karo</span>
LAPTOP1$ wifi connect NK-STAFF psk NkStaff2024
LAPTOP1$ wifi link</pre>
<p><b>Step 4: prove.</b> Link ab 5 GHz padhta hai, signal lagbhag -68 dBm. Ho gaya: ek change, ek proof.</p>

<h3>Lab walk-through 2: wl-design-width-trap</h3>
<p><b>Ticket.</b> Kisi ne WIDE-5 ko paanch APs par "gigabit speed ke liye" 80 MHz kar diya aur sab slow ho gaye. <b>Evidence:</b></p>
<pre class="out">WLC1# show ap name AP5 auto-rf dot11 5ghz
AP Name                          : AP5
Channel                          : 36
Channel Width                    : <span class="hl">80 MHz</span>
Nearby APs                       : 2
  AP AP2 : -72 dBm on channel 36, 11.4 m <span class="hl">(OVERLAPS this radio)</span>
  AP AP3 : -72 dBm on channel 149, 11.4 m</pre>
<p>(Neighbour list example hai.) GUI: <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>, <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; WIDE-5 &gt; RRM &gt; DCA &gt; Channel Width</b>. <b>Layer:</b> overlap, configuration se hua. Non-DFS plan mein sirf do 80 MHz blocks hain, isliye paanch APs ko unhe share karna padta hai. <b>Fix:</b> profile badlo, delete mat karo. 40 MHz try karo: chaar blocks, aur jo APs ek dusre ko nahi sunte woh block reuse kar sakte hain.</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile WIDE-5
WLC1(config-rf-profile)# shutdown
WLC1(config-rf-profile)# channel chan-width 40
WLC1(config-rf-profile)# no shutdown
WLC1# show ap dot11 5ghz summary</pre>
<p><b>Prove:</b> summary 40 MHz dikhati hai aur overlap count zero hai; laptop link 5 GHz par -70 dBm ya behtar hai. 20 MHz bhi clean hota, lekin task sabse wide clean width maangta hai, jo 40 MHz hai.</p>

<h3>Config labs ke liye quick checks</h3>
<table class="cmp"><tr><th>Lab</th><th>Kya padhna hai</th><th>Pass condition</th></tr>
<tr><td>wl-design-clean-5g-plan</td><td><code>show ap dot11 5ghz channel</code></td><td>Source DCA (RF profile), channels list ke andar, overlap nahi</td></tr>
<tr><td>wl-design-high-density</td><td><code>show ap dot11 5ghz summary</code>, <code>wifi link</code></td><td>Power level 4, 20 MHz, laptop 5 GHz par -70 dBm ya behtar</td></tr>
<tr><td>wl-design-rrm-model</td><td><code>show ap dot11 5ghz group</code>, summary</td><td>Group NK-CAMPUS, mode LEADER, power levels 2 se 5</td></tr>
</table>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Pehla command</th></tr>
<tr><td>Client 2.4 GHz par atka</td><td>5 GHz RSSI -70 dBm se neeche, power cap, WLAN band setting</td><td><code>wifi link</code>, <code>show wlan name</code></td></tr>
<tr><td>Ek area mein har jagah slow</td><td>Co-channel overlap, wide channels, slow rates</td><td><code>show ap dot11 5ghz channel</code></td></tr>
<tr><td>High retries, achha RSSI</td><td>Non-Wi-Fi interferer</td><td>CleanAir ya spectrum view</td></tr>
<tr><td>Cells bade, sticky clients</td><td>Power zyada, low rates enabled</td><td><code>show ap rf-profile name ... detail</code></td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Power, width aur channels ek saath badalna; ek client ka symptom theek karne ke liye poore floor ki power badhana; profile edit karne ki jagah delete karna; proof step skip karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehla number RSSI plus band hai; doosra overlap; teesra lowest mandatory rate. "Weak signal" ticket power cap ho sakta hai, building mein hole nahi.</p></div>

<div class="scn"><h4>Meeting Room 4 ka sticky phone</h4><p>Ek manager ka phone 2.4 GHz par atka raha aur video calls par girta raha. AP ne purane "cells chhote karo" project ke RF profile mein 5 GHz cap 8 dBm dikhaya. Engineer ne 5 GHz par -76 dBm prove kiya, cap 17 dBm kiya, aur phone 5 GHz par -67 dBm par chala gaya.</p><p><b>Seekh:</b> building ko doshi thehrane se pehle profile caps check karo.</p></div>

<div class="iv"><p class="q">"Client 2.4 GHz par hai jabki AP 5 GHz support karta hai. Troubleshoot kaise karoge?"</p><p>Client link se band aur RSSI padho, phir AP radios aur RF profile (power cap, rates, width), aur WLAN band setting. Client 5 GHz sirf lagbhag -70 dBm se upar prefer karta hai, isliye power cap use fansa sakta hai. Ek cheez badlo, reconnect karo, usi command se prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: symptom, evidence, layer, ek hypothesis, ek fix, proof.</li>
<li>Coverage-hole lab: 8 dBm cap ne 5 GHz par -76.6 dBm diya; 17 dBm ne -67.6 dBm diya aur fix kiya.</li>
<li>Width-trap lab: 80 MHz paanch APs ke liye do blocks chhodta hai; 40 MHz sabse wide clean width hai.</li>
<li>Profiles ko delete karne ki jagah edit karo (shutdown, change, no shutdown).</li>
<li>Har fix ko usi evidence se prove karo jo pehle collect kiya tha.</li>
</ul></div>
`}};export{e as default};