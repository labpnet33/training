var e={id:`hop-by-hop`,h:{en:`What changes hop by hop: switch, router, ARP and TTL`,hi:`Hop by hop kya badalta hai: switch, router, ARP aur TTL`},body:{en:`
<p>Back to the courier. Your parcel's waybill says "Delhi to Bengaluru" for the whole trip. But the first truck only goes from your house to the Delhi hub; its driver needs the hub's gate number, not Bengaluru. At the hub the parcel is unloaded, the waybill is read, a counter is stamped, and it goes onto a new truck with a new driver to the next hub. This chapter is that story with real addresses, and it is exactly what Lab 1 asks you to prove from the capture.</p>

<h3>Step 1: PC1 decides where to send the frame</h3>
<p>PC1 (10.1.1.10/24) wants to reach 203.0.113.80. It compares the destination with its own subnet. 203.0.113.80 is <b>not</b> inside 10.1.1.0/24, so PC1 must send the packet to its <b>default gateway</b>, 10.1.1.1. The IP destination stays 203.0.113.80; only the Layer 2 destination becomes the gateway. If the destination were local (say 10.1.1.20), PC1 would send straight to that host's MAC instead.</p>

<h3>Step 2: ARP finds the gateway's MAC</h3>
<p>PC1 knows the gateway's IP but not its MAC, so it uses <b>ARP</b> (Address Resolution Protocol, EtherType 0x0806). The request is a <b>broadcast</b> to ffff.ffff.ffff: "Who has 10.1.1.1? Tell 10.1.1.10". Every device in the VLAN receives it; only R1 answers with a <b>unicast</b> reply: "10.1.1.1 is at 52:54:0c:04:4b:01". PC1 caches it in its ARP table (our lab PCs keep entries for 120 seconds; Cisco routers keep them for 4 hours by default).</p>
<pre class="out">No. Source              Destination         Protocol Info
1   52:54:00:a1:00:10   ff:ff:ff:ff:ff:ff   ARP      <span class="hl">Who has 10.1.1.1? Tell 10.1.1.10</span>
2   52:54:0c:04:4b:01   52:54:00:a1:00:10   ARP      10.1.1.1 is at 52:54:0c:04:4b:01
3   10.1.1.10           203.0.113.80        TCP      49875 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460</pre>

<h3>Step 3: SW1 forwards the frame unchanged</h3>
<p>SW1 learns PC1's MAC on Gi0/1, looks up the destination MAC 5254.0c04.4b01, finds it on Gi0/0, and sends the frame out unchanged. MACs, IPs, TTL, checksum: nothing is touched. A switch is transparent.</p>

<h3>Step 4: R1 routes and rewrites</h3>
<ol>
<li>R1 receives the frame on Gi0/0, checks the FCS and that the destination MAC is its own.</li>
<li>It strips the Ethernet header and trailer (they have done their job).</li>
<li>It looks up 203.0.113.80 in the routing table and finds the connected route 203.0.113.0/24 out of Gi0/1.</li>
<li>It decrements <b>TTL from 64 to 63</b> (if it reached 0 it would drop the packet and send ICMP Time Exceeded) and recalculates the <b>header checksum</b>.</li>
<li>It ARPs on Gi0/1 for 203.0.113.80 if the MAC is not already cached.</li>
<li>It builds a <b>new frame</b>: source MAC = R1 Gi0/1, destination MAC = SRV, EtherType 0x0800, new FCS.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Headers on each link">
<text x="110" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1 to SW1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1 to R1</text><text x="530" y="20" text-anchor="middle" class="svg-ink" font-size="13">R1 to SRV</text>
<rect x="20" y="30" width="180" height="60" rx="6" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: PC1</text><text x="110" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: R1 Gi0/0</text>
<rect x="230" y="30" width="180" height="60" rx="6" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: PC1</text><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: R1 Gi0/0</text>
<rect x="440" y="30" width="180" height="60" rx="6" fill="#fed7aa"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: R1 Gi0/1</text><text x="530" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: SRV</text>
<rect x="20" y="100" width="180" height="60" rx="6" fill="#ddd6fe"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 to 203.0.113.80</text><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 64</text>
<rect x="230" y="100" width="180" height="60" rx="6" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 to 203.0.113.80</text><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 64</text>
<rect x="440" y="100" width="180" height="60" rx="6" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 to 203.0.113.80</text><text x="530" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 63</text>
<rect x="20" y="170" width="600" height="34" rx="6" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">TCP 49875 to 80 and the HTTP data: identical on every link</text>
<text x="320" y="232" text-anchor="middle" class="svg-accent" font-size="12">Orange = changed by R1. The switch changed nothing.</text>
</svg><p class="cap">The same SYN seen on the three links of the lab.</p></div>

<h3>Proving it on R1</h3>
<pre class="code"><span class="c">! Lab 1 task: the destination MAC of PC1's SYN = R1 Gi0/0's MAC</span>
R1# show interfaces GigabitEthernet0/0 | include address
<span class="c">! Lab 1 task: R1 needs a MAC on each segment it forwards between</span>
R1# show ip arp
R1# show ip route</pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0 | include address
  <span class="hl">Hardware is iGbE, address is 5254.0c04.4b01 (bia 5254.0c04.4b01)</span>
  Internet address is 10.1.1.1/24
R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   5254.0c04.4b01  ARPA   GigabitEthernet0/0
<span class="hl">Internet  10.1.1.10               0   5254.00a1.0010  ARPA   GigabitEthernet0/0</span>
Internet  203.0.113.1             -   5254.0c04.4b02  ARPA   GigabitEthernet0/1
<span class="hl">Internet  203.0.113.80            0   5254.00c3.0080  ARPA   GigabitEthernet0/1</span>
R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/24 is directly connected, GigabitEthernet0/1
L        203.0.113.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>Entries with age "-" are R1's own interfaces. The MAC values in your lab may differ; compare the capture with your own <code>show</code> output.</p>

<div class="eg"><p><b>Worked example: the Lab 1 answers.</b> Destination MAC of the SYN on the PC1-SW1 link = R1 Gi0/0's MAC (5254.0c04.4b01 here), not SRV's. TTL on the R1-SRV link = 64 - 1 router = <b>63</b>. The IP Protocol field = <b>6</b> (TCP). R1's ARP table holds 10.1.1.10 and 203.0.113.80. On the way back everything mirrors: SRV sends to R1 Gi0/1's MAC with TTL 64, R1 rewrites the frame to PC1's MAC and TTL 63.</p></div>

<h3>The exception: NAT</h3>
<p>If a router performs <b>NAT</b> (for example, a home router translating 192.168.1.10 to its public address), it also rewrites the source IP and usually the source port. That is a deliberate extra feature, covered in ccna-nat. Without NAT, IP addresses and ports are end to end.</p>

<div class="warn"><p><b>Common mistakes.</b> Answering "the server's MAC" for a remote destination. Believing the switch adds its MAC. Forgetting ARP happens <b>per segment</b>: PC1 never learns SRV's MAC and does not need to. Configuring a wrong default gateway on a host: it can reach local hosts but nothing remote.</p></div>

<div class="exam"><p><b>Exam traps.</b> Per router hop: source and destination <b>MAC change</b>, <b>TTL decrements</b>, <b>IP checksum and FCS are recalculated</b>; source and destination <b>IP stay the same</b> (without NAT). ARP request = broadcast, ARP reply = unicast. A switch forwards frames without changing them.</p></div>

<div class="scn"><h4>Only one user cannot leave the subnet</h4><p>A user could print to a local printer and reach a colleague's PC, but no server in the data center. Her ARP table (<code>arp -a</code>) showed an entry for 10.1.1.254 and no entry for the real gateway 10.1.1.1. Someone had typed the wrong default gateway on her static configuration, so every off-subnet packet was framed to a MAC that did not route. Correcting the gateway to 10.1.1.1 fixed it instantly.</p><p><b>Lesson:</b> local traffic depends only on ARP for the target; remote traffic depends on the default gateway. "Local works, remote fails" on one host means check the gateway first.</p></div>

<div class="iv"><p class="q">"A PC sends a packet to a server in another subnet. Describe the addresses on each link."</p><p>Say: the PC sees the destination is remote, ARPs for its default gateway, and sends a frame with its own MAC as source and the gateway's MAC as destination, while the IP header carries PC to server. The switch forwards unchanged. The router strips the frame, routes on the destination IP, decrements TTL, recomputes the checksum, and builds a new frame from its egress MAC to the next hop's MAC. IPs stay the same unless NAT. Draw it if there is a whiteboard.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote destination: the frame goes to the default gateway's MAC; the IP destination stays the final host.</li>
<li>ARP resolves IP to MAC on each segment: request broadcast, reply unicast.</li>
<li>Switches change nothing; routers rebuild the Ethernet header, decrement TTL and recompute the checksum.</li>
<li>IP addresses and ports stay end to end unless NAT/PAT is configured.</li>
<li><code>show ip arp</code>, <code>show ip route</code> and <code>show interfaces</code> prove each step on R1.</li>
</ul></div>
`,hi:`
<p>Wapas courier par chalte hain. Aapke parcel ka waybill poore safar ke liye "Delhi se Bengaluru" kehta hai. Lekin pehla truck sirf aapke ghar se Delhi hub tak jaata hai; uske driver ko hub ka gate number chahiye, Bengaluru nahi. Hub par parcel utaara jaata hai, waybill padha jaata hai, ek counter stamp hota hai, aur woh naye driver ke saath naye truck mein agle hub ke liye jaata hai. Yeh chapter wahi kahani real addresses ke saath hai, aur bilkul yahi Lab 1 aapse capture se prove karwata hai.</p>

<h3>Step 1: PC1 decide karta hai ki frame kahan bhejna hai</h3>
<p>PC1 (10.1.1.10/24) 203.0.113.80 tak pahunchna chahta hai. Woh destination ko apne subnet se compare karta hai. 203.0.113.80 10.1.1.0/24 ke andar <b>nahi</b> hai, isliye PC1 ko packet apne <b>default gateway</b>, 10.1.1.1, ko bhejna hoga. IP destination 203.0.113.80 hi rehta hai; sirf Layer 2 destination gateway ban jaata hai. Agar destination local hota (maan lo 10.1.1.20), to PC1 seedha us host ke MAC par bhejta.</p>

<h3>Step 2: ARP gateway ka MAC dhoondhta hai</h3>
<p>PC1 ko gateway ka IP pata hai lekin MAC nahi, isliye woh <b>ARP</b> (Address Resolution Protocol, EtherType 0x0806) use karta hai. Request ffff.ffff.ffff par ek <b>broadcast</b> hai: "Who has 10.1.1.1? Tell 10.1.1.10". VLAN ka har device ise receive karta hai; sirf R1 ek <b>unicast</b> reply se jawab deta hai: "10.1.1.1 is at 52:54:0c:04:4b:01". PC1 ise apni ARP table mein cache karta hai (hamare lab PCs entries 120 seconds rakhte hain; Cisco routers default mein 4 ghante rakhte hain).</p>
<pre class="out">No. Source              Destination         Protocol Info
1   52:54:00:a1:00:10   ff:ff:ff:ff:ff:ff   ARP      <span class="hl">Who has 10.1.1.1? Tell 10.1.1.10</span>
2   52:54:0c:04:4b:01   52:54:00:a1:00:10   ARP      10.1.1.1 is at 52:54:0c:04:4b:01
3   10.1.1.10           203.0.113.80        TCP      49875 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460</pre>

<h3>Step 3: SW1 frame ko bina badle forward karta hai</h3>
<p>SW1 PC1 ka MAC Gi0/1 par seekhta hai, destination MAC 5254.0c04.4b01 dhoondhta hai, use Gi0/0 par paata hai, aur frame bina badle bhej deta hai. MACs, IPs, TTL, checksum: kuch nahi chhua jaata. Switch transparent hota hai.</p>

<h3>Step 4: R1 route karta hai aur rewrite karta hai</h3>
<ol>
<li>R1 Gi0/0 par frame receive karta hai, FCS check karta hai aur ki destination MAC uska apna hai.</li>
<li>Woh Ethernet header aur trailer hata deta hai (unka kaam ho gaya).</li>
<li>Woh routing table mein 203.0.113.80 dhoondhta hai aur Gi0/1 se bahar connected route 203.0.113.0/24 paata hai.</li>
<li>Woh <b>TTL 64 se 63</b> karta hai (agar 0 ho jaata to packet drop karke ICMP Time Exceeded bhejta) aur <b>header checksum</b> dobara nikaalta hai.</li>
<li>Agar MAC pehle se cache nahi hai to Gi0/1 par 203.0.113.80 ke liye ARP karta hai.</li>
<li>Woh ek <b>naya frame</b> banata hai: source MAC = R1 Gi0/1, destination MAC = SRV, EtherType 0x0800, naya FCS.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Har link par headers">
<text x="110" y="20" text-anchor="middle" class="svg-ink" font-size="13">PC1 se SW1</text><text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">SW1 se R1</text><text x="530" y="20" text-anchor="middle" class="svg-ink" font-size="13">R1 se SRV</text>
<rect x="20" y="30" width="180" height="60" rx="6" fill="#bae6fd"/><text x="110" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: PC1</text><text x="110" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: R1 Gi0/0</text>
<rect x="230" y="30" width="180" height="60" rx="6" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: PC1</text><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: R1 Gi0/0</text>
<rect x="440" y="30" width="180" height="60" rx="6" fill="#fed7aa"/><text x="530" y="52" text-anchor="middle" class="svg-ink" font-size="12">Src MAC: R1 Gi0/1</text><text x="530" y="72" text-anchor="middle" class="svg-ink" font-size="12">Dst MAC: SRV</text>
<rect x="20" y="100" width="180" height="60" rx="6" fill="#ddd6fe"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 se 203.0.113.80</text><text x="110" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 64</text>
<rect x="230" y="100" width="180" height="60" rx="6" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 se 203.0.113.80</text><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 64</text>
<rect x="440" y="100" width="180" height="60" rx="6" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="12">10.1.1.10 se 203.0.113.80</text><text x="530" y="142" text-anchor="middle" class="svg-ink" font-size="12">TTL 63</text>
<rect x="20" y="170" width="600" height="34" rx="6" fill="#fde68a"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="12">TCP 49875 se 80 aur HTTP data: har link par bilkul same</text>
<text x="320" y="232" text-anchor="middle" class="svg-accent" font-size="12">Orange = R1 ne badla. Switch ne kuch nahi badla.</text>
</svg><p class="cap">Wahi SYN lab ke teeno links par.</p></div>

<h3>R1 par prove karna</h3>
<pre class="code"><span class="c">! Lab 1 task: PC1 ke SYN ka destination MAC = R1 Gi0/0 ka MAC</span>
R1# show interfaces GigabitEthernet0/0 | include address
<span class="c">! Lab 1 task: R1 ko har us segment par MAC chahiye jiske beech woh forward karta hai</span>
R1# show ip arp
R1# show ip route</pre>
<pre class="out">R1# show interfaces GigabitEthernet0/0 | include address
  <span class="hl">Hardware is iGbE, address is 5254.0c04.4b01 (bia 5254.0c04.4b01)</span>
  Internet address is 10.1.1.1/24
R1# show ip arp
Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  10.1.1.1                -   5254.0c04.4b01  ARPA   GigabitEthernet0/0
<span class="hl">Internet  10.1.1.10               0   5254.00a1.0010  ARPA   GigabitEthernet0/0</span>
Internet  203.0.113.1             -   5254.0c04.4b02  ARPA   GigabitEthernet0/1
<span class="hl">Internet  203.0.113.80            0   5254.00c3.0080  ARPA   GigabitEthernet0/1</span>
R1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/24 is directly connected, GigabitEthernet0/1
L        203.0.113.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>Age "-" wali entries R1 ke apne interfaces hain. Aapke lab mein MAC values alag ho sakti hain; capture ko apne <code>show</code> output se compare karo.</p>

<div class="eg"><p><b>Worked example: Lab 1 ke jawab.</b> PC1-SW1 link par SYN ka destination MAC = R1 Gi0/0 ka MAC (yahan 5254.0c04.4b01), SRV ka nahi. R1-SRV link par TTL = 64 - 1 router = <b>63</b>. IP Protocol field = <b>6</b> (TCP). R1 ki ARP table mein 10.1.1.10 aur 203.0.113.80 hain. Wapas aate hue sab kuch mirror hota hai: SRV R1 Gi0/1 ke MAC par TTL 64 ke saath bhejta hai, R1 frame ko PC1 ke MAC aur TTL 63 ke saath dobara likhta hai.</p></div>

<h3>Exception: NAT</h3>
<p>Agar router <b>NAT</b> karta hai (jaise home router 192.168.1.10 ko apne public address mein translate karta hai), to woh source IP aur aam taur par source port bhi rewrite karta hai. Yeh jaan boojh kar joda gaya extra feature hai, jo ccna-nat mein cover hota hai. NAT ke bina IP addresses aur ports end to end hote hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Remote destination ke liye "server ka MAC" jawab dena. Maanna ki switch apna MAC jodta hai. Bhoolna ki ARP <b>har segment par</b> hota hai: PC1 kabhi SRV ka MAC nahi seekhta aur use zaroorat bhi nahi. Host par galat default gateway configure karna: woh local hosts tak pahunch sakta hai lekin remote kuch nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Har router hop par: source aur destination <b>MAC badalte hain</b>, <b>TTL ghat-ta hai</b>, <b>IP checksum aur FCS dobara nikalte hain</b>; source aur destination <b>IP wahi rehte hain</b> (NAT ke bina). ARP request = broadcast, ARP reply = unicast. Switch frames bina badle forward karta hai.</p></div>

<div class="scn"><h4>Sirf ek user subnet se bahar nahi ja pa rahi</h4><p>Ek user local printer par print kar sakti thi aur colleague ke PC tak pahunch sakti thi, lekin data center ke kisi server tak nahi. Uski ARP table (<code>arp -a</code>) mein 10.1.1.254 ki entry thi aur asli gateway 10.1.1.1 ki koi entry nahi. Kisi ne uski static configuration mein galat default gateway type kar diya tha, isliye har off-subnet packet ek aise MAC par frame ho raha tha jo route nahi karta tha. Gateway 10.1.1.1 karne se turant theek ho gaya.</p><p><b>Seekh:</b> local traffic sirf target ke ARP par depend karta hai; remote traffic default gateway par. Ek host par "local chalta hai, remote fail" ka matlab pehle gateway check karo.</p></div>

<div class="iv"><p class="q">"Ek PC dusre subnet ke server ko packet bhejta hai. Har link par addresses describe karo."</p><p>Kaho: PC dekhta hai ki destination remote hai, apne default gateway ke liye ARP karta hai, aur frame bhejta hai jisme source apna MAC aur destination gateway ka MAC hai, jabki IP header mein PC se server hai. Switch bina badle forward karta hai. Router frame hatata hai, destination IP par route karta hai, TTL ghatata hai, checksum dobara nikaalta hai, aur apne egress MAC se next hop ke MAC tak naya frame banata hai. NAT ke bina IPs wahi rehte hain. Whiteboard ho to draw karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Remote destination: frame default gateway ke MAC par jaata hai; IP destination final host hi rehta hai.</li>
<li>ARP har segment par IP ko MAC mein resolve karta hai: request broadcast, reply unicast.</li>
<li>Switches kuch nahi badalte; routers Ethernet header dobara banate hain, TTL ghatate hain aur checksum dobara nikalte hain.</li>
<li>NAT/PAT configure na ho to IP addresses aur ports end to end rehte hain.</li>
<li><code>show ip arp</code>, <code>show ip route</code> aur <code>show interfaces</code> R1 par har step prove karte hain.</li>
</ul></div>
`}};export{e as default};