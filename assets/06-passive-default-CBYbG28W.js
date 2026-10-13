var e={id:`passive-default`,h:{en:`Passive interfaces and default route origination`,hi:`Passive interfaces aur default route origination`},body:{en:`
<p>A shop puts its name and address on the signboard facing the street, so everyone knows it exists. But the shopkeeper does not stand at the door shouting "Is any other shop here?" at every customer who walks past. A <b>passive interface</b> is that signboard without the shouting: OSPFv3 still advertises the interface's prefix, but it stops sending Hellos there. And a <b>default route</b> is the shop's standing instruction to staff: "If a customer asks for something we do not stock, send them to the main market." You met both ideas in OSPFv2; here is how they look in OSPFv3.</p>

<h3>Passive interfaces</h3>
<p>In our lab, R1 Gi0/1 faces the Delhi LAN and R3 Gi0/1 faces the Mumbai LAN. Only PCs and a switch live there, no OSPF routers. Sending Hellos every 10 seconds onto those LANs has two downsides: it wastes a little CPU and bandwidth, and, more importantly, it lets anyone who plugs a router or a laptop running routing software into the LAN try to form an adjacency and inject fake routes. Making the interface passive solves both, while the LAN prefix is still advertised.</p>
<pre class="code"><span class="c">! Classic style</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# passive-interface GigabitEthernet0/1
<span class="c">! Or: passive everywhere, then open only the router links</span>
R1(config-rtr)# passive-interface default
R1(config-rtr)# no passive-interface GigabitEthernet0/0

<span class="c">! Address-family style: inside the IPv6 family</span>
R1(config)# router ospfv3 10
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# passive-interface GigabitEthernet0/1</pre>
<p>Verify with the interface detail. The key line shows that Hellos are suppressed:</p>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:1, Interface ID 4
  Area 0, Process ID 10, Instance ID 0, Router ID 1.1.1.1
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:1
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">No Hellos (Passive interface)</span></pre>
<p>And on R3, the Delhi LAN is still in the routing table, proving the prefix is advertised.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Passive LAN interfaces and default route from an edge router">
<rect x="30" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="80" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="270" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="510" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="560" y="128" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="130" y1="123" x2="270" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="123" x2="510" y2="123" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="15" width="140" height="40" rx="8" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="320" y1="55" x2="320" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="400" y="80" class="svg-accent" font-size="12">static ::/0 + originate</text>
<rect x="10" y="190" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="210" text-anchor="middle" class="svg-ink" font-size="12">Delhi LAN</text><text x="80" y="226" text-anchor="middle" class="svg-muted" font-size="12">passive: no Hellos</text>
<rect x="490" y="190" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="210" text-anchor="middle" class="svg-ink" font-size="12">Mumbai LAN</text><text x="560" y="226" text-anchor="middle" class="svg-muted" font-size="12">passive: no Hellos</text>
<line x1="80" y1="146" x2="80" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="146" x2="560" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="200" y="170" text-anchor="middle" class="svg-muted" font-size="12">OE2 ::/0</text>
<text x="440" y="170" text-anchor="middle" class="svg-muted" font-size="12">OE2 ::/0</text>
</svg><p class="cap">LAN interfaces are passive; R2 (extended with an ISP link) originates ::/0 so R1 and R3 learn it as OE2.</p></div>

<h3>Default route origination</h3>
<p>Now extend the lab: R2 gets a third interface, Gi0/2, towards an internet provider whose router is 2001:DB8:FFFF:1::1. R1 and R3 need a way out for any destination they do not know. You could type a static default on every router, but OSPFv3 can advertise it for you. Two steps on R2:</p>
<pre class="code"><span class="c">! 1. R2 itself needs a default route</span>
R2(config)# ipv6 route ::/0 2001:DB8:FFFF:1::1
<span class="c">! 2. Advertise it into OSPFv3 (classic)</span>
R2(config)# ipv6 router ospf 10
R2(config-rtr)# default-information originate
<span class="c">! Same in AF style</span>
R2(config)# router ospfv3 10
R2(config-router)# address-family ipv6 unicast
R2(config-router-af)# default-information originate</pre>
<p>R2 becomes an <b>ASBR</b> and floods a type 5 AS-External LSA for <code>::/0</code>. By default it is advertised as external type 2 with metric 1, so on R1 you see:</p>
<pre class="out">R1# show ipv6 route ospf
<span class="c">...codes omitted...</span>
<span class="hl">OE2 ::/0 [110/1], tag 10</span>
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
O   2001:DB8:ACAD:3::/64 [110/3]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
O   2001:DB8:ACAD:23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</pre>
<p>Options you should recognise: <code>default-information originate always</code> advertises the default even if R2 has no default route of its own (useful when the upstream route comes and goes but can create a black hole); <code>metric</code> and <code>metric-type 1</code> change the cost and the external type.</p>

<div class="eg"><p><b>Worked example.</b> Without <code>always</code>: the ISP link fails, R2's static default is removed from its table (the next hop is no longer resolvable), R2 withdraws the ::/0 LSA, and R1 and R3 stop sending internet traffic to R2. With <code>always</code>: the LSA stays, R1 keeps forwarding internet traffic to R2, and R2 drops it. Use <code>always</code> only when another mechanism guarantees an exit.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Making a transit interface passive, for example R1 Gi0/0: the adjacency with R2 drops and the whole path breaks. (2) Configuring <code>default-information originate</code> on a router that has no default route and no <code>always</code>: nothing is advertised, and people assume the command is broken. (3) In AF style, adding passive-interface outside the address family on a release that expects it inside.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A passive interface stops its network from being advertised." False. Passive only stops Hellos, so no neighbours form on it; its prefix is still advertised. Also note the IPv6 default is written <code>::/0</code>, and the route code is <b>OE2</b>, not <code>O*E2</code> as in the IPv4 table.</p></div>

<div class="scn"><h4>The laptop that became a router</h4><p>At a training institute, a student's lab VM on the classroom LAN was running a routing daemon with OSPFv3 enabled in area 0. The classroom gateway had OSPFv3 on its LAN interface but not passive. The VM formed an adjacency and advertised a more specific route for the institute's DNS server prefix. Half the staff lost DNS over IPv6. The engineer found an unknown neighbour ID in <code>show ipv6 ospf neighbor</code> on the LAN interface, shut the port, made the LAN interface passive with <code>passive-interface default</code> plus <code>no passive-interface</code> on the uplinks, and added OSPFv3 authentication on the core links.</p><p><b>Lesson:</b> every user-facing interface should be passive. It is a security control, not just an optimisation.</p></div>

<div class="iv"><p class="q">"How do you advertise a default route in OSPFv3, and what is the always keyword for?"</p><p>Strong answer: on the edge router, have a default route such as <code>ipv6 route ::/0 &lt;next-hop&gt;</code>, then <code>default-information originate</code> under the OSPFv3 process (or under the IPv6 address family in <code>router ospfv3</code>). The router becomes an ASBR and floods a type 5 LSA; others see <code>OE2 ::/0</code> with metric 1. <code>always</code> advertises it even without a local default, which avoids flapping but risks black-holing. Mention checking with <code>show ipv6 route ospf</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Passive interfaces send no Hellos but still advertise their prefixes.</li>
<li>Use <code>passive-interface default</code> and <code>no passive-interface</code> on router-facing links.</li>
<li>In AF style, passive and default-route commands go under <code>address-family ipv6</code>.</li>
<li><code>default-information originate</code> needs a local ::/0 unless you add <code>always</code>.</li>
<li>Other routers learn it as <code>OE2 ::/0 [110/1]</code> via a link-local next hop.</li>
</ul></div>
`,hi:`
<p>Ek dukaan apna naam aur address sadak ki taraf signboard par lagati hai, taaki sabko pata ho ki woh exist karti hai. Lekin dukaandaar darwaaze par khade hokar har guzarne wale customer par "Kya yahan koi aur dukaan hai?" nahi chillata. <b>Passive interface</b> wahi signboard hai bina chillane ke: OSPFv3 interface ka prefix ab bhi advertise karta hai, lekin wahan Hellos bhejna band kar deta hai. Aur <b>default route</b> dukaan ka staff ke liye standing instruction hai: "Agar customer aisi cheez maange jo hum nahi rakhte, to use main market bhej do." Aap dono ideas OSPFv2 mein dekh chuke ho; yahan dekho OSPFv3 mein woh kaise dikhte hain.</p>

<h3>Passive interfaces</h3>
<p>Hamare lab mein R1 Gi0/1 Delhi LAN ki taraf hai aur R3 Gi0/1 Mumbai LAN ki taraf. Wahan sirf PCs aur ek switch hain, koi OSPF router nahi. Un LANs par har 10 seconds mein Hellos bhejne ke do nuksaan hain: thoda CPU aur bandwidth waste hota hai, aur zyada important, jo bhi LAN mein router ya routing software wala laptop lagaye woh adjacency banane ki koshish karke fake routes inject kar sakta hai. Interface ko passive banana dono problems solve karta hai, aur LAN prefix phir bhi advertise hota hai.</p>
<pre class="code"><span class="c">! Classic style</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# passive-interface GigabitEthernet0/1
<span class="c">! Ya: har jagah passive, phir sirf router links kholo</span>
R1(config-rtr)# passive-interface default
R1(config-rtr)# no passive-interface GigabitEthernet0/0

<span class="c">! Address-family style: IPv6 family ke andar</span>
R1(config)# router ospfv3 10
R1(config-router)# address-family ipv6 unicast
R1(config-router-af)# passive-interface GigabitEthernet0/1</pre>
<p>Interface detail se verify karo. Key line dikhati hai ki Hellos suppressed hain:</p>
<pre class="out">R1# show ipv6 ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Link Local Address FE80::5200:FF:FE01:1, Interface ID 4
  Area 0, Process ID 10, Instance ID 0, Router ID 1.1.1.1
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, local address FE80::5200:FF:FE01:1
  No backup designated router on this network
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    <span class="hl">No Hellos (Passive interface)</span></pre>
<p>Aur R3 par Delhi LAN ab bhi routing table mein hai, jo prove karta hai ki prefix advertise ho raha hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Passive LAN interfaces aur edge router se default route">
<rect x="30" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="80" y="128" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="270" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="320" y="128" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="510" y="100" width="100" height="46" rx="8" fill="#bae6fd"/><text x="560" y="128" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="130" y1="123" x2="270" y2="123" stroke="#64748b" stroke-width="2"/>
<line x1="370" y1="123" x2="510" y2="123" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="15" width="140" height="40" rx="8" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">ISP</text>
<line x1="320" y1="55" x2="320" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="400" y="80" class="svg-accent" font-size="12">static ::/0 + originate</text>
<rect x="10" y="190" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="80" y="210" text-anchor="middle" class="svg-ink" font-size="12">Delhi LAN</text><text x="80" y="226" text-anchor="middle" class="svg-muted" font-size="12">passive: Hellos nahi</text>
<rect x="490" y="190" width="140" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="210" text-anchor="middle" class="svg-ink" font-size="12">Mumbai LAN</text><text x="560" y="226" text-anchor="middle" class="svg-muted" font-size="12">passive: Hellos nahi</text>
<line x1="80" y1="146" x2="80" y2="190" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="146" x2="560" y2="190" stroke="#64748b" stroke-width="2"/>
<text x="200" y="170" text-anchor="middle" class="svg-muted" font-size="12">OE2 ::/0</text>
<text x="440" y="170" text-anchor="middle" class="svg-muted" font-size="12">OE2 ::/0</text>
</svg><p class="cap">LAN interfaces passive hain; R2 (ISP link ke saath extend kiya hua) ::/0 originate karta hai taaki R1 aur R3 use OE2 ki tarah seekhein.</p></div>

<h3>Default route origination</h3>
<p>Ab lab ko extend karo: R2 ko teesra interface Gi0/2 milta hai, ek internet provider ki taraf jiska router 2001:DB8:FFFF:1::1 hai. R1 aur R3 ko har us destination ke liye bahar ka raasta chahiye jo woh nahi jaante. Aap har router par static default type kar sakte ho, lekin OSPFv3 ise aapke liye advertise kar sakta hai. R2 par do steps:</p>
<pre class="code"><span class="c">! 1. R2 ke paas khud default route hona chahiye</span>
R2(config)# ipv6 route ::/0 2001:DB8:FFFF:1::1
<span class="c">! 2. Ise OSPFv3 mein advertise karo (classic)</span>
R2(config)# ipv6 router ospf 10
R2(config-rtr)# default-information originate
<span class="c">! AF style mein same</span>
R2(config)# router ospfv3 10
R2(config-router)# address-family ipv6 unicast
R2(config-router-af)# default-information originate</pre>
<p>R2 <b>ASBR</b> ban jaata hai aur <code>::/0</code> ke liye type 5 AS-External LSA flood karta hai. Default mein yeh metric 1 ke saath external type 2 ki tarah advertise hota hai, isliye R1 par aap dekhte ho:</p>
<pre class="out">R1# show ipv6 route ospf
<span class="c">...codes omitted...</span>
<span class="hl">OE2 ::/0 [110/1], tag 10</span>
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
O   2001:DB8:ACAD:3::/64 [110/3]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
O   2001:DB8:ACAD:23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</pre>
<p>Options jo aapko pehchanne chahiye: <code>default-information originate always</code> default ko tab bhi advertise karta hai jab R2 ke paas apna default route na ho (upstream route aata jaata ho tab useful, lekin black hole bana sakta hai); <code>metric</code> aur <code>metric-type 1</code> cost aur external type badalte hain.</p>

<div class="eg"><p><b>Worked example.</b> <code>always</code> ke bina: ISP link fail hota hai, R2 ka static default uski table se hat jaata hai (next hop resolve nahi hota), R2 ::/0 LSA withdraw karta hai, aur R1 aur R3 internet traffic R2 ko bhejna band kar dete hain. <code>always</code> ke saath: LSA rehta hai, R1 internet traffic R2 ko forward karta rehta hai, aur R2 use drop kar deta hai. <code>always</code> tabhi use karo jab koi doosra mechanism exit ki guarantee de.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Transit interface ko passive bana dena, jaise R1 Gi0/0: R2 ke saath adjacency gir jaati hai aur poora path toot jaata hai. (2) Aise router par <code>default-information originate</code> configure karna jiske paas default route nahi aur <code>always</code> bhi nahi: kuch advertise nahi hota, aur log sochte hain command kharab hai. (3) AF style mein passive-interface ko address family ke bahar daalna, us release par jo use andar expect karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Passive interface apne network ko advertise hone se rok deta hai." Galat. Passive sirf Hellos rokta hai, isliye us par neighbours nahi bante; uska prefix phir bhi advertise hota hai. Yeh bhi dhyan do ki IPv6 default <code>::/0</code> likha jaata hai, aur route code <b>OE2</b> hai, IPv4 table jaisa <code>O*E2</code> nahi.</p></div>

<div class="scn"><h4>Laptop jo router ban gaya</h4><p>Ek training institute mein classroom LAN par ek student ki lab VM ek routing daemon chala rahi thi jismein area 0 mein OSPFv3 enabled tha. Classroom gateway ke LAN interface par OSPFv3 tha lekin passive nahi. VM ne adjacency bana li aur institute ke DNS server prefix ke liye ek zyada specific route advertise kar diya. Aadhe staff ka IPv6 par DNS chala gaya. Engineer ko LAN interface par <code>show ipv6 ospf neighbor</code> mein ek anjaan neighbour ID mila, usne port shut kiya, <code>passive-interface default</code> plus uplinks par <code>no passive-interface</code> se LAN interface passive banaya, aur core links par OSPFv3 authentication joda.</p><p><b>Seekh:</b> har user-facing interface passive hona chahiye. Yeh security control hai, sirf optimisation nahi.</p></div>

<div class="iv"><p class="q">"OSPFv3 mein default route kaise advertise karte ho, aur always keyword kis liye hai?"</p><p>Strong answer: edge router par ek default route rakho jaise <code>ipv6 route ::/0 &lt;next-hop&gt;</code>, phir OSPFv3 process ke andar (ya <code>router ospfv3</code> mein IPv6 address family ke andar) <code>default-information originate</code>. Router ASBR ban jaata hai aur type 5 LSA flood karta hai; baaki routers metric 1 ke saath <code>OE2 ::/0</code> dekhte hain. <code>always</code> ise local default ke bina bhi advertise karta hai, jo flapping se bachata hai lekin black-holing ka risk laata hai. <code>show ipv6 route ospf</code> se check karna batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Passive interfaces Hellos nahi bhejte lekin apne prefixes phir bhi advertise karte hain.</li>
<li><code>passive-interface default</code> aur router-facing links par <code>no passive-interface</code> use karo.</li>
<li>AF style mein passive aur default-route commands <code>address-family ipv6</code> ke andar jaate hain.</li>
<li><code>default-information originate</code> ko local ::/0 chahiye jab tak aap <code>always</code> na jodo.</li>
<li>Baaki routers ise link-local next hop ke through <code>OE2 ::/0 [110/1]</code> ki tarah seekhte hain.</li>
</ul></div>
`}};export{e as default};