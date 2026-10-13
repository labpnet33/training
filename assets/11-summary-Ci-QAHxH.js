var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an office tower whose floors could not talk to each other, and you now know three ways to build reception, how to walk a packet through it, and how to find the fault when a floor goes quiet. This chapter packs the module into a checklist you can revise from the night before the exam or before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map: why, designs, services, troubleshooting">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="48" text-anchor="middle" class="svg-ink" font-size="13">Why</text><text x="80" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN = subnet</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="48" text-anchor="middle" class="svg-ink" font-size="13">Gateway + ARP</text><text x="240" y="68" text-anchor="middle" class="svg-muted" font-size="12">MACs change per hop</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 designs</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">legacy, ROAS, SVI</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">DHCP relay</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">ip helper-address</text>
<line x1="150" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="120" width="400" height="60" rx="8" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting: ping own gateway first</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">fail = Layer 2 side, success = routing or far side</text>
<line x1="320" y1="90" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The whole module on one page.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why hosts in different VLANs need a Layer 3 device even on the same switch.</li>
<li>Walk a packet between VLANs: local or remote decision, ARP for the gateway, TTL decrement, MAC rewrite.</li>
<li>Configure legacy inter-VLAN routing with one router interface per VLAN.</li>
<li>Configure router-on-a-stick: static trunk on the switch, <code>no shutdown</code> on the parent, <code>encapsulation dot1Q</code> then IP on each subinterface, native VLAN handling.</li>
<li>Configure a Layer 3 switch: <code>ip routing</code>, SVIs, a trunk to the access layer, a routed port with <code>no switchport</code> and a default route.</li>
<li>Predict SVI status from the three autostate conditions.</li>
<li>Choose between the designs and justify the choice.</li>
<li>Relay DHCP across VLANs with <code>ip helper-address</code> and explain giaddr.</li>
<li>Troubleshoot the eight common faults with the right show command.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Inter-VLAN routing</dt><dd>Routing between the IP subnets of different VLANs.</dd>
<dt>Default gateway</dt><dd>The router or SVI address in the host's own subnet that receives all off-subnet traffic.</dd>
<dt>Router-on-a-stick (ROAS)</dt><dd>One router interface, split into 802.1Q subinterfaces, routing many VLANs over one trunk.</dd>
<dt>Subinterface</dt><dd>A logical interface such as Gi0/0.10; bound to a VLAN by <code>encapsulation dot1Q</code>.</dd>
<dt>SVI</dt><dd>Switched Virtual Interface, <code>interface Vlan N</code>: a Layer 3 switch's gateway inside a VLAN.</dd>
<dt>Autostate</dt><dd>The rule that keeps an SVI down unless its VLAN has an up, forwarding port.</dd>
<dt>Routed port</dt><dd>A switch port converted to Layer 3 with <code>no switchport</code>; no VLAN, no STP.</dd>
<dt>Relay agent / giaddr</dt><dd>The gateway that forwards DHCP broadcasts as unicast, writing its interface IP into giaddr so the server picks the right pool.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>The frame from a host to another VLAN is addressed to the <b>gateway's MAC</b>; the IP destination is the final host.</li>
<li><code>encapsulation dot1Q N</code> must come before <code>ip address</code> on a subinterface; the subinterface number is only a label.</li>
<li>Native VLAN on a router: <code>encapsulation dot1Q N native</code>, or the IP on the physical interface.</li>
<li>Routers do not run DTP: the switch side of ROAS must be <code>switchport mode trunk</code>.</li>
<li>A subinterface with the wrong VLAN ID is still up/up.</li>
<li>Layer 3 switches need <code>ip routing</code>; without it <code>show ip route</code> says "Default gateway is not set".</li>
<li>SVI up/down = VLAN missing or no active forwarding port; administratively down = <code>shutdown</code>.</li>
<li>Creating <code>interface Vlan N</code> does not create VLAN N.</li>
<li><code>ip helper-address</code> goes on the interface that receives client broadcasts.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>ROAS subinterface</td><td><code>interface g0/0.10</code>, <code>encapsulation dot1Q 10</code>, <code>ip address ...</code></td></tr>
<tr><td>ROAS native VLAN</td><td><code>encapsulation dot1Q 99 native</code></td></tr>
<tr><td>Switch side of ROAS</td><td><code>switchport mode trunk</code>, <code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>Enable routing on a Layer 3 switch</td><td><code>ip routing</code> (IPv6: <code>ipv6 unicast-routing</code>)</td></tr>
<tr><td>SVI</td><td><code>interface vlan 10</code>, <code>ip address ...</code>, <code>no shutdown</code></td></tr>
<tr><td>Routed port</td><td><code>no switchport</code>, <code>ip address ...</code></td></tr>
<tr><td>DHCP relay</td><td><code>ip helper-address 10.1.100.10</code></td></tr>
<tr><td>Verify router side</td><td><code>show ip interface brief</code>, <code>show vlans</code>, <code>show interfaces g0/0.10</code></td></tr>
<tr><td>Verify switch side</td><td><code>show interfaces trunk</code>, <code>show vlan brief</code>, <code>show interfaces g0/0 switchport</code></td></tr>
<tr><td>Verify routing</td><td><code>show ip route</code>, <code>show ip arp</code>, ping and trace from hosts</td></tr>
</table>

<div class="eg"><p><b>Worked example: a two-minute exam drill.</b> Exhibit: <code>Vlan30 10.3.0.1 YES manual up down</code>. Condition 3 (not shut) is satisfied because the status is "up". So condition 1 or 2 failed: VLAN 30 missing or no forwarding port. Answer: "VLAN 30 has no active port or does not exist". Not "the SVI is shut down", not "ip routing is disabled".</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Confusing <code>show vlans</code> (router) with <code>show vlan</code> (switch); choosing <code>switchport</code> commands for a router; forgetting that <code>ip default-gateway</code> is ignored once <code>ip routing</code> is on; forgetting <code>add</code> on an allowed list.</p></div>

<div class="exam"><p><b>Exam trap.</b> Several answers may be "true" statements; choose the one that fixes the symptom shown. If hosts ping their own gateway, the answer is never a Layer 2 fix for that VLAN.</p></div>

<div class="scn"><h4>A day-one checklist that saved a rollout</h4><p>An engineer rolling out 20 branches with router-on-a-stick and a head office with SVIs wrote one post-change checklist from this module: gateway ping from one host per VLAN, <code>show vlans</code> on each branch router, <code>show interfaces trunk</code> on each router-facing port, <code>show ip route</code> for C routes and a default, and a DHCP renew per VLAN. Two branches failed the check that night: one with a VLAN missing from the allowed list and one with a helper address missing. Both were fixed before users arrived.</p><p><b>Lesson:</b> a short, repeatable verification list catches the faults that up/up statuses hide.</p></div>

<div class="iv"><p class="q">"Compare router-on-a-stick and Layer 3 switch inter-VLAN routing in one minute."</p><p>Strong answer: both give each VLAN a gateway in its own subnet. ROAS uses one router port split into 802.1Q subinterfaces over a trunk; cheap and ideal for branches, but traffic hairpins and the link and router CPU are bottlenecks. A Layer 3 switch uses SVIs routed in hardware with <code>ip routing</code>; no hairpin, wire-speed, scales to hundreds of VLANs, standard for campus distribution, usually with an FHRP. Close with the key verification commands for each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every VLAN needs a gateway interface in its own subnet on a Layer 3 device.</li>
<li>ROAS: trunk plus subinterfaces; Layer 3 switch: <code>ip routing</code> plus SVIs; routed ports for Layer 3 uplinks.</li>
<li>Autostate decides SVI status; a wrong subinterface VLAN ID hides behind up/up.</li>
<li><code>ip helper-address</code> on client gateways lets one DHCP server serve all VLANs.</li>
<li>Next modules build on this: CDP and LLDP, STP, EtherChannel, and HSRP/VRRP for redundant gateways.</li>
</ul></div>
`,hi:`
<p>Aapne ek office tower se shuru kiya tha jiski floors aapas mein baat nahi kar sakti thi, aur ab aap reception banane ke teen tareeke jaante ho, usmein se packet ko kaise le jaana hai, aur jab koi floor chup ho jaaye to fault kaise dhoondhna hai. Yeh chapter poore module ko ek checklist mein pack karta hai jisse aap exam ya interview se pehli raat revise kar sako.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map: kyun, designs, services, troubleshooting">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#e2e8f0"/><text x="80" y="48" text-anchor="middle" class="svg-ink" font-size="13">Kyun</text><text x="80" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN = subnet</text>
<rect x="170" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="240" y="48" text-anchor="middle" class="svg-ink" font-size="13">Gateway + ARP</text><text x="240" y="68" text-anchor="middle" class="svg-muted" font-size="12">har hop par MAC badle</text>
<rect x="330" y="20" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 designs</text><text x="400" y="68" text-anchor="middle" class="svg-muted" font-size="12">legacy, ROAS, SVI</text>
<rect x="490" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="48" text-anchor="middle" class="svg-ink" font-size="13">DHCP relay</text><text x="560" y="68" text-anchor="middle" class="svg-muted" font-size="12">ip helper-address</text>
<line x1="150" y1="55" x2="170" y2="55" stroke="#64748b" stroke-width="2"/><line x1="310" y1="55" x2="330" y2="55" stroke="#64748b" stroke-width="2"/><line x1="470" y1="55" x2="490" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="120" width="400" height="60" rx="8" fill="#fde68a"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Troubleshooting: pehle apna gateway ping karo</text><text x="320" y="166" text-anchor="middle" class="svg-muted" font-size="12">fail = Layer 2 side, success = routing ya dur wali side</text>
<line x1="320" y1="90" x2="320" y2="120" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki alag VLANs ke hosts ko same switch par bhi Layer 3 device kyun chahiye.</li>
<li>VLANs ke beech packet walk karo: local ya remote decision, gateway ke liye ARP, TTL kam hona, MAC rewrite.</li>
<li>Har VLAN ke liye ek router interface ke saath legacy inter-VLAN routing configure karo.</li>
<li>Router-on-a-stick configure karo: switch par static trunk, parent par <code>no shutdown</code>, har subinterface par <code>encapsulation dot1Q</code> phir IP, native VLAN handling.</li>
<li>Layer 3 switch configure karo: <code>ip routing</code>, SVIs, access layer tak trunk, <code>no switchport</code> wala routed port aur default route.</li>
<li>Teen autostate conditions se SVI status predict karo.</li>
<li>Designs mein se chuno aur choice ko justify karo.</li>
<li><code>ip helper-address</code> se VLANs ke across DHCP relay karo aur giaddr samjhao.</li>
<li>Sahi show command ke saath aath common faults troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Inter-VLAN routing</dt><dd>Alag VLANs ke IP subnets ke beech routing.</dd>
<dt>Default gateway</dt><dd>Host ke apne subnet mein router ya SVI ka address jo saara off-subnet traffic leta hai.</dd>
<dt>Router-on-a-stick (ROAS)</dt><dd>Ek router interface, 802.1Q subinterfaces mein bata hua, jo ek trunk par kai VLANs route karta hai.</dd>
<dt>Subinterface</dt><dd>Gi0/0.10 jaisa logical interface; <code>encapsulation dot1Q</code> se VLAN se bandha.</dd>
<dt>SVI</dt><dd>Switched Virtual Interface, <code>interface Vlan N</code>: VLAN ke andar Layer 3 switch ka gateway.</dd>
<dt>Autostate</dt><dd>Woh rule jo SVI ko tab tak down rakhta hai jab tak uske VLAN mein up, forwarding port na ho.</dd>
<dt>Routed port</dt><dd><code>no switchport</code> se Layer 3 mein badla gaya switch port; na VLAN, na STP.</dd>
<dt>Relay agent / giaddr</dt><dd>Woh gateway jo DHCP broadcasts ko unicast ki tarah forward karta hai, giaddr mein apna interface IP likh kar taaki server sahi pool chune.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<ul>
<li>Host se dusre VLAN ka frame <b>gateway ke MAC</b> par addressed hota hai; IP destination final host hai.</li>
<li>Subinterface par <code>encapsulation dot1Q N</code> <code>ip address</code> se pehle aana chahiye; subinterface number sirf label hai.</li>
<li>Router par native VLAN: <code>encapsulation dot1Q N native</code>, ya IP physical interface par.</li>
<li>Routers DTP nahi chalate: ROAS ki switch side <code>switchport mode trunk</code> honi chahiye.</li>
<li>Galat VLAN ID wala subinterface bhi up/up hota hai.</li>
<li>Layer 3 switches ko <code>ip routing</code> chahiye; iske bina <code>show ip route</code> "Default gateway is not set" kehta hai.</li>
<li>SVI up/down = VLAN missing ya koi active forwarding port nahi; administratively down = <code>shutdown</code>.</li>
<li><code>interface Vlan N</code> banane se VLAN N nahi banta.</li>
<li><code>ip helper-address</code> us interface par lagta hai jo client broadcasts receive karta hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr>
<tr><td>ROAS subinterface</td><td><code>interface g0/0.10</code>, <code>encapsulation dot1Q 10</code>, <code>ip address ...</code></td></tr>
<tr><td>ROAS native VLAN</td><td><code>encapsulation dot1Q 99 native</code></td></tr>
<tr><td>ROAS ki switch side</td><td><code>switchport mode trunk</code>, <code>switchport trunk allowed vlan add N</code></td></tr>
<tr><td>Layer 3 switch par routing enable</td><td><code>ip routing</code> (IPv6: <code>ipv6 unicast-routing</code>)</td></tr>
<tr><td>SVI</td><td><code>interface vlan 10</code>, <code>ip address ...</code>, <code>no shutdown</code></td></tr>
<tr><td>Routed port</td><td><code>no switchport</code>, <code>ip address ...</code></td></tr>
<tr><td>DHCP relay</td><td><code>ip helper-address 10.1.100.10</code></td></tr>
<tr><td>Router side verify</td><td><code>show ip interface brief</code>, <code>show vlans</code>, <code>show interfaces g0/0.10</code></td></tr>
<tr><td>Switch side verify</td><td><code>show interfaces trunk</code>, <code>show vlan brief</code>, <code>show interfaces g0/0 switchport</code></td></tr>
<tr><td>Routing verify</td><td><code>show ip route</code>, <code>show ip arp</code>, hosts se ping aur trace</td></tr>
</table>

<div class="eg"><p><b>Worked example: do minute ki exam drill.</b> Exhibit: <code>Vlan30 10.3.0.1 YES manual up down</code>. Condition 3 (shut nahi) poori hai kyunki status "up" hai. To condition 1 ya 2 fail hui: VLAN 30 missing ya koi forwarding port nahi. Jawab: "VLAN 30 mein koi active port nahi ya woh exist nahi karta". "SVI shut hai" nahi, "ip routing disabled hai" nahi.</p></div>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> <code>show vlans</code> (router) ko <code>show vlan</code> (switch) se confuse karna; router ke liye <code>switchport</code> commands chunna; yeh bhool jaana ki <code>ip routing</code> on hone ke baad <code>ip default-gateway</code> ignore hota hai; allowed list par <code>add</code> bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Kai answers "sach" statements ho sakte hain; woh chuno jo dikhaye gaye symptom ko theek kare. Agar hosts apna gateway ping kar rahe hain, to jawab us VLAN ka Layer 2 fix kabhi nahi hota.</p></div>

<div class="scn"><h4>Day-one checklist jisne rollout bachaya</h4><p>Router-on-a-stick ke saath 20 branches aur SVIs wala head office roll out karte hue ek engineer ne is module se ek post-change checklist likhi: har VLAN ke ek host se gateway ping, har branch router par <code>show vlans</code>, router ki taraf wale har port par <code>show interfaces trunk</code>, C routes aur default ke liye <code>show ip route</code>, aur har VLAN mein ek DHCP renew. Us raat do branches check mein fail hui: ek mein allowed list se VLAN gayab tha aur ek mein helper address missing tha. Users ke aane se pehle dono theek ho gaye.</p><p><b>Seekh:</b> chhoti, dohrai ja sakne wali verification list woh faults pakadti hai jo up/up statuses chhupa lete hain.</p></div>

<div class="iv"><p class="q">"Router-on-a-stick aur Layer 3 switch inter-VLAN routing ko ek minute mein compare karo."</p><p>Strong answer: dono har VLAN ko uske apne subnet mein gateway dete hain. ROAS ek router port ko trunk par 802.1Q subinterfaces mein baant kar use karta hai; sasta aur branches ke liye ideal, lekin traffic hairpin karta hai aur link aur router CPU bottlenecks hain. Layer 3 switch <code>ip routing</code> ke saath hardware mein routed SVIs use karta hai; koi hairpin nahi, wire-speed, sainkdon VLANs tak scale, campus distribution ka standard, aam taur par FHRP ke saath. Har ek ke key verification commands ke saath khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har VLAN ko Layer 3 device par apne subnet mein gateway interface chahiye.</li>
<li>ROAS: trunk plus subinterfaces; Layer 3 switch: <code>ip routing</code> plus SVIs; Layer 3 uplinks ke liye routed ports.</li>
<li>Autostate SVI status decide karta hai; galat subinterface VLAN ID up/up ke peeche chhupa rehta hai.</li>
<li>Client gateways par <code>ip helper-address</code> ek DHCP server ko saare VLANs serve karne deta hai.</li>
<li>Agle modules isi par bante hain: CDP aur LLDP, STP, EtherChannel, aur redundant gateways ke liye HSRP/VRRP.</li>
</ul></div>
`}};export{e as default};