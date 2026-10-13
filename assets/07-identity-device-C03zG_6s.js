var e={id:`identity-device`,h:{en:`Identity and devices: Cloud Identity Engine, User-ID and Device-ID in policy`,hi:`Identity aur devices: policy mein Cloud Identity Engine, User-ID aur Device-ID`},body:{en:`
<p>An IP address tells you where a packet came from, not who sent it. In a branch the same laptop gets a different address tomorrow, and a printer can look like any other device. Think of a building with a guard who only checks the door number of the room a visitor came from. Better to check the visitor's name badge (the user) and the type of visitor (a laptop, a camera, a thermostat). <b>User-ID</b> gives policy the user and group; <b>Device-ID</b> gives it the device type. Both are part of the Unified SASE domain.</p>
<h3>User and group based policy</h3>
<p>Prisma SD-WAN can create path, QoS and security rules based on individual users or user groups, not only on IP addresses. For example: "finance group may use the private circuit for payment applications; guests may not".</p>
<h4>How it works (from the documentation)</h4>
<ol>
<li>A data center ION obtains User-ID mappings (IP address to username) from a User-ID agent on a PAN-OS firewall.</li>
<li>The data center ION forwards the mappings to the Prisma SD-WAN controller.</li>
<li>The <b>Cloud Identity Engine</b> maps users to groups.</li>
<li>The controller sends filtered mappings to branch sites, based on the prefixes you configure.</li>
<li>Branch IONs apply the User-ID policy and tag site-to-site traffic with usernames.</li>
<li>The remote site enforces policy using the username tags it receives.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="12">PAN-OS firewall</text><text x="75" y="63" text-anchor="middle" class="svg-muted" font-size="11">User-ID agent</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="12">DC ION</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">gets mappings</text>
<rect x="340" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="46" text-anchor="middle" class="svg-ink" font-size="12">Controller</text><text x="405" y="63" text-anchor="middle" class="svg-muted" font-size="11">filters, distributes</text>
<rect x="505" y="20" width="125" height="60" rx="10" fill="#fde68a"/><text x="567" y="46" text-anchor="middle" class="svg-ink" font-size="12">Cloud Identity</text><text x="567" y="63" text-anchor="middle" class="svg-ink" font-size="12">Engine: groups</text>
<line x1="140" y1="50" x2="175" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="340" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="505" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="150" width="130" height="60" rx="10" fill="#fed7aa"/><text x="240" y="176" text-anchor="middle" class="svg-ink" font-size="12">Branch ION</text><text x="240" y="193" text-anchor="middle" class="svg-muted" font-size="11">br-pune-01</text>
<rect x="340" y="150" width="130" height="60" rx="10" fill="#fecaca"/><text x="405" y="176" text-anchor="middle" class="svg-ink" font-size="12">Policy applied</text><text x="405" y="193" text-anchor="middle" class="svg-muted" font-size="11">per user or group</text>
<line x1="405" y1="80" x2="240" y2="150" stroke="#64748b" stroke-width="2"/><line x1="305" y1="180" x2="340" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">User-ID mappings flow from the firewall through the data center ION and the controller to branch IONs, where the policy is applied.</p></div>
<h4>Prerequisites and limits</h4>
<ul>
<li>A PAN-OS firewall and Cloud Identity Engine activation in the same tenant service group, and a TSG-compatible tenant.</li>
<li>PAN-OS 10.1.7, 10.2.3, 11.0 or higher, as listed in the documentation page I reviewed.</li>
<li>User-ID policy applies to WAN-to-LAN traffic between branch sites that have direct tunnels. It is not supported for traffic that originates in, or transits, a data center.</li>
</ul>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Open Configuration, Prisma SD-WAN, Data Centers, select the data center site and configure the connection to the User-ID agent (IP address or FQDN and port).</li>
<li>Open Configuration, Prisma SD-WAN, System, Cloud Identity Engine and choose the username format: user principal name or SAM account name.</li>
<li>Open Configuration, Prisma SD-WAN, Policies, Paths (and the QoS and security rule areas) and add users or groups to the rules you want.</li>
</ol>
<h3>Device-ID and IoT visibility</h3>
<p>Branches are full of devices that cannot run an agent: cameras, card readers, printers, medical devices. <b>Device-ID</b> identifies them. The ION inspects traffic and extracts information about discovered devices such as IP address, MAC address and vendor. It uses DHCP and ARP traffic to map addresses to MACs and to follow changing IPs. From release 6.3.1 it can also use SNMP with LLDP to discover IoT devices in a branch through recursive neighbour discovery.</p>
<table class="cmp"><tr><th>Item</th><th>Detail</th></tr><tr><td>Licenses (same TSG)</td><td>Prisma Access, IoT Security (Device Security), Prisma SD-WAN Device Security and Prisma Access remote networks</td></tr><tr><td>Activation</td><td>Automatic when Device Security and Prisma SD-WAN are onboarded to the Prisma Access account; or toggle IoT Device Visibility per branch site</td></tr><tr><td>DHCP data</td><td>ARP logs are sent by default; configure the ION as DHCP relay agent or server so DHCP logs are sent too</td></tr><tr><td>Where you see devices</td><td>The Devices tab in the IoT Security portal: attributes, plus Prisma SD-WAN site, device and interface names</td></tr><tr><td>Policy use</td><td>Security policy can match source and destination device profiles; Device-ID can combine with App-ID and User-ID</td></tr></table>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Confirm the licenses are in the same tenant service group.</li>
<li>Open Configuration, Prisma SD-WAN, Branch Sites, select the site, and check that IoT Device Visibility is on (it may already be enabled automatically).</li>
<li>Make sure the ION is DHCP relay or DHCP server for the IoT VLAN, otherwise only ARP data arrives.</li>
<li>Open the Devices tab in the IoT Security portal and confirm the branch devices appear with the site and interface names.</li>
<li>Create the policy using the device profile, and test with a known device.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> At br-chennai-03 the IP cameras sit on VLAN 30 (10.30.30.0/24). Device-ID shows 14 cameras. A security rule allows the camera device profile to reach only the video server at dc-central (10.10.60.20) and denies camera traffic to the internet. A user-based path rule gives the finance group priority to the private circuit for payment applications. If someone plugs a laptop into the camera VLAN, it does not match the camera profile and is blocked.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Expecting User-ID policy to apply to data-center-originated or transit traffic (it does not). Forgetting to configure DHCP relay or server so the ION sees DHCP, then wondering why device IP changes are not tracked. Licences in different TSGs. Using one username format in Cloud Identity Engine and another in the firewall mappings.</p></div>
<div class="exam"><p><b>Exam trap.</b> User-ID in Prisma SD-WAN: mappings come from a PAN-OS User-ID agent through a DC ION and the controller, groups come from Cloud Identity Engine, and enforcement is WAN-to-LAN between branch sites with direct tunnels. Device-ID needs IoT Security licensing, and DHCP visibility needs the ION as relay or server.</p></div>
<div class="scn"><h4>The unknown device on the camera VLAN</h4><p>Harbor Retail's Device-ID showed a new device in the camera VLAN at br-delhi-02 that matched no camera profile. It turned out to be a staff member's personal streaming box. The policy already limited that VLAN to the video server, so the box could not reach the internet, and the manager was notified through the IoT Security portal.</p><p><b>Lesson:</b> device identity makes policy follow the device, not the port it plugs into.</p></div>
<div class="iv"><p class="q">"How can Prisma SD-WAN enforce policy for users and IoT devices?"</p><p>For users, a data center ION receives User-ID mappings from a PAN-OS firewall agent, the controller and Cloud Identity Engine map users to groups and distribute the mappings, and branch IONs apply user and group based path, QoS and security rules. For devices, Device-ID uses DHCP, ARP and SNMP/LLDP information to identify IoT devices, and security policy can match device profiles.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>User-ID policy uses mappings from a PAN-OS agent, Cloud Identity Engine groups, and applies WAN-to-LAN between branches with direct tunnels.</li><li>Not supported for data-center-originated or transit traffic.</li><li>Device-ID identifies IoT devices from DHCP, ARP and (6.3.1 or later) SNMP with LLDP.</li><li>Device-ID needs IoT Security, Prisma SD-WAN Device Security and related licences in one TSG.</li><li>Configure the ION as DHCP relay or server for DHCP visibility.</li></ul></div>
`,hi:`
<p>IP address batata hai packet kahan se aaya, yeh nahi ki kisne bheja. Branch mein wahi laptop kal alag address leta hai, aur printer kisi bhi doosre device jaisa lag sakta hai. Ek building socho jiska guard sirf us kamre ka door number dekhta hai jahan se visitor aaya. Behtar hai ki visitor ka name badge (user) aur visitor ka type (laptop, camera, thermostat) dekha jaaye. <b>User-ID</b> policy ko user aur group deta hai; <b>Device-ID</b> device type deta hai. Dono Unified SASE domain ka hissa hain.</p>
<h3>User aur group based policy</h3>
<p>Prisma SD-WAN sirf IP addresses par nahi, individual users ya user groups par bhi path, QoS aur security rules bana sakta hai. Jaise: "finance group payment applications ke liye private circuit use kar sakta hai; guests nahi".</p>
<h4>Yeh kaise kaam karta hai (documentation ke hisaab se)</h4>
<ol>
<li>Data center ION PAN-OS firewall ke User-ID agent se User-ID mappings (IP address se username) leta hai.</li>
<li>Data center ION mappings ko Prisma SD-WAN controller ko forward karta hai.</li>
<li><b>Cloud Identity Engine</b> users ko groups se map karta hai.</li>
<li>Controller aapke configure kiye prefixes ke hisaab se filtered mappings branch sites ko bhejta hai.</li>
<li>Branch IONs User-ID policy apply karte hain aur site-to-site traffic ko usernames ke saath tag karte hain.</li>
<li>Remote site mile hue username tags se policy enforce karti hai.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="diagram">
<rect x="10" y="20" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="75" y="46" text-anchor="middle" class="svg-ink" font-size="12">PAN-OS firewall</text><text x="75" y="63" text-anchor="middle" class="svg-muted" font-size="11">User-ID agent</text>
<rect x="175" y="20" width="130" height="60" rx="10" fill="#bae6fd"/><text x="240" y="46" text-anchor="middle" class="svg-ink" font-size="12">DC ION</text><text x="240" y="63" text-anchor="middle" class="svg-muted" font-size="11">mappings leta hai</text>
<rect x="340" y="20" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="405" y="46" text-anchor="middle" class="svg-ink" font-size="12">Controller</text><text x="405" y="63" text-anchor="middle" class="svg-muted" font-size="11">filter, distribute</text>
<rect x="505" y="20" width="125" height="60" rx="10" fill="#fde68a"/><text x="567" y="46" text-anchor="middle" class="svg-ink" font-size="12">Cloud Identity</text><text x="567" y="63" text-anchor="middle" class="svg-ink" font-size="12">Engine: groups</text>
<line x1="140" y1="50" x2="175" y2="50" stroke="#64748b" stroke-width="2"/><line x1="305" y1="50" x2="340" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="505" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="150" width="130" height="60" rx="10" fill="#fed7aa"/><text x="240" y="176" text-anchor="middle" class="svg-ink" font-size="12">Branch ION</text><text x="240" y="193" text-anchor="middle" class="svg-muted" font-size="11">br-pune-01</text>
<rect x="340" y="150" width="130" height="60" rx="10" fill="#fecaca"/><text x="405" y="176" text-anchor="middle" class="svg-ink" font-size="12">Policy applied</text><text x="405" y="193" text-anchor="middle" class="svg-muted" font-size="11">user ya group ke hisaab se</text>
<line x1="405" y1="80" x2="240" y2="150" stroke="#64748b" stroke-width="2"/><line x1="305" y1="180" x2="340" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">User-ID mappings firewall se data center ION aur controller ke zariye branch IONs tak jaate hain, jahan policy apply hoti hai.</p></div>
<h4>Prerequisites aur limits</h4>
<ul>
<li>Same tenant service group mein PAN-OS firewall aur Cloud Identity Engine activation, aur TSG-compatible tenant.</li>
<li>PAN-OS 10.1.7, 10.2.3, 11.0 ya higher, jaisa maine review kiye documentation page mein listed hai.</li>
<li>User-ID policy un branch sites ke beech WAN-to-LAN traffic par lagu hoti hai jinke direct tunnels hain. Woh us traffic ke liye supported nahi jo data center mein originate ho ya data center se transit ho.</li>
</ul>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Configuration, Prisma SD-WAN, Data Centers kholo, data center site chuno aur User-ID agent se connection configure karo (IP address ya FQDN aur port).</li>
<li>Configuration, Prisma SD-WAN, System, Cloud Identity Engine kholo aur username format chuno: user principal name ya SAM account name.</li>
<li>Configuration, Prisma SD-WAN, Policies, Paths (aur QoS tatha security rule areas) kholo aur jin rules mein chahiye unme users ya groups jodo.</li>
</ol>
<h3>Device-ID aur IoT visibility</h3>
<p>Branches mein aise devices bhare hain jo agent nahi chala sakte: cameras, card readers, printers, medical devices. <b>Device-ID</b> unhe pehchanta hai. ION traffic inspect karke discovered devices ki jaankari nikalta hai, jaise IP address, MAC address aur vendor. Woh DHCP aur ARP traffic se addresses ko MAC se map karta hai aur badalte IPs ko track karta hai. Release 6.3.1 se woh branch mein IoT devices discover karne ke liye recursive neighbour discovery se SNMP ke saath LLDP bhi use kar sakta hai.</p>
<table class="cmp"><tr><th>Item</th><th>Detail</th></tr><tr><td>Licenses (same TSG)</td><td>Prisma Access, IoT Security (Device Security), Prisma SD-WAN Device Security aur Prisma Access remote networks</td></tr><tr><td>Activation</td><td>Automatic jab Device Security aur Prisma SD-WAN Prisma Access account par onboard hon; ya har branch site par IoT Device Visibility toggle karo</td></tr><tr><td>DHCP data</td><td>ARP logs default se bhejte hain; DHCP logs bhejne ke liye ION ko DHCP relay agent ya server configure karo</td></tr><tr><td>Devices kahan dikhte hain</td><td>IoT Security portal ka Devices tab: attributes, saath mein Prisma SD-WAN site, device aur interface names</td></tr><tr><td>Policy use</td><td>Security policy source aur destination device profiles match kar sakti hai; Device-ID App-ID aur User-ID ke saath mil sakta hai</td></tr></table>
<h4>Portal walk-through (not run in the simulator)</h4>
<ol>
<li>Confirm karo ki licenses same tenant service group mein hain.</li>
<li>Configuration, Prisma SD-WAN, Branch Sites kholo, site chuno, aur check karo ki IoT Device Visibility on hai (apne aap enabled ho sakta hai).</li>
<li>Dekho ki ION IoT VLAN ke liye DHCP relay ya DHCP server hai, warna sirf ARP data aata hai.</li>
<li>IoT Security portal ka Devices tab kholo aur confirm karo ki branch devices site aur interface names ke saath dikh rahe hain.</li>
<li>Device profile use karke policy banao aur known device se test karo.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> br-chennai-03 par IP cameras VLAN 30 (10.30.30.0/24) mein hain. Device-ID 14 cameras dikhata hai. Ek security rule camera device profile ko sirf dc-central ke video server (10.10.60.20) tak jaane deti hai aur camera traffic ko internet se deny karti hai. Ek user-based path rule finance group ko payment applications ke liye private circuit ki priority deti hai. Agar koi camera VLAN mein laptop lagaye, woh camera profile se match nahi karta aur block ho jaata hai.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> User-ID policy se data-center-originated ya transit traffic par lagu hone ki ummeed (nahi hoti). DHCP relay ya server configure karna bhool jaana, phir sochna ki device IP changes track kyun nahi ho rahe. Alag TSGs mein licences. Cloud Identity Engine mein ek username format aur firewall mappings mein doosra.</p></div>
<div class="exam"><p><b>Exam trap.</b> Prisma SD-WAN mein User-ID: mappings PAN-OS User-ID agent se DC ION aur controller ke zariye aate hain, groups Cloud Identity Engine se aate hain, aur enforcement direct tunnels wale branch sites ke beech WAN-to-LAN hota hai. Device-ID ko IoT Security licensing chahiye, aur DHCP visibility ke liye ION ka relay ya server hona zaroori hai.</p></div>
<div class="scn"><h4>Camera VLAN par anjaan device</h4><p>Harbor Retail ke Device-ID ne br-delhi-02 ke camera VLAN mein ek naya device dikhaya jo kisi camera profile se match nahi karta tha. Woh ek staff member ka personal streaming box nikla. Policy pehle se us VLAN ko video server tak limit karti thi, isliye box internet tak nahi pahunch saka, aur manager ko IoT Security portal se notify kiya gaya.</p><p><b>Seekh:</b> device identity policy ko device ke saath chalati hai, us port ke saath nahi jismein woh lagta hai.</p></div>
<div class="iv"><p class="q">"Prisma SD-WAN users aur IoT devices ke liye policy kaise enforce karta hai?"</p><p>Users ke liye, data center ION PAN-OS firewall agent se User-ID mappings leta hai, controller aur Cloud Identity Engine users ko groups se map karke mappings distribute karte hain, aur branch IONs user aur group based path, QoS aur security rules apply karte hain. Devices ke liye, Device-ID DHCP, ARP aur SNMP/LLDP jaankari se IoT devices pehchanta hai, aur security policy device profiles match kar sakti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>User-ID policy PAN-OS agent ke mappings aur Cloud Identity Engine groups use karti hai, aur direct tunnels wale branches ke beech WAN-to-LAN lagu hoti hai.</li><li>Data-center-originated ya transit traffic ke liye supported nahi.</li><li>Device-ID DHCP, ARP aur (6.3.1 ya baad) SNMP ke saath LLDP se IoT devices pehchanta hai.</li><li>Device-ID ko ek TSG mein IoT Security, Prisma SD-WAN Device Security aur related licences chahiye.</li><li>DHCP visibility ke liye ION ko DHCP relay ya server configure karo.</li></ul></div>
`}};export{e as default};