var e={id:`osi`,h:{en:`The OSI model, layer by layer`,hi:`OSI model, layer by layer`},body:{en:`
<p>Think of an office building with seven floors. A letter written on the top floor travels down floor by floor; each floor adds its own label or folder, and at the ground floor it leaves by van. In the other building the letter goes up floor by floor, and each floor removes only the label its twin floor added. The floors never skip each other, and floor 4 in one building only "talks" to floor 4 in the other. That is the <b>OSI model</b> (Open Systems Interconnection), published by ISO in 1984 as a seven-layer reference for how networks communicate.</p>

<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-en.svg" width="880" height="740" loading="lazy" decoding="async" alt="Seven OSI layers with sending and receiving directions, TCP encapsulation and an example network path." /><figcaption>A message moves down the stack when sent and up when received. TCP uses a segment; UDP uses a datagram. <a href="/images/config/osi-model-v1-en.svg" target="_blank" rel="noopener noreferrer">View full-size diagram</a></figcaption></figure>

<h3>The seven layers, from the bottom</h3>
<dl class="terms">
<dt>Layer 1, Physical</dt><dd>Moves <b>bits</b> as signals: voltage on copper, light in fibre, radio waves in Wi-Fi. Defines connectors (RJ-45, LC), cable types, pin-outs, speeds and signal encoding. Devices that work only here: <b>hubs</b>, repeaters, media converters, the cable itself. A hub has no idea what a MAC address is; it repeats every bit out of every port.</dd>
<dt>Layer 2, Data link</dt><dd>Delivers <b>frames</b> between devices on the <b>same link or LAN</b>. Uses <b>MAC addresses</b> (48-bit physical addresses), detects corrupted frames with the <b>FCS</b>, and controls access to the medium. Ethernet (IEEE 802.3) and Wi-Fi (802.11) are Layer 2 standards. Devices: <b>switches</b> (bridges), wireless access points, NICs. IEEE splits this layer into LLC (upper) and MAC (lower) sublayers.</dd>
<dt>Layer 3, Network</dt><dd>Delivers <b>packets</b> end to end across many networks. Uses <b>logical addresses</b> (IPv4, IPv6), and chooses a path (<b>routing</b>). Devices: <b>routers</b>, <b>Layer 3 switches</b>, and firewalls acting as routers. Protocols: IP, ICMP, and routing protocols such as OSPF.</dd>
<dt>Layer 4, Transport</dt><dd>Delivers data <b>process to process</b> using <b>port numbers</b>, so the right application on the host receives it. <b>TCP</b> adds reliability (sequencing, acknowledgements, retransmission, flow control); <b>UDP</b> adds only ports and a checksum. PDU: <b>segment</b> for TCP, <b>datagram</b> for UDP. Stateful firewalls track Layer 4 sessions.</dd>
<dt>Layer 5, Session</dt><dd>Opens, manages and closes dialogues between applications (for example, keeping a remote-desktop or database session in step). In TCP/IP, this job lives inside the applications themselves.</dd>
<dt>Layer 6, Presentation</dt><dd>Formats the data so both sides understand it: character encoding (ASCII, UTF-8), compression, and encryption. <b>TLS</b> is often described as working here, although in practice it sits between TCP and the application.</dd>
<dt>Layer 7, Application</dt><dd>The network services an application uses: <b>HTTP</b>, DNS, SMTP, SSH, DHCP, SNMP. Note: this is the protocol, not the program. Chrome is not Layer 7; the HTTP it speaks is.</dd>
</dl>

<h3>Two ways layers interact</h3>
<p><b>Same-layer interaction</b> happens between the same layer on two devices: PC1's TCP talks to SRV's TCP using the TCP header (SYN, ACK, sequence numbers). <b>Adjacent-layer interaction</b> happens inside one device: TCP hands its segment down to IP and asks "deliver this to 203.0.113.80"; IP asks Ethernet "deliver this to the gateway's MAC". Each layer's header is a message to its twin on the other side.</p>

<h3>Memory aids</h3>
<p>Top down: "<b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing". Bottom up: "<b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way". For PDUs from Layer 4 down: "<b>S</b>ome <b>P</b>eople <b>F</b>ear <b>B</b>irthdays" (segment, packet, frame, bits).</p>

<table class="cmp"><tr><th>Layer</th><th>PDU</th><th>Address used</th><th>Typical device</th></tr>
<tr><td>7-5 Application, Presentation, Session</td><td>Data</td><td>Names, URLs</td><td>Servers, proxies, NGFW app inspection</td></tr>
<tr><td>4 Transport</td><td>Segment / datagram</td><td>Port numbers</td><td>Stateful firewall, load balancer</td></tr>
<tr><td>3 Network</td><td>Packet</td><td>IP address</td><td>Router, L3 switch</td></tr>
<tr><td>2 Data link</td><td>Frame</td><td>MAC address</td><td>Switch, access point, NIC</td></tr>
<tr><td>1 Physical</td><td>Bits</td><td>None</td><td>Hub, repeater, cable</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> In Lab 1, PC1's web request is described in OSI terms like this. L7: "GET / HTTP/1.1". L4: TCP, source port 49875 (random), destination port 80. L3: IPv4 from 10.1.1.10 to 203.0.113.80, TTL 64, Protocol 6. L2: Ethernet from PC1's MAC to R1 Gi0/0's MAC, EtherType 0x0800. L1: electrical signals on the cable to SW1 Gi0/1. SW1 reads up to L2 only; R1 reads up to L3; SRV reads all the way to L7.</p></div>

<h3>Why the OSI model still matters</h3>
<p>Nobody runs "OSI protocols" today, but the layer numbers are the shared language of the industry. Vendors sell "Layer 3 switches" and "Layer 7 load balancers", and tickets say "Layer 1 issue on the uplink". A troubleshooting method (bottom-up, top-down, or divide-and-conquer starting at Layer 3 with a ping) only works if you know what lives at each layer.</p>

<div class="warn"><p><b>Common mistakes.</b> Saying a switch is "Layer 3" because it has an IP address for management: a plain switch still forwards user frames by MAC only. Calling the browser the application layer. Putting ARP firmly in one layer in an argument: ARP maps Layer 3 to Layer 2 addresses and is usually described as Layer 2 (its frames have no IP header), sometimes as "Layer 2.5".</p></div>

<div class="exam"><p><b>Exam traps.</b> The PDU at Layer 3 is a <b>packet</b>, at Layer 2 a <b>frame</b>; do not swap them. Encryption and compression are Presentation (L6). Port numbers are Layer 4, not Layer 3. A hub is Layer 1, a bridge or switch Layer 2, a router Layer 3.</p></div>

<div class="scn"><h4>The "Layer 3 problem" that was a cable</h4><p>A branch router's WAN interface showed "down/down" and the branch team insisted routing was broken because OSPF had lost its neighbour. The engineer ran <code>show interfaces</code> and saw <b>line protocol down</b> with the <b>interface itself down</b> and input errors climbing before it failed. Layer 1 was the problem: a damaged fibre patch cable. Replacing the patch lead restored the link, and OSPF came back on its own.</p><p><b>Lesson:</b> higher layers depend on lower ones. Before debugging a routing protocol, prove Layers 1 and 2 are healthy.</p></div>

<div class="iv"><p class="q">"Walk me through the OSI model and give a device and a protocol at each layer."</p><p>Go bottom up and be concrete: L1 bits, cable, hub; L2 frames, MAC, Ethernet, switch; L3 packets, IP, router; L4 segments, TCP/UDP ports, stateful firewall; L5 sessions; L6 encoding and encryption; L7 HTTP, DNS, SSH. Finish with why it matters: "I use it to troubleshoot bottom up." Mentioning PDUs and same-layer versus adjacent-layer interaction shows depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI has seven layers: Physical, Data link, Network, Transport, Session, Presentation, Application.</li>
<li>PDUs: bits (L1), frame (L2), packet (L3), segment or datagram (L4), data (L5-7).</li>
<li>Hub = L1, switch = L2 (MAC), router = L3 (IP), stateful firewall = L4, NGFW inspects up to L7.</li>
<li>Same-layer interaction is between devices; adjacent-layer interaction is inside one device.</li>
<li>The layer numbers are the industry's troubleshooting language.</li>
</ul></div>
`,hi:`
<p>Saat manzil wali ek office building socho. Sabse upar wali manzil par likha letter manzil dar manzil neeche aata hai; har manzil apna label ya folder jodti hai, aur ground floor se woh van mein nikalta hai. Dusri building mein letter manzil dar manzil upar jaata hai, aur har manzil sirf wahi label hatati hai jo uski twin manzil ne joda tha. Manzilein ek dusre ko skip nahi karti, aur ek building ki manzil 4 sirf dusri building ki manzil 4 se "baat" karti hai. Yahi <b>OSI model</b> (Open Systems Interconnection) hai, jise ISO ne 1984 mein networks ke communicate karne ke saat-layer reference ke roop mein publish kiya.</p>

<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-hi.svg" width="880" height="740" loading="lazy" decoding="async" alt="OSI ki saat layers: data se TCP segment, IP packet, Ethernet frame aur physical signals tak." /><figcaption>Message bhejte waqt stack mein neeche jaata hai; receive karte waqt upar. TCP segment aur UDP datagram alag PDUs hain. <a href="/images/config/osi-model-v1-hi.svg" target="_blank" rel="noopener noreferrer">Diagram bada dekho</a></figcaption></figure>

<h3>Saat layers, neeche se</h3>
<dl class="terms">
<dt>Layer 1, Physical</dt><dd><b>Bits</b> ko signals ki tarah chalata hai: copper par voltage, fibre mein light, Wi-Fi mein radio waves. Connectors (RJ-45, LC), cable types, pin-outs, speeds aur signal encoding define karta hai. Jo devices sirf yahan kaam karte hain: <b>hubs</b>, repeaters, media converters, aur khud cable. Hub ko pata hi nahi ki MAC address kya hota hai; woh har bit ko har port se repeat kar deta hai.</dd>
<dt>Layer 2, Data link</dt><dd><b>Same link ya LAN</b> par devices ke beech <b>frames</b> deliver karta hai. <b>MAC addresses</b> (48-bit physical addresses) use karta hai, <b>FCS</b> se corrupt frames pakadta hai, aur medium ka access control karta hai. Ethernet (IEEE 802.3) aur Wi-Fi (802.11) Layer 2 standards hain. Devices: <b>switches</b> (bridges), wireless access points, NICs. IEEE is layer ko LLC (upar) aur MAC (neeche) sublayers mein baantta hai.</dd>
<dt>Layer 3, Network</dt><dd>Kai networks ke paar end to end <b>packets</b> deliver karta hai. <b>Logical addresses</b> (IPv4, IPv6) use karta hai, aur path chunta hai (<b>routing</b>). Devices: <b>routers</b>, <b>Layer 3 switches</b>, aur router ki tarah kaam karte firewalls. Protocols: IP, ICMP, aur OSPF jaise routing protocols.</dd>
<dt>Layer 4, Transport</dt><dd><b>Port numbers</b> use karke data <b>process se process</b> tak deliver karta hai, taaki host par sahi application use receive kare. <b>TCP</b> reliability jodta hai (sequencing, acknowledgements, retransmission, flow control); <b>UDP</b> sirf ports aur checksum jodta hai. PDU: TCP ke liye <b>segment</b>, UDP ke liye <b>datagram</b>. Stateful firewalls Layer 4 sessions track karte hain.</dd>
<dt>Layer 5, Session</dt><dd>Applications ke beech dialogues kholta, manage karta aur band karta hai (jaise remote-desktop ya database session ko sync mein rakhna). TCP/IP mein yeh kaam khud applications ke andar hota hai.</dd>
<dt>Layer 6, Presentation</dt><dd>Data ko aise format karta hai ki dono sides samjhein: character encoding (ASCII, UTF-8), compression, aur encryption. <b>TLS</b> ko aksar yahan kaam karta bataya jaata hai, halanki practice mein woh TCP aur application ke beech baithta hai.</dd>
<dt>Layer 7, Application</dt><dd>Woh network services jo application use karti hai: <b>HTTP</b>, DNS, SMTP, SSH, DHCP, SNMP. Dhyan do: yeh protocol hai, program nahi. Chrome Layer 7 nahi hai; jo HTTP woh bolta hai woh Layer 7 hai.</dd>
</dl>

<h3>Layers ke interact karne ke do tareeke</h3>
<p><b>Same-layer interaction</b> do devices par same layer ke beech hota hai: PC1 ka TCP SRV ke TCP se TCP header (SYN, ACK, sequence numbers) use karke baat karta hai. <b>Adjacent-layer interaction</b> ek hi device ke andar hota hai: TCP apna segment IP ko neeche deta hai aur kehta hai "ise 203.0.113.80 tak pahunchao"; IP Ethernet se kehta hai "ise gateway ke MAC tak pahunchao". Har layer ka header dusri side par uske twin ke liye ek message hai.</p>

<h3>Yaad rakhne ke tareeke</h3>
<p>Upar se neeche: "<b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed <b>D</b>ata <b>P</b>rocessing". Neeche se upar: "<b>P</b>lease <b>D</b>o <b>N</b>ot <b>T</b>hrow <b>S</b>ausage <b>P</b>izza <b>A</b>way". Layer 4 se neeche PDUs ke liye: "<b>S</b>ome <b>P</b>eople <b>F</b>ear <b>B</b>irthdays" (segment, packet, frame, bits).</p>

<table class="cmp"><tr><th>Layer</th><th>PDU</th><th>Kaunsa address</th><th>Typical device</th></tr>
<tr><td>7-5 Application, Presentation, Session</td><td>Data</td><td>Names, URLs</td><td>Servers, proxies, NGFW app inspection</td></tr>
<tr><td>4 Transport</td><td>Segment / datagram</td><td>Port numbers</td><td>Stateful firewall, load balancer</td></tr>
<tr><td>3 Network</td><td>Packet</td><td>IP address</td><td>Router, L3 switch</td></tr>
<tr><td>2 Data link</td><td>Frame</td><td>MAC address</td><td>Switch, access point, NIC</td></tr>
<tr><td>1 Physical</td><td>Bits</td><td>Koi nahi</td><td>Hub, repeater, cable</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Lab 1 mein PC1 ki web request OSI terms mein aise describe hoti hai. L7: "GET / HTTP/1.1". L4: TCP, source port 49875 (random), destination port 80. L3: IPv4 10.1.1.10 se 203.0.113.80, TTL 64, Protocol 6. L2: Ethernet PC1 ke MAC se R1 Gi0/0 ke MAC tak, EtherType 0x0800. L1: SW1 Gi0/1 tak cable par electrical signals. SW1 sirf L2 tak padhta hai; R1 L3 tak padhta hai; SRV L7 tak poora padhta hai.</p></div>

<h3>OSI model aaj bhi kyun matter karta hai</h3>
<p>Aaj koi "OSI protocols" nahi chalata, lekin layer numbers industry ki common language hain. Vendors "Layer 3 switches" aur "Layer 7 load balancers" bechte hain, aur tickets mein likha hota hai "uplink par Layer 1 issue". Koi bhi troubleshooting method (bottom-up, top-down, ya ping se Layer 3 par shuru hone wala divide-and-conquer) tabhi kaam karta hai jab aapko pata ho ki har layer par kya rehta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Switch ko "Layer 3" kehna kyunki management ke liye uska IP address hai: plain switch ab bhi user frames sirf MAC se forward karta hai. Browser ko application layer kehna. Behes mein ARP ko pakke taur par ek layer mein daalna: ARP Layer 3 addresses ko Layer 2 addresses se map karta hai aur aam taur par Layer 2 kaha jaata hai (uske frames mein IP header nahi hota), kabhi kabhi "Layer 2.5".</p></div>

<div class="exam"><p><b>Exam traps.</b> Layer 3 ka PDU <b>packet</b> hai, Layer 2 ka <b>frame</b>; inhe swap mat karo. Encryption aur compression Presentation (L6) hain. Port numbers Layer 4 hain, Layer 3 nahi. Hub Layer 1, bridge ya switch Layer 2, router Layer 3.</p></div>

<div class="scn"><h4>"Layer 3 problem" jo ek cable nikla</h4><p>Ek branch router ka WAN interface "down/down" dikha raha tha aur branch team zor de rahi thi ki routing toot gayi hai kyunki OSPF ne apna neighbour kho diya tha. Engineer ne <code>show interfaces</code> chalaya aur dekha ki <b>line protocol down</b> tha, <b>interface khud down</b> tha, aur fail hone se pehle input errors badh rahe the. Problem Layer 1 thi: ek kharab fibre patch cable. Patch lead badalne se link wapas aaya, aur OSPF apne aap wapas aa gaya.</p><p><b>Seekh:</b> upar ki layers neeche wali layers par depend karti hain. Routing protocol debug karne se pehle prove karo ki Layer 1 aur 2 healthy hain.</p></div>

<div class="iv"><p class="q">"OSI model samjhao aur har layer par ek device aur ek protocol batao."</p><p>Neeche se upar jao aur concrete raho: L1 bits, cable, hub; L2 frames, MAC, Ethernet, switch; L3 packets, IP, router; L4 segments, TCP/UDP ports, stateful firewall; L5 sessions; L6 encoding aur encryption; L7 HTTP, DNS, SSH. End mein batao yeh kyun matter karta hai: "Main ise bottom up troubleshoot karne ke liye use karta hoon." PDUs aur same-layer vs adjacent-layer interaction mention karne se depth dikhti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI ki saat layers hain: Physical, Data link, Network, Transport, Session, Presentation, Application.</li>
<li>PDUs: bits (L1), frame (L2), packet (L3), segment ya datagram (L4), data (L5-7).</li>
<li>Hub = L1, switch = L2 (MAC), router = L3 (IP), stateful firewall = L4, NGFW L7 tak inspect karta hai.</li>
<li>Same-layer interaction devices ke beech hota hai; adjacent-layer interaction ek device ke andar.</li>
<li>Layer numbers industry ki troubleshooting language hain.</li>
</ul></div>
`}};export{e as default};