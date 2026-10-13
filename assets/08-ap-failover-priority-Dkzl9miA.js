var e={id:`ap-failover-priority`,h:{en:`AP failover: controller lists, discovery order, fallback and join priority (lab wl-mob-ap-failover)`,hi:`AP failover: controller lists, discovery order, fallback aur join priority (lab wl-mob-ap-failover)`},body:{en:`
<h3>An AP without a controller is a paperweight</h3>
<p>A lightweight AP cannot serve clients alone. If its controller dies, the AP notices (CAPWAP keepalives stop), drops its radios, and starts looking for another controller. If it has nowhere else to look, the floor goes dark. <b>AP failover</b> is the design in which each AP knows a second controller to try. It is the cheapest form of controller redundancy, and the basis of the N+1 design in chapter 10.</p>

<h3>How an AP finds a controller</h3>
<p>You met discovery in wl-control. For failover, the order of the AP's search matters:</p>
<ol>
<li><b>Controller list stored in the AP</b>: primary, then secondary, then tertiary (name and management IP each). This list is the failover tool.</li>
<li>Then the normal discovery methods: a statically configured address, <b>DHCP option 43</b>, DNS (<code>CISCO-CAPWAP-CONTROLLER.&lt;domain&gt;</code>), and local broadcast.</li>
<li>If several controllers answer the discovery request, the AP prefers its configured primary/secondary/tertiary, then a master controller, and otherwise the <b>least loaded</b> controller.</li>
</ol>
<p>In lab <b>wl-mob-ap-failover</b>, AP1 and AP2 in Mumbai know WLC1 <b>only</b> through option 43. Remove WLC1 and they have no other way to look: they stay in discovery. Giving them a controller list fixes it.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="AP failover and fallback">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">WLC1 primary</text><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">WLC2 secondary</text><text x="545" y="76" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text>
<rect x="245" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP1 and AP2</text><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="11">list: primary, secondary</text>
<line x1="320" y1="150" x2="95" y2="90" stroke="#64748b"/>
<line x1="320" y1="150" x2="545" y2="90" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6 4"/>
<text x="180" y="130" text-anchor="middle" class="svg-muted" font-size="12">normal: joined</text>
<text x="470" y="130" text-anchor="middle" class="svg-accent" font-size="12">WLC1 dead: join WLC2</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">When WLC1 answers again, the AP falls back to its primary.</text>
</svg><p class="cap">AP failover: join the next controller on the list; fallback returns the AP to the primary when it comes back.</p></div>

<h3>Configuring the list</h3>
<p>On the 9800 the list is set per AP with the <code>ap name</code> command, in privileged EXEC (the simulator also accepts it in configuration mode so a saved configuration reloads). The controller name must match the name the other controller reports, and the IP is its management address.</p>
<pre class="code"><span class="c">! on WLC1 (privileged exec)</span>
ap name AP1 controller primary WLC1 10.10.99.10
ap name AP1 controller secondary WLC2 10.20.99.10
ap name AP2 controller primary WLC1 10.10.99.10
ap name AP2 controller secondary WLC2 10.20.99.10</pre>
<p>Web UI: <b>Configuration &gt; Wireless &gt; Mobility</b> has an AP high availability card in the simulator; on a real 9800 the same fields are on <b>Configuration &gt; Wireless &gt; Access Points</b>, the AP's High Availability tab. For many APs, <b>AP priming profiles</b> (<code>wireless profile ap priming</code>, with an AP filter) apply a primary, secondary and tertiary to groups of APs by name pattern, which is how large sites do it. <b>The secondary controller must also be ready to serve the AP</b>: it needs the same WLANs, a policy profile for the VLANs, and a tag for the AP. In the lab, WLC2 is "staged": AP1 and AP2 are already mapped to policy tag PT-DEL there.</p>
<pre class="out">WLC1# show ap name AP2 config general
...
Primary Cisco Controller Name           : WLC1
Primary Cisco Controller IP Address     : 10.10.99.10
Secondary Cisco Controller Name         : WLC2
Secondary Cisco Controller IP Address   : 10.20.99.10
Tertiary Cisco Controller Name          :
Tertiary Cisco Controller IP Address    :</pre>

<h3>Testing it: lose WLC1</h3>
<p>The lab shuts the switch port to WLC1 (<code>interface GigabitEthernet0/1</code> on SW1, <code>shutdown</code>) and waits. The AP's CAPWAP echo (heartbeat) times out, the AP drops its radios, and joins WLC2. The timing on a real AP is tens of seconds with default timers (the lab waits about 40 seconds of simulated time); <b>fast heartbeat</b> shortens it at the cost of more keepalive traffic. When the AP re-joins, its client radios restart, so clients reassociate.</p>
<pre class="out">WLC2# show ap summary
Number of APs: 4

AP Name   Slots AP Model      Ethernet MAC   Radio MAC      CC   IP Address     State
AP1       2     C9120AXI-D    0011.2233.4401 0011.2233.44a1 IN   10.10.10.21    <span class="hl">Registered</span>
AP2       2     C9120AXI-D    0011.2233.4402 0011.2233.44a2 IN   10.10.10.22    <span class="hl">Registered</span>
AP3       2     C9120AXI-D    0011.2233.4403 0011.2233.44a3 IN   10.20.10.21    Registered
AP4       2     C9120AXI-D    0011.2233.4404 0011.2233.44a4 IN   10.20.10.22    Registered</pre>
<p>When the cable is restored and WLC1 answers again, the AP <b>falls back</b> to its primary controller (fallback is on by default and the model does not let you turn it off). Without fallback, APs would stay on the secondary until someone moved them. Real 9800s can disable fallback; an AP flapping because of an unstable primary is the usual reason.</p>

<h3>What the client sees</h3>
<p>Failover rescues <b>service</b>, not <b>sessions</b>. LAPTOP2, which was on AP2 and WLC1, loses connection while the AP restarts, then associates to AP2 under WLC2. WLC2's PT-DEL maps NK-STAFF to PP-STAFF with <b>VLAN 120</b> (central switching, no mobility anchor to Mumbai because WLC1 is gone), so the laptop gets a Delhi address in 10.20.20.0/24. Its TCP sessions broke. That is correct behaviour and exactly the difference to HA SSO in chapter 9, where clients keep their sessions.</p>
<pre class="out">LAPTOP2&gt; wifi status
Connected to NK-STAFF via AP2 (controller WLC2)
IP address 10.20.20.37/24 gateway 10.20.20.1
LAPTOP2&gt; ping 10.20.60.20
5 packets transmitted, 5 received</pre>

<h3>AP join priority (concept only)</h3>
<p>What if the secondary controller is nearly full? <b>Failover priority</b> lets you decide which APs get a seat first. Each AP has a priority from 1 to 4 (1 is the default and lowest; 4 is the highest, "critical"): <code>ap name AP1 priority 4</code>. The setting does <b>nothing in normal operation</b>. It only matters when join requests exceed the controller's capacity: higher-priority APs join first, and a controller at its limit can make room by letting a lower-priority AP go. Typical use: emergency rooms and voice APs at 4, ordinary APs at 1. The simulator does not model join priority.</p>

<div class="eg"><p><b>Worked example.</b> A campus has 280 APs on controller A (capacity 300) and 100 on controller B (capacity 300). Controller A fails. B has room for only 200 more, but 280 APs try to join. With join priority, the 40 critical APs (priority 4) join first, then the rest until B is full; about 80 low-priority APs stay in discovery until capacity returns. Without priority, the 80 that lose would be random, perhaps including the ICU.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Giving the AP a list but not staging tags, WLANs and VLANs on the secondary, so the AP joins and serves nothing. Typing the controller name wrongly (it must match the real name). Exceeding the secondary controller's AP capacity or licence. Expecting clients to keep addresses after a controller failover without HA SSO.</p></div>

<div class="exam"><p><b>Exam trap.</b> The primary/secondary/tertiary list is checked <b>before</b> DHCP option 43, DNS and broadcast. Join priority matters only when the controller is full. And AP failover is not stateful: APs re-join and clients re-associate.</p></div>

<div class="scn"><h4>The second floor stayed dark</h4><p>After a controller power failure, the ground-floor APs recovered on the secondary controller but the second floor APs showed as joined yet broadcast no SSID. The secondary had default tags for those AP MAC addresses, so they landed in default-policy-tag with no WLAN mapped. The engineer added AP-to-tag mappings (or a filter) on the secondary, and SSIDs reappeared. They also scripted a monthly check that both controllers carry matching WLANs and tag assignments.</p><p><b>Lesson:</b> a failover target that cannot serve the AP's WLANs is not redundancy.</p></div>

<div class="iv"><p class="q">"What does an AP do when its controller fails, and how would you design for it?"</p><p>The AP detects the dead CAPWAP session, drops service and runs discovery. Design: primary/secondary/tertiary list or priming profile, a secondary with the same WLANs, policy profiles, tags and enough AP capacity and licence, and fallback to the primary. Add AP join priority for critical areas. State that it is not stateful: clients re-associate, so use HA SSO if sessions must survive.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP failover = a primary, secondary, tertiary list that the AP tries before normal discovery.</li>
<li>The secondary must carry matching WLANs, policies and AP tags, and have capacity.</li>
<li>Fallback returns APs to the primary when it answers again.</li>
<li>Clients re-associate and may get a new address after failover; it is not stateful.</li>
<li>Join priority (1 to 4) only matters when the controller is full; concept only in the simulator.</li>
</ul></div>
`,hi:`
<h3>Controller ke bina AP ek paperweight hai</h3>
<p>Lightweight AP akela clients ko serve nahi kar sakta. Agar uska controller mar jaaye to AP notice karta hai (CAPWAP keepalives band), radios gira deta hai aur doosra controller dhundhna shuru karta hai. Agar dhundhne ke liye aur kuch nahi, to poora floor andhera ho jaata hai. <b>AP failover</b> woh design hai jisme har AP ek doosra controller jaanta hai try karne ke liye. Yeh controller redundancy ka sabse sasta roop hai, aur chapter 10 ke N+1 design ki buniyad.</p>

<h3>AP controller kaise dhundhta hai</h3>
<p>Aap wl-control mein discovery mil chuke ho. Failover ke liye AP ki search ka order matter karta hai:</p>
<ol>
<li><b>AP mein stored controller list</b>: primary, phir secondary, phir tertiary (har ek ka name aur management IP). Yeh list failover ka tool hai.</li>
<li>Phir normal discovery methods: static configured address, <b>DHCP option 43</b>, DNS (<code>CISCO-CAPWAP-CONTROLLER.&lt;domain&gt;</code>), aur local broadcast.</li>
<li>Agar kai controllers discovery request ka jawab dein, to AP apne configured primary/secondary/tertiary ko prefer karta hai, phir master controller, warna <b>sabse kam loaded</b> controller.</li>
</ol>
<p>Lab <b>wl-mob-ap-failover</b> mein Mumbai ke AP1 aur AP2 WLC1 ko <b>sirf</b> option 43 se jaante hain. WLC1 hata do to unke paas dhundhne ka koi aur raasta nahi: woh discovery mein rehte hain. Unhe controller list dene se yeh fix hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="AP failover aur fallback">
<rect x="20" y="30" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="56" text-anchor="middle" class="svg-ink" font-size="13">WLC1 primary</text><text x="95" y="76" text-anchor="middle" class="svg-ink" font-size="12">10.10.99.10</text>
<rect x="470" y="30" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="545" y="56" text-anchor="middle" class="svg-ink" font-size="13">WLC2 secondary</text><text x="545" y="76" text-anchor="middle" class="svg-ink" font-size="12">10.20.99.10</text>
<rect x="245" y="150" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="172" text-anchor="middle" class="svg-ink" font-size="13">AP1 aur AP2</text><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="11">list: primary, secondary</text>
<line x1="320" y1="150" x2="95" y2="90" stroke="#64748b"/>
<line x1="320" y1="150" x2="545" y2="90" stroke="#7c3aed" stroke-width="2" stroke-dasharray="6 4"/>
<text x="180" y="130" text-anchor="middle" class="svg-muted" font-size="12">normal: joined</text>
<text x="470" y="130" text-anchor="middle" class="svg-accent" font-size="12">WLC1 dead: WLC2 join</text>
<text x="320" y="225" text-anchor="middle" class="svg-muted" font-size="12">Jab WLC1 dobara jawab de, AP apne primary par fallback karta hai.</text>
</svg><p class="cap">AP failover: list ke agle controller ko join karo; fallback primary wapas aane par AP ko use lauta deta hai.</p></div>

<h3>List configure karna</h3>
<p>9800 par list har AP ke liye <code>ap name</code> command se set hoti hai, privileged EXEC mein (simulator ise configuration mode mein bhi accept karta hai taaki saved configuration reload ho sake). Controller name woh hona chahiye jo doosra controller report karta hai, aur IP uska management address.</p>
<pre class="code"><span class="c">! WLC1 par (privileged exec)</span>
ap name AP1 controller primary WLC1 10.10.99.10
ap name AP1 controller secondary WLC2 10.20.99.10
ap name AP2 controller primary WLC1 10.10.99.10
ap name AP2 controller secondary WLC2 10.20.99.10</pre>
<p>Web UI: simulator mein <b>Configuration &gt; Wireless &gt; Mobility</b> par AP high availability card hai; asli 9800 par yahi fields <b>Configuration &gt; Wireless &gt; Access Points</b> mein AP ke High Availability tab par hain. Kai APs ke liye <b>AP priming profiles</b> (<code>wireless profile ap priming</code>, AP filter ke saath) name pattern se APs ke groups par primary, secondary aur tertiary apply karte hain, bade sites aise hi karte hain. <b>Secondary controller ko bhi AP ko serve karne ke liye ready hona chahiye</b>: use same WLANs, VLANs ke liye policy profile, aur AP ke liye tag chahiye. Lab mein WLC2 "staged" hai: AP1 aur AP2 wahan pehle se policy tag PT-DEL se mapped hain.</p>
<pre class="out">WLC1# show ap name AP2 config general
...
Primary Cisco Controller Name           : WLC1
Primary Cisco Controller IP Address     : 10.10.99.10
Secondary Cisco Controller Name         : WLC2
Secondary Cisco Controller IP Address   : 10.20.99.10
Tertiary Cisco Controller Name          :
Tertiary Cisco Controller IP Address    :</pre>

<h3>Test karna: WLC1 kho do</h3>
<p>Lab WLC1 ke switch port ko shut karta hai (SW1 par <code>interface GigabitEthernet0/1</code>, <code>shutdown</code>) aur wait karta hai. AP ka CAPWAP echo (heartbeat) time out hota hai, AP radios gira deta hai aur WLC2 join karta hai. Asli AP par timing default timers ke saath tens of seconds hai (lab lagbhag 40 second simulated time wait karta hai); <b>fast heartbeat</b> ise kam karta hai, zyada keepalive traffic ki keemat par. AP re-join kare to uske client radios restart hote hain, isliye clients reassociate karte hain.</p>
<pre class="out">WLC2# show ap summary
Number of APs: 4

AP Name   Slots AP Model      Ethernet MAC   Radio MAC      CC   IP Address     State
AP1       2     C9120AXI-D    0011.2233.4401 0011.2233.44a1 IN   10.10.10.21    <span class="hl">Registered</span>
AP2       2     C9120AXI-D    0011.2233.4402 0011.2233.44a2 IN   10.10.10.22    <span class="hl">Registered</span>
AP3       2     C9120AXI-D    0011.2233.4403 0011.2233.44a3 IN   10.20.10.21    Registered
AP4       2     C9120AXI-D    0011.2233.4404 0011.2233.44a4 IN   10.20.10.22    Registered</pre>
<p>Cable wapas lagne par aur WLC1 ke jawab dene par AP apne primary par <b>fallback</b> karta hai (fallback default on hai aur model ise off nahi karne deta). Fallback ke bina APs secondary par tab tak rehte jab tak koi unhe move na kare. Asli 9800 fallback disable kar sakte hain; unstable primary ki wajah se AP flap karna iska usual karan hai.</p>

<h3>Client kya dekhta hai</h3>
<p>Failover <b>service</b> bachata hai, <b>sessions</b> nahi. LAPTOP2, jo AP2 aur WLC1 par tha, AP restart hone tak connection kho deta hai, phir WLC2 ke under AP2 se associate hota hai. WLC2 ka PT-DEL NK-STAFF ko PP-STAFF se <b>VLAN 120</b> mein map karta hai (central switching, Mumbai ka mobility anchor nahi kyunki WLC1 gaya), isliye laptop ko 10.20.20.0/24 ka Delhi address milta hai. Uske TCP sessions toot gaye. Yeh sahi behaviour hai aur chapter 9 ke HA SSO se bilkul yahi farak hai, jahan clients apne sessions rakhte hain.</p>
<pre class="out">LAPTOP2&gt; wifi status
Connected to NK-STAFF via AP2 (controller WLC2)
IP address 10.20.20.37/24 gateway 10.20.20.1
LAPTOP2&gt; ping 10.20.60.20
5 packets transmitted, 5 received</pre>

<h3>AP join priority (concept only)</h3>
<p>Agar secondary controller lagbhag full ho to? <b>Failover priority</b> aapko decide karne deti hai ki kin APs ko pehle seat mile. Har AP ki priority 1 se 4 hoti hai (1 default aur sabse kam; 4 sabse zyada, "critical"): <code>ap name AP1 priority 4</code>. Yeh setting <b>normal operation mein kuch nahi karti</b>. Yeh tab matter karti hai jab join requests controller ki capacity se zyada ho jaayein: higher-priority APs pehle join karte hain, aur limit par pahunche controller lower-priority AP ko chhod kar jagah bana sakta hai. Typical use: emergency rooms aur voice APs 4 par, ordinary APs 1 par. Simulator join priority model nahi karta.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus mein controller A par 280 APs hain (capacity 300) aur controller B par 100 APs (capacity 300). Controller A fail ho jaata hai. B mein sirf 200 aur ki jagah hai, lekin 280 APs join karne ki koshish karte hain. Join priority ke saath 40 critical APs (priority 4) pehle join karte hain, phir baaki jab tak B full na ho; lagbhag 80 low-priority APs capacity wapas aane tak discovery mein rehte hain. Priority ke bina jo 80 haarte woh random hote, shayad ICU bhi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> AP ko list dena lekin secondary par tags, WLANs aur VLANs stage na karna, to AP join ho jaata hai aur kuch serve nahi karta. Controller name galat type karna (asli naam se match hona chahiye). Secondary controller ki AP capacity ya licence se zyada jaana. HA SSO ke bina controller failover ke baad clients se address rakhne ki ummeed karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Primary/secondary/tertiary list DHCP option 43, DNS aur broadcast se <b>pehle</b> check hoti hai. Join priority tabhi matter karti hai jab controller full ho. Aur AP failover stateful nahi hai: APs re-join karte hain aur clients re-associate karte hain.</p></div>

<div class="scn"><h4>Doosri manzil andheri rahi</h4><p>Controller power failure ke baad ground-floor ke APs secondary par recover ho gaye lekin doosri manzil ke APs joined dikhe par koi SSID broadcast nahi kiya. Secondary ke paas un AP MAC addresses ke liye default tags the, isliye woh default-policy-tag mein pahunche jisme koi WLAN mapped nahi. Engineer ne secondary par AP-to-tag mappings (ya filter) add kiye, aur SSIDs wapas aa gaye. Unhone monthly check bhi script kiya ki dono controllers par matching WLANs aur tag assignments hain.</p><p><b>Lesson:</b> jo failover target AP ki WLANs serve nahi kar sakta woh redundancy nahi hai.</p></div>

<div class="iv"><p class="q">"AP ka controller fail ho jaaye to AP kya karta hai, aur aap iske liye design kaise karoge?"</p><p>AP dead CAPWAP session detect karta hai, service band karta hai aur discovery chalata hai. Design: primary/secondary/tertiary list ya priming profile, aisa secondary jisme same WLANs, policy profiles, tags aur kaafi AP capacity aur licence ho, aur primary par fallback. Critical areas ke liye AP join priority jodo. Bolo ki yeh stateful nahi hai: clients re-associate karte hain, isliye sessions bachane hon to HA SSO use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AP failover = primary, secondary, tertiary list jo AP normal discovery se pehle try karta hai.</li>
<li>Secondary ko matching WLANs, policies aur AP tags chahiye, aur capacity.</li>
<li>Fallback APs ko primary wapas aane par uske paas lauta deta hai.</li>
<li>Failover ke baad clients re-associate karte hain aur naya address mil sakta hai; yeh stateful nahi.</li>
<li>Join priority (1 se 4) sirf tab matter karti hai jab controller full ho; simulator mein concept only.</li>
</ul></div>
`}};export{e as default};