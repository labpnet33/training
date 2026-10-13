var e={id:`voice-video-design`,h:{en:`Voice and video design: 802.11e, CAC and Videostream`,hi:`Voice aur video design: 802.11e, CAC aur Videostream`},body:{en:`
<p>A lift has a weight limit. Priority passengers (a patient on a stretcher) may board first, but if you keep letting priority passengers in past the limit, the lift stalls for everyone, including the patient. QoS marking gives priority. <b>Call Admission Control (CAC)</b> is the weight limit: it refuses a new call when the cell cannot carry it with good quality, so existing calls stay clear.</p>

<h3>What voice and video need</h3>
<p>Voice and interactive video are real time. They tolerate small loss and delay but not large variation. Commonly used targets (check your vendor's current design guide): one-way latency under 150 ms, jitter under about 30 ms, packet loss under 1 percent for voice. The wireless design must serve those numbers in the radio and in the wired path.</p>
<table class="cmp"><tr><th>Application</th><th>DSCP</th><th>Metal</th><th>AC</th></tr>
<tr><td>Voice (RTP audio)</td><td>46 (EF)</td><td>platinum</td><td>AC_VO</td></tr>
<tr><td>Interactive video (RTP video)</td><td>34 (AF41)</td><td>gold</td><td>AC_VI</td></tr>
<tr><td>Call signalling (SIP)</td><td>24 (CS3)</td><td>an own class</td><td>AC_BE in the model</td></tr>
<tr><td>Normal data</td><td>0</td><td>silver</td><td>AC_BE</td></tr>
<tr><td>Guest or bulk</td><td>8 or 0</td><td>bronze</td><td>AC_BK</td></tr></table>
<p>The lab client apps use the same values: <code>wifi qos app voice</code> marks 46 (protocol rtp-audio), <code>video</code> marks 34 (rtp-video), <code>signalling</code> 24 (sip), <code>web</code> 0 (secure web).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Design chain for voice">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 RF design</text>
<rect x="170" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="235" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 WLAN: WMM</text>
<rect x="320" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="395" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 policy profile</text>
<rect x="490" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 wired trust</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="300" y1="42" x2="320" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">signal, overlap, 5 GHz</text>
<text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">require WMM</text>
<text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">platinum pair</text>
<text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">trust dscp</text>
<rect x="170" y="130" width="300" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">5 CAC keeps the cell from overload</text>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">All five layers must agree; the labs build 2, 3 and 4.</text>
</svg><p class="cap">Voice quality is a chain: radio design, WMM, controller policy, wired trust, and admission control.</p></div>

<h3>Design guidelines for the radio</h3>
<ul>
<li>Prefer <b>5 GHz</b> for voice and video: more channels, less interference. Keep a 2.4 GHz voice WLAN only if devices need it.</li>
<li>Design for a strong signal at the cell edge (a common target is about -67 dBm) and a healthy SNR (about 25 dB or better), with roughly 20 percent coverage overlap between neighbouring APs so roams are quick.</li>
<li>Disable the slowest data rates so frames are short and the cell is not held up by a distant client.</li>
<li>Use fast roaming (802.11r, taught in the roaming module) and keep the voice VLAN small.</li>
<li>Use <code>wmm require</code> on a voice-only WLAN and a separate WLAN for data, so you can apply platinum only where it belongs.</li>
</ul>
<p>Treat these numbers as typical guidance, not exam absolutes. Site survey and design are covered in the design module.</p>

<h3>CAC: protecting existing calls</h3>
<p>With <b>802.11e CAC</b> a client must <b>ask</b> before it uses AC_VO or AC_VI. The AP advertises that admission control is mandatory for that AC (the ACM bit in the WMM information). The client sends an <b>ADDTS request</b> carrying a <b>TSPEC</b> (traffic specification: rate, packet size, delay). The AP and controller check the bandwidth reserved so far and answer accept or reject. A rejected phone falls back to a lower AC or the call is refused.</p>
<dl class="terms">
<dt>Static CAC</dt><dd>A fixed share of the channel is reserved for voice or video; the controller counts admitted calls against it.</dd>
<dt>Load-based CAC</dt><dd>The AP measures real channel use, including neighbours' traffic, and admits a call only if there is headroom.</dd>
<dt>Roaming bandwidth</dt><dd>A part of the share is kept for calls that roam in, so a moving call is not dropped by a full cell.</dd>
</dl>
<div class="note"><p><b>Concept only.</b> CAC, TSPEC and ADDTS are explained here but not simulated: the lab does not count admitted calls and has no per-band CAC settings. You will not be asked to configure it in the labs, and no output of this module shows CAC counters.</p></div>

<h3>Videostream (media stream)</h3>
<p>Streaming video to many clients is multicast. Multicast on Wi-Fi is sent at a low basic rate and with no acknowledgement (chapter 9), so quality is poor. <b>Videostream</b>, also called multicast-direct, converts the multicast stream into <b>reliable unicast</b> copies for each subscribed client at the client's own rate, and uses admission control for them. It is a good fit for lecture rooms and signage, <b>concept only</b> in the labs.</p>

<div class="eg"><p><b>Worked example.</b> An office has 30 phones per floor on one AP. At 30 simultaneous calls the cell reaches its limit. Without CAC, the 31st call starts, collisions rise, and all 31 calls turn choppy. With CAC the 31st call is refused or moved to another AP in range, and the 30 existing calls stay clean. The fix for the 31st user is capacity: another AP or channel, not a better marking.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Marking everything EF: if all traffic is priority, none is.</li>
<li>Enabling platinum on a general staff WLAN so any laptop can claim voice priority.</li>
<li>Trusting that QoS replaces capacity planning.</li>
<li>Forgetting the wired side: perfect radio, untrusted switch port.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> CAC is about <b>admission</b>, QoS marking is about <b>priority</b>. They solve different problems and are used together. Videostream and CAC need WMM to be on.</p></div>

<div class="scn"><h4>Thirty-one calls on one AP</h4><p>A call centre complains of choppy audio every morning at nine. Marking and trust are correct. The engineer finds 31 handsets on one AP with no admission control, so the 31st call degrades everyone. After CAC is planned and a second AP added, the complaint stops.</p><p><b>Lesson:</b> QoS gives order, CAC and design give capacity.</p></div>

<div class="iv"><p class="q">"What is CAC and why does voice need it?"</p><p>A new voice call asks the AP for admission using a TSPEC in an ADDTS request; the controller accepts only if the channel can carry it with good quality. Voice needs it because overload hurts every call at once, and priority marking cannot fix a full cell. Mention static versus load-based, and that it is concept only in the lab.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice EF 46, interactive video AF41 34, signalling CS3 24 in the lab.</li>
<li>Design: 5 GHz, good signal, overlap, fast roaming, WMM require on voice WLANs.</li>
<li>CAC controls admission through TSPEC and ADDTS; it is concept only here.</li>
<li>Videostream turns multicast video into reliable unicast; concept only.</li>
<li>QoS orders traffic, it does not add capacity.</li>
</ul></div>
`,hi:`
<p>Lift ki weight limit hoti hai. Priority passengers (stretcher par mareez) pehle chadh sakte hain, lekin agar aap limit ke baad bhi priority passengers ko chadhate raho to lift sab ke liye ruk jaati hai, mareez ke liye bhi. QoS marking priority deta hai. <b>Call Admission Control (CAC)</b> weight limit hai: jab cell achhi quality ke saath nayi call nahi utha sakta to woh use refuse kar deta hai, taaki maujooda calls saaf rahein.</p>

<h3>Voice aur video ko kya chahiye</h3>
<p>Voice aur interactive video real time hain. Woh chhota loss aur delay sah lete hain, lekin bada variation nahi. Aam taur par use hone wale targets (apne vendor ki current design guide dekho): voice ke liye one-way latency 150 ms se kam, jitter lagbhag 30 ms se kam, packet loss 1 percent se kam. Wireless design ko yeh numbers radio mein aur wired path mein poore karne hote hain.</p>
<table class="cmp"><tr><th>Application</th><th>DSCP</th><th>Metal</th><th>AC</th></tr>
<tr><td>Voice (RTP audio)</td><td>46 (EF)</td><td>platinum</td><td>AC_VO</td></tr>
<tr><td>Interactive video (RTP video)</td><td>34 (AF41)</td><td>gold</td><td>AC_VI</td></tr>
<tr><td>Call signalling (SIP)</td><td>24 (CS3)</td><td>apni class</td><td>model mein AC_BE</td></tr>
<tr><td>Normal data</td><td>0</td><td>silver</td><td>AC_BE</td></tr>
<tr><td>Guest ya bulk</td><td>8 ya 0</td><td>bronze</td><td>AC_BK</td></tr></table>
<p>Lab ke client apps wahi values use karte hain: <code>wifi qos app voice</code> 46 mark karta hai (protocol rtp-audio), <code>video</code> 34 (rtp-video), <code>signalling</code> 24 (sip), <code>web</code> 0 (secure web).</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Voice ke liye design chain">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1 RF design</text>
<rect x="170" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="235" y="47" text-anchor="middle" class="svg-ink" font-size="13">2 WLAN: WMM</text>
<rect x="320" y="20" width="150" height="44" rx="8" fill="#fde68a"/><text x="395" y="47" text-anchor="middle" class="svg-ink" font-size="13">3 policy profile</text>
<rect x="490" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="555" y="47" text-anchor="middle" class="svg-ink" font-size="13">4 wired trust</text>
<line x1="150" y1="42" x2="170" y2="42" stroke="#64748b" stroke-width="2"/><line x1="300" y1="42" x2="320" y2="42" stroke="#64748b" stroke-width="2"/><line x1="470" y1="42" x2="490" y2="42" stroke="#64748b" stroke-width="2"/>
<text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">signal, overlap, 5 GHz</text>
<text x="235" y="100" text-anchor="middle" class="svg-muted" font-size="12">require WMM</text>
<text x="395" y="100" text-anchor="middle" class="svg-muted" font-size="12">platinum pair</text>
<text x="555" y="100" text-anchor="middle" class="svg-muted" font-size="12">trust dscp</text>
<rect x="170" y="130" width="300" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="157" text-anchor="middle" class="svg-ink" font-size="13">5 CAC cell ko overload se bachata hai</text>
<text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">Paanchon layers ko agree karna hai; labs 2, 3 aur 4 banate hain.</text>
</svg><p class="cap">Voice quality ek chain hai: radio design, WMM, controller policy, wired trust aur admission control.</p></div>

<h3>Radio ke liye design guidelines</h3>
<ul>
<li>Voice aur video ke liye <b>5 GHz</b> prefer karo: zyada channels, kam interference. 2.4 GHz voice WLAN tabhi rakho jab devices ko zaroorat ho.</li>
<li>Cell edge par strong signal (aam target lagbhag -67 dBm) aur achhi SNR (lagbhag 25 dB ya behtar) ke liye design karo, padosi APs ke beech lagbhag 20 percent coverage overlap ke saath taaki roam jaldi ho.</li>
<li>Sabse slow data rates disable karo taaki frames chhote hon aur door ka client cell ko rok na sake.</li>
<li>Fast roaming (802.11r, roaming module mein padha) use karo aur voice VLAN chhota rakho.</li>
<li>Sirf-voice WLAN par <code>wmm require</code> aur data ke liye alag WLAN use karo, taaki platinum sirf wahin lage jahan ka hai.</li>
</ul>
<p>In numbers ko typical guidance maano, exam ke absolutes nahi. Site survey aur design, design module mein hain.</p>

<h3>CAC: maujooda calls ki hifazat</h3>
<p><b>802.11e CAC</b> mein client ko AC_VO ya AC_VI use karne se pehle <b>poochna</b> padta hai. AP batata hai ki us AC ke liye admission control mandatory hai (WMM information mein ACM bit). Client ek <b>ADDTS request</b> bhejta hai jisme <b>TSPEC</b> (traffic specification: rate, packet size, delay) hota hai. AP aur controller ab tak reserve ki gayi bandwidth check karke accept ya reject jawab dete hain. Reject hua phone neeche ki AC par girta hai ya call refuse hoti hai.</p>
<dl class="terms">
<dt>Static CAC</dt><dd>Channel ka ek fixed hissa voice ya video ke liye reserve hota hai; controller admitted calls ko usse gina karta hai.</dd>
<dt>Load-based CAC</dt><dd>AP asli channel use naapta hai, padosiyon ke traffic samet, aur call tabhi admit karta hai jab jagah ho.</dd>
<dt>Roaming bandwidth</dt><dd>Hisse ka ek bhaag un calls ke liye rakha jaata hai jo roam karke aati hain, taaki chalti call full cell se na gire.</dd>
</dl>
<div class="note"><p><b>Concept only.</b> CAC, TSPEC aur ADDTS yahan samjhaye gaye hain lekin simulate nahi hote: lab admitted calls ko gintaa nahi aur per-band CAC settings nahi hain. Labs mein aapse ise configure karne ko nahi kaha jayega, aur is module ke kisi output mein CAC counters nahi hain.</p></div>

<h3>Videostream (media stream)</h3>
<p>Bahut clients ko video streaming multicast hoti hai. Wi-Fi par multicast low basic rate par aur acknowledgement ke bina jaata hai (chapter 9), isliye quality kharab hoti hai. <b>Videostream</b>, jise multicast-direct bhi kehte hain, multicast stream ko har subscribed client ke liye uske apne rate par <b>reliable unicast</b> copies mein badal deta hai, aur unke liye admission control use karta hai. Yeh lecture rooms aur signage ke liye achha hai, labs mein <b>concept only</b>.</p>

<div class="eg"><p><b>Worked example.</b> Ek office mein ek AP par har floor par 30 phones hain. 30 simultaneous calls par cell apni seema par pahunch jaata hai. CAC ke bina 31vi call shuru hoti hai, collisions badhte hain, aur saari 31 calls choppy ho jaati hain. CAC ke saath 31vi call refuse hoti hai ya range ke doosre AP par move hoti hai, aur 30 maujooda calls saaf rehti hain. 31ve user ka fix capacity hai: doosra AP ya channel, behtar marking nahi.</p></div>

<div class="warn"><p><b>Common mistakes:</b></p><ul>
<li>Sab kuch EF mark karna: agar sab traffic priority hai to koi priority nahi.</li>
<li>General staff WLAN par platinum lagana taaki koi bhi laptop voice priority claim kar sake.</li>
<li>Yeh maan lena ki QoS capacity planning ki jagah le leta hai.</li>
<li>Wired side bhoolna: perfect radio, untrusted switch port.</li>
</ul></div>
<div class="exam"><p><b>Exam trap:</b> CAC <b>admission</b> ke baare mein hai, QoS marking <b>priority</b> ke baare mein. Yeh alag problems solve karte hain aur saath use hote hain. Videostream aur CAC ko WMM on chahiye.</p></div>

<div class="scn"><h4>Ek AP par ikatees calls</h4><p>Ek call centre har subah nau baje choppy audio ki shikayat karta hai. Marking aur trust sahi hain. Engineer ko ek AP par 31 handsets milte hain bina admission control ke, isliye 31vi call sab ko degrade karti hai. CAC plan karne aur doosra AP lagane ke baad shikayat band ho gayi.</p><p><b>Lesson:</b> QoS order deta hai, CAC aur design capacity dete hain.</p></div>

<div class="iv"><p class="q">"CAC kya hai aur voice ko iski zaroorat kyun hai?"</p><p>Nayi voice call ADDTS request mein TSPEC ke saath AP se admission maangti hai; controller tabhi accept karta hai jab channel achhi quality ke saath use utha sake. Voice ko iski zaroorat hai kyunki overload ek saath har call ko nuksan pahunchata hai, aur priority marking full cell ko theek nahi kar sakti. Static vs load-based batao, aur yeh bhi ki lab mein concept only hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lab mein voice EF 46, interactive video AF41 34, signalling CS3 24.</li>
<li>Design: 5 GHz, achha signal, overlap, fast roaming, voice WLANs par WMM require.</li>
<li>CAC TSPEC aur ADDTS se admission control karta hai; yahan concept only.</li>
<li>Videostream multicast video ko reliable unicast banata hai; concept only.</li>
<li>QoS traffic ko order karta hai, capacity nahi badhata.</li>
</ul></div>
`}};export{e as default};