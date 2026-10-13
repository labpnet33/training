var e={id:`threats`,h:{en:`Common threats: on-premises, hybrid and cloud`,hi:`Common threats: on-premises, hybrid aur cloud`},body:{en:`
<p>A doctor cannot treat an illness she cannot name. A security engineer is the same: before you pick a control, you must recognise the attack from its symptoms. This chapter covers every threat in SCOR blueprint item 1.1 at the level a defender needs: <b>what happens, why it works, what you would see, and what stops it</b>.</p>

<h3>First, the vocabulary</h3>
<dl class="terms">
<dt>Asset</dt><dd>Anything of value: data, a server, a service, a reputation.</dd>
<dt>Vulnerability</dt><dd>A weakness in software, configuration or process (chapter 3).</dd>
<dt>Threat</dt><dd>Someone or something that could use the weakness: a criminal group, an insider, a piece of malware.</dd>
<dt>Exploit</dt><dd>The method or code that actually uses the vulnerability.</dd>
<dt>Risk</dt><dd>Likelihood multiplied by impact. You reduce risk; you rarely remove it.</dd>
<dt>Indicator of compromise (IOC)</dt><dd>Evidence that an attack happened: a bad file hash, a malicious domain, an odd login.</dd>
</dl>

<h3>Malicious software (malware)</h3>
<table class="cmp"><tr><th>Type</th><th>How it spreads or behaves</th><th>Defender clue</th></tr>
<tr><td><b>Virus</b></td><td>Attaches to a legitimate file and runs when a user opens it. Needs a human action to spread.</td><td>Modified executables or documents, endpoint alerts</td></tr>
<tr><td><b>Worm</b></td><td>Spreads by itself across the network through a vulnerable service, no user action needed.</td><td>Sudden scanning of one port across many hosts</td></tr>
<tr><td><b>Trojan</b></td><td>Pretends to be useful software (a free tool, a fake update) and hides a malicious payload.</td><td>New unknown process calling out to the internet</td></tr>
<tr><td><b>Rootkit</b></td><td>Hides itself deep in the operating system (kernel, boot loader) so normal tools cannot see it; keeps privileged access.</td><td>Tampered system files, integrity or boot check failures</td></tr>
<tr><td><b>Ransomware</b></td><td>Encrypts files and demands payment; modern groups also steal data first.</td><td>Mass file renames, ransom notes, backup deletion attempts</td></tr>
<tr><td><b>Spyware / keylogger</b></td><td>Records activity and credentials.</td><td>Unexpected outbound uploads</td></tr>
</table>
<p>Almost all modern malware "phones home" to a <b>command-and-control (C2)</b> server. That is great news for network defenders: the firewall, DNS security and IPS can see and block that call even when the endpoint missed the infection.</p>

<h3>Social engineering: phishing and its cousins</h3>
<p><b>Phishing</b> is a message that tricks a person into clicking a link, opening an attachment or typing a password on a fake page. <b>Spear phishing</b> targets one person with researched details; <b>whaling</b> targets executives; <b>vishing</b> uses voice calls and <b>smishing</b> uses SMS. It works because it attacks people, not software. Defences: email security with link and attachment analysis, DNS-layer blocking of new or malicious domains, multi-factor authentication so a stolen password alone is useless, and user training.</p>

<h3>Denial of service: DoS and DDoS</h3>
<p>A <b>DoS</b> attack makes a service unavailable. A <b>DDoS</b> does it from thousands of sources at once, usually a botnet of infected devices. Three families:</p>
<ul>
<li><b>Volumetric:</b> fill the internet link with traffic (often reflected and amplified through open DNS or NTP servers).</li>
<li><b>Protocol / state exhaustion:</b> fill the connection table of a server or firewall, for example a <b>SYN flood</b> that opens half-open TCP sessions and never completes them.</li>
<li><b>Application layer:</b> expensive requests (searches, logins) that look legitimate but exhaust the application.</li>
</ul>
<p>A firewall protects itself and the servers behind it against state exhaustion with embryonic connection limits and TCP intercept or SYN cookies. Volumetric attacks bigger than your link must be scrubbed upstream by the ISP or a cloud DDoS service; no box at your edge can fix a full pipe.</p>

<h3>Man-in-the-middle (on-path) attacks</h3>
<p>The attacker places himself between two parties and reads or changes traffic. On a LAN this is usually <b>ARP spoofing</b> or a rogue DHCP server; on Wi-Fi a fake access point. Symptom: two IP addresses resolving to the same MAC, certificate warnings in browsers. Defences: encryption with certificate validation (TLS, IPsec), Dynamic ARP Inspection and DHCP snooping on switches (module sec-infra), 802.1X.</p>

<h3>Web application attacks: SQL injection and XSS</h3>
<p><b>SQL injection</b> happens when an application builds a database query by gluing user input into it. Specially crafted input changes the meaning of the query, so the attacker can read or change data he should never see. Defence: parameterised queries (prepared statements), input validation, least-privilege database accounts, and a WAF or IPS signatures in front. <b>Cross-site scripting (XSS)</b> happens when an application puts user input into a web page without encoding it, so script supplied by the attacker runs in <i>other users'</i> browsers and can steal their session. Defence: output encoding, input validation, Content Security Policy, and WAF rules.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Where threats land">
<rect x="10" y="20" width="190" height="160" rx="10" fill="#bbf7d0"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="14">On-premises</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">virus, worm, trojan</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">rootkit, ransomware</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">phishing, MITM</text><text x="105" y="136" text-anchor="middle" class="svg-muted" font-size="12">SQLi, XSS, DoS</text>
<rect x="225" y="60" width="190" height="80" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">Hybrid links</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">lateral movement path</text>
<rect x="440" y="20" width="190" height="160" rx="10" fill="#bae6fd"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="14">Cloud</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">data breaches</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">insecure APIs</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">stolen credentials</text><text x="535" y="136" text-anchor="middle" class="svg-muted" font-size="12">DoS / DDoS</text>
<line x1="200" y1="100" x2="225" y2="100" stroke="#64748b"/><line x1="415" y1="100" x2="440" y2="100" stroke="#64748b"/>
</svg><p class="cap">SCOR 1.1 groups threats by environment. The hybrid link joins them, so a weakness on one side becomes a path to the other.</p></div>

<h3>Cloud-specific threats</h3>
<p>In the cloud the provider secures the building and hypervisor, but <b>you</b> secure your identities, data and configuration (the shared responsibility model). The big four: <b>compromised credentials</b> (an access key leaked in a code repository), <b>insecure APIs</b> (no authentication, no rate limit, too much data returned), <b>data breaches</b> (usually caused by a misconfigured storage bucket or over-permissive role) and <b>DoS/DDoS</b> against public endpoints, which can also create a huge bill.</p>

<div class="eg"><p><b>Worked example: reading the symptoms.</b> The firewall log shows host 10.0.1.23 making a DNS query for a random-looking domain every 60 seconds, followed by a small HTTPS connection to 203.0.113.77. No user is logged in. That regular, small, automatic pattern is a <b>C2 beacon</b>, a strong sign of a trojan. The response: isolate the host, block the domain and IP, and hunt for the same indicators on other hosts.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating every slow website as a DDoS. Check your own link utilisation, the firewall connection count (<code>show conn count</code>) and the source spread first. A single misbehaving backup job can look like an attack.</p></div>

<div class="exam"><p><b>Exam trap.</b> Worm vs virus: a worm self-propagates without user action; a virus needs a host file and a user. A rootkit's defining trait is <b>hiding</b> and keeping privileged access, not encrypting data. XSS runs in the <b>victim's browser</b>; SQL injection runs against the <b>database</b>.</p></div>

<div class="scn"><h4>The invoice that was not an invoice</h4><p>An accounts clerk opened an "overdue invoice" attachment. Nothing visible happened. Two hours later the NGFW's Security Intelligence feed blocked DNS lookups from her laptop to a known C2 domain and raised an alert. The SOC isolated the laptop, found a trojan dropped by a macro, and used the same file hash to confirm no other machine had run it. Email filtering was then tuned to quarantine macro-enabled attachments from outside senders.</p><p><b>Lesson:</b> layered controls work: the phishing got through, but the network caught the call home.</p></div>

<div class="iv"><p class="q">"Explain the difference between a virus, a worm and a trojan."</p><p>A virus infects a host file and spreads when a user runs it. A worm spreads on its own through a network vulnerability. A trojan disguises itself as legitimate software and carries a hidden payload. Add the defender angle: all three usually contact a C2 server, so DNS security, NGFW reputation feeds and endpoint protection together give you several chances to catch them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the vocabulary: asset, vulnerability, threat, exploit, risk, IOC.</li>
<li>Malware types differ in how they spread (virus, worm, trojan) and what they do (rootkit hides, ransomware encrypts).</li>
<li>DoS/DDoS families: volumetric, state exhaustion, application layer; big floods need upstream scrubbing.</li>
<li>MITM, SQL injection and XSS each have a specific defence: encryption plus DAI, parameterised queries, output encoding.</li>
<li>Cloud threats centre on identities, APIs and misconfiguration.</li>
</ul></div>
`,hi:`
<p>Doctor us bimaari ka ilaaj nahi kar sakti jiska woh naam na le sake. Security engineer bhi waisa hi hai: control chunne se pehle aapko attack ko uske symptoms se pehchaanna hoga. Yeh chapter SCOR blueprint item 1.1 ke har threat ko us level par cover karta hai jo defender ko chahiye: <b>kya hota hai, kyun kaam karta hai, aapko kya dikhega, aur kya use rokta hai</b>.</p>

<h3>Pehle, vocabulary</h3>
<dl class="terms">
<dt>Asset</dt><dd>Koi bhi keemti cheez: data, server, service, reputation.</dd>
<dt>Vulnerability</dt><dd>Software, configuration ya process mein kamzori (chapter 3).</dd>
<dt>Threat</dt><dd>Koi vyakti ya cheez jo kamzori ka use kar sake: criminal group, insider, malware ka tukda.</dd>
<dt>Exploit</dt><dd>Woh tareeka ya code jo asal mein vulnerability ka use karta hai.</dd>
<dt>Risk</dt><dd>Likelihood guna impact. Aap risk kam karte ho; use poori tarah hataana kam hi hota hai.</dd>
<dt>Indicator of compromise (IOC)</dt><dd>Saboot ki attack hua: kharab file hash, malicious domain, ajeeb login.</dd>
</dl>

<h3>Malicious software (malware)</h3>
<table class="cmp"><tr><th>Type</th><th>Kaise failta hai ya kya karta hai</th><th>Defender ke liye clue</th></tr>
<tr><td><b>Virus</b></td><td>Kisi legitimate file se chipak jaata hai aur user ke kholne par chalta hai. Failne ke liye insaan ka action chahiye.</td><td>Badli hui executables ya documents, endpoint alerts</td></tr>
<tr><td><b>Worm</b></td><td>Kisi vulnerable service ke through network mein khud fail jaata hai, user action nahi chahiye.</td><td>Achanak bahut saare hosts par ek hi port ki scanning</td></tr>
<tr><td><b>Trojan</b></td><td>Useful software hone ka natak karta hai (free tool, nakli update) aur malicious payload chhupata hai.</td><td>Naya anjaan process jo internet ko call kar raha hai</td></tr>
<tr><td><b>Rootkit</b></td><td>Operating system mein gehrai mein chhup jaata hai (kernel, boot loader) taaki normal tools use dekh na sakein; privileged access banaye rakhta hai.</td><td>Chhede gaye system files, integrity ya boot check failures</td></tr>
<tr><td><b>Ransomware</b></td><td>Files encrypt karke paise maangta hai; modern groups pehle data bhi churaate hain.</td><td>Bahut saari files ka rename, ransom notes, backups delete karne ki koshish</td></tr>
<tr><td><b>Spyware / keylogger</b></td><td>Activity aur credentials record karta hai.</td><td>Unexpected outbound uploads</td></tr>
</table>
<p>Lagbhag har modern malware ek <b>command-and-control (C2)</b> server ko "phone" karta hai. Network defenders ke liye yeh achhi khabar hai: endpoint infection miss kar de tab bhi firewall, DNS security aur IPS us call ko dekh kar block kar sakte hain.</p>

<h3>Social engineering: phishing aur uske rishtedaar</h3>
<p><b>Phishing</b> ek message hai jo insaan ko link click karne, attachment kholne ya nakli page par password type karne mein phansata hai. <b>Spear phishing</b> research kiye gaye details ke saath ek insaan ko target karta hai; <b>whaling</b> executives ko; <b>vishing</b> voice calls use karta hai aur <b>smishing</b> SMS. Yeh isliye kaam karta hai kyunki yeh software par nahi, logon par attack karta hai. Defences: link aur attachment analysis wali email security, naye ya malicious domains ki DNS-layer blocking, multi-factor authentication taaki sirf chori hua password bekaar ho, aur user training.</p>

<h3>Denial of service: DoS aur DDoS</h3>
<p><b>DoS</b> attack ek service ko unavailable bana deta hai. <b>DDoS</b> yahi hazaaron sources se ek saath karta hai, aam taur par infected devices ke botnet se. Teen families:</p>
<ul>
<li><b>Volumetric:</b> internet link ko traffic se bhar do (aksar open DNS ya NTP servers ke through reflect aur amplify karke).</li>
<li><b>Protocol / state exhaustion:</b> server ya firewall ki connection table bhar do, jaise <b>SYN flood</b> jo half-open TCP sessions kholta hai aur kabhi complete nahi karta.</li>
<li><b>Application layer:</b> mehngi requests (searches, logins) jo legitimate dikhti hain lekin application ko thaka deti hain.</li>
</ul>
<p>Firewall state exhaustion se khud ko aur apne peeche ke servers ko embryonic connection limits aur TCP intercept ya SYN cookies se bachata hai. Aapke link se bade volumetric attacks ko ISP ya cloud DDoS service ko upstream scrub karna padta hai; aapke edge ka koi bhi box bhare hue pipe ko theek nahi kar sakta.</p>

<h3>Man-in-the-middle (on-path) attacks</h3>
<p>Attacker khud ko do parties ke beech rakhta hai aur traffic padhta ya badalta hai. LAN par yeh aam taur par <b>ARP spoofing</b> ya rogue DHCP server hota hai; Wi-Fi par nakli access point. Symptom: do IP addresses ek hi MAC par resolve hona, browsers mein certificate warnings. Defences: certificate validation ke saath encryption (TLS, IPsec), switches par Dynamic ARP Inspection aur DHCP snooping (module sec-infra), 802.1X.</p>

<h3>Web application attacks: SQL injection aur XSS</h3>
<p><b>SQL injection</b> tab hota hai jab application user input ko jod kar database query banati hai. Khaas tarah se banaya input query ka matlab badal deta hai, jisse attacker woh data padh ya badal sakta hai jo use kabhi nahi dikhna chahiye. Defence: parameterised queries (prepared statements), input validation, least-privilege database accounts, aur saamne WAF ya IPS signatures. <b>Cross-site scripting (XSS)</b> tab hota hai jab application user input ko bina encode kiye web page mein daal deti hai, isliye attacker ki di hui script <i>doosre users ke</i> browsers mein chalti hai aur unka session chura sakti hai. Defence: output encoding, input validation, Content Security Policy, aur WAF rules.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Threats kahan girte hain">
<rect x="10" y="20" width="190" height="160" rx="10" fill="#bbf7d0"/><text x="105" y="44" text-anchor="middle" class="svg-ink" font-size="14">On-premises</text>
<text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">virus, worm, trojan</text><text x="105" y="92" text-anchor="middle" class="svg-muted" font-size="12">rootkit, ransomware</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">phishing, MITM</text><text x="105" y="136" text-anchor="middle" class="svg-muted" font-size="12">SQLi, XSS, DoS</text>
<rect x="225" y="60" width="190" height="80" rx="10" fill="#fde68a"/><text x="320" y="88" text-anchor="middle" class="svg-ink" font-size="14">Hybrid links</text><text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">lateral movement ka raasta</text>
<rect x="440" y="20" width="190" height="160" rx="10" fill="#bae6fd"/><text x="535" y="44" text-anchor="middle" class="svg-ink" font-size="14">Cloud</text>
<text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">data breaches</text><text x="535" y="92" text-anchor="middle" class="svg-muted" font-size="12">insecure APIs</text><text x="535" y="114" text-anchor="middle" class="svg-muted" font-size="12">chori hue credentials</text><text x="535" y="136" text-anchor="middle" class="svg-muted" font-size="12">DoS / DDoS</text>
<line x1="200" y1="100" x2="225" y2="100" stroke="#64748b"/><line x1="415" y1="100" x2="440" y2="100" stroke="#64748b"/>
</svg><p class="cap">SCOR 1.1 threats ko environment ke hisaab se group karta hai. Hybrid link unhe jodta hai, isliye ek taraf ki kamzori doosri taraf ka raasta ban jaati hai.</p></div>

<h3>Cloud-specific threats</h3>
<p>Cloud mein provider building aur hypervisor secure karta hai, lekin apni identities, data aur configuration <b>aap</b> secure karte ho (shared responsibility model). Bade chaar: <b>compromised credentials</b> (code repository mein leak hui access key), <b>insecure APIs</b> (koi authentication nahi, koi rate limit nahi, zaroorat se zyada data return), <b>data breaches</b> (aam taur par misconfigured storage bucket ya over-permissive role ki wajah se) aur public endpoints par <b>DoS/DDoS</b>, jo bahut bada bill bhi bana sakta hai.</p>

<div class="eg"><p><b>Worked example: symptoms padhna.</b> Firewall log dikhata hai ki host 10.0.1.23 har 60 second mein ek random-looking domain ke liye DNS query karta hai, uske baad 203.0.113.77 ko ek chhota HTTPS connection. Koi user logged in nahi hai. Yeh regular, chhota, automatic pattern <b>C2 beacon</b> hai, trojan ka strong sign. Response: host isolate karo, domain aur IP block karo, aur doosre hosts par wahi indicators hunt karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Har slow website ko DDoS maan lena. Pehle apna link utilisation, firewall connection count (<code>show conn count</code>) aur sources ka failaav check karo. Ek bigda hua backup job bhi attack jaisa dikh sakta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Worm vs virus: worm bina user action ke khud failta hai; virus ko host file aur user chahiye. Rootkit ki pehchaan hai <b>chhupna</b> aur privileged access banaye rakhna, data encrypt karna nahi. XSS <b>victim ke browser</b> mein chalta hai; SQL injection <b>database</b> ke khilaaf chalta hai.</p></div>

<div class="scn"><h4>Woh invoice jo invoice nahi tha</h4><p>Ek accounts clerk ne "overdue invoice" attachment khola. Kuch dikha nahi. Do ghante baad NGFW ki Security Intelligence feed ne uske laptop se ek known C2 domain ke DNS lookups block kiye aur alert raise kiya. SOC ne laptop isolate kiya, macro se giraya gaya trojan dhoondha, aur usi file hash se confirm kiya ki kisi aur machine ne use nahi chalaya. Phir email filtering ko tune kiya gaya taaki bahar ke senders ke macro-enabled attachments quarantine hon.</p><p><b>Seekh:</b> layered controls kaam karte hain: phishing andar aa gaya, lekin network ne ghar ki call pakad li.</p></div>

<div class="iv"><p class="q">"Virus, worm aur trojan mein farak samjhao."</p><p>Virus ek host file ko infect karta hai aur user ke chalane par failta hai. Worm network vulnerability ke through khud failta hai. Trojan legitimate software ka bhes banata hai aur chhupa payload le kar chalta hai. Defender angle jodo: teeno aam taur par C2 server se contact karte hain, isliye DNS security, NGFW reputation feeds aur endpoint protection milkar aapko unhe pakadne ke kai mauke dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Vocabulary jaano: asset, vulnerability, threat, exploit, risk, IOC.</li>
<li>Malware types is baat mein alag hain ki kaise failte hain (virus, worm, trojan) aur kya karte hain (rootkit chhupta hai, ransomware encrypt karta hai).</li>
<li>DoS/DDoS families: volumetric, state exhaustion, application layer; bade floods ko upstream scrubbing chahiye.</li>
<li>MITM, SQL injection aur XSS ka har ek ka specific defence hai: encryption plus DAI, parameterised queries, output encoding.</li>
<li>Cloud threats identities, APIs aur misconfiguration ke aas-paas ghoomte hain.</li>
</ul></div>
`}};export{e as default};