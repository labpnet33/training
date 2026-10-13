var e={id:`dos-people`,h:{en:`DoS, DNS poisoning, malware, social engineering, physical security and deception`,hi:`DoS, DNS poisoning, malware, social engineering, physical security aur deception`},body:{en:`
<p>Picture a busy sweet shop during Diwali. A mob that never buys anything can crowd the entrance so real customers cannot get in. Someone can swap the street sign so customers walk to a fake shop. A smooth talker can convince the cashier he is "from head office". Cameras, locks and a decoy cash box help the owner spot and stop all of them. This chapter covers the rest of the attack list on the blueprint, and the physical and deception controls that go with them.</p>

<h3>Denial of service (DoS) and distributed DoS (DDoS)</h3>
<p>A <b>DoS</b> attack attacks <b>availability</b>: it exhausts bandwidth, connection tables, CPU or application capacity so legitimate users are refused. A <b>DDoS</b> uses many sources at once, usually a <b>botnet</b> of infected devices, which makes simple source blocking useless. Three families:</p>
<ul>
<li><b>Volumetric</b>: fill the internet link with traffic, often using <b>reflection and amplification</b>. The attacker spoofs the victim's IP as the source and sends small queries to open DNS or NTP servers, which send much larger replies to the victim.</li>
<li><b>Protocol</b>: exhaust state tables, such as a <b>SYN flood</b> that opens thousands of half-open TCP connections.</li>
<li><b>Application</b>: send expensive requests (searches, logins) to a web application.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reflection and amplification DDoS">
<rect x="10" y="75" width="110" height="50" rx="10" fill="#fed7aa"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">Botnet</text>
<rect x="250" y="20" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Open DNS server</text>
<rect x="250" y="80" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">Open NTP server</text>
<rect x="250" y="140" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Open DNS server</text>
<rect x="520" y="75" width="110" height="50" rx="10" fill="#bae6fd"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="13">Victim</text>
<line x1="120" y1="100" x2="250" y2="40" stroke="#64748b"/><line x1="120" y1="100" x2="250" y2="100" stroke="#64748b"/><line x1="120" y1="100" x2="250" y2="160" stroke="#64748b"/>
<line x1="390" y1="40" x2="520" y2="100" stroke="#64748b" stroke-width="3"/><line x1="390" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="3"/><line x1="390" y1="160" x2="520" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="185" y="195" text-anchor="middle" class="svg-muted" font-size="12">small spoofed queries</text>
<text x="455" y="195" text-anchor="middle" class="svg-accent" font-size="12">large replies</text>
</svg><p class="cap">The victim's own address is forged as the source, so the replies land on the victim.</p></div>

<div class="eg"><p><b>Worked example: amplification.</b> A 60-byte DNS query that returns a 3,000-byte answer gives a 50x amplification factor. An attacker who can send 20 Mbps of spoofed queries delivers about 1 Gbps to the victim. A branch with a 500 Mbps internet link is completely full, and no firewall inside that branch can help, because the link itself is saturated. That is why DDoS defence happens upstream: ISP or cloud <b>scrubbing</b> services, a CDN in front of websites, and rate limiting at the provider edge. Inside your network, keep resolvers from being open to the internet, rate-limit and enable SYN protection on firewalls, and build redundant links.</p></div>

<h3>DNS poisoning and DNS spoofing</h3>
<p><b>DNS cache poisoning</b> inserts a forged record into a resolver's cache, so every user of that resolver is sent to the attacker's IP for a real name, such as portal.corp.example. <b>DNS spoofing</b> is the wider idea of forging DNS answers, for example by racing a reply to one client, running a rogue DNS server via rogue DHCP, or editing a host's local hosts file. <b>Defences:</b> <b>DNSSEC</b>, which signs records so resolvers can verify them; patched resolvers with randomised ports and query IDs; recursion limited to internal clients; DHCP snooping so clients get the right DNS server; and TLS certificates, which make a fake site fail validation.</p>

<h3>Malware</h3>
<p><b>Malware</b> is any malicious software. <b>Virus</b>: attaches to a file and needs a user to run it. <b>Worm</b>: spreads by itself across the network, often through an unpatched service. <b>Trojan</b>: pretends to be useful software. <b>Ransomware</b>: encrypts data and demands payment. <b>Spyware and keyloggers</b>: steal information. <b>Rootkit</b>: hides deep in the operating system. <b>Bot</b>: joins a botnet used for DDoS or spam. Network defences: patching, endpoint protection, least privilege, segmentation that stops a worm spreading, content filtering, and offline backups against ransomware.</p>

<h3>Social engineering</h3>
<ul>
<li><b>Phishing</b>: fraudulent messages that trick people into clicking or giving credentials. Variants: spear phishing (targeted), whaling (executives), vishing (voice), smishing (SMS).</li>
<li><b>Dumpster diving</b>: searching rubbish for printed configs, passwords or org charts. Defence: shredding and secure disposal.</li>
<li><b>Shoulder surfing</b>: watching someone type a password or read a screen. Defence: privacy screens, awareness.</li>
<li><b>Tailgating</b>: following an authorised person through a secured door without badging. Defence: an <b>access control vestibule</b> (two doors, one opens at a time), guards and training.</li>
</ul>

<h3>Physical security and deception</h3>
<p>N10-009 names <b>cameras</b> and <b>locks</b>. Cameras deter and give evidence; locks include door locks, badge readers, biometric readers and locked racks or cabinets for network gear. A switch in an unlocked cupboard can be reset, reconfigured through its console or simply stolen. <b>Deception</b> technology sets traps: a <b>honeypot</b> is a single decoy system that looks valuable, and a <b>honeynet</b> is a whole decoy network. No legitimate user should ever touch them, so any connection is a high-confidence alert. They must be isolated so an attacker cannot pivot from them.</p>

<div class="warn"><p><b>Common mistakes.</b> Thinking a firewall inside the branch can stop a volumetric DDoS. Running an open DNS resolver on the internet, which makes you part of other people's attacks. Treating tailgating as a "people problem" only, without a vestibule or badge policy. Placing a honeypot on the production VLAN with real credentials on it.</p></div>

<div class="exam"><p><b>Exam trap.</b> DDoS = many sources; DoS = one. Worm spreads by itself; virus needs a user. Tailgating is without the employee's consent; piggybacking is with it. A honeypot is one decoy host; a honeynet is a network of them. DNSSEC protects integrity of DNS answers, not confidentiality.</p></div>

<div class="scn"><h4>The invoice email</h4><p>An accounts executive received an email that looked like it came from a known supplier asking her to "review the attached invoice". The attachment dropped ransomware, which began encrypting file shares. The honeypot file server in the finance VLAN raised an alert within minutes because nothing should ever connect to it. The team isolated the VLAN with an ACL, re-imaged the laptop and restored shares from offline backups. Afterwards they added phishing training, attachment content filtering and MFA.</p><p><b>Lesson:</b> social engineering is often the first step of a malware incident; deception, segmentation and backups limit the damage.</p></div>

<div class="iv"><p class="q">"How would you protect a company website against DDoS?"</p><p>Explain that a volumetric attack fills the link before your firewall sees it, so the main defence is upstream: ISP or cloud scrubbing and a CDN. Add rate limiting and SYN protection for protocol attacks, application-layer protection for expensive requests, redundant links and providers, a response runbook, and never run open resolvers yourself. Mention reflection and amplification by name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DoS attacks availability; DDoS uses a botnet; reflection and amplification multiply traffic.</li>
<li>DNS poisoning plants forged records in a resolver cache; DNSSEC and TLS validation defend.</li>
<li>Know the malware types: virus, worm, trojan, ransomware, spyware, rootkit, bot.</li>
<li>Social engineering: phishing, dumpster diving, shoulder surfing, tailgating; train people and add physical controls.</li>
<li>Cameras and locks protect hardware; honeypots and honeynets give high-confidence early warnings.</li>
</ul></div>
`,hi:`
<p>Diwali ke time ek busy mithai ki dukaan socho. Kuch na khareedne wali bheed entrance ghher sakti hai taaki asli customers andar na aa sakein. Koi street ka board badal sakta hai taaki customers nakli dukaan par pahunchein. Ek chalaak aadmi cashier ko yakeen dila sakta hai ki woh "head office se" hai. Cameras, taale aur ek decoy cash box maalik ko in sabko pakadne aur rokne mein madad karte hain. Yeh chapter blueprint ki baaki attack list cover karta hai, aur unke saath aane wale physical aur deception controls.</p>

<h3>Denial of service (DoS) aur distributed DoS (DDoS)</h3>
<p><b>DoS</b> attack <b>availability</b> par hamla karta hai: bandwidth, connection tables, CPU ya application capacity khatam kar deta hai taaki legitimate users refuse ho jaayein. <b>DDoS</b> ek saath bahut saare sources use karta hai, aam taur par infected devices ka <b>botnet</b>, jisse simple source blocking bekaar ho jaati hai. Teen families:</p>
<ul>
<li><b>Volumetric</b>: internet link ko traffic se bhar do, aksar <b>reflection aur amplification</b> use karke. Attacker victim ke IP ko source ki tarah spoof karta hai aur open DNS ya NTP servers ko chhoti queries bhejta hai, jo victim ko kahin bade replies bhejte hain.</li>
<li><b>Protocol</b>: state tables khatam karo, jaise <b>SYN flood</b> jo hazaaron half-open TCP connections kholta hai.</li>
<li><b>Application</b>: web application ko mehnge requests bhejo (searches, logins).</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Reflection aur amplification DDoS">
<rect x="10" y="75" width="110" height="50" rx="10" fill="#fed7aa"/><text x="65" y="105" text-anchor="middle" class="svg-ink" font-size="13">Botnet</text>
<rect x="250" y="20" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">Open DNS server</text>
<rect x="250" y="80" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="12">Open NTP server</text>
<rect x="250" y="140" width="140" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="165" text-anchor="middle" class="svg-ink" font-size="12">Open DNS server</text>
<rect x="520" y="75" width="110" height="50" rx="10" fill="#bae6fd"/><text x="575" y="105" text-anchor="middle" class="svg-ink" font-size="13">Victim</text>
<line x1="120" y1="100" x2="250" y2="40" stroke="#64748b"/><line x1="120" y1="100" x2="250" y2="100" stroke="#64748b"/><line x1="120" y1="100" x2="250" y2="160" stroke="#64748b"/>
<line x1="390" y1="40" x2="520" y2="100" stroke="#64748b" stroke-width="3"/><line x1="390" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="3"/><line x1="390" y1="160" x2="520" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="185" y="195" text-anchor="middle" class="svg-muted" font-size="12">chhoti spoofed queries</text>
<text x="455" y="195" text-anchor="middle" class="svg-accent" font-size="12">bade replies</text>
</svg><p class="cap">Victim ka apna address source ki tarah forge hota hai, isliye replies victim par girte hain.</p></div>

<div class="eg"><p><b>Worked example: amplification.</b> 60-byte DNS query jo 3,000-byte answer lautaye, 50x amplification factor deti hai. Jo attacker 20 Mbps spoofed queries bhej sake woh victim tak lagbhag 1 Gbps pahunchata hai. 500 Mbps internet link wali branch poori bhar jaati hai, aur us branch ke andar ka koi firewall madad nahi kar sakta, kyunki link khud saturate hai. Isiliye DDoS defence upstream hota hai: ISP ya cloud <b>scrubbing</b> services, websites ke aage CDN, aur provider edge par rate limiting. Apne network ke andar, resolvers ko internet ke liye open mat rakho, firewalls par rate-limit aur SYN protection enable karo, aur redundant links banao.</p></div>

<h3>DNS poisoning aur DNS spoofing</h3>
<p><b>DNS cache poisoning</b> resolver ke cache mein ek nakli record daal deta hai, isliye us resolver ka har user ek asli naam, jaise portal.corp.example, ke liye attacker ke IP par bheja jaata hai. <b>DNS spoofing</b> DNS answers forge karne ka broader idea hai, jaise ek client ko race karke reply bhejna, rogue DHCP ke through rogue DNS server chalana, ya host ki local hosts file edit karna. <b>Defences:</b> <b>DNSSEC</b>, jo records sign karta hai taaki resolvers unhe verify kar sakein; randomised ports aur query IDs wale patched resolvers; recursion sirf internal clients tak; DHCP snooping taaki clients ko sahi DNS server mile; aur TLS certificates, jisse fake site validation mein fail hoti hai.</p>

<h3>Malware</h3>
<p><b>Malware</b> koi bhi malicious software hai. <b>Virus</b>: file se judta hai aur use chalane ke liye user chahiye. <b>Worm</b>: network par khud failta hai, aksar unpatched service ke through. <b>Trojan</b>: useful software hone ka dikhawa karta hai. <b>Ransomware</b>: data encrypt karke paise maangta hai. <b>Spyware aur keyloggers</b>: information churate hain. <b>Rootkit</b>: operating system mein gehre chhupta hai. <b>Bot</b>: DDoS ya spam ke liye use hone wale botnet mein judta hai. Network defences: patching, endpoint protection, least privilege, worm ko failne se rokne wala segmentation, content filtering, aur ransomware ke khilaaf offline backups.</p>

<h3>Social engineering</h3>
<ul>
<li><b>Phishing</b>: dhokhe wale messages jo logon ko click karne ya credentials dene ke liye phansate hain. Variants: spear phishing (targeted), whaling (executives), vishing (voice), smishing (SMS).</li>
<li><b>Dumpster diving</b>: kachre mein printed configs, passwords ya org charts dhoondhna. Defence: shredding aur secure disposal.</li>
<li><b>Shoulder surfing</b>: kisi ko password type karte ya screen padhte dekhna. Defence: privacy screens, awareness.</li>
<li><b>Tailgating</b>: bina badge kiye kisi authorised insaan ke peeche secured door se ghus jaana. Defence: <b>access control vestibule</b> (do darwaze, ek baar mein ek khulta hai), guards aur training.</li>
</ul>

<h3>Physical security aur deception</h3>
<p>N10-009 <b>cameras</b> aur <b>locks</b> ka naam leta hai. Cameras darate hain aur saboot dete hain; locks mein door locks, badge readers, biometric readers aur network gear ke liye locked racks ya cabinets aate hain. Unlocked almari mein rakha switch reset ho sakta hai, console se reconfigure ho sakta hai ya seedha chori ho sakta hai. <b>Deception</b> technology jaal bichhati hai: <b>honeypot</b> ek akela decoy system hai jo keemti dikhta hai, aur <b>honeynet</b> poora decoy network hai. Koi legitimate user kabhi inhe nahi chhoona chahiye, isliye koi bhi connection high-confidence alert hai. Inhe isolate rakhna zaroori hai taaki attacker inse aage pivot na kar sake.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki branch ke andar ka firewall volumetric DDoS rok sakta hai. Internet par open DNS resolver chalana, jisse aap dusron ke attacks ka hissa ban jaate ho. Tailgating ko sirf "logon ki problem" samajhna, bina vestibule ya badge policy ke. Honeypot ko production VLAN par real credentials ke saath rakh dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> DDoS = bahut saare sources; DoS = ek. Worm khud failta hai; virus ko user chahiye. Tailgating employee ki marzi ke bina hota hai; piggybacking marzi ke saath. Honeypot ek decoy host hai; honeynet unka network. DNSSEC DNS answers ki integrity bachata hai, confidentiality nahi.</p></div>

<div class="scn"><h4>Invoice wala email</h4><p>Ek accounts executive ko email mila jo ek jaane-pehchaane supplier se lag raha tha aur "attached invoice review karne" ko keh raha tha. Attachment ne ransomware daal diya, jo file shares encrypt karne laga. Finance VLAN ke honeypot file server ne minuton mein alert diya kyunki use kabhi koi connect nahi karta. Team ne ACL se VLAN isolate kiya, laptop re-image kiya aur offline backups se shares restore kiye. Uske baad unhone phishing training, attachment content filtering aur MFA joda.</p><p><b>Seekh:</b> social engineering aksar malware incident ka pehla kadam hota hai; deception, segmentation aur backups nuksaan seemit karte hain.</p></div>

<div class="iv"><p class="q">"Aap company website ko DDoS se kaise bachaoge?"</p><p>Samjhao ki volumetric attack firewall ke dekhne se pehle hi link bhar deta hai, isliye main defence upstream hai: ISP ya cloud scrubbing aur CDN. Protocol attacks ke liye rate limiting aur SYN protection jodo, mehnge requests ke liye application-layer protection, redundant links aur providers, ek response runbook, aur khud kabhi open resolvers mat chalao. Reflection aur amplification ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DoS availability par hamla karta hai; DDoS botnet use karta hai; reflection aur amplification traffic ko multiply karte hain.</li>
<li>DNS poisoning resolver cache mein nakli records daalta hai; DNSSEC aur TLS validation bachate hain.</li>
<li>Malware types yaad rakho: virus, worm, trojan, ransomware, spyware, rootkit, bot.</li>
<li>Social engineering: phishing, dumpster diving, shoulder surfing, tailgating; logon ko train karo aur physical controls jodo.</li>
<li>Cameras aur locks hardware bachate hain; honeypots aur honeynets high-confidence early warnings dete hain.</li>
</ul></div>
`}};export{e as default};