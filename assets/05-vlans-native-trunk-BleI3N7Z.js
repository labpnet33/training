var e={id:`vlans-native-trunk`,h:{en:`VLAN mapping, native VLAN and the branch switch`,hi:`VLAN mapping, native VLAN aur branch switch`},body:{en:`
<p>A FlexConnect AP is like a courier who arrives at the depot gate with parcels for several streets. The <b>trunk</b> is the gate with many lanes; each <b>VLAN tag</b> is a lane number. The <b>native VLAN</b> is the one lane without a number: the AP's own post, used for its management. If the AP thinks its own lane is 1 and the gate says 210, they cannot find each other. This chapter is about getting every number to agree: controller, AP and switch.</p>

<h3>Where each VLAN number lives</h3>
<table class="cmp">
<tr><th>Number</th><th>Where you set it</th><th>Pune value</th></tr>
<tr><td>AP management VLAN</td><td>SW2 trunk native VLAN, DHCP pool on R2</td><td>210 (10.30.10.0/24)</td></tr>
<tr><td>Flex native VLAN</td><td>flex profile <code>native-vlan-id</code></td><td>210, must equal the trunk native</td></tr>
<tr><td>Staff VLAN</td><td>policy profile <code>vlan 220</code>, flex mapping, SW2 allowed list, R2 subinterface</td><td>220 (10.30.20.0/24)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AP trunk with native VLAN 210 and tagged VLAN 220">
<rect x="20" y="60" width="130" height="60" rx="8" fill="#fed7aa"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">AP-PUN1</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="12">native-vlan-id 210</text>
<rect x="260" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW2 Gi0/1</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">trunk, native 210</text>
<rect x="490" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="12">.210 and .220</text>
<line x1="150" y1="80" x2="260" y2="80" stroke="#16a34a" stroke-width="3"/><text x="205" y="72" text-anchor="middle" class="svg-accent" font-size="12">untagged 210</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#2563eb" stroke-width="3"/><text x="205" y="118" text-anchor="middle" class="svg-accent" font-size="12">tagged 220</text>
<line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/><text x="440" y="82" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">allowed vlan 210,220 on every AP port</text>
</svg><p class="cap">One cable, two VLANs: AP management untagged on the native VLAN, staff clients tagged 220.</p></div>

<h3>The branch switch</h3>
<pre class="code"><span class="c">! SW2 (Pune), the AP port, same on Gi0/1 and Gi0/2</span>
vlan 210
 name AP-MGMT
vlan 220
 name STAFF-PUN
interface GigabitEthernet0/1
 description AP-PUN1
 switchport mode trunk
 switchport trunk native vlan 210
 switchport trunk allowed vlan 210,220</pre>
<p>On the router R2, two subinterfaces give gateways (<code>encapsulation dot1Q 210</code> and <code>220</code>), and two DHCP pools serve the two subnets. The AP pool carries <b>option 43</b>, which tells the AP where the controller is.</p>
<pre class="code">ip dhcp pool AP-POOL-PUN
 network 10.30.10.0 255.255.255.0
 default-router 10.30.10.1
 option 43 hex f104.0a0a.630a</pre>
<p>Decode the hex once: <code>f1</code> is the sub-option type for a controller list, <code>04</code> the length in bytes, <code>0a0a630a</code> is 10.10.99.10, the address of WLC1 in Mumbai. The Pune APs therefore learn the controller across the WAN without any local controller.</p>

<h3>How the AP places a client</h3>
<p>For a locally switched WLAN, the AP uses the policy VLAN (a number or a name) and looks it up in the flex profile:</p>
<ol>
<li>Mapped (<code>vlan-name STAFF-PUN</code> with <code>vlan-id 220</code>)? The client goes to VLAN 220, tagged on the switch port.</li>
<li>Not mapped? The client falls back to the <b>native VLAN</b> of the flex profile. The client then gets a 10.30.10.x address, the AP management subnet: not an error message, just the wrong place.</li>
<li>The port must carry the VLAN. An access port, or a trunk whose allowed list lacks 220, gives the client no connectivity at all.</li>
</ol>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f01 detail
Client IPv4 Address: 10.30.10.51
FlexConnect (model view):
  Switching Mode                : Local (switched on the AP, not tunnelled to the controller)
  Flex Profile                  : FLEX-PUNE
  <span class="hl">Client VLAN placement         : native VLAN 210 (VLAN name STAFF-PUN is not mapped in the flex profile)</span></pre>
<p>The unmapped fallback is the documented FlexConnect behaviour. The exact wording of that line varies by release on a real controller; the model prints it plainly for teaching.</p>

<h3>Native VLAN mismatch</h3>
<p>If the flex profile native VLAN differs from the native VLAN of the switch port, the AP cannot keep its management path consistent. In the model the AP drops to <b>standalone</b>, even though the WAN works, and the controller hides it.</p>
<pre class="out">WLC1# show logging
<span class="hl">%CAPWAP-3-AP_LOST: AP AP-PUN1 (00:50:79:66:68:11) disassociated: native VLAN mismatch: flex profile FLEX-PUNE says 1, the switch port native VLAN is 210 (FlexConnect AP keeps serving locally switched WLANs)</span>

WLC1# show ap name AP-PUN1 config general
FlexConnect State : Standalone (native VLAN mismatch: flex profile FLEX-PUNE says 1, the switch port native VLAN is 210)</pre>
<p>Notice the cause is a number on <b>the controller</b> (default 1 because nobody set <code>native-vlan-id 210</code>), not a cable fault. Lab 3 uses exactly this.</p>

<div class="eg"><p><b>Worked example.</b> AP-PUN2 is plugged into SW2 Gi0/2, which is configured as <code>switchport mode access</code> and <code>access vlan 210</code>. The AP joins (management is in VLAN 210), but no frame tagged 220 can pass. LAPTOP3 associates, gets no DHCP address. Repair: <code>switchport mode trunk</code>, <code>switchport trunk native vlan 210</code>, <code>switchport trunk allowed vlan 210,220</code>. This is the second half of lab 2.</p></div>

<div class="warn"><p><b>Common mistake.</b> Fixing the VLAN on the AP port by allowing VLAN 220 but forgetting <code>switchport trunk native vlan 210</code>. The native VLAN of the trunk stays 1, so the AP gets no address in the AP pool, or after the next tag change, goes standalone.</p></div>

<div class="exam"><p><b>Exam trap.</b> The native VLAN must match on the AP profile side (flex profile) and the switch side. A VLAN that is tagged must be in the allowed list; the native VLAN is carried untagged and is not a client VLAN. Concept only: <b>VLAN-based central switching</b> lets a flex WLAN switch some VLANs locally and tunnel others centrally, depending on whether the VLAN exists on the AP; the simulator does not model it.</p></div>

<div class="scn"><h4>The migration that renumbered VLAN 1</h4><p>During a branch refresh, the access switches were rebuilt with a new AP management VLAN 210, but the flex profile kept native-vlan-id 1. After the next maintenance reload, every AP in the branch dropped off the controller list while staff still worked on the locally switched SSID. The controller log showed AP_LOST with native VLAN mismatch. Setting <code>native-vlan-id 210</code> in the flex profile brought the APs back within a minute.</p><p><b>Lesson:</b> an AP that vanished with the WAN up and Wi-Fi working is a native VLAN problem until proven otherwise.</p></div>

<div class="iv"><p class="q">"Clients in a branch get addresses from the AP management subnet. Why?"</p><p>The policy VLAN is not mapped in the flex profile, so the AP falls back to the native VLAN. Verify the VLAN name and id in <b>show wireless profile flex detailed</b>, compare with the policy VLAN, and check the trunk allows the client VLAN.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Native VLAN of the flex profile must equal the switch trunk native VLAN.</li>
<li>The AP port is a trunk that allows the native VLAN and every client VLAN.</li>
<li>Mapped policy VLAN: client in that VLAN. Unmapped: client falls to the native VLAN.</li>
<li>Option 43 hex f104 plus the controller address gives the AP its controller across the WAN.</li>
<li>Native mismatch puts the AP into standalone mode with the WAN up.</li>
</ul></div>
`,hi:`
<p>FlexConnect AP ek courier jaisa hai jo depot ke gate par kai galiyon ke parcels lekar aata hai. <b>Trunk</b> kai lanes wala gate hai; har <b>VLAN tag</b> ek lane number hai. <b>Native VLAN</b> woh lane hai jiska number nahi: AP ki apni post, management ke liye. AP apni lane 1 samajhta hai aur gate kehta hai 210, to woh ek doosre ko nahi dhoondh paate. Yeh chapter har number ko agree karwane ka hai: controller, AP aur switch.</p>

<h3>Har VLAN number kahan rehta hai</h3>
<table class="cmp">
<tr><th>Number</th><th>Kahan set karte ho</th><th>Pune value</th></tr>
<tr><td>AP management VLAN</td><td>SW2 trunk native VLAN, R2 par DHCP pool</td><td>210 (10.30.10.0/24)</td></tr>
<tr><td>Flex native VLAN</td><td>flex profile <code>native-vlan-id</code></td><td>210, trunk native ke barabar</td></tr>
<tr><td>Staff VLAN</td><td>policy profile <code>vlan 220</code>, flex mapping, SW2 allowed list, R2 subinterface</td><td>220 (10.30.20.0/24)</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="AP trunk native VLAN 210 aur tagged VLAN 220">
<rect x="20" y="60" width="130" height="60" rx="8" fill="#fed7aa"/><text x="85" y="86" text-anchor="middle" class="svg-ink" font-size="13">AP-PUN1</text><text x="85" y="106" text-anchor="middle" class="svg-muted" font-size="12">native-vlan-id 210</text>
<rect x="260" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="86" text-anchor="middle" class="svg-ink" font-size="13">SW2 Gi0/1</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="12">trunk, native 210</text>
<rect x="490" y="60" width="130" height="60" rx="8" fill="#bae6fd"/><text x="555" y="86" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="555" y="106" text-anchor="middle" class="svg-muted" font-size="12">.210 aur .220</text>
<line x1="150" y1="80" x2="260" y2="80" stroke="#16a34a" stroke-width="3"/><text x="205" y="72" text-anchor="middle" class="svg-accent" font-size="12">untagged 210</text>
<line x1="150" y1="100" x2="260" y2="100" stroke="#2563eb" stroke-width="3"/><text x="205" y="118" text-anchor="middle" class="svg-accent" font-size="12">tagged 220</text>
<line x1="390" y1="90" x2="490" y2="90" stroke="#64748b" stroke-width="3"/><text x="440" y="82" text-anchor="middle" class="svg-muted" font-size="12">trunk</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">har AP port par allowed vlan 210,220</text>
</svg><p class="cap">Ek cable, do VLANs: AP management native VLAN par untagged, staff clients 220 tagged.</p></div>

<h3>Branch switch</h3>
<pre class="code"><span class="c">! SW2 (Pune), AP port, Gi0/1 aur Gi0/2 par same</span>
vlan 210
 name AP-MGMT
vlan 220
 name STAFF-PUN
interface GigabitEthernet0/1
 description AP-PUN1
 switchport mode trunk
 switchport trunk native vlan 210
 switchport trunk allowed vlan 210,220</pre>
<p>Router R2 par do subinterfaces gateways dete hain (<code>encapsulation dot1Q 210</code> aur <code>220</code>), aur do DHCP pools do subnets serve karte hain. AP pool mein <b>option 43</b> hota hai, jo AP ko batata hai controller kahan hai.</p>
<pre class="code">ip dhcp pool AP-POOL-PUN
 network 10.30.10.0 255.255.255.0
 default-router 10.30.10.1
 option 43 hex f104.0a0a.630a</pre>
<p>Hex ek baar decode karo: <code>f1</code> controller list ka sub-option type hai, <code>04</code> bytes mein length, <code>0a0a630a</code> yaani 10.10.99.10, Mumbai ke WLC1 ka address. Isliye Pune ke APs bina local controller ke WAN ke upar controller seekh lete hain.</p>

<h3>AP client ko kahan rakhta hai</h3>
<p>Locally switched WLAN ke liye AP policy VLAN (number ya name) use karta hai aur flex profile mein dhoondhta hai:</p>
<ol>
<li>Mapped hai (<code>vlan-name STAFF-PUN</code> aur <code>vlan-id 220</code>)? Client VLAN 220 mein jata hai, switch port par tagged.</li>
<li>Mapped nahi? Client flex profile ke <b>native VLAN</b> par fall back karta hai. Phir client ko 10.30.10.x address milta hai, AP management subnet: error message nahi, bas galat jagah.</li>
<li>Port ko VLAN carry karna chahiye. Access port, ya aisa trunk jiski allowed list mein 220 nahi, client ko bilkul connectivity nahi deta.</li>
</ol>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f01 detail
Client IPv4 Address: 10.30.10.51
FlexConnect (model view):
  Switching Mode                : Local (switched on the AP, not tunnelled to the controller)
  Flex Profile                  : FLEX-PUNE
  <span class="hl">Client VLAN placement         : native VLAN 210 (VLAN name STAFF-PUN is not mapped in the flex profile)</span></pre>
<p>Unmapped fallback documented FlexConnect behaviour hai. Asli controller par us line ke exact shabd release ke hisaab se alag hote hain; model sikhane ke liye use seedha print karta hai.</p>

<h3>Native VLAN mismatch</h3>
<p>Flex profile ka native VLAN switch port ke native VLAN se alag ho to AP apna management path consistent nahi rakh sakta. Model mein AP <b>standalone</b> ho jata hai, WAN chalne par bhi, aur controller use chhupa deta hai.</p>
<pre class="out">WLC1# show logging
<span class="hl">%CAPWAP-3-AP_LOST: AP AP-PUN1 (00:50:79:66:68:11) disassociated: native VLAN mismatch: flex profile FLEX-PUNE says 1, the switch port native VLAN is 210 (FlexConnect AP keeps serving locally switched WLANs)</span>

WLC1# show ap name AP-PUN1 config general
FlexConnect State : Standalone (native VLAN mismatch: flex profile FLEX-PUNE says 1, the switch port native VLAN is 210)</pre>
<p>Dhyan do, cause <b>controller</b> par ek number hai (default 1 kyunki kisi ne <code>native-vlan-id 210</code> set nahi kiya), cable fault nahi. Lab 3 bilkul yahi use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> AP-PUN2 SW2 Gi0/2 mein lagaa hai jo <code>switchport mode access</code> aur <code>access vlan 210</code> se configured hai. AP join ho jata hai (management VLAN 210 mein hai), lekin 220 tagged koi frame pass nahi ho sakta. LAPTOP3 associate hota hai, DHCP address nahi milta. Repair: <code>switchport mode trunk</code>, <code>switchport trunk native vlan 210</code>, <code>switchport trunk allowed vlan 210,220</code>. Yeh lab 2 ka doosra half hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> AP port par VLAN 220 allow karke VLAN theek karna lekin <code>switchport trunk native vlan 210</code> bhool jana. Trunk ka native VLAN 1 rehta hai, isliye AP ko AP pool mein address nahi milta, ya agle tag change ke baad standalone ho jata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Native VLAN AP profile side (flex profile) aur switch side par match hona chahiye. Jo VLAN tagged hai woh allowed list mein hona chahiye; native VLAN untagged jata hai aur client VLAN nahi hai. Concept only: <b>VLAN-based central switching</b> flex WLAN ko kuch VLANs locally switch aur baaki centrally tunnel karne deta hai, is par depend karke ki VLAN AP par exist karta hai ya nahi; simulator use model nahi karta.</p></div>

<div class="scn"><h4>Migration jisne VLAN 1 renumber kiya</h4><p>Branch refresh ke dauran access switches naye AP management VLAN 210 ke saath rebuild hue, lekin flex profile mein native-vlan-id 1 hi raha. Agle maintenance reload ke baad branch ke saare APs controller list se gir gaye jabki locally switched SSID par staff chalta raha. Controller log mein native VLAN mismatch ke saath AP_LOST dikha. Flex profile mein <code>native-vlan-id 210</code> set karte hi APs ek minute mein wapas aa gaye.</p><p><b>Lesson:</b> WAN up aur Wi-Fi chalne par bhi jo AP gayab ho, woh sabit hone tak native VLAN problem hai.</p></div>

<div class="iv"><p class="q">"Branch ke clients ko AP management subnet ke addresses milte hain. Kyun?"</p><p>Policy VLAN flex profile mein mapped nahi hai, isliye AP native VLAN par fall back karta hai. <b>show wireless profile flex detailed</b> mein VLAN name aur id verify karo, policy VLAN se compare karo, aur check karo trunk client VLAN allow karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flex profile ka native VLAN switch trunk native VLAN ke barabar hona chahiye.</li>
<li>AP port ek trunk hai jo native VLAN aur har client VLAN allow karta hai.</li>
<li>Mapped policy VLAN: client us VLAN mein. Unmapped: client native VLAN par.</li>
<li>Option 43 hex f104 aur controller address AP ko WAN ke upar controller deta hai.</li>
<li>Native mismatch AP ko WAN up hone par bhi standalone mode mein daal deta hai.</li>
</ul></div>
`}};export{e as default};