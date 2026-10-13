var e={id:`cia-risk`,h:{en:`CIA triad, threats, vulnerabilities, exploits and the security program`,hi:`CIA triad, threats, vulnerabilities, exploits aur security program`},body:{en:`
<p>Before you can defend anything you need words that mean exactly one thing. Security teams, auditors and the CCNA exam all use the same small vocabulary. Learn it once, precisely, and every later chapter becomes easier.</p>

<h3>The CIA triad: what we protect</h3>
<p>Every security control protects at least one of three properties of an asset:</p>
<dl class="terms">
<dt>Confidentiality</dt><dd>Only authorised people and systems can read the data. Broken by eavesdropping, stolen laptops, leaked passwords. Protected by encryption (IPsec, TLS, WPA3), access control and classification.</dd>
<dt>Integrity</dt><dd>Data is not changed without detection, in transit or at rest. Broken by a man-in-the-middle altering a payment, or malware editing a configuration. Protected by hashes, HMAC, digital signatures and change control.</dd>
<dt>Availability</dt><dd>Systems and data are reachable when needed. Broken by DoS attacks, ransomware, a cut fibre, a failed power supply. Protected by redundancy, rate limiting, DDoS scrubbing and tested backups.</dd>
</dl>
<p>Many controls help more than one leg. An IPsec tunnel with ESP gives confidentiality (encryption) and integrity (HMAC); a redundant firewall pair gives availability.</p>

<h3>The five risk words</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Threat, vulnerability, exploit and mitigation">
<rect x="10" y="70" width="110" height="60" rx="8" fill="#fed7aa"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">Threat</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">attacker, flood</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#fde68a"/><text x="205" y="96" text-anchor="middle" class="svg-ink" font-size="13">Exploit</text><text x="205" y="114" text-anchor="middle" class="svg-muted" font-size="12">the technique</text>
<rect x="290" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="350" y="96" text-anchor="middle" class="svg-ink" font-size="13">Vulnerability</text><text x="350" y="114" text-anchor="middle" class="svg-muted" font-size="12">the weakness</text>
<rect x="440" y="70" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="96" text-anchor="middle" class="svg-ink" font-size="13">Asset</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">data, device, service</text>
<line x1="120" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="290" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="150" width="200" height="40" rx="8" fill="#bae6fd"/><text x="350" y="175" text-anchor="middle" class="svg-accent" font-size="13">Mitigation closes the gap</text>
<line x1="350" y1="150" x2="350" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Risk = likelihood x impact</text>
</svg><p class="cap">A threat uses an exploit against a vulnerability to harm an asset. Mitigation removes or shrinks the weakness.</p></div>
<table class="cmp"><tr><th>Term</th><th>Meaning</th><th>Network example</th></tr>
<tr><td><b>Asset</b></td><td>Anything of value to the organisation</td><td>Customer database, core switch, the VPN service</td></tr>
<tr><td><b>Vulnerability</b></td><td>A weakness that could be used</td><td>Unpatched IOS image, Telnet enabled, default SNMP community, open wiring closet</td></tr>
<tr><td><b>Threat</b></td><td>Something or someone that could use the weakness</td><td>A criminal group, a disgruntled employee, a flood of traffic, a fire</td></tr>
<tr><td><b>Exploit</b></td><td>The actual tool or technique that uses the vulnerability</td><td>A script that abuses a known bug in the web UI</td></tr>
<tr><td><b>Mitigation</b></td><td>A control that removes or reduces the risk</td><td>Patching, SSH instead of Telnet, an ACL on the VTY lines, a locked door</td></tr></table>
<p><b>Risk</b> is the chance that a threat uses a vulnerability, multiplied by the harm it would do. You never reach zero risk; you reduce it to a level the business accepts. A vulnerability that nobody can reach (a bug in a service you disabled) is low risk; the same bug on an internet-facing device is high risk.</p>
<p>Two more terms you will hear: a <b>zero-day</b> is a vulnerability the vendor does not yet know about or has not yet patched, so no fix exists. A <b>CVE</b> (Common Vulnerabilities and Exposures) identifier is the public reference number for a known vulnerability, for example in a vendor security advisory; teams track CVEs to decide what to patch first.</p>

<h3>The security program: people, process, physical</h3>
<p>Technology alone is not a security program. The CCNA blueprint names three elements every program needs:</p>
<ul>
<li><b>User awareness.</b> Everyone in the company knows the common threats: phishing e-mails, fake calls, suspicious USB sticks, tailgaters at the door. Delivered as short campaigns, posters, simulated phishing e-mails, and a clear "report it" button.</li>
<li><b>User training.</b> People with a specific role get formal, deeper instruction: the help desk learns how to verify a caller before resetting a password; network engineers learn secure configuration standards; developers learn secure coding. Training is role-based and usually tracked for compliance.</li>
<li><b>Physical access control.</b> Badges, locked wiring closets and data halls, cameras, visitor logs, mantraps, locked racks. Anyone with physical access to a router's console port can run password recovery, so physical security protects every software control above it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> An audit of a 3-floor office finds: (1) the access switches run an IOS release with a published vulnerability in the web server, and <code>ip h&#116;tp server</code> is enabled; (2) the second-floor wiring closet is propped open for cooling. Classify: the IOS bug and the open closet are <b>vulnerabilities</b>; an outside attacker or a visitor is the <b>threat</b>; a public proof-of-concept script is the <b>exploit</b>; the <b>mitigations</b> are upgrading IOS, disabling the unused web server, restricting management with an ACL, and fixing the cooling so the door can stay locked with badge access.</p></div>

<h3>Mitigation techniques in the network</h3>
<p>You will meet these mitigations throughout the module: patching and hardening (disable unused services), strong authentication (MFA, AAA), least privilege (give each user and device only what it needs), segmentation (VLANs, ACLs, firewalls, zero trust), encryption (VPNs, SSH, WPA3), monitoring and logging (syslog, IPS, NetFlow), and backups plus redundancy for availability.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Calling an unpatched server a "threat": it is a vulnerability. (2) Calling the attacker an "exploit": the attacker is the threat actor, the exploit is the technique. (3) Forgetting integrity: encryption without integrity checking lets an attacker flip bits in ciphertext unnoticed, which is why ESP and WPA2 include a message integrity check.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which term describes a weakness in a system?" = vulnerability. "Which term describes the technique that takes advantage of it?" = exploit. "Which CIA property does a DDoS attack affect?" = availability. "Which security program element is a badge reader on the server room?" = physical access control. Awareness is for everyone; training is role-specific and formal.</p></div>

<div class="scn"><h4>The forgotten SNMP community</h4><p>A hospital group's network audit found that 40 branch switches still had <code>snmp-server community public RW</code> from the original installation. Nobody had used it for years. The auditor rated it high risk: any device on the user VLAN could change the switch configuration with a free SNMP tool. The network team removed the RW community, moved monitoring to SNMPv3 with authentication and privacy, and added an ACL so only the monitoring server could query the switches. They also added the check to their build standard and to the new-engineer training.</p><p><b>Lesson:</b> a vulnerability does not need an attacker yet to be a problem. Find it, rate the risk, mitigate it, and fix the process that created it.</p></div>

<div class="iv"><p class="q">"Explain the difference between a threat, a vulnerability and an exploit, with an example."</p><p>Strong answer: a vulnerability is the weakness, for example Telnet enabled on a router so passwords cross the network in clear text. The threat is who or what could use it, for example an insider with a packet capture tool. The exploit is the actual technique, capturing the Telnet session and reading the password. The mitigation is SSH only, an ACL on the VTY lines and AAA. Then tie it to CIA: this attack breaks confidentiality first, and integrity once the attacker changes the configuration.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CIA: confidentiality (who can read), integrity (not changed unnoticed), availability (reachable when needed).</li>
<li>Vulnerability = weakness; threat = who or what could use it; exploit = the technique; mitigation = the control.</li>
<li>Risk = likelihood x impact; you reduce it to an accepted level, never to zero.</li>
<li>A zero-day has no patch yet; CVE numbers identify known vulnerabilities.</li>
<li>Security program elements: user awareness (everyone), training (role-based), physical access control (badges, locks, cameras).</li>
</ul></div>
`,hi:`
<p>Kuch bhi defend karne se pehle aapko aise shabd chahiye jinka matlab bilkul ek hi ho. Security teams, auditors aur CCNA exam sab ek hi chhoti si vocabulary use karte hain. Ise ek baar, sahi tarah seekh lo, aur aage ka har chapter aasaan ho jaayega.</p>

<h3>CIA triad: hum kya protect karte hain</h3>
<p>Har security control asset ki teen properties mein se kam se kam ek ko protect karta hai:</p>
<dl class="terms">
<dt>Confidentiality</dt><dd>Data sirf authorised log aur systems padh sakein. Eavesdropping, chori hue laptops, leak hue passwords se tootti hai. Encryption (IPsec, TLS, WPA3), access control aur classification se protect hoti hai.</dd>
<dt>Integrity</dt><dd>Data transit ya storage mein bina pakde badla na ja sake. Man-in-the-middle ke payment badal dene se, ya malware ke configuration edit karne se tootti hai. Hashes, HMAC, digital signatures aur change control se protect hoti hai.</dd>
<dt>Availability</dt><dd>Zaroorat par systems aur data milte rahein. DoS attacks, ransomware, kati hui fibre, fail hua power supply isse todte hain. Redundancy, rate limiting, DDoS scrubbing aur tested backups se protect hoti hai.</dd>
</dl>
<p>Kai controls ek se zyada pair ki madad karte hain. ESP wala IPsec tunnel confidentiality (encryption) aur integrity (HMAC) dono deta hai; redundant firewall pair availability deta hai.</p>

<h3>Risk ke paanch shabd</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Threat, vulnerability, exploit aur mitigation">
<rect x="10" y="70" width="110" height="60" rx="8" fill="#fed7aa"/><text x="65" y="96" text-anchor="middle" class="svg-ink" font-size="13">Threat</text><text x="65" y="114" text-anchor="middle" class="svg-muted" font-size="12">attacker, flood</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#fde68a"/><text x="205" y="96" text-anchor="middle" class="svg-ink" font-size="13">Exploit</text><text x="205" y="114" text-anchor="middle" class="svg-muted" font-size="12">technique</text>
<rect x="290" y="70" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="350" y="96" text-anchor="middle" class="svg-ink" font-size="13">Vulnerability</text><text x="350" y="114" text-anchor="middle" class="svg-muted" font-size="12">kamzori</text>
<rect x="440" y="70" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="96" text-anchor="middle" class="svg-ink" font-size="13">Asset</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">data, device, service</text>
<line x1="120" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="290" y2="100" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="250" y="150" width="200" height="40" rx="8" fill="#bae6fd"/><text x="350" y="175" text-anchor="middle" class="svg-accent" font-size="13">Mitigation gap band karta hai</text>
<line x1="350" y1="150" x2="350" y2="130" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Risk = likelihood x impact</text>
</svg><p class="cap">Threat ek exploit ko vulnerability ke khilaf use karke asset ko nuksaan pahunchata hai. Mitigation kamzori hatata ya chhoti karta hai.</p></div>
<table class="cmp"><tr><th>Term</th><th>Matlab</th><th>Network example</th></tr>
<tr><td><b>Asset</b></td><td>Organisation ke liye koi bhi keemti cheez</td><td>Customer database, core switch, VPN service</td></tr>
<tr><td><b>Vulnerability</b></td><td>Ek kamzori jo use ho sakti hai</td><td>Unpatched IOS image, Telnet enabled, default SNMP community, khula wiring closet</td></tr>
<tr><td><b>Threat</b></td><td>Koi cheez ya koi insaan jo kamzori ka use kar sake</td><td>Criminal group, naraaz employee, traffic ka flood, aag</td></tr>
<tr><td><b>Exploit</b></td><td>Asli tool ya technique jo vulnerability use karti hai</td><td>Web UI ke known bug ka fayda uthane wali script</td></tr>
<tr><td><b>Mitigation</b></td><td>Control jo risk hatata ya kam karta hai</td><td>Patching, Telnet ki jagah SSH, VTY lines par ACL, band darwaza</td></tr></table>
<p><b>Risk</b> woh chance hai ki threat vulnerability ko use kare, us nuksaan se multiply karke jo woh karega. Aap kabhi zero risk tak nahi pahunchte; aap use us level tak kam karte ho jo business accept kare. Aisi vulnerability jis tak koi pahunch hi na sake (disabled service ka bug) low risk hai; wahi bug internet-facing device par high risk hai.</p>
<p>Do aur terms jo aap sunoge: <b>zero-day</b> woh vulnerability hai jiske baare mein vendor ko abhi pata nahi ya jiska patch abhi nahi aaya, isliye koi fix nahi hai. <b>CVE</b> (Common Vulnerabilities and Exposures) identifier kisi known vulnerability ka public reference number hai, jaise vendor security advisory mein; teams CVEs track karti hain taaki decide kar sakein pehle kya patch karna hai.</p>

<h3>Security program: log, process, physical</h3>
<p>Sirf technology security program nahi hai. CCNA blueprint teen elements ka naam leta hai jo har program ko chahiye:</p>
<ul>
<li><b>User awareness.</b> Company mein sabko common threats pata hon: phishing e-mails, nakli calls, shaky USB sticks, darwaze par tailgaters. Chhote campaigns, posters, simulated phishing e-mails aur ek saaf "report karo" button ke through diya jaata hai.</li>
<li><b>User training.</b> Jinka specific role hai unhe formal, gehri instruction milti hai: help desk seekhta hai ki password reset karne se pehle caller ko kaise verify kare; network engineers secure configuration standards seekhte hain; developers secure coding seekhte hain. Training role-based hoti hai aur aam taur par compliance ke liye track hoti hai.</li>
<li><b>Physical access control.</b> Badges, band wiring closets aur data halls, cameras, visitor logs, mantraps, locked racks. Jiske paas router ke console port ka physical access hai woh password recovery chala sakta hai, isliye physical security upar ke har software control ko protect karti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 3-floor office ke audit mein milta hai: (1) access switches aise IOS release par chal rahe hain jiske web server mein published vulnerability hai, aur <code>ip h&#116;tp server</code> enabled hai; (2) doosri manzil ka wiring closet cooling ke liye khula rakha gaya hai. Classify karo: IOS bug aur khula closet <b>vulnerabilities</b> hain; bahar ka attacker ya visitor <b>threat</b> hai; public proof-of-concept script <b>exploit</b> hai; <b>mitigations</b> hain IOS upgrade karna, unused web server disable karna, ACL se management restrict karna, aur cooling theek karna taaki darwaza badge access ke saath band reh sake.</p></div>

<h3>Network mein mitigation techniques</h3>
<p>Yeh mitigations aapko poore module mein milenge: patching aur hardening (unused services disable karo), strong authentication (MFA, AAA), least privilege (har user aur device ko sirf utna do jitna chahiye), segmentation (VLANs, ACLs, firewalls, zero trust), encryption (VPNs, SSH, WPA3), monitoring aur logging (syslog, IPS, NetFlow), aur availability ke liye backups plus redundancy.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Unpatched server ko "threat" kehna: woh vulnerability hai. (2) Attacker ko "exploit" kehna: attacker threat actor hai, exploit technique hai. (3) Integrity bhool jaana: bina integrity check ke encryption attacker ko ciphertext mein bits palatne deta hai bina pakde, isiliye ESP aur WPA2 mein message integrity check hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "System ki kamzori ko kaunsa term describe karta hai?" = vulnerability. "Uska fayda uthane wali technique ko kaunsa term describe karta hai?" = exploit. "DDoS attack CIA ki kaunsi property ko affect karta hai?" = availability. "Server room par badge reader kaunsa security program element hai?" = physical access control. Awareness sabke liye hai; training role-specific aur formal hai.</p></div>

<div class="scn"><h4>Bhooli hui SNMP community</h4><p>Ek hospital group ke network audit mein mila ki 40 branch switches par original installation se abhi bhi <code>snmp-server community public RW</code> tha. Saalon se kisi ne use nahi kiya tha. Auditor ne ise high risk rate kiya: user VLAN ka koi bhi device free SNMP tool se switch configuration badal sakta tha. Network team ne RW community hatayi, monitoring ko authentication aur privacy wale SNMPv3 par shift kiya, aur ACL lagayi taaki sirf monitoring server switches ko query kar sake. Unhone yeh check apne build standard aur naye engineers ki training mein bhi jod diya.</p><p><b>Seekh:</b> vulnerability ko problem banne ke liye abhi attacker ki zaroorat nahi. Use dhoondho, risk rate karo, mitigate karo, aur us process ko theek karo jisne use banaya.</p></div>

<div class="iv"><p class="q">"Threat, vulnerability aur exploit mein farak example ke saath samjhao."</p><p>Strong answer: vulnerability kamzori hai, jaise router par Telnet enabled hona jisse passwords network par clear text mein jaate hain. Threat woh hai jo ise use kar sake, jaise packet capture tool wala insider. Exploit asli technique hai, Telnet session capture karke password padhna. Mitigation hai sirf SSH, VTY lines par ACL aur AAA. Phir ise CIA se jodo: yeh attack pehle confidentiality todta hai, aur jab attacker configuration badalta hai to integrity bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CIA: confidentiality (kaun padh sakta hai), integrity (bina pakde badla na jaaye), availability (zaroorat par mile).</li>
<li>Vulnerability = kamzori; threat = kaun ya kya use kar sakta hai; exploit = technique; mitigation = control.</li>
<li>Risk = likelihood x impact; aap ise accepted level tak kam karte ho, zero tak kabhi nahi.</li>
<li>Zero-day ka abhi koi patch nahi; CVE numbers known vulnerabilities ko identify karte hain.</li>
<li>Security program elements: user awareness (sabke liye), training (role-based), physical access control (badges, taale, cameras).</li>
</ul></div>
`}};export{e as default};