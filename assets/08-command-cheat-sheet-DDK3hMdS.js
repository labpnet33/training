var e={id:`command-cheat-sheet`,h:{en:`One-page CCNA command cheat sheet`,hi:`One-page CCNA command cheat sheet`},body:{en:`
<p>A pilot flies with a checklist on the knee even after ten thousand hours, not because she forgets how to fly, but because under pressure the brain skips steps. This page is your checklist. For every CCNA domain it lists the configuration commands you build with, and the show commands you prove them with. Use it as a map while you do the ten capstone labs. The goal is not to memorise a list, it is to see the shape: <b>every feature has a configure command and a verify command</b>.</p>

<h3>Network access: VLANs, trunks, STP, EtherChannel</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Create VLAN</td><td><code>vlan 10</code> then <code>name USERS</code></td><td><code>show vlan brief</code></td></tr>
<tr><td>Access port</td><td><code>switchport mode access</code> and <code>switchport access vlan 10</code></td><td><code>show interfaces Gi0/2 switchport</code></td></tr>
<tr><td>Trunk</td><td><code>switchport mode trunk</code>, <code>switchport trunk allowed vlan 10,20</code>, <code>switchport trunk native vlan 99</code></td><td><code>show interfaces trunk</code></td></tr>
<tr><td>Rapid STP and root</td><td><code>spanning-tree mode rapid-pvst</code>, <code>spanning-tree vlan 10 root primary</code></td><td><code>show spanning-tree vlan 10</code></td></tr>
<tr><td>Edge port protection</td><td><code>spanning-tree portfast</code>, <code>spanning-tree bpduguard enable</code></td><td><code>show spanning-tree interface Gi0/2 detail</code></td></tr>
<tr><td>EtherChannel (LACP)</td><td><code>channel-group 1 mode active</code></td><td><code>show etherchannel summary</code></td></tr>
<tr><td>Neighbours</td><td><code>cdp run</code>, <code>lldp run</code></td><td><code>show cdp neighbors</code>, <code>show lldp neighbors</code></td></tr>
<tr><td>Port state at a glance</td><td>none</td><td><code>show interfaces status</code>, <code>show mac address-table</code></td></tr>
</table></div>

<h3>IP connectivity: addressing and routing</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Interface address</td><td><code>ip address 10.1.10.1 255.255.255.0</code> and <code>no shutdown</code></td><td><code>show ip interface brief</code></td></tr>
<tr><td>Router on a stick</td><td><code>interface Gi0/0.10</code>, <code>encapsulation dot1Q 10</code>, <code>ip address ...</code></td><td><code>show ip interface brief</code>, <code>show running-config | section interface</code></td></tr>
<tr><td>Static and default route</td><td><code>ip route 10.2.0.0 255.255.0.0 10.1.255.2</code>, <code>ip route 0.0.0.0 0.0.0.0 198.51.100.1</code></td><td><code>show ip route</code></td></tr>
<tr><td>Floating static</td><td><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1 250</code></td><td><code>show ip route</code> (not installed until primary fails)</td></tr>
<tr><td>OSPFv2</td><td><code>router ospf 1</code>, <code>router-id 1.1.1.1</code>, <code>network 10.1.0.0 0.0.255.255 area 0</code>, <code>passive-interface Gi0/0.10</code>, <code>default-information originate</code></td><td><code>show ip ospf neighbor</code>, <code>show ip protocols</code>, <code>show ip ospf interface brief</code></td></tr>
<tr><td>OSPF link tuning</td><td><code>ip ospf cost 10</code>, <code>ip ospf network point-to-point</code>, <code>ip ospf priority 100</code></td><td><code>show ip ospf interface Gi0/1</code></td></tr>
<tr><td>IPv6 basics</td><td><code>ipv6 unicast-routing</code>, <code>ipv6 address 2001:db8:1000:10::1/64</code>, <code>ipv6 route ::/0 2001:db8:ff::1</code></td><td><code>show ipv6 interface brief</code>, <code>show ipv6 route</code></td></tr>
</table></div>

<h3>IP services: DHCP, NAT, FHRP, time, logging</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>DHCP server</td><td><code>ip dhcp excluded-address 10.1.10.1 10.1.10.19</code>, <code>ip dhcp pool SALES</code>, <code>network</code>, <code>default-router</code>, <code>dns-server</code></td><td><code>show ip dhcp binding</code>, <code>show ip dhcp pool</code></td></tr>
<tr><td>DHCP relay</td><td><code>ip helper-address 10.1.99.5</code> on the client-side interface</td><td><code>show ip interface Gi0/0.10</code></td></tr>
<tr><td>PAT</td><td><code>ip nat inside</code> and <code>ip nat outside</code> on interfaces, <code>access-list 1 permit 10.1.0.0 0.0.255.255</code>, <code>ip nat inside source list 1 interface Gi0/1 overload</code></td><td><code>show ip nat translations</code>, <code>show ip nat statistics</code></td></tr>
<tr><td>Static NAT</td><td><code>ip nat inside source static 10.1.99.10 203.0.113.10</code></td><td><code>show ip nat translations</code></td></tr>
<tr><td>HSRP</td><td><code>standby 10 ip 10.1.10.1</code>, <code>standby 10 priority 110</code>, <code>standby 10 preempt</code></td><td><code>show standby brief</code></td></tr>
<tr><td>NTP and syslog</td><td><code>ntp server 192.0.2.123</code>, <code>logging host 10.1.99.20</code></td><td><code>show ntp status</code>, <code>show logging</code></td></tr>
<tr><td>SNMP (read-only)</td><td><code>snmp-server community NK-RO ro</code></td><td><code>show snmp</code></td></tr>
</table></div>

<h3>Security: device, ACLs, Layer 2</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Device passwords</td><td><code>enable secret</code>, <code>service password-encryption</code>, <code>username admin secret ...</code></td><td><code>show running-config | include secret</code></td></tr>
<tr><td>SSH only</td><td><code>ip domain-name nk.example</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code>, <code>line vty 0 4</code>, <code>transport input ssh</code>, <code>login local</code></td><td><code>show ip ssh</code></td></tr>
<tr><td>Standard ACL</td><td><code>access-list 10 permit 10.1.99.0 0.0.0.15</code>, <code>access-class 10 in</code> on VTY</td><td><code>show access-lists</code></td></tr>
<tr><td>Extended ACL</td><td><code>ip access-list extended NAME</code>, <code>deny ip 10.1.20.0 0.0.0.63 any</code>, <code>permit ip any any</code>, then <code>ip access-group NAME in</code></td><td><code>show access-lists</code>, <code>show ip interface Gi0/0.20</code></td></tr>
<tr><td>Port security</td><td><code>switchport port-security</code>, <code>maximum 2</code>, <code>mac-address sticky</code>, <code>violation restrict</code></td><td><code>show port-security interface Gi0/2</code></td></tr>
<tr><td>DHCP snooping, DAI</td><td><code>ip dhcp snooping</code>, <code>ip dhcp snooping vlan 10</code>, <code>ip dhcp snooping trust</code> on uplinks, <code>ip arp inspection vlan 10</code></td><td><code>show ip dhcp snooping</code>, <code>show ip arp inspection</code></td></tr>
<tr><td>Banner and unused ports</td><td><code>banner motd #Authorised use only#</code>, <code>shutdown</code> and a parking VLAN</td><td><code>show interfaces status</code></td></tr>
</table></div>

<h3>Operations: save, test, capture the evidence</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Command</th></tr>
<tr><td>Save and compare</td><td><code>copy running-config startup-config</code>, <code>show running-config</code>, <code>show startup-config</code></td></tr>
<tr><td>Reachability</td><td><code>ping</code>, <code>ping x.x.x.x source Gi0/0.10</code>, <code>traceroute</code></td></tr>
<tr><td>Hardware and version</td><td><code>show version</code>, <code>show interfaces Gi0/1</code></td></tr>
<tr><td>Filter long output</td><td><code>| include</code>, <code>| section</code>, <code>| begin</code></td></tr>
<tr><td>Safe change</td><td><code>reload in 10</code>, <code>reload cancel</code></td></tr>
</table></div>

<div class="eg"><p><b>Worked example.</b> The brief says "Finance (VLAN 20) must not reach the Internet, others can." Map it to the sheet: security row "Extended ACL" for the rule, services row "PAT" because the others still need NAT, access row "Trunk" because VLAN 20 must be allowed to reach the router. Configure the extended ACL on the VLAN 20 subinterface, inbound. Verify with <code>show ip interface Gi0/0.20</code> (list present, inbound) and <code>show access-lists</code> (counter on the deny line increases after a Finance ping), plus a Sales ping that still works.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Confusing the wildcard mask (OSPF network, ACL) with the subnet mask. Putting <code>ip nat inside</code> on the outside interface. Typing <code>switchport trunk allowed vlan 20</code> (replaces the list) when you meant <code>add 20</code>. Leaving a standard ACL near the destination instead of near the source for extended ACLs. Relying on <code>debug</code> in a production device.</p></div>

<div class="exam"><p><b>Exam traps.</b> Standard ACLs filter on source only, so place them near the destination. Extended ACLs match protocol, source and destination, so place them near the source. <code>switchport trunk allowed vlan</code> without <code>add</code> overwrites the list. A floating static needs an administrative distance higher than the primary route's. The OSPF process ID is local; the area numbers must match across a link.</p></div>

<div class="scn"><h4>The cheat sheet taped to a monitor</h4><p>A new NOC trainee was nervous on night shift. His team lead printed this kind of sheet for him and taped it to the monitor, each row ending with the verify command. During the first outage he followed the rows top to bottom and found a missing <code>ip nat inside</code> within ten minutes, without asking for help.</p><p><b>Lesson:</b> a good cheat sheet is not a crutch; it is the ladder written down.</p></div>

<div class="iv"><p class="q">"Show me how you would verify that PAT is working."</p><p>Strong answer: check that inside and outside interfaces are marked with <code>show ip nat statistics</code>, generate traffic from a host, and look for a translation with <code>show ip nat translations</code>. If there is none, check the NAT ACL matches the source subnet and the route to the outside exists.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every feature has a configure command and a verify command; learn them as a pair.</li>
<li>Domains: access, IP connectivity, IP services, security, operations.</li>
<li>Know the filters <code>include</code>, <code>section</code> and <code>begin</code> for fast reading.</li>
<li>Watch the traps: wildcard against subnet mask, allowed VLAN add, ACL placement.</li>
<li>Save with <code>copy running-config startup-config</code> when persistence is required.</li>
</ul></div>
`,hi:`
<p>Pilot das hazaar ghante ke baad bhi ghutne par checklist rakh kar udta hai, isliye nahi ki woh udna bhool gaya, balki isliye ki pressure mein dimaag steps skip kar deta hai. Yeh page aapki checklist hai. Har CCNA domain ke liye isme woh configuration commands hain jinse aap build karte ho, aur woh show commands jinse aap prove karte ho. Das capstone labs karte waqt ise map ki tarah use karo. Maqsad list ratna nahi hai, shape dekhna hai: <b>har feature ka ek configure command aur ek verify command hota hai</b>.</p>

<h3>Network access: VLANs, trunks, STP, EtherChannel</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>VLAN banana</td><td><code>vlan 10</code> phir <code>name USERS</code></td><td><code>show vlan brief</code></td></tr>
<tr><td>Access port</td><td><code>switchport mode access</code> aur <code>switchport access vlan 10</code></td><td><code>show interfaces Gi0/2 switchport</code></td></tr>
<tr><td>Trunk</td><td><code>switchport mode trunk</code>, <code>switchport trunk allowed vlan 10,20</code>, <code>switchport trunk native vlan 99</code></td><td><code>show interfaces trunk</code></td></tr>
<tr><td>Rapid STP aur root</td><td><code>spanning-tree mode rapid-pvst</code>, <code>spanning-tree vlan 10 root primary</code></td><td><code>show spanning-tree vlan 10</code></td></tr>
<tr><td>Edge port protection</td><td><code>spanning-tree portfast</code>, <code>spanning-tree bpduguard enable</code></td><td><code>show spanning-tree interface Gi0/2 detail</code></td></tr>
<tr><td>EtherChannel (LACP)</td><td><code>channel-group 1 mode active</code></td><td><code>show etherchannel summary</code></td></tr>
<tr><td>Neighbours</td><td><code>cdp run</code>, <code>lldp run</code></td><td><code>show cdp neighbors</code>, <code>show lldp neighbors</code></td></tr>
<tr><td>Port state ek nazar mein</td><td>koi nahi</td><td><code>show interfaces status</code>, <code>show mac address-table</code></td></tr>
</table></div>

<h3>IP connectivity: addressing aur routing</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Interface address</td><td><code>ip address 10.1.10.1 255.255.255.0</code> aur <code>no shutdown</code></td><td><code>show ip interface brief</code></td></tr>
<tr><td>Router on a stick</td><td><code>interface Gi0/0.10</code>, <code>encapsulation dot1Q 10</code>, <code>ip address ...</code></td><td><code>show ip interface brief</code>, <code>show running-config | section interface</code></td></tr>
<tr><td>Static aur default route</td><td><code>ip route 10.2.0.0 255.255.0.0 10.1.255.2</code>, <code>ip route 0.0.0.0 0.0.0.0 198.51.100.1</code></td><td><code>show ip route</code></td></tr>
<tr><td>Floating static</td><td><code>ip route 0.0.0.0 0.0.0.0 203.0.113.1 250</code></td><td><code>show ip route</code> (primary fail hone tak install nahi hota)</td></tr>
<tr><td>OSPFv2</td><td><code>router ospf 1</code>, <code>router-id 1.1.1.1</code>, <code>network 10.1.0.0 0.0.255.255 area 0</code>, <code>passive-interface Gi0/0.10</code>, <code>default-information originate</code></td><td><code>show ip ospf neighbor</code>, <code>show ip protocols</code>, <code>show ip ospf interface brief</code></td></tr>
<tr><td>OSPF link tuning</td><td><code>ip ospf cost 10</code>, <code>ip ospf network point-to-point</code>, <code>ip ospf priority 100</code></td><td><code>show ip ospf interface Gi0/1</code></td></tr>
<tr><td>IPv6 basics</td><td><code>ipv6 unicast-routing</code>, <code>ipv6 address 2001:db8:1000:10::1/64</code>, <code>ipv6 route ::/0 2001:db8:ff::1</code></td><td><code>show ipv6 interface brief</code>, <code>show ipv6 route</code></td></tr>
</table></div>

<h3>IP services: DHCP, NAT, FHRP, time, logging</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>DHCP server</td><td><code>ip dhcp excluded-address 10.1.10.1 10.1.10.19</code>, <code>ip dhcp pool SALES</code>, <code>network</code>, <code>default-router</code>, <code>dns-server</code></td><td><code>show ip dhcp binding</code>, <code>show ip dhcp pool</code></td></tr>
<tr><td>DHCP relay</td><td>Client-side interface par <code>ip helper-address 10.1.99.5</code></td><td><code>show ip interface Gi0/0.10</code></td></tr>
<tr><td>PAT</td><td>Interfaces par <code>ip nat inside</code> aur <code>ip nat outside</code>, <code>access-list 1 permit 10.1.0.0 0.0.255.255</code>, <code>ip nat inside source list 1 interface Gi0/1 overload</code></td><td><code>show ip nat translations</code>, <code>show ip nat statistics</code></td></tr>
<tr><td>Static NAT</td><td><code>ip nat inside source static 10.1.99.10 203.0.113.10</code></td><td><code>show ip nat translations</code></td></tr>
<tr><td>HSRP</td><td><code>standby 10 ip 10.1.10.1</code>, <code>standby 10 priority 110</code>, <code>standby 10 preempt</code></td><td><code>show standby brief</code></td></tr>
<tr><td>NTP aur syslog</td><td><code>ntp server 192.0.2.123</code>, <code>logging host 10.1.99.20</code></td><td><code>show ntp status</code>, <code>show logging</code></td></tr>
<tr><td>SNMP (read-only)</td><td><code>snmp-server community NK-RO ro</code></td><td><code>show snmp</code></td></tr>
</table></div>

<h3>Security: device, ACLs, Layer 2</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Configure</th><th>Verify</th></tr>
<tr><td>Device passwords</td><td><code>enable secret</code>, <code>service password-encryption</code>, <code>username admin secret ...</code></td><td><code>show running-config | include secret</code></td></tr>
<tr><td>Sirf SSH</td><td><code>ip domain-name nk.example</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code>, <code>line vty 0 4</code>, <code>transport input ssh</code>, <code>login local</code></td><td><code>show ip ssh</code></td></tr>
<tr><td>Standard ACL</td><td><code>access-list 10 permit 10.1.99.0 0.0.0.15</code>, VTY par <code>access-class 10 in</code></td><td><code>show access-lists</code></td></tr>
<tr><td>Extended ACL</td><td><code>ip access-list extended NAME</code>, <code>deny ip 10.1.20.0 0.0.0.63 any</code>, <code>permit ip any any</code>, phir <code>ip access-group NAME in</code></td><td><code>show access-lists</code>, <code>show ip interface Gi0/0.20</code></td></tr>
<tr><td>Port security</td><td><code>switchport port-security</code>, <code>maximum 2</code>, <code>mac-address sticky</code>, <code>violation restrict</code></td><td><code>show port-security interface Gi0/2</code></td></tr>
<tr><td>DHCP snooping, DAI</td><td><code>ip dhcp snooping</code>, <code>ip dhcp snooping vlan 10</code>, uplinks par <code>ip dhcp snooping trust</code>, <code>ip arp inspection vlan 10</code></td><td><code>show ip dhcp snooping</code>, <code>show ip arp inspection</code></td></tr>
<tr><td>Banner aur unused ports</td><td><code>banner motd #Authorised use only#</code>, <code>shutdown</code> aur parking VLAN</td><td><code>show interfaces status</code></td></tr>
</table></div>

<h3>Operations: save, test, evidence lo</h3>
<div class="tbl"><table>
<tr><th>Task</th><th>Command</th></tr>
<tr><td>Save aur compare</td><td><code>copy running-config startup-config</code>, <code>show running-config</code>, <code>show startup-config</code></td></tr>
<tr><td>Reachability</td><td><code>ping</code>, <code>ping x.x.x.x source Gi0/0.10</code>, <code>traceroute</code></td></tr>
<tr><td>Hardware aur version</td><td><code>show version</code>, <code>show interfaces Gi0/1</code></td></tr>
<tr><td>Lambe output ko filter karo</td><td><code>| include</code>, <code>| section</code>, <code>| begin</code></td></tr>
<tr><td>Safe change</td><td><code>reload in 10</code>, <code>reload cancel</code></td></tr>
</table></div>

<div class="eg"><p><b>Worked example.</b> Brief kehta hai "Finance (VLAN 20) Internet tak nahi pahunchna chahiye, baaki pahunch sakte hain." Sheet par map karo: rule ke liye security row "Extended ACL", services row "PAT" kyunki baaki sabko abhi bhi NAT chahiye, access row "Trunk" kyunki VLAN 20 ko router tak pahunchne ke liye allowed hona chahiye. Extended ACL VLAN 20 subinterface par inbound lagao. Verify karo <code>show ip interface Gi0/0.20</code> se (list maujood, inbound) aur <code>show access-lists</code> se (Finance ping ke baad deny line ka counter badhta hai), aur ek Sales ping jo abhi bhi chalta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Wildcard mask (OSPF network, ACL) ko subnet mask se confuse karna. <code>ip nat inside</code> outside interface par laga dena. <code>add 20</code> ki jagah <code>switchport trunk allowed vlan 20</code> type karna (list replace ho jati hai). Extended ACL ko source ke paas lagane ki jagah destination ke paas chhodna. Production device par <code>debug</code> par nirbhar rehna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Standard ACL sirf source par filter karti hai, isliye destination ke paas lagao. Extended ACL protocol, source aur destination match karti hai, isliye source ke paas lagao. <code>add</code> ke bina <code>switchport trunk allowed vlan</code> list ko overwrite karta hai. Floating static ka administrative distance primary route se zyada hona chahiye. OSPF process ID local hota hai; link ke across area numbers match karne chahiye.</p></div>

<div class="scn"><h4>Monitor par chipki cheat sheet</h4><p>Ek naya NOC trainee night shift mein ghabra raha tha. Team lead ne uske liye aisi hi sheet print karke monitor par chipka di, har row ke end mein verify command ke saath. Pehle outage mein usne rows upar se neeche follow kiye aur das minute mein missing <code>ip nat inside</code> dhoondh liya, bina kisi se madad maange.</p><p><b>Lesson:</b> achhi cheat sheet baisakhi nahi, likhi hui ladder hoti hai.</p></div>

<div class="iv"><p class="q">"Mujhe dikhao ki PAT chal raha hai yeh kaise verify karoge."</p><p>Strong answer: <code>show ip nat statistics</code> se check karunga ki inside aur outside interfaces mark hain, host se traffic generate karunga, aur <code>show ip nat translations</code> mein translation dekhunga. Na mile to dekhunga ki NAT ACL source subnet ko match karti hai aur outside ka route maujood hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har feature ka configure command aur verify command hota hai; dono ko jodi mein seekho.</li>
<li>Domains: access, IP connectivity, IP services, security, operations.</li>
<li>Tez padhne ke liye <code>include</code>, <code>section</code> aur <code>begin</code> filters jaano.</li>
<li>Traps dekho: wildcard vs subnet mask, allowed VLAN add, ACL placement.</li>
<li>Persistence chahiye to <code>copy running-config startup-config</code> se save karo.</li>
</ul></div>
`}};export{e as default};