var e={id:`lan-attacks`,h:{en:`LAN and wireless attacks, and how to stop them`,hi:`LAN aur wireless attacks, aur unhe kaise rokein`},body:{en:`
<p>A housing society trusts anyone who is already inside the gate. Residents leave doors open, the notice board accepts any notice, and the watchman believes whoever says "I am from flat 204". Ethernet and Wi-Fi were designed with the same trust: switches learn any MAC address, hosts believe any ARP reply, and clients join any access point with a familiar name. Most attacks on the local network abuse that trust. This chapter explains each blueprint attack so you can recognise it and stop it. We describe them defensively; the goal is detection and prevention.</p>

<h3>MAC flooding</h3>
<p>A switch keeps a <b>MAC address table</b> (CAM table) of which MAC lives on which port. The table has a limit, often a few thousand entries. In MAC flooding, a device sends frames from thousands of fake source MACs until the table is full. The switch can no longer learn real addresses, so it <b>floods</b> unknown unicast frames out of every port in the VLAN, like a hub, and the attacker can capture traffic meant for others. <b>Defence:</b> port security with a maximum number of MACs per access port (Lab 2), plus 802.1X.</p>

<h3>ARP poisoning (ARP spoofing)</h3>
<p>Hosts use ARP to find the MAC for an IP, and they accept replies they never asked for. An attacker sends forged ARP replies saying "the gateway 10.0.10.1 is at my MAC". Victims now send their traffic to the attacker, who forwards it on, reading or changing it. This makes ARP poisoning the classic way to become <b>on-path</b>. <b>Defence:</b> Dynamic ARP Inspection (DAI), which checks ARP messages against the DHCP snooping table, plus encryption so intercepted traffic is unreadable.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ARP poisoning puts the attacker on-path">
<rect x="10" y="30" width="120" height="50" rx="10" fill="#bae6fd"/><text x="70" y="60" text-anchor="middle" class="svg-ink" font-size="13">Victim PC</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text>
<rect x="260" y="130" width="120" height="50" rx="10" fill="#fed7aa"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Attacker</text>
<line x1="130" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="12">intended path</text>
<line x1="100" y1="80" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="370" y1="140" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="150" y="130" text-anchor="middle" class="svg-accent" font-size="12">fake ARP replies</text>
<text x="490" y="130" text-anchor="middle" class="svg-accent" font-size="12">traffic relayed</text>
</svg><p class="cap">Forged ARP replies redirect traffic through the attacker: an on-path attack.</p></div>

<h3>On-path attacks</h3>
<p>An <b>on-path attack</b> (the older name is man-in-the-middle) is any attack where the adversary sits between two parties and can read, change or replay traffic. ARP poisoning, a rogue DHCP server handing out itself as the gateway, and an evil twin access point are all ways to get on-path. The strongest general defence is end-to-end encryption with certificate validation (TLS, SSH, IPsec), because the attacker sees only ciphertext and cannot impersonate the server without its private key.</p>

<h3>VLAN hopping</h3>
<p>VLAN hopping lets traffic escape its VLAN without going through a router or firewall. Two methods:</p>
<ul>
<li><b>Switch spoofing</b>: a device negotiates a trunk with DTP on a port left in dynamic mode, then reaches every VLAN on the trunk. <b>Defence:</b> set user ports to <code>switchport mode access</code> and disable negotiation with <code>switchport nonegotiate</code>.</li>
<li><b>Double tagging</b>: a frame carries two 802.1Q tags; the first switch strips the outer tag because it matches the trunk's native VLAN, and the next switch forwards it into the inner VLAN. It is one-way only. <b>Defence:</b> use an unused native VLAN on trunks, never put users in the native VLAN, and avoid VLAN 1.</li>
</ul>

<h3>Rogue devices: DHCP servers and access points</h3>
<p>A <b>rogue DHCP server</b> is any unauthorised device handing out addresses, often a home router plugged in by an employee. Clients receive the wrong gateway and DNS, so they lose access or are pointed at an attacker. <b>Defence:</b> DHCP snooping, which trusts DHCP server messages only on uplink ports. A <b>rogue access point</b> is an unauthorised AP connected to the wired network, creating a back door that bypasses the firewall. <b>Defence:</b> port security or 802.1X on wall ports, and wireless intrusion prevention (WIPS) scans.</p>
<p>An <b>evil twin</b> is a rogue AP that copies the name (SSID) of a legitimate network, often with a stronger signal, to lure users. Users who join may type credentials into a fake portal or have traffic intercepted. <b>Defence:</b> WPA3-Enterprise or 802.1X with clients configured to validate the RADIUS server certificate, WIPS detection and user awareness.</p>

<div class="eg"><p><b>Worked example: defensive access-switch template.</b> These lines harden the user VLAN 10 on an access switch whose uplink is Gi0/24.</p>
<pre class="code"><span class="c">! stop switch spoofing on user ports</span>
interface range GigabitEthernet0/1 - 20
 switchport mode access
 switchport nonegotiate
<span class="c">! stop double tagging: unused native VLAN on the trunk</span>
interface GigabitEthernet0/24
 switchport trunk native vlan 999
<span class="c">! stop rogue DHCP and ARP poisoning</span>
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface GigabitEthernet0/24
 ip dhcp snooping trust
 ip arp inspection trust</pre>
<p>When an employee plugs a home router into Gi0/7, the switch drops its offers and logs:</p>
<pre class="out"><span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 0bad.beef.0002</span></pre></div>

<div class="warn"><p><b>Common mistakes.</b> Enabling DHCP snooping but forgetting to trust the uplink, so every client loses DHCP. Leaving unused ports in dynamic mode and enabled. Assuming WPA2-Personal stops an evil twin; anyone who knows the shared passphrase can build one.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match symptom to attack: "switch acts like a hub" = MAC flooding; "wrong gateway MAC in the ARP cache" = ARP poisoning; "users get 192.168.1.x instead of the corporate range" = rogue DHCP; "same SSID, different BSSID, stronger signal" = evil twin; "reached another VLAN without routing" = VLAN hopping.</p></div>

<div class="scn"><h4>The printer that handed out addresses</h4><p>On Monday half of the second floor could not reach the internet. Their PCs had addresses in 192.168.0.0/24 and a gateway of 192.168.0.1, while the corporate range was 10.0.10.0/24. The engineer ran <code>ipconfig /all</code> on a victim PC, noted the DHCP server's address, found its MAC in the switch's MAC table on port Gi0/14 and discovered a consumer Wi-Fi router someone had brought in for their desk. The port was shut, the device removed, and DHCP snooping plus port security were rolled out to every access switch.</p><p><b>Lesson:</b> a rogue DHCP server is both an availability problem and an on-path risk. DHCP snooping makes it harmless.</p></div>

<div class="iv"><p class="q">"How does ARP poisoning work and how do you stop it?"</p><p>Explain that ARP has no authentication, so a host accepts unsolicited replies; the attacker claims the gateway's IP with its own MAC and relays the traffic, becoming on-path. Defences: DAI validated against the DHCP snooping binding table, port security to limit devices, 802.1X to keep unknown devices off the network, and encryption so intercepted traffic is useless. Mentioning the DHCP snooping dependency shows real experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC flooding fills the CAM table so the switch floods frames; stop it with port security.</li>
<li>ARP poisoning redirects traffic to become on-path; stop it with DAI and encryption.</li>
<li>VLAN hopping uses switch spoofing (DTP) or double tagging (native VLAN); use access mode, nonegotiate and an unused native VLAN.</li>
<li>Rogue DHCP is stopped by DHCP snooping; rogue APs by port security, 802.1X and WIPS.</li>
<li>Evil twin copies an SSID; defend with 802.1X certificate validation, WPA3 and WIPS.</li>
</ul></div>
`,hi:`
<p>Ek housing society gate ke andar aa chuke har insaan par bharosa karti hai. Residents darwaze khule chhodte hain, notice board koi bhi notice le leta hai, aur watchman us har insaan ki baat maan leta hai jo kahe "main flat 204 se hoon". Ethernet aur Wi-Fi isi bharose ke saath design hue the: switches koi bhi MAC address seekh lete hain, hosts koi bhi ARP reply maan lete hain, aur clients jaane-pehchaane naam wale kisi bhi access point se jud jaate hain. Local network par zyada tar attacks isi bharose ka galat fayda uthate hain. Yeh chapter blueprint ka har attack samjhata hai taaki aap use pehchaan kar rok sako. Hum inhe defensively describe karte hain; goal detection aur prevention hai.</p>

<h3>MAC flooding</h3>
<p>Switch ek <b>MAC address table</b> (CAM table) rakhta hai ki kaunsa MAC kis port par hai. Table ki ek limit hoti hai, aksar kuch hazaar entries. MAC flooding mein ek device hazaaron fake source MACs se frames bhejta hai jab tak table bhar na jaaye. Switch ab real addresses seekh nahi paata, isliye unknown unicast frames ko VLAN ke har port se <b>flood</b> karta hai, hub ki tarah, aur attacker dusron ke liye bana traffic capture kar sakta hai. <b>Defence:</b> har access port par MACs ki maximum sankhya wala port security (Lab 2), plus 802.1X.</p>

<h3>ARP poisoning (ARP spoofing)</h3>
<p>Hosts kisi IP ka MAC dhoondhne ke liye ARP use karte hain, aur woh aise replies bhi accept karte hain jo unhone kabhi maange hi nahi. Attacker nakli ARP replies bhejta hai ki "gateway 10.0.10.1 mere MAC par hai". Ab victims apna traffic attacker ko bhejte hain, jo use aage forward karta hai, padhte ya badalte hue. Isliye ARP poisoning <b>on-path</b> banne ka classic tareeka hai. <b>Defence:</b> Dynamic ARP Inspection (DAI), jo ARP messages ko DHCP snooping table se check karta hai, plus encryption taaki intercept hua traffic padha na ja sake.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="ARP poisoning attacker ko on-path bana deta hai">
<rect x="10" y="30" width="120" height="50" rx="10" fill="#bae6fd"/><text x="70" y="60" text-anchor="middle" class="svg-ink" font-size="13">Victim PC</text>
<rect x="510" y="30" width="120" height="50" rx="10" fill="#bbf7d0"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="13">Gateway</text>
<rect x="260" y="130" width="120" height="50" rx="10" fill="#fed7aa"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">Attacker</text>
<line x1="130" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="45" text-anchor="middle" class="svg-muted" font-size="12">asli raasta</text>
<line x1="100" y1="80" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="370" y1="140" x2="540" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="150" y="130" text-anchor="middle" class="svg-accent" font-size="12">nakli ARP replies</text>
<text x="490" y="130" text-anchor="middle" class="svg-accent" font-size="12">traffic relay</text>
</svg><p class="cap">Nakli ARP replies traffic ko attacker ke through mod dete hain: ek on-path attack.</p></div>

<h3>On-path attacks</h3>
<p><b>On-path attack</b> (purana naam man-in-the-middle) koi bhi aisa attack hai jismein adversary do parties ke beech baith kar traffic padh, badal ya replay kar sakta hai. ARP poisoning, khud ko gateway batane wala rogue DHCP server, aur evil twin access point, sab on-path banne ke tareeke hain. Sabse strong general defence certificate validation ke saath end-to-end encryption hai (TLS, SSH, IPsec), kyunki attacker ko sirf ciphertext dikhta hai aur woh server ki private key ke bina uska roop nahi le sakta.</p>

<h3>VLAN hopping</h3>
<p>VLAN hopping traffic ko bina router ya firewall se guzre apne VLAN se bahar nikalne deta hai. Do methods:</p>
<ul>
<li><b>Switch spoofing</b>: ek device dynamic mode mein chhode gaye port par DTP se trunk negotiate kar leta hai, phir trunk ke har VLAN tak pahunch jaata hai. <b>Defence:</b> user ports ko <code>switchport mode access</code> par set karo aur <code>switchport nonegotiate</code> se negotiation band karo.</li>
<li><b>Double tagging</b>: frame mein do 802.1Q tags hote hain; pehla switch outer tag hata deta hai kyunki woh trunk ke native VLAN se match karta hai, aur agla switch use inner VLAN mein forward kar deta hai. Yeh sirf one-way hai. <b>Defence:</b> trunks par unused native VLAN use karo, users ko kabhi native VLAN mein mat daalo, aur VLAN 1 se bacho.</li>
</ul>

<h3>Rogue devices: DHCP servers aur access points</h3>
<p><b>Rogue DHCP server</b> koi bhi unauthorised device hai jo addresses baant raha ho, aksar employee ka lagaya hua home router. Clients ko galat gateway aur DNS milta hai, isliye unka access chala jaata hai ya woh attacker ki taraf point ho jaate hain. <b>Defence:</b> DHCP snooping, jo DHCP server messages par sirf uplink ports par bharosa karta hai. <b>Rogue access point</b> wired network se juda ek unauthorised AP hai, jo firewall ko bypass karne wala back door banata hai. <b>Defence:</b> wall ports par port security ya 802.1X, aur wireless intrusion prevention (WIPS) scans.</p>
<p><b>Evil twin</b> ek rogue AP hai jo kisi legitimate network ka naam (SSID) copy karta hai, aksar zyada strong signal ke saath, taaki users ko lalcha sake. Jo users judte hain woh fake portal mein credentials type kar sakte hain ya unka traffic intercept ho sakta hai. <b>Defence:</b> WPA3-Enterprise ya 802.1X jismein clients RADIUS server certificate validate karne ke liye configured hon, WIPS detection aur user awareness.</p>

<div class="eg"><p><b>Worked example: defensive access-switch template.</b> Yeh lines ek access switch par user VLAN 10 ko harden karti hain jiska uplink Gi0/24 hai.</p>
<pre class="code"><span class="c">! stop switch spoofing on user ports</span>
interface range GigabitEthernet0/1 - 20
 switchport mode access
 switchport nonegotiate
<span class="c">! stop double tagging: unused native VLAN on the trunk</span>
interface GigabitEthernet0/24
 switchport trunk native vlan 999
<span class="c">! stop rogue DHCP and ARP poisoning</span>
ip dhcp snooping
ip dhcp snooping vlan 10
ip arp inspection vlan 10
interface GigabitEthernet0/24
 ip dhcp snooping trust
 ip arp inspection trust</pre>
<p>Jab koi employee Gi0/7 mein home router lagata hai, switch uske offers drop karta hai aur log karta hai:</p>
<pre class="out"><span class="hl">%DHCP_SNOOPING-5-DHCP_SNOOPING_UNTRUSTED_PORT: DHCP_SNOOPING drop message on untrusted port, message type: DHCPOFFER, MAC sa: 0bad.beef.0002</span></pre></div>

<div class="warn"><p><b>Common galtiyan.</b> DHCP snooping enable karna lekin uplink ko trust karna bhool jaana, jisse har client ka DHCP chala jaata hai. Unused ports ko dynamic mode mein aur enabled chhod dena. Yeh maan lena ki WPA2-Personal evil twin ko rokta hai; jise bhi shared passphrase pata hai woh ek bana sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Symptom ko attack se match karo: "switch hub jaisa behave kar raha hai" = MAC flooding; "ARP cache mein galat gateway MAC" = ARP poisoning; "users ko corporate range ki jagah 192.168.1.x mil raha hai" = rogue DHCP; "same SSID, alag BSSID, zyada strong signal" = evil twin; "bina routing ke dusre VLAN tak pahunch gaya" = VLAN hopping.</p></div>

<div class="scn"><h4>Woh printer jo addresses baant raha tha</h4><p>Monday ko doosri manzil ke aadhe log internet tak nahi pahunch pa rahe the. Unke PCs ke paas 192.168.0.0/24 mein addresses aur 192.168.0.1 gateway tha, jabki corporate range 10.0.10.0/24 thi. Engineer ne ek victim PC par <code>ipconfig /all</code> chalaya, DHCP server ka address note kiya, switch ki MAC table mein uska MAC port Gi0/14 par dhoondha aur ek consumer Wi-Fi router paaya jo koi apni desk ke liye laaya tha. Port shut hua, device hataya gaya, aur har access switch par DHCP snooping plus port security roll out hua.</p><p><b>Seekh:</b> rogue DHCP server availability problem bhi hai aur on-path risk bhi. DHCP snooping use bekaar kar deta hai.</p></div>

<div class="iv"><p class="q">"ARP poisoning kaise kaam karta hai aur aap use kaise rokoge?"</p><p>Samjhao ki ARP mein koi authentication nahi hai, isliye host bina maange replies accept karta hai; attacker gateway ke IP ko apne MAC ke saath claim karta hai aur traffic relay karta hai, on-path ban kar. Defences: DHCP snooping binding table se validate hone wala DAI, devices limit karne ke liye port security, unknown devices ko network se bahar rakhne ke liye 802.1X, aur encryption taaki intercept hua traffic bekaar ho. DHCP snooping dependency ka zikr real experience dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MAC flooding CAM table bhar deta hai taaki switch frames flood kare; port security se roko.</li>
<li>ARP poisoning traffic ko mod kar on-path banata hai; DAI aur encryption se roko.</li>
<li>VLAN hopping switch spoofing (DTP) ya double tagging (native VLAN) use karta hai; access mode, nonegotiate aur unused native VLAN use karo.</li>
<li>Rogue DHCP ko DHCP snooping rokta hai; rogue APs ko port security, 802.1X aur WIPS.</li>
<li>Evil twin SSID copy karta hai; 802.1X certificate validation, WPA3 aur WIPS se bachao.</li>
</ul></div>
`}};export{e as default};