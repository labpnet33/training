var e={id:`dot1x`,h:{en:`802.1X and MAB: authenticate before you connect`,hi:`802.1X aur MAB: connect karne se pehle authenticate karo`},body:{en:`
<p>Every feature so far trusts a device because of <b>what it looks like</b>: its MAC, its IP, its DHCP lease. A clever attacker can copy all of those. A corporate office building does something stronger at the door: you show your ID badge, the guard checks it against the HR system, and only then does the turnstile open. <b>IEEE 802.1X</b> is that turnstile for a switch port. The port stays closed until the device proves <b>who it is</b> to a central server.</p>

<h3>The three roles</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>The software on the client (built into Windows, macOS, Linux, phones) that answers the switch and presents credentials: a username and password, or a certificate.</dd>
<dt>Authenticator</dt><dd>The switch (or wireless controller / access point). It does not decide anything itself; it relays the conversation and opens or keeps closed the port.</dd>
<dt>Authentication server</dt><dd>A <b>RADIUS</b> server (for example Cisco ISE) that checks the credentials against a user database and answers Accept or Reject, optionally with instructions such as which VLAN to use.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1X roles and protocols">
<rect x="10" y="70" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">switch SW1</text>
<rect x="480" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="96" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="555" y="116" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="160" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="395" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Before success: only EAPoL (plus CDP/LLDP/STP) passes the port</text>
</svg><p class="cap">EAP rides in EAPoL frames to the switch, and inside RADIUS from the switch to the server.</p></div>

<h3>How a login works</h3>
<ol>
<li>The laptop plugs in. The port is <b>unauthorized</b>: only EAPoL (EAP over LAN) frames are accepted; no DHCP, no ARP, no IP.</li>
<li>The switch sends an EAP Request-Identity; the supplicant answers with its identity.</li>
<li>The switch wraps the EAP messages in <b>RADIUS</b> and forwards them to the server. An <b>EAP method</b> (for example PEAP with a password, or EAP-TLS with certificates) runs end to end between supplicant and server.</li>
<li>The server returns <b>Access-Accept</b> (optionally with a VLAN or an ACL) or <b>Access-Reject</b>.</li>
<li>On Accept the port becomes <b>authorized</b> and normal traffic flows. On Reject it stays closed, or moves the device into a restricted VLAN if configured.</li>
</ol>

<h3>MAB: for devices without a supplicant</h3>
<p>Printers, cameras, badge readers and many IoT devices cannot run 802.1X. <b>MAC Authentication Bypass (MAB)</b> lets the switch use the device's <b>MAC address</b> as its identity: when no EAPoL answer comes back, the switch learns the MAC from the first frame and sends it to RADIUS as the username. The server checks it against a list of approved devices. MAB is weaker than 802.1X, because MACs can be copied, but it brings every device under central control and logging. The usual order is <b>802.1X first, then MAB as fallback</b>.</p>

<div class="eg"><p><b>Worked example.</b> SW1 Gi0/3 is a hot-desk port in VLAN 10. Staff laptops run PEAP with their domain account. Gi0/4 has a network printer, MAC 0050.7966.3c02, registered in the RADIUS server's device list. The RADIUS server is 10.99.0.10, shared key held by the security team.</p></div>

<h3>Configuration overview (classic IOS style)</h3>
<pre class="code">SW1(config)# aaa new-model
SW1(config)# radius server ISE1
SW1(config-radius-server)# address ipv4 10.99.0.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key NkLab-Radius-Key
SW1(config)# aaa group server radius ISE-GROUP
SW1(config-sg-radius)# server name ISE1
SW1(config)# aaa authentication dot1x default group ISE-GROUP
SW1(config)# aaa authorization network default group ISE-GROUP  <span class="c">! for VLAN/ACL from server</span>
SW1(config)# dot1x system-auth-control                           <span class="c">! global on switch</span>
SW1(config)# interface range g0/3 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# authentication port-control auto          <span class="c">! enforce</span>
SW1(config-if-range)# dot1x pae authenticator
SW1(config-if-range)# mab
SW1(config-if-range)# authentication order dot1x mab</pre>
<p>At CCNA level you are not expected to design an 802.1X deployment, but you must know the roles, the protocols (EAPoL and RADIUS), what MAB is for, and recognise this configuration. AAA itself (for device logins with TACACS+ and RADIUS) is covered in the hardening module.</p>

<h3>Verification</h3>
<pre class="out">SW1# show authentication sessions
Interface    MAC Address    Method   Domain   Status Fg  Session ID
<span class="hl">Gi0/3        0050.7966.3c01 dot1x    DATA     Auth        0A0A0AFE0000001A00F1C2D3
Gi0/4        0050.7966.3c02 mab      DATA     Auth        0A0A0AFE0000001B00F1C2E4</span></pre>
<p>Gi0/3 authorised through 802.1X, Gi0/4 (the printer) through MAB. A port showing <code>Unauth</code> is waiting or was rejected; check the RADIUS server's logs for the reason.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling <code>authentication port-control auto</code> before the RADIUS server knows the switch (shared key and client entry), which locks everyone out. (2) Forgetting MAB on ports with printers and phones. (3) Enabling 802.1X on uplinks or on the port towards the RADIUS server. (4) Rolling out in enforcement mode on day one instead of a monitor-only phase first.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the roles: <b>supplicant</b> = client, <b>authenticator</b> = switch/AP, <b>authentication server</b> = RADIUS. EAPoL runs between client and switch; RADIUS runs between switch and server. MAB authenticates by MAC for devices without a supplicant. 802.1X is also the basis of WPA2/WPA3-Enterprise on wireless.</p></div>

<div class="scn"><h4>The lobby port that stayed closed</h4><p>A consulting firm had open ports in its visitor lobby. After a laptop from a visitor spread malware, the firm deployed 802.1X on all user ports with MAB for printers, and unauthenticated devices were placed in a guest VLAN that reached only the internet. A month later a visitor plugged in again: the port stayed unauthorized for 802.1X, MAB found no matching MAC, and the device landed in the guest VLAN. <code>show authentication sessions</code> and the RADIUS log showed exactly who connected, where and when.</p><p><b>Lesson:</b> 802.1X changes the question from "does this device look right?" to "who is this?", and gives you an audit trail.</p></div>

<div class="iv"><p class="q">"Explain 802.1X. What are the components and what is MAB?"</p><p>Strong answer: port-based network access control. The supplicant on the client talks EAPoL to the authenticator (the switch), which relays EAP inside RADIUS to the authentication server; until the server sends Access-Accept, only EAPoL passes the port. The server can also push a VLAN or ACL. MAB is the fallback for devices without a supplicant: the switch sends the MAC as the identity. Mention that MAB is weaker because MACs can be spoofed, and that deployments start in monitor mode.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X authenticates an identity before the port forwards any traffic except EAPoL.</li>
<li>Roles: supplicant (client), authenticator (switch/AP), authentication server (RADIUS).</li>
<li>EAPoL between client and switch; RADIUS between switch and server; Access-Accept opens the port.</li>
<li>MAB uses the MAC as identity for printers, cameras and IoT; configure 802.1X first, MAB as fallback.</li>
<li>Verify with show authentication sessions; unauthorised ports point you to the RADIUS logs.</li>
</ul></div>
`,hi:`
<p>Ab tak ke har feature ne device par is baat se bharosa kiya ki woh <b>kaisa dikhta hai</b>: uska MAC, uska IP, uski DHCP lease. Chaalaak attacker in sabki copy kar sakta hai. Corporate office building darwaze par isse mazboot kaam karti hai: aap apna ID badge dikhate ho, guard use HR system se check karta hai, aur tabhi turnstile khulta hai. <b>IEEE 802.1X</b> switch port ke liye wahi turnstile hai. Port tab tak band rehta hai jab tak device central server ko prove na kare ki <b>woh kaun hai</b>.</p>

<h3>Teen roles</h3>
<dl class="terms">
<dt>Supplicant</dt><dd>Client par software (Windows, macOS, Linux, phones mein built-in) jo switch ko jawab deta hai aur credentials pesh karta hai: username aur password, ya certificate.</dd>
<dt>Authenticator</dt><dd>Switch (ya wireless controller / access point). Yeh khud kuch decide nahi karta; baatcheet relay karta hai aur port kholta ya band rakhta hai.</dd>
<dt>Authentication server</dt><dd>Ek <b>RADIUS</b> server (jaise Cisco ISE) jo credentials ko user database se check karta hai aur Accept ya Reject jawab deta hai, optionally instructions ke saath jaise kaunsa VLAN use karna hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="802.1X roles aur protocols">
<rect x="10" y="70" width="150" height="60" rx="8" fill="#e2e8f0"/><text x="85" y="96" text-anchor="middle" class="svg-ink" font-size="13">Supplicant</text><text x="85" y="116" text-anchor="middle" class="svg-muted" font-size="12">laptop</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Authenticator</text><text x="320" y="116" text-anchor="middle" class="svg-muted" font-size="12">switch SW1</text>
<rect x="480" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="96" text-anchor="middle" class="svg-ink" font-size="13">Auth server</text><text x="555" y="116" text-anchor="middle" class="svg-muted" font-size="12">RADIUS</text>
<line x1="160" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">EAPoL</text>
<line x1="395" y1="100" x2="480" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">RADIUS</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Success se pehle: port par sirf EAPoL (plus CDP/LLDP/STP) pass hota hai</text>
</svg><p class="cap">EAP switch tak EAPoL frames mein jaata hai, aur switch se server tak RADIUS ke andar.</p></div>

<h3>Login kaise hota hai</h3>
<ol>
<li>Laptop plug in hota hai. Port <b>unauthorized</b> hai: sirf EAPoL (EAP over LAN) frames accept hote hain; DHCP nahi, ARP nahi, IP nahi.</li>
<li>Switch EAP Request-Identity bhejta hai; supplicant apni identity se jawab deta hai.</li>
<li>Switch EAP messages ko <b>RADIUS</b> mein lapet kar server ko forward karta hai. Ek <b>EAP method</b> (jaise password ke saath PEAP, ya certificates ke saath EAP-TLS) supplicant aur server ke beech end to end chalta hai.</li>
<li>Server <b>Access-Accept</b> (optionally VLAN ya ACL ke saath) ya <b>Access-Reject</b> lautata hai.</li>
<li>Accept par port <b>authorized</b> ho jaata hai aur normal traffic chalta hai. Reject par band rehta hai, ya configured ho to device ko restricted VLAN mein daal deta hai.</li>
</ol>

<h3>MAB: bina supplicant wale devices ke liye</h3>
<p>Printers, cameras, badge readers aur bahut saare IoT devices 802.1X nahi chala sakte. <b>MAC Authentication Bypass (MAB)</b> switch ko device ka <b>MAC address</b> uski identity ki tarah use karne deta hai: jab koi EAPoL jawab nahi aata, switch pehle frame se MAC seekhta hai aur use username ki tarah RADIUS ko bhejta hai. Server use approved devices ki list se check karta hai. MAB 802.1X se kamzor hai, kyunki MACs copy ho sakte hain, lekin yeh har device ko central control aur logging mein le aata hai. Aam order hai <b>pehle 802.1X, phir fallback ke roop mein MAB</b>.</p>

<div class="eg"><p><b>Worked example.</b> SW1 Gi0/3 VLAN 10 mein hot-desk port hai. Staff laptops apne domain account ke saath PEAP chalate hain. Gi0/4 par network printer hai, MAC 0050.7966.3c02, jo RADIUS server ki device list mein registered hai. RADIUS server 10.99.0.10 hai, shared key security team ke paas hai.</p></div>

<h3>Configuration overview (classic IOS style)</h3>
<pre class="code">SW1(config)# aaa new-model
SW1(config)# radius server ISE1
SW1(config-radius-server)# address ipv4 10.99.0.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key NkLab-Radius-Key
SW1(config)# aaa group server radius ISE-GROUP
SW1(config-sg-radius)# server name ISE1
SW1(config)# aaa authentication dot1x default group ISE-GROUP
SW1(config)# aaa authorization network default group ISE-GROUP  <span class="c">! server se VLAN/ACL ke liye</span>
SW1(config)# dot1x system-auth-control                           <span class="c">! switch par global</span>
SW1(config)# interface range g0/3 - 4
SW1(config-if-range)# switchport mode access
SW1(config-if-range)# switchport access vlan 10
SW1(config-if-range)# authentication port-control auto          <span class="c">! enforce</span>
SW1(config-if-range)# dot1x pae authenticator
SW1(config-if-range)# mab
SW1(config-if-range)# authentication order dot1x mab</pre>
<p>CCNA level par aapse 802.1X deployment design karne ki umeed nahi hai, lekin aapko roles, protocols (EAPoL aur RADIUS), MAB kis liye hai yeh pata hona chahiye, aur yeh configuration pehchan-ni chahiye. AAA khud (TACACS+ aur RADIUS ke saath device logins ke liye) hardening module mein cover hota hai.</p>

<h3>Verification</h3>
<pre class="out">SW1# show authentication sessions
Interface    MAC Address    Method   Domain   Status Fg  Session ID
<span class="hl">Gi0/3        0050.7966.3c01 dot1x    DATA     Auth        0A0A0AFE0000001A00F1C2D3
Gi0/4        0050.7966.3c02 mab      DATA     Auth        0A0A0AFE0000001B00F1C2E4</span></pre>
<p>Gi0/3 802.1X se authorised hua, Gi0/4 (printer) MAB se. <code>Unauth</code> dikhane wala port ya to wait kar raha hai ya reject hua; reason ke liye RADIUS server ke logs check karo.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) RADIUS server ke switch ko jaanne se pehle (shared key aur client entry) <code>authentication port-control auto</code> enable karna, jo sabko lock out kar deta hai. (2) Printers aur phones wale ports par MAB bhool jaana. (3) Uplinks par ya RADIUS server ki taraf ke port par 802.1X enable karna. (4) Pehle monitor-only phase ki jagah pehle hi din enforcement mode mein roll out karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Roles yaad rakho: <b>supplicant</b> = client, <b>authenticator</b> = switch/AP, <b>authentication server</b> = RADIUS. EAPoL client aur switch ke beech chalta hai; RADIUS switch aur server ke beech. MAB bina supplicant wale devices ko MAC se authenticate karta hai. 802.1X wireless par WPA2/WPA3-Enterprise ka bhi base hai.</p></div>

<div class="scn"><h4>Lobby port jo band raha</h4><p>Ek consulting firm ke visitor lobby mein open ports the. Ek visitor ke laptop se malware failne ke baad firm ne saare user ports par 802.1X deploy kiya, printers ke liye MAB ke saath, aur unauthenticated devices ko ek guest VLAN mein daala jo sirf internet tak jaata tha. Ek mahine baad ek visitor ne phir laptop lagaya: port 802.1X ke liye unauthorized raha, MAB ko koi matching MAC nahi mila, aur device guest VLAN mein pahunch gaya. <code>show authentication sessions</code> aur RADIUS log ne exactly dikhaya ki kaun, kahan aur kab connect hua.</p><p><b>Seekh:</b> 802.1X sawaal ko "kya yeh device sahi dikhta hai?" se badal kar "yeh kaun hai?" bana deta hai, aur aapko audit trail deta hai.</p></div>

<div class="iv"><p class="q">"802.1X samjhao. Components kya hain aur MAB kya hai?"</p><p>Strong answer: port-based network access control. Client par supplicant authenticator (switch) se EAPoL mein baat karta hai, jo EAP ko RADIUS ke andar authentication server tak relay karta hai; jab tak server Access-Accept nahi bhejta, port par sirf EAPoL pass hota hai. Server VLAN ya ACL bhi push kar sakta hai. MAB bina supplicant wale devices ke liye fallback hai: switch MAC ko identity ki tarah bhejta hai. Batao ki MAB kamzor hai kyunki MACs spoof ho sakte hain, aur deployments monitor mode se shuru hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>802.1X port par EAPoL ke alawa koi traffic forward karne se pehle identity authenticate karta hai.</li>
<li>Roles: supplicant (client), authenticator (switch/AP), authentication server (RADIUS).</li>
<li>Client aur switch ke beech EAPoL; switch aur server ke beech RADIUS; Access-Accept port kholta hai.</li>
<li>MAB printers, cameras aur IoT ke liye MAC ko identity banata hai; pehle 802.1X, fallback mein MAB configure karo.</li>
<li>show authentication sessions se verify karo; unauthorised ports aapko RADIUS logs ki taraf bhejte hain.</li>
</ul></div>
`}};export{e as default};