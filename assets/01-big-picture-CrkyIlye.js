var e={id:`big-picture`,h:{en:`IPv6 first-hop security: the big picture`,hi:`IPv6 first-hop security: poori tasveer`},body:{en:`
<p>Think of a big housing society. Every morning a notice appears on the lobby board: "Water supply today from Tank B, garbage collection at gate 2." Residents simply follow the board. Nobody checks who pinned the notice. If a prankster pins a fake notice, half the building walks to the wrong gate. The fix is not to make every resident a detective; the fix is a <b>guard at the lobby</b> who knows which people are allowed to pin notices, and who remembers which flat belongs to which family.</p>
<p>An IPv6 access network works the same way. Hosts believe whatever they hear on the local link: which router to use, which prefix to build an address from, which MAC owns which IPv6 address. <b>IPv6 First-Hop Security (FHS)</b> is the lobby guard. It is a set of features on the access switch that checks these messages on the very port where they enter, before they reach the other hosts.</p>

<h3>What you will learn</h3>
<ul>
<li>Why IPv6 hosts trust the local link, and which Neighbor Discovery (NDP) and DHCPv6 messages an attacker or a careless user can abuse.</li>
<li>The threats: rogue Router Advertisements, rogue DHCPv6 servers, neighbor spoofing, address theft and DAD denial of service, explained from the defender's side.</li>
<li>SEND (Secure Neighbor Discovery) as the protocol-level idea, and why the industry chose switch-based protection instead.</li>
<li>The Cisco <b>SISF</b> framework (Switch Integrated Security Features) and its <b>binding table</b>, configured with <code>device-tracking</code> or the older <code>ipv6 snooping</code> commands.</li>
<li><b>RA guard</b>, <b>DHCPv6 guard</b>, <b>ND inspection</b>, <b>IPv6 source guard</b>, <b>prefix guard</b> and the <b>destination guard</b> concept.</li>
<li>How to roll FHS out safely, how to verify it, and a troubleshooting workflow that walks through the three labs of this module.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already know IPv6 addressing, link-local addresses, SLAAC and DHCPv6 basics from the CCNA IPv6 module, and the IPv4 access-layer defences (DHCP snooping, Dynamic ARP Inspection, IP Source Guard) from the CCNA Layer 2 security module. The previous ENARSI module covered ACLs, uRPF and CoPP; here we move to the switch port where hosts connect. Chapter 2 gives a short NDP recap, so do not worry if the details are rusty.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Where FHS sits">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">R1 (real router)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">RA, DHCPv6</text>
<rect x="230" y="120" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="14">Access switch</text><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">FHS checks here</text>
<line x1="320" y1="60" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><text x="330" y="94" class="svg-muted" font-size="12">trusted uplink</text>
<rect x="40" y="230" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="256" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="255" y="230" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="256" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="470" y="230" width="130" height="44" rx="8" fill="#fed7aa"/><text x="535" y="250" text-anchor="middle" class="svg-ink" font-size="13">Rogue box</text><text x="535" y="266" text-anchor="middle" class="svg-muted" font-size="12">fake RA / DHCPv6</text>
<line x1="280" y1="170" x2="105" y2="230" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="230" stroke="#64748b" stroke-width="2"/><line x1="360" y1="170" x2="535" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="470" y="200" class="svg-accent" font-size="12">dropped at ingress</text>
</svg><p class="cap">FHS runs on the access switch. Messages are judged on the port where they enter, so a rogue box never reaches its neighbours.</p></div>

<h3>Why the first hop is special</h3>
<p>The <b>first hop</b> is the local link between a host and its default router. In IPv4 we protect it with DHCP snooping, DAI and IP Source Guard. IPv6 needs the same protection, but the protocols are different:</p>
<ul>
<li>There is no ARP. Address resolution uses ICMPv6 <b>Neighbor Solicitation</b> and <b>Neighbor Advertisement</b>.</li>
<li>Hosts learn their default gateway and prefix from ICMPv6 <b>Router Advertisements</b>, not from DHCP. Any device can send an RA.</li>
<li>Hosts can build their own addresses (SLAAC), so there may be no DHCP lease at all to build a trusted table from.</li>
<li>One host often has many addresses: a link-local, one or more global addresses, and temporary privacy addresses that change over time.</li>
</ul>
<p>None of these messages are authenticated by default. The good news: the hop limit of every NDP message must be 255, so a host only accepts NDP from its own link. The attacker must therefore be <b>on the link</b>, which means he is plugged into one of <b>our</b> switch ports. That is exactly where FHS stands.</p>

<h3>The toolbox at a glance</h3>
<table class="cmp"><tr><th>Threat</th><th>IPv6 feature</th><th>IPv4 relative</th></tr>
<tr><td>Rogue router (fake RA)</td><td>RA guard</td><td>none (DHCP gives the gateway)</td></tr>
<tr><td>Rogue DHCP server</td><td>DHCPv6 guard</td><td>DHCP snooping</td></tr>
<tr><td>Who owns which address</td><td>Binding table (device-tracking / IPv6 snooping)</td><td>DHCP snooping binding table</td></tr>
<tr><td>Neighbor spoofing</td><td>ND inspection (security-level inspect)</td><td>Dynamic ARP Inspection</td></tr>
<tr><td>Address theft in data traffic</td><td>IPv6 source guard, prefix guard</td><td>IP Source Guard</td></tr>
<tr><td>Scanning that fills the router's neighbor cache</td><td>Destination guard</td><td>none</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> VLAN 10 has 40 users on SW1 ports Gi0/1 to Gi0/40. R1 at 2001:db8:a10::1 advertises 2001:db8:a10::/64. A student plugs in a lab router on Gi0/3 that advertises 2001:db8:dead:10::/64. Without FHS, every host that hears both RAs builds a second address and may pick the lab router as gateway, so traffic leaving the LAN dies. With one RA guard policy (<code>device-role host</code>) on Gi0/1 to Gi0/40, the lab router's RAs are dropped at Gi0/3 and only R1's RAs reach the hosts. This is exactly lab 1 of this module.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming "we do not use IPv6, so this does not apply". Modern operating systems enable IPv6 by default and will happily accept an RA. A network that "does not run IPv6" is often the easiest target, because nobody is watching the IPv6 side.</p></div>

<div class="exam"><p><b>Exam trap.</b> FHS features are <b>Layer 2 switch</b> features applied on access ports or VLANs. They do not run on the router's routed interface to protect hosts. Questions may offer "configure RA guard on R1 G0/0" as a distractor.</p></div>

<div class="scn"><h4>The printer that became a router</h4><p>A branch reported that half of the laptops lost Internet access every morning around 09:30. IPv4 was fine. The engineer ran <code>ipconfig</code> on a laptop and saw two IPv6 default gateways. <code>show mac address-table</code> on the access switch showed the second gateway's MAC on the port of a new multifunction printer whose firmware shipped with a router mode that sent RAs. The team attached an RA guard host policy to all user ports and a router policy to the uplink.</p><p><b>Lesson:</b> most rogue RAs are accidents, not attacks. FHS protects you from both.</p></div>

<div class="iv"><p class="q">"What is IPv6 First-Hop Security and why do we need it?"</p><p>Strong answer: NDP and DHCPv6 have no built-in authentication, so any device on the link can advertise itself as a router, answer as a DHCPv6 server or claim another host's address. FHS is a set of switch features (RA guard, DHCPv6 guard, the SISF binding table, ND inspection, source and destination guard) that validate these messages on the ingress access port. Mention that they are the IPv6 counterparts of DHCP snooping, DAI and IP Source Guard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 hosts trust NDP and DHCPv6 messages on their link; none are authenticated by default.</li>
<li>NDP requires hop limit 255, so every first-hop attacker is on the local link, behind a switch port.</li>
<li>FHS is the lobby guard: it checks messages on the ingress access port.</li>
<li>The toolbox: RA guard, DHCPv6 guard, binding table, ND inspection, source/prefix guard, destination guard.</li>
<li>Most rogue RAs are accidental; protection matters even in networks that "do not use IPv6".</li>
</ul></div>
`,hi:`
<p>Ek badi housing society socho. Har subah lobby board par ek notice lagta hai: "Aaj paani Tank B se, kachra gate 2 par collect hoga." Residents bas board follow karte hain. Koi check nahi karta ki notice kisne lagaya. Agar koi shararti fake notice laga de, to aadhi building galat gate par chali jaati hai. Iska fix yeh nahi ki har resident detective ban jaaye; fix hai <b>lobby par ek guard</b> jo jaanta hai ki kaun log notice laga sakte hain, aur jise yaad hai ki kaunsa flat kis family ka hai.</p>
<p>IPv6 access network bhi aise hi kaam karta hai. Hosts local link par jo sunte hain us par bharosa kar lete hain: kaunsa router use karna hai, kis prefix se address banana hai, kaunsa MAC kis IPv6 address ka maalik hai. <b>IPv6 First-Hop Security (FHS)</b> yahi lobby guard hai. Yeh access switch par features ka set hai jo in messages ko usi port par check karta hai jahan se woh andar aate hain, doosre hosts tak pahunchne se pehle.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li>IPv6 hosts local link par bharosa kyun karte hain, aur kaunse Neighbor Discovery (NDP) aur DHCPv6 messages ka attacker ya laparwah user galat use kar sakta hai.</li>
<li>Threats: rogue Router Advertisements, rogue DHCPv6 servers, neighbor spoofing, address theft aur DAD denial of service, defender ki nazar se samjhaaye gaye.</li>
<li>SEND (Secure Neighbor Discovery) protocol-level idea ke roop mein, aur industry ne switch-based protection kyun chuna.</li>
<li>Cisco ka <b>SISF</b> framework (Switch Integrated Security Features) aur uski <b>binding table</b>, jo <code>device-tracking</code> ya purane <code>ipv6 snooping</code> commands se configure hoti hai.</li>
<li><b>RA guard</b>, <b>DHCPv6 guard</b>, <b>ND inspection</b>, <b>IPv6 source guard</b>, <b>prefix guard</b> aur <b>destination guard</b> ka concept.</li>
<li>FHS ko safely roll out kaise karein, verify kaise karein, aur ek troubleshooting workflow jo is module ki teeno labs se guzarta hai.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko CCNA IPv6 module se IPv6 addressing, link-local addresses, SLAAC aur DHCPv6 basics, aur CCNA Layer 2 security module se IPv4 access-layer defences (DHCP snooping, Dynamic ARP Inspection, IP Source Guard) pehle se aane chahiye. Pichhle ENARSI module ne ACLs, uRPF aur CoPP cover kiye; yahan hum us switch port par aate hain jahan hosts judte hain. Chapter 2 ek chhota NDP recap deta hai, isliye details bhool gaye ho to tension mat lo.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="FHS kahan baithta hai">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">R1 (asli router)</text><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">RA, DHCPv6</text>
<rect x="230" y="120" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="14">Access switch</text><text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">FHS yahan check karta hai</text>
<line x1="320" y1="60" x2="320" y2="120" stroke="#64748b" stroke-width="2"/><text x="330" y="94" class="svg-muted" font-size="12">trusted uplink</text>
<rect x="40" y="230" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="105" y="256" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="255" y="230" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="256" text-anchor="middle" class="svg-ink" font-size="13">PC2</text>
<rect x="470" y="230" width="130" height="44" rx="8" fill="#fed7aa"/><text x="535" y="250" text-anchor="middle" class="svg-ink" font-size="13">Rogue box</text><text x="535" y="266" text-anchor="middle" class="svg-muted" font-size="12">fake RA / DHCPv6</text>
<line x1="280" y1="170" x2="105" y2="230" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="230" stroke="#64748b" stroke-width="2"/><line x1="360" y1="170" x2="535" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="470" y="200" class="svg-accent" font-size="12">ingress par drop</text>
</svg><p class="cap">FHS access switch par chalta hai. Messages usi port par judge hote hain jahan se woh ghuste hain, isliye rogue box kabhi apne padosiyon tak nahi pahunchta.</p></div>

<h3>First hop khaas kyun hai</h3>
<p><b>First hop</b> host aur uske default router ke beech ka local link hai. IPv4 mein hum ise DHCP snooping, DAI aur IP Source Guard se bachate hain. IPv6 ko bhi wahi protection chahiye, par protocols alag hain:</p>
<ul>
<li>ARP nahi hai. Address resolution ICMPv6 <b>Neighbor Solicitation</b> aur <b>Neighbor Advertisement</b> se hota hai.</li>
<li>Hosts apna default gateway aur prefix ICMPv6 <b>Router Advertisements</b> se seekhte hain, DHCP se nahi. Koi bhi device RA bhej sakta hai.</li>
<li>Hosts apne address khud bana sakte hain (SLAAC), isliye trusted table banane ke liye shayad koi DHCP lease hi na ho.</li>
<li>Ek host ke aksar kai addresses hote hain: ek link-local, ek ya zyada global addresses, aur temporary privacy addresses jo samay ke saath badalte hain.</li>
</ul>
<p>Default mein in messages mein se koi bhi authenticated nahi hai. Achhi khabar: har NDP message ka hop limit 255 hona chahiye, isliye host sirf apne link se NDP accept karta hai. Isliye attacker ko <b>link par</b> hona padega, matlab woh <b>hamare</b> kisi switch port mein laga hai. FHS theek wahin khada hai.</p>

<h3>Toolbox ek nazar mein</h3>
<table class="cmp"><tr><th>Threat</th><th>IPv6 feature</th><th>IPv4 rishtedaar</th></tr>
<tr><td>Rogue router (fake RA)</td><td>RA guard</td><td>koi nahi (gateway DHCP deta hai)</td></tr>
<tr><td>Rogue DHCP server</td><td>DHCPv6 guard</td><td>DHCP snooping</td></tr>
<tr><td>Kaun kis address ka maalik</td><td>Binding table (device-tracking / IPv6 snooping)</td><td>DHCP snooping binding table</td></tr>
<tr><td>Neighbor spoofing</td><td>ND inspection (security-level inspect)</td><td>Dynamic ARP Inspection</td></tr>
<tr><td>Data traffic mein address theft</td><td>IPv6 source guard, prefix guard</td><td>IP Source Guard</td></tr>
<tr><td>Scanning jo router ka neighbor cache bhar de</td><td>Destination guard</td><td>koi nahi</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> VLAN 10 mein SW1 ke ports Gi0/1 se Gi0/40 par 40 users hain. R1 2001:db8:a10::1 par 2001:db8:a10::/64 advertise karta hai. Ek student Gi0/3 par lab router laga deta hai jo 2001:db8:dead:10::/64 advertise karta hai. FHS ke bina, jo host dono RAs sunta hai woh doosra address bana leta hai aur lab router ko gateway chun sakta hai, isliye LAN se bahar jaane wala traffic mar jaata hai. Gi0/1 se Gi0/40 par ek RA guard policy (<code>device-role host</code>) se lab router ke RAs Gi0/3 par hi drop ho jaate hain aur hosts tak sirf R1 ke RAs pahunchte hain. Yahi is module ki lab 1 hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki "hum IPv6 use nahi karte, to yeh hum par laagu nahi". Modern operating systems default mein IPv6 on rakhte hain aur khushi se RA accept kar lete hain. Jo network "IPv6 nahi chalata" woh aksar sabse aasaan target hota hai, kyunki IPv6 side par koi nazar nahi rakh raha.</p></div>

<div class="exam"><p><b>Exam trap.</b> FHS features <b>Layer 2 switch</b> features hain jo access ports ya VLANs par lagte hain. Yeh hosts ko bachane ke liye router ke routed interface par nahi chalte. Questions "R1 G0/0 par RA guard configure karo" ko distractor ki tarah de sakte hain.</p></div>

<div class="scn"><h4>Printer jo router ban gaya</h4><p>Ek branch ne report kiya ki har subah lagbhag 09:30 baje aadhe laptops ka Internet chala jaata hai. IPv4 theek tha. Engineer ne ek laptop par <code>ipconfig</code> chalaya aur do IPv6 default gateways dekhe. Access switch par <code>show mac address-table</code> ne doosre gateway ka MAC ek naye multifunction printer ke port par dikhaya, jiske firmware mein ek router mode tha jo RAs bhejta tha. Team ne saare user ports par RA guard host policy aur uplink par router policy attach ki.</p><p><b>Seekh:</b> zyada tar rogue RAs accident hote hain, attack nahi. FHS dono se bachata hai.</p></div>

<div class="iv"><p class="q">"IPv6 First-Hop Security kya hai aur hume iski zaroorat kyun hai?"</p><p>Strong answer: NDP aur DHCPv6 mein koi built-in authentication nahi hai, isliye link par koi bhi device khud ko router advertise kar sakta hai, DHCPv6 server ban kar jawab de sakta hai ya kisi aur host ka address claim kar sakta hai. FHS switch features ka set hai (RA guard, DHCPv6 guard, SISF binding table, ND inspection, source aur destination guard) jo in messages ko ingress access port par validate karta hai. Batao ki yeh DHCP snooping, DAI aur IP Source Guard ke IPv6 counterparts hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 hosts apne link ke NDP aur DHCPv6 messages par bharosa karte hain; default mein koi authenticated nahi.</li>
<li>NDP ko hop limit 255 chahiye, isliye har first-hop attacker local link par, kisi switch port ke peeche hota hai.</li>
<li>FHS lobby guard hai: yeh ingress access port par messages check karta hai.</li>
<li>Toolbox: RA guard, DHCPv6 guard, binding table, ND inspection, source/prefix guard, destination guard.</li>
<li>Zyada tar rogue RAs accidental hote hain; "IPv6 use nahi karte" wale networks mein bhi protection zaroori hai.</li>
</ul></div>
`}};export{e as default};