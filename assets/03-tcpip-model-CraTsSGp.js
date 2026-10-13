var e={id:`tcpip`,h:{en:`The TCP/IP model and how it maps to OSI`,hi:`TCP/IP model aur OSI se uski mapping`},body:{en:`
<p>If the OSI model is the textbook description of how a restaurant should run, the TCP/IP model is the kitchen that actually serves food every night. It grew out of the US research network ARPANET in the 1970s and 1980s, it is defined in open documents called <b>RFCs</b> (Requests for Comments), and it is what every phone, laptop, router and cloud server runs today. The OSI model gave us vocabulary; TCP/IP gave us working protocols.</p>

<h3>The layers of the TCP/IP model</h3>
<p>The original standard for hosts (RFC 1122) describes <b>four layers</b>. Many textbooks, including Cisco's CCNA material, use an <b>updated five-layer</b> version that splits the bottom layer into data link and physical, so it lines up neatly with OSI.</p>
<table class="cmp"><tr><th>TCP/IP (4-layer)</th><th>TCP/IP (5-layer)</th><th>OSI layers</th><th>Example protocols</th></tr>
<tr><td>Application</td><td>Application</td><td>7, 6, 5</td><td>HTTP, HTTPS, DNS, DHCP, SSH, SMTP, SNMP, NTP</td></tr>
<tr><td>Transport</td><td>Transport</td><td>4</td><td>TCP, UDP</td></tr>
<tr><td>Internet</td><td>Network</td><td>3</td><td>IPv4, IPv6, ICMP, OSPF</td></tr>
<tr><td rowspan="2">Link (Network access)</td><td>Data link</td><td>2</td><td>Ethernet, 802.11 Wi-Fi, PPP, ARP</td></tr>
<tr><td>Physical</td><td>1</td><td>Copper, fibre, radio</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Protocol stacks on each device">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="240" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="400" y="20" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<rect x="30" y="30" width="100" height="36" rx="6" fill="#fde68a"/><text x="80" y="53" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="30" y="72" width="100" height="36" rx="6" fill="#fed7aa"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="12">Transport</text>
<rect x="30" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="30" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="80" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="190" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="240" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="350" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="350" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="400" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="510" y="30" width="100" height="36" rx="6" fill="#fde68a"/><text x="560" y="53" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="510" y="72" width="100" height="36" rx="6" fill="#fed7aa"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="12">Transport</text>
<rect x="510" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="510" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="560" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<line x1="130" y1="210" x2="510" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Hosts use every layer; a router stops at Internet, a switch stops at Link</text>
</svg><p class="cap">How deep each device reads. Only the two end hosts look at TCP and HTTP.</p></div>

<h3>What each TCP/IP layer does</h3>
<ul>
<li><b>Application layer.</b> Everything the user's software needs from the network: fetching web pages (HTTP, HTTPS), resolving names (DNS), getting an address (DHCP), remote login (SSH), email (SMTP), monitoring (SNMP), time (NTP). OSI's session and presentation jobs are done inside these protocols; for example TLS handles encryption for HTTPS.</li>
<li><b>Transport layer.</b> Picks the application with port numbers. <b>TCP</b> is connection-oriented and reliable; <b>UDP</b> is connectionless and light. Chapter 8 goes deep.</li>
<li><b>Internet layer.</b> <b>IP</b> gives every host a logical address and routers forward packets hop by hop toward the destination network. ICMP (ping, traceroute, unreachable messages) is a helper at this layer.</li>
<li><b>Link layer.</b> Moves the packet across one physical network: Ethernet framing and MAC addresses, Wi-Fi, and the physical signalling underneath.</li>
</ul>

<h3>Why TCP/IP won</h3>
<p>TCP/IP was running and free while OSI protocols were still being written by committees. Its standards were open RFCs, it came built into UNIX, and the internet grew on it. OSI survives as a teaching and troubleshooting reference; the OSI layer numbers stuck because they are more precise than TCP/IP's four names.</p>

<h3>Devices do not always fit one layer</h3>
<p>Real products blur the lines. A <b>Layer 3 switch</b> forwards frames by MAC inside a VLAN and routes packets by IP between VLANs, in hardware. A router can run a firewall, NAT (which rewrites Layer 3 and Layer 4 fields) and even DHCP (an application). A <b>next-generation firewall</b> inspects everything up to the application. When an exam asks "at which layer does X operate", answer with its <b>primary forwarding decision</b>: switch = L2 (MAC), router = L3 (IP).</p>

<div class="eg"><p><b>Worked example.</b> Map the Lab 1 conversation to TCP/IP. Application: HTTP "GET /" from PC1 and "HTTP/1.1 200 OK" from SRV. Transport: TCP, PC1 port 49875 to SRV port 80. Internet: IPv4 10.1.1.10 to 203.0.113.80, TTL 64 leaving PC1 and 63 after R1. Link: Ethernet II, first from PC1's MAC to R1 Gi0/0's MAC, then from R1 Gi0/1's MAC to SRV's MAC. Four layers, four headers, one click.</p></div>

<h3>Checking the layers from the CLI</h3>
<p>You can test each layer with a command you already know from ccna-ios:</p>
<pre class="code"><span class="c">! Link layer: is the interface up and which MAC does it own?</span>
R1# show interfaces GigabitEthernet0/0
<span class="c">! Internet layer: can I reach the far end?</span>
R1# ping 203.0.113.80
<span class="c">! Mapping between the two: which MAC belongs to which IP?</span>
R1# show ip arp</pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0
<span class="hl">GigabitEthernet0/0 is up, line protocol is up</span>
  Hardware is iGbE, address is 5254.0c04.4b01 (bia 5254.0c04.4b01)
  Description: LAN
  Internet address is 10.1.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,</pre>
<p>"Interface is up" is Layer 1 (a signal); "line protocol is up" is Layer 2 (framing works). Both must be up before any Layer 3 test can succeed.</p>

<div class="warn"><p><b>Common mistakes.</b> Saying TCP/IP has "seven layers". Forgetting that the TCP/IP application layer covers OSI 5, 6 and 7. Believing a router reads TCP ports to forward normal traffic: routing uses only the destination IP (ports matter only if you add ACLs, NAT or policy features).</p></div>

<div class="exam"><p><b>Exam traps.</b> TCP/IP's layer 3 is called <b>Internet</b>, not "Network", in the 4-layer version. The bottom layer is called <b>Link</b> or <b>Network access</b>. If a question says "TCP/IP model" and lists "Session" as an option, that option is wrong.</p></div>

<div class="scn"><h4>The firewall that "broke" DNS</h4><p>After a new firewall rule set was pushed, users could browse by IP but not by name. The rule allowed "DNS" as TCP port 53 only. Normal DNS queries use <b>UDP</b> 53 (TCP 53 is used for large replies and zone transfers). The engineer checked the transport layer in a capture, saw UDP 53 queries leaving and no replies returning, and added UDP 53. Names resolved immediately.</p><p><b>Lesson:</b> knowing which transport a protocol uses is not trivia; it decides whether your rules work.</p></div>

<div class="iv"><p class="q">"Compare the OSI and TCP/IP models. Which one do we actually use?"</p><p>Say that TCP/IP is the protocol suite the internet runs, with four layers (application, transport, internet, link), and OSI is a seven-layer reference used as vocabulary. Map them: TCP/IP application = OSI 5-7, link = OSI 1-2. Add that engineers use OSI numbers in conversation ("L2 issue", "L7 firewall") but configure TCP/IP protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP/IP layers: Application, Transport, Internet, Link (5-layer version splits Link into Data link and Physical).</li>
<li>TCP/IP application = OSI 5, 6 and 7; TCP/IP link = OSI 1 and 2.</li>
<li>End hosts process every layer; routers stop at Internet; switches stop at Link.</li>
<li>Answer "which layer" questions with the device's primary forwarding decision.</li>
<li>"Interface up" is Layer 1; "line protocol up" is Layer 2.</li>
</ul></div>
`,hi:`
<p>Agar OSI model restaurant chalane ka textbook description hai, to TCP/IP model woh kitchen hai jo sach mein har raat khana serve karta hai. Yeh 1970 aur 1980 ke dashak mein US research network ARPANET se nikla, yeh <b>RFCs</b> (Requests for Comments) naam ke open documents mein define hai, aur aaj har phone, laptop, router aur cloud server yahi chalata hai. OSI model ne humein vocabulary di; TCP/IP ne kaam karne wale protocols diye.</p>

<h3>TCP/IP model ki layers</h3>
<p>Hosts ka original standard (RFC 1122) <b>chaar layers</b> describe karta hai. Bahut saari textbooks, Cisco ke CCNA material samet, ek <b>updated five-layer</b> version use karti hain jo sabse neeche wali layer ko data link aur physical mein baant deta hai, taaki woh OSI ke saath saaf line up ho.</p>
<table class="cmp"><tr><th>TCP/IP (4-layer)</th><th>TCP/IP (5-layer)</th><th>OSI layers</th><th>Example protocols</th></tr>
<tr><td>Application</td><td>Application</td><td>7, 6, 5</td><td>HTTP, HTTPS, DNS, DHCP, SSH, SMTP, SNMP, NTP</td></tr>
<tr><td>Transport</td><td>Transport</td><td>4</td><td>TCP, UDP</td></tr>
<tr><td>Internet</td><td>Network</td><td>3</td><td>IPv4, IPv6, ICMP, OSPF</td></tr>
<tr><td rowspan="2">Link (Network access)</td><td>Data link</td><td>2</td><td>Ethernet, 802.11 Wi-Fi, PPP, ARP</td></tr>
<tr><td>Physical</td><td>1</td><td>Copper, fibre, radio</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Har device par protocol stack">
<text x="80" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="240" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1</text><text x="400" y="20" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="560" y="20" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<rect x="30" y="30" width="100" height="36" rx="6" fill="#fde68a"/><text x="80" y="53" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="30" y="72" width="100" height="36" rx="6" fill="#fed7aa"/><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="12">Transport</text>
<rect x="30" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="80" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="30" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="80" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="190" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="240" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="350" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="400" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="350" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="400" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<rect x="510" y="30" width="100" height="36" rx="6" fill="#fde68a"/><text x="560" y="53" text-anchor="middle" class="svg-ink" font-size="12">Application</text>
<rect x="510" y="72" width="100" height="36" rx="6" fill="#fed7aa"/><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="12">Transport</text>
<rect x="510" y="114" width="100" height="36" rx="6" fill="#ddd6fe"/><text x="560" y="137" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="510" y="156" width="100" height="36" rx="6" fill="#bae6fd"/><text x="560" y="179" text-anchor="middle" class="svg-ink" font-size="12">Link</text>
<line x1="130" y1="210" x2="510" y2="210" stroke="#64748b" stroke-width="2"/>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Hosts har layer use karte hain; router Internet par rukta hai, switch Link par</text>
</svg><p class="cap">Har device kitna gehra padhta hai. Sirf do end hosts TCP aur HTTP dekhte hain.</p></div>

<h3>Har TCP/IP layer kya karti hai</h3>
<ul>
<li><b>Application layer.</b> User ke software ko network se jo bhi chahiye: web pages laana (HTTP, HTTPS), names resolve karna (DNS), address lena (DHCP), remote login (SSH), email (SMTP), monitoring (SNMP), time (NTP). OSI ke session aur presentation ke kaam inhi protocols ke andar hote hain; jaise HTTPS ke liye encryption TLS sambhalta hai.</li>
<li><b>Transport layer.</b> Port numbers se application chunti hai. <b>TCP</b> connection-oriented aur reliable hai; <b>UDP</b> connectionless aur halka hai. Chapter 8 mein gehrai se.</li>
<li><b>Internet layer.</b> <b>IP</b> har host ko logical address deta hai aur routers packets ko destination network ki taraf hop by hop forward karte hain. ICMP (ping, traceroute, unreachable messages) is layer par ek helper hai.</li>
<li><b>Link layer.</b> Packet ko ek physical network ke paar le jaati hai: Ethernet framing aur MAC addresses, Wi-Fi, aur neeche ki physical signalling.</li>
</ul>

<h3>TCP/IP kyun jeeta</h3>
<p>Jab OSI protocols abhi committees mein likhe ja rahe the, TCP/IP chal raha tha aur free tha. Uske standards open RFCs the, woh UNIX mein built-in aata tha, aur internet usi par bada hua. OSI ek teaching aur troubleshooting reference ke roop mein bacha hai; OSI layer numbers isliye tike kyunki woh TCP/IP ke chaar naamon se zyada precise hain.</p>

<h3>Devices hamesha ek layer mein fit nahi hote</h3>
<p>Real products lines ko dhundhla kar dete hain. <b>Layer 3 switch</b> VLAN ke andar frames MAC se forward karta hai aur VLANs ke beech packets IP se route karta hai, hardware mein. Router firewall, NAT (jo Layer 3 aur Layer 4 fields rewrite karta hai) aur DHCP (ek application) bhi chala sakta hai. <b>Next-generation firewall</b> application tak sab kuch inspect karta hai. Jab exam pooche "X kis layer par kaam karta hai", to uske <b>primary forwarding decision</b> se jawab do: switch = L2 (MAC), router = L3 (IP).</p>

<div class="eg"><p><b>Worked example.</b> Lab 1 ki conversation ko TCP/IP par map karo. Application: PC1 se HTTP "GET /" aur SRV se "HTTP/1.1 200 OK". Transport: TCP, PC1 port 49875 se SRV port 80. Internet: IPv4 10.1.1.10 se 203.0.113.80, PC1 se nikalte hue TTL 64 aur R1 ke baad 63. Link: Ethernet II, pehle PC1 ke MAC se R1 Gi0/0 ke MAC tak, phir R1 Gi0/1 ke MAC se SRV ke MAC tak. Chaar layers, chaar headers, ek click.</p></div>

<h3>CLI se layers check karna</h3>
<p>Aap har layer ko us command se test kar sakte ho jo aap ccna-ios se jaante ho:</p>
<pre class="code"><span class="c">! Link layer: interface up hai aur uska MAC kaunsa hai?</span>
R1# show interfaces GigabitEthernet0/0
<span class="c">! Internet layer: kya main doosre end tak pahunch sakta hoon?</span>
R1# ping 203.0.113.80
<span class="c">! Dono ki mapping: kaunsa MAC kis IP ka hai?</span>
R1# show ip arp</pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0
<span class="hl">GigabitEthernet0/0 is up, line protocol is up</span>
  Hardware is iGbE, address is 5254.0c04.4b01 (bia 5254.0c04.4b01)
  Description: LAN
  Internet address is 10.1.1.1/24
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,</pre>
<p>"Interface is up" Layer 1 hai (signal); "line protocol is up" Layer 2 hai (framing kaam kar rahi hai). Koi bhi Layer 3 test safal hone se pehle dono up hone chahiye.</p>

<div class="warn"><p><b>Common galtiyan.</b> Kehna ki TCP/IP mein "saat layers" hain. Bhool jaana ki TCP/IP application layer OSI 5, 6 aur 7 ko cover karti hai. Maanna ki router normal traffic forward karne ke liye TCP ports padhta hai: routing sirf destination IP use karti hai (ports tabhi matter karte hain jab aap ACLs, NAT ya policy features jodo).</p></div>

<div class="exam"><p><b>Exam traps.</b> 4-layer version mein TCP/IP ki layer 3 ko <b>Internet</b> kehte hain, "Network" nahi. Sabse neeche wali layer ko <b>Link</b> ya <b>Network access</b> kehte hain. Agar question "TCP/IP model" kahe aur option mein "Session" ho, to woh option galat hai.</p></div>

<div class="scn"><h4>Firewall jisne DNS "tod" diya</h4><p>Naya firewall rule set push hone ke baad users IP se browse kar pa rahe the lekin name se nahi. Rule ne "DNS" ko sirf TCP port 53 ke roop mein allow kiya tha. Normal DNS queries <b>UDP</b> 53 use karti hain (TCP 53 bade replies aur zone transfers ke liye use hota hai). Engineer ne capture mein transport layer check ki, dekha ki UDP 53 queries nikal rahi thi aur replies wapas nahi aa rahe the, aur UDP 53 add kiya. Names turant resolve hone lage.</p><p><b>Seekh:</b> kaunsa protocol kaunsa transport use karta hai yeh trivia nahi hai; isi se tay hota hai ki aapke rules kaam karenge ya nahi.</p></div>

<div class="iv"><p class="q">"OSI aur TCP/IP models compare karo. Hum asal mein kaunsa use karte hain?"</p><p>Batao ki TCP/IP woh protocol suite hai jo internet chalata hai, chaar layers ke saath (application, transport, internet, link), aur OSI ek saat-layer reference hai jo vocabulary ki tarah use hota hai. Unhe map karo: TCP/IP application = OSI 5-7, link = OSI 1-2. Jodo ki engineers baatcheet mein OSI numbers use karte hain ("L2 issue", "L7 firewall") lekin configure TCP/IP protocols karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>TCP/IP layers: Application, Transport, Internet, Link (5-layer version Link ko Data link aur Physical mein baantta hai).</li>
<li>TCP/IP application = OSI 5, 6 aur 7; TCP/IP link = OSI 1 aur 2.</li>
<li>End hosts har layer process karte hain; routers Internet par rukte hain; switches Link par.</li>
<li>"Kaunsi layer" wale questions ka jawab device ke primary forwarding decision se do.</li>
<li>"Interface up" Layer 1 hai; "line protocol up" Layer 2 hai.</li>
</ul></div>
`}};export{e as default};