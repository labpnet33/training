var e={id:`channel-plans`,h:{en:`Channel plans, widths, DFS and the wl-design-clean-5g-plan lab`,hi:`Channel plans, widths, DFS aur wl-design-clean-5g-plan lab`},body:{en:`
<p>A channel plan decides which AP uses which channel and how wide. A bad plan makes APs fight each other even when signal is perfect. <code>wl-rf</code> introduced co-channel contention; here you design the whole map, choose widths, understand DFS, and build the plan in the lab <code>wl-design-clean-5g-plan</code>.</p>

<h3>Analogy: radio stations in a city</h3>
<p>If two stations broadcast on the same frequency in one city, listeners hear a mess. Cities give every station its own frequency and reuse a frequency only far away. A Wi-Fi channel plan does exactly this for APs on one floor.</p>

<h3>Co-channel contention versus adjacent-channel interference</h3>
<ul>
<li><b>Co-channel contention (CCI):</b> APs on the <i>same</i> channel that hear each other politely take turns (CSMA/CA). No corruption, but they share one airtime budget. Five APs that hear each other on channel 36 give each AP about one fifth of the airtime.</li>
<li><b>Adjacent-channel interference (ACI):</b> APs on <i>partly overlapping</i> channels cannot decode each other, so they treat each other's frames as noise and do not take turns. This is worse than CCI. In 2.4 GHz, channels 1, 6 and 11 are the only non-overlapping 20 MHz set; channel 3 or 8 is a classic mistake.</li>
</ul>

<h3>The 5 GHz channel pool</h3>
<table class="cmp"><tr><th>Width</th><th>20 MHz channels</th><th>Bonding</th><th>Typical use</th></tr>
<tr><td><b>20 MHz</b></td><td>up to about 25 in many regulatory domains (varies by country)</td><td>none</td><td>Enterprise default, high density</td></tr>
<tr><td><b>40 MHz</b></td><td>half as many blocks</td><td>2 channels</td><td>Medium density</td></tr>
<tr><td><b>80 MHz</b></td><td>a quarter as many blocks</td><td>4 channels</td><td>Low density, few APs</td></tr>
<tr><td><b>160 MHz</b></td><td>a handful of blocks</td><td>8 channels</td><td>Home, special cases</td></tr>
</table>
<p>The lab model uses only the <b>non-DFS</b> list: 36, 40, 44, 48, 149, 153, 157, 161. That is eight 20 MHz channels, four 40 MHz blocks and two 80 MHz blocks. Each doubling of width also doubles the noise power in the channel (+3 dB), so the signal needs 3 dB more SNR for the same data rate: the cell shrinks while the neighbour count grows.</p>
<div class="eg"><p><b>Worked example: noise versus width.</b> A -95 dBm noise floor at 20 MHz becomes -92 dBm at 40, -89 dBm at 80 and -86 dBm at 160 MHz. A client at -67 dBm has 28 dB SNR at 20 MHz but only 22 dB at 80 MHz, which supports a lower modulation. Wider is faster only when the channel is clean and the signal is strong.</p></div>

<h3>The width trap</h3>
<p>Marketing says 80 MHz equals gigabit speed. For one lonely AP, true. For five APs with only two 80 MHz blocks, neighbours share spectrum and everyone is slower. In enterprise designs <b>20 MHz is the default and 40 MHz is the usual maximum</b>; 80 MHz only fits when the number of APs is small or DFS and 6 GHz supply enough blocks. The lab <code>wl-design-width-trap</code> (chapter 11) shows this with real numbers.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Non-DFS 5 GHz channels and widths">
<text x="10" y="18" class="svg-muted" font-size="12">Model channels (non-DFS)</text>
<g font-size="12" text-anchor="middle">
<rect x="10" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="46" y="48" class="svg-ink">36</text>
<rect x="82" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="118" y="48" class="svg-ink">40</text>
<rect x="154" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="190" y="48" class="svg-ink">44</text>
<rect x="226" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="262" y="48" class="svg-ink">48</text>
<rect x="330" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="366" y="48" class="svg-ink">149</text>
<rect x="402" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="438" y="48" class="svg-ink">153</text>
<rect x="474" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="510" y="48" class="svg-ink">157</text>
<rect x="546" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="582" y="48" class="svg-ink">161</text>
<rect x="10" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="82" y="92" class="svg-ink">40 MHz</text>
<rect x="154" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="226" y="92" class="svg-ink">40 MHz</text>
<rect x="330" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="402" y="92" class="svg-ink">40 MHz</text>
<rect x="474" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="546" y="92" class="svg-ink">40 MHz</text>
<rect x="10" y="118" width="288" height="26" fill="#fde68a" stroke="#64748b"/><text x="154" y="136" class="svg-ink">80 MHz block A</text>
<rect x="330" y="118" width="288" height="26" fill="#fde68a" stroke="#64748b"/><text x="474" y="136" class="svg-ink">80 MHz block B</text>
</g></svg><p class="cap">Eight 20 MHz channels, four 40 MHz blocks, two 80 MHz blocks in the lab model.</p></div>

<h3>DFS in one minute</h3>
<p>Channels 52 to 144 (in most domains) share spectrum with weather and military radar, so Wi-Fi must use <b>Dynamic Frequency Selection</b>. Before using a DFS channel the AP listens for radar for a <b>channel availability check of 60 seconds</b> (longer, up to 10 minutes, on some weather radar channels in Europe). If it detects radar later, it must leave at once and not return for <b>30 minutes</b>. Clients on that AP drop and reconnect. DFS gives many extra channels, so large buildings use them, but avoid DFS where radar is frequent (near airports or ports), and test voice carefully. DFS radar events are concept only in the lab; the default DCA list there leaves DFS out.</p>

<h3>Building the plan in the lab</h3>
<p>Five APs on floor 2 are pinned to channel 36 by an old survey sheet. The reserved channels 157 and 161 belong to a warehouse bridge. Evidence first:</p>
<pre class="out">WLC1# show ap dot11 5ghz channel

Automatic Channel Assignment
  Channel Assignment Mode      : AUTO
  Allowed Channel List         : 36,40,44,48,149,153,157,161 (global; an RF profile may narrow it)

AP Name              Channel  Width    Source               RF profile
AP1                  <span class="hl">36</span>       20 MHz   Manual               Global Config
AP2                  <span class="hl">36</span>       20 MHz   Manual               Global Config
AP3                  <span class="hl">36</span>       20 MHz   Manual               Global Config</pre>
<p>Every AP is <b>Manual</b> on 36. Build the profile, tag, and release the manual channels:</p>
<pre class="code"><span class="c">! RF profile with a narrow channel list</span>
WLC1(config)# ap dot11 5ghz rf-profile PLAN-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# channel remove 157
WLC1(config-rf-profile)# channel remove 161
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
<span class="c">! RF tag that uses it</span>
WLC1(config)# wireless tag rf RF-PLAN
WLC1(config-wireless-rf-tag)# 5ghz-rf-policy PLAN-5
WLC1(config-wireless-rf-tag)# exit
<span class="c">! Apply to each AP, repeat for AP2 to AP5</span>
WLC1(config)# ap &lt;AP1-ethernet-mac&gt;
WLC1(config-ap-tag)# rf-tag RF-PLAN
WLC1(config-ap-tag)# exit
WLC1# ap name AP1 dot11 5ghz channel auto</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band, RRM, DCA for the channel list and width), <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b>, then <b>Configuration &gt; Wireless &gt; Access Points</b>, the AP, tab Tags. Verify:</p>
<pre class="out">AP Name              Channel  Width    Source               RF profile
AP1                  36       20 MHz   DCA (RF profile)     PLAN-5
AP2                  44       20 MHz   DCA (RF profile)     PLAN-5
AP3                  149      20 MHz   DCA (RF profile)     PLAN-5
AP4                  40       20 MHz   DCA (RF profile)     PLAN-5
AP5                  <span class="hl">153</span>      20 MHz   DCA (RF profile)     PLAN-5</pre>
<p>Five different channels from a list of six, none reserved. The exact numbers your lab shows can differ; what you check is that every channel is on the list and the overlap count is zero.</p>

<div class="warn"><p><b>Common mistakes.</b> Using channel 3 or 8 in 2.4 GHz; leaving APs on <b>Manual</b> after a survey so DCA cannot help; 80 MHz everywhere; forgetting that a channel list on the RF profile also applies to <i>all</i> APs with that RF tag.</p></div>
<div class="exam"><p><b>Exam trap.</b> CCI is contention (polite, shared airtime); ACI is partial overlap (corrupting, worse). DFS needs a 60 second check and a 30 minute non-occupancy period.</p></div>

<div class="scn"><h4>The copied survey sheet</h4><p>After a floor move, the installer typed channels from an old sheet into every AP: all on 36, all manual. Throughput halved at lunch. DCA was on, but manual channels beat it. The engineer built a profile with a 6 channel list, tagged the APs and set channel auto. Retries dropped from 38 to 9 percent.</p><p><b>Lesson:</b> check the Source column, not only the channel number.</p></div>

<div class="iv"><p class="q">"What channel width do you choose for an enterprise office and why?"</p><p>20 MHz by default, 40 MHz where the density is low and enough channels exist, 80 MHz rarely. Each doubling adds 3 dB noise and halves the number of non-overlapping blocks, so more APs overlap. Capacity comes from reuse, not width.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CCI shares airtime; ACI corrupts frames and is worse. 2.4 GHz uses 1, 6, 11 only.</li>
<li>Width doubling gives +3 dB noise and half the blocks; 20 MHz is the enterprise default.</li>
<li>DFS: 60 second channel check, leave on radar, 30 minutes before return.</li>
<li>Lab plan: RF profile with list and width, RF tag, AP tags, channel auto, then verify Source and overlap.</li>
<li>Manual channels override DCA; always read the Source column.</li>
</ul></div>
`,hi:`
<p>Channel plan decide karta hai ki kaunsa AP kaunsa channel aur kitni width use karega. Kharab plan APs ko aapas mein ladwa deta hai chahe signal perfect ho. <code>wl-rf</code> ne co-channel contention introduce kiya tha; yahan aap poora map design karte ho, widths chunte ho, DFS samajhte ho, aur lab <code>wl-design-clean-5g-plan</code> mein plan banate ho.</p>

<h3>Analogy: shehar ke radio stations</h3>
<p>Agar ek shehar mein do stations same frequency par broadcast karein to sunne walon ko gadbad sunai deti hai. Shehar har station ko apni frequency dete hain aur frequency sirf door jaakar reuse karte hain. Wi-Fi channel plan ek floor ke APs ke liye bilkul yahi karta hai.</p>

<h3>Co-channel contention versus adjacent-channel interference</h3>
<ul>
<li><b>Co-channel contention (CCI):</b> <i>same</i> channel par jo APs ek dusre ko sunte hain woh tameez se baari baari bolte hain (CSMA/CA). Corruption nahi hota, lekin woh ek hi airtime budget share karte hain. Channel 36 par paanch APs jo ek dusre ko sunte hain, har AP ko lagbhag ek paanchva hissa airtime dete hain.</li>
<li><b>Adjacent-channel interference (ACI):</b> <i>aanshik overlapping</i> channels par APs ek dusre ko decode nahi kar paate, isliye woh dusre ke frames ko noise maante hain aur baari nahi lete. Yeh CCI se kharab hai. 2.4 GHz mein 1, 6 aur 11 hi non-overlapping 20 MHz set hain; channel 3 ya 8 classic galti hai.</li>
</ul>

<h3>5 GHz channel pool</h3>
<table class="cmp"><tr><th>Width</th><th>20 MHz channels</th><th>Bonding</th><th>Typical use</th></tr>
<tr><td><b>20 MHz</b></td><td>kai regulatory domains mein lagbhag 25 tak (country ke hisaab se)</td><td>koi nahi</td><td>Enterprise default, high density</td></tr>
<tr><td><b>40 MHz</b></td><td>aadhe blocks</td><td>2 channels</td><td>Medium density</td></tr>
<tr><td><b>80 MHz</b></td><td>chauthai blocks</td><td>4 channels</td><td>Low density, kam APs</td></tr>
<tr><td><b>160 MHz</b></td><td>kuch hi blocks</td><td>8 channels</td><td>Home, special cases</td></tr>
</table>
<p>Lab model sirf <b>non-DFS</b> list use karta hai: 36, 40, 44, 48, 149, 153, 157, 161. Yaani aath 20 MHz channels, chaar 40 MHz blocks aur do 80 MHz blocks. Width ka har doubling channel mein noise power bhi double karta hai (+3 dB), isliye same data rate ke liye signal ko 3 dB zyada SNR chahiye: cell chhota hota hai aur neighbours badhte hain.</p>
<div class="eg"><p><b>Worked example: noise versus width.</b> 20 MHz par -95 dBm noise floor 40 par -92 dBm, 80 par -89 dBm aur 160 MHz par -86 dBm ho jaata hai. -67 dBm par client ke paas 20 MHz par 28 dB SNR hai lekin 80 MHz par sirf 22 dB, jo lower modulation support karta hai. Wider tabhi tez hai jab channel saaf ho aur signal strong ho.</p></div>

<h3>Width trap</h3>
<p>Marketing kehti hai 80 MHz matlab gigabit speed. Ek akele AP ke liye sahi. Do hi 80 MHz blocks ke saath paanch APs ke liye padosi spectrum share karte hain aur sab slow ho jaate hain. Enterprise designs mein <b>20 MHz default aur 40 MHz usual maximum</b> hai; 80 MHz tabhi fit hota hai jab APs kam hon ya DFS aur 6 GHz kaafi blocks dein. Lab <code>wl-design-width-trap</code> (chapter 11) yeh real numbers ke saath dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Non-DFS 5 GHz channels aur widths">
<text x="10" y="18" class="svg-muted" font-size="12">Model channels (non-DFS)</text>
<g font-size="12" text-anchor="middle">
<rect x="10" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="46" y="48" class="svg-ink">36</text>
<rect x="82" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="118" y="48" class="svg-ink">40</text>
<rect x="154" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="190" y="48" class="svg-ink">44</text>
<rect x="226" y="30" width="72" height="26" fill="#bae6fd" stroke="#64748b"/><text x="262" y="48" class="svg-ink">48</text>
<rect x="330" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="366" y="48" class="svg-ink">149</text>
<rect x="402" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="438" y="48" class="svg-ink">153</text>
<rect x="474" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="510" y="48" class="svg-ink">157</text>
<rect x="546" y="30" width="72" height="26" fill="#bbf7d0" stroke="#64748b"/><text x="582" y="48" class="svg-ink">161</text>
<rect x="10" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="82" y="92" class="svg-ink">40 MHz</text>
<rect x="154" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="226" y="92" class="svg-ink">40 MHz</text>
<rect x="330" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="402" y="92" class="svg-ink">40 MHz</text>
<rect x="474" y="74" width="144" height="26" fill="#ddd6fe" stroke="#64748b"/><text x="546" y="92" class="svg-ink">40 MHz</text>
<rect x="10" y="118" width="288" height="26" fill="#fde68a" stroke="#64748b"/><text x="154" y="136" class="svg-ink">80 MHz block A</text>
<rect x="330" y="118" width="288" height="26" fill="#fde68a" stroke="#64748b"/><text x="474" y="136" class="svg-ink">80 MHz block B</text>
</g></svg><p class="cap">Lab model mein aath 20 MHz channels, chaar 40 MHz blocks, do 80 MHz blocks.</p></div>

<h3>DFS ek minute mein</h3>
<p>Channels 52 se 144 (zyada tar domains mein) weather aur military radar ke saath spectrum share karte hain, isliye Wi-Fi ko <b>Dynamic Frequency Selection</b> use karna padta hai. DFS channel use karne se pehle AP radar ke liye <b>60 second ka channel availability check</b> sunta hai (Europe mein kuch weather radar channels par zyada, 10 minute tak). Agar baad mein radar mile to use turant channel chhodna padta hai aur <b>30 minute</b> tak wapas nahi aana. Us AP ke clients drop hokar reconnect hote hain. DFS bahut extra channels deta hai, isliye bade buildings use karte hain, lekin jahan radar aksar ho (airports ya ports ke paas) wahan avoid karo, aur voice ko dhyan se test karo. DFS radar events lab mein concept only hain; wahan default DCA list mein DFS nahi hai.</p>

<h3>Lab mein plan banana</h3>
<p>Floor 2 ke paanch APs ek purani survey sheet ne channel 36 par pin kar diye hain. Reserved channels 157 aur 161 warehouse bridge ke hain. Pehle evidence:</p>
<pre class="out">WLC1# show ap dot11 5ghz channel

Automatic Channel Assignment
  Channel Assignment Mode      : AUTO
  Allowed Channel List         : 36,40,44,48,149,153,157,161 (global; an RF profile may narrow it)

AP Name              Channel  Width    Source               RF profile
AP1                  <span class="hl">36</span>       20 MHz   Manual               Global Config
AP2                  <span class="hl">36</span>       20 MHz   Manual               Global Config
AP3                  <span class="hl">36</span>       20 MHz   Manual               Global Config</pre>
<p>Har AP 36 par <b>Manual</b> hai. Profile banao, tag banao, aur manual channels chhodo:</p>
<pre class="code"><span class="c">! Narrow channel list wala RF profile</span>
WLC1(config)# ap dot11 5ghz rf-profile PLAN-5
WLC1(config-rf-profile)# channel chan-width 20
WLC1(config-rf-profile)# channel remove 157
WLC1(config-rf-profile)# channel remove 161
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
<span class="c">! Use karne wala RF tag</span>
WLC1(config)# wireless tag rf RF-PLAN
WLC1(config-wireless-rf-tag)# 5ghz-rf-policy PLAN-5
WLC1(config-wireless-rf-tag)# exit
<span class="c">! Har AP par lagao, AP2 se AP5 ke liye dohrao</span>
WLC1(config)# ap &lt;AP1-ethernet-mac&gt;
WLC1(config-ap-tag)# rf-tag RF-PLAN
WLC1(config-ap-tag)# exit
WLC1# ap name AP1 dot11 5ghz channel auto</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz band, RRM, channel list aur width ke liye DCA), <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b>, phir <b>Configuration &gt; Wireless &gt; Access Points</b>, AP, tab Tags. Verify:</p>
<pre class="out">AP Name              Channel  Width    Source               RF profile
AP1                  36       20 MHz   DCA (RF profile)     PLAN-5
AP2                  44       20 MHz   DCA (RF profile)     PLAN-5
AP3                  149      20 MHz   DCA (RF profile)     PLAN-5
AP4                  40       20 MHz   DCA (RF profile)     PLAN-5
AP5                  <span class="hl">153</span>      20 MHz   DCA (RF profile)     PLAN-5</pre>
<p>Chhe channels ki list mein se paanch alag channels, koi reserved nahi. Aapke lab mein exact numbers alag ho sakte hain; aap yeh check karte ho ki har channel list mein hai aur overlap count zero hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> 2.4 GHz mein channel 3 ya 8 use karna; survey ke baad APs ko <b>Manual</b> par chhod dena jisse DCA madad nahi kar paata; har jagah 80 MHz; yeh bhool jaana ki RF profile par channel list us RF tag wale <i>saare</i> APs par lagu hoti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> CCI contention hai (tameez wala, shared airtime); ACI partial overlap hai (corrupting, kharab). DFS ko 60 second check aur 30 minute non-occupancy period chahiye.</p></div>

<div class="scn"><h4>Copy ki hui survey sheet</h4><p>Floor shift ke baad installer ne purani sheet se har AP mein channels type kar diye: sab 36 par, sab manual. Lunch par throughput aadha ho gaya. DCA on tha, lekin manual channels use hara dete hain. Engineer ne 6 channel list wala profile banaya, APs tag kiye aur channel auto set kiya. Retries 38 se 9 percent par aa gaye.</p><p><b>Seekh:</b> sirf channel number nahi, Source column bhi padho.</p></div>

<div class="iv"><p class="q">"Enterprise office ke liye aap kaun si channel width chunte ho aur kyun?"</p><p>Default 20 MHz, jahan density kam ho aur channels kaafi hon wahan 40 MHz, 80 MHz kabhi kabhi. Har doubling +3 dB noise jodta hai aur non-overlapping blocks aadhe kar deta hai, isliye zyada APs overlap karte hain. Capacity reuse se aati hai, width se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CCI airtime share karta hai; ACI frames corrupt karta hai aur kharab hai. 2.4 GHz mein sirf 1, 6, 11.</li>
<li>Width doubling = +3 dB noise aur aadhe blocks; 20 MHz enterprise default hai.</li>
<li>DFS: 60 second channel check, radar par chhodo, wapas aane se pehle 30 minute.</li>
<li>Lab plan: list aur width wala RF profile, RF tag, AP tags, channel auto, phir Source aur overlap verify.</li>
<li>Manual channels DCA ko override karte hain; hamesha Source column padho.</li>
</ul></div>
`}};export{e as default};