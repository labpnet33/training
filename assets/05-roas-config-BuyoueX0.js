var e={id:`roas-config`,h:{en:`Router-on-a-stick: configure and verify`,hi:`Router-on-a-stick: configure aur verify`},body:{en:`
<p>A recipe is only useful if you follow the steps in the right order and taste the dish at the end. Router-on-a-stick is the same: four short configuration steps, then a fixed set of show commands that prove each step worked. This chapter builds exactly what the <b>Router on a stick</b> lab asks for.</p>

<h3>The lab design</h3>
<p>A small design studio has HR in VLAN 10 (192.168.10.0/24) and engineering in VLAN 20 (192.168.20.0/24) on switch SW1. PC1 (192.168.10.10) sits on SW1 Gi0/1 and PC2 (192.168.20.10) on SW1 Gi0/2, both already access ports in the right VLANs. The router R1 has one free port, Gi0/0, cabled to SW1 Gi0/0. The PCs already point at .1 as their gateway.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Router on a stick lab topology">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<line x1="320" y1="54" x2="320" y2="106" stroke="#64748b" stroke-width="5"/>
<text x="330" y="74" class="svg-ink" font-size="12">R1 Gi0/0: .10 and .20 subinterfaces</text>
<text x="330" y="94" class="svg-muted" font-size="12">SW1 Gi0/0: switchport mode trunk</text>
<rect x="250" y="106" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="270" y1="150" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="150" x2="480" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="170" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10.10 gw .10.1 (Gi0/1)</text>
<rect x="380" y="170" width="200" height="40" rx="8" fill="#fde68a"/><text x="480" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC2 .20.10 gw .20.1 (Gi0/2)</text>
</svg><p class="cap">The Router on a stick lab: one trunk, two subinterfaces, two VLANs.</p></div>

<h3>Step 1: make the switch port a static trunk</h3>
<pre class="code"><span class="c">! SW1: the port towards R1</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport mode trunk
<span class="c">! Optional hardening: carry only the VLANs the router serves</span>
SW1(config-if)# switchport trunk allowed vlan 10,20</pre>
<p>Routers do not speak DTP, so a port left in <code>dynamic auto</code> would stay an access port in VLAN 1 forever. On switches that also support ISL (older Catalyst 3560 and 3750, for example) you must first type <code>switchport trunk encapsulation dot1q</code>, otherwise IOS answers <i>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</i></p>

<h3>Step 2: bring the router's physical interface up</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# no shutdown</pre>
<p>Router interfaces start administratively down. No IP address is needed on the parent.</p>

<h3>Steps 3 and 4: one subinterface per VLAN</h3>
<pre class="code">R1(config-if)# interface GigabitEthernet0/0.10
R1(config-subif)# description GW-HR
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# interface GigabitEthernet0/0.20
R1(config-subif)# description GW-ENG
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# end</pre>
<p>The order matters. If you type the IP address before <code>encapsulation dot1Q</code>, IOS refuses:</p>
<pre class="out">R1(config-subif)# ip address 192.168.10.1 255.255.255.0
<span class="hl">% Configuring IP routing on a LAN subinterface is only allowed if that
subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q,
or ISL vLAN.</span></pre>
<p>Subinterfaces do not need <code>no shutdown</code>; they follow the parent. If the design uses a native VLAN other than 1, say 99, add <code>interface Gi0/0.99</code>, <code>encapsulation dot1Q 99 native</code> and its IP, and set <code>switchport trunk native vlan 99</code> on SW1 so both ends agree.</p>

<h3>Verification, in the order you should check</h3>
<p><b>1. Router interfaces.</b> Parent and both subinterfaces must be up/up with the right addresses.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     unassigned      YES unset  up                    up</span>
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</pre>
<p><b>2. VLAN binding on the router.</b> <code>show vlans</code> (on a router, with an s) lists each 802.1Q VLAN ID and the subinterface it is bound to. This is the command that catches a wrong VLAN number.</p>
<pre class="out">R1# show vlans

<span class="hl">Virtual LAN ID:  10 (IEEE 802.1Q Encapsulation)</span>

   vLAN Trunk Interface:   GigabitEthernet0/0.10

   Protocols Configured:   Address:              Received:        Transmitted:
           IP              192.168.10.1                 12               10

<span class="hl">Virtual LAN ID:  20 (IEEE 802.1Q Encapsulation)</span>

   vLAN Trunk Interface:   GigabitEthernet0/0.20

   Protocols Configured:   Address:              Received:        Transmitted:
           IP              192.168.20.1                 11               11</pre>
<p><b>3. The trunk on the switch.</b> Gi0/0 must be trunking, and VLANs 10 and 20 must appear in all three lists, especially the last one (forwarding and not pruned).</p>
<pre class="out">SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Gi0/0       10,20

Port        Vlans allowed and active in management domain
Gi0/0       10,20

Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/0       10,20</span></pre>
<p><b>4. End to end.</b> Ping from PC1 to PC2, then trace to confirm R1 is the first hop, as the last lab task asks.</p>
<pre class="out">PC1&gt; ping 192.168.20.10
84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=2.114 ms

PC1&gt; trace 192.168.20.10
trace to 192.168.20.10, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   192.168.10.1   1.103 ms  0.748 ms  0.702 ms</span>
 2   *192.168.20.10   1.577 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<div class="eg"><p><b>Worked example: adding a VLAN later.</b> The studio adds VLAN 30 (192.168.30.0/24) for guests. You need three things: VLAN 30 created on SW1 with its access ports; VLAN 30 added to the trunk with <code>switchport trunk allowed vlan add 30</code> (the word <b>add</b> is critical; without it you replace the list and cut off VLANs 10 and 20); and a new subinterface Gi0/0.30 with <code>encapsulation dot1Q 30</code> and 192.168.30.1/24.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>switchport trunk allowed vlan 30</code> instead of <code>... add 30</code>; forgetting to create the VLAN on the switch (a VLAN that does not exist is not forwarded on any trunk); two subinterfaces on the same parent with the same VLAN ID, which IOS rejects; and a native VLAN that differs between router and switch.</p></div>

<div class="exam"><p><b>Exam trap.</b> On a router the command is <code>show vlans</code>; on a switch it is <code>show vlan</code> or <code>show vlan brief</code>. Exams also like to ask which command must precede <code>ip address</code> on a subinterface: <code>encapsulation dot1Q</code>.</p></div>

<div class="scn"><h4>The change that forgot one word</h4><p>At a coaching centre, an engineer added VLAN 40 for a new classroom. He created Gi0/0.40 on the router and typed <code>switchport trunk allowed vlan 40</code> on the switch port towards it. Within seconds every department lost its gateway. <code>show interfaces trunk</code> listed only VLAN 40 as allowed. He re-entered <code>switchport trunk allowed vlan 10,20,30,40</code> and service returned; the change template was updated to always use <code>add</code>.</p><p><b>Lesson:</b> on a router-facing trunk, the allowed list is the lifeline of every VLAN. Always modify it with <code>add</code> or <code>remove</code>.</p></div>

<div class="iv"><p class="q">"Give me the minimum configuration for router-on-a-stick with two VLANs, and how you would verify it."</p><p>Strong answer: on the switch, <code>switchport mode trunk</code> on the router-facing port (plus <code>switchport trunk encapsulation dot1q</code> where ISL exists). On the router, <code>no shutdown</code> on the parent, then per VLAN a subinterface with <code>encapsulation dot1Q N</code> followed by the gateway IP. Verify with <code>show ip interface brief</code> and <code>show vlans</code> on the router, <code>show interfaces trunk</code> on the switch, then ping and trace from a host.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch side: static trunk on the router-facing port; routers do not negotiate DTP.</li>
<li>Router side: <code>no shutdown</code> on the parent, then <code>encapsulation dot1Q N</code> before <code>ip address</code> on each subinterface.</li>
<li><code>show vlans</code> on the router proves which VLAN each subinterface serves.</li>
<li><code>show interfaces trunk</code> must list every routed VLAN as allowed, active and forwarding.</li>
<li>Always change an allowed list with <code>add</code> or <code>remove</code>.</li>
</ul></div>
`,hi:`
<p>Recipe tabhi kaam ki hai jab aap steps sahi order mein follow karo aur end mein dish chakho. Router-on-a-stick bhi aisa hi hai: chaar chhote configuration steps, phir show commands ka ek fixed set jo saabit karta hai ki har step chala. Yeh chapter wahi banata hai jo <b>Router on a stick</b> lab maangti hai.</p>

<h3>Lab design</h3>
<p>Ek chhote design studio mein switch SW1 par HR VLAN 10 (192.168.10.0/24) mein aur engineering VLAN 20 (192.168.20.0/24) mein hai. PC1 (192.168.10.10) SW1 Gi0/1 par aur PC2 (192.168.20.10) SW1 Gi0/2 par baithe hain, dono pehle se sahi VLANs ke access ports hain. Router R1 ka ek free port hai, Gi0/0, jo SW1 Gi0/0 se cabled hai. PCs ka gateway pehle se .1 par set hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Router on a stick lab topology">
<rect x="250" y="10" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<line x1="320" y1="54" x2="320" y2="106" stroke="#64748b" stroke-width="5"/>
<text x="330" y="74" class="svg-ink" font-size="12">R1 Gi0/0: .10 aur .20 subinterfaces</text>
<text x="330" y="94" class="svg-muted" font-size="12">SW1 Gi0/0: switchport mode trunk</text>
<rect x="250" y="106" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="134" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<line x1="270" y1="150" x2="160" y2="170" stroke="#64748b" stroke-width="2"/><line x1="370" y1="150" x2="480" y2="170" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="170" width="200" height="40" rx="8" fill="#bbf7d0"/><text x="160" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10.10 gw .10.1 (Gi0/1)</text>
<rect x="380" y="170" width="200" height="40" rx="8" fill="#fde68a"/><text x="480" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC2 .20.10 gw .20.1 (Gi0/2)</text>
</svg><p class="cap">Router on a stick lab: ek trunk, do subinterfaces, do VLANs.</p></div>

<h3>Step 1: switch port ko static trunk banao</h3>
<pre class="code"><span class="c">! SW1: R1 ki taraf wala port</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport mode trunk
<span class="c">! Optional hardening: sirf woh VLANs le jaao jo router serve karta hai</span>
SW1(config-if)# switchport trunk allowed vlan 10,20</pre>
<p>Routers DTP nahi bolte, isliye <code>dynamic auto</code> mein chhoda gaya port hamesha VLAN 1 ka access port hi rahega. Jo switches ISL bhi support karte hain (jaise purane Catalyst 3560 aur 3750) unpar pehle <code>switchport trunk encapsulation dot1q</code> type karna padta hai, warna IOS jawab deta hai <i>Command rejected: An interface whose trunk encapsulation is "Auto" can not be configured to "trunk" mode.</i></p>

<h3>Step 2: router ka physical interface up karo</h3>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# no shutdown</pre>
<p>Router interfaces administratively down se shuru hote hain. Parent par koi IP address nahi chahiye.</p>

<h3>Steps 3 aur 4: har VLAN ke liye ek subinterface</h3>
<pre class="code">R1(config-if)# interface GigabitEthernet0/0.10
R1(config-subif)# description GW-HR
R1(config-subif)# encapsulation dot1Q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# interface GigabitEthernet0/0.20
R1(config-subif)# description GW-ENG
R1(config-subif)# encapsulation dot1Q 20
R1(config-subif)# ip address 192.168.20.1 255.255.255.0
R1(config-subif)# end</pre>
<p>Order maayne rakhta hai. Agar aap <code>encapsulation dot1Q</code> se pehle IP address type karo, to IOS mana kar deta hai:</p>
<pre class="out">R1(config-subif)# ip address 192.168.10.1 255.255.255.0
<span class="hl">% Configuring IP routing on a LAN subinterface is only allowed if that
subinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q,
or ISL vLAN.</span></pre>
<p>Subinterfaces ko <code>no shutdown</code> nahi chahiye; woh parent ko follow karte hain. Agar design mein native VLAN 1 ke alawa koi aur hai, maan lo 99, to <code>interface Gi0/0.99</code>, <code>encapsulation dot1Q 99 native</code> aur uska IP jodo, aur SW1 par <code>switchport trunk native vlan 99</code> set karo taaki dono ends sehmat hon.</p>

<h3>Verification, us order mein jismein check karna chahiye</h3>
<p><b>1. Router interfaces.</b> Parent aur dono subinterfaces sahi addresses ke saath up/up hone chahiye.</p>
<pre class="out">R1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
<span class="hl">GigabitEthernet0/0     unassigned      YES unset  up                    up</span>
GigabitEthernet0/0.10  192.168.10.1    YES manual up                    up
GigabitEthernet0/0.20  192.168.20.1    YES manual up                    up</pre>
<p><b>2. Router par VLAN binding.</b> <code>show vlans</code> (router par, s ke saath) har 802.1Q VLAN ID aur jis subinterface se woh bandha hai use list karta hai. Galat VLAN number isi command se pakda jaata hai.</p>
<pre class="out">R1# show vlans

<span class="hl">Virtual LAN ID:  10 (IEEE 802.1Q Encapsulation)</span>

   vLAN Trunk Interface:   GigabitEthernet0/0.10

   Protocols Configured:   Address:              Received:        Transmitted:
           IP              192.168.10.1                 12               10

<span class="hl">Virtual LAN ID:  20 (IEEE 802.1Q Encapsulation)</span>

   vLAN Trunk Interface:   GigabitEthernet0/0.20

   Protocols Configured:   Address:              Received:        Transmitted:
           IP              192.168.20.1                 11               11</pre>
<p><b>3. Switch par trunk.</b> Gi0/0 trunking hona chahiye, aur VLANs 10 aur 20 teeno lists mein dikhne chahiye, khaas kar aakhri wali (forwarding aur not pruned).</p>
<pre class="out">SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
<span class="hl">Gi0/0       on               802.1q         trunking      1</span>

Port        Vlans allowed on trunk
Gi0/0       10,20

Port        Vlans allowed and active in management domain
Gi0/0       10,20

Port        Vlans in spanning tree forwarding state and not pruned
<span class="hl">Gi0/0       10,20</span></pre>
<p><b>4. End to end.</b> PC1 se PC2 ko ping karo, phir trace karke confirm karo ki pehla hop R1 hai, jaisa lab ka aakhri task maangta hai.</p>
<pre class="out">PC1&gt; ping 192.168.20.10
84 bytes from 192.168.20.10 icmp_seq=1 ttl=63 time=2.114 ms

PC1&gt; trace 192.168.20.10
trace to 192.168.20.10, 8 hops max, press Ctrl+C to stop
<span class="hl"> 1   192.168.10.1   1.103 ms  0.748 ms  0.702 ms</span>
 2   *192.168.20.10   1.577 ms (ICMP type:3, code:3, Destination port unreachable)</pre>

<div class="eg"><p><b>Worked example: baad mein VLAN jodna.</b> Studio guests ke liye VLAN 30 (192.168.30.0/24) jodta hai. Aapko teen cheezein chahiye: SW1 par VLAN 30 apne access ports ke saath create karna; <code>switchport trunk allowed vlan add 30</code> se VLAN 30 ko trunk mein jodna (shabd <b>add</b> critical hai; iske bina aap list replace kar dete ho aur VLANs 10 aur 20 kat jaate hain); aur <code>encapsulation dot1Q 30</code> aur 192.168.30.1/24 ke saath naya subinterface Gi0/0.30.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>... add 30</code> ki jagah <code>switchport trunk allowed vlan 30</code>; switch par VLAN create karna bhool jaana (jo VLAN exist nahi karta woh kisi trunk par forward nahi hota); same parent par same VLAN ID ke do subinterfaces, jise IOS reject karta hai; aur router aur switch ke beech alag native VLAN.</p></div>

<div class="exam"><p><b>Exam trap.</b> Router par command <code>show vlans</code> hai; switch par <code>show vlan</code> ya <code>show vlan brief</code>. Exams yeh bhi poochna pasand karte hain ki subinterface par <code>ip address</code> se pehle kaunsi command aani chahiye: <code>encapsulation dot1Q</code>.</p></div>

<div class="scn"><h4>Woh change jo ek shabd bhool gaya</h4><p>Ek coaching centre mein engineer ne nayi classroom ke liye VLAN 40 joda. Usne router par Gi0/0.40 banaya aur uski taraf wale switch port par <code>switchport trunk allowed vlan 40</code> type kiya. Kuch hi seconds mein har department ka gateway chala gaya. <code>show interfaces trunk</code> ne sirf VLAN 40 ko allowed dikhaya. Usne <code>switchport trunk allowed vlan 10,20,30,40</code> dobara daala aur service wapas aayi; change template ko update kiya gaya ki hamesha <code>add</code> use ho.</p><p><b>Seekh:</b> router ki taraf wale trunk par allowed list har VLAN ki lifeline hai. Use hamesha <code>add</code> ya <code>remove</code> se badlo.</p></div>

<div class="iv"><p class="q">"Do VLANs ke saath router-on-a-stick ki minimum configuration batao, aur aap use kaise verify karoge."</p><p>Strong answer: switch par router ki taraf wale port par <code>switchport mode trunk</code> (aur jahan ISL ho wahan <code>switchport trunk encapsulation dot1q</code>). Router par parent par <code>no shutdown</code>, phir har VLAN ke liye ek subinterface jismein <code>encapsulation dot1Q N</code> ke baad gateway IP. Router par <code>show ip interface brief</code> aur <code>show vlans</code>, switch par <code>show interfaces trunk</code>, phir host se ping aur trace se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Switch side: router ki taraf wale port par static trunk; routers DTP negotiate nahi karte.</li>
<li>Router side: parent par <code>no shutdown</code>, phir har subinterface par <code>ip address</code> se pehle <code>encapsulation dot1Q N</code>.</li>
<li>Router par <code>show vlans</code> saabit karta hai ki har subinterface kaunsa VLAN serve karta hai.</li>
<li><code>show interfaces trunk</code> mein har routed VLAN allowed, active aur forwarding dikhna chahiye.</li>
<li>Allowed list ko hamesha <code>add</code> ya <code>remove</code> se badlo.</li>
</ul></div>
`}};export{e as default};