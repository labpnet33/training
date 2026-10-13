var e={id:`fhrp`,h:{en:`HSRP and VRRP on a vPC pair: active/active gateways`,hi:`vPC pair par HSRP aur VRRP: active/active gateways`},body:{en:`
<p>A hospital has one emergency phone number. Behind it, two receptionists sit at two desks. On paper one is "main" and one is "backup", but in reality whichever phone rings, the receptionist who picks it up handles the call. Nobody transfers calls across the room to the "main" desk. That is how a <b>first-hop redundancy protocol</b> (FHRP) behaves on a vPC pair: one gateway address, two routers, and <b>both</b> of them forward.</p>

<h3>FHRP in one minute</h3>
<p>A server has one default gateway IP. If that IP lived on only one switch, losing that switch would cut the server off from other subnets. An FHRP gives the gateway a <b>virtual IP</b> (VIP) and a <b>virtual MAC</b> shared by two routers:</p>
<ul>
<li><b>HSRP</b> (Cisco): one router is <b>Active</b> and answers ARP for the VIP with the virtual MAC; the other is <b>Standby</b>. Higher priority wins (default 100); <b>preempt</b> lets a higher-priority router take the role back. Hello every 3 s, hold 10 s by default. HSRP version 1 virtual MAC is <code>0000.0c07.acXX</code> where XX is the group in hex; version 2 uses <code>0000.0c9f.fXXX</code>.</li>
<li><b>VRRP</b> (open standard): the same idea with Master and Backup; virtual MAC <code>0000.5e00.01XX</code>.</li>
</ul>
<p>On a normal (non-vPC) pair, only the Active router forwards. The Standby just waits.</p>

<h3>What changes on a vPC</h3>
<p>SRV1's bond hashes its flows across both links. Some frames addressed to the virtual MAC land on NX1, others on NX2. If only the HSRP Active router could route, every frame reaching the Standby would have to cross the peer-link, wasting it and adding latency. So vPC makes the HSRP data plane <b>active/active</b>: both peers install the virtual MAC as a local router MAC, and <b>whichever peer receives the frame routes it</b>, the HSRP Standby included. The control plane is unchanged: one Active, one Standby, and only the Active answers ARP. The data plane uses both.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="HSRP active active forwarding on vPC">
<rect x="70" y="20" width="180" height="54" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX1 HSRP Active</text><text x="160" y="61" text-anchor="middle" class="svg-muted" font-size="12">SVI 10.10.10.2</text>
<rect x="390" y="20" width="180" height="54" rx="8" fill="#bae6fd"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX2 HSRP Standby</text><text x="480" y="61" text-anchor="middle" class="svg-muted" font-size="12">SVI 10.10.10.3</text>
<line x1="250" y1="47" x2="390" y2="47" stroke="#64748b" stroke-width="4"/><text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">peer-link: not used</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="320" y="209" text-anchor="middle" class="svg-muted" font-size="12">gw 10.10.10.1</text>
<line x1="160" y1="74" x2="290" y2="170" stroke="#64748b" stroke-width="3"/><text x="130" y="130" class="svg-accent" font-size="12">flow A routed here</text>
<line x1="480" y1="74" x2="350" y2="170" stroke="#64748b" stroke-width="3"/><text x="420" y="130" class="svg-accent" font-size="12">flow B routed here</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.10.10.1, vMAC 0000.0c07.ac0a</text>
</svg><p class="cap">Both peers route frames sent to the virtual MAC. HSRP roles still exist, but only for the control plane.</p></div>

<h3>Configuration walkthrough (lab 3)</h3>
<p>The SVIs already exist: NX1 10.10.10.2/24 and NX2 10.10.10.3/24 in VLAN 10. SRV1's default route already points to 10.10.10.1, an address nobody owns yet. NX-OS uses its own HSRP syntax: the IOS <code>standby</code> command does not exist.</p>
<pre class="code"><span class="c">! NX1: intended Active</span>
feature hsrp
interface vlan10
  hsrp 10
    ip 10.10.10.1
    priority 110
    preempt
<span class="c">! NX2: default priority 100</span>
feature hsrp
interface vlan10
  hsrp 10
    ip 10.10.10.1
<span class="c">! Both peers</span>
vpc domain 10
  peer-gateway</pre>
<p>Best practice is to make the HSRP Active router the vPC primary, as in the lab. It is not required for forwarding, but it keeps troubleshooting simple and aligns the "who answers ARP" role with the "who keeps forwarding" role in a peer-link failure.</p>

<h3>Verification</h3>
<pre class="out">NX1# show hsrp brief
*:IPv6 group   #:group belongs to a bundle
                     P indicates configured to preempt.
                     |
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   110  P Active   local            10.10.10.3       10.10.10.1      (conf)</span>

NX2# show hsrp brief
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   100    Standby  10.10.10.2       local            10.10.10.1      (conf)</span></pre>
<p>From the server, prove that the gateway answers and learn the virtual MAC:</p>
<pre class="out">SRV1$ ping -c 3 10.10.10.1
3 packets transmitted, 3 received, 0% packet loss
SRV1$ ip neigh
<span class="hl">10.10.10.1 dev bond0 lladdr 00:00:0c:07:ac:0a REACHABLE</span></pre>
<p>The lab then asks for NX2's state: it is <b>Standby</b>. That is the trick question: Standby, and yet it routes everything sent to 00:00:0c:07:ac:0a that arrives on its links. Finally, save both switches and look at how the <code>hsrp 10</code> block appears nested under <code>interface Vlan10</code> in <code>show running-config</code>.</p>

<h3>VRRP on a vPC</h3>
<p>VRRP behaves the same way on a vPC pair: the Backup also forwards frames sent to the virtual MAC. NX-OS syntax:</p>
<pre class="code">feature vrrp
interface vlan20
  vrrp 20
    address 10.20.20.1
    priority 110
    no shutdown</pre>

<div class="eg"><p><b>Worked example: failover timing.</b> NX1 (Active) loses power. SRV1's bond drops the eth0 slave within about a second (link down), so all its flows now hash to eth1 and NX2, which was already routing for the virtual MAC. Routed traffic continues almost immediately. HSRP on NX2 needs its hold time, 10 seconds by default, to declare NX1 dead and become Active, but that only matters for ARP replies. This is why on a vPC the HSRP timers rarely need tuning, and why lab 5 still reaches 10.10.10.1 through NX2.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>standby 10 ip 10.10.10.1</code> on NX-OS; forgetting <code>feature hsrp</code> (the <code>hsrp</code> command is rejected); mismatched HSRP group numbers or VIPs between peers (a type-2 inconsistency and two separate groups); and forgetting peer-gateway, which the HSRP virtual MAC alone does not replace.</p></div>

<div class="exam"><p><b>Exam trap.</b> "On a vPC pair, which router forwards traffic sent to the HSRP virtual MAC?" Both, Active and Standby. "Which one answers ARP for the VIP?" Only the Active.</p></div>

<div class="scn"><h4>The peer-link that ran hot</h4><p>A company migrated to a vPC pair but kept an old habit: HSRP on only one peer, with the other peer having no SVI at all in several VLANs. Monitoring showed the peer-link at 80% utilisation during backups. Every frame that SRV bonds hashed to the "no SVI" peer had to cross the peer-link to reach the only router. After adding SVIs and HSRP on both peers, peer-link utilisation dropped to a few percent, and backup times fell by a third.</p><p><b>Lesson:</b> on a vPC, give every vPC VLAN an SVI and FHRP on both peers so routing happens where the frame lands.</p></div>

<div class="iv"><p class="q">"How does HSRP behave differently on a vPC pair compared with a normal pair?"</p><p>Strong answer: the control plane is the same, one Active and one Standby with priority and preempt, and only the Active answers ARP. But the data plane is active/active: both vPC peers route frames sent to the HSRP virtual MAC, so traffic hashed to the Standby is routed locally instead of crossing the peer-link. Add peer-gateway for devices that use the physical router MAC, align the HSRP Active with the vPC primary, and mention that failover is driven mostly by link-down on the bond, not HSRP timers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP gives a VIP and virtual MAC (v1: 0000.0c07.acXX); VRRP does the same with 0000.5e00.01XX.</li>
<li>On vPC, both peers route frames sent to the virtual MAC; only the Active answers ARP.</li>
<li>NX-OS syntax: <code>feature hsrp</code>, <code>hsrp 10</code>, <code>ip</code>, <code>priority</code>, <code>preempt</code>; no <code>standby</code> command.</li>
<li>Configure SVIs and FHRP on both peers, plus peer-gateway, and align HSRP Active with the vPC primary.</li>
<li>Verify with <code>show hsrp brief</code> on both peers and <code>ip neigh</code> on the server.</li>
</ul></div>
`,hi:`
<p>Ek hospital ka ek emergency phone number hai. Uske peeche do receptionists do desks par baithe hain. Kaagaz par ek "main" hai aur ek "backup", par asal mein jis bhi phone ki ghanti baje, jo receptionist utha le wahi call sambhalta hai. Koi call ko kamre ke paar "main" desk par transfer nahi karta. vPC pair par <b>first-hop redundancy protocol</b> (FHRP) aise hi behave karta hai: ek gateway address, do routers, aur <b>dono</b> forward karte hain.</p>

<h3>FHRP ek minute mein</h3>
<p>Server ka ek default gateway IP hota hai. Agar woh IP sirf ek switch par ho, to us switch ke jaane par server doosre subnets se kat jaayega. FHRP gateway ko ek <b>virtual IP</b> (VIP) aur ek <b>virtual MAC</b> deta hai jo do routers share karte hain:</p>
<ul>
<li><b>HSRP</b> (Cisco): ek router <b>Active</b> hota hai aur VIP ke ARP ka jawab virtual MAC se deta hai; doosra <b>Standby</b> hota hai. Zyada priority jeetti hai (default 100); <b>preempt</b> zyada priority wale router ko role wapas lene deta hai. Default mein hello har 3 s, hold 10 s. HSRP version 1 virtual MAC <code>0000.0c07.acXX</code> hai jahan XX group hex mein hai; version 2 <code>0000.0c9f.fXXX</code> use karta hai.</li>
<li><b>VRRP</b> (open standard): Master aur Backup ke saath wahi idea; virtual MAC <code>0000.5e00.01XX</code>.</li>
</ul>
<p>Normal (non-vPC) pair par sirf Active router forward karta hai. Standby bas intezaar karta hai.</p>

<h3>vPC par kya badalta hai</h3>
<p>SRV1 ka bond apne flows dono links par hash karta hai. Virtual MAC ke liye kuch frames NX1 par aate hain, kuch NX2 par. Agar sirf HSRP Active router route kar pata, to Standby tak pahunchne wale har frame ko peer-link cross karna padta, jo use waste karta aur latency badhata. Isliye vPC HSRP data plane ko <b>active/active</b> bana deta hai: dono peers virtual MAC ko local router MAC ki tarah install karte hain, aur <b>jis peer ko frame milta hai wahi use route karta hai</b>, HSRP Standby bhi. Control plane nahi badalta: ek Active, ek Standby, aur ARP ka jawab sirf Active deta hai. Data plane dono use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="vPC par HSRP active active forwarding">
<rect x="70" y="20" width="180" height="54" rx="8" fill="#bae6fd"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX1 HSRP Active</text><text x="160" y="61" text-anchor="middle" class="svg-muted" font-size="12">SVI 10.10.10.2</text>
<rect x="390" y="20" width="180" height="54" rx="8" fill="#bae6fd"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">NX2 HSRP Standby</text><text x="480" y="61" text-anchor="middle" class="svg-muted" font-size="12">SVI 10.10.10.3</text>
<line x1="250" y1="47" x2="390" y2="47" stroke="#64748b" stroke-width="4"/><text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">peer-link: use nahi hota</text>
<rect x="240" y="170" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">SRV1</text><text x="320" y="209" text-anchor="middle" class="svg-muted" font-size="12">gw 10.10.10.1</text>
<line x1="160" y1="74" x2="290" y2="170" stroke="#64748b" stroke-width="3"/><text x="130" y="130" class="svg-accent" font-size="12">flow A yahan route</text>
<line x1="480" y1="74" x2="350" y2="170" stroke="#64748b" stroke-width="3"/><text x="420" y="130" class="svg-accent" font-size="12">flow B yahan route</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.10.10.1, vMAC 0000.0c07.ac0a</text>
</svg><p class="cap">Dono peers virtual MAC par bheje frames route karte hain. HSRP roles ab bhi hain, par sirf control plane ke liye.</p></div>

<h3>Configuration walkthrough (lab 3)</h3>
<p>SVIs pehle se hain: VLAN 10 mein NX1 10.10.10.2/24 aur NX2 10.10.10.3/24. SRV1 ka default route pehle se 10.10.10.1 par hai, jo address abhi kisi ke paas nahi. NX-OS apna HSRP syntax use karta hai: IOS ka <code>standby</code> command exist nahi karta.</p>
<pre class="code"><span class="c">! NX1: intended Active</span>
feature hsrp
interface vlan10
  hsrp 10
    ip 10.10.10.1
    priority 110
    preempt
<span class="c">! NX2: default priority 100</span>
feature hsrp
interface vlan10
  hsrp 10
    ip 10.10.10.1
<span class="c">! Dono peers</span>
vpc domain 10
  peer-gateway</pre>
<p>Best practice hai HSRP Active router ko vPC primary banana, jaisa lab mein. Forwarding ke liye yeh zaroori nahi, par troubleshooting simple rakhta hai aur peer-link failure mein "ARP ka jawab kaun deta hai" role ko "forward kaun karta rehta hai" role ke saath align karta hai.</p>

<h3>Verification</h3>
<pre class="out">NX1# show hsrp brief
*:IPv6 group   #:group belongs to a bundle
                     P indicates configured to preempt.
                     |
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   110  P Active   local            10.10.10.3       10.10.10.1      (conf)</span>

NX2# show hsrp brief
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   100    Standby  10.10.10.2       local            10.10.10.1      (conf)</span></pre>
<p>Server se saabit karo ki gateway jawab deta hai aur virtual MAC seekho:</p>
<pre class="out">SRV1$ ping -c 3 10.10.10.1
3 packets transmitted, 3 received, 0% packet loss
SRV1$ ip neigh
<span class="hl">10.10.10.1 dev bond0 lladdr 00:00:0c:07:ac:0a REACHABLE</span></pre>
<p>Phir lab NX2 ka state poochta hai: woh <b>Standby</b> hai. Yahi trick question hai: Standby, phir bhi apne links par 00:00:0c:07:ac:0a ke liye aane wala sab kuch route karta hai. Aakhir mein dono switches save karo aur dekho ki <code>show running-config</code> mein <code>hsrp 10</code> block <code>interface Vlan10</code> ke neeche nested kaise dikhta hai.</p>

<h3>vPC par VRRP</h3>
<p>VRRP vPC pair par waisa hi behave karta hai: Backup bhi virtual MAC par bheje frames forward karta hai. NX-OS syntax:</p>
<pre class="code">feature vrrp
interface vlan20
  vrrp 20
    address 10.20.20.1
    priority 110
    no shutdown</pre>

<div class="eg"><p><b>Worked example: failover timing.</b> NX1 (Active) ki power jaati hai. SRV1 ka bond lagbhag ek second mein eth0 slave gira deta hai (link down), isliye uske saare flows ab eth1 aur NX2 par hash hote hain, jo pehle se virtual MAC ke liye route kar raha tha. Routed traffic lagbhag turant chalta rehta hai. NX2 par HSRP ko NX1 ko mara ghoshit karke Active banne ke liye apna hold time chahiye, default 10 second, par woh sirf ARP replies ke liye matter karta hai. Isiliye vPC par HSRP timers ko shayad hi tuning chahiye, aur isiliye lab 5 phir bhi NX2 ke through 10.10.10.1 tak pahunchta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> NX-OS par <code>standby 10 ip 10.10.10.1</code> type karna; <code>feature hsrp</code> bhool jaana (<code>hsrp</code> command reject hota hai); peers ke beech HSRP group numbers ya VIPs mismatch (type-2 inconsistency aur do alag groups); aur peer-gateway bhool jaana, jiski jagah sirf HSRP virtual MAC nahi le sakta.</p></div>

<div class="exam"><p><b>Exam trap.</b> "vPC pair par HSRP virtual MAC par bheja traffic kaunsa router forward karta hai?" Dono, Active aur Standby. "VIP ke ARP ka jawab kaun deta hai?" Sirf Active.</p></div>

<div class="scn"><h4>Peer-link jo garam chal raha tha</h4><p>Ek company vPC pair par migrate hui par ek purani aadat rakhi: HSRP sirf ek peer par, aur kai VLANs mein doosre peer par koi SVI hi nahi. Monitoring ne backups ke dauraan peer-link ko 80% utilisation par dikhaya. SRV bonds jo bhi frame "bina SVI" wale peer par hash karte the, use akele router tak pahunchne ke liye peer-link cross karna padta tha. Dono peers par SVIs aur HSRP jodne ke baad peer-link utilisation kuch percent par aa gaya, aur backup time ek tihai kam ho gaya.</p><p><b>Seekh:</b> vPC par har vPC VLAN ko dono peers par SVI aur FHRP do taaki routing wahin ho jahan frame utarta hai.</p></div>

<div class="iv"><p class="q">"Normal pair ke comparison mein vPC pair par HSRP alag kaise behave karta hai?"</p><p>Strong answer: control plane same hai, priority aur preempt ke saath ek Active aur ek Standby, aur ARP ka jawab sirf Active deta hai. Par data plane active/active hai: dono vPC peers HSRP virtual MAC par bheje frames route karte hain, isliye Standby par hash hua traffic peer-link cross karne ki jagah locally route hota hai. Physical router MAC use karne wale devices ke liye peer-gateway jodo, HSRP Active ko vPC primary ke saath align karo, aur batao ki failover zyada tar bond par link-down se hota hai, HSRP timers se nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HSRP VIP aur virtual MAC deta hai (v1: 0000.0c07.acXX); VRRP 0000.5e00.01XX ke saath yahi karta hai.</li>
<li>vPC par dono peers virtual MAC par bheje frames route karte hain; ARP ka jawab sirf Active deta hai.</li>
<li>NX-OS syntax: <code>feature hsrp</code>, <code>hsrp 10</code>, <code>ip</code>, <code>priority</code>, <code>preempt</code>; <code>standby</code> command nahi hai.</li>
<li>Dono peers par SVIs aur FHRP configure karo, plus peer-gateway, aur HSRP Active ko vPC primary ke saath align karo.</li>
<li>Dono peers par <code>show hsrp brief</code> aur server par <code>ip neigh</code> se verify karo.</li>
</ul></div>
`}};export{e as default};