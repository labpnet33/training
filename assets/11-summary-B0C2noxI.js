var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with an analogy: a capture is the CCTV footage of your network. You now know where to put the cameras, how to fast-forward to the moment that matters, and how to read what you see, frame by frame. This last chapter is your revision sheet before the exam and your field card for the next outage.</p>

<h3>Can you do all of this?</h3>
<ul>
<li>Explain why a capture is ground truth and why it is local to its capture point.</li>
<li>Choose between host capture, SPAN, RSPAN, ERSPAN, a TAP and embedded packet capture, and configure a basic local SPAN session.</li>
<li>Write capture filters (<code>host</code>, <code>port</code>, <code>net</code>) and display filters (<code>ip.addr ==</code>, <code>tcp.port ==</code>, <code>arp.opcode ==</code>, <code>icmp.type ==</code>).</li>
<li>Read the packet list, the details tree and the bytes pane, and use the lab viewer's Header anatomy panel.</li>
<li>Identify an ARP request and reply, a gratuitous ARP, and the gateway MAC in a frame to a remote host (Lab 1).</li>
<li>Decode ICMP types and codes, and explain traceroute and the <code>U.U.U</code> pattern.</li>
<li>Follow a TCP handshake, sequence and acknowledgment numbers, window, retransmissions and closing.</li>
<li>Tell a RST from silence and from an ICMP unreachable, and say what each means for ACLs and firewalls (Lab 2).</li>
<li>Recognise DNS query and response with rcodes, and DHCP DORA with ports, relay and failure patterns.</li>
<li>Compare two OSPF Hellos and find area, timer, mask or authentication mismatches (Lab 3).</li>
<li>Run the eight-step capture workflow and prove a fix with a second capture.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Answer to a request and what it means">
<rect x="10" y="10" width="620" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">You sent a request. What came back?</text>
<rect x="10" y="56" width="148" height="70" rx="8" fill="#bbf7d0"/><text x="84" y="84" text-anchor="middle" class="svg-ink" font-size="13">Normal reply</text><text x="84" y="106" text-anchor="middle" class="svg-muted" font-size="12">works: look higher</text>
<rect x="167" y="56" width="148" height="70" rx="8" fill="#fed7aa"/><text x="241" y="84" text-anchor="middle" class="svg-ink" font-size="13">TCP RST</text><text x="241" y="106" text-anchor="middle" class="svg-muted" font-size="12">reached, refused</text>
<rect x="324" y="56" width="148" height="70" rx="8" fill="#fde68a"/><text x="398" y="84" text-anchor="middle" class="svg-ink" font-size="13">ICMP error</text><text x="398" y="106" text-anchor="middle" class="svg-muted" font-size="12">sender names itself</text>
<rect x="481" y="56" width="148" height="70" rx="8" fill="#ddd6fe"/><text x="555" y="84" text-anchor="middle" class="svg-ink" font-size="13">Nothing</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="12">silent drop: move</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="13">Then ask: who sent it? (source IP, port, TTL, MAC)</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">One change, one new capture, proof attached to the ticket</text>
</svg><p class="cap">The whole module on one card: the kind of answer, and who sent it.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SPAN / RSPAN / ERSPAN</dt><dd>Switch port mirroring: local, across switches in a VLAN, across a routed network in GRE.</dd>
<dt>TAP</dt><dd>Inline hardware that copies every bit of a link in both directions without loss.</dd>
<dt>EPC</dt><dd>Embedded Packet Capture, <code>monitor capture</code> on IOS XE; exports a .pcap.</dd>
<dt>Capture filter</dt><dd>BPF expression applied while recording; non-matching packets are lost.</dd>
<dt>Display filter</dt><dd>Field-based expression applied after recording; hides, never deletes.</dd>
<dt>Gratuitous ARP</dt><dd>Unsolicited ARP with sender IP = target IP; announces or checks an address.</dd>
<dt>TTL</dt><dd>Hop counter in IPv4; at 0 the router drops the packet and returns ICMP type 11.</dd>
<dt>RST</dt><dd>TCP flag that aborts or refuses a connection.</dd>
<dt>Retransmission</dt><dd>A TCP segment resent with the same sequence number after no acknowledgement.</dd>
<dt>giaddr</dt><dd>Relay agent IP in a relayed DHCP message; selects the server's pool.</dd>
<dt>Active Neighbor</dt><dd>Router IDs listed in an OSPF Hello: the neighbours this router has heard.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>EtherTypes</td><td>0x0800 IPv4, 0x0806 ARP, 0x86dd IPv6, 0x8100 802.1Q tag</td></tr>
<tr><td>ARP</td><td>Request broadcast ff:ff:ff:ff:ff:ff, opcode 1; reply unicast, opcode 2; not IP, not stopped by IP ACLs</td></tr>
<tr><td>IP protocol numbers</td><td>ICMP 1, TCP 6, UDP 17, OSPF 89</td></tr>
<tr><td>ICMP</td><td>8 echo request, 0 echo reply, 3 unreachable (0 net, 1 host, 3 port, 4 frag needed, 13 admin prohibited), 11 TTL exceeded</td></tr>
<tr><td>Default TTLs</td><td>Linux 64, Windows 128, Cisco IOS 255</td></tr>
<tr><td>TCP</td><td>SYN, SYN-ACK, ACK; FIN graceful, RST abort; window = receiver flow control</td></tr>
<tr><td>Ports</td><td>SSH 22, Telnet 23, DNS 53, DHCP 67/68, HTTP 80, HTTPS 443</td></tr>
<tr><td>DHCP</td><td>DORA; Discover and Request broadcast from 0.0.0.0; relay with <code>ip helper-address</code> on the client-facing interface</td></tr>
<tr><td>OSPF Hello</td><td>224.0.0.5, TTL 1; must match area, hello/dead, mask, auth, stub flag; RID unique; priority free</td></tr>
</table>

<h3>Cheat-sheet</h3>
<pre class="code"><span class="c">! local SPAN on a switch</span>
monitor session 1 source interface GigabitEthernet0/1 both
monitor session 1 destination interface GigabitEthernet0/24
show monitor session 1
<span class="c">! embedded packet capture (IOS XE)</span>
monitor capture CAP interface GigabitEthernet1/0/1 both
monitor capture CAP match ipv4 any any
monitor capture CAP start
monitor capture CAP stop
show monitor capture CAP buffer brief
monitor capture CAP export flash:cap1.pcap
<span class="c">! verification used in the labs</span>
show arp                               <span class="c">! on the lab PCs</span>
show interfaces GigabitEthernet0/0 | include address
show running-config | section line vty
show ip ospf interface GigabitEthernet0/0
show ip ospf neighbor
traceroute 3.3.3.3</pre>
<pre class="out">Display filters:  arp   arp.opcode == 2   icmp   icmp.type == 3   ip.addr == 10.9.9.1
                  tcp.port == 22   tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0
                  <span class="hl">tcp.flags.reset == 1   (Wireshark)   tcp.flags.rst == 1   (lab viewer)</span>
                  udp.port == 53   dns   dhcp   ospf   ospf.hello.hello_interval == 5
Capture filters:  host 10.9.9.1   net 10.5.5.0/24   tcp port 22   arp or icmp</pre>

<div class="warn"><p><b>Common mistake in the final revision.</b> Memorising ports and ICMP codes without the direction of each packet. The exam loves "which address is the source of this message": the ICMP error comes from the router or host that rejected the packet, the RST comes from the refusing host, and the gateway MAC appears in frames to remote hosts.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Echo request is 8, not 0. ARP is not blocked by IP ACLs. SPAN copies, it does not redirect. A display filter never deletes packets. OSPF priority does not need to match; OSPF MTU is checked in DBD, not Hello. <code>ip helper-address</code> belongs on the client side.</p></div>

<div class="scn"><h4>The on-call engineer's five minutes</h4><p>At 02:10 the monitoring system reports a branch router unreachable by SSH. The on-call engineer uses embedded packet capture on the head-office router toward the branch, filters on the branch management IP, and tries SSH. SYNs leave; RST, ACK comes back from the branch router, TTL 254, port 22. The path is fine, so the problem is on the device: a late-night change had replaced the vty configuration and removed <code>transport input ssh</code>. The engineer logs in through the console server, restores it, and attaches the two captures to the incident.</p><p><b>Lesson:</b> the whole module in one incident: capture point, filter, request and answer, who answered, one fix, proof.</p></div>

<div class="iv"><p class="q">"If you had one minute to explain packet capture troubleshooting to a new colleague, what would you say?"</p><p>Strong answer: capture close to the problem, filter to one conversation, and pair every request with its answer. What came back tells you the layer: a normal reply means look higher, a RST means the host refused, an ICMP error names the router or firewall that rejected it, and nothing means a silent drop, so capture further along. Always check who sent the answer, change one thing, and prove it with a second capture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Place the capture close to the symptom; capture on both sides to locate a drop.</li>
<li>Capture broadly, then narrow with display filters; watch the Displayed counter.</li>
<li>Reply, RST, ICMP error or nothing: each answer points to a different layer and device.</li>
<li>Know the numbers: EtherTypes, IP protocols, ICMP types and codes, key ports, OSPF Hello match rules.</li>
<li>One change at a time, and every fix proven with a new capture.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek analogy se shuru kiya tha: capture aapke network ki CCTV footage hai. Ab aap jaante ho ki cameras kahan lagane hain, us pal tak fast-forward kaise karna hai jo matter karta hai, aur jo dikhta hai use frame by frame kaise padhna hai. Yeh aakhri chapter exam se pehle aapki revision sheet hai aur agle outage ke liye aapka field card.</p>

<h3>Kya aap yeh sab kar sakte ho?</h3>
<ul>
<li>Samjhao ki capture ground truth kyun hai aur apne capture point tak local kyun hai.</li>
<li>Host capture, SPAN, RSPAN, ERSPAN, TAP aur embedded packet capture mein se chuno, aur basic local SPAN session configure karo.</li>
<li>Capture filters (<code>host</code>, <code>port</code>, <code>net</code>) aur display filters (<code>ip.addr ==</code>, <code>tcp.port ==</code>, <code>arp.opcode ==</code>, <code>icmp.type ==</code>) likho.</li>
<li>Packet list, details tree aur bytes pane padho, aur lab viewer ka Header anatomy panel use karo.</li>
<li>ARP request aur reply, gratuitous ARP, aur remote host ko jaane wale frame mein gateway MAC pehchaano (Lab 1).</li>
<li>ICMP types aur codes decode karo, aur traceroute aur <code>U.U.U</code> pattern samjhao.</li>
<li>TCP handshake, sequence aur acknowledgment numbers, window, retransmissions aur closing follow karo.</li>
<li>RST ko khamoshi aur ICMP unreachable se alag karo, aur batao ki har ek ka ACLs aur firewalls ke liye kya matlab hai (Lab 2).</li>
<li>Rcodes ke saath DNS query aur response, aur ports, relay aur failure patterns ke saath DHCP DORA pehchaano.</li>
<li>Do OSPF Hellos compare karo aur area, timer, mask ya authentication mismatch dhoondho (Lab 3).</li>
<li>Aath-step capture workflow chalao aur dusre capture se fix prove karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Request ka jawab aur uska matlab">
<rect x="10" y="10" width="620" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Aapne request bheji. Wapas kya aaya?</text>
<rect x="10" y="56" width="148" height="70" rx="8" fill="#bbf7d0"/><text x="84" y="84" text-anchor="middle" class="svg-ink" font-size="13">Normal reply</text><text x="84" y="106" text-anchor="middle" class="svg-muted" font-size="12">chalta hai: upar dekho</text>
<rect x="167" y="56" width="148" height="70" rx="8" fill="#fed7aa"/><text x="241" y="84" text-anchor="middle" class="svg-ink" font-size="13">TCP RST</text><text x="241" y="106" text-anchor="middle" class="svg-muted" font-size="12">pahuncha, mana hua</text>
<rect x="324" y="56" width="148" height="70" rx="8" fill="#fde68a"/><text x="398" y="84" text-anchor="middle" class="svg-ink" font-size="13">ICMP error</text><text x="398" y="106" text-anchor="middle" class="svg-muted" font-size="12">bhejne wala khud batata</text>
<rect x="481" y="56" width="148" height="70" rx="8" fill="#ddd6fe"/><text x="555" y="84" text-anchor="middle" class="svg-ink" font-size="13">Kuch nahi</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="12">silent drop: aage jao</text>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="13">Phir poocho: kisne bheja? (source IP, port, TTL, MAC)</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Ek change, ek naya capture, proof ticket mein attach</text>
</svg><p class="cap">Poora module ek card par: jawab kis tarah ka hai, aur kisne bheja.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SPAN / RSPAN / ERSPAN</dt><dd>Switch port mirroring: local, VLAN mein switches ke paar, GRE mein routed network ke paar.</dd>
<dt>TAP</dt><dd>Inline hardware jo link ke har bit ko dono directions mein bina loss ke copy karta hai.</dd>
<dt>EPC</dt><dd>Embedded Packet Capture, IOS XE par <code>monitor capture</code>; .pcap export karta hai.</dd>
<dt>Capture filter</dt><dd>Recording ke dauraan laga BPF expression; non-matching packets kho jaate hain.</dd>
<dt>Display filter</dt><dd>Recording ke baad laga field-based expression; chhupata hai, kabhi delete nahi karta.</dd>
<dt>Gratuitous ARP</dt><dd>Bina maange ARP jismein sender IP = target IP; address announce ya check karta hai.</dd>
<dt>TTL</dt><dd>IPv4 ka hop counter; 0 par router packet drop karke ICMP type 11 lautata hai.</dd>
<dt>RST</dt><dd>TCP flag jo connection abort ya refuse karta hai.</dd>
<dt>Retransmission</dt><dd>Acknowledgement na milne par same sequence number ke saath dobara bheja TCP segment.</dd>
<dt>giaddr</dt><dd>Relayed DHCP message mein relay agent IP; server ka pool chunta hai.</dd>
<dt>Active Neighbor</dt><dd>OSPF Hello mein list router IDs: woh neighbours jinhe is router ne suna hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>EtherTypes</td><td>0x0800 IPv4, 0x0806 ARP, 0x86dd IPv6, 0x8100 802.1Q tag</td></tr>
<tr><td>ARP</td><td>Request broadcast ff:ff:ff:ff:ff:ff, opcode 1; reply unicast, opcode 2; IP nahi, IP ACLs se nahi rukta</td></tr>
<tr><td>IP protocol numbers</td><td>ICMP 1, TCP 6, UDP 17, OSPF 89</td></tr>
<tr><td>ICMP</td><td>8 echo request, 0 echo reply, 3 unreachable (0 net, 1 host, 3 port, 4 frag needed, 13 admin prohibited), 11 TTL exceeded</td></tr>
<tr><td>Default TTLs</td><td>Linux 64, Windows 128, Cisco IOS 255</td></tr>
<tr><td>TCP</td><td>SYN, SYN-ACK, ACK; FIN graceful, RST abort; window = receiver flow control</td></tr>
<tr><td>Ports</td><td>SSH 22, Telnet 23, DNS 53, DHCP 67/68, HTTP 80, HTTPS 443</td></tr>
<tr><td>DHCP</td><td>DORA; Discover aur Request 0.0.0.0 se broadcast; client-facing interface par <code>ip helper-address</code> se relay</td></tr>
<tr><td>OSPF Hello</td><td>224.0.0.5, TTL 1; match zaroori area, hello/dead, mask, auth, stub flag; RID unique; priority free</td></tr>
</table>

<h3>Cheat-sheet</h3>
<pre class="code"><span class="c">! switch par local SPAN</span>
monitor session 1 source interface GigabitEthernet0/1 both
monitor session 1 destination interface GigabitEthernet0/24
show monitor session 1
<span class="c">! embedded packet capture (IOS XE)</span>
monitor capture CAP interface GigabitEthernet1/0/1 both
monitor capture CAP match ipv4 any any
monitor capture CAP start
monitor capture CAP stop
show monitor capture CAP buffer brief
monitor capture CAP export flash:cap1.pcap
<span class="c">! labs mein use hui verification</span>
show arp                               <span class="c">! lab PCs par</span>
show interfaces GigabitEthernet0/0 | include address
show running-config | section line vty
show ip ospf interface GigabitEthernet0/0
show ip ospf neighbor
traceroute 3.3.3.3</pre>
<pre class="out">Display filters:  arp   arp.opcode == 2   icmp   icmp.type == 3   ip.addr == 10.9.9.1
                  tcp.port == 22   tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 0
                  <span class="hl">tcp.flags.reset == 1   (Wireshark)   tcp.flags.rst == 1   (lab viewer)</span>
                  udp.port == 53   dns   dhcp   ospf   ospf.hello.hello_interval == 5
Capture filters:  host 10.9.9.1   net 10.5.5.0/24   tcp port 22   arp or icmp</pre>

<div class="warn"><p><b>Final revision ki common galti.</b> Ports aur ICMP codes ratna lekin har packet ki direction nahi. Exam ko "is message ka source address kaunsa hai" bahut pasand hai: ICMP error us router ya host se aata hai jisne packet reject kiya, RST refuse karne wale host se aata hai, aur remote hosts ko jaane wale frames mein gateway MAC dikhta hai.</p></div>

<div class="exam"><p><b>Exam traps ka round-up.</b> Echo request 8 hai, 0 nahi. ARP IP ACLs se block nahi hota. SPAN copy karta hai, redirect nahi. Display filter kabhi packets delete nahi karta. OSPF priority match hona zaroori nahi; OSPF MTU DBD mein check hota hai, Hello mein nahi. <code>ip helper-address</code> client side par lagta hai.</p></div>

<div class="scn"><h4>On-call engineer ke paanch minute</h4><p>Raat 02:10 par monitoring system report karta hai ki ek branch router SSH se unreachable hai. On-call engineer head-office router par branch ki taraf embedded packet capture use karta hai, branch management IP par filter karta hai, aur SSH try karta hai. SYNs nikalte hain; branch router se RST, ACK wapas aata hai, TTL 254, port 22. Path theek hai, to problem device par hai: raat ke ek change ne vty configuration badal di thi aur <code>transport input ssh</code> hata diya tha. Engineer console server se login karke use restore karta hai, aur dono captures incident mein attach karta hai.</p><p><b>Seekh:</b> poora module ek incident mein: capture point, filter, request aur jawab, kisne jawab diya, ek fix, proof.</p></div>

<div class="iv"><p class="q">"Agar aapke paas naye colleague ko packet capture troubleshooting samjhane ke liye ek minute ho, to kya kahoge?"</p><p>Strong answer: problem ke paas capture karo, ek baatcheet tak filter karo, aur har request ko uske jawab se jodo. Jo wapas aaya woh layer batata hai: normal reply matlab upar dekho, RST matlab host ne mana kiya, ICMP error us router ya firewall ka naam batata hai jisne reject kiya, aur kuch nahi matlab silent drop, to aage capture karo. Hamesha check karo jawab kisne bheja, ek cheez badlo, aur dusre capture se prove karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Capture symptom ke paas lagao; drop locate karne ke liye dono sides par capture karo.</li>
<li>Broad capture karo, phir display filters se narrow karo; Displayed counter dekhte raho.</li>
<li>Reply, RST, ICMP error ya kuch nahi: har jawab alag layer aur device ki taraf ishara karta hai.</li>
<li>Numbers jaano: EtherTypes, IP protocols, ICMP types aur codes, key ports, OSPF Hello match rules.</li>
<li>Ek baar mein ek change, aur har fix naye capture se proven.</li>
</ul></div>
`}};export{e as default};