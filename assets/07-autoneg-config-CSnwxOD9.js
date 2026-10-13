var e={id:`autoneg`,h:{en:`Auto-negotiation and configuring speed and duplex`,hi:`Auto-negotiation aur speed aur duplex configure karna`},body:{en:`
<p>Two people meet and must pick a language. Each lists what they speak: "Hindi, English, Tamil" and "English, Hindi". Both pick the best language they share. Now imagine one of them wears headphones and refuses to list anything. The other has to <b>guess</b> from how they sound. Guessing the accent (speed) is easy; guessing whether they will interrupt (duplex) is impossible. That is auto-negotiation, and its failure mode, in one story.</p>

<h3>How auto-negotiation works</h3>
<p>IEEE 802.3 <b>auto-negotiation</b> runs on twisted-pair links when the link comes up. Each end sends bursts of <b>fast link pulses (FLPs)</b> that advertise every speed and duplex combination it supports. Both ends then pick the <b>highest common</b> mode in this priority order:</p>
<p><b>10G full, then 1000 full, 1000 half, 100 full, 100 half, 10 full, 10 half.</b></p>
<p>With both ends on auto, a 10/100/1000 switch port and a gigabit NIC always settle on 1000/full. This is the default on every Cisco Ethernet port, and it is the recommended setting.</p>

<h3>When only one end negotiates</h3>
<p>On Cisco devices, hard-coding <b>both</b> <code>speed</code> and <code>duplex</code> on a port disables auto-negotiation on it: the port stops sending FLPs. Its neighbour, still on auto, hears no advertisement and has to fall back to IEEE defaults:</p>
<ul>
<li><b>Speed</b>: sensed from the incoming signal using <b>parallel detection</b>. 10BASE-T and 100BASE-TX look different electrically, so the speed is usually right. If it cannot be sensed, the port uses its slowest speed.</li>
<li><b>Duplex</b>: cannot be sensed. The IEEE default is <b>half duplex at 10 or 100 Mbps</b>, full duplex at 1000 Mbps and above.</li>
</ul>
<p>So a switch hard-coded to 100/full next to a router on auto produces router = 100/half, switch = 100/full: a <b>duplex mismatch</b>. That is exactly the lab's broken state.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Auto-negotiation outcomes">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">auto + auto: best common speed, full duplex (recommended)</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">100/full + 100/full: works, but both must be maintained by hand</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">100/full + auto: auto side senses 100 but falls back to HALF, mismatch</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#fed7aa"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">speed 100 + speed 10 (both fixed): link down, notconnect</text>
</svg><p class="cap">The four combinations you must be able to predict.</p></div>

<h3>Configuring speed and duplex on Cisco IOS</h3>
<pre class="code">SW1# configure terminal
SW1(config)# interface fa0/1
SW1(config-if)# speed ?
  10    Force 10 Mbps operation
  100   Force 100 Mbps operation
  auto  Enable AUTO speed configuration
SW1(config-if)# speed auto          <span class="c">! default</span>
SW1(config-if)# duplex auto         <span class="c">! default</span>
SW1(config-if)# end

R1(config)# interface fa0/0
R1(config-if)# speed auto
R1(config-if)# duplex auto</pre>
<p>If you truly need fixed values, for example because the far end cannot negotiate, set <b>both</b> ends identically:</p>
<pre class="code">SW1(config)# interface fa0/1
SW1(config-if)# speed 100
SW1(config-if)# duplex full
R1(config)# interface fa0/0
R1(config-if)# speed 100
R1(config-if)# duplex full        <span class="c">! both ends fixed and matching: no mismatch</span></pre>
<p>Useful details:</p>
<ul>
<li><code>duplex half</code> is only accepted at 10 or 100 Mbps. Gigabit copper is effectively always full duplex, and 1000BASE-T requires auto-negotiation for its own internal setup.</li>
<li>Many Catalyst platforms let you limit what is advertised while still negotiating, for example <code>speed auto 10 100</code>.</li>
<li>Fibre SFP ports run at the optic's speed; negotiation there covers only duplex and flow control, and some platforms offer <code>speed nonegotiate</code> for a far end that does not negotiate.</li>
<li>Some newer routers (for example ISR 4000 GigabitEthernet ports) use <code>negotiation auto</code>; you must enter <code>no negotiation auto</code> before fixing speed.</li>
</ul>

<h3>Verifying</h3>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1     a-full  a-100 10/100BaseTX</span>

R1# show interfaces fa0/0 | include duplex
<span class="hl">  Full-duplex, 100Mb/s, 100BaseTX/FX</span></pre>
<p>In <code>show interfaces status</code>, the <b>a-</b> prefix means the value was <b>auto-negotiated</b>. Values without it (<code>full</code>, <code>100</code>) are hard-coded. Seeing <code>a-half</code> on a switch port is a red flag: the neighbour is probably not negotiating.</p>

<div class="eg"><p><b>Worked example.</b> Predict the result. SW1 Fa0/1: <code>speed 100</code>, <code>duplex full</code>. R1 Fa0/0: auto/auto. R1 receives no FLPs, senses 100BASE-TX, picks 100 Mbps, and falls back to half duplex. <code>show interfaces fa0/0</code> on R1 shows <code>Half-duplex, 100Mb/s</code>. Fix: put SW1 Fa0/1 back to <code>speed auto</code> and <code>duplex auto</code>; both ends then negotiate 100/full.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Hard-coding one end "to be safe". Changing only duplex and expecting the other end to follow. Forgetting that the change bounces the link briefly, so do it in a maintenance window on uplinks. Leaving a temporary hard-coded setting after a test, which is exactly what happened on SW1.</p></div>

<div class="exam"><p><b>Exam trap.</b> If one side is fixed and the other is auto, the auto side gets the <b>speed</b> right but chooses <b>half duplex</b> at 10/100 and full at 1000. If both sides are fixed at different speeds, the link does not come up. The <code>a-</code> prefix in <code>show interfaces status</code> means negotiated.</p></div>

<div class="scn"><h4>The server team's "performance tuning"</h4><p>A server administrator read an old guide and set the server NIC to 1000/full manually. The switch port stayed on auto. Because 1000BASE-T needs auto-negotiation, the NIC driver actually kept negotiating and the link was fine. Months later the same admin set another server to 100/full for a legacy application. That link came up as <code>a-half a-100</code> on the switch and backups slowed to a crawl. Setting both ends back to auto gave 1000/full, and the legacy app worked perfectly.</p><p><b>Lesson:</b> auto on both ends is the default for a reason. Hard-code only when a device cannot negotiate, and then hard-code both ends.</p></div>

<div class="iv"><p class="q">"What happens when one side is set to 100/full and the other side is auto?"</p><p>Strong answer: the fixed side stops sending auto-negotiation pulses. The auto side uses parallel detection to sense 100 Mbps, but it cannot detect duplex, so by IEEE default it uses half duplex. Result: 100 Mbps with a duplex mismatch; the link is up, but the half side logs collisions and late collisions and the full side logs CRC errors and runts. Fix by setting both ends to auto, or both to the same fixed values.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Auto-negotiation advertises capabilities with FLPs; both ends pick the highest common mode.</li>
<li>Hard-coding speed and duplex disables negotiation on that port.</li>
<li>A lone auto side senses speed but defaults to half duplex at 10/100 Mbps.</li>
<li>Best practice: auto on both ends, or fixed and identical on both ends.</li>
<li><code>a-full a-100</code> means negotiated; plain <code>full 100</code> means hard-coded.</li>
</ul></div>
`,hi:`
<p>Do log milte hain aur unhe ek bhasha chunni hai. Har ek batata hai woh kya bolta hai: "Hindi, English, Tamil" aur "English, Hindi". Dono woh best bhasha chunte hain jo dono jaante hain. Ab socho ek ne headphones pehne hain aur kuch bhi batane se mana karta hai. Dusre ko uski awaaz se <b>andaza</b> lagana padta hai. Accent (speed) ka andaza aasaan hai; woh beech mein tokega ya nahi (duplex) iska andaza namumkin hai. Yahi auto-negotiation aur uska failure mode hai, ek kahani mein.</p>

<h3>Auto-negotiation kaise kaam karta hai</h3>
<p>IEEE 802.3 <b>auto-negotiation</b> twisted-pair links par link up hote waqt chalta hai. Har end <b>fast link pulses (FLPs)</b> ke bursts bhejta hai jo har speed aur duplex combination advertise karte hain jo woh support karta hai. Phir dono ends is priority order mein <b>sabse ooncha common</b> mode chunte hain:</p>
<p><b>10G full, phir 1000 full, 1000 half, 100 full, 100 half, 10 full, 10 half.</b></p>
<p>Dono ends auto par hon to 10/100/1000 switch port aur gigabit NIC hamesha 1000/full par settle karte hain. Yeh har Cisco Ethernet port par default hai, aur yahi recommended setting hai.</p>

<h3>Jab sirf ek end negotiate kare</h3>
<p>Cisco devices par port par <b>dono</b> <code>speed</code> aur <code>duplex</code> hard-code karne se us par auto-negotiation disable ho jaata hai: port FLPs bhejna band kar deta hai. Uska neighbour, jo abhi bhi auto par hai, koi advertisement nahi sunta aur use IEEE defaults par girna padta hai:</p>
<ul>
<li><b>Speed</b>: aane wale signal se <b>parallel detection</b> se sense hoti hai. 10BASE-T aur 100BASE-TX electrically alag dikhte hain, isliye speed aam taur par sahi hoti hai. Agar sense na ho sake, to port apni sabse slow speed use karta hai.</li>
<li><b>Duplex</b>: sense nahi ho sakta. IEEE default hai <b>10 ya 100 Mbps par half duplex</b>, 1000 Mbps aur upar full duplex.</li>
</ul>
<p>Isliye 100/full par hard-coded switch ke bagal mein auto wala router deta hai router = 100/half, switch = 100/full: ek <b>duplex mismatch</b>. Yahi lab ki tooti hui state hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Auto-negotiation ke outcomes">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">auto + auto: best common speed, full duplex (recommended)</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">100/full + 100/full: chalta hai, lekin dono haath se maintain karne padte hain</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="145" text-anchor="middle" class="svg-ink" font-size="13">100/full + auto: auto side 100 sense karti hai lekin HALF par girti hai, mismatch</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#fed7aa"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">speed 100 + speed 10 (dono fixed): link down, notconnect</text>
</svg><p class="cap">Chaar combinations jinka result aapko predict karna aana chahiye.</p></div>

<h3>Cisco IOS par speed aur duplex configure karna</h3>
<pre class="code">SW1# configure terminal
SW1(config)# interface fa0/1
SW1(config-if)# speed ?
  10    Force 10 Mbps operation
  100   Force 100 Mbps operation
  auto  Enable AUTO speed configuration
SW1(config-if)# speed auto          <span class="c">! default</span>
SW1(config-if)# duplex auto         <span class="c">! default</span>
SW1(config-if)# end

R1(config)# interface fa0/0
R1(config-if)# speed auto
R1(config-if)# duplex auto</pre>
<p>Agar sach mein fixed values chahiye, jaise kyunki far end negotiate nahi kar sakta, to <b>dono</b> ends ek jaise set karo:</p>
<pre class="code">SW1(config)# interface fa0/1
SW1(config-if)# speed 100
SW1(config-if)# duplex full
R1(config)# interface fa0/0
R1(config-if)# speed 100
R1(config-if)# duplex full        <span class="c">! dono ends fixed aur matching: koi mismatch nahi</span></pre>
<p>Kaam ki details:</p>
<ul>
<li><code>duplex half</code> sirf 10 ya 100 Mbps par accept hota hai. Gigabit copper practically hamesha full duplex hai, aur 1000BASE-T ko apne internal setup ke liye auto-negotiation chahiye.</li>
<li>Kai Catalyst platforms negotiate karte hue bhi advertise hone wali cheezein limit karne dete hain, jaise <code>speed auto 10 100</code>.</li>
<li>Fibre SFP ports optic ki speed par chalte hain; wahan negotiation sirf duplex aur flow control cover karta hai, aur kuch platforms us far end ke liye <code>speed nonegotiate</code> dete hain jo negotiate nahi karta.</li>
<li>Kuch naye routers (jaise ISR 4000 GigabitEthernet ports) <code>negotiation auto</code> use karte hain; speed fix karne se pehle aapko <code>no negotiation auto</code> daalna padta hai.</li>
</ul>

<h3>Verify karna</h3>
<pre class="out">SW1# show interfaces status
Port      Name       Status       Vlan  Duplex  Speed Type
<span class="hl">Fa0/1     UPLINK-R1  connected    1     a-full  a-100 10/100BaseTX</span>

R1# show interfaces fa0/0 | include duplex
<span class="hl">  Full-duplex, 100Mb/s, 100BaseTX/FX</span></pre>
<p><code>show interfaces status</code> mein <b>a-</b> prefix ka matlab hai value <b>auto-negotiate</b> hui. Iske bina values (<code>full</code>, <code>100</code>) hard-coded hain. Switch port par <code>a-half</code> dikhna red flag hai: neighbour shayad negotiate nahi kar raha.</p>

<div class="eg"><p><b>Worked example.</b> Result predict karo. SW1 Fa0/1: <code>speed 100</code>, <code>duplex full</code>. R1 Fa0/0: auto/auto. R1 ko koi FLP nahi milta, woh 100BASE-TX sense karta hai, 100 Mbps chunta hai, aur half duplex par gir jaata hai. R1 par <code>show interfaces fa0/0</code> <code>Half-duplex, 100Mb/s</code> dikhata hai. Fix: SW1 Fa0/1 ko wapas <code>speed auto</code> aur <code>duplex auto</code> par karo; phir dono ends 100/full negotiate karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Safe rehne ke liye" ek end hard-code karna. Sirf duplex badalna aur umeed karna ki dusra end follow karega. Bhool jaana ki change link ko thodi der ke liye bounce karta hai, isliye uplinks par yeh maintenance window mein karo. Test ke baad temporary hard-coded setting chhod dena, jo bilkul SW1 par hua.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar ek side fixed hai aur dusri auto, to auto side <b>speed</b> sahi pakadti hai lekin 10/100 par <b>half duplex</b> aur 1000 par full chunti hai. Agar dono sides alag speeds par fixed hain, link up nahi hota. <code>show interfaces status</code> mein <code>a-</code> prefix ka matlab negotiated.</p></div>

<div class="scn"><h4>Server team ki "performance tuning"</h4><p>Ek server administrator ne ek purani guide padhi aur server NIC ko manually 1000/full par set kar diya. Switch port auto par raha. Kyunki 1000BASE-T ko auto-negotiation chahiye, NIC driver asal mein negotiate karta raha aur link theek tha. Mahino baad usi admin ne ek legacy application ke liye dusre server ko 100/full par set kiya. Woh link switch par <code>a-half a-100</code> ke roop mein up hua aur backups bahut slow ho gaye. Dono ends wapas auto karne se 1000/full mila, aur legacy app bilkul theek chali.</p><p><b>Seekh:</b> dono ends par auto kisi wajah se default hai. Sirf tab hard-code karo jab device negotiate na kar sake, aur tab dono ends hard-code karo.</p></div>

<div class="iv"><p class="q">"Jab ek side 100/full par set ho aur dusri auto par, to kya hota hai?"</p><p>Strong answer: fixed side auto-negotiation pulses bhejna band kar deti hai. Auto side parallel detection se 100 Mbps sense karti hai, lekin duplex detect nahi kar sakti, isliye IEEE default ke hisaab se half duplex use karti hai. Result: duplex mismatch ke saath 100 Mbps; link up hai, lekin half side collisions aur late collisions log karti hai aur full side CRC errors aur runts. Fix: dono ends auto par, ya dono same fixed values par.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Auto-negotiation FLPs se capabilities advertise karta hai; dono ends sabse ooncha common mode chunte hain.</li>
<li>Speed aur duplex hard-code karne se us port par negotiation disable ho jaata hai.</li>
<li>Akeli auto side speed sense karti hai lekin 10/100 Mbps par half duplex par default karti hai.</li>
<li>Best practice: dono ends auto, ya dono ends fixed aur ek jaise.</li>
<li><code>a-full a-100</code> ka matlab negotiated; sirf <code>full 100</code> ka matlab hard-coded.</li>
</ul></div>
`}};export{e as default};