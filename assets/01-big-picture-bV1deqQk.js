var e={id:`big-picture`,h:{en:`The big picture: who are you, what are you, and where may you go?`,hi:`Big picture: aap kaun ho, kya ho, aur kahan jaa sakte ho?`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why "plug in and you are on the network" is a security hole, and how <b>network access control (NAC)</b> closes it.</li>
<li>The three 802.1X roles, the EAP methods, and <b>MAB</b> for devices that cannot authenticate themselves.</li>
<li>How <b>Cisco ISE</b> is built: personas, nodes, network devices, RADIUS, policy sets, authentication and authorization policies, conditions and authorization profiles.</li>
<li>What ISE can send back to the switch: a <b>VLAN</b>, a <b>downloadable ACL (dACL)</b>, a <b>Security Group Tag (SGT)</b> or a web redirect.</li>
<li>Profiling, guest services and WebAuth, BYOD onboarding, and <b>posture</b> (compliance and remediation).</li>
<li><b>Change of Authorization (CoA, RFC 5176)</b>: re-authenticate, port bounce and disconnect, on UDP 1700 or 3799.</li>
<li>TrustSec, device administration with TACACS+ in ISE, and a troubleshooting workflow built on <b>Live Logs</b>.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should be comfortable with VLANs, access ports, DHCP and switched virtual interfaces from the CCNA track, and with AAA and RADIUS/TACACS+ basics from the module <b>AAA and secure device management</b> (sec-aaa-mgmt). The Layer 2 defences of <b>sec-infra</b> (port security, DHCP snooping, DAI) are the layer underneath this one. You do not need to have touched ISE before.</p>

<h3>An analogy: the office building</h3>
<p>Picture a modern office tower. At the front door there is a <b>turnstile</b>. Employees tap a badge; the turnstile does not decide anything itself, it asks the <b>security desk</b>, which checks a list and answers "let her in, floors 3 to 5 only". Contractors without a badge are photographed and given a visitor sticker that opens only the lobby café. A courier robot that cannot hold a badge is recognised by its serial number and sent to the loading dock. And if security later learns that an employee is carrying something dangerous, they can call the turnstile and change that person's access <b>while they are already inside</b>.</p>
<p>Map it onto the network: the turnstile is the <b>access switch</b> (the authenticator), the badge holder is the <b>endpoint</b> (the supplicant), the security desk is <b>Cisco ISE</b>, the floor list is the <b>authorization result</b> (VLAN, ACL, SGT), the visitor sticker is <b>guest access</b>, the robot's serial number is <b>MAB</b>, and the phone call to change access mid-visit is <b>CoA</b>.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAC big picture">
<rect x="20" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1 (priya)</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">802.1X</text>
<rect x="20" y="100" width="130" height="44" rx="8" fill="#fde68a"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">CAM1 camera</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="12">MAB</text>
<rect x="20" y="170" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="190" text-anchor="middle" class="svg-ink" font-size="13">GUEST1</text><text x="85" y="206" text-anchor="middle" class="svg-muted" font-size="12">no credentials</text>
<rect x="250" y="90" width="140" height="64" rx="8" fill="#bae6fd"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="14">ACC-SW1</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<line x1="150" y1="52" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="150" y1="122" x2="250" y2="122" stroke="#64748b" stroke-width="2"/><line x1="150" y1="192" x2="250" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="90" width="140" height="64" rx="8" fill="#ddd6fe"/><text x="550" y="116" text-anchor="middle" class="svg-ink" font-size="14">ISE</text><text x="550" y="134" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.10</text>
<line x1="390" y1="112" x2="480" y2="112" stroke="#64748b" stroke-width="2"/><text x="435" y="104" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<line x1="480" y1="140" x2="390" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="435" y="160" text-anchor="middle" class="svg-accent" font-size="12">CoA</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff · VLAN 40 cameras (SGT 40) · VLAN 50 guest</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">VLAN 90 quarantine after a failed posture check</text>
</svg><p class="cap">The whole module in one picture: three kinds of endpoint, one authenticator, one policy server, and CoA to change a live session.</p></div>

<h3>The problem NAC solves</h3>
<p>Without access control, any switch port in a meeting room is a live connection into the corporate VLAN. A visitor, a contractor's infected laptop or a rogue Raspberry Pi gets DHCP, a gateway and a path to file servers. Firewalls at the edge do not help, because the device is already inside. Port security (from sec-infra) limits <b>how many</b> MAC addresses use a port, but it cannot tell <b>who</b> is behind the MAC.</p>
<p>NAC answers three questions for every connection:</p>
<ol>
<li><b>Who are you?</b> A user identity proven with 802.1X (a password or, better, a certificate), or a device identity for things that cannot log in.</li>
<li><b>What are you, and are you healthy?</b> A corporate laptop, a personal phone, a printer, a camera; patched and running anti-malware or not. This is profiling and posture.</li>
<li><b>Where may you go?</b> The authorization: a VLAN, an ACL, an SGT, a guest portal or nothing at all.</li>
</ol>
<p>And because the answer can change, NAC needs a fourth ability: <b>change the decision on a live session</b>. That is CoA.</p>

<h3>The labs in this module</h3>
<table class="cmp"><tr><th>Lab</th><th>What you build or fix</th><th>Chapters</th></tr>
<tr><td>Staff, cameras and guests on one access switch</td><td>ACC-SW1 (SW1 in the topology): AAA, RADIUS to ISE 10.99.99.10 with key NKise26, 802.1X then MAB, guest VLAN 50; PC1 into VLAN 20, CAM1 into VLAN 40 with SGT 40</td><td>3, 4, 5, 8</td></tr>
<tr><td>CoA: posture failure quarantines, remediation restores</td><td>NAS-SW trusts ISE for dynamic authorization (key NKcoa); ISE moves priya to VLAN 90 and back</td><td>10</td></tr>
<tr><td>CoA ignored: the NAS drops the disconnect</td><td>Find the missing <code>aaa server radius dynamic-author</code> client and fix it</td><td>10, 12</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A 48-port access switch serves a floor with 30 staff laptops, 6 printers, 4 IP cameras and a meeting room. With NAC, the 30 laptops run 802.1X and land in VLAN 20; the 10 printers and cameras use MAB and are profiled into VLAN 40 with SGT 40; anything unknown that plugs into the meeting room lands in guest VLAN 50 with internet-only access. If one laptop later fails a posture check, ISE sends one CoA and only that port moves to quarantine VLAN 90. The other 47 ports are untouched.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking ISE "is the firewall". ISE makes decisions; the <b>switch, WLC or VPN headend enforces them</b>. If the switch is not configured to accept the VLAN, ACL or CoA that ISE sends, nothing happens, and that is the root cause of most tickets in this module.</p></div>

<div class="exam"><p><b>Exam trap.</b> In 802.1X the switch is the <b>authenticator</b>, not the authentication server. The authentication server is ISE (RADIUS). Questions often swap the two names.</p></div>

<div class="scn"><h4>The meeting-room Raspberry Pi</h4><p>A retail company found an unknown small computer plugged into a meeting-room wall port, quietly scanning the server VLAN. The port was a plain access port in the corporate VLAN. The team rolled out 802.1X with MAB on all user-facing ports, first in monitor mode to see what would fail, then in closed mode. Three months later the same kind of device would only have received a guest address with internet access, and ISE Live Logs would have shown an unknown MAC hitting the default rule.</p><p><b>Lesson:</b> the access port is the front door. NAC turns it from "always open" into "open for the right identity, to the right place".</p></div>

<div class="iv"><p class="q">"Explain network access control to me as if I were new to the team."</p><p>Strong answer: NAC makes every connection prove an identity before it gets network access. The switch blocks the port, relays the identity to ISE over RADIUS, and ISE replies with an authorization such as a VLAN, a dACL or an SGT. Devices without a supplicant use MAB, guests use a portal, and ISE can change a live session with CoA when posture or threat status changes. Mention that ISE decides and the network device enforces.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAC answers who you are, what you are, whether you are healthy, and where you may go.</li>
<li>Supplicant = endpoint, authenticator = switch/WLC, authentication server = ISE over RADIUS.</li>
<li>Results are VLAN, dACL, SGT or redirect; the network device enforces them.</li>
<li>MAB covers devices without a supplicant; guests and BYOD use portals.</li>
<li>CoA lets ISE change a live session without the user re-plugging.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<ul>
<li>"Plug karo aur network par ho" ek security hole kyun hai, aur <b>network access control (NAC)</b> use kaise band karta hai.</li>
<li>802.1X ke teen roles, EAP methods, aur <b>MAB</b> un devices ke liye jo khud authenticate nahi kar sakte.</li>
<li><b>Cisco ISE</b> kaise bana hai: personas, nodes, network devices, RADIUS, policy sets, authentication aur authorization policies, conditions aur authorization profiles.</li>
<li>ISE switch ko kya wapas bhej sakta hai: ek <b>VLAN</b>, ek <b>downloadable ACL (dACL)</b>, ek <b>Security Group Tag (SGT)</b> ya web redirect.</li>
<li>Profiling, guest services aur WebAuth, BYOD onboarding, aur <b>posture</b> (compliance aur remediation).</li>
<li><b>Change of Authorization (CoA, RFC 5176)</b>: re-authenticate, port bounce aur disconnect, UDP 1700 ya 3799 par.</li>
<li>TrustSec, ISE mein TACACS+ ke saath device administration, aur <b>Live Logs</b> par bana troubleshooting workflow.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko CCNA track se VLANs, access ports, DHCP aur switched virtual interfaces mein comfortable hona chahiye, aur module <b>AAA and secure device management</b> (sec-aaa-mgmt) se AAA aur RADIUS/TACACS+ basics aane chahiye. <b>sec-infra</b> ke Layer 2 defences (port security, DHCP snooping, DAI) is layer ke neeche wali layer hain. ISE pehle kabhi chhua ho, yeh zaroori nahi.</p>

<h3>Ek analogy: office building</h3>
<p>Ek modern office tower socho. Front door par ek <b>turnstile</b> hai. Employees badge tap karte hain; turnstile khud kuch decide nahi karta, woh <b>security desk</b> se poochta hai, jo ek list check karke jawab deta hai "ise andar aane do, sirf floor 3 se 5". Bina badge wale contractors ki photo li jaati hai aur unhe visitor sticker milta hai jo sirf lobby café kholta hai. Ek courier robot jo badge pakad nahi sakta, apne serial number se pehchana jaata hai aur loading dock bheja jaata hai. Aur agar security ko baad mein pata chale ki ek employee kuch khatarnak le ja raha hai, to woh turnstile ko call karke us insaan ka access badal sakte hain <b>jab woh pehle se andar hai</b>.</p>
<p>Ise network par map karo: turnstile <b>access switch</b> hai (authenticator), badge holder <b>endpoint</b> hai (supplicant), security desk <b>Cisco ISE</b> hai, floor list <b>authorization result</b> hai (VLAN, ACL, SGT), visitor sticker <b>guest access</b> hai, robot ka serial number <b>MAB</b> hai, aur visit ke beech access badalne wali phone call <b>CoA</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="NAC big picture">
<rect x="20" y="30" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="50" text-anchor="middle" class="svg-ink" font-size="13">PC1 (priya)</text><text x="85" y="66" text-anchor="middle" class="svg-muted" font-size="12">802.1X</text>
<rect x="20" y="100" width="130" height="44" rx="8" fill="#fde68a"/><text x="85" y="120" text-anchor="middle" class="svg-ink" font-size="13">CAM1 camera</text><text x="85" y="136" text-anchor="middle" class="svg-muted" font-size="12">MAB</text>
<rect x="20" y="170" width="130" height="44" rx="8" fill="#fed7aa"/><text x="85" y="190" text-anchor="middle" class="svg-ink" font-size="13">GUEST1</text><text x="85" y="206" text-anchor="middle" class="svg-muted" font-size="12">koi credentials nahi</text>
<rect x="250" y="90" width="140" height="64" rx="8" fill="#bae6fd"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="14">ACC-SW1</text><text x="320" y="134" text-anchor="middle" class="svg-muted" font-size="12">authenticator</text>
<line x1="150" y1="52" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="150" y1="122" x2="250" y2="122" stroke="#64748b" stroke-width="2"/><line x1="150" y1="192" x2="250" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="480" y="90" width="140" height="64" rx="8" fill="#ddd6fe"/><text x="550" y="116" text-anchor="middle" class="svg-ink" font-size="14">ISE</text><text x="550" y="134" text-anchor="middle" class="svg-muted" font-size="12">10.99.99.10</text>
<line x1="390" y1="112" x2="480" y2="112" stroke="#64748b" stroke-width="2"/><text x="435" y="104" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<line x1="480" y1="140" x2="390" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/><text x="435" y="160" text-anchor="middle" class="svg-accent" font-size="12">CoA</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 staff · VLAN 40 cameras (SGT 40) · VLAN 50 guest</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">posture fail hone par VLAN 90 quarantine</text>
</svg><p class="cap">Poora module ek picture mein: teen tarah ke endpoints, ek authenticator, ek policy server, aur live session badalne ke liye CoA.</p></div>

<h3>NAC kaunsi problem solve karta hai</h3>
<p>Access control ke bina meeting room ka har switch port corporate VLAN mein ek live connection hai. Visitor, contractor ka infected laptop ya rogue Raspberry Pi DHCP, gateway aur file servers tak raasta paa leta hai. Edge ke firewalls madad nahi karte, kyunki device pehle se andar hai. Port security (sec-infra se) limit karti hai ki port par <b>kitne</b> MAC addresses chalein, par woh nahi bata sakti ki MAC ke peeche <b>kaun</b> hai.</p>
<p>NAC har connection ke liye teen sawaalon ka jawab deta hai:</p>
<ol>
<li><b>Aap kaun ho?</b> 802.1X se proven user identity (password ya, behtar, certificate), ya un cheezon ke liye device identity jo login nahi kar saktin.</li>
<li><b>Aap kya ho, aur kya healthy ho?</b> Corporate laptop, personal phone, printer, camera; patched aur anti-malware chalate hue ya nahi. Yeh profiling aur posture hai.</li>
<li><b>Aap kahan jaa sakte ho?</b> Authorization: ek VLAN, ek ACL, ek SGT, guest portal ya kuch bhi nahi.</li>
</ol>
<p>Aur kyunki jawab badal sakta hai, NAC ko ek chauthi kaabiliyat chahiye: <b>live session par decision badalna</b>. Woh CoA hai.</p>

<h3>Is module ke labs</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya banaate ya fix karte ho</th><th>Chapters</th></tr>
<tr><td>Staff, cameras and guests on one access switch</td><td>ACC-SW1 (topology mein SW1): AAA, key NKise26 ke saath ISE 10.99.99.10 tak RADIUS, pehle 802.1X phir MAB, guest VLAN 50; PC1 VLAN 20 mein, CAM1 SGT 40 ke saath VLAN 40 mein</td><td>3, 4, 5, 8</td></tr>
<tr><td>CoA: posture failure quarantines, remediation restores</td><td>NAS-SW dynamic authorization ke liye ISE ko trust karta hai (key NKcoa); ISE priya ko VLAN 90 mein aur wapas le jaata hai</td><td>10</td></tr>
<tr><td>CoA ignored: the NAS drops the disconnect</td><td>Missing <code>aaa server radius dynamic-author</code> client dhoondo aur fix karo</td><td>10, 12</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek 48-port access switch ek floor serve karta hai jismein 30 staff laptops, 6 printers, 4 IP cameras aur ek meeting room hai. NAC ke saath 30 laptops 802.1X chalate hain aur VLAN 20 mein jaate hain; 10 printers aur cameras MAB use karte hain aur profile hokar SGT 40 ke saath VLAN 40 mein jaate hain; meeting room mein plug hone wali koi bhi anjaan cheez internet-only access ke saath guest VLAN 50 mein jaati hai. Agar baad mein ek laptop posture check fail kare, to ISE ek CoA bhejta hai aur sirf woh port quarantine VLAN 90 mein jaata hai. Baaki 47 ports ko koi chhoota bhi nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki ISE "firewall hai". ISE decisions leta hai; <b>switch, WLC ya VPN headend unhe enforce karte hain</b>. Agar switch ISE ke bheje VLAN, ACL ya CoA ko accept karne ke liye configure nahi hai, to kuch nahi hota, aur is module ke zyada tar tickets ki root cause yahi hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 802.1X mein switch <b>authenticator</b> hai, authentication server nahi. Authentication server ISE (RADIUS) hai. Questions aksar dono naam ulat dete hain.</p></div>

<div class="scn"><h4>Meeting room ka Raspberry Pi</h4><p>Ek retail company ko meeting room ke wall port mein ek anjaan chhota computer laga mila, jo chup-chaap server VLAN scan kar raha tha. Port corporate VLAN ka ek plain access port tha. Team ne saare user-facing ports par MAB ke saath 802.1X roll out kiya, pehle monitor mode mein yeh dekhne ke liye ki kya fail hoga, phir closed mode mein. Teen mahine baad wahi device sirf internet access wala guest address paata, aur ISE Live Logs dikhate ki ek anjaan MAC default rule hit kar raha hai.</p><p><b>Seekh:</b> access port front door hai. NAC use "hamesha khula" se "sahi identity ke liye, sahi jagah tak khula" bana deta hai.</p></div>

<div class="iv"><p class="q">"Mujhe network access control aise samjhao jaise main team mein naya hoon."</p><p>Strong answer: NAC har connection se network access milne se pehle identity prove karwata hai. Switch port block karta hai, identity ko RADIUS par ISE tak relay karta hai, aur ISE VLAN, dACL ya SGT jaisa authorization wapas deta hai. Bina supplicant wale devices MAB use karte hain, guests portal use karte hain, aur posture ya threat status badalne par ISE CoA se live session badal sakta hai. Batao ki ISE decide karta hai aur network device enforce karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAC jawab deta hai ki aap kaun ho, kya ho, healthy ho ya nahi, aur kahan jaa sakte ho.</li>
<li>Supplicant = endpoint, authenticator = switch/WLC, authentication server = RADIUS par ISE.</li>
<li>Results VLAN, dACL, SGT ya redirect hote hain; network device unhe enforce karta hai.</li>
<li>MAB bina supplicant wale devices cover karta hai; guests aur BYOD portals use karte hain.</li>
<li>CoA ISE ko bina user ke dobara plug kiye live session badalne deta hai.</li>
</ul></div>
`}};export{e as default};