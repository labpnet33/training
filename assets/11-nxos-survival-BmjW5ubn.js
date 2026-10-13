var e={id:`nxos-summary`,h:{en:`NX-OS survival kit, summary and exam checklist`,hi:`NX-OS survival kit, summary aur exam checklist`},body:{en:`
<p>If you learned on IOS, your first NX-OS session feels like driving a familiar car in a country where the indicator is on the other side: everything is there, just slightly moved. This chapter is a survival kit of the differences that trip people up in their first week on Nexus, followed by a summary of the whole module, a mini glossary and the facts that exams and interviews test most.</p>

<h3>Ten habits for your first week on NX-OS</h3>
<ol>
<li><b>No enable.</b> A user with the network-admin role lands directly at the <code>switch#</code> prompt. Access is controlled by roles, not an enable password.</li>
<li><b>Features first.</b> Protocols are off until you enable them: <code>feature ospf</code>, <code>feature bgp</code>, <code>feature interface-vlan</code>, <code>feature lacp</code>, <code>feature hsrp</code>, <code>feature vpc</code>, <code>feature nv overlay</code>. If a command is rejected with an invalid-command marker, check <code>show feature</code> before anything else.</li>
<li><b>CIDR addresses.</b> <code>ip address 10.1.0.1/31</code>; masks are accepted but CIDR is the norm.</li>
<li><b>Show from anywhere.</b> Show commands work inside configuration mode without <code>do</code>. <code>where</code> tells you which mode and context you are in.</li>
<li><b>Interface naming.</b> Every front-panel port is <code>Ethernet1/x</code> regardless of speed; ranges work with <code>interface Ethernet1/1-4</code>.</li>
<li><b>Routing is interface-centric.</b> OSPF uses a process tag and <code>ip router ospf TAG area X</code> under each interface; there are no <code>network</code> statements. BGP neighbours have per-address-family sub-modes.</li>
<li><b>mgmt0 lives in VRF management.</b> Add <code>vrf management</code> to ping, traceroute and copy, and <code>use-vrf management</code> to NTP, syslog, TACACS+ and SNMP servers.</li>
<li><b>Save explicitly.</b> <code>copy running-config startup-config</code>. Until then a reload loses your work.</li>
<li><b>Use checkpoints.</b> NX-OS can snapshot and roll back the running configuration, which IOS engineers often do not know.</li>
<li><b>Filter output.</b> <code>| include</code>, <code>| exclude</code>, <code>| section</code>, <code>| json</code> and <code>| no-more</code> make large outputs manageable.</li>
</ol>

<pre class="code"><span class="c">! out-of-band management</span>
LEAF1(config)# interface mgmt0
LEAF1(config-if)# ip address 192.0.2.21/24
LEAF1(config)# vrf context management
LEAF1(config-vrf)# ip route 0.0.0.0/0 192.0.2.1
LEAF1# ping 192.0.2.1 vrf management
<span class="c">! read only the part of the config you care about</span>
LEAF1# show running-config interface Ethernet1/49
LEAF1# show running-config ospf
LEAF1# show running-config | section "interface Vlan"
<span class="c">! safe change workflow</span>
LEAF1# checkpoint BEFORE-CR1234
LEAF1# configure terminal
  ...change...
LEAF1# show diff rollback-patch checkpoint BEFORE-CR1234 running-config
LEAF1# rollback running-config checkpoint BEFORE-CR1234
LEAF1# copy running-config startup-config</pre>

<pre class="out">LEAF1# show interface brief | include Eth1/4
Eth1/49       --      eth  routed up      none                       100G(D) --
<span class="hl">Eth1/50       --      eth  routed down    Link not connected         auto(D) --</span>
LEAF1# show logging last 3
2026 Sep 29 10:14:02 LEAF1 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/50 is down (Link failure)
2026 Sep 29 10:14:02 LEAF1 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/50 is down (Link failure)
2026 Sep 29 10:14:03 LEAF1 %OSPF-5-ADJCHANGE:  ospf-UNDERLAY [4817]  Nbr 10.255.0.12 on Ethernet1/50 went DOWN</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change workflow">
<rect x="10" y="70" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="97" text-anchor="middle" class="svg-ink" font-size="12">checkpoint</text>
<rect x="140" y="70" width="110" height="44" rx="8" fill="#fde68a"/><text x="195" y="97" text-anchor="middle" class="svg-ink" font-size="12">configure</text>
<rect x="270" y="70" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="12">verify (show)</text>
<rect x="400" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="47" text-anchor="middle" class="svg-ink" font-size="12">copy run start</text>
<rect x="400" y="120" width="110" height="44" rx="8" fill="#fed7aa"/><text x="455" y="147" text-anchor="middle" class="svg-ink" font-size="12">rollback</text>
<line x1="120" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="250" y1="92" x2="270" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="85" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="530" y="47" class="svg-muted" font-size="12">good</text><text x="530" y="147" class="svg-accent" font-size="12">bad</text>
</svg><p class="cap">Checkpoint, change, verify; then save or roll back.</p></div>

<h3>Module summary</h3>
<table class="cmp"><tr><th>Topic</th><th>What to remember</th></tr>
<tr><td>Models</td><td>OSI 7 / TCP/IP 4; frame 1518 (1522 tagged); IP MTU 1500</td></tr>
<tr><td>Ethernet</td><td>Learn source, forward on destination, flood unknowns; NX-OS MAC aging 1800 s</td></tr>
<tr><td>VLANs</td><td>802.1Q 4 bytes, 12-bit VID, 1 to 4094 usable; <code>allowed vlan add</code></td></tr>
<tr><td>STP</td><td>Lowest bridge ID is root; Rapid-PVST+ default; edge ports + BPDU guard</td></tr>
<tr><td>IPv4</td><td>/24 VLANs, /31 links, /32 loopbacks; ARP broadcast request, unicast reply; ARP 1500 s</td></tr>
<tr><td>IPv6</td><td>/64 VLANs, /127 links; link-local fe80::; NDP ICMPv6 133 to 137</td></tr>
<tr><td>Routing</td><td>Longest match, then AD, then metric; ECMP per flow; VRFs incl. management</td></tr>
<tr><td>OSPF / BGP</td><td>OSPF p2p underlay area 0; BGP TCP 179, eBGP 20, iBGP 200, EVPN address family</td></tr>
<tr><td>MTU</td><td>VXLAN +50 bytes; fabric 9216; test with DF-set pings</td></tr>
<tr><td>LACP / FHRP</td><td>active/passive; hash per flow; HSRP/VRRP VIP; vPC and anycast gateway next</td></tr></table>

<h3>Exam and job checklist: can you...</h3>
<ul>
<li>Name the PDU at each layer and compute a tagged frame size?</li>
<li>Read <code>show mac address-table</code> and explain flooding of an unknown unicast?</li>
<li>Configure an access port, a trunk with a restricted VLAN list and a different native VLAN?</li>
<li>Find the STP root and explain why a port is alternate?</li>
<li>Subnet a /26 in your head and plan /31 fabric links?</li>
<li>Explain how an IPv6 host finds its gateway?</li>
<li>Explain why a /32 beats a /24, and what <code>ubest/mbest: 2/0</code> means?</li>
<li>Bring up OSPF point-to-point and an eBGP session on NX-OS?</li>
<li>Prove a 9216 path with <code>ping df-bit packet-size 8972</code>?</li>
<li>Build an LACP port-channel and read <code>show port-channel summary</code>?</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SVI</dt><dd>Switched virtual interface: a routed interface for a VLAN (<code>interface vlan 10</code>).</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: several best routes, flows hashed across them.</dd>
<dt>VRF</dt><dd>A separate routing table inside one device.</dd>
<dt>LACP</dt><dd>Protocol that negotiates a port-channel (802.3ad / 802.1AX).</dd>
<dt>FHRP</dt><dd>First-hop redundancy protocol: HSRP, VRRP (and GLBP on some platforms).</dd>
<dt>PMTUD</dt><dd>Path MTU discovery using ICMP "fragmentation needed" or "Packet Too Big".</dd>
<dt>VTEP</dt><dd>VXLAN tunnel endpoint, usually a leaf loopback (next modules).</dd>
</dl>

<div class="exam"><p><b>Most-tested facts.</b> VLAN ID 12 bits vs VNI 24 bits. VXLAN UDP 4789, 50 bytes overhead. NX-OS: MAC aging 1800 s, ARP 1500 s, Rapid-PVST+ default, features must be enabled, mgmt0 in VRF management, save with <code>copy running-config startup-config</code>. OSPF AD 110, eBGP 20, iBGP 200. HSRP preempt off by default.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>feature</code> and blaming the syntax. Pinging management addresses in the default VRF. Making changes without a checkpoint. Leaving the session without saving.</p></div>

<div class="scn"><h4>The rollback that saved a maintenance window</h4><p>During a night change, an engineer applied a new route-map to the BGP sessions of a border leaf. Within a minute, <code>show bgp ipv4 unicast summary</code> showed prefix counts from the WAN dropping to zero, and internet traffic stopped. Because the runbook started with <code>checkpoint BEFORE-CR2291</code>, the engineer ran <code>show diff rollback-patch checkpoint BEFORE-CR2291 running-config</code> to confirm exactly what had changed, then <code>rollback running-config checkpoint BEFORE-CR2291</code>. Service returned in under three minutes, and the route-map was fixed in the lab the next day.</p><p><b>Lesson:</b> on NX-OS, a checkpoint costs seconds and can save an outage.</p></div>

<div class="iv"><p class="q">"You are moving from IOS to NX-OS. What are the first differences you watch for?"</p><p>Strong answer: features must be enabled; there is no enable mode, access is role-based; interface-centric routing configuration (OSPF tag under interfaces, no network statements) and per-address-family BGP neighbours; CIDR addressing; mgmt0 in VRF management, so management traffic needs <code>vrf management</code>; save with <code>copy running-config startup-config</code>; and checkpoint/rollback for safe changes. Show you know <code>show running-config interface</code> and <code>show interface brief</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS: roles instead of enable, features before protocols, CIDR everywhere.</li>
<li>mgmt0 is in VRF management; use <code>vrf management</code> / <code>use-vrf management</code>.</li>
<li>Checkpoint before changes, verify with show, then save or roll back.</li>
<li>You now have the Layer-2, Layer-3, MTU and redundancy foundation for spine-leaf.</li>
<li>Next: spine-leaf design, underlay routing, vPC, VXLAN EVPN and ACI.</li>
</ul></div>
`,hi:`
<p>Agar aapne IOS par seekha hai, to aapka pehla NX-OS session ek jaani-pehchaani car ko aise desh mein chalaane jaisa lagta hai jahan indicator dusri taraf hai: sab kuch wahan hai, bas thoda khiska hua. Yeh chapter un differences ka survival kit hai jo Nexus par pehle hafte mein logon ko phansaate hain, uske baad poore module ka summary, ek mini glossary aur woh facts jo exams aur interviews sabse zyada test karte hain.</p>

<h3>NX-OS par pehle hafte ki das aadatein</h3>
<ol>
<li><b>Enable nahi.</b> Network-admin role wala user seedha <code>switch#</code> prompt par pahunchta hai. Access roles se control hota hai, enable password se nahi.</li>
<li><b>Pehle features.</b> Protocols tab tak off hain jab tak aap unhe enable na karo: <code>feature ospf</code>, <code>feature bgp</code>, <code>feature interface-vlan</code>, <code>feature lacp</code>, <code>feature hsrp</code>, <code>feature vpc</code>, <code>feature nv overlay</code>. Agar koi command invalid-command marker ke saath reject ho, to sabse pehle <code>show feature</code> check karo.</li>
<li><b>CIDR addresses.</b> <code>ip address 10.1.0.1/31</code>; masks accept hote hain lekin CIDR norm hai.</li>
<li><b>Kahin se bhi show.</b> Show commands configuration mode ke andar bina <code>do</code> ke chalte hain. <code>where</code> batata hai ki aap kis mode aur context mein ho.</li>
<li><b>Interface naming.</b> Har front-panel port <code>Ethernet1/x</code> hai, speed chahe kuch bhi ho; ranges <code>interface Ethernet1/1-4</code> se chalti hain.</li>
<li><b>Routing interface-centric hai.</b> OSPF ek process tag aur har interface ke neeche <code>ip router ospf TAG area X</code> use karta hai; koi <code>network</code> statements nahi. BGP neighbours ke per-address-family sub-modes hote hain.</li>
<li><b>mgmt0 VRF management mein rehta hai.</b> Ping, traceroute aur copy mein <code>vrf management</code> jodo, aur NTP, syslog, TACACS+ aur SNMP servers mein <code>use-vrf management</code>.</li>
<li><b>Explicitly save karo.</b> <code>copy running-config startup-config</code>. Tab tak reload aapka kaam kho deta hai.</li>
<li><b>Checkpoints use karo.</b> NX-OS running configuration ka snapshot le kar roll back kar sakta hai, jo IOS engineers aksar nahi jaante.</li>
<li><b>Output filter karo.</b> <code>| include</code>, <code>| exclude</code>, <code>| section</code>, <code>| json</code> aur <code>| no-more</code> bade outputs ko sambhaalne layak banate hain.</li>
</ol>

<pre class="code"><span class="c">! out-of-band management</span>
LEAF1(config)# interface mgmt0
LEAF1(config-if)# ip address 192.0.2.21/24
LEAF1(config)# vrf context management
LEAF1(config-vrf)# ip route 0.0.0.0/0 192.0.2.1
LEAF1# ping 192.0.2.1 vrf management
<span class="c">! config ka sirf woh hissa padho jiski parwah hai</span>
LEAF1# show running-config interface Ethernet1/49
LEAF1# show running-config ospf
LEAF1# show running-config | section "interface Vlan"
<span class="c">! safe change workflow</span>
LEAF1# checkpoint BEFORE-CR1234
LEAF1# configure terminal
  ...change...
LEAF1# show diff rollback-patch checkpoint BEFORE-CR1234 running-config
LEAF1# rollback running-config checkpoint BEFORE-CR1234
LEAF1# copy running-config startup-config</pre>

<pre class="out">LEAF1# show interface brief | include Eth1/4
Eth1/49       --      eth  routed up      none                       100G(D) --
<span class="hl">Eth1/50       --      eth  routed down    Link not connected         auto(D) --</span>
LEAF1# show logging last 3
2026 Sep 29 10:14:02 LEAF1 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/50 is down (Link failure)
2026 Sep 29 10:14:02 LEAF1 %ETHPORT-5-IF_DOWN_LINK_FAILURE: Interface Ethernet1/50 is down (Link failure)
2026 Sep 29 10:14:03 LEAF1 %OSPF-5-ADJCHANGE:  ospf-UNDERLAY [4817]  Nbr 10.255.0.12 on Ethernet1/50 went DOWN</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Safe change workflow">
<rect x="10" y="70" width="110" height="44" rx="8" fill="#bae6fd"/><text x="65" y="97" text-anchor="middle" class="svg-ink" font-size="12">checkpoint</text>
<rect x="140" y="70" width="110" height="44" rx="8" fill="#fde68a"/><text x="195" y="97" text-anchor="middle" class="svg-ink" font-size="12">configure</text>
<rect x="270" y="70" width="110" height="44" rx="8" fill="#ddd6fe"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="12">verify (show)</text>
<rect x="400" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="47" text-anchor="middle" class="svg-ink" font-size="12">copy run start</text>
<rect x="400" y="120" width="110" height="44" rx="8" fill="#fed7aa"/><text x="455" y="147" text-anchor="middle" class="svg-ink" font-size="12">rollback</text>
<line x1="120" y1="92" x2="140" y2="92" stroke="#64748b" stroke-width="2"/><line x1="250" y1="92" x2="270" y2="92" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="85" x2="400" y2="45" stroke="#64748b" stroke-width="2"/><line x1="380" y1="100" x2="400" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="530" y="47" class="svg-muted" font-size="12">achha</text><text x="530" y="147" class="svg-accent" font-size="12">bura</text>
</svg><p class="cap">Checkpoint, change, verify; phir save ya roll back.</p></div>

<h3>Module summary</h3>
<table class="cmp"><tr><th>Topic</th><th>Kya yaad rakhna hai</th></tr>
<tr><td>Models</td><td>OSI 7 / TCP/IP 4; frame 1518 (tagged 1522); IP MTU 1500</td></tr>
<tr><td>Ethernet</td><td>Source seekho, destination par forward, anjaan ko flood; NX-OS MAC aging 1800 s</td></tr>
<tr><td>VLANs</td><td>802.1Q 4 bytes, 12-bit VID, 1 se 4094 usable; <code>allowed vlan add</code></td></tr>
<tr><td>STP</td><td>Sabse kam bridge ID root; Rapid-PVST+ default; edge ports + BPDU guard</td></tr>
<tr><td>IPv4</td><td>/24 VLANs, /31 links, /32 loopbacks; ARP broadcast request, unicast reply; ARP 1500 s</td></tr>
<tr><td>IPv6</td><td>/64 VLANs, /127 links; link-local fe80::; NDP ICMPv6 133 se 137</td></tr>
<tr><td>Routing</td><td>Longest match, phir AD, phir metric; ECMP per flow; VRFs management samet</td></tr>
<tr><td>OSPF / BGP</td><td>OSPF p2p underlay area 0; BGP TCP 179, eBGP 20, iBGP 200, EVPN address family</td></tr>
<tr><td>MTU</td><td>VXLAN +50 bytes; fabric 9216; DF-set pings se test</td></tr>
<tr><td>LACP / FHRP</td><td>active/passive; per flow hash; HSRP/VRRP VIP; aage vPC aur anycast gateway</td></tr></table>

<h3>Exam aur job checklist: kya aap...</h3>
<ul>
<li>Har layer ka PDU bata sakte ho aur tagged frame size nikal sakte ho?</li>
<li><code>show mac address-table</code> padh kar unknown unicast ki flooding samjha sakte ho?</li>
<li>Access port, restricted VLAN list aur alag native VLAN wala trunk configure kar sakte ho?</li>
<li>STP root dhoondh kar samjha sakte ho ki koi port alternate kyun hai?</li>
<li>/26 ko dimaag mein subnet karke /31 fabric links plan kar sakte ho?</li>
<li>Samjha sakte ho ki IPv6 host apna gateway kaise dhoondhta hai?</li>
<li>Samjha sakte ho ki /32, /24 ko kyun harata hai, aur <code>ubest/mbest: 2/0</code> ka matlab kya hai?</li>
<li>NX-OS par OSPF point-to-point aur eBGP session up kar sakte ho?</li>
<li><code>ping df-bit packet-size 8972</code> se 9216 path prove kar sakte ho?</li>
<li>LACP port-channel bana kar <code>show port-channel summary</code> padh sakte ho?</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SVI</dt><dd>Switched virtual interface: VLAN ke liye routed interface (<code>interface vlan 10</code>).</dd>
<dt>ECMP</dt><dd>Equal-cost multipath: kai best routes, flows unpar hash hote hain.</dd>
<dt>VRF</dt><dd>Ek device ke andar alag routing table.</dd>
<dt>LACP</dt><dd>Protocol jo port-channel negotiate karta hai (802.3ad / 802.1AX).</dd>
<dt>FHRP</dt><dd>First-hop redundancy protocol: HSRP, VRRP (aur kuch platforms par GLBP).</dd>
<dt>PMTUD</dt><dd>ICMP "fragmentation needed" ya "Packet Too Big" se path MTU discovery.</dd>
<dt>VTEP</dt><dd>VXLAN tunnel endpoint, aam taur par leaf loopback (agle modules).</dd>
</dl>

<div class="exam"><p><b>Sabse zyada test hone wale facts.</b> VLAN ID 12 bits vs VNI 24 bits. VXLAN UDP 4789, 50 bytes overhead. NX-OS: MAC aging 1800 s, ARP 1500 s, Rapid-PVST+ default, features enable karne padte hain, mgmt0 VRF management mein, <code>copy running-config startup-config</code> se save. OSPF AD 110, eBGP 20, iBGP 200. HSRP preempt default off.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> <code>feature</code> bhool kar syntax ko dosh dena. Default VRF mein management addresses ping karna. Bina checkpoint ke changes karna. Bina save kiye session chhodna.</p></div>

<div class="scn"><h4>Rollback jisne maintenance window bachayi</h4><p>Raat ke ek change ke dauraan ek engineer ne border leaf ke BGP sessions par naya route-map apply kiya. Ek minute ke andar <code>show bgp ipv4 unicast summary</code> ne WAN se prefix counts zero hote dikhaye, aur internet traffic ruk gaya. Kyunki runbook <code>checkpoint BEFORE-CR2291</code> se shuru hoti thi, engineer ne pehle <code>show diff rollback-patch checkpoint BEFORE-CR2291 running-config</code> chala kar exactly kya badla confirm kiya, phir <code>rollback running-config checkpoint BEFORE-CR2291</code>. Service teen minute se kam mein wapas aa gayi, aur route-map agle din lab mein theek kiya gaya.</p><p><b>Seekh:</b> NX-OS par checkpoint seconds ka kharcha hai aur outage bacha sakta hai.</p></div>

<div class="iv"><p class="q">"Aap IOS se NX-OS par ja rahe ho. Sabse pehle kin differences par nazar rakhoge?"</p><p>Strong answer: features enable karne padte hain; enable mode nahi hai, access role-based hai; interface-centric routing configuration (interfaces ke neeche OSPF tag, network statements nahi) aur per-address-family BGP neighbours; CIDR addressing; mgmt0 VRF management mein, isliye management traffic ko <code>vrf management</code> chahiye; <code>copy running-config startup-config</code> se save; aur safe changes ke liye checkpoint/rollback. Dikhao ki aap <code>show running-config interface</code> aur <code>show interface brief</code> jaante ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NX-OS: enable ki jagah roles, protocols se pehle features, har jagah CIDR.</li>
<li>mgmt0 VRF management mein hai; <code>vrf management</code> / <code>use-vrf management</code> use karo.</li>
<li>Changes se pehle checkpoint, show se verify, phir save ya roll back.</li>
<li>Ab aapke paas spine-leaf ke liye Layer-2, Layer-3, MTU aur redundancy foundation hai.</li>
<li>Aage: spine-leaf design, underlay routing, vPC, VXLAN EVPN aur ACI.</li>
</ul></div>
`}};export{e as default};