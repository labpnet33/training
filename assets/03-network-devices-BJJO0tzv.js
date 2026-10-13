var e={id:`devices`,h:{en:`Network devices and what each one decides`,hi:`Network devices aur har ek kya decide karta hai`},body:{en:`
<p>Walk into any office building and think of it as a small town. The people are the <b>endpoints</b>. The lifts and corridors on each floor that take you to the right desk are the <b>switches</b>. The main gate, which knows how to reach other buildings and other cities, is the <b>router</b>. The security guard who checks every visitor against a list is the <b>firewall</b>. Each one makes a different decision, and the easiest way to remember a device is to ask: <i>what does it decide, and using what information?</i></p>

<h3>Endpoints and the NIC</h3>
<p>An <b>endpoint</b> (also called a <b>host</b> or end device) is any device where data starts or finishes: PCs, laptops, phones, printers, IP cameras, IP phones, servers and IoT sensors. Every endpoint connects through a <b>NIC</b> (network interface card), the hardware that turns data into electrical, light or radio signals. A laptop usually has two NICs: one Ethernet port and one Wi-Fi adapter. Every NIC has a burned-in hardware address called a <b>MAC address</b>, which you will study in chapter 6.</p>

<h3>The infrastructure devices</h3>
<table class="cmp"><tr><th>Device</th><th>What it decides</th><th>Using what</th></tr>
<tr><td><b>Hub</b> (legacy)</td><td>Nothing. It repeats every signal out of every other port.</td><td>No addresses at all</td></tr>
<tr><td><b>Switch</b></td><td>Which port inside the LAN a frame should leave from</td><td>MAC addresses, stored in a MAC address table</td></tr>
<tr><td><b>Router</b></td><td>Which next network a packet should be sent to</td><td>IP addresses, stored in a routing table</td></tr>
<tr><td><b>Access point (AP)</b></td><td>Joins wireless clients to the wired LAN</td><td>Radio (Wi-Fi) plus MAC addresses</td></tr>
<tr><td><b>Firewall</b></td><td>Whether traffic is allowed or blocked</td><td>Security rules: addresses, ports, applications, connection state</td></tr>
<tr><td><b>Modem / ONT</b></td><td>Nothing about addresses; it converts signals</td><td>Turns ISP line signals (DSL, cable, fibre) into Ethernet</td></tr>
</table>

<h4>Switch</h4>
<p>A switch connects devices inside one LAN. It learns which MAC address lives on which port by looking at the <b>source</b> address of every frame it receives, and builds a <b>MAC address table</b>. When a frame arrives for a known MAC, the switch sends it out only that one port. When the destination is unknown, or the frame is a broadcast, it floods it out of all other ports in that LAN. Offices use switches with 24 or 48 ports; data centers use very fast ones.</p>

<h4>Router</h4>
<p>A router connects <b>different</b> networks: your office LAN to the ISP, or head office to a branch. It reads the <b>destination IP address</b> of each packet, looks it up in its <b>routing table</b>, and sends the packet toward the next router on the way. Routers are the "sorting centres" of the postal analogy. The router your PC uses to leave its own network is called its <b>default gateway</b>.</p>

<h4>Access point and wireless controller</h4>
<p>An <b>AP</b> is a radio that lets Wi-Fi devices join the wired network. A home router has one built in. Offices mount many APs on ceilings, and a <b>wireless LAN controller (WLC)</b>, either a box or a cloud service, manages them all centrally.</p>

<h4>Firewall</h4>
<p>A firewall sits at a boundary, typically between your network and the internet, and checks traffic against rules such as "staff may browse the web" and "nobody from outside may reach the accounting server". Modern firewalls are <b>stateful</b>: they remember connections started from inside and automatically allow the replies. <b>Next-generation firewalls (NGFW)</b> also recognise applications and block known attacks. Related devices you will hear about: <b>IDS/IPS</b> (intrusion detection/prevention) and <b>load balancers</b> (spread client requests across several servers).</p>

<h4>Modem and ONT</h4>
<p>A <b>modem</b> (modulator-demodulator) converts between the signal on the ISP's line (DSL on telephone copper, or cable TV coax) and Ethernet. With fibre-to-the-home, the box is an <b>ONT</b> (optical network terminal). Many ISP boxes combine the modem or ONT with the home router.</p>

<h4>Servers and the cloud</h4>
<p>A <b>server</b> is a computer that provides a service to clients: web, email, files, databases, DHCP, DNS. It can be a physical machine, a <b>virtual machine</b> sharing hardware with others, or a container. <b>Cloud</b> means renting servers, storage and network from a provider and reaching them over the internet or a private link. In diagrams a cloud shape also means "a network we do not show in detail", such as the internet or an ISP's WAN.</p>

<h3>The icons you will see in diagrams</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Common network diagram icons">
<circle cx="60" cy="60" r="32" fill="#bae6fd" stroke="#64748b"/><line x1="40" y1="60" x2="80" y2="60" stroke="#64748b" stroke-width="2"/><line x1="60" y1="40" x2="60" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="60" y="120" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="60" y="137" text-anchor="middle" class="svg-muted" font-size="12">round, arrows</text>
<rect x="130" y="36" width="90" height="48" rx="4" fill="#bbf7d0" stroke="#64748b"/><line x1="145" y1="52" x2="205" y2="52" stroke="#64748b" stroke-width="2"/><line x1="145" y1="68" x2="205" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="175" y="120" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="175" y="137" text-anchor="middle" class="svg-muted" font-size="12">flat box, arrows</text>
<rect x="250" y="36" width="80" height="48" fill="#fed7aa" stroke="#64748b"/><line x1="250" y1="52" x2="330" y2="52" stroke="#64748b"/><line x1="250" y1="68" x2="330" y2="68" stroke="#64748b"/><line x1="290" y1="36" x2="290" y2="52" stroke="#64748b"/><line x1="270" y1="52" x2="270" y2="68" stroke="#64748b"/><line x1="310" y1="52" x2="310" y2="68" stroke="#64748b"/><line x1="290" y1="68" x2="290" y2="84" stroke="#64748b"/>
<text x="290" y="120" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="290" y="137" text-anchor="middle" class="svg-muted" font-size="12">brick wall</text>
<rect x="370" y="44" width="60" height="30" rx="6" fill="#ddd6fe" stroke="#64748b"/><line x1="385" y1="44" x2="378" y2="26" stroke="#64748b" stroke-width="2"/><line x1="415" y1="44" x2="422" y2="26" stroke="#64748b" stroke-width="2"/>
<text x="400" y="120" text-anchor="middle" class="svg-ink" font-size="13">Access point</text><text x="400" y="137" text-anchor="middle" class="svg-muted" font-size="12">antennas / waves</text>
<ellipse cx="545" cy="60" rx="70" ry="30" fill="#e2e8f0" stroke="#64748b"/><text x="545" y="65" text-anchor="middle" class="svg-muted" font-size="12">internet / WAN</text>
<text x="545" y="120" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text><text x="545" y="137" text-anchor="middle" class="svg-muted" font-size="12">network not detailed</text>
</svg><p class="cap">Simplified versions of the standard icons. Vendors draw them slightly differently, but the shapes are the same everywhere.</p></div>

<div class="eg"><p><b>Worked example: a 20-person office.</b> The ISP's fibre enters an ONT. The ONT feeds a firewall (outside port 198.51.100.10). The firewall's inside port connects to a router function that is the default gateway 192.168.10.1 for staff. One 24-port switch connects 18 PCs, two printers and two ceiling APs. A small server in the corner runs file sharing. Count the decisions: the switch picks ports by MAC, the router picks networks by IP, the firewall picks allow or block by rules, the APs join Wi-Fi to the wired LAN.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Saying "a switch connects networks". A switch connects devices <b>inside</b> one network; a router connects <b>different</b> networks. If two PCs are in different IP networks, a switch alone cannot let them talk. They need a router (or a Layer 3 switch, which is a switch with routing built in, covered in later modules).</p></div>

<div class="exam"><p><b>Exam trap.</b> Hubs are Layer 1 and send everything everywhere, so every device shares the bandwidth and collisions happen. Switches are Layer 2 (MAC). Routers are Layer 3 (IP). Expect questions that describe what a box does ("forwards based on the destination MAC address") and ask you to name it.</p></div>

<div class="scn"><h4>The "faster switch" that fixed nothing</h4><p>A shop owner complained that the internet was slow and bought an expensive new switch. Nothing changed. A technician measured the speed at the firewall's outside port and found the ISP plan was only 20 Mbps, shared by 30 devices, including a CCTV recorder uploading video all day. The switch had never been the bottleneck; the internet link was. Upgrading the plan and limiting the CCTV upload fixed the problem.</p><p><b>Lesson:</b> know what each device does before replacing it. Find where the traffic is actually limited.</p></div>

<div class="iv"><p class="q">"What is the difference between a hub, a switch and a router?"</p><p>Strong answer: a hub is a Layer 1 repeater that sends every signal out of every port, so all devices share bandwidth and collide. A switch is Layer 2: it learns MAC addresses in a MAC address table and forwards a frame only out of the port where the destination lives, inside one LAN. A router is Layer 3: it uses a routing table and destination IP addresses to forward packets between different networks, and acts as the default gateway for hosts. Mention that hubs are obsolete today.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoints start and finish data; each connects through a NIC with a MAC address.</li>
<li>Switch: forwards frames inside a LAN using a MAC address table.</li>
<li>Router: forwards packets between networks using a routing table; the host's exit router is its default gateway.</li>
<li>Firewall: allows or blocks by rules; AP: joins Wi-Fi to the wired LAN; modem/ONT: converts ISP line signals.</li>
<li>Learn each device by asking "what does it decide, and using what information?"</li>
</ul></div>
`,hi:`
<p>Kisi bhi office building mein jaao aur use ek chhota town samjho. Log <b>endpoints</b> hain. Har floor ke lifts aur corridors jo aapko sahi desk tak le jaate hain, woh <b>switches</b> hain. Main gate, jise pata hai ki dusri buildings aur dusre shehron tak kaise pahunchna hai, woh <b>router</b> hai. Security guard jo har visitor ko list se check karta hai, woh <b>firewall</b> hai. Har ek alag decision leta hai, aur kisi device ko yaad rakhne ka sabse aasaan tareeka hai poochna: <i>yeh kya decide karta hai, aur kis information se?</i></p>

<h3>Endpoints aur NIC</h3>
<p><b>Endpoint</b> (jise <b>host</b> ya end device bhi kehte hain) koi bhi device hai jahan data shuru ya khatam hota hai: PCs, laptops, phones, printers, IP cameras, IP phones, servers aur IoT sensors. Har endpoint ek <b>NIC</b> (network interface card) se judta hai, woh hardware jo data ko electrical, light ya radio signals mein badalta hai. Laptop mein aam taur par do NICs hote hain: ek Ethernet port aur ek Wi-Fi adapter. Har NIC ka ek burned-in hardware address hota hai jise <b>MAC address</b> kehte hain, jo aap chapter 6 mein padhoge.</p>

<h3>Infrastructure devices</h3>
<table class="cmp"><tr><th>Device</th><th>Kya decide karta hai</th><th>Kis cheez se</th></tr>
<tr><td><b>Hub</b> (purana)</td><td>Kuch nahi. Har signal ko baaki har port se repeat kar deta hai.</td><td>Koi address nahi</td></tr>
<tr><td><b>Switch</b></td><td>LAN ke andar frame kis port se nikle</td><td>MAC addresses, jo MAC address table mein store hote hain</td></tr>
<tr><td><b>Router</b></td><td>Packet ko kis agle network par bhejna hai</td><td>IP addresses, jo routing table mein store hote hain</td></tr>
<tr><td><b>Access point (AP)</b></td><td>Wireless clients ko wired LAN se jodta hai</td><td>Radio (Wi-Fi) plus MAC addresses</td></tr>
<tr><td><b>Firewall</b></td><td>Traffic allow ho ya block</td><td>Security rules: addresses, ports, applications, connection state</td></tr>
<tr><td><b>Modem / ONT</b></td><td>Addresses ke baare mein kuch nahi; signals convert karta hai</td><td>ISP line ke signals (DSL, cable, fibre) ko Ethernet mein badalta hai</td></tr>
</table>

<h4>Switch</h4>
<p>Switch ek LAN ke andar devices ko jodta hai. Woh har aane wale frame ka <b>source</b> address dekh kar seekhta hai ki kaunsa MAC address kis port par hai, aur ek <b>MAC address table</b> banata hai. Jab kisi known MAC ke liye frame aata hai, switch use sirf usi ek port se bhejta hai. Jab destination unknown ho, ya frame broadcast ho, to woh use us LAN ke baaki saare ports se flood kar deta hai. Offices 24 ya 48 port wale switches use karte hain; data centers bahut fast wale.</p>

<h4>Router</h4>
<p>Router <b>alag alag</b> networks ko jodta hai: aapke office LAN ko ISP se, ya head office ko branch se. Woh har packet ka <b>destination IP address</b> padhta hai, use apni <b>routing table</b> mein dhoondhta hai, aur packet ko raaste ke agle router ki taraf bhej deta hai. Postal analogy ke "sorting centres" routers hi hain. Jis router se aapka PC apne network se bahar jaata hai use uska <b>default gateway</b> kehte hain.</p>

<h4>Access point aur wireless controller</h4>
<p><b>AP</b> ek radio hai jo Wi-Fi devices ko wired network join karne deta hai. Home router mein ek built-in hota hai. Offices ceilings par bahut saare APs lagate hain, aur ek <b>wireless LAN controller (WLC)</b>, box ya cloud service, un sab ko centrally manage karta hai.</p>

<h4>Firewall</h4>
<p>Firewall ek boundary par baithta hai, aam taur par aapke network aur internet ke beech, aur traffic ko rules se check karta hai jaise "staff web browse kar sakta hai" aur "bahar se koi accounting server tak nahi pahunch sakta". Modern firewalls <b>stateful</b> hote hain: woh andar se shuru hue connections yaad rakhte hain aur unke replies automatically allow karte hain. <b>Next-generation firewalls (NGFW)</b> applications bhi pehchaante hain aur known attacks block karte hain. Related devices jo aap sunoge: <b>IDS/IPS</b> (intrusion detection/prevention) aur <b>load balancers</b> (client requests ko kai servers mein baant-te hain).</p>

<h4>Modem aur ONT</h4>
<p><b>Modem</b> (modulator-demodulator) ISP ki line ke signal (telephone copper par DSL, ya cable TV coax) aur Ethernet ke beech convert karta hai. Fibre-to-the-home mein yeh box <b>ONT</b> (optical network terminal) hota hai. Bahut saare ISP boxes modem ya ONT ko home router ke saath combine karte hain.</p>

<h4>Servers aur cloud</h4>
<p><b>Server</b> ek computer hai jo clients ko service deta hai: web, email, files, databases, DHCP, DNS. Yeh physical machine ho sakta hai, dusron ke saath hardware share karne wali <b>virtual machine</b>, ya container. <b>Cloud</b> ka matlab hai provider se servers, storage aur network kiraye par lena aur unhe internet ya private link se use karna. Diagrams mein cloud shape ka matlab "aisa network jo hum detail mein nahi dikha rahe" bhi hota hai, jaise internet ya ISP ka WAN.</p>

<h3>Diagrams mein dikhne wale icons</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Common network diagram icons">
<circle cx="60" cy="60" r="32" fill="#bae6fd" stroke="#64748b"/><line x1="40" y1="60" x2="80" y2="60" stroke="#64748b" stroke-width="2"/><line x1="60" y1="40" x2="60" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="60" y="120" text-anchor="middle" class="svg-ink" font-size="13">Router</text><text x="60" y="137" text-anchor="middle" class="svg-muted" font-size="12">gol, arrows</text>
<rect x="130" y="36" width="90" height="48" rx="4" fill="#bbf7d0" stroke="#64748b"/><line x1="145" y1="52" x2="205" y2="52" stroke="#64748b" stroke-width="2"/><line x1="145" y1="68" x2="205" y2="68" stroke="#64748b" stroke-width="2"/>
<text x="175" y="120" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="175" y="137" text-anchor="middle" class="svg-muted" font-size="12">flat box, arrows</text>
<rect x="250" y="36" width="80" height="48" fill="#fed7aa" stroke="#64748b"/><line x1="250" y1="52" x2="330" y2="52" stroke="#64748b"/><line x1="250" y1="68" x2="330" y2="68" stroke="#64748b"/><line x1="290" y1="36" x2="290" y2="52" stroke="#64748b"/><line x1="270" y1="52" x2="270" y2="68" stroke="#64748b"/><line x1="310" y1="52" x2="310" y2="68" stroke="#64748b"/><line x1="290" y1="68" x2="290" y2="84" stroke="#64748b"/>
<text x="290" y="120" text-anchor="middle" class="svg-ink" font-size="13">Firewall</text><text x="290" y="137" text-anchor="middle" class="svg-muted" font-size="12">eenton ki deewar</text>
<rect x="370" y="44" width="60" height="30" rx="6" fill="#ddd6fe" stroke="#64748b"/><line x1="385" y1="44" x2="378" y2="26" stroke="#64748b" stroke-width="2"/><line x1="415" y1="44" x2="422" y2="26" stroke="#64748b" stroke-width="2"/>
<text x="400" y="120" text-anchor="middle" class="svg-ink" font-size="13">Access point</text><text x="400" y="137" text-anchor="middle" class="svg-muted" font-size="12">antennas / waves</text>
<ellipse cx="545" cy="60" rx="70" ry="30" fill="#e2e8f0" stroke="#64748b"/><text x="545" y="65" text-anchor="middle" class="svg-muted" font-size="12">internet / WAN</text>
<text x="545" y="120" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text><text x="545" y="137" text-anchor="middle" class="svg-muted" font-size="12">detail nahi dikhaya</text>
</svg><p class="cap">Standard icons ke simple versions. Vendors inhe thoda alag draw karte hain, lekin shapes har jagah same hain.</p></div>

<div class="eg"><p><b>Worked example: 20 logon ka office.</b> ISP ka fibre ek ONT mein aata hai. ONT ek firewall ko feed karta hai (outside port 198.51.100.10). Firewall ka inside port ek router function se juda hai jo staff ke liye default gateway 192.168.10.1 hai. Ek 24-port switch 18 PCs, do printers aur do ceiling APs ko jodta hai. Kone mein ek chhota server file sharing chalata hai. Decisions gino: switch MAC se ports chunta hai, router IP se networks chunta hai, firewall rules se allow ya block chunta hai, APs Wi-Fi ko wired LAN se jodte hain.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Kehna ki "switch networks ko jodta hai". Switch ek network ke <b>andar</b> devices ko jodta hai; router <b>alag</b> networks ko jodta hai. Agar do PCs alag IP networks mein hain, to akela switch unhe baat nahi karwa sakta. Unhe router chahiye (ya Layer 3 switch, jo routing built-in wala switch hai, baad ke modules mein cover hota hai).</p></div>

<div class="exam"><p><b>Exam trap.</b> Hubs Layer 1 hote hain aur sab kuch har jagah bhejte hain, isliye har device bandwidth share karta hai aur collisions hote hain. Switches Layer 2 (MAC) hain. Routers Layer 3 (IP) hain. Aise questions expect karo jo batate hain ki box kya karta hai ("destination MAC address ke basis par forward karta hai") aur uska naam poochte hain.</p></div>

<div class="scn"><h4>"Faster switch" jisne kuch theek nahi kiya</h4><p>Ek shop owner ne complain kiya ki internet slow hai aur ek mehenga naya switch khareed liya. Kuch nahi badla. Ek technician ne firewall ke outside port par speed naapi aur paaya ki ISP plan sirf 20 Mbps ka tha, jo 30 devices share kar rahe the, jismein ek CCTV recorder bhi tha jo din bhar video upload karta tha. Switch kabhi bottleneck tha hi nahi; internet link tha. Plan upgrade karne aur CCTV upload limit karne se problem theek ho gayi.</p><p><b>Seekh:</b> kisi device ko replace karne se pehle jaano ki woh kya karta hai. Dhoondo ki traffic asal mein kahan limit ho raha hai.</p></div>

<div class="iv"><p class="q">"Hub, switch aur router mein kya farak hai?"</p><p>Strong answer: hub Layer 1 repeater hai jo har signal har port se bhejta hai, isliye saare devices bandwidth share karte hain aur collide karte hain. Switch Layer 2 hai: woh MAC address table mein MAC addresses seekhta hai aur frame ko sirf usi port se forward karta hai jahan destination hai, ek LAN ke andar. Router Layer 3 hai: woh routing table aur destination IP addresses use karke alag networks ke beech packets forward karta hai, aur hosts ke liye default gateway ka kaam karta hai. Mention karo ki aaj hubs obsolete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Endpoints data shuru aur khatam karte hain; har ek MAC address wale NIC se judta hai.</li>
<li>Switch: LAN ke andar MAC address table se frames forward karta hai.</li>
<li>Router: routing table se networks ke beech packets forward karta hai; host ka exit router uska default gateway hai.</li>
<li>Firewall: rules se allow ya block karta hai; AP: Wi-Fi ko wired LAN se jodta hai; modem/ONT: ISP line ke signals convert karta hai.</li>
<li>Har device ko is sawaal se seekho: "yeh kya decide karta hai, aur kis information se?"</li>
</ul></div>
`}};export{e as default};