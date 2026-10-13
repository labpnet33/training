var e={id:`mtu-fvrf`,h:{en:`MTU, MSS and the front-door VRF`,hi:`MTU, MSS aur front-door VRF`},body:{en:`
<p>A courier van has a fixed door size. If you put a big box inside a bigger crate, it may no longer fit through the door, and someone has to unpack and repack it on the roadside. Tunnels are the same: every header you add shrinks the room left for the customer's packet. This chapter makes sure packets fit, and then separates the "road" (the internet) from the "office" (the internal network) with a front-door VRF.</p>

<h3>Counting the overhead</h3>
<table class="cmp"><tr><th>Header</th><th>Bytes</th></tr>
<tr><td>GRE outer IP + GRE</td><td>24 (28 with a tunnel key)</td></tr>
<tr><td>ESP transport, AES-256 + SHA-256: SPI/sequence 8, IV 16, padding 0 to 15, pad length/next header 2, ICV 16</td><td>up to 57</td></tr>
<tr><td>NAT-T (UDP 4500) if a NAT is in the path</td><td>8</td></tr>
<tr><td>ESP tunnel mode instead of transport</td><td>+20</td></tr></table>
<p>Worst case in our design: 28 + 57 + 8 = 93 bytes, so a 1500-byte underlay leaves about 1407. Cisco's standard DMVPN template therefore sets the tunnel IP MTU to <b>1400</b>, with a safety margin, and the TCP MSS to <b>1360</b> (1400 minus 20 bytes IP minus 20 bytes TCP).</p>

<pre class="code"><span class="c">! on Tunnel0 of the hub AND every spoke</span>
interface Tunnel0
 ip mtu 1400
 ip tcp adjust-mss 1360</pre>
<ul>
<li><code>ip mtu 1400</code> tells the router the largest IP packet it may put into the tunnel. Bigger packets are fragmented <b>before</b> encapsulation (cheap, done by the sender) or, if the DF bit is set, dropped with an ICMP "fragmentation needed" message so the host can lower its size (path MTU discovery).</li>
<li><code>ip tcp adjust-mss 1360</code> rewrites the MSS option in TCP SYN packets passing through the interface, so both TCP endpoints agree never to send segments that would exceed 1400 bytes. It fixes TCP even when ICMP is filtered somewhere and PMTUD fails.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="MTU budget inside a 1500 byte underlay">
<rect x="20" y="30" width="600" height="40" rx="6" fill="#e2e8f0"/><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="12">Underlay MTU 1500 bytes</text>
<rect x="20" y="30" width="56" height="40" rx="6" fill="#bae6fd"/><text x="48" y="55" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="76" y="30" width="44" height="40" fill="#ddd6fe"/><text x="98" y="55" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="120" y="30" width="460" height="40" fill="#bbf7d0"/><text x="350" y="55" text-anchor="middle" class="svg-ink" font-size="13">ip mtu 1400: inner IP packet</text>
<rect x="580" y="30" width="40" height="40" rx="6" fill="#ddd6fe"/><text x="600" y="55" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<rect x="120" y="95" width="16" height="30" fill="#fde68a"/><rect x="136" y="95" width="16" height="30" fill="#fed7aa"/><rect x="152" y="95" width="428" height="30" fill="#bbf7d0"/>
<text x="366" y="115" text-anchor="middle" class="svg-ink" font-size="12">TCP payload: MSS 1360</text>
<text x="128" y="145" text-anchor="middle" class="svg-muted" font-size="12">IP 20</text><text x="170" y="160" text-anchor="middle" class="svg-muted" font-size="12">TCP 20</text>
</svg><p class="cap">1400 bytes for the inner packet leaves room for GRE, ESP and NAT-T; 1360 is what remains for TCP data.</p></div>

<h3>Verification</h3>
<pre class="out">SPOKE1# show ip interface Tunnel0 | include MTU
<span class="hl">  MTU is 1400 bytes</span>
SPOKE1# ping 10.3.3.10 source 10.2.2.1 size 1400 df-bit
Packet sent with a source address of 10.2.2.1
Packet sent with the DF bit set
!!!!!
<span class="hl">Success rate is 100 percent (5/5), round-trip min/avg/max = 8/9/12 ms</span>
SPOKE1# ping 10.3.3.10 source 10.2.2.1 size 1401 df-bit
Packet sent with the DF bit set
<span class="hl">MMMMM</span>
Success rate is 0 percent (0/5)</pre>
<p><b>M</b> means "could not fragment": the packet is larger than the tunnel IP MTU and DF is set. Note that <code>show interfaces Tunnel0</code> still shows "MTU 17912 bytes"; that is the interface (layer 2) MTU of a tunnel, not the IP MTU. Always read the IP MTU with <code>show ip interface</code>.</p>

<div class="eg"><p><b>Worked example.</b> A user at Pune opens an intranet page on SRV (10.1.1.100). The PC advertises MSS 1460 in its SYN. SPOKE1 rewrites it to 1360 as the SYN leaves through Tunnel0; the server's SYN-ACK (MSS 1460) is rewritten to 1360 as it arrives on the hub's Tunnel0. Both sides now send at most 1360 + 40 = 1400-byte packets, which fit the tunnel exactly. Without adjust-mss, 1500-byte segments with DF set would need a working ICMP path back to the server.</p></div>

<h3>Front-door VRF (FVRF)</h3>
<p>In our lab each router's global table holds both the internet default route and the internal routes. That creates two problems: you cannot send a default route <b>through the tunnel</b> (for example to force internet traffic via the data centre firewall) without breaking the route to the hub's NBMA address, and the internet-facing interface shares the routing table with the corporate network. A <b>front-door VRF</b> puts the WAN interface in its own VRF. The tunnel stays in the global table (or in an inside VRF) but is told to reach NBMA addresses through the front-door VRF.</p>
<pre class="code">vrf definition INET
 address-family ipv4
 exit-address-family
interface GigabitEthernet0/0
 vrf forwarding INET
<span class="c">! vrf forwarding removes the IP: re-add it</span>
 ip address 100.64.20.2 255.255.255.252
ip route vrf INET 0.0.0.0 0.0.0.0 100.64.20.1
interface Tunnel0
 tunnel source GigabitEthernet0/0
<span class="c">! look up NBMA destinations in VRF INET</span>
 tunnel vrf INET
<span class="c">! IKEv2 must also search for peers in the front-door VRF</span>
crypto ikev2 profile DMVPN-IKEV2
 match fvrf INET
 match identity remote address 0.0.0.0</pre>
<p>Now the global table can carry <code>0.0.0.0/0</code> learned from the hub over the tunnel, while GRE and IKE packets use VRF INET's own default route to the ISP. Recursive routing (the route to the tunnel destination pointing into the tunnel) becomes impossible. With IKEv1 the equivalent is a keyring bound to the VRF: <code>crypto keyring DMVPN-KR vrf INET</code>.</p>

<div class="warn"><p><b>Common mistakes.</b> Setting <code>ip mtu 1400</code> only on the hub: the spoke side still sends oversized packets. Forgetting <code>adjust-mss</code>: small pings and SSH work, but web pages, file copies and email with attachments hang (the classic PMTUD black hole). With FVRF: forgetting <code>tunnel vrf</code> (the tunnel looks for the hub in the global table and never reaches it) or leaving the IKE keyring in the global table.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standard values: <b>ip mtu 1400</b> and <b>ip tcp adjust-mss 1360</b>. MSS = IP MTU minus 40. <code>tunnel vrf</code> sets the VRF for the <b>underlay</b> (NBMA) lookup; <code>vrf forwarding</code> on the tunnel interface sets the VRF of the <b>overlay</b> (inside VRF). Do not swap them.</p></div>

<div class="scn"><h4>Pings fine, SharePoint dead</h4><p>After IPsec was added to a DMVPN, branch users could ping and use SSH, but large web pages and file uploads to the DC timed out. A ping with <code>size 1450 df-bit</code> from the branch failed silently, and a firewall in the DC was dropping ICMP unreachables. Adding <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code> on every tunnel fixed TCP immediately without touching the firewall.</p><p><b>Lesson:</b> never rely on PMTUD across the internet; clamp MSS on every tunnel.</p></div>

<div class="iv"><p class="q">"Why do DMVPN templates use ip mtu 1400 and ip tcp adjust-mss 1360, and what is a front-door VRF?"</p><p>Strong answer: GRE plus ESP (and possibly NAT-T) add up to around 90 bytes, so 1400 leaves a safe margin within a 1500-byte underlay; the router fragments before encryption or signals PMTUD. MSS 1360 is 1400 minus IP and TCP headers and makes TCP avoid fragmentation even when ICMP is blocked. A front-door VRF puts the internet-facing interface in its own VRF and uses <code>tunnel vrf</code> so NBMA lookups happen there, allowing a default route through the tunnel and isolating the WAN from the internal table.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GRE 24 to 28 bytes, ESP up to about 57, NAT-T 8: plan for roughly 100 bytes.</li>
<li><code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code> on every tunnel, hub and spokes.</li>
<li>Check the IP MTU with <code>show ip interface</code>; test with <code>ping ... size ... df-bit</code> (M = could not fragment).</li>
<li>FVRF: WAN interface in its own VRF, <code>tunnel vrf</code> for NBMA lookups, crypto keyring or <code>match fvrf</code> in that VRF.</li>
<li>FVRF allows a default route through the tunnel and prevents recursive routing.</li>
</ul></div>
`,hi:`
<p>Courier van ka darwaza fixed size ka hota hai. Agar aap bade box ko aur bade crate mein daalo, to woh shayad darwaze se na nikle, aur kisi ko sadak kinare khol kar dobara pack karna padega. Tunnels bhi aise hi hain: har header jo aap jodte ho, customer ke packet ke liye bachi jagah kam karta hai. Yeh chapter pakka karta hai ki packets fit hon, aur phir front-door VRF se "sadak" (internet) ko "office" (internal network) se alag karta hai.</p>

<h3>Overhead ginna</h3>
<table class="cmp"><tr><th>Header</th><th>Bytes</th></tr>
<tr><td>GRE outer IP + GRE</td><td>24 (tunnel key ke saath 28)</td></tr>
<tr><td>ESP transport, AES-256 + SHA-256: SPI/sequence 8, IV 16, padding 0 se 15, pad length/next header 2, ICV 16</td><td>57 tak</td></tr>
<tr><td>NAT-T (UDP 4500) agar path mein NAT ho</td><td>8</td></tr>
<tr><td>Transport ki jagah ESP tunnel mode</td><td>+20</td></tr></table>
<p>Hamare design mein worst case: 28 + 57 + 8 = 93 bytes, isliye 1500-byte underlay mein lagbhag 1407 bachte hain. Isliye Cisco ka standard DMVPN template safety margin ke saath tunnel IP MTU <b>1400</b> set karta hai, aur TCP MSS <b>1360</b> (1400 minus 20 bytes IP minus 20 bytes TCP).</p>

<pre class="code"><span class="c">! hub AUR har spoke ke Tunnel0 par</span>
interface Tunnel0
 ip mtu 1400
 ip tcp adjust-mss 1360</pre>
<ul>
<li><code>ip mtu 1400</code> router ko batata hai ki tunnel mein sabse bada IP packet kitna daal sakta hai. Bade packets encapsulation se <b>pehle</b> fragment hote hain (sasta, sender karta hai) ya, agar DF bit set hai, ICMP "fragmentation needed" message ke saath drop hote hain taaki host apna size kam kare (path MTU discovery).</li>
<li><code>ip tcp adjust-mss 1360</code> interface se guzarne wale TCP SYN packets mein MSS option rewrite karta hai, taaki dono TCP endpoints kabhi aise segments na bhejein jo 1400 bytes se bade hon. Yeh TCP ko tab bhi theek karta hai jab kahin ICMP filter ho aur PMTUD fail ho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="1500 byte underlay mein MTU budget">
<rect x="20" y="30" width="600" height="40" rx="6" fill="#e2e8f0"/><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="12">Underlay MTU 1500 bytes</text>
<rect x="20" y="30" width="56" height="40" rx="6" fill="#bae6fd"/><text x="48" y="55" text-anchor="middle" class="svg-ink" font-size="12">GRE</text>
<rect x="76" y="30" width="44" height="40" fill="#ddd6fe"/><text x="98" y="55" text-anchor="middle" class="svg-ink" font-size="12">ESP</text>
<rect x="120" y="30" width="460" height="40" fill="#bbf7d0"/><text x="350" y="55" text-anchor="middle" class="svg-ink" font-size="13">ip mtu 1400: inner IP packet</text>
<rect x="580" y="30" width="40" height="40" rx="6" fill="#ddd6fe"/><text x="600" y="55" text-anchor="middle" class="svg-ink" font-size="12">ICV</text>
<rect x="120" y="95" width="16" height="30" fill="#fde68a"/><rect x="136" y="95" width="16" height="30" fill="#fed7aa"/><rect x="152" y="95" width="428" height="30" fill="#bbf7d0"/>
<text x="366" y="115" text-anchor="middle" class="svg-ink" font-size="12">TCP payload: MSS 1360</text>
<text x="128" y="145" text-anchor="middle" class="svg-muted" font-size="12">IP 20</text><text x="170" y="160" text-anchor="middle" class="svg-muted" font-size="12">TCP 20</text>
</svg><p class="cap">Inner packet ke liye 1400 bytes GRE, ESP aur NAT-T ke liye jagah chhodte hain; TCP data ke liye 1360 bachta hai.</p></div>

<h3>Verification</h3>
<pre class="out">SPOKE1# show ip interface Tunnel0 | include MTU
<span class="hl">  MTU is 1400 bytes</span>
SPOKE1# ping 10.3.3.10 source 10.2.2.1 size 1400 df-bit
Packet sent with a source address of 10.2.2.1
Packet sent with the DF bit set
!!!!!
<span class="hl">Success rate is 100 percent (5/5), round-trip min/avg/max = 8/9/12 ms</span>
SPOKE1# ping 10.3.3.10 source 10.2.2.1 size 1401 df-bit
Packet sent with the DF bit set
<span class="hl">MMMMM</span>
Success rate is 0 percent (0/5)</pre>
<p><b>M</b> ka matlab "could not fragment": packet tunnel IP MTU se bada hai aur DF set hai. Dhyan do ki <code>show interfaces Tunnel0</code> ab bhi "MTU 17912 bytes" dikhata hai; yeh tunnel ka interface (layer 2) MTU hai, IP MTU nahi. IP MTU hamesha <code>show ip interface</code> se padho.</p>

<div class="eg"><p><b>Worked example.</b> Pune ka ek user SRV (10.1.1.100) par intranet page kholta hai. PC apne SYN mein MSS 1460 advertise karta hai. SYN Tunnel0 se nikalte waqt SPOKE1 use 1360 kar deta hai; server ka SYN-ACK (MSS 1460) hub ke Tunnel0 par aate waqt 1360 ho jaata hai. Ab dono taraf zyada se zyada 1360 + 40 = 1400-byte packets bhejte hain, jo tunnel mein exactly fit hote hain. adjust-mss ke bina, DF set wale 1500-byte segments ko server tak wapas ek kaam karta ICMP path chahiye hota.</p></div>

<h3>Front-door VRF (FVRF)</h3>
<p>Hamari lab mein har router ki global table mein internet default route aur internal routes dono hain. Isse do problems hoti hain: aap <b>tunnel ke through</b> default route nahi bhej sakte (jaise internet traffic ko data centre firewall se force karne ke liye) bina hub ke NBMA address ka route tode, aur internet-facing interface corporate network ke saath routing table share karta hai. <b>Front-door VRF</b> WAN interface ko uske apne VRF mein daalta hai. Tunnel global table (ya inside VRF) mein rehta hai lekin use bataya jaata hai ki NBMA addresses front-door VRF ke through dhoondo.</p>
<pre class="code">vrf definition INET
 address-family ipv4
 exit-address-family
interface GigabitEthernet0/0
 vrf forwarding INET
<span class="c">! vrf forwarding IP hata deta hai: dobara lagao</span>
 ip address 100.64.20.2 255.255.255.252
ip route vrf INET 0.0.0.0 0.0.0.0 100.64.20.1
interface Tunnel0
 tunnel source GigabitEthernet0/0
<span class="c">! NBMA destinations VRF INET mein dhoondo</span>
 tunnel vrf INET
<span class="c">! IKEv2 ko bhi peers front-door VRF mein dhoondne hain</span>
crypto ikev2 profile DMVPN-IKEV2
 match fvrf INET
 match identity remote address 0.0.0.0</pre>
<p>Ab global table hub se tunnel par seekha <code>0.0.0.0/0</code> rakh sakti hai, jabki GRE aur IKE packets VRF INET ka apna ISP wala default route use karte hain. Recursive routing (tunnel destination ka route tunnel mein hi point kare) impossible ho jaata hai. IKEv1 ke saath equivalent VRF se bandha keyring hai: <code>crypto keyring DMVPN-KR vrf INET</code>.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip mtu 1400</code> sirf hub par lagana: spoke side ab bhi oversized packets bhejti hai. <code>adjust-mss</code> bhoolna: chhote pings aur SSH chalte hain, lekin web pages, file copies aur attachments wale emails hang hote hain (classic PMTUD black hole). FVRF ke saath: <code>tunnel vrf</code> bhoolna (tunnel hub ko global table mein dhoondta hai aur kabhi nahi pahunchta) ya IKE keyring ko global table mein chhod dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standard values: <b>ip mtu 1400</b> aur <b>ip tcp adjust-mss 1360</b>. MSS = IP MTU minus 40. <code>tunnel vrf</code> <b>underlay</b> (NBMA) lookup ka VRF set karta hai; tunnel interface par <code>vrf forwarding</code> <b>overlay</b> (inside VRF) ka VRF set karta hai. Inhe ulta mat karo.</p></div>

<div class="scn"><h4>Pings theek, SharePoint band</h4><p>DMVPN mein IPsec jodne ke baad branch users ping aur SSH use kar pa rahe the, lekin bade web pages aur DC par file uploads time out ho rahe the. Branch se <code>size 1450 df-bit</code> wala ping chupchaap fail hua, aur DC ka ek firewall ICMP unreachables drop kar raha tha. Har tunnel par <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code> jodne se firewall chhue bina TCP turant theek ho gaya.</p><p><b>Seekh:</b> internet ke paar kabhi PMTUD par bharosa mat karo; har tunnel par MSS clamp karo.</p></div>

<div class="iv"><p class="q">"DMVPN templates ip mtu 1400 aur ip tcp adjust-mss 1360 kyun use karte hain, aur front-door VRF kya hai?"</p><p>Strong answer: GRE plus ESP (aur shayad NAT-T) milkar lagbhag 90 bytes jodte hain, isliye 1400 1500-byte underlay mein safe margin chhodta hai; router encryption se pehle fragment karta hai ya PMTUD signal karta hai. MSS 1360 = 1400 minus IP aur TCP headers, aur TCP ko ICMP block hone par bhi fragmentation se bachata hai. Front-door VRF internet-facing interface ko apne VRF mein daalta hai aur <code>tunnel vrf</code> use karta hai taaki NBMA lookups wahan hon, jisse tunnel ke through default route possible hota hai aur WAN internal table se isolate rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>GRE 24 se 28 bytes, ESP lagbhag 57 tak, NAT-T 8: lagbhag 100 bytes ka plan karo.</li>
<li>Har tunnel par, hub aur spokes dono, <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code>.</li>
<li>IP MTU <code>show ip interface</code> se check karo; <code>ping ... size ... df-bit</code> se test karo (M = could not fragment).</li>
<li>FVRF: WAN interface apne VRF mein, NBMA lookups ke liye <code>tunnel vrf</code>, us VRF mein crypto keyring ya <code>match fvrf</code>.</li>
<li>FVRF tunnel ke through default route allow karta hai aur recursive routing rokta hai.</li>
</ul></div>
`}};export{e as default};