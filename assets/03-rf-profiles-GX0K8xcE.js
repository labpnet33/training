var e={id:`rf-profiles`,h:{en:`RF profiles: bands, band steering, bitrates and channels`,hi:`RF profiles: bands, band steering, bitrates aur channels`},body:{en:`
<h3>What an RF profile is</h3>
<p><b>RF</b> means radio frequency. An <b>RF profile</b> is a named set of radio rules that you assign to APs: which bands the radios use, how clients are guided between bands, the lowest speed allowed, and ideas about channel and power. Instead of tuning every AP by hand, you create a profile once on the <b>RF profiles and splash</b> page and attach it to the APs that need it. The effect appears on the AP radio, so the dashboard changes what the AP sends and accepts in the air.</p>

<h3>Band selection</h3>
<p>The profile decides whether an AP offers <b>2.4 GHz only</b>, <b>5 GHz only</b> or <b>both</b>. Remember from chapter 1: 2.4 GHz reaches farther and every client supports it; 5 GHz is faster and quieter. A profile with both bands gives the widest compatibility. A profile with 5 GHz only gives better speed in a busy store, but it excludes any client that has only a 2.4 GHz radio.</p>
<div class="warn"><p><b>Why a 5 GHz-only profile hides SSIDs.</b> A beacon for an SSID is sent on each band the radio uses. If the profile switches off 2.4 GHz, no beacon is sent there. A 2.4 GHz-only handheld scanner or old phone listens on 2.4 GHz, hears nothing, and shows an empty list. The SSID is enabled, broadcast and available on the AP, yet it is invisible to that client. The cause is the RF profile, not the SSID.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Profile band choice and client visibility">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="13">Profile: dual band</text>
<rect x="20" y="85" width="200" height="50" rx="8" fill="#fde68a"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="13">Profile: 5 GHz only</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="13">Phone 2.4 + 5</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">Scanner 2.4 only</text>
<line x1="220" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="220" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="220" y1="110" x2="330" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="470" y="115" class="svg-muted" font-size="12">no 2.4 GHz beacon: scanner sees nothing</text>
<text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="14">X</text>
<rect x="20" y="165" width="600" height="45" rx="6" fill="#e2e8f0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Band choice in the profile limits which clients can ever see the SSID</text>
</svg><p class="cap">Dual band reaches everyone; 5 GHz only hides the SSID from 2.4 GHz-only clients.</p></div>

<h3>Band steering</h3>
<p><b>Band steering</b> nudges a client that supports both bands to use 5 GHz instead of crowded 2.4 GHz. The AP may delay replies to the client on 2.4 GHz so that it moves to 5 GHz on its own. It helps speed and keeps 2.4 GHz free for older devices. It does not force anything: a 2.4 GHz-only client stays on 2.4 GHz. Exact steering behaviour differs by product; check the vendor documentation.</p>

<h3>Minimum bitrate</h3>
<p>The <b>bitrate</b> is the speed of the radio link. Slow rates use more air time for the same data, so a few far-away clients at low speeds can slow everyone. A <b>minimum bitrate</b> setting tells the AP not to accept the slowest rates. Clients that cannot keep that rate drop off and roam to a closer AP. A higher minimum gives better capacity but smaller effective range; a lower minimum gives longer reach but lower overall speed. In a store with many handheld scanners, choose carefully and test.</p>

<h3>Channel and power ideas</h3>
<p>A <b>channel</b> is a slice of a band. Two nearby APs on the same channel interfere, like two people shouting on the same line. Good design gives neighbouring APs different channels. <b>Transmit power</b> is how loud the AP is: too loud and APs hear each other and clients stick to a far AP; too quiet and there are holes. Dashboards usually pick channel and power automatically; the profile can set limits. Do not memorise numbers here; this track teaches the ideas.</p>
<table class="cmp"><tr><th>Setting</th><th>Effect</th><th>Risk if wrong</th></tr>
<tr><td>Band</td><td>Which radios broadcast</td><td>Some clients cannot see SSIDs</td></tr>
<tr><td>Band steering</td><td>Prefer 5 GHz</td><td>Slow join on edge cases</td></tr>
<tr><td>Min bitrate</td><td>Cuts slow rates</td><td>Weak clients disconnect</td></tr>
<tr><td>Channel / power</td><td>Less interference</td><td>Overlap or coverage holes</td></tr></table>

<h3>Assigning a profile to APs</h3>
<p>On the <b>RF profiles and splash</b> page create the profile, then pick the APs or tags it applies to. At Bharat Retail Co the store counter in Delhi has old barcode scanners, so AP-DEL (tag <code>store</code>) uses a dual-band profile, while the floor APs AP-MUM and AP-BLR can use 5 GHz with steering.</p>
<pre class="out">RF profiles  (network: Delhi Branch)
Profile        Bands     Steering  Min bitrate  Assigned to
Dual-Store     2.4+5     on        low          <span class="hl">AP-DEL</span>
Fast5-Floor    5 only    off       higher       -
Client check:  scanner-DEL (2.4 GHz only) sees: BharatRetail-Staff</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Assigning a profile changes which bands the AP radios transmit beacons and accept clients on, and the rules for rates and steering. It does not change VLANs or firewall. Changes apply on Save changes, and clients on a removed band may drop and reconnect.</p></div>
<div class="exam"><p><b>Exam trap.</b> "One phone sees the SSID, an old scanner does not, same AP." Check the RF profile band first, not the SSID settings.</p></div>

<div class="scn"><h4>The scanner that could not see Wi-Fi</h4><p>Delhi staff reported that new phones joined BharatRetail-Staff but the older handheld scanners showed an empty Wi-Fi list. SSID, broadcast and tag were fine, and AP-DEL was online. AP-DEL had been given a 5 GHz-only profile for speed. The engineer assigned the dual-band profile; scanners found the SSID within a minute.</p><p><b>Lesson:</b> when only some client types lose an SSID, suspect the band.</p></div>

<div class="iv"><p class="q">"What is band steering and when would you not use a 5 GHz-only profile?"</p><p>Strong answer: band steering encourages dual-band clients to use 5 GHz for speed and less interference. A 5 GHz-only profile is wrong where old 2.4 GHz-only devices, such as scanners or IoT tags, must connect, because they will not see the SSID at all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An RF profile is a reusable set of radio rules assigned to APs.</li>
<li>Band choice decides which clients can see an SSID; 5 GHz only hides it from 2.4 GHz-only clients.</li>
<li>Band steering nudges, it does not force.</li>
<li>Minimum bitrate trades range for capacity.</li>
<li>Channels and power are about limiting interference; no VLAN or firewall changes here.</li>
</ul></div>
`,hi:`
<h3>RF profile kya hai</h3>
<p><b>RF</b> ka matlab radio frequency. <b>RF profile</b> radio rules ka ek named set hai jo aap APs ko assign karte ho: radios kaun se bands use karein, clients ko bands ke beech kaise guide kiya jaaye, sabse kam speed kitni allowed hai, aur channel aur power ke ideas. Har AP ko haath se tune karne ke bajay aap profile ek baar <b>RF profiles and splash</b> page par banate ho aur use un APs par lagate ho jinhe chahiye. Asar AP radio par dikhta hai, yaani dashboard badalta hai ki AP hawa mein kya bhejta aur accept karta hai.</p>

<h3>Band selection</h3>
<p>Profile decide karta hai ki AP <b>sirf 2.4 GHz</b>, <b>sirf 5 GHz</b> ya <b>dono</b> offer karega. Chapter 1 se yaad rakho: 2.4 GHz door tak jaata hai aur har client use support karta hai; 5 GHz tez aur shaant hai. Dono bands wala profile sabse wide compatibility deta hai. Sirf 5 GHz wala profile busy store mein behtar speed deta hai, lekin us har client ko exclude kar deta hai jiske paas sirf 2.4 GHz radio hai.</p>
<div class="warn"><p><b>5 GHz-only profile SSIDs kyun chhupata hai.</b> SSID ka beacon radio ke use hone wale har band par bheja jaata hai. Agar profile 2.4 GHz band band kar de, to wahan koi beacon nahi jaata. 2.4 GHz-only handheld scanner ya purana phone 2.4 GHz par sunta hai, kuch nahi sunta, aur khaali list dikhata hai. SSID enabled, broadcast aur AP par available hai, phir bhi us client ko invisible hai. Wajah RF profile hai, SSID nahi.</p></div>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Profile band choice aur client visibility">
<rect x="20" y="20" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="120" y="50" text-anchor="middle" class="svg-ink" font-size="13">Profile: dual band</text>
<rect x="20" y="85" width="200" height="50" rx="8" fill="#fde68a"/><text x="120" y="115" text-anchor="middle" class="svg-ink" font-size="13">Profile: 5 GHz only</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="50" text-anchor="middle" class="svg-ink" font-size="13">Phone 2.4 + 5</text>
<rect x="490" y="20" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">Scanner 2.4 only</text>
<line x1="220" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="220" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<line x1="220" y1="110" x2="330" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="470" y="115" class="svg-muted" font-size="12">2.4 GHz beacon nahi: scanner ko kuch nahi dikhta</text>
<text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="14">X</text>
<rect x="20" y="165" width="600" height="45" rx="6" fill="#e2e8f0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Profile ka band choice decide karta hai kaun se clients SSID dekh sakte hain</text>
</svg><p class="cap">Dual band sab tak pahunchta hai; sirf 5 GHz SSID ko 2.4 GHz-only clients se chhupata hai.</p></div>

<h3>Band steering</h3>
<p><b>Band steering</b> un clients ko jo dono bands support karte hain, bheed wale 2.4 GHz ki jagah 5 GHz use karne ke liye nudge karta hai. AP 2.4 GHz par client ko replies delay kar sakta hai taaki woh khud 5 GHz par chala jaaye. Isse speed badhti hai aur 2.4 GHz purane devices ke liye free rehta hai. Yeh kuch force nahi karta: 2.4 GHz-only client 2.4 GHz par hi rehta hai. Steering ka exact behaviour product ke hisaab se alag hota hai; vendor documentation check karo.</p>

<h3>Minimum bitrate</h3>
<p><b>Bitrate</b> radio link ki speed hai. Dheemi rates same data ke liye zyada air time leti hain, isliye door ke kuch clients dheemi speed par sab ko slow kar sakte hain. <b>Minimum bitrate</b> setting AP ko batati hai ki sabse dheemi rates accept na kare. Jo clients woh rate nahi nibha paate woh gir jaate hain aur kareeb ke AP par roam karte hain. Zyada minimum se capacity behtar hoti hai lekin effective range chhoti; kam minimum se reach lambi lekin overall speed kam. Bahut handheld scanners wale store mein dhyan se chuno aur test karo.</p>

<h3>Channel aur power ke ideas</h3>
<p><b>Channel</b> band ka ek slice hai. Paas ke do APs same channel par interfere karte hain, jaise ek hi line par do log chillate hain. Achhe design mein padosi APs ko alag channels milte hain. <b>Transmit power</b> AP ki awaaz hai: bahut zyada ho to APs ek dusre ko sunte hain aur clients door ke AP se chipke rehte hain; bahut kam ho to coverage mein holes. Dashboards aam taur par channel aur power khud chunte hain; profile limits set kar sakta hai. Yahan numbers yaad mat karo; yeh track ideas sikhata hai.</p>
<table class="cmp"><tr><th>Setting</th><th>Asar</th><th>Galat ho to risk</th></tr>
<tr><td>Band</td><td>Kaun se radios broadcast karte hain</td><td>Kuch clients SSIDs nahi dekh paate</td></tr>
<tr><td>Band steering</td><td>5 GHz ko prefer</td><td>Edge cases mein slow join</td></tr>
<tr><td>Min bitrate</td><td>Dheemi rates kaat'ta hai</td><td>Weak clients disconnect</td></tr>
<tr><td>Channel / power</td><td>Kam interference</td><td>Overlap ya coverage holes</td></tr></table>

<h3>Profile ko APs par assign karna</h3>
<p><b>RF profiles and splash</b> page par profile banao, phir wo APs ya tags chuno jin par lagana hai. Bharat Retail Co mein Delhi store counter par purane barcode scanners hain, isliye AP-DEL (tag <code>store</code>) dual-band profile use karta hai, jabki floor APs AP-MUM aur AP-BLR steering ke saath 5 GHz use kar sakte hain.</p>
<pre class="out">RF profiles  (network: Delhi Branch)
Profile        Bands     Steering  Min bitrate  Assigned to
Dual-Store     2.4+5     on        low          <span class="hl">AP-DEL</span>
Fast5-Floor    5 only    off       higher       -
Client check:  scanner-DEL (2.4 GHz only) sees: BharatRetail-Staff</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Profile assign karne se badalta hai ki AP radios kaun se bands par beacons bhejte aur clients accept karte hain, aur rates aur steering ke rules. VLANs ya firewall nahi badalte. Changes Save changes par apply hote hain, aur hata hue band par ke clients gir kar dobara connect ho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Ek phone SSID dekhta hai, purana scanner nahi, same AP." Pehle RF profile band check karo, SSID settings nahi.</p></div>

<div class="scn"><h4>Scanner jo Wi-Fi nahi dekh paya</h4><p>Delhi staff ne bataya ki naye phones BharatRetail-Staff se join ho gaye lekin purane handheld scanners mein Wi-Fi list khaali thi. SSID, broadcast aur tag theek the, aur AP-DEL online tha. AP-DEL ko speed ke liye 5 GHz-only profile diya gaya tha. Engineer ne dual-band profile assign kiya; scanners ko ek minute mein SSID mil gaya.</p><p><b>Seekh:</b> jab sirf kuch client types SSID kho dete hain, band par shak karo.</p></div>

<div class="iv"><p class="q">"Band steering kya hai aur 5 GHz-only profile kab use nahi karoge?"</p><p>Strong answer: band steering dual-band clients ko speed aur kam interference ke liye 5 GHz use karne ke liye encourage karta hai. 5 GHz-only profile wahan galat hai jahan purane 2.4 GHz-only devices, jaise scanners ya IoT tags, connect karne hain, kyunki unhe SSID bilkul dikhega hi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RF profile APs ko assign hone wala reusable radio rules ka set hai.</li>
<li>Band choice decide karta hai kaun se clients SSID dekhenge; 5 GHz only use 2.4 GHz-only clients se chhupata hai.</li>
<li>Band steering nudge karta hai, force nahi.</li>
<li>Minimum bitrate range aur capacity ka trade-off hai.</li>
<li>Channels aur power interference limit karne ke liye hain; yahan VLAN ya firewall nahi badalte.</li>
</ul></div>
`}};export{e as default};