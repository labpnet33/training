var e={id:`lacp-fhrp`,h:{en:`Link aggregation (LACP) and first-hop redundancy (HSRP, VRRP)`,hi:`Link aggregation (LACP) aur first-hop redundancy (HSRP, VRRP)`},body:{en:`
<p>Two small problems, one big idea: <b>make two things look like one</b>. First, you cable two links between switches, but spanning tree blocks one. Bundle them into a single logical link and both carry traffic. Second, a server has only one default gateway address; if that router dies, the server is stranded. Share one virtual gateway address between two routers and the server never notices a failure. This chapter covers both, and previews how the data center goes further with vPC and anycast gateway.</p>

<h3>Link aggregation and LACP</h3>
<p>A <b>port-channel</b> (EtherChannel, LAG, bond) combines several physical links into one logical interface. STP sees one link, so nothing is blocked; bandwidth adds up; and if a member fails, traffic moves to the others in milliseconds. Members must match in speed, duplex, switchport mode, allowed VLANs and native VLAN; otherwise NX-OS <b>suspends</b> the mismatched member.</p>
<p><b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, now 802.1AX) negotiates the bundle by exchanging <b>LACPDUs</b>. It detects mis-cabling (a member plugged into the wrong switch) and one-way links, which a static bundle cannot.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>Forms a bundle with</th></tr>
<tr><td>active</td><td>Sends LACPDUs</td><td>active or passive</td></tr>
<tr><td>passive</td><td>Only answers LACPDUs</td><td>active only (passive + passive never forms)</td></tr>
<tr><td>on</td><td>Static, no LACP</td><td>on only; risky, no mis-cabling detection</td></tr></table>

<pre class="code"><span class="c">! LACP modes need the feature first</span>
LEAF1(config)# feature lacp
LEAF1(config)# interface Ethernet1/1-2
LEAF1(config-if-range)# switchport
LEAF1(config-if-range)# switchport mode trunk
LEAF1(config-if-range)# switchport trunk allowed vlan 10,20
LEAF1(config-if-range)# channel-group 10 mode active
LEAF1(config-if-range)# no shutdown
<span class="c">! the logical interface: configure it like any trunk</span>
LEAF1(config)# interface port-channel10
LEAF1(config-if)# switchport mode trunk
LEAF1(config-if)# switchport trunk allowed vlan 10,20
LEAF1(config-if)# lacp min-links 2</pre>
<pre class="out">LEAF1# show port-channel summary
Flags:  D - Down        P - Up in port-channel (members)
        I - Individual  H - Hot-standby (LACP only)
        s - Suspended   S - Switched    R - Routed
        U - Up (port-channel)
--------------------------------------------------------------------------------
Group Port-       Type     Protocol  Member Ports
      Channel
--------------------------------------------------------------------------------
<span class="hl">10    Po10(SU)    Eth      LACP      Eth1/1(P)    Eth1/2(P)</span></pre>
<p><b>SU</b> = switched and up; <b>(P)</b> = member bundled. Watch for <b>(I)</b> individual (no LACP partner, often passive on both sides) and <b>(s)</b> suspended (configuration mismatch). <code>show lacp neighbor</code> shows the partner's system ID, so you can prove both members go to the same switch.</p>

<h3>How traffic is spread</h3>
<p>Like ECMP, a port-channel <b>hashes each flow</b> onto one member, so packet order is preserved. On Nexus the default hash uses source and destination IP and L4 ports; you can view it with <code>show port-channel load-balance</code> and change it with <code>port-channel load-balance</code>. One flow never exceeds one member's speed.</p>

<div class="eg"><p><b>Worked example: capacity and failure.</b> A hypervisor uses a 2 × 25G LACP bond: 50 Gbit/s total, but a single vMotion stream (one flow) peaks at 25 Gbit/s. If one member fails, capacity halves to 25G while all flows survive. With <code>lacp min-links 2</code>, losing a member would take the whole port-channel down instead: useful when a half-capacity link is worse than rerouting elsewhere, such as on a spine uplink with ECMP alternatives.</p></div>

<h3>First-hop redundancy: HSRP and VRRP</h3>
<p>Two routers (or leaf SVIs) share a <b>virtual IP</b> (VIP) and a <b>virtual MAC</b>. Hosts use the VIP as their gateway. One router is <b>active</b> (HSRP) or <b>master</b> (VRRP) and answers ARP for the VIP with the virtual MAC; the other stands by and takes over when hellos stop.</p>
<table class="cmp"><tr><th></th><th>HSRP (Cisco)</th><th>VRRP (standard)</th></tr>
<tr><td>Roles</td><td>Active / standby</td><td>Master / backup</td></tr>
<tr><td>Virtual MAC</td><td>v1 0000.0c07.acXX, v2 0000.0c9f.fXXX</td><td>0000.5e00.01XX</td></tr>
<tr><td>Default priority</td><td>100 (higher wins)</td><td>100 (higher wins)</td></tr>
<tr><td>Preemption</td><td>Off by default</td><td>On by default</td></tr>
<tr><td>VIP can be a real interface IP</td><td>No</td><td>Yes (owner, priority 255)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="HSRP pair">
<rect x="90" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="175" y="40" text-anchor="middle" class="svg-ink" font-size="12">AGG1 Vlan10 .2</text><text x="175" y="56" text-anchor="middle" class="svg-accent" font-size="12">Active, prio 110</text>
<rect x="380" y="20" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="465" y="40" text-anchor="middle" class="svg-ink" font-size="12">AGG2 Vlan10 .3</text><text x="465" y="56" text-anchor="middle" class="svg-muted" font-size="12">Standby, prio 100</text>
<rect x="230" y="100" width="180" height="36" rx="18" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.10.10.1</text>
<line x1="175" y1="64" x2="280" y2="100" stroke="#64748b" stroke-width="3"/><line x1="465" y1="64" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<rect x="240" y="170" width="160" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">Server gw .1</text>
<line x1="320" y1="136" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The server only knows 10.10.10.1; whichever router is active answers for it.</p></div>

<pre class="code">AGG1(config)# feature hsrp
AGG1(config)# interface vlan 10
AGG1(config-if)# ip address 10.10.10.2/24
AGG1(config-if)# hsrp version 2
AGG1(config-if)# hsrp 10
AGG1(config-if-hsrp)# priority 110
AGG1(config-if-hsrp)# preempt
AGG1(config-if-hsrp)# ip 10.10.10.1</pre>
<pre class="out">AGG1# show hsrp brief
                     P indicates configured to preempt.
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   110  P Active   local            10.10.10.3       10.10.10.1</span></pre>

<h3>Preview: vPC and anycast gateway</h3>
<p>Classic HSRP is active/standby: only one router forwards for the VIP. In the data center two techniques go further. <b>vPC</b> (virtual port-channel) lets a server or switch build one LACP port-channel to <b>two</b> Nexus switches; with vPC, both HSRP peers forward traffic sent to the virtual MAC, so the gateway becomes active/active. In a VXLAN EVPN fabric, <b>distributed anycast gateway</b> goes all the way: <b>every leaf</b> hosts the same gateway IP and the same MAC (<code>fabric forwarding anycast-gateway-mac</code>), so a VM's first hop is always its local leaf, even after vMotion, with no FHRP hellos at all. Both have their own modules later in this track.</p>

<div class="warn"><p><b>Common mistakes.</b> LACP passive on both ends. Different allowed VLAN lists on members, so members get suspended. Using mode on towards a server team's bond that expects LACP. HSRP without preempt, so the preferred router never takes back the active role after a reboot.</p></div>
<div class="exam"><p><b>Exam tip.</b> LACP = 802.3ad/802.1AX; active + active or active + passive forms; <code>feature lacp</code> on NX-OS. Port-channels hash per flow. HSRP v2 MAC 0000.0c9f.fXXX, VRRP MAC 0000.5e00.01XX; HSRP preempt off by default, VRRP on. vPC gives active/active HSRP forwarding; anycast gateway puts the gateway on every leaf.</p></div>

<div class="scn"><h4>Server bond flapping every 90 seconds</h4><p>A new database server's bond kept going up and down. <code>show port-channel summary</code> on the leaf showed Eth1/21 as (P) and Eth1/22 as (I). <code>show lacp neighbor</code> listed a partner system ID only on Eth1/21. The server team checked: the second NIC was cabled to a different leaf because of a patch panel labelling error, so LACP correctly refused to bundle it, and the server's bond driver kept retrying. Moving the cable to the right port brought both members to (P).</p><p><b>Lesson:</b> LACP's partner check catches cabling mistakes that a static bundle would turn into a silent loop or black hole.</p></div>

<div class="iv"><p class="q">"What is the difference between LACP active, passive and on, and how does a port-channel share traffic?"</p><p>Strong answer: active sends LACPDUs, passive only replies, so at least one side must be active; on is static with no negotiation and no protection against mis-cabling. Traffic is hashed per flow onto one member, so one flow cannot exceed one link's speed. Mention member consistency, suspended state, <code>show port-channel summary</code>, and how vPC extends a port-channel across two switches.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A port-channel makes many links one: no STP blocking, more bandwidth, fast failover.</li>
<li>LACP modes: active/passive negotiate (at least one active); on is static and risky.</li>
<li>Traffic is hashed per flow; one flow uses one member.</li>
<li>HSRP/VRRP share a virtual IP and MAC so hosts keep one gateway through a router failure.</li>
<li>vPC gives active/active; anycast gateway puts the same gateway on every leaf.</li>
</ul></div>
`,hi:`
<p>Do chhoti problems, ek bada idea: <b>do cheezon ko ek jaisa dikhao</b>. Pehli, aap switches ke beech do links cable karte ho, lekin spanning tree ek ko block kar deta hai. Unhe ek logical link mein bundle karo aur dono traffic le jaate hain. Dusri, server ke paas sirf ek default gateway address hota hai; agar woh router mar jaaye, to server phans jaata hai. Ek virtual gateway address do routers ke beech share karo aur server ko failure ka pata hi nahi chalta. Yeh chapter dono cover karta hai, aur preview deta hai ki data center vPC aur anycast gateway ke saath aur aage kaise jaata hai.</p>

<h3>Link aggregation aur LACP</h3>
<p><b>Port-channel</b> (EtherChannel, LAG, bond) kai physical links ko ek logical interface mein jodta hai. STP ek link dekhta hai, isliye kuch block nahi hota; bandwidth judti hai; aur agar koi member fail ho, traffic milliseconds mein baaki par chala jaata hai. Members ka speed, duplex, switchport mode, allowed VLANs aur native VLAN match hona chahiye; warna NX-OS mismatched member ko <b>suspend</b> kar deta hai.</p>
<p><b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, ab 802.1AX) <b>LACPDUs</b> exchange karke bundle negotiate karta hai. Yeh mis-cabling (galat switch mein laga member) aur one-way links pakadta hai, jo static bundle nahi kar sakta.</p>
<table class="cmp"><tr><th>Mode</th><th>Behaviour</th><th>Kiske saath bundle banata hai</th></tr>
<tr><td>active</td><td>LACPDUs bhejta hai</td><td>active ya passive</td></tr>
<tr><td>passive</td><td>Sirf LACPDUs ka jawab deta hai</td><td>sirf active (passive + passive kabhi nahi banta)</td></tr>
<tr><td>on</td><td>Static, LACP nahi</td><td>sirf on; risky, mis-cabling detection nahi</td></tr></table>

<pre class="code"><span class="c">! LACP modes ko pehle feature chahiye</span>
LEAF1(config)# feature lacp
LEAF1(config)# interface Ethernet1/1-2
LEAF1(config-if-range)# switchport
LEAF1(config-if-range)# switchport mode trunk
LEAF1(config-if-range)# switchport trunk allowed vlan 10,20
LEAF1(config-if-range)# channel-group 10 mode active
LEAF1(config-if-range)# no shutdown
<span class="c">! logical interface: ise kisi bhi trunk ki tarah configure karo</span>
LEAF1(config)# interface port-channel10
LEAF1(config-if)# switchport mode trunk
LEAF1(config-if)# switchport trunk allowed vlan 10,20
LEAF1(config-if)# lacp min-links 2</pre>
<pre class="out">LEAF1# show port-channel summary
Flags:  D - Down        P - Up in port-channel (members)
        I - Individual  H - Hot-standby (LACP only)
        s - Suspended   S - Switched    R - Routed
        U - Up (port-channel)
--------------------------------------------------------------------------------
Group Port-       Type     Protocol  Member Ports
      Channel
--------------------------------------------------------------------------------
<span class="hl">10    Po10(SU)    Eth      LACP      Eth1/1(P)    Eth1/2(P)</span></pre>
<p><b>SU</b> = switched aur up; <b>(P)</b> = member bundled. <b>(I)</b> individual (koi LACP partner nahi, aksar dono sides passive) aur <b>(s)</b> suspended (configuration mismatch) par nazar rakho. <code>show lacp neighbor</code> partner ka system ID dikhata hai, jisse aap prove kar sakte ho ki dono members same switch par jaate hain.</p>

<h3>Traffic kaise baanta jaata hai</h3>
<p>ECMP ki tarah, port-channel <b>har flow ko hash</b> karke ek member par daalta hai, isliye packet order bana rehta hai. Nexus par default hash source aur destination IP aur L4 ports use karta hai; aap ise <code>show port-channel load-balance</code> se dekh sakte ho aur <code>port-channel load-balance</code> se badal sakte ho. Ek flow kabhi ek member ki speed se zyada nahi jaata.</p>

<div class="eg"><p><b>Worked example: capacity aur failure.</b> Ek hypervisor 2 × 25G LACP bond use karta hai: total 50 Gbit/s, lekin ek single vMotion stream (ek flow) 25 Gbit/s par peak karta hai. Agar ek member fail ho, capacity aadhi 25G ho jaati hai jabki saare flows bache rehte hain. <code>lacp min-links 2</code> ke saath, ek member khone par poora port-channel down ho jaayega: yeh tab kaam ka hai jab aadhi capacity wala link kahin aur reroute karne se bura ho, jaise ECMP alternatives wale spine uplink par.</p></div>

<h3>First-hop redundancy: HSRP aur VRRP</h3>
<p>Do routers (ya leaf SVIs) ek <b>virtual IP</b> (VIP) aur ek <b>virtual MAC</b> share karte hain. Hosts VIP ko apne gateway ki tarah use karte hain. Ek router <b>active</b> (HSRP) ya <b>master</b> (VRRP) hota hai aur VIP ke ARP ka jawab virtual MAC se deta hai; dusra standby rehta hai aur hellos rukne par kaam sambhal leta hai.</p>
<table class="cmp"><tr><th></th><th>HSRP (Cisco)</th><th>VRRP (standard)</th></tr>
<tr><td>Roles</td><td>Active / standby</td><td>Master / backup</td></tr>
<tr><td>Virtual MAC</td><td>v1 0000.0c07.acXX, v2 0000.0c9f.fXXX</td><td>0000.5e00.01XX</td></tr>
<tr><td>Default priority</td><td>100 (zyada jeet-ta hai)</td><td>100 (zyada jeet-ta hai)</td></tr>
<tr><td>Preemption</td><td>Default mein off</td><td>Default mein on</td></tr>
<tr><td>VIP real interface IP ho sakta hai</td><td>Nahi</td><td>Haan (owner, priority 255)</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="HSRP pair">
<rect x="90" y="20" width="170" height="44" rx="8" fill="#bae6fd"/><text x="175" y="40" text-anchor="middle" class="svg-ink" font-size="12">AGG1 Vlan10 .2</text><text x="175" y="56" text-anchor="middle" class="svg-accent" font-size="12">Active, prio 110</text>
<rect x="380" y="20" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="465" y="40" text-anchor="middle" class="svg-ink" font-size="12">AGG2 Vlan10 .3</text><text x="465" y="56" text-anchor="middle" class="svg-muted" font-size="12">Standby, prio 100</text>
<rect x="230" y="100" width="180" height="36" rx="18" fill="#fde68a"/><text x="320" y="123" text-anchor="middle" class="svg-ink" font-size="12">VIP 10.10.10.1</text>
<line x1="175" y1="64" x2="280" y2="100" stroke="#64748b" stroke-width="3"/><line x1="465" y1="64" x2="360" y2="100" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<rect x="240" y="170" width="160" height="36" rx="6" fill="#bbf7d0"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="12">Server gw .1</text>
<line x1="320" y1="136" x2="320" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Server sirf 10.10.10.1 jaanta hai; jo bhi router active hai woh uska jawab deta hai.</p></div>

<pre class="code">AGG1(config)# feature hsrp
AGG1(config)# interface vlan 10
AGG1(config-if)# ip address 10.10.10.2/24
AGG1(config-if)# hsrp version 2
AGG1(config-if)# hsrp 10
AGG1(config-if-hsrp)# priority 110
AGG1(config-if-hsrp)# preempt
AGG1(config-if-hsrp)# ip 10.10.10.1</pre>
<pre class="out">AGG1# show hsrp brief
                     P indicates configured to preempt.
 Interface   Grp  Prio P State    Active addr      Standby addr     Group addr
<span class="hl">  Vlan10     10   110  P Active   local            10.10.10.3       10.10.10.1</span></pre>

<h3>Preview: vPC aur anycast gateway</h3>
<p>Classic HSRP active/standby hai: VIP ke liye sirf ek router forward karta hai. Data center mein do techniques aur aage jaati hain. <b>vPC</b> (virtual port-channel) server ya switch ko <b>do</b> Nexus switches tak ek LACP port-channel banane deta hai; vPC ke saath dono HSRP peers virtual MAC par bheje gaye traffic ko forward karte hain, isliye gateway active/active ban jaata hai. VXLAN EVPN fabric mein <b>distributed anycast gateway</b> poora raasta tay karta hai: <b>har leaf</b> same gateway IP aur same MAC host karta hai (<code>fabric forwarding anycast-gateway-mac</code>), isliye VM ka first hop hamesha uska local leaf hota hai, vMotion ke baad bhi, bina kisi FHRP hellos ke. Dono ke apne modules is track mein aage hain.</p>

<div class="warn"><p><b>Common galtiyan.</b> Dono ends par LACP passive. Members par alag allowed VLAN lists, jisse members suspend ho jaate hain. Server team ke bond ki taraf mode on use karna jo LACP expect karta hai. Bina preempt ke HSRP, jisse preferred router reboot ke baad kabhi active role wapas nahi leta.</p></div>
<div class="exam"><p><b>Exam tip.</b> LACP = 802.3ad/802.1AX; active + active ya active + passive banta hai; NX-OS par <code>feature lacp</code>. Port-channels per flow hash karte hain. HSRP v2 MAC 0000.0c9f.fXXX, VRRP MAC 0000.5e00.01XX; HSRP preempt default off, VRRP on. vPC active/active HSRP forwarding deta hai; anycast gateway gateway ko har leaf par rakhta hai.</p></div>

<div class="scn"><h4>Har 90 seconds mein flap hota server bond</h4><p>Ek naye database server ka bond baar baar up-down ho raha tha. Leaf par <code>show port-channel summary</code> ne Eth1/21 ko (P) aur Eth1/22 ko (I) dikhaya. <code>show lacp neighbor</code> ne partner system ID sirf Eth1/21 par dikhaya. Server team ne check kiya: patch panel labelling error ki wajah se dusra NIC ek alag leaf se cabled tha, isliye LACP ne sahi mein use bundle karne se mana kiya, aur server ka bond driver retry karta raha. Cable ko sahi port par shift karne se dono members (P) ho gaye.</p><p><b>Seekh:</b> LACP ka partner check cabling galtiyan pakadta hai jinhe static bundle ek silent loop ya black hole mein badal deta.</p></div>

<div class="iv"><p class="q">"LACP active, passive aur on mein kya farak hai, aur port-channel traffic kaise share karta hai?"</p><p>Strong answer: active LACPDUs bhejta hai, passive sirf reply karta hai, isliye kam se kam ek side active honi chahiye; on bina negotiation ke static hai aur mis-cabling se koi protection nahi. Traffic per flow ek member par hash hota hai, isliye ek flow ek link ki speed se zyada nahi ho sakta. Member consistency, suspended state, <code>show port-channel summary</code>, aur vPC kaise port-channel ko do switches tak failata hai, iska zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port-channel kai links ko ek banata hai: STP blocking nahi, zyada bandwidth, fast failover.</li>
<li>LACP modes: active/passive negotiate karte hain (kam se kam ek active); on static aur risky hai.</li>
<li>Traffic per flow hash hota hai; ek flow ek member use karta hai.</li>
<li>HSRP/VRRP virtual IP aur MAC share karte hain taaki router failure ke dauraan hosts ka ek hi gateway rahe.</li>
<li>vPC active/active deta hai; anycast gateway same gateway ko har leaf par rakhta hai.</li>
</ul></div>
`}};export{e as default};