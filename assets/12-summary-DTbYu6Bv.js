var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with an office tower shared by many companies and a courier van crossing the city. You now know the real names: hypervisors and virtual switches share one server, VRFs share one router, GRE carries private packets across public networks, and IPsec locks them. This chapter is your revision sheet before the lab exam, the written exam and the interview.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Choosing a technology">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">What do you need?</text>
<rect x="10" y="100" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">Separate tables</text><text x="80" y="140" text-anchor="middle" class="svg-accent" font-size="13">VRF</text>
<rect x="170" y="100" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="12">Carry anything</text><text x="240" y="140" text-anchor="middle" class="svg-accent" font-size="13">GRE</text>
<rect x="330" y="100" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">Encrypt LAN to LAN</text><text x="400" y="140" text-anchor="middle" class="svg-accent" font-size="13">Crypto map</text>
<rect x="490" y="100" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="12">Encrypt + IGP</text><text x="560" y="140" text-anchor="middle" class="svg-accent" font-size="13">GRE/IPsec, VTI</text>
<line x1="280" y1="50" x2="80" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="50" x2="240" y2="100" stroke="#64748b" stroke-width="1.5"/>
<line x1="340" y1="50" x2="400" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="50" x2="560" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Real designs combine them: a tunnel in a VRF, protected by IPsec</text>
</svg><p class="cap">One question, four answers. Most networks use more than one.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain type 1 versus type 2 hypervisors with examples, and what a VM consists of.</li>
<li>Describe a virtual switch, port groups, uplinks and VST/EST/VGT tagging.</li>
<li>Create a VRF with <code>vrf definition</code>, assign interfaces, re-add the IP, add per-VRF routes and verify with <code>ping vrf</code>.</li>
<li>Explain RD versus RT and describe route leaking options.</li>
<li>Build a GRE tunnel, route LANs through it, add keepalives, set <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code>.</li>
<li>Recognise and fix recursive routing from the log and the routing table.</li>
<li>Explain ESP versus AH, tunnel versus transport mode, IKEv1 phases, IKEv2 exchanges and NAT-T.</li>
<li>Configure and verify a crypto-map VPN, GRE over IPsec and a VTI.</li>
<li>Troubleshoot bottom up: underlay, interface, routing, phase 1, phase 2, data plane.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hypervisor</dt><dd>Software that runs VMs; type 1 on hardware, type 2 on a host OS.</dd>
<dt>vSwitch / port group</dt><dd>Software switch in the hypervisor; port groups hold VLAN and policy for vNICs.</dd>
<dt>VRF</dt><dd>Separate routing and forwarding table on one router.</dd>
<dt>RD / RT</dt><dd>Route distinguisher makes prefixes unique in MP-BGP; route target controls import and export.</dd>
<dt>Underlay / overlay</dt><dd>Transport network / virtual network built on top with tunnels.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation, IP protocol 47, 4-byte header, no encryption.</dd>
<dt>Recursive routing</dt><dd>The route to a tunnel's destination points into the tunnel; causes RECURDOWN and flapping.</dd>
<dt>ESP / AH</dt><dd>IPsec protocols 50 (encrypts) and 51 (integrity only, breaks with NAT).</dd>
<dt>ISAKMP SA / IPsec SA</dt><dd>Phase 1 bidirectional management SA / phase 2 one-way data SAs with SPIs.</dd>
<dt>Transform set</dt><dd>The phase 2 algorithms and mode, for example esp-aes 256 esp-sha256-hmac.</dd>
<dt>Proxy ACL</dt><dd>Crypto ACL defining interesting traffic; must be mirrored on both peers.</dd>
<dt>NAT-T</dt><dd>ESP inside UDP 4500 when NAT is detected.</dd>
<dt>VTI</dt><dd>IPsec tunnel interface, <code>tunnel mode ipsec ipv4</code>, no GRE.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Hypervisors</td><td>ESXi, Hyper-V, KVM = type 1; VirtualBox, Workstation = type 2</td></tr>
<tr><td>VRF interface</td><td><code>vrf forwarding</code> removes the IP; RD optional for VRF-lite</td></tr>
<tr><td>GRE</td><td>Protocol 47; 24 bytes overhead; transport MTU 1476; carries multicast</td></tr>
<tr><td>Tunnel up/up</td><td>Source up + route to destination; keepalives for real liveness</td></tr>
<tr><td>Recursion</td><td><code>%TUN-5-RECURDOWN</code>; keep underlay prefixes out of the overlay</td></tr>
<tr><td>IPsec ports</td><td>UDP 500 (IKE), UDP 4500 (NAT-T), ESP 50, AH 51</td></tr>
<tr><td>IKEv1</td><td>Main Mode 6, Aggressive 3, Quick Mode 3; HAGLE</td></tr>
<tr><td>IKEv2</td><td>IKE_SA_INIT + IKE_AUTH = 4 messages; not compatible with IKEv1</td></tr>
<tr><td>States</td><td>QM_IDLE good; MM_NO_STATE = no reply or policy; MM_KEY_EXCH = key</td></tr>
<tr><td>GRE over IPsec</td><td>Transport mode; idents protocol 47; <code>tunnel protection ipsec profile</code></td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! VRF</span>
vrf definition CUST-A / address-family ipv4
interface Gi0/1 / vrf forwarding CUST-A / ip address ...
ip route vrf CUST-A 0.0.0.0 0.0.0.0 10.255.1.2
show vrf | show ip route vrf CUST-A | ping vrf CUST-A 10.255.1.2
<span class="c">! GRE</span>
interface Tunnel0 / tunnel source Gi0/0 / tunnel destination 100.64.22.2
keepalive 5 3 / ip mtu 1400 / ip tcp adjust-mss 1360 / tunnel vrf INET
show interfaces tunnel 0 | show ip cef 100.64.22.2
<span class="c">! IPsec</span>
crypto isakmp policy 10 / crypto isakmp key KEY address PEER
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac / mode tunnel|transport
crypto map MAP 10 ipsec-isakmp / set peer / set transform-set / match address
crypto ipsec profile PROF / tunnel protection ipsec profile PROF
tunnel mode ipsec ipv4
show crypto isakmp sa | show crypto ipsec sa | show crypto session | show crypto ikev2 sa</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> IP before <code>vrf forwarding</code>. Tunnel destination set to the far tunnel IP. Non-mirrored crypto ACLs. Testing a crypto map from the router itself. Forgetting NAT exemption. Tunnel protection on one side only.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> GRE has no security; AH has no encryption; RD is not RT; IPsec SAs are one-way; transform set names are local; a crypto map does not carry multicast; VTI line protocol follows the SA.</p></div>

<div class="scn"><h4>Putting it all together</h4><p>A bank's new branch in Kochi needed three things: separate networks for staff, ATMs and guests; a secure link to the Mumbai data center over broadband; and OSPF so new subnets appear automatically. The design used three VRFs on the branch router, one IKEv2 VTI per VRF towards Mumbai with each tunnel interface placed in its VRF, a front-door VRF INET for the broadband link, <code>ip mtu 1400</code> and <code>ip tcp adjust-mss 1360</code> on every tunnel, and OSPF per VRF over the tunnels with filters that never advertise the INET prefixes. Day-one testing followed the six-step workflow.</p><p><b>Lesson:</b> ENCOR domain 2.0 is not a list of separate commands; it is one toolkit for building isolated, secure overlays.</p></div>

<div class="iv"><p class="q">"Design a secure branch link that supports OSPF and keeps guest traffic separate. Which technologies do you use?"</p><p>VRFs to separate staff and guest routing, a front-door VRF for the internet link to avoid recursive routing, and an IPsec VTI (or GRE over IPsec) per VRF so OSPF runs over an encrypted, routable interface. Add IKEv2 with strong algorithms (AES-256, SHA-256, DH 14 or 19+), MTU and MSS tuning, and DPD. Explain how you would verify each layer: <code>show vrf</code>, <code>show interfaces tunnel</code>, <code>show crypto ikev2 sa</code>, <code>show crypto ipsec sa</code>, and OSPF neighbours per VRF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device virtualization: hypervisors (type 1/2), VMs, virtual switches.</li>
<li>Data path virtualization: VRFs separate routing; GRE carries; IPsec secures.</li>
<li>Crypto map for simple ACL-based VPNs; GRE over IPsec or VTI when you need routing protocols.</li>
<li>Recursive routing and MTU are the two classic tunnel faults.</li>
<li>Troubleshoot bottom up and verify with the right show command for each layer.</li>
</ul></div>
`,hi:`
<p>Aapne shuru kiya tha kai companies ki shared office tower aur shehar cross karti courier van se. Ab aap asli naam jaante ho: hypervisors aur virtual switches ek server share karte hain, VRFs ek router share karte hain, GRE private packets ko public networks ke paar le jaata hai, aur IPsec unhe lock karta hai. Yeh chapter lab exam, written exam aur interview se pehle aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Technology chunna">
<rect x="220" y="10" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Aapko kya chahiye?</text>
<rect x="10" y="100" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="122" text-anchor="middle" class="svg-ink" font-size="12">Alag tables</text><text x="80" y="140" text-anchor="middle" class="svg-accent" font-size="13">VRF</text>
<rect x="170" y="100" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="122" text-anchor="middle" class="svg-ink" font-size="12">Kuch bhi le jaana</text><text x="240" y="140" text-anchor="middle" class="svg-accent" font-size="13">GRE</text>
<rect x="330" y="100" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">LAN se LAN encrypt</text><text x="400" y="140" text-anchor="middle" class="svg-accent" font-size="13">Crypto map</text>
<rect x="490" y="100" width="140" height="50" rx="8" fill="#fde68a"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="12">Encrypt + IGP</text><text x="560" y="140" text-anchor="middle" class="svg-accent" font-size="13">GRE/IPsec, VTI</text>
<line x1="280" y1="50" x2="80" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="300" y1="50" x2="240" y2="100" stroke="#64748b" stroke-width="1.5"/>
<line x1="340" y1="50" x2="400" y2="100" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="50" x2="560" y2="100" stroke="#64748b" stroke-width="1.5"/>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Real designs inhe milate hain: VRF mein tunnel, IPsec se protected</text>
</svg><p class="cap">Ek sawaal, chaar jawab. Zyada tar networks ek se zyada use karte hain.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Type 1 vs type 2 hypervisors examples ke saath samjhao, aur VM kin cheezon se bani hai.</li>
<li>Virtual switch, port groups, uplinks aur VST/EST/VGT tagging describe karo.</li>
<li><code>vrf definition</code> se VRF banao, interfaces assign karo, IP dobara daalo, per-VRF routes jodo aur <code>ping vrf</code> se verify karo.</li>
<li>RD vs RT samjhao aur route leaking options describe karo.</li>
<li>GRE tunnel banao, LANs ko usse route karo, keepalives jodo, <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code> set karo.</li>
<li>Log aur routing table se recursive routing pehchano aur fix karo.</li>
<li>ESP vs AH, tunnel vs transport mode, IKEv1 phases, IKEv2 exchanges aur NAT-T samjhao.</li>
<li>Crypto-map VPN, GRE over IPsec aur VTI configure aur verify karo.</li>
<li>Neeche se upar troubleshoot karo: underlay, interface, routing, phase 1, phase 2, data plane.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Hypervisor</dt><dd>VMs chalane wala software; type 1 hardware par, type 2 host OS par.</dd>
<dt>vSwitch / port group</dt><dd>Hypervisor mein software switch; port groups vNICs ke liye VLAN aur policy rakhte hain.</dd>
<dt>VRF</dt><dd>Ek router par alag routing aur forwarding table.</dd>
<dt>RD / RT</dt><dd>Route distinguisher MP-BGP mein prefixes unique banata hai; route target import aur export control karta hai.</dd>
<dt>Underlay / overlay</dt><dd>Transport network / tunnels se upar bana virtual network.</dd>
<dt>GRE</dt><dd>Generic Routing Encapsulation, IP protocol 47, 4-byte header, koi encryption nahi.</dd>
<dt>Recursive routing</dt><dd>Tunnel ki destination ka route tunnel mein point karta hai; RECURDOWN aur flapping paida karta hai.</dd>
<dt>ESP / AH</dt><dd>IPsec protocols 50 (encrypt karta hai) aur 51 (sirf integrity, NAT ke saath toot-ta hai).</dd>
<dt>ISAKMP SA / IPsec SA</dt><dd>Phase 1 bidirectional management SA / SPIs wale phase 2 one-way data SAs.</dd>
<dt>Transform set</dt><dd>Phase 2 algorithms aur mode, jaise esp-aes 256 esp-sha256-hmac.</dd>
<dt>Proxy ACL</dt><dd>Interesting traffic define karne wala crypto ACL; dono peers par mirrored hona chahiye.</dd>
<dt>NAT-T</dt><dd>NAT detect hone par UDP 4500 ke andar ESP.</dd>
<dt>VTI</dt><dd>IPsec tunnel interface, <code>tunnel mode ipsec ipv4</code>, koi GRE nahi.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Hypervisors</td><td>ESXi, Hyper-V, KVM = type 1; VirtualBox, Workstation = type 2</td></tr>
<tr><td>VRF interface</td><td><code>vrf forwarding</code> IP hata deta hai; VRF-lite ke liye RD optional</td></tr>
<tr><td>GRE</td><td>Protocol 47; 24 bytes overhead; transport MTU 1476; multicast le jaata hai</td></tr>
<tr><td>Tunnel up/up</td><td>Source up + destination tak route; asli liveness ke liye keepalives</td></tr>
<tr><td>Recursion</td><td><code>%TUN-5-RECURDOWN</code>; underlay prefixes ko overlay se bahar rakho</td></tr>
<tr><td>IPsec ports</td><td>UDP 500 (IKE), UDP 4500 (NAT-T), ESP 50, AH 51</td></tr>
<tr><td>IKEv1</td><td>Main Mode 6, Aggressive 3, Quick Mode 3; HAGLE</td></tr>
<tr><td>IKEv2</td><td>IKE_SA_INIT + IKE_AUTH = 4 messages; IKEv1 ke saath compatible nahi</td></tr>
<tr><td>States</td><td>QM_IDLE achha; MM_NO_STATE = reply ya policy nahi; MM_KEY_EXCH = key</td></tr>
<tr><td>GRE over IPsec</td><td>Transport mode; idents protocol 47; <code>tunnel protection ipsec profile</code></td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! VRF</span>
vrf definition CUST-A / address-family ipv4
interface Gi0/1 / vrf forwarding CUST-A / ip address ...
ip route vrf CUST-A 0.0.0.0 0.0.0.0 10.255.1.2
show vrf | show ip route vrf CUST-A | ping vrf CUST-A 10.255.1.2
<span class="c">! GRE</span>
interface Tunnel0 / tunnel source Gi0/0 / tunnel destination 100.64.22.2
keepalive 5 3 / ip mtu 1400 / ip tcp adjust-mss 1360 / tunnel vrf INET
show interfaces tunnel 0 | show ip cef 100.64.22.2
<span class="c">! IPsec</span>
crypto isakmp policy 10 / crypto isakmp key KEY address PEER
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac / mode tunnel|transport
crypto map MAP 10 ipsec-isakmp / set peer / set transform-set / match address
crypto ipsec profile PROF / tunnel protection ipsec profile PROF
tunnel mode ipsec ipv4
show crypto isakmp sa | show crypto ipsec sa | show crypto session | show crypto ikev2 sa</pre>

<div class="warn"><p><b>Aakhri minute ki galtiyan jinse bacho.</b> <code>vrf forwarding</code> se pehle IP. Tunnel destination far tunnel IP par set karna. Non-mirrored crypto ACLs. Router se hi crypto map test karna. NAT exemption bhoolna. Sirf ek side par tunnel protection.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> GRE mein security nahi; AH mein encryption nahi; RD RT nahi hai; IPsec SAs one-way hain; transform set names local hain; crypto map multicast nahi le jaata; VTI line protocol SA ko follow karta hai.</p></div>

<div class="scn"><h4>Sab kuch ek saath</h4><p>Ek bank ki Kochi mein nayi branch ko teen cheezein chahiye thi: staff, ATMs aur guests ke liye alag networks; broadband par Mumbai data center tak secure link; aur OSPF taaki naye subnets automatically dikhein. Design mein branch router par teen VRFs the, Mumbai ki taraf har VRF ke liye ek IKEv2 VTI jiska tunnel interface us VRF mein tha, broadband link ke liye front-door VRF INET, har tunnel par <code>ip mtu 1400</code> aur <code>ip tcp adjust-mss 1360</code>, aur tunnels par per-VRF OSPF aise filters ke saath jo INET prefixes kabhi advertise nahi karte. Day-one testing chhe-step workflow se hui.</p><p><b>Seekh:</b> ENCOR domain 2.0 alag-alag commands ki list nahi hai; yeh isolated, secure overlays banane ka ek toolkit hai.</p></div>

<div class="iv"><p class="q">"Ek secure branch link design karo jo OSPF support kare aur guest traffic alag rakhe. Kaunsi technologies use karoge?"</p><p>Staff aur guest routing alag karne ke liye VRFs, recursive routing se bachne ke liye internet link ke liye front-door VRF, aur har VRF ke liye IPsec VTI (ya GRE over IPsec) taaki OSPF encrypted, routable interface par chale. Strong algorithms (AES-256, SHA-256, DH 14 ya 19+) ke saath IKEv2, MTU aur MSS tuning, aur DPD jodo. Samjhao ki har layer kaise verify karoge: <code>show vrf</code>, <code>show interfaces tunnel</code>, <code>show crypto ikev2 sa</code>, <code>show crypto ipsec sa</code>, aur per VRF OSPF neighbours.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Device virtualization: hypervisors (type 1/2), VMs, virtual switches.</li>
<li>Data path virtualization: VRFs routing alag karte hain; GRE le jaata hai; IPsec secure karta hai.</li>
<li>Simple ACL-based VPNs ke liye crypto map; routing protocols chahiye to GRE over IPsec ya VTI.</li>
<li>Recursive routing aur MTU do classic tunnel faults hain.</li>
<li>Neeche se upar troubleshoot karo aur har layer ke liye sahi show command se verify karo.</li>
</ul></div>
`}};export{e as default};