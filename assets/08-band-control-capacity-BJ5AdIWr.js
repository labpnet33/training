var e={id:`band-control-capacity`,h:{en:`Data rates, band control, coverage versus capacity, and the wl-band-shutdown lab`,hi:`Data rates, band control, coverage vs capacity, aur wl-band-shutdown lab`},body:{en:`
<p>After channels and power, the third design tool is deciding which <b>bands and rates</b> are on at all. This chapter covers data-rate control, band steering and band shutdown, how to reason about coverage versus capacity, and 6 GHz. It ends with the wl-band-shutdown ticket, where a switched-off band makes a handset see no network.</p>

<h3>Data rates: mandatory, supported, disabled</h3>
<p>Every band has a list of data rates. A rate can be <b>mandatory</b> (every client must support it; the AP sends beacons and multicast at the lowest mandatory rate), <b>supported</b> (optional) or <b>disabled</b> (not offered). Disabling the lowest rates has three effects:</p>
<ul>
<li>The cell shrinks: a client too far away cannot decode the beacon at, say, 12 Mbps, so it does not try to join the weak AP and roams to a closer one.</li>
<li>Beacons and management frames take much less airtime. A beacon at 1 Mbps takes about 12 times longer than at 12 Mbps.</li>
<li>Slow clients cannot drag everyone's airtime down.</li>
</ul>
<table class="cmp"><tr><th>Band</th><th>Common enterprise setting</th><th>Why</th></tr>
<tr><td>2.4 GHz</td><td>Disable 1, 2, 5.5, 11 Mbps (802.11b); mandatory 12 Mbps</td><td>No 802.11b clients; shorter beacons; tighter cell</td></tr>
<tr><td>5 GHz</td><td>Mandatory 12 Mbps or 24 Mbps; 6 and 9 disabled</td><td>High-density clean cell edge</td></tr>
<tr><td>Voice area</td><td>Mandatory 12 Mbps; higher minimum</td><td>Predictable roaming and airtime</td></tr>
</table>
<div class="note"><p><b>Not simulated in the lab.</b> The lab RF profile has only description, tx-power max and the shutdown state. Rates, band select and high density are covered in wl-design (Wireless design). Data rates, band steering, client load balancing and the high-density options are real 9800 RF profile features explained here as concepts.</p></div>

<h3>Band steering and band selection</h3>
<p>Clients decide which band to use, and many pick 2.4 GHz out of habit. <b>Band select</b> (band steering) makes the AP ignore early probe requests on 2.4 GHz from dual-band clients so they find the 5 GHz radio. It helps capacity but can delay association, so it is not suitable for some voice or old devices. Other tools that push clients to 5 GHz: lower 2.4 GHz power, fewer 2.4 GHz radios, and an SSID design where you only use 2.4 GHz on a dedicated IoT SSID.</p>

<h3>Shutting a band down</h3>
<p>Sometimes you intentionally turn a band off: remove 2.4 GHz entirely in a modern office, disable a band during a test, or move APs between bands. There are two controller-level ways, and they differ:</p>
<table class="cmp"><tr><th>Method</th><th>Command (lab)</th><th>Effect</th></tr>
<tr><td>Global band switch</td><td><code>ap dot11 5ghz shutdown</code></td><td>The whole band is off on the controller for all APs</td></tr>
<tr><td>RF profile shutdown</td><td><code>shutdown</code> inside the RF profile</td><td>The band is off only for APs whose RF tag uses that profile</td></tr>
</table>
<p>Both are reversible and appear in the running configuration, so a quick <code>show running-config | include shutdown</code> and the radio tables will show them. The subtle trap is that a new RF profile starts shut down, so the moment you bind it to an RF tag and tag the APs, their radios for that band go off unless you enable the profile.</p>

<h3>Coverage versus capacity</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Coverage versus capacity design">
<rect x="20" y="20" width="280" height="150" rx="8" fill="#fed7aa"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">Coverage design</text>
<text x="160" y="76" text-anchor="middle" class="svg-ink" font-size="12">Few APs, high power</text><text x="160" y="98" text-anchor="middle" class="svg-ink" font-size="12">Low data rates allowed</text><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="12">Good for: warehouse, outdoor</text><text x="160" y="146" text-anchor="middle" class="svg-muted" font-size="11">risk: contention</text>
<rect x="340" y="20" width="280" height="150" rx="8" fill="#bbf7d0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">Capacity design</text>
<text x="480" y="76" text-anchor="middle" class="svg-ink" font-size="12">Many APs, low power</text><text x="480" y="98" text-anchor="middle" class="svg-ink" font-size="12">Low rates disabled, 5 and 6 GHz first</text><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="12">Good for: lecture hall, office</text><text x="480" y="146" text-anchor="middle" class="svg-muted" font-size="11">risk: coverage holes</text>
</svg><p class="cap">The same site can use both designs in different areas, with different RF profiles and RF tags.</p></div>
<p>Capacity planning starts from clients and applications: for 60 students each using 4 Mbps video, you need about 240 Mbps of real throughput. One 20 MHz 5 GHz cell gives roughly 100 to 150 Mbps in practice, so plan at least two to three cells in that hall on different channels, or wider channels if the spectrum allows. Always plan with real application throughput, not the peak data rate on the box.</p>

<h3>6 GHz in one paragraph</h3>
<p>Wi-Fi 6E and Wi-Fi 7 use the 6 GHz band, which is new, clean and has many wide channels. India has opened the lower 6 GHz band (5925 to 6425 MHz) for indoor licence-free use, and an AP can use it only if its regulatory domain allows it. 6 GHz, Wi-Fi 6E and Wi-Fi 7 are taught in wl-standards (Wi-Fi standards). It has no legacy 802.11a/b/g/n clients, so no low-rate overhead. Clients discover 6 GHz through out-of-band hints (reduced neighbour reports in 2.4 and 5 GHz beacons) or by scanning preferred channels, and WPA3 is mandatory there. Range is the shortest, so 6 GHz is a capacity tool. It is not simulated in the lab.</p>

<h3>The wl-band-shutdown lab (troubleshoot)</h3>
<p>A 5 GHz-only handset cannot find NK-STAFF. The WLAN, policy and policy tag are fine. A new RF profile CAMPUS-5 was bound to both APs through RF tag RF-CAMPUS. Think before typing: WLAN problems show up on every band, so a single-band failure points at the radio. Check the 5 GHz radio state.</p>
<pre class="code">WLC1# show ap dot11 5ghz summary
WLC1# show ap rf-profile summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  <span class="hl">Disabled</span>  36       1
AP2                  All      0011.2233.4412  <span class="hl">Disabled</span>  40       1

RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Down</span>      Global</pre>
<p>Both radios are Disabled and the profile is Down. The profile was created and bound but never enabled, so the 5 GHz band is off for every AP that uses RF-CAMPUS. Repair only that:</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# end
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP1                  All      0011.2233.4402  <span class="hl">Enabled</span>   36       1
AP2                  All      0011.2233.4412  <span class="hl">Enabled</span>   40       1</pre>
<p>Then, on the 5 GHz-only client, <code>wifi status</code> must show NK-STAFF on 5 GHz in VLAN 20, and <code>ping 10.10.60.20</code> must answer. You did not recreate the WLAN, policy or tags: the principle of the smallest correct fix. Notice also that this is the reverse of wl-rf-power: there you created a profile and enabled it in the same session; here someone forgot.</p>

<div class="warn"><p><b>Common mistakes.</b> Checking the WLAN and policy tag for a one-band problem; fixing it with the global <code>ap dot11 5ghz shutdown</code> state when the profile is the culprit (always read both); disabling 2.4 GHz without checking legacy and IoT devices.</p></div>
<div class="exam"><p><b>Exam trap.</b> "5 GHz radios disabled, WLAN and tags fine": look at the RF profile or the global band switch. And: a profile that is not enabled does not "do nothing", it turns the band off for tagged APs in this model.</p></div>

<div class="scn"><h4>The handset that saw nothing</h4><p>After a power-tuning change window, the warehouse's new handsets (5 GHz only) could not connect while laptops on 2.4 GHz were fine. The engineer compared the AP radio tables: 2.4 GHz Enabled, 5 GHz Disabled. The new RF profile had been created and bound but left shut down. One command brought the radios up.</p><p><b>Lesson:</b> a one-band outage means the radio, not the SSID.</p></div>

<div class="iv"><p class="q">"Clients on 2.4 GHz work but 5 GHz clients cannot see the SSID. How do you troubleshoot?"</p><p>Check the 5 GHz radio status for the APs, the RF tag and RF profile state, and the global band switch, in that order. The SSID is shared by both bands, so the WLAN and policy tag are unlikely culprits. Fix the specific object and verify with a 5 GHz client.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> See which radios are on in <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b>, then open <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b>, the 5 GHz profile, and set <b>Status</b> to enabled.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Disabling low data rates tightens cells and saves airtime (concept, not in the lab profile).</li>
<li>Band steering and fewer 2.4 GHz radios push clients to 5 GHz.</li>
<li>A shut down RF profile turns that band off for APs using its RF tag.</li>
<li>Single-band outage means check radio state and RF profile first.</li>
<li>wl-band-shutdown fix: ap dot11 5ghz rf-profile CAMPUS-5 then no shutdown.</li>
</ul></div>
`,hi:`
<p>Channels aur power ke baad teesra design tool yeh decide karna hai ki kaunse <b>bands aur rates</b> on hain. Yeh chapter data-rate control, band steering aur band shutdown, coverage vs capacity ka reasoning, aur 6 GHz cover karta hai. Ant mein wl-band-shutdown ticket hai, jahan band off hone se handset ko network nahi dikhta.</p>

<h3>Data rates: mandatory, supported, disabled</h3>
<p>Har band ki data rates ki list hoti hai. Ek rate <b>mandatory</b> ho sakta hai (har client ko support karna padta hai; AP beacons aur multicast lowest mandatory rate par bhejta hai), <b>supported</b> (optional) ya <b>disabled</b> (offer nahi hota). Lowest rates disable karne ke teen asar hote hain:</p>
<ul>
<li>Cell sikudti hai: bahut door ka client beacon ko, maan lo, 12 Mbps par decode nahi kar paata, isliye woh weak AP se join karne ki koshish nahi karta aur paas ke AP par roam karta hai.</li>
<li>Beacons aur management frames bahut kam airtime lete hain. 1 Mbps par beacon 12 Mbps ke mukable lagbhag 12 guna zyada der leta hai.</li>
<li>Slow clients sab ka airtime neeche nahi kheench sakte.</li>
</ul>
<table class="cmp"><tr><th>Band</th><th>Common enterprise setting</th><th>Kyun</th></tr>
<tr><td>2.4 GHz</td><td>1, 2, 5.5, 11 Mbps (802.11b) disable; 12 Mbps mandatory</td><td>802.11b clients nahi; chhote beacons; tight cell</td></tr>
<tr><td>5 GHz</td><td>12 Mbps ya 24 Mbps mandatory; 6 aur 9 disabled</td><td>High-density clean cell edge</td></tr>
<tr><td>Voice area</td><td>12 Mbps mandatory; higher minimum</td><td>Predictable roaming aur airtime</td></tr>
</table>
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab RF profile mein sirf description, tx-power max aur shutdown state hai. Rates, band select aur high density wl-design (Wireless design) mein cover hote hain. Data rates, band steering, client load balancing aur high-density options real 9800 RF profile features hain jo yahan concept ke roop mein samjhaye gaye hain.</p></div>

<h3>Band steering aur band selection</h3>
<p>Clients decide karte hain kaunsa band use karein, aur kai aadatan 2.4 GHz chun lete hain. <b>Band select</b> (band steering) AP ko 2.4 GHz par dual-band clients ke shuruaati probe requests ignore karwata hai taaki woh 5 GHz radio dhoondh lein. Yeh capacity mein madad karta hai lekin association delay kar sakta hai, isliye kuch voice ya purane devices ke liye suitable nahi. Clients ko 5 GHz par dhakelne ke aur tools: 2.4 GHz power kam karo, 2.4 GHz radios kam karo, aur aisa SSID design jahan 2.4 GHz sirf dedicated IoT SSID par ho.</p>

<h3>Band shutdown karna</h3>
<p>Kabhi kabhi aap jaan-boojh kar band off karte ho: modern office mein 2.4 GHz poori tarah hataana, test ke dauran band disable karna, ya APs ko bands ke beech move karna. Controller-level par do tareeke hain, aur woh alag hain:</p>
<table class="cmp"><tr><th>Method</th><th>Command (lab)</th><th>Asar</th></tr>
<tr><td>Global band switch</td><td><code>ap dot11 5ghz shutdown</code></td><td>Poora band controller par saare APs ke liye off</td></tr>
<tr><td>RF profile shutdown</td><td>RF profile ke andar <code>shutdown</code></td><td>Band sirf un APs ke liye off jinka RF tag woh profile use karta hai</td></tr>
</table>
<p>Dono reversible hain aur running configuration mein dikhte hain, isliye ek quick <code>show running-config | include shutdown</code> aur radio tables unhe dikha denge. Subtle trap yeh hai ki naya RF profile shut down shuru hota hai, isliye jaise hi aap use RF tag se bind karke APs ko tag karte ho, un APs ke us band ke radios off ho jaate hain jab tak profile enable na karo.</p>

<h3>Coverage versus capacity</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Coverage vs capacity design">
<rect x="20" y="20" width="280" height="150" rx="8" fill="#fed7aa"/><text x="160" y="44" text-anchor="middle" class="svg-ink" font-size="14">Coverage design</text>
<text x="160" y="76" text-anchor="middle" class="svg-ink" font-size="12">Kam APs, high power</text><text x="160" y="98" text-anchor="middle" class="svg-ink" font-size="12">Low data rates allowed</text><text x="160" y="120" text-anchor="middle" class="svg-ink" font-size="12">Kaam ka: warehouse, outdoor</text><text x="160" y="146" text-anchor="middle" class="svg-muted" font-size="11">risk: contention</text>
<rect x="340" y="20" width="280" height="150" rx="8" fill="#bbf7d0"/><text x="480" y="44" text-anchor="middle" class="svg-ink" font-size="14">Capacity design</text>
<text x="480" y="76" text-anchor="middle" class="svg-ink" font-size="12">Zyada APs, low power</text><text x="480" y="98" text-anchor="middle" class="svg-ink" font-size="12">Low rates disabled, pehle 5 aur 6 GHz</text><text x="480" y="120" text-anchor="middle" class="svg-ink" font-size="12">Kaam ka: lecture hall, office</text><text x="480" y="146" text-anchor="middle" class="svg-muted" font-size="11">risk: coverage holes</text>
</svg><p class="cap">Ek hi site alag areas mein dono designs use kar sakta hai, alag RF profiles aur RF tags ke saath.</p></div>
<p>Capacity planning clients aur applications se shuru hoti hai: 60 students jo har ek 4 Mbps video use karte hain, unke liye lagbhag 240 Mbps real throughput chahiye. Ek 20 MHz 5 GHz cell practice mein lagbhag 100 se 150 Mbps deti hai, isliye us hall mein alag channels par kam se kam do se teen cells plan karo, ya spectrum allow kare to wider channels. Hamesha real application throughput se plan karo, box ke peak data rate se nahi.</p>

<h3>6 GHz ek paragraph mein</h3>
<p>Wi-Fi 6E aur Wi-Fi 7 6 GHz band use karte hain, jo naya, clean hai aur jismein bahut saare wide channels hain. India ne lower 6 GHz band (5925 se 6425 MHz) indoor licence-free use ke liye khola hai, aur AP use tabhi kar sakta hai jab uska regulatory domain allow kare. 6 GHz, Wi-Fi 6E aur Wi-Fi 7 wl-standards (Wi-Fi standards) mein sikhaye jaate hain. Isme legacy 802.11a/b/g/n clients nahi hote, isliye low-rate overhead nahi. Clients 6 GHz ko out-of-band hints (2.4 aur 5 GHz beacons mein reduced neighbour reports) se ya preferred channels scan karke dhoondhte hain, aur wahan WPA3 mandatory hai. Range sabse short hai, isliye 6 GHz capacity tool hai. Lab mein simulate nahi hota.</p>

<h3>wl-band-shutdown lab (troubleshoot)</h3>
<p>5 GHz-only handset NK-STAFF nahi dhoondh paata. WLAN, policy aur policy tag theek hain. Naya RF profile CAMPUS-5 RF tag RF-CAMPUS ke through dono APs se bound hai. Type karne se pehle socho: WLAN problems har band par dikhte hain, isliye single-band failure radio ki taraf ishara karta hai. 5 GHz radio state check karo.</p>
<pre class="code">WLC1# show ap dot11 5ghz summary
WLC1# show ap rf-profile summary</pre>
<pre class="out">AP Name              Subband  Radio Mac       Status    Channel  Power Level
-----------------------------------------------------------------------------
AP1                  All      0011.2233.4402  <span class="hl">Disabled</span>  36       1
AP2                  All      0011.2233.4412  <span class="hl">Disabled</span>  40       1

RF Profile Name                Band    State     Max TX power
-----------------------------------------------------------------
CAMPUS-5                       5 GHz   <span class="hl">Down</span>      Global</pre>
<p>Dono radios Disabled hain aur profile Down hai. Profile banaya aur bound kiya gaya lekin enable nahi kiya gaya, isliye RF-CAMPUS use karne wale har AP ke liye 5 GHz band off hai. Sirf yahi repair karo:</p>
<pre class="code">WLC1(config)# ap dot11 5ghz rf-profile CAMPUS-5
WLC1(config-rf-profile)# no shutdown
WLC1(config-rf-profile)# end
WLC1# show ap dot11 5ghz summary</pre>
<pre class="out">AP1                  All      0011.2233.4402  <span class="hl">Enabled</span>   36       1
AP2                  All      0011.2233.4412  <span class="hl">Enabled</span>   40       1</pre>
<p>Phir 5 GHz-only client par <code>wifi status</code> NK-STAFF ko 5 GHz par VLAN 20 mein dikhaye aur <code>ping 10.10.60.20</code> jawab de. Aapne WLAN, policy ya tags dobara nahi banaye: sabse chhote sahi fix ka principle. Yeh bhi dhyan do ki yeh wl-rf-power ka ulta hai: wahan aapne profile ek hi session mein banaya aur enable kiya; yahan kisi ne bhula diya.</p>

<div class="warn"><p><b>Common galtiyan.</b> One-band problem ke liye WLAN aur policy tag check karna; jab profile doshi ho tab global <code>ap dot11 5ghz shutdown</code> state se fix karna (hamesha dono padho); legacy aur IoT devices check kiye bina 2.4 GHz disable karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "5 GHz radios disabled, WLAN aur tags theek": RF profile ya global band switch dekho. Aur: jo profile enable nahi hai woh "kuch nahi karta" aisa nahi, is model mein woh tagged APs ke liye band off kar deta hai.</p></div>

<div class="scn"><h4>Handset jisko kuch nahi dikha</h4><p>Power-tuning change window ke baad warehouse ke naye handsets (sirf 5 GHz) connect nahi ho paye jabki 2.4 GHz wale laptops theek the. Engineer ne AP radio tables compare kiye: 2.4 GHz Enabled, 5 GHz Disabled. Naya RF profile bana aur bound tha lekin shut down chhoda gaya tha. Ek command ne radios up kar diye.</p><p><b>Seekh:</b> one-band outage matlab radio, SSID nahi.</p></div>

<div class="iv"><p class="q">"2.4 GHz par clients kaam karte hain lekin 5 GHz clients ko SSID nahi dikhta. Kaise troubleshoot karoge?"</p><p>APs ka 5 GHz radio status, RF tag aur RF profile state, aur global band switch, isi order mein check karo. SSID dono bands share karte hain, isliye WLAN aur policy tag shayad hi doshi hon. Specific object fix karo aur 5 GHz client se verify karo.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> Kaunse radios on hain yeh <b>Monitoring &gt; Wireless &gt; Radios &gt; 5 GHz</b> mein dekho, phir <b>Configuration &gt; Tags &amp; Profiles &gt; RF</b> kholo, 5 GHz profile mein <b>Status</b> enabled karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Low data rates disable karne se cells tight hoti hain aur airtime bachta hai (concept, lab profile mein nahi).</li>
<li>Band steering aur kam 2.4 GHz radios clients ko 5 GHz par dhakelte hain.</li>
<li>Shut down RF profile us RF tag ke APs ke liye woh band off kar deta hai.</li>
<li>Single-band outage mein pehle radio state aur RF profile check karo.</li>
<li>wl-band-shutdown fix: ap dot11 5ghz rf-profile CAMPUS-5 phir no shutdown.</li>
</ul></div>
`}};export{e as default};