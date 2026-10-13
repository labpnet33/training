var e={id:`goals`,h:{en:`Why security is every network engineer's job`,hi:`Security har network engineer ka kaam kyun hai`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will speak the language of network security the way a security team expects a network engineer to speak it. You will be able to explain the CIA triad, tell a threat from a vulnerability from an exploit, name the people who attack networks and the attacks they use, explain password policy, multi-factor authentication, certificates and biometrics, recap AAA and 802.1X, describe firewalls, IPS and zero trust, explain how site-to-site and remote-access VPNs protect traffic, compare WPA, WPA2 and WPA3, and work a real security incident from a NOC ticket to a fix.</p>
<p><b>Prerequisites.</b> You should be comfortable with IPv4 addressing, VLANs and basic switch and router configuration from the earlier CCNA modules. It helps a lot if you have finished <b>Layer 2 security</b> (port security, DHCP snooping, DAI, 802.1X) and <b>Device access, SSH, AAA and SFTP/SCP</b>, because this module refers back to them instead of re-teaching the commands. Access control lists get their own module; here you only need to know that an ACL permits or denies packets.</p>

<h3>The big picture: a bank branch</h3>
<p>Think of a bank branch in your city. Money is the <b>asset</b>. The bank does not rely on one lock. There is a guard at the door who checks who walks in (<b>authentication</b>), a rule that only the cashier may open the cash drawer (<b>authorization</b>), a register that records every withdrawal (<b>accounting</b>), cameras, a vault with a time lock, an armoured van that carries cash between branches through public roads (a <b>VPN</b>), and staff training so nobody hands the vault key to a smooth-talking stranger on the phone (<b>security awareness</b>).</p>
<p>No single control is perfect. The guard can be fooled, a camera can fail, a clerk can be tricked. The bank is safe because the controls are <b>layered</b>: an attacker must beat all of them, and each one either stops, slows down or records the attempt. Security people call this <b>defense in depth</b>, and it is the idea behind every chapter of this module.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Defense in depth layers">
<rect x="10" y="10" width="620" height="240" rx="12" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Policy, awareness and training</text>
<rect x="40" y="40" width="560" height="200" rx="12" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Physical access control: badges, locks, cameras</text>
<rect x="70" y="70" width="500" height="160" rx="12" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Perimeter: firewall, IPS, VPN</text>
<rect x="100" y="100" width="440" height="120" rx="12" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network access: 802.1X, port security, WPA3</text>
<rect x="130" y="130" width="380" height="80" rx="12" fill="#bbf7d0"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Device and identity: AAA, MFA, patching</text>
<rect x="220" y="162" width="200" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Asset: data and services</text>
</svg><p class="cap">Defense in depth: an attacker must get through every ring, and each ring can stop, slow or log the attempt.</p></div>

<h3>Why a network engineer must know this</h3>
<p>In many companies the network team and the security team are different people, but the network is where most attacks travel. The switch port is where a rogue device plugs in. The router is where the VPN terminates. The wireless controller decides whether a guest can reach the finance VLAN. When the security team says "we saw beaconing from 10.10.10.57, isolate it", you are the person who finds the port and shuts it. When they ask "is this branch traffic encrypted over the internet?", you are the person who proves it with <code>show crypto ipsec sa</code>.</p>
<p>Interviewers know this. A CCNA-level candidate who can explain why a DDoS attack hurts availability, why two passwords are not multi-factor, or why WPA3 personal resists offline guessing stands out immediately from one who only memorised port numbers.</p>

<h3>How this module maps to the CCNA exam</h3>
<p>The Security Fundamentals domain of CCNA 200-301 is about 15% of the exam. This module covers the concept items: key security concepts (threats, vulnerabilities, exploits and mitigation techniques), security program elements (user awareness, training and physical access control), password policies and password alternatives (MFA, certificates and biometrics), IPsec remote-access and site-to-site VPNs, AAA concepts, and wireless security protocols (WPA, WPA2 and WPA3). It also adds the security part of blueprint item 1.1: the role of next-generation firewalls and IPS. Configuration of device passwords, ACLs and Layer 2 security lives in their own modules.</p>

<table class="cmp"><tr><th>Chapter</th><th>You will be able to</th></tr>
<tr><td>2 – 4</td><td>Use the vocabulary; classify an attack and its CIA impact; name the mitigation</td></tr>
<tr><td>5 – 6</td><td>Write a password policy; explain MFA, certificates, biometrics, AAA and 802.1X</td></tr>
<tr><td>7</td><td>Compare stateless and stateful filtering, NGFW, IDS and IPS</td></tr>
<tr><td>8 – 9</td><td>Explain IPsec site-to-site, GRE over IPsec, remote-access VPN and zero trust</td></tr>
<tr><td>10</td><td>Compare WPA, WPA2 and WPA3, personal and enterprise</td></tr>
<tr><td>11 – 12</td><td>Work a security incident end to end; revise for the exam</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Look at one ordinary morning at a company with 400 staff. A phishing e-mail reaches 400 inboxes (social engineering). 12 people click, 2 type their password (password attack made easy). One attacker tries that password on the VPN portal, but MFA stops the login (password alternative). Another staff laptop plugs into a meeting-room port with a home router that starts answering DHCP (rogue DHCP, a man-in-the-middle setup). DHCP snooping drops its offers (Layer 2 mitigation). Five separate controls, five separate chapters, one morning.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Treating security as a product you buy ("we have a firewall, so we are secure"). A firewall does nothing against a user who hands over a password, a laptop infected at home, or a rogue device on an internal port. Security is a set of layered controls plus people and process.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam asks you to <b>describe</b> most of these topics, not configure them. Expect scenario questions such as "a user receives a text message asking to confirm a bank PIN; which attack is this?" or "which WPA3 feature replaces the pre-shared key handshake?". Precise vocabulary wins these marks.</p></div>

<div class="scn"><h4>The meeting-room router</h4><p>A logistics company in Pune raised a ticket: "Since this morning some PCs get strange addresses and web pages look odd." The NOC engineer saw that affected PCs had a default gateway in 172.31.66.0/24, a subnet the company never used. CDP on the access switch showed a small router on a meeting-room port. A visiting vendor had plugged in a travel router to share the internet, and it answered DHCP faster than the real server. It was not even malicious, but it put an unknown device in the middle of staff traffic. The engineer enabled DHCP snooping, trusted only the uplink, and the problem disappeared. You will work exactly this incident in chapter 11.</p><p><b>Lesson:</b> security incidents often look like ordinary network faults. The engineer who knows the attack patterns spots them first.</p></div>

<div class="iv"><p class="q">"What does defense in depth mean, and can you give an example from a network you know?"</p><p>Strong answer: several independent layers of control, so that the failure of one does not expose the asset. Give a concrete stack: user awareness training, badge access to wiring closets, 802.1X on access ports, DHCP snooping and DAI, a stateful firewall and IPS at the edge, MFA on VPN and admin logins, encrypted site-to-site VPN between branches, logging to a central server. Mention that each layer should either stop, slow down or record the attacker.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module teaches the vocabulary and concepts of the CCNA Security Fundamentals domain.</li>
<li>Defense in depth: layered, independent controls around the asset, like a bank branch.</li>
<li>The network carries most attacks, so network engineers find, isolate and prove things for the security team.</li>
<li>Most exam items here are "describe": exact terms and clear comparisons matter.</li>
<li>Configuration of passwords, ACLs and Layer 2 security is in the neighbouring modules; this one links them together.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap network security ki bhasha waise bol paoge jaise security team ek network engineer se expect karti hai. Aap CIA triad explain kar paoge, threat, vulnerability aur exploit ka farak bata paoge, networks par attack karne wale logon aur unke attacks ke naam le paoge, password policy, multi-factor authentication, certificates aur biometrics samjha paoge, AAA aur 802.1X recap kar paoge, firewalls, IPS aur zero trust describe kar paoge, samjha paoge ki site-to-site aur remote-access VPNs traffic ko kaise protect karte hain, WPA, WPA2 aur WPA3 compare kar paoge, aur ek real security incident ko NOC ticket se fix tak solve kar paoge.</p>
<p><b>Prerequisites.</b> Pichle CCNA modules se IPv4 addressing, VLANs aur basic switch aur router configuration aapko aana chahiye. Bahut madad milegi agar aapne <b>Layer 2 security</b> (port security, DHCP snooping, DAI, 802.1X) aur <b>Device access, SSH, AAA aur SFTP/SCP</b> poore kar liye hain, kyunki yeh module commands dobara sikhane ki jagah unhi ko refer karta hai. Access control lists ka apna module hai; yahan bas itna pata hona chahiye ki ACL packets ko permit ya deny karti hai.</p>

<h3>Big picture: ek bank branch</h3>
<p>Apne shehar ki ek bank branch socho. Paisa <b>asset</b> hai. Bank ek hi taale par bharosa nahi karta. Darwaze par guard hai jo check karta hai kaun andar aa raha hai (<b>authentication</b>), rule hai ki sirf cashier cash drawer khol sakta hai (<b>authorization</b>), ek register hai jo har withdrawal record karta hai (<b>accounting</b>), cameras hain, time lock wala vault hai, armoured van hai jo public sadkon se branches ke beech cash le jaati hai (<b>VPN</b>), aur staff training hai taaki koi bhi phone par meethi baatein karne wale anjaan aadmi ko vault ki chaabi na de de (<b>security awareness</b>).</p>
<p>Koi bhi ek control perfect nahi hai. Guard ko bewakoof banaya ja sakta hai, camera fail ho sakta hai, clerk ko trick kiya ja sakta hai. Bank isliye safe hai kyunki controls <b>layered</b> hain: attacker ko sabko harana padta hai, aur har ek ya to attempt rokta hai, dheema karta hai ya record karta hai. Security log ise <b>defense in depth</b> kehte hain, aur is module ke har chapter ke peeche yahi idea hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Defense in depth ki layers">
<rect x="10" y="10" width="620" height="240" rx="12" fill="#fed7aa"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">Policy, awareness aur training</text>
<rect x="40" y="40" width="560" height="200" rx="12" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">Physical access control: badges, taale, cameras</text>
<rect x="70" y="70" width="500" height="160" rx="12" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">Perimeter: firewall, IPS, VPN</text>
<rect x="100" y="100" width="440" height="120" rx="12" fill="#ddd6fe"/><text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Network access: 802.1X, port security, WPA3</text>
<rect x="130" y="130" width="380" height="80" rx="12" fill="#bbf7d0"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Device aur identity: AAA, MFA, patching</text>
<rect x="220" y="162" width="200" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="13">Asset: data aur services</text>
</svg><p class="cap">Defense in depth: attacker ko har ring paar karni padti hai, aur har ring attempt ko rok, dheema ya log kar sakti hai.</p></div>

<h3>Network engineer ko yeh kyun aana chahiye</h3>
<p>Kai companies mein network team aur security team alag log hote hain, lekin zyada tar attacks network se hi guzarte hain. Switch port woh jagah hai jahan rogue device plug hota hai. Router woh jagah hai jahan VPN terminate hota hai. Wireless controller decide karta hai ki guest finance VLAN tak pahunch sakta hai ya nahi. Jab security team kehti hai "humne 10.10.10.57 se beaconing dekhi, ise isolate karo", to aap hi woh insaan ho jo port dhoondh kar band karta hai. Jab woh poochte hain "kya yeh branch traffic internet par encrypted hai?", to aap hi <code>show crypto ipsec sa</code> se prove karte ho.</p>
<p>Interviewers yeh jaante hain. CCNA-level candidate jo samjha sake ki DDoS attack availability ko kyun nuksaan pahunchata hai, do passwords multi-factor kyun nahi hain, ya WPA3 personal offline guessing ko kyun rokta hai, woh sirf port numbers ratne wale candidate se turant alag dikhta hai.</p>

<h3>Yeh module CCNA exam se kaise map hota hai</h3>
<p>CCNA 200-301 ka Security Fundamentals domain exam ka lagbhag 15% hai. Yeh module concept items cover karta hai: key security concepts (threats, vulnerabilities, exploits aur mitigation techniques), security program elements (user awareness, training aur physical access control), password policies aur password alternatives (MFA, certificates aur biometrics), IPsec remote-access aur site-to-site VPNs, AAA concepts, aur wireless security protocols (WPA, WPA2 aur WPA3). Isme blueprint item 1.1 ka security hissa bhi hai: next-generation firewalls aur IPS ka role. Device passwords, ACLs aur Layer 2 security ki configuration unke apne modules mein hai.</p>

<table class="cmp"><tr><th>Chapter</th><th>Aap kya kar paoge</th></tr>
<tr><td>2 – 4</td><td>Vocabulary use karna; attack aur uska CIA impact classify karna; mitigation ka naam lena</td></tr>
<tr><td>5 – 6</td><td>Password policy likhna; MFA, certificates, biometrics, AAA aur 802.1X samjhana</td></tr>
<tr><td>7</td><td>Stateless aur stateful filtering, NGFW, IDS aur IPS compare karna</td></tr>
<tr><td>8 – 9</td><td>IPsec site-to-site, GRE over IPsec, remote-access VPN aur zero trust samjhana</td></tr>
<tr><td>10</td><td>WPA, WPA2 aur WPA3, personal aur enterprise compare karna</td></tr>
<tr><td>11 – 12</td><td>Security incident ko shuru se end tak solve karna; exam ke liye revise karna</td></tr></table>

<div class="eg"><p><b>Worked example.</b> 400 staff wali company ki ek aam subah dekho. Ek phishing e-mail 400 inboxes tak pahunchta hai (social engineering). 12 log click karte hain, 2 apna password type kar dete hain (password attack aasaan ho gaya). Ek attacker woh password VPN portal par try karta hai, lekin MFA login rok deta hai (password alternative). Ek aur staff laptop meeting-room port mein ghar ke router ke saath plug hota hai jo DHCP ka jawab dene lagta hai (rogue DHCP, man-in-the-middle ki taiyaari). DHCP snooping uske offers drop kar deta hai (Layer 2 mitigation). Paanch alag controls, paanch alag chapters, ek subah.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Security ko ek product samajhna jo kharida jaata hai ("hamare paas firewall hai, to hum secure hain"). Firewall us user ke khilaf kuch nahi karta jo password de deta hai, ghar par infect hue laptop ke khilaf, ya internal port par rogue device ke khilaf. Security layered controls ka set hai, saath mein log aur process.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam zyada tar in topics ko <b>describe</b> karne ko kehta hai, configure karne ko nahi. Aise scenario questions expect karo: "user ko text message aata hai jo bank PIN confirm karne ko kehta hai; yeh kaunsa attack hai?" ya "WPA3 ka kaunsa feature pre-shared key handshake ki jagah leta hai?". Sahi vocabulary se hi yeh marks milte hain.</p></div>

<div class="scn"><h4>Meeting-room ka router</h4><p>Pune ki ek logistics company ne ticket raise kiya: "Aaj subah se kuch PCs ko ajeeb addresses mil rahe hain aur web pages ajeeb dikh rahe hain." NOC engineer ne dekha ki affected PCs ka default gateway 172.31.66.0/24 mein tha, jo subnet company ne kabhi use hi nahi kiya. Access switch par CDP ne meeting-room port par ek chhota router dikhaya. Ek visiting vendor ne internet share karne ke liye travel router plug kiya tha, aur woh asli server se pehle DHCP ka jawab de raha tha. Woh malicious bhi nahi tha, lekin usne staff traffic ke beech ek anjaan device bitha diya. Engineer ne DHCP snooping enable kiya, sirf uplink ko trust kiya, aur problem gayab ho gayi. Aap chapter 11 mein bilkul yahi incident solve karoge.</p><p><b>Seekh:</b> security incidents aksar aam network faults jaise dikhte hain. Jo engineer attack patterns jaanta hai, wahi unhe sabse pehle pakadta hai.</p></div>

<div class="iv"><p class="q">"Defense in depth ka kya matlab hai, aur kisi network se example de sakte ho jo aap jaante ho?"</p><p>Strong answer: control ki kai independent layers, taaki ek ke fail hone se asset expose na ho. Ek concrete stack batao: user awareness training, wiring closets par badge access, access ports par 802.1X, DHCP snooping aur DAI, edge par stateful firewall aur IPS, VPN aur admin logins par MFA, branches ke beech encrypted site-to-site VPN, central server par logging. Batao ki har layer ko attacker ko ya to rokna chahiye, dheema karna chahiye, ya record karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module CCNA Security Fundamentals domain ki vocabulary aur concepts sikhata hai.</li>
<li>Defense in depth: asset ke around layered, independent controls, bank branch ki tarah.</li>
<li>Zyada tar attacks network se guzarte hain, isliye network engineers security team ke liye dhoondhte, isolate karte aur prove karte hain.</li>
<li>Yahan zyada tar exam items "describe" wale hain: exact terms aur saaf comparisons zaroori hain.</li>
<li>Passwords, ACLs aur Layer 2 security ki configuration padosi modules mein hai; yeh module unhe aapas mein jodta hai.</li>
</ul></div>
`}};export{e as default};