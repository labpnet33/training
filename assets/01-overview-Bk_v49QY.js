var e={id:`overview`,h:{en:`Wired access control: what you will build`,hi:`Wired access control: aap kya banaoge`},body:{en:`
<h3>What you will learn</h3>
<p>In module 1 you made the switch and ClearPass trust each other and you built the first service. This module turns that first success into a real wired design. By the end you will be able to explain the 802.1X exchange packet by packet, make ClearPass place users by <b>role</b> or by <b>VLAN attribute</b>, admit a printer that has no supplicant using <b>MAC authentication</b>, and find in minutes why an accepted user still has no network.</p>
<ul>
<li>How a supplicant, an authenticator and an authentication server talk (EAPOL, EAP, RADIUS).</li>
<li>The AOS-CX style port-access configuration: RADIUS server, server group, 802.1X and MAC authentication, roles.</li>
<li>The ClearPass decision chain for wired services: service, authentication, role mapping, enforcement.</li>
<li>The two ways to return a placement: <code>Aruba-User-Role</code> and the three standard Tunnel attributes.</li>
<li>Case-sensitive role names, and the Endpoints Repository for MAC authentication.</li>
</ul>
<p><b>Prerequisites:</b> the previous module (a registered network device, the shared secret, a working Wired 802.1X service) and basic VLAN and DHCP knowledge. We will not re-teach those; we will use them.</p>

<h3>The big picture: a building with a reception desk</h3>
<p>Imagine an office building. The <b>security guard at the lobby door</b> does not decide who may enter; he phones the <b>reception desk upstairs</b>, reads out the visitor's name, and waits. Reception checks a list and answers: "let her in, send her to floor 10" or "refuse". The guard simply follows the answer. Now add a delivery robot that cannot speak: the guard has no name to read out, so he reads its serial number and reception checks a separate list of known machines.</p>
<p>Map it: the guard is the <b>authenticator</b> (the access switch port), the visitor is the <b>supplicant</b> (the laptop software), reception is the <b>authentication server</b> (ClearPass Policy Manager), the floor number is the <b>VLAN or role</b>, and the robot is the <b>MAC-authenticated device</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wired access control roles">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="97" text-anchor="middle" class="svg-ink" font-size="14">LAPTOP1</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="255" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACCESS</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="97" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="555" y="116" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="92" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="92" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#fde68a"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">PRN1 (no supplicant)</text>
<line x1="320" y1="170" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="150" y="190" class="svg-muted" font-size="12">MAC address is the identity</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Result: role or VLAN for the port</text>
</svg><p class="cap">Three actors and one fallback: the switch asks, ClearPass decides, the port obeys.</p></div>

<h3>The lab network you will use</h3>
<p>Every lab uses the same site, "Mumbai HQ". The access switch <b>ACCESS</b> (12 ports, 1/1/1 to 1/1/12) connects up to router <b>R1</b> over trunk 1/1/1. ClearPass <b>CPPM</b> (10.20.60.10) and the application server <b>APP1</b> (10.20.70.20) sit behind R1. <b>LAPTOP1</b> (user alice) is on port 1/1/3, <b>LAPTOP2</b> (user bob) on 1/1/4 and the printer <b>PRN1</b> on 1/1/5.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th></tr>
<tr><td>10</td><td>EMPLOYEE</td><td>10.20.10.0/24</td></tr>
<tr><td>20</td><td>CONTRACTOR</td><td>10.20.20.0/24</td></tr>
<tr><td>30</td><td>IOT</td><td>10.20.30.0/24</td></tr>
<tr><td>40</td><td>GUEST</td><td>10.20.40.0/24</td></tr>
<tr><td>50</td><td>QUARANTINE</td><td>10.20.50.0/24</td></tr>
<tr><td>99</td><td>INFRA</td><td>10.20.99.0/24 (R1 .1, ACCESS .2)</td></tr></table>
<p>The switch sends its RADIUS requests from the Vlan99 address <code>10.20.99.2</code>. That is the address ClearPass knows as the network device. The shared secret is <code>ArubaNK1</code>.</p>

<div class="note"><p><b>Honest scope.</b> The labs run on two learning models, a ClearPass-style policy server and an AOS-CX-style switch. They are not vendor software. The real Policy Manager is configured in a web GUI under <b>Configuration</b>; the lab gives a text shell whose commands mirror those menu paths. In this course every such command is labelled <b>Lab shell</b>, and things the lab does not model are labelled <b>not simulated in the lab</b>.</p></div>

<h3>The three labs of this module</h3>
<ol>
<li><b>cp-role-case</b>: ClearPass accepts alice but the role name does not match the switch. You repair the right object.</li>
<li><b>cp-vlan-attrs</b>: users are accepted but the VLAN attribute is ignored because two of three attributes are missing.</li>
<li><b>cp-mac-auth</b>: the printer PRN1 has no supplicant; you build the MAC authentication service and the endpoint record.</li>
</ol>
<p>Chapters 2 to 4 give the foundations, chapters 5 to 7 map one-to-one onto the three labs, chapter 8 covers mixed ports and failure outcomes, chapter 9 is the troubleshooting workflow and chapter 10 the exam summary.</p>

<div class="eg"><p><b>Worked example.</b> Alice plugs LAPTOP1 into 1/1/3 at 09:00. The port starts unauthorized. After 802.1X succeeds, ClearPass answers Access-Accept with <code>Aruba-User-Role = EMPLOYEE</code>. ACCESS finds its own role EMPLOYEE, which says VLAN 10, moves the port into VLAN 10, and DHCP gives LAPTOP1 an address such as 10.20.10.50. Three systems agreed on one word, EMPLOYEE. If any one of them spells it differently, nothing works.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating "authenticated" and "authorized with network access" as the same thing. ClearPass can accept a user while the switch still refuses to apply the result. You will meet this three times in this module.</p></div>

<div class="exam"><p><b>Exam trap.</b> The supplicant talks EAPOL to the switch, never RADIUS. The switch talks RADIUS to ClearPass, never EAP to the user directly; it only carries EAP inside RADIUS.</p></div>

<div class="scn"><h4>The Monday morning reorganisation</h4><p>A branch moved its staff to new desks. Several users were accepted by ClearPass, yet half of them had no address. The switch team blamed ClearPass, the ClearPass team blamed the switch. A junior engineer opened the Access Tracker, saw Access-Accept with a role name, then looked at the switch client table and saw the role was not applied. Reading both sides in that order found the cause in ten minutes.</p><p><b>Lesson:</b> there are two sides to every wired login; read the policy server record and the switch client status together.</p></div>

<div class="iv"><p class="q">"Explain the difference between authentication and authorization in a NAC deployment."</p><p>Strong answer: authentication proves who or what the endpoint is (password in a PEAP tunnel, certificate, or a known MAC). Authorization decides what that identity may do: ClearPass maps attributes to roles, the enforcement policy picks a profile, and the profile returns a role or VLAN that the switch enforces. Add that a valid login can still end in a denial or a restricted role.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant, authenticator and authentication server are the three actors; the port is the enforcement point.</li>
<li>The switch sources RADIUS from 10.20.99.2 in the lab, and that address identifies the network device.</li>
<li>A placement is returned either as an Aruba-User-Role or as Tunnel VLAN attributes.</li>
<li>Printers and cameras without a supplicant use MAC authentication.</li>
<li>Lab shell commands mirror the real GUI paths; the GUI itself is not simulated in the lab.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Module 1 mein aapne switch aur ClearPass ke beech trust banaya aur pehli service build ki. Yeh module us pehli success ko ek real wired design mein badalta hai. End tak aap 802.1X exchange ko packet by packet explain kar paoge, ClearPass se users ko <b>role</b> ya <b>VLAN attribute</b> ke through place karwaoge, jis printer mein supplicant nahi hai use <b>MAC authentication</b> se admit karoge, aur kuch minutes mein pakad loge ki accepted user ko phir bhi network kyun nahi mila.</p>
<ul>
<li>Supplicant, authenticator aur authentication server kaise baat karte hain (EAPOL, EAP, RADIUS).</li>
<li>AOS-CX style port-access configuration: RADIUS server, server group, 802.1X aur MAC authentication, roles.</li>
<li>Wired services ke liye ClearPass ki decision chain: service, authentication, role mapping, enforcement.</li>
<li>Placement return karne ke do tareeke: <code>Aruba-User-Role</code> aur teen standard Tunnel attributes.</li>
<li>Case-sensitive role names, aur MAC authentication ke liye Endpoints Repository.</li>
</ul>
<p><b>Prerequisites:</b> pichla module (registered network device, shared secret, chalti hui Wired 802.1X service) aur basic VLAN aur DHCP ki samajh. Inhe hum dobara nahi padhayenge; sirf use karenge.</p>

<h3>Big picture: reception desk wali building</h3>
<p>Ek office building socho. <b>Lobby ka security guard</b> khud decide nahi karta ki kaun andar jaayega; woh <b>upar ke reception desk</b> ko phone karta hai, visitor ka naam padhta hai aur wait karta hai. Reception list check karke jawab deta hai: "isse andar jaane do, floor 10 par bhejo" ya "mana karo". Guard bas jawab follow karta hai. Ab ek delivery robot socho jo bol nahi sakta: guard ke paas padhne ke liye naam nahi hai, to woh robot ka serial number padhta hai aur reception known machines ki alag list dekhta hai.</p>
<p>Mapping: guard = <b>authenticator</b> (access switch ka port), visitor = <b>supplicant</b> (laptop ka software), reception = <b>authentication server</b> (ClearPass Policy Manager), floor number = <b>VLAN ya role</b>, aur robot = <b>MAC-authenticated device</b>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wired access control roles">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#bbf7d0"/><text x="85" y="97" text-anchor="middle" class="svg-ink" font-size="14">LAPTOP1</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">supplicant</text>
<rect x="255" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">ACCESS</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="97" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="555" y="116" text-anchor="middle" class="svg-muted" font-size="12">auth server</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="92" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="92" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<rect x="255" y="170" width="130" height="40" rx="8" fill="#fde68a"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">PRN1 (no supplicant)</text>
<line x1="320" y1="170" x2="320" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><text x="150" y="190" class="svg-muted" font-size="12">MAC address hi identity hai</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Result: port ke liye role ya VLAN</text>
</svg><p class="cap">Teen actors aur ek fallback: switch poochta hai, ClearPass decide karta hai, port maanta hai.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Har lab same site "Mumbai HQ" use karta hai. Access switch <b>ACCESS</b> (12 ports, 1/1/1 se 1/1/12) trunk 1/1/1 se router <b>R1</b> tak jaata hai. ClearPass <b>CPPM</b> (10.20.60.10) aur application server <b>APP1</b> (10.20.70.20) R1 ke peeche hain. <b>LAPTOP1</b> (user alice) port 1/1/3 par, <b>LAPTOP2</b> (user bob) 1/1/4 par aur printer <b>PRN1</b> 1/1/5 par hai.</p>
<table class="cmp"><tr><th>VLAN</th><th>Name</th><th>Subnet</th></tr>
<tr><td>10</td><td>EMPLOYEE</td><td>10.20.10.0/24</td></tr>
<tr><td>20</td><td>CONTRACTOR</td><td>10.20.20.0/24</td></tr>
<tr><td>30</td><td>IOT</td><td>10.20.30.0/24</td></tr>
<tr><td>40</td><td>GUEST</td><td>10.20.40.0/24</td></tr>
<tr><td>50</td><td>QUARANTINE</td><td>10.20.50.0/24</td></tr>
<tr><td>99</td><td>INFRA</td><td>10.20.99.0/24 (R1 .1, ACCESS .2)</td></tr></table>
<p>Switch apni RADIUS requests Vlan99 address <code>10.20.99.2</code> se bhejta hai. Yahi woh address hai jo ClearPass network device ke roop mein jaanta hai. Shared secret <code>ArubaNK1</code> hai.</p>

<div class="note"><p><b>Honest scope.</b> Labs do learning models par chalte hain, ek ClearPass-style policy server aur ek AOS-CX-style switch. Yeh vendor software nahi hain. Real Policy Manager web GUI mein <b>Configuration</b> ke neeche configure hota hai; lab ek text shell deta hai jiske commands un menu paths ko mirror karte hain. Is course mein aise har command ko <b>Lab shell</b> label kiya gaya hai, aur jo cheezein lab model nahi karta unhe <b>not simulated in the lab</b> label kiya gaya hai.</p></div>

<h3>Is module ke teen labs</h3>
<ol>
<li><b>cp-role-case</b>: ClearPass alice ko accept karta hai par role name switch se match nahi karta. Aap sahi object repair karoge.</li>
<li><b>cp-vlan-attrs</b>: users accept ho gaye par VLAN attribute ignore ho raha hai kyunki teen mein se do attributes missing hain.</li>
<li><b>cp-mac-auth</b>: printer PRN1 mein supplicant nahi hai; aap MAC authentication service aur endpoint record banaoge.</li>
</ol>
<p>Chapters 2 se 4 foundation dete hain, chapters 5 se 7 teeno labs se one-to-one map hote hain, chapter 8 mixed ports aur failure outcomes cover karta hai, chapter 9 troubleshooting workflow hai aur chapter 10 exam summary.</p>

<div class="eg"><p><b>Worked example.</b> Alice 09:00 baje LAPTOP1 ko 1/1/3 mein lagati hai. Port shuru mein unauthorized hota hai. 802.1X succeed hone ke baad ClearPass Access-Accept ke saath <code>Aruba-User-Role = EMPLOYEE</code> bhejta hai. ACCESS apna role EMPLOYEE dhoondhta hai jo VLAN 10 batata hai, port ko VLAN 10 mein daalta hai, aur DHCP LAPTOP1 ko 10.20.10.50 jaisa address deta hai. Teen systems ek hi shabd EMPLOYEE par agree hue. Agar koi ek bhi alag spelling rakhe, kuch kaam nahi karega.</p></div>

<div class="warn"><p><b>Common galti.</b> "Authenticated" aur "authorized with network access" ko ek hi cheez samajhna. ClearPass user ko accept kar sakta hai aur switch phir bhi result apply karne se mana kar sakta hai. Is module mein yeh aapko teen baar milega.</p></div>

<div class="exam"><p><b>Exam trap.</b> Supplicant switch se EAPOL bolta hai, kabhi RADIUS nahi. Switch ClearPass se RADIUS bolta hai, user se seedha EAP nahi; woh sirf EAP ko RADIUS ke andar carry karta hai.</p></div>

<div class="scn"><h4>Monday morning ka reorganisation</h4><p>Ek branch ne staff ko naye desks par shift kiya. Kai users ClearPass se accept hue, phir bhi aadhe logon ko address nahi mila. Switch team ne ClearPass ko blame kiya, ClearPass team ne switch ko. Ek junior engineer ne Access Tracker khola, role name ke saath Access-Accept dekha, phir switch client table dekhi aur dekha ki role apply nahi hua. Isi order mein dono sides padhne se das minute mein cause mil gaya.</p><p><b>Seekh:</b> har wired login ke do sides hote hain; policy server record aur switch client status saath padho.</p></div>

<div class="iv"><p class="q">"NAC deployment mein authentication aur authorization ka fark samjhao."</p><p>Strong answer: authentication prove karta hai ki endpoint kaun ya kya hai (PEAP tunnel mein password, certificate, ya known MAC). Authorization decide karta hai ki woh identity kya kar sakti hai: ClearPass attributes ko roles se map karta hai, enforcement policy profile chunti hai, aur profile role ya VLAN return karta hai jise switch enforce karta hai. Jodo ki valid login ke baad bhi denial ya restricted role mil sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Supplicant, authenticator aur authentication server teen actors hain; port enforcement point hai.</li>
<li>Lab mein switch RADIUS 10.20.99.2 se source karta hai, aur yahi address network device ko identify karta hai.</li>
<li>Placement ya to Aruba-User-Role se ya Tunnel VLAN attributes se return hoti hai.</li>
<li>Supplicant-less printers aur cameras MAC authentication use karte hain.</li>
<li>Lab shell commands real GUI paths ko mirror karte hain; GUI khud lab mein not simulated hai.</li>
</ul></div>
`}};export{e as default};