var e={id:`nxos-for-ios`,h:{en:`NX-OS for IOS engineers: your first routed uplink and OSPF`,hi:`IOS engineers ke liye NX-OS: aapka pehla routed uplink aur OSPF`},body:{en:`
<p>If you learned to drive in India and then rent a car in Germany, the rules of the road are the same but the steering wheel, the indicator stalk and the gear lever are on the other side. You spend the first hour switching on the wipers when you wanted to turn. NX-OS feels exactly like that to an IOS engineer: the networking is identical, the controls are slightly different. This chapter gives you the side-by-side map, then walks through the lab configuration line by line.</p>

<h3>Side by side: IOS versus NX-OS</h3>
<table class="cmp"><tr><th>Task</th><th>IOS / IOS XE</th><th>NX-OS</th></tr>
<tr><td>Use a protocol</td><td>Always available</td><td><code>feature ospf</code>, <code>feature bgp</code>, <code>feature interface-vlan</code>, <code>feature lacp</code>, <code>feature vpc</code>, <code>feature nv overlay</code> first</td></tr>
<tr><td>Interface names</td><td>GigabitEthernet0/1, TenGigabitEthernet1/0/1</td><td>Ethernet1/1 for every speed; mgmt0, loopback0, Vlan10, port-channel10, nve1</td></tr>
<tr><td>Routed port</td><td>Router ports are routed by default</td><td>Switch ports are usually Layer 2 by default: add <code>no switchport</code></td></tr>
<tr><td>IP address</td><td><code>ip address 10.1.1.1 255.255.255.254</code></td><td><code>ip address 10.1.1.1/31</code> (a dotted mask is accepted but shown as a prefix)</td></tr>
<tr><td>OSPF process</td><td><code>router ospf 1</code> + <code>network</code> statements</td><td><code>router ospf UNDERLAY</code> (a tag) + <code>ip router ospf UNDERLAY area 0.0.0.0</code> on each interface</td></tr>
<tr><td>Show one interface's config</td><td><code>show run interface Gi0/1</code></td><td><code>show running-config interface ethernet1/1</code></td></tr>
<tr><td>Show one protocol's config</td><td><code>show run | section router ospf</code></td><td><code>show running-config ospf</code></td></tr>
<tr><td>Show commands in config mode</td><td>Need <code>do</code></td><td>Run directly</td></tr>
<tr><td>Machine-readable output</td><td>Limited</td><td><code>show ip ospf neighbors | json</code> (also <code>| json-pretty</code>, <code>| xml</code>)</td></tr>
<tr><td>Safe rollback</td><td>Archive and configure replace</td><td><code>checkpoint NAME</code> and <code>rollback running-config checkpoint NAME</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td><td><code>copy running-config startup-config</code></td></tr>
<tr><td>Interface IP summary</td><td><code>show ip interface brief</code></td><td>Same, but default VRF only; add <code>vrf all</code> or <code>vrf management</code></td></tr></table>
<p>Two more habits: <code>where</code> shows your current configuration context, and <code>show running-config diff</code> shows what has changed since the last save.</p>

<h3>The lab, step by step</h3>
<p>Goal: LEAF1 joins SPINE1 over Ethernet1/1 as a routed /31 (10.1.1.1/31, spine side 10.1.1.0), gets loopback0 10.255.0.1/32, and runs OSPF process <code>UNDERLAY</code> in area 0.0.0.0 with a point-to-point network type.</p>

<h4>Step 1: enable the feature</h4>
<pre class="out">LEAF1(config)# router ospf UNDERLAY
                      ^
<span class="hl">% Invalid command at '^' marker.</span>
LEAF1(config)# show feature | include ospf
ospf                   1          disabled</pre>
<p>The command is unknown because the OSPF process is not loaded. This is the first NX-OS rule to remember: <b>when a command is rejected, check the feature first</b>.</p>
<pre class="code">configure terminal
feature ospf</pre>

<h4>Step 2: routed uplink and loopback</h4>
<pre class="code"><span class="c">! Make the uplink a routed /31</span>
interface Ethernet1/1
  description to SPINE1
  no switchport
  ip address 10.1.1.1/31
  no shutdown
<span class="c">! Stable router ID and future overlay source</span>
interface loopback0
  ip address 10.255.0.1/32</pre>
<p><code>no switchport</code> converts the port to Layer 3 (and removes any Layer-2 settings on it). The /31 needs no network or broadcast address, so both ends of the link use the two addresses 10.1.1.0 and 10.1.1.1. In production you would also add <code>mtu 9216</code> on both ends for the overlay.</p>

<h4>Step 3: OSPF</h4>
<pre class="code">router ospf UNDERLAY
  router-id 10.255.0.1
interface Ethernet1/1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback0
  ip router ospf UNDERLAY area 0.0.0.0
end</pre>
<p>Why <b>point-to-point</b>? On an Ethernet link OSPF defaults to the broadcast type, which elects a DR and BDR and waits up to the 40-second wait timer before forming adjacency. A fabric link has exactly two routers, so point-to-point skips the election, forms adjacency faster and produces a simpler database. Both ends must use the same type. Why a fixed <b>router-id</b>? So the ID never changes if an interface address changes; using loopback0's address is the convention.</p>

<h4>Step 4: verify</h4>
<pre class="out">LEAF1# show ip interface brief
IP Interface Status for VRF "default"(1)
Interface            IP Address      Interface Status
Lo0                  10.255.0.1      protocol-up/link-up/admin-up
<span class="hl">Eth1/1               10.1.1.1        protocol-up/link-up/admin-up</span>

LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:00:41 10.1.1.0        Eth1/1</span>

LEAF1# show ip ospf interface brief
 OSPF Process ID UNDERLAY VRF default
 Total number of interface: 2
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
<span class="hl"> Eth1/1                  2      0.0.0.0         40     P2P      1         up</span>

LEAF1# show ip route 10.255.0.11
10.255.0.11/32, ubest/mbest: 1/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/41], 00:00:38, ospf-UNDERLAY, intra</span>

LEAF1# ping 10.255.0.11
64 bytes from 10.255.0.11: icmp_seq=0 ttl=254 time=1.2 ms</pre>
<p>Read the key lines: <b>FULL/ -</b> means a full adjacency with no DR role (the dash is normal on point-to-point). <b>P2P</b> confirms the network type. The spine loopback appears as an <b>intra-area OSPF route</b>; the cost 41 is 40 for this 1G lab link (NX-OS reference bandwidth is 40G) plus 1 for the loopback.</p>

<h4>Step 5: save, and use checkpoints</h4>
<pre class="code">copy running-config startup-config
<span class="c">! Before your next risky change:</span>
checkpoint BEFORE-BGP
<span class="c">! If it goes wrong:</span>
rollback running-config checkpoint BEFORE-BGP</pre>
<p>Tip: <code>write memory</code> is not an NX-OS command. Many engineers create an alias with <code>cli alias name wr copy running-config startup-config</code>.</p>

<h3>Common gotchas for IOS engineers</h3>
<ul>
<li><b>Feature not enabled</b>: "% Invalid command". Check <code>show feature</code>.</li>
<li><b>Forgot <code>no switchport</code></b>: the IP address command is refused on a Layer-2 port.</li>
<li><b>MTU mismatch</b>: OSPF checks MTU in its database exchange, so the adjacency sticks in EXSTART or EXCHANGE.</li>
<li><b>Network type mismatch</b>: one side point-to-point, the other broadcast; the adjacency may form but routes do not appear correctly.</li>
<li><b>Wrong VRF</b>: <code>show ip interface brief</code> does not list mgmt0; pings to management hosts need <code>vrf management</code>.</li>
<li><b><code>no feature ospf</code></b> wipes the whole OSPF configuration.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Typing IOS-style <code>network 10.1.1.0 0.0.0.1 area 0</code> under the OSPF process (not supported on NX-OS). Forgetting to put loopback0 into OSPF, so the spine cannot reach it. Leaving the changes unsaved before a reload.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS: enable features first; interfaces are Ethernet slot/port; <code>no switchport</code> for Layer 3; prefix-length addressing; OSPF enabled per interface with a process tag; save with <code>copy running-config startup-config</code>; checkpoints and rollback are built in; <code>| json</code> gives structured output.</p></div>

<div class="scn"><h4>Stuck in EXSTART</h4><p>A new leaf, LEAF9, was cabled to SPINE2. The interfaces were up and pings across the /31 worked, but OSPF never reached FULL. <code>show ip ospf neighbors</code> showed the spine in <code>EXSTART/ -</code> for minutes. The engineer compared <code>show interface ethernet1/2</code> on both sides: LEAF9 had <code>MTU 9216 bytes</code> from the fabric template, but the new SPINE2 port was still at <code>MTU 1500 bytes</code>. OSPF database description packets carry the interface MTU, and the side with the smaller MTU rejects a neighbor that advertises a bigger one. Setting <code>mtu 9216</code> on the spine port brought the adjacency to FULL within seconds. The engineer did not use <code>ip ospf mtu-ignore</code>, because that would hide a real problem for the future VXLAN overlay.</p><p><b>Lesson:</b> an OSPF neighbor stuck in EXSTART or EXCHANGE on NX-OS is almost always an MTU mismatch; fix the MTU, do not mask it.</p></div>

<div class="iv"><p class="q">"You have strong IOS experience. What are the first things that catch people out on NX-OS?"</p><p>Strong answer: features must be enabled before their commands exist; switch ports are Layer 2 by default so routed links need <code>no switchport</code>; addresses use prefix length; OSPF has no network statements and is enabled per interface with a process tag; mgmt0 is in the management VRF; save with <code>copy running-config startup-config</code>. Then show depth: use point-to-point OSPF on /31 fabric links, set a router-id from loopback0, take a <code>checkpoint</code> before changes, and use <code>| json</code> for automation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Enable the feature first; a rejected command usually means a missing feature.</li>
<li>Routed uplink = <code>no switchport</code> + <code>ip address x/31</code> + <code>no shutdown</code>.</li>
<li>OSPF: <code>router ospf TAG</code>, fixed router-id, then <code>ip router ospf TAG area 0.0.0.0</code> and point-to-point on each fabric interface.</li>
<li>Verify with <code>show ip ospf neighbors</code> (FULL), <code>show ip route</code> and ping to the spine loopback.</li>
<li>Save with <code>copy running-config startup-config</code>; use checkpoints, <code>| json</code> and <code>show running-config ospf</code>.</li>
</ul></div>
`,hi:`
<p>Agar aapne India mein gaadi chalana seekha aur phir Germany mein car rent ki, to sadak ke rules same hain lekin steering, indicator ka lever aur gear dusri taraf hain. Pehle ghante aap mudna chahte ho aur wipers on kar dete ho. IOS engineer ko NX-OS bilkul aisa hi lagta hai: networking same hai, controls thode alag hain. Yeh chapter aapko side-by-side map deta hai, phir lab configuration ko line by line karwata hai.</p>

<h3>Side by side: IOS vs NX-OS</h3>
<table class="cmp"><tr><th>Kaam</th><th>IOS / IOS XE</th><th>NX-OS</th></tr>
<tr><td>Protocol use karna</td><td>Hamesha available</td><td>Pehle <code>feature ospf</code>, <code>feature bgp</code>, <code>feature interface-vlan</code>, <code>feature lacp</code>, <code>feature vpc</code>, <code>feature nv overlay</code></td></tr>
<tr><td>Interface names</td><td>GigabitEthernet0/1, TenGigabitEthernet1/0/1</td><td>Har speed ke liye Ethernet1/1; mgmt0, loopback0, Vlan10, port-channel10, nve1</td></tr>
<tr><td>Routed port</td><td>Router ports default se routed hote hain</td><td>Switch ports aam taur par default se Layer 2 hote hain: <code>no switchport</code> jodo</td></tr>
<tr><td>IP address</td><td><code>ip address 10.1.1.1 255.255.255.254</code></td><td><code>ip address 10.1.1.1/31</code> (dotted mask accept hota hai lekin prefix ki tarah dikhta hai)</td></tr>
<tr><td>OSPF process</td><td><code>router ospf 1</code> + <code>network</code> statements</td><td><code>router ospf UNDERLAY</code> (ek tag) + har interface par <code>ip router ospf UNDERLAY area 0.0.0.0</code></td></tr>
<tr><td>Ek interface ka config dekhna</td><td><code>show run interface Gi0/1</code></td><td><code>show running-config interface ethernet1/1</code></td></tr>
<tr><td>Ek protocol ka config dekhna</td><td><code>show run | section router ospf</code></td><td><code>show running-config ospf</code></td></tr>
<tr><td>Config mode mein show commands</td><td><code>do</code> chahiye</td><td>Seedhe chalao</td></tr>
<tr><td>Machine-readable output</td><td>Limited</td><td><code>show ip ospf neighbors | json</code> (<code>| json-pretty</code>, <code>| xml</code> bhi)</td></tr>
<tr><td>Safe rollback</td><td>Archive aur configure replace</td><td><code>checkpoint NAME</code> aur <code>rollback running-config checkpoint NAME</code></td></tr>
<tr><td>Save</td><td><code>write memory</code></td><td><code>copy running-config startup-config</code></td></tr>
<tr><td>Interface IP summary</td><td><code>show ip interface brief</code></td><td>Same, lekin sirf default VRF; <code>vrf all</code> ya <code>vrf management</code> jodo</td></tr></table>
<p>Do aur aadatein: <code>where</code> aapka current configuration context dikhata hai, aur <code>show running-config diff</code> dikhata hai ki last save ke baad kya badla hai.</p>

<h3>Lab, step by step</h3>
<p>Goal: LEAF1 Ethernet1/1 par routed /31 (10.1.1.1/31, spine side 10.1.1.0) ki tarah SPINE1 se jude, loopback0 10.255.0.1/32 le, aur point-to-point network type ke saath area 0.0.0.0 mein OSPF process <code>UNDERLAY</code> chalaye.</p>

<h4>Step 1: feature enable karo</h4>
<pre class="out">LEAF1(config)# router ospf UNDERLAY
                      ^
<span class="hl">% Invalid command at '^' marker.</span>
LEAF1(config)# show feature | include ospf
ospf                   1          disabled</pre>
<p>Command unknown hai kyunki OSPF process load nahi hua. Yeh NX-OS ka pehla rule hai jo yaad rakhna hai: <b>jab command reject ho, pehle feature check karo</b>.</p>
<pre class="code">configure terminal
feature ospf</pre>

<h4>Step 2: routed uplink aur loopback</h4>
<pre class="code"><span class="c">! Uplink ko routed /31 banao</span>
interface Ethernet1/1
  description to SPINE1
  no switchport
  ip address 10.1.1.1/31
  no shutdown
<span class="c">! Stable router ID aur future overlay source</span>
interface loopback0
  ip address 10.255.0.1/32</pre>
<p><code>no switchport</code> port ko Layer 3 mein badal deta hai (aur us par ki koi bhi Layer-2 settings hata deta hai). /31 ko network ya broadcast address nahi chahiye, isliye link ke dono ends do addresses 10.1.1.0 aur 10.1.1.1 use karte hain. Production mein aap overlay ke liye dono ends par <code>mtu 9216</code> bhi jodoge.</p>

<h4>Step 3: OSPF</h4>
<pre class="code">router ospf UNDERLAY
  router-id 10.255.0.1
interface Ethernet1/1
  ip ospf network point-to-point
  ip router ospf UNDERLAY area 0.0.0.0
interface loopback0
  ip router ospf UNDERLAY area 0.0.0.0
end</pre>
<p><b>Point-to-point</b> kyun? Ethernet link par OSPF default se broadcast type hota hai, jo DR aur BDR elect karta hai aur adjacency banane se pehle 40-second wait timer tak intezaar karta hai. Fabric link mein bilkul do routers hote hain, isliye point-to-point election skip karta hai, adjacency jaldi banata hai aur simple database deta hai. Dono ends par same type hona chahiye. Fixed <b>router-id</b> kyun? Taaki interface address badalne par ID kabhi na badle; loopback0 ka address use karna convention hai.</p>

<h4>Step 4: verify karo</h4>
<pre class="out">LEAF1# show ip interface brief
IP Interface Status for VRF "default"(1)
Interface            IP Address      Interface Status
Lo0                  10.255.0.1      protocol-up/link-up/admin-up
<span class="hl">Eth1/1               10.1.1.1        protocol-up/link-up/admin-up</span>

LEAF1# show ip ospf neighbors
 OSPF Process ID UNDERLAY VRF default
 Total number of neighbors: 1
 Neighbor ID     Pri State            Up Time  Address         Interface
<span class="hl"> 10.255.0.11       1 FULL/ -          00:00:41 10.1.1.0        Eth1/1</span>

LEAF1# show ip ospf interface brief
 OSPF Process ID UNDERLAY VRF default
 Total number of interface: 2
 Interface               ID     Area            Cost   State    Neighbors Status
 Lo0                     1      0.0.0.0         1      LOOPBACK 0         up
<span class="hl"> Eth1/1                  2      0.0.0.0         40     P2P      1         up</span>

LEAF1# show ip route 10.255.0.11
10.255.0.11/32, ubest/mbest: 1/0
<span class="hl">    *via 10.1.1.0, Eth1/1, [110/41], 00:00:38, ospf-UNDERLAY, intra</span>

LEAF1# ping 10.255.0.11
64 bytes from 10.255.0.11: icmp_seq=0 ttl=254 time=1.2 ms</pre>
<p>Key lines padho: <b>FULL/ -</b> ka matlab hai full adjacency bina DR role ke (point-to-point par dash normal hai). <b>P2P</b> network type confirm karta hai. Spine loopback ek <b>intra-area OSPF route</b> ki tarah dikhta hai; cost 41 is 1G lab link ke 40 (NX-OS reference bandwidth 40G hai) plus loopback ka 1 hai.</p>

<h4>Step 5: save karo, aur checkpoints use karo</h4>
<pre class="code">copy running-config startup-config
<span class="c">! Agle risky change se pehle:</span>
checkpoint BEFORE-BGP
<span class="c">! Agar gadbad ho:</span>
rollback running-config checkpoint BEFORE-BGP</pre>
<p>Tip: <code>write memory</code> NX-OS command nahi hai. Bahut saare engineers <code>cli alias name wr copy running-config startup-config</code> se alias bana lete hain.</p>

<h3>IOS engineers ke liye common gotchas</h3>
<ul>
<li><b>Feature enabled nahi</b>: "% Invalid command". <code>show feature</code> check karo.</li>
<li><b><code>no switchport</code> bhool gaye</b>: Layer-2 port par IP address command refuse hota hai.</li>
<li><b>MTU mismatch</b>: OSPF apne database exchange mein MTU check karta hai, isliye adjacency EXSTART ya EXCHANGE mein atak jaati hai.</li>
<li><b>Network type mismatch</b>: ek side point-to-point, dusri broadcast; adjacency ban sakti hai lekin routes sahi se nahi dikhte.</li>
<li><b>Galat VRF</b>: <code>show ip interface brief</code> mgmt0 list nahi karta; management hosts ke pings ko <code>vrf management</code> chahiye.</li>
<li><b><code>no feature ospf</code></b> poori OSPF configuration mita deta hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> OSPF process ke neeche IOS-style <code>network 10.1.1.0 0.0.0.1 area 0</code> type karna (NX-OS par supported nahi). Loopback0 ko OSPF mein daalna bhool jaana, jisse spine use reach nahi kar pata. Reload se pehle changes unsaved chhod dena.</p></div>
<div class="exam"><p><b>Exam tip.</b> NX-OS: pehle features enable karo; interfaces Ethernet slot/port hain; Layer 3 ke liye <code>no switchport</code>; prefix-length addressing; OSPF process tag ke saath har interface par enable hota hai; <code>copy running-config startup-config</code> se save; checkpoints aur rollback built in hain; <code>| json</code> structured output deta hai.</p></div>

<div class="scn"><h4>EXSTART mein atka hua</h4><p>Naya leaf, LEAF9, SPINE2 se cable kiya gaya. Interfaces up the aur /31 ke paar pings chal rahe the, lekin OSPF kabhi FULL tak nahi pahuncha. <code>show ip ospf neighbors</code> minuton tak spine ko <code>EXSTART/ -</code> mein dikha raha tha. Engineer ne dono sides par <code>show interface ethernet1/2</code> compare kiya: LEAF9 par fabric template se <code>MTU 9216 bytes</code> tha, lekin naya SPINE2 port abhi bhi <code>MTU 1500 bytes</code> par tha. OSPF database description packets interface MTU carry karte hain, aur chhote MTU wali side us neighbor ko reject karti hai jo bada MTU advertise karta hai. Spine port par <code>mtu 9216</code> set karte hi kuch seconds mein adjacency FULL ho gayi. Engineer ne <code>ip ospf mtu-ignore</code> use nahi kiya, kyunki woh future VXLAN overlay ke liye ek asli problem ko chhupa deta.</p><p><b>Seekh:</b> NX-OS par EXSTART ya EXCHANGE mein atka OSPF neighbor lagbhag hamesha MTU mismatch hota hai; MTU theek karo, use chhupao mat.</p></div>

<div class="iv"><p class="q">"Aapke paas strong IOS experience hai. NX-OS par sabse pehle kaunsi cheezein logon ko phasati hain?"</p><p>Strong answer: features ke commands tabhi exist karte hain jab feature enable ho; switch ports default se Layer 2 hote hain isliye routed links ko <code>no switchport</code> chahiye; addresses prefix length use karte hain; OSPF mein network statements nahi hote aur woh process tag ke saath har interface par enable hota hai; mgmt0 management VRF mein hai; <code>copy running-config startup-config</code> se save karo. Phir depth dikhao: /31 fabric links par point-to-point OSPF use karo, loopback0 se router-id set karo, changes se pehle <code>checkpoint</code> lo, aur automation ke liye <code>| json</code> use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle feature enable karo; reject hua command aam taur par missing feature ka matlab hai.</li>
<li>Routed uplink = <code>no switchport</code> + <code>ip address x/31</code> + <code>no shutdown</code>.</li>
<li>OSPF: <code>router ospf TAG</code>, fixed router-id, phir har fabric interface par <code>ip router ospf TAG area 0.0.0.0</code> aur point-to-point.</li>
<li><code>show ip ospf neighbors</code> (FULL), <code>show ip route</code> aur spine loopback tak ping se verify karo.</li>
<li><code>copy running-config startup-config</code> se save karo; checkpoints, <code>| json</code> aur <code>show running-config ospf</code> use karo.</li>
</ul></div>
`}};export{e as default};