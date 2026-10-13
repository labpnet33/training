var e={id:`urpf-asymmetric`,h:{en:`uRPF in practice: asymmetric routing and the EDGE lab`,hi:`uRPF practice mein: asymmetric routing aur EDGE lab`},body:{en:`
<p>A courier company has two gates. Parcels from the south region always arrive at gate B, because that is the shortest road for the delivery trucks. But the company's own outgoing vans to the south leave through gate A, because that is where the loading bay is. If the strict mailroom clerk at gate B checks "would my reply leave by this gate?", every genuine southern parcel fails. Nothing is wrong with the parcels; the roads are simply <b>asymmetric</b>. This is the single most common way uRPF breaks legitimate traffic.</p>

<h3>The lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="uRPF lab topology">
<rect x="10" y="105" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="127" text-anchor="middle" class="svg-ink" font-size="13">PC-CUST</text><text x="65" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="190" y="100" width="120" height="60" rx="10" fill="#bae6fd"/><text x="250" y="125" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="250" y="144" text-anchor="middle" class="svg-muted" font-size="12">default via ISP-A</text>
<rect x="390" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.1</text>
<rect x="390" y="190" width="120" height="50" rx="8" fill="#fed7aa"/><text x="450" y="212" text-anchor="middle" class="svg-ink" font-size="13">ISP-B</text><text x="450" y="229" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.1</text>
<rect x="540" y="190" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="587" y="212" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="587" y="229" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<line x1="120" y1="130" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="390" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="145" x2="390" y2="215" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="450" y2="190" stroke="#64748b" stroke-width="2"/><line x1="510" y1="215" x2="540" y2="215" stroke="#64748b" stroke-width="2"/>
<text x="155" y="120" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1</text><text x="345" y="72" class="svg-muted" font-size="12">Gi0/0</text><text x="345" y="190" class="svg-accent" font-size="12">Gi0/2</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">INET to customer arrives on Gi0/2; EDGE routes back via Gi0/0</text>
</svg><p class="cap">The asymmetric path that makes strict mode wrong on Gi0/2.</p></div>
<p>EDGE has two static routes, both through ISP-A: <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1</code> and <code>ip route 198.51.100.0 255.255.255.0 100.64.1.1</code>. ISP-B, however, sends traffic for the customer 10.30.0.0/24 directly over the backup link to EDGE Gi0/2. So packets from INET (198.51.100.10) arrive on <b>Gi0/2</b>, while EDGE's best route back to 198.51.100.10 leaves via <b>Gi0/0</b>.</p>

<h3>Task 1: strict mode towards the customer</h3>
<pre class="code">EDGE(config)# interface GigabitEthernet0/1
EDGE(config-if)# ip verify unicast source reachable-via rx</pre>
<p>A genuine packet from 10.30.0.10 passes: the route back to 10.30.0.0/24 is the connected route on Gi0/1. A forged packet with source 203.0.113.50 fails: the only match is the default route, which is ignored, and even with <code>allow-default</code> it would point out of Gi0/0, not Gi0/1.</p>

<h3>Task 2: prove it with counters</h3>
<p>The lab generates the attack from PC-CUST with <code>traffic 198.51.100.10 udp/53 500 5 src 203.0.113.50</code> (five forged DNS packets). Then:</p>
<pre class="out">EDGE# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.30.0.1/24
  ...
  <span class="hl">IP verify source reachable-via RX</span>
   <span class="hl">5 verification drops</span>
   0 suppressed verification drops
   0 verification drop-rate

EDGE# show ip traffic
IP statistics:
  Rcvd:  1822 total, 96 local destination
  ...
  Drop:  0 encapsulation failed, 0 unresolved, 0 no adjacency
         0 no route, <span class="hl">5 unicast RPF</span>, 0 forced drop</pre>

<h3>Task 3: loose mode on the ISP-B link</h3>
<p>Try strict mode on Gi0/2 first and watch INET lose reachability to PC-CUST: every packet from 198.51.100.10 arrives on Gi0/2 but the route back uses Gi0/0, so every one is a verification drop. Replace it with loose mode:</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# no ip verify unicast source reachable-via rx
EDGE(config-if)# ip verify unicast source reachable-via any</pre>
<p>Now 198.51.100.10 passes, because a specific route to 198.51.100.0/24 exists (through any interface is fine). A packet arriving with the unroutable source 192.0.2.66 matches only the default route, which loose mode ignores without <code>allow-default</code>, so it is dropped. That is the lab's check: loose mode, no allow-default, INET still reaches the customer, 192.0.2.66 is dropped.</p>

<h3>Other asymmetric traps</h3>
<ul>
<li><b>Unequal-cost paths.</b> Strict mode accepts the arrival interface if it is among the equal-cost best paths. If the paths are unequal (for example EIGRP variance, or one OSPF link with a higher cost), the arrival interface may not be a best path and strict mode drops the traffic.</li>
<li><b>Policy-based routing and traffic engineering.</b> PBR changes forwarding, not the FIB lookup used by uRPF, so a PBR-steered design is often asymmetric from uRPF's point of view.</li>
<li><b>Failover.</b> A design that is symmetric in normal operation can become asymmetric when a link fails and routes move. Strict mode may then drop traffic exactly during the outage you wanted to survive.</li>
<li><b>DHCP clients.</b> Packets with source 0.0.0.0 (DHCP Discover) have no route back. IOS lets packets from 0.0.0.0 to 255.255.255.255 through uRPF so DHCP and BOOTP keep working, but other platforms and relayed designs can behave differently. Test before rolling out on access edges.</li>
</ul>

<div class="eg"><p><b>Worked example: reading a drop.</b> <code>show ip interface Gi0/2</code> shows verification drops rising by about 1000 per minute after a change. Pick a source you can see in a capture or NetFlow, for example 198.51.100.10, and run <code>show ip cef 198.51.100.10</code>. The output says <code>nexthop 100.64.1.1 GigabitEthernet0/0</code>. The packets arrive on Gi0/2, the route points to Gi0/0: strict mode on an asymmetric path. Switch to loose mode or make the routing symmetric.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Judging uRPF by a ping from the router itself; the router's own packets are not checked on the way out. Forgetting that uRPF only acts on the interface it is configured on, so a drop on Gi0/2 is never caused by the command on Gi0/1. Assuming loose mode protects much on a router that carries a full Internet table; with every prefix present, only unallocated or Null0-routed sources fail.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which uRPF mode for a multihomed edge with asymmetric routing?" Loose. "Which for a single-homed customer?" Strict. If the question says the source is covered only by the default route and no <code>allow-default</code> is set, the packet is dropped in both modes.</p></div>

<div class="scn"><h4>The backup link that broke the Internet</h4><p>A company added a second ISP for backup and, following a hardening guide, enabled strict uRPF on both uplinks. For weeks nothing happened. Then the provider on the backup link began advertising the company's prefix more attractively, return traffic started arriving on the backup link, and half of all sessions stalled. <code>show ip traffic</code> showed unicast RPF drops climbing. The routers' default route still pointed to the primary ISP. Switching both uplinks to loose mode restored service immediately.</p><p><b>Lesson:</b> on uplinks you do not control, assume asymmetry and use loose mode.</p></div>

<div class="iv"><p class="q">"After enabling uRPF on an uplink, some sessions fail. How do you prove uRPF is the cause?"</p><p>Strong answer: check <code>show ip interface</code> for rising verification drops and <code>show ip traffic</code> for unicast RPF drops. Then take a failing source and look it up with <code>show ip cef SOURCE</code>; if the next hop interface differs from the arrival interface, strict mode is dropping due to asymmetry. Fix with loose mode or by making routing symmetric; an exception ACL is a temporary workaround.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Asymmetric routing is the main reason strict uRPF drops good traffic.</li>
<li>In the lab: strict on customer Gi0/1, loose on ISP-B Gi0/2, no allow-default.</li>
<li><code>show ip cef SOURCE</code> tells you which interface the check expects.</li>
<li>Unequal-cost paths, PBR and failover can all create asymmetry.</li>
<li>Verification drops on the interface and unicast RPF drops in <code>show ip traffic</code> are the evidence.</li>
</ul></div>
`,hi:`
<p>Ek courier company ke do gate hain. South region ke parcels hamesha gate B par aate hain, kyunki delivery trucks ke liye woh sabse chhota raasta hai. Lekin company ki apni south jaane wali vans gate A se nikalti hain, kyunki loading bay wahan hai. Agar gate B par strict mailroom clerk check kare "kya mera jawab isi gate se niklega?", to har asli southern parcel fail hoga. Parcels mein kuch galat nahi; raaste bas <b>asymmetric</b> hain. uRPF ka legitimate traffic todne ka yahi sabse common tareeka hai.</p>

<h3>Lab topology</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="uRPF lab topology">
<rect x="10" y="105" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="65" y="127" text-anchor="middle" class="svg-ink" font-size="13">PC-CUST</text><text x="65" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.30.0.10</text>
<rect x="190" y="100" width="120" height="60" rx="10" fill="#bae6fd"/><text x="250" y="125" text-anchor="middle" class="svg-ink" font-size="14">EDGE</text><text x="250" y="144" text-anchor="middle" class="svg-muted" font-size="12">default ISP-A se</text>
<rect x="390" y="20" width="120" height="50" rx="8" fill="#fde68a"/><text x="450" y="42" text-anchor="middle" class="svg-ink" font-size="13">ISP-A</text><text x="450" y="59" text-anchor="middle" class="svg-muted" font-size="12">100.64.1.1</text>
<rect x="390" y="190" width="120" height="50" rx="8" fill="#fed7aa"/><text x="450" y="212" text-anchor="middle" class="svg-ink" font-size="13">ISP-B</text><text x="450" y="229" text-anchor="middle" class="svg-muted" font-size="12">100.64.2.1</text>
<rect x="540" y="190" width="95" height="50" rx="8" fill="#e2e8f0"/><text x="587" y="212" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="587" y="229" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<line x1="120" y1="130" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="390" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="145" x2="390" y2="215" stroke="#64748b" stroke-width="2"/><line x1="450" y1="70" x2="450" y2="190" stroke="#64748b" stroke-width="2"/><line x1="510" y1="215" x2="540" y2="215" stroke="#64748b" stroke-width="2"/>
<text x="155" y="120" text-anchor="middle" class="svg-accent" font-size="12">Gi0/1</text><text x="345" y="72" class="svg-muted" font-size="12">Gi0/0</text><text x="345" y="190" class="svg-accent" font-size="12">Gi0/2</text>
<text x="320" y="255" text-anchor="middle" class="svg-muted" font-size="12">INET se customer ka traffic Gi0/2 par aata hai; EDGE wapas Gi0/0 se route karta hai</text>
</svg><p class="cap">Asymmetric path jo Gi0/2 par strict mode ko galat banata hai.</p></div>
<p>EDGE par do static routes hain, dono ISP-A ke through: <code>ip route 0.0.0.0 0.0.0.0 100.64.1.1</code> aur <code>ip route 198.51.100.0 255.255.255.0 100.64.1.1</code>. Lekin ISP-B customer 10.30.0.0/24 ka traffic seedha backup link se EDGE Gi0/2 par bhejta hai. Isliye INET (198.51.100.10) ke packets <b>Gi0/2</b> par aate hain, jabki EDGE ka 198.51.100.10 tak wapas ka best route <b>Gi0/0</b> se nikalta hai.</p>

<h3>Task 1: customer ki taraf strict mode</h3>
<pre class="code">EDGE(config)# interface GigabitEthernet0/1
EDGE(config-if)# ip verify unicast source reachable-via rx</pre>
<p>10.30.0.10 ka asli packet pass hota hai: 10.30.0.0/24 ka wapas ka route Gi0/1 par connected route hai. Source 203.0.113.50 wala jaali packet fail hota hai: iska sirf default route se match hai, jo ignore hota hai, aur <code>allow-default</code> ke saath bhi woh Gi0/0 se bahar point karta, Gi0/1 se nahi.</p>

<h3>Task 2: counters se sabit karo</h3>
<p>Lab PC-CUST se attack <code>traffic 198.51.100.10 udp/53 500 5 src 203.0.113.50</code> (paanch jaali DNS packets) se banata hai. Phir:</p>
<pre class="out">EDGE# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet address is 10.30.0.1/24
  ...
  <span class="hl">IP verify source reachable-via RX</span>
   <span class="hl">5 verification drops</span>
   0 suppressed verification drops
   0 verification drop-rate

EDGE# show ip traffic
IP statistics:
  Rcvd:  1822 total, 96 local destination
  ...
  Drop:  0 encapsulation failed, 0 unresolved, 0 no adjacency
         0 no route, <span class="hl">5 unicast RPF</span>, 0 forced drop</pre>

<h3>Task 3: ISP-B link par loose mode</h3>
<p>Pehle Gi0/2 par strict mode try karo aur dekho INET ki PC-CUST tak reachability chali jaati hai: 198.51.100.10 ka har packet Gi0/2 par aata hai lekin wapas ka route Gi0/0 use karta hai, isliye har ek verification drop hai. Use loose mode se badlo:</p>
<pre class="code">EDGE(config)# interface GigabitEthernet0/2
EDGE(config-if)# no ip verify unicast source reachable-via rx
EDGE(config-if)# ip verify unicast source reachable-via any</pre>
<p>Ab 198.51.100.10 pass hota hai, kyunki 198.51.100.0/24 ka specific route exist karta hai (kisi bhi interface se chalega). Bina route wale source 192.0.2.66 ke saath aane wala packet sirf default route se match karta hai, jise loose mode <code>allow-default</code> ke bina ignore karta hai, isliye drop hota hai. Yahi lab ka check hai: loose mode, allow-default nahi, INET abhi bhi customer tak pahunchta hai, 192.0.2.66 drop hota hai.</p>

<h3>Doosre asymmetric traps</h3>
<ul>
<li><b>Unequal-cost paths.</b> Strict mode arrival interface ko accept karta hai agar woh equal-cost best paths mein se ek ho. Agar paths unequal hain (jaise EIGRP variance, ya ek OSPF link ki cost zyada), to arrival interface best path nahi bhi ho sakta aur strict mode traffic drop karta hai.</li>
<li><b>Policy-based routing aur traffic engineering.</b> PBR forwarding badalta hai, uRPF ka use kiya FIB lookup nahi, isliye PBR se chalaya gaya design uRPF ki nazar se aksar asymmetric hota hai.</li>
<li><b>Failover.</b> Jo design normal operation mein symmetric hai woh link fail hone aur routes hilne par asymmetric ban sakta hai. Tab strict mode theek usi outage ke dauraan traffic drop kar sakta hai jisse aap bachna chahte the.</li>
<li><b>DHCP clients.</b> Source 0.0.0.0 wale packets (DHCP Discover) ka wapas ka koi route nahi hota. IOS 0.0.0.0 se 255.255.255.255 wale packets ko uRPF se guzarne deta hai taaki DHCP aur BOOTP chalte rahein, lekin doosre platforms aur relayed designs alag behave kar sakte hain. Access edges par rollout se pehle test karo.</li>
</ul>

<div class="eg"><p><b>Worked example: drop padhna.</b> Ek change ke baad <code>show ip interface Gi0/2</code> mein verification drops har minute lagbhag 1000 badh rahe hain. Capture ya NetFlow mein dikhne wala koi source chuno, jaise 198.51.100.10, aur <code>show ip cef 198.51.100.10</code> chalao. Output kehta hai <code>nexthop 100.64.1.1 GigabitEthernet0/0</code>. Packets Gi0/2 par aate hain, route Gi0/0 ki taraf hai: asymmetric path par strict mode. Loose mode par jao ya routing symmetric banao.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> uRPF ko router se kiye ping se judge karna; router ke apne packets bahar jaate waqt check nahi hote. Bhool jaana ki uRPF sirf usi interface par kaam karta hai jahan configure hai, isliye Gi0/2 ka drop kabhi Gi0/1 ki command se nahi hota. Yeh maan lena ki full Internet table wale router par loose mode bahut protect karta hai; har prefix maujood ho to sirf unallocated ya Null0-routed sources fail hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Asymmetric routing wale multihomed edge ke liye kaunsa uRPF mode?" Loose. "Single-homed customer ke liye?" Strict. Agar question kahe ki source sirf default route se cover hai aur <code>allow-default</code> set nahi, to packet dono modes mein drop hota hai.</p></div>

<div class="scn"><h4>Backup link jisne Internet tod diya</h4><p>Ek company ne backup ke liye doosra ISP joda aur hardening guide follow karte hue dono uplinks par strict uRPF chalu kiya. Hafton kuch nahi hua. Phir backup link ke provider ne company ka prefix zyada aakarshak tarike se advertise karna shuru kiya, return traffic backup link par aane laga, aur aadhe sessions atak gaye. <code>show ip traffic</code> mein unicast RPF drops badhte dikhe. Routers ka default route abhi bhi primary ISP ki taraf tha. Dono uplinks ko loose mode par karne se service turant wapas aa gayi.</p><p><b>Seekh:</b> jin uplinks ko aap control nahi karte, wahan asymmetry maan kar chalo aur loose mode use karo.</p></div>

<div class="iv"><p class="q">"Uplink par uRPF chalu karne ke baad kuch sessions fail ho rahe hain. Kaise sabit karoge ki cause uRPF hai?"</p><p>Strong answer: <code>show ip interface</code> mein badhte verification drops aur <code>show ip traffic</code> mein unicast RPF drops check karo. Phir ek fail hone wala source lo aur <code>show ip cef SOURCE</code> se dhoondho; agar next hop interface arrival interface se alag hai, to strict mode asymmetry ki wajah se drop kar raha hai. Loose mode se ya routing symmetric banakar fix karo; exception ACL ek temporary jugaad hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Asymmetric routing strict uRPF ke achha traffic drop karne ki mukhya wajah hai.</li>
<li>Lab mein: customer Gi0/1 par strict, ISP-B Gi0/2 par loose, allow-default nahi.</li>
<li><code>show ip cef SOURCE</code> batata hai ki check kis interface ki ummeed karta hai.</li>
<li>Unequal-cost paths, PBR aur failover sab asymmetry bana sakte hain.</li>
<li>Interface par verification drops aur <code>show ip traffic</code> mein unicast RPF drops saboot hain.</li>
</ul></div>
`}};export{e as default};