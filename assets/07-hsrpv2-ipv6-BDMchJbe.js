var e={id:`hsrpv2-ipv6`,h:{en:`HSRP version 2 in depth: v1 vs v2, MAC formats, authentication and IPv6`,hi:`HSRP version 2 gehraai mein: v1 vs v2, MAC formats, authentication aur IPv6`},body:{en:`
<p>A hospital's emergency number never changes, even though the doctor answering it changes every shift. The phone system routes the same number to whoever is on duty, and the caller never needs to know who that is. HSRP does this for the default gateway: hosts keep one gateway IP and MAC, and the routers decide among themselves who answers. In CCNA you built a basic group. At CCNP level the details decide whether failover works: which version, which MAC, which multicast address, which key, and how IPv6 hosts find the gateway.</p>

<h3>Version 1 and version 2 side by side</h3>
<table class="cmp"><tr><th></th><th>HSRPv1</th><th>HSRPv2</th></tr>
<tr><td>Group numbers</td><td>0 to 255</td><td>0 to 4095 (can match the VLAN ID)</td></tr>
<tr><td>Hello destination</td><td>224.0.0.2 (all routers), UDP 1985</td><td>224.0.0.102, UDP 1985</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (XX = group in hex)</td><td>0000.0c9f.fXXX (XXX = group in hex)</td></tr>
<tr><td>IPv6</td><td>No</td><td>Yes: FF02::66, UDP 2029, MAC 0005.73a0.0XXX</td></tr>
<tr><td>Packet format</td><td>Fixed</td><td>TLV, includes the sender's 6-byte identifier (MAC) for troubleshooting</td></tr>
<tr><td>Millisecond timers</td><td>Yes</td><td>Yes, with finer advertisement</td></tr></table>
<p>The versions do not interoperate. Both routers on a segment must run the same version; if one runs v1 and the other v2, each sees no peer and both become Active. Changing the version on a live group restarts the group, so plan it in a window. Because v2 uses a different multicast group, it also avoids the classic confusion with 224.0.0.2, which every router listens to.</p>

<div class="eg"><p><b>Worked example.</b> Group 1: v1 MAC 0000.0c07.ac01, v2 MAC 0000.0c9f.f001 (the lab answer). Group 10: v1 0000.0c07.ac0a, v2 0000.0c9f.f00a. Group 300 cannot exist in v1; in v2 it is 300 = 0x12C, so 0000.0c9f.f12c. For IPv6 group 6 the MAC is 0005.73a0.0006.</p></div>

<h3>States, timers and the election, briefly</h3>
<p>The states are Initial, Learn, Listen, Speak, Standby, Active. Only Active and Standby send periodic hellos; the others listen. Default hello 3 s, hold 10 s. The Active router is the highest priority (default 100, range 0 to 255); on a tie, the highest interface IP wins. Timers can go down to milliseconds: <code>standby 1 timers msec 250 msec 750</code>. Faster hellos cost CPU on every router in the group, so many designs keep default HSRP timers and use BFD or tracking for fast failure detection.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="HSRP version 2 group in lab 1">
<rect x="90" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="175" y="53" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0 .2</text><text x="175" y="72" text-anchor="middle" class="svg-muted" font-size="12">Active, prio 110</text>
<rect x="380" y="30" width="170" height="54" rx="8" fill="#e2e8f0"/><text x="465" y="53" text-anchor="middle" class="svg-ink" font-size="13">R2 Gi0/0 .3</text><text x="465" y="72" text-anchor="middle" class="svg-muted" font-size="12">Standby, prio 100</text>
<rect x="250" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">VIP 192.168.20.1</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">0000.0c9f.f001</text>
<rect x="260" y="190" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<line x1="260" y1="57" x2="380" y2="57" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="12">hellos 224.0.0.102</text>
<line x1="175" y1="84" x2="280" y2="120" stroke="#64748b" stroke-width="2"/><line x1="465" y1="84" x2="360" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="320" y1="164" x2="320" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: HSRPv2 group 1 on 192.168.20.0/24; R1 owns the virtual IP and MAC while it is Active.</p></div>

<h3>Lab 1 configuration, step 1</h3>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ip address 192.168.20.2 255.255.255.0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt
 standby 1 authentication md5 key-string NK-HSRP
<span class="c">! R2: same, without the priority line (stays at 100)</span>
interface GigabitEthernet0/0
 ip address 192.168.20.3 255.255.255.0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 preempt
 standby 1 authentication md5 key-string NK-HSRP</pre>
<pre class="out">R1# show standby
GigabitEthernet0/0 - Group 1 (version 2)
<span class="hl">  State is Active</span>
    2 state changes, last state change 00:05:12
  Virtual IP address is 192.168.20.1
<span class="hl">  Active virtual MAC address is 0000.0c9f.f001 (MAC In Use)</span>
    Local virtual MAC address is 0000.0c9f.f001 (v2 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.216 secs
  Authentication MD5, key-string
  Preemption enabled
  Active router is local
  Standby router is 192.168.20.3, priority 100 (expires in 9.328 sec)
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-1" (default)</pre>

<h3>Authentication</h3>
<p>HSRP offers plain text (<code>standby 1 authentication text</code>, sent in clear, only protects against accidents) and MD5 with a key-string or a key chain (<code>standby 1 authentication md5 key-chain NK-CHAIN</code>, which allows key rotation). A router that receives hellos with the wrong key ignores them and logs <code>%HSRP-4-BADAUTH</code>. Since it hears no valid Active router, it becomes Active itself: two Active routers, the same VIP and MAC on two ports, and the switch's MAC table flapping between them.</p>

<h3>HSRP for IPv6</h3>
<p>IPv6 hosts learn their gateway from Router Advertisements, not DHCP. HSRP for IPv6 (v2 only) makes the Active router send RAs from a <b>virtual link-local address</b>, so hosts point at an address that moves with the role.</p>
<pre class="code">interface GigabitEthernet0/0
 ipv6 address 2001:db8:20::2/64
 standby version 2
 standby 6 ipv6 autoconfig
 standby 6 ipv6 2001:db8:20::1/64
 standby 6 priority 110
 standby 6 preempt</pre>
<p><code>autoconfig</code> derives the virtual link-local from the virtual MAC 0005.73a0.0006. The optional global VIP lets hosts or static entries use a global gateway address too. Only the Active router advertises the virtual link-local in its RAs; the real link-local addresses of both routers should be excluded from being used as gateways (the Standby's RAs are suppressed for the group).</p>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>standby version 2</code> on only one router during a migration. Both routers go Active, users see intermittent drops as the switch flips the MAC between ports. Change both routers in the same window, or change the backup first while the primary stays Active and accept a short blip.</p></div>

<div class="exam"><p><b>Exam trap.</b> Recognise MACs instantly: <b>0000.0c07.acXX</b> = HSRPv1, <b>0000.0c9f.fXXX</b> = HSRPv2, <b>0005.73a0.0XXX</b> = HSRP IPv6, <b>0000.5e00.01XX</b> = VRRP IPv4, <b>0007.b400.XXYY</b> = GLBP. Multicast: v1 224.0.0.2, v2 224.0.0.102 (GLBP also uses 224.0.0.102, but on UDP 3222).</p></div>

<div class="scn"><h4>Group 300 that would not configure</h4><p>An engineer standardised "HSRP group = VLAN ID" across a campus. On the switches for VLAN 300, <code>standby 300 ip 10.30.0.1</code> was rejected with a range error. The distribution switches were running the default HSRPv1, which only allows groups 0 to 255. Enabling <code>standby version 2</code> on both distribution switches for every SVI, in one window, allowed groups up to 4095 and matched the standard.</p><p><b>Lesson:</b> the group range is a version property; v2 is required for group numbers above 255 and for IPv6.</p></div>

<div class="iv"><p class="q">"What are the differences between HSRP version 1 and version 2?"</p><p>List them crisply: group range 0-255 vs 0-4095, multicast 224.0.0.2 vs 224.0.0.102, virtual MAC 0000.0c07.acXX vs 0000.0c9f.fXXX, IPv6 support only in v2 (FF02::66, MAC 0005.73a0.0XXX), TLV format with a sender identifier, and no interoperability, so both routers must match. A strong candidate adds that changing the version restarts the group.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v2: groups 0-4095, 224.0.0.102, MAC 0000.0c9f.fXXX, IPv6 support; v1 and v2 do not interoperate.</li>
<li>Priority default 100, highest wins, tie goes to the highest interface IP; hello 3 s, hold 10 s.</li>
<li>MD5 authentication with key-string or key chain; a wrong key produces two Active routers.</li>
<li>HSRP for IPv6: standby N ipv6 autoconfig creates a virtual link-local advertised in RAs.</li>
<li>Know every FHRP MAC format by sight.</li>
</ul></div>
`,hi:`
<p>Hospital ka emergency number kabhi nahi badalta, jabki use uthaane wala doctor har shift badalta hai. Phone system same number ko duty par jo bhi hai uski taraf route karta hai, aur caller ko kabhi jaanne ki zaroorat nahi ki woh kaun hai. HSRP default gateway ke liye yahi karta hai: hosts ek gateway IP aur MAC rakhte hain, aur routers aapas mein tay karte hain ki jawab kaun dega. CCNA mein aapne basic group banaya tha. CCNP level par details tay karti hain ki failover chalega ya nahi: kaunsa version, kaunsa MAC, kaunsa multicast address, kaunsi key, aur IPv6 hosts gateway kaise dhoondhte hain.</p>

<h3>Version 1 aur version 2 saath saath</h3>
<table class="cmp"><tr><th></th><th>HSRPv1</th><th>HSRPv2</th></tr>
<tr><td>Group numbers</td><td>0 se 255</td><td>0 se 4095 (VLAN ID se match kar sakte hain)</td></tr>
<tr><td>Hello destination</td><td>224.0.0.2 (all routers), UDP 1985</td><td>224.0.0.102, UDP 1985</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (XX = group hex mein)</td><td>0000.0c9f.fXXX (XXX = group hex mein)</td></tr>
<tr><td>IPv6</td><td>Nahi</td><td>Haan: FF02::66, UDP 2029, MAC 0005.73a0.0XXX</td></tr>
<tr><td>Packet format</td><td>Fixed</td><td>TLV, troubleshooting ke liye sender ka 6-byte identifier (MAC) shamil</td></tr>
<tr><td>Millisecond timers</td><td>Haan</td><td>Haan, finer advertisement ke saath</td></tr></table>
<p>Versions interoperate nahi karte. Segment par dono routers ko same version chalana hoga; agar ek v1 aur doosra v2 chalaaye, to har ek ko koi peer nahi dikhta aur dono Active ban jaate hain. Live group par version badalne se group restart hota hai, to ise window mein plan karo. Kyunki v2 alag multicast group use karta hai, woh 224.0.0.2 ke saath classic confusion se bhi bachata hai, jise har router sunta hai.</p>

<div class="eg"><p><b>Worked example.</b> Group 1: v1 MAC 0000.0c07.ac01, v2 MAC 0000.0c9f.f001 (lab ka answer). Group 10: v1 0000.0c07.ac0a, v2 0000.0c9f.f00a. Group 300 v1 mein exist nahi kar sakta; v2 mein 300 = 0x12C, to 0000.0c9f.f12c. IPv6 group 6 ke liye MAC 0005.73a0.0006 hai.</p></div>

<h3>States, timers aur election, sankshep mein</h3>
<p>States hain Initial, Learn, Listen, Speak, Standby, Active. Sirf Active aur Standby periodic hellos bhejte hain; baaki sunte hain. Default hello 3 s, hold 10 s. Active router sabse zyada priority wala hota hai (default 100, range 0 se 255); tie par sabse zyada interface IP jeetta hai. Timers milliseconds tak ja sakte hain: <code>standby 1 timers msec 250 msec 750</code>. Tez hellos group ke har router par CPU khaate hain, isliye kai designs default HSRP timers rakhte hain aur fast failure detection ke liye BFD ya tracking use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Lab 1 mein HSRP version 2 group">
<rect x="90" y="30" width="170" height="54" rx="8" fill="#bae6fd"/><text x="175" y="53" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0 .2</text><text x="175" y="72" text-anchor="middle" class="svg-muted" font-size="12">Active, prio 110</text>
<rect x="380" y="30" width="170" height="54" rx="8" fill="#e2e8f0"/><text x="465" y="53" text-anchor="middle" class="svg-ink" font-size="13">R2 Gi0/0 .3</text><text x="465" y="72" text-anchor="middle" class="svg-muted" font-size="12">Standby, prio 100</text>
<rect x="250" y="120" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">VIP 192.168.20.1</text><text x="320" y="156" text-anchor="middle" class="svg-muted" font-size="12">0000.0c9f.f001</text>
<rect x="260" y="190" width="120" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<line x1="260" y1="57" x2="380" y2="57" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="12">hellos 224.0.0.102</text>
<line x1="175" y1="84" x2="280" y2="120" stroke="#64748b" stroke-width="2"/><line x1="465" y1="84" x2="360" y2="120" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="320" y1="164" x2="320" y2="190" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: 192.168.20.0/24 par HSRPv2 group 1; jab tak R1 Active hai, virtual IP aur MAC uske paas hain.</p></div>

<h3>Lab 1 configuration, step 1</h3>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ip address 192.168.20.2 255.255.255.0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt
 standby 1 authentication md5 key-string NK-HSRP
<span class="c">! R2: same, priority line ke bina (100 par rehta hai)</span>
interface GigabitEthernet0/0
 ip address 192.168.20.3 255.255.255.0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 preempt
 standby 1 authentication md5 key-string NK-HSRP</pre>
<pre class="out">R1# show standby
GigabitEthernet0/0 - Group 1 (version 2)
<span class="hl">  State is Active</span>
    2 state changes, last state change 00:05:12
  Virtual IP address is 192.168.20.1
<span class="hl">  Active virtual MAC address is 0000.0c9f.f001 (MAC In Use)</span>
    Local virtual MAC address is 0000.0c9f.f001 (v2 default)
  Hello time 3 sec, hold time 10 sec
    Next hello sent in 1.216 secs
  Authentication MD5, key-string
  Preemption enabled
  Active router is local
  Standby router is 192.168.20.3, priority 100 (expires in 9.328 sec)
  Priority 110 (configured 110)
  Group name is "hsrp-Gi0/0-1" (default)</pre>

<h3>Authentication</h3>
<p>HSRP plain text (<code>standby 1 authentication text</code>, clear mein jaata hai, sirf galtiyon se bachata hai) aur key-string ya key chain ke saath MD5 (<code>standby 1 authentication md5 key-chain NK-CHAIN</code>, jo key rotation allow karta hai) deta hai. Jo router galat key wale hellos receive karta hai woh unhe ignore karta hai aur <code>%HSRP-4-BADAUTH</code> log karta hai. Kyunki use koi valid Active router sunaai nahi deta, woh khud Active ban jaata hai: do Active routers, do ports par same VIP aur MAC, aur switch ki MAC table dono ke beech flap karti hai.</p>

<h3>IPv6 ke liye HSRP</h3>
<p>IPv6 hosts apna gateway Router Advertisements se seekhte hain, DHCP se nahi. IPv6 ke liye HSRP (sirf v2) Active router se ek <b>virtual link-local address</b> se RAs bhejwata hai, to hosts us address ko point karte hain jo role ke saath move hota hai.</p>
<pre class="code">interface GigabitEthernet0/0
 ipv6 address 2001:db8:20::2/64
 standby version 2
 standby 6 ipv6 autoconfig
 standby 6 ipv6 2001:db8:20::1/64
 standby 6 priority 110
 standby 6 preempt</pre>
<p><code>autoconfig</code> virtual MAC 0005.73a0.0006 se virtual link-local banata hai. Optional global VIP hosts ya static entries ko global gateway address bhi use karne deta hai. Sirf Active router apne RAs mein virtual link-local advertise karta hai; dono routers ke asli link-local addresses gateway ki tarah use nahi hone chahiye (group ke liye Standby ke RAs suppress hote hain).</p>

<div class="warn"><p><b>Common galti.</b> Migration ke dauraan sirf ek router par <code>standby version 2</code> configure karna. Dono routers Active ho jaate hain, users ko beech beech mein drops dikhte hain jab switch MAC ko ports ke beech palat-ta hai. Dono routers same window mein badlo, ya pehle backup badlo jab primary Active rahe aur ek chhota blip accept karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> MACs turant pehchano: <b>0000.0c07.acXX</b> = HSRPv1, <b>0000.0c9f.fXXX</b> = HSRPv2, <b>0005.73a0.0XXX</b> = HSRP IPv6, <b>0000.5e00.01XX</b> = VRRP IPv4, <b>0007.b400.XXYY</b> = GLBP. Multicast: v1 224.0.0.2, v2 224.0.0.102 (GLBP bhi 224.0.0.102 use karta hai, lekin UDP 3222 par).</p></div>

<div class="scn"><h4>Group 300 jo configure hi nahi hua</h4><p>Ek engineer ne poore campus mein "HSRP group = VLAN ID" standard banaya. VLAN 300 ke switches par <code>standby 300 ip 10.30.0.1</code> range error ke saath reject hua. Distribution switches default HSRPv1 chala rahe the, jo sirf groups 0 se 255 allow karta hai. Dono distribution switches par har SVI ke liye, ek window mein, <code>standby version 2</code> enable karne se 4095 tak groups allow hue aur standard match ho gaya.</p><p><b>Seekh:</b> group range version ki property hai; 255 se upar ke group numbers aur IPv6 ke liye v2 zaroori hai.</p></div>

<div class="iv"><p class="q">"HSRP version 1 aur version 2 mein kya differences hain?"</p><p>Unhe saaf list karo: group range 0-255 vs 0-4095, multicast 224.0.0.2 vs 224.0.0.102, virtual MAC 0000.0c07.acXX vs 0000.0c9f.fXXX, IPv6 support sirf v2 mein (FF02::66, MAC 0005.73a0.0XXX), sender identifier ke saath TLV format, aur koi interoperability nahi, to dono routers match hone chahiye. Strong candidate jodta hai ki version badalne se group restart hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>v2: groups 0-4095, 224.0.0.102, MAC 0000.0c9f.fXXX, IPv6 support; v1 aur v2 interoperate nahi karte.</li>
<li>Priority default 100, zyada jeetti hai, tie par sabse zyada interface IP; hello 3 s, hold 10 s.</li>
<li>Key-string ya key chain ke saath MD5 authentication; galat key do Active routers banati hai.</li>
<li>IPv6 ke liye HSRP: standby N ipv6 autoconfig RAs mein advertise hone wala virtual link-local banata hai.</li>
<li>Har FHRP MAC format dekhte hi pehchano.</li>
</ul></div>
`}};export{e as default};