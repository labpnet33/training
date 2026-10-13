var e={id:`switch-ports`,h:{en:`Switch ports for APs and controllers: access, trunk and LAG`,hi:`APs aur controllers ke liye switch ports: access, trunk aur LAG`},body:{en:`
<p>A courier company delivers sealed boxes to a warehouse. The loading dock does not need to know what is inside each box; it only needs one lane for the delivery van. Inside the warehouse, the boxes are opened and the contents sent to many departments along separate conveyor belts. A <b>local-mode AP</b> is the van: everything it carries is sealed inside CAPWAP, so its switch port needs only one VLAN. The <b>WLC</b> is the warehouse: it opens the tunnel and must reach every client VLAN, so its port is a trunk. Getting these two port types right is the physical-infrastructure part of the CCNA wireless blueprint.</p>

<h3>The rule, by device and mode</h3>
<table class="cmp"><tr><th>Device</th><th>Switch port</th><th>Why</th></tr>
<tr><td><b>Lightweight AP, local mode</b></td><td><b>Access</b> port in the AP management VLAN (VLAN 10)</td><td>All client traffic is inside CAPWAP to the WLC; the switch only ever sees the AP's own IP.</td></tr>
<tr><td><b>Lightweight AP, FlexConnect with local switching</b></td><td><b>Trunk</b>, native VLAN = AP management VLAN, allowed = AP VLAN + locally switched client VLANs</td><td>The AP puts client frames straight onto site VLANs, already tagged.</td></tr>
<tr><td><b>Autonomous AP</b> with several SSIDs</td><td><b>Trunk</b></td><td>Each SSID is bridged to its own VLAN at the AP.</td></tr>
<tr><td><b>WLC</b> (distribution ports)</td><td><b>Trunk</b> carrying the management VLAN and every client VLAN; LAG = <code>channel-group N mode on</code></td><td>The WLC places each WLAN's traffic on its dynamic interface's VLAN.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Which switch port type faces which wireless device">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="20" y="170" width="160" height="56" rx="8" fill="#fed7aa"/><text x="100" y="193" text-anchor="middle" class="svg-ink" font-size="13">AP1 (local)</text><text x="100" y="212" text-anchor="middle" class="svg-muted" font-size="12">CAPWAP only</text>
<rect x="240" y="170" width="160" height="56" rx="8" fill="#fde68a"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text><text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">local switching</text>
<rect x="460" y="170" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="540" y="193" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="540" y="212" text-anchor="middle" class="svg-muted" font-size="12">all client VLANs</text>
<line x1="280" y1="70" x2="100" y2="170" stroke="#64748b" stroke-width="2"/><text x="150" y="115" text-anchor="middle" class="svg-accent" font-size="12">access VLAN 10</text>
<line x1="320" y1="70" x2="320" y2="170" stroke="#64748b" stroke-width="4"/><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">trunk, native 10</text>
<line x1="360" y1="70" x2="540" y2="170" stroke="#64748b" stroke-width="4"/><text x="500" y="115" text-anchor="middle" class="svg-accent" font-size="12">trunk 20,30,40,99</text>
</svg><p class="cap">Thin line = access port, thick line = 802.1Q trunk.</p></div>

<h3>Lab configuration on SW1</h3>
<pre class="code"><span class="c">! VLANs used by the wireless design</span>
vlan 10
 name AP-MGMT
vlan 20
 name STAFF
vlan 30
 name GUEST
vlan 40
 name CORP
vlan 99
 name WLC-MGMT
<span class="c">! local-mode APs: plain access ports</span>
interface GigabitEthernet0/2
 description AP1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
<span class="c">! WLC1: trunk (in production, prune to the VLANs it needs)</span>
interface GigabitEthernet0/1
 description trunk-to-WLC1
 switchport mode trunk
 switchport trunk allowed vlan 20,30,40,99
<span class="c">! R1 router-on-a-stick</span>
interface GigabitEthernet0/0
 description trunk-to-R1
 switchport mode trunk</pre>
<p>Notice that the WLC trunk does <b>not</b> need VLAN 10. APs in VLAN 10 reach 10.10.99.10 through R1 by normal routing; CAPWAP is just IP. The WLC trunk needs its management VLAN (99) and the client VLANs its WLANs map to (20, 30, 40).</p>

<h3>If the controller has two DS ports in a LAG</h3>
<pre class="code">interface range GigabitEthernet1/0/1 - 2
 description WLC1 DS ports
 switchport mode trunk
 switchport trunk allowed vlan 20,30,40,99
 channel-group 1 mode on
<span class="c">! mode on only: AireOS LAG does not speak LACP or PAgP</span></pre>

<h3>A FlexConnect AP at a branch</h3>
<pre class="code">interface GigabitEthernet1/0/10
 description BR-AP1 FlexConnect
 switchport mode trunk
 switchport trunk native vlan 10
 switchport trunk allowed vlan 10,20
 spanning-tree portfast trunk</pre>
<p>The AP's own management traffic (DHCP, CAPWAP) is <b>untagged</b>, so the native VLAN must be the AP VLAN. Locally switched staff traffic leaves the AP tagged 20.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       1-4094
<span class="hl">Gi0/1       20,30,40,99</span>

Port        Vlans allowed and active in management domain
Gi0/0       1,10,20,30,40,99
Gi0/1       20,30,40,99</pre>
<p>Also useful: <code>show vlan brief</code> (does every VLAN a dynamic interface uses exist?), <code>show power inline</code> (is the AP getting PoE?), and <code>show cdp neighbors</code> (APs and WLCs announce themselves with CDP).</p>

<div class="eg"><p><b>Worked example.</b> A new ceiling AP needs about 25 W (802.3at, PoE+) to run both radios at full power. The switch is an older model offering only 15.4 W per port (802.3af). The AP boots in a low-power mode with one radio disabled; clients on 5 GHz see no SSID. <code>show power inline</code> shows 15.4 W allocated. Fix: move the AP to a PoE+ port or use a power injector. Always check PoE class when an AP "joins but one band is missing".</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring the AP port as a trunk "to be safe" for a local-mode AP with a native VLAN that is not the AP VLAN: the AP gets an address in the wrong subnet and may not find the WLC. (2) Putting a FlexConnect AP with local switching on an access port: clients associate but get no IP. (3) Forgetting to add a new client VLAN to the WLC trunk's allowed list after creating a dynamic interface.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local-mode AP = <b>access</b> port. WLC = <b>trunk</b>. FlexConnect with local switching and autonomous APs with multiple SSIDs = <b>trunk</b>. WLC LAG = <b>mode on</b>. The AP VLAN does not have to be on the WLC trunk.</p></div>

<div class="scn"><h4>The guest VLAN that was not allowed</h4><p>A school added a guest WLAN on a new dynamic interface in VLAN 30. Students connected fine, but every phone showed "No internet" and an address starting with 169.254. On the WLC, the WLAN and interface looked perfect. The engineer then ran <code>show interfaces trunk</code> on the switch facing the WLC: the allowed list was <code>20,40,99</code>, left over from the original design. Frames tagged 30 from the WLC were being dropped at the switch port, so DHCP Discovers never reached the router. Adding the VLAN with <code>switchport trunk allowed vlan add 30</code> fixed it instantly.</p><p><b>Lesson:</b> every new dynamic interface needs a matching VLAN on the switch, on the WLC trunk, and a gateway on the router.</p></div>

<div class="iv"><p class="q">"How should the switch ports be configured for a lightweight AP and for the WLC?"</p><p>Strong answer: a local-mode lightweight AP goes on an access port in the AP management VLAN, with PortFast and PoE, because client data is tunnelled in CAPWAP. The WLC's distribution ports go on 802.1Q trunks carrying the management VLAN and all client VLANs, bundled with a static LAG (mode on) if there are several. FlexConnect APs that switch locally need trunks with the AP VLAN as native. Mention that the AP VLAN need not be on the WLC trunk because CAPWAP is routed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local-mode AP: access port in the AP VLAN, PortFast, sufficient PoE.</li>
<li>FlexConnect (local switching) and autonomous APs: trunk with the AP VLAN as native.</li>
<li>WLC: trunk carrying the management VLAN and every client VLAN; LAG with mode on only.</li>
<li>Every dynamic interface VLAN must exist on the switch, be allowed on the WLC trunk, and have a gateway.</li>
<li>Verify with show interfaces trunk, show vlan brief, show power inline and show cdp neighbors.</li>
</ul></div>
`,hi:`
<p>Ek courier company warehouse mein sealed boxes deliver karti hai. Loading dock ko nahi jaanna ki har box ke andar kya hai; use delivery van ke liye bas ek lane chahiye. Warehouse ke andar boxes khole jaate hain aur saaman alag alag conveyor belts par kai departments ko bheja jaata hai. <b>Local-mode AP</b> van hai: jo kuch woh le jaata hai sab CAPWAP ke andar sealed hai, isliye uske switch port ko sirf ek VLAN chahiye. <b>WLC</b> warehouse hai: woh tunnel kholta hai aur use har client VLAN tak pahunchna hai, isliye uska port trunk hai. In do port types ko sahi karna CCNA wireless blueprint ka physical-infrastructure hissa hai.</p>

<h3>Rule, device aur mode ke hisaab se</h3>
<table class="cmp"><tr><th>Device</th><th>Switch port</th><th>Kyun</th></tr>
<tr><td><b>Lightweight AP, local mode</b></td><td>AP management VLAN (VLAN 10) mein <b>access</b> port</td><td>Saara client traffic CAPWAP ke andar WLC tak jaata hai; switch sirf AP ka apna IP dekhta hai.</td></tr>
<tr><td><b>Lightweight AP, FlexConnect local switching ke saath</b></td><td><b>Trunk</b>, native VLAN = AP management VLAN, allowed = AP VLAN + locally switched client VLANs</td><td>AP client frames seedhe site VLANs par daalta hai, pehle se tagged.</td></tr>
<tr><td>Kai SSIDs wala <b>autonomous AP</b></td><td><b>Trunk</b></td><td>Har SSID AP par apne VLAN se bridge hota hai.</td></tr>
<tr><td><b>WLC</b> (distribution ports)</td><td>Management VLAN aur har client VLAN le jaane wala <b>trunk</b>; LAG = <code>channel-group N mode on</code></td><td>WLC har WLAN ka traffic uske dynamic interface ke VLAN par daalta hai.</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Kaunsa switch port type kis wireless device ki taraf">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="14">SW1</text>
<rect x="20" y="170" width="160" height="56" rx="8" fill="#fed7aa"/><text x="100" y="193" text-anchor="middle" class="svg-ink" font-size="13">AP1 (local)</text><text x="100" y="212" text-anchor="middle" class="svg-muted" font-size="12">sirf CAPWAP</text>
<rect x="240" y="170" width="160" height="56" rx="8" fill="#fde68a"/><text x="320" y="193" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text><text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">local switching</text>
<rect x="460" y="170" width="160" height="56" rx="8" fill="#ddd6fe"/><text x="540" y="193" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text><text x="540" y="212" text-anchor="middle" class="svg-muted" font-size="12">saare client VLANs</text>
<line x1="280" y1="70" x2="100" y2="170" stroke="#64748b" stroke-width="2"/><text x="150" y="115" text-anchor="middle" class="svg-accent" font-size="12">access VLAN 10</text>
<line x1="320" y1="70" x2="320" y2="170" stroke="#64748b" stroke-width="4"/><text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">trunk, native 10</text>
<line x1="360" y1="70" x2="540" y2="170" stroke="#64748b" stroke-width="4"/><text x="500" y="115" text-anchor="middle" class="svg-accent" font-size="12">trunk 20,30,40,99</text>
</svg><p class="cap">Patli line = access port, moti line = 802.1Q trunk.</p></div>

<h3>SW1 par lab configuration</h3>
<pre class="code"><span class="c">! wireless design mein use hone wale VLANs</span>
vlan 10
 name AP-MGMT
vlan 20
 name STAFF
vlan 30
 name GUEST
vlan 40
 name CORP
vlan 99
 name WLC-MGMT
<span class="c">! local-mode APs: simple access ports</span>
interface GigabitEthernet0/2
 description AP1
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
<span class="c">! WLC1: trunk (production mein zaroori VLANs tak prune karo)</span>
interface GigabitEthernet0/1
 description trunk-to-WLC1
 switchport mode trunk
 switchport trunk allowed vlan 20,30,40,99
<span class="c">! R1 router-on-a-stick</span>
interface GigabitEthernet0/0
 description trunk-to-R1
 switchport mode trunk</pre>
<p>Dhyan do ki WLC trunk ko VLAN 10 ki <b>zaroorat nahi</b>. VLAN 10 ke APs normal routing se R1 ke through 10.10.99.10 tak pahunchte hain; CAPWAP bas IP hai. WLC trunk ko apna management VLAN (99) aur woh client VLANs chahiye jinse uske WLANs map hote hain (20, 30, 40).</p>

<h3>Agar controller ke do DS ports LAG mein hain</h3>
<pre class="code">interface range GigabitEthernet1/0/1 - 2
 description WLC1 DS ports
 switchport mode trunk
 switchport trunk allowed vlan 20,30,40,99
 channel-group 1 mode on
<span class="c">! sirf mode on: AireOS LAG LACP ya PAgP nahi bolta</span></pre>

<h3>Branch par FlexConnect AP</h3>
<pre class="code">interface GigabitEthernet1/0/10
 description BR-AP1 FlexConnect
 switchport mode trunk
 switchport trunk native vlan 10
 switchport trunk allowed vlan 10,20
 spanning-tree portfast trunk</pre>
<p>AP ka apna management traffic (DHCP, CAPWAP) <b>untagged</b> hota hai, isliye native VLAN AP VLAN hona chahiye. Locally switched staff traffic AP se 20 tagged nikalta hai.</p>

<h3>Verification</h3>
<pre class="out">SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Gi0/0       on               802.1q         trunking      1
Gi0/1       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/0       1-4094
<span class="hl">Gi0/1       20,30,40,99</span>

Port        Vlans allowed and active in management domain
Gi0/0       1,10,20,30,40,99
Gi0/1       20,30,40,99</pre>
<p>Yeh bhi useful hain: <code>show vlan brief</code> (kya har VLAN jo dynamic interface use karta hai exist karta hai?), <code>show power inline</code> (kya AP ko PoE mil raha hai?), aur <code>show cdp neighbors</code> (APs aur WLCs CDP se apne aap ko announce karte hain).</p>

<div class="eg"><p><b>Worked example.</b> Ek naye ceiling AP ko dono radios full power par chalane ke liye lagbhag 25 W (802.3at, PoE+) chahiye. Switch purana model hai jo har port par sirf 15.4 W (802.3af) deta hai. AP low-power mode mein boot hota hai jismein ek radio disabled hai; 5 GHz ke clients ko koi SSID nahi dikhta. <code>show power inline</code> 15.4 W allocated dikhata hai. Fix: AP ko PoE+ port par le jaao ya power injector use karo. Jab AP "join ho jaata hai par ek band gayab hai" to hamesha PoE class check karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Local-mode AP ke port ko "safe rehne ke liye" trunk configure karna aisa native VLAN rakh kar jo AP VLAN nahi hai: AP ko galat subnet mein address milta hai aur shayad WLC na mile. (2) Local switching wale FlexConnect AP ko access port par lagana: clients associate hote hain par IP nahi milta. (3) Dynamic interface banane ke baad naya client VLAN WLC trunk ki allowed list mein jodna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local-mode AP = <b>access</b> port. WLC = <b>trunk</b>. Local switching wala FlexConnect aur multiple SSIDs wale autonomous APs = <b>trunk</b>. WLC LAG = <b>mode on</b>. AP VLAN ka WLC trunk par hona zaroori nahi.</p></div>

<div class="scn"><h4>Woh guest VLAN jo allowed nahi tha</h4><p>Ek school ne VLAN 30 ke naye dynamic interface par guest WLAN joda. Students theek se connect hue, lekin har phone "No internet" aur 169.254 se shuru hone wala address dikha raha tha. WLC par WLAN aur interface perfect dikh rahe the. Phir engineer ne WLC ki taraf wale switch par <code>show interfaces trunk</code> chalaya: allowed list <code>20,40,99</code> thi, original design se bachi hui. WLC se 30 tagged frames switch port par drop ho rahe the, isliye DHCP Discovers router tak kabhi pahunche hi nahi. <code>switchport trunk allowed vlan add 30</code> se VLAN jodte hi turant fix ho gaya.</p><p><b>Seekh:</b> har naye dynamic interface ko switch par matching VLAN, WLC trunk par allowed entry, aur router par gateway chahiye.</p></div>

<div class="iv"><p class="q">"Lightweight AP aur WLC ke liye switch ports kaise configure hone chahiye?"</p><p>Strong answer: local-mode lightweight AP AP management VLAN ke access port par jaata hai, PortFast aur PoE ke saath, kyunki client data CAPWAP mein tunnel hota hai. WLC ke distribution ports 802.1Q trunks par jaate hain jo management VLAN aur saare client VLANs le jaate hain, aur kai hon to static LAG (mode on) mein bundle hote hain. Locally switch karne wale FlexConnect APs ko AP VLAN native ke saath trunks chahiye. Batao ki AP VLAN ka WLC trunk par hona zaroori nahi kyunki CAPWAP routed hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local-mode AP: AP VLAN mein access port, PortFast, kaafi PoE.</li>
<li>FlexConnect (local switching) aur autonomous APs: AP VLAN native ke saath trunk.</li>
<li>WLC: management VLAN aur har client VLAN wala trunk; LAG sirf mode on ke saath.</li>
<li>Har dynamic interface VLAN switch par exist kare, WLC trunk par allowed ho, aur uska gateway ho.</li>
<li>show interfaces trunk, show vlan brief, show power inline aur show cdp neighbors se verify karo.</li>
</ul></div>
`}};export{e as default};