var e={id:`goals`,h:{en:`What you will learn: running Wi-Fi from a controller`,hi:`Aap kya seekhoge: controller se Wi-Fi chalana`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to take a brand-new wireless LAN controller (WLC) and a box of lightweight access points, get every AP to find and join the controller, build staff, corporate and guest WLANs with the right security, put each WLAN in the right VLAN, lock down who can manage the controller, and troubleshoot the classic tickets: "the AP never joins", "nobody can see the SSID", "the password is rejected" and "guests can reach our file server".</p>
<p><b>Prerequisites.</b> Module <b>ccna-wireless</b> taught the radio side: RF, channels, SSID/BSSID, AP modes and the principles of WPA2/WPA3. We will not repeat that; we build on it. You also need VLANs and 802.1Q trunks (<b>ccna-vlans</b>), router-on-a-stick (<b>ccna-intervlan</b>) and basic DHCP. If you can explain what a trunk carries and what a DHCP pool is, you are ready.</p>

<h3>The big picture: an airport control tower</h3>
<p>Think of an airport. Each gate (an access point) handles the real-time work: boarding passengers, closing doors, pushing the plane back. But no gate decides on its own which runway to use, who is allowed to board, or how to avoid another plane. The <b>control tower</b> (the controller) makes those decisions for every gate at once, and each gate talks to the tower over a private radio channel (the CAPWAP tunnel). A new gate opened tomorrow does not need its own rule book: it contacts the tower, downloads the rules, and starts working.</p>
<p>That is controller-based Wi-Fi. Engineers configure <b>one</b> device, the WLC, and every AP inherits the configuration. Add fifty APs next month and the WLANs, security and VLAN mapping appear on them automatically.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology for the module">
<rect x="30" y="30" width="130" height="46" rx="8" fill="#fde68a"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">gateways + DHCP</text>
<rect x="255" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10/20/30/40/99</text>
<rect x="480" y="30" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">mgmt 10.10.99.10</text>
<line x1="160" y1="53" x2="255" y2="53" stroke="#64748b" stroke-width="3"/><text x="207" y="45" text-anchor="middle" class="svg-accent" font-size="12">trunk</text>
<line x1="385" y1="53" x2="480" y2="53" stroke="#64748b" stroke-width="3"/><text x="432" y="45" text-anchor="middle" class="svg-accent" font-size="12">trunk</text>
<rect x="30" y="150" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="175" text-anchor="middle" class="svg-ink" font-size="13">SRV1 10.10.50.10</text>
<line x1="95" y1="76" x2="95" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="265" y="175" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="340" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="390" y="175" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="300" y1="76" x2="265" y2="150" stroke="#64748b" stroke-width="2"/><line x1="340" y1="76" x2="390" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">access VLAN 10</text>
<path d="M 265 190 Q 400 250 545 76" fill="none" stroke="#64748b" stroke-dasharray="5 4" stroke-width="1.5"/>
<text x="500" y="200" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP tunnels</text>
<rect x="215" y="245" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="265" y="268" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="340" y="245" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="390" y="268" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text>
</svg><p class="cap">The lab network used in every chapter. APs sit on access ports in VLAN 10; WLC1 and R1 sit on trunks; client traffic rides CAPWAP to WLC1.</p></div>

<h3>The lab addressing you will use everywhere</h3>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th><th>Who lives there</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>AP1, AP2 (DHCP pool AP-POOL on R1)</td></tr>
<tr><td>20</td><td>STAFF</td><td>10.10.20.0/24</td><td>Clients of NK-STAFF (WPA2-PSK)</td></tr>
<tr><td>30</td><td>GUEST</td><td>10.10.30.0/24</td><td>Clients of NK-GUEST, filtered by ACL GUEST-IN</td></tr>
<tr><td>40</td><td>CORP</td><td>10.10.40.0/24</td><td>Clients of NK-CORP (WPA2-Enterprise, RADIUS)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>WLC1 management interface 10.10.99.10</td></tr>
</table>
<p>R1 is the default gateway for every VLAN (sub-interfaces Gi0/0.10 to Gi0/0.99, each at <code>.1</code>) and the DHCP server. The servers SRV1 (10.10.50.10) and RAD1 (10.10.50.20, the RADIUS server) sit behind R1 Gi0/1.</p>

<h3>The road map of this module</h3>
<ol>
<li>WLAN architectures: autonomous, split-MAC with a WLC, cloud-managed, FlexConnect and the embedded wireless controller.</li>
<li>CAPWAP: the control and data tunnels, UDP 5246 and 5247, DTLS.</li>
<li>AP discovery and join: DHCP option 43, DNS, broadcast, priming, and why APs fail to join.</li>
<li>WLC ports versus interfaces: service port, distribution ports, LAG, management, virtual and dynamic interfaces.</li>
<li>Switch ports for APs and controllers.</li>
<li>Creating a WLAN in the GUI and CLI, and mapping it to a VLAN.</li>
<li>WPA2/WPA3 Personal and Enterprise with RADIUS.</li>
<li>Guest WLANs, and management access to the WLC (HTTPS, SSH, TACACS+/RADIUS).</li>
<li>A troubleshooting workflow, then a summary and exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A college has 120 APs on three floors. With autonomous APs, adding a new SSID for exam week means logging in to 120 devices, typing the same SSID, VLAN and key 120 times, and hoping nobody makes a typo. With a WLC, the engineer creates WLAN 5 once, clicks Apply, and within seconds all 120 APs beacon the new SSID. Removing it after exam week is one click too.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking the WLC is "in the path of the radio". It is not. The controller never transmits a single radio frame; it sits in the wired network, often in the data center. The APs do all the transmitting. The WLC decides policy and, in local mode, receives the client data through the tunnel.</p></div>

<div class="exam"><p><b>Exam trap.</b> The CCNA blueprint asks you to <i>describe</i> WLAN architectures, AP modes and physical infrastructure connections, and to <i>configure</i> a WLAN with WPA2 PSK using the GUI. Expect GUI screenshots from an AireOS-style controller with the General, Security, QoS and Advanced tabs. Know which tab holds which setting.</p></div>

<div class="scn"><h4>The hotel that outgrew its APs</h4><p>A 200-room hotel ran 60 autonomous APs, each configured by hand. Guests complained that Wi-Fi dropped when they walked from the lobby to the lift, and the IT person could not change the guest password without a whole day of work. An engineer installed a WLC in the server room, converted the APs to lightweight mode, and pointed them at the controller with DHCP option 43. One guest WLAN and one staff WLAN were built on the controller. Roaming improved because the controller now held every client's session, and the weekly guest password change became a two-minute job.</p><p><b>Lesson:</b> the controller turns many devices into one system: one configuration, one client database, one place to troubleshoot.</p></div>

<div class="iv"><p class="q">"Why would a company choose a wireless LAN controller instead of standalone APs?"</p><p>Strong answer: central configuration (one WLAN definition pushed to every AP), zero-touch AP deployment, consistent security and VLAN mapping, seamless roaming because the WLC holds the client database, automatic RF management (channels and power), central monitoring and rogue detection. Mention the trade-off: the controller must be redundant, and you must plan how APs discover it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A WLC centralises configuration, security, roaming and RF management for many lightweight APs.</li>
<li>APs do the real-time radio work; the WLC makes the decisions and never transmits radio frames itself.</li>
<li>The lab uses VLAN 10 for APs, 20/30/40 for staff/guest/corp clients and 99 for WLC management.</li>
<li>This module builds on ccna-wireless (RF and security principles) and ccna-vlans (trunks).</li>
<li>The exam expects GUI knowledge: General, Security, QoS and Advanced WLAN tabs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap ek bilkul naya wireless LAN controller (WLC) aur lightweight access points ka ek dabba le kar, har AP ko controller dhoondhne aur join karne dila paoge, sahi security ke saath staff, corporate aur guest WLANs bana paoge, har WLAN ko sahi VLAN mein daal paoge, controller ko kaun manage kar sakta hai yeh lock kar paoge, aur classic tickets troubleshoot kar paoge: "AP kabhi join nahi karta", "kisi ko SSID nahi dikhta", "password reject ho raha hai" aur "guests hamare file server tak pahunch jaate hain".</p>
<p><b>Prerequisites.</b> Module <b>ccna-wireless</b> ne radio side sikhayi thi: RF, channels, SSID/BSSID, AP modes aur WPA2/WPA3 ke principles. Hum woh repeat nahi karenge; hum uske upar banayenge. Aapko VLANs aur 802.1Q trunks (<b>ccna-vlans</b>), router-on-a-stick (<b>ccna-intervlan</b>) aur basic DHCP bhi aana chahiye. Agar aap samjha sakte ho ki trunk kya carry karta hai aur DHCP pool kya hota hai, to aap ready ho.</p>

<h3>Big picture: airport ka control tower</h3>
<p>Ek airport ke baare mein socho. Har gate (ek access point) real-time kaam sambhalta hai: passengers ko board karana, darwaze band karna, plane ko pushback dena. Lekin koi gate khud tay nahi karta ki kaunsa runway use hoga, kaun board kar sakta hai, ya doosre plane se kaise bachna hai. <b>Control tower</b> (controller) yeh faisle ek saath har gate ke liye leta hai, aur har gate tower se ek private radio channel (CAPWAP tunnel) par baat karta hai. Kal khula naya gate apni rule book nahi maangta: woh tower se contact karta hai, rules download karta hai, aur kaam shuru kar deta hai.</p>
<p>Yahi controller-based Wi-Fi hai. Engineers <b>ek</b> device configure karte hain, WLC, aur har AP woh configuration inherit karta hai. Agle mahine pachaas APs jodo aur WLANs, security aur VLAN mapping un par apne aap aa jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Module ka lab topology">
<rect x="30" y="30" width="130" height="46" rx="8" fill="#fde68a"/><text x="95" y="52" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="95" y="68" text-anchor="middle" class="svg-muted" font-size="12">gateways + DHCP</text>
<rect x="255" y="30" width="130" height="46" rx="8" fill="#bae6fd"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">SW1</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">VLAN 10/20/30/40/99</text>
<rect x="480" y="30" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="52" text-anchor="middle" class="svg-ink" font-size="14">WLC1</text><text x="545" y="68" text-anchor="middle" class="svg-muted" font-size="12">mgmt 10.10.99.10</text>
<line x1="160" y1="53" x2="255" y2="53" stroke="#64748b" stroke-width="3"/><text x="207" y="45" text-anchor="middle" class="svg-accent" font-size="12">trunk</text>
<line x1="385" y1="53" x2="480" y2="53" stroke="#64748b" stroke-width="3"/><text x="432" y="45" text-anchor="middle" class="svg-accent" font-size="12">trunk</text>
<rect x="30" y="150" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="175" text-anchor="middle" class="svg-ink" font-size="13">SRV1 10.10.50.10</text>
<line x1="95" y1="76" x2="95" y2="150" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="265" y="175" text-anchor="middle" class="svg-ink" font-size="13">AP1</text>
<rect x="340" y="150" width="100" height="40" rx="8" fill="#fed7aa"/><text x="390" y="175" text-anchor="middle" class="svg-ink" font-size="13">AP2</text>
<line x1="300" y1="76" x2="265" y2="150" stroke="#64748b" stroke-width="2"/><line x1="340" y1="76" x2="390" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="330" y="125" text-anchor="middle" class="svg-muted" font-size="12">access VLAN 10</text>
<path d="M 265 190 Q 400 250 545 76" fill="none" stroke="#64748b" stroke-dasharray="5 4" stroke-width="1.5"/>
<text x="500" y="200" text-anchor="middle" class="svg-accent" font-size="12">CAPWAP tunnels</text>
<rect x="215" y="245" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="265" y="268" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1</text>
<rect x="340" y="245" width="100" height="36" rx="8" fill="#e2e8f0"/><text x="390" y="268" text-anchor="middle" class="svg-ink" font-size="13">PHONE1</text>
</svg><p class="cap">Har chapter mein use hone wala lab network. APs VLAN 10 ke access ports par hain; WLC1 aur R1 trunks par; client traffic CAPWAP par WLC1 tak jaata hai.</p></div>

<h3>Lab addressing jo aap har jagah use karoge</h3>
<table class="cmp"><tr><th>VLAN</th><th>Naam</th><th>Subnet</th><th>Wahan kaun rehta hai</th></tr>
<tr><td>10</td><td>AP-MGMT</td><td>10.10.10.0/24</td><td>AP1, AP2 (R1 par DHCP pool AP-POOL)</td></tr>
<tr><td>20</td><td>STAFF</td><td>10.10.20.0/24</td><td>NK-STAFF ke clients (WPA2-PSK)</td></tr>
<tr><td>30</td><td>GUEST</td><td>10.10.30.0/24</td><td>NK-GUEST ke clients, ACL GUEST-IN se filtered</td></tr>
<tr><td>40</td><td>CORP</td><td>10.10.40.0/24</td><td>NK-CORP ke clients (WPA2-Enterprise, RADIUS)</td></tr>
<tr><td>99</td><td>WLC-MGMT</td><td>10.10.99.0/24</td><td>WLC1 ka management interface 10.10.99.10</td></tr>
</table>
<p>R1 har VLAN ka default gateway hai (sub-interfaces Gi0/0.10 se Gi0/0.99, har ek <code>.1</code> par) aur DHCP server bhi. Servers SRV1 (10.10.50.10) aur RAD1 (10.10.50.20, RADIUS server) R1 Gi0/1 ke peeche baithe hain.</p>

<h3>Is module ka road map</h3>
<ol>
<li>WLAN architectures: autonomous, WLC ke saath split-MAC, cloud-managed, FlexConnect aur embedded wireless controller.</li>
<li>CAPWAP: control aur data tunnels, UDP 5246 aur 5247, DTLS.</li>
<li>AP discovery aur join: DHCP option 43, DNS, broadcast, priming, aur APs join karne mein fail kyun hote hain.</li>
<li>WLC ports vs interfaces: service port, distribution ports, LAG, management, virtual aur dynamic interfaces.</li>
<li>APs aur controllers ke liye switch ports.</li>
<li>GUI aur CLI mein WLAN banana, aur use VLAN se map karna.</li>
<li>RADIUS ke saath WPA2/WPA3 Personal aur Enterprise.</li>
<li>Guest WLANs, aur WLC ka management access (HTTPS, SSH, TACACS+/RADIUS).</li>
<li>Ek troubleshooting workflow, phir summary aur exam checklist.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek college mein teen floors par 120 APs hain. Autonomous APs ke saath, exam week ke liye naya SSID jodne ka matlab hai 120 devices mein login karna, wahi SSID, VLAN aur key 120 baar type karna, aur umeed karna ki koi typo na ho. WLC ke saath engineer ek baar WLAN 5 banata hai, Apply click karta hai, aur kuch seconds mein saare 120 APs naya SSID beacon karne lagte hain. Exam week ke baad use hatana bhi ek click hai.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki WLC "radio ke raaste mein" hai. Aisa nahi hai. Controller kabhi ek bhi radio frame transmit nahi karta; woh wired network mein baitha hota hai, aksar data center mein. Saara transmit APs karte hain. WLC policy tay karta hai aur, local mode mein, tunnel ke through client data receive karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> CCNA blueprint aapse WLAN architectures, AP modes aur physical infrastructure connections <i>describe</i> karne ko, aur GUI use karke WPA2 PSK wala WLAN <i>configure</i> karne ko kehta hai. AireOS-style controller ke GUI screenshots expect karo jismein General, Security, QoS aur Advanced tabs hon. Yaad rakho kaunsa setting kis tab mein hai.</p></div>

<div class="scn"><h4>Woh hotel jo apne APs se bada ho gaya</h4><p>Ek 200-room hotel 60 autonomous APs chalata tha, har ek haath se configure kiya hua. Guests shikayat karte the ki lobby se lift tak chalte hue Wi-Fi drop ho jaata hai, aur IT wala banda poora din lagaye bina guest password nahi badal sakta tha. Ek engineer ne server room mein WLC lagaya, APs ko lightweight mode mein convert kiya, aur DHCP option 43 se unhe controller ki taraf point kiya. Controller par ek guest WLAN aur ek staff WLAN banaya gaya. Roaming behtar hui kyunki ab controller har client ka session rakhta tha, aur har hafte ka guest password change do minute ka kaam ban gaya.</p><p><b>Seekh:</b> controller bahut saare devices ko ek system bana deta hai: ek configuration, ek client database, troubleshoot karne ki ek jagah.</p></div>

<div class="iv"><p class="q">"Company standalone APs ki jagah wireless LAN controller kyun chunegi?"</p><p>Strong answer: central configuration (ek WLAN definition har AP par push hoti hai), zero-touch AP deployment, consistent security aur VLAN mapping, seamless roaming kyunki WLC client database rakhta hai, automatic RF management (channels aur power), central monitoring aur rogue detection. Trade-off bhi batao: controller redundant hona chahiye, aur aapko plan karna padta hai ki APs use kaise discover karenge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>WLC bahut saare lightweight APs ke liye configuration, security, roaming aur RF management centralise karta hai.</li>
<li>APs real-time radio kaam karte hain; WLC faisle leta hai aur khud kabhi radio frames transmit nahi karta.</li>
<li>Lab mein APs ke liye VLAN 10, staff/guest/corp clients ke liye 20/30/40 aur WLC management ke liye 99 hai.</li>
<li>Yeh module ccna-wireless (RF aur security principles) aur ccna-vlans (trunks) par banta hai.</li>
<li>Exam GUI knowledge expect karta hai: General, Security, QoS aur Advanced WLAN tabs.</li>
</ul></div>
`}};export{e as default};