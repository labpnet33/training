var e={id:`management-interface`,h:{en:`The wireless management interface (lab wl-mgmt-iface)`,hi:`Wireless management interface (lab wl-mgmt-iface)`},body:{en:`
<p>A fresh controller has no identity on the network. Before any AP can join, the controller needs an address, a path to its gateway, and a declaration of which interface APs should talk to. In this chapter you build that foundation and do the first lab.</p>

<h3>Analogy: the front door of the office</h3>
<p>Your company has many rooms inside, but visitors need one front door with a street address. The <b>wireless management interface</b> is that front door. APs knock on it to join. Other services (RADIUS, mobility between controllers) also use it by default as the source address.</p>

<h3>The concept</h3>
<dl class="terms">
<dt>Wireless management interface</dt><dd>The one layer 3 interface (a VLAN interface, SVI) that a 9800 uses for AP CAPWAP, management traffic to APs, and as the source of many controller-originated packets. There is exactly one. It is configured with <code>wireless management interface VlanN</code>.</dd>
<dt>SVI (switched virtual interface)</dt><dd>A virtual layer 3 interface for a VLAN, created with <code>interface VlanN</code>. It needs an IP address and must be up.</dd>
<dt>Trunk port</dt><dd>A physical port that carries several VLANs with 802.1Q tags. The controller's physical port must carry the management VLAN, and later the client VLANs.</dd>
<dt>Default route</dt><dd>A route to 0.0.0.0/0 pointing at the gateway so the controller can reply to networks other than its own, such as the AP subnet.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Management build">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">WLC1 inside</text>
<rect x="35" y="64" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">VLAN 99 in database</text>
<rect x="35" y="100" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="12">Vlan99 10.10.99.10/24</text>
<rect x="35" y="136" width="140" height="18" rx="4" fill="#fde68a"/><text x="105" y="149" text-anchor="middle" class="svg-ink" font-size="11">wireless management Vlan99</text>
<rect x="270" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="335" y="92" text-anchor="middle" class="svg-ink" font-size="12">Gi1 trunk to</text><text x="335" y="108" text-anchor="middle" class="svg-ink" font-size="12">SW1 Gi0/1</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">R1 gateway</text><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.1</text>
<line x1="190" y1="95" x2="270" y2="95" stroke="#64748b"/><line x1="400" y1="95" x2="490" y2="95" stroke="#64748b"/>
</svg><p class="cap">Five things must be true: VLAN exists, SVI has an address and is up, the physical port trunks VLAN 99, a default route exists and the management interface is declared.</p></div>

<h3>The lab, step by step</h3>
<p>WLC1 is new. Addressing from the lab: VLAN 99 WLC-MGMT is 10.10.99.0/24, WLC1 is .10 and R1 is .1. APs learn 10.10.99.10 from option 43 (chapter 3). Build the controller side:</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# vlan 99
WLC1(config-vlan)# name WLC-MGMT
WLC1(config-vlan)# exit
WLC1(config)# interface Vlan99
WLC1(config-if)# ip address 10.10.99.10 255.255.255.0
WLC1(config-if)# no shutdown
WLC1(config-if)# exit
WLC1(config)# interface GigabitEthernet1
WLC1(config-if)# switchport mode trunk
WLC1(config-if)# exit
WLC1(config)# ip route 0.0.0.0 0.0.0.0 10.10.99.1
WLC1(config)# wireless management interface Vlan99
WLC1(config)# end
WLC1# write memory</pre>
<p>In the lab the solve sequence is exactly vlan 99, interface Vlan99 with the address and no shutdown, the trunk, the default route and the wireless management interface. Naming VLAN 99 is good practice. An SVI line stays "down" until its VLAN exists and a port carries it, which is why the order above matters.</p>

<h3>Verify like an engineer</h3>
<pre class="out">WLC1# show wireless management interface

Wireless management interface : Vlan99
IP address                    : <span class="hl">10.10.99.10/24</span>

WLC1# ping 10.10.99.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.99.1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

WLC1# show ap summary
<span class="hl">AP1   ... 10.10.10.21  Registered</span>
<span class="hl">AP2   ... 10.10.10.22  Registered</span></pre>
<p>Read it as a chain. If the management interface line says "(not configured)" you missed the declaration. If it says "(interface down or no address)" the SVI or VLAN is not up. If the gateway ping fails the trunk or the switch side is wrong. If the ping works but the APs are absent, think discovery (chapter 3) and give them a minute to join.</p>
<pre class="out">WLC1# show ip interface brief
Interface                   IP-Address      OK?  Method  Status                Protocol
GigabitEthernet1            unassigned      YES  unset   up                    up
Vlan99                      <span class="hl">10.10.99.10</span>     YES  manual  up                    up</pre>

<h3>Real-platform notes</h3>
<ul>
<li>On hardware appliances you usually bundle several uplinks into a port-channel and trunk that; the logic is the same as the single trunk used here.</li>
<li>The management VLAN is best kept separate from the client VLANs so that a client problem cannot cut off AP management.</li>
<li>A second layer 3 interface, the wireless client VLAN SVIs, is optional: with central switching the controller bridges clients into VLANs at layer 2 and the router handles layer 3. We do exactly that: R1 hosts the gateways for VLANs 20, 30, 40 and 50.</li>
<li>Changing the management interface later makes APs drop and rejoin, so plan it in a window.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Suppose you type <code>ip address 10.10.99.10 255.255.255.0</code> but forget <code>no shutdown</code>. In the lab model a new SVI starts shut (on real IOS XE a new SVI usually comes up once its VLAN is active, so always read the status column). <code>show ip interface brief</code> shows "administratively down" and the gateway ping fails. One <code>no shutdown</code> repairs it. Reading the status column before the AP table saves ten minutes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Declaring the wireless management interface before the SVI has an address. (2) Making the physical port an access port, or a trunk that does not allow VLAN 99. (3) No default route, so the controller cannot reply to the AP subnet. (4) Using a client VLAN as the management interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> There is one wireless management interface per controller. Do not describe it as one per AP or one per WLAN.</p></div>

<div class="scn"><h4>Pings fine, APs absent</h4><p>A branch controller answered pings from the router, so the engineer trusted it. Yet no AP joined. <code>show wireless management interface</code> printed "(not configured)": the SVI was perfect, but nobody had told the platform to use it for APs. One command, and eight APs registered within a minute.</p><p><b>Lesson:</b> an interface that works is not the same as an interface that has the wireless role.</p></div>

<div class="iv"><p class="q">"What is the wireless management interface on a 9800?"</p><p>Strong answer: the single SVI used for AP CAPWAP and as default source for controller services such as RADIUS and mobility. It needs a VLAN, an IP address, a trunk path and a default route, and APs find its address through DHCP option 43 or DNS.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Open WLC1 and use <b>Configuration &gt; Layer2 &gt; VLAN</b> to add VLAN 99, then <b>Configuration &gt; Interface &gt; Logical</b> for the Vlan99 address, <b>Configuration &gt; Interface &gt; Ethernet</b> for the trunk port and <b>Configuration &gt; Interface &gt; Wireless</b> for the wireless management interface. Verify with <b>Monitoring &gt; Wireless &gt; Access Points</b> and <b>Troubleshooting &gt; Ping</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One wireless management interface per controller, an SVI declared with wireless management interface VlanN.</li>
<li>Build order: VLAN, SVI with address and no shutdown, trunk, default route, declaration.</li>
<li>Prove it with show wireless management interface, a gateway ping and show ap summary.</li>
<li>Each failed check points to a different layer: declaration, SVI, trunk, discovery.</li>
<li>Keep the management VLAN separate from client VLANs.</li>
</ul></div>
`,hi:`
<p>Fresh controller ki network par koi identity nahi hoti. Koi bhi AP join kare isse pehle controller ko ek address, apne gateway tak path, aur yeh declaration chahiye ki APs kaunse interface se baat karein. Is chapter mein aap yeh foundation banate ho aur pehla lab karte ho.</p>

<h3>Analogy: office ka front door</h3>
<p>Aapki company mein andar bahut kamre hain, lekin visitors ko ek front door chahiye jiska street address ho. <b>Wireless management interface</b> wahi front door hai. APs join karne ke liye ispe dastak dete hain. Doosri services (RADIUS, controllers ke beech mobility) bhi default roop se ise source address ki tarah use karti hain.</p>

<h3>Concept</h3>
<dl class="terms">
<dt>Wireless management interface</dt><dd>Woh ek layer 3 interface (VLAN interface, SVI) jo 9800 AP CAPWAP, APs ko management traffic, aur controller se nikle bahut se packets ke source ke liye use karta hai. Sirf ek hota hai. Ise <code>wireless management interface VlanN</code> se configure karte hain.</dd>
<dt>SVI (switched virtual interface)</dt><dd>VLAN ke liye virtual layer 3 interface, <code>interface VlanN</code> se banta hai. Ise IP address chahiye aur up hona chahiye.</dd>
<dt>Trunk port</dt><dd>Physical port jo 802.1Q tags ke saath kai VLANs le jaata hai. Controller ke physical port ko management VLAN, aur baad mein client VLANs, carry karne hote hain.</dd>
<dt>Default route</dt><dd>0.0.0.0/0 ka route jo gateway ki taraf jaata hai taaki controller apne network ke alawa networks ko reply kar sake, jaise AP subnet.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Management build">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#ddd6fe"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">WLC1 andar se</text>
<rect x="35" y="64" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">VLAN 99 database mein</text>
<rect x="35" y="100" width="140" height="30" rx="6" fill="#bbf7d0"/><text x="105" y="120" text-anchor="middle" class="svg-ink" font-size="12">Vlan99 10.10.99.10/24</text>
<rect x="35" y="136" width="140" height="18" rx="4" fill="#fde68a"/><text x="105" y="149" text-anchor="middle" class="svg-ink" font-size="11">wireless management Vlan99</text>
<rect x="270" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="335" y="92" text-anchor="middle" class="svg-ink" font-size="12">Gi1 trunk to</text><text x="335" y="108" text-anchor="middle" class="svg-ink" font-size="12">SW1 Gi0/1</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#fed7aa"/><text x="555" y="92" text-anchor="middle" class="svg-ink" font-size="12">R1 gateway</text><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.1</text>
<line x1="190" y1="95" x2="270" y2="95" stroke="#64748b"/><line x1="400" y1="95" x2="490" y2="95" stroke="#64748b"/>
</svg><p class="cap">Paanch cheezein sach honi chahiye: VLAN exist kare, SVI ke paas address ho aur up ho, physical port VLAN 99 trunk kare, default route ho aur management interface declare ho.</p></div>

<h3>Lab, step by step</h3>
<p>WLC1 naya hai. Lab ki addressing: VLAN 99 WLC-MGMT 10.10.99.0/24 hai, WLC1 .10 hai aur R1 .1 hai. APs 10.10.99.10 option 43 se seekhte hain (chapter 3). Controller side banao:</p>
<pre class="code">WLC1# configure terminal
WLC1(config)# vlan 99
WLC1(config-vlan)# name WLC-MGMT
WLC1(config-vlan)# exit
WLC1(config)# interface Vlan99
WLC1(config-if)# ip address 10.10.99.10 255.255.255.0
WLC1(config-if)# no shutdown
WLC1(config-if)# exit
WLC1(config)# interface GigabitEthernet1
WLC1(config-if)# switchport mode trunk
WLC1(config-if)# exit
WLC1(config)# ip route 0.0.0.0 0.0.0.0 10.10.99.1
WLC1(config)# wireless management interface Vlan99
WLC1(config)# end
WLC1# write memory</pre>
<p>Lab mein solve sequence bilkul yahi hai: vlan 99, address aur no shutdown ke saath interface Vlan99, trunk, default route aur wireless management interface. VLAN 99 ko naam dena achhi practice hai. SVI line tab tak "down" rehti hai jab tak uska VLAN exist na kare aur koi port use carry na kare, isliye upar ka order matter karta hai.</p>

<h3>Engineer ki tarah verify karo</h3>
<pre class="out">WLC1# show wireless management interface

Wireless management interface : Vlan99
IP address                    : <span class="hl">10.10.99.10/24</span>

WLC1# ping 10.10.99.1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.10.99.1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)

WLC1# show ap summary
<span class="hl">AP1   ... 10.10.10.21  Registered</span>
<span class="hl">AP2   ... 10.10.10.22  Registered</span></pre>
<p>Ise chain ki tarah padho. Agar management interface line "(not configured)" kehti hai to declaration miss hua. Agar "(interface down or no address)" kehti hai to SVI ya VLAN up nahi hai. Gateway ping fail ho to trunk ya switch side galat hai. Ping chale lekin APs na ho to discovery socho (chapter 3) aur unhe join hone ke liye ek minute do.</p>
<pre class="out">WLC1# show ip interface brief
Interface                   IP-Address      OK?  Method  Status                Protocol
GigabitEthernet1            unassigned      YES  unset   up                    up
Vlan99                      <span class="hl">10.10.99.10</span>     YES  manual  up                    up</pre>

<h3>Real-platform notes</h3>
<ul>
<li>Hardware appliances par aam taur par kai uplinks ko port-channel mein bundle karke trunk karte hain; logic wahi hai jo yahan ke single trunk ka hai.</li>
<li>Management VLAN ko client VLANs se alag rakhna best hai, taaki client problem AP management na kaat de.</li>
<li>Wireless client VLAN SVIs optional hain: central switching mein controller clients ko layer 2 par VLANs mein bridge karta hai aur layer 3 router sambhalta hai. Hum yahi karte hain: VLANs 20, 30, 40 aur 50 ke gateways R1 par hain.</li>
<li>Management interface baad mein badalne se APs drop hoke rejoin karte hain, isliye window mein plan karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Maan lo aapne <code>ip address 10.10.99.10 255.255.255.0</code> type kiya lekin <code>no shutdown</code> bhool gaye. Lab model mein naya SVI shut shuru hota hai (real IOS XE par naya SVI aam taur par up hota hai jab uska VLAN active ho, isliye status column hamesha padho). <code>show ip interface brief</code> "administratively down" dikhata hai aur gateway ping fail hota hai. Ek <code>no shutdown</code> repair kar deta hai. AP table se pehle status column padhne se das minute bachte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) SVI ko address milne se pehle wireless management interface declare karna. (2) Physical port ko access port banana, ya aisa trunk jo VLAN 99 allow nahi karta. (3) Default route nahi, isliye controller AP subnet ko reply nahi kar sakta. (4) Client VLAN ko management interface banana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Har controller par ek wireless management interface hota hai. Ise per AP ya per WLAN ek mat bolo.</p></div>

<div class="scn"><h4>Ping chalta hai, APs gayab</h4><p>Ek branch controller router ke pings ka jawab deta tha, to engineer ne use sahi maan liya. Phir bhi koi AP join nahi hua. <code>show wireless management interface</code> ne "(not configured)" print kiya: SVI perfect tha, lekin kisi ne platform ko nahi bataya tha ki use APs ke liye use kare. Ek command, aur aath APs ek minute mein register ho gaye.</p><p><b>Seekh:</b> jo interface chalta hai woh wahi nahi jisko wireless role mila ho.</p></div>

<div class="iv"><p class="q">"9800 par wireless management interface kya hai?"</p><p>Strong answer: woh akela SVI jo AP CAPWAP ke liye aur RADIUS aur mobility jaisi controller services ke default source ke roop mein use hota hai. Ise VLAN, IP address, trunk path aur default route chahiye, aur APs iska address DHCP option 43 ya DNS se dhoondhte hain.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> WLC1 kholo aur <b>Configuration &gt; Layer2 &gt; VLAN</b> se VLAN 99 add karo, phir Vlan99 address ke liye <b>Configuration &gt; Interface &gt; Logical</b>, trunk port ke liye <b>Configuration &gt; Interface &gt; Ethernet</b> aur wireless management interface ke liye <b>Configuration &gt; Interface &gt; Wireless</b>. Verify karo <b>Monitoring &gt; Wireless &gt; Access Points</b> aur <b>Troubleshooting &gt; Ping</b> se.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har controller par ek wireless management interface, ek SVI jo wireless management interface VlanN se declare hota hai.</li>
<li>Build order: VLAN, address aur no shutdown ke saath SVI, trunk, default route, declaration.</li>
<li>Prove karo show wireless management interface, gateway ping aur show ap summary se.</li>
<li>Har failed check alag layer batata hai: declaration, SVI, trunk, discovery.</li>
<li>Management VLAN ko client VLANs se alag rakho.</li>
</ul></div>
`}};export{e as default};