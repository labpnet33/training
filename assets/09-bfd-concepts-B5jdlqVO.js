var e={id:`bfd-concepts`,h:{en:`BFD: why fast failure detection, async and echo modes, timer math`,hi:`BFD: fast failure detection kyun, async aur echo modes, timer math`},body:{en:`
<p>A hospital patient connected to a heart monitor is checked every second by a machine, not every hour by a nurse. The nurse still visits, but the machine raises the alarm the moment something is wrong. Routing protocol hellos are the nurse: OSPF waits 40 seconds by default before declaring a neighbour dead. <b>Bidirectional Forwarding Detection (BFD)</b> is the heart monitor: a tiny, fast, protocol-independent heartbeat that says in milliseconds "this forwarding path is dead", and then tells every protocol that cares.</p>

<h3>The problem BFD solves</h3>
<p>If a link goes physically down, the router notices at once and the routing protocol reacts. The hard failures are the <b>silent</b> ones: the link light stays green but packets stop flowing. Examples: a switch or media converter between two routers fails, a provider's Ethernet service breaks inside their network, a line card's forwarding engine hangs, or a fibre breaks in one direction only. Now the routers must rely on hellos:</p>
<table class="cmp"><tr><th>Mechanism</th><th>Default detection</th></tr>
<tr><td>OSPF (broadcast, point-to-point)</td><td>Dead interval 40 s</td></tr>
<tr><td>EIGRP (LAN)</td><td>Hold time 15 s</td></tr>
<tr><td>BGP</td><td>Hold time 180 s</td></tr>
<tr><td>Static route</td><td>Never (stays installed while the interface is up)</td></tr>
<tr><td>BFD 50 ms x 3</td><td>150 ms</td></tr></table>
<p>You can tune protocol timers (OSPF fast hellos with <code>ip ospf dead-interval minimal hello-multiplier 4</code> gives 1-second detection), but every protocol would then run its own fast hellos, each processed by the control plane. BFD replaces all of them with <b>one lightweight session per neighbour</b>, shared by all clients, often handled by line-card hardware or a dedicated process.</p>

<h3>How BFD works</h3>
<ul>
<li>BFD is defined in RFC 5880, with RFC 5881 for single-hop IPv4/IPv6 and RFC 5883 for multihop.</li>
<li>Single-hop control packets use <b>UDP destination port 3784</b>; echo packets use <b>UDP 3785</b>; multihop BFD uses <b>UDP 4784</b>.</li>
<li>BFD has <b>no neighbour discovery</b> of its own. A client protocol (OSPF, EIGRP, BGP, static, HSRP) tells BFD "please watch neighbour 10.0.1.1", and BFD builds the session.</li>
<li>Each side picks a <b>discriminator</b> (a session ID). Sessions come up with a three-way handshake through the states <b>Down, Init, Up</b>; <b>AdminDown</b> is used when a session is deliberately disabled.</li>
<li>When a session goes Down, BFD notifies every registered client, which then tears down its adjacency or withdraws its route immediately.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="BFD async and echo modes">
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="500" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="36" x2="500" y2="36" stroke="#64748b" stroke-width="2"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">control packets UDP 3784 both ways</text>
<line x1="500" y1="52" x2="140" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="13">Asynchronous mode</text>
<rect x="20" y="140" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="500" y="140" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="152" x2="500" y2="152" stroke="#64748b" stroke-width="2"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">echo UDP 3785, addressed to EDGE itself</text>
<path d="M500 172 L140 172" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" fill="none"/><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">ISP1 just forwards it back in the data plane</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="13">Echo mode (plus slow control packets)</text>
</svg><p class="cap">Async mode exchanges control packets; echo mode loops the router's own packets through the neighbour's forwarding path.</p></div>

<h3>Asynchronous mode</h3>
<p>Both routers send BFD control packets to each other at a negotiated interval. If a router receives no control packet for the <b>detection time</b>, it declares the session down. Async mode is the base mode; it is always used, and echo mode is an optional add-on.</p>

<h3>Echo mode</h3>
<p>The router sends echo packets whose destination IP is <b>its own</b> address, but addressed at Layer 2 to the neighbour. The neighbour does not process them in BFD at all; it simply routes them back in its data plane. This tests the real forwarding path of the neighbour, and the neighbour's CPU barely notices. While echo is active, control packets are slowed down to a <b>slow timer</b> (<code>bfd slow-timers</code>, typically 1000 ms) because echo does the fast detection. On Cisco IOS, echo mode is enabled by default when BFD is configured on an interface, requires both sides to support it, and needs <code>no ip redirects</code> on the interface, because the echo packet leaves through the same interface it arrived on. Disable it per interface with <code>no bfd echo</code>.</p>
<p>(A third mode, <b>demand mode</b>, is defined in the RFC but is not used on Cisco IOS routers; you only need to know it exists.)</p>

<h3>Timers and multiplier math</h3>
<p>Each router advertises three values: <b>Desired Min TX</b> (how fast I would like to send), <b>Required Min RX</b> (how fast I can accept), and the <b>Detect Multiplier</b>. The rules for asynchronous mode:</p>
<ul>
<li>My actual transmit interval = the <b>larger</b> of my Desired Min TX and the neighbour's Required Min RX. Nobody sends faster than the other side can receive.</li>
<li>My detection time = the <b>neighbour's</b> Detect Multiplier x the interval at which the neighbour actually sends to me.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> EDGE: <code>bfd interval 50 min_rx 50 multiplier 3</code>. ISP1: <code>bfd interval 100 min_rx 100 multiplier 5</code>.</p>
<ul>
<li>EDGE sends at max(50, ISP1's min_rx 100) = <b>100 ms</b>.</li>
<li>ISP1 sends at max(100, EDGE's min_rx 50) = <b>100 ms</b>.</li>
<li>EDGE's detection time = ISP1's multiplier 5 x 100 ms = <b>500 ms</b>.</li>
<li>ISP1's detection time = EDGE's multiplier 3 x 100 ms = <b>300 ms</b>.</li>
</ul>
<p>So the slower side always wins the interval, and detection times can differ in each direction. Set the same values on both ends unless you have a reason not to.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking BFD itself reroutes traffic. BFD only detects and notifies. If no client is registered (for example OSPF is running but <code>bfd all-interfaces</code> was never configured), a BFD session may not even exist, and nothing reacts faster.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which BFD mode tests the neighbour's forwarding plane without involving its control plane?" is echo mode. "Which mode is always required?" is asynchronous. And detection time uses the <b>remote</b> multiplier, not the local one.</p></div>

<div class="scn"><h4>The media converter that failed quietly</h4><p>A bank's branch connected to a provider through a fibre-to-copper media converter. When the converter's fibre side died, the copper side stayed up, so the router's interface never went down. OSPF took 40 seconds to notice and the ATM transactions in flight timed out. After enabling BFD at 250 ms x 3 on the WAN interface and registering OSPF, a repeat failure in testing triggered failover in under one second, and no transactions were lost.</p><p><b>Lesson:</b> BFD matters most when the link stays up but forwarding stops.</p></div>

<div class="iv"><p class="q">"Why use BFD instead of just lowering OSPF hello and dead timers?"</p><p>Strong answer: BFD gives sub-second detection with one lightweight session per neighbour that is shared by all protocols (OSPF, EIGRP, BGP, static, HSRP), and it can run in hardware or in a dedicated process. Fast hellos would need tuning per protocol, load the control plane, and still be slower. Mention async vs echo mode, the timer negotiation (slower side wins), and detection time = remote multiplier x negotiated interval.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD detects silent forwarding failures in milliseconds and notifies registered clients.</li>
<li>Control packets UDP 3784, echo UDP 3785, multihop UDP 4784; no neighbour discovery of its own.</li>
<li>Async mode is always used; echo mode adds data-plane testing and slows control packets.</li>
<li>TX interval = max(local desired TX, remote required RX); detection = remote multiplier x that interval.</li>
<li>Echo mode on IOS needs <code>no ip redirects</code> and support on both sides.</li>
</ul></div>
`,hi:`
<p>Heart monitor se juda hospital patient har second ek machine se check hota hai, har ghante nurse se nahi. Nurse abhi bhi aati hai, lekin kuch galat hote hi machine alarm bajati hai. Routing protocol hellos nurse hain: OSPF default mein neighbour ko dead declare karne se pehle 40 second wait karta hai. <b>Bidirectional Forwarding Detection (BFD)</b> heart monitor hai: ek chhota, tez, protocol-independent heartbeat jo milliseconds mein kehta hai "yeh forwarding path mar gaya", aur phir har us protocol ko batata hai jise parwah hai.</p>

<h3>BFD kaunsi problem solve karta hai</h3>
<p>Agar link physically down hota hai, router turant notice karta hai aur routing protocol react karta hai. Mushkil failures <b>silent</b> wale hain: link light hari rehti hai lekin packets bahna band ho jaate hain. Examples: do routers ke beech switch ya media converter fail ho jaaye, provider ki Ethernet service unke network ke andar toot jaaye, line card ka forwarding engine hang ho jaaye, ya fibre sirf ek direction mein toote. Ab routers ko hellos par nirbhar rehna padta hai:</p>
<table class="cmp"><tr><th>Mechanism</th><th>Default detection</th></tr>
<tr><td>OSPF (broadcast, point-to-point)</td><td>Dead interval 40 s</td></tr>
<tr><td>EIGRP (LAN)</td><td>Hold time 15 s</td></tr>
<tr><td>BGP</td><td>Hold time 180 s</td></tr>
<tr><td>Static route</td><td>Kabhi nahi (interface up rehne tak installed rehta hai)</td></tr>
<tr><td>BFD 50 ms x 3</td><td>150 ms</td></tr></table>
<p>Aap protocol timers tune kar sakte ho (<code>ip ospf dead-interval minimal hello-multiplier 4</code> ke saath OSPF fast hellos 1-second detection deta hai), lekin tab har protocol apne fast hellos chalayega, har ek control plane process karega. BFD in sabko <b>har neighbour ke liye ek lightweight session</b> se replace karta hai, jo saare clients share karte hain, aur aksar line-card hardware ya dedicated process handle karta hai.</p>

<h3>BFD kaise kaam karta hai</h3>
<ul>
<li>BFD RFC 5880 mein defined hai, single-hop IPv4/IPv6 ke liye RFC 5881 aur multihop ke liye RFC 5883 ke saath.</li>
<li>Single-hop control packets <b>UDP destination port 3784</b> use karte hain; echo packets <b>UDP 3785</b>; multihop BFD <b>UDP 4784</b>.</li>
<li>BFD ki apni koi <b>neighbour discovery nahi</b>. Client protocol (OSPF, EIGRP, BGP, static, HSRP) BFD ko kehta hai "please neighbour 10.0.1.1 par nazar rakho", aur BFD session banata hai.</li>
<li>Har side ek <b>discriminator</b> (session ID) chunti hai. Sessions three-way handshake se states <b>Down, Init, Up</b> se guzar kar up hote hain; <b>AdminDown</b> tab use hota hai jab session jaan-boojh kar disable kiya jaaye.</li>
<li>Jab session Down hota hai, BFD har registered client ko notify karta hai, jo phir turant apni adjacency girata hai ya route withdraw karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="BFD async and echo modes">
<rect x="20" y="20" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="47" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="500" y="20" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="36" x2="500" y2="36" stroke="#64748b" stroke-width="2"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="12">control packets UDP 3784 dono taraf</text>
<line x1="500" y1="52" x2="140" y2="52" stroke="#64748b" stroke-width="2"/>
<text x="320" y="84" text-anchor="middle" class="svg-accent" font-size="13">Asynchronous mode</text>
<rect x="20" y="140" width="120" height="44" rx="8" fill="#bae6fd"/><text x="80" y="167" text-anchor="middle" class="svg-ink" font-size="13">EDGE</text>
<rect x="500" y="140" width="120" height="44" rx="8" fill="#ddd6fe"/><text x="560" y="167" text-anchor="middle" class="svg-ink" font-size="13">ISP1</text>
<line x1="140" y1="152" x2="500" y2="152" stroke="#64748b" stroke-width="2"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="12">echo UDP 3785, EDGE ko hi addressed</text>
<path d="M500 172 L140 172" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4" fill="none"/><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">ISP1 use data plane mein wapas forward karta hai</text>
<text x="320" y="230" text-anchor="middle" class="svg-accent" font-size="13">Echo mode (plus slow control packets)</text>
</svg><p class="cap">Async mode control packets exchange karta hai; echo mode router ke apne packets ko neighbour ke forwarding path se ghumata hai.</p></div>

<h3>Asynchronous mode</h3>
<p>Dono routers ek negotiated interval par ek dusre ko BFD control packets bhejte hain. Agar kisi router ko <b>detection time</b> tak koi control packet nahi milta, woh session down declare karta hai. Async mode base mode hai; yeh hamesha use hota hai, aur echo mode ek optional add-on hai.</p>

<h3>Echo mode</h3>
<p>Router aise echo packets bhejta hai jinka destination IP <b>uska apna</b> address hai, lekin Layer 2 par neighbour ko addressed. Neighbour unhe BFD mein process hi nahi karta; bas apne data plane mein wapas route kar deta hai. Yeh neighbour ka asli forwarding path test karta hai, aur neighbour ke CPU ko pata bhi nahi chalta. Jab echo active hai, control packets ek <b>slow timer</b> (<code>bfd slow-timers</code>, typically 1000 ms) par dheeme kar diye jaate hain kyunki fast detection echo karta hai. Cisco IOS par interface par BFD configure karte hi echo mode default mein enabled hota hai, dono sides ka support chahiye, aur interface par <code>no ip redirects</code> chahiye, kyunki echo packet usi interface se bahar jaata hai jahan se aaya. Per interface <code>no bfd echo</code> se band karo.</p>
<p>(Ek teesra mode, <b>demand mode</b>, RFC mein defined hai lekin Cisco IOS routers par use nahi hota; aapko bas itna pata hona chahiye ki yeh exist karta hai.)</p>

<h3>Timers aur multiplier math</h3>
<p>Har router teen values advertise karta hai: <b>Desired Min TX</b> (main kitna tez bhejna chahta hoon), <b>Required Min RX</b> (main kitna tez accept kar sakta hoon), aur <b>Detect Multiplier</b>. Asynchronous mode ke rules:</p>
<ul>
<li>Mera actual transmit interval = mere Desired Min TX aur neighbour ke Required Min RX mein se <b>bada</b>. Koi bhi doosri side ki receive capacity se tez nahi bhejta.</li>
<li>Mera detection time = <b>neighbour ka</b> Detect Multiplier x woh interval jis par neighbour mujhe sach mein bhejta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> EDGE: <code>bfd interval 50 min_rx 50 multiplier 3</code>. ISP1: <code>bfd interval 100 min_rx 100 multiplier 5</code>.</p>
<ul>
<li>EDGE max(50, ISP1 ka min_rx 100) = <b>100 ms</b> par bhejta hai.</li>
<li>ISP1 max(100, EDGE ka min_rx 50) = <b>100 ms</b> par bhejta hai.</li>
<li>EDGE ka detection time = ISP1 ka multiplier 5 x 100 ms = <b>500 ms</b>.</li>
<li>ISP1 ka detection time = EDGE ka multiplier 3 x 100 ms = <b>300 ms</b>.</li>
</ul>
<p>Yaani dheemi side hamesha interval jeet-ti hai, aur detection times har direction mein alag ho sakte hain. Jab tak koi wajah na ho, dono ends par same values set karo.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki BFD khud traffic reroute karta hai. BFD sirf detect aur notify karta hai. Agar koi client registered nahi (jaise OSPF chal raha hai lekin <code>bfd all-interfaces</code> kabhi configure nahi hua), to BFD session exist bhi nahi karega, aur kuch bhi tez react nahi karega.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa BFD mode neighbour ke control plane ko involve kiye bina uska forwarding plane test karta hai?" echo mode hai. "Kaunsa mode hamesha zaroori hai?" asynchronous hai. Aur detection time <b>remote</b> multiplier use karta hai, local nahi.</p></div>

<div class="scn"><h4>Media converter jo chupchaap fail hua</h4><p>Ek bank ki branch provider se fibre-to-copper media converter ke through judi thi. Jab converter ki fibre side mari, copper side up rahi, isliye router ka interface kabhi down nahi hua. OSPF ko notice karne mein 40 second lage aur beech mein chal rahe ATM transactions timeout ho gaye. WAN interface par 250 ms x 3 BFD enable karke aur OSPF register karne ke baad, testing mein wahi failure ek second se kam mein failover trigger kar gaya, aur koi transaction nahi gaya.</p><p><b>Seekh:</b> BFD sabse zyada tab matter karta hai jab link up rahe lekin forwarding ruk jaaye.</p></div>

<div class="iv"><p class="q">"Sirf OSPF hello aur dead timers kam karne ke bajaye BFD kyun use karein?"</p><p>Strong answer: BFD har neighbour ke liye ek lightweight session se sub-second detection deta hai jo saare protocols (OSPF, EIGRP, BGP, static, HSRP) share karte hain, aur yeh hardware ya dedicated process mein chal sakta hai. Fast hellos ko har protocol mein tune karna padta, control plane par load padta, aur phir bhi dheeme hote. Async vs echo mode, timer negotiation (dheemi side jeet-ti hai), aur detection time = remote multiplier x negotiated interval ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD silent forwarding failures ko milliseconds mein detect karta hai aur registered clients ko notify karta hai.</li>
<li>Control packets UDP 3784, echo UDP 3785, multihop UDP 4784; apni koi neighbour discovery nahi.</li>
<li>Async mode hamesha use hota hai; echo mode data-plane testing jodta hai aur control packets dheeme karta hai.</li>
<li>TX interval = max(local desired TX, remote required RX); detection = remote multiplier x woh interval.</li>
<li>IOS par echo mode ko <code>no ip redirects</code> aur dono sides ka support chahiye.</li>
</ul></div>
`}};export{e as default};