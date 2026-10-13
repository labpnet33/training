var e={id:`big-picture`,h:{en:`The big picture: CIA, risk and defence in depth`,hi:`Big picture: CIA, risk aur defence in depth`},body:{en:`
<p><b>What you will learn in this module.</b> This is the only security module of the CompTIA Network+ (N10-009) track, so it covers the whole of domain 4.0 Network Security plus objective 3.5 (access and management methods). By the end you will be able to explain the CIA triad and risk vocabulary, describe encryption, PKI and identity (MFA, SSO, RADIUS, TACACS+, LDAP, SAML), recognise every attack on the blueprint and name its defence, choose between VPN types and management methods, harden a router so it accepts SSH only from the admin subnet, write and place standard and extended ACLs, design security zones and segments, and lock access ports with port security, 802.1X or MAC filtering. You will also walk through both labs: <b>Secure management access</b> and <b>Stop rogue devices with port security</b>.</p>
<p><b>Prerequisites.</b> You should be comfortable with the OSI model and common ports (np-concepts), IPv4 subnetting (np-addressing), VLANs and trunks (np-switching), routing (np-routing), DHCP and DNS (np-services) and SNMP/syslog (np-monitoring). We refer back to those modules instead of re-teaching them. The next module, np-troubleshoot, reuses what you learn here when a ticket turns out to be a security control doing its job.</p>

<h3>Start with an analogy: a bank branch</h3>
<p>Think of a bank branch. The <b>vault</b> keeps money unreadable to outsiders even if they get into the building (encryption at rest). The armoured van moves cash between branches in a locked box (encryption in transit). The guard checks your ID (authentication) and the rules decide which locker you may open (authorization). Cameras record who did what (accounting and physical security). The lobby, the teller area and the vault are separate zones with different doors (segmentation). No single measure protects the bank; the layers together do. Network security works the same way, and the habit of stacking independent layers is called <b>defence in depth</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CIA triad">
<polygon points="320,20 120,200 520,200" fill="#bae6fd" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="14">Your data and services</text>
<rect x="250" y="4" width="140" height="28" rx="8" fill="#bbf7d0"/><text x="320" y="23" text-anchor="middle" class="svg-ink" font-size="13">Confidentiality</text>
<rect x="40" y="196" width="150" height="28" rx="8" fill="#fde68a"/><text x="115" y="215" text-anchor="middle" class="svg-ink" font-size="13">Integrity</text>
<rect x="450" y="196" width="150" height="28" rx="8" fill="#fed7aa"/><text x="525" y="215" text-anchor="middle" class="svg-ink" font-size="13">Availability</text>
<text x="175" y="100" text-anchor="middle" class="svg-muted" font-size="12">encryption, ACLs</text>
<text x="470" y="100" text-anchor="middle" class="svg-muted" font-size="12">redundancy, anti-DoS</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">hashing, signatures</text>
</svg><p class="cap">The CIA triad: every control you configure protects at least one corner.</p></div>

<h3>The CIA triad</h3>
<dl class="terms">
<dt>Confidentiality</dt><dd>Only authorised people can read the data. Tools: encryption (SSH instead of Telnet, HTTPS, IPsec), ACLs, authentication, least privilege.</dd>
<dt>Integrity</dt><dd>Data is not changed without detection, in transit or at rest. Tools: hashing (SHA-256), digital signatures, message authentication in TLS and IPsec, change control on configurations.</dd>
<dt>Availability</dt><dd>Services are reachable when needed. Tools: redundancy, backups, DoS protection, port security that stops a MAC-flooding attack from crippling a switch.</dd>
</dl>
<p>Some controls touch more than one corner. SSH gives confidentiality (the password is encrypted) and integrity (tampered packets are rejected). A port-security shutdown protects confidentiality (a rogue laptop cannot sniff) but hurts availability for that one port, which is a deliberate trade-off.</p>

<h3>Risk vocabulary the exam loves</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th><th>Example</th></tr>
<tr><td><b>Vulnerability</b></td><td>A weakness in a system, process or person</td><td>Router accepts Telnet with the password cisco</td></tr>
<tr><td><b>Threat</b></td><td>Anything that could exploit a weakness and cause harm (an actor or event)</td><td>An insider on the user VLAN, a flood, a botnet</td></tr>
<tr><td><b>Exploit</b></td><td>The actual technique or code that takes advantage of the vulnerability</td><td>Sniffing the Telnet session and replaying the password</td></tr>
<tr><td><b>Risk</b></td><td>The likelihood that a threat exploits a vulnerability, multiplied by the impact</td><td>High: easy to do and gives full control of the edge router</td></tr>
</table>
<p>You reduce risk by removing vulnerabilities (patch, disable Telnet), reducing exposure to threats (restrict management to one subnet) or reducing impact (backups, segmentation). The risk that remains after controls is called <b>residual risk</b>, and management formally accepts it.</p>

<div class="eg"><p><b>Worked example.</b> An auditor scores risk from 1 to 5 for likelihood and impact. The edge router EDGE accepts Telnet from any network: likelihood 4 (any user can try), impact 5 (full control of the internet edge), risk 20 of 25, red. After the lab fix (SSH only, local account, VTY ACL allowing 10.0.99.0/24), likelihood drops to 1 because only the admin subnet can even open a session, and the password is no longer sent in clear text. Risk becomes 5 of 25, green. The vulnerability did not vanish completely; the exposure shrank.</p></div>

<h3>Defence in depth in a real network</h3>
<p>A typical small office stacks these layers, and this module walks through each one: locked comms room and cameras (physical), port security and 802.1X on access ports (network access control), VLANs and ACLs between segments (segmentation), a firewall with trusted, untrusted and screened-subnet zones (perimeter), SSH, SNMPv3 and AAA on devices (management plane), and encryption plus backups for the data itself.</p>

<div class="warn"><p><b>Common mistake.</b> Treating one strong control as enough. A firewall at the edge does nothing against an insider who plugs a laptop into a reception port, and strong passwords do nothing if the protocol sends them in clear text. Think in layers, and ask which corner of CIA each layer protects.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read the noun carefully. "A weakness" is a vulnerability; "the code or method used against it" is an exploit; "a potential danger" is a threat; "likelihood times impact" is risk. Questions often give all four as options.</p></div>

<div class="scn"><h4>The audit finding that started it all</h4><p>A yearly audit at a logistics company found that the internet edge router accepted Telnet from every internal subnet with a shared password. A packet capture on the user VLAN showed the password in clear text. The engineer rated it high risk, then fixed it in one change window: SSH with a local admin account, Telnet disabled, and a VTY access list that allows only the admin network. The re-test showed SSH working from the admin PC and refused from the user PC.</p><p><b>Lesson:</b> this is exactly Lab 1 of this module. Security work is usually "find the weakness, reduce the exposure, prove it with a test".</p></div>

<div class="iv"><p class="q">"Explain the CIA triad using examples from a network you have worked on."</p><p>Give one concrete control per corner: SSH and HTTPS for confidentiality, hashing and signed images for integrity, redundant links and DoS protection for availability. Then show maturity by naming a trade-off, such as port-security shutdown mode improving confidentiality while reducing availability of that port. Finish with defence in depth.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CIA = confidentiality, integrity, availability; every control protects at least one.</li>
<li>Vulnerability is the weakness, threat is the danger, exploit is the method, risk is likelihood times impact.</li>
<li>Controls remove vulnerabilities, reduce exposure or reduce impact; what remains is residual risk.</li>
<li>Defence in depth stacks independent layers: physical, access, segmentation, perimeter, management, data.</li>
<li>This module covers all of N10-009 domain 4.0 plus access and management methods (3.5).</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> CompTIA Network+ (N10-009) track ka yeh akela security module hai, isliye yeh poora domain 4.0 Network Security aur objective 3.5 (access aur management methods) cover karta hai. End tak aap CIA triad aur risk vocabulary samjha paoge, encryption, PKI aur identity (MFA, SSO, RADIUS, TACACS+, LDAP, SAML) describe kar paoge, blueprint ka har attack pehchaan kar uska defence bata paoge, VPN types aur management methods mein se sahi choose kar paoge, router ko aise harden kar paoge ki woh sirf admin subnet se SSH accept kare, standard aur extended ACLs likh kar sahi jagah laga paoge, security zones aur segments design kar paoge, aur access ports ko port security, 802.1X ya MAC filtering se lock kar paoge. Aap dono labs bhi step by step karoge: <b>Secure management access</b> aur <b>Stop rogue devices with port security</b>.</p>
<p><b>Prerequisites.</b> Aapko OSI model aur common ports (np-concepts), IPv4 subnetting (np-addressing), VLANs aur trunks (np-switching), routing (np-routing), DHCP aur DNS (np-services) aur SNMP/syslog (np-monitoring) aana chahiye. Hum un modules ko dobara padhane ki jagah unka reference denge. Agla module, np-troubleshoot, yahan seekhi cheezon ko tab use karta hai jab koi ticket actually ek security control ka apna kaam karna nikalta hai.</p>

<h3>Ek analogy se shuru karo: bank ki branch</h3>
<p>Ek bank branch ke baare mein socho. <b>Vault</b> paise ko bahar walon ke liye unreadable rakhta hai, chahe woh building mein ghus bhi jaayein (encryption at rest). Armoured van branches ke beech cash ko locked box mein le jaati hai (encryption in transit). Guard aapki ID check karta hai (authentication) aur rules tay karte hain ki aap kaunsa locker khol sakte ho (authorization). Cameras record karte hain ki kisne kya kiya (accounting aur physical security). Lobby, teller area aur vault alag zones hain jinke alag darwaze hain (segmentation). Koi ek measure bank ko nahi bachata; saari layers milkar bachati hain. Network security bhi aise hi kaam karti hai, aur independent layers ek ke upar ek lagane ki is aadat ko <b>defence in depth</b> kehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CIA triad">
<polygon points="320,20 120,200 520,200" fill="#bae6fd" stroke="#64748b"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="14">Aapka data aur services</text>
<rect x="250" y="4" width="140" height="28" rx="8" fill="#bbf7d0"/><text x="320" y="23" text-anchor="middle" class="svg-ink" font-size="13">Confidentiality</text>
<rect x="40" y="196" width="150" height="28" rx="8" fill="#fde68a"/><text x="115" y="215" text-anchor="middle" class="svg-ink" font-size="13">Integrity</text>
<rect x="450" y="196" width="150" height="28" rx="8" fill="#fed7aa"/><text x="525" y="215" text-anchor="middle" class="svg-ink" font-size="13">Availability</text>
<text x="175" y="100" text-anchor="middle" class="svg-muted" font-size="12">encryption, ACLs</text>
<text x="470" y="100" text-anchor="middle" class="svg-muted" font-size="12">redundancy, anti-DoS</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">hashing, signatures</text>
</svg><p class="cap">CIA triad: aapka configure kiya har control kam se kam ek kone ko protect karta hai.</p></div>

<h3>CIA triad</h3>
<dl class="terms">
<dt>Confidentiality</dt><dd>Sirf authorised log data padh sakein. Tools: encryption (Telnet ki jagah SSH, HTTPS, IPsec), ACLs, authentication, least privilege.</dd>
<dt>Integrity</dt><dd>Data bina pakde badla na ja sake, transit mein ya rest par. Tools: hashing (SHA-256), digital signatures, TLS aur IPsec mein message authentication, configurations par change control.</dd>
<dt>Availability</dt><dd>Services zaroorat ke waqt reachable hon. Tools: redundancy, backups, DoS protection, port security jo MAC-flooding attack ko switch bigaadne se rokta hai.</dd>
</dl>
<p>Kuch controls ek se zyada kone chhoote hain. SSH confidentiality deta hai (password encrypted hota hai) aur integrity bhi (tamper kiye packets reject hote hain). Port-security shutdown confidentiality bachata hai (rogue laptop sniff nahi kar sakta) lekin us ek port ki availability ko nuksaan karta hai, jo ek soch-samajh kar liya gaya trade-off hai.</p>

<h3>Risk vocabulary jo exam ko bahut pasand hai</h3>
<table class="cmp"><tr><th>Term</th><th>Matlab</th><th>Example</th></tr>
<tr><td><b>Vulnerability</b></td><td>System, process ya insaan mein ek kamzori</td><td>Router password cisco ke saath Telnet accept karta hai</td></tr>
<tr><td><b>Threat</b></td><td>Koi bhi cheez jo kamzori ka fayda utha kar nuksaan kar sake (actor ya event)</td><td>User VLAN par ek insider, baadh, ek botnet</td></tr>
<tr><td><b>Exploit</b></td><td>Asli technique ya code jo vulnerability ka fayda uthata hai</td><td>Telnet session sniff karke password replay karna</td></tr>
<tr><td><b>Risk</b></td><td>Threat ke vulnerability exploit karne ki likelihood, impact se multiply</td><td>High: karna aasaan hai aur edge router ka poora control deta hai</td></tr>
</table>
<p>Risk kam karne ke teen tareeke hain: vulnerabilities hatao (patch karo, Telnet band karo), threats ke saamne exposure kam karo (management ek subnet tak seemit karo), ya impact kam karo (backups, segmentation). Controls ke baad jo risk bachta hai use <b>residual risk</b> kehte hain, aur management use formally accept karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek auditor likelihood aur impact ko 1 se 5 tak score karta hai. Edge router EDGE kisi bhi network se Telnet accept karta hai: likelihood 4 (koi bhi user try kar sakta hai), impact 5 (internet edge ka poora control), risk 25 mein se 20, red. Lab fix ke baad (sirf SSH, local account, 10.0.99.0/24 ko allow karne wala VTY ACL), likelihood 1 ho jaati hai kyunki sirf admin subnet session khol bhi sakta hai, aur password ab clear text mein nahi jaata. Risk 25 mein se 5 ho jaata hai, green. Vulnerability poori tarah gayab nahi hui; exposure chhota ho gaya.</p></div>

<h3>Real network mein defence in depth</h3>
<p>Ek typical chhota office yeh layers lagata hai, aur yeh module har ek ko cover karta hai: locked comms room aur cameras (physical), access ports par port security aur 802.1X (network access control), segments ke beech VLANs aur ACLs (segmentation), trusted, untrusted aur screened-subnet zones wala firewall (perimeter), devices par SSH, SNMPv3 aur AAA (management plane), aur khud data ke liye encryption plus backups.</p>

<div class="warn"><p><b>Common galti.</b> Ek strong control ko kaafi samajh lena. Edge ka firewall us insider ke khilaaf kuch nahi karta jo reception port mein laptop laga de, aur strong passwords kuch nahi karte agar protocol unhe clear text mein bhejta hai. Layers mein socho, aur poocho ki har layer CIA ka kaunsa kona bachati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Noun dhyaan se padho. "Ek kamzori" vulnerability hai; "uske khilaaf use hone wala code ya method" exploit hai; "ek potential khatra" threat hai; "likelihood guna impact" risk hai. Questions aksar chaaron ko options mein dete hain.</p></div>

<div class="scn"><h4>Woh audit finding jisse sab shuru hua</h4><p>Ek logistics company ke yearly audit mein pata chala ki internet edge router har internal subnet se shared password ke saath Telnet accept karta tha. User VLAN par packet capture mein password clear text mein dikha. Engineer ne ise high risk rate kiya, phir ek change window mein fix kiya: local admin account ke saath SSH, Telnet band, aur ek VTY access list jo sirf admin network ko allow karti hai. Re-test mein SSH admin PC se chala aur user PC se refuse hua.</p><p><b>Seekh:</b> yahi is module ka Lab 1 hai. Security ka kaam aam taur par "kamzori dhoondo, exposure kam karo, test se prove karo" hota hai.</p></div>

<div class="iv"><p class="q">"Jis network par aapne kaam kiya hai uske examples se CIA triad samjhao."</p><p>Har kone ke liye ek concrete control do: confidentiality ke liye SSH aur HTTPS, integrity ke liye hashing aur signed images, availability ke liye redundant links aur DoS protection. Phir ek trade-off bata kar maturity dikhao, jaise port-security shutdown mode confidentiality badhata hai lekin us port ki availability kam karta hai. Defence in depth ke saath khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CIA = confidentiality, integrity, availability; har control kam se kam ek ko protect karta hai.</li>
<li>Vulnerability kamzori hai, threat khatra hai, exploit method hai, risk likelihood guna impact hai.</li>
<li>Controls vulnerabilities hatate hain, exposure kam karte hain ya impact kam karte hain; jo bachta hai woh residual risk hai.</li>
<li>Defence in depth independent layers lagata hai: physical, access, segmentation, perimeter, management, data.</li>
<li>Yeh module N10-009 ka poora domain 4.0 aur access aur management methods (3.5) cover karta hai.</li>
</ul></div>
`}};export{e as default};