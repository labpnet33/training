var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a security guard and a register. You now know what the register holds for TCP, UDP and ICMP, how the guard handles tricky visitors like FTP and SIP, how the building is divided into zones, how the reception number (NAT) works, when to use a camera (IDS) or a door guard (IPS), where to place firewalls so one breach does not sink the ship, how the ASA and Threat Defense differ, and why the guard's diary (logging) matters. Use this chapter as your revision sheet before the lab, the exam and the interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="20" width="195" height="70" rx="10" fill="#fed7aa"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Know the enemy</text><text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">threats, vulnerabilities</text>
<rect x="222" y="20" width="195" height="70" rx="10" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Control the path</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">state, inspection, zones, NAT</text>
<rect x="435" y="20" width="195" height="70" rx="10" fill="#bbf7d0"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Look inside, contain</text><text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">IDS/IPS, segmentation</text>
<rect x="10" y="110" width="620" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="14">Prove it: show conn, show xlate, show logging, packet-tracer, capture</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">evidence before change, every time</text>
</svg><p class="cap">The whole module in one picture: understand threats, control paths, inspect and contain, and prove everything with evidence.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can describe viruses, worms, trojans, rootkits, ransomware, phishing, DoS/DDoS, MITM, SQL injection and XSS, with one indicator and one defence each.</li>
<li>I can name the SCOR cloud threats: data breaches, insecure APIs, compromised credentials, DoS/DDoS.</li>
<li>I can compare software bugs, weak or hard-coded passwords, missing encryption, OS command injection, buffer overflow, path traversal, XSS and CSRF.</li>
<li>I can explain packet filter vs stateful vs proxy vs NGFW vs WAF.</li>
<li>I can walk a TCP connection through a stateful firewall and read <code>show conn</code> flags.</li>
<li>I can explain UDP pseudo-state, ASA ICMP behaviour, default timeouts and why FTP, DNS and SIP need inspection.</li>
<li>I can apply ASA security-level rules and choose routed or transparent mode.</li>
<li>I can read <code>show xlate</code>, explain PAT vs static NAT and the real-IP ACL rule.</li>
<li>I can compare IDS and IPS, and signature, anomaly, policy and reputation detection.</li>
<li>I can choose a firewall placement: perimeter, three-legged or back-to-back DMZ, internal segmentation and data center, and explain north-south vs east-west.</li>
<li>I can compare the ASA with Threat Defense (LINA plus Snort 3, managed by Management Center or Device Manager).</li>
<li>I can explain why logging matters, the syslog severities 0–7, and configure a logging baseline.</li>
<li>I can complete the lab and find message 106001 in the log.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Connection table</dt><dd>The stateful firewall's memory of allowed flows (5-tuple, interfaces, NAT, state, timers).</dd>
<dt>Embryonic connection</dt><dd>A TCP connection whose handshake has not completed.</dd>
<dt>Pseudo-state</dt><dd>Tracking connectionless UDP by 5-tuple and idle timeout.</dd>
<dt>Inspection engine / ALG</dt><dd>Reads an application's control channel to open pinholes and fix embedded addresses.</dd>
<dt>Pinhole</dt><dd>A temporary, exact opening for one secondary connection.</dd>
<dt>Security level</dt><dd>ASA trust value 0–100 per interface.</dd>
<dt>BVI</dt><dd>Bridge virtual interface holding the management IP in transparent mode.</dd>
<dt>Xlate</dt><dd>A NAT translation entry.</dd>
<dt>False negative</dt><dd>An attack that produced no alert.</dd>
<dt>Lateral movement</dt><dd>An attacker moving east-west from host to host.</dd>
<dt>Screened subnet</dt><dd>Another name for a DMZ.</dd>
<dt>LINA / Snort 3</dt><dd>The two Threat Defense engines: L3/L4, NAT and VPN, and Layer 7 inspection.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Stateful vs ACL</td><td>Only the first packet is checked against policy; replies match the connection table. <code>established</code> checks flags only.</td></tr>
<tr><td>ASA defaults</td><td>High to low allowed; low to high needs an ACL; equal levels blocked; <code>inside</code> gets 100 automatically.</td></tr>
<tr><td>ICMP on ASA</td><td>Not stateful by default; add <code>inspect icmp</code> (and <code>inspect icmp error</code> for traceroute).</td></tr>
<tr><td>Timeouts</td><td>TCP 1 h, half-closed 10 min, UDP 2 min, ICMP 2 s, xlate 3 h, PAT xlate 30 s.</td></tr>
<tr><td>Transparent mode</td><td>L2 bump, bridge group + BVI, EtherType ACL for non-IP, mode change erases config.</td></tr>
<tr><td>NAT</td><td>ASA 8.3+ ACLs use the real IP; NAT is not security.</td></tr>
<tr><td>IDS vs IPS</td><td>IDS passive (SPAN/TAP) cannot stop the first packet; IPS inline adds latency, fail-open or fail-closed.</td></tr>
<tr><td>Detection</td><td>Zero-day points to anomaly-based; signature-based misses the unknown.</td></tr>
<tr><td>XSS vs CSRF</td><td>XSS: attacker's script runs in the victim's browser. CSRF: forged request from the victim's authenticated browser.</td></tr>
<tr><td>Syslog IDs</td><td>302013/302014 TCP built/teardown, 305011 dynamic translation, 106001 inbound TCP denied, 106023 denied by ACL, 106014 inbound ICMP denied.</td></tr>
<tr><td>Syslog levels</td><td>0 emergencies to 7 debugging; lower is more severe; 302013 is level 6, 106001 is level 2.</td></tr>
<tr><td>Placement</td><td>Perimeter = north-south; segmentation = east-west; DMZ never initiates to inside; back-to-back DMZ = defence in depth.</td></tr>
<tr><td>ASA vs FTD</td><td>FTD = LINA + Snort 3, policy in FMC/FDM, changes need Deploy; block rules log only at beginning.</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Sessions, translations and logs</span>
show conn
show conn detail
show conn count
show xlate
show logging
<span class="c">! Logging baseline</span>
logging enable
logging timestamp
logging buffered informational
logging trap informational
logging host inside 10.0.1.200
<span class="c">! Policy and inspection</span>
show nameif
show service-policy
show running-config timeout
<span class="c">! Deep troubleshooting</span>
packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
capture CAP-OUT interface outside match tcp host 198.51.100.10 host 203.0.113.2
show capture CAP-OUT
show asp drop
clear conn address 10.0.1.10</pre>

<div class="warn"><p><b>Last common mistake.</b> Memorising commands without the model. If you can explain what the connection table holds and when an entry is created, you can predict every output in this module, and in the ASA and Threat Defense modules that follow.</p></div>

<div class="exam"><p><b>Final exam traps.</b> "NAT hides the network, so it is secure" is wrong. "An IDS blocked the attack" is wrong unless it is inline, which makes it an IPS. "Changing an ACL drops existing sessions" is wrong; existing connections stay until cleared or closed.</p></div>

<div class="scn"><h4>The interview that turned into a whiteboard</h4><p>A candidate for a firewall engineer role was asked, "Why can a user browse the web through our ASA without any inbound rule?" Instead of reciting definitions, she drew PC1, the ASA and a web server, walked the SYN through route lookup, security levels, PAT and connection creation, showed the reply matching the entry, then drew a stranger's SYN being dropped with 106001. The panel moved straight to design questions. She got the offer.</p><p><b>Lesson:</b> the connection-table story, told with real outputs, answers half of all firewall interview questions.</p></div>

<div class="iv"><p class="q">"Summarise how a stateful firewall protects an office network in two minutes."</p><p>Structure it: zones and security levels define trust; the first packet of a flow is checked against policy; allowed flows are recorded in the connection table with NAT; replies match automatically and unsolicited inbound traffic is dropped and logged; inspection engines handle protocols with secondary channels; timeouts clean up; an NGFW adds application, user and IPS inspection; segmentation contains what gets through. Close with the verification commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats and vulnerabilities: recognise, detect, defend (SCOR 1.1 and 1.2).</li>
<li>Stateful inspection: connection table for TCP, pseudo-state for UDP, ICMP needs inspection on the ASA.</li>
<li>Zones and security levels define trust; routed and transparent modes define placement.</li>
<li>NAT translates, the policy protects; IPS inspects inline; placement and segmentation contain; logs prove it.</li>
<li>Next: sec-concepts (modern threats, OWASP, CVSS, zero trust), then the ASA hands-on modules.</li>
</ul></div>
`,hi:`
<p>Aapne ek security guard aur register se shuru kiya tha. Ab aap jaante ho ki TCP, UDP aur ICMP ke liye register mein kya hota hai, guard FTP aur SIP jaise mushkil visitors ko kaise handle karta hai, building ko zones mein kaise baanta jaata hai, reception number (NAT) kaise kaam karta hai, camera (IDS) ya darwaze ka guard (IPS) kab use karna hai, firewalls kahan rakhein taaki ek breach jahaz na duboye, ASA aur Threat Defense mein kya farak hai, aur guard ki diary (logging) kyun zaroori hai. Lab, exam aur interview se pehle is chapter ko revision sheet ki tarah use karo.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="10" y="20" width="195" height="70" rx="10" fill="#fed7aa"/><text x="107" y="48" text-anchor="middle" class="svg-ink" font-size="14">Dushman ko jaano</text><text x="107" y="70" text-anchor="middle" class="svg-muted" font-size="12">threats, vulnerabilities</text>
<rect x="222" y="20" width="195" height="70" rx="10" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">Raasta control karo</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">state, inspection, zones, NAT</text>
<rect x="435" y="20" width="195" height="70" rx="10" fill="#bbf7d0"/><text x="532" y="48" text-anchor="middle" class="svg-ink" font-size="14">Andar dekho, roko</text><text x="532" y="70" text-anchor="middle" class="svg-muted" font-size="12">IDS/IPS, segmentation</text>
<rect x="10" y="110" width="620" height="70" rx="10" fill="#e2e8f0"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="14">Prove karo: show conn, show xlate, show logging, packet-tracer, capture</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">badlav se pehle saboot, har baar</text>
</svg><p class="cap">Poora module ek picture mein: threats samjho, raaste control karo, inspect karo aur roko, aur sab kuch saboot se prove karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main viruses, worms, trojans, rootkits, ransomware, phishing, DoS/DDoS, MITM, SQL injection aur XSS describe kar sakta hoon, har ek ka ek indicator aur ek defence ke saath.</li>
<li>Main SCOR cloud threats ka naam le sakta hoon: data breaches, insecure APIs, compromised credentials, DoS/DDoS.</li>
<li>Main software bugs, weak ya hard-coded passwords, missing encryption, OS command injection, buffer overflow, path traversal, XSS aur CSRF compare kar sakta hoon.</li>
<li>Main packet filter vs stateful vs proxy vs NGFW vs WAF samjha sakta hoon.</li>
<li>Main stateful firewall ke through ek TCP connection chala sakta hoon aur <code>show conn</code> flags padh sakta hoon.</li>
<li>Main UDP pseudo-state, ASA ICMP behaviour, default timeouts aur FTP, DNS aur SIP ko inspection kyun chahiye samjha sakta hoon.</li>
<li>Main ASA security-level rules apply kar sakta hoon aur routed ya transparent mode chun sakta hoon.</li>
<li>Main <code>show xlate</code> padh sakta hoon, PAT vs static NAT aur real-IP ACL rule samjha sakta hoon.</li>
<li>Main IDS aur IPS, aur signature, anomaly, policy aur reputation detection compare kar sakta hoon.</li>
<li>Main firewall placement chun sakta hoon: perimeter, three-legged ya back-to-back DMZ, internal segmentation aur data center, aur north-south vs east-west samjha sakta hoon.</li>
<li>Main ASA ko Threat Defense se compare kar sakta hoon (LINA plus Snort 3, Management Center ya Device Manager se managed).</li>
<li>Main samjha sakta hoon ki logging kyun zaroori hai, syslog severities 0–7, aur ek logging baseline configure kar sakta hoon.</li>
<li>Main lab poora kar sakta hoon aur log mein message 106001 dhoondh sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Connection table</dt><dd>Allowed flows ki stateful firewall ki memory (5-tuple, interfaces, NAT, state, timers).</dd>
<dt>Embryonic connection</dt><dd>TCP connection jiska handshake poora nahi hua.</dd>
<dt>Pseudo-state</dt><dd>Connectionless UDP ko 5-tuple aur idle timeout se track karna.</dd>
<dt>Inspection engine / ALG</dt><dd>Application ka control channel padh kar pinholes kholta hai aur embed hue addresses theek karta hai.</dd>
<dt>Pinhole</dt><dd>Ek secondary connection ke liye temporary, exact opening.</dd>
<dt>Security level</dt><dd>Har interface par ASA trust value 0–100.</dd>
<dt>BVI</dt><dd>Bridge virtual interface jo transparent mode mein management IP rakhta hai.</dd>
<dt>Xlate</dt><dd>NAT translation entry.</dd>
<dt>False negative</dt><dd>Aisa attack jisne koi alert nahi diya.</dd>
<dt>Lateral movement</dt><dd>Attacker ka east-west host se host move karna.</dd>
<dt>Screened subnet</dt><dd>DMZ ka doosra naam.</dd>
<dt>LINA / Snort 3</dt><dd>Threat Defense ke do engines: L3/L4, NAT aur VPN, aur Layer 7 inspection.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Stateful vs ACL</td><td>Policy se sirf pehla packet check hota hai; replies connection table se match hote hain. <code>established</code> sirf flags check karta hai.</td></tr>
<tr><td>ASA defaults</td><td>High se low allowed; low se high ko ACL chahiye; barabar levels blocked; <code>inside</code> ko apne aap 100 milta hai.</td></tr>
<tr><td>ASA par ICMP</td><td>Default mein stateful nahi; <code>inspect icmp</code> jodo (aur traceroute ke liye <code>inspect icmp error</code>).</td></tr>
<tr><td>Timeouts</td><td>TCP 1 h, half-closed 10 min, UDP 2 min, ICMP 2 s, xlate 3 h, PAT xlate 30 s.</td></tr>
<tr><td>Transparent mode</td><td>L2 bump, bridge group + BVI, non-IP ke liye EtherType ACL, mode change config mita deta hai.</td></tr>
<tr><td>NAT</td><td>ASA 8.3+ ACLs real IP use karte hain; NAT security nahi hai.</td></tr>
<tr><td>IDS vs IPS</td><td>IDS passive (SPAN/TAP) pehla packet nahi rok sakta; IPS inline latency jodta hai, fail-open ya fail-closed.</td></tr>
<tr><td>Detection</td><td>Zero-day ka ishaara anomaly-based ki taraf; signature-based unknown ko miss karta hai.</td></tr>
<tr><td>XSS vs CSRF</td><td>XSS: attacker ki script victim ke browser mein chalti hai. CSRF: victim ke authenticated browser se nakli request.</td></tr>
<tr><td>Syslog IDs</td><td>302013/302014 TCP built/teardown, 305011 dynamic translation, 106001 inbound TCP denied, 106023 ACL se denied, 106014 inbound ICMP denied.</td></tr>
<tr><td>Syslog levels</td><td>0 emergencies se 7 debugging; chhota zyada severe; 302013 level 6 hai, 106001 level 2.</td></tr>
<tr><td>Placement</td><td>Perimeter = north-south; segmentation = east-west; DMZ kabhi inside ki taraf initiate nahi karta; back-to-back DMZ = defence in depth.</td></tr>
<tr><td>ASA vs FTD</td><td>FTD = LINA + Snort 3, policy FMC/FDM mein, changes ko Deploy chahiye; block rules sirf beginning par log karte hain.</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Sessions, translations aur logs</span>
show conn
show conn detail
show conn count
show xlate
show logging
<span class="c">! Logging baseline</span>
logging enable
logging timestamp
logging buffered informational
logging trap informational
logging host inside 10.0.1.200
<span class="c">! Policy aur inspection</span>
show nameif
show service-policy
show running-config timeout
<span class="c">! Gehra troubleshooting</span>
packet-tracer input inside tcp 10.0.1.10 51544 8.8.8.8 80
capture CAP-OUT interface outside match tcp host 198.51.100.10 host 203.0.113.2
show capture CAP-OUT
show asp drop
clear conn address 10.0.1.10</pre>

<div class="warn"><p><b>Aakhri common galti.</b> Model samjhe bina commands ratna. Agar aap samjha sakte ho ki connection table mein kya hota hai aur entry kab banti hai, to aap is module ka, aur aage aane wale ASA aur Threat Defense modules ka, har output predict kar sakte ho.</p></div>

<div class="exam"><p><b>Final exam traps.</b> "NAT network chhupata hai, isliye secure hai" galat hai. "IDS ne attack block kiya" galat hai jab tak woh inline na ho, jo use IPS bana deta hai. "ACL badalne se existing sessions drop ho jaate hain" galat hai; existing connections clear ya band hone tak bane rehte hain.</p></div>

<div class="scn"><h4>Woh interview jo whiteboard ban gaya</h4><p>Firewall engineer role ki ek candidate se poocha gaya, "Hamare ASA ke through user bina kisi inbound rule ke web kaise browse kar leta hai?" Definitions ratne ki jagah, usne PC1, ASA aur web server draw kiye, SYN ko route lookup, security levels, PAT aur connection creation se guzaara, reply ko entry se match hote dikhaya, phir ek anjaan ke SYN ko 106001 ke saath drop hote draw kiya. Panel seedha design questions par chala gaya. Use offer mil gaya.</p><p><b>Seekh:</b> real outputs ke saath sunaayi gayi connection-table ki kahani aadhe firewall interview questions ka jawab de deti hai.</p></div>

<div class="iv"><p class="q">"Do minute mein summarise karo ki stateful firewall office network ko kaise protect karta hai."</p><p>Structure do: zones aur security levels trust define karte hain; flow ka pehla packet policy se check hota hai; allowed flows NAT ke saath connection table mein record hote hain; replies apne aap match hote hain aur bina bulaya inbound traffic drop aur log hota hai; inspection engines secondary channels wale protocols handle karte hain; timeouts safai karte hain; NGFW application, user aur IPS inspection jodta hai; segmentation jo andar aa jaaye use rokta hai. Verification commands ke saath khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threats aur vulnerabilities: pehchaano, detect karo, defend karo (SCOR 1.1 aur 1.2).</li>
<li>Stateful inspection: TCP ke liye connection table, UDP ke liye pseudo-state, ASA par ICMP ko inspection chahiye.</li>
<li>Zones aur security levels trust define karte hain; routed aur transparent modes placement define karte hain.</li>
<li>NAT translate karta hai, policy protect karti hai; IPS inline inspect karta hai; placement aur segmentation rokte hain; logs prove karte hain.</li>
<li>Aage: sec-concepts (modern threats, OWASP, CVSS, zero trust), phir ASA hands-on modules.</li>
</ul></div>
`}};export{e as default};