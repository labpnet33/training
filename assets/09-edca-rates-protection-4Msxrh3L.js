var e={id:`edca-rates-protection`,h:{en:`Sharing the air: CSMA/CA, EDCA, data rates and protection`,hi:`Hawa share karna: CSMA/CA, EDCA, data rates aur protection`},body:{en:`
<p>Wi-Fi is half duplex: only one device in range transmits at a time. So the rules for taking turns, and the rate each device uses, decide how fast the cell feels. This chapter explains the turn-taking (DCF and EDCA), the mandatory and supported rates you set in an RF profile, and the protection overhead of old 802.11b clients, which Lab 4 removes.</p>

<h3>Analogy: a polite conversation</h3>
<p>Before you speak you listen. If someone is talking, you wait. When it goes quiet you still wait a random short time, so two people do not start together. If you collide anyway, you wait longer next time. That is <b>CSMA/CA</b> (Carrier Sense Multiple Access with Collision Avoidance). Wi-Fi cannot detect a collision while it sends, so it avoids them.</p>

<h3>DCF: the basic rule</h3>
<ol>
<li>Listen: is the channel busy (carrier sense)? Energy detection and preamble detection both count.</li>
<li>If idle for a <b>DIFS</b> time, pick a random backoff number from 0 to CW (the contention window) and count down while idle. CW starts at <b>CWmin</b> (15).</li>
<li>At zero, transmit. The receiver replies with an ACK after <b>SIFS</b> (10 microseconds on 2.4 GHz, 16 on 5 GHz).</li>
<li>No ACK? Assume a collision, double the CW up to <b>CWmax</b> (1023), and try again.</li>
</ol>
<p>One slot is 9 microseconds in OFDM (20 in old 802.11b mode). More contenders mean more collisions and longer waits, so adding clients to a cell lowers each client's share.</p>

<h3>EDCA and WMM: priorities for traffic</h3>
<p>Voice should not wait behind a file download. <b>EDCA</b> (Enhanced Distributed Channel Access, the 802.11e mechanism that the Wi-Fi Alliance sells as <b>WMM</b>) gives four <b>access categories</b>, each with its own queue and its own backoff numbers. Higher priority means a shorter wait and a smaller contention window, so it wins the air more often, but it does not guarantee it.</p>
<table class="cmp"><tr><th>Access category</th><th>802.11 user priority</th><th>Typical traffic</th><th>AIFSN</th><th>CWmin / CWmax</th></tr>
<tr><td><b>AC_VO</b> voice</td><td>6, 7</td><td>VoIP, DSCP EF (46)</td><td>2</td><td>3 / 7</td></tr>
<tr><td><b>AC_VI</b> video</td><td>4, 5</td><td>Video, DSCP AF4x</td><td>2</td><td>7 / 15</td></tr>
<tr><td><b>AC_BE</b> best effort</td><td>0, 3</td><td>Web, email, default</td><td>3</td><td>15 / 1023</td></tr>
<tr><td><b>AC_BK</b> background</td><td>1, 2</td><td>Backups, updates</td><td>7</td><td>15 / 1023</td></tr></table>
<p>AIFSN is the arbitration inter-frame space number: the idle wait before counting down is SIFS plus AIFSN slots. AC_VO and AC_VI also get a <b>TXOP</b> (transmit opportunity) so they can send several frames back to back. Values above are the usual defaults for OFDM PHYs; the AP advertises its own in the beacon. A frame gets its category from the 802.1p or DSCP marking, mapped by the controller and the AP. Policy details (UP to DSCP maps, metal policies, CAC) belong to the wl-qos module; here you only need the mechanism.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="EDCA queues">
<rect x="20" y="20" width="110" height="30" fill="#bbf7d0"/><text x="75" y="40" text-anchor="middle" class="svg-ink" font-size="12">AC_VO</text>
<rect x="20" y="55" width="110" height="30" fill="#bae6fd"/><text x="75" y="75" text-anchor="middle" class="svg-ink" font-size="12">AC_VI</text>
<rect x="20" y="90" width="110" height="30" fill="#fde68a"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="12">AC_BE</text>
<rect x="20" y="125" width="110" height="30" fill="#fed7aa"/><text x="75" y="145" text-anchor="middle" class="svg-ink" font-size="12">AC_BK</text>
<rect x="190" y="20" width="200" height="135" rx="8" fill="#e2e8f0"/><text x="290" y="80" text-anchor="middle" class="svg-ink" font-size="13">internal contention</text><text x="290" y="100" text-anchor="middle" class="svg-muted" font-size="12">highest priority wins</text>
<line x1="130" y1="35" x2="188" y2="70" stroke="#64748b"/><line x1="130" y1="70" x2="188" y2="85" stroke="#64748b"/><line x1="130" y1="105" x2="188" y2="100" stroke="#64748b"/><line x1="130" y1="140" x2="188" y2="115" stroke="#64748b"/>
<rect x="450" y="55" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">contend for the air</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">with other stations</text>
<line x1="390" y1="85" x2="448" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four queues inside each station. The winner of the internal contest competes with other stations.</p></div>

<h3>Data rates: mandatory, supported, disabled</h3>
<p>For each band you choose a rate state. A <b>mandatory</b> (basic) rate must be supported by every client that wants to associate, and beacons, probe responses and multicast go out at the <b>lowest mandatory rate</b>. A <b>supported</b> rate may be used by clients that can. A <b>disabled</b> rate is never used. The lowest mandatory rate also defines the <b>cell edge</b>: a client weaker than that rate's required signal cannot join.</p>
<table class="cmp"><tr><th>Lowest mandatory rate</th><th>Approximate RSSI needed at the client (model)</th><th>Effect</th></tr>
<tr><td>1 Mbps (802.11b)</td><td>-88 dBm</td><td>Huge cell, slow beacons, b clients allowed</td></tr>
<tr><td>6 Mbps</td><td>-76 dBm</td><td>Common legacy default for 5 GHz</td></tr>
<tr><td>12 Mbps</td><td>-73 dBm</td><td>Smaller cell, no 802.11b</td></tr>
<tr><td>24 Mbps</td><td>-68 dBm</td><td>High density, small clean cells</td></tr></table>
<p>These figures are the simulator's rules, set from the signal each rate needs. Real equipment needs similar order-of-magnitude values. Raising the lowest mandatory rate shrinks the cell on purpose: clients that would have connected at a poor signal now roam to a closer AP instead of hanging on at 6 Mbps and consuming airtime.</p>
<div class="eg"><p><b>Worked example: airtime is rate dependent.</b> Sending a 1500-byte (12,000-bit) frame takes 12,000 / 6 Mbps = 2.0 ms at 6 Mbps but 12,000 / 300 Mbps = 0.04 ms at 300 Mbps (ignoring overhead). One client at 6 Mbps uses 50 times the airtime for the same bytes, and everyone waits for it. This is the "performance anomaly": slow clients drag down the whole cell.</p></div>

<h3>Protection for 802.11b</h3>
<p>When an 802.11b client (it cannot decode OFDM) is in range of a 2.4 GHz OFDM network, the OFDM stations must warn it by sending a short b-compatible frame first (<b>CTS-to-self</b> or RTS/CTS). That prefix is the <b>protection</b> overhead, and it cuts the throughput of every 802.11g, n and ax client on 2.4 GHz. The AP signals this through the "Use Protection" flag in the beacon. The cure is to disable the four 802.11b rates (1, 2, 5.5 and 11 Mbps): then no b client can join, and protection is off. In <code>wifi link</code> the flag shows up as <b>bss flags: short-preamble, protection (802.11b rates enabled)</b>.</p>
<pre class="code">ap dot11 24ghz rf-profile CAMPUS-24
 shutdown
 rate RATE_1M disable
 rate RATE_2M disable
 rate RATE_5_5M disable
 rate RATE_11M disable
 no shutdown</pre>
<p>GUI path: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; CAMPUS-24 &gt; 802.11 &gt; Data Rates</b>, or <b>Configuration &gt; Radio Configurations &gt; Network &gt; 2.4 GHz Band</b> for the global rates (in this simulator, <b>Configuration &gt; Wireless &gt; RRM</b>). Keep at least one mandatory rate; the model refuses to remove them all.</p>

<div class="warn"><p><b>Common mistake.</b> Disabling all low rates in one go and breaking an old barcode scanner or medical device that supports only 802.11b. Inventory the clients first, and give them a dedicated SSID or band if they must stay.</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacons and multicast use the lowest mandatory rate, not the highest supported rate. Raising the minimum rate reduces coverage cell size and reduces airtime waste, it does not increase the transmit power.</p></div>

<div class="scn"><h4>The barcode scanners that disappeared</h4><p>A warehouse raised the lowest mandatory rate to 12 Mbps to improve voice quality. Next morning 30 handheld scanners could not associate, and the AP logged association rejects with status 18. The scanners were 802.11b devices. IT put them on a dedicated 2.4 GHz SSID served by two APs that kept 802.11b rates, and the rest of the building stayed at 12 Mbps.</p><p><b>Lesson:</b> a mandatory-rate change decides which clients exist. Check the client list before you apply it.</p></div>

<div class="iv"><p class="q">"What is the effect of disabling the low data rates?"</p><p>Strong answer: the lowest mandatory rate goes up, so beacons and multicast use less airtime, 802.11b clients and protection overhead disappear, and the usable cell edge moves closer to the AP, which pushes sticky clients to roam. Risks: coverage holes if the cells were already thin, and old devices can no longer associate (status 18).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSMA/CA listens, waits a random backoff, and retries with a larger contention window after a missing ACK.</li>
<li>EDCA gives four access categories (VO, VI, BE, BK) with different AIFSN and CW values; WMM is the certified name.</li>
<li>Mandatory rates must be supported by clients; the lowest one carries beacons and defines the cell edge.</li>
<li>Slow clients use the most airtime; one 6 Mbps client costs 50 times the airtime of a 300 Mbps client.</li>
<li>Disabling the four 802.11b rates removes protection overhead and b clients.</li>
</ul></div>
`,hi:`
<p>Wi-Fi half duplex hai: range mein ek waqt par sirf ek device transmit karta hai. Isliye baari lene ke rules, aur har device jo rate use karta hai, tay karte hain ki cell kitna tez lagta hai. Yeh chapter baari lene (DCF aur EDCA), RF profile mein set kiye jaane wale mandatory aur supported rates, aur purane 802.11b clients ka protection overhead samjhata hai, jise Lab 4 hata deta hai.</p>

<h3>Analogy: tameez wali baatcheet</h3>
<p>Bolne se pehle aap sunte ho. Koi bol raha hai to ruk jaate ho. Shaanti hone par bhi aap ek random chhota waqt ruk jaate ho, taaki do log ek saath shuru na karein. Phir bhi takra gaye to agli baar zyada rukte ho. Yahi <b>CSMA/CA</b> (Carrier Sense Multiple Access with Collision Avoidance) hai. Wi-Fi bhejte waqt collision detect nahi kar sakta, isliye woh unse bachta hai.</p>

<h3>DCF: basic rule</h3>
<ol>
<li>Suno: kya channel busy hai (carrier sense)? Energy detection aur preamble detection dono gine jaate hain.</li>
<li><b>DIFS</b> time tak idle rahe to 0 se CW (contention window) tak ek random backoff number chuno aur idle rehte hue ginti ulti karo. CW <b>CWmin</b> (15) se shuru hota hai.</li>
<li>Zero par transmit karo. Receiver <b>SIFS</b> ke baad ACK se jawab deta hai (2.4 GHz par 10 microseconds, 5 GHz par 16).</li>
<li>ACK nahi aaya? Collision maano, CW ko <b>CWmax</b> (1023) tak double karo, aur phir try karo.</li>
</ol>
<p>Ek slot OFDM mein 9 microseconds ka hota hai (purane 802.11b mode mein 20). Zyada contenders matlab zyada collisions aur lambe wait, isliye cell mein clients badhane se har client ka hissa kam hota hai.</p>

<h3>EDCA aur WMM: traffic ki priorities</h3>
<p>Voice ko file download ke peeche wait nahi karna chahiye. <b>EDCA</b> (Enhanced Distributed Channel Access, 802.11e mechanism jise Wi-Fi Alliance <b>WMM</b> naam se bechta hai) chaar <b>access categories</b> deta hai, har ek ki apni queue aur apne backoff numbers ke saath. Higher priority matlab chhota wait aur chhoti contention window, isliye woh hawa zyada baar jeet ta hai, lekin guarantee nahi hai.</p>
<table class="cmp"><tr><th>Access category</th><th>802.11 user priority</th><th>Typical traffic</th><th>AIFSN</th><th>CWmin / CWmax</th></tr>
<tr><td><b>AC_VO</b> voice</td><td>6, 7</td><td>VoIP, DSCP EF (46)</td><td>2</td><td>3 / 7</td></tr>
<tr><td><b>AC_VI</b> video</td><td>4, 5</td><td>Video, DSCP AF4x</td><td>2</td><td>7 / 15</td></tr>
<tr><td><b>AC_BE</b> best effort</td><td>0, 3</td><td>Web, email, default</td><td>3</td><td>15 / 1023</td></tr>
<tr><td><b>AC_BK</b> background</td><td>1, 2</td><td>Backups, updates</td><td>7</td><td>15 / 1023</td></tr></table>
<p>AIFSN arbitration inter-frame space number hai: countdown se pehle ka idle wait SIFS plus AIFSN slots hota hai. AC_VO aur AC_VI ko <b>TXOP</b> (transmit opportunity) bhi milta hai taaki woh kai frames peechhe peechhe bhej sakein. Upar ki values OFDM PHYs ke usual defaults hain; AP beacon mein apni values advertise karta hai. Frame ko category 802.1p ya DSCP marking se milti hai, jise controller aur AP map karte hain. Policy details (UP to DSCP maps, metal policies, CAC) wl-qos module ki hain; yahan sirf mechanism chahiye.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="EDCA queues">
<rect x="20" y="20" width="110" height="30" fill="#bbf7d0"/><text x="75" y="40" text-anchor="middle" class="svg-ink" font-size="12">AC_VO</text>
<rect x="20" y="55" width="110" height="30" fill="#bae6fd"/><text x="75" y="75" text-anchor="middle" class="svg-ink" font-size="12">AC_VI</text>
<rect x="20" y="90" width="110" height="30" fill="#fde68a"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="12">AC_BE</text>
<rect x="20" y="125" width="110" height="30" fill="#fed7aa"/><text x="75" y="145" text-anchor="middle" class="svg-ink" font-size="12">AC_BK</text>
<rect x="190" y="20" width="200" height="135" rx="8" fill="#e2e8f0"/><text x="290" y="80" text-anchor="middle" class="svg-ink" font-size="13">internal contention</text><text x="290" y="100" text-anchor="middle" class="svg-muted" font-size="12">highest priority jeetti hai</text>
<line x1="130" y1="35" x2="188" y2="70" stroke="#64748b"/><line x1="130" y1="70" x2="188" y2="85" stroke="#64748b"/><line x1="130" y1="105" x2="188" y2="100" stroke="#64748b"/><line x1="130" y1="140" x2="188" y2="115" stroke="#64748b"/>
<rect x="450" y="55" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="535" y="80" text-anchor="middle" class="svg-ink" font-size="13">hawa ke liye contend</text><text x="535" y="100" text-anchor="middle" class="svg-muted" font-size="12">dusre stations ke saath</text>
<line x1="390" y1="85" x2="448" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har station ke andar chaar queues. Internal contest ka winner dusre stations se compete karta hai.</p></div>

<h3>Data rates: mandatory, supported, disabled</h3>
<p>Har band ke liye aap rate state chunte ho. <b>Mandatory</b> (basic) rate har us client ko support karna zaroori hai jo associate hona chahta hai, aur beacons, probe responses aur multicast <b>lowest mandatory rate</b> par jaate hain. <b>Supported</b> rate un clients dwara use ho sakta hai jo ise kar sakte hain. <b>Disabled</b> rate kabhi use nahi hota. Lowest mandatory rate <b>cell edge</b> bhi tay karta hai: us rate ke required signal se kamzor client join nahi kar sakta.</p>
<table class="cmp"><tr><th>Lowest mandatory rate</th><th>Client par approximate RSSI chahiye (model)</th><th>Asar</th></tr>
<tr><td>1 Mbps (802.11b)</td><td>-88 dBm</td><td>Bahut bada cell, slow beacons, b clients allowed</td></tr>
<tr><td>6 Mbps</td><td>-76 dBm</td><td>5 GHz ka common legacy default</td></tr>
<tr><td>12 Mbps</td><td>-73 dBm</td><td>Chhota cell, 802.11b nahi</td></tr>
<tr><td>24 Mbps</td><td>-68 dBm</td><td>High density, chhote saaf cells</td></tr></table>
<p>Yeh figures simulator ke rules hain, jo har rate ko chahiye signal se set kiye gaye hain. Real equipment ko similar order ki values chahiye. Lowest mandatory rate badhane se cell jaan boojhkar chhota hota hai: jo clients kharab signal par connect ho jaate the, ab 6 Mbps par latke rehne aur airtime khane ki jagah paas ke AP par roam karte hain.</p>
<div class="eg"><p><b>Worked example: airtime rate par depend karta hai.</b> 1500-byte (12,000-bit) frame bhejna 6 Mbps par 12,000 / 6 Mbps = 2.0 ms leta hai lekin 300 Mbps par 12,000 / 300 Mbps = 0.04 ms (overhead chhodkar). 6 Mbps par ek client same bytes ke liye 50 guna airtime use karta hai, aur sab uska intezaar karte hain. Yeh "performance anomaly" hai: slow clients poore cell ko neeche kheench lete hain.</p></div>

<h3>802.11b ke liye protection</h3>
<p>Jab 802.11b client (jo OFDM decode nahi kar sakta) 2.4 GHz OFDM network ki range mein ho, to OFDM stations ko use pehle ek chhota b-compatible frame bhejkar chetavni deni padti hai (<b>CTS-to-self</b> ya RTS/CTS). Yeh prefix <b>protection</b> overhead hai, aur yeh 2.4 GHz par har 802.11g, n aur ax client ka throughput kaat deta hai. AP beacon mein "Use Protection" flag se yeh batata hai. Ilaaj hai chaar 802.11b rates (1, 2, 5.5 aur 11 Mbps) disable karna: tab koi b client join nahi kar sakta, aur protection off ho jaata hai. <code>wifi link</code> mein flag <b>bss flags: short-preamble, protection (802.11b rates enabled)</b> ki tarah dikhta hai.</p>
<pre class="code">ap dot11 24ghz rf-profile CAMPUS-24
 shutdown
 rate RATE_1M disable
 rate RATE_2M disable
 rate RATE_5_5M disable
 rate RATE_11M disable
 no shutdown</pre>
<p>GUI path: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; CAMPUS-24 &gt; 802.11 &gt; Data Rates</b>, ya global rates ke liye <b>Configuration &gt; Radio Configurations &gt; Network &gt; 2.4 GHz Band</b> (is simulator mein <b>Configuration &gt; Wireless &gt; RRM</b>). Kam se kam ek mandatory rate rakho; model sab hatane se mana kar deta hai.</p>

<div class="warn"><p><b>Common galti.</b> Saare low rates ek saath disable karke kisi purane barcode scanner ya medical device ko tod dena jo sirf 802.11b support karta hai. Pehle clients ka inventory lo, aur agar rehna hi hai to unhe dedicated SSID ya band do.</p></div>
<div class="exam"><p><b>Exam trap.</b> Beacons aur multicast lowest mandatory rate use karte hain, highest supported rate nahi. Minimum rate badhane se coverage cell size chhota hota hai aur airtime ka waste kam hota hai, transmit power nahi badhti.</p></div>

<div class="scn"><h4>Gayab hue barcode scanners</h4><p>Ek warehouse ne voice quality sudharne ke liye lowest mandatory rate 12 Mbps kar diya. Agli subah 30 handheld scanners associate nahi kar paaye, aur AP ne status 18 ke saath association rejects log kiye. Scanners 802.11b devices the. IT ne unhe dedicated 2.4 GHz SSID par rakha jo do APs serve karte the jinhone 802.11b rates rakhe, aur baaki building 12 Mbps par rahi.</p><p><b>Seekh:</b> mandatory-rate badlav tay karta hai ki kaunse clients exist karte hain. Apply karne se pehle client list check karo.</p></div>

<div class="iv"><p class="q">"Low data rates disable karne ka kya asar hota hai?"</p><p>Strong answer: lowest mandatory rate upar jaata hai, isliye beacons aur multicast kam airtime lete hain, 802.11b clients aur protection overhead gayab ho jaate hain, aur usable cell edge AP ke kareeb aa jaata hai, jo sticky clients ko roam karne par majboor karta hai. Risks: cells pehle se patle hon to coverage holes, aur purane devices associate nahi kar sakte (status 18).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSMA/CA sunta hai, random backoff tak rukta hai, aur ACK na aane par bade contention window se retry karta hai.</li>
<li>EDCA chaar access categories (VO, VI, BE, BK) alag AIFSN aur CW values ke saath deta hai; WMM certified naam hai.</li>
<li>Mandatory rates clients ko support karne chahiye; sabse low wala beacons carry karta hai aur cell edge tay karta hai.</li>
<li>Slow clients sabse zyada airtime lete hain; 6 Mbps ka ek client 300 Mbps client ke 50 guna airtime ka kharcha karta hai.</li>
<li>Chaar 802.11b rates disable karne se protection overhead aur b clients hat jaate hain.</li>
</ul></div>
`}};export{e as default};