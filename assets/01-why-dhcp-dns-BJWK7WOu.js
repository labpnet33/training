var e={id:`intro`,h:{en:`Why every network needs DHCP and DNS`,hi:`Har network ko DHCP aur DNS kyun chahiye`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain how a host gets its address automatically, message by message; configure a Cisco router as a DHCP server for several subnets; make a remote router relay DHCP requests with <code>ip helper-address</code>; turn a router interface into a DHCP client; verify leases on Windows, Linux and macOS; explain how DNS turns names into addresses; configure the IOS DNS client; and troubleshoot the two most common help-desk tickets in the world: <b>"I have no network"</b> and <b>"it works by IP but not by name"</b>.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing and subnet masks (the IPv4 module), the IOS CLI and its modes (the IOS module), and the idea that routers join subnets while switches forward inside one. You met DHCP relay briefly in the inter-VLAN routing module and DHCP snooping in Layer 2 security; here we go deep on the protocols themselves. NAT, NTP, SNMP and syslog come in the next modules of this domain.</p>

<h3>The analogy: a hotel reception and a phone directory</h3>
<p>Picture a guest arriving at a hotel. They do not choose their own room number; they walk to reception and say "I need a room". Reception checks which rooms are free, gives the guest a key card for room 214, tells them where the lift is, the Wi-Fi name and the checkout time. When the stay ends the room goes back into the pool for the next guest.</p>
<p><b>DHCP (Dynamic Host Configuration Protocol)</b> is that reception desk. A new laptop joins the network knowing nothing, not even its own IP address. It shouts "I need an address", and a DHCP server answers with an <b>IP address and mask</b> (the room number), a <b>default gateway</b> (the lift out of the floor), a <b>DNS server</b> (where to look things up) and a <b>lease time</b> (the checkout time).</p>
<p>Now the guest wants to call a friend called "Priya". Nobody remembers phone numbers, so they look in the directory. <b>DNS (Domain Name System)</b> is the network's directory: people type <code>www.nwk.lab</code>, and DNS answers with the address <code>10.1.100.80</code> that computers actually need.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP gives the address, DNS gives the name lookup">
<rect x="10" y="80" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="106" text-anchor="middle" class="svg-ink" font-size="14">New laptop</text><text x="70" y="126" text-anchor="middle" class="svg-muted" font-size="12">no IP yet</text>
<rect x="250" y="10" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="330" y="36" text-anchor="middle" class="svg-ink" font-size="14">DHCP server</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">R1 in our lab</text>
<rect x="250" y="150" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="330" y="176" text-anchor="middle" class="svg-ink" font-size="14">DNS server</text><text x="330" y="196" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.53</text>
<rect x="500" y="80" width="130" height="60" rx="10" fill="#fde68a"/><text x="565" y="106" text-anchor="middle" class="svg-ink" font-size="14">Web server</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="12">www.nwk.lab</text>
<line x1="130" y1="95" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><text x="180" y="58" class="svg-accent" font-size="12">1. address?</text>
<line x1="130" y1="125" x2="250" y2="180" stroke="#64748b" stroke-width="2"/><text x="150" y="175" class="svg-accent" font-size="12">2. name to IP?</text>
<line x1="130" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="420" y="102" class="svg-accent" font-size="12">3. connect</text>
</svg><p class="cap">First DHCP gives the host its identity, then DNS tells it where to go, and only then can the real conversation start.</p></div>

<h3>Why not just type the addresses by hand?</h3>
<p>You can, and for routers, switches, servers and printers you usually should: infrastructure needs addresses that never change. But for users it breaks down fast:</p>
<ul>
<li><b>Scale.</b> A college with 2,000 laptops and phones cannot have an engineer walk to every device.</li>
<li><b>Mobility.</b> A phone moves from the campus Wi-Fi to the annex and needs a different subnet each time.</li>
<li><b>Mistakes.</b> One typed duplicate address knocks two devices off the network; one wrong gateway leaves a user stuck in their subnet.</li>
<li><b>Change.</b> If the DNS server moves, DHCP updates every client at its next renewal. Static clients would all need touching.</li>
</ul>
<p>DNS solves a different problem: humans remember names, and servers change addresses. If the web server moves from 10.1.100.80 to 10.1.100.81, you change one DNS record and every user keeps typing the same name.</p>

<h3>The lab network you will use throughout</h3>
<p>Every chapter refers to the same topology, which is also the topology of the module's labs. A college campus LAN (192.168.10.0/24) sits behind router <b>R1</b> via switch <b>SW-CAMPUS</b>, with PC1 and PC2. The annex LAN (192.168.20.0/24) sits behind <b>R2</b> via <b>SW-ANNEX</b>, with PC3 and PC4. R1 and R2 are joined by 10.1.12.0/30 (R1 = .1, R2 = .2). R1's Gi0/2 connects the server subnet 10.1.100.0/24, where the DNS server lives at 10.1.100.53. The campus domain name is <code>nwk.lab</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="90" height="36" rx="8" fill="#bae6fd"/><text x="55" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1, PC2</text>
<rect x="130" y="20" width="110" height="36" rx="8" fill="#e2e8f0"/><text x="185" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW-CAMPUS</text>
<rect x="280" y="20" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="420" y="20" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="460" y="43" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="530" y="20" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="580" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW-ANNEX</text>
<rect x="530" y="120" width="100" height="36" rx="8" fill="#bae6fd"/><text x="580" y="143" text-anchor="middle" class="svg-ink" font-size="13">PC3, PC4</text>
<rect x="260" y="160" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">DNS server</text>
<line x1="100" y1="38" x2="130" y2="38" stroke="#64748b" stroke-width="2"/><line x1="240" y1="38" x2="280" y2="38" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="38" x2="420" y2="38" stroke="#64748b" stroke-width="2"/><line x1="500" y1="38" x2="530" y2="38" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="56" x2="580" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="56" x2="320" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="185" y="80" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24</text>
<text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.0/30</text>
<text x="545" y="100" text-anchor="end" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="330" y="215" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.53 on 10.1.100.0/24</text>
</svg><p class="cap">R1 is the DHCP server for both LANs; R2 relays annex requests to R1; the DNS server answers names for nwk.lab.</p></div>

<div class="eg"><p><b>Worked example.</b> PC3 boots in the annex. Without DHCP an engineer would type 192.168.20.21, mask 255.255.255.0, gateway 192.168.20.1, DNS 10.1.100.53. With DHCP, PC3 broadcasts a request, R2 relays it to R1, R1 picks the next free address from the annex pool, and within a second PC3 shows <code>DDORA IP 192.168.20.21/24 GW 192.168.20.1</code>. Then the user types www.nwk.lab, PC3 asks 10.1.100.53, gets 10.1.100.80 back and opens the page.</p></div>

<h3>Where DHCP and DNS sit in the stack</h3>
<p>Both are <b>application-layer</b> protocols carried over UDP. DHCP uses <b>UDP 67</b> (server) and <b>UDP 68</b> (client). DNS uses <b>UDP 53</b> for normal queries and <b>TCP 53</b> for zone transfers and large answers. That matters for troubleshooting: an ACL or firewall that blocks UDP 53 breaks names while pings by IP keep working.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking DHCP is only "an IP address". A lease without a correct gateway lets you reach your own subnet only; a lease without a correct DNS server makes the internet look dead even though it works by IP. Always check all four: address/mask, gateway, DNS, lease.</p></div>
<div class="exam"><p><b>Exam trap.</b> The blueprint asks you to "explain the role of DHCP and DNS" and to "configure and verify DHCP client and relay". Expect questions that give you a symptom (169.254 address, works by IP only) and ask which service or option is at fault.</p></div>

<div class="scn"><h4>The college that ran out of sticky notes</h4><p>A small college IT team kept a spreadsheet of static addresses and a sticky note on every lab PC. When they added 300 laptops for a new batch, two students typed the same address on day one, the principal's PC lost its connection every time the other laptop woke up, and the team spent a week chasing duplicates. They moved all user devices to DHCP on R1, excluded .1–.20 for infrastructure, and kept static addresses only for routers, servers and printers.</p><p><b>Lesson:</b> static for infrastructure, DHCP for users, DNS for everything people type.</p></div>

<div class="iv"><p class="q">"Why do we use DHCP for end users but static addresses for servers?"</p><p>Strong answer: users are many and mobile, so automatic addressing avoids typing errors and duplicates and lets you change the gateway or DNS centrally. Servers, routers and printers need predictable addresses that other devices and DNS records point at, so they are static or DHCP reservations, and the static range is excluded from the pool. Mention the four things a lease gives: address and mask, gateway, DNS server and lease time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP hands a host its address, mask, gateway, DNS server and lease time automatically.</li>
<li>DNS translates names people type into the IP addresses devices use.</li>
<li>DHCP runs on UDP 67/68; DNS on UDP 53 (TCP 53 for zone transfers and large answers).</li>
<li>Infrastructure stays static and excluded from the pool; user devices use DHCP.</li>
<li>Our lab: R1 serves 192.168.10.0/24 and 192.168.20.0/24, R2 relays, DNS is 10.1.100.53, domain nwk.lab.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki host ko address automatically kaise milta hai, message by message; Cisco router ko kai subnets ke liye DHCP server configure kar paoge; remote router se <code>ip helper-address</code> ke through DHCP requests relay karwa paoge; router interface ko DHCP client bana paoge; Windows, Linux aur macOS par leases verify kar paoge; samjha paoge ki DNS names ko addresses mein kaise badalta hai; IOS DNS client configure kar paoge; aur duniya ke do sabse common help-desk tickets troubleshoot kar paoge: <b>"mera network nahi chal raha"</b> aur <b>"IP se chalta hai, naam se nahi"</b>.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addressing aur subnet masks (IPv4 module), IOS CLI aur uske modes (IOS module), aur yeh idea ki routers subnets ko jodte hain jabki switches ek subnet ke andar forward karte hain, inke saath comfortable hona chahiye. DHCP relay aapne inter-VLAN routing module mein thoda dekha tha aur DHCP snooping Layer 2 security mein; yahan hum protocols mein gehrai se jaayenge. NAT, NTP, SNMP aur syslog is domain ke agle modules mein aate hain.</p>

<h3>Analogy: hotel reception aur phone directory</h3>
<p>Socho ek guest hotel mein aata hai. Woh apna room number khud nahi chunta; reception par jaa kar kehta hai "mujhe room chahiye". Reception check karta hai kaunse rooms free hain, guest ko room 214 ka key card deta hai, batata hai lift kahan hai, Wi-Fi ka naam kya hai aur checkout time kya hai. Stay khatam hone par room wapas pool mein chala jaata hai agle guest ke liye.</p>
<p><b>DHCP (Dynamic Host Configuration Protocol)</b> wahi reception desk hai. Naya laptop network join karta hai aur use kuch nahi pata, apna IP address bhi nahi. Woh chillata hai "mujhe address chahiye", aur DHCP server jawab deta hai: <b>IP address aur mask</b> (room number), <b>default gateway</b> (floor se bahar jaane ki lift), <b>DNS server</b> (cheezein kahan dhoondhni hain) aur <b>lease time</b> (checkout time).</p>
<p>Ab guest "Priya" naam ki dost ko call karna chahta hai. Kisi ko phone numbers yaad nahi rehte, isliye woh directory dekhta hai. <b>DNS (Domain Name System)</b> network ki directory hai: log <code>www.nwk.lab</code> type karte hain, aur DNS jawab deta hai address <code>10.1.100.80</code>, jo computers ko asal mein chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DHCP address deta hai, DNS naam lookup deta hai">
<rect x="10" y="80" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="106" text-anchor="middle" class="svg-ink" font-size="14">Naya laptop</text><text x="70" y="126" text-anchor="middle" class="svg-muted" font-size="12">abhi IP nahi</text>
<rect x="250" y="10" width="160" height="60" rx="10" fill="#bbf7d0"/><text x="330" y="36" text-anchor="middle" class="svg-ink" font-size="14">DHCP server</text><text x="330" y="56" text-anchor="middle" class="svg-muted" font-size="12">hamare lab mein R1</text>
<rect x="250" y="150" width="160" height="60" rx="10" fill="#ddd6fe"/><text x="330" y="176" text-anchor="middle" class="svg-ink" font-size="14">DNS server</text><text x="330" y="196" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.53</text>
<rect x="500" y="80" width="130" height="60" rx="10" fill="#fde68a"/><text x="565" y="106" text-anchor="middle" class="svg-ink" font-size="14">Web server</text><text x="565" y="126" text-anchor="middle" class="svg-muted" font-size="12">www.nwk.lab</text>
<line x1="130" y1="95" x2="250" y2="45" stroke="#64748b" stroke-width="2"/><text x="180" y="58" class="svg-accent" font-size="12">1. address?</text>
<line x1="130" y1="125" x2="250" y2="180" stroke="#64748b" stroke-width="2"/><text x="150" y="175" class="svg-accent" font-size="12">2. naam se IP?</text>
<line x1="130" y1="110" x2="500" y2="110" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><text x="420" y="102" class="svg-accent" font-size="12">3. connect</text>
</svg><p class="cap">Pehle DHCP host ko uski pehchaan deta hai, phir DNS batata hai kahan jaana hai, aur tabhi asli baatcheet shuru ho sakti hai.</p></div>

<h3>Addresses haath se type kyun na karein?</h3>
<p>Kar sakte ho, aur routers, switches, servers aur printers ke liye aam taur par karna bhi chahiye: infrastructure ko aise addresses chahiye jo kabhi na badlein. Lekin users ke liye yeh jaldi toot jaata hai:</p>
<ul>
<li><b>Scale.</b> 2,000 laptops aur phones wale college mein engineer har device tak chal kar nahi jaa sakta.</li>
<li><b>Mobility.</b> Phone campus Wi-Fi se annex mein jaata hai aur har baar alag subnet chahiye.</li>
<li><b>Galtiyan.</b> Ek type kiya hua duplicate address do devices ko network se gira deta hai; ek galat gateway user ko uske subnet mein atka deta hai.</li>
<li><b>Change.</b> Agar DNS server shift hota hai, DHCP har client ko uske agle renewal par update kar deta hai. Static clients mein sabko chhoona padta.</li>
</ul>
<p>DNS ek alag problem solve karta hai: insaan naam yaad rakhte hain, aur servers ke addresses badalte hain. Agar web server 10.1.100.80 se 10.1.100.81 par jaata hai, aap ek DNS record badalte ho aur har user wahi naam type karta rehta hai.</p>

<h3>Lab network jo aap poore module mein use karoge</h3>
<p>Har chapter isi topology ko refer karta hai, jo module ke labs ki bhi topology hai. College campus LAN (192.168.10.0/24) router <b>R1</b> ke peeche switch <b>SW-CAMPUS</b> ke through hai, PC1 aur PC2 ke saath. Annex LAN (192.168.20.0/24) <b>R2</b> ke peeche <b>SW-ANNEX</b> ke through hai, PC3 aur PC4 ke saath. R1 aur R2 10.1.12.0/30 se jude hain (R1 = .1, R2 = .2). R1 ka Gi0/2 server subnet 10.1.100.0/24 se juda hai, jahan DNS server 10.1.100.53 par hai. Campus ka domain name <code>nwk.lab</code> hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab topology">
<rect x="10" y="20" width="90" height="36" rx="8" fill="#bae6fd"/><text x="55" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1, PC2</text>
<rect x="130" y="20" width="110" height="36" rx="8" fill="#e2e8f0"/><text x="185" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW-CAMPUS</text>
<rect x="280" y="20" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="420" y="20" width="80" height="36" rx="8" fill="#bbf7d0"/><text x="460" y="43" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="530" y="20" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="580" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW-ANNEX</text>
<rect x="530" y="120" width="100" height="36" rx="8" fill="#bae6fd"/><text x="580" y="143" text-anchor="middle" class="svg-ink" font-size="13">PC3, PC4</text>
<rect x="260" y="160" width="120" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="183" text-anchor="middle" class="svg-ink" font-size="13">DNS server</text>
<line x1="100" y1="38" x2="130" y2="38" stroke="#64748b" stroke-width="2"/><line x1="240" y1="38" x2="280" y2="38" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="38" x2="420" y2="38" stroke="#64748b" stroke-width="2"/><line x1="500" y1="38" x2="530" y2="38" stroke="#64748b" stroke-width="2"/>
<line x1="580" y1="56" x2="580" y2="120" stroke="#64748b" stroke-width="2"/><line x1="320" y1="56" x2="320" y2="160" stroke="#64748b" stroke-width="2"/>
<text x="185" y="80" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.0/24</text>
<text x="390" y="80" text-anchor="middle" class="svg-muted" font-size="12">10.1.12.0/30</text>
<text x="545" y="100" text-anchor="end" class="svg-muted" font-size="12">192.168.20.0/24</text>
<text x="330" y="215" text-anchor="middle" class="svg-muted" font-size="12">10.1.100.53, 10.1.100.0/24 par</text>
</svg><p class="cap">R1 dono LANs ka DHCP server hai; R2 annex ki requests R1 ko relay karta hai; DNS server nwk.lab ke names ka jawab deta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> PC3 annex mein boot hota hai. DHCP ke bina engineer type karta 192.168.20.21, mask 255.255.255.0, gateway 192.168.20.1, DNS 10.1.100.53. DHCP ke saath, PC3 request broadcast karta hai, R2 use R1 ko relay karta hai, R1 annex pool se agla free address chunta hai, aur ek second mein PC3 dikhata hai <code>DDORA IP 192.168.20.21/24 GW 192.168.20.1</code>. Phir user www.nwk.lab type karta hai, PC3 10.1.100.53 se poochta hai, 10.1.100.80 wapas milta hai aur page khul jaata hai.</p></div>

<h3>DHCP aur DNS stack mein kahan baithte hain</h3>
<p>Dono <b>application-layer</b> protocols hain jo UDP par chalte hain. DHCP <b>UDP 67</b> (server) aur <b>UDP 68</b> (client) use karta hai. DNS normal queries ke liye <b>UDP 53</b> aur zone transfers aur bade answers ke liye <b>TCP 53</b> use karta hai. Troubleshooting mein yeh matter karta hai: jo ACL ya firewall UDP 53 block karta hai woh names tod deta hai jabki IP se ping chalta rehta hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki DHCP sirf "ek IP address" hai. Sahi gateway ke bina lease sirf aapke apne subnet tak pahunchne deti hai; sahi DNS server ke bina lease internet ko mara hua dikhati hai jabki IP se sab chalta hai. Hamesha chaaron check karo: address/mask, gateway, DNS, lease.</p></div>
<div class="exam"><p><b>Exam trap.</b> Blueprint aapse "DHCP aur DNS ka role explain" karne aur "DHCP client aur relay configure aur verify" karne ko kehta hai. Aise questions expect karo jo ek symptom dete hain (169.254 address, sirf IP se chalta hai) aur poochte hain kaunsi service ya option galat hai.</p></div>

<div class="scn"><h4>Woh college jiske sticky notes khatam ho gaye</h4><p>Ek chhote college ki IT team static addresses ki spreadsheet rakhti thi aur har lab PC par ek sticky note. Jab unhone naye batch ke liye 300 laptops jode, pehle hi din do students ne same address type kar diya, principal ka PC har baar connection kho deta jab dusra laptop jaagta, aur team ne ek hafta duplicates dhoondhne mein lagaya. Unhone saare user devices R1 par DHCP par shift kiye, infrastructure ke liye .1–.20 exclude kiye, aur static addresses sirf routers, servers aur printers ke liye rakhe.</p><p><b>Seekh:</b> infrastructure ke liye static, users ke liye DHCP, aur jo kuch log type karte hain uske liye DNS.</p></div>

<div class="iv"><p class="q">"End users ke liye DHCP aur servers ke liye static addresses kyun use karte hain?"</p><p>Strong answer: users bahut hain aur move karte rehte hain, isliye automatic addressing typing errors aur duplicates se bachata hai aur gateway ya DNS centrally badalne deta hai. Servers, routers aur printers ko predictable addresses chahiye jinhe dusre devices aur DNS records point karte hain, isliye woh static ya DHCP reservations hote hain, aur static range pool se exclude hoti hai. Lease jo chaar cheezein deti hai unka zikr karo: address aur mask, gateway, DNS server aur lease time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DHCP host ko address, mask, gateway, DNS server aur lease time automatically deta hai.</li>
<li>DNS log jo names type karte hain unhe devices ke use hone wale IP addresses mein badalta hai.</li>
<li>DHCP UDP 67/68 par chalta hai; DNS UDP 53 par (zone transfers aur bade answers ke liye TCP 53).</li>
<li>Infrastructure static rehta hai aur pool se exclude hota hai; user devices DHCP use karte hain.</li>
<li>Hamara lab: R1 192.168.10.0/24 aur 192.168.20.0/24 serve karta hai, R2 relay karta hai, DNS 10.1.100.53 hai, domain nwk.lab.</li>
</ul></div>
`}};export{e as default};