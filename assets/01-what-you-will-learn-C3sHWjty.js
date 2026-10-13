var e={id:`intro`,h:{en:`What you will learn, the track map and security careers`,hi:`Aap kya seekhoge, track map aur security careers`},body:{en:`
<p><b>What you will learn in this module.</b> This is the first module of the CCNP Security track. By the end of it you will think like a defender: you will be able to name what an organisation must protect, explain how a real attack moves from a phishing email to stolen data, place every security product (firewall, IPS, DNS security, email security, EDR, NAC, MFA, SIEM, XDR) on one picture, and walk through a first incident from alert to lessons learned. You will also know exactly how the two exams of this track are built, so every later module has a place on your map.</p>
<p><b>Prerequisites.</b> CCNA-level networking: IP addressing and subnetting, VLANs, routing, TCP and UDP ports, ACLs, NAT and the basic CCNA security ideas. You do not need any previous security job, tool or certificate. Where a CCNA idea matters, this module reminds you in one or two lines and moves on.</p>

<h3>Start with an analogy: a network is an airport</h3>
<p>Think of a big international airport. Passengers and luggage (packets) flow in and out all day. The airport does not trust anyone just because they arrived: there is a perimeter fence, an entry gate that checks tickets (a firewall), a scanner that looks inside bags for dangerous items (an intrusion prevention system), an identity check at the counter with passport and boarding pass (authentication and MFA), staff badges that open only the doors a person needs (least privilege), CCTV cameras everywhere (logging and NetFlow), and a control room where people watch all the cameras and react when something looks wrong (the security operations centre, or SOC).</p>
<p>No single control makes the airport safe. The fence can be climbed, a bag can slip past the scanner, a passport can be forged. Safety comes from <b>layers</b> that each catch what the others miss, and from people in the control room who notice and respond. That is the whole idea of network security, and of this track.</p>

<h3>Why network engineers move into security</h3>
<p>Every attack travels over a network. The firewall is a routed or bridged device with interfaces and NAT. The VPN is a tunnel with routing and MTU problems. 802.1X runs on switch ports. DNS security works because every connection starts with a DNS query. Engineers who already understand packets have a huge head start, because most security problems in production are really "why is this flow blocked or allowed" problems. What you add in this track is the attacker's view, the defender's tools and the discipline of evidence.</p>

<h3>The track map: two exams, one skill set</h3>
<p>The <b>CCNP Security</b> certification needs two exams: the core exam <b>SCOR 350-701 v2.0</b> (Implementing and Operating Cisco Security Core Technologies, 120 minutes) and one concentration exam. This track uses <b>SNCF 300-710 v1.2</b> (Securing Networks with Cisco Firewalls, 90 minutes). Passing SCOR alone also earns a Specialist certification, and SCOR is the qualifying exam for the CCIE Security lab.</p>
<table class="cmp"><tr><th>SCOR 350-701 v2.0 domain</th><th>Weight</th><th>Where you study it</th></tr>
<tr><td>1.0 Security Concepts</td><td>20%</td><td>This module, threats and firewalls, modern threats, cryptography</td></tr>
<tr><td>2.0 Network Security</td><td>25%</td><td>Layer 2 security, AAA and device management, ASA, Threat Defense, VPN</td></tr>
<tr><td>3.0 Cloud Security</td><td>15%</td><td>Cloud and workload security, DevSecOps</td></tr>
<tr><td>4.0 Secure Service Edge</td><td>10%</td><td>Cisco Secure Access (SSE)</td></tr>
<tr><td>5.0 Endpoint Protection and Detection</td><td>15%</td><td>Secure Endpoint, EDR/XDR and email security</td></tr>
<tr><td>6.0 Network Access, Visibility and Enforcement</td><td>15%</td><td>802.1X and ISE, Duo, XDR and Splunk</td></tr>
</table>
<table class="cmp"><tr><th>SNCF 300-710 v1.2 domain</th><th>Weight</th></tr>
<tr><td>1.0 Deployment (modes, IPS deployment, high availability, virtual appliances)</td><td>30%</td></tr>
<tr><td>2.0 Configuration (policies, NAT, objects, Snort, VPN on the firewall)</td><td>30%</td></tr>
<tr><td>3.0 Management and Troubleshooting</td><td>25%</td></tr>
<tr><td>4.0 Integration (malware defence, threat intelligence, pxGrid, XDR, Splunk)</td><td>15%</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CCNP Security track map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Start here</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">this module</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">Security concepts</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">threats, crypto</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">L2, AAA, mgmt</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">ASA</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">ACL, NAT, HA</text>
<rect x="490" y="120" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="142" text-anchor="middle" class="svg-ink" font-size="13">Threat Defense</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">FMC, IPS (SNCF)</text>
<rect x="330" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="142" text-anchor="middle" class="svg-ink" font-size="13">VPN</text><text x="400" y="160" text-anchor="middle" class="svg-muted" font-size="12">site-to-site, RA</text>
<rect x="170" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="13">Cloud, SSE, endpoint</text><text x="240" y="160" text-anchor="middle" class="svg-muted" font-size="12">Secure Access, EDR</text>
<rect x="10" y="120" width="140" height="50" rx="8" fill="#fed7aa"/><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="13">Access, visibility</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="12">ISE, Duo, XDR</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="70" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><line x1="490" y1="145" x2="470" y2="145" stroke="#64748b" stroke-width="2"/><line x1="330" y1="145" x2="310" y2="145" stroke="#64748b" stroke-width="2"/><line x1="170" y1="145" x2="150" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Concepts first, then the edge, then the endpoints, users and the SOC</text>
</svg><p class="cap">The order of the track. Each box is one or more modules with hands-on labs on simulated consoles.</p></div>

<h3>Careers: where this track can take you</h3>
<table class="cmp"><tr><th>Role</th><th>What a normal day looks like</th><th>Most used skills from this track</th></tr>
<tr><td><b>SOC analyst (L1/L2)</b></td><td>Watches alerts in the SIEM or XDR, triages them, decides true or false positive, escalates or contains</td><td>Kill chain, logs, NetFlow, incident response</td></tr>
<tr><td><b>Firewall / network security engineer</b></td><td>Builds and changes firewall rules, NAT and VPNs, troubleshoots blocked flows, runs change windows</td><td>ASA, Threat Defense, FMC, packet-tracer, captures</td></tr>
<tr><td><b>Security engineer (NAC, identity, endpoint)</b></td><td>Rolls out 802.1X and ISE policies, MFA, EDR agents and email security</td><td>ISE, Duo, Secure Endpoint, Secure Access</td></tr>
<tr><td><b>Incident responder / threat hunter</b></td><td>Investigates confirmed incidents, scopes them, drives containment and recovery</td><td>XDR, Splunk, ATT&amp;CK, forensics basics</td></tr>
<tr><td><b>Security architect</b></td><td>Designs zero trust, segmentation and SASE for the whole company</td><td>All domains, design trade-offs</td></tr>
</table>
<p>Most people start as a SOC analyst or a network engineer who owns the firewalls, then specialise. The CCNP Security skill set is valued because it joins both worlds: you can read a packet capture and a SIEM alert with equal confidence.</p>

<div class="eg"><p><b>Worked example.</b> A fresher with CCNA plans 16 weeks: weeks 1 to 2 on this module and security concepts, weeks 3 to 8 on infrastructure security, ASA and Threat Defense (the heart of SNCF, 60% of it is deployment and configuration), weeks 9 to 12 on VPN, cloud, SSE and endpoint, weeks 13 to 14 on ISE and visibility, weeks 15 to 16 on revision and practice tests. Two labs per week, and one ticket lab every weekend.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Collecting product names without understanding the problem each product solves. Interviewers rarely ask "what is Secure Endpoint"; they ask "a laptop is beaconing to a strange domain, what do you do?" Learn the problem and the control first, then the product.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR v2.0 added explicit topics such as vulnerabilities in AI/LLM models, Secure Service Edge as its own domain, and interpreting scripts that call security appliance APIs. Old study material for v1.x misses them. Always check that a resource matches v2.0.</p></div>

<div class="scn"><h4>The network engineer who became the firewall owner</h4><p>A campus network engineer at a mid-size company was asked to "look after the firewall" after the security contractor left. In week one a sales manager complained that the CRM was blocked. The engineer checked the rule base, found no rule for the new CRM subnet, and nearly added "permit any any" to close the ticket quickly. A senior colleague stopped him: they first checked the logs, found which exact flow was denied, and added one narrow rule for the one destination and port. Two months later an audit praised the rule base for having no broad permits.</p><p><b>Lesson:</b> security work is networking plus discipline: find the exact flow, change the smallest thing, and keep evidence.</p></div>

<div class="iv"><p class="q">"Why do you want to move from networking into security?"</p><p>Strong answer: connect the two. Every attack crosses the network, and most security operations issues are flow problems: blocked, allowed, decrypted, inspected. Mention that you want to understand the attacker's view and the detection side (logs, SIEM, incident response), and give one concrete example, such as tracing a denied flow through a firewall with packet-tracer and fixing it with a narrow rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module builds the defender mindset and the big picture before your first firewall rule.</li>
<li>CCNP Security = SCOR 350-701 v2.0 (core) + one concentration; this track uses SNCF 300-710 v1.2.</li>
<li>SCOR domains: Concepts 20, Network Security 25, Cloud 15, SSE 10, Endpoint 15, Access and Visibility 15.</li>
<li>Security is layers plus people who watch and respond, like an airport.</li>
<li>Typical careers: SOC analyst, firewall engineer, NAC/identity engineer, incident responder, architect.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh CCNP Security track ka pehla module hai. Iske end tak aap defender ki tarah sochoge: aap bata paoge ki organisation ko kya protect karna hai, samjha paoge ki real attack ek phishing email se chori hue data tak kaise pahunchta hai, har security product (firewall, IPS, DNS security, email security, EDR, NAC, MFA, SIEM, XDR) ko ek picture par rakh paoge, aur alert se lessons learned tak pehle incident ko step by step chala paoge. Aapko yeh bhi exactly pata hoga ki is track ke dono exams kaise bane hain, taaki aage ke har module ki aapke map par jagah ho.</p>
<p><b>Prerequisites.</b> CCNA-level networking: IP addressing aur subnetting, VLANs, routing, TCP aur UDP ports, ACLs, NAT aur CCNA ke basic security ideas. Aapko pehle ki koi security job, tool ya certificate nahi chahiye. Jahan CCNA ka koi idea zaroori hai, yeh module ek do line mein yaad dila kar aage badhta hai.</p>

<h3>Ek analogy se shuru karo: network ek airport hai</h3>
<p>Ek bade international airport ke baare mein socho. Passengers aur luggage (packets) poore din andar bahar jaate hain. Airport kisi par sirf isliye bharosa nahi karta ki woh pahunch gaya: perimeter fence hai, entry gate hai jo tickets check karta hai (firewall), scanner hai jo bags ke andar khatarnak cheezein dekhta hai (intrusion prevention system), counter par passport aur boarding pass se identity check hota hai (authentication aur MFA), staff badges sirf wahi darwaze kholte hain jo us insaan ko chahiye (least privilege), har jagah CCTV cameras hain (logging aur NetFlow), aur ek control room hai jahan log saare cameras dekhte hain aur kuch galat lage to react karte hain (security operations centre, yaani SOC).</p>
<p>Koi ek control airport ko safe nahi banata. Fence chadha ja sakta hai, bag scanner se nikal sakta hai, passport nakli ho sakta hai. Safety <b>layers</b> se aati hai jo ek dusre se chhooti cheez pakadti hain, aur control room ke logon se jo notice karke respond karte hain. Network security ka, aur is track ka, poora idea yahi hai.</p>

<h3>Network engineers security mein kyun jaate hain</h3>
<p>Har attack network par chalta hai. Firewall ek routed ya bridged device hai jismein interfaces aur NAT hote hain. VPN ek tunnel hai jismein routing aur MTU problems aati hain. 802.1X switch ports par chalta hai. DNS security isliye kaam karti hai kyunki har connection DNS query se shuru hota hai. Jo engineers packets pehle se samajhte hain unka bahut bada head start hai, kyunki production ki zyada tar security problems asal mein "yeh flow block ya allow kyun hai" wali problems hoti hain. Is track mein aap attacker ka view, defender ke tools aur evidence ka discipline jodte ho.</p>

<h3>Track map: do exams, ek skill set</h3>
<p><b>CCNP Security</b> certification ke liye do exams chahiye: core exam <b>SCOR 350-701 v2.0</b> (Implementing and Operating Cisco Security Core Technologies, 120 minute) aur ek concentration exam. Yeh track <b>SNCF 300-710 v1.2</b> (Securing Networks with Cisco Firewalls, 90 minute) use karta hai. Sirf SCOR pass karne par bhi ek Specialist certification milta hai, aur SCOR CCIE Security lab ka qualifying exam hai.</p>
<table class="cmp"><tr><th>SCOR 350-701 v2.0 domain</th><th>Weight</th><th>Aap ise kahan padhoge</th></tr>
<tr><td>1.0 Security Concepts</td><td>20%</td><td>Yeh module, threats aur firewalls, modern threats, cryptography</td></tr>
<tr><td>2.0 Network Security</td><td>25%</td><td>Layer 2 security, AAA aur device management, ASA, Threat Defense, VPN</td></tr>
<tr><td>3.0 Cloud Security</td><td>15%</td><td>Cloud aur workload security, DevSecOps</td></tr>
<tr><td>4.0 Secure Service Edge</td><td>10%</td><td>Cisco Secure Access (SSE)</td></tr>
<tr><td>5.0 Endpoint Protection and Detection</td><td>15%</td><td>Secure Endpoint, EDR/XDR aur email security</td></tr>
<tr><td>6.0 Network Access, Visibility and Enforcement</td><td>15%</td><td>802.1X aur ISE, Duo, XDR aur Splunk</td></tr>
</table>
<table class="cmp"><tr><th>SNCF 300-710 v1.2 domain</th><th>Weight</th></tr>
<tr><td>1.0 Deployment (modes, IPS deployment, high availability, virtual appliances)</td><td>30%</td></tr>
<tr><td>2.0 Configuration (policies, NAT, objects, Snort, firewall par VPN)</td><td>30%</td></tr>
<tr><td>3.0 Management and Troubleshooting</td><td>25%</td></tr>
<tr><td>4.0 Integration (malware defence, threat intelligence, pxGrid, XDR, Splunk)</td><td>15%</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="CCNP Security track ka map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="13">Start here</text><text x="80" y="60" text-anchor="middle" class="svg-muted" font-size="12">yeh module</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="13">Security concepts</text><text x="240" y="60" text-anchor="middle" class="svg-muted" font-size="12">threats, crypto</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="13">Infrastructure</text><text x="400" y="60" text-anchor="middle" class="svg-muted" font-size="12">L2, AAA, mgmt</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="13">ASA</text><text x="560" y="60" text-anchor="middle" class="svg-muted" font-size="12">ACL, NAT, HA</text>
<rect x="490" y="120" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="560" y="142" text-anchor="middle" class="svg-ink" font-size="13">Threat Defense</text><text x="560" y="160" text-anchor="middle" class="svg-muted" font-size="12">FMC, IPS (SNCF)</text>
<rect x="330" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="142" text-anchor="middle" class="svg-ink" font-size="13">VPN</text><text x="400" y="160" text-anchor="middle" class="svg-muted" font-size="12">site-to-site, RA</text>
<rect x="170" y="120" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="240" y="142" text-anchor="middle" class="svg-ink" font-size="13">Cloud, SSE, endpoint</text><text x="240" y="160" text-anchor="middle" class="svg-muted" font-size="12">Secure Access, EDR</text>
<rect x="10" y="120" width="140" height="50" rx="8" fill="#fed7aa"/><text x="80" y="142" text-anchor="middle" class="svg-ink" font-size="13">Access, visibility</text><text x="80" y="160" text-anchor="middle" class="svg-muted" font-size="12">ISE, Duo, XDR</text>
<line x1="150" y1="45" x2="170" y2="45" stroke="#64748b" stroke-width="2"/><line x1="310" y1="45" x2="330" y2="45" stroke="#64748b" stroke-width="2"/><line x1="470" y1="45" x2="490" y2="45" stroke="#64748b" stroke-width="2"/>
<line x1="560" y1="70" x2="560" y2="120" stroke="#64748b" stroke-width="2"/><line x1="490" y1="145" x2="470" y2="145" stroke="#64748b" stroke-width="2"/><line x1="330" y1="145" x2="310" y2="145" stroke="#64748b" stroke-width="2"/><line x1="170" y1="145" x2="150" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="320" y="195" text-anchor="middle" class="svg-accent" font-size="12">Pehle concepts, phir edge, phir endpoints, users aur SOC</text>
</svg><p class="cap">Track ka order. Har box ek ya zyada modules hai jinmein simulated consoles par hands-on labs hain.</p></div>

<h3>Careers: yeh track aapko kahan le ja sakta hai</h3>
<table class="cmp"><tr><th>Role</th><th>Normal din kaisa dikhta hai</th><th>Is track ki sabse zyada use hone wali skills</th></tr>
<tr><td><b>SOC analyst (L1/L2)</b></td><td>SIEM ya XDR mein alerts dekhta hai, unhe triage karta hai, true ya false positive decide karta hai, escalate ya contain karta hai</td><td>Kill chain, logs, NetFlow, incident response</td></tr>
<tr><td><b>Firewall / network security engineer</b></td><td>Firewall rules, NAT aur VPNs banata aur badalta hai, blocked flows troubleshoot karta hai, change windows chalata hai</td><td>ASA, Threat Defense, FMC, packet-tracer, captures</td></tr>
<tr><td><b>Security engineer (NAC, identity, endpoint)</b></td><td>802.1X aur ISE policies, MFA, EDR agents aur email security roll out karta hai</td><td>ISE, Duo, Secure Endpoint, Secure Access</td></tr>
<tr><td><b>Incident responder / threat hunter</b></td><td>Confirmed incidents investigate karta hai, unka scope nikalta hai, containment aur recovery chalata hai</td><td>XDR, Splunk, ATT&amp;CK, forensics basics</td></tr>
<tr><td><b>Security architect</b></td><td>Poori company ke liye zero trust, segmentation aur SASE design karta hai</td><td>Saare domains, design trade-offs</td></tr>
</table>
<p>Zyada tar log SOC analyst ya firewalls own karne wale network engineer ke roop mein shuru karte hain, phir specialise karte hain. CCNP Security skill set ki value isliye hai kyunki yeh dono duniya jodta hai: aap packet capture aur SIEM alert dono ko same confidence se padh sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> CCNA wala ek fresher 16 hafte plan karta hai: week 1 se 2 is module aur security concepts par, week 3 se 8 infrastructure security, ASA aur Threat Defense par (SNCF ka dil, iska 60% deployment aur configuration hai), week 9 se 12 VPN, cloud, SSE aur endpoint par, week 13 se 14 ISE aur visibility par, week 15 se 16 revision aur practice tests par. Har hafte do labs, aur har weekend ek ticket lab.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Har product jo problem solve karta hai use samjhe bina product names ikatthe karna. Interviewers kam hi poochte hain "Secure Endpoint kya hai"; woh poochte hain "ek laptop ek ajeeb domain ko beacon kar raha hai, aap kya karoge?" Pehle problem aur control seekho, phir product.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR v2.0 ne explicit topics jode hain jaise AI/LLM models ki vulnerabilities, Secure Service Edge apne alag domain ke roop mein, aur security appliance APIs call karne wale scripts interpret karna. v1.x ka purana study material inhe miss karta hai. Hamesha check karo ki resource v2.0 se match karta hai.</p></div>

<div class="scn"><h4>Network engineer jo firewall owner ban gaya</h4><p>Ek mid-size company ke campus network engineer ko security contractor ke jaane ke baad "firewall sambhalne" ko kaha gaya. Pehle hafte ek sales manager ne complain kiya ki CRM block hai. Engineer ne rule base check kiya, naye CRM subnet ke liye koi rule nahi mila, aur ticket jaldi band karne ke liye lagbhag "permit any any" jod diya. Ek senior colleague ne use roka: unhone pehle logs check kiye, pata kiya ki exactly kaunsa flow deny hua, aur us ek destination aur port ke liye ek narrow rule joda. Do mahine baad ek audit ne rule base ki tareef ki kyunki usmein koi broad permit nahi tha.</p><p><b>Seekh:</b> security ka kaam networking plus discipline hai: exact flow dhoondo, sabse chhoti cheez badlo, aur evidence rakho.</p></div>

<div class="iv"><p class="q">"Aap networking se security mein kyun jaana chahte ho?"</p><p>Strong answer: dono ko jodo. Har attack network cross karta hai, aur security operations ke zyada tar issues flow problems hote hain: blocked, allowed, decrypted, inspected. Batao ki aap attacker ka view aur detection side (logs, SIEM, incident response) samajhna chahte ho, aur ek concrete example do, jaise packet-tracer se firewall ke through denied flow trace karna aur use narrow rule se fix karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module aapke pehle firewall rule se pehle defender mindset aur big picture banata hai.</li>
<li>CCNP Security = SCOR 350-701 v2.0 (core) + ek concentration; yeh track SNCF 300-710 v1.2 use karta hai.</li>
<li>SCOR domains: Concepts 20, Network Security 25, Cloud 15, SSE 10, Endpoint 15, Access aur Visibility 15.</li>
<li>Security layers plus woh log hain jo dekhte aur respond karte hain, airport ki tarah.</li>
<li>Typical careers: SOC analyst, firewall engineer, NAC/identity engineer, incident responder, architect.</li>
</ul></div>
`}};export{e as default};