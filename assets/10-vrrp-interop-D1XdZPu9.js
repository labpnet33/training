var e={id:`vrrp-interop`,h:{en:`VRRPv2 and VRRPv3: classic and address-family syntax, and multi-vendor interoperability`,hi:`VRRPv2 aur VRRPv3: classic aur address-family syntax, aur multi-vendor interoperability`},body:{en:`
<p>HSRP is like a family tradition: it works perfectly as long as everyone in the house is from the same family. The day a neighbour's child joins the game, the rules are unknown to them. <b>VRRP</b> is the rule book written by a standards body (RFC 3768 for version 2, RFC 5798 for version 3), so any vendor can play. That is why the Chennai warehouse in lab 2, replacing one gateway with another vendor's router, must move from HSRP to VRRP.</p>

<h3>How VRRP differs from HSRP</h3>
<table class="cmp"><tr><th></th><th>VRRPv2</th><th>VRRPv3</th></tr>
<tr><td>Standard</td><td>RFC 3768, IPv4 only</td><td>RFC 5798, IPv4 and IPv6</td></tr>
<tr><td>Roles</td><td>Master, Backup</td><td>Master, Backup</td></tr>
<tr><td>Transport</td><td>IP protocol 112 to 224.0.0.18, TTL 255</td><td>Same for IPv4; FF02::12 for IPv6</td></tr>
<tr><td>Virtual MAC</td><td>0000.5e00.01XX (XX = VRID hex)</td><td>IPv4 0000.5e00.01XX, IPv6 0000.5e00.02XX</td></tr>
<tr><td>Advert interval</td><td>Seconds, default 1 s</td><td>Centiseconds on the wire, default 1 s; IOS XE configures it in milliseconds</td></tr>
<tr><td>Authentication</td><td>Plain text in Cisco IOS (and Cisco-only MD5); removed from the RFC</td><td>None in the RFC</td></tr>
<tr><td>Preempt</td><td colspan="2">On by default (unlike HSRP)</td></tr></table>
<p>Only the <b>Master</b> sends advertisements; Backups stay silent (HSRP Standby also sends hellos). Priority ranges 1 to 254, default 100. Priority <b>255</b> belongs to the <b>address owner</b>, the router whose real interface address is the virtual IP; it always becomes Master and cannot be tracked down. Priority 0 is sent by a Master that is resigning (for example on shutdown), so Backups take over immediately instead of waiting for the timer. A Backup declares the Master dead after the <b>Master Down Interval = 3 x Advertisement Interval + Skew Time</b>, with Skew = (256 - priority) / 256 seconds. Higher-priority Backups therefore react slightly faster, which avoids several Backups taking over at once.</p>

<div class="eg"><p><b>Worked example.</b> R2 in lab 2 has priority 100 and a 1 s advert interval. Skew = (256 - 100)/256 = 0.609 s, so Master Down = 3.609 s. R1 at 120 would have skew 0.531 s and Master Down 3.531 s. The virtual MAC for VRID 5 is 0000.5e00.0105, the lab answer.</p></div>

<h3>Classic VRRP syntax (lab 2)</h3>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ip address 192.168.30.2 255.255.255.0
 vrrp 5 ip 192.168.30.254
 vrrp 5 priority 120
 vrrp 5 authentication text NKvrrp5
<span class="c">! R2: same group, VIP and key, default priority 100</span>
interface GigabitEthernet0/0
 ip address 192.168.30.3 255.255.255.0
 vrrp 5 ip 192.168.30.254
 vrrp 5 authentication text NKvrrp5</pre>
<pre class="out">R1# show vrrp
GigabitEthernet0/0 - Group 5
<span class="hl">  State is Master</span>
  Virtual IP address is 192.168.30.254
<span class="hl">  Virtual MAC address is 0000.5e00.0105</span>
  Advertisement interval is 1.000 sec
  Preemption enabled
  Priority is 120
  Authentication text "NKvrrp5"
  Master Router is 192.168.30.2 (local), priority is 120
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.531 sec

R2# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
<span class="hl">Gi0/0              5   100 3609       Y  Backup  192.168.30.2    192.168.30.254</span></pre>
<p>No <code>preempt</code> command is needed: when R1 comes back after the failover test, it preempts on its own and R2 logs <code>%VRRP-6-STATECHANGE: Gi0/0 Grp 5 state Master -&gt; Backup</code>. Tracking works like HSRP: <code>vrrp 5 track 10 decrement 30</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VRRP between two vendors">
<rect x="60" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="160" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1 (IOS XE) .2</text><text x="160" y="74" text-anchor="middle" class="svg-muted" font-size="12">Master, prio 120</text>
<rect x="380" y="30" width="200" height="60" rx="8" fill="#fed7aa"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2 (vendor B) .3</text><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="12">Backup, prio 100</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="12">adverts 224.0.0.18</text>
<rect x="230" y="140" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">VIP 192.168.30.254</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">0000.5e00.0105</text>
<line x1="160" y1="90" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="370" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">must match: version, VRID, VIP, interval, auth</text>
</svg><p class="cap">Lab 2: two different vendors share one standard virtual router; every parameter on the wire must agree.</p></div>

<h3>IOS XE VRRPv3 address-family syntax</h3>
<p>On IOS XE, <code>fhrp version vrrp v3</code> switches the device to the VRRPv3 command set. After that, the classic <code>vrrp 5 ip</code> commands are no longer accepted and each group is configured per address family:</p>
<pre class="code">fhrp version vrrp v3
interface GigabitEthernet0/0
 vrrp 5 address-family ipv4
  address 192.168.30.254 primary
  priority 120
  preempt delay minimum 30
  timers advertise 1000
  track 10 decrement 30
  vrrpv2
 vrrp 6 address-family ipv6
  address FE80::1 primary
  address 2001:DB8:30::1/64
  priority 120</pre>
<ul>
<li><code>address ... primary</code> sets the virtual IP; for IPv6 the primary address must be a link-local address.</li>
<li><code>timers advertise 1000</code> is in milliseconds on IOS XE (1 s).</li>
<li><code>vrrpv2</code> makes an IPv4 group also send and accept VRRPv2 advertisements, for interoperation with a peer that only runs v2.</li>
<li>Verify with <code>show vrrp brief</code> and <code>show vrrp detail</code>; the brief output now includes the address family.</li>
</ul>

<h3>Interoperability checklist between vendors</h3>
<ol>
<li><b>Same version.</b> A v3-only router and a v2-only router ignore each other and both become Master. Use <code>vrrpv2</code> compatibility or run v2 on both.</li>
<li><b>Same VRID and VIP.</b> The virtual MAC comes from the VRID, so a VRID mismatch means two different virtual routers.</li>
<li><b>Same advertisement interval.</b> VRRPv2 Backups discard adverts with a different interval. IOS offers <code>vrrp 5 timers learn</code> so a Backup adopts the Master's interval.</li>
<li><b>Authentication.</b> Both must support the same method. Many vendors support only plain text for v2, or none; Cisco MD5 for VRRP is proprietary. VRRPv3 has no authentication at all, so secure the segment instead.</li>
<li><b>Accept mode.</b> By default the RFC says a non-owner Master should not accept packets addressed to the VIP. Cisco answers pings to the VIP; other vendors may need an option such as Junos <code>accept-data</code>. Monitoring that pings the VIP may otherwise alarm only when the other vendor is Master.</li>
</ol>
<p>For reference, the other side of lab 2 on a Junos device would be configured along these lines: <code>set interfaces ge-0/0/0 unit 0 family inet address 192.168.30.3/24 vrrp-group 5 virtual-address 192.168.30.254</code>, plus <code>priority 100</code>, <code>accept-data</code>, <code>authentication-type simple</code> and <code>authentication-key NKvrrp5</code> under the same vrrp-group.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling <code>fhrp version vrrp v3</code> on a router that already runs classic VRRP groups in production. The classic configuration is not accepted in v3 mode, so the groups must be rebuilt in the address-family syntax; plan it as a migration.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRRP preempts by default; HSRP does not. VRRP roles are Master/Backup, not Active/Standby. VRRP uses IP protocol 112, not UDP. Priority 255 means the address owner. Only the Master sends adverts.</p></div>

<div class="scn"><h4>Two Masters after a router swap</h4><p>A warehouse replaced its backup Cisco router with another vendor's router configured for VRRP group 5. Afterwards both routers showed Master, and users saw intermittent loss as the switch moved 0000.5e00.0105 between ports. The Cisco router logged <code>%VRRP-4-BADAUTH: Bad authentication from 192.168.30.3, group 5, type 0, expected 1</code>. The new router sent adverts with no authentication; the Cisco router expected text. The team agreed on text authentication on both and the pair converged to one Master.</p><p><b>Lesson:</b> in multi-vendor VRRP, compare version, VRID, interval and authentication method before cut-over; a mismatch always looks like two Masters.</p></div>

<div class="iv"><p class="q">"When would you choose VRRP over HSRP, and what do you check for interoperability?"</p><p>Choose VRRP when gateways come from different vendors or policy requires open standards; mention v3 for IPv6. Explain key differences: Master/Backup, preempt on by default, IP protocol 112 to 224.0.0.18, MAC 0000.5e00.01XX, owner priority 255. Then list the interoperability checks: version (v2 vs v3, vrrpv2 compatibility), VRID and VIP, advert interval, authentication support, and accept mode for pings to the VIP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP is an open standard: v2 (RFC 3768, IPv4) and v3 (RFC 5798, IPv4 and IPv6).</li>
<li>Master/Backup, preempt on by default, only the Master advertises, owner priority 255.</li>
<li>Master Down = 3 x advert + (256 - priority)/256; MAC 0000.5e00.01XX.</li>
<li>IOS XE: fhrp version vrrp v3, then vrrp N address-family ipv4/ipv6, address ... primary, vrrpv2 for compatibility.</li>
<li>Multi-vendor: match version, VRID, VIP, interval and authentication; check accept mode.</li>
</ul></div>
`,hi:`
<p>HSRP ek family tradition jaisa hai: jab tak ghar mein sab same family ke hain, perfect chalta hai. Jis din padosi ka bachcha khel mein aata hai, use rules pata hi nahi. <b>VRRP</b> standards body ki likhi rule book hai (version 2 ke liye RFC 3768, version 3 ke liye RFC 5798), to koi bhi vendor khel sakta hai. Isiliye lab 2 ka Chennai warehouse, jo ek gateway ko doosre vendor ke router se badal raha hai, HSRP se VRRP par jaana chahiye.</p>

<h3>VRRP HSRP se kaise alag hai</h3>
<table class="cmp"><tr><th></th><th>VRRPv2</th><th>VRRPv3</th></tr>
<tr><td>Standard</td><td>RFC 3768, sirf IPv4</td><td>RFC 5798, IPv4 aur IPv6</td></tr>
<tr><td>Roles</td><td>Master, Backup</td><td>Master, Backup</td></tr>
<tr><td>Transport</td><td>IP protocol 112, 224.0.0.18 par, TTL 255</td><td>IPv4 ke liye same; IPv6 ke liye FF02::12</td></tr>
<tr><td>Virtual MAC</td><td>0000.5e00.01XX (XX = VRID hex)</td><td>IPv4 0000.5e00.01XX, IPv6 0000.5e00.02XX</td></tr>
<tr><td>Advert interval</td><td>Seconds, default 1 s</td><td>Wire par centiseconds, default 1 s; IOS XE ise milliseconds mein configure karta hai</td></tr>
<tr><td>Authentication</td><td>Cisco IOS mein plain text (aur sirf Cisco ka MD5); RFC se hata diya gaya</td><td>RFC mein koi nahi</td></tr>
<tr><td>Preempt</td><td colspan="2">Default mein on (HSRP ke ulat)</td></tr></table>
<p>Sirf <b>Master</b> advertisements bhejta hai; Backups chup rehte hain (HSRP Standby bhi hellos bhejta hai). Priority range 1 se 254, default 100. Priority <b>255</b> <b>address owner</b> ki hoti hai, woh router jiska asli interface address hi virtual IP hai; woh hamesha Master banta hai aur track karke neeche nahi laaya ja sakta. Priority 0 woh Master bhejta hai jo resign kar raha ho (jaise shutdown par), taaki Backups timer ka intezaar kiye bina turant kaam le lein. Backup Master ko <b>Master Down Interval = 3 x Advertisement Interval + Skew Time</b> ke baad dead maanta hai, jahan Skew = (256 - priority) / 256 seconds. Isliye zyada priority wale Backups thoda jaldi react karte hain, jisse kai Backups ek saath kaam lene se bachte hain.</p>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein R2 ki priority 100 aur advert interval 1 s hai. Skew = (256 - 100)/256 = 0.609 s, to Master Down = 3.609 s. 120 par R1 ka skew 0.531 s aur Master Down 3.531 s hota. VRID 5 ka virtual MAC 0000.5e00.0105 hai, lab ka answer.</p></div>

<h3>Classic VRRP syntax (lab 2)</h3>
<pre class="code"><span class="c">! R1</span>
interface GigabitEthernet0/0
 ip address 192.168.30.2 255.255.255.0
 vrrp 5 ip 192.168.30.254
 vrrp 5 priority 120
 vrrp 5 authentication text NKvrrp5
<span class="c">! R2: same group, VIP aur key, default priority 100</span>
interface GigabitEthernet0/0
 ip address 192.168.30.3 255.255.255.0
 vrrp 5 ip 192.168.30.254
 vrrp 5 authentication text NKvrrp5</pre>
<pre class="out">R1# show vrrp
GigabitEthernet0/0 - Group 5
<span class="hl">  State is Master</span>
  Virtual IP address is 192.168.30.254
<span class="hl">  Virtual MAC address is 0000.5e00.0105</span>
  Advertisement interval is 1.000 sec
  Preemption enabled
  Priority is 120
  Authentication text "NKvrrp5"
  Master Router is 192.168.30.2 (local), priority is 120
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.531 sec

R2# show vrrp brief
Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
<span class="hl">Gi0/0              5   100 3609       Y  Backup  192.168.30.2    192.168.30.254</span></pre>
<p>Koi <code>preempt</code> command nahi chahiye: failover test ke baad R1 wapas aata hai to khud preempt karta hai aur R2 <code>%VRRP-6-STATECHANGE: Gi0/0 Grp 5 state Master -&gt; Backup</code> log karta hai. Tracking HSRP jaisa kaam karta hai: <code>vrrp 5 track 10 decrement 30</code>.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Do vendors ke beech VRRP">
<rect x="60" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="160" y="54" text-anchor="middle" class="svg-ink" font-size="13">R1 (IOS XE) .2</text><text x="160" y="74" text-anchor="middle" class="svg-muted" font-size="12">Master, prio 120</text>
<rect x="380" y="30" width="200" height="60" rx="8" fill="#fed7aa"/><text x="480" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2 (vendor B) .3</text><text x="480" y="74" text-anchor="middle" class="svg-muted" font-size="12">Backup, prio 100</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="320" y="50" text-anchor="middle" class="svg-accent" font-size="12">adverts 224.0.0.18</text>
<rect x="230" y="140" width="180" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">VIP 192.168.30.254</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="12">0000.5e00.0105</text>
<line x1="160" y1="90" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="370" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">match hona chahiye: version, VRID, VIP, interval, auth</text>
</svg><p class="cap">Lab 2: do alag vendors ek standard virtual router share karte hain; wire par har parameter mel khana chahiye.</p></div>

<h3>IOS XE VRRPv3 address-family syntax</h3>
<p>IOS XE par <code>fhrp version vrrp v3</code> device ko VRRPv3 command set par switch karta hai. Uske baad classic <code>vrrp 5 ip</code> commands accept nahi hoti aur har group address family ke hisaab se configure hota hai:</p>
<pre class="code">fhrp version vrrp v3
interface GigabitEthernet0/0
 vrrp 5 address-family ipv4
  address 192.168.30.254 primary
  priority 120
  preempt delay minimum 30
  timers advertise 1000
  track 10 decrement 30
  vrrpv2
 vrrp 6 address-family ipv6
  address FE80::1 primary
  address 2001:DB8:30::1/64
  priority 120</pre>
<ul>
<li><code>address ... primary</code> virtual IP set karta hai; IPv6 ke liye primary address link-local hona chahiye.</li>
<li>IOS XE par <code>timers advertise 1000</code> milliseconds mein hai (1 s).</li>
<li><code>vrrpv2</code> IPv4 group ko VRRPv2 advertisements bhi bhejne aur accept karne deta hai, us peer ke saath interoperate karne ke liye jo sirf v2 chalata hai.</li>
<li><code>show vrrp brief</code> aur <code>show vrrp detail</code> se verify karo; brief output mein ab address family bhi aati hai.</li>
</ul>

<h3>Vendors ke beech interoperability checklist</h3>
<ol>
<li><b>Same version.</b> v3-only router aur v2-only router ek doosre ko ignore karte hain aur dono Master bante hain. <code>vrrpv2</code> compatibility use karo ya dono par v2 chalao.</li>
<li><b>Same VRID aur VIP.</b> Virtual MAC VRID se banta hai, to VRID mismatch matlab do alag virtual routers.</li>
<li><b>Same advertisement interval.</b> VRRPv2 Backups alag interval wale adverts discard karte hain. IOS <code>vrrp 5 timers learn</code> deta hai taaki Backup Master ka interval apna le.</li>
<li><b>Authentication.</b> Dono ko same method support karna chahiye. Kai vendors v2 ke liye sirf plain text support karte hain, ya kuch nahi; VRRP ke liye Cisco MD5 proprietary hai. VRRPv3 mein authentication hai hi nahi, to iski jagah segment secure karo.</li>
<li><b>Accept mode.</b> Default mein RFC kehta hai ki non-owner Master VIP ko address kiye packets accept na kare. Cisco VIP ke pings ka jawab deta hai; doosre vendors ko Junos <code>accept-data</code> jaisa option chahiye ho sakta hai. Warna VIP ko ping karne wali monitoring sirf tab alarm degi jab doosra vendor Master ho.</li>
</ol>
<p>Reference ke liye, Junos device par lab 2 ki doosri side kuch aise configure hogi: <code>set interfaces ge-0/0/0 unit 0 family inet address 192.168.30.3/24 vrrp-group 5 virtual-address 192.168.30.254</code>, plus same vrrp-group ke under <code>priority 100</code>, <code>accept-data</code>, <code>authentication-type simple</code> aur <code>authentication-key NKvrrp5</code>.</p>

<div class="warn"><p><b>Common galti.</b> Jo router production mein pehle se classic VRRP groups chala raha hai us par <code>fhrp version vrrp v3</code> enable karna. v3 mode mein classic configuration accept nahi hoti, to groups ko address-family syntax mein dobara banana padta hai; ise migration ki tarah plan karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> VRRP default mein preempt karta hai; HSRP nahi. VRRP roles Master/Backup hain, Active/Standby nahi. VRRP IP protocol 112 use karta hai, UDP nahi. Priority 255 matlab address owner. Sirf Master adverts bhejta hai.</p></div>

<div class="scn"><h4>Router swap ke baad do Masters</h4><p>Ek warehouse ne apna backup Cisco router doosre vendor ke router se badla jo VRRP group 5 ke liye configured tha. Uske baad dono routers Master dikha rahe the, aur users ko beech beech mein loss dikhta tha jab switch 0000.5e00.0105 ko ports ke beech move karta tha. Cisco router ne log kiya <code>%VRRP-4-BADAUTH: Bad authentication from 192.168.30.3, group 5, type 0, expected 1</code>. Naya router bina authentication ke adverts bhej raha tha; Cisco router text expect kar raha tha. Team ne dono par text authentication par sehmati banayi aur pair ek Master par converge ho gaya.</p><p><b>Seekh:</b> multi-vendor VRRP mein cut-over se pehle version, VRID, interval aur authentication method compare karo; mismatch hamesha do Masters jaisa dikhta hai.</p></div>

<div class="iv"><p class="q">"HSRP ki jagah VRRP kab chunoge, aur interoperability ke liye kya check karoge?"</p><p>VRRP tab chuno jab gateways alag vendors ke hon ya policy open standards maangti ho; IPv6 ke liye v3 batao. Key differences samjhao: Master/Backup, default mein preempt on, 224.0.0.18 par IP protocol 112, MAC 0000.5e00.01XX, owner priority 255. Phir interoperability checks list karo: version (v2 vs v3, vrrpv2 compatibility), VRID aur VIP, advert interval, authentication support, aur VIP ke pings ke liye accept mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRRP open standard hai: v2 (RFC 3768, IPv4) aur v3 (RFC 5798, IPv4 aur IPv6).</li>
<li>Master/Backup, default mein preempt on, sirf Master advertise karta hai, owner priority 255.</li>
<li>Master Down = 3 x advert + (256 - priority)/256; MAC 0000.5e00.01XX.</li>
<li>IOS XE: fhrp version vrrp v3, phir vrrp N address-family ipv4/ipv6, address ... primary, compatibility ke liye vrrpv2.</li>
<li>Multi-vendor: version, VRID, VIP, interval aur authentication match karo; accept mode check karo.</li>
</ul></div>
`}};export{e as default};