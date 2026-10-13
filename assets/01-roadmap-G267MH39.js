var e={id:`roadmap`,h:{en:`Roadmap: models, layers and encapsulation in the data center`,hi:`Roadmap: data center mein models, layers aur encapsulation`},body:{en:`
<p><b>What you will learn in this module.</b> Before you build a spine-leaf fabric, run VXLAN or touch ACI, you must be completely comfortable with the classic networking underneath: how Ethernet switches forward frames, what VLANs and trunks are, why spanning tree exists (and why modern fabrics avoid it), IPv4 and IPv6 addressing, how a router picks a path, OSPF and BGP basics, MTU, link aggregation and gateway redundancy. Every chapter shows the Cisco Nexus (NX-OS) commands and output you will meet on the job, and the module ends with an NX-OS survival kit for engineers who come from IOS.</p>
<p><b>Prerequisites.</b> You have read the data center introduction module, so you know what racks, servers, hypervisors and leaf and spine switches are. You know what an IP address looks like and have typed a few commands on any Cisco device. No CCNA is required; we rebuild the essentials from zero, but faster and with a data center angle.</p>

<h3>Why models? A post office analogy</h3>
<p>Imagine sending a gift abroad. You write a letter (the application data), put it in a box with a packing list (transport), write the destination city and address on the box (network), and the local courier puts a local tracking label on it for the next hop only (data link), then a truck physically carries it (physical). At each hand-off the local label changes, but the address on the box stays the same until it arrives. Networking works exactly like this, and a <b>layered model</b> is simply an agreed way to name each of those jobs so engineers can talk about them precisely.</p>

<h3>OSI and TCP/IP, side by side</h3>
<p>The <b>OSI model</b> has seven layers. The <b>TCP/IP model</b>, which the internet actually uses, has four (some books say five, splitting the bottom layer into data link and physical). Engineers mix the names freely: when someone says "a Layer-2 problem", they mean OSI layer 2, data link.</p>
<table class="cmp"><tr><th>OSI layer</th><th>TCP/IP layer</th><th>Unit (PDU)</th><th>In the data center</th></tr>
<tr><td>7 Application, 6 Presentation, 5 Session</td><td>Application</td><td>Data</td><td>HTTP, DNS, TLS, database protocols; load balancers and application delivery controllers work here</td></tr>
<tr><td>4 Transport</td><td>Transport</td><td>Segment (TCP) / datagram (UDP)</td><td>TCP and UDP ports; firewalls and load balancers track sessions</td></tr>
<tr><td>3 Network</td><td>Internet</td><td>Packet</td><td>IPv4 and IPv6; spine and leaf routing, SVIs, border leaf, VRFs</td></tr>
<tr><td>2 Data link</td><td>Link</td><td>Frame</td><td>Ethernet, MAC addresses, VLANs, trunks, LACP, STP; leaf switch ports towards servers</td></tr>
<tr><td>1 Physical</td><td>Link</td><td>Bits</td><td>Optics, DAC and fibre cables, transceivers, patch panels</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layers mapped to data center devices">
<rect x="10" y="10" width="200" height="36" rx="6" fill="#fde68a"/><text x="110" y="33" text-anchor="middle" class="svg-ink" font-size="13">L7 Application</text>
<rect x="10" y="56" width="200" height="36" rx="6" fill="#fed7aa"/><text x="110" y="79" text-anchor="middle" class="svg-ink" font-size="13">L4 Transport</text>
<rect x="10" y="102" width="200" height="36" rx="6" fill="#ddd6fe"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">L3 Network</text>
<rect x="10" y="148" width="200" height="36" rx="6" fill="#bae6fd"/><text x="110" y="171" text-anchor="middle" class="svg-ink" font-size="13">L2 Data link</text>
<rect x="10" y="194" width="200" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="217" text-anchor="middle" class="svg-ink" font-size="13">L1 Physical</text>
<line x1="210" y1="28" x2="300" y2="28" stroke="#64748b" stroke-width="2"/><text x="310" y="33" class="svg-muted" font-size="13">Load balancer, web server</text>
<line x1="210" y1="74" x2="300" y2="74" stroke="#64748b" stroke-width="2"/><text x="310" y="79" class="svg-muted" font-size="13">Firewall sessions, TCP/UDP ports</text>
<line x1="210" y1="120" x2="300" y2="120" stroke="#64748b" stroke-width="2"/><text x="310" y="125" class="svg-muted" font-size="13">Spine, leaf SVI, border leaf</text>
<line x1="210" y1="166" x2="300" y2="166" stroke="#64748b" stroke-width="2"/><text x="310" y="171" class="svg-muted" font-size="13">Leaf access and trunk ports</text>
<line x1="210" y1="212" x2="300" y2="212" stroke="#64748b" stroke-width="2"/><text x="310" y="217" class="svg-muted" font-size="13">Optics, DAC, fibre, patch panel</text>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">A modern leaf switch works at L2 and L3 at the same time</text>
</svg><p class="cap">Where each layer lives in a data center. Layers 5 and 6 are rarely discussed separately in practice.</p></div>

<h3>Encapsulation: what really travels on the cable</h3>
<p>When a web server sends a reply, each layer adds its own <b>header</b> in front of the data it received from the layer above. This wrapping is called <b>encapsulation</b>; the receiver removes the headers in reverse order (<b>de-encapsulation</b>).</p>
<ol>
<li><b>Application data</b>: for example an HTTP response body.</li>
<li><b>Segment</b>: TCP adds a 20-byte header (source and destination port, sequence numbers, flags).</li>
<li><b>Packet</b>: IP adds a 20-byte IPv4 header (source and destination IP, TTL, protocol) or a 40-byte IPv6 header.</li>
<li><b>Frame</b>: Ethernet adds a 14-byte header (destination MAC, source MAC, EtherType) and a 4-byte trailer, the FCS (frame check sequence), used to detect corruption.</li>
<li><b>Bits</b>: the NIC turns the frame into light or electrical signals, preceded by an 8-byte preamble.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Encapsulation">
<rect x="360" y="12" width="200" height="30" rx="4" fill="#fde68a"/><text x="460" y="32" text-anchor="middle" class="svg-ink" font-size="12">Data</text>
<rect x="280" y="56" width="80" height="30" rx="4" fill="#fed7aa"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">TCP 20</text>
<rect x="360" y="56" width="200" height="30" rx="4" fill="#fde68a"/><text x="460" y="76" text-anchor="middle" class="svg-ink" font-size="12">Data</text>
<rect x="200" y="100" width="80" height="30" rx="4" fill="#ddd6fe"/><text x="240" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 20</text>
<rect x="280" y="100" width="280" height="30" rx="4" fill="#e2e8f0"/><text x="420" y="120" text-anchor="middle" class="svg-ink" font-size="12">Segment</text>
<rect x="100" y="144" width="100" height="30" rx="4" fill="#bae6fd"/><text x="150" y="164" text-anchor="middle" class="svg-ink" font-size="12">Eth 14</text>
<rect x="200" y="144" width="360" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="164" text-anchor="middle" class="svg-ink" font-size="12">Packet</text>
<rect x="560" y="144" width="60" height="30" rx="4" fill="#bae6fd"/><text x="590" y="164" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="20" y="32" class="svg-muted" font-size="12">Application</text><text x="20" y="76" class="svg-muted" font-size="12">Segment</text><text x="20" y="120" class="svg-muted" font-size="12">Packet</text><text x="20" y="164" class="svg-muted" font-size="12">Frame</text>
<text x="320" y="194" text-anchor="middle" class="svg-accent" font-size="12">Each layer wraps the one above it</text>
</svg><p class="cap">Header sizes in bytes for TCP over IPv4 over Ethernet, without options.</p></div>

<div class="eg"><p><b>Worked example: how big is a full-size frame?</b> The standard Ethernet MTU is 1500 bytes; that is the largest IP packet a port carries. Inside it: 20 bytes IP + 20 bytes TCP leaves 1460 bytes of application data (this is the TCP MSS). Add the Ethernet header (14) and FCS (4): 1500 + 18 = <b>1518 bytes</b> on the wire. With an 802.1Q VLAN tag (4 more bytes) it becomes <b>1522</b>. Keep these numbers; you will need them for VLANs, MTU and VXLAN, where another 50 bytes are added around the whole frame.</p></div>

<h3>Why this matters in the data center</h3>
<p>Troubleshooting is layer by layer. If a server cannot reach its database, a good engineer asks in order: is the link up (L1)? Is the port in the right VLAN and is the MAC learned (L2)? Does the leaf have the route and an ARP entry (L3)? Is a firewall dropping the TCP port (L4)? On NX-OS each question has a show command, which you will learn chapter by chapter:</p>
<pre class="code"><span class="c">! L1 and L2: is the port up and in which VLAN?</span>
LEAF1# show interface brief
<span class="c">! L2: which MAC is learned where?</span>
LEAF1# show mac address-table vlan 10
<span class="c">! L3: route and next-hop resolution</span>
LEAF1# show ip route 10.10.20.21
LEAF1# show ip arp 10.10.20.21</pre>
<pre class="out">LEAF1# show interface brief
Ethernet      VLAN    Type Mode   Status  Reason                   Speed     Port
Interface                                                                    Ch #
Eth1/5        10      eth  access up      none                       25G(D)  --
<span class="hl">Eth1/6        20      eth  access down    Link not connected         auto(D) --</span></pre>

<h3>The road ahead</h3>
<p>Chapters 2 to 4 cover Layer 2 (Ethernet, VLANs, STP). Chapters 5 to 8 cover Layer 3 (IPv4, IPv6, routing, OSPF and BGP). Chapter 9 is MTU, chapter 10 is link aggregation and gateway redundancy, and chapter 11 is your NX-OS survival kit and exam checklist. Three hands-on labs let you build a VLAN trunk, SVIs and an LACP port-channel on simulated Nexus switches.</p>

<div class="warn"><p><b>Common mistakes.</b> Saying "packet" when you mean "frame" in an interview (a switch forwards frames, a router forwards packets). Forgetting that the MTU counts the IP packet, not the Ethernet header. Assuming "Layer 3 switch" means something exotic: every Nexus leaf routes and switches.</p></div>
<div class="exam"><p><b>Exam tip.</b> Know the PDU names (data, segment, packet, frame, bits), the four TCP/IP layers, and standard sizes: Ethernet header 14, FCS 4, 802.1Q tag 4, IPv4 header 20, IPv6 header 40, TCP 20, UDP 8.</p></div>

<div class="scn"><h4>"The network is down" that was not the network</h4><p>An application team raised a P1: the payments service could not reach its database. The on-call engineer went layer by layer. Link on LEAF-07 Eth1/12 was up, the server MAC was learned in VLAN 210, the SVI had an ARP entry for the database, and pings worked. A capture on the server showed TCP SYNs to port 5432 answered by resets. A new host firewall rule on the database server had closed the port during a patch. The network team had the evidence in ten minutes because they checked L1 to L4 in order instead of guessing.</p><p><b>Lesson:</b> a layered method turns "it is broken" into a precise, provable answer.</p></div>

<div class="iv"><p class="q">"Walk me through what happens to data as it leaves a server."</p><p>Strong answer: the application hands data to TCP, which adds ports and sequence numbers (segment); IP adds source and destination addresses (packet); Ethernet adds MAC addresses and an FCS (frame); the NIC sends bits. Mention that the IP header stays end to end while the Ethernet header is rewritten at every routed hop, and quote 1500-byte MTU and 1518/1522-byte frames. Bonus: say that VXLAN later wraps the whole frame again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI has 7 layers, TCP/IP has 4; engineers use OSI numbers ("L2", "L3") in daily talk.</li>
<li>PDUs: data, segment, packet, frame, bits. Switches forward frames; routers forward packets.</li>
<li>Encapsulation adds TCP (20), IP (20) and Ethernet (14 + 4 FCS) headers; a full frame is 1518 bytes, 1522 with a VLAN tag.</li>
<li>A leaf switch works at L2 and L3 together; troubleshoot from L1 upwards.</li>
<li>This module builds every foundation that spine-leaf, VXLAN EVPN and ACI rely on.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Spine-leaf fabric banane, VXLAN chalane ya ACI chhoone se pehle, aapko neeche wali classic networking par poori tarah comfortable hona chahiye: Ethernet switches frames kaise forward karte hain, VLANs aur trunks kya hain, spanning tree kyun hai (aur modern fabrics use kyun avoid karte hain), IPv4 aur IPv6 addressing, router path kaise chunta hai, OSPF aur BGP basics, MTU, link aggregation aur gateway redundancy. Har chapter Cisco Nexus (NX-OS) ke woh commands aur output dikhata hai jo aapko job par milenge, aur module ek NX-OS survival kit ke saath khatam hota hai un engineers ke liye jo IOS se aate hain.</p>
<p><b>Prerequisites.</b> Aapne data center introduction module padh liya hai, isliye aap jaante ho ki racks, servers, hypervisors aur leaf aur spine switches kya hote hain. Aap jaante ho ki IP address kaisa dikhta hai aur kisi bhi Cisco device par kuch commands type kiye hain. CCNA zaroori nahi hai; hum essentials ko zero se dobara banate hain, lekin tezi se aur data center angle ke saath.</p>

<h3>Models kyun? Ek post office analogy</h3>
<p>Socho aap videsh mein ek gift bhej rahe ho. Aap ek letter likhte ho (application data), use packing list ke saath box mein daalte ho (transport), box par destination city aur address likhte ho (network), aur local courier us par sirf agle hop ke liye ek local tracking label lagata hai (data link), phir ek truck use physically le jaata hai (physical). Har hand-off par local label badalta hai, lekin box par likha address pahunchne tak same rehta hai. Networking bilkul aise hi kaam karti hai, aur <b>layered model</b> bas har kaam ko naam dene ka ek agreed tareeka hai taaki engineers unke baare mein precisely baat kar sakein.</p>

<h3>OSI aur TCP/IP, side by side</h3>
<p><b>OSI model</b> mein saat layers hain. <b>TCP/IP model</b>, jo internet asal mein use karta hai, mein chaar hain (kuch books paanch kehti hain, neeche wali layer ko data link aur physical mein baant kar). Engineers naam freely mix karte hain: jab koi kehta hai "Layer-2 problem", to uska matlab OSI layer 2, data link hota hai.</p>
<table class="cmp"><tr><th>OSI layer</th><th>TCP/IP layer</th><th>Unit (PDU)</th><th>Data center mein</th></tr>
<tr><td>7 Application, 6 Presentation, 5 Session</td><td>Application</td><td>Data</td><td>HTTP, DNS, TLS, database protocols; load balancers aur application delivery controllers yahan kaam karte hain</td></tr>
<tr><td>4 Transport</td><td>Transport</td><td>Segment (TCP) / datagram (UDP)</td><td>TCP aur UDP ports; firewalls aur load balancers sessions track karte hain</td></tr>
<tr><td>3 Network</td><td>Internet</td><td>Packet</td><td>IPv4 aur IPv6; spine aur leaf routing, SVIs, border leaf, VRFs</td></tr>
<tr><td>2 Data link</td><td>Link</td><td>Frame</td><td>Ethernet, MAC addresses, VLANs, trunks, LACP, STP; servers ki taraf leaf switch ports</td></tr>
<tr><td>1 Physical</td><td>Link</td><td>Bits</td><td>Optics, DAC aur fibre cables, transceivers, patch panels</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layers data center devices se mapped">
<rect x="10" y="10" width="200" height="36" rx="6" fill="#fde68a"/><text x="110" y="33" text-anchor="middle" class="svg-ink" font-size="13">L7 Application</text>
<rect x="10" y="56" width="200" height="36" rx="6" fill="#fed7aa"/><text x="110" y="79" text-anchor="middle" class="svg-ink" font-size="13">L4 Transport</text>
<rect x="10" y="102" width="200" height="36" rx="6" fill="#ddd6fe"/><text x="110" y="125" text-anchor="middle" class="svg-ink" font-size="13">L3 Network</text>
<rect x="10" y="148" width="200" height="36" rx="6" fill="#bae6fd"/><text x="110" y="171" text-anchor="middle" class="svg-ink" font-size="13">L2 Data link</text>
<rect x="10" y="194" width="200" height="36" rx="6" fill="#e2e8f0"/><text x="110" y="217" text-anchor="middle" class="svg-ink" font-size="13">L1 Physical</text>
<line x1="210" y1="28" x2="300" y2="28" stroke="#64748b" stroke-width="2"/><text x="310" y="33" class="svg-muted" font-size="13">Load balancer, web server</text>
<line x1="210" y1="74" x2="300" y2="74" stroke="#64748b" stroke-width="2"/><text x="310" y="79" class="svg-muted" font-size="13">Firewall sessions, TCP/UDP ports</text>
<line x1="210" y1="120" x2="300" y2="120" stroke="#64748b" stroke-width="2"/><text x="310" y="125" class="svg-muted" font-size="13">Spine, leaf SVI, border leaf</text>
<line x1="210" y1="166" x2="300" y2="166" stroke="#64748b" stroke-width="2"/><text x="310" y="171" class="svg-muted" font-size="13">Leaf access aur trunk ports</text>
<line x1="210" y1="212" x2="300" y2="212" stroke="#64748b" stroke-width="2"/><text x="310" y="217" class="svg-muted" font-size="13">Optics, DAC, fibre, patch panel</text>
<text x="320" y="252" text-anchor="middle" class="svg-accent" font-size="12">Modern leaf switch L2 aur L3 dono par ek saath kaam karta hai</text>
</svg><p class="cap">Data center mein har layer kahan rehti hai. Layers 5 aur 6 practice mein alag se kam discuss hoti hain.</p></div>

<h3>Encapsulation: cable par asal mein kya travel karta hai</h3>
<p>Jab web server reply bhejta hai, har layer upar wali layer se mile data ke aage apna <b>header</b> jodti hai. Is lapetne ko <b>encapsulation</b> kehte hain; receiver headers ko ulte order mein hatata hai (<b>de-encapsulation</b>).</p>
<ol>
<li><b>Application data</b>: jaise ek HTTP response body.</li>
<li><b>Segment</b>: TCP 20-byte header jodta hai (source aur destination port, sequence numbers, flags).</li>
<li><b>Packet</b>: IP 20-byte IPv4 header jodta hai (source aur destination IP, TTL, protocol) ya 40-byte IPv6 header.</li>
<li><b>Frame</b>: Ethernet 14-byte header (destination MAC, source MAC, EtherType) aur 4-byte trailer jodta hai, FCS (frame check sequence), jo corruption pakadne ke liye use hota hai.</li>
<li><b>Bits</b>: NIC frame ko light ya electrical signals mein badalta hai, 8-byte preamble ke baad.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Encapsulation">
<rect x="360" y="12" width="200" height="30" rx="4" fill="#fde68a"/><text x="460" y="32" text-anchor="middle" class="svg-ink" font-size="12">Data</text>
<rect x="280" y="56" width="80" height="30" rx="4" fill="#fed7aa"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="12">TCP 20</text>
<rect x="360" y="56" width="200" height="30" rx="4" fill="#fde68a"/><text x="460" y="76" text-anchor="middle" class="svg-ink" font-size="12">Data</text>
<rect x="200" y="100" width="80" height="30" rx="4" fill="#ddd6fe"/><text x="240" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 20</text>
<rect x="280" y="100" width="280" height="30" rx="4" fill="#e2e8f0"/><text x="420" y="120" text-anchor="middle" class="svg-ink" font-size="12">Segment</text>
<rect x="100" y="144" width="100" height="30" rx="4" fill="#bae6fd"/><text x="150" y="164" text-anchor="middle" class="svg-ink" font-size="12">Eth 14</text>
<rect x="200" y="144" width="360" height="30" rx="4" fill="#e2e8f0"/><text x="380" y="164" text-anchor="middle" class="svg-ink" font-size="12">Packet</text>
<rect x="560" y="144" width="60" height="30" rx="4" fill="#bae6fd"/><text x="590" y="164" text-anchor="middle" class="svg-ink" font-size="12">FCS 4</text>
<text x="20" y="32" class="svg-muted" font-size="12">Application</text><text x="20" y="76" class="svg-muted" font-size="12">Segment</text><text x="20" y="120" class="svg-muted" font-size="12">Packet</text><text x="20" y="164" class="svg-muted" font-size="12">Frame</text>
<text x="320" y="194" text-anchor="middle" class="svg-accent" font-size="12">Har layer upar wali ko lapet-ti hai</text>
</svg><p class="cap">TCP over IPv4 over Ethernet ke header sizes bytes mein, bina options ke.</p></div>

<div class="eg"><p><b>Worked example: full-size frame kitna bada hota hai?</b> Standard Ethernet MTU 1500 bytes hai; yeh sabse bada IP packet hai jo port le jaata hai. Uske andar: 20 bytes IP + 20 bytes TCP ke baad 1460 bytes application data bachta hai (yahi TCP MSS hai). Ethernet header (14) aur FCS (4) jodo: 1500 + 18 = wire par <b>1518 bytes</b>. 802.1Q VLAN tag (4 aur bytes) ke saath yeh <b>1522</b> ho jaata hai. Yeh numbers yaad rakho; VLANs, MTU aur VXLAN mein inki zaroorat padegi, jahan poore frame ke around 50 aur bytes jodte hain.</p></div>

<h3>Data center mein yeh kyun zaroori hai</h3>
<p>Troubleshooting layer by layer hoti hai. Agar server apne database tak nahi pahunch pa raha, achha engineer order mein poochta hai: kya link up hai (L1)? Kya port sahi VLAN mein hai aur MAC learned hai (L2)? Kya leaf ke paas route aur ARP entry hai (L3)? Kya koi firewall TCP port drop kar raha hai (L4)? NX-OS par har sawaal ka ek show command hai, jo aap chapter by chapter seekhoge:</p>
<pre class="code"><span class="c">! L1 aur L2: port up hai aur kis VLAN mein?</span>
LEAF1# show interface brief
<span class="c">! L2: kaunsa MAC kahan learned hai?</span>
LEAF1# show mac address-table vlan 10
<span class="c">! L3: route aur next-hop resolution</span>
LEAF1# show ip route 10.10.20.21
LEAF1# show ip arp 10.10.20.21</pre>
<pre class="out">LEAF1# show interface brief
Ethernet      VLAN    Type Mode   Status  Reason                   Speed     Port
Interface                                                                    Ch #
Eth1/5        10      eth  access up      none                       25G(D)  --
<span class="hl">Eth1/6        20      eth  access down    Link not connected         auto(D) --</span></pre>

<h3>Aage ka raasta</h3>
<p>Chapters 2 se 4 Layer 2 cover karte hain (Ethernet, VLANs, STP). Chapters 5 se 8 Layer 3 cover karte hain (IPv4, IPv6, routing, OSPF aur BGP). Chapter 9 MTU hai, chapter 10 link aggregation aur gateway redundancy, aur chapter 11 aapka NX-OS survival kit aur exam checklist. Teen hands-on labs mein aap simulated Nexus switches par VLAN trunk, SVIs aur LACP port-channel banaoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Interview mein "frame" ki jagah "packet" bolna (switch frames forward karta hai, router packets). Yeh bhool jaana ki MTU IP packet ko count karta hai, Ethernet header ko nahi. Yeh maan lena ki "Layer 3 switch" koi exotic cheez hai: har Nexus leaf route bhi karta hai aur switch bhi.</p></div>
<div class="exam"><p><b>Exam tip.</b> PDU names (data, segment, packet, frame, bits), chaar TCP/IP layers, aur standard sizes yaad rakho: Ethernet header 14, FCS 4, 802.1Q tag 4, IPv4 header 20, IPv6 header 40, TCP 20, UDP 8.</p></div>

<div class="scn"><h4>"Network down hai" jo network tha hi nahi</h4><p>Ek application team ne P1 raise kiya: payments service apne database tak nahi pahunch pa rahi thi. On-call engineer layer by layer gaya. LEAF-07 Eth1/12 par link up tha, server ka MAC VLAN 210 mein learned tha, SVI ke paas database ki ARP entry thi, aur pings kaam kar rahe the. Server par capture se dikha ki port 5432 par TCP SYNs ka jawab resets se aa raha tha. Patch ke dauraan database server par ek naye host firewall rule ne port band kar diya tha. Network team ke paas das minute mein evidence tha kyunki unhone guess karne ki jagah L1 se L4 order mein check kiya.</p><p><b>Seekh:</b> layered method "kuch toota hai" ko ek precise, provable jawab mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Batao ki data server se nikalte waqt uske saath kya hota hai."</p><p>Strong answer: application data TCP ko deti hai, jo ports aur sequence numbers jodta hai (segment); IP source aur destination addresses jodta hai (packet); Ethernet MAC addresses aur FCS jodta hai (frame); NIC bits bhejta hai. Batao ki IP header end to end rehta hai jabki Ethernet header har routed hop par dobara likha jaata hai, aur 1500-byte MTU aur 1518/1522-byte frames quote karo. Bonus: bolo ki aage chal kar VXLAN poore frame ko phir se lapet-ta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OSI mein 7 layers, TCP/IP mein 4; engineers roz ki baat mein OSI numbers ("L2", "L3") use karte hain.</li>
<li>PDUs: data, segment, packet, frame, bits. Switches frames forward karte hain; routers packets.</li>
<li>Encapsulation TCP (20), IP (20) aur Ethernet (14 + 4 FCS) headers jodta hai; full frame 1518 bytes, VLAN tag ke saath 1522.</li>
<li>Leaf switch L2 aur L3 ek saath karta hai; L1 se upar ki taraf troubleshoot karo.</li>
<li>Yeh module har woh foundation banata hai jis par spine-leaf, VXLAN EVPN aur ACI tike hain.</li>
</ul></div>
`}};export{e as default};