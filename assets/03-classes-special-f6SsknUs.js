var e={id:`classes-special`,h:{en:`Classful history, private ranges and special addresses`,hi:`Classful history, private ranges aur special addresses`},body:{en:`
<p>Imagine a clothes shop that sells T-shirts in only three sizes: small, large and enormous. A child gets small, an adult who is slightly too big for small must take enormous, and most of that fabric is wasted. That shop is <b>classful addressing</b>, the way IPv4 was handed out until 1993. Today we use a tailor instead, called <b>CIDR</b>, which cuts exactly the size you need. You still must know the old sizes, because the exam asks about them and engineers still use the words.</p>

<h3>The five classes</h3>
<p>In classful addressing the <b>first bits of the first octet</b> decided the class, and the class decided the mask. Nobody wrote masks; the address itself implied one.</p>
<table class="cmp"><tr><th>Class</th><th>First bits</th><th>First octet</th><th>Default mask</th><th>Used for</th></tr>
<tr><td>A</td><td>0</td><td>1 to 126</td><td>255.0.0.0 (/8)</td><td>Huge networks: 16,777,214 hosts each</td></tr>
<tr><td>B</td><td>10</td><td>128 to 191</td><td>255.255.0.0 (/16)</td><td>Medium: 65,534 hosts each</td></tr>
<tr><td>C</td><td>110</td><td>192 to 223</td><td>255.255.255.0 (/24)</td><td>Small: 254 hosts each</td></tr>
<tr><td>D</td><td>1110</td><td>224 to 239</td><td>none</td><td>Multicast groups</td></tr>
<tr><td>E</td><td>1111</td><td>240 to 255</td><td>none</td><td>Reserved (experimental)</td></tr></table>
<p>Class A starts at 1, not 0, and ends at 126, because <b>0</b> means "this network" and <b>127</b> is reserved for loopback. So 127.x.x.x is technically inside the class A bit pattern but never usable.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="First octet ranges of the classes">
<rect x="20" y="40" width="300" height="44" fill="#bae6fd"/><text x="170" y="67" text-anchor="middle" class="svg-ink" font-size="14">A: 1 to 126</text>
<rect x="320" y="40" width="150" height="44" fill="#bbf7d0"/><text x="395" y="67" text-anchor="middle" class="svg-ink" font-size="14">B: 128 to 191</text>
<rect x="470" y="40" width="75" height="44" fill="#fde68a"/><text x="507" y="67" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<rect x="545" y="40" width="38" height="44" fill="#ddd6fe"/><text x="564" y="67" text-anchor="middle" class="svg-ink" font-size="13">D</text>
<rect x="583" y="40" width="37" height="44" fill="#fed7aa"/><text x="601" y="67" text-anchor="middle" class="svg-ink" font-size="13">E</text>
<text x="20" y="104" class="svg-muted" font-size="12">0</text><text x="310" y="104" class="svg-muted" font-size="12">127</text><text x="458" y="104" class="svg-muted" font-size="12">192</text><text x="532" y="104" class="svg-muted" font-size="12">224</text><text x="590" y="104" class="svg-muted" font-size="12">240</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="13">first octet decides the class: half A, a quarter B, an eighth C</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">C = 192 to 223, D = 224 to 239, E = 240 to 255</text>
</svg><p class="cap">The first-octet number line. Each class is half the size of the one before because one more leading bit is fixed.</p></div>

<h3>Why classful addressing died</h3>
<p>A company with 2,000 hosts was too big for a class C (254 hosts), so it received a class B and wasted over 63,000 addresses. The alternative, eight separate class Cs, meant eight routes in every internet router. Both problems, waste and routing table growth, were solved in 1993 by <b>CIDR</b> (Classless Inter-Domain Routing). With CIDR a mask can end on any bit, written as a prefix length such as /21, and many networks can be announced as one summary. Today the class of an address has no effect on how a modern router forwards it. The words survive: people still say "a class C" when they mean a /24, and some old protocol features (like RIP auto-summary) think in classes.</p>

<h3>Private addresses: RFC 1918</h3>
<p>Three blocks are reserved for use <b>inside</b> organisations. Anyone can use them, they are reused in millions of networks, and internet routers do not route them. To reach the internet, traffic from these addresses is translated to a public address with <b>NAT</b>, which has its own module later.</p>
<table class="cmp"><tr><th>Block</th><th>Range</th><th>Size in old terms</th></tr>
<tr><td>10.0.0.0/8</td><td>10.0.0.0 to 10.255.255.255</td><td>one class A</td></tr>
<tr><td>172.16.0.0/12</td><td>172.16.0.0 to 172.31.255.255</td><td>16 class Bs</td></tr>
<tr><td>192.168.0.0/16</td><td>192.168.0.0 to 192.168.255.255</td><td>256 class Cs</td></tr></table>
<p>Why we need them (blueprint 1.7): there are not enough public IPv4 addresses for every device, so companies number their internal networks privately and share a few public addresses through NAT. Private numbering also lets you design freely without asking a registry for space.</p>

<h3>Special ranges you must recognise</h3>
<table class="cmp"><tr><th>Range</th><th>Meaning</th></tr>
<tr><td>0.0.0.0/8</td><td>"This network". 0.0.0.0 is the source of a DHCP Discover; 0.0.0.0/0 means the default route.</td></tr>
<tr><td>127.0.0.0/8</td><td><b>Loopback</b>. 127.0.0.1 is "myself"; packets never leave the host.</td></tr>
<tr><td>169.254.0.0/16</td><td><b>Link-local / APIPA</b>. A host picks one itself when DHCP fails. It can talk only to its own segment and has no gateway.</td></tr>
<tr><td>100.64.0.0/10</td><td>Shared address space for carrier-grade NAT (RFC 6598). Not RFC 1918.</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation (TEST-NET). Used in books and examples; never on real networks.</td></tr>
<tr><td>224.0.0.0/4</td><td><b>Multicast</b> (old class D). 224.0.0.5 and .6 = OSPF, 224.0.0.9 = RIPv2, 224.0.0.10 = EIGRP.</td></tr>
<tr><td>240.0.0.0/4</td><td>Reserved (old class E).</td></tr>
<tr><td>255.255.255.255</td><td><b>Limited broadcast</b>: every host on the local segment; routers never forward it.</td></tr></table>
<p>Three types of destination: <b>unicast</b> (one host), <b>broadcast</b> (all hosts in a subnet) and <b>multicast</b> (hosts that joined a group). A <b>directed broadcast</b> is the broadcast address of a specific subnet, such as 192.168.50.191 for 192.168.50.128/26. Cisco routers do not forward directed broadcasts by default (<code>no ip directed-broadcast</code>), because they were abused for amplification attacks.</p>

<div class="eg"><p><b>Worked example: classify these.</b> 172.31.255.1 = private (inside 172.16/12). 172.32.0.1 = public class B (just outside the private block). 169.254.10.5 = APIPA, the host failed DHCP. 127.5.5.5 = loopback. 100.70.1.1 = CGNAT shared space, not RFC 1918. 224.0.0.10 = EIGRP multicast. 192.0.2.10 = documentation. 191.255.0.1 = public class B. 223.1.1.1 = public class C. 240.1.1.1 = class E, reserved.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking 172.16.0.0/12 covers all of 172.x.x.x: it stops at 172.31. Writing 192.169.x.x as private: it is public. Treating 100.64.0.0/10 as RFC 1918: it is a separate block for service providers.</p></div>

<div class="exam"><p><b>Exam traps.</b> 127.0.0.1 is not a class A host you can assign. A PC showing 169.254.x.x points to a DHCP problem, not a mask problem. Class D and E have no default mask. And private addressing is not a security feature by itself: NAT hides addresses but does not replace a firewall.</p></div>

<div class="scn"><h4>Two companies, one 192.168.1.0/24</h4><p>After a merger, two companies connected their offices with a site-to-site VPN. Both used 192.168.1.0/24 for their main office LAN, the default of many home and small-office routers. Users could not reach servers on the other side: each router saw 192.168.1.0/24 as its own connected network and never sent the traffic into the tunnel. The quick fix was NAT on the tunnel; the permanent fix was renumbering one side into 10.44.0.0/16.</p><p><b>Lesson:</b> private ranges are reused everywhere, so choose less common blocks (random 10.x or 172.16-31 subnets) for corporate networks, and keep a central address plan.</p></div>

<div class="iv"><p class="q">"Why do we use private IPv4 addresses, and does NAT make a network secure?"</p><p>Strong answer: list the three RFC 1918 blocks exactly, explain that public IPv4 space is exhausted so private space is reused internally and translated with NAT at the edge. Then add the nuance: NAT hides internal numbering and blocks unsolicited inbound connections as a side effect, but it is not a security control; firewalls and ACLs are. Bonus points for mentioning overlapping private ranges as a merger and VPN problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classes: A 1-126 (/8), B 128-191 (/16), C 192-223 (/24), D 224-239 multicast, E 240-255 reserved.</li>
<li>CIDR replaced classes in 1993: masks can end on any bit, and routes can be summarised.</li>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (172.16 to 172.31), 192.168.0.0/16; reach the internet through NAT.</li>
<li>Know 127/8 loopback, 169.254/16 APIPA, 224/4 multicast, 255.255.255.255 limited broadcast.</li>
<li>Overlapping private ranges break VPNs and mergers; plan addresses centrally.</li>
</ul></div>
`,hi:`
<p>Ek kapdon ki dukaan socho jo T-shirts sirf teen sizes mein bechti hai: small, large aur enormous. Bachche ko small milta hai, jo adult small se thoda bada hai use enormous lena padta hai, aur zyada tar kapda waste hota hai. Woh dukaan hai <b>classful addressing</b>, jis tarah 1993 tak IPv4 baanta jaata tha. Aaj hum ek darzi use karte hain, jise <b>CIDR</b> kehte hain, jo bilkul utna kaat ta hai jitna chahiye. Purane sizes aapko phir bhi pata hone chahiye, kyunki exam unke baare mein poochta hai aur engineers abhi bhi yeh words use karte hain.</p>

<h3>Paanch classes</h3>
<p>Classful addressing mein <b>first octet ke pehle bits</b> class decide karte the, aur class mask decide karti thi. Koi mask nahi likhta tha; address khud ek mask imply karta tha.</p>
<table class="cmp"><tr><th>Class</th><th>Pehle bits</th><th>First octet</th><th>Default mask</th><th>Kis liye</th></tr>
<tr><td>A</td><td>0</td><td>1 se 126</td><td>255.0.0.0 (/8)</td><td>Bahut bade networks: har ek mein 16,777,214 hosts</td></tr>
<tr><td>B</td><td>10</td><td>128 se 191</td><td>255.255.0.0 (/16)</td><td>Medium: har ek mein 65,534 hosts</td></tr>
<tr><td>C</td><td>110</td><td>192 se 223</td><td>255.255.255.0 (/24)</td><td>Chhote: har ek mein 254 hosts</td></tr>
<tr><td>D</td><td>1110</td><td>224 se 239</td><td>koi nahi</td><td>Multicast groups</td></tr>
<tr><td>E</td><td>1111</td><td>240 se 255</td><td>koi nahi</td><td>Reserved (experimental)</td></tr></table>
<p>Class A 1 se shuru hoti hai, 0 se nahi, aur 126 par khatam hoti hai, kyunki <b>0</b> ka matlab "yeh network" hai aur <b>127</b> loopback ke liye reserved hai. To 127.x.x.x technically class A ke bit pattern mein hai par kabhi usable nahi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Classes ki first octet ranges">
<rect x="20" y="40" width="300" height="44" fill="#bae6fd"/><text x="170" y="67" text-anchor="middle" class="svg-ink" font-size="14">A: 1 se 126</text>
<rect x="320" y="40" width="150" height="44" fill="#bbf7d0"/><text x="395" y="67" text-anchor="middle" class="svg-ink" font-size="14">B: 128 se 191</text>
<rect x="470" y="40" width="75" height="44" fill="#fde68a"/><text x="507" y="67" text-anchor="middle" class="svg-ink" font-size="13">C</text>
<rect x="545" y="40" width="38" height="44" fill="#ddd6fe"/><text x="564" y="67" text-anchor="middle" class="svg-ink" font-size="13">D</text>
<rect x="583" y="40" width="37" height="44" fill="#fed7aa"/><text x="601" y="67" text-anchor="middle" class="svg-ink" font-size="13">E</text>
<text x="20" y="104" class="svg-muted" font-size="12">0</text><text x="310" y="104" class="svg-muted" font-size="12">127</text><text x="458" y="104" class="svg-muted" font-size="12">192</text><text x="532" y="104" class="svg-muted" font-size="12">224</text><text x="590" y="104" class="svg-muted" font-size="12">240</text>
<text x="320" y="135" text-anchor="middle" class="svg-accent" font-size="13">first octet class decide karta hai: aadha A, chauthai B, aathwan C</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">C = 192 se 223, D = 224 se 239, E = 240 se 255</text>
</svg><p class="cap">First-octet number line. Har class pichhli class se aadhi hai kyunki ek aur leading bit fix ho jaata hai.</p></div>

<h3>Classful addressing khatam kyun hui</h3>
<p>2,000 hosts wali company class C (254 hosts) ke liye bahut badi thi, isliye use class B milti thi aur 63,000 se zyada addresses waste hote the. Doosra option, aath alag class Cs, ka matlab tha har internet router mein aath routes. Dono problems, waste aur routing table ka badhna, 1993 mein <b>CIDR</b> (Classless Inter-Domain Routing) ne solve kiye. CIDR ke saath mask kisi bhi bit par khatam ho sakta hai, jise /21 jaisi prefix length ki tarah likhte hain, aur kai networks ko ek summary ki tarah announce kiya ja sakta hai. Aaj address ki class ka modern router ki forwarding par koi asar nahi hai. Words bache hain: log ab bhi "ek class C" bolte hain jab unka matlab /24 hota hai, aur kuch purane protocol features (jaise RIP auto-summary) classes mein sochte hain.</p>

<h3>Private addresses: RFC 1918</h3>
<p>Teen blocks organisations ke <b>andar</b> use ke liye reserved hain. Koi bhi inhe use kar sakta hai, yeh laakhon networks mein reuse hote hain, aur internet routers inhe route nahi karte. Internet tak pahunchne ke liye in addresses ka traffic <b>NAT</b> se public address mein translate hota hai, jiska baad mein apna module hai.</p>
<table class="cmp"><tr><th>Block</th><th>Range</th><th>Purane terms mein size</th></tr>
<tr><td>10.0.0.0/8</td><td>10.0.0.0 se 10.255.255.255</td><td>ek class A</td></tr>
<tr><td>172.16.0.0/12</td><td>172.16.0.0 se 172.31.255.255</td><td>16 class Bs</td></tr>
<tr><td>192.168.0.0/16</td><td>192.168.0.0 se 192.168.255.255</td><td>256 class Cs</td></tr></table>
<p>Inki zaroorat kyun hai (blueprint 1.7): har device ke liye kaafi public IPv4 addresses nahi hain, isliye companies apne internal networks ko privately number karti hain aur NAT ke through kuch public addresses share karti hain. Private numbering se aap registry se space maange bina freely design kar sakte ho.</p>

<h3>Special ranges jo aapko pehchanni hain</h3>
<table class="cmp"><tr><th>Range</th><th>Matlab</th></tr>
<tr><td>0.0.0.0/8</td><td>"Yeh network". 0.0.0.0 DHCP Discover ka source hota hai; 0.0.0.0/0 ka matlab default route.</td></tr>
<tr><td>127.0.0.0/8</td><td><b>Loopback</b>. 127.0.0.1 matlab "main khud"; packets kabhi host se bahar nahi jaate.</td></tr>
<tr><td>169.254.0.0/16</td><td><b>Link-local / APIPA</b>. DHCP fail hone par host khud ek chun leta hai. Woh sirf apne segment se baat kar sakta hai aur koi gateway nahi hota.</td></tr>
<tr><td>100.64.0.0/10</td><td>Carrier-grade NAT ke liye shared address space (RFC 6598). RFC 1918 nahi.</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation (TEST-NET). Books aur examples mein use hote hain; real networks par kabhi nahi.</td></tr>
<tr><td>224.0.0.0/4</td><td><b>Multicast</b> (purani class D). 224.0.0.5 aur .6 = OSPF, 224.0.0.9 = RIPv2, 224.0.0.10 = EIGRP.</td></tr>
<tr><td>240.0.0.0/4</td><td>Reserved (purani class E).</td></tr>
<tr><td>255.255.255.255</td><td><b>Limited broadcast</b>: local segment ke saare hosts; routers ise kabhi forward nahi karte.</td></tr></table>
<p>Destination ke teen types: <b>unicast</b> (ek host), <b>broadcast</b> (subnet ke saare hosts) aur <b>multicast</b> (woh hosts jo group join kar chuke hain). <b>Directed broadcast</b> kisi specific subnet ka broadcast address hai, jaise 192.168.50.128/26 ke liye 192.168.50.191. Cisco routers default mein directed broadcasts forward nahi karte (<code>no ip directed-broadcast</code>), kyunki inka amplification attacks ke liye galat use hua tha.</p>

<div class="eg"><p><b>Worked example: inhe classify karo.</b> 172.31.255.1 = private (172.16/12 ke andar). 172.32.0.1 = public class B (private block ke thoda bahar). 169.254.10.5 = APIPA, host DHCP mein fail hua. 127.5.5.5 = loopback. 100.70.1.1 = CGNAT shared space, RFC 1918 nahi. 224.0.0.10 = EIGRP multicast. 192.0.2.10 = documentation. 191.255.0.1 = public class B. 223.1.1.1 = public class C. 240.1.1.1 = class E, reserved.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki 172.16.0.0/12 poora 172.x.x.x cover karta hai: yeh 172.31 par ruk jaata hai. 192.169.x.x ko private likhna: woh public hai. 100.64.0.0/10 ko RFC 1918 maanna: yeh service providers ke liye alag block hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> 127.0.0.1 class A ka assign karne layak host nahi hai. 169.254.x.x dikhane wala PC DHCP problem ki taraf ishara karta hai, mask problem ki taraf nahi. Class D aur E ka koi default mask nahi hai. Aur private addressing khud mein security feature nahi hai: NAT addresses chhupata hai par firewall ki jagah nahi leta.</p></div>

<div class="scn"><h4>Do companies, ek 192.168.1.0/24</h4><p>Merger ke baad do companies ne apne offices ko site-to-site VPN se joda. Dono apne main office LAN ke liye 192.168.1.0/24 use karti thi, jo kai home aur small-office routers ka default hai. Users doosri taraf ke servers tak nahi pahunch paaye: har router 192.168.1.0/24 ko apna connected network maanta tha aur traffic tunnel mein kabhi nahi bhejta tha. Quick fix tha tunnel par NAT; permanent fix tha ek side ko 10.44.0.0/16 mein renumber karna.</p><p><b>Seekh:</b> private ranges har jagah reuse hoti hain, isliye corporate networks ke liye kam common blocks (random 10.x ya 172.16-31 subnets) chuno, aur ek central address plan rakho.</p></div>

<div class="iv"><p class="q">"Hum private IPv4 addresses kyun use karte hain, aur kya NAT network ko secure banata hai?"</p><p>Strong answer: teeno RFC 1918 blocks exactly batao, samjhao ki public IPv4 space khatam ho chuka hai isliye private space andar reuse hota hai aur edge par NAT se translate hota hai. Phir nuance jodo: NAT internal numbering chhupata hai aur side effect ke roop mein unsolicited inbound connections rokta hai, par yeh security control nahi hai; firewalls aur ACLs hain. Overlapping private ranges ko merger aur VPN problem ki tarah batane par bonus points.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Classes: A 1-126 (/8), B 128-191 (/16), C 192-223 (/24), D 224-239 multicast, E 240-255 reserved.</li>
<li>1993 mein CIDR ne classes ki jagah li: masks kisi bhi bit par khatam ho sakte hain, aur routes summarise ho sakte hain.</li>
<li>RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (172.16 se 172.31), 192.168.0.0/16; internet tak NAT se pahunchte hain.</li>
<li>127/8 loopback, 169.254/16 APIPA, 224/4 multicast, 255.255.255.255 limited broadcast pehchano.</li>
<li>Overlapping private ranges VPNs aur mergers tod dete hain; addresses centrally plan karo.</li>
</ul></div>
`}};export{e as default};