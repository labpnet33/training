var e={id:`what-is-ccnp`,h:{en:`What CCNP Enterprise is, and how to use this track`,hi:`CCNP Enterprise kya hai, aur is track ko kaise use karein`},body:{en:`
<p><b>What you will learn in this module.</b> This module is the bridge between CCNA and the CCNP ENCOR 350-401 v1.2 exam. By the end you will know how the CCNP Enterprise certification is built, what each ENCOR domain expects, how a real enterprise network is laid out, how a router or switch actually forwards a packet, and you will have refreshed every CCNA topic that ENCOR takes for granted: VLANs, trunks, spanning tree, EtherChannel, IPv4 and IPv6 addressing, routing logic, OSPF, FHRP, NAT and NTP. You will also set up the working habits (CLI filters, safe changes, a troubleshooting method, a study plan) that the rest of the track assumes.</p>
<p><b>Prerequisites.</b> CCNA-level knowledge, even if it is a few years old or self-taught. If a topic in this module feels completely new rather than rusty, go back to the matching CCNA module first. You do not need production experience; the labs give you that.</p>

<h3>The big picture: from driving a car to running the traffic system</h3>
<p>CCNA is like a driving licence. You can drive on city roads: configure a VLAN, a trunk, a static route, a single-area OSPF network, and fix simple faults. CCNP Enterprise is like joining the city traffic control room. You still need to drive, but now you also design junctions (campus and WAN design), choose between a flyover and a signal (OSPF or BGP, VRF or separate hardware), keep traffic moving when a road closes (high availability), watch the cameras (assurance and telemetry), control who may enter (security), and program the signals centrally instead of walking to every junction (automation and controllers).</p>

<h3>How the certification is built</h3>
<p><b>CCNP Enterprise</b> needs two exams: one <b>core</b> exam and one <b>concentration</b> exam of your choice.</p>
<table class="cmp"><tr><th>Exam</th><th>What it covers</th></tr>
<tr><td><b>ENCOR 350-401 (core)</b></td><td>Architecture, virtualization, infrastructure, assurance, security, automation. 120 minutes. Passing it alone earns the <b>Cisco Certified Specialist - Enterprise Core</b> badge and makes you eligible for the CCIE Enterprise Infrastructure and CCIE Enterprise Wireless lab exams.</td></tr>
<tr><td><b>Concentration (choose one)</b></td><td>A deep dive, for example ENARSI 300-410 (advanced routing, VPN and troubleshooting), ENSLD 300-420 (design), ENSDWI 300-415 (SD-WAN), or the enterprise wireless design and implementation exams. The list changes over time, so check Cisco's current list before you book.</td></tr>
</table>
<p>The certification is valid for three years. You recertify by passing exams again or by earning continuing education credits.</p>

<h3>The six ENCOR domains and their weights</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="ENCOR domain weights">
<text x="10" y="48" class="svg-ink" font-size="13">1 Architecture</text><rect x="200" y="30" width="150" height="26" rx="4" fill="#bae6fd"/><text x="360" y="48" class="svg-accent" font-size="13">15%</text>
<text x="10" y="88" class="svg-ink" font-size="13">2 Virtualization</text><rect x="200" y="70" width="100" height="26" rx="4" fill="#ddd6fe"/><text x="310" y="88" class="svg-accent" font-size="13">10%</text>
<text x="10" y="128" class="svg-ink" font-size="13">3 Infrastructure</text><rect x="200" y="110" width="300" height="26" rx="4" fill="#bbf7d0"/><text x="510" y="128" class="svg-accent" font-size="13">30%</text>
<text x="10" y="168" class="svg-ink" font-size="13">4 Network Assurance</text><rect x="200" y="150" width="100" height="26" rx="4" fill="#fde68a"/><text x="310" y="168" class="svg-accent" font-size="13">10%</text>
<text x="10" y="208" class="svg-ink" font-size="13">5 Security</text><rect x="200" y="190" width="200" height="26" rx="4" fill="#fed7aa"/><text x="410" y="208" class="svg-accent" font-size="13">20%</text>
<text x="10" y="248" class="svg-ink" font-size="13">6 Automation</text><rect x="200" y="230" width="150" height="26" rx="4" fill="#e2e8f0"/><text x="360" y="248" class="svg-accent" font-size="13">15%</text>
<text x="320" y="18" text-anchor="middle" class="svg-muted" font-size="12">ENCOR 350-401 v1.2 blueprint weights</text>
</svg><p class="cap">Infrastructure is the biggest domain, but 70% of the exam is outside classic routing and switching.</p></div>
<table class="cmp"><tr><th>Domain</th><th>Main topics</th><th>Modules in this track</th></tr>
<tr><td>1 Architecture (15%)</td><td>Tiered campus design, high availability, wireless deployment models, SD-WAN, SD-Access, QoS</td><td>Enterprise design, SD-WAN and SD-Access, QoS</td></tr>
<tr><td>2 Virtualization (10%)</td><td>Hypervisors and virtual switching, VRF, GRE and IPsec tunnels, LISP, VXLAN</td><td>VRF, GRE and IPsec; LISP and VXLAN</td></tr>
<tr><td>3 Infrastructure (30%)</td><td>Trunks, EtherChannel, RSTP and MST; EIGRP versus OSPF; multi-area OSPFv2/v3; eBGP; policy-based routing; wireless RF, AP modes, roaming; NTP/PTP, NAT, HSRP/VRRP, multicast</td><td>Advanced switching, EIGRP, OSPF, eBGP, IP services, multicast, wireless</td></tr>
<tr><td>4 Network Assurance (10%)</td><td>Debugs and conditional debugs, SNMP, syslog, NetFlow, SPAN/RSPAN/ERSPAN, IP SLA, Catalyst Center workflows</td><td>Debugs, SPAN, IP SLA and NetFlow; Catalyst Center assurance</td></tr>
<tr><td>5 Security (20%)</td><td>Device access and AAA, ACLs, CoPP, wireless security, 802.1X, MAB, TrustSec, MACsec, threat defense</td><td>Device access, AAA, ACLs and CoPP; threat defense and 802.1X</td></tr>
<tr><td>6 Automation (15%)</td><td>Python, JSON, YANG, NETCONF and RESTCONF, controller APIs, REST response codes, EEM, orchestration tools</td><td>Python and JSON; YANG, NETCONF and RESTCONF; EEM</td></tr>
</table>

<h3>What a CCNP engineer actually does</h3>
<p>A CCNA engineer usually executes tickets written by someone else. A CCNP engineer is the person who writes them. Typical responsibilities: turn a business requirement into a design choice, write and review change plans with rollback steps, lead the change window, own escalations when the NOC is stuck, and explain trade-offs to managers in plain language. The exam tests exactly this: not only "which command", but "which option is best and why".</p>

<div class="eg"><p><b>Worked example: split your study time by weight.</b> Suppose you have 150 study hours. Infrastructure gets 30% = 45 hours, Security 20% = 30 hours, Architecture 15% = 22.5 hours, Automation 15% = 22.5 hours, Virtualization 10% = 15 hours, Assurance 10% = 15 hours. If you are already strong in routing, move 10 hours from Infrastructure to Automation and Security, where most CCNA holders are weakest.</p></div>

<h3>How to use this track</h3>
<ol>
<li><b>Read</b> each module's chapters in order. Every chapter has a scenario, an interview tip and key takeaways.</li>
<li><b>Lab</b> every configuration yourself. Type the commands; do not paste them.</li>
<li><b>Break and fix</b> with the troubleshooting labs and ticket scenarios.</li>
<li><b>Test</b> with the quiz, then answer the interview questions aloud as if in a real interview.</li>
</ol>
<p>This first module has no labs. It rebuilds the foundation and introduces the reference network that later modules use.</p>

<div class="warn"><p><b>Common mistake.</b> Treating ENCOR as "CCNA with harder routing" and skipping automation, assurance and security. Those three domains together are 45% of the exam. A candidate who knows OSPF perfectly but cannot read JSON or explain 802.1X will fail.</p></div>

<div class="exam"><p><b>Exam trap.</b> ENCOR alone does not make you CCNP Enterprise; you need a concentration too. Also, the ENCOR exam does not let you go back to a previous question once you move on, so answer each one fully before clicking Next.</p></div>

<div class="scn"><h4>The rusty CCNA</h4><p>Ravi passed CCNA four years ago and worked mostly on the service desk. He booked ENCOR for six weeks later and started directly with SD-Access videos. After two weeks he could not follow them, because they assumed VRF, VXLAN and LISP, which assumed solid routing, which assumed subnetting speed. His mentor made him stop, spend one week on the refresher chapters of this module, and then follow the track in order. He passed on the second attempt with a comfortable margin.</p><p><b>Lesson:</b> CCNP topics stack on each other. A one-week refresh of the foundation saves a month of confusion later.</p></div>

<div class="iv"><p class="q">"What is the difference between a CCNA-level and a CCNP-level engineer?"</p><p>Strong answer: a CCNA engineer can configure and verify a feature; a CCNP engineer can choose between features, design for failure, plan a safe change with rollback, and troubleshoot across layers and domains. Give an example: "At CCNA level I can configure HSRP. At CCNP level I decide HSRP versus VRRP, tune timers and tracking, align the active gateway with the STP root, and plan how to fail it over during maintenance."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CCNP Enterprise = ENCOR 350-401 core + one concentration exam; ENCOR alone gives a Specialist badge and CCIE lab eligibility.</li>
<li>Six domains: Architecture 15, Virtualization 10, Infrastructure 30, Assurance 10, Security 20, Automation 15.</li>
<li>70% of the exam is outside classic routing and switching; plan study time by weight.</li>
<li>A CCNP engineer designs, plans changes and owns escalations, not only configures.</li>
<li>Follow the track in order: read, lab, break and fix, test, then answer interview questions aloud.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh module CCNA aur CCNP ENCOR 350-401 v1.2 exam ke beech ka bridge hai. End tak aapko pata hoga ki CCNP Enterprise certification kaise bana hai, har ENCOR domain kya expect karta hai, ek real enterprise network kaise laid out hota hai, router ya switch packet ko actually kaise forward karta hai, aur aap har woh CCNA topic refresh kar chuke hoge jo ENCOR maan kar chalta hai: VLANs, trunks, spanning tree, EtherChannel, IPv4 aur IPv6 addressing, routing logic, OSPF, FHRP, NAT aur NTP. Aap woh working habits bhi set karoge (CLI filters, safe changes, troubleshooting method, study plan) jo baaki track assume karta hai.</p>
<p><b>Prerequisites.</b> CCNA-level knowledge, chahe woh kuch saal purani ho ya self-taught. Agar is module ka koi topic rusty nahi balki bilkul naya lage, to pehle matching CCNA module par wapas jaao. Production experience ki zaroorat nahi; labs woh de dengi.</p>

<h3>Big picture: car chalane se traffic system chalane tak</h3>
<p>CCNA ek driving licence jaisa hai. Aap city ki sadkon par gaadi chala sakte ho: VLAN, trunk, static route, single-area OSPF network configure karna, aur simple faults fix karna. CCNP Enterprise city ke traffic control room join karne jaisa hai. Aapko abhi bhi gaadi chalani aani chahiye, par ab aap junctions design bhi karte ho (campus aur WAN design), flyover aur signal mein choose karte ho (OSPF ya BGP, VRF ya alag hardware), road band hone par traffic chalta rakhte ho (high availability), cameras dekhte ho (assurance aur telemetry), kaun andar aaye yeh control karte ho (security), aur har junction par chal kar jaane ki jagah signals ko centrally program karte ho (automation aur controllers).</p>

<h3>Certification kaise bana hai</h3>
<p><b>CCNP Enterprise</b> ke liye do exams chahiye: ek <b>core</b> exam aur apni pasand ka ek <b>concentration</b> exam.</p>
<table class="cmp"><tr><th>Exam</th><th>Kya cover karta hai</th></tr>
<tr><td><b>ENCOR 350-401 (core)</b></td><td>Architecture, virtualization, infrastructure, assurance, security, automation. 120 minutes. Sirf ise pass karne par <b>Cisco Certified Specialist - Enterprise Core</b> badge milta hai aur aap CCIE Enterprise Infrastructure aur CCIE Enterprise Wireless lab exams ke liye eligible ho jaate ho.</td></tr>
<tr><td><b>Concentration (ek choose karo)</b></td><td>Ek deep dive, jaise ENARSI 300-410 (advanced routing, VPN aur troubleshooting), ENSLD 300-420 (design), ENSDWI 300-415 (SD-WAN), ya enterprise wireless design aur implementation exams. List time ke saath badalti hai, isliye book karne se pehle Cisco ki current list check karo.</td></tr>
</table>
<p>Certification teen saal valid rehta hai. Aap dobara exams pass karke ya continuing education credits kama kar recertify karte ho.</p>

<h3>Chhe ENCOR domains aur unke weights</h3>
<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="ENCOR domain weights">
<text x="10" y="48" class="svg-ink" font-size="13">1 Architecture</text><rect x="200" y="30" width="150" height="26" rx="4" fill="#bae6fd"/><text x="360" y="48" class="svg-accent" font-size="13">15%</text>
<text x="10" y="88" class="svg-ink" font-size="13">2 Virtualization</text><rect x="200" y="70" width="100" height="26" rx="4" fill="#ddd6fe"/><text x="310" y="88" class="svg-accent" font-size="13">10%</text>
<text x="10" y="128" class="svg-ink" font-size="13">3 Infrastructure</text><rect x="200" y="110" width="300" height="26" rx="4" fill="#bbf7d0"/><text x="510" y="128" class="svg-accent" font-size="13">30%</text>
<text x="10" y="168" class="svg-ink" font-size="13">4 Network Assurance</text><rect x="200" y="150" width="100" height="26" rx="4" fill="#fde68a"/><text x="310" y="168" class="svg-accent" font-size="13">10%</text>
<text x="10" y="208" class="svg-ink" font-size="13">5 Security</text><rect x="200" y="190" width="200" height="26" rx="4" fill="#fed7aa"/><text x="410" y="208" class="svg-accent" font-size="13">20%</text>
<text x="10" y="248" class="svg-ink" font-size="13">6 Automation</text><rect x="200" y="230" width="150" height="26" rx="4" fill="#e2e8f0"/><text x="360" y="248" class="svg-accent" font-size="13">15%</text>
<text x="320" y="18" text-anchor="middle" class="svg-muted" font-size="12">ENCOR 350-401 v1.2 blueprint weights</text>
</svg><p class="cap">Infrastructure sabse bada domain hai, par exam ka 70% classic routing aur switching ke bahar hai.</p></div>
<table class="cmp"><tr><th>Domain</th><th>Main topics</th><th>Is track ke modules</th></tr>
<tr><td>1 Architecture (15%)</td><td>Tiered campus design, high availability, wireless deployment models, SD-WAN, SD-Access, QoS</td><td>Enterprise design, SD-WAN aur SD-Access, QoS</td></tr>
<tr><td>2 Virtualization (10%)</td><td>Hypervisors aur virtual switching, VRF, GRE aur IPsec tunnels, LISP, VXLAN</td><td>VRF, GRE aur IPsec; LISP aur VXLAN</td></tr>
<tr><td>3 Infrastructure (30%)</td><td>Trunks, EtherChannel, RSTP aur MST; EIGRP versus OSPF; multi-area OSPFv2/v3; eBGP; policy-based routing; wireless RF, AP modes, roaming; NTP/PTP, NAT, HSRP/VRRP, multicast</td><td>Advanced switching, EIGRP, OSPF, eBGP, IP services, multicast, wireless</td></tr>
<tr><td>4 Network Assurance (10%)</td><td>Debugs aur conditional debugs, SNMP, syslog, NetFlow, SPAN/RSPAN/ERSPAN, IP SLA, Catalyst Center workflows</td><td>Debugs, SPAN, IP SLA aur NetFlow; Catalyst Center assurance</td></tr>
<tr><td>5 Security (20%)</td><td>Device access aur AAA, ACLs, CoPP, wireless security, 802.1X, MAB, TrustSec, MACsec, threat defense</td><td>Device access, AAA, ACLs aur CoPP; threat defense aur 802.1X</td></tr>
<tr><td>6 Automation (15%)</td><td>Python, JSON, YANG, NETCONF aur RESTCONF, controller APIs, REST response codes, EEM, orchestration tools</td><td>Python aur JSON; YANG, NETCONF aur RESTCONF; EEM</td></tr>
</table>

<h3>CCNP engineer actually kya karta hai</h3>
<p>CCNA engineer aam taur par kisi aur ke likhe tickets execute karta hai. CCNP engineer woh insaan hai jo unhe likhta hai. Typical responsibilities: business requirement ko design choice mein badalna, rollback steps ke saath change plans likhna aur review karna, change window lead karna, jab NOC atak jaaye to escalations own karna, aur managers ko trade-offs simple bhasha mein samjhana. Exam bilkul yahi test karta hai: sirf "kaunsa command" nahi, balki "kaunsa option best hai aur kyun".</p>

<div class="eg"><p><b>Worked example: weight ke hisaab se study time baanto.</b> Maan lo aapke paas 150 study hours hain. Infrastructure ko 30% = 45 hours, Security ko 20% = 30 hours, Architecture ko 15% = 22.5 hours, Automation ko 15% = 22.5 hours, Virtualization ko 10% = 15 hours, Assurance ko 10% = 15 hours. Agar aap routing mein pehle se strong ho, to Infrastructure se 10 hours Automation aur Security mein shift karo, jahan zyada tar CCNA holders sabse kamzor hote hain.</p></div>

<h3>Is track ko kaise use karein</h3>
<ol>
<li>Har module ke chapters order mein <b>padho</b>. Har chapter mein ek scenario, ek interview tip aur key takeaways hain.</li>
<li>Har configuration khud <b>lab</b> karo. Commands type karo; paste mat karo.</li>
<li>Troubleshooting labs aur ticket scenarios se <b>break and fix</b> karo.</li>
<li>Quiz se <b>test</b> karo, phir interview questions ka jawab zor se bolo jaise real interview mein.</li>
</ol>
<p>Is pehle module mein labs nahi hain. Yeh foundation dobara banata hai aur woh reference network introduce karta hai jo aage ke modules use karte hain.</p>

<div class="warn"><p><b>Common galti.</b> ENCOR ko "harder routing wala CCNA" samajhna aur automation, assurance aur security skip karna. Yeh teen domains milkar exam ka 45% hain. Jo candidate OSPF perfectly jaanta hai par JSON nahi padh sakta ya 802.1X explain nahi kar sakta, woh fail hoga.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sirf ENCOR se aap CCNP Enterprise nahi bante; concentration bhi chahiye. Aur ENCOR exam mein aage badhne ke baad pichle question par wapas nahi jaa sakte, isliye Next click karne se pehle har question poora answer karo.</p></div>

<div class="scn"><h4>Rusty CCNA</h4><p>Ravi ne chaar saal pehle CCNA pass kiya tha aur zyada tar service desk par kaam kiya. Usne chhe hafte baad ka ENCOR book kiya aur seedha SD-Access videos se shuru kiya. Do hafte baad woh unhe follow nahi kar pa raha tha, kyunki woh VRF, VXLAN aur LISP assume karte the, jo solid routing assume karte the, jo subnetting speed assume karti thi. Uske mentor ne use roka, is module ke refresher chapters par ek hafta lagwaya, aur phir track order mein follow karwaya. Usne doosre attempt mein comfortable margin se pass kiya.</p><p><b>Seekh:</b> CCNP topics ek doosre par stack hote hain. Foundation ka ek hafte ka refresh baad mein ek mahine ka confusion bachata hai.</p></div>

<div class="iv"><p class="q">"CCNA-level aur CCNP-level engineer mein kya fark hai?"</p><p>Strong answer: CCNA engineer ek feature configure aur verify kar sakta hai; CCNP engineer features mein choose kar sakta hai, failure ke liye design kar sakta hai, rollback ke saath safe change plan kar sakta hai, aur layers aur domains ke across troubleshoot kar sakta hai. Example do: "CCNA level par main HSRP configure kar sakta hoon. CCNP level par main HSRP versus VRRP decide karta hoon, timers aur tracking tune karta hoon, active gateway ko STP root ke saath align karta hoon, aur maintenance ke dauraan use fail over karne ka plan banata hoon."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CCNP Enterprise = ENCOR 350-401 core + ek concentration exam; sirf ENCOR se Specialist badge aur CCIE lab eligibility milti hai.</li>
<li>Chhe domains: Architecture 15, Virtualization 10, Infrastructure 30, Assurance 10, Security 20, Automation 15.</li>
<li>Exam ka 70% classic routing aur switching ke bahar hai; study time weight ke hisaab se plan karo.</li>
<li>CCNP engineer design karta hai, changes plan karta hai aur escalations own karta hai, sirf configure nahi karta.</li>
<li>Track order mein follow karo: padho, lab karo, break and fix, test, phir interview questions zor se answer karo.</li>
</ul></div>
`}};export{e as default};