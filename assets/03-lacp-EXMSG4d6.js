var e={id:`lacp`,h:{en:`LACP: active, passive, priorities and standby ports`,hi:`LACP: active, passive, priorities aur standby ports`},body:{en:`
<p>Back to the two friends. This time, before leaving home, one of them phones the other: "Are you still coming to the station at 6? Same platform?" Only when the answer is "yes, platform 2" does either of them set off. That phone call is <b>LACP</b>. It costs a little effort, but nobody ever waits on the wrong platform.</p>

<h3>What LACP is</h3>
<p>The <b>Link Aggregation Control Protocol</b> is the open standard for negotiating bundles, first defined in IEEE 802.3ad and now in <b>IEEE 802.1AX</b>. Because it is a standard, it works between Cisco switches, other vendors' switches, servers, firewalls, storage arrays and hypervisors. It is the protocol the CCNA blueprint names, and in practice it is the default choice for every new bundle.</p>
<p>Each member port sends <b>LACPDUs</b> (LACP data units) to the Slow Protocols multicast MAC <code>01:80:C2:00:00:02</code>. These frames are link-local: they never leave the cable and are never blocked by STP. By default a port asks its partner for <b>slow</b> LACPDUs, one every 30 seconds, and declares the partner dead after 90 seconds of silence. With <code>lacp rate fast</code> on the interface, a port asks for one per second and the timeout drops to 3 seconds.</p>

<h3>The two modes</h3>
<dl class="terms">
<dt>active</dt><dd>The port <b>initiates</b>: it sends LACPDUs on its own, whether or not it has heard from a partner.</dd>
<dt>passive</dt><dd>The port only <b>responds</b>: it sends LACPDUs only after it receives one. Two passive ports therefore wait for each other forever.</dd>
</dl>
<p>Active with active and active with passive both form a bundle. Passive with passive never does. Most engineers simply use active on both ends; there is no downside and it removes one way to get it wrong.</p>

<h3>What LACP checks</h3>
<p>LACPDUs carry an identity. Each switch has a <b>system ID</b> made of the <b>system priority</b> (default 32768) plus its base MAC address. Each port has a <b>port ID</b> made of the <b>port priority</b> (default 32768) plus a port number, and each bundle has a <b>key</b> (on Cisco, derived from the channel-group number). A port joins the bundle only if its partner reports the same system ID and key as the partners of the other members. So if someone patches Gi0/3 into the wrong switch, LACP sees a different partner system ID and refuses to bundle that port. Static mode could never catch that.</p>

<h3>16 ports, 8 active, 8 hot-standby</h3>
<p>An LACP bundle can hold up to <b>16</b> ports, but at most <b>8</b> are active and forwarding. The rest are <b>hot-standby</b>, shown with the flag <code>H</code>, and take over if an active member fails. Which 8 are active is decided like this:</p>
<ol>
<li>The switch with the <b>lower system ID</b> is in charge: lower system priority wins; on a tie, the lower MAC wins.</li>
<li>That switch keeps the ports with the <b>lower port ID</b> active: lower port priority wins; on a tie, the lower port number wins.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ten 1 Gbps links join DSW1 and ASW1, all in channel-group 10. Both switches have system priority 32768. DSW1's MAC ends in .0001 and ASW1's in .0002, so DSW1 is in charge. By default Gi0/1 to Gi0/8 (lowest port numbers) are active and Gi0/9 and Gi0/10 show <code>(H)</code>. You want Gi0/9 and Gi0/10 active instead of Gi0/1 and Gi0/2 because they land on a different line card. Set <code>lacp port-priority 100</code> on Gi0/3 to Gi0/10 on DSW1. If you want ASW1 to decide instead, give it <code>lacp system-priority 100</code> in global configuration. Changing port priority on the switch that is not in charge has no effect, a favourite interview catch.</p></div>

<p>Two more controls live on the port-channel interface. <code>lacp max-bundle 4</code> limits the number of active members to fewer than 8. <code>port-channel min-links 2</code> takes the whole port-channel down if fewer than 2 members are up, which is useful when a half-strength bundle is worse than failing over to another path.</p>

<h3>Lab walkthrough: three uplinks with LACP</h3>
<p>In the second lab a warehouse access switch, ASW1, hosts Wi-Fi access points in VLAN 30 (AP1, 10.3.0.20) and cameras in VLAN 40 (CAM1, 10.4.0.20). The gateways are SVIs on the Layer 3 switch DSW1: 10.3.0.1 and 10.4.0.1. Three uplinks, Gi0/1 to Gi0/3, join the switches.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="LACP lab topology">
<rect x="250" y="20" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DSW1</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">LACP active</text>
<rect x="250" y="140" width="140" height="48" rx="8" fill="#bae6fd"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="14">ASW1</text><text x="320" y="179" text-anchor="middle" class="svg-muted" font-size="12">LACP passive</text>
<line x1="295" y1="68" x2="295" y2="140" stroke="#64748b" stroke-width="3"/><line x1="320" y1="68" x2="320" y2="140" stroke="#64748b" stroke-width="3"/><line x1="345" y1="68" x2="345" y2="140" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="104" rx="42" ry="14" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="375" y="100" class="svg-accent" font-size="12">Po10: Gi0/1-3</text><text x="375" y="116" class="svg-muted" font-size="12">trunk VLAN 30,40</text>
<rect x="80" y="180" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="140" y="200" text-anchor="middle" class="svg-ink" font-size="13">AP1 VLAN 30</text><text x="140" y="216" text-anchor="middle" class="svg-muted" font-size="12">10.3.0.20</text>
<rect x="440" y="180" width="120" height="44" rx="8" fill="#fde68a"/><text x="500" y="200" text-anchor="middle" class="svg-ink" font-size="13">CAM1 VLAN 40</text><text x="500" y="216" text-anchor="middle" class="svg-muted" font-size="12">10.4.0.20</text>
<line x1="250" y1="170" x2="200" y2="200" stroke="#64748b"/><line x1="390" y1="170" x2="440" y2="200" stroke="#64748b"/>
</svg><p class="cap">Lab 2: DSW1 (active) and ASW1 (passive) bundle three uplinks into Po10.</p></div>

<pre class="code">DSW1(config)# interface range g0/1 - 3
DSW1(config-if-range)# channel-group 10 mode active
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 10
DSW1(config-if)# switchport mode trunk
DSW1(config-if)# switchport trunk allowed vlan 30,40

ASW1(config)# interface range g0/1 - 3
ASW1(config-if-range)# channel-group 10 mode passive
ASW1(config-if-range)# exit
ASW1(config)# interface port-channel 10
ASW1(config-if)# switchport mode trunk
ASW1(config-if)# switchport trunk allowed vlan 30,40
<span class="c">! The lab also sets "port-channel load-balance src-dst-ip" globally on both. Chapter 8 explains it.</span></pre>

<pre class="out">ASW1# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 10 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
<span class="hl">Gi0/1     SA      32768     5254.0001.0001  11s    0x0    0xA    0x2     0x3D</span>
Gi0/2     SA      32768     5254.0001.0001  11s    0x0    0xA    0x3     0x3D
Gi0/3     SA      32768     5254.0001.0001  12s    0x0    0xA    0x4     0x3D</pre>
<p>The partner (DSW1) is in <b>A</b>ctive mode and requesting <b>S</b>low LACPDUs, and all three rows show the <b>same Dev ID</b>: all members reach the same switch. Run it on DSW1 and you see <code>SP</code>, because its partner ASW1 is passive. <code>show lacp sys-id</code> shows the local system priority and MAC.</p>

<div class="warn"><p><b>Common mistake.</b> Changing <code>lacp port-priority</code> on the switch with the higher system ID and wondering why nothing changes. Only the switch in charge (lower system ID) chooses the active ports.</p></div>

<div class="exam"><p><b>Exam trap.</b> Max 16 ports per LACP bundle, 8 active plus 8 hot-standby. For PAgP and static the limit is 8. Lower priority values are better for both system and port priority; the default for both is 32768.</p></div>

<div class="scn"><h4>The patch cable to the wrong rack</h4><p>A data-centre technician added a third uplink to an LACP bundle but patched it into the neighbouring rack's switch. The new port never showed <code>(P)</code>; it stayed <code>(I)</code>. <code>show lacp neighbor</code> revealed a different partner Dev ID on that one row. The technician re-patched the cable and the port bundled within seconds. With mode on, the same mistake would have bridged two separate switches together.</p><p><b>Lesson:</b> LACP's partner check turns a potentially nasty loop into a harmless stand-alone port.</p></div>

<div class="iv"><p class="q">"You have 10 links in an LACP bundle. Which ones forward?"</p><p>Strong answer: 8 active, 2 hot-standby. The switch with the lower system ID (system priority, then MAC) decides, and on that switch the ports with the lowest port ID (port priority, then port number) become active. Mention you can steer it with <code>lacp system-priority</code> and <code>lacp port-priority</code>, and limit it with <code>lacp max-bundle</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP is IEEE 802.3ad / 802.1AX; LACPDUs go to 01:80:C2:00:00:02, slow = 30 s, fast = 1 s.</li>
<li>active initiates, passive only responds; passive + passive never forms a bundle.</li>
<li>All members must see the same partner system ID and key; mis-cabled ports stay stand-alone.</li>
<li>Up to 16 ports: 8 active, 8 hot-standby (H); the lower system ID decides, lower port ID wins.</li>
<li>Verify with <code>show lacp neighbor</code> (SA / SP flags, same Dev ID on every row).</li>
</ul></div>
`,hi:`
<p>Wapas do doston par. Is baar ghar se nikalne se pehle ek doosre ko phone karta hai: "6 baje station aa rahe ho na? Same platform?" Jab jawab milta hai "haan, platform 2", tabhi dono nikalte hain. Woh phone call <b>LACP</b> hai. Thodi mehnat lagti hai, lekin koi kabhi galat platform par intezaar nahi karta.</p>

<h3>LACP kya hai</h3>
<p><b>Link Aggregation Control Protocol</b> bundles negotiate karne ka open standard hai, pehle IEEE 802.3ad mein define hua aur ab <b>IEEE 802.1AX</b> mein. Standard hone ki wajah se yeh Cisco switches, doosre vendors ke switches, servers, firewalls, storage arrays aur hypervisors ke beech chalta hai. CCNA blueprint mein isi protocol ka naam hai, aur practice mein har naye bundle ke liye yahi default choice hai.</p>
<p>Har member port <b>LACPDUs</b> (LACP data units) Slow Protocols multicast MAC <code>01:80:C2:00:00:02</code> par bhejta hai. Yeh frames link-local hain: cable se bahar nahi jaate aur STP inhe kabhi block nahi karta. Default mein port apne partner se <b>slow</b> LACPDUs maangta hai, har 30 seconds mein ek, aur 90 seconds ki khamoshi ke baad partner ko dead maan leta hai. Interface par <code>lacp rate fast</code> ke saath port har second ek maangta hai aur timeout 3 seconds ho jaata hai.</p>

<h3>Do modes</h3>
<dl class="terms">
<dt>active</dt><dd>Port <b>shuru karta hai</b>: woh khud LACPDUs bhejta hai, chahe partner se kuch suna ho ya nahi.</dd>
<dt>passive</dt><dd>Port sirf <b>jawab deta hai</b>: woh LACPDU tabhi bhejta hai jab use ek mil jaaye. Isliye do passive ports hamesha ek doosre ka intezaar karte rehte hain.</dd>
</dl>
<p>Active ke saath active aur active ke saath passive dono bundle banate hain. Passive ke saath passive kabhi nahi. Zyada tar engineers dono ends par seedha active use karte hain; koi nuksaan nahi aur galti ka ek raasta khatam.</p>

<h3>LACP kya check karta hai</h3>
<p>LACPDUs ek identity le jaate hain. Har switch ka ek <b>system ID</b> hota hai jo <b>system priority</b> (default 32768) plus uske base MAC address se banta hai. Har port ka ek <b>port ID</b> hota hai jo <b>port priority</b> (default 32768) plus port number se banta hai, aur har bundle ki ek <b>key</b> hoti hai (Cisco par channel-group number se banti hai). Port bundle mein tabhi judta hai jab uska partner wahi system ID aur key report kare jo baaki members ke partners karte hain. To agar koi Gi0/3 ko galat switch mein patch kar de, LACP ko alag partner system ID dikhta hai aur woh us port ko bundle karne se mana kar deta hai. Static mode yeh kabhi nahi pakad sakta tha.</p>

<h3>16 ports, 8 active, 8 hot-standby</h3>
<p>LACP bundle <b>16</b> ports tak rakh sakta hai, lekin zyada se zyada <b>8</b> active aur forwarding hote hain. Baaki <b>hot-standby</b> hain, flag <code>H</code> ke saath dikhte hain, aur active member fail hone par uski jagah lete hain. Kaunse 8 active honge, yeh aise tay hota hai:</p>
<ol>
<li><b>Kam system ID</b> wala switch in charge hota hai: kam system priority jeetti hai; tie par kam MAC jeetta hai.</li>
<li>Woh switch <b>kam port ID</b> wale ports active rakhta hai: kam port priority jeetti hai; tie par kam port number jeetta hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Das 1 Gbps links DSW1 aur ASW1 ko jodte hain, sab channel-group 10 mein. Dono switches ki system priority 32768 hai. DSW1 ka MAC .0001 par khatam hota hai aur ASW1 ka .0002 par, isliye DSW1 in charge hai. Default mein Gi0/1 se Gi0/8 (sabse kam port numbers) active hain aur Gi0/9 aur Gi0/10 <code>(H)</code> dikhate hain. Aap chahte ho ki Gi0/1 aur Gi0/2 ki jagah Gi0/9 aur Gi0/10 active hon kyunki woh alag line card par hain. DSW1 par Gi0/3 se Gi0/10 par <code>lacp port-priority 100</code> set karo. Agar aap chahte ho ki ASW1 decide kare, to global configuration mein use <code>lacp system-priority 100</code> do. Jo switch in charge nahi hai us par port priority badalne ka koi asar nahi, yeh interviewers ka favourite catch hai.</p></div>

<p>Do aur controls port-channel interface par rehte hain. <code>lacp max-bundle 4</code> active members ki sankhya ko 8 se kam tak limit karta hai. <code>port-channel min-links 2</code> poore port-channel ko down kar deta hai agar 2 se kam members up hon, jo tab useful hai jab aadhi taakat wala bundle doosre path par failover se bura ho.</p>

<h3>Lab walkthrough: LACP ke saath teen uplinks</h3>
<p>Doosre lab mein warehouse ka access switch ASW1 VLAN 30 mein Wi-Fi access points (AP1, 10.3.0.20) aur VLAN 40 mein cameras (CAM1, 10.4.0.20) chalata hai. Gateways Layer 3 switch DSW1 par SVIs hain: 10.3.0.1 aur 10.4.0.1. Teen uplinks, Gi0/1 se Gi0/3, switches ko jodte hain.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="LACP lab topology">
<rect x="250" y="20" width="140" height="48" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">DSW1</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">LACP active</text>
<rect x="250" y="140" width="140" height="48" rx="8" fill="#bae6fd"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="14">ASW1</text><text x="320" y="179" text-anchor="middle" class="svg-muted" font-size="12">LACP passive</text>
<line x1="295" y1="68" x2="295" y2="140" stroke="#64748b" stroke-width="3"/><line x1="320" y1="68" x2="320" y2="140" stroke="#64748b" stroke-width="3"/><line x1="345" y1="68" x2="345" y2="140" stroke="#64748b" stroke-width="3"/>
<ellipse cx="320" cy="104" rx="42" ry="14" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="375" y="100" class="svg-accent" font-size="12">Po10: Gi0/1-3</text><text x="375" y="116" class="svg-muted" font-size="12">trunk VLAN 30,40</text>
<rect x="80" y="180" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="140" y="200" text-anchor="middle" class="svg-ink" font-size="13">AP1 VLAN 30</text><text x="140" y="216" text-anchor="middle" class="svg-muted" font-size="12">10.3.0.20</text>
<rect x="440" y="180" width="120" height="44" rx="8" fill="#fde68a"/><text x="500" y="200" text-anchor="middle" class="svg-ink" font-size="13">CAM1 VLAN 40</text><text x="500" y="216" text-anchor="middle" class="svg-muted" font-size="12">10.4.0.20</text>
<line x1="250" y1="170" x2="200" y2="200" stroke="#64748b"/><line x1="390" y1="170" x2="440" y2="200" stroke="#64748b"/>
</svg><p class="cap">Lab 2: DSW1 (active) aur ASW1 (passive) teen uplinks ko Po10 mein bundle karte hain.</p></div>

<pre class="code">DSW1(config)# interface range g0/1 - 3
DSW1(config-if-range)# channel-group 10 mode active
DSW1(config-if-range)# exit
DSW1(config)# interface port-channel 10
DSW1(config-if)# switchport mode trunk
DSW1(config-if)# switchport trunk allowed vlan 30,40

ASW1(config)# interface range g0/1 - 3
ASW1(config-if-range)# channel-group 10 mode passive
ASW1(config-if-range)# exit
ASW1(config)# interface port-channel 10
ASW1(config-if)# switchport mode trunk
ASW1(config-if)# switchport trunk allowed vlan 30,40
<span class="c">! Lab dono par globally "port-channel load-balance src-dst-ip" bhi set karta hai. Chapter 8 ise samjhata hai.</span></pre>

<pre class="out">ASW1# show lacp neighbor
Flags:  S - Device is requesting Slow LACPDUs
        F - Device is requesting Fast LACPDUs
        A - Device is in Active mode       P - Device is in Passive mode

Channel group 10 neighbors

Partner's information:

                  LACP port                        Admin  Oper   Port    Port
Port      Flags   Priority  Dev ID          Age    key    Key    Number  State
<span class="hl">Gi0/1     SA      32768     5254.0001.0001  11s    0x0    0xA    0x2     0x3D</span>
Gi0/2     SA      32768     5254.0001.0001  11s    0x0    0xA    0x3     0x3D
Gi0/3     SA      32768     5254.0001.0001  12s    0x0    0xA    0x4     0x3D</pre>
<p>Partner (DSW1) <b>A</b>ctive mode mein hai aur <b>S</b>low LACPDUs maang raha hai, aur teeno rows mein <b>same Dev ID</b> hai: saare members same switch tak pahunchte hain. DSW1 par chalao to <code>SP</code> dikhega, kyunki uska partner ASW1 passive hai. <code>show lacp sys-id</code> local system priority aur MAC dikhata hai.</p>

<div class="warn"><p><b>Common galti.</b> Zyada system ID wale switch par <code>lacp port-priority</code> badalna aur sochna ki kuch badla kyun nahi. Sirf in-charge switch (kam system ID) active ports chunta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> LACP bundle mein max 16 ports, 8 active plus 8 hot-standby. PAgP aur static ke liye limit 8 hai. System aur port priority dono mein kam value better hai; dono ka default 32768 hai.</p></div>

<div class="scn"><h4>Galat rack ka patch cable</h4><p>Ek data-centre technician ne LACP bundle mein teesra uplink joda lekin use bagal wale rack ke switch mein patch kar diya. Naya port kabhi <code>(P)</code> nahi dikha; <code>(I)</code> hi raha. <code>show lacp neighbor</code> ne us ek row par alag partner Dev ID dikhaya. Technician ne cable dobara patch kiya aur port kuch seconds mein bundle ho gaya. Mode on ke saath yahi galti do alag switches ko aapas mein bridge kar deti.</p><p><b>Seekh:</b> LACP ka partner check ek khatarnak loop ko ek harmless stand-alone port mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Aapke LACP bundle mein 10 links hain. Kaunse forward karte hain?"</p><p>Strong answer: 8 active, 2 hot-standby. Kam system ID (system priority, phir MAC) wala switch decide karta hai, aur us switch par sabse kam port ID (port priority, phir port number) wale ports active bante hain. Batao ki aap ise <code>lacp system-priority</code> aur <code>lacp port-priority</code> se steer kar sakte ho, aur <code>lacp max-bundle</code> se limit kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>LACP IEEE 802.3ad / 802.1AX hai; LACPDUs 01:80:C2:00:00:02 par jaate hain, slow = 30 s, fast = 1 s.</li>
<li>active shuru karta hai, passive sirf jawab deta hai; passive + passive kabhi bundle nahi banata.</li>
<li>Saare members ko same partner system ID aur key dikhni chahiye; galat cabled ports stand-alone rehte hain.</li>
<li>16 ports tak: 8 active, 8 hot-standby (H); kam system ID decide karta hai, kam port ID jeetta hai.</li>
<li><code>show lacp neighbor</code> se verify karo (SA / SP flags, har row par same Dev ID).</li>
</ul></div>
`}};export{e as default};