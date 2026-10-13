var e={id:`osi-lower`,h:{en:`OSI in depth, part 1: Physical, Data link and Network`,hi:`OSI gehraai mein, part 1: Physical, Data link aur Network`},body:{en:`
<p>In net-start you met the seven layers as names in a table. Now we open each of the lower three and look inside: what is actually on the wire, which header fields exist, which devices work there, and what a failure at that layer looks like. Think of the courier company again: this chapter is about the road, the truck driver and the routing office.</p>

<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-en.svg" width="880" height="740" loading="lazy" decoding="async" alt="Seven OSI layers with sending and receiving directions, TCP encapsulation and an example network path." /><figcaption>A message moves down the stack when sent and up when received. TCP uses a segment; UDP uses a datagram. <a href="/images/config/osi-model-v1-en.svg" target="_blank" rel="noopener noreferrer">View full-size diagram</a></figcaption></figure>

<h3>Layer 1, Physical: turning bits into signals</h3>
<p>Layer 1 moves raw <b>bits</b>. It has no idea what a frame or an address is. Its job is to define how a 1 and a 0 look on the medium: voltage changes on copper, pulses of light on fibre, or changes in a radio wave for wireless. Layer 1 standards set the <b>connector</b> and pinout, the <b>cable type</b> and maximum length, the <b>signalling and encoding</b> (how bits are represented), the <b>bit rate</b> (1 Gb/s, 10 Gb/s) and the <b>duplex</b> (half duplex takes turns; full duplex sends and receives at the same time).</p>
<p><b>Devices and parts at Layer 1:</b> cables, connectors, patch panels, hubs, repeaters, media converters (copper to fibre) and the transceiver side of an SFP module. A hub is simply a multiport repeater: it copies bits out of every port and understands nothing.</p>
<p><b>Layer 1 symptoms:</b> no link light, interface down/down, CRC and input errors climbing, late collisions (a sign of a duplex mismatch), a link that negotiates at 100 Mb/s instead of 1 Gb/s because one pair of the cable is broken.</p>

<h3>Layer 2, Data link: frames on one link</h3>
<p>Layer 2 delivers a <b>frame</b> from one device to the next device on the same link or LAN. It adds <b>physical addressing</b> (48-bit MAC addresses) and <b>error detection</b>. IEEE splits it into two sublayers: <b>LLC</b> (Logical Link Control, 802.2) identifies what is carried inside, and <b>MAC</b> (Media Access Control) handles addressing and access to the medium. The first 24 bits of a MAC address are the <b>OUI</b> (Organisationally Unique Identifier) of the vendor; the last 24 bits are assigned by that vendor.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ethernet II frame and IPv4 header">
<text x="10" y="20" class="svg-ink" font-size="13">Ethernet II frame (bytes)</text>
<rect x="10" y="30" width="80" height="40" fill="#e2e8f0" stroke="#64748b"/><text x="50" y="55" text-anchor="middle" class="svg-ink" font-size="12">Preamble 8</text>
<rect x="90" y="30" width="80" height="40" fill="#bae6fd" stroke="#64748b"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC 6</text>
<rect x="170" y="30" width="80" height="40" fill="#bae6fd" stroke="#64748b"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="12">Src MAC 6</text>
<rect x="250" y="30" width="70" height="40" fill="#fde68a" stroke="#64748b"/><text x="285" y="55" text-anchor="middle" class="svg-ink" font-size="12">802.1Q 4</text>
<rect x="320" y="30" width="80" height="40" fill="#ddd6fe" stroke="#64748b"/><text x="360" y="55" text-anchor="middle" class="svg-ink" font-size="12">EtherType 2</text>
<rect x="400" y="30" width="160" height="40" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">Payload 46-1500</text>
<rect x="560" y="30" width="70" height="40" fill="#fed7aa" stroke="#64748b"/><text x="595" y="55" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="10" y="105" class="svg-ink" font-size="13">IPv4 header inside the payload (20 bytes minimum)</text>
<rect x="10" y="115" width="150" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="85" y="137" text-anchor="middle" class="svg-ink" font-size="12">Version, IHL, DSCP</text>
<rect x="160" y="115" width="160" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">Length, ID, flags, offset</text>
<rect x="320" y="115" width="70" height="34" fill="#fde68a" stroke="#64748b"/><text x="355" y="137" text-anchor="middle" class="svg-ink" font-size="12">TTL</text>
<rect x="390" y="115" width="90" height="34" fill="#ddd6fe" stroke="#64748b"/><text x="435" y="137" text-anchor="middle" class="svg-ink" font-size="12">Protocol</text>
<rect x="480" y="115" width="150" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="555" y="137" text-anchor="middle" class="svg-ink" font-size="12">Header checksum</text>
<rect x="10" y="155" width="310" height="34" fill="#bbf7d0" stroke="#64748b"/><text x="165" y="177" text-anchor="middle" class="svg-ink" font-size="12">Source IP (32 bits)</text>
<rect x="320" y="155" width="310" height="34" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="177" text-anchor="middle" class="svg-ink" font-size="12">Destination IP (32 bits)</text>
</svg><p class="cap">The fields you will be asked about: destination MAC first, EtherType, FCS at the end; TTL, Protocol and the two IP addresses in the IP header.</p></div>

<p>Walk through the frame from left to right. The <b>preamble and SFD</b> (8 bytes) let the receiver synchronise its clock. The <b>destination MAC</b> comes first so a switch can start its forwarding decision early. The <b>802.1Q tag</b> (4 bytes, only on trunk links) carries the VLAN ID and a 3-bit priority value called CoS. The <b>EtherType</b> says what is inside: 0x0800 for IPv4, 0x0806 for ARP, 0x86DD for IPv6. The <b>payload</b> is 46 to 1500 bytes; 1500 is the standard <b>MTU</b>. The <b>FCS</b> (Frame Check Sequence) is a CRC value; a receiver that calculates a different value discards the frame and counts a CRC error. Ethernet detects errors but does not correct or resend them; that job belongs to TCP at Layer 4.</p>
<p><b>Devices at Layer 2:</b> switches, bridges, wireless access points and NICs. A switch learns source MACs into its MAC address table and forwards by destination MAC. Broadcasts (FF:FF:FF:FF:FF:FF) and unknown destinations are flooded within the VLAN.</p>
<p><b>Layer 2 symptoms:</b> a host is in the wrong VLAN, a trunk does not allow a VLAN, MAC flapping from a loop, ARP not resolving, a port in err-disabled state from port security.</p>

<h3>Layer 3, Network: packets across networks</h3>
<p>Layer 3 moves a <b>packet</b> from the original source to the final destination, across many links. It adds <b>logical addressing</b> (IPv4 or IPv6) and handles <b>path selection</b> (routing). Key IPv4 header fields: <b>TTL</b> (decremented by every router; at 0 the packet is dropped and an ICMP Time Exceeded is sent back), <b>Protocol</b> (which Layer 4 or other protocol is inside: 1 ICMP, 6 TCP, 17 UDP), <b>DSCP</b> (6 bits used by QoS), the <b>identification, flags and fragment offset</b> fields used for fragmentation (including the Don't Fragment bit), and the source and destination IP addresses.</p>
<p><b>Devices at Layer 3:</b> routers, Layer 3 (multilayer) switches, and firewalls when they route. <b>ICMP</b> is a Layer 3 helper protocol used by ping and traceroute. <b>ARP</b> sits on the border: it serves Layer 3 (it is asked "what MAC belongs to this IP?") but works entirely inside one Layer 2 broadcast domain, and most exam material groups it with Layer 2.</p>
<p><b>Layer 3 symptoms:</b> wrong mask or gateway on a host, a missing route, a routing loop (TTL expiring in transit), an ACL dropping packets, MTU problems when DF is set.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.10.10) sends 1000 bytes of data to SRV (10.0.20.10) with TCP. TCP adds 20 bytes (segment = 1020), IP adds 20 bytes (packet = 1040), Ethernet adds 14 bytes of header and 4 bytes of FCS (frame = 1058 bytes, plus 8 bytes of preamble on the wire). The IP packet's Protocol field is 6 (TCP) and the frame's EtherType is 0x0800 (IPv4).</p></div>

<h3>Seeing Layers 1 and 2 on a router interface</h3>
<pre class="code"><span class="c">! on R1: one command shows Layer 1 and Layer 2 health</span>
R1# show interfaces GigabitEthernet0/0</pre>
<pre class="out"><span class="hl">GigabitEthernet0/0 is up, line protocol is up</span>
  Hardware is iGbE, address is 5254.0012.3456 (bia 5254.0012.3456)
  Internet address is 10.0.10.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
  <span class="hl">Full-duplex, 1000Mb/s</span>, media type is RJ45
     0 input errors, <span class="hl">0 CRC</span>, 0 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 1 interface resets</pre>
<p>The first word pair is the Layer 1 status ("is up"), the second is Layer 2 ("line protocol is up"). Speed, duplex and the error counters are Layer 1 evidence; the MAC ("address is") is Layer 2; the "Internet address" is Layer 3.</p>

<div class="warn"><p><b>Common mistake.</b> Thinking a switch "reads the IP address" to forward a frame. A Layer 2 switch forwards only by destination MAC. It is the multilayer switch or router that looks at the IP header.</p></div>

<div class="exam"><p><b>Exam traps.</b> A hub, repeater, media converter and cable are Layer 1. A switch, bridge, NIC and wireless AP are Layer 2. A router is Layer 3. CRC errors point to Layer 1 (cabling, interference, duplex) even though the FCS field lives in the Layer 2 trailer. MAC = Layer 2, IP = Layer 3, port = Layer 4.</p></div>

<div class="scn"><h4>CRC errors near the lift shaft</h4><p>Users on the third floor reported slow file copies and dropped video calls. The switch port for their access switch uplink showed CRC errors rising by thousands per hour. The cable ran through the lift shaft next to the lift motor, and it was unshielded Cat5e with a crushed section. The engineer re-routed the run away from the motor with shielded Cat6a; the CRC counter stopped increasing and calls stabilised.</p><p><b>Lesson:</b> CRC errors are a Layer 1 symptom seen through a Layer 2 check. Fix the physical path, then clear counters and watch them.</p></div>

<div class="iv"><p class="q">"Walk me through the fields of an Ethernet frame and tell me which ones a switch uses."</p><p>Strong answer: preamble and SFD for synchronisation, destination MAC, source MAC, optional 802.1Q tag with VLAN ID and CoS, EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6), payload up to the 1500-byte MTU, and the FCS for error detection. A switch learns the source MAC, forwards on the destination MAC within the VLAN from the tag or access port, and drops frames with a bad FCS. Bonus: mention minimum frame size 64 bytes and that Ethernet detects but does not recover errors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 1 is bits and signals: cables, connectors, hubs, repeaters, media converters; symptoms are link down and CRC errors.</li>
<li>Layer 2 is frames and MAC addresses: LLC and MAC sublayers, EtherType, 802.1Q tag, FCS; switches, bridges, APs, NICs.</li>
<li>Layer 3 is packets and IP addresses: TTL, Protocol, DSCP and fragmentation fields; routers and L3 switches.</li>
<li>"up/up" on an interface means Layer 1 and Layer 2 are both working.</li>
<li>Ethernet detects errors with the FCS but never retransmits.</li>
</ul></div>
`,hi:`
<p>net-start mein aapne saat layers ko table mein naam ki tarah dekha tha. Ab hum neeche ki teen layers ko ek ek karke kholte hain aur andar dekhte hain: wire par asal mein kya hota hai, kaunse header fields hote hain, kaunse devices wahan kaam karte hain, aur us layer par failure kaisa dikhta hai. Courier company ko phir se socho: yeh chapter sadak, truck driver aur routing office ke baare mein hai.</p>

<figure class="nk-lesson-image"><img src="/images/config/osi-model-v1-hi.svg" width="880" height="740" loading="lazy" decoding="async" alt="OSI ki saat layers: data se TCP segment, IP packet, Ethernet frame aur physical signals tak." /><figcaption>Message bhejte waqt stack mein neeche jaata hai; receive karte waqt upar. TCP segment aur UDP datagram alag PDUs hain. <a href="/images/config/osi-model-v1-hi.svg" target="_blank" rel="noopener noreferrer">Diagram bada dekho</a></figcaption></figure>

<h3>Layer 1, Physical: bits ko signals mein badalna</h3>
<p>Layer 1 raw <b>bits</b> le jaati hai. Use nahi pata frame ya address kya hota hai. Iska kaam define karna hai ki medium par 1 aur 0 kaise dikhte hain: copper par voltage changes, fibre par light ke pulses, ya wireless ke liye radio wave mein changes. Layer 1 standards <b>connector</b> aur pinout, <b>cable type</b> aur maximum length, <b>signalling aur encoding</b> (bits kaise represent hote hain), <b>bit rate</b> (1 Gb/s, 10 Gb/s) aur <b>duplex</b> (half duplex baari baari bolta hai; full duplex ek saath bhejta aur receive karta hai) set karte hain.</p>
<p><b>Layer 1 ke devices aur parts:</b> cables, connectors, patch panels, hubs, repeaters, media converters (copper se fibre) aur SFP module ka transceiver hissa. Hub bas ek multiport repeater hai: woh har port se bits copy karta hai aur kuch nahi samajhta.</p>
<p><b>Layer 1 symptoms:</b> link light nahi, interface down/down, CRC aur input errors badhte hue, late collisions (duplex mismatch ka sign), link jo 1 Gb/s ki jagah 100 Mb/s par negotiate karta hai kyunki cable ka ek pair toota hai.</p>

<h3>Layer 2, Data link: ek link par frames</h3>
<p>Layer 2 ek <b>frame</b> ko ek device se usi link ya LAN ke agle device tak pahunchati hai. Yeh <b>physical addressing</b> (48-bit MAC addresses) aur <b>error detection</b> jodti hai. IEEE ise do sublayers mein baantta hai: <b>LLC</b> (Logical Link Control, 802.2) batata hai ki andar kya carry ho raha hai, aur <b>MAC</b> (Media Access Control) addressing aur medium ka access sambhalta hai. MAC address ke pehle 24 bits vendor ka <b>OUI</b> (Organisationally Unique Identifier) hote hain; aakhri 24 bits woh vendor assign karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Ethernet II frame aur IPv4 header">
<text x="10" y="20" class="svg-ink" font-size="13">Ethernet II frame (bytes)</text>
<rect x="10" y="30" width="80" height="40" fill="#e2e8f0" stroke="#64748b"/><text x="50" y="55" text-anchor="middle" class="svg-ink" font-size="12">Preamble 8</text>
<rect x="90" y="30" width="80" height="40" fill="#bae6fd" stroke="#64748b"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC 6</text>
<rect x="170" y="30" width="80" height="40" fill="#bae6fd" stroke="#64748b"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="12">Src MAC 6</text>
<rect x="250" y="30" width="70" height="40" fill="#fde68a" stroke="#64748b"/><text x="285" y="55" text-anchor="middle" class="svg-ink" font-size="12">802.1Q 4</text>
<rect x="320" y="30" width="80" height="40" fill="#ddd6fe" stroke="#64748b"/><text x="360" y="55" text-anchor="middle" class="svg-ink" font-size="12">EtherType 2</text>
<rect x="400" y="30" width="160" height="40" fill="#bbf7d0" stroke="#64748b"/><text x="480" y="55" text-anchor="middle" class="svg-ink" font-size="12">Payload 46-1500</text>
<rect x="560" y="30" width="70" height="40" fill="#fed7aa" stroke="#64748b"/><text x="595" y="55" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="10" y="105" class="svg-ink" font-size="13">Payload ke andar IPv4 header (kam se kam 20 bytes)</text>
<rect x="10" y="115" width="150" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="85" y="137" text-anchor="middle" class="svg-ink" font-size="12">Version, IHL, DSCP</text>
<rect x="160" y="115" width="160" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="240" y="137" text-anchor="middle" class="svg-ink" font-size="12">Length, ID, flags, offset</text>
<rect x="320" y="115" width="70" height="34" fill="#fde68a" stroke="#64748b"/><text x="355" y="137" text-anchor="middle" class="svg-ink" font-size="12">TTL</text>
<rect x="390" y="115" width="90" height="34" fill="#ddd6fe" stroke="#64748b"/><text x="435" y="137" text-anchor="middle" class="svg-ink" font-size="12">Protocol</text>
<rect x="480" y="115" width="150" height="34" fill="#e2e8f0" stroke="#64748b"/><text x="555" y="137" text-anchor="middle" class="svg-ink" font-size="12">Header checksum</text>
<rect x="10" y="155" width="310" height="34" fill="#bbf7d0" stroke="#64748b"/><text x="165" y="177" text-anchor="middle" class="svg-ink" font-size="12">Source IP (32 bits)</text>
<rect x="320" y="155" width="310" height="34" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="177" text-anchor="middle" class="svg-ink" font-size="12">Destination IP (32 bits)</text>
</svg><p class="cap">Jin fields ke baare mein poocha jaayega: sabse pehle destination MAC, EtherType, end mein FCS; IP header mein TTL, Protocol aur dono IP addresses.</p></div>

<p>Frame ko left se right padho. <b>Preamble aur SFD</b> (8 bytes) receiver ko apni clock sync karne dete hain. <b>Destination MAC</b> sabse pehle aata hai taaki switch apna forwarding decision jaldi shuru kar sake. <b>802.1Q tag</b> (4 bytes, sirf trunk links par) VLAN ID aur CoS naam ki 3-bit priority value le jaata hai. <b>EtherType</b> batata hai andar kya hai: IPv4 ke liye 0x0800, ARP ke liye 0x0806, IPv6 ke liye 0x86DD. <b>Payload</b> 46 se 1500 bytes ka hota hai; 1500 standard <b>MTU</b> hai. <b>FCS</b> (Frame Check Sequence) ek CRC value hai; jo receiver alag value calculate karta hai woh frame discard karta hai aur CRC error ginta hai. Ethernet errors detect karta hai lekin unhe correct ya dobara nahi bhejta; woh kaam Layer 4 par TCP ka hai.</p>
<p><b>Layer 2 ke devices:</b> switches, bridges, wireless access points aur NICs. Switch source MACs ko apni MAC address table mein seekhta hai aur destination MAC se forward karta hai. Broadcasts (FF:FF:FF:FF:FF:FF) aur unknown destinations VLAN ke andar flood hote hain.</p>
<p><b>Layer 2 symptoms:</b> host galat VLAN mein hai, trunk kisi VLAN ko allow nahi karta, loop se MAC flapping, ARP resolve nahi hota, port security se port err-disabled state mein.</p>

<h3>Layer 3, Network: networks ke paar packets</h3>
<p>Layer 3 <b>packet</b> ko original source se final destination tak, bahut saare links ke paar le jaati hai. Yeh <b>logical addressing</b> (IPv4 ya IPv6) jodti hai aur <b>path selection</b> (routing) sambhalti hai. Important IPv4 header fields: <b>TTL</b> (har router ise kam karta hai; 0 par packet drop hota hai aur ICMP Time Exceeded wapas bheja jaata hai), <b>Protocol</b> (andar kaunsa Layer 4 ya doosra protocol hai: 1 ICMP, 6 TCP, 17 UDP), <b>DSCP</b> (QoS ke use ke 6 bits), fragmentation ke liye <b>identification, flags aur fragment offset</b> fields (Don't Fragment bit ke saath), aur source aur destination IP addresses.</p>
<p><b>Layer 3 ke devices:</b> routers, Layer 3 (multilayer) switches, aur firewalls jab woh route karte hain. <b>ICMP</b> Layer 3 ka helper protocol hai jo ping aur traceroute use karte hain. <b>ARP</b> border par baitha hai: yeh Layer 3 ki seva karta hai (isse poocha jaata hai "is IP ka MAC kaunsa hai?") lekin poori tarah ek Layer 2 broadcast domain ke andar kaam karta hai, aur zyada tar exam material ise Layer 2 ke saath rakhta hai.</p>
<p><b>Layer 3 symptoms:</b> host par galat mask ya gateway, missing route, routing loop (transit mein TTL expire hona), ACL packets drop kar raha hai, DF set hone par MTU problems.</p>

<div class="eg"><p><b>Worked example.</b> PC1 (10.0.10.10) TCP se SRV (10.0.20.10) ko 1000 bytes data bhejta hai. TCP 20 bytes jodta hai (segment = 1020), IP 20 bytes jodta hai (packet = 1040), Ethernet 14 bytes header aur 4 bytes FCS jodta hai (frame = 1058 bytes, wire par 8 bytes preamble alag se). IP packet ka Protocol field 6 (TCP) hai aur frame ka EtherType 0x0800 (IPv4) hai.</p></div>

<h3>Router interface par Layer 1 aur 2 dekhna</h3>
<pre class="code"><span class="c">! R1 par: ek command Layer 1 aur Layer 2 ki health dikhata hai</span>
R1# show interfaces GigabitEthernet0/0</pre>
<pre class="out"><span class="hl">GigabitEthernet0/0 is up, line protocol is up</span>
  Hardware is iGbE, address is 5254.0012.3456 (bia 5254.0012.3456)
  Internet address is 10.0.10.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
  <span class="hl">Full-duplex, 1000Mb/s</span>, media type is RJ45
     0 input errors, <span class="hl">0 CRC</span>, 0 frame, 0 overrun, 0 ignored
     0 output errors, 0 collisions, 1 interface resets</pre>
<p>Pehla word pair Layer 1 status hai ("is up"), doosra Layer 2 ("line protocol is up"). Speed, duplex aur error counters Layer 1 ke saboot hain; MAC ("address is") Layer 2 hai; "Internet address" Layer 3 hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki switch frame forward karne ke liye "IP address padhta hai". Layer 2 switch sirf destination MAC se forward karta hai. IP header multilayer switch ya router dekhta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Hub, repeater, media converter aur cable Layer 1 hain. Switch, bridge, NIC aur wireless AP Layer 2 hain. Router Layer 3 hai. CRC errors Layer 1 (cabling, interference, duplex) ki taraf ishara karte hain bhale hi FCS field Layer 2 trailer mein rehta hai. MAC = Layer 2, IP = Layer 3, port = Layer 4.</p></div>

<div class="scn"><h4>Lift shaft ke paas CRC errors</h4><p>Teesri manzil ke users ne slow file copies aur drop hoti video calls report ki. Unke access switch uplink ke switch port par CRC errors har ghante hazaaron mein badh rahe the. Cable lift motor ke bagal mein lift shaft se jaati thi, aur woh unshielded Cat5e thi jiska ek hissa dab gaya tha. Engineer ne run ko motor se door shielded Cat6a ke saath re-route kiya; CRC counter badhna band hua aur calls stable ho gayi.</p><p><b>Seekh:</b> CRC errors Layer 1 ka symptom hain jo Layer 2 check se dikhte hain. Physical path theek karo, phir counters clear karke dekhte raho.</p></div>

<div class="iv"><p class="q">"Ethernet frame ke fields samjhao aur batao switch unmein se kaunse use karta hai."</p><p>Strong answer: synchronisation ke liye preamble aur SFD, destination MAC, source MAC, VLAN ID aur CoS ke saath optional 802.1Q tag, EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6), 1500-byte MTU tak payload, aur error detection ke liye FCS. Switch source MAC seekhta hai, tag ya access port ke VLAN ke andar destination MAC par forward karta hai, aur galat FCS wale frames drop karta hai. Bonus: batao ki minimum frame size 64 bytes hai aur Ethernet errors detect karta hai lekin recover nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 1 bits aur signals hai: cables, connectors, hubs, repeaters, media converters; symptoms link down aur CRC errors hain.</li>
<li>Layer 2 frames aur MAC addresses hai: LLC aur MAC sublayers, EtherType, 802.1Q tag, FCS; switches, bridges, APs, NICs.</li>
<li>Layer 3 packets aur IP addresses hai: TTL, Protocol, DSCP aur fragmentation fields; routers aur L3 switches.</li>
<li>Interface par "up/up" ka matlab hai Layer 1 aur Layer 2 dono chal rahe hain.</li>
<li>Ethernet FCS se errors detect karta hai lekin kabhi retransmit nahi karta.</li>
</ul></div>
`}};export{e as default};