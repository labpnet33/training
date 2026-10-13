var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long train journey you check three things: ticket, ID, charger. This chapter is that final check for ENCOR objective 3.3. If you can tick every box below without looking back, you are ready for the exam questions and for the interview that follows.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain stratum, the four NTP timestamps and why path asymmetry causes error.</li>
<li>Choose between <code>ntp server</code>, <code>ntp peer</code> and <code>ntp master</code>, and predict each device's stratum in a hierarchy.</li>
<li>Configure NTP authentication with all four client pieces and explain why the server needs only the key.</li>
<li>Write NTP access groups and avoid locking out your own upstream.</li>
<li>Read <code>show ntp associations [detail]</code> and <code>show ntp status</code>: *, ~, reach 377, sane/valid, stratum.</li>
<li>Explain PTP roles (grandmaster, boundary, transparent, ordinary), BMCA order, the Sync/Delay exchange, and interpret <code>show ptp clock</code>.</li>
<li>Predict what ACLs and crypto see with the NAT order of operations; build static, dynamic, PAT and route-map NAT.</li>
<li>Solve overlapping networks with inside and outside static NAT; explain NVI.</li>
<li>Troubleshoot NAT with translations, statistics, debug and clear.</li>
<li>Build HSRPv2 for IPv4 and IPv6 with MD5, preempt delay and IP SLA tracking; calculate decrements.</li>
<li>Load share with multiple groups aligned to STP, and explain GLBP AVG/AVF and weighting.</li>
<li>Configure VRRP in classic and v3 address-family syntax and make it interoperate with another vendor.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FHRP comparison at a glance">
<rect x="20" y="20" width="190" height="160" rx="10" fill="#bae6fd"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">HSRPv2</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">Cisco, Active/Standby</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.102 UDP 1985</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">0000.0c9f.fXXX</text><text x="115" y="136" text-anchor="middle" class="svg-muted" font-size="12">preempt off</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">hello 3 / hold 10</text>
<rect x="225" y="20" width="190" height="160" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">VRRP</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">RFC, Master/Backup</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.18 proto 112</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">0000.5e00.01XX</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">preempt on</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">advert 1 s</text>
<rect x="430" y="20" width="190" height="160" rx="10" fill="#fde68a"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">GLBP</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">Cisco, AVG + 4 AVF</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.102 UDP 3222</text><text x="525" y="114" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.XXYY</text><text x="525" y="136" text-anchor="middle" class="svg-muted" font-size="12">AVG preempt off</text><text x="525" y="158" text-anchor="middle" class="svg-muted" font-size="12">hello 3 / hold 10</text>
</svg><p class="cap">The three FHRPs on one card: standard, roles, transport, MAC, preempt default and timers.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stratum</dt><dd>Distance from the reference clock; 16 = unsynchronised.</dd>
<dt>Trusted key</dt><dd>NTP key ID a client accepts for synchronisation.</dd>
<dt>Grandmaster</dt><dd>Best PTP clock, elected by BMCA.</dd>
<dt>Boundary / transparent clock</dt><dd>PTP device that terminates and regenerates time / that adds its residence time to the correctionField.</dd>
<dt>Inside local / inside global</dt><dd>Private address of an inside host / its public representation.</dd>
<dt>Route-map NAT</dt><dd>NAT rule matching source and exit interface or destination; creates fully extended entries.</dd>
<dt>NVI</dt><dd>NAT Virtual Interface; ip nat enable, no inside/outside roles.</dd>
<dt>Coup</dt><dd>HSRP message a higher-priority router with preempt sends to take the Active role.</dd>
<dt>Address owner</dt><dd>VRRP router whose real IP is the VIP; priority 255.</dd>
<dt>AVG / AVF</dt><dd>GLBP gateway answering ARP / router forwarding for one virtual MAC.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NTP</td><td>UDP 123; ntp master default stratum 8; client = server stratum + 1; server needs only the key</td></tr>
<tr><td>NTP access</td><td>peer, serve, serve-only, query-only; unmatched = denied once any group exists</td></tr>
<tr><td>PTP</td><td>IEEE 1588; UDP 319/320 or EtherType 0x88F7; BMCA: priority1, class, accuracy, variance, priority2, identity</td></tr>
<tr><td>NAT order</td><td>In to out: route then NAT; out to in: NAT then route</td></tr>
<tr><td>HSRP</td><td>v1 0000.0c07.acXX, 224.0.0.2; v2 0000.0c9f.fXXX, 224.0.0.102, groups 0-4095; IPv6 0005.73a0.0XXX, FF02::66</td></tr>
<tr><td>Tracking</td><td>Default decrement 10; must drop strictly below peer; peer needs preempt</td></tr>
<tr><td>VRRP</td><td>Master Down = 3 x advert + (256 - prio)/256; owner 255; v3 has no authentication</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! NTP client with authentication</span>
ntp authentication-key 1 md5 NK-Time
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1
ntp source Loopback0
<span class="c">! PAT</span>
ip nat inside source list 10 interface GigabitEthernet0/1 overload
<span class="c">! HSRPv2 with tracking</span>
track 10 ip sla 1 reachability
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt delay minimum 30
 standby 1 authentication md5 key-string NK-HSRP
 standby 1 track 10 decrement 20
<span class="c">! VRRPv3</span>
fhrp version vrrp v3
interface GigabitEthernet0/0
 vrrp 5 address-family ipv4
  address 192.168.30.254 primary
  priority 120</pre>
<pre class="out">show ntp associations detail | show ntp status
show ptp clock | show ptp parent | show ptp port
show ip nat translations | show ip nat statistics
<span class="hl">show standby brief | show track | show vrrp brief</span></pre>

<div class="eg"><p><b>Worked example, final self-test.</b> In HSRP, R1 priority 120 tracks two objects with decrement 15 each, and R2 is 100 with preempt. One object down: 105, R1 Active. Both down: 90, R2 Active. R1 recovers both: 120, but R1 becomes Active again only if it has preempt. The branch clock syncs to HQ at stratum 3, so the branch is 4 and its switches 5.</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising only the commands. Most ENCOR questions give outputs and ask what happens next. Practise predicting: who is Active, which stratum, which address an ACL sees.</p></div>

<div class="exam"><p><b>Exam trap.</b> Watch the verbs in the stem: "interpret" for NTP/PTP means reading output and roles; "configure" for NAT and FHRP means the exact keywords (overload, preempt, decrement, address-family, primary).</p></div>

<div class="scn"><h4>The migration checklist that saved a weekend</h4><p>An insurance company moved 40 branches from HSRPv1 to VRRPv3 with authenticated NTP in one quarter. The lead engineer turned this chapter's checklist into a pre-change and post-change script: show ntp status, show standby brief or show vrrp brief on both routers, show track, and a controlled failover of the tracked object. Two branches failed the post-check (one key typo, one missing preempt) and were fixed within the window instead of on Monday morning.</p><p><b>Lesson:</b> a checklist that includes both routers and a real failover test turns silent faults into visible ones.</p></div>

<div class="iv"><p class="q">"Give me a one-minute overview of first hop redundancy options and how you would design one."</p><p>Name the three: HSRP (Cisco, Active/Standby, preempt off), VRRP (open standard, Master/Backup, preempt on, v3 for IPv6), GLBP (Cisco, load sharing with AVG and AVFs). Then the design: pick VRRP for multi-vendor, HSRPv2 otherwise; align the Active with the STP root per VLAN; authenticate; track the upstream with IP SLA and a decrement that crosses the peer; preempt with a delay on both routers; keep NTP synchronised so failover logs line up.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR 3.3: interpret NTP/PTP, configure NAT/PAT, configure HSRP and VRRP.</li>
<li>NTP security = key, authenticate, trusted-key, server key, plus access groups.</li>
<li>NAT order: route-then-translate outbound, translate-then-route inbound.</li>
<li>FHRP design = right protocol, authentication, tracking arithmetic, preempt with delay, STP alignment.</li>
<li>Always verify both routers and test the tracked failure, not just the LAN interface.</li>
</ul></div>
`,hi:`
<p>Lambi train yatra se pehle aap teen cheezein check karte ho: ticket, ID, charger. Yeh chapter ENCOR objective 3.3 ke liye wahi final check hai. Agar aap neeche ke har box ko peeche dekhe bina tick kar sakte ho, to aap exam questions aur uske baad ke interview ke liye tayyar ho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Stratum, chaar NTP timestamps aur path asymmetry galti kyun banati hai, samjhao.</li>
<li><code>ntp server</code>, <code>ntp peer</code> aur <code>ntp master</code> mein se chuno, aur hierarchy mein har device ka stratum predict karo.</li>
<li>Chaaron client pieces ke saath NTP authentication configure karo aur samjhao ki server ko sirf key kyun chahiye.</li>
<li>NTP access groups likho aur apne upstream ko lock out karne se bacho.</li>
<li><code>show ntp associations [detail]</code> aur <code>show ntp status</code> padho: *, ~, reach 377, sane/valid, stratum.</li>
<li>PTP roles (grandmaster, boundary, transparent, ordinary), BMCA order, Sync/Delay exchange samjhao, aur <code>show ptp clock</code> interpret karo.</li>
<li>NAT order of operations se predict karo ki ACLs aur crypto kya dekhte hain; static, dynamic, PAT aur route-map NAT banao.</li>
<li>Inside aur outside static NAT se overlapping networks solve karo; NVI samjhao.</li>
<li>Translations, statistics, debug aur clear se NAT troubleshoot karo.</li>
<li>IPv4 aur IPv6 ke liye MD5, preempt delay aur IP SLA tracking ke saath HSRPv2 banao; decrements ka hisaab lagao.</li>
<li>STP ke saath aligned kai groups se load share karo, aur GLBP AVG/AVF aur weighting samjhao.</li>
<li>VRRP ko classic aur v3 address-family syntax mein configure karo aur doosre vendor ke saath chalao.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="FHRP comparison ek nazar mein">
<rect x="20" y="20" width="190" height="160" rx="10" fill="#bae6fd"/><text x="115" y="45" text-anchor="middle" class="svg-ink" font-size="14">HSRPv2</text><text x="115" y="70" text-anchor="middle" class="svg-muted" font-size="12">Cisco, Active/Standby</text><text x="115" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.102 UDP 1985</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">0000.0c9f.fXXX</text><text x="115" y="136" text-anchor="middle" class="svg-muted" font-size="12">preempt off</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">hello 3 / hold 10</text>
<rect x="225" y="20" width="190" height="160" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="14">VRRP</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">RFC, Master/Backup</text><text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.18 proto 112</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">0000.5e00.01XX</text><text x="320" y="136" text-anchor="middle" class="svg-muted" font-size="12">preempt on</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">advert 1 s</text>
<rect x="430" y="20" width="190" height="160" rx="10" fill="#fde68a"/><text x="525" y="45" text-anchor="middle" class="svg-ink" font-size="14">GLBP</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">Cisco, AVG + 4 AVF</text><text x="525" y="92" text-anchor="middle" class="svg-muted" font-size="12">224.0.0.102 UDP 3222</text><text x="525" y="114" text-anchor="middle" class="svg-muted" font-size="12">0007.b400.XXYY</text><text x="525" y="136" text-anchor="middle" class="svg-muted" font-size="12">AVG preempt off</text><text x="525" y="158" text-anchor="middle" class="svg-muted" font-size="12">hello 3 / hold 10</text>
</svg><p class="cap">Teeno FHRPs ek card par: standard, roles, transport, MAC, preempt default aur timers.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Stratum</dt><dd>Reference clock se doori; 16 = unsynchronised.</dd>
<dt>Trusted key</dt><dd>NTP key ID jise client sync ke liye accept karta hai.</dd>
<dt>Grandmaster</dt><dd>Sabse achhi PTP clock, BMCA se chuni gayi.</dd>
<dt>Boundary / transparent clock</dt><dd>PTP device jo time terminate karke dobara banata hai / jo apna residence time correctionField mein jodta hai.</dd>
<dt>Inside local / inside global</dt><dd>Inside host ka private address / uska public roop.</dd>
<dt>Route-map NAT</dt><dd>NAT rule jo source aur exit interface ya destination match karta hai; fully extended entries banata hai.</dd>
<dt>NVI</dt><dd>NAT Virtual Interface; ip nat enable, koi inside/outside roles nahi.</dd>
<dt>Coup</dt><dd>HSRP message jo preempt wala zyada priority ka router Active role lene ke liye bhejta hai.</dd>
<dt>Address owner</dt><dd>VRRP router jiska asli IP hi VIP hai; priority 255.</dd>
<dt>AVG / AVF</dt><dd>GLBP gateway jo ARP ka jawab deta hai / router jo ek virtual MAC ke liye forward karta hai.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>NTP</td><td>UDP 123; ntp master default stratum 8; client = server stratum + 1; server ko sirf key chahiye</td></tr>
<tr><td>NTP access</td><td>peer, serve, serve-only, query-only; koi group exist karte hi unmatched = denied</td></tr>
<tr><td>PTP</td><td>IEEE 1588; UDP 319/320 ya EtherType 0x88F7; BMCA: priority1, class, accuracy, variance, priority2, identity</td></tr>
<tr><td>NAT order</td><td>In se out: route phir NAT; out se in: NAT phir route</td></tr>
<tr><td>HSRP</td><td>v1 0000.0c07.acXX, 224.0.0.2; v2 0000.0c9f.fXXX, 224.0.0.102, groups 0-4095; IPv6 0005.73a0.0XXX, FF02::66</td></tr>
<tr><td>Tracking</td><td>Default decrement 10; peer se strictly neeche girna chahiye; peer ko preempt chahiye</td></tr>
<tr><td>VRRP</td><td>Master Down = 3 x advert + (256 - prio)/256; owner 255; v3 mein koi authentication nahi</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Authentication ke saath NTP client</span>
ntp authentication-key 1 md5 NK-Time
ntp authenticate
ntp trusted-key 1
ntp server 10.255.0.1 key 1
ntp source Loopback0
<span class="c">! PAT</span>
ip nat inside source list 10 interface GigabitEthernet0/1 overload
<span class="c">! Tracking ke saath HSRPv2</span>
track 10 ip sla 1 reachability
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.20.1
 standby 1 priority 110
 standby 1 preempt delay minimum 30
 standby 1 authentication md5 key-string NK-HSRP
 standby 1 track 10 decrement 20
<span class="c">! VRRPv3</span>
fhrp version vrrp v3
interface GigabitEthernet0/0
 vrrp 5 address-family ipv4
  address 192.168.30.254 primary
  priority 120</pre>
<pre class="out">show ntp associations detail | show ntp status
show ptp clock | show ptp parent | show ptp port
show ip nat translations | show ip nat statistics
<span class="hl">show standby brief | show track | show vrrp brief</span></pre>

<div class="eg"><p><b>Worked example, final self-test.</b> HSRP mein R1 priority 120 do objects track karta hai, har ek decrement 15, aur R2 100 par preempt ke saath hai. Ek object down: 105, R1 Active. Dono down: 90, R2 Active. R1 dono recover karta hai: 120, lekin R1 dobara Active sirf tab banta hai jab us par preempt ho. Branch clock HQ se stratum 3 par sync hoti hai, to branch 4 aur uske switches 5.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf commands revise karna. Zyada tar ENCOR questions outputs dekar poochte hain ki aage kya hoga. Predict karne ki practice karo: Active kaun hai, kaunsa stratum, ACL kaunsa address dekhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stem ke verbs dekho: NTP/PTP ke liye "interpret" matlab output aur roles padhna; NAT aur FHRP ke liye "configure" matlab exact keywords (overload, preempt, decrement, address-family, primary).</p></div>

<div class="scn"><h4>Migration checklist jisne weekend bachaaya</h4><p>Ek insurance company ne ek quarter mein 40 branches ko HSRPv1 se authenticated NTP ke saath VRRPv3 par move kiya. Lead engineer ne is chapter ki checklist ko pre-change aur post-change script bana diya: show ntp status, dono routers par show standby brief ya show vrrp brief, show track, aur tracked object ka controlled failover. Do branches post-check mein fail hui (ek key typo, ek missing preempt) aur Monday subah ki jagah window ke andar theek ho gayi.</p><p><b>Seekh:</b> jo checklist dono routers aur asli failover test shamil karti hai, woh silent faults ko dikhne wale faults bana deti hai.</p></div>

<div class="iv"><p class="q">"Mujhe first hop redundancy options ka ek minute ka overview do aur batao ek design kaise karoge."</p><p>Teeno ke naam lo: HSRP (Cisco, Active/Standby, preempt off), VRRP (open standard, Master/Backup, preempt on, IPv6 ke liye v3), GLBP (Cisco, AVG aur AVFs ke saath load sharing). Phir design: multi-vendor ke liye VRRP chuno, warna HSRPv2; har VLAN mein Active ko STP root ke saath align karo; authenticate karo; IP SLA aur peer ko cross karne wale decrement se upstream track karo; dono routers par delay ke saath preempt; NTP sync rakho taaki failover logs line up hon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ENCOR 3.3: NTP/PTP interpret, NAT/PAT configure, HSRP aur VRRP configure.</li>
<li>NTP security = key, authenticate, trusted-key, server key, plus access groups.</li>
<li>NAT order: outbound mein route-phir-translate, inbound mein translate-phir-route.</li>
<li>FHRP design = sahi protocol, authentication, tracking ka hisaab, delay ke saath preempt, STP alignment.</li>
<li>Hamesha dono routers verify karo aur tracked failure test karo, sirf LAN interface nahi.</li>
</ul></div>
`}};export{e as default};