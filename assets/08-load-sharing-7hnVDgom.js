var e={id:`load-sharing`,h:{en:`Load sharing with multiple HSRP groups across VLANs`,hi:`VLANs mein multiple HSRP groups se load sharing`},body:{en:`
<p>A restaurant with two chefs could make one chef cook everything while the other stands ready in case of a burn. That is safe but wasteful. A better kitchen gives the starters to chef A and the main courses to chef B, and each is the backup for the other's station. HSRP on its own is the first kitchen: one Active router per group, the Standby forwards nothing. Using <b>several groups</b> gives you the second kitchen.</p>

<h3>Why one group wastes a router</h3>
<p>In a group only the Active router forwards traffic sent to the virtual MAC. The Standby is idle for user traffic, together with its uplink. With 2 x 10G uplinks, users effectively get 10G. HSRP has no built-in way to split one group's hosts between two routers. The standard answer is to run <b>one group per VLAN</b> and make a <b>different router Active</b> in different VLANs. This is called <b>load sharing</b>; the balance is only as even as the traffic in your VLANs.</p>

<h3>The design</h3>
<p>Two distribution switches, DSW1 and DSW2, route for VLAN 10 (sales) and VLAN 20 (finance) using SVIs. The group number follows the VLAN number, which makes troubleshooting easier.</p>
<table class="cmp"><tr><th>VLAN / subnet</th><th>VIP</th><th>DSW1</th><th>DSW2</th></tr>
<tr><td>10 / 192.168.10.0/24</td><td>192.168.10.1</td><td>.2, priority 110, <b>Active</b></td><td>.3, priority 100, Standby</td></tr>
<tr><td>20 / 192.168.20.0/24</td><td>192.168.20.1</td><td>.2, priority 100, Standby</td><td>.3, priority 110, <b>Active</b></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two HSRP groups with opposite Active routers">
<rect x="60" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">DSW1</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 Active, STP root</text>
<rect x="380" y="30" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">DSW2</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 Active, STP root</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="4"/><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="240" y="180" width="160" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<line x1="160" y1="90" x2="280" y2="180" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="360" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="160" y="140" text-anchor="middle" class="svg-accent" font-size="12">VLAN 10 traffic</text>
<text x="480" y="140" text-anchor="middle" class="svg-accent" font-size="12">VLAN 20 traffic</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">each uplink carries one VLAN normally, both on failure</text>
</svg><p class="cap">Opposite Active routers per VLAN use both distribution switches; STP roots are aligned with them.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! DSW1: Active for VLAN 10, Standby for VLAN 20</span>
DSW1(config)# interface Vlan10
DSW1(config-if)# ip address 192.168.10.2 255.255.255.0
DSW1(config-if)# standby 10 ip 192.168.10.1
DSW1(config-if)# standby 10 priority 110
DSW1(config-if)# standby 10 preempt
DSW1(config-if)# interface Vlan20
DSW1(config-if)# ip address 192.168.20.2 255.255.255.0
DSW1(config-if)# standby 20 ip 192.168.20.1
DSW1(config-if)# standby 20 preempt
<span class="c">! align STP: DSW1 is root for VLAN 10</span>
DSW1(config)# spanning-tree vlan 10 root primary
DSW1(config)# spanning-tree vlan 20 root secondary

<span class="c">! DSW2 is the mirror image</span>
DSW2(config)# interface Vlan10
DSW2(config-if)# ip address 192.168.10.3 255.255.255.0
DSW2(config-if)# standby 10 ip 192.168.10.1
DSW2(config-if)# standby 10 preempt
DSW2(config-if)# interface Vlan20
DSW2(config-if)# ip address 192.168.20.3 255.255.255.0
DSW2(config-if)# standby 20 ip 192.168.20.1
DSW2(config-if)# standby 20 priority 110
DSW2(config-if)# standby 20 preempt
DSW2(config)# spanning-tree vlan 20 root primary
DSW2(config)# spanning-tree vlan 10 root secondary</pre>
<p>On a router-on-a-stick design the same idea uses subinterfaces, for example <code>interface GigabitEthernet0/0.10</code> with <code>encapsulation dot1Q 10</code> and <code>standby 10 ip 192.168.10.1</code>.</p>

<pre class="out">DSW1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           192.168.10.3    192.168.10.1</span>
<span class="hl">Vl20        20   100 P Standby 192.168.20.3    local           192.168.20.1</span></pre>

<h3>Why align the STP root with the Active gateway</h3>
<p>In a looped access design, STP blocks one uplink per VLAN. If VLAN 10's root were DSW2 while DSW1 is its HSRP Active, ASW1's uplink to DSW1 would be blocked for VLAN 10. Sales traffic would go up to DSW2, cross the inter-switch trunk to reach the virtual MAC on DSW1, and only then be routed. It works, but it doubles the load on the trunk and adds a hop. Making the same switch <b>STP root and HSRP Active</b> for each VLAN keeps traffic on the direct path.</p>

<div class="eg"><p><b>Worked example.</b> VLAN 10 carries about 6 Gbps at peak and VLAN 20 about 4 Gbps. With one group Active on DSW1 for both, DSW1's uplink carries 10 Gbps and DSW2's carries nothing. With split groups, DSW1 carries about 6 and DSW2 about 4. If DSW1 fails, DSW2 carries all 10 Gbps, so each uplink must still be sized for the total. Load sharing uses both links in normal times; it does not reduce the capacity you need for a failure.</p></div>

<h3>Another option: two groups on one subnet</h3>
<p>You can also run two groups on the same VLAN, for example group 1 with VIP 192.168.10.1 (Active on R1) and group 2 with VIP 192.168.10.254 (Active on R2), and give half the hosts each gateway via two DHCP scopes or static configuration. This is sometimes called <b>MHSRP</b>. It works but is clumsy to manage; GLBP (next chapter) does the same thing automatically.</p>

<div class="warn"><p><b>Common mistake.</b> Splitting HSRP Active roles but leaving STP at defaults, so one switch is root for every VLAN. Half the traffic then crosses the inter-switch link twice. Another mistake: splitting the roles without preempt, so after the first reboot both VLANs end up Active on the same switch and nobody notices until the uplink saturates.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP and VRRP do <b>load sharing</b> by using multiple groups (per VLAN or per subnet); within one group only one router forwards. <b>GLBP</b> is the FHRP that load-balances hosts of the same group across several routers. If a question asks which FHRP balances within a single subnet with one VIP, the answer is GLBP.</p></div>

<div class="scn"><h4>The inter-switch link that was always full</h4><p>A manufacturing plant in Pune saw its 10G link between DSW1 and DSW2 running at 90% while the uplinks to access switches were half idle. <code>show standby brief</code> showed VLANs 10 to 19 Active on DSW1, VLANs 20 to 29 Active on DSW2, exactly as designed, but <code>show spanning-tree root</code> showed DSW2 as root for every VLAN. For VLANs 10 to 19 every frame took the long way. Setting <code>spanning-tree vlan 10-19 root primary</code> on DSW1 cut the inter-switch link to 15%.</p><p><b>Lesson:</b> plan HSRP Active and STP root together, VLAN by VLAN.</p></div>

<div class="iv"><p class="q">"HSRP has only one Active router per group. How do you use both uplinks?"</p><p>Strong answer: create one HSRP group per VLAN and make a different router Active for different VLANs by setting priority and preempt, which shares load across routers. Align the STP root bridge for each VLAN with that VLAN's Active gateway so traffic takes the direct path. Size each uplink for the full load in case of failure. If true per-host balancing inside one subnet is needed, mention GLBP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One HSRP group forwards on one router only; the Standby is idle.</li>
<li>Use one group per VLAN and alternate the Active router to share load.</li>
<li>Match group number to VLAN number and use preempt so the split survives reloads.</li>
<li>Make each VLAN's STP root the same switch as its HSRP Active.</li>
<li>Load sharing does not reduce the capacity needed when one router fails.</li>
</ul></div>
`,hi:`
<p>Do chefs wala restaurant ek chef se sab kuch pakwa sakta hai jabki doosra kuch jalne ki haalat ke liye ready khada rahe. Yeh safe hai lekin bekaar. Behtar kitchen starters chef A ko aur main course chef B ko deta hai, aur har ek doosre ke station ka backup hai. Akela HSRP pehla kitchen hai: har group mein ek Active router, Standby kuch forward nahi karta. <b>Kai groups</b> use karne se aapko doosra kitchen milta hai.</p>

<h3>Ek group ek router kyun barbaad karta hai</h3>
<p>Group mein sirf Active router hi virtual MAC par bheja gaya traffic forward karta hai. Standby user traffic ke liye khaali baitha hai, apne uplink ke saath. 2 x 10G uplinks ke saath users ko asal mein 10G milta hai. HSRP mein ek group ke hosts ko do routers mein baantne ka koi built-in tarika nahi hai. Standard jawab hai <b>har VLAN ke liye ek group</b> chalana aur alag VLANs mein <b>alag router ko Active</b> banana. Ise <b>load sharing</b> kehte hain; balance utna hi barabar hota hai jitna aapke VLANs ka traffic.</p>

<h3>Design</h3>
<p>Do distribution switches, DSW1 aur DSW2, SVIs use karke VLAN 10 (sales) aur VLAN 20 (finance) ke liye route karte hain. Group number VLAN number follow karta hai, jisse troubleshooting aasaan hoti hai.</p>
<table class="cmp"><tr><th>VLAN / subnet</th><th>VIP</th><th>DSW1</th><th>DSW2</th></tr>
<tr><td>10 / 192.168.10.0/24</td><td>192.168.10.1</td><td>.2, priority 110, <b>Active</b></td><td>.3, priority 100, Standby</td></tr>
<tr><td>20 / 192.168.20.0/24</td><td>192.168.20.1</td><td>.2, priority 100, Standby</td><td>.3, priority 110, <b>Active</b></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Ulte Active routers wale do HSRP groups">
<rect x="60" y="30" width="200" height="60" rx="8" fill="#bae6fd"/><text x="160" y="52" text-anchor="middle" class="svg-ink" font-size="14">DSW1</text><text x="160" y="72" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10 Active, STP root</text>
<rect x="380" y="30" width="200" height="60" rx="8" fill="#ddd6fe"/><text x="480" y="52" text-anchor="middle" class="svg-ink" font-size="14">DSW2</text><text x="480" y="72" text-anchor="middle" class="svg-muted" font-size="12">VLAN 20 Active, STP root</text>
<line x1="260" y1="60" x2="380" y2="60" stroke="#64748b" stroke-width="4"/><text x="320" y="52" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="240" y="180" width="160" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<line x1="160" y1="90" x2="280" y2="180" stroke="#64748b" stroke-width="2"/><line x1="480" y1="90" x2="360" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="160" y="140" text-anchor="middle" class="svg-accent" font-size="12">VLAN 10 traffic</text>
<text x="480" y="140" text-anchor="middle" class="svg-accent" font-size="12">VLAN 20 traffic</text>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">normally har uplink ek VLAN, failure par dono</text>
</svg><p class="cap">Har VLAN ke liye ulte Active routers dono distribution switches use karte hain; STP roots unke saath aligned hain.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! DSW1: VLAN 10 ke liye Active, VLAN 20 ke liye Standby</span>
DSW1(config)# interface Vlan10
DSW1(config-if)# ip address 192.168.10.2 255.255.255.0
DSW1(config-if)# standby 10 ip 192.168.10.1
DSW1(config-if)# standby 10 priority 110
DSW1(config-if)# standby 10 preempt
DSW1(config-if)# interface Vlan20
DSW1(config-if)# ip address 192.168.20.2 255.255.255.0
DSW1(config-if)# standby 20 ip 192.168.20.1
DSW1(config-if)# standby 20 preempt
<span class="c">! STP align karo: VLAN 10 ka root DSW1</span>
DSW1(config)# spanning-tree vlan 10 root primary
DSW1(config)# spanning-tree vlan 20 root secondary

<span class="c">! DSW2 bilkul ulta</span>
DSW2(config)# interface Vlan10
DSW2(config-if)# ip address 192.168.10.3 255.255.255.0
DSW2(config-if)# standby 10 ip 192.168.10.1
DSW2(config-if)# standby 10 preempt
DSW2(config-if)# interface Vlan20
DSW2(config-if)# ip address 192.168.20.3 255.255.255.0
DSW2(config-if)# standby 20 ip 192.168.20.1
DSW2(config-if)# standby 20 priority 110
DSW2(config-if)# standby 20 preempt
DSW2(config)# spanning-tree vlan 20 root primary
DSW2(config)# spanning-tree vlan 10 root secondary</pre>
<p>Router-on-a-stick design mein yahi idea subinterfaces use karta hai, jaise <code>interface GigabitEthernet0/0.10</code> ke saath <code>encapsulation dot1Q 10</code> aur <code>standby 10 ip 192.168.10.1</code>.</p>

<pre class="out">DSW1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
<span class="hl">Vl10        10   110 P Active  local           192.168.10.3    192.168.10.1</span>
<span class="hl">Vl20        20   100 P Standby 192.168.20.3    local           192.168.20.1</span></pre>

<h3>STP root ko Active gateway ke saath align kyun karein</h3>
<p>Looped access design mein STP har VLAN ke liye ek uplink block karta hai. Agar VLAN 10 ka root DSW2 hota jabki DSW1 uska HSRP Active hai, to ASW1 ka DSW1 wala uplink VLAN 10 ke liye blocked hota. Sales traffic upar DSW2 tak jaata, DSW1 par virtual MAC tak pahunchne ke liye inter-switch trunk cross karta, aur tab route hota. Kaam chalta hai, lekin trunk par load dugna hota hai aur ek hop badhta hai. Har VLAN ke liye same switch ko <b>STP root aur HSRP Active</b> banane se traffic seedhe path par rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> VLAN 10 peak par lagbhag 6 Gbps le jaata hai aur VLAN 20 lagbhag 4 Gbps. Dono ke liye DSW1 par ek group Active ho to DSW1 ka uplink 10 Gbps le jaata hai aur DSW2 ka kuch nahi. Groups split karne par DSW1 lagbhag 6 aur DSW2 lagbhag 4 le jaata hai. Agar DSW1 fail ho, DSW2 poora 10 Gbps le jaata hai, isliye har uplink ab bhi total ke liye size hona chahiye. Load sharing normal time mein dono links use karta hai; failure ke liye zaroori capacity kam nahi karta.</p></div>

<h3>Ek aur option: ek subnet par do groups</h3>
<p>Aap same VLAN par do groups bhi chala sakte ho, jaise group 1 VIP 192.168.10.1 ke saath (R1 par Active) aur group 2 VIP 192.168.10.254 ke saath (R2 par Active), aur do DHCP scopes ya static configuration se aadhe hosts ko har gateway do. Ise kabhi kabhi <b>MHSRP</b> kehte hain. Yeh kaam karta hai lekin manage karna bhaddha hai; GLBP (agla chapter) yahi kaam automatically karta hai.</p>

<div class="warn"><p><b>Common galti.</b> HSRP Active roles split karna lekin STP ko defaults par chhod dena, jisse ek switch har VLAN ka root ho. Tab aadha traffic inter-switch link do baar cross karta hai. Ek aur galti: bina preempt ke roles split karna, jisse pehle reboot ke baad dono VLANs same switch par Active ho jaate hain aur kisi ko tab tak pata nahi chalta jab tak uplink saturate na ho.</p></div>

<div class="exam"><p><b>Exam trap.</b> HSRP aur VRRP multiple groups (har VLAN ya har subnet) use karke <b>load sharing</b> karte hain; ek group ke andar sirf ek router forward karta hai. <b>GLBP</b> woh FHRP hai jo same group ke hosts ko kai routers mein load-balance karta hai. Agar question poochhe kaunsa FHRP ek VIP ke saath ek hi subnet ke andar balance karta hai, jawab GLBP hai.</p></div>

<div class="scn"><h4>Inter-switch link jo hamesha full rehta tha</h4><p>Pune ke ek manufacturing plant ne dekha ki DSW1 aur DSW2 ke beech ka 10G link 90% par chal raha tha jabki access switches ke uplinks aadhe khaali the. <code>show standby brief</code> ne VLANs 10 se 19 DSW1 par Active, VLANs 20 se 29 DSW2 par Active dikhaye, bilkul design ke hisaab se, lekin <code>show spanning-tree root</code> ne har VLAN ka root DSW2 dikhaya. VLANs 10 se 19 ke liye har frame lamba raasta le raha tha. DSW1 par <code>spanning-tree vlan 10-19 root primary</code> set karne se inter-switch link 15% par aa gaya.</p><p><b>Seekh:</b> HSRP Active aur STP root ko saath mein plan karo, VLAN dar VLAN.</p></div>

<div class="iv"><p class="q">"HSRP mein har group ka ek hi Active router hota hai. Aap dono uplinks kaise use karoge?"</p><p>Strong answer: har VLAN ke liye ek HSRP group banao aur priority aur preempt set karke alag VLANs ke liye alag router ko Active banao, jisse routers ke beech load share hota hai. Har VLAN ke STP root bridge ko us VLAN ke Active gateway ke saath align karo taaki traffic seedha path le. Failure ki haalat ke liye har uplink ko poore load ke liye size karo. Agar ek subnet ke andar sach mein per-host balancing chahiye, to GLBP ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek HSRP group sirf ek router par forward karta hai; Standby khaali rehta hai.</li>
<li>Load share karne ke liye har VLAN ka ek group use karo aur Active router ko baari baari rakho.</li>
<li>Group number ko VLAN number se match karo aur preempt use karo taaki split reloads ke baad bhi bana rahe.</li>
<li>Har VLAN ka STP root wahi switch banao jo uska HSRP Active hai.</li>
<li>Load sharing ek router fail hone par zaroori capacity kam nahi karta.</li>
</ul></div>
`}};export{e as default};