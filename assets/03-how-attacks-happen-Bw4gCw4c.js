var e={id:`kill-chain`,h:{en:`How attacks happen: the kill chain and MITRE ATT&CK`,hi:`Attacks kaise hote hain: kill chain aur MITRE ATT&CK`},body:{en:`
<p>A burglary is not one moment. The burglar watches the house for days, buys tools, picks a night, opens a window, looks for the safe, carries the valuables out and drives away. At every step there is a chance to stop them: a neighbour notices the watching, a sensor catches the window, a camera sees the car. Cyber attacks work the same way. Defenders use models of these steps so that they can place a control and a detection at each one.</p>

<h3>The Cyber Kill Chain in seven stages</h3>
<p>The <b>Cyber Kill Chain</b>, published by Lockheed Martin, splits an intrusion into seven stages. The important idea is that the attacker must succeed at <b>every</b> stage, while the defender needs to break the chain at <b>only one</b>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Seven stages of the kill chain">
<rect x="5" y="20" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="47" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 Recon</text><text x="47" y="62" text-anchor="middle" class="svg-muted" font-size="12">research</text>
<rect x="95" y="20" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="137" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 Weaponise</text><text x="137" y="62" text-anchor="middle" class="svg-muted" font-size="12">build lure</text>
<rect x="185" y="20" width="84" height="56" rx="8" fill="#fde68a"/><text x="227" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Delivery</text><text x="227" y="62" text-anchor="middle" class="svg-muted" font-size="12">email, web</text>
<rect x="275" y="20" width="84" height="56" rx="8" fill="#fed7aa"/><text x="317" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Exploit</text><text x="317" y="62" text-anchor="middle" class="svg-muted" font-size="12">code runs</text>
<rect x="365" y="20" width="84" height="56" rx="8" fill="#fed7aa"/><text x="407" y="44" text-anchor="middle" class="svg-ink" font-size="12">5 Install</text><text x="407" y="62" text-anchor="middle" class="svg-muted" font-size="12">persist</text>
<rect x="455" y="20" width="84" height="56" rx="8" fill="#ddd6fe"/><text x="497" y="44" text-anchor="middle" class="svg-ink" font-size="12">6 C2</text><text x="497" y="62" text-anchor="middle" class="svg-muted" font-size="12">call home</text>
<rect x="545" y="20" width="90" height="56" rx="8" fill="#ddd6fe"/><text x="590" y="44" text-anchor="middle" class="svg-ink" font-size="12">7 Actions</text><text x="590" y="62" text-anchor="middle" class="svg-muted" font-size="12">steal, encrypt</text>
<rect x="5" y="100" width="264" height="46" rx="8" fill="#bbf7d0"/><text x="137" y="128" text-anchor="middle" class="svg-ink" font-size="12">Email security, SWG, DNS security, training</text>
<rect x="275" y="100" width="174" height="46" rx="8" fill="#bbf7d0"/><text x="362" y="128" text-anchor="middle" class="svg-ink" font-size="12">Patching, IPS, EDR</text>
<rect x="455" y="100" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="128" text-anchor="middle" class="svg-ink" font-size="12">DNS block, NGFW, SIEM, DLP</text>
<text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">Break any one link and the attack fails</text>
</svg><p class="cap">The seven stages (top) and the main defensive controls that can break each part of the chain (bottom).</p></div>

<table class="cmp"><tr><th>Stage</th><th>What happens (defender's view)</th><th>What you can see or stop</th></tr>
<tr><td>1 Reconnaissance</td><td>The attacker learns about you: public staff names, exposed services, DNS records</td><td>Reduce what is exposed; watch for scans in firewall logs</td></tr>
<tr><td>2 Weaponisation</td><td>A lure is prepared, for example a document or a fake login page</td><td>Happens on the attacker's side; threat intelligence may warn you</td></tr>
<tr><td>3 Delivery</td><td>The lure reaches a user: email, malicious website, USB, exposed service</td><td>Email security, secure web gateway, DNS security, user training</td></tr>
<tr><td>4 Exploitation</td><td>A vulnerability or a human mistake lets code run or a password be captured</td><td>Patching, IPS signatures, EDR, MFA</td></tr>
<tr><td>5 Installation</td><td>The attacker makes the foothold survive reboots (persistence)</td><td>EDR behaviour detection, application control</td></tr>
<tr><td>6 Command and control (C2)</td><td>The infected host calls out to the attacker's server for instructions</td><td>DNS security, NGFW Security Intelligence, NetFlow anomalies</td></tr>
<tr><td>7 Actions on objectives</td><td>Data theft, ransomware encryption, fraud, lateral movement to more hosts</td><td>Segmentation, DLP, SIEM correlation, backups</td></tr>
</table>

<h3>MITRE ATT&amp;CK: the detailed dictionary</h3>
<p>The kill chain is a simple story. <b>MITRE ATT&amp;CK</b> (Adversarial Tactics, Techniques and Common Knowledge) is a free, detailed knowledge base built from real intrusions. It is organised in three levels:</p>
<ul>
<li><b>Tactics</b>: the attacker's goal at that moment, the "why". The Enterprise matrix has 14 tactics: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration and Impact.</li>
<li><b>Techniques and sub-techniques</b>: the "how", each with an ID such as T1566 (Phishing) or T1071 (Application Layer Protocol, used for C2).</li>
<li><b>Procedures</b>: how a specific group actually did it in the wild.</li>
</ul>
<p>Together these are called <b>TTPs</b>. SOC tools, including Cisco XDR and Splunk detections, tag their alerts with ATT&amp;CK technique IDs so analysts immediately know where in an attack they are looking.</p>
<p>ATT&amp;CK is not a stage-by-stage sequence. Real attackers loop: discovery, credential access and lateral movement repeat many times inside a network. That is why ATT&amp;CK is a matrix, not a line.</p>

<h3>Indicators: IOC versus IOA</h3>
<p>An <b>indicator of compromise (IOC)</b> is evidence that something bad already happened: a known malicious file hash, a C2 domain, an attacker IP. An <b>indicator of attack (IOA)</b> describes behaviour in progress: an office program launching a script interpreter, a workstation logging in to fifty servers in a minute. IOCs are easy to share and block but easy for attackers to change; behaviour is much harder for them to change. The higher you detect on this "pyramid", from hashes and IPs up to TTPs, the more it costs the attacker to evade you.</p>

<div class="eg"><p><b>Worked example: one phishing attack mapped.</b> The attacker finds staff emails on a public site (Recon, TA0043). A fake invoice link is sent to finance (Initial Access, T1566 Phishing). A user opens it and enters their password on a look-alike page (Credential Access). The attacker logs in to webmail from abroad and creates an inbox forwarding rule (Persistence, Collection). The defender breaks the chain at several points: email security flags the look-alike domain, DNS security blocks it, MFA stops the login, and the SIEM alerts on a new forwarding rule. Any one of these is enough.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking the kill chain covers everything; it describes an external intrusion and fits insider threats and cloud account abuse poorly. Treating ATT&amp;CK as a checklist to "complete"; it is a map for finding gaps in detection. Blocking only IOCs: yesterday's IP is useless tomorrow.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know which stage a control addresses. DNS security stops delivery (bad link) <i>and</i> C2 (call home). EDR stops exploitation and installation. DLP acts at actions on objectives. And remember: tactic = why, technique = how.</p></div>

<div class="scn"><h4>Caught at stage six</h4><p>A marketing laptop opened a fake "codec update" and was infected; the antivirus signature was not yet available. Two hours later, the DNS security service blocked the laptop's queries to cdn-stats.example, a newly registered domain categorised as command and control. The block page event reached the SIEM, an analyst isolated the laptop with the EDR console and reimaged it. No data left the company, because the chain broke at C2.</p><p><b>Lesson:</b> the earlier stages can fail, and a later control still saves you. Always ask "if this layer misses, which one catches it next?"</p></div>

<div class="iv"><p class="q">"Walk me through the Cyber Kill Chain and tell me where you would detect a ransomware attack."</p><p>Strong answer: name the seven stages in order, then map controls: email and DNS security at delivery, patching and EDR at exploitation and installation, DNS and NGFW at C2, segmentation and backups at actions. Add that modern ransomware steals data first, so watch for large outbound transfers, and mention that you would tag alerts with ATT&amp;CK techniques for the SOC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kill chain: Recon, Weaponisation, Delivery, Exploitation, Installation, C2, Actions on objectives.</li>
<li>The attacker must win every stage; the defender must break only one.</li>
<li>MITRE ATT&amp;CK: tactics (why), techniques (how, with IDs), procedures (real groups); 14 Enterprise tactics.</li>
<li>IOCs are easy to block but easy to change; behaviour-based detection lasts longer.</li>
<li>Map every control you deploy to the stage it breaks.</li>
</ul></div>
`,hi:`
<p>Chori ek pal ki cheez nahi hoti. Chor kai din ghar ko dekhta hai, tools khareedta hai, ek raat chunta hai, khidki kholta hai, tijori dhoondta hai, keemti saaman bahar le jaata hai aur gaadi se nikal jaata hai. Har step par use rokne ka mauka hota hai: padosi dekhne wale ko notice kare, sensor khidki pakad le, camera gaadi dekh le. Cyber attacks bhi aise hi kaam karte hain. Defenders in steps ke models use karte hain taaki har step par ek control aur ek detection rakh sakein.</p>

<h3>Cyber Kill Chain ke saat stages</h3>
<p>Lockheed Martin ki publish ki hui <b>Cyber Kill Chain</b> intrusion ko saat stages mein baantti hai. Important idea yeh hai ki attacker ko <b>har</b> stage par jeetna padta hai, jabki defender ko chain sirf <b>ek</b> jagah todni hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kill chain ke saat stages">
<rect x="5" y="20" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="47" y="44" text-anchor="middle" class="svg-ink" font-size="12">1 Recon</text><text x="47" y="62" text-anchor="middle" class="svg-muted" font-size="12">research</text>
<rect x="95" y="20" width="84" height="56" rx="8" fill="#e2e8f0"/><text x="137" y="44" text-anchor="middle" class="svg-ink" font-size="12">2 Weaponise</text><text x="137" y="62" text-anchor="middle" class="svg-muted" font-size="12">lure banana</text>
<rect x="185" y="20" width="84" height="56" rx="8" fill="#fde68a"/><text x="227" y="44" text-anchor="middle" class="svg-ink" font-size="12">3 Delivery</text><text x="227" y="62" text-anchor="middle" class="svg-muted" font-size="12">email, web</text>
<rect x="275" y="20" width="84" height="56" rx="8" fill="#fed7aa"/><text x="317" y="44" text-anchor="middle" class="svg-ink" font-size="12">4 Exploit</text><text x="317" y="62" text-anchor="middle" class="svg-muted" font-size="12">code chalta</text>
<rect x="365" y="20" width="84" height="56" rx="8" fill="#fed7aa"/><text x="407" y="44" text-anchor="middle" class="svg-ink" font-size="12">5 Install</text><text x="407" y="62" text-anchor="middle" class="svg-muted" font-size="12">tikna</text>
<rect x="455" y="20" width="84" height="56" rx="8" fill="#ddd6fe"/><text x="497" y="44" text-anchor="middle" class="svg-ink" font-size="12">6 C2</text><text x="497" y="62" text-anchor="middle" class="svg-muted" font-size="12">ghar call</text>
<rect x="545" y="20" width="90" height="56" rx="8" fill="#ddd6fe"/><text x="590" y="44" text-anchor="middle" class="svg-ink" font-size="12">7 Actions</text><text x="590" y="62" text-anchor="middle" class="svg-muted" font-size="12">chori, encrypt</text>
<rect x="5" y="100" width="264" height="46" rx="8" fill="#bbf7d0"/><text x="137" y="128" text-anchor="middle" class="svg-ink" font-size="12">Email security, SWG, DNS security, training</text>
<rect x="275" y="100" width="174" height="46" rx="8" fill="#bbf7d0"/><text x="362" y="128" text-anchor="middle" class="svg-ink" font-size="12">Patching, IPS, EDR</text>
<rect x="455" y="100" width="180" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="128" text-anchor="middle" class="svg-ink" font-size="12">DNS block, NGFW, SIEM, DLP</text>
<text x="320" y="166" text-anchor="middle" class="svg-accent" font-size="12">Koi bhi ek kadi todo aur attack fail</text>
</svg><p class="cap">Saat stages (upar) aur main defensive controls jo chain ke har hisse ko tod sakte hain (neeche).</p></div>

<table class="cmp"><tr><th>Stage</th><th>Kya hota hai (defender ka view)</th><th>Aap kya dekh ya rok sakte ho</th></tr>
<tr><td>1 Reconnaissance</td><td>Attacker aapke baare mein seekhta hai: public staff names, exposed services, DNS records</td><td>Jo exposed hai use kam karo; firewall logs mein scans dekho</td></tr>
<tr><td>2 Weaponisation</td><td>Ek lure tayyar hota hai, jaise document ya fake login page</td><td>Attacker ki side par hota hai; threat intelligence aapko warn kar sakti hai</td></tr>
<tr><td>3 Delivery</td><td>Lure user tak pahunchta hai: email, malicious website, USB, exposed service</td><td>Email security, secure web gateway, DNS security, user training</td></tr>
<tr><td>4 Exploitation</td><td>Vulnerability ya insaani galti se code chalta hai ya password capture hota hai</td><td>Patching, IPS signatures, EDR, MFA</td></tr>
<tr><td>5 Installation</td><td>Attacker foothold ko reboot ke baad bhi zinda rakhta hai (persistence)</td><td>EDR behaviour detection, application control</td></tr>
<tr><td>6 Command and control (C2)</td><td>Infected host instructions ke liye attacker ke server ko call karta hai</td><td>DNS security, NGFW Security Intelligence, NetFlow anomalies</td></tr>
<tr><td>7 Actions on objectives</td><td>Data chori, ransomware encryption, fraud, aur hosts tak lateral movement</td><td>Segmentation, DLP, SIEM correlation, backups</td></tr>
</table>

<h3>MITRE ATT&amp;CK: detailed dictionary</h3>
<p>Kill chain ek simple kahani hai. <b>MITRE ATT&amp;CK</b> (Adversarial Tactics, Techniques and Common Knowledge) real intrusions se bana ek free, detailed knowledge base hai. Yeh teen levels mein organised hai:</p>
<ul>
<li><b>Tactics</b>: us pal attacker ka goal, yaani "kyun". Enterprise matrix mein 14 tactics hain: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration aur Impact.</li>
<li><b>Techniques aur sub-techniques</b>: "kaise", har ek ka ID jaise T1566 (Phishing) ya T1071 (Application Layer Protocol, C2 ke liye use hota hai).</li>
<li><b>Procedures</b>: kisi specific group ne asal mein kaise kiya.</li>
</ul>
<p>Inhe saath mein <b>TTPs</b> kehte hain. SOC tools, Cisco XDR aur Splunk detections samet, apne alerts ko ATT&amp;CK technique IDs se tag karte hain taaki analysts ko turant pata chale ki woh attack ke kis hisse ko dekh rahe hain.</p>
<p>ATT&amp;CK stage-by-stage sequence nahi hai. Real attackers loop karte hain: discovery, credential access aur lateral movement network ke andar kai baar repeat hote hain. Isiliye ATT&amp;CK ek matrix hai, line nahi.</p>

<h3>Indicators: IOC versus IOA</h3>
<p><b>Indicator of compromise (IOC)</b> is baat ka saboot hai ki kuch bura ho chuka hai: known malicious file hash, C2 domain, attacker IP. <b>Indicator of attack (IOA)</b> chal rahe behaviour ko describe karta hai: office program ka script interpreter launch karna, ek workstation ka ek minute mein pachaas servers par login karna. IOCs share aur block karna aasaan hai lekin attackers ke liye badalna bhi aasaan hai; behaviour badalna unke liye bahut mushkil hai. Is "pyramid" par jitna upar aap detect karte ho, hashes aur IPs se TTPs tak, attacker ko aapse bachne mein utna zyada kharcha hota hai.</p>

<div class="eg"><p><b>Worked example: ek phishing attack map kiya.</b> Attacker ek public site par staff emails dhoondta hai (Recon, TA0043). Finance ko ek fake invoice link bheja jaata hai (Initial Access, T1566 Phishing). User use kholta hai aur look-alike page par apna password daalta hai (Credential Access). Attacker videsh se webmail mein login karta hai aur inbox forwarding rule banata hai (Persistence, Collection). Defender kai points par chain todta hai: email security look-alike domain ko flag karti hai, DNS security use block karti hai, MFA login rokta hai, aur SIEM naye forwarding rule par alert karta hai. Inmein se koi ek bhi kaafi hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh sochna ki kill chain sab kuch cover karti hai; yeh external intrusion describe karti hai aur insider threats aur cloud account abuse par theek se fit nahi hoti. ATT&amp;CK ko "poora karne" wali checklist samajhna; yeh detection ke gaps dhoondne ka map hai. Sirf IOCs block karna: kal ka IP parson bekaar hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jaano ki kaunsa control kis stage ko address karta hai. DNS security delivery (bura link) <i>aur</i> C2 (ghar call) dono rokti hai. EDR exploitation aur installation rokta hai. DLP actions on objectives par kaam karta hai. Aur yaad rakho: tactic = kyun, technique = kaise.</p></div>

<div class="scn"><h4>Stage chhe par pakda gaya</h4><p>Ek marketing laptop ne fake "codec update" khola aur infect ho gaya; antivirus signature abhi available nahi thi. Do ghante baad DNS security service ne laptop ki cdn-stats.example ki queries block ki, ek naya registered domain jo command and control ke roop mein categorised tha. Block page event SIEM tak pahuncha, ek analyst ne EDR console se laptop isolate kiya aur use reimage kiya. Koi data company se bahar nahi gaya, kyunki chain C2 par toot gayi.</p><p><b>Seekh:</b> pehle ke stages fail ho sakte hain, aur baad ka control phir bhi aapko bacha leta hai. Hamesha poocho "agar yeh layer miss kare, to agla kaun pakdega?"</p></div>

<div class="iv"><p class="q">"Cyber Kill Chain samjhao aur batao aap ransomware attack kahan detect karoge."</p><p>Strong answer: saat stages order mein batao, phir controls map karo: delivery par email aur DNS security, exploitation aur installation par patching aur EDR, C2 par DNS aur NGFW, actions par segmentation aur backups. Jodo ki modern ransomware pehle data churata hai, isliye bade outbound transfers dekho, aur batao ki aap SOC ke liye alerts ko ATT&amp;CK techniques se tag karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kill chain: Recon, Weaponisation, Delivery, Exploitation, Installation, C2, Actions on objectives.</li>
<li>Attacker ko har stage jeetni padti hai; defender ko sirf ek todni hai.</li>
<li>MITRE ATT&amp;CK: tactics (kyun), techniques (kaise, IDs ke saath), procedures (real groups); 14 Enterprise tactics.</li>
<li>IOCs block karna aasaan hai lekin badalna bhi aasaan; behaviour-based detection zyada der tikta hai.</li>
<li>Jo bhi control aap deploy karo, use us stage se map karo jise woh todta hai.</li>
</ul></div>
`}};export{e as default};