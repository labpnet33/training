var e={id:`classic-config`,h:{en:`Classic configuration: ipv6 router ospf`,hi:`Classic configuration: ipv6 router ospf`},body:{en:`
<p>Opening a new restaurant takes three steps in a fixed order: get the trade licence for the building, register the business with a manager's ID, then open each counter one by one. Skip the licence and nothing can open. OSPFv3 in the classic style works the same way: turn on IPv6 routing, create the process with a router ID, then enable OSPFv3 on each interface. This chapter walks through the module lab exactly as you will type it.</p>

<h3>Step 0: the prerequisites</h3>
<ul>
<li><b><code>ipv6 unicast-routing</code></b> in global configuration. Without it, an IOS router behaves like an IPv6 host: it will not forward IPv6 packets between interfaces, will not send Router Advertisements, and IOS rejects the OSPFv3 commands with <code>% IPv6 routing not enabled</code>. In the lab this line is already in the startup configuration, but checking it is always the first thing you do.</li>
<li><b>IPv6 enabled on each interface</b>, which happens automatically as soon as you configure an IPv6 address (the link-local is created too). <code>ipv6 enable</code> alone also works: it creates only a link-local address, which is enough for OSPFv3 to form a neighbour on that link.</li>
<li><b>Interfaces up/up.</b> Check with <code>show ipv6 interface brief</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Classic OSPFv3 configuration steps">
<rect x="10" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="75" text-anchor="middle" class="svg-ink" font-size="13">0. ipv6</text><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">unicast-routing</text>
<rect x="170" y="50" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="75" text-anchor="middle" class="svg-ink" font-size="13">1. ipv6 router</text><text x="240" y="95" text-anchor="middle" class="svg-ink" font-size="13">ospf 10</text>
<rect x="330" y="50" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="75" text-anchor="middle" class="svg-ink" font-size="13">2. router-id</text><text x="400" y="95" text-anchor="middle" class="svg-ink" font-size="13">1.1.1.1</text>
<rect x="490" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="75" text-anchor="middle" class="svg-ink" font-size="13">3. ipv6 ospf 10</text><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">area 0 (per int)</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Miss step 0 or step 2 and OSPFv3 stays silent</text>
</svg><p class="cap">Four steps, always in this order on an IPv6-only router.</p></div>

<h3>Step 1 and 2: the process and router ID</h3>
<pre class="code"><span class="c">! R1: create process 10 and give it a router ID</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# exit</pre>
<p>The <b>process ID</b> (10 here) is locally significant, exactly as in OSPFv2: R1 could use 10 and R2 could use 20 and they would still become neighbours. The lab uses 10 on every router to keep things tidy. Note the prompt <code>(config-rtr)</code> for the classic OSPFv3 process.</p>

<h3>Step 3: enable OSPFv3 on each interface</h3>
<pre class="code"><span class="c">! R1: the link to R2 and the Delhi LAN</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ipv6 ospf 10 area 0
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ipv6 ospf 10 area 0
R1(config-if)# end</pre>
<p>This one interface command does two jobs: it starts sending Hellos on that link <b>and</b> it advertises the interface's IPv6 prefixes into area 0. There is no separate "advertise this network" step. Repeat on R2 and R3 with their own router IDs:</p>
<pre class="code"><span class="c">! R2</span>
ipv6 router ospf 10
 router-id 2.2.2.2
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
interface GigabitEthernet0/1
 ipv6 ospf 10 area 0
<span class="c">! R3</span>
ipv6 router ospf 10
 router-id 3.3.3.3
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
interface GigabitEthernet0/1
 ipv6 ospf 10 area 0</pre>
<p>Within about 40 seconds (the DR/BDR wait timer on broadcast links) you will see log messages like:</p>
<pre class="out"><span class="hl">%OSPFv3-5-ADJCHG: Process 10, Nbr 2.2.2.2 on GigabitEthernet0/0 from LOADING to FULL, Loading Done</span></pre>

<h3>What the running configuration looks like</h3>
<pre class="out">R1# show running-config | section ospf|interface Gig
interface GigabitEthernet0/0
 description to R2
 no ip address
 ipv6 address 2001:DB8:ACAD:12::1/64
 <span class="hl">ipv6 ospf 10 area 0</span>
interface GigabitEthernet0/1
 description Delhi LAN
 no ip address
 ipv6 address 2001:DB8:ACAD:1::1/64
 <span class="hl">ipv6 ospf 10 area 0</span>
ipv6 router ospf 10
 <span class="hl">router-id 1.1.1.1</span></pre>
<p>If you type <code>ipv6 ospf 10 area 0</code> on an interface before the process exists, IOS creates <code>ipv6 router ospf 10</code> for you. On an IPv6-only router it then immediately complains with NORTRID, which is a useful reminder to add the router ID.</p>

<h3>Optional tuning, same ideas as OSPFv2</h3>
<pre class="code"><span class="c">! Interface-level (classic syntax always starts with ipv6 ospf)</span>
R1(config-if)# ipv6 ospf cost 10
R1(config-if)# ipv6 ospf priority 0
R1(config-if)# ipv6 ospf hello-interval 5
R1(config-if)# ipv6 ospf dead-interval 20
R1(config-if)# ipv6 ospf network point-to-point
<span class="c">! Process-level</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# auto-cost reference-bandwidth 10000</pre>
<ul>
<li><b>Cost:</b> set directly, or raise the reference bandwidth (in Mbps) identically on every router so 10G and 1G links get different costs.</li>
<li><b>Priority 0:</b> this router never becomes DR/BDR on that link.</li>
<li><b>Network point-to-point:</b> on a link with only two routers, skip the DR/BDR election and the 40-second wait. Both ends must match.</li>
<li><b>Loopbacks:</b> an IPv6 loopback is advertised as a /128 host route by default; <code>ipv6 ospf network point-to-point</code> on the loopback advertises its real prefix length.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> After the lab is configured, R1's cost to the Mumbai LAN is the sum of outgoing interface costs along the path: R1 Gi0/0 (1) + R2 Gi0/1 (1) + R3 Gi0/1, the LAN itself (1) = <b>3</b>. The route shows as <code>[110/3]</code>. If you set <code>ipv6 ospf cost 10</code> on R1 Gi0/0, it becomes <code>[110/12]</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>ipv6 unicast-routing</code> on one router: every OSPFv3 command is rejected with <code>% IPv6 routing not enabled</code>, and in a long paste that error scrolls past unnoticed. (2) Configuring <code>ipv6 ospf 10 area 0</code> on only one end of a link. (3) Typing the OSPFv2 command <code>ip ospf 10 area 0</code> by habit; that enables OSPFv2, not OSPFv3.</p></div>
<div class="exam"><p><b>Exam trap.</b> Which command advertises 2001:DB8:ACAD:1::/64 into OSPFv3? Not <code>network 2001:DB8:ACAD:1::/64 area 0</code> (does not exist) and not <code>ipv6 router ospf 10 area 0</code>. The answer is <code>ipv6 ospf 10 area 0</code> under the interface that owns that prefix.</p></div>

<div class="scn"><h4>The new router that would not route</h4><p>A Pune branch router was replaced. The engineer pasted the interface and OSPFv3 sections from the old router's backup and went for tea. IPv4 worked, but the branch had no IPv6 routes and <code>show ipv6 ospf neighbor</code> was empty. <code>show running-config | section ipv6 router</code> returned nothing, and the <code>ipv6 ospf 10 area 0</code> lines were missing from the interfaces. Scrolling back through the paste showed <code>% IPv6 routing not enabled</code> after every OSPFv3 line: the global <code>ipv6 unicast-routing</code> line had not been part of the copied sections. The engineer added it, pasted again, and both adjacencies went FULL.</p><p><b>Lesson:</b> always check the global prerequisite first; interface and process configuration are not enough.</p></div>

<div class="iv"><p class="q">"Walk me through configuring OSPFv3 on an IPv6-only router."</p><p>Strong answer, in order: enable <code>ipv6 unicast-routing</code>; create <code>ipv6 router ospf 10</code> and set <code>router-id</code> because there is no IPv4 address to choose from; on each interface apply <code>ipv6 ospf 10 area 0</code>, which both forms neighbours and advertises the prefix; optionally set passive interfaces and costs; verify with <code>show ipv6 ospf neighbor</code> and <code>show ipv6 route ospf</code>. Mention there is no network command.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: <code>ipv6 unicast-routing</code>, <code>ipv6 router ospf 10</code>, <code>router-id</code>, then <code>ipv6 ospf 10 area 0</code> per interface.</li>
<li>The interface command both forms adjacencies and advertises the interface's prefixes.</li>
<li>Process ID is locally significant; the prompt is <code>(config-rtr)</code>.</li>
<li>Tuning commands mirror OSPFv2 with an <code>ipv6 ospf</code> prefix.</li>
<li>Lab cost R1 to Mumbai LAN is 3 with default reference bandwidth.</li>
</ul></div>
`,hi:`
<p>Naya restaurant kholne ke teen steps hote hain ek fixed order mein: building ka trade licence lo, manager ki ID ke saath business register karo, phir ek ek karke har counter kholo. Licence skip karo to kuch nahi khulta. Classic style mein OSPFv3 bhi aise hi kaam karta hai: IPv6 routing on karo, router ID ke saath process banao, phir har interface par OSPFv3 enable karo. Yeh chapter module lab ko bilkul waise hi walk through karta hai jaise aap type karoge.</p>

<h3>Step 0: prerequisites</h3>
<ul>
<li>Global configuration mein <b><code>ipv6 unicast-routing</code></b>. Iske bina IOS router IPv6 host ki tarah behave karta hai: woh interfaces ke beech IPv6 packets forward nahi karega, Router Advertisements nahi bhejega, aur IOS OSPFv3 commands ko <code>% IPv6 routing not enabled</code> ke saath reject kar deta hai. Lab mein yeh line startup configuration mein pehle se hai, lekin ise check karna hamesha pehla kaam hai.</li>
<li><b>Har interface par IPv6 enabled</b>, jo IPv6 address configure karte hi apne aap ho jaata hai (link-local bhi ban jaata hai). Sirf <code>ipv6 enable</code> bhi kaam karta hai: yeh sirf link-local address banata hai, jo us link par OSPFv3 neighbour banane ke liye kaafi hai.</li>
<li><b>Interfaces up/up.</b> <code>show ipv6 interface brief</code> se check karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Classic OSPFv3 configuration steps">
<rect x="10" y="50" width="140" height="60" rx="8" fill="#fed7aa"/><text x="80" y="75" text-anchor="middle" class="svg-ink" font-size="13">0. ipv6</text><text x="80" y="95" text-anchor="middle" class="svg-ink" font-size="13">unicast-routing</text>
<rect x="170" y="50" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="75" text-anchor="middle" class="svg-ink" font-size="13">1. ipv6 router</text><text x="240" y="95" text-anchor="middle" class="svg-ink" font-size="13">ospf 10</text>
<rect x="330" y="50" width="140" height="60" rx="8" fill="#bae6fd"/><text x="400" y="75" text-anchor="middle" class="svg-ink" font-size="13">2. router-id</text><text x="400" y="95" text-anchor="middle" class="svg-ink" font-size="13">1.1.1.1</text>
<rect x="490" y="50" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="75" text-anchor="middle" class="svg-ink" font-size="13">3. ipv6 ospf 10</text><text x="560" y="95" text-anchor="middle" class="svg-ink" font-size="13">area 0 (har int)</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="12">Step 0 ya step 2 miss kiya to OSPFv3 chup rehta hai</text>
</svg><p class="cap">IPv6-only router par chaar steps, hamesha isi order mein.</p></div>

<h3>Step 1 aur 2: process aur router ID</h3>
<pre class="code"><span class="c">! R1: process 10 banao aur use router ID do</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# router-id 1.1.1.1
R1(config-rtr)# exit</pre>
<p><b>Process ID</b> (yahan 10) locally significant hai, bilkul OSPFv2 jaisa: R1 10 use kar sakta hai aur R2 20, phir bhi woh neighbours ban jaayenge. Lab cheezein saaf rakhne ke liye har router par 10 use karta hai. Classic OSPFv3 process ke liye prompt <code>(config-rtr)</code> par dhyan do.</p>

<h3>Step 3: har interface par OSPFv3 enable karo</h3>
<pre class="code"><span class="c">! R1: R2 wala link aur Delhi LAN</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ipv6 ospf 10 area 0
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# ipv6 ospf 10 area 0
R1(config-if)# end</pre>
<p>Yeh ek interface command do kaam karta hai: us link par Hellos bhejna shuru karta hai <b>aur</b> interface ke IPv6 prefixes ko area 0 mein advertise karta hai. "Is network ko advertise karo" jaisa koi alag step nahi hai. R2 aur R3 par unke apne router IDs ke saath repeat karo:</p>
<pre class="code"><span class="c">! R2</span>
ipv6 router ospf 10
 router-id 2.2.2.2
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
interface GigabitEthernet0/1
 ipv6 ospf 10 area 0
<span class="c">! R3</span>
ipv6 router ospf 10
 router-id 3.3.3.3
interface GigabitEthernet0/0
 ipv6 ospf 10 area 0
interface GigabitEthernet0/1
 ipv6 ospf 10 area 0</pre>
<p>Lagbhag 40 seconds mein (broadcast links par DR/BDR wait timer) aapko aise log messages dikhenge:</p>
<pre class="out"><span class="hl">%OSPFv3-5-ADJCHG: Process 10, Nbr 2.2.2.2 on GigabitEthernet0/0 from LOADING to FULL, Loading Done</span></pre>

<h3>Running configuration kaisa dikhta hai</h3>
<pre class="out">R1# show running-config | section ospf|interface Gig
interface GigabitEthernet0/0
 description to R2
 no ip address
 ipv6 address 2001:DB8:ACAD:12::1/64
 <span class="hl">ipv6 ospf 10 area 0</span>
interface GigabitEthernet0/1
 description Delhi LAN
 no ip address
 ipv6 address 2001:DB8:ACAD:1::1/64
 <span class="hl">ipv6 ospf 10 area 0</span>
ipv6 router ospf 10
 <span class="hl">router-id 1.1.1.1</span></pre>
<p>Agar aap process exist karne se pehle interface par <code>ipv6 ospf 10 area 0</code> type karte ho, to IOS aapke liye <code>ipv6 router ospf 10</code> bana deta hai. IPv6-only router par woh turant NORTRID ki shikayat karta hai, jo router ID jodne ka achha reminder hai.</p>

<h3>Optional tuning, OSPFv2 jaise hi ideas</h3>
<pre class="code"><span class="c">! Interface-level (classic syntax hamesha ipv6 ospf se shuru hota hai)</span>
R1(config-if)# ipv6 ospf cost 10
R1(config-if)# ipv6 ospf priority 0
R1(config-if)# ipv6 ospf hello-interval 5
R1(config-if)# ipv6 ospf dead-interval 20
R1(config-if)# ipv6 ospf network point-to-point
<span class="c">! Process-level</span>
R1(config)# ipv6 router ospf 10
R1(config-rtr)# auto-cost reference-bandwidth 10000</pre>
<ul>
<li><b>Cost:</b> seedha set karo, ya reference bandwidth (Mbps mein) har router par ek jaisa badhao taaki 10G aur 1G links ko alag costs milein.</li>
<li><b>Priority 0:</b> yeh router us link par kabhi DR/BDR nahi banega.</li>
<li><b>Network point-to-point:</b> sirf do routers wale link par DR/BDR election aur 40-second wait skip karo. Dono ends match hone chahiye.</li>
<li><b>Loopbacks:</b> IPv6 loopback default mein /128 host route ki tarah advertise hota hai; loopback par <code>ipv6 ospf network point-to-point</code> uski asli prefix length advertise karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Lab configure hone ke baad R1 ka Mumbai LAN tak cost path ke outgoing interface costs ka jod hai: R1 Gi0/0 (1) + R2 Gi0/1 (1) + R3 Gi0/1, khud LAN (1) = <b>3</b>. Route <code>[110/3]</code> dikhta hai. Agar aap R1 Gi0/0 par <code>ipv6 ospf cost 10</code> set karo, to yeh <code>[110/12]</code> ho jaata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek router par <code>ipv6 unicast-routing</code> bhoolna: har OSPFv3 command <code>% IPv6 routing not enabled</code> ke saath reject hota hai, aur lambe paste mein yeh error bina dikhe scroll ho jaata hai. (2) Link ke sirf ek end par <code>ipv6 ospf 10 area 0</code> configure karna. (3) Aadat se OSPFv2 command <code>ip ospf 10 area 0</code> type karna; woh OSPFv2 enable karta hai, OSPFv3 nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Kaunsa command 2001:DB8:ACAD:1::/64 ko OSPFv3 mein advertise karta hai? <code>network 2001:DB8:ACAD:1::/64 area 0</code> nahi (exist hi nahi karta) aur <code>ipv6 router ospf 10 area 0</code> bhi nahi. Jawab hai us prefix wale interface ke andar <code>ipv6 ospf 10 area 0</code>.</p></div>

<div class="scn"><h4>Naya router jo route nahi karta tha</h4><p>Pune branch ka router replace hua. Engineer ne purane router ke backup se interface aur OSPFv3 sections paste kiye aur chai peene chala gaya. IPv4 kaam kar raha tha, lekin branch par koi IPv6 routes nahi the aur <code>show ipv6 ospf neighbor</code> khaali tha. <code>show running-config | section ipv6 router</code> ne kuch nahi diya, aur interfaces par <code>ipv6 ospf 10 area 0</code> lines gayab thi. Paste ko upar scroll karke dekha to har OSPFv3 line ke baad <code>% IPv6 routing not enabled</code> tha: global <code>ipv6 unicast-routing</code> line copy kiye gaye sections mein thi hi nahi. Engineer ne woh line jodi, dobara paste kiya, aur dono adjacencies FULL ho gayi.</p><p><b>Seekh:</b> hamesha pehle global prerequisite check karo; interface aur process configuration kaafi nahi hai.</p></div>

<div class="iv"><p class="q">"IPv6-only router par OSPFv3 configure karna walk through karo."</p><p>Strong answer, order mein: <code>ipv6 unicast-routing</code> enable karo; <code>ipv6 router ospf 10</code> banao aur <code>router-id</code> set karo kyunki chunne ke liye koi IPv4 address nahi hai; har interface par <code>ipv6 ospf 10 area 0</code> lagao, jo neighbours bhi banata hai aur prefix bhi advertise karta hai; optionally passive interfaces aur costs set karo; <code>show ipv6 ospf neighbor</code> aur <code>show ipv6 route ospf</code> se verify karo. Batao ki network command nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: <code>ipv6 unicast-routing</code>, <code>ipv6 router ospf 10</code>, <code>router-id</code>, phir har interface par <code>ipv6 ospf 10 area 0</code>.</li>
<li>Interface command adjacencies bhi banata hai aur interface ke prefixes bhi advertise karta hai.</li>
<li>Process ID locally significant hai; prompt <code>(config-rtr)</code> hai.</li>
<li>Tuning commands OSPFv2 jaise hi hain, bas aage <code>ipv6 ospf</code> lagta hai.</li>
<li>Default reference bandwidth ke saath lab mein R1 se Mumbai LAN ka cost 3 hai.</li>
</ul></div>
`}};export{e as default};