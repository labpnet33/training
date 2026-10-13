var e={id:`mgmt-vlan-trunk`,h:{en:`Management VLANs and trunks: giving the tunnel a road`,hi:`Management VLANs aur trunks: tunnel ko road dena`},body:{en:`
<h3>Analogy: the road must exist at both ends and in the middle</h3>
<p>Suppose you tell a courier the exact address of an office (discovery) but a road along the route is closed. The courier knows where to go and still cannot arrive. In wireless, DHCP option 43 gives the address, but the <b>Layer 2 and Layer 3 path</b> must also exist: the AP port, the VLAN, the trunk, the controller interface and the routes. This chapter covers that road.</p>

<h3>Two management VLANs, two jobs</h3>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Who lives there</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>The APs themselves (gateway R1 10.10.10.1)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>The controller wireless management interface 10.10.99.10 (gateway R1 10.10.99.1)</td></tr>
<tr><td>20 / 30 / 40 / 50</td><td>STAFF / VOICE / CORP / GUEST</td><td>10.10.x.0/24</td><td>Client traffic, delivered by the controller (central switching)</td></tr>
</table>
<p>Separating AP and controller management is good practice: APs are numerous and mounted in public places, the controller is one high-value device. Different VLANs let you apply different filtering. Between them R1 routes, and CAPWAP crosses that router as normal UDP.</p>

<h3>The wireless management interface</h3>
<p>On the Catalyst 9800 style controller the <b>wireless management interface</b> is the SVI that APs use to join and that the controller uses for most management traffic. You select an existing Layer 3 VLAN interface for this role. Only one exists. In the labs it is Vlan99:</p>
<pre class="code">WLC1(config)# vlan 99
WLC1(config-vlan)# name WLC-MGMT
WLC1(config-vlan)# exit
WLC1(config)# interface Vlan99
WLC1(config-if)# ip address 10.10.99.10 255.255.255.0
WLC1(config-if)# no shutdown
WLC1(config-if)# exit
WLC1(config)# ip route 0.0.0.0 0.0.0.0 10.10.99.1
WLC1(config)# wireless management interface Vlan99</pre>
<pre class="out">WLC1# show wireless management interface
Wireless Management Interface Summary
Interface Name  IP Address     IP Netmask      MAC Address
<span class="hl">Vlan99          10.10.99.10    255.255.255.0   0050.7966.6800</span></pre>
<p>The default route matters. The AP is in another subnet, so replies from the controller to 10.10.10.21 must go through R1. A controller with the right IP but no default route can see APs that are on its own subnet and no others.</p>

<h3>The switch side: access ports for APs, trunk for the controller</h3>
<p>For a locally switched, centrally managed AP in the lab, each AP port on SW1 is an <b>access port</b> in VLAN 10. The AP does not tag VLANs: all of its traffic, including the CAPWAP tunnel, leaves untagged in VLAN 10. The controller uplink is different. WLC1 connects with GigabitEthernet1 to SW1 GigabitEthernet0/1 as an <b>802.1Q trunk</b> because it needs several VLANs at once: VLAN 99 for management plus the client VLANs 20, 30, 40 and 50 that it places client frames onto.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VLAN path">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">AP1 (access 10)</text>
<rect x="260" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="315" y="58" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="510" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="130" y1="53" x2="260" y2="53" stroke="#64748b"/><text x="195" y="45" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="370" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="3"/><text x="440" y="45" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="290" y="110" width="50" height="46" rx="8" fill="#bae6fd"/><text x="315" y="138" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="315" y1="76" x2="315" y2="110" stroke="#64748b"/>
<text x="440" y="100" text-anchor="middle" class="svg-ink" font-size="12">allowed: 20,30,40,50,99</text>
<text x="440" y="120" text-anchor="middle" class="svg-accent" font-size="12">if 99 is missing, all APs drop</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">AP to R1 over VLAN 10, R1 to WLC over VLAN 99 through the trunk</text>
</svg><p class="cap">The AP never sees the trunk, but its CAPWAP packets cross the trunk inside VLAN 99 on the way to the controller.</p></div>
<pre class="code"><span class="c">! SW1, controller uplink: carry management and client VLANs</span>
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 20,30,40,50,99</pre>
<p>The allowed list is the most common silent failure. Everything may look fine, the VLAN exists, the SVI is up, yet frames for VLAN 99 are simply not forwarded on the trunk. A routine "clean-up" that prunes unused VLANs from trunks is the usual cause.</p>
<pre class="out">SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       20,40</span>

Port        Vlans allowed and active in management domain
Gi0/1       20,40

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       20,40</pre>
<p>Here VLAN 99 is not in the allowed list, so the controller management subnet is cut off from R1. The fix on the switch is <code>switchport trunk allowed vlan add 99</code>. Always use <b>add</b>: writing <code>allowed vlan 99</code> without it would replace the list and drop VLANs 20 and 40.</p>

<div class="eg"><p><b>Worked example: where does the packet die?</b> From WLC1, <code>ping 10.10.99.1</code> fails. WLC1's own VLAN 99 SVI is up, and R1 is fine. That points to the path between them: the trunk. On SW1 you read the allowed list and find 20,40. A single add command restores 99; the ping succeeds; within about a minute the APs rejoin. Notice that the fault was in neither the controller nor R1.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Replacing the allowed list instead of adding to it. (2) Making the AP port a trunk without understanding the native VLAN (local-mode APs normally use access ports). (3) Forgetting the default route on the controller. (4) Mismatched native VLANs on the two ends of a trunk.</p></div>
<div class="exam"><p><b>Exam trap.</b> The controller trunk carries management and client VLANs under central switching; an AP access port carries only the AP VLAN. For FlexConnect the AP port becomes a trunk, because client VLANs are bridged locally: a concept here, not simulated. Coming up: module wl-flex (FlexConnect).</p></div>

<div class="scn"><h4>Port clean-up Friday</h4><p>A security audit asked the network team to prune unused VLANs from all trunks. On Friday evening the controller trunk was trimmed to the client VLANs. By Saturday morning every AP in the building was gone from the controller, and helpdesk phones rang. The engineer pinged the gateway from the controller (failed), then read <code>show interfaces trunk</code> and saw VLAN 99 missing. After adding it, all APs returned in about a minute.</p><p><b>Lesson:</b> management VLANs must be on the trunk list. Document them in change requests.</p></div>

<div class="iv"><p class="q">"All APs dropped at once after a switch change. Where do you look?"</p><p>A simultaneous drop of every AP suggests a shared dependency: the controller uplink, the management VLAN, the gateway or DHCP. Test the gateway from the controller, check the trunk allowed list on the switch, then verify with show ap summary. Fix the owning device only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>APs use VLAN 10; the controller management interface is in VLAN 99; R1 routes between them.</li>
<li>The wireless management interface is a single SVI chosen with the command wireless management interface Vlan99.</li>
<li>The controller needs a default route to reach APs in other subnets.</li>
<li>The controller uplink is an 802.1Q trunk that must allow VLAN 99 and the client VLANs.</li>
<li>Use switchport trunk allowed vlan add 99 so existing VLANs stay.</li>
</ul></div>
`,hi:`
<h3>Analogy: road dono sire par aur beech mein bhi honi chahiye</h3>
<p>Maan lo aapne courier ko office ka exact address bata diya (discovery) lekin raaste mein ek road band hai. Courier ko pata hai kahan jaana hai phir bhi woh pahunch nahi sakta. Wireless mein DHCP option 43 address deta hai, lekin <b>Layer 2 aur Layer 3 path</b> bhi hona chahiye: AP port, VLAN, trunk, controller interface aur routes. Yeh chapter us road ke baare mein hai.</p>

<h3>Do management VLANs, do kaam</h3>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Wahan kaun rehta hai</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>Khud APs (gateway R1 10.10.10.1)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>Controller wireless management interface 10.10.99.10 (gateway R1 10.10.99.1)</td></tr>
<tr><td>20 / 30 / 40 / 50</td><td>STAFF / VOICE / CORP / GUEST</td><td>10.10.x.0/24</td><td>Client traffic, controller deliver karta hai (central switching)</td></tr>
</table>
<p>AP aur controller management ko alag rakhna achhi practice hai: APs bahut hote hain aur public jagahon par lagte hain, controller ek high-value device hai. Alag VLANs se aap alag filtering laga sakte ho. Dono ke beech R1 routing karta hai, aur CAPWAP us router ke paar normal UDP ki tarah jaata hai.</p>

<h3>Wireless management interface</h3>
<p>Catalyst 9800 style controller par <b>wireless management interface</b> woh SVI hai jise APs join ke liye use karte hain aur controller zyadatar management traffic ke liye. Aap is role ke liye ek existing Layer 3 VLAN interface chunte ho. Sirf ek hota hai. Labs mein yeh Vlan99 hai:</p>
<pre class="code">WLC1(config)# vlan 99
WLC1(config-vlan)# name WLC-MGMT
WLC1(config-vlan)# exit
WLC1(config)# interface Vlan99
WLC1(config-if)# ip address 10.10.99.10 255.255.255.0
WLC1(config-if)# no shutdown
WLC1(config-if)# exit
WLC1(config)# ip route 0.0.0.0 0.0.0.0 10.10.99.1
WLC1(config)# wireless management interface Vlan99</pre>
<pre class="out">WLC1# show wireless management interface
Wireless Management Interface Summary
Interface Name  IP Address     IP Netmask      MAC Address
<span class="hl">Vlan99          10.10.99.10    255.255.255.0   0050.7966.6800</span></pre>
<p>Default route important hai. AP doosre subnet mein hai, isliye controller se 10.10.10.21 ko replies R1 se hokar jaane chahiye. Sahi IP lekin default route na wala controller sirf apne subnet ke APs ko dekh sakta hai, aur kisi ko nahi.</p>

<h3>Switch side: APs ke liye access ports, controller ke liye trunk</h3>
<p>Lab ke locally switched, centrally managed AP ke liye SW1 par har AP port VLAN 10 ka <b>access port</b> hai. AP VLANs tag nahi karta: uska poora traffic, CAPWAP tunnel samet, VLAN 10 mein untagged nikalta hai. Controller uplink alag hai. WLC1 GigabitEthernet1 se SW1 GigabitEthernet0/1 se <b>802.1Q trunk</b> ke roop mein judta hai kyunki use ek saath kai VLANs chahiye: management ke liye VLAN 99 aur client VLANs 20, 30, 40, 50 jin par woh client frames rakhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="VLAN path">
<rect x="20" y="30" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="75" y="58" text-anchor="middle" class="svg-ink" font-size="13">AP1 (access 10)</text>
<rect x="260" y="30" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="315" y="58" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="510" y="30" width="110" height="46" rx="8" fill="#ddd6fe"/><text x="565" y="58" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<line x1="130" y1="53" x2="260" y2="53" stroke="#64748b"/><text x="195" y="45" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10</text>
<line x1="370" y1="53" x2="510" y2="53" stroke="#64748b" stroke-width="3"/><text x="440" y="45" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<rect x="290" y="110" width="50" height="46" rx="8" fill="#bae6fd"/><text x="315" y="138" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<line x1="315" y1="76" x2="315" y2="110" stroke="#64748b"/>
<text x="440" y="100" text-anchor="middle" class="svg-ink" font-size="12">allowed: 20,30,40,50,99</text>
<text x="440" y="120" text-anchor="middle" class="svg-accent" font-size="12">99 missing to saare APs gir jaate hain</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">AP se R1 VLAN 10 par, R1 se WLC VLAN 99 par trunk ke zariye</text>
</svg><p class="cap">AP trunk ko kabhi nahi dekhta, lekin uske CAPWAP packets controller ke raaste mein VLAN 99 ke andar trunk cross karte hain.</p></div>
<pre class="code"><span class="c">! SW1, controller uplink: carry management and client VLANs</span>
SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport trunk allowed vlan 20,30,40,50,99</pre>
<p>Allowed list sabse common silent failure hai. Sab kuch theek dikh sakta hai, VLAN exist karta hai, SVI up hai, phir bhi VLAN 99 ke frames trunk par forward hi nahi hote. Routine "clean-up" jo unused VLANs ko trunks se prune karta hai, usual wajah hai.</p>
<pre class="out">SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
<span class="hl">Gi0/1       20,40</span>

Port        Vlans allowed and active in management domain
Gi0/1       20,40

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       20,40</pre>
<p>Yahan VLAN 99 allowed list mein nahi hai, isliye controller management subnet R1 se kat gaya. Switch par fix hai <code>switchport trunk allowed vlan add 99</code>. Hamesha <b>add</b> use karo: bina uske <code>allowed vlan 99</code> likhne se list replace ho jaati aur VLANs 20 aur 40 gir jaate.</p>

<div class="eg"><p><b>Worked example: packet kahan marta hai?</b> WLC1 se <code>ping 10.10.99.1</code> fail hota hai. WLC1 ka apna VLAN 99 SVI up hai aur R1 theek hai. Yeh dono ke beech ke path, yaani trunk, ki taraf ishara karta hai. SW1 par allowed list padhte ho aur 20,40 milta hai. Ek add command 99 wapas laata hai; ping succeed hota hai; lagbhag ek minute mein APs rejoin hote hain. Dhyan do ki fault na controller mein thi na R1 mein.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Allowed list mein add karne ki jagah use replace kar dena. (2) AP port ko native VLAN samjhe bina trunk bana dena (local-mode APs normally access ports use karte hain). (3) Controller par default route bhool jaana. (4) Trunk ke dono ends par native VLAN mismatch.</p></div>
<div class="exam"><p><b>Exam trap.</b> Central switching mein controller trunk management aur client VLANs carry karta hai; AP access port sirf AP VLAN carry karta hai. FlexConnect mein AP port trunk ban jaata hai kyunki client VLANs locally bridge hote hain: yahan concept, simulate nahi hota. Aage aane wala module: wl-flex (FlexConnect).</p></div>

<div class="scn"><h4>Port clean-up Friday</h4><p>Security audit ne network team se kaha ki sab trunks se unused VLANs prune karo. Friday shaam ko controller trunk sirf client VLANs tak trim ho gaya. Saturday subah tak building ke saare APs controller se gayab the aur helpdesk ke phones bajne lage. Engineer ne controller se gateway ping kiya (fail), phir <code>show interfaces trunk</code> padha aur VLAN 99 missing dekha. Add karne ke baad saare APs lagbhag ek minute mein wapas aa gaye.</p><p><b>Seekh:</b> management VLANs trunk list mein honi chahiye. Change requests mein document karo.</p></div>

<div class="iv"><p class="q">"Switch change ke baad saare APs ek saath gir gaye. Kahan dekhoge?"</p><p>Saare APs ek saath girna shared dependency batata hai: controller uplink, management VLAN, gateway ya DHCP. Controller se gateway test karo, switch par trunk allowed list check karo, phir show ap summary se verify karo. Sirf owning device fix karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>APs VLAN 10 use karte hain; controller management interface VLAN 99 mein hai; R1 dono ke beech route karta hai.</li>
<li>Wireless management interface ek single SVI hai jo wireless management interface Vlan99 command se chuna jaata hai.</li>
<li>Doosre subnets ke APs tak pahunchne ke liye controller ko default route chahiye.</li>
<li>Controller uplink 802.1Q trunk hai jo VLAN 99 aur client VLANs allow kare.</li>
<li>switchport trunk allowed vlan add 99 use karo taaki existing VLANs bani rahein.</li>
</ul></div>
`}};export{e as default};