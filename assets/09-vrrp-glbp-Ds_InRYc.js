var e={id:`vrrp-glbp`,h:{en:`VRRP, GLBP and the FHRP comparison table`,hi:`VRRP, GLBP aur FHRP comparison table`},body:{en:`
<p>Every country drives a car with a steering wheel, pedals and indicators, but the rules differ: which side of the road, who gives way, what the horn means. HSRP, VRRP and GLBP are the same car with different road rules. If you know HSRP well, learning the other two is mostly learning new names and a few different defaults, and those defaults are exactly what the exam asks.</p>

<h3>VRRP: the open standard</h3>
<p><b>VRRP</b> (Virtual Router Redundancy Protocol) is defined by the IETF, version 2 in RFC 3768 (IPv4) and version 3 in RFC 5798 (IPv4 and IPv6). Because it is a standard, it runs between a Cisco router and a firewall or a router from another vendor. The vocabulary changes:</p>
<dl class="terms">
<dt>Master / Backup</dt><dd>The forwarding router is the <b>Master</b>; the others are <b>Backup</b>. There is no separate "Standby" role: all non-masters are Backups, and the highest-priority Backup takes over.</dd>
<dt>VRID</dt><dd>Virtual router ID, 1 to 255, the equivalent of the HSRP group number.</dd>
<dt>Virtual MAC</dt><dd><code>0000.5e00.01XX</code>, XX = VRID in hex. VRID 10 gives <code>0000.5e00.010a</code>.</dd>
<dt>Advertisements</dt><dd>Only the Master sends them, every <b>1 second</b> by default, to <b>224.0.0.18</b> using <b>IP protocol 112</b> (not UDP). Backups stay silent.</dd>
<dt>Priority</dt><dd>1 to 254 configurable, default 100; ties go to the highest IP. <b>255</b> is reserved for the <b>owner</b>, the router whose real interface address <i>is</i> the virtual IP. <b>0</b> is sent by a Master that is giving up, so a Backup takes over at once.</dd>
<dt>Preempt</dt><dd><b>Enabled by default</b>, the opposite of HSRP.</dd>
<dt>Master down interval</dt><dd>3 x advertisement interval + skew time, where skew = (256 - priority) / 256 s. Priority 110 gives 3 + 0.570 = 3.570 s. Higher-priority Backups react slightly sooner.</dd>
</dl>

<h3>VRRP configuration (classic IOS syntax)</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# vrrp 10 ip 192.168.10.1
R1(config-if)# vrrp 10 priority 110
<span class="c">! preempt is already on; tracking works like HSRP</span>
R1(config-if)# vrrp 10 track 1 decrement 20

R2(config-if)# vrrp 10 ip 192.168.10.1</pre>
<p>On newer IOS XE releases VRRP version 3 is enabled with <code>fhrp version vrrp v3</code> and configured per address family (<code>vrrp 10 address-family ipv4</code>, then <code>address 192.168.10.1 primary</code>). The concepts are identical.</p>

<pre class="out">R1# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
<span class="hl">Gi0/0              10  110 3570       Y  Master  192.168.10.2    192.168.10.1</span>

R1# show vrrp
GigabitEthernet0/0 - Group 10
  State is Master
  Virtual IP address is 192.168.10.1
<span class="hl">  Virtual MAC address is 0000.5e00.010a</span>
  Advertisement interval is 1.000 sec
<span class="hl">  Preemption enabled</span>
  Priority is 110
  Master Router is 192.168.10.2 (local), priority is 110
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.570 sec</pre>
<p>Columns to read: <b>Own</b> (Y if this router owns the VIP), <b>Pre</b> (preempt), <b>Time</b> (master down interval in ms), <b>State</b>.</p>

<h3>GLBP: real load balancing in one subnet</h3>
<p><b>GLBP</b> (Gateway Load Balancing Protocol, Cisco) solves what HSRP and VRRP cannot: several routers forwarding for <b>one</b> VIP at the same time.</p>
<ul>
<li>One router is elected <b>AVG</b> (Active Virtual Gateway) by highest priority, then highest IP. It answers every ARP for the VIP.</li>
<li>Up to <b>four</b> routers act as <b>AVF</b>s (Active Virtual Forwarders), each owning its own virtual MAC <code>0007.b400.XXYY</code> (XX = group, YY = forwarder number).</li>
<li>The AVG hands out a different AVF's MAC to different hosts, <b>round-robin</b> by default (also weighted or host-dependent). PC1 gets AVF1's MAC, PC2 gets AVF2's MAC, all with the same gateway IP.</li>
<li>If an AVF fails, another AVF takes over its virtual MAC, so its hosts keep working. A standby AVG takes over if the AVG fails.</li>
<li>Hellos go to 224.0.0.102 on UDP 3222, every 3 s, hold 10 s. Commands start with <code>glbp</code>, for example <code>glbp 10 ip 192.168.10.1</code> and <code>show glbp brief</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GLBP AVG hands out different virtual MACs">
<rect x="40" y="20" width="240" height="60" rx="8" fill="#bae6fd"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="14">R1: AVG + AVF1</text><text x="160" y="63" text-anchor="middle" class="svg-muted" font-size="12">MAC 0007.b400.0a01</text>
<rect x="360" y="20" width="240" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="14">R2: AVF2</text><text x="480" y="63" text-anchor="middle" class="svg-muted" font-size="12">MAC 0007.b400.0a02</text>
<rect x="40" y="150" width="240" height="56" rx="8" fill="#bbf7d0"/><text x="160" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1: gw .1 = ...0a01</text><text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="12">sends via R1</text>
<rect x="360" y="150" width="240" height="56" rx="8" fill="#bbf7d0"/><text x="480" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2: gw .1 = ...0a02</text><text x="480" y="192" text-anchor="middle" class="svg-muted" font-size="12">sends via R2</text>
<line x1="160" y1="80" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="80" x2="440" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">AVG answers ARP, alternating MACs</text>
</svg><p class="cap">GLBP: one VIP, one AVG answering ARP, several AVFs forwarding at the same time.</p></div>

<h3>The comparison table to memorise</h3>
<table class="cmp"><tr><th>Feature</th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (RFC 5798)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / Standby (others Listen)</td><td>Master / Backup</td><td>AVG / AVF</td></tr>
<tr><td>Forwarders per group</td><td>1</td><td>1</td><td>Up to 4</td></tr>
<tr><td>Multicast / transport</td><td>224.0.0.2 (v1) or 224.0.0.102 (v2), UDP 1985</td><td>224.0.0.18, IP protocol 112</td><td>224.0.0.102, UDP 3222</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (v1), 0000.0c9f.fXXX (v2)</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Default timers</td><td>Hello 3 s, hold 10 s</td><td>Advert 1 s, down ~3.6 s</td><td>Hello 3 s, hold 10 s</td></tr>
<tr><td>Default priority</td><td>100</td><td>100 (255 = owner)</td><td>100</td></tr>
<tr><td>Preempt default</td><td>Off</td><td>On</td><td>Off for AVG</td></tr>
<tr><td>VIP may equal a real IP</td><td>No</td><td>Yes (owner)</td><td>No</td></tr>
<tr><td>Load balancing</td><td>Per group (multiple groups)</td><td>Per group (multiple groups)</td><td>Per host within one group</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch has a Cisco router and a third-party firewall that should share the gateway 192.0.2.1. HSRP and GLBP are Cisco-only, so the answer is <b>VRRP</b>. Set the firewall's interface to 192.0.2.1 itself: it becomes the <b>owner</b> with priority 255 and always Master when up; the Cisco router (192.0.2.2, priority 100) is Backup. VRID 1 gives virtual MAC <code>0000.5e00.0101</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Carrying HSRP habits into VRRP: adding <code>preempt</code> "to be sure" is harmless, but expecting a Standby state, UDP 1985 or a 3-second hello leads to wrong answers and wrong firewall rules. VRRP needs IP protocol 112 permitted, not a UDP port.</p></div>

<div class="exam"><p><b>Exam trap.</b> Most-tested pairs: <b>VRRP = open standard, Master/Backup, preempt on, 0000.5e00.01XX</b>; <b>GLBP = load balancing, AVG/AVF</b>; <b>HSRP = Active/Standby, preempt off</b>. "Which FHRP uses 224.0.0.18?" is VRRP. "Which FHRP lets all routers forward for the same VIP?" is GLBP.</p></div>

<div class="scn"><h4>The firewall that never became backup</h4><p>A school network in Jaipur tried to pair a Cisco router with another vendor's firewall as gateways, configuring HSRP on the router and "VRRP" on the firewall. Both claimed the VIP, and users saw intermittent loss. The engineer moved the Cisco side to <code>vrrp 1 ip 198.51.100.1</code> with the same VRID as the firewall, and permitted IP protocol 112 on the firewall's inside interface. <code>show vrrp brief</code> then showed a single Master.</p><p><b>Lesson:</b> mixed-vendor gateways need VRRP on both sides, with matching VRID and advertisements allowed.</p></div>

<div class="iv"><p class="q">"Compare HSRP, VRRP and GLBP."</p><p>Strong answer: HSRP is Cisco, Active/Standby, UDP 1985, preempt off by default, VMAC 0000.0c07.acXX (v1). VRRP is the open standard, Master/Backup, IP protocol 112 to 224.0.0.18, preempt on, VIP can be the owner's real IP with priority 255, VMAC 0000.5e00.01XX. GLBP is Cisco and load-balances one VIP across up to four AVFs using different virtual MACs handed out by the AVG. HSRP and VRRP share load only by using multiple groups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP: open standard, Master/Backup, 224.0.0.18 with IP protocol 112, 1-second adverts.</li>
<li>VRRP preempt is on by default; the owner of the VIP has priority 255.</li>
<li>VRRP VMAC 0000.5e00.01XX; configure with <code>vrrp N ip</code>, verify with <code>show vrrp brief</code>.</li>
<li>GLBP: one AVG answers ARP with different AVF MACs; up to 4 routers forward at once.</li>
<li>Know the comparison table: roles, MACs, multicast, preempt defaults, load balancing.</li>
</ul></div>
`,hi:`
<p>Har desh mein car steering wheel, pedals aur indicators ke saath chalti hai, lekin rules alag hote hain: road ki kaunsi side, kaun raasta deta hai, horn ka kya matlab hai. HSRP, VRRP aur GLBP ek hi car hain, alag road rules ke saath. Agar aap HSRP achhe se jaante ho, to baaki do seekhna zyada tar naye naam aur kuch alag defaults seekhna hai, aur bilkul yahi defaults exam poochta hai.</p>

<h3>VRRP: open standard</h3>
<p><b>VRRP</b> (Virtual Router Redundancy Protocol) IETF ne define kiya hai, version 2 RFC 3768 (IPv4) mein aur version 3 RFC 5798 (IPv4 aur IPv6) mein. Standard hone ki wajah se yeh Cisco router aur firewall ya doosre vendor ke router ke beech chalta hai. Shabd badal jaate hain:</p>
<dl class="terms">
<dt>Master / Backup</dt><dd>Forward karne wala router <b>Master</b> hai; baaki <b>Backup</b> hain. Alag "Standby" role nahi hota: saare non-masters Backup hain, aur sabse zyada priority wala Backup kaam sambhalta hai.</dd>
<dt>VRID</dt><dd>Virtual router ID, 1 se 255, HSRP group number ka barabar.</dd>
<dt>Virtual MAC</dt><dd><code>0000.5e00.01XX</code>, XX = VRID hex mein. VRID 10 se <code>0000.5e00.010a</code> banta hai.</dd>
<dt>Advertisements</dt><dd>Sirf Master bhejta hai, default mein har <b>1 second</b>, <b>224.0.0.18</b> par <b>IP protocol 112</b> use karke (UDP nahi). Backups chup rehte hain.</dd>
<dt>Priority</dt><dd>1 se 254 configurable, default 100; tie sabse bade IP ko jaata hai. <b>255</b> <b>owner</b> ke liye reserved hai, woh router jiska asli interface address <i>hi</i> virtual IP hai. <b>0</b> woh Master bhejta hai jo chhod raha hai, taaki Backup turant kaam sambhale.</dd>
<dt>Preempt</dt><dd><b>Default mein enabled</b>, HSRP ka ulta.</dd>
<dt>Master down interval</dt><dd>3 x advertisement interval + skew time, jahan skew = (256 - priority) / 256 s. Priority 110 se 3 + 0.570 = 3.570 s. Zyada priority wale Backups thoda jaldi react karte hain.</dd>
</dl>

<h3>VRRP configuration (classic IOS syntax)</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# vrrp 10 ip 192.168.10.1
R1(config-if)# vrrp 10 priority 110
<span class="c">! preempt pehle se on hai; tracking HSRP jaisa kaam karta hai</span>
R1(config-if)# vrrp 10 track 1 decrement 20

R2(config-if)# vrrp 10 ip 192.168.10.1</pre>
<p>Naye IOS XE releases par VRRP version 3 <code>fhrp version vrrp v3</code> se enable hota hai aur har address family ke liye configure hota hai (<code>vrrp 10 address-family ipv4</code>, phir <code>address 192.168.10.1 primary</code>). Concepts bilkul same hain.</p>

<pre class="out">R1# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
<span class="hl">Gi0/0              10  110 3570       Y  Master  192.168.10.2    192.168.10.1</span>

R1# show vrrp
GigabitEthernet0/0 - Group 10
  State is Master
  Virtual IP address is 192.168.10.1
<span class="hl">  Virtual MAC address is 0000.5e00.010a</span>
  Advertisement interval is 1.000 sec
<span class="hl">  Preemption enabled</span>
  Priority is 110
  Master Router is 192.168.10.2 (local), priority is 110
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.570 sec</pre>
<p>Padhne wale columns: <b>Own</b> (Y agar yeh router VIP ka owner hai), <b>Pre</b> (preempt), <b>Time</b> (ms mein master down interval), <b>State</b>.</p>

<h3>GLBP: ek subnet mein asli load balancing</h3>
<p><b>GLBP</b> (Gateway Load Balancing Protocol, Cisco) woh solve karta hai jo HSRP aur VRRP nahi kar sakte: kai routers ek saath <b>ek</b> VIP ke liye forward karein.</p>
<ul>
<li>Ek router sabse zyada priority, phir sabse bade IP se <b>AVG</b> (Active Virtual Gateway) elect hota hai. Woh VIP ke har ARP ka jawab deta hai.</li>
<li><b>Chaar</b> tak routers <b>AVF</b> (Active Virtual Forwarders) ki tarah kaam karte hain, har ek ka apna virtual MAC <code>0007.b400.XXYY</code> (XX = group, YY = forwarder number).</li>
<li>AVG alag hosts ko alag AVF ka MAC deta hai, default mein <b>round-robin</b> (weighted ya host-dependent bhi). PC1 ko AVF1 ka MAC milta hai, PC2 ko AVF2 ka, sabka gateway IP same.</li>
<li>Agar koi AVF fail ho, doosra AVF uska virtual MAC le leta hai, isliye uske hosts chalte rehte hain. AVG fail ho to standby AVG kaam sambhalta hai.</li>
<li>Hellos 224.0.0.102 par UDP 3222 par jaate hain, har 3 s, hold 10 s. Commands <code>glbp</code> se shuru hote hain, jaise <code>glbp 10 ip 192.168.10.1</code> aur <code>show glbp brief</code>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="GLBP AVG alag virtual MACs deta hai">
<rect x="40" y="20" width="240" height="60" rx="8" fill="#bae6fd"/><text x="160" y="43" text-anchor="middle" class="svg-ink" font-size="14">R1: AVG + AVF1</text><text x="160" y="63" text-anchor="middle" class="svg-muted" font-size="12">MAC 0007.b400.0a01</text>
<rect x="360" y="20" width="240" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="43" text-anchor="middle" class="svg-ink" font-size="14">R2: AVF2</text><text x="480" y="63" text-anchor="middle" class="svg-muted" font-size="12">MAC 0007.b400.0a02</text>
<rect x="40" y="150" width="240" height="56" rx="8" fill="#bbf7d0"/><text x="160" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC1: gw .1 = ...0a01</text><text x="160" y="192" text-anchor="middle" class="svg-muted" font-size="12">R1 se bhejta hai</text>
<rect x="360" y="150" width="240" height="56" rx="8" fill="#bbf7d0"/><text x="480" y="172" text-anchor="middle" class="svg-ink" font-size="13">PC2: gw .1 = ...0a02</text><text x="480" y="192" text-anchor="middle" class="svg-muted" font-size="12">R2 se bhejta hai</text>
<line x1="160" y1="80" x2="160" y2="150" stroke="#64748b" stroke-width="2"/><line x1="200" y1="80" x2="440" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="330" y="115" text-anchor="middle" class="svg-accent" font-size="12">AVG ARP ka jawab deta hai, MACs baari baari</text>
</svg><p class="cap">GLBP: ek VIP, ARP ka jawab dene wala ek AVG, ek saath forward karne wale kai AVFs.</p></div>

<h3>Yaad karne wali comparison table</h3>
<table class="cmp"><tr><th>Feature</th><th>HSRP</th><th>VRRP</th><th>GLBP</th></tr>
<tr><td>Standard</td><td>Cisco</td><td>Open (RFC 5798)</td><td>Cisco</td></tr>
<tr><td>Roles</td><td>Active / Standby (baaki Listen)</td><td>Master / Backup</td><td>AVG / AVF</td></tr>
<tr><td>Har group mein forwarders</td><td>1</td><td>1</td><td>4 tak</td></tr>
<tr><td>Multicast / transport</td><td>224.0.0.2 (v1) ya 224.0.0.102 (v2), UDP 1985</td><td>224.0.0.18, IP protocol 112</td><td>224.0.0.102, UDP 3222</td></tr>
<tr><td>Virtual MAC</td><td>0000.0c07.acXX (v1), 0000.0c9f.fXXX (v2)</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
<tr><td>Default timers</td><td>Hello 3 s, hold 10 s</td><td>Advert 1 s, down ~3.6 s</td><td>Hello 3 s, hold 10 s</td></tr>
<tr><td>Default priority</td><td>100</td><td>100 (255 = owner)</td><td>100</td></tr>
<tr><td>Preempt default</td><td>Off</td><td>On</td><td>AVG ke liye Off</td></tr>
<tr><td>VIP asli IP ho sakta hai</td><td>Nahi</td><td>Haan (owner)</td><td>Nahi</td></tr>
<tr><td>Load balancing</td><td>Per group (multiple groups)</td><td>Per group (multiple groups)</td><td>Ek group ke andar per host</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ek branch mein ek Cisco router aur ek third-party firewall hai jinhe gateway 192.0.2.1 share karna hai. HSRP aur GLBP sirf Cisco hain, isliye jawab <b>VRRP</b> hai. Firewall ka interface khud 192.0.2.1 set karo: woh priority 255 ke saath <b>owner</b> banta hai aur up hone par hamesha Master; Cisco router (192.0.2.2, priority 100) Backup hai. VRID 1 se virtual MAC <code>0000.5e00.0101</code> banta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> HSRP ki aadatein VRRP mein le jaana: "pakka karne ke liye" <code>preempt</code> jodna harmless hai, lekin Standby state, UDP 1985 ya 3-second hello expect karne se galat jawab aur galat firewall rules bante hain. VRRP ko IP protocol 112 permitted chahiye, UDP port nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sabse zyada test hone wale pairs: <b>VRRP = open standard, Master/Backup, preempt on, 0000.5e00.01XX</b>; <b>GLBP = load balancing, AVG/AVF</b>; <b>HSRP = Active/Standby, preempt off</b>. "Kaunsa FHRP 224.0.0.18 use karta hai?" VRRP hai. "Kaunsa FHRP saare routers ko same VIP ke liye forward karne deta hai?" GLBP hai.</p></div>

<div class="scn"><h4>Firewall jo kabhi backup nahi bana</h4><p>Jaipur ke ek school network ne Cisco router ko doosre vendor ke firewall ke saath gateways ki tarah pair karne ki koshish ki, router par HSRP aur firewall par "VRRP" configure karke. Dono ne VIP claim kiya, aur users ko beech beech mein loss dikha. Engineer ne Cisco side ko firewall ke same VRID ke saath <code>vrrp 1 ip 198.51.100.1</code> par shift kiya, aur firewall ke inside interface par IP protocol 112 permit kiya. Tab <code>show vrrp brief</code> ne ek hi Master dikhaya.</p><p><b>Seekh:</b> mixed-vendor gateways ko dono taraf VRRP chahiye, matching VRID aur allowed advertisements ke saath.</p></div>

<div class="iv"><p class="q">"HSRP, VRRP aur GLBP compare karo."</p><p>Strong answer: HSRP Cisco hai, Active/Standby, UDP 1985, preempt default off, VMAC 0000.0c07.acXX (v1). VRRP open standard hai, Master/Backup, 224.0.0.18 par IP protocol 112, preempt on, VIP owner ka asli IP ho sakta hai priority 255 ke saath, VMAC 0000.5e00.01XX. GLBP Cisco hai aur AVG ke diye alag virtual MACs se ek VIP ko chaar AVFs tak load-balance karta hai. HSRP aur VRRP sirf multiple groups use karke load share karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP: open standard, Master/Backup, IP protocol 112 ke saath 224.0.0.18, 1-second adverts.</li>
<li>VRRP preempt default on hai; VIP ke owner ki priority 255 hai.</li>
<li>VRRP VMAC 0000.5e00.01XX; <code>vrrp N ip</code> se configure, <code>show vrrp brief</code> se verify.</li>
<li>GLBP: ek AVG alag AVF MACs se ARP ka jawab deta hai; 4 tak routers ek saath forward karte hain.</li>
<li>Comparison table jaano: roles, MACs, multicast, preempt defaults, load balancing.</li>
</ul></div>
`}};export{e as default};