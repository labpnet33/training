var e={id:`routing-policy-zone`,h:{en:`Rungs 4 and 5: the routing table, ECMP, the zone and the firewall policy`,hi:`Rung 4 aur 5: routing table, ECMP, zone aur firewall policy`},body:{en:`
<p>A rule can only choose among members that the <b>routing table</b> can reach, and a chosen member only carries traffic if a <b>firewall policy</b> permits it. In SD-WAN, routes and policies point to the <b>zone</b>, not to the member interfaces. Most "SD-WAN does not work" tickets that are not measurement problems are missing routes or missing policies.</p>
<h3>Rung 4: the routing table</h3>
<p>SD-WAN rules do not create routes. They choose the output interface for traffic that already has a route that <b>could</b> use that interface. A static route with <code>sdwan-zone</code> installs one route entry per member of that zone, so the rule has candidates. Dynamic routes learned over the overlay (BGP or OSPF, see <b>fsd-routing</b>) point at the overlay members.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # get router info routing-table all
BR1-FGT # get router info routing-table details 10.0.0.50
BR1-FGT # get router info routing-table database
BR1-FGT # get router info bgp summary</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # get router info routing-table all
Routing table for VRF=0
S*      0.0.0.0/0 [1/0] via 203.0.113.1, port1, [1/0]
                  [1/0] via 198.51.100.1, port2, [1/0]
C       10.1.1.0/24 is directly connected, port5
B       10.0.0.0/24 [200/0] via 10.255.1.1 (recursive is directly connected, HUB1-ISP1), 00:12:44, [1/0]
                    [200/0] via 10.255.2.1 (recursive is directly connected, HUB1-ISP2), 00:12:44, [1/0]
C       10.255.1.2/32 is directly connected, HUB1-ISP1</pre>
<p>Read three things. <b>Default route:</b> two equal entries (same distance 1) mean both ISPs are candidates, which is what a two-member zone looks like. <b>Hub prefix:</b> <code>10.0.0.0/24</code> is reachable through both overlay tunnels, again equal, so the SD-WAN rule decides. <b>Best only:</b> if one path has a higher distance or a worse BGP preference, it does not appear in the active table at all, and the rule has nothing to choose from. Use the database view to see the hidden routes.</p>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr><tr><td>No default route through the zone</td><td>The static route still names an interface, not <code>sdwan-zone</code>; or the member gateway is missing</td></tr><tr><td>Only one overlay next hop to the hub prefix</td><td>BGP or OSPF is down on the other tunnel, or local preference or MED prefers one path so the other is not installed</td></tr><tr><td>Rule selects a member but traffic leaves another</td><td>Candidate not in the table for that destination; the rule cannot use an interface without a route</td></tr><tr><td>Hub prefix missing</td><td>Adjacency down, route filter or route-map, or tunnel inactive</td></tr><tr><td>Flow follows the route, not the rule</td><td>More specific route than the rule's destination, or a policy route above SD-WAN</td></tr></table>
<h3>ECMP and route preference</h3>
<p><b>ECMP</b> (equal-cost multipath) means several routes with the same prefix, distance and priority all sit in the table. The implicit SD-WAN rule load-balances across them; explicit rules choose among them. Only routes tied at the <b>best</b> distance and priority are candidates. To bring a backup path into play deliberately, give it the same distance and priority and let the rule steer. To keep a path as a pure fallback, give it a worse distance or a higher priority value.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="80" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">Destination</text><text x="65" y="118" text-anchor="middle" class="svg-muted" font-size="11">10.0.0.50</text><rect x="170" y="20" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="270" y="45" text-anchor="middle" class="svg-ink" font-size="13">Route A: HUB1-ISP1, dist 200</text><rect x="170" y="85" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="270" y="110" text-anchor="middle" class="svg-ink" font-size="13">Route B: HUB1-ISP2, dist 200</text><rect x="170" y="150" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="270" y="175" text-anchor="middle" class="svg-ink" font-size="13">Route C: LTE, dist 250 (hidden)</text><rect x="430" y="55" width="200" height="80" rx="10" fill="#bbf7d0"/><text x="530" y="82" text-anchor="middle" class="svg-ink" font-size="13">Candidates: A and B</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">the SD-WAN rule picks</text><text x="530" y="119" text-anchor="middle" class="svg-muted" font-size="12">between A and B only</text><line x1="120" y1="105" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="105" x2="170" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="370" y1="40" x2="430" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="105" x2="430" y2="100" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Only routes tied at the best distance and priority are candidates for the SD-WAN rule. The LTE route stays hidden.</p></div>
<h3>Rung 5: the zone and the firewall policy</h3>
<p>The policy must go <b>from</b> the LAN interface <b>to</b> the SD-WAN zone, and the zone must contain the member that is chosen. A policy that names <code>port1</code> as destination works only for traffic that uses port1, so half of the sessions are denied when the rule picks port2. Overlay traffic needs a policy to the overlay zone. Many engineers also forget the return direction for hub-originated sessions.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 10
        set name "LAN-to-Internet"
        set srcintf "port5"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
    edit 11
        set name "LAN-to-Hub"
        set srcintf "port5"
        set dstintf "overlay"
        set srcaddr "LAN-10.1.1.0"
        set dstaddr "HUB-LAN-10.0.0.0"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end</pre>
<p>The debug flow (chapter 5) is the proof tool for rungs 4 and 5 together. Two typical lines:</p>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
id=20085 trace_id=7 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-198.51.100.1 via port2"
id=20085 trace_id=7 func=fw_forward_handler line=811 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>The route exists and picks port2, but no policy covers port5 to port2: the signature of a policy written for a single member instead of the zone. If instead the trace says <code>no matching gateway</code> or <code>Denied by forward policy check</code> without a route line, the routing table is the problem. Note that <b>NAT</b> on the policy (for internet-bound traffic) is evaluated per outgoing interface, so the source address changes when the member changes; that is normal.</p>
<div class="warn"><p><b>Common mistake.</b> Adding a new member to the zone and forgetting the route and policy implications. A new member joins the zone policy automatically, but a gateway-less member, a missing route for the destination, or an interface-specific policy elsewhere (for example a VIP or local-in policy) does not follow.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-WAN rules do not add routes and do not bypass the routing table. The routing table decides which members are <b>possible</b>, the rule decides which one is <b>used</b>, and the policy decides whether it is <b>allowed</b>.</p></div>
<div class="scn"><h4>Half of the users, half of the time</h4><p>After SD-WAN went live, some users could browse and others could not, and the same user worked or failed depending on the minute. A firewall policy still pointed at port1 as destination. When the SD-WAN rule selected port2 the flow was denied. Changing the destination to the SD-WAN zone fixed all sessions.</p><p><b>Lesson:</b> Intermittent denies that follow the member are a zone-and-policy problem.</p></div>
<div class="iv"><p class="q">"Why can the SD-WAN rule not use a member that is alive and in SLA?"</p><p>Because the rule only chooses among interfaces that have a usable route for the destination. If the route to that destination through the member is missing or less preferred, it is not a candidate. I check the routing table and the database, the gateway of the member, and then the policy to the zone.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Rules choose among routes; they never create routes.</li><li>Equal distance and priority make members candidates (ECMP).</li><li>Routes and policies must point at the SD-WAN zone, not at a member.</li><li>routing-table all, details and database show active and hidden routes.</li><li>Flow trace shows route and policy decisions for one packet.</li></ul></div>
`,hi:`
<p>Rule sirf un members mein se chun sakta hai jinhe <b>routing table</b> reach kar sakta hai, aur chuna hua member tabhi traffic uthata hai jab koi <b>firewall policy</b> use permit kare. SD-WAN mein routes aur policies <b>zone</b> ko point karti hain, member interfaces ko nahi. Jo "SD-WAN kaam nahi karta" tickets measurement problems nahi hote, unme zyadatar missing routes ya missing policies hote hain.</p>
<h3>Rung 4: routing table</h3>
<p>SD-WAN rules routes nahi banate. Woh us traffic ke liye output interface chunte hain jiska route pehle se hai jo us interface ko <b>use kar sakta</b> hai. <code>sdwan-zone</code> wala static route us zone ke har member ke liye ek route entry install karta hai, isliye rule ke paas candidates hote hain. Overlay par seekhe dynamic routes (BGP ya OSPF, <b>fsd-routing</b> dekho) overlay members ko point karte hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
BR1-FGT # get router info routing-table all
BR1-FGT # get router info routing-table details 10.0.0.50
BR1-FGT # get router info routing-table database
BR1-FGT # get router info bgp summary</pre>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
BR1-FGT # get router info routing-table all
Routing table for VRF=0
S*      0.0.0.0/0 [1/0] via 203.0.113.1, port1, [1/0]
                  [1/0] via 198.51.100.1, port2, [1/0]
C       10.1.1.0/24 is directly connected, port5
B       10.0.0.0/24 [200/0] via 10.255.1.1 (recursive is directly connected, HUB1-ISP1), 00:12:44, [1/0]
                    [200/0] via 10.255.2.1 (recursive is directly connected, HUB1-ISP2), 00:12:44, [1/0]
C       10.255.1.2/32 is directly connected, HUB1-ISP1</pre>
<p>Teen cheezein padho. <b>Default route:</b> do equal entries (same distance 1) matlab dono ISPs candidates hain, do-member zone aisi hi dikhti hai. <b>Hub prefix:</b> <code>10.0.0.0/24</code> dono overlay tunnels se reachable hai, phir se equal, isliye SD-WAN rule decide karta hai. <b>Sirf best:</b> agar ek path ka distance zyada ya BGP preference kharab hai to woh active table mein aata hi nahi, aur rule ke paas chunne ko kuch nahi bachta. Hidden routes dekhne ke liye database view use karo.</p>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th></tr><tr><td>Zone ke through default route nahi</td><td>Static route abhi bhi interface naam use karta hai, <code>sdwan-zone</code> nahi; ya member gateway missing</td></tr><tr><td>Hub prefix ke liye sirf ek overlay next hop</td><td>Doosre tunnel par BGP ya OSPF down hai, ya local preference ya MED ek path ko prefer karta hai isliye doosra install nahi hua</td></tr><tr><td>Rule ek member chunta hai par traffic doosre se nikalta hai</td><td>Us destination ke liye candidate table mein nahi; route ke bina rule interface use nahi kar sakta</td></tr><tr><td>Hub prefix missing</td><td>Adjacency down, route filter ya route-map, ya tunnel inactive</td></tr><tr><td>Flow rule nahi, route follow karta hai</td><td>Rule ki destination se zyada specific route, ya SD-WAN ke upar policy route</td></tr></table>
<h3>ECMP aur route preference</h3>
<p><b>ECMP</b> (equal-cost multipath) ka matlab same prefix, distance aur priority wale kai routes table mein baithe hain. Implicit SD-WAN rule unme load-balance karta hai; explicit rules unme se chunte hain. Sirf <b>best</b> distance aur priority par tied routes candidates hain. Backup path ko jaan-boojhkar khel mein laane ke liye use same distance aur priority do aur rule ko steer karne do. Use pure fallback rakhne ke liye worse distance ya higher priority value do.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="diagram"><rect x="10" y="80" width="110" height="50" rx="10" fill="#bae6fd"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">Destination</text><text x="65" y="118" text-anchor="middle" class="svg-muted" font-size="11">10.0.0.50</text><rect x="170" y="20" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="270" y="45" text-anchor="middle" class="svg-ink" font-size="13">Route A: HUB1-ISP1, dist 200</text><rect x="170" y="85" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="270" y="110" text-anchor="middle" class="svg-ink" font-size="13">Route B: HUB1-ISP2, dist 200</text><rect x="170" y="150" width="200" height="40" rx="8" fill="#e2e8f0"/><text x="270" y="175" text-anchor="middle" class="svg-ink" font-size="13">Route C: LTE, dist 250 (hidden)</text><rect x="430" y="55" width="200" height="80" rx="10" fill="#bbf7d0"/><text x="530" y="82" text-anchor="middle" class="svg-ink" font-size="13">Candidates: A aur B</text><text x="530" y="102" text-anchor="middle" class="svg-muted" font-size="12">SD-WAN rule sirf A aur B ke</text><text x="530" y="119" text-anchor="middle" class="svg-muted" font-size="12">beech chunta hai</text><line x1="120" y1="105" x2="170" y2="40" stroke="#64748b" stroke-width="2"/><line x1="120" y1="105" x2="170" y2="105" stroke="#64748b" stroke-width="2"/><line x1="120" y1="105" x2="170" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/><line x1="370" y1="40" x2="430" y2="85" stroke="#64748b" stroke-width="2"/><line x1="370" y1="105" x2="430" y2="100" stroke="#64748b" stroke-width="2"/></svg><p class="cap">SD-WAN rule ke liye sirf best distance aur priority par tied routes candidates hain. LTE route hidden rehta hai.</p></div>
<h3>Rung 5: zone aur firewall policy</h3>
<p>Policy LAN interface <b>se</b> SD-WAN zone <b>tak</b> honi chahiye, aur zone mein woh member hona chahiye jo chuna gaya hai. Jo policy destination mein <code>port1</code> likhti hai woh sirf port1 use karne wale traffic ke liye chalti hai, isliye rule port2 chune to aadhe sessions deny hote hain. Overlay traffic ko overlay zone ki policy chahiye. Kai engineers hub se shuru hone wale sessions ki return direction bhi bhool jaate hain.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 10
        set name "LAN-to-Internet"
        set srcintf "port5"
        set dstintf "virtual-wan-link"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
    edit 11
        set name "LAN-to-Hub"
        set srcintf "port5"
        set dstintf "overlay"
        set srcaddr "LAN-10.1.1.0"
        set dstaddr "HUB-LAN-10.0.0.0"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end</pre>
<p>Debug flow (chapter 5) rung 4 aur 5 dono ka proof tool hai. Do typical lines:</p>
<pre class="out"><span class="c">! Illustrative output, not captured from a device</span>
id=20085 trace_id=7 func=vf_ip_route_input_common line=2605 msg="find a route: flag=04000000 gw-198.51.100.1 via port2"
id=20085 trace_id=7 func=fw_forward_handler line=811 msg="<span class="hl">Denied by forward policy check (policy 0)</span>"</pre>
<p>Route hai aur port2 chunta hai, lekin port5 se port2 ke liye koi policy nahi: yeh member ke liye likhi policy ki signature hai, zone ke liye nahi. Agar trace mein route line ke bina <code>no matching gateway</code> ya <code>Denied by forward policy check</code> aaye to routing table problem hai. Dhyan rakho ki policy par <b>NAT</b> (internet-bound traffic ke liye) outgoing interface ke hisaab se evaluate hota hai, isliye member badalne par source address badalta hai; yeh normal hai.</p>
<div class="warn"><p><b>Common galti.</b> Zone mein naya member add karke route aur policy ke implications bhool jaana. Naya member zone policy mein apne aap judta hai, lekin gateway-less member, destination ka missing route, ya kahin aur interface-specific policy (jaise VIP ya local-in policy) saath nahi chalti.</p></div>
<div class="exam"><p><b>Exam trap.</b> SD-WAN rules routes add nahi karte aur routing table ko bypass nahi karte. Routing table decide karta hai kaun se members <b>possible</b> hain, rule decide karta hai kaun sa <b>use</b> hoga, aur policy decide karti hai kya woh <b>allowed</b> hai.</p></div>
<div class="scn"><h4>Aadhe users, aadhe time</h4><p>SD-WAN live hone ke baad kuch users browse kar paate the aur kuch nahi, aur wahi user minute ke hisaab se chalta ya fail hota. Ek firewall policy abhi bhi destination mein port1 point karti thi. Jab SD-WAN rule port2 chunta flow deny ho jaata. Destination ko SD-WAN zone karne se saare sessions fix ho gaye.</p><p><b>Seekh:</b> Jo intermittent denies member ke saath chalte hain woh zone-and-policy problem hain.</p></div>
<div class="iv"><p class="q">"SD-WAN rule alive aur in-SLA member ko kyun use nahi kar sakta?"</p><p>Kyunki rule sirf un interfaces mein se chunta hai jinka us destination ke liye usable route hai. Agar member ke through us destination ka route missing ya kam preferred hai to woh candidate nahi. Main routing table aur database, member ka gateway, aur phir zone ki policy check karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Rules routes mein se chunte hain; routes kabhi nahi banate.</li><li>Equal distance aur priority members ko candidates banate hain (ECMP).</li><li>Routes aur policies SD-WAN zone ko point karni chahiye, member ko nahi.</li><li>routing-table all, details aur database active aur hidden routes dikhate hain.</li><li>Flow trace ek packet ke route aur policy decisions dikhata hai.</li></ul></div>
`}};export{e as default};