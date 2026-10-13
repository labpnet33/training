var e={id:`actors`,h:{en:`Threat actors and common attack types, at recognition level`,hi:`Threat actors aur common attack types, pehchaan ke level par`},body:{en:`
<p>A good doctor does not need to know how to make a virus to recognise the flu: the symptoms, the test and the treatment are enough. A defender is the same. You need to recognise an attack from its symptoms, know why it works, know the indicators in your logs and know which control stops it. This chapter is a field guide at exactly that level. The CCNA covered the basic names; here we add the defender's view and the modern attacks that SCOR v2.0 expects.</p>

<h3>Who attacks, and why</h3>
<table class="cmp"><tr><th>Actor</th><th>Motivation</th><th>Typical behaviour</th></tr>
<tr><td><b>Cybercriminals and ransomware groups</b></td><td>Money</td><td>Phishing, stolen credentials, ransomware with data theft, business email compromise; often buy access from "initial access brokers"</td></tr>
<tr><td><b>Nation-state groups (APTs)</b></td><td>Espionage, disruption</td><td>Patient, well funded, custom tools, long dwell time; target government, defence, telecom, critical infrastructure</td></tr>
<tr><td><b>Hacktivists</b></td><td>Ideology, publicity</td><td>DDoS, website defacement, leaking data</td></tr>
<tr><td><b>Insiders</b></td><td>Revenge, money, or simple mistakes</td><td>Misuse of legitimate access; careless insiders cause many incidents without any bad intent</td></tr>
<tr><td><b>Unskilled attackers</b></td><td>Curiosity, reputation</td><td>Run public tools and scanners against anything exposed</td></tr>
</table>
<p>An <b>APT</b> (advanced persistent threat) is a group that stays hidden inside a network for a long time. The time between the first compromise and detection is called <b>dwell time</b>; reducing it is one of the main goals of a SOC.</p>
<p><b>The ransomware economy.</b> Ransomware today is an industry with specialised roles. <b>Initial access brokers</b> break in (often with stolen VPN or RDP credentials) and sell that access. <b>Ransomware as a service (RaaS)</b> operators build the malware, the leak site and the payment system, and rent them to <b>affiliates</b>, who run the intrusion and share the ransom. <b>Double extortion</b> adds data theft before encryption, so the victim is threatened with a leak even if backups work. For defenders this means the attack usually takes days, not minutes: there are many chances to detect the stolen login, the lateral movement and the large upload before encryption starts.</p>

<h3>Social engineering and phishing</h3>
<p>Most breaches start with a human, not a zero-day. <b>Phishing</b> is a fraudulent message that tricks a user into clicking, opening or giving away credentials. Variants: <b>spear phishing</b> (targeted at one person), <b>whaling</b> (executives), <b>smishing</b> (SMS), <b>vishing</b> (voice calls, now sometimes with AI-cloned voices), <b>quishing</b> (QR codes). <b>Business email compromise (BEC)</b> uses a real or look-alike mailbox to request a payment or bank-detail change, often with no malware at all. SCOR topic 1.4 asks for the controls: email authentication (SPF, DKIM, DMARC), email security gateways with URL rewriting and sandboxing, DNS security, MFA, awareness training and a simple way to report suspicious mail.</p>

<h3>Malware families</h3>
<dl class="terms">
<dt>Virus / worm</dt><dd>A virus needs a user or host program to spread; a worm spreads by itself across the network through a vulnerability. Segmentation and patching limit worms.</dd>
<dt>Trojan</dt><dd>Looks legitimate (a "free codec", a cracked tool) but carries a malicious payload.</dd>
<dt>Ransomware</dt><dd>Encrypts files and demands payment; modern groups steal data first (double extortion). Offline backups and EDR are the key controls.</dd>
<dt>Spyware, keyloggers, infostealers</dt><dd>Collect data and saved passwords from the endpoint.</dd>
<dt>Rootkit</dt><dd>Hides deep in the operating system to avoid detection.</dd>
<dt>Botnet</dt><dd>Many infected hosts controlled through C2, used for DDoS, spam or credential attacks.</dd>
<dt>Fileless malware</dt><dd>Runs in memory using built-in tools, leaving few files; detected by behaviour (EDR), not signatures.</dd>
</dl>

<h3>Credential and web attacks</h3>
<p><b>Brute force</b> tries many passwords against one account. <b>Password spraying</b> tries one common password against many accounts, staying below lockout thresholds. <b>Credential stuffing</b> replays username and password pairs leaked from other sites. All three are stopped mostly by MFA, lockout and rate limits, and banned-password lists.</p>
<p>Web application attacks appear in the <b>OWASP Top 10</b>. At recognition level: <b>SQL injection</b> (input changes a database query), <b>cross-site scripting (XSS)</b> (a page returns attacker-supplied script to other users), broken access control and security misconfiguration. Controls: secure coding, input validation, a web application firewall (WAF) and IPS signatures. The later "modern threats" module covers OWASP and CVSS scoring in more depth.</p>

<h3>Network attacks</h3>
<ul>
<li><b>DoS and DDoS</b>: exhaust bandwidth, state tables or application resources. Controls: upstream scrubbing, rate limits, firewall connection limits, SYN cookies.</li>
<li><b>Man-in-the-middle and spoofing</b>: ARP spoofing, rogue DHCP, rogue access points. Controls: DAI, DHCP snooping, 802.1X, encryption (the Layer 2 security module).</li>
<li><b>DNS abuse</b>: DNS tunnelling to hide data inside queries, domain generation algorithms (DGA) with random-looking names, typosquatting domains such as nwkings-payro11.example.</li>
<li><b>Exploiting exposed services</b>: unpatched VPN gateways, RDP or management interfaces on the internet.</li>
</ul>

<h3>AI and LLM threats (SCOR 1.3)</h3>
<p>Companies now connect large language models to their data and tools, which creates new weaknesses: <b>prompt injection</b> (instructions hidden in input or in a document make the model ignore its rules), <b>sensitive information disclosure</b> (the model reveals confidential data it can access), <b>training data poisoning</b>, <b>insecure output handling</b> (model output used without validation) and <b>excessive agency</b> (the model can take actions it should not). Attackers also use AI to write better phishing. Controls include AI guardrails and DLP in Secure Access, least privilege for AI tools and human approval for risky actions.</p>

<pre class="out">Sep 30 02:14:07 jump1 sshd[2211]: Failed password for invalid user admin from 203.0.113.45 port 51122 ssh2
Sep 30 02:14:09 jump1 sshd[2213]: Failed password for invalid user test from 203.0.113.45 port 51130 ssh2
Sep 30 02:14:12 jump1 sshd[2215]: Failed password for ravi from 203.0.113.45 port 51141 ssh2
Sep 30 02:14:15 jump1 sshd[2217]: Failed password for priya from 203.0.113.45 port 51150 ssh2
<span class="hl">Sep 30 02:14:18 jump1 sshd[2219]: Failed password for anita from 203.0.113.45 port 51163 ssh2</span></pre>
<p>One source, many different usernames, one attempt each, a few seconds apart: the signature of <b>password spraying</b>, not a user who forgot a password. The fix is not only blocking 203.0.113.45 (the attacker will change IP); it is removing SSH exposure to the internet and enforcing key-based login or MFA.</p>

<div class="eg"><p><b>Worked example.</b> The finance team receives an email from "ceo@nwkings-group.example" asking to change a supplier's bank account urgently. No attachment, no link. Recognition: BEC with a look-alike domain. Indicators: new sender domain, urgency, payment change. Controls: DMARC on your own domain (stops exact spoofing), external-sender banner, look-alike domain detection in email security, and a finance process that verifies bank changes by phone.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Assuming antivirus stops phishing (BEC has no malware). Thinking MFA makes phishing harmless: push-fatigue and adversary-in-the-middle kits can still steal sessions, so use phishing-resistant MFA where possible. Blocking an attacker IP and closing the ticket without fixing the exposure.</p></div>

<div class="exam"><p><b>Exam trap.</b> Spraying = one password, many users. Stuffing = leaked pairs from other breaches. Brute force = many passwords, one user. Worm spreads by itself; virus needs a host. SPF lists allowed sending servers, DKIM signs the message, DMARC tells receivers what to do when they fail.</p></div>

<div class="scn"><h4>The invoice that was real, from a mailbox that was not</h4><p>A supplier's genuine mailbox was compromised. The attacker replied inside an existing email thread with "our bank details have changed". Because the domain was real, SPF, DKIM and DMARC all passed. The payment was almost made; a finance clerk followed the call-back policy, phoned the supplier on a known number and discovered the fraud. The security team then added an email security rule to flag messages that mention bank-detail changes from external senders.</p><p><b>Lesson:</b> technical controls and business processes work together. Authentication proves the mailbox, not the honesty of whoever controls it.</p></div>

<div class="iv"><p class="q">"What is the difference between phishing, spear phishing and business email compromise, and how do you defend against each?"</p><p>Strong answer: phishing is broad and untargeted; spear phishing targets a specific person with researched details; BEC abuses a real or look-alike mailbox to cause a payment or data change, often without malware or links. Defences: email security with URL and attachment analysis, SPF/DKIM/DMARC, DNS security, phishing-resistant MFA, user reporting and a verification process for payments.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know actors by motivation: criminals (money), nation-states (espionage), hacktivists, insiders.</li>
<li>Most breaches start with phishing or stolen credentials; BEC may contain no malware.</li>
<li>Recognise malware types, credential attacks (brute force, spraying, stuffing) and web and network attacks.</li>
<li>SCOR v2.0 includes AI/LLM threats such as prompt injection and data disclosure.</li>
<li>For every attack, know the indicator in the logs and the control that stops it.</li>
</ul></div>
`,hi:`
<p>Ek achhe doctor ko flu pehchaanne ke liye virus banana nahi aana chahiye: symptoms, test aur treatment kaafi hain. Defender bhi aisa hi hai. Aapko attack ko uske symptoms se pehchaanna hai, jaanna hai ki woh kaam kyun karta hai, aapke logs mein uske indicators kya hain aur kaunsa control use rokta hai. Yeh chapter bilkul usi level ki field guide hai. CCNA ne basic naam cover kiye the; yahan hum defender ka view aur woh modern attacks jodte hain jo SCOR v2.0 expect karta hai.</p>

<h3>Kaun attack karta hai, aur kyun</h3>
<table class="cmp"><tr><th>Actor</th><th>Motivation</th><th>Typical behaviour</th></tr>
<tr><td><b>Cybercriminals aur ransomware groups</b></td><td>Paisa</td><td>Phishing, chori hue credentials, data chori ke saath ransomware, business email compromise; aksar "initial access brokers" se access khareedte hain</td></tr>
<tr><td><b>Nation-state groups (APTs)</b></td><td>Jaasoosi, disruption</td><td>Sabr wale, achhi funding, custom tools, lamba dwell time; government, defence, telecom, critical infrastructure target karte hain</td></tr>
<tr><td><b>Hacktivists</b></td><td>Ideology, publicity</td><td>DDoS, website defacement, data leak</td></tr>
<tr><td><b>Insiders</b></td><td>Badla, paisa, ya simple galtiyan</td><td>Legitimate access ka misuse; laaparwah insiders bina kisi buri niyat ke bhi bahut incidents karte hain</td></tr>
<tr><td><b>Unskilled attackers</b></td><td>Curiosity, reputation</td><td>Jo bhi exposed hai uske against public tools aur scanners chalate hain</td></tr>
</table>
<p><b>APT</b> (advanced persistent threat) ek aisa group hai jo network ke andar lambe samay tak chhupa rehta hai. Pehle compromise aur detection ke beech ke time ko <b>dwell time</b> kehte hain; ise kam karna SOC ka ek main goal hai.</p>
<p><b>Ransomware economy.</b> Aaj ransomware specialised roles wali ek industry hai. <b>Initial access brokers</b> andar ghuste hain (aksar chori hue VPN ya RDP credentials se) aur woh access bechte hain. <b>Ransomware as a service (RaaS)</b> operators malware, leak site aur payment system banate hain, aur unhe <b>affiliates</b> ko kiraye par dete hain, jo intrusion chalate hain aur ransom share karte hain. <b>Double extortion</b> encryption se pehle data theft jodta hai, taaki backups kaam karein tab bhi victim ko leak ki dhamki di ja sake. Defenders ke liye iska matlab hai ki attack aam taur par minutes nahi, din leta hai: encryption shuru hone se pehle chori hue login, lateral movement aur bade upload ko detect karne ke bahut mauke hote hain.</p>

<h3>Social engineering aur phishing</h3>
<p>Zyada tar breaches insaan se shuru hote hain, zero-day se nahi. <b>Phishing</b> ek fraudulent message hai jo user ko click karne, kholne ya credentials dene ke liye bewakoof banata hai. Variants: <b>spear phishing</b> (ek insaan par targeted), <b>whaling</b> (executives), <b>smishing</b> (SMS), <b>vishing</b> (voice calls, ab kabhi kabhi AI-cloned voices ke saath), <b>quishing</b> (QR codes). <b>Business email compromise (BEC)</b> ek real ya look-alike mailbox use karke payment ya bank-detail change maangta hai, aksar bina kisi malware ke. SCOR topic 1.4 controls poochta hai: email authentication (SPF, DKIM, DMARC), URL rewriting aur sandboxing wale email security gateways, DNS security, MFA, awareness training aur suspicious mail report karne ka simple tareeka.</p>

<h3>Malware families</h3>
<dl class="terms">
<dt>Virus / worm</dt><dd>Virus ko failne ke liye user ya host program chahiye; worm vulnerability ke through network par khud fail jaata hai. Segmentation aur patching worms ko limit karte hain.</dd>
<dt>Trojan</dt><dd>Legitimate dikhta hai ("free codec", cracked tool) lekin malicious payload le kar aata hai.</dd>
<dt>Ransomware</dt><dd>Files encrypt karke payment maangta hai; modern groups pehle data churaate hain (double extortion). Offline backups aur EDR key controls hain.</dd>
<dt>Spyware, keyloggers, infostealers</dt><dd>Endpoint se data aur saved passwords ikattha karte hain.</dd>
<dt>Rootkit</dt><dd>Detection se bachne ke liye operating system mein gehraai mein chhupta hai.</dd>
<dt>Botnet</dt><dd>C2 se control hone wale bahut saare infected hosts, DDoS, spam ya credential attacks ke liye use hote hain.</dd>
<dt>Fileless malware</dt><dd>Built-in tools use karke memory mein chalta hai, kam files chhodta hai; behaviour (EDR) se detect hota hai, signatures se nahi.</dd>
</dl>

<h3>Credential aur web attacks</h3>
<p><b>Brute force</b> ek account par bahut saare passwords try karta hai. <b>Password spraying</b> bahut saare accounts par ek common password try karta hai, lockout thresholds ke neeche reh kar. <b>Credential stuffing</b> doosri sites se leak hue username aur password pairs replay karta hai. Teeno zyada tar MFA, lockout aur rate limits, aur banned-password lists se rukte hain.</p>
<p>Web application attacks <b>OWASP Top 10</b> mein aate hain. Pehchaan ke level par: <b>SQL injection</b> (input database query badal deta hai), <b>cross-site scripting (XSS)</b> (page attacker ka diya hua script doosre users ko lauta deta hai), broken access control aur security misconfiguration. Controls: secure coding, input validation, web application firewall (WAF) aur IPS signatures. Baad wala "modern threats" module OWASP aur CVSS scoring ko aur gehraai se cover karta hai.</p>

<h3>Network attacks</h3>
<ul>
<li><b>DoS aur DDoS</b>: bandwidth, state tables ya application resources khatam karna. Controls: upstream scrubbing, rate limits, firewall connection limits, SYN cookies.</li>
<li><b>Man-in-the-middle aur spoofing</b>: ARP spoofing, rogue DHCP, rogue access points. Controls: DAI, DHCP snooping, 802.1X, encryption (Layer 2 security module).</li>
<li><b>DNS abuse</b>: queries ke andar data chhupane ke liye DNS tunnelling, random dikhne wale naamon ke saath domain generation algorithms (DGA), typosquatting domains jaise nwkings-payro11.example.</li>
<li><b>Exposed services exploit karna</b>: unpatched VPN gateways, internet par RDP ya management interfaces.</li>
</ul>

<h3>AI aur LLM threats (SCOR 1.3)</h3>
<p>Companies ab large language models ko apne data aur tools se jodti hain, jisse nayi kamzoriyan banti hain: <b>prompt injection</b> (input ya document mein chhupe instructions model ko uske rules ignore karwa dete hain), <b>sensitive information disclosure</b> (model woh confidential data bata deta hai jise woh access kar sakta hai), <b>training data poisoning</b>, <b>insecure output handling</b> (model output bina validation ke use hota hai) aur <b>excessive agency</b> (model aise actions le sakta hai jo use nahi lene chahiye). Attackers behtar phishing likhne ke liye bhi AI use karte hain. Controls mein Secure Access mein AI guardrails aur DLP, AI tools ke liye least privilege aur risky actions ke liye human approval shaamil hain.</p>

<pre class="out">Sep 30 02:14:07 jump1 sshd[2211]: Failed password for invalid user admin from 203.0.113.45 port 51122 ssh2
Sep 30 02:14:09 jump1 sshd[2213]: Failed password for invalid user test from 203.0.113.45 port 51130 ssh2
Sep 30 02:14:12 jump1 sshd[2215]: Failed password for ravi from 203.0.113.45 port 51141 ssh2
Sep 30 02:14:15 jump1 sshd[2217]: Failed password for priya from 203.0.113.45 port 51150 ssh2
<span class="hl">Sep 30 02:14:18 jump1 sshd[2219]: Failed password for anita from 203.0.113.45 port 51163 ssh2</span></pre>
<p>Ek source, bahut saare alag usernames, har ek par ek attempt, kuch seconds ke antar par: yeh <b>password spraying</b> ka signature hai, kisi user ka password bhoolna nahi. Fix sirf 203.0.113.45 block karna nahi hai (attacker IP badal dega); fix hai SSH ka internet exposure hatana aur key-based login ya MFA enforce karna.</p>

<div class="eg"><p><b>Worked example.</b> Finance team ko "ceo@nwkings-group.example" se email aata hai jo urgently ek supplier ka bank account badalne ko kehta hai. Koi attachment nahi, koi link nahi. Pehchaan: look-alike domain ke saath BEC. Indicators: naya sender domain, urgency, payment change. Controls: apne domain par DMARC (exact spoofing rokta hai), external-sender banner, email security mein look-alike domain detection, aur ek finance process jo bank changes ko phone se verify kare.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maan lena ki antivirus phishing rokta hai (BEC mein malware nahi hota). Yeh sochna ki MFA phishing ko harmless bana deta hai: push-fatigue aur adversary-in-the-middle kits phir bhi sessions chura sakte hain, isliye jahan ho sake phishing-resistant MFA use karo. Attacker IP block karke exposure fix kiye bina ticket band kar dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Spraying = ek password, bahut users. Stuffing = doosre breaches se leak hue pairs. Brute force = bahut passwords, ek user. Worm khud failta hai; virus ko host chahiye. SPF allowed sending servers list karta hai, DKIM message sign karta hai, DMARC receivers ko batata hai ki fail hone par kya karna hai.</p></div>

<div class="scn"><h4>Invoice asli tha, mailbox nahi</h4><p>Ek supplier ka genuine mailbox compromise ho gaya. Attacker ne ek existing email thread ke andar reply kiya "hamare bank details badal gaye hain". Kyunki domain asli tha, SPF, DKIM aur DMARC sab pass hue. Payment lagbhag ho gaya tha; ek finance clerk ne call-back policy follow ki, supplier ko ek known number par phone kiya aur fraud pakda. Security team ne phir ek email security rule joda jo external senders ke bank-detail changes mention karne wale messages ko flag kare.</p><p><b>Seekh:</b> technical controls aur business processes saath kaam karte hain. Authentication mailbox ko prove karta hai, use control karne wale ki imaandari ko nahi.</p></div>

<div class="iv"><p class="q">"Phishing, spear phishing aur business email compromise mein kya farak hai, aur har ek se kaise bachoge?"</p><p>Strong answer: phishing broad aur untargeted hai; spear phishing researched details ke saath ek specific insaan ko target karta hai; BEC ek real ya look-alike mailbox ka galat use karke payment ya data change karwata hai, aksar bina malware ya links ke. Defences: URL aur attachment analysis wali email security, SPF/DKIM/DMARC, DNS security, phishing-resistant MFA, user reporting aur payments ke liye verification process.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Actors ko motivation se jaano: criminals (paisa), nation-states (jaasoosi), hacktivists, insiders.</li>
<li>Zyada tar breaches phishing ya chori hue credentials se shuru hote hain; BEC mein malware nahi bhi ho sakta.</li>
<li>Malware types, credential attacks (brute force, spraying, stuffing) aur web aur network attacks pehchaano.</li>
<li>SCOR v2.0 mein AI/LLM threats shaamil hain jaise prompt injection aur data disclosure.</li>
<li>Har attack ke liye logs mein indicator aur use rokne wala control jaano.</li>
</ul></div>
`}};export{e as default};