var e={id:`mtu`,h:{en:`MTU, jumbo frames and fragmentation`,hi:`MTU, jumbo frames aur fragmentation`},body:{en:`
<p>Imagine a road with a low bridge. Trucks up to 4 metres pass; a 4.2-metre truck must either be unloaded into two smaller trucks (slow, expensive) or turned back. If nobody tells the driver about the bridge, he keeps sending tall trucks and they keep getting turned back. <b>MTU</b> (maximum transmission unit) is the height of the bridge, <b>fragmentation</b> is splitting the load, and <b>path MTU discovery</b> is the warning sign. MTU mistakes cause some of the strangest data center outages: small pings work, big transfers hang.</p>

<h3>What MTU means exactly</h3>
<p>The <b>IP MTU</b> is the largest IP packet (IP header plus payload) an interface will send without fragmenting. Standard Ethernet MTU is <b>1500 bytes</b>. The Ethernet header (14), optional 802.1Q tag (4) and FCS (4) are extra, so a 1500-byte packet becomes a 1518 or 1522-byte frame. On Cisco switches the interface <code>mtu</code> command sets the largest frame payload the port accepts; frames bigger than that are dropped and counted as <b>giants</b> or input errors.</p>

<h3>Jumbo frames</h3>
<p><b>Jumbo frames</b> are anything above 1500, typically <b>9000</b> bytes on hosts. Fewer, larger packets mean less CPU per gigabyte and better throughput for storage (iSCSI, NFS), vMotion, backup and AI clusters. The rule that saves you: <b>switches must be at least as large as anything the hosts send, plus any encapsulation</b>. That is why data center switches are set to <b>9216</b>, the maximum on Nexus, everywhere in the fabric, while hosts use 9000.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="VXLAN overhead">
<rect x="10" y="20" width="620" height="36" rx="4" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">Host packet from a VM: 1500 bytes (inner IP header + data)</text>
<rect x="10" y="80" width="70" height="36" rx="4" fill="#bae6fd"/><text x="45" y="103" text-anchor="middle" class="svg-ink" font-size="12">Out Eth</text>
<rect x="80" y="80" width="80" height="36" rx="4" fill="#ddd6fe"/><text x="120" y="103" text-anchor="middle" class="svg-ink" font-size="12">IP 20</text>
<rect x="160" y="80" width="70" height="36" rx="4" fill="#fed7aa"/><text x="195" y="103" text-anchor="middle" class="svg-ink" font-size="12">UDP 8</text>
<rect x="230" y="80" width="80" height="36" rx="4" fill="#fde68a"/><text x="270" y="103" text-anchor="middle" class="svg-ink" font-size="12">VXLAN 8</text>
<rect x="310" y="80" width="80" height="36" rx="4" fill="#bbf7d0"/><text x="350" y="103" text-anchor="middle" class="svg-ink" font-size="12">In Eth 14</text>
<rect x="390" y="80" width="240" height="36" rx="4" fill="#e2e8f0"/><text x="510" y="103" text-anchor="middle" class="svg-ink" font-size="12">Inner packet 1500</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Outer IP packet = 20 + 8 + 8 + 14 + 1500 = 1550 bytes</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fabric links need an MTU above 1550; the DC standard is 9216</text>
</svg><p class="cap">VXLAN adds 50 bytes to every packet that crosses the fabric.</p></div>

<div class="eg"><p><b>Worked example: VXLAN math.</b> A VM sends a 1500-byte IP packet. The leaf (VTEP) wraps the whole inner Ethernet frame without its FCS (14 + 1500 = 1514) in VXLAN (8), UDP (8) and an outer IP header (20): <b>1550 bytes</b> of outer IP packet. Plus the outer Ethernet header on the wire. If a spine link is left at MTU 1500, every full-size packet is dropped (VXLAN sets the DF bit, and switches do not fragment in hardware). With the fabric at 9216, hosts can even use 9000-byte jumbo frames: 9000 + 50 = 9050, still well under 9216.</p></div>

<h3>Fragmentation, and why it is bad</h3>
<p>If an IPv4 packet is larger than the next link's MTU and the <b>DF</b> (don't fragment) bit is <b>clear</b>, a router may split it into <b>fragments</b>. The receiver must reassemble them. Why this hurts:</p>
<ul>
<li>Fragmentation and reassembly cost CPU, often in software, not hardware.</li>
<li>Losing one fragment loses the whole packet; retransmissions multiply.</li>
<li>Later fragments carry no TCP or UDP ports, so firewalls, load balancers and ECMP hashing treat them differently or drop them.</li>
<li><b>IPv6 routers never fragment</b>; only the source can, and the minimum IPv6 MTU is 1280.</li>
</ul>

<h3>Path MTU discovery (PMTUD)</h3>
<p>Modern hosts send TCP with <b>DF set</b>. If a packet is too big, the router drops it and returns <b>ICMP type 3 code 4 "fragmentation needed"</b> with the next-hop MTU (in IPv6, <b>ICMPv6 type 2 "Packet Too Big"</b>). The sender lowers its packet size for that destination. If a firewall blocks those ICMP messages, the sender never learns: the TCP handshake (small packets) works, then the first full-size data packet vanishes. This is a <b>PMTUD black hole</b>, and the symptom is always "it connects, then hangs".</p>

<h3>Configuring and verifying MTU on NX-OS</h3>
<pre class="code"><span class="c">! routed fabric uplink</span>
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# mtu 9216
<span class="c">! server-facing trunk carrying jumbo frames</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# mtu 9216
<span class="c">! the SVI has its own MTU (for routed traffic in that VLAN)</span>
LEAF1(config)# interface vlan 10
LEAF1(config-if)# mtu 9216</pre>
<pre class="out">LEAF1# show interface Ethernet1/49 | include MTU
<span class="hl">  MTU 9216 bytes, BW 100000000 Kbit/sec, DLY 10 usec</span></pre>
<p>Test the path, not just the config, with a large ping that is not allowed to fragment. On NX-OS <code>packet-size</code> is the ICMP data size, so add 28 bytes (20 IP + 8 ICMP) to get the IP packet size:</p>
<pre class="code"><span class="c">! 8972 + 28 = 9000-byte IP packet, DF bit set</span>
LEAF1# ping 10.1.0.0 df-bit packet-size 8972 count 3
<span class="c">! from a Linux host: -M do sets DF, -s is the data size</span>
server$ ping -M do -s 8972 10.10.20.21</pre>
<pre class="out">PING 10.1.0.0 (10.1.0.0): 8972 data bytes
<span class="hl">8980 bytes from 10.1.0.0: icmp_seq=0 ttl=254 time=1.201 ms</span>
8980 bytes from 10.1.0.0: icmp_seq=1 ttl=254 time=0.912 ms
8980 bytes from 10.1.0.0: icmp_seq=2 ttl=254 time=0.887 ms</pre>
<p>If one hop is still at 1500, the same ping returns <code>Request 0 timed out</code> while a normal small ping succeeds: a clear MTU fingerprint. Also remember that <b>OSPF checks MTU</b> in its database description packets: mismatched MTUs leave neighbours stuck in <b>ExStart/Exchange</b>. Fix the MTU; <code>ip ospf mtu-ignore</code> only hides the problem.</p>

<div class="warn"><p><b>Common mistakes.</b> Raising MTU on hosts before the switches. Setting physical ports to 9216 but forgetting the SVI or port-channel. Testing with a default 56-byte ping and declaring the path healthy. Blocking all ICMP on firewalls, which breaks PMTUD.</p></div>
<div class="exam"><p><b>Exam tip.</b> Standard MTU 1500, jumbo 9000 on hosts, 9216 on Nexus. VXLAN overhead 50 bytes (outer IP 20 + UDP 8 + VXLAN 8 + inner Ethernet 14). ICMP type 3 code 4 and ICMPv6 Packet Too Big drive PMTUD. IPv6 routers do not fragment. OSPF MTU mismatch = stuck in ExStart/Exchange.</p></div>

<div class="scn"><h4>vMotion that failed at exactly 14%</h4><p>A new rack was connected to the fabric, and vMotion between old and new racks started failing part-way, while small pings between the vMotion VMkernel ports worked. The ESXi hosts used MTU 9000. <code>vmkping -d -s 8972</code> from a host failed, but <code>-s 1472</code> worked. On the new leaf, <code>show interface Ethernet1/50 | include MTU</code> showed 1500 on one of the two spine uplinks; the port had been added by hand instead of from the template. ECMP sent some flows over the good link and some over the bad one, which is why only some migrations failed. Setting <code>mtu 9216</code> fixed it.</p><p><b>Lesson:</b> MTU must be consistent on every hop; test with DF-set pings at full size on every path.</p></div>

<div class="iv"><p class="q">"Why do VXLAN fabrics use MTU 9216, and how do you prove the MTU is right?"</p><p>Strong answer: VXLAN adds 50 bytes (outer IP, UDP, VXLAN header and the inner Ethernet header), and switches do not fragment in hardware, so fabric links must exceed host MTU plus 50; 9216 allows even 9000-byte host jumbo frames. Prove it with a DF-set ping at full size, for example <code>ping x df-bit packet-size 8972</code> on NX-OS, across every path, and check <code>show interface</code> MTU on physical ports, port-channels and SVIs. Mention PMTUD black holes and OSPF ExStart as symptoms.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MTU = largest IP packet; 1500 standard, 9000 jumbo on hosts, 9216 on Nexus switches.</li>
<li>Fragmentation is slow and fragile; IPv6 routers never fragment.</li>
<li>PMTUD relies on ICMP "fragmentation needed" / "Packet Too Big"; blocking them creates black holes.</li>
<li>VXLAN adds 50 bytes; set fabric links, port-channels and SVIs to 9216.</li>
<li>Verify with <code>ping ... df-bit packet-size 8972</code>; watch for OSPF stuck in ExStart.</li>
</ul></div>
`,hi:`
<p>Ek road socho jisme ek neecha bridge hai. 4 metre tak ke trucks guzar jaate hain; 4.2-metre ke truck ko ya to do chhote trucks mein unload karna padta hai (dheema, mehenga) ya wapas bhejna padta hai. Agar koi driver ko bridge ke baare mein na bataaye, to woh lambe trucks bhejta rehta hai aur woh wapas aate rehte hain. <b>MTU</b> (maximum transmission unit) bridge ki oonchaai hai, <b>fragmentation</b> load baantna hai, aur <b>path MTU discovery</b> warning sign hai. MTU galtiyan data center ke sabse ajeeb outages ki wajah banti hain: chhote pings chalte hain, bade transfers atak jaate hain.</p>

<h3>MTU ka exact matlab</h3>
<p><b>IP MTU</b> sabse bada IP packet (IP header plus payload) hai jo interface bina fragment kiye bhejega. Standard Ethernet MTU <b>1500 bytes</b> hai. Ethernet header (14), optional 802.1Q tag (4) aur FCS (4) extra hain, isliye 1500-byte packet 1518 ya 1522-byte frame ban jaata hai. Cisco switches par interface <code>mtu</code> command port ke accept karne wala sabse bada frame payload set karta hai; usse bade frames drop hote hain aur <b>giants</b> ya input errors mein count hote hain.</p>

<h3>Jumbo frames</h3>
<p><b>Jumbo frames</b> 1500 se upar kuch bhi hote hain, hosts par aam taur par <b>9000</b> bytes. Kam, bade packets ka matlab per gigabyte kam CPU aur storage (iSCSI, NFS), vMotion, backup aur AI clusters ke liye behtar throughput. Jo rule aapko bachata hai: <b>switches kam se kam utne bade hone chahiye jitna hosts bhejte hain, plus koi bhi encapsulation</b>. Isiliye data center switches poore fabric mein <b>9216</b> par set hote hain, jo Nexus par maximum hai, jabki hosts 9000 use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="VXLAN overhead">
<rect x="10" y="20" width="620" height="36" rx="4" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">VM ka host packet: 1500 bytes (inner IP header + data)</text>
<rect x="10" y="80" width="70" height="36" rx="4" fill="#bae6fd"/><text x="45" y="103" text-anchor="middle" class="svg-ink" font-size="12">Out Eth</text>
<rect x="80" y="80" width="80" height="36" rx="4" fill="#ddd6fe"/><text x="120" y="103" text-anchor="middle" class="svg-ink" font-size="12">IP 20</text>
<rect x="160" y="80" width="70" height="36" rx="4" fill="#fed7aa"/><text x="195" y="103" text-anchor="middle" class="svg-ink" font-size="12">UDP 8</text>
<rect x="230" y="80" width="80" height="36" rx="4" fill="#fde68a"/><text x="270" y="103" text-anchor="middle" class="svg-ink" font-size="12">VXLAN 8</text>
<rect x="310" y="80" width="80" height="36" rx="4" fill="#bbf7d0"/><text x="350" y="103" text-anchor="middle" class="svg-ink" font-size="12">In Eth 14</text>
<rect x="390" y="80" width="240" height="36" rx="4" fill="#e2e8f0"/><text x="510" y="103" text-anchor="middle" class="svg-ink" font-size="12">Inner packet 1500</text>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Outer IP packet = 20 + 8 + 8 + 14 + 1500 = 1550 bytes</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Fabric links ko 1550 se upar MTU chahiye; DC standard 9216 hai</text>
</svg><p class="cap">VXLAN fabric paar karne wale har packet mein 50 bytes jodta hai.</p></div>

<div class="eg"><p><b>Worked example: VXLAN math.</b> Ek VM 1500-byte IP packet bhejta hai. Leaf (VTEP) poore inner Ethernet frame ko bina FCS ke (14 + 1500 = 1514) VXLAN (8), UDP (8) aur outer IP header (20) mein lapet-ta hai: <b>1550 bytes</b> ka outer IP packet. Plus wire par outer Ethernet header. Agar koi spine link MTU 1500 par chhoda gaya, to har full-size packet drop hoga (VXLAN DF bit set karta hai, aur switches hardware mein fragment nahi karte). Fabric 9216 par ho to hosts 9000-byte jumbo frames bhi use kar sakte hain: 9000 + 50 = 9050, phir bhi 9216 se kaafi neeche.</p></div>

<h3>Fragmentation, aur yeh bura kyun hai</h3>
<p>Agar IPv4 packet agle link ke MTU se bada hai aur <b>DF</b> (don't fragment) bit <b>clear</b> hai, to router use <b>fragments</b> mein baant sakta hai. Receiver ko unhe dobara jodna padta hai. Yeh kyun nuksaan karta hai:</p>
<ul>
<li>Fragmentation aur reassembly CPU khaate hain, aksar software mein, hardware mein nahi.</li>
<li>Ek fragment khone se poora packet kho jaata hai; retransmissions badh jaate hain.</li>
<li>Baad ke fragments mein TCP ya UDP ports nahi hote, isliye firewalls, load balancers aur ECMP hashing unhe alag treat karte hain ya drop kar dete hain.</li>
<li><b>IPv6 routers kabhi fragment nahi karte</b>; sirf source kar sakta hai, aur minimum IPv6 MTU 1280 hai.</li>
</ul>

<h3>Path MTU discovery (PMTUD)</h3>
<p>Modern hosts TCP ko <b>DF set</b> ke saath bhejte hain. Agar packet bahut bada hai, router use drop karta hai aur next-hop MTU ke saath <b>ICMP type 3 code 4 "fragmentation needed"</b> lautata hai (IPv6 mein <b>ICMPv6 type 2 "Packet Too Big"</b>). Sender us destination ke liye apna packet size kam kar deta hai. Agar koi firewall un ICMP messages ko block kare, to sender kabhi nahi seekhta: TCP handshake (chhote packets) chal jaata hai, phir pehla full-size data packet gayab ho jaata hai. Yeh <b>PMTUD black hole</b> hai, aur symptom hamesha "connect hota hai, phir atak jaata hai" hota hai.</p>

<h3>NX-OS par MTU configure aur verify karna</h3>
<pre class="code"><span class="c">! routed fabric uplink</span>
LEAF1(config)# interface Ethernet1/49
LEAF1(config-if)# mtu 9216
<span class="c">! jumbo frames le jaane wala server-facing trunk</span>
LEAF1(config)# interface Ethernet1/5
LEAF1(config-if)# mtu 9216
<span class="c">! SVI ka apna MTU hota hai (us VLAN ke routed traffic ke liye)</span>
LEAF1(config)# interface vlan 10
LEAF1(config-if)# mtu 9216</pre>
<pre class="out">LEAF1# show interface Ethernet1/49 | include MTU
<span class="hl">  MTU 9216 bytes, BW 100000000 Kbit/sec, DLY 10 usec</span></pre>
<p>Sirf config nahi, path ko test karo, ek bade ping se jise fragment hone ki ijaazat nahi. NX-OS par <code>packet-size</code> ICMP data size hai, isliye IP packet size ke liye 28 bytes (20 IP + 8 ICMP) jodo:</p>
<pre class="code"><span class="c">! 8972 + 28 = 9000-byte IP packet, DF bit set</span>
LEAF1# ping 10.1.0.0 df-bit packet-size 8972 count 3
<span class="c">! Linux host se: -M do DF set karta hai, -s data size hai</span>
server$ ping -M do -s 8972 10.10.20.21</pre>
<pre class="out">PING 10.1.0.0 (10.1.0.0): 8972 data bytes
<span class="hl">8980 bytes from 10.1.0.0: icmp_seq=0 ttl=254 time=1.201 ms</span>
8980 bytes from 10.1.0.0: icmp_seq=1 ttl=254 time=0.912 ms
8980 bytes from 10.1.0.0: icmp_seq=2 ttl=254 time=0.887 ms</pre>
<p>Agar koi ek hop abhi bhi 1500 par hai, to wahi ping <code>Request 0 timed out</code> lautata hai jabki normal chhota ping successful hota hai: saaf MTU fingerprint. Yeh bhi yaad rakho ki <b>OSPF MTU check karta hai</b> apne database description packets mein: mismatched MTUs neighbours ko <b>ExStart/Exchange</b> mein atka dete hain. MTU theek karo; <code>ip ospf mtu-ignore</code> sirf problem chhupata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Switches se pehle hosts par MTU badhana. Physical ports ko 9216 par set karna lekin SVI ya port-channel bhoolna. Default 56-byte ping se test karke path ko healthy ghoshit karna. Firewalls par saara ICMP block karna, jo PMTUD tod deta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> Standard MTU 1500, hosts par jumbo 9000, Nexus par 9216. VXLAN overhead 50 bytes (outer IP 20 + UDP 8 + VXLAN 8 + inner Ethernet 14). ICMP type 3 code 4 aur ICMPv6 Packet Too Big PMTUD chalate hain. IPv6 routers fragment nahi karte. OSPF MTU mismatch = ExStart/Exchange mein atka.</p></div>

<div class="scn"><h4>vMotion jo theek 14% par fail hota tha</h4><p>Ek naya rack fabric se joda gaya, aur purane aur naye racks ke beech vMotion beech mein fail hone laga, jabki vMotion VMkernel ports ke beech chhote pings chal rahe the. ESXi hosts MTU 9000 use karte the. Host se <code>vmkping -d -s 8972</code> fail hua, lekin <code>-s 1472</code> chal gaya. Naye leaf par <code>show interface Ethernet1/50 | include MTU</code> ne do spine uplinks mein se ek par 1500 dikhaya; port template se nahi, haath se joda gaya tha. ECMP kuch flows ko achhe link par aur kuch ko kharab par bhej raha tha, isiliye sirf kuch migrations fail hue. <code>mtu 9216</code> set karne se theek ho gaya.</p><p><b>Seekh:</b> MTU har hop par consistent hona chahiye; har path par full size ke DF-set pings se test karo.</p></div>

<div class="iv"><p class="q">"VXLAN fabrics MTU 9216 kyun use karte hain, aur aap kaise prove karoge ki MTU sahi hai?"</p><p>Strong answer: VXLAN 50 bytes jodta hai (outer IP, UDP, VXLAN header aur inner Ethernet header), aur switches hardware mein fragment nahi karte, isliye fabric links host MTU plus 50 se zyada hone chahiye; 9216 9000-byte host jumbo frames ko bhi allow karta hai. Ise full size ke DF-set ping se prove karo, jaise NX-OS par <code>ping x df-bit packet-size 8972</code>, har path par, aur physical ports, port-channels aur SVIs par <code>show interface</code> MTU check karo. Symptoms ki tarah PMTUD black holes aur OSPF ExStart ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MTU = sabse bada IP packet; 1500 standard, hosts par 9000 jumbo, Nexus switches par 9216.</li>
<li>Fragmentation dheemi aur naazuk hai; IPv6 routers kabhi fragment nahi karte.</li>
<li>PMTUD ICMP "fragmentation needed" / "Packet Too Big" par tika hai; inhe block karne se black holes bante hain.</li>
<li>VXLAN 50 bytes jodta hai; fabric links, port-channels aur SVIs ko 9216 par set karo.</li>
<li><code>ping ... df-bit packet-size 8972</code> se verify karo; ExStart mein atke OSPF par nazar rakho.</li>
</ul></div>
`}};export{e as default};