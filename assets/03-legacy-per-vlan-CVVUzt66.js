var e={id:`legacy`,h:{en:`Legacy design: one router interface per VLAN`,hi:`Legacy design: har VLAN ke liye ek router interface`},body:{en:`
<p>Imagine a building where every floor has its own private staircase down to reception. It is simple and nobody gets lost, but every new floor needs a new staircase and a new door at reception. That is the <b>legacy</b> inter-VLAN design: each VLAN gets its own physical cable to its own router interface.</p>

<h3>How it works</h3>
<p>In this design the router knows nothing about VLANs. Each router interface is an ordinary routed Ethernet port with one IP address. The switch port on the other end of each cable is a normal <b>access port</b> in the VLAN that the router interface serves. From the switch's point of view, the router is just another host in VLAN 10 on one cable, and another host in VLAN 20 on a second cable.</p>
<p>Take the design studio from the first lab, built the old way. R1 Gi0/0 connects to SW1 Gi0/23 (access VLAN 10). R1 Gi0/1 connects to SW1 Gi0/24 (access VLAN 20). The PCs stay where they are: PC1 on Gi0/1 in VLAN 10 and PC2 on Gi0/2 in VLAN 20.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Legacy inter-VLAN routing with two router interfaces and two access links">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="250" y="126" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="285" y1="60" x2="285" y2="126" stroke="#64748b" stroke-width="3"/><line x1="355" y1="60" x2="355" y2="126" stroke="#64748b" stroke-width="3"/>
<text x="275" y="84" text-anchor="end" class="svg-ink" font-size="12">Gi0/0 192.168.10.1</text>
<text x="275" y="104" text-anchor="end" class="svg-muted" font-size="12">Gi0/23 access 10</text>
<text x="365" y="84" class="svg-ink" font-size="12">Gi0/1 192.168.20.1</text>
<text x="365" y="104" class="svg-muted" font-size="12">Gi0/24 access 20</text>
<line x1="270" y1="170" x2="160" y2="200" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="200" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC1 VLAN 10</text>
<rect x="410" y="200" width="140" height="40" rx="8" fill="#fde68a"/><text x="480" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC2 VLAN 20</text>
</svg><p class="cap">Two VLANs, two cables, two router ports. The router sees plain Ethernet; the switch sees two access ports.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Switch: the ports facing the router are ordinary access ports</span>
SW1(config)# interface GigabitEthernet0/23
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# interface GigabitEthernet0/24
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20

<span class="c">! Router: one routed interface per VLAN, one subnet each</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# description GW-HR-VLAN10
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# description GW-ENG-VLAN20
R1(config-if)# ip address 192.168.20.1 255.255.255.0
R1(config-if)# no shutdown</pre>
<p>Router interfaces are <b>shut down by default</b>, so <code>no shutdown</code> is mandatory. Switch ports are enabled by default. Each router interface must be in a <b>different subnet</b>; if you try to put an overlapping subnet on a second interface, IOS refuses it:</p>
<pre class="out">R1(config-if)# ip address 192.168.10.2 255.255.255.0
<span class="hl">% 192.168.10.0 overlaps with GigabitEthernet0/0</span></pre>

<h3>Verification</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
<span class="hl">GigabitEthernet0/1     192.168.20.1    YES manual up                    up</span>
GigabitEthernet0/2     unassigned      YES unset  administratively down down

SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3, Gi0/4, Gi0/5, Gi0/6
<span class="hl">10   HR                               active    Gi0/1, Gi0/23</span>
<span class="hl">20   ENG                              active    Gi0/2, Gi0/24</span></pre>
<p>Read it like this: the router side is up/up with the right addresses, and each router-facing switch port sits in the correct VLAN next to that VLAN's PCs. If Gi0/24 appeared in VLAN 1 instead of 20, R1's Gi0/1 would still show up/up (the cable is fine) but VLAN 20 hosts could never reach 192.168.20.1.</p>

<h3>Why this design faded</h3>
<table class="cmp"><tr><th>Advantage</th><th>Disadvantage</th></tr>
<tr><td>Very easy to understand; no tagging, no trunk</td><td>One router port and one switch port <b>per VLAN</b></td></tr>
<tr><td>Each VLAN has a full link of bandwidth to the router</td><td>Routers have few Ethernet ports; 12 VLANs would need 12 ports</td></tr>
<tr><td>A fault on one cable affects only one VLAN</td><td>Adding a VLAN means new cabling and often new hardware</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> A branch router has 3 Gigabit ports. One goes to the ISP. With the legacy design, the branch can route at most 2 VLANs. The day they add a VLAN for IP cameras, they need a third LAN port they do not have. Router-on-a-stick would carry all three VLANs, plus many more, over one port.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configuring the router-facing switch port as a trunk in this design (the router interface is not tagging, so it expects untagged frames); forgetting <code>switchport access vlan</code>, which leaves the port in VLAN 1; and forgetting <code>no shutdown</code> on the router.</p></div>

<div class="exam"><p><b>Exam trap.</b> In the legacy design the links are <b>access</b> links and the router has <b>no</b> subinterfaces or <code>encapsulation dot1Q</code>. If an exam exhibit shows one cable per VLAN, do not choose an answer that adds a trunk.</p></div>

<div class="scn"><h4>The camera VLAN that had no port</h4><p>A clinic ran VLAN 10 (staff) and VLAN 20 (guest Wi-Fi) with one router cable each. A vendor installed IP cameras and asked for VLAN 30. The router's only spare port was the WAN backup link. The engineer converted the design to router-on-a-stick: one trunk from the switch, subinterfaces .10, .20 and .30 on R1 Gi0/0, freeing Gi0/1 entirely. The cutover took ten minutes because the IP addresses and gateways did not change; only where they lived changed.</p><p><b>Lesson:</b> legacy works, but it does not scale. When VLANs grow, move the gateways onto subinterfaces or SVIs and keep the same addresses.</p></div>

<div class="iv"><p class="q">"What is the main limitation of routing between VLANs with one physical interface per VLAN?"</p><p>Strong answer: it consumes one router interface and one switch port per VLAN, so it does not scale and adding VLANs needs cabling or hardware. Its advantages are simplicity and dedicated bandwidth per VLAN. Say that the switch ports are access ports and that the modern alternatives are router-on-a-stick and Layer 3 switch SVIs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Legacy design: one routed router interface per VLAN, cabled to an access port in that VLAN.</li>
<li>The router is VLAN-unaware; no trunk and no 802.1Q tags are involved.</li>
<li>Router ports need <code>no shutdown</code>; each must be in a different subnet.</li>
<li>Simple and fast per VLAN, but costs one router port and one switch port per VLAN.</li>
<li>Replaced by router-on-a-stick and Layer 3 switches as VLAN counts grow.</li>
</ul></div>
`,hi:`
<p>Ek building socho jahan har floor ki apni private seedhi reception tak jaati hai. Simple hai aur koi raasta nahi bhoolta, lekin har nayi floor ke liye nayi seedhi aur reception par naya darwaza chahiye. Yahi <b>legacy</b> inter-VLAN design hai: har VLAN ko apne router interface tak apni physical cable milti hai.</p>

<h3>Yeh kaise kaam karta hai</h3>
<p>Is design mein router ko VLANs ke baare mein kuch nahi pata. Har router interface ek ordinary routed Ethernet port hai jiska ek IP address hai. Har cable ke dusre end par switch port ek normal <b>access port</b> hai us VLAN mein jise woh router interface serve karta hai. Switch ki nazar mein router ek cable par VLAN 10 ka ek aur host hai, aur dusri cable par VLAN 20 ka ek aur host.</p>
<p>Pehli lab ka design studio lo, purane tareeke se bana hua. R1 Gi0/0 SW1 Gi0/23 (access VLAN 10) se juda hai. R1 Gi0/1 SW1 Gi0/24 (access VLAN 20) se juda hai. PCs wahi rehte hain: PC1 Gi0/1 par VLAN 10 mein aur PC2 Gi0/2 par VLAN 20 mein.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Do router interfaces aur do access links ke saath legacy inter-VLAN routing">
<rect x="250" y="16" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="250" y="126" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="285" y1="60" x2="285" y2="126" stroke="#64748b" stroke-width="3"/><line x1="355" y1="60" x2="355" y2="126" stroke="#64748b" stroke-width="3"/>
<text x="275" y="84" text-anchor="end" class="svg-ink" font-size="12">Gi0/0 192.168.10.1</text>
<text x="275" y="104" text-anchor="end" class="svg-muted" font-size="12">Gi0/23 access 10</text>
<text x="365" y="84" class="svg-ink" font-size="12">Gi0/1 192.168.20.1</text>
<text x="365" y="104" class="svg-muted" font-size="12">Gi0/24 access 20</text>
<line x1="270" y1="170" x2="160" y2="200" stroke="#64748b" stroke-width="2"/><line x1="370" y1="170" x2="480" y2="200" stroke="#64748b" stroke-width="2"/>
<rect x="90" y="200" width="140" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC1 VLAN 10</text>
<rect x="410" y="200" width="140" height="40" rx="8" fill="#fde68a"/><text x="480" y="225" text-anchor="middle" class="svg-ink" font-size="12">PC2 VLAN 20</text>
</svg><p class="cap">Do VLANs, do cables, do router ports. Router ko plain Ethernet dikhta hai; switch ko do access ports.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! Switch: router ki taraf wale ports ordinary access ports hain</span>
SW1(config)# interface GigabitEthernet0/23
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 10
SW1(config-if)# interface GigabitEthernet0/24
SW1(config-if)# switchport mode access
SW1(config-if)# switchport access vlan 20

<span class="c">! Router: har VLAN ke liye ek routed interface, har ek ka alag subnet</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# description GW-HR-VLAN10
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# interface GigabitEthernet0/1
R1(config-if)# description GW-ENG-VLAN20
R1(config-if)# ip address 192.168.20.1 255.255.255.0
R1(config-if)# no shutdown</pre>
<p>Router interfaces <b>default mein shut</b> hote hain, isliye <code>no shutdown</code> zaroori hai. Switch ports default mein enabled hote hain. Har router interface <b>alag subnet</b> mein hona chahiye; agar aap dusre interface par overlapping subnet daalne ki koshish karo, to IOS mana kar deta hai:</p>
<pre class="out">R1(config-if)# ip address 192.168.10.2 255.255.255.0
<span class="hl">% 192.168.10.0 overlaps with GigabitEthernet0/0</span></pre>

<h3>Verification</h3>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     192.168.10.1    YES manual up                    up</span>
<span class="hl">GigabitEthernet0/1     192.168.20.1    YES manual up                    up</span>
GigabitEthernet0/2     unassigned      YES unset  administratively down down

SW1# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/3, Gi0/4, Gi0/5, Gi0/6
<span class="hl">10   HR                               active    Gi0/1, Gi0/23</span>
<span class="hl">20   ENG                              active    Gi0/2, Gi0/24</span></pre>
<p>Ise aise padho: router side sahi addresses ke saath up/up hai, aur router ki taraf wala har switch port sahi VLAN mein us VLAN ke PCs ke saath baitha hai. Agar Gi0/24 VLAN 20 ki jagah VLAN 1 mein dikhta, to R1 ka Gi0/1 phir bhi up/up dikhata (cable theek hai) lekin VLAN 20 ke hosts kabhi 192.168.20.1 tak nahi pahunch paate.</p>

<h3>Yeh design kyun peeche chhoot gaya</h3>
<table class="cmp"><tr><th>Fayda</th><th>Nuksaan</th></tr>
<tr><td>Samajhna bahut aasaan; na tagging, na trunk</td><td><b>Har VLAN ke liye</b> ek router port aur ek switch port</td></tr>
<tr><td>Har VLAN ko router tak poore link ki bandwidth</td><td>Routers ke paas kam Ethernet ports hote hain; 12 VLANs ko 12 ports chahiye</td></tr>
<tr><td>Ek cable ka fault sirf ek VLAN ko affect karta hai</td><td>VLAN jodne ka matlab nayi cabling aur aksar naya hardware</td></tr>
</table>
<div class="eg"><p><b>Worked example.</b> Ek branch router ke paas 3 Gigabit ports hain. Ek ISP ko jaata hai. Legacy design ke saath branch zyada se zyada 2 VLANs route kar sakti hai. Jis din woh IP cameras ke liye VLAN jodte hain, unhe teesra LAN port chahiye jo unke paas nahi hai. Router-on-a-stick teeno VLANs, aur bahut saare aur bhi, ek port par le jaata.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Is design mein router ki taraf wale switch port ko trunk bana dena (router interface tagging nahi kar raha, isliye use untagged frames chahiye); <code>switchport access vlan</code> bhool jaana, jisse port VLAN 1 mein reh jaata hai; aur router par <code>no shutdown</code> bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Legacy design mein links <b>access</b> links hote hain aur router par <b>koi</b> subinterfaces ya <code>encapsulation dot1Q</code> nahi hota. Agar exam exhibit har VLAN ke liye ek cable dikhata hai, to trunk jodne wala answer mat chuno.</p></div>

<div class="scn"><h4>Camera VLAN jiske liye port nahi tha</h4><p>Ek clinic VLAN 10 (staff) aur VLAN 20 (guest Wi-Fi) ko ek ek router cable ke saath chalata tha. Vendor ne IP cameras lagaye aur VLAN 30 maanga. Router ka akela spare port WAN backup link tha. Engineer ne design ko router-on-a-stick mein badal diya: switch se ek trunk, R1 Gi0/0 par subinterfaces .10, .20 aur .30, jisse Gi0/1 poori tarah free ho gaya. Cutover mein dus minute lage kyunki IP addresses aur gateways nahi badle; sirf unke rehne ki jagah badli.</p><p><b>Seekh:</b> legacy chalta hai, lekin scale nahi karta. Jab VLANs badhte hain, gateways ko subinterfaces ya SVIs par le jaao aur addresses same rakho.</p></div>

<div class="iv"><p class="q">"Har VLAN ke liye ek physical interface se VLANs ke beech routing ki main limitation kya hai?"</p><p>Strong answer: yeh har VLAN ke liye ek router interface aur ek switch port khaata hai, isliye scale nahi karta aur VLANs jodne ke liye cabling ya hardware chahiye. Iske fayde simplicity aur har VLAN ki dedicated bandwidth hain. Batao ki switch ports access ports hote hain aur modern alternatives router-on-a-stick aur Layer 3 switch SVIs hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Legacy design: har VLAN ke liye ek routed router interface, us VLAN ke access port se cabled.</li>
<li>Router VLAN-unaware hai; na trunk, na 802.1Q tags.</li>
<li>Router ports ko <code>no shutdown</code> chahiye; har ek alag subnet mein hona chahiye.</li>
<li>Har VLAN ke liye simple aur fast, lekin har VLAN par ek router port aur ek switch port lagta hai.</li>
<li>VLANs badhne par router-on-a-stick aur Layer 3 switches ne iski jagah le li.</li>
</ul></div>
`}};export{e as default};