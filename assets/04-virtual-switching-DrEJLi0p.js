var e={id:`virtual-switching`,h:{en:`Virtual switches, port groups and VLAN tagging`,hi:`Virtual switches, port groups aur VLAN tagging`},body:{en:`
<p>An office floor has a small network cabinet: every desk cable ends on a patch panel, and a couple of thick cables run from the cabinet down to the building's main switch room. Inside a hypervisor there is the same arrangement in software. VMs plug into a <b>virtual switch</b> (the floor cabinet), and the server's physical network cards are the thick cables down to the real network.</p>

<h3>The pieces</h3>
<dl class="terms">
<dt>Virtual switch (vSwitch)</dt><dd>A Layer 2 switch implemented in the hypervisor. It learns the MACs of the vNICs connected to it and forwards frames between VMs, or out to the physical network. In the lab it is called <code>vSwitch0</code>.</dd>
<dt>Uplink</dt><dd>A physical NIC of the host bound to the vSwitch, named <code>vmnic0</code>, <code>vmnic1</code> and so on. Uplinks connect the vSwitch to a physical switch port.</dd>
<dt>Port group</dt><dd>A named set of virtual ports that share one policy, most importantly a <b>VLAN ID</b>. You attach a VM's vNIC to a port group, not to a numbered port.</dd>
</dl>

<h3>Just enough VLAN theory</h3>
<p>A <b>VLAN</b> splits one physical switch into several separate Layer 2 networks; hosts in VLAN 10 do not see broadcasts from VLAN 20, and traffic between them must go through a router. A link that carries several VLANs is a <b>trunk</b>; each frame on it carries an <b>802.1Q tag</b>, a 4-byte field holding the 12-bit VLAN ID. Frames in the trunk's <b>native VLAN</b> (VLAN 1 by default) are sent untagged. The VLAN module later in this course covers all of this in depth.</p>

<h3>How a port group tags traffic</h3>
<p>With a VLAN ID set on the port group, the <b>virtual switch does the tagging</b> (VMware calls this Virtual Switch Tagging, VST). The VM sends and receives normal untagged frames and has no idea VLANs exist. When a frame leaves on the uplink, the vSwitch adds the 802.1Q tag; when a tagged frame arrives, it strips the tag and delivers it only to vNICs in the matching port group.</p>
<ul>
<li><b>VLAN ID 1 to 4094</b>: VST, the normal choice. The physical switch port must be a <b>trunk</b> allowing those VLANs.</li>
<li><b>VLAN ID 0 (none)</b>: frames leave <b>untagged</b>. They land in the access VLAN of the physical port, or in the native VLAN of a trunk. VMware calls this External Switch Tagging.</li>
<li><b>VLAN ID 4095</b> on VMware: the port group passes tags through to the VM, which tags frames itself (Virtual Guest Tagging), used for virtual routers and firewalls. The lab host does not support it.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab 1 topology with tags">
<rect x="250" y="16" width="140" height="40" rx="8" fill="#fed7aa"/><text x="320" y="41" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0.10, .20</text>
<line x1="320" y1="56" x2="320" y2="96" stroke="#64748b" stroke-width="3"/><text x="330" y="80" class="svg-muted" font-size="12">trunk 10,20</text>
<rect x="250" y="96" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="320" y1="136" x2="320" y2="176" stroke="#64748b" stroke-width="3"/><text x="330" y="160" class="svg-muted" font-size="12">Gi0/1 trunk to vmnic0</text>
<rect x="150" y="176" width="340" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">HV1 vSwitch0</text><text x="240" y="220" text-anchor="middle" class="svg-muted" font-size="12">PG-Web VLAN 10</text><text x="400" y="220" text-anchor="middle" class="svg-muted" font-size="12">PG-DB VLAN 20</text>
<line x1="240" y1="232" x2="200" y2="258" stroke="#64748b" stroke-width="2"/><line x1="400" y1="232" x2="440" y2="258" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="258" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="200" y="280" text-anchor="middle" class="svg-ink" font-size="12">WEB 10.10.10.11</text>
<rect x="370" y="258" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="440" y="280" text-anchor="middle" class="svg-ink" font-size="12">DB 10.20.20.12</text>
<text x="560" y="206" text-anchor="middle" class="svg-accent" font-size="12">untagged from VMs</text><text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">tagged on uplink</text>
</svg><p class="cap">Lab 1: VMs send untagged frames; the vSwitch tags 10 or 20 on vmnic0; SW1 trunks to R1, which routes between the VLANs.</p></div>

<h3>Lab walkthrough, step 1: port groups and VMs</h3>
<pre class="code"><span class="c">! on the hypervisor shell of HV1</span>
HV1:~# vswitch portgroup add PG-Web vlan 10
Port group PG-Web added to vSwitch0 (VLAN 10)
HV1:~# vswitch portgroup add PG-DB vlan 20
Port group PG-DB added to vSwitch0 (VLAN 20)
HV1:~# vm set WEB portgroup PG-Web
Network adapter 1 of WEB -&gt; PG-Web (VLAN 10)
HV1:~# vm set DB portgroup PG-DB
Network adapter 1 of DB -&gt; PG-DB (VLAN 20)
HV1:~# vm power on DB
Powering on VM DB... done</pre>
<p>On real VMware ESXi the same port group is created with <code>esxcli network vswitch standard portgroup add --portgroup-name=PG-Web --vswitch-name=vSwitch0</code> and tagged with <code>esxcli network vswitch standard portgroup set -p PG-Web --vlan-id 10</code>, or with a few clicks in the vSphere client.</p>
<pre class="out">HV1:~# vswitch show
Switch Name      Num Ports   Used Ports  MTU     Uplinks
vSwitch0         6           4           1500    vmnic0, vmnic1

   PortGroup Name        VLAN ID    Used Ports  Uplinks
   VM-Network            0 (none)   0           vmnic0, vmnic1
<span class="hl">   PG-Web                10         1           vmnic0, vmnic1
   PG-DB                 20         1           vmnic0, vmnic1</span>

   Uplink   Link   Physical switch port        Tagging
<span class="hl">   vmnic0   Up     SW1 Gi0/1                   peer port is access (tagged VLANs will be lost)</span>
   vmnic1   Down   -                           -</pre>
<p>The host is ready, but the last section warns you: SW1 Gi0/1 is still an access port.</p>

<h3>Step 2: the physical trunk</h3>
<p>A vSwitch does <b>not</b> speak DTP, the Cisco protocol that negotiates trunks, so a switch port left in its default dynamic mode stays an access port and drops tagged frames. Configure the trunk statically, and allow only the VLANs the host needs:</p>
<pre class="code">SW1(config)# vlan 10
SW1(config-vlan)# vlan 20
SW1(config-vlan)# interface range g0/0 - 1
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport trunk allowed vlan 10,20
SW1(config-if-range)# end</pre>
<pre class="out">SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
<span class="hl">Gi0/1       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Gi0/0       10,20
<span class="hl">Gi0/1       10,20</span></pre>

<h3>Step 3: the gateway (router-on-a-stick)</h3>
<pre class="code">R1(config)# interface g0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 10.10.10.1 255.255.255.0
R1(config-subif)# interface g0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 10.20.20.1 255.255.255.0</pre>
<pre class="out">WEB&gt; ping 10.20.20.12
<span class="hl">84 bytes from 10.20.20.12 icmp_seq=1 ttl=63 time=2.114 ms</span>

SW1# show mac address-table
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    5254.003a.7c11    DYNAMIC     Gi0/1
  20    5254.003a.7c12    DYNAMIC     Gi0/1</span></pre>
<p>TTL 63 proves the packet was routed once, by R1. And both VM MACs, in two VLANs, are learned on the same physical port Gi0/1: many VMs, many VLANs, one port. That is why a server-facing port is a trunk.</p>

<div class="eg"><p><b>Worked example.</b> Two VMs on the same host in PG-Web talk to each other: the frame never leaves the server; the vSwitch switches it internally, and SW1 never sees it. WEB talks to DB: the frame leaves vmnic0 tagged 10, R1 routes it to VLAN 20, it comes back down the same trunk tagged 20, and the vSwitch delivers it to DB. One cable, crossed twice.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving a server port in <code>dynamic auto</code> or as an access port. The host shows its uplink "Up", but every tagged VLAN is dropped. The opposite mistake also happens: a trunk that allows VLAN 10 but not VLAN 20 breaks only some VMs.</p></div>

<div class="exam"><p><b>Exam trap.</b> A standard virtual switch does <b>not run STP</b> and never forwards a frame received on one uplink out of another uplink, so it cannot create a loop. The physical switch still runs STP; enable PortFast (trunk) on host-facing ports so they forward immediately.</p></div>

<div class="scn"><h4>Half the VMs vanished</h4><p>After a switch replacement, VMs in VLANs 10 and 30 worked but those in VLAN 20 could not reach anything. The new switch had been configured from an old template with <code>switchport trunk allowed vlan 10,30</code>. <code>show interfaces trunk</code> made it obvious, and <code>switchport trunk allowed vlan add 20</code> fixed it without touching the other VLANs.</p><p><b>Lesson:</b> the allowed list on the host-facing trunk must include every port-group VLAN on that host, on every host of the cluster.</p></div>

<div class="iv"><p class="q">"A VM is in a port group with VLAN ID 20. Walk me through how its frames reach the physical network."</p><p>The VM sends an untagged frame to its vNIC. The vSwitch places it in VLAN 20 because of the port group, and sends it out an active uplink with an 802.1Q tag 20. The physical switch port must be a static trunk allowing VLAN 20, because the vSwitch does not negotiate DTP. Return traffic arrives tagged 20, the tag is removed and the frame is delivered only to vNICs in that port group. Mention VLAN 0 = untagged and 4095 = guest tagging on VMware.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A vSwitch connects vNICs to uplinks (vmnic0, vmnic1); VMs attach to port groups that carry a VLAN ID.</li>
<li>With a VLAN ID set, the vSwitch adds and removes 802.1Q tags; the VM sends untagged frames.</li>
<li>VLAN 0 = untagged; VLAN 4095 on VMware = the guest tags frames itself.</li>
<li>The physical port must be a static trunk (no DTP) allowing every port-group VLAN.</li>
<li>A vSwitch runs no STP and cannot loop; traffic between VMs in one port group on one host stays inside the host.</li>
</ul></div>
`,hi:`
<p>Office floor par ek chhota network cabinet hota hai: har desk ka cable patch panel par khatam hota hai, aur cabinet se building ke main switch room tak kuch mote cables jaate hain. Hypervisor ke andar software mein yahi arrangement hota hai. VMs ek <b>virtual switch</b> (floor cabinet) mein plug hoti hain, aur server ke physical network cards asli network tak jaane wale mote cables hain.</p>

<h3>Pieces</h3>
<dl class="terms">
<dt>Virtual switch (vSwitch)</dt><dd>Hypervisor mein bana Layer 2 switch. Yeh apne se jude vNICs ke MACs learn karta hai aur frames ko VMs ke beech, ya bahar physical network par forward karta hai. Lab mein iska naam <code>vSwitch0</code> hai.</dd>
<dt>Uplink</dt><dd>Host ka physical NIC jo vSwitch se bound hai, naam <code>vmnic0</code>, <code>vmnic1</code> waghera. Uplinks vSwitch ko physical switch port se jodte hain.</dd>
<dt>Port group</dt><dd>Virtual ports ka naam wala set jo ek policy share karta hai, sabse zaroori ek <b>VLAN ID</b>. Aap VM ka vNIC kisi numbered port se nahi, port group se jodte ho.</dd>
</dl>

<h3>Bas zaroorat bhar VLAN theory</h3>
<p><b>VLAN</b> ek physical switch ko kai alag Layer 2 networks mein baant deta hai; VLAN 10 ke hosts VLAN 20 ke broadcasts nahi dekhte, aur unke beech ka traffic router se hokar jaana chahiye. Jo link kai VLANs carry karta hai woh <b>trunk</b> hai; uspar har frame ek <b>802.1Q tag</b> le jaata hai, ek 4-byte field jismein 12-bit VLAN ID hota hai. Trunk ke <b>native VLAN</b> (default VLAN 1) ke frames untagged bheje jaate hain. Is course ka VLAN module baad mein yeh sab detail mein cover karta hai.</p>

<h3>Port group traffic ko kaise tag karta hai</h3>
<p>Port group par VLAN ID set hone par <b>tagging virtual switch karta hai</b> (VMware ise Virtual Switch Tagging, VST kehta hai). VM normal untagged frames bhejti aur receive karti hai aur use pata bhi nahi ki VLANs exist karte hain. Jab frame uplink se nikalta hai, vSwitch 802.1Q tag jodta hai; jab tagged frame aata hai, woh tag hata kar use sirf matching port group ke vNICs ko deliver karta hai.</p>
<ul>
<li><b>VLAN ID 1 se 4094</b>: VST, normal choice. Physical switch port ek <b>trunk</b> hona chahiye jo un VLANs ko allow kare.</li>
<li><b>VLAN ID 0 (none)</b>: frames <b>untagged</b> nikalte hain. Woh physical port ke access VLAN mein, ya trunk ke native VLAN mein pahunchte hain. VMware ise External Switch Tagging kehta hai.</li>
<li>VMware par <b>VLAN ID 4095</b>: port group tags ko VM tak pass karta hai, jo khud frames tag karti hai (Virtual Guest Tagging), virtual routers aur firewalls ke liye use hota hai. Lab host ise support nahi karta.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Tags ke saath Lab 1 topology">
<rect x="250" y="16" width="140" height="40" rx="8" fill="#fed7aa"/><text x="320" y="41" text-anchor="middle" class="svg-ink" font-size="13">R1 Gi0/0.10, .20</text>
<line x1="320" y1="56" x2="320" y2="96" stroke="#64748b" stroke-width="3"/><text x="330" y="80" class="svg-muted" font-size="12">trunk 10,20</text>
<rect x="250" y="96" width="140" height="40" rx="8" fill="#bae6fd"/><text x="320" y="121" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="320" y1="136" x2="320" y2="176" stroke="#64748b" stroke-width="3"/><text x="330" y="160" class="svg-muted" font-size="12">Gi0/1 trunk, vmnic0 tak</text>
<rect x="150" y="176" width="340" height="56" rx="8" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">HV1 vSwitch0</text><text x="240" y="220" text-anchor="middle" class="svg-muted" font-size="12">PG-Web VLAN 10</text><text x="400" y="220" text-anchor="middle" class="svg-muted" font-size="12">PG-DB VLAN 20</text>
<line x1="240" y1="232" x2="200" y2="258" stroke="#64748b" stroke-width="2"/><line x1="400" y1="232" x2="440" y2="258" stroke="#64748b" stroke-width="2"/>
<rect x="130" y="258" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="200" y="280" text-anchor="middle" class="svg-ink" font-size="12">WEB 10.10.10.11</text>
<rect x="370" y="258" width="140" height="34" rx="8" fill="#bbf7d0"/><text x="440" y="280" text-anchor="middle" class="svg-ink" font-size="12">DB 10.20.20.12</text>
<text x="560" y="206" text-anchor="middle" class="svg-accent" font-size="12">VMs se untagged</text><text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">uplink par tagged</text>
</svg><p class="cap">Lab 1: VMs untagged frames bhejti hain; vSwitch vmnic0 par 10 ya 20 tag karta hai; SW1 R1 tak trunk karta hai, jo VLANs ke beech route karta hai.</p></div>

<h3>Lab walkthrough, step 1: port groups aur VMs</h3>
<pre class="code"><span class="c">! HV1 ke hypervisor shell par</span>
HV1:~# vswitch portgroup add PG-Web vlan 10
Port group PG-Web added to vSwitch0 (VLAN 10)
HV1:~# vswitch portgroup add PG-DB vlan 20
Port group PG-DB added to vSwitch0 (VLAN 20)
HV1:~# vm set WEB portgroup PG-Web
Network adapter 1 of WEB -&gt; PG-Web (VLAN 10)
HV1:~# vm set DB portgroup PG-DB
Network adapter 1 of DB -&gt; PG-DB (VLAN 20)
HV1:~# vm power on DB
Powering on VM DB... done</pre>
<p>Asli VMware ESXi par same port group <code>esxcli network vswitch standard portgroup add --portgroup-name=PG-Web --vswitch-name=vSwitch0</code> se banta hai aur <code>esxcli network vswitch standard portgroup set -p PG-Web --vlan-id 10</code> se tag hota hai, ya vSphere client mein kuch clicks se.</p>
<pre class="out">HV1:~# vswitch show
Switch Name      Num Ports   Used Ports  MTU     Uplinks
vSwitch0         6           4           1500    vmnic0, vmnic1

   PortGroup Name        VLAN ID    Used Ports  Uplinks
   VM-Network            0 (none)   0           vmnic0, vmnic1
<span class="hl">   PG-Web                10         1           vmnic0, vmnic1
   PG-DB                 20         1           vmnic0, vmnic1</span>

   Uplink   Link   Physical switch port        Tagging
<span class="hl">   vmnic0   Up     SW1 Gi0/1                   peer port is access (tagged VLANs will be lost)</span>
   vmnic1   Down   -                           -</pre>
<p>Host tayyar hai, par aakhri section chetavni deta hai: SW1 Gi0/1 abhi bhi access port hai.</p>

<h3>Step 2: physical trunk</h3>
<p>vSwitch DTP <b>nahi</b> bolta, woh Cisco protocol jo trunks negotiate karta hai, isliye default dynamic mode mein chhoda gaya switch port access port hi rehta hai aur tagged frames drop karta hai. Trunk ko statically configure karo, aur sirf wahi VLANs allow karo jo host ko chahiye:</p>
<pre class="code">SW1(config)# vlan 10
SW1(config-vlan)# vlan 20
SW1(config-vlan)# interface range g0/0 - 1
SW1(config-if-range)# switchport mode trunk
SW1(config-if-range)# switchport trunk allowed vlan 10,20
SW1(config-if-range)# end</pre>
<pre class="out">SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
<span class="hl">Gi0/1       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Gi0/0       10,20
<span class="hl">Gi0/1       10,20</span></pre>

<h3>Step 3: gateway (router-on-a-stick)</h3>
<pre class="code">R1(config)# interface g0/0.10
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 10.10.10.1 255.255.255.0
R1(config-subif)# interface g0/0.20
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 10.20.20.1 255.255.255.0</pre>
<pre class="out">WEB&gt; ping 10.20.20.12
<span class="hl">84 bytes from 10.20.20.12 icmp_seq=1 ttl=63 time=2.114 ms</span>

SW1# show mac address-table
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
<span class="hl">  10    5254.003a.7c11    DYNAMIC     Gi0/1
  20    5254.003a.7c12    DYNAMIC     Gi0/1</span></pre>
<p>TTL 63 saabit karta hai ki packet ek baar, R1 dwara, route hua. Aur dono VM MACs, do VLANs mein, same physical port Gi0/1 par learn hote hain: kai VMs, kai VLANs, ek port. Isi liye server ki taraf wala port trunk hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Same host par PG-Web ki do VMs aapas mein baat karti hain: frame kabhi server se bahar nahi jaata; vSwitch use andar hi switch kar deta hai, aur SW1 use kabhi nahi dekhta. WEB DB se baat karti hai: frame vmnic0 se tag 10 ke saath nikalta hai, R1 use VLAN 20 mein route karta hai, woh usi trunk se tag 20 ke saath wapas aata hai, aur vSwitch use DB ko deliver karta hai. Ek cable, do baar cross.</p></div>

<div class="warn"><p><b>Common galti.</b> Server port ko <code>dynamic auto</code> mein ya access port ki tarah chhod dena. Host apna uplink "Up" dikhata hai, par har tagged VLAN drop hota hai. Ulti galti bhi hoti hai: trunk jo VLAN 10 allow karta hai par VLAN 20 nahi, sirf kuch VMs ko todta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Standard virtual switch <b>STP nahi chalata</b> aur ek uplink par aaya frame kabhi doosre uplink se bahar forward nahi karta, isliye loop nahi bana sakta. Physical switch phir bhi STP chalata hai; host ki taraf wale ports par PortFast (trunk) enable karo taaki woh turant forward karein.</p></div>

<div class="scn"><h4>Aadhi VMs gayab</h4><p>Switch replacement ke baad VLANs 10 aur 30 ki VMs chal rahi thi par VLAN 20 wali kahin nahi pahunch pa rahi thi. Naya switch purane template se <code>switchport trunk allowed vlan 10,30</code> ke saath configure hua tha. <code>show interfaces trunk</code> ne sab saaf kar diya, aur <code>switchport trunk allowed vlan add 20</code> ne baaki VLANs ko chhue bina ise theek kar diya.</p><p><b>Seekh:</b> host ki taraf wale trunk ki allowed list mein us host ka har port-group VLAN hona chahiye, cluster ke har host par.</p></div>

<div class="iv"><p class="q">"Ek VM VLAN ID 20 wale port group mein hai. Batao uske frames physical network tak kaise pahunchte hain."</p><p>VM apne vNIC ko untagged frame bhejti hai. vSwitch port group ki wajah se use VLAN 20 mein rakhta hai, aur active uplink se 802.1Q tag 20 ke saath bhejta hai. Physical switch port VLAN 20 allow karne wala static trunk hona chahiye, kyunki vSwitch DTP negotiate nahi karta. Return traffic tag 20 ke saath aata hai, tag hataya jaata hai aur frame sirf us port group ke vNICs ko deliver hota hai. VMware par VLAN 0 = untagged aur 4095 = guest tagging mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>vSwitch vNICs ko uplinks (vmnic0, vmnic1) se jodta hai; VMs VLAN ID wale port groups se judti hain.</li>
<li>VLAN ID set hone par vSwitch 802.1Q tags jodta aur hatata hai; VM untagged frames bhejti hai.</li>
<li>VLAN 0 = untagged; VMware par VLAN 4095 = guest khud frames tag karta hai.</li>
<li>Physical port static trunk (no DTP) hona chahiye jo har port-group VLAN allow kare.</li>
<li>vSwitch STP nahi chalata aur loop nahi bana sakta; ek host par ek port group ki VMs ka traffic host ke andar hi rehta hai.</li>
</ul></div>
`}};export{e as default};