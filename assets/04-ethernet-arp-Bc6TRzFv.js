var e={id:`ethernet-arp`,h:{en:`Ethernet and ARP on the wire (Lab 1)`,hi:`Wire par Ethernet aur ARP (Lab 1)`},body:{en:`
<p>A new student walks into a classroom and needs to return a pen to "Riya", but has no idea which face is Riya. So she stands at the door and asks loudly, "Who is Riya? I am Asha." Everybody hears the question. Only Riya answers, and she walks straight over to Asha instead of shouting back to the whole room. That is <b>ARP</b>: a broadcast question, a unicast answer.</p>

<h3>The Ethernet II header: three fields</h3>
<p>Every frame in the packet details tree starts with <b>Ethernet II</b>, which is only 14 bytes:</p>
<dl class="terms">
<dt>Destination MAC (6 bytes)</dt><dd>Who should receive the frame on this segment. <code>ff:ff:ff:ff:ff:ff</code> is the broadcast address: every host in the VLAN must read the frame.</dd>
<dt>Source MAC (6 bytes)</dt><dd>The interface that put the frame on this segment. It changes at every router hop; the IP addresses do not.</dd>
<dt>EtherType (2 bytes)</dt><dd>What is inside: <code>0x0800</code> IPv4, <code>0x0806</code> ARP, <code>0x86dd</code> IPv6. A value of <code>0x8100</code> means an 802.1Q VLAN tag follows, which you normally see only on trunk links.</dd>
</dl>
<p>You will also notice that tiny frames such as ARP are shown as 60 bytes with <b>Padding</b>: Ethernet has a 64-byte minimum, and the 4-byte FCS (the checksum at the end) is usually not captured.</p>

<h3>ARP: the fields that matter</h3>
<p><b>ARP</b> (Address Resolution Protocol) finds the MAC address that belongs to an IPv4 address on the local segment. It is carried directly in Ethernet (EtherType 0x0806), not inside IP. Expand it in the details pane and you will see:</p>
<table class="cmp"><tr><th>Field</th><th>ARP request</th><th>ARP reply</th></tr>
<tr><td>Ethernet destination</td><td><b>ff:ff:ff:ff:ff:ff</b> (broadcast)</td><td>The asker's MAC (unicast)</td></tr>
<tr><td>Opcode</td><td><b>request (1)</b></td><td><b>reply (2)</b></td></tr>
<tr><td>Sender MAC / IP</td><td>Asker's MAC and IP</td><td>Answerer's MAC and IP (the answer)</td></tr>
<tr><td>Target MAC / IP</td><td>00:00:00:00:00:00 / the IP being looked up</td><td>Asker's MAC and IP</td></tr>
<tr><td>Info column</td><td>Who has 10.5.5.12? Tell 10.5.5.11</td><td>10.5.5.12 is at 52:54:00:…</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ARP then ping sequence">
<rect x="40" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="480" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 ARP request, dst ff:ff:ff:ff:ff:ff, opcode 1</text>
<line x1="540" y1="115" x2="100" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">2 ARP reply, unicast, opcode 2</text>
<line x1="100" y1="160" x2="540" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="153" text-anchor="middle" class="svg-accent" font-size="12">3 ICMP echo request (type 8)</text>
<line x1="540" y1="205" x2="100" y2="205" stroke="#64748b" stroke-width="2"/><text x="320" y="198" text-anchor="middle" class="svg-accent" font-size="12">4 ICMP echo reply (type 0)</text>
</svg><p class="cap">The first ping to a new neighbour always starts with an ARP exchange. The second ping does not: the MAC is cached.</p></div>

<h3>Lab 1 walkthrough: what the capture shows</h3>
<p>Lab 1 has PC1 (10.5.5.11/24), a new PC2, switch SW1 and gateway R1 (Gi0/0 10.5.5.1, loopback 192.0.2.1). Open <b>Capture packets</b>, choose <code>PC1 eth0 ↔ SW1 Gi0/1</code>, and work through it:</p>
<pre class="code"><span class="c">! 1. give PC2 its address (it announces itself with a gratuitous ARP)</span>
PC2&gt; ip 10.5.5.12/24 10.5.5.1
<span class="c">! 2. first ping to the neighbour, display filter: arp || icmp</span>
PC1&gt; ping 10.5.5.12
<span class="c">! 3. check the cache and compare with PC2's real MAC</span>
PC1&gt; show arp
PC2&gt; show ip</pre>
<p>In the list you should see: the gratuitous ARP from PC2 (it also reaches PC1's link because broadcasts are flooded), then PC1's <b>ARP request</b> to <code>ff:ff:ff:ff:ff:ff</code> with opcode 1, then PC2's <b>ARP reply</b> with opcode 2, unicast to PC1, then echo requests and replies. The answers to tasks 3 and 4 are exactly those two fields: destination <b>broadcast</b> and opcode <b>2</b>.</p>
<pre class="out">PC1&gt; show arp
<span class="hl">52:54:00:5c:31:02  10.5.5.12 expires in 118 seconds</span></pre>
<p>Compare the MAC with the one PC2 shows in <code>show ip</code>; the MACs in your lab may differ from this example, but the two must match each other.</p>

<h3>Remote destinations: ARP for the gateway</h3>
<p>Now ping R1's loopback, <code>PC1&gt; ping 192.0.2.1</code>. PC1 compares 192.0.2.1 with its own network 10.5.5.0/24, sees it is <b>remote</b>, and sends the packet to its default gateway. So the ARP (if not cached) is "Who has 10.5.5.1?", and the echo request on the PC1-SW1 link carries:</p>
<pre class="out">Ethernet II, Src: PC1, Dst: R1 Gi0/0
    <span class="hl">Destination: 52:54:0c:04:4b:01</span>
Internet Protocol Version 4, Src: 10.5.5.11, <span class="hl">Dst: 192.0.2.1</span></pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0 | include address
  Hardware is iGbE, <span class="hl">address is 5254.0c04.4b01</span> (bia 5254.0c04.4b01)
  Internet address is 10.5.5.1/24</pre>
<p>The golden rule: <b>the destination IP is the final host, the destination MAC is the next hop</b>. The same MAC written as <code>5254.0c04.4b01</code> (Cisco) and <code>52:54:0c:04:4b:01</code> (Wireshark) is one address in two notations.</p>

<h3>Gratuitous ARP</h3>
<p>A <b>gratuitous ARP</b> is an ARP that nobody asked for: the sender IP and target IP are the <b>same</b>, and it is broadcast. Hosts send it when an address is configured or an interface comes up, to announce "this IP is now at this MAC" so neighbours update their caches, and to detect a duplicate address (if someone replies, the IP is already in use). Redundancy protocols such as HSRP use it after a failover so the switches and hosts learn the new active gateway's MAC immediately.</p>

<h3>ARP failure signatures</h3>
<table class="cmp"><tr><th>You see</th><th>Likely meaning</th></tr>
<tr><td>ARP requests repeating every second, no reply</td><td>Target is down, in another VLAN, has a different subnet, or the IP typed as the gateway is wrong</td></tr>
<tr><td>A host ARPs for a remote server's IP directly</td><td>Wrong subnet mask on the host (it thinks the server is local)</td></tr>
<tr><td>Two different MACs reply for the same IP</td><td>Duplicate IP address, or ARP spoofing (see Dynamic ARP Inspection in the Layer 2 security module)</td></tr>
<tr><td>ARP reply seen, but pings still fail</td><td>Layer 2 is fine; look higher: host firewall, ACL, return route</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Expecting the echo request to a remote host to carry that host's MAC. A PC never learns a remote host's MAC; it only needs the gateway's. If you see a PC sending ARP requests for an off-subnet address, check its mask before anything else.</p></div>

<div class="exam"><p><b>Exam trap.</b> ARP is not an IP packet, so an IP access list on the router cannot block it. Questions that list "an ACL blocking ICMP" as a reason for missing ARP replies are wrong answers. ARP request = broadcast, opcode 1; ARP reply = unicast, opcode 2.</p></div>

<div class="scn"><h4>The printer that stole the gateway</h4><p>Users on one floor lost internet access every few minutes. A capture on a user port showed normal ARP replies for the gateway 10.20.0.1 from the router's MAC, then, a few seconds later, gratuitous ARPs claiming 10.20.0.1 from a different MAC. That MAC belonged to a new printer that had been given the gateway's address by mistake. Each gratuitous ARP rewrote the hosts' caches, sending their traffic to the printer. Fixing the printer's IP ended the outage; the team later enabled DHCP snooping and Dynamic ARP Inspection.</p><p><b>Lesson:</b> when one IP answers from two MACs, you have a duplicate address or spoofing. The capture shows both MACs side by side.</p></div>

<div class="iv"><p class="q">"Walk me through what happens on the wire the first time a PC pings a host in another subnet."</p><p>Strong answer: the PC sees the destination is not in its subnet, so it needs the default gateway's MAC. If it is not cached, it broadcasts an ARP request (opcode 1, destination ff:ff:ff:ff:ff:ff) for the gateway IP; the router replies unicast (opcode 2). The PC then sends an ICMP echo request with the gateway's MAC as destination MAC and the remote host's IP as destination IP. The router rewrites the MACs at each hop; the IPs stay the same.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet II = destination MAC, source MAC, EtherType (0x0800 IPv4, 0x0806 ARP, 0x86dd IPv6).</li>
<li>ARP request: broadcast, opcode 1. ARP reply: unicast, opcode 2.</li>
<li>For a remote destination, the frame carries the gateway's MAC and the remote host's IP.</li>
<li>Gratuitous ARP has sender IP = target IP and announces or checks an address.</li>
<li>Repeated requests with no reply point to a down, misplaced or misaddressed target; two MACs for one IP point to a duplicate or spoofing.</li>
</ul></div>
`,hi:`
<p>Ek nayi student classroom mein aati hai aur use "Riya" ko pen wapas karna hai, lekin use pata nahi ki Riya kaunsi hai. To woh darwaze par khadi hokar zor se poochti hai, "Riya kaun hai? Main Asha hoon." Sab log sawaal sunte hain. Sirf Riya jawab deti hai, aur poori class ko chilla kar jawab dene ke bajaye seedhi Asha ke paas chali jaati hai. Yahi <b>ARP</b> hai: broadcast sawaal, unicast jawab.</p>

<h3>Ethernet II header: teen fields</h3>
<p>Packet details tree mein har frame <b>Ethernet II</b> se shuru hota hai, jo sirf 14 bytes ka hai:</p>
<dl class="terms">
<dt>Destination MAC (6 bytes)</dt><dd>Is segment par frame kise milna chahiye. <code>ff:ff:ff:ff:ff:ff</code> broadcast address hai: VLAN ke har host ko frame padhna padta hai.</dd>
<dt>Source MAC (6 bytes)</dt><dd>Kis interface ne frame is segment par daala. Yeh har router hop par badalta hai; IP addresses nahi badalte.</dd>
<dt>EtherType (2 bytes)</dt><dd>Andar kya hai: <code>0x0800</code> IPv4, <code>0x0806</code> ARP, <code>0x86dd</code> IPv6. <code>0x8100</code> ka matlab hai uske baad 802.1Q VLAN tag hai, jo aam taur par sirf trunk links par dikhta hai.</dd>
</dl>
<p>Aap yeh bhi notice karoge ki ARP jaise chhote frames 60 bytes ke dikhte hain <b>Padding</b> ke saath: Ethernet ka minimum 64 bytes hai, aur 4-byte FCS (end ka checksum) aam taur par capture nahi hota.</p>

<h3>ARP: jo fields matter karte hain</h3>
<p><b>ARP</b> (Address Resolution Protocol) local segment par ek IPv4 address ka MAC address dhoondhta hai. Yeh seedha Ethernet mein jaata hai (EtherType 0x0806), IP ke andar nahi. Details pane mein expand karo to yeh dikhega:</p>
<table class="cmp"><tr><th>Field</th><th>ARP request</th><th>ARP reply</th></tr>
<tr><td>Ethernet destination</td><td><b>ff:ff:ff:ff:ff:ff</b> (broadcast)</td><td>Poochne wale ka MAC (unicast)</td></tr>
<tr><td>Opcode</td><td><b>request (1)</b></td><td><b>reply (2)</b></td></tr>
<tr><td>Sender MAC / IP</td><td>Poochne wale ka MAC aur IP</td><td>Jawab dene wale ka MAC aur IP (yahi jawab hai)</td></tr>
<tr><td>Target MAC / IP</td><td>00:00:00:00:00:00 / jo IP dhoondha ja raha hai</td><td>Poochne wale ka MAC aur IP</td></tr>
<tr><td>Info column</td><td>Who has 10.5.5.12? Tell 10.5.5.11</td><td>10.5.5.12 is at 52:54:00:…</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="ARP phir ping ka sequence">
<rect x="40" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="100" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC1 .11</text>
<rect x="480" y="10" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="540" y="32" text-anchor="middle" class="svg-ink" font-size="13">PC2 .12</text>
<line x1="100" y1="44" x2="100" y2="240" stroke="#64748b" stroke-width="1.5"/><line x1="540" y1="44" x2="540" y2="240" stroke="#64748b" stroke-width="1.5"/>
<line x1="100" y1="75" x2="540" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 ARP request, dst ff:ff:ff:ff:ff:ff, opcode 1</text>
<line x1="540" y1="115" x2="100" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">2 ARP reply, unicast, opcode 2</text>
<line x1="100" y1="160" x2="540" y2="160" stroke="#64748b" stroke-width="2"/><text x="320" y="153" text-anchor="middle" class="svg-accent" font-size="12">3 ICMP echo request (type 8)</text>
<line x1="540" y1="205" x2="100" y2="205" stroke="#64748b" stroke-width="2"/><text x="320" y="198" text-anchor="middle" class="svg-accent" font-size="12">4 ICMP echo reply (type 0)</text>
</svg><p class="cap">Naye neighbour ko pehla ping hamesha ARP exchange se shuru hota hai. Dusra ping nahi: MAC cache mein hai.</p></div>

<h3>Lab 1 walkthrough: capture kya dikhata hai</h3>
<p>Lab 1 mein PC1 (10.5.5.11/24), naya PC2, switch SW1 aur gateway R1 (Gi0/0 10.5.5.1, loopback 192.0.2.1) hain. <b>Capture packets</b> kholo, <code>PC1 eth0 ↔ SW1 Gi0/1</code> chuno, aur step by step karo:</p>
<pre class="code"><span class="c">! 1. PC2 ko address do (woh gratuitous ARP se khud ko announce karta hai)</span>
PC2&gt; ip 10.5.5.12/24 10.5.5.1
<span class="c">! 2. neighbour ko pehla ping, display filter: arp || icmp</span>
PC1&gt; ping 10.5.5.12
<span class="c">! 3. cache check karo aur PC2 ke asli MAC se compare karo</span>
PC1&gt; show arp
PC2&gt; show ip</pre>
<p>List mein aapko dikhna chahiye: PC2 ka gratuitous ARP (yeh PC1 ke link par bhi aata hai kyunki broadcasts flood hote hain), phir PC1 ki <b>ARP request</b> <code>ff:ff:ff:ff:ff:ff</code> ko opcode 1 ke saath, phir PC2 ka <b>ARP reply</b> opcode 2 ke saath, PC1 ko unicast, phir echo requests aur replies. Tasks 3 aur 4 ke jawab bilkul yahi do fields hain: destination <b>broadcast</b> aur opcode <b>2</b>.</p>
<pre class="out">PC1&gt; show arp
<span class="hl">52:54:00:5c:31:02  10.5.5.12 expires in 118 seconds</span></pre>
<p>Is MAC ko PC2 ke <code>show ip</code> wale MAC se compare karo; aapki lab ke MACs is example se alag ho sakte hain, lekin dono aapas mein match hone chahiye.</p>

<h3>Remote destinations: gateway ke liye ARP</h3>
<p>Ab R1 ka loopback ping karo, <code>PC1&gt; ping 192.0.2.1</code>. PC1 192.0.2.1 ko apne network 10.5.5.0/24 se compare karta hai, dekhta hai ki yeh <b>remote</b> hai, aur packet apne default gateway ko bhejta hai. To ARP (agar cache mein nahi hai) "Who has 10.5.5.1?" hota hai, aur PC1-SW1 link par echo request mein hota hai:</p>
<pre class="out">Ethernet II, Src: PC1, Dst: R1 Gi0/0
    <span class="hl">Destination: 52:54:0c:04:4b:01</span>
Internet Protocol Version 4, Src: 10.5.5.11, <span class="hl">Dst: 192.0.2.1</span></pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0 | include address
  Hardware is iGbE, <span class="hl">address is 5254.0c04.4b01</span> (bia 5254.0c04.4b01)
  Internet address is 10.5.5.1/24</pre>
<p>Golden rule: <b>destination IP final host hai, destination MAC next hop hai</b>. <code>5254.0c04.4b01</code> (Cisco) aur <code>52:54:0c:04:4b:01</code> (Wireshark) ek hi address ke do notations hain.</p>

<h3>Gratuitous ARP</h3>
<p><b>Gratuitous ARP</b> woh ARP hai jo kisi ne maanga nahi: sender IP aur target IP <b>same</b> hote hain, aur yeh broadcast hota hai. Hosts ise tab bhejte hain jab address configure hota hai ya interface up hota hai, taaki announce karein "yeh IP ab is MAC par hai" aur neighbours apni cache update karein, aur duplicate address detect karein (agar koi reply kare, to IP pehle se use mein hai). HSRP jaise redundancy protocols failover ke baad ise use karte hain taaki switches aur hosts naye active gateway ka MAC turant seekh lein.</p>

<h3>ARP failure ki pehchaan</h3>
<table class="cmp"><tr><th>Dikhta hai</th><th>Likely matlab</th></tr>
<tr><td>ARP requests har second repeat, koi reply nahi</td><td>Target down hai, dusre VLAN mein hai, uska subnet alag hai, ya gateway ke roop mein type kiya IP galat hai</td></tr>
<tr><td>Host remote server ke IP ke liye seedha ARP karta hai</td><td>Host par galat subnet mask (woh sochta hai server local hai)</td></tr>
<tr><td>Ek IP ke liye do alag MACs reply karte hain</td><td>Duplicate IP address, ya ARP spoofing (Layer 2 security module mein Dynamic ARP Inspection dekho)</td></tr>
<tr><td>ARP reply dikha, phir bhi pings fail</td><td>Layer 2 theek hai; upar dekho: host firewall, ACL, return route</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Yeh umeed karna ki remote host ko jaane wali echo request mein us host ka MAC hoga. PC kabhi remote host ka MAC nahi seekhta; use sirf gateway ka chahiye. Agar PC off-subnet address ke liye ARP requests bhej raha hai, to sabse pehle uska mask check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> ARP IP packet nahi hai, isliye router par IP access list use block nahi kar sakti. Jo sawaal missing ARP replies ki wajah "ICMP block karne wala ACL" batate hain, woh galat options hain. ARP request = broadcast, opcode 1; ARP reply = unicast, opcode 2.</p></div>

<div class="scn"><h4>Woh printer jisne gateway chura liya</h4><p>Ek floor ke users har kuch minute mein internet access kho dete the. User port par capture mein gateway 10.20.0.1 ke liye router ke MAC se normal ARP replies dikhe, phir kuch seconds baad ek alag MAC se 10.20.0.1 claim karne wale gratuitous ARPs. Woh MAC ek naye printer ka tha jise galti se gateway ka address de diya gaya tha. Har gratuitous ARP hosts ki cache overwrite kar deta tha, aur unka traffic printer ko jaane lagta tha. Printer ka IP theek karne se outage khatam hua; team ne baad mein DHCP snooping aur Dynamic ARP Inspection enable kiya.</p><p><b>Seekh:</b> jab ek IP do MACs se jawab de, to duplicate address ya spoofing hai. Capture dono MACs saath saath dikhata hai.</p></div>

<div class="iv"><p class="q">"Jab PC pehli baar dusre subnet ke host ko ping karta hai, to wire par kya hota hai, samjhao."</p><p>Strong answer: PC dekhta hai ki destination uske subnet mein nahi hai, isliye use default gateway ka MAC chahiye. Agar cache mein nahi hai, to woh gateway IP ke liye ARP request broadcast karta hai (opcode 1, destination ff:ff:ff:ff:ff:ff); router unicast reply karta hai (opcode 2). Phir PC ICMP echo request bhejta hai jismein destination MAC gateway ka MAC hai aur destination IP remote host ka IP. Router har hop par MACs rewrite karta hai; IPs same rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ethernet II = destination MAC, source MAC, EtherType (0x0800 IPv4, 0x0806 ARP, 0x86dd IPv6).</li>
<li>ARP request: broadcast, opcode 1. ARP reply: unicast, opcode 2.</li>
<li>Remote destination ke liye frame mein gateway ka MAC aur remote host ka IP hota hai.</li>
<li>Gratuitous ARP mein sender IP = target IP hota hai aur yeh address announce ya check karta hai.</li>
<li>Bina reply ke baar baar requests down, galat jagah ya galat address wale target ki taraf ishara karti hain; ek IP ke do MACs duplicate ya spoofing ki taraf.</li>
</ul></div>
`}};export{e as default};