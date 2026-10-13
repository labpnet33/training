var e={id:`segmentation-baseline`,h:{en:`VLAN segmentation and the hardened edge-port baseline`,hi:`VLAN segmentation aur hardened edge-port baseline`},body:{en:`
<p>A good apartment block does not give every resident one master key. Each flat has its own lock, the plant room has a separate key held by maintenance, and visitors wait in the lobby. If a thief gets into one flat, he is still locked out of the others. <b>VLAN segmentation</b> is that set of separate locks for your network, and a <b>hardened edge-port baseline</b> is the standard lock fitted to every door. Before we study individual attacks, this chapter sets up both, because every later control sits on top of them.</p>

<h3>Segmentation with VLANs</h3>
<p>A <b>VLAN</b> is a separate Layer 2 broadcast domain. Hosts in VLAN 10 cannot send a frame directly to hosts in VLAN 20; traffic between them must go through a Layer 3 device (a router, a Layer 3 switch or a firewall), and that is exactly where you apply access control lists and inspection. Segmentation therefore gives you three security wins:</p>
<ul>
<li><b>Smaller blast radius:</b> a broadcast storm, an ARP spoof or a worm scanning its local subnet affects one VLAN, not the whole building.</li>
<li><b>A choke point:</b> inter-VLAN traffic crosses a device where policy is enforced and logged.</li>
<li><b>Clear trust zones:</b> users, voice, servers, printers and cameras (IoT), guests and device management each get their own zone and their own rules.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="VLAN segmentation with a policy point">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Firewall / L3</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">ACLs, inspection</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="3"/><text x="330" y="95" class="svg-muted" font-size="12">trunk (allowed 10,20,30,40,99)</text>
<rect x="30" y="110" width="580" height="16" rx="4" fill="#e2e8f0"/><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="30" y="160" width="100" height="50" rx="8" fill="#bae6fd"/><text x="80" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10</text><text x="80" y="199" text-anchor="middle" class="svg-muted" font-size="12">users</text>
<rect x="150" y="160" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20</text><text x="200" y="199" text-anchor="middle" class="svg-muted" font-size="12">voice</text>
<rect x="270" y="160" width="100" height="50" rx="8" fill="#fde68a"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 30</text><text x="320" y="199" text-anchor="middle" class="svg-muted" font-size="12">servers</text>
<rect x="390" y="160" width="100" height="50" rx="8" fill="#fed7aa"/><text x="440" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40</text><text x="440" y="199" text-anchor="middle" class="svg-muted" font-size="12">IoT</text>
<rect x="510" y="160" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 99</text><text x="560" y="199" text-anchor="middle" class="svg-muted" font-size="12">management</text>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">VLAN 998 black hole (unused ports) and VLAN 999 native carry no users</text>
</svg><p class="cap">Each zone is its own broadcast domain; the only way between zones is through the policy point.</p></div>

<h3>Why a VLAN alone is not enough</h3>
<p>Segmentation stops traffic <b>between</b> zones. It does nothing about attacks <b>inside</b> one VLAN: an attacker in VLAN 10 can still flood the CAM table, answer DHCP requests or spoof the gateway's ARP for everyone in VLAN 10. And if the trunks are sloppy, an attacker can even escape the VLAN (VLAN hopping, chapter 7). That is why the per-port controls in this module exist. Think of VLANs as walls and the port controls as locks.</p>

<h3>The edge-port baseline</h3>
<p>Every user-facing port gets the same template. Here it is for ACC1 Gi0/1, the port used by PC1 in the labs:</p>
<pre class="code"><span class="c">! user edge port: behave like an end host, nothing else</span>
interface GigabitEthernet0/1
 description USER-PC1
 switchport mode access                 <span class="c">! never dynamic</span>
 switchport access vlan 10
 switchport nonegotiate                 <span class="c">! no DTP frames at all</span>
 spanning-tree portfast                 <span class="c">! host port, forward at once</span>
 spanning-tree bpduguard enable         <span class="c">! a BPDU here = err-disable</span>
 switchport port-security               <span class="c">! chapter 4</span>
 storm-control broadcast level 1.00     <span class="c">! chapter 9</span>
<span class="c">! unused port: shut and parked in a black-hole VLAN</span>
interface GigabitEthernet0/20
 description UNUSED
 switchport mode access
 switchport access vlan 998
 shutdown</pre>
<p>Uplink trunks get the opposite treatment: an explicit allowed list, an unused native VLAN and no negotiation.</p>
<pre class="code">interface GigabitEthernet0/23
 description UPLINK-DSW
 switchport mode trunk
 switchport nonegotiate
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,40,99</pre>
<p>Cisco also offers the <code>switchport host</code> macro, which in one command sets access mode, enables PortFast and disables EtherChannel on the port. It is a handy start, but you still add the security features yourself.</p>

<h3>Verify the baseline</h3>
<pre class="out">ACC1# show interfaces g0/1 switchport
Name: Gi0/1
Switchport: Enabled
<span class="hl">Administrative Mode: static access</span>
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
<span class="hl">Negotiation of Trunking: Off</span>
Access Mode VLAN: 10 (USERS)
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>The two highlighted lines are the ones a defender checks: the port is statically an access port, and DTP is off, so nobody can talk it into becoming a trunk.</p>

<div class="eg"><p><b>Worked example: a VLAN plan.</b> VLAN 10 users 10.0.10.0/24, VLAN 20 voice 10.0.20.0/24, VLAN 30 servers 10.0.30.0/24, VLAN 40 IoT 10.0.40.0/24, VLAN 99 switch management 10.0.99.0/24, VLAN 998 black hole (no SVI, no gateway), VLAN 999 native VLAN on trunks (no ports, no SVI). VLAN 1 remains in existence because it cannot be deleted, but no user port and no management address uses it.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving switch management in VLAN 1 and leaving unused ports in VLAN 1 and administratively up. VLAN 1 is the default everywhere, so an unused wall socket becomes a live port on the management network.</p></div>

<div class="exam"><p><b>Exam trap.</b> VLANs segment broadcast domains; they do not stop attacks within a VLAN. When a question asks how to "segregate traffic between hosts in the same subnet", the answer is private VLANs (chapter 11), not more VLANs.</p></div>

<div class="scn"><h4>Cameras on the user VLAN</h4><p>A retail chain had CCTV cameras, card terminals and office PCs all in one flat VLAN. A camera with an old firmware was compromised from the internet and began scanning its subnet, reaching every PC and terminal. The response team moved cameras into VLAN 40 with an ACL that only allowed them to reach the video recorder, and moved terminals into their own VLAN behind the firewall. The next scan from a camera reached nothing but the recorder.</p><p><b>Lesson:</b> segmentation turns "one bad device" into "one bad zone", and the policy point between zones is where you stop and log the spread.</p></div>

<div class="iv"><p class="q">"Is a VLAN a security boundary?"</p><p>Strong answer: partly. A VLAN separates broadcast domains, so inter-VLAN traffic must cross a Layer 3 policy point, which is a real control. But a VLAN does not protect hosts from each other inside the VLAN, and misconfigured trunks (DTP, native VLAN) can let traffic hop between VLANs. So I combine VLANs with hardened trunks, per-port controls like DHCP snooping and DAI, and private VLANs when hosts in one subnet must not talk to each other.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLANs create separate broadcast domains; inter-VLAN traffic must pass a Layer 3 policy point.</li>
<li>Separate users, voice, servers, IoT, guests and management; keep users and management out of VLAN 1.</li>
<li>Edge baseline: access mode, nonegotiate, PortFast + BPDU guard, port security, storm-control.</li>
<li>Unused ports: shut down and placed in a black-hole VLAN; trunks: allowed list, unused native VLAN, nonegotiate.</li>
<li>VLANs do not stop attacks inside a VLAN; the per-port controls do.</li>
</ul></div>
`,hi:`
<p>Ek achha apartment block har resident ko ek master key nahi deta. Har flat ka apna lock hai, plant room ki alag chaabi maintenance ke paas hai, aur visitors lobby mein wait karte hain. Agar chor ek flat mein ghus bhi jaaye, to baaki flats ke liye woh bahar hi hai. <b>VLAN segmentation</b> aapke network ke liye wahi alag-alag locks hai, aur <b>hardened edge-port baseline</b> woh standard lock hai jo har darwaaze par lagta hai. Individual attacks padhne se pehle, yeh chapter dono ko set karta hai, kyunki baad ka har control inhi ke upar baithta hai.</p>

<h3>VLANs se segmentation</h3>
<p><b>VLAN</b> ek alag Layer 2 broadcast domain hai. VLAN 10 ke hosts VLAN 20 ke hosts ko seedha frame nahi bhej sakte; unke beech traffic ko Layer 3 device (router, Layer 3 switch ya firewall) se guzarna padta hai, aur wahi jagah hai jahan aap access control lists aur inspection lagate ho. Isliye segmentation aapko teen security fayde deta hai:</p>
<ul>
<li><b>Chhota blast radius:</b> broadcast storm, ARP spoof ya apna local subnet scan karta worm ek VLAN ko affect karta hai, poori building ko nahi.</li>
<li><b>Ek choke point:</b> inter-VLAN traffic ek aise device se guzarta hai jahan policy enforce aur log hoti hai.</li>
<li><b>Saaf trust zones:</b> users, voice, servers, printers aur cameras (IoT), guests aur device management, har ek ko apna zone aur apne rules milte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Policy point ke saath VLAN segmentation">
<rect x="250" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">Firewall / L3</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">ACLs, inspection</text>
<line x1="320" y1="70" x2="320" y2="110" stroke="#64748b" stroke-width="3"/><text x="330" y="95" class="svg-muted" font-size="12">trunk (allowed 10,20,30,40,99)</text>
<rect x="30" y="110" width="580" height="16" rx="4" fill="#e2e8f0"/><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">access switches</text>
<rect x="30" y="160" width="100" height="50" rx="8" fill="#bae6fd"/><text x="80" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 10</text><text x="80" y="199" text-anchor="middle" class="svg-muted" font-size="12">users</text>
<rect x="150" y="160" width="100" height="50" rx="8" fill="#bbf7d0"/><text x="200" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 20</text><text x="200" y="199" text-anchor="middle" class="svg-muted" font-size="12">voice</text>
<rect x="270" y="160" width="100" height="50" rx="8" fill="#fde68a"/><text x="320" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 30</text><text x="320" y="199" text-anchor="middle" class="svg-muted" font-size="12">servers</text>
<rect x="390" y="160" width="100" height="50" rx="8" fill="#fed7aa"/><text x="440" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 40</text><text x="440" y="199" text-anchor="middle" class="svg-muted" font-size="12">IoT</text>
<rect x="510" y="160" width="100" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="182" text-anchor="middle" class="svg-ink" font-size="13">VLAN 99</text><text x="560" y="199" text-anchor="middle" class="svg-muted" font-size="12">management</text>
<text x="320" y="240" text-anchor="middle" class="svg-accent" font-size="12">VLAN 998 black hole (unused ports) aur VLAN 999 native par koi user nahi</text>
</svg><p class="cap">Har zone apna broadcast domain hai; zones ke beech jaane ka ek hi raasta policy point se hokar hai.</p></div>

<h3>Akela VLAN kaafi kyun nahi</h3>
<p>Segmentation zones ke <b>beech</b> traffic rokta hai. Ek VLAN ke <b>andar</b> ke attacks par iska koi asar nahi: VLAN 10 ka attacker ab bhi CAM table flood kar sakta hai, DHCP requests ka jawab de sakta hai ya VLAN 10 mein sabke liye gateway ka ARP spoof kar sakta hai. Aur agar trunks laaparwaahi se bane hain, to attacker VLAN se bahar bhi nikal sakta hai (VLAN hopping, chapter 7). Isiliye is module ke per-port controls exist karte hain. VLANs ko deewarein samjho aur port controls ko taale.</p>

<h3>Edge-port baseline</h3>
<p>Har user-facing port ko same template milta hai. Yeh raha ACC1 Gi0/1 ke liye, jo labs mein PC1 ka port hai:</p>
<pre class="code"><span class="c">! user edge port: sirf end host ki tarah behave karo</span>
interface GigabitEthernet0/1
 description USER-PC1
 switchport mode access                 <span class="c">! kabhi dynamic nahi</span>
 switchport access vlan 10
 switchport nonegotiate                 <span class="c">! koi DTP frames nahi</span>
 spanning-tree portfast                 <span class="c">! host port, turant forward</span>
 spanning-tree bpduguard enable         <span class="c">! yahan BPDU = err-disable</span>
 switchport port-security               <span class="c">! chapter 4</span>
 storm-control broadcast level 1.00     <span class="c">! chapter 9</span>
<span class="c">! unused port: shut aur black-hole VLAN mein park</span>
interface GigabitEthernet0/20
 description UNUSED
 switchport mode access
 switchport access vlan 998
 shutdown</pre>
<p>Uplink trunks ko ulta treatment milta hai: explicit allowed list, unused native VLAN aur koi negotiation nahi.</p>
<pre class="code">interface GigabitEthernet0/23
 description UPLINK-DSW
 switchport mode trunk
 switchport nonegotiate
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,40,99</pre>
<p>Cisco <code>switchport host</code> macro bhi deta hai, jo ek command mein access mode set karta hai, PortFast enable karta hai aur port par EtherChannel disable karta hai. Yeh achhi shuruaat hai, par security features aapko khud add karne padte hain.</p>

<h3>Baseline verify karo</h3>
<pre class="out">ACC1# show interfaces g0/1 switchport
Name: Gi0/1
Switchport: Enabled
<span class="hl">Administrative Mode: static access</span>
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
<span class="hl">Negotiation of Trunking: Off</span>
Access Mode VLAN: 10 (USERS)
Trunking Native Mode VLAN: 1 (default)
Voice VLAN: none</pre>
<p>Do highlighted lines woh hain jo defender check karta hai: port statically access port hai, aur DTP off hai, isliye koi use trunk banne ke liye mana nahi sakta.</p>

<div class="eg"><p><b>Worked example: ek VLAN plan.</b> VLAN 10 users 10.0.10.0/24, VLAN 20 voice 10.0.20.0/24, VLAN 30 servers 10.0.30.0/24, VLAN 40 IoT 10.0.40.0/24, VLAN 99 switch management 10.0.99.0/24, VLAN 998 black hole (koi SVI nahi, koi gateway nahi), VLAN 999 trunks par native VLAN (koi ports nahi, koi SVI nahi). VLAN 1 exist karta rehta hai kyunki use delete nahi kar sakte, par koi user port aur koi management address use use nahi karta.</p></div>

<div class="warn"><p><b>Common galti.</b> Switch management ko VLAN 1 mein chhodna aur unused ports ko VLAN 1 mein administratively up chhodna. VLAN 1 har jagah default hai, isliye ek unused wall socket management network par live port ban jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> VLANs broadcast domains ko alag karte hain; woh VLAN ke andar ke attacks nahi rokte. Jab question pooche ki "same subnet ke hosts ke beech traffic kaise segregate karein", to jawab private VLANs (chapter 11) hai, aur VLANs nahi.</p></div>

<div class="scn"><h4>User VLAN par cameras</h4><p>Ek retail chain mein CCTV cameras, card terminals aur office PCs sab ek flat VLAN mein the. Purane firmware wala ek camera internet se compromise hua aur apna subnet scan karne laga, har PC aur terminal tak pahunch gaya. Response team ne cameras ko VLAN 40 mein daala ek ACL ke saath jo unhe sirf video recorder tak jaane deta tha, aur terminals ko firewall ke peeche unke apne VLAN mein daala. Camera ka agla scan recorder ke alawa kisi tak nahi pahuncha.</p><p><b>Seekh:</b> segmentation "ek kharaab device" ko "ek kharaab zone" mein badal deta hai, aur zones ke beech ka policy point woh jagah hai jahan aap spread ko rokte aur log karte ho.</p></div>

<div class="iv"><p class="q">"Kya VLAN ek security boundary hai?"</p><p>Strong answer: aanshik roop se. VLAN broadcast domains alag karta hai, isliye inter-VLAN traffic ko Layer 3 policy point cross karna padta hai, jo asli control hai. Par VLAN ke andar hosts ko ek doosre se nahi bachata, aur misconfigured trunks (DTP, native VLAN) traffic ko VLANs ke beech hop karne de sakte hain. Isliye main VLANs ko hardened trunks, DHCP snooping aur DAI jaise per-port controls, aur jab ek subnet ke hosts ko aapas mein baat nahi karni ho to private VLANs ke saath combine karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLANs alag broadcast domains banate hain; inter-VLAN traffic ko Layer 3 policy point se guzarna padta hai.</li>
<li>Users, voice, servers, IoT, guests aur management ko alag karo; users aur management ko VLAN 1 se bahar rakho.</li>
<li>Edge baseline: access mode, nonegotiate, PortFast + BPDU guard, port security, storm-control.</li>
<li>Unused ports: shut down aur black-hole VLAN mein; trunks: allowed list, unused native VLAN, nonegotiate.</li>
<li>VLANs VLAN ke andar ke attacks nahi rokte; per-port controls rokte hain.</li>
</ul></div>
`}};export{e as default};