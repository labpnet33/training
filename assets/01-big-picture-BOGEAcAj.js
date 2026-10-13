var e={id:`big-picture`,h:{en:`Why network access control exists: the big picture`,hi:`Network access control kyun hota hai: big picture`},body:{en:`
<p><b>What you will learn in this module.</b> This is module 1 of 6 in the Aruba ClearPass track. By the end you will explain what ClearPass does, why a switch needs it, and how one login travels from a laptop to a decision. You will register a switch as a network device, build your first complete service (user, enforcement profile, enforcement policy, service), read the Access Tracker, and fix the classic error 9002 "Failed to classify request to service". <b>Prerequisites:</b> you know what an IP address, a VLAN and a switch port are, and you can type commands in a CLI. No ClearPass or RADIUS knowledge is needed.</p>

<h3>Start with an analogy: the office reception desk</h3>
<p>Imagine a company building. The main door has a security guard, and behind him is a reception desk with a visitor register. When you arrive, the guard does not decide anything. He asks the reception: "Who is this person? Is he an employee, a contractor or a visitor? Which floor may he enter?" Reception looks at the register and the company rules, then tells the guard: "Employee, floors 1 to 3." The guard opens the right door.</p>
<p>In a network the roles map like this. The <b>guard</b> is the access switch (the network access device, <b>NAD</b>). The <b>reception desk with the register and rules</b> is the policy server, <b>ClearPass Policy Manager</b> (CPPM). The <b>visitor</b> is the endpoint: a laptop, printer or camera. The guard enforces, the reception decides. This split is the single most important idea of the whole track.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Endpoint, switch and ClearPass">
<rect x="10" y="60" width="130" height="70" rx="10" fill="#bae6fd"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="14">Endpoint</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">laptop, printer</text>
<rect x="255" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">Switch (NAD)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">enforces</text>
<rect x="500" y="60" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">decides</text>
<line x1="140" y1="95" x2="255" y2="95" stroke="#64748b" stroke-width="2"/><line x1="385" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="198" y="85" text-anchor="middle" class="svg-muted" font-size="12">EAP / MAC</text><text x="442" y="85" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Decision travels back: accept + role / VLAN, or reject</text>
</svg><p class="cap">The endpoint asks, the switch relays, ClearPass decides, the switch enforces.</p></div>

<h3>AAA: three questions every access system answers</h3>
<ul>
<li><b>Authentication</b>: who or what are you, and can you prove it? (password, certificate, or for a dumb device its MAC address)</li>
<li><b>Authorization</b>: given who you are, what may you use? (which VLAN, which role, which ACL)</li>
<li><b>Accounting</b>: what did you do and for how long? (session start, stop, data counters)</li>
</ul>
<p>Passing authentication does not mean "full access". A printer can authenticate perfectly and still be allowed to reach only the print server. That limit is authorization, and it is the whole reason ClearPass has roles and enforcement policies.</p>

<h3>Why not just use VLANs and passwords on ports?</h3>
<p>Without NAC, a cable in a wall socket is permission. Anyone who plugs in lands in whatever VLAN that port is configured for. Static port VLANs also break every time people move desks. NAC makes the <b>identity, not the socket</b>, decide the network a device receives. Alice gets the employee network at any desk, a contractor gets a limited network, a failed login gets a guest network, and an unknown device can be held in quarantine.</p>

<h3>The lab network you will use</h3>
<p>Every lab in this track uses the same site, "Mumbai HQ". The access switch <code>ACCESS</code> (AOS-CX style, ports 1/1/1 to 1/1/12) connects through the router <code>R1</code> to the policy server <code>CPPM</code> at 10.20.60.10 and the application server <code>APP1</code> at 10.20.70.20. Clients: LAPTOP1 (user alice) on port 1/1/3, LAPTOP2 (user bob) on 1/1/4, and later the printer PRN1 on 1/1/5.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th></tr>
<tr><td>10</td><td>EMPLOYEE</td><td>10.20.10.0/24</td></tr>
<tr><td>20</td><td>CONTRACTOR</td><td>10.20.20.0/24</td></tr>
<tr><td>30</td><td>IOT</td><td>10.20.30.0/24</td></tr>
<tr><td>40</td><td>GUEST</td><td>10.20.40.0/24</td></tr>
<tr><td>50</td><td>QUARANTINE</td><td>10.20.50.0/24</td></tr>
<tr><td>99</td><td>INFRA</td><td>10.20.99.0/24 (R1 .1, ACCESS .2)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Alice plugs LAPTOP1 into port 1/1/3. The switch holds the port closed for normal traffic and asks ClearPass about alice. ClearPass finds her account, decides she is Engineering staff, and answers "accept, role EMPLOYEE". The switch applies role EMPLOYEE, which puts the port in VLAN 10. DHCP now gives LAPTOP1 an address such as 10.20.10.x and it can reach APP1 at 10.20.70.20. Five decisions, three devices, and nobody touched the port configuration.</p></div>

<div class="note"><p><b>Honest scope.</b> The real ClearPass Policy Manager is configured in a web GUI under Configuration. The lab runs a text shell that mirrors the GUI menu path, and the commands are marked "Lab shell". It is a learning model, not Aruba software. Features such as the GUI itself, Active Directory, certificates, guest portals and posture checks are taught as concepts and marked "not simulated in the lab".</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking ClearPass sits in the data path and forwards user traffic. It does not. It only answers authentication and authorization questions. The switch enforces the answer, which is why a wrong switch configuration can break a perfect ClearPass policy.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Authentication succeeded, so the user must reach every server" is false. Authentication proves identity; authorization decides reach. Always separate the two when reading a question.</p></div>

<div class="scn"><h4>The unplugged conference-room cable</h4><p>A company had a conference room with an active wall socket in the employee VLAN. A visiting vendor plugged in a laptop and could browse the file server share names within minutes. Nobody had done anything wrong; the port simply trusted the cable. After the company enabled 802.1X with a policy server, the same socket gave an unknown laptop nothing until it authenticated, and a vendor account landed in a limited contractor VLAN.</p><p><b>Lesson:</b> NAC moves trust from the socket to the identity.</p></div>

<div class="iv"><p class="q">"What problem does ClearPass solve, and where does it sit in the network?"</p><p>Strong answer: it is a policy server that answers who is connecting and what they may access, using RADIUS from the switch. It is not inline; the NAD enforces the result with a role or VLAN. Mention AAA, identity over socket, and give the employee, contractor and guest example.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass decides; the switch (NAD) enforces. ClearPass is not in the data path.</li>
<li>AAA means authentication, authorization and accounting; success in the first does not grant everything.</li>
<li>NAC makes identity, not the wall socket, choose the network.</li>
<li>All labs use ACCESS, R1, CPPM 10.20.60.10 and APP1 10.20.70.20.</li>
<li>The lab shell mirrors the GUI path; the real product is configured in the web GUI.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Aruba ClearPass track ka 6 mein se module 1 hai. End tak aap explain kar paoge ki ClearPass kya karta hai, switch ko uski zaroorat kyun padti hai, aur ek login laptop se decision tak kaise travel karta hai. Aap switch ko network device ke roop mein register karoge, apni pehli complete service banaoge (user, enforcement profile, enforcement policy, service), Access Tracker padhoge, aur classic error 9002 "Failed to classify request to service" fix karoge. <b>Prerequisites:</b> aapko IP address, VLAN aur switch port ka matlab pata ho, aur CLI mein commands type kar sakte ho. ClearPass ya RADIUS ki pehle se knowledge nahi chahiye.</p>

<h3>Analogy se shuru karo: office ka reception desk</h3>
<p>Ek company building socho. Main gate par security guard hai, aur uske peeche visitor register wala reception desk hai. Jab aap aate ho, guard khud kuch decide nahi karta. Woh reception se poochta hai: "Yeh kaun hai? Employee hai, contractor hai ya visitor? Kaunsi floor par ja sakta hai?" Reception register aur company rules dekhta hai, phir guard ko batata hai: "Employee, floor 1 se 3." Guard sahi darwaza kholta hai.</p>
<p>Network mein roles aise map hote hain. <b>Guard</b> access switch hai (network access device, <b>NAD</b>). <b>Register aur rules wala reception desk</b> policy server hai, <b>ClearPass Policy Manager</b> (CPPM). <b>Visitor</b> endpoint hai: laptop, printer ya camera. Guard enforce karta hai, reception decide karta hai. Poore track ka sabse important idea yahi split hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Endpoint, switch aur ClearPass">
<rect x="10" y="60" width="130" height="70" rx="10" fill="#bae6fd"/><text x="75" y="90" text-anchor="middle" class="svg-ink" font-size="14">Endpoint</text><text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">laptop, printer</text>
<rect x="255" y="60" width="130" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="14">Switch (NAD)</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">enforce karta hai</text>
<rect x="500" y="60" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="565" y="90" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="565" y="110" text-anchor="middle" class="svg-muted" font-size="12">decide karta hai</text>
<line x1="140" y1="95" x2="255" y2="95" stroke="#64748b" stroke-width="2"/><line x1="385" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="198" y="85" text-anchor="middle" class="svg-muted" font-size="12">EAP / MAC</text><text x="442" y="85" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="13">Decision wapas aata hai: accept + role / VLAN, ya reject</text>
</svg><p class="cap">Endpoint maangta hai, switch relay karta hai, ClearPass decide karta hai, switch enforce karta hai.</p></div>

<h3>AAA: teen sawaal jo har access system ka jawab deta hai</h3>
<ul>
<li><b>Authentication</b>: aap kaun ho, aur kya prove kar sakte ho? (password, certificate, ya dumb device ke liye uska MAC address)</li>
<li><b>Authorization</b>: aap kaun ho yeh pata chalne ke baad, aap kya use kar sakte ho? (kaunsa VLAN, kaunsa role, kaunsa ACL)</li>
<li><b>Accounting</b>: aapne kya kiya aur kitni der? (session start, stop, data counters)</li>
</ul>
<p>Authentication pass hone ka matlab "full access" nahi hai. Printer perfectly authenticate ho sakta hai aur phir bhi sirf print server tak pahunch sakta hai. Yeh limit authorization hai, aur yahi wajah hai ki ClearPass mein roles aur enforcement policies hoti hain.</p>

<h3>Sirf VLAN aur port passwords kyun nahi?</h3>
<p>NAC ke bina, wall socket mein lagi cable hi permission hai. Jo bhi plug karta hai woh us port ke configured VLAN mein pahunch jata hai. Static port VLANs tab bhi toot jaate hain jab log desk badalte hain. NAC <b>identity ko, socket ko nahi</b>, decide karne deta hai ki device ko kaunsa network mile. Alice ko kisi bhi desk par employee network milta hai, contractor ko limited network, failed login ko guest network, aur unknown device ko quarantine mein rakha ja sakta hai.</p>

<h3>Lab network jo aap use karoge</h3>
<p>Is track ke har lab mein same site "Mumbai HQ" hai. Access switch <code>ACCESS</code> (AOS-CX style, ports 1/1/1 se 1/1/12) router <code>R1</code> ke through policy server <code>CPPM</code> (10.20.60.10) aur application server <code>APP1</code> (10.20.70.20) se judta hai. Clients: LAPTOP1 (user alice) port 1/1/3 par, LAPTOP2 (user bob) 1/1/4 par, aur baad mein printer PRN1 1/1/5 par.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th></tr>
<tr><td>10</td><td>EMPLOYEE</td><td>10.20.10.0/24</td></tr>
<tr><td>20</td><td>CONTRACTOR</td><td>10.20.20.0/24</td></tr>
<tr><td>30</td><td>IOT</td><td>10.20.30.0/24</td></tr>
<tr><td>40</td><td>GUEST</td><td>10.20.40.0/24</td></tr>
<tr><td>50</td><td>QUARANTINE</td><td>10.20.50.0/24</td></tr>
<tr><td>99</td><td>INFRA</td><td>10.20.99.0/24 (R1 .1, ACCESS .2)</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Alice LAPTOP1 ko port 1/1/3 mein plug karti hai. Switch port ko normal traffic ke liye band rakhta hai aur ClearPass se alice ke baare mein poochta hai. ClearPass uska account dhoondhta hai, decide karta hai ki woh Engineering staff hai, aur jawab deta hai "accept, role EMPLOYEE". Switch role EMPLOYEE apply karta hai, jo port ko VLAN 10 mein daal deta hai. Ab DHCP LAPTOP1 ko 10.20.10.x jaisa address deta hai aur woh APP1 (10.20.70.20) tak pahunch sakta hai. Paanch decisions, teen devices, aur kisi ne port configuration ko haath nahi lagaya.</p></div>

<div class="note"><p><b>Honest scope.</b> Real ClearPass Policy Manager web GUI mein Configuration ke neeche configure hota hai. Lab ek text shell chalata hai jo GUI menu path ko mirror karta hai, aur commands "Lab shell" se mark hain. Yeh learning model hai, Aruba software nahi. GUI khud, Active Directory, certificates, guest portals aur posture checks concept ke roop mein padhaye jaate hain aur "not simulated in the lab" mark hote hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki ClearPass data path mein baitha hai aur user traffic forward karta hai. Aisa nahi hai. Woh sirf authentication aur authorization ke sawaalon ka jawab deta hai. Switch jawab ko enforce karta hai, isliye galat switch configuration perfect ClearPass policy ko bhi tod sakti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Authentication succeed hua, to user ko har server milna chahiye" galat hai. Authentication identity prove karta hai; authorization reach decide karta hai. Question padhte waqt dono ko hamesha alag rakho.</p></div>

<div class="scn"><h4>Conference-room ki unplugged cable</h4><p>Ek company ke conference room mein employee VLAN ka active wall socket tha. Ek visiting vendor ne laptop plug kiya aur kuch hi minute mein file server ke share names browse kar liye. Kisi ne galti nahi ki thi; port ne bas cable par bharosa kiya. Company ne policy server ke saath 802.1X enable kiya, to wahi socket unknown laptop ko authenticate hone tak kuch nahi deta tha, aur vendor account limited contractor VLAN mein pahunchta tha.</p><p><b>Seekh:</b> NAC trust ko socket se identity par le jaata hai.</p></div>

<div class="iv"><p class="q">"ClearPass kaunsa problem solve karta hai, aur woh network mein kahan baithta hai?"</p><p>Strong answer: yeh policy server hai jo batata hai ki kaun connect ho raha hai aur use kya access milna chahiye, switch se aane wale RADIUS ke through. Yeh inline nahi hai; NAD result ko role ya VLAN se enforce karta hai. AAA, socket ke upar identity, aur employee, contractor, guest ka example mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ClearPass decide karta hai; switch (NAD) enforce karta hai. ClearPass data path mein nahi hai.</li>
<li>AAA ka matlab authentication, authorization aur accounting; pehle mein success se sab kuch nahi milta.</li>
<li>NAC wall socket nahi, identity ko network chunne deta hai.</li>
<li>Saare labs ACCESS, R1, CPPM 10.20.60.10 aur APP1 10.20.70.20 use karte hain.</li>
<li>Lab shell GUI path mirror karta hai; real product web GUI se configure hota hai.</li>
</ul></div>
`}};export{e as default};