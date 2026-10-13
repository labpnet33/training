var e={id:`wlan`,h:{en:`WLAN design: SSIDs, data rates, airtime and QoS`,hi:`WLAN design: SSIDs, data rates, airtime aur QoS`},body:{en:`
<p><b>Analogy.</b> Radio airtime is a single-lane road shared by everyone nearby. Every SSID is a bus that must run its own timetable on that road, whether anyone rides it or not. Ten buses on a one-lane road leave little room for cars.</p>

<h3>The case: Orchid Hotel</h3>
<p>Orchid Hotel, a fictional 300-room hotel, complains that Wi-Fi is slow in the evening and that staff voice handsets crackle. The audit finds seven SSIDs broadcast from every AP: Guest, Guest-Premium, Staff, Staff-Voice, Payments, IoT-TV and Events. The 2.4 GHz band has data rates from 1 Mbps enabled. The management wants all seven SSIDs kept because "each department asked for its own".</p>

<h3>How SSIDs cost airtime</h3>
<p>Every SSID needs its own <b>beacon</b> frame, sent about ten times a second on each radio. Beacons go out at the lowest <b>mandatory data rate</b>, so that every client can hear them. At 1 Mbps a beacon of about 300 bytes takes roughly 2.8 ms of airtime; at 6 Mbps it takes about 0.4 ms.</p>
<div class="eg"><p><b>Worked example.</b> At 1 Mbps: one beacon is about 2.8 ms, ten per second is 28 ms, which is about 2.8 percent of airtime per SSID. Seven SSIDs cost about 20 percent. If three neighbouring APs share the same channel, they all hear each other and the cost multiplies. At 12 Mbps minimum rate, one beacon is about 0.2 ms; seven SSIDs cost roughly 1.5 percent. Raising the minimum rate saves airtime for real traffic.</p></div>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Orchid Hotel SSID design before and after">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="13">Before: 7 SSIDs</text>
<rect x="30" y="35" width="240" height="28" fill="#fed7aa"/><text x="150" y="54" text-anchor="middle" class="svg-ink" font-size="11">Beacons from 7 SSIDs: about 20 percent</text>
<rect x="30" y="63" width="240" height="28" fill="#e2e8f0"/><text x="150" y="82" text-anchor="middle" class="svg-ink" font-size="11">Retries and management traffic</text>
<rect x="30" y="91" width="240" height="100" fill="#bbf7d0"/><text x="150" y="146" text-anchor="middle" class="svg-ink" font-size="11">Left for guest data and voice</text>
<text x="490" y="22" text-anchor="middle" class="svg-ink" font-size="13">After: 3 SSIDs</text>
<rect x="370" y="35" width="240" height="8" fill="#fed7aa"/><text x="490" y="62" text-anchor="middle" class="svg-muted" font-size="11">Beacons about 1 percent</text>
<rect x="370" y="68" width="240" height="14" fill="#e2e8f0"/>
<rect x="370" y="82" width="240" height="109" fill="#bbf7d0"/><text x="490" y="140" text-anchor="middle" class="svg-ink" font-size="11">Usable airtime for clients</text>
<text x="30" y="215" class="svg-muted" font-size="11">Guest (open + WPA3 OWE) / Staff (802.1X, role-based) / Devices (PSK or MAB)</text>
<text x="30" y="235" class="svg-muted" font-size="11">Orange = beacons. Grey = overhead. Green = usable airtime.</text>
</svg><p class="cap">Fewer SSIDs and a higher minimum rate return airtime to users.</p></div>

<h3>The trade-off table</h3>
<table class="cmp"><tr><th>Option</th><th>Benefit</th><th>Cost</th></tr>
<tr><td>One SSID per department</td><td>Easy to explain, easy policy by name</td><td>Large beacon overhead, more roaming profiles to debug</td></tr>
<tr><td>Few SSIDs plus AAA-driven roles</td><td>Low overhead; policy chosen by user identity (VLAN, SGT, ACL)</td><td>Needs 802.1X and ISE; more design work</td></tr>
<tr><td>Hidden SSIDs</td><td>None for security</td><td>Probe traffic and client issues; hiding is not security</td></tr>
</table>
<p>Cisco guidance for most designs is to keep roughly <b>three to four SSIDs</b> per AP radio set; the controller can broadcast up to 16 per AP, but just because you can does not mean you should. Use one SSID with 802.1X and let ISE assign the VLAN or policy tag per user group (called <b>AAA override</b>).</p>

<h3>Data rates</h3>
<p>Set data rates by what the design needs. In the 2.4 GHz band, <b>disable 802.11b rates</b> (1, 2, 5.5 and 11 Mbps) unless a legacy device forces them. A typical enterprise setting makes <b>12 Mbps mandatory</b> and leaves higher OFDM rates supported. In 5 GHz the same idea applies (12 Mbps mandatory, 18 and 24 supported). The 6 GHz band has no legacy rates and requires WPA3-class security: SAE for personal, 802.1X, or OWE for open, with <b>Protected Management Frames (PMF)</b> required. Cell size drops when you raise the minimum rate, so you need enough APs and the design must be validated with a survey. A voice handset needing at least -67 dBm at 12 Mbps is a classic target.</p>

<h3>QoS and WMM</h3>
<p><b>WMM (Wi-Fi Multimedia)</b> places traffic into four access categories on the air: voice (AC_VO), video (AC_VI), best effort (AC_BE) and background (AC_BK). Wired QoS uses <b>DSCP</b>; wireless uses 802.11 <b>User Priority (UP)</b>. The two must be mapped consistently, and Cisco follows the IETF mapping.</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>802.11 UP</th><th>WMM class</th><th>Cisco profile</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>6</td><td>AC_VO</td><td>Platinum</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>4</td><td>AC_VI</td><td>Gold</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>4</td><td>AC_VI</td><td>Gold</td></tr>
<tr><td>Best effort</td><td>0</td><td>0</td><td>AC_BE</td><td>Silver</td></tr>
<tr><td>Scavenger / background</td><td>CS1 (8)</td><td>1</td><td>AC_BK</td><td>Bronze</td></tr>
</table>
<p>Design rules: put voice on its own WLAN or use AAA to mark it; enable WMM; apply the right QoS profile on the WLAN as a <b>ceiling</b>; trust DSCP on the AP and uplink switch ports so markings survive; and use <b>call admission control</b> for voice if cell capacity is tight. Application Visibility and Control (AVC) can identify and mark applications such as Webex.</p>

<div class="warn"><p><b>Common mistakes.</b> Marking everything EF so nothing stands out. Setting a Platinum ceiling but not trusting DSCP on the switch, so markings are reset to 0. Keeping 1 Mbps because "one old device might need it".</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacon airtime depends on the lowest mandatory rate, not on the number of clients. Reducing SSIDs or raising the minimum rate are the answers to "beacon overhead too high".</p></div>

<div class="scn"><h4>The crackling handsets</h4><p>Orchid cut from seven SSIDs to three: Guest, Staff (802.1X with AAA override to put voice handsets in the voice VLAN) and Devices. They disabled 802.11b rates, made 12 Mbps mandatory, enabled WMM, applied the Platinum profile to the voice role and trusted DSCP on the AP ports. In the next month the helpdesk calls about slow evening Wi-Fi fell by two thirds and the voice complaints stopped. One lesson hurt: a tablet system from 2012 needed 11 Mbps and had to be replaced.</p><p><b>Lesson:</b> consolidate SSIDs, raise the minimum rate, and keep QoS markings consistent end to end.</p></div>

<div class="iv"><p class="q">"A customer wants a separate SSID for every department. What do you say?"</p><p>Strong answer: each SSID adds beacon overhead and roaming profiles, so propose three or four SSIDs and use 802.1X with ISE to assign VLAN or SGT by role. Show the beacon arithmetic and mention raising the minimum data rate. Keep an SSID separate only when security, transition mode or a client limitation requires it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every SSID adds beacon overhead; target three or four and use AAA override.</li>
<li>Disable 802.11b rates, make 12 Mbps mandatory in typical enterprise designs.</li>
<li>6 GHz needs WPA3-class security and PMF; no legacy rates.</li>
<li>WMM maps DSCP to UP: voice EF to 6, video AF41 to 4, best effort 0, background CS1 to 1.</li>
<li>Trust DSCP end to end and use QoS profiles as a ceiling.</li>
</ul></div>
`,hi:`
<p><b>Analogy.</b> Radio airtime ek single-lane road hai jo aas-paas ke sab log share karte hain. Har SSID ek bus hai jo us road par apni timetable chalati hai, chahe koi baithe ya nahi. Ek lane ki road par dus buses ho to cars ke liye jagah bahut kam bachti hai.</p>

<h3>Case: Orchid Hotel</h3>
<p>Orchid Hotel, ek fictional 300-room hotel, shikayat karta hai ki shaam ko Wi-Fi slow hota hai aur staff ke voice handsets crackle karte hain. Audit mein har AP se saat SSIDs broadcast hote mile: Guest, Guest-Premium, Staff, Staff-Voice, Payments, IoT-TV aur Events. 2.4 GHz band mein 1 Mbps se data rates enabled hain. Management saaton SSIDs rakhna chahta hai kyunki "har department ne apna alag maanga tha".</p>

<h3>SSIDs airtime kaise khate hain</h3>
<p>Har SSID ko apna <b>beacon</b> frame chahiye, jo har radio par lagbhag dus baar per second jata hai. Beacons sabse kam <b>mandatory data rate</b> par jaate hain taaki har client sun sake. 1 Mbps par lagbhag 300 bytes ka beacon lagbhag 2.8 ms airtime leta hai; 6 Mbps par lagbhag 0.4 ms.</p>
<div class="eg"><p><b>Worked example.</b> 1 Mbps par: ek beacon lagbhag 2.8 ms, dus per second matlab 28 ms, yaani har SSID ka lagbhag 2.8 percent airtime. Saat SSIDs lagbhag 20 percent lete hain. Agar teen padosi APs same channel share karein, wo sab ek doosre ko sunte hain aur cost multiply ho jati hai. 12 Mbps minimum rate par ek beacon lagbhag 0.2 ms; saat SSIDs lagbhag 1.5 percent lete hain. Minimum rate badhane se real traffic ke liye airtime bachta hai.</p></div>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Orchid Hotel SSID design pehle aur baad">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="13">Pehle: 7 SSIDs</text>
<rect x="30" y="35" width="240" height="28" fill="#fed7aa"/><text x="150" y="54" text-anchor="middle" class="svg-ink" font-size="11">7 SSIDs ke beacons: lagbhag 20 percent</text>
<rect x="30" y="63" width="240" height="28" fill="#e2e8f0"/><text x="150" y="82" text-anchor="middle" class="svg-ink" font-size="11">Retries aur management traffic</text>
<rect x="30" y="91" width="240" height="100" fill="#bbf7d0"/><text x="150" y="146" text-anchor="middle" class="svg-ink" font-size="11">Guest data aur voice ke liye bacha</text>
<text x="490" y="22" text-anchor="middle" class="svg-ink" font-size="13">Baad mein: 3 SSIDs</text>
<rect x="370" y="35" width="240" height="8" fill="#fed7aa"/><text x="490" y="62" text-anchor="middle" class="svg-muted" font-size="11">Beacons lagbhag 1 percent</text>
<rect x="370" y="68" width="240" height="14" fill="#e2e8f0"/>
<rect x="370" y="82" width="240" height="109" fill="#bbf7d0"/><text x="490" y="140" text-anchor="middle" class="svg-ink" font-size="11">Clients ke liye usable airtime</text>
<text x="30" y="215" class="svg-muted" font-size="11">Guest (open + WPA3 OWE) / Staff (802.1X, role-based) / Devices (PSK ya MAB)</text>
<text x="30" y="235" class="svg-muted" font-size="11">Orange = beacons. Grey = overhead. Green = usable airtime.</text>
</svg><p class="cap">Kam SSIDs aur ooncha minimum rate airtime users ko wapas dete hain.</p></div>

<h3>Trade-off table</h3>
<table class="cmp"><tr><th>Option</th><th>Fayda</th><th>Cost</th></tr>
<tr><td>Har department ke liye ek SSID</td><td>Samjhana aasan, naam se policy aasan</td><td>Bada beacon overhead, debug karne ke liye zyada roaming profiles</td></tr>
<tr><td>Kam SSIDs plus AAA-driven roles</td><td>Kam overhead; policy user identity se chuni jaati hai (VLAN, SGT, ACL)</td><td>802.1X aur ISE chahiye; design ka kaam zyada</td></tr>
<tr><td>Hidden SSIDs</td><td>Security ke liye koi nahi</td><td>Probe traffic aur client issues; hide karna security nahi hai</td></tr>
</table>
<p>Zyaadatar designs ke liye Cisco guidance hai har AP radio set par lagbhag <b>teen se chaar SSIDs</b>; controller har AP par 16 tak broadcast kar sakta hai, par kar sakte ho iska matlab karna chahiye nahi hai. Ek SSID 802.1X ke saath rakho aur ISE ko har user group ke liye VLAN ya policy tag assign karne do (isse <b>AAA override</b> kehte hain).</p>

<h3>Data rates</h3>
<p>Data rates wo set karo jo design ko chahiye. 2.4 GHz band mein <b>802.11b rates disable</b> karo (1, 2, 5.5 aur 11 Mbps) jab tak koi legacy device majboor na kare. Typical enterprise setting <b>12 Mbps mandatory</b> karti hai aur ooncha OFDM rates supported chhodti hai. 5 GHz mein bhi yahi idea (12 Mbps mandatory, 18 aur 24 supported). 6 GHz band mein legacy rates nahi hote aur WPA3-class security zaroori hai: personal ke liye SAE, 802.1X, ya open ke liye OWE, aur <b>Protected Management Frames (PMF)</b> required. Minimum rate badhane se cell size chhota hota hai, isliye aapko enough APs chahiye aur design ko survey se validate karna padta hai. Voice handset ko 12 Mbps par kam se kam -67 dBm chahiye, yeh classic target hai.</p>

<h3>QoS aur WMM</h3>
<p><b>WMM (Wi-Fi Multimedia)</b> air par traffic ko chaar access categories mein daalta hai: voice (AC_VO), video (AC_VI), best effort (AC_BE) aur background (AC_BK). Wired QoS <b>DSCP</b> use karta hai; wireless 802.11 <b>User Priority (UP)</b>. Dono ko consistent map karna padta hai, aur Cisco IETF mapping follow karta hai.</p>
<table class="cmp"><tr><th>Traffic</th><th>DSCP</th><th>802.11 UP</th><th>WMM class</th><th>Cisco profile</th></tr>
<tr><td>Voice</td><td>EF (46)</td><td>6</td><td>AC_VO</td><td>Platinum</td></tr>
<tr><td>Interactive video</td><td>AF41 (34)</td><td>4</td><td>AC_VI</td><td>Gold</td></tr>
<tr><td>Call signalling</td><td>CS3 (24)</td><td>4</td><td>AC_VI</td><td>Gold</td></tr>
<tr><td>Best effort</td><td>0</td><td>0</td><td>AC_BE</td><td>Silver</td></tr>
<tr><td>Scavenger / background</td><td>CS1 (8)</td><td>1</td><td>AC_BK</td><td>Bronze</td></tr>
</table>
<p>Design rules: voice ko apni WLAN par rakho ya AAA se mark karo; WMM enable karo; sahi QoS profile ko WLAN par <b>ceiling</b> ke roop mein lagao; AP aur uplink switch ports par DSCP trust karo taaki markings bachi rahein; aur agar cell capacity tight ho to voice ke liye <b>call admission control</b> use karo. Application Visibility and Control (AVC) Webex jaisi applications ko identify aur mark kar sakta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Sab kuch EF mark kar dena taaki kuch bhi alag na dikhe. Platinum ceiling lagana par switch par DSCP trust na karna, jisse markings 0 reset ho jaati hain. 1 Mbps rakhna kyunki "ek purana device ko chahiye ho sakta hai".</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacon airtime sabse kam mandatory rate par depend karta hai, clients ki sankhya par nahi. "Beacon overhead zyada hai" ka answer hai SSIDs kam karna ya minimum rate badhana.</p></div>

<div class="scn"><h4>Crackle karte handsets</h4><p>Orchid ne saat SSIDs se teen kiye: Guest, Staff (802.1X, AAA override ke saath jo voice handsets ko voice VLAN mein daalta hai) aur Devices. Unhone 802.11b rates disable kiye, 12 Mbps mandatory kiya, WMM enable kiya, voice role par Platinum profile lagaya aur AP ports par DSCP trust kiya. Agle mahine shaam ke slow Wi-Fi par helpdesk calls do-tihai kam ho gaye aur voice complaints band ho gayi. Ek lesson dard de gaya: 2012 ke ek tablet system ko 11 Mbps chahiye the aur use badalna pada.</p><p><b>Lesson:</b> SSIDs consolidate karo, minimum rate badhao, aur QoS markings end to end consistent rakho.</p></div>

<div class="iv"><p class="q">"Customer har department ke liye alag SSID chahta hai. Aap kya kehte ho?"</p><p>Strong answer: har SSID beacon overhead aur roaming profiles jodta hai, isliye teen ya chaar SSIDs propose karo aur role ke hisaab se VLAN ya SGT assign karne ke liye ISE ke saath 802.1X use karo. Beacon arithmetic dikhao aur minimum data rate badhane ka mention karo. SSID tabhi alag rakho jab security, transition mode ya client limitation majboor kare.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har SSID beacon overhead jodta hai; teen ya chaar ka target rakho aur AAA override use karo.</li>
<li>802.11b rates disable karo, typical enterprise designs mein 12 Mbps mandatory karo.</li>
<li>6 GHz ko WPA3-class security aur PMF chahiye; legacy rates nahi.</li>
<li>WMM DSCP ko UP se map karta hai: voice EF se 6, video AF41 se 4, best effort 0, background CS1 se 1.</li>
<li>DSCP ko end to end trust karo aur QoS profiles ko ceiling ke roop mein use karo.</li>
</ul></div>
`}};export{e as default};