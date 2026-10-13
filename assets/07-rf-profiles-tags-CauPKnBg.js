var e={id:`rf-profiles-tags`,h:{en:`RF profiles and RF tags on the 9800, and the wl-rf-power lab`,hi:`9800 par RF profiles aur RF tags, aur wl-rf-power lab`},body:{en:`
<p>On the Catalyst 9800 family, RF settings are not typed on each AP. They live in a reusable <b>RF profile</b> for one band, and two profiles (one for 2.4 GHz, one for 5 GHz) are bundled into an <b>RF tag</b>. An AP is then pointed at the tag. This is the same tag idea you met in wl-start, where the policy tag chose which SSIDs an AP serves. This chapter explains the model and then builds it in the wl-rf-power lab.</p>

<h3>The three tags of the 9800 model</h3>
<p>An AP gets its behaviour from three independent tags. Each answers a different question:</p>
<table class="cmp"><tr><th>Tag</th><th>Question it answers</th><th>Contains</th></tr>
<tr><td>Policy tag</td><td>Which SSIDs, in which VLAN?</td><td>WLAN profile to policy profile map</td></tr>
<tr><td>Site tag</td><td>Which AP join settings and site?</td><td>AP profile (country, and more)</td></tr>
<tr><td>RF tag</td><td>Which radio settings?</td><td>One 2.4 GHz RF profile, one 5 GHz RF profile</td></tr>
</table>
<p>An AP with no RF tag uses the <b>default RF tag</b>, which uses the global (default) radio settings, so existing networks keep working without any RF profile. Create an RF tag only when you want different behaviour for some APs: a high-density lecture hall, a warehouse, a lobby.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RF profile to RF tag to AP">
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">RF profile</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="11">5 GHz: CAMPUS-5</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="13">RF profile</text><text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="11">2.4 GHz (default)</text>
<rect x="245" y="60" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">RF tag</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="11">RF-CAMPUS</text>
<rect x="460" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="460" y="110" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="180" y1="45" x2="245" y2="85" stroke="#64748b"/><line x1="180" y1="135" x2="245" y2="105" stroke="#64748b"/><line x1="395" y1="95" x2="460" y2="45" stroke="#64748b"/><line x1="395" y1="95" x2="460" y2="135" stroke="#64748b"/>
</svg><p class="cap">Profiles hold settings, the tag bundles them, the AP is assigned the tag.</p></div>

<h3>What an RF profile can hold</h3>
<p>In a real 9800, an RF profile holds: TPC minimum and maximum power, a transmit power threshold, DCA channel list and width, <b>data rates</b> (mandatory, supported, disabled), a maximum number of clients, the coverage hole thresholds, the high-density options and more. In the lab model you get a smaller subset: a description, <code>tx-power max</code> in dBm (1 to 30), and the shutdown state. That is exactly the knowledge needed for the module labs; the rest is concept and is labelled so in the next chapters.</p>

<h3>The important rules of the model</h3>
<ul>
<li>A new RF profile starts <b>shut down</b>. A shut down profile means that band is off for any AP that uses it (the lab's wl-band-shutdown fault). That is how the lab models it; on a real 9800 the exact effect depends on the release, so enable the profile before you tag APs with it.</li>
<li>A new RF tag starts empty; it does nothing until it points at a profile.</li>
<li>An RF profile is for one band only: <code>ap dot11 24ghz rf-profile NAME</code> or <code>ap dot11 5ghz rf-profile NAME</code>.</li>
<li>The cap you set is in <b>dBm</b>; the AP displays <b>levels</b>. 14 dBm becomes level 3.</li>
<li>Do not confuse the band-wide <code>ap dot11 5ghz shutdown</code> (a global switch for a whole band on the controller) with shutting down one RF profile.</li>
</ul>

<h3>The wl-rf-power lab: configuration</h3>
<p>Site survey advice says limit 5 GHz power to 14 dBm to shrink cells and reduce co-channel interference. Build it in four steps.</p>
<pre class="code"><span class="c">! 1. RF profile for 5 GHz, with a power cap, enabled</span>
WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# tx-power max 14
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
<span class="c">! 2. RF tag that uses the profile</span>
WLC1(config)# wireless tag rf RF-CAMPUS
WLC1(config-rf-tag)# 5ghz-rf-policy CAMPUS-5
WLC1(config-rf-tag)# exit
<span class="c">! 3. Apply the tag to both APs (privileged mode)</span>
WLC1# ap name AP1 rf-tag RF-CAMPUS
WLC1# ap name AP2 rf-tag RF-CAMPUS
<span class="c">! 4. Verify</span>
WLC1# show ap rf-profile summary
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Up</span>        <span class="hl">14 dBm</span>

AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  Enabled   36       <span class="hl">3</span>
AP2                  All      0011.2233.4412  Enabled   40       <span class="hl">3</span></pre>
<p>Both APs dropped from level 1 (20 dBm) to level 3 (14 dBm). Finally prove the client still works: on LAPTOP1 run <code>wifi status</code> to see NK-STAFF on 5 GHz in VLAN 20 and <code>ping 10.10.60.20</code>. Lower power must not cost basic coverage: if LAPTOP1 now fails, the cap was too low for its position and you raise the cap (for example 17 dBm), not remove the design.</p>
<pre class="code">WLC1# show running-config | section rf-profile
WLC1# write memory</pre>
<pre class="out">ap dot11 5ghz rf-profile CAMPUS-5
 tx-power max 14
 no shutdown
!</pre>
<div class="tip"><p><b>Habit:</b> after any RF change, save with <code>write memory</code>, then re-read the summary to prove the change landed on both APs.</p></div>

<h3>Priority: which setting wins?</h3>
<p>Think in layers: global defaults, then the RF profile through the RF tag, then a human override. In the lab the RF profile cap takes precedence over the default level on a radio that uses it. In a real deployment the same idea holds, and RRM works inside the limits the profile sets. This is exactly why a profile is better than editing 200 APs: change one object, all tagged APs follow.</p>

<div class="warn"><p><b>Common mistakes.</b> Creating the profile and tag but never assigning the RF tag to the APs (nothing changes); leaving the profile shut down (the band goes off, see chapter 8); putting a 5 GHz profile into the 2.4 GHz policy slot; entering levels where dBm is expected.</p></div>
<div class="exam"><p><b>Exam trap.</b> RF profile is per band. RF tag has two slots (2.4 and 5 GHz). The RF tag, not the profile, is what you assign to an AP. And an AP with no tag is not broken: it uses the default RF tag.</p></div>

<div class="scn"><h4>One tag per building type</h4><p>A university created three RF tags: RF-LECTURE (low power, high minimum data rate), RF-LIBRARY (medium power) and RF-OUTDOOR (higher power). New APs were simply given the right tag during rollout, and a later power change for all lecture halls was a single edit in one RF profile.</p><p><b>Lesson:</b> profiles and tags turn RF design into a repeatable template.</p></div>

<div class="iv"><p class="q">"How do you apply a specific RF configuration to a group of APs on a 9800?"</p><p>Create an RF profile per band with the settings, add both to an RF tag, and assign the RF tag to the APs. Mention that policy and site tags are independent, and that the default RF tag applies when none is assigned.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz profile CAMPUS-5, maximum power, status enabled), then <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b> tab <b>&gt; Add</b> (RF-CAMPUS), then assign it in <b>Configuration &gt; Wireless &gt; Access Points</b>, select the AP, RF tag. Check the result in <b>Monitoring &gt; Wireless &gt; Clients</b> and the radio table.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF profile (one band) holds radio settings; RF tag bundles a 2.4 and a 5 GHz profile; the AP gets the tag.</li>
<li>Profiles and tags start shut down or empty and must be enabled and assigned.</li>
<li>tx-power max is dBm in the profile; APs show levels (14 dBm is level 3).</li>
<li>The default RF tag keeps APs working when no tag is assigned.</li>
<li>Verify with show ap rf-profile summary and show ap dot11 5ghz summary.</li>
</ul></div>
`,hi:`
<p>Catalyst 9800 family par RF settings har AP par type nahi hoti. Woh ek band ke liye reusable <b>RF profile</b> mein rehti hain, aur do profiles (ek 2.4 GHz, ek 5 GHz) ek <b>RF tag</b> mein bundle hoti hain. Phir AP ko tag par point kiya jaata hai. Yeh wahi tag idea hai jo aapne wl-start mein dekha tha, jahan policy tag decide karta tha ki AP kaunse SSIDs serve karega. Yeh chapter model samjhata hai aur phir wl-rf-power lab mein ise banata hai.</p>

<h3>9800 model ke teen tags</h3>
<p>AP ka behaviour teen independent tags se aata hai. Har ek alag sawaal ka jawab deta hai:</p>
<table class="cmp"><tr><th>Tag</th><th>Kaunsa sawaal</th><th>Kya contain karta hai</th></tr>
<tr><td>Policy tag</td><td>Kaunse SSIDs, kaunse VLAN mein?</td><td>WLAN profile se policy profile ka map</td></tr>
<tr><td>Site tag</td><td>Kaunsi AP join settings aur site?</td><td>AP profile (country, aur bhi)</td></tr>
<tr><td>RF tag</td><td>Kaunsi radio settings?</td><td>Ek 2.4 GHz RF profile, ek 5 GHz RF profile</td></tr>
</table>
<p>Jis AP ka koi RF tag nahi hota woh <b>default RF tag</b> use karta hai, jo global (default) radio settings use karta hai, isliye existing networks kisi RF profile ke bina bhi chalte hain. RF tag tabhi banao jab kuch APs ke liye alag behaviour chahiye: high-density lecture hall, warehouse, lobby.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RF profile se RF tag se AP">
<rect x="20" y="20" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">RF profile</text><text x="100" y="60" text-anchor="middle" class="svg-muted" font-size="11">5 GHz: CAMPUS-5</text>
<rect x="20" y="110" width="160" height="50" rx="8" fill="#bae6fd"/><text x="100" y="132" text-anchor="middle" class="svg-ink" font-size="13">RF profile</text><text x="100" y="150" text-anchor="middle" class="svg-muted" font-size="11">2.4 GHz (default)</text>
<rect x="245" y="60" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="13">RF tag</text><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="11">RF-CAMPUS</text>
<rect x="460" y="20" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="50" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="460" y="110" width="160" height="50" rx="8" fill="#ddd6fe"/><text x="540" y="140" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="180" y1="45" x2="245" y2="85" stroke="#64748b"/><line x1="180" y1="135" x2="245" y2="105" stroke="#64748b"/><line x1="395" y1="95" x2="460" y2="45" stroke="#64748b"/><line x1="395" y1="95" x2="460" y2="135" stroke="#64748b"/>
</svg><p class="cap">Profiles settings rakhte hain, tag unhe bundle karta hai, AP ko tag assign hota hai.</p></div>

<h3>RF profile kya hold kar sakta hai</h3>
<p>Real 9800 mein RF profile hold karta hai: TPC minimum aur maximum power, transmit power threshold, DCA channel list aur width, <b>data rates</b> (mandatory, supported, disabled), maximum clients ki sankhya, coverage hole thresholds, high-density options aur bahut kuch. Lab model mein aapko chhota subset milta hai: description, <code>tx-power max</code> dBm mein (1 se 30), aur shutdown state. Module labs ke liye yahi knowledge kaafi hai; baaki concept hai aur agle chapters mein aise label kiya gaya hai.</p>

<h3>Model ke zaroori rules</h3>
<ul>
<li>Naya RF profile <b>shut down</b> shuru hota hai. Shut down profile ka matlab hai ki use karne wale kisi bhi AP ke liye woh band off hai (lab ka wl-band-shutdown fault). Lab ise aise model karta hai; real 9800 par exact effect release par depend karta hai, isliye profile ko AP tag karne se pehle enable karo.</li>
<li>Naya RF tag khaali shuru hota hai; jab tak woh profile par point na kare kuch nahi karta.</li>
<li>RF profile sirf ek band ke liye hai: <code>ap dot11 24ghz rf-profile NAME</code> ya <code>ap dot11 5ghz rf-profile NAME</code>.</li>
<li>Jo cap aap set karte ho woh <b>dBm</b> mein hai; AP <b>levels</b> dikhata hai. 14 dBm level 3 ban jaata hai.</li>
<li>Band-wide <code>ap dot11 5ghz shutdown</code> (controller par poore band ka global switch) ko ek RF profile ke shutdown se confuse mat karo.</li>
</ul>

<h3>wl-rf-power lab: configuration</h3>
<p>Site survey advice kehti hai ki cells chhoti karne aur co-channel interference kam karne ke liye 5 GHz power ko 14 dBm tak limit karo. Chaar steps mein banao.</p>
<pre class="code"><span class="c">! 1. 5 GHz ke liye RF profile, power cap ke saath, enabled</span>
WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# tx-power max 14
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# exit
<span class="c">! 2. RF tag jo profile use kare</span>
WLC1(config)# wireless tag rf RF-CAMPUS
WLC1(config-rf-tag)# 5ghz-rf-policy CAMPUS-5
WLC1(config-rf-tag)# exit
<span class="c">! 3. Tag dono APs par apply karo (privileged mode)</span>
WLC1# ap name AP1 rf-tag RF-CAMPUS
WLC1# ap name AP2 rf-tag RF-CAMPUS
<span class="c">! 4. Verify</span>
WLC1# show ap rf-profile summary
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Up</span>        <span class="hl">14 dBm</span>

AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  Enabled   36       <span class="hl">3</span>
AP2                  All      0011.2233.4412  Enabled   40       <span class="hl">3</span></pre>
<p>Dono APs level 1 (20 dBm) se level 3 (14 dBm) par aa gaye. Aakhir mein prove karo ki client ab bhi kaam karta hai: LAPTOP1 par <code>wifi status</code> chalao taaki NK-STAFF 5 GHz par VLAN 20 mein dikhe aur <code>ping 10.10.60.20</code>. Kam power basic coverage ki keemat par nahi honi chahiye: agar LAPTOP1 ab fail hota hai, to cap uski position ke liye bahut kam tha aur aap cap badhate ho (jaise 17 dBm), design hataate nahi.</p>
<pre class="code">WLC1# show running-config | section rf-profile
WLC1# write memory</pre>
<pre class="out">ap dot11 5ghz rf-profile CAMPUS-5
 tx-power max 14
 no shutdown
!</pre>
<div class="tip"><p><b>Aadat:</b> kisi bhi RF change ke baad <code>write memory</code> se save karo, phir summary dobara padho taaki prove ho ki change dono APs par land hua.</p></div>

<h3>Priority: kaunsi setting jeetti hai?</h3>
<p>Layers mein socho: global defaults, phir RF tag ke through RF profile, phir insaani override. Lab mein RF profile cap us radio par default level se upar chalta hai jo use use karta hai. Real deployment mein bhi yahi idea hai, aur RRM profile ki set ki hui limits ke andar kaam karta hai. Isi liye profile 200 APs ko edit karne se behtar hai: ek object badlo, saare tagged APs follow karte hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Profile aur tag banana lekin RF tag ko APs par assign nahi karna (kuch nahi badalta); profile ko shut down chhod dena (band off ho jaata hai, chapter 8 dekho); 5 GHz profile ko 2.4 GHz policy slot mein daalna; jahan dBm chahiye wahan levels daalna.</p></div>
<div class="exam"><p><b>Exam trap.</b> RF profile per band hai. RF tag mein do slots hain (2.4 aur 5 GHz). AP par RF tag assign hota hai, profile nahi. Aur jis AP ka tag nahi hai woh toota nahi hai: woh default RF tag use karta hai.</p></div>

<div class="scn"><h4>Building type ke hisaab se ek tag</h4><p>Ek university ne teen RF tags banaye: RF-LECTURE (low power, high minimum data rate), RF-LIBRARY (medium power) aur RF-OUTDOOR (zyada power). Naye APs ko rollout mein bas sahi tag de diya gaya, aur baad mein saare lecture halls ka power change ek RF profile mein ek edit tha.</p><p><b>Seekh:</b> profiles aur tags RF design ko repeatable template bana dete hain.</p></div>

<div class="iv"><p class="q">"9800 par APs ke group par specific RF configuration kaise apply karoge?"</p><p>Settings ke saath har band ka RF profile banao, dono ko RF tag mein daalo, aur RF tag APs ko assign karo. Batao ki policy aur site tags independent hain, aur koi tag assign na ho to default RF tag lagta hai.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; Add</b> (5 GHz profile CAMPUS-5, maximum power, status enabled), phir <b>Configuration &gt; Tags &amp; Profiles &gt; Tags &gt; RF</b> tab <b>&gt; Add</b> (RF-CAMPUS), phir <b>Configuration &gt; Wireless &gt; Access Points</b> mein AP select karke RF tag assign karo. Result <b>Monitoring &gt; Wireless &gt; Clients</b> aur radio table mein check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF profile (ek band) radio settings rakhta hai; RF tag 2.4 aur 5 GHz profile bundle karta hai; AP ko tag milta hai.</li>
<li>Profiles aur tags shut down ya khaali shuru hote hain aur enable aur assign karne padte hain.</li>
<li>tx-power max profile mein dBm hai; APs levels dikhate hain (14 dBm level 3 hai).</li>
<li>Default RF tag APs ko chalta rakhta hai jab koi tag assign na ho.</li>
<li>show ap rf-profile summary aur show ap dot11 5ghz summary se verify karo.</li>
</ul></div>
`}};export{e as default};