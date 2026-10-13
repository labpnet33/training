var e={id:`recursive-routing`,h:{en:`The flapping tunnel: recursive routing and how to stop it`,hi:`Flapping tunnel: recursive routing aur ise kaise rokein`},body:{en:`
<p>Imagine a courier who is told: "to deliver the sealed box to Jaipur depot, put it inside a sealed box addressed to Jaipur depot." He puts the box in a box, which must go in another box, and so on forever. Eventually the manager notices, cancels the whole route for a minute, and then someone restores it, and the madness starts again. That is <b>recursive routing</b>, and it is the most famous tunnel fault in both the ENCOR exam and real networks.</p>

<h3>The rule the router must obey</h3>
<p>The outer (transport) packet of a tunnel is routed with the normal routing table. To send anything into Tunnel0, BR1 must first find how to reach the tunnel destination, 100.64.22.2. That lookup must resolve through a <b>physical, underlay</b> interface such as Gi0/0. If the best route to 100.64.22.2 points into Tunnel0 itself, the router would need the tunnel to build the tunnel. IOS detects this loop, logs <code>%TUN-5-RECURDOWN</code> and disables the tunnel.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Recursive routing cycle">
<rect x="220" y="10" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">1. Tunnel0 up/up</text>
<rect x="430" y="90" width="200" height="44" rx="8" fill="#fde68a"/><text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="12">2. Route 100.64.22.0/30</text><text x="530" y="126" text-anchor="middle" class="svg-ink" font-size="12">via Tunnel0 installed</text>
<rect x="220" y="170" width="200" height="44" rx="8" fill="#fed7aa"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">3. Destination via tunnel</text><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">RECURDOWN, tunnel down</text>
<rect x="10" y="90" width="200" height="44" rx="8" fill="#bae6fd"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="12">4. Route removed, default</text><text x="110" y="126" text-anchor="middle" class="svg-ink" font-size="12">via Gi0/0 used again</text>
<line x1="420" y1="40" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="134" x2="420" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="190" x2="140" y2="134" stroke="#64748b" stroke-width="2"/><line x1="140" y1="90" x2="220" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="14">flap cycle</text>
</svg><p class="cap">The cycle repeats every time the tunnel comes back: a flapping tunnel.</p></div>

<h3>How it happens in practice</h3>
<ul>
<li><b>A static route</b> sends the far WAN subnet into the tunnel, as in the lab: <code>ip route 100.64.22.0 255.255.255.252 Tunnel0</code>. A /30 is more specific than the 0.0.0.0/0 default, so longest match picks it.</li>
<li><b>An IGP over the tunnel</b> advertises the WAN subnets. OSPF runs on Tunnel0 and someone added <code>network 100.64.0.0 0.0.255.255 area 0</code>. BR1 learns 100.64.22.0/30 from BR2 over the tunnel, more specific than the default, and installs it via Tunnel0.</li>
<li><b>Redistribution</b> of connected routes into the overlay protocol does the same thing.</li>
</ul>

<h3>Walking the troubleshooting lab</h3>
<p>The ticket says a colleague "improved" BR1 so traffic to BR2's public network uses the VPN, and since then Tunnel0 goes up and down every few seconds. Task 1 is to collect evidence:</p>
<pre class="out">BR1# show logging | include TUN
*Sep 30 10:14:02.117: <span class="hl">%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing</span>
*Sep 30 10:15:03.221: %TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing

BR1# show ip route 100.64.22.2
Routing entry for 100.64.22.0/30
  Known via "static", distance 1, metric 0 (connected)
  Routing Descriptor Blocks:
  <span class="hl">* directly connected, via Tunnel0</span>
      Route metric is 0, traffic share count is 1</pre>
<p>The route to the tunnel's own destination points into Tunnel0. That is the proof. Task 2 is the fix: remove the route so the destination is reached through the default route via Gi0/0.</p>
<pre class="code">BR1(config)# no ip route 100.64.22.0 255.255.255.252 Tunnel0</pre>
<pre class="out">BR1# show ip cef 100.64.22.2
0.0.0.0/0
  <span class="hl">nexthop 100.64.11.1 GigabitEthernet0/0</span></pre>
<p>Task 3 is the proof: wait for keepalives, then Tunnel0 is up/up on both routers in <code>show ip interface brief</code> and PC1 pings PC2. Note that <code>show ip route 100.64.22.2</code> now answers "% Network not in table", because only the default route covers it; <code>show ip cef</code> shows the actual forwarding decision.</p>

<h3>Permanent fixes in real designs</h3>
<ol>
<li><b>Never advertise underlay prefixes into the overlay.</b> Put only LAN and tunnel subnets in the IGP running on the tunnel; filter the rest with a distribute-list or prefix list.</li>
<li><b>Pin the destination.</b> A host route via the physical next hop, <code>ip route 100.64.22.2 255.255.255.255 100.64.11.1</code>, is more specific than anything learned through the tunnel, as long as nobody advertises a /32.</li>
<li><b>Separate processes or AD.</b> Learn the underlay with one protocol and the overlay with another, and make sure the underlay route wins.</li>
<li><b>Front-door VRF (fVRF).</b> Place Gi0/0 in its own VRF and tell the tunnel to look up its destination there. The inside table can then contain anything, including a default route through the tunnel, without affecting the transport.</li>
</ol>
<pre class="code">vrf definition INET
 address-family ipv4
 exit-address-family
interface GigabitEthernet0/0
 vrf forwarding INET
 ip address 100.64.11.2 255.255.255.252
ip route vrf INET 0.0.0.0 0.0.0.0 100.64.11.1
interface Tunnel0
 tunnel source GigabitEthernet0/0
 tunnel destination 100.64.22.2
 tunnel vrf INET                <span class="c">! transport lookup happens in INET</span></pre>

<div class="warn"><p><b>Common mistakes.</b> "Fixing" the flap by removing keepalives: the log stops but traffic still black-holes whenever the bad route is active. Adding the underlay subnet to OSPF with a wide network statement such as <code>network 0.0.0.0 255.255.255.255 area 0</code>. Forgetting that an fVRF makes <code>ping 100.64.22.2</code> fail unless you use <code>ping vrf INET</code>.</p></div>

<div class="exam"><p><b>Exam traps.</b> Recursive routing = the route to the tunnel destination goes through the tunnel. The syslog is <code>%TUN-5-RECURDOWN</code>. The fix is always to make the underlay route to the destination preferred or to keep underlay prefixes out of the overlay routing, not to change the tunnel mode.</p></div>

<div class="scn"><h4>The OSPF change that broke 40 branches</h4><p>A retail chain ran OSPF over GRE tunnels to its hub. To "simplify" the config, an engineer replaced specific network statements on the hub with <code>network 0.0.0.0 255.255.255.255 area 0</code>. The hub's internet-facing subnets were now advertised over every tunnel, the branches learned them as more specific than their default route, and all 40 tunnels began flapping every minute. The logs were full of RECURDOWN. Reverting the network statement and adding a prefix-list filter stopped the flapping.</p><p><b>Lesson:</b> the overlay must never learn a better path to the underlay addresses it rides on.</p></div>

<div class="iv"><p class="q">"A GRE tunnel keeps flapping and the log shows RECURDOWN. What is happening and how do you fix it?"</p><p>The router has learned a route to the tunnel destination through the tunnel itself, usually a static route or the IGP running over the tunnel advertising the WAN subnet with a longer prefix. The outer packet cannot use the tunnel, so IOS disables it; the route disappears, the tunnel comes up, the route returns, and it cycles. Fix by removing or filtering the underlay prefix from the overlay, adding a specific route to the destination via the physical next hop, or using a front-door VRF with <code>tunnel vrf</code>. Prove it with <code>show ip route</code> or <code>show ip cef</code> for the destination.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The route to the tunnel destination must resolve through the underlay, never through the tunnel.</li>
<li>Symptom: tunnel flaps, syslog <code>%TUN-5-RECURDOWN</code>.</li>
<li>Causes: static route into the tunnel, IGP over the tunnel advertising WAN subnets, redistribution.</li>
<li>Check with <code>show ip route</code> or <code>show ip cef</code> for the tunnel destination.</li>
<li>Fixes: filter underlay prefixes, host route via physical next hop, separate AD or protocols, front-door VRF.</li>
</ul></div>
`,hi:`
<p>Ek courier ko socho jise kaha gaya: "Jaipur depot tak sealed box deliver karne ke liye, use Jaipur depot ke address wale sealed box ke andar daalo." Woh box ko box mein daalta hai, jise ek aur box mein jaana hai, aur aise hamesha chalta rehta hai. Aakhir mein manager dekh leta hai, poora route ek minute ke liye cancel karta hai, phir koi use wapas chalu kar deta hai, aur pagalpan phir shuru. Yahi <b>recursive routing</b> hai, aur yeh ENCOR exam aur real networks dono mein sabse mashhoor tunnel fault hai.</p>

<h3>Woh rule jo router ko maanna padta hai</h3>
<p>Tunnel ka outer (transport) packet normal routing table se route hota hai. Tunnel0 mein kuch bhi bhejne ke liye BR1 ko pehle yeh dhoondhna padta hai ki tunnel destination 100.64.22.2 tak kaise pahunche. Woh lookup ek <b>physical, underlay</b> interface jaise Gi0/0 se resolve hona chahiye. Agar 100.64.22.2 ka best route khud Tunnel0 ki taraf point karta hai, to router ko tunnel banane ke liye tunnel hi chahiye. IOS yeh loop pakadta hai, <code>%TUN-5-RECURDOWN</code> log karta hai aur tunnel disable kar deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Recursive routing ka chakkar">
<rect x="220" y="10" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">1. Tunnel0 up/up</text>
<rect x="430" y="90" width="200" height="44" rx="8" fill="#fde68a"/><text x="530" y="110" text-anchor="middle" class="svg-ink" font-size="12">2. Route 100.64.22.0/30</text><text x="530" y="126" text-anchor="middle" class="svg-ink" font-size="12">via Tunnel0 install</text>
<rect x="220" y="170" width="200" height="44" rx="8" fill="#fed7aa"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="12">3. Destination tunnel se</text><text x="320" y="206" text-anchor="middle" class="svg-ink" font-size="12">RECURDOWN, tunnel down</text>
<rect x="10" y="90" width="200" height="44" rx="8" fill="#bae6fd"/><text x="110" y="110" text-anchor="middle" class="svg-ink" font-size="12">4. Route hata, default</text><text x="110" y="126" text-anchor="middle" class="svg-ink" font-size="12">via Gi0/0 phir use</text>
<line x1="420" y1="40" x2="500" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="134" x2="420" y2="180" stroke="#64748b" stroke-width="2"/>
<line x1="220" y1="190" x2="140" y2="134" stroke="#64748b" stroke-width="2"/><line x1="140" y1="90" x2="220" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-accent" font-size="14">flap chakkar</text>
</svg><p class="cap">Har baar tunnel wapas aane par chakkar repeat hota hai: flapping tunnel.</p></div>

<h3>Practice mein yeh kaise hota hai</h3>
<ul>
<li><b>Ek static route</b> far WAN subnet ko tunnel mein bhejta hai, jaise lab mein: <code>ip route 100.64.22.0 255.255.255.252 Tunnel0</code>. /30 0.0.0.0/0 default se zyada specific hai, isliye longest match use chunta hai.</li>
<li><b>Tunnel par chalne wala IGP</b> WAN subnets advertise karta hai. Tunnel0 par OSPF chalta hai aur kisi ne <code>network 100.64.0.0 0.0.255.255 area 0</code> jod diya. BR1 tunnel ke upar BR2 se 100.64.22.0/30 seekhta hai, jo default se zyada specific hai, aur use Tunnel0 via install karta hai.</li>
<li>Overlay protocol mein connected routes ka <b>redistribution</b> bhi yahi karta hai.</li>
</ul>

<h3>Troubleshooting lab ko step by step</h3>
<p>Ticket kehta hai ki ek colleague ne BR1 ko "improve" kiya taaki BR2 ke public network ka traffic VPN use kare, aur tab se Tunnel0 har kuch second mein up-down ho raha hai. Task 1 saboot ikattha karna hai:</p>
<pre class="out">BR1# show logging | include TUN
*Sep 30 10:14:02.117: <span class="hl">%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing</span>
*Sep 30 10:15:03.221: %TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing

BR1# show ip route 100.64.22.2
Routing entry for 100.64.22.0/30
  Known via "static", distance 1, metric 0 (connected)
  Routing Descriptor Blocks:
  <span class="hl">* directly connected, via Tunnel0</span>
      Route metric is 0, traffic share count is 1</pre>
<p>Tunnel ki apni destination ka route Tunnel0 ki taraf point karta hai. Yahi saboot hai. Task 2 fix hai: route hatao taaki destination Gi0/0 via default route se pahunche.</p>
<pre class="code">BR1(config)# no ip route 100.64.22.0 255.255.255.252 Tunnel0</pre>
<pre class="out">BR1# show ip cef 100.64.22.2
0.0.0.0/0
  <span class="hl">nexthop 100.64.11.1 GigabitEthernet0/0</span></pre>
<p>Task 3 saboot hai: keepalives ka intezaar karo, phir <code>show ip interface brief</code> mein dono routers par Tunnel0 up/up hai aur PC1 PC2 ko ping karta hai. Dhyan do ki <code>show ip route 100.64.22.2</code> ab "% Network not in table" jawab deta hai, kyunki sirf default route ise cover karta hai; <code>show ip cef</code> asli forwarding decision dikhata hai.</p>

<h3>Real designs mein permanent fixes</h3>
<ol>
<li><b>Underlay prefixes ko kabhi overlay mein advertise mat karo.</b> Tunnel par chalne wale IGP mein sirf LAN aur tunnel subnets rakho; baaki ko distribute-list ya prefix list se filter karo.</li>
<li><b>Destination ko pin karo.</b> Physical next hop via host route, <code>ip route 100.64.22.2 255.255.255.255 100.64.11.1</code>, tunnel se seekhi kisi bhi cheez se zyada specific hai, jab tak koi /32 advertise na kare.</li>
<li><b>Alag processes ya AD.</b> Underlay ek protocol se aur overlay doosre se seekho, aur pakka karo ki underlay route jeete.</li>
<li><b>Front-door VRF (fVRF).</b> Gi0/0 ko apne VRF mein rakho aur tunnel ko batao ki apni destination wahan lookup kare. Tab andar ki table mein kuch bhi ho sakta hai, tunnel se default route bhi, bina transport ko affect kiye.</li>
</ol>
<pre class="code">vrf definition INET
 address-family ipv4
 exit-address-family
interface GigabitEthernet0/0
 vrf forwarding INET
 ip address 100.64.11.2 255.255.255.252
ip route vrf INET 0.0.0.0 0.0.0.0 100.64.11.1
interface Tunnel0
 tunnel source GigabitEthernet0/0
 tunnel destination 100.64.22.2
 tunnel vrf INET                <span class="c">! transport lookup INET mein hota hai</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Keepalives hata kar flap "fix" karna: log ruk jaata hai lekin jab bhi galat route active hota hai traffic black-hole hota rehta hai. Wide network statement jaise <code>network 0.0.0.0 255.255.255.255 area 0</code> se underlay subnet ko OSPF mein daal dena. Bhoolna ki fVRF ke saath <code>ping 100.64.22.2</code> fail hoga jab tak aap <code>ping vrf INET</code> use na karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Recursive routing = tunnel destination ka route tunnel se hokar jaata hai. Syslog <code>%TUN-5-RECURDOWN</code> hai. Fix hamesha yeh hai ki destination ka underlay route preferred banao ya underlay prefixes ko overlay routing se bahar rakho, tunnel mode badalna nahi.</p></div>

<div class="scn"><h4>OSPF change jisne 40 branches tod di</h4><p>Ek retail chain apne hub tak GRE tunnels par OSPF chalati thi. Config "simple" karne ke liye ek engineer ne hub par specific network statements ko <code>network 0.0.0.0 255.255.255.255 area 0</code> se replace kar diya. Hub ke internet-facing subnets ab har tunnel par advertise hone lage, branches ne unhe apne default route se zyada specific seekh liya, aur saare 40 tunnels har minute flap karne lage. Logs RECURDOWN se bhare the. Network statement revert karke aur prefix-list filter jodke flapping ruki.</p><p><b>Seekh:</b> overlay ko kabhi un underlay addresses ka behtar path nahi seekhna chahiye jin par woh chalta hai.</p></div>

<div class="iv"><p class="q">"GRE tunnel baar-baar flap kar raha hai aur log RECURDOWN dikhata hai. Kya ho raha hai aur aap kaise fix karoge?"</p><p>Router ne tunnel destination ka route khud tunnel ke through seekh liya hai, aam taur par static route ya tunnel par chalne wala IGP jo WAN subnet longer prefix ke saath advertise karta hai. Outer packet tunnel use nahi kar sakta, isliye IOS use disable karta hai; route gayab hota hai, tunnel up hota hai, route wapas aata hai, aur chakkar chalta hai. Fix: underlay prefix ko overlay se hatao ya filter karo, physical next hop via destination ka specific route jodo, ya <code>tunnel vrf</code> ke saath front-door VRF use karo. Destination ke liye <code>show ip route</code> ya <code>show ip cef</code> se saabit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tunnel destination ka route underlay se resolve hona chahiye, kabhi tunnel se nahi.</li>
<li>Lakshan: tunnel flap karta hai, syslog <code>%TUN-5-RECURDOWN</code>.</li>
<li>Wajahein: tunnel mein static route, tunnel par IGP jo WAN subnets advertise kare, redistribution.</li>
<li>Tunnel destination ke liye <code>show ip route</code> ya <code>show ip cef</code> se check karo.</li>
<li>Fixes: underlay prefixes filter karo, physical next hop via host route, alag AD ya protocols, front-door VRF.</li>
</ul></div>
`}};export{e as default};