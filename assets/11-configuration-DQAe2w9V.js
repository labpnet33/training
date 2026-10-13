var e={id:`config`,h:{en:`Configuring single-area OSPF, step by step`,hi:`Single-area OSPF configure karna, step by step`},body:{en:`
<p>There are two ways to invite people to a society event. You can announce "everyone living on Street 4, houses 1 to 3, is invited", or you can hand a personal card to each guest. OSPF offers the same two methods for enabling interfaces: <b>network statements</b> with a wildcard mask, which match a range of interface addresses, and the <b>interface command</b>, which enables one interface directly. Both are on the exam, and both appear in Lab 1.</p>

<h3>Step 1: start the process</h3>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1</pre>
<p>The <b>process ID</b> (1 to 65535) is local to this router and never appears in any packet. Neighbours can use different numbers, although using the same number everywhere keeps configurations tidy.</p>

<h3>Step 2a: enable interfaces with network statements</h3>
<pre class="code">R1(config-router)# network 10.0.12.0 0.0.0.3 area 0
R1(config-router)# network 1.1.1.1 0.0.0.0 area 0</pre>
<p>A <code>network</code> statement does <b>not</b> advertise the range you type. It says: "enable OSPF, in this area, on every interface whose IP address matches this address and wildcard". OSPF then advertises each matched interface's <b>real subnet and mask</b>. In a wildcard mask, a 0 bit means "must match" and a 1 bit means "ignore". The quick way to find it is 255.255.255.255 minus the subnet mask.</p>
<table class="cmp"><tr><th>Goal</th><th>Statement</th><th>Matches</th></tr>
<tr><td>Exactly one interface</td><td><code>network 10.0.12.1 0.0.0.0 area 0</code></td><td>Only 10.0.12.1</td></tr>
<tr><td>A /30 link</td><td><code>network 10.0.12.0 0.0.0.3 area 0</code></td><td>10.0.12.0 to 10.0.12.3</td></tr>
<tr><td>A /24 LAN</td><td><code>network 192.168.30.0 0.0.0.255 area 0</code></td><td>192.168.30.0 to .255</td></tr>
<tr><td>All of 10.x</td><td><code>network 10.0.0.0 0.255.255.255 area 0</code></td><td>Every 10.x interface</td></tr>
<tr><td>Everything</td><td><code>network 0.0.0.0 255.255.255.255 area 0</code></td><td>Every interface with an IP</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="How R2's network statements match its interfaces">
<rect x="10" y="10" width="280" height="170" rx="10" fill="#e2e8f0"/><text x="150" y="34" text-anchor="middle" class="svg-ink" font-size="13">R2 network statements</text>
<text x="30" y="70" class="svg-ink" font-size="12">network 10.0.12.0 0.0.0.3 area 0</text>
<text x="30" y="110" class="svg-ink" font-size="12">network 10.0.23.0 0.0.0.3 area 0</text>
<text x="30" y="150" class="svg-ink" font-size="12">network 2.2.2.2 0.0.0.0 area 0</text>
<rect x="350" y="10" width="280" height="170" rx="10" fill="#bbf7d0"/><text x="490" y="34" text-anchor="middle" class="svg-ink" font-size="13">Interfaces enabled (advertised)</text>
<text x="370" y="70" class="svg-ink" font-size="12">Gi0/0 10.0.12.2 (10.0.12.0/30)</text>
<text x="370" y="110" class="svg-ink" font-size="12">Gi0/1 10.0.23.1 (10.0.23.0/30)</text>
<text x="370" y="150" class="svg-ink" font-size="12">Lo0 2.2.2.2 (2.2.2.2/32)</text>
<line x1="290" y1="66" x2="350" y2="66" stroke="#64748b" stroke-width="2"/><line x1="290" y1="106" x2="350" y2="106" stroke="#64748b" stroke-width="2"/><line x1="290" y1="146" x2="350" y2="146" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each statement matches an interface address; OSPF then advertises that interface's own subnet and mask.</p></div>

<h3>Step 2b: or enable interfaces directly</h3>
<pre class="code">R4(config)# interface GigabitEthernet0/0
R4(config-if)# ip ospf 1 area 0
R4(config-if)# interface Loopback0
R4(config-if)# ip ospf 1 area 0</pre>
<p>The interface method is explicit and easy to read: open the interface, and you see its OSPF area. If the process does not exist yet, IOS creates it. If both methods cover the same interface, the <b>interface command takes precedence</b>.</p>

<h3>Step 3: passive interfaces</h3>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# passive-interface Loopback0
<span class="c">! Or the secure-by-default style for routers with many LANs:</span>
R1(config-router)# passive-interface default
R1(config-router)# no passive-interface GigabitEthernet0/0</pre>
<p>A <b>passive</b> interface still has its subnet advertised, but sends and processes no Hellos, so no neighbour can form on it. Use it on loopbacks and on every LAN with only hosts. It saves a little CPU and, more importantly, stops a laptop running routing software from joining your OSPF domain.</p>

<h3>Step 4: advertise a default route</h3>
<pre class="code"><span class="c">! R1 is the internet edge</span>
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1(config)# router ospf 1
R1(config-router)# default-information originate</pre>
<p>R1 becomes an ASBR and injects 0.0.0.0/0 as an external route. Other routers show it as <code>O*E2 0.0.0.0/0 [110/1]</code>. Without the keyword <code>always</code>, R1 advertises the default only while it has one in its own routing table, which is usually what you want: if the internet route disappears, the default is withdrawn too.</p>

<div class="eg"><p><b>Worked example: Lab 1 complete.</b> R1: <code>network 10.0.12.0 0.0.0.3 area 0</code> and <code>network 1.1.1.1 0.0.0.0 area 0</code>. R2: <code>10.0.12.0 0.0.0.3</code>, <code>10.0.23.0 0.0.0.3</code> and <code>2.2.2.2 0.0.0.0</code>, all area 0. R3 the same pattern with 10.0.23.0, 10.0.34.0 and 3.3.3.3. R4 with the interface method on Gi0/0 and Loopback0. On all four, <code>passive-interface Loopback0</code>, then <code>copy running-config startup-config</code>. After about 40 seconds for the DR elections, R1 reaches 4.4.4.4 with cost 4: its Gi0/0, R2's Gi0/1, R3's Gi0/1 and R4's Loopback0, each cost 1.</p></div>

<h3>Step 5: verify what you built</h3>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
<span class="hl">Gi0/0        1     0               10.0.12.2/30       1     DR    1/1</span>

R1# show ip route ospf
Gateway of last resort is not set

      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/3] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O        4.4.4.4 [110/4] via 10.0.12.2, 00:01:05, GigabitEthernet0/0</span>
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
O        10.0.34.0/30 [110/3] via 10.0.12.2, 00:01:05, GigabitEthernet0/0

R1# ping 4.4.4.4
!!!!!</pre>
<p><code>show ip ospf interface brief</code> proves which interfaces run OSPF, in which area, with what cost and role; <code>F/C</code> is full neighbours over total neighbours. The route table proves the SPF result, and the ping proves the data plane.</p>

<div class="warn"><p><b>Common mistakes.</b> Typing a subnet mask where a wildcard belongs: <code>network 10.0.12.0 255.255.255.252 area 0</code> is accepted, but IOS reads 255.255.255.252 as a wildcard, so it matches any interface address whose last two bits are 0, in any network, and may enable OSPF on interfaces you never intended. Forgetting the loopback network, so the loopback is never advertised. Making a transit link passive, which silently kills the neighbour on it.</p></div>

<div class="exam"><p><b>Exam traps.</b> The process ID is locally significant. A network statement enables interfaces; it does not define what is advertised. The interface command overrides a network statement. <code>passive-interface</code> keeps the subnet advertised but stops Hellos. <code>default-information originate</code> needs a default route in the table unless <code>always</code> is added.</p></div>

<div class="scn"><h4>Hellos to the internet</h4><p>To save time, an engineer configured a small office's edge router with <code>network 0.0.0.0 255.255.255.255 area 0</code>. It worked, but a security scan later showed the router sending OSPF Hellos out of its internet-facing interface every 10 seconds, advertising its presence and inviting anyone on the provider segment to peer. The fix was <code>passive-interface default</code> with <code>no passive-interface</code> only on the two internal router links, and specific network statements instead of the catch-all.</p><p><b>Lesson:</b> enable OSPF only where you need neighbours, and make everything else passive.</p></div>

<div class="iv"><p class="q">"What is the difference between the network command and ip ospf area on an interface?"</p><p>Strong answer: <code>network address wildcard area X</code> under the process enables OSPF on every interface whose IP falls in that range, and the interface's own subnet is advertised, not the range. <code>ip ospf &lt;process&gt; area X</code> enables one interface explicitly and takes precedence if both apply. I prefer the interface method or exact /32 network statements because they cannot accidentally catch new interfaces. Then mention passive interfaces and how you would verify with <code>show ip ospf interface brief</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router ospf 1</code> starts a process; the ID is local and need not match neighbours.</li>
<li><code>network address wildcard area X</code> enables matching interfaces; each advertises its real subnet.</li>
<li><code>ip ospf 1 area 0</code> enables one interface directly and wins over network statements.</li>
<li><code>passive-interface</code> advertises the subnet but sends no Hellos; use it on loopbacks and host LANs.</li>
<li><code>default-information originate</code> injects a default (O*E2) if the router has one, or always with <code>always</code>.</li>
</ul></div>
`,hi:`
<p>Society event mein logon ko bulane ke do tareeke hain. Aap announce kar sakte ho ki "Street 4 ke makaan 1 se 3 mein rehne wale sab invited hain", ya har guest ko personal card de sakte ho. OSPF interfaces enable karne ke liye yahi do tareeke deta hai: wildcard mask ke saath <b>network statements</b>, jo interface addresses ki ek range match karte hain, aur <b>interface command</b>, jo ek interface ko seedha enable karta hai. Dono exam mein aate hain, aur dono Lab 1 mein dikhte hain.</p>

<h3>Step 1: process start karo</h3>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# router-id 1.1.1.1</pre>
<p><b>Process ID</b> (1 se 65535) is router ke liye local hai aur kisi packet mein nahi dikhta. Neighbours alag numbers use kar sakte hain, halanki har jagah same number rakhne se configurations saaf rehti hain.</p>

<h3>Step 2a: network statements se interfaces enable karo</h3>
<pre class="code">R1(config-router)# network 10.0.12.0 0.0.0.3 area 0
R1(config-router)# network 1.1.1.1 0.0.0.0 area 0</pre>
<p><code>network</code> statement jo range aap type karte ho use advertise <b>nahi</b> karta. Yeh kehta hai: "is area mein, har us interface par OSPF enable karo jiska IP address is address aur wildcard se match kare". Phir OSPF har matched interface ka <b>asli subnet aur mask</b> advertise karta hai. Wildcard mask mein 0 bit matlab "match hona chahiye" aur 1 bit matlab "ignore karo". Ise nikaalne ka jaldi tareeka hai 255.255.255.255 minus subnet mask.</p>
<table class="cmp"><tr><th>Goal</th><th>Statement</th><th>Kya match hota hai</th></tr>
<tr><td>Bilkul ek interface</td><td><code>network 10.0.12.1 0.0.0.0 area 0</code></td><td>Sirf 10.0.12.1</td></tr>
<tr><td>Ek /30 link</td><td><code>network 10.0.12.0 0.0.0.3 area 0</code></td><td>10.0.12.0 se 10.0.12.3</td></tr>
<tr><td>Ek /24 LAN</td><td><code>network 192.168.30.0 0.0.0.255 area 0</code></td><td>192.168.30.0 se .255</td></tr>
<tr><td>Poora 10.x</td><td><code>network 10.0.0.0 0.255.255.255 area 0</code></td><td>Har 10.x interface</td></tr>
<tr><td>Sab kuch</td><td><code>network 0.0.0.0 255.255.255.255 area 0</code></td><td>IP wala har interface</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="R2 ke network statements uske interfaces se kaise match hote hain">
<rect x="10" y="10" width="280" height="170" rx="10" fill="#e2e8f0"/><text x="150" y="34" text-anchor="middle" class="svg-ink" font-size="13">R2 ke network statements</text>
<text x="30" y="70" class="svg-ink" font-size="12">network 10.0.12.0 0.0.0.3 area 0</text>
<text x="30" y="110" class="svg-ink" font-size="12">network 10.0.23.0 0.0.0.3 area 0</text>
<text x="30" y="150" class="svg-ink" font-size="12">network 2.2.2.2 0.0.0.0 area 0</text>
<rect x="350" y="10" width="280" height="170" rx="10" fill="#bbf7d0"/><text x="490" y="34" text-anchor="middle" class="svg-ink" font-size="13">Enable hue interfaces (advertised)</text>
<text x="370" y="70" class="svg-ink" font-size="12">Gi0/0 10.0.12.2 (10.0.12.0/30)</text>
<text x="370" y="110" class="svg-ink" font-size="12">Gi0/1 10.0.23.1 (10.0.23.0/30)</text>
<text x="370" y="150" class="svg-ink" font-size="12">Lo0 2.2.2.2 (2.2.2.2/32)</text>
<line x1="290" y1="66" x2="350" y2="66" stroke="#64748b" stroke-width="2"/><line x1="290" y1="106" x2="350" y2="106" stroke="#64748b" stroke-width="2"/><line x1="290" y1="146" x2="350" y2="146" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har statement ek interface address match karta hai; phir OSPF us interface ka apna subnet aur mask advertise karta hai.</p></div>

<h3>Step 2b: ya interfaces ko seedha enable karo</h3>
<pre class="code">R4(config)# interface GigabitEthernet0/0
R4(config-if)# ip ospf 1 area 0
R4(config-if)# interface Loopback0
R4(config-if)# ip ospf 1 area 0</pre>
<p>Interface method explicit aur padhne mein aasaan hai: interface kholo, aur uska OSPF area dikh jaata hai. Agar process abhi exist nahi karta, IOS use bana deta hai. Agar dono methods same interface ko cover karein, to <b>interface command ko precedence</b> milti hai.</p>

<h3>Step 3: passive interfaces</h3>
<pre class="code">R1(config)# router ospf 1
R1(config-router)# passive-interface Loopback0
<span class="c">! Ya bahut saare LANs wale routers ke liye secure-by-default style:</span>
R1(config-router)# passive-interface default
R1(config-router)# no passive-interface GigabitEthernet0/0</pre>
<p><b>Passive</b> interface ka subnet phir bhi advertise hota hai, lekin woh na Hellos bhejta hai na process karta hai, isliye uspar koi neighbour nahi ban sakta. Ise loopbacks aur sirf hosts wale har LAN par use karo. Isse thoda CPU bachta hai aur, zyada important, routing software chala raha koi laptop aapke OSPF domain mein join nahi kar pata.</p>

<h3>Step 4: default route advertise karo</h3>
<pre class="code"><span class="c">! R1 internet edge hai</span>
R1(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
R1(config)# router ospf 1
R1(config-router)# default-information originate</pre>
<p>R1 ASBR ban jaata hai aur 0.0.0.0/0 ko external route ke roop mein inject karta hai. Dusre routers ise <code>O*E2 0.0.0.0/0 [110/1]</code> dikhate hain. Keyword <code>always</code> ke bina R1 default tabhi advertise karta hai jab uski apni routing table mein default ho, jo aam taur par aap chahte ho: internet route gayab ho to default bhi withdraw ho jaata hai.</p>

<div class="eg"><p><b>Worked example: Lab 1 poora.</b> R1: <code>network 10.0.12.0 0.0.0.3 area 0</code> aur <code>network 1.1.1.1 0.0.0.0 area 0</code>. R2: <code>10.0.12.0 0.0.0.3</code>, <code>10.0.23.0 0.0.0.3</code> aur <code>2.2.2.2 0.0.0.0</code>, sab area 0. R3 same pattern mein 10.0.23.0, 10.0.34.0 aur 3.3.3.3 ke saath. R4 par Gi0/0 aur Loopback0 par interface method. Chaaron par <code>passive-interface Loopback0</code>, phir <code>copy running-config startup-config</code>. DR elections ke liye lagbhag 40 second baad R1 4.4.4.4 tak cost 4 se pahunchta hai: uska Gi0/0, R2 ka Gi0/1, R3 ka Gi0/1 aur R4 ka Loopback0, har ek cost 1.</p></div>

<h3>Step 5: jo banaya use verify karo</h3>
<pre class="out">R2# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Lo0          1     0               2.2.2.2/32         1     LOOP  0/0
<span class="hl">Gi0/1        1     0               10.0.23.1/30       1     BDR   1/1</span>
<span class="hl">Gi0/0        1     0               10.0.12.2/30       1     DR    1/1</span>

R1# show ip route ospf
Gateway of last resort is not set

      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O        3.3.3.3 [110/3] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
<span class="hl">O        4.4.4.4 [110/4] via 10.0.12.2, 00:01:05, GigabitEthernet0/0</span>
      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.12.2, 00:01:05, GigabitEthernet0/0
O        10.0.34.0/30 [110/3] via 10.0.12.2, 00:01:05, GigabitEthernet0/0

R1# ping 4.4.4.4
!!!!!</pre>
<p><code>show ip ospf interface brief</code> prove karta hai ki kaunse interfaces par OSPF chal raha hai, kis area mein, kis cost aur role ke saath; <code>F/C</code> matlab full neighbours upon total neighbours. Route table SPF ka result prove karti hai, aur ping data plane prove karta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Wildcard ki jagah subnet mask type karna: <code>network 10.0.12.0 255.255.255.252 area 0</code> accept ho jaata hai, lekin IOS 255.255.255.252 ko wildcard padhta hai, isliye yeh kisi bhi network ka har woh interface address match karta hai jiske last do bits 0 hon, aur un interfaces par OSPF enable kar sakta hai jinka aapne socha bhi nahi. Loopback network bhool jaana, jisse loopback kabhi advertise nahi hota. Transit link ko passive banana, jo uspar neighbour ko chupchaap khatam kar deta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Process ID locally significant hai. Network statement interfaces enable karta hai; kya advertise hoga yeh define nahi karta. Interface command network statement ko override karti hai. <code>passive-interface</code> subnet advertise rakhta hai lekin Hellos rok deta hai. <code>default-information originate</code> ko table mein default route chahiye, jab tak <code>always</code> na joda jaaye.</p></div>

<div class="scn"><h4>Internet ko Hellos</h4><p>Time bachane ke liye ek engineer ne chhote office ke edge router par <code>network 0.0.0.0 255.255.255.255 area 0</code> configure kiya. Kaam chal gaya, lekin baad mein security scan mein dikha ki router apne internet-facing interface se har 10 second OSPF Hellos bhej raha tha, apni maujoodgi advertise kar raha tha aur provider segment par kisi ko bhi peer karne ka nyota de raha tha. Fix tha <code>passive-interface default</code> aur sirf do internal router links par <code>no passive-interface</code>, aur catch-all ki jagah specific network statements.</p><p><b>Seekh:</b> OSPF sirf wahan enable karo jahan neighbours chahiye, aur baaki sab passive rakho.</p></div>

<div class="iv"><p class="q">"Network command aur interface par ip ospf area mein kya farak hai?"</p><p>Strong answer: process ke andar <code>network address wildcard area X</code> har us interface par OSPF enable karta hai jiska IP us range mein aata hai, aur interface ka apna subnet advertise hota hai, range nahi. <code>ip ospf &lt;process&gt; area X</code> ek interface ko explicitly enable karta hai aur dono lagu hon to iski precedence hoti hai. Main interface method ya exact /32 network statements prefer karta hoon kyunki woh galti se naye interfaces nahi pakadte. Phir passive interfaces aur <code>show ip ospf interface brief</code> se verify karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router ospf 1</code> process start karta hai; ID local hai aur neighbours se match hona zaroori nahi.</li>
<li><code>network address wildcard area X</code> matching interfaces enable karta hai; har ek apna asli subnet advertise karta hai.</li>
<li><code>ip ospf 1 area 0</code> ek interface ko seedha enable karta hai aur network statements se jeetta hai.</li>
<li><code>passive-interface</code> subnet advertise karta hai lekin Hellos nahi bhejta; loopbacks aur host LANs par use karo.</li>
<li><code>default-information originate</code> default (O*E2) inject karta hai agar router ke paas ho, ya <code>always</code> ke saath hamesha.</li>
</ul></div>
`}};export{e as default};