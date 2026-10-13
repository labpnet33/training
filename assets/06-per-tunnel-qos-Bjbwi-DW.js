var e={id:`per-tunnel-qos`,h:{en:`Per-tunnel QoS: protecting each spoke from a fast hub`,hi:`Per-tunnel QoS: tez hub se har spoke ko bachana`},body:{en:`
<p>A water tank on the roof of a big apartment block pushes water down one main pipe at high pressure. On the third floor, a small flat has a thin tap. If the tank fills everyone's pipe at full pressure, the thin pipe bursts or leaks at the joint, and the flat gets less water than it could have had. A good plumber puts a <b>regulator on each flat's branch</b>, set to what that flat can handle. <b>Per-tunnel QoS</b> is the regulator on each spoke's tunnel at the hub.</p>

<h3>The hub-and-spoke problem</h3>
<p>In a hub-and-spoke SD-WAN, the data centre or regional hub often has a 1 Gbps internet or MPLS circuit, while the spokes have 10, 20 or 50 Mbps. Applications at the hub (file servers, backups, video streams) can send to one spoke far faster than that spoke's circuit can receive. The excess is dropped in the provider's network, <b>before the spoke's own QoS can do anything</b>, and the drops hit voice as easily as bulk data. One heavy download to one spoke can also consume the hub's WAN queue and slow every other spoke.</p>
<p>The ordinary interface shaper (chapter 5) cannot fix this: it treats all tunnels on the hub interface as one pool. What the hub needs is a <b>separate shaper and separate queues for each spoke tunnel</b>.</p>

<h3>What per-tunnel QoS does</h3>
<p>Cisco describes per-tunnel QoS as applying QoS policy on individual tunnels in a hub-to-spoke topology, so you can <b>shape tunnel traffic to individual spokes</b> and <b>differentiate flows going through each tunnel</b>. The hub applies a policy <b>per session</b> to its egress traffic. Each spoke tells the hub how much it can receive: the spoke's configured <b>downstream bandwidth</b> is published through OMP, and the hub derives the shaping rate and bandwidth ratios for that spoke from it.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Per-tunnel QoS at a hub">
<rect x="20" y="90" width="150" height="80" rx="10" fill="#bae6fd"/><text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (hub)</text><text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">tunnel-qos hub</text><text x="95" y="156" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="470" y="20" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="44" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 (spoke)</text><text x="545" y="62" text-anchor="middle" class="svg-muted" font-size="12">downstream 20 Mbps</text>
<rect x="470" y="102" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1 (spoke)</text><text x="545" y="144" text-anchor="middle" class="svg-muted" font-size="12">downstream 50 Mbps</text>
<rect x="470" y="184" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="208" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1 (spoke)</text><text x="545" y="226" text-anchor="middle" class="svg-muted" font-size="12">downstream 100 Mbps</text>
<line x1="170" y1="115" x2="470" y2="50" stroke="#64748b" stroke-width="3"/><line x1="170" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="3"/><line x1="170" y1="145" x2="470" y2="212" stroke="#64748b" stroke-width="3"/>
<text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">shaper 20 Mbps</text><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">shaper 50 Mbps</text><text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">shaper 100 Mbps</text>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">Spokes publish their downstream bandwidth in OMP; the hub shapes each tunnel</text>
</svg><p class="cap">One hub, three spokes, three independent shapers and queue sets, each sized to what that spoke can receive.</p></div>

<h3>Configuration</h3>
<p>Per-tunnel QoS needs three things: the normal QoS policy (classes, schedulers, map, shaping rate), the <b>hub role</b> on the hub's tunnel interface, and the <b>spoke role</b> with its downstream bandwidth on each spoke. In Manager this is the <b>VPN Interface Ethernet</b> feature template, in the Tunnel section: enable <i>Per-tunnel QoS</i>; on the hub set <i>Per-tunnel QoS Aggregator</i> to On and optionally adjust <i>Tunnel Bandwidth Percent</i> (default 50); on spokes keep the aggregator Off and set <i>Bandwidth Downstream</i> in the basic configuration. In CLI form:</p>
<pre class="code"><span class="c">! hub E-DEL-1: aggregates the per-spoke sessions</span>
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   tunnel-qos hub
  exit
 exit
!
<span class="c">! spoke E-BLR-1: publishes how much it can receive (kbps)</span>
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   tunnel-qos spoke
  exit
  bandwidth-downstream 20000
 exit</pre>
<p>The number of hub sessions is limited by the platform. Cisco documents a configurable maximum of 100 to 10,000 sessions, set with the <code>platform qos sdwan max-session</code> command (up to 10,000 from release 17.13.1a; the default depends on the platform).</p>

<h3>The policy the hub builds</h3>
<p>The hub's generated policy has a per-tunnel parent that gives a share of each tunnel's bandwidth to the SD-WAN underlay class and attaches your normal child QoS policy. Cisco's example shows the pattern:</p>
<pre class="out">policy-map per_tunnel_qos_policy_GigabitEthernet1
 class SDWAN_underlay
  <span class="hl">bandwidth remaining percent 50</span>
  <span class="hl">service-policy qos_policy_4class_cedge</span>
!
interface GigabitEthernet1
 service-policy output shape_GigabitEthernet1</pre>
<p>This means that on each tunnel, queues are available for the spoke's own classes: voice for spoke A is not mixed with backup traffic for spoke B. The <i>Tunnel Bandwidth Percent</i> (default 50) controls how the interface bandwidth is divided between the tunnels' traffic and other traffic on the same physical interface, such as non-SD-WAN underlay flows.</p>

<h3>Rules and restrictions to remember</h3>
<ul>
<li><b>Hub-to-spoke only.</b> Spoke-to-spoke traffic is not covered.</li>
<li>Only <b>IOS XE Catalyst SD-WAN</b> devices act as hubs (Catalyst 8000 family, ISR 1000/4000, ASR 1000, CSR 1000V and so on); spokes can also be vEdge. Introduced in release 17.2.1r.</li>
<li>Not supported on <b>cellular</b> interfaces, and not with a loopback WAN interface (non-binding mode).</li>
<li>The QoS policy applied on the interface is shared by overlay and underlay.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Hub E-DEL-1 has a 1 Gbps internet circuit. A nightly job copies 500 Mbps of files toward E-BLR-1, which can receive only 20 Mbps. Without per-tunnel QoS the hub's interface shaper lets all 500 Mbps out; the ISP in Bengaluru drops about 96 percent (480 of 500 Mbps), including the 2 Mbps of voice that also flows to E-BLR-1, and the file copy and calls both suffer. With per-tunnel QoS, the session for E-BLR-1 is shaped at about 20 Mbps and uses the hub's 4 or 5 queues; voice is placed in the priority queue of that session, the file copy waits, and the other spokes (E-MUM-1 at 50 Mbps, E-HYD-1 at 100 Mbps) are not affected at all.</p></div>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan running-config sdwan | include tunnel-qos
   tunnel-qos hub
E-DEL-1# show platform software sdwan qos summary
E-DEL-1# show policy-map multipoint Tunnel1 203.0.113.14</pre>
<p>Cisco lists these checks: <code>show sdwan running-config</code> on the hub and spoke, <code>show policy-map interface</code> for the physical interface, <code>show policy-map multipoint Tunnel &lt;n&gt; &lt;spoke tunnel address&gt;</code> for the statistics of one spoke's tunnel, and <code>show platform software sdwan qos summary</code>, <code>... qos policy</code> and <code>... qos target</code> for the sessions, policy parameters and per-session data. The exact output depends on the platform and release, so read your device's output rather than expecting a fixed layout.</p>

<div class="warn"><p><b>Common mistake.</b> Enabling the hub role but forgetting the spoke role and downstream bandwidth. Without that number the hub does not know how fast to shape the tunnel. Another mistake is expecting spoke-to-spoke dynamic tunnels to be covered.</p></div>

<div class="exam"><p><b>Exam trap.</b> Per-tunnel QoS is <b>hub-to-spoke</b>, uses <code>tunnel-qos hub</code> and <code>tunnel-qos spoke</code>, and spokes publish <code>bandwidth-downstream</code> via OMP. It is applied on the hub's egress, per session. It is not supported on cellular interfaces.</p></div>

<div class="scn"><h4>One heavy spoke slows everyone</h4><p>A regional hub served 60 small branches. When the Chennai branch started a large software download, 20 other branches complained about slow ERP. The hub's WAN queue was dominated by the Chennai flow, which also lost 90 percent of its packets at the branch ISP. The team enabled per-tunnel QoS with each spoke's downstream bandwidth. Chennai was shaped to its 30 Mbps circuit, the shared queue emptied and the 20 complaints stopped.</p><p><b>Lesson:</b> the hub must know each spoke's capacity and shape to it.</p></div>

<div class="iv"><p class="q">"Why use per-tunnel QoS and how does the hub know the spoke's speed?"</p><p>A fast hub can overrun a slow spoke circuit; the drops then occur in the provider network, indiscriminately, and one spoke's burst can crowd out others. Per-tunnel QoS gives each spoke tunnel its own shaper and queues on the hub. The spoke is configured with <code>tunnel-qos spoke</code> and a downstream bandwidth, which it advertises through OMP; the hub is configured with <code>tunnel-qos hub</code>. It is a hub-to-spoke feature on IOS XE Catalyst SD-WAN hubs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A fast hub can overrun a slow spoke; the provider then drops traffic blindly.</li>
<li>Per-tunnel QoS gives each spoke tunnel its own shaper and queues on the hub.</li>
<li>Spokes publish downstream bandwidth in OMP; the hub shapes to it.</li>
<li>Config: <code>tunnel-qos hub</code>, <code>tunnel-qos spoke</code>, <code>bandwidth-downstream</code>.</li>
<li>Hub-and-spoke only, IOS XE hubs only, not on cellular interfaces.</li>
</ul></div>
`,hi:`
<p>Badi apartment building ki chhat par paani ki tanki ek mukhya pipe se tez pressure par paani neeche bhejti hai. Teesri manzil par ek chhote flat ka patla nal hai. Agar tanki sabki pipe ko poore pressure se bhare, to patli pipe joint par phat jaati hai ya leak karti hai, aur flat ko jitna mil sakta tha usse kam paani milta hai. Achha plumber har flat ki branch par <b>regulator</b> lagata hai, jo us flat ki kshamta ke hisaab se set hota hai. <b>Per-tunnel QoS</b> hub par har spoke ke tunnel ka regulator hai.</p>

<h3>Hub-and-spoke ki samasya</h3>
<p>Hub-and-spoke SD-WAN mein data centre ya regional hub ke paas aksar 1 Gbps internet ya MPLS circuit hota hai, jabki spokes ke paas 10, 20 ya 50 Mbps. Hub ke applications (file servers, backups, video streams) ek spoke ko us spoke ke circuit ke receive karne se kahin tez bhej sakte hain. Excess provider ke network mein drop hota hai, <b>spoke ka apna QoS kuch karne se pehle hi</b>, aur drops voice ko bulk data jitni hi aasani se maarte hain. Ek spoke ko ek heavy download hub ki WAN queue bhi kha sakta hai aur baaki har spoke ko slow kar sakta hai.</p>
<p>Aam interface shaper (chapter 5) yeh theek nahi kar sakta: woh hub interface ke sab tunnels ko ek pool maanta hai. Hub ko chahiye <b>har spoke tunnel ke liye alag shaper aur alag queues</b>.</p>

<h3>Per-tunnel QoS kya karta hai</h3>
<p>Cisco per-tunnel QoS ko hub-to-spoke topology mein individual tunnels par QoS policy lagana batata hai, taaki aap <b>har spoke ke tunnel traffic ko shape</b> kar sako aur <b>har tunnel ke flows mein fark</b> kar sako. Hub apni egress traffic par policy <b>per session</b> lagata hai. Har spoke hub ko batata hai ki woh kitna receive kar sakta hai: spoke ka configured <b>downstream bandwidth</b> OMP se publish hota hai, aur hub us se us spoke ke liye shaping rate aur bandwidth ratios nikalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hub par per-tunnel QoS">
<rect x="20" y="90" width="150" height="80" rx="10" fill="#bae6fd"/><text x="95" y="120" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1 (hub)</text><text x="95" y="140" text-anchor="middle" class="svg-muted" font-size="12">tunnel-qos hub</text><text x="95" y="156" text-anchor="middle" class="svg-muted" font-size="12">1 Gbps</text>
<rect x="470" y="20" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="44" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 (spoke)</text><text x="545" y="62" text-anchor="middle" class="svg-muted" font-size="12">downstream 20 Mbps</text>
<rect x="470" y="102" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="126" text-anchor="middle" class="svg-ink" font-size="13">E-MUM-1 (spoke)</text><text x="545" y="144" text-anchor="middle" class="svg-muted" font-size="12">downstream 50 Mbps</text>
<rect x="470" y="184" width="150" height="56" rx="10" fill="#bbf7d0"/><text x="545" y="208" text-anchor="middle" class="svg-ink" font-size="13">E-HYD-1 (spoke)</text><text x="545" y="226" text-anchor="middle" class="svg-muted" font-size="12">downstream 100 Mbps</text>
<line x1="170" y1="115" x2="470" y2="50" stroke="#64748b" stroke-width="3"/><line x1="170" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="3"/><line x1="170" y1="145" x2="470" y2="212" stroke="#64748b" stroke-width="3"/>
<text x="320" y="68" text-anchor="middle" class="svg-accent" font-size="12">shaper 20 Mbps</text><text x="320" y="122" text-anchor="middle" class="svg-accent" font-size="12">shaper 50 Mbps</text><text x="320" y="196" text-anchor="middle" class="svg-accent" font-size="12">shaper 100 Mbps</text>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">Spokes OMP mein downstream bandwidth publish karte hain; hub har tunnel shape karta hai</text>
</svg><p class="cap">Ek hub, teen spokes, teen swatantra shapers aur queue sets, har ek us spoke ke receive kar sakne ke hisaab se.</p></div>

<h3>Configuration</h3>
<p>Per-tunnel QoS ko teen cheezein chahiye: normal QoS policy (classes, schedulers, map, shaping rate), hub ke tunnel interface par <b>hub role</b>, aur har spoke par apne downstream bandwidth ke saath <b>spoke role</b>. Manager mein yeh <b>VPN Interface Ethernet</b> feature template ka Tunnel section hai: <i>Per-tunnel QoS</i> enable karo; hub par <i>Per-tunnel QoS Aggregator</i> On karo aur chaho to <i>Tunnel Bandwidth Percent</i> badlo (default 50); spokes par aggregator Off rakho aur basic configuration mein <i>Bandwidth Downstream</i> set karo. CLI roop mein:</p>
<pre class="code"><span class="c">! hub E-DEL-1: per-spoke sessions ko aggregate karta hai</span>
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   tunnel-qos hub
  exit
 exit
!
<span class="c">! spoke E-BLR-1: batata hai woh kitna receive kar sakta hai (kbps)</span>
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet
   tunnel-qos spoke
  exit
  bandwidth-downstream 20000
 exit</pre>
<p>Hub sessions ki sankhya platform se limited hoti hai. Cisco 100 se 10,000 sessions ka configurable maximum document karta hai, jo <code>platform qos sdwan max-session</code> command se set hota hai (release 17.13.1a se 10,000 tak; default platform par depend karta hai).</p>

<h3>Hub jo policy banata hai</h3>
<p>Hub ki generated policy mein per-tunnel parent hota hai jo har tunnel ke bandwidth ka ek hissa SD-WAN underlay class ko deta hai aur aapki normal child QoS policy attach karta hai. Cisco ka example pattern dikhata hai:</p>
<pre class="out">policy-map per_tunnel_qos_policy_GigabitEthernet1
 class SDWAN_underlay
  <span class="hl">bandwidth remaining percent 50</span>
  <span class="hl">service-policy qos_policy_4class_cedge</span>
!
interface GigabitEthernet1
 service-policy output shape_GigabitEthernet1</pre>
<p>Iska matlab har tunnel par spoke ki apni classes ke liye queues milti hain: spoke A ki voice spoke B ke backup traffic se mix nahi hoti. <i>Tunnel Bandwidth Percent</i> (default 50) tay karta hai ki interface bandwidth tunnels ke traffic aur usi physical interface ke dusre traffic (jaise non-SD-WAN underlay flows) ke beech kaise baante.</p>

<h3>Yaad rakhne wale rules aur restrictions</h3>
<ul>
<li><b>Sirf hub-to-spoke.</b> Spoke-to-spoke traffic cover nahi hota.</li>
<li>Sirf <b>IOS XE Catalyst SD-WAN</b> devices hub bante hain (Catalyst 8000 family, ISR 1000/4000, ASR 1000, CSR 1000V aadi); spokes vEdge bhi ho sakte hain. Release 17.2.1r mein aaya.</li>
<li><b>Cellular</b> interfaces par support nahi, aur loopback WAN interface (non-binding mode) ke saath bhi nahi.</li>
<li>Interface par lagi QoS policy overlay aur underlay ke beech shared hoti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Hub E-DEL-1 ke paas 1 Gbps internet circuit hai. Ek nightly job E-BLR-1 ki taraf 500 Mbps files copy karti hai, jo sirf 20 Mbps receive kar sakta hai. Per-tunnel QoS ke bina hub ka interface shaper poore 500 Mbps nikalne deta hai; Bengaluru ka ISP lagbhag 96 percent (500 mein se 480 Mbps) drop karta hai, E-BLR-1 ki taraf jaane wale 2 Mbps voice samet, aur file copy aur calls dono kharab hote hain. Per-tunnel QoS ke saath E-BLR-1 ka session lagbhag 20 Mbps par shape hota hai aur hub ki 4 ya 5 queues use karta hai; voice us session ki priority queue mein jaati hai, file copy intezaar karti hai, aur baaki spokes (E-MUM-1 50 Mbps, E-HYD-1 100 Mbps) par koi asar nahi padta.</p></div>

<h3>Verification</h3>
<pre class="out">E-DEL-1# show sdwan running-config sdwan | include tunnel-qos
   tunnel-qos hub
E-DEL-1# show platform software sdwan qos summary
E-DEL-1# show policy-map multipoint Tunnel1 203.0.113.14</pre>
<p>Cisco yeh checks batata hai: hub aur spoke par <code>show sdwan running-config</code>, physical interface ke liye <code>show policy-map interface</code>, ek spoke ke tunnel ke statistics ke liye <code>show policy-map multipoint Tunnel &lt;n&gt; &lt;spoke tunnel address&gt;</code>, aur sessions, policy parameters aur per-session data ke liye <code>show platform software sdwan qos summary</code>, <code>... qos policy</code> aur <code>... qos target</code>. Exact output platform aur release par depend karta hai, isliye apne device ka output padho, fixed layout ki ummeed mat rakho.</p>

<div class="warn"><p><b>Common mistake.</b> Hub role enable karna lekin spoke role aur downstream bandwidth bhool jaana. Us number ke bina hub ko pata nahi ki tunnel kitni tezi se shape kare. Ek aur galti hai spoke-to-spoke dynamic tunnels ke cover hone ki ummeed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Per-tunnel QoS <b>hub-to-spoke</b> hai, <code>tunnel-qos hub</code> aur <code>tunnel-qos spoke</code> use karta hai, aur spokes <code>bandwidth-downstream</code> OMP se publish karte hain. Yeh hub ke egress par, per session lagta hai. Cellular interfaces par support nahi.</p></div>

<div class="scn"><h4>Ek heavy spoke sabko slow karta hai</h4><p>Ek regional hub 60 chhoti branches ko serve karta tha. Jab Chennai branch ne bada software download shuru kiya, 20 dusri branches ne slow ERP ki shikayat ki. Hub ki WAN queue Chennai flow se bhari thi, jo branch ke ISP par 90 percent packets bhi kho rahi thi. Team ne har spoke ke downstream bandwidth ke saath per-tunnel QoS enable kiya. Chennai ko uske 30 Mbps circuit par shape kiya gaya, shared queue khaali ho gayi aur 20 shikayatein band ho gayin.</p><p><b>Lesson:</b> hub ko har spoke ki kshamta pata honi chahiye aur uske hisaab se shape karna chahiye.</p></div>

<div class="iv"><p class="q">"Per-tunnel QoS kyun use karte ho aur hub ko spoke ki speed kaise pata chalti hai?"</p><p>Tez hub dheeme spoke circuit ko overrun kar sakta hai; drops provider network mein andhadhund hote hain, aur ek spoke ka burst dusron ko dhakel sakta hai. Per-tunnel QoS har spoke tunnel ko hub par apna shaper aur queues deta hai. Spoke par <code>tunnel-qos spoke</code> aur downstream bandwidth configure hota hai, jise woh OMP se advertise karta hai; hub par <code>tunnel-qos hub</code>. Yeh IOS XE Catalyst SD-WAN hubs par hub-to-spoke feature hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tez hub dheeme spoke ko overrun kar sakta hai; provider tab andhadhund drop karta hai.</li>
<li>Per-tunnel QoS har spoke tunnel ko hub par apna shaper aur queues deta hai.</li>
<li>Spokes downstream bandwidth OMP mein publish karte hain; hub usi par shape karta hai.</li>
<li>Config: <code>tunnel-qos hub</code>, <code>tunnel-qos spoke</code>, <code>bandwidth-downstream</code>.</li>
<li>Sirf hub-and-spoke, sirf IOS XE hubs, cellular interfaces par nahi.</li>
</ul></div>
`}};export{e as default};