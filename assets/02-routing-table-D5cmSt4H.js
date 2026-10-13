var e={id:`routing-table`,h:{en:`The routing table: reading entries, distance and longest prefix match`,hi:`Routing table: entries padhna, distance aur longest prefix match`},body:{en:`
<p>A routing table is the FortiGate's road map. Each entry says: "to reach this <b>prefix</b>, send the packet to this <b>next hop</b> through this <b>interface</b>". Entries come from three places: <b>connected</b> networks (an interface has an IP address in them), <b>static</b> routes that you type, and <b>dynamic</b> routes learned from OSPF or BGP (later modules). The table you see with <code>get router info routing-table all</code> lists the routes that are active right now.</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       V - BGP VPNv4
       * - candidate default

Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1</pre>
<h3>Reading one line</h3>
<ul><li><code>S*</code>: the source code. C connected, S static, B BGP, O OSPF, R RIP, i IS-IS, K kernel. The star marks a <b>candidate default</b> route (0.0.0.0/0).</li><li><code>0.0.0.0/0</code>: the destination prefix. /0 matches every address.</li><li><code>[10/0]</code>: <b>administrative distance</b> 10 and <b>metric</b> 0. Distance says how much you trust the source of the route; lower is better.</li><li><code>via 203.0.113.1, port1</code>: the next-hop router and the egress interface.</li><li><code>[1/0]</code> at the end: the priority and weight of a static route (default priority 1).</li></ul>
<p>The routes marked <code>C</code> appear on their own as soon as an interface is up and has an address. If an interface goes down, its connected route and every static route that uses it disappear from the table. Remember this: it is exactly how failover works in chapter 5.</p>
<h3>How the FortiGate picks one route</h3>
<ol><li><b>Longest prefix match.</b> The most specific route that contains the destination wins, whatever its distance. A /24 beats a /0.</li><li><b>Lowest administrative distance</b> among routes to the same prefix.</li><li><b>Priority</b> (static routes) or <b>metric</b> (dynamic routes) as the tie-break.</li><li>Still tied: the routes are used together (<b>ECMP</b>, chapter 6).</li></ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Destination 172.16.5.10: which entry matches?</text><rect x="20" y="40" width="600" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">0.0.0.0/0   matches everything (length 0)</text><rect x="20" y="92" width="600" height="40" rx="10" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="13">172.16.5.0/24   matches (length 24) - WINS</text><rect x="20" y="144" width="600" height="40" rx="10" fill="#fde68a"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">10.0.99.0/30   does not contain 172.16.5.10</text></svg><p class="cap">Longest prefix match: the /24 beats the default route even though both are static with the same distance.</p></div>
<table class="cmp"><tr><th>Source</th><th>Default distance</th></tr><tr><td>Connected</td><td>0</td></tr><tr><td>Static</td><td>10</td></tr><tr><td>eBGP</td><td>20</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>RIP</td><td>120</td></tr><tr><td>iBGP</td><td>200</td></tr></table>
<h3>Asking about one destination</h3>
<p><code>get router info routing-table details &lt;ip&gt;</code> answers "what will the FortiGate do with this address?". Here is the warehouse firewall before the fix of the first lab. The address 172.16.5.10 matches only the default route, so it would be sent to the internet.</p>
<pre class="out">NK-WH-FGT # get router info routing-table details 172.16.5.10
Routing table for VRF=0
<span class="hl">Routing entry for 0.0.0.0/0</span>
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1</pre>
<p>After a static route for 172.16.5.0/24 is added, the same question gives a different answer:</p>
<pre class="out">NK-WH-FGT # get router info routing-table details 172.16.5.10
Routing table for VRF=0
<span class="hl">Routing entry for 172.16.5.0/24</span>
  Known via "static", distance 10, metric 0, best
  * vrf 0 10.0.99.2, via port3</pre>
<div class="note"><p><b>Note.</b> On a real FortiGate <code>get router info routing-table database</code> also lists routes that lost the selection or are inactive, and <code>get router info kernel</code> shows the forwarding table. The simulator supports <code>all</code>, <code>details</code>, <code>static</code> and <code>connected</code>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Looking only at the default route. A more specific route to the same destination silently overrides it, so always check the destination with <code>details</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> Longest prefix match is applied before distance. A /24 OSPF route (distance 110) beats a /16 static route (distance 10) for an address in the /24.</p></div>
<div class="scn"><h4>The branch that went out of the wrong door</h4><p>Traffic from the warehouse reached a partner site over the internet instead of through the private link. The engineer ran <code>details</code> for the partner address and found the default route; the /24 route for the partner network had been deleted during a clean-up. Re-adding the route moved the traffic back to the private link at once.</p><p><b>Lesson:</b> <code>details &lt;ip&gt;</code> shows the winning route for one address in a single command.</p></div>
<div class="iv"><p class="q">"Two routes match a destination. How does a FortiGate choose?"</p><p>First the longest prefix. If the prefix length is equal, the lowest administrative distance. If distance is equal, the priority of static routes or the metric of dynamic routes. If everything is equal, both are used (ECMP). Give the numbers: connected 0, static 10, eBGP 20, OSPF 110.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Every line shows source code, prefix, [distance/metric], next hop and interface.</li><li>Longest prefix wins first, then distance, then priority or metric.</li><li>Default distances: connected 0, static 10, eBGP 20, OSPF 110, iBGP 200.</li><li><code>details &lt;ip&gt;</code> shows which entry a given address will use.</li><li>A route disappears when its interface goes down.</li></ul></div>
`,hi:`
<p>Routing table FortiGate ka road map hai. Har entry kehti hai: "is <b>prefix</b> tak pahunchne ke liye packet ko is <b>next hop</b> ko is <b>interface</b> se bhejo". Entries teen jagah se aati hain: <b>connected</b> networks (interface ka IP unmein hai), <b>static</b> routes jo aap type karte ho, aur OSPF ya BGP se seekhe <b>dynamic</b> routes (agle modules). <code>get router info routing-table all</code> se jo table dikhta hai usmein woh routes hote hain jo abhi active hain.</p>
<pre class="out">NK-PUNE-FGT # get router info routing-table all
Codes: K - kernel, C - connected, S - static, R - RIP, B - BGP
       O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       V - BGP VPNv4
       * - candidate default

Routing table for VRF=0
<span class="hl">S*      0.0.0.0/0 [10/0] via 203.0.113.1, port1, [1/0</span>]
C       10.0.1.0/24 is directly connected, port2
C       198.51.100.0/30 is directly connected, port4
C       203.0.113.0/30 is directly connected, port1</pre>
<h3>Ek line ko padhna</h3>
<ul><li><code>S*</code>: source code. C connected, S static, B BGP, O OSPF, R RIP, i IS-IS, K kernel. Star <b>candidate default</b> route (0.0.0.0/0) dikhata hai.</li><li><code>0.0.0.0/0</code>: destination prefix. /0 har address se match karta hai.</li><li><code>[10/0]</code>: <b>administrative distance</b> 10 aur <b>metric</b> 0. Distance batata hai ki route ke source par kitna bharosa hai; kam behtar hai.</li><li><code>via 203.0.113.1, port1</code>: next-hop router aur egress interface.</li><li>End ka <code>[1/0]</code>: static route ki priority aur weight (default priority 1).</li></ul>
<p><code>C</code> wale routes tabhi apne aap aa jaate hain jab interface up ho aur uska address ho. Interface down ho jaaye to uska connected route aur usse jude saare static routes table se hat jaate hain. Yeh yaad rakho: chapter 5 mein failover isi tarah kaam karta hai.</p>
<h3>FortiGate ek route kaise chunta hai</h3>
<ol><li><b>Longest prefix match.</b> Jo sabse specific route destination ko cover kare woh jeetta hai, chahe uski distance kuch bhi ho. /24, /0 ko harata hai.</li><li>Same prefix ke routes mein <b>sabse kam administrative distance</b>.</li><li>Tie-break ke liye <b>priority</b> (static routes) ya <b>metric</b> (dynamic routes).</li><li>Phir bhi barabar: routes saath mein use hote hain (<b>ECMP</b>, chapter 6).</li></ol>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="diagram"><text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="13">Destination 172.16.5.10: kaun si entry match hoti hai?</text><rect x="20" y="40" width="600" height="40" rx="10" fill="#e2e8f0"/><text x="320" y="65" text-anchor="middle" class="svg-ink" font-size="13">0.0.0.0/0   sab se match (length 0)</text><rect x="20" y="92" width="600" height="40" rx="10" fill="#bbf7d0"/><text x="320" y="117" text-anchor="middle" class="svg-ink" font-size="13">172.16.5.0/24   match (length 24) - JEETTA HAI</text><rect x="20" y="144" width="600" height="40" rx="10" fill="#fde68a"/><text x="320" y="169" text-anchor="middle" class="svg-ink" font-size="13">10.0.99.0/30   mein 172.16.5.10 nahi hai</text></svg><p class="cap">Longest prefix match: /24, default route ko harata hai, chahe dono static hon aur distance same ho.</p></div>
<table class="cmp"><tr><th>Source</th><th>Default distance</th></tr><tr><td>Connected</td><td>0</td></tr><tr><td>Static</td><td>10</td></tr><tr><td>eBGP</td><td>20</td></tr><tr><td>OSPF</td><td>110</td></tr><tr><td>RIP</td><td>120</td></tr><tr><td>iBGP</td><td>200</td></tr></table>
<h3>Ek destination ke baare mein poochna</h3>
<p><code>get router info routing-table details &lt;ip&gt;</code> jawab deta hai "is address ka FortiGate kya karega?". Yeh pehle lab ke fix se pehle ka warehouse firewall hai. Address 172.16.5.10 sirf default route se match hota hai, isliye woh internet ki taraf bheja jaata.</p>
<pre class="out">NK-WH-FGT # get router info routing-table details 172.16.5.10
Routing table for VRF=0
<span class="hl">Routing entry for 0.0.0.0/0</span>
  Known via "static", distance 10, metric 0, candidate default, best
  * vrf 0 203.0.113.1, via port1</pre>
<p>172.16.5.0/24 ka static route add karne ke baad wahi sawaal alag jawab deta hai:</p>
<pre class="out">NK-WH-FGT # get router info routing-table details 172.16.5.10
Routing table for VRF=0
<span class="hl">Routing entry for 172.16.5.0/24</span>
  Known via "static", distance 10, metric 0, best
  * vrf 0 10.0.99.2, via port3</pre>
<div class="note"><p><b>Note.</b> Real FortiGate par <code>get router info routing-table database</code> un routes ko bhi dikhata hai jo selection haar gaye ya inactive hain, aur <code>get router info kernel</code> forwarding table dikhata hai. Simulator <code>all</code>, <code>details</code>, <code>static</code> aur <code>connected</code> support karta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Sirf default route dekhna. Same destination ka koi zyada specific route use chupchaap override kar deta hai, isliye destination ko hamesha <code>details</code> se check karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Longest prefix match distance se pehle lagta hai. /24 ka OSPF route (distance 110), /24 ke address ke liye /16 ke static route (distance 10) ko harata hai.</p></div>
<div class="scn"><h4>Branch jo galat darwaze se nikla</h4><p>Warehouse ka traffic partner site tak private link ki jagah internet se pahunch raha tha. Engineer ne partner address ke liye <code>details</code> chalaya to default route mila; partner network ka /24 route clean-up mein delete ho gaya tha. Route wapas add karte hi traffic turant private link par laut aaya.</p><p><b>Seekh:</b> <code>details &lt;ip&gt;</code> ek hi command mein ek address ka winning route dikha deta hai.</p></div>
<div class="iv"><p class="q">"Ek destination ke liye do routes match karte hain. FortiGate kaise chunta hai?"</p><p>Pehle longest prefix. Prefix length barabar ho to sabse kam administrative distance. Distance barabar ho to static routes ki priority ya dynamic routes ka metric. Sab barabar ho to dono use hote hain (ECMP). Numbers batao: connected 0, static 10, eBGP 20, OSPF 110.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Har line source code, prefix, [distance/metric], next hop aur interface dikhati hai.</li><li>Pehle longest prefix jeetta hai, phir distance, phir priority ya metric.</li><li>Default distances: connected 0, static 10, eBGP 20, OSPF 110, iBGP 200.</li><li><code>details &lt;ip&gt;</code> dikhata hai ki diya gaya address kaun si entry use karega.</li><li>Interface down hone par route gayab ho jaata hai.</li></ul></div>
`}};export{e as default};