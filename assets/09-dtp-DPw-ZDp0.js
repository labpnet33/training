var e={id:`dtp`,h:{en:`DTP: how ports negotiate trunking, and why you turn it off`,hi:`DTP: ports trunking kaise negotiate karte hain, aur aap ise band kyun karte ho`},body:{en:`
<p>Imagine two shopkeepers deciding whether to open a shared back door between their shops. One is keen and keeps asking; one is polite and agrees if asked but never asks; one has already decided and nailed the door open; one has bricked it shut. Whether the door ends up open depends on the pair. <b>DTP</b>, the Dynamic Trunking Protocol, is that conversation between two switch ports, and a door that opens by conversation is exactly what an attacker hopes for.</p>

<h3>What DTP does</h3>
<p>DTP is a <b>Cisco-proprietary</b> protocol. Two directly connected Catalyst switch ports exchange DTP frames (about every 30 seconds, sent to the Cisco multicast MAC 0100.0ccc.cccc) and decide whether the link becomes an access link or a trunk, and on switches that support ISL, which encapsulation to use. Routers do not run DTP, and neither do Nexus switches or most other vendors' devices.</p>

<h3>The port modes</h3>
<dl class="terms">
<dt>switchport mode access</dt><dd>Always access. It will not become a trunk whatever the neighbour sends.</dd>
<dt>switchport mode trunk</dt><dd>Always trunk. It still sends DTP to invite the other side to trunk too.</dd>
<dt>switchport mode dynamic desirable</dt><dd>Actively asks to become a trunk; becomes one if the other side is trunk, desirable or auto.</dd>
<dt>switchport mode dynamic auto</dt><dd>Passive. Becomes a trunk only if the other side asks (trunk or desirable). This is the default on most current Catalyst access switches. (Some older platforms defaulted to desirable, so always check.)</dd>
<dt>switchport nonegotiate</dt><dd>Stops sending DTP frames. Allowed only with mode access or mode trunk, never with a dynamic mode.</dd>
</dl>

<h3>The combination table</h3>
<table class="cmp"><tr><th>SW1 / SW2</th><th>access</th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th></tr>
<tr><td><b>access</b></td><td>Access</td><td>Access</td><td>Access</td><td>Mismatch</td></tr>
<tr><td><b>dynamic auto</b></td><td>Access</td><td><b>Access</b></td><td>Trunk</td><td>Trunk</td></tr>
<tr><td><b>dynamic desirable</b></td><td>Access</td><td>Trunk</td><td>Trunk</td><td>Trunk</td></tr>
<tr><td><b>trunk</b></td><td>Mismatch</td><td>Trunk</td><td>Trunk</td><td>Trunk</td></tr>
</table>
<p>Remember three rules and you can rebuild the whole table: <b>someone must ask</b> (auto + auto = access, because both wait); <b>access always wins</b> against dynamic modes; and <b>trunk + access is a misconfiguration</b>: one side tags, the other does not, so at best only untagged traffic works. Never build it on purpose.</p>
<p>Two extra rules that interviewers love:</p>
<ul>
<li><b>trunk + nonegotiate</b> on one side forms a trunk only if the other side is also statically <b>trunk</b>. A dynamic neighbour hears no DTP, so it stays access.</li>
<li>DTP frames carry the <b>VTP domain name</b>. If two switches in dynamic modes have different VTP domain names, DTP will not form a trunk (the switch logs a DTP domain mismatch).</li>
</ul>

<h3>Seeing DTP in the output</h3>
<pre class="out">SW1# show interfaces GigabitEthernet0/0 switchport
Name: Gi0/0
Switchport: Enabled
<span class="hl">Administrative Mode: dynamic auto</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
<span class="hl">Negotiation of Trunking: On</span>
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)</pre>
<p><b>Administrative Mode</b> is what you configured; <b>Operational Mode</b> is what the port actually is right now. This is lab 2 before you start: both ends are at the default dynamic auto, so the link between SW1 and SW2 is an access link in VLAN 1 and <code>show interfaces trunk</code> prints nothing. In <code>show interfaces trunk</code>, the Mode column shows <code>on</code> for a static trunk and <code>desirable</code> or <code>auto</code> for negotiated ones; an encapsulation shown as <code>n-802.1q</code> means it was negotiated.</p>

<h3>The fix and the best practice</h3>
<pre class="code"><span class="c">! Lab 2, on SW1 and SW2: static trunk, no DTP</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
<span class="c">! Every user port: static access</span>
SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport mode access</pre>
<p>After this, <code>show interfaces switchport</code> on Gi0/0 shows <code>Administrative Mode: trunk</code>, <code>Operational Mode: trunk</code> and <code>Negotiation of Trunking: Off</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="An attacker laptop sends DTP desirable to a user port left in dynamic auto and becomes a trunk to all VLANs">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#fed7aa"/><text x="105" y="96" text-anchor="middle" class="svg-ink" font-size="13">Attacker laptop</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">sends DTP desirable</text>
<rect x="260" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="335" y="96" text-anchor="middle" class="svg-ink" font-size="13">ACC switch</text><text x="335" y="114" text-anchor="middle" class="svg-muted" font-size="12">port: dynamic auto</text>
<rect x="480" y="40" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="63" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 users</text>
<rect x="480" y="90" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="545" y="113" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 servers</text>
<rect x="480" y="140" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="163" text-anchor="middle" class="svg-ink" font-size="12">VLAN 99 mgmt</text>
<line x1="180" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="4"/><text x="220" y="90" text-anchor="middle" class="svg-accent" font-size="12">trunk!</text>
<line x1="410" y1="100" x2="480" y2="58" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="158" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Switch spoofing: a dynamic user port hands out every VLAN</text>
</svg><p class="cap">Switch spoofing. Hard-coding user ports as access removes the attack completely.</p></div>

<h3>Why DTP is a security risk</h3>
<p>If a user port is left in a dynamic mode, anything plugged into it that speaks DTP desirable (another switch, or a laptop running an attack tool) can turn the port into a trunk and reach every allowed VLAN. This is <b>switch spoofing</b>, one of the two classic VLAN hopping attacks (the other is double tagging from chapter 8). The defence is simple and is on every hardening checklist: <b>user ports</b> <code>switchport mode access</code>; <b>trunk ports</b> <code>switchport mode trunk</code> plus <code>switchport nonegotiate</code>; unused ports shut down in a parking VLAN.</p>

<div class="eg"><p><b>Worked example.</b> Predict the result for each pair: (a) desirable + auto: trunk. (b) auto + auto: access. (c) trunk + auto: trunk. (d) trunk with nonegotiate + desirable: access on the desirable side and a trunk on the other, a broken link, because the desirable port never hears DTP. (e) access + desirable: access.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving both ends of a new uplink at defaults (auto + auto, no trunk); setting <code>nonegotiate</code> on one side only while the other side is dynamic; and trusting that a user port "is access" because a PC is plugged in. Check the Administrative Mode.</p></div>

<div class="exam"><p><b>Exam trap.</b> auto + auto = access; desirable + auto = trunk. <code>nonegotiate</code> cannot be combined with a dynamic mode. And DTP is Cisco-proprietary: it does not negotiate with a router, a Nexus switch or a server NIC.</p></div>

<div class="scn"><h4>The meeting-room port</h4><p>During an authorised penetration test at a finance company, the tester plugged a laptop running a DTP tool into a meeting-room wall port. Within seconds the port became a trunk, and the laptop could send tagged frames into the server and management VLANs. The port had never been configured: it was at the default dynamic auto. The network team audited every switch with <code>show interfaces switchport | include Name|Administrative Mode</code>, found about 300 dynamic ports, and pushed a template: user ports static access, uplinks trunk with nonegotiate, spare ports shut in a parking VLAN. The retest found no way to form a trunk.</p><p><b>Lesson:</b> DTP defaults are built for convenience, not security. Decide every port's mode yourself.</p></div>

<div class="iv"><p class="q">"Two switches are connected and both ports are at dynamic auto. What happens, and what would you configure instead?"</p><p>Strong answer: auto only answers DTP requests and never asks, so neither side asks and the link comes up as an access link in VLAN 1. I would statically configure both ends with <code>switchport mode trunk</code> and <code>switchport nonegotiate</code>, set the native VLAN and allowed list, and verify with <code>show interfaces trunk</code>. Mention that dynamic user ports enable switch-spoofing attacks, so user ports are hard-coded as access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DTP is Cisco-proprietary trunk negotiation between switch ports; modes are access, trunk, dynamic desirable and dynamic auto.</li>
<li>Someone must ask: auto + auto = access; desirable with auto, desirable or trunk = trunk.</li>
<li>Trunk + access is a misconfiguration; nonegotiate works only with a static trunk on the far side.</li>
<li>Compare Administrative Mode and Operational Mode in <code>show interfaces switchport</code>.</li>
<li>Best practice: user ports static access, trunks static with nonegotiate; this blocks switch spoofing.</li>
</ul></div>
`,hi:`
<p>Do dukandaar socho jo decide kar rahe hain ki dono dukanon ke beech ek shared peeche ka darwaza kholein ya nahi. Ek utsuk hai aur baar baar poochta hai; ek polite hai, poocho to maan jaata hai par khud kabhi nahi poochta; ek ne pehle hi decide karke darwaza keel se khula thok diya hai; ek ne use eenton se band kar diya hai. Darwaza khulega ya nahi, yeh jodi par depend karta hai. <b>DTP</b>, Dynamic Trunking Protocol, do switch ports ke beech yahi baatcheet hai, aur baatcheet se khulne wala darwaza bilkul wahi hai jiski attacker ko ummeed hoti hai.</p>

<h3>DTP kya karta hai</h3>
<p>DTP ek <b>Cisco-proprietary</b> protocol hai. Do directly connected Catalyst switch ports DTP frames exchange karte hain (lagbhag har 30 seconds, Cisco multicast MAC 0100.0ccc.cccc par) aur decide karte hain ki link access link banega ya trunk, aur jo switches ISL support karte hain unpar kaunsa encapsulation use hoga. Routers DTP nahi chalate, na hi Nexus switches ya zyada tar doosre vendors ke devices.</p>

<h3>Port modes</h3>
<dl class="terms">
<dt>switchport mode access</dt><dd>Hamesha access. Neighbour kuch bhi bheje, yeh trunk nahi banega.</dd>
<dt>switchport mode trunk</dt><dd>Hamesha trunk. Phir bhi doosri side ko trunk ke liye invite karne ke liye DTP bhejta hai.</dd>
<dt>switchport mode dynamic desirable</dt><dd>Khud aage badh kar trunk banne ko kehta hai; doosri side trunk, desirable ya auto ho to trunk ban jaata hai.</dd>
<dt>switchport mode dynamic auto</dt><dd>Passive. Trunk tabhi banta hai jab doosri side maange (trunk ya desirable). Zyada tar current Catalyst access switches par yahi default hai. (Kuch purane platforms par default desirable tha, isliye hamesha check karo.)</dd>
<dt>switchport nonegotiate</dt><dd>DTP frames bhejna band karta hai. Sirf mode access ya mode trunk ke saath allowed, dynamic mode ke saath kabhi nahi.</dd>
</dl>

<h3>Combination table</h3>
<table class="cmp"><tr><th>SW1 / SW2</th><th>access</th><th>dynamic auto</th><th>dynamic desirable</th><th>trunk</th></tr>
<tr><td><b>access</b></td><td>Access</td><td>Access</td><td>Access</td><td>Mismatch</td></tr>
<tr><td><b>dynamic auto</b></td><td>Access</td><td><b>Access</b></td><td>Trunk</td><td>Trunk</td></tr>
<tr><td><b>dynamic desirable</b></td><td>Access</td><td>Trunk</td><td>Trunk</td><td>Trunk</td></tr>
<tr><td><b>trunk</b></td><td>Mismatch</td><td>Trunk</td><td>Trunk</td><td>Trunk</td></tr>
</table>
<p>Teen rules yaad rakho aur poori table dobara bana sakte ho: <b>kisi ko maangna padega</b> (auto + auto = access, kyunki dono wait karte hain); dynamic modes ke against <b>access hamesha jeetta hai</b>; aur <b>trunk + access misconfiguration hai</b>: ek side tag karti hai, doosri nahi, isliye zyada se zyada sirf untagged traffic chalta hai. Ise kabhi jaan boojh kar mat banao.</p>
<p>Do extra rules jo interviewers ko pasand hain:</p>
<ul>
<li>Ek side par <b>trunk + nonegotiate</b> tabhi trunk banata hai jab doosri side bhi statically <b>trunk</b> ho. Dynamic neighbour ko koi DTP sunai nahi deta, isliye woh access rehta hai.</li>
<li>DTP frames <b>VTP domain name</b> carry karte hain. Agar dynamic modes wale do switches ke VTP domain names alag hain, to DTP trunk nahi banayega (switch DTP domain mismatch log karta hai).</li>
</ul>

<h3>Output mein DTP dekhna</h3>
<pre class="out">SW1# show interfaces GigabitEthernet0/0 switchport
Name: Gi0/0
Switchport: Enabled
<span class="hl">Administrative Mode: dynamic auto</span>
<span class="hl">Operational Mode: static access</span>
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
<span class="hl">Negotiation of Trunking: On</span>
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)</pre>
<p><b>Administrative Mode</b> woh hai jo aapne configure kiya; <b>Operational Mode</b> woh hai jo port abhi asal mein hai. Yeh shuru karne se pehle ka lab 2 hai: dono ends default dynamic auto par hain, isliye SW1 aur SW2 ke beech ka link VLAN 1 mein access link hai aur <code>show interfaces trunk</code> kuch print nahi karta. <code>show interfaces trunk</code> mein Mode column static trunk ke liye <code>on</code> aur negotiated ke liye <code>desirable</code> ya <code>auto</code> dikhata hai; encapsulation <code>n-802.1q</code> dikhe to matlab woh negotiate hua tha.</p>

<h3>Fix aur best practice</h3>
<pre class="code"><span class="c">! Lab 2, SW1 aur SW2 par: static trunk, koi DTP nahi</span>
SW1(config)# interface GigabitEthernet0/0
SW1(config-if)# switchport mode trunk
SW1(config-if)# switchport nonegotiate
<span class="c">! Har user port: static access</span>
SW1(config)# interface range GigabitEthernet0/1 - 2
SW1(config-if-range)# switchport mode access</pre>
<p>Iske baad Gi0/0 par <code>show interfaces switchport</code> dikhata hai <code>Administrative Mode: trunk</code>, <code>Operational Mode: trunk</code> aur <code>Negotiation of Trunking: Off</code>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Attacker laptop dynamic auto par chhode gaye user port ko DTP desirable bhejta hai aur saare VLANs ka trunk ban jaata hai">
<rect x="30" y="70" width="150" height="60" rx="8" fill="#fed7aa"/><text x="105" y="96" text-anchor="middle" class="svg-ink" font-size="13">Attacker laptop</text><text x="105" y="114" text-anchor="middle" class="svg-muted" font-size="12">DTP desirable bhejta</text>
<rect x="260" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="335" y="96" text-anchor="middle" class="svg-ink" font-size="13">ACC switch</text><text x="335" y="114" text-anchor="middle" class="svg-muted" font-size="12">port: dynamic auto</text>
<rect x="480" y="40" width="130" height="36" rx="8" fill="#bbf7d0"/><text x="545" y="63" text-anchor="middle" class="svg-ink" font-size="12">VLAN 10 users</text>
<rect x="480" y="90" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="545" y="113" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 servers</text>
<rect x="480" y="140" width="130" height="36" rx="8" fill="#fde68a"/><text x="545" y="163" text-anchor="middle" class="svg-ink" font-size="12">VLAN 99 mgmt</text>
<line x1="180" y1="100" x2="260" y2="100" stroke="#64748b" stroke-width="4"/><text x="220" y="90" text-anchor="middle" class="svg-accent" font-size="12">trunk!</text>
<line x1="410" y1="100" x2="480" y2="58" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="108" stroke="#64748b" stroke-width="2"/><line x1="410" y1="100" x2="480" y2="158" stroke="#64748b" stroke-width="2"/>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Switch spoofing: dynamic user port har VLAN de deta hai</text>
</svg><p class="cap">Switch spoofing. User ports ko access hard-code karne se yeh attack poori tarah khatam ho jaata hai.</p></div>

<h3>DTP security risk kyun hai</h3>
<p>Agar user port dynamic mode mein chhoda gaya, to usme lagi koi bhi cheez jo DTP desirable bolti hai (doosra switch, ya attack tool chalata laptop) port ko trunk bana sakti hai aur har allowed VLAN tak pahunch sakti hai. Yeh <b>switch spoofing</b> hai, do classic VLAN hopping attacks mein se ek (doosra chapter 8 ka double tagging hai). Bachav simple hai aur har hardening checklist mein hai: <b>user ports</b> <code>switchport mode access</code>; <b>trunk ports</b> <code>switchport mode trunk</code> plus <code>switchport nonegotiate</code>; unused ports parking VLAN mein shutdown.</p>

<div class="eg"><p><b>Worked example.</b> Har jodi ka result predict karo: (a) desirable + auto: trunk. (b) auto + auto: access. (c) trunk + auto: trunk. (d) nonegotiate wala trunk + desirable: desirable side par access aur doosri taraf trunk, yaani toota hua link, kyunki desirable port ko kabhi DTP sunai nahi deta. (e) access + desirable: access.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Naye uplink ke dono ends defaults par chhodna (auto + auto, koi trunk nahi); sirf ek side par <code>nonegotiate</code> lagana jabki doosri side dynamic hai; aur yeh maan lena ki user port "access hai" kyunki usme PC laga hai. Administrative Mode check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> auto + auto = access; desirable + auto = trunk. <code>nonegotiate</code> dynamic mode ke saath combine nahi ho sakta. Aur DTP Cisco-proprietary hai: yeh router, Nexus switch ya server NIC ke saath negotiate nahi karta.</p></div>

<div class="scn"><h4>Meeting-room ka port</h4><p>Ek finance company mein authorised penetration test ke dauran tester ne DTP tool chalata laptop meeting-room ke wall port mein lagaya. Kuch hi seconds mein port trunk ban gaya, aur laptop server aur management VLANs mein tagged frames bhej sakta tha. Port kabhi configure hi nahi hua tha: woh default dynamic auto par tha. Network team ne har switch ko <code>show interfaces switchport | include Name|Administrative Mode</code> se audit kiya, lagbhag 300 dynamic ports mile, aur ek template push kiya: user ports static access, uplinks nonegotiate ke saath trunk, spare ports parking VLAN mein shut. Retest mein trunk banane ka koi raasta nahi mila.</p><p><b>Seekh:</b> DTP defaults convenience ke liye bane hain, security ke liye nahi. Har port ka mode khud decide karo.</p></div>

<div class="iv"><p class="q">"Do switches jude hain aur dono ports dynamic auto par hain. Kya hoga, aur aap iski jagah kya configure karoge?"</p><p>Strong answer: auto sirf DTP requests ka jawab deta hai aur kabhi khud nahi maangta, isliye koi side nahi maangti aur link VLAN 1 mein access link ki tarah up hota hai. Main dono ends ko statically <code>switchport mode trunk</code> aur <code>switchport nonegotiate</code> se configure karunga, native VLAN aur allowed list set karunga, aur <code>show interfaces trunk</code> se verify karunga. Mention karo ki dynamic user ports switch-spoofing attacks ko mauka dete hain, isliye user ports access hard-code kiye jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DTP switch ports ke beech Cisco-proprietary trunk negotiation hai; modes access, trunk, dynamic desirable aur dynamic auto hain.</li>
<li>Kisi ko maangna padega: auto + auto = access; desirable ke saath auto, desirable ya trunk = trunk.</li>
<li>Trunk + access misconfiguration hai; nonegotiate sirf tab chalta hai jab far side par static trunk ho.</li>
<li><code>show interfaces switchport</code> mein Administrative Mode aur Operational Mode compare karo.</li>
<li>Best practice: user ports static access, trunks nonegotiate ke saath static; isse switch spoofing rukta hai.</li>
</ul></div>
`}};export{e as default};