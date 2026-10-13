var e={id:`ipv4`,h:{en:`IPv4 addressing, fast subnetting and ARP`,hi:`IPv4 addressing, fast subnetting aur ARP`},body:{en:`
<p>A MAC address is like a person's name: useful inside one room, useless for finding them in another city. An <b>IP address</b> is like a postal address: it has a part that says which street (the <b>network</b>) and a part that says which house (the <b>host</b>). Routers only care about the street; the last switch cares about the house. In this chapter you will learn to split addresses quickly, plan a data center addressing scheme and follow ARP, the protocol that turns an IP address into a MAC address.</p>

<h3>IPv4 in one paragraph</h3>
<p>An IPv4 address is <b>32 bits</b>, written as four decimal octets (10.10.10.11). A <b>prefix length</b> such as /24 says how many leading bits are the network part; the old way of writing the same thing is a <b>subnet mask</b> (255.255.255.0). The first address of a subnet is the <b>network address</b>, the last is the <b>broadcast address</b>, and everything in between is usable for hosts. Private ranges (RFC 1918) are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16; data centers use them internally and translate at the edge when needed.</p>

<h3>Fast subnetting: the block-size method</h3>
<ol>
<li>Find the <b>interesting octet</b>: the one where the mask is not 255 or 0.</li>
<li><b>Block size</b> = 256 minus the mask value in that octet.</li>
<li>Network addresses are multiples of the block size. The broadcast is the next network minus one.</li>
</ol>
<div class="eg"><p><b>Worked example 1.</b> Host 10.10.10.77/26. Mask 255.255.255.192, interesting octet is the 4th, block = 256 minus 192 = 64. Multiples of 64: 0, 64, 128, 192. 77 falls in the 64 block. Network <b>10.10.10.64</b>, broadcast <b>10.10.10.127</b>, hosts .65 to .126 (62 hosts).</p>
<p><b>Worked example 2.</b> Host 10.20.37.200/20. Mask 255.255.240.0, interesting octet is the 3rd, block = 16. Multiples of 16: 32, 48; 37 is in 32. Network <b>10.20.32.0</b>, broadcast <b>10.20.47.255</b>, 4094 usable hosts.</p>
<p><b>Useful sizes:</b> /24 = 256 addresses (254 hosts), /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4, /31 = 2, /32 = 1. Usable hosts = 2^(32 minus prefix) minus 2, except /31 and /32.</p></div>

<h3>The three prefix lengths you meet everywhere in a DC</h3>
<table class="cmp"><tr><th>Prefix</th><th>Used for</th><th>Why</th></tr>
<tr><td>/24 (or /23, /22)</td><td>Server VLANs (SVIs)</td><td>Room for a rack or a tier of servers; easy to read</td></tr>
<tr><td>/31</td><td>Point-to-point leaf to spine links</td><td>RFC 3021: no network or broadcast needed on a two-device link, so both addresses are usable; halves address use compared with /30</td></tr>
<tr><td>/32</td><td>Loopbacks (router ID, VTEP address)</td><td>A single address that never goes down with a physical link</td></tr></table>

<div class="eg"><p><b>Worked example 3: plan a small fabric.</b> 4 spines and 24 leaves means 4 × 24 = 96 point-to-point links. Each /31 uses 2 addresses: 96 × 2 = 192 addresses, which fits in one /24 (10.1.0.0/24). Loopbacks: 28 switches need 28 /32s; reserve 10.255.0.0/24 for router IDs and 10.254.0.0/24 for VTEP addresses. Server VLANs get 10.10.x.0/24 per tenant or tier. A clear plan like this makes every show command readable at a glance.</p></div>

<pre class="code"><span class="c">! routed /31 uplink and /32 loopback on NX-OS (CIDR notation)</span>
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# no switchport
LEAF1(config-if)# ip address 10.1.0.1/31
LEAF1(config-if)# no shutdown
LEAF1(config)# interface loopback0
LEAF1(config-if)# ip address 10.255.0.1/32
<span class="c">! server VLAN gateway (SVI) needs feature interface-vlan</span>
LEAF1(config)# feature interface-vlan
LEAF1(config)# interface vlan 10
LEAF1(config-if)# ip address 10.10.10.1/24
LEAF1(config-if)# no shutdown</pre>

<h3>Default gateway</h3>
<p>A host compares the destination with its own subnet. Same subnet: deliver directly. Different subnet: send to the <b>default gateway</b>, the router interface in its own subnet (in a DC, the leaf's SVI or anycast gateway). A wrong gateway or wrong mask on a server is one of the most common "network" tickets.</p>

<h3>ARP, step by step</h3>
<p>To build a frame, a host needs the destination MAC. <b>ARP</b> (Address Resolution Protocol, EtherType 0x0806) finds it.</p>
<ol>
<li>WEB1 (10.10.10.11) wants to reach APP1 (10.10.20.21). Different subnet, so the next hop is the gateway 10.10.10.1.</li>
<li>WEB1 checks its ARP cache; empty. It broadcasts "Who has 10.10.10.1? Tell 10.10.10.11" to <code>ffff.ffff.ffff</code> in VLAN 10.</li>
<li>The leaf SVI replies with a unicast "10.10.10.1 is at 00de.fb12.3401" (its router MAC). Both sides cache the result.</li>
<li>WEB1 sends the IP packet to APP1's IP inside a frame addressed to the gateway MAC.</li>
<li>The leaf routes it to VLAN 20, ARPs for 10.10.20.21 if needed, rewrites the Ethernet header and delivers it.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ARP request and reply">
<rect x="20" y="20" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">WEB1 .11</text>
<rect x="490" y="20" width="130" height="40" rx="6" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 SVI .1</text>
<line x1="85" y1="60" x2="85" y2="200" stroke="#64748b"/><line x1="555" y1="60" x2="555" y2="200" stroke="#64748b"/>
<line x1="85" y1="90" x2="555" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">1. Broadcast: who has 10.10.10.1?</text>
<line x1="555" y1="130" x2="85" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">2. Unicast reply: 10.10.10.1 is 00de.fb12.3401</text>
<line x1="85" y1="170" x2="555" y2="170" stroke="#64748b" stroke-width="3"/><text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="12">3. IP packet to 10.10.20.21, frame to gateway MAC</text>
</svg><p class="cap">The request is broadcast within the VLAN; the reply is unicast; then data flows.</p></div>

<pre class="out">LEAF1# show ip arp
IP ARP Table for context default
Total number of entries: 2
Address         Age       MAC Address     Interface       Flags
<span class="hl">10.10.10.11     00:04:12  0050.56a1.0b11  Vlan10</span>
10.10.20.21     00:00:37  0050.56a1.1421  Vlan20</pre>
<p>NX-OS keeps ARP entries for <b>1500 seconds</b> by default, less than the 1800-second MAC aging, so ARP refreshes keep MAC entries alive. A <b>gratuitous ARP</b> is an unsolicited ARP a host sends about its own IP, used after a failover or VM move to update everyone's tables. If ARP for a host shows <code>INCOMPLETE</code> on other platforms, or the entry is missing, the host is not answering: check its VLAN, cable and IP settings.</p>

<div class="warn"><p><b>Common mistakes.</b> Using /30 on fabric links and wasting half the addresses. Overlapping subnets across tenants in the same VRF. A server with the right IP but a /16 mask that thinks remote hosts are local and ARPs for them instead of using the gateway.</p></div>
<div class="exam"><p><b>Exam tip.</b> Block size = 256 minus mask octet. /31 is valid on point-to-point links (RFC 3021). ARP request = broadcast, reply = unicast. NX-OS defaults: ARP 1500 s, MAC aging 1800 s.</p></div>

<div class="scn"><h4>Half the servers cannot reach the new subnet</h4><p>A new database subnet 10.10.64.0/24 was added. Web servers built last year could reach it; older ones could not. <code>show ip arp</code> on the leaf showed no entries for the old servers when they tried. On an old server, the route table showed a much larger directly connected network: it had been built years ago with a 10.10.0.0/17 mask, which covers 10.10.0.0 to 10.10.127.255 and therefore includes 10.10.64.x. Those servers believed the database was local and ARPed for it directly instead of using the gateway. Fixing the mask to /24 solved it.</p><p><b>Lesson:</b> when some hosts work and others do not, compare masks and gateways first.</p></div>

<div class="iv"><p class="q">"Why do we use /31 on spine-leaf links and /32 on loopbacks?"</p><p>Strong answer: a point-to-point link has exactly two devices, so RFC 3021 lets both /31 addresses be used without network and broadcast addresses, halving address consumption versus /30. Loopbacks are /32 because they identify the router (router ID, BGP peering, VTEP) and never go down with a physical port. Add that server VLANs are usually /24 and that ARP resolves the gateway MAC before the first packet.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 = 32 bits; prefix length splits network and host parts.</li>
<li>Subnet fast: block size = 256 minus mask octet; networks are multiples of it.</li>
<li>DC pattern: /24 server VLANs, /31 fabric links, /32 loopbacks.</li>
<li>Hosts send off-subnet traffic to the default gateway; ARP maps IP to MAC (broadcast request, unicast reply).</li>
<li>NX-OS: ARP 1500 s, MAC 1800 s; check with <code>show ip arp</code>.</li>
</ul></div>
`,hi:`
<p>MAC address ek insaan ke naam jaisa hai: ek kamre ke andar kaam ka, dusre shehar mein use dhoondhne ke liye bekaar. <b>IP address</b> postal address jaisa hai: iska ek hissa batata hai kaunsi gali (<b>network</b>) aur ek hissa kaunsa ghar (<b>host</b>). Routers sirf gali ki parwah karte hain; aakhri switch ghar ki. Is chapter mein aap addresses ko jaldi baantna, data center addressing scheme plan karna aur ARP follow karna seekhoge, woh protocol jo IP address ko MAC address mein badalta hai.</p>

<h3>IPv4 ek paragraph mein</h3>
<p>IPv4 address <b>32 bits</b> ka hota hai, chaar decimal octets mein likha hua (10.10.10.11). <b>Prefix length</b> jaise /24 batata hai ki shuru ke kitne bits network part hain; yahi cheez likhne ka purana tareeka <b>subnet mask</b> hai (255.255.255.0). Subnet ka pehla address <b>network address</b> hai, aakhri <b>broadcast address</b>, aur beech ka sab hosts ke liye usable hai. Private ranges (RFC 1918) 10.0.0.0/8, 172.16.0.0/12 aur 192.168.0.0/16 hain; data centers inhe andar use karte hain aur zaroorat ho to edge par translate karte hain.</p>

<h3>Fast subnetting: block-size method</h3>
<ol>
<li><b>Interesting octet</b> dhoondho: woh jahan mask 255 ya 0 nahi hai.</li>
<li><b>Block size</b> = 256 minus us octet ki mask value.</li>
<li>Network addresses block size ke multiples hote hain. Broadcast agla network minus ek hota hai.</li>
</ol>
<div class="eg"><p><b>Worked example 1.</b> Host 10.10.10.77/26. Mask 255.255.255.192, interesting octet 4th hai, block = 256 minus 192 = 64. 64 ke multiples: 0, 64, 128, 192. 77, 64 wale block mein aata hai. Network <b>10.10.10.64</b>, broadcast <b>10.10.10.127</b>, hosts .65 se .126 (62 hosts).</p>
<p><b>Worked example 2.</b> Host 10.20.37.200/20. Mask 255.255.240.0, interesting octet 3rd hai, block = 16. 16 ke multiples: 32, 48; 37, 32 mein hai. Network <b>10.20.32.0</b>, broadcast <b>10.20.47.255</b>, 4094 usable hosts.</p>
<p><b>Kaam ke sizes:</b> /24 = 256 addresses (254 hosts), /25 = 128, /26 = 64, /27 = 32, /28 = 16, /29 = 8, /30 = 4, /31 = 2, /32 = 1. Usable hosts = 2^(32 minus prefix) minus 2, /31 aur /32 ko chhod kar.</p></div>

<h3>Woh teen prefix lengths jo DC mein har jagah milti hain</h3>
<table class="cmp"><tr><th>Prefix</th><th>Kiske liye</th><th>Kyun</th></tr>
<tr><td>/24 (ya /23, /22)</td><td>Server VLANs (SVIs)</td><td>Ek rack ya servers ke tier ke liye jagah; padhne mein aasaan</td></tr>
<tr><td>/31</td><td>Point-to-point leaf se spine links</td><td>RFC 3021: do devices wale link par network ya broadcast ki zaroorat nahi, isliye dono addresses usable; /30 ke comparison mein aadha address use</td></tr>
<tr><td>/32</td><td>Loopbacks (router ID, VTEP address)</td><td>Ek single address jo physical link ke saath kabhi down nahi hota</td></tr></table>

<div class="eg"><p><b>Worked example 3: ek chhota fabric plan karo.</b> 4 spines aur 24 leaves matlab 4 × 24 = 96 point-to-point links. Har /31 2 addresses use karta hai: 96 × 2 = 192 addresses, jo ek /24 (10.1.0.0/24) mein fit ho jaate hain. Loopbacks: 28 switches ko 28 /32s chahiye; router IDs ke liye 10.255.0.0/24 aur VTEP addresses ke liye 10.254.0.0/24 reserve karo. Server VLANs ko har tenant ya tier ke liye 10.10.x.0/24 milta hai. Aisa saaf plan har show command ko ek nazar mein readable bana deta hai.</p></div>

<pre class="code"><span class="c">! NX-OS par routed /31 uplink aur /32 loopback (CIDR notation)</span>
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# no switchport
LEAF1(config-if)# ip address 10.1.0.1/31
LEAF1(config-if)# no shutdown
LEAF1(config)# interface loopback0
LEAF1(config-if)# ip address 10.255.0.1/32
<span class="c">! server VLAN gateway (SVI) ko feature interface-vlan chahiye</span>
LEAF1(config)# feature interface-vlan
LEAF1(config)# interface vlan 10
LEAF1(config-if)# ip address 10.10.10.1/24
LEAF1(config-if)# no shutdown</pre>

<h3>Default gateway</h3>
<p>Host destination ko apne subnet se compare karta hai. Same subnet: seedha deliver karo. Alag subnet: <b>default gateway</b> ko bhejo, yaani apne subnet mein router interface (DC mein, leaf ka SVI ya anycast gateway). Server par galat gateway ya galat mask sabse common "network" tickets mein se ek hai.</p>

<h3>ARP, step by step</h3>
<p>Frame banane ke liye host ko destination MAC chahiye. <b>ARP</b> (Address Resolution Protocol, EtherType 0x0806) use dhoondhta hai.</p>
<ol>
<li>WEB1 (10.10.10.11) APP1 (10.10.20.21) tak pahunchna chahta hai. Alag subnet, isliye next hop gateway 10.10.10.1 hai.</li>
<li>WEB1 apna ARP cache check karta hai; khaali. Woh VLAN 10 mein <code>ffff.ffff.ffff</code> ko broadcast karta hai "10.10.10.1 kiske paas hai? 10.10.10.11 ko batao".</li>
<li>Leaf SVI unicast mein reply karta hai "10.10.10.1, 00de.fb12.3401 par hai" (uska router MAC). Dono sides result cache karte hain.</li>
<li>WEB1 APP1 ke IP wala IP packet gateway MAC par addressed frame ke andar bhejta hai.</li>
<li>Leaf use VLAN 20 mein route karta hai, zaroorat ho to 10.10.20.21 ke liye ARP karta hai, Ethernet header dobara likhta hai aur deliver karta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ARP request aur reply">
<rect x="20" y="20" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="12">WEB1 .11</text>
<rect x="490" y="20" width="130" height="40" rx="6" fill="#bae6fd"/><text x="555" y="45" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 SVI .1</text>
<line x1="85" y1="60" x2="85" y2="200" stroke="#64748b"/><line x1="555" y1="60" x2="555" y2="200" stroke="#64748b"/>
<line x1="85" y1="90" x2="555" y2="90" stroke="#64748b" stroke-width="2"/><text x="320" y="84" text-anchor="middle" class="svg-muted" font-size="12">1. Broadcast: 10.10.10.1 kiske paas?</text>
<line x1="555" y1="130" x2="85" y2="130" stroke="#64748b" stroke-width="2"/><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">2. Unicast reply: 10.10.10.1 = 00de.fb12.3401</text>
<line x1="85" y1="170" x2="555" y2="170" stroke="#64748b" stroke-width="3"/><text x="320" y="164" text-anchor="middle" class="svg-accent" font-size="12">3. IP packet 10.10.20.21 ko, frame gateway MAC ko</text>
</svg><p class="cap">Request VLAN ke andar broadcast hoti hai; reply unicast; phir data chalta hai.</p></div>

<pre class="out">LEAF1# show ip arp
IP ARP Table for context default
Total number of entries: 2
Address         Age       MAC Address     Interface       Flags
<span class="hl">10.10.10.11     00:04:12  0050.56a1.0b11  Vlan10</span>
10.10.20.21     00:00:37  0050.56a1.1421  Vlan20</pre>
<p>NX-OS ARP entries ko default mein <b>1500 seconds</b> rakhta hai, 1800-second MAC aging se kam, isliye ARP refreshes MAC entries ko zinda rakhte hain. <b>Gratuitous ARP</b> ek bina maange ARP hai jo host apne IP ke baare mein bhejta hai, failover ya VM move ke baad sabke tables update karne ke liye. Agar kisi host ki ARP entry missing hai (dusre platforms par <code>INCOMPLETE</code> dikhta hai), to host jawab nahi de raha: uska VLAN, cable aur IP settings check karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> Fabric links par /30 use karke aadhe addresses waste karna. Same VRF mein tenants ke beech overlapping subnets. Sahi IP lekin /16 mask wala server jo remote hosts ko local samajhta hai aur gateway use karne ki jagah unke liye ARP karta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Block size = 256 minus mask octet. /31 point-to-point links par valid hai (RFC 3021). ARP request = broadcast, reply = unicast. NX-OS defaults: ARP 1500 s, MAC aging 1800 s.</p></div>

<div class="scn"><h4>Aadhe servers naye subnet tak nahi pahunch pa rahe</h4><p>Ek naya database subnet 10.10.64.0/24 joda gaya. Pichhle saal bane web servers wahan pahunch sakte the; purane nahi. Leaf par <code>show ip arp</code> ne purane servers ke try karne par koi entry nahi dikhayi. Ek purane server par route table ne ek bada network directly connected dikhaya: use saalon pehle 10.10.0.0/17 mask ke saath banaya gaya tha, jisme 10.10.64.x bhi aata hai. Isliye woh servers gateway use karne ki jagah database ke liye seedha ARP kar rahe the. Mask ko /24 karne se problem solve ho gayi.</p><p><b>Seekh:</b> jab kuch hosts kaam karein aur kuch nahi, pehle masks aur gateways compare karo.</p></div>

<div class="iv"><p class="q">"Spine-leaf links par /31 aur loopbacks par /32 kyun use karte hain?"</p><p>Strong answer: point-to-point link par exactly do devices hote hain, isliye RFC 3021 dono /31 addresses ko bina network aur broadcast address ke use karne deta hai, /30 ke comparison mein address use aadha. Loopbacks /32 hote hain kyunki woh router ko identify karte hain (router ID, BGP peering, VTEP) aur physical port ke saath kabhi down nahi hote. Yeh bhi jodo ki server VLANs aam taur par /24 hote hain aur pehle packet se pehle ARP gateway MAC resolve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 = 32 bits; prefix length network aur host parts ko baant-ta hai.</li>
<li>Fast subnet: block size = 256 minus mask octet; networks uske multiples hain.</li>
<li>DC pattern: /24 server VLANs, /31 fabric links, /32 loopbacks.</li>
<li>Hosts off-subnet traffic default gateway ko bhejte hain; ARP IP ko MAC se map karta hai (broadcast request, unicast reply).</li>
<li>NX-OS: ARP 1500 s, MAC 1800 s; <code>show ip arp</code> se check karo.</li>
</ul></div>
`}};export{e as default};