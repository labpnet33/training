var e={id:`static-routing`,h:{en:`Static routes, the default route and the routing table`,hi:`Static routes, default route aur routing table`},body:{en:`
<p>A FortiGate routes before it filters: the route lookup chooses the egress interface, and then the policy that matches that ingress and egress pair decides. With no route there is no egress and the packet is dropped. At a branch, one static default route toward the ISP is usually all the routing you need.</p>
<h3>A static route entry</h3>
<p>The default route in the lab:</p>
<pre class="code">NK-PUNE-FGT # config router static
NK-PUNE-FGT (static) # edit 1
new entry '1' added
NK-PUNE-FGT (1) # set gateway 203.0.113.1
NK-PUNE-FGT (1) # set device port1
NK-PUNE-FGT (1) # end
NK-PUNE-FGT # show router static</pre>
<pre class="out">config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
end</pre>
<p>The entry key (<code>1</code>) is just a sequence number. A route with no <code>dst</code> is the default route 0.0.0.0/0, so <code>show</code> hides the destination because it equals the default. <b>device</b> is the egress interface and <b>gateway</b> is the next hop, which must be inside the subnet of that interface.</p>
<h3>Reading the routing table</h3>
<pre class="code">NK-PUNE-FGT # get router info routing-table all</pre>
<pre class="out">Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       203.0.113.0/30 is directly connected, port1</pre>
<ul>
<li><code>S*</code> is a static route that is the candidate default. <code>C</code> is connected.</li>
<li><code>[10/0]</code> is <b>administrative distance</b> 10 and metric 0. <code>[1/0]</code> is <b>priority</b> 1 and weight 0.</li>
<li>Connected routes appear automatically when an interface has an address and is up. In the first lab you should end with exactly two.</li>
</ul>
<p>To see which route would be used for a destination, and to test the path from the firewall itself:</p>
<pre class="code">NK-PUNE-FGT # get router info routing-table details 8.8.8.8
NK-PUNE-FGT # execute traceroute 8.8.8.8</pre>
<pre class="out">Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1

traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  0.390 ms  0.360 ms  0.370 ms
 2  8.8.8.8  0.550 ms  0.520 ms  0.530 ms</pre>
<h3>Backup routes: distance and priority</h3>
<p>Two static routes to the same destination compete. The one with the lower <b>distance</b> goes into the routing table; the other waits as a <b>floating</b> backup and appears only if the first disappears (for example when its interface goes down). Equal distance routes can both enter the table, and <b>priority</b> breaks the tie. Here is a second ISP on port4 with distance 20. Real output shows the backup configured but not in the table:</p>
<pre class="out">NK-PUNE-FGT # show router static
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set gateway 198.51.100.1
        <span class="hl">set distance 20</span>
        set device "port4"
    next
end

NK-PUNE-FGT # get router info routing-table static
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lower distance wins; the other route waits"><rect x="10" y="55" width="120" height="60" rx="9" fill="#bbf7d0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.0/24</text><rect x="190" y="45" width="130" height="80" rx="9" fill="#fde68a"/><text x="255" y="82" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="255" y="99" text-anchor="middle" class="svg-muted" font-size="11">route lookup</text><line x1="130" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="65" x2="400" y2="40" stroke="#64748b" stroke-width="2"/><text x="360" y="38" text-anchor="middle" class="svg-accent" font-size="11">distance 10</text><line x1="320" y1="105" x2="400" y2="130" stroke="#64748b" stroke-width="2"/><text x="360" y="138" text-anchor="middle" class="svg-accent" font-size="11">distance 20</text><rect x="400" y="20" width="230" height="40" rx="9" fill="#bae6fd"/><text x="515" y="37" text-anchor="middle" class="svg-ink" font-size="13">ISP 1 via port1: in table</text><text x="515" y="54" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.1</text><rect x="400" y="110" width="230" height="40" rx="9" fill="#e2e8f0"/><text x="515" y="127" text-anchor="middle" class="svg-ink" font-size="13">ISP 2 via port4: floating backup</text><text x="515" y="144" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.1</text></svg><p class="cap">Lower distance wins; the other route waits</p></div>
<div class="eg"><p><b>Worked example.</b> Primary ISP link is port1 at distance 10, backup port4 at distance 20. If port1 loses link, its route leaves the table and the distance 20 route is installed, so traffic moves to the backup. When port1 recovers, the better route returns. Detecting a failure that does not drop the link needs link monitoring or SD-WAN, which later modules cover (nse4-routing and nse4-sdwan).</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting a gateway that is not in the subnet of the chosen device, or picking the wrong device. The route may be refused or the packet leaves a port where the gateway does not answer ARP. The gateway must be a neighbour on the chosen interface.</p></div>
<div class="exam"><p><b>Exam trap.</b> The default distance of a static route is <b>10</b>. Lower distance wins; priority only breaks ties between equal distances. A floating route is a static route with a higher distance.</p></div>
<div class="scn"><h4>Firewall pings fine, users do not</h4><p>A branch firewall could not ping the internet from its CLI, so the engineer suspected the policy. The routing table showed only connected routes and no S* line. The default route had been deleted by an automation script run the night before. Re-adding it restored both the firewall and the users in one minute.</p><p><b>Lesson:</b> when the firewall itself cannot reach out, check the route before the policy.</p></div>
<div class="iv"><p class="q">"A FortiGate has two default routes. Which one is used?"</p><p>The one with the lower administrative distance goes into the routing table and forwards traffic. If the distances are equal, both may be in the table and the lower priority is preferred. A route whose interface is down is removed from the table, which makes a higher-distance route a floating backup.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route lookup chooses the egress interface before policy.</li>
<li>A default route needs gateway and device; no dst means 0.0.0.0/0.</li>
<li>Read S*, C, [distance/metric] and [priority/weight].</li>
<li>Static default distance is 10; floating routes use a higher value.</li>
</ul></div>
`,hi:`
<p>FortiGate filter karne se pehle route karta hai: route lookup egress interface chunta hai, aur phir us ingress aur egress jodi se match karne wali policy faisla karti hai. Route na ho to egress nahi aur packet drop. Branch par ISP ki taraf ek static default route aam taur par kaafi hota hai.</p>
<h3>Static route entry</h3>
<p>Lab ka default route:</p>
<pre class="code">NK-PUNE-FGT # config router static
NK-PUNE-FGT (static) # edit 1
new entry '1' added
NK-PUNE-FGT (1) # set gateway 203.0.113.1
NK-PUNE-FGT (1) # set device port1
NK-PUNE-FGT (1) # end
NK-PUNE-FGT # show router static</pre>
<pre class="out">config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
end</pre>
<p>Entry key (<code>1</code>) sirf sequence number hai. <code>dst</code> ke bina route default route 0.0.0.0/0 hai, isliye <code>show</code> destination chhupa deta hai kyunki woh default ke barabar hai. <b>device</b> egress interface hai aur <b>gateway</b> next hop hai, jo us interface ke subnet ke andar hona chahiye.</p>
<h3>Routing table padhna</h3>
<pre class="code">NK-PUNE-FGT # get router info routing-table all</pre>
<pre class="out">Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       203.0.113.0/30 is directly connected, port1</pre>
<ul>
<li><code>S*</code> static route hai jo candidate default hai. <code>C</code> connected hai.</li>
<li><code>[10/0]</code> <b>administrative distance</b> 10 aur metric 0 hai. <code>[1/0]</code> <b>priority</b> 1 aur weight 0 hai.</li>
<li>Connected routes tab apne aap aate hain jab interface par address ho aur woh up ho. Pehle lab ke end mein aapke paas theek do hone chahiye.</li>
</ul>
<p>Kisi destination ke liye kaunsa route use hoga dekhne ke liye, aur firewall se hi path test karne ke liye:</p>
<pre class="code">NK-PUNE-FGT # get router info routing-table details 8.8.8.8
NK-PUNE-FGT # execute traceroute 8.8.8.8</pre>
<pre class="out">Routing table for VRF=0
Routing entry for 0.0.0.0/0
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1

traceroute to 8.8.8.8 (8.8.8.8), 32 hops max, 3 probe packets per hop, 84 byte packets
 1  203.0.113.1  0.390 ms  0.360 ms  0.370 ms
 2  8.8.8.8  0.550 ms  0.520 ms  0.530 ms</pre>
<h3>Backup routes: distance aur priority</h3>
<p>Same destination ke do static routes compete karte hain. Kam <b>distance</b> wala routing table mein jaata hai; doosra <b>floating</b> backup ki tarah intezaar karta hai aur tabhi aata hai jab pehla gayab ho (jaise uska interface down ho). Barabar distance wale dono routes table mein aa sakte hain, aur <b>priority</b> tie todti hai. Neeche port4 par doosra ISP distance 20 ke saath hai. Asli output backup ko configured dikhata hai par table mein nahi:</p>
<pre class="out">NK-PUNE-FGT # show router static
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set gateway 198.51.100.1
        <span class="hl">set distance 20</span>
        set device "port4"
    next
end

NK-PUNE-FGT # get router info routing-table static
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Kam distance jeetta hai; doosra route intezaar karta hai"><rect x="10" y="55" width="120" height="60" rx="9" fill="#bbf7d0"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="70" y="99" text-anchor="middle" class="svg-muted" font-size="11">10.0.1.0/24</text><rect x="190" y="45" width="130" height="80" rx="9" fill="#fde68a"/><text x="255" y="82" text-anchor="middle" class="svg-ink" font-size="13">FortiGate</text><text x="255" y="99" text-anchor="middle" class="svg-muted" font-size="11">route lookup</text><line x1="130" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="65" x2="400" y2="40" stroke="#64748b" stroke-width="2"/><text x="360" y="38" text-anchor="middle" class="svg-accent" font-size="11">distance 10</text><line x1="320" y1="105" x2="400" y2="130" stroke="#64748b" stroke-width="2"/><text x="360" y="138" text-anchor="middle" class="svg-accent" font-size="11">distance 20</text><rect x="400" y="20" width="230" height="40" rx="9" fill="#bae6fd"/><text x="515" y="37" text-anchor="middle" class="svg-ink" font-size="13">ISP 1 via port1: table mein</text><text x="515" y="54" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.1</text><rect x="400" y="110" width="230" height="40" rx="9" fill="#e2e8f0"/><text x="515" y="127" text-anchor="middle" class="svg-ink" font-size="13">ISP 2 via port4: floating backup</text><text x="515" y="144" text-anchor="middle" class="svg-muted" font-size="11">198.51.100.1</text></svg><p class="cap">Kam distance jeetta hai; doosra route intezaar karta hai</p></div>
<div class="eg"><p><b>Worked example.</b> Primary ISP link port1 par distance 10 hai, backup port4 distance 20. Agar port1 ka link chala gaya to uska route table se hat jaata hai aur distance 20 wala route install hota hai, isliye traffic backup par chala jaata hai. Port1 recover hone par behtar route wapas aa jaata hai. Aisi failure jo link drop nahi karti, use detect karne ke liye link monitoring ya SD-WAN chahiye, jo baad ke modules cover karte hain (nse4-routing aur nse4-sdwan).</p></div>
<div class="warn"><p><b>Common mistake.</b> Aisa gateway set karna jo chune hue device ke subnet mein nahi, ya galat device chunna. Route refuse ho sakta hai ya packet aise port se nikalta hai jahan gateway ARP ka jawab nahi deta. Gateway chune hue interface par neighbour hona chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static route ka default distance <b>10</b> hai. Kam distance jeetta hai; priority sirf barabar distances ke beech tie todti hai. Floating route woh static route hai jiska distance zyada hota hai.</p></div>
<div class="scn"><h4>Firewall ping karta hai, users nahi</h4><p>Ek branch firewall apne CLI se internet ko ping nahi kar paya, isliye engineer ne policy par shak kiya. Routing table mein sirf connected routes the aur S* line nahi thi. Default route ek raat pehle chali automation script se delete ho gayi thi. Use dobara add karne se ek minute mein firewall aur users dono wapas aa gaye.</p><p><b>Lesson:</b> firewall khud bahar nahi pahunchta to policy se pehle route check karo.</p></div>
<div class="iv"><p class="q">"FortiGate ke paas do default routes hain. Kaunsa use hota hai?"</p><p>Kam administrative distance wala routing table mein jaata hai aur traffic forward karta hai. Distances barabar hon to dono table mein ho sakte hain aur kam priority ko prefer kiya jaata hai. Jis route ka interface down ho woh table se hat jaata hai, jisse zyada-distance wala route floating backup ban jaata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route lookup policy se pehle egress interface chunta hai.</li>
<li>Default route ko gateway aur device chahiye; dst nahi matlab 0.0.0.0/0.</li>
<li>S*, C, [distance/metric] aur [priority/weight] padhna seekho.</li>
<li>Static default distance 10 hai; floating routes zyada value use karte hain.</li>
</ul></div>
`}};export{e as default};