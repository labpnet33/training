var e={id:`wlan-models`,h:{en:`WLAN deployment models: centralised, distributed, cloud and remote branch`,hi:`WLAN deployment models: centralised, distributed, cloud aur remote branch`},body:{en:`
<p>Think of a restaurant chain. A tiny café can have its own cook who decides everything alone. A big mall food court sends every order to one central kitchen. A chain of small outlets might have a head chef who writes the menu centrally, while each outlet cooks locally so it keeps serving even when the phone line to head office is down. And some chains let a remote company run their ordering system from an app. Wireless networks are deployed in exactly these ways. ENCOR 1.2 asks you to compare them at a design level; the enterprise wireless module later covers RF, roaming and controller configuration.</p>

<h3>Controller-less versus controller-based</h3>
<p>The first split is whether there is a controller at all.</p>
<ul>
<li><b>Controller-less (autonomous)</b>: each access point is a complete, independent device with its own configuration, SSIDs, security and RF settings. Fine for one or two APs; painful beyond that, because every change is repeated on every AP and features such as coordinated radio resource management and fast roaming are limited. Some material also calls an AP running an <b>embedded wireless controller</b> (one AP acting as controller for its neighbours) controller-less, because there is no separate controller box.</li>
<li><b>Controller-based (lightweight APs)</b>: APs are managed by a wireless LAN controller (WLC) using <b>CAPWAP</b>. This is the <b>split-MAC</b> model: real-time functions (beacons, acknowledgements, encryption) stay on the AP, while management, authentication, RF management and roaming decisions move to the controller. CAPWAP uses <b>UDP 5246</b> for control and <b>UDP 5247</b> for data.</li>
</ul>

<h3>Where the controller and the data path live</h3>
<table class="cmp"><tr><th>Model</th><th>Controller</th><th>Client data path</th><th>Best fit</th></tr>
<tr><td><b>Centralised</b></td><td>WLC (appliance or pair) in the data centre or services block</td><td>Tunnelled in CAPWAP from AP (local mode) to the WLC, then switched there</td><td>Campus with good LAN bandwidth; central policy and easy roaming</td></tr>
<tr><td><b>Distributed</b></td><td>Controller function close to the edge: embedded on Catalyst 9000 switches, or central WLC with locally switched APs</td><td>Switched at the access layer (in SD-Access, VXLAN from AP to fabric edge)</td><td>Large campuses and fabric designs; avoids hairpinning all traffic to one place</td></tr>
<tr><td><b>Cloud</b></td><td>Management in the cloud (cloud-managed APs) or a virtual controller such as Catalyst 9800-CL in a public or private cloud</td><td>Local at the site; only management goes to the cloud</td><td>Many small sites, lean IT teams, fast rollout</td></tr>
<tr><td><b>Remote branch</b></td><td>Central WLC over the WAN with <b>FlexConnect</b> APs, or an embedded controller on a branch AP</td><td>Locally switched onto the branch VLAN; can keep working if the WAN fails</td><td>Branches and retail stores</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Centralised versus FlexConnect data paths">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">WLC in DC</text>
<rect x="30" y="110" width="160" height="40" rx="8" fill="#bae6fd"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">Campus AP (local)</text>
<rect x="450" y="110" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text>
<line x1="110" y1="110" x2="270" y2="55" stroke="#64748b" stroke-width="3"/><text x="120" y="80" class="svg-muted" font-size="12">control + data</text>
<line x1="530" y1="110" x2="370" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="460" y="80" class="svg-muted" font-size="12">control only</text>
<rect x="450" y="180" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch VLAN (local)</text>
<line x1="530" y1="150" x2="530" y2="180" stroke="#64748b" stroke-width="3"/>
<text x="110" y="190" text-anchor="middle" class="svg-accent" font-size="12">All client traffic to WLC</text>
</svg><p class="cap">Local mode tunnels everything to the controller; FlexConnect keeps data at the branch.</p></div>

<h3>FlexConnect for branches</h3>
<p>A <b>FlexConnect</b> AP keeps its CAPWAP control connection to a central WLC but switches client traffic onto a local VLAN. If the WAN fails, it enters <b>standalone</b> mode: already-connected clients stay connected, and with local authentication configured new clients can still join. On a Catalyst 9800 controller, APs become FlexConnect through a site tag that is not a local site:</p>
<pre class="code">wireless profile flex BR1-FLEX
 native-vlan-id 30
wireless tag site BR1-SITE
 flex-profile BR1-FLEX
 no local-site</pre>
<pre class="out">WLC1# show ap summary
Number of APs: 2
AP Name     Slots  AP Model     Ethernet MAC    Radio MAC       Location  Country  IP Address   State
<span class="hl">AP-HQ-01    2      C9120AXI-D   00aa.bb11.0001  00aa.bb22.0001  HQ-FL1    IN       10.1.30.21   Registered</span>
<span class="hl">AP-BR1-01   2      C9120AXI-D   00aa.bb11.0002  00aa.bb22.0002  Branch1   IN       10.50.30.21  Registered</span></pre>

<h3>Design factors beyond the model</h3>
<ul>
<li><b>Client density</b>: auditoriums, classrooms and stadiums are designed for <b>capacity</b>, not coverage. Use more APs at lower power, prefer 5 GHz and 6 GHz, use narrower channels to get more of them, and plan the number of clients per radio.</li>
<li><b>Location services</b>: accurate location needs every point heard by at least three APs at about -75 dBm or better, with APs placed along the perimeter and staggered, not just down the corridor.</li>
<li><b>Controller redundancy</b>: N+1 (one spare WLC for many), N+N (two sets sharing load), N+N+1, or an <b>HA SSO pair</b> in which a standby controller holds AP and client state, so a failure does not force APs to rejoin.</li>
<li><b>Latency and bandwidth</b> between AP and controller: local mode depends on the LAN or WAN path for every packet, which is why remote sites use FlexConnect.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A retail chain has 400 stores with 3 APs each and a 20 Mbps WAN link per store. In local mode, a video stream from a store tablet would cross the WAN to the WLC and back to the store's printer server: wasted bandwidth and a total Wi-Fi outage when the WAN drops. With FlexConnect and local switching, only CAPWAP control (a few kbps per AP) crosses the WAN, and point-of-sale devices keep working in standalone mode during a WAN outage.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting branch APs in local mode across a slow WAN. Designing a lecture hall for coverage (a few high-power APs) instead of capacity. Expecting controller-less APs to give seamless roaming and central RF management.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local mode = data tunnelled to the WLC (centralised). FlexConnect = data switched locally (remote branch), control still to the WLC. Cloud-managed = management in the cloud, data stays local. CAPWAP control is UDP 5246, data UDP 5247.</p></div>

<div class="scn"><h4>Card payments stopped when the WAN did</h4><p>A pharmacy chain ran all store APs in local mode against a WLC pair in the head-office data centre. When a provider fault cut the WAN to 60 stores for two hours, every handheld card terminal on Wi-Fi went offline, even though each store's internet breakout for payments was working. The engineer confirmed with <code>show ap summary</code> that the store APs had dropped their CAPWAP sessions. The redesign moved stores to FlexConnect with local switching of the payment VLAN and local authentication, so terminals stay online in standalone mode.</p><p><b>Lesson:</b> choose the wireless model per site type; branches need data to stay local.</p></div>

<div class="iv"><p class="q">"Compare centralised (local mode) and FlexConnect wireless deployments."</p><p>In centralised mode APs tunnel all client traffic in CAPWAP to the WLC, which gives central policy, simple roaming and one place to inspect traffic, but depends on the path to the controller for every packet. FlexConnect keeps CAPWAP control to the WLC but switches data locally, saves WAN bandwidth and survives WAN outages in standalone mode, at the cost of some features and local VLAN planning. Use local mode in the campus and FlexConnect in branches. Mention cloud-managed and embedded controllers as further options.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-less = autonomous APs; controller-based = lightweight APs with CAPWAP split-MAC.</li>
<li>Centralised: WLC in the DC, data tunnelled to it; best for campuses.</li>
<li>Distributed: controller or switching at the edge (embedded WLC, SD-Access fabric wireless).</li>
<li>Cloud: management in the cloud or a virtual WLC in the cloud; data local.</li>
<li>Remote branch: FlexConnect with local switching and standalone mode; plan for density, location and WLC redundancy.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain ke baare mein socho. Ek chhote café ka apna cook ho sakta hai jo sab kuch akele decide karta hai. Bade mall ka food court har order ek central kitchen ko bhejta hai. Chhote outlets ki chain mein head chef centrally menu likhta hai, jabki har outlet locally khaana banata hai taaki head office ki phone line band hone par bhi serve karta rahe. Aur kuch chains ek remote company ko app se apna ordering system chalane deti hain. Wireless networks bilkul inhi tarikon se deploy hote hain. ENCOR 1.2 aapse inhe design level par compare karwata hai; baad mein enterprise wireless module RF, roaming aur controller configuration cover karta hai.</p>

<h3>Controller-less vs controller-based</h3>
<p>Pehla split yeh hai ki controller hai bhi ya nahi.</p>
<ul>
<li><b>Controller-less (autonomous)</b>: har access point ek poora, independent device hai apni configuration, SSIDs, security aur RF settings ke saath. Ek-do APs ke liye theek; usse zyada mein takleef, kyunki har change har AP par dohrana padta hai aur coordinated radio resource management aur fast roaming jaise features limited hain. Kuch material <b>embedded wireless controller</b> chalane wale AP (ek AP apne padosiyon ka controller) ko bhi controller-less kehta hai, kyunki alag controller box nahi hota.</li>
<li><b>Controller-based (lightweight APs)</b>: APs <b>CAPWAP</b> use karke wireless LAN controller (WLC) se managed hote hain. Yeh <b>split-MAC</b> model hai: real-time functions (beacons, acknowledgements, encryption) AP par rehte hain, jabki management, authentication, RF management aur roaming decisions controller par jaate hain. CAPWAP control ke liye <b>UDP 5246</b> aur data ke liye <b>UDP 5247</b> use karta hai.</li>
</ul>

<h3>Controller aur data path kahan rehte hain</h3>
<table class="cmp"><tr><th>Model</th><th>Controller</th><th>Client data path</th><th>Best fit</th></tr>
<tr><td><b>Centralised</b></td><td>Data centre ya services block mein WLC (appliance ya pair)</td><td>AP (local mode) se WLC tak CAPWAP mein tunnel, phir wahan switch</td><td>Achhi LAN bandwidth wala campus; central policy aur aasaan roaming</td></tr>
<tr><td><b>Distributed</b></td><td>Controller function edge ke paas: Catalyst 9000 switches par embedded, ya locally switched APs ke saath central WLC</td><td>Access layer par switch (SD-Access mein AP se fabric edge tak VXLAN)</td><td>Bade campuses aur fabric designs; saara traffic ek jagah hairpin karne se bachata hai</td></tr>
<tr><td><b>Cloud</b></td><td>Management cloud mein (cloud-managed APs) ya public ya private cloud mein Catalyst 9800-CL jaisa virtual controller</td><td>Site par local; sirf management cloud jaata hai</td><td>Bahut saari chhoti sites, chhoti IT teams, tez rollout</td></tr>
<tr><td><b>Remote branch</b></td><td><b>FlexConnect</b> APs ke saath WAN par central WLC, ya branch AP par embedded controller</td><td>Branch VLAN par locally switch; WAN fail hone par bhi kaam kar sakta hai</td><td>Branches aur retail stores</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Centralised vs FlexConnect data paths">
<rect x="250" y="15" width="140" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">DC mein WLC</text>
<rect x="30" y="110" width="160" height="40" rx="8" fill="#bae6fd"/><text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="13">Campus AP (local)</text>
<rect x="450" y="110" width="160" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="13">Branch AP (Flex)</text>
<line x1="110" y1="110" x2="270" y2="55" stroke="#64748b" stroke-width="3"/><text x="120" y="80" class="svg-muted" font-size="12">control + data</text>
<line x1="530" y1="110" x2="370" y2="55" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="460" y="80" class="svg-muted" font-size="12">sirf control</text>
<rect x="450" y="180" width="160" height="36" rx="8" fill="#fde68a"/><text x="530" y="203" text-anchor="middle" class="svg-ink" font-size="12">Branch VLAN (local)</text>
<line x1="530" y1="150" x2="530" y2="180" stroke="#64748b" stroke-width="3"/>
<text x="110" y="190" text-anchor="middle" class="svg-accent" font-size="12">Saara client traffic WLC tak</text>
</svg><p class="cap">Local mode sab kuch controller tak tunnel karta hai; FlexConnect data branch par rakhta hai.</p></div>

<h3>Branches ke liye FlexConnect</h3>
<p><b>FlexConnect</b> AP central WLC tak apna CAPWAP control connection rakhta hai lekin client traffic ko local VLAN par switch karta hai. Agar WAN fail ho, to woh <b>standalone</b> mode mein chala jaata hai: pehle se connected clients connected rehte hain, aur local authentication configured ho to naye clients bhi join kar sakte hain. Catalyst 9800 controller par APs aise site tag se FlexConnect bante hain jo local site nahi hai:</p>
<pre class="code">wireless profile flex BR1-FLEX
 native-vlan-id 30
wireless tag site BR1-SITE
 flex-profile BR1-FLEX
 no local-site</pre>
<pre class="out">WLC1# show ap summary
Number of APs: 2
AP Name     Slots  AP Model     Ethernet MAC    Radio MAC       Location  Country  IP Address   State
<span class="hl">AP-HQ-01    2      C9120AXI-D   00aa.bb11.0001  00aa.bb22.0001  HQ-FL1    IN       10.1.30.21   Registered</span>
<span class="hl">AP-BR1-01   2      C9120AXI-D   00aa.bb11.0002  00aa.bb22.0002  Branch1   IN       10.50.30.21  Registered</span></pre>

<h3>Model ke alawa design factors</h3>
<ul>
<li><b>Client density</b>: auditoriums, classrooms aur stadiums <b>capacity</b> ke liye design hote hain, coverage ke liye nahi. Kam power par zyada APs use karo, 5 GHz aur 6 GHz ko prefer karo, zyada channels paane ke liye narrower channels use karo, aur har radio par clients ki sankhya plan karo.</li>
<li><b>Location services</b>: accurate location ke liye har point ko kam se kam teen APs lagbhag -75 dBm ya behtar par sunne chahiye, APs perimeter ke saath aur staggered lagein, sirf corridor mein nahi.</li>
<li><b>Controller redundancy</b>: N+1 (kai ke liye ek spare WLC), N+N (do sets load share karte hain), N+N+1, ya <b>HA SSO pair</b> jismein standby controller AP aur client state rakhta hai, taaki failure par APs ko rejoin na karna pade.</li>
<li>AP aur controller ke beech <b>latency aur bandwidth</b>: local mode har packet ke liye LAN ya WAN path par depend karta hai, isiliye remote sites FlexConnect use karti hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek retail chain ke 400 stores hain, har ek mein 3 APs aur 20 Mbps WAN link. Local mode mein store tablet ki video stream WAN cross karke WLC tak jaati aur wapas store ke printer server tak aati: bandwidth waste aur WAN girne par poora Wi-Fi outage. FlexConnect aur local switching ke saath sirf CAPWAP control (har AP ke kuch kbps) WAN cross karta hai, aur WAN outage ke dauraan point-of-sale devices standalone mode mein kaam karte rehte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Slow WAN ke paar branch APs ko local mode mein rakhna. Lecture hall ko capacity ki jagah coverage (kuch high-power APs) ke liye design karna. Controller-less APs se seamless roaming aur central RF management ki umeed rakhna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local mode = data WLC tak tunnel (centralised). FlexConnect = data locally switch (remote branch), control ab bhi WLC tak. Cloud-managed = management cloud mein, data local. CAPWAP control UDP 5246, data UDP 5247.</p></div>

<div class="scn"><h4>WAN ruka to card payments ruke</h4><p>Ek pharmacy chain saare store APs ko head-office data centre ke WLC pair ke against local mode mein chalati thi. Jab provider fault ne 60 stores ka WAN do ghante ke liye kaat diya, Wi-Fi par har handheld card terminal offline ho gaya, jabki har store ka payments wala internet breakout kaam kar raha tha. Engineer ne <code>show ap summary</code> se confirm kiya ki store APs ke CAPWAP sessions gir gaye the. Redesign ne stores ko payment VLAN ki local switching aur local authentication ke saath FlexConnect par shift kiya, taaki terminals standalone mode mein online rahein.</p><p><b>Seekh:</b> har site type ke liye wireless model chuno; branches ko data local rakhna chahiye.</p></div>

<div class="iv"><p class="q">"Centralised (local mode) aur FlexConnect wireless deployments compare karo."</p><p>Centralised mode mein APs saara client traffic CAPWAP mein WLC tak tunnel karte hain, jisse central policy, simple roaming aur traffic inspect karne ki ek jagah milti hai, lekin har packet controller tak ke path par depend karta hai. FlexConnect CAPWAP control WLC tak rakhta hai lekin data locally switch karta hai, WAN bandwidth bachata hai aur standalone mode mein WAN outages jhel leta hai, badle mein kuch features aur local VLAN planning. Campus mein local mode aur branches mein FlexConnect use karo. Cloud-managed aur embedded controllers ko aur options ki tarah batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Controller-less = autonomous APs; controller-based = CAPWAP split-MAC ke saath lightweight APs.</li>
<li>Centralised: DC mein WLC, data uske paas tunnel; campuses ke liye best.</li>
<li>Distributed: edge par controller ya switching (embedded WLC, SD-Access fabric wireless).</li>
<li>Cloud: management cloud mein ya cloud mein virtual WLC; data local.</li>
<li>Remote branch: local switching aur standalone mode ke saath FlexConnect; density, location aur WLC redundancy plan karo.</li>
</ul></div>
`}};export{e as default};