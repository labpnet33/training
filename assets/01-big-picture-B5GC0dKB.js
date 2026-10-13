var e={id:`big-picture`,h:{en:`The big picture: defense in depth at the edge`,hi:`Big picture: edge par defense in depth`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to explain how an enterprise network defends itself in layers, name the Cisco building blocks of that defense (Talos, Secure Firewall, Secure Endpoint, Umbrella, email and web security, ISE), and above all configure, verify and troubleshoot <b>network access control</b> on a Catalyst switch: 802.1X with EAP, MAC Authentication Bypass (MAB), WebAuth, guest and critical VLANs, dynamic VLAN and downloadable ACL assignment, Change of Authorization (CoA), TrustSec Security Group Tags and MACsec encryption. This is the "network security design" part of the ENCOR 350-401 v1.2 security domain, plus a short look at wireless security features that the <b>encor-wireless</b> module covers in depth.</p>

<p><b>Prerequisites.</b> You should know VLANs, access and trunk ports, DHCP and basic ACLs (CCNA level), and the AAA and RADIUS basics from the <b>encor-device-security</b> module (method lists, <code>aaa new-model</code>, server groups). CCNA already showed you the three 802.1X roles in one chapter; here we go several levels deeper. You do not need any prior firewall or ISE experience.</p>

<h3>Start with an analogy: an airport, not a castle</h3>
<p>Old networks were built like a castle: one thick wall (the internet firewall) and total trust for anybody inside. That fails the moment a single laptop inside is infected, a contractor plugs into a meeting-room port, or an attacker steals a password. Every one of them is already "inside the wall".</p>
<p>A modern airport is a better model. Your ticket is checked at the door, your bag is scanned, your passport is checked at immigration, your boarding pass is scanned again at the gate, and cameras watch the whole time. Each check is imperfect on its own, but together they make an attack very hard. More importantly, <b>who you are decides where you may go</b>: crew can enter the airside corridors, passengers only their gate, cleaners only certain zones.</p>
<p>That is exactly the design you will build: <b>defense in depth</b> (many overlapping controls) plus <b>identity-based access</b> (the network decides what you can reach based on who and what you are, not on which port you plugged into).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layers of enterprise threat defense">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Threat intelligence (Talos) feeds every layer below</text>
<rect x="10" y="54" width="300" height="36" rx="8" fill="#fed7aa"/><text x="160" y="77" text-anchor="middle" class="svg-ink" font-size="13">Internet edge: NGFW, IPS</text>
<rect x="330" y="54" width="300" height="36" rx="8" fill="#fed7aa"/><text x="480" y="77" text-anchor="middle" class="svg-ink" font-size="13">DNS, web and email security</text>
<rect x="10" y="98" width="620" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Segmentation: VLANs, VRFs, TrustSec SGTs</text>
<rect x="10" y="142" width="620" height="36" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Access control: 802.1X, MAB, WebAuth with ISE</text>
<rect x="10" y="186" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="13">Endpoint: EDR, posture</text>
<rect x="330" y="186" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="209" text-anchor="middle" class="svg-ink" font-size="13">Wire: MACsec encryption</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Visibility everywhere: NetFlow analytics, logs, XDR</text>
</svg><p class="cap">No layer is perfect. An attack that slips past one layer should be caught by the next.</p></div>

<h3>The attack continuum: before, during, after</h3>
<p>Cisco describes security work in three phases, and the exam likes this vocabulary:</p>
<ul>
<li><b>Before</b> an attack: discover assets, enforce policy, harden and segment. Tools: ISE, 802.1X, TrustSec, firewall policy, patching.</li>
<li><b>During</b> an attack: detect and block. Tools: IPS, malware inspection, DNS blocking, URL filtering.</li>
<li><b>After</b> an attack: scope the damage, contain and remediate. Tools: retrospective malware alerts, endpoint isolation, flow analytics, and ISE quarantine through CoA.</li>
</ul>
<p>Notice that the "after" phase matters: no product blocks 100% of threats, so you must assume that something will get in and design for fast detection and containment.</p>

<h3>Why the access edge is so important</h3>
<p>Most attacks start at an endpoint: a phished laptop, an unmanaged camera, a visitor's device. The access switch port and the Wi-Fi SSID are the first places the network can say "who are you?". Without access control, anybody who reaches an RJ45 socket gets a DHCP lease and can scan the whole campus. With 802.1X and ISE, an unknown device lands in a guest VLAN with internet access only, a printer can reach only the print servers, and an employee lands in the employee VLAN with an employee tag that firewalls and switches can use for policy.</p>

<div class="eg"><p><b>Worked example.</b> A campus has 2,000 access ports. Before access control, the security team estimated that 140 ports were in public areas (meeting rooms, reception, training rooms). An audit found 23 unknown devices connected: personal routers, a smart TV and two unmanaged Raspberry Pis. After an 802.1X rollout in monitor mode, ISE logs showed every one of them within a day, with MAC address, switch and port. The team then moved to closed mode, and those 23 devices were placed in guest VLAN 50 automatically.</p></div>

<h3>The lab network you will use</h3>
<p>Two labs go with this module. Both use the same small topology: access switch <b>SW1</b>, RADIUS server <b>ISE</b> at 10.99.99.10 (management VLAN 99, shared key <code>NKsecret</code>), employee <b>PC1</b> (user alice), printer <b>PRN1</b> (no supplicant) and <b>GUEST1</b>, an unknown laptop. SW1 has VLAN 10 DEFAULT, 20 EMPLOYEES, 30 PRINTERS, 50 GUEST and 99 MGMT, with a DHCP pool for each. The first lab builds 802.1X with MAB fallback and dynamic VLANs; the second, "Nobody gets on the network", hands you three broken settings to find.</p>

<div class="warn"><p><b>Common mistake.</b> Treating security as one product decision ("we bought a next-generation firewall, we are safe"). An NGFW at the internet edge never sees traffic between two PCs on the same access switch. East-west traffic inside the campus needs access control and segmentation too.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR asks you to <i>describe</i> threat defense components (NGFW, endpoint security, Talos, TrustSec, MACsec) but to be able to <i>recognise and reason about</i> 802.1X, MAB and WebAuth behaviour and configuration. Know the product roles at concept level and the access-control mechanics in detail.</p></div>

<div class="scn"><h4>The meeting-room port</h4><p>A logistics company found unusual scanning traffic from an IP address in its data VLAN. The address belonged to nobody in the asset list. The switch MAC table led to a meeting-room port where a visiting "consultant" had left a small computer behind a TV. The network had a good perimeter firewall, but every access port was a static VLAN 10 port with no authentication. The team rolled out 802.1X with MAB for printers and a guest VLAN for everything unknown, starting in monitor mode to discover devices safely.</p><p><b>Lesson:</b> the perimeter is not where most attacks start. Control who can join the network at the access edge.</p></div>

<div class="iv"><p class="q">"What does defense in depth mean, and how would you apply it to a campus?"</p><p>Strong answer: multiple independent layers so a single failure does not expose the business. Give concrete layers: NGFW and IPS at the edge, DNS-layer security, web and email security, 802.1X/MAB with ISE at the access edge, segmentation with VLANs, VRFs or TrustSec SGTs, endpoint protection with EDR, MACsec on untrusted links, and visibility with NetFlow analytics. Mention the before/during/after continuum and that you design for detection and containment, not just prevention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defense in depth = several overlapping controls; identity decides access, not the physical port.</li>
<li>Before, during, after: prevent, detect and block, then scope and contain.</li>
<li>The access edge (switch port, SSID) is the first place the network can ask "who are you?".</li>
<li>ISE is the policy engine; switches and WLCs are enforcement points.</li>
<li>Labs: SW1, ISE 10.99.99.10 (key NKsecret), PC1/alice, PRN1 printer, GUEST1; VLANs 20, 30, 50.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap samjha paoge ki enterprise network layers mein apna defense kaise karta hai, us defense ke Cisco building blocks ke naam le paoge (Talos, Secure Firewall, Secure Endpoint, Umbrella, email aur web security, ISE), aur sabse zaroori, Catalyst switch par <b>network access control</b> configure, verify aur troubleshoot kar paoge: EAP ke saath 802.1X, MAC Authentication Bypass (MAB), WebAuth, guest aur critical VLANs, dynamic VLAN aur downloadable ACL assignment, Change of Authorization (CoA), TrustSec Security Group Tags aur MACsec encryption. Yeh ENCOR 350-401 v1.2 security domain ka "network security design" hissa hai, saath mein wireless security features par ek chhoti nazar jo <b>encor-wireless</b> module detail mein cover karta hai.</p>

<p><b>Prerequisites.</b> Aapko VLANs, access aur trunk ports, DHCP aur basic ACLs (CCNA level) aane chahiye, aur <b>encor-device-security</b> module ke AAA aur RADIUS basics (method lists, <code>aaa new-model</code>, server groups). CCNA ne ek chapter mein 802.1X ke teen roles dikhaye the; yahan hum kai level gehrai mein jaayenge. Pehle se firewall ya ISE ka koi experience nahi chahiye.</p>

<h3>Ek analogy se shuru karo: castle nahi, airport</h3>
<p>Purane networks castle ki tarah bane the: ek moti deewar (internet firewall) aur andar wale har insaan par poora bharosa. Yeh tab fail hota hai jab andar ka ek laptop infect ho jaaye, koi contractor meeting-room port mein plug kar de, ya attacker password chura le. In sab log pehle se hi "deewar ke andar" hain.</p>
<p>Modern airport behtar model hai. Gate par ticket check hota hai, bag scan hota hai, immigration par passport check hota hai, boarding gate par boarding pass phir se scan hota hai, aur cameras poore samay dekhte rehte hain. Har check akele mein perfect nahi hai, lekin sab milkar attack ko bahut mushkil bana dete hain. Aur zyada zaroori baat, <b>aap kaun ho yeh decide karta hai ki aap kahan ja sakte ho</b>: crew airside corridors mein ja sakta hai, passengers sirf apne gate tak, cleaners sirf kuch zones mein.</p>
<p>Aap bilkul yahi design banaoge: <b>defense in depth</b> (kai overlapping controls) plus <b>identity-based access</b> (network yeh decide karta hai ki aap kya reach kar sakte ho is basis par ki aap kaun aur kya ho, is par nahi ki aapne kaunse port mein plug kiya).</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Enterprise threat defense ki layers">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Threat intelligence (Talos) neeche ki har layer ko feed karta hai</text>
<rect x="10" y="54" width="300" height="36" rx="8" fill="#fed7aa"/><text x="160" y="77" text-anchor="middle" class="svg-ink" font-size="13">Internet edge: NGFW, IPS</text>
<rect x="330" y="54" width="300" height="36" rx="8" fill="#fed7aa"/><text x="480" y="77" text-anchor="middle" class="svg-ink" font-size="13">DNS, web aur email security</text>
<rect x="10" y="98" width="620" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">Segmentation: VLANs, VRFs, TrustSec SGTs</text>
<rect x="10" y="142" width="620" height="36" rx="8" fill="#bae6fd"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="13">Access control: ISE ke saath 802.1X, MAB, WebAuth</text>
<rect x="10" y="186" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="160" y="209" text-anchor="middle" class="svg-ink" font-size="13">Endpoint: EDR, posture</text>
<rect x="330" y="186" width="300" height="36" rx="8" fill="#bbf7d0"/><text x="480" y="209" text-anchor="middle" class="svg-ink" font-size="13">Wire: MACsec encryption</text>
<text x="320" y="248" text-anchor="middle" class="svg-muted" font-size="12">Har jagah visibility: NetFlow analytics, logs, XDR</text>
</svg><p class="cap">Koi layer perfect nahi hai. Jo attack ek layer se nikal jaaye, use agli layer pakde.</p></div>

<h3>Attack continuum: before, during, after</h3>
<p>Cisco security kaam ko teen phases mein describe karta hai, aur exam ko yeh vocabulary pasand hai:</p>
<ul>
<li>Attack se <b>before</b> (pehle): assets discover karo, policy enforce karo, harden aur segment karo. Tools: ISE, 802.1X, TrustSec, firewall policy, patching.</li>
<li>Attack ke <b>during</b> (dauraan): detect aur block karo. Tools: IPS, malware inspection, DNS blocking, URL filtering.</li>
<li>Attack ke <b>after</b> (baad): damage ka scope nikalo, contain aur remediate karo. Tools: retrospective malware alerts, endpoint isolation, flow analytics, aur CoA ke through ISE quarantine.</li>
</ul>
<p>Dhyan do ki "after" phase matter karta hai: koi product 100% threats block nahi karta, isliye maan ke chalo ki kuch andar aayega aur fast detection aur containment ke liye design karo.</p>

<h3>Access edge itna important kyun hai</h3>
<p>Zyada tar attacks ek endpoint se shuru hote hain: phishing wala laptop, unmanaged camera, visitor ka device. Access switch port aur Wi-Fi SSID pehli jagah hain jahan network pooch sakta hai "tum kaun ho?". Access control ke bina, jo bhi RJ45 socket tak pahunche use DHCP lease mil jaata hai aur woh poore campus ko scan kar sakta hai. 802.1X aur ISE ke saath, unknown device guest VLAN mein sirf internet access ke saath jaata hai, printer sirf print servers tak pahunch sakta hai, aur employee employee VLAN mein employee tag ke saath jaata hai jise firewalls aur switches policy ke liye use kar sakte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus mein 2,000 access ports hain. Access control se pehle security team ka andaaza tha ki 140 ports public areas mein hain (meeting rooms, reception, training rooms). Audit mein 23 unknown devices connected mile: personal routers, ek smart TV aur do unmanaged Raspberry Pis. Monitor mode mein 802.1X rollout ke baad, ISE logs ne ek din ke andar har ek ko MAC address, switch aur port ke saath dikha diya. Phir team closed mode mein gayi, aur woh 23 devices automatically guest VLAN 50 mein chale gaye.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Is module ke saath do labs hain. Dono ek hi chhoti topology use karti hain: access switch <b>SW1</b>, RADIUS server <b>ISE</b> 10.99.99.10 par (management VLAN 99, shared key <code>NKsecret</code>), employee <b>PC1</b> (user alice), printer <b>PRN1</b> (bina supplicant) aur <b>GUEST1</b>, ek unknown laptop. SW1 par VLAN 10 DEFAULT, 20 EMPLOYEES, 30 PRINTERS, 50 GUEST aur 99 MGMT hain, har ek ka DHCP pool ke saath. Pehli lab MAB fallback aur dynamic VLANs ke saath 802.1X banati hai; doosri, "Nobody gets on the network", aapko dhoondhne ke liye teen tooti settings deti hai.</p>

<div class="warn"><p><b>Common galti.</b> Security ko ek product decision samajhna ("humne next-generation firewall khareed liya, hum safe hain"). Internet edge par NGFW kabhi bhi same access switch par do PCs ke beech ka traffic nahi dekhta. Campus ke andar east-west traffic ko bhi access control aur segmentation chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR aapse threat defense components (NGFW, endpoint security, Talos, TrustSec, MACsec) ko <i>describe</i> karne ko kehta hai, lekin 802.1X, MAB aur WebAuth ke behaviour aur configuration ko <i>pehchanna aur us par reason karna</i> aana chahiye. Product roles concept level par jaano aur access-control mechanics detail mein.</p></div>

<div class="scn"><h4>Meeting-room ka port</h4><p>Ek logistics company ne apne data VLAN ke ek IP address se ajeeb scanning traffic dekha. Woh address asset list mein kisi ka nahi tha. Switch MAC table ek meeting-room port tak le gayi jahan ek visiting "consultant" TV ke peeche ek chhota computer chhod gaya tha. Network ka perimeter firewall achha tha, lekin har access port static VLAN 10 port tha bina authentication ke. Team ne printers ke liye MAB aur har unknown cheez ke liye guest VLAN ke saath 802.1X roll out kiya, devices ko safely discover karne ke liye monitor mode se shuru karke.</p><p><b>Seekh:</b> zyada tar attacks perimeter se shuru nahi hote. Access edge par control karo ki network kaun join kar sakta hai.</p></div>

<div class="iv"><p class="q">"Defense in depth ka matlab kya hai, aur aap ise campus par kaise apply karoge?"</p><p>Strong answer: kai independent layers taaki ek failure business ko expose na kare. Concrete layers batao: edge par NGFW aur IPS, DNS-layer security, web aur email security, access edge par ISE ke saath 802.1X/MAB, VLANs, VRFs ya TrustSec SGTs se segmentation, EDR ke saath endpoint protection, untrusted links par MACsec, aur NetFlow analytics se visibility. Before/during/after continuum mention karo aur yeh ki aap sirf prevention nahi, detection aur containment ke liye bhi design karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Defense in depth = kai overlapping controls; access identity decide karti hai, physical port nahi.</li>
<li>Before, during, after: roko, detect aur block karo, phir scope nikalo aur contain karo.</li>
<li>Access edge (switch port, SSID) pehli jagah hai jahan network pooch sakta hai "tum kaun ho?".</li>
<li>ISE policy engine hai; switches aur WLCs enforcement points hain.</li>
<li>Labs: SW1, ISE 10.99.99.10 (key NKsecret), PC1/alice, PRN1 printer, GUEST1; VLANs 20, 30, 50.</li>
</ul></div>
`}};export{e as default};