var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Airline crews rehearse the engine-failure checklist until it is boring, because on the day it matters there is no time to think. Gateway failover is the same: it happens rarely, and when it does, you want the design, the numbers and the commands to be automatic. Use this chapter the day before the exam and before every change window that touches a gateway.</p>

<h3>The whole module on one page</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FHRP module summary">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Why</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">one gateway = SPOF</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">VIP + virtual MAC</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">HSRP</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">Active / Standby</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">v1 ac, v2 f, UDP 1985</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Election</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">priority, then high IP</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">preempt off by default</text>
<rect x="20" y="120" width="190" height="80" rx="8" fill="#fde68a"/><text x="115" y="144" text-anchor="middle" class="svg-ink" font-size="13">Tuning</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="12">timers 3/10, delay</text><text x="115" y="182" text-anchor="middle" class="svg-muted" font-size="12">track + decrement</text>
<rect x="225" y="120" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Others</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">VRRP Master/Backup</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">GLBP AVG/AVF</text>
<rect x="430" y="120" width="190" height="80" rx="8" fill="#e2e8f0"/><text x="525" y="144" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="525" y="164" text-anchor="middle" class="svg-muted" font-size="12">brief on all routers</text><text x="525" y="182" text-anchor="middle" class="svg-muted" font-size="12">test failover twice</text>
</svg><p class="cap">Six ideas: why, HSRP basics, election, tuning, the other FHRPs, and operating it safely.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why a single default gateway is a single point of failure and why hosts cannot fix it themselves.</li>
<li>I can describe how a VIP, a virtual MAC and gratuitous ARP make failover invisible to hosts.</li>
<li>I can work out the virtual MAC for any HSRP v1, HSRP v2 or VRRP group number.</li>
<li>I can name the HSRP states and predict the Active and Standby from priorities, IPs and boot order.</li>
<li>I can configure an HSRP group with priority and preempt and verify it with <code>show standby</code> and <code>show standby brief</code>.</li>
<li>I can explain preempt delay and choose HSRP timers sensibly.</li>
<li>I can configure object tracking and pick a decrement that actually moves the role.</li>
<li>I can share load with one group per VLAN and align the STP root with the Active gateway.</li>
<li>I can configure basic VRRP and explain GLBP's AVG/AVF model.</li>
<li>I can troubleshoot two-Active, wrong-Active and no-failover problems and retest.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FHRP</dt><dd>First Hop Redundancy Protocol; routers sharing a virtual gateway.</dd>
<dt>VIP</dt><dd>Virtual IP used by hosts as their default gateway.</dd>
<dt>Virtual MAC</dt><dd>Shared MAC answered by the forwarding router; moves at failover.</dd>
<dt>Gratuitous ARP</dt><dd>Unsolicited ARP sent by the new Active/Master so switches relearn the VMAC's port.</dd>
<dt>Active / Standby</dt><dd>HSRP forwarding router and its next-in-line.</dd>
<dt>Master / Backup</dt><dd>The VRRP equivalents.</dd>
<dt>AVG / AVF</dt><dd>GLBP's ARP-answering gateway and its forwarders.</dd>
<dt>Preempt</dt><dd>Permission for a higher-priority router to take over from a working Active.</dd>
<dt>Coup / Resign</dt><dd>HSRP messages to take over, or to give up, the Active role.</dd>
<dt>Tracking</dt><dd>Lowering priority by a decrement when a watched object goes down.</dd>
<dt>Owner</dt><dd>VRRP router whose real IP is the VIP; priority 255.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>HSRP default priority / range</td><td>100 / 0-255</td></tr>
<tr><td>Election tie-breaker</td><td>Highest interface IP</td></tr>
<tr><td>HSRP timers</td><td>Hello 3 s, hold 10 s</td></tr>
<tr><td>HSRP v1</td><td>Groups 0-255, 224.0.0.2, UDP 1985, 0000.0c07.acXX</td></tr>
<tr><td>HSRP v2</td><td>Groups 0-4095, 224.0.0.102, UDP 1985, 0000.0c9f.fXXX, IPv6</td></tr>
<tr><td>VRRP</td><td>Open standard, 224.0.0.18, IP protocol 112, 0000.5e00.01XX, advert 1 s</td></tr>
<tr><td>Preempt default</td><td>HSRP off, VRRP on</td></tr>
<tr><td>GLBP</td><td>Cisco, AVG + up to 4 AVFs, 0007.b400.XXYY, UDP 3222</td></tr>
<tr><td>Default tracking decrement</td><td>10</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! HSRP</span>
standby version 2
standby 10 ip 192.168.10.1
standby 10 priority 110
standby 10 preempt delay minimum 60
standby 10 timers 1 3
standby 10 authentication md5 key-string NK-Hsrp-Key
track 1 interface GigabitEthernet0/1 line-protocol
standby 10 track 1 decrement 20
<span class="c">! VRRP and GLBP</span>
vrrp 10 ip 192.168.10.1
vrrp 10 priority 110
glbp 10 ip 192.168.10.1
<span class="c">! verification</span>
show standby brief
show standby
show vrrp brief
show glbp brief
show track 1
show logging | include HSRP|DUPADDR</pre>

<div class="eg"><p><b>Worked example.</b> A quick self-test. R1 (192.168.10.2, priority 120, preempt, track uplink decrement 15) and R2 (192.168.10.3, priority 110, preempt) run HSRP v2 group 40. Virtual MAC? <code>0000.0c9f.f028</code> (40 = 0x028). R1's uplink fails: 120 - 15 = 105, below 110, so R2 takes over (it has preempt). Uplink returns: R1 back to 120, reclaims with preempt. If the decrement were 10: 110, a tie with R2, and the outcome would depend on the IP tie-breaker and preempt behaviour instead of your design. Avoid ties.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising MAC prefixes but mixing up which number goes where. The group or VRID is always the last part, in hex: group 10 is <code>0a</code>, not <code>10</code>. <code>0000.0c07.ac10</code> is group <b>16</b>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read every word: "open standard" means VRRP, "load balances within a subnet" means GLBP, "Active/Standby" means HSRP, "Master/Backup" means VRRP. "Higher priority but still Standby" means no preempt. "Both Active" means they cannot hear each other.</p></div>

<div class="scn"><h4>The change window checklist</h4><p>A service provider team in Bengaluru adopted a five-line checklist for every gateway change: 1) <code>show standby brief</code> on both peers before and after, 2) a client's ARP entry shows the virtual MAC, 3) continuous ping during a shutdown test, 4) the same during a physical link pull, 5) confirm preempt returned the role. Incidents caused by gateway changes dropped to zero in the following quarter.</p><p><b>Lesson:</b> a short, repeatable check beats a clever design that nobody verifies.</p></div>

<div class="iv"><p class="q">"In two minutes, tell me everything important about first-hop redundancy."</p><p>Strong answer: hosts have one gateway; FHRPs share a VIP and virtual MAC between routers so failover is invisible. HSRP: Cisco, Active/Standby, priority 100, highest IP breaks ties, preempt off, hello 3/hold 10, v1 0000.0c07.acXX on 224.0.0.2, v2 0000.0c9f.fXXX on 224.0.0.102, UDP 1985. Tracking lowers priority when an uplink fails; the peer needs preempt. Load sharing uses one group per VLAN aligned with the STP root. VRRP is the open standard with Master/Backup and preempt on; GLBP load-balances with AVG and AVFs. Verify with show standby brief on all routers and test failover.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FHRPs turn several routers into one virtual gateway with a shared VIP and MAC.</li>
<li>HSRP: priority, highest IP, preempt off, 3/10 timers, v1 and v2 MAC formats.</li>
<li>Tracking plus preempt makes failover react to uplink failures.</li>
<li>VRRP is the open standard with preempt on; GLBP balances per host.</li>
<li>Always verify on every router and from a client, and test failover both ways.</li>
</ul></div>
`,hi:`
<p>Airline crews engine-failure checklist ki itni practice karte hain ki woh boring ho jaaye, kyunki jis din zaroorat padti hai us din sochne ka time nahi hota. Gateway failover bhi aisa hi hai: yeh kabhi kabhi hota hai, aur jab hota hai, to aap chahte ho ki design, numbers aur commands automatic hon. Is chapter ko exam se ek din pehle aur har us change window se pehle use karo jo gateway ko chhoota hai.</p>

<h3>Poora module ek page par</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="FHRP module summary">
<rect x="20" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="115" y="44" text-anchor="middle" class="svg-ink" font-size="13">Kyun</text><text x="115" y="64" text-anchor="middle" class="svg-muted" font-size="12">ek gateway = SPOF</text><text x="115" y="82" text-anchor="middle" class="svg-muted" font-size="12">VIP + virtual MAC</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">HSRP</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">Active / Standby</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">v1 ac, v2 f, UDP 1985</text>
<rect x="430" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="525" y="44" text-anchor="middle" class="svg-ink" font-size="13">Election</text><text x="525" y="64" text-anchor="middle" class="svg-muted" font-size="12">priority, phir bada IP</text><text x="525" y="82" text-anchor="middle" class="svg-muted" font-size="12">preempt default off</text>
<rect x="20" y="120" width="190" height="80" rx="8" fill="#fde68a"/><text x="115" y="144" text-anchor="middle" class="svg-ink" font-size="13">Tuning</text><text x="115" y="164" text-anchor="middle" class="svg-muted" font-size="12">timers 3/10, delay</text><text x="115" y="182" text-anchor="middle" class="svg-muted" font-size="12">track + decrement</text>
<rect x="225" y="120" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="144" text-anchor="middle" class="svg-ink" font-size="13">Baaki</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">VRRP Master/Backup</text><text x="320" y="182" text-anchor="middle" class="svg-muted" font-size="12">GLBP AVG/AVF</text>
<rect x="430" y="120" width="190" height="80" rx="8" fill="#e2e8f0"/><text x="525" y="144" text-anchor="middle" class="svg-ink" font-size="13">Operate</text><text x="525" y="164" text-anchor="middle" class="svg-muted" font-size="12">saare routers par brief</text><text x="525" y="182" text-anchor="middle" class="svg-muted" font-size="12">failover do baar test</text>
</svg><p class="cap">Chhe ideas: kyun, HSRP basics, election, tuning, baaki FHRPs, aur ise safely chalana.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki ek akela default gateway single point of failure kyun hai aur hosts ise khud kyun theek nahi kar sakte.</li>
<li>Main describe kar sakta hoon ki VIP, virtual MAC aur gratuitous ARP failover ko hosts se kaise chhupate hain.</li>
<li>Main kisi bhi HSRP v1, HSRP v2 ya VRRP group number ka virtual MAC nikaal sakta hoon.</li>
<li>Main HSRP states ke naam le sakta hoon aur priorities, IPs aur boot order se Active aur Standby predict kar sakta hoon.</li>
<li>Main priority aur preempt ke saath HSRP group configure kar sakta hoon aur <code>show standby</code> aur <code>show standby brief</code> se verify kar sakta hoon.</li>
<li>Main preempt delay samjha sakta hoon aur HSRP timers samajhdaari se chun sakta hoon.</li>
<li>Main object tracking configure kar sakta hoon aur aisa decrement chun sakta hoon jo sach mein role move kare.</li>
<li>Main har VLAN ke ek group se load share kar sakta hoon aur STP root ko Active gateway ke saath align kar sakta hoon.</li>
<li>Main basic VRRP configure kar sakta hoon aur GLBP ka AVG/AVF model samjha sakta hoon.</li>
<li>Main do-Active, galat-Active aur failover-nahi problems troubleshoot aur retest kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>FHRP</dt><dd>First Hop Redundancy Protocol; virtual gateway share karne wale routers.</dd>
<dt>VIP</dt><dd>Virtual IP jo hosts default gateway ki tarah use karte hain.</dd>
<dt>Virtual MAC</dt><dd>Shared MAC jiska jawab forward karne wala router deta hai; failover par move hota hai.</dd>
<dt>Gratuitous ARP</dt><dd>Naye Active/Master ka bina maange bheja ARP taaki switches VMAC ka port dobara seekhein.</dd>
<dt>Active / Standby</dt><dd>HSRP ka forward karne wala router aur uske baad wala.</dd>
<dt>Master / Backup</dt><dd>VRRP ke barabar roles.</dd>
<dt>AVG / AVF</dt><dd>GLBP ka ARP ka jawab dene wala gateway aur uske forwarders.</dd>
<dt>Preempt</dt><dd>Zyada priority wale router ko chalte Active se kaam lene ki ijaazat.</dd>
<dt>Coup / Resign</dt><dd>Active role lene, ya chhodne ke HSRP messages.</dd>
<dt>Tracking</dt><dd>Dekhi ja rahi cheez down hone par priority ko decrement se kam karna.</dd>
<dt>Owner</dt><dd>VRRP router jiska asli IP hi VIP hai; priority 255.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>HSRP default priority / range</td><td>100 / 0-255</td></tr>
<tr><td>Election tie-breaker</td><td>Sabse bada interface IP</td></tr>
<tr><td>HSRP timers</td><td>Hello 3 s, hold 10 s</td></tr>
<tr><td>HSRP v1</td><td>Groups 0-255, 224.0.0.2, UDP 1985, 0000.0c07.acXX</td></tr>
<tr><td>HSRP v2</td><td>Groups 0-4095, 224.0.0.102, UDP 1985, 0000.0c9f.fXXX, IPv6</td></tr>
<tr><td>VRRP</td><td>Open standard, 224.0.0.18, IP protocol 112, 0000.5e00.01XX, advert 1 s</td></tr>
<tr><td>Preempt default</td><td>HSRP off, VRRP on</td></tr>
<tr><td>GLBP</td><td>Cisco, AVG + 4 tak AVFs, 0007.b400.XXYY, UDP 3222</td></tr>
<tr><td>Default tracking decrement</td><td>10</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! HSRP</span>
standby version 2
standby 10 ip 192.168.10.1
standby 10 priority 110
standby 10 preempt delay minimum 60
standby 10 timers 1 3
standby 10 authentication md5 key-string NK-Hsrp-Key
track 1 interface GigabitEthernet0/1 line-protocol
standby 10 track 1 decrement 20
<span class="c">! VRRP aur GLBP</span>
vrrp 10 ip 192.168.10.1
vrrp 10 priority 110
glbp 10 ip 192.168.10.1
<span class="c">! verification</span>
show standby brief
show standby
show vrrp brief
show glbp brief
show track 1
show logging | include HSRP|DUPADDR</pre>

<div class="eg"><p><b>Worked example.</b> Ek chhota self-test. R1 (192.168.10.2, priority 120, preempt, uplink track decrement 15) aur R2 (192.168.10.3, priority 110, preempt) HSRP v2 group 40 chalate hain. Virtual MAC? <code>0000.0c9f.f028</code> (40 = 0x028). R1 ka uplink fail hota hai: 120 - 15 = 105, 110 se neeche, isliye R2 kaam sambhalta hai (uske paas preempt hai). Uplink wapas: R1 phir 120, preempt se role wapas leta hai. Agar decrement 10 hota: 110, R2 ke saath tie, aur result aapke design ki jagah IP tie-breaker aur preempt behaviour par depend karta. Ties se bacho.</p></div>

<div class="warn"><p><b>Common galti.</b> MAC prefixes ratna lekin yeh mix kar dena ki kaunsa number kahan jaata hai. Group ya VRID hamesha aakhri hissa hota hai, hex mein: group 10 <code>0a</code> hai, <code>10</code> nahi. <code>0000.0c07.ac10</code> group <b>16</b> hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har shabd padho: "open standard" matlab VRRP, "subnet ke andar load balance" matlab GLBP, "Active/Standby" matlab HSRP, "Master/Backup" matlab VRRP. "Zyada priority phir bhi Standby" matlab preempt nahi. "Dono Active" matlab woh ek dusre ko sun nahi paa rahe.</p></div>

<div class="scn"><h4>Change window checklist</h4><p>Bengaluru ki ek service provider team ne har gateway change ke liye paanch line ki checklist apnayi: 1) pehle aur baad dono peers par <code>show standby brief</code>, 2) ek client ki ARP entry virtual MAC dikhaye, 3) shutdown test ke dauraan continuous ping, 4) wahi physical link nikaalte waqt, 5) confirm karo ki preempt ne role wapas diya. Agle quarter mein gateway changes se hone wale incidents zero ho gaye.</p><p><b>Seekh:</b> ek chhota, dohraya ja sakne wala check us chalaak design se behtar hai jise koi verify nahi karta.</p></div>

<div class="iv"><p class="q">"Do minute mein first-hop redundancy ke baare mein sab zaroori batao."</p><p>Strong answer: hosts ka ek gateway hota hai; FHRPs routers ke beech VIP aur virtual MAC share karte hain taaki failover dikhe hi nahi. HSRP: Cisco, Active/Standby, priority 100, sabse bada IP tie todta hai, preempt off, hello 3/hold 10, v1 0000.0c07.acXX 224.0.0.2 par, v2 0000.0c9f.fXXX 224.0.0.102 par, UDP 1985. Uplink fail hone par tracking priority kam karta hai; peer ko preempt chahiye. Load sharing har VLAN ka ek group use karta hai jo STP root ke saath aligned ho. VRRP open standard hai Master/Backup aur preempt on ke saath; GLBP AVG aur AVFs se load-balance karta hai. Saare routers par show standby brief se verify karo aur failover test karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FHRPs kai routers ko shared VIP aur MAC wale ek virtual gateway mein badalte hain.</li>
<li>HSRP: priority, sabse bada IP, preempt off, 3/10 timers, v1 aur v2 MAC formats.</li>
<li>Tracking plus preempt failover ko uplink failures par react karwata hai.</li>
<li>VRRP preempt on wala open standard hai; GLBP per host balance karta hai.</li>
<li>Hamesha har router par aur ek client se verify karo, aur failover dono tarike se test karo.</li>
</ul></div>
`}};export{e as default};