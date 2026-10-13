var e={id:`attack-surface`,h:{en:`The network attack surface, layer by layer, and which control stops what`,hi:`Network attack surface, layer dar layer, aur kaunsa control kya rokta hai`},body:{en:`
<p>Picture a house. A burglar does not care how strong the front door is if the kitchen window is open, the garage remote is on the default code and the spare key is under the flowerpot. Every door, window, vent and key is part of the house's <b>attack surface</b>: the full set of places where an outsider can try to get in. Security starts by knowing that list, then closing what is not needed and guarding what must stay open.</p>

<h3>What an attack surface is</h3>
<p>The <b>attack surface</b> of a network is every point where an attacker can send input or touch something: an open port, a login page, a switch port in a meeting room, a Wi-Fi network, an API key in a code repository, a user who reads email. Two ideas follow from it:</p>
<ul>
<li><b>Attack surface reduction</b>: remove what is not needed (disable Telnet, close unused ports, shut unused switch ports, delete old test servers). A service that does not exist cannot be exploited.</li>
<li><b>Guard what remains</b>: every exposed service that the business needs gets a control in front of it, and logging behind it.</li>
</ul>
<p>As a CCNA-level engineer you already know the layers. Now walk them with an attacker's eye.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Attack surface by layer with controls">
<text x="120" y="18" text-anchor="middle" class="svg-accent" font-size="13">Layer</text><text x="320" y="18" text-anchor="middle" class="svg-accent" font-size="13">Typical attack</text><text x="530" y="18" text-anchor="middle" class="svg-accent" font-size="13">Control</text>
<rect x="10" y="28" width="620" height="32" rx="6" fill="#fde68a"/><text x="120" y="49" text-anchor="middle" class="svg-ink" font-size="13">Users</text><text x="320" y="49" text-anchor="middle" class="svg-ink" font-size="12">phishing, weak passwords</text><text x="530" y="49" text-anchor="middle" class="svg-ink" font-size="12">email security, MFA</text>
<rect x="10" y="66" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="120" y="87" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="12">public storage, leaked keys</text><text x="530" y="87" text-anchor="middle" class="svg-ink" font-size="12">CSPM, least privilege</text>
<rect x="10" y="104" width="620" height="32" rx="6" fill="#ddd6fe"/><text x="120" y="125" text-anchor="middle" class="svg-ink" font-size="13">Wireless</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">rogue AP, evil twin</text><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">WPA3, 802.1X, WIPS</text>
<rect x="10" y="142" width="620" height="32" rx="6" fill="#fed7aa"/><text x="120" y="163" text-anchor="middle" class="svg-ink" font-size="13">Management plane</text><text x="320" y="163" text-anchor="middle" class="svg-ink" font-size="12">Telnet, default SNMP</text><text x="530" y="163" text-anchor="middle" class="svg-ink" font-size="12">SSH, SNMPv3, AAA</text>
<rect x="10" y="180" width="620" height="32" rx="6" fill="#bae6fd"/><text x="120" y="201" text-anchor="middle" class="svg-ink" font-size="13">Services and apps</text><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="12">exposed RDP, unpatched VPN</text><text x="530" y="201" text-anchor="middle" class="svg-ink" font-size="12">NGFW, IPS, patching</text>
<rect x="10" y="218" width="620" height="32" rx="6" fill="#e2e8f0"/><text x="120" y="239" text-anchor="middle" class="svg-ink" font-size="13">Layer 3</text><text x="320" y="239" text-anchor="middle" class="svg-ink" font-size="12">spoofing, DDoS, bad routes</text><text x="530" y="239" text-anchor="middle" class="svg-ink" font-size="12">uRPF, ACLs, routing auth</text>
<rect x="10" y="256" width="620" height="32" rx="6" fill="#bae6fd"/><text x="120" y="277" text-anchor="middle" class="svg-ink" font-size="13">Layer 2</text><text x="320" y="277" text-anchor="middle" class="svg-ink" font-size="12">MAC flood, ARP spoof, rogue DHCP</text><text x="530" y="277" text-anchor="middle" class="svg-ink" font-size="12">port security, DAI, snooping</text>
</svg><p class="cap">Each layer has its own classic attacks and its own controls. Most later modules in this track own one row.</p></div>

<h3>Layer 2: the access switch</h3>
<p>Anyone who plugs into a live port is already inside the broadcast domain. Classic attacks: <b>MAC flooding</b> (fill the CAM table so the switch floods frames everywhere), <b>ARP spoofing</b> (claim to be the gateway and sit in the middle), <b>rogue DHCP</b> (hand out a fake gateway or DNS server), <b>VLAN hopping</b> (abuse DTP or the native VLAN) and <b>STP manipulation</b> (claim to be root bridge). Controls: port security, DHCP snooping, Dynamic ARP Inspection, IP Source Guard, disabling DTP and unused ports, BPDU guard and root guard, storm control. The Layer 2 security module labs every one of them.</p>

<h3>Layer 3: addressing and routing</h3>
<p>Attackers forge source addresses (<b>IP spoofing</b>) to hide or to reflect traffic at a victim, flood links and state tables (<b>DoS and DDoS</b>), or inject false routes into an unauthenticated routing protocol. Controls: infrastructure ACLs, <b>uRPF</b> (drop packets whose source could not be reached back through the arriving interface), routing protocol authentication, control plane policing, and upstream DDoS scrubbing.</p>

<h3>Services and applications</h3>
<p>This is where most real breaches start: an internet-facing RDP server, an unpatched VPN or firewall appliance, a web application with SQL injection, an API without authentication. Controls: expose only what the business needs, put it in a DMZ behind a stateful firewall and IPS, patch by risk (CVSS score plus exploit status), use a web application firewall for web apps, and require MFA on every remote login.</p>

<h3>The management plane</h3>
<p>The management plane is how you log into and control devices: SSH, HTTPS GUIs, SNMP, APIs, console. If an attacker owns it, they own the network. Typical gaps: Telnet still enabled, SNMP v2c with the community <code>public</code>, default passwords, management interfaces reachable from user VLANs. Look at what a router is actually listening on:</p>
<pre class="out">EDGE-R1# show control-plane host open-ports
Active internet connections (servers and established)
Prot        Local Address      Foreign Address        Service    State
 tcp                 *:22                  *:0     SSH-Server   LISTEN
<span class="hl"> tcp                 *:23                  *:0         Telnet   LISTEN</span>
 tcp                 *:80                  *:0      HTTP CORE   LISTEN
<span class="hl"> udp                *:161                  *:0        IP SNMP   LISTEN</span></pre>
<p>Telnet sends passwords in clear text and the HTTP server is not needed. A first hardening pass:</p>
<pre class="code"><span class="c">! Allow management only from the admin subnet</span>
ip access-list standard MGMT-ONLY
 permit 10.1.99.0 0.0.0.255
<span class="c">! SSH only on the VTY lines, and only from MGMT-ONLY</span>
line vty 0 15
 transport input ssh
 access-class MGMT-ONLY in
<span class="c">! Remove services nobody uses</span>
no ip h&#116;tp server
no snmp-server community public</pre>
<p>SNMPv3 with authentication and privacy, TACACS+ with command authorisation, authenticated NTP and secure syslog come in the AAA and secure device management module.</p>

<h3>Wireless, cloud and users</h3>
<p><b>Wireless</b> reaches through walls: rogue access points plugged into the LAN, <b>evil twin</b> networks with the same SSID, weak pre-shared keys. Controls: WPA3 or WPA2-Enterprise with 802.1X, rogue AP detection (wireless IPS), separate guest networks. <b>Cloud</b> adds a surface you cannot see from your switches: public storage buckets, security groups open to 0.0.0.0/0, access keys leaked in code, too-powerful identities. Controls: cloud posture management, least-privilege identities, logging into the SIEM. <b>Users</b> are the largest surface of all: phishing, reused passwords, MFA fatigue. Controls: email security, DNS security, MFA with number matching, training.</p>

<div class="eg"><p><b>Worked example.</b> A 300-user office lists its surface: 48 access switches with about 2,000 ports (600 unused), 3 SSIDs, 1 internet edge firewall with 4 published services, 2 routers with Telnet enabled, 1 cloud account with 12 storage buckets and 450 mailboxes. Reduction in week one: shut 600 unused ports into a parking VLAN, disable Telnet, retire one old published FTP service, set all buckets private. The surface shrank before a single new product was bought.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hardening only the internet edge while management interfaces are reachable from every user VLAN. Leaving unused switch ports up in a data VLAN. Forgetting the cloud account and third-party SaaS in the inventory. Assuming internal means trusted.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match attack to control exactly: MAC flooding = port security; rogue DHCP = DHCP snooping; ARP spoofing = DAI (which relies on the snooping binding table); spoofed source IP = uRPF or IP Source Guard; rogue root bridge = root guard or BPDU guard; clear-text management = SSH and SNMPv3.</p></div>

<div class="scn"><h4>The meeting-room port that ran a scanner</h4><p>A SOC saw internal port scans from a meeting-room IP at 01:00 every night. The address belonged to a live switch port behind the meeting-room TV, left in the user VLAN. Someone had plugged in a small computer during a visit. The team removed it, shut every unused port into a parking VLAN, rolled out 802.1X with MAB for printers and TVs, and added port security. The same audit found Telnet enabled on six branch routers, which were moved to SSH with a management ACL.</p><p><b>Lesson:</b> the cheapest security win is removing surface you did not know you had.</p></div>

<div class="iv"><p class="q">"What is an attack surface, and how would you reduce it for a campus network?"</p><p>Strong answer: define it as every point where an attacker can interact with your systems, then go layer by layer: shut unused switch ports and apply port security, DHCP snooping and DAI; disable Telnet and HTTP, use SSH with a management ACL and SNMPv3; expose only required services through a DMZ and NGFW; enforce 802.1X and MFA; and include wireless and cloud in the inventory. Mention that reduction comes first and new products second.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The attack surface is every point an attacker can touch: ports, services, management, wireless, cloud and users.</li>
<li>Reduce first (remove what is not needed), then guard what must stay exposed.</li>
<li>Layer 2 attacks are stopped by port security, DHCP snooping, DAI, IP Source Guard and STP guards.</li>
<li>The management plane must be SSH, SNMPv3 and AAA, reachable only from an admin subnet.</li>
<li>Most breaches start at exposed services or users, so patching, MFA and email security matter most.</li>
</ul></div>
`,hi:`
<p>Ek ghar ki kalpana karo. Chor ko farak nahi padta ki front door kitna mazboot hai agar kitchen ki khidki khuli hai, garage remote default code par hai aur spare chaabi gamle ke neeche rakhi hai. Har darwaza, khidki, vent aur chaabi ghar ke <b>attack surface</b> ka hissa hai: woh saari jagah jahan se koi bahar wala andar aane ki koshish kar sakta hai. Security us list ko jaanne se shuru hoti hai, phir jo zaroori nahi use band karo aur jo khula rehna chahiye uski nigrani karo.</p>

<h3>Attack surface kya hota hai</h3>
<p>Network ka <b>attack surface</b> har woh point hai jahan attacker input bhej sakta hai ya kuch chhoo sakta hai: ek open port, ek login page, meeting room ka switch port, ek Wi-Fi network, code repository mein pada API key, ek user jo email padhta hai. Isse do ideas nikalte hain:</p>
<ul>
<li><b>Attack surface reduction</b>: jo zaroori nahi use hatao (Telnet disable karo, unused ports band karo, unused switch ports shut karo, purane test servers delete karo). Jo service exist hi nahi karti use exploit nahi kiya ja sakta.</li>
<li><b>Jo bacha hai uski rakhwali</b>: business ko jis exposed service ki zaroorat hai, uske aage ek control aur peeche logging hona chahiye.</li>
</ul>
<p>CCNA-level engineer ke roop mein aap layers pehle se jaante ho. Ab unhe attacker ki nazar se dekho.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Layer ke hisaab se attack surface aur controls">
<text x="120" y="18" text-anchor="middle" class="svg-accent" font-size="13">Layer</text><text x="320" y="18" text-anchor="middle" class="svg-accent" font-size="13">Typical attack</text><text x="530" y="18" text-anchor="middle" class="svg-accent" font-size="13">Control</text>
<rect x="10" y="28" width="620" height="32" rx="6" fill="#fde68a"/><text x="120" y="49" text-anchor="middle" class="svg-ink" font-size="13">Users</text><text x="320" y="49" text-anchor="middle" class="svg-ink" font-size="12">phishing, kamzor passwords</text><text x="530" y="49" text-anchor="middle" class="svg-ink" font-size="12">email security, MFA</text>
<rect x="10" y="66" width="620" height="32" rx="6" fill="#bbf7d0"/><text x="120" y="87" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text><text x="320" y="87" text-anchor="middle" class="svg-ink" font-size="12">public storage, leak hue keys</text><text x="530" y="87" text-anchor="middle" class="svg-ink" font-size="12">CSPM, least privilege</text>
<rect x="10" y="104" width="620" height="32" rx="6" fill="#ddd6fe"/><text x="120" y="125" text-anchor="middle" class="svg-ink" font-size="13">Wireless</text><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="12">rogue AP, evil twin</text><text x="530" y="125" text-anchor="middle" class="svg-ink" font-size="12">WPA3, 802.1X, WIPS</text>
<rect x="10" y="142" width="620" height="32" rx="6" fill="#fed7aa"/><text x="120" y="163" text-anchor="middle" class="svg-ink" font-size="13">Management plane</text><text x="320" y="163" text-anchor="middle" class="svg-ink" font-size="12">Telnet, default SNMP</text><text x="530" y="163" text-anchor="middle" class="svg-ink" font-size="12">SSH, SNMPv3, AAA</text>
<rect x="10" y="180" width="620" height="32" rx="6" fill="#bae6fd"/><text x="120" y="201" text-anchor="middle" class="svg-ink" font-size="13">Services aur apps</text><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="12">exposed RDP, unpatched VPN</text><text x="530" y="201" text-anchor="middle" class="svg-ink" font-size="12">NGFW, IPS, patching</text>
<rect x="10" y="218" width="620" height="32" rx="6" fill="#e2e8f0"/><text x="120" y="239" text-anchor="middle" class="svg-ink" font-size="13">Layer 3</text><text x="320" y="239" text-anchor="middle" class="svg-ink" font-size="12">spoofing, DDoS, galat routes</text><text x="530" y="239" text-anchor="middle" class="svg-ink" font-size="12">uRPF, ACLs, routing auth</text>
<rect x="10" y="256" width="620" height="32" rx="6" fill="#bae6fd"/><text x="120" y="277" text-anchor="middle" class="svg-ink" font-size="13">Layer 2</text><text x="320" y="277" text-anchor="middle" class="svg-ink" font-size="12">MAC flood, ARP spoof, rogue DHCP</text><text x="530" y="277" text-anchor="middle" class="svg-ink" font-size="12">port security, DAI, snooping</text>
</svg><p class="cap">Har layer ke apne classic attacks aur apne controls hain. Is track ke zyada tar aage wale modules ek row ke maalik hain.</p></div>

<h3>Layer 2: access switch</h3>
<p>Jo bhi live port mein plug karta hai woh pehle se broadcast domain ke andar hai. Classic attacks: <b>MAC flooding</b> (CAM table bhar do taaki switch frames har jagah flood kare), <b>ARP spoofing</b> (gateway hone ka daawa karo aur beech mein baith jao), <b>rogue DHCP</b> (nakli gateway ya DNS server baanto), <b>VLAN hopping</b> (DTP ya native VLAN ka galat use) aur <b>STP manipulation</b> (root bridge hone ka daawa). Controls: port security, DHCP snooping, Dynamic ARP Inspection, IP Source Guard, DTP aur unused ports disable karna, BPDU guard aur root guard, storm control. Layer 2 security module in sab ka lab karata hai.</p>

<h3>Layer 3: addressing aur routing</h3>
<p>Attackers source addresses forge karte hain (<b>IP spoofing</b>) chhupne ke liye ya traffic ko victim par reflect karne ke liye, links aur state tables ko flood karte hain (<b>DoS aur DDoS</b>), ya unauthenticated routing protocol mein nakli routes daalte hain. Controls: infrastructure ACLs, <b>uRPF</b> (woh packets drop karo jinka source aane wale interface se wapas reach na ho sake), routing protocol authentication, control plane policing, aur upstream DDoS scrubbing.</p>

<h3>Services aur applications</h3>
<p>Zyada tar real breaches yahin se shuru hote hain: internet-facing RDP server, unpatched VPN ya firewall appliance, SQL injection wali web application, bina authentication ka API. Controls: sirf wahi expose karo jo business ko chahiye, use DMZ mein stateful firewall aur IPS ke peeche rakho, risk ke hisaab se patch karo (CVSS score plus exploit status), web apps ke liye web application firewall use karo, aur har remote login par MFA zaroori karo.</p>

<h3>Management plane</h3>
<p>Management plane woh raasta hai jisse aap devices mein login karte ho aur unhe control karte ho: SSH, HTTPS GUIs, SNMP, APIs, console. Agar attacker iska maalik ban gaya, to network ka maalik ban gaya. Typical gaps: Telnet abhi bhi enabled, community <code>public</code> ke saath SNMP v2c, default passwords, user VLANs se reachable management interfaces. Dekho router asal mein kis par listen kar raha hai:</p>
<pre class="out">EDGE-R1# show control-plane host open-ports
Active internet connections (servers and established)
Prot        Local Address      Foreign Address        Service    State
 tcp                 *:22                  *:0     SSH-Server   LISTEN
<span class="hl"> tcp                 *:23                  *:0         Telnet   LISTEN</span>
 tcp                 *:80                  *:0      HTTP CORE   LISTEN
<span class="hl"> udp                *:161                  *:0        IP SNMP   LISTEN</span></pre>
<p>Telnet passwords clear text mein bhejta hai aur HTTP server ki zaroorat nahi hai. Pehla hardening pass:</p>
<pre class="code"><span class="c">! Management sirf admin subnet se allow karo</span>
ip access-list standard MGMT-ONLY
 permit 10.1.99.0 0.0.0.255
<span class="c">! VTY lines par sirf SSH, aur sirf MGMT-ONLY se</span>
line vty 0 15
 transport input ssh
 access-class MGMT-ONLY in
<span class="c">! Jo services koi use nahi karta unhe hatao</span>
no ip h&#116;tp server
no snmp-server community public</pre>
<p>Authentication aur privacy ke saath SNMPv3, command authorisation ke saath TACACS+, authenticated NTP aur secure syslog AAA aur secure device management module mein aate hain.</p>

<h3>Wireless, cloud aur users</h3>
<p><b>Wireless</b> deewaron ke paar pahunchta hai: LAN mein plug kiye rogue access points, same SSID wale <b>evil twin</b> networks, kamzor pre-shared keys. Controls: 802.1X ke saath WPA3 ya WPA2-Enterprise, rogue AP detection (wireless IPS), alag guest networks. <b>Cloud</b> ek aisa surface jodta hai jo aap apne switches se nahi dekh sakte: public storage buckets, 0.0.0.0/0 ke liye khule security groups, code mein leak hue access keys, zaroorat se zyada powerful identities. Controls: cloud posture management, least-privilege identities, SIEM mein logging. <b>Users</b> sabse bada surface hain: phishing, dohraye gaye passwords, MFA fatigue. Controls: email security, DNS security, number matching ke saath MFA, training.</p>

<div class="eg"><p><b>Worked example.</b> Ek 300-user office apna surface list karta hai: 48 access switches jinmein lagbhag 2,000 ports (600 unused), 3 SSIDs, 4 published services wala 1 internet edge firewall, Telnet enabled wale 2 routers, 12 storage buckets wala 1 cloud account aur 450 mailboxes. Pehle hafte mein reduction: 600 unused ports ko shut karke parking VLAN mein daalo, Telnet disable karo, ek purani published FTP service retire karo, saare buckets private karo. Ek bhi naya product khareede bina surface chhota ho gaya.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Sirf internet edge ko harden karna jabki management interfaces har user VLAN se reachable hain. Unused switch ports ko data VLAN mein up chhod dena. Inventory mein cloud account aur third-party SaaS bhool jaana. Yeh maan lena ki internal ka matlab trusted hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Attack ko control se bilkul sahi match karo: MAC flooding = port security; rogue DHCP = DHCP snooping; ARP spoofing = DAI (jo snooping binding table par depend karta hai); spoofed source IP = uRPF ya IP Source Guard; rogue root bridge = root guard ya BPDU guard; clear-text management = SSH aur SNMPv3.</p></div>

<div class="scn"><h4>Meeting-room ka woh port jo scanner chala raha tha</h4><p>SOC ne har raat 01:00 baje ek meeting-room IP se internal port scans dekhe. Address meeting-room TV ke peeche ke ek live switch port ka tha, jo user VLAN mein chhoda gaya tha. Kisi ne visit ke dauraan ek chhota computer plug kar diya tha. Team ne use hataya, har unused port ko shut karke parking VLAN mein daala, printers aur TVs ke liye MAB ke saath 802.1X roll out kiya, aur port security jodi. Usi audit mein chhe branch routers par Telnet enabled mila, jinhe management ACL ke saath SSH par shift kiya gaya.</p><p><b>Seekh:</b> sabse sasti security jeet hai us surface ko hatana jiske baare mein aapko pata hi nahi tha.</p></div>

<div class="iv"><p class="q">"Attack surface kya hai, aur campus network ke liye aap use kaise kam karoge?"</p><p>Strong answer: ise har us point ke roop mein define karo jahan attacker aapke systems se interact kar sakta hai, phir layer dar layer chalo: unused switch ports shut karo aur port security, DHCP snooping aur DAI lagao; Telnet aur HTTP disable karo, management ACL ke saath SSH aur SNMPv3 use karo; sirf zaroori services DMZ aur NGFW ke through expose karo; 802.1X aur MFA enforce karo; aur inventory mein wireless aur cloud shaamil karo. Batao ki pehle reduction aata hai aur naye products baad mein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attack surface har woh point hai jise attacker chhoo sakta hai: ports, services, management, wireless, cloud aur users.</li>
<li>Pehle kam karo (jo zaroori nahi use hatao), phir jo exposed rehna chahiye uski rakhwali karo.</li>
<li>Layer 2 attacks port security, DHCP snooping, DAI, IP Source Guard aur STP guards se rukte hain.</li>
<li>Management plane SSH, SNMPv3 aur AAA hona chahiye, sirf admin subnet se reachable.</li>
<li>Zyada tar breaches exposed services ya users se shuru hote hain, isliye patching, MFA aur email security sabse zyada matter karte hain.</li>
</ul></div>
`}};export{e as default};