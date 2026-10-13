var e={id:`standards`,h:{en:`Ethernet standards, speeds and interface names`,hi:`Ethernet standards, speeds aur interface names`},body:{en:`
<p>Every country has a highway code so that drivers from different car makers can share the same road. Ethernet has the same thing: the <b>IEEE 802.3</b> family of standards. Because of it, a Cisco switch, a Juniper router, a laptop NIC and a printer all agree on voltages, light levels, frame formats and speeds. In this chapter you will learn to decode the names of those standards and to map them to the interface names you type on a Cisco device.</p>

<h3>Decoding a standard name</h3>
<p>Names such as <b>1000BASE-T</b> or <b>10GBASE-LR</b> follow one pattern:</p>
<ul>
<li>The number is the <b>speed</b> in Mbps (10, 100, 1000) or with a G for gigabits (10G, 25G, 100G).</li>
<li><b>BASE</b> means <b>baseband</b>: the medium carries only this one Ethernet signal.</li>
<li>The suffix is the <b>medium</b>: T for twisted-pair copper, TX for the 100 Mbps copper version, S for short wavelength (multimode), L for long wavelength (single-mode), E for extended reach, and a trailing number such as 4 for the number of lanes.</li>
</ul>

<table class="cmp"><tr><th>Common name</th><th>Standard</th><th>Speed</th><th>Medium and typical reach</th></tr>
<tr><td>Ethernet</td><td>10BASE-T (802.3i)</td><td>10 Mbps</td><td>UTP Cat3+, 100 m</td></tr>
<tr><td>Fast Ethernet</td><td>100BASE-TX (802.3u)</td><td>100 Mbps</td><td>UTP Cat5+, 100 m</td></tr>
<tr><td>Gigabit Ethernet</td><td>1000BASE-T (802.3ab)</td><td>1 Gbps</td><td>UTP Cat5e+, 100 m</td></tr>
<tr><td>Gigabit Ethernet</td><td>1000BASE-SX / LX (802.3z)</td><td>1 Gbps</td><td>MMF about 550 m / SMF 5 km (10 km LX/LH)</td></tr>
<tr><td>Multigigabit</td><td>2.5GBASE-T, 5GBASE-T (802.3bz)</td><td>2.5 / 5 Gbps</td><td>Cat5e / Cat6, 100 m; used for Wi-Fi APs</td></tr>
<tr><td>10 Gig Ethernet</td><td>10GBASE-T (802.3an)</td><td>10 Gbps</td><td>Cat6A, 100 m</td></tr>
<tr><td>10 Gig Ethernet</td><td>10GBASE-SR / LR (802.3ae)</td><td>10 Gbps</td><td>MMF 300 to 400 m / SMF 10 km</td></tr>
<tr><td>25, 40, 100 Gig</td><td>25GBASE-SR, 40GBASE-SR4, 100GBASE-SR4 / LR4</td><td>25 / 40 / 100 Gbps</td><td>Mostly data center fibre and DAC</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Decode <b>100GBASE-SR4</b>: 100 Gbps, baseband, <b>S</b>hort wavelength (850 nm multimode), <b>4</b> lanes of 25 Gbps each over parallel fibres, so it needs an MPO connector. Decode <b>1000BASE-LX</b>: 1 Gbps, long wavelength (1310 nm), normally single-mode fibre with LC connectors.</p></div>

<h3>Shared media versus point-to-point</h3>
<p>The exam asks you to understand two kinds of Ethernet connection:</p>
<ul>
<li><b>Shared media</b>: many devices share one collision domain, as in early coaxial Ethernet (10BASE5, 10BASE2) or a <b>hub</b>. Only one device can transmit at a time, so the devices must use half duplex and CSMA/CD (chapter 6).</li>
<li><b>Point-to-point</b>: exactly two devices on a link, such as a PC and a switch port, or two routers. Each direction has its own path, so full duplex is possible and there are no collisions. Every modern switched LAN is point-to-point links, and so are WAN serial links and fibre uplinks.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Shared media versus point-to-point">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Shared media (hub)</text>
<rect x="110" y="80" width="100" height="40" rx="8" fill="#fed7aa"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="20" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="55" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="125" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="230" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="265" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="55" y1="150" x2="140" y2="120" stroke="#64748b"/><line x1="160" y1="150" x2="160" y2="120" stroke="#64748b"/><line x1="265" y1="150" x2="180" y2="120" stroke="#64748b"/>
<text x="160" y="55" text-anchor="middle" class="svg-accent" font-size="12">one collision domain, half duplex</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Point-to-point (switch)</text>
<rect x="430" y="80" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="340" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="375" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="445" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="550" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="585" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="375" y1="150" x2="460" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="150" x2="480" y2="120" stroke="#64748b" stroke-width="2"/><line x1="585" y1="150" x2="500" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="480" y="55" text-anchor="middle" class="svg-accent" font-size="12">one collision domain per port, full duplex</text>
</svg><p class="cap">A hub repeats bits to everyone; a switch gives each device its own point-to-point link.</p></div>

<h3>A reminder about the frame</h3>
<p>From the network models module: an Ethernet frame has a 6-byte destination MAC, 6-byte source MAC, 2-byte type, 46 to 1500 bytes of data and a 4-byte <b>FCS</b> (frame check sequence, a CRC). So a normal frame is <b>64 to 1518 bytes</b> (1522 with an 802.1Q VLAN tag). Keep those two numbers in mind: frames smaller than 64 bytes are called <b>runts</b>, larger than the maximum are <b>giants</b>, and a bad FCS increments the <b>CRC</b> counter. You will use all three in chapter 9.</p>

<h3>Cisco interface names</h3>
<p>IOS names interfaces by their <b>maximum speed</b>, not the speed they are running at:</p>
<ul>
<li><code>FastEthernet0/1</code> (Fa0/1): a 10/100 port.</li>
<li><code>GigabitEthernet1/0/1</code> (Gi1/0/1): up to 1 Gbps. The numbers are usually switch (stack member) / module / port.</li>
<li><code>TwoGigabitEthernet</code>, <code>TenGigabitEthernet</code> (Te), <code>TwentyFiveGigE</code>, <code>FortyGigabitEthernet</code>, <code>HundredGigE</code> for faster ports.</li>
</ul>
<p>A Gi port negotiated down to 100 Mbps is still called GigabitEthernet. You can abbreviate names as long as they are unique: <code>int fa0/1</code>, <code>int g1/0/1</code>.</p>
<pre class="code">SW1(config)# interface fa0/1
SW1(config-if)# description UPLINK-R1       <span class="c">! always label uplinks</span>
SW1(config-if)# exit
SW1(config)# interface range fa0/2 - 8
SW1(config-if-range)# description USERS
SW1(config-if-range)# end</pre>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1       full    100 10/100BaseTX</span>
Fa0/2     USERS      notconnect   1       auto   auto 10/100BaseTX
Fa0/3     USERS      connected    1     a-full  a-100 10/100BaseTX</pre>
<p>The <b>Type</b> column tells you the medium of the port (10/100BaseTX, 10/100/1000BaseTX, or the SFP type such as 1000BaseSX SFP).</p>

<div class="warn"><p><b>Common mistakes.</b> Assuming that a GigabitEthernet port is running at 1 Gbps. Always check the actual speed in <code>show interfaces status</code>. Also, forgetting descriptions on uplinks: during an outage nobody knows what Fa0/1 connects to.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match standards to media: 1000BASE-T is copper Cat5e; 1000BASE-SX is multimode fibre; 1000BASE-LX is (normally) single-mode; 10GBASE-T needs Cat6A for 100 m. Hubs mean shared media and half duplex; switches mean point-to-point and full duplex.</p></div>

<div class="scn"><h4>The "gigabit" office that ran at 100</h4><p>An office upgraded to gigabit switches but users saw no improvement for large file copies. The engineer ran <code>show interfaces status</code> and saw most user ports at <code>a-100</code>. The ports were Gi, the PCs had gigabit NICs, but the building had old Cat5 cabling with two pairs terminated, which is enough for 100BASE-TX but not for 1000BASE-T. Re-terminating with all four pairs on the existing runs that tested well, and replacing the rest with Cat6, brought ports to <code>a-1000</code>.</p><p><b>Lesson:</b> the interface name tells you the maximum; the status output tells you the truth.</p></div>

<div class="iv"><p class="q">"What does 10GBASE-LR mean, and what cabling does it need?"</p><p>Strong answer: 10 Gbps, baseband, L for long wavelength, 1310 nm, on single-mode fibre up to about 10 km, normally an SFP+ with LC connectors. Contrast with 10GBASE-SR on multimode for a few hundred metres and 10GBASE-T on Cat6A copper for 100 m. Showing you can decode any name, not just memorise one, impresses interviewers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IEEE 802.3 names are speed + BASE + medium: T copper, S short-wave MMF, L long-wave SMF, number of lanes at the end.</li>
<li>Shared media (hubs, coax) is half duplex with CSMA/CD; point-to-point (switch ports) allows full duplex.</li>
<li>Frames are 64 to 1518 bytes (1522 tagged); smaller are runts, larger are giants.</li>
<li>Cisco names ports by maximum speed; check the real speed in <code>show interfaces status</code>.</li>
<li>Label uplinks with <code>description</code>.</li>
</ul></div>
`,hi:`
<p>Har desh ka ek highway code hota hai taaki alag alag car companies ke drivers ek hi sadak share kar sakein. Ethernet ke paas bhi yahi cheez hai: <b>IEEE 802.3</b> standards ki family. Iski wajah se Cisco switch, Juniper router, laptop NIC aur printer sab voltages, light levels, frame formats aur speeds par agree karte hain. Is chapter mein aap un standards ke naam decode karna seekhoge aur unhe un interface names se map karoge jo aap Cisco device par type karte ho.</p>

<h3>Standard ka naam decode karna</h3>
<p><b>1000BASE-T</b> ya <b>10GBASE-LR</b> jaise naam ek pattern follow karte hain:</p>
<ul>
<li>Number <b>speed</b> hai Mbps mein (10, 100, 1000) ya gigabits ke liye G ke saath (10G, 25G, 100G).</li>
<li><b>BASE</b> ka matlab <b>baseband</b>: medium sirf yahi ek Ethernet signal le jaata hai.</li>
<li>Suffix <b>medium</b> hai: T twisted-pair copper, TX 100 Mbps copper version, S short wavelength (multimode), L long wavelength (single-mode), E extended reach, aur end mein 4 jaisa number lanes ki ginti.</li>
</ul>

<table class="cmp"><tr><th>Common naam</th><th>Standard</th><th>Speed</th><th>Medium aur typical reach</th></tr>
<tr><td>Ethernet</td><td>10BASE-T (802.3i)</td><td>10 Mbps</td><td>UTP Cat3+, 100 m</td></tr>
<tr><td>Fast Ethernet</td><td>100BASE-TX (802.3u)</td><td>100 Mbps</td><td>UTP Cat5+, 100 m</td></tr>
<tr><td>Gigabit Ethernet</td><td>1000BASE-T (802.3ab)</td><td>1 Gbps</td><td>UTP Cat5e+, 100 m</td></tr>
<tr><td>Gigabit Ethernet</td><td>1000BASE-SX / LX (802.3z)</td><td>1 Gbps</td><td>MMF lagbhag 550 m / SMF 5 km (LX/LH 10 km)</td></tr>
<tr><td>Multigigabit</td><td>2.5GBASE-T, 5GBASE-T (802.3bz)</td><td>2.5 / 5 Gbps</td><td>Cat5e / Cat6, 100 m; Wi-Fi APs ke liye</td></tr>
<tr><td>10 Gig Ethernet</td><td>10GBASE-T (802.3an)</td><td>10 Gbps</td><td>Cat6A, 100 m</td></tr>
<tr><td>10 Gig Ethernet</td><td>10GBASE-SR / LR (802.3ae)</td><td>10 Gbps</td><td>MMF 300 se 400 m / SMF 10 km</td></tr>
<tr><td>25, 40, 100 Gig</td><td>25GBASE-SR, 40GBASE-SR4, 100GBASE-SR4 / LR4</td><td>25 / 40 / 100 Gbps</td><td>Zyada tar data center fibre aur DAC</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> <b>100GBASE-SR4</b> decode karo: 100 Gbps, baseband, <b>S</b>hort wavelength (850 nm multimode), parallel fibres par 25 Gbps ki <b>4</b> lanes, isliye MPO connector chahiye. <b>1000BASE-LX</b> decode karo: 1 Gbps, long wavelength (1310 nm), aam taur par LC connectors ke saath single-mode fibre.</p></div>

<h3>Shared media vs point-to-point</h3>
<p>Exam aapse do tarah ke Ethernet connection samajhne ko kehta hai:</p>
<ul>
<li><b>Shared media</b>: kai devices ek collision domain share karte hain, jaise shuruaati coaxial Ethernet (10BASE5, 10BASE2) ya <b>hub</b>. Ek waqt mein sirf ek device transmit kar sakta hai, isliye devices ko half duplex aur CSMA/CD use karna padta hai (chapter 6).</li>
<li><b>Point-to-point</b>: link par bilkul do devices, jaise PC aur switch port, ya do routers. Har direction ka apna path hai, isliye full duplex possible hai aur collisions nahi hote. Har modern switched LAN point-to-point links hai, aur WAN serial links aur fibre uplinks bhi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Shared media vs point-to-point">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="14">Shared media (hub)</text>
<rect x="110" y="80" width="100" height="40" rx="8" fill="#fed7aa"/><text x="160" y="105" text-anchor="middle" class="svg-ink" font-size="13">Hub</text>
<rect x="20" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="55" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="125" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="230" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="265" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="55" y1="150" x2="140" y2="120" stroke="#64748b"/><line x1="160" y1="150" x2="160" y2="120" stroke="#64748b"/><line x1="265" y1="150" x2="180" y2="120" stroke="#64748b"/>
<text x="160" y="55" text-anchor="middle" class="svg-accent" font-size="12">ek collision domain, half duplex</text>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="14">Point-to-point (switch)</text>
<rect x="430" y="80" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">Switch</text>
<rect x="340" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="375" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="445" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="550" y="150" width="70" height="30" rx="6" fill="#e2e8f0"/><text x="585" y="170" text-anchor="middle" class="svg-ink" font-size="12">PC3</text>
<line x1="375" y1="150" x2="460" y2="120" stroke="#64748b" stroke-width="2"/><line x1="480" y1="150" x2="480" y2="120" stroke="#64748b" stroke-width="2"/><line x1="585" y1="150" x2="500" y2="120" stroke="#64748b" stroke-width="2"/>
<text x="480" y="55" text-anchor="middle" class="svg-accent" font-size="12">har port ka alag collision domain, full duplex</text>
</svg><p class="cap">Hub bits sabko repeat karta hai; switch har device ko uska apna point-to-point link deta hai.</p></div>

<h3>Frame ke baare mein reminder</h3>
<p>Network models module se: Ethernet frame mein 6-byte destination MAC, 6-byte source MAC, 2-byte type, 46 se 1500 bytes data aur 4-byte <b>FCS</b> (frame check sequence, ek CRC) hota hai. Isliye normal frame <b>64 se 1518 bytes</b> ka hota hai (802.1Q VLAN tag ke saath 1522). Yeh do numbers yaad rakho: 64 bytes se chhote frames <b>runts</b> kehlate hain, maximum se bade <b>giants</b>, aur galat FCS <b>CRC</b> counter badhata hai. Aap teeno chapter 9 mein use karoge.</p>

<h3>Cisco interface names</h3>
<p>IOS interfaces ka naam unki <b>maximum speed</b> se rakhta hai, us speed se nahi jis par woh chal rahe hain:</p>
<ul>
<li><code>FastEthernet0/1</code> (Fa0/1): 10/100 port.</li>
<li><code>GigabitEthernet1/0/1</code> (Gi1/0/1): 1 Gbps tak. Numbers aam taur par switch (stack member) / module / port hote hain.</li>
<li>Tez ports ke liye <code>TwoGigabitEthernet</code>, <code>TenGigabitEthernet</code> (Te), <code>TwentyFiveGigE</code>, <code>FortyGigabitEthernet</code>, <code>HundredGigE</code>.</li>
</ul>
<p>100 Mbps par negotiate hua Gi port bhi GigabitEthernet hi kehlata hai. Naam ko chhota likh sakte ho jab tak woh unique ho: <code>int fa0/1</code>, <code>int g1/0/1</code>.</p>
<pre class="code">SW1(config)# interface fa0/1
SW1(config-if)# description UPLINK-R1       <span class="c">! uplinks par hamesha label lagao</span>
SW1(config-if)# exit
SW1(config)# interface range fa0/2 - 8
SW1(config-if-range)# description USERS
SW1(config-if-range)# end</pre>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1       full    100 10/100BaseTX</span>
Fa0/2     USERS      notconnect   1       auto   auto 10/100BaseTX
Fa0/3     USERS      connected    1     a-full  a-100 10/100BaseTX</pre>
<p><b>Type</b> column port ka medium batata hai (10/100BaseTX, 10/100/1000BaseTX, ya SFP type jaise 1000BaseSX SFP).</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maan lena ki GigabitEthernet port 1 Gbps par chal raha hai. Hamesha <code>show interfaces status</code> mein actual speed check karo. Aur uplinks par description bhool jaana: outage ke waqt kisi ko pata nahi hota ki Fa0/1 kisse juda hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standards ko media se match karo: 1000BASE-T copper Cat5e hai; 1000BASE-SX multimode fibre; 1000BASE-LX (aam taur par) single-mode; 10GBASE-T ko 100 m ke liye Cat6A chahiye. Hubs ka matlab shared media aur half duplex; switches ka matlab point-to-point aur full duplex.</p></div>

<div class="scn"><h4>"Gigabit" office jo 100 par chalta tha</h4><p>Ek office ne gigabit switches par upgrade kiya lekin users ko badi file copies mein koi sudhaar nahi dikha. Engineer ne <code>show interfaces status</code> chalaya aur zyada tar user ports <code>a-100</code> par dekhe. Ports Gi the, PCs mein gigabit NICs the, lekin building mein purani Cat5 cabling thi jismein do pairs hi terminated the, jo 100BASE-TX ke liye kaafi hai lekin 1000BASE-T ke liye nahi. Jo existing runs test mein theek nikle unhe chaaron pairs ke saath re-terminate kiya, aur baaki ko Cat6 se badla, tab ports <code>a-1000</code> par aaye.</p><p><b>Seekh:</b> interface ka naam maximum batata hai; status output sach batata hai.</p></div>

<div class="iv"><p class="q">"10GBASE-LR ka kya matlab hai, aur use kaunsi cabling chahiye?"</p><p>Strong answer: 10 Gbps, baseband, L yaani long wavelength, 1310 nm, single-mode fibre par lagbhag 10 km tak, aam taur par LC connectors wala SFP+. Iski tulna 10GBASE-SR se karo jo multimode par kuch sau metre jaata hai aur 10GBASE-T se jo Cat6A copper par 100 m. Yeh dikhana ki aap koi bhi naam decode kar sakte ho, sirf ek yaad nahi kiya, interviewers ko impress karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IEEE 802.3 names speed + BASE + medium hain: T copper, S short-wave MMF, L long-wave SMF, end mein lanes ki ginti.</li>
<li>Shared media (hubs, coax) CSMA/CD ke saath half duplex hai; point-to-point (switch ports) full duplex allow karta hai.</li>
<li>Frames 64 se 1518 bytes (tagged 1522) hote hain; chhote runts hain, bade giants.</li>
<li>Cisco ports ka naam maximum speed se rakhta hai; real speed <code>show interfaces status</code> mein check karo.</li>
<li>Uplinks ko <code>description</code> se label karo.</li>
</ul></div>
`}};export{e as default};