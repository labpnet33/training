var e={id:`media`,h:{en:`Cables, fibre, wireless and speed`,hi:`Cables, fibre, wireless aur speed`},body:{en:`
<p>If a network is a postal system, the <b>media</b> are the roads. Some roads are narrow lanes (old copper), some are highways (fibre), and some are not roads at all but air routes (wireless). The envelope does not change, but the road decides how fast it travels, how far it can go and what can disturb it on the way. Every network engineer must be able to look at a cable and say what it is, how fast it can run and how long it may be.</p>

<h3>Copper: twisted pair (UTP)</h3>
<p>The blue, grey or yellow cable plugged into most office PCs is <b>UTP</b> (unshielded twisted pair). Inside are 8 thin copper wires arranged as 4 pairs. Each pair is twisted around itself, because twisting cancels electrical noise from neighbouring wires and machines (called <b>crosstalk</b> and <b>EMI</b>, electromagnetic interference). <b>STP</b> (shielded twisted pair) adds a metal foil for noisy places like factories. The plug at each end is an <b>RJ45</b> connector (technically 8P8C: 8 positions, 8 contacts).</p>
<table class="cmp"><tr><th>Category</th><th>Typical speed</th><th>Maximum length</th></tr>
<tr><td>Cat5e</td><td>1 Gbps (1000BASE-T)</td><td>100 m</td></tr>
<tr><td>Cat6</td><td>1 Gbps; 10 Gbps up to about 55 m</td><td>100 m</td></tr>
<tr><td>Cat6a</td><td>10 Gbps (10GBASE-T)</td><td>100 m</td></tr>
<tr><td>Cat8</td><td>25 or 40 Gbps</td><td>30 m (inside data center rows)</td></tr>
</table>
<p>The magic number for copper Ethernet is <b>100 metres</b>: beyond that the signal becomes too weak and distorted. Names like <b>1000BASE-T</b> decode easily: 1000 Mbps, BASE-band signalling, T for twisted pair.</p>

<h3>Straight-through and crossover</h3>
<p>Ethernet over copper sends on some pins and receives on others. The wire colours are placed on the pins in one of two standard orders, <b>T568A</b> or <b>T568B</b>. A <b>straight-through</b> cable uses the same order at both ends and traditionally connects <i>different</i> kinds of device, such as a PC to a switch. A <b>crossover</b> cable uses T568A at one end and T568B at the other, swapping the transmit and receive pairs, and traditionally connects <i>similar</i> devices, such as switch to switch or PC to PC.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Straight-through and crossover pin mapping">
<text x="150" y="20" text-anchor="middle" class="svg-accent" font-size="13">Straight-through (B to B)</text>
<text x="490" y="20" text-anchor="middle" class="svg-accent" font-size="13">Crossover (A to B)</text>
<rect x="40" y="35" width="50" height="150" rx="6" fill="#bae6fd"/><rect x="210" y="35" width="50" height="150" rx="6" fill="#bbf7d0"/>
<rect x="380" y="35" width="50" height="150" rx="6" fill="#bae6fd"/><rect x="550" y="35" width="50" height="150" rx="6" fill="#bbf7d0"/>
<text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="65" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="65" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="235" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="235" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="235" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<line x1="90" y1="61" x2="210" y2="61" stroke="#64748b" stroke-width="2"/><line x1="90" y1="96" x2="210" y2="96" stroke="#64748b" stroke-width="2"/><line x1="90" y1="131" x2="210" y2="131" stroke="#64748b" stroke-width="2"/><line x1="90" y1="166" x2="210" y2="166" stroke="#64748b" stroke-width="2"/>
<text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="405" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="405" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="405" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<text x="575" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="575" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="575" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<line x1="430" y1="61" x2="550" y2="131" stroke="#64748b" stroke-width="2"/><line x1="430" y1="96" x2="550" y2="166" stroke="#64748b" stroke-width="2"/><line x1="430" y1="131" x2="550" y2="61" stroke="#64748b" stroke-width="2"/><line x1="430" y1="166" x2="550" y2="96" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">For 10/100 Mbps Ethernet, pins 1-2 and 3-6 carry the signals; a crossover swaps them. Gigabit uses all four pairs.</p></div>
<p>Today almost every port supports <b>Auto-MDIX</b>, which detects the cable and swaps the pairs electronically, so either cable works. Exams still ask about the classic rule, so learn it. You will also meet the <b>console (rollover) cable</b>, used to plug a laptop into the management port of a switch or router for first-time setup; you will use it in the next CCNA module.</p>

<h3>Fibre optic</h3>
<p>Fibre carries <b>light</b> through a hair-thin glass core. Light is not disturbed by electrical noise, travels much further and supports far higher speeds than copper.</p>
<table class="cmp"><tr><th></th><th>Single-mode (SMF)</th><th>Multimode (MMF)</th></tr>
<tr><td>Core size</td><td>About 9 microns</td><td>50 or 62.5 microns</td></tr>
<tr><td>Light source</td><td>Laser</td><td>LED or low-cost laser (VCSEL)</td></tr>
<tr><td>Distance</td><td>Kilometres to tens of kilometres</td><td>Up to a few hundred metres</td></tr>
<tr><td>Typical jacket colour</td><td>Yellow</td><td>Aqua (OM3/OM4) or orange (older OM1/OM2)</td></tr>
<tr><td>Typical use</td><td>Between buildings, cities, ISP links</td><td>Inside a building or data center</td></tr>
</table>
<p>Common fibre connectors are <b>LC</b> (small, most common today), <b>SC</b> (square push-pull), <b>ST</b> (round, twist-lock, older) and <b>MPO</b> (many fibres in one plug). Switches accept fibre through plug-in <b>transceivers</b>: SFP (1 Gbps), SFP+ (10 Gbps), SFP28 (25 Gbps), QSFP+ (40 Gbps) and QSFP28 (100 Gbps). Coaxial cable (a thick copper core with a shield) survives mainly for cable-TV internet.</p>

<h3>Wireless</h3>
<p>Wi-Fi (IEEE 802.11) uses radio in the <b>2.4 GHz</b> band (longer range, more crowded), the <b>5 GHz</b> band (faster, shorter range) and the <b>6 GHz</b> band (newest, very clean, shortest range). Generations: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 and 6E (802.11ax), Wi-Fi 7 (802.11be). Wireless is convenient but shared: everybody on the same channel takes turns, and walls, distance and interference reduce speed.</p>

<h3>Speed: bits per second, bandwidth and latency</h3>
<p>Link speed is measured in <b>bits per second (bps)</b>: 1 Kbps = 1,000 bps, 1 Mbps = 1,000,000 bps, 1 Gbps = 1,000,000,000 bps. File sizes are measured in <b>bytes</b>, and 1 byte = 8 bits. That is why a "100 Mbps" connection downloads at most about 12.5 megabytes per second.</p>
<ul>
<li><b>Bandwidth</b>: how much data the link can carry per second (how many lanes the road has).</li>
<li><b>Latency</b>: how long one piece of data takes to arrive (how long the drive takes), measured in milliseconds (ms). Light in fibre covers about 200 km per millisecond, so distance always adds latency.</li>
<li><b>Throughput</b>: what you actually get, after sharing, errors and overhead.</li>
<li><b>Jitter</b>: how much latency varies from packet to packet; it hurts voice and video calls.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A 500 MB video over a 100 Mbps link: 500 MB x 8 = 4,000 megabits. 4,000 / 100 = 40 seconds at best. Over a 1 Gbps link: 4 seconds. Now a video call from Chennai to a server 2,000 km of fibre away: the light alone needs about 10 ms each way, so the round trip can never be below about 20 ms, whatever the bandwidth.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Confusing Mbps (megabits) with MB/s (megabytes). Watch the small "b" versus big "B". Another classic: running a copper cable 120 m across a warehouse. The link may come up but drop errors all day, because 100 m is the limit.</p></div>

<div class="exam"><p><b>Exam trap.</b> Single-mode = laser, small core, long distance, usually yellow. Multimode = LED/VCSEL, bigger core, short distance, usually aqua or orange. Adding bandwidth does not reduce latency caused by distance.</p></div>

<div class="scn"><h4>The link that kept going down between two buildings</h4><p>A college connected its library to the main block, about 180 m away, with a Cat6 cable laid through a ditch. The link came up at 100 Mbps instead of 1 Gbps and dropped every time it rained or the lift motor ran. The network engineer measured the run, saw it was far beyond 100 m and next to power lines, and replaced it with a pair of single-mode fibres and 1 Gbps SFP transceivers at both ends. The link has been stable at full speed since.</p><p><b>Lesson:</b> copper Ethernet stops at 100 m and hates electrical noise. Between buildings, use fibre.</p></div>

<div class="iv"><p class="q">"What is the difference between single-mode and multimode fibre, and when would you use each?"</p><p>Strong answer: single-mode has a tiny core (about 9 microns), uses lasers and carries a single path of light over kilometres, so it is used between buildings, campuses and ISP sites. Multimode has a larger core (50 or 62.5 microns), uses cheaper LED or VCSEL optics and reaches a few hundred metres, so it suits links inside a building or data center. Mention connectors (LC, SC) and transceivers (SFP, SFP+), and that both ends must use matching fibre type and optics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTP: 4 twisted pairs, RJ45 plugs, 100 m limit; Cat5e/Cat6 for 1 Gbps, Cat6a for 10 Gbps at 100 m.</li>
<li>Straight-through for unlike devices, crossover for like devices; Auto-MDIX makes most ports accept either.</li>
<li>Fibre: single-mode (laser, km, yellow) vs multimode (LED/VCSEL, hundreds of metres, aqua/orange); LC/SC connectors; SFP transceivers.</li>
<li>Wi-Fi uses 2.4, 5 and 6 GHz; it is shared and affected by distance and walls.</li>
<li>Speeds are in bits per second; files are in bytes (divide by 8). Bandwidth is capacity, latency is delay.</li>
</ul></div>
`,hi:`
<p>Agar network postal system hai, to <b>media</b> sadkein hain. Kuch sadkein patli galiyaan hain (purana copper), kuch highways hain (fibre), aur kuch sadkein hi nahi balki hawai raaste hain (wireless). Envelope nahi badalta, lekin sadak tay karti hai ki woh kitna tez chalega, kitni door jaa sakta hai aur raaste mein kya use disturb kar sakta hai. Har network engineer ko cable dekh kar bata paana chahiye ki yeh kya hai, kitni speed par chal sakti hai aur kitni lambi ho sakti hai.</p>

<h3>Copper: twisted pair (UTP)</h3>
<p>Zyada tar office PCs mein lagi blue, grey ya yellow cable <b>UTP</b> (unshielded twisted pair) hai. Iske andar 8 patle copper wires hote hain jo 4 pairs mein lage hain. Har pair apne aap mein twisted hota hai, kyunki twisting aas-paas ke wires aur machines ka electrical noise cancel karti hai (jise <b>crosstalk</b> aur <b>EMI</b>, electromagnetic interference, kehte hain). <b>STP</b> (shielded twisted pair) factories jaisi noisy jagahon ke liye metal foil jodta hai. Har end par plug <b>RJ45</b> connector hota hai (technically 8P8C: 8 positions, 8 contacts).</p>
<table class="cmp"><tr><th>Category</th><th>Typical speed</th><th>Maximum length</th></tr>
<tr><td>Cat5e</td><td>1 Gbps (1000BASE-T)</td><td>100 m</td></tr>
<tr><td>Cat6</td><td>1 Gbps; 10 Gbps lagbhag 55 m tak</td><td>100 m</td></tr>
<tr><td>Cat6a</td><td>10 Gbps (10GBASE-T)</td><td>100 m</td></tr>
<tr><td>Cat8</td><td>25 ya 40 Gbps</td><td>30 m (data center rows ke andar)</td></tr>
</table>
<p>Copper Ethernet ka magic number hai <b>100 metre</b>: uske baad signal bahut kamzor aur distorted ho jaata hai. <b>1000BASE-T</b> jaise naam aasaani se decode hote hain: 1000 Mbps, BASE-band signalling, T matlab twisted pair.</p>

<h3>Straight-through aur crossover</h3>
<p>Copper par Ethernet kuch pins par bhejta hai aur kuch par receive karta hai. Wire ke colours pins par do standard orders mein se ek mein lagte hain, <b>T568A</b> ya <b>T568B</b>. <b>Straight-through</b> cable dono ends par same order use karti hai aur traditionally <i>alag</i> tarah ke devices ko jodti hai, jaise PC ko switch se. <b>Crossover</b> cable ek end par T568A aur dusre par T568B use karti hai, transmit aur receive pairs ko swap karti hai, aur traditionally <i>ek jaise</i> devices ko jodti hai, jaise switch se switch ya PC se PC.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Straight-through aur crossover pin mapping">
<text x="150" y="20" text-anchor="middle" class="svg-accent" font-size="13">Straight-through (B se B)</text>
<text x="490" y="20" text-anchor="middle" class="svg-accent" font-size="13">Crossover (A se B)</text>
<rect x="40" y="35" width="50" height="150" rx="6" fill="#bae6fd"/><rect x="210" y="35" width="50" height="150" rx="6" fill="#bbf7d0"/>
<rect x="380" y="35" width="50" height="150" rx="6" fill="#bae6fd"/><rect x="550" y="35" width="50" height="150" rx="6" fill="#bbf7d0"/>
<text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="65" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="65" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<text x="235" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="235" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="235" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="235" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<line x1="90" y1="61" x2="210" y2="61" stroke="#64748b" stroke-width="2"/><line x1="90" y1="96" x2="210" y2="96" stroke="#64748b" stroke-width="2"/><line x1="90" y1="131" x2="210" y2="131" stroke="#64748b" stroke-width="2"/><line x1="90" y1="166" x2="210" y2="166" stroke="#64748b" stroke-width="2"/>
<text x="405" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="405" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="405" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="405" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<text x="575" y="65" text-anchor="middle" class="svg-ink" font-size="12">pin 1</text><text x="575" y="100" text-anchor="middle" class="svg-ink" font-size="12">pin 2</text><text x="575" y="135" text-anchor="middle" class="svg-ink" font-size="12">pin 3</text><text x="575" y="170" text-anchor="middle" class="svg-ink" font-size="12">pin 6</text>
<line x1="430" y1="61" x2="550" y2="131" stroke="#64748b" stroke-width="2"/><line x1="430" y1="96" x2="550" y2="166" stroke="#64748b" stroke-width="2"/><line x1="430" y1="131" x2="550" y2="61" stroke="#64748b" stroke-width="2"/><line x1="430" y1="166" x2="550" y2="96" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">10/100 Mbps Ethernet mein pins 1-2 aur 3-6 signals le jaate hain; crossover inhe swap karti hai. Gigabit chaaron pairs use karta hai.</p></div>
<p>Aaj lagbhag har port <b>Auto-MDIX</b> support karta hai, jo cable detect karke pairs ko electronically swap kar deta hai, isliye koi bhi cable chal jaati hai. Exams abhi bhi classic rule poochte hain, isliye use seekho. Aap <b>console (rollover) cable</b> se bhi miloge, jo laptop ko switch ya router ke management port se first-time setup ke liye jodti hai; ise aap agle CCNA module mein use karoge.</p>

<h3>Fibre optic</h3>
<p>Fibre baal jitne patle glass core mein <b>light</b> le jaata hai. Light electrical noise se disturb nahi hoti, kahin zyada door jaati hai aur copper se kahin zyada speeds support karti hai.</p>
<table class="cmp"><tr><th></th><th>Single-mode (SMF)</th><th>Multimode (MMF)</th></tr>
<tr><td>Core size</td><td>Lagbhag 9 microns</td><td>50 ya 62.5 microns</td></tr>
<tr><td>Light source</td><td>Laser</td><td>LED ya sasta laser (VCSEL)</td></tr>
<tr><td>Doori</td><td>Kilometres se das-yon kilometres</td><td>Kuch sau metre tak</td></tr>
<tr><td>Typical jacket colour</td><td>Yellow</td><td>Aqua (OM3/OM4) ya orange (purane OM1/OM2)</td></tr>
<tr><td>Typical use</td><td>Buildings, shehron, ISP links ke beech</td><td>Building ya data center ke andar</td></tr>
</table>
<p>Common fibre connectors hain <b>LC</b> (chhota, aaj sabse common), <b>SC</b> (square push-pull), <b>ST</b> (gol, twist-lock, purana) aur <b>MPO</b> (ek plug mein kai fibres). Switches fibre ko plug-in <b>transceivers</b> se lete hain: SFP (1 Gbps), SFP+ (10 Gbps), SFP28 (25 Gbps), QSFP+ (40 Gbps) aur QSFP28 (100 Gbps). Coaxial cable (shield wala mota copper core) zyada tar cable-TV internet ke liye bachi hai.</p>

<h3>Wireless</h3>
<p>Wi-Fi (IEEE 802.11) radio use karta hai <b>2.4 GHz</b> band mein (zyada range, zyada bheed), <b>5 GHz</b> band mein (tez, kam range) aur <b>6 GHz</b> band mein (sabse naya, bahut saaf, sabse kam range). Generations: Wi-Fi 4 (802.11n), Wi-Fi 5 (802.11ac), Wi-Fi 6 aur 6E (802.11ax), Wi-Fi 7 (802.11be). Wireless convenient hai lekin shared hai: same channel par sab baari baari bolte hain, aur deewarein, doori aur interference speed kam karte hain.</p>

<h3>Speed: bits per second, bandwidth aur latency</h3>
<p>Link speed <b>bits per second (bps)</b> mein naapi jaati hai: 1 Kbps = 1,000 bps, 1 Mbps = 1,000,000 bps, 1 Gbps = 1,000,000,000 bps. File sizes <b>bytes</b> mein naapi jaati hain, aur 1 byte = 8 bits. Isiliye "100 Mbps" connection zyada se zyada lagbhag 12.5 megabytes per second download karta hai.</p>
<ul>
<li><b>Bandwidth</b>: link ek second mein kitna data le ja sakta hai (sadak mein kitni lanes hain).</li>
<li><b>Latency</b>: data ke ek tukde ko pahunchne mein kitna time lagta hai (drive kitni lambi hai), milliseconds (ms) mein naapte hain. Fibre mein light ek millisecond mein lagbhag 200 km chalti hai, isliye doori hamesha latency badhati hai.</li>
<li><b>Throughput</b>: sharing, errors aur overhead ke baad aapko asal mein kya milta hai.</li>
<li><b>Jitter</b>: latency packet se packet kitni badalti hai; yeh voice aur video calls ko nuksaan pahunchata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 100 Mbps link par 500 MB ka video: 500 MB x 8 = 4,000 megabits. 4,000 / 100 = best case 40 seconds. 1 Gbps link par: 4 seconds. Ab Chennai se 2,000 km fibre door server tak video call: sirf light ko har taraf lagbhag 10 ms chahiye, isliye round trip kabhi lagbhag 20 ms se kam nahi ho sakta, bandwidth chahe jitni ho.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Mbps (megabits) aur MB/s (megabytes) ko confuse karna. Chhote "b" aur bade "B" par dhyaan do. Ek aur classic: warehouse ke paar 120 m copper cable chalana. Link up ho sakta hai lekin din bhar errors aur drops aayenge, kyunki limit 100 m hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Single-mode = laser, chhota core, lambi doori, aam taur par yellow. Multimode = LED/VCSEL, bada core, kam doori, aam taur par aqua ya orange. Bandwidth badhane se doori wali latency kam nahi hoti.</p></div>

<div class="scn"><h4>Do buildings ke beech baar baar down hone wala link</h4><p>Ek college ne apni library ko main block se, lagbhag 180 m door, ek naali mein bichhi Cat6 cable se joda. Link 1 Gbps ki jagah 100 Mbps par up hua aur har baar baarish hone ya lift motor chalne par drop hota tha. Network engineer ne run naapa, dekha ki yeh 100 m se kahin zyada tha aur power lines ke paas tha, aur use single-mode fibres ke ek pair aur dono ends par 1 Gbps SFP transceivers se replace kiya. Tab se link full speed par stable hai.</p><p><b>Seekh:</b> copper Ethernet 100 m par ruk jaata hai aur electrical noise se nafrat karta hai. Buildings ke beech fibre use karo.</p></div>

<div class="iv"><p class="q">"Single-mode aur multimode fibre mein kya farak hai, aur kab kaunsa use karoge?"</p><p>Strong answer: single-mode ka core bahut chhota hota hai (lagbhag 9 microns), lasers use karta hai aur light ka ek hi path kilometres tak le jaata hai, isliye yeh buildings, campuses aur ISP sites ke beech use hota hai. Multimode ka core bada hota hai (50 ya 62.5 microns), saste LED ya VCSEL optics use karta hai aur kuch sau metre tak pahunchta hai, isliye building ya data center ke andar ke links ke liye theek hai. Connectors (LC, SC) aur transceivers (SFP, SFP+) mention karo, aur yeh ki dono ends par matching fibre type aur optics hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTP: 4 twisted pairs, RJ45 plugs, 100 m limit; 1 Gbps ke liye Cat5e/Cat6, 100 m par 10 Gbps ke liye Cat6a.</li>
<li>Alag devices ke liye straight-through, ek jaise devices ke liye crossover; Auto-MDIX se zyada tar ports dono le lete hain.</li>
<li>Fibre: single-mode (laser, km, yellow) vs multimode (LED/VCSEL, sau-yon metre, aqua/orange); LC/SC connectors; SFP transceivers.</li>
<li>Wi-Fi 2.4, 5 aur 6 GHz use karta hai; yeh shared hai aur doori aur deewaron se affect hota hai.</li>
<li>Speeds bits per second mein; files bytes mein (8 se divide karo). Bandwidth capacity hai, latency delay hai.</li>
</ul></div>
`}};export{e as default};