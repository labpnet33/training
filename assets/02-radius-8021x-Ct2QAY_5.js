var e={id:`radius-8021x`,h:{en:`RADIUS, 802.1X and MAC authentication`,hi:`RADIUS, 802.1X aur MAC authentication`},body:{en:`
<p>Chapter 1 gave the picture: endpoint, switch, ClearPass. This chapter explains the two languages they speak. Between endpoint and switch the language is <b>802.1X</b> (or, for simple devices, the switch just reads the MAC address). Between switch and ClearPass the language is <b>RADIUS</b>.</p>

<h3>Analogy: the guard and the ID card</h3>
<p>At a hostel gate the guard asks for your ID card (that is 802.1X: a conversation between you and the gate). He does not know every resident, so he phones the warden's office and reads out the name (that is RADIUS: a phone line between the gate and the office). The warden says yes or no and may add "give him room 12" (that is the returned attribute). A visitor's parcel cannot speak at all, so the guard just reads the label on it (that is MAC authentication).</p>

<h3>802.1X: three actors</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Software on the endpoint that answers the login questions. Windows, macOS, Linux and phones include one.</dd>
<dt>Authenticator</dt><dd>The switch port (or wireless controller). It blocks everything except authentication frames until a decision arrives.</dd>
<dt>Authentication server</dt><dd>The RADIUS server. Here, ClearPass.</dd>
</dl>
<p>Until the port is authorized it only passes <b>EAPOL</b> (EAP over LAN) frames. The supplicant and ClearPass exchange <b>EAP</b> messages, which the switch wraps inside RADIUS and forwards without understanding them. The common method for passwords is <b>PEAP</b> with MSCHAPv2: the server first proves itself with a certificate, builds an encrypted tunnel, and then the user sends the username and password inside that tunnel. Certificate-based <b>EAP-TLS</b> is stronger and is covered in later modules; in this lab it is a concept that is not simulated.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="802.1X message flow">
<text x="70" y="22" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="570" y="22" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text>
<line x1="70" y1="30" x2="70" y2="215" stroke="#64748b"/><line x1="320" y1="30" x2="320" y2="215" stroke="#64748b"/><line x1="570" y1="30" x2="570" y2="215" stroke="#64748b"/>
<line x1="70" y1="55" x2="320" y2="55" stroke="#0ea5e9" stroke-width="2"/><text x="195" y="49" text-anchor="middle" class="svg-muted" font-size="12">EAPOL-Start / identity</text>
<line x1="320" y1="90" x2="570" y2="90" stroke="#8b5cf6" stroke-width="2"/><text x="445" y="84" text-anchor="middle" class="svg-muted" font-size="12">Access-Request (EAP)</text>
<line x1="570" y1="120" x2="70" y2="120" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">PEAP tunnel, challenge, password</text>
<line x1="570" y1="160" x2="320" y2="160" stroke="#16a34a" stroke-width="2"/><text x="445" y="154" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + attributes</text>
<line x1="320" y1="195" x2="70" y2="195" stroke="#16a34a" stroke-width="2"/><text x="195" y="189" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success, port open</text>
</svg><p class="cap">The switch relays; only ClearPass and the supplicant understand the EAP content.</p></div>

<h3>RADIUS in five facts</h3>
<ul>
<li>It runs over UDP: <b>1812</b> for authentication and <b>1813</b> for accounting (older systems used 1645 and 1646).</li>
<li>The switch is the <b>RADIUS client</b>; ClearPass is the <b>RADIUS server</b>. The "client" is the switch, not the laptop.</li>
<li>A request is an <b>Access-Request</b>. The answers are <b>Access-Accept</b>, <b>Access-Reject</b> or <b>Access-Challenge</b> (more EAP steps needed).</li>
<li>Both sides share a <b>shared secret</b> that protects the packet. It is configured per client device. A wrong secret means the packet is discarded silently.</li>
<li>Information travels as <b>attributes</b>: name/value pairs such as User-Name, NAS-IP-Address, NAS-Port-Type, Service-Type. ClearPass writes its reply attributes too, for example the Aruba-User-Role.</li>
</ul>

<h3>MAC authentication for devices that cannot do 802.1X</h3>
<p>Printers, cameras and badge readers often have no supplicant. For these the switch sends the device's <b>MAC address as the username and password</b> in a RADIUS request. ClearPass then looks the MAC up in its <b>Endpoints Repository</b>. MAC authentication is weaker, because a MAC address can be copied, so such devices usually get a restricted role. It is identification, not proof.</p>
<p>On the AOS-CX style switch both methods can be enabled on the same port. <b>802.1X is tried first</b>. A client with no supplicant stays silent, the switch waits (about 10 seconds in the lab model), and then falls back to MAC authentication.</p>

<h3>The attributes you will meet in this module</h3>
<table class="cmp"><tr><th>Attribute</th><th>Direction</th><th>Meaning</th></tr>
<tr><td>Radius:IETF:User-Name</td><td>switch to ClearPass</td><td>Username, or the MAC for MAC auth</td></tr>
<tr><td>Radius:IETF:NAS-IP-Address</td><td>switch to ClearPass</td><td>Address of the NAD</td></tr>
<tr><td>Radius:IETF:NAS-Port-Type</td><td>switch to ClearPass</td><td>15 = Ethernet (wired), 19 = IEEE 802.11 (wireless)</td></tr>
<tr><td>Radius:IETF:Service-Type</td><td>switch to ClearPass</td><td>1 = Login, 2 = Framed (802.1X), 10 = Call-Check (MAC auth, in Aruba practice)</td></tr>
<tr><td>Radius:Aruba:Aruba-User-Role</td><td>ClearPass to switch</td><td>Name of the role the switch must apply</td></tr></table>
<p>The lab model classifies wired requests with NAS-Port-Type 15 and Service-Type 1, 2 or 8 (Authenticate-Only). You will use exactly these values later when you repair a broken service rule.</p>

<div class="eg"><p><b>Worked example.</b> Alice's laptop sends EAPOL-Start. ACCESS builds an Access-Request with User-Name alice, NAS-IP-Address 10.20.99.2, NAS-Port-Type 15, source IP 10.20.99.2, and encloses the EAP data. ClearPass checks the packet against its secret for 10.20.99.2, runs the PEAP exchange over several Access-Challenge rounds, then sends one Access-Accept carrying Aruba-User-Role EMPLOYEE. The switch opens the port in role EMPLOYEE.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling the laptop the "RADIUS client". Forgetting that 802.1X is Layer 2 (EAPOL) between laptop and switch, while RADIUS is IP/UDP between switch and server. Believing MAC authentication proves identity.</p></div>

<div class="exam"><p><b>Exam trap.</b> The RADIUS packet cannot be accepted just because the user is valid: the source device must also be a known client with the right secret. And a Reject is an answer; a silent drop is not.</p></div>

<div class="scn"><h4>The printer that never logged in</h4><p>A new network printer sat on a port with only 802.1X enabled. It never sent EAPOL, so the port stayed unauthorized for ever and users blamed the network. The engineer enabled MAC authentication on the port, and the printer's MAC appeared in ClearPass as a known endpoint with a restricted printer role.</p><p><b>Lesson:</b> devices without supplicants need MAC authentication, and it must be enabled on the port, not just on the server.</p></div>

<div class="iv"><p class="q">"What is the difference between 802.1X and RADIUS?"</p><p>Strong answer: 802.1X is the port-based access control framework with EAP between supplicant and authenticator. RADIUS is the AAA protocol between the authenticator and the authentication server, carrying the EAP messages and the result. They are used together, but they run on different segments. Add the UDP ports 1812 and 1813 and the shared secret.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X: supplicant, authenticator (switch), authentication server (ClearPass).</li>
<li>RADIUS: UDP 1812 authentication, 1813 accounting; the switch is the client.</li>
<li>Accept, Reject and Challenge are the three server answers; a wrong secret is a silent drop.</li>
<li>MAC authentication serves supplicant-less devices and is weaker than 802.1X.</li>
<li>802.1X is tried first, then MAC authentication as fallback.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ne picture di: endpoint, switch, ClearPass. Yeh chapter un do languages ko samjhata hai jo woh bolte hain. Endpoint aur switch ke beech language <b>802.1X</b> hai (ya simple devices ke liye switch bas MAC address padh leta hai). Switch aur ClearPass ke beech language <b>RADIUS</b> hai.</p>

<h3>Analogy: guard aur ID card</h3>
<p>Hostel ke gate par guard aapka ID card maangta hai (yeh 802.1X hai: aapke aur gate ke beech baatcheet). Use har resident pata nahi, to woh warden ke office ko phone karke naam bolta hai (yeh RADIUS hai: gate aur office ke beech phone line). Warden haan ya na kehta hai aur "isse room 12 do" bhi jod sakta hai (yeh returned attribute hai). Visitor ka parcel bol hi nahi sakta, to guard bas uska label padh leta hai (yeh MAC authentication hai).</p>

<h3>802.1X: teen actors</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Endpoint ka software jo login ke sawaalon ka jawab deta hai. Windows, macOS, Linux aur phones mein ek hota hai.</dd>
<dt>Authenticator</dt><dd>Switch port (ya wireless controller). Jab tak decision na aaye, yeh authentication frames ke alawa sab block karta hai.</dd>
<dt>Authentication server</dt><dd>RADIUS server. Yahan, ClearPass.</dd>
</dl>
<p>Port authorized hone tak sirf <b>EAPOL</b> (EAP over LAN) frames pass karta hai. Supplicant aur ClearPass <b>EAP</b> messages exchange karte hain, jinhe switch RADIUS ke andar wrap karke bina samjhe forward kar deta hai. Passwords ke liye common method <b>PEAP</b> with MSCHAPv2 hai: server pehle certificate se khud ko prove karta hai, encrypted tunnel banata hai, aur phir user us tunnel ke andar username aur password bhejta hai. Certificate-based <b>EAP-TLS</b> zyada strong hai aur aage ke modules mein aayega; is lab mein yeh concept hai aur not simulated hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="802.1X message flow">
<text x="70" y="22" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="570" y="22" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text>
<line x1="70" y1="30" x2="70" y2="215" stroke="#64748b"/><line x1="320" y1="30" x2="320" y2="215" stroke="#64748b"/><line x1="570" y1="30" x2="570" y2="215" stroke="#64748b"/>
<line x1="70" y1="55" x2="320" y2="55" stroke="#0ea5e9" stroke-width="2"/><text x="195" y="49" text-anchor="middle" class="svg-muted" font-size="12">EAPOL-Start / identity</text>
<line x1="320" y1="90" x2="570" y2="90" stroke="#8b5cf6" stroke-width="2"/><text x="445" y="84" text-anchor="middle" class="svg-muted" font-size="12">Access-Request (EAP)</text>
<line x1="570" y1="120" x2="70" y2="120" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">PEAP tunnel, challenge, password</text>
<line x1="570" y1="160" x2="320" y2="160" stroke="#16a34a" stroke-width="2"/><text x="445" y="154" text-anchor="middle" class="svg-accent" font-size="12">Access-Accept + attributes</text>
<line x1="320" y1="195" x2="70" y2="195" stroke="#16a34a" stroke-width="2"/><text x="195" y="189" text-anchor="middle" class="svg-muted" font-size="12">EAP-Success, port open</text>
</svg><p class="cap">Switch sirf relay karta hai; EAP ka content sirf ClearPass aur supplicant samajhte hain.</p></div>

<h3>RADIUS paanch facts mein</h3>
<ul>
<li>Yeh UDP par chalta hai: authentication ke liye <b>1812</b> aur accounting ke liye <b>1813</b> (purane systems 1645 aur 1646 use karte the).</li>
<li>Switch <b>RADIUS client</b> hai; ClearPass <b>RADIUS server</b> hai. "Client" switch hai, laptop nahi.</li>
<li>Request <b>Access-Request</b> hoti hai. Jawab <b>Access-Accept</b>, <b>Access-Reject</b> ya <b>Access-Challenge</b> (aur EAP steps chahiye) hote hain.</li>
<li>Dono sides ek <b>shared secret</b> share karte hain jo packet ko protect karta hai. Yeh har client device ke liye configure hota hai. Galat secret ka matlab packet chupchap discard ho jata hai.</li>
<li>Information <b>attributes</b> mein jaati hai: name/value pairs jaise User-Name, NAS-IP-Address, NAS-Port-Type, Service-Type. ClearPass apne reply attributes bhi likhta hai, jaise Aruba-User-Role.</li>
</ul>

<h3>Jo devices 802.1X nahi kar sakte unke liye MAC authentication</h3>
<p>Printers, cameras aur badge readers mein aksar supplicant nahi hota. Inke liye switch device ka <b>MAC address username aur password dono bana kar</b> RADIUS request mein bhejta hai. ClearPass phir MAC ko apni <b>Endpoints Repository</b> mein dhoondhta hai. MAC authentication weak hai, kyunki MAC address copy ho sakta hai, isliye aise devices ko aam taur par restricted role milta hai. Yeh identification hai, proof nahi.</p>
<p>AOS-CX style switch par dono methods ek hi port par enable ho sakte hain. <b>802.1X pehle try hota hai</b>. Jis client ke paas supplicant nahi woh chup rehta hai, switch intezaar karta hai (lab model mein lagbhag 10 second), aur phir MAC authentication par fall back karta hai.</p>

<h3>Is module mein jo attributes milenge</h3>
<table class="cmp"><tr><th>Attribute</th><th>Direction</th><th>Matlab</th></tr>
<tr><td>Radius:IETF:User-Name</td><td>switch se ClearPass</td><td>Username, ya MAC auth mein MAC</td></tr>
<tr><td>Radius:IETF:NAS-IP-Address</td><td>switch se ClearPass</td><td>NAD ka address</td></tr>
<tr><td>Radius:IETF:NAS-Port-Type</td><td>switch se ClearPass</td><td>15 = Ethernet (wired), 19 = IEEE 802.11 (wireless)</td></tr>
<tr><td>Radius:IETF:Service-Type</td><td>switch se ClearPass</td><td>1 = Login, 2 = Framed (802.1X), 10 = Call-Check (Aruba practice mein MAC auth)</td></tr>
<tr><td>Radius:Aruba:Aruba-User-Role</td><td>ClearPass se switch</td><td>Us role ka naam jo switch ko apply karna hai</td></tr></table>
<p>Lab model wired requests ko NAS-Port-Type 15 aur Service-Type 1, 2 ya 8 (Authenticate-Only) se classify karta hai. Jab aap broken service rule repair karoge to yahi values use karoge.</p>

<div class="eg"><p><b>Worked example.</b> Alice ka laptop EAPOL-Start bhejta hai. ACCESS Access-Request banata hai: User-Name alice, NAS-IP-Address 10.20.99.2, NAS-Port-Type 15, source IP 10.20.99.2, aur EAP data andar. ClearPass 10.20.99.2 ke liye apna secret check karta hai, kai Access-Challenge rounds mein PEAP exchange chalata hai, phir ek Access-Accept bhejta hai jisme Aruba-User-Role EMPLOYEE hai. Switch port ko role EMPLOYEE mein khol deta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Laptop ko "RADIUS client" bolna. Yeh bhoolna ki 802.1X Layer 2 hai (laptop aur switch ke beech EAPOL), jabki RADIUS switch aur server ke beech IP/UDP hai. Yeh maanna ki MAC authentication identity prove karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS packet sirf isliye accept nahi hota ki user valid hai: source device bhi known client hona chahiye aur secret sahi hona chahiye. Aur Reject ek jawab hai; silent drop jawab nahi hai.</p></div>

<div class="scn"><h4>Printer jo kabhi login nahi hua</h4><p>Ek naya network printer aisi port par tha jahan sirf 802.1X enable tha. Usne kabhi EAPOL nahi bheja, to port hamesha unauthorized raha aur users network ko blame karte rahe. Engineer ne port par MAC authentication enable kiya, aur printer ka MAC ClearPass mein known endpoint ke roop mein restricted printer role ke saath dikha.</p><p><b>Seekh:</b> supplicant-less devices ko MAC authentication chahiye, aur woh port par enable hona chahiye, sirf server par nahi.</p></div>

<div class="iv"><p class="q">"802.1X aur RADIUS mein kya farak hai?"</p><p>Strong answer: 802.1X port-based access control framework hai jisme supplicant aur authenticator ke beech EAP chalta hai. RADIUS authenticator aur authentication server ke beech AAA protocol hai, jo EAP messages aur result carry karta hai. Dono saath use hote hain, par alag segments par chalte hain. UDP ports 1812 aur 1813 aur shared secret bhi batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X: supplicant, authenticator (switch), authentication server (ClearPass).</li>
<li>RADIUS: UDP 1812 authentication, 1813 accounting; switch client hai.</li>
<li>Accept, Reject aur Challenge teen server answers hain; galat secret silent drop hai.</li>
<li>MAC authentication supplicant-less devices ke liye hai aur 802.1X se weak hai.</li>
<li>802.1X pehle try hota hai, phir fallback MAC authentication.</li>
</ul></div>
`}};export{e as default};