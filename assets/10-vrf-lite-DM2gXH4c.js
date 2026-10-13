var e={id:`vrf-lite`,h:{en:`VRFs: virtualizing the router (VRF-lite on IOS)`,hi:`VRFs: router ko virtualize karna (IOS par VRF-lite)`},body:{en:`
<p>Picture a shared office building where two unrelated companies each have a room numbered 101. The receptionist keeps two separate visitor books, one per company, so a parcel for "Company A, room 101" never ends up in Company B's room 101. A <b>VRF</b> (Virtual Routing and Forwarding instance) gives a router exactly that: several separate routing tables, so networks that even use the <b>same IP addresses</b> can share one box without ever mixing.</p>

<h3>What a VRF is</h3>
<p>Normally a router has one routing table, the <b>global</b> table. Creating a VRF creates an additional, independent routing table and forwarding table. Each interface (or subinterface) belongs to <b>exactly one</b> VRF, or to the global table. A packet arriving on an interface is looked up only in that interface's VRF, and can only leave through interfaces of the same VRF.</p>
<ul>
<li><b>Isolation</b>: traffic in one VRF cannot reach another VRF unless you deliberately leak routes.</li>
<li><b>Overlapping addresses</b>: two customers can both use 10.1.1.0/24 on the same router.</li>
<li>Uses: service providers with many customers, enterprises separating guest, corporate and IoT traffic, and a <b>management VRF</b> that keeps device management apart from user traffic (many IOS XE and Nexus platforms ship with one already).</li>
</ul>
<p>This is the network version of server virtualization: one physical router, several virtual routers. <b>VRF-lite</b> means VRFs used without MPLS: each VRF is kept separate hop by hop, usually with one VLAN subinterface per VRF between routers. With MPLS L3VPN, VRFs are connected across a provider network using MP-BGP, route distinguishers and route targets; that is ENCOR and beyond.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two VRFs on one router">
<rect x="220" y="60" width="200" height="140" rx="10" fill="#e2e8f0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="236" y="94" width="168" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="12">VRF CUST-A table</text>
<rect x="236" y="144" width="168" height="40" rx="6" fill="#fde68a"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">VRF CUST-B table</text>
<rect x="20" y="94" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="12">Site A LAN</text><text x="90" y="127" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="20" y="144" width="140" height="40" rx="8" fill="#fde68a"/><text x="90" y="162" text-anchor="middle" class="svg-ink" font-size="12">Site B LAN</text><text x="90" y="177" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<line x1="160" y1="114" x2="236" y2="114" stroke="#64748b" stroke-width="2"/><text x="198" y="108" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<line x1="160" y1="164" x2="236" y2="164" stroke="#64748b" stroke-width="2"/><text x="198" y="158" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="404" y1="114" x2="490" y2="130" stroke="#64748b" stroke-width="2"/><line x1="404" y1="164" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="131" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="555" y="148" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.101 / .102</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">same subnet twice, never mixed</text>
</svg><p class="cap">R1 keeps a separate routing table per customer; one trunk to R2 carries both VRFs on subinterfaces 101 and 102.</p></div>

<h3>Configuration on IOS / IOS XE</h3>
<pre class="code"><span class="c">! 1. create the VRFs (modern multi-protocol syntax)</span>
R1(config)# vrf definition CUST-A
R1(config-vrf)# address-family ipv4
R1(config-vrf-af)# exit-address-family
R1(config-vrf)# vrf definition CUST-B
R1(config-vrf)# address-family ipv4
R1(config-vrf-af)# exit-address-family
<span class="c">! 2. put interfaces into VRFs, THEN add the IP address</span>
R1(config)# interface g0/1
R1(config-if)# vrf forwarding CUST-A
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# interface g0/2
R1(config-if)# vrf forwarding CUST-B
R1(config-if)# ip address 10.1.1.1 255.255.255.0
<span class="c">! 3. VRF-lite toward R2: one subinterface (one VLAN) per VRF</span>
R1(config-if)# interface g0/0.101
R1(config-subif)# encapsulation dot1Q 101
R1(config-subif)# vrf forwarding CUST-A
R1(config-subif)# ip address 172.16.0.1 255.255.255.252
R1(config-subif)# interface g0/0.102
R1(config-subif)# encapsulation dot1Q 102
R1(config-subif)# vrf forwarding CUST-B
R1(config-subif)# ip address 172.16.0.1 255.255.255.252
<span class="c">! 4. routing is per VRF too</span>
R1(config)# ip route vrf CUST-A 0.0.0.0 0.0.0.0 172.16.0.2
R1(config)# ip route vrf CUST-B 0.0.0.0 0.0.0.0 172.16.0.2</pre>
<p>Dynamic routing works per VRF as well, for example <code>router ospf 10 vrf CUST-A</code>. Older IOS uses <code>ip vrf CUST-A</code> and <code>ip vrf forwarding CUST-A</code>; the behaviour is the same for IPv4. A route distinguisher (<code>rd</code>) is only required when VRF routes are carried in MP-BGP.</p>
<p>If an interface already has an address when you type <code>vrf forwarding</code>, IOS removes it and tells you so:</p>
<pre class="out">% Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF CUST-A</pre>

<h3>Verification</h3>
<pre class="out">R1# show vrf
  Name                             Default RD            Protocols   Interfaces
<span class="hl">  CUST-A                           &lt;not set&gt;             ipv4        Gi0/1
                                                                     Gi0/0.101</span>
  CUST-B                           &lt;not set&gt;             ipv4        Gi0/2
                                                                     Gi0/0.102

R1# show ip route vrf CUST-A

Routing Table: CUST-A
Gateway of last resort is 172.16.0.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 172.16.0.2
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        10.1.1.0/24 is directly connected, GigabitEthernet0/1</span>
L        10.1.1.1/32 is directly connected, GigabitEthernet0/1
      172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
C        172.16.0.0/30 is directly connected, GigabitEthernet0/0.101
L        172.16.0.1/32 is directly connected, GigabitEthernet0/0.101

R1# ping 10.1.1.10
.....
<span class="hl">Success rate is 0 percent (0/5)</span>
R1# ping vrf CUST-A 10.1.1.10
!!!!!
<span class="hl">Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</span></pre>
<p>The plain <code>ping</code> fails because it uses the <b>global</b> table, which has no route to 10.1.1.0/24. Every show, ping and traceroute must name the VRF.</p>

<div class="eg"><p><b>Worked example.</b> A host 10.1.1.10 at site A sends a packet to the internet server 198.51.100.20. It enters R1 on Gi0/1, which is in CUST-A, so R1 looks only in the CUST-A table, matches S* 0.0.0.0/0 via 172.16.0.2, and sends it out Gi0/0.101 tagged VLAN 101. A packet from site B's 10.1.1.10 enters Gi0/2, is looked up in CUST-B and leaves on Gi0/0.102, tagged 102. Same source IP, two independent paths.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing the IP address first and <code>vrf forwarding</code> second, then wondering why the interface has no address. Another: troubleshooting with <code>show ip route</code> and <code>ping</code> in the global table and concluding "the route is missing".</p></div>

<div class="exam"><p><b>Exam trap.</b> VRFs virtualize the <b>routing table</b> (Layer 3); VLANs virtualize the <b>switch</b> (Layer 2). VRF-lite needs no MPLS. An interface belongs to only one VRF at a time, and overlapping IP addresses are allowed only in different VRFs.</p></div>

<div class="scn"><h4>"The router says the network does not exist"</h4><p>A junior engineer was asked to check reachability to the guest Wi-Fi controller at 10.50.0.5. <code>show ip route 10.50.0.5</code> returned "% Network not in table", and he escalated a "missing route". The guest network lived in VRF GUEST. <code>show ip route vrf GUEST 10.50.0.5</code> showed a healthy connected route, and <code>ping vrf GUEST 10.50.0.5</code> succeeded.</p><p><b>Lesson:</b> on any router with VRFs, first ask "which VRF?" before every show and ping.</p></div>

<div class="iv"><p class="q">"What is a VRF and why would you use VRF-lite?"</p><p>A VRF is a separate routing and forwarding table on one router; each interface belongs to one VRF, so traffic stays isolated and address ranges can overlap. VRF-lite uses VRFs without MPLS, keeping them separate hop by hop with one VLAN or subinterface per VRF. Give uses (multi-tenant, guest vs corporate, management VRF), the config steps (<code>vrf definition</code>, <code>vrf forwarding</code> before the IP) and verification (<code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code>).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VRF is an independent routing table on one router: the network equivalent of a VM.</li>
<li>Each interface belongs to one VRF; overlapping subnets are fine in different VRFs.</li>
<li>Config: <code>vrf definition NAME</code> + <code>address-family ipv4</code>, then <code>vrf forwarding NAME</code> before <code>ip address</code>.</li>
<li>Routes are per VRF: <code>ip route vrf NAME ...</code>, <code>router ospf N vrf NAME</code>.</li>
<li>Verify with <code>show vrf</code>, <code>show ip route vrf NAME</code> and <code>ping vrf NAME</code>; plain commands use the global table.</li>
</ul></div>
`,hi:`
<p>Ek shared office building socho jahan do bilkul alag companies ke paas room number 101 hai. Receptionist do alag visitor books rakhta hai, har company ki ek, taaki "Company A, room 101" ka parcel kabhi Company B ke room 101 mein na pahunche. <b>VRF</b> (Virtual Routing and Forwarding instance) router ko bilkul yahi deta hai: kai alag routing tables, taaki <b>same IP addresses</b> use karne wale networks bhi ek box share kar sakein aur kabhi mix na hon.</p>

<h3>VRF kya hai</h3>
<p>Normally router ki ek routing table hoti hai, <b>global</b> table. VRF banane se ek additional, independent routing table aur forwarding table banti hai. Har interface (ya subinterface) <b>bilkul ek</b> VRF ka, ya global table ka hota hai. Interface par aaya packet sirf us interface ke VRF mein lookup hota hai, aur sirf usi VRF ke interfaces se bahar ja sakta hai.</p>
<ul>
<li><b>Isolation</b>: ek VRF ka traffic doosre VRF tak nahi pahunch sakta jab tak aap jaan-boojh kar routes leak na karo.</li>
<li><b>Overlapping addresses</b>: do customers same router par dono 10.1.1.0/24 use kar sakte hain.</li>
<li>Uses: kai customers wale service providers, guest, corporate aur IoT traffic ko alag rakhne wale enterprises, aur ek <b>management VRF</b> jo device management ko user traffic se alag rakhta hai (kai IOS XE aur Nexus platforms mein yeh pehle se hota hai).</li>
</ul>
<p>Yeh server virtualization ka network wala roop hai: ek physical router, kai virtual routers. <b>VRF-lite</b> ka matlab hai bina MPLS ke VRFs use karna: har VRF hop by hop alag rakha jaata hai, aam taur par routers ke beech har VRF ke liye ek VLAN subinterface ke saath. MPLS L3VPN mein VRFs provider network ke paar MP-BGP, route distinguishers aur route targets se jude hote hain; woh ENCOR aur aage ka topic hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Ek router par do VRFs">
<rect x="220" y="60" width="200" height="140" rx="10" fill="#e2e8f0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="236" y="94" width="168" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="119" text-anchor="middle" class="svg-ink" font-size="12">VRF CUST-A table</text>
<rect x="236" y="144" width="168" height="40" rx="6" fill="#fde68a"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="12">VRF CUST-B table</text>
<rect x="20" y="94" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="90" y="112" text-anchor="middle" class="svg-ink" font-size="12">Site A LAN</text><text x="90" y="127" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<rect x="20" y="144" width="140" height="40" rx="8" fill="#fde68a"/><text x="90" y="162" text-anchor="middle" class="svg-ink" font-size="12">Site B LAN</text><text x="90" y="177" text-anchor="middle" class="svg-muted" font-size="12">10.1.1.0/24</text>
<line x1="160" y1="114" x2="236" y2="114" stroke="#64748b" stroke-width="2"/><text x="198" y="108" text-anchor="middle" class="svg-muted" font-size="12">Gi0/1</text>
<line x1="160" y1="164" x2="236" y2="164" stroke="#64748b" stroke-width="2"/><text x="198" y="158" text-anchor="middle" class="svg-muted" font-size="12">Gi0/2</text>
<line x1="404" y1="114" x2="490" y2="130" stroke="#64748b" stroke-width="2"/><line x1="404" y1="164" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="110" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="131" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="555" y="148" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.101 / .102</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="12">same subnet do baar, kabhi mix nahi</text>
</svg><p class="cap">R1 har customer ke liye alag routing table rakhta hai; R2 tak ek trunk subinterfaces 101 aur 102 par dono VRFs carry karta hai.</p></div>

<h3>IOS / IOS XE par configuration</h3>
<pre class="code"><span class="c">! 1. VRFs banao (modern multi-protocol syntax)</span>
R1(config)# vrf definition CUST-A
R1(config-vrf)# address-family ipv4
R1(config-vrf-af)# exit-address-family
R1(config-vrf)# vrf definition CUST-B
R1(config-vrf)# address-family ipv4
R1(config-vrf-af)# exit-address-family
<span class="c">! 2. interfaces ko VRFs mein daalo, PHIR IP address do</span>
R1(config)# interface g0/1
R1(config-if)# vrf forwarding CUST-A
R1(config-if)# ip address 10.1.1.1 255.255.255.0
R1(config-if)# interface g0/2
R1(config-if)# vrf forwarding CUST-B
R1(config-if)# ip address 10.1.1.1 255.255.255.0
<span class="c">! 3. R2 ki taraf VRF-lite: har VRF ke liye ek subinterface (ek VLAN)</span>
R1(config-if)# interface g0/0.101
R1(config-subif)# encapsulation dot1Q 101
R1(config-subif)# vrf forwarding CUST-A
R1(config-subif)# ip address 172.16.0.1 255.255.255.252
R1(config-subif)# interface g0/0.102
R1(config-subif)# encapsulation dot1Q 102
R1(config-subif)# vrf forwarding CUST-B
R1(config-subif)# ip address 172.16.0.1 255.255.255.252
<span class="c">! 4. routing bhi per VRF hoti hai</span>
R1(config)# ip route vrf CUST-A 0.0.0.0 0.0.0.0 172.16.0.2
R1(config)# ip route vrf CUST-B 0.0.0.0 0.0.0.0 172.16.0.2</pre>
<p>Dynamic routing bhi per VRF kaam karti hai, jaise <code>router ospf 10 vrf CUST-A</code>. Purana IOS <code>ip vrf CUST-A</code> aur <code>ip vrf forwarding CUST-A</code> use karta hai; IPv4 ke liye behaviour same hai. Route distinguisher (<code>rd</code>) sirf tab zaroori hai jab VRF routes MP-BGP mein carry hote hain.</p>
<p>Agar <code>vrf forwarding</code> type karte waqt interface par pehle se address hai, to IOS use hata deta hai aur bata deta hai:</p>
<pre class="out">% Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF CUST-A</pre>

<h3>Verification</h3>
<pre class="out">R1# show vrf
  Name                             Default RD            Protocols   Interfaces
<span class="hl">  CUST-A                           &lt;not set&gt;             ipv4        Gi0/1
                                                                     Gi0/0.101</span>
  CUST-B                           &lt;not set&gt;             ipv4        Gi0/2
                                                                     Gi0/0.102

R1# show ip route vrf CUST-A

Routing Table: CUST-A
Gateway of last resort is 172.16.0.2 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 172.16.0.2
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
<span class="hl">C        10.1.1.0/24 is directly connected, GigabitEthernet0/1</span>
L        10.1.1.1/32 is directly connected, GigabitEthernet0/1
      172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
C        172.16.0.0/30 is directly connected, GigabitEthernet0/0.101
L        172.16.0.1/32 is directly connected, GigabitEthernet0/0.101

R1# ping 10.1.1.10
.....
<span class="hl">Success rate is 0 percent (0/5)</span>
R1# ping vrf CUST-A 10.1.1.10
!!!!!
<span class="hl">Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</span></pre>
<p>Plain <code>ping</code> fail hota hai kyunki woh <b>global</b> table use karta hai, jismein 10.1.1.0/24 ka koi route nahi. Har show, ping aur traceroute mein VRF ka naam dena padta hai.</p>

<div class="eg"><p><b>Worked example.</b> Site A ka host 10.1.1.10 internet server 198.51.100.20 ko packet bhejta hai. Woh R1 mein Gi0/1 par aata hai, jo CUST-A mein hai, isliye R1 sirf CUST-A table dekhta hai, S* 0.0.0.0/0 via 172.16.0.2 match karta hai, aur use Gi0/0.101 se VLAN 101 tag ke saath bhejta hai. Site B ke 10.1.1.10 ka packet Gi0/2 par aata hai, CUST-B mein lookup hota hai aur Gi0/0.102 se tag 102 ke saath nikalta hai. Same source IP, do independent paths.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle IP address aur baad mein <code>vrf forwarding</code> type karna, phir sochna ki interface par address kyun nahi hai. Doosri: global table mein <code>show ip route</code> aur <code>ping</code> se troubleshoot karna aur yeh nishkarsh nikaalna ki "route missing hai".</p></div>

<div class="exam"><p><b>Exam trap.</b> VRFs <b>routing table</b> ko virtualize karte hain (Layer 3); VLANs <b>switch</b> ko virtualize karte hain (Layer 2). VRF-lite ko MPLS nahi chahiye. Ek interface ek samay mein sirf ek VRF ka hota hai, aur overlapping IP addresses sirf alag VRFs mein allowed hain.</p></div>

<div class="scn"><h4>"Router kehta hai network exist nahi karta"</h4><p>Ek junior engineer ko 10.50.0.5 wale guest Wi-Fi controller ki reachability check karne ko kaha gaya. <code>show ip route 10.50.0.5</code> ne "% Network not in table" diya, aur usne "missing route" escalate kar diya. Guest network VRF GUEST mein tha. <code>show ip route vrf GUEST 10.50.0.5</code> ne healthy connected route dikhaya, aur <code>ping vrf GUEST 10.50.0.5</code> successful raha.</p><p><b>Seekh:</b> VRFs wale kisi bhi router par har show aur ping se pehle poochho "kaunsa VRF?".</p></div>

<div class="iv"><p class="q">"VRF kya hai aur aap VRF-lite kyun use karoge?"</p><p>VRF ek router par alag routing aur forwarding table hai; har interface ek VRF ka hota hai, isliye traffic isolated rehta hai aur address ranges overlap kar sakti hain. VRF-lite bina MPLS ke VRFs use karta hai, har VRF ke liye ek VLAN ya subinterface ke saath unhe hop by hop alag rakhta hai. Uses do (multi-tenant, guest vs corporate, management VRF), config steps (<code>vrf definition</code>, IP se pehle <code>vrf forwarding</code>) aur verification (<code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code>).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF ek router par independent routing table hai: VM ka network wala roop.</li>
<li>Har interface ek VRF ka hota hai; alag VRFs mein overlapping subnets theek hain.</li>
<li>Config: <code>vrf definition NAME</code> + <code>address-family ipv4</code>, phir <code>ip address</code> se pehle <code>vrf forwarding NAME</code>.</li>
<li>Routes per VRF hote hain: <code>ip route vrf NAME ...</code>, <code>router ospf N vrf NAME</code>.</li>
<li><code>show vrf</code>, <code>show ip route vrf NAME</code> aur <code>ping vrf NAME</code> se verify karo; plain commands global table use karti hain.</li>
</ul></div>
`}};export{e as default};