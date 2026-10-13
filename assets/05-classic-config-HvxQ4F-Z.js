var e={id:`classic-config`,h:{en:`Classic configuration: the three-site WAN`,hi:`Classic configuration: teen-site WAN`},body:{en:`
<p>Configuring EIGRP is like telling a new receptionist which doors of the office to open. The <code>router eigrp</code> command hires the receptionist; each <code>network</code> command points at doors (interfaces) that should greet visitors; <code>passive-interface</code> says "keep this door locked to visitors, but still put its name on the directory board". In this chapter you will configure exactly what lab 1 asks for, line by line.</p>

<h3>The lab 1 topology</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab 1 interfaces and addresses">
<rect x="250" y="16" width="140" height="54" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">R2 (done)</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2.2.2.2</text>
<rect x="30" y="120" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="105" y="142" text-anchor="middle" class="svg-ink" font-size="14">R1 Jaipur</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lo0 1.1.1.1</text>
<rect x="460" y="120" width="150" height="54" rx="8" fill="#ddd6fe"/><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="14">R3 Noida</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lo0 3.3.3.3</text>
<line x1="170" y1="120" x2="250" y2="60" stroke="#64748b" stroke-width="3"/><text x="120" y="92" class="svg-muted" font-size="12">Gi0/0 .1 - .2</text>
<line x1="390" y1="60" x2="470" y2="120" stroke="#64748b" stroke-width="3"/><text x="420" y="92" class="svg-muted" font-size="12">.2 - .3 Gi0/0</text>
<line x1="180" y1="160" x2="460" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="152" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 10.0.13.1 - .3 (10 Mbps)</text>
<rect x="30" y="220" width="150" height="40" rx="8" fill="#fde68a"/><text x="105" y="245" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 192.168.10.1</text>
<rect x="460" y="220" width="150" height="40" rx="8" fill="#fde68a"/><text x="535" y="245" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 192.168.30.1</text>
<line x1="105" y1="174" x2="105" y2="220" stroke="#64748b" stroke-width="2"/><line x1="535" y1="174" x2="535" y2="220" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">R2 already runs EIGRP AS 100. Your job: R1 and R3, with precise wildcard statements and passive LANs.</p></div>

<h3>Step 1: start the process and set the router ID</h3>
<pre class="code">R1(config)# router eigrp 100
R1(config-router)# eigrp router-id 1.1.1.1</pre>
<p>The number 100 is the <b>autonomous system</b> number and must be the same on every router in the domain. The <b>router ID</b> is chosen in this order: the <code>eigrp router-id</code> command, else the highest IPv4 address on an up loopback, else the highest IPv4 address on an up physical interface. Set it by hand so it never changes after a reload. EIGRP uses the router ID mainly to tag external routes, which is why a duplicate ID breaks redistribution.</p>

<h3>Step 2: network statements select interfaces</h3>
<pre class="code">R1(config-router)# network 10.0.12.0 0.0.0.255     <span class="c">! Gi0/0 to R2</span>
R1(config-router)# network 10.0.13.0 0.0.0.255     <span class="c">! Gi0/1 backup to R3</span>
R1(config-router)# network 192.168.10.0 0.0.0.255  <span class="c">! Gi0/2 Jaipur LAN</span>
R1(config-router)# network 1.1.1.1 0.0.0.0         <span class="c">! Loopback0 only</span></pre>
<p>This is the most misunderstood command in EIGRP. The <code>network</code> command does <b>not</b> advertise a network by itself. It says: "every interface whose primary IP address falls in this range will (1) send and receive Hellos and (2) have its connected subnet advertised". The wildcard works like an ACL wildcard: 0 bits must match, 1 bits are ignored.</p>
<ul>
<li><code>network 1.1.1.1 0.0.0.0</code> matches exactly one address: Loopback0.</li>
<li><code>network 10.0.12.0 0.0.0.255</code> matches 10.0.12.0 to 10.0.12.255, so only Gi0/0.</li>
<li><code>network 10.0.0.0</code> without a wildcard uses the <b>classful</b> boundary and matches every 10.x.x.x interface.</li>
<li><code>network 0.0.0.0</code> (or <code>0.0.0.0 255.255.255.255</code>) enables every interface: quick in a lab, dangerous in production.</li>
</ul>

<h3>Step 3: passive interfaces on the LAN</h3>
<pre class="code">R1(config-router)# passive-interface GigabitEthernet0/2</pre>
<p>A passive interface stops sending and processing Hellos, so no neighbour can form on it, but its subnet is <b>still advertised</b> as long as a network statement covers it. Use it on every user LAN and on loopbacks. In large routers you can reverse the logic: <code>passive-interface default</code>, then <code>no passive-interface GigabitEthernet0/0</code> for each real uplink.</p>

<h3>Step 4: auto-summary</h3>
<p>With <code>auto-summary</code>, EIGRP summarises to the classful boundary (for example 10.0.0.0/8) when advertising out of an interface in a different major network. That breaks discontiguous designs. Since IOS 15.0 it is <b>off</b> by default; many engineers still type <code>no auto-summary</code> to make the intent obvious.</p>

<h3>R3: the same job</h3>
<pre class="code">router eigrp 100
 eigrp router-id 3.3.3.3
 network 10.0.23.0 0.0.0.255
 network 10.0.13.0 0.0.0.255
 network 192.168.30.0 0.0.0.255
 network 3.3.3.3 0.0.0.0
 passive-interface GigabitEthernet0/2</pre>

<h3>Verification</h3>
<pre class="out">R1# show ip protocols
Routing Protocol is "eigrp 100"
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    <span class="hl">Router-ID: 1.1.1.1</span>
    Topology : 0 (base)
      Active Timer: 3 min
      Distance: internal 90 external 170
      Maximum path: 4
      Maximum hopcount 100
      Maximum metric variance 1
  Automatic Summarization: disabled
  <span class="hl">Routing for Networks:
    1.1.1.1/32
    10.0.12.0/24
    10.0.13.0/24
    192.168.10.0</span>
  <span class="hl">Passive Interface(s):
    GigabitEthernet0/2</span>
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.12.2             90      00:03:10
    10.0.13.3             90      00:02:41

R1# show ip eigrp interfaces
EIGRP-IPv4 Interfaces for AS(100)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
Gi0/0                    1        0/0       0/0           6       0/0           50           0
Gi0/1                    1        0/0       0/0           9       0/0           50           0
Lo0                      0        0/0       0/0           0       0/0            0           0

R1# show ip route eigrp
D        2.2.2.2 [90/130816] via 10.0.12.2, 00:03:05, GigabitEthernet0/0
D        3.3.3.3 [90/131072] via 10.0.12.2, 00:02:36, GigabitEthernet0/0
D        10.0.23.0/24 [90/3072] via 10.0.12.2, 00:03:05, GigabitEthernet0/0
<span class="hl">D     192.168.30.0/24 [90/3328] via 10.0.12.2, 00:02:36, GigabitEthernet0/0</span></pre>
<p>Notice that Gi0/2 is missing from <code>show ip eigrp interfaces</code> because it is passive, yet R3 still has a <code>D</code> route to 192.168.10.0/24.</p>

<div class="eg"><p><b>Worked example: loopback metrics.</b> 2.2.2.2 via R2: R1 Gi0/0 (10 microseconds) plus R2 Loopback0 (5000 microseconds) = 5010 microseconds = 501 tens. Metric = 256 x (10 + 501) = <b>130816</b>. 3.3.3.3 adds one more Gigabit hop: 256 x (10 + 502) = <b>131072</b>. The large loopback delay is why loopback routes have much bigger metrics than LAN routes.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding <code>passive-interface</code> for a LAN but forgetting the <code>network</code> statement that covers it. Passive does not advertise anything on its own; without a matching network statement the subnet is simply not in EIGRP. That is the second fault in the troubleshooting lab.</p></div>

<div class="exam"><p><b>Exam trap.</b> The wildcard in <code>network 10.0.12.0 0.0.0.255</code> selects interfaces, not the mask of the advertised route. The advertised route always uses the interface's own mask. And the AS number is not locally significant the way an OSPF process ID is: it must match on neighbours.</p></div>

<div class="scn"><h4>The unexpected neighbour on the user LAN</h4><p>At a branch, EIGRP was enabled with <code>network 192.168.0.0 0.0.255.255</code> and no passive interfaces. A contractor connected a test router to the user LAN with a default EIGRP configuration for the same AS. It formed a neighbour with the branch router and advertised a default route, and half the branch's Internet traffic disappeared into the test bench. The fix was to make every LAN interface passive (<code>passive-interface default</code> plus explicit uplinks) and to add EIGRP authentication on the WAN links.</p><p><b>Lesson:</b> every interface that faces users should be passive; authentication is the second layer of defence.</p></div>

<div class="iv"><p class="q">"What does the network command do under router eigrp, and what does passive-interface change?"</p><p>Strong answer: the network command matches interfaces by their primary IP with a wildcard; matching interfaces send Hellos and have their connected subnets advertised. Without a wildcard it matches the classful network. Passive-interface stops Hellos on that interface, so no neighbours form there, but the subnet stays advertised if a network statement covers it. Mention using passive-interface default on routers with many LANs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router eigrp AS</code>: the AS must match on all neighbours.</li>
<li>Router ID: configured, else highest up loopback, else highest up physical interface address.</li>
<li><code>network</code> selects interfaces by primary IP with a wildcard; without one it is classful.</li>
<li>Passive interfaces send no Hellos but are still advertised if covered by a network statement.</li>
<li>Verify with <code>show ip protocols</code>, <code>show ip eigrp interfaces</code>, <code>show ip eigrp neighbors</code> and <code>show ip route eigrp</code>.</li>
</ul></div>
`,hi:`
<p>EIGRP configure karna ek naye receptionist ko yeh batane jaisa hai ki office ke kaunse darwaze kholne hain. <code>router eigrp</code> command receptionist ko hire karta hai; har <code>network</code> command un darwazon (interfaces) ki taraf ishara karta hai jinhe visitors ka swagat karna chahiye; <code>passive-interface</code> kehta hai "yeh darwaza visitors ke liye band rakho, lekin iska naam directory board par zaroor likho". Is chapter mein aap bilkul wahi configure karoge jo lab 1 maangta hai, line by line.</p>

<h3>Lab 1 topology</h3>
<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Lab 1 ke interfaces aur addresses">
<rect x="250" y="16" width="140" height="54" rx="8" fill="#bae6fd"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">R2 (ho chuka)</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">Lo0 2.2.2.2</text>
<rect x="30" y="120" width="150" height="54" rx="8" fill="#bbf7d0"/><text x="105" y="142" text-anchor="middle" class="svg-ink" font-size="14">R1 Jaipur</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lo0 1.1.1.1</text>
<rect x="460" y="120" width="150" height="54" rx="8" fill="#ddd6fe"/><text x="535" y="142" text-anchor="middle" class="svg-ink" font-size="14">R3 Noida</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">Lo0 3.3.3.3</text>
<line x1="170" y1="120" x2="250" y2="60" stroke="#64748b" stroke-width="3"/><text x="120" y="92" class="svg-muted" font-size="12">Gi0/0 .1 - .2</text>
<line x1="390" y1="60" x2="470" y2="120" stroke="#64748b" stroke-width="3"/><text x="420" y="92" class="svg-muted" font-size="12">.2 - .3 Gi0/0</text>
<line x1="180" y1="160" x2="460" y2="160" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6 4"/><text x="320" y="152" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1 10.0.13.1 - .3 (10 Mbps)</text>
<rect x="30" y="220" width="150" height="40" rx="8" fill="#fde68a"/><text x="105" y="245" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 192.168.10.1</text>
<rect x="460" y="220" width="150" height="40" rx="8" fill="#fde68a"/><text x="535" y="245" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 192.168.30.1</text>
<line x1="105" y1="174" x2="105" y2="220" stroke="#64748b" stroke-width="2"/><line x1="535" y1="174" x2="535" y2="220" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">R2 par EIGRP AS 100 pehle se chal raha hai. Aapka kaam: R1 aur R3, precise wildcard statements aur passive LANs ke saath.</p></div>

<h3>Step 1: process start karo aur router ID set karo</h3>
<pre class="code">R1(config)# router eigrp 100
R1(config-router)# eigrp router-id 1.1.1.1</pre>
<p>Number 100 <b>autonomous system</b> number hai aur domain ke har router par same hona chahiye. <b>Router ID</b> is order mein chuna jaata hai: <code>eigrp router-id</code> command, warna up loopback ka sabse bada IPv4 address, warna up physical interface ka sabse bada IPv4 address. Ise haath se set karo taaki reload ke baad kabhi na badle. EIGRP router ID ko mainly external routes tag karne ke liye use karta hai, isi wajah se duplicate ID redistribution tod deta hai.</p>

<h3>Step 2: network statements interfaces select karte hain</h3>
<pre class="code">R1(config-router)# network 10.0.12.0 0.0.0.255     <span class="c">! Gi0/0 R2 ki taraf</span>
R1(config-router)# network 10.0.13.0 0.0.0.255     <span class="c">! Gi0/1 R3 ka backup</span>
R1(config-router)# network 192.168.10.0 0.0.0.255  <span class="c">! Gi0/2 Jaipur LAN</span>
R1(config-router)# network 1.1.1.1 0.0.0.0         <span class="c">! sirf Loopback0</span></pre>
<p>EIGRP mein yeh sabse zyada galat samjha jaane wala command hai. <code>network</code> command khud se koi network advertise <b>nahi</b> karta. Yeh kehta hai: "jis bhi interface ka primary IP address is range mein aata hai, woh (1) Hellos bhejega aur receive karega aur (2) uska connected subnet advertise hoga". Wildcard ACL wildcard ki tarah kaam karta hai: 0 bits match hone chahiye, 1 bits ignore hote hain.</p>
<ul>
<li><code>network 1.1.1.1 0.0.0.0</code> bilkul ek address match karta hai: Loopback0.</li>
<li><code>network 10.0.12.0 0.0.0.255</code> 10.0.12.0 se 10.0.12.255 tak match karta hai, isliye sirf Gi0/0.</li>
<li>Wildcard ke bina <code>network 10.0.0.0</code> <b>classful</b> boundary use karta hai aur har 10.x.x.x interface match karta hai.</li>
<li><code>network 0.0.0.0</code> (ya <code>0.0.0.0 255.255.255.255</code>) har interface enable kar deta hai: lab mein jaldi, production mein khatarnaak.</li>
</ul>

<h3>Step 3: LAN par passive interfaces</h3>
<pre class="code">R1(config-router)# passive-interface GigabitEthernet0/2</pre>
<p>Passive interface Hellos bhejna aur process karna band kar deta hai, isliye us par koi neighbour nahi ban sakta, lekin jab tak koi network statement use cover kare, uska subnet <b>advertise hota rehta hai</b>. Har user LAN aur loopbacks par ise use karo. Bade routers par logic ulta kar sakte ho: <code>passive-interface default</code>, phir har asli uplink ke liye <code>no passive-interface GigabitEthernet0/0</code>.</p>

<h3>Step 4: auto-summary</h3>
<p><code>auto-summary</code> ke saath, EIGRP jab doosre major network ke interface se advertise karta hai to classful boundary (jaise 10.0.0.0/8) par summarise kar deta hai. Isse discontiguous designs toot jaate hain. IOS 15.0 se yeh default mein <b>off</b> hai; phir bhi kai engineers intent saaf karne ke liye <code>no auto-summary</code> type karte hain.</p>

<h3>R3: wahi kaam</h3>
<pre class="code">router eigrp 100
 eigrp router-id 3.3.3.3
 network 10.0.23.0 0.0.0.255
 network 10.0.13.0 0.0.0.255
 network 192.168.30.0 0.0.0.255
 network 3.3.3.3 0.0.0.0
 passive-interface GigabitEthernet0/2</pre>

<h3>Verification</h3>
<pre class="out">R1# show ip protocols
Routing Protocol is "eigrp 100"
  EIGRP-IPv4 Protocol for AS(100)
    Metric weight K1=1, K2=0, K3=1, K4=0, K5=0
    <span class="hl">Router-ID: 1.1.1.1</span>
    Topology : 0 (base)
      Active Timer: 3 min
      Distance: internal 90 external 170
      Maximum path: 4
      Maximum hopcount 100
      Maximum metric variance 1
  Automatic Summarization: disabled
  <span class="hl">Routing for Networks:
    1.1.1.1/32
    10.0.12.0/24
    10.0.13.0/24
    192.168.10.0</span>
  <span class="hl">Passive Interface(s):
    GigabitEthernet0/2</span>
  Routing Information Sources:
    Gateway         Distance      Last Update
    10.0.12.2             90      00:03:10
    10.0.13.3             90      00:02:41

R1# show ip eigrp interfaces
EIGRP-IPv4 Interfaces for AS(100)
                              Xmit Queue   PeerQ        Mean   Pacing Time   Multicast    Pending
Interface              Peers  Un/Reliable  Un/Reliable  SRTT   Un/Reliable   Flow Timer   Routes
Gi0/0                    1        0/0       0/0           6       0/0           50           0
Gi0/1                    1        0/0       0/0           9       0/0           50           0
Lo0                      0        0/0       0/0           0       0/0            0           0

R1# show ip route eigrp
D        2.2.2.2 [90/130816] via 10.0.12.2, 00:03:05, GigabitEthernet0/0
D        3.3.3.3 [90/131072] via 10.0.12.2, 00:02:36, GigabitEthernet0/0
D        10.0.23.0/24 [90/3072] via 10.0.12.2, 00:03:05, GigabitEthernet0/0
<span class="hl">D     192.168.30.0/24 [90/3328] via 10.0.12.2, 00:02:36, GigabitEthernet0/0</span></pre>
<p>Dhyan do ki <code>show ip eigrp interfaces</code> mein Gi0/2 nahi hai kyunki woh passive hai, phir bhi R3 ke paas 192.168.10.0/24 ka <code>D</code> route hai.</p>

<div class="eg"><p><b>Worked example: loopback metrics.</b> R2 ke through 2.2.2.2: R1 Gi0/0 (10 microseconds) plus R2 Loopback0 (5000 microseconds) = 5010 microseconds = 501 tens. Metric = 256 x (10 + 501) = <b>130816</b>. 3.3.3.3 ek aur Gigabit hop jodta hai: 256 x (10 + 502) = <b>131072</b>. Loopback ka bada delay hi wajah hai ki loopback routes ke metrics LAN routes se kahin bade hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> LAN ke liye <code>passive-interface</code> jodna lekin use cover karne wala <code>network</code> statement bhool jaana. Passive khud se kuch advertise nahi karta; matching network statement ke bina subnet EIGRP mein hota hi nahi. Troubleshooting lab ki doosri galti yahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>network 10.0.12.0 0.0.0.255</code> ka wildcard interfaces select karta hai, advertised route ka mask nahi. Advertised route hamesha interface ka apna mask use karta hai. Aur AS number OSPF process ID ki tarah locally significant nahi hai: neighbours par match hona chahiye.</p></div>

<div class="scn"><h4>User LAN par anjaan neighbour</h4><p>Ek branch par EIGRP <code>network 192.168.0.0 0.0.255.255</code> ke saath aur bina passive interfaces ke enable tha. Ek contractor ne same AS ki default EIGRP configuration wala test router user LAN se jod diya. Usne branch router ke saath neighbour bana liya aur default route advertise kar diya, aur branch ka aadha Internet traffic test bench mein gaayab ho gaya. Fix tha har LAN interface ko passive banana (<code>passive-interface default</code> plus explicit uplinks) aur WAN links par EIGRP authentication jodna.</p><p><b>Seekh:</b> users ki taraf wala har interface passive hona chahiye; authentication defence ki doosri layer hai.</p></div>

<div class="iv"><p class="q">"router eigrp ke neeche network command kya karta hai, aur passive-interface kya badalta hai?"</p><p>Strong answer: network command wildcard ke saath interfaces ko unke primary IP se match karta hai; matching interfaces Hellos bhejte hain aur unke connected subnets advertise hote hain. Wildcard ke bina yeh classful network match karta hai. Passive-interface us interface par Hellos rok deta hai, isliye wahan neighbours nahi bante, lekin agar network statement cover kare to subnet advertise hota rehta hai. Bahut saare LANs wale routers par passive-interface default use karne ki baat zaroor karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router eigrp AS</code>: AS saare neighbours par match hona chahiye.</li>
<li>Router ID: configured, warna sabse bada up loopback, warna sabse bada up physical interface address.</li>
<li><code>network</code> wildcard ke saath primary IP se interfaces select karta hai; wildcard ke bina classful.</li>
<li>Passive interfaces Hellos nahi bhejte lekin network statement cover kare to advertise hote hain.</li>
<li><code>show ip protocols</code>, <code>show ip eigrp interfaces</code>, <code>show ip eigrp neighbors</code> aur <code>show ip route eigrp</code> se verify karo.</li>
</ul></div>
`}};export{e as default};