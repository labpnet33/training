var e={id:`overview`,h:{en:`Who may plug in? What you will learn and the big picture`,hi:`Kaun plug in kar sakta hai? Kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will control access at the switch port with IEEE 802.1X and a RADIUS server on Juniper EX switches. You will configure 802.1X with dynamic VLAN assignment, MAC RADIUS for devices that cannot authenticate, a captive portal for visitors, and the fallback behaviour: guest VLAN, server-reject VLAN and server-fail. You will choose a supplicant mode, tune the timers and troubleshoot with real output. These are the Layer 2 Authentication and Access Control objectives of JNCIP-ENT (JN0-650).</p>
<p><b>Prerequisites.</b> VLANs and access ports (jncis-switching), and the Layer 2 security basics (jncis-l2sec). You should know what RADIUS is at the level of "a server that says yes or no". We build everything else.</p>

<h3>Analogy: the office reception desk</h3>
<p>A building has a locked inner door. Employees show a badge to the guard (the <b>authenticator</b>). The guard does not know every employee, so he phones the HR desk (the <b>RADIUS server</b>) and reads out what the badge says. HR answers "yes, and send her to the third floor" or "no". Machines like the coffee-machine tablet have no badge, so the guard has a special list of known serial numbers (<b>MAC RADIUS</b>). Visitors without a badge are given a form to fill at the front desk (<b>captive portal</b>). If the HR phone is dead, the guard follows an instruction: let everybody in, let nobody in, or keep letting in the people he remembers (<b>server-fail</b>).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.1X roles">
<rect x="20" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="96" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="90" y="114" text-anchor="middle" class="svg-muted" font-size="11">laptop, phone</text>
<rect x="250" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">EX switch port</text>
<rect x="480" y="70" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server</text><text x="550" y="114" text-anchor="middle" class="svg-muted" font-size="11">decides, may set VLAN</text>
<line x1="160" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="205" y="90" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="390" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="435" y="90" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Before success the port passes only EAPOL</text>
</svg><p class="cap">The switch relays; the server decides.</p></div>

<h3>Three roles, one rule</h3>
<table class="cmp"><tr><th>Role</th><th>Who</th><th>Speaks</th></tr>
<tr><td>Supplicant</td><td>host that wants access</td><td>EAPOL (EAP over LAN, EtherType 0x888E)</td></tr>
<tr><td>Authenticator</td><td>EX switch port</td><td>EAPOL to the host, RADIUS to the server</td></tr>
<tr><td>Authentication server</td><td>RADIUS</td><td>Access-Accept, Access-Reject, Access-Challenge</td></tr></table>
<p><b>The rule:</b> an unauthenticated port passes only EAPOL. No DHCP, no ARP, no ping. The switch never sees the password; it only relays the EAP conversation.</p>

<h3>The menu of methods on an EX port</h3>
<table class="cmp"><tr><th>Method</th><th>For</th><th>Identity</th></tr>
<tr><td>802.1X</td><td>laptops, phones with a supplicant</td><td>user name and credentials or certificate</td></tr>
<tr><td>MAC RADIUS</td><td>printers, cameras, many phones</td><td>the MAC address</td></tr>
<tr><td>Captive portal</td><td>visitors with only a browser</td><td>name and password on a web page</td></tr>
<tr><td>Static MAC bypass</td><td>a few fixed devices</td><td>list on the switch</td></tr>
<tr><td>Guest VLAN</td><td>hosts that never speak 802.1X</td><td>none</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A Pune training floor. Every desk port starts in the dead-end VLAN LOBBY. Trainer Riya logs in with 802.1X and RADIUS tells the switch to put her in VLAN STAFF. The guest printer cannot do 802.1X, so after the EAPOL requests time out it lands in GUEST. A laptop with an old saved password is rejected and stays out. You will build exactly this in the lab.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling 802.1X on the uplink or on a trunk. Only access ports are authenticator ports. Another classic: enabling it on all desks before the RADIUS server is reachable, locking everybody out.</p></div>
<div class="exam"><p><b>Exam trap.</b> The switch is the authenticator, not the authentication server. The RADIUS server may return a VLAN, but the switch enforces it.</p></div>

<div class="scn"><h4>The unmarked network jack</h4><p>A visiting vendor plugged a laptop into a free meeting-room jack and got a corporate IP address, because the port simply sat in the staff VLAN. After the audit the company moved every desk and meeting-room port to a dead-end VLAN with 802.1X, and the same jack gave the vendor nothing until he used the visitor portal.</p><p><b>Lesson:</b> the default of an access port should be "no access"; authentication earns access.</p></div>

<div class="iv"><p class="q">"What are the three roles in 802.1X?"</p><p>Supplicant, the client; authenticator, the switch port that relays; and authentication server, usually RADIUS, that decides. EAPOL runs between supplicant and authenticator, RADIUS between authenticator and server. Until success the port passes only EAPOL.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X is port-based network access control with three roles.</li>
<li>Unauthenticated ports pass only EAPOL.</li>
<li>Methods: 802.1X, MAC RADIUS, captive portal, static MAC, guest VLAN.</li>
<li>RADIUS can assign the VLAN; the switch enforces it.</li>
<li>Only access ports are authenticator ports.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap Juniper EX switches par IEEE 802.1X aur RADIUS server se switch port par access control karoge. 802.1X dynamic VLAN assignment ke saath, MAC RADIUS un devices ke liye jo authenticate nahi kar sakte, visitors ke liye captive portal, aur fallback behaviour: guest VLAN, server-reject VLAN aur server-fail configure karoge. Supplicant mode chunoge, timers tune karoge aur asli output se troubleshoot karoge. Yeh JNCIP-ENT (JN0-650) ke Layer 2 Authentication and Access Control objectives hain.</p>
<p><b>Prerequisites.</b> VLANs aur access ports (jncis-switching), aur Layer 2 security basics (jncis-l2sec). RADIUS ko "ek server jo haan ya na bolta hai" level par jaanna kaafi hai. Baaki sab hum banate hain.</p>

<h3>Analogy: office ka reception desk</h3>
<p>Ek building mein andar ka darwaza locked hai. Employees guard (<b>authenticator</b>) ko badge dikhate hain. Guard har employee ko nahi jaanta, to woh HR desk (<b>RADIUS server</b>) ko phone karke badge ki details padhta hai. HR jawab deta hai "haan, aur isse teesri manzil bhejo" ya "nahi". Coffee-machine tablet jaisi machines ke paas badge nahi hota, isliye guard ke paas known serial numbers ki special list hai (<b>MAC RADIUS</b>). Badge ke bina visitors ko front desk par form bharna padta hai (<b>captive portal</b>). HR ka phone mara ho to guard ko instruction hai: sab ko aane do, kisi ko mat aane do, ya jinhe yaad hai unhe aane do (<b>server-fail</b>).</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="802.1X roles">
<rect x="20" y="70" width="140" height="60" rx="10" fill="#bbf7d0"/><text x="90" y="96" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="90" y="114" text-anchor="middle" class="svg-muted" font-size="11">laptop, phone</text>
<rect x="250" y="70" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="11">EX switch port</text>
<rect x="480" y="70" width="140" height="60" rx="10" fill="#ddd6fe"/><text x="550" y="96" text-anchor="middle" class="svg-ink" font-size="13">RADIUS server</text><text x="550" y="114" text-anchor="middle" class="svg-muted" font-size="11">faisla, VLAN bhi de sakta</text>
<line x1="160" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><text x="205" y="90" text-anchor="middle" class="svg-accent" font-size="12">EAPOL</text>
<line x1="390" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="435" y="90" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Success se pehle port sirf EAPOL pass karta hai</text>
</svg><p class="cap">Switch relay karta hai; server faisla karta hai.</p></div>

<h3>Teen roles, ek rule</h3>
<table class="cmp"><tr><th>Role</th><th>Kaun</th><th>Kya bolta hai</th></tr>
<tr><td>Supplicant</td><td>access chahne wala host</td><td>EAPOL (EAP over LAN, EtherType 0x888E)</td></tr>
<tr><td>Authenticator</td><td>EX switch port</td><td>host ki taraf EAPOL, server ki taraf RADIUS</td></tr>
<tr><td>Authentication server</td><td>RADIUS</td><td>Access-Accept, Access-Reject, Access-Challenge</td></tr></table>
<p><b>Rule:</b> unauthenticated port sirf EAPOL pass karta hai. Na DHCP, na ARP, na ping. Switch password kabhi nahi dekhta; woh sirf EAP conversation relay karta hai.</p>

<h3>EX port par methods ka menu</h3>
<table class="cmp"><tr><th>Method</th><th>Kiske liye</th><th>Identity</th></tr>
<tr><td>802.1X</td><td>supplicant wale laptops, phones</td><td>user name aur credentials ya certificate</td></tr>
<tr><td>MAC RADIUS</td><td>printers, cameras, kai phones</td><td>MAC address</td></tr>
<tr><td>Captive portal</td><td>sirf browser wale visitors</td><td>web page par name aur password</td></tr>
<tr><td>Static MAC bypass</td><td>kuch fixed devices</td><td>switch par list</td></tr>
<tr><td>Guest VLAN</td><td>jo hosts 802.1X bolte hi nahi</td><td>koi nahi</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune training floor. Har desk port dead-end VLAN LOBBY se shuru hota hai. Trainer Riya 802.1X se login karti hai aur RADIUS switch ko VLAN STAFF mein daalne ko kehta hai. Guest printer 802.1X nahi kar sakta, isliye EAPOL requests timeout hone ke baad woh GUEST mein jaata hai. Purane saved password wala laptop reject hota hai aur bahar rehta hai. Lab mein aap yahi banaoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Uplink ya trunk par 802.1X enable karna. Sirf access ports authenticator ports hain. Ek aur classic: RADIUS server reachable hone se pehle saare desks par enable karna, jisse sab bahar ho jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Switch authenticator hai, authentication server nahi. RADIUS server VLAN return kar sakta hai, par enforce switch karta hai.</p></div>

<div class="scn"><h4>Bina marking wala network jack</h4><p>Ek visiting vendor ne meeting-room ke free jack mein laptop lagaya aur corporate IP address mil gaya, kyunki port seedha staff VLAN mein tha. Audit ke baad company ne har desk aur meeting-room port ko 802.1X ke saath dead-end VLAN mein daal diya, aur wahi jack vendor ko tab tak kuch nahi deta tha jab tak usne visitor portal use nahi kiya.</p><p><b>Lesson:</b> access port ka default "koi access nahi" hona chahiye; authentication access kamata hai.</p></div>

<div class="iv"><p class="q">"802.1X ke teen roles kaunse hain?"</p><p>Supplicant, yaani client; authenticator, switch port jo relay karta hai; aur authentication server, aam taur par RADIUS, jo faisla karta hai. EAPOL supplicant aur authenticator ke beech chalta hai, RADIUS authenticator aur server ke beech. Success tak port sirf EAPOL pass karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X teen roles wala port-based network access control hai.</li>
<li>Unauthenticated ports sirf EAPOL pass karte hain.</li>
<li>Methods: 802.1X, MAC RADIUS, captive portal, static MAC, guest VLAN.</li>
<li>RADIUS VLAN assign kar sakta hai; switch enforce karta hai.</li>
<li>Sirf access ports authenticator ports hain.</li>
</ul></div>
`}};export{e as default};