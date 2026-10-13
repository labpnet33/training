var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a bank branch: a vault, guards, rules, cameras and separate zones. You have now built every one of those layers on a real network. Use this chapter as your last revision before the exam and before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="10" fill="#bbf7d0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.1 Concepts</text><text x="110" y="50" text-anchor="middle" class="svg-muted" font-size="12">CIA, crypto, IAM, compliance</text>
<rect x="220" y="10" width="200" height="50" rx="10" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.2 Attacks</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">DoS, L2, DNS, people</text>
<rect x="430" y="10" width="200" height="50" rx="10" fill="#bae6fd"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.3 Defences</text><text x="530" y="50" text-anchor="middle" class="svg-muted" font-size="12">hardening, NAC, ACLs, zones</text>
<rect x="115" y="100" width="410" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3.5 Access and management</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">VPNs, SSH/GUI/API/console, jump host, in-band vs OOB</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Labs: secure management access, port security</text>
</svg><p class="cap">Everything in this module maps to N10-009 objectives 4.1, 4.2, 4.3 and 3.5.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the CIA triad with one control per corner, and define threat, vulnerability, exploit and risk.</li>
<li>Compare encryption in transit and at rest, symmetric and asymmetric, and explain PKI, certificates and key management.</li>
<li>Explain AAA, MFA factor categories, TOTP, SSO, SAML, LDAP, RADIUS and TACACS+, least privilege, RBAC and geofencing.</li>
<li>Recognise DoS/DDoS, VLAN hopping, MAC flooding, ARP and DNS poisoning, rogue DHCP and APs, evil twin, on-path, phishing, dumpster diving, shoulder surfing, tailgating and malware, and name a defence for each.</li>
<li>Describe cameras, locks, honeypots and honeynets, audits, PCI DSS, GDPR and data locality.</li>
<li>Choose between site-to-site and client-to-site VPN, clientful and clientless, split and full tunnel; explain SSH, GUI, API, console, jump hosts, in-band and out-of-band.</li>
<li>Harden a router: SSH only, local account, VTY ACL (Lab 1).</li>
<li>Write, place, apply and verify standard and extended named ACLs; explain URL and content filtering.</li>
<li>Design trusted, untrusted and screened-subnet zones and segment IoT, OT, guest and BYOD.</li>
<li>Configure and recover port security (Lab 2); explain 802.1X and MAC filtering.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACL</dt><dd>Ordered permit/deny list, top-down, first match, implicit deny.</dd>
<dt>Screened subnet</dt><dd>Zone for public-facing servers between the internet and the trusted LAN (formerly DMZ).</dd>
<dt>Jump box</dt><dd>Hardened host that admins pass through to manage devices.</dd>
<dt>Out-of-band</dt><dd>Management over a separate network or console path that survives production outages.</dd>
<dt>Sticky MAC</dt><dd>Dynamically learned secure MAC written into the running configuration.</dd>
<dt>err-disabled</dt><dd>Port state after a shutdown-mode violation; recover with shutdown / no shutdown after fixing the cause.</dd>
<dt>802.1X</dt><dd>Port-based authentication: supplicant, authenticator, RADIUS authentication server.</dd>
<dt>Honeypot / honeynet</dt><dd>Decoy system / decoy network whose only purpose is to attract and detect attackers.</dd>
<dt>Evil twin</dt><dd>Rogue AP broadcasting a legitimate SSID.</dd>
<dt>On-path attack</dt><dd>Attacker positioned between two parties (formerly man-in-the-middle).</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Item</th><th>Fact</th></tr>
<tr><td>SSH / Telnet</td><td>TCP 22 encrypted / TCP 23 clear text</td></tr>
<tr><td>RADIUS</td><td>UDP 1812 auth, 1813 accounting; network access; encrypts password only</td></tr>
<tr><td>TACACS+</td><td>TCP 49; device admin; encrypts whole payload; separates AAA</td></tr>
<tr><td>LDAP / LDAPS</td><td>389 / 636</td></tr>
<tr><td>HTTPS</td><td>TCP 443; GUI and API management</td></tr>
<tr><td>Standard ACL</td><td>Source only; 1 to 99, 1300 to 1999; place near destination</td></tr>
<tr><td>Extended ACL</td><td>Source, destination, protocol, port; 100 to 199, 2000 to 2699; place near source</td></tr>
<tr><td>Port security default</td><td>Maximum 1, violation shutdown</td></tr>
<tr><td>MFA</td><td>Two or more different factor categories</td></tr>
<tr><td>GDPR breach notice</td><td>To the authority within 72 hours where required</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Lab 1: secure management</span>
hostname EDGE
ip domain name nwk.lab
crypto key generate rsa modulus 2048
username admin privilege 15 secret Adm1n!2026
access-list 10 permit 10.0.99.0 0.0.0.255
line vty 0 4
 login local
 transport input ssh
 access-class 10 in
<span class="c">! Lab 2: port security</span>
interface GigabitEthernet0/1
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
<span class="c">! Verify</span>
show ip ssh
show access-lists
show ip interface GigabitEthernet0/1
show port-security interface GigabitEthernet0/1
show interfaces status err-disabled</pre>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Subnet mask instead of wildcard. <code>ip access-group</code> on VTY lines (it is <code>access-class</code>). Bouncing an err-disabled port before removing the rogue device. Calling a password plus PIN "MFA". Thinking a VLAN alone is segmentation without an ACL or firewall.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Screened subnet = DMZ. Clientless VPN = browser. Split tunnel = only corporate traffic in the tunnel. Tailgating = without consent. DDoS = many sources. Console = out-of-band. RADIUS for network access, TACACS+ for device admin.</p></div>

<div class="scn"><h4>The whole module in one project</h4><p>A new branch office opens. The engineer racks the gear in a locked cabinet with a camera, puts users, guests, IoT cameras and POS terminals in separate VLANs with ACLs, places the booking web server in the screened subnet, locks reception ports with port security and staff ports with 802.1X, allows SSH only from the jump host with TACACS+ and a local fallback account, adds a console server with cellular backup, builds a site-to-site IPsec VPN to head office and gives travelling staff a full-tunnel client VPN. The auditor's checklist passes on the first visit.</p><p><b>Lesson:</b> security is a set of simple layers applied consistently, and each one maps to a chapter you have finished.</p></div>

<div class="iv"><p class="q">"If you had one day to improve the security of a small network, what would you do first?"</p><p>Prioritise by risk: change default passwords and move management to SSH with a VTY ACL and local or central AAA; shut unused ports and enable port security; separate guest and IoT traffic with VLANs and ACLs; make sure configs are backed up and logs go to a syslog server. Explain that you chose these because they remove the easiest exploits with the least disruption, and list 802.1X, OOB and segmentation reviews as next steps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 = concepts, attacks, defences; objective 3.5 = VPNs and management methods.</li>
<li>Lab 1 skills: SSH, local users, <code>transport input ssh</code>, VTY access-class.</li>
<li>Lab 2 skills: port security, sticky MACs, err-disabled recovery.</li>
<li>ACLs: top-down, first match, implicit deny, correct wildcard, correct placement and direction.</li>
<li>Next module, np-troubleshoot, will reuse these checks whenever a ticket turns out to be a security control.</li>
</ul></div>
`,hi:`
<p>Aapne ek bank branch se shuru kiya tha: vault, guards, rules, cameras aur alag zones. Ab aap ek real network par un sab layers ko bana chuke ho. Is chapter ko exam aur interview se pehle apni aakhri revision ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="10" width="200" height="50" rx="10" fill="#bbf7d0"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.1 Concepts</text><text x="110" y="50" text-anchor="middle" class="svg-muted" font-size="12">CIA, crypto, IAM, compliance</text>
<rect x="220" y="10" width="200" height="50" rx="10" fill="#fed7aa"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.2 Attacks</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">DoS, L2, DNS, log</text>
<rect x="430" y="10" width="200" height="50" rx="10" fill="#bae6fd"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">4.3 Defences</text><text x="530" y="50" text-anchor="middle" class="svg-muted" font-size="12">hardening, NAC, ACLs, zones</text>
<rect x="115" y="100" width="410" height="50" rx="10" fill="#ddd6fe"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="13">3.5 Access aur management</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">VPNs, SSH/GUI/API/console, jump host, in-band vs OOB</text>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Labs: secure management access, port security</text>
</svg><p class="cap">Is module ki har cheez N10-009 objectives 4.1, 4.2, 4.3 aur 3.5 se map hoti hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>CIA triad ko har kone ke ek control ke saath samjhao, aur threat, vulnerability, exploit aur risk define karo.</li>
<li>Encryption in transit aur at rest, symmetric aur asymmetric compare karo, aur PKI, certificates aur key management samjhao.</li>
<li>AAA, MFA factor categories, TOTP, SSO, SAML, LDAP, RADIUS aur TACACS+, least privilege, RBAC aur geofencing samjhao.</li>
<li>DoS/DDoS, VLAN hopping, MAC flooding, ARP aur DNS poisoning, rogue DHCP aur APs, evil twin, on-path, phishing, dumpster diving, shoulder surfing, tailgating aur malware pehchaano, aur har ek ka defence batao.</li>
<li>Cameras, locks, honeypots aur honeynets, audits, PCI DSS, GDPR aur data locality describe karo.</li>
<li>Site-to-site aur client-to-site VPN, clientful aur clientless, split aur full tunnel mein chuno; SSH, GUI, API, console, jump hosts, in-band aur out-of-band samjhao.</li>
<li>Router harden karo: sirf SSH, local account, VTY ACL (Lab 1).</li>
<li>Standard aur extended named ACLs likho, place karo, apply karo aur verify karo; URL aur content filtering samjhao.</li>
<li>Trusted, untrusted aur screened-subnet zones design karo aur IoT, OT, guest aur BYOD ko segment karo.</li>
<li>Port security configure aur recover karo (Lab 2); 802.1X aur MAC filtering samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ACL</dt><dd>Ordered permit/deny list, top-down, first match, implicit deny.</dd>
<dt>Screened subnet</dt><dd>Internet aur trusted LAN ke beech public-facing servers ka zone (pehle DMZ).</dd>
<dt>Jump box</dt><dd>Hardened host jiske through admins devices manage karne jaate hain.</dd>
<dt>Out-of-band</dt><dd>Alag network ya console path par management jo production outages mein bhi bachta hai.</dd>
<dt>Sticky MAC</dt><dd>Dynamically seekha gaya secure MAC jo running configuration mein likha jaata hai.</dd>
<dt>err-disabled</dt><dd>Shutdown-mode violation ke baad port ki state; wajah theek karke shutdown / no shutdown se recover karo.</dd>
<dt>802.1X</dt><dd>Port-based authentication: supplicant, authenticator, RADIUS authentication server.</dd>
<dt>Honeypot / honeynet</dt><dd>Decoy system / decoy network jiska sirf ek kaam attackers ko kheenchna aur pakadna hai.</dd>
<dt>Evil twin</dt><dd>Legitimate SSID broadcast karne wala rogue AP.</dd>
<dt>On-path attack</dt><dd>Do parties ke beech baitha attacker (pehle man-in-the-middle).</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Item</th><th>Fact</th></tr>
<tr><td>SSH / Telnet</td><td>TCP 22 encrypted / TCP 23 clear text</td></tr>
<tr><td>RADIUS</td><td>UDP 1812 auth, 1813 accounting; network access; sirf password encrypt</td></tr>
<tr><td>TACACS+</td><td>TCP 49; device admin; poora payload encrypt; AAA alag</td></tr>
<tr><td>LDAP / LDAPS</td><td>389 / 636</td></tr>
<tr><td>HTTPS</td><td>TCP 443; GUI aur API management</td></tr>
<tr><td>Standard ACL</td><td>Sirf source; 1 se 99, 1300 se 1999; destination ke paas</td></tr>
<tr><td>Extended ACL</td><td>Source, destination, protocol, port; 100 se 199, 2000 se 2699; source ke paas</td></tr>
<tr><td>Port security default</td><td>Maximum 1, violation shutdown</td></tr>
<tr><td>MFA</td><td>Do ya zyada alag factor categories</td></tr>
<tr><td>GDPR breach notice</td><td>Zaroorat hone par authority ko 72 ghante ke andar</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Lab 1: secure management</span>
hostname EDGE
ip domain name nwk.lab
crypto key generate rsa modulus 2048
username admin privilege 15 secret Adm1n!2026
access-list 10 permit 10.0.99.0 0.0.0.255
line vty 0 4
 login local
 transport input ssh
 access-class 10 in
<span class="c">! Lab 2: port security</span>
interface GigabitEthernet0/1
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation shutdown
<span class="c">! Verify</span>
show ip ssh
show access-lists
show ip interface GigabitEthernet0/1
show port-security interface GigabitEthernet0/1
show interfaces status err-disabled</pre>

<div class="warn"><p><b>Aakhri waqt ki galtiyon se bacho.</b> Wildcard ki jagah subnet mask. VTY lines par <code>ip access-group</code> (sahi hai <code>access-class</code>). Rogue device hataane se pehle err-disabled port bounce karna. Password plus PIN ko "MFA" kehna. ACL ya firewall ke bina sirf VLAN ko segmentation samajhna.</p></div>

<div class="exam"><p><b>Exam trap round-up.</b> Screened subnet = DMZ. Clientless VPN = browser. Split tunnel = tunnel mein sirf corporate traffic. Tailgating = bina marzi. DDoS = bahut saare sources. Console = out-of-band. Network access ke liye RADIUS, device admin ke liye TACACS+.</p></div>

<div class="scn"><h4>Poora module ek project mein</h4><p>Ek nayi branch office khulti hai. Engineer gear ko camera wale locked cabinet mein rack karta hai, users, guests, IoT cameras aur POS terminals ko ACLs ke saath alag VLANs mein daalta hai, booking web server ko screened subnet mein rakhta hai, reception ports ko port security se aur staff ports ko 802.1X se lock karta hai, TACACS+ aur local fallback account ke saath sirf jump host se SSH allow karta hai, cellular backup wala console server jodta hai, head office tak site-to-site IPsec VPN banata hai aur travel karne wale staff ko full-tunnel client VPN deta hai. Auditor ki checklist pehli visit mein pass hoti hai.</p><p><b>Seekh:</b> security simple layers ka set hai jo consistently lagaya jaata hai, aur har layer ek chapter se map hoti hai jo aap khatam kar chuke ho.</p></div>

<div class="iv"><p class="q">"Agar aapke paas chhote network ki security sudharne ke liye ek din ho, to aap sabse pehle kya karoge?"</p><p>Risk ke hisaab se priority do: default passwords badlo aur management ko VTY ACL aur local ya central AAA ke saath SSH par le jao; unused ports shut karo aur port security enable karo; guest aur IoT traffic ko VLANs aur ACLs se alag karo; pakka karo ki configs backup hote hain aur logs syslog server par jaate hain. Samjhao ki aapne inhe isliye chuna kyunki yeh sabse kam disruption mein sabse aasaan exploits hata dete hain, aur agle steps ke roop mein 802.1X, OOB aur segmentation reviews list karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Domain 4.0 = concepts, attacks, defences; objective 3.5 = VPNs aur management methods.</li>
<li>Lab 1 skills: SSH, local users, <code>transport input ssh</code>, VTY access-class.</li>
<li>Lab 2 skills: port security, sticky MACs, err-disabled recovery.</li>
<li>ACLs: top-down, first match, implicit deny, sahi wildcard, sahi placement aur direction.</li>
<li>Agla module, np-troubleshoot, in checks ko tab dobara use karega jab koi ticket security control nikle.</li>
</ul></div>
`}};export{e as default};