var e={id:`switch-config`,h:{en:`The switch side: AOS-CX port-access configuration`,hi:`Switch side: AOS-CX port-access configuration`},body:{en:`
<p>A switch port is like a door with a lock and a rulebook beside it. The lock (802.1X or MAC authentication) decides whether the door can open; the rulebook (<b>port-access roles</b>) says what the visitor may do once inside. ClearPass sends only a word such as EMPLOYEE; the rulebook on the switch gives that word its meaning.</p>

<h3>Four building blocks on the switch</h3>
<ol>
<li><b>RADIUS server definition</b>: address and key of ClearPass.</li>
<li><b>Server group</b>: a named list of RADIUS servers that authentication methods refer to.</li>
<li><b>Authentication methods</b>: 802.1X and MAC authentication, enabled globally and on each port.</li>
<li><b>Port-access roles</b>: named policies that carry a VLAN (and, in the real product, more such as ACLs).</li>
</ol>
<p>The rule that surprises beginners: a method only runs when it is enabled <b>both globally and on the port</b>, and the global section must name a server group that exists. Miss one and the port silently does nothing.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Switch building blocks">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">radius-server host</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10 + key</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">server group CPPM</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">server list</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">global methods</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">dot1x + mac-auth</text>
<line x1="200" y1="45" x2="230" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">interface 1/1/3</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">methods enabled per port</text>
<line x1="530" y1="70" x2="410" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="13">port-access role</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="12">EMPLOYEE: vlan 10</text>
<line x1="410" y1="135" x2="440" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Both global AND port must enable a method</text>
</svg><p class="cap">Server, group, methods, port and role: all five must exist before a login can succeed.</p></div>

<h3>Configuration walkthrough</h3>
<p>This is the AOS-CX style syntax, with the lab addresses. Comments start with an exclamation mark.</p>
<pre class="code"><span class="c">! 1. ClearPass as RADIUS server and a group</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
    exit
<span class="c">! 2. Global methods, both naming the group</span>
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
    exit
aaa authentication port-access mac-auth
    radius server-group CPPM
    enable
    exit
<span class="c">! 3. Roles: the meaning of the words ClearPass will send</span>
port-access role EMPLOYEE
    vlan access 10
    exit
port-access role CONTRACTOR
    vlan access 20
    exit
port-access role IOT
    vlan access 30
    exit
<span class="c">! 4. Methods on the access ports</span>
interface 1/1/3-1/1/5
    aaa authentication port-access dot1x authenticator
        enable
        exit
    aaa authentication port-access mac-auth
        enable
        exit
    exit</pre>
<p>Command names are representative of the AOS-CX style; check the exact syntax of your release. The RADIUS source address is the interface that routes toward the server. In the lab it is the Vlan99 address 10.20.99.2, and ClearPass must be told exactly that address.</p>

<h3>Verification</h3>
<pre class="out">ACCESS# show aaa authentication port-access
<span class="hl">Port-access dot1x authenticator : enabled, server-group CPPM</span>
Port-access mac-auth             : enabled, server-group CPPM

ACCESS# show radius-server
Server            Port   VRF       Status
10.20.60.10       1812   default   <span class="hl">reachable</span>

ACCESS# show port-access role EMPLOYEE
Role EMPLOYEE   VLAN access: 10   <span class="hl">VLAN status: present</span></pre>
<p>Three questions, three commands: is the method on, is the server reachable, does the role exist with a valid VLAN. Chapter 9 turns these into a routine.</p>

<h3>Role names and VLANs</h3>
<p>The role is applied only if a role with <b>exactly</b> that name exists on the switch, and a role whose VLAN does not exist cannot be applied. VLANs must also be allowed on the uplink trunk 1/1/1, otherwise the client authorizes but DHCP fails.</p>

<div class="eg"><p><b>Worked example.</b> Count what a new access port needs in the lab: one RADIUS host, one server group, two global methods, one role per placement, two port enables. For ports 1/1/3 to 1/1/5 using the interface range you save two repetitions of that last block. A well-planned template is therefore: global once, roles once, then one range for every access port.</p></div>

<div class="note"><p><b>Real platform note.</b> Real AOS-CX roles can also carry ACLs and other policy items, and ClearPass can push whole roles at login (downloadable user roles). Dynamic segmentation with tunnelled node and stacking (VSX) are also <b>not simulated in the lab</b>. In the lab a role is a name plus a VLAN.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling a method only on the port, or only globally. A second favourite: a typo in the server group name, so the global section points to a group that does not exist and no request is ever sent.</p></div>

<div class="exam"><p><b>Exam trap.</b> The order of precedence on the switch for a RADIUS answer is: a role named in Aruba-User-Role if it exists, otherwise a Tunnel VLAN if all three attributes are present, otherwise the port's own VLAN. Remember "role, then tunnel VLAN, then port VLAN".</p></div>

<div class="scn"><h4>The silent port</h4><p>A new floor was cabled and 802.1X enabled on the ports, but nothing appeared in ClearPass. The engineer saw the method configured on each interface and assumed it was fine. A show of the global section revealed that dot1x was configured but never enabled globally. One <code>enable</code> brought up every port on the floor.</p><p><b>Lesson:</b> check the global switch, the group and the port; a method is the product of all three.</p></div>

<div class="iv"><p class="q">"What must be configured on an access switch before ClearPass can authenticate a port?"</p><p>Strong answer: a RADIUS server with the shared secret, a server group, the method enabled globally with that group, the method enabled on the interface, and the roles or VLANs that ClearPass results refer to, plus an allowed VLAN list on the uplink. On the ClearPass side the switch must be a registered network device with the same secret and the right source address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five items are needed: server, group, global method, port method, roles.</li>
<li>A method runs only if enabled globally and per port, with an existing server group.</li>
<li>A role is a name plus a VLAN on the switch; ClearPass only sends the name.</li>
<li>Precedence: matching role, then complete Tunnel VLAN, then port VLAN.</li>
<li>Allow the VLANs on the uplink trunk or DHCP fails.</li>
</ul></div>
`,hi:`
<p>Switch port ek darwaaze jaisa hai jiske saath lock aur rulebook hai. Lock (802.1X ya MAC authentication) decide karta hai ki darwaaza khul sakta hai ya nahi; rulebook (<b>port-access roles</b>) batati hai ki andar aane ke baad visitor kya kar sakta hai. ClearPass sirf EMPLOYEE jaisa ek shabd bhejta hai; switch ki rulebook us shabd ko matlab deti hai.</p>

<h3>Switch par chaar building blocks</h3>
<ol>
<li><b>RADIUS server definition</b>: ClearPass ka address aur key.</li>
<li><b>Server group</b>: RADIUS servers ki named list jise authentication methods refer karte hain.</li>
<li><b>Authentication methods</b>: 802.1X aur MAC authentication, globally aur har port par enable.</li>
<li><b>Port-access roles</b>: named policies jinme VLAN hota hai (aur real product mein ACLs jaisa aur bhi kuch).</li>
</ol>
<p>Jo rule beginners ko surprise karta hai: method tabhi chalta hai jab woh <b>globally aur port dono par</b> enable ho, aur global section mein jo server group named hai woh exist kare. Ek bhi miss hua to port chupchaap kuch nahi karta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Switch building blocks">
<rect x="20" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="110" y="42" text-anchor="middle" class="svg-ink" font-size="13">radius-server host</text><text x="110" y="60" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10 + key</text>
<rect x="230" y="20" width="180" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">server group CPPM</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">server list</text>
<rect x="440" y="20" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="530" y="42" text-anchor="middle" class="svg-ink" font-size="13">global methods</text><text x="530" y="60" text-anchor="middle" class="svg-muted" font-size="12">dot1x + mac-auth</text>
<line x1="200" y1="45" x2="230" y2="45" stroke="#64748b" stroke-width="2"/><line x1="410" y1="45" x2="440" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">interface 1/1/3</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">methods har port par</text>
<line x1="530" y1="70" x2="410" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="13">port-access role</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="12">EMPLOYEE: vlan 10</text>
<line x1="410" y1="135" x2="440" y2="135" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="12">Global AUR port dono method enable karein</text>
</svg><p class="cap">Server, group, methods, port aur role: login succeed hone se pehle paanchon exist karne chahiye.</p></div>

<h3>Configuration walkthrough</h3>
<p>Yeh lab addresses ke saath AOS-CX style syntax hai. Comments exclamation mark se shuru hote hain.</p>
<pre class="code"><span class="c">! 1. ClearPass as RADIUS server and a group</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
aaa group server radius CPPM
    server 10.20.60.10
    exit
<span class="c">! 2. Global methods, both naming the group</span>
aaa authentication port-access dot1x authenticator
    radius server-group CPPM
    enable
    exit
aaa authentication port-access mac-auth
    radius server-group CPPM
    enable
    exit
<span class="c">! 3. Roles: the meaning of the words ClearPass will send</span>
port-access role EMPLOYEE
    vlan access 10
    exit
port-access role CONTRACTOR
    vlan access 20
    exit
port-access role IOT
    vlan access 30
    exit
<span class="c">! 4. Methods on the access ports</span>
interface 1/1/3-1/1/5
    aaa authentication port-access dot1x authenticator
        enable
        exit
    aaa authentication port-access mac-auth
        enable
        exit
    exit</pre>
<p>Command names AOS-CX style ke representative hain; apni release ka exact syntax check karo. RADIUS source address woh interface hai jo server ki taraf route karta hai. Lab mein yeh Vlan99 address 10.20.99.2 hai, aur ClearPass ko bilkul wahi address batana hai.</p>

<h3>Verification</h3>
<pre class="out">ACCESS# show aaa authentication port-access
<span class="hl">Port-access dot1x authenticator : enabled, server-group CPPM</span>
Port-access mac-auth             : enabled, server-group CPPM

ACCESS# show radius-server
Server            Port   VRF       Status
10.20.60.10       1812   default   <span class="hl">reachable</span>

ACCESS# show port-access role EMPLOYEE
Role EMPLOYEE   VLAN access: 10   <span class="hl">VLAN status: present</span></pre>
<p>Teen sawaal, teen commands: kya method on hai, kya server reachable hai, kya role valid VLAN ke saath exist karta hai. Chapter 9 inhe ek routine banata hai.</p>

<h3>Role names aur VLANs</h3>
<p>Role tabhi apply hota hai jab switch par <b>bilkul wahi</b> naam ka role ho, aur jis role ka VLAN exist nahi karta use apply nahi kiya ja sakta. VLANs ko uplink trunk 1/1/1 par bhi allow karna hota hai, warna client authorize ho jaata hai par DHCP fail hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab mein naye access port ko kya chahiye: ek RADIUS host, ek server group, do global methods, har placement ke liye ek role, do port enables. Ports 1/1/3 se 1/1/5 ke liye interface range use karne se aap aakhri block ke do repetitions bacha lete ho. Isliye ek achha template yeh hai: global ek baar, roles ek baar, phir har access port ke liye ek range.</p></div>

<div class="note"><p><b>Real platform note.</b> Real AOS-CX roles ACLs aur doosre policy items bhi le ja sakte hain, aur ClearPass login par poore roles push kar sakta hai (downloadable user roles). Tunnelled node ke saath dynamic segmentation aur stacking (VSX) bhi lab mein <b>not simulated in the lab</b> hain. Lab mein role ek naam plus ek VLAN hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Method sirf port par enable karna, ya sirf globally. Doosra favourite: server group name mein typo, jisse global section aise group ko point karta hai jo exist nahi karta aur koi request kabhi bheji hi nahi jaati.</p></div>

<div class="exam"><p><b>Exam trap.</b> RADIUS answer ke liye switch par precedence yeh hai: Aruba-User-Role mein named role agar exist kare, warna Tunnel VLAN agar teeno attributes hon, warna port ka apna VLAN. Yaad rakho "role, phir tunnel VLAN, phir port VLAN".</p></div>

<div class="scn"><h4>Khamosh port</h4><p>Ek nayi floor cable hui aur ports par 802.1X enable kiya gaya, par ClearPass mein kuch nahi dikha. Engineer ne har interface par method configured dekha aur maan liya ki theek hai. Global section dekhne par pata chala ki dot1x configured tha par globally kabhi enable nahi hua tha. Ek <code>enable</code> ne poori floor ke saare ports chala diye.</p><p><b>Seekh:</b> global switch, group aur port teeno check karo; method teeno ka product hai.</p></div>

<div class="iv"><p class="q">"ClearPass port ko authenticate kar sake, isse pehle access switch par kya configure hona chahiye?"</p><p>Strong answer: shared secret ke saath RADIUS server, ek server group, us group ke saath globally enabled method, interface par enabled method, aur woh roles ya VLANs jinhe ClearPass results refer karte hain, saath mein uplink par allowed VLAN list. ClearPass side par switch registered network device hona chahiye, same secret aur sahi source address ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch cheezein chahiye: server, group, global method, port method, roles.</li>
<li>Method tabhi chalta hai jab globally aur per port enabled ho aur server group exist kare.</li>
<li>Role switch par naam plus VLAN hai; ClearPass sirf naam bhejta hai.</li>
<li>Precedence: matching role, phir complete Tunnel VLAN, phir port VLAN.</li>
<li>Uplink trunk par VLANs allow karo warna DHCP fail hoga.</li>
</ul></div>
`}};export{e as default};