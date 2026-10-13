var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with one flat switch and finished with a segmented, routed, redundant and properly installed network. This chapter pulls everything together for revision before the lab, the exam and the interview.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">Switch basics</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">learn, forward, flood</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VLANs and ports</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">access, voice, trunk</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">Inter-VLAN routing</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">sub-interfaces, SVIs</text>
<rect x="20" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="13">Interface settings</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex, MTU</text>
<rect x="230" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">Redundancy</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">STP, LACP</text>
<rect x="440" y="100" width="180" height="50" rx="8" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="13">Physical install</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">MDF/IDF, power, env</text>
<rect x="160" y="170" width="320" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot: port, VLAN, trunk, gateway, host</text>
</svg><p class="cap">Objectives 2.2 and 2.4, plus the troubleshooting habit that ties them together.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain how a switch learns source MACs and forwards, filters or floods frames, and read <code>show mac address-table</code>.</li>
<li>Count collision domains and broadcast domains on a switch with VLANs.</li>
<li>Create and name VLANs, explain VLAN ranges and the VLAN database, and design one VLAN per role and subnet.</li>
<li>Configure access ports and a voice VLAN, and verify with <code>show vlan brief</code> and <code>show interfaces switchport</code>.</li>
<li>Configure an 802.1Q trunk, edit the allowed list safely with <code>add</code>, set the native VLAN, and read <code>show interfaces trunk</code>.</li>
<li>Build router-on-a-stick sub-interfaces and layer 3 switch SVIs, and explain the packet walk between VLANs.</li>
<li>Diagnose a duplex mismatch and an MTU mismatch; explain when jumbo frames help.</li>
<li>Explain STP root election, port roles, RSTP, PortFast and BPDU guard.</li>
<li>Configure an LACP port-channel and read <code>show etherchannel summary</code>.</li>
<li>Describe MDF/IDF, rack units, airflow direction, patch and fibre panels, UPS/PDU, power load, voltage, temperature, humidity and fire suppression.</li>
<li>Troubleshoot a VLAN ticket in path order and document the result.</li>
</ul>

<h3>Lab 1 in one sequence: separate staff and guests</h3>
<pre class="code"><span class="c">! SW1</span>
enable
configure terminal
vlan 10
 name STAFF
vlan 20
 name GUEST
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 20
interface GigabitEthernet0/0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
end
<span class="c">! R1</span>
enable
configure terminal
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
end
<span class="c">! Verify: SW1 show vlan brief, then PC1 ping 192.168.20.10</span></pre>
<p><b>Lab 2 (INC-2107)</b> in two fixes: <code>show vlan brief</code> shows Gi0/2 in VLAN 30, so <code>switchport access vlan 20</code>; <code>show interfaces trunk</code> shows only 10,30 allowed, so <code>switchport trunk allowed vlan add 20</code>. Then verify PC2 to 192.168.20.1 and 192.168.10.10.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VLAN</dt><dd>Logical layer 2 broadcast domain identified by a 12-bit ID.</dd>
<dt>Access port</dt><dd>Carries one VLAN, untagged, for end devices.</dd>
<dt>Voice VLAN</dt><dd>Second, tagged VLAN on an access port for an IP phone.</dd>
<dt>Trunk / 802.1Q</dt><dd>Link carrying many VLANs using a 4-byte tag.</dd>
<dt>Native VLAN</dt><dd>The single untagged VLAN on a trunk; must match on both ends.</dd>
<dt>SVI</dt><dd>Switch virtual interface: a layer 3 interface for a VLAN (<code>interface vlan N</code>).</dd>
<dt>Router-on-a-stick</dt><dd>One router port on a trunk with a dot1Q sub-interface per VLAN.</dd>
<dt>STP / RSTP</dt><dd>802.1D / 802.1w protocols that block redundant paths to prevent loops.</dd>
<dt>LACP</dt><dd>802.3ad/802.1AX protocol that bundles links into one logical port-channel.</dd>
<dt>MTU / jumbo frame</dt><dd>Largest packet per frame (1500 standard); jumbo is about 9000.</dd>
<dt>MDF / IDF</dt><dd>Main wiring room with demarc and core / floor wiring closet with access switches.</dd>
<dt>UPS / PDU</dt><dd>Battery backup and power conditioning / rack power distribution strip.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Domains</td><td>Each switch port = collision domain; each VLAN = broadcast domain</td></tr>
<tr><td>VLAN IDs</td><td>1 default, 1 to 4094 usable, 12-bit field</td></tr>
<tr><td>802.1Q</td><td>4-byte tag, TPID 0x8100, 3-bit PCP (CoS), 12-bit VID; native VLAN untagged</td></tr>
<tr><td>Inter-VLAN</td><td>Needs router, L3 switch (SVI + <code>ip routing</code>) or firewall</td></tr>
<tr><td>Duplex mismatch</td><td>Late collisions on half side, CRC errors on full side</td></tr>
<tr><td>MTU</td><td>1500 standard; jumbo about 9000; must match end to end</td></tr>
<tr><td>STP</td><td>Lowest bridge ID = root; default priority 32768; RSTP converges fast</td></tr>
<tr><td>LACP</td><td>active/passive; passive + passive fails; per-flow load sharing</td></tr>
<tr><td>Racks</td><td>1U = 1.75 in; 42U common; port-side intake vs exhaust</td></tr>
<tr><td>Environment</td><td>Low humidity = ESD, high = condensation; clean-agent suppression</td></tr>
</table>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Task</th><th>Command</th></tr>
<tr><td>Which port is a MAC on?</td><td><code>show mac address-table address H.H.H</code></td></tr>
<tr><td>VLANs and access ports</td><td><code>show vlan brief</code></td></tr>
<tr><td>One port's mode and VLANs</td><td><code>show interfaces Gi0/1 switchport</code></td></tr>
<tr><td>Trunks, allowed and native VLANs</td><td><code>show interfaces trunk</code></td></tr>
<tr><td>Speed, duplex, status</td><td><code>show interfaces status</code></td></tr>
<tr><td>Gateways up?</td><td><code>show ip interface brief</code></td></tr>
<tr><td>STP roles and root</td><td><code>show spanning-tree vlan 10</code></td></tr>
<tr><td>Port-channels</td><td><code>show etherchannel summary</code></td></tr>
<tr><td>PoE budget</td><td><code>show power inline</code></td></tr>
</table>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Trunk allowed list without <code>add</code>; one-sided speed/duplex; forgetting <code>no shutdown</code> on the router's parent interface; forgetting <code>ip routing</code>; PortFast on uplinks; wrong airflow modules; ignoring PoE in power budgets.</p></div>

<div class="exam"><p><b>Exam strategy.</b> In scenario questions, underline who is affected. "Two VLANs cannot talk" = routing. "One VLAN broken over a trunk" = allowed list or native VLAN. "Slow link, late collisions" = duplex. "Large transfers fail, pings work" = MTU. "Network melts when a cable is added" = loop / STP. "Switch overheats" = airflow or environment.</p></div>

<div class="scn"><h4>Day one at a new job</h4><p>A fresher joined a managed-services company and was handed a ticket: "New floor, 60 desks, phones and PCs, guest Wi-Fi, go live Monday." She wrote a VLAN table (STAFF 10, GUEST 20, PRINTERS 30, VOICE 150, MGMT 99, PARKING 999), configured access ports with voice VLAN in ranges, built an LACP trunk to the distribution switch with native VLAN 999, confirmed SVIs and <code>ip routing</code> on the distribution switch, set it as STP root, enabled PortFast and BPDU guard on desk ports, checked the IDF's UPS and PoE budget, and verified with the cheat-sheet commands. Monday was quiet, which is the best outcome in networking.</p><p><b>Lesson:</b> this module is a complete, real deliverable, not a set of separate facts.</p></div>

<div class="iv"><p class="q">"Tell me about a switching network you would build for a small office."</p><p>Strong answer: walk through the layers in order: VLAN per role with one subnet each; access ports with voice VLAN; 802.1Q trunks with a pruned allowed list and an unused native VLAN; inter-VLAN routing on SVIs or router-on-a-stick with security policy at that point; RSTP with a chosen root, PortFast and BPDU guard at the edge; LACP uplinks; consistent MTU; and the IDF basics (UPS sized for PoE, locked rack, airflow). Finish with how you would verify it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLANs segment, trunks carry, layer 3 devices route between VLANs.</li>
<li>Access and voice ports, 802.1Q tags and the native VLAN are the core of objective 2.2.</li>
<li>STP prevents loops; LACP adds bandwidth and redundancy; speed, duplex and MTU must match.</li>
<li>Objective 2.4: MDF/IDF, racks and airflow, panels, UPS/PDU, load, voltage and environment.</li>
<li>Troubleshoot in path order: port, VLAN, trunk, gateway, host; then verify and document.</li>
</ul></div>
`,hi:`
<p>Aapne ek flat switch se shuru kiya aur ek segmented, routed, redundant aur theek se installed network par khatam kiya. Yeh chapter lab, exam aur interview se pehle revision ke liye sab kuch ek saath laata hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">Switch basics</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">learn, forward, flood</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">VLANs aur ports</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">access, voice, trunk</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">Inter-VLAN routing</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">sub-interfaces, SVIs</text>
<rect x="20" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="13">Interface settings</text><text x="110" y="140" text-anchor="middle" class="svg-muted" font-size="12">speed, duplex, MTU</text>
<rect x="230" y="100" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">Redundancy</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">STP, LACP</text>
<rect x="440" y="100" width="180" height="50" rx="8" fill="#fed7aa"/><text x="530" y="122" text-anchor="middle" class="svg-ink" font-size="13">Physical install</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">MDF/IDF, power, env</text>
<rect x="160" y="170" width="320" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot: port, VLAN, trunk, gateway, host</text>
</svg><p class="cap">Objectives 2.2 aur 2.4, plus troubleshooting ki aadat jo inhe jodti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki switch source MACs kaise learn karta hai aur frames ko kaise forward, filter ya flood karta hai, aur <code>show mac address-table</code> padho.</li>
<li>VLANs wale switch par collision domains aur broadcast domains gino.</li>
<li>VLANs banao aur naam do, VLAN ranges aur VLAN database samjhao, aur har role aur subnet ka ek VLAN design karo.</li>
<li>Access ports aur voice VLAN configure karo, aur <code>show vlan brief</code> aur <code>show interfaces switchport</code> se verify karo.</li>
<li>802.1Q trunk configure karo, allowed list ko <code>add</code> se safely edit karo, native VLAN set karo, aur <code>show interfaces trunk</code> padho.</li>
<li>Router-on-a-stick sub-interfaces aur layer 3 switch SVIs banao, aur VLANs ke beech packet walk samjhao.</li>
<li>Duplex mismatch aur MTU mismatch diagnose karo; batao jumbo frames kab madad karte hain.</li>
<li>STP root election, port roles, RSTP, PortFast aur BPDU guard samjhao.</li>
<li>LACP port-channel configure karo aur <code>show etherchannel summary</code> padho.</li>
<li>MDF/IDF, rack units, airflow direction, patch aur fibre panels, UPS/PDU, power load, voltage, temperature, humidity aur fire suppression describe karo.</li>
<li>VLAN ticket ko path order mein troubleshoot karo aur result document karo.</li>
</ul>

<h3>Lab 1 ek sequence mein: staff aur guests alag karo</h3>
<pre class="code"><span class="c">! SW1</span>
enable
configure terminal
vlan 10
 name STAFF
vlan 20
 name GUEST
interface GigabitEthernet0/1
 switchport mode access
 switchport access vlan 10
interface GigabitEthernet0/2
 switchport mode access
 switchport access vlan 20
interface GigabitEthernet0/0
 switchport mode trunk
 switchport trunk allowed vlan 10,20
end
<span class="c">! R1</span>
enable
configure terminal
interface GigabitEthernet0/0
 no shutdown
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
end
<span class="c">! Verify: SW1 par show vlan brief, phir PC1 se ping 192.168.20.10</span></pre>
<p><b>Lab 2 (INC-2107)</b> do fixes mein: <code>show vlan brief</code> Gi0/2 ko VLAN 30 mein dikhata hai, isliye <code>switchport access vlan 20</code>; <code>show interfaces trunk</code> sirf 10,30 allowed dikhata hai, isliye <code>switchport trunk allowed vlan add 20</code>. Phir PC2 se 192.168.20.1 aur 192.168.10.10 verify karo.</p>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>VLAN</dt><dd>Logical layer 2 broadcast domain jise 12-bit ID se pehchana jaata hai.</dd>
<dt>Access port</dt><dd>End devices ke liye ek VLAN untagged carry karta hai.</dd>
<dt>Voice VLAN</dt><dd>IP phone ke liye access port par doosra, tagged VLAN.</dd>
<dt>Trunk / 802.1Q</dt><dd>4-byte tag use karke kai VLANs carry karne wala link.</dd>
<dt>Native VLAN</dt><dd>Trunk par akela untagged VLAN; dono ends par match hona chahiye.</dd>
<dt>SVI</dt><dd>Switch virtual interface: VLAN ka layer 3 interface (<code>interface vlan N</code>).</dd>
<dt>Router-on-a-stick</dt><dd>Trunk par ek router port, har VLAN ka ek dot1Q sub-interface.</dd>
<dt>STP / RSTP</dt><dd>802.1D / 802.1w protocols jo loops rokne ke liye redundant paths block karte hain.</dd>
<dt>LACP</dt><dd>802.3ad/802.1AX protocol jo links ko ek logical port-channel mein bundle karta hai.</dd>
<dt>MTU / jumbo frame</dt><dd>Har frame mein sabse bada packet (standard 1500); jumbo lagbhag 9000.</dd>
<dt>MDF / IDF</dt><dd>Demarc aur core wala main wiring room / access switches wala floor wiring closet.</dd>
<dt>UPS / PDU</dt><dd>Battery backup aur power conditioning / rack power distribution strip.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Domains</td><td>Har switch port = collision domain; har VLAN = broadcast domain</td></tr>
<tr><td>VLAN IDs</td><td>1 default, 1 se 4094 usable, 12-bit field</td></tr>
<tr><td>802.1Q</td><td>4-byte tag, TPID 0x8100, 3-bit PCP (CoS), 12-bit VID; native VLAN untagged</td></tr>
<tr><td>Inter-VLAN</td><td>Router, L3 switch (SVI + <code>ip routing</code>) ya firewall chahiye</td></tr>
<tr><td>Duplex mismatch</td><td>Half side par late collisions, full side par CRC errors</td></tr>
<tr><td>MTU</td><td>1500 standard; jumbo lagbhag 9000; end to end match hona chahiye</td></tr>
<tr><td>STP</td><td>Sabse kam bridge ID = root; default priority 32768; RSTP tez converge karta hai</td></tr>
<tr><td>LACP</td><td>active/passive; passive + passive fail; per-flow load sharing</td></tr>
<tr><td>Racks</td><td>1U = 1.75 in; 42U common; port-side intake vs exhaust</td></tr>
<tr><td>Environment</td><td>Kam humidity = ESD, zyada = condensation; clean-agent suppression</td></tr>
</table>

<h3>Command cheat sheet</h3>
<table class="cmp"><tr><th>Kaam</th><th>Command</th></tr>
<tr><td>MAC kis port par hai?</td><td><code>show mac address-table address H.H.H</code></td></tr>
<tr><td>VLANs aur access ports</td><td><code>show vlan brief</code></td></tr>
<tr><td>Ek port ka mode aur VLANs</td><td><code>show interfaces Gi0/1 switchport</code></td></tr>
<tr><td>Trunks, allowed aur native VLANs</td><td><code>show interfaces trunk</code></td></tr>
<tr><td>Speed, duplex, status</td><td><code>show interfaces status</code></td></tr>
<tr><td>Gateways up hain?</td><td><code>show ip interface brief</code></td></tr>
<tr><td>STP roles aur root</td><td><code>show spanning-tree vlan 10</code></td></tr>
<tr><td>Port-channels</td><td><code>show etherchannel summary</code></td></tr>
<tr><td>PoE budget</td><td><code>show power inline</code></td></tr>
</table>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bachna hai.</b> <code>add</code> ke bina trunk allowed list; ek-tarfa speed/duplex; router ke parent interface par <code>no shutdown</code> bhoolna; <code>ip routing</code> bhoolna; uplinks par PortFast; galat airflow modules; power budgets mein PoE ignore karna.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Scenario questions mein underline karo ki kaun affected hai. "Do VLANs baat nahi kar sakte" = routing. "Trunk par ek VLAN toota" = allowed list ya native VLAN. "Slow link, late collisions" = duplex. "Bade transfers fail, pings chalte hain" = MTU. "Cable jodte hi network pighal gaya" = loop / STP. "Switch overheat hota hai" = airflow ya environment.</p></div>

<div class="scn"><h4>Nayi job ka pehla din</h4><p>Ek fresher ne managed-services company join ki aur use ticket mila: "Naya floor, 60 desks, phones aur PCs, guest Wi-Fi, Monday ko go live." Usne VLAN table likhi (STAFF 10, GUEST 20, PRINTERS 30, VOICE 150, MGMT 99, PARKING 999), ranges mein voice VLAN ke saath access ports configure kiye, distribution switch tak native VLAN 999 ke saath LACP trunk banaya, distribution switch par SVIs aur <code>ip routing</code> confirm kiya, use STP root set kiya, desk ports par PortFast aur BPDU guard enable kiya, IDF ka UPS aur PoE budget check kiya, aur cheat-sheet commands se verify kiya. Monday shaant raha, jo networking mein sabse achha result hai.</p><p><b>Seekh:</b> yeh module ek complete, real deliverable hai, alag-alag facts ka set nahi.</p></div>

<div class="iv"><p class="q">"Chhote office ke liye aap kaisa switching network banaoge, batao."</p><p>Strong answer: layers ko order mein samjhao: har role ka VLAN, har ek ka ek subnet; voice VLAN ke saath access ports; pruned allowed list aur unused native VLAN wale 802.1Q trunks; SVIs ya router-on-a-stick par inter-VLAN routing, security policy usi point par; chosen root ke saath RSTP, edge par PortFast aur BPDU guard; LACP uplinks; consistent MTU; aur IDF basics (PoE ke hisaab se sized UPS, locked rack, airflow). Aakhir mein batao ki aap ise kaise verify karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLANs segment karte hain, trunks carry karte hain, layer 3 devices VLANs ke beech route karte hain.</li>
<li>Access aur voice ports, 802.1Q tags aur native VLAN objective 2.2 ka core hain.</li>
<li>STP loops rokta hai; LACP bandwidth aur redundancy jodta hai; speed, duplex aur MTU match hone chahiye.</li>
<li>Objective 2.4: MDF/IDF, racks aur airflow, panels, UPS/PDU, load, voltage aur environment.</li>
<li>Path order mein troubleshoot karo: port, VLAN, trunk, gateway, host; phir verify aur document karo.</li>
</ul></div>
`}};export{e as default};