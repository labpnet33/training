var e={id:`encapsulation`,h:{en:`Encapsulation hop by hop: following one ping through the layers`,hi:`Hop by hop encapsulation: ek ping ko layers ke through follow karna`},body:{en:`
<p>In net-start you learned encapsulation as "envelopes inside envelopes". Now we make it exact, with real addresses, real header values and the commands from the lab <b>Follow a ping through the layers</b>. The single most important sentence in this chapter: <b>IP addresses stay the same end to end; MAC addresses change at every router hop; TTL goes down by one at every router.</b></p>

<h3>Encapsulation and decapsulation, precisely</h3>
<p>On the <b>sender</b>, each layer takes the PDU from the layer above and adds its own header (and Layer 2 also adds a trailer, the FCS). That is <b>encapsulation</b>. On the <b>receiver</b>, each layer reads and removes its own header and passes the rest up. That is <b>decapsulation</b>. A device in the middle only goes as high as it needs to: a switch decapsulates to Layer 2, a router to Layer 3, a firewall or load balancer to Layer 4 or 7.</p>

<h3>The lab network</h3>
<p>PC1 is 10.0.10.10/24 with default gateway 10.0.10.1. It connects to SW1, which connects to R1 GigabitEthernet0/0 (10.0.10.1/24). R1 GigabitEthernet0/1 (10.0.20.1/24) connects to SRV (10.0.20.10/24, gateway 10.0.20.1).</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Headers on each hop from PC1 to SRV">
<rect x="10" y="20" width="90" height="36" rx="6" fill="#bae6fd"/><text x="55" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="170" y="20" width="90" height="36" rx="6" fill="#e2e8f0"/><text x="215" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="330" y="20" width="90" height="36" rx="6" fill="#fde68a"/><text x="375" y="43" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="530" y="20" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="575" y="43" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="100" y1="38" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="260" y1="38" x2="330" y2="38" stroke="#64748b" stroke-width="2"/><line x1="420" y1="38" x2="530" y2="38" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="80" width="400" height="70" rx="6" fill="#ddd6fe"/>
<text x="210" y="100" text-anchor="middle" class="svg-ink" font-size="12">Hop 1 frame: src MAC PC1, dst MAC R1 Gi0/0</text>
<text x="210" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 10.0.10.10 to 10.0.20.10</text>
<text x="210" y="140" text-anchor="middle" class="svg-accent" font-size="12">TTL 64</text>
<rect x="420" y="80" width="210" height="70" rx="6" fill="#fed7aa"/>
<text x="525" y="100" text-anchor="middle" class="svg-ink" font-size="12">Hop 2: src R1 Gi0/1, dst SRV</text>
<text x="525" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 10.0.10.10 to 10.0.20.10</text>
<text x="525" y="140" text-anchor="middle" class="svg-accent" font-size="12">TTL 63</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Same IP addresses on both hops. New MAC addresses after R1.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">SW1 does not change the frame; it only reads the destination MAC.</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">The reply comes back with TTL 64 from SRV and arrives at PC1 as 63.</text>
</svg><p class="cap">The switch forwards the frame unchanged. The router removes the frame, updates the IP header (TTL, checksum) and builds a new frame.</p></div>

<h3>Step by step</h3>
<ol>
<li><b>PC1 decides local or remote.</b> It compares 10.0.20.10 with its own network 10.0.10.0/24 using its mask. Different network, so the packet must go to the default gateway 10.0.10.1.</li>
<li><b>PC1 builds the ICMP echo and the IP packet.</b> Source 10.0.10.10, destination 10.0.20.10, Protocol 1 (ICMP), TTL 64.</li>
<li><b>PC1 needs the gateway's MAC.</b> Not in its ARP cache, so it broadcasts an ARP request "who has 10.0.10.1?" (destination MAC FF:FF:FF:FF:FF:FF, EtherType 0x0806). R1 answers with the MAC of Gi0/0 in a unicast ARP reply. PC1 caches it.</li>
<li><b>PC1 frames the packet.</b> Destination MAC = R1 Gi0/0, source MAC = PC1, EtherType 0x0800, then the FCS.</li>
<li><b>SW1 forwards.</b> It learns PC1's MAC on its port, looks up the destination MAC and sends the frame out of the port toward R1. The frame is not modified.</li>
<li><b>R1 decapsulates to Layer 3.</b> It checks the FCS, removes the frame, looks up 10.0.20.10 in its routing table (connected, out Gi0/1), decrements TTL to 63 and recalculates the IP header checksum.</li>
<li><b>R1 re-encapsulates.</b> It ARPs for 10.0.20.10 on Gi0/1 if needed, then builds a <b>new</b> frame: source MAC R1 Gi0/1, destination MAC SRV.</li>
<li><b>SRV decapsulates all the way up</b>, sees an ICMP echo request, and replies with its own packet (TTL 64), which follows the same process in reverse.</li>
</ol>

<h3>Proving it in the lab</h3>
<pre class="code"><span class="c">! on PC1</span>
PC1&gt; ping 10.0.20.10
PC1&gt; arp</pre>
<pre class="out"><span class="hl">84 bytes from 10.0.20.10 icmp_seq=1 ttl=63 time=0.700 ms</span>
84 bytes from 10.0.20.10 icmp_seq=2 ttl=63 time=0.500 ms
84 bytes from 10.0.20.10 icmp_seq=3 ttl=63 time=0.800 ms
84 bytes from 10.0.20.10 icmp_seq=4 ttl=63 time=0.600 ms
84 bytes from 10.0.20.10 icmp_seq=5 ttl=63 time=0.900 ms

<span class="hl">52:54:00:12:34:56  10.0.10.1 expires in 118 seconds</span></pre>
<p>Two lessons in one output. The TTL is <b>63</b>: SRV sent 64 and one router (R1) decremented it. And the ARP cache holds only the gateway 10.0.10.1, <b>not</b> 10.0.20.10: PC1 never needs the server's MAC, because every frame to another subnet goes to the gateway.</p>
<pre class="code"><span class="c">! on R1</span>
R1&gt; enable
R1# show ip route</pre>
<pre class="out">Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       O - OSPF, IA - OSPF inter area
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.10.0/24 is directly connected, GigabitEthernet0/0
L        10.0.10.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.0.20.0/24 is directly connected, GigabitEthernet0/1</span>
L        10.0.20.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>The C route for 10.0.20.0/24 tells you R1 forwards packets for SRV out of <b>GigabitEthernet0/1</b>. That is the answer to the last lab task.</p>

<h3>Overhead, MTU and MSS</h3>
<p>Every header costs bytes. On standard Ethernet the <b>MTU</b> (largest Layer 3 packet a link carries) is 1500 bytes. Subtract 20 bytes of IPv4 header and 20 bytes of TCP header and you get the <b>MSS</b> (Maximum Segment Size) of 1460 bytes of application data per segment. Tunnels add more headers: GRE adds 24 bytes, so the inner packet can be at most 1476; IPsec adds 50 to 70 more depending on the options. If a packet is too big and the <b>DF (Don't Fragment)</b> bit is set, the router drops it and sends ICMP "fragmentation needed". Data centers often use <b>jumbo frames</b> (MTU about 9000) for storage and VXLAN to reduce overhead.</p>

<div class="eg"><p><b>Worked example.</b> A site-to-site VPN adds 73 bytes of IPsec and outer IP overhead. 1500 minus 73 leaves 1427 bytes for the original packet, and 1427 minus 40 (IP plus TCP) leaves an MSS of 1387. Engineers round down and set the MSS to 1360 on the tunnel interface with <code>ip tcp adjust-mss 1360</code>, so hosts never send segments that need fragmenting.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting to see the remote server's MAC in a PC's ARP cache. Thinking a switch decrements TTL (only Layer 3 hops do). Forgetting that the reply packet has its own TTL, set by the server, so the TTL you see on the PC tells you the hops on the return path.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which addresses change at each hop?" = source and destination MAC. "Which stay the same?" = source and destination IP (without NAT). "Which field prevents loops?" = TTL. A TTL of 64 minus the hop count, or 128 minus it for many Windows hosts, is a quick way to guess how many routers are in the path.</p></div>

<div class="scn"><h4>Pages that half-loaded over the VPN</h4><p>After a new branch VPN went live, users could ping head-office servers and open small pages, but large pages and file downloads hung halfway. Captures showed the large TCP segments with DF set never arriving, and a firewall on the path blocking the ICMP "fragmentation needed" messages, so hosts never learned to send smaller packets. The engineer set <code>ip tcp adjust-mss 1360</code> on the tunnel interface. Downloads worked immediately.</p><p><b>Lesson:</b> encapsulation overhead is real. When small packets work and big ones fail, think MTU and MSS.</p></div>

<div class="iv"><p class="q">"A packet crosses three routers. What changes in it and what stays the same?"</p><p>Strong answer: at every router the old frame is removed and a new one is built, so source and destination MAC change on every hop. The IP source and destination stay the same end to end unless NAT is applied. The TTL is decremented by one at each router (so by three here) and the IP header checksum is recalculated. Layer 4 ports and the payload are untouched unless a NAT, proxy or load balancer rewrites them. Mention ARP for the next hop's MAC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation adds headers top-down on the sender; decapsulation removes them bottom-up on the receiver.</li>
<li>A host sends off-subnet traffic to the gateway's MAC, learned by ARP; the server's MAC never appears in its ARP cache.</li>
<li>Routers rebuild the frame and decrement TTL; switches forward the frame unchanged.</li>
<li>MTU 1500 minus 40 bytes of IPv4 and TCP headers gives an MSS of 1460; tunnels reduce it further.</li>
<li>Lab proof: ttl=63 on PC1, the gateway MAC in <code>arp</code>, and the C route out Gi0/1 on R1.</li>
</ul></div>
`,hi:`
<p>net-start mein aapne encapsulation ko "envelopes ke andar envelopes" ki tarah seekha tha. Ab hum ise exact banate hain, real addresses, real header values aur lab <b>Follow a ping through the layers</b> ke commands ke saath. Is chapter ka sabse important sentence: <b>IP addresses end to end same rehte hain; MAC addresses har router hop par badalte hain; TTL har router par ek kam hota hai.</b></p>

<h3>Encapsulation aur decapsulation, exact tarah se</h3>
<p><b>Sender</b> par har layer upar wali layer ka PDU leti hai aur apna header jodti hai (aur Layer 2 ek trailer bhi jodti hai, FCS). Yeh <b>encapsulation</b> hai. <b>Receiver</b> par har layer apna header padhti aur hatati hai aur baaki upar bhejti hai. Yeh <b>decapsulation</b> hai. Beech ka device utna hi upar jaata hai jitna zaroori hai: switch Layer 2 tak decapsulate karta hai, router Layer 3 tak, firewall ya load balancer Layer 4 ya 7 tak.</p>

<h3>Lab network</h3>
<p>PC1 10.0.10.10/24 hai, default gateway 10.0.10.1 ke saath. Yeh SW1 se juda hai, jo R1 GigabitEthernet0/0 (10.0.10.1/24) se juda hai. R1 GigabitEthernet0/1 (10.0.20.1/24) SRV (10.0.20.10/24, gateway 10.0.20.1) se juda hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="PC1 se SRV tak har hop par headers">
<rect x="10" y="20" width="90" height="36" rx="6" fill="#bae6fd"/><text x="55" y="43" text-anchor="middle" class="svg-ink" font-size="13">PC1</text>
<rect x="170" y="20" width="90" height="36" rx="6" fill="#e2e8f0"/><text x="215" y="43" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="330" y="20" width="90" height="36" rx="6" fill="#fde68a"/><text x="375" y="43" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="530" y="20" width="90" height="36" rx="6" fill="#bbf7d0"/><text x="575" y="43" text-anchor="middle" class="svg-ink" font-size="13">SRV</text>
<line x1="100" y1="38" x2="170" y2="38" stroke="#64748b" stroke-width="2"/><line x1="260" y1="38" x2="330" y2="38" stroke="#64748b" stroke-width="2"/><line x1="420" y1="38" x2="530" y2="38" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="80" width="400" height="70" rx="6" fill="#ddd6fe"/>
<text x="210" y="100" text-anchor="middle" class="svg-ink" font-size="12">Hop 1 frame: src MAC PC1, dst MAC R1 Gi0/0</text>
<text x="210" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 10.0.10.10 se 10.0.20.10</text>
<text x="210" y="140" text-anchor="middle" class="svg-accent" font-size="12">TTL 64</text>
<rect x="420" y="80" width="210" height="70" rx="6" fill="#fed7aa"/>
<text x="525" y="100" text-anchor="middle" class="svg-ink" font-size="12">Hop 2: src R1 Gi0/1, dst SRV</text>
<text x="525" y="120" text-anchor="middle" class="svg-ink" font-size="12">IP 10.0.10.10 se 10.0.20.10</text>
<text x="525" y="140" text-anchor="middle" class="svg-accent" font-size="12">TTL 63</text>
<text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">Dono hops par same IP addresses. R1 ke baad naye MAC addresses.</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">SW1 frame nahi badalta; woh sirf destination MAC padhta hai.</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Reply SRV se TTL 64 ke saath aata hai aur PC1 par 63 pahunchta hai.</text>
</svg><p class="cap">Switch frame ko bina badle forward karta hai. Router frame hatata hai, IP header update karta hai (TTL, checksum) aur naya frame banata hai.</p></div>

<h3>Step by step</h3>
<ol>
<li><b>PC1 tay karta hai local ya remote.</b> Woh apne mask se 10.0.20.10 ko apne network 10.0.10.0/24 se compare karta hai. Alag network hai, isliye packet default gateway 10.0.10.1 ko jaana chahiye.</li>
<li><b>PC1 ICMP echo aur IP packet banata hai.</b> Source 10.0.10.10, destination 10.0.20.10, Protocol 1 (ICMP), TTL 64.</li>
<li><b>PC1 ko gateway ka MAC chahiye.</b> ARP cache mein nahi hai, isliye woh ARP request broadcast karta hai "10.0.10.1 kiske paas hai?" (destination MAC FF:FF:FF:FF:FF:FF, EtherType 0x0806). R1 unicast ARP reply mein Gi0/0 ka MAC deta hai. PC1 use cache kar leta hai.</li>
<li><b>PC1 packet ko frame karta hai.</b> Destination MAC = R1 Gi0/0, source MAC = PC1, EtherType 0x0800, phir FCS.</li>
<li><b>SW1 forward karta hai.</b> Woh apne port par PC1 ka MAC seekhta hai, destination MAC dhoondta hai aur frame ko R1 wale port se bhejta hai. Frame modify nahi hota.</li>
<li><b>R1 Layer 3 tak decapsulate karta hai.</b> FCS check karta hai, frame hatata hai, routing table mein 10.0.20.10 dhoondta hai (connected, Gi0/1 se bahar), TTL ko 63 karta hai aur IP header checksum dobara calculate karta hai.</li>
<li><b>R1 re-encapsulate karta hai.</b> Zaroorat ho to Gi0/1 par 10.0.20.10 ke liye ARP karta hai, phir <b>naya</b> frame banata hai: source MAC R1 Gi0/1, destination MAC SRV.</li>
<li><b>SRV poori tarah upar tak decapsulate karta hai</b>, ICMP echo request dekhta hai, aur apne packet (TTL 64) se reply karta hai, jo ulti direction mein same process follow karta hai.</li>
</ol>

<h3>Lab mein prove karna</h3>
<pre class="code"><span class="c">! PC1 par</span>
PC1&gt; ping 10.0.20.10
PC1&gt; arp</pre>
<pre class="out"><span class="hl">84 bytes from 10.0.20.10 icmp_seq=1 ttl=63 time=0.700 ms</span>
84 bytes from 10.0.20.10 icmp_seq=2 ttl=63 time=0.500 ms
84 bytes from 10.0.20.10 icmp_seq=3 ttl=63 time=0.800 ms
84 bytes from 10.0.20.10 icmp_seq=4 ttl=63 time=0.600 ms
84 bytes from 10.0.20.10 icmp_seq=5 ttl=63 time=0.900 ms

<span class="hl">52:54:00:12:34:56  10.0.10.1 expires in 118 seconds</span></pre>
<p>Ek output mein do seekh. TTL <b>63</b> hai: SRV ne 64 bheja aur ek router (R1) ne use kam kiya. Aur ARP cache mein sirf gateway 10.0.10.1 hai, 10.0.20.10 <b>nahi</b>: PC1 ko kabhi server ka MAC nahi chahiye, kyunki doosre subnet ka har frame gateway ko jaata hai.</p>
<pre class="code"><span class="c">! R1 par</span>
R1&gt; enable
R1# show ip route</pre>
<pre class="out">Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       O - OSPF, IA - OSPF inter area
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
C        10.0.10.0/24 is directly connected, GigabitEthernet0/0
L        10.0.10.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.0.20.0/24 is directly connected, GigabitEthernet0/1</span>
L        10.0.20.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>10.0.20.0/24 ka C route batata hai ki R1 SRV ke packets <b>GigabitEthernet0/1</b> se forward karta hai. Yahi lab ke aakhri task ka jawab hai.</p>

<h3>Overhead, MTU aur MSS</h3>
<p>Har header bytes khata hai. Standard Ethernet par <b>MTU</b> (sabse bada Layer 3 packet jo link le ja sakta hai) 1500 bytes hai. 20 bytes IPv4 header aur 20 bytes TCP header ghatao to har segment mein 1460 bytes application data ka <b>MSS</b> (Maximum Segment Size) milta hai. Tunnels aur headers jodte hain: GRE 24 bytes jodta hai, isliye andar ka packet maximum 1476 ho sakta hai; IPsec options ke hisaab se 50 se 70 aur jodta hai. Agar packet bahut bada hai aur <b>DF (Don't Fragment)</b> bit set hai, to router use drop karta hai aur ICMP "fragmentation needed" bhejta hai. Data centers storage aur VXLAN ke liye overhead kam karne ko aksar <b>jumbo frames</b> (MTU lagbhag 9000) use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek site-to-site VPN 73 bytes IPsec aur outer IP overhead jodta hai. 1500 minus 73 se original packet ke liye 1427 bytes bachte hain, aur 1427 minus 40 (IP plus TCP) se MSS 1387 bachta hai. Engineers neeche round karke tunnel interface par <code>ip tcp adjust-mss 1360</code> se MSS 1360 set karte hain, taaki hosts kabhi aise segments na bhejein jinhe fragment karna pade.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> PC ke ARP cache mein remote server ka MAC dekhne ki ummeed karna. Sochna ki switch TTL kam karta hai (sirf Layer 3 hops karte hain). Bhool jaana ki reply packet ka apna TTL hota hai, jo server set karta hai, isliye PC par dikhne wala TTL return path ke hops batata hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Har hop par kaunse addresses badalte hain?" = source aur destination MAC. "Kaunse same rehte hain?" = source aur destination IP (bina NAT ke). "Kaunsa field loops rokta hai?" = TTL. 64 minus hop count, ya bahut se Windows hosts ke liye 128 minus, se jaldi andaza lagta hai ki path mein kitne routers hain.</p></div>

<div class="scn"><h4>VPN par aadhe load hote pages</h4><p>Nayi branch VPN live hone ke baad users head-office servers ko ping kar sakte the aur chhote pages khol sakte the, lekin bade pages aur file downloads aadhe mein atak jaate the. Captures se dikha ki DF set wale bade TCP segments kabhi nahi pahunchte the, aur path par ek firewall ICMP "fragmentation needed" messages block kar raha tha, isliye hosts ne kabhi chhote packets bhejna nahi seekha. Engineer ne tunnel interface par <code>ip tcp adjust-mss 1360</code> set kiya. Downloads turant chalne lage.</p><p><b>Seekh:</b> encapsulation overhead asli hai. Jab chhote packets chalein aur bade fail hon, to MTU aur MSS socho.</p></div>

<div class="iv"><p class="q">"Ek packet teen routers paar karta hai. Usmein kya badalta hai aur kya same rehta hai?"</p><p>Strong answer: har router par purana frame hataya jaata hai aur naya banaya jaata hai, isliye source aur destination MAC har hop par badalte hain. IP source aur destination end to end same rehte hain jab tak NAT apply na ho. TTL har router par ek kam hota hai (yahan teen) aur IP header checksum dobara calculate hota hai. Layer 4 ports aur payload ko koi nahi chhoota jab tak NAT, proxy ya load balancer unhe rewrite na kare. Next hop ke MAC ke liye ARP mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Encapsulation sender par top-down headers jodta hai; decapsulation receiver par bottom-up unhe hatata hai.</li>
<li>Host doosre subnet ka traffic gateway ke MAC par bhejta hai, jo ARP se seekha jaata hai; server ka MAC uske ARP cache mein kabhi nahi aata.</li>
<li>Routers frame dobara banate hain aur TTL kam karte hain; switches frame bina badle forward karte hain.</li>
<li>MTU 1500 minus 40 bytes IPv4 aur TCP headers se MSS 1460 milta hai; tunnels ise aur kam karte hain.</li>
<li>Lab proof: PC1 par ttl=63, <code>arp</code> mein gateway ka MAC, aur R1 par Gi0/1 se bahar C route.</li>
</ul></div>
`}};export{e as default};