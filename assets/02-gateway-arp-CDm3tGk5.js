var e={id:`gateway-arp`,h:{en:`The default gateway and ARP across VLANs`,hi:`Default gateway aur VLANs ke across ARP`},body:{en:`
<p>When you post a letter to another city, you do not drive it there yourself. You drop it at your <b>local post office</b>, and the post office puts it in a new bag with a new label for the next leg. The address on the letter never changes; the bag and label change at every office. A PC talking to another VLAN behaves exactly like this: the IP addresses stay the same end to end, but the Ethernet header is rewritten at every router.</p>

<h3>Step 1: local or remote?</h3>
<p>Before sending anything, a host compares its own subnet with the destination. It ANDs its own IP with its mask, then ANDs the destination IP with the <b>same</b> mask. If the results match, the destination is <b>local</b> and the host ARPs for it directly. If they differ, the destination is <b>remote</b> and the host sends the packet to its <b>default gateway</b>.</p>
<div class="eg"><p><b>Worked example.</b> PC1 is 192.168.10.10/24 with gateway 192.168.10.1. It wants PC2 at 192.168.20.10. PC1's network: 192.168.10.10 AND 255.255.255.0 = 192.168.10.0. Destination: 192.168.20.10 AND 255.255.255.0 = 192.168.20.0. Different, so PC2 is remote and PC1 will use the gateway. If PC1 wrongly had mask /16, both results would be 192.168.0.0, PC1 would ARP for PC2 directly inside VLAN 10, and nobody would answer.</p></div>

<h3>Step 2: ARP for the gateway, not the destination</h3>
<p><b>ARP</b> (Address Resolution Protocol) maps an IPv4 address to a MAC address using a broadcast question ("who has 192.168.10.1?") and a unicast reply. PC1 needs a MAC to put in the frame, and because the destination is remote, it asks for the <b>gateway's</b> MAC. The ARP broadcast stays inside VLAN 10, which is why the gateway address must live in VLAN 10. R1's subinterface Gi0/0.10 replies with its MAC, 5254.0012.3401.</p>

<h3>Step 3: the router routes and rewrites</h3>
<ol>
<li>PC1 sends a frame: destination MAC = R1's MAC, source MAC = PC1's MAC, inside it an IP packet from 192.168.10.10 to 192.168.20.10.</li>
<li>R1 receives it on Gi0/0.10, removes the Ethernet header and looks up 192.168.20.10 in its routing table. It finds the <b>connected</b> route 192.168.20.0/24 out Gi0/0.20.</li>
<li>R1 decrements the IP <b>TTL</b> by one and recalculates the header checksum.</li>
<li>R1 needs PC2's MAC, so it ARPs for 192.168.20.10 inside VLAN 20 (or uses its ARP cache).</li>
<li>R1 builds a new frame: destination MAC = PC2, source MAC = R1, and sends it out Gi0/0.20 into VLAN 20.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Frame rewrite at the gateway between VLAN 10 and VLAN 20">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="265" y="80" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1 gateway</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">.10.1 and .20.1</text>
<rect x="520" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="575" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10</text>
<line x1="120" y1="105" x2="265" y2="105" stroke="#64748b" stroke-width="2"/><line x1="375" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="192" y="30" text-anchor="middle" class="svg-accent" font-size="12">VLAN 10 frame</text>
<text x="192" y="48" text-anchor="middle" class="svg-ink" font-size="12">dst MAC R1, src MAC PC1</text>
<text x="192" y="66" text-anchor="middle" class="svg-muted" font-size="12">IP .10.10 to .20.10, TTL 64</text>
<text x="448" y="30" text-anchor="middle" class="svg-accent" font-size="12">VLAN 20 frame</text>
<text x="448" y="48" text-anchor="middle" class="svg-ink" font-size="12">dst MAC PC2, src MAC R1</text>
<text x="448" y="66" text-anchor="middle" class="svg-muted" font-size="12">IP .10.10 to .20.10, TTL 63</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">MACs change at every router hop; IP addresses do not</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">TTL drops by one per routed hop</text>
</svg><p class="cap">The router is the only device that rewrites the frame; the switch just carries it inside each VLAN.</p></div>

<h3>What you see on the router</h3>
<p>After one successful ping, R1's ARP table holds both PCs, each learned on the subinterface of its own VLAN. Notice that both subinterfaces show the <b>same MAC</b>: subinterfaces borrow the physical interface's MAC, which is fine because each lives in a different VLAN.</p>
<pre class="out">R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.10.1            -   5254.0012.3401  ARPA   GigabitEthernet0/0.10
<span class="hl">Internet  192.168.10.10           1   0050.7966.6801  ARPA   GigabitEthernet0/0.10</span>
Internet  192.168.20.1            -   5254.0012.3401  ARPA   GigabitEthernet0/0.20
<span class="hl">Internet  192.168.20.10           1   0050.7966.6802  ARPA   GigabitEthernet0/0.20</span></pre>
<p>And the routing table shows why R1 can route at all: each subinterface with an IP address creates a <b>C</b> (connected) route for the subnet and an <b>L</b> (local) /32 route for the interface's own address. No static route or routing protocol is needed between directly connected VLANs.</p>
<pre class="out">R1# show ip route | begin Gateway
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        192.168.10.0/24 is directly connected, GigabitEthernet0/0.10</span>
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        192.168.20.0/24 is directly connected, GigabitEthernet0/0.20</span>
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0.20</pre>
<p>On the PC, the reply TTL proves a router was in the path. A lab PC starts packets with TTL 64, so a reply from another VLAN arrives with <b>ttl=63</b>; a reply from the gateway itself shows <b>ttl=255</b>, because the router is the sender and Cisco IOS starts its own packets at 255.</p>
<pre class="out">PC1&gt; ping 192.168.20.10
<span class="hl">84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=1.842 ms</span>
84 bytes from 192.168.20.10 icmp_seq=2 ttl=63 time=1.207 ms</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) A host with the wrong mask decides a remote host is local and ARPs for it; the ARP is never answered. (2) A host whose gateway is in a different subnet, for example 192.168.20.1 on a VLAN 10 PC, cannot ARP for it; Windows reports "General failure" or the ping simply times out. (3) The very first ping across VLANs often loses one reply while ARP completes; that is normal.</p></div>

<div class="exam"><p><b>Exam trap.</b> "What is the destination MAC address of the frame leaving PC1 towards PC2 in another VLAN?" The answer is the <b>default gateway's MAC</b>, never PC2's. The destination <b>IP</b> is PC2's. Also remember that the source and destination IP addresses do not change across the router (no NAT here).</p></div>

<div class="scn"><h4>The PC that could reach only its own floor</h4><p>A new laptop in VLAN 10 could ping every colleague on VLAN 10 but nothing in other VLANs. Its neighbours were fine, so the router was not the problem. The engineer checked <code>ipconfig</code>: IP 192.168.10.57, mask 255.255.255.0, gateway <b>blank</b>, because the user had typed a static address and skipped the gateway. Without a gateway the laptop had nowhere to send remote packets. Setting the gateway to 192.168.10.1 (and later moving the laptop back to DHCP) fixed it.</p><p><b>Lesson:</b> local works plus remote fails on one host points to that host's gateway or mask, not to the router.</p></div>

<div class="iv"><p class="q">"Walk me through what happens when a PC pings a host in another VLAN."</p><p>Strong answer: the PC ANDs both addresses with its mask, finds the destination remote, ARPs for its default gateway inside its own VLAN, and sends the frame to the gateway's MAC with the final destination IP. The router looks up the connected route, decrements TTL, ARPs for the destination in the other VLAN, and rewrites the Ethernet header with its own MAC as source. IPs stay the same; MACs change per hop. Mention ttl=63 in the reply as proof of one routed hop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A host decides local or remote by comparing network portions using its own mask.</li>
<li>For a remote destination the host ARPs for the gateway, so the gateway must be in the host's VLAN and subnet.</li>
<li>The router decrements TTL and rewrites source and destination MACs; IP addresses stay the same.</li>
<li>Each routed interface creates C and L routes; directly connected VLANs need no extra routing.</li>
<li>Wrong mask or wrong gateway on one host breaks only that host's off-subnet traffic.</li>
</ul></div>
`,hi:`
<p>Jab aap dusre shehar ko chitthi bhejte ho, to khud gaadi chala kar wahan nahi jaate. Aap use apne <b>local post office</b> mein daalte ho, aur post office use agle safar ke liye naye bag mein naye label ke saath rakhta hai. Chitthi par likha address kabhi nahi badalta; bag aur label har office par badalte hain. Dusre VLAN se baat karta PC bilkul aisa hi behave karta hai: IP addresses shuru se aakhir tak same rehte hain, lekin har router par Ethernet header naya likha jaata hai.</p>

<h3>Step 1: local ya remote?</h3>
<p>Kuch bhejne se pehle host apne subnet ko destination se compare karta hai. Woh apne IP ko apne mask se AND karta hai, phir destination IP ko <b>usi</b> mask se AND karta hai. Results match karein to destination <b>local</b> hai aur host seedha uske liye ARP karta hai. Alag hon to destination <b>remote</b> hai aur host packet apne <b>default gateway</b> ko bhejta hai.</p>
<div class="eg"><p><b>Worked example.</b> PC1 192.168.10.10/24 hai, gateway 192.168.10.1. Use 192.168.20.10 par PC2 chahiye. PC1 ka network: 192.168.10.10 AND 255.255.255.0 = 192.168.10.0. Destination: 192.168.20.10 AND 255.255.255.0 = 192.168.20.0. Alag hain, isliye PC2 remote hai aur PC1 gateway use karega. Agar PC1 par galti se mask /16 hota, to dono results 192.168.0.0 aate, PC1 VLAN 10 ke andar seedha PC2 ke liye ARP karta, aur koi jawab nahi deta.</p></div>

<h3>Step 2: destination ke liye nahi, gateway ke liye ARP</h3>
<p><b>ARP</b> (Address Resolution Protocol) broadcast sawaal ("192.168.10.1 kiske paas hai?") aur unicast jawab se IPv4 address ko MAC address se map karta hai. PC1 ko frame mein daalne ke liye MAC chahiye, aur destination remote hai, isliye woh <b>gateway ka</b> MAC poochta hai. ARP broadcast VLAN 10 ke andar hi rehta hai, isiliye gateway address VLAN 10 mein hona chahiye. R1 ka subinterface Gi0/0.10 apne MAC 5254.0012.3401 ke saath jawab deta hai.</p>

<h3>Step 3: router route karta hai aur rewrite karta hai</h3>
<ol>
<li>PC1 frame bhejta hai: destination MAC = R1 ka MAC, source MAC = PC1 ka MAC, andar 192.168.10.10 se 192.168.20.10 tak ek IP packet.</li>
<li>R1 use Gi0/0.10 par receive karta hai, Ethernet header hatata hai aur apni routing table mein 192.168.20.10 dhoondhta hai. Use Gi0/0.20 se bahar <b>connected</b> route 192.168.20.0/24 milta hai.</li>
<li>R1 IP <b>TTL</b> ek kam karta hai aur header checksum dobara calculate karta hai.</li>
<li>R1 ko PC2 ka MAC chahiye, isliye woh VLAN 20 ke andar 192.168.20.10 ke liye ARP karta hai (ya apna ARP cache use karta hai).</li>
<li>R1 naya frame banata hai: destination MAC = PC2, source MAC = R1, aur use Gi0/0.20 se VLAN 20 mein bhejta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VLAN 10 aur VLAN 20 ke beech gateway par frame rewrite">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.10.10</text>
<rect x="265" y="80" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">R1 gateway</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">.10.1 aur .20.1</text>
<rect x="520" y="80" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="102" text-anchor="middle" class="svg-ink" font-size="13">PC2</text><text x="575" y="120" text-anchor="middle" class="svg-muted" font-size="12">192.168.20.10</text>
<line x1="120" y1="105" x2="265" y2="105" stroke="#64748b" stroke-width="2"/><line x1="375" y1="105" x2="520" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="192" y="30" text-anchor="middle" class="svg-accent" font-size="12">VLAN 10 frame</text>
<text x="192" y="48" text-anchor="middle" class="svg-ink" font-size="12">dst MAC R1, src MAC PC1</text>
<text x="192" y="66" text-anchor="middle" class="svg-muted" font-size="12">IP .10.10 se .20.10, TTL 64</text>
<text x="448" y="30" text-anchor="middle" class="svg-accent" font-size="12">VLAN 20 frame</text>
<text x="448" y="48" text-anchor="middle" class="svg-ink" font-size="12">dst MAC PC2, src MAC R1</text>
<text x="448" y="66" text-anchor="middle" class="svg-muted" font-size="12">IP .10.10 se .20.10, TTL 63</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Har router hop par MACs badalte hain; IP addresses nahi</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">Har routed hop par TTL ek kam hota hai</text>
</svg><p class="cap">Frame ko rewrite karne wala akela device router hai; switch use sirf har VLAN ke andar le jaata hai.</p></div>

<h3>Router par kya dikhta hai</h3>
<p>Ek successful ping ke baad R1 ki ARP table mein dono PCs hote hain, har ek apne VLAN ke subinterface par seekha hua. Dhyan do ki dono subinterfaces <b>same MAC</b> dikhate hain: subinterfaces physical interface ka MAC udhaar lete hain, jo theek hai kyunki har ek alag VLAN mein hai.</p>
<pre class="out">R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.10.1            -   5254.0012.3401  ARPA   GigabitEthernet0/0.10
<span class="hl">Internet  192.168.10.10           1   0050.7966.6801  ARPA   GigabitEthernet0/0.10</span>
Internet  192.168.20.1            -   5254.0012.3401  ARPA   GigabitEthernet0/0.20
<span class="hl">Internet  192.168.20.10           1   0050.7966.6802  ARPA   GigabitEthernet0/0.20</span></pre>
<p>Aur routing table dikhati hai ki R1 route kar hi kyun pata hai: IP address wala har subinterface subnet ke liye ek <b>C</b> (connected) route aur interface ke apne address ke liye ek <b>L</b> (local) /32 route banata hai. Directly connected VLANs ke beech koi static route ya routing protocol nahi chahiye.</p>
<pre class="out">R1# show ip route | begin Gateway
Gateway of last resort is not set

      192.168.10.0/24 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        192.168.10.0/24 is directly connected, GigabitEthernet0/0.10</span>
L        192.168.10.1/32 is directly connected, GigabitEthernet0/0.10
      192.168.20.0/24 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        192.168.20.0/24 is directly connected, GigabitEthernet0/0.20</span>
L        192.168.20.1/32 is directly connected, GigabitEthernet0/0.20</pre>
<p>PC par reply ka TTL saabit karta hai ki path mein router tha. Lab PC packets TTL 64 se shuru karta hai, isliye dusre VLAN se reply <b>ttl=63</b> ke saath aata hai; gateway se khud ka reply <b>ttl=255</b> dikhata hai, kyunki router hi sender hai aur Cisco IOS apne packets 255 se shuru karta hai.</p>
<pre class="out">PC1&gt; ping 192.168.20.10
<span class="hl">84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=1.842 ms</span>
84 bytes from 192.168.20.10 icmp_seq=2 ttl=63 time=1.207 ms</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) Galat mask wala host remote host ko local samajhta hai aur uske liye ARP karta hai; ARP ka kabhi jawab nahi aata. (2) Jis host ka gateway dusre subnet mein hai, jaise VLAN 10 PC par 192.168.20.1, woh uske liye ARP nahi kar sakta; Windows "General failure" dikhata hai ya ping bas time out hota hai. (3) VLANs ke across pehla ping aksar ARP poora hone tak ek reply kho deta hai; yeh normal hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "PC1 se dusre VLAN ke PC2 ki taraf jaate frame ka destination MAC kya hai?" Jawab hai <b>default gateway ka MAC</b>, kabhi PC2 ka nahi. Destination <b>IP</b> PC2 ka hai. Yeh bhi yaad rakho ki router ke across source aur destination IP addresses nahi badalte (yahan NAT nahi hai).</p></div>

<div class="scn"><h4>Woh PC jo sirf apni floor tak pahunchta tha</h4><p>VLAN 10 ka ek naya laptop VLAN 10 ke har colleague ko ping kar leta tha lekin dusre VLANs mein kuch nahi. Uske padosi theek the, isliye router problem nahi tha. Engineer ne <code>ipconfig</code> check kiya: IP 192.168.10.57, mask 255.255.255.0, gateway <b>khaali</b>, kyunki user ne static address type kiya tha aur gateway chhod diya tha. Gateway ke bina laptop ke paas remote packets bhejne ki koi jagah nahi thi. Gateway 192.168.10.1 set karne se (aur baad mein laptop ko wapas DHCP par daalne se) problem theek ho gayi.</p><p><b>Seekh:</b> ek host par local chalna aur remote fail hona us host ke gateway ya mask ki taraf ishara karta hai, router ki taraf nahi.</p></div>

<div class="iv"><p class="q">"Mujhe samjhao ki jab PC dusre VLAN ke host ko ping karta hai to kya hota hai."</p><p>Strong answer: PC dono addresses ko apne mask se AND karta hai, destination ko remote paata hai, apne VLAN ke andar apne default gateway ke liye ARP karta hai, aur final destination IP ke saath frame gateway ke MAC par bhejta hai. Router connected route dhoondhta hai, TTL kam karta hai, dusre VLAN mein destination ke liye ARP karta hai, aur apne MAC ko source bana kar Ethernet header rewrite karta hai. IPs same rehte hain; MACs har hop par badalte hain. Ek routed hop ke saboot ke roop mein reply mein ttl=63 ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Host apne mask se network portions compare karke local ya remote decide karta hai.</li>
<li>Remote destination ke liye host gateway ke liye ARP karta hai, isliye gateway host ke VLAN aur subnet mein hona chahiye.</li>
<li>Router TTL kam karta hai aur source aur destination MACs rewrite karta hai; IP addresses same rehte hain.</li>
<li>Har routed interface C aur L routes banata hai; directly connected VLANs ko extra routing nahi chahiye.</li>
<li>Ek host par galat mask ya galat gateway sirf us host ka off-subnet traffic todta hai.</li>
</ul></div>
`}};export{e as default};